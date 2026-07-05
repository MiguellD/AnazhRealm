// PRUEFT ALLE ASSET-GRUPPEN + ALLE LODs: fordert jedes Studio-Preset (7 Baeume · Blume · Gras ·
// 6 Felsen/Kristall) bei L0/L1/L2 aus der Foundry an, misst die Vert-Zahl je LOD (muss fallen),
// und rendert eine KONTAKT-BOGEN-Grid (alle Gruppen bei L0) via WebGL-Offscreen — so SEHE ich alles.
const puppeteer = require("puppeteer");
const http = require("http");
const fs = require("fs");
const path = require("path");
const PORT = 4483;
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
        const PRESETS = ["eiche","fichte","birke","weide","mammut","tanne","strauch","blume","gras","findling","basalt","sediment","zacken","geroell","kristalle"];
        const res = { table: [], err: null, dataURL: null };
        const f = r._ensureAssetFoundry();
        const t0 = performance.now();
        while (f && !f.ready && performance.now() - t0 < 30000) await new Promise((r2) => setTimeout(r2, 100));
        if (!f || !f.ready) { res.err = "foundry nicht ready"; return res; }

        const COLS = 5, ROWS = 3, W = COLS * CELL, H = ROWS * CELL;
        const cv = document.createElement("canvas"); cv.width = W; cv.height = H;
        const gl = new T.WebGLRenderer({ canvas: cv, antialias: true, preserveDrawingBuffer: true });
        gl.setSize(W, H, false); gl.setScissorTest(true);
        if (T.ACESFilmicToneMapping) { gl.toneMapping = T.ACESFilmicToneMapping; gl.toneMappingExposure = 1.0; }
        if (T.SRGBColorSpace) gl.outputColorSpace = T.SRGBColorSpace;
        const mkScene = () => { const sc = new T.Scene(); sc.add(new T.HemisphereLight(0xdfeecc, 0x463c2e, 0.6)); const k = new T.DirectionalLight(0xfff0d8, 2.2); k.position.set(5, 8, 4); sc.add(k); const b = new T.DirectionalLight(0xffd8a0, 0.5); b.position.set(2, 4, -4); sc.add(b); const rm = new T.DirectionalLight(0xaaccff, 0.4); rm.position.set(-4, 3, -5); sc.add(rm); return sc; };

        const buildGroup = (meshes) => {
            const grp = new T.Group();
            for (const m of meshes || []) {
                if (!m.position) continue;
                const g = new T.BufferGeometry();
                g.setAttribute("position", new T.BufferAttribute(new Float32Array(m.position.array), m.position.itemSize || 3));
                if (m.color) g.setAttribute("color", new T.BufferAttribute(new Float32Array(m.color.array), m.color.itemSize || 3));
                if (m.normal) g.setAttribute("normal", new T.BufferAttribute(new Float32Array(m.normal.array), m.normal.itemSize || 3)); else g.computeVertexNormals();
                if (m.index) g.setIndex(new T.BufferAttribute(new Uint32Array(m.index), 1));
                const hasCol = !!m.color;
                const mat = new T.MeshStandardMaterial({ vertexColors: hasCol, color: hasCol ? 0xffffff : 0x8a8278, side: T.DoubleSide, roughness: 0.85, metalness: 0 });
                grp.add(new T.Mesh(g, mat));
            }
            return grp;
        };
        const vsum = (meshes) => (meshes || []).reduce((a, m) => a + (m.position ? m.position.array.length / 3 : 0), 0);

        for (let i = 0; i < PRESETS.length; i++) {
            const id = PRESETS[i];
            let v0 = 0, v1 = 0, v2 = 0, kinds = "";
            try {
                const m0 = await r._foundryRequest(id, 12345, 0, "summer");
                const m1 = await r._foundryRequest(id, 12345, 1, "summer");
                const m2 = await r._foundryRequest(id, 12345, 2, "summer");
                v0 = vsum(m0); v1 = vsum(m1); v2 = vsum(m2);
                kinds = (m0 || []).map((x) => x.kind).join("+");
                res.table.push({ id, L0: v0, L1: v1, L2: v2, kinds, lodFalls: v0 >= v1 && v1 >= v2 });
                // Zelle rendern (L0).
                const col = i % COLS, row = (i / COLS) | 0;
                const sc = mkScene(); const grp = buildGroup(m0); sc.add(grp);
                const box = new T.Box3().setFromObject(grp);
                if (!box.isEmpty()) {
                    const ctr = box.getCenter(new T.Vector3()), sz = box.getSize(new T.Vector3());
                    const cam = new T.PerspectiveCamera(42, 1, 0.02, 500); const d = Math.max(sz.x, sz.y, sz.z) * 1.9 + 0.5;
                    cam.position.set(ctr.x + d * 0.7, box.min.y + sz.y * 0.55, ctr.z + d * 0.6); cam.lookAt(ctr.x, ctr.y, ctr.z);
                    const x = col * CELL, y = H - (row + 1) * CELL; // WebGL viewport: unten-links Ursprung
                    gl.setViewport(x, y, CELL, CELL); gl.setScissor(x, y, CELL, CELL); gl.setClearColor(0xbcd2e0, 1);
                    gl.autoClear = false; if (i === 0) gl.clear();
                    gl.clearColor && gl.setClearColor(0xbcd2e0, 1);
                    gl.clear(true, true, false); gl.render(sc, cam);
                }
            } catch (e) { res.table.push({ id, err: String(e && e.message || e) }); }
        }
        try { res.dataURL = cv.toDataURL("image/png"); } catch (e) { res.err = String(e && e.message); }
        return res;
    }, 256);

    console.log("LOD-Tabelle (Verts L0/L1/L2):");
    for (const row of out.table) {
        if (row.err) console.log("  " + row.id.padEnd(10) + " FEHLER: " + row.err);
        else console.log("  " + row.id.padEnd(10) + " L0=" + String(row.L0).padStart(6) + " L1=" + String(row.L1).padStart(6) + " L2=" + String(row.L2).padStart(5) + "  " + (row.lodFalls ? "LOD faellt ✓" : "LOD ✗") + "  [" + row.kinds + "]");
    }
    if (out.err) console.log("ERR:", out.err);
    if (out.dataURL) { fs.writeFileSync(path.join(ART, "foundry-all.png"), Buffer.from(out.dataURL.replace(/^data:image\/png;base64,/, ""), "base64")); console.log("-> artifacts/foundry-all.png"); }
    await browser.close(); server.close(); process.exit(out.dataURL ? 0 : 1);
})();
