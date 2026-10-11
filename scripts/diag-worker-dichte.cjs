#!/usr/bin/env node
// gate:worker-dichte — DER DICHTE-SPIEGEL Main ↔ voxel-worker ist BYTE-GENAU.
//
// Der Worker baut die Dichte-Gitter der Chunks OFF-THREAD (`computeDensityGrid`, Spiegel von
// `_voxelEditedDensityGrid`); der Main baut den Spieler-Chunk und jeden Edit-Rebuild selbst. Weichen beide ab,
// lebt der Boden auf zwei Wahrheiten (Naht, Kollision gegen ein anderes Bild). Bis zu dieser Linse zitierte der
// Kommentar an `_terrainDensityAt` zwei Linsen (diag-density-refactor, diag-worker-chunk), die es nicht mehr gab —
// der Dichte-Spiegel hatte KEINE Wand (Lehre 10).
//
// Je Welt (Standard: der Boot-Seed; Bühne: spec/pruefbuehne/welt.json, importiert wie im Spiel) und je Ort (die
// Messorte des Haushalts, ein Fluss-Chunk; auf der Bühne ihre Stationen) wird das Gitter jeder LOD-Stufe 0–3 im
// Main (`_voxelEditedDensityGrid`, frischer Cache-Schlüssel) und im Worker (`density-grid`) gebaut und Wort für
// Wort (Float32-Bitmuster) verglichen — zuerst ohne Edits, dann mit zwei Kugeln am ersten Ort: einer Schnitz-Kugel
// im Oberflächen-Band und einer FÜLL-KUGEL ÜBER dem Band (der Band-Befund des Richters 09.10.: der Main legt die
// Kugel auf jede Ecke ihres Kastens, der Worker übersprang über dem Band).
//
//   node scripts/diag-worker-dichte.cjs [--welten standard,buehne] [--json datei]
//   node scripts/diag-worker-dichte.cjs --selftest     ein verfälschter Worker-Term (terrainSteepness 1 → 1,0001,
//                                                      nur im Worker) MUSS rot werden; der saubere Lauf grün
//   node scripts/diag-worker-dichte.cjs --abdruck datei [--wurzel dir]
//                                                      der BYTE-ABDRUCK beider Welten (SHA-256 je Gitter, Main UND
//                                                      Worker, und der Makro-Höhe auf einem 64×64-Gitter für drei
//                                                      Welt-Saaten und das Prüfbühnen-Erbgut) — gegen
//                                                      einen anderen Stand (`--wurzel` = sein Baum) verglichen beweist er
//                                                      „byte-gleich"
// Port: WORKER_DICHTE_PORT (Default 4392). Exit 1 bei Drift, Längen-Mismatch, Page-Error oder rotem Selbsttest.
"use strict";
const puppeteer = require("puppeteer");
const http = require("http");
const fs = require("fs");
const path = require("path");
const crypto = require("crypto");

const argv = process.argv.slice(2);
const opt = (k, d) => {
    const i = argv.indexOf(k);
    return i >= 0 && argv[i + 1] && !argv[i + 1].startsWith("--") ? argv[i + 1] : d;
};
const SELBSTTEST = argv.includes("--selftest");
const ABDRUCK = opt("--abdruck", null);
const JSON_AUS = opt("--json", null);
const PORT = Number(process.env.WORKER_DICHTE_PORT) || 4392;
const root = path.resolve(opt("--wurzel", path.resolve(__dirname, "..")));
const WELTEN = String(opt("--welten", "standard,buehne")).split(",").filter(Boolean);
const BUEHNE_DATEI = path.resolve(__dirname, "..", "spec", "pruefbuehne", "welt.json");

const mime = {
    ".html": "text/html",
    ".js": "application/javascript",
    ".mjs": "application/javascript",
    ".wasm": "application/wasm",
    ".json": "application/json",
    ".woff2": "font/woff2",
    ".css": "text/css",
    ".png": "image/png",
    ".svg": "image/svg+xml",
};
const server = http.createServer((req, res) => {
    let p = decodeURIComponent(req.url.split("?")[0]);
    if (p === "/") p = "/index.html";
    const fp = path.join(root, p);
    if (!fp.startsWith(root)) {
        res.statusCode = 403;
        return res.end();
    }
    fs.readFile(fp, (err, data) => {
        if (err) {
            res.statusCode = 404;
            return res.end();
        }
        res.setHeader("Content-Type", mime[path.extname(fp)] || "application/octet-stream");
        res.setHeader("Cache-Control", "no-store");
        res.end(data);
    });
});

