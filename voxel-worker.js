// =============================================================================
// voxel-worker.js — AnazhRealm Worker für Voxel-Density-Sampling
//
// V9.89 (Welle Perf-3.c Phase 1 — Worker-Foundation): mirror der Density-Pipeline
// aus dem Stamm (`stamm/`) für den Web-Worker-Kontext. Der Worker bekommt einen
// State-Snapshot per `init`-Message (Seed, Atlas, voxelEdits,
// baseHeight, waterLevel), Delta-Updates bei Welt-Mutationen, und beantwortet
// `density-grid`-Requests mit einem Float32Array via Transferable (zero-copy).
//
// Heilige Lektion gewahrt (der Stamm bleibt EINE Klasse): dies ist eine
// BAUSTELLE (separate Ausführungs-Umgebung), kein Domäne-Modul-Split. Die
// Funktions-Namen + Logik spiegeln 1:1 die Main-Thread-Implementierung — wer
// einen Algorithmus dort ändert, MUSS hier mit-wandern (Determinismus-Test im
// playtest verifiziert bit-identische Output bei jedem Lauf).
//
// Profi-Vorbild Subnautica/NMS/Astroneer: Welt-Density läuft in Workers parallel
// zum Main-Thread, dieser braucht nur noch Iso-Meshing + Collision-BVH (~30 ms).
//
// Stand V18.31 (integriert seit V9.90, voll engagiert seit V17.118): der Worker
// baut die Density-Grids OFF-THREAD; der Main-Thread meshet (Iso) + sync't nur
// noch den Spieler-Chunk, ferne Chunks warten auf den Worker (V17.118 — der
// ~71-ms-Sync-Bau war die Streaming-Spike-Wurzel). Der Determinismus-Test
// (playtest) bewacht weiter die bit-identische Spiegelung zum Main-Thread.
// HINWEIS: dies ist CPU-Parallelität (eigener Thread, Subnautica/NMS-Vorbild),
// NICHT GPU — der WebGPU-Density-COMPUTE-Pfad wurde abgeklemmt (V14.6/V17.20).
// =============================================================================

// Vendor-`simplex-noise.js` prüft `typeof window !== 'undefined'` für sein
// Global-Export; in Worker-Scope existiert das nicht. Shim VOR importScripts
// macht das Export auf `self.SimplexNoise` sichtbar (Worker-Standard-Pattern,
// bricht KEINE Vendor-Logik — die IIFE legt SimplexNoise auf window.X, und
// window === self in unserem Shim).
self.window = self;
// V18.112 — F1-Boot-Sonden-Fang: im BLOB-Worker (null-origin-Rekursion,
// Schnitt 2) hat eine blob:-URL KEINE Basis — ein relatives importScripts
// wirft SyntaxError. Der Blob-Fallback injiziert `self.__anazhBase`
// (absolute App-Basis); der normale Worker läuft mit "" relativ wie eh.
importScripts((self.__anazhBase || "") + "vendor/simplex-noise.js");

// DAS NEUE KLEID Welle 0: der gesetz-wahre Phyto-Wuchs-Kern (phyto-core.js) — DIESELBE Quelle
// wie der Main-Thread (`__phytoCore.growSkeleton`) + das Terrain-Portal, kein Mirror. Der
// Chunk-Mesh-Bau kann so Vegetation worker-seitig wachsen lassen (künftige Wellen), bit-
// identisch zum Main. `?v=` mitziehen → derselbe Cache-Bust wie der Worker.
const __phytoV = (function () {
    try {
        return new URLSearchParams(self.location.search).get("v") || "";
    } catch (_e) {
        return "";
    }
})();
importScripts((self.__anazhBase || "") + "phyto-core.js" + (__phytoV ? "?v=" + __phytoV : ""));

// K09a — DAS GELÄNDE-GESETZBUCH (gelaende-core.js): die EINE 2D-Höhe, DIESELBE Datei wie der Main-Thread — kein
// Spiegel. Der Worker reicht seinen `state` als Gelände-Lage (seed · noise · baseHeight · waterLevel · erbgut ·
// regionSize). Fehlt der Kern, wirft der
// Worker beim Laden (fail-closed, nie still eine eigene Höhe).
importScripts((self.__anazhBase || "") + "gelaende-core.js" + (__phytoV ? "?v=" + __phytoV : ""));
const G = self.__gelaendeCore;
if (!G || typeof G.hoehe !== "function") throw new Error("voxel-worker: gelaende-core fehlt");
// die Zahlen je Segment des gepackten Kanal-Index (gelaende-core `hydroBuildCarveIndex`)
const KANAL_FELDER = G.KANAL_FELDER;

// State-Container — wird per init-Message gesetzt + per state-update-Delta gepflegt.
const state = {
    seed: null,
    noise: null,
    baseHeight: 0,
    waterLevel: 0,
    hydrosphere: null, // { ready, originX, originZ, cell, dim, kanal, bucketSize, bucketsDim, lakeBedCell, lakeW, lakeNear, water:{waterY, waterKind} }
    hydroTiles: null, // A3 (V18.132) — Map key → tile, die fernen Kacheln (gleicher Feld-Satz wie hydrosphere)
    hydroWelt: null, // die Welt der Regionen (`_hydroWelt` des Mains): eine neue im Stand räumt sie
    hydroBand: null, // V9.91 — { top, bottom } für Cell-Klassifikation-Skip
    voxelEdits: [], // Array of { x, y, z, r, mode } — die EINE Liste, ohne Deckel; gelesen über die Edit-Karte
    hydroComputing: false,
    // DAS GESETZ DER HYDROSPHÄRE des Mains (`HYDROSPHERE`: Zelle, Bank, Damm, Freibord, Bett — Karte hydro-faden): der Faden
    // rechnet mit ihm die Regionen (gelaende-core `hydrosphaere`) und baut mit ihm den Kanal. Fehlt es, wirft der Bau.
    hydroGesetz: null,
    // V18.181-merge-Λ Sub 3h — Γ1-Lesart-4 (V18.178, clever-gauss): die Genese-
    // Schleuse. Fehlt im Snap (Legacy-Welt) → 1 → feuchteAt = 0 (kein Erde-
    // Boden-Drift); Genese-2 (neue Welt) → 2 → der Boden atmet.
    genVersion: 1,
    // die Kachel-Kante der Hydro-Regionen (Main `HYDROSPHERE.regionSize`) — der Kachel-Schlüssel des Gesetzbuchs liest sie
    regionSize: null,
    // DAS ERBGUT der Welt in der Normalform des Mains (`_erbgut()`: { terme, wildnis, hash }) — die Terme der EINEN
    // 2D-Höhe. Der Main schickt es mit jedem Snapshot; fehlt es, wirft der Auswerter (fail-closed, nie still Wildnis).
    erbgut: null,
    // der Erdbau der Orte (K10, gelaende-core `erdbauNormal`) oder null, und seine Liste (`_erdbauRoh` des Mains)
    erdbau: null,
    erdbauRoh: null,
    // DER FELS-STOFF des Mains (`FELS_STOFF.basis` · `FELS_STOFF.netz`, K17-2): die Töne und Schwellen, mit denen
    // `buildChunkMesh` den Stoff baut (gelaende-core `felsStoff`). Fehlt er, wirft der Bau (fail-closed).
    felsStoff: null,
};

self.onmessage = function (e) {
    const msg = e.data;
    if (!msg || !msg.type) return;
    if (warten) return void warten.push(e); // die Regionen des Voxel-Fadens kommen zuerst (`hydroVom`)
    try {
        if (msg.type === "init" || msg.type === "state-set") {
            applyStateSnapshot(msg.snapshot);
            if (msg.hydroVon) hydroVom(msg.hydroVon);
            self.postMessage({ type: "ack", op: msg.type, requestId: msg.requestId || null });
        } else if (msg.type === "state-update") {
            applyStateDelta(msg.delta);
            self.postMessage({ type: "ack", op: "state-update", requestId: msg.requestId || null });
        } else if (msg.type === "hydro") {
            // DIE HYDROSPHÄRE IM FADEN (Karte hydro-faden, Lehre 14): die Heimat (`key` "heim") oder eine ferne Kachel entsteht
            // HIER, an DERSELBEN Stelle der Zustands-Reihe in jedem Faden (der EINE Sender `_voxelZustandPost`) — der Voxel-Faden
            // antwortet dem Main per Transfer (`hydroAntwort`), ein Neben-Faden behält sie nur. Jeder Auftrag dahinter liest sie.
            const h = hydroRegion(msg.key, msg.origin || null);
            if (msg.requestId) {
                const a = hydroAntwort(h, true);
                self.postMessage(
                    { type: "hydro-result", requestId: msg.requestId, key: msg.key, region: a.region },
                    a.transfer
                );
            }
        } else if (msg.type === "hydro-an") {
            // DIE REGIONEN AN EINEN NEBEN-FADEN: ein Faden, der nach einer Bestellung geboren wurde, rechnete sie nicht — dieser
            // Faden reicht ihm jede, die er trägt (alle Bestellungen vor dem Port stehen hier schon), je eine Kopie per Transfer.
            // Der Haupt-Faden klont nie eine Region (bis zur Karte streaming-k5 klonte sein Geburts-Stand sie, 0,23 MB je Boot).
            const regionen = [...(state.hydroTiles || [])];
            if (state.hydrosphere) regionen.unshift(["heim", state.hydrosphere]);
            for (const [key, h] of regionen) {
                const a = hydroAntwort(h, false);
                msg.port.postMessage({ key, region: a.region }, a.transfer);
            }
            msg.port.postMessage({ fertig: true });
        } else if (msg.type === "density-grid") {
            const { ox, oy, oz, dimX, dimY, dimZ, step, requestId } = msg;
            const density = computeDensityGrid(ox, oy, oz, dimX, dimY, dimZ, step);
            self.postMessage({ type: "density-grid-result", requestId, density: density.buffer }, [density.buffer]);
        } else if (msg.type === "chunk-mesh") {
            // V9.91 (Phase 3): voller Chunk-Mesh-Build im Worker, die Arrays per Transfer (`chunkAntwort`). DIE PLATTE IM FADEN
            // (Karte hydro-faden, Lehre 24): trägt der Auftrag den Schlüssel seines Warm-Starts (`platte`, nur edit-freie
            // Footprints), liest der Faden ihn zuerst von der Platte und legt jeden frischen Bau dort ab — der Haupt-Faden
            // klont nie mehr einen Reply in die IndexedDB oder aus ihr. Die Flut-Saat der Nachbarn (Main `_flutSaat`, null
            // ohne Carve im 3×3) reist als Daten mit dem Auftrag.
            if (msg.platte) plattePost(msg);
            else chunkPost(msg, null);
        } else if (msg.type === "zellen-frei") {
            // der Main trägt die Zellen nicht mehr: nur sie fallen, ein neuerer Bau desselben Chunks bleibt
            msg.keys.forEach((k, i) => {
                const l = (zellen.get(k) || []).filter((b) => b.zid !== msg.zids[i]);
                if (l.length) zellen.set(k, l);
                else zellen.delete(k);
            });
        } else if (msg.type === "water-sheet") {
            // B1 (V18.345) — der Wasser-Sheet OFF-THREAD (Streaming, CA-frei). Der Main
            // sendet den 3×3-Zell-Block (eigener Chunk + 8 Nachbarn, je Verweis, eigene
            // Zellen oder nichts), der Worker baut das Sheet (byte-identisch zu `_computeWaterSheetData`)
            // + transferiert die Geometrie-Arrays zurück. Main macht nur BufferGeometry +
            // Mesh (`_applyWorkerWaterSheet`). `getDach` undefined → dachlos (der Main baut jede
            // Nachbarschaft mit gezeichnetem Dach selbst, `_waterSheetCaFree`).
            const { cx, cz, requestId, smoothPasses, zids, festAb, fest, eigen } = msg;
            // DIE ZELLEN DES FADENS (Karte hydro-faden): ein Verweis (`zids[i]`, Platz i = (dz+1)·3 + (dx+1)) nimmt die Zellen, die
            // dieser Faden für den Chunk baute und unverändert beim Main liegen (`zellen`); fehlt einer, nennt die Antwort ihn, und
            // der Main fragt mit genau diesen Zellen nach (`eigen`; bis zur Karte streaming-k5 mit allen neun: 2,9 MB je Minute
            // Fahrt). Verweise und Stempel reisen per Transfer (sk5-kopie).
            const fehlt = [];
            const cells = Array.from({ length: 9 }, (_, i) => {
                if (!(zids[i] > 0)) return eigen[i] || null;
                const z = (zellen.get(cx + ((i % 3) - 1) + "," + (cz + ((i / 3) | 0) - 1)) || []).find(
                    (b) => b.zid === zids[i]
                );
                if (!z) {
                    fehlt.push(i);
                    return null;
                }
                if (festAb[i + 1] === festAb[i]) return z.cells;
                // der Architektur-Stempel des Mains: seine Zellen sind fest (`_stampArchitectureSolidCellsInto`)
                const k = z.cells.slice();
                for (let j = festAb[i]; j < festAb[i + 1]; j++) k[fest[j]] = CELL_STATE.SOLID;
                return k;
            });
            if (fehlt.length) {
                self.postMessage({ type: "water-sheet-result", requestId, fehlt });
                return;
            }
            const ctx = {
                smoothPasses: smoothPasses | 0,
                getCells: (ncx, ncz) => {
                    const dx = ncx - cx;
                    const dz = ncz - cz;
                    if (dx < -1 || dx > 1 || dz < -1 || dz > 1) return null;
                    return cells[(dz + 1) * 3 + (dx + 1)] || null;
                },
                getDach: () => undefined,
            };
            const data = buildWaterSheetGeometry(cx, cz, ctx);
            if (!data) {
                self.postMessage({ type: "water-sheet-result", requestId, empty: true });
            } else {
                const positions = new Float32Array(data.positions);
                const indices = new Uint32Array(data.indices);
                const aFlow = new Float32Array(data.aFlow);
                const aWave = new Float32Array(data.aWave);
                const aDepth = new Float32Array(data.aDepth);
                const aSlope = new Float32Array(data.aSlope);
                self.postMessage(
                    {
                        type: "water-sheet-result",
                        requestId,
                        empty: false,
                        positions: positions.buffer,
                        indices: indices.buffer,
                        aFlow: aFlow.buffer,
                        aWave: aWave.buffer,
                        aDepth: aDepth.buffer,
                        aSlope: aSlope.buffer,
                    },
                    [positions.buffer, indices.buffer, aFlow.buffer, aWave.buffer, aDepth.buffer, aSlope.buffer]
                );
            }
        } else if (msg.type === "fern") {
            // DER HORIZONT IM FADEN (B2, `fernAuftrag`): Höhe, Nässe und Fern-Farbe der Ferne an DEMSELBEN Zustand wie jeder
            // Chunk — per Transfer zurück (Lehre 24); der Main lädt nur hoch und hängt ein.
            const r = fernAuftrag(msg);
            self.postMessage(Object.assign({ type: "fern-result", requestId: msg.requestId }, r.antwort), r.transfer);
        } else if (msg.type === "spiegel-feld") {
            // DAS SPIEGEL-FELD (D10): ein Rechteck der Welt-Zellen — die Höhen (untere Fläche, Basis und Dach der Krone, ihre
            // Gestalt) als RGBA-Halbfloat, der Stoff der unteren Fläche als RGBA8 — aus dem GEBAUTEN Boden dieses Workers
            // (`spiegelFeldBacken`); per Transfer zurück (Lehre 24).
            const daten = spiegelFeldBacken(msg);
            self.postMessage(
                {
                    type: "spiegel-feld-result",
                    requestId: msg.requestId,
                    hoehen: daten.hoehen.buffer,
                    stoff: daten.stoff.buffer,
                    hoechste: daten.hoechste.buffer,
                },
                [daten.hoehen.buffer, daten.stoff.buffer, daten.hoechste.buffer]
            );
        } else if (msg.type === "wald-darts") {
            // DIE SCHLANGE IM FADEN (B-Wald): der Auftrag wartet in `waldAuftraege`, der Faden rechnet je Takt den nächsten
            // (`waldTakt`) — ein später bestellter naher überholt die fernen, die vor ihm reisten
            waldAuftraege.push(msg);
            waldWecken();
        } else if (msg.type === "streu-region") {
            // DIE STREU DER REGION IM FADEN (B-Streu): Felder und Würfe jeder Schicht (phyto-core `streuRegion`) per Transfer
            // zurück (Lehre 24) — der Haupt-Faden urteilt nur, was sein Zustand trägt, und setzt die Instanzen (`_scatterPass`)
            const w = self.__phytoCore.streuRegion(Object.assign(msg, { leser: STREU_LESER }));
            self.postMessage(
                { type: "streu-region-result", requestId: msg.requestId, wuerfe: w.map((a) => a.buffer) },
                w.map((a) => a.buffer)
            );
        } else if (msg.type === "ort-wahl") {
            // DIE ORT-WAHL IM FADEN (siedlung.K5, `ortWahl`): die Antwort trägt den Plan v2 des ersten Kandidaten, der jedes Haus
            // im groben Raster trägt (`wand` true: auch im Raster der Wand) — der Wirt prüft an ihm die Bauten und den Spieler
            self.postMessage(Object.assign({ type: "ort-wahl-result", requestId: msg.requestId }, ortWahl(msg)));
        } else if (msg.type === "ort-raster") {
            // DAS HÖHEN-RASTER DER TRASSE (siedlung.K3): der Grund im Rahmen `rahmen` (fachwerk `trasseRahmen`) um den Ort x/z am
            // Zustand des Gesetzes (gelaende-core `hoehenRaster`) — der Wirt reicht es dem Export, dessen Gassen ihm folgen. DAS
            // WASSER DES RASTERS (w4-stadt-orte): mit `W`/`M` je Punkt dasselbe Urteil `ortNass`, das der Plan v2 als ctx.wasserAt
            // liest (`nass`, 1 = Wasser) — die Wahl der Orte mit Rolle legt keinen in einen Bach (fachwerk `stadtOrte`); bis hier kannte
            // sie nur die Höhe, und der Plan v2 nahm den Rundkurs der Großstadt „dorf 7 120" (`orteImWasser`)
            const raster = G.hoehenRaster(state, msg.x, msg.z, msg.rahmen);
            const zu = [raster.h.buffer];
            if (msg.W) {
                const r = msg.rahmen;
                raster.nass = new Uint8Array(r.n * r.n);
                for (let j = 0; j < r.n; j++)
                    for (let i = 0; i < r.n; i++)
                        if (ortNass(msg, null, msg.x + r.x0 + i * r.d, msg.z + r.z0 + j * r.d))
                            raster.nass[i + j * r.n] = 1;
                zu.push(raster.nass.buffer);
            }
            self.postMessage({ type: "ort-raster-result", requestId: msg.requestId, raster }, zu);
        } else if (msg.type === "ort-weg") {
            // DER FELDWEG ZWISCHEN ZWEI ORTEN (fahrzeug.K2): das Raster seines Rahmens am Zustand des Gesetzes und sein Lauf
            // über dem Grund von den Wegen des einen Orts (a) zu denen des anderen (b, fachwerk `wegZwischen`) — beides im
            // Faden, der Wirt legt die Punkte (`_wegenetzLegen`)
            if (!self.__fachwerkCore)
                importScripts((self.__anazhBase || "") + "fachwerk-core.js" + (__phytoV ? "?v=" + __phytoV : ""));
            const raster = G.hoehenRaster(state, msg.x, msg.z, msg.rahmen);
            // das Wasser des Gesetzes über die Breite des Wegs (`wegHalbM` um den Punkt des Rasters): das Urteil der Ort-Wahl
            // (`ortNass`, ohne Erdbau) — am Punkt allein fädelte er zwischen zwei Armen eines Bachs, die Räder im Wasser
            const nass = (x, z) =>
                [0, 0, msg.wegHalbM, 0, -msg.wegHalbM, 0, 0, msg.wegHalbM, 0, -msg.wegHalbM].some(
                    (v, i, R) => i % 2 === 0 && ortNass(msg, null, msg.x + x + v, msg.z + z + R[i + 1])
                );
            const pts = self.__fachwerkCore.wegZwischen(raster, msg.a, msg.b, msg.sperren, nass);
            // je Punkt sein Wasser (dasselbe Urteil) und die Höhe des Gesetzes: die Brücken des Feldwegs (fachwerk `brueckenAmWeg`)
            self.postMessage({
                type: "ort-weg-result",
                requestId: msg.requestId,
                pts,
                nass: pts ? pts.map((p) => nass(p.x, p.z)) : null,
                ys: pts ? pts.map((p) => G.hoehe(state, msg.x + p.x, msg.z + p.z, true)) : null,
            });
        } else if (msg.type === "stau") {
            // DER STAU IM FADEN (`stauRechnen`): der Voxel-Faden antwortet dem Main (`stau-result`, er trägt die Rückfrage-Nummer),
            // die Felder als Kopie per Transfer (Lehre 24; er behält seine), wenn eines kam, fiel oder neu ist, und die Fenster,
            // deren Zellen fallen; ein Neben-Faden behält sie nur
            const r = stauRechnen(msg);
            if (msg.requestId) {
                const anders = r ? r.anders.map(({ gx0, gz0, w, h, step }) => ({ gx0, gz0, w, h, step })) : [];
                const felder = anders.length
                    ? r.felder.map((f) => Object.assign({}, f, { fillY: f.fillY.slice() }))
                    : null;
                self.postMessage(
                    { type: "stau-result", requestId: msg.requestId, welt: msg.welt, felder, anders },
                    felder ? felder.map((f) => f.fillY.buffer) : []
                );
            }
        } else if (msg.type === "ping") {
            self.postMessage({ type: "pong", requestId: msg.requestId || null });
        }
    } catch (err) {
        // der Stapel reist mit (`stapel`): der Main wirft ihn weiter, jede Linse nennt die Zeile im Faden, die warf (z44: die
        // Meldung „reading '0'“ allein verbarg `fernAuftrag`)
        self.postMessage({
            type: "error",
            op: msg.type,
            requestId: msg.requestId || null,
            message: String(err && err.message ? err.message : err),
            stapel: err && err.stack ? String(err.stack) : null,
        });
    }
};

// DIE ANTWORT EINES CHUNKS (per Transfer, Lehre 24): die Arrays des Baus; das Morph-Ziel (`morphZiel`, das der Geomorph des
// Mains beschreibt) und in der gröbsten Stufe Normalen- und Farb-Ziel sind eigene Kopien — sie entstehen hier im Faden, nie im
// Haupt-Faden (bis zur Karte hydro-faden kopierte `_buildVoxelChunkDataFromWorkerMesh` sie: 2,5 MB je Minute Fahrt).
function chunkAntwort(mesh, lod) {
    if (mesh.empty) return { type: "chunk-mesh-result", empty: true, lod: lod | 0 };
    const grob = !mesh.stufeZiel;
    return {
        type: "chunk-mesh-result",
        empty: false,
        lod: lod | 0,
        positions: mesh.positions.buffer,
        // das Ziel der gröberen Stufe je Vertex (K51-2), null in der gröbsten Stufe
        stufeZiel: grob ? null : mesh.stufeZiel.buffer,
        morphZiel: (grob ? mesh.positions : mesh.stufeZiel).slice().buffer,
        normalZiel: (grob ? mesh.normals.slice() : mesh.normalZiel).buffer,
        farbeZiel: (grob ? mesh.colors.slice() : mesh.farbeZiel).buffer,
        normals: mesh.normals.buffer,
        indices: mesh.indices.buffer,
        colors: mesh.colors.buffer,
        // der Stoff (K17-2): Himmels-Sicht und Schutt je Vertex, die Feuchte des Mooses je Netz
        himmel: mesh.himmel.buffer,
        schutt: mesh.schutt.buffer,
        felsFeuchte: mesh.felsFeuchte,
        waterCells: mesh.waterCells.buffer,
        // der Höhlen-Graph (Welle 7): je Dreieck die Zelle seiner Luft + Zellen · Seiten · Portale
        hTri: mesh.hTri.buffer,
        hN: mesh.hN,
        hKnoten: mesh.hKnoten.buffer,
        hMuend: mesh.hMuend.buffer,
        hSeiten: mesh.hSeiten.buffer,
        hKanten: mesh.hKanten.buffer,
        hRand: mesh.hRand.buffer,
        vertCount: mesh.positions.length / 3,
        indexCount: mesh.indices.length,
    };
}

// DIE ZELLEN DES FADENS (Karte hydro-faden): je Chunk die Wasser-Zellen seiner letzten Bauten (`ZELLEN_JE_CHUNK`, der Main trägt
// beim Stufen-Wechsel noch den älteren, bis der neuere eintritt), je Bau seine Nummer (`zid`) — das Wasser-Sheet nimmt sie
// per Verweis statt eines Klons von neun Zell-Blöcken je Bestellung (79,7 MB je Minute Fahrt bis zur Karte). Der Main gibt
// einen Bau frei, wenn er ihn nicht mehr trägt (`zellen-frei`); ein verworfener fällt mit dem Deckel.
const zellen = new Map();
const ZELLEN_JE_CHUNK = 4;
let zellenNr = 0;

// Der Reply an den Main, die Puffer per Transfer: die Zellen behält der Faden als Kopie (`zellen`), die Platte bekommt den
// Reply VOR dem Transfer (ihr Put klont hier im Faden).
function chunkPost(msg, a) {
    const antwort = a || chunkAntwort(buildChunkMesh(msg.cx, msg.cz, msg.lod, msg.saat || null), msg.lod);
    if (!a && msg.platte) platteLege(msg.platte, antwort);
    const transfer = [];
    for (const k in antwort) if (antwort[k] instanceof ArrayBuffer) transfer.push(antwort[k]);
    if (antwort.waterCells && antwort.waterCells.byteLength) {
        antwort.zid = ++zellenNr;
        const k = msg.cx + "," + msg.cz;
        const l = (zellen.get(k) || []).concat({
            zid: antwort.zid,
            cells: new Uint8Array(antwort.waterCells.slice(0)),
        });
        zellen.set(k, l.slice(-ZELLEN_JE_CHUNK));
    }
    antwort.requestId = msg.requestId;
    self.postMessage(antwort, transfer);
}

