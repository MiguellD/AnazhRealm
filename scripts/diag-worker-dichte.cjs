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
//   node scripts/diag-worker-dichte.cjs --gezeit [--selftest] [--json datei]
//                                                      die Gezeit am Watt (Kopf von `gezeitProbe`)
//   node scripts/diag-worker-dichte.cjs --abdruck datei [--wurzel dir]
//                                                      der BYTE-ABDRUCK beider Welten (SHA-256 je Gitter, Main UND
//                                                      Worker, und der Makro-Höhe auf einem 64×64-Gitter für drei
//                                                      Welt-Saaten und das Prüfbühnen-Erbgut) — gegen
//                                                      einen anderen Stand (`--wurzel` = sein Baum) verglichen beweist er
//                                                      „byte-gleich"
// Port: WORKER_DICHTE_PORT (Default 4392). Exit 1 bei Drift, Längen-Mismatch, Page-Error oder rotem Selbsttest.
"use strict";
const { fehlerText, statikServer, nullRenderer, ortZug, starteBrowser, hauptLauf, sleep, argOpt: opt, booteWelt, jsonSchreiben, jsonKlon, ausDatei, path, stammLib, SELBSTTEST, mass } = require("./lib/welt-boot.cjs");
const liesText = (datei) => ausDatei(datei);
const { messort } = require("./lib/welt-orte.cjs");
const { WASSER_INSTALL } = require("./lib/wasser-linse.cjs");

