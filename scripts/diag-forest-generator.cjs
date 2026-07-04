#!/usr/bin/env node
// ─────────────────────────────────────────────────────────────────────────
// diag-forest-generator.cjs — DER WALD-GENERATOR (V18.389, DAS NEUE KLEID P1,
//   GPU-frei / Null-Renderer)
//
// Die phytogenesis-`plantForest`-Ökologie (worlds/terrain/phytogenesis.js Z.1370-
// 1470) auf AnazhRealms Voxel-Saat, ÜBERSETZT: variabel-radius Poisson-Disc mit
// Kronen-Schüchternheit + Arten-Nische + reverse-J-Größe + bimodaler Dichte-Gradient
// + per-Instanz-Varianten, ZELL-DETERMINISTISCH (Chunk A→B == B→A). Diese Linse
// beweist headless mit ZAHLEN:
//   (a) DICHTE-GRADIENT: standDensity-Hoch trägt VIEL mehr Bäume als -Tief.
//   (b) ARTEN-MIX: ≥4 Baumarten nach Nische (Klima/Patch/Feuchte/Höhe).
//   (c) VARIANTEN: verschiedene Seeds → verschiedene Geometrie (gratis) + Größen-Spread.
//   (d) DETERMINISMUS: Chunks A,B geplanzt == B,A geplanzt (reihenfolge-unabhängig).
//   (e) KRONEN-SCHÜCHTERNHEIT: kein Paar Zentren < PACK·(Ti+Tj) (Lichtkonkurrenz).
//   (f) HEADLESS = VOLL + PERF-KAPPUNG: Null-Renderer → voll; scale 0.4 → weniger.
// ─────────────────────────────────────────────────────────────────────────
const puppeteer = require("puppeteer");
const http = require("http");
const fs = require("fs");
const path = require("path");

const root = path.resolve(__dirname, "..");
const PORT = 4341;
const mime = {
    ".html": "text/html",
    ".js": "application/javascript",
    ".wasm": "application/wasm",
    ".json": "application/json",
    ".css": "text/css",
    ".woff2": "font/woff2",
    ".png": "image/png",
};
const server = http.createServer((req, res) => {
    let p = req.url.split("?")[0];
    if (p === "/") p = "/index.html";
    const fp = path.join(root, p);
    if (!fp.startsWith(root)) return ((res.statusCode = 403), res.end());
    fs.readFile(fp, (err, data) => {
        if (err) return ((res.statusCode = 404), res.end());
        res.setHeader("Content-Type", mime[path.extname(fp)] || "application/octet-stream");
        res.end(data);
    });
});

