// Diagnose V14.4-Disharmonie: an der Schöpfer-Position (811,-115) + Grid die
// Density-Säulen-Integrität (Löcher? Höhlen-Durchbruch?) + Wasser-Cells (Wasser
// über der Surface = Phantom? unter SOLID = Sub-Terrain?). Findet die Wurzel von
// Löchern / höhenversetzten Bereichen / Wasser-unter-Oberfläche.
const puppeteer = require("puppeteer");
const http = require("http");
const fs = require("fs");
const path = require("path");
const PORT = 4352;
const root = path.resolve(__dirname, "..");
const mime = { ".html": "text/html", ".js": "application/javascript", ".wasm": "application/wasm", ".json": "application/json", ".woff2": "font/woff2", ".css": "text/css", ".png": "image/png" };
const server = http.createServer((req, res) => { let p = req.url.split("?")[0]; if (p === "/") p = "/index.html"; const fp = path.join(root, p); if (!fp.startsWith(root)) { res.statusCode = 403; return res.end(); } fs.readFile(fp, (e, d) => { if (e) { res.statusCode = 404; return res.end(); } res.setHeader("Content-Type", mime[path.extname(fp)] || "application/octet-stream"); res.end(d); }); });
(async () => {
    await new Promise((r) => server.listen(PORT, r));
    const browser = await puppeteer.launch({ headless: true, args: ["--use-angle=swiftshader", "--enable-unsafe-swiftshader", "--enable-webgl", "--ignore-gpu-blocklist", "--no-sandbox", "--disable-setuid-sandbox"] });
    const page = await browser.newPage();
    page.on("pageerror", (e) => console.log("[ERR]", String(e).split("\n")[0]));
    await page.goto(`http://127.0.0.1:${PORT}/index.html`, { waitUntil: "domcontentloaded", timeout: 30000 });
    await page.evaluate(async () => { const t = performance.now(); while (performance.now() - t < 25000) { const r = window.anazhRealm; if (r && r.state && r.state.hydrosphere && r.state.hydrosphere.ready) break; await new Promise((x) => setTimeout(x, 200)); } });
    const out = await page.evaluate(() => {
        const r = window.anazhRealm, s = r.state, STATE = r.constructor.CELL_STATE;
        const cfg = r._voxelChunkConfig(0);
        const base = s.terrainBaseHeight || 0;
        const floor = base - cfg.floorDrop, ceiling = floor + cfg.dimY * cfg.step;
        const span = cfg.span, step = cfg.step;
        const report = { cols: [], lakeHere: null, hydroSeaPct: 0, hydroLakePct: 0 };
        // Density-Säulen an einem 5x5-Grid um (811,-115)
        let holeCols = 0, caveBreaks = 0, multiSolid = 0;
        for (let gx = -2; gx <= 2; gx++) {
            for (let gz = -2; gz <= 2; gz++) {
                const x = 811 + gx * 20, z = -115 + gz * 20;
                const macro = r._terrainMacroSurfaceY(x, z, true);
                // Density-Säule scannen (solid wenn d>0)
                let spans = [], inSolid = false, spanStart = 0, topSolid = -1e9;
                for (let y = floor; y <= ceiling; y += 1.5) {
                    const d = r._terrainDensityAt(x, y, z);
                    const solid = d > 0;
                    if (solid && !inSolid) { inSolid = true; spanStart = y; }
                    if (!solid && inSolid) { inSolid = false; spans.push([Math.round(spanStart), Math.round(y)]); }
                    if (solid) topSolid = y;
                }
                if (inSolid) spans.push([Math.round(spanStart), Math.round(ceiling)]);
                // Loch: kein fester Boden im unteren Bereich (floor..floor+20)
                let floorSolid = false;
                for (let y = floor; y < floor + 20; y += 1.5) if (r._terrainDensityAt(x, y, z) > 0) { floorSolid = true; break; }
                if (!floorSolid) holeCols++;
                // Höhle bricht durch: air-Span direkt unter der Oberfläche (topSolid weit unter macro)
                if (topSolid < macro - 10) caveBreaks++;
                // mehrere getrennte Solid-Spannen (Überhang/Höhle in der Säule)
                if (spans.length > 1) multiSolid++;
                if (gx === 0 && gz === 0) report.colCenter = { x, z, macro: Math.round(macro * 10) / 10, topSolid: Math.round(topSolid * 10) / 10, spans, floorSolid };
            }
        }
        report.holeCols = holeCols;
        report.caveBreaks = caveBreaks;
        report.multiSolid = multiSolid;
        // Hydrosphäre: See/Fluss an der Position?
        const lk = r._hydrosphereLakeAt ? r._hydrosphereLakeAt(811, -115) : null;
        report.lakeHere = lk ? { bedY: Math.round(lk.bedY * 10) / 10, w: Math.round(lk.w * 100) / 100 } : null;
        report.waterLevelHere = r._waterLevelAt ? Math.round(r._waterLevelAt(811, -115) * 10) / 10 : null;
        // Wasser-Cells für den Chunk an der Position bauen + analysieren
        const cx = Math.floor((811 + span / 2) / span), cz = Math.floor((-115 + span / 2) / span);
        try {
            const cells = r._buildVoxelChunkWaterCells(cx * span, floor, cz * span, step, null, 0);
            let water = 0, waterAboveSurf = 0, waterUnderLid = 0;
            const dim = cfg.dim;
            for (let i = 0; i < dim; i++) for (let k = 0; k < dim; k++) {
                const wx = cx * span - span / 2 + (i + 0.5) * step, wz = cz * span - span / 2 + (k + 0.5) * step;
                const surf = r._terrainMacroSurfaceY(wx, wz, true);
                for (let j = 0; j < cfg.dimY; j++) {
                    const cy = floor + (j + 0.5) * step;
                    const v = cells[i + k * dim + j * dim * dim];
                    if (v === STATE.WATER) {
                        water++;
                        if (cy > surf + 2) waterAboveSurf++;
                        // unter SOLID-Deckel?
                        const above = j + 1 < cfg.dimY ? cells[i + k * dim + (j + 1) * dim * dim] : 0;
                        if (above === STATE.SOLID) waterUnderLid++;
                    }
                }
            }
            report.water = { total: water, aboveSurf: waterAboveSurf, underLid: waterUnderLid };
        } catch (e) { report.waterErr = String(e).split("\n")[0]; }
        // globale Hydro-Stats
        const hs = s.hydrosphere;
        if (hs && hs.stats) { report.hydroSeaPct = (hs.stats.seaCells / hs.stats.cells * 100).toFixed(1); report.hydroLakePct = (hs.stats.lakeCells / hs.stats.cells * 100).toFixed(1); }
        report.hull = { floor, ceiling: Math.round(ceiling * 10) / 10 };
        return report;
    });
    console.log("\n=== HARMONIE-DIAGNOSE @ (811, -115) + 5×5-Grid ===\n");
    console.log(`  Hülle: Boden ${out.hull.floor} … Decke ${out.hull.ceiling}`);
    console.log(`  Zentrum: macro=${out.colCenter.macro}, höchstes SOLID=${out.colCenter.topSolid}, floorSolid=${out.colCenter.floorSolid}`);
    console.log(`  Solid-Spannen (Säule): ${JSON.stringify(out.colCenter.spans)}`);
    console.log(`\n  >>> Säulen OHNE festen Boden (LÖCHER): ${out.holeCols} / 25  ${out.holeCols > 0 ? "❌" : "✓"}`);
    console.log(`  >>> Höhle bricht durch (topSolid < macro-10): ${out.caveBreaks} / 25  ${out.caveBreaks > 0 ? "❌" : "✓"}`);
    console.log(`  >>> Säulen mit getrennten Solid-Spannen (Überhang/Höhle): ${out.multiSolid} / 25`);
    console.log(`\n  Hydrosphäre hier: See=${JSON.stringify(out.lakeHere)}, waterLevel=${out.waterLevelHere}`);
    console.log(`  Global: Ozean ${out.hydroSeaPct}%, See ${out.hydroLakePct}%`);
    if (out.water) console.log(`\n  Wasser-Cells im Chunk: ${out.water.total} (über Surface+2: ${out.water.aboveSurf} ${out.water.aboveSurf > 0 ? "❌ Phantom!" : "✓"}, unter SOLID-Deckel: ${out.water.underLid} ${out.water.underLid > 0 ? "❌ Sub-Terrain!" : "✓"})`);
    if (out.waterErr) console.log(`  Wasser-Fehler: ${out.waterErr}`);
    await browser.close();
    server.close();
})().catch((e) => { console.error("FAIL", e.message); process.exit(1); });
