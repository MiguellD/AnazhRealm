// Diagnose T6 — die VISTA an MEHREREN Orten (der Fischer SIEHT, ich bin nicht pixel-blind für GEOMETRIE).
// Teleportiert den Spieler (Body, V13.0-Falle: setWorldTransform + activate), streamt die Region, hebt die
// Kamera HOCH (~+110 m) für eine Makro-Vista, zeichnet ein echtes Frame. Pro Ort ein PNG → das Makro-Drama
// (Canyons · weite Felder · Steilwände · Höhlen-Eingänge) + die Wasser-Optik mit dem AUGE prüfbar.
const puppeteer = require("puppeteer");
const http = require("http");
const fs = require("fs");
const path = require("path");
const PORT = 4373;
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

    // Warmup mit gestubbtem Render
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
    });

    await page.evaluate(() => {
        for (const id of ["dialogue-box", "intro-overlay", "onboarding", "start-overlay", "modal-overlay"]) {
            const el = document.getElementById(id);
            if (el) el.style.display = "none";
        }
        for (const el of document.querySelectorAll(".overlay, .modal, .drawer, #chat-console"))
            el.style.display = "none";
        // KERN: den Hintergrund-rAF-Loop STOPPEN — er resettet den Spieler auf (0,0) + PRUNED die ferne
        // Region zwischen meinen evaluate-Calls (der schwarze Far-Shot). Ohne ihn bleibt die gebaute Region stehen.
        const r = window.anazhRealm;
        if (r && r.state && r.state.renderer && r.state.renderer.setAnimationLoop) r.state.renderer.setAnimationLoop(null);
    });

    const spots = [
        ["spawn", 0, 0],
        ["canyon-1000n800", 1000, -800],
        ["extrem-2000x1500", 2000, 1500],
        ["schoepfer-250", 250, 250],
    ];

    fs.mkdirSync(ART, { recursive: true });
    const infos = [];
    for (const [name, tx, tz] of spots) {
        // ALLES in EINEM evaluate (kein rAF-Loop läuft mehr dazwischen → kein Prune/Reset): Spieler ans
        // Ziel, Ring force-sync bauen, Wasser drainen, alle Meshes sichtbar, Kamera HOCH, ein echtes Frame.
        const ready = await page.evaluate(
            (tx, tz) => {
                const r = window.anazhRealm;
                const s = r.state;
                const surf = r._terrainMacroSurfaceY(tx, tz);
                if (s.playerMesh) s.playerMesh.position.set(tx, surf + 3, tz);
                const span = r._voxelChunkConfig(0).span;
                const pcx = Math.floor(tx / span);
                const pcz = Math.floor(tz / span);
                r._setLastPlayerVoxelChunk(pcx, pcz);
                // Force-SYNC den 4-Ring (async-Worker-Builds finalisieren ohne Game-Loop nicht).
                for (let ring = 0; ring <= 4; ring++)
                    for (let dz = -ring; dz <= ring; dz++)
                        for (let dx = -ring; dx <= ring; dx++) {
                            if (Math.max(Math.abs(dx), Math.abs(dz)) !== ring) continue;
                            const cx = pcx + dx,
                                cz = pcz + dz;
                            if (s.voxelChunks.has(`${cx},${cz}`)) continue;
                            try {
                                const fresh = r._acquireVoxelChunkBuild(cx, cz, 0, { forceSync: true });
                                if (fresh && fresh !== "pending") r._finalizeVoxelChunkBuild(cx, cz, 0, fresh);
                            } catch (_e) {}
                        }
                // Wasser-Iso der Region.
                try {
                    s.pendingWaterIso = s.pendingWaterIso || new Set();
                    for (let dz = -4; dz <= 4; dz++)
                        for (let dx = -4; dx <= 4; dx++) s.pendingWaterIso.add(`${pcx + dx},${pcz + dz}`);
                    r._drainPendingWaterIso();
                } catch (_e) {}
                // Alle Chunk-/Wasser-Meshes sichtbar (Culling besiegen; nur die Ziel-Region ist gebaut).
                let near = 0;
                for (const [, e] of s.voxelChunks) {
                    if (!e || e.empty || !e.mesh) continue;
                    e.mesh.visible = true;
                    if (e.water) e.water.visible = true;
                    near++;
                }
                if (s.voxelChunkWaterIso) for (const [, m] of s.voxelChunkWaterIso) if (m) m.visible = true;
                // Kamera HOCH + zurück, schräg nach unten auf die Region.
                const cam = s.camera;
                if (cam) {
                    cam.position.set(tx - 120, surf + 110, tz - 120);
                    cam.lookAt(tx + 60, surf - 10, tz + 60);
                    if (cam.far < 2000) {
                        cam.far = 4000;
                        cam.updateProjectionMatrix();
                    }
                    cam.updateMatrixWorld(true);
                }
                let err = null;
                if (s.renderer && window.__origRendererRender) {
                    r.state.renderer.render = window.__origRendererRender;
                    s.postProcessingFailed = false;
                    try {
                        window.__origRendererRender(s.scene, cam);
                    } catch (_e) {
                        err = String((_e && _e.message) || _e);
                    }
                    r.state.renderer.render = function () {};
                }
                const pm = s.playerMesh ? s.playerMesh.position : { x: 0, z: 0 };
                return { surf: +surf.toFixed(1), near, total: s.voxelChunks.size, pmx: +pm.x.toFixed(0), pmz: +pm.z.toFixed(0), err };
            },
            tx,
            tz
        );
        await new Promise((res) => setTimeout(res, 200));
        const file = path.join(ART, `vista-${name}.png`);
        await page.screenshot({ path: file, fullPage: false });
        infos.push({ name, ...ready });
        console.log(
            `${name.padEnd(20)} spieler=(${ready.pmx},${ready.pmz})  sichtbar=${ready.near}  ${ready.err ? "⚠ " + ready.err : "✓"}`
        );
    }

    await browser.close();
    await new Promise((r) => server.close(r));
    console.log(`\nVistas: ${infos.map((i) => "artifacts/vista-" + i.name + ".png").join(", ")}\n`);
    process.exit(0);
})();