// DIE PLATTE DES BODENS (Warm-Start, V18.484 — seit der Karte hydro-faden im Faden): der rohe Reply eines edit-freien Chunks
// liegt in IndexedDB ("anazhChunkMesh"/"chunks"), der zweite Boot liest den Ring von ihr. Stempel (`state.platte.stempel`:
// Version · Generation · Erbgut · Form) ungleich → leeren; ein Fehler → nur noch Bau (`tot`); voll (`max`) → leeren —
// die Korrektheit hängt nie an ihr. Der Main sagt, ob sie gilt (`state.platte.an`: headless aus).
const platte = { auf: null, db: null, stempel: null, tot: false, zahl: 0 };
function platteAuf() {
    const P = state.platte;
    if (!P || !P.an || platte.tot || !self.indexedDB) return Promise.resolve(null);
    if (platte.auf && platte.stempel === P.stempel) return platte.auf;
    platte.stempel = P.stempel;
    platte.db = null;
    platte.auf = new Promise((ok) => {
        const tot = () => {
            platte.tot = true;
            ok(null);
        };
        const req = self.indexedDB.open("anazhChunkMesh", 1);
        req.onupgradeneeded = () => req.result.createObjectStore("chunks");
        req.onerror = tot;
        req.onsuccess = () => {
            const db = req.result;
            const tx = db.transaction("chunks", "readwrite");
            const st = tx.objectStore("chunks");
            const g = st.get("__stamp");
            g.onsuccess = () => {
                if (g.result !== P.stempel) {
                    st.clear();
                    st.put(P.stempel, "__stamp");
                    platte.zahl = 1;
                } else st.count().onsuccess = (e) => (platte.zahl = e.target.result | 0);
            };
            tx.oncomplete = () => ok((platte.db = db));
            tx.onerror = tot;
        };
    });
    return platte.auf;
}
function plattePost(msg) {
    platteAuf()
        .then(
            (db) =>
                db &&
                new Promise((ok) => {
                    const g = db.transaction("chunks", "readonly").objectStore("chunks").get(msg.platte);
                    g.onsuccess = () => ok(g.result || null);
                    g.onerror = () => ok(null);
                })
        )
        .then((p) => {
            // ein Reply ohne Morph-Ziel ist eine alte Form: der Faden baut frisch
            if (p && !p.empty && !p.morphZiel) p = null;
            if (p) p.vonPlatte = true;
            chunkPost(msg, p || null);
        })
        .catch((err) =>
            self.postMessage({ type: "error", op: "chunk-mesh", requestId: msg.requestId, message: String(err) })
        );
}
// der Put klont SOFORT (synchron, hier im Faden) — vor dem Transfer, der die Puffer abgibt; die Platte steht, denn der Auftrag
// mit Schlüssel wartete auf sie (`plattePost`)
function platteLege(key, antwort) {
    const db = platte.db;
    if (!db || platte.tot) return;
    try {
        const st = db.transaction("chunks", "readwrite").objectStore("chunks");
        if (platte.zahl >= state.platte.max) {
            st.clear();
            st.put(platte.stempel, "__stamp");
            platte.zahl = 1;
        }
        st.put(antwort, key).onerror = () => (platte.tot = true);
        platte.zahl++;
    } catch (_e) {
        platte.tot = true;
    }
}

// DIE ORT-WAHL IM FADEN (siedlung.K5, K10): der Auftrag des Wirts (`_ortWahl`) — der Export `plan`, der Wunsch `origin`,
// die Ringe `W` (ORT_WAHL), `M` (WERK_LAND_M), der Spieler `spieler` {x, z, frei} und je Slot das Raster seines Fundaments
// (`raster`: plan-lokal je Slot die Punkte lx, lz des Wirts-Rasters `_fundamentRaster` im Schritt grob und in dem der Wand,
// `grobN`/`wandN` Punkte je Slot, `radius` die Reichweite des Grundrisses, NaN ohne). Ab dem Kandidaten `ab` rechnet der
// Faden je Ort der Ringe den Plan v2 (fachwerk `ortPlan`, dieselbe Gelände-Funktion: gelaende-core `hoehe` am Zustand samt
// dem Erdbau früherer Orte, das Wasser des Gesetzes `atlasWaterLevelAt`) und urteilt, ob er jedes Haus trägt (`ortTraegt`).
// Das Welt-Wasser des Plans (ctx.wasserAt: Haus und Brücken-Etikett) ist DASSELBE Urteil `ortNass` über dem Boden vor dem Plan:
// bis K5 kannte es nur den Spiegel über dem ungeformten Boden, nie den Fluss — sein Kanal liegt unter dem Spiegel, sein Damm
// darüber —, der Plan stellte Häuser in Kanal und Damm, und erst `ortTraegt` warf den Ort (nH 300: jeder der 231 Kandidaten,
// 8–48 Häuser und 4–22 Laternen in der Gestalt des Gewässers, der Faden rechnete 8–19 s). Ein Ort, an dem das Wasser ein Haus
// nimmt (fachwerk `ortImWasser`), trägt den Plan nie ganz: er fällt, bevor sein Plan entsteht. Rückgabe { index (−1: kein Ort,
// der Wunsch), v2, wand, abstandM, kandidaten (die Pläne der Ringe), ms }. Billige Urteile zuerst (Lehre 25): der Faden gibt den
// Ort nach dem groben Raster, der Wirt urteilt die Bauten, und erst sein Sieger (`msg.wand`: sein Index) zahlt das Raster der
// Wand (nH 300: 155 000 Punkte, ~1 s) an seinem Plan, neu gerechnet (der Faden hält keinen Zustand zwischen zwei Aufträgen: zwei
// Wahlen im Flug teilen ihn) — fällt er dort, rechnet der Faden ab dem nächsten weiter.
function ortWahl(msg) {
    if (!self.__fachwerkCore)
        importScripts((self.__anazhBase || "") + "fachwerk-core.js" + (__phytoV ? "?v=" + __phytoV : ""));
    const FC = self.__fachwerkCore;
    const { plan, origin, W } = msg;
    const t0 = self.performance.now();
    // DER ORT, DER WELT IST, RECHNET NEU (bauen.K2 Staffel 2, `_ortNeuPlanen`): `ohne` [von, bis) nimmt seinen eigenen Erdbau aus
    // der Höhe — wie bei seiner Wahl, bevor er lag; `fest` sind die Fremd-Slots seines Umkreises (fachwerk `ortPlan` ctx.fest)
    const L = msg.ohne
        ? Object.assign({}, state, {
              erdbau: G.erdbauNormal((state.erdbauRoh || []).filter((_p, i) => i < msg.ohne[0] || i >= msg.ohne[1])),
          })
        : state;
    const ctx = Object.assign(
        G.ortCtx(L, (x, z) => ortNass(msg, null, x, z, L)),
        { fest: msg.fest || [] }
    );
    let i = 0;
    let kandidaten = 0;
    for (let ring = 0; ring <= W.ringe; ring++) {
        const n = ring ? Math.ceil(2 * Math.PI * ring) : 1;
        for (let j = 0; j < n; j++, i++) {
            if (i < msg.ab) continue;
            const a = (2 * Math.PI * j) / n;
            const o = { x: origin.x + Math.cos(a) * ring * W.schrittM, z: origin.z + Math.sin(a) * ring * W.schrittM };
            const aus = (k, wand) => ({
                index: i,
                v2: k,
                wand,
                abstandM: ring * W.schrittM,
                kandidaten,
                ms: self.performance.now() - t0,
            });
            if (i !== msg.wand && FC.ortImWasser(plan, o, ctx) >= 0) continue;
            const k = FC.ortPlan(plan, o, ctx);
            kandidaten++;
            // grob zuerst (`grobM`: ein Kanal ist Meter breit, die nassen Orte fallen dort), das Raster der Wand am Sieger des Wirts
            if (i === msg.wand) {
                if (ortTraegt(msg, k, false)) return aus(k, true);
            } else if (ortTraegt(msg, k, true)) return aus(k, false);
        }
    }
    return {
        index: -1,
        v2: FC.ortPlan(plan, origin, ctx),
        abstandM: null,
        kandidaten,
        ms: self.performance.now() - t0,
    };
}
// TRÄGT DER PLAN v2 `k` JEDES HAUS des Exports? Jeder Punkt des Fundament-Rasters (`grob` im Schritt ORT_WAHL.grobM, sonst
// im Raster der Wand, 0,5 m) und jede Laterne liegt mit dem Boden, den der Erdbau des Plans baut, mindestens `M` über dem
// Wasser des Gesetzes an dieser Höhe — das Urteil der Wand (`_fundamentLand`) über dem Boden des Plans —, die Gestalt des
// Gewässers (`gewaesserForm`: Damm, Kanal, See-Becken) verschiebt ihn um höchstens `bodenTolM`, und kein Haus berührt den
// Spieler. Die Bauten (`_bauFrei`) urteilt der Wirt am Sieger.
function ortTraegt(msg, k, grob) {
    const plan = msg.plan;
    if (!k || !Array.isArray(k.slots) || k.slots.length !== plan.slots.length) return false;
    const E = G.erdbauNormal(k.erdbau);
    const nass = (x, z) => ortNass(msg, E, x, z);
    for (const l of k.laternen || []) if (l && nass(k.ort.x + l.x, k.ort.z + l.z)) return false;
    const R = msg.raster;
    const sp = msg.spieler;
    let p = 0;
    for (let si = 0; si < k.slots.length; si++) {
        const sl = k.slots[si];
        const nG = R.grobN[si];
        const nW = R.wandN[si];
        const p0 = p;
        p += nG + nW;
        if (!(R.radius[si] >= 0)) continue;
        const wx = k.ort.x + sl.x;
        const wz = k.ort.z + sl.z;
        if (sp && Math.hypot(sp.x - wx, sp.z - wz) < R.radius[si] + sp.frei) return false;
        const ry = sl.phi || 0;
        const c = Math.cos(ry);
        const sn = Math.sin(ry);
        const von = grob ? p0 : p0 + nG;
        const bis = grob ? p0 + nG : p0 + nG + nW;
        for (let q = von; q < bis; q++) {
            const lx = R.lx[q];
            const lz = R.lz[q];
            if (nass(wx + lx * c + lz * sn, wz - lx * sn + lz * c)) return false;
        }
    }
    return true;
}
// DAS WASSER DES ORTS an (x, z): der Boden (gelaende-core `hoehe` samt dem Erdbau früherer Orte, darauf der Erdbau `E` des
// Plans, null: der Boden vor dem Plan) verschiebt die Gestalt des Gewässers (`gewaesserForm`) um mehr als `bodenTolM`, oder er
// liegt weniger als `M` über dem Wasser des Gesetzes. Leser: das Welt-Wasser des Plans (`ortWahl`) und `ortTraegt`.
function ortNass(msg, E, x, z, L = state) {
    const h0 = G.hoehe(L, x, z, true);
    const he = E ? G.erdbauY(E, x, z, h0) : h0;
    const h = G.gewaesserForm(he, 0, hydrosphereCarveAt(x, z), hydrosphereLakeAt(x, z));
    if (Math.abs(h - he) > msg.W.bodenTolM) return true;
    return h < atlasWaterLevelAt(x, z, h) + msg.M;
}

// DIE SCHLANGE DES WALDS IM FADEN (B-Wald): die Schlange des Main schickt jede bestellte Zelle sofort (`_waldFadenSchicken`,
// alle Aufträge im Flug); hier wartet jeder Auftrag, und der Faden rechnet je Takt EINEN — den mit dem kleinsten `rang` (der
// Abstand² seiner nächsten Zelle zum Spieler beim Senden; ohne Rang 0, eine Frage) — und kehrt danach in seine Nachrichten
// zurück: jede neue Nachricht des Zustands und jeder neue Auftrag kommen vor dem nächsten an. In der Reihe der Ankunft (alle
// im Flug, ohne diese Schlange) warteten GTX kalt die nahen Zellen (8–54 m) 3,8 s hinter 712 fernen (p3/n1910/bwald, B0).
const waldAuftraege = [];
const waldTakt = new self.MessageChannel();
let waldWach = false;
function waldWecken() {
    if (waldWach || !waldAuftraege.length) return;
    waldWach = true;
    waldTakt.port2.postMessage(0);
}
waldTakt.port1.onmessage = () => {
    waldWach = false;
    let i = 0;
    for (let k = 1; k < waldAuftraege.length; k++)
        if ((waldAuftraege[k].rang || 0) < (waldAuftraege[i].rang || 0)) i = k;
    const msg = waldAuftraege.splice(i, 1)[0];
    try {
        waldDarts(msg);
    } catch (err) {
        self.postMessage({
            type: "error",
            op: msg.type,
            requestId: msg.requestId || null,
            message: String(err && err.message ? err.message : err),
            stapel: err && err.stack ? String(err.stack) : null,
        });
    }
    waldWecken();
};

// DER STOFF DES WALDS (K60-3): die geborenen Darts der Wald-Zellen (phyto-core `planForestCell`) mit den Lesern DIESES Fadens
// — derselbe Plan wie `_forestCellDarts` im Main, Wort für Wort (gate:worker-dichte Teil W), am Zustand, wenn er rechnet:
// mindestens dem, der vor dem Auftrag reiste (Hydro-Kacheln, Erdbau, Edits; einen Erdbau seit dem Auftrag verwirft der Main).
// Gepackt per Transfer: je Dart WALD_FELDER Zahlen, die Art als Index in `arten`; der Main legt sie ins Dart-Gedächtnis
// seines Stands (`_waldDartsAn`).
function waldDarts(msg) {
    const z = msg.zellen;
    const n = (z.length / 2) | 0;
    const ctx = waldCtx(msg);
    const arten = [];
    const artIdx = new Map();
    const zahl = [];
    const anzahl = new Int32Array(n);
    for (let k = 0; k < n; k++) {
        const out = self.__phytoCore.planForestCell(z[k * 2], z[k * 2 + 1], msg.seedInt, ctx);
        anzahl[k] = out.length;
        for (const d of out) {
            let ai = artIdx.get(d.sp);
            if (ai === undefined) {
                ai = arten.length;
                arten.push(d.sp);
                artIdx.set(d.sp, ai);
            }
            zahl.push(d.x, d.z, ai, d.s, d.T, d.prio, d.keep, d.totRoll, d.rotY, d.seed);
            zahl.push(d.surfaceY == null ? NaN : d.surfaceY);
        }
    }
    const werte = new Float64Array(zahl);
    self.postMessage(
        {
            type: "wald-darts-result",
            requestId: msg.requestId,
            anzahl: anzahl.buffer,
            werte: werte.buffer,
            arten,
        },
        [anzahl.buffer, werte.buffer]
    );
}

// =============================================================================
// DIE LESER DES WALDS (K60-3) — Mirror der Welt-Leser, die `_forestCellDarts` dem Wald-Plan reicht (Oberfläche · Wasser ·
// Steilheit · Feuchte · fbm · Ort). Bei jeder Anpassung dort: hier mit-wandern (gate:worker-dichte Teil W vergleicht die
// Darts Main = Worker Wort für Wort).
// =============================================================================

// Mirror von `_voxelSurfaceY`: von oben durchs Band bis zur ersten Luft→Fest-Grenze, der Nulldurchgang linear.
function voxelSurfaceY(x, z, gitter) {
    const base = state.baseHeight || 0;
    const cfg = voxelChunkConfig(0);
    const floorY = base - cfg.floorDrop;
    const top = floorY + cfg.dimY * cfg.step - 8;
    const bottom = floorY + 12;
    const colCtx = terrainColumnContext(x, z);
    // DER KELLER IST HOHL (S4): die Fläche ist eine Probe des FELDS wie `_voxelSurfaceY` des Mains (`_fieldDensityAt`: die
    // Spalte über einem Keller, gelaende-core `erdbauKeller`, liest `erdbauHohl` je Probe) — das Gitter des Netzes nie. Bis
    // b-feuchte las der Faden hier die Dichte ohne Keller: an den Spalten über einem Keller fielen Steilheit und Würfe der Streu
    // (Fels 2219 gegen 2246 an der Region des Spielers) und des Walds anders als im Haupt-Faden. `gitter`: der Boden des Netzes
    // ohne Keller (die Hydrosphäre, deren Becken nie im Keller liegt).
    const E = state.erdbau;
    const K = !gitter && E && E.hohl && G.erdbauKeller(E, x, z) ? E : null;
    const feld = (y) => {
        const d = terrainDensityAtCol(x, y, z, colCtx);
        return K ? G.erdbauHohl(K, x, y, z, d) : d;
    };
    const macroSurf = colCtx.surf;
    const skipAbove = Number.isFinite(macroSurf)
        ? Math.max(macroSurf + 12 + 4 * cfg.step, editsFillTop() + 2)
        : Infinity;
    let prevAir = true;
    let prevD = null;
    for (let y = top; y >= bottom; y -= 1.2) {
        if (y > skipAbove) continue;
        const d = feld(y);
        const solid = d > 0;
        if (solid && prevAir) {
            const dLuft = prevD != null ? prevD : feld(y + 1.2);
            const t = d - dLuft > 1e-9 ? d / (d - dLuft) : 0;
            return y + 1.2 * Math.min(1, Math.max(0, t));
        }
        prevAir = !solid;
        prevD = d;
    }
    return null;
}

function voxelGitterY(x, z) {
    return voxelSurfaceY(x, z, true);
}

// Wie `_voxelEditsFillTop`: die Krone der Füll-Edits (`G.editKrone`), gemerkt je Edit-Liste und Länge.
let fillTopMerk = null;
function editsFillTop() {
    const edits = state.voxelEdits;
    const len = edits ? edits.length : 0;
    if (fillTopMerk && fillTopMerk.edits === edits && fillTopMerk.len === len) return fillTopMerk.top;
    const topY = G.editKrone(edits);
    fillTopMerk = { edits, len, top: topY };
    return topY;
}

// Mirror von `_forestFbm` (der Wald-Rausch am Same + ":forest").
let waldRausch = null;
function forestFbm(px, pz) {
    const seed = state.seed || "anazh-realm-seed";
    if (!waldRausch || waldRausch.seed !== seed) waldRausch = { seed, n: new SimplexNoise(seed + ":forest") };
    const n = waldRausch.n;
    const a = (n.noise2D(px, pz) + 1) * 0.5;
    const b = (n.noise2D(px * 2.7 + 11.3, pz * 2.7 - 5.9) + 1) * 0.5;
    return a * 0.65 + b * 0.35;
}

// Mirror von `_ortFrei`: trägt der Grund an (x, z) eine Krone vom Radius T, ohne einen Erdbau zu berühren?
function ortFrei(x, z, T) {
    const E = state.erdbau;
    if (!E) return true;
    const Zm = G.ERDBAU.zelleM;
    const liste = E.zellen.get((Math.floor(x / Zm) + 32768) * 65536 + (Math.floor(z / Zm) + 32768));
    if (!liste) return true;
    for (const i of liste) {
        const p = E.splats[i];
        if (p.frei) continue;
        let d;
        if (p.platte) {
            const dx = x - p.cx;
            const dz = z - p.cz;
            const u = Math.max(0, Math.abs(dx * p.c - dz * p.s) - p.ex);
            const v = Math.max(0, Math.abs(dx * p.s + dz * p.c) - p.ez);
            d = Math.hypot(u, v);
        } else {
            let q = p.len2 > 0 ? ((x - p.x0) * p.dx + (z - p.z0) * p.dz) / p.len2 : 0;
            q = q < 0 ? 0 : q > 1 ? 1 : q;
            d = Math.max(0, Math.hypot(x - (p.x0 + p.dx * q), z - (p.z0 + p.dz * q)) - p.hw);
        }
        if (d < T) return false;
    }
    return true;
}

// Der ctx des Wald-Plans — Mirror des ctx in `_forestCellDarts` (der Boden reist vom Oberflächen- zum Wasser-Leser).
function waldCtx(msg) {
    let bodenX = NaN;
    let bodenZ = NaN;
    let bodenY = null;
    return {
        F: fernK().forest, // das Wald-Gesetz des Stands (FOREST), nie je Auftrag
        baseH: state.baseHeight || 0,
        extras: msg.extras,
        fbm: forestFbm,
        surfaceYAt: (x, z) => {
            bodenX = x;
            bodenZ = z;
            bodenY = voxelSurfaceY(x, z);
            return bodenY;
        },
        waterYAt: (x, z) => atlasWaterLevelAt(x, z, x === bodenX && z === bodenZ ? bodenY : voxelSurfaceY(x, z)),
        slopeAt: bodenSteilheit,
        feuchteAt: (x, z, sy) => feuchteAt(x, z, sy),
        ortFrei: (x, z, T) => ortFrei(x, z, T),
    };
}
// Mirror von `_slopeAt` am Sampler `getTerrainHeightAt` ±2 m (die Oberfläche, ohne sie die Basis): die Steilheit des Walds und
// der Streu-Felder (`streuRegion`).
function bodenHoehe(x, z) {
    const vy = voxelSurfaceY(x, z);
    return typeof vy === "number" && Number.isFinite(vy) ? vy : state.baseHeight || 0;
}
function bodenSteilheit(x, z) {
    const yE = bodenHoehe(x + 2, z);
    const yW = bodenHoehe(x - 2, z);
    const yN = bodenHoehe(x, z - 2);
    const yS = bodenHoehe(x, z + 2);
    if (!Number.isFinite(yE) || !Number.isFinite(yW) || !Number.isFinite(yN) || !Number.isFinite(yS)) return 0;
    return Math.hypot((yE - yW) / 4, (yS - yN) / 4);
}
// DIE LESER DER STREU (B-Streu): die Felder der Region (phyto-core `streuRegion`) an DIESEM Zustand — dieselben Leser wie der Bake
// des Haupt-Fadens (`_streuLeser`); die Byte-Wand Main = Faden fährt gate:scatter-slice (checkBandScatterScheibe).
const STREU_LESER = {
    surfaceYAt: voxelSurfaceY,
    slopeAt: bodenSteilheit,
    feuchteAt: (x, z, sy) => feuchteAt(x, z, sy),
    fieldAt: worldFieldAt,
};

function applyStateSnapshot(snap) {
    if (!snap) return;
    if (snap.seed && snap.seed !== state.seed) {
        state.seed = snap.seed;
        state.noise = G.lageRausch(state.seed, SimplexNoise);
    }
    if (typeof snap.baseHeight === "number") state.baseHeight = snap.baseHeight;
    if (typeof snap.waterLevel === "number") state.waterLevel = snap.waterLevel;
    // eine neue Welt räumt die Regionen (der Stand trägt keine: jeder Faden rechnet sie, ein Neben-Faden bekommt sie vom Voxel-Faden);
    // ein Delta ohne Welt (`applyStateDelta`) räumt nichts
    if (snap.hydroWelt !== undefined && snap.hydroWelt !== state.hydroWelt) {
        state.hydroWelt = snap.hydroWelt;
        state.hydrosphere = null;
        state.hydroTiles = null;
    }
    if (snap.hydroBand !== undefined) state.hydroBand = snap.hydroBand;
    if (snap.voxelEdits !== undefined) state.voxelEdits = snap.voxelEdits;
    // DER STAU DER WERKE (gelaende.K2 (b)): ein Faden, der nach dem Stau geboren wurde, bekommt die Felder im Stand; danach
    // rechnet er sie selbst (`stauRechnen`) — der Spiegel des Kerns liest sie (`L.stau`)
    if (snap.stau !== undefined) state.stau = snap.stau;
    if (snap.hydroGesetz) state.hydroGesetz = snap.hydroGesetz;
    // V18.181-merge-Λ Sub 3h — Γ1-Lesart-4 (V18.178): genVersion-Schleuse mit-laden.
    if (typeof snap.genVersion === "number") state.genVersion = snap.genVersion;
    // Die Boden-Palette des Mains (Studio PORTAL_GROUND nach dem Farb-Gesetz, linear) — dieselben Zahlen.
    if (snap.bodenPalette) state.bodenPalette = snap.bodenPalette;
    // Der Versatz der Schneegrenze (stoffe.K3-2), den der Main trägt (`_schneeGilt`) — dieselbe Zahl.
    if (typeof snap.schneeVersatz === "number") state.schneeVersatz = snap.schneeVersatz;
    // Der Pegel der Binnen-Gewässer (stoffe.K3-2), den der Main trägt (`_pegelGilt`) — dieselbe Tafel (null: nichts steigt).
    if (snap.pegel !== undefined) state.pegel = snap.pegel;
    // Der Wiesen-Grund des Mains (K53, `WIESEN_GRUND`: Farbe, Wache, Fleck) — dieselben Zahlen.
    if (snap.wiesenGrund) state.wiesenGrund = snap.wiesenGrund;
    if (typeof snap.regionSize === "number") state.regionSize = snap.regionSize;
    if (snap.erbgut !== undefined) state.erbgut = snap.erbgut;
    // DER ERDBAU DER ORTE (K10): die Splat-Liste des Mains (`_erdbauRoh`), hier in die Normalform des Gesetzbuchs gelegt
    if (snap.erdbau !== undefined) state.erdbau = G.erdbauNormal((state.erdbauRoh = snap.erdbau));
    if (snap.felsStoff) state.felsStoff = snap.felsStoff;
    // DIE KONSTANTEN DER FERNE (B2): FOREST, die Selbstbeschattung der Krone, Schutt-Gewicht, Fels-Mittel, Gedächtnis
    if (snap.fern) state.fern = snap.fern;
    // DIE PLATTE DES BODENS (Karte hydro-faden): ob sie gilt, ihr Stempel und ihr Deckel
    if (snap.platte) state.platte = snap.platte;
}

