// V18.306-Verifikation: DER RING ATMET IN BEIDE RICHTUNGEN. (A) Kopfraum → der Ring
// WÄCHST monoton zum Ziel. (B) anhaltend über Budget → der Ring SCHRUMPFT wieder zur
// haltbaren Größe (Fern-Schale zurückgegeben), nie unter RING_RAMP_START. So settled die
// Welt bei der Größe, die die Hardware hält — kein Overshoot-auf-81-und-festklemmen.
const puppeteer = require("puppeteer"),
    http = require("http"),
    fs = require("fs"),
    path = require("path");
const PORT = Number(process.env.DIAG_PORT) || 4378,
    root = path.resolve(__dirname, "..");
const mime = {
    ".html": "text/html",
    ".js": "application/javascript",
    ".wasm": "application/wasm",
    ".json": "application/json",
    ".woff2": "font/woff2",
    ".css": "text/css",
    ".png": "image/png",
};
const server = http.createServer((q, s) => {
    let p = q.url.split("?")[0];
    if (p === "/") p = "/index.html";
    const fp = path.join(root, p);
    if (!fp.startsWith(root)) {
        s.statusCode = 403;
        return s.end();
    }
    fs.readFile(fp, (e, d) => {
        if (e) {
            s.statusCode = 404;
            return s.end();
        }
        s.setHeader("Content-Type", mime[path.extname(fp)] || "application/octet-stream");
        s.end(d);
    });
});
(async () => {
    await new Promise((r) => server.listen(PORT, r));
    const browser = await puppeteer.launch({
        headless: true,
        protocolTimeout: 360000,
        args: [
            "--use-angle=swiftshader",
            "--enable-unsafe-swiftshader",
            "--enable-webgl",
            "--ignore-gpu-blocklist",
            "--no-sandbox",
            "--disable-setuid-sandbox",
            "--autoplay-policy=no-user-gesture-required",
        ],
    });
    const page = await browser.newPage();
    page.setDefaultTimeout(340000);
    page.on("pageerror", (e) => console.log("[PAGE-ERROR]", (e.stack || e.message).split("\n")[0]));
    await page.goto(`http://127.0.0.1:${PORT}/index.html`, { waitUntil: "domcontentloaded", timeout: 30000 });
    await page.evaluate(async () => {
        let stubbed = false;
        const start = performance.now();
        let last = -1,
            stable = 0;
        while (performance.now() - start < 120000) {
            const r = window.anazhRealm;
            if (r && !stubbed && r.state && r.state.renderer) {
                r.state.renderer.render = function () {};
                if (typeof r.state.renderer.renderAsync === "function")
                    r.state.renderer.renderAsync = () => Promise.resolve();
                r.state.postProcessingFailed = true;
                stubbed = true;
            }
            if (r && typeof r._gameLoopTick === "function") {
                try {
                    r._gameLoopTick(performance.now());
                } catch (_e) {}
                const sz = r.state && r.state.voxelChunks ? r.state.voxelChunks.size : 0;
                if (sz === last) stable++;
                else {
                    stable = 0;
                    last = sz;
                }
                if (sz > 40 && stable > 60) break;
            }
            await new Promise((res) => setTimeout(res, 4));
        }
    });
    // den echten Ramp-Pfad aktivieren (Null-Sprung aus)
    await page.evaluate(() => {
        const s = window.anazhRealm.state;
        if (s.renderer) s.renderer._isHeadlessNull = false;
    });

    // helper: ERZWINGE einen Budget-Zustand + fahre den Aktuator DIREKT (umgeht den Fold,
    // der sonst die reale 200-ms-Sleep-Zeit als 200-ms-Frame-Spike einspeist und meine
    // V18.318-Wachs-Hysterese fälschlich zurücksetzt). Die Ring-Hysterese liest
    // `performance.now()` → die echten 200-ms-Sleeps unten treiben die Sustain-Timer korrekt.
    const drive = async (over, steps) => {
        const traj = [];
        for (let i = 0; i < steps; i++) {
            await page.evaluate((isOver) => {
                const r = window.anazhRealm,
                    s = r.state;
                if (!s.perfSense) return;
                s.perfSense.frameMs = isOver ? 40 : 5; // über Decke (40 > throttle) / klarer Kopfraum (5 < grow)
                s._frameOverBudget = isOver;
                try {
                    r._nexusPerfActuate(s.perfSense);
                } catch (_e) {}
            }, over);
            const snap = await page.evaluate(() => {
                const s = window.anazhRealm.state;
                return { active: s._activeRingRadius, chunks: s.voxelChunks ? s.voxelChunks.size : 0 };
            });
            traj.push(snap);
            await new Promise((res) => setTimeout(res, 200)); // Atem (SETTLE/SUSTAIN brauchen Real-Zeit)
        }
        return traj;
    };

    const target = await page.evaluate(() => window.anazhRealm.state.chunkRingRadius);
    // (A) Start sauber am BODEN → anhaltender Kopfraum soll bis zum Ziel WACHSEN
    await page.evaluate(() => {
        const s = window.anazhRealm.state;
        s._activeRingRadius = window.anazhRealm.constructor.RING_RAMP_START;
        s._ringRampLast = 0;
        s._ringOverBudgetSince = 0;
        s._ringHeadroomSince = 0;
    });
    const grow = await drive(false, 24); // Kopfraum → wachsen (24×200 ms = 4,8 s > 2× GROW_SUSTAIN)
    // (B) Start am ZIEL → anhaltende Überlast soll SCHRUMPFEN (die Fern-Schale zurückgeben)
    await page.evaluate(() => {
        const s = window.anazhRealm.state;
        s._activeRingRadius = s.chunkRingRadius;
        s._ringRampLast = 0;
        s._ringOverBudgetSince = 0;
        s._ringHeadroomSince = 0;
    });
    const shrink = await drive(true, 24); // anhaltend über Budget → schrumpfen

    const growStart = grow[0].active,
        growEnd = grow[grow.length - 1].active;
    const shrinkStart = shrink[0].active,
        shrinkEnd = shrink[shrink.length - 1].active;
    let growMono = true,
        p = -1;
    for (const s of grow) {
        if (s.active < p) growMono = false;
        p = s.active;
    }
    let shrinkMono = true;
    p = 99;
    for (const s of shrink) {
        if (s.active > p) shrinkMono = false;
        p = s.active;
    }
    const floor = await page.evaluate(() => window.anazhRealm.constructor.RING_RAMP_START);

    console.log("\n===== V18.306 DER RING ATMET IN BEIDE RICHTUNGEN =====");
    console.log(`  Ziel-Ring=${target} · Boden=${floor}`);
    console.log(
        `  (A) KOPFRAUM:   ${growStart} → ${growEnd}   monoton-wachsend=${growMono}  ${growEnd >= target ? "✓ erreicht Ziel" : growEnd > growStart ? "✓ wächst" : "⚠ wuchs nicht"}`
    );
    console.log(`      Trajektorie: ${grow.map((s) => s.active).join(" ")}`);
    console.log(
        `  (B) ÜBER BUDGET: ${shrinkStart} → ${shrinkEnd}   monoton-schrumpfend=${shrinkMono}  ${shrinkEnd < shrinkStart ? "✓ schrumpft" : "⚠ schrumpfte nicht"}  ${shrinkEnd >= floor ? "✓ ≥ Boden" : "⚠ unter Boden!"}`
    );
    console.log(
        `      Trajektorie: ${shrink.map((s) => s.active).join(" ")} · chunks ${shrink[0].chunks}→${shrink[shrink.length - 1].chunks}`
    );
    const ok = growEnd > growStart && shrinkEnd < shrinkStart && shrinkEnd >= floor;
    console.log(
        ok
            ? "\n  ✓ BEWIESEN: der Ring wächst in Kopfraum + gibt unter Dauerlast Schalen zurück (settled bei haltbarer Größe)."
            : "\n  ⚠ prüfen."
    );
    console.log("=====================================================");
    await browser.close();
    server.close();
    process.exit(0);
})();
