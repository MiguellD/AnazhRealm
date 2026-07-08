#!/usr/bin/env node
// ─────────────────────────────────────────────────────────────────────────
// diag-scatter-ab.cjs — DIE BYTE-WAND FÜR DEN SCATTER-WASSER-GATE (W3.3a, npm run gate:scatter-ab)
//
// GEMESSEN (W1-Attribution, Spieler-Region): `_isAboveWaterAt` = 74 % der
// _scatterRegion-Kosten, davon praktisch alles `_voxelSurfaceY` (302 Voll-
// Scans à ~41 µs); `_sampleBakedField` liefert dieselbe Oberfläche ~30×
// billiger. 3a ersetzt den Voll-Scan durch das Feld-Verdikt MIT konservativem
// Exakt-Fallback (Ufer-Band) — und DIESE Linse ist die Wand davor (Linse VOR
// Hebel, auch innerhalb der Welle): die eingefrorene Benchmark bewegt sich nie.
//
//   (1) KORPUS MIT ERZWUNGENEN KLASSEN (V18.346-Disziplin — sonst beweist
//       Diff=0 nur die triviale Klasse): See-Ufer- · Steilhang- · Fluss- ·
//       Spieler-Region, unabhängig vom Signal klassifiziert. Korpus ohne
//       Ufer-Klasse → exit 1 (fail-closed, kein vakuöses Grün).
//   (2) A/B BYTE-EXAKT: jede Korpus-Region einmal mit erzwungenem Exakt-Pfad
//       (`state.__scatterExactWater`, der Referenz-Hook) und einmal im
//       Produktions-Pfad gebaut → `region.cells` (cellX/cellZ/layer/species/
//       variantIndex/lod/bpName) MUSS byte-identisch sein. Diff=0 Pflicht.
//   (3) DER MESS-BOUND (die V18.319-Margin-Klasse — nie behaupten, messen):
//       max |field.height − exakte Oberfläche| über alle Korpus-Zellen +
//       der NULL-ZENSUS (exakt-null-Säule, deren Feld-Verdikt „klar über
//       Wasser" wäre — die EINE Rest-Klasse; muss 0 sein: der Bake schreibt
//       null → height 0 → unter Wasser → gleicher Skip per Konstruktion).
//   (4) SELBST-TEST: ein injiziert-falsches Wasser-Verdikt (immer-true) auf
//       der B-Seite → der Diff MUSS feuern.
// ─────────────────────────────────────────────────────────────────────────
const puppeteer = require("puppeteer");
const http = require("http");
const fs = require("fs");
const path = require("path");