function applyStateDelta(delta) {
    if (!delta) return;
    // Delta-Update: nur explizit gesetzte Felder werden ersetzt. voxelEdits wird
    // entweder vollständig ersetzt (full sync) oder wächst um einen Edit (append) — ohne Deckel, wie im Main.
    if (delta.voxelEditAppend) {
        if (!Array.isArray(state.voxelEdits)) state.voxelEdits = [];
        state.voxelEdits.push(delta.voxelEditAppend);
        return;
    }
    // DER ERDBAU ALS ÄNDERUNG (stadt-erwachen, `_erdbauWirkt`): die Splats eines neuen Orts hängen an, die Stellen gefallener
    // (in der Reihe vor dem Fall) fallen — dieselbe Liste wie `_erdbauRoh` im Main, ohne ihren Klon je Haus
    if (delta.erdbauDazu || delta.erdbauOhne) {
        const roh = state.erdbauRoh || [];
        const ohne = new Set(delta.erdbauOhne);
        state.erdbauRoh = delta.erdbauDazu ? roh.concat(delta.erdbauDazu) : roh.filter((_p, i) => !ohne.has(i));
        state.erdbau = G.erdbauNormal(state.erdbauRoh);
        return;
    }
    applyStateSnapshot(delta);
}

// DIE EDIT-KARTE (K23): das Gesetz des Kerns (`G.editKarte`) über der EINEN Liste `state.voxelEdits` — je Chunk die Edits,
// deren Reichweite ihn samt einem Chunk Rand berührt; Identität und Länge der Liste halten sie frisch.
let editKarte = null;
function editKarteFrisch() {
    const edits = Array.isArray(state.voxelEdits) ? state.voxelEdits : null;
    if (G.editKarteSteht(editKarte, edits)) return editKarte; // die stehende Karte: zwei Vergleiche (ek-schleife)
    return (editKarte = G.editKarte(editKarte, edits, voxelChunkConfig(0).span, null));
}
// die Edits, die den Chunk (cx, cz) samt einem Chunk Rand berühren können
function editsNah(cx, cz) {
    return G.editsNah(editKarteFrisch(), cx, cz);
}

// =============================================================================
// Die Dichte des Bodens: das Gesetz des Kerns (gelaende-core `dichteGitter`, `gitterMitEdits`, `dichteSpalte`,
// `dichteBasis`, `dichte`) am Zustand dieses Fadens — derselbe Rechner wie der Stamm (gate:worker-dichte, `--kern`).
// =============================================================================

// Das Gitter eines Chunks ((dimX+1)·(dimY+1)·(dimZ+1) Ecken): Band und Basis, darauf die Edits des Gitter-Kastens.
function computeDensityGrid(ox, oy, oz, dimX, dimY, dimZ, step) {
    const [Nx, Ny, Nz] = [dimX + 1, dimY + 1, dimZ + 1];
    const basis = G.dichteGitter(state, ox, oy, oz, Nx, Ny, Nz, step);
    const edits = G.editsImKasten(editKarteFrisch(), ox, ox + dimX * step, oz, oz + dimZ * step);
    return G.gitterMitEdits(state, basis, ox, oy, oz, Nx, Ny, Nz, step, edits);
}
// die Spalte (x, z) der Dichte (die Höhe, die Decke der Höhle, Kanal und See-Becken — einmal je Spalte)
function terrainColumnContext(x, z) {
    return G.dichteSpalte(state, x, z, {});
}
// die Dichte an (x, y, z) über der Spalte ctx, mit den Edits der Karte am Punkt — nie, solange der Faden eine Region der
// Hydrosphäre rechnet (`hydroComputing`): sie ist f(Saat, Gesetz), nie f(Edits). Bis speicher-zwei las ihr Fluss-Spiegel
// (`hydroSampleRiverSurfaces`, `hydroRiverSpiegel`) den Boden samt Gruben — eine Grube am Bach der Mess-Wiese senkte den
// Spiegel stromab um 9 cm, aber erst beim nächsten Boot: die Wiederkehr zeichnete Fluss, Ufer und Boden anders (speicher.K4).
function terrainDensityAtCol(x, y, z, ctx) {
    const edits =
        !state.hydroComputing && state.voxelEdits && state.voxelEdits.length
            ? G.editsAm(editKarteFrisch(), x, z)
            : undefined;
    return G.mitEdits(G.dichteBasis(x, y, z, ctx), x, y, z, edits);
}
// die EINE Punkt-API: die Dichte an (x, y, z) samt Edits
function terrainDensityAt(x, y, z) {
    return terrainDensityAtCol(x, y, z, terrainColumnContext(x, z));
}

// DER STAU IM FADEN (gelaende.K2 (b), Lehre 14): die Felder der Werke (gelaende-core `stauFelder`) an DIESEM Zustand — der
// Auftrag des Mains (`_stauFelder`: die Werke, die Regel `CA_STAU`) reist über den EINEN Sender an jeden Faden, jeder rechnet ihn
// an derselben Stelle seiner Reihe (das Gedächtnis `stauMerk` je Faden). Der Boden ist der des Feldes (`voxelSurfaceY`, sonst
// die Höhe), wie im Stamm; während der Rechnung liest die Lage das Gesetz ohne Stau. Ohne Hydrosphäre hält kein Werk Wasser.
let stauMerk = null;
function stauRechnen(msg) {
    const h = state.hydrosphere;
    if (!(h && h.ready)) return null;
    const alt = state.stau;
    state.stau = null;
    let r;
    try {
        const boden = (x, z) => voxelSurfaceY(x, z) ?? G.hoehe(state, x, z, true);
        const kacheln = state.hydroTiles ? state.hydroTiles.size : 0;
        r = G.stauFelder(
            state,
            msg.werke,
            msg.gesetz,
            voxelChunkConfig(0).step,
            boden,
            stauMerk,
            state.voxelEdits || [],
            kacheln
        );
    } finally {
        state.stau = alt;
    }
    stauMerk = r.merk;
    state.stau = r.felder;
    return r;
}

// DIE REGION ENTSTEHT IM FADEN (Karte hydro-faden): das Gesetz `hydrosphaere` des Gelände-Kerns an DIESEM Zustand, die
// Fläche ungecarvt (`hydroComputing` hält den Kanal aus, wie der Stamm es bis dahin im Haupt-Faden tat); danach das
// globale Band über alle Regionen (gelaende-core `hydroBand`, derselbe Rechner wie `_computeHydroBand` im Stamm).
function hydroRegion(key, origin) {
    if (!state.hydroGesetz)
        throw new Error("voxel-worker: die Hydrosphäre ohne ihr Gesetz (hydroGesetz fehlt im Zustand)");
    state.hydroComputing = true;
    let h;
    try {
        h = G.hydrosphaere(state, state.hydroGesetz, voxelGitterY, origin);
    } finally {
        state.hydroComputing = false;
    }
    hydroSetzen(key, h);
    return h;
}
function hydroSetzen(key, h) {
    if (key === "heim") state.hydrosphere = h;
    else (state.hydroTiles || (state.hydroTiles = new Map())).set(key, h);
    const regionen = [state.hydrosphere].concat(state.hydroTiles ? [...state.hydroTiles.values()] : []);
    state.hydroBand = G.hydroBand(typeof state.waterLevel === "number" ? state.waterLevel : 0, regionen);
}

// Die Antwort an einen Faden (Lehre 24): jedes Feld der Region reist per Transfer — der Faden behält seine eigenen und kopiert
// sie hier (die Kopie liegt im Faden, nie im Haupt-Faden): die Felder, der Kanal und für den Main (`daten`) Flüsse und Seen
// als Bytes ihres JSON (im Spiel liest sie niemand, erst ein Leser entpackt sie, `hydro-result` im Main); die Fälle (wenige je
// Kachel, der Klang liest sie) und die Zahlen reisen als Daten.
function hydroAntwort(h, daten) {
    const { rivers, lakes, kanal: k, ...rest } = h;
    const kanal = { seg: k.seg.slice(), ab: k.ab.slice(), idx: k.idx.slice() };
    const felder = {
        lakeBedCell: h.lakeBedCell.slice(),
        lakeW: h.lakeW.slice(),
        lakeNear: h.lakeNear.slice(),
        water: { waterY: h.water.waterY.slice(), waterKind: h.water.waterKind.slice() },
    };
    const region = Object.assign(rest, felder, { kanal, fluesse: rivers.length, seen: lakes.length });
    if (daten) region.daten = new self.TextEncoder().encode(JSON.stringify({ rivers, lakes }));
    const transfer = [kanal.seg, kanal.ab, kanal.idx, felder.lakeBedCell, felder.lakeW, felder.lakeNear]
        .concat(felder.water.waterY, felder.water.waterKind, daten ? region.daten : [])
        .map((a) => a.buffer);
    return { region, transfer };
}

// DIE REGIONEN VOM VOXEL-FADEN (ein Neben-Faden, geboren nach ihrer Bestellung): jede Nachricht hinter seinem Stand wartet, bis
// der Port sie gebracht hat (`hydro-an`) — derselbe Zustand wie in jedem Faden, der sie selbst rechnete.
let warten = null;
function hydroVom(port) {
    warten = [];
    port.onmessage = (e) => {
        if (!e.data.fertig) return void hydroSetzen(e.data.key, e.data.region);
        port.close();
        const liste = warten;
        warten = null;
        for (const m of liste) self.onmessage(m);
    };
}

// Die Region (Heimat oder Kachel), der Fluss-Kanal und das See-Becken an (x, z): das Gesetz des Kerns (`G.hydroRegion`,
// `G.flussKanal`, `G.seeBecken`) am Zustand dieses Fadens.
function hydroFor(x, z) {
    return G.hydroRegion(state, x, z);
}
function hydrosphereCarveAt(x, z) {
    return G.flussKanal(state, x, z);
}
function hydrosphereLakeAt(x, z) {
    return G.seeBecken(state, x, z);
}

// DAS SPIEGEL-FELD (D10, der See spiegelt die Welt): je Zelle (Kante `texel` m) des Rechtecks [i0, i0 + w) × [j0, j0 + h)
// die Flächen, die ein gespiegelter Strahl trifft — der GEBAUTE Boden (die Nullstelle der Spalten-Dichte samt
// Fluss-Kanal, See-Becken und Edits, `terrainDensityAtCol`: die 2D-Höhe trägt den Seegrund nicht), darüber das Wasser des
// Orts (`waterLevelAt`) und die Kronen der stehenden Bäume (je Laub-Teil ihrer GEZEICHNETEN Krone das Ellipsoid seiner Zelle,
// der Beipack `__krone` des Foundry-Workers über das Kronen-Buch des Wirts). Rückgabe: `hoehen` RGBA-Halbfloat über `bezug` (die
// untere Fläche, Basis und Dach der Kronen-Schicht, ihre Gestalt + 1), `stoff` RGBA8 (die Albedo der unteren Fläche linear als
// Wurzel — die EINE Boden-Farbe `attachFieldColors` = `_bodenFarbeAt`, das Laub der Gestalt, der Wasser-Körper R∞ —, A die Art:
// 0 Boden, 1 Wasser, 2 Laub) und je Block die Höchste.
const spiegelGestalten = [];
// der GEBAUTE Boden an (x, z): die Nullstelle der Spalten-Dichte, zwei Newton-Schritte von der Gesetz-Höhe aus
function spiegelBoden(x, z) {
    const ctx = terrainColumnContext(x, z);
    let y = ctx.surf;
    for (let k = 0; k < 2; k++) {
        const d = terrainDensityAtCol(x, y, z, ctx);
        if (Math.abs(d) < 40) y += d;
    }
    return y;
}
function spiegelFeldBacken(msg) {
    const { i0, j0, w, h, texel, bezug } = msg;
    // DER SAUM: eine Zelle rund um das Rechteck. Die Höchste eines Blocks (`hoechste`) muss jeden Wert decken, den der Pass
    // in ihm filtert, und der LinearFilter greift bis eine Zelle über den Block-Rand.
    const W2 = w + 2,
        H2 = h + 2,
        N2 = W2 * H2;
    const unten = new Float32Array(N2); // die untere Fläche: Boden, Wasser oder die Säule eines Buschs
    const basis = new Float32Array(N2); // die Schicht der Krone: Basis und Dach (keine Krone: beide = unten)
    const dach = new Float32Array(N2);
    const krone = new Uint16Array(N2); // Gestalt der Krone + 1 (0: keine)
    const art = new Uint8Array(N2); // die untere Fläche: 0 Boden, 1 Wasser, 2 Laub
    const F = new Float32Array(N2 * 3);
    const pos = new Float32Array(W2 * 3);
    for (let j = -1; j <= h; j++) {
        const z = (j0 + j + 0.5) * texel;
        for (let i = -1; i <= w; i++) {
            const x = (i0 + i + 0.5) * texel;
            const y = spiegelBoden(x, z);
            const p = (j + 1) * W2 + i + 1;
            const wl = waterLevelAt(x, z);
            // das Wasser 0,6 m unter seinem Spiegel: der Strahl, der von ihm aufsteigt, trifft es nie, eine höhere Stufe
            // (der Fluss über der Mündung) hält ihn
            if (wl > y + 0.05) {
                art[p] = 1;
                unten[p] = wl - 0.6;
            } else unten[p] = y;
            pos[(i + 1) * 3] = x;
            pos[(i + 1) * 3 + 1] = y;
            pos[(i + 1) * 3 + 2] = z;
        }
        F.set(attachFieldColors(pos), (j + 1) * W2 * 3);
    }
    // die Gestalten reisen einmal (Index → { teile [cx, cy, cz, rXZ, rY] je Laub-Teil, farbe }), die Bäume je Auftrag:
    // [x, y, z, Skala, cos θ, sin θ, Gestalt] (θ die Drehung um y; y NaN: der Fuß der Streu ist der gebaute Boden).
    // DIE KRONE IST EINE SCHICHT: je Zelle die Spanne jedes Laub-Teils (Unter- bis Oberkante seines Ellipsoids); reicht sie
    // bis an die untere Fläche (der Busch, die Fichte), wächst die Säule, sonst die Schicht der Krone — darunter läuft der
    // Strahl hindurch zum Ufer-Busch und zum Boden unter dem Schirm.
    for (const g of msg.gestalten || []) spiegelGestalten[g.i] = g;
    const B = msg.baeume;
    const x0 = (i0 - 1) * texel,
        z0 = (j0 - 1) * texel;
    const laubFarbe = new Map();
    // der Saum der Krone: eine Zelle zählt zur Krone, wenn das Laub-Teil sie berührt, nicht erst, wenn es ihre Mitte deckt
    // (das Raster der Mitten ließ zwischen den Laub-Ballen Löcher, durch die der Spiegel den Himmel las)
    const saum = msg.kronenSaum;
    if (!Number.isFinite(saum)) throw new Error("spiegelFeldBacken: kronenSaum fehlt im Auftrag");
    for (let t = 0; B && t + 6 < B.length; t += 7) {
        const gi = B[t + 6];
        const g = spiegelGestalten[gi];
        if (!g) continue;
        const s = B[t + 3],
            c = B[t + 4],
            sn = B[t + 5];
        const T = g.teile;
        const fuss = Number.isFinite(B[t + 1]) ? B[t + 1] : spiegelBoden(B[t], B[t + 2]);
        for (let k = 0; k + 4 < T.length; k += 5) {
            const lx = T[k] * s,
                lz = T[k + 2] * s;
            const cx = B[t] + lx * c + lz * sn,
                cz = B[t + 2] - lx * sn + lz * c,
                cy = fuss + T[k + 1] * s;
            const r = T[k + 3] * s + saum,
                ry = T[k + 4] * s;
            const ia = Math.max(0, Math.floor((cx - r - x0) / texel)),
                ib = Math.min(W2 - 1, Math.floor((cx + r - x0) / texel));
            const ja = Math.max(0, Math.floor((cz - r - z0) / texel)),
                jb = Math.min(H2 - 1, Math.floor((cz + r - z0) / texel));
            for (let jj = ja; jj <= jb; jj++)
                for (let ii = ia; ii <= ib; ii++) {
                    const dx = x0 + (ii + 0.5) * texel - cx,
                        dz = z0 + (jj + 0.5) * texel - cz;
                    const q = (dx * dx + dz * dz) / (r * r);
                    if (q >= 1) continue;
                    const halb = ry * Math.sqrt(1 - q);
                    const o = cy + halb,
                        u = cy - halb;
                    const p = jj * W2 + ii;
                    if (o <= unten[p]) continue;
                    if (u <= unten[p] + 1) {
                        unten[p] = o;
                        art[p] = 2;
                        laubFarbe.set(p, g.farbe);
                    } else if (!krone[p]) {
                        krone[p] = gi + 1;
                        basis[p] = u;
                        dach[p] = o;
                    } else {
                        if (o > dach[p]) {
                            dach[p] = o;
                            krone[p] = gi + 1;
                        }
                        if (u < basis[p]) basis[p] = u;
                    }
                }
        }
    }
    const kroneFarbe = (p) => (spiegelGestalten[krone[p] - 1] || { farbe: [0.035, 0.07, 0.022] }).farbe;
    // eine Schicht, die bis an die untere Fläche reicht, ist die Säule
    for (let p = 0; p < N2; p++) {
        if (krone[p] && basis[p] <= unten[p] + 1) {
            if (dach[p] > unten[p]) {
                unten[p] = dach[p];
                art[p] = 2;
                laubFarbe.set(p, kroneFarbe(p));
            }
            krone[p] = 0;
        }
        if (!krone[p]) basis[p] = dach[p] = unten[p];
    }
    const hoehen = new Uint16Array(w * h * 4);
    const stoff = new Uint8Array(w * h * 4);
    const wk = msg.wasserFarbe;
    // die Albedo als Wurzel in 8 Bit (das dunkle Laub 0,03 trägt so 4 % statt 13 % Stufe)
    const wurzel = (v) => Math.max(0, Math.min(255, Math.round(Math.sqrt(Math.max(v, 0)) * 255)));
    for (let j = 0; j < h; j++)
        for (let i = 0; i < w; i++) {
            const p = (j + 1) * W2 + i + 1,
                o = (j * w + i) * 4;
            hoehen[o] = zuHalb(unten[p] - bezug);
            hoehen[o + 1] = zuHalb(basis[p] - bezug);
            hoehen[o + 2] = zuHalb(dach[p] - bezug);
            hoehen[o + 3] = zuHalb(krone[p]);
            const f = art[p] === 1 ? wk : art[p] === 2 ? laubFarbe.get(p) : [F[p * 3], F[p * 3 + 1], F[p * 3 + 2]];
            stoff[o] = wurzel(f[0]);
            stoff[o + 1] = wurzel(f[1]);
            stoff[o + 2] = wurzel(f[2]);
            stoff[o + 3] = art[p];
        }
    // DIE HÖCHSTE je Block (`block` × `block` Zellen samt Saum, über dem Bezug): steht der gespiegelte Strahl über ihr, trifft
    // er im Block nichts (er steigt) und springt an dessen Rand — der Busch von 2 m fällt nie mehr durch einen Schritt von 3 m.
    const b = msg.block,
        bw = w / b,
        bh = h / b;
    const hoechste = new Float32Array(bw * bh);
    for (let bj = 0; bj < bh; bj++)
        for (let bi = 0; bi < bw; bi++) {
            let m = -30000;
            for (let jj = bj * b; jj <= bj * b + b + 1; jj++)
                for (let ii = bi * b; ii <= bi * b + b + 1; ii++) {
                    const p = jj * W2 + ii;
                    const v = Math.max(unten[p], dach[p]);
                    if (v > m) m = v;
                }
            hoechste[bj * bw + bi] = m - bezug;
        }
    return { hoehen, stoff, hoechste };
}

// float32 → IEEE-Halbfloat (gerundet; über 65504 unendlich, unter 2^−24 null) — die Bits, die ein HalfFloat-Ziel trägt
const _halbF = new Float32Array(1),
    _halbU = new Uint32Array(_halbF.buffer);
function zuHalb(v) {
    _halbF[0] = v;
    const x = _halbU[0];
    const sign = (x >>> 16) & 0x8000;
    const e = ((x >>> 23) & 0xff) - 112;
    let m = x & 0x7fffff;
    if (e >= 31) return sign | 0x7c00;
    if (e <= 0) {
        if (e < -10) return sign;
        m = (m | 0x800000) >>> (1 - e);
        return sign | ((m + 0x1000) >>> 13);
    }
    return sign | ((e << 10) + ((m + 0x1000) >>> 13));
}

// =============================================================================
// V9.91 (Welle Perf-3.c Phase 3 — voller Chunk-Mesh im Worker)
// Mirror der Meshing-Pipeline aus dem Stamm:
//   _voxelChunkConfig, _voxelExtractSurfaceVertices, _voxelEmitQuadIndices,
//   _voxelLaplacianSmoothPositions, _voxelCropPad, _voxelGradientNormals,
//   _buildVoxelChunkWaterCells (OHNE Architektur-Stempel — Main-only),
//   _attachVoxelFieldColors (worldFieldAt + waterLevelAt), plus die
//   Hilfsfunktionen _waterLevelAt + _hydroRiverAt.
// Bei JEDER Anpassung dort: hier mit-wandern. Determinismus-Test fängt Drift.
// =============================================================================

const CELL_STATE = { AIR: 0, WATER: 1, SOLID: 2 };

function voxelChunkConfig(lod) {
    // T8 (mirror) — DAS WEITE BAND: floorDrop 90→135, dimY 200→232 (Decke base+282.6, Tiefsee-Abgrund
    // gefasst). Vertikal-Span 232·1.8 = 116·3.6 = 58·7.2 = 29·14.4 = 417.6 m (LOD-invariant). Der Band-Skip
    // in computeDensityGrid hält die Kosten. MUSS bit-identisch zum Main-`_voxelChunkConfig` bleiben
    // (Determinismus-Wand: Worker-Mesh/Cells == Main).
    if ((lod | 0) >= 3) return { dim: 3, step: 14.4, span: 43.2, dimY: 29, floorDrop: 135, lod: 3 };
    if ((lod | 0) >= 2) return { dim: 6, step: 7.2, span: 43.2, dimY: 58, floorDrop: 135, lod: 2 };
    if ((lod | 0) >= 1) return { dim: 12, step: 3.6, span: 43.2, dimY: 116, floorDrop: 135, lod: 1 };
    return { dim: 24, step: 1.8, span: 43.2, dimY: 232, floorDrop: 135, lod: 0 };
}

// Lazy-Init der 5 worldField-Noises (separate Seeds für unkorrelierte Kanäle).
// Gleiche Konstruktion wie `worldFieldAt` im Stamm — Determinismus
// ist seed-abhängig, alle 5 leben vom worldMeta.seed.
let worldField = null;
function ensureWorldField() {
    if (worldField && worldField.seed === state.seed) return worldField;
    if (!state.seed) return null;
    worldField = {
        seed: state.seed,
        lebendigNoise: new SimplexNoise(state.seed + "-veg-lebendig"),
        dichteNoise: new SimplexNoise(state.seed + "-veg-dichte"),
        glutNoise: new SimplexNoise(state.seed + "-veg-glut"),
        magieNoise: new SimplexNoise(state.seed + "-veg-magie"),
        rngNoise: new SimplexNoise(state.seed + "-veg-rng"),
        // V18.204 — Γ3 Domain-Warp Worker-Mirror.
        warpNoise: new SimplexNoise(state.seed + "-veg-warp"),
    };
    return worldField;
}

// V18.203 — Γ3 FREQUENZ-FÄCHER Worker-Mirror (V17.100-Lehre: Konstanten hier
// hardkodiert, bit-Vertrag mit Main AnazhRealm.FIELD_CHARACTER; bei
// Änderung beide mit-ziehen). Aktiv nur bei genVersion >= 3 — Legacy bleibt
// bit-identisch.
const FC_LAMBDA_LEBENDIG = 200;
const FC_LAMBDA_DICHTE = 340;
const FC_LAMBDA_GLUT = 520;
const FC_LAMBDA_MAGIE = 160;
// V18.204 — Γ3 Domain-Warp Worker-Mirror Konstanten.
const FC_WARP_AMP = 40;
const FC_WARP_SCALE = 1 / 600;
function worldFieldAt(x, z) {
    const f = ensureWorldField();
    if (!f) return { lebendig: 0, dichte: 0, glut: 0, magieleitung: 0 };
    const n01 = (v) => Math.max(0, Math.min(1, (v + 1) / 2));
    if (state.genVersion >= 3) {
        const sL = 1 / FC_LAMBDA_LEBENDIG;
        const sD = 1 / FC_LAMBDA_DICHTE;
        const sG = 1 / FC_LAMBDA_GLUT;
        const sM = 1 / FC_LAMBDA_MAGIE;
        // V18.204 — Γ3 DOMAIN-WARP Worker-Mirror, bit-identisch zum Main.
        const wpX = f.warpNoise.noise2D(x * FC_WARP_SCALE, z * FC_WARP_SCALE) * FC_WARP_AMP;
        const wpZ = f.warpNoise.noise2D(x * FC_WARP_SCALE + 51.7, z * FC_WARP_SCALE - 23.1) * FC_WARP_AMP;
        const wx = x + wpX;
        const wz = z + wpZ;
        return {
            lebendig: n01(f.lebendigNoise.noise2D(wx * sL, wz * sL)),
            dichte: n01(f.dichteNoise.noise2D(wx * sD + 100, wz * sD - 200)),
            glut: n01(f.glutNoise.noise2D(wx * sG + 500, wz * sG + 700)),
            magieleitung: n01(f.magieNoise.noise2D(wx * sM - 333, wz * sM + 999)),
        };
    }
    const s = 0.005;
    return {
        lebendig: n01(f.lebendigNoise.noise2D(x * s, z * s)),
        dichte: n01(f.dichteNoise.noise2D(x * s + 100, z * s - 200)),
        glut: n01(f.glutNoise.noise2D(x * s + 500, z * s + 700)),
        magieleitung: n01(f.magieNoise.noise2D(x * s - 333, z * s + 999)),
    };
}

