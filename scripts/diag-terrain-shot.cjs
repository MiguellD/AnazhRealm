// Diagnose-Werkzeug: rahmt die 3D-TERRAIN-Szene + screenshottet (der „nächste Hebel" der V18-
// Lehre — ICH BIN NICHT PIXEL-BLIND: headless rastert die GEOMETRIE treu [Layout · Mesh-Form ·
// grobe Render-Fehler], nur die Shader-FEINHEIT ist GPU-untreu). Zweck: das T2-Geomorph-Ergebnis
// SEHEN (rendert das Terrain kohärent? keine Falten/Löcher durch den positionNode-Morph?) — A/B
// geomorph=1 vs 0 an der LOD0↔LOD1-Grenze. Schreibt artifacts/terrain-geomorph-{on,off}.png.
const puppeteer = require("puppeteer");
const http = require("http");
const fs = require("fs");
const path = require("path");
const PORT = 4365;
const root = path.resolve(__dirname, "..");
const ART = path.join(root, "artifacts");
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
    await new Promise((r) => server.listen(PORT, r));
    const browser = await puppeteer.launch({
        headless: true,
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
    await page.setViewport({ width: 1280, height: 800 });
    page.on("pageerror", (e) => console.log("[PAGE-ERROR]", (e.stack || e.message).split("\n")[0]));
    await page.goto(`http://127.0.0.1:${PORT}/index.html`, { waitUntil: "domcontentloaded", timeout: 30000 });

    // Warmup mit gestubbtem Render (schnell), bis der Ring voll ist + SETTLE (Morphs rechnen)
    await page.evaluate(async () => {
        let stubbed = false;
        const start = performance.now();
        while (performance.now() - start < 60000) {
            const r = window.anazhRealm;
            if (r && !stubbed && r.state && r.state.renderer) {
                window.__origRendererRender = r.state.renderer.render.bind(r.state.renderer);
                r.state.renderer.render = function () {};
                if (typeof r.state.renderer.renderAsync === "function")
                    r.state.renderer.renderAsync = () => Promise.resolve();
                r.state.postProcessingFailed = true;
                stubbed = true;
            }
            if (r && typeof r._gameLoopTick === "function") {
                try {
                    r._gameLoopTick(performance.now());
                } catch (_e) {}
                if (r.state && r.state.playerMesh && r.state.voxelChunks && r.state.voxelChunks.size > 40) break;
            }
            await new Promise((res) => setTimeout(res, 4));
        }
        for (let i = 0; i < 150; i++) {
            const r = window.anazhRealm;
            if (r && typeof r._gameLoopTick === "function") {
                try {
                    r._gameLoopTick(performance.now());
                } catch (_e) {}
            }
            await new Promise((res) => setTimeout(res, 2));
        }
    });

    // die UI-Overlays verstecken, damit die 3D-Szene frei liegt
    await page.evaluate(() => {
        for (const id of ["dialogue-box", "intro-overlay", "onboarding", "start-overlay", "modal-overlay"]) {
            const el = document.getElementById(id);
            if (el) el.style.display = "none";
        }
        for (const el of document.querySelectorAll(".overlay, .modal, .drawer, #chat-console"))
            el.style.display = "none";
    });

    // Kamera an die LOD0↔LOD1-Grenze setzen + ein echtes Frame zeichnen
    const frame = async (geomorph) => {
        await page.evaluate((gm) => {
            const r = window.anazhRealm;
            const s = r.state;
            if (s.atmoUniforms && s.atmoUniforms.geomorph) s.atmoUniforms.geomorph.value = gm;
            const pm = s.playerMesh;
            const px = pm ? pm.position.x : 0;
            const pz = pm ? pm.position.z : 0;
            const py = pm ? pm.position.y : 0;
            const cam = s.camera;
            if (cam) {
                // erhöhte 3/4-Sicht über die LOD0-Region hinweg zur LOD1-Ring-Grenze (≈ +65 m)
                cam.position.set(px - 40, py + 55, pz - 40);
                cam.lookAt(px + 55, py - 8, pz + 55);
                cam.updateMatrixWorld(true);
            }
            if (s.renderer && window.__origRendererRender) {
                r.state.renderer.render = window.__origRendererRender;
                s.postProcessingFailed = false;
                try {
                    window.__origRendererRender(s.scene, cam);
                } catch (_e) {
                    window.__shotErr = String((_e && _e.message) || _e);
                }
                // erneut stubben für den nächsten ruhigen A/B-Übergang
                r.state.renderer.render = function () {};
            }
        }, geomorph);
        await new Promise((res) => setTimeout(res, 250));
    };

    fs.mkdirSync(ART, { recursive: true });
    await frame(1.0);
    await page.screenshot({ path: path.join(ART, "terrain-geomorph-on.png"), fullPage: false });
    await frame(0.0);
    await page.screenshot({ path: path.join(ART, "terrain-geomorph-off.png"), fullPage: false });

    const info = await page.evaluate(() => {
        const r = window.anazhRealm;
        const s = r.state;
        let chunks = 0,
            morph = 0;
        for (const [, e] of s.voxelChunks) {
            if (!e || e.empty || !e.mesh) continue;
            chunks++;
            if (e.hasMorph) morph++;
        }
        return { chunks, morph, shotErr: window.__shotErr || null, morphErr: window.__terrainMorphError || null };
    });

    await browser.close();
    await new Promise((r) => server.close(r));
    console.log(`Terrain-Chunks: ${info.chunks}, davon mit Cross-LOD-Morph: ${info.morph}`);
    if (info.shotErr) console.log(`⚠ Render-Fehler: ${info.shotErr}`);
    if (info.morphErr) console.log(`⚠ Morph-Material-Fehler: ${info.morphErr}`);
    console.log(`Screenshots: artifacts/terrain-geomorph-on.png + terrain-geomorph-off.png`);
    process.exit(0);
})();
