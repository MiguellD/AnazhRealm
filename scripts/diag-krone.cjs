// DIE KRONE — der SCHARFE Kronen-Verifier (wahreranblick §1, FINAL).
// Die ECHTE Baum-Geometrie (bark-Tubes + foliage-Cards, exakt wie die Welt sie
// baut) in eine FRISCHE, kontrollierte Szene (KEIN Wasser/Terrain/Atmosphäre, kein
// Welt-Kamera-Kampf) + mit den NOON-Lichtern der Welt (geklont) rendern. Präsentiert
// via state.scene-Tausch durch _loopRender (der EINE Pfad, der zuverlässig auf den
// Canvas malt). So sehe ich die Krone KLAR + ZENTRIERT: lush+grün oder Stachel/weiss.
// Aufruf: node scripts/diag-krone.cjs   (env: KRONE_SPECIES=baum_eiche KRONE_PBR=1 KRONE_BG=9ec8e8)
const puppeteer = require("puppeteer");
const http = require("http");
const fs = require("fs");
const path = require("path");
const PORT = Number(process.env.KRONE_PORT || 4381);
const root = path.resolve(__dirname, "..");
const ART = path.join(root, "artifacts");
const SPECIES = (process.env.KRONE_SPECIES || "baum_eiche,baum_tanne,baum_buche").split(",");
const PBR = process.env.KRONE_PBR !== "0";
const BG = parseInt((process.env.KRONE_BG || "9ec8e8").replace("#", ""), 16);
const mime = { ".html": "text/html", ".js": "application/javascript", ".wasm": "application/wasm", ".json": "application/json", ".woff2": "font/woff2", ".css": "text/css", ".png": "image/png" };
const server = http.createServer((req, res) => {
    let p = req.url.split("?")[0];
    if (p === "/") p = "/index.html";
    const fp = path.join(root, p);
    if (!fp.startsWith(root)) { res.statusCode = 403; return res.end(); }
    fs.readFile(fp, (err, data) => {
        if (err) { res.statusCode = 404; return res.end(); }
        res.setHeader("Content-Type", mime[path.extname(fp)] || "application/octet-stream");
        res.end(data);
    });
});
const T0 = Date.now();
const mark = (m) => console.log(`[${((Date.now() - T0) / 1000).toFixed(1)}s] ${m}`);