// Der Fluss an (x, z), der Spiegel quer, der nächste Fluss-Rand, der Bezug der Ufer-Bänder und der Spiegel des Wassers: das
// Gesetz des Kerns (`G.flussAm`, `G.spiegelQuer`, `G.flussRand`, `G.wasserSpiegel`, `G.atlasSpiegel`) am Zustand dieses Fadens.
function hydroSpiegelQuer(x, z) {
    return G.spiegelQuer(state, x, z);
}
function hydroRiverAt(x, z) {
    return G.flussAm(state, x, z);
}
function hydroDistAt(x, z) {
    return G.flussRand(state, x, z);
}
function waterLevelAt(x, z, aus) {
    return G.wasserSpiegel(state, x, z, aus);
}
function atlasWaterLevelAt(x, z, terrainTopY, aus) {
    return G.atlasSpiegel(state, x, z, terrainTopY, aus);
}

// der Fluss-Spiegel quer über einer Spalte, die ein Schnitt berührt (F3, `G.schnittSpiegel`)
function schnittSpiegel(x, z, step) {
    return G.schnittSpiegel(state, editKarteFrisch(), x, z, step);
}

// V18.181-merge-Λ Sub 3h — Γ1-Lesart-4 (V18.178, clever-gauss): DAS FEUCHTE-
// FELD im Worker. Bit-identischer Spiegel von Main `_hydroDistAt` +
// `_feuchteAt`. Der V18.166-Γ1-Kern ließ den Worker die Feuchte NICHT kennen,
// weil sie nur in Spawn/Streu/Boden-LESERN auf der Main-Seite lebte. Die
// VISUELLE Lesart-4 läuft jetzt auch im Worker (er baut die Chunk-Field-Colors,
// V9.91-Phase-3 — der Mesh-Color-Pfad gehört dem Worker). Ohne diese zwei
// Funktionen würde der `mix(dampEarth, …)` des Mains gegen die Worker-Naht
// ab Frame 1 driften (Determinismus-Wand rot).
//
// HARDKODIERTE KONSTANTEN (V17.100-Lehre): jede Runtime-Tunable im Mirror
// würde den bit-Vertrag brechen. Bei einer AnazhRealm.FEUCHTE-Änderung im
// Main hier mit-ziehen.
const FEUCHTE_FLUSS_REICHWEITE = 26;
const FEUCHTE_HOEHE_NAH = 1.5;
const FEUCHTE_HOEHE_FERN = 7;
const FEUCHTE_HOEHE_GEWICHT = 0.85; // V6 (Look-Finale, 3): 0.6→0.85 — bit-identischer Spiegel von AnazhRealm.FEUCHTE.hoeheGewicht (das FEUCHTE-DACH gehoben)

// `fussM` (optional, die Ferne): die Kante der Fläche, für die der Punkt steht — jedes Fluss-Band trägt sein Mittel über sie
// (`flussAbdruck`, Mirror `_feuchteAt`).
function feuchteAt(x, z, surfY, fussM) {
    if (state.genVersion < 2) return 0;
    const ab = fussM > 0 ? flussAbdruck(x, z, fussM) : null;
    let fluss = 0;
    if (ab) {
        for (let i = 0; i < ab.n; i++) {
            const m = kastenMittel(stammFeuchte, ab.dist[i], fussM, Math.max(1, ab.hw[i]), FEUCHTE_FLUSS_REICHWEITE);
            if (m > fluss) fluss = m;
        }
    } else {
        const r = hydroDistAt(x, z);
        if (Number.isFinite(r.dist)) {
            const inner = Math.max(1, r.halfW);
            const outer = inner + FEUCHTE_FLUSS_REICHWEITE;
            const t = Math.max(0, Math.min(1, (outer - r.dist) / (outer - inner)));
            fluss = t * t * (3 - 2 * t);
        }
    }
    let hoehe = 0;
    if (Number.isFinite(surfY)) {
        const uf = { see: 0, fluss: null, ufer: 0 };
        waterLevelAt(x, z, uf);
        const band = (above) => {
            const t = Math.max(0, Math.min(1, (FEUCHTE_HOEHE_FERN - above) / (FEUCHTE_HOEHE_FERN - FEUCHTE_HOEHE_NAH)));
            return t * t * (3 - 2 * t) * FEUCHTE_HOEHE_GEWICHT;
        };
        hoehe = band(surfY - uf.see);
        if (ab) for (let i = 0; i < ab.n; i++) hoehe = Math.max(hoehe, ab.mu[i] * band(surfY - ab.sp[i]));
        else if (uf.fluss !== null) hoehe = Math.max(hoehe, uf.ufer * band(surfY - uf.fluss));
    }
    return Math.max(0, Math.min(1, Math.max(fluss, hoehe)));
}

// V18.230 (Ω-OPSIS Säule II Ω-O6) — das PFAD-FELD, Worker-Spiegel (bit-identisch
// zum Main _pathFieldAt): die Fluss-Bänke als getrampelte Erde.
// `fussM` (optional, die Ferne): die Bank trägt ihr Mittel über die Fläche des Punkts (`flussAbdruck`), je Bezug (Mirror).
function pathFieldAt(x, z, surfY, fussM) {
    if (state.genVersion < 2) return 0;
    const bankW = 4.5;
    if (fussM > 0 && Number.isFinite(surfY)) {
        const ab = flussAbdruck(x, z, fussM);
        if (!ab.n) return 0;
        const niedrigF = (above) => (above < 0 || above > 5 ? 0 : 1);
        const ufF = { see: 0, fluss: null, ufer: 0 };
        waterLevelAt(x, z, ufF);
        const nSee = niedrigF(surfY - ufF.see);
        let p = 0;
        for (let i = 0; i < ab.n; i++) {
            const innerF = Math.max(1, ab.hw[i]);
            const mSee = nSee ? kastenMittel(stammPfad, ab.dist[i], fussM, innerF, bankW) * nSee : 0;
            const mFluss = niedrigF(surfY - ab.sp[i])
                ? kastenMittel(stammPfadUfer, ab.dist[i], fussM, innerF, bankW, ab.hw[i], ab.kappa[i])
                : 0;
            p = Math.max(p, mSee, mFluss);
        }
        return p;
    }
    const r = hydroDistAt(x, z);
    if (!Number.isFinite(r.dist)) return 0;
    const inner = Math.max(1, r.halfW);
    const d = r.dist - inner;
    if (d < 0 || d > bankW) return 0;
    const band = 1 - d / bankW;
    if (!Number.isFinite(surfY)) return band * band;
    const uf = { see: 0, fluss: null, ufer: 0 };
    waterLevelAt(x, z, uf);
    const niedrig = (above) => (above < 0 || above > 5 ? 0 : 1);
    let w = niedrig(surfY - uf.see);
    if (uf.fluss !== null) w = Math.max(w, uf.ufer * niedrig(surfY - uf.fluss));
    return band * band * w;
}

// B1 (V18.345) — Mirror von `_caColumnScan`: scannt eine Zell-Spalte top-down nach
// Flood-/Live-/Solid-Dach. `level` ist im Worker-Streaming-Pfad immer null (CA-frei =
// nur Flood + Solid) — der wantLive-Zweig läuft nie, bleibt aber 1:1 für die bit-Parität.
function caColumnScan(cells, level, colBase, dimSq, dimY) {
    const WATER = CELL_STATE.WATER;
    const SOLID = CELL_STATE.SOLID;
    const wantLive = !!level;
    let floodTopJ = -1,
        liveTopJ = -1,
        liveFrac = 0,
        solidTopJ = -1;
    for (let j = dimY - 1; j >= 0; j--) {
        const idx = colBase + j * dimSq;
        const c = cells[idx];
        if (floodTopJ < 0 && c === WATER) floodTopJ = j;
        if (solidTopJ < 0 && c === SOLID) solidTopJ = j;
        if (wantLive && liveTopJ < 0 && c !== SOLID && level[idx] > 0.5) {
            liveTopJ = j;
            liveFrac = level[idx];
        }
        if (floodTopJ >= 0 && solidTopJ >= 0 && (!wantLive || liveTopJ >= 0)) break;
    }
    return { floodTopJ, liveTopJ, liveFrac, solidTopJ };
}

// B1 (V18.345) — DER WASSER-SHEET-WORKER-MIRROR: bit-identischer Spiegel von Main
// `_computeWaterSheetData` (Stamm). Die EINE pure-typed-array-Mathematik des
// Zell-Oberkanten-Sheets — `ctx.getCells(ncx,ncz)` liest den gesendeten 3×3-Zell-Block,
// `ctx.getDach` ist im Streaming-Pfad immer undefined (dachlos → nur Flood). Liefert
// plain Arrays {positions, indices, aFlow, aWave, aDepth, aSlope} oder null. MUSS Zeile
// für Zeile mit dem Main wandern (diag-worker-watersheet, maxDiff 0). Substitutionen vs
// Main: this._voxelChunkConfig→voxelChunkConfig, this.state.terrainBaseHeight→state.baseHeight,
// this._caColumnScan→caColumnScan, this._atlasWaterLevelAt→atlasWaterLevelAt,
// this._hydroRiverAt→hydroRiverAt, this._hydrosphereLakeAt→hydrosphereLakeAt,
// AnazhRealm.CELL_STATE→CELL_STATE. Die Mathe ist character-identisch.
function buildWaterSheetGeometry(cx, cz, ctx) {
    const cfg0 = voxelChunkConfig(0);
    const dim = cfg0.dim,
        dimY = cfg0.dimY,
        step = cfg0.step,
        span = cfg0.span;
    const ox = cx * span;
    const oz = cz * span;
    const oy = (state.baseHeight || 0) - cfg0.floorDrop;
    const dimSq = dim * dim;
    const waterLevel = typeof state.waterLevel === "number" ? state.waterLevel : 0;
    const SMOOTH_PASSES = ctx.smoothPasses;
    const PAD = SMOOTH_PASSES + 1;
    const GW = dim + 2 * PAD;
    const topG = new Float64Array(GW * GW).fill(NaN);
    const solidG = new Float64Array(GW * GW);
    const depthG = new Float64Array(GW * GW);
    // RUHENDES Wasser je Spalte (Mirror): das Dach IST der Spiegel des Gesetzes — die Vertices tragen ihn an ihrem Ort.
    const ruhG = new Uint8Array(GW * GW);
    for (let ck = -PAD; ck < dim + PAD; ck++) {
        for (let ci = -PAD; ci < dim + PAD; ci++) {
            const gi = ci + PAD + (ck + PAD) * GW;
            let ncx = cx,
                ncz = cz,
                li = ci,
                lk = ck;
            if (li < 0) {
                ncx -= 1;
                li += dim;
            } else if (li >= dim) {
                ncx += 1;
                li -= dim;
            }
            if (lk < 0) {
                ncz -= 1;
                lk += dim;
            } else if (lk >= dim) {
                ncz += 1;
                lk -= dim;
            }
            let src = ctx.getCells(cx, cz);
            let srcCX = cx,
                srcCZ = cz;
            let dryFallback = false;
            if (ncx !== cx || ncz !== cz) {
                const nb = ctx.getCells(ncx, ncz);
                if (nb) {
                    src = nb;
                    srcCX = ncx;
                    srcCZ = ncz;
                } else {
                    li = Math.max(0, Math.min(dim - 1, ci));
                    lk = Math.max(0, Math.min(dim - 1, ck));
                    src = ctx.getCells(cx, cz);
                    srcCX = cx;
                    srcCZ = cz;
                    dryFallback = true;
                }
            }
            // Flood + Boden aus den Zellen, das Live-Dach aus dem gezeichneten Dach (Mirror; im Worker dachlos).
            const dach = ctx.getDach(srcCX, srcCZ);
            const sc = caColumnScan(src, null, li + lk * dim, dimSq, dimY);
            const live = dach ? dach[li + lk * dim] : -1;
            solidG[gi] = sc.solidTopJ >= 0 ? oy + sc.solidTopJ * step : oy;
            if (dryFallback) continue;
            if (sc.floodTopJ < 0) {
                if (dach && live >= 0) {
                    // V18.377 — depthG global als kontinuierliche Tiefe (tops − geglättetes Bett).
                    topG[gi] = oy + live * step;
                }
                continue;
            }
            // die geleerte Spalte ist trocken (Mirror K37; Doku im Main)
            if (dach && live < 0) continue;
            const faceY = oy + (sc.floodTopJ + 1) * step;
            const wx = ox + (ci + 0.5) * step;
            const wz = oz + (ck + 0.5) * step;
            // Mirror: das Ufer-Urteil liest die Unterkante der obersten festen Zelle, gefragt an Mitte und vier Ecken (Doku im Main)
            let L = atlasWaterLevelAt(wx, wz, solidG[gi]);
            for (let e = 0; e < 4; e++) {
                const le = atlasWaterLevelAt(ox + (ci + (e & 1)) * step, oz + (ck + (e >> 1)) * step, solidG[gi]);
                if (le > L) L = le;
            }
            if (L === -Infinity) L = schnittSpiegel(wx, wz, step); // die Flut des Schnitts (Mirror F3)
            // die Deck-Zelle (4b): bis zur Unterkante der Zelle unter dem Dach (Doku im Main)
            let top = L > -Infinity ? Math.max(faceY - 2 * step, Math.min(faceY + step, L)) : faceY;
            let ruht = L > -Infinity && top === L;
            if (dach) {
                const floodRel = (sc.floodTopJ + 1) * step;
                let d = live * step - floodRel; // live ≥ 0 (Doku im Main)
                if (d > -0.05 && d < 0.05) d = 0;
                if (d !== 0) ruht = false;
                top += Math.max(-14, Math.min(4, d));
            }
            topG[gi] = top;
            ruhG[gi] = ruht ? 1 : 0;
            // depthG (aDepth) wird GLOBAL als kontinuierliche Tiefe gesetzt (V18.377, s.u.).
        }
    }
    const SOLID_CS = CELL_STATE.SOLID;
    for (let ck = -PAD; ck < dim + PAD; ck++) {
        for (let ci = -PAD; ci < dim + PAD; ci++) {
            const gi = ci + PAD + (ck + PAD) * GW;
            if (!Number.isNaN(topG[gi])) continue;
            let nbTop = -Infinity;
            if (ci + 1 < dim + PAD) {
                const v = topG[gi + 1];
                if (!Number.isNaN(v) && v > nbTop) nbTop = v;
            }
            if (ci - 1 >= -PAD) {
                const v = topG[gi - 1];
                if (!Number.isNaN(v) && v > nbTop) nbTop = v;
            }
            if (ck + 1 < dim + PAD) {
                const v = topG[gi + GW];
                if (!Number.isNaN(v) && v > nbTop) nbTop = v;
            }
            if (ck - 1 >= -PAD) {
                const v = topG[gi - GW];
                if (!Number.isNaN(v) && v > nbTop) nbTop = v;
            }
            if (nbTop === -Infinity) continue;
            let ncx = cx,
                ncz = cz,
                li = ci,
                lk = ck;
            if (li < 0) {
                ncx -= 1;
                li += dim;
            } else if (li >= dim) {
                ncx += 1;
                li -= dim;
            }
            if (lk < 0) {
                ncz -= 1;
                lk += dim;
            } else if (lk >= dim) {
                ncz += 1;
                lk -= dim;
            }
            let src = ctx.getCells(cx, cz);
            if (ncx !== cx || ncz !== cz) {
                const nb = ctx.getCells(ncx, ncz);
                if (nb) src = nb;
                else {
                    li = Math.max(0, Math.min(dim - 1, ci));
                    lk = Math.max(0, Math.min(dim - 1, ck));
                    src = ctx.getCells(cx, cz);
                }
            }
            const colBase = li + lk * dim;
            const fromJ = Math.min(dimY - 1, Math.floor((nbTop - oy) / step) + 1);
            let gj = -1;
            for (let j = fromJ; j >= 0; j--) {
                if (src[colBase + j * dimSq] === SOLID_CS) {
                    gj = j;
                    break;
                }
            }
            solidG[gi] = gj >= 0 ? oy + gj * step : oy;
        }
    }
    // V18.475 — DAS HÖHEN-GATE DES DACH-BLURS (Mirror zu `_computeWaterSheetData`,
    // Herleitung dort): ein Nachbar zählt nur bei |top_nb − top_roh| ≤ K·step (K=2) —
    // der Blur mittelt keine Plateau- und Tal-Dächer mehr über die Klippe (Phantom-
    // Wasserfälle). ROH gegen ROH = pass-invariant + naht-symmetrisch. Byte-identisch.
    const BLUR_GATE = step * 2;
    const topRawG = Float64Array.from(topG);
    let cur = topG;
    let buf = new Float64Array(GW * GW);
    for (let pass = 0; pass < SMOOTH_PASSES; pass++) {
        buf.fill(NaN);
        for (let g = 0; g < GW * GW; g++) {
            if (Number.isNaN(cur[g])) continue;
            const gx = g % GW;
            const gz = (g / GW) | 0;
            let sum = 0;
            let n = 0;
            for (let dz2 = -1; dz2 <= 1; dz2++) {
                for (let dx2 = -1; dx2 <= 1; dx2++) {
                    const nx = gx + dx2;
                    const nz = gz + dz2;
                    if (nx < 0 || nz < 0 || nx >= GW || nz >= GW) continue;
                    const ng = nx + nz * GW;
                    const v = cur[ng];
                    if (!Number.isNaN(v)) {
                        // V18.475 — das Höhen-Gate (s.o.): nur Dächer derselben Etage.
                        if (Math.abs(topRawG[ng] - topRawG[g]) > BLUR_GATE) continue;
                        sum += v;
                        n++;
                    }
                }
            }
            buf[g] = sum / n;
        }
        const t = cur;
        cur = buf;
        buf = t;
    }
    const tops = cur;
    const colTop = (ci, ck) => tops[ci + PAD + (ck + PAD) * GW];
    const colWet = (ci, ck) => !Number.isNaN(colTop(ci, ck));
    const slopeG = new Float32Array(GW * GW);
    for (let gz = 1; gz < GW - 1; gz++) {
        for (let gx = 1; gx < GW - 1; gx++) {
            const g = gx + gz * GW;
            const t0 = tops[g];
            if (Number.isNaN(t0)) continue;
            let mx = 0;
            for (const nb of [g - 1, g + 1, g - GW, g + GW]) {
                const tn = tops[nb];
                let d = 0;
                if (!Number.isNaN(tn)) d = Math.abs(t0 - tn) / step;
                else if (solidG[nb] < t0 - 3) d = Math.min(4, (t0 - solidG[nb]) / step);
                if (d > mx) mx = d;
            }
            slopeG[g] = mx;
        }
    }
    // V18.375 — DIE NAHT-WURZEL: aDepth + aSlope geglättet (Mirror zu `_computeWaterSheetData`).
    // `tops` (Position) war geglättet, aber depthG/slopeG (die Amplituden-Treiber rippleAmt/
    // whitewater) blieben roh per-Zelle → sprangen am steilen Lauf + an der Chunk-Grenze = das
    // konzentrische Naht-Muster. Wet-only Box-Blur über das padded GW-Grid (reicht über die Grenze
    // → beide Nachbarn rechnen am Rand denselben Wert = naht-frei). Byte-identisch zum Main.
    // V18.378 — Pass-Zahl ≤ SMOOTH_PASSES (passt exakt in den PAD wie `tops`; +1 reichte 1 Zelle
    // über den Pad → asymmetrische Rand-Trunkierung → die gemessene 8,4-cm-aDepth-Naht).
    const _smoothWetAttr = (arr, passes = SMOOTH_PASSES) => {
        const out = new Float64Array(GW * GW);
        for (let pass = 0; pass < passes; pass++) {
            for (let g = 0; g < GW * GW; g++) {
                if (Number.isNaN(tops[g])) {
                    out[g] = arr[g];
                    continue;
                }
                const gx = g % GW;
                const gz = (g / GW) | 0;
                let sum = 0;
                let nn = 0;
                for (let dz2 = -1; dz2 <= 1; dz2++) {
                    for (let dx2 = -1; dx2 <= 1; dx2++) {
                        const nx = gx + dx2;
                        const nz = gz + dz2;
                        if (nx < 0 || nz < 0 || nx >= GW || nz >= GW) continue;
                        const ng = nx + nz * GW;
                        if (Number.isNaN(tops[ng])) continue;
                        // V18.475 — dasselbe HÖHEN-GATE wie der tops-Blur (Mirror):
                        // Bett/Slope/Flow bluten nicht über die Klippe.
                        if (Math.abs(topRawG[ng] - topRawG[g]) > BLUR_GATE) continue;
                        sum += arr[ng];
                        nn++;
                    }
                }
                out[g] = nn > 0 ? sum / nn : arr[g];
            }
            for (let g = 0; g < GW * GW; g++) arr[g] = out[g];
        }
    };
    // V18.377 — KONTINUIERLICHE TIEFE (Mirror zu _computeWaterSheetData): depth = kontinuierliche
    // Oberfläche (tops) − kontinuierliches Bett (solidG mit demselben wet-only Box-Blur geglättet)
    // statt der zell-quantisierten (floodTopJ−solidTopJ)·step → der Shader blendet die Tiefen-Farbe
    // weich über die ganze Breite statt in „drei Linien". Byte-identisch zum Main.
    // V18.378 — die WAHRE Dicke: Bett-OBERFLÄCHE = solidG + step; KEINE zweite Glättung der
    // Differenz (smooth−smooth ist naht-exakt; ein Blur darüber überschritte den Pad — die Naht).
    const bedG = new Float64Array(GW * GW);
    for (let g = 0; g < GW * GW; g++) bedG[g] = solidG[g] + step;
    _smoothWetAttr(bedG);
    for (let g = 0; g < GW * GW; g++) depthG[g] = Number.isNaN(tops[g]) ? 0 : Math.max(0, tops[g] - bedG[g]);
    // V18.378 — slope ist eine ABLEITUNG (tops ±1) → ein Pass weniger hält den Kegel im PAD.
    const slopeGS = new Float64Array(GW * GW);
    for (let g = 0; g < GW * GW; g++) slopeGS[g] = slopeG[g];
    _smoothWetAttr(slopeGS, Math.max(0, SMOOTH_PASSES - 1));
    for (let g = 0; g < GW * GW; g++) slopeG[g] = slopeGS[g];
    // V18.379 — die Strömung als geglättetes Spalten-Feld (Mirror zu _computeWaterSheetData):
    // ein Feld-Sample pro Spalte + wet-only Box-Blur statt 9 roher Samples pro Vertex → kein
    // Regime-Patchwork (riverness/flowMix lasen das Rauschen), naht-exakt per PAD-Mathe.
    const flowXG = new Float64Array(GW * GW);
    const flowZG = new Float64Array(GW * GW);
    for (let gz = 0; gz < GW; gz++) {
        for (let gx = 0; gx < GW; gx++) {
            const g = gx + gz * GW;
            if (Number.isNaN(tops[g])) continue; // Strömung lebt auf dem WASSER (Anker 0)
            const wxc = ox + (gx - PAD + 0.5) * step;
            const wzc = oz + (gz - PAD + 0.5) * step;
            const rv = hydroRiverAt(wxc, wzc);
            if (rv && (rv.flowX || rv.flowZ)) {
                const m = Math.hypot(rv.flowX, rv.flowZ) || 1;
                flowXG[g] = rv.flowX / m;
                flowZG[g] = rv.flowZ / m;
            }
        }
    }
    _smoothWetAttr(flowXG);
    _smoothWetAttr(flowZG);
    const NV = dim + 1;
    const positions = [];
    const indices = [];
    const aFlow = [];
    const aWave = [];
    const aDepth = [];
    const aSlope = [];
    const vmap = new Int32Array(NV * NV).fill(-1);
    const vertIsAnchor = [];
    // V18.375 — Vertex-Jitter gegen das Gitter-Moiré (Mirror zu `_computeWaterSheetData`): das
    // regelmäßige Wasser-Vertex-Gitter aliast am grazing-Blick; ein welt-deterministischer, steigungs-
    // skalierter horizontaler Versatz bricht das Raster (kein Moiré mehr). Naht-sicher (globaler Index),
    // byte-identisch zum Main (Math.imul/>>>0).
    const _jhash = (a, b) => {
        let h = (Math.imul(a | 0, 374761393) + Math.imul(b | 0, 668265263)) | 0;
        h = Math.imul(h ^ (h >>> 13), 1274126177) | 0;
        return ((h ^ (h >>> 16)) >>> 0) / 4294967296 - 0.5;
    };
    const _jitAmp = step * 0.6;
    const addVert = (i, k) => {
        const vi = i + k * NV;
        if (vmap[vi] >= 0) return vmap[vi];
        const wx = ox + i * step;
        const wz = oz + k * step;
        let sum = 0;
        let n = 0;
        let rohMin = Infinity;
        let rohMax = -Infinity;
        let ruht = true;
        let dsum = 0;
        let sfx = 0;
        let sfz = 0;
        let slopeMax = 0;
        let anchor = Infinity;
        for (const [aci, ack] of [
            [i - 1, k - 1],
            [i, k - 1],
            [i - 1, k],
            [i, k],
        ]) {
            const gi2 = aci + PAD + (ack + PAD) * GW;
            const v = colTop(aci, ack);
            if (!Number.isNaN(v)) {
                sum += v;
                n++;
                if (topRawG[gi2] < rohMin) rohMin = topRawG[gi2];
                if (topRawG[gi2] > rohMax) rohMax = topRawG[gi2];
                if (!ruhG[gi2]) ruht = false;
                dsum += depthG[gi2];
                sfx += flowXG[gi2];
                sfz += flowZG[gi2];
                if (slopeG[gi2] > slopeMax) slopeMax = slopeG[gi2];
            }
            const sv = solidG[gi2];
            if (sv < anchor) anchor = sv;
        }
        // V18.375 — UNIFORMER Jitter (keine Steigungs-Skala, Mirror zu _computeWaterSheetData): die
        // per-Chunk-`slopeMax`-Skala wich am Rand minimal ab → horizontaler Riss = der vertikale
        // Streifen. Uniform → Rand-Vertices fallen exakt zusammen; horizontaler Jitter auf flachem
        // Wasser unsichtbar, nur steiles Wasser wird ent-gittert.
        const _jdir = _jhash(cx * dim + i, cz * dim + k) * _jitAmp;
        const _jdir2 = _jhash(cz * dim + k + 8191, cx * dim + i + 131071) * _jitAmp;
        // Mirror: ruhendes Wasser trägt den Spiegel des Gesetzes am Ort des Vertex, gehalten zwischen die rohen Dächer
        let surfY = anchor - 0.5;
        if (n > 0 && ruht) {
            const Lv = atlasWaterLevelAt(wx + _jdir, wz + _jdir2, Infinity);
            const Lq = Lv > -Infinity ? Lv : hydroSpiegelQuer(wx + _jdir, wz + _jdir2);
            surfY = Lq > -Infinity ? Math.max(rohMin, Math.min(rohMax, Lq)) : rohMax;
        } else if (n > 0) surfY = sum / n;
        const depthM = n > 0 ? dsum / n : 0;
        const id = positions.length / 3;
        vertIsAnchor[id] = n === 0;
        positions.push(wx + _jdir, surfY, wz + _jdir2);
        // aFlow (V18.379) — Mittel der 4 geglätteten Nachbar-Spalten (sfx/sfz im wet-Loop).
        const flowN = n > 0 ? n : 1;
        const avFx = sfx / flowN;
        const avFz = sfz / flowN;
        const heightRamp = Math.max(0, Math.min(1, 1 - (Math.abs(surfY - waterLevel) - 0.8) / 2.0));
        const rt = Math.max(0, Math.min(1, (Math.hypot(avFx, avFz) - 0.04) / 0.46));
        const riverness = rt * rt * (3 - 2 * rt);
        const isLake = n > 0 && heightRamp > 0 && hydrosphereLakeAt(wx, wz);
        aWave.push(isLake ? 0 : heightRamp * (1 - riverness));
        aDepth.push(depthM);
        aSlope.push(n > 0 ? slopeMax : 0);
        aFlow.push(avFx, avFz);
        vmap[vi] = id;
        return id;
    };
    const VERT_SPLIT = step * 3;
    const dupVert = (srcId, nx, ny, nz, slopeOverride) => {
        const id = positions.length / 3;
        positions.push(nx, ny, nz);
        aWave.push(aWave[srcId]);
        aDepth.push(aDepth[srcId]);
        aSlope.push(slopeOverride !== undefined ? slopeOverride : aSlope[srcId]);
        aFlow.push(aFlow[srcId * 2], aFlow[srcId * 2 + 1]);
        return id;
    };
    for (let k = 0; k < dim; k++) {
        for (let i = 0; i < dim; i++) {
            if (!(colWet(i, k) || colWet(i - 1, k) || colWet(i + 1, k) || colWet(i, k - 1) || colWet(i, k + 1)))
                continue;
            const v00 = addVert(i, k);
            const v10 = addVert(i + 1, k);
            const v01 = addVert(i, k + 1);
            const v11 = addVert(i + 1, k + 1);
            const y00 = positions[v00 * 3 + 1];
            const y10 = positions[v10 * 3 + 1];
            const y01 = positions[v01 * 3 + 1];
            const y11 = positions[v11 * 3 + 1];
            const hi = Math.max(y00, y10, y01, y11);
            const lo = Math.min(y00, y10, y01, y11);
            const anyAnchor = vertIsAnchor[v00] || vertIsAnchor[v10] || vertIsAnchor[v01] || vertIsAnchor[v11];
            if (anyAnchor || hi - lo <= VERT_SPLIT) {
                indices.push(v00, v10, v01, v11, v01, v10);
                continue;
            }
            const dX = Math.abs((y00 + y01) / 2 - (y10 + y11) / 2);
            const dZ = Math.abs((y00 + y10) / 2 - (y01 + y11) / 2);
            let hiA, hiB, loA, loB;
            if (dX >= dZ) {
                if ((y00 + y01) / 2 >= (y10 + y11) / 2) {
                    hiA = v00;
                    hiB = v01;
                    loA = v10;
                    loB = v11;
                } else {
                    hiA = v10;
                    hiB = v11;
                    loA = v00;
                    loB = v01;
                }
            } else if ((y00 + y10) / 2 >= (y01 + y11) / 2) {
                hiA = v00;
                hiB = v10;
                loA = v01;
                loB = v11;
            } else {
                hiA = v01;
                hiB = v11;
                loA = v00;
                loB = v10;
            }
            const lipY = (positions[hiA * 3 + 1] + positions[hiB * 3 + 1]) / 2;
            const dA = dupVert(loA, positions[loA * 3], lipY, positions[loA * 3 + 2]);
            const dB = dupVert(loB, positions[loB * 3], lipY, positions[loB * 3 + 2]);
            const rep = (v) => (v === loA ? dA : v === loB ? dB : v);
            indices.push(rep(v00), rep(v10), rep(v01), rep(v11), rep(v01), rep(v10));
            const cA = dupVert(loA, positions[loA * 3], lipY, positions[loA * 3 + 2], 4);
            const cB = dupVert(loB, positions[loB * 3], lipY, positions[loB * 3 + 2], 4);
            const fA = dupVert(loA, positions[loA * 3], positions[loA * 3 + 1], positions[loA * 3 + 2], 4);
            const fB = dupVert(loB, positions[loB * 3], positions[loB * 3 + 1], positions[loB * 3 + 2], 4);
            indices.push(cA, fA, cB, fB, cB, fA);
            indices.push(cB, fB, cA, fA, cA, fB);
        }
    }
    if (indices.length === 0) return null;
    return { positions, indices, aFlow, aWave, aDepth, aSlope };
}