// Boot bis die Welt steht und der Worker den Worldgen-Stand trägt (der Null-Renderer wie im Playtest: die Probe
// braucht keinen Render, nur Main und Worker).
async function boote(page) {
    return page.evaluate(async () => {
        const start = performance.now();
        while (performance.now() - start < 120000) {
            const r = window.anazhRealm;
            if (r && typeof r._gameLoopTick === "function") {
                try {
                    r._gameLoopTick(performance.now());
                } catch (_e) {
                    /* der Boot reift */
                }
                const s = r.state;
                if (s && s.voxelChunks && s.voxelChunks.size > 4 && s.voxelWorkerReady && s.voxelWorkerWorldgenSynced)
                    return { ok: true, ms: Math.round(performance.now() - start), seed: s.worldMeta.seed };
            }
            await new Promise((res) => setTimeout(res, 16));
        }
        return { ok: false };
    });
}

// Die Probe in der Seite: Orte × LOD 0–3, Main gegen Worker, Bitmuster je Wort.
async function probe(page, welt, mitAbdruck) {
    return page.evaluate(
        async (welt, mitAbdruck) => {
            const r = window.anazhRealm;
            const s = r.state;
            r._gameLoopTick = () => {}; // die Welt steht still: kein Stream, kein Takt zwischen Main und Worker
            const out = {
                welt,
                seed: s.worldMeta.seed,
                orte: [],
                gitter: 0,
                worte: 0,
                abweichend: 0,
                maxDiff: 0,
                befunde: [],
            };
            const hex = async (arr) => {
                const d = await crypto.subtle.digest(
                    "SHA-256",
                    arr.buffer.slice(arr.byteOffset, arr.byteOffset + arr.byteLength)
                );
                return Array.from(new Uint8Array(d))
                    .map((b) => b.toString(16).padStart(2, "0"))
                    .join("");
            };
            const warteAck = (nachricht) =>
                new Promise((res, rej) => {
                    const id = s.voxelWorkerNextRequestId++;
                    s.voxelWorkerPending.set(id, { resolve: res, reject: rej });
                    s.voxelWorker.postMessage(Object.assign({}, nachricht, { requestId: id }));
                });
            // Die Orte: Standard = die Messorte des Haushalts + ein Fluss-Chunk; Bühne = ihre Stationen.
            const orte = [];
            if (welt === "standard") {
                orte.push({ id: "wiese", x: -900, z: -850 }, { id: "genesis", x: 36, z: 0 });
                const h = s.hydrosphere;
                const fl =
                    h && Array.isArray(h.rivers) ? h.rivers.find((f) => f && f.points && f.points.length > 4) : null;
                if (fl) {
                    const p = fl.points[Math.floor(fl.points.length / 2)];
                    orte.push({ id: "fluss", x: p.x, z: p.z });
                } else out.befunde.push("kein Fluss in der Heimat-Region — der Fluss-Ort fehlt");
            } else {
                for (const st of welt.stationen || []) orte.push({ id: st.id, x: st.x, z: st.z });
            }
            const base = s.terrainBaseHeight || 0;
            const vergleiche = async (ort, lod, tag) => {
                const cfg = r._voxelChunkConfig(lod);
                const cx = Math.floor(ort.x / cfg.span);
                const cz = Math.floor(ort.z / cfg.span);
                const ox = cx * cfg.span - cfg.step;
                const oz = cz * cfg.span - cfg.step;
                const oy = base - cfg.floorDrop;
                const dX = cfg.dim + 3;
                const dY = cfg.dimY;
                const dZ = cfg.dim + 3;
                const key = `linse-dichte|${cx},${cz},${lod}|${tag}`;
                const main = r._voxelEditedDensityGrid(key, ox, oy, oz, dX, dY, dZ, cfg.step);
                s.voxelBaseDensityCache.delete(key);
                const worker = await r._voxelWorkerComputeDensity(ox, oy, oz, dX, dY, dZ, cfg.step);
                const z = { ort: ort.id, lod, tag, cx, cz, n: main.length, abweichend: 0, maxDiff: 0, erste: null };
                out.gitter++;
                if (main.length !== worker.length) {
                    z.laenge = `${main.length}≠${worker.length}`;
                    out.befunde.push(`${ort.id} L${lod} ${tag}: LÄNGE ${z.laenge}`);
                    out.abweichend++;
                    return z;
                }
                const mu = new Uint32Array(main.buffer, main.byteOffset, main.length);
                const wu = new Uint32Array(worker.buffer, worker.byteOffset, worker.length);
                const Nx = dX + 1;
                const Ny = dY + 1;
                for (let i = 0; i < mu.length; i++) {
                    out.worte++;
                    if (mu[i] === wu[i]) continue;
                    z.abweichend++;
                    const d = Math.abs(main[i] - worker[i]);
                    if (!(d <= z.maxDiff)) z.maxDiff = d;
                    if (!z.erste) {
                        const ii = i % Nx;
                        const jj = Math.floor(i / Nx) % Ny;
                        const kk = Math.floor(i / (Nx * Ny));
                        z.erste = {
                            x: +(ox + ii * cfg.step).toFixed(2),
                            y: +(oy + jj * cfg.step).toFixed(2),
                            z: +(oz + kk * cfg.step).toFixed(2),
                            main: main[i],
                            worker: worker[i],
                        };
                    }
                }
                out.abweichend += z.abweichend;
                if (!(z.maxDiff <= out.maxDiff)) out.maxDiff = z.maxDiff;
                if (mitAbdruck) {
                    z.shaMain = await hex(main);
                    z.shaWorker = await hex(worker);
                }
                return z;
            };
            // (1) ohne Edits
            const editsVorher = s.worldMeta.voxelEdits;
            s.worldMeta.voxelEdits = [];
            await r._voxelWorkerSyncState({ op: "state-set" });
            for (const ort of orte) {
                const zeilen = [];
                for (let lod = 0; lod <= 3; lod++) zeilen.push(await vergleiche(ort, lod, "rein"));
                out.orte.push({ id: ort.id, x: ort.x, z: ort.z, zeilen });
            }
            // (2) mit Edits am ersten Ort: Schnitz-Kugel im Band, Füll-Kugel ÜBER dem Band (Band-Oberkante LOD 0 =
            // Makro + 12 + 4 · 1,8 = +19,2 m; die Kugel liegt von +25 bis +35 m)
            const o0 = orte[0];
            const surf = r._terrainMacroSurfaceY(o0.x, o0.z);
            s.worldMeta.voxelEdits = [
                { x: o0.x + 3, y: surf, z: o0.z + 2, r: 4, strength: 48, mode: "carve" },
                { x: o0.x - 4, y: surf + 30, z: o0.z - 3, r: 5, strength: 48, mode: "fill" },
            ];
            await r._voxelWorkerSyncState({ op: "state-set" });
            const zeilenEdit = [];
            for (let lod = 0; lod <= 3; lod++) zeilenEdit.push(await vergleiche(o0, lod, "edits"));
            out.orte.push({ id: o0.id + "+edits", x: o0.x, z: o0.z, zeilen: zeilenEdit });
            s.worldMeta.voxelEdits = editsVorher;
            await r._voxelWorkerSyncState({ op: "state-set" });
            // Der Abdruck der Makro-Höhe (64×64, ±852 m, Schritt 27 m — ganzzahlig, f32-exakt) für den Byte-Beweis.
            const makroSha = async () => {
                const h = new Float64Array(64 * 64 * 2);
                let q = 0;
                for (let j = 0; j < 64; j++)
                    for (let i = 0; i < 64; i++) {
                        h[q++] = r._terrainMacroSurfaceY(-852 + i * 27, -852 + j * 27, true);
                        h[q++] = r._terrainMacroSurfaceY(-852 + i * 27, -852 + j * 27, false);
                    }
                return hex(h);
            };
            // DIE LESER der Formeln, die der Kern seit der Prüfung 1 trägt (K09a): die Boden-Farbe des Mains auf 32×32
            // Punkten in drei Höhen über der Makro-Höhe (die Schnee-Prominenz `y − Basis − kontinentBasis` greift erst
            // hoch), die Fels-Exposition (die Steilheit an der Makro-Höhe statt am Chunk-Cache) und die
            // Normalform des Erbguts (`erbgutNormal`); dazu die Farben, die der Worker in
            // seine Chunks legt (`attachFieldColors`, LOD 0 je Ort). Vorher = nachher beweist die Leser byte-gleich.
            const leserSha = async () => {
                const f = new Float64Array(32 * 32 * 10);
                const c = [0, 0, 0];
                const surfAlt = r._voxelSurfaceY;
                r._voxelSurfaceY = (px, pz) => r._terrainMacroSurfaceY(px, pz, true);
                let q = 0;
                try {
                    for (let j = 0; j < 32; j++)
                        for (let i = 0; i < 32; i++) {
                            const x = -852 + i * 54;
                            const z = -852 + j * 54;
                            const y = r._terrainMacroSurfaceY(x, z, true);
                            for (const dy of [0, 60, 120]) {
                                r._bodenFarbeAt(x, y + dy, z, c);
                                f[q++] = c[0];
                                f[q++] = c[1];
                                f[q++] = c[2];
                            }
                            f[q++] = r._rockExposureAt(x, z);
                        }
                } finally {
                    r._voxelSurfaceY = surfAlt;
                }
                const text = JSON.stringify({ terme: r._erbgut().terme });
                return { farbeFels: await hex(f), erbgut: await hex(new TextEncoder().encode(text)) };
            };
            const workerFarbeSha = async () => {
                const je = {};
                for (const ort of orte) {
                    const cfg = r._voxelChunkConfig(0);
                    const m = await warteAck({
                        type: "chunk-mesh",
                        cx: Math.floor(ort.x / cfg.span),
                        cz: Math.floor(ort.z / cfg.span),
                        lod: 0,
                    });
                    je[ort.id] = m.empty ? "leer" : await hex(m.colors);
                }
                return je;
            };
            if (mitAbdruck) {
                out.shaMakro = await makroSha();
                out.shaLeser = await leserSha();
                out.shaLeser.worker = await workerFarbeSha();
                // DREI WELT-SAATEN (K09a): der Boot-Seed und zwei frische Saaten in der Form `w-<12>-<6>` — je Saat die
                // chirurgische Regenesis (die Ströme; das Netz des Gesetzbuchs ist je Saat gemerkt), dann der Abdruck.
                if (welt === "standard") {
                    out.shaSaaten = { [s.worldMeta.seed]: out.shaMakro };
                    out.shaLeserSaaten = {};
                    const seedAlt = s.worldMeta.seed;
                    const macroAlt = s.worldMeta.macro;
                    const regenesis = (saat, macro) => {
                        s.worldMeta.seed = saat;
                        r._voxelNoise = null;
                        if (macro !== undefined) s.worldMeta.macro = macro;
                        else delete s.worldMeta.macro;
                    };
                    for (const saat of ["w-sweepalpha0001-aaaaaa", "w-sweepbeta00002-bbbbbb"]) {
                        regenesis(saat, undefined);
                        out.shaSaaten[saat] = await makroSha();
                        out.shaLeserSaaten[saat] = await leserSha();
                    }
                    regenesis(seedAlt, macroAlt);
                }
            }
            out.warteAck = typeof warteAck === "function";
            // Das lebende Erbgut (die Bühne MUSS ihre Terme tragen, sonst verglich die Linse eine Wildnis-Welt).
            if (typeof r._erbgut === "function") {
                const E = r._erbgut();
                out.erbgut = { terme: E.terme.map((t) => t.art), wildnis: E.wildnis, hash: E.hash };
                out.hoehen = orte.map((o) => ({ id: o.id, y: +r._terrainMacroSurfaceY(o.x, o.z).toFixed(3) }));
            }
            return out;
        },
        welt,
        mitAbdruck
    );
}

