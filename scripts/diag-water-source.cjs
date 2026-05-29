// Diagnose V13.10 — die Wasser-Quelle: klettert Wasser über den 16-m-Rim
// statt über echtes Gefälle? (Schöpfer-Befund: "wieso kann das Wasser
// klättern und nicht nur fallen, welches Prinzip fehlt?"). MESSEN VOR
// SCHNEIDEN (V9.96-Disziplin). Headless liest keine Pixel, aber die Zell-
// Klassifikation + Atlas + Seed-Herkunft sind deterministisch lesbar.
//
// Was wir messen, pro WATER-Spalte in den geladenen Chunks:
//   (A) "echt-Atlas":  die Spalte selbst hat waterKind 1/2 (Ozean/See/Fluss)
//   (B) "rim-klettern": die Spalte ist Atlas-LAND, bekam aber via 16-m-3x3-Rim
//                       den Spiegel eines Nachbar-Wasserkörpers aufgedrückt
//   (C) davon: wie hoch über dem eigenen Terrain klettert das Wasser? (m)
// Plus ein Struktur-Test: eine breite Plattform NAHE einem See spawnen und
// zählen, wie viele Phantom-Wasser-Zellen im/um den Footprint dazukommen.
const puppeteer = require("puppeteer");
const http = require("http");
const fs = require("fs");
const path = require("path");

const PORT = 4327;
const root = path.resolve(__dirname, "..");
const mime = {
    ".html": "text/html",
    ".js": "application/javascript",
    ".wasm": "application/wasm",
    ".json": "application/json",
    ".woff2": "font/woff2",
    ".css": "text/css",
    ".png": "image/png",
};
const server = http.createServer((req, res) => {
    let p = req.url.split("?")[0];
    if (p === "/") p = "/index.html";
    const filePath = path.join(root, p);
    if (!filePath.startsWith(root)) {
        res.statusCode = 403;
        return res.end();
    }
    fs.readFile(filePath, (err, data) => {
        if (err) {
            res.statusCode = 404;
            return res.end();
        }
        res.setHeader("Content-Type", mime[path.extname(filePath)] || "application/octet-stream");
        res.end(data);
    });
});