// =============================================================================
// Surface-Nets-Meshing (Mirror der `_voxelChunkGeometry`-Subroutinen)
// =============================================================================

const EDGES = [
    [0, 1],
    [0, 2],
    [0, 4],
    [1, 3],
    [1, 5],
    [2, 3],
    [2, 6],
    [3, 7],
    [4, 5],
    [4, 6],
    [5, 7],
    [6, 7],
];

// T3 (Terrain-Kohärenz-Plan §4 — Manifold Dual Contouring): die Schärfe-Regler. MÜSSEN
// bit-identisch zu `AnazhRealm.DC_LAMBDA`/`DC_SHARP_MOVE2` (Main) sein — Determinismus-Wand:
// Worker- + Main-gebaute Chunks teilen den Seed → ihre Boundary-Vertices müssen koinzident
// bleiben (V9.42-b). Bei einer Änderung BEIDE Stellen gleichschalten.
const DC_LAMBDA = 0.1;
const DC_SHARP_MOVE2 = 0.04;

function extractSurfaceVertices(density, ox, oy, oz, dimX, dimY, dimZ, step) {
    const Nx = dimX + 1;
    const Ny = dimY + 1;
    const gi = (i, j, k) => i + j * Nx + k * Nx * Ny;
    const ci = (i, j, k) => i + j * dimX + k * dimX * dimY;
    const solid = (v) => v > 0;
    const cellVert = new Int32Array(dimX * dimY * dimZ).fill(-1);
    const positions = [];
    const vertCells = [];
    const sharp = []; // T3 — pro Vertex: 1, wenn das QEF eine echte FEATURE-Ecke fand
    const LAMBDA = DC_LAMBDA;
    for (let k = 0; k < dimZ; k++) {
        for (let j = 0; j < dimY; j++) {
            for (let i = 0; i < dimX; i++) {
                const corner = new Array(8);
                let mask = 0;
                for (let c = 0; c < 8; c++) {
                    const cx = i + (c & 1);
                    const cy = j + ((c >> 1) & 1);
                    const cz = k + ((c >> 2) & 1);
                    corner[c] = density[gi(cx, cy, cz)];
                    if (solid(corner[c])) mask |= 1 << c;
                }
                if (mask === 0 || mask === 0xff) continue;
                // Mass-Point + QEF-Akkumulation (Dual Contouring) — identisch zum Main-Mirror.
                let vx = 0;
                let vy = 0;
                let vz = 0;
                let count = 0;
                let a00 = 0,
                    a01 = 0,
                    a02 = 0,
                    a11 = 0,
                    a12 = 0,
                    a22 = 0;
                let b0 = 0,
                    b1 = 0,
                    b2 = 0;
                for (const [a, b] of EDGES) {
                    if (solid(corner[a]) === solid(corner[b])) continue;
                    const da = corner[a];
                    const db = corner[b];
                    const denom = da - db;
                    const t = Math.abs(denom) > 1e-9 ? da / denom : 0.5;
                    const ax = a & 1;
                    const ay = (a >> 1) & 1;
                    const az = (a >> 2) & 1;
                    const bx = b & 1;
                    const by = (b >> 1) & 1;
                    const bz = (b >> 2) & 1;
                    const px = ax + (bx - ax) * t;
                    const py = ay + (by - ay) * t;
                    const pz = az + (bz - az) * t;
                    vx += px;
                    vy += py;
                    vz += pz;
                    count++;
                    let gx =
                        (corner[1] - corner[0]) * (1 - py) * (1 - pz) +
                        (corner[3] - corner[2]) * py * (1 - pz) +
                        (corner[5] - corner[4]) * (1 - py) * pz +
                        (corner[7] - corner[6]) * py * pz;
                    let gy =
                        (corner[2] - corner[0]) * (1 - px) * (1 - pz) +
                        (corner[3] - corner[1]) * px * (1 - pz) +
                        (corner[6] - corner[4]) * (1 - px) * pz +
                        (corner[7] - corner[5]) * px * pz;
                    let gz =
                        (corner[4] - corner[0]) * (1 - px) * (1 - py) +
                        (corner[5] - corner[1]) * px * (1 - py) +
                        (corner[6] - corner[2]) * (1 - px) * py +
                        (corner[7] - corner[3]) * px * py;
                    const glen = Math.sqrt(gx * gx + gy * gy + gz * gz);
                    if (glen < 1e-9) continue;
                    gx /= glen;
                    gy /= glen;
                    gz /= glen;
                    const d = gx * px + gy * py + gz * pz;
                    a00 += gx * gx;
                    a01 += gx * gy;
                    a02 += gx * gz;
                    a11 += gy * gy;
                    a12 += gy * gz;
                    a22 += gz * gz;
                    b0 += gx * d;
                    b1 += gy * d;
                    b2 += gz * d;
                }
                if (count === 0) continue;
                const s = 1 / count;
                const cx = vx * s,
                    cy = vy * s,
                    cz = vz * s;
                a00 += LAMBDA;
                a11 += LAMBDA;
                a22 += LAMBDA;
                b0 += LAMBDA * cx;
                b1 += LAMBDA * cy;
                b2 += LAMBDA * cz;
                let fx = cx,
                    fy = cy,
                    fz = cz,
                    isSharp = 0;
                const det =
                    a00 * (a11 * a22 - a12 * a12) - a01 * (a01 * a22 - a12 * a02) + a02 * (a01 * a12 - a11 * a02);
                if (Math.abs(det) > 1e-9) {
                    const inv = 1 / det;
                    const m00 = a11 * a22 - a12 * a12,
                        m01 = a02 * a12 - a01 * a22,
                        m02 = a01 * a12 - a02 * a11;
                    const m11 = a00 * a22 - a02 * a02,
                        m12 = a01 * a02 - a00 * a12;
                    const m22 = a00 * a11 - a01 * a01;
                    fx = (m00 * b0 + m01 * b1 + m02 * b2) * inv;
                    fy = (m01 * b0 + m11 * b1 + m12 * b2) * inv;
                    fz = (m02 * b0 + m12 * b1 + m22 * b2) * inv;
                    if (fx < 0) fx = 0;
                    else if (fx > 1) fx = 1;
                    if (fy < 0) fy = 0;
                    else if (fy > 1) fy = 1;
                    if (fz < 0) fz = 0;
                    else if (fz > 1) fz = 1;
                    const dxm = fx - cx,
                        dym = fy - cy,
                        dzm = fz - cz;
                    if (dxm * dxm + dym * dym + dzm * dzm > DC_SHARP_MOVE2) isSharp = 1;
                }
                cellVert[ci(i, j, k)] = positions.length / 3;
                vertCells.push(i, j, k);
                sharp.push(isSharp);
                positions.push(ox + (i + fx) * step, oy + (j + fy) * step, oz + (k + fz) * step);
            }
        }
    }
    return { positions, vertCells, cellVert, sharp };
}

// Mit `lab` (Höhlen-Zelle je Gitter-Punkt, `hoehlenGraph`) trägt `triZelle` je Dreieck die Zelle des Luft-Endes seiner
// Kante (−1: Himmels-Luft) — identisch zum Main (`_voxelEmitQuadIndices`).
function emitQuadIndices(density, cellVert, dimX, dimY, dimZ, lab = null, triZelle = null) {
    const Nx = dimX + 1;
    const Ny = dimY + 1;
    const gi = (i, j, k) => i + j * Nx + k * Nx * Ny;
    const ci = (i, j, k) => i + j * dimX + k * dimX * dimY;
    const solid = (v) => v > 0;
    const cv = (i, j, k) => {
        if (i < 0 || j < 0 || k < 0 || i >= dimX || j >= dimY || k >= dimZ) return -1;
        return cellVert[ci(i, j, k)];
    };
    const indices = [];
    const quad = (a, b, c, d, parity, zelle) => {
        if (a < 0 || b < 0 || c < 0 || d < 0) return;
        if (parity & 1) {
            indices.push(a, b, d, b, c, d);
        } else {
            indices.push(a, b, c, a, c, d);
        }
        if (triZelle) triZelle.push(zelle, zelle);
    };
    const luft = (p0, p1, s0) => (lab ? lab[s0 ? p1 : p0] : -1);
    for (let k = 0; k <= dimZ; k++) {
        for (let j = 0; j <= dimY; j++) {
            for (let i = 0; i <= dimX; i++) {
                const p0 = gi(i, j, k);
                const s0 = solid(density[p0]);
                const parity = (i + j + k) & 1;
                if (i < dimX && j > 0 && k > 0 && s0 !== solid(density[gi(i + 1, j, k)])) {
                    quad(
                        cv(i, j - 1, k - 1),
                        cv(i, j, k - 1),
                        cv(i, j, k),
                        cv(i, j - 1, k),
                        parity,
                        luft(p0, gi(i + 1, j, k), s0)
                    );
                }
                if (j < dimY && i > 0 && k > 0 && s0 !== solid(density[gi(i, j + 1, k)])) {
                    quad(
                        cv(i - 1, j, k - 1),
                        cv(i, j, k - 1),
                        cv(i, j, k),
                        cv(i - 1, j, k),
                        parity,
                        luft(p0, gi(i, j + 1, k), s0)
                    );
                }
                if (k < dimZ && i > 0 && j > 0 && s0 !== solid(density[gi(i, j, k + 1)])) {
                    quad(
                        cv(i - 1, j - 1, k),
                        cv(i, j - 1, k),
                        cv(i, j, k),
                        cv(i - 1, j, k),
                        parity,
                        luft(p0, gi(i, j, k + 1), s0)
                    );
                }
            }
        }
    }
    return indices;
}

// DIE HÖHLEN-SCHICHT (Welle 7) — Spiegel von `_voxelHoehlenGraph` (MUSS bit-identisch): Himmels-Luft über der obersten
// festen Ecke ihrer Spalte, Höhlen-Luft darunter; Zelle = Höhlen-Luft-Komponente je Chunk-Teil (Zelle 0 = die
// versiegelten), Mündung = Höhlen-Luft waagerecht neben Himmels-Luft, Portal = 6-Nachbarn verschiedener Zellen, Rand-Band =
// bis einen Schritt jenseits der Chunk-Kante.
function hoehlenGraph(density, ox, oy, oz, dimX, dimY, dimZ, step) {
    const Nx = dimX + 1;
    const Ny = dimY + 1;
    const Nz = dimZ + 1;
    const NxNy = Nx * Ny;
    const N = NxNy * Nz;
    const top = new Int32Array(Nx * Nz).fill(-1);
    for (let k = 0; k < Nz; k++)
        for (let i = 0; i < Nx; i++)
            for (let j = Ny - 1; j >= 0; j--)
                if (density[i + j * Nx + k * NxNy] > 0) {
                    top[i + k * Nx] = j;
                    break;
                }
    const hoehle = (p, i, j, k) => density[p] <= 0 && j < top[i + k * Nx];
    // DIE TEILUNG der Zellen (MUSS gleich in Main und Worker): je Chunk-Seite TEIL Kacheln, je SCHICHT Gitter-Ebenen eine
    // Lage — eine kleine Zelle hält das Rechteck der Portal-Sicht eng (Werkbank 06.10., Mess-Wiese: Viertel ohne Lagen
    // 13,8k, 4 × 4 Kacheln mit Lagen 7,5k Höhlen-Dreiecke im Hauptbild bei derselben Mündungs-Wahl).
    const TEIL = 4,
        SCHICHT = 8;
    const kachel = (i, dim) => {
        const t = Math.floor(((i - 1) * TEIL) / dim);
        return t < 0 ? 0 : t >= TEIL ? TEIL - 1 : t;
    };
    const teil = (i, j, k) => kachel(i, dimX - 3) + TEIL * kachel(k, dimZ - 3) + TEIL * TEIL * Math.floor(j / SCHICHT);
    const lab = new Int32Array(N).fill(-1);
    const stapel = new Int32Array(N);
    let nRoh = 0;
    for (let p = 0; p < N; p++) {
        if (lab[p] >= 0) continue;
        const i = p % Nx;
        const j = ((p / Nx) | 0) % Ny;
        const k = (p / NxNy) | 0;
        if (!hoehle(p, i, j, k)) continue;
        const v = teil(i, j, k);
        lab[p] = nRoh;
        let sp = 0;
        stapel[sp++] = p;
        const tritt = (q, qi, qj, qk) => {
            if (lab[q] >= 0 || !hoehle(q, qi, qj, qk) || teil(qi, qj, qk) !== v) return;
            lab[q] = nRoh;
            stapel[sp++] = q;
        };
        while (sp > 0) {
            const q = stapel[--sp];
            const qi = q % Nx;
            const qj = ((q / Nx) | 0) % Ny;
            const qk = (q / NxNy) | 0;
            if (qi + 1 < Nx) tritt(q + 1, qi + 1, qj, qk);
            if (qi > 0) tritt(q - 1, qi - 1, qj, qk);
            if (qj + 1 < Ny) tritt(q + Nx, qi, qj + 1, qk);
            if (qj > 0) tritt(q - Nx, qi, qj - 1, qk);
            if (qk + 1 < Nz) tritt(q + NxNy, qi, qj, qk + 1);
            if (qk > 0) tritt(q - NxNy, qi, qj, qk - 1);
        }
        nRoh++;
    }
    const LEER = [2147483647, -2147483648];
    const luftB = new Int32Array(nRoh * 6);
    // die Mündungen je Komponente und Fach (4 × 4 × 4 Gitter-Punkte): eine kleine Box hält die Horizont-Probe und das Licht-
    // Rechteck eng (eine Komponente trägt oft Mündungen über die ganze Höhe einer Schlucht-Wand)
    const mundM = new Map();
    const mund = (c, i, j, k, i2, k2) => {
        const key = c * 4096 + (i >> 2) + 8 * ((k >> 2) + 8 * (j >> 2));
        let B = mundM.get(key);
        if (!B) mundM.set(key, (B = [c, LEER[0], LEER[0], LEER[0], LEER[1], LEER[1], LEER[1]]));
        dehne(B, 1, i, j, k);
        dehne(B, 1, i2, j, k2);
    };
    const seitB = new Int32Array(nRoh * 24);
    for (let c = 0; c < nRoh; c++) {
        for (let a = 0; a < 3; a++) {
            luftB[c * 6 + a] = LEER[0];
            luftB[c * 6 + 3 + a] = LEER[1];
        }
        for (let sd = 0; sd < 4; sd++)
            for (let a = 0; a < 3; a++) {
                seitB[c * 24 + sd * 6 + a] = LEER[0];
                seitB[c * 24 + sd * 6 + 3 + a] = LEER[1];
            }
    }
    const dehne = (B, o, i, j, k) => {
        if (i < B[o]) B[o] = i;
        if (j < B[o + 1]) B[o + 1] = j;
        if (k < B[o + 2]) B[o + 2] = k;
        if (i > B[o + 3]) B[o + 3] = i;
        if (j > B[o + 4]) B[o + 4] = j;
        if (k > B[o + 5]) B[o + 5] = k;
    };
    const offen = new Uint8Array(nRoh);
    const paare = [];
    const himmel = (q, qi, qj, qk) => density[q] <= 0 && qj > top[qi + qk * Nx];
    for (let p = 0; p < N; p++) {
        const c = lab[p];
        if (c < 0) continue;
        const i = p % Nx;
        const j = ((p / Nx) | 0) % Ny;
        const k = (p / NxNy) | 0;
        dehne(luftB, c * 6, i, j, k);
        if (i <= 2) dehne(seitB, c * 24, i, j, k);
        if (i >= dimX - 3) dehne(seitB, c * 24 + 6, i, j, k);
        if (k <= 2) dehne(seitB, c * 24 + 12, i, j, k);
        if (k >= dimZ - 3) dehne(seitB, c * 24 + 18, i, j, k);
        if (i <= 2 || i >= dimX - 3 || k <= 2 || k >= dimZ - 3) offen[c] = 1;
        if (i + 1 < Nx && himmel(p + 1, i + 1, j, k)) {
            mund(c, i, j, k, i + 1, k);
            offen[c] = 1;
        }
        if (i > 0 && himmel(p - 1, i - 1, j, k)) {
            mund(c, i, j, k, i - 1, k);
            offen[c] = 1;
        }
        if (k + 1 < Nz && himmel(p + NxNy, i, j, k + 1)) {
            mund(c, i, j, k, i, k + 1);
            offen[c] = 1;
        }
        if (k > 0 && himmel(p - NxNy, i, j, k - 1)) {
            mund(c, i, j, k, i, k - 1);
            offen[c] = 1;
        }
        if (i + 1 < Nx && lab[p + 1] >= 0 && lab[p + 1] !== c) {
            paare.push(c, lab[p + 1], i, j, k, i + 1, j, k);
            offen[c] = offen[lab[p + 1]] = 1;
        }
        if (j + 1 < Ny && lab[p + Nx] >= 0 && lab[p + Nx] !== c) {
            paare.push(c, lab[p + Nx], i, j, k, i, j + 1, k);
            offen[c] = offen[lab[p + Nx]] = 1;
        }
        if (k + 1 < Nz && lab[p + NxNy] >= 0 && lab[p + NxNy] !== c) {
            paare.push(c, lab[p + NxNy], i, j, k, i, j, k + 1);
            offen[c] = offen[lab[p + NxNy]] = 1;
        }
    }
    const zelleVon = new Int32Array(nRoh);
    let n = 1;
    for (let c = 0; c < nRoh; c++) zelleVon[c] = offen[c] ? n++ : 0;
    for (let p = 0; p < N; p++) if (lab[p] >= 0) lab[p] = zelleVon[lab[p]];
    const wx = (i) => ox + i * step;
    const wy = (j) => oy + j * step;
    const wz = (k) => oz + k * step;
    const knoten = new Float32Array(n * 6);
    const seiten = new Float32Array(n * 24);
    for (let z = 0; z < n; z++) {
        for (let a = 0; a < 3; a++) {
            knoten[z * 6 + a] = Infinity;
            knoten[z * 6 + 3 + a] = -Infinity;
        }
        for (let sd = 0; sd < 4; sd++)
            for (let a = 0; a < 3; a++) {
                seiten[z * 24 + sd * 6 + a] = Infinity;
                seiten[z * 24 + sd * 6 + 3 + a] = -Infinity;
            }
    }
    const vereine = (Z, zo, B, bo) => {
        if (B[bo] > B[bo + 3]) return;
        const v = [wx(B[bo]), wy(B[bo + 1]), wz(B[bo + 2]), wx(B[bo + 3]), wy(B[bo + 4]), wz(B[bo + 5])];
        for (let a = 0; a < 3; a++) {
            if (v[a] < Z[zo + a]) Z[zo + a] = v[a];
            if (v[3 + a] > Z[zo + 3 + a]) Z[zo + 3 + a] = v[3 + a];
        }
    };
    for (let c = 0; c < nRoh; c++) {
        const z = zelleVon[c];
        vereine(knoten, z * 6, luftB, c * 6);
        for (let sd = 0; sd < 4; sd++) vereine(seiten, z * 24 + sd * 6, seitB, c * 24 + sd * 6);
    }
    const portal = new Map();
    for (let q = 0; q < paare.length; q += 8) {
        const a = zelleVon[paare[q]];
        const b = zelleVon[paare[q + 1]];
        const lo = a < b ? a : b;
        const hi = a < b ? b : a;
        const key = lo * n + hi;
        let B = portal.get(key);
        if (!B) portal.set(key, (B = [lo, hi, Infinity, Infinity, Infinity, -Infinity, -Infinity, -Infinity]));
        const pts = [
            [paare[q + 2], paare[q + 3], paare[q + 4]],
            [paare[q + 5], paare[q + 6], paare[q + 7]],
        ];
        for (const [i, j, k] of pts) {
            const x = wx(i),
                y = wy(j),
                zz = wz(k);
            if (x < B[2]) B[2] = x;
            if (y < B[3]) B[3] = y;
            if (zz < B[4]) B[4] = zz;
            if (x > B[5]) B[5] = x;
            if (y > B[6]) B[6] = y;
            if (zz > B[7]) B[7] = zz;
        }
    }
    // die Mündungs-Boxen [Zelle, Box] in Fund-Folge (eine versiegelte Komponente trägt keine)
    const muend = new Float32Array(mundM.size * 7);
    let om = 0;
    for (const B of mundM.values()) {
        muend[om++] = zelleVon[B[0]];
        muend[om++] = wx(B[1]);
        muend[om++] = wy(B[2]);
        muend[om++] = wz(B[3]);
        muend[om++] = wx(B[4]);
        muend[om++] = wy(B[5]);
        muend[om++] = wz(B[6]);
    }
    const kanten = new Float32Array(portal.size * 8);
    let o = 0;
    for (const B of portal.values()) for (let a = 0; a < 8; a++) kanten[o++] = B[a];
    // (5) die RAND-EBENEN: je Höhlen-Punkt auf einer Chunk-Kante (−x: i = 1 · +x: i = dimX − 2 · −z: k = 1 · +z: k = dimZ − 2)
    // [Seite, j, u (k bzw. i), Zelle] — derselbe Welt-Punkt liegt im Gitter des Nachbarn auf seiner Gegen-Kante (gleiche
    // Stufe: dieselben Indizes), dort verknüpft der Haupt-Thread die Zellen exakt (`_hoehlenVerknuepfe`).
    const randL = [];
    for (let k = 0; k < Nz; k++)
        for (let j = 0; j < Ny; j++) {
            const a = lab[1 + j * Nx + k * NxNy];
            if (a > 0) randL.push(0, j, k, a);
            const b = lab[dimX - 2 + j * Nx + k * NxNy];
            if (b > 0) randL.push(1, j, k, b);
        }
    for (let i = 0; i < Nx; i++)
        for (let j = 0; j < Ny; j++) {
            const a = lab[i + j * Nx + NxNy];
            if (a > 0) randL.push(2, j, i, a);
            const b = lab[i + j * Nx + (dimZ - 2) * NxNy];
            if (b > 0) randL.push(3, j, i, b);
        }
    const rand = Int32Array.from(randL);
    return { lab, n, knoten, muend, seiten, kanten, rand };
}

