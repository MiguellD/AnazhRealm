// Der leichteste mögliche ECHTE Render: Ring 1, Gras aus, Schatten aus, kleiner Viewport,
// EIN _loopRender. Foundry ist raus -> kein iframe-Crash. Ziel: EINEN Baum + Boden + Himmel SEHEN.
const puppeteer = require("puppeteer");
const http = require("http");
const fs = require("fs");
const path = require("path");
const PORT = 4451;
const root = path.resolve(__dirname, "..");
const ART = path.join(root, "artifacts");
const mime = { ".html": "text/html", ".js": "application/javascript", ".wasm": "application/wasm", ".json": "application/json", ".css": "text/css", ".png": "image/png", ".woff2": "font/woff2" };
const server = http.createServer((req, res) => {
    let p = req.url.split("?")[0]; if (p === "/") p = "/index.html";
    const fp = path.join(root, p); if (!fp.startsWith(root)) { res.statusCode = 403; return res.end(); }
    fs.readFile(fp, (err, data) => { if (err) { res.statusCode = 404; return res.end(); } res.setHeader("Content-Type", mime[path.extname(fp)] || "application/octet-stream"); res.end(data); });
});
(async () => {
    fs.mkdirSync(ART, { recursive: true });
    await new Promise((r) => server.listen(PORT, r));
    const browser = await puppeteer.launch({ headless: true, protocolTimeout: 600000, args: ["--use-angle=swiftshader", "--enable-unsafe-swiftshader", "--enable-webgl", "--ignore-gpu-blocklist", "--no-sandbox", "--disable-setuid-sandbox"] });
    const page = await browser.newPage();
    await page.setViewport({ width: 560, height: 400 });
    page.on("pageerror", (e) => console.log("[PAGE-ERROR]", (e.stack || e.message).split("\n")[0]));
    await page.goto(`http://127.0.0.1:${PORT}/index.html`, { waitUntil: "domcontentloaded", timeout: 30000 });

    const info = await page.evaluate(async () => {
        let stubbed = false; const start = performance.now(); let lastSize = -1, stableFor = 0;
        while (performance.now() - start < 60000) {
            const r = window.anazhRealm;
            if (r && r.state) { try { r.state.chunkRingRadius = 1; r.state.foliageDensityScale = 0; if (r.state.foliageRadius !== undefined) r.state.foliageRadius = 1; } catch (_e) {} }
            if (r && !stubbed && r.state && r.state.renderer) { window.__origRender = r.state.renderer.render.bind(r.state.renderer); r.state.renderer.render = function () {}; if (r.state.renderer.renderAsync) r.state.renderer.renderAsync = () => Promise.resolve(); r.state.postProcessingFailed = true; stubbed = true; }
            if (r && typeof r._gameLoopTick === "function") {
                try { r._gameLoopTick(performance.now()); } catch (_e) {}
                const sz = r.state && r.state.voxelChunks ? r.state.voxelChunks.size : 0;
                if (sz === lastSize) stableFor++; else { stableFor = 0; lastSize = sz; }
                if (sz >= 9 && stableFor > 30) break;
            }
            await new Promise((res) => setTimeout(res, 3));
        }
        const r = window.anazhRealm; const s = r.state;
        // Gras + fernes Laub verstecken (leichter), klaren Mittag.
        let killed = 0; s.scene.traverse((o) => { if ((o.isMesh || o.isInstancedMesh) && o.name && /grass|gras|scatter/i.test(o.name)) { o.visible = false; killed++; } });
        try { s.weather = "clear"; s.weatherTransition = null; s.timeOfDay = 0.45; if (r._setTimeOfDay) r._setTimeOfDay(0.45); if (r._applyDayNightToScene) r._applyDayNightToScene(); } catch (_e) {}
        try { if (s.renderer && s.renderer.shadowMap) s.renderer.shadowMap.enabled = false; } catch (_e) {}
        // Land-Spot Augenhoehe.
        const th = (x, z) => (r.getTerrainHeightAt ? r.getTerrainHeightAt(x, z) : 0);
        const wl = (x, z) => (r._waterLevelAt ? r._waterLevelAt(x, z) : -1e9);
        const pm = s.playerMesh; const cx = pm.position.x, cz = pm.position.z;
        let best = null; for (let rad = 6; rad <= 40 && !best; rad += 5) for (let a = 0; a < 360; a += 20) { const x = cx + Math.cos(a * Math.PI / 180) * rad, z = cz + Math.sin(a * Math.PI / 180) * rad; if (th(x, z) > wl(x, z) + 2.5) { best = { x, z }; break; } }
        const lx = best ? best.x : cx, lz = best ? best.z : cz, gy = th(lx, lz);
        pm.position.set(lx, gy + 1.7, lz); if (s.camera) s.camera.position.copy(pm.position); pm.visible = false;
        const cv = document.querySelector("canvas"); for (const el of Array.from(document.body.children)) if (el !== cv && el.tagName !== "SCRIPT") el.style.display = "none";
        // Ein paar Ticks, damit die nahen Baeume stehen.
        for (let i = 0; i < 40; i++) { try { r._gameLoopTick(performance.now()); } catch (_e) {} await new Promise((res) => setTimeout(res, 5)); }
        // Zaehle sichtbare Baum-Instanzen.
        let treeInst = 0; if (s.archInstanceGroups) s.archInstanceGroups.forEach((g) => { if (g && g.mesh && g.mesh.count) treeInst += g.mesh.count; });
        return { chunks: s.voxelChunks ? s.voxelChunks.size : 0, killedGrass: killed, treeInst, spot: [lx.toFixed(0), lz.toFixed(0)] };
    });
    console.log("Welt:", JSON.stringify(info));

    // EIN echter _loopRender + Screenshot.
    const meta = await page.evaluate(() => {
        const r = window.anazhRealm; const s = r.state; const pm = s.playerMesh; const cam = s.camera;
        const ex = pm.position.x, ey = pm.position.y, ez = pm.position.z;
        cam.position.set(ex, ey, ez); cam.lookAt(ex + 30, ey + 1, ez + 30); cam.updateMatrixWorld(true);
        let err = null;
        if (window.__origRender) { s.renderer.render = window.__origRender; s.postProcessingFailed = true; try { r._loopRender(performance.now()); } catch (_e) { err = String(_e && _e.message || _e); } s.renderer.render = function () {}; }
        return { err };
    });
    await new Promise((res) => setTimeout(res, 400));
    await page.screenshot({ path: path.join(ART, "see.png") });
    console.log("Render:", meta.err ? "WARN " + meta.err : "OK", "-> artifacts/see.png");
    await browser.close(); await new Promise((r) => server.close(r));
    process.exit(0);
})();
