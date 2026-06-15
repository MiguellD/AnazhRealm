// DIAGNOSE: der FPS-KILLER + PBR + Baum-Größen (V18.232). Ehrlich messen.
// Headless-swiftshader-Frame-ms ist UNZUVERLÄSSIG (kein GPU) → ich messe die
// belastbaren Proxies: Instanz-Zahl + Dreieck-Zahl in der Szene (der GPU-Draw-
// Kosten), die Baum-Größen-Spanne, + ein PBR-vs-Toon-Look (Scatter aus, schnell).
const puppeteer = require("puppeteer");
const http = require("http");
const fs = require("fs");
const path = require("path");
const PORT = 4380;
const root = path.resolve(__dirname, "..");
const ART = path.join(root, "artifacts");
const mime = { ".html": "text/html", ".js": "application/javascript", ".wasm": "application/wasm", ".json": "application/json", ".woff2": "font/woff2", ".css": "text/css", ".png": "image/png" };
const server = http.createServer((req, res) => {
    let p = req.url.split("?")[0]; if (p === "/") p = "/index.html";
    const fp = path.join(root, p);
    if (!fp.startsWith(root)) { res.statusCode = 403; return res.end(); }
    fs.readFile(fp, (err, data) => { if (err) { res.statusCode = 404; return res.end(); } res.setHeader("Content-Type", mime[path.extname(fp)] || "application/octet-stream"); res.end(data); });
});
(async () => {
    await new Promise((r) => server.listen(PORT, r));
    const browser = await puppeteer.launch({ headless: true, protocolTimeout: 580000, args: ["--use-angle=swiftshader", "--enable-unsafe-swiftshader", "--enable-webgl", "--ignore-gpu-blocklist", "--no-sandbox", "--disable-setuid-sandbox"] });
    const page = await browser.newPage();
    await page.setViewport({ width: 1280, height: 760 });
    page.on("pageerror", (e) => console.log("[PAGE-ERROR]", (e.stack || e.message).split("\n")[0]));
    await page.goto(`http://127.0.0.1:${PORT}/index.html`, { waitUntil: "domcontentloaded", timeout: 30000 });

    // settle MIT scatter an (die echte Last), Render gestubbt fürs Tempo.
    await page.evaluate(async () => {
        let stubbed = false; const start = performance.now(); let last = -1, stable = 0;
        while (performance.now() - start < 50000) {
            const r = window.anazhRealm;
            if (r && !stubbed && r.state && r.state.renderer) {
                window.__origRender = r.state.renderer.render.bind(r.state.renderer);
                r.state.renderer.render = function () {};
                if (typeof r.state.renderer.renderAsync === "function") r.state.renderer.renderAsync = () => Promise.resolve();
                r.state.postProcessingFailed = true; stubbed = true;
            }
            if (r && typeof r._gameLoopTick === "function") {
                try { r._gameLoopTick(performance.now()); } catch (_e) {}
                const sz = r.state && r.state.voxelChunks ? r.state.voxelChunks.size : 0;
                if (sz === last) stable++; else { stable = 0; last = sz; }
                if (sz > 25 && stable > 60) break;
            }
            await new Promise((res) => setTimeout(res, 2));
        }
        // dem Scatter Zeit geben, die Region zu füllen
        const r = window.anazhRealm;
        for (let i = 0; i < 400; i++) { try { r._gameLoopTick(performance.now()); } catch (_e) {} await new Promise((res) => setTimeout(res, 2)); }
    });

    // MESSEN: Instanzen + Dreiecke in der Szene
    const stats = await page.evaluate(() => {
        const r = window.anazhRealm, s = r.state;
        let instMeshes = 0, instTotal = 0, regularMeshes = 0, triApprox = 0, grassBlades = 0, grassMeshes = 0;
        const groups = {};
        s.scene.traverse((o) => {
            if (!o.isMesh) return;
            const g = o.geometry;
            const triPerInst = g && g.index ? g.index.count / 3 : g && g.attributes && g.attributes.position ? g.attributes.position.count / 3 : 0;
            if (o.isInstancedMesh) {
                const cnt = o.count || 0;
                // Gras?
                if (o.material === s._grassMat || (o.geometry === s._grassConeGeometry)) { grassMeshes++; grassBlades += cnt; }
                else { instMeshes++; instTotal += cnt; }
                triApprox += triPerInst * cnt;
            } else { regularMeshes++; triApprox += triPerInst; }
        });
        // Scatter-Aufschlüsselung
        let scatterByLayer = null;
        try {
            const map = r._ensureScatterRegionMap ? r._ensureScatterRegionMap() : null;
            if (map) { scatterByLayer = {}; for (const reg of map.values()) { if (reg && Array.isArray(reg.cells)) for (const c of reg.cells) scatterByLayer[c.layer] = (scatterByLayer[c.layer] || 0) + 1; } }
        } catch (_e) {}
        // Baum-Größen: spanne der gewachsenen Bäume
        let treeHeights = [];
        try {
            for (const sp of ["baum_eiche", "baum_tanne", "baum_birke", "baum_buche"]) {
                const keys = r._buildVariantLODs(sp, 0); const bp = keys && s.blueprints[keys[0]];
                if (bp && bp._skeleton && Number.isFinite(bp._skeleton.totalH)) treeHeights.push({ sp, h: +bp._skeleton.totalH.toFixed(1) });
            }
        } catch (_e) {}
        return { instMeshes, instTotal, regularMeshes, triApprox: Math.round(triApprox), grassBlades, grassMeshes, scatterByLayer, treeHeights, materialMode: s.atmosphere && s.atmosphere.materialMode, gpuScatter: s.atmosphere && s.atmosphere.gpuScatter, voxelChunks: s.voxelChunks ? s.voxelChunks.size : 0 };
    });
    console.log("=== SZENE-LAST ===");
    console.log(JSON.stringify(stats, null, 2));

    // PBR vs TOON Look (Scatter aus → schnell, fairer Boden+nahe Bäume-Blick)
    await page.evaluate(() => { const r = window.anazhRealm; if (r.state.atmosphere) r.state.atmosphere.gpuScatter = false; if (r._disposeAllScatterRegions) r._disposeAllScatterRegions(); for (const el of document.querySelectorAll(".overlay,.modal,.drawer,#chat-console,#dialogue-box,#intro-overlay")) el.style.display = "none"; });
    const shoot = async (file, mode) => {
        await page.evaluate((mode) => {
            const r = window.anazhRealm, s = r.state, pm = s.playerMesh, cam = s.camera;
            if (s.atmosphere) s.atmosphere.materialMode = mode;
            // Material-Caches leeren, damit der Mode greift
            s.voxelChunkMaterial = null;
            // Tageszeit auf Mittag für wahre Farben
            if (typeof r.setTimeOfDay === "function") { try { r.setTimeOfDay(12); } catch (_e) {} }
            else if (s.dayNight) s.dayNight.time = 0.5;
            // Chunks neu material-isieren: einfach die sichtbaren neu bauen ist teuer;
            // wir setzen das Material neu auf bestehende Terrain-Meshes
            s.scene.traverse((o) => { if (o.isMesh && o.material && o.material.vertexColors && o.geometry && o.geometry.attributes && o.geometry.attributes.color && !o.isInstancedMesh) { try { o.material = r._buildToonNodeMaterial({ vertexColors: true, side: 2, geomorph: true }); } catch (_e) {} } });
            const y = (50 * Math.PI) / 180, ex = pm.position.x, ey = pm.position.y + 1.6, ez = pm.position.z;
            cam.position.set(ex, ey, ez); cam.lookAt(ex + Math.sin(y) * 50, ey - 7, ez + Math.cos(y) * 50); cam.updateMatrixWorld(true);
            if (window.__origRender) { r.state.renderer.render = window.__origRender; s.postProcessingFailed = true; try { r._loopRender(performance.now()); r._loopRender(performance.now()); } catch (_e) {} r.state.renderer.render = function () {}; }
        }, mode);
        await new Promise((r) => setTimeout(r, 200));
        await page.screenshot({ path: path.join(ART, file) });
        console.log(`${file} (mode=${mode})`);
    };
    await shoot("fps-toon.png", "toon");
    await shoot("fps-pbr.png", "pbr");

    await browser.close();
    await new Promise((r) => server.close(r));
    process.exit(0);
})();