// Der Selbsttest: EIN Term nur im Worker verfälscht (terrainSteepness skaliert die ridged-Amplitude im Spiegel
// `terrainMacroSurfaceY`) — die Linse MUSS das beim Ort und Gitter nennen.
async function verfaelsche(page, an) {
    return page.evaluate(async (an) => {
        const r = window.anazhRealm;
        const s = r.state;
        if (!an) return r._voxelWorkerSyncState({ op: "state-set" });
        return new Promise((res, rej) => {
            const id = s.voxelWorkerNextRequestId++;
            s.voxelWorkerPending.set(id, { resolve: res, reject: rej });
            s.voxelWorker.postMessage({ type: "state-update", delta: { terrainSteepness: 1.0001 }, requestId: id });
        });
    }, an);
}

// Ein Lauf mit verfälschtem Worker: dieselbe Probe, nur der Worker-Zustand ist nach dem state-set verfälscht.
async function probeVerfaelscht(page) {
    // Die Probe synct den Worker vor jedem Teil neu (state-set) — darum verfälscht dieser Lauf den Spiegel in der
    // Seite: _voxelWorkerSyncState hängt die Verfälschung an jeden Snapshot.
    await page.evaluate(() => {
        const r = window.anazhRealm;
        const orig = r._voxelWorkerSnapshotState;
        r.__dichteOrig = orig;
        r._voxelWorkerSnapshotState = function () {
            const snap = orig.call(this);
            snap.terrainSteepness = 1.0001;
            return snap;
        };
    });
    await verfaelsche(page, true);
    const rep = await probe(page, "standard", false);
    await page.evaluate(() => {
        const r = window.anazhRealm;
        r._voxelWorkerSnapshotState = r.__dichteOrig;
        delete r.__dichteOrig;
    });
    await verfaelsche(page, false);
    return rep;
}