function laplacianSmoothPositions(positions, indices, iterations = 1, sharp = null) {
    if (indices.length < 3) return;
    const vertCount = positions.length / 3;
    const neighborSets = new Array(vertCount);
    for (let v = 0; v < vertCount; v++) neighborSets[v] = new Set();
    for (let t = 0; t + 2 < indices.length; t += 3) {
        const ia = indices[t];
        const ib = indices[t + 1];
        const ic = indices[t + 2];
        neighborSets[ia].add(ib);
        neighborSets[ia].add(ic);
        neighborSets[ib].add(ia);
        neighborSets[ib].add(ic);
        neighborSets[ic].add(ia);
        neighborSets[ic].add(ib);
    }
    const lambda = 0.5;
    const smoothed = new Array(positions.length);
    for (let iter = 0; iter < iterations; iter++) {
        for (let v = 0; v < vertCount; v++) {
            const nbrs = neighborSets[v];
            const cnt = nbrs.size;
            // T3 — feature-bewusst: scharfe QEF-Vertices bleiben UNgesmootht (identisch zum Main).
            if (cnt === 0 || (sharp && sharp[v])) {
                smoothed[v * 3] = positions[v * 3];
                smoothed[v * 3 + 1] = positions[v * 3 + 1];
                smoothed[v * 3 + 2] = positions[v * 3 + 2];
                continue;
            }
            let sx = 0;
            let sy = 0;
            let sz = 0;
            for (const n of nbrs) {
                sx += positions[n * 3];
                sy += positions[n * 3 + 1];
                sz += positions[n * 3 + 2];
            }
            const ax = sx / cnt;
            const ay = sy / cnt;
            const az = sz / cnt;
            smoothed[v * 3] = positions[v * 3] + lambda * (ax - positions[v * 3]);
            smoothed[v * 3 + 1] = positions[v * 3 + 1] + lambda * (ay - positions[v * 3 + 1]);
            smoothed[v * 3 + 2] = positions[v * 3 + 2] + lambda * (az - positions[v * 3 + 2]);
        }
        for (let i = 0; i < positions.length; i++) positions[i] = smoothed[i];
    }
}

function cropPad(positions, indices, vertCells, dimX, dimZ, cropMargin, triZelle = null) {
    if (cropMargin <= 0 || positions.length === 0) return;
    const vc = positions.length / 3;
    const remap = new Int32Array(vc).fill(-1);
    const keptPos = [];
    let kept = 0;
    for (let v = 0; v < vc; v++) {
        const ciV = vertCells[v * 3];
        const ckV = vertCells[v * 3 + 2];
        if (ciV < cropMargin || ciV >= dimX - cropMargin || ckV < cropMargin || ckV >= dimZ - cropMargin) {
            continue;
        }
        remap[v] = kept++;
        keptPos.push(positions[v * 3], positions[v * 3 + 1], positions[v * 3 + 2]);
    }
    const keptIdx = [];
    const keptZelle = [];
    for (let t = 0; t + 2 < indices.length; t += 3) {
        const a = remap[indices[t]];
        const b = remap[indices[t + 1]];
        const c = remap[indices[t + 2]];
        if (a >= 0 && b >= 0 && c >= 0) {
            keptIdx.push(a, b, c);
            if (triZelle) keptZelle.push(triZelle[t / 3]);
        }
    }
    positions.length = 0;
    for (let i = 0; i < keptPos.length; i++) positions.push(keptPos[i]);
    indices.length = 0;
    for (let i = 0; i < keptIdx.length; i++) indices.push(keptIdx[i]);
    if (triZelle) {
        triZelle.length = 0;
        for (let i = 0; i < keptZelle.length; i++) triZelle.push(keptZelle[i]);
    }
}

function gradientNormals(positions, density, ox, oy, oz, step, Nx, Ny, Nz) {
    const normals = new Float32Array(positions.length);
    // V18.113 — B3-ROLLBACK (mirror, Narbe): der Geometrie-Bake erzeugte
    // Schatten-Akne (normalBias braucht die ECHTE Oberflächen-Normale);
    // die Lichtung flacht im Material-normalNode (main-only Render).
    const eps = step * 1.5;
    const NxNy = Nx * Ny;
    const NxMax = Nx - 1;
    const NyMax = Ny - 1;
    const NzMax = Nz - 1;
    const lookup = (x, y, z) => {
        const fx = (x - ox) / step;
        const fy = (y - oy) / step;
        const fz = (z - oz) / step;
        const i = Math.floor(fx);
        const j = Math.floor(fy);
        const k = Math.floor(fz);
        if (i < 0 || j < 0 || k < 0 || i >= NxMax || j >= NyMax || k >= NzMax) {
            // Fallback: synchron-Density (selten am Edge nach Crop+Smooth).
            return terrainDensityAt(x, y, z);
        }
        const tx = fx - i;
        const ty = fy - j;
        const tz = fz - k;
        const base = i + j * Nx + k * NxNy;
        const d000 = density[base];
        const d100 = density[base + 1];
        const d010 = density[base + Nx];
        const d110 = density[base + 1 + Nx];
        const d001 = density[base + NxNy];
        const d101 = density[base + 1 + NxNy];
        const d011 = density[base + Nx + NxNy];
        const d111 = density[base + 1 + Nx + NxNy];
        const d00 = d000 * (1 - tx) + d100 * tx;
        const d10 = d010 * (1 - tx) + d110 * tx;
        const d01 = d001 * (1 - tx) + d101 * tx;
        const d11 = d011 * (1 - tx) + d111 * tx;
        const d0 = d00 * (1 - ty) + d10 * ty;
        const d1 = d01 * (1 - ty) + d11 * ty;
        return d0 * (1 - tz) + d1 * tz;
    };
    // G1 (Goldstandard-Mesh, V18.372) — Worker-Mirror der konformen Rand-Normale (s. Stamm
    // `_voxelGradientNormals`): in der Rand-Schale (≤3 Zellen vom Grid-Rand) den Gradienten via
    // terrainDensityAt (reine Funktion der Welt-Position) → beide Nachbarn rechnen identische
    // Normale → keine Lichtungs-Naht. Innen: schneller Trilinear. Determinismus-Byte-Test: identisch.
    const gx0 = ox;
    const gx1 = ox + (Nx - 1) * step;
    const gz0 = oz;
    const gz1 = oz + (Nz - 1) * step;
    const boundMargin = 3 * step;
    for (let v = 0; v < positions.length; v += 3) {
        const px = positions[v];
        const py = positions[v + 1];
        const pz = positions[v + 2];
        const useSample =
            px - gx0 < boundMargin || gx1 - px < boundMargin || pz - gz0 < boundMargin || gz1 - pz < boundMargin;
        const L = useSample ? terrainDensityAt : lookup;
        const gx = L(px + eps, py, pz) - L(px - eps, py, pz);
        const gy = L(px, py + eps, pz) - L(px, py - eps, pz);
        const gz = L(px, py, pz + eps) - L(px, py, pz - eps);
        const len = Math.hypot(gx, gy, gz);
        if (len < 1e-6) {
            normals[v] = 0;
            normals[v + 1] = 1;
            normals[v + 2] = 0;
        } else {
            normals[v] = -gx / len;
            normals[v + 1] = -gy / len;
            normals[v + 2] = -gz / len;
        }
    }
    return normals;
}

// =============================================================================
// Per-Vertex-Field-Colors (Mirror von _attachVoxelFieldColors)
// =============================================================================

function attachFieldColors(positions) {
    const n = positions.length / 3;
    const colors = new Float32Array(n * 3);
    const c = BODEN_FARBE_TMP;
    for (let i = 0; i < n; i++) {
        bodenFarbe(positions[i * 3], positions[i * 3 + 1], positions[i * 3 + 2], c);
        colors[i * 3] = c[0];
        colors[i * 3 + 1] = c[1];
        colors[i * 3 + 2] = c[2];
    }
    return colors;
}

// DIE EINE BODEN-FARBE DES FADENS (Mirror von \`_bodenFarbeAt\`, bit-identisch; gate:worker-dichte): jeder Chunk-Vertex
// (\`attachFieldColors\`, ohne fussM) und die Ferne (\`fernFarbeTeile\`, B2: mit fussM — die Flecken, die die Fläche nicht
// auflöst, tragen ihr Mittel aus phyto-core \`forestOktavMittel\`, die Fluss-Bänder ihr Mittel über den Abdruck
// \`flussAbdruck\`). Die Palette und der Wiesen-Grund kommen vom Main (Schnappschuss \`bodenPalette\` · \`wiesenGrund\`) —
// ohne sie färbt der Faden nicht (laut, kein stiller Ersatz). Die Sichtbarkeit der Feuchte und die Flechte sind hardkodiert
// (V17.100-Lehre: bit-Vertrag mit \`AnazhRealm.FEUCHTE\` · \`AnazhRealm.LICHEN\`, bei Änderung beide mit-ziehen).
const BODEN_FARBE_TMP = new Float64Array(3);
function bodenFarbe(x, y, z, out, fussM) {
    const P = state.bodenPalette;
    if (!P) throw new Error("bodenFarbe: die Boden-Palette fehlt im Worker-Zustand (bodenPalette)");
    const WG = state.wiesenGrund;
    if (!WG || !state.noise)
        throw new Error("bodenFarbe: der Wiesen-Grund (wiesenGrund) oder das Rauschen fehlt im Worker-Zustand");
    const ss = (e0, e1, v) => {
        let t = (v - e0) / (e1 - e0);
        t = t < 0 ? 0 : t > 1 ? 1 : t;
        return t * t * (3 - 2 * t);
    };
    const sandNoise = state.noise;
    const f = worldFieldAt(x, z);
    const c = [P.rock[0], P.rock[1], P.rock[2]];
    const mix = (target, t) => {
        c[0] += (target[0] - c[0]) * t;
        c[1] += (target[1] - c[1]) * t;
        c[2] += (target[2] - c[2]) * t;
    };
    mix(P.mead, ss(0.25, 0.85, f.lebendig));
    // DER BODEN ATMET: nach earth, vor lava/snow/sed/strand; y ist die Oberfläche
    const feuchte = feuchteAt(x, z, y, fussM);
    mix(P.wet, ss(0.3, 0.85, feuchte));
    // Kein Kronendach im Vertex (wie Main, 06.10.): die Streu unter den echten Kronen legt der Boden-Stoff auf.
    let lichenCluster = (sandNoise.noise2D(x * 0.04 + 7.7, z * 0.04 - 3.3) + 1) * 0.5;
    const oktav = fussM > 0 ? self.__phytoCore.forestOktavMittel : null;
    if (oktav) lichenCluster += (0.5 - lichenCluster) * oktav(fussM, 1 / 0.04); // das Simplex-Mittel ist 0,5
    const lichenMix = ss(0.5, 0.9, feuchte) * ss(0.5, 0.85, f.dichte || 0) * lichenCluster * 0.22;
    mix(P.flechte, lichenMix);
    mix(P.basalt, ss(0.48, 1.02, f.glut) * 0.65); // dunkles Basalt, gekappt
    // Der Magie-Akzent in Flecken.
    let magieFleck = ss(0.6, 0.85, (sandNoise.noise2D(x * 0.09 + 3.1, z * 0.09 - 8.7) + 1) * 0.5);
    if (oktav) magieFleck += (fleckMittel(sandNoise) - magieFleck) * oktav(fussM, 1 / 0.09);
    mix(P.magie, ss(0.55, 1.0, f.magieleitung) * magieFleck * 0.3);
    // Die Schneegrenze ist Gesetz (gelaende-core \`schnee\`) und liest den Pegel (der Versatz des Mains, stoffe.K3-2).
    if (!Number.isFinite(state.schneeVersatz))
        throw new Error("bodenFarbe: der Versatz der Schneegrenze fehlt (schneeVersatz)");
    mix(P.schnee, G.schnee(state, y, x, z, state.schneeVersatz));
    // Schlick und Strand über beiden Bezügen: See/Meer voll, der Fluss mit seiner Kronen-Blende; mit fussM trägt jedes
    // Fluss-Band das Mittel seiner Kronen-Blende über die Fläche (\`flussAbdruck\`, je Segment sein Spiegel).
    const uf = { see: 0, fluss: null, ufer: 0 };
    waterLevelAt(x, z, uf);
    const ab = fussM > 0 ? flussAbdruck(x, z, fussM) : null;
    const aboveWater = y - uf.see;
    const aboveFluss = !ab && uf.fluss !== null ? y - uf.fluss : null;
    let schlick = ss(-0.5, -4, aboveWater);
    if (aboveFluss !== null) schlick = Math.max(schlick, uf.ufer * ss(-0.5, -4, aboveFluss));
    const imStrand = (a) => a !== null && a > -1.3 && a < 2.5;
    let flussStrand = false;
    if (ab)
        for (let i = 0; i < ab.n; i++) {
            schlick = Math.max(schlick, ab.mu[i] * ss(-0.5, -4, y - ab.sp[i]));
            if (ab.mu[i] > 0 && imStrand(y - ab.sp[i])) flussStrand = true;
        }
    mix(P.sediment, schlick);
    if (imStrand(aboveWater) || (uf.ufer > 0 && imStrand(aboveFluss)) || flussStrand) {
        const widthNoise = (sandNoise.noise2D(x * 0.0018, z * 0.0018) + 1) * 0.5;
        const intenseNoise = (sandNoise.noise2D(x * 0.0034 + 17, z * 0.0034 - 9) + 1) * 0.5;
        if (widthNoise > 0.18) {
            const width = 0.5 + 1.4 * widthNoise;
            const intensity = 0.25 + 0.55 * intenseNoise;
            const glocke = (a) => Math.max(0, 1 - Math.abs(a - 0.6) / width);
            let shoreBlend = glocke(aboveWater);
            if (aboveFluss !== null) shoreBlend = Math.max(shoreBlend, uf.ufer * glocke(aboveFluss));
            if (ab) for (let i = 0; i < ab.n; i++) shoreBlend = Math.max(shoreBlend, ab.mu[i] * glocke(y - ab.sp[i]));
            mix(P.sand, shoreBlend * intensity);
        }
    }
    // die PFADE: die Fluss-Bänke als getrampelte, gepackte Erde
    const pathF = pathFieldAt(x, z, y, fussM);
    if (pathF > 0.01) mix(P.dirt, pathF * 0.6);
    // DER WIESEN-GRUND (K53): wo die Wache Grün sagt, deckt das Mittel des Halms den Grund; die Fläche, die den Fleck nicht
    // auflöst (\`fussM\`), trägt sein Mittel.
    const gruen = ss(0, WG.schwelle, c[1] - 0.5 * (c[0] + c[2]));
    if (gruen > 0) {
        let fleck = (sandNoise.noise2D(x * 0.13 + 5.3, z * 0.13 - 2.9) + 1) * 0.5;
        if (oktav) fleck += (0.5 - fleck) * oktav(fussM, WG.rauschM);
        mix(WG.farbe, gruen * (0.5 + 0.5 * fleck));
    }
    out[0] = c[0];
    out[1] = c[1];
    out[2] = c[2];
    return out;
}

// =============================================================================
// Water-Cells (Mirror von _buildVoxelChunkWaterCells, OHNE Architektur-Stempel)
// =============================================================================

function buildChunkWaterCells(ox, oy, oz, step, lod, density, saat = null) {
    const cfg = voxelChunkConfig(lod);
    const dim = cfg.dim;
    const dimY = cfg.dimY;
    const cells = new Uint8Array(dim * dim * dimY);
    const band = state.hydroBand;
    const bandTop = band ? band.top : Infinity;
    const Nx = dim + 4;
    const Ny = dimY + 1;
    const NxNy = Nx * Ny;
    // V13.8 — verbundenes Wasser via 3D-Flood-Fill (Mirror von `_buildVoxelChunk-
    // WaterCells`, V9.89-Disziplin). Ersetzt per-Spalten-Klassifikation + airAbove-
    // Pass: füllt NUR Zellen, die durch nicht-soliden Raum unter dem Body-Spiegel
    // mit einer echten Atlas-Quelle VERBUNDEN sind → kein Bergwand-Bluten, keine
    // Unterwasser-Luftblasen. Seeds aus dem globalen Atlas (in-chunk + OOB-Ring) →
    // seam-frei. Der Architektur-Stempel bleibt Main-only (kein State im Worker).
    const dimSq = dim * dim;
    const cellD = (i, j, k) => {
        const a = j * Nx + (k + 1) * NxNy;
        const b = (j + 1) * Nx + (k + 1) * NxNy;
        const c = j * Nx + (k + 2) * NxNy;
        const e = (j + 1) * Nx + (k + 2) * NxNy;
        const i1 = i + 1;
        const i2 = i + 2;
        return (
            (density[i1 + a] +
                density[i2 + a] +
                density[i1 + b] +
                density[i2 + b] +
                density[i1 + c] +
                density[i2 + c] +
                density[i1 + e] +
                density[i2 + e]) *
            0.125
        );
    };
    let jMax = Math.floor((bandTop - oy) / step);
    if (jMax >= dimY) jMax = dimY - 1;
    for (let j = 0; j <= jMax; j++) {
        const baseJ = j * dimSq;
        for (let k = 0; k < dim; k++) {
            const baseK = k * dim;
            for (let i = 0; i < dim; i++) {
                if (cellD(i, j, k) > 0) cells[i + baseK + baseJ] = CELL_STATE.SOLID;
            }
        }
    }
    const WATER = CELL_STATE.WATER;
    const AIR = CELL_STATE.AIR;
    // Welle H (mirror): AQUIFER — tiefe Höhlen-Zellen über dem Wassertisch trocken.
    const aquiferY = typeof state.waterLevel === "number" ? state.waterLevel : 0;
    const colSurf = new Float64Array(dim * dim);
    for (let k = 0; k < dim; k++) {
        const cz = oz + (k + 0.5) * step;
        for (let i = 0; i < dim; i++) colSurf[i + k * dim] = G.hoehe(state, ox + (i + 0.5) * step, cz, true);
    }
    // Fels über der Zelle (Mirror, ohne Bau-Stempel): unter offenem Himmel ist eine Zelle nie Höhle (`aquiferTrocken`).
    const colFels = new Float64Array(dimSq).fill(-Infinity);
    for (let idx0 = 0; idx0 < dimSq; idx0++) {
        for (let j = jMax; j >= 0; j--) {
            if (cells[idx0 + j * dimSq] !== CELL_STATE.SOLID) continue;
            colFels[idx0] = oy + j * step;
            break;
        }
    }
    const caveDry = (i, k, cy) => aquiferTrocken(cy, colSurf[i + k * dim], aquiferY, cy < colFels[i + k * dim]);
    // DER BODEN JE SPALTE (Mirror): der tiefste Null-Durchgang der Dichte an den vier Ecken der Spalte.
    const colBoden = new Float64Array(dimSq);
    {
        const jTop = Math.min(dimY, jMax + 1);
        for (let k = 0; k < dim; k++) {
            for (let i = 0; i < dim; i++) {
                let b = Infinity;
                let gelaende = false;
                for (let e = 0; e < 4; e++) {
                    const g = i + 1 + (e & 1) + (k + 1 + (e >> 1)) * NxNy;
                    for (let j = jTop; j >= 0; j--) {
                        const dS = density[g + j * Nx];
                        if (!(dS > 0)) continue;
                        gelaende = true;
                        const dD = j + 1 <= dimY ? density[g + (j + 1) * Nx] : 1;
                        if (dD <= 0) b = Math.min(b, oy + j * step + (step * dS) / (dS - dD));
                        break;
                    }
                }
                colBoden[i + k * dim] = gelaende ? b : colSurf[i + k * dim];
            }
        }
    }
    // U-W1/U-W3 (mirror von _buildVoxelChunkWaterCells; MUSS bit-identisch):
    // die EINE kanonische Wasserspiegel-Höhe colL PRO SPALTE (terrain-gated mit dem Boden der Spalte, gefragt an der
    // Mitte und den vier Ecken) + jede Zelle füllt nur bis colL[ihre Spalte] — kein propagierter Quell-Spiegel,
    // keine Über-Füllung; BFS-Konnektivität bleibt.
    const colL = new Float64Array(dimSq);
    const colSrc = new Uint8Array(dimSq);
    const spalteL = (i, k, boden) => {
        let l = atlasWaterLevelAt(ox + (i + 0.5) * step, oz + (k + 0.5) * step, boden);
        for (let e = 0; e < 4; e++) {
            const le = atlasWaterLevelAt(ox + (i + (e & 1)) * step, oz + (k + (e >> 1)) * step, boden);
            if (le > l) l = le;
        }
        return l;
    };
    for (let k = 0; k < dim; k++) {
        for (let i = 0; i < dim; i++) {
            const idx0 = i + k * dim;
            colL[idx0] = spalteL(i, k, colBoden[idx0]);
            if (colL[idx0] === -Infinity)
                colL[idx0] = schnittSpiegel(ox + (i + 0.5) * step, oz + (k + 0.5) * step, step);
            colSrc[idx0] = spalteL(i, k, Infinity) > -Infinity ? 1 : 0;
        }
    }
    for (let k = 0; k < dim; k++) {
        const cz = oz + (k + 0.5) * step;
        if (atlasWaterLevelAt(ox - 0.5 * step, cz, Infinity) > -Infinity) colSrc[0 + k * dim] = 1;
        if (atlasWaterLevelAt(ox + (dim + 0.5) * step, cz, Infinity) > -Infinity) colSrc[dim - 1 + k * dim] = 1;
    }
    for (let i = 0; i < dim; i++) {
        const cxw = ox + (i + 0.5) * step;
        if (atlasWaterLevelAt(cxw, oz - 0.5 * step, Infinity) > -Infinity) colSrc[i + 0 * dim] = 1;
        if (atlasWaterLevelAt(cxw, oz + (dim + 0.5) * step, Infinity) > -Infinity) colSrc[i + (dim - 1) * dim] = 1;
    }
    // Reaktive Flut über die Chunkgrenze (Mirror von `_buildVoxelChunkWaterCells`, MUSS bit-identisch): die Flut-Saat der
    // Nachbarn (Main `_flutSaat`: je Rand-Spalte West · Ost · Nord · Süd, ob die angrenzende Spalte des Nachbarn nass ist)
    // seedet den OOB-Ring auch aus den nassen Nachbar-ZELLEN — ein Carve-Kanal läuft über die Naht.
    if (saat)
        for (let q = 0; q < dim; q++) {
            if (saat[q]) colSrc[0 + q * dim] = 1;
            if (saat[dim + q]) colSrc[dim - 1 + q * dim] = 1;
            if (saat[2 * dim + q]) colSrc[q + 0 * dim] = 1;
            if (saat[3 * dim + q]) colSrc[q + (dim - 1) * dim] = 1;
        }
    // V18.125 — KÜSTEN-AQUIFER (Mirror von `_buildVoxelChunkWaterCells`, MUSS
    // bit-identisch): jede Atlas-lose Spalte, deren himmel-offenes ECHTES
    // Terrain (erste SOLID-Zelle von oben) klar unter dem Wassertisch liegt,
    // wird Aquifer-Quelle. Begründung + Messung im Main-Kommentar.
    const SHELF_MIN_DEPTH = 1.0;
    for (let k = 0; k < dim; k++) {
        const baseK = k * dim;
        for (let i = 0; i < dim; i++) {
            const idx0 = i + baseK;
            if (colSrc[idx0]) continue;
            const lvl0 = colL[idx0];
            if (lvl0 > -Infinity && lvl0 > aquiferY + 1e-6) continue;
            let topJ = -1;
            for (let j = jMax; j >= 0; j--) {
                if (cells[idx0 + j * dimSq] === CELL_STATE.SOLID) {
                    topJ = j;
                    break;
                }
            }
            if (topJ < 0) continue;
            const topCy = oy + (topJ + 0.5) * step;
            if (topCy < aquiferY - SHELF_MIN_DEPTH) {
                colL[idx0] = lvl0 > -Infinity ? lvl0 : aquiferY;
                colSrc[idx0] = 1;
            }
        }
    }
    const queue = [];
    const seedColumn = (i, k) => {
        const idx0 = i + k * dim;
        if (!colSrc[idx0]) return;
        const lvl = colL[idx0];
        if (!(lvl > -Infinity)) return;
        const baseK = k * dim;
        for (let j = 0; j <= jMax; j++) {
            const cy = oy + (j + 0.5) * step;
            if (cy > lvl) break;
            const cidx = i + baseK + j * dimSq;
            if (cells[cidx] === AIR && !caveDry(i, k, cy)) {
                cells[cidx] = WATER;
                queue.push(cidx);
            }
        }
    };
    for (let k = 0; k < dim; k++) for (let i = 0; i < dim; i++) seedColumn(i, k);
    const pushN = (ni, nk, nj) => {
        if (ni < 0 || nk < 0 || ni >= dim || nk >= dim || nj < 0 || nj > jMax) return;
        const cy = oy + (nj + 0.5) * step;
        if (cy > colL[ni + nk * dim]) return;
        const nidx = ni + nk * dim + nj * dimSq;
        if (cells[nidx] === AIR && !caveDry(ni, nk, cy)) {
            cells[nidx] = WATER;
            queue.push(nidx);
        }
    };
    for (let qh = 0; qh < queue.length; qh++) {
        const cidx = queue[qh];
        const j = (cidx / dimSq) | 0;
        const rem = cidx - j * dimSq;
        const k = (rem / dim) | 0;
        const i = rem - k * dim;
        pushN(i + 1, k, j);
        pushN(i - 1, k, j);
        pushN(i, k + 1, j);
        pushN(i, k - 1, j);
        pushN(i, k, j + 1);
        pushN(i, k, j - 1);
    }
    // 4b) DIE DECK-ZELLE (Mirror von `_buildVoxelChunkWaterCells` 4b, MUSS bit-identisch): eine Spalte, deren Spiegel über
    //    ihrem Boden und unter der Mitte ihrer ersten freien Zelle liegt, trägt ihr Wasser in dieser Zelle — eine Quell-Spalte
    //    immer, eine Ufer-Spalte, wenn sie an Wasser grenzt.
    const deckZelle = (i, k) => {
        const idx0 = i + k * dim;
        const lvl = colL[idx0];
        if (!(lvl > -Infinity)) return -1;
        let topJ = -1;
        for (let j = jMax; j >= 0; j--) {
            const c = cells[idx0 + j * dimSq];
            if (c === AIR) continue;
            if (c === CELL_STATE.SOLID) topJ = j;
            break;
        }
        if (topJ < 0 || topJ + 1 > jMax) return -1;
        const deckIdx = idx0 + (topJ + 1) * dimSq;
        const topCy = oy + (topJ + 0.5) * step;
        if (cells[deckIdx] !== AIR || topCy + step <= lvl || !(lvl > topCy - 0.5 * step)) return -1;
        if (!(cellD(i, topJ, k) > 0) || !(lvl > colBoden[idx0])) return -1;
        return deckIdx;
    };
    const nassOben = new Uint8Array(dimSq);
    const offen = [];
    for (let idx0 = 0; idx0 < dimSq; idx0++) {
        for (let j = jMax; j >= 0; j--) {
            const c = cells[idx0 + j * dimSq];
            if (c === AIR) continue;
            if (c === WATER) {
                nassOben[idx0] = 1;
                offen.push(idx0);
            }
            break;
        }
    }
    for (let idx0 = 0; idx0 < dimSq; idx0++) {
        if (!colSrc[idx0] || nassOben[idx0]) continue;
        const d = deckZelle(idx0 % dim, (idx0 / dim) | 0);
        if (d < 0) continue;
        cells[d] = WATER;
        nassOben[idx0] = 1;
        offen.push(idx0);
    }
    for (let h = 0; h < offen.length; h++) {
        const i = offen[h] % dim;
        const k = (offen[h] / dim) | 0;
        for (const [ni, nk] of [
            [i + 1, k],
            [i - 1, k],
            [i, k + 1],
            [i, k - 1],
        ]) {
            if (ni < 0 || nk < 0 || ni >= dim || nk >= dim) continue;
            const n0 = ni + nk * dim;
            if (nassOben[n0]) continue;
            const d = deckZelle(ni, nk);
            if (d < 0) continue;
            cells[d] = WATER;
            nassOben[n0] = 1;
            offen.push(n0);
        }
    }
    // 5) ROBUSTE 3D-KONNEKTIVITÄT (V13.14, Mirror von `_skyOpenWaterFilter`):
    //    Wasser existiert nur, wo es durch Wasser mit der offenen Atmosphäre
    //    verbunden ist. Ersetzt den per-Spalten-Trocken-Pass (V13.12), der
    //    Überhang-Buchten fälschlich trocknete. MUSS bit-identisch zum Main
    //    sein (Determinismus → keine Naht worker/main).
    skyOpenWaterFilter(cells, dim, dimY, jMax);
    // ARCHITEKTUR-STEMPEL läuft NICHT im Worker — bleibt Main-only
    // (Architektur-State ist nicht im Worker-Snapshot, soll auch nicht sein).
    return cells;
}