const argv = process.argv.slice(2);
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
        async (welt, mitAbdruck, punkte, messorte, N_TURM, zwilling, RANG_REIHE) => {
            const s = st;
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
                    const p = rang(fl.points);
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
                    const wc = m?.waterCells ? new Uint8Array(m.waterCells) : new Uint8Array(0);
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
                                aus.wand > 0 ? 1 / AnazhRealm.TERRAIN_GEOLOGY.schutt : 0
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
                // DIE MASCHE DES FELDS (w28-feld-fuss): die vier innersten Reihen des Feld-Passes um den Spieler, wie
                // `_feldPassMal` sie bestellt, beim Feld-Faden — und dieselben Punkte als Ring (`ring`) und als reines Gesetz
                // (`teile`). Der Ring fragt OHNE Fuß (Wort für Wort das Gesetz), die Reihe an der Naht trägt die Zahl des
                // Rings (Gesetz → Gewässer-Form → Spiegel, bis auf die f32-Ablage des Felds), dahinter liest das Feld die
                // Stufe seiner Masche (sonst zählt der Fuß nichts: die Kosten der Ebene 2 stehen wieder im Bild). Nur die
                // Standard-Welt trägt das Netz der Wildnis. Der Ring rechnet jede Ecke zweimal: als Punkt (Masche 0, der
                // Bezug des Felds — den verfälscht auch ein Ring nicht, der seinen Fuß nennt: der Selbsttest nimmt alle
                // drei Zeilen im selben Boot) und mit der Masche des Rings dort (gegen das reine Gesetz).
            }
            if (r._getVoxelWorker() && welt === "standard") {
                const pm = s.playerMesh ? s.playerMesh.position : { x: 0, z: 0 };
                const [FP, FR] = [AnazhRealm.FELD_PASS, AnazhRealm.FERN_RING];
                const rMin = FR.schalen[FR.schalen.length - 1].aussen;
                const hrF = (FP.rMaxM - rMin) / (2 * FP.rad);
                const REIHEN = 4;
                const nF = FP.az * REIHEN;
                const pF = new Float32Array(nF * 2);
                const [ht, hr, rad, ang, q] = [0, 0, 0, 0, 0].map(() => new Float64Array(nF * 2));
                for (let iy = 0, k = 0; iy < REIHEN; iy++)
                    for (let ix = 0; ix < FP.az; ix++, k++) {
                        const rr = rMin + ((iy + 0.5) / FP.rad) * (FP.rMaxM - rMin);
                        const a = ((ix + 0.5) / FP.az - 0.5) * 2 * Math.PI;
                        pF[k * 2] = pm.x + Math.cos(a) * rr;
                        pF[k * 2 + 1] = pm.z + Math.sin(a) * rr;
                        [rad[k], ang[k], q[k]] = [rad[nF + k], ang[nF + k], q[nF + k]] = [rr, a, 1.1];
                        ht[nF + k] = hr[nF + k] = (Math.PI * rr) / FP.az;
                    }
                const kopf = { ax: pm.x, az: pm.z };
                const feld = await r._fernAuftrag("feld", {
                    ...kopf,
                    punkte: pF.slice(),
                    azN: FP.az,
                    hr: hrF,
                    naht: rMin,
                    saison: r._fernSaison({ r: 1, g: 1, b: 1 }),
                    praesenz: r._fernPraesenz(),
                });
                const ring = await r._fernAuftrag("ring", {
                    ...kopf,
                    punkte: Float64Array.from([...pF, ...pF]),
                    ht,
                    hr,
                    rad,
                    ang,
                    q,
                    zone: new Uint8Array(nF * 2),
                    deckZoneRad: 0,
                    memo: r._fernMemoGen | 0,
                });
                const rein = await r._fernAuftrag("teile", { punkte: Float64Array.from(pF), detail: false, nurHoehe: true });
                const [rb, tb] = [new BigUint64Array(ring.law.buffer), new BigUint64Array(rein.law.buffer)];
                const ma = (out.masche = { n: nF, ringUngleich: 0, naht: 0, liest: 0, groesste: 0 });
                for (let k = 0; k < nF; k++) {
                    if (rb[nF + k] !== tb[k]) ma.ringUngleich++;
                    const d = Math.abs(feld.daten[k * 4] - (ring.nassY[k] < ring.spiegel[k] ? ring.spiegel[k] : ring.nassY[k]));
                    if (k < FP.az) ma.naht = Math.max(ma.naht, d);
                    else {
                        if (d > 1e-3) ma.liest++;
                        ma.groesste = Math.max(ma.groesste, d);
                    }
                }
            }
            // TEIL W — DER BESTAND DES WALDS: die stehenden Darts der Wald-Zellen um jeden Ort (9 × 9 Zellen; die geborenen
            // und das Urteil der Kronen-Schüchternheit, phyto-core `forestStehende`) im Main (`_forestCellDarts`, frisches
            // Gedächtnis) und im Wald-Faden (`_voxelWorkerWaldDarts`, entpackt über `_waldDartsEntpacken`, wie die Schlange
            // des Walds sie ins Gedächtnis legt) — jede Zelle Wort für Wort gleich (JSON ihrer Darts). Die Streu wartet auf den
            // Bestand des Fadens; drifteten sie, stünde die Gestalt der Ferne auf einer anderen Wahrheit als der Wald der Nähe.
            if (r._getVoxelWorker() && r._forestGesetzWahr()) {
                const wa = (out.wald = { zellen: 0, darts: 0, abweichend: 0, erste: null });
                const seedInt = r._forestSeedInt();
                const C = AnazhRealm.FOREST.cell;
                for (const ort of orte) {
                    const zellen = [];
                    for (let i = -4; i <= 4; i++)
                        for (let j = -4; j <= 4; j++) zellen.push(Math.floor(ort.x / C) + i, Math.floor(ort.z / C) + j);
                    // die Wahrheit zuerst (wie `kernLesen`): die Hydro-Kacheln des Fensters stehen, bevor der Main fragt — sonst ist
                    // seine Antwort vorläufig (`_forestCellDarts`: der Spiegel einer fehlenden Kachel liest das Meer, gelaende-core
                    // `atlasSpiegel`), der Faden antwortet nach ihr (w28-laub-kante: Wiese 81 von 81 Zellen vorläufig, Erle ↔ Birke
                    // an -25,-94 und -24,-93, die Selbst-Ausdünnung trug es nach -24,-92)
                    await __weltDa(() => !r._ensureHydroTilesAround(ort.x, ort.z, (4 + AnazhRealm.WALD_PLAN.urteil + 1) * C));
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
            // TEIL R — DIE WAHL DES WALD-FADENS (w28-wald-rang): vier Aufträge in EINER Aufgabe, der fernste zuerst gesendet, der
            // nächste zuletzt (`rang` = Abstand², wie `_waldFadenSchicken` ihn reicht) — der Faden liefert nah zuerst, aufsteigend
            // nach Rang, nie in der Reihe der Ankunft. `out.rang` = die Abstände (m) in der Reihe der Lieferung. Der Fund (GTX 1050
            // kalt, main 63655917): die Reihe des Fadens reichte seiner Schlange je Takt EINEN Auftrag, die Wahl hatte nie eine
            // Wahl — die 16 Zellen unter dem Spieler kamen hinter acht Aufträgen in 210–424 m, sein Wald-Stück pflanzte zuletzt.
            // DER RIEGEL (w28-rang-riegel): die Wahl hat nur eine Wahl, wenn alle vier im Faden WARTEN — vier `postMessage` einer
            // Aufgabe kommen nicht als ein Stück an. Der Fund (CI 44233399519, voll 16/18 am w28-haus-stoff 509212d6): geliefert
            // 500 · 1 · 300 · 400 — der Faden hatte den ersten Auftrag allein und rechnete ihn, gesetzestreu; die Linse urteilte den
            // Abstand zweier Sendungen am Läufer (nachgestellt: 40 ms Lücke nach der ersten Sendung → dieselbe Reihe). Darum reist
            // ein Riegel voraus (8 × 8 Zellen, Rang 0): solange der Faden ihn rechnet, kommen die vier an und warten zusammen —
            // der Fall des Funds (nahe Aufträge treffen auf einen Faden in Arbeit). `out.riegel` = [Dauer des Riegels ms, Spanne
            // des Sendens ms, Versuch]. Hielt er nicht (Dauer ≤ 2 × Spanne: die vier kamen nicht sicher in seiner Zeit), wächst er
            // und die Probe fährt an frischen Zellen neu, höchstens dreimal — danach bleibt `out.rang` leer: die Probe ist LEER
            // (rot beim Namen), nie ein Urteil über die Wahl.
            if (r._getVoxelWorker() && r._forestGesetzWahr()) {
                const seedInt = r._forestSeedInt();
                const C = AnazhRealm.FOREST.cell;
                const [gx0, gz0] = [Math.floor(orte[0].x / C), Math.floor(orte[0].z / C)];
                const auftrag = (zellen, rang) => r._voxelWorkerWaldDarts(new Int32Array(zellen), seedInt, r._forestExtraSpecies(), rang);
                for (let versuch = 0; versuch < 3 && !out.rang; versuch++) {
                    const kam = [];
                    const z0 = gz0 + 40 * versuch;
                    const riegel = [];
                    for (let i = 0; i < 8 << versuch; i++) for (let j = 0; j < 8; j++) riegel.push(gx0 + 120 + i, z0 + j);
                    const t0 = performance.now();
                    let dauer = 0;
                    const vor = auftrag(riegel, 0).then(() => (dauer = performance.now() - t0));
                    const vier = RANG_REIHE.map((m, k) => {
                        const zellen = [];
                        for (let i = 0; i < 4; i++) for (let j = 0; j < 4; j++) zellen.push(gx0 + 40 + 10 * k + i, z0 + j);
                        return auftrag(zellen, m * m).then(() => kam.push(m));
                    });
                    const spanne = performance.now() - t0;
                    await Promise.all([vor, ...vier]);
                    out.riegel = [Math.round(dauer), +spanne.toFixed(2), versuch + 1];
                    if (dauer > 2 * spanne) out.rang = kam;
                }
            }
            // TEIL B — DER WUCHS IM FADEN (w4-b-pflanzen): jedes Skelett im Vorrat (`_wuchsVorrat`: gepackt vom Wald-Faden im Boot,
            // die Saat wartet auf ihn; Schlüssel `<Art>|<Same>|…`) gegen den Wuchs desselben Plans im Haupt-Faden (`_wuchsPlan` →
            // phyto-core `growSkeleton` am Strom `_rollGenome(...).seq`) — Bit für Bit (die Wörter des Float64Array); `out.wuchs` =
            // [Skelette, abweichend]. `zwilling` (Selbsttest): ein Wort jedes Skeletts im Vorrat ist verfälscht.
            const wu = (out.wuchs = [0, 0]);
            for (const [k, f] of r._wuchsVorrat || []) {
                const plan = r._wuchsPlan(...k.split("|", 2));
                if (zwilling) f[9]++;
                const g = r._phytoGrowSkeleton(plan.P, r._rollGenome(plan.sKey, "tree-genome").seq("phyto-growth"));
                wu[0]++;
                wu[1] += String(new Uint32Array(globalThis.__phytoCore.wuchsPacken(g).buffer)) !== String(new Uint32Array(f.buffer));
            }
            return out;
        },
        welt,
        mitAbdruck,
        mitAbdruck ? abdruckPunkte() : [],
        ["wiese", "genesis"].map((id) => ((o) => ({ id, x: o.x, z: o.z }))(messort(id))),
        10,
        zwilling,
        RANG_REIHE
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
        const s = st;
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

// TEIL E — DIE SPALTE EINMAL (w27-ankunft-faden): `_terrainColumnContextIn` rechnet je Stand EINMAL (neu je Ruf: 1, 0) und trägt
// das Gesetz des Kerns (`dichteSpalte` samt Keller, sonst NaN); ein neuer Stand (der Wasserspiegel) rechnet neu. `vergisst`
// (Selbsttest): das Gedächtnis vergisst vor jedem Ruf — ROT beim Namen.
const SPALTE_SOLL = "1,0,1";
const spalteEinmal = (page, vergisst) =>
    page.evaluate((vergisst, wl = st.waterLevel, x = st.playerMesh.position.x + 0.37, z = st.playerMesh.position.z) => {
        const ruf = (S = r._spalten, n = S.neu, c = (vergisst && S.gen++, r._terrainColumnContextIn(x, z, {}))) =>
            JSON.stringify({ ...__gelaendeCore.dichteSpalte(r._gelaende(), x, z, {}), keller: r._kellerLage(x, z) }) === JSON.stringify(c) ? S.neu - n : NaN; // prettier-ignore
        st.waterLevel = wl + 0.25;
        const neu = [ruf(), ruf()];
        st.waterLevel = wl;
        return neu.concat(ruf()).join();
    }, vergisst);

// Der Selbsttest: der Voxel-Faden lädt den Kern mit der Höhe + 1 cm — die Probe MUSS ihn bei Ort, Gitter, Ferne und Wald nennen.
async function probeVerfaelscht(page, url) {
    KERN_MODUS.faden = "Höhen-Versatz";
    KERN_MODUS.wald = true;
    try {
        await frischBoot(page, url);
        return await probe(page, "standard", false, true);
    } finally {
        KERN_MODUS.faden = null;
        KERN_MODUS.wald = false;
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
    "Höhen-Versatz": ["let h = hoeheGrund(L, x, z, mitDetail, aus, fuss);", "let h = hoeheGrund(L, x, z, mitDetail, aus, fuss) + 0.01;"],
    // die Gezeit (`--gezeit`): der Hub des Meers fällt auf 0 — der Spiegel steht
    "Spiegel steht": ["return k * GEZEIT.stufe;", "return 0;"],
    // die Gezeit (`--gezeit`): der Spiegel des Lands (`landSpiegel`) trägt die Uhr — die Ebbe gäbe das Watt dem Wald und dem Ort
    "Land mit Uhr": ["if (!L.gezeit) return L;", "return L;"],
};
const KERN_MODUS = { haupt: null, faden: null, probe: null, wald: false }; // je Boot die Mutation im Haupt-Faden, im Voxel-Faden, in der Probe; `wald`: der Faden ohne „die Reihe zuerst“
// TEIL R: die Abstände (m) der vier Aufträge in der Reihe des Sendens — und die Zeile des Fadens, die seiner Wahl die Wahl gibt
// (der Selbsttest nimmt sie ihm: er muss in der Reihe der Ankunft liefern)
const RANG_REIHE = [500, 400, 300, 1];
const RANG_SOLL = RANG_REIHE.slice().sort((a, b) => a - b).join(" · ");
// Das Urteil über Teil R → [gut, Satz]: die Wahl wird nur geurteilt, wo der Riegel hielt (`rep.rang` steht); sonst ist die Probe
// LEER — beim Namen, mit Dauer und Spanne, nie als RANG (der wäre ein Urteil über den Läufer).
function rangUrteil(rep) {
    const rg = rep.riegel;
    if (!rg) return [false, "⛔ LEER: kein Wald-Faden oder kein Wald-Gesetz — die Wahl blieb ungeprüft"];
    const hinter = `hinter dem Riegel (${rg[0]} ms, Senden ${rg[1]} ms, Versuch ${rg[2]})`;
    if (!rep.rang) return [false, `⛔ LEER: der Riegel hielt den Faden in ${rg[2]} Versuchen nicht ${hinter} — die Wahl blieb ungeprüft`];
    const kam = rep.rang.join(" · ");
    if (kam === RANG_SOLL) return [true, `geliefert ${kam} ${hinter} — nah zuerst`];
    return [false, `geliefert ${kam || "nichts"} ${hinter} — ⛔ RANG: der Wald-Faden liefert nicht nah zuerst (Soll ${RANG_SOLL})`];
}
const WALD_REIHE_ZUERST = "if (reihe.length && !reiheHaelt) return void waldWecken();";
// DIE MASCHE DES FELDS (w28-feld-fuss): die drei Zeilen des Fern-Fadens, die der Selbsttest ihm im selben Boot nimmt — der
// Ring nennt dem Gesetz einen Fuß (ROT am bit-Diff) · die Reihe an der Naht fragt mit einem Fuß (ROT an der Naht) · das Feld
// hinter der Naht fragt mit Fuß 0 (ROT: es liest die ganze Stufe, die Kosten der Ebene 2 stehen wieder im Bild).
const MASCHE_MUTANTEN = {
    ring: ["let L = G.hoehe(state, x, z, false, aus);", "let L = G.hoehe(state, x, z, false, aus, 2 * Math.max(msg.ht[k], msg.hr[k]));"],
    naht: ["< 2 * msg.hr ? 0 :", "< 2 * msg.hr ? 300 :"],
    fuss: ["Math.sqrt(4 * fuss.ht * msg.hr)", "0"],
};
const MASCHE_NAHT_M = 1e-3; // die f32-Ablage des Felds (ein Schritt bei 255 m: 1,5e-5 m)
function mascheUrteil(ma) {
    if (!ma) return { gut: false, rot: ["leer"], taeter: "kein Voxel-Faden — keine Probe der Masche" };
    const rot = [];
    const namen = [];
    if (ma.ringUngleich !== 0) {
        rot.push("ring");
        namen.push(`der Ring fragt das Gesetz mit einem Fuß: ${ma.ringUngleich} von ${ma.n} Punkten weichen vom reinen Gesetz ab (voxel-worker fernAuftrag „ring“)`);
    }
    if (!(ma.naht <= MASCHE_NAHT_M)) {
        rot.push("naht");
        namen.push(`die Reihe des Felds an der Naht trägt nicht die Zahl des Rings: größte Differenz ${ma.naht.toFixed(3)} m (voxel-worker fernAuftrag „feld“: die Masche an \`msg.naht\` fragt ohne Fuß)`);
    }
    if (!(ma.liest > 0)) {
        rot.push("fuss");
        namen.push("das Feld hinter der Naht liest die ganze Stufe des Netzes: kein Punkt weicht vom Ring-Gesetz ab (voxel-worker fernAuftrag „feld“ nennt gelaende-core `hoehe` seine Masche nicht)");
    }
    return { gut: !rot.length, rot, taeter: namen.join(" · ") };
}
const kernQuelle = (wurzel = root) => ausDatei(path.join(wurzel, "gelaende-core.js")); // der EINE Leser des Kerns
const kernMutiert = (roh, name) => String(roh).replace(...(KERN_MUTATIONEN[name] || ["", ""]));
function kernWandle(p, roh) {
    if (p === "/voxel-worker.js" && KERN_MODUS.wald && roh) {
        if (String(roh).split(WALD_REIHE_ZUERST).length !== 2) throw new Error("Teil R: der Selbsttest findet die Zeile „die Reihe zuerst“ nicht in voxel-worker.js");
        let text = String(roh).replace(WALD_REIHE_ZUERST, "");
        for (const [name, [alt, neu]] of Object.entries(MASCHE_MUTANTEN)) {
            if (text.split(alt).length !== 2) throw new Error(`die Masche des Felds: der Selbsttest findet die Zeile „${name}“ nicht in voxel-worker.js`);
            text = text.replace(alt, neu);
        }
        return text;
    }
    if (p === "/gelaende-core.js" && KERN_MODUS.haupt) return kernMutiert(roh, KERN_MODUS.haupt);
    if (p === "/gelaende-core.faden.js") return kernMutiert(kernQuelle(), KERN_MODUS.faden);
    // die Fäden des Gesetzes holen ihre Kerne aus der EINEN Quelle, deren Liste der Stamm nennt (`FADEN_QUELLE`, w28-faden-quelle):
    // dort liest der Voxel-Faden den Kern des Fadens
    if (p !== "/stamm/gelaende-chunks.js" || !roh || KERN_MODUS.faden === KERN_MODUS.haupt) return roh;
    return String(roh).replace('"phyto-core.js", "gelaende-core.js"]', '"phyto-core.js", "gelaende-core.faden.js"]');
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
            const zufall = ((z) => (w) => (z() * 2 - 1) * w)(window.__phytoCore.mulberry32(0x2545f491));
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
        for (const [x, z, R] of [[...plan.orte[1], 700], [...plan.orte[2], 64]]) await __weltDa(() => !r._ensureHydroTilesAround(x, z, R));
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
    // jeder Voxel-Faden: die Leser seines Chunk-Baus, sobald er die Edits trägt. Der Planet-Faden (sonnenbahn 2, K6: geboren
    // mit seinem ersten Leser, dieselbe Quelle `_quelleStand().url`, Name „planet“) baut keine Chunks und trägt nie Edits — bis
    // hier wartete die Probe auf sie in ihm und stürzte (`sleep` lebt nicht im Faden: ReferenceError, EXIT 2). Gewartet wird von
    // hier aus mit dem EINEN `sleep` (welt-boot), der Faden antwortet nur auf Fragen
    seite.faden = [];
    for (const w of page.workers()) {
        if (!(await w.evaluate(`typeof terrainDensityAt === "function" && self.name !== "planet" && !!(${KERN_HILFE})`).catch(() => false))) continue;
        for (let t = 0; t < 200 && (await w.evaluate("state.voxelEdits.length")) < plan.edits.length; t++) await sleep(25);
        seite.faden.push(
            await w.evaluate(
                (b) => __kern.lies(b, terrainDensityAt, (x, y, z) => waterLevelAt(x, z), (x, y, z) => atlasWaterLevelAt(x, z, y), hydroRiverAt),
                plan.punkte
            )
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
    console.log(`  Die Edit-Karte steht: ${rein.karteNeu[0]} Neubauten in ${N} Proben${SELBSTTEST ? ` · Rückfall rot: ${karteRot(rein.karteNeu[1])}` : ""}`);
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
        // die Zeile eines Selbsttests trägt ihr Urteil vorn (✅ die Mutante fiel · ⛔ sie blieb blind): der Kopf der GPU-Probe liest jede
        // Zeile mit dem Wort ROT ohne ✅ als Urteil (scripts/lib/urteil-zeile.cjs) — die Wand stand an der Probe ROT über „✅ PLANET GRÜN“
        console.log(`  ${selbsttest[wer].nennt ? "✅" : "⛔"} SELBSTTEST (${wer} liest den unveränderten Kern): ≠ Kern Stamm ${g.stamm} · Faden ${g.faden} → ${selbsttest[wer].nennt ? "beim Namen ROT" : "BLIEB BLIND"}`);
    }
    if (selbsttest && !(selbsttest.sieht = selbsttest["WORKER-FELD"].nennt && selbsttest["STAMM-LESER"].nennt)) befunde.push("SELBSTTEST: eine Abschrift blieb unentdeckt");
    const kern = { punkte: N, edits: plan.edits.length, haelt: rein.haelt, orte: plan.orte, wirkt: rein.wirkt, faeden: rein.faden.length, rein: g0, mutationen, selbsttest,
        sekunden: Math.round((Date.now() - t0) / 1000) };
    for (const b of befunde) console.log("  ⛔", b);
    console.log(`\n${befunde.length ? "⛔ KERN-PROBE ROT" : "✅ KERN-PROBE GRÜN"}: ${N} Punkte, ${mutationen.filter((z) => z.gut).length}/4 Mutationen ziehen beide Leser · ${kern.sekunden} s\n`);
    if (JSON_AUS) jsonSchreiben(JSON_AUS, { kern });
    return befunde.length ? 1 : 0;
}

// ── DIE GEZEIT (`--gezeit`, karte2.planet.wasser.gezeiten #1/#2): der Spiegel des Meers schwingt an der Welt-Uhr (gelaende-core
// `gezeitStufe`: M2 + S2), Stamm-Leser und jeder Voxel-Faden lesen ihn Wort für Wort gleich, das Watt fällt trocken. Gemessen am
// Ort des Zensus (Rang 6 „Nordsee-Watt“, x 0, z 10430–10830: das Watt-Profil in 40 m, sein Ende im Meer) über 24,84 h in
// Viertelstunden: die Uhr des Tags der Prozesse (`spielZeit` unter der Tag-Länge des Spiels) geht, der Takt des Pegels
// (`_pegelTakt`) trägt die Stufe in Lage und Faden. Die Leser: Stamm `_atlasWaterLevelAt` · `_nassAt` (das Wasser des Leibs),
// Faden `atlasWaterLevelAt` (der Spiegel jedes Chunk-Baus). Die Soll-Zahlen aus der Quelle (de.wikipedia „Gezeiten“, Pegel
// Cuxhaven: Tidenhub Spring 3,48 m · Nipp 2,54 m; Periode M2 12,4206 h, Schwebung 14,765 d), über 30 Tage der Spring-Nipp-Takt.
// DAS LAND steht zeitlos: der Spiegel des Lands (Stamm `_landSpiegelAt`, Faden `landWaterLevelAt` — gelaende-core `landSpiegel`,
// der Leser jedes Werks, das gesetzt wird: Wald, Genesis-Ort, `_landAt`) liegt in jeder Viertelstunde Wort für Wort gleich.
// DIE GEBURT: zur Welt-Uhr 0 steht das Meer im Mittel (`_weltUhrNeu(0)`).
// DER RING: der Fern-Ring an diesem Ort legt die Punkte der Gezeit zu jeder Stufe neu (`gezeitRing`, Leser `_fernRingY`).
// Das Urteil nennt den Täter: STEHT (der Hub fiel) · HUB · PERIODE · SCHWEBUNG · SPIEGEL (Stamm ≠ Faden) · WATT · LAND · GEBURT · RING · TRÄGER.
// Selbsttest: „Spiegel steht“ in Wirt und Faden MUSS STEHT nennen, nur im Faden MUSS SPIEGEL nennen, „Land mit Uhr“ MUSS LAND nennen,
// „der Ring steht“ MUSS RING nennen.
const GEZEIT_ORT = Object.freeze({ x: 0, z0: 10430, dz: 40, n: 11, name: "Nordsee-Watt (Zensus Rang 6)" });
const GEZEIT_SOLL = Object.freeze({ periodeH: 12.4206, periodeTol: 0.01, spring: 3.48, nipp: 2.54, hubTol: 0.05, schwebungD: 14.765, schwebungTol: 0.02, fensterH: 24.84, schrittH: 0.25, tage: 31 });
async function gezeitLesen(page, ring) {
    const seite = await page.evaluate(async (O, S) => {
        const r = window.anazhRealm;
        const st = r.state;
        r._gameLoopTick = () => {};
        const zM = O.z0 + (O.dz * (O.n - 1)) / 2;
        await __weltDa(() => !r._ensureHydroTilesAround(O.x, zM, 600));
        const punkte = Array.from({ length: O.n }, (_, i) => [O.x, O.z0 + i * O.dz]).map(([x, z]) => [x, z, r._terrainMacroSurfaceY(x, z)]);
        const L0 = r._gelaende();
        if (!L0.gezeit) return { traeger: false };
        const normS = r._kalender().normS;
        const basis = st.spielZeit;
        // die Geburt: zur Welt-Uhr 0 steht das Meer im Mittel (die Uhr einer neuen Welt, `_weltUhrNeu` — die Probe bestellt sie bei
        // der Welt, die Ein-Schreiber-Wand; den Null-Tag eines Stands liest die Uhr der Gezeit nicht, sie ist Kalender-Zeit)
        r._weltUhrNeu(0);
        const geburt = { k: r._gezeitStand().k, stunde: r._gezeitStand().stunde };
        r._weltUhrNeu(basis);
        // die Uhr der Probe: die Stunde h nach dem Anfang (die Welt-Uhr über `_weltUhrNeu`: die Messung kehrt zu ihrem Anfang
        // zurück), der Takt des Pegels trägt die Stufe
        window.__gezeitUhr = (h, takt) => (r._weltUhrNeu(basis + (h * normS) / 24), takt && r._pegelTakt(), r._gelaende().gezeit);
        window.__gezeitBasis = basis;
        // der Spring-Nipp-Takt: die Stufe des Trägers über `tage` Tage, je Viertelstunde (`_gezeitStand`, ohne Takt)
        const ks = [];
        for (let h = 0; h <= S.tage * 24 + 1e-9; h += S.schrittH) ks.push((__gezeitUhr(h, false), r._gezeitStand().k));
        __gezeitUhr(0, true);
        return { traeger: true, h0: L0.gezeit.stunde, stufe: globalThis.__gelaendeCore.GEZEIT.stufe, punkte, ks, geburt };
    }, GEZEIT_ORT, GEZEIT_SOLL);
    if (!seite.traeger) return seite;
    const faeden = [];
    for (const w of page.workers()) if (await w.evaluate(`typeof atlasWaterLevelAt === "function" && self.name !== "planet"`).catch(() => false)) faeden.push(w);
    // je Viertelstunde: die Uhr geht, der Takt des Pegels schickt die Stufe (`state-update` delta.gezeit), der Stamm-Leser liest,
    // dann jeder Voxel-Faden, sobald die Stufe in SEINEM Stand angekommen ist — nie von der Probe gesetzt
    seite.proben = [];
    seite.faden = faeden.map(() => []);
    seite.fadenLand = faeden.map(() => []);
    seite.verspaetet = 0;
    for (let h = 0; h <= GEZEIT_SOLL.fensterH + 1e-9; h += GEZEIT_SOLL.schrittH) {
        const p = await page.evaluate(
            (h, P) => {
                const g = __gezeitUhr(h, true);
                const r = anazhRealm;
                const G = globalThis.__gelaendeCore;
                const land = () => P.map(([x, z, y]) => r._landSpiegelAt(x, z, y));
                const p = { h, k: g.k, stamm: P.map(([x, z, y]) => r._atlasWaterLevelAt(x, z, y)), land: land(), nass: P.map(([x, z, y]) => (r._nassAt(x, z, -0.05, y) ? 1 : 0)).join("") };
                // die Gegen-Tide: derselbe Augenblick unter dem Träger eine halbe M2 später (der Pegel der Seen und Flüsse geht weiter
                // an der Uhr — das Land fragt ihn; die Gezeit nie)
                r._gezeitTraeger = G.gezeitStand(g.stunde + G.GEZEIT.teile[0].stunden / 2);
                [p.kGegen, p.landGegen] = [r._gezeitTraeger.k, land()];
                r._gezeitTraeger = g;
                return p;
            },
            h,
            seite.punkte
        );
        seite.proben.push(p);
        for (let i = 0; i < faeden.length; i++) {
            let v = null;
            for (let t = 0; t < 200 && v === null; t++) {
                v = await faeden[i].evaluate((P, k) => (state.gezeit && state.gezeit.k === k ? [P.map(([x, z, y]) => atlasWaterLevelAt(x, z, y)), P.map(([x, z, y]) => landWaterLevelAt(x, z, y))] : null), seite.punkte, p.k);
                if (v === null) (seite.verspaetet++, await sleep(5));
            }
            seite.faden[i].push(v ? v[0] : seite.punkte.map(() => NaN));
            seite.fadenLand[i].push(v ? v[1] : seite.punkte.map(() => NaN));
        }
    }
    await page.evaluate(() => (anazhRealm._weltUhrNeu(__gezeitBasis), anazhRealm._pegelTakt()));
    if (ring != null) seite.ring = await gezeitRing(page, ring);
    return seite;
}
// DER RING (der Fern-Ring: der Faden rechnet je Punkt die Teile seines Spiegels, gelaende-core `spiegelTeile`, der Wirt setzt sie zu
// jeder Stufe zusammen, `_fernRingY`, und legt bei jedem Wechsel der Stufe die Punkte der Gezeit neu, `_fernRingWasserNeu`): am Ort
// des Zensus gebaut (der Haken `__anazhFernRing`, die Linse pumpt seinen Takt), dann je Stufe — das niedrigste Niedrigwasser, das
// Mittel, das höchste Hochwasser — der Träger gesetzt und der Takt des Wassers gerufen. Jeder Punkt liegt, wie sein Gesetz zur
// Stufe ihn legt (Höhe und Nässe, `_fernRingY`); die Teile des Fadens sind der Spiegel der Lage (`atlasSpiegel` im Wirt, wo er die
// Region trägt); das Watt des Rings fällt trocken. `steht`: der Mutant „der Ring steht“ — der Takt sieht den Wechsel der Stufe
// nicht (bis zum Schnitt zeichnete die Ferne die Stunde ihres Baus: das Bild Flut am Watt, die Flut als Rechteck der Chunks).
async function gezeitRing(page, steht) {
    return page.evaluate(
        async (O, steht) => {
            const r = window.anazhRealm;
            const st = r.state;
            const G = globalThis.__gelaendeCore;
            const zM = O.z0 + (O.dz * (O.n - 1)) / 2;
            st.playerMesh.position.set(O.x, st.playerMesh.position.y, zM);
            await __weltDa(() => !r._ensureHydroTilesAround(O.x, zM, 1500));
            if (steht) {
                const alt = r._fernRingWasserNeu;
                r._fernRingWasserNeu = function (fr) {
                    fr.gezeit = this._gezeitGilt();
                    return alt.call(this, fr);
                };
            }
            window.__anazhFernRing = true;
            const t0 = performance.now();
            let fr = null;
            for (let i = 0; i < 3000; i++) {
                r._tickFernRing(st.playerMesh.position);
                fr = st.fernRing;
                if (fr && fr.cursor >= fr.totalVerts && !fr.einhaengen.length && !fr.flug) break;
                await sleep(20); // das EINE Warten der Seite (welt-boot WARTEN_SEITE), nie ein eigenes Versprechen
            }
            if (!fr || fr.cursor < fr.totalVerts) return { gebaut: false, cursor: fr ? fr.cursor : null, punkte: fr ? fr.totalVerts : null };
            const bauMs = Math.round(performance.now() - t0);
            const TS = G.SPIEGEL_TEILE;
            const wl = Number.isFinite(st.waterLevel) ? st.waterLevel : 0;
            const L = r._gelaende();
            const [aus, o] = [{}, {}];
            let gezeit = 0;
            for (let g = 0; g < fr.totalVerts; g++) gezeit += fr.gezeitPunkt[g];
            const traeger = r._gezeitTraeger;
            const stufen = [];
            try {
                for (const k of [-G.GEZEIT_HOCH.k, 0, G.GEZEIT_HOCH.k]) {
                    r._gezeitTraeger = Object.freeze({ stunde: null, k });
                    // der Lauf unter der Frist des Horizonts: je Takt ein Teil (`fr.wasserLauf`), bis er steht — die Frist stellt die
                    // Linse wie ein Takt mit Renderer (`_fristStellen` ab seinem Kopf; der Null-Renderer baut sonst ohne Ende)
                    let [gesetzt, ms, takte, tickMax] = [0, 0, 0, 0];
                    r._bauFristOhneEnde = () => false;
                    try {
                        do {
                            const t = performance.now();
                            r._fristStellen(t, false);
                            gesetzt += r._fernRingWasserNeu(fr);
                            const d = performance.now() - t;
                            [ms, tickMax, takte] = [ms + d, Math.max(tickMax, d), takte + 1];
                        } while (fr.wasserLauf && takte < 100000);
                    } finally {
                        delete r._bauFristOhneEnde;
                        r._bauFristTakt = null;
                    }
                    const s = { k, gesetzt, ms: +ms.toFixed(2), takte, tickMax: +tickMax.toFixed(2), nass: 0, falsch: 0, ab: 0, region: 0, erst: null };
                    for (let g = 0; g < fr.totalVerts; g++) {
                        const p = r._fernRingPunkt(fr, g);
                        const y = Math.fround(r._fernRingY(fr, p, wl, aus));
                        const nass = aus.y < aus.spiegel ? 1 : 0;
                        s.nass += fr.nass[g];
                        if (fr.geos[p.s].attributes.position.getY(p.li) !== y || fr.nass[g] !== nass) {
                            s.falsch++;
                            s.erst = s.erst || `Punkt ${g} (${Math.round(p.x)}|${Math.round(p.z)}) liegt ${fr.geos[p.s].attributes.position.getY(p.li).toFixed(2)} nass ${fr.nass[g]}, sein Gesetz ${y.toFixed(2)} nass ${nass}`;
                        }
                        const h = G.hydroRegion(L, p.x, p.z);
                        if (!fr.gezeitPunkt[g] || !h || !h.ready) continue;
                        s.region++;
                        G.atlasSpiegel(L, p.x, p.z, fr.nassY[g], o);
                        if (!Object.is(G.spiegelZurStufe(fr.spiegelTeile, g * TS, k, fr.nassY[g], wl), o.koerper)) s.ab++;
                    }
                    stufen.push(s);
                }
            } finally {
                r._gezeitTraeger = traeger;
                do r._fernRingWasserNeu(fr);
                while (fr.wasserLauf);
            }
            return { gebaut: true, punkte: fr.totalVerts, gezeit, bauMs, stufen };
        },
        GEZEIT_ORT,
        steht
    );
}
// das Urteil des Rings → [[Name, Satz]] (leer: er hält)
function gezeitRingUrteil(ring) {
    if (!ring || !ring.gebaut) return [["RING", `RING: der Fern-Ring entstand nicht am Ort des Zensus (Cursor ${ring && ring.cursor} von ${ring && ring.punkte})`]];
    const [tief, , hoch] = ring.stufen;
    const falsch = ring.stufen.find((s) => s.falsch);
    const ab = ring.stufen.reduce((a, s) => a + s.ab, 0);
    if (falsch) return [["RING", `RING: zur Stufe ${falsch.k} liegen ${falsch.falsch} Punkte des Fern-Rings nicht auf ihrem Gesetz (zuerst ${falsch.erst}) — \`_fernRingWasserNeu\` legt die Punkte der Gezeit beim Wechsel der Stufe nicht neu, die Ferne zeichnet die Stunde ihres Baus`]];
    if (ab) return [["RING", `RING: ${ab} Spiegel aus den Teilen des Fadens (\`spiegelTeile\` → \`spiegelZurStufe\`) ≠ \`atlasSpiegel\` der Lage`]];
    if (!(hoch.nass - tief.nass >= 1)) return [["RING", `RING: das Watt des Fern-Rings fällt nicht trocken — nass bei Niedrigwasser ${tief.nass}, bei Hochwasser ${hoch.nass} von ${ring.punkte} Punkten (${ring.gezeit} tragen die Gezeit)`]];
    return [];
}
// die steigenden Durchgänge einer Reihe durch ihr Mittel (linear zwischen den Proben) → Stunden
function gezeitDurchgaenge(werte, schritt) {
    const mitte = (Math.max(...werte) + Math.min(...werte)) / 2;
    const d = [];
    for (let i = 1; i < werte.length; i++) {
        const [a, b] = [werte[i - 1] - mitte, werte[i] - mitte];
        if (a < 0 && b >= 0) d.push((i - 1 + a / (a - b)) * schritt);
    }
    return d;
}
function gezeitUrteil(s) {
    const S = GEZEIT_SOLL;
    const rot = [];
    if (!s.traeger) return { rot: ["TRÄGER: die Lage des Wirts trägt keine Gezeit (`_gelaende().gezeit`)"], namen: ["TRÄGER"] };
    const meer = s.proben.map((p) => p.stamm[s.punkte.length - 1]);
    const hub = Math.max(...meer) - Math.min(...meer);
    const d = gezeitDurchgaenge(meer, S.schrittH);
    const periode = d.length >= 2 ? (d[d.length - 1] - d[0]) / (d.length - 1) : NaN;
    // der Spring-Nipp-Takt: der Hub im gleitenden Fenster zweier Tiden (Hoch − Niedrig in 2 · M2, je Viertelstunde), seine
    // steigenden Durchgänge (Nipp → Spring) liegen um die Schwebung auseinander
    const fenster = Math.round((2 * S.periodeH) / S.schrittH);
    const hubJe = [];
    for (let i = 0; i + fenster <= s.ks.length; i++) {
        const t = s.ks.slice(i, i + fenster);
        hubJe.push((Math.max(...t) - Math.min(...t)) * s.stufe);
    }
    const springM = Math.max(...hubJe);
    const nippM = Math.min(...hubJe);
    // die steigenden Durchgänge der Hülle durch ihre Mitte (von Nipp zu Spring), mit einer Hysterese von zwei Stufen gegen das
    // Zittern der quantisierten Fenster — je Schwebung einer (die Zeit: die Mitte des Fensters)
    const [mitte, band, schrittD] = [(springM + nippM) / 2, 2 * s.stufe, S.schrittH / 24];
    const steigt = [];
    for (let i = 1, unten = false; i < hubJe.length; i++) {
        if (hubJe[i - 1] < mitte - band) unten = true;
        if (unten && hubJe[i - 1] < mitte && hubJe[i] >= mitte) {
            const [a, b] = [hubJe[i - 1] - mitte, hubJe[i] - mitte];
            steigt.push((i - 1 + a / (a - b) + fenster / 2) * schrittD);
            unten = false;
        }
    }
    const schwebung = steigt.length >= 2 ? (steigt[steigt.length - 1] - steigt[0]) / (steigt.length - 1) : NaN;
    // der Spiegel: jeder Faden gegen den Stamm-Leser, Wort für Wort
    let ab = 0;
    let maxDiff = 0;
    let werte = 0;
    for (const F of s.faden)
        F.forEach((reihe, j) =>
            reihe.forEach((v, i) => {
                werte++;
                const a = s.proben[j].stamm[i];
                if (!Object.is(v, a)) (ab++, (maxDiff = Math.max(maxDiff, Math.abs(v - a) || 0)));
            })
        );
    // das Land: in jeder Viertelstunde unter der Gegen-Tide Wort für Wort gleich (Stamm), jeder Faden Wort für Wort der Stamm
    const land0 = s.proben[0].land;
    let landZieht = 0;
    let landAb = 0;
    let landErst = null;
    let gegen = 0;
    for (const p of s.proben) {
        if (p.kGegen !== p.k) gegen++;
        p.land.forEach((v, i) => {
            if (Object.is(v, p.landGegen[i])) return;
            landZieht++;
            landErst = landErst || `Punkt ${i} (${s.punkte[i][0]}|${s.punkte[i][1]}) zur Stunde ${p.h}: k ${p.k} ${v} ↔ k ${p.kGegen} ${p.landGegen[i]}`;
        });
    }
    for (const F of s.fadenLand) F.forEach((reihe, j) => reihe.forEach((v, i) => !Object.is(v, s.proben[j].land[i]) && landAb++));
    // das Watt: die nassen Punkte des Profils bei Niedrig- und Hochwasser
    const nassZahl = (p) => [...p.nass].filter((c) => c === "1").length;
    const tief = s.proben.reduce((a, p) => (p.k < a.k ? p : a));
    const hoch = s.proben.reduce((a, p) => (p.k > a.k ? p : a));
    // das Watt ist nie Land: jeder Punkt, den das Hochwasser deckt, liegt unter dem Spiegel des Lands (dieselbe Marge −5 cm)
    const wattLand = s.punkte.filter(([, , y], i) => hoch.nass[i] === "1" && !(land0[i] > y - 0.05)).length;
    const z = { geburt: s.geburt, hub, periode, durchgaenge: d.length, springM, nippM, schwebung, nippe: steigt.length, spiegel: { werte, ab, maxDiff, faeden: s.faden.length }, land: { werte: s.proben.length * land0.length, gegen, zieht: landZieht, ab: landAb, meer: land0[land0.length - 1], erst: landErst, wattLand, nass: s.punkte.map(([, , y], i) => (land0[i] > y - 0.05 ? 1 : 0)).join("") }, watt: { tief: tief.nass, hoch: hoch.nass, kTief: tief.k, kHoch: hoch.k, nassTief: nassZahl(tief), nassHoch: nassZahl(hoch) } };
    const [ox, oz] = s.punkte[s.punkte.length - 1];
    const ort = `am Meer (${ox}|${oz})`;
    if (!(hub >= 0.5)) rot.push(["STEHT", `DER SPIEGEL STEHT: Hub ${hub.toFixed(2)} m ${ort} über ${S.fensterH} h — gelaende-core \`gezeitHub\` (Soll ${S.nipp}–${S.spring} m, Pegel Cuxhaven)`]);
    else if (!(hub >= S.nipp * (1 - S.hubTol) && hub <= S.spring * (1 + S.hubTol))) rot.push(["HUB", `HUB: ${hub.toFixed(2)} m ${ort} außerhalb Nipp ${S.nipp} – Spring ${S.spring} m ±${S.hubTol * 100} %`]);
    if (!(Math.abs(periode / S.periodeH - 1) <= S.periodeTol)) rot.push(["PERIODE", `PERIODE: ${Number.isFinite(periode) ? periode.toFixed(3) : "keine"} h aus ${d.length} Durchgängen ${ort} (Soll M2 ${S.periodeH} h ±${S.periodeTol * 100} %)`]);
    if (!(Math.abs(schwebung / S.schwebungD - 1) <= S.schwebungTol && Math.abs(springM / S.spring - 1) <= S.hubTol && Math.abs(nippM / S.nipp - 1) <= S.hubTol))
        rot.push(["SCHWEBUNG", `SCHWEBUNG: Spring-Nipp ${Number.isFinite(schwebung) ? schwebung.toFixed(3) : "keine"} d (Soll ${S.schwebungD} d ±${S.schwebungTol * 100} %), Hub Spring ${springM.toFixed(2)} m · Nipp ${nippM.toFixed(2)} m über ${S.tage} d`]);
    if (!s.faden.length) rot.push(["SPIEGEL", "SPIEGEL: kein Voxel-Faden antwortete"]);
    else if (ab) rot.push(["SPIEGEL", `SPIEGEL: ${ab} von ${werte} Werten Stamm-Leser \`_atlasWaterLevelAt\` ≠ Faden \`atlasWaterLevelAt\` (maxDiff ${maxDiff.toFixed(3)} m)`]);
    if (!(z.watt.nassHoch - z.watt.nassTief >= 2)) rot.push(["WATT", `WATT: das Profil ${GEZEIT_ORT.name} trägt bei Niedrigwasser ${z.watt.nassTief} und bei Hochwasser ${z.watt.nassHoch} nasse Punkte (\`_nassAt\`) — das Watt fällt nicht trocken`]);
    if (s.geburt.k !== 0) rot.push(["GEBURT", `GEBURT: zur Welt-Uhr 0 (\`_weltUhrNeu(0)\`) steht das Meer auf Stufe ${s.geburt.k} (Stunde ${s.geburt.stunde}) — die Uhr der Gezeit (\`_gezeitStunde\`) beginnt nicht mit der Welt`]);
    if ((z.ring = s.ring)) rot.push(...gezeitRingUrteil(s.ring));
    if (landZieht || landAb || wattLand || !Number.isFinite(z.land.meer) || gegen < s.proben.length / 2) rot.push(["LAND", `LAND: der Spiegel des Lands folgt der Gezeit in ${landZieht} von ${z.land.werte} Werten (zuerst ${landErst || "—"}; ${gegen} von ${s.proben.length} Proben mit anderer Gegen-Stufe), das Hochwasser deckt ${wattLand} Punkte, die er Land nennt, Faden \`landWaterLevelAt\` ≠ Stamm \`_landSpiegelAt\` in ${landAb}, am Meer ${z.land.meer} — gelaende-core \`landSpiegel\` (das höchste Hochwasser, \`lageHochwasser\`)`]);
    return { rot: rot.map((x) => x[1]), namen: rot.map((x) => x[0]), z };
}
async function gezeitProbe(page, url) {
    const t0 = Date.now();
    const lauf = async (haupt = null, faden = haupt, ring = null) => {
        Object.assign(KERN_MODUS, { haupt, faden, probe: null });
        try {
            await frischBoot(page, url);
            return gezeitUrteil(await gezeitLesen(page, ring));
        } finally {
            Object.assign(KERN_MODUS, { haupt: null, faden: null });
        }
    };
    console.log(`\n========= DIE GEZEIT — der Spiegel des Meers an der Welt-Uhr, Stamm-Leser = Faden, das Watt fällt trocken (${GEZEIT_ORT.name}) =========`);
    const u = await lauf(null, null, false);
    const z = u.z;
    if (z) {
        console.log(`  Pegel am Meer über ${GEZEIT_SOLL.fensterH} h: Hub ${z.hub.toFixed(2)} m (Quelle Cuxhaven Spring ${GEZEIT_SOLL.spring} · Nipp ${GEZEIT_SOLL.nipp} m) · Periode ${z.periode.toFixed(3)} h aus ${z.durchgaenge} Durchgängen (M2 ${GEZEIT_SOLL.periodeH} h, ${(100 * (z.periode / GEZEIT_SOLL.periodeH - 1)).toFixed(2)} %)`);
        console.log(`  Spring-Nipp über ${GEZEIT_SOLL.tage} d: Schwebung ${z.schwebung.toFixed(3)} d aus ${z.nippe} Durchgängen der Hülle (Soll ${GEZEIT_SOLL.schwebungD} d) · Hub Spring ${z.springM.toFixed(2)} m · Nipp ${z.nippM.toFixed(2)} m`);
        console.log(`  Spiegel Stamm ↔ Faden: ${z.spiegel.werte} Werte in ${z.spiegel.faeden} Fäden, abweichend ${z.spiegel.ab} (maxDiff ${z.spiegel.maxDiff})`);
        console.log(`  Land (\`_landSpiegelAt\` = Faden \`landWaterLevelAt\`): ${z.land.werte} Werte, unter der Gegen-Tide (${z.land.gegen} Proben mit anderer Stufe) anders ${z.land.zieht} · Faden ≠ Stamm ${z.land.ab} · am Meer ${z.land.meer} m · Profil ${z.land.nass} (Hochwasser ${z.watt.hoch}, Watt als Land ${z.land.wattLand})`);
        console.log(`  Geburt (Welt-Uhr 0): Stufe ${z.geburt.k} zur Stunde ${z.geburt.stunde}`);
        console.log(`  Watt (z ${GEZEIT_ORT.z0}–${GEZEIT_ORT.z0 + GEZEIT_ORT.dz * (GEZEIT_ORT.n - 1)}, je ${GEZEIT_ORT.dz} m): Niedrigwasser k ${z.watt.kTief} ${z.watt.tief} (${z.watt.nassTief} nass) · Hochwasser k ${z.watt.kHoch} ${z.watt.hoch} (${z.watt.nassHoch} nass)`);
        const R = z.ring;
        if (R && R.gebaut)
            console.log(`  Fern-Ring (${R.punkte} Punkte, ${R.gezeit} tragen die Gezeit, gebaut in ${R.bauMs} ms): ${R.stufen.map((s) => `Stufe ${s.k} → ${s.gesetzt} neu gelegt in ${s.ms} ms über ${s.takte} Takte (der längste ${s.tickMax} ms), ${s.nass} nass, ${s.falsch} neben dem Gesetz, Spiegel ≠ Lage ${s.ab} von ${s.region}`).join(" · ")}`);
    }
    for (const b of u.rot) console.log("  ⛔", b);
    let rot = u.rot.length > 0;
    if (SELBSTTEST) {
        for (const [wer, haupt, faden, soll] of [["WIRT UND FADEN", "Spiegel steht", "Spiegel steht", "STEHT"], ["NUR DER FADEN", null, "Spiegel steht", "SPIEGEL"], ["DAS LAND MIT UHR", "Land mit Uhr", "Land mit Uhr", "LAND"]]) {
            const m = await lauf(haupt, faden);
            const nennt = m.namen.includes(soll);
            console.log(`  ${nennt ? "✅" : "⛔"} SELBSTTEST (${haupt || faden} — ${wer}): ${m.namen.join(" · ") || "nichts"} → ${nennt ? `${soll} beim Namen ROT` : `${soll} BLIEB BLIND`}`);
            rot = rot || !nennt;
        }
        const m = await lauf(null, null, true);
        const nennt = m.namen.includes("RING");
        console.log(`  ${nennt ? "✅" : "⛔"} SELBSTTEST (der Ring steht — \`_fernRingWasserNeu\` sieht den Wechsel der Stufe nicht): ${m.namen.join(" · ") || "nichts"} → ${nennt ? "RING beim Namen ROT" : "RING BLIEB BLIND"}`);
        rot = rot || !nennt;
    }
    console.log(`\n${rot ? "⛔ GEZEIT ROT" : "✅ GEZEIT GRÜN"}: ${Math.round((Date.now() - t0) / 1000)} s\n`);
    if (JSON_AUS) jsonSchreiben(JSON_AUS, { gezeit: u });
    return rot ? 1 : 0;
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
    const c = require("./lib/asset-worker-harness.cjs").kernAusText([ausDatei(path.join(wurzel, "vendor", "simplex-noise.js")), kernQuelle(wurzel)]);
    return { G: c.__gelaendeCore, SimplexNoise: c.SimplexNoise };
}
// Die Lage einer frisch geborenen Welt der Saat: der Grund und die Lage-Rechnung aus DIESEM Kern (`GRUND`, `lageAus`),
// das Gesetz (Erbgut-Normalform, Rausch) aus der gemessenen Wurzel.
function realismusLage(K, Z, saat) {
    const g = Z.GRUND;
    const abbild = {
        seed: saat,
        baseHeight: g.basis,
        waterLevel: g.basis - g.meerUnterBasis,
        ort: null, // die Heimat (Reise: der Teil `ort` jeder Lage)
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
    const median = (a) => rang(a.slice().sort(aufsteigend));
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
// DAS NETZ (w28-ankunft-faden; die Summe der Ankunft: das Feld-Panorama baute je neuer Zelle die Talprofile ihrer 25 bzw. 49
// Knoten neu und zählte je Rinnen-Knoten ein Einzugsgebiet ohne Leser — 6,4 CPU-s vor dem ersten Bild der GTX 1050). Die Wand:
// der Kern zählt selbst (`netzZaehler`), jedes Profil ist EINMAL gebaut, kein Knoten der Ebene 2 trägt ein Einzugsgebiet.
// Der Selbsttest nimmt dem Kern je eine Zeile (`NETZ_MUTANTEN`): jeder Mutant fällt beim EIGENEN Namen ROT.
const NETZ_MUTANTEN = {
    profil: ["if (kn.seg !== undefined) return kn.seg;", ""],
    einzug: ["kn.k <= 1 ? knotenA(N, kn) * S * S : 0", "knotenA(N, kn) * S * S"],
    fuss: ["if (fuss > 0) while (k > 0 && N.S[k] * NETZ_TRAGT < fuss) k--;", ""],
};
// DIE STUFE DES FRAGERS (w28-feld-fuss): 192 Fragen auf dem 20-km-Kreis mit der Masche des Felds dort (600 m) an eine frische
// Lage — die Ebene 2 (Kante 100 m) trägt diese Masche nicht, der Kern baut keinen ihrer Knoten (das Feld der Ferne las sie:
// 463 636 Knoten, 3,1 s je Bild).
const NETZ_FUSS = { kreisM: 20000, fragen: 192, mascheM: 600 };
function netzUrteil(G, L, frisch) {
    const z = typeof G.netzZaehler === "function" ? G.netzZaehler(L) : null;
    if (!z) return { gut: false, rot: ["zaehler"], taeter: "der Kern zählt sein Netz nicht (gelaende-core `netzZaehler` fehlt)" };
    const mehrfach = z.profilBau.map((b, k) => b - z.profile[k]);
    const rot = [];
    const namen = [];
    if (!(z.profile[0] + z.profile[1] > 0) || !(z.knoten[2] > 0)) {
        rot.push("leer");
        namen.push(`die Messung fragte das Netz nicht (Profile ${z.profile.join(" · ")} an ${z.knoten.join(" · ")} Knoten)`);
    }
    if (mehrfach.some((m) => m !== 0)) {
        rot.push("profil");
        namen.push(`segment baut das Talprofil eines Knotens mehrfach: je Ebene ${z.profilBau.join(" · ")} Bauten für ${z.profile.join(" · ")} Knoten mit Profil (das Gedächtnis \`kn.seg\` fehlt)`);
    }
    if (z.einzugOhneLeser !== 0) {
        rot.push("einzug");
        namen.push(`${z.einzugOhneLeser} Knoten der Ebene 2 zählen ihr Einzugsgebiet ohne Leser (segmentNeu: knotenA nur für die Ebenen 0 und 1)`);
    }
    let fuss = null;
    if (frisch) {
        for (let i = 0; i < NETZ_FUSS.fragen; i++) {
            const a = (i / NETZ_FUSS.fragen) * 2 * Math.PI;
            G.hoehe(frisch, Math.cos(a) * NETZ_FUSS.kreisM, Math.sin(a) * NETZ_FUSS.kreisM, false, undefined, NETZ_FUSS.mascheM);
        }
        fuss = G.netzZaehler(frisch).knoten;
        if (!(fuss[1] > 0) || fuss[2] !== 0) {
            rot.push("fuss");
            namen.push(`ein Frager mit der Masche ${NETZ_FUSS.mascheM} m baut ${fuss[2]} Knoten der Ebene 2 (Soll 0; Knoten je Ebene ${fuss.join(" · ")}) — gelaende-core netzStufe liest den Fuß nicht`);
        }
    }
    return { ...z, fuss, gut: !rot.length, rot, taeter: namen.join(" · ") };
}
// Der Selbsttest der Netz-Wand: der Kern der gemessenen Wurzel mit je EINER genommenen Zeile, 41 × 41 Fragen im 100-m-Raster.
function netzSelbsttest(wurzel, saat) {
    const simplex = ausDatei(path.join(wurzel, "vendor", "simplex-noise.js"));
    const je = {};
    for (const [name, [alt, neu]] of Object.entries(NETZ_MUTANTEN)) {
        const roh = String(kernQuelle(wurzel));
        if (roh.split(alt).length !== 2) {
            je[name] = { anker: false, rot: [], sieht: false };
            continue;
        }
        const c = require("./lib/asset-worker-harness.cjs").kernAusText([simplex, roh.replace(alt, neu)]);
        const M = { G: c.__gelaendeCore, SimplexNoise: c.SimplexNoise };
        const L = realismusLage(M, M.G, saat);
        for (let j = 0; j <= 40; j++) for (let i = 0; i <= 40; i++) M.G.hoehe(L, -2000 + i * 100, -2000 + j * 100, false);
        const u = netzUrteil(M.G, L, realismusLage(M, M.G, saat));
        je[name] = { anker: true, rot: u.rot, sieht: u.rot.length === 1 && u.rot[0] === name, taeter: u.taeter };
    }
    return { je, sieht: Object.values(je).every((m) => m.sieht) };
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
        const netz = netzUrteil(G, L, realismusLage(K, Z, saat)); // nach Raster und Läufen: das Netz dieser Lage hat gearbeitet
        const urteil = { ...Z.urteil(st, sm), maeander: maeanderGut(maeander), kosten: kosten.imBudget, netz: netz.gut };
        const taeter = {
            netz: netz.taeter,
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
            netz: { knoten: netz.knoten, profile: netz.profile, profilBau: netz.profilBau, einzugOhneLeser: netz.einzugOhneLeser, fuss: netz.fuss },
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
        if (netz.knoten)
            console.log(
                `    Netz: Knoten je Ebene ${netz.knoten.join(" · ")} · Talprofile ${netz.profile.join(" · ")}, gebaut ${netz.profilBau.join(" · ")} (Soll eins je Knoten) · Einzug ohne Leser ${netz.einzugOhneLeser} (Soll 0) · Masche ${NETZ_FUSS.mascheM} m: Knoten ${(netz.fuss || []).join(" · ")} (Soll Ebene 2: 0)`
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
        jsonSchreiben(JSON_AUS, {
                    zweck: "K16 Gelände-Linse (Makro am Gesetzbuch)",
                    wurzel: root,
                    welten,
                    presets: presets && presets.je,
                });
    if (SELBSTTEST) {
        const ns = netzSelbsttest(root, REALISMUS_SAATEN[0]);
        for (const [name, m] of Object.entries(ns.je))
            console.log(
                `  Selbsttest-Netz „${name}" (der Kern ohne die Zeile): ${!m.anker ? "⛔ kein Anker im Kern" : m.sieht ? "✅ fällt beim Namen ROT — " + m.taeter : "⛔ BLIEB BLIND (rot: " + (m.rot.join(", ") || "nichts") + ")"}`
            );
        const blind =
            !ns.sieht ||
            welten.some(
                (w) =>
                    !(w.stoerung && w.stoerung.senken1mJeKm2 > 1) ||
                    !(w.kostenLast && !w.kostenLast.imBudget) ||
                    w.stoerung.maeanderGerade !== "rot"
            );
        console.log(
            `\n${blind ? "⛔ SELBSTTEST ROT: die Störung, die Kosten-Last, die Gerade oder ein Netz-Mutant blieb unentdeckt" : "✅ SELBSTTEST GRÜN: die Eier-Karton-Störung färbt die Senken rot, die Kosten-Last sprengt das Spalten-Budget, die Gerade färbt den Mäander rot, das Netz ohne Gedächtnis, der Einzug ohne Leser und der Frager ohne Stufe fallen beim Namen"}\n`
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
// nur die Höhe, die die Welt baut (`_terrainMacroSurfaceY` = gelaende-core `hoehe` an ihrer lebenden Lage), und die Seen, die
// ihr Gesetz benennt (`benannteSeen`). DER PLAN IST DIE FUNKTION: die Lage der Welt ohne den Erdbau der Orte (`erdbau`, K10
// Welt = Funktion + Abweichungen — die Splats legt das Ort-Gesetz, seit dem Genesis-Ort in jeder Welt an 0/0, nie der Plan
// des Gelände-Studios).
async function weltMessen(page) {
    const Z = linse();
    const R = Z.MESSUNG.raster;
    const w = await page.evaluate(
        async (punkte, R) => {
            const G = window.__gelaendeCore;
            const hex = window.__sha;
            const L = r._gelaende();
            const F = Object.create(L, { erdbau: { value: null } });
            const hoehe = (x, z, mitDetail) => G.hoehe(F, x, z, mitDetail);
            const H = new Array(R.n * R.n);
            for (let j = 0; j < R.n; j++)
                for (let i = 0; i < R.n; i++) H[i + j * R.n] = hoehe(R.x0 + i * R.schritt, R.x0 + j * R.schritt, true);
            return {
                makroSha: await hex(Float64Array.from(punkte, ([x, z, mitDetail]) => hoehe(x, z, mitDetail))),
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
        await page.evaluate(async () => {
            const G = window.__gelaendeCore;
            const snap = r._weltAusPlan({ art: G.PLAN_ART, v: G.PLAN_VERSION, saat: "studio-probe-fremd", regler: {} });
            snap.terrainBaseHeight = 7;
            // das Erbgut ist das Gelände des Welt-Gesetzes (ultiversum.K1)
            // BÜHNE: die Rampe ist ein Term im Erbgut der fremden Welt (ihre eigene Szene), kein Ort dieser Welt
            snap.worldMeta.gesetz.gelaende.terme.push({
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
            r._weltBetreten(snap);
            await r.erwacht; // der Welt-Wechsel am Ort (`_weltWechsel`)
        });
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
        // DIE WELT-TÜR: ohne Studio, die Datei durch das Welt-Tor („Ersetzen") — die Welt tauscht am Ort (`_weltWechsel`).
        await server.zeige(page, 60000);
        const b2 = await booteWelt(page);
        if (!b2.ok) throw new Error("die Welt vor dem Import erwachte nicht");
        const tor = await page.evaluate((text) => {
            r._openWeltTorDialog(JSON.parse(text), { name: "gelaende-plan.json" });
            const p = st.pendingImport;
            const ok = !!(p?.parsed && p.parsed.worldMeta);
            r._weltTorImportReplace();
            return { ok }; // das Erbgut der Tür las niemand (die Welt misst `weltMessen`)
        }, studio.text);
        if (!tor.ok) {
            befunde.push("die Welt-Tür liest den Plan nicht (das Welt-Tor macht aus ihm keine Welt)");
            throw new Error("Tür");
        }
        const b3 = await booteWelt(page);
        if (!b3.ok) throw new Error("die Welt aus dem Plan erwachte nicht");
        console.log(`  Import: Welt-Tor „Ersetzen" → Wechsel am Ort → Boot ${b3.ms} ms (Seed ${b3.seed})`);
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
            const L = r._gelaende();
            const lum = (c) => 0.3 * c[0] + 0.59 * c[1] + 0.11 * c[2];
            const lS = lum(AnazhRealm.BODEN_FARBE.schnee);
            const PG = AnazhRealm.Gesetz("terrain:PORTAL_GROUND", null);
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
        if (!befunde.length) befunde.push(fehlerText(e));
    }
    out.sekunden = Math.round((Date.now() - t0) / 1000);
    if (JSON_AUS) jsonSchreiben(JSON_AUS, out);
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
            const s = st;
            await window
                .__gebautNach("noch: !(s.hydrosphere && s.hydrosphere.ready)", {
                    fertig: () => !!s.hydrosphere?.ready,
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
                sin.sort(aufsteigend);
                return { fenster: sin.length, sinuositaet: sin.length ? +rang(sin).toFixed(3) : null };
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
                await auftrag({ type: "state-update", delta: { hydroGesetz: gesetz || AnazhRealm.HYDROSPHERE } });
                s.hydrosphere = (await auftrag({ type: "hydro", key: "heim", origin: null })).region;
            };
            const bootSaat = s.worldMeta.seed;
            const bootMacro = s.worldMeta.macro;
            // die chirurgische Regenesis der Abdruck-Probe (die Ströme; das Netz des Gesetzbuchs ist je Saat gemerkt), dazu die
            // Hydrosphäre der Saat aus dem Faden (ihre Kacheln fallen; der Weg der Weltgen)
            const regenesis = async (saat, macro) => {
                s.worldMeta.seed = saat;
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
                    hydro: !!h?.ready,
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
                await ausDemFaden({ ...AnazhRealm.HYDROSPHERE, kanalTiefe: Infinity });
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
        const mit = alle.filter((o) => o.maeanderGerade?.fenster);
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
//     kam, ist ROT beim Namen des Rufers; jeden Bau im Haupt-Faden (Chunk-Stoff, Guss des Bäckers, Wuchs eines Spawn-Bauplans
//     neben dem Wald-Faden — w4-b-pflanzen) zählt das Spiel selbst
//     (`_fadenUmgangen`: je Sync-Stelle in `_syncBau`, sonst laut im Buch „FADEN-UMGANGEN") — die Linse liest den Zähler nach
//     der Ankunft, 2 min Gang, einer Minute Fahrt mit sechs echten Bau-Klicks (bau-faden: bis dahin baute jeder seinen
//     Fußabdruck synchron, 215 ms je Klick) und dem Damm; ein Takt des Staus (`_stauFelder`) je Damm-Edit über 8 ms ist ROT.
// K5: `fadenHuelle` vor dem Quelltext jedes Fadens heftet jeder Nachricht ihre Klon-Bytes an (Transfer zählt nicht);
//     der Main summiert sie am Empfang je Faden und Art in beiden Richtungen, dazu jede Kopie empfangener Bytes (jeder
//     Tiefe, `da`: auch ihr Klon) und die Platte — je Minute im Kalt-Boot und in einer Minute Fahrt, Soll ≤ 5 MB/min.
// K6: der Planet im Faden (Reise) — die Welt kennt ihren Ort, sein Anker trägt die Bytes des Kerns (Kopf von `planetSeite`).
// K7 (`--faden --planet`): der Wuchs des Orts — die Reise an den heißen, trockenen Ort und heim (Kopf von `wuchsSeite`).
//   --faden --planet [--echt] [--selftest]   NUR K6 nach dem Boot (ohne Gang, Fahrt und Damm): die gezielte Probe, an der echten
//                          GPU die Zeit des Planeten im Faden und seine Geburt nach dem ersten Weltbild.
//   --faden [--echt] [--selftest]   ein injizierter Hydro-Bau, ein Fußabdruck an einer unbenannten Sync-Stelle, ein Guss, ein
//                          Wuchs eines Spawn-Bauplans (w4-b-pflanzen), die Naht und der Satz eines Faden-Netzes im Haupt-Faden
//                          (w4-b-boden2), ein Stau-Feld, Klon (3 MB tief in einer Nachricht, 3 MB in 300 Krumen, zwei Kopien)
//                          und ein Glied des Stands (2 MB in worldMeta, die Zeile `speicher:stand:.worldMeta.k5Probe`) fallen ROT beim Namen; `--echt` im Fenster an der echten GPU (`[linse-gpu]`), sonst am Null-Renderer.
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
    // K6: die Zeit des Planeten im Faden — vom späten Laden des Kerns bis zur Antwort des Ankers. Die Linse misst sie hier, das
    // Gesetz des Fadens liest keine Uhr (`planetAnker` steht nicht in der Tafel der Gerätezeit).
    let planetAb = null;
    const lade = self.importScripts.bind(self);
    self.importScripts = function (...u) {
        const Q = self.__anazhQuelle;
        if (planetAb === null && Q && Q.spaet && u[0] === Q.spaet.planet) planetAb = performance.now();
        return lade(...u);
    };
    self.postMessage = function (m, tr) {
        const frei = new Set(Array.isArray(tr) ? tr : tr?.transfer || []);
        if (m && typeof m === "object" && !ArrayBuffer.isView(m)) {
            if (m.type === "planet-anker-result" && planetAb !== null) {
                m.__planetMs = performance.now() - planetAb; // nur der erste Auftrag: er lädt den Kern
                planetAb = null;
            }
            m.__klon = klonBytes(m, frei, new Set());
        }
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
        const innen = urlText.get(String(url)) || `importScripts(${JSON.stringify(u.href)});`;
        const quelle = `(${huelleQ})(${bytesQ});\n${innen}`;
        const w = new Roh(URL.createObjectURL(new Blob([quelle], { type: "text/javascript" })), opts);
        F.faeden.push((w.__faden = opts?.name || "?"));
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
        const frei = new Set(Array.isArray(tr) ? tr : tr?.transfer || []);
        const art = `${this.__faden}:${(m && (m.type || m.op)) || "?"}`;
        const k = klonBytes(m, frei, new Set(), da);
        if (k) zu("kopie", art, k); // der Klon empfangener Bytes zurück in einen Faden heißt nach seiner Nachricht (Lehre 24)
        let rest = klonBytes(m, frei, new Set()) - k;
        // DER STAND DES SPEICHERS JE TEIL (streaming-k5): die Stücke seiner Zeichenkette (`daten`, je Teil der Tafel, Kopf-Feld
        // und Glied, Glied einer Liste) heißen nach ihrem Teil — bis streaming-k5 hieß jeder Stand „speicher:?", und der Täter
        // (je Bau-Klick der ganze worldMeta) stand in keiner Zeile
        // nur der Stand des Speichers trägt `daten` als Zeichenkette mit `teile`: die Fern-Teilung reist mit `daten` als Feld (an
        // der echten GPU; am Null-Renderer nie) — bis hier warf dieser Haken dort in jedem Auftrag, und `--faden --echt` stand
        const namen =
            m && typeof m.daten === "string" && m.daten && Array.isArray(m.teile) && [...m.teile, ...Object.entries(m.listen).flatMap(([l, L]) => L.teile.map(() => l))];
        if (namen)
            m.daten.split("\u0001").forEach((x, i) => {
                zu("gesendet", art + ":" + namen[i].replace(/\u0002/g, "."), x.length);
                rest -= x.length;
            });
        zu("gesendet", art, rest);
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
// ── K6 DER PLANET IM FADEN (Reise) ──
// Die Welt kennt ihren Ort: ihr erster LESER gebiert den Planet-Faden (`_planetAuftrag`: schlank, OHNE den Stand der Welt) — der
// Satz „reise“ der Konsole oder die Frage der Sonne nach dem Ort der Welt (`_sonnenAnkerFragen`, sonnenbahn) —, der Faden trägt
// ihn beim Namen (`geweckt`), und der Satz sagt den Anker des Samens des Planeten (`_planetSamen`; voxel-worker `planetAnker` am
// Ort-Gesetz `ortGesetz()`). ROT beim Namen: der Wirt trägt keinen Leser (`_planetAnker` fehlt) · der Faden rechnete einen
// anderen Samen als den des Planeten (Gegner F1) · der Anker im Faden ist nicht der Anker des Kerns in node (Float64-Bitmuster,
// Version) · der Planet-Faden stand vor seinem ersten Leser (weder Satz noch Sonne weckte ihn: die Welt bestellte ihn ohne Leser,
// Gegner F8) · der Planet-Faden bekam eine Nachricht des Welt-Stands (`state-set`,
// `state-update`, `hydro`, `hydro-an`: er rechnete die Welt mit, Gegner F2) · der Haupt-Faden trägt den Kern (`__planetCore`) ·
// der Satz „reise“ sagt die Lage nicht. Die Zeit im Faden (`__planetMs` aus `fadenHuelle`) ist ein Lesewert, kein Urteil.
// `--selftest` (Gegner F9: jeder Täter ist in die WELT gepflanzt und geht durch denselben Leser): ein fremder Samen im echten
// Faden, eine Nachricht des Stands an den echten Faden, der Faden ohne Leser (er stirbt und wird ohne Leser neu geboren), der Kern im Haupt-Faden
// und der Satz „reise heim“ (er sagt keine Lage) — dazu ein Wirt ohne Leser.
async function planetSeite(mutant) {
    if (typeof r._planetAnker !== "function" || typeof r._planetAuftrag !== "function") return { fehlt: true };
    const bits = (x) => Array.from(new Uint8Array(new Float64Array([x]).buffer), (b) => b.toString(16).padStart(2, "0")).join("");
    const planetSamen = r._planetSamen();
    if (mutant) {
        // DER TÄTER „Faden ohne Leser“: der echte Faden stirbt und wird ohne Leser neu geboren (ein Auftrag, den niemand liest)
        if (r._planetFadenStand) r._planetFadenStand.worker.terminate();
        r._planetFadenStand = null;
        r._planetAuftrag({ type: "planet-anker", samen: planetSamen });
    }
    const vorSatz = !!r._planetFadenStand;
    const geweckt = r._planetFadenStand ? r._planetFadenStand.geweckt : null;
    const F = window.__faden || {};
    const posten = () => (F.planetPost = F.planetPost || []);
    // jede Nachricht an den Planet-Faden beim Typ (der Haken am echten Faden, nach seiner Geburt)
    const haken = () => {
        const f = r._planetFadenStand;
        if (!f || f.worker.__k6) return;
        const roh = f.worker.postMessage.bind(f.worker);
        f.worker.postMessage = (m, tr) => (posten().push(m && m.type), roh(m, tr));
        f.worker.__k6 = true;
    };
    // die Geburt des Fadens im Haupt-Faden (ihr erster Auftrag) — Lesewert
    let geburtMs = null;
    const auftrag = r._planetAuftrag;
    r._planetAuftrag = function (m) {
        const neu = !this._planetFadenStand;
        const t0 = performance.now();
        const p = auftrag.call(this, m);
        if (neu) (geburtMs = performance.now() - t0), haken();
        return p;
    };
    r.processChatCommand(mutant ? "reise heim" : "reise"); // der echte Weg des Spielers: die Konsole, alle Routen vor der System-Tafel
    let a;
    try {
        a = await r._planetAnker();
    } finally {
        delete r._planetAuftrag;
    }
    haken();
    if (mutant) {
        a = await r._planetAuftrag({ type: "planet-anker", samen: planetSamen + "~selbsttest" });
        r._planetFadenStand.worker.postMessage({ type: "state-update", delta: {} });
        globalThis.__planetCore = {};
    }
    const haupt = typeof globalThis.__planetCore !== "undefined";
    if (mutant) delete globalThis.__planetCore;
    await sleep(0);
    const aus = document.getElementById("chat-output");
    const zeile = aus && aus.lastElementChild ? aus.lastElementChild.textContent : "";
    const stand = posten().filter((t) => ["init", "state-set", "state-update", "hydro", "hydro-an"].includes(t));
    return {
        samen: a.samen,
        planetSamen,
        weltSamen: r._gelaende().seed,
        version: a.version,
        breite: a.breite,
        laenge: a.laenge,
        kuesteKm: a.kuesteKm,
        bits: bits(a.breite) + bits(a.laenge),
        vorSatz,
        geweckt,
        stand,
        geburtMs,
        haupt,
        zeile,
        ms: typeof a.__planetMs === "number" ? a.__planetMs : null,
    };
}
// der Anker des Kerns in node, am Stand der gemessenen Wurzel: derselbe Kern, dieselbe Tafel des Ort-Gesetzes (kein Nachbau)
function planetSoll(wurzel, samen) {
    const P = require(path.join(wurzel, "planet-core.js"));
    const og = gelaendeKern(wurzel).G.ortGesetz();
    const A = P.planetAnker(P.planetPlan(samen, P.PLANET_ERDE), 0, og);
    const bits = (x) => Buffer.from(new Float64Array([x]).buffer).toString("hex");
    const grad = (x) => Math.abs((x * 180) / Math.PI).toFixed(2).replace(".", ",");
    return {
        version: P.VERSION,
        breite: A.breite,
        laenge: A.laenge,
        kuesteKm: A.kuesteKm,
        bits: bits(A.breite) + bits(A.laenge),
        lage: [`${grad(A.breite)}° ${A.breite < 0 ? "S" : "N"}`, `${grad(A.laenge)}° ${A.laenge < 0 ? "W" : "O"}`, `${A.kuesteKm.toFixed(0)} km`],
    };
}
// die Leser des Planeten beim Namen (stamm `PLANET_LESER`): der Satz „reise“ · die Frage der Sonne (`_sonnenAnkerFragen`)
const PLANET_LESER = ["Satz", "Sonne"];
function planetUrteil(spiel, soll) {
    if (!spiel || spiel.fehlt) return ["die Welt kennt ihren Ort nicht — der Wirt trägt keinen Leser des Planeten (`_planetAnker` fehlt)"];
    const rot = [];
    const grad = (x) => ((x * 180) / Math.PI).toFixed(3) + "°";
    if (spiel.samen !== spiel.planetSamen)
        rot.push(`der Planet rechnete den Samen „${spiel.samen}“, der Planet der Welt trägt „${spiel.planetSamen}“`);
    if (spiel.version !== soll.version) rot.push(`der Faden rechnet den Kern ${spiel.version}, der Baum trägt ${soll.version}`);
    if (spiel.bits !== soll.bits)
        rot.push(
            `der Anker im Faden (${grad(spiel.breite)} · ${grad(spiel.laenge)}) ist nicht der Anker des Kerns in node (${grad(soll.breite)} · ${grad(soll.laenge)}) — die Bytes weichen ab`
        );
    if (!PLANET_LESER.includes(spiel.geweckt))
        rot.push(
            `der Planet-Faden stand vor seinem ersten LESER — geweckt von ${spiel.geweckt == null ? "niemandem" : "„" + spiel.geweckt + "“"}, weder ${PLANET_LESER.join(" noch ")}: Faden ohne Leser, die Welt zahlt den Planeten ohne Leser`
        );
    if (spiel.stand.length) rot.push(`der Planet-Faden bekam den Stand der Welt (${spiel.stand.join(", ")}) — er rechnet die Welt mit`);
    if (spiel.haupt) rot.push("der Haupt-Faden trägt den Kern (`__planetCore`) — der Planet lebt nur im Faden");
    const fehlt = soll.lage.filter((t) => !String(spiel.zeile).includes(t));
    if (fehlt.length) rot.push(`der Satz „reise“ sagt die Lage nicht: „${spiel.zeile}“ (es fehlt ${fehlt.join(" · ")})`);
    return rot;
}
// die Zeile K6 und ihre Täter
function planetZeile(ist, soll, rot) {
    if (!ist.fehlt) {
        const g = (x) => ((x * 180) / Math.PI).toFixed(3) + "°";
        const geb = typeof ist.geburtMs === "number" ? ist.geburtMs.toFixed(1) + " ms" : "ungemessen";
        console.log(
            `  Planet (K6): Anker im Faden ${g(ist.breite)} · ${g(ist.laenge)}, Küste ${ist.kuesteKm.toFixed(1)} km, Kern ${ist.version}, Samen „${ist.samen}“ — der Kern in node ${ist.bits === soll.bits ? "trägt dieselben Bytes" : "WEICHT AB"} · geweckt von ${ist.geweckt == null ? "NIEMANDEM" : "„" + ist.geweckt + "“"} (Leser: ${PLANET_LESER.join(" · ")}; vor dem Satz ${ist.vorSatz ? "stand er" : "stand er nicht"}), Nachrichten des Stands an ihn ${ist.stand.length}, seine Geburt hielt den Haupt-Faden ${geb} · im Faden ${ist.ms == null ? "ungemessen" : ist.ms.toFixed(0) + " ms (Laden + Plan + Scheibe + Anker)"} · der Satz: „${ist.zeile}“`
        );
    }
    for (const t of rot) console.log(`  ⛔ K6: ${t}`);
}
// K6 `--selftest`: die gepflanzten Täter des Planeten durch DENSELBEN Leser (Kopf von `planetSeite`) — sieht er jeden?
async function planetSelbst(page, ist, soll) {
    const M = ist.fehlt ? [] : planetUrteil(await page.evaluate(planetSeite, true), soll);
    const ohne = planetUrteil({ fehlt: true }, null);
    const taeter = ["rechnete den Samen", "die Bytes weichen ab", "Faden ohne Leser", "bekam den Stand der Welt", "Haupt-Faden trägt den Kern", "sagt die Lage nicht"];
    const sieht = taeter.every((t) => M.some((x) => x.includes(t))) && ohne.some((x) => x.includes("kennt ihren Ort nicht"));
    console.log(
        `  ${sieht ? "✅" : "⛔"} SELBSTTEST K6: fremder Samen im Faden, Stand an den Faden, Faden ohne Leser, Kern im Haupt-Faden, Satz ohne Lage, Wirt ohne Leser ${sieht ? "fallen ROT beim Namen" : "BLIEBEN UNSICHTBAR (" + M.length + " von " + taeter.length + " genannt)"}`
    );
    return sieht;
}
// K7 DER WUCHS DES ORTS (Reise, Welle 3 — Bewuchs und Grund nach Klima): der Spieler reist mit dem Satz der Konsole an den heißen,
// trockenen Ort seines Planeten (`WUCHS_ORT`: der Planet sagt dort Wüste, Wald-Anteil 0) und heim. Gelesen wird durch die Leser
// des Spiels: die Tafel der Lage (`_gelaende().ort.wuchs`), der Wald der 25 Zellen um die Ankunft (`_forestGeborene`, dieselbe
// Regel wie der Faden) und der Grund an 81 Punkten (`_bodenFarbeAt` unter der Wiesen-Wache).
// ROT beim Namen: die Reise kam nicht an · der Ort trägt den Wuchs der Heimat (Wald 1, Krautschicht 1 — die Tafel reicht ihn
// nicht) · am Ort ohne Wald-Anteil stehen Bäume · der kahle Grund liest als Wiese (Grün-Anteil über Krautschicht + 25 Punkte,
// der Saum am Wasser) · die Heimat ist nach der Rückkehr nicht byte-gleich (Höhe und Boden-Farbe an 81 Punkten).
// `--selftest`: derselbe Leser am Ort mit der gepflanzten Tafel der Heimat (die Lage des Wirts reicht `wuchs` der Heimat —
// der Fall „der heiße Ort trägt den Wald der Heimat“) fällt ROT an Wald und Grund.
const WUCHS_ORT = "reise 17.09 61.93";
async function wuchsSeite(satz, mutant) {
    const G = globalThis.__gelaendeCore;
    const lesen = () => {
        const L = r._gelaende(), pm = r.state.playerMesh.position, C = AnazhRealm.FOREST.cell, seedInt = r._forestSeedInt();
        const [cx0, cz0] = [Math.floor(pm.x / C), Math.floor(pm.z / C)];
        let baeume = 0;
        for (let dz = -2; dz <= 2; dz++) for (let dx = -2; dx <= 2; dx++) baeume += r._forestGeborene(cx0 + dx + 20, cz0 + dz + 20, seedInt).length;
        const WG = AnazhRealm.WIESEN_GRUND, c = [0, 0, 0];
        let [land, gruen, h, f] = [0, 0, 0, 0];
        for (let i = -4; i <= 4; i++)
            for (let k = -4; k <= 4; k++) {
                const [x, z] = [pm.x + 500 + i * 64, pm.z + 500 + k * 64];
                const y = G.hoehe(L, x, z, true);
                h = (h * 31 + Math.round(y * 1000)) | 0;
                if (y < L.waterLevel) continue;
                land++;
                r._bodenFarbeAt(x, y, z, c);
                f = (f * 31 + Math.round(c[0] * 1e6) + 7 * Math.round(c[1] * 1e6) + 13 * Math.round(c[2] * 1e6)) | 0;
                if (c[1] - 0.5 * (c[0] + c[2]) > 0.5 * WG.schwelle) gruen++;
            }
        // ein Stand ohne den Teil `wuchs` der Tafel trägt an jedem Ort den Wuchs der Heimat (der Täter vor Welle 3)
        const W = L.ort.wuchs || { wald: 1, decke: 1 };
        return { teil: !!L.ort.teil, wald: W.wald, decke: W.decke, baeume, land, gruen, abdruck: h + "|" + f, welt: r.state.worldMeta.worldId };
    };
    const tausch = async (s) => {
        const st0 = r.state;
        const p = r.processChatCommand(s);
        if (p && typeof p.then === "function") await p.catch(() => null);
        for (const weiter = __deckel("der Tausch am Ort (" + s + ")", 6000); weiter(); ) {
            await __seitenTakt();
            const z = r.state;
            if (z !== st0 && !r._weltTausch && z.voxelChunks && z.voxelChunks.size > 4 && z.voxelWorkerReady && z.voxelWorkerWorldgenSynced)
                return true;
        }
        return false;
    };
    const heim0 = lesen();
    const an = await tausch(satz);
    let ort = an ? lesen() : null;
    let gepflanzt = null;
    if (an && mutant) {
        // der Täter in der Welt: die Lage des Wirts reicht am Ort den Wuchs der Heimat — durch dieselben Leser
        const [roh, heimW] = [r._gelaende, G.ortGesetz(null).wuchs];
        r._gelaende = function () {
            const L = roh.call(this);
            return Object.defineProperty(Object.create(L), "ort", { value: Object.assign({}, L.ort, { wuchs: heimW }) });
        };
        try {
            gepflanzt = lesen();
        } finally {
            delete r._gelaende;
        }
    }
    const zurueck = an ? await tausch("reise heim") : false;
    return { heim0, an, ort, gepflanzt, zurueck, heim1: zurueck ? lesen() : null };
}
function wuchsUrteil(w, mutant) {
    const rot = [];
    if (!w || !w.an || !w.ort || !w.ort.teil) return ["die Reise kam nicht an — der Satz „" + WUCHS_ORT + "“ führte in keine Welt des Planeten"];
    const o = mutant ? w.gepflanzt : w.ort;
    if (!o) return ["der gepflanzte Täter las nichts"];
    if (o.wald === 1 && o.decke === 1) rot.push("der Ort trägt den Wuchs der Heimat (Wald 1, Krautschicht 1) — die Tafel `ortGesetz(teil).wuchs` reicht den des Orts nicht");
    if (!(w.ort.wald > 0) && o.baeume > 0)
        rot.push(`am Ort ohne Wald-Anteil stehen ${o.baeume} Bäume in 25 Zellen (die Heimat ${w.heim0.baeume}) — der Wald liest das Klima des Orts nicht`);
    const pct = o.land ? (100 * o.gruen) / o.land : 0;
    if (pct > 100 * w.ort.decke + 25)
        rot.push(`der kahle Grund liest als Wiese: ${pct.toFixed(0)} % Grün unter der Wiesen-Wache bei Krautschicht ${(100 * w.ort.decke).toFixed(1)} % — die Boden-Farbe liest das Klima des Orts nicht`);
    if (!mutant && !(w.zurueck && w.heim1 && w.heim1.abdruck === w.heim0.abdruck && w.heim1.welt === w.heim0.welt))
        rot.push("die Heimat ist nach „reise heim“ nicht byte-gleich (Höhe und Boden-Farbe an 81 Punkten, Welt-Id)");
    return rot;
}
async function wuchsProbe(page) {
    const w = await page.evaluate(wuchsSeite, WUCHS_ORT, SELBSTTEST);
    const rot = wuchsUrteil(w, false);
    if (w && w.ort) {
        const pct = (o) => (o.land ? ((100 * o.gruen) / o.land).toFixed(0) : "—");
        console.log(
            `  Wuchs (K7): „${WUCHS_ORT}“ — Wald-Anteil ${w.ort.wald}, Krautschicht ${w.ort.decke.toFixed(3)}; Bäume in 25 Zellen ${w.ort.baeume} (Heimat ${w.heim0.baeume}), Grün unter der Wiesen-Wache ${pct(w.ort)} % (Heimat ${pct(w.heim0)} %); heim ${w.zurueck && w.heim1 && w.heim1.abdruck === w.heim0.abdruck ? "byte-gleich" : "NICHT byte-gleich"}`
        );
    }
    for (const t of rot) console.log(`  ⛔ K7: ${t}`);
    let sieht = true;
    if (SELBSTTEST) {
        const M = wuchsUrteil(w, true);
        sieht = ["trägt den Wuchs der Heimat", "stehen", "liest als Wiese"].every((t) => M.some((x) => x.includes(t)));
        console.log(
            `  SELBSTTEST K7: der Ort mit der gepflanzten Tafel der Heimat (${w && w.gepflanzt ? w.gepflanzt.baeume + " Bäume, " + w.gepflanzt.gruen + " von " + w.gepflanzt.land + " Punkten grün" : "nichts gelesen"}) ${sieht ? "fällt ROT beim Namen" : "BLIEB UNSICHTBAR (" + M.join(" | ") + ")"}`
        );
    }
    return rot.length > 0 || !sieht;
}
// K7 DIE SIEDLUNG DES ORTS (Reise, w28-reise-ort — was am Ort steht, liest das Gesetz des Orts): der Spieler reist an den leeren Ort
// (`SIEDLUNG_LEER`: das Gesetz trägt dort kein Dorf und keinen Wald, `siedlung.bau` 0 und `wuchs.wald` 0) und an den heißen
// (`WUCHS_ORT`) und heim. Gelesen wird durch die Leser des Spiels: der Plan des Prüfplatzes (`_genesisPlan`) und die Ankunft auf
// Grund (`_genesisMitte`, `_landAt`), die Dorf-Zellen im Umkreis von 2 km (die Wahl der Zelle und ihres Grunds:
// `_autoSettlementCellInfo` → `_autoSettlementFindSite`) und der Hof-Baum an 81 Plätzen der Wüste im selben Umkreis
// (`_hofBaumTraegt` je Platz und Samen gegen den Baum des Orts dort, gelaende-core `ortBaum`).
// Der leere Ort ist der polare Ort 79,07° N 0,56° O vor dem modernen Menschen (−1 Ma, `ORT_SIEDLUNG.mensch`): bau 0 aus der Zeit,
// wald 0 aus der Wasser-Bilanz. Bis klima-kontinent stand die Linse dort heute im Dauer-Frost (Sommer am Meer −2,92 °C); seit der
// Küste im ablandigen Wind ihr kontinentaler Sommer gehört (+0,18 °C, Alert und Eureka auf 80–82° N: +3…+6 °C), trägt das Land dieser
// Saat nirgends Sommer ≤ −3 °C (0 von 5 756 Land-Orten), und heute baut der Mensch dort am Wasser (bau 0,546) — Gesetz, kein Täter.
// Darum prüft die Linse ihre PRÄMISSE am Ort selbst (die Tafel, die der Wirt liest): trägt er bau oder wald > 0, fällt sie ROT an
// „Prämisse“ und beschuldigt keinen Leser.
// ROT beim Namen: der leere Ort trägt den Prüfplatz · die Ankunft steht nicht auf Grund · der leere Ort trägt ein Dorf oder einen
// Baum · in der Wüste steht der Hof-Baum außerhalb des Bands am Wasser (oder der Hof-Baum liest das Klima nicht: kein Leser
// `_hofBaumTraegt`) · die Prämisse fiel.
// `--selftest`: derselbe Leser mit der gepflanzten Tafel der Heimat (die Lage des Wirts reicht `siedlung` und `wuchs` der Heimat)
// fällt ROT an „Dorf am leeren Ort“ und „Baum in der Wüste“; das Urteil über einen Ort mit bau > 0 fällt ROT an „Prämisse“ und
// nennt keinen Leser.
const SIEDLUNG_LEER = "reise 79.07 0.56 -1";
async function siedlungSeite(leer, wueste, mutant) {
    const G = globalThis.__gelaendeCore;
    const tausch = async (s) => {
        const st0 = r.state;
        const p = r.processChatCommand(s);
        if (p && typeof p.then === "function") await p.catch(() => null);
        for (const weiter = __deckel("der Tausch am Ort (" + s + ")", 6000); weiter(); ) {
            await __seitenTakt();
            const z = r.state;
            if (z !== st0 && !r._weltTausch && z.voxelChunks && z.voxelChunks.size > 4 && z.voxelWorkerReady && z.voxelWorkerWorldgenSynced)
                return true;
        }
        return false;
    };
    const gepflanzt = (f) => {
        if (!mutant) return f();
        const [roh, H] = [r._gelaende, G.ortGesetz(null)];
        r._gelaende = function () {
            const L = roh.call(this);
            return Object.defineProperty(Object.create(L), "ort", { value: Object.assign({}, L.ort, { wuchs: H.wuchs, siedlung: H.siedlung }) });
        };
        try {
            return f();
        } finally {
            delete r._gelaende;
        }
    };
    const dorfZellen = () => {
        const A = AnazhRealm._siedlungGesetz(), M = r._genesisMitte() || { x: 0, z: 0 };
        let n = 0;
        if (!A) return -1;
        const R = Math.ceil(2000 / A.cellM);
        for (let dz = -R; dz <= R; dz++)
            for (let dx = -R; dx <= R; dx++) {
                const [cx, cz] = [Math.floor(M.x / A.cellM) + dx, Math.floor(M.z / A.cellM) + dz];
                const info = r._autoSettlementCellInfo(cx, cz);
                if (info && Math.hypot(info.x - M.x, info.z - M.z) <= 2000 && r._autoSettlementFindSite(info)) n++;
            }
        return n;
    };
    const aus = { leer: null, wueste: null };
    if (await tausch(leer)) {
        // der Wald des leeren Orts, wie die Welt ihn pflanzt (die Schlange des Walds und sein Faden, `_tickWaldPlan`): 600 Takte
        for (let i = 0; i < 600; i++) await __seitenTakt();
        const M = r._genesisMitte();
        const O = r._gelaende().ort;
        aus.leer = {
            teil: !!O.teil,
            // die Prämisse: die Tafel, die der Wirt am Ort liest (nie die gepflanzte des Selbsttests)
            bau: O.siedlung ? O.siedlung.bau : null,
            wald: O.wuchs ? O.wuchs.wald : null,
            platz: !!r._genesisPlan,
            grund: !!M && r._landAt(M.x, M.z, 0.2),
            doerfer: gepflanzt(dorfZellen),
            baeume: (r.state.architectures || []).filter((a) => /^baum_/.test(a.type)).length,
        };
    }
    if (await tausch(wueste)) {
        const M = r._genesisMitte() || { x: 0, z: 0 };
        const W = r._gelaende().ort.wuchs;
        let [plaetze, aussen, nass] = [0, 0, 0];
        const leser = typeof r._hofBaumTraegt === "function";
        for (let i = -4; i <= 4; i++)
            for (let k = -4; k <= 4; k++) {
                const [x, z] = [M.x + i * 220, M.z + k * 220];
                const y = r.getTerrainHeightAt(x, z);
                if (!Number.isFinite(y) || !r._landAt(x, z, 0.2)) continue;
                plaetze++;
                // das Band am Wasser: der Baum des Orts dort (gelaende-core `ortBaum`; an einem Stand ohne ihn dieselbe Zeile)
                const F = AnazhRealm.FEUCHTE, t = Math.max(0, Math.min(1, (r._feuchteAt(x, z, y) - F.sichtbarLo) / (F.sichtbarHi - F.sichtbarLo)));
                const baum = G.ortBaum || ((Wb, n) => Wb.laub * (Wb.wald + (Wb.oase - Wb.wald) * n));
                const band = baum(W, t * t * (3 - 2 * t), false) > 0;
                if (band) nass++;
                // je Platz 16 Samen des Hof-Baums: steht einer außerhalb des Bands am Wasser?
                for (let s = 0; s < 16 && !band; s++)
                    if (!leser || gepflanzt(() => r._hofBaumTraegt(x, z, y, (s * 2654435761 + 12345) >>> 0))) {
                        aussen++;
                        break;
                    }
            }
        aus.wueste = { teil: !!r._gelaende().ort.teil, plaetze, aussen, nass, leser, doerfer: dorfZellen() };
    }
    // an einem Stand, der den Ort beim Speichern verlor (die Rückkehr trug die Heimat), führt „reise heim“ nirgends hin
    aus.zurueck = r._gelaende().ort.teil ? await tausch("reise heim") : false;
    return aus;
}
function siedlungUrteil(s) {
    const rot = [];
    if (!s || !s.leer || !s.leer.teil) return ["die Reise kam nicht an — der Satz „" + SIEDLUNG_LEER + "“ führte in keine Welt des Planeten"];
    // die PRÄMISSE vor jedem Urteil über einen Leser: trägt das Gesetz am Ort ein Dorf oder einen Wald, ist beides dort Gesetz
    const praemisse = s.leer.bau === 0 && s.leer.wald === 0;
    if (!praemisse)
        rot.push(`Prämisse: „${SIEDLUNG_LEER}“ trägt nach der Tafel des Orts siedlung.bau ${s.leer.bau} und wuchs.wald ${s.leer.wald} — dort sind Dorf und Baum Gesetz, kein Täter; der Ort der Linse muss bau 0 und wald 0 tragen`);
    if (s.leer.platz) rot.push("der leere Ort trägt den Prüfplatz — der Plan des Genesis-Orts liest `ortGesetz(teil).siedlung.platz` nicht");
    if (!s.leer.grund) rot.push("die Ankunft am leeren Ort steht nicht auf Grund (Wasser an der Mitte des Orts)");
    if (praemisse && s.leer.baeume > 0)
        rot.push(`Baum am leeren Ort: ${s.leer.baeume} Bäume stehen, wo das Gesetz keinen Wald trägt — der Wald-Faden pflanzt die Darts einer anderen Welt (sein Stand ohne die Welt, \`_waldStandSchluessel\`)`);
    if (praemisse && s.leer.doerfer !== 0) rot.push(`Dorf am leeren Ort: ${s.leer.doerfer} Dorf-Zellen im Umkreis von 2 km — die Wahl der Zelle liest \`siedlung.bau\` nicht`);
    if (!s.wueste) rot.push("die Reise in die Wüste kam nicht an");
    else if (!s.wueste.teil) rot.push("die Rückkehr in die Wüste trägt das Gesetz der Heimat — der Stand der Reise-Welt verlor `gesetz.ort` beim Speichern");
    else if (!s.wueste.leser) rot.push("Baum in der Wüste: der Hof-Baum liest das Klima des Orts nicht (kein Leser `_hofBaumTraegt`)");
    else if (s.wueste.aussen > 0) rot.push(`Baum in der Wüste: an ${s.wueste.aussen} von ${s.wueste.plaetze} Plätzen außerhalb des Bands am Wasser steht der Hof-Baum`);
    return rot;
}
async function siedlungProbe(page) {
    const s = await page.evaluate(siedlungSeite, SIEDLUNG_LEER, WUCHS_ORT, false);
    const rot = siedlungUrteil(s);
    if (s && s.leer)
        console.log(
            `  Siedlung (K7): „${SIEDLUNG_LEER}“ (bau ${s.leer.bau}, wald ${s.leer.wald}) — Bäume ${s.leer.baeume}, Prüfplatz ${s.leer.platz ? "JA" : "nein"}, Ankunft auf Grund ${s.leer.grund ? "ja" : "NEIN"}, Dorf-Zellen in 2 km ${s.leer.doerfer}; „${WUCHS_ORT}“ — Hof-Baum außerhalb des Bands an ${s.wueste ? s.wueste.aussen : "—"} von ${s.wueste ? s.wueste.plaetze : "—"} Plätzen (im Band ${s.wueste ? s.wueste.nass : "—"}), Dorf-Zellen am Wasser ${s.wueste ? s.wueste.doerfer : "—"}`
        );
    for (const t of rot) console.log(`  ⛔ K7: ${t}`);
    let sieht = true;
    if (SELBSTTEST) {
        const m = await page.evaluate(siedlungSeite, SIEDLUNG_LEER, WUCHS_ORT, true);
        const M = siedlungUrteil(m);
        sieht = ["Dorf am leeren Ort", "Baum in der Wüste"].every((t) => M.some((x) => x.includes(t)));
        console.log(
            `  SELBSTTEST K7: die gepflanzte Tafel der Heimat (Dorf-Zellen am leeren Ort ${m && m.leer ? m.leer.doerfer : "—"}, Hof-Baum außerhalb des Bands ${m && m.wueste ? m.wueste.aussen : "—"}) ${sieht ? "fällt ROT beim Namen" : "BLIEB UNSICHTBAR (" + M.join(" | ") + ")"}`
        );
        // die Prämisse: derselbe Ort mit der Tafel von heute (bau 0,546 am Wasser) — ROT an „Prämisse“, kein Leser beschuldigt
        const P = s && s.leer ? siedlungUrteil(Object.assign({}, s, { leer: Object.assign({}, s.leer, { bau: 0.546, doerfer: 15 }) })) : [];
        const praemisseSieht = P.some((x) => x.startsWith("Prämisse")) && !P.some((x) => x.includes("Dorf am leeren Ort"));
        console.log(
            `  SELBSTTEST K7: das Urteil über einen Ort mit bau 0,546 und 15 Dorf-Zellen ${praemisseSieht ? "fällt ROT an der Prämisse und beschuldigt keinen Leser" : "BESCHULDIGT DEN LESER (" + P.join(" | ") + ")"}`
        );
        sieht = sieht && praemisseSieht;
    }
    return rot.length > 0 || !sieht;
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
            await __weltDa(() => r && typeof r._gameLoopTick === "function");
            const p = st.playerMesh.position;
            if (!n)
                for (const weiter = __deckel("die Welt steht", 4000); weiter(); ) {
                    if (st.voxelChunks && st.voxelChunks.size > 20 && st.voxelWorkerReady) break;
                    await __seitenTakt();
                }
            st.pitch = -Math.PI / 2; // der Blick senkrecht nach unten: ein Bau-Klick setzt den Block unter den Spieler
            for (let k = 0, t; k < n; k++) {
                await __seitenTakt();
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
    // K6 DER PLANET IM FADEN: die Welt steht — ihr Anker aus dem Faden gegen den Kern in node
    const planetIst = await page.evaluate(planetSeite, false);
    const planetSollWert = planetIst.fehlt ? null : planetSoll(root, planetIst.planetSamen);
    const planetRot = planetUrteil(planetIst, planetSollWert);
    // `--faden --planet`: NUR K6 — die gezielte Probe (an der echten GPU mit `--echt`: die Zeit im Faden, die Geburt nach dem Bild)
    if (argv.includes("--planet")) {
        console.log("\n=== DER PLANET IM FADEN (K6) ===");
        planetZeile(planetIst, planetSollWert, planetRot);
        let rotK6 = planetRot.length > 0 || (SELBSTTEST && !(await planetSelbst(page, planetIst, planetSollWert)));
        // K7 DER WUCHS DES ORTS: die Reise an den heißen, trockenen Ort und heim (nach K6: der Planet-Faden steht)
        if (!planetIst.fehlt) rotK6 = (await wuchsProbe(page)) || rotK6;
        // K7 DIE SIEDLUNG DES ORTS (w28-reise-ort): der leere Ort, die Wüste und heim
        if (!planetIst.fehlt) rotK6 = (await siedlungProbe(page)) || rotK6;
        console.log(`\n${rotK6 ? "⛔ PLANET ROT" : "✅ PLANET GRÜN: der Anker im Faden = der Kern, der Faden schlank und geboren mit seinem ersten Leser, der Satz sagt die Lage · K7 der trockene Ort trägt weder den Wald noch die Wiese der Heimat, heim byte-gleich; der leere Ort trägt weder Prüfplatz noch Dorf noch Baum, der Hof-Baum der Wüste steht nur am Wasser"}\n`);
        return rotK6 ? 1 : 0;
    }
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
            const G = globalThis.__gelaendeCore;
            const t0 = performance.now();
            (function injizierteHydro() {
                const o = { x: 9 * 2048 - 1024, z: -1024 };
                st.hydroTiles.set(
                    "9,0",
                    G.hydrosphaere(r._gelaende(), AnazhRealm.HYDROSPHERE, (x, z) => r._voxelSurfaceY(x, z), o)
                );
            })();
            (function injiziertesStauFeld() {
                r._stauRechnet = true; // Werke und Feld lesen das Gesetz ohne Stau (der Selbsttest ist das Ende der Seite)
                st.waterStau = G.stauFelder(r._gelaende(), r._stauWorkClusters(), AnazhRealm.CA_STAU, 1.8, (x, z) => r._voxelSurfaceY(x, z), null, [], 0).felder;
            })();
            (function injizierterFussabdruck() {
                const p = st.lastPlayerVoxelChunk;
                r._rebuildVoxelChunk(p.cx, p.cz, null, { forceSync: "injiziert" });
            })();
            // der Guss ohne Vorlage — und DER BODEN IM FADEN (w4-b-boden2): die Naht eines Faden-Netzes ohne ihr Gedächtnis, sein
            // Satz ohne Vorlage
            (function injizierterGussUndBoden() {
                r._ofenMenschTemplate({ t: t0 }, 0, 0, 3, true);
                const [k, { mesh }] = [...st.voxelChunks].find(([, x]) => x.mesh?.geometry.userData.ausFaden);
                mesh.geometry.userData.naht = null;
                r._bodenNaht(mesh.geometry);
                r._chunkSatzEin("boden", k, mesh.geometry, k);
            })();
            // ein Glied des Kopfs mit 2 MB im Stand: die Zeile des Speichers nennt es beim Namen (.Feld.Glied)
            st.worldMeta.k5Probe = "k".repeat(2e6);
            r.saveState();
            delete st.worldMeta.k5Probe;
            (function injizierterWuchs() {
                // der Bauplan eines Spawns wächst im Haupt-Faden, obwohl der Wald-Faden lebt (w4-b-pflanzen, `_wuchsSkelett`)
                r._growTreeBlueprint("busch_hazel", "selbsttest", { spawn: true });
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
    const F = await page.evaluate(() => jsonKlon({ ...window.__faden, bau: r._syncBauten() }));
    const mb = (b) => (b / 1e6).toFixed(2);
    const summe = (o) => Object.values(o || {}).reduce(addiere, 0);
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
    // ZEIT (w28-tor-bruch): der Takt in ms meldet am Lande-Tor (`mass`); welche Felder im Haupt-Faden rechnen, bleibt BRUCH
    if (!mass("ZEIT", !(F.stau.ms > 8), `Stau-${stauTakt} > 8 ms`)) F.stau.rot.push(stauTakt);
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
    let rot = !!blind || k4 > 0 || proMin.fahrt > FADEN_SOLL || planetRot.length > 0;
    planetZeile(planetIst, planetSollWert, planetRot);
    if (blind) console.log(`  ⛔ BLIND: ${blind}`);
    if (k4) console.log(`  ⛔ K4: ${k4} synchrone Bauten im Haupt-Faden, obwohl ein Faden zuständig ist`);
    if (proMin.fahrt > FADEN_SOLL)
        console.log(`  ⛔ K5: ${mb(proMin.fahrt)} MB/min am Empfang in der Fahrt > ${mb(FADEN_SOLL)}`);
    if (SELBSTTEST) {
        const S = F.t.selbst || { empfang: {}, kopie: {} };
        const nennt = (n) => F.hydro.rot.concat(F.bau.rot, F.stau.rot).some((x) => x.includes(n));
        const krume = S.empfang["selbsttest:krume"] || 0;
        const kopf = S.gesendet["speicher:stand:.worldMeta.k5Probe"];
        const klon = (S.empfang["selbsttest:klon"] || 0) + krume;
        const sieht =
            ["injizierteHydro", "injizierterFussabdruck", "injizierterGuss", "injizierterWuchs", "Boden-Naht", "Satz-Vorlage"].every(nennt) &&
            nennt("injiziertesStauFeld") &&
            klon >= 5.9e6 &&
            krume >= 2.9e6 &&
            summe(S.kopie) >= 5.9e6 &&
            kopf >= 2e6 &&
            proMin.selbst > FADEN_SOLL;
        console.log(
            `  ${sieht ? "✅" : "⛔"} SELBSTTEST: injizierter Hydro-Bau, synchroner Fußabdruck, Guss, Wuchs, Boden, Stau-Feld, Stand (${mb(kopf)} MB) und Klon (${mb(klon)} MB, Kopie ${mb(summe(S.kopie))} MB) ${sieht ? "fallen ROT beim Namen" : "BLIEBEN UNSICHTBAR"}`
        );
        rot = rot || !sieht;
        rot = rot || !(await planetSelbst(page, planetIst, planetSollWert));
    }
    console.log(
        `\n${rot ? "⛔ FADEN ROT" : "✅ FADEN GRÜN: K4 0 synchrone Bauten außerhalb der Sync-Stellen · K5 " + mb(proMin.fahrt) + " MB/min ≤ 5 in der Fahrt · K6 der Anker des Planeten im Faden = der Kern, der Faden schlank und geboren mit seinem ersten Leser"}\n`
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
    await ortZug(page, "genesis"); // die Ankunft trägt ihren Dorf-Zug (haushalt genesis: er ruht) — die Linse lädt ohne `server.zeige`
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
    if (argv.includes("--gezeit")) process.exit(await gezeitProbe(page, url));
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
    let vergisst = "";
    for (const welt of WELTEN) {
        let weltArg = welt;
        const json = JSON.parse(liesText(BUEHNE_DATEI));
        if (welt === "buehne") {
            const stationen = JSON.parse(
                liesText(path.resolve(path.dirname(BUEHNE_DATEI), "stationen.json"))
            ).stationen;
            // Geboren wie im Spiel aus einer frischen Standard-Welt (der Selbsttest verfälschte den Kern des Fadens, und der Faden
            // bleibt der Seite): importWorldBeside (Welt-Tor), dann der Welt-Wechsel des Spiels (`_weltWechsel`: Zeiger, Sperre,
            // Tausch am Ort) — ein Speichern der alten Welt im Wechsel setzte den Zeiger sonst zurück
            await frischBoot(page, url);
            const id = await page.evaluate((json) => {
                const res = r.importWorldBeside(json);
                if (!res.ok) return null;
                r._weltWechsel(res.worldId);
                return res.worldId;
            }, json);
            if (!id) throw new Error("die Bühne ließ sich nicht importieren");
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
                console.log(`  SELBSTTEST Strom (die Urform, Soll rot):${(urform = await strom(page, true))}`);
            const sp = await spalteEinmal(page, false);
            console.log(`    Die Spalte einmal (Teil E, \`_terrainColumnContextIn\`, neu je Ruf): ${sp} (Soll ${SPALTE_SOLL})`);
            rot ||= sp !== SPALTE_SOLL;
            if (SELBSTTEST) console.log(`  SELBSTTEST Spalte (vergisst, Soll rot):${(vergisst = await spalteEinmal(page, true))}`);
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
        const mu = welt === "standard" ? mascheUrteil(rep.masche) : { gut: true };
        if (welt === "standard") console.log(
            `    Masche des Felds: ${rep.masche ? `Ring ≠ Gesetz ${rep.masche.ringUngleich} von ${rep.masche.n} · Naht Feld ↔ Ring ${rep.masche.naht.toExponential(1)} m (Soll ≤ ${MASCHE_NAHT_M}) · hinter der Naht lesen ${rep.masche.liest} Punkte die Stufe ihrer Masche (größte ${rep.masche.groesste.toFixed(1)} m)` : "keine Probe"}${mu.gut ? "" : " — ⛔ " + mu.rot.join(" · ").toUpperCase() + ": " + mu.taeter}`
        );
        if (!mu.gut) rot = true;
        const wa = rep.wald;
        const wu = rep.wuchs || [];
        console.log(
            wa
                ? `    Stoff des Walds (Main = Voxel-Faden, Teil W): ${wa.zellen} Zellen · ${wa.darts} Darts · abweichend ${wa.abweichend} · Wuchs im Vorrat (Teil B) ${wu[0]} Skelette, abweichend ${wu[1]}` +
                      (wa.erste
                          ? ` — erste Zelle ${wa.erste.gx},${wa.erste.gz} am Ort ${wa.erste.ort}: Main ${JSON.stringify(wa.erste.main)} · Faden ${JSON.stringify(wa.erste.faden)}`
                          : "")
                : "    Stoff des Walds: kein Voxel-Faden oder keine Wahrheit — keine Probe"
        );
        if (welt === "standard" && (!wa || !(wa.darts > 0) || wa.abweichend > 0 || !wu[0] || wu[1])) rot = true;
        if (welt === "standard") {
            const [gut, satz] = rangUrteil(rep);
            console.log(`    Wahl des Wald-Fadens (Teil R, gesendet ${RANG_REIHE.join(" · ")} m): ${satz}`);
            if (!gut) rot = true;
        }
        if (rep.abweichend > 0 || rep.befunde.length) rot = true;
        if (SELBSTTEST && welt === "standard") {
            const v = await probeVerfaelscht(page, url);
            selbst = {
                abweichend: v.abweichend,
                maxDiff: v.maxDiff,
                gitter: v.gitter,
                ferne: v.ferne ? v.ferne.abweichend : 0,
                masche: mascheUrteil(v.masche).rot.join(" · "),
                wald: v.wald ? v.wald.abweichend : 0,
                wuchs: v.wuchs?.[1],
                rang: (v.rang || []).join(" · "),
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
        jsonSchreiben(ABDRUCK, abdruck);
        console.log(
            `\n  Abdruck: ${ABDRUCK} (${abdruck.gitter.length} Gitter + Makro ${Object.keys(abdruck.saaten || {}).length} Saaten${abdruck.buehne ? " + Bühne" : ""})`
        );
    }
    if (JSON_AUS) jsonSchreiben(JSON_AUS, { berichte, selbst });
    let pass;
    if (SELBSTTEST) {
        // die Höhen der Ferne (K60) fallen mit demselben verfälschten Worker-Term rot, der Zwilling der Form beim Namen
        console.log(`  SELBSTTEST Zwilling der Form: rot ${selbst ? selbst.namen : "?"} (Soll FERN-RING)`);
        // das Urteil über Teil R an vier Fällen: der Riegel hielt und die Wahl stimmt · er hielt und der fernste kam zuerst (der
        // Fund im Faden) · er hielt in drei Versuchen nicht · es gab keinen Faden — nur der zweite heißt RANG
        const riegelFaelle = [
            { rang: RANG_REIHE.slice().sort((a, b) => a - b), riegel: [300, 1, 1] },
            { rang: [500, 1, 300, 400], riegel: [300, 1, 1] },
            { riegel: [5, 40, 3] },
            {},
        ]
            .map((f) => rangUrteil(f))
            .map(([gut, satz]) => (gut ? "nah" : satz.includes("⛔ LEER") ? "LEER" : satz.includes("⛔ RANG") ? "RANG" : "?"))
            .join(" · ");
        console.log(`  SELBSTTEST Urteil über die Wahl (hielt · Faden wählt falsch · Riegel hielt nicht · kein Faden): ${riegelFaelle} (Soll nah · RANG · LEER · LEER)`);
        pass =
            !rot &&
            riegelFaelle === "nah · RANG · LEER · LEER" &&
            selbst &&
            selbst.abweichend > 0 &&
            selbst.ferne > 0 &&
            selbst.masche === Object.keys(MASCHE_MUTANTEN).join(" · ") &&
            selbst.wald > 0 &&
            selbst.wuchs > 0 &&
            urform &&
            urform.endsWith("Reihe verzögert") &&
            vergisst === "1,1,1" &&
            selbst.rang === RANG_REIHE.join(" · ") &&
            selbst.namen === "FERN-RING";
        console.log(`  SELBSTTEST Stoff des Walds: ${selbst ? selbst.wald : "?"} abweichende Zellen · Wuchs ${selbst?.wuchs} (Soll > 0)`);
        console.log(`  SELBSTTEST Höhen der Ferne: ${selbst ? selbst.ferne : "?"} abweichende Punkte (Soll > 0)`);
        console.log(`  SELBSTTEST Masche des Felds (drei Zeilen des Fadens genommen): rot ${selbst ? selbst.masche || "nichts" : "?"} (Soll ${Object.keys(MASCHE_MUTANTEN).join(" · ")})`);
        console.log(`  SELBSTTEST Wahl des Wald-Fadens (ohne „die Reihe zuerst“): geliefert ${selbst ? selbst.rang : "?"} (Soll die Reihe der Ankunft ${RANG_REIHE.join(" · ")})`);
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
