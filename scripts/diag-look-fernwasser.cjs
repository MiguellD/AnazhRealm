// DAS EIGENE AUGE aufs FERN-WASSER (V18.381): vom Ufer Richtung Fern-Wasser-Schwerpunkt,
// leicht erhöht — das Wasser soll ÜBER die Ring-Kante hinaus bis in den Dunst reichen
// (vorher: trockene Becken jenseits ~194 m). Light-Pfad (kleine Welt, Post-FX AN).
const puppeteer = require("puppeteer");
const http = require("http");
const fs = require("fs");
const path = require("path");
const PORT = 4405;
const root = path.resolve(__dirname, "..");
const ART = path.join(root, "artifacts");
const mime = { ".html": "text/html", ".js": "application/javascript", ".wasm": "application/wasm", ".json": "application/json", ".css": "text/css", ".png": "image/png" };
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
    await page.setViewport({ width: 880, height: 560 });
    page.on("pageerror", (e) => console.log("[PAGE-ERROR]", (e.stack || e.message).split("\n")[0]));
    await page.goto(`http://127.0.0.1:${PORT}/index.html`, { waitUntil: "domcontentloaded", timeout: 30000 });
    await page.evaluate(async () => {
        let stubbed = false; const start = performance.now(); let lastSize = -1, stableFor = 0;
        while (performance.now() - start < 80000) {
            const r = window.anazhRealm;
            if (r && !stubbed && r.state && r.state.renderer) {
                window.__origRender = r.state.renderer.render.bind(r.state.renderer);
                r.state.renderer.render = function () {};
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
        try { r._drainPendingWaterIso && r._drainPendingWaterIso(); } catch (_e) {}
    });
    const spot = await page.evaluate(() => {
        const r = window.anazhRealm; const s = r.state; const pm = s.playerMesh;
        s._frameOverBudget = false;
        r._ensureFarWaterSheet();
        const m = s.farWater;
        if (!m || !m.mesh) return { err: "kein Fern-Wasser" };
        // NÄCHSTEN nassen Fern-Wasser-Vertex finden → Spieler ans UFER daneben, AUGENHÖHE
        // (die Methodik-Disziplin: hohe Übersicht = Aerial-Haze-Wäsche; nah + Augenhöhe = treu).
        const pos = m.mesh.geometry.getAttribute("position");
        const aD = m.mesh.geometry.getAttribute("aDepth");
        let bi = -1, bd = Infinity;
        for (let i = 0; i < pos.count; i++) {
            if (aD.getX(i) <= 0) continue; // Anker überspringen
            const dx = pos.getX(i) - pm.position.x, dz = pos.getZ(i) - pm.position.z;
            const d2 = dx * dx + dz * dz;
            if (d2 < bd) { bd = d2; bi = i; }
        }
        if (bi < 0) return { err: "kein nasser Fern-Vertex" };
        const wxv = pos.getX(bi), wzv = pos.getZ(bi), wyv = pos.getY(bi);
        // Schwerpunkt (Blickziel = die Masse des Fern-Wassers)
        let sx = 0, sz2 = 0, n = 0;
        for (let i = 0; i < pos.count; i += 7) { sx += pos.getX(i); sz2 += pos.getZ(i); n++; }
        const tx = sx / n, tz = sz2 / n;
        // Spieler 16 m VOR den nassen Vertex (Richtung Spieler zurück), Auge knapp über Wasser
        const bx = pm.position.x - wxv, bz = pm.position.z - wzv;
        const bl = Math.hypot(bx, bz) || 1;
        pm.position.x = wxv + (bx / bl) * 16;
        pm.position.z = wzv + (bz / bl) * 16;
        const gy = r.getTerrainHeightAt(pm.position.x, pm.position.z);
        pm.position.y = Math.max(gy + 1.6, wyv + 2.2);
        if (s.camera) s.camera.position.copy(pm.position);
        return { tx: +tx.toFixed(1), tz: +tz.toFixed(1), quads: m.quads, outR: m.builtOutR, eye: +pm.position.y.toFixed(1), nearV: { x: +wxv.toFixed(1), z: +wzv.toFixed(1), y: +wyv.toFixed(1) } };
    });
    console.log("Fern-Wasser-Spot:", JSON.stringify(spot));
    if (spot.err) { await browser.close(); await new Promise((r) => server.close(r)); process.exit(1); }
    await page.evaluate(() => {
        const cv = document.querySelector("canvas");
        for (const el of Array.from(document.body.children)) if (el !== cv && el.tagName !== "SCRIPT") el.style.display = "none";
    });
    const shoot = async (file, pitchDeg, tod) => {
        const meta = await page.evaluate((pitchDeg, tod, spot) => {
            const r = window.anazhRealm; const s = r.state; const pm = s.playerMesh;
            try { r.setTimeOfDay(tod); } catch (_e) {}
            s.cameraMode = "first";
            s.yaw = Math.atan2(spot.tx - pm.position.x, spot.tz - pm.position.z);
            s.pitch = (pitchDeg * Math.PI) / 180;
            for (let i = 0; i < 8; i++) r._gameLoopTick(performance.now());
            let err = null;
            if (window.__origRender) {
                r.state.renderer.render = window.__origRender;
                try {
                    r._loopRender(performance.now());
                    // NUR fürs Diagnose-BILD: den Lade-Schleier aufschieben (die kleine Test-Welt
                    // hält ihn korrekt eng — Veil-Korrektheit beweist stream-lab, hier will ich SEHEN).
                    if (s.fog) { s.fog.far = 430; s.fog.near = 150; }
                    if (s.atmoUniforms && s.atmoUniforms.density) s.atmoUniforms.density.value = 0.004;
                    if (pm) pm.visible = false;
                    const pp = r._ensurePostProcessing();
                    if (pp && !s.postProcessingFailed && typeof pp.render === "function") pp.render();
                    else window.__origRender(s.scene, s.camera);
                } catch (_e) { err = String((_e && _e.message) || _e); }
                r.state.renderer.render = function () {};
                if (pm) pm.visible = true;
            } else err = "no origRender";
            return { err };
        }, pitchDeg, tod, spot);
        await new Promise((res) => setTimeout(res, 250));
        await page.screenshot({ path: path.join(ART, file), fullPage: false });
        console.log(`${file.padEnd(30)} ${meta.err ? "WARN " + meta.err : "OK"}`);
    };
    await shoot("fernwasser-day.png", -7, 0.5);
    // A/B: dieselbe Szene OHNE Fern-Wasser (der Vorher-Zustand — trockene Becken)
    await page.evaluate(() => {
        const r = window.anazhRealm; const s = r.state;
        if (!s.atmosphere) s.atmosphere = {};
        s.atmosphere.farWater = false;
        s._frameOverBudget = false;
        r._ensureFarWaterSheet();
    });
    await shoot("fernwasser-off.png", -7, 0.5);
    await browser.close();
    await new Promise((r) => server.close(r));
    console.log("\nScreenshot: artifacts/fernwasser-day.png");
    process.exit(0);
})();
