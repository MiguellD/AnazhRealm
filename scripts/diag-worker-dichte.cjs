#!/usr/bin/env node
// gate:worker-dichte — DER DICHTE-SPIEGEL Main ↔ voxel-worker ist BYTE-GENAU.
//
// Der Worker baut die Dichte-Gitter der Chunks OFF-THREAD (`computeDensityGrid`), der Main den Spieler-Chunk und jeden
// Edit-Rebuild selbst (`_voxelEditedDensityGrid`); beide rufen das EINE Gesetz des Kerns (gelaende-core `dichteGitter` ·
// `gitterMitEdits`). Weichen beide ab,
// lebt der Boden auf zwei Wahrheiten (Naht, Kollision gegen ein anderes Bild).
//
// Je Welt (Standard: der Boot-Seed; Bühne: spec/pruefbuehne/welt.json, importiert wie im Spiel) und je Ort (die
// Messorte des Haushalts, ein Fluss-Chunk; auf der Bühne ihre Stationen) wird das Gitter jeder LOD-Stufe 0–3 im
// Main (`_voxelEditedDensityGrid`, frischer Cache-Schlüssel) und im Worker (`density-grid`) gebaut und Wort für
// Wort (Float32-Bitmuster) verglichen — zuerst ohne Edits, dann DIE HÜLLE am ersten Ort: ein Turm aus Füll-Edits bis
// ÜBER das Band und ein Graben (der Main legt den Edit auf jede Ecke seines Kastens, der Worker ebenso über dem Band),
// Main = Worker = das Gesetz des Kerns.
//
//   node scripts/diag-worker-dichte.cjs [--welten standard,buehne] [--json datei]
//   node scripts/diag-worker-dichte.cjs --selftest     der Faden lädt den Kern mit der Höhe + 1 cm — er MUSS rot werden
//   node scripts/diag-worker-dichte.cjs --kern [--selftest] [--json datei]
//                                                      die Kern-Probe (Kopf von `kernProbe`)
//   node scripts/diag-worker-dichte.cjs --abdruck datei [--wurzel dir]
//                                                      der BYTE-ABDRUCK beider Welten (SHA-256 je Gitter, Main UND
//                                                      Worker, und der Makro-Höhe auf einem 64×64-Gitter für drei
//                                                      Welt-Saaten und das Prüfbühnen-Erbgut) — gegen
//                                                      einen anderen Stand (`--wurzel` = sein Baum) verglichen beweist er
//                                                      „byte-gleich"
// Port: WORKER_DICHTE_PORT (Default 4392). Exit 1 bei Drift, Längen-Mismatch, Page-Error oder rotem Selbsttest.
"use strict";
const { statikServer, nullRenderer, starteBrowser, hauptLauf, argOpt: opt, booteWelt } = require("./lib/welt-boot.cjs");
const fs = require("fs");
const liesText = (datei) => fs.readFileSync(datei, "utf8");
const path = require("path");
const stammLib = require("./lib/stamm.cjs");
const { messort } = require("./lib/welt-orte.cjs");
const { WASSER_INSTALL } = require("./lib/wasser-linse.cjs");

const argv = process.argv.slice(2);
const SELBSTTEST = argv.includes("--selftest");
const ECHT = argv.includes("--echt");
const LADEN = { waitUntil: "domcontentloaded", timeout: 60000 };
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
    JSON.parse(liesText(path.resolve(__dirname, "..", "worlds", "gelaende", "bedienung.json")));

const server = statikServer({ root, keinCache: true, wandle: kernWandle });