(async () => {
    await new Promise((r) => server.listen(PORT, r));
    const browser = await puppeteer.launch({
        headless: "new",
        args: ["--no-sandbox", "--disable-gpu"],
        protocolTimeout: 240000,
    });
    const page = await browser.newPage();
    await page.evaluateOnNewDocument(() => {
        window.__anazhHeadlessNullRenderer = true;
    });
    let out = null;
    try {
        await page.goto(`http://127.0.0.1:${PORT}/index.html`, { waitUntil: "networkidle0", timeout: 60000 });
        await page.waitForFunction(() => window.anazhRealm && typeof window.anazhRealm._gameLoopTick === "function", {
            timeout: 60000,
        });
        await page.evaluate(async () => {
            const r = window.anazhRealm;
            const old = r.state.voxelWorker;
            r.state.voxelWorker = null;
            for (let i = 0; i < 40; i++) {
                r._gameLoopTick();
                await new Promise((res) => setTimeout(res, 0));
            }
            r.state.voxelWorker = old;
        });
        out = await page.evaluate(() => {
            const r = window.anazhRealm;
            const st = r.state;
            const FOREST = r.constructor.FOREST;
            const CELL = FOREST.cell;
            const o = { hasFn: typeof r._forestPlantChunk === "function", cell: CELL };

            // --- Spawn-Kollektor: den Enqueue abfangen, statt echte Meshes zu bauen ---
            const origEnq = r._enqueueVegetationSpawn;
            let collected = [];
            r._enqueueVegetationSpawn = (name, pos, opts) => {
                collected.push({ name, x: pos.x, z: pos.z, scale: (opts && opts.scale) || 1, seed: opts && opts.seed });
            };
            const plantRegion = (cxs) => {
                collected = [];
                for (const [cx, cz] of cxs) r._forestPlantChunk(cx, cz);
                return collected.slice();
            };
            const isTree = (n) => typeof n === "string" && n.indexOf("baum_") === 0;

            // -- (e-Quelle) WIRING/KONSUM: die EINE Wald-Quelle wird gerufen --
            const src = (fn) => (typeof fn === "function" ? fn.toString() : "");
            o.populateCallsForest = /_forestPlantChunk/.test(src(r._populateVoxelChunkVegetation));
            // Der Baum-Spawn-Pfad ist aus `_vegetationSampleSpawn` verschwunden (der
            // Scatter-Cell-Zähler `_scatterIncrementCounter` lebte NUR im alten Baum-
            // Zweig) → die Bäume kommen jetzt EINZIG aus dem Wald-Generator (EINE Quelle).
            const vegSrc = src(r._vegetationSampleSpawn);
            o.sampleTreeDelegated = /if \(isTree\)/.test(vegSrc) && !/_scatterIncrementCounter/.test(vegSrc);
            o.cellDartsPure = typeof r._forestCellDarts === "function" && typeof r._forestStandDensity === "function";

            // ===== großes Planzgebiet (11×11 Chunks ≈ 475 m) =====
            st._foliageDensityScale = 1;
            const grid = [];
            for (let cx = -5; cx <= 5; cx++) for (let cz = -5; cz <= 5; cz++) grid.push([cx, cz]);
            const all = plantRegion(grid);
            const trees = all.filter((t) => isTree(t.name));
            o.total = all.length;
            o.treeCount = trees.length;
            o.snagCount = all.filter((t) => t.name === "stamm_gefallen").length;

            // -- (a) DICHTE-GRADIENT: Bäume/Zelle in standDensity-Hoch ≫ -Tief --
            // Gebiet in CELL-Zellen rastern, sd am Zentrum, Bäume je Kategorie zählen +
            // durch Zell-Zahl normieren (Fläche) → echte Dichte, nicht bloße Rohzahl.
            const cellTrees = new Map();
            const ckey = (gx, gz) => gx + ":" + gz;
            for (const t of trees) {
                const gx = Math.floor(t.x / CELL),
                    gz = Math.floor(t.z / CELL);
                const k = ckey(gx, gz);
                cellTrees.set(k, (cellTrees.get(k) || 0) + 1);
            }
            let coreCells = 0,
                gapCells = 0,
                coreTrees = 0,
                gapTrees = 0,
                sdSum = 0,
                sdN = 0;
            const gminX = -5 * r._voxelChunkConfig().span,
                gmaxX = 6 * r._voxelChunkConfig().span;
            for (let gx = Math.floor(gminX / CELL); gx < Math.floor(gmaxX / CELL); gx++) {
                for (let gz = Math.floor(gminX / CELL); gz < Math.floor(gmaxX / CELL); gz++) {
                    const cxm = (gx + 0.5) * CELL,
                        czm = (gz + 0.5) * CELL;
                    const sd = r._forestStandDensity(cxm, czm);
                    sdSum += sd;
                    sdN++;
                    const n = cellTrees.get(ckey(gx, gz)) || 0;
                    if (sd > 0.6) {
                        coreCells++;
                        coreTrees += n;
                    } else if (sd < 0.25) {
                        gapCells++;
                        gapTrees += n;
                    }
                }
            }
            o.coreDensity = coreCells ? +(coreTrees / coreCells).toFixed(3) : 0;
            o.gapDensity = gapCells ? +(gapTrees / gapCells).toFixed(3) : 0;
            o.coreCells = coreCells;
            o.gapCells = gapCells;
            // mittlere standDensity an den Baum-Positionen vs. am ganzen Gebiet
            let treeSd = 0;
            for (const t of trees) treeSd += r._forestStandDensity(t.x, t.z);
            o.meanSdTrees = trees.length ? +(treeSd / trees.length).toFixed(3) : 0;
            o.meanSdArea = sdN ? +(sdSum / sdN).toFixed(3) : 0;
            // BORN-Dichte-Gradient (VOR der Kronen-Schüchternheit): der ROHE Ökologie-
            // Antrieb (bimodaler standDensity-Wurf). Die Schüchternheit KOMPRIMIERT die
            // akzeptierte Dichte (Kern sättigt am Kronen-Limit) → der Born-Gradient zeigt
            // den ungedämpften Antrieb, der akzeptierte den sichtbaren Wald.
            const seedInt = r._forestSeedInt();
            let coreBorn = 0,
                coreBornCells = 0,
                gapBorn = 0,
                gapBornCells = 0;
            for (let gx = Math.floor(gminX / CELL); gx < Math.floor(gmaxX / CELL); gx += 2) {
                for (let gz = Math.floor(gminX / CELL); gz < Math.floor(gmaxX / CELL); gz += 2) {
                    const sd = r._forestStandDensity((gx + 0.5) * CELL, (gz + 0.5) * CELL);
                    if (sd > 0.6) {
                        coreBorn += r._forestCellDarts(gx, gz, seedInt).length;
                        coreBornCells++;
                    } else if (sd < 0.25) {
                        gapBorn += r._forestCellDarts(gx, gz, seedInt).length;
                        gapBornCells++;
                    }
                }
            }
            o.coreBorn = coreBornCells ? +(coreBorn / coreBornCells).toFixed(3) : 0;
            o.gapBorn = gapBornCells ? +(gapBorn / gapBornCells).toFixed(3) : 0;
            o.bornRatio = o.gapBorn > 0 ? +(o.coreBorn / o.gapBorn).toFixed(2) : Infinity;
            // Gradient ist echt, wenn (i) der ROHE Antrieb Kern ≫ Lichtung (>4×) UND
            // (ii) die sichtbare akzeptierte Dichte im Kern klar über der Lichtung liegt
            // (>1.7×, die Kronen-Schüchternheit komprimiert den 10:1-Antrieb auf ~2:1).
            o.gradientOk =
                o.bornRatio > 4 &&
                o.coreDensity > o.gapDensity * 1.7 &&
                o.coreDensity > 0.3 &&
                o.meanSdTrees > o.meanSdArea + 0.06;

            // -- (b) ARTEN-MIX ≥4 nach Nische --
            const spCount = {};
            for (const t of trees) spCount[t.name] = (spCount[t.name] || 0) + 1;
            o.species = spCount;
            o.speciesN = Object.keys(spCount).length;
            o.speciesOk = o.speciesN >= 4;

            // -- (c) VARIANTEN: verschiedene Seeds → verschiedene Geometrie (gratis) --
            const v3sum = (v) => {
                if (!v) return 0;
                if (Array.isArray(v)) return (v[0] || 0) + (v[1] || 0) + (v[2] || 0);
                return (v.x || 0) + (v.y || 0) + (v.z || 0);
            };
            const geomSig = (parts) => {
                if (!Array.isArray(parts)) return null;
                let s = parts.length + "|";
                for (const p of parts) {
                    const pos = p.position || p.pos;
                    const sz = p.size || p.dims;
                    s += v3sum(pos).toFixed(3) + "," + v3sum(sz).toFixed(3) + ";";
                }
                return s;
            };
            const gA1 = geomSig(r._growTreeBlueprint("baum_eiche", 111));
            const gA2 = geomSig(r._growTreeBlueprint("baum_eiche", 111)); // gleicher Seed → gleich (Determinismus)
            const gB = geomSig(r._growTreeBlueprint("baum_eiche", 90210)); // anderer Seed → anders
            o.growSameSeed = gA1 !== null && gA1 === gA2;
            o.growDiffSeed = gA1 !== null && gB !== null && gA1 !== gB;
            // Größen-Spread der platzierten Bäume (reverse-J: viele kleine, wenige große)
            let sMin = Infinity,
                sMax = -Infinity,
                sSum = 0;
            for (const t of trees) {
                if (t.scale < sMin) sMin = t.scale;
                if (t.scale > sMax) sMax = t.scale;
                sSum += t.scale;
            }
            o.scaleMin = +sMin.toFixed(3);
            o.scaleMax = +sMax.toFixed(3);
            o.scaleMean = trees.length ? +(sSum / trees.length).toFixed(3) : 0;
            // reverse-J: der Mittelwert liegt DEUTLICH unter der Mitte des Bereichs (mehr kleine)
            o.reverseJ = trees.length > 0 && sMax - sMin > 0.6 && o.scaleMean < (sMin + sMax) / 2;
            o.variantsOk = o.growSameSeed && o.growDiffSeed && o.reverseJ;

            // -- (d) DETERMINISMUS: A,B == B,A (reihenfolge-unabhängig) --
            const sig = (arr) =>
                arr
                    .filter((t) => isTree(t.name))
                    .map((t) => t.name + "@" + t.x.toFixed(3) + "," + t.z.toFixed(3) + "×" + t.scale.toFixed(3))
                    .sort()
                    .join("|");
            const ab = sig(
                plantRegion([
                    [0, 0],
                    [1, 0],
                    [0, 1],
                    [1, 1],
                ])
            );
            const ba = sig(
                plantRegion([
                    [1, 1],
                    [0, 1],
                    [1, 0],
                    [0, 0],
                ])
            );
            o.deterministic = ab.length > 0 && ab === ba;
            o.detTreesAB = ab.split("|").filter(Boolean).length;

            // -- (e) KRONEN-SCHÜCHTERNHEIT: kein Paar akzeptierter Zentren < PACK·(Ti+Tj)
            // (nur Paare, die einander in der ±2-Zell-Nachbarschaft „sehen") --
            const cellMap = new Map();
            const treeT = trees.map((t) => {
                const cr = FOREST.crown[t.name] || 0;
                return { x: t.x, z: t.z, T: cr * t.scale };
            });
            treeT.forEach((t, idx) => {
                const gx = Math.floor(t.x / CELL),
                    gz = Math.floor(t.z / CELL);
                const k = ckey(gx, gz);
                let a = cellMap.get(k);
                if (!a) cellMap.set(k, (a = []));
                a.push(idx);
            });
            let violations = 0,
                pairsChecked = 0;
            for (let idx = 0; idx < treeT.length; idx++) {
                const t = treeT[idx];
                const gx = Math.floor(t.x / CELL),
                    gz = Math.floor(t.z / CELL);
                for (let ax = -2; ax <= 2; ax++)
                    for (let az = -2; az <= 2; az++) {
                        const a = cellMap.get(ckey(gx + ax, gz + az));
                        if (!a) continue;
                        for (const jdx of a) {
                            if (jdx <= idx) continue; // jedes Paar einmal
                            const u = treeT[jdx];
                            pairsChecked++;
                            const dx = t.x - u.x,
                                dz = t.z - u.z;
                            const md = FOREST.pack * (t.T + u.T);
                            if (dx * dx + dz * dz < md * md) violations++;
                        }
                    }
            }
            o.shyViolations = violations;
            o.shyPairs = pairsChecked;
            o.shynessOk = trees.length > 50 && violations === 0;

            // -- (f) HEADLESS = VOLL + PERF-KAPPUNG --
            o.headlessNull = !!(st.renderer && st.renderer._isHeadlessNull);
            o.headlessFull = st._foliageDensityScale === 1;
            const fullN = trees.length;
            st._foliageDensityScale = 0.4;
            const scaledTrees = plantRegion(grid).filter((t) => isTree(t.name)).length;
            st._foliageDensityScale = 1;
            o.fullN = fullN;
            o.scaledN = scaledTrees;
            // Kappung: ~40 % bleiben (deterministischer keepRoll); klar weniger, nicht 0.
            o.cappingOk = scaledTrees < fullN * 0.75 && scaledTrees > fullN * 0.15;

            r._enqueueVegetationSpawn = origEnq;
            return o;
        });
    } catch (e) {
        out = { __err: (e && e.message) || String(e) };
    }
    await browser.close();
    server.close();

    if (!out || out.__err) {
        console.log(`⛔ Wald-Generator-Linse fehlgeschlagen: ${out ? out.__err : "?"}`);
        process.exit(2);
    }

    const checks = [
        {
            name: `WIRING: _populateVoxelChunkVegetation ruft _forestPlantChunk + Baum-Sample-Zweig delegiert (return 0)`,
            pass: out.hasFn && out.populateCallsForest && out.sampleTreeDelegated && out.cellDartsPure,
        },
        {
            name: `(a) DICHTE-GRADIENT: Born-Antrieb Kern ${out.coreBorn}≫Lichtung ${out.gapBorn} (${out.bornRatio}×) → sichtbar Kern ${out.coreDensity}≫${out.gapDensity} Bäume/Zelle (meanSd Baum ${out.meanSdTrees}>${out.meanSdArea})`,
            pass: out.gradientOk,
        },
        {
            name: `(b) ARTEN-MIX ≥4 nach Nische (${out.speciesN}: ${Object.keys(out.species).join(", ")})`,
            pass: out.speciesOk,
        },
        {
            name: `(c) VARIANTEN: gleicher Seed=gleich·anderer Seed=anders + reverse-J-Größe (${out.scaleMin}…${out.scaleMax}, Ø ${out.scaleMean})`,
            pass: out.variantsOk,
        },
        {
            name: `(d) DETERMINISMUS: Chunks A,B == B,A (${out.detTreesAB} Bäume, reihenfolge-identisch)`,
            pass: out.deterministic,
        },
        {
            name: `(e) KRONEN-SCHÜCHTERNHEIT: 0 Konflikte < PACK·(Ti+Tj) (${out.shyViolations}/${out.shyPairs} Paare, ${out.treeCount} Bäume)`,
            pass: out.shynessOk,
        },
        {
            name: `(f) HEADLESS = VOLL + PERF-KAPPUNG (voll ${out.fullN} → scale 0.4 → ${out.scaledN}; Null-Renderer, _foliageDensityScale=1)`,
            pass: out.headlessNull && out.headlessFull && out.cappingOk,
        },
    ];
    console.log("\n=== Der Wald-Generator (plantForest-Ökologie chunk-deterministisch auf Voxel) ===");
    console.log(
        `  Gebiet 11×11 Chunks: ${out.treeCount} Bäume + ${out.snagCount} Totholz · Arten ${JSON.stringify(out.species)}`
    );
    let fails = 0;
    for (const c of checks) {
        console.log(`  ${c.pass ? "✅" : "❌"} ${c.name}`);
        if (!c.pass) fails++;
    }
    console.log(`\n${checks.length - fails}/${checks.length} Wald-Generator-Invarianten OK.`);
    if (fails) {
        console.log("⛔ Der Wald-Generator trägt die Vorlagen-Ökologie noch nicht.");
        process.exit(1);
    }
    console.log("WALD-GENERATOR OK");
    process.exit(0);
})();
