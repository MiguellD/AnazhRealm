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
//   node scripts/diag-worker-dichte.cjs --selftest     ein verfälschter Worker-Term (die Basis-Höhe + 1 cm,
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
            // Punkten in drei Höhen über der Makro-Höhe (die Schneegrenze `schnee` des Kerns greift erst
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

// Der Selbsttest: EIN Term nur im Worker verfälscht (die Basis-Höhe, die das Gesetzbuch `hoehe` liest, um 1 cm — die Steilheit
// las es seit K16 nicht mehr, der Selbsttest war blind) — die Linse MUSS das beim Ort und Gitter nennen.
async function verfaelsche(page, an) {
    return page.evaluate(async (an) => {
        const r = window.anazhRealm;
        const s = r.state;
        if (!an) return r._voxelWorkerSyncState({ op: "state-set" });
        return new Promise((res, rej) => {
            const id = s.voxelWorkerNextRequestId++;
            s.voxelWorkerPending.set(id, { resolve: res, reject: rej });
            const delta = { baseHeight: (s.terrainBaseHeight || 0) + 0.01 };
            s.voxelWorker.postMessage({ type: "state-update", delta, requestId: id });
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
            snap.baseHeight = (snap.baseHeight || 0) + 0.01;
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
    console.log(
        "\n========= DIE GELÄNDE-LINSE — Natur-Zahlen am Gesetzbuch (Makro, 4 × 4 km innen + 2 km Rand, 30 m) ========="
    );
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
        // Das Schicht-Gesetz am Schicht-Ort auf 2-m-Raster, 600 m: das Tafelland ist ein ORT (Stil-Feld λ 5,2 km), der Kern
        // nennt ihn im Umkreis von 8 km (16 × 16 km — in 4 × 4 km fehlt er zwei von drei Welten); ohne Ort: der Ursprung.
        const ort = typeof G.schichtOrt === "function" ? G.schichtOrt(L, -8000, -8000, 8000, 8000) : null;
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
        // Der Korridor ist EINE Quelle (`urteil`/`KORRIDOR` im Kern — dieselbe Zahl-Leiste wie im Studio); die Wand verlangt
        // jedes Ziel, auch das Schicht-Gesetz (ohne Schicht-Ort: null = rot).
        const urteil = Z.urteil(st, ort ? schicht : null);
        const taeter = {
            senken: "geschlossene Mulden ohne Auslass (flaeche: ein Profil-Minimum ohne Netz-Abfluss, oder das Detail T3)",
            flint: "das Gefälle folgt dem Einzugsgebiet nicht (knotenSohle: das Bett steigt nicht mit S = ks·A^−θ je Flächen-Klasse)",
            hammond: "keine Ebenen (RELIEF_KNOTEN hoch im Tiefland, Aue F zu schmal)",
            dorfplaetze: "kein ebener Talboden (Aue F, AUE_QUER)",
            schicht: ort
                ? "die Bänder fehlen am Schicht-Ort (treppe/schichtMass: Kliff, Schutthang, Pediment)"
                : "kein Tafelland in 16 × 16 km (grossform: Stil-Feld)",
        };
        let stoer = null;
        if (SELBSTTEST) {
            const HS = H.map((h, k) => h + stoerung(-AUSSEN + (k % n) * SCHRITT, -AUSSEN + ((k / n) | 0) * SCHRITT));
            stoer = Z.statistik(HS, n, SCHRITT, L.waterLevel, benannt, RAND);
        }
        welten.push({
            saat,
            raster: { halbM: HALB, randM: RAND * SCHRITT, schrittM: SCHRITT, n },
            usJeSpalte: +us.toFixed(2),
            statistik: st,
            schichtOrt: ort ? { x: ox, z: oz, stil: ort.stil } : null,
            schicht,
            urteil,
            stoerung: stoer && { senken1mJeKm2: stoer.senken1mJeKm2, minimaJeKm2: stoer.minimaJeKm2 },
        });
        console.log(
            `\n  ${saat}: ${us.toFixed(2)} µs/Spalte · Land ${st.landKm2} km² · Senken>1m ${st.senken1mJeKm2}/km² (${st.senken1m}, benannt ${st.senkenBenannt}; Minima ${st.minimaJeKm2}/km²; Fläche>1m ${(100 * st.anteilSenkeTiefer1m).toFixed(1)} %) · θ ${st.flint.theta} R² ${st.flint.r2} (${st.flint.klassen} Klassen aus ${st.flint.zellen} Zellen; je Zelle θ ${st.flint.thetaZelle} R² ${st.flint.r2Zelle}) · Hammond sanft ${st.hammond.sanft}/${st.hammond.fenster} · Dorfplätze ${st.dorfplaetze} · Hang p50 ${st.hang.p50Prozent} % p90 ${st.hang.p90Prozent} %`
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
    if (JSON_ZIEL)
        fs.writeFileSync(
            JSON_ZIEL,
            JSON.stringify({ zweck: "K16 Gelände-Linse (Makro am Gesetzbuch)", wurzel: root, welten }, null, 1)
        );
    if (SELBSTTEST) {
        const blind = welten.some((w) => !(w.stoerung && w.stoerung.senken1mJeKm2 > 1));
        console.log(
            `\n${blind ? "⛔ SELBSTTEST ROT: die Störung blieb unentdeckt" : "✅ SELBSTTEST GRÜN: die Eier-Karton-Störung färbt die Senken rot"}\n`
        );
        return blind ? 1 : 0;
    }
    console.log(
        `\n${rot ? "⛔ GELÄNDE-LINSE ROT" : "✅ GELÄNDE-LINSE GRÜN: alle Natur-Zahlen im Korridor, drei Saaten"}\n`
    );
    return rot ? 1 : 0;
}

// ── DIE STUDIO-PROBE (K16b, `--studio`): das Gelände-Studio auf der Welt-Engine (`index.html?studio=gelaende`) trägt EINEN
// Plan in die Welt. Die Probe fährt die Bedienung wie der Gestalter — jeder Regler aus `LANDFORM_REGLER` einmal über sein
// Schieber-Element, nach jedem Griff die Zahl-Leiste (die Statistik des Kerns) und der Raster-Abdruck des Studios (ein
// Regler, der das Raster nicht ändert, ist TOT) —, exportiert den Plan (die Bytes des Downloads), legt ihn durch die
// Welt-Tür (Welt-Tor „Ersetzen" — die Tür, durch die jede Datei zur Welt wird) und misst nach dem Reload in der Welt
// denselben Makro-Abdruck (64×64, ±852 m, mit und ohne Detail) und dieselbe Statistik (`_terrainMacroSurfaceY` auf dem
// Raster des Studios). Studio = Welt byte-gleich, sonst ROT beim Namen. Der Selbsttest: das Studio rechnet den Abdruck
// eines um EINEN Schritt verstellten Plans — die Welt MUSS sich von ihm unterscheiden (die Linse sieht einen Schritt).
//   --studio [--selftest] [--json datei]
async function studioProbe() {
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
    const t0 = Date.now();
    const befunde = [];
    const out = { zweck: "K16b Studio-Probe (Gelände-Studio → Plan → Welt)", regler: [], befunde };
    console.log("\n========= DIE STUDIO-PROBE — Gelände-Studio → EIN Plan → Welt-Tür → Welt, byte-gleich =========");
    try {
        await page.goto(`http://127.0.0.1:${PORT}/index.html`, { waitUntil: "domcontentloaded", timeout: 60000 });
        await page.evaluate(() => localStorage.clear());
        await page.goto(`http://127.0.0.1:${PORT}/index.html?studio=gelaende`, {
            waitUntil: "domcontentloaded",
            timeout: 60000,
        });
        const b = await boote(page);
        if (!b.ok) throw new Error("die Welt unter dem Studio erwachte nicht in 120 s");
        console.log(`  Boot unter dem Studio: ${b.ms} ms (Seed ${b.seed})`);
        const da = await page.evaluate(async () => {
            const t = performance.now();
            while (performance.now() - t < 30000) {
                if (window.__gelaendeStudio && document.querySelector("#gelaende-studio")) return true;
                await new Promise((r) => setTimeout(r, 50));
            }
            return false;
        });
        if (!da) {
            befunde.push(
                "kein Gelände-Studio: index.html?studio=gelaende zeigt kein Panel (#gelaende-studio, window.__gelaendeStudio) — Export 0"
            );
            throw new Error("kein Studio");
        }
        const z0 = await page.evaluate(async () => {
            await window.__gelaendeStudio.ruhig();
            return window.__gelaendeStudio.zustand();
        });
        out.start = { plan: z0.plan, statistik: z0.statistik };
        console.log(
            `  Start: Saat ${z0.plan.saat} · Raster ${z0.rasterSha.slice(0, 12)} · Senken>1m ${z0.statistik.senken1mJeKm2}/km² · θ ${z0.statistik.flint.theta} · Dorfplätze ${z0.statistik.dorfplaetze}`
        );
        // JEDER REGLER EINMAL über sein Schieber-Element (der Griff des Gestalters), kumulativ: vier Schritte weg vom Standard.
        let vorher = z0.rasterSha;
        const liste = await page.evaluate(() => window.__gelaendeCore.LANDFORM_REGLER.map((r) => Object.assign({}, r)));
        out.reglerZahl = liste.length;
        for (const R of liste) {
            // der Wert auf dem Raster des Schiebers (der Browser rastet auf min + k · step, in Dezimalen)
            const wert = Number((R.def + 4 * R.step <= R.max ? R.def + 4 * R.step : R.def - 4 * R.step).toFixed(9));
            const z = await page.evaluate(
                async (id, wert) => {
                    const el = document.querySelector(`#gelaende-studio input[data-regler="${id}"]`);
                    if (!el) return { fehlt: true };
                    el.value = String(wert);
                    el.dispatchEvent(new Event("input", { bubbles: true }));
                    el.dispatchEvent(new Event("change", { bubbles: true }));
                    const t = performance.now();
                    await window.__gelaendeStudio.ruhig();
                    return Object.assign(window.__gelaendeStudio.zustand(), { ms: Math.round(performance.now() - t) });
                },
                R.id,
                wert
            );
            if (z.fehlt) {
                befunde.push(`Regler ${R.id}: kein Schieber im Panel (input[data-regler="${R.id}"])`);
                continue;
            }
            const wirkt = z.rasterSha !== vorher;
            const traegt = z.plan.regler[R.id] === wert;
            vorher = z.rasterSha;
            out.regler.push({ id: R.id, gruppe: R.gruppe, wert, wirkt, traegt, ms: z.ms, statistik: z.statistik });
            console.log(
                `    ${wirkt && traegt ? "✓" : "✗"} ${R.gruppe.padEnd(9)} ${R.id.padEnd(15)} ${String(R.def).padStart(6)} → ${String(wert).padEnd(6)} ${z.ms} ms · Senken ${z.statistik.senken1mJeKm2}/km² · θ ${z.statistik.flint.theta} R² ${z.statistik.flint.r2} · Hammond ${z.statistik.hammond.sanft} · Plätze ${z.statistik.dorfplaetze}`
            );
            if (!traegt) befunde.push(`Regler ${R.id}: der Plan trägt ${z.plan.regler[R.id]} statt ${wert}`);
            if (!wirkt) befunde.push(`Regler ${R.id}: TOT — das Raster des Studios blieb byte-gleich`);
        }
        // DER EXPORT: EIN Plan (Saat + Regler), die Bytes des Downloads.
        const studio = await page.evaluate(async () => {
            const S = window.__gelaendeStudio;
            await S.ruhig();
            const text = S.exportPlan();
            const z = S.zustand();
            const plan = JSON.parse(text);
            const schritt = Object.assign({}, plan, { regler: Object.assign({}, plan.regler) });
            const H = window.__gelaendeCore.LANDFORM_REGLER.find((r) => r.id === "hoehe");
            schritt.regler.hoehe =
                plan.regler.hoehe + H.step <= H.max ? plan.regler.hoehe + H.step : plan.regler.hoehe - H.step;
            return { text, zustand: z, shaSchritt: await S.makroShaVon(schritt) };
        });
        const plan = JSON.parse(studio.text);
        out.plan = plan;
        out.studio = {
            makroSha: studio.zustand.makroSha,
            statistik: studio.zustand.statistik,
            shaSchritt: studio.shaSchritt,
        };
        const fehlend = liste.filter((R) => typeof plan.regler[R.id] !== "number").map((R) => R.id);
        if (fehlend.length) befunde.push(`der Export trägt ${fehlend.length} Regler nicht: ${fehlend.join(", ")}`);
        console.log(
            `  Export: ${studio.text.length} Bytes · Saat ${plan.saat} · ${Object.keys(plan.regler).length} Regler · Makro ${studio.zustand.makroSha.slice(0, 16)}`
        );
        // DIE WELT-TÜR: ohne Studio, die Datei durch das Welt-Tor („Ersetzen") — die Welt erwacht neu (Reload).
        await page.goto(`http://127.0.0.1:${PORT}/index.html`, { waitUntil: "domcontentloaded", timeout: 60000 });
        const b2 = await boote(page);
        if (!b2.ok) throw new Error("die Welt vor dem Import erwachte nicht");
        const nav = page.waitForNavigation({ waitUntil: "domcontentloaded", timeout: 60000 });
        const tor = await page.evaluate((text) => {
            const r = window.anazhRealm;
            r._openWeltTorDialog(JSON.parse(text), { name: "gelaende-plan.json" });
            const p = r.state.pendingImport;
            const ok = !!(p && p.parsed && p.parsed.worldMeta);
            r._weltTorImportReplace();
            return { ok, erbgut: ok ? p.parsed.worldMeta.erbgut : null };
        }, studio.text);
        if (!tor.ok) {
            befunde.push("die Welt-Tür liest den Plan nicht (das Welt-Tor macht aus ihm keine Welt)");
            throw new Error("Tür");
        }
        await nav;
        const b3 = await boote(page);
        if (!b3.ok) throw new Error("die Welt aus dem Plan erwachte nicht");
        console.log(`  Import: Welt-Tor „Ersetzen" → Reload → Boot ${b3.ms} ms (Seed ${b3.seed})`);
        const welt = await page.evaluate(
            async (n, schritt, x0) => {
                const r = window.anazhRealm;
                r._gameLoopTick = () => {};
                const G = window.__gelaendeCore;
                const hex = async (arr) => {
                    const d = await crypto.subtle.digest(
                        "SHA-256",
                        arr.buffer.slice(arr.byteOffset, arr.byteOffset + arr.byteLength)
                    );
                    return Array.from(new Uint8Array(d))
                        .map((b) => b.toString(16).padStart(2, "0"))
                        .join("");
                };
                const h = new Float64Array(64 * 64 * 2);
                let q = 0;
                for (let j = 0; j < 64; j++)
                    for (let i = 0; i < 64; i++) {
                        h[q++] = r._terrainMacroSurfaceY(-852 + i * 27, -852 + j * 27, true);
                        h[q++] = r._terrainMacroSurfaceY(-852 + i * 27, -852 + j * 27, false);
                    }
                const H = new Float64Array(n * n);
                for (let j = 0; j < n; j++)
                    for (let i = 0; i < n; i++)
                        H[i + j * n] = r._terrainMacroSurfaceY(x0 + i * schritt, x0 + j * schritt, true);
                const L = r._gelaende();
                const st = G.statistik(
                    H,
                    n,
                    schritt,
                    L.waterLevel,
                    G.benannteSeen(L, x0, x0, schritt, n),
                    Math.round(2000 / schritt)
                );
                return { makroSha: await hex(h), statistik: st, seed: L.seed, erbgut: r._erbgut().terme[0] };
            },
            studio.zustand.raster.n,
            studio.zustand.raster.schritt,
            studio.zustand.raster.x0
        );
        out.welt = welt;
        const gleich = welt.makroSha === studio.zustand.makroSha;
        const statGleich = JSON.stringify(welt.statistik) === JSON.stringify(studio.zustand.statistik);
        console.log(
            `  Welt: Makro ${welt.makroSha.slice(0, 16)} ${gleich ? "=" : "≠"} Studio · Statistik ${statGleich ? "=" : "≠"} (Senken ${welt.statistik.senken1mJeKm2}/km² · θ ${welt.statistik.flint.theta} · Dorfplätze ${welt.statistik.dorfplaetze})`
        );
        if (welt.seed !== plan.saat) befunde.push(`die Welt trägt die Saat ${welt.seed} statt ${plan.saat}`);
        if (!gleich) befunde.push("Makro-Abdruck Welt ≠ Studio — der Plan reiste nicht bit-gleich");
        if (!statGleich) befunde.push("Statistik Welt ≠ Studio");
        if (SELBSTTEST) {
            const sieht = welt.makroSha !== studio.shaSchritt && studio.shaSchritt !== studio.zustand.makroSha;
            out.selbsttest = { sieht };
            console.log(
                `  SELBSTTEST: ein Schritt am Regler „hoehe" ${sieht ? "ändert den Abdruck (die Linse sieht ihn)" : "BLIEB UNSICHTBAR"}`
            );
            if (!sieht) befunde.push("SELBSTTEST: der Abdruck sieht einen Regler-Schritt nicht");
        }
    } catch (e) {
        if (!befunde.length) befunde.push(String((e && e.message) || e));
    }
    if (pageErr) befunde.push(`Page-Error: ${pageErr}`);
    out.sekunden = Math.round((Date.now() - t0) / 1000);
    if (JSON_AUS) fs.writeFileSync(JSON_AUS, JSON.stringify(out, null, 1));
    for (const f of befunde) console.log(`  ⛔ ${f}`);
    const tot = out.regler.filter((r) => !r.wirkt).length;
    console.log(
        `\n${befunde.length ? "⛔ STUDIO-PROBE ROT" : "✅ STUDIO-PROBE GRÜN"}: ${out.regler.length}/${out.reglerZahl || 18} Regler gegriffen, tot ${tot} · Export ${out.plan ? 1 : 0} · Welt = Studio ${out.welt && out.studio && out.welt.makroSha === out.studio.makroSha ? "byte-gleich" : "nein"} · ${out.sekunden} s\n`
    );
    await browser.close();
    server.close();
    return befunde.length ? 1 : 0;
}

(async () => {
    if (argv.includes("--realismus")) process.exit(realismus());
    if (argv.includes("--studio")) process.exit(await studioProbe());
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
                `\n  SELBSTTEST (Basis-Höhe + 1 cm nur im Worker): ${v.abweichend} abweichende Ecken in ${v.gitter} Gittern, maxDiff ${v.maxDiff}`
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
