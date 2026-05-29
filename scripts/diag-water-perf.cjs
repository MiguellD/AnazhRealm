// Diagnose V13.0 — Wasser-Profi-Bogen, die Vorher-Zahl (V9.96-Disziplin:
// messen vor schneiden, nicht spekulieren). Quantifiziert die drei im Code
// verifizierten Wurzeln der Wasser-Cell-Render-Pipeline AN ZWEI ORTEN
// (Spawn/Küste UND der höchste Bergsee — der Wasserschatten lebt an Hängen,
// nicht am flachen Ufer; eine Messung nur am Spawn würde Wurzel 2 unterschätzen):
//
//  (1) FALSCHER MESHER — `_buildVoxelChunkWaterIsoSurface` läuft die volle
//      Surface-Nets-Pipeline über das (dim+3)·dimY·(dim+3)-Zell-Grid, nur um
//      eine FLACHE Wasseroberfläche zu finden. Wir messen Wall-Time/Chunk +
//      Output-Dreiecke. Greedy-Grenzflächen-Meshing (V13.2) baut dieselbe
//      Fläche zell-getrieben in ~1 ms.
//
//  (2) FALSCHE KLASSIFIKATION — WATER bei `cy <= _waterLevelAt(x,z)`, aber
//      `_waterLevelAt` gibt den Ozean-`waterLevel` als FLACHEN Default für
//      JEDE Spalte zurück → Hang-/Hochland-Spalten unter Pegel werden WATER,
//      auch wo der Atlas (`h.water.waterKind`: 0=Land·1=Ozean·2=See) kein
//      Wasser markiert. Wir zählen WATER-Cells in Atlas-Land-Spalten = der
//      „Wasserschatten an Hängen/Strukturen".
//
//  (3) EDIT = GANZER CHUNK — informativ (V13.3-Anker): Chunk-Cells vs.
//      Edit-Sphäre-Cells (r≈3.5).
//
// Kein anazhRealm.js-Touch — reine Messung via Method-Wrapping + Cell-Scan.
const puppeteer = require("puppeteer");
const http = require("http");
const fs = require("fs");
const path = require("path");

const PORT = 4319;
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

