// DER WALD-VERGLEICH (Schöpfer „render es wie hier"). Der ehrliche Weg um die swiftshader-Wand: AnazhRealms
// WEBGPU-Welt-Render (Bäume+Gras) erstickt den Container — ABER der WEBGL-PROXY der Foundry-Geometrie
// rendert leicht (derselbe Weg, der `foundry-compare.png` machte: Foundry-Geometrie + MeshStandard aus den
// geflossenen Reglern = derselbe Look wie AnazhRealms NodeMaterial). Hier zu einem WALD erweitert: mehrere
// Foundry-Bäume (eiche/fichte/tanne/birke) als Hain platziert, Augenhöhe gerendert. Der Boot ist render-
// GESTUBT (AnazhRealm nur als Asset-Quelle) → kein WebGPU-Welt-Render → kein Tod. LINKS Studio-Wald.
// -> artifacts/world-compare.png
const puppeteer = require("puppeteer");
const http = require("http");
const fs = require("fs");
const path = require("path");
const PORT = 4523;
const root = path.resolve(__dirname, "..");
const ART = path.join(root, "artifacts");
const W = 460,
    H = 360;
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
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
const GPU = [
    "--use-angle=swiftshader",
    "--enable-unsafe-swiftshader",
    "--enable-webgl",
    "--ignore-gpu-blocklist",
    "--no-sandbox",
    "--disable-setuid-sandbox",
];
const launch = () => puppeteer.launch({ headless: true, protocolTimeout: 600000, args: GPU });

async function shootStudio() {
    const browser = await launch();
    const page = await browser.newPage();
    await page.setViewport({ width: W, height: H });
    page.on("pageerror", (e) => console.log("[STUDIO-ERR]", (e.stack || e.message).split("\n")[0]));
    await page.goto(`http://127.0.0.1:${PORT}/worlds/terrain/index.html?patch-probe=1`, {
        waitUntil: "domcontentloaded",
        timeout: 30000,
    });
    await page.evaluate(async () => {
        const s = performance.now();
        while (!window.__phytoView && performance.now() - s < 30000) await new Promise((r) => setTimeout(r, 50));
        const b = document.getElementById("waldBtn");
        if (b) b.click();
    });
    await sleep(9000);
    await page.evaluate(() => {
        const st = document.createElement("style");
        st.textContent = "body > *:not(canvas):not(script):not(style){display:none!important}";
        document.head.appendChild(st);
    });
    await page.evaluate(() => {
        const V = window.__phytoView;
        if (!V || !V.camera) return;
        const cam = V.camera;
        cam.position.set(0, 4, 16);
        cam.lookAt(0, 4, -24);
        cam.updateMatrixWorld(true);
        V.renderPatch();
        V.renderPatch();
    });
    await sleep(300);
    const buf = await page.screenshot({ type: "png" });
    await browser.close();
    return buf;
}