function zeige(rep) {
    console.log(`\n  Welt ${rep.welt === "standard" ? "standard" : "bühne"} (Seed ${rep.seed}):`);
    for (const o of rep.orte) {
        const teile = o.zeilen.map((z) => `L${z.lod} ${z.abweichend ? "✗" + z.abweichend : "="}`);
        console.log(`    ${o.id.padEnd(16)} (${Math.round(o.x)}|${Math.round(o.z)})  ${teile.join("  ")}`);
        for (const z of o.zeilen)
            if (z.erste)
                console.log(
                    `      ✗ L${z.lod}: ${z.abweichend} Ecken, maxDiff ${z.maxDiff} — erste bei (${z.erste.x}|${z.erste.y}|${z.erste.z}) Main ${z.erste.main} ≠ Worker ${z.erste.worker}`
                );
    }
    for (const b of rep.befunde) console.log("    •", b);
    console.log(
        `    ${rep.gitter} Gitter · ${rep.worte} Ecken · abweichend ${rep.abweichend} · maxDiff ${rep.maxDiff}`
    );
}

// ── DIE GELÄNDE-LINSE (K16, `--realismus`): die Wand der Natur-Zahlen am Gelände-Gesetzbuch — ohne Browser, das Gesetz
// selbst in Node (vendor/simplex-noise.js + gelaende-core.js in einer vm), drei Welt-Saaten, 4 × 4 km im 30-m-Raster
// (GLO-30), die Statistik ist `__gelaendeCore.statistik` (dieselbe Rechnung wie die Gegenmessung am gebauten Boden und
// die Zahl-Leiste des Studios). Die Ziele (Nordstern §4.1, Karte K16): Senken > 1 m ≤ 1/km² und < 1 % der Fläche ·
// Flint θ 0,3–0,7 bei R² ≥ 0,5 · Hammond-Ebenen vorhanden · ≥ 3 Dorfplätze · Schicht-Gesetz am Schicht-Ort (2-m-Raster):
// Kliff ≥ 60° ≥ 2 %, Schutthang 30–40° ≥ 5 %, Pediment 0,5–7° ≥ 20 %. Der Täter je Ziel steht beim Namen.
//   --realismus [--json datei] [--selftest]   Selbsttest: eine Eier-Karton-Störung (±3 m, λ 80 m) MUSS die Senken rot färben
const REALISMUS_SAATEN = ["anazh-realm-seed", "w-sweepalpha0001-aaaaaa", "w-sweepbeta00002-bbbbbb"];
function gelaendeKern(wurzel) {
    const vm = require("vm");
    const ctx = { console, Math, Float64Array, Float32Array, Int32Array, Uint8Array, Uint32Array, Map, Set, Object };
    ctx.self = ctx;
    ctx.window = ctx;
    vm.createContext(ctx);
    vm.runInContext(fs.readFileSync(path.join(wurzel, "vendor", "simplex-noise.js"), "utf8"), ctx);
    vm.runInContext(fs.readFileSync(path.join(wurzel, "gelaende-core.js"), "utf8"), ctx);
    return { G: ctx.__gelaendeCore, SimplexNoise: ctx.SimplexNoise };
}
function realismusLage(K, saat) {
    const G = K.G;
    return {
        seed: saat,
        noise: new K.SimplexNoise(saat + ":voxel"),
        baseHeight: 0,
        waterLevel: -3,
        terrainSteepness: 1,
        erbgut: { terme: G.erbgutNormal(undefined), wildnis: 1 },
        regionSize: 2048,
    };
}
function realismus() {
    // Das Gesetz kommt aus der gemessenen Wurzel (`--wurzel`: ein anderer Stand), die Linse (statistik, hangBaender)
    // immer aus DIESEM Baum — vorher und nachher misst dieselbe Rechnung.
    const K = gelaendeKern(root);
    const G = K.G;
    const Z = gelaendeKern(path.resolve(__dirname, "..")).G;
    if (typeof Z.statistik !== "function") {
        console.log("  ⛔ der Kern trägt keine Linse (statistik)");
        return 1;
    }
    const SCHRITT = 30;
    const HALB = 2000;
    // Der Rand (2 km je Seite) rechnet mit — Füllung, Abfluss und das WAHRE Einzugsgebiet der Flüsse, die ins Feld treten
    // (ohne ihn zählte Flint die Ströme ab der Feldkante); gezählt wird das innere Feld.
    const RAND = Math.round(2000 / SCHRITT);
    const AUSSEN = HALB + RAND * SCHRITT;
    const n = Math.floor((2 * AUSSEN) / SCHRITT) + 1;
    console.log("\n========= DIE GELÄNDE-LINSE — Natur-Zahlen am Gesetzbuch (Makro, 4 × 4 km innen + 2 km Rand, 30 m) =========");
    const welten = [];
    let rot = false;
    const stoerung = (x, z) => 3 * Math.sin(x / 12.7) * Math.sin(z / 12.7);
    for (const saat of REALISMUS_SAATEN) {
        const L = realismusLage(K, saat);
        const H = new Array(n * n);
        const t0 = process.hrtime.bigint();
        for (let j = 0; j < n; j++)
            for (let i = 0; i < n; i++) H[i + j * n] = G.hoehe(L, -AUSSEN + i * SCHRITT, -AUSSEN + j * SCHRITT, true);
        const us = Number(process.hrtime.bigint() - t0) / 1000 / (n * n);
        const benannt = typeof G.benannteSeen === "function" ? G.benannteSeen(L, -AUSSEN, -AUSSEN, SCHRITT, n) : [];
        const st = Z.statistik(H, n, SCHRITT, L.waterLevel, benannt, RAND);
        // Das Schicht-Gesetz am Schicht-Ort (der Kern nennt ihn; ohne Schicht-Term: der Ursprung) auf 2-m-Raster, 600 m.
        const ort = typeof G.schichtOrt === "function" ? G.schichtOrt(L, -HALB, -HALB, HALB, HALB) : null;
        const ox = ort ? ort.x : 0;
        const oz = ort ? ort.z : 0;
        const fn = 301;
        const HF = new Float64Array(fn * fn);
        // Gezählt wird im Tafelland selbst (Stil ≥ 0,8 der Großform), nicht im Wald daneben.
        const maske = new Uint8Array(fn * fn);
        for (let j = 0; j < fn; j++)
            for (let i = 0; i < fn; i++) {
                HF[i + j * fn] = G.hoehe(L, ox - 300 + i * 2, oz - 300 + j * 2, true);
                if (ort && typeof G.grossform === "function")
                    maske[i + j * fn] = G.grossform(L, ox - 300 + i * 2, oz - 300 + j * 2).stil >= 0.8 ? 1 : 0;
                else maske[i + j * fn] = 1;
            }
        const schicht = Z.hangBaender(HF, fn, 2, maske);
        const urteil = {
            senken: st.senken1mJeKm2 <= 1 && st.anteilSenkeTiefer1m < 0.01,
            flint: st.flint.theta != null && st.flint.theta >= 0.3 && st.flint.theta <= 0.7 && st.flint.r2 >= 0.5,
            hammond: st.hammond.sanft >= 1,
            dorfplaetze: st.dorfplaetze >= 3,
            schicht: !!ort && schicht.kliff >= 0.02 && schicht.schutt >= 0.05 && schicht.pediment >= 0.2,
        };
        const taeter = {
            senken: "geschlossene fBm-Mulden ohne Auslass (wildnisY: Rausch-Summe cont/ranges/ranges2/detail, kein Abfluss-Gesetz)",
            flint: "der Hang kennt kein Einzugsgebiet (kein Flussnetz; S unabhängig von A)",
            hammond: "überall dieselbe Rauheit (ridgeAmp ≥ 5 m auch im Tiefland, Detail-Oktave λ 22 m)",
            dorfplaetze: "kein ebener Talboden (keine Aue: das Tal-Querprofil fehlt außer dem EINEN Anker-Tal)",
            schicht: ort
                ? "die Bänder fehlen am Schicht-Ort"
                : "kein Schicht-Term: die Terrassen-Sperre (flat = 1 − slope/0,35, < ≈19°) verbietet das Kliff",
        };
        let stoer = null;
        if (SELBSTTEST) {
            const HS = H.map((h, k) => h + stoerung(-AUSSEN + (k % n) * SCHRITT, -AUSSEN + ((k / n) | 0) * SCHRITT));
            stoer = Z.statistik(HS, n, SCHRITT, L.waterLevel, benannt, RAND);
        }
        welten.push({ saat, raster: { halbM: HALB, randM: RAND * SCHRITT, schrittM: SCHRITT, n }, usJeSpalte: +us.toFixed(2), statistik: st, schichtOrt: ort ? { x: ox, z: oz, stil: ort.stil } : null, schicht, urteil, stoerung: stoer && { senken1mJeKm2: stoer.senken1mJeKm2, minimaJeKm2: stoer.minimaJeKm2 } });
        console.log(
            `\n  ${saat}: ${us.toFixed(2)} µs/Spalte · Land ${st.landKm2} km² · Senken>1m ${st.senken1mJeKm2}/km² (${st.senken1m}, benannt ${st.senkenBenannt}; Minima ${st.minimaJeKm2}/km²; Fläche>1m ${(100 * st.anteilSenkeTiefer1m).toFixed(1)} %) · θ ${st.flint.theta} R² ${st.flint.r2} (${st.flint.zellen} Zellen) · Hammond sanft ${st.hammond.sanft}/${st.hammond.fenster} · Dorfplätze ${st.dorfplaetze} · Hang p50 ${st.hang.p50Prozent} % p90 ${st.hang.p90Prozent} %`
        );
        console.log(
            `    Schicht-Ort ${ort ? `(${Math.round(ox)}, ${Math.round(oz)})` : "— (kein Schicht-Term)"}: Kliff≥60° ${(100 * schicht.kliff).toFixed(1)} % · Schutt 30–40° ${(100 * schicht.schutt).toFixed(1)} % (Ruhewinkel 33–37° ${(100 * schicht.ruhe).toFixed(1)} %) · Pediment 0,5–7° ${(100 * schicht.pediment).toFixed(1)} %`
        );
        for (const k of Object.keys(urteil)) {
            if (urteil[k]) continue;
            rot = true;
            console.log(`    ⛔ ${k}: ${taeter[k]}`);
        }
        if (stoer) console.log(`    Selbsttest-Störung: Senken>1m ${stoer.senken1mJeKm2}/km²`);
    }
    const JSON_ZIEL = JSON_AUS;
    if (JSON_ZIEL) fs.writeFileSync(JSON_ZIEL, JSON.stringify({ zweck: "K16 Gelände-Linse (Makro am Gesetzbuch)", wurzel: root, welten }, null, 1));
    if (SELBSTTEST) {
        const blind = welten.some((w) => !(w.stoerung && w.stoerung.senken1mJeKm2 > 1));
        console.log(
            `\n${blind ? "⛔ SELBSTTEST ROT: die Störung blieb unentdeckt" : "✅ SELBSTTEST GRÜN: die Eier-Karton-Störung färbt die Senken rot"}\n`
        );
        return blind ? 1 : 0;
    }
    console.log(`\n${rot ? "⛔ GELÄNDE-LINSE ROT" : "✅ GELÄNDE-LINSE GRÜN: alle Natur-Zahlen im Korridor, drei Saaten"}\n`);
    return rot ? 1 : 0;
}

