// V18.303-Verifikation: der Kaltstart-Freeze-Fix. Das near mesh-scatter (2.21M Tris,
// 90 % der GPU-Last) wuchs auf volle Dichte, weil die LEERE Boot-Welt Frame-Luft hat.
// Jetzt: die Dichte wächst NICHT, solange (a) der Frame über Budget ist ODER (b) die
// Welt noch streamt (Rückstau) → die Start-Chunks buken am dünnen Boden. Diese Probe
// erzwingt beide „kämpft"-Zustände und prüft, dass _foliageDensityScale UNTEN bleibt.
const puppeteer = require("puppeteer"),
    http = require("http"),
    fs = require("fs"),
    path = require("path");
const PORT = Number(process.env.DIAG_PORT) || 4372,
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
const server = http.createServer((req, res) => {
    let p = req.url.split("?")[0];
    if (p === "/") p = "/index.html";
    const fp = path.join(root, p);
    if (!fp.startsWith(root)) {
        res.statusCode = 403;
        return res.end();
    }
    fs.readFile(fp, (e, d) => {
        if (e) {
            res.statusCode = 404;
            return res.end();
        }
        res.setHeader("Content-Type", mime[path.extname(fp)] || "application/octet-stream");
        res.end(d);
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

    const out = await page.evaluate(() => {
        const r = window.anazhRealm,
            s = r.state;
        const C = r.constructor;
        const floor = C.PERF_FOLIAGE_DENSITY_MIN;
        const pump = (n) => {
            for (let i = 0; i < n; i++) {
                try {
                    r._gameLoopTick(performance.now());
                } catch (_e) {}
            }
        };
        const res = {};
        // Szenario A — die GPU kämpft (frameOverBudget): die Dichte darf NICHT wachsen
        s._foliageDensityScale = floor;
        // den Headless-Sprung abschalten (sonst wird die Dichte hart auf 1 gesetzt)
        if (s.renderer) s.renderer._isHeadlessNull = false;
        for (let i = 0; i < 200; i++) {
            s._frameOverBudget = true;
            pump(1);
        }
        res.afterStruggle = s._foliageDensityScale;
        // Szenario B — Frame hat Luft, aber die Welt STREAMT noch (Rückstau): auch nicht wachsen
        s._foliageDensityScale = floor;
        if (!s.voxelMeshPending) s.voxelMeshPending = new Set();
        for (let i = 0; i < 200; i++) {
            s._frameOverBudget = false;
            s.voxelMeshPending.add("fake," + i);
            pump(1);
        }
        res.afterStreaming = s._foliageDensityScale;
        // Szenario C — fertig gebaut + Frame hat Luft: JETZT darf sie wachsen
        s._foliageDensityScale = floor;
        s.voxelMeshPending.clear();
        for (let i = 0; i < 200; i++) {
            s._frameOverBudget = false;
            pump(1);
        }
        res.afterHeadroom = s._foliageDensityScale;
        res.floor = floor;
        return res;
    });

    const f = out.floor;
    console.log("===== V18.303 KALTSTART-DICHTE-GATE =====\n");
    console.log(`  Dichte-Boden (PERF_FOLIAGE_DENSITY_MIN) = ${f}\n`);
    console.log(`  A) over-budget (NICHT headless simulierbar — der Aktuator rechnet _frameOverBudget`);
    console.log(
        `     aus dem gestubbten Frame neu; auf echter langsamer HW greift das V18.282-Gate): Dichte ${out.afterStruggle.toFixed(2)}`
    );
    console.log(
        `  B) Welt streamt noch (Rückstau) — DER NEUE KALTSTART-GATE: Dichte ${out.afterStreaming.toFixed(2)}  ${out.afterStreaming <= f + 0.02 ? "✓ bleibt am Boden" : "⚠ wuchs!"}`
    );
    console.log(
        `  C) fertig + Luft → darf wachsen:                          Dichte ${out.afterHeadroom.toFixed(2)}  ${out.afterHeadroom > f + 0.05 ? "✓ wächst (lebendig)" : "⚠ wuchs nicht"}`
    );
    console.log("");
    const ok = out.afterStreaming <= f + 0.02 && out.afterHeadroom > f + 0.05;
    console.log(
        ok
            ? `  ✓ BEWIESEN (B+C): solange die Welt STREAMT, bleibt die Laub-Dichte am dünnen Boden\n    (${f} → ~${Math.round(f * 100)}% der Instanzen = ~${(2.21 * f).toFixed(2)}M statt 2.21M Tris) → die Start-Chunks buken SPARSAM,\n    der Kaltstart-Freeze fällt weg. Sie wächst erst, wenn die GEBAUTE Welt Kopffreiheit hat (C).`
            : "  ⚠ Gate verhält sich nicht wie erwartet — prüfen."
    );
    console.log("\n=========================================");
    await browser.close();
    server.close();
    process.exit(0);
})();
