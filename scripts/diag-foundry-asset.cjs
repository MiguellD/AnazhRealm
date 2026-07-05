// DER SCHOEPFER-WEG: liefert das STUDIO (Portal, ?asset-foundry=1) sein ECHTES Eiche-Asset
// (Skelett+Rinde+Blaetter+WURZELN+TOTE AESTE) an AnazhRealm? Bootet AnazhRealm, wartet auf die
// Foundry-Bruecke, fordert ein eiche-L0-Asset an, zieht die zurueckgelieferten Geometrie-Puffer
// in einen WebGL-Renderer (mein Renderer-Fix) + screenshottet. So SEHE ich das AUSGELESENE Asset.
const puppeteer = require("puppeteer");
const http = require("http");
const fs = require("fs");
const path = require("path");
const PORT = 4482;
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
    await page.setViewport({ width: 900, height: 700 });
    page.on("pageerror", (e) => console.log("[PAGE-ERROR]", (e.stack || e.message).split("\n")[0]));
    page.on("console", (m) => { const t = m.text(); if (/phyto|foundry|asset/i.test(t)) console.log("[BROWSER]", t.slice(0, 120)); });
    await page.goto(`http://127.0.0.1:${PORT}/index.html`, { waitUntil: "domcontentloaded", timeout: 30000 });

    const out = await page.evaluate(async (W) => {
        // Warmup: main-Renderer stubben (Welt-Crash vermeiden), aber NICHT null -> Foundry bleibt an.
        let stubbed = false; const start = performance.now();
        while (performance.now() - start < 45000) {
            const r = window.anazhRealm;
            if (r && !stubbed && r.state && r.state.renderer) { r.state.renderer.render = function () {}; if (r.state.renderer.renderAsync) r.state.renderer.renderAsync = () => Promise.resolve(); r.state.postProcessingFailed = true; stubbed = true; }
            if (r && typeof r._gameLoopTick === "function") { try { r._gameLoopTick(performance.now()); } catch (_e) {} if (r.state.blueprints && r.state.blueprints.baum_eiche) break; }
            await new Promise((res) => setTimeout(res, 5));
        }
        const r = window.anazhRealm; const T = window.THREE;
        const res = { enabled: r._foundryEnabled(), foundryReady: false, meshKinds: [], err: null, dataURL: null, totalVerts: 0, meshCount: 0 };
        try {
            const f = r._ensureAssetFoundry();
            if (!f) { res.err = "keine foundry"; return res; }
            // Auf ready warten (Studio-iframe laedt phytogenesis.js foundry-mode + postet ready).
            const t0 = performance.now();
            while (!f.ready && performance.now() - t0 < 30000) await new Promise((res2) => setTimeout(res2, 100));
            res.foundryReady = !!f.ready;
            if (!f.ready) { res.err = "foundry nicht ready (Studio-iframe)"; return res; }
            // Das echte Eiche-Asset (L0) aus dem Studio anfordern.
            const meshes = await r._foundryRequest("eiche", 12345, 0, "summer");
            if (!meshes || !meshes.length) { res.err = "leeres Asset (" + (meshes ? meshes.length : "null") + ")"; return res; }
            res.meshCount = meshes.length;
            res.meshKinds = meshes.map((m) => m.kind + ":" + (m.position ? m.position.array.length / 3 : 0));
            // In WebGL rendern (mein Renderer-Fix).
            const cv = document.createElement("canvas"); cv.width = W; cv.height = W;
            const gl = new T.WebGLRenderer({ canvas: cv, antialias: true, preserveDrawingBuffer: true });
            gl.setSize(W, W, false); gl.setClearColor(0xbcd2e0, 1);
            if (T.ACESFilmicToneMapping) { gl.toneMapping = T.ACESFilmicToneMapping; gl.toneMappingExposure = 1.0; }
            if (T.SRGBColorSpace) gl.outputColorSpace = T.SRGBColorSpace;
            const sc = new T.Scene();
            sc.add(new T.HemisphereLight(0xdfeecc, 0x463c2e, 0.55));
            const key = new T.DirectionalLight(0xfff0d8, 2.4); key.position.set(5, 8, 4); sc.add(key);
            const rim = new T.DirectionalLight(0xaaccff, 0.45); rim.position.set(-4, 3, -5); sc.add(rim);
            const back = new T.DirectionalLight(0xffd8a0, 0.5); back.position.set(2, 4, -4); sc.add(back);
            const grp = new T.Group();
            for (const m of meshes) {
                if (!m.position) continue;
                res.totalVerts += m.position.array.length / 3;
                const g = new T.BufferGeometry();
                g.setAttribute("position", new T.BufferAttribute(new Float32Array(m.position.array), m.position.itemSize || 3));
                if (m.color) g.setAttribute("color", new T.BufferAttribute(new Float32Array(m.color.array), m.color.itemSize || 3));
                if (m.normal) g.setAttribute("normal", new T.BufferAttribute(new Float32Array(m.normal.array), m.normal.itemSize || 3)); else g.computeVertexNormals();
                if (m.index) g.setIndex(new T.BufferAttribute(new Uint32Array(m.index), 1));
                const hasCol = !!m.color;
                const mat = new T.MeshStandardMaterial({ vertexColors: hasCol, color: hasCol ? 0xffffff : (m.kind === "foliage" ? 0x4a7a2c : 0x6a5030), side: T.DoubleSide, roughness: 0.86, metalness: 0 });
                grp.add(new T.Mesh(g, mat));
            }
            sc.add(grp);
            const box = new T.Box3().setFromObject(grp); const ctr = box.getCenter(new T.Vector3()); const sz = box.getSize(new T.Vector3());
            const ground = new T.Mesh(new T.CircleGeometry(Math.max(sz.x, sz.z) * 0.8, 32).rotateX(-Math.PI / 2), new T.MeshStandardMaterial({ color: 0x5a6a3a, roughness: 1 }));
            ground.position.set(ctr.x, box.min.y, ctr.z); sc.add(ground);
            const cam = new T.PerspectiveCamera(40, 1, 0.05, 500); const d = Math.max(sz.x, sz.y, sz.z) * 1.9 + 1;
            cam.position.set(ctr.x + d * 0.75, box.min.y + sz.y * 0.5, ctr.z + d * 0.55); cam.lookAt(ctr.x, ctr.y, ctr.z);
            gl.render(sc, cam);
            res.dataURL = cv.toDataURL("image/png");
        } catch (e) { res.err = String((e && e.stack) || e); }
        return res;
    }, 640);
    console.log("Foundry:", JSON.stringify({ enabled: out.enabled, ready: out.foundryReady, meshCount: out.meshCount, totalVerts: out.totalVerts, kinds: out.meshKinds, err: out.err }));
    if (out.dataURL) { fs.writeFileSync(path.join(ART, "foundry-eiche.png"), Buffer.from(out.dataURL.replace(/^data:image\/png;base64,/, ""), "base64")); console.log("-> artifacts/foundry-eiche.png"); }
    await browser.close(); server.close(); process.exit(out.dataURL ? 0 : 1);
})();
