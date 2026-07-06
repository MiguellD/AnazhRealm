// DER EHRLICHE VERGLEICH (Schöpfer-Wunsch): rendert jedes Asset ZWEIMAL nebeneinander —
// LINKS aus dem STUDIO (phytogenesis.js, mit SEINEN echten Materialien, offscreen WebGL) und
// RECHTS durch AnazhRealms Pipeline (Foundry-Geometrie + die geflossenen Material-Regler, dieselbe
// Kamera). Beide WebGL → beide im Container renderbar. Sind sie identisch, ist die Übersetzung
// bewiesen. -> artifacts/foundry-compare.png (Zeilen: eiche/findling/kristalle/blume · Spalten: Studio | AnazhRealm)
const puppeteer = require("puppeteer");
const http = require("http");
const fs = require("fs");
const path = require("path");
const PORT = 4499;
const root = path.resolve(__dirname, "..");
const ART = path.join(root, "artifacts");
const mime = {
    ".html": "text/html",
    ".js": "application/javascript",
    ".wasm": "application/wasm",
    ".json": "application/json",
    ".css": "text/css",
    ".png": "image/png",
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
(async () => {
    fs.mkdirSync(ART, { recursive: true });
    await new Promise((r) => server.listen(PORT, r));
    const browser = await puppeteer.launch({
        headless: true,
        protocolTimeout: 600000,
        args: [
            "--use-angle=swiftshader",
            "--enable-unsafe-swiftshader",
            "--enable-webgl",
            "--ignore-gpu-blocklist",
            "--no-sandbox",
            "--disable-setuid-sandbox",
        ],
    });
    const page = await browser.newPage();
    await page.setViewport({ width: 900, height: 900 });
    page.on("pageerror", (e) => console.log("[PAGE-ERROR]", (e.stack || e.message).split("\n")[0]));
    page.on("console", (m) => {
        const t = m.text();
        if (/render-native|phyto/i.test(t)) console.log("[BROWSER]", t.slice(0, 120));
    });
    await page.goto(`http://127.0.0.1:${PORT}/index.html`, { waitUntil: "domcontentloaded", timeout: 30000 });

    const out = await page.evaluate(
        async (ASSETS) => {
            const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
            let stub = false;
            const s0 = performance.now();
            while (performance.now() - s0 < 45000) {
                const r = window.anazhRealm;
                if (r && !stub && r.state && r.state.renderer) {
                    r.state.renderer.render = function () {};
                    if (r.state.renderer.renderAsync) r.state.renderer.renderAsync = () => Promise.resolve();
                    r.state.postProcessingFailed = true;
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
            const res = { rows: [], err: null };
            const f = r._ensureAssetFoundry();
            const t0 = performance.now();
            while (f && !f.ready && performance.now() - t0 < 30000) await sleep(100);
            if (!f || !f.ready) {
                res.err = "foundry nicht ready";
                return res;
            }
            const W = 300;

            // Studio-nativ rendern (postMessage an die Foundry).
            const renderNative = (preset, seed, lod) =>
                new Promise((resolve) => {
                    const rid = "rn_" + preset + "_" + seed;
                    const onMsg = (ev) => {
                        if (ev.source !== f.iframe.contentWindow) return;
                        const m = ev.data;
                        if (m && m.type === "render-native" && m.reqId === rid) {
                            window.removeEventListener("message", onMsg);
                            resolve(m.payload || null);
                        }
                    };
                    window.addEventListener("message", onMsg);
                    f.iframe.contentWindow.postMessage(
                        { type: "render-native", reqId: rid, presetId: preset, seed, lod, size: W, season: "summer" },
                        "*"
                    );
                    setTimeout(() => {
                        window.removeEventListener("message", onMsg);
                        resolve(null);
                    }, 40000);
                });

            // AnazhRealm-Seite: Foundry-Geometrie + MeshStandard aus den GEFLOSSENEN Reglern (WebGL-Proxy
            // fuer AnazhRealms NodeMaterial — gleiche PBR-Regler → gleicher Look). Bark-Normalmap = die
            // in AnazhRealm portierte Studio-Textur.
            const barkN = r._foundryBarkNormalTexture ? r._foundryBarkNormalTexture() : null;
            const core = window.__phytoCore;
            const leafCanvas =
                core && core.bakeLeafAtlasCanvas ? core.bakeLeafAtlasCanvas(document, { cell3: "needle" }) : null;
            const buildAnazh = (meshes) => {
                const grp = new T.Group();
                for (const m of meshes || []) {
                    if (!m.position) continue;
                    const g = new T.BufferGeometry();
                    g.setAttribute("position", new T.BufferAttribute(new Float32Array(m.position.array), 3));
                    if (m.color) g.setAttribute("color", new T.BufferAttribute(new Float32Array(m.color.array), 3));
                    if (m.normal) g.setAttribute("normal", new T.BufferAttribute(new Float32Array(m.normal.array), 3));
                    else g.computeVertexNormals();
                    if (m.uv) g.setAttribute("uv", new T.BufferAttribute(new Float32Array(m.uv.array), 2));
                    if (m.index) g.setIndex(new T.BufferAttribute(new Uint32Array(m.index), 1));
                    const mp = m.mat || {};
                    const isBark = m.kind === "bark" || m.kind === "stem";
                    const dbl = mp.side === 2 || m.kind === "foliage" || m.kind === "foliageTex" || m.kind === "grass";
                    const mat = new T.MeshStandardMaterial({
                        vertexColors: !!m.color,
                        roughness: typeof mp.roughness === "number" ? mp.roughness : isBark ? 0.93 : 0.62,
                        metalness: typeof mp.metalness === "number" ? mp.metalness : 0,
                        flatShading: !!mp.flatShading,
                        envMapIntensity: typeof mp.envMapIntensity === "number" ? mp.envMapIntensity : 1,
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
                return grp;
            };

            // Offscreen-WebGL fuer AnazhRealms Seite.
            const gl = new T.WebGLRenderer({ antialias: true, preserveDrawingBuffer: true });
            gl.setSize(W, W, false);
            if (T.ACESFilmicToneMapping) {
                gl.toneMapping = T.ACESFilmicToneMapping;
                gl.toneMappingExposure = 1.0;
            }
            if (T.SRGBColorSpace) gl.outputColorSpace = T.SRGBColorSpace;
            const renderAnazh = (meshes, camPos, camLook) => {
                const sc = new T.Scene();
                sc.add(new T.HemisphereLight(0xdfeecc, 0x2a2a1a, 0.7));
                const kl = new T.DirectionalLight(0xfff2d9, 2.2);
                kl.position.set(6, 10, 5);
                sc.add(kl);
                const grp = buildAnazh(meshes);
                sc.add(grp);
                const cam = new T.PerspectiveCamera(42, 1, 0.05, 500);
                cam.position.set(camPos[0], camPos[1], camPos[2]);
                cam.lookAt(camLook[0], camLook[1], camLook[2]);
                gl.setRenderTarget(null);
                gl.setClearColor(0xbcd2e0, 1);
                gl.clear();
                gl.render(sc, cam);
                const cv = document.createElement("canvas");
                cv.width = W;
                cv.height = W;
                cv.getContext("2d").drawImage(gl.domElement, 0, 0);
                return cv;
            };
            // Studio-Pixel (bottom-up) -> canvas (flip).
            const nativeToCanvas = (payload) => {
                const cv = document.createElement("canvas");
                cv.width = payload.W;
                cv.height = payload.W;
                const ctx = cv.getContext("2d");
                const img = ctx.createImageData(payload.W, payload.W);
                const rowB = payload.W * 4;
                for (let y = 0; y < payload.W; y++) {
                    const src = (payload.W - 1 - y) * rowB,
                        dst = y * rowB;
                    for (let i = 0; i < rowB; i++) img.data[dst + i] = payload.pixels[src + i];
                }
                ctx.putImageData(img, 0, 0);
                return cv;
            };

            const COLS = 2,
                GAP = 8,
                LBL = 22;
            const contact = document.createElement("canvas");
            contact.width = COLS * W + GAP;
            contact.height = ASSETS.length * (W + LBL);
            const cctx = contact.getContext("2d");
            cctx.fillStyle = "#222";
            cctx.fillRect(0, 0, contact.width, contact.height);

            for (let i = 0; i < ASSETS.length; i++) {
                const a = ASSETS[i];
                const y = i * (W + LBL) + LBL;
                const nat = await renderNative(a.preset, a.seed, a.lod);
                const meshes = await r._foundryRequest(a.preset, a.seed, a.lod, "summer");
                const row = { asset: a.preset, native: !!(nat && nat.pixels), foundry: !!(meshes && meshes.length) };
                if (nat && nat.pixels) cctx.drawImage(nativeToCanvas(nat), 0, y);
                if (meshes && meshes.length && nat) {
                    try {
                        cctx.drawImage(renderAnazh(meshes, nat.camPos, nat.camLook), W + GAP, y);
                    } catch (e) {
                        row.err = String(e && e.message);
                    }
                }
                cctx.fillStyle = "#fff";
                cctx.font = "14px sans-serif";
                cctx.fillText(a.preset + " — STUDIO", 6, y - 6);
                cctx.fillText(a.preset + " — ANAZHREALM", W + GAP + 6, y - 6);
                res.rows.push(row);
            }
            try {
                res.dataURL = contact.toDataURL("image/png");
            } catch (e) {
                res.err = String(e && e.message);
            }
            return res;
        },
        [
            { preset: "eiche", seed: 12345, lod: 0 },
            { preset: "findling", seed: 5, lod: 0 },
            { preset: "kristalle", seed: 5, lod: 0 },
            { preset: "blume", seed: 5, lod: 0 },
        ]
    );

    const { dataURL, ...meta } = out;
    console.log(JSON.stringify(meta, null, 2));
    if (dataURL) {
        fs.writeFileSync(
            path.join(ART, "foundry-compare.png"),
            Buffer.from(dataURL.replace(/^data:image\/png;base64,/, ""), "base64")
        );
        console.log("-> artifacts/foundry-compare.png");
    }
    await browser.close();
    server.close();
    process.exit(dataURL ? 0 : 1);
})();
