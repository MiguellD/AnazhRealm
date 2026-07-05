// PRUEFT: kommen L0 · L1 · L2 ALLE aus dem Studio (kein Renderer noetig)? Rendert Eiche + Fichte
// je bei L0/L1/L2 aus der Foundry (6 Zellen) via WebGL-Offscreen. Die Studio-LODs sind reine
// Geometrie (Segment-Cut + Blatt-Stride) -> die Foundry liefert alle drei ohne GPU-Renderer.
const puppeteer = require("puppeteer");
const http = require("http");
const fs = require("fs");
const path = require("path");
const PORT = 4484;
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
    await page.goto(`http://127.0.0.1:${PORT}/index.html`, { waitUntil: "domcontentloaded", timeout: 30000 });

    const out = await page.evaluate(async (CELL) => {
        let stubbed = false; const start = performance.now();
        while (performance.now() - start < 45000) {
            const r = window.anazhRealm;
            if (r && !stubbed && r.state && r.state.renderer) { r.state.renderer.render = function () {}; if (r.state.renderer.renderAsync) r.state.renderer.renderAsync = () => Promise.resolve(); r.state.postProcessingFailed = true; stubbed = true; }
            if (r && typeof r._gameLoopTick === "function") { try { r._gameLoopTick(performance.now()); } catch (_e) {} if (r.state.blueprints && r.state.blueprints.baum_eiche) break; }
            await new Promise((res) => setTimeout(res, 5));
        }
        const r = window.anazhRealm; const T = window.THREE;
        const res = { rows: [], err: null, dataURL: null };
        const f = r._ensureAssetFoundry(); const t0 = performance.now();
        while (f && !f.ready && performance.now() - t0 < 30000) await new Promise((r2) => setTimeout(r2, 100));
        if (!f || !f.ready) { res.err = "foundry nicht ready"; return res; }

        const SPECIES = ["eiche", "fichte"]; const COLS = 3, ROWS = SPECIES.length, W = COLS * CELL, H = ROWS * CELL;
        const cv = document.createElement("canvas"); cv.width = W; cv.height = H;
        const gl = new T.WebGLRenderer({ canvas: cv, antialias: true, preserveDrawingBuffer: true });
        gl.setSize(W, H, false); gl.setScissorTest(true); gl.autoClear = false;
        if (T.ACESFilmicToneMapping) { gl.toneMapping = T.ACESFilmicToneMapping; gl.toneMappingExposure = 1.0; }
        if (T.SRGBColorSpace) gl.outputColorSpace = T.SRGBColorSpace;
        const mkScene = () => { const sc = new T.Scene(); sc.add(new T.HemisphereLight(0xdfeecc, 0x463c2e, 0.6)); const k = new T.DirectionalLight(0xfff0d8, 2.2); k.position.set(5, 8, 4); sc.add(k); const b = new T.DirectionalLight(0xffd8a0, 0.5); b.position.set(2, 4, -4); sc.add(b); return sc; };
        const build = (meshes) => { const grp = new T.Group(); for (const m of meshes || []) { if (!m.position) continue; const g = new T.BufferGeometry(); g.setAttribute("position", new T.BufferAttribute(new Float32Array(m.position.array), m.position.itemSize || 3)); if (m.color) g.setAttribute("color", new T.BufferAttribute(new Float32Array(m.color.array), 3)); if (m.normal) g.setAttribute("normal", new T.BufferAttribute(new Float32Array(m.normal.array), 3)); else g.computeVertexNormals(); if (m.index) g.setIndex(new T.BufferAttribute(new Uint32Array(m.index), 1)); const hc = !!m.color; grp.add(new T.Mesh(g, new T.MeshStandardMaterial({ vertexColors: hc, color: hc ? 0xffffff : 0x4a7a2c, side: T.DoubleSide, roughness: 0.86, metalness: 0 }))); } return grp; };
        const vsum = (m) => (m || []).reduce((a, x) => a + (x.position ? x.position.array.length / 3 : 0), 0);
        gl.setViewport(0, 0, W, H); gl.setScissor(0, 0, W, H); gl.setClearColor(0xbcd2e0, 1); gl.clear(true, true, true);

        for (let si = 0; si < SPECIES.length; si++) {
            const sp = SPECIES[si]; const vv = [];
            for (let lod = 0; lod < 3; lod++) {
                const meshes = await r._foundryRequest(sp, 12345, lod, "summer"); vv.push(vsum(meshes));
                const sc = mkScene(); const grp = build(meshes); sc.add(grp);
                const box = new T.Box3().setFromObject(grp); if (box.isEmpty()) continue;
                const ctr = box.getCenter(new T.Vector3()), sz = box.getSize(new T.Vector3());
                const cam = new T.PerspectiveCamera(42, 1, 0.02, 500); const d = Math.max(sz.x, sz.y, sz.z) * 1.9 + 0.5;
                cam.position.set(ctr.x + d * 0.7, box.min.y + sz.y * 0.55, ctr.z + d * 0.6); cam.lookAt(ctr.x, ctr.y, ctr.z);
                const x = lod * CELL, y = H - (si + 1) * CELL;
                gl.setViewport(x, y, CELL, CELL); gl.setScissor(x, y, CELL, CELL); gl.setClearColor(0xbcd2e0, 1); gl.clear(true, true, false); gl.render(sc, cam);
            }
            res.rows.push({ sp, L0: vv[0], L1: vv[1], L2: vv[2] });
        }
        try { res.dataURL = cv.toDataURL("image/png"); } catch (e) { res.err = String(e && e.message); }
        return res;
    }, 300);

    for (const row of out.rows) console.log(row.sp.padEnd(8) + " L0=" + row.L0 + " L1=" + row.L1 + " L2=" + row.L2);
    if (out.err) console.log("ERR:", out.err);
    if (out.dataURL) { fs.writeFileSync(path.join(ART, "foundry-lods.png"), Buffer.from(out.dataURL.replace(/^data:image\/png;base64,/, ""), "base64")); console.log("-> artifacts/foundry-lods.png (Zeilen: eiche/fichte · Spalten: L0/L1/L2)"); }
    await browser.close(); server.close(); process.exit(out.dataURL ? 0 : 1);
})();
