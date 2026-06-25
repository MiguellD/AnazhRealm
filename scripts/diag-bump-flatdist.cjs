// Diagnose — DIE FACETTEN-NORMALE auf GENUINE MACRO-FLACHEM Boden (unabhängig vom Mesh klassifiziert).
//
// Die Gate-Frage: der Bump-`_flatGate = smoothstep(lo, hi, normalWorld.y)` liest die FACETTIERTE
// Mesh-Normale. Mein `diag-bump-gate` klassifizierte „flach" SELBST als ny>0.62 und nutzte 0.62 als
// obere Schranke → zirkulär. Hier klassifiziere ich macro-flach UNABHÄNGIG: über `getTerrainHeightAt`
// (das glatte Dichte-Feld) den MAKRO-Slope an jedem Vertex; ist er flach (<0.18), schaue ich die
// FACETTEN-ny dieses Vertex an. So sehe ich die WAHRE Verteilung: wie tief dippt die Facetten-Normale
// auf echtem Wiesen-Boden? Das sagt mir, ob die obere Gate-Schranke 0.62 sicher ist (Wiese bleibt
// uniform) oder ob die Wiese drunter dippt (Patchwork kehrt zurück → ich brauche eine tiefere Schranke
// ODER muss auf den MAKRO-Slope gaten statt auf die Facette).
const puppeteer = require("puppeteer");
const http = require("http");
const fs = require("fs");
const path = require("path");
const PORT = 4402;
const root = path.resolve(__dirname, "..");
const mime = { ".html": "text/html", ".js": "application/javascript", ".json": "application/json", ".css": "text/css", ".wasm": "application/wasm", ".woff2": "font/woff2", ".png": "image/png" };
const server = http.createServer((req, res) => {
    let p = req.url.split("?")[0];
    if (p === "/") p = "/index.html";
    const fp = path.join(root, p);
    if (!fp.startsWith(root)) { res.statusCode = 403; return res.end(); }
    fs.readFile(fp, (err, data) => {
        if (err) { res.statusCode = 404; return res.end(); }
        res.setHeader("Content-Type", mime[path.extname(fp)] || "application/octet-stream");
        res.end(data);
    });
});
(async () => {
    await new Promise((r) => server.listen(PORT, r));
    const browser = await puppeteer.launch({
        headless: true, protocolTimeout: 300000,
        args: ["--use-angle=swiftshader", "--enable-unsafe-swiftshader", "--enable-webgl", "--ignore-gpu-blocklist", "--no-sandbox", "--disable-setuid-sandbox"],
    });
    const page = await browser.newPage();
    let pageErr = null;
    page.on("pageerror", (e) => { pageErr = (e.stack || e.message).split("\n")[0]; });
    await page.evaluateOnNewDocument(() => { window.__anazhHeadlessNullRenderer = true; });
    await page.goto(`http://127.0.0.1:${PORT}/index.html`, { waitUntil: "domcontentloaded", timeout: 30000 });
    await page.evaluate(async () => {
        const start = performance.now();
        let lastSize = -1, stableFor = 0;
        while (performance.now() - start < 70000) {
            const r = window.anazhRealm;
            if (r && typeof r._gameLoopTick === "function") {
                try { r._gameLoopTick(performance.now()); } catch (_e) { /* */ }
                const sz = r.state && r.state.voxelChunks ? r.state.voxelChunks.size : 0;
                if (sz === lastSize) stableFor++; else { stableFor = 0; lastSize = sz; }
                if (sz > 30 && stableFor > 40) break;
            }
            await new Promise((res) => setTimeout(res, 6));
        }
    });

    const report = await page.evaluate(() => {
        const r = window.anazhRealm;
        const s = r.state;
        // Histogramm der Facetten-ny auf MAKRO-flachem Boden (Slope via getTerrainHeightAt, unabhängig vom Mesh).
        const bins = {}; // 0.50..1.00 in 0.02-Schritten
        let flatMacro = 0, dipBelow62 = 0, dipBelow55 = 0, dipBelow50 = 0;
        let minNy = 1;
        const pos = (e) => e.mesh.geometry.getAttribute("position");
        for (const [, e] of s.voxelChunks) {
            if (!e || e.empty || (Number.isFinite(e.lod) && e.lod !== 0) || !e.mesh) continue;
            const nAttr = e.mesh.geometry && e.mesh.geometry.getAttribute && e.mesh.geometry.getAttribute("normal");
            const pAttr = pos(e);
            if (!nAttr || !pAttr) continue;
            const step = Math.max(1, Math.floor(nAttr.count / 4000)); // Sample für Tempo
            for (let i = 0; i < nAttr.count; i += step) {
                const wx = pAttr.getX(i), wz = pAttr.getZ(i);
                const y0 = r.getTerrainHeightAt(wx, wz);
                if (!Number.isFinite(y0)) continue;
                const yN = r.getTerrainHeightAt(wx + 2, wz), yE = r.getTerrainHeightAt(wx, wz + 2);
                const yNn = r.getTerrainHeightAt(wx - 2, wz), yEn = r.getTerrainHeightAt(wx, wz - 2);
                if (![yN, yE, yNn, yEn].every(Number.isFinite)) continue;
                const macroSlope = Math.max(Math.abs(yN - yNn), Math.abs(yE - yEn)) / 4;
                if (macroSlope > 0.18) continue; // nur GENUINE macro-flache Wiese
                // TOP-SURFACE-FILTER: nur Vertices AUF der sichtbaren Oberfläche, nicht Höhlendecken/
                // Wände/Unterseiten, die zufällig unter flachem Boden liegen (die ny=-1-Kontamination).
                const vy = pAttr.getY(i);
                if (Math.abs(vy - y0) > 1.0) continue;
                flatMacro++;
                const ny = nAttr.getY(i);
                if (ny < minNy) minNy = ny;
                if (ny < 0.62) dipBelow62++;
                if (ny < 0.55) dipBelow55++;
                if (ny < 0.50) dipBelow50++;
                const b = (Math.floor(ny / 0.02) * 0.02).toFixed(2);
                bins[b] = (bins[b] || 0) + 1;
            }
        }
        return { flatMacro, dipBelow62, dipBelow55, dipBelow50, minNy: +minNy.toFixed(3), bins };
    });

    console.log("\n===== FACETTEN-ny auf GENUINE MAKRO-FLACHEM Boden =====\n");
    if (pageErr) console.log("PAGE-ERROR:", pageErr);
    const o = report;
    const pct = (a, b) => (b > 0 ? ((a / b) * 100).toFixed(2) : "0.00");
    console.log(`  Macro-flache Wiesen-Vertices (Slope<0.18 via getTerrainHeightAt): ${o.flatMacro}`);
    console.log(`  Minimale Facetten-ny darauf: ${o.minNy}`);
    console.log(`  Dippt Facetten-ny UNTER der Gate-Schranke?`);
    console.log(`    < 0.62 (neue obere Schranke): ${o.dipBelow62}  (${pct(o.dipBelow62, o.flatMacro)} %)  ← würde Patchwork zurückbringen`);
    console.log(`    < 0.55:                        ${o.dipBelow55}  (${pct(o.dipBelow55, o.flatMacro)} %)`);
    console.log(`    < 0.50:                        ${o.dipBelow50}  (${pct(o.dipBelow50, o.flatMacro)} %)`);
    console.log(`\n  ny-Histogramm (macro-flach):`);
    for (const k of Object.keys(o.bins).sort()) {
        const n = o.bins[k];
        console.log(`    ${k}: ${"█".repeat(Math.min(60, Math.round(n / Math.max(1, o.flatMacro) * 200)))} ${pct(n, o.flatMacro)}%`);
    }
    const safe = o.flatMacro > 0 && o.dipBelow62 / o.flatMacro < 0.02;
    console.log(`\n  ${safe ? "✅" : "⚠️"} ${safe ? "Wiese bleibt über 0.62 → die obere Gate-Schranke 0.62 ist sicher, kein Patchwork-Rückfall." : "Wiese dippt unter 0.62 → die Facetten-Gate bringt Patchwork zurück; auf MAKRO-Slope gaten statt auf die Facette."}\n`);
    await browser.close();
    server.close();
})();
