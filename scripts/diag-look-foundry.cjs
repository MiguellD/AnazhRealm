// EHRLICHER LOOK: rendert die HAUPTWELT (echter WebGPU-Renderer) MIT geladenen Foundry-Baeumen +
// meldet, WAS zu sehen ist (foundry ready? wieviele Baeume instFoundry vs klassisch?). So weiss ich,
// ob die kaputten Bretter die Foundry-Baeume ODER die alten Klassik-Baeume sind — der Schoepfer-Weg:
// erst SEHEN + MESSEN, dann heilen. Screenshot in artifacts/look-foundry-main.png.
const puppeteer = require("puppeteer");
const http = require("http");
const fs = require("fs");
const path = require("path");
const PORT = 4496;
const root = path.resolve(__dirname, "..");
const ART = path.join(root, "artifacts");
const mime = { ".html": "text/html", ".js": "application/javascript", ".wasm": "application/wasm", ".json": "application/json", ".css": "text/css", ".png": "image/png" };
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
    await page.setViewport({ width: 900, height: 600 });
    page.on("pageerror", (e) => console.log("[PAGE-ERROR]", (e.stack || e.message).split("\n")[0]));
    await page.goto(`http://127.0.0.1:${PORT}/index.html`, { waitUntil: "domcontentloaded", timeout: 30000 });

    // WARMUP (Render gestubt, aber echter Renderer bleibt -> Foundry an), Welt + Foundry laden lassen.
    const info = await page.evaluate(async () => {
        const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
        let stubbed = false; const start = performance.now();
        while (performance.now() - start < 60000) {
            const r = window.anazhRealm;
            if (r && !stubbed && r.state && r.state.renderer) { window.__origRender = r.state.renderer.render.bind(r.state.renderer); r.state.renderer.render = function () {}; if (r.state.renderer.renderAsync) r.state.renderer.renderAsync = () => Promise.resolve(); r.state.postProcessingFailed = true; stubbed = true; }
            if (r && typeof r._gameLoopTick === "function") { try { r._gameLoopTick(performance.now()); } catch (_e) {} if (r.state.voxelChunks && r.state.voxelChunks.size >= 12) break; }
            await sleep(4);
        }
        const r = window.anazhRealm;
        const f = r._ensureAssetFoundry(); const t0 = performance.now();
        while (f && !f.ready && performance.now() - t0 < 30000) await sleep(100);
        const o = { foundryReady: !!(f && f.ready) };
        // Spieler auf Land nahe Ursprung, klaren Mittag.
        const pm = r.state.playerMesh && r.state.playerMesh.position;
        if (pm) pm.set(0, (r._voxelSurfaceY ? r._voxelSurfaceY(0, 0) : 20) + 1.6, 0);
        if (r.setTimeOfDay) try { r.setTimeOfDay(0.5); } catch (_e) {}
        r.state.architectureCullingRadius = Math.max(200, r.state.architectureCullingRadius || 200);
        // Foundry-Baum-Varianten direkt vor den Spieler pflanzen (nah = L0/L1 Studio-Geometrie).
        const arts = ["baum_eiche", "baum_fichte", "baum_birke", "baum_weide", "baum_mammut", "baum_tanne"];
        for (let i = 0; i < arts.length; i++) {
            const gk = r._growTreeBlueprintForSpawn(arts[i], `look|${arts[i]}|0,0`);
            const type = gk && r.state.blueprints[gk] && r.state.blueprints[gk]._isGrown ? gk : arts[i];
            const ang = (i / arts.length) * Math.PI * 2, dist = 6 + i;
            const px = Math.cos(ang) * dist, pz = Math.sin(ang) * dist - 10; // vor dem Blick (−z)
            const sy = (r._voxelSurfaceY ? r._voxelSurfaceY(px, pz) : 20) + 0.5;
            r.spawnArchitecture(type, { x: px, y: sy, z: pz }, { seed: 100 + i, silent: true, rotationY: ang });
        }
        // Ticken bis die Foundry-Assets ankommen + platziert sind (echte Zeit).
        for (let it = 0; it < 500; it++) {
            r.state._frameOverBudget = false;
            try { r.tickArchitectureCulling(); r._gameLoopTick && r._gameLoopTick(performance.now()); } catch (_e) {}
            await sleep(20);
            const archs = r.state.architectures || [];
            const done = archs.filter((e) => e && r._foundryPresetForEntry && r._foundryPresetForEntry(e) && e.instFoundry).length;
            if (done >= 6) break;
        }
        const archs = r.state.architectures || [];
        o.treesTotal = archs.filter((e) => e && r._foundryPresetForEntry && r._foundryPresetForEntry(e)).length;
        o.treesFoundry = archs.filter((e) => e && r._foundryPresetForEntry && r._foundryPresetForEntry(e) && e.instFoundry).length;
        o.treesClassic = archs.filter((e) => e && r._foundryPresetForEntry && r._foundryPresetForEntry(e) && !e.instFoundry && (e.instanced || e.mesh)).length;
        // Kamera waagrecht in den Baum-Ring blicken (−z).
        if (r.state.camera) { r.state.camera.position.set(0, (pm ? pm.y : 20), 0); r.state.camera.lookAt(0, (pm ? pm.y : 20) - 0.2, -12); }
        return o;
    });

    // UI/Avatar aus, echten Renderer zurueck, ein paar Frames rendern, Screenshot.
    await page.evaluate(async () => {
        const r = window.anazhRealm;
        const cv = document.querySelector("canvas");
        for (const el of Array.from(document.body.children)) if (el !== cv && el.tagName !== "SCRIPT") el.style.display = "none";
        if (r && r.state && r.state.playerMesh) r.state.playerMesh.visible = false;
        if (window.__origRender && r.state.renderer) r.state.renderer.render = window.__origRender;
        const sleep = (ms) => new Promise((res) => setTimeout(res, ms));
        for (let i = 0; i < 8; i++) { try { r._gameLoopTick && r._gameLoopTick(performance.now()); } catch (_e) {} await sleep(80); }
    });
    await page.screenshot({ path: path.join(ART, "look-foundry-main.png"), fullPage: false });
    console.log(JSON.stringify(info, null, 2));
    console.log("-> artifacts/look-foundry-main.png");
    await browser.close(); server.close();
})();
