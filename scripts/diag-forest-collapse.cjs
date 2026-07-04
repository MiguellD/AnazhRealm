#!/usr/bin/env node
// ─────────────────────────────────────────────────────────────────────────
// diag-forest-collapse.cjs — DER WALD-KOLLAPS (V18.390, Eins W2, GPU-frei /
//   Null-Renderer). Beweist die drei gerechneten Wurzeln aus diff-A1:
//
//   (a) POISSON-SÄTTIGUNG (W2-A, diff-A1 §3a): dartsPerCell 14→36 → die Born-
//       Kandidaten/Zelle im dichten Kern (standDensity>0.72) steigen ~7 → ~15
//       (Gate ≥13 — „Sättigung braucht ~15 Kandidaten/Zelle"). EHRLICH mit-
//       gemessen: die AKZEPTIERTE Dichte (nach Kronen-Schüchternheit) ist ab
//       der Sättigung durch das prio-max-Ceiling gedeckelt (~0.8/Zelle) — der
//       Gewinn liegt in den MITTEL-dichten Zellen + der Arten-Vollständigkeit
//       (der Mammut braucht den gesättigten Kern). Plant-Zeit ≤ Baseline-
//       Parität (kalte Front, Zell-Memo trägt sie — GEMESSEN dominiert die
//       Dart-Generierung, nicht der Schüchternheits-Loop).
//   (b) VARIANTEN-KOLLAPS (W2-C, diff-A1 §5C): VARIANTS_PER_SPECIES 8→3, der
//       (hash>>>24)%N-Pick bleibt gleichverteilt (300 Region-Seeds), die
//       Vielfalt reitet pro Instanz (scale/rotationY/tint — Source-Probe).
//   (c) BÄUME GLOBAL (W2-D, diff-A1 §5D „Bäume global, Boden kacheln"): in
//       der gebauten Welt tragen die 6 Wald-Arten KEINE region-gekeyten
//       Gruppen mehr; die Baum-Gruppen-Zahl kollabiert (GEMESSEN vor W2 am
//       identischen 81-Chunk-Boot: 235 Wald-Arten-Wrapper [132 regional] →
//       Gate ≤140; Richtung ~72 = 6 Arten × 3 Varianten × 4 Leaf-Gruppen).
//       Der ECHTE Draw-Call-Proxy ist seit V18.356 die BatchedMesh-Zahl
//       (useBatchedArch default an): Baum-Batches GEMESSEN 76 → 22 (Vorlage
//       ~60 Baum-Calls) → Gate ≤30. Boden-Schichten (under/litter/rock +
//       Totholz) BLEIBEN region-gekachelt (die Cull-Rate lebt, diag-turn-cull
//       ist die Schwester-Wand — seit W2 BatchedMesh-bewusst).
//   (d) DIE ÖKOLOGIE UNBERÜHRT: diag-forest-generator läuft als Kind-Prozess
//       und muss 7/7 grün bleiben.
// ─────────────────────────────────────────────────────────────────────────
const puppeteer = require("puppeteer");
const http = require("http");
const fs = require("fs");
const path = require("path");
const { spawnSync } = require("child_process");