async function shootAnazh() {
    const browser = await launch();
    const page = await browser.newPage();
    await page.setViewport({ width: W, height: H });
    page.on("pageerror", (e) => console.log("[ANAZH-ERR]", (e.stack || e.message).split("\n")[0]));
    page.on("console", (m) => {
        const t = m.text();
        if (/grove|forest|foundry/i.test(t)) console.log("[B]", t.slice(0, 100));
    });
    await page.goto(`http://127.0.0.1:${PORT}/index.html`, { waitUntil: "domcontentloaded", timeout: 30000 });
    const out = await page.evaluate(
        async (W, H) => {
            const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
            // Boot render-GESTUBT (kein WebGPU-Welt-Render) — AnazhRealm nur als Foundry-Asset-Quelle.
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
            const f = r._ensureAssetFoundry();
            const t0 = performance.now();
            while (f && !f.ready && performance.now() - t0 < 30000) await sleep(100);
            if (!f || !f.ready) return { err: "foundry nicht ready" };
            // Ein DICHTER Wald-Stand: viele Foundry-Bäume (deterministisch gestreut über eine Fläche vor der
            // Kamera, gemischte Arten wie die Studio-Wald-Nische) — nah gross, fern klein, so wie der Studio-Wald.
            const rngHash = (a, b) => {
                let h = (a * 73856093) ^ (b * 19349663);
                h = (h ^ (h >>> 13)) >>> 0;
                return (h % 100000) / 100000;
            };
            const kinds = ["eiche", "fichte", "tanne", "birke", "eiche", "fichte"];
            const specs = [];
            for (let i = 0; i < 26; i++) {
                const a = rngHash(i + 1, 7),
                    b = rngHash(i + 3, 19),
                    c = rngHash(i + 11, 31);
                const x = (a - 0.5) * 46;
                const z = -2 - b * 40; // vor der Kamera nach hinten
                if (Math.hypot(x, z + 2) < 3) continue; // nicht auf dem Auge
                specs.push({
                    p: kinds[Math.floor(c * kinds.length)],
                    s: 1000 + i * 137,
                    x,
                    z,
                    sc: 0.85 + rngHash(i + 5, 23) * 0.5,
                });
            }
            const trees = [];
            for (const sp of specs) {
                const meshes = await r._foundryRequest(sp.p, sp.s, 0, "summer");
                if (meshes && meshes.length) trees.push({ sp, meshes });
            }
            if (!trees.length) return { err: "keine Foundry-Bäume geliefert" };
            // WebGL-Proxy bauen (wie foundry-compare): Foundry-Geometrie + MeshStandard aus den Reglern.
            const barkN = r._foundryBarkNormalTexture ? r._foundryBarkNormalTexture() : null;
            const core = window.__phytoCore;
            const leafCanvas =
                core && core.bakeLeafAtlasCanvas ? core.bakeLeafAtlasCanvas(document, { cell3: "needle" }) : null;
            const buildTree = (meshes) => {
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
            // Szene: Boden + Hain, Augenhöhe.
            const gl = new T.WebGLRenderer({ antialias: true, preserveDrawingBuffer: true });
            gl.setSize(W, H, false);
            if (T.ACESFilmicToneMapping) {
                gl.toneMapping = T.ACESFilmicToneMapping;
                gl.toneMappingExposure = 1.0;
            }
            if (T.SRGBColorSpace) gl.outputColorSpace = T.SRGBColorSpace;
            const sc = new T.Scene();
            sc.fog = new T.Fog(0xbcd2e0, 18, 60); // atmosphärischer Dunst wie der Studio-Wald
            sc.add(new T.HemisphereLight(0xdfeecc, 0x2a2a1a, 0.7));
            const kl = new T.DirectionalLight(0xfff2d9, 2.4);
            kl.position.set(8, 14, 6);
            sc.add(kl);
            // Waldboden (grün, wie die Wiese).
            const mg = r.constructor.MEADOW_GREEN || [0.09, 0.12, 0.03];
            const ground = new T.Mesh(
                new T.PlaneGeometry(160, 160),
                new T.MeshStandardMaterial({ color: new T.Color(mg[0], mg[1], mg[2]), roughness: 0.95 })
            );
            ground.rotation.x = -Math.PI / 2;
            sc.add(ground);
            for (const t of trees) {
                const grp = buildTree(t.meshes);
                grp.position.set(t.sp.x, 0, t.sp.z);
                grp.scale.setScalar(t.sp.sc || 1);
                sc.add(grp);
            }
            // Unterwuchs: instanzierte Gras-Halme (Wiesen-Grün, deterministisch gestreut) = der Waldboden-Look.
            const bladeG = new T.ConeGeometry(0.045, 0.55, 3);
            bladeG.translate(0, 0.275, 0);
            const grassMat = new T.MeshStandardMaterial({
                color: new T.Color(mg[0] * 1.5 + 0.04, mg[1] * 1.5 + 0.06, mg[2] * 1.4 + 0.02),
                roughness: 0.9,
                side: T.DoubleSide,
            });
            const NB = 4200;
            const grass = new T.InstancedMesh(bladeG, grassMat, NB);
            const dummy = new T.Object3D();
            for (let i = 0; i < NB; i++) {
                const gx = (rngHash(i + 2, 41) - 0.5) * 70,
                    gz = -1 - rngHash(i + 6, 53) * 44;
                dummy.position.set(gx, 0, gz);
                dummy.rotation.y = rngHash(i, 9) * 6.28;
                dummy.scale.setScalar(0.7 + rngHash(i + 1, 17) * 0.8);
                dummy.updateMatrix();
                grass.setMatrixAt(i, dummy.matrix);
            }
            grass.instanceMatrix.needsUpdate = true;
            sc.add(grass);
            const cam = new T.PerspectiveCamera(52, W / H, 0.05, 500);
            cam.position.set(1.5, 3.0, 11);
            cam.lookAt(-0.5, 3.6, -20);
            cam.updateMatrixWorld(true);
            gl.setRenderTarget(null);
            gl.setClearColor(0xbcd2e0, 1);
            gl.clear();
            gl.render(sc, cam);
            const cv = document.createElement("canvas");
            cv.width = W;
            cv.height = H;
            cv.getContext("2d").drawImage(gl.domElement, 0, 0);
            console.log("grove: " + trees.length + " Foundry-Bäume gerendert");
            return { dataURL: cv.toDataURL("image/png"), n: trees.length };
        },
        W,
        H
    );
    await browser.close();
    console.log("  anazh:", JSON.stringify({ n: out.n, err: out.err }));
    if (!out.dataURL) return null;
    return Buffer.from(out.dataURL.replace(/^data:image\/png;base64,/, ""), "base64");
}

async function stitch(studio, anazh) {
    const browser = await launch();
    const page = await browser.newPage();
    await page.goto("about:blank");
    const dataURL = await page.evaluate(
        async (sB, aB, W, H) => {
            const LBL = 24,
                GAP = 8;
            const cv = document.createElement("canvas");
            cv.width = 2 * W + GAP;
            cv.height = H + LBL;
            const ctx = cv.getContext("2d");
            ctx.fillStyle = "#111";
            ctx.fillRect(0, 0, cv.width, cv.height);
            const load = (b) =>
                new Promise((res) => {
                    if (!b) return res(null);
                    const im = new Image();
                    im.onload = () => res(im);
                    im.onerror = () => res(null);
                    im.src = "data:image/png;base64," + b;
                });
            const si = await load(sB),
                ai = await load(aB);
            if (si) ctx.drawImage(si, 0, 0, si.width, si.height, 0, LBL, W, H);
            if (ai) ctx.drawImage(ai, 0, 0, ai.width, ai.height, W + GAP, LBL, W, H);
            ctx.fillStyle = "#fff";
            ctx.font = "14px sans-serif";
            ctx.fillText("WALD — STUDIO", 6, 17);
            ctx.fillText("WALD — ANAZHREALM (Foundry-Geometrie)", W + GAP + 6, 17);
            return cv.toDataURL("image/png");
        },
        studio ? studio.toString("base64") : null,
        anazh ? anazh.toString("base64") : null,
        W,
        H
    );
    await browser.close();
    return dataURL;
}

(async () => {
    fs.mkdirSync(ART, { recursive: true });
    await new Promise((r) => server.listen(PORT, r));
    console.log("STUDIO Wald...");
    let studio = null;
    try {
        studio = await shootStudio();
    } catch (e) {
        console.log("studio fail:", e.message);
    }
    console.log("ANAZHREALM Foundry-Hain (WebGL-Proxy)...");
    let anazh = null;
    try {
        anazh = await shootAnazh();
    } catch (e) {
        console.log("anazh fail:", e.message);
    }
    const dataURL = await stitch(studio, anazh);
    if (dataURL) {
        fs.writeFileSync(
            path.join(ART, "world-compare.png"),
            Buffer.from(dataURL.replace(/^data:image\/png;base64,/, ""), "base64")
        );
        console.log("-> artifacts/world-compare.png");
    }
    await new Promise((r) => server.close(r));
    process.exit(dataURL ? 0 : 1);
})();
