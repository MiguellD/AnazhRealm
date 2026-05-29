// Diagnose V13.10 (scharf) — trennt ECHTES Seewasser von PHANTOM/BLUTEN.
// Korrektur der ersten Metrik (die tiefes Seeufer mit Bluten verwechselte).
// Zwei saubere Befunde, die dem Schöpfer-Erleben entsprechen:
//
//  (1) PHANTOM-auf-Land: eine WATER-Spalte, deren eigene Atlas-Zelle Land ist
//      UND deren komplettes 3x3-Atlas-Umfeld Land ist (kind 0, kein einziger
//      echter Wasserkörper in Reichweite). Das ist Wasser, das NIRGENDS einen
//      Atlas-Körper hat = pures Phantom. Sollte 0 sein.
//
//  (2) UFER-RIM-auf-Land: WATER-Spalte, eigene Atlas-Zelle Land, ABER ein
//      echter Wasserkörper im 3x3 (kind 1/2). Das ist die 16-m-Ufer-Verfeinerung.
//      Aufgeteilt nach: ist die Spalte SOLIDE vom Wasserkörper getrennt
//      (=Bluten über Wand) oder offen verbunden (=echtes Ufer)?
//      Test: liegt zwischen Spalte und nächster Wasser-Atlas-Zelle eine
//      durchgehende SOLID-Terrain-Barriere auf Spiegelhöhe?
//
//  (3) Struktur-Test: eine PLATTFORM auf TROCKENEM Land nahe (aber nicht in)
//      einem See spawnen; Wasser-Zellen im Footprint VORHER vs NACHHER zählen.
//      Das ist der direkte "Wasser spawnt um mein Haus"-Befund.
const puppeteer = require("puppeteer");
const http = require("http");
const fs = require("fs");
const path = require("path");