(async () => {
    if (!fs.existsSync(ART)) fs.mkdirSync(ART, { recursive: true });
    await new Promise((r) => server.listen(PORT, r));
    mark("launch");
    const browser = await puppeteer.launch({ headless: true, protocolTimeout: 300000, args: ["--use-angle=swiftshader", "--enable-unsafe-swiftshader", "--enable-webgl", "--ignore-gpu-blocklist", "--no-sandbox", "--disable-setuid-sandbox"] });
    const page = await browser.newPage();
    await page.setViewport({ width: 900, height: 820 });
    page.on("pageerror", (e) => console.log("[PAGE-ERROR]", (e.stack || e.message).split("\n")[0]));
    await page.goto(`http://127.0.0.1:${PORT}/index.html`, { waitUntil: "domcontentloaded", timeout: 30000 });

    // settle: Welt-Render STUBBEN (sonst überschreibt der Loop die Baum-Szene); Mittag.
    mark("settle");
    await page.evaluate(async (pbr) => {
        let stubbed = false;
        const start = performance.now();
        while (performance.now() - start < 16000) {
            const r = window.anazhRealm;
            if (r && r.state) {
                r.state.timeOfDay = 0.5;
                if (r.state.atmosphere) { r.state.atmosphere.gpuScatter = false; r.state.atmosphere.materialMode = pbr ? "pbr" : "toon"; }
                if (r.setTimeOfDay) r.setTimeOfDay(0.5);
            }
            if (r && !stubbed && r.state && r.state.renderer) {
                window.__origRender = r.state.renderer.render.bind(r.state.renderer);
                r.state.renderer.render = function () {};
                if (typeof r.state.renderer.renderAsync === "function") { window.__origRenderAsync = r.state.renderer.renderAsync.bind(r.state.renderer); r.state.renderer.renderAsync = () => Promise.resolve(); }
                r.state.postProcessingFailed = true; stubbed = true;
            }
            if (r && typeof r._gameLoopTick === "function") { try { r._gameLoopTick(performance.now()); } catch (_e) {} if (r.state.renderer && performance.now() - start > 3500) break; }
            await new Promise((res) => setTimeout(res, 20));
        }
        const r = window.anazhRealm; if (r && r.setTimeOfDay) r.setTimeOfDay(0.5);
    }, PBR);
    await page.evaluate(() => { for (const el of document.querySelectorAll(".overlay, .modal, .drawer, #chat-console, #dialogue-box, #intro-overlay, #hud, header, .hotbar, #status-bar")) if (el) el.style.display = "none"; });
    mark("settled");

    for (const species of SPECIES) {
        mark(`build ${species}`);
        const info = await page.evaluate(async (args) => {
            const r = window.anazhRealm, s = r.state, THREE = window.THREE;
            try {
                const keys = r._buildVariantLODs(args.species, 0);
                const key = keys && keys[0];
                const bp = key && s.blueprints[key];
                if (!bp) return { err: "kein bp" };
                const skelLeaves = r._buildTreeSkeletonLeaves(bp);
                if (!skelLeaves || !skelLeaves.leaves || !skelLeaves.leaves.length) return { err: "keine leaves" };
                const anchors = bp._skeleton && bp._skeleton.anchors ? bp._skeleton.anchors.length : 0;

                // FRISCHE Szene NUR mit dem Baum + geklonten NOON-Lichtern
                const scene = new THREE.Scene();
                scene.background = new THREE.Color(args.bg);
                const bbox = new THREE.Box3();
                let fverts = 0, bverts = 0;
                for (const lf of skelLeaves.leaves) {
                    const mesh = new THREE.Mesh(lf.geom, lf.mat); mesh.frustumCulled = false; scene.add(mesh);
                    lf.geom.computeBoundingBox(); bbox.union(lf.geom.boundingBox);
                    const vc = lf.geom.attributes.position ? lf.geom.attributes.position.count : 0;
                    if (lf.mat && lf.mat.side === THREE.DoubleSide) fverts += vc; else bverts += vc;
                }
                // Die WELT-Lichter klonen — die toon/pbr-Materialien leuchten von den
                // ECHTEN THREE.js-Lights (DirectionalLight/Ambient/Hemisphere); reine
                // Ersatz-Lichter rendern leer. Die Krone-FARBE ist ohnehin objektiv via
                // png-stats (Color-Attribut) gemessen — hier zählt Form+Präsenz.
                const wl = []; s.scene.traverse((o) => { if (o.isLight) wl.push(o); });
                for (const L of wl) { const c = L.clone(); if (L.isDirectionalLight && L.target) { const t = new THREE.Object3D(); t.position.copy(L.target.position); scene.add(t); c.target = t; } scene.add(c); }
                let nLights = wl.length;
                if (!nLights) { scene.add(new THREE.AmbientLight(0xffffff, 0.6)); const d = new THREE.DirectionalLight(0xffe8c2, 1.0); d.position.set(0.4, 1, 0.3); scene.add(d); nLights = 2; }

                // Kamera: ganzer Baum, reine Seitenansicht, zentriert auf die BBox-Mitte
                const size = new THREE.Vector3(); bbox.getSize(size);
                const ctr = new THREE.Vector3(); bbox.getCenter(ctr);
                const cam = new THREE.PerspectiveCamera(46, 900 / 820, 0.05, 600);
                const h = Math.max(size.y, size.x, 4);
                const dist = (h * 0.6) / Math.tan((46 * Math.PI / 180) / 2) + size.z * 0.5;
                cam.position.set(ctr.x - dist, ctr.y, ctr.z); cam.lookAt(ctr); cam.updateProjectionMatrix(); cam.updateMatrixWorld(true);

                // TAUSCH: state.scene/camera kurz auf die Baum-Szene → _loopRender präsentiert sie
                window.__saved = { scene: s.scene, camera: s.camera };
                s.scene = scene; s.camera = cam;
                return { key, anchors, fverts, bverts, lights: nLights, bbox: { x: +size.x.toFixed(1), y: +size.y.toFixed(1), z: +size.z.toFixed(1) }, ctr: { x: +ctr.x.toFixed(1), y: +ctr.y.toFixed(1), z: +ctr.z.toFixed(1) }, dist: +dist.toFixed(1) };
            } catch (e) { return { err: String(e.message || e) + " @ " + String((e.stack || "").split("\n")[1] || "") }; }
        }, { species, bg: BG });

        // PRESENT: Render un-stubben, AWAITED renderAsync auf die Baum-Szene (der
        // WebGPU-Präsentations-Pfad), dann re-stubben. renderAsync awaiten = GPU fertig
        // + präsentiert, BEVOR der Screenshot greift (der Hang-Fix aus diag-anblick).
        const rr = await page.evaluate(async () => {
            const r = window.anazhRealm, s = r.state;
            const isTest = window.__saved && s.scene !== window.__saved.scene;
            const childCount = s.scene ? s.scene.children.length : -1;
            if (window.__origRender) s.renderer.render = window.__origRender;
            if (window.__origRenderAsync) s.renderer.renderAsync = window.__origRenderAsync;
            s.postProcessingFailed = true;
            let err = null;
            // _loopRender (sync renderer.render) ist der EINZIGE Pfad, der die Baum-Szene
            // WIRKLICH zeichnet (renderAsync bleibt leer — Setup fehlt). Die WebGPU-headless-
            // PRÄSENTATION ist ~50% (zeigt manchmal einen stale Frame) — eine WERKZEUG-
            // Grenze; mehrfach + Pause erhöht die Trefferquote. Die GRÜN/LUSH-Wahrheit ist
            // ohnehin objektiv via png-stats (Color-Attribut) + bbox/foliageVerts gemessen.
            try { for (let i = 0; i < 4; i++) { r._loopRender(performance.now()); await new Promise((x) => setTimeout(x, 50)); } } catch (e) { err = String(e.message || e); }
            s.renderer.render = function () {}; if (typeof s.renderer.renderAsync === "function") s.renderer.renderAsync = () => Promise.resolve();
            return { isTestScene: isTest, childCount, err };
        });
        await new Promise((res) => setTimeout(res, 400));
        const tag = species.replace(/^baum_/, "");
        await page.screenshot({ path: path.join(ART, `krone-${tag}.png`) });
        await page.evaluate(() => { const s = window.anazhRealm.state; if (window.__saved) { s.scene = window.__saved.scene; s.camera = window.__saved.camera; } });
        console.log(`  krone-${tag}.png  key=${info.key} foliageVerts=${info.fverts} bbox=${JSON.stringify(info.bbox)} ctr=${JSON.stringify(info.ctr)} dist=${info.dist} isTestScene=${rr.isTestScene} childCount=${rr.childCount} ${info.err || "ok"}`);
    }
    mark("done");
    await browser.close();
    await new Promise((r) => server.close(r));
    process.exit(0);
})();
