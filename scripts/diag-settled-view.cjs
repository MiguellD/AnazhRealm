// Diagnose: SEHE ICH, WAS DER SCHÖPFER SIEHT? (Schöpfer-Korrektur 09.06.: meine Vistas sahen „basic"
// aus, WEIL ich weit weg + un-settled war [force-build, loop-stop, hohe Kamera = alles fern = Aerial-Haze].
// Der Test: am SPAWN bleiben, die Welt NORMAL voll laden lassen (kein Teleport/force-build), die Kamera auf
// AUGENHÖHE (wie ein Spieler), den ECHTEN Render, DANN screenshotten. Sieht es jetzt reich/cel-shaded aus
// [= der Schöpfer hat recht, die „GPU-untreu/pixel-blind"-Lehre ist überzogen] oder weiter basic?
// Plus: die NÄHTE suchen — nach dem Settle einen Block setzen + screenshotten (resettet der Chunk sichtbar?)
// + schnell laufen (poppen Chunks höhenversetzt?).
const puppeteer = require("puppeteer");
const http = require("http");
const fs = require("fs");
const path = require("path");
const PORT = 4377;
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

    // PHASE 1 — die Welt voll laden lassen (Render gestubbt für Tempo), bis der Streaming-Ring SETTLED ist.
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
                if (typeof r.state.renderer.renderAsync === "function") r.state.renderer.renderAsync = () => Promise.resolve();
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
                // settled = Ring voll + 2 s stabil (alle LODs/Wasser/Geomorph nachgezogen)
                if (sz > 40 && stableFor > 60) break;
            }
            await new Promise((res) => setTimeout(res, 4));
        }
        // den Wasser-Iso + Gras drainen (synchron, damit nichts fehlt)
        const r = window.anazhRealm;
        try {
            r._drainPendingWaterIso && r._drainPendingWaterIso();
            r._drainPendingGrass && r._drainPendingGrass();
        } catch (_e) {}
    });

    // UI ausblenden
    await page.evaluate(() => {
        for (const id of ["dialogue-box", "intro-overlay", "onboarding", "start-overlay", "modal-overlay"]) {
            const el = document.getElementById(id);
            if (el) el.style.display = "none";
        }
        for (const el of document.querySelectorAll(".overlay, .modal, .drawer, #chat-console")) el.style.display = "none";
    });

    // Ein settled EYE-LEVEL-Frame zeichnen (echter Render). Kamera am Spieler, Augenhöhe, leicht nach unten.
    const shoot = async (file, yawDeg, pitchDeg, info) => {
        const meta = await page.evaluate(
            (yawDeg, pitchDeg) => {
                const r = window.anazhRealm;
                const s = r.state;
                const pm = s.playerMesh;
                const cam = s.camera;
                if (!pm || !cam) return { err: "no player/cam" };
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
                // echten Render an + ein Frame (mit allen per-Frame-Uniform-Updates via _loopRender)
                if (window.__origRender) {
                    r.state.renderer.render = window.__origRender;
                    s.postProcessingFailed = false;
                    let err = null;
                    try {
                        if (typeof r._loopRender === "function") r._loopRender();
                        else window.__origRender(s.scene, cam);
                    } catch (_e) {
                        err = String((_e && _e.message) || _e);
                    }
                    r.state.renderer.render = function () {};
                    return { px: +pm.position.x.toFixed(1), py: +pm.position.y.toFixed(1), pz: +pm.position.z.toFixed(1), err };
                }
                return { err: "no origRender" };
            },
            yawDeg,
            pitchDeg
        );
        await new Promise((res) => setTimeout(res, 300));
        await page.screenshot({ path: path.join(ART, file), fullPage: false });
        console.log(`${file.padEnd(34)} spieler=(${meta.px},${meta.py},${meta.pz}) yaw=${yawDeg} pitch=${pitchDeg}  ${meta.err ? "⚠ " + meta.err : "✓"} ${info || ""}`);
        return meta;
    };

    fs.mkdirSync(ART, { recursive: true });
    // vier Himmelsrichtungen auf Augenhöhe, leicht nach unten (natürliche Spieler-Sicht)
    await shoot("settled-spawn-n.png", 0, -12, "(settled, Augenhöhe, Nord)");
    await shoot("settled-spawn-e.png", 90, -12, "(Ost)");
    await shoot("settled-spawn-s.png", 180, -12, "(Süd)");
    await shoot("settled-spawn-w.png", 270, -12, "(West)");

    await browser.close();
    await new Promise((r) => server.close(r));
    console.log("\nSettled-Spawn-Screenshots: artifacts/settled-spawn-{n,e,s,w}.png");
    console.log("→ Sieht es reich/cel-shaded aus (Schöpfer hat recht: Distanz/Laden, nicht GPU-untreu)?\n");
    process.exit(0);
})();
