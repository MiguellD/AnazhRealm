// RING-vs-WIESE (Schöpfer: „die Wiese noch nicht geladen, aber der Chunk geht schon
// nach aussen?"). READ-ONLY. Traced den Boot mit echtem Renderer-Pfad und fragt bei
// JEDEM Ring-Wachstums-Schritt: war das GRAS/LAUB (pendingScatter/pendingFoliageChunks)
// der inneren Chunks da noch UNGELADEN? Wenn ja, wächst der Ring nach aussen, bevor er
// „sauber ausgeschmückt" ist — genau der Schöpfer-Befund. Keine Änderung am Spiel.
const puppeteer = require("puppeteer"),
    http = require("http"),
    fs = require("fs"),
    path = require("path");
const PORT = Number(process.env.DIAG_PORT) || 4380,
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
    // SOFORT ab Loop-Start messen (echter Ramp-Pfad, render nur gestubbt)
    await page.evaluate(async () => {
        const start = performance.now();
        while (performance.now() - start < 60000) {
            const r = window.anazhRealm;
            if (r && r.state && r.state.renderer && typeof r._gameLoopTick === "function") {
                if (r.state.renderer.render) r.state.renderer.render = function () {};
                if (typeof r.state.renderer.renderAsync === "function")
                    r.state.renderer.renderAsync = () => Promise.resolve();
                return;
            }
            await new Promise((res) => setTimeout(res, 10));
        }
    });
    const trace = [];
    const t0 = Date.now();
    for (let i = 0; i < 90; i++) {
        const snap = await page.evaluate(() => {
            const r = window.anazhRealm,
                s = r.state;
            // Frame-Kopfraum ERZWINGEN, damit der Ring wie auf schneller HW wächst (sonst
            // hängt swiftshader am Boden) — die Grow-Gate-LOGIK selbst bleibt unberührt; wir
            // beobachten nur, ob sie auf das Gras wartet. Spieler fix (kein Lauf-Streaming).
            for (let k = 0; k < 6; k++) {
                try {
                    r._gameLoopTick(performance.now());
                } catch (_e) {}
                if (s.perfSense) s.perfSense.frameMs = 5;
                s._frameOverBudget = false;
            }
            return {
                active: s._activeRingRadius,
                chunks: s.voxelChunks ? s.voxelChunks.size : 0,
                terrainPending: s.voxelMeshPending ? s.voxelMeshPending.size : 0,
                scatterPending: s.pendingScatter ? s.pendingScatter.size : 0,
                foliagePending: s.pendingFoliageChunks ? s.pendingFoliageChunks.size : 0,
            };
        });
        snap.ms = Date.now() - t0;
        trace.push(snap);
        await new Promise((res) => setTimeout(res, 150));
    }

    // Ring-Wachstums-Schritte finden + den GRAS/LAUB-Rückstand AM Schritt prüfen
    console.log("\n===== RING-vs-WIESE: wächst der Ring, bevor das Gras geladen ist? =====");
    console.log("  ms     ring  chunks  terrainPending  scatterPending  foliagePending");
    let prevRing = trace[0].active,
        grewWhileFoliageOpen = 0,
        growthSteps = 0;
    for (const s of trace) {
        const grew = s.active > prevRing;
        const foliageOpen = (s.scatterPending || 0) + (s.foliagePending || 0) > 0;
        if (grew) {
            growthSteps++;
            if (foliageOpen) grewWhileFoliageOpen++;
            console.log(
                `  ${String(s.ms).padStart(5)}  ${String(s.active).padStart(3)} →   ${String(s.chunks).padStart(4)}      ${String(s.terrainPending).padStart(5)}          ${String(s.scatterPending).padStart(5)}          ${String(s.foliagePending).padStart(5)}    ${foliageOpen ? "← RING WÄCHST, GRAS NOCH OFFEN" : ""}`
            );
        }
        prevRing = s.active;
    }
    const end = trace[trace.length - 1];
    console.log(
        `\n  Ring-Wachstums-Schritte: ${growthSteps} · davon mit NOCH OFFENEM Gras/Laub: ${grewWhileFoliageOpen}`
    );
    console.log(
        `  Endzustand: ring ${end.active}, chunks ${end.chunks}, scatterPending ${end.scatterPending}, foliagePending ${end.foliagePending}`
    );
    if (grewWhileFoliageOpen > 0)
        console.log(
            `\n  ⚠ BESTÄTIGT (Schöpfer-Befund): der Ring wuchs ${grewWhileFoliageOpen}× nach AUSSEN, während das nahe\n    Gras/Laub noch UNGELADEN war → das Gate wartet nur auf das TERRAIN-Mesh, nicht auf die WIESE.`
        );
    else console.log(`\n  ✓ der Ring wuchs nie, während Gras/Laub offen war (in diesem Lauf).`);
    console.log("=======================================================================");
    await browser.close();
    server.close();
    process.exit(0);
})();
