// DIAGNOSE: SEHE ICH 10% ODER 100%? (V18.232) — der ehrliche Blick.
// Scatter AUS (schnell) → Boden+Gras+Pfad nah; PLUS ein gewachsener Baum nah,
// um die Laub/Rinde wirklich zu sehen. Kein Behaupten, kein headless-grün-Trost.
const puppeteer = require("puppeteer");
const http = require("http");
const fs = require("fs");
const path = require("path");
const PORT = 4379;
const root = path.resolve(__dirname, "..");
const ART = path.join(root, "artifacts");
const mime = { ".html": "text/html", ".js": "application/javascript", ".wasm": "application/wasm", ".json": "application/json", ".woff2": "font/woff2", ".css": "text/css", ".png": "image/png" };
const server = http.createServer((req, res) => {
    let p = req.url.split("?")[0];
    if (p === "/") p = "/index.html";
    const fp = path.join(root, p);
    if (!fp.startsWith(root)) { res.statusCode = 403; return res.end(); }
    fs.readFile(fp, (err, data) => {
        if (err) { res.statusCode = 404; return res.end(); }
        res.setHeader("Content-Type", mime[path.extname(fp)] || "application/octet-stream");
        res.end(data);
    });
});
(async () => {
    await new Promise((r) => server.listen(PORT, r));
    const browser = await puppeteer.launch({ headless: true, protocolTimeout: 580000, args: ["--use-angle=swiftshader", "--enable-unsafe-swiftshader", "--enable-webgl", "--ignore-gpu-blocklist", "--no-sandbox", "--disable-setuid-sandbox"] });
    const page = await browser.newPage();
    await page.setViewport({ width: 1280, height: 760 });
    page.on("pageerror", (e) => console.log("[PAGE-ERROR]", (e.stack || e.message).split("\n")[0]));
    await page.goto(`http://127.0.0.1:${PORT}/index.html`, { waitUntil: "domcontentloaded", timeout: 30000 });

    // settle (Render gestubbt, SCATTER AUS) — kurz, bis der Ring nahe steht.
    await page.evaluate(async () => {
        let stubbed = false;
        const start = performance.now();
        let last = -1, stable = 0;
        while (performance.now() - start < 35000) {
            const r = window.anazhRealm;
            if (r && r.state) { r.state.timeOfDay = 0.5; if (r.state.atmosphere) r.state.atmosphere.gpuScatter = false; } // Mittag + Scatter aus
            if (r && !stubbed && r.state && r.state.renderer) {
                window.__origRender = r.state.renderer.render.bind(r.state.renderer);
                r.state.renderer.render = function () {};
                if (typeof r.state.renderer.renderAsync === "function") r.state.renderer.renderAsync = () => Promise.resolve();
                r.state.postProcessingFailed = true;
                stubbed = true;
            }
            if (r && typeof r._gameLoopTick === "function") {
                try { r._gameLoopTick(performance.now()); } catch (_e) {}
                const sz = r.state && r.state.voxelChunks ? r.state.voxelChunks.size : 0;
                if (sz === last) stable++; else { stable = 0; last = sz; }
                if (sz > 25 && stable > 40) break;
            }
            await new Promise((res) => setTimeout(res, 4));
        }
        const r = window.anazhRealm;
        try { if (r._disposeAllScatterRegions) r._disposeAllScatterRegions(); r._drainPendingWaterIso && r._drainPendingWaterIso(); r._drainPendingGrass && r._drainPendingGrass(); } catch (_e) {}
    });
    await page.evaluate(() => { for (const el of document.querySelectorAll(".overlay, .modal, .drawer, #chat-console, #dialogue-box, #intro-overlay")) el.style.display = "none"; });

    const realRender = async () => page.evaluate(() => {
        const r = window.anazhRealm, s = r.state;
        if (!window.__origRender) return "no origRender";
        r.state.renderer.render = window.__origRender;
        s.postProcessingFailed = true;
        if (r.setTimeOfDay) r.setTimeOfDay(0.5); // ECHTES Mittag (ruft _applyDayNightToScene)
        try { if (typeof r._loopRender === "function") { r._loopRender(performance.now()); r._loopRender(performance.now()); } else window.__origRender(s.scene, s.camera); } catch (e) { return String(e.message || e); }
        r.state.renderer.render = function () {};
        return "ok";
    });

    // SHOT 1+2: Boden/Gras nah, Augenhöhe, zwei Richtungen
    for (const [yaw, tag] of [[35, "ground-a"], [200, "ground-b"]]) {
        await page.evaluate((yaw) => {
            const r = window.anazhRealm, s = r.state, pm = s.playerMesh, cam = s.camera;
            const y = (yaw * Math.PI) / 180, ex = pm.position.x, ey = pm.position.y + 1.6, ez = pm.position.z;
            cam.position.set(ex, ey, ez);
            cam.lookAt(ex + Math.sin(y) * 50, ey - 8, ez + Math.cos(y) * 50);
            cam.updateMatrixWorld(true);
        }, yaw);
        const e = await realRender();
        await new Promise((r) => setTimeout(r, 200));
        await page.screenshot({ path: path.join(ART, `sicht-${tag}.png`) });
        console.log(`sicht-${tag}.png  ${e}`);
    }

    // SHOT 3: ein gewachsener Baum NAH (die Laub/Rinde wirklich sehen)
    const tinfo = await page.evaluate(() => {
        const r = window.anazhRealm, s = r.state, pm = s.playerMesh, cam = s.camera;
        // wachse eine Eiche + spawne sie ~12m vor dem Spieler
        let spawned = false, parts = 0;
        try {
            const keys = r._buildVariantLODs("baum_eiche", 0);
            const bp = keys && s.blueprints[keys[0]];
            parts = bp && bp.parts ? bp.parts.length : 0;
            if (bp) {
                const px = pm.position.x + 12, pz = pm.position.z;
                const py = r.getTerrainHeightAt ? r.getTerrainHeightAt(px, pz) : pm.position.y;
                const a = r.spawnArchitecture(keys[0], { x: px, y: py, z: pz }, { silent: true });
                spawned = !!a;
                cam.position.set(pm.position.x, pm.position.y + 4, pm.position.z);
                cam.lookAt(px, py + 5, pz);
                cam.updateMatrixWorld(true);
            }
        } catch (e) { return { err: String(e.message || e) }; }
        return { spawned, parts };
    });
    const e3 = await realRender();
    await new Promise((r) => setTimeout(r, 200));
    await page.screenshot({ path: path.join(ART, "sicht-baum.png") });
    console.log(`sicht-baum.png  spawned=${tinfo.spawned} parts=${tinfo.parts} ${tinfo.err || e3}`);

    await browser.close();
    await new Promise((r) => server.close(r));
    console.log("\nartifacts/sicht-{ground-a,ground-b,baum}.png");
    process.exit(0);
})();
