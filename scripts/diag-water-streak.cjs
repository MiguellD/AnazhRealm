// PINPOINT: der vertikale Streifen am steilen Fluss-Lauf. Misst `_waterRunSurfaceAt` (die
// along-flow-geglättete Oberfläche) vs den rohen Atlas-Spiegel QUER zum Fluss (perpendicular),
// um eine Mittellinien-NARBE (Kamm/Falte) zu finden — ohne zu rendern (reine CPU-Geometrie).
const puppeteer = require("puppeteer");
const http = require("http");
const fs = require("fs");
const path = require("path");
const PORT = 4396;
const root = path.resolve(__dirname, "..");
const mime = { ".html": "text/html", ".js": "application/javascript", ".wasm": "application/wasm", ".json": "application/json", ".css": "text/css", ".png": "image/png" };
const server = http.createServer((req, res) => {
    let p = req.url.split("?")[0]; if (p === "/") p = "/index.html";
    const fp = path.join(root, p);
    if (!fp.startsWith(root)) { res.statusCode = 403; return res.end(); }
    fs.readFile(fp, (err, data) => { if (err) { res.statusCode = 404; return res.end(); } res.setHeader("Content-Type", mime[path.extname(fp)] || "application/octet-stream"); res.end(data); });
});
(async () => {
    await new Promise((r) => server.listen(PORT, r));
    const browser = await puppeteer.launch({ headless: true, protocolTimeout: 600000, args: ["--use-angle=swiftshader", "--enable-unsafe-swiftshader", "--enable-webgl", "--ignore-gpu-blocklist", "--no-sandbox", "--disable-setuid-sandbox"] });
    const page = await browser.newPage();
    page.on("pageerror", (e) => console.log("[PAGE-ERROR]", (e.stack || e.message).split("\n")[0]));
    await page.goto(`http://127.0.0.1:${PORT}/index.html`, { waitUntil: "domcontentloaded", timeout: 30000 });
    await page.evaluate(async () => {
        let stubbed = false;
        const start = performance.now(); let lastSize = -1, stableFor = 0;
        while (performance.now() - start < 80000) {
            const r = window.anazhRealm;
            if (r && !stubbed && r.state && r.state.renderer) {
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
        try { r._drainPendingWaterIso && r._drainPendingWaterIso(); } catch (_e) {}
    });
    const out = await page.evaluate(() => {
        const r = window.anazhRealm; const s = r.state; const pm = s.playerMesh;
        const cx = pm.position.x, cz = pm.position.z;
        // steilsten Fluss-Punkt suchen (höchste aSlope-Region) via _hydroRiverAt
        let best = null, bestSlope = -1;
        for (let rad = 8; rad <= 220; rad += 6) {
            for (let a = 0; a < 360; a += 6) {
                const x = cx + Math.cos(a * Math.PI / 180) * rad, z = cz + Math.sin(a * Math.PI / 180) * rad;
                let rv = null; try { rv = r._hydroRiverAt(x, z); } catch (_e) {}
                if (rv) {
                    // Steigung des Wasser-Spiegels grob (entlang Fluss)
                    const fx = rv.flowX || 0, fz = rv.flowZ || 0;
                    const la = r._atlasWaterLevelAt(x + fx * 6, z + fz * 6, -Infinity);
                    const lb = r._atlasWaterLevelAt(x - fx * 6, z - fz * 6, -Infinity);
                    const slope = (la > -Infinity && lb > -Infinity) ? Math.abs(la - lb) / 12 : 0;
                    if (slope > bestSlope) { bestSlope = slope; best = { x, z, fx, fz, centerness: rv.centerness }; }
                }
            }
        }
        if (!best) return { err: "kein Fluss gefunden" };
        // QUER zum Fluss abtasten (perpendicular = (fz, -fx)), -12..+12 m
        const { x, z, fx, fz } = best;
        const px = fz, pz = -fx; // perpendicular unit (fx,fz sind normiert)
        const prof = [];
        for (let d = -12; d <= 12; d += 1) {
            const sx = x + px * d, sz2 = z + pz * d;
            const run = r._waterRunSurfaceAt(sx, sz2);
            const raw = r._atlasWaterLevelAt(sx, sz2, -Infinity);
            let rv = null; try { rv = r._hydroRiverAt(sx, sz2); } catch (_e) {}
            prof.push({ d, run: run > -Infinity ? +run.toFixed(3) : null, raw: raw > -Infinity ? +raw.toFixed(3) : null, ctr: rv ? +(rv.centerness || 0).toFixed(2) : null, riv: !!rv, diff: (run > -Infinity && raw > -Infinity) ? +(run - raw).toFixed(3) : null });
        }
        // maximale run-vs-raw-Differenz (die Narbe) + maximaler quer-Gradient des run
        let maxDiff = 0, maxGrad = 0;
        for (let i = 0; i < prof.length; i++) {
            if (prof[i].diff != null && Math.abs(prof[i].diff) > maxDiff) maxDiff = Math.abs(prof[i].diff);
            if (i > 0 && prof[i].run != null && prof[i - 1].run != null) {
                const g = Math.abs(prof[i].run - prof[i - 1].run);
                if (g > maxGrad) maxGrad = g;
            }
        }
        return { spot: { x: +x.toFixed(1), z: +z.toFixed(1), slopeAlong: +bestSlope.toFixed(3) }, maxRunVsRawDiff: +maxDiff.toFixed(3), maxCrossGradient: +maxGrad.toFixed(3), profile: prof };
    });
    console.log("\n=== STREAK-PINPOINT: _waterRunSurfaceAt vs roh, QUER zum Fluss ===\n");
    console.log(JSON.stringify(out, null, 1));
    console.log("\nLESART: maxRunVsRawDiff = die Narben-Höhe (geglätteter Kern vs rohe Kante);");
    console.log("        maxCrossGradient = der quer-Sprung des run-Spiegels (eine Kante/Falte > ~0.3 m = sichtbarer Streifen).");
    await browser.close(); server.close();
})().catch((e) => { console.error(e); process.exit(1); });
