// Diagnose (Backlog-Analyse, KEIN Fix) — der Kreatur-FPS-Einbruch. Schöpfer:
// „ab 80-90 Kreaturen konstant 8-10 FPS; selbst am Ort stehend wird das System
// mit der Zeit träger; Steuerung+Physik ruckeln (sollten getrennt sein)". Misst:
// (1) updateCreatures-Kosten vs Anzahl (linear oder super-linear?), (2) der
// Anteil von getTerrainHeightAt (per-Kreatur-Density-Spalten-Scan?) + _creature
// Wariness, (3) ob die Kosten bei FIXER Anzahl über die Zeit WACHSEN (Leak).
const puppeteer = require("puppeteer"), http = require("http"), fs = require("fs"), path = require("path");
const PORT = 4328, root = path.resolve(__dirname, "..");
const mime = { ".html": "text/html", ".js": "application/javascript", ".wasm": "application/wasm", ".json": "application/json", ".woff2": "font/woff2", ".css": "text/css", ".png": "image/png" };
const server = http.createServer((req, res) => { let p = req.url.split("?")[0]; if (p === "/") p = "/index.html"; const fp = path.join(root, p); if (!fp.startsWith(root)) { res.statusCode = 403; return res.end(); } fs.readFile(fp, (e, d) => { if (e) { res.statusCode = 404; return res.end(); } res.setHeader("Content-Type", mime[path.extname(fp)] || "application/octet-stream"); res.end(d); }); });
(async () => {
    await new Promise((r) => server.listen(PORT, r));
    const browser = await puppeteer.launch({ headless: true, args: ["--use-angle=swiftshader", "--enable-unsafe-swiftshader", "--enable-webgl", "--ignore-gpu-blocklist", "--no-sandbox", "--disable-setuid-sandbox", "--autoplay-policy=no-user-gesture-required"] });
    const page = await browser.newPage();
    page.on("pageerror", (e) => console.log("[PAGE-ERROR]", (e.stack || e.message).split("\n")[0]));
    await page.goto("http://127.0.0.1:" + PORT + "/index.html", { waitUntil: "domcontentloaded", timeout: 30000 });
    await page.evaluate(async () => { const s = performance.now(); while (performance.now() - s < 18000) { const r = window.anazhRealm; if (r && r._gameLoopTick) { try { r._gameLoopTick(performance.now()); } catch (_) {} if (r.state && r.state.playerMesh && r.state.voxelChunks && r.state.voxelChunks.size > 8) break; } await new Promise((z) => setTimeout(z, 16)); } });
    const rep = await page.evaluate(() => {
        const r = window.anazhRealm, pm = r.state.playerMesh;
        r.state.maxCreatures = 200;
        const median = (a) => (a.length ? a.slice().sort((x, y) => x - y)[a.length >> 1] : 0);
        const spawnTo = (n) => {
            while (r.state.creatures.length > n) r.state.creatures.pop();
            let guard = 0;
            while (r.state.creatures.length < n && guard++ < 500) {
                const a = Math.random() * 6.28, d = 6 + Math.random() * 30;
                r.spawnCreatureAt(pm.position.x + Math.cos(a) * d, pm.position.y, pm.position.z + Math.sin(a) * d, "happy");
            }
        };
        const measure = (n) => {
            spawnTo(n);
            for (let w = 0; w < 5; w++) r.updateCreatures(0.016); // warm
            const s = [];
            for (let t = 0; t < 30; t++) { const a = performance.now(); r.updateCreatures(0.016); s.push(performance.now() - a); }
            return +median(s).toFixed(2);
        };
        const out = { scaling: {} };
        for (const n of [20, 40, 60, 90]) out.scaling[n] = measure(n);
        // getTerrainHeightAt-Anteil bei 90.
        spawnTo(90);
        let ghtMs = 0, ghtN = 0;
        const orig = r.getTerrainHeightAt.bind(r);
        r.getTerrainHeightAt = (x, z) => { const a = performance.now(); const v = orig(x, z); ghtMs += performance.now() - a; ghtN++; return v; };
        for (let t = 0; t < 20; t++) r.updateCreatures(0.016);
        r.getTerrainHeightAt = orig;
        out.ghtCallsPerUpdate = Math.round(ghtN / 20);
        out.ghtMsPerUpdate = +(ghtMs / 20).toFixed(2);
        // Leak-Check: 300× updateCreatures bei FIXER Anzahl — wächst die Zeit?
        const first = [], last = [];
        for (let t = 0; t < 300; t++) { const a = performance.now(); r.updateCreatures(0.016); const dt = performance.now() - a; if (t < 30) first.push(dt); if (t >= 270) last.push(dt); }
        out.leakFirst30 = +median(first).toFixed(2);
        out.leakLast30 = +median(last).toFixed(2);
        out.creatureCount = r.state.creatures.length;
        out.maxCreaturesDefault = 200;
        return out;
    });
    await browser.close(); server.close();
    console.log("\n===== KREATUR-FPS-ANALYSE (Backlog) =====\n");
    console.log("  updateCreatures(0.016) ms — Skalierung mit Anzahl:");
    for (const n of [20, 40, 60, 90]) console.log("    " + String(n).padStart(3) + " Kreaturen: " + rep.scaling[n] + " ms" + (rep.scaling[n] > 16 ? "  <-- blockiert einen 60-FPS-Frame" : ""));
    const lin = rep.scaling[90] / Math.max(0.01, rep.scaling[20]);
    console.log("  → 90/20-Verhältnis: " + lin.toFixed(1) + "x (4.5x = linear; >>4.5x = super-linear)");
    console.log("\n  getTerrainHeightAt (per-Kreatur-Boden-Scan) bei 90:");
    console.log("    Calls/Update: " + rep.ghtCallsPerUpdate + "   Kosten/Update: " + rep.ghtMsPerUpdate + " ms");
    console.log("\n  Leak-Check (fixe Anzahl " + rep.creatureCount + ", über die Zeit):");
    console.log("    erste 30: " + rep.leakFirst30 + " ms   letzte 30: " + rep.leakLast30 + " ms" + (rep.leakLast30 > rep.leakFirst30 * 1.3 ? "  <-- WÄCHST (Leak/Akkumulation)" : "  (stabil)"));
    console.log("\n=========================================\n");
})();
