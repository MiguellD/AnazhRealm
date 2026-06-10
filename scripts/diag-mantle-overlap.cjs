// V18.118 — S-Befund (2 Browser-Bilder): „die blaue Meerfläche statisch, wird
// nicht entfernt wenn ich näher gehe" + „ebene Sheets über dem richtigen
// Terrain, durch die ich falle". WURZEL-VERDACHT: das B2-Mantel-LOCH sitzt um
// den ANKER (re-anchor erst nach reanchorDist), der Chunk-Ring folgt dem
// Spieler SOFORT → nach <reanchorDist Metern Lauf überdeckt die opake
// Mantel-Platte einen Großteil des Sicht-Rings. MISST den Überlapp NACH
// BEWEGUNG (Worst Case: knapp unter der Re-Anker-Schwelle) + Shot.
// exit 1, wenn un-gestanzte Mantel-Fläche im Sicht-Ring liegt.
//   node scripts/diag-mantle-overlap.cjs
const puppeteer = require("puppeteer");
const http = require("http");
const fs = require("fs");
const path = require("path");
const PORT = 4390;
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
    page.setDefaultTimeout(420000);
    await page.setViewport({ width: 1280, height: 720 });
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
                if (sz > 40 && stableFor > 60) break;
            }
            await new Promise((res) => setTimeout(res, 4));
        }
    });

    // BEWEGUNG: in 40-m-Schritten nach Osten, gesamt knapp unter reanchorDist.
    const rep = await page.evaluate(async () => {
        const r = window.anazhRealm;
        const s = r.state;
        const cfg = r.constructor.HORIZON_MANTLE;
        const startX = s.playerMesh.position.x;
        const startZ = s.playerMesh.position.z;
        const total = Math.max(40, (cfg.reanchorDist || 250) - 12);
        const step = 40;
        for (let moved = step; moved <= total; moved += step) {
            const body = s.playerBody;
            const gx = startX + moved;
            const gy = r.getTerrainHeightAt(gx, startZ);
            if (body && s.tmpTransform && typeof Ammo !== "undefined") {
                s.tmpTransform.setIdentity();
                s.tmpTransform.setOrigin(r.setVec(s.tmpVec1, gx, (Number.isFinite(gy) ? gy : 20) + 2.5, startZ));
                body.setWorldTransform(s.tmpTransform);
                body.setLinearVelocity(r.setVec(s.tmpVec2, 0, 0, 0));
                body.activate(true);
            }
            const t0 = performance.now();
            let lastSize = -1,
                stable = 0;
            while (performance.now() - t0 < 30000) {
                try {
                    r._gameLoopTick(performance.now());
                } catch (_e) {}
                const sz = s.voxelChunks ? s.voxelChunks.size : 0;
                if (sz === lastSize) stable++;
                else {
                    stable = 0;
                    lastSize = sz;
                }
                if (stable > 40) break;
                await new Promise((res) => setTimeout(res, 3));
            }
        }
        const pm = s.playerMesh.position;
        const m = s.horizonMantle;
        if (!m || !m.mesh) return { err: "kein Mantel" };
        const { span, ringRadius } = r._voxelChunkConfig();
        const ringEdge = (ringRadius + 0.5) * span;
        const anchorDist = Math.hypot(pm.x - m.anchorX, pm.z - m.anchorZ);
        // Stanz-Uniforms (nach dem Fix vorhanden): folgen sie dem Spieler?
        const u = s.mantleHoleUniforms || null;
        const shaderR = u ? u.r.value : 0;
        const uCenter = u ? { x: u.cx.value, z: u.cz.value } : null;
        // Überlapp: Mantel-Vertices INNERHALB der Ring-Kante um den SPIELER,
        // die NICHT von der Shader-Stanze gedeckt sind.
        const pos = m.mesh.geometry.getAttribute("position");
        let inRing = 0,
            unpunched = 0,
            seaPlates = 0;
        for (let i = 0; i < pos.count; i++) {
            const vx = pos.getX(i);
            const vz = pos.getZ(i);
            const dPlayer = Math.hypot(vx - pm.x, vz - pm.z);
            if (dPlayer >= ringEdge) continue;
            inRing++;
            const punched = u ? Math.hypot(vx - uCenter.x, vz - uCenter.z) < shaderR : false;
            if (!punched) {
                unpunched++;
                if (Math.abs(pos.getY(i) - ((s.waterLevel || 0) - 3)) < 0.5) seaPlates++;
            }
        }
        // Konstruktions-Ungleichung (nach dem Fix): geoHole + reanchor ≤ shaderR.
        const geoHoleR = m.geoHoleR || null;
        const ineq = u && geoHoleR !== null ? geoHoleR + cfg.reanchorDist <= shaderR + 0.01 : null;
        const uniformFollows = u ? Math.hypot(uCenter.x - pm.x, uCenter.z - pm.z) < 2 : false;
        return {
            moved: total,
            anchorDist: +anchorDist.toFixed(1),
            ringEdge: +ringEdge.toFixed(1),
            inRing,
            unpunched,
            seaPlates,
            hasUniforms: !!u,
            uniformFollows,
            shaderR: +(+shaderR).toFixed(1),
            geoHoleR,
            ineq,
            reanchorDist: cfg.reanchorDist,
        };
    });
    if (rep.err) {
        console.log("FEHLER:", rep.err);
        process.exit(1);
    }
    console.log(
        `Bewegung ${rep.moved} m (reanchorDist=${rep.reanchorDist})  Anker-Versatz=${rep.anchorDist} m  Ring-Kante=${rep.ringEdge} m`
    );
    console.log(
        `Mantel-Vertices im Sicht-Ring: ${rep.inRing}  davon UN-gestanzt: ${rep.unpunched}  (Meer-Platten: ${rep.seaPlates})`
    );
    console.log(
        `Stanze: uniforms=${rep.hasUniforms} folgtSpieler=${rep.uniformFollows} shaderR=${rep.shaderR} geoHoleR=${rep.geoHoleR} Ungleichung(geo+reanchor≤shader)=${rep.ineq}`
    );

    // Shot: Blick zur Seite (quer zur Bewegung) aufs überlappte Gebiet.
    await page.evaluate(() => {
        const r = window.anazhRealm;
        const s = r.state;
        for (const el of document.querySelectorAll(".overlay, .modal, .drawer, #chat-console"))
            el.style.display = "none";
        document.body.classList.add("hud-hidden");
        s.weather = "sunny";
        s.timeOfDay = 0.5;
        if (typeof r._applyDayNightToScene === "function") r._applyDayNightToScene();
        const pm = s.playerMesh.position;
        const cam = s.camera;
        const gy = r.getTerrainHeightAt(pm.x, pm.z);
        cam.position.set(pm.x, (Number.isFinite(gy) ? gy : 20) + 14, pm.z);
        cam.lookAt(pm.x, (Number.isFinite(gy) ? gy : 20) - 6, pm.z - 160);
        cam.updateMatrixWorld(true);
        if (window.__origRender) {
            s.renderer.render = window.__origRender;
            s.postProcessingFailed = true;
            try {
                r._loopRender(performance.now());
                r._loopRender(performance.now());
                r._loopRender(performance.now());
            } catch (_e) {}
            s.renderer.render = function () {};
        }
    });
    await new Promise((res) => setTimeout(res, 300));
    fs.mkdirSync(path.join(root, "artifacts"), { recursive: true });
    await page.screenshot({ path: path.join(root, "artifacts", "mantle-overlap.png") });
    console.log("Shot: artifacts/mantle-overlap.png");

    const bad = rep.unpunched > 0;
    await browser.close();
    server.close();
    console.log(bad ? "\nDIAG: MANTEL-ÜBERLAPP REPRODUZIERT (exit 1)" : "\nDIAG: sauber (exit 0)");
    process.exit(bad ? 1 : 0);
})();
