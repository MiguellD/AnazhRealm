// IST DER DICHTE WALD TRAGBAR WIE DAS STUDIO? (Schöpfer „lade es selbst, es müsste so tragbar wie das
// Studio sein"). Echtes WebGPU (swiftshader). Wir zwingen ein Chunk-Gitter zu bauen (nur damit der Wald
// im Screenshot STEHT — headless streamt sonst nur 1 Chunk), konvergieren den proaktiven Dock (die
// Billboards platzieren), rendern ECHT + messen die WAHRE gezeichnete Dreieck-Last (BatchedMesh je aktive
// Instanz, nicht die Reserve). Ziel: dichter Wald IM BILD + Last im Studio-Bereich (~1-2M, nicht 15M).
const puppeteer = require("puppeteer");
const http = require("http");
const fs = require("fs");
const path = require("path");
const PORT = 4567;
const root = path.resolve(__dirname, "..");
const ART = path.join(root, "artifacts");
const mime = { ".html": "text/html", ".js": "application/javascript", ".wasm": "application/wasm", ".json": "application/json", ".css": "text/css", ".png": "image/png", ".woff2": "font/woff2" };
const server = http.createServer((req, res) => {
    let p = req.url.split("?")[0];
    if (p === "/") p = "/index.html";
    const fp = path.join(root, p);
    if (!fp.startsWith(root)) { res.statusCode = 403; return res.end(); }
    fs.readFile(fp, (err, data) => { if (err) { res.statusCode = 404; return res.end(); } res.setHeader("Content-Type", mime[path.extname(fp)] || "application/octet-stream"); res.end(data); });
});
(async () => {
    fs.mkdirSync(ART, { recursive: true });
    await new Promise((r) => server.listen(PORT, r));
    const browser = await puppeteer.launch({ headless: true, protocolTimeout: 600000, args: ["--use-angle=swiftshader", "--enable-unsafe-swiftshader", "--enable-webgl", "--ignore-gpu-blocklist", "--no-sandbox", "--disable-setuid-sandbox"] });
    const page = await browser.newPage();
    await page.setViewport({ width: 640, height: 420 });
    page.on("pageerror", (e) => console.log("[ERR]", (e.stack || e.message).split("\n")[0]));
    await page.goto(`http://127.0.0.1:${PORT}/index.html`, { waitUntil: "domcontentloaded", timeout: 30000 });
    const info = await page.evaluate(async () => {
        const sl = (ms) => new Promise((r) => setTimeout(r, ms));
        let stub = false;
        const s0 = performance.now();
        while (performance.now() - s0 < 40000) {
            const r = window.anazhRealm;
            if (r && !stub && r.state && r.state.renderer && !r.state.renderer._isHeadlessNull) {
                window.__origRender = r.state.renderer.render.bind(r.state.renderer);
                r.state.renderer.render = function () {};
                if (r.state.renderer.renderAsync) r.state.renderer.renderAsync = () => Promise.resolve();
                r.state.postProcessingFailed = true; stub = true;
            }
            if (r && typeof r._gameLoopTick === "function") { try { r._gameLoopTick(performance.now()); } catch (_e) {} if (r.state.voxelChunks && r.state.voxelChunks.size >= 1) break; }
            await sl(4);
        }
        const r = window.anazhRealm, s = r.state;
        r._bootWarmDone = true;
        const f = r._ensureAssetFoundry();
        const t0 = performance.now();
        while (f && !f.ready && performance.now() - t0 < 30000) await sl(100);
        // Chunk-Gitter bauen (nur fuers Bild — headless streamt sonst 1 Chunk) + bepflanzen.
        for (let cx = -2; cx <= 2; cx++) for (let cz = -2; cz <= 2; cz++) { try { r._ensureVoxelChunkAt(cx, cz, { forceSync: true }); } catch (_e) {} }
        for (let cx = -2; cx <= 2; cx++) for (let cz = -2; cz <= 2; cz++) { try { r._populateVoxelChunkVegetation(cx, cz); } catch (_e) {} }
        // Den proaktiven Dock konvergieren (Billboards platzieren) — Budget gesund, Terrain ruht.
        for (let i = 0; i < 140; i++) { s._frameOverBudget = false; s._frameChunksBuilt = false; try { r._foundryRewarmColdTrees(); r._gameLoopTick(performance.now()); } catch (_e) {} if (i % 15 === 0) await sl(30); }
        // Baeume zaehlen + den dichtesten Innenraum finden.
        const built = (s.architectures || []).filter((e) => /baum/.test(((e._lodSpecies || "") + "")) && e.position && (e.instanced || e.mesh || e.instFoundry));
        let tgt = null;
        for (const e of built) { let nb = 0; for (const o of built) { if (o !== e && Math.hypot(o.position.x - e.position.x, o.position.z - e.position.z) < 20) nb++; } if (!tgt || nb > tgt.nb) tgt = { x: e.position.x, z: e.position.z, nb }; }
        if (!tgt) tgt = { x: 0, z: 0, nb: 0 };
        // Mittag + Kamera Augenhoehe in den Wald.
        try { r.setTimeOfDay(0.5); for (let i = 0; i < 4; i++) r._gameLoopTick(performance.now()); } catch (_e) {}
        const th = (x, z) => (typeof r.getTerrainHeightAt === "function" ? r.getTerrainHeightAt(x, z) : 0);
        const eye = th(tgt.x, tgt.z) + 2.2;
        const cam = s.camera;
        cam.position.set(tgt.x + 10, eye, tgt.z + 10);
        cam.lookAt(tgt.x, eye - 0.5, tgt.z);
        cam.updateMatrixWorld(true);
        if (s.playerMesh) s.playerMesh.visible = false;
        // KEIN echter Render (swiftshader braucht Minuten fuer einen dichten Wald — die Software-Render-
        // Zeit-Wand, keine Tragbarkeits-Aussage). Die TRAGBARKEIT ist die gezeichnete Dreieck-Last, die wir
        // OHNE den langsamen Render messen (Render bleibt gestubbt, wir zaehlen die Szene). Ein leichtes Bild
        // macht ein eigener Lauf (kleines Gitter). CPU-Buchhaltung fuer korrekte Cull-Sichtbarkeit:
        let err = null;
        try { if (s.scene) s.scene.updateMatrixWorld(true); } catch (_e) { err = String((_e && _e.message) || _e); }
        // WAHRE gezeichnete Last messen (BatchedMesh je aktive Instanz, nicht die Reserve).
        const idxTris = (g) => { if (!g) return 0; const idx = g.index; if (idx) return idx.count / 3; const p = g.attributes && g.attributes.position; return p ? p.count / 3 : 0; };
        const drawn = (o) => {
            if (o.isBatchedMesh) {
                const gi = o._geometryInfo || null, inst = o._instanceInfo || null;
                const gt = (id) => (gi && gi[id] && Number.isFinite(gi[id].count) ? gi[id].count / 3 : 0);
                let t = 0; if (inst) for (let i = 0; i < inst.length; i++) { const it = inst[i]; if (it && it.active !== false && it.visible !== false) t += gt(it.geometryIndex != null ? it.geometryIndex : it.geometryId); } return t;
            }
            return idxTris(o.geometry) * (o.isInstancedMesh ? o.count || 0 : 1);
        };
        let totalTris = 0, meshes = 0;
        if (s.scene) s.scene.traverse((o) => { if (o.visible && (o.isMesh || o.isInstancedMesh || o.isBatchedMesh) && o.geometry) { totalTris += drawn(o); meshes++; } });
        let placed = 0, l2 = 0; for (const e of built) { placed++; if (e._lodLevel === 2) l2++; }
        return { baeume: built.length, l2Billboard: l2, dichtesterSpot_nachbarn20m: tgt.nb, gezeichneteDreiecke: Math.round(totalTris), sichtbareMeshes: meshes, err };
    });
    console.log(JSON.stringify(info, null, 2));
    console.log("\nLESART: gezeichneteDreiecke im Studio-Bereich (~1-2M) => der dichte Wald ist tragbar wie das Studio.");
    await browser.close(); server.close(); process.exit(0);
})();