// Mirror von `AnazhRealm._aquiferTrocken` (bit-identisch): trockene Höhle nur unter Fels, tiefer als 18 m
// (AnazhRealm.AQUIFER_TIEFE_M) unter der Makro-Fläche und über dem Wassertisch.
function aquiferTrocken(cy, makroY, tischY, unterFels) {
    return unterFels && cy < makroY - 18 && cy > tischY;
}

// V13.14 — Worker-Mirror von `_skyOpenWaterFilter` (bit-identisch). Siehe den
// ausführlichen Kommentar im Stamm. Zwei Floods: (A) Sky-Air vom Dach,
// (B) Keep = WATER an Sky-Air oder durch Wasser damit verbunden; Rest -> AIR.
function skyOpenWaterFilter(cells, dimC, dimYC, jMaxC) {
    const AIR = CELL_STATE.AIR;
    const WATER = CELL_STATE.WATER;
    const SOLID = CELL_STATE.SOLID;
    const dq = dimC * dimC;
    const topJ = dimYC - 1;
    const skyAir = new Uint8Array(dq * dimYC);
    const stack = [];
    for (let k = 0; k < dimC; k++) {
        for (let i = 0; i < dimC; i++) {
            const idx = i + k * dimC + topJ * dq;
            if (cells[idx] === AIR) {
                skyAir[idx] = 1;
                stack.push(idx);
            }
        }
    }
    const tryAir = (ni, nk, nj) => {
        if (ni < 0 || nk < 0 || ni >= dimC || nk >= dimC || nj < 0 || nj >= dimYC) return;
        const nidx = ni + nk * dimC + nj * dq;
        if (skyAir[nidx] || cells[nidx] !== AIR) return;
        skyAir[nidx] = 1;
        stack.push(nidx);
    };
    while (stack.length) {
        const idx = stack.pop();
        const j = (idx / dq) | 0;
        const rem = idx - j * dq;
        const k = (rem / dimC) | 0;
        const i = rem - k * dimC;
        tryAir(i + 1, k, j);
        tryAir(i - 1, k, j);
        tryAir(i, k + 1, j);
        tryAir(i, k - 1, j);
        tryAir(i, k, j + 1);
        tryAir(i, k, j - 1);
    }
    const keep = new Uint8Array(dq * dimYC);
    const wstack = [];
    const hasSkyNbr = (i, k, j, idx) =>
        (j < topJ && skyAir[idx + dq]) ||
        (j > 0 && skyAir[idx - dq]) ||
        (i + 1 < dimC && skyAir[idx + 1]) ||
        (i > 0 && skyAir[idx - 1]) ||
        (k + 1 < dimC && skyAir[idx + dimC]) ||
        (k > 0 && skyAir[idx - dimC]);
    for (let j = 0; j <= jMaxC; j++) {
        for (let k = 0; k < dimC; k++) {
            for (let i = 0; i < dimC; i++) {
                const idx = i + k * dimC + j * dq;
                if (cells[idx] === WATER && !keep[idx] && hasSkyNbr(i, k, j, idx)) {
                    keep[idx] = 1;
                    wstack.push(idx);
                }
            }
        }
    }
    const tryWater = (ni, nk, nj) => {
        if (ni < 0 || nk < 0 || ni >= dimC || nk >= dimC || nj < 0 || nj > jMaxC) return;
        const nidx = ni + nk * dimC + nj * dq;
        if (keep[nidx] || cells[nidx] !== WATER) return;
        keep[nidx] = 1;
        wstack.push(nidx);
    };
    while (wstack.length) {
        const idx = wstack.pop();
        const j = (idx / dq) | 0;
        const rem = idx - j * dq;
        const k = (rem / dimC) | 0;
        const i = rem - k * dimC;
        tryWater(i + 1, k, j);
        tryWater(i - 1, k, j);
        tryWater(i, k + 1, j);
        tryWater(i, k - 1, j);
        tryWater(i, k, j + 1);
        tryWater(i, k, j - 1);
    }
    for (let idx = 0; idx < cells.length; idx++) {
        if (cells[idx] === WATER && !keep[idx]) cells[idx] = AIR;
    }
    void SOLID;
}

// Trocken-Gate-Mirror (Atlas-Strict, V9.87). Wenn false → keine Cells nötig.
function chunkHasAnyWater(cx, cz, lod) {
    const cfg = voxelChunkConfig(lod);
    const span = cfg.span;
    const ox = cx * span;
    const oz = cz * span;
    const waterLevel = typeof state.waterLevel === "number" ? state.waterLevel : 0;
    const edits = editsNah(cx, cz);
    if (edits.length) {
        for (let e = 0; e < edits.length; e++) {
            const ed = edits[e];
            if (!ed || ed.mode !== "carve") continue;
            const r = ed.r;
            if (!Number.isFinite(r) || r <= 0) continue;
            if (ed.y - r >= waterLevel) continue;
            if (ed.x + r < ox || ed.x - r > ox + span) continue;
            if (ed.z + r < oz || ed.z - r > oz + span) continue;
            return true;
        }
    }
    const hHome = state.hydrosphere;
    if (!hHome || !hHome.ready) return false;
    // A3 (V18.132) — Mirror des Main-Umbaus: alle Regionen des Footprints.
    const regions = [];
    for (const pp of [
        [ox, oz],
        [ox + span, oz],
        [ox, oz + span],
        [ox + span, oz + span],
    ]) {
        const hr = hydroFor(pp[0], pp[1]);
        if (hr && hr.ready && regions.indexOf(hr) < 0) regions.push(hr);
    }
    for (const h of regions) {
        if (h.water && h.water.waterKind) {
            const c0i = Math.floor((ox - h.originX) / h.cell) - 1;
            const c1i = Math.floor((ox + span - h.originX) / h.cell) + 1;
            const c0j = Math.floor((oz - h.originZ) / h.cell) - 1;
            const c1j = Math.floor((oz + span - h.originZ) / h.cell) + 1;
            const wK = h.water.waterKind;
            for (let cj = c0j; cj <= c1j; cj++) {
                for (let ci = c0i; ci <= c1i; ci++) {
                    if (ci < 0 || cj < 0 || ci >= h.dim || cj >= h.dim) continue;
                    const kind = wK[ci + cj * h.dim];
                    if (kind === 1 || kind === 2) return true;
                }
            }
        }
        if (h.kanal) {
            const b0i = Math.floor((ox - h.originX) / h.bucketSize);
            const b1i = Math.floor((ox + span - h.originX) / h.bucketSize);
            const b0j = Math.floor((oz - h.originZ) / h.bucketSize);
            const b1j = Math.floor((oz + span - h.originZ) / h.bucketSize);
            for (let bj = b0j; bj <= b1j; bj++) {
                for (let bi = b0i; bi <= b1i; bi++) {
                    if (bi < 0 || bj < 0 || bi >= h.bucketsDim || bj >= h.bucketsDim) continue;
                    const kb = bi + bj * h.bucketsDim;
                    if (h.kanal.ab[kb + 1] > h.kanal.ab[kb]) return true;
                }
            }
        }
    }
    // (4) V17.117 (H3) + V18.125 — Mirror des MAKRO-DIP-Predicates (siehe
    // `_voxelChunkHasAnyWater`): globaler Ozean beyond-region UND der Küsten-
    // Aquifer in-region. Bit-identisch zum Main.
    const OCEAN_GATE_MARGIN = 16;
    {
        const thr = waterLevel + OCEAN_GATE_MARGIN;
        for (let gj = 0; gj <= 4; gj++) {
            for (let gi = 0; gi <= 4; gi++) {
                const sx = ox + (gi / 4) * span;
                const sz = oz + (gj / 4) * span;
                if (G.hoehe(state, sx, sz, true) < thr) return true;
            }
        }
    }
    return false;
}

// =============================================================================
// Voller Chunk-Build (Iso-Mesh + Cells + Colors)
// =============================================================================

// Das grobe Netz der Stufe `grobLod` um den Chunk-Ursprung (ox, oz) mit einer Zelle Polster vor der Kante — derselbe Bau wie der
// Chunk jener Stufe samt Normale und Stoff (Feld-Farbe, Himmels-Sicht, Fels) — und je feinem Vertex sein Ziel darauf: Lage,
// Normale, Farbe (Spiegel von `_stufeZielNetz` im Stamm, dasselbe Gesetz `stufeZiel` aus gelaende-core).
function stufeZielNetz(fein, feinNormal, feinFarbe, ox, oy, oz, grobLod) {
    const g = voxelChunkConfig(grobLod);
    const gs = g.step;
    const gox = ox - 2 * gs;
    const goz = oz - 2 * gs;
    const gd = g.dim + 4;
    const leer = () =>
        G.stufeZiel(fein, new Float32Array(0), new Uint32Array(0), gs, [
            { fein: feinNormal, grob: new Float32Array(0), einheit: true },
            { fein: feinFarbe, grob: new Float32Array(0) },
        ]);
    const dichte = computeDensityGrid(gox, oy, goz, gd, g.dimY, gd, gs);
    const sv = extractSurfaceVertices(dichte, gox, oy, goz, gd, g.dimY, gd, gs);
    if (sv.positions.length === 0) return leer();
    const hoehle = hoehlenGraph(dichte, gox, oy, goz, gd, g.dimY, gd, gs);
    const triZelle = [];
    const idx = emitQuadIndices(dichte, sv.cellVert, gd, g.dimY, gd, hoehle.lab, triZelle);
    laplacianSmoothPositions(sv.positions, idx, 1, sv.sharp);
    cropPad(sv.positions, idx, sv.vertCells, gd, gd, 1, triZelle);
    if (sv.positions.length === 0) return leer();
    const normalen = gradientNormals(sv.positions, dichte, gox, oy, goz, gs, gd + 1, g.dimY + 1, gd + 1);
    const lage = new Float32Array(sv.positions);
    const farben = attachFieldColors(lage);
    const iU = new Uint32Array(idx);
    const nV = lage.length / 3;
    const himmel = G.himmelsSicht(iU, Int32Array.from(triZelle), nV, gs);
    const FS = state.felsStoff;
    G.felsStoff(state, FS.basis, FS.netz, lage, normalen, iU, himmel, farben, nV, feuchteAt);
    return G.stufeZiel(fein, lage, iU, gs, [
        { fein: feinNormal, grob: normalen, einheit: true },
        { fein: feinFarbe, grob: farben },
    ]);
}

function buildChunkMesh(cx, cz, lod, saat = null) {
    const cfg = voxelChunkConfig(lod);
    const { dim, step, span, dimY, floorDrop } = cfg;
    const base = state.baseHeight || 0;
    const ox = cx * span;
    const oz = cz * span;
    const oy = base - floorDrop;
    // Pad+Crop: sample bei (ox-step, oz-step), dim+3, cropMargin=1.
    const sampleOx = ox - step;
    const sampleOz = oz - step;
    const sampleDimX = dim + 3;
    const sampleDimY = dimY;
    const sampleDimZ = dim + 3;
    const Nx = sampleDimX + 1;
    const Ny = sampleDimY + 1;
    const Nz = sampleDimZ + 1;
    // Density-Grid einmal samplen — über die EINE Band-Skip-Quelle `computeDensityGrid`
    // (Mirror von `_voxelSampleDensityGrid`): nur das Oberflächen-Band ruft terrainDensityAt,
    // fern davon konstant ±1 (keine Iso → kein Sign-Change). BYTE-IDENTISCH zur Vollauswertung
    // (diag-chunk-band: maxDiff 0 über position/normal/color/index), aber ~3× weniger Noise-Calls
    // (der teure Posten). VORHER duplizierte buildChunkMesh die volle k·j·i-Schleife, während der
    // Main-Mesh-Pfad (_buildVoxelChunkData) längst band-skippt — das schliesst die Worker-Divergenz
    // (eine Quelle, kein Parallelpfad; identische Indizierung i + j·Nx + k·Nx·Ny).
    const density = computeDensityGrid(sampleOx, oy, sampleOz, sampleDimX, sampleDimY, sampleDimZ, step);
    // Surface-Nets-Mesh aufbauen.
    const { positions, vertCells, cellVert, sharp } = extractSurfaceVertices(
        density,
        sampleOx,
        oy,
        sampleOz,
        sampleDimX,
        sampleDimY,
        sampleDimZ,
        step
    );
    if (positions.length === 0) return { empty: true };
    // Die Höhlen-Schicht (Welle 7): der Sicht-Graph aus demselben Gitter, je Dreieck die Zelle seiner Luft.
    const hoehle = hoehlenGraph(density, sampleOx, oy, sampleOz, sampleDimX, sampleDimY, sampleDimZ, step);
    const triZelle = [];
    const indices = emitQuadIndices(density, cellVert, sampleDimX, sampleDimY, sampleDimZ, hoehle.lab, triZelle);
    laplacianSmoothPositions(positions, indices, 1, sharp);
    cropPad(positions, indices, vertCells, sampleDimX, sampleDimZ, 1, triZelle);
    // DER BODEN FÄLLT IM GRUND DES HAUSES (S4, gelaende-core `erdbauSchnitt`): vor Normalen, Stoff und Stufen-Ziel
    G.erdbauSchnitt(state.erdbau, positions, indices, triZelle);
    if (positions.length === 0) return { empty: true };
    const normals = gradientNormals(positions, density, sampleOx, oy, sampleOz, step, Nx, Ny, Nz);
    // V9.91 — positions VOR colors zu Float32 konvertieren. Sonst rechnet
    // `attachFieldColors` mit Float64-Werten, Main hat aber Float32 (via
    // THREE.Float32BufferAttribute) — sub-pixel Float-Drift bei colors
    // (maxDelta ~1.19e-7, der Float32-Epsilon). Float32-First erzwingt
    // identische Eingangs-Werte für die Color-Mix-Pipeline.
    const positionsF32 = new Float32Array(positions);
    const colors = attachFieldColors(positionsF32);
    // DER STOFF ENTSTEHT, WO DAS NETZ ENTSTEHT (K17-2): Himmels-Sicht, Fels-Stoff (in `colors`) und Schutt aus dem EINEN
    // Gelände-Kern — derselbe Code wie im Sync-Bau des Mains (`_felsStoff`), der Main setzt nur die Attribute. Bis K17-2 rechnete
    // der Main ihn je Chunk nach (Mess-Wiese Σ 59,4 ms je Ring).
    const FS = state.felsStoff;
    if (!FS) throw new Error("buildChunkMesh: der Fels-Stoff fehlt im Worker-Zustand (felsStoff)");
    const indicesU32 = new Uint32Array(indices);
    const hTri = Int32Array.from(triZelle);
    const nV = positionsF32.length / 3;
    const himmel = G.himmelsSicht(indicesU32, hTri, nV, step);
    const fels = G.felsStoff(
        state,
        FS.basis,
        FS.netz,
        positionsF32,
        normals,
        indicesU32,
        himmel,
        colors,
        nV,
        feuchteAt
    );
    // DAS ZIEL DER GRÖBEREN STUFE (K51-2, Geomorph nach CDLOD): das Netz der Stufe lod+1 desselben Orts, eine grobe Zelle
    // weiter nach unten gepolstert (das Gitter beginnt zwei grobe Schritte vor dem Chunk, der Crop behält die Zelle vor der
    // Kante — sie ist die Saum-Zelle des unteren Nachbarn, so trifft jeder geteilte Vertex in beiden Chunks dieselbe Fläche),
    // sonst derselbe Bau wie der Chunk der Stufe lod+1; je Vertex sein Ziel samt Normale und Stoff-Farbe (gelaende-core
    // `stufeZiel`). Stufe 3 ist die gröbste.
    const stufe = lod < 3 ? stufeZielNetz(positionsF32, normals, colors, ox, oy, oz, lod + 1) : null;
    // V9.93 (Wasser-LOD-Naht-Heilung): Wasser-Cells IMMER LOD 0 für naht-
    // freie Wasseroberflächen über LOD-Boundaries hinweg. Für LOD-0-Chunks
    // teilen wir die schon gesampelte `density` (V9.81-Sharing wirkt). Für
    // LOD-1-Chunks samplen wir ein zweites Density-Grid bei LOD 0 (98k
    // Vertices statt 16k) — Mehrkosten bounded durch V9.87-Atlas-Strict-
    // Gate (Hochland-LOD-1-Chunks haben kein Wasser, kein Mehraufwand).
    let waterCells;
    if (chunkHasAnyWater(cx, cz, lod)) {
        if (lod === 0) {
            waterCells = buildChunkWaterCells(ox, oy, oz, step, 0, density, saat);
        } else {
            const lod0Cfg = voxelChunkConfig(0);
            const lod0SampleDimX = lod0Cfg.dim + 3;
            const lod0SampleDimY = lod0Cfg.dimY;
            const lod0SampleDimZ = lod0Cfg.dim + 3;
            const lod0Ox = ox - lod0Cfg.step;
            const lod0Oz = oz - lod0Cfg.step;
            // Dieselbe Band-Skip-Quelle (s.o.) — byte-identisch, ~3× weniger Noise-Calls.
            const lod0Density = computeDensityGrid(
                lod0Ox,
                oy,
                lod0Oz,
                lod0SampleDimX,
                lod0SampleDimY,
                lod0SampleDimZ,
                lod0Cfg.step
            );
            waterCells = buildChunkWaterCells(ox, oy, oz, lod0Cfg.step, 0, lod0Density, saat);
        }
    } else {
        waterCells = new Uint8Array(0); // sentinel: chunk has no water
    }
    return {
        empty: false,
        positions: positionsF32,
        stufeZiel: stufe ? stufe.ziel : null,
        normalZiel: stufe ? stufe.felder[0] : null,
        farbeZiel: stufe ? stufe.felder[1] : null,
        indices: indicesU32,
        normals,
        colors,
        himmel,
        schutt: fels.schutt,
        felsFeuchte: fels.feuchte,
        waterCells,
        hTri,
        hN: hoehle.n,
        hKnoten: hoehle.knoten,
        hMuend: hoehle.muend,
        hSeiten: hoehle.seiten,
        hKanten: hoehle.kanten,
        hRand: hoehle.rand,
    };
}

// =============================================================================
// DIE FERNE IM FADEN (B2): der Horizont entsteht hier, nicht im Haupt-Faden. Der Fern-Ring, der Feld-Pass und die Fern-
// Krone des nahen Bodens fragen je Auftrag (`type: "fern"`, `art`: ring · feld · krone · teile) das EINE Gelände-
// Gesetzbuch (Höhe, Schutt) und die EINE Fern-Farbe (Boden unter dem Kronendach, Deckung, Fluss-Anteil) an DEMSELBEN
// Zustand wie jeder Chunk; zurück reisen die Zahlen per Transfer (Lehre 24). Was die Farbe aus dem Haupt-Faden liest
// (die Studio-Laubfarbe der Arten, der Wasser-Körper, die Saison, der Meeresspiegel), reist als Eingabe mit dem Auftrag.
// Bis B2 rechnete der Haupt-Faden all das selbst (Radeon kalt bis zum ersten Bild 3,89 s in `_tickFernRing`, Spike B1).
// =============================================================================

// DER KASTEN QUER ZUM FLUSS (Mirror `AnazhRealm._kastenMittel`): das Mittel eines Ufer-Bands b(|u|) über [d − F/2, d + F/2]
// aus der Stammfunktion des Bands C(s) = ∫₀ˢ b — exakt für ein gerades Segment, stetig in d.
function kastenMittel(C, d, F, p, q, r, s) {
    const a = d - F / 2;
    const b = d + F / 2;
    return (a >= 0 ? C(b, p, q, r, s) - C(a, p, q, r, s) : C(b, p, q, r, s) + C(-a, p, q, r, s)) / F;
}
// die Kronen-Blende: 1 bis zur Kanal-Kante `hw`, smoothstep auf 0 über `kappa` bis zur Krone
function stammUfer(s, hw, kappa) {
    let w = (s - hw) / kappa;
    w = w < 0 ? 0 : w > 1 ? 1 : w;
    return Math.min(s, hw) + kappa * (w - w * w * w + (w * w * w * w) / 2);
}
// das Fluss-Band der Feuchte: 1 bis `inner`, smoothstep auf 0 über `reich`
function stammFeuchte(s, inner, reich) {
    const q = s < inner ? inner : s > inner + reich ? inner + reich : s;
    const v = (inner + reich - q) / reich;
    return Math.min(s, inner) + reich * (0.5 - v * v * v + (v * v * v * v) / 2);
}
// die Bank: (1 − (u − inner) / bank)² auf [inner, inner + bank]
function stammPfad(s, inner, bank) {
    let q = (s - inner) / bank;
    q = q < 0 ? 0 : q > 1 ? 1 : q;
    return (bank * (1 - (1 - q) * (1 - q) * (1 - q))) / 3;
}
// die Bank × die Kronen-Blende: auf [inner, Ende] ein Polynom 5. Grades — Gauß-Legendre mit drei Knoten ist exakt
function stammPfadUfer(s, inner, bank, hw, kappa) {
    const e = Math.min(s, inner + bank, hw + kappa);
    if (!(e > inner)) return 0;
    const m = (inner + e) / 2;
    const h = (e - inner) / 2;
    const f = (u) => {
        const b = 1 - (u - inner) / bank;
        let w = (u - hw) / kappa;
        w = w < 0 ? 0 : w > 1 ? 1 : w;
        return b * b * (1 - w * w * (3 - 2 * w));
    };
    const k = h * Math.sqrt(0.6);
    return h * ((5 / 9) * f(m - k) + (8 / 9) * f(m) + (5 / 9) * f(m + k));
}

