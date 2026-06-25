// LEICHTE LOOK-LINSE — einen FLIESSENDEN Fluss finden + die Oberfläche NAH ansehen, um die
// „weisse parallele Shader-Linie in der Mitte" + die Konfluenz-6-Ecke zu SEHEN. Light-Pfad.
const puppeteer = require("puppeteer");
const http = require("http");
const fs = require("fs");
const path = require("path");
const PORT = 4393;
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
                if (sz >= 18 && stableFor > 40) break;
            }
            await new Promise((res) => setTimeout(res, 4));
        }
        const r = window.anazhRealm;
        try { r._drainPendingWaterIso && r._drainPendingWaterIso(); r._drainPendingGrass && r._drainPendingGrass(); } catch (_e) {}
    });

    // Einen Fluss-Punkt via _hydroRiverAt suchen (das fliessende Wasser, nicht ein See).
    const spot = await page.evaluate(() => {
        const r = window.anazhRealm; const s = r.state; const pm = s.playerMesh; const h = s.hydrosphere;
        if (!pm) return { err: "no player" };
        const th = (x, z) => (typeof r.getTerrainHeightAt === "function" ? r.getTerrainHeightAt(x, z) : 0);
        const cx = pm.position.x, cz = pm.position.z;
        let best = null;
        if (typeof r._hydroRiverAt === "function") {
            for (let rad = 8; rad <= 200 && !best; rad += 6) {
                for (let a = 0; a < 360; a += 8) {
                    const x = cx + Math.cos(a * Math.PI / 180) * rad, z = cz + Math.sin(a * Math.PI / 180) * rad;
                    let rv = null; try { rv = r._hydroRiverAt(x, z); } catch (_e) {}
                    if (rv && rv.isRiver) { best = { x, z, surfaceY: rv.surfaceY }; break; }
                }
            }
        }
        // Fallback: ein Wasser-Punkt via _waterLevelAt
        if (!best) {
            const wl = (x, z) => (typeof r._waterLevelAt === "function" ? r._waterLevelAt(x, z) : -Infinity);
            for (let rad = 8; rad <= 160 && !best; rad += 6)
                for (let a = 0; a < 360; a += 8) {
                    const x = cx + Math.cos(a * Math.PI / 180) * rad, z = cz + Math.sin(a * Math.PI / 180) * rad;
                    if (wl(x, z) > th(x, z) + 0.5) { best = { x, z, surfaceY: wl(x, z) }; break; }
                }
        }
        if (!best) return { err: "kein Fluss/Wasser nahe Spawn" };
        // Land-Kante daneben finden, Spieler dicht ans Wasser stellen, Augenhöhe knapp drüber
        let lx = best.x, lz = best.z;
        const wl = (x, z) => (typeof r._waterLevelAt === "function" ? r._waterLevelAt(x, z) : -Infinity);
        for (let r2 = 2; r2 <= 16; r2 += 1.5) for (let a = 0; a < 360; a += 30) {
            const x = best.x + Math.cos(a * Math.PI / 180) * r2, z = best.z + Math.sin(a * Math.PI / 180) * r2;
            if (th(x, z) > wl(x, z) + 0.2 && th(x, z) < best.surfaceY + 2.5) { lx = x; lz = z; }
        }
        const groundY = th(lx, lz);
        pm.position.set(lx, Math.max(groundY, best.surfaceY) + 1.5, lz);
        if (s.camera) s.camera.position.copy(pm.position);
        return { wx: +best.x.toFixed(1), wz: +best.z.toFixed(1), surfaceY: +best.surfaceY.toFixed(1), lx: +lx.toFixed(1), lz: +lz.toFixed(1), eye: +(Math.max(groundY, best.surfaceY) + 1.5).toFixed(1), hadRiver: typeof r._hydroRiverAt === "function" };
    });
    console.log("Fluss-Spot:", JSON.stringify(spot));

    await page.evaluate(() => {
        const cv = document.querySelector("canvas");
        for (const el of Array.from(document.body.children)) if (el !== cv && el.tagName !== "SCRIPT") el.style.display = "none";
        const r = window.anazhRealm; if (r && r.state && r.state.playerMesh) r.state.playerMesh.visible = false;
    });

    const shoot = async (file, pitchDeg, tod) => {
        if (tod !== undefined) {
            await page.evaluate((tod) => { const r = window.anazhRealm; try { r.setTimeOfDay(tod); for (let i = 0; i < 4; i++) r._gameLoopTick(performance.now()); } catch (_e) {} }, tod);
        }
        const meta = await page.evaluate((pitchDeg, spot) => {
            const r = window.anazhRealm; const s = r.state; const pm = s.playerMesh; const cam = s.camera;
            const ex = pm.position.x, ey = pm.position.y, ez = pm.position.z;
            const yaw = Math.atan2((spot.wx ?? ex) - ex, (spot.wz ?? ez + 1) - ez);
            const pitch = (pitchDeg * Math.PI) / 180;
            cam.position.set(ex, ey, ez);
            const dir = { x: Math.sin(yaw) * Math.cos(pitch), y: Math.sin(pitch), z: Math.cos(yaw) * Math.cos(pitch) };
            cam.lookAt(ex + dir.x * 30, ey + dir.y * 30, ez + dir.z * 30);
            cam.updateMatrixWorld(true);
            let err = null;
            if (window.__origRender) {
                r.state.renderer.render = window.__origRender; s.postProcessingFailed = true;
                try { if (typeof r._loopRender === "function") { r._loopRender(performance.now()); r._loopRender(performance.now()); } else window.__origRender(s.scene, cam); }
                catch (_e) { err = String((_e && _e.message) || _e); }
                r.state.renderer.render = function () {};
            } else err = "no origRender";
            return { err };
        }, pitchDeg, spot);
        await new Promise((res) => setTimeout(res, 250));
        await page.screenshot({ path: path.join(ART, file), fullPage: false });
        console.log(`${file.padEnd(28)} ${meta.err ? "WARN " + meta.err : "OK"}`);
    };

    // DIAGNOSE: dasselbe Spot bei zwei Sonnenständen — wandert das helle Band → SPECULAR; bleibt es → FOAM/Geometrie.
    await shoot("look-river-noon.png", -22, 0.5);
    await shoot("look-river-morn.png", -22, 0.28);

    await browser.close();
    await new Promise((r) => server.close(r));
    console.log("\nScreenshots: artifacts/look-river-{noon,morn}.png (Band wandert=Specular, bleibt=Foam)");
    process.exit(0);
})();