// Die Probe in der Seite: Orte × LOD 0–3, Main gegen Worker, Bitmuster je Wort.
async function probe(page, welt, mitAbdruck, zwilling = false) {
    return page.evaluate(
        async (welt, mitAbdruck, punkte, messorte, N_TURM, zwilling) => {
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
            const hex = window.__sha;
            const warteAck = (nachricht) => r._voxelFadenAuftrag(s.voxelWorker, nachricht);
            const stand = () => r._voxelWorkerSyncState({ op: "state-set" });
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
                if (mitAbdruck) {
                    z.shaMain = await hex(main);
                    z.shaWorker = await hex(worker);
                }
                return z;
            };
            // (1) ohne Edits
            const editsVorher = s.worldMeta.voxelEdits;
            s.worldMeta.voxelEdits = [];
            await stand();
            for (const ort of orte) {
                const zeilen = [];
                for (let lod = 0; lod <= 3; lod++) zeilen.push(await vergleiche(ort, lod, "rein"));
                out.orte.push({ id: ort.id, x: ort.x, z: ort.z, zeilen });
            }
            // (1b) DIE FLUT-SAAT: der Neubau eines Chunks mit einem Schnitt im 3×3 geht über den Worker, die Flut über
            // die Naht reist als Saat mit dem Auftrag (`_flutSaat`). Am Chunk des ersten Orts, unter einem Wassertisch 20 m über
            // seinem höchsten Grund (jede Spalte ist Grundwasser-Quelle, `_aquiferTrocken`), dieselbe Saat (jede Rand-Spalte
            // nass) im Sync-Bau des Mains (`_buildVoxelChunkWaterCells`) und im Worker (`chunk-mesh`, samt dem Stempel der Werke,
            // den der Main danach setzt): die Wasser-Zellen Wort für Wort gleich, und die Saat ändert sie in beiden (ohne Wirkung
            // wäre die Probe stumpf).
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
                await stand();
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
                    await stand();
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
            // (2) DIE HÜLLE (F2a „hoch bauen", Karte editform-kern): die Form des Edits ist EIN Gesetz des Kerns (gelaende-core
            // `editForm` · `editReich` · `mitEdits` · `editsImGitter` · `bandUmEdits`). Ein Turm aus N_TURM Füll-Edits über den
            // Spielpfad (`_addVoxelEdit`, r 3,5 wie der Hieb), jeder auf der Krone des vorigen (`_voxelSurfaceY`), bis über das
            // Band, dazu ein Graben an seinem Fuß (Hub und Hülle: gate:fall-waechter B; die Leser gegen den Kern: `--kern`). Die
            // Wache des Fern-Rings (`_fernRingDeckWache`, 640 Probe-Ecken) weckt genau die Ecken in der Reichweite; jenseits ändert
            // sich keine Fläche. `zwilling` (Selbsttest): die alte Reichweite r + 4 m — FERN-RING MUSS beim Namen rot werden.
            const o0 = orte[0];
            s.worldMeta.voxelEdits = [];
            await stand();
            const G = globalThis.__gelaendeCore;
            const [R, tx, tz] = [3.5, o0.x + 0.37, o0.z + 0.61];
            const naht = [];
            for (let a = 0; a < 640; a++) {
                const [w, q] = [((a % 16) * Math.PI) / 8, 0.5 + Math.floor(a / 16) / 2];
                naht.push({ li: a, g: a, x: tx + Math.cos(w) * q, z: tz + Math.sin(w) * q });
            }
            const vor = naht.map((p) => r._voxelSurfaceY(p.x, p.z));
            const y0 = r._voxelSurfaceY(tx, tz);
            let krone = y0;
            for (let k = 0; k < N_TURM; k++) {
                r._addVoxelEdit(tx, krone, tz, R, "fill");
                krone = r._voxelSurfaceY(tx, tz);
            }
            r._addVoxelEdit(tx + 6, y0, tz - 2, 2.5, "carve");
            const alle = s.worldMeta.voxelEdits;
            const fr = {
                zoneVerts: 640,
                teilung: { randV: new Uint8Array(640).fill(1) },
                feldY: new Float32Array(640),
                schalen: [],
                geos: [],
            };
            [fr.feldEdits, fr.feldEditsN, r._fernRingPunkt, r._standRuht] = [alle, 0, (f, i) => naht[i], () => true];
            const reich = (p) => alle.some((e) => (p.x - e.x) ** 2 + (p.z - e.z) ** 2 < G.editReich(e) ** 2);
            if (zwilling) globalThis.__gelaendeCore = { ...G, editReich: (e) => e.r + 4 };
            r._fernRingDeckWache(fr);
            globalThis.__gelaendeCore = G;
            for (const k of ["_fernRingPunkt", "_standRuht"]) delete r[k];
            const fehlt = naht.filter((p, i) => reich(p) === (fr.feldY[i] === fr.feldY[i])).length;
            const jenseits = naht.filter((p, i) => !reich(p) && r._voxelSurfaceY(p.x, p.z) !== vor[i]).length;
            out.huelle = { fern: `${naht.filter(reich).length} von 640 Ecken in der Reichweite` };
            if (fehlt)
                out.befunde.push(
                    `FERN-RING (_fernRingDeckWache): ${fehlt} Ecken der Naht gegen die Reichweite geweckt`
                );
            if (jenseits) out.befunde.push(`REICHWEITE (editReich): ${jenseits} Flächen ändern sich jenseits von ihr`);
            // (3) DIE EDIT-WAHRHEIT (K23: 300 Edits, Karte = Liste) misst `--kern`.
            s.worldMeta.voxelEdits = editsVorher;
            await stand();
            // Der Abdruck der Makro-Höhe für den Byte-Beweis: die Punkte des Kerns (`abdruckFeld`), die Höhe der Welt.
            const makroSha = async () =>
                hex(Float64Array.from(punkte, ([x, z, mitDetail]) => r._terrainMacroSurfaceY(x, z, mitDetail)));
            // DIE LESER der Formeln, die der Kern seit der Prüfung 1 trägt: die Boden-Farbe des Mains auf 32×32
            // Punkten in drei Höhen über der Makro-Höhe (die Schneegrenze `schnee` des Kerns greift erst
            // hoch), die Fels-Exposition (die Steilheit an der Makro-Höhe statt am Chunk-Cache) und die
            // Normalform des Erbguts (`erbgutNormal`); dazu die Farben, die der Worker in
            // seine Chunks legt (`attachFieldColors`, LOD 0 je Ort).
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
                // DREI WELT-SAATEN: der Boot-Seed und zwei frische Saaten in der Form `w-<12>-<6>` — je Saat die
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
            // Das lebende Erbgut (die Bühne MUSS ihre Terme tragen, sonst verglich die Linse eine Wildnis-Welt).
            const E = r._erbgut();
            out.erbgut = { terme: E.terme.map((t) => t.art), wildnis: E.wildnis, hash: E.hash };
            out.hoehen = orte.map((o) => ({ id: o.id, y: +r._terrainMacroSurfaceY(o.x, o.z).toFixed(3) }));
            // DIE HÖHEN DER FERNE (K60, B2): der Fern-Faden rechnet die Punkte von Fern-Ring, Feld-Pass und Fern-Krone
            // (`_fernAuftrag`) — dieselben Punkte (48 × 48 über ±4 km um den Spieler), Makro und Detail, Höhe und Schutt, gegen
            // das Gesetzbuch im Main (`_terrainMacroSurfaceY`): Wort für Wort gleich (Float32-Bitmuster).
            if (r._getVoxelWorker()) {
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
            // TEIL W — DER STOFF DES WALDS: die Darts der Wald-Zellen um jeden Ort (9 × 9 Zellen) im Main
            // (`_forestCellDarts`, frisches Gedächtnis) und im Voxel-Faden (`_voxelWorkerWaldDarts`, entpackt über
            // `_waldDartsEntpacken`, wie die Schlange des Walds sie ins Gedächtnis legt) — jede Zelle Wort für Wort gleich (JSON ihrer Darts). Die Streu wartet auf die Darts des Fadens;
            // drifteten sie, stünde die Gestalt der Ferne auf einer anderen Wahrheit als der Wald der Nähe.
            if (r._getVoxelWorker() && r._forestGesetzWahr()) {
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
        ["wiese", "genesis"].map((id) => ((o) => ({ id, x: o.x, z: o.z }))(messort(id))),
        10,
        zwilling
    );
}

// TEIL S (Lehre 14, B-K2): kein Chunk-Stoff im Haupt-Faden vor dem Ack des Fadens. Der Ack hängt, der Strom fragt den
// Spieler-Chunk in L3 und die Dichte: Soll pending, kein voller Stand (`voxelWorkerStateGen`), die Dichte kommt, und der Boot
// meldete keinen Bau am Faden vorbei („FADEN-UMGANGEN", `_fadenUmgangen`). DIE REIHE (streaming.K5, Lehre 24): der Auftrag geht im Ruf hinaus (`sofort`) — wartet er
// einen Mikro-Takt, überholt ihn eine Freigabe im selben Takt (`zellen-frei`), das Wasser-Blatt fragt nach, und der Main klont
// die Zellen des Fadens zurück (an 607d0c73 0,27 MB je Minute Fahrt). `urform` (Selbsttest): Stufe 3, ein init vor dem Ack und
// der wartende Auftrag (die Form bis sk5-kopie).
const STROM_SOLL = "pending · volle Stände 0 · Dichte true · Brüche 0 · Reihe sofort";
async function strom(page, urform) {
    return page.evaluate(async (urform) => {
        const r = window.anazhRealm;
        const s = r.state;
        const [w, ack, gen, p] = [s.voxelWorker, s.voxelWorkerReady, s.voxelWorkerStateGen, s.lastPlayerVoxelChunk];
        s.voxelWorkerReady = false;
        if (urform)
            r._voxelWorkerSyncState(),
                (r._voxelFadenAuftrag = async (...x) => (await 0, AnazhRealm.prototype._voxelFadenAuftrag.apply(r, x)));
        const a = urform ? r._buildVoxelChunkData(p.cx, p.cz, 3) : r._acquireVoxelChunkBuild(p.cx, p.cz, 3, {});
        let reihe = "verzögert";
        w.postMessage = function () {
            reihe = "sofort";
            Worker.prototype.postMessage.apply(w, arguments);
        };
        const d = r._voxelWorkerComputeDensity(0, 0, 0, 2, 2, 2, 1.8);
        s.voxelWorkerReady = ack;
        delete w.postMessage;
        delete r._voxelFadenAuftrag;
        const da = (await d).length > 0; // der Auftrag reist hinter dem init, der hängende Ack hält ihn nie
        const bruch = [...(r._bruchBuch || new Map()).keys()].filter((t) => t.startsWith("FADEN-UMGANGEN")).length;
        return `${a === "pending" ? a : "Stufe 3"} · volle Stände ${s.voxelWorkerStateGen - gen} · Dichte ${da} · Brüche ${bruch} · Reihe ${reihe}`;
    }, urform);
}

// Der Selbsttest: der Voxel-Faden lädt den Kern mit der Höhe + 1 cm — die Probe MUSS ihn bei Ort, Gitter, Ferne und Wald nennen.
async function probeVerfaelscht(page, url) {
    KERN_MODUS.faden = "Höhen-Versatz";
    try {
        await frischBoot(page, url);
        return await probe(page, "standard", false, true);
    } finally {
        KERN_MODUS.faden = null;
    }
}
// Eine frische Standard-Welt (kein Rest im Profil), bis Main und Faden stehen.
async function frisch(page, url) {
    await page.goto(url, LADEN);
    await page.evaluate(() => localStorage.clear());
    await page.reload(LADEN);
}
async function frischBoot(page, url) {
    await frisch(page, url);
    if (!(await booteWelt(page)).ok) throw new Error("der Boot stand nicht (" + JSON.stringify(KERN_MODUS) + ")");
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
    if (rep.huelle) console.log(`    Hülle: Fern-Ring ${rep.huelle.fern}`);
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

// ── DIE KERN-PROBE (`--kern`, gelaende.K1 Staffel 2): dichte, editForm und Spiegel sind EIN Gesetz des Kerns — an 10⁵ Punkten
// rechnen Stamm-Leser, jeder Voxel-Faden und eine frische Instanz des Kerns Wort für Wort gleich; je Mutation der festen Liste
// (der Server liefert den Kern verändert aus) ziehen beide Leser. Selbsttest: liest einer den unveränderten Kern, nennt die
// Probe ihn beim Namen.
const KERN_MUTATIONEN = {
    "Edit-Stärke": ["tiefeM: 4, rundM: 1", "tiefeM: 5, rundM: 1"],
    "Edit-Radius": ["if (!(ed.r > 0)) return n;", "if (!(ed.r > 0)) return n;\n        ed = { ...ed, r: ed.r * 1.1 };"],
    "Dichte-Versatz": ["let d = surf - y;", "let d = surf - y + 0.25;"],
    "See-Spiegel": ["const y = h.water.waterY[i];", "const y = h.water.waterY[i] + 0.5;"],
    "Höhen-Versatz": ["let h = hoeheGrund(L, x, z, mitDetail, aus);", "let h = hoeheGrund(L, x, z, mitDetail, aus) + 0.01;"],
};
const KERN_MODUS = { haupt: null, faden: null, probe: null }; // je Boot die Mutation im Haupt-Faden, im Voxel-Faden, in der Probe
const kernQuelle = (wurzel = root) => fs.readFileSync(path.join(wurzel, "gelaende-core.js"), "utf8"); // der EINE Leser des Kerns
const kernMutiert = (roh, name) => String(roh).replace(...(KERN_MUTATIONEN[name] || ["", ""]));
function kernWandle(p, roh) {
    if (p === "/gelaende-core.js" && KERN_MODUS.haupt) return kernMutiert(roh, KERN_MODUS.haupt);
    if (p === "/gelaende-core.faden.js") return kernMutiert(kernQuelle(), KERN_MODUS.faden);
    if (p !== "/voxel-worker.js" || !roh || KERN_MODUS.faden === KERN_MODUS.haupt) return roh;
    return String(roh).replace('"gelaende-core.js"', '"gelaende-core.faden.js"');
}
// in Seite und Faden: die Leser an den Punkten, je Wert eine JSON-Zahl (−0, NaN, ±Infinity als Text)
const KERN_HILFE = `self.__kern = {
    an: (a) => Array.from(a, (v) => (Object.is(v, -0) ? "-0" : Number.isFinite(v) ? v : String(v))),
    lies: (P, d, sp, ko, fl) => [d, sp, ko, (x, y, z) => ((f) => (f ? f.surfaceY : NaN))(fl(x, z))].map((f) =>
        __kern.an(Array.from({ length: P.length / 3 }, (_, i) => f(P[i * 3], P[i * 3 + 1], P[i * 3 + 2])))),
}`;

// Der Plan am unveränderten Kern: Kanal, See-Becken und Höhle nächst der Mess-Wiese, 20 Edits und 280 Schnitte über die Chunk-Naht
// (K23: kein Edit fällt still), je Ort N Punkte über keinem Keller.
async function kernPlan(page, M, N) {
    return page.evaluate(
        async (MX, MZ, N) => {
            const r = window.anazhRealm;
            const zufall = ((z) => (w) => (z() * 2 - 1) * w)(wasserZufall(0x2545f491));
            const { fluss: kanal, see } = await window.__wasserOrte({ mess: [MX, MZ] });
            const hoehle = ((h) => h && { x: h.x, y: h.grund + 1.5, z: h.z })(window.__weltOrt("hoehle", { mitte: [MX, MZ], schritt: 24 }));
            if (!kanal || !see || !hoehle) return { fehler: "keinen Kanal, See oder keine Höhle nahe der Mess-Wiese" };
            const [edits, span] = [[], r._voxelChunkConfig().span];
            for (const [o, n, w] of [[kanal, 6, 10], [see, 4, 16], [hoehle, 4, 6], [{ x: MX, z: MZ }, 6, 30]])
                for (let i = 0; i < n; i++) {
                    const [x, z] = [o.x + zufall(w), o.z + zufall(w)];
                    const y = (o === hoehle ? o.y : r._voxelSurfaceY(x, z)) + zufall(o === hoehle ? 3 : 0.5);
                    edits.push({ x, y, z, r: 3 + zufall(1.5), mode: i % 2 ? "fill" : "carve" });
                }
            for (let i = 0; i < 280; i++) {
                const [x, z] = [Math.floor(MX / span) * span + span - 20 + (i % 20) * 2, Math.floor(MZ / span) * span + 6 + ((i / 20) | 0) * 2];
                edits.push({ x, y: r._terrainMacroSurfaceY(x, z) - 1, z, r: 2.5, mode: "carve" });
            }
            const [fk, bett] = [r._terrainMacroSurfaceY(kanal.x, kanal.z), r._hydrosphereLakeAt(see.x, see.z).bedY];
            const wurf = [
                () => [hoehle.x + zufall(12), hoehle.y + zufall(8), hoehle.z + zufall(12)],
                () => [kanal.x + zufall(12), fk - 2 + zufall(6), kanal.z + zufall(12)],
                () => [see.x + zufall(24), bett + zufall(6), see.z + zufall(24)],
                (i) => ((e) => [e.x + zufall(e.r + 3), e.y + zufall(e.r + 3), e.z + zufall(e.r + 3)])(edits[i % edits.length]),
                () => ((x, z) => [x, r._terrainMacroSurfaceY(x, z) - 10 + zufall(20), z])(MX + zufall(600), MZ + zufall(600)),
            ];
            const P = new Float64Array(15 * N);
            for (let n = 0, i = 0; n < 5 * N; i++) {
                const p = wurf[(n / N) | 0](i);
                if (!r._kellerLage(p[0], p[2])) P.set(p, 3 * n++);
            }
            return { orte: [hoehle, kanal, see].map((o) => [o.x, o.z]), edits, punkte: __kern.an(P) };
        },
        M.x,
        M.z,
        N
    );
}

// Ein Lauf: die Edits über den Spielpfad, je Punkt dichte, Bezug, Spiegel und Fluss aus Stamm-Leser, Kern-Probe und jedem
// Voxel-Faden; je Ort, wie viele Punkte ihn tragen.
async function kernLesen(page, plan) {
    await page.evaluate(`(function (self) {\n${kernMutiert(kernQuelle(), KERN_MODUS.probe)}\n})(window.__kernProbe = {});`);
    const seite = await page.evaluate(async (plan) => {
        const [r, K, G] = [window.anazhRealm, window.__kernProbe.__gelaendeCore, globalThis.__gelaendeCore];
        r._gameLoopTick = () => {};
        for (const [x, z, R] of [[...plan.orte[1], 700], [...plan.orte[2], 64]]) await window.__weltDa(() => !r._ensureHydroTilesAround(x, z, R));
        for (const e of plan.edits) r._addVoxelEdit(e.x, e.y, e.z, e.r, e.mode);
        const [L, alle] = [r._gelaende(), r.state.worldMeta.voxelEdits];
        const fehlt = ["dichte", "editKarte", "editsAm", "wasserSpiegel", "atlasSpiegel", "flussAm"].filter((f) => !K[f]);
        const karte = !fehlt.length && K.editKarte(null, alle, r._voxelChunkConfig().span, null);
        const out = { fehlt, wirkt: [0, 0, 0, 0, 0], haelt: alle.length };
        // DIE KARTE STEHT (ek-schleife, Lehre 25): nach dem letzten Edit baut der Stamm-Leser die Edit-Karte
        // (`_voxelEditKarte`) in keiner Probe neu — gezählt an den Generationen, die ein Neubau je Edit zieht. `rueckfall`
        // (Selbsttest): die Karte baut je Probe neu, die Zählung MUSS ihn nennen.
        const [g0, neu] = [r._editGenZaehler, () => (r._editGenZaehler - g0) / alle.length];
        out.stamm = __kern.lies(plan.punkte, r._terrainDensityAt.bind(r), (x, y, z) => r._waterLevelAt(x, z), (x, y, z) => r._atlasWaterLevelAt(x, z, y), r._hydroRiverAt.bind(r));
        out.karteNeu = [neu()];
        if (plan.rueckfall) {
            globalThis.__gelaendeCore = { ...G, editKarteSteht: () => false, editKarte: (k, ...a) => G.editKarte(null, ...a) };
            r._terrainDensityAt(...plan.punkte.slice(0, 3));
            [globalThis.__gelaendeCore, out.karteNeu[1]] = [G, neu()];
        }
        if (karte)
            out.kern = __kern.lies(plan.punkte, (x, y, z) => K.dichte(L, x, y, z, plan.liste ? alle : K.editsAm(karte, x, z)), (x, y, z) => K.wasserSpiegel(L, x, z), (x, y, z) => K.atlasSpiegel(L, x, z, y), (x, z) => K.flussAm(L, x, z));
        const P = plan.punkte;
        for (let i = 0, k = 0; i < P.length / 3; i++, k = (5 * i * 3) / P.length | 0) {
            const [x, y, z] = P.slice(i * 3, i * 3 + 3);
            const b = r._terrainBaseDensityAt(x, y, z);
            out.wirkt[k] += [r._terrainMacroSurfaceY(x, z) - y - b > 1, !!r._hydrosphereCarveAt(x, z), !!r._hydrosphereLakeAt(x, z), G.mitEdits(b, x, y, z, alle) !== b, true][k];
        }
        return out;
    }, plan);
    // jeder Voxel-Faden: die Leser seines Chunk-Baus, sobald er die Edits trägt
    seite.faden = [];
    for (const w of page.workers()) {
        if (!(await w.evaluate(`typeof terrainDensityAt === "function" && !!(${KERN_HILFE})`).catch(() => false))) continue;
        seite.faden.push(
            await w.evaluate(async (b, n) => {
                for (let t = 0; t < 200 && state.voxelEdits.length < n; t++) await sleep(25);
                return __kern.lies(b, terrainDensityAt, (x, y, z) => waterLevelAt(x, z), (x, y, z) => atlasWaterLevelAt(x, z, y), hydroRiverAt);
            }, plan.punkte, plan.edits.length)
        );
    }
    const f64 = (W) => W && W.map((a) => Float64Array.from(a, Number));
    return Object.assign(seite, { stamm: f64(seite.stamm), kern: f64(seite.kern), faden: seite.faden.map(f64) });
}

const karteRot = (n) => `EDIT-KARTE (_voxelEditKarte): ${n} Neubauten — sie baut je Probe neu`;
// a gegen b Wort für Wort (Object.is): wie viele weichen ab, die größte endliche Abweichung
function kernVergleich(a, b) {
    const v = { ab: 0, maxDiff: 0 };
    for (let i = 0; i < a.length; i++) if (!Object.is(a[i], b[i])) (v.ab++, (v.maxDiff = Math.max(v.maxDiff, Math.abs(a[i] - b[i]) || 0)));
    return v;
}
// je Leser (Stamm, jeder Faden) die Abweichungen gegen den Kern (ohne Kern gegen den Stamm-Leser)
function kernGleich(lauf) {
    const out = { stamm: 0, faden: 0, maxDiff: 0 };
    for (let w = 0; w < 4; w++)
        for (const [wer, a] of [["stamm", lauf.kern && lauf.stamm[w]], ...lauf.faden.map((F) => ["faden", F[w]])])
            if (a) ((v) => ((out[wer] += v.ab), (out.maxDiff = Math.max(out.maxDiff, v.maxDiff))))(kernVergleich(a, (lauf.kern || lauf.stamm)[w]));
    out.abweichend = out.stamm + out.faden;
    return out;
}

async function kernProbe(page, url) {
    const [t0, befunde, mutationen] = [Date.now(), [], []];
    let plan = null;
    const lauf = async (haupt = null, faden = haupt, probe = haupt) => {
        Object.assign(KERN_MODUS, { haupt, faden, probe });
        await frischBoot(page, url);
        await page.evaluate(KERN_HILFE);
        return plan && kernLesen(page, plan);
    };
    // wie viele Werte die Mutation an jedem Leser zieht (dichte, oder Bezug und Spiegel)
    const zieht = (W, name) => Math.min(...W.map((a) => (name === "See-Spiegel" ? [1, 2] : [0]).reduce((m, w) => m + kernVergleich(a[w], rein.stamm[w]).ab, 0)), W.length ? Infinity : 0);
    console.log("\n========= DIE KERN-PROBE — Stamm-Leser = Worker-Feld = Kern, die Mutation zieht beide =========");
    await lauf();
    await page.evaluate(WASSER_INSTALL);
    plan = await kernPlan(page, messort("wiese"), 20000);
    if (plan.fehler) throw new Error(plan.fehler);
    const rein = await kernLesen(page, { ...plan, liste: true, rueckfall: SELBSTTEST });
    const [g0, N] = [kernGleich(rein), rein.stamm[0].length];
    const [ho, ka, se] = plan.orte.map((o) => o.map(Math.round));
    console.log(`  Orte: Höhle ${ho} · Kanal ${ka} · See ${se} · ${plan.edits.length} Edits (der Stamm hält ${rein.haelt}) · ${N} Punkte · ${rein.faden.length} Voxel-Fäden`);
    console.log(`  Der Ort wirkt (Höhle, Kanal, See, Edit, Zufall): ${rein.wirkt.join(" · ")} von je ${N / 5} · unverändert ≠ Kern Stamm ${g0.stamm} · Faden ${g0.faden}`);
    for (const [rot, b] of [
        [rein.haelt !== plan.edits.length, `EDIT-WAHRHEIT: der Stamm hält ${rein.haelt} von ${plan.edits.length} Edits`],
        [rein.fehlt.length, `KERN: es fehlt ${rein.fehlt} — Dichte und Spiegel sind Abschrift`],
        [!rein.faden.length, "WORKER-FELD: kein Voxel-Faden antwortete"],
        [g0.abweichend, `UNVERÄNDERT: ${g0.abweichend} Werte weichen ab (maxDiff ${g0.maxDiff})`],
        [rein.wirkt.some((w) => w < N / 25), "ORT: ein Ort trägt kein Fünftel seiner Punkte"],
        [rein.karteNeu[0] > 0, karteRot(rein.karteNeu[0])],
        [SELBSTTEST && !(rein.karteNeu[1] > 0), "SELBSTTEST: der Neubau je Probe blieb unentdeckt"],
    ])
        if (rot) befunde.push(b);
    console.log(`  Die Edit-Karte steht: ${rein.karteNeu[0]} Neubauten in ${N} Proben${SELBSTTEST ? ` · Rückfall ROT: ${karteRot(rein.karteNeu[1])}` : ""}`);
    for (const name of ["Edit-Stärke", "Edit-Radius", "Dichte-Versatz", "See-Spiegel"]) {
        const z = { name, anker: kernQuelle().split(KERN_MUTATIONEN[name][0]).length === 2 };
        const m = z.anker && (await lauf(name));
        if (m) Object.assign(z, kernGleich(m), { zugStamm: zieht([m.stamm], name), zugFaden: zieht(m.faden, name) });
        mutationen.push(Object.assign(z, { gut: z.anker && z.zugStamm > 0 && z.zugFaden > 0 && z.abweichend === 0 }));
        console.log(`  ${z.gut ? "✓" : "⛔"} ${name.padEnd(15)} zieht Stamm-Leser ${z.zugStamm} · Worker-Feld ${z.zugFaden} Werte · ≠ Kern ${z.abweichend}`);
        if (!z.gut) befunde.push(`MUTATION ${name}: ` + (!z.anker ? "kein Anker im Kern" : z.abweichend ? `${z.abweichend} Werte ≠ Kern` : "ein Leser folgt nicht"));
    }
    // der Selbsttest: ein Leser mit eigener (unveränderter) Abschrift MUSS beim Namen rot werden
    const selbsttest = SELBSTTEST && !rein.fehlt.length ? {} : null;
    for (const [wer, haupt, faden] of selbsttest ? [["WORKER-FELD", "Dichte-Versatz", null], ["STAMM-LESER", null, "Dichte-Versatz"]] : []) {
        const g = kernGleich(await lauf(haupt, faden, "Dichte-Versatz"));
        selbsttest[wer] = { stamm: g.stamm, faden: g.faden, nennt: haupt ? g.faden > 0 && !g.stamm : g.stamm > 0 && !g.faden };
        console.log(`  SELBSTTEST (${wer} liest den unveränderten Kern): ≠ Kern Stamm ${g.stamm} · Faden ${g.faden} → ${selbsttest[wer].nennt ? "beim Namen ROT" : "BLIEB BLIND"}`);
    }
    if (selbsttest && !(selbsttest.sieht = selbsttest["WORKER-FELD"].nennt && selbsttest["STAMM-LESER"].nennt)) befunde.push("SELBSTTEST: eine Abschrift blieb unentdeckt");
    const kern = { punkte: N, edits: plan.edits.length, haelt: rein.haelt, orte: plan.orte, wirkt: rein.wirkt, faeden: rein.faden.length, rein: g0, mutationen, selbsttest,
        sekunden: Math.round((Date.now() - t0) / 1000) };
    for (const b of befunde) console.log("  ⛔", b);
    console.log(`\n${befunde.length ? "⛔ KERN-PROBE ROT" : "✅ KERN-PROBE GRÜN"}: ${N} Punkte, ${mutationen.filter((z) => z.gut).length}/4 Mutationen ziehen beide Leser · ${kern.sekunden} s\n`);
    if (JSON_AUS) fs.writeFileSync(JSON_AUS, JSON.stringify({ kern }, null, 1));
    return befunde.length ? 1 : 0;
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
    vm.runInContext(kernQuelle(wurzel), ctx);
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
// 26 noise2D → 6 µs ≙ 52,9, 3 µs ≙ 26,4). Ebene = Hang < 8 % über dem Wasser.
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
    // Messung, das Verhältnis je Scheibe nicht — gezählt wird sein Median.
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
    const flaecheKm2 = ((n - 1) * S * 1e-3) ** 2;
    const memoUsJeKm2 = last ? 0 : Math.max(0, (usKalt - W.us) * n * n) / flaecheKm2;
    const umgelegt = memoUsJeKm2 / (1e6 / (1.8 * 1.8)); // je 1,8-m-Spalte des Spiels
    const alle = W.eq + umgelegt / W.usNoise;
    const ebenen = E.eq + umgelegt / E.usNoise;
    return {
        usWarm: +W.us.toFixed(2),
        usEbene: +E.us.toFixed(2),
        usNoise2D: +W.usNoise.toFixed(3),
        memoMsJeKm2: +(memoUsJeKm2 / 1000).toFixed(1),
        umgelegtUs: +umgelegt.toFixed(3),
        noise2DAlle: +alle.toFixed(1),
        noise2DEbene: +ebenen.toFixed(1),
        ebeneSpalten: eben.length,
        imBudget: alle <= SPALTEN_BUDGET.alle && ebenen <= SPALTEN_BUDGET.ebenen,
    };
}
// DIE LANDSCHAFTEN AN DEN DREI SAATEN: jede benannte Landschaft der Bedienung des Studios (worlds/gelaende/
// bedienung.json `landschaften`) als EIN Plan je Saat der Linse (`planLage` des gemessenen Gesetzes — dieselbe Lage, die die
// Welt aus dem Plan gebiert), dieselbe Messung und dasselbe Urteil wie die Saaten (die Linse dieses Baums). Das Urteil spricht
// `presetBefunde` (dieselbe Wand wie die Knöpfe der Studio-Probe): kein Ziel false, und je Saat trägt mindestens eine
// Landschaft das Schicht-Gesetz.
function presetsAnSaaten(K, Z) {
    const G = K.G;
    const R = Z.MESSUNG.raster;
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
            const { ort, baender: schicht } = sm;
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
    // Das Mess-Raster des Kerns (`MESSUNG.raster`: 4 × 4 km innen, 30 m, 2 km Rand — EINE Quelle mit der Zahl-Leiste).
    const { schritt: SCHRITT, halb: HALB, rand: RAND, x0, n } = Z.MESSUNG.raster;
    const AUSSEN = -x0;
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
        const { ort, x: ox, z: oz, baender: schicht } = sm;
        // Der Korridor ist EINE Quelle (`urteil`/`KORRIDOR` im Kern — dieselbe Zahl-Leiste wie im Studio); die Wand verlangt
        // jedes Ziel, auch das Schicht-Gesetz (ohne Schicht-Ort: null = rot), und die Kosten je Spalte.
        // DER MÄANDER: die Bahnen der Flachland-Glieder des inneren Felds (`maeanderZahl`, die Bahn im 8-m-Schritt) —
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
    if (JSON_AUS)
        fs.writeFileSync(
            JSON_AUS,
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
            const hex = window.__sha;
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
async function studioProbe(page) {
    const t0 = Date.now();
    const befunde = [];
    const out = { zweck: "K16b Studio-Probe (Gelände-Studio → Plan → Welt)", regler: [], befunde };
    console.log("\n========= DIE STUDIO-PROBE — Gelände-Studio → EIN Plan → Welt-Tür → Welt, byte-gleich =========");
    try {
        await server.zeige(page, 60000);
        await page.evaluate(() => localStorage.clear());
        // DIE FREMDE WELT: eine Welt, die kein Plan beschreibt (Basis 7 m, das Meer darunter, eine Rampe hinter der Wildnis),
        // wird die aktive Welt — über ihr öffnet sich das Studio.
        const b0 = await booteWelt(page);
        if (!b0.ok) throw new Error("die Welt vor der fremden Welt erwachte nicht");
        const nav0 = page.waitForNavigation(LADEN);
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
        await server.zeige(page, 60000, "index.html?studio=gelaende");
        const b = await booteWelt(page);
        if (!b.ok) throw new Error("die Welt unter dem Studio erwachte nicht in 120 s");
        console.log(`  Boot unter dem Studio: ${b.ms} ms (Seed ${b.seed})`);
        const da = await page.evaluate(async () => {
            while (!(window.__gelaendeStudio && document.querySelector("#gelaende-studio"))) await sleep(50);
            return true;
        });
        if (!da) {
            befunde.push(
                "kein Gelände-Studio: index.html?studio=gelaende zeigt kein Panel (#gelaende-studio, window.__gelaendeStudio) — Export 0"
            );
            throw new Error("kein Studio");
        }
        // DER START: das Studio öffnet auf A, und der Entwurf nennt, was die fremde Welt trägt und kein Plan (die Rampe, die
        // Basis 7 m).
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
        await server.zeige(page, 60000);
        const b2 = await booteWelt(page);
        if (!b2.ok) throw new Error("die Welt vor dem Import erwachte nicht");
        const nav = page.waitForNavigation(LADEN);
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
        const b3 = await booteWelt(page);
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
    out.sekunden = Math.round((Date.now() - t0) / 1000);
    if (JSON_AUS) fs.writeFileSync(JSON_AUS, JSON.stringify(out, null, 1));
    for (const f of befunde) console.log(`  ⛔ ${f}`);
    const tot = out.regler.filter((r) => !r.wirkt).length;
    console.log(
        `\n${befunde.length ? "⛔ STUDIO-PROBE ROT" : "✅ STUDIO-PROBE GRÜN"}: ${out.regler.length}/${out.reglerZahl || 18} Regler gegriffen, tot ${tot} · Export ${out.plan ? 1 : 0} · Welt = Studio ${out.welt && out.studio && out.welt.makroSha === out.studio.makroSha ? "byte-gleich" : "nein"} · ${out.sekunden} s\n`
    );
    return befunde.length ? 1 : 0;
}

// ── DER GEBAUTE BODEN (K16, Prüfung 1, `--gebaut`): dieselbe Linse (`statistik`) am Boden, den der Spieler betritt
// (`_voxelSurfaceY`: Gesetz, Höhle, Hydrosphären-Kanal und See-Becken) neben der Makro-Höhe des Gesetzbuchs, je Saat der
// Realismus-Wand (die Boot-Saat und zwei frische: Regenesis der Ströme, die Hydrosphäre neu), 2 × 2 km um den Ursprung (die
// Heimat-Kachel der Hydrosphäre), 30 m. Ziel je Saat: Senken > 1 m ≤ 1 je km², ≥ 3 Dorfplätze, und die Hydrosphäre trägt Flüsse. Der Täter steht beim Namen: derselbe Boden ohne den Kanal (ohne
// Hydrosphäre) — ohne den Kanal grün → der Kanal (`hydroNetzFluesse` → `_hydrosphereCarveAt`). Die Hydrosphäre jeder Saat
// rechnet der Faden (Karte hydro-faden). Mit `--selftest` im selben Boot: die Bett-Tiefe des alten Gesetzes (1,4 m + 0,16 ·
// Breite, ohne `kanalTiefe`, dem Faden als Gesetz gegeben) MUSS die Boot-Saat rot färben.
async function gebaut(page) {
    const b = await booteWelt(page);
    if (!b.ok) {
        console.log("  ⛔ GEBAUT: Boot nicht bereit nach 120 s");
        return 1;
    }
    const { alle, stoerung } = await page.evaluate(
        async (saaten, selbst) => {
            const r = window.anazhRealm;
            const s = r.state;
            await window
                .__gebautNach("noch: !(s.hydrosphere && s.hydrosphere.ready)", {
                    fertig: () => !!(s.hydrosphere && s.hydrosphere.ready),
                    takt: async () => {
                    try {
                        r._gameLoopTick(performance.now());
                    } catch {
                        /* der Boot reift */
                    }
                    await sleep(16);
                    },
                    max: 3750,
                });
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
            // der gebaute Boden (`_voxelSurfaceY`), wo er fehlt die Makro-Höhe `Hm`
            const boden = (Hm) => raster((x, z) => r._voxelSurfaceY(x, z)).map((v, k) => (Number.isFinite(v) ? v : Hm[k]));
            const kurz = (st) => ({
                senken: st.senken1mJeKm2,
                dorf: st.dorfplaetze,
                minima: st.minimaJeKm2,
                theta: st.flint.theta,
                r2: st.flint.r2,
            });
            // DER MÄANDER IM WASSER: die Fluss-Punkte der Hydrosphäre (Kanal und Spiegel liegen darauf) in Fenstern von
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
            // der Selbsttest je Saat — die Gerade: jeder Fluss auf seine Sehne gelegt (der Bogen bleibt, der Versatz quer
            // fällt); der Mäander im Wasser MUSS rot werden
            const geradeMessung = (h) =>
                maeanderWasser({
                    rivers: h.rivers.map((rv) => {
                        const P = rv.points;
                        const [a, e] = [P[0], P[P.length - 1]];
                        let bogen = 0;
                        const s0 = P.map((p, k) => (bogen += k ? Math.hypot(p.x - P[k - 1].x, p.z - P[k - 1].z) : 0));
                        return { points: P.map((p, k) => ({ ...p, x: a.x + ((e.x - a.x) * s0[k]) / bogen, z: a.z + ((e.z - a.z) * s0[k]) / bogen })) };
                    }),
                });
            // die Hydrosphäre aus dem Faden (`gesetz`: ein anderes Gesetz für den Selbsttest), in den Main gelegt
            const ausDemFaden = async (gesetz) => {
                const auftrag = (msg) => r._voxelFadenAuftrag(s.voxelWorker, msg);
                await auftrag({ type: "state-update", delta: { hydroGesetz: gesetz || r.constructor.HYDROSPHERE } });
                s.hydrosphere = (await auftrag({ type: "hydro", key: "heim", origin: null })).region;
            };
            const bootSaat = s.worldMeta.seed;
            const bootMacro = s.worldMeta.macro;
            // die chirurgische Regenesis der Abdruck-Probe (die Ströme; das Netz des Gesetzbuchs ist je Saat gemerkt), dazu die
            // Hydrosphäre der Saat aus dem Faden (ihre Kacheln fallen; der Weg der Weltgen)
            const regenesis = async (saat, macro) => {
                s.worldMeta.seed = saat;
                r._voxelNoise = null;
                if (macro !== undefined) s.worldMeta.macro = macro;
                else delete s.worldMeta.macro;
                await r._worldgenComputeAndBuildHydrosphere();
            };
            const out = [];
            for (const saat of [bootSaat, ...saaten.filter((x) => x !== bootSaat)]) {
                if (saat !== bootSaat) await regenesis(saat, undefined);
                const Hm = raster((x, z) => r._terrainMacroSurfaceY(x, z, true));
                const voll = boden(Hm);
                const h = s.hydrosphere;
                s.hydrosphere = null;
                const ohne = boden(Hm);
                s.hydrosphere = h;
                out.push({
                    seed: saat,
                    hydro: !!(h && h.ready),
                    fluesse: h ? h.fluesse : 0,
                    maeander: maeanderWasser(h),
                    maeanderGerade: selbst ? geradeMessung(h) : null,
                    voll: kurz(G.statistik(voll, n, S, wl, [], 0)),
                    ohneKanal: kurz(G.statistik(ohne, n, S, wl, [], 0)),
                    makro: kurz(G.statistik(Hm, n, S, wl, [], 0)),
                });
            }
            if (s.worldMeta.seed !== bootSaat) await regenesis(bootSaat, bootMacro);
            let stoerung = null;
            if (selbst) {
                // die Störung: die Bett-Tiefe des alten Gesetzes (der Kanal als Graben unter der Aue: ohne `kanalTiefe`)
                await ausDemFaden({ ...r.constructor.HYDROSPHERE, kanalTiefe: Infinity });
                const Hm = raster((x, z) => r._terrainMacroSurfaceY(x, z, true));
                const gestoert = boden(Hm);
                await ausDemFaden(null);
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
    let rot = false;
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
                "  ⛔ das Wasser läuft gerade: die Fluss-Punkte folgen der Sehne, nicht der Bahn (`hydroNetzFluesse` liest `bahn` des Kerns)"
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
                    ? "  ⛔ der Hydrosphären-Kanal fräst den Boden: ohne ihn grün (`hydroNetzFluesse` → `_hydrosphereCarveAt`)"
                    : "  ⛔ der Boden ohne Kanal ist rot: Höhle oder Gesetz (gelaende-core `dichteBasis`)"
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

// ── DER FADEN TRÄGT DIE BYTES (`--faden`, Streaming H3) ──
// K4: eine Hydrosphäre (Heimat, Kachel) oder ein Feld des Staus (`waterStau`, der Damm am Fluss), das nicht als Faden-Nachricht
//     kam, ist ROT beim Namen des Rufers; jeden Bau im Haupt-Faden (Chunk-Stoff, Guss des Bäckers) zählt das Spiel selbst
//     (`_fadenUmgangen`: je Sync-Stelle in `_syncBau`, sonst laut im Buch „FADEN-UMGANGEN") — die Linse liest den Zähler nach
//     der Ankunft, 2 min Gang, einer Minute Fahrt mit sechs echten Bau-Klicks (bau-faden: bis dahin baute jeder seinen
//     Fußabdruck synchron, 215 ms je Klick) und dem Damm; ein Takt des Staus (`_stauFelder`) je Damm-Edit über 8 ms ist ROT.
// K5: `fadenHuelle` vor dem Quelltext jedes Fadens heftet jeder Nachricht ihre Klon-Bytes an (Transfer zählt nicht);
//     der Main summiert sie am Empfang je Faden und Art in beiden Richtungen, dazu jede Kopie empfangener Bytes (jeder
//     Tiefe, `da`: auch ihr Klon) und die Platte — je Minute im Kalt-Boot und in einer Minute Fahrt, Soll ≤ 5 MB/min.
//   --faden [--echt] [--selftest]   ein injizierter Hydro-Bau, ein Fußabdruck an einer unbenannten Sync-Stelle, ein Guss, ein
//                          Stau-Feld im Haupt-Faden und Klon (3 MB tief in einer Nachricht, 3 MB in 300 Krumen, zwei Kopien) fallen
//                          ROT beim Namen; `--echt` im Fenster an der echten GPU (`[linse-gpu]`), sonst am Null-Renderer.
const FADEN_SOLL = 5e6; // Bytes je Minute
function klonBytes(v, frei, seen, da) {
    if (v === null || typeof v !== "object") return da ? 0 : typeof v === "string" ? v.length : 8;
    if (seen.has(v)) return 0;
    seen.add(v);
    const puffer = (p) => (frei.has(p) || (da && !da(p)) ? 0 : p.byteLength);
    if (v instanceof ArrayBuffer) return puffer(v);
    if (ArrayBuffer.isView(v)) return seen.has(v.buffer) ? 0 : (seen.add(v.buffer), puffer(v.buffer));
    let b = da ? 0 : 8;
    if (v instanceof Map || v instanceof Set) for (const e of v) b += klonBytes(e, frei, seen, da);
    else for (const k in v) b += (da ? 0 : k.length) + klonBytes(v[k], frei, seen, da);
    return b;
}
// läuft VOR dem Quelltext jedes Fadens: jede ausgehende Nachricht trägt ihre Klon-Bytes (`__klon`)
function fadenHuelle(klonBytes) {
    const roh = self.postMessage.bind(self);
    self.postMessage = function (m, tr) {
        const frei = new Set(Array.isArray(tr) ? tr : (tr && tr.transfer) || []);
        if (m && typeof m === "object" && !ArrayBuffer.isView(m)) m.__klon = klonBytes(m, frei, new Set());
        return roh(m, tr);
    };
}
function fadenSeite(bytesQ, huelleQ) {
    const klonBytes = new Function("return " + bytesQ)();
    const F = (window.__faden = { fenster: "boot", t: {}, faeden: [], hydro: { faden: 0, rot: [] }, klick: [], stau: { faden: 0, rot: [], ms: 0 } });
    Error.stackTraceLimit = 40; // die Kette bis zur Sync-Stelle (V8 hält sonst 10 Rahmen)
    const von = new WeakSet();
    const bytes = new WeakSet();
    const zu = (art, k, b) => {
        const w = F.t[F.fenster] || (F.t[F.fenster] = { empfang: {}, kopie: {}, gesendet: {}, platte: {} });
        w[art][k] = (w[art][k] || 0) + b;
    };
    // der Rufer: der erste Rahmen aus dem Stamm (der Vendor ist nie der Täter), sonst der erste benannte außerhalb dieser Haken
    // die Rahmen dieser Haken sind nie der Täter
    const kette = /^(rufer|pruefe|set|kopie|construct|zu)$/;
    const rufer = () => {
        const z = new Error().stack.split("\n").slice(1);
        const n = (l) => ((n) => n.slice(n.lastIndexOf(".") + 1))((/at (?:new )?([^\s(]+)/.exec(l) || [])[1] || "");
        const st = z.find((l) => / at [\w$.]+ \(/.test(l) && l.includes(location.origin + "/stamm/") && !kette.test(n(l)));
        const fremd = (l) => /^[\w$]+$/.test(n(l)) && !kette.test(n(l));
        return n(st || z.find(fremd) || "?");
    };
    const merke = (v, seen) => {
        if (!v || typeof v !== "object" || seen.has(v)) return;
        seen.add(v);
        if (v instanceof ArrayBuffer) return bytes.add(v);
        if (ArrayBuffer.isView(v)) return bytes.add(v.buffer);
        von.add(v);
        for (const k in v) merke(v[k], seen);
    };
    // der Quelltext jedes Blobs aus Text (der Boot der Foundry und des Klangs), gemerkt an seiner URL
    const blobText = new WeakMap();
    const urlText = new Map();
    window.Blob = new Proxy(window.Blob, {
        construct(t, a, nt) {
            const b = Reflect.construct(t, a, nt === window.Blob ? t : nt);
            if (Array.isArray(a[0]) && a[0].every((x) => typeof x === "string")) blobText.set(b, a[0].join(""));
            return b;
        },
    });
    const cou = URL.createObjectURL;
    URL.createObjectURL = function (b) {
        const u = cou.call(this, b);
        if (blobText.has(b)) urlText.set(u, blobText.get(b));
        return u;
    };
    const Roh = window.Worker;
    const W = function (url, opts) {
        const u = new URL(url, location.href);
        const innen =
            urlText.get(String(url)) ||
            `self.__anazhBase=${JSON.stringify(new URL(".", u).href)};importScripts(${JSON.stringify(u.href)});`;
        const quelle = `(${huelleQ})(${bytesQ});\n${innen}`;
        const w = new Roh(URL.createObjectURL(new Blob([quelle], { type: "text/javascript" })), opts);
        F.faeden.push((w.__faden = (opts && opts.name) || "?"));
        return w;
    };
    W.prototype = Roh.prototype;
    window.Worker = W;
    // je Ereignis einmal, auch wenn mehrere Hörer es empfangen (der Stau hört neben dem Empfänger des Voxel-Fadens)
    const empfang = function (e) {
        if (e.__da) return;
        e.__da = 1;
        const d = e.data;
        const b = d && typeof d.__klon === "number" ? d.__klon : klonBytes(d, new Set(), new Set());
        zu("empfang", `${this.__faden}:${(d && d.type) || "?"}`, b);
        merke(d, new Set());
    };
    const om = Object.getOwnPropertyDescriptor(Roh.prototype, "onmessage");
    Object.defineProperty(Roh.prototype, "onmessage", {
        configurable: true,
        get() {
            return this.__om || null;
        },
        set(fn) {
            this.__om = fn;
            om.set.call(this, fn && ((e) => (empfang.call(this, e), fn.call(this, e))));
        },
    });
    const ael = Roh.prototype.addEventListener;
    Roh.prototype.addEventListener = function (t, fn, o) {
        const g = t === "message" && typeof fn === "function" ? (e) => (empfang.call(this, e), fn.call(this, e)) : fn;
        return ael.call(this, t, g, o);
    };
    const post = Roh.prototype.postMessage;
    Roh.prototype.postMessage = function (m, tr) {
        const frei = new Set(Array.isArray(tr) ? tr : (tr && tr.transfer) || []);
        const art = `${this.__faden}:${(m && m.type) || "?"}`;
        const k = klonBytes(m, frei, new Set(), da);
        if (k) zu("kopie", art, k); // der Klon empfangener Bytes zurück in einen Faden heißt nach seiner Nachricht (Lehre 24)
        zu("gesendet", art, klonBytes(m, frei, new Set()) - k);
        return post.call(this, m, tr);
    };
    // DIE PLATTE wie im Spiel: Put und Get klonen ihren Wert im Haupt-Faden — es zählt, wo der Wert Bytes trägt
    window.__anazhChunkIdb = true;
    const binaer = (v, t) =>
        !!v && typeof v === "object" && t < 3 && (v instanceof ArrayBuffer || ArrayBuffer.isView(v) || Object.values(v).some((x) => binaer(x, t + 1)));
    const put = IDBObjectStore.prototype.put;
    IDBObjectStore.prototype.put = function (v, k) {
        if (binaer(v, 0)) zu("platte", `put:${rufer()}`, klonBytes(v, new Set(), new Set()));
        return put.call(this, v, k);
    };
    const res = Object.getOwnPropertyDescriptor(IDBRequest.prototype, "result");
    const gelesen = new WeakSet();
    Object.defineProperty(IDBRequest.prototype, "result", {
        configurable: true,
        get() {
            const v = res.get.call(this);
            if (binaer(v, 0) && !gelesen.has(this) && !(v instanceof IDBDatabase)) {
                gelesen.add(this);
                zu("platte", `get:${rufer()}`, klonBytes(v, new Set(), new Set()));
            }
            return v;
        },
    });
    // die Kopien empfangener Bytes: ein NEUES Array aus ihnen (set in einen bestehenden Puffer ist Verbrauch)
    const kopie = (b) => zu("kopie", rufer(), b);
    const da = (x) => !!x && (bytes.has(x) || (ArrayBuffer.isView(x) && bytes.has(x.buffer)));
    const TAK = Object.getPrototypeOf(Int8Array);
    const TA = TAK.prototype;
    for (const P of [TA, ArrayBuffer.prototype]) {
        const sl = P.slice;
        P.slice = function (...a) {
            const r = sl.apply(this, a);
            if (da(this)) kopie(r.byteLength);
            return r;
        };
    }
    for (const K of [Array, TAK]) {
        const f = K.from;
        K.from = function (q, ...a) {
            if (da(q)) kopie(q.byteLength);
            return f.call(this, q, ...a);
        };
    }
    for (const n of [
        "Int8Array",
        "Uint8Array",
        "Int16Array",
        "Uint16Array",
        "Int32Array",
        "Uint32Array",
        "Float32Array",
        "Float64Array",
    ]) {
        const K = window[n];
        const P = new Proxy(K, {
            construct(t, a, nt) {
                if (ArrayBuffer.isView(a[0]) && da(a[0])) kopie(a[0].byteLength);
                return Reflect.construct(t, a, nt === P ? t : nt); // eine Unterklasse behält ihren Prototyp
            },
        });
        K.prototype.constructor = P;
        window[n] = P;
    }
    // K4: woher kommt jede Hydrosphäre
    const pruefe = (wo, h, Z = F.hydro) => {
        if (!h || typeof h !== "object") return;
        if (von.has(h)) Z.faden++;
        else Z.rot.push(`${wo} · ${rufer()}`);
    };
    const haken = (r) => {
        const s = r.state;
        let heim = s.hydrosphere;
        let kacheln = null;
        const k = (m) => {
            if (m && !m.__faden) {
                const s0 = m.set;
                m.set = function (key, h) {
                    pruefe(`Kachel ${key}`, h);
                    return s0.call(this, key, h);
                };
                m.__faden = 1;
            }
            return (kacheln = m);
        };
        k(s.hydroTiles);
        const feld = (name, get, set) =>
            Object.defineProperty(s, name, { configurable: true, enumerable: true, get, set });
        feld(
            "hydrosphere",
            () => heim,
            (h) => (pruefe("Heimat", h), (heim = h))
        );
        feld("hydroTiles", () => kacheln, k);
        // K4 Stau: jedes Feld des Staus kommt aus dem Faden (der Setter heißt `set`: der Rufer ist der Rahmen darunter)
        let stau = s.waterStau;
        feld("waterStau", () => stau, function set(v) {
            for (const f of v || []) pruefe("Stau-Feld", f, F.stau);
            stau = v;
        });
        const P = Object.getPrototypeOf(r);
        const stauTakt = P._stauFelder;
        if (!stauTakt || !P._syncBauten) return (F.blind = "kein Zähler im Spiel");
        // der Takt des Staus je Damm-Edit (Lehre 14): sein längster Ruf im Fenster „damm" ist die Zahl, über 8 ms ROT
        P._stauFelder = function stauZeit() {
            const t0 = performance.now();
            stauTakt.call(this);
            if (F.fenster === "damm") F.stau.ms = Math.max(F.stau.ms, performance.now() - t0);
        };
        F.haken = true;
    };
    let real;
    Object.defineProperty(window, "anazhRealm", {
        configurable: true,
        get: () => real,
        set: (r) => haken((real = r)),
    });
}
async function faden(page, url) {
    // KALT: der Ursprung ohne Welt räumt Abbild und Platten, dann der erste Boot
    await page.evaluateOnNewDocument(fadenSeite, String(klonBytes), String(fadenHuelle));
    await page.goto(url.replace("index.html", "cores.manifest.json"), { timeout: 60000 });
    await page.evaluate(() =>
        Promise.all(
            ["anazhChunkMesh", "anazhFoundryAssets"].map(
                (n) => new Promise((ok) => Object.assign(indexedDB.deleteDatabase(n), { onsuccess: ok, onerror: ok }))
            )
        ).then(() => localStorage.clear())
    );
    await page.goto(url, LADEN);
    // Gang und Fahrt in Takten (K-WANDUHR, 30 Takte je s): 2 min Gang bei 2 m/s = 240 m nach Norden in 3 600 Takten, dann
    // eine Minute bei vmax des GT (≈ 16 m/s) = 960 m nach Osten in 1 800 Takten mit den Bau-Klicks
    const takt = (n, dx = 960, dz = 0) =>
        page.evaluate(async (n, dx, dz) => {
            await window.__weltDa(() => window.anazhRealm && typeof window.anazhRealm._gameLoopTick === "function");
            const r = window.anazhRealm;
            const p = r.state.playerMesh.position;
            if (!n)
                for (const weiter = window.__deckel("die Welt steht", 4000); weiter(); ) {
                    if (r.state.voxelChunks && r.state.voxelChunks.size > 20 && r.state.voxelWorkerReady) break;
                    await window.__seitenTakt();
                }
            r.state.pitch = -Math.PI / 2; // der Blick senkrecht nach unten: ein Bau-Klick setzt den Block unter den Spieler
            for (let k = 0, t; k < n; k++) {
                await window.__seitenTakt();
                p.x += dx / n;
                p.z -= dz / n;
                const y = r._voxelSurfaceY(p.x, p.z);
                if (Number.isFinite(y)) p.y = y + 1.8;
                if (dx && k % 300 === 150 && ((t = performance.now()), r.tryMousePlace())) window.__faden.klick.push(performance.now() - t);
            }
            return n ? (n / 30) * 1000 : performance.now();
        }, n, dx, dz);
    const fenster = async (name) => page.evaluate((n) => (window.__faden.fenster = n), name);
    const dauer = { boot: await takt(0) };
    await fenster("gang");
    dauer.gang = await takt(3600, 0, 240);
    await fenster("fahrt");
    dauer.fahrt = await takt(1800);
    // K4 STAU (gelaende.K2, Lehre 14): der Damm des Verbs am Fluss nächst der Mess-Wiese (`__wasserDamm`, je 3 m eine Säule)
    await page.evaluate(WASSER_INSTALL);
    await fenster("damm");
    await page.evaluate(async () => window.__wasserDamm({ fluss: (await window.__wasserOrte({})).fluss }));
    if (SELBSTTEST) {
        await fenster("selbst");
        dauer.selbst = await page.evaluate(async () => {
            const r = window.anazhRealm;
            const G = globalThis.__gelaendeCore;
            const t0 = performance.now();
            (function injizierteHydro() {
                const o = { x: 9 * 2048 - 1024, z: -1024 };
                r.state.hydroTiles.set(
                    "9,0",
                    G.hydrosphaere(r._gelaende(), AnazhRealm.HYDROSPHERE, (x, z) => r._voxelSurfaceY(x, z), o)
                );
            })();
            (function injiziertesStauFeld() {
                r._stauRechnet = true; // Werke und Feld lesen das Gesetz ohne Stau (der Selbsttest ist das Ende der Seite)
                r.state.waterStau = G.stauFelder(r._gelaende(), r._stauWorkClusters(), AnazhRealm.CA_STAU, 1.8, (x, z) => r._voxelSurfaceY(x, z), null, [], 0).felder;
            })();
            (function injizierterFussabdruck() {
                const p = r.state.lastPlayerVoxelChunk;
                r._rebuildVoxelChunk(p.cx, p.cz, null, { forceSync: "injiziert" });
            })();
            (function injizierterGuss() {
                r._ofenMenschTemplate({ t: t0 }, 0, 0, 3, true);
            })();
            const w = new Worker(
                URL.createObjectURL(
                    new Blob([
                        "self.postMessage({ type: 'klon', a: { b: { c: new Float32Array(750000) } } });",
                        "for (let i = 0; i < 300; i++) self.postMessage({ type: 'krume', b: new Uint8Array(10000) });",
                    ])
                ),
                { name: "selbsttest" }
            );
            await new Promise((ok) => {
                let n = 0;
                w.onmessage = (e) => {
                    if (e.data.type === "klon") w.postMessage(Float32Array.from(e.data.a.b.c) && e.data.a);
                    if (++n === 301) ok();
                };
            });
            w.terminate();
            return performance.now() - t0;
        });
    }
    // K4 BAU: der Zähler des Spiels (`_fadenUmgangen`) — je Sync-Stelle `_syncBau`, sonst das Buch „FADEN-UMGANGEN"
    const F = await page.evaluate(() => JSON.parse(JSON.stringify({ ...window.__faden, bau: window.anazhRealm._syncBauten() })));
    const mb = (b) => (b / 1e6).toFixed(2);
    const summe = (o) => Object.values(o || {}).reduce((a, b) => a + b, 0);
    const proMin = {};
    console.log("\n=== DER FADEN TRÄGT DIE BYTES (K4 · K5) ===");
    for (const w of Object.keys(dauer)) {
        const T = F.t[w] || {};
        const teile = [
            ["Faden → Main", T.empfang],
            ["Main → Faden", T.gesendet],
            ["Kopie", T.kopie],
            ["Platte", T.platte],
        ];
        proMin[w] = (teile.reduce((a, [, o]) => a + summe(o), 0) / dauer[w]) * 60000;
        const top = (o) =>
            Object.entries(o)
                .sort((a, b) => b[1] - a[1])
                .slice(0, 4)
                .map(([k, b]) => `${k} ${mb(b)} MB`)
                .join(" · ");
        console.log(
            `  ${w.padEnd(6)} ${(dauer[w] / 1000).toFixed(1)} s · ${mb(proMin[w])} MB/min am Empfang: ${teile.map(([n, o]) => `${n} ${mb(summe(o))} MB`).join(" · ")}`
        );
        for (const [n, o] of teile) if (summe(o)) console.log(`         ${n}: ${top(o)}`);
    }
    console.log(`  Fäden: ${F.faeden.join(" · ")}`);
    const stauTakt = `Takt ${F.stau.ms.toFixed(1)} ms`;
    if (F.stau.ms > 8) F.stau.rot.push(stauTakt);
    for (const [name, Z] of [["Hydrosphären", F.hydro], [`Stau-Felder (Damm, ${stauTakt})`, F.stau]])
        console.log(`  ${name}: ${Z.faden} aus dem Faden · ${Z.rot.length} im Haupt-Faden${Z.rot.length ? " — " + Z.rot.join(" | ") : ""}`);
    console.log(
        `  Bauten im Haupt-Faden (Chunk-Stoff, Guss): ${summe(F.bau.stellen)} an Sync-Stellen und Test-Nähten · ${F.bau.sonst} sonst ${JSON.stringify(F.bau.stellen)}${F.bau.rot.length ? " — " + F.bau.rot.slice(0, 6).join(" | ") : ""}`
    );
    const k4 = F.hydro.rot.concat(F.stau.rot, F.bau.rot).filter((x) => !/injizierte/.test(x)).reduce((a, x) => a + (parseInt(x) || 1), 0);
    console.log(
        `  Bau-Klicks in der Fahrt: ${F.klick.length}, die Hand ${F.klick.map((m) => m.toFixed(1)).join(" · ")} ms`
    );
    const blind =
        F.blind ||
        (!F.haken && "die Haken sitzen nicht") ||
        (F.bau.voll && "das Buch ist voll") ||
        (!F.hydro.faden && !F.hydro.rot.length && "keine Hydrosphäre gesehen") ||
        (!summe((F.t.fahrt || {}).empfang) && "kein Empfang in der Fahrt") ||
        (F.klick.length < 6 && "die Bau-Klicks der Fahrt bauten nicht") ||
        (!F.stau.faden && "kein Feld des Staus aus dem Faden");
    let rot = !!blind || k4 > 0 || proMin.fahrt > FADEN_SOLL;
    if (blind) console.log(`  ⛔ BLIND: ${blind}`);
    if (k4) console.log(`  ⛔ K4: ${k4} synchrone Bauten im Haupt-Faden, obwohl ein Faden zuständig ist`);
    if (proMin.fahrt > FADEN_SOLL)
        console.log(`  ⛔ K5: ${mb(proMin.fahrt)} MB/min am Empfang in der Fahrt > ${mb(FADEN_SOLL)}`);
    if (SELBSTTEST) {
        const S = F.t.selbst || { empfang: {}, kopie: {} };
        const nennt = (liste, n) => liste.some((x) => x.includes(n));
        const klon = (S.empfang["selbsttest:klon"] || 0) + (S.empfang["selbsttest:krume"] || 0);
        const sieht =
            nennt(F.hydro.rot, "injizierteHydro") &&
            nennt(F.bau.rot, "injizierterFussabdruck") &&
            nennt(F.bau.rot, "injizierterGuss") &&
            nennt(F.stau.rot, "injiziertesStauFeld") &&
            klon >= 5.9e6 &&
            (S.empfang["selbsttest:krume"] || 0) >= 2.9e6 &&
            summe(S.kopie) >= 5.9e6 &&
            proMin.selbst > FADEN_SOLL;
        console.log(
            `  SELBSTTEST: injizierter Hydro-Bau, synchroner Fußabdruck, Guss, Stau-Feld und Klon (${mb(klon)} MB, Kopie ${mb(summe(S.kopie))} MB) ${sieht ? "fallen ROT beim Namen" : "BLIEBEN UNSICHTBAR"}`
        );
        rot = rot || !sieht;
    }
    console.log(
        `\n${rot ? "⛔ FADEN ROT" : "✅ FADEN GRÜN: K4 0 synchrone Bauten außerhalb der Sync-Stellen · K5 " + mb(proMin.fahrt) + " MB/min ≤ 5 in der Fahrt"}\n`
    );
    return rot ? 1 : 0;
}

hauptLauf(async () => {
    if (argv.includes("--realismus")) process.exit(realismus());
    await server.lausche(PORT);
    // `--faden --echt`: das Fenster an der echten GPU (die Adapter-Zeile `[linse-gpu]`), jede andere Probe am Null-Renderer
    const browser = await starteBrowser({ art: ECHT ? "echt" : "standard", headless: !ECHT, frist: 900000 });
    const page = await browser.newPage();
    if (!ECHT) await nullRenderer(page);
    // der EINE Abdruck der Seite (SHA-256 eines Felds, hex) für Probe und Studio
    await page.evaluateOnNewDocument(() => {
        window.__sha = async (a) =>
            [...new Uint8Array(await crypto.subtle.digest("SHA-256", a.buffer.slice(a.byteOffset, a.byteOffset + a.byteLength)))]
                .map((b) => b.toString(16).padStart(2, "0"))
                .join("");
    });
    if (argv.includes("--studio")) process.exit(await studioProbe(page));
    const url = `http://127.0.0.1:${PORT}/index.html`;
    if (argv.includes("--faden")) process.exit(await faden(page, url));
    if (argv.includes("--kern")) process.exit(await kernProbe(page, url));
    // Frische Standard-Welt (der Boot-Seed): kein Rest einer früheren Welt im Profil.
    await frisch(page, url);

    if (argv.includes("--gebaut")) process.exit(await gebaut(page));
    console.log("\n========= DER DICHTE-SPIEGEL — Main _voxelEditedDensityGrid == Worker computeDensityGrid =========");
    const berichte = [];
    let rot = false;
    // DIE ABSENZ (plan §10 R1): der Name der Bühne steht nur in spec/ und in der Werkbank — der Stamm, der Worker und der
    // Seh-Spiegel lesen Zahlen (Terme, Wildnis-Gewicht), nie einen Namen; gezählt wird der CODE (der EINE Stripper).
    const nennt = (src) => (stammLib.ohneKommentare(src).match(/pruefbuehne|prüfbühne/gi) || []).length;
    for (const datei of [...stammLib.dateien(root), "voxel-worker.js"]) {
        const n = nennt(liesText(path.join(root, datei)));
        if (n) {
            console.log(`  ⛔ ABSENZ: ${datei} nennt die Bühne ${n}× (ein Flag statt der Terme)`);
            rot = true;
        }
    }
    if (SELBSTTEST && nennt('if (w.slug === "pruefbuehne") return 0; // die Prüfbühne\n/* pruefbuehne */') !== 1) {
        console.log("  ⛔ ABSENZ-SELBSTTEST: der Grep sieht den Namen im Code nicht oder zählt ihn im Kommentar");
        rot = true;
    }
    let selbst = null;
    let urform = "";
    for (const welt of WELTEN) {
        let weltArg = welt;
        const json = JSON.parse(liesText(BUEHNE_DATEI));
        if (welt === "buehne") {
            const stationen = JSON.parse(
                liesText(path.resolve(path.dirname(BUEHNE_DATEI), "stationen.json"))
            ).stationen;
            // Geboren wie im Spiel: importWorldBeside (Welt-Tor), dann der Welt-Wechsel des Spiels (`_weltWechselNeuLaden`:
            // Zeiger, Sperre, Reload) — ein Speichern der alten Seite bis zu ihrem Tod setzte den Zeiger sonst zurück
            const nav = page.waitForNavigation(LADEN);
            const id = await page.evaluate((json) => {
                const r = window.anazhRealm;
                const res = r.importWorldBeside(json);
                if (!res.ok) return null;
                setTimeout(() => r._weltWechselNeuLaden(res.worldId));
                return res.worldId;
            }, json);
            if (!id) throw new Error("die Bühne ließ sich nicht importieren");
            await nav;
            weltArg = { stationen };
        }
        const b = await booteWelt(page);
        if (!b.ok) {
            console.log(`  ⛔ Welt ${welt}: Boot nicht bereit nach 120 s`);
            rot = true;
            continue;
        }
        console.log(`  Boot ${welt}: ${b.ms} ms (Seed ${b.seed})`);
        if (welt === "standard") {
            const ist = await strom(page, false);
            console.log(`    Strom vor dem Ack (Teil S): ${ist}`);
            if (ist !== STROM_SOLL) {
                console.log(`  ⛔ STROM: _acquireVoxelChunkBuild vor dem Ack — Soll ${STROM_SOLL}`);
                rot = true;
            }
            if (SELBSTTEST)
                console.log(`  SELBSTTEST Strom (die Urform, Soll ROT): ${(urform = await strom(page, true))}`);
        }
        const rep = await probe(page, weltArg, !!ABDRUCK);
        rep.welt = welt;
        rep.bootMs = b.ms;
        zeige(rep);
        if (rep.erbgut) {
            console.log(
                `    Erbgut: [${rep.erbgut.terme.join(", ")}] · Wildnis-Gewicht ${rep.erbgut.wildnis} · Höhen ${rep.hoehen.map((h) => h.id + " " + h.y).join(" · ")}`
            );
            if (welt === "buehne") {
                const soll = json.worldMeta.erbgut.terme.map((t) => t.art);
                if (rep.erbgut.wildnis !== 0 || rep.erbgut.terme.join() !== soll.join())
                    rep.befunde.push(`die Bühne trägt nicht ihr Erbgut (lebend [${rep.erbgut.terme}], Spec [${soll}])`);
            } else if (rep.erbgut.wildnis !== 1 || rep.erbgut.terme.join() !== "wildnis")
                rep.befunde.push(`die Standard-Welt trägt nicht [wildnis] (lebend [${rep.erbgut.terme}])`);
            for (const b of rep.befunde.filter((b) => b.includes("trägt nicht"))) console.log("  ⛔", b); // nach `zeige` geschoben
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
            const v = await probeVerfaelscht(page, url);
            selbst = {
                abweichend: v.abweichend,
                maxDiff: v.maxDiff,
                gitter: v.gitter,
                ferne: v.ferne ? v.ferne.abweichend : 0,
                wald: v.wald ? v.wald.abweichend : 0,
                namen: ["FERN-RING"].filter((n) => v.befunde.some((b) => b.startsWith(n))).join(),
            };
            console.log(
                `\n  SELBSTTEST (der Faden lädt den Kern mit der Höhe + 1 cm): ${v.abweichend} abweichende Ecken in ${v.gitter} Gittern, maxDiff ${v.maxDiff}`
            );
        }
    }
    if (ABDRUCK) {
        const b0 = berichte[0] || {};
        const abdruck = {
            wurzel: root,
            seed: b0.seed,
            makro: b0.shaMakro,
            saaten: b0.shaSaaten || null,
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
        abdruck.leser = b0.shaLeser || null;
        abdruck.leserSaaten = b0.shaLeserSaaten || null;
        fs.writeFileSync(ABDRUCK, JSON.stringify(abdruck, null, 1));
        console.log(
            `\n  Abdruck: ${ABDRUCK} (${abdruck.gitter.length} Gitter + Makro ${Object.keys(abdruck.saaten || {}).length} Saaten${abdruck.buehne ? " + Bühne" : ""})`
        );
    }
    if (JSON_AUS) fs.writeFileSync(JSON_AUS, JSON.stringify({ berichte, selbst }, null, 1));
    let pass;
    if (SELBSTTEST) {
        // die Höhen der Ferne (K60) fallen mit demselben verfälschten Worker-Term rot, der Zwilling der Form beim Namen
        console.log(`  SELBSTTEST Zwilling der Form: rot ${selbst ? selbst.namen : "?"} (Soll FERN-RING)`);
        pass =
            !rot &&
            selbst &&
            selbst.abweichend > 0 &&
            selbst.ferne > 0 &&
            selbst.wald > 0 &&
            urform &&
            urform.endsWith("Reihe verzögert") &&
            selbst.namen === "FERN-RING";
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
});
