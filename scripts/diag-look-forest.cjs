// DAS NEUE KLEID Welle 1 — DIE WALD-LOOK-LINSE (leicht, swiftshader, world-lighting).
// Bootet eine kleine Welt, findet einen bewaldeten Land-Spot, teleportiert den Spieler auf
// Augenhöhe, setzt klare Mittags-Beleuchtung, schaut waagrecht in die Krone + screenshottet.
// So sehe ich die Blätter unter der ECHTEN Welt-Beleuchtung (nicht dem Studio-Key-Light von
// diag-werk-render, das die besonnten Blätter warm wusch). Der world-forest-Richter.
const puppeteer = require("puppeteer");
const http = require("http");
const fs = require("fs");
const path = require("path");
const PORT = 4393;
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
    await page.setViewport({ width: 900, height: 600 });
    page.on("pageerror", (e) => console.log("[PAGE-ERROR]", (e.stack || e.message).split("\n")[0]));
    await page.goto(`http://127.0.0.1:${PORT}/index.html`, { waitUntil: "domcontentloaded", timeout: 30000 });

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
                if (sz >= 20 && stableFor > 50) break;
            }
            await new Promise((res) => setTimeout(res, 4));
        }
        const r = window.anazhRealm;
        // Laub-Wachstum + Streaming voll ausfahren (headless → foliageRadius MAX, aber sicher).
        try {
            for (let i = 0; i < 400; i++) {
                r._gameLoopTick && r._gameLoopTick(performance.now());
            }
            r._drainPendingGrass && r._drainPendingGrass();
        } catch (_e) {}
    });

    // UI + Avatar ausblenden.
    await page.evaluate(() => {
        const cv = document.querySelector("canvas");
        for (const el of Array.from(document.body.children))
            if (el !== cv && el.tagName !== "SCRIPT") el.style.display = "none";
        const r = window.anazhRealm;
        if (r && r.state && r.state.playerMesh) r.state.playerMesh.visible = false;
    });

    // Klaren Mittag setzen (kein Wetter-Dimm, Sonne hoch) + einen bewaldeten Land-Spot suchen.
    const spot = await page.evaluate(() => {
        const r = window.anazhRealm;
        const s = r.state;
        const pm = s.playerMesh;
        try {
            s.weather = "clear";
            s.weatherTransition = null;
            if (typeof s.timeOfDay === "number") s.timeOfDay = 0.5;
        } catch (_e) {}
        try {
            if (r._setTimeOfDay) r._setTimeOfDay(0.42);
        } catch (_e) {}
        try {
            if (r._applyDayNightToScene) r._applyDayNightToScene();
        } catch (_e) {}
        if (!pm) return { err: "no player" };
        const cx = pm.position.x,
            cz = pm.position.z;
        const th = (x, z) => (typeof r.getTerrainHeightAt === "function" ? r.getTerrainHeightAt(x, z) : 0);
        const wl = (x, z) => (typeof r._waterLevelAt === "function" ? r._waterLevelAt(x, z) : -Infinity);
        // Trocken-Land-Spot mit moderater Höhe (kein Wasser, nicht zu steil) nahe Spawn.
        let best = null;
        for (let rad = 8; rad <= 90 && !best; rad += 6) {
            for (let a = 0; a < 360; a += 15) {
                const x = cx + Math.cos((a * Math.PI) / 180) * rad,
                    z = cz + Math.sin((a * Math.PI) / 180) * rad;
                const g = th(x, z),
                    w = wl(x, z);
                if (g > w + 2.5) {
                    best = { x, z, g };
                    break;
                }
            }
        }
        const lx = best ? best.x : cx,
            lz = best ? best.z : cz,
            gy = th(lx, lz);
        pm.position.set(lx, gy + 1.7, lz);
        if (s.camera) s.camera.position.copy(pm.position);
        return { lx: +lx.toFixed(1), lz: +lz.toFixed(1), eyeY: +(gy + 1.7).toFixed(1) };
    });
    console.log("Wald-Spot:", JSON.stringify(spot));

    const shoot = async (file, yawDeg, pitchDeg) => {
        const meta = await page.evaluate(
            (yawDeg, pitchDeg) => {
                const r = window.anazhRealm;
                const s = r.state;
                const pm = s.playerMesh;
                const cam = s.camera;
                if (!pm || !cam) return { err: "no player/cam" };
                const ex = pm.position.x,
                    ey = pm.position.y,
                    ez = pm.position.z;
                const yaw = (yawDeg * Math.PI) / 180,
                    pitch = (pitchDeg * Math.PI) / 180;
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
                } else err = "no origRender";
                return { err };
            },
            yawDeg,
            pitchDeg
        );
        await new Promise((res) => setTimeout(res, 250));
        await page.screenshot({ path: path.join(ART, file), fullPage: false });
        console.log(`${file.padEnd(30)} ${meta.err ? "WARN " + meta.err : "OK"}`);
    };

    // Vier Blickrichtungen, leicht nach oben in die Kronen.
    await shoot("look-forest-n.png", 0, 6);
    await shoot("look-forest-e.png", 90, 6);
    await shoot("look-forest-s.png", 180, 6);
    await shoot("look-forest-w.png", 270, 6);

    await browser.close();
    await new Promise((r) => server.close(r));
    console.log("\nScreenshots: artifacts/look-forest-{n,e,s,w}.png");
    process.exit(0);
})();
