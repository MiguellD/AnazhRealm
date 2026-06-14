// DIAGNOSE Ω-OPSIS Säule I — SEHE ICH DIE LAWFUL GEOLOGIE? (V18.226)
// Der Full-Scatter (V18.224/.225) timeoutet den swiftshader-Headless-Render. Die
// Geologie sitzt aber auf dem NACKTEN Terrain → Scatter AUS → schneller Render →
// ich sehe sie. A/B: geoRock/geoMoss = 1 (an) vs 0 (aus) am SELBEN settled Frame,
// vier Richtungen auf Augenhöhe. Differenz an den Hängen = die Säule wirkt.
const puppeteer = require("puppeteer");
const http = require("http");
const fs = require("fs");
const path = require("path");
const PORT = 4378;
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
    await page.setViewport({ width: 1600, height: 900 });
    page.on("pageerror", (e) => console.log("[PAGE-ERROR]", (e.stack || e.message).split("\n")[0]));
    await page.goto(`http://127.0.0.1:${PORT}/index.html`, { waitUntil: "domcontentloaded", timeout: 30000 });

    // PHASE 1 — settle mit gestubbtem Render + SCATTER AUS (das macht den echten
    // Render schnell genug für den swiftshader-Container).
    await page.evaluate(async () => {
        let stubbed = false;
        const start = performance.now();
        let lastSize = -1,
            stableFor = 0;
        while (performance.now() - start < 60000) {
            const r = window.anazhRealm;
            if (r && r.state && r.state.atmosphere) r.state.atmosphere.gpuScatter = false;
            if (r && !stubbed && r.state && r.state.renderer) {
                window.__origRender = r.state.renderer.render.bind(r.state.renderer);
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
                const sz = r.state && r.state.voxelChunks ? r.state.voxelChunks.size : 0;
                if (sz === lastSize) stableFor++;
                else {
                    stableFor = 0;
                    lastSize = sz;
                }
                if (sz > 30 && stableFor > 50) break;
            }
            await new Promise((res) => setTimeout(res, 4));
        }
        const r = window.anazhRealm;
        try {
            if (r._disposeAllScatterRegions) r._disposeAllScatterRegions();
            r._drainPendingWaterIso && r._drainPendingWaterIso();
            r._drainPendingGrass && r._drainPendingGrass();
        } catch (_e) {}
    });

    await page.evaluate(() => {
        for (const id of ["dialogue-box", "intro-overlay", "onboarding", "start-overlay", "modal-overlay"]) {
            const el = document.getElementById(id);
            if (el) el.style.display = "none";
        }
        for (const el of document.querySelectorAll(".overlay, .modal, .drawer, #chat-console"))
            el.style.display = "none";
    });

    const shoot = async (file, yawDeg, pitchDeg, geo) => {
        const meta = await page.evaluate(
            (yawDeg, pitchDeg, geo) => {
                const r = window.anazhRealm;
                const s = r.state;
                const pm = s.playerMesh;
                const cam = s.camera;
                if (!pm || !cam) return { err: "no player/cam" };
                // Geologie an/aus über die Live-Uniforms (die Säule isolieren).
                const au = r._ensureAtmoUniforms && r._ensureAtmoUniforms();
                if (au && au.geoRock) au.geoRock.value = geo;
                if (au && au.geoMoss) au.geoMoss.value = geo;
                const yaw = (yawDeg * Math.PI) / 180;
                const pitch = (pitchDeg * Math.PI) / 180;
                const ex = pm.position.x,
                    ey = pm.position.y + 1.6,
                    ez = pm.position.z;
                cam.position.set(ex, ey, ez);
                const dir = {
                    x: Math.sin(yaw) * Math.cos(pitch),
                    y: Math.sin(pitch),
                    z: Math.cos(yaw) * Math.cos(pitch),
                };
                cam.lookAt(ex + dir.x * 50, ey + dir.y * 50, ez + dir.z * 50);
                cam.updateMatrixWorld(true);
                let err = null;
                if (window.__origRender) {
                    r.state.renderer.render = window.__origRender;
                    s.postProcessingFailed = true;
                    try {
                        if (typeof r._loopRender === "function") {
                            r._loopRender(performance.now());
                            r._loopRender(performance.now());
                        } else window.__origRender(s.scene, cam);
                    } catch (_e) {
                        err = String((_e && _e.message) || _e);
                    }
                    r.state.renderer.render = function () {};
                    return { px: +pm.position.x.toFixed(1), py: +pm.position.y.toFixed(1), pz: +pm.position.z.toFixed(1), err };
                }
                return { err: "no origRender" };
            },
            yawDeg,
            pitchDeg,
            geo
        );
        await new Promise((res) => setTimeout(res, 250));
        await page.screenshot({ path: path.join(ART, file), fullPage: false });
        console.log(`${file.padEnd(30)} spieler=(${meta.px},${meta.py},${meta.pz}) yaw=${yawDeg} geo=${geo}  ${meta.err ? "⚠ " + meta.err : "✓"}`);
        return meta;
    };

    fs.mkdirSync(ART, { recursive: true });
    // vier Richtungen, je AN (Geologie) und AUS (reiner Biom-Albedo) — die Differenz
    // an den Hängen ist die Säule.
    for (const [yaw, tag] of [
        [0, "n"],
        [90, "e"],
        [180, "s"],
        [270, "w"],
    ]) {
        await shoot(`geo-on-${tag}.png`, yaw, -14, 1);
        await shoot(`geo-off-${tag}.png`, yaw, -14, 0);
    }

    await browser.close();
    await new Promise((r) => server.close(r));
    console.log("\nGeologie A/B: artifacts/geo-{on,off}-{n,e,s,w}.png — Differenz an Hängen = die Säule wirkt.");
    process.exit(0);
})();
