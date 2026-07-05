// SIEHT die Werkstatt-Vorschau der Eiche jetzt wie die Vorlage aus (Tube-Rinde + Blatt-Klingen)
// statt Kugel-Blobs? Oeffnet die Werkstatt, waehlt baum_eiche, rendert die kleine Preview-WebGPU
// und screenshottet das Canvas. Der eigene kleine Renderer umgeht evtl. den Voll-Welt-Render-Tod.
const puppeteer = require("puppeteer");
const http = require("http");
const fs = require("fs");
const path = require("path");
const PORT = 4471;
const root = path.resolve(__dirname, "..");
const ART = path.join(root, "artifacts");
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
    await page.setViewport({ width: 1000, height: 800 });
    page.on("pageerror", (e) => console.log("[PAGE-ERROR]", (e.stack || e.message).split("\n")[0]));
    await page.goto(`http://127.0.0.1:${PORT}/index.html`, { waitUntil: "domcontentloaded", timeout: 30000 });

    const info = await page.evaluate(async () => {
        let stubbed = false;
        const start = performance.now();
        while (performance.now() - start < 40000) {
            const r = window.anazhRealm;
            if (r && !stubbed && r.state && r.state.renderer) {
                r.state.renderer.render = function () {};
                if (r.state.renderer.renderAsync) r.state.renderer.renderAsync = () => Promise.resolve();
                r.state.postProcessingFailed = true;
                stubbed = true;
            }
            if (r && typeof r._gameLoopTick === "function") {
                try {
                    r._gameLoopTick(performance.now());
                } catch (_e) {}
                if (r.state.blueprints && r.state.blueprints.baum_eiche) break;
            }
            await new Promise((res) => setTimeout(res, 5));
        }
        const r = window.anazhRealm;
        const s = r.state;
        // Werkstatt-Drawer sichtbar machen (Canvas braucht Groesse) + Preview initialisieren.
        const drawer =
            document.getElementById("workshop-drawer") ||
            document.querySelector("[data-drawer='workshop']") ||
            document.getElementById("drawer-workshop");
        try {
            if (drawer) {
                drawer.hidden = false;
                drawer.style.display = "block";
                drawer.classList.add("open");
            }
        } catch (_e) {}
        const cv = document.getElementById("workshop-preview-canvas");
        if (cv) {
            cv.style.width = "320px";
            cv.style.height = "320px";
        }
        const ws = r._ensureWorkshopState();
        ws.selectedBlueprint = "baum_eiche";
        const prev = r._workshopEnsurePreview();
        if (!prev) return { err: "keine preview (ensure gab null)" };
        prev.active = true;
        // Auf WebGPU-Ready warten.
        const t0 = performance.now();
        while (!prev.rendererReady && performance.now() - t0 < 20000) await new Promise((res) => setTimeout(res, 50));
        if (!prev.rendererReady) return { err: "preview renderer nicht ready" };
        return { ok: true, ready: true };
    });
    console.log("Preview:", JSON.stringify(info));
    if (info.err) {
        await browser.close();
        server.close();
        process.exit(1);
    }

    // DER RENDERER-FIX: der swiftshader-WebGPU-Canvas + RenderTarget-Readback sind headless BEIDE
    // schwarz/kaputt (copyTextureToBuffer wirft). ABER ein OFFSCREEN-WebGL-Renderer liest sauber
    // aus (bewiesen). Also: die ECHTE Skelett-Geometrie (Positions/Farben aus phyto-core) in einen
    // frischen WebGL-Renderer ziehen + als PNG kodieren. So SEHE ich, ob die Eiche Tube+Blatt-
    // Klingen ist (wie die Vorlage) statt Kugel-Blobs. (Material = schlicht lit vertexColor.)
    const shoot = async (which) => {
        return await page.evaluate(
            async (which, W) => {
                const r = window.anazhRealm;
                const s = r.state;
                const T = window.THREE;
                const bp = s.blueprints.baum_eiche;
                let err = null,
                    dataURL = null,
                    meshes = 0,
                    verts = 0;
                try {
                    // Skelett auf L0 frisch wachsen.
                    bp._recipeLod = 0;
                    r._workshopRegrowRecipe(bp, r._treeRecipeDials("baum_eiche", null), "see-eiche");
                    const leaves = (r._buildTreeSkeletonLeaves(bp) || {}).leaves || [];
                    const cv = document.createElement("canvas");
                    cv.width = W;
                    cv.height = W;
                    const gl = new T.WebGLRenderer({ canvas: cv, antialias: true, preserveDrawingBuffer: true });
                    gl.setSize(W, W, false);
                    gl.setClearColor(0xbcd2e0, 1);
                    if (T.ACESFilmicToneMapping) {
                        gl.toneMapping = T.ACESFilmicToneMapping;
                        gl.toneMappingExposure = 1.0;
                    }
                    if (T.SRGBColorSpace) gl.outputColorSpace = T.SRGBColorSpace;
                    const sc = new T.Scene();
                    // Die VORLAGEN-Licht-Rig (phytogenesis 5-Licht): hemi + warmer Key + Rim + Fill + Back.
                    sc.add(new T.HemisphereLight(0xdfeecc, 0x463c2e, 0.55));
                    const key = new T.DirectionalLight(0xfff0d8, 2.4);
                    key.position.set(5, 8, 4);
                    sc.add(key);
                    const rim = new T.DirectionalLight(0xaaccff, 0.45);
                    rim.position.set(-4, 3, -5);
                    sc.add(rim);
                    const fill = new T.DirectionalLight(0x8a7a5a, 0.5);
                    fill.position.set(-3, 0, 3);
                    sc.add(fill);
                    const back = new T.DirectionalLight(0xffd8a0, 0.5);
                    back.position.set(2, 4, -4);
                    sc.add(back);
                    const grp = new T.Group();
                    const per = [];
                    for (const lf of leaves) {
                        const src = lf.geom;
                        if (!src || !src.attributes || !src.attributes.position) continue;
                        // Wie die echte Vorschau: den SCHATTEN-ZWILLING (kamera-unsichtbar) ueberspringen.
                        if (lf.shadowTwin) continue;
                        meshes++;
                        verts += src.attributes.position.count;
                        const hasCol = !!src.attributes.color;
                        per.push(src.attributes.position.count + (hasCol ? "c" : ""));
                        const g = new T.BufferGeometry();
                        g.setAttribute(
                            "position",
                            new T.BufferAttribute(new Float32Array(src.attributes.position.array), 3)
                        );
                        if (hasCol)
                            g.setAttribute("color", new T.BufferAttribute(new Float32Array(src.attributes.color.array), 3));
                        if (src.index) g.setIndex(new T.BufferAttribute(new Uint32Array(src.index.array), 1));
                        // Builder-Normalen bewahren (wie Welt/Vorschau); sonst glaettet computeVertexNormals
                        // ueber die Klingen = Blob.
                        if (src.attributes.normal)
                            g.setAttribute("normal", new T.BufferAttribute(new Float32Array(src.attributes.normal.array), 3));
                        else g.computeVertexNormals();
                        // Wie das Vorschau-Material: Albedo aus der Vertex-Farbe (braun Rinde · gruen Blatt).
                        const m = new T.MeshStandardMaterial({
                            vertexColors: hasCol,
                            color: hasCol ? 0xffffff : 0x5a7a3a,
                            side: T.DoubleSide,
                            roughness: 0.86,
                            metalness: 0,
                        });
                        const mesh = new T.Mesh(g, m);
                        if (lf.localMatrix) mesh.applyMatrix4(lf.localMatrix);
                        grp.add(mesh);
                    }
                    sc.add(grp);
                    const box = new T.Box3().setFromObject(grp);
                    const ctr = box.getCenter(new T.Vector3());
                    const sz = box.getSize(new T.Vector3());
                    // Boden-Scheibe zur Orientierung.
                    const ground = new T.Mesh(
                        new T.CircleGeometry(Math.max(sz.x, sz.z) * 0.8, 32).rotateX(-Math.PI / 2),
                        new T.MeshStandardMaterial({ color: 0x5a6a3a, roughness: 1 })
                    );
                    ground.position.set(ctr.x, box.min.y, ctr.z);
                    sc.add(ground);
                    const cam = new T.PerspectiveCamera(40, 1, 0.05, 500);
                    const d = Math.max(sz.x, sz.y, sz.z) * 1.9 + 1;
                    const ang = which === "side" ? 0 : 0.6;
                    // Etwas von schräg-oben (Augenhöhe leicht unter Kronenmitte), ganzer Baum im Bild.
                    cam.position.set(ctr.x + d * Math.cos(ang), box.min.y + sz.y * 0.55, ctr.z + d * Math.sin(ang));
                    cam.lookAt(ctr.x, ctr.y, ctr.z);
                    gl.render(sc, cam);
                    err = "per=" + per.join(",");
                    dataURL = cv.toDataURL("image/png");
                } catch (e) {
                    err = String((e && e.stack) || e);
                }
                return { err, meshes, verts, dataURL };
            },
            which,
            640
        );
    };
    const rr = await shoot("angle");
    console.log("Skelett:", JSON.stringify({ err: rr.err, meshes: rr.meshes, verts: rr.verts }));
    if (rr.dataURL) {
        fs.writeFileSync(
            path.join(ART, "workshop-eiche.png"),
            Buffer.from(rr.dataURL.replace(/^data:image\/png;base64,/, ""), "base64")
        );
        console.log("-> artifacts/workshop-eiche.png (WebGL-Offscreen)");
    } else console.log("Kein Bild — err:", rr.err);
    await browser.close();
    server.close();
    process.exit(0);
})();
