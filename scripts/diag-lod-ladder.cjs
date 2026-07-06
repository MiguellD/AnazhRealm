// DIE LOD-LEITER (Schöpfer „läuft die pipeline nun? die bilder auswertbar?"). Dieselbe Studio-Eiche, durch
// die Pipeline bei LOD0 · LOD1 · LOD2 gezogen, nebeneinander gerendert (WebGL-Proxy der echten Foundry-
// Geometrie — der Weg, der nicht haengt). Jede Stufe mit ihrer Dreieckszahl beschriftet → auswertbar: das
// LOD produziert WIRKLICH leichtere Stufen (nah voll, fern billig), 1:1 wie das Studio. -> artifacts/lod-ladder.png
const puppeteer = require("puppeteer");
const http = require("http");
const fs = require("fs");
const path = require("path");
const PORT = 4537;
const root = path.resolve(__dirname, "..");
const ART = path.join(root, "artifacts");
const W = 300,
    H = 380;
const mime = {
    ".html": "text/html",
    ".js": "application/javascript",
    ".wasm": "application/wasm",
    ".json": "application/json",
    ".css": "text/css",
    ".png": "image/png",
    ".woff2": "font/woff2",
};
const server = http.createServer((req, res) => {
    let p = req.url.split("?")[0];
    if (p === "/") p = "/index.html";
    const fp = path.join(root, p);
    if (!fp.startsWith(root)) {
        res.statusCode = 403;
        return res.end();
    }
    fs.readFile(fp, (err, data) => {
        if (err) {
            res.statusCode = 404;
            return res.end();
        }
        res.setHeader("Content-Type", mime[path.extname(fp)] || "application/octet-stream");
        res.end(data);
    });
});
const GPU = [
    "--use-angle=swiftshader",
    "--enable-unsafe-swiftshader",
    "--enable-webgl",
    "--ignore-gpu-blocklist",
    "--no-sandbox",
    "--disable-setuid-sandbox",
];
(async () => {
    fs.mkdirSync(ART, { recursive: true });
    await new Promise((r) => server.listen(PORT, r));
    const browser = await puppeteer.launch({ headless: true, protocolTimeout: 600000, args: GPU });
    const page = await browser.newPage();
    await page.setViewport({ width: 3 * W + 16, height: H });
    page.on("pageerror", (e) => console.log("[ERR]", (e.stack || e.message).split("\n")[0]));
    page.on("console", (m) => {
        const t = m.text();
        if (/ladder|lod|tris/i.test(t)) console.log("[B]", t.slice(0, 120));
    });
    await page.goto(`http://127.0.0.1:${PORT}/index.html`, { waitUntil: "domcontentloaded", timeout: 30000 });
    const out = await page.evaluate(
        async (W, H) => {
            const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
            let stub = false;
            const s0 = performance.now();
            while (performance.now() - s0 < 45000) {
                const r = window.anazhRealm;
                if (r && !stub && r.state && r.state.renderer && !r.state.renderer._isHeadlessNull) {
                    r.state.renderer.render = function () {};
                    if (r.state.renderer.renderAsync) r.state.renderer.renderAsync = () => Promise.resolve();
                    r.state.postProcessingFailed = true;
                    r._bootWarmDone = true;
                    stub = true;
                }
                if (r && typeof r._gameLoopTick === "function") {
                    try {
                        r._gameLoopTick(performance.now());
                    } catch (_e) {}
                    if (r.state.blueprints && r.state.blueprints.baum_eiche) break;
                }
                await sleep(5);
            }
            const r = window.anazhRealm;
            const T = window.THREE;
            const f = r._ensureAssetFoundry();
            const t0 = performance.now();
            while (f && !f.ready && performance.now() - t0 < 30000) await sleep(100);
            if (!f || !f.ready) return { err: "foundry nicht ready" };
            // Dieselbe Eiche (fester Seed) bei LOD 0/1/2 ziehen.
            const barkN = r._foundryBarkNormalTexture ? r._foundryBarkNormalTexture() : null;
            const core = window.__phytoCore;
            const leafCanvas = core && core.bakeLeafAtlasCanvas ? core.bakeLeafAtlasCanvas(document, {}) : null;
            const buildTree = (meshes) => {
                const grp = new T.Group();
                let tris = 0;
                for (const m of meshes || []) {
                    if (!m.position) continue;
                    const g = new T.BufferGeometry();
                    g.setAttribute("position", new T.BufferAttribute(new Float32Array(m.position.array), 3));
                    if (m.color) g.setAttribute("color", new T.BufferAttribute(new Float32Array(m.color.array), 3));
                    if (m.normal) g.setAttribute("normal", new T.BufferAttribute(new Float32Array(m.normal.array), 3));
                    else g.computeVertexNormals();
                    if (m.uv) g.setAttribute("uv", new T.BufferAttribute(new Float32Array(m.uv.array), 2));
                    if (m.index) {
                        g.setIndex(new T.BufferAttribute(new Uint32Array(m.index), 1));
                        tris += m.index.length / 3;
                    } else tris += m.position.array.length / 9;
                    const mp = m.mat || {};
                    const isBark = m.kind === "bark" || m.kind === "stem";
                    const dbl = mp.side === 2 || m.kind === "foliage" || m.kind === "foliageTex" || m.kind === "grass";
                    const mat = new T.MeshStandardMaterial({
                        vertexColors: !!m.color,
                        roughness: typeof mp.roughness === "number" ? mp.roughness : isBark ? 0.93 : 0.62,
                        metalness: 0,
                        side: dbl ? T.DoubleSide : T.FrontSide,
                    });
                    if (isBark && barkN) {
                        mat.normalMap = barkN;
                        mat.normalScale = new T.Vector2(0.85, 0.85);
                    }
                    if (m.kind === "foliageTex" && leafCanvas) {
                        const tx = new T.CanvasTexture(leafCanvas);
                        tx.colorSpace = T.SRGBColorSpace;
                        mat.map = tx;
                        mat.alphaTest = mp.alphaTest > 0 ? mp.alphaTest : 0.5;
                    }
                    grp.add(new T.Mesh(g, mat));
                }
                return { grp, tris: Math.round(tris) };
            };
            const shots = [];
            // LOD0 + LOD1 = die Studio-GEOMETRIE (nah/mittel). LOD2 fuer Baeume ist KEINE Geometrie,
            // sondern das 2-Dreieck-BILLBOARD (`_buildImpostorCrossGeometry` = 1 Quad) mit dem Studio-
            // Atlas — genau was die Welt fern rendert. Also: lod 0/1 Geometrie, lod 2 die Atlas-Karte.
            for (const lod of [0, 1]) {
                const meshes = await r._foundryRequest("eiche", 12345, lod, "summer");
                const gl = new T.WebGLRenderer({ antialias: true, preserveDrawingBuffer: true });
                gl.setSize(W, H, false);
                if (T.ACESFilmicToneMapping) {
                    gl.toneMapping = T.ACESFilmicToneMapping;
                    gl.toneMappingExposure = 1.0;
                }
                if (T.SRGBColorSpace) gl.outputColorSpace = T.SRGBColorSpace;
                const sc = new T.Scene();
                sc.add(new T.HemisphereLight(0xdfeecc, 0x2a2a1a, 0.75));
                const kl = new T.DirectionalLight(0xfff2d9, 2.3);
                kl.position.set(6, 12, 5);
                sc.add(kl);
                let tris = 0;
                if (meshes && meshes.length) {
                    const bt = buildTree(meshes);
                    tris = bt.tris;
                    sc.add(bt.grp);
                }
                const box = new T.Box3().setFromObject(sc);
                const ctr = new T.Vector3();
                const sz = new T.Vector3();
                if (!box.isEmpty()) {
                    box.getCenter(ctr);
                    box.getSize(sz);
                }
                const md = Math.max(sz.x, sz.y, sz.z, 1);
                const cam = new T.PerspectiveCamera(42, W / H, 0.05, 2000);
                cam.position.set(ctr.x + md * 0.9, ctr.y + md * 0.15, ctr.z + md * 1.5);
                cam.lookAt(ctr.x, ctr.y, ctr.z);
                cam.updateMatrixWorld(true);
                gl.setClearColor(0xbcd2e0, 1);
                gl.clear();
                gl.render(sc, cam);
                const cv = document.createElement("canvas");
                cv.width = W;
                cv.height = H;
                cv.getContext("2d").drawImage(gl.domElement, 0, 0);
                shots.push({ lod, tris, dataURL: cv.toDataURL("image/png") });
                console.log("ladder lod" + lod + " tris=" + tris);
                gl.dispose();
            }
            // LOD2 = DAS ECHTE BILLBOARD: das Studio-Impostor-Atlas (8-View), eine Ansicht auf ein Quad =
            // 2 Dreiecke. Der Bake ist async → auf den Record warten, dann die Front-View-Zelle zeichnen.
            const variant = typeof r._foundryVariantFor === "function" ? r._foundryVariantFor(12345) : 1;
            let rec = r._foundryEnsureImpostorRecord("eiche", variant, "summer");
            const tb = performance.now();
            while (!rec && performance.now() - tb < 30000) {
                await sleep(200);
                rec = r._foundryEnsureImpostorRecord("eiche", variant, "summer");
            }
            const cv2 = document.createElement("canvas");
            cv2.width = W;
            cv2.height = H;
            const c2 = cv2.getContext("2d");
            c2.fillStyle = "#bcd2e0";
            c2.fillRect(0, 0, W, H);
            let billboardOk = false;
            if (rec && rec.map && rec.map.image && rec.frame) {
                const atlas = rec.map.image; // cw·V × ch (8 Ansichten horizontal)
                const V = rec.views || 8;
                const cw = Math.floor(atlas.width / V);
                const ch = atlas.height;
                // Aspekt aus dem Bake-Rahmen (halfW·2 / totalH), damit die Karte nicht verzerrt.
                const totalH = rec.frame.totalH || ch;
                const halfW = rec.frame.halfW || cw / 2;
                const aspect = (halfW * 2) / totalH;
                const drawH = H * 0.9;
                const drawW = drawH * aspect;
                const dx = (W - drawW) / 2;
                const dy = (H - drawH) / 2;
                // EINE Ansicht (Front, view 0) auf das Quad — genau was das 2-Tri-Billboard traegt.
                c2.drawImage(atlas, 0, 0, cw, ch, dx, dy, drawW, drawH);
                billboardOk = true;
            }
            shots.push({ lod: 2, tris: 2, dataURL: cv2.toDataURL("image/png"), billboardOk });
            console.log("ladder lod2 BILLBOARD tris=2 ok=" + billboardOk);
            return { shots };
        },
        W,
        H
    );
    if (out.err) {
        console.log("FEHLER:", out.err);
        await browser.close();
        server.close();
        process.exit(1);
    }
    // Stitch
    const stitched = await page.evaluate(
        async (shots, W, H) => {
            const LBL = 26;
            const cv = document.createElement("canvas");
            cv.width = 3 * W + 16;
            cv.height = H + LBL;
            const ctx = cv.getContext("2d");
            ctx.fillStyle = "#111";
            ctx.fillRect(0, 0, cv.width, cv.height);
            const load = (u) =>
                new Promise((res) => {
                    const im = new Image();
                    im.onload = () => res(im);
                    im.onerror = () => res(null);
                    im.src = u;
                });
            const labels = [
                "LOD0 — nah (volle Studio-Geometrie)",
                "LOD1 — Mittelgrund",
                "LOD2 — Ferne (Billboard-Stufe)",
            ];
            for (let i = 0; i < shots.length; i++) {
                const im = await load(shots[i].dataURL);
                const x = i * (W + 8);
                if (im) ctx.drawImage(im, 0, 0, im.width, im.height, x, LBL, W, H);
                ctx.fillStyle = "#fff";
                ctx.font = "12px sans-serif";
                ctx.fillText(labels[i] + "  ·  " + shots[i].tris.toLocaleString() + " Dreiecke", x + 4, 17);
            }
            return cv.toDataURL("image/png");
        },
        out.shots,
        W,
        H
    );
    fs.writeFileSync(
        path.join(ART, "lod-ladder.png"),
        Buffer.from(stitched.replace(/^data:image\/png;base64,/, ""), "base64")
    );
    console.log("-> artifacts/lod-ladder.png");
    await browser.close();
    server.close();
    process.exit(0);
})();
