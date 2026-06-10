// B9-Diagnose (gigant-plan §5, S-Befund 10.06.): „der Terrain-Boden selbst scheint
// noch nicht aufs Nachtlicht zu reagieren" (Bauwerke/Deko nach B8: „hammer").
// MESSEN, welcher Term den Boden nachts hochhält — Kandidaten:
//   (1) Ambient-Nacht-Floor 0.24 (V17.7-Lift)
//   (2) Hemisphere-Nacht-Floor 0.32 (×1.1 skyColor; seit B3 [Normalen up] bekommt
//       der Boden den VOLLEN Sky-Anteil — dot(N,up)=1)
//   (3) der Aerial-skyColor-Melt (distanz-gegated — naher Boden frei?)
//   (4) die vertexColors-Albedo (Schnee 0.92 etc.)
//   (5) der B2-Mantel (eigenes Material — selber Nacht-Sync?)
// Methode: settled Welt (diag-settled-view-Muster) → Tag-Shot → Mitternacht →
// Term-Dump + Nacht-Shot + Pixel-Helligkeits-Proben (Boden-Mitte vs Himmel).
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

    // settled laden (Render gestubbt)
    await page.evaluate(async () => {
        let stubbed = false;
        const start = performance.now();
        let lastSize = -1,
            stableFor = 0;
        while (performance.now() - start < 90000) {
            const r = window.anazhRealm;
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
                if (sz > 40 && stableFor > 60) break;
            }
            await new Promise((res) => setTimeout(res, 4));
        }
        const r = window.anazhRealm;
        try {
            r._drainPendingWaterIso && r._drainPendingWaterIso();
            r._drainPendingGrass && r._drainPendingGrass();
        } catch (_e) {}
        for (const id of ["dialogue-box", "intro-overlay", "onboarding", "start-overlay", "modal-overlay"]) {
            const el = document.getElementById(id);
            if (el) el.style.display = "none";
        }
        for (const el of document.querySelectorAll(".overlay, .modal, .drawer, #chat-console"))
            el.style.display = "none";
        document.body.classList.add("hud-hidden");
    });

    const shoot = async (file, timeOfDay) => {
        const meta = await page.evaluate((tod) => {
            const r = window.anazhRealm;
            const s = r.state;
            const pm = s.playerMesh;
            const cam = s.camera;
            if (!pm || !cam) return { err: "no player/cam" };
            // Tageszeit setzen + den Day-Night-Pfad ZIEHEN (der echte Konsument).
            if (tod !== null) {
                s.timeOfDay = tod;
                if (typeof r._applyDayNightToScene === "function") r._applyDayNightToScene();
            }
            const ex = pm.position.x,
                ey = pm.position.y + 1.6,
                ez = pm.position.z;
            cam.position.set(ex, ey, ez);
            cam.lookAt(ex, ey - 0.2 * 50, ez + 50);
            cam.updateMatrixWorld(true);
            let err = null;
            if (window.__origRender) {
                r.state.renderer.render = window.__origRender;
                s.postProcessingFailed = true;
                try {
                    if (typeof r._loopRender === "function") {
                        r._loopRender(performance.now());
                        r._loopRender(performance.now());
                        r._loopRender(performance.now());
                    } else window.__origRender(s.scene, cam);
                } catch (_e) {
                    err = String((_e && _e.message) || _e);
                }
                r.state.renderer.render = function () {};
            }
            // Term-Dump: die Licht-Wahrheit dieses Moments.
            const sun = s.directionalLight || s.sunLight;
            return {
                err,
                timeOfDay: s.timeOfDay,
                ambient: s.ambientLight ? +s.ambientLight.intensity.toFixed(3) : null,
                hemi: s.hemiLight ? +s.hemiLight.intensity.toFixed(3) : null,
                hemiSky: s.hemiLight ? "#" + s.hemiLight.color.getHexString() : null,
                sun: sun ? +sun.intensity.toFixed(3) : null,
                fog: s.fog ? "#" + s.fog.color.getHexString() : null,
                mantle: !!s.horizonMantle,
            };
        }, timeOfDay);
        await new Promise((res) => setTimeout(res, 300));
        await page.screenshot({ path: path.join(ART, file), fullPage: false });
        console.log(file, JSON.stringify(meta));
        return meta;
    };

    fs.mkdirSync(ART, { recursive: true });
    await shoot("night-terrain-day.png", 0.5); // Mittag (Referenz)
    await shoot("night-terrain-night.png", 0.0); // Mitternacht
    await browser.close();
    await new Promise((r) => server.close(r));
    console.log("\nB9-Diag: artifacts/night-terrain-{day,night}.png — Terme oben, Look mit dem Auge.\n");
    process.exit(0);
})();
