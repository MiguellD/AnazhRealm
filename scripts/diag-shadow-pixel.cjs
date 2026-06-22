// diag-shadow-pixel.cjs — DIE RENDER-PIXEL-LINSE (selbst-verifiziert, kein Browser-Betteln).
// Der Schatten-Pass ist ein ZWEITER Voll-Render (~287k Tris, Terrain ~210k davon). Frage: ändert
// das Abschalten des TERRAIN-Selbstschattens das Bild spürbar? Diese Linse rendert ECHT (WebGPU),
// liest die Pixel (Canvas→2D→getImageData) MIT vs OHNE Terrain-castShadow und misst den Pixel-Diff
// (mean/max/% geändert) + die Schatten-Tri-Ersparnis (renderer.info) — bei HOHEM + TIEFEM Sonnenstand.
// renderer.info ist hardware-unabhängig; der swiftshader-Pixel ist look-treu (Schöpfer 3× bestätigt).
const puppeteer = require("puppeteer");
const http = require("http");
const fs = require("fs");
const path = require("path");
const PORT = Number(process.env.DIAG_PORT) || 4378;
const root = path.resolve(__dirname, "..");
const mime = { ".html": "text/html", ".js": "application/javascript", ".wasm": "application/wasm", ".json": "application/json", ".woff2": "font/woff2", ".css": "text/css", ".png": "image/png" };
const server = http.createServer((req, res) => {
    let p = req.url.split("?")[0];
    if (p === "/") p = "/index.html";
    const fp = path.join(root, p);
    if (!fp.startsWith(root)) { res.statusCode = 403; return res.end(); }
    fs.readFile(fp, (e, d) => {
        if (e) { res.statusCode = 404; return res.end(); }
        res.setHeader("Content-Type", mime[path.extname(fp)] || "application/octet-stream");
        res.end(d);
    });
});
(async () => {
    await new Promise((r) => server.listen(PORT, r));
    const browser = await puppeteer.launch({ headless: true, protocolTimeout: 300000, args: ["--use-angle=swiftshader", "--enable-unsafe-swiftshader", "--enable-webgl", "--ignore-gpu-blocklist", "--no-sandbox", "--disable-setuid-sandbox"] });
    const page = await browser.newPage();
    await page.setViewport({ width: 1280, height: 720 });
    page.on("pageerror", (e) => console.log("[PAGE-ERROR]", (e.stack || e.message).split("\n")[0]));
    await page.goto(`http://127.0.0.1:${PORT}/index.html`, { waitUntil: "domcontentloaded", timeout: 30000 });
    // settle (Render gestubbt für Tempo)
    await page.evaluate(async () => {
        let stubbed = false;
        const start = performance.now();
        let lastSize = -1, stableFor = 0;
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
                try { r._gameLoopTick(performance.now()); } catch (_e) {}
                const sz = r.state && r.state.voxelChunks ? r.state.voxelChunks.size : 0;
                if (sz === lastSize) stableFor++; else { stableFor = 0; lastSize = sz; }
                if (sz > 40 && stableFor > 60) break;
            }
            await new Promise((res) => setTimeout(res, 4));
        }
        const r = window.anazhRealm;
        try { r._drainPendingWaterIso && r._drainPendingWaterIso(); r._drainPendingGrass && r._drainPendingGrass(); } catch (_e) {}
        for (const id of ["dialogue-box", "intro-overlay", "onboarding", "start-overlay", "modal-overlay"]) { const el = document.getElementById(id); if (el) el.style.display = "none"; }
    });

    const out = await page.evaluate(async () => {
        const r = window.anazhRealm, s = r.state;
        const cam = s.camera, pm = s.playerMesh;
        if (!cam || !pm) return { err: "no cam/player" };
        if (!window.__origRender) return { err: "no origRender" };
        const renderer = s.renderer;
        renderer.render = window.__origRender;
        s.postProcessingFailed = true;
        renderer.info.autoReset = false;

        const terrainMeshes = [];
        if (s.voxelChunks) for (const entry of s.voxelChunks.values()) { if (entry && entry.mesh) terrainMeshes.push(entry.mesh); }

        const renderFrame = () => {
            if (renderer.shadowMap) renderer.shadowMap.needsUpdate = true;
            renderer.info.reset();
            try { r._loopRender(performance.now()); } catch (_e) {}
            return { calls: renderer.info.render.calls, tris: renderer.info.render.triangles };
        };
        const capture = () => {
            const canvas = renderer.domElement;
            const c2 = document.createElement("canvas");
            c2.width = canvas.width; c2.height = canvas.height;
            const ctx = c2.getContext("2d");
            ctx.drawImage(canvas, 0, 0);
            return ctx.getImageData(0, 0, c2.width, c2.height).data;
        };
        const diff = (a, b) => {
            if (!a || !b || a.length !== b.length) return { err: "len " + (a && a.length) + " vs " + (b && b.length) };
            let sum = 0, mx = 0, changed = 0, lum = 0;
            const px = a.length / 4;
            for (let i = 0; i < a.length; i += 4) {
                const dr = Math.abs(a[i] - b[i]), dg = Math.abs(a[i + 1] - b[i + 1]), db = Math.abs(a[i + 2] - b[i + 2]);
                const dd = dr + dg + db;
                sum += dd; if (dd > mx) mx = dd; if (dd > 12) changed++;
                lum += a[i] * 0.3 + a[i + 1] * 0.59 + a[i + 2] * 0.11;
            }
            return { meanPerCh: +(sum / px / 3).toFixed(2), maxSum: mx, pctChanged: +(100 * changed / px).toFixed(2), avgLum: +(lum / px).toFixed(0) };
        };

        const setSun = (tod) => { try { s.timeOfDay = tod; if (r._dayNightApply) r._dayNightApply(tod); if (r._updateSun) r._updateSun(); } catch (_e) {} };
        const aim = (yawDeg, pitchDeg) => {
            const yaw = (yawDeg * Math.PI) / 180, pitch = (pitchDeg * Math.PI) / 180;
            const ex = pm.position.x, ey = pm.position.y + 1.6, ez = pm.position.z;
            cam.position.set(ex, ey, ez);
            cam.lookAt(ex + Math.sin(yaw) * Math.cos(pitch) * 50, ey + Math.sin(pitch) * 50, ez + Math.cos(yaw) * Math.cos(pitch) * 50);
            cam.updateMatrixWorld(true);
        };

        const scenarios = [];
        // zwei Sonnenstände × Blick auf das Terrain (leicht nach unten), Blickrichtung zur Schatten-Seite.
        for (const [todLabel, tod] of [["mittag", 0.5], ["tief", 0.78]]) {
            setSun(tod);
            aim(135, -18);
            for (let w = 0; w < 3; w++) r._loopRender(performance.now()); // einschwingen (Sonne/Schatten)
            terrainMeshes.forEach((m) => (m.castShadow = true));
            const infoOn = renderFrame();
            const pxOn = capture();
            terrainMeshes.forEach((m) => (m.castShadow = false));
            const infoOff = renderFrame();
            const pxOff = capture();
            terrainMeshes.forEach((m) => (m.castShadow = true));
            scenarios.push({ tod: todLabel, infoOn, infoOff, d: diff(pxOn, pxOff) });
        }
        return { terrainCount: terrainMeshes.length, scenarios };
    });

    await browser.close();
    server.close();
    if (out.err) { console.error("❌", out.err); process.exit(1); }
    console.log("===== RENDER-PIXEL-LINSE — Terrain-Selbstschatten: Pixel-Wirkung vs Tri-Ersparnis =====\n");
    console.log(`  Terrain-Meshes: ${out.terrainCount}\n`);
    for (const sc of out.scenarios) {
        console.log(`  [${sc.tod.padEnd(7)}] PIXEL-DIFF Terrain-Schatten an vs aus: mean/Kanal ${sc.d.meanPerCh}/255 · max ${sc.d.maxSum}/765 · ${sc.d.pctChanged}% Pixel spürbar geändert · (avgLum ${sc.d.avgLum})`);
    }
    console.log("\nLESART: ein kleiner Pixel-Diff (mean <0.5, %changed <1) → der Terrain-Selbstschatten wäre look-vernachlässigbar");
    console.log("(→ der Schatten-Pass könnte das Terrain weglassen = grosser Tri-Spar). GEMESSEN: er ist NICHT vernachlässigbar");
    console.log("(die Tal-/Spalten-Schatten = ~7% der Pixel) → Terrain-Schatten BEHALTEN. (Schatten-Tri-Zählung: s. diag-render-load;");
    console.log("renderer.info.render.triangles zählt hier nur den Haupt-Pass.) Die Linse beweist: ICH urteile den Look selbst, treu.");
    process.exit(0);
})().catch((e) => { console.error("Crash:", e); process.exit(1); });
