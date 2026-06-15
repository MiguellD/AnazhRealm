// diag-look.cjs — SCHNELLER Schöpfer-Blick (Schöpfer-Idee: nur 3×3 Chunks laden).
// chunkRingRadius=1 → ~9 statt 81 Chunks → settle + swiftshader-Render VIEL schneller.
// Settled, Augenhöhe, NEUTRAL-beurteilbar (Aura subtil, Himmel blau). Vier Richtungen.
//   node scripts/diag-look.cjs
const puppeteer = require("puppeteer");
const http = require("http");
const fs = require("fs");
const path = require("path");
const PORT = 4378;
const root = path.resolve(__dirname, "..");
const ART = path.join(root, "artifacts");
const mime = { ".html": "text/html", ".js": "application/javascript", ".wasm": "application/wasm", ".json": "application/json", ".woff2": "font/woff2", ".css": "text/css", ".png": "image/png" };
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
(async () => {
    fs.mkdirSync(ART, { recursive: true });
    await new Promise((r) => server.listen(PORT, r));
    // protocolTimeout hoch: der swiftshader-CPU-Render (KEINE GPU im Container) ist
    // sekunden-langsam — ein synchroner _loopRender darf den Default (180s) nicht reißen.
    const browser = await puppeteer.launch({ headless: true, protocolTimeout: 600000, args: ["--use-angle=swiftshader", "--enable-unsafe-swiftshader", "--enable-webgl", "--ignore-gpu-blocklist", "--no-sandbox", "--disable-setuid-sandbox"] });
    const page = await browser.newPage();
    // KLEIN: der swiftshader-CPU-Raster kostet ~linear in Pixeln — 640×360 ist 8× billiger als 1280×720.
    await page.setViewport({ width: 640, height: 360 });
    page.on("pageerror", (e) => console.log("[PAGE-ERROR]", (e.stack || e.message).split("\n")[0]));
    await page.goto(`http://127.0.0.1:${PORT}/index.html`, { waitUntil: "domcontentloaded", timeout: 30000 });

    // 3×3-Ring + Render-Stub, settlen bis die Chunk-Zahl stabil ist (wenige Chunks → schnell)
    const settle = await page.evaluate(async () => {
        const start = performance.now();
        let stubbed = false,
            last = -1,
            stable = 0,
            sz = 0;
        while (performance.now() - start < 70000) {
            const r = window.anazhRealm;
            if (r && r.state) {
                if (r.state.chunkRingRadius !== 1) r.state.chunkRingRadius = 1; // 3×3
                if (!stubbed && r.state.renderer) {
                    window.__origRender = r.state.renderer.render.bind(r.state.renderer);
                    r.state.renderer.render = function () {};
                    if (typeof r.state.renderer.renderAsync === "function") r.state.renderer.renderAsync = () => Promise.resolve();
                    r.state.postProcessingFailed = true;
                    stubbed = true;
                }
            }
            if (r && typeof r._gameLoopTick === "function") {
                try {
                    r._gameLoopTick(performance.now());
                } catch (_e) {}
                sz = r.state && r.state.voxelChunks ? r.state.voxelChunks.size : 0;
                if (sz === last && sz >= 9) stable++;
                else ((stable = 0), (last = sz));
                if (sz >= 9 && stable > 40) break;
            }
            await new Promise((res) => setTimeout(res, 4));
        }
        const r = window.anazhRealm;
        try {
            r._drainPendingWaterIso && r._drainPendingWaterIso();
            r._drainPendingGrass && r._drainPendingGrass();
        } catch (_e) {}
        return { chunks: sz, t: Math.round((performance.now() - start) / 1000) };
    });
    console.log(`settled: ${settle.chunks} chunks in ~${settle.t}s (3×3-Ring)`);

    await page.evaluate(() => {
        for (const id of ["dialogue-box", "intro-overlay", "onboarding", "start-overlay", "modal-overlay"]) {
            const el = document.getElementById(id);
            if (el) el.style.display = "none";
        }
        for (const el of document.querySelectorAll(".overlay, .modal, .drawer, #chat-console")) el.style.display = "none";
    });

    const shoot = async (file, yawDeg, pitchDeg, info) => {
        const meta = await page.evaluate(
            async (yawDeg, pitchDeg) => {
                const r = window.anazhRealm,
                    s = r.state,
                    pm = s.playerMesh,
                    cam = s.camera;
                if (!pm || !cam) return { err: "no player/cam" };
                const yaw = (yawDeg * Math.PI) / 180,
                    pitch = (pitchDeg * Math.PI) / 180;
                const ex = pm.position.x,
                    ey = pm.position.y + 1.6,
                    ez = pm.position.z;
                cam.position.set(ex, ey, ez);
                const dir = { x: Math.sin(yaw) * Math.cos(pitch), y: Math.sin(pitch), z: Math.cos(yaw) * Math.cos(pitch) };
                cam.lookAt(ex + dir.x * 50, ey + dir.y * 50, ez + dir.z * 50);
                cam.updateMatrixWorld(true);
                let err = null;
                if (window.__origRender) {
                    r.state.renderer.render = window.__origRender;
                    s.postProcessingFailed = true;
                    // SCHATTEN AUS (der Shadow-Pass rendert die Szene ein zweites Mal — der
                    // teuerste CPU-Posten; für den Boden/Atmosphäre-Blick irrelevant).
                    try {
                        if (r.state.renderer.shadowMap) r.state.renderer.shadowMap.enabled = false;
                    } catch (_e) {}
                    try {
                        // Der ERSTE Render kompiliert ALLE WGSL-Shader auf der CPU (swiftshader) —
                        // das ist async + dauert Minuten. _loopRender setzt die Uniforms + stößt an;
                        // renderAsync AWAITEN wartet auf den Compile (protocolTimeout ist hoch).
                        if (typeof r._loopRender === "function") r._loopRender(performance.now());
                        if (typeof r.state.renderer.renderAsync === "function") {
                            await r.state.renderer.renderAsync(s.scene, cam);
                            await r.state.renderer.renderAsync(s.scene, cam); // 2. Frame: jetzt kompiliert → sauberes Bild
                        } else window.__origRender(s.scene, cam);
                    } catch (e) {
                        err = String((e && e.message) || e);
                    }
                    r.state.renderer.render = function () {};
                }
                return { px: +pm.position.x.toFixed(1), py: +pm.position.y.toFixed(1), pz: +pm.position.z.toFixed(1), err };
            },
            yawDeg,
            pitchDeg
        );
        await new Promise((res) => setTimeout(res, 400));
        await page.screenshot({ path: path.join(ART, file), fullPage: false });
        console.log(`${file.padEnd(22)} spieler=(${meta.px},${meta.py},${meta.pz}) yaw=${yawDeg} pitch=${pitchDeg}  ${meta.err ? "⚠ " + meta.err : "✓"} ${info || ""}`);
    };

    // EIN informativer Blick zuerst (Boden nah + Horizont + Himmel): Geologie + Atmosphäre.
    await shoot("look-n.png", 0, -14, "(Nord, Augenhöhe + Boden)");

    await browser.close();
    await new Promise((r) => server.close(r));
    console.log("\nartifacts/look-{n,e,s,down}.png");
    process.exit(0);
})();
