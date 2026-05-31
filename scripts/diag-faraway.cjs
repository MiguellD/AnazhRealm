// Diagnose: warum zerfaellt die Welt "nach einiger Zeit in eine Richtung"?
// Scannt WEIT (±1500 m) + prueft BEIDE Huellen-Grenzen (Decke UND Boden, inkl.
// 3D-Roughness) + Saeulen-Integritaet an der Schoepfer-Position (-369,631) und
// in der Hochgebirgs-/Tiefsee-Region. Findet die Wurzel der Fern-Chunkfehler.
const puppeteer = require("puppeteer");
const http = require("http");
const fs = require("fs");
const path = require("path");
const PORT = 4353;
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
        const r = window.anazhRealm, s = r.state;
        const cfg = r._voxelChunkConfig(0);
        const base = s.terrainBaseHeight || 0;
        const floor = base - cfg.floorDrop, ceiling = floor + cfg.dimY * cfg.step;
        const ROUGH = 12; // 3D-Roughness-Amplitude (noise3D*7 + noise3D*5)

        // (A) WEIT-Scan: macroMin/Max + Huellen-Verletzungen (Decke + Boden)
        let macroMin = 1e9, macroMax = -1e9, macroMinAt = null, macroMaxAt = null;
        let overCeil = 0, underFloor = 0, total = 0;
        const overSpots = [], underSpots = [];
        for (let x = -1500; x <= 1500; x += 8) {
            for (let z = -1500; z <= 1500; z += 8) {
                const m = r._terrainMacroSurfaceY(x, z, true);
                total++;
                if (m < macroMin) { macroMin = m; macroMinAt = { x, z }; }
                if (m > macroMax) { macroMax = m; macroMaxAt = { x, z }; }
                if (m + ROUGH > ceiling) { overCeil++; if (overSpots.length < 6) overSpots.push({ x, z, m: Math.round(m) }); }
                if (m - ROUGH < floor) { underFloor++; if (underSpots.length < 6) underSpots.push({ x, z, m: Math.round(m) }); }
            }
        }

        // (B) Saeulen-Integritaet an benannten Spots
        function probeCol(x, z) {
            const macro = r._terrainMacroSurfaceY(x, z, true);
            let spans = [], inSolid = false, spanStart = 0, topSolid = -1e9, botSolid = 1e9;
            for (let y = floor; y <= ceiling; y += 1.0) {
                const solid = r._terrainDensityAt(x, y, z) > 0;
                if (solid && !inSolid) { inSolid = true; spanStart = y; }
                if (!solid && inSolid) { inSolid = false; spans.push([Math.round(spanStart), Math.round(y)]); }
                if (solid) { topSolid = y; if (botSolid === 1e9) botSolid = y; }
            }
            if (inSolid) spans.push([Math.round(spanStart), Math.round(ceiling)]);
            let floorSolid = false;
            for (let y = floor; y < floor + 20; y += 1.0) if (r._terrainDensityAt(x, y, z) > 0) { floorSolid = true; break; }
            return { x, z, macro: Math.round(macro * 10) / 10, topSolid: Math.round(topSolid), botSolid: botSolid === 1e9 ? null : Math.round(botSolid), nSpans: spans.length, spans: spans.slice(0, 6), floorSolid, caveBreak: topSolid < macro - 10, allAir: topSolid === -1e9 };
        }

        // (C) 5x5-Grids: Spieler-Pos, Hochgebirge (macroMax), Tiefsee (macroMin)
        function grid(cx, cz, label) {
            let holes = 0, caveBreaks = 0, multiSolid = 0, allAir = 0;
            for (let gx = -2; gx <= 2; gx++) for (let gz = -2; gz <= 2; gz++) {
                const c = probeCol(cx + gx * 16, cz + gz * 16);
                if (!c.floorSolid) holes++;
                if (c.caveBreak && !c.allAir) caveBreaks++;
                if (c.nSpans > 1) multiSolid++;
                if (c.allAir) allAir++;
            }
            return { label, cx, cz, holes, caveBreaks, multiSolid, allAir };
        }

        return {
            base, floor, ceiling: Math.round(ceiling * 10) / 10,
            macroMin: Math.round(macroMin * 10) / 10, macroMinAt,
            macroMax: Math.round(macroMax * 10) / 10, macroMaxAt,
            overCeil, underFloor, total, overSpots, underSpots,
            colPlayer: probeCol(-369, 631),
            colMtn: probeCol(macroMaxAt.x, macroMaxAt.z),
            colDeep: probeCol(macroMinAt.x, macroMinAt.z),
            gridPlayer: grid(-369, 631, "Spieler (-369,631)"),
            gridMtn: grid(macroMaxAt.x, macroMaxAt.z, "Hochgebirge"),
            gridDeep: grid(macroMinAt.x, macroMinAt.z, "Tiefste Region"),
        };
    });
    const L = (...a) => console.log(...a);
    L("\n=== FERN-DIAGNOSE: warum zerfaellt die Welt in eine Richtung? ===\n");
    L(`  Voxel-Huelle: Boden ${out.floor} m … Decke ${out.ceiling} m (base ${out.base}), 3D-Roughness ±12 m`);
    L(`  Makro-Surface MIN: ${out.macroMin} m @ (${out.macroMinAt.x},${out.macroMinAt.z})`);
    L(`  Makro-Surface MAX: ${out.macroMax} m @ (${out.macroMaxAt.x},${out.macroMaxAt.z})`);
    L(`\n  >>> Grid-Punkte mit (macro+12) ueber Decke:  ${out.overCeil} / ${out.total}  ${out.overCeil > 0 ? "❌ PEAK-LOECHER" : "✓"}`);
    if (out.overSpots.length) L(`      Spots: ${out.overSpots.map((t) => `(${t.x},${t.z})=${t.m}m`).join(", ")}`);
    L(`  >>> Grid-Punkte mit (macro-12) unter Boden:  ${out.underFloor} / ${out.total}  ${out.underFloor > 0 ? "❌ BODEN-LOECHER (Saeule ganz Luft)" : "✓"}`);
    if (out.underSpots.length) L(`      Spots: ${out.underSpots.map((t) => `(${t.x},${t.z})=${t.m}m`).join(", ")}`);
    const pc = (c) => `macro=${c.macro} top=${c.topSolid} bot=${c.botSolid} spans=${c.nSpans} floorSolid=${c.floorSolid}${c.allAir ? " ALL-AIR❌" : ""}${c.caveBreak ? " CAVEBREAK❌" : ""}`;
    L(`\n  Saeule Spieler (-369,631): ${pc(out.colPlayer)}`);
    L(`     spans: ${JSON.stringify(out.colPlayer.spans)}`);
    L(`  Saeule Hochgebirge (${out.colMtn.x},${out.colMtn.z}): ${pc(out.colMtn)}`);
    L(`     spans: ${JSON.stringify(out.colMtn.spans)}`);
    L(`  Saeule Tiefste (${out.colDeep.x},${out.colDeep.z}): ${pc(out.colDeep)}`);
    L(`     spans: ${JSON.stringify(out.colDeep.spans)}`);
    for (const g of [out.gridPlayer, out.gridMtn, out.gridDeep]) {
        L(`\n  ${g.label} 5×5: Loecher=${g.holes}/25 caveBreaks=${g.caveBreaks}/25 multiSolid=${g.multiSolid}/25 allAir=${g.allAir}/25`);
    }
    await browser.close();
    server.close();
})().catch((e) => { console.error("FAIL", e.message); process.exit(1); });