const root = path.resolve(__dirname, "..");
const PORT = 4409;
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
        protocolTimeout: 300000,
        args: ["--no-sandbox", "--disable-gpu"],
    });
    const page = await browser.newPage();
    await page.evaluateOnNewDocument(() => {
        window.__anazhHeadlessNullRenderer = true;
    });
    let out = null;
    try {
        await page.goto(`http://127.0.0.1:${PORT}/index.html`, { waitUntil: "networkidle0", timeout: 120000 });
        await page.waitForFunction(() => window.anazhRealm && typeof window.anazhRealm._gameLoopTick === "function", {
            timeout: 120000,
        });
        await page.evaluate(async () => {
            const r = window.anazhRealm;
            const old = r.state.voxelWorker;
            r.state.voxelWorker = null;
            for (let i = 0; i < 150; i++) {
                r._gameLoopTick();
                await new Promise((res) => setTimeout(res, 0));
            }
            r.state.voxelWorker = old;
        });
        out = await page.evaluate(async () => {
            const r = window.anazhRealm,
                st = r.state;
            const A = window.AnazhRealm || r.constructor;
            const SC = A.SCATTER;
            const o = { corpus: [], diffs: [], bound: 0, nullCensus: 0, nullAboveCensus: 0, cellsCompared: 0 };
            const pos = st.playerMesh ? st.playerMesh.position : { x: 0, y: 0, z: 0 };
            const pRegX = Math.floor(pos.x / SC.regionM),
                pRegZ = Math.floor(pos.z / SC.regionM);
            // ── (1) KORPUS: Regionen klassifizieren (Signal-unabhängig — direkte Welt-Reads) ──
            const classify = (rx, rz) => {
                let shore = 0,
                    steep = 0,
                    river = 0,
                    nulls = 0,
                    probes = 0;
                for (let gz = 8; gz < SC.regionM; gz += 16) {
                    for (let gx = 8; gx < SC.regionM; gx += 16) {
                        const x = rx * SC.regionM + gx,
                            z = rz * SC.regionM + gz;
                        const sy = r._voxelSurfaceY(x, z);
                        const wy = r._waterLevelAt(x, z);
                        probes++;
                        if (sy === null || !Number.isFinite(sy)) {
                            nulls++;
                            continue;
                        }
                        if (Math.abs(sy - (wy + 0.4)) < 3) shore++;
                        const sl = r._slopeAt ? r._slopeAt(x, z) : 0;
                        if (sl > 1.2) steep++;
                        if (typeof r._hydroRiverAt === "function") {
                            const rv = r._hydroRiverAt(x, z);
                            if (rv && (rv.strength > 0.3 || rv.centerness > 0.3)) river++;
                        }
                    }
                }
                return { shore, steep, river, nulls, probes };
            };
            const candidates = [];
            for (let dz = -2; dz <= 2; dz++)
                for (let dx = -2; dx <= 2; dx++)
                    candidates.push({ rx: pRegX + dx, rz: pRegZ + dz, d: Math.abs(dx) + Math.abs(dz) });
            candidates.sort((a, b) => a.d - b.d);
            const corpus = [];
            let haveShore = 0,
                haveSteep = 0,
                haveRiver = 0;
            for (const c of candidates) {
                if (corpus.length >= 6) break;
                const cl = classify(c.rx, c.rz);
                const isShore = cl.shore >= 8,
                    isSteep = cl.steep >= 20,
                    isRiver = cl.river >= 4;
                const want =
                    corpus.length < 1 ||
                    (isShore && haveShore < 2) ||
                    (isSteep && haveSteep < 1) ||
                    (isRiver && haveRiver < 1);
                if (want) {
                    corpus.push({ rx: c.rx, rz: c.rz, cl });
                    if (isShore) haveShore++;
                    if (isSteep) haveSteep++;
                    if (isRiver) haveRiver++;
                }
            }
            o.corpus = corpus.map((c) => ({ rx: c.rx, rz: c.rz, ...c.cl }));
            o.classes = { shore: haveShore, steep: haveSteep, river: haveRiver };
            // ── (3) MESS-BOUND + NULL-ZENSUS über die Korpus-Zellen (rock-Raster 2.6 m ist
            // das dichteste — 4 m-Raster deckt die Klasse, hält die Linse < 60 s) ──
            for (const c of corpus) {
                for (let gz = 2; gz < SC.regionM; gz += 4) {
                    for (let gx = 2; gx < SC.regionM; gx += 4) {
                        const x = c.rx * SC.regionM + gx,
                            z = c.rz * SC.regionM + gz;
                        const field = r._sampleBakedField(x, z);
                        if (!field) continue;
                        const sy = r._voxelSurfaceY(x, z);
                        const wy = r._waterLevelAt(x, z);
                        o.cellsCompared++;
                        if (sy === null || !Number.isFinite(sy)) {
                            o.nullCensus++;
                            // die EINE Rest-Klasse: exakt-null, aber das Feld läge KLAR über Wasser
                            if (field.height > wy + 0.4 + 3) o.nullAboveCensus++;
                            continue;
                        }
                        const d = Math.abs(field.height - sy);
                        if (d > o.bound) o.bound = d;
                    }
                }
            }
            o.bound = +o.bound.toFixed(2);
            // ── (2) A/B BYTE-EXAKT je Korpus-Region (Referenz-Hook vs Produktion) ──
            const snapshot = (reg) =>
                JSON.stringify(
                    (reg && reg.cells ? reg.cells : []).map((cell) => [
                        cell.cellX,
                        cell.cellZ,
                        cell.layer,
                        cell.species,
                        cell.variantIndex,
                        cell.lod,
                        cell.bpName,
                    ])
                );
            // Bau-Position: Region-Ecke (deterministisch; alle Zellen in [innerM..outerM] bis
            // auf die 64-m-Ecke — identisch für A und B, nur GLEICHHEIT zählt)
            const buildAt = (c, exact) => {
                const key = `${c.rx},${c.rz}`;
                const bp = { x: c.rx * SC.regionM - 20, y: 0, z: c.rz * SC.regionM - 20 };
                if (st.scatterRegions && st.scatterRegions.has(key)) r._disposeScatterRegion(key);
                st.__scatterExactWater = exact === true;
                const reg = r._scatterRegion(c.rx, c.rz, bp);
                st.__scatterExactWater = false;
                const snap = snapshot(reg);
                r._disposeScatterRegion(key);
                return snap;
            };
            for (const c of corpus) {
                const a = buildAt(c, true); // Referenz: der EXAKTE Wasser-Pfad (Hook)
                const b = buildAt(c, false); // Produktion (vor 3a identisch; nach 3a feld-first)
                const cellsA = JSON.parse(a).length;
                if (a !== b) o.diffs.push({ rx: c.rx, rz: c.rz, cellsA, cellsB: JSON.parse(b).length });
                else o.diffs.push({ rx: c.rx, rz: c.rz, cellsA, identical: true });
            }
            o.abIdentical = o.diffs.every((d) => d.identical === true);
            o.totalCells = o.diffs.reduce((s2, d) => s2 + (d.cellsA || 0), 0);
            // ── (4) SELBST-TEST: injiziert-falsches Verdikt → der Diff MUSS feuern ──
            {
                const c = corpus.find((cc) => cc.cl.shore >= 8) || corpus[0];
                const a = buildAt(c, true);
                const orig = r._isAboveWaterAt;
                r._isAboveWaterAt = () => true; // die Störung: Wasser existiert nicht mehr
                const bad = buildAt(c, false);
                r._isAboveWaterAt = orig;
                o.selftestFires = a !== bad;
                o.selftestRegion = { rx: c.rx, rz: c.rz, shore: c.cl.shore };
            }
            return o;
        });
    } catch (e) {
        out = { __err: (e && e.message) || String(e) };
    }
    await browser.close();
    server.close();

    if (!out || out.__err) {
        console.log(`⛔ Scatter-A/B-Linse fehlgeschlagen: ${out ? out.__err : "?"}`);
        process.exit(2);
    }
    console.log("\n=== SCATTER-WASSER-GATE A/B (die Byte-Wand der eingefrorenen Benchmark) ===");
    console.log(
        `  Korpus: ${out.corpus.length} Regionen · Klassen shore=${out.classes.shore} steep=${out.classes.steep} river=${out.classes.river}`
    );
    for (const c of out.corpus)
        console.log(
            `    (${c.rx},${c.rz})  shore ${c.shore} · steep ${c.steep} · river ${c.river} · null ${c.nulls}/${c.probes}`
        );
    console.log(`  Mess-Bound max|field.height − exakt|: ${out.bound} m über ${out.cellsCompared} Zellen`);
    console.log(
        `  Null-Zensus: ${out.nullCensus} exakt-null-Säulen · davon feld-„klar über Wasser": ${out.nullAboveCensus}`
    );
    const checks = [
        {
            name: `KORPUS trägt die Ufer-Klasse (shore-Regionen ${out.classes.shore} ≥ 1) — sonst misst Diff=0 nur die triviale Klasse`,
            pass: out.classes.shore >= 1,
        },
        {
            name: `A/B BYTE-IDENTISCH über alle ${out.corpus.length} Regionen (${out.totalCells} Zellen) — die Benchmark bewegt sich nie`,
            pass: out.abIdentical === true,
        },
        {
            name: `NULL-ZENSUS der Rest-Klasse = 0 (exakt-null + feld-klar-über — die einzige konstruktive Lücke)`,
            pass: out.nullAboveCensus === 0,
        },
        {
            name: "SELBST-TEST: ein injiziert-falsches Wasser-Verdikt macht den Diff rot (die Wand feuert)",
            pass: out.selftestFires === true,
        },
    ];
    let fails = 0;
    for (const c of checks) {
        console.log(`  ${c.pass ? "✅" : "❌"} ${c.name}`);
        if (!c.pass) fails++;
    }
    if (!out.abIdentical)
        for (const d of out.diffs)
            if (!d.identical) console.log(`    DIFF (${d.rx},${d.rz}): A ${d.cellsA} vs B ${d.cellsB} Zellen`);
    console.log(`\n${checks.length - fails}/${checks.length} A/B-Invarianten OK.`);
    if (fails) {
        console.log("⛔ Der Wasser-Gate-Umbau würde die eingefrorene Benchmark bewegen — NICHT mergen.");
        process.exit(1);
    }
    console.log(`✅ Byte-Wand steht (Bound ${out.bound} m — das Produktions-Band MUSS deutlich darüber liegen).`);
    process.exit(0);
})();
