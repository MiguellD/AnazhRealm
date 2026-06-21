// Periodischer-Spike-Detektor: misst die per-Frame-Tick-Zeit über ~25 echte
// Sekunden und wrappt die PERIODISCHEN Operationen (Auto-Save/Snapshot · Foliage-
// Thin/Streaming · Wasser-CA/Iso · BVH · SelfAnalysis) → findet, WAS alle paar
// Sekunden die Leistung schluckt (der Schöpfer-Befund „ruckelt alle paar Sekunden").
const puppeteer = require("puppeteer"),
    http = require("http"),
    fs = require("fs"),
    path = require("path");
const PORT = Number(process.env.DIAG_PORT) || 4374,
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
            "--js-flags=--expose-gc",
            "--autoplay-policy=no-user-gesture-required",
        ],
    });
    const page = await browser.newPage();
    page.setDefaultTimeout(340000);
    page.on("pageerror", (e) => console.log("[PAGE-ERROR]", (e.stack || e.message).split("\n")[0]));
    await page.goto(`http://127.0.0.1:${PORT}/index.html`, { waitUntil: "domcontentloaded", timeout: 30000 });
    // Warmup (render-gestubbt) bis die Welt steht
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

    // Phasen wrappen + ~25 s echte Zeit laufen, jeden Frame messen
    await page.evaluate(() => {
        const r = window.anazhRealm;
        const proto = r.constructor.prototype;
        window.__phase = {};
        window.__cur = null;
        const NAMES = [
            "saveState",
            "buildStateSnapshot",
            "_tickScatterStreaming",
            "_tickFoliageThin",
            "_tickFoliageGrowth",
            "_tickPendingScatter",
            "_buildVoxelChunkScatter",
            "_pumpVoxelChunkBVH",
            "_tickPendingWaterIso",
            "_tickWorldWaterCA",
            "_loopSelfAnalysis",
            "selfAwarenessAnalyze",
            "_tickScatterRegrow",
            "_ensureHydroTilesAround",
            "_loopRender",
            "_loopVoxelStreaming",
            "_loopPhysicsSync",
            "tickArchitectureCulling",
            "_tickDekoFernfeld",
        ];
        for (const n of NAMES) {
            const orig = proto[n];
            if (typeof orig !== "function") continue;
            window.__phase[n] = 0;
            proto[n] = function (...a) {
                const t = performance.now();
                const res = orig.apply(this, a);
                const dt = performance.now() - t;
                if (window.__cur) window.__cur[n] = (window.__cur[n] || 0) + dt;
                return res;
            };
        }
    });
    const series = await page.evaluate(async () => {
        const r = window.anazhRealm;
        const frames = [];
        const start = performance.now();
        while (performance.now() - start < 25000) {
            window.__cur = {};
            const t = performance.now();
            try {
                r._gameLoopTick(performance.now());
            } catch (_e) {}
            const dt = performance.now() - t;
            window.__cur._tick = dt;
            frames.push(window.__cur);
            // kleiner Yield, damit echte Zeit vergeht (die 10-s-Intervalle feuern)
            await new Promise((res) => setTimeout(res, 3));
        }
        return frames;
    });

    // Auswertung: Median-Tick + die Spike-Frames (> 4× Median) + was sie dominiert
    const ticks = series.map((f) => f._tick).sort((a, b) => a - b);
    const median = ticks[Math.floor(ticks.length / 2)];
    const spikeThresh = Math.max(median * 4, median + 15);
    const spikes = series.filter((f) => f._tick > spikeThresh);
    // Pro Phase: Gesamtzeit + max-in-einem-Frame
    const totals = {};
    for (const f of series)
        for (const k in f) {
            if (k === "_tick") continue;
            if (!totals[k]) totals[k] = { sum: 0, max: 0, n: 0 };
            totals[k].sum += f[k];
            if (f[k] > totals[k].max) totals[k].max = f[k];
            totals[k].n++;
        }

    console.log("===== PERIODISCHER-SPIKE-DETEKTOR (was schluckt alle paar Sekunden) =====\n");
    console.log(
        `  Frames gemessen: ${series.length} über ~25 s · Median-Tick ${median.toFixed(1)} ms · Spike-Schwelle ${spikeThresh.toFixed(1)} ms`
    );
    console.log(`  SPIKE-Frames (> ${spikeThresh.toFixed(0)} ms): ${spikes.length}\n`);
    if (spikes.length) {
        console.log("  Die schlimmsten Spike-Frames — was sie DOMINIERT (Phase: ms):");
        spikes
            .sort((a, b) => b._tick - a._tick)
            .slice(0, 8)
            .forEach((f) => {
                const parts = Object.entries(f)
                    .filter(([k]) => k !== "_tick")
                    .sort((a, b) => b[1] - a[1])
                    .slice(0, 3)
                    .map(([k, v]) => `${k} ${v.toFixed(0)}ms`)
                    .join(" · ");
                console.log(
                    `    Tick ${f._tick.toFixed(0).padStart(5)} ms  ←  ${parts || "(keine gewrappte Phase — woanders)"}`
                );
            });
    }
    console.log("\n  PHASEN gesamt (Gesamt-ms über 25 s | max in EINEM Frame | Aufrufe):");
    Object.entries(totals)
        .sort((a, b) => b[1].max - a[1].max)
        .slice(0, 14)
        .forEach(([k, v]) => {
            console.log(
                `    ${k.padEnd(26)} Σ${v.sum.toFixed(0).padStart(6)} ms | max ${v.max.toFixed(0).padStart(5)} ms | ${v.n}×`
            );
        });
    console.log("\n  LESART: der Posten mit hohem MAX aber niedrigem Schnitt = der periodische Spike.");
    console.log("==========================================================================");
    await browser.close();
    server.close();
    process.exit(0);
})();
