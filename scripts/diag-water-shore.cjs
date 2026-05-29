// Diagnose V13.7 — die Uferlinien-Wand (V9.96-Disziplin: messen vor schneiden,
// nicht raten). Schöpfer-Browser-Befund V13.6: „Mulde physikalisch mit Wasser
// gefüllt, doch die Oberfläche des Sees/Meers schliesst schon zuvor, vertikal zum
// Grund." Hypothese: die V13.1-atlas-strikte Klassifikation lässt nahe-Ufer-Spalten,
// die UNTER dem Wasserspiegel liegen aber atlas-trocken sind, als AIR → die laterale
// Wasser-AIR-Grenze wird eine vertikale Iso-Wand (statt dass die Fläche bis zum
// Terrain durchzieht). Wir messen das an der echten Geometrie + dem Zell-Feld —
// kein anazhRealm.js-Touch. Headless liest keine Pixel, aber Vertices/Normalen +
// Zellen sind deterministisch lesbar.
const puppeteer = require("puppeteer");
const http = require("http");
const fs = require("fs");
const path = require("path");

const PORT = 4321;
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
        const { dim, step, span, dimY, floorDrop } = cfg;
        const base = s.terrainBaseHeight || 0;
        const oyChunk = base - floorDrop;
        const band = s.hydroBand;
        const out = {
            chunks: 0,
            waterChunks: 0,
            band: band ? { top: band.top, bottom: band.bottom } : null,
            dimY,
            bandCells: 0,
            // Zell-Befund:
            waterCols: 0, // Spalten mit ≥1 WATER-Cell
            wallCells: 0, // AIR-Cells lateral (4-Nbr) an WATER auf gleicher Höhe = Wand-Verursacher
            wallColsBelowLevel: 0, // dry-Spalten unter dem Chunk-Wasserspiegel neben Wasser
            // Mesh-Befund:
            isoMeshes: 0,
            isoTris: 0,
            isoVertTris: 0, // |normal.y| < 0.3 → ~vertikale Wand-Dreiecke
            isoVertAreaPct: 0,
        };
        if (band) out.bandCells = Math.ceil((band.top - band.bottom) / step);
        const idx = (i, k, j) => i + k * dim + j * dim * dim;

        let vertArea = 0;
        let totArea = 0;

        for (const [key, entry] of s.voxelChunks) {
            out.chunks++;
            if (!entry || !entry.waterCells) continue;
            const cells = entry.waterCells;
            // hat der Chunk Wasser?
            let hasWater = false;
            for (let n = 0; n < cells.length; n++) {
                if (cells[n] === STATE.WATER) {
                    hasWater = true;
                    break;
                }
            }
            if (!hasWater) continue;
            out.waterChunks++;

            // Pro Spalte: oberste WATER-Cell. Chunk-Wasserspiegel = Modus der Tops.
            const colTop = new Int32Array(dim * dim).fill(-1);
            const topHist = new Map();
            for (let k = 0; k < dim; k++) {
                for (let i = 0; i < dim; i++) {
                    for (let j = dimY - 1; j >= 0; j--) {
                        if (cells[idx(i, k, j)] === STATE.WATER) {
                            colTop[i + k * dim] = j;
                            topHist.set(j, (topHist.get(j) || 0) + 1);
                            out.waterCols++;
                            break;
                        }
                    }
                }
            }
            // dominanter Wasserspiegel (häufigstes Top-j)
            let levelJ = -1;
            let best = 0;
            for (const [j, c] of topHist) {
                if (c > best) {
                    best = c;
                    levelJ = j;
                }
            }

            // Wand-Verursacher: AIR-Cell, die lateral (±i/±k) an eine WATER-Cell
            // GLEICHER Höhe grenzt UND unter dem Chunk-Spiegel liegt. Genau hier
            // baut die Iso eine vertikale Wasser-AIR-Fläche.
            for (let j = 0; j <= levelJ; j++) {
                for (let k = 0; k < dim; k++) {
                    for (let i = 0; i < dim; i++) {
                        if (cells[idx(i, k, j)] !== STATE.AIR) continue;
                        let touchesWater = false;
                        if (i + 1 < dim && cells[idx(i + 1, k, j)] === STATE.WATER) touchesWater = true;
                        else if (i > 0 && cells[idx(i - 1, k, j)] === STATE.WATER) touchesWater = true;
                        else if (k + 1 < dim && cells[idx(i, k + 1, j)] === STATE.WATER) touchesWater = true;
                        else if (k > 0 && cells[idx(i, k - 1, j)] === STATE.WATER) touchesWater = true;
                        if (touchesWater) out.wallCells++;
                    }
                }
            }
            // dry-Spalten (kein WATER) unter dem Spiegel, neben einer Wasser-Spalte
            for (let k = 0; k < dim; k++) {
                for (let i = 0; i < dim; i++) {
                    if (colTop[i + k * dim] >= 0) continue; // hat Wasser
                    // ist hier unter dem Spiegel überhaupt Platz (AIR an levelJ)?
                    if (levelJ < 0 || cells[idx(i, k, levelJ)] !== STATE.AIR) continue;
                    let nbWater = false;
                    if (i + 1 < dim && colTop[i + 1 + k * dim] >= 0) nbWater = true;
                    else if (i > 0 && colTop[i - 1 + k * dim] >= 0) nbWater = true;
                    else if (k + 1 < dim && colTop[i + (k + 1) * dim] >= 0) nbWater = true;
                    else if (k > 0 && colTop[i + (k - 1) * dim] >= 0) nbWater = true;
                    if (nbWater) out.wallColsBelowLevel++;
                }
            }

            // Mesh-Inspektion: vertikale Dreiecke im Iso-Mesh.
            const mesh = s.voxelChunkWaterIso && s.voxelChunkWaterIso.get(key);
            if (mesh && mesh.geometry) {
                out.isoMeshes++;
                const g = mesh.geometry;
                const pos = g.attributes.position;
                const index = g.index;
                const triCount = index ? index.count / 3 : pos.count / 3;
                for (let t = 0; t < triCount; t++) {
                    const a = index ? index.getX(t * 3) : t * 3;
                    const b = index ? index.getX(t * 3 + 1) : t * 3 + 1;
                    const c = index ? index.getX(t * 3 + 2) : t * 3 + 2;
                    const ax = pos.getX(a),
                        ay = pos.getY(a),
                        az = pos.getZ(a);
                    const bx = pos.getX(b),
                        by = pos.getY(b),
                        bz = pos.getZ(b);
                    const cx = pos.getX(c),
                        cy = pos.getY(c),
                        cz = pos.getZ(c);
                    // Flächennormale via Kreuzprodukt
                    const ux = bx - ax,
                        uy = by - ay,
                        uz = bz - az;
                    const vx = cx - ax,
                        vy = cy - ay,
                        vz = cz - az;
                    const nx = uy * vz - uz * vy;
                    const ny = uz * vx - ux * vz;
                    const nz = ux * vy - uy * vx;
                    const len = Math.hypot(nx, ny, nz);
                    if (len < 1e-9) continue;
                    const area = 0.5 * len;
                    totArea += area;
                    out.isoTris++;
                    const nyAbs = Math.abs(ny / len);
                    if (nyAbs < 0.3) {
                        out.isoVertTris++;
                        vertArea += area;
                    }
                }
            }
        }
        out.isoVertAreaPct = totArea > 0 ? Math.round((vertArea / totArea) * 1000) / 10 : 0;
        return out;
    });

    console.log("\n========== V13.7-Diagnose: Uferlinien-Wand ==========");
    console.log(`  Chunks: ${result.chunks} gesamt · ${result.waterChunks} mit Wasser`);
    console.log(
        `  hydroBand: ${result.band ? `[${result.band.bottom.toFixed(1)} .. ${result.band.top.toFixed(1)}] = ~${result.bandCells} Zellen (von dimY=${result.dimY})` : "null (kein Band)"}`
    );
    console.log("  -- Zell-Befund (die Wurzel) --");
    console.log(`     Wasser-Spalten: ${result.waterCols.toLocaleString()}`);
    console.log(
        `     Wand-Verursacher (AIR lateral an WATER unter Spiegel): ${result.wallCells.toLocaleString()} Cells`
    );
    console.log(
        `     dry-Spalten unter dem Spiegel neben Wasser (atlas-strikt geschnitten): ${result.wallColsBelowLevel.toLocaleString()}`
    );
    console.log("  -- Mesh-Befund (das Symptom) --");
    console.log(`     Iso-Meshes: ${result.isoMeshes} · Dreiecke gesamt: ${result.isoTris.toLocaleString()}`);
    console.log(
        `     ~vertikale Dreiecke (|n.y|<0.3 = Wände): ${result.isoVertTris.toLocaleString()} = ${result.isoVertAreaPct} % der Fläche`
    );
    console.log("");
    console.log("  DEUTUNG: vertikale Iso-Fläche > ~5 % ODER wallCells/wallCols hoch");
    console.log("  → die Uferlinie ist eine Wasser-AIR-Wand an atlas-trockenen Unter-Spiegel-Spalten.");
    console.log("    Fix-Richtung: die Iso bis zum Terrain ziehen (level-basiert, terrain-geklippt),");
    console.log("    NICHT an der atlas-strikten Zell-Kante abbrechen.");

    await browser.close();
    server.close();
})();
