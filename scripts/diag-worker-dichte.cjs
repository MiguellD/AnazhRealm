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
// Kugel auf jede Ecke ihres Kastens, der Worker übersprang über dem Band). Dazu DIE EDIT-WAHRHEIT (K23): 300 Kugeln
// über den Spielpfad (`carveVoxelSphere`), danach hält der Main alle 300 und die Gitter am Ort und an zwei Nachbarn
// sind SHA Main = Worker (bis K23 verdrängte der FIFO-Deckel in `_addVoxelEdit` ab Edit 257 still nur im Main).
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
const { statikServer, starteBrowser } = require("./lib/welt-boot.cjs");
const fs = require("fs");
const path = require("path");
const stammLib = require("./lib/stamm.cjs");
const { messort } = require("./lib/welt-orte.cjs");
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
// DIE LINSE kommt immer aus DIESEM Baum (`gelaende-core.js` `MESSUNG`, `abdruckFeld`, `messStatistik`, `schichtMessung`,
// `urteil` — dieselbe Rechnung wie die Zahl-Leiste des Studios), das Gesetz aus der gemessenen Wurzel.
let linseKern = null;
const linse = () => (linseKern = linseKern || gelaendeKern(path.resolve(__dirname, ".."))).G;
// Die Punkte des Makro-Abdrucks in der Reihenfolge des Kerns (`abdruckFeld`, aufgezeichnet): die Seite liest an ihnen nur
// die Höhe der Welt (`_terrainMacroSurfaceY`) und hasht die Float64-Bytes — dieselben Bytes wie das Studio.
const abdruckPunkte = () => {
    const P = [];
    linse().abdruckFeld((x, z, mitDetail) => (P.push([x, z, mitDetail]), 0));
    return P;
};
// Die Bedienung des Studios (Namen, Gruppen, die benannten Landschaften) — kein Gesetz des Kerns (studio-vertrag §9).
const bedienung = () =>
    JSON.parse(fs.readFileSync(path.resolve(__dirname, "..", "worlds", "gelaende", "bedienung.json"), "utf8"));

