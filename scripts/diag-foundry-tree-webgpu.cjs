// DER EHRLICHE TEST: rendert EINEN Foundry-Baum mit AnazhRealms ECHTEM `_foundryTreeMaterial` auf
// dem ECHTEN WebGPU-Renderer (RenderTarget + readback, wie der Impostor-Bake — leicht genug, kein
// Voll-Welt-Tod). So SEHE ich, ob das Studio-Asset in AnazhRealms Material schoen rendert oder als
// blasse flache Bretter. -> artifacts/foundry-tree-webgpu.png
const puppeteer = require("puppeteer");
const http = require("http");
const fs = require("fs");
const path = require("path");
const PORT = 4497;
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
    await page.setViewport({ width: 700, height: 700 });
    page.on("pageerror", (e) => console.log("[PAGE-ERROR]", (e.stack || e.message).split("\n")[0]));
    await page.goto(`http://127.0.0.1:${PORT}/index.html`, { waitUntil: "domcontentloaded", timeout: 30000 });

    const out = await page.evaluate(async () => {
        const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
        let stub = false; const s = performance.now();
        while (performance.now() - s < 45000) {
            const r = window.anazhRealm;
            // Loop-Render stubben (kein Voll-Welt-Render), aber der ECHTE WebGPU-Renderer bleibt fuer RTT.
            if (r && !stub && r.state && r.state.renderer) { r.state.renderer.render = function () {}; if (r.state.renderer.renderAsync) r.state.renderer.renderAsync = () => Promise.resolve(); r.state.postProcessingFailed = true; stub = true; }
            if (r && typeof r._gameLoopTick === "function") { try { r._gameLoopTick(performance.now()); } catch (_e) {} if (r.state.blueprints && r.state.blueprints.baum_eiche) break; }
            await sleep(5);
        }
        const r = window.anazhRealm; const T = window.THREE; const res = { err: null };
        const rend = r.state.renderer;
        res.rendererIsNull = !!(rend && rend._isHeadlessNull);
        const f = r._ensureAssetFoundry(); const t0 = performance.now();
        while (f && !f.ready && performance.now() - t0 < 30000) await sleep(100);
        if (!f || !f.ready) { res.err = "foundry nicht ready"; return res; }
        // Das ECHTE eiche-L0-Asset holen + mit AnazhRealms _foundryTreeMaterial bauen (der reale Pfad).
        const meshes = await r._foundryRequest("eiche", 12345, 0, "summer");
        if (!meshes || !meshes.length) { res.err = "leeres Asset"; return res; }
        const grp = r._foundryBuildGroup(meshes); // baut _foundryTreeMaterial (WebGPU NodeMaterial)
        if (!grp) { res.err = "kein group"; return res; }
        res.meshKinds = grp.children.map((c) => (c.material && c.material.userData && c.material.userData.foundryKind) || "?");
        // Szene + Licht (AnazhRealm-nah: Hemi + Key). Kamera auf den Baum gerahmt.
        const sc = new T.Scene();
        sc.add(new T.HemisphereLight(0xdfeecc, 0x2a2a1a, 0.7));
        const key = new T.DirectionalLight(0xfff2d9, 2.2); key.position.set(6, 10, 5); sc.add(key);
        sc.add(grp);
        const box = new T.Box3().setFromObject(grp); const ctr = box.getCenter(new T.Vector3()); const sz = box.getSize(new T.Vector3());
        const cam = new T.PerspectiveCamera(42, 1, 0.05, 500); const d = Math.max(sz.x, sz.y, sz.z) * 1.6 + 2;
        cam.position.set(ctr.x + d * 0.6, box.min.y + sz.y * 0.55, ctr.z + d * 0.7); cam.lookAt(ctr.x, ctr.y, ctr.z);
        // WebGPU-RTT + readback (wie der Impostor-Bake).
        const W = 640;
        const rt = new T.RenderTarget(W, W, { depthBuffer: true });
        try {
            rend.setRenderTarget(rt); rend.setClearColor(0xbcd2e0, 1);
            await rend.renderAsync(sc, cam);
            const buf = await rend.readRenderTargetPixelsAsync(rt, 0, 0, W, W);
            rend.setRenderTarget(null);
            // pixels -> canvas (bottom-up flip)
            const cv = document.createElement("canvas"); cv.width = W; cv.height = W;
            const ctx = cv.getContext("2d"); const img = ctx.createImageData(W, W); const rowB = W * 4;
            for (let y = 0; y < W; y++) { const srcr = (W - 1 - y) * rowB, dstr = y * rowB; for (let i = 0; i < rowB; i++) img.data[dstr + i] = buf[srcr + i]; }
            ctx.putImageData(img, 0, 0);
            // Nicht-Hintergrund-Pixel zaehlen (Sanity).
            let nonBg = 0; for (let i = 0; i < buf.length; i += 4) { if (Math.abs(buf[i] - 0xbc) > 24 || Math.abs(buf[i + 1] - 0xd2) > 24) nonBg++; }
            res.nonBgPx = nonBg; res.totalPx = buf.length / 4;
            res.dataURL = cv.toDataURL("image/png");
        } catch (e) { res.err = "RTT/readback: " + String(e && e.message || e); }
        return res;
    });

    const { dataURL, ...meta } = out;
    console.log(JSON.stringify(meta, null, 2));
    if (dataURL) { fs.writeFileSync(path.join(ART, "foundry-tree-webgpu.png"), Buffer.from(dataURL.replace(/^data:image\/png;base64,/, ""), "base64")); console.log("-> artifacts/foundry-tree-webgpu.png"); }
    await browser.close(); server.close();
    process.exit(dataURL ? 0 : 1);
})();
