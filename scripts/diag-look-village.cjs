// LEICHTE LOOK-LINSE — die GENAUE Schöpfer-Szene: ein Dorf platzieren, level draufschauen
// (Oberfläche verwaschen?), dann hochschauen (an der unteren Kante Farbe zurück?). Light-Pfad
// (kleine Welt, kleines Viewport, protocolTimeout) gegen den swiftshader-Tod dieses Containers.
const puppeteer = require("puppeteer");
const http = require("http");
const fs = require("fs");
const path = require("path");
const PORT = 4392;
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
    const browser = await puppeteer.launch({ headless: true, protocolTimeout: 600000, args: ["--use-angle=swiftshader", "--enable-unsafe-swiftshader", "--enable-webgl", "--ignore-gpu-blocklist", "--no-sandbox", "--disable-setuid-sandbox"] });
    const page = await browser.newPage();
    await page.setViewport({ width: 800, height: 520 });
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
                r.state.postProcessingFailed = true; stubbed = true;
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

    // Ein Dorf vor dem Spieler auf flachem Land platzieren.
    const placed = await page.evaluate(() => {
        const r = window.anazhRealm; const s = r.state; const pm = s.playerMesh;
        if (!pm) return { err: "no player" };
        const th = (x, z) => (typeof r.getTerrainHeightAt === "function" ? r.getTerrainHeightAt(x, z) : 0);
        const wl = (x, z) => (typeof r._waterLevelAt === "function" ? r._waterLevelAt(x, z) : -Infinity);
        // flaches Land ~26m vor dem Spieler (+Z) suchen
        let spot = null;
        for (let d = 20; d <= 60 && !spot; d += 4) {
            for (let off = -20; off <= 20; off += 5) {
                const x = pm.position.x + off, z = pm.position.z + d;
                const g = th(x, z);
                if (g > wl(x, z) + 1 && Math.abs(th(x + 3, z) - g) < 2 && Math.abs(th(x, z + 3) - g) < 2) { spot = { x, z, g }; break; }
            }
        }
        if (!spot) { const g = th(pm.position.x, pm.position.z + 26); spot = { x: pm.position.x, z: pm.position.z + 26, g }; }
        let entry = null;
        try { entry = r.spawnArchitecture("village", { x: spot.x, y: spot.g + 0.5, z: spot.z }, { seed: 7 }); } catch (e) { return { err: "spawn: " + e.message }; }
        // Spieler ~14m vor das Dorf stellen, auf Augenhöhe
        const px = spot.x, pz = spot.z - 14, py = th(spot.x, spot.z - 14);
        pm.position.set(px, py + 1.7, pz);
        if (s.camera) s.camera.position.copy(pm.position);
        // Mehrere Ticks, damit das Dorf voll baut + settled
        for (let i = 0; i < 40; i++) { try { r._gameLoopTick(performance.now()); } catch (_e) {} }
        return { ok: !!entry, vx: +spot.x.toFixed(1), vz: +spot.z.toFixed(1), vy: +spot.g.toFixed(1), px: +px.toFixed(1), pz: +pz.toFixed(1) };
    });
    console.log("Dorf:", JSON.stringify(placed));

    await page.evaluate(() => {
        const cv = document.querySelector("canvas");
        for (const el of Array.from(document.body.children)) if (el !== cv && el.tagName !== "SCRIPT") el.style.display = "none";
        const r = window.anazhRealm; if (r && r.state && r.state.playerMesh) r.state.playerMesh.visible = false;
    });

    const shoot = async (file, pitchDeg) => {
        const meta = await page.evaluate((pitchDeg, placed) => {
            const r = window.anazhRealm; const s = r.state; const pm = s.playerMesh; const cam = s.camera;
            const ex = pm.position.x, ey = pm.position.y, ez = pm.position.z;
            const yaw = Math.atan2((placed.vx ?? ex) - ex, (placed.vz ?? ez + 1) - ez);
            const pitch = (pitchDeg * Math.PI) / 180;
            cam.position.set(ex, ey, ez);
            const dir = { x: Math.sin(yaw) * Math.cos(pitch), y: Math.sin(pitch), z: Math.cos(yaw) * Math.cos(pitch) };
            cam.lookAt(ex + dir.x * 50, ey + dir.y * 50, ez + dir.z * 50);
            cam.updateMatrixWorld(true);
            let err = null;
            if (window.__origRender) {
                r.state.renderer.render = window.__origRender; s.postProcessingFailed = true;
                try { if (typeof r._loopRender === "function") { r._loopRender(performance.now()); r._loopRender(performance.now()); } else window.__origRender(s.scene, cam); }
                catch (_e) { err = String((_e && _e.message) || _e); }
                r.state.renderer.render = function () {};
            } else err = "no origRender";
            return { err };
        }, pitchDeg, placed);
        await new Promise((res) => setTimeout(res, 250));
        await page.screenshot({ path: path.join(ART, file), fullPage: false });
        console.log(`${file.padEnd(28)} ${meta.err ? "WARN " + meta.err : "OK"}`);
    };

    await shoot("look-village-level.png", -6);
    await shoot("look-village-up.png", 22);

    await browser.close();
    await new Promise((r) => server.close(r));
    console.log("\nScreenshots: artifacts/look-village-{level,up}.png");
    process.exit(0);
})();
