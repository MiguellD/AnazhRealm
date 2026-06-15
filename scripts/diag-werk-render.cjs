// diag-werk-render.cjs — der ANBLICK der Grammatik (Ω-B1 Tempel · Ω-B2 Klinge): baut
// das Werk in einer NEUTRALEN Szene (echte PBR-Materialien + Sky-IBL + neutrale Lichter),
// rahmt die Kamera auf die BBox + screenshottet — für die Schöpfer-Augen-Abnahme (Wand 1).
//   node scripts/diag-werk-render.cjs
const puppeteer = require("puppeteer");
const http = require("http");
const fs = require("fs");
const path = require("path");
const PORT = 4380;
const root = path.resolve(__dirname, "..");
const mime = {
    ".html": "text/html",
    ".js": "application/javascript",
    ".wasm": "application/wasm",
    ".json": "application/json",
    ".woff2": "font/woff2",
    ".css": "text/css",
    ".png": "image/png",
};
const server = http.createServer((req, res) => {
    let p = req.url.split("?")[0];
    if (p === "/") p = "/index.html";
    const fp = path.join(root, p);
    if (!fp.startsWith(root)) return ((res.statusCode = 403), res.end());
    fs.readFile(fp, (err, data) => {
        if (err) return ((res.statusCode = 404), res.end());
        res.setHeader("Content-Type", mime[path.extname(fp)] || "application/octet-stream");
        res.end(data);
    });
});

async function renderWerk(page, bpName, view) {
    await page.evaluate(
        async (bpName, view) => {
            const r = window.anazhRealm,
                THREE = window.THREE,
                st = r.state;
            // Loop EINFRIEREN (sonst rendert der Engine-rAF die Welt-Szene über mein Bild)
            r._gameLoopTick = () => {};
            if (st.renderer && st.renderer.setAnimationLoop) st.renderer.setAnimationLoop(null);
            if (r._ensureSkyEnvironment) {
                try {
                    r._ensureSkyEnvironment(true);
                } catch (_e) {}
            }
            // eigene NEUTRALE Szene (nur das Werk → schnell, kein Welt-Render) mit der echten
            // Sky-IBL + neutralen Lichtern; die Material-Pipeline ist die echte (_buildFromBlueprint).
            const grp = r._buildFromBlueprint(st.blueprints[bpName], 0, undefined, {});
            const scene = new THREE.Scene();
            scene.background = new THREE.Color(0x9bb4d0);
            if (st.scene && st.scene.environment) scene.environment = st.scene.environment;
            scene.add(new THREE.AmbientLight(0xffffff, 0.55));
            const key = new THREE.DirectionalLight(0xfff1d8, 1.3);
            key.position.set(6, 11, 8);
            scene.add(key);
            const fill = new THREE.DirectionalLight(0xaecbe8, 0.4);
            fill.position.set(-5, 3, -5);
            scene.add(fill);
            const box = new THREE.Box3().setFromObject(grp);
            const c = box.getCenter(new THREE.Vector3());
            const sz = box.getSize(new THREE.Vector3());
            grp.position.sub(c); // ins Zentrum
            scene.add(grp);
            const maxd = Math.max(sz.x, sz.y, sz.z) || 2;
            const cam = new THREE.PerspectiveCamera(40, 1, 0.05, 500);
            const a = view === "front" ? 0.1 : 1.0;
            cam.position.set(maxd * a, maxd * 0.28, maxd * 1.45);
            cam.lookAt(0, -sz.y * 0.04, 0);
            window.__rs = () => {
                try {
                    st.renderer.render(scene, cam);
                } catch (_e) {}
            };
        },
        bpName,
        view
    );
    for (let i = 0; i < 6; i++) {
        await page.evaluate(() => window.__rs && window.__rs());
        await new Promise((r) => setTimeout(r, 60));
    }
}

(async () => {
    await new Promise((r) => server.listen(PORT, r));
    if (!fs.existsSync(path.join(root, "artifacts"))) fs.mkdirSync(path.join(root, "artifacts"));
    const browser = await puppeteer.launch({
        headless: true,
        protocolTimeout: 120000,
        args: ["--use-angle=swiftshader", "--enable-unsafe-swiftshader", "--no-sandbox", "--disable-setuid-sandbox"],
    });
    const page = await browser.newPage();
    await page.setViewport({ width: 900, height: 900 });
    page.on("pageerror", (e) => console.log("[PAGE-ERROR]", (e.stack || e.message).split("\n")[0]));
    try {
        await page.goto(`http://127.0.0.1:${PORT}/index.html`, { waitUntil: "domcontentloaded", timeout: 30000 });
        await page.evaluate(async () => {
            const deadline = performance.now() + 20000;
            while (
                (!window.anazhRealm ||
                    !window.anazhRealm.state ||
                    !window.anazhRealm.state.rendererReady ||
                    !window.anazhRealm.state.blueprints) &&
                performance.now() < deadline
            )
                await new Promise((r) => setTimeout(r, 100));
        });
        for (const [bp, file, view] of [
            ["temple", "werk-tempel.png", "iso"],
            ["temple", "werk-tempel-front.png", "front"],
            ["geraet_schwert", "werk-schwert.png", "iso"],
        ]) {
            await renderWerk(page, bp, view);
            const out = path.join(root, "artifacts", file);
            await page.screenshot({ path: out, clip: { x: 0, y: 0, width: 900, height: 900 } });
            console.log("geschrieben:", "artifacts/" + file);
        }
    } finally {
        await browser.close();
        server.close();
    }
})();
