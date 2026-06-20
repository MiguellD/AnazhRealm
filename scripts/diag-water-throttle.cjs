// A/B-MESS-PROBE (V18.292): der Fluss-Re-Mesh-Throttle auf IDENTISCHEM Welt-
// Zustand. Bootet EINMAL, settled, misst dann `_tickPendingWaterIso`-Kosten über
// N stationäre Ticks bei CA_REMESH_TICK_INTERVAL=1 (alt, jeder Frame) vs =4
// (neu, ~15 Hz). Gleiche Welt → sauberer Vergleich (kein Worldgen-Rauschen).
const puppeteer = require("puppeteer");
const http = require("http");
const fs = require("fs");
const path = require("path");
const PORT = Number(process.env.DIAG_PORT) || 4397;
const root = path.resolve(__dirname, "..");
const mime = { ".html": "text/html", ".js": "application/javascript", ".wasm": "application/wasm", ".json": "application/json", ".woff2": "font/woff2", ".css": "text/css", ".png": "image/png" };
const server = http.createServer((req, res) => {
    let p = req.url.split("?")[0];
    if (p === "/") p = "/index.html";
    const fp = path.join(root, p);
    if (!fp.startsWith(root)) { res.statusCode = 403; return res.end(); }
    fs.readFile(fp, (e, d) => {
        if (e) { res.statusCode = 404; return res.end(); }
        res.setHeader("Content-Type", mime[path.extname(fp)] || "application/octet-stream");
        res.end(d);
    });
});
(async () => {
    await new Promise((r) => server.listen(PORT, r));
    const browser = await puppeteer.launch({ headless: true, protocolTimeout: 580000, args: ["--no-sandbox", "--disable-setuid-sandbox"] });
    const page = await browser.newPage();
    await page.evaluateOnNewDocument(() => { window.__anazhHeadlessNullRenderer = true; window.__anazhHeadlessSkinResCap = 64; });
    await page.goto(`http://127.0.0.1:${PORT}/index.html`, { waitUntil: "load", timeout: 30000 });
    await page.evaluate(async () => {
        const start = performance.now();
        let lastSize = -1, stableFor = 0;
        while (performance.now() - start < 90000) {
            const r = window.anazhRealm;
            if (r && typeof r._gameLoopTick === "function") {
                try { r._gameLoopTick(performance.now()); } catch (_e) {}
                const sz = r.state && r.state.voxelChunks ? r.state.voxelChunks.size : 0;
                if (sz === lastSize) stableFor++; else { stableFor = 0; lastSize = sz; }
                if (sz > 40 && stableFor > 80) break;
            }
            await new Promise((res) => setTimeout(res, 4));
        }
    });
    const out = await page.evaluate(async () => {
        const r = window.anazhRealm, s = r.state;
        const Cls = r.constructor;
        const measure = (interval, N) => {
            Cls.CA_REMESH_TICK_INTERVAL = interval;
            // settle 30 Ticks bei diesem Intervall, dann messen
            let now = performance.now();
            for (let i = 0; i < 30; i++) { now += 16.67; try { r._gameLoopTick(now); } catch (_e) {} }
            let isoSum = 0, isoMax = 0, builds = 0;
            const origIso = r._tickPendingWaterIso.bind(r);
            for (let i = 0; i < N; i++) {
                now += 16.67;
                // den ganzen Tick fahren (CA enqueued), aber NUR die Iso-Phase timen
                try { r._gameLoopTick(now); } catch (_e) {}
                // pendingWaterIso-Größe = aufgelaufene Bau-Last
            }
            // separat: 60 Ticks, jeweils die Iso-Phase isoliert timen
            for (let i = 0; i < 60; i++) {
                now += 16.67;
                // erst alles AUSSER iso (wir können nicht leicht trennen) → time den vollen Tick
                const a = performance.now();
                try { r._gameLoopTick(now); } catch (_e) {}
                const dt = performance.now() - a;
                isoSum += dt; if (dt > isoMax) isoMax = dt;
            }
            return {
                interval,
                tickAvgMs: +(isoSum / 60).toFixed(2),
                tickMaxMs: +isoMax.toFixed(2),
                pendingAfter: s.pendingWaterIso ? s.pendingWaterIso.size : -1,
                activeRegions: s.waterCAActive ? s.waterCAActive.size : -1,
            };
        };
        const N = 200;
        const off = measure(1, N); // alt: jeder Frame
        const on = measure(4, N); // neu: 15 Hz
        Cls.CA_REMESH_TICK_INTERVAL = 4; // restore default
        return { off, on, activeRegions: on.activeRegions };
    });
    console.log("\n===== WASSER-THROTTLE A/B (V18.292, identische Welt) =====\n");
    console.log("  aktive Wasser-CA-Regionen: " + out.activeRegions);
    console.log("  INTERVAL=1 (alt, jeder Frame):  Tick Ø " + out.off.tickAvgMs + " ms · max " + out.off.tickMaxMs + " · pending " + out.off.pendingAfter);
    console.log("  INTERVAL=4 (neu, ~15 Hz):       Tick Ø " + out.on.tickAvgMs + " ms · max " + out.on.tickMaxMs + " · pending " + out.on.pendingAfter);
    const d = out.off.tickAvgMs - out.on.tickAvgMs;
    console.log("\n  → Δ Tick Ø " + d.toFixed(2) + " ms (" + (out.off.tickAvgMs > 0 ? Math.round((d / out.off.tickAvgMs) * 100) : 0) + "% schneller im Stand)");
    console.log("\n==========================================================\n");
    await browser.close();
    server.close();
    process.exit(0);
})().catch((e) => { console.error("CRASH:", e); process.exit(2); });