// DIE FLÜSSE UNTER EINEM ABDRUCK (K16): je Segment in Reichweite (die Buckets bis F/2 weiter) Abstand, Halbbreite, Weite der
// Bank bis zur Krone, Spiegel und das Mittel der Kronen-Blende über den Abdruck — die Leser (Feuchte, Pfad, Schlick, Strand)
// falten ihre Bänder genauso und nehmen das Maximum der Segmente. Der Abdruck wächst ohne Kappe.
const flussAbdruckMemo = {
    x: NaN,
    z: NaN,
    F: NaN,
    h: null,
    bereit: false,
    n: 0,
    seg: [],
    dist: new Float64Array(32),
    hw: new Float64Array(32),
    kappa: new Float64Array(32),
    sp: new Float64Array(32),
    mu: new Float64Array(32),
};
function flussAbdruck(x, z, F) {
    const A = flussAbdruckMemo;
    const h = hydroFor(x, z);
    const bereit = !!(h && h.ready && h.kanal);
    if (A.x === x && A.z === z && A.F === F && A.h === h && A.bereit === bereit) return A;
    A.x = x;
    A.z = z;
    A.F = F;
    A.h = h;
    A.bereit = bereit;
    A.n = 0;
    if (!bereit) return A;
    const kanal = h.kanal;
    const reich = FEUCHTE_FLUSS_REICHWEITE;
    const bs = h.bucketSize;
    const bd = h.bucketsDim;
    const bi0 = Math.floor((x - h.originX) / bs);
    const bj0 = Math.floor((z - h.originZ) / bs);
    const nb = Math.ceil(F / 2 / bs);
    for (let bj = bj0 - nb; bj <= bj0 + nb; bj++) {
        if (bj < 0 || bj >= bd) continue;
        for (let bi = bi0 - nb; bi <= bi0 + nb; bi++) {
            if (bi < 0 || bi >= bd) continue;
            const kb = bj * bd + bi;
            for (let q = kanal.ab[kb]; q < kanal.ab[kb + 1]; q++) {
                const o = kanal.idx[q] * KANAL_FELDER;
                const ax = kanal.seg[o];
                const az = kanal.seg[o + 1];
                const bx = kanal.seg[o + 2];
                const bz = kanal.seg[o + 3];
                const hwA = kanal.seg[o + 4];
                const hwB = kanal.seg[o + 5];
                const dA = kanal.seg[o + 6];
                const dB = kanal.seg[o + 7];
                const sA = kanal.seg[o + 8];
                const sB = kanal.seg[o + 9];
                const ex = bx - ax;
                const ez = bz - az;
                const len2 = ex * ex + ez * ez || 1;
                let t = ((x - ax) * ex + (z - az) * ez) / len2;
                if (t < 0) t = 0;
                else if (t > 1) t = 1;
                const dist = Math.hypot(x - (ax + ex * t), z - (az + ez * t));
                const hw = hwA + (hwB - hwA) * t;
                const kappa = Math.max(1e-3, (dA + (dB - dA) * t) / state.hydroGesetz.bankNeigung);
                if (dist - F / 2 >= Math.max(Math.max(1, hw) + reich, hw + kappa)) continue;
                let schon = false;
                for (let k = 0; k < A.n; k++)
                    if (A.seg[k] === kanal.idx[q]) {
                        schon = true;
                        break;
                    }
                if (schon) continue;
                if (A.n === A.dist.length)
                    for (const key of ["dist", "hw", "kappa", "sp", "mu"]) {
                        const neu = new Float64Array(A[key].length * 2);
                        neu.set(A[key]);
                        A[key] = neu;
                    }
                const n = A.n++;
                A.seg[n] = kanal.idx[q];
                A.dist[n] = dist;
                A.hw[n] = hw;
                A.kappa[n] = kappa;
                A.sp[n] = sA + (sB - sA) * t;
                A.mu[n] = kastenMittel(stammUfer, dist, F, hw, kappa);
            }
        }
    }
    return A;
}

// Das Mittel des Magie-Flecks (ss(0,6, 0,85, Rauschen)) über die Verteilung des Rauschens selbst — 32 × 32 Proben, einmal je
// Rausch-Instanz (Mirror `_fleckMittel`).
let fleckMerk = null;
function fleckMittel(noise) {
    if (fleckMerk && fleckMerk.noise === noise) return fleckMerk.wert;
    let m = 0;
    for (let i = 0; i < 32; i++)
        for (let j = 0; j < 32; j++) {
            let t = ((noise.noise2D(i * 7.31 + 0.37, j * 7.31 + 0.71) + 1) * 0.5 - 0.6) / 0.25;
            t = t < 0 ? 0 : t > 1 ? 1 : t;
            m += t * t * (3 - 2 * t);
        }
    fleckMerk = { noise, wert: m / 1024 };
    return fleckMerk.wert;
}

// DIE KONSTANTEN DER FERNE: `state.fern` (Schnappschuss: FOREST, kronenSchatten, Schutt-Gewicht, Fels-Mittel, Gedächtnis)
// und je Auftrag die Laubfarbe der fünf Arten und der Wasser-Körper (`fernAuftrag`). Fehlt etwas, bricht die Ferne laut.
let fernLaub = null;
let fernWasser = null;
function fernK() {
    const K = state.fern;
    if (!K || !K.forest) throw new Error("Fern-Faden: die Konstanten der Ferne fehlen im Zustand (fern)");
    return K;
}

// DAS GEWICHT DES SCHUTTS aus EINEM Höhen-Ruf (Mirror `AnazhRealm._fernSchuttVon`): der Schutthang oder die Wand des Erdbaus.
function fernSchuttVon(aus) {
    const s = aus.schutt > 0 ? aus.schutt : 0;
    const w = aus.wand > 0 ? 1 / fernK().geoSchutt : 0;
    return w > s ? w : s;
}
const FERN_SCHUTT_AUS = { hang: 0, schutt: 0, wand: 0 };
function fernSchuttAt(x, z) {
    G.hoehe(state, x, z, false, FERN_SCHUTT_AUS);
    return fernSchuttVon(FERN_SCHUTT_AUS);
}
// DER SCHUTT DER FERNE (K17-2): der Boden zum Mittel des Fels-Stoffs gemischt und × das Mittel des Gerölls.
function fernSchutt(s, out) {
    if (typeof s !== "number" || s !== s) throw new Error("fernSchutt: das Gewicht des Schutts fehlt (" + s + ")");
    if (!(s > 0)) return out;
    const K = fernK();
    const ws = K.geoSchutt * s;
    const M = K.felsMittel;
    const k = 1 + (G.schuttMittel() - 1) * (s < 1 ? s : 1);
    for (let c = 0; c < 3; c++) out[c] = (out[c] + (M[c] - out[c]) * ws) * k;
    return out;
}

// DER FLUSS IN DER MASCHE (K16): der Anteil einer Masche (halbe Kante `hs` m; 0 = ein Punkt), den das Wasser eines Flusses
// deckt — Kasten-Filter des Querschnitts über das nächste Segment.
function fernFlussDeckung(x, z, hs, aus) {
    const fl = hydroDistAt(x, z);
    if (aus) aus.spiegel = fl.spiegel;
    if (!(fl.dist < Infinity)) return 0;
    const w = fl.halfW;
    if (!(hs > 0)) return fl.dist <= w ? 1 : 0;
    return Math.max(0, Math.min(fl.dist + hs, w) - Math.max(fl.dist - hs, -w)) / (2 * hs);
}
function fernFlussTeil(x, z, out, hs) {
    const c = fernFlussDeckung(x, z, hs);
    out[7] = c;
    if (c > 0) out[6] *= 1 - c;
    return out;
}

// DIE NÄSSE DER FERNE (K16): die Form des Gewässers, die die Dichte des Chunks trägt (Kanal, Damm, See-Becken — dieselbe
// Formel wie `terrainBaseDensityCol` bei y = 0), und sein Spiegel aus der EINEN Wasser-Wahrheit (`atlasWaterLevelAt`, der
// Körper ohne Fluss); vor der Hydrosphäre der Meeresspiegel.
function fernNass(x, z, law, wl, aus) {
    const h = state.hydrosphere;
    if (!h || !h.ready || state.hydroComputing) {
        aus.y = law;
        aus.spiegel = wl;
        return law < wl;
    }
    const edits = state.voxelEdits && state.voxelEdits.length ? G.editsAm(editKarteFrisch(), x, z) : null;
    const y = G.editHoehe(G.gewaesserForm(law, 0, hydrosphereCarveAt(x, z), hydrosphereLakeAt(x, z)), x, z, edits);
    aus.y = y;
    atlasWaterLevelAt(x, z, y, aus);
    aus.spiegel = aus.koerper;
    return y < aus.spiegel;
}

// Der ctx der Nische (phyto-core `forestNische`): die Feuchte unter demselben Abdruck (`fussM`).
let fernNischeCtxMerk = null;
function fernNischeCtx() {
    if (fernNischeCtxMerk && fernNischeCtxMerk.F === fernK().forest) return fernNischeCtxMerk;
    const ctx = {
        F: fernK().forest,
        baseH: 0,
        fussM: 0,
        fbm: forestFbm,
        feuchteAt: (px, pz, sy) => feuchteAt(px, pz, sy, ctx.fussM),
    };
    fernNischeCtxMerk = ctx;
    return ctx;
}

// DIE TEILE EINES FERN-PUNKTS: `out` = [Boden r, g, b · Kronendach r, g, b · Deckung · Wasser-Anteil] (linear). Das Kronendach
// ist die Studio-Laubfarbe der Arten, die der Wald-Generator HIER würfelt (phyto-core `forestNische`), × die Selbstbeschattung
// der Krone; die Deckung ist der gepflanzte Bestand (`forestKronenDeckung`). `fuss` = die Masche, für die der Punkt steht
// (dann das Mittel über sie, `fernFarbeMasche`); `fussM` die Kante einer Abtastung; `schutt` das Gewicht des Schutts aus dem
// Höhen-Ruf, der `y` gab (null: EIN eigener Ruf).
const FERN_KRONEN = [];
function fernFarbeTeile(x, y, z, out, fuss, fussM, schutt) {
    if (schutt == null) schutt = fernSchuttAt(x, z);
    if (fuss) return fernFlussTeil(x, z, fernFarbeMasche(x, y, z, out, fuss, schutt), Math.max(fuss.ht, fuss.hr));
    if (fussM === undefined) return fernFlussTeil(x, z, fernFarbeTeile(x, y, z, out, null, 0, schutt), 0);
    const core = self.__phytoCore;
    if (
        !core ||
        typeof core.forestNische !== "function" ||
        typeof core.forestBestand !== "function" ||
        typeof core.forestKronenDeckung !== "function"
    )
        throw new Error("Fern-Farbe: phyto-core forestNische/forestBestand/forestKronenDeckung fehlen (KERN-PFLICHT)");
    if (!fernLaub) throw new Error("Fern-Farbe: die Studio-Laubfarbe der Arten fehlt im Auftrag (laub)");
    bodenFarbe(x, y, z, out, fussM);
    fernSchutt(schutt, out);
    const K = fernK();
    const ctx = fernNischeCtx();
    const B = core.forestBestand(ctx.fbm, x, z, fussM > 0 ? fussM : 0);
    const sd = B.sd;
    ctx.baseH = state.baseHeight || 0;
    ctx.fussM = fussM > 0 ? fussM : 0;
    const N = core.forestNische(x, z, y, sd, ctx);
    const L = fernLaub;
    const w = [N.wF, N.wT, N.wE, N.wB, N.wW];
    const C = K.forest.crown;
    if (!FERN_KRONEN.length || FERN_KRONEN.C !== C) {
        FERN_KRONEN.length = 0;
        for (const art of ["baum_kiefer", "baum_tanne", "baum_eiche", "baum_birke", "baum_erle"])
            FERN_KRONEN.push([0, C[art]]);
        FERN_KRONEN.C = C;
    }
    for (let i = 0; i < 5; i++) FERN_KRONEN[i][0] = w[i];
    out[6] = core.forestKronenDeckung(sd, B.geburt, FERN_KRONEN, K.forest);
    const S = K.kronenSchatten;
    let summe = 0;
    let r = 0;
    let g = 0;
    let b = 0;
    for (let i = 0; i < 5; i++) {
        summe += w[i];
        r += w[i] * L[i][0];
        g += w[i] * L[i][1];
        b += w[i] * L[i][2];
    }
    const k = summe > 0 ? S / summe : 0;
    out[3] = r * k;
    out[4] = g * k;
    out[5] = b * k;
    return out;
}

// DER FUSSABDRUCK DER FERN-FARBE (K16): das Mittel der Masche (`fuss` = { ax, az, ht, hr }) aus 3 × 3 Abtastungen, isotrop über
// die längere Maschen-Seite × 1,5; exakt für jede Saison (Deckung ā = ⟨a⟩, Krone ⟨k·a⟩/ā, Boden (⟨c⟩ − ⟨c·a⟩)/(1 − ā)).
const FERN_MASCHE_T = new Float32Array(8);
const FERN_MASCHE_S = new Float64Array(10);
const FERN_U = [-2 / 3, 0, 2 / 3];
function fernFarbeMasche(x, y, z, out, fuss, schutt) {
    const t = FERN_MASCHE_T;
    const S = FERN_MASCHE_S;
    S.fill(0);
    const dx = x - fuss.ax;
    const dz = z - fuss.az;
    const d = Math.hypot(dx, dz) || 1;
    const rx = dx / d;
    const rz = dz / d;
    const h = 1.5 * Math.max(fuss.ht, fuss.hr);
    const fussM = 2 * Math.max(fuss.ht, fuss.hr);
    for (let i = 0; i < 3; i++)
        for (let j = 0; j < 3; j++) {
            const ur = FERN_U[i] * h;
            const ut = FERN_U[j] * h;
            fernFarbeTeile(x + rx * ur - rz * ut, y, z + rz * ur + rx * ut, t, null, fussM, schutt);
            const a = t[6];
            for (let c = 0; c < 3; c++) {
                S[c] += t[c];
                S[3 + c] += t[c] * a;
                S[6 + c] += t[3 + c] * a;
            }
            S[9] += a;
        }
    const a = S[9] / 9;
    const frei = 9 - S[9];
    for (let c = 0; c < 3; c++) {
        out[c] = frei > 1e-6 ? (S[c] - S[3 + c]) / frei : S[c] / 9;
        out[3 + c] = S[9] > 1e-6 ? S[6 + c] / S[9] : 0;
    }
    out[6] = a;
    return out;
}

// DAS GEDÄCHTNIS DER RING-FARBEN (zwei Generationen à `memo` Punkte): Schnapp-Punkte sind ganzzahlig, der Schlüssel trägt die
// Maschen-Breite in Viertel-Oktaven — ein Re-Anker rechnet nur, was neu ist; die Saat oder die Generation des Mains (`memo`:
// jeder Abschied des Rings, wie bis B2 das Gedächtnis im Haupt-Faden) leert es.
let fernMemo = { neu: new Map(), alt: new Map(), seed: null, gen: -1 };
function fernRingTeile(x, z, law, fuss, schutt, gen) {
    if (fernMemo.seed !== state.seed || fernMemo.gen !== gen)
        fernMemo = { neu: new Map(), alt: new Map(), seed: state.seed, gen };
    const key = x * 4194304 + z + Math.round(4 * Math.log2(Math.max(1, fuss.ht))) * 17592186044416;
    let f = fernMemo.neu.get(key);
    if (f) return f;
    f = fernMemo.alt.get(key) || fernFarbeTeile(x, law, z, new Float32Array(8), fuss, undefined, schutt);
    if (fernMemo.neu.size >= fernK().memo) {
        fernMemo.alt = fernMemo.neu;
        fernMemo.neu = new Map();
    }
    fernMemo.neu.set(key, f);
    return f;
}

// DER AUFTRAG DER FERNE. ring: je Punkt (x, z, Masche ht/hr, Reihen-Radius, Bau-Zone) die Gesetzes-Höhe (in der Bau-Zone
// mit dem vollen Gesetz gemischt, die Deck-Mischung), der Schutt, Fläche und Spiegel des Bodens (`fernNass`), der Fluss der
// Masche (Anteil und Spiegel) und die Teile (trocken; nasse Punkte jenseits der Bau-Zone tragen keine — dort setzt der Main
// nur den Spiegel). feld: je Texel die Höhe (f32 wie das Feld) und die Fern-Farbe × Saison (y, r, g, b). krone: je Punkt das
// Kronendach sRGB in 8 Bit und die Deckung (Wasser 0). teile: die Teile an Punkten (die Linsen) — mit `y` an der Höhe, sonst am
// Gesetz; mit `ht` als Masche; `roh` ohne den Fluss-Anteil (fussM 0); `nurHoehe` nur Höhe, Schutt und Nässe.
// DIE KRONE IN DER MASCHE (bauen.K4, der Fern-Ring zeigt den Edit): die höchste Fläche des Felds (`voxelSurfaceY`) über der
// Mitte jedes Füll-Edits in der Masche des Ring-Punkts — der ungerundeten um den Anker (ax, az): Winkel `ang` ± ht / rad (die
// halbe Winkel-Breite π/W), Radius rad/√q … rad·√q (q der Reihen-Faktor der Schale); die Maschen tilen die Schale, je Mitte
// trägt sie EINE Ecke (die gezeichnete liegt auf dem Snap-Gitter). Fern zeigt sich ein Turm, ein Damm, eine Schüttung als das
// Maximum ihrer Masche (die Silhouette); −Infinity ohne Füll-Edit darin. `merk` hält je Mitte die Fläche für einen Auftrag.
function fernKrone(ax, az, rad, ang, ht, q, merk) {
    const edits = state.voxelEdits;
    let top = -Infinity;
    if (!edits || !edits.length) return top;
    const [lo, hi, halb] = [rad / Math.sqrt(q), rad * Math.sqrt(q), ht / rad];
    for (const e of edits) {
        if (!e || e.mode !== "fill") continue;
        const re = Math.hypot(e.x - ax, e.z - az);
        const da = Math.atan2(e.z - az, e.x - ax) - ang;
        if (!(re > lo && re <= hi) || Math.abs(da - 2 * Math.PI * Math.round(da / (2 * Math.PI))) > halb) continue;
        const key = e.x + "," + e.z;
        if (!merk.has(key)) merk.set(key, voxelSurfaceY(e.x, e.z) ?? -Infinity);
        top = Math.max(top, merk.get(key));
    }
    return top;
}

function fernAuftrag(msg) {
    fernLaub = msg.laub;
    fernWasser = msg.wasser;
    const p = msg.punkte;
    const n = (p.length / 2) | 0;
    const wl = msg.wl;
    const aus = { hang: 0, schutt: 0, wand: 0 };
    const nass = { y: 0, spiegel: 0, koerper: 0 };
    if (msg.art === "ring") {
        const law = new Float64Array(n);
        const voll = new Float64Array(n).fill(NaN);
        const schutt = new Float32Array(n);
        const nassY = new Float64Array(n);
        const spiegel = new Float64Array(n);
        const flussC = new Float64Array(n);
        const flussSp = new Float64Array(n);
        const teile = new Float32Array(n * 8).fill(NaN);
        const krone = new Float64Array(n);
        const fl = { spiegel: NaN };
        const fuss = { ax: msg.ax, az: msg.az, ht: 0, hr: 0 };
        const deck = msg.deckZoneRad;
        const kronen = new Map();
        for (let k = 0; k < n; k++) {
            const x = p[k * 2];
            const z = p[k * 2 + 1];
            let L = G.hoehe(state, x, z, false, aus);
            const s = fernSchuttVon(aus);
            const zone = msg.zone[k] === 1;
            // die Krone der Füll-Edits in der Masche hebt das Gesetz; der Ring legt sie auch über Naht und Feld (`_fernRingY`)
            krone[k] = fernKrone(msg.ax, msg.az, msg.rad[k], msg.ang[k], msg.ht[k], msg.q[k], kronen);
            if (zone) {
                const V = G.hoehe(state, x, z, true);
                voll[k] = V;
                const rad = msg.rad[k];
                if (rad <= deck * 1.35) {
                    const w = rad <= deck ? 1 : (deck * 1.35 - rad) / (deck * 0.35);
                    L = L + (V - L) * w - 0.3 * w;
                }
            }
            law[k] = L = Math.max(L, krone[k]);
            schutt[k] = s;
            const wet = fernNass(x, z, L, wl, nass);
            nassY[k] = nass.y;
            spiegel[k] = nass.spiegel;
            fuss.ht = msg.ht[k];
            fuss.hr = msg.hr[k];
            flussC[k] = fernFlussDeckung(x, z, Math.max(fuss.ht, fuss.hr), fl);
            flussSp[k] = fl.spiegel;
            if (wet && !zone) continue;
            teile.set(fernRingTeile(x, z, L, fuss, s, msg.memo | 0), k * 8);
        }
        const antwort = { law, voll, schutt, nassY, spiegel, flussC, flussSp, teile, krone };
        return { antwort, transfer: Object.values(antwort).map((a) => a.buffer) };
    }
    if (msg.art === "feld") {
        const daten = new Float32Array(n * 4);
        let hMax = -Infinity;
        const fuss = { ax: msg.ax, az: msg.az, ht: 0, hr: msg.hr };
        const t = new Float32Array(8);
        const R = fernWasser;
        const sai = msg.saison;
        for (let k = 0; k < n; k++) {
            const px = p[k * 2];
            const pz = p[k * 2 + 1];
            // die Höhe und der Schutt in f32, wie das Feld sie trägt
            const law = Math.fround(G.hoehe(state, px, pz, false, aus));
            const s = Math.fround(fernSchuttVon(aus));
            const wet = fernNass(px, pz, law, wl, nass);
            const y = wet ? nass.spiegel : nass.y;
            let r = R[0];
            let g = R[1];
            let b = R[2];
            if (!wet) {
                fuss.ht = (Math.PI * Math.hypot(px - msg.ax, pz - msg.az)) / msg.azN;
                fernFarbeTeile(px, y, pz, t, fuss, undefined, s);
                const c = t[7];
                r = (t[0] + (t[3] * sai.r - t[0]) * t[6]) * (1 - c) + R[0] * c;
                g = (t[1] + (t[4] * sai.g - t[1]) * t[6]) * (1 - c) + R[1] * c;
                b = (t[2] + (t[5] * sai.b - t[2]) * t[6]) * (1 - c) + R[2] * c;
            }
            daten[k * 4] = y;
            daten[k * 4 + 1] = r;
            daten[k * 4 + 2] = g;
            daten[k * 4 + 3] = b;
            if (y > hMax) hMax = y;
        }
        return { antwort: { daten, hMax }, transfer: [daten.buffer] };
    }
    if (msg.art === "krone") {
        const rgba = new Uint8Array(n * 4);
        const t = new Float32Array(8);
        const sRGB = (c) => {
            const v = c <= 0 ? 0 : c >= 1 ? 1 : c <= 0.0031308 ? c * 12.92 : 1.055 * Math.pow(c, 1 / 2.4) - 0.055;
            return Math.round(v * 255);
        };
        for (let k = 0; k < n; k++) {
            const x = p[k * 2];
            const z = p[k * 2 + 1];
            const o = k * 4;
            // Wasser trägt keine Krone (der Ring: Deckung 0 auf dem Spiegel)
            if (fernNass(x, z, G.hoehe(state, x, z, false, aus), wl, nass)) continue;
            fernFarbeTeile(x, nass.y, z, t, undefined, undefined, fernSchuttVon(aus));
            rgba[o] = sRGB(t[3]);
            rgba[o + 1] = sRGB(t[4]);
            rgba[o + 2] = sRGB(t[5]);
            rgba[o + 3] = Math.round(Math.max(0, Math.min(1, t[6])) * 255);
        }
        return { antwort: { rgba }, transfer: [rgba.buffer] };
    }
    if (msg.art === "teile") {
        const teile = new Float32Array(n * 8);
        const law = new Float64Array(n);
        const schutt = new Float32Array(n);
        const nassA = new Uint8Array(n);
        const t = new Float32Array(8);
        const fuss = msg.ht ? { ax: msg.ax, az: msg.az, ht: 0, hr: 0 } : null;
        for (let k = 0; k < n; k++) {
            const x = p[k * 2];
            const z = p[k * 2 + 1];
            const L = G.hoehe(state, x, z, msg.detail === true, aus);
            const s = fernSchuttVon(aus);
            law[k] = L;
            schutt[k] = s;
            nassA[k] = fernNass(x, z, L, wl, nass) ? 1 : 0;
            if (msg.nurHoehe) continue;
            const y = msg.y ? msg.y[k] : L;
            if (fuss) {
                fuss.ht = msg.ht[k];
                fuss.hr = msg.hr[k];
            }
            if (msg.roh && fuss) fernFarbeMasche(x, y, z, t, fuss, s);
            else if (msg.roh) fernFarbeTeile(x, y, z, t, null, 0, s);
            else fernFarbeTeile(x, y, z, t, fuss, undefined, s);
            teile.set(t, k * 8);
        }
        return {
            antwort: { teile, law, schutt, nass: nassA },
            transfer: [teile.buffer, law.buffer, schutt.buffer, nassA.buffer],
        };
    }
    throw new Error("Fern-Faden: unbekannte Art des Auftrags (" + msg.art + ")");
}
