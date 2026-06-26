// LEICHTE LOOK-LINSE (V18.367) — der Schöpfer-Browser-Ersatz, der den swiftshader-
// Kumulativ-Last-Tod dieses Containers UMGEHT (diag-settled-view lädt 40+ Chunks @
// 1600x900 ohne protocolTimeout → stirbt). Hier der vom CLAUDE.md prescribed LIGHT-Pfad:
// kleine Welt (~16 Chunks), kleines Viewport (800x500), protocolTimeout, 1-2 Frames.
// Findet ein NACHGEWIESENES Wasser-Spot nahe Spawn, teleportiert den Spieler an die
// LAND-Kante (eyeAboveWater geloggt), blickt aufs Wasser, screenshottet.
const puppeteer = require("puppeteer");
const http = require("http");
const fs = require("fs");
const path = require("path");
const PORT = 4391;
const root = path.resolve(__dirname, "..");
const ART = path.join(root, "artifacts");
const mime = { ".html": "text/html", ".js": "application/javascript", ".wasm": "application/wasm", ".json": "application/json", ".woff2": "font/woff2", ".css": "text/css", ".png": "image/png" };
const server = http.createServer((req, res) => {
    let p = req.url.split("?")[0];
    if (p === "/") p = "/index.html";
    const fp = path.join(root, p);
    if (!fp.startsWith(root)) { res.statusCode = 403; return res.end(); }
    fs.readFile(fp, (err, data) => { if (err) { res.statusCode = 404; return res.end(); } res.setHeader("Content-Type", mime[path.extname(fp)] || "application/octet-stream"); res.end(data); });
});
(async () => {
    fs.mkdirSync(ART, { recursive: true });
    await new Promise((r) => server.listen(PORT, r));
    const browser = await puppeteer.launch({
        headless: true,
        protocolTimeout: 600000,
        args: ["--use-angle=swiftshader", "--enable-unsafe-swiftshader", "--enable-webgl", "--ignore-gpu-blocklist", "--no-sandbox", "--disable-setuid-sandbox"],
    });
    const page = await browser.newPage();
    await page.setViewport({ width: 800, height: 500 });
    page.on("pageerror", (e) => console.log("[PAGE-ERROR]", (e.stack || e.message).split("\n")[0]));
    await page.goto(`http://127.0.0.1:${PORT}/index.html`, { waitUntil: "domcontentloaded", timeout: 30000 });

    // PHASE 1 — kleine Welt laden (Render gestubbt), bis ein kleiner Ring steht.
    await page.evaluate(async () => {
        let stubbed = false;
        const start = performance.now();
        let lastSize = -1, stableFor = 0;
        while (performance.now() - start < 80000) {
            const r = window.anazhRealm;
            if (r && !stubbed && r.state && r.state.renderer) {
                window.__origRender = r.state.renderer.render.bind(r.state.renderer);
                r.state.renderer.render = function () {};
                if (typeof r.state.renderer.renderAsync === "function") r.state.renderer.renderAsync = () => Promise.resolve();
                r.state.postProcessingFailed = true;
                stubbed = true;
            }
            if (r && typeof r._gameLoopTick === "function") {
                try { r._gameLoopTick(performance.now()); } catch (_e) {}
                const sz = r.state && r.state.voxelChunks ? r.state.voxelChunks.size : 0;
                if (sz === lastSize) stableFor++; else { stableFor = 0; lastSize = sz; }
                if (sz >= 16 && stableFor > 40) break;
            }
            await new Promise((res) => setTimeout(res, 4));
        }
        const r = window.anazhRealm;
        try { r._drainPendingWaterIso && r._drainPendingWaterIso(); r._drainPendingGrass && r._drainPendingGrass(); } catch (_e) {}
    });

    // UI ausblenden (alles ausser dem Canvas) + den eigenen Avatar verstecken (sonst füllt der Körper das Bild)
    await page.evaluate(() => {
        const cv = document.querySelector("canvas");
        for (const el of Array.from(document.body.children)) if (el !== cv && el.tagName !== "SCRIPT") el.style.display = "none";
        const r = window.anazhRealm;
        if (r && r.state && r.state.playerMesh) r.state.playerMesh.visible = false;
    });

    // Ein Wasser-Spot finden + den Spieler an die Land-Kante stellen, aufs Wasser blickend.
    const FIXED = process.env.ANAZH_POS ? process.env.ANAZH_POS.split(",").map(Number) : null;
    const spot = await page.evaluate((FIXED) => {
        const r = window.anazhRealm; const s = r.state; const pm = s.playerMesh;
        if (!pm) return { err: "no player" };
        if (FIXED && FIXED.length >= 2) {
            // exakte Schöpfer-Position reproduzieren (ANAZH_POS="x,z")
            const fx = FIXED[0], fz = FIXED[1];
            const fy = (typeof r.getTerrainHeightAt === "function" ? r.getTerrainHeightAt(fx, fz) : 0);
            pm.position.set(fx, fy + 1.7, fz);
            if (s.camera) s.camera.position.copy(pm.position);
            // Wasser in der Nähe als Blickziel
            const wlF = (x, z) => (typeof r._waterLevelAt === "function" ? r._waterLevelAt(x, z) : -Infinity);
            const thF = (x, z) => (typeof r.getTerrainHeightAt === "function" ? r.getTerrainHeightAt(x, z) : 0);
            let wt = null;
            for (let rad = 4; rad <= 60 && !wt; rad += 4) for (let a = 0; a < 360; a += 20) {
                const x = fx + Math.cos(a * Math.PI / 180) * rad, z = fz + Math.sin(a * Math.PI / 180) * rad;
                if (wlF(x, z) > thF(x, z) + 0.4) { wt = { x, z }; break; }
            }
            return { fixed: true, wx: wt ? +wt.x.toFixed(1) : fx, wz: wt ? +wt.z.toFixed(1) : fz + 10, px: +fx.toFixed(1), pz: +fz.toFixed(1), eyeY: +(fy + 1.7).toFixed(1) };
        }
        const cx = pm.position.x, cz = pm.position.z;
        const wl = (x, z) => (typeof r._waterLevelAt === "function" ? r._waterLevelAt(x, z) : -Infinity);
        const th = (x, z) => (typeof r.getTerrainHeightAt === "function" ? r.getTerrainHeightAt(x, z) : 0);
        const isWater = (x, z) => { const w = wl(x, z), g = th(x, z); return Number.isFinite(w) && w > g + 0.6; };
        // radial nach Wasser suchen, dann das GRÖSSTE Wasser nehmen (meiste Wasser-Nachbarn im 12m-Ring)
        const cands = [];
        for (let rad = 6; rad <= 140; rad += 4) {
            for (let a = 0; a < 360; a += 12) {
                const x = cx + Math.cos(a * Math.PI / 180) * rad;
                const z = cz + Math.sin(a * Math.PI / 180) * rad;
                if (isWater(x, z)) {
                    let n = 0;
                    for (let dx = -12; dx <= 12; dx += 6) for (let dz = -12; dz <= 12; dz += 6) if (isWater(x + dx, z + dz)) n++;
                    cands.push({ x, z, w: wl(x, z), g: th(x, z), ang: a, n });
                }
            }
            if (cands.length > 30) break;
        }
        cands.sort((p, q) => q.n - p.n);
        const best = cands[0];
        if (!best) return { err: "kein Wasser nahe Spawn (cx,cz)=" + cx.toFixed(0) + "," + cz.toFixed(0) };
        // Land-Kante in Richtung Wasser: rückwärts vom Wasser-Punkt, bis Land über Wasser
        let lx = best.x, lz = best.z;
        const dirx = Math.cos(best.ang * Math.PI / 180), dirz = Math.sin(best.ang * Math.PI / 180);
        for (let back = 0; back < 30; back += 1.5) {
            const x = best.x - dirx * back, z = best.z - dirz * back;
            if (th(x, z) > wl(x, z) + 0.3) { lx = x; lz = z; break; }
        }
        const groundY = th(lx, lz);
        pm.position.set(lx, groundY + 1.7, lz);
        if (s.camera) s.camera.position.copy(pm.position);
        return { lx: +lx.toFixed(1), lz: +lz.toFixed(1), wx: +best.x.toFixed(1), wz: +best.z.toFixed(1), waterY: +best.w.toFixed(1), groundY: +groundY.toFixed(1), eyeAboveWater: +(groundY + 1.7 - best.w).toFixed(1), ang: best.ang };
    }, FIXED);
    console.log("Wasser-Spot:", JSON.stringify(spot));

    const shoot = async (file, lookAtWater, pitchDeg) => {
        const meta = await page.evaluate((lookAtWater, pitchDeg, spot) => {
            const r = window.anazhRealm; const s = r.state; const pm = s.playerMesh; const cam = s.camera;
            if (!pm || !cam) return { err: "no player/cam" };
            const ex = pm.position.x, ey = pm.position.y, ez = pm.position.z;
            // yaw Richtung Wasser
            const yaw = Math.atan2((spot.wx ?? ex) - ex, (spot.wz ?? ez) - ez);
            const pitch = (pitchDeg * Math.PI) / 180;
            cam.position.set(ex, ey, ez);
            const dir = { x: Math.sin(yaw) * Math.cos(pitch), y: Math.sin(pitch), z: Math.cos(yaw) * Math.cos(pitch) };
            cam.lookAt(ex + dir.x * 50, ey + dir.y * 50, ez + dir.z * 50);
            cam.updateMatrixWorld(true);
            let err = null;
            if (window.__origRender) {
                r.state.renderer.render = window.__origRender;
                s.postProcessingFailed = true;
                try {
                    if (typeof r._loopRender === "function") { r._loopRender(performance.now()); r._loopRender(performance.now()); }
                    else window.__origRender(s.scene, cam);
                } catch (_e) { err = String((_e && _e.message) || _e); }
                r.state.renderer.render = function () {};
            } else err = "no origRender";
            void lookAtWater;
            return { err };
        }, lookAtWater, pitchDeg, spot);
        await new Promise((res) => setTimeout(res, 250));
        await page.screenshot({ path: path.join(ART, file), fullPage: false });
        console.log(`${file.padEnd(28)} ${meta.err ? "WARN " + meta.err : "OK"}`);
    };

    await shoot("look-water-level.png", true, -8);
    await shoot("look-water-down.png", true, -28);

    // ZENIT-PROBE: Overcast erzwingen + GERADE HOCH schauen → füllt die Zenit-Kappe Wolken
    // (kein „Radierer"-Loch in der Mitte)? (V18.369-Verifikation)
    await page.evaluate(() => {
        const r = window.anazhRealm; const s = r.state;
        try { s.weather = "rainy"; s.weatherTransition = null; } catch (_e) {}
        try { if (r._applyDayNightToScene) r._applyDayNightToScene(); } catch (_e) {}
        try { if (s.skyboxUniforms && s.skyboxUniforms.cloudCover) s.skyboxUniforms.cloudCover.value = 0.92; } catch (_e) {}
    });
    await shoot("look-sky-up.png", true, 80);

    await browser.close();
    await new Promise((r) => server.close(r));
    console.log("\nScreenshots: artifacts/look-water-{level,down}.png");
    process.exit(0);
})();