function printPass(label, p) {
    console.log(`\n========== Messung: ${label} ==========`);
    if (p.loc) console.log(`  Ort: (${p.loc.x}, ${p.loc.z})${p.loc.note ? " — " + p.loc.note : ""}`);
    console.log(`  Chunks: ${p.totalChunks} gesamt · ${p.waterChunks} mit Wasser`);
    if (p.waterChunks === 0) {
        console.log("  !! kein Wasser-Chunk hier — Wasser-Pipeline-Messung übersprungen.");
        return;
    }
    console.log("  -- Wurzel 1: Mesher (Surface-Nets über Volumen) --");
    console.log(
        `     _buildVoxelChunkWaterIsoSurface: Median ${p.meshMsMedian} ms · Max ${p.meshMsMax} ms (${p.meshSamples.length} Chunks)`
    );
    console.log(
        `     verarbeitet ${p.gridCellsPerChunk.toLocaleString()} Grid-Cells → emittiert ~${p.trisAvg.toLocaleString()} Dreiecke/Chunk`
    );
    console.log("  -- Wurzel 2: Klassifikation (See-Dilatation/Ozean-Default = Wasserschatten) --");
    console.log(`     WATER-Cells: ${p.waterCellsTotal.toLocaleString()}`);
    console.log(
        `        exact-Atlas-Land gesamt:                 ${p.shadowCells.toLocaleString()} (${p.shadowCellPct} %)`
    );
    console.log(
        `          ├─ TIEFER Hang-Schatten (>2 Cells, der Bug): ${p.shadowCellsDeep.toLocaleString()} (${p.shadowCellDeepPct} %)`
    );
    console.log(
        `          └─ flacher Ufer-Rand (≤2 Cells, MUSS bleiben): ${p.shadowCellsRim.toLocaleString()} (${p.shadowCellRimPct} %)`
    );
    console.log(
        `        davon nicht mal im 3×3 (Phantom-Pfütze):  ${p.shadowCellsDil.toLocaleString()} (${p.shadowCellDilPct} %)`
    );
    console.log(
        `     Schatten-Spalten: ${p.shadowColumns.toLocaleString()} / ${p.waterColumns.toLocaleString()} (${p.shadowColPct} %) · davon tief: ${p.shadowColsDeep.toLocaleString()}`
    );
}

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

    // Welt + Avatar + Voxel-Chunks pumpen.
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

    // Mess-Helfer + Relokierungs-Helfer EINMAL auf window installieren.
    await page.evaluate(() => {
        const r = window.anazhRealm;

        window.__diagPump = async (ms) => {
            const start = performance.now();
            while (performance.now() - start < ms) {
                try {
                    r._gameLoopTick(performance.now());
                } catch (_e) {
                    /* listener */
                }
                await new Promise((resolve) => setTimeout(resolve, 16));
            }
        };

        // ECHTER Teleport: den Ammo-BODY versetzen (mesh.position wird vom
        // Physik-Sync jeden Frame aus dem Body überschrieben — den Mesh allein
        // zu setzen schnappt sofort zurück, headless-Teleport-Falle). Body-
        // Origin ist welt/scaleFactor; activate(true) gegen Durchfallen/Sleep.
        window.__diagMoveTo = (wx, wz, y) => {
            const sf = r.state.scaleFactor || 1;
            if (r.state.playerBody && r.state.tmpTransform && r.state.tmpVec1) {
                const t = r.state.tmpTransform;
                t.setIdentity();
                t.setOrigin(r.setVec(r.state.tmpVec1, wx / sf, y / sf, wz / sf));
                r.state.playerBody.setWorldTransform(t);
                if (r.state.tmpVec2) r.state.playerBody.setLinearVelocity(r.setVec(r.state.tmpVec2, 0, 0, 0));
                r.state.playerBody.activate(true);
            }
            r.state.playerMesh.position.set(wx, y, wz);
            if (r.state.camera) {
                r.state.camera.position.x = wx;
                r.state.camera.position.z = wz;
            }
        };

        // Atlas-Cell zu Welt-XZ. Liefert null wenn kein Atlas.
        window.__diagAtlasXZ = (idx) => {
            const h = r.state.hydrosphere;
            if (!h || !h.ready) return null;
            const ci = idx % h.dim;
            const cj = Math.floor(idx / h.dim);
            return { wx: h.originX + (ci + 0.5) * h.cell, wz: h.originZ + (cj + 0.5) * h.cell };
        };

        // Höchste See-Cell (waterKind===2, max waterY) — der steilste Bergsee,
        // wo der Ozean-Default-Bleed am Hang am sichtbarsten ist.
        window.__diagHighestLake = () => {
            const h = r.state.hydrosphere;
            if (!h || !h.ready || !h.water) return null;
            const wK = h.water.waterKind;
            const wY = h.water.waterY;
            let best = -1;
            let bestY = -Infinity;
            for (let idx = 0; idx < wK.length; idx++) {
                if (wK[idx] === 2 && wY[idx] > bestY) {
                    bestY = wY[idx];
                    best = idx;
                }
            }
            return best >= 0 ? { idx: best, level: +bestY.toFixed(1) } : null;
        };

        // Erste beliebige Wasser-Cell (Ozean bevorzugt) — falls Spawn trocken.
        window.__diagAnyWater = () => {
            const h = r.state.hydrosphere;
            if (!h || !h.ready || !h.water) return null;
            const wK = h.water.waterKind;
            const wY = h.water.waterY;
            let lake = -1;
            for (let idx = 0; idx < wK.length; idx++) {
                if (wK[idx] === 1) return { idx, kind: 1, level: +wY[idx].toFixed(1) };
                if (wK[idx] === 2 && lake < 0) lake = idx;
            }
            return lake >= 0 ? { idx: lake, kind: 2, level: +wY[lake].toFixed(1) } : null;
        };

        // Die volle Wasser-Messung am aktuellen Streaming-Ort.
        window.__diagMeasureWater = () => {
            const out = {};
            const STATE = r.constructor.CELL_STATE || { AIR: 0, WATER: 1, SOLID: 2 };
            const cfg0 = r._voxelChunkConfig(0);
            const { dim, step, span, dimY } = cfg0;
            const h = r.state.hydrosphere;
            const pp = r.state.playerMesh.position;
            out.loc = { x: +pp.x.toFixed(1), z: +pp.z.toFixed(1) };

            const waterKeys = [];
            for (const [key, e] of r.state.voxelChunks.entries()) {
                if (!e || !e.waterCells) continue;
                for (let i = 0; i < e.waterCells.length; i++) {
                    if (e.waterCells[i] === STATE.WATER) {
                        waterKeys.push(key);
                        break;
                    }
                }
            }
            out.totalChunks = r.state.voxelChunks.size;
            out.waterChunks = waterKeys.length;
            if (waterKeys.length === 0) return out;

            // Atlas-Wahrheit der Spalte. ZWEI Schwellen, weil die Wurzel im
            // Spalt zwischen ihnen lebt:
            //  - exact: waterKind GENAU an dieser Cell ∈ {Ozean,See} ODER Fluss.
            //    Eine WATER-Cell hier-NICHT = Schatten. Fängt den 16-m-See-
            //    Dilatations-Bleed an Hängen (`_waterLevelAt` hebt 3×3 um den
            //    See → Slope-Spalten kriegen den See-Spiegel → Wasser klebt am
            //    Hang). DAS ist der vom Schöpfer gesehene „Wasser an Hängen".
            //  - dilated: 3×3 (spiegelt `_waterLevelAt`) — die lockere Grenze,
            //    zählt den Dilatations-Ring als „real" (Unter-Schätzung).
            const atlasKindExact = (x, z) => {
                if (!h || !h.ready || !h.water) return -1;
                const hd = h.dim;
                const ci = Math.floor((x - h.originX) / h.cell);
                const cj = Math.floor((z - h.originZ) / h.cell);
                if (ci < 0 || cj < 0 || ci >= hd || cj >= hd) return 0;
                return h.water.waterKind[ci + cj * hd];
            };
            const inLakeDilation = (x, z) => {
                if (!h || !h.ready || !h.water) return true;
                const hd = h.dim;
                const wK = h.water.waterKind;
                const ci = Math.floor((x - h.originX) / h.cell);
                const cj = Math.floor((z - h.originZ) / h.cell);
                for (let dj = -1; dj <= 1; dj++)
                    for (let di = -1; di <= 1; di++) {
                        const ni = ci + di;
                        const nj = cj + dj;
                        if (ni < 0 || nj < 0 || ni >= hd || nj >= hd) continue;
                        const k = wK[ni + nj * hd];
                        if (k === 1 || k === 2) return true;
                    }
                return false;
            };

            let waterCellsTotal = 0;
            let shadowCellsExact = 0; // WATER wo exact-Atlas Land + kein Fluss
            let shadowCellsDil = 0; // WATER wo nicht mal im 3×3 + kein Fluss
            let waterColumns = 0;
            let shadowColumnsExact = 0;
            // V13.1-Vorbereitung: der exact-Atlas-Land-Schatten zerfällt in
            // FLACHEN Ufer-Rand (1-2 Cells tief = legitime 16-m-Quantisierungs-
            // Fransen, MUSS bleiben, sonst Mesh-Lücken am See-Rand) und TIEFEN
            // Hang-Schatten (>RIM_CELLS Cells = Wasser klebt am Hang, der echte
            // Bug). colWater (Cell-Zahl/Spalte) ≈ Wasser-Tiefe/step. RIM_CELLS=2
            // → ~3.6 m. V13.1 (Atlas-strict mit Depth-Gate) entfernt NUR den
            // tiefen Teil; der flache Rand bleibt.
            const RIM_CELLS = 2;
            let shadowCellsRim = 0;
            let shadowCellsDeep = 0;
            let shadowColsDeep = 0;
            const dimSq = dim * dim;
            for (const key of waterKeys) {
                const e = r.state.voxelChunks.get(key);
                const cells = e.waterCells;
                const comma = key.indexOf(",");
                const cx = parseInt(key.slice(0, comma), 10);
                const cz = parseInt(key.slice(comma + 1), 10);
                const ox = cx * span;
                const oz = cz * span;
                for (let k = 0; k < dim; k++) {
                    const wz = oz + (k + 0.5) * step;
                    for (let i = 0; i < dim; i++) {
                        let colWater = 0;
                        for (let j = 0; j < dimY; j++) {
                            if (cells[i + k * dim + j * dimSq] === STATE.WATER) colWater++;
                        }
                        if (colWater === 0) continue;
                        waterColumns++;
                        waterCellsTotal += colWater;
                        const wx = ox + (i + 0.5) * step;
                        const kindHere = atlasKindExact(wx, wz);
                        const river = typeof r._hydroRiverAt === "function" ? r._hydroRiverAt(wx, wz) : null;
                        const realExact = kindHere === 1 || kindHere === 2 || !!river;
                        if (!realExact) {
                            shadowCellsExact += colWater;
                            shadowColumnsExact++;
                            if (colWater <= RIM_CELLS) {
                                shadowCellsRim += colWater;
                            } else {
                                shadowCellsDeep += colWater;
                                shadowColsDeep++;
                            }
                            if (!inLakeDilation(wx, wz)) shadowCellsDil += colWater;
                        }
                    }
                }
            }
            out.waterCellsTotal = waterCellsTotal;
            out.shadowCells = shadowCellsExact;
            out.shadowCellPct = waterCellsTotal > 0 ? +((100 * shadowCellsExact) / waterCellsTotal).toFixed(1) : 0;
            out.shadowCellsDil = shadowCellsDil;
            out.shadowCellDilPct = waterCellsTotal > 0 ? +((100 * shadowCellsDil) / waterCellsTotal).toFixed(1) : 0;
            out.shadowCellsRim = shadowCellsRim;
            out.shadowCellsDeep = shadowCellsDeep;
            out.shadowCellRimPct = waterCellsTotal > 0 ? +((100 * shadowCellsRim) / waterCellsTotal).toFixed(1) : 0;
            out.shadowCellDeepPct = waterCellsTotal > 0 ? +((100 * shadowCellsDeep) / waterCellsTotal).toFixed(1) : 0;
            out.shadowColsDeep = shadowColsDeep;
            out.waterColumns = waterColumns;
            out.shadowColumns = shadowColumnsExact;
            out.shadowColPct = waterColumns > 0 ? +((100 * shadowColumnsExact) / waterColumns).toFixed(1) : 0;

            // Mesher: Wall-Time + Output-Dreiecke pro Chunk.
            const meshSamples = [];
            const gridCells = (dim + 3) * dimY * (dim + 3);
            let measured = 0;
            for (const key of waterKeys) {
                if (measured >= 8) break;
                const comma = key.indexOf(",");
                const cx = parseInt(key.slice(0, comma), 10);
                const cz = parseInt(key.slice(comma + 1), 10);
                const t = performance.now();
                const mesh = r._buildVoxelChunkWaterIsoSurface(cx, cz);
                const ms = performance.now() - t;
                let tris = 0;
                let verts = 0;
                if (mesh && mesh.geometry) {
                    const idx = mesh.geometry.index;
                    tris = idx ? idx.count / 3 : 0;
                    verts = mesh.geometry.attributes.position ? mesh.geometry.attributes.position.count : 0;
                }
                meshSamples.push({ ms: +ms.toFixed(1), tris, verts });
                measured++;
            }
            out.gridCellsPerChunk = gridCells;
            out.meshSamples = meshSamples;
            const msArr = meshSamples.map((s) => s.ms).sort((a, b) => a - b);
            out.meshMsMedian = msArr.length ? msArr[Math.floor(msArr.length / 2)] : 0;
            out.meshMsMax = msArr.length ? msArr[msArr.length - 1] : 0;
            const triArr = meshSamples.map((s) => s.tris);
            out.trisAvg = triArr.length ? Math.round(triArr.reduce((a, b) => a + b, 0) / triArr.length) : 0;
            out.wasteRatio = out.trisAvg > 0 ? Math.round(gridCells / out.trisAvg) : 0;

            // Edit-Audit (statisch).
            out.chunkCells = dim * dim * dimY;
            const cellR = 3.5 / step;
            out.editSphereCells = Math.round((4 / 3) * Math.PI * cellR * cellR * cellR);
            out.editVsChunkPct = +((100 * out.editSphereCells) / out.chunkCells).toFixed(2);
            return out;
        };
    });

    // ---- Pass A: Spawn (relokiere zu beliebigem Wasser, falls Spawn trocken) ----
    const passA = await page.evaluate(async () => {
        const probe = window.__diagMeasureWater();
        if (probe.waterChunks > 0) {
            probe.loc.note = "Spawn-Ring";
            return probe;
        }
        const any = window.__diagAnyWater();
        if (!any) {
            probe.loc.note = "kein Wasser im Atlas";
            return probe;
        }
        const xz = window.__diagAtlasXZ(any.idx);
        window.__diagMoveTo(xz.wx, xz.wz, any.level + 6);
        await window.__diagPump(18000);
        const m = window.__diagMeasureWater();
        m.loc.note = any.kind === 1 ? "Ozean (relokiert)" : "See (relokiert)";
        return m;
    });

    // ---- Pass B: höchster Bergsee (wo der Hang-Wasserschatten lebt) ----
    const passB = await page.evaluate(async () => {
        const lake = window.__diagHighestLake();
        if (!lake) return { totalChunks: 0, waterChunks: 0, loc: { x: 0, z: 0, note: "kein See im Atlas" } };
        const xz = window.__diagAtlasXZ(lake.idx);
        window.__diagMoveTo(xz.wx, xz.wz, lake.level + 8);
        await window.__diagPump(20000);
        const m = window.__diagMeasureWater();
        m.loc.note = `höchster Bergsee, Spiegel ${lake.level} m`;
        return m;
    });

    console.log("\n================ V13.0 WASSER-PROFI-DIAGNOSE (Vorher-Zahl) ================");
    printPass("A — Spawn/Küste", passA);
    printPass("B — höchster Bergsee", passB);

    // Zusammenfassung + Schnitt-Empfehlung.
    console.log("\n================ SCHLUSS: die Wurzeln in Zahlen ================");
    const all = [passA, passB].filter((p) => p.waterChunks > 0);
    if (all.length) {
        const meshMax = Math.max(...all.map((p) => p.meshMsMax));
        const shadowMax = Math.max(...all.map((p) => p.shadowCellPct));
        const shadowMin = Math.min(...all.map((p) => p.shadowCellPct));
        console.log(
            `  WURZEL 1 (Mesher):  bis ${meshMax} ms/Chunk Main-Thread-Surface-Nets — der dominante Streaming-Hitch.`
        );
        console.log(`                      → V13.2 Grenzflächen-Meshing (zell-getrieben, Greedy) zielt auf ~1 ms.`);
        console.log(`  WURZEL 2 (Schatten): ${shadowMin}–${shadowMax} % der WATER-Cells in exact-Atlas-Land-Spalten`);
        console.log(`                      (= See-Dilatations-Bleed an Hängen, der „Wasser-Schatten").`);
        console.log(`                      → V13.1 Atlas-strict (_atlasWaterLevelAt, kein 3×3-Bleed) entfernt sie.`);
        console.log(
            `  WURZEL 3 (Edit):    Edit berührt ~${all[0].editVsChunkPct} % der Chunk-Cells, baut aber 100 % neu.`
        );
        console.log(`                      → V13.3 Sub-Region-Remesh.`);
    } else {
        console.log("  Kein Wasser-Chunk an beiden Orten messbar — Atlas hat evtl. kein erreichbares Wasser.");
    }
    console.log("\n================================================================\n");
    await browser.close();
    server.close();
})();