const server = statikServer({ keinCache: true });

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
        async (welt, mitAbdruck, punkte, messorte) => {
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
                orte.push(...messorte);
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
                if (mitAbdruck || tag === "300") {
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
            // (1b) DIE FLUT-SAAT (K69-2): der Neubau eines Chunks mit einem Schnitt im 3×3 geht über den Worker, die Flut über
            // die Naht reist als Saat mit dem Auftrag (`_flutSaat`). Am Chunk des ersten Orts, unter einem Wassertisch 20 m über
            // seinem höchsten Grund (jede Spalte ist Grundwasser-Quelle, `_aquiferTrocken`), dieselbe Saat (jede Rand-Spalte
            // nass) im Sync-Bau des Mains (`_buildVoxelChunkWaterCells`) und im Worker (`chunk-mesh`, samt dem Stempel der Werke,
            // den der Main danach setzt): die Wasser-Zellen Wort für Wort gleich, und die Saat ändert sie in beiden (ohne Wirkung
            // wäre die Probe stumpf). Bis K69-2 kannte der Worker keine Saat: der Carve-Neubau lief im Haupt-Faden.
            // der erste Ort, dessen Grund im Wasser-Band liegt (zuerst der Fluss-Chunk; am Hang liegt das Band unter dem Fels)
            for (const o of orte.slice().reverse()) {
                const cfg = r._voxelChunkConfig(0);
                const cx = Math.floor(o.x / cfg.span);
                const cz = Math.floor(o.z / cfg.span);
                const ox = cx * cfg.span;
                const oz = cz * cfg.span;
                const oy = base - cfg.floorDrop;
                let hoch = -Infinity;
                for (let a = 0; a <= 4; a++)
                    for (let b = 0; b <= 4; b++)
                        hoch = Math.max(
                            hoch,
                            r._terrainMacroSurfaceY(ox + (a * cfg.span) / 4, oz + (b * cfg.span) / 4)
                        );
                const tischAlt = s.waterLevel;
                s.waterLevel = hoch + 20;
                await r._voxelWorkerSyncState({ op: "state-set" });
                const saat = new Uint8Array(4 * cfg.dim).fill(1);
                const key = `linse-saat|${cx},${cz}`;
                const dichte = r._voxelEditedDensityGrid(
                    key,
                    ox - cfg.step,
                    oy,
                    oz - cfg.step,
                    cfg.dim + 3,
                    cfg.dimY,
                    cfg.dim + 3,
                    cfg.step
                );
                s.voxelBaseDensityCache.delete(key);
                const mainZellen = (sa) => {
                    r._flutSaat = () => sa;
                    try {
                        return r._buildVoxelChunkWaterCells(ox, oy, oz, cfg.step, dichte, 0);
                    } finally {
                        delete r._flutSaat;
                    }
                };
                const workerZellen = async (sa) => {
                    const m = await warteAck({ type: "chunk-mesh", cx, cz, lod: 0, saat: sa });
                    const wc = m && m.waterCells ? new Uint8Array(m.waterCells) : new Uint8Array(0);
                    if (wc.length) r._stampArchitectureSolidCellsInto(wc, ox, oy, oz, 0);
                    return wc;
                };
                const diff = (a, b) => {
                    if (a.length !== b.length) return Math.max(a.length, b.length);
                    let n = 0;
                    for (let q = 0; q < a.length; q++) if (a[q] !== b[q]) n++;
                    return n;
                };
                try {
                    const main = mainZellen(saat);
                    const mit = await workerZellen(saat);
                    out.flutSaat = {
                        cx,
                        cz,
                        zellen: main.length,
                        abweichend: diff(main, mit),
                        mainWirkt: diff(main, mainZellen(null)),
                        saatWirkt: diff(mit, await workerZellen(null)),
                    };
                } finally {
                    s.waterLevel = tischAlt;
                    await r._voxelWorkerSyncState({ op: "state-set" });
                }
                if (out.flutSaat.mainWirkt) break;
            }
            {
                const F = out.flutSaat;
                if (!F.zellen || !F.mainWirkt)
                    out.befunde.push(
                        `die Flut-Saat: am Chunk ${F.cx},${F.cz} ändert die Saat den Sync-Bau nicht (${F.zellen} Zellen) — die Probe ist stumpf`
                    );
                else if (F.abweichend)
                    out.befunde.push(
                        `die Flut-Saat: ${F.abweichend} von ${F.zellen} Wasser-Zellen des Chunks ${F.cx},${F.cz} weichen Main ` +
                            `(Sync-Bau) ↔ Worker (Auftrag mit Saat) ab`
                    );
                else if (!F.saatWirkt)
                    out.befunde.push(
                        `die Flut-Saat: der Worker baut den Chunk ${F.cx},${F.cz} mit und ohne Saat gleich — er sieht sie nicht`
                    );
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
            // (3) DIE EDIT-WAHRHEIT (K23): 300 Kugeln über den Spielpfad (`carveVoxelSphere` → `_addVoxelEdit` → das Delta an den
            // Worker), 20 × 15 im 2-m-Raster über die Chunk-Naht des ersten Orts. Kein Edit fällt still: der Main hält alle 300,
            // und die Gitter des Orts und seiner zwei Nachbarn sind Main = Worker byte-gleich (SHA je Gitter). Der FIFO-Deckel
            // (256) verdrängte die ersten 44 nur im Main — der Worker hielt sie: zwei Böden ab Edit 257.
            s.worldMeta.voxelEdits = [];
            await r._voxelWorkerSyncState({ op: "state-set" });
            const N_EDITS = 300;
            const span0 = r._voxelChunkConfig(0).span;
            const ex0 = Math.floor(o0.x / span0) * span0 + span0 - 20;
            const ez0 = Math.floor(o0.z / span0) * span0 + 6;
            for (let i = 0; i < N_EDITS; i++) {
                const x = ex0 + (i % 20) * 2;
                const z = ez0 + Math.floor(i / 20) * 2;
                r.carveVoxelSphere(x, r._terrainMacroSurfaceY(x, z) - 1, z, 2.5);
            }
            out.editWahrheit = { gesetzt: N_EDITS, imMain: s.worldMeta.voxelEdits.length, gitter: [] };
            const zeilenWahr = [];
            const nachbarn = [
                { id: o0.id + "+300", x: ex0, z: ez0 },
                { id: o0.id + "+300 Ost", x: ex0 + span0, z: ez0 },
                { id: o0.id + "+300 Süd", x: ex0, z: ez0 + span0 },
            ];
            for (const ort of nachbarn) {
                const zeilen = [];
                for (let lod = 0; lod <= 3; lod++) {
                    const z = await vergleiche(ort, lod, "300");
                    out.editWahrheit.gitter.push({ ort: ort.id, lod, main: z.shaMain, worker: z.shaWorker });
                    zeilen.push(z);
                }
                zeilenWahr.push({ id: ort.id, x: ort.x, z: ort.z, zeilen });
            }
            out.orte.push(...zeilenWahr);
            out.editWahrheit.shaGleich = out.editWahrheit.gitter.filter((g) => g.main === g.worker).length;
            // KARTE = LISTE: die Edit-Karte (je Chunk) trägt jeden beitragenden Edit — das Gitter über die Karte und über die
            // ganze Liste sind byte-gleich (LOD 0 an den drei Orten), und 4000 Punkt-Proben im Feld summieren gleich.
            if (typeof r._voxelEditsImKasten === "function") {
                const karte = r._voxelEditsImKasten;
                const liste = function () {
                    return this.state.worldMeta.voxelEdits;
                };
                let gleich = 0;
                for (const ort of nachbarn) {
                    const cfg = r._voxelChunkConfig(0);
                    const cx = Math.floor(ort.x / cfg.span);
                    const cz = Math.floor(ort.z / cfg.span);
                    const args = [cx * cfg.span - cfg.step, base - cfg.floorDrop, cz * cfg.span - cfg.step];
                    const dims = [cfg.dim + 3, cfg.dimY, cfg.dim + 3, cfg.step];
                    const a = r._voxelEditedDensityGrid(`linse-karte|${cx},${cz}`, ...args, ...dims);
                    r._voxelEditsImKasten = liste;
                    const b = r._voxelEditedDensityGrid(`linse-karte|${cx},${cz}`, ...args, ...dims);
                    r._voxelEditsImKasten = karte;
                    s.voxelBaseDensityCache.delete(`linse-karte|${cx},${cz}`);
                    if ((await hex(a)) === (await hex(b))) gleich++;
                }
                let punkte = 0;
                const alle = s.worldMeta.voxelEdits;
                for (let i = 0; i < 4000; i++) {
                    const x = ex0 - 4 + ((i * 7919) % 4800) / 100;
                    const z = ez0 - 4 + ((i * 104729) % 3800) / 100;
                    const y = r._terrainMacroSurfaceY(x, z) - 1 + ((i % 7) - 3) * 0.6;
                    let d = 0;
                    for (const ed of alle) {
                        const dx = x - ed.x;
                        const dy = y - ed.y;
                        const dz = z - ed.z;
                        const d2 = dx * dx + dy * dy + dz * dz;
                        if (d2 < ed.r * ed.r)
                            d += (ed.mode === "fill" ? 1 : -1) * (1 - Math.sqrt(d2) / ed.r) * (ed.strength || 48);
                    }
                    if (Object.is(d, r._voxelEditDeltaAt(x, y, z)) || d === r._voxelEditDeltaAt(x, y, z)) punkte++;
                }
                out.editWahrheit.karteGleich = `${gleich}/${nachbarn.length} Gitter · ${punkte}/4000 Punkte`;
                if (gleich !== nachbarn.length || punkte !== 4000)
                    out.befunde.push(
                        `EDIT-KARTE ≠ LISTE: ${out.editWahrheit.karteGleich} — Täter _voxelEditKarte (ein Edit fehlt seinem Chunk)`
                    );
            }
            if (out.editWahrheit.imMain !== N_EDITS)
                out.befunde.push(
                    `EDIT-WAHRHEIT: der Main hält ${out.editWahrheit.imMain} von ${N_EDITS} Edits — Täter _addVoxelEdit (FIFO-Deckel verdrängt still)`
                );
            if (out.editWahrheit.shaGleich !== out.editWahrheit.gitter.length)
                out.befunde.push(
                    `EDIT-WAHRHEIT: SHA Main = Worker in ${out.editWahrheit.shaGleich}/${out.editWahrheit.gitter.length} Gittern nach ${N_EDITS} Edits`
                );
            s.worldMeta.voxelEdits = editsVorher;
            await r._voxelWorkerSyncState({ op: "state-set" });
            // Der Abdruck der Makro-Höhe für den Byte-Beweis: die Punkte des Kerns (`abdruckFeld`), die Höhe der Welt.
            const makroSha = async () =>
                hex(Float64Array.from(punkte, ([x, z, mitDetail]) => r._terrainMacroSurfaceY(x, z, mitDetail)));
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
            // DIE HÖHEN DER FERNE (K60, B2): der Fern-Faden rechnet die Punkte von Fern-Ring, Feld-Pass und Fern-Krone
            // (`_fernAuftrag`) — dieselben Punkte (48 × 48 über ±4 km um den Spieler), Makro und Detail, Höhe und Schutt, gegen
            // das Gesetzbuch im Main (`_terrainMacroSurfaceY`): Wort für Wort gleich (Float32-Bitmuster).
            if (typeof r._fernAuftrag === "function" && r._getVoxelWorker()) {
                const N = 48;
                const pts = new Float32Array(N * N * 2);
                const pm = s.playerMesh ? s.playerMesh.position : { x: 0, z: 0 };
                for (let i = 0; i < N; i++)
                    for (let j = 0; j < N; j++) {
                        pts[(i * N + j) * 2] = pm.x + (i - N / 2) * 173.3;
                        pts[(i * N + j) * 2 + 1] = pm.z + (j - N / 2) * 167.9;
                    }
                const lauf = async (imMain, detail) => {
                    const w = new Float32Array(N * N);
                    const sch = new Float32Array(N * N);
                    if (imMain) {
                        const aus = { hang: 0, schutt: 0, wand: 0 };
                        for (let k = 0; k < N * N; k++) {
                            w[k] = r._terrainMacroSurfaceY(pts[k * 2], pts[k * 2 + 1], detail, aus);
                            sch[k] = Math.max(
                                aus.schutt > 0 ? aus.schutt : 0,
                                aus.wand > 0 ? 1 / r.constructor.TERRAIN_GEOLOGY.schutt : 0
                            );
                        }
                    } else {
                        const a = await r._fernAuftrag("teile", {
                            punkte: Float64Array.from(pts),
                            detail,
                            nurHoehe: true,
                        });
                        w.set(a.law);
                        sch.set(a.schutt);
                    }
                    return { w: new Uint32Array(w.buffer), sch: new Uint32Array(sch.buffer) };
                };
                const fe = (out.ferne = { n: 0, abweichend: 0, erste: null });
                for (const detail of [false, true]) {
                    const a = await lauf(true, detail);
                    const b = await lauf(false, detail);
                    for (let k = 0; k < N * N; k++) {
                        fe.n++;
                        if (a.w[k] !== b.w[k] || a.sch[k] !== b.sch[k]) {
                            fe.abweichend++;
                            if (!fe.erste) fe.erste = { detail, x: pts[k * 2], z: pts[k * 2 + 1] };
                        }
                    }
                }
            }
            // TEIL W — DER STOFF DES WALDS (K60-3): die Darts der Wald-Zellen um jeden Ort (9 × 9 Zellen) im Main
            // (`_forestCellDarts`, frisches Gedächtnis) und im Voxel-Faden (`_voxelWorkerWaldDarts`, entpackt über
            // `_waldDartsEntpacken`, wie die Schlange des Walds sie ins Gedächtnis legt) — jede Zelle Wort für Wort gleich (JSON ihrer Darts). Die Streu wartet auf die Darts des Fadens;
            // drifteten sie, stünde die Gestalt der Ferne auf einer anderen Wahrheit als der Wald der Nähe.
            if (typeof r._voxelWorkerWaldDarts === "function" && r._getVoxelWorker() && r._forestGesetzWahr()) {
                const wa = (out.wald = { zellen: 0, darts: 0, abweichend: 0, erste: null });
                const seedInt = r._forestSeedInt();
                const C = r.constructor.FOREST.cell;
                for (const ort of orte) {
                    const zellen = [];
                    for (let i = -4; i <= 4; i++)
                        for (let j = -4; j <= 4; j++) zellen.push(Math.floor(ort.x / C) + i, Math.floor(ort.z / C) + j);
                    r._forestDartMemo = null; // frisches Gedächtnis: der Main rechnet jede Zelle selbst
                    const main = [];
                    for (let k = 0; k < zellen.length; k += 2)
                        main.push(r._forestCellDarts(zellen[k], zellen[k + 1], seedInt));
                    const res = await r._voxelWorkerWaldDarts(new Int32Array(zellen), seedInt, r._forestExtraSpecies());
                    const faden = r._waldDartsEntpacken(res, zellen.length / 2);
                    for (let k = 0; k < zellen.length; k += 2) {
                        const m = main[k / 2];
                        const w = faden[k / 2];
                        wa.zellen++;
                        wa.darts += m.length;
                        if (JSON.stringify(m) === JSON.stringify(w)) continue;
                        wa.abweichend++;
                        if (!wa.erste)
                            wa.erste = {
                                ort: ort.id,
                                gx: zellen[k],
                                gz: zellen[k + 1],
                                main: m[0] || null,
                                faden: (w && w[0]) || null,
                            };
                    }
                }
            }
            return out;
        },
        welt,
        mitAbdruck,
        mitAbdruck ? abdruckPunkte() : [],
        ["wiese", "genesis"].map((id) => ((o) => ({ id, x: o.x, z: o.z }))(messort(id)))
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
    if (rep.editWahrheit) {
        const w = rep.editWahrheit;
        console.log(
            `    Edit-Wahrheit: ${w.gesetzt} Edits über den Spielpfad, der Main hält ${w.imMain}, SHA Main = Worker in ${w.shaGleich}/${w.gitter.length} Gittern · Karte = Liste ${w.karteGleich || "—"}`
        );
    }
    for (const b of rep.befunde) console.log("    •", b);
    console.log(
        `    ${rep.gitter} Gitter · ${rep.worte} Ecken · abweichend ${rep.abweichend} · maxDiff ${rep.maxDiff}`
    );
    const fs0 = rep.flutSaat;
    if (fs0)
        console.log(
            `    Flut-Saat am Chunk ${fs0.cx},${fs0.cz} (Wassertisch über dem Grund): ${fs0.zellen} Zellen, ` +
                `die Saat ändert ${fs0.mainWirkt} im Main und ${fs0.saatWirkt} im Worker · Main ↔ Worker abweichend ${fs0.abweichend}`
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
// Die Lage einer frisch geborenen Welt der Saat: der Grund und die Lage-Rechnung aus DIESEM Kern (`GRUND`, `lageAus`),
// das Gesetz (Erbgut-Normalform, Rausch) aus der gemessenen Wurzel.
function realismusLage(K, Z, saat) {
    const g = Z.GRUND;
    const abbild = {
        seed: saat,
        baseHeight: g.basis,
        waterLevel: g.basis - g.meerUnterBasis,
        erbgut: { terme: K.G.erbgutNormal(undefined), wildnis: 1 },
        regionSize: g.kachel,
    };
    return Z.lageAus(abbild, K.SimplexNoise);
}
// DAS SPALTEN-BUDGET (K16; Nordstern §4.1: ≤ 6 µs je Gelände-Spalte mit allen Termen, ≤ 3 µs in Ebenen, gegen „heute
// 2,4–3,5 µs (26 noise2D)"). Gemessen wird, was der Chunk-Bau zahlt: die WARME Spalte (das Netz-Gedächtnis je Zelle steht —
// der Bau tastet in 1,8 m, derselbe Raster um 7,3 m versetzt) plus das kalte Gedächtnis, umgelegt auf die 1,8-m-Spalten
// seiner Fläche; als noise2D-Äquivalent derselben vm, so fällt die Uhr des Holzes heraus (die Eichung der Karte: 2,95 µs =
// 26 noise2D → 6 µs ≙ 52,9, 3 µs ≙ 26,4). Ebene = Hang < 8 % über dem Wasser. Bis 12.10. maß die Linse kalte µs auf dem
// 30-m-Raster (25–47 µs unter Last: das Gedächtnis je Zelle auf 1/278 der Spalten des Spiels verteilt) und urteilte nicht.
const SPALTEN_BUDGET = Object.freeze({ alle: 52.9, ebenen: 26.4, eichungUsJeNoise: 2.95 / 26 });
function spaltenKosten(G, L, H, n, S, A, usKalt, last = 0) {
    const off = 7.3;
    const hoehe = last
        ? (x, z) => {
              let h = G.hoehe(L, x, z, true);
              for (let k = 0; k < last; k++) h += L.noise.noise2D(x * 0.01 + k, z * 0.01) * 1e-12;
              return h;
          }
        : (x, z) => G.hoehe(L, x, z, true);
    const eben = [];
    for (let j = 1; j < n - 1; j++)
        for (let i = 1; i < n - 1; i++) {
            const k = i + j * n;
            const g = Math.hypot((H[k + 1] - H[k - 1]) / (2 * S), (H[k + n] - H[k - n]) / (2 * S));
            if (g < 0.08 && H[k] > L.waterLevel) eben.push(k);
        }
    // Spalten und Eichung WECHSELN sich ab (16 Scheiben, je Scheibe 4 000 noise2D): die Last des Holzes driftet während der
    // Messung (ein voller Rechner verdoppelte noise2D 0,20 → 0,48 µs), das Verhältnis je Scheibe nicht — gezählt wird sein
    // Median. Erst die Rohwerte kalt am 30-m-Raster und eine Eichung am Ende ließen dieselbe Welt zwischen 17 und 30 springen.
    const median = (a) => a.slice().sort((p, q) => p - q)[a.length >> 1];
    const takt = (ks) => {
        const B = Math.max(1, Math.floor(ks.length / 16));
        const rat = [];
        const usS = [];
        const usN = [];
        for (let b = 0; b + B <= ks.length; b += B) {
            let t0 = process.hrtime.bigint();
            let s = 0;
            for (let q = b; q < b + B; q++) {
                const k = ks[q];
                s += hoehe(-A + off + (k % n) * S, -A + off + ((k / n) | 0) * S);
            }
            const us = Number(process.hrtime.bigint() - t0) / 1000 / B;
            t0 = process.hrtime.bigint();
            for (let q = 0; q < 4000; q++) s += L.noise.noise2D(q * 0.013 + b, q * 0.007);
            const un = Number(process.hrtime.bigint() - t0) / 1000 / 4000;
            if (!(s === s)) throw new Error("spaltenKosten: NaN aus dem Gesetz");
            rat.push(us / un);
            usS.push(us);
            usN.push(un);
        }
        return { eq: median(rat), us: median(usS), usNoise: median(usN) };
    };
    // der Selbsttest (eine Last von `last` noise2D je Spalte) misst jede vierte Spalte
    const jede = last ? 4 : 1;
    const W = takt(Array.from({ length: Math.floor((n * n) / jede) }, (_, q) => q * jede));
    const E = takt(eben.filter((_, q) => q % jede === 0));
    const usWarm = W.us;
    const usEben = E.us;
    const usNoise = W.usNoise;
    const flaecheKm2 = ((n - 1) * S * 1e-3) ** 2;
    const memoUsJeKm2 = last ? 0 : Math.max(0, (usKalt - usWarm) * n * n) / flaecheKm2;
    const umgelegt = memoUsJeKm2 / (1e6 / (1.8 * 1.8)); // je 1,8-m-Spalte des Spiels
    const alle = W.eq + umgelegt / W.usNoise;
    const ebenen = E.eq + umgelegt / E.usNoise;
    return {
        usWarm: +usWarm.toFixed(2),
        usEbene: +usEben.toFixed(2),
        usNoise2D: +usNoise.toFixed(3),
        memoMsJeKm2: +(memoUsJeKm2 / 1000).toFixed(1),
        umgelegtUs: +umgelegt.toFixed(3),
        noise2DAlle: +alle.toFixed(1),
        noise2DEbene: +ebenen.toFixed(1),
        ebeneSpalten: eben.length,
        imBudget: alle <= SPALTEN_BUDGET.alle && ebenen <= SPALTEN_BUDGET.ebenen,
    };
}
// DIE LANDSCHAFTEN AN DEN DREI SAATEN (K16b): jede benannte Landschaft der Bedienung des Studios (worlds/gelaende/
// bedienung.json `landschaften`) als EIN Plan je Saat der Linse (`planLage` des gemessenen Gesetzes — dieselbe Lage, die die
// Welt aus dem Plan gebiert), dieselbe Messung und dasselbe Urteil wie die Saaten (die Linse dieses Baums). Das Urteil spricht
// `presetBefunde` (dieselbe Wand wie die Knöpfe der Studio-Probe): kein Ziel false, und je Saat trägt mindestens eine
// Landschaft das Schicht-Gesetz. Ein Gesetz ohne Plan-Tür (`--wurzel` vor K16b) liest keinen Plan — dann misst das Bein
// nichts und sagt es.
function presetsAnSaaten(K, Z) {
    const G = K.G;
    const R = Z.MESSUNG.raster;
    if (typeof G.planLage !== "function") {
        console.log("\n  Landschaften: das gemessene Gesetz liest keinen Plan (planLage) — das Bein misst nichts");
        return { befunde: [], je: [] };
    }
    const befunde = [];
    const je = [];
    for (const saat of REALISMUS_SAATEN) {
        const liste = [];
        for (const P of bedienung().landschaften) {
            const plan = { art: Z.PLAN_ART, v: Z.PLAN_VERSION, saat, regler: P.regler };
            const L = G.planLage(plan, K.SimplexNoise);
            const H = new Float64Array(R.n * R.n);
            for (let j = 0; j < R.n; j++)
                for (let i = 0; i < R.n; i++)
                    H[i + j * R.n] = G.hoehe(L, R.x0 + i * R.schritt, R.x0 + j * R.schritt, true);
            const st = Z.messStatistik(H, L, G);
            const sm = Z.schichtMessung(L, G);
            const ort = sm.ort;
            const schicht = sm.baender;
            const urteil = Z.urteil(st, sm);
            liste.push({ id: P.id, traegt: true, urteil });
            je.push({
                saat,
                preset: P.id,
                urteil,
                senken1mJeKm2: st.senken1mJeKm2,
                theta: st.flint.theta,
                r2: st.flint.r2,
                hammond: st.hammond.sanft,
                dorfplaetze: st.dorfplaetze,
                schicht: ort ? { kliff: schicht.kliff, schutt: schicht.schutt, pediment: schicht.pediment } : null,
            });
            const z = (k) => (urteil[k] === true ? "✓" : urteil[k] === false ? "✗" : "–");
            console.log(
                `    ${saat.padEnd(24)} ${P.id.padEnd(14)} senken ${z("senken")} · flint ${z("flint")} · hammond ${z("hammond")} · dorfplaetze ${z("dorfplaetze")} · schicht ${z("schicht")} (Senken ${st.senken1mJeKm2}/km² · θ ${st.flint.theta} R² ${st.flint.r2} · Hammond ${st.hammond.sanft} · Plätze ${st.dorfplaetze})`
            );
        }
        for (const b of presetBefunde(liste)) befunde.push(`${saat}: ${b}`);
    }
    return { befunde, je };
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
    // Das Mess-Raster des Kerns (`MESSUNG.raster`: 4 × 4 km innen, 30 m, 2 km Rand — EINE Quelle mit der Zahl-Leiste).
    const R = Z.MESSUNG.raster;
    const SCHRITT = R.schritt;
    const HALB = R.halb;
    const RAND = R.rand;
    const AUSSEN = -R.x0;
    const n = R.n;
    console.log(
        "\n========= DIE GELÄNDE-LINSE — Natur-Zahlen am Gesetzbuch (Makro, 4 × 4 km innen + 2 km Rand, 30 m) ========="
    );
    const welten = [];
    let rot = false;
    const stoerung = (x, z) => 3 * Math.sin(x / 12.7) * Math.sin(z / 12.7);
    for (const saat of REALISMUS_SAATEN) {
        const L = realismusLage(K, Z, saat);
        const H = new Array(n * n);
        const t0 = process.hrtime.bigint();
        for (let j = 0; j < n; j++)
            for (let i = 0; i < n; i++) H[i + j * n] = G.hoehe(L, -AUSSEN + i * SCHRITT, -AUSSEN + j * SCHRITT, true);
        const us = Number(process.hrtime.bigint() - t0) / 1000 / (n * n);
        const kosten = spaltenKosten(G, L, H, n, SCHRITT, AUSSEN, us);
        const st = Z.messStatistik(H, L, G);
        const sm = Z.schichtMessung(L, G);
        const ort = sm.ort;
        const ox = sm.x;
        const oz = sm.z;
        const schicht = sm.baender;
        // Der Korridor ist EINE Quelle (`urteil`/`KORRIDOR` im Kern — dieselbe Zahl-Leiste wie im Studio); die Wand verlangt
        // jedes Ziel, auch das Schicht-Gesetz (ohne Schicht-Ort: null = rot), und die Kosten je Spalte (K16).
        // DER MÄANDER (K16): die Bahnen der Flachland-Glieder des inneren Felds (`maeanderZahl`, die Bahn im 8-m-Schritt) —
        // Sinuosität ≥ 1,3, Wellenlänge 10–14 Breiten, Rc 2–3 Breiten (Leopold & Wolman 1960, Nordstern §4.1), ≥ 3 Glieder.
        const laeufe = G.flussLaeufe(L, -HALB, -HALB, HALB, HALB, 8);
        const maeander = Z.maeanderZahl(laeufe);
        const maeanderGut = (m) =>
            m.glieder >= 3 &&
            m.sinuositaet >= 1.3 &&
            m.lambdaBreiten >= 10 &&
            m.lambdaBreiten <= 14 &&
            m.rcBreiten >= 2 &&
            m.rcBreiten <= 3;
        const urteil = { ...Z.urteil(st, sm), maeander: maeanderGut(maeander), kosten: kosten.imBudget };
        const taeter = {
            senken: "geschlossene Mulden ohne Auslass (flaeche: ein Profil-Minimum ohne Netz-Abfluss, oder das Detail T3)",
            flint: "das Gefälle folgt dem Einzugsgebiet nicht (knotenSohle: das Bett steigt nicht mit S = ks·A^−θ je Flächen-Klasse)",
            hammond: "keine Ebenen (RELIEF_KNOTEN hoch im Tiefland, Aue F zu schmal)",
            dorfplaetze: "kein ebener Talboden (Aue F, AUE_QUER)",
            schicht: ort
                ? "die Bänder fehlen am Schicht-Ort (treppe/schichtMass: Kliff, Schutthang, Pediment)"
                : "kein Tafelland in 16 × 16 km (grossform: Stil-Feld)",
            maeander:
                maeander.glieder < 3
                    ? `${maeander.glieder} Flachland-Glieder im Feld (knotenSohle: kein Gefälle < 0,4 %)`
                    : `die Bahn der Flachland-Glieder ist keine Schleife in der Aue: Sinuosität ${maeander.sinuositaet}, λ ${maeander.lambdaBreiten} Breiten, Rc ${maeander.rcBreiten} Breiten (flussLaeufe/segment: der Mäander-Term)`,
            kosten: `die Spalte kostet ${kosten.noise2DAlle} noise2D (Ebene ${kosten.noise2DEbene}) gegen das Budget ${SPALTEN_BUDGET.alle} (Ebene ${SPALTEN_BUDGET.ebenen}) — hoehe: die Terme je Spalte (Netz, Profil, Detail)`,
        };
        let stoer = null;
        let last = null;
        if (SELBSTTEST) {
            const HS = H.map((h, k) => h + stoerung(-AUSSEN + (k % n) * SCHRITT, -AUSSEN + ((k / n) | 0) * SCHRITT));
            stoer = Z.messStatistik(HS, L, G);
            // die Kosten-Last: 40 noise2D mehr je Spalte MÜSSEN das Budget sprengen
            last = spaltenKosten(G, L, H, n, SCHRITT, AUSSEN, us, 40);
            // die Gerade: dieselben Läufe ohne Bahn (jedes Glied seine Sehne) MÜSSEN den Mäander rot färben
            const gerade = Z.maeanderZahl(
                laeufe.map((lf) => ({ ...lf, glieder: lf.glieder.map((gl) => ({ ...gl, bahn: undefined })) }))
            );
            stoer.maeanderGerade = maeanderGut(gerade) ? "blind" : "rot";
        }
        welten.push({
            saat,
            raster: { halbM: HALB, randM: RAND * SCHRITT, schrittM: SCHRITT, n },
            usJeSpalteKalt: +us.toFixed(2),
            kosten,
            statistik: st,
            schichtOrt: ort ? { x: ox, z: oz, stil: ort.stil } : null,
            schicht,
            urteil,
            maeander,
            stoerung: stoer && {
                senken1mJeKm2: stoer.senken1mJeKm2,
                minimaJeKm2: stoer.minimaJeKm2,
                maeanderGerade: stoer.maeanderGerade,
            },
            kostenLast: last,
        });
        console.log(
            `\n  ${saat}: Spalte ${kosten.noise2DAlle} noise2D (Ebene ${kosten.noise2DEbene}; warm ${kosten.usWarm} µs, Ebene ${kosten.usEbene} µs, noise2D ${kosten.usNoise2D} µs, Gedächtnis ${kosten.memoMsJeKm2} ms/km² = ${kosten.umgelegtUs} µs je 1,8-m-Spalte; kalt ${us.toFixed(2)} µs am 30-m-Raster) · Land ${st.landKm2} km² · Senken>1m ${st.senken1mJeKm2}/km² (${st.senken1m}, benannt ${st.senkenBenannt}; Minima ${st.minimaJeKm2}/km²; Fläche>1m ${(100 * st.anteilSenkeTiefer1m).toFixed(1)} %) · θ ${st.flint.theta} R² ${st.flint.r2} (${st.flint.klassen} Klassen aus ${st.flint.zellen} Zellen; je Zelle θ ${st.flint.thetaZelle} R² ${st.flint.r2Zelle}) · Hammond sanft ${st.hammond.sanft}/${st.hammond.fenster} · Dorfplätze ${st.dorfplaetze} · Hang p50 ${st.hang.p50Prozent} % p90 ${st.hang.p90Prozent} %`
        );
        console.log(
            `    Schicht-Ort ${ort ? `(${Math.round(ox)}, ${Math.round(oz)})` : "— (kein Schicht-Term)"}: Kliff≥60° ${(100 * schicht.kliff).toFixed(1)} % · Schutt 30–40° ${(100 * schicht.schutt).toFixed(1)} % (Ruhewinkel 33–37° ${(100 * schicht.ruhe).toFixed(1)} %) · Pediment 0,5–7° ${(100 * schicht.pediment).toFixed(1)} %`
        );
        for (const k of Object.keys(urteil)) {
            if (urteil[k]) continue;
            rot = true;
            console.log(`    ⛔ ${k}: ${taeter[k]}`);
        }
        console.log(
            `    Mäander: ${maeander.glieder} Flachland-Glieder · Sinuosität ${maeander.sinuositaet} · λ ${maeander.lambdaBreiten} Breiten · Rc ${maeander.rcBreiten} Breiten (Soll ≥ 1,3 · 10–14 · 2–3)`
        );
        if (stoer)
            console.log(
                `    Selbsttest-Störung: Senken>1m ${stoer.senken1mJeKm2}/km² · die Gerade (Glieder ohne Bahn): Mäander ${stoer.maeanderGerade}`
            );
        if (last)
            console.log(
                `    Selbsttest-Last (+40 noise2D je Spalte): ${last.noise2DAlle} noise2D (Ebene ${last.noise2DEbene})`
            );
    }
    let presets = null;
    if (!SELBSTTEST) {
        console.log("\n  DIE PRESETS an den drei Saaten (je Preset EIN Plan, dieselbe Statistik, dasselbe Urteil):");
        presets = presetsAnSaaten(K, Z);
        for (const b of presets.befunde) {
            rot = true;
            console.log(`    ⛔ ${b}`);
        }
    }
    const JSON_ZIEL = JSON_AUS;
    if (JSON_ZIEL)
        fs.writeFileSync(
            JSON_ZIEL,
            JSON.stringify(
                {
                    zweck: "K16 Gelände-Linse (Makro am Gesetzbuch)",
                    wurzel: root,
                    welten,
                    presets: presets && presets.je,
                },
                null,
                1
            )
        );
    if (SELBSTTEST) {
        const blind = welten.some(
            (w) =>
                !(w.stoerung && w.stoerung.senken1mJeKm2 > 1) ||
                !(w.kostenLast && !w.kostenLast.imBudget) ||
                w.stoerung.maeanderGerade !== "rot"
        );
        console.log(
            `\n${blind ? "⛔ SELBSTTEST ROT: die Störung, die Kosten-Last oder die Gerade blieb unentdeckt" : "✅ SELBSTTEST GRÜN: die Eier-Karton-Störung färbt die Senken rot, die Kosten-Last sprengt das Spalten-Budget, die Gerade färbt den Mäander rot"}\n`
        );
        return blind ? 1 : 0;
    }
    console.log(
        `\n${rot ? "⛔ GELÄNDE-LINSE ROT" : "✅ GELÄNDE-LINSE GRÜN: alle Natur-Zahlen im Korridor, drei Saaten, jedes Preset an jeder Saat"}\n`
    );
    return rot ? 1 : 0;
}

// ── DIE STUDIO-PROBE (K16b, `--studio`): das Gelände-Studio auf der Welt-Engine (`index.html?studio=gelaende`) trägt EINEN
// Plan in die Welt. Die Probe fährt die Bedienung wie der Gestalter — jeder Regler aus `LANDFORM_REGLER` einmal über sein
// Schieber-Element, nach jedem Griff die Zahl-Leiste (die Statistik des Kerns) und der Raster-Abdruck des Studios (ein
// Regler, der das Raster nicht ändert, ist TOT) —, exportiert den Plan (die Bytes des Downloads), legt ihn durch die
// Welt-Tür (Welt-Tor „Ersetzen" — die Tür, durch die jede Datei zur Welt wird) und misst nach dem Reload in der Welt
// denselben Makro-Abdruck (64×64, ±852 m, mit und ohne Detail) und dieselbe Statistik (`_terrainMacroSurfaceY` auf dem
// Raster des Studios). Studio = Welt byte-gleich, sonst ROT beim Namen. Dazu vier Wände der Bedienung:
//   DER START: das Studio öffnet auf A, und der Entwurf nennt sichtbar, was die Welt trägt und kein Plan (Rampe, Basis);
//   A = DIE GEBAUTE WELT: das Studio steht über einer Welt, die kein Plan beschreibt (Basis 7 m, eine Rampe im Erbgut) —
//       unter A zeigt es dieselbe Welt (Makro-Abdruck und Statistik wie die Welt selbst), nie eine Projektion auf einen Plan;
//   DIE LANDSCHAFTEN (`landschaften` der Bedienung): jeder Knopf legt seine Regler in den Entwurf, kein Ziel fällt aus dem Natur-Korridor
//       (`urteil` false), und mindestens eine Landschaft trägt das Schicht-Gesetz (Kliff über Schutthang über Pediment);
//   DER SCHNEE (EIN Farb-Gesetz): nach dem Import malt die Karte des Plans je Rasterzelle den Schnee, den die Boden-Farbe der
//       Welt trägt (`_bodenFarbeAt`), in der Farbe der Boden-Palette.
// Der Selbsttest: das Studio rechnet den Abdruck eines um EINEN Schritt verstellten Plans — die Welt MUSS sich von ihm
// unterscheiden (die Linse sieht einen Schritt); ein Preset außerhalb des Korridors und Presets ohne Schicht-Gesetz, ein
// Start auf B mit verschwiegener Abweichung und eine Karte ohne Schnee MÜSSEN rot werden.
//   --studio [--selftest] [--json datei]
// Die Befunde der Preset-Wand (rein — der Selbsttest füttert sie mit einem Täter).
function presetBefunde(liste) {
    const b = [];
    for (const p of liste) {
        if (p.fehlt) {
            b.push(`Preset ${p.id}: kein Knopf im Panel ([data-preset="${p.id}"])`);
            continue;
        }
        if (!p.traegt) b.push(`Preset ${p.id}: der Entwurf trägt seine Regler nicht`);
        if (!p.urteil) {
            b.push(`Preset ${p.id}: kein Urteil (die Leiste blieb leer)`);
            continue;
        }
        for (const [k, v] of Object.entries(p.urteil))
            if (v === false) b.push(`Preset ${p.id}: ${k} außerhalb des Natur-Korridors (KORRIDOR)`);
    }
    if (!liste.some((p) => p.urteil && p.urteil.schicht === true))
        b.push("kein Preset trägt das Schicht-Gesetz (Kliff über Schutthang über Pediment)");
    return b;
}
// Die Befunde der Start-Wand (rein — der Selbsttest füttert sie mit einem Täter): das Studio öffnet über der Welt, wie sie
// steht (A), nie über dem Entwurf (B ist die Projektion der Welt auf einen Plan); und der Entwurf nennt sichtbar, was die Welt
// trägt und kein Plan (`soll`: Wörter, die in der Abweichung stehen müssen) — „Welt bauen" legt die Welt ohne es.
function startBefunde(z, soll) {
    const b = [];
    if (z.zeigt !== "A")
        b.push(
            `der Start zeigt ${z.zeigt} (den Entwurf, die Projektion der Welt auf einen Plan) statt A, der gebauten Welt`
        );
    const ab = Array.isArray(z.abweichung) ? z.abweichung.join(" · ") : "";
    for (const w of soll)
        if (!ab.includes(w))
            b.push(
                `der Entwurf verschweigt, was die Welt trägt und kein Plan: „${w}" fehlt in der Abweichung (${ab || "keine"})`
            );
    if (soll.length && !z.sichtbar) b.push("die Abweichung steht nicht sichtbar im Panel (.abweichung)");
    return b;
}
// Die Welt in der Seite gemessen, unabhängig vom Studio — mit der Linse dieses Baums: der Makro-Abdruck an den Punkten des
// Kerns (`abdruckFeld`) und die Statistik auf dem Mess-Raster des Kerns (`MESSUNG.raster`, `messStatistik`); die Seite liest
// nur die Höhe, die die Welt baut (`_terrainMacroSurfaceY`), und die Seen, die ihr Gesetz benennt (`benannteSeen`).
async function weltMessen(page) {
    const Z = linse();
    const R = Z.MESSUNG.raster;
    const w = await page.evaluate(
        async (punkte, R) => {
            const r = window.anazhRealm;
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
            const H = new Array(R.n * R.n);
            for (let j = 0; j < R.n; j++)
                for (let i = 0; i < R.n; i++)
                    H[i + j * R.n] = r._terrainMacroSurfaceY(R.x0 + i * R.schritt, R.x0 + j * R.schritt, true);
            const L = r._gelaende();
            return {
                makroSha: await hex(
                    Float64Array.from(punkte, ([x, z, mitDetail]) => r._terrainMacroSurfaceY(x, z, mitDetail))
                ),
                H,
                benannt: G.benannteSeen(L, R.x0, R.x0, R.schritt, R.n),
                seed: L.seed,
                basis: L.baseHeight,
                wasser: L.waterLevel,
                terme: r._erbgut().terme.map((t) => t.art),
                erbgut: r._erbgut().terme[0],
            };
        },
        abdruckPunkte(),
        R
    );
    const { H, benannt, ...rest } = w;
    return {
        ...rest,
        statistik: Z.messStatistik(Float64Array.from(H), { waterLevel: w.wasser }, { benannteSeen: () => benannt }),
    };
}
async function studioProbe() {
    await new Promise((r) => server.listen(PORT, r));
    const browser = await starteBrowser({ art: "standard", frist: 900000 });
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
        // DIE FREMDE WELT: eine Welt, die kein Plan beschreibt (Basis 7 m, das Meer darunter, eine Rampe hinter der Wildnis),
        // wird die aktive Welt — über ihr öffnet sich das Studio.
        const b0 = await boote(page);
        if (!b0.ok) throw new Error("die Welt vor der fremden Welt erwachte nicht");
        const nav0 = page.waitForNavigation({ waitUntil: "domcontentloaded", timeout: 60000 });
        await page.evaluate(() => {
            const r = window.anazhRealm;
            const G = window.__gelaendeCore;
            const snap = r._weltAusPlan({ art: G.PLAN_ART, v: G.PLAN_VERSION, saat: "studio-probe-fremd", regler: {} });
            snap.terrainBaseHeight = 7;
            snap.worldMeta.erbgut.terme.push({
                art: "rampe",
                x: 60,
                z: -40,
                winkel: 14,
                richtung: 35,
                lauf: 80,
                breite: 14,
                krone: 6,
                boeschung: 40,
            });
            setTimeout(() => r._weltBetreten(snap), 0);
        });
        await nav0;
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
        // DER START: das Studio öffnet auf A, und der Entwurf nennt, was die fremde Welt trägt und kein Plan (die Rampe, die
        // Basis 7 m) — vorher öffnete es auf B, der Projektion, und schwieg.
        const zS = await page.evaluate(async () => {
            const S = window.__gelaendeStudio;
            await S.ruhig();
            const z = S.zustand();
            const w = document.querySelector("#gelaende-studio .abweichung");
            return {
                zeigt: z.zeigt,
                abweichung: z.abweichung,
                sichtbar: !!(w && w.offsetParent !== null && w.textContent.trim()),
                text: w ? w.textContent.trim() : null,
            };
        });
        out.start0 = zS;
        console.log(
            `  Start über der fremden Welt: zeigt ${zS.zeigt} · Abweichung ${zS.sichtbar ? `„${zS.text}"` : "— (keine sichtbar)"}`
        );
        for (const f of startBefunde(zS, ["rampe", "Basis"])) befunde.push(f);
        // A = DIE GEBAUTE WELT: das Studio zeigt unter A die Welt, die steht — gemessen an der Welt selbst.
        const zA = await page.evaluate(async () => {
            const S = window.__gelaendeStudio;
            S.zeige("A");
            await S.ruhig();
            return S.zustand();
        });
        const weltA = await weltMessen(page);
        const aGleich = zA.makroSha === weltA.makroSha;
        const aStat = JSON.stringify(zA.statistik) === JSON.stringify(weltA.statistik);
        out.a = { welt: weltA, studio: { makroSha: zA.makroSha, statistik: zA.statistik } };
        console.log(
            `  A über der fremden Welt (Basis ${weltA.basis} m, Meer ${weltA.wasser} m, Terme ${weltA.terme.join("+")}): Makro ${String(zA.makroSha).slice(0, 16)} ${aGleich ? "=" : "≠"} Welt ${weltA.makroSha.slice(0, 16)} · Statistik ${aStat ? "=" : "≠"}`
        );
        if (weltA.basis !== 7 || weltA.terme.length < 2)
            befunde.push(
                `die fremde Welt steht nicht (Basis ${weltA.basis}, Terme ${weltA.terme.join("+")}) — A bliebe ungeprüft`
            );
        if (!aGleich)
            befunde.push(
                "A ≠ die gebaute Welt: das Studio zeigt unter A eine andere Welt als die, die steht (Makro-Abdruck)"
            );
        if (!aStat) befunde.push("A ≠ die gebaute Welt: die Statistik unter A ist nicht die der Welt");
        const z0 = await page.evaluate(async () => {
            window.__gelaendeStudio.zeige("B");
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
        // DIE LANDSCHAFTEN: jeder Knopf aus der Bedienung (`landschaften`, worlds/gelaende/bedienung.json), die Zahl-Leiste danach.
        const presets = await page.evaluate(async (LANDSCHAFTEN) => {
            const S = window.__gelaendeStudio;
            const aus = [];
            for (const P of LANDSCHAFTEN) {
                const k = document.querySelector(`#gelaende-studio [data-preset="${P.id}"]`);
                if (!k) {
                    aus.push({ id: P.id, fehlt: true });
                    continue;
                }
                k.click();
                await S.ruhig();
                const z = S.zustand();
                aus.push({
                    id: P.id,
                    traegt: z.zeigt === "B" && Object.keys(P.regler).every((id) => z.plan.regler[id] === P.regler[id]),
                    urteil: z.urteil,
                    schicht: z.schicht,
                    statistik: z.statistik && {
                        senken: z.statistik.senken1mJeKm2,
                        theta: z.statistik.flint.theta,
                        r2: z.statistik.flint.r2,
                        sanft: z.statistik.hammond.sanft,
                        plaetze: z.statistik.dorfplaetze,
                    },
                });
            }
            return aus;
        }, bedienung().landschaften);
        out.presets = presets;
        for (const p of presets) {
            const ziele = Object.entries(p.urteil || {})
                .map(([k, v]) => `${k} ${v === true ? "✓" : v === false ? "✗" : "–"}`)
                .join(" · ");
            const z = p.statistik
                ? ` (Senken ${p.statistik.senken}/km² · θ ${p.statistik.theta} R² ${p.statistik.r2} · Hammond ${p.statistik.sanft} · Plätze ${p.statistik.plaetze}${p.schicht ? ` · K/S/P ${p.schicht.kliff}/${p.schicht.schutt}/${p.schicht.pediment}` : ""})`
                : "";
            console.log(`    Preset ${p.id.padEnd(14)} ${p.fehlt ? "kein Knopf" : ziele}${z}`);
        }
        befunde.push(...presetBefunde(presets));
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
        const welt = await weltMessen(page);
        out.welt = welt;
        const gleich = welt.makroSha === studio.zustand.makroSha;
        const statGleich = JSON.stringify(welt.statistik) === JSON.stringify(studio.zustand.statistik);
        console.log(
            `  Welt: Makro ${welt.makroSha.slice(0, 16)} ${gleich ? "=" : "≠"} Studio · Statistik ${statGleich ? "=" : "≠"} (Senken ${welt.statistik.senken1mJeKm2}/km² · θ ${welt.statistik.flint.theta} · Dorfplätze ${welt.statistik.dorfplaetze})`
        );
        if (welt.seed !== plan.saat) befunde.push(`die Welt trägt die Saat ${welt.seed} statt ${plan.saat}`);
        if (!gleich) befunde.push("Makro-Abdruck Welt ≠ Studio — der Plan reiste nicht bit-gleich");
        if (!statGleich) befunde.push("Statistik Welt ≠ Studio");
        // DER SCHNEE DER KARTE IST DER SCHNEE DER WELT (EIN Farb-Gesetz): je Zelle des Rasters die Boden-Farbe der Welt
        // (`_bodenFarbeAt` an der Höhe, die sie baut) gegen den Schnee, den die Karte des exportierten Plans malt. Widerspruch:
        // die Karte malt Schnee (≥ 0,6), die Welt nicht — oder die Welt trägt Schnee (Luminanz ≥ 0,6 des Paletten-Schnees),
        // die Karte nicht (< 0,4). Die Karte malt in der Farbe der Palette (`terrain:PORTAL_GROUND`.schnee).
        const schneeVergleich = (n, schritt, x0, karte) => {
            const r = window.anazhRealm;
            const L = r._gelaende();
            const lum = (c) => 0.3 * c[0] + 0.59 * c[1] + 0.11 * c[2];
            const lS = lum(r.constructor.BODEN_FARBE.schnee);
            const PG = r.constructor.Gesetz("terrain:PORTAL_GROUND", null);
            const out = [0, 0, 0];
            let welt = 0;
            let karteOhneWelt = 0;
            let weltOhneKarte = 0;
            for (let j = 0; j < n; j++)
                for (let i = 0; i < n; i++) {
                    const k = i + j * n;
                    const x = x0 + i * schritt;
                    const z = x0 + j * schritt;
                    const h = r._terrainMacroSurfaceY(x, z, true);
                    if (!(h > L.waterLevel)) continue;
                    r._bodenFarbeAt(x, h, z, out);
                    const w = lum(out) >= 0.6 * lS;
                    const kk = karte ? karte[k] / 255 : 0;
                    if (w) welt++;
                    if (kk >= 0.6 && !w) karteOhneWelt++;
                    if (kk < 0.4 && w) weltOhneKarte++;
                }
            return { welt, karteOhneWelt, weltOhneKarte, palette: PG && PG.schnee };
        };
        const R0 = studio.zustand.raster;
        const sch = await page.evaluate(schneeVergleich, R0.n, R0.schritt, R0.x0, studio.zustand.schneeKarte);
        const hexZahl = (v) => (typeof v === "number" ? v : parseInt(String(v).replace(/^#|^0x/i, ""), 16));
        const pn = hexZahl(sch.palette);
        const kf = studio.zustand.schneeFarbe;
        sch.farbeGleich = !!kf && kf[0] === ((pn >> 16) & 255) && kf[1] === ((pn >> 8) & 255) && kf[2] === (pn & 255);
        out.schnee = sch;
        console.log(
            `  Schnee: Welt ${sch.welt} Zellen · Karte ohne Welt ${sch.karteOhneWelt} · Welt ohne Karte ${sch.weltOhneKarte} · Farbe der Karte ${kf ? kf.join(",") : "—"} ${sch.farbeGleich ? "=" : "≠"} Palette ${sch.palette}`
        );
        if (!studio.zustand.schneeKarte)
            befunde.push("die Karte nennt ihren Schnee nicht (schneeKarte) — die Schnee-Wand bliebe blind");
        else if (sch.welt < 30)
            befunde.push(
                `die Welt des Plans trägt zu wenig Schnee (${sch.welt} Zellen) — die Schnee-Wand bliebe ungeprüft`
            );
        if (sch.karteOhneWelt + sch.weltOhneKarte > 0.01 * Math.max(1, sch.welt))
            befunde.push(
                `die Karte zeigt anderen Schnee als die Welt: ${sch.karteOhneWelt} Zellen Schnee ohne Welt, ${sch.weltOhneKarte} Zellen Welt-Schnee ohne Karte (von ${sch.welt}) — makro-worker faerbe ≠ schnee des Kerns`
            );
        if (!sch.farbeGleich)
            befunde.push(`die Karte malt Schnee in ${kf} statt der Palette der Welt (${sch.palette})`);
        if (SELBSTTEST) {
            // die Schnee-Wand mit einem Täter: eine Karte, die keinen Schnee malt, MUSS jeden Welt-Schnee als Widerspruch nennen
            const leer = new Array(R0.n * R0.n).fill(0);
            const t = await page.evaluate(schneeVergleich, R0.n, R0.schritt, R0.x0, leer);
            const schneeSieht = sch.welt >= 30 && t.weltOhneKarte === t.welt;
            out.schneeSelbsttest = { schneeSieht, weltOhneKarte: t.weltOhneKarte };
            console.log(
                `  SELBSTTEST: die Schnee-Wand ${schneeSieht ? `nennt eine Karte ohne Schnee (${t.weltOhneKarte} Zellen Welt-Schnee ohne Karte)` : "BLIEB BLIND"}`
            );
            if (!schneeSieht) befunde.push("SELBSTTEST: die Schnee-Wand sieht eine Karte ohne Schnee nicht");
        }
        if (SELBSTTEST) {
            const sieht = welt.makroSha !== studio.shaSchritt && studio.shaSchritt !== studio.zustand.makroSha;
            out.selbsttest = { sieht };
            console.log(
                `  SELBSTTEST: ein Schritt am Regler „hoehe" ${sieht ? "ändert den Abdruck (die Linse sieht ihn)" : "BLIEB UNSICHTBAR"}`
            );
            if (!sieht) befunde.push("SELBSTTEST: der Abdruck sieht einen Regler-Schritt nicht");
            // die Start-Wand mit dem Täter von vorher: der Start auf B, keine Abweichung genannt
            const startNennt = startBefunde({ zeigt: "B", abweichung: undefined, sichtbar: false }, ["rampe", "Basis"]);
            const startStill = startBefunde({ zeigt: "A", abweichung: ["rampe", "Basis 7 m → 0 m"], sichtbar: true }, [
                "rampe",
                "Basis",
            ]);
            const startSieht = startNennt.length === 4 && startStill.length === 0;
            out.selbsttest.startSieht = startSieht;
            console.log(
                `  SELBSTTEST: die Start-Wand ${startSieht ? "nennt den Täter (Start auf B, Rampe und Basis verschwiegen, nichts sichtbar)" : "BLIEB BLIND"}`
            );
            if (!startSieht)
                befunde.push(
                    "SELBSTTEST: die Start-Wand sieht den Start auf B oder die verschwiegene Abweichung nicht"
                );
            // die Preset-Wand mit Tätern: ein Ziel außerhalb des Korridors, und keine Landschaft mit Schicht-Gesetz
            const nennt = presetBefunde([
                {
                    id: "taeter",
                    traegt: true,
                    urteil: { senken: false, flint: true, hammond: true, dorfplaetze: true, schicht: null },
                },
            ]);
            const presetSieht =
                nennt.some((b) => /taeter: senken außerhalb/.test(b)) &&
                nennt.some((b) => /kein Preset trägt das Schicht-Gesetz/.test(b));
            out.selbsttest.presetSieht = presetSieht;
            console.log(
                `  SELBSTTEST: die Preset-Wand ${presetSieht ? "nennt den Täter (senken, kein Schicht-Gesetz)" : "BLIEB BLIND"}`
            );
            if (!presetSieht)
                befunde.push("SELBSTTEST: die Preset-Wand sieht ein Preset außerhalb des Korridors nicht");
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

// ── DER GEBAUTE BODEN (K16, Prüfung 1, `--gebaut`): dieselbe Linse (`statistik`) am Boden, den der Spieler betritt
// (`_voxelSurfaceY`: Gesetz, Höhle, Hydrosphären-Kanal und See-Becken) neben der Makro-Höhe des Gesetzbuchs, je Saat der
// Realismus-Wand (die Boot-Saat und zwei frische: Regenesis der Ströme, die Hydrosphäre neu), 2 × 2 km um den Ursprung (die
// Heimat-Kachel der Hydrosphäre), 30 m. Die Makro-Wand (`--realismus`) war grün, während der gebaute Boden rot war: 3,94–
// 11,05 Senken > 1 m je km², 1–3 Dorfplätze (Prüfung 1, gegenmessung-3saaten-1110f.json). Ziel je Saat: Senken > 1 m ≤ 1 je
// km², ≥ 3 Dorfplätze, und die Hydrosphäre trägt Flüsse. Der Täter steht beim Namen: derselbe Boden ohne den Kanal (das Flag
// des Hydro-Baus unterdrückt ihn) — ohne den Kanal grün → der Kanal (`_hydroNetzFluesse` → `_hydrosphereCarveAt`). Mit
// `--selftest` im selben Boot: die Bett-Tiefe des alten Gesetzes (1,4 m + 0,16 · Breite, ohne `kanalTiefe`) MUSS die
// Boot-Saat rot färben.
async function gebaut(page, fehler) {
    const b = await boote(page);
    if (!b.ok) {
        console.log("  ⛔ GEBAUT: Boot nicht bereit nach 120 s");
        return 1;
    }
    const { alle, stoerung } = await page.evaluate(
        async (saaten, selbst) => {
            const r = window.anazhRealm;
            const s = r.state;
            const t0 = performance.now();
            while (!(s.hydrosphere && s.hydrosphere.ready) && performance.now() - t0 < 60000) {
                try {
                    r._gameLoopTick(performance.now());
                } catch (_e) {
                    /* der Boot reift */
                }
                await new Promise((res) => setTimeout(res, 16));
            }
            r._gameLoopTick = () => {}; // die Welt steht still
            const G = window.__gelaendeCore;
            const wl = s.waterLevel;
            const S = 30,
                n = 67,
                x0 = -990;
            const raster = (f) => {
                const H = new Array(n * n);
                for (let j = 0; j < n; j++) for (let i = 0; i < n; i++) H[i + j * n] = f(x0 + i * S, x0 + j * S);
                return H;
            };
            const kurz = (st) => ({
                senken: st.senken1mJeKm2,
                dorf: st.dorfplaetze,
                minima: st.minimaJeKm2,
                theta: st.flint.theta,
                r2: st.flint.r2,
            });
            // DER MÄANDER IM WASSER (K16): die Fluss-Punkte der Hydrosphäre (Kanal und Spiegel liegen darauf) in Fenstern von
            // 400 m Bogen, flach (Gefälle < 0,4 %, nicht im See) — die Sinuosität Bogen / Sehne je Fenster, ihr Median.
            const maeanderWasser = (h) => {
                const sin = [];
                for (const rv of (h && h.rivers) || []) {
                    const P = rv.points;
                    let k0 = 0;
                    let bogen = 0;
                    for (let k = 1; k < P.length; k++) {
                        bogen += Math.hypot(P[k].x - P[k - 1].x, P[k].z - P[k - 1].z);
                        if (bogen < 400) continue;
                        const flach = (P[k0].y - P[k].y) / bogen < 0.004 && !P.slice(k0, k + 1).some((p) => p.inLake);
                        if (flach) sin.push(bogen / Math.hypot(P[k].x - P[k0].x, P[k].z - P[k0].z));
                        k0 = k;
                        bogen = 0;
                    }
                }
                sin.sort((a, b) => a - b);
                return { fenster: sin.length, sinuositaet: sin.length ? +sin[sin.length >> 1].toFixed(3) : null };
            };
            // der Selbsttest je Saat — die Gerade: jedes Glied nur seine Sehne (Knoten zu Knoten), dieselbe Hydrosphäre neu
            // gerechnet; der Mäander im Wasser MUSS rot werden (danach die Hydrosphäre des Gesetzes zurück)
            const geradeMessung = () => {
                const kern = window.__gelaendeCore;
                // dieselben Punkte der Bahn, auf die Sehne gelegt (der Versatz quer fällt, t bleibt)
                const gerade = (gl) => {
                    const ex = gl.bx - gl.ax;
                    const ez = gl.bz - gl.az;
                    const len = Math.hypot(ex, ez) || 1;
                    return gl.bahn.map((p) => ({
                        t: p.t,
                        x: gl.ax + ex * p.t,
                        z: gl.az + ez * p.t,
                        s: len * p.t,
                        fx: ex / len,
                        fz: ez / len,
                    }));
                };
                window.__gelaendeCore = {
                    ...kern,
                    flussLaeufe: (...a) =>
                        kern.flussLaeufe(...a).map((lf) => ({
                            ...lf,
                            glieder: lf.glieder.map((gl) => ({ ...gl, bahn: gerade(gl) })),
                        })),
                };
                let m;
                try {
                    m = maeanderWasser(r._computeHydrosphere());
                } finally {
                    window.__gelaendeCore = kern;
                }
                s.hydrosphere = r._computeHydrosphere();
                return m;
            };
            const bootSaat = s.worldMeta.seed;
            const bootMacro = s.worldMeta.macro;
            // die chirurgische Regenesis der Abdruck-Probe (die Ströme; das Netz des Gesetzbuchs ist je Saat gemerkt), dazu die
            // Hydrosphäre der Saat (ihre Kacheln fallen)
            const regenesis = (saat, macro) => {
                s.worldMeta.seed = saat;
                r._voxelNoise = null;
                if (macro !== undefined) s.worldMeta.macro = macro;
                else delete s.worldMeta.macro;
                s.hydroTiles = new Map();
                s.hydrosphere = r._computeHydrosphere();
            };
            const out = [];
            for (const saat of [bootSaat, ...saaten.filter((x) => x !== bootSaat)]) {
                if (saat !== bootSaat) regenesis(saat, undefined);
                const Hm = raster((x, z) => r._terrainMacroSurfaceY(x, z, true));
                const voll = raster((x, z) => r._voxelSurfaceY(x, z)).map((v, k) => (Number.isFinite(v) ? v : Hm[k]));
                r._hydroComputing = true;
                const ohne = raster((x, z) => r._voxelSurfaceY(x, z)).map((v, k) => (Number.isFinite(v) ? v : Hm[k]));
                r._hydroComputing = false;
                const h = s.hydrosphere;
                out.push({
                    seed: saat,
                    hydro: !!(h && h.ready),
                    fluesse: h && h.rivers ? h.rivers.length : 0,
                    maeander: maeanderWasser(h),
                    maeanderGerade: selbst ? geradeMessung() : null,
                    voll: kurz(G.statistik(voll, n, S, wl, [], 0)),
                    ohneKanal: kurz(G.statistik(ohne, n, S, wl, [], 0)),
                    makro: kurz(G.statistik(Hm, n, S, wl, [], 0)),
                });
            }
            if (s.worldMeta.seed !== bootSaat) regenesis(bootSaat, bootMacro);
            let stoerung = null;
            if (selbst) {
                // die Störung: die Bett-Tiefe des alten Gesetzes (der Kanal als Graben unter der Aue)
                const A = r.constructor;
                const HC = A.HYDROSPHERE;
                const tiefe = A._flussTiefe;
                A._flussTiefe = (p) => (HC.carveBedMin + (HC.carveBedK * p.width) / p.quelle) * p.quelle;
                s.hydrosphere = r._computeHydrosphere();
                const Hm = raster((x, z) => r._terrainMacroSurfaceY(x, z, true));
                const gestoert = raster((x, z) => r._voxelSurfaceY(x, z)).map((v, k) =>
                    Number.isFinite(v) ? v : Hm[k]
                );
                A._flussTiefe = tiefe;
                s.hydrosphere = r._computeHydrosphere();
                stoerung = kurz(G.statistik(gestoert, n, S, wl, [], 0));
            }
            return { alle: out, stoerung };
        },
        REALISMUS_SAATEN,
        SELBSTTEST
    );
    const gruen = (x) => x.senken <= 1 && x.dorf >= 3;
    // der Mäander im Wasser: Median der Sinuosität der flachen 400-m-Fenster ≥ 1,25 (ohne flaches Fenster kein Urteil)
    const maeanderGut = (m) => !m.fenster || m.sinuositaet >= 1.25;
    let rot = !!fehler();
    for (const out of alle) {
        console.log(
            `\n========= DER GEBAUTE BODEN — Natur-Zahlen am Boden des Spielers (Saat ${out.seed}, 2 × 2 km, 30 m, ${out.fluesse} Flüsse) =========`
        );
        for (const k of ["voll", "ohneKanal", "makro"])
            console.log(
                `  ${k}: Senken>1m ${out[k].senken}/km² · Dorfplätze ${out[k].dorf} · Minima ${out[k].minima}/km² · θ ${out[k].theta} R² ${out[k].r2}`
            );
        console.log(
            `  Mäander im Wasser: ${out.maeander.fenster} flache 400-m-Fenster · Sinuosität ${out.maeander.sinuositaet} (Soll ≥ 1,25)`
        );
        if (!maeanderGut(out.maeander)) {
            rot = true;
            console.log(
                "  ⛔ das Wasser läuft gerade: die Fluss-Punkte folgen der Sehne, nicht der Bahn (`_hydroNetzFluesse` liest `bahn` des Kerns)"
            );
        }
        if (!out.hydro || !out.fluesse) {
            rot = true;
            console.log(
                "  ⛔ LEER: die Hydrosphäre stand nicht oder trägt keinen Fluss (die Linse mäße den Boden ohne Wasser)"
            );
        }
        if (!gruen(out.voll)) {
            rot = true;
            console.log(
                gruen(out.ohneKanal)
                    ? "  ⛔ der Hydrosphären-Kanal fräst den Boden: ohne ihn grün (`_hydroNetzFluesse` → `_hydrosphereCarveAt`)"
                    : "  ⛔ der Boden ohne Kanal ist rot: Höhle oder Gesetz (`_terrainBaseDensityAtCol`)"
            );
        }
    }
    if (SELBSTTEST) {
        const st = stoerung;
        // die Gerade zählt an jeder Saat mit flachen Fenstern — mindestens eine, und jede davon rot
        const mit = alle.filter((o) => o.maeanderGerade && o.maeanderGerade.fenster);
        const sieht = mit.length > 0 && mit.every((o) => !maeanderGut(o.maeanderGerade));
        console.log(
            `  Selbsttest-Gerade (jedes Glied seine Sehne): ${mit.map((o) => `${o.seed} ${o.maeanderGerade.fenster} Fenster, Sinuosität ${o.maeanderGerade.sinuositaet}`).join(" · ") || "keine Saat mit flachem Fenster"} → ${sieht ? "✅ rot erkannt" : "⛔ blind"}`
        );
        if (!sieht) rot = true;
        const blind = !st || (st.senken <= 1 && st.dorf >= 3);
        console.log(
            `\n  Selbsttest-Störung (Bett-Tiefe des alten Gesetzes, Saat ${alle[0].seed}): Senken>1m ${st ? st.senken : "–"}/km² · Dorfplätze ${st ? st.dorf : "–"} → ${blind ? "⛔ SELBSTTEST ROT: die Störung blieb unentdeckt" : "✅ SELBSTTEST GRÜN: die Störung färbt den Boden rot"}`
        );
        if (blind) rot = true;
    }
    console.log(
        `\n${rot ? "⛔ GEBAUTER BODEN ROT" : `✅ GEBAUTER BODEN GRÜN: Senken und Dorfplätze im Korridor, ${alle.length} Saaten`}\n`
    );
    return rot ? 1 : 0;
}

(async () => {
    if (argv.includes("--realismus")) process.exit(realismus());
    if (argv.includes("--studio")) process.exit(await studioProbe());
    await new Promise((r) => server.listen(PORT, r));
    const browser = await starteBrowser({ art: "standard", frist: 900000 });
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

    if (argv.includes("--gebaut")) process.exit(await gebaut(page, () => pageErr));
    console.log("\n========= DER DICHTE-SPIEGEL — Main _voxelEditedDensityGrid == Worker computeDensityGrid =========");
    const berichte = [];
    let rot = false;
    // DIE ABSENZ (plan §10 R1): der Name der Bühne steht nur in spec/ und in der Werkbank — der Stamm, der Worker und der
    // Seh-Spiegel lesen Zahlen (Terme, Wildnis-Gewicht), nie einen Namen (kein Flag unter anderem Namen).
    const NAME = /pruefbuehne|prüfbühne/i;
    for (const datei of [...stammLib.dateien(root), "voxel-worker.js"]) {
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
        const fe = rep.ferne;
        console.log(
            fe
                ? `    Höhen der Ferne (Main-Scheiben = Voxel-Faden): ${fe.n} Punkte · abweichend ${fe.abweichend}` +
                      (fe.erste
                          ? ` — erste bei (${Math.round(fe.erste.x)}|${Math.round(fe.erste.z)}) Detail ${fe.erste.detail}`
                          : "")
                : "    Höhen der Ferne: kein Voxel-Faden — keine Probe"
        );
        if (!fe || fe.abweichend > 0) rot = true;
        const wa = rep.wald;
        console.log(
            wa
                ? `    Stoff des Walds (Main = Voxel-Faden, Teil W): ${wa.zellen} Zellen · ${wa.darts} Darts · abweichend ${wa.abweichend}` +
                      (wa.erste
                          ? ` — erste Zelle ${wa.erste.gx},${wa.erste.gz} am Ort ${wa.erste.ort}: Main ${JSON.stringify(wa.erste.main)} · Faden ${JSON.stringify(wa.erste.faden)}`
                          : "")
                : "    Stoff des Walds: kein Voxel-Faden oder keine Wahrheit — keine Probe"
        );
        if (welt === "standard" && (!wa || !(wa.darts > 0) || wa.abweichend > 0)) rot = true;
        if (rep.abweichend > 0 || rep.befunde.length) rot = true;
        if (SELBSTTEST && welt === "standard") {
            const v = await probeVerfaelscht(page);
            selbst = {
                abweichend: v.abweichend,
                maxDiff: v.maxDiff,
                gitter: v.gitter,
                ferne: v.ferne ? v.ferne.abweichend : 0,
                wald: v.wald ? v.wald.abweichend : 0,
            };
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
        // die Höhen der Ferne (K60) fallen mit demselben verfälschten Worker-Term rot
        pass = !rot && selbst && selbst.abweichend > 0 && selbst.ferne > 0 && selbst.wald > 0;
        console.log(`  SELBSTTEST Stoff des Walds: ${selbst ? selbst.wald : "?"} abweichende Zellen (Soll > 0)`);
        console.log(`  SELBSTTEST Höhen der Ferne: ${selbst ? selbst.ferne : "?"} abweichende Punkte (Soll > 0)`);
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