(async () => {
    if (argv.includes("--realismus")) process.exit(realismus());
    await new Promise((r) => server.listen(PORT, r));
    const browser = await puppeteer.launch({
        headless: true,
        protocolTimeout: 900000,
        args: ["--no-sandbox", "--disable-setuid-sandbox"],
    });
    const page = await browser.newPage();
    let pageErr = null;
    page.on("pageerror", (err) => {
        pageErr = (err.stack || err.message).split("\n")[0];
        console.log("[PAGE-ERROR]", pageErr);
    });
    await page.evaluateOnNewDocument(() => {
        window.__anazhHeadlessNullRenderer = true;
    });
    const url = `http://127.0.0.1:${PORT}/index.html`;
    await page.goto(url, { waitUntil: "domcontentloaded", timeout: 60000 });
    // Frische Standard-Welt (der Boot-Seed): kein Rest einer früheren Welt im Profil.
    await page.evaluate(() => {
        try {
            localStorage.clear();
        } catch (_e) {
            /* */
        }
    });
    await page.reload({ waitUntil: "domcontentloaded", timeout: 60000 });

    console.log("\n========= DER DICHTE-SPIEGEL — Main _voxelEditedDensityGrid == Worker computeDensityGrid =========");
    const berichte = [];
    let rot = false;
    // DIE ABSENZ (plan §10 R1): der Name der Bühne steht nur in spec/ und in der Werkbank — der Stamm, der Worker und der
    // Seh-Spiegel lesen Zahlen (Terme, Wildnis-Gewicht), nie einen Namen (kein Flag unter anderem Namen).
    const NAME = /pruefbuehne|prüfbühne/i;
    for (const datei of ["anazhRealm.js", "voxel-worker.js"]) {
        const n = (fs.readFileSync(path.join(root, datei), "utf8").match(new RegExp(NAME.source, "gi")) || []).length;
        if (n) {
            console.log(`  ⛔ ABSENZ: ${datei} nennt die Bühne ${n}× (ein Flag statt der Terme)`);
            rot = true;
        }
    }
    if (SELBSTTEST && !NAME.test('if (welt.slug === "pruefbuehne") return 0;')) {
        console.log("  ⛔ ABSENZ-SELBSTTEST: der Grep sieht den Namen nicht");
        rot = true;
    }
    let selbst = null;
    for (const welt of WELTEN) {
        let weltArg = welt;
        if (welt === "buehne") {
            const json = JSON.parse(fs.readFileSync(BUEHNE_DATEI, "utf8"));
            const stationen = JSON.parse(
                fs.readFileSync(path.resolve(path.dirname(BUEHNE_DATEI), "stationen.json"), "utf8")
            ).stationen;
            // Geboren wie im Spiel: importWorldBeside (Welt-Tor) + aktiv + Reload.
            const id = await page.evaluate((json) => {
                const r = window.anazhRealm;
                const res = r.importWorldBeside(json);
                if (!res.ok) return null;
                r.activeWorldSet(res.worldId);
                return res.worldId;
            }, json);
            if (!id) throw new Error("die Bühne ließ sich nicht importieren");
            await page.reload({ waitUntil: "domcontentloaded", timeout: 60000 });
            weltArg = { stationen };
        }
        const b = await boote(page);
        if (!b.ok) {
            console.log(`  ⛔ Welt ${welt}: Boot nicht bereit nach 120 s`);
            rot = true;
            continue;
        }
        console.log(`  Boot ${welt}: ${b.ms} ms (Seed ${b.seed})`);
        const rep = await probe(page, weltArg, !!ABDRUCK);
        rep.welt = welt;
        rep.bootMs = b.ms;
        zeige(rep);
        if (rep.erbgut) {
            console.log(
                `    Erbgut: [${rep.erbgut.terme.join(", ")}] · Wildnis-Gewicht ${rep.erbgut.wildnis} · Höhen ${rep.hoehen.map((h) => h.id + " " + h.y).join(" · ")}`
            );
            if (welt === "buehne") {
                const soll = JSON.parse(fs.readFileSync(BUEHNE_DATEI, "utf8")).worldMeta.erbgut.terme.map((t) => t.art);
                if (rep.erbgut.wildnis !== 0 || rep.erbgut.terme.join() !== soll.join())
                    rep.befunde.push(`die Bühne trägt nicht ihr Erbgut (lebend [${rep.erbgut.terme}], Spec [${soll}])`);
            } else if (rep.erbgut.wildnis !== 1 || rep.erbgut.terme.join() !== "wildnis")
                rep.befunde.push(`die Standard-Welt trägt nicht [wildnis] (lebend [${rep.erbgut.terme}])`);
            if (rep.befunde.length) rot = true;
        }
        berichte.push(rep);
        if (rep.abweichend > 0 || rep.befunde.length) rot = true;
        if (SELBSTTEST && welt === "standard") {
            const v = await probeVerfaelscht(page);
            selbst = { abweichend: v.abweichend, maxDiff: v.maxDiff, gitter: v.gitter };
            console.log(
                `\n  SELBSTTEST (terrainSteepness 1 → 1,0001 nur im Worker): ${v.abweichend} abweichende Ecken in ${v.gitter} Gittern, maxDiff ${v.maxDiff}`
            );
        }
    }
    if (ABDRUCK) {
        const abdruck = {
            wurzel: root,
            seed: berichte[0] && berichte[0].seed,
            makro: berichte[0] && berichte[0].shaMakro,
            saaten: (berichte[0] && berichte[0].shaSaaten) || null,
            gitter: [],
        };
        for (const rep of berichte)
            for (const o of rep.orte || [])
                for (const z of o.zeilen)
                    abdruck.gitter.push({
                        welt: rep.welt,
                        ort: o.id,
                        lod: z.lod,
                        main: z.shaMain,
                        worker: z.shaWorker,
                    });
        // Das Prüfbühnen-Erbgut (Insel · Rampe · Bucht): seine Makro-Höhe mit demselben Abdruck.
        const bue = berichte.find((b) => b.welt === "buehne");
        abdruck.buehne = bue
            ? { seed: bue.seed, makro: bue.shaMakro, erbgut: bue.erbgut, leser: bue.shaLeser || null }
            : null;
        // Die Leser der Kern-Formeln (Boden-Farbe Main und Worker, Fels-Exposition, Erbgut-Normalform).
        abdruck.leser = (berichte[0] && berichte[0].shaLeser) || null;
        abdruck.leserSaaten = (berichte[0] && berichte[0].shaLeserSaaten) || null;
        fs.writeFileSync(ABDRUCK, JSON.stringify(abdruck, null, 1));
        console.log(
            `\n  Abdruck: ${ABDRUCK} (${abdruck.gitter.length} Gitter + Makro ${Object.keys(abdruck.saaten || {}).length} Saaten${abdruck.buehne ? " + Bühne" : ""})`
        );
    }
    if (JSON_AUS) fs.writeFileSync(JSON_AUS, JSON.stringify({ berichte, selbst }, null, 1));
    if (pageErr) rot = true;
    let pass;
    if (SELBSTTEST) {
        pass = !rot && selbst && selbst.abweichend > 0;
        console.log(
            `\n${pass ? "✅" : "⛔"} SELBSTTEST ${pass ? "GRÜN: der saubere Spiegel ist byte-gleich, der verfälschte Worker-Term fällt rot" : "ROT: " + (rot ? "der saubere Lauf ist schon rot" : "die Verfälschung blieb unentdeckt (die Linse ist blind)")}\n`
        );
    } else {
        pass = !rot && berichte.length === WELTEN.length;
        console.log(
            `\n${pass ? "✅" : "⛔"} ${pass ? "Dichte-Spiegel Main == Worker, byte-genau (maxDiff 0) in " + WELTEN.join(" + ") : "DRIFT / FEHLER"}\n`
        );
    }
    await browser.close();
    server.close();
    process.exit(pass ? 0 : 1);
})().catch((e) => {
    console.error("⛔", e && e.stack ? e.stack : e);
    process.exit(1);
});