(async () => {
    await new Promise((r) => server.listen(PORT, r));
    const browser = await puppeteer.launch({
        headless: true,
        args: [
            "--use-angle=swiftshader",
            "--enable-unsafe-swiftshader",
            "--enable-webgl",
            "--ignore-gpu-blocklist",
            "--no-sandbox",
            "--disable-setuid-sandbox",
            "--autoplay-policy=no-user-gesture-required",
        ],
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
                try {
                    r._gameLoopTick(performance.now());
                } catch (_e) {
                    /* listener */
                }
                if (r.state && r.state.playerMesh && r.state.voxelChunks && r.state.voxelChunks.size > 8) break;
            }
            await new Promise((resolve) => setTimeout(resolve, 16));
        }
    });

    const result = await page.evaluate(() => {
        const r = window.anazhRealm;
        const s = r.state;
        const STATE = r.constructor.CELL_STATE;
        const cfg = r._voxelChunkConfig(0);
        const { dim, step } = cfg;
        const dimSq = dim * dim;
        const out = {
            chunks: 0,
            waterChunks: 0,
            waterCols: 0, // Spalten mit >=1 WATER-Cell
            colsAtlasReal: 0, // davon: eigene Spalte ist waterKind 1/2 (echt)
            colsRimClimb: 0, // davon: eigene Spalte Atlas-LAND, Wasser via 3x3-Rim
            climbHist: { "0-1m": 0, "1-3m": 0, "3-6m": 0, "6-12m": 0, ">12m": 0 },
            maxClimb: 0,
            sumClimb: 0,
            notes: [],
        };

        const h = s.hydrosphere;
        if (!h || !h.ready || !h.water || !h.water.waterKind) {
            out.notes.push("keine Hydrosphäre bereit");
            return out;
        }
        const wK = h.water.waterKind;
        const wY = h.water.waterY;
        const hdim = h.dim;
        const hcell = h.cell;
        const atlasKindAt = (x, z) => {
            const ci = Math.floor((x - h.originX) / hcell);
            const cj = Math.floor((z - h.originZ) / hcell);
            if (ci < 0 || cj < 0 || ci >= hdim || cj >= hdim) return -1;
            return wK[ci + cj * hdim];
        };
        const atlasRimAt = (x, z) => {
            // höchster Wasser-Spiegel im 3x3 um (x,z) — spiegelt _atlasWaterLevelAt
            const ci = Math.floor((x - h.originX) / hcell);
            const cj = Math.floor((z - h.originZ) / hcell);
            let rim = -Infinity;
            for (let dj = -1; dj <= 1; dj++)
                for (let di = -1; di <= 1; di++) {
                    const ni = ci + di;
                    const nj = cj + dj;
                    if (ni < 0 || nj < 0 || ni >= hdim || nj >= hdim) continue;
                    const nk = wK[ni + nj * hdim];
                    if ((nk === 1 || nk === 2) && wY[ni + nj * hdim] > rim) rim = wY[ni + nj * hdim];
                }
            return rim;
        };

        for (const [key, entry] of s.voxelChunks) {
            out.chunks++;
            if (!entry || !entry.waterCells) continue;
            out.waterChunks++;
            const cells = entry.waterCells;
            const parts = key.split(",");
            const cx = parseInt(parts[0], 10);
            const cz = parseInt(parts[1], 10);
            const span = dim * step;
            const ox = cx * span - span / 2;
            const oz = cz * span - span / 2;
            for (let k = 0; k < dim; k++) {
                for (let i = 0; i < dim; i++) {
                    // hat diese Spalte WATER?
                    let hasWater = false;
                    for (let j = 0; j < cfg.dimY; j++) {
                        if (cells[i + k * dim + j * dimSq] === STATE.WATER) {
                            hasWater = true;
                            break;
                        }
                    }
                    if (!hasWater) continue;
                    out.waterCols++;
                    const wx = ox + (i + 0.5) * step;
                    const wz = oz + (k + 0.5) * step;
                    const ownKind = atlasKindAt(wx, wz);
                    if (ownKind === 1 || ownKind === 2) {
                        out.colsAtlasReal++;
                    } else {
                        // Atlas-LAND-Spalte mit Wasser → Rim-Klettern.
                        out.colsRimClimb++;
                        const rim = atlasRimAt(wx, wz);
                        const surfY = r._voxelSurfaceY ? r._voxelSurfaceY(wx, wz) : null;
                        if (rim > -Infinity && Number.isFinite(surfY)) {
                            const climb = Math.max(0, rim - surfY);
                            out.sumClimb += climb;
                            if (climb > out.maxClimb) out.maxClimb = climb;
                            if (climb <= 1) out.climbHist["0-1m"]++;
                            else if (climb <= 3) out.climbHist["1-3m"]++;
                            else if (climb <= 6) out.climbHist["3-6m"]++;
                            else if (climb <= 12) out.climbHist["6-12m"]++;
                            else out.climbHist[">12m"]++;
                        }
                    }
                }
            }
        }
        out.avgClimb = out.colsRimClimb > 0 ? out.sumClimb / out.colsRimClimb : 0;
        out.rimClimbPct = out.waterCols > 0 ? (100 * out.colsRimClimb) / out.waterCols : 0;
        return out;
    });

    console.log("\n=== DIAG V13.10 — Wasser-Quelle: klettert es über den 16-m-Rim? ===\n");
    if (result.notes && result.notes.length) console.log("Notes:", result.notes.join(" | "), "\n");
    console.log(`Chunks: ${result.chunks} (mit Wasser-Cells: ${result.waterChunks})`);
    console.log(`WATER-Spalten gesamt:        ${result.waterCols}`);
    console.log(
        `  echt-Atlas (waterKind 1/2): ${result.colsAtlasReal}  (${(100 - (result.rimClimbPct || 0)).toFixed(1)}%)`,
    );
    console.log(
        `  RIM-KLETTERN (Atlas-Land):  ${result.colsRimClimb}  (${(result.rimClimbPct || 0).toFixed(1)}%)  <-- das ist das "klättern"`,
    );
    console.log(`\nKletter-Höhe über eigenem Terrain (nur Rim-Spalten):`);
    console.log(`  max=${(result.maxClimb || 0).toFixed(2)} m   avg=${(result.avgClimb || 0).toFixed(2)} m`);
    console.log(`  Histogramm:`, JSON.stringify(result.climbHist));
    console.log("");
    console.log("Deutung:");
    console.log("  - hoher RIM-KLETTERN-Anteil = Wasser entsteht NEBEN echten Körpern (das Phantom an Strukturen).");
    console.log("  - Kletter-Höhe >1-3 m = Wasser steht spürbar über dem Boden der Land-Spalte (sichtbares Bluten).");

    await browser.close();
    server.close();
})();
