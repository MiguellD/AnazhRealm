// VERIFIZIERT DEN WAHRNEHMUNGS-KANAL (Schöpfer „die Vorlage ist die EINE Quelle, AnazhRealm der Übersetzer").
// Echter Renderer + Foundry, kein Render. Wartet auf foundry.ready, prueft: das Studio schickte render-config,
// AnazhRealm adoptierte die LOD-Distanzen/Fades ins LOD_DISTANCES-Static + state.lodRef, und state.studioRenderConfig
// traegt Sichtweite/Dichte/Understory (fuer die naechsten Phasen). Erwartet die Vorlagen-Werte (d1=40, fade=8,
// fade0=4, ref=12, hyst=3.4, sight=120, dartsPerM2=1.2, grassStep=0.72).
const puppeteer = require("puppeteer");
const http = require("http");
const fs = require("fs");
const path = require("path");
const PORT = 4551;
const root = path.resolve(__dirname, "..");
const mime = { ".html": "text/html", ".js": "application/javascript", ".wasm": "application/wasm", ".json": "application/json", ".css": "text/css", ".png": "image/png" };
const server = http.createServer((req, res) => {
    let p = req.url.split("?")[0];
    if (p === "/") p = "/index.html";
    const fp = path.join(root, p);
    if (!fp.startsWith(root)) { res.statusCode = 403; return res.end(); }
    fs.readFile(fp, (err, data) => { if (err) { res.statusCode = 404; return res.end(); } res.setHeader("Content-Type", mime[path.extname(fp)] || "application/octet-stream"); res.end(data); });
});
(async () => {
    await new Promise((r) => server.listen(PORT, r));
    const browser = await puppeteer.launch({ headless: true, protocolTimeout: 200000, args: ["--use-angle=swiftshader", "--enable-unsafe-swiftshader", "--enable-webgl", "--ignore-gpu-blocklist", "--no-sandbox", "--disable-setuid-sandbox"] });
    const page = await browser.newPage();
    page.on("pageerror", (e) => console.log("[ERR]", (e.stack || e.message).split("\n")[0]));
    await page.goto(`http://127.0.0.1:${PORT}/index.html`, { waitUntil: "domcontentloaded", timeout: 30000 });
    const out = await page.evaluate(async () => {
        const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
        let stub = false;
        const s0 = performance.now();
        while (performance.now() - s0 < 50000) {
            const r = window.anazhRealm;
            if (r && !stub && r.state && r.state.renderer && !r.state.renderer._isHeadlessNull) {
                r.state.renderer.render = function () {};
                if (r.state.renderer.renderAsync) r.state.renderer.renderAsync = () => Promise.resolve();
                r.state.postProcessingFailed = true; r._bootWarmDone = true; stub = true;
            }
            if (r && typeof r._gameLoopTick === "function") { try { r._gameLoopTick(performance.now()); } catch (_e) {} if (r.state.voxelChunks && r.state.voxelChunks.size >= 4) break; }
            await sleep(5);
        }
        const r = window.anazhRealm;
        const f = r._ensureAssetFoundry();
        const t0 = performance.now();
        while (f && !f.ready && performance.now() - t0 < 30000) await sleep(100);
        // Ein paar Ticks, damit die render-config-Antwort ankommt + ingestiert.
        for (let i = 0; i < 30; i++) { try { r._gameLoopTick(performance.now()); } catch (_e) {} await sleep(50); }
        const D = r.constructor.LOD_DISTANCES;
        const cfg = r.state.studioRenderConfig || null;
        return {
            foundryReady: !!(f && f.ready),
            lodAdopted: { thresh01: D.thresh01, thresh12: D.thresh12, fade: D.fade, fade0: D.fade0, hysteresis: D.hysteresis, lodRef: D.lodRef, leafVisCap: D.leafVisCap },
            stateLodRef: r.state.lodRef,
            studioConfig: cfg,
        };
    });
    console.log(JSON.stringify(out, null, 2));
    const D = out.lodAdopted, C = out.studioConfig || {};
    const ok = out.foundryReady && D.thresh12 === 40 && D.fade === 8 && D.fade0 === 4 && D.lodRef === 12 && Math.abs(D.hysteresis - 3.4) < 1e-6 && C.sight === 120 && C.density && Math.abs(C.density.dartsPerM2 - 1.2) < 1e-6 && C.understory && Math.abs(C.understory.grassStep - 0.72) < 1e-6;
    console.log("\nLESART:", ok ? "OK — der Wahrnehmungs-Kanal traegt die Vorlagen-Werte (LOD adoptiert, Sichtweite/Dichte/Understory da)." : "FEHLT — der Kanal traegt die Vorlagen-Werte NICHT.");
    await browser.close(); server.close(); process.exit(ok ? 0 : 1);
})();
