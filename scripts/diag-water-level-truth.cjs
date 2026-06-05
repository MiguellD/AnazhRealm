// Diagnose — die WASSER-HÖHEN-WAHRHEITSPFADE messen (Schöpfer: „im Seezentrum
// fällt die Render-Oberfläche, aber die Physik stimmt — zwei Wahrheitspfade?").
// Pro Spalte im nassesten Chunk: (1) Atlas-Spiegel L (_atlasWaterLevelAt), (2)
// Physik-Zell-Oberkante (wie _playerWaterContext: oy+(topJ+1)*step), (3) die
// ECHTE Render-Iso-Höhe (Mesh-Vertices nahe der Spalte). Deltas zeigen, WO die
// Pfade divergieren: cellTop−L (füllen die Zellen bis zum Spiegel?), isoY−cellTop
// (stimmt Render = Physik?), Mitte vs. Rand (flacher Offset oder Durchhängen?).
const puppeteer = require("puppeteer");
const http = require("http");
const fs = require("fs");
const path = require("path");
const PORT = 4345;
const root = path.resolve(__dirname, "..");
const mime = { ".html": "text/html", ".js": "application/javascript", ".wasm": "application/wasm", ".json": "application/json", ".woff2": "font/woff2", ".css": "text/css", ".png": "image/png" };
const server = http.createServer((req, res) => {
    let p = req.url.split("?")[0];
    if (p === "/") p = "/index.html";
    const fp = path.join(root, p);
    if (!fp.startsWith(root)) { res.statusCode = 403; return res.end(); }
    fs.readFile(fp, (err, data) => { if (err) { res.statusCode = 404; return res.end(); } res.setHeader("Content-Type", mime[path.extname(fp)] || "application/octet-stream"); res.end(data); });
});
(async () => {
    await new Promise((r) => server.listen(PORT, r));
    const browser = await puppeteer.launch({ headless: true, args: ["--use-angle=swiftshader", "--enable-unsafe-swiftshader", "--enable-webgl", "--ignore-gpu-blocklist", "--no-sandbox", "--disable-setuid-sandbox"] });
    const page = await browser.newPage();
    page.on("pageerror", (e) => console.log("[PAGE-ERROR]", (e.stack || e.message).split("\n")[0]));
    await page.goto(`http://127.0.0.1:${PORT}/index.html`, { waitUntil: "domcontentloaded", timeout: 30000 });
    await page.evaluate(async () => {
        let stubbed = false;
        const start = performance.now();
        while (performance.now() - start < 40000) {
            const r = window.anazhRealm;
            if (r && !stubbed && r.state && r.state.renderer) {
                r.state.renderer.render = function () {};
                if (typeof r.state.renderer.renderAsync === "function") r.state.renderer.renderAsync = () => Promise.resolve();
                r.state.postProcessingFailed = true; stubbed = true;
            }
            if (r && typeof r._gameLoopTick === "function") {
                try { r._gameLoopTick(performance.now()); } catch (_e) {}
                if (r.state && r.state.playerMesh && r.state.voxelChunks && r.state.voxelChunks.size > 20) break;
            }
            await new Promise((res) => setTimeout(res, 4));
        }
        const r = window.anazhRealm;
        for (let f = 0; f < 80; f++) { try { r._tickPendingWaterIso(64); r._gameLoopTick(performance.now()); } catch (_e) {} }
    });

    const out = await page.evaluate(async () => {
        const r = window.anazhRealm; const s = r.state;
        const STATE = r.constructor.CELL_STATE;
        const { dim, dimY, step, span, floorDrop } = r._voxelChunkConfig(0);
        const oy = (s.terrainBaseHeight || 0) - floorDrop;
        // nassester Chunk
        let bestKey = null, bestCount = 0;
        for (const [key, e] of s.voxelChunks) {
            if (!e || !e.waterCells) continue;
            let c = 0; for (let n = 0; n < e.waterCells.length; n++) if (e.waterCells[n] === STATE.WATER) c++;
            if (c > bestCount) { bestCount = c; bestKey = key; }
        }
        if (!bestKey) return { err: "kein Wasser-Chunk" };
        const [cx, cz] = bestKey.split(",").map(Number);
        const e = s.voxelChunks.get(bestKey);
        const cells = e.waterCells;
        const ox = cx * span, oz = cz * span;
        const iso = s.voxelChunkWaterIso.get(bestKey);
        const isoPos = iso && iso.geometry ? iso.geometry.attributes.position : null;
        const colHasWater = (i, k) => { for (let j = 0; j < dimY; j++) if (cells[i + k * dim + j * dim * dim] === STATE.WATER) return true; return false; };
        // wasser-tragende Spalten sammeln, dann Mitte + Ränder beproben
        const wcols = [];
        for (let k = 0; k < dim; k++) for (let i = 0; i < dim; i++) if (colHasWater(i, k)) wcols.push([i, k]);
        const pick = [];
        if (wcols.length) {
            // Zentroid + 4 Spalten Richtung Rand
            let si = 0, sk = 0; for (const [i, k] of wcols) { si += i; sk += k; }
            const ci = Math.round(si / wcols.length), ck = Math.round(sk / wcols.length);
            pick.push([ci, ck]);
            // nächste wasser-Spalten in 4 Richtungen vom Zentroid weg
            for (const [di, dk] of [[-1, 0], [1, 0], [0, -1], [0, 1]]) {
                let bi = ci, bk = ck;
                for (let t = 1; t < dim; t++) { const ni = ci + di * t, nk = ck + dk * t; if (ni < 0 || nk < 0 || ni >= dim || nk >= dim) break; if (colHasWater(ni, nk)) { bi = ni; bk = nk; } else break; }
                pick.push([bi, bk]);
            }
        }
        const samples = [];
        for (const [i, k] of pick) {
            const wx = ox + (i + 0.5) * step, wz = oz + (k + 0.5) * step;
            const atlasL = r._atlasWaterLevelAt(wx, wz, Infinity);
            let topJ = -1; for (let j = dimY - 1; j >= 0; j--) { if (cells[i + k * dim + j * dim * dim] === STATE.WATER) { topJ = j; break; } }
            const cellTop = topJ >= 0 ? oy + (topJ + 1) * step : null;
            let isoY = null;
            if (isoPos) { const r2 = step * step; let maxy = null; for (let v = 0; v < isoPos.count; v++) { const dx = isoPos.getX(v) - wx, dz = isoPos.getZ(v) - wz; if (dx * dx + dz * dz <= r2) { const y = isoPos.getY(v); if (maxy === null || y > maxy) maxy = y; } } isoY = maxy; }
            samples.push({
                i, k, topJ,
                atlasL: isFinite(atlasL) ? +atlasL.toFixed(2) : null,
                cellTop: cellTop != null ? +cellTop.toFixed(2) : null,
                isoY: isoY != null ? +isoY.toFixed(2) : null,
                isoMinusCellTop: isoY != null && cellTop != null ? +(isoY - cellTop).toFixed(2) : null,
                cellTopMinusL: cellTop != null && isFinite(atlasL) ? +(cellTop - atlasL).toFixed(2) : null,
            });
        }
        return { bestKey, bestCount, waterCols: wcols.length, oy: +oy.toFixed(2), step, isoVerts: isoPos ? isoPos.count : 0, samples };
    });

    console.log("\n=== WASSER-HÖHEN-WAHRHEITSPFADE — MESSUNG ===");
    if (out.err) { console.log(out.err); }
    else {
        console.log(`nassester Chunk ${out.bestKey}: ${out.bestCount} WATER-Zellen, ${out.waterCols} Wasser-Spalten, Iso-Vertices ${out.isoVerts}, oy=${out.oy}, step=${out.step}`);
        console.log("Spalte(i,k)  AtlasL  cellTop(Physik)  isoY(Render)  isoY−cellTop  cellTop−L");
        for (const sm of out.samples) {
            console.log(`  (${sm.i},${sm.k})\t${sm.atlasL}\t${sm.cellTop}\t\t${sm.isoY}\t\t${sm.isoMinusCellTop}\t\t${sm.cellTopMinusL}`);
        }
        // Urteil
        const center = out.samples[0];
        const drift = out.samples.map((s) => s.isoMinusCellTop).filter((v) => v != null);
        const maxDrift = drift.length ? Math.max(...drift.map(Math.abs)) : null;
        const fillGap = out.samples.map((s) => s.cellTopMinusL).filter((v) => v != null);
        const maxFillGap = fillGap.length ? Math.max(...fillGap.map(Math.abs)) : null;
        console.log("\n=== URTEIL ===");
        console.log(`Render vs. Physik (|isoY−cellTop| max): ${maxDrift}  → ${maxDrift != null && maxDrift > 0.5 ? "DIVERGENZ (Render ≠ Physik)" : "stimmen überein"}`);
        console.log(`Zellen-Füllung vs. Spiegel (|cellTop−L| max): ${maxFillGap}  → ${maxFillGap != null && maxFillGap > 1.0 ? "Zellen füllen NICHT bis L" : "Zellen füllen ~bis L"}`);
        console.log(`Zentroid isoY=${center ? center.isoY : "?"} vs. Ränder ${out.samples.slice(1).map((s) => s.isoY).join(", ")}  → Durchhängen? (Mitte tiefer als Ränder?)`);
    }
    await browser.close();
    server.close();
})();
