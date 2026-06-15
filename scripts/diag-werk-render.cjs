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
            // das Werk IN die Welt-Szene hängen (die echte Material-/IBL-/Licht-Pipeline),
            // dann den Loop einfrieren + selbst rendern (kein Loop-Wettstreit, kein Custom-Scene).
            if (window.__werkMesh) {
                st.scene.remove(window.__werkMesh);
            }
            if (r._ensureSkyEnvironment) {
                try {
                    r._ensureSkyEnvironment(true);
                } catch (_e) {}
            }
            const grp = r._buildFromBlueprint(st.blueprints[bpName], 0, undefined, {});
            const box = new THREE.Box3().setFromObject(grp);
            const c = box.getCenter(new THREE.Vector3());
            const sz = box.getSize(new THREE.Vector3());
            // ans Welt-Zentrum über den Boden setzen
            grp.position.set(-c.x, st.player ? st.player.y || 30 : 30, -c.z);
            st.scene.add(grp);
            window.__werkMesh = grp;
            window.__werkBox = { sx: sz.x, sy: sz.y, sz: sz.z, oy: grp.position.y };
            // Loop EINFRIEREN (kein Streaming/Physik überschreibt die Kamera)
            r._gameLoopTick = () => {};
            const maxd = Math.max(sz.x, sz.y, sz.z) || 2;
            const cam = st.camera;
            const oy = grp.position.y + sz.y * 0.45;
            const a = view === "front" ? 0.12 : 1.05;
            cam.position.set(maxd * a, oy, maxd * 1.4);
            cam.lookAt(0, grp.position.y + sz.y * 0.35, 0);
            cam.near = 0.1;
            cam.far = 2000;
            cam.updateProjectionMatrix();
            window.__rs = () => {
                try {
                    st.renderer.render(st.scene, cam);
                } catch (_e) {}
            };
        },
        bpName,
        view
    );
    for (let i = 0; i < 8; i++) {
        await page.evaluate(() => window.__rs && window.__rs());
        await new Promise((r) => setTimeout(r, 70));
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