const PORT = 4328;
const root = path.resolve(__dirname, "..");
const mime = { ".html": "text/html", ".js": "application/javascript", ".wasm": "application/wasm", ".json": "application/json", ".woff2": "font/woff2", ".css": "text/css", ".png": "image/png" };
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
        headless: true,
        args: ["--use-angle=swiftshader", "--enable-unsafe-swiftshader", "--enable-webgl", "--ignore-gpu-blocklist", "--no-sandbox", "--disable-setuid-sandbox", "--autoplay-policy=no-user-gesture-required"],
    });
    const page = await browser.newPage();
    await page.setViewport({ width: 1280, height: 720 });
    page.on("pageerror", (err) => console.log("[PAGE-ERROR]", (err.stack || err.message).split("\n")[0]));
    await page.goto(`http://127.0.0.1:${PORT}/index.html`, { waitUntil: "domcontentloaded", timeout: 30000 });

    await page.evaluate(async () => {
        const start = performance.now();
        while (performance.now() - start < 25000) {
            const r = window.anazhRealm;
            if (r && typeof r._gameLoopTick === "function") {
                try { r._gameLoopTick(performance.now()); } catch (_e) { /* */ }
                if (r.state && r.state.playerMesh && r.state.voxelChunks && r.state.voxelChunks.size > 8) break;
            }
            await new Promise((res) => setTimeout(res, 16));
        }
    });

    const result = await page.evaluate(() => {
        const r = window.anazhRealm;
        const s = r.state;
        const STATE = r.constructor.CELL_STATE;
        const cfg = r._voxelChunkConfig(0);
        const { dim, dimY, step } = cfg;
        const dimSq = dim * dim;
        const out = { notes: [], waterCols: 0, atlasReal: 0, phantomNoAtlas: 0, shoreRim: 0, shoreRimClimbGt3: 0, shoreRimClimbGt6: 0 };

        const h = s.hydrosphere;
        if (!h || !h.ready || !h.water || !h.water.waterKind) { out.notes.push("keine Hydrosphäre"); return out; }
        const wK = h.water.waterKind, wY = h.water.waterY, hdim = h.dim, hcell = h.cell;
        const kindAt = (x, z) => {
            const ci = Math.floor((x - h.originX) / hcell), cj = Math.floor((z - h.originZ) / hcell);
            if (ci < 0 || cj < 0 || ci >= hdim || cj >= hdim) return -1;
            return wK[ci + cj * hdim];
        };
        const anyWaterIn3x3 = (x, z) => {
            const ci = Math.floor((x - h.originX) / hcell), cj = Math.floor((z - h.originZ) / hcell);
            let rim = -Infinity;
            for (let dj = -1; dj <= 1; dj++) for (let di = -1; di <= 1; di++) {
                const ni = ci + di, nj = cj + dj;
                if (ni < 0 || nj < 0 || ni >= hdim || nj >= hdim) continue;
                const nk = wK[ni + nj * hdim];
                if ((nk === 1 || nk === 2) && wY[ni + nj * hdim] > rim) rim = wY[ni + nj * hdim];
            }
            return rim;
        };

        for (const [key, entry] of s.voxelChunks) {
            if (!entry || !entry.waterCells) continue;
            const cells = entry.waterCells;
            const parts = key.split(","), cx = parseInt(parts[0], 10), cz = parseInt(parts[1], 10);
            const span = dim * step, ox = cx * span - span / 2, oz = cz * span - span / 2;
            for (let k = 0; k < dim; k++) for (let i = 0; i < dim; i++) {
                let hasWater = false;
                for (let j = 0; j < dimY; j++) if (cells[i + k * dim + j * dimSq] === STATE.WATER) { hasWater = true; break; }
                if (!hasWater) continue;
                out.waterCols++;
                const wx = ox + (i + 0.5) * step, wz = oz + (k + 0.5) * step;
                const own = kindAt(wx, wz);
                if (own === 1 || own === 2) { out.atlasReal++; continue; }
                // Atlas-Land mit Wasser:
                const rim = anyWaterIn3x3(wx, wz);
                if (rim <= -Infinity) {
                    out.phantomNoAtlas++; // KEIN Wasserkörper im 3x3 = pures Phantom
                } else {
                    out.shoreRim++;
                    const surfY = r._voxelSurfaceY ? r._voxelSurfaceY(wx, wz) : null;
                    if (Number.isFinite(surfY)) {
                        const climb = rim - surfY;
                        if (climb > 3) out.shoreRimClimbGt3++;
                        if (climb > 6) out.shoreRimClimbGt6++;
                    }
                }
            }
        }
        return out;
    });

    // --- Struktur-Test: Plattform auf Trockenland nahe See ---
    const structTest = await page.evaluate(() => {
        const r = window.anazhRealm;
        const s = r.state;
        const STATE = r.constructor.CELL_STATE;
        const cfg = r._voxelChunkConfig(0);
        const { dim, dimY, step } = cfg;
        const dimSq = dim * dim;
        const h = s.hydrosphere;
        const out = { found: false };
        if (!h || !h.ready || !h.water) return out;
        const wK = h.water.waterKind, wY = h.water.waterY, hdim = h.dim, hcell = h.cell;

        // Suche eine TROCKENE Land-Stelle (kind 0) mit einem echten Wasserkörper
        // in ~16-32 m Nähe (also nahe genug für Rim-Infektion), nahe dem Spieler.
        const pm = s.playerMesh.position;
        let spot = null;
        for (let rad = 12; rad <= 60 && !spot; rad += 4) {
            for (let a = 0; a < 16 && !spot; a++) {
                const ang = (a / 16) * Math.PI * 2;
                const x = pm.x + Math.cos(ang) * rad, z = pm.z + Math.sin(ang) * rad;
                const ci = Math.floor((x - h.originX) / hcell), cj = Math.floor((z - h.originZ) / hcell);
                if (ci < 1 || cj < 1 || ci >= hdim - 1 || cj >= hdim - 1) continue;
                if (wK[ci + cj * hdim] !== 0) continue; // muss Land sein
                // echter Wasser-Nachbar im 3x3?
                let hasWaterNb = false;
                for (let dj = -1; dj <= 1; dj++) for (let di = -1; di <= 1; di++) {
                    const nk = wK[ci + di + (cj + dj) * hdim];
                    if (nk === 1 || nk === 2) hasWaterNb = true;
                }
                if (hasWaterNb) spot = { x, z };
            }
        }
        if (!spot) { out.note = "kein trockener Land-Spot neben Wasser nahe Spieler gefunden"; return out; }
        out.found = true;
        out.spot = spot;

        const countWaterAround = (cxw, czw, rmeters) => {
            let n = 0;
            for (const [key, entry] of s.voxelChunks) {
                if (!entry || !entry.waterCells) continue;
                const parts = key.split(","), cx = parseInt(parts[0], 10), cz = parseInt(parts[1], 10);
                const span = dim * step, ox = cx * span - span / 2, oz = cz * span - span / 2;
                const cells = entry.waterCells;
                for (let k = 0; k < dim; k++) for (let i = 0; i < dim; i++) {
                    const wx = ox + (i + 0.5) * step, wz = oz + (k + 0.5) * step;
                    if (Math.hypot(wx - cxw, wz - czw) > rmeters) continue;
                    for (let j = 0; j < dimY; j++) if (cells[i + k * dim + j * dimSq] === STATE.WATER) { n++; break; }
                }
            }
            return n;
        };

        out.waterBefore = countWaterAround(spot.x, spot.z, 10);
        const gy = r.getTerrainHeightAt ? r.getTerrainHeightAt(spot.x, spot.z) : pm.y;
        let entry = null;
        try { entry = r.spawnArchitecture("start_plattform", { x: spot.x, y: gy + 0.5, z: spot.z }, {}); } catch (e) { out.note = "spawn threw " + (e && e.message); }
        // Rebuild der betroffenen Chunks erzwingen (Tick + drain).
        for (let f = 0; f < 40; f++) { try { r._gameLoopTick(performance.now()); } catch (_e) { /* */ } }
        if (typeof r._drainDirtyVoxelChunks === "function") { try { r._drainDirtyVoxelChunks(true); } catch (_e) { /* */ } }
        out.waterAfter = countWaterAround(spot.x, spot.z, 10);
        out.blockerAABBs = entry && entry.blockerAABBs ? entry.blockerAABBs.length : 0;
        out.terrainY = gy;
        return out;
    });

    console.log("\n=== DIAG V13.10 (scharf) — Phantom vs. echtes Seewasser ===\n");
    if (result.notes && result.notes.length) console.log("Notes:", result.notes.join(" | "));
    console.log(`WATER-Spalten gesamt:            ${result.waterCols}`);
    console.log(`  echt-Atlas (eigene Zelle nass): ${result.atlasReal}`);
    console.log(`  Ufer-Rim (Land, Wasser im 3x3): ${result.shoreRim}`);
    console.log(`     davon klettern >3m:          ${result.shoreRimClimbGt3}`);
    console.log(`     davon klettern >6m:          ${result.shoreRimClimbGt6}`);
    console.log(`  PHANTOM (Land, KEIN Wasser 3x3): ${result.phantomNoAtlas}  <-- pures Phantom, sollte 0`);
    console.log("\n--- Struktur-Test: Plattform auf Trockenland nahe See ---");
    if (!structTest.found) {
        console.log("  ", structTest.note || "kein Spot");
    } else {
        console.log(`  Spot (${structTest.spot.x.toFixed(1)}, ${structTest.spot.z.toFixed(1)}), TerrainY=${(structTest.terrainY || 0).toFixed(1)}, blockerAABBs=${structTest.blockerAABBs}`);
        console.log(`  Wasser-Spalten im 10m-Umkreis VORHER:  ${structTest.waterBefore}`);
        console.log(`  Wasser-Spalten im 10m-Umkreis NACHHER: ${structTest.waterAfter}`);
        console.log(`  -> ${structTest.waterAfter > structTest.waterBefore ? "STRUKTUR HAT WASSER AUSGELÖST (+" + (structTest.waterAfter - structTest.waterBefore) + ")" : "kein neues Wasser durch Struktur"}`);
    }

    await browser.close();
    server.close();
})();
