// V18.377 — DAS EIGENE AUGE: (1) Wasser-Tiefe KONTINUIERLICH (kein 3-Band-Sprung) am Tag,
// (2) ECHTES MONDLICHT bei Nacht (gerichtet, kühl, kein Post-FX-Wasch-Lift). Light-Pfad.
// WICHTIG (Schöpfer-Befund): der AVATAR-Körper steht in 1st-Person beim Runterschauen IM BILD →
// er verdeckt das Wasser. Darum: _loopRender stellt Kamera+Tag/Nacht (Avatar sichtbar), DANN
// playerMesh.visible=false + EIN Post-FX-Render = sauberes Bild OHNE Körper.
const puppeteer = require("puppeteer");
const http = require("http");
const fs = require("fs");
const path = require("path");
const PORT = 4398;
const root = path.resolve(__dirname, "..");
const ART = path.join(root, "artifacts");
const mime = { ".html": "text/html", ".js": "application/javascript", ".wasm": "application/wasm", ".json": "application/json", ".woff2": "font/woff2", ".css": "text/css", ".png": "image/png" };
const server = http.createServer((req, res) => {
    let p = req.url.split("?")[0]; if (p === "/") p = "/index.html";
    const fp = path.join(root, p);
    if (!fp.startsWith(root)) { res.statusCode = 403; return res.end(); }
    fs.readFile(fp, (err, data) => { if (err) { res.statusCode = 404; return res.end(); } res.setHeader("Content-Type", mime[path.extname(fp)] || "application/octet-stream"); res.end(data); });
});
(async () => {
    fs.mkdirSync(ART, { recursive: true });
    await new Promise((r) => server.listen(PORT, r));
    const browser = await puppeteer.launch({ headless: true, protocolTimeout: 600000, args: ["--use-angle=swiftshader", "--enable-unsafe-swiftshader", "--enable-webgl", "--ignore-gpu-blocklist", "--no-sandbox", "--disable-setuid-sandbox"] });
    const page = await browser.newPage();
    await page.setViewport({ width: 860, height: 560 });
    page.on("pageerror", (e) => console.log("[PAGE-ERROR]", (e.stack || e.message).split("\n")[0]));
    await page.goto(`http://127.0.0.1:${PORT}/index.html`, { waitUntil: "domcontentloaded", timeout: 30000 });

    await page.evaluate(async () => {
        let stubbed = false; const start = performance.now(); let lastSize = -1, stableFor = 0;
        while (performance.now() - start < 80000) {
            const r = window.anazhRealm;
            if (r && !stubbed && r.state && r.state.renderer) {
                window.__origRender = r.state.renderer.render.bind(r.state.renderer);
                r.state.renderer.render = function () {}; // Warmup render-frei (Post-FX NICHT failen)
                if (typeof r.state.renderer.renderAsync === "function") r.state.renderer.renderAsync = () => Promise.resolve();
                stubbed = true;
            }
            if (r && typeof r._gameLoopTick === "function") {
                try { r._gameLoopTick(performance.now()); } catch (_e) {}
                const sz = r.state && r.state.voxelChunks ? r.state.voxelChunks.size : 0;
                if (sz === lastSize) stableFor++; else { stableFor = 0; lastSize = sz; }
                if (sz >= 18 && stableFor > 40) break;
            }
            await new Promise((res) => setTimeout(res, 4));
        }
        const r = window.anazhRealm;
        try { r._drainPendingWaterIso && r._drainPendingWaterIso(); r._drainPendingGrass && r._drainPendingGrass(); } catch (_e) {}
    });

    // Größtes Wasser nahe Spawn; den Spieler DICHT ans Ufer stellen (Augenhöhe knapp drüber).
    const spot = await page.evaluate(() => {
        const r = window.anazhRealm; const s = r.state; const pm = s.playerMesh;
        if (!pm) return { err: "no player" };
        const th = (x, z) => (typeof r.getTerrainHeightAt === "function" ? r.getTerrainHeightAt(x, z) : 0);
        const wl = (x, z) => (typeof r._waterLevelAt === "function" ? r._waterLevelAt(x, z) : -Infinity);
        const cx = pm.position.x, cz = pm.position.z;
        let best = null, bestArea = -1;
        for (let rad = 8; rad <= 200; rad += 6) {
            for (let a = 0; a < 360; a += 8) {
                const x = cx + Math.cos(a * Math.PI / 180) * rad, z = cz + Math.sin(a * Math.PI / 180) * rad;
                if (wl(x, z) > th(x, z) + 0.5) {
                    let area = 0;
                    for (let dx = -6; dx <= 6; dx += 3) for (let dz = -6; dz <= 6; dz += 3) if (wl(x + dx, z + dz) > th(x + dx, z + dz) + 0.4) area++;
                    if (area > bestArea) { bestArea = area; best = { x, z, surfaceY: wl(x, z) }; }
                }
            }
            if (best && bestArea >= 18) break;
        }
        if (!best) return { err: "kein Wasser nahe Spawn" };
        // dichtes Ufer (Land knapp über Wasser) so NAH wie möglich am Wasser-Zentrum
        let lx = best.x, lz = best.z, bestD = 1e9;
        for (let r2 = 2; r2 <= 14; r2 += 1) for (let a = 0; a < 360; a += 20) {
            const x = best.x + Math.cos(a * Math.PI / 180) * r2, z = best.z + Math.sin(a * Math.PI / 180) * r2;
            if (th(x, z) > wl(x, z) + 0.1 && th(x, z) < best.surfaceY + 2.5 && r2 < bestD) { lx = x; lz = z; bestD = r2; }
        }
        const groundY = th(lx, lz);
        pm.position.set(lx, Math.max(groundY, best.surfaceY) + 1.5, lz);
        if (s.camera) s.camera.position.copy(pm.position);
        return { wx: +best.x.toFixed(1), wz: +best.z.toFixed(1), surfaceY: +best.surfaceY.toFixed(1), area: bestArea, lx: +lx.toFixed(1), lz: +lz.toFixed(1), standoff: +bestD.toFixed(1) };
    });
    console.log("Wasser-Spot:", JSON.stringify(spot));

    await page.evaluate(() => {
        const cv = document.querySelector("canvas");
        for (const el of Array.from(document.body.children)) if (el !== cv && el.tagName !== "SCRIPT") el.style.display = "none";
    });

    const shoot = async (file, pitchDeg, tod, label) => {
        const meta = await page.evaluate((pitchDeg, tod, spot) => {
            const r = window.anazhRealm; const s = r.state; const pm = s.playerMesh;
            try { r.setTimeOfDay(tod); } catch (_e) {}
            // den Spieler-Blick (yaw/pitch → 1st-Person-Kamera) aufs Wasser richten
            s.cameraMode = "first";
            s.yaw = Math.atan2(spot.wx - pm.position.x, spot.wz - pm.position.z);
            s.pitch = (pitchDeg * Math.PI) / 180;
            for (let i = 0; i < 8; i++) r._gameLoopTick(performance.now()); // Tag/Nacht settlen
            let err = null, nf = null, dlInt = null;
            if (window.__origRender) {
                r.state.renderer.render = window.__origRender;
                try {
                    r._loopRender(performance.now()); // Kamera + Tag/Nacht + nightFactor (Avatar sichtbar)
                    if (pm) pm.visible = false; // Avatar-Körper raus fürs Bild (Schöpfer-Befund)
                    const pp = r._ensurePostProcessing();
                    if (pp && !s.postProcessingFailed && typeof pp.render === "function") pp.render();
                    else window.__origRender(s.scene, s.camera);
                } catch (_e) { err = String((_e && _e.message) || _e); }
                r.state.renderer.render = function () {};
                if (pm) pm.visible = true;
                try { nf = s.postProcessingUniforms && s.postProcessingUniforms.nightFactor ? +s.postProcessingUniforms.nightFactor.value.toFixed(2) : "n/a"; } catch (_e) {}
                try { dlInt = s.directionalLight ? +s.directionalLight.intensity.toFixed(3) : "n/a"; } catch (_e) {}
            } else err = "no origRender";
            return { err, nf, dlInt };
        }, pitchDeg, tod, spot);
        await new Promise((res) => setTimeout(res, 250));
        await page.screenshot({ path: path.join(ART, file), fullPage: false });
        console.log(`${file.padEnd(30)} ${label.padEnd(28)} nightFactor=${meta.nf} dlInt=${meta.dlInt} ${meta.err ? "WARN " + meta.err : "OK"}`);
    };

    await shoot("v18377-water-day.png", -14, 0.5, "Wasser Tag (Tiefe stetig?)");
    await shoot("v18377-night.png", -10, 0.0, "Nacht (Mondlicht, kein Wasch)");
    await shoot("v18377-dusk.png", -10, 0.78, "Daemmerung (Uebergang)");

    await browser.close();
    await new Promise((r) => server.close(r));
    console.log("\nScreenshots: artifacts/v18377-{water-day,night,dusk}.png");
    process.exit(0);
})();