const root = path.resolve(__dirname, "..");
const PORT = Number(process.env.DIAG_PORT) || 4343;
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
        // Welt sync streamen (Worker aus, V18.273-Muster) + Scatter-Ticks in den Lücken.
        await page.evaluate(async () => {
            const r = window.anazhRealm;
            const old = r.state.voxelWorker;
            r.state.voxelWorker = null;
            for (let i = 0; i < 400; i++) {
                r._gameLoopTick(performance.now());
                if (i % 40 === 0) await new Promise((res) => setTimeout(res, 0));
            }
            r.state.voxelWorker = old;
        });
        out = await page.evaluate(() => {
            const r = window.anazhRealm;
            const st = r.state;
            const A = r.constructor;
            const FOREST = A.FOREST;
            const CELL = FOREST.cell;
            const o = { darts: FOREST.dartsPerCell, variants: A.VARIANTS_PER_SPECIES };
            const FOREST_SP = /^(grown_)?baum_(eiche|kiefer|birke|erle|buche|tanne)/;

            // ===== (c) HISM-GRUPPEN der GEBAUTEN Welt (VOR den Re-Plant-Experimenten) =====
            const keys = st.archInstanceGroups ? Array.from(st.archInstanceGroups.keys()) : [];
            o.groupsTotal = keys.length;
            const treeKeys = keys.filter((k) => FOREST_SP.test(k));
            o.treeGroups = treeKeys.length;
            o.treeGroupsRegional = treeKeys.filter((k) => k.includes("@")).length;
            o.treeGroupsGlobal = o.treeGroups - o.treeGroupsRegional;
            // Boden bleibt gekachelt: es EXISTIEREN weiter regionale (@-)Gruppen (Cull-Rate lebt)
            o.groundRegionalGroups = keys.filter((k) => k.includes("@") && !FOREST_SP.test(k)).length;
            // der ECHTE Draw-Call-Proxy (useBatchedArch default an): distinkte BatchedMesh je
            // Wald-Arten-Wrapper (1 Batch ≈ 1 Draw-Call) + die Gesamt-Batch-Zahl der Szene.
            const treeBatchKeys = new Set();
            for (const [k, g] of st.archInstanceGroups) {
                if (FOREST_SP.test(k) && g && g.kind === "batch" && g.batch) treeBatchKeys.add(g.batch.batchKey);
            }
            o.treeBatches = treeBatchKeys.size;
            o.batchesTotal = st.archBatches ? st.archBatches.size : 0;
            o.chunks = st.voxelChunks ? st.voxelChunks.size : 0;
            o.scatterRegions = st.scatterRegions ? st.scatterRegions.size : 0;
            // Varianten-Kollaps sichtbar an den Keys: kein grown_<wald-art>_v3+ (nur v0..v2)
            o.overVariantKeys = treeKeys.filter((k) => /_v(\d+)/.test(k) && parseInt(k.match(/_v(\d+)/)[1], 10) >= 3);

            // ===== (b) VARIANTEN: Gleichverteilung des (hash>>>24)%N über 300 Region-Seeds =====
            const N = A.VARIANTS_PER_SPECIES;
            const buckets = new Array(N).fill(0);
            const worldSeed = (st.worldMeta && st.worldMeta.seed) || "anazh-realm-seed";
            for (let i = 0; i < 300; i++) {
                const sKey = `${worldSeed}|baum_eiche|${(i % 17) - 8},${Math.floor(i / 17) - 8}`;
                let hash = 2166136261 >>> 0;
                for (let j = 0; j < sKey.length; j++) hash = ((hash ^ sKey.charCodeAt(j)) * 16777619) >>> 0;
                buckets[(hash >>> 24) % N]++;
            }
            o.variantBuckets = buckets;
            o.variantSkew = Math.max(...buckets) / Math.max(1, Math.min(...buckets));
            // die Instanz-Vielfalt trägt scale/rotationY/tint (Source-Probe an den beiden Add-Pfaden)
            const scatterSrc = r._scatterPass.toString();
            const forestSrc = r._forestPlantChunk.toString();
            o.instanceVariety =
                /tint/.test(scatterSrc) &&
                /scale: d\.s\b/.test(forestSrc) &&
                /rotationY: d\.rotY/.test(forestSrc) &&
                /entry\.rotationY/.test(r._archEntryWorldMatrix.toString());

            // ===== (a) POISSON-SÄTTIGUNG + PLANT-ZEIT (Re-Plant mit Enqueue-Stub) =====
            st._foliageDensityScale = 1;
            const origEnq = r._enqueueVegetationSpawn;
            let collected = [];
            r._enqueueVegetationSpawn = (name, pos) => {
                collected.push({ name, x: pos.x, z: pos.z });
            };
            // kalte 5×5-Front (Memo geleert) = die ehrliche Streaming-Zeit
            r._forestDartMemo = null;
            const times = [];
            for (let cx = -2; cx <= 2; cx++)
                for (let cz = -2; cz <= 2; cz++) {
                    const t0 = performance.now();
                    r._forestPlantChunk(cx, cz);
                    times.push(performance.now() - t0);
                }
            o.plantColdFirstMs = +times[0].toFixed(1);
            o.plantColdAvgMs = +(times.reduce((a, b) => a + b, 0) / times.length).toFixed(1);
            // warmer Re-Plant desselben Gebiets (Memo voll) = der Wiederkehr-Preis
            const tw0 = performance.now();
            for (let cx = -2; cx <= 2; cx++) for (let cz = -2; cz <= 2; cz++) r._forestPlantChunk(cx, cz);
            o.plantWarmAvgMs = +((performance.now() - tw0) / 25).toFixed(1);
            // volles 11×11-Gebiet: Born-Kandidaten + akzeptierte Zentren im Kern (sd>0.72)
            collected = [];
            for (let cx = -5; cx <= 5; cx++) for (let cz = -5; cz <= 5; cz++) r._forestPlantChunk(cx, cz);
            r._enqueueVegetationSpawn = origEnq;
            const trees = collected.filter((t) => t.name.indexOf("baum_") === 0);
            o.treeCount = trees.length;
            const cellTrees = new Map();
            for (const t of trees) {
                const k = Math.floor(t.x / CELL) + ":" + Math.floor(t.z / CELL);
                cellTrees.set(k, (cellTrees.get(k) || 0) + 1);
            }
            const span = r._voxelChunkConfig().span;
            const seedInt = r._forestSeedInt();
            let coreCells = 0,
                coreTrees = 0,
                coreBorn = 0;
            for (let gx = Math.floor((-5 * span) / CELL); gx < Math.floor((6 * span) / CELL); gx++) {
                for (let gz = Math.floor((-5 * span) / CELL); gz < Math.floor((6 * span) / CELL); gz++) {
                    const sd = r._forestStandDensity((gx + 0.5) * CELL, (gz + 0.5) * CELL);
                    if (sd > 0.72) {
                        coreCells++;
                        coreTrees += cellTrees.get(gx + ":" + gz) || 0;
                        coreBorn += r._forestCellDarts(gx, gz, seedInt).length;
                    }
                }
            }
            o.coreCells = coreCells;
            o.coreBornPerCell = coreCells ? +(coreBorn / coreCells).toFixed(2) : 0;
            o.coreAcceptedPerCell = coreCells ? +(coreTrees / coreCells).toFixed(2) : 0;
            // der Memo ist WIRKSAM + gebunden (Konsum-Probe, kein Passagier)
            o.memoLive = !!(r._forestDartMemo && r._forestDartMemo.size > 0);
            o.memoInSource = /_forestDartMemo/.test(r._forestCellDarts.toString());
            return o;
        });
    } catch (e) {
        out = { __err: (e && e.message) || String(e) };
    }
    await browser.close();
    server.close();

    if (!out || out.__err) {
        console.log(`⛔ Wald-Kollaps-Linse fehlgeschlagen: ${out ? out.__err : "?"}`);
        process.exit(2);
    }

    // (d) Die Ökologie-Wand als Kind-Prozess (eigener Port im Skript).
    const eco = spawnSync(process.execPath, [path.join(__dirname, "diag-forest-generator.cjs")], {
        encoding: "utf8",
        timeout: 300000,
    });
    const ecoOk = eco.status === 0 && /WALD-GENERATOR OK/.test(eco.stdout || "");
    const ecoLine = ((eco.stdout || "").match(/\d+\/\d+ Wald-Generator-Invarianten OK\./) || ["?"])[0];

    // GEMESSENE Vor-W2-Baseline (14 Darts · 8 Varianten · Bäume region-gekeyt; identischer
    // 81-Chunk-Boot am HEAD-Worktree): 235 Wald-Arten-Wrapper (132 regional) · 76 Baum-Batches
    // (258 gesamt) · Born-Kern ~7/Zelle (sd>0.6: 5.58) · Plant kalt ~79.5 ms/Chunk (ohne Memo).
    const checks = [
        {
            name: `(a1) POISSON-SÄTTIGUNG: Born-Kandidaten/Zelle im Kern sd>0.72 = ${out.coreBornPerCell} ≥13 (vorher ~7; Sättigung braucht ~15) · akzeptiert ${out.coreAcceptedPerCell}/Zelle (prio-max-Ceiling, ehrlich) · ${out.treeCount} Bäume 11×11`,
            pass: out.coreBornPerCell >= 13 && out.coreCells > 50,
        },
        {
            name: `(a2) PLANT-ZEIT hält die Baseline: kalte Front Ø ${out.plantColdAvgMs} ms/Chunk ≤120 (vor W2: ~79.5 bei 14 Darts OHNE Memo) · warm Ø ${out.plantWarmAvgMs} ms · Zell-Memo lebt (size>0: ${out.memoLive})`,
            pass: out.plantColdAvgMs <= 120 && out.plantWarmAvgMs <= 30 && out.memoLive && out.memoInSource,
        },
        {
            name: `(b1) VARIANTEN 8→3: VARIANTS_PER_SPECIES = ${out.variants} · (hash>>>24)%3 gleichverteilt über 300 Region-Seeds [${out.variantBuckets}] (max/min ${out.variantSkew.toFixed(2)} <1.5) · keine _v3+-Wald-Keys (${out.overVariantKeys.length})`,
            pass: out.variants === 3 && out.variantSkew < 1.5 && out.overVariantKeys.length === 0,
        },
        {
            name: `(b2) die Vielfalt reitet PRO INSTANZ (scale/rotationY/tint an beiden Add-Pfaden — Source-Probe)`,
            pass: out.instanceVariety === true,
        },
        {
            name: `(c1) BÄUME GLOBAL: 0 region-gekeyte Wald-Arten-Gruppen (gemessen ${out.treeGroupsRegional}; vorher 132) — die Vorlagen-Weisheit „Bäume global"`,
            pass: out.treeGroupsRegional === 0 && out.treeGroups > 0,
        },
        {
            name: `(c2) DER GRUPPEN-KOLLAPS: ${out.treeGroups} Wald-Arten-Wrapper ≤140 (vorher 235 gemessen = −${(100 - (out.treeGroups / 235) * 100).toFixed(0)} %; Richtung ~72 = 6 Arten × 3 Varianten × 4 Leaf-Gruppen) · Baum-BATCHES (Draw-Call-Proxy) ${out.treeBatches} ≤30 (vorher 76; Vorlage ~60 Baum-Calls) · Szene ${out.batchesTotal} Batches / ${out.groupsTotal} Wrapper`,
            pass: out.treeGroups <= 140 && out.treeBatches > 0 && out.treeBatches <= 30,
        },
        {
            name: `(c3) DER BODEN BLEIBT GEKACHELT: ${out.groundRegionalGroups} regionale Nicht-Wald-Gruppen (>0 — sie tragen die V18.300-Cull-Rate; diag-turn-cull ist die Schwester-Wand)`,
            pass: out.groundRegionalGroups > 0,
        },
        {
            name: `(d) DIE ÖKOLOGIE UNBERÜHRT: diag-forest-generator ${ecoLine} (Kind-Prozess exit ${eco.status})`,
            pass: ecoOk,
        },
    ];
    console.log("\n=== Der Wald-Kollaps (Eins W2: Poisson-Sättigung · Varianten 8→3 · Bäume GLOBAL) ===");
    console.log(
        `  Welt: ${out.chunks} Chunks · ${out.scatterRegions} Scatter-Regionen · darts ${out.darts} · Varianten ${out.variants}`
    );
    let fails = 0;
    for (const c of checks) {
        console.log(`  ${c.pass ? "✅" : "❌"} ${c.name}`);
        if (!c.pass) fails++;
    }
    console.log(`\n${checks.length - fails}/${checks.length} Wald-Kollaps-Invarianten OK.`);
    if (fails) {
        console.log("⛔ Der Wald-Kollaps trägt noch nicht.");
        process.exit(1);
    }
    console.log("WALD-KOLLAPS OK");
    process.exit(0);
})();
