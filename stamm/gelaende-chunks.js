class AnazhRealm_gelaende_chunks {
    // ===== ATLAS · Gelaende/chunks — Voxel-Worker · Chunk-Bau · Streaming · Edits · Dirty-Remesh =====
    // Lazy-Singleton: spawnt den Voxel-Density-Worker (off-thread CPU, integriert
    // seit V9.90, voll engagiert V17.118 — der Mesh-Bau läuft off-main-thread, nur
    // der Spieler-Chunk sync). Der Determinismus-Test bewacht die bit-identische
    // Spiegelung zum Main-Thread. (NICHT GPU — der WebGPU-Density-Compute ist abgeklemmt.)
    _getVoxelWorker(srcUrl) {
        if (this.state.voxelWorker) return this.state.voxelWorker;
        if (typeof Worker === "undefined") return null;
        try {
            // Cache-Buster: der Worker lädt `voxel-worker.js` separat — ohne `?v=` serviert das CDN eine stale
            // Worker-Datei (Mesh-Pipeline mit veralteter Logik); `AnazhRealm.VERSION` bustet mit jedem Bump.
            // Im null-origin-Sandbox-iframe wirft `new Worker(url)` SecurityError → Quelle per fetch (ACAO *)
            // → Blob-URL → dieselbe Methode re-entrant; bis dahin trägt der Sync-Fallback.
            let worker;
            try {
                worker = new Worker(srcUrl || `voxel-worker.js?v=${AnazhRealm.VERSION}`, { name: "voxel" });
                this._voxelFadenQuelle = srcUrl || `voxel-worker.js?v=${AnazhRealm.VERSION}`; // der Wald-Faden lädt dieselbe
            } catch (_workerErr) {
                // Der Sandbox-Weg ist EIN Versuch (K22): scheitert der Faden über die Blob-URL oder ein zweites Mal, bricht
                // er laut (der äußere Fang meldet ERROR) — nie wieder still mit null, während der Haupt-Thread jeden Chunk
                // selbst baut.
                if (srcUrl || this._voxelWorkerBlobTried) throw _workerErr;
                this._voxelFadenBlobWeg();
                return null;
            }
            // die EINE Tafel der Rückfragen: ein nachgeborener Faden behält sie, die Antworten des alten (eine Kachel im Flug) kommen an
            if (!this.state.voxelWorkerPending) this.state.voxelWorkerPending = new Map();
            worker.onmessage = (e) => {
                const msg = e.data;
                if (!msg || !msg.type) return;
                if (msg.type === "density-grid-result" && msg.requestId) {
                    const pending = this.state.voxelWorkerPending.get(msg.requestId);
                    if (pending) {
                        this.state.voxelWorkerPending.delete(msg.requestId);
                        pending.resolve(new Float32Array(msg.density));
                    }
                } else if (msg.type === "chunk-mesh-result" && msg.requestId) {
                    // Voller Mesh-Build vom Worker: alle 5 Arrays als Transferable (zero-copy).
                    // `empty` = degenerierter Chunk (kein Iso) → Resolve mit Sentinel.
                    const pending = this.state.voxelWorkerPending.get(msg.requestId);
                    if (pending) {
                        this.state.voxelWorkerPending.delete(msg.requestId);
                        if (msg.empty) {
                            pending.resolve({ empty: true, lod: msg.lod | 0, vonPlatte: !!msg.vonPlatte });
                        } else {
                            pending.resolve({
                                empty: false,
                                lod: msg.lod | 0,
                                positions: new Float32Array(msg.positions),
                                // das Ziel der gröberen Stufe je Vertex (K51-2, Geomorph), null in der gröbsten Stufe; das
                                // Morph-Ziel (das der Geomorph beschreibt) und in der gröbsten Stufe Normalen- und Farb-Ziel
                                // sind eigene Kopien des Fadens (Karte hydro-faden: der Haupt-Faden kopiert nie)
                                stufeZiel: msg.stufeZiel ? new Float32Array(msg.stufeZiel) : null,
                                morphZiel: new Float32Array(msg.morphZiel),
                                normalZiel: new Float32Array(msg.normalZiel),
                                farbeZiel: new Float32Array(msg.farbeZiel),
                                normals: new Float32Array(msg.normals),
                                indices: new Uint32Array(msg.indices),
                                colors: new Float32Array(msg.colors),
                                // der Stoff (K17-2): Himmels-Sicht und Schutt je Vertex, die Feuchte des Mooses je Netz
                                himmel: new Float32Array(msg.himmel),
                                schutt: new Float32Array(msg.schutt),
                                felsFeuchte: msg.felsFeuchte,
                                // die Boden-Karte des Netzes (w4-b-boden, gelaende-core `bodenKarte` im Faden): undefined heißt,
                                // der Faden lieferte keine (der Einbau bricht laut), null: das Netz trägt kein Dreieck
                                karte:
                                    msg.karteHoehe === undefined
                                        ? undefined
                                        : msg.karteHoehe && {
                                              hoehe: new Float32Array(msg.karteHoehe),
                                              gruen: new Uint8Array(msg.karteGruen),
                                              zellen: new Int16Array(msg.karteZellen),
                                          },
                                // die Karte der Morph-Ziele (null in der gröbsten Stufe), ihre Lage das Morph-Ziel des Fadens
                                karteZiel: msg.zielHoehe
                                    ? {
                                          hoehe: new Float32Array(msg.zielHoehe),
                                          gruen: new Uint8Array(msg.zielGruen),
                                          zellen: new Int16Array(msg.zielZellen),
                                      }
                                    : null,
                                waterCells: new Uint8Array(msg.waterCells),
                                zid: msg.zid || null, // die Zellen behält der Faden unter dieser Nummer (das Wasser-Sheet)
                                vonPlatte: !!msg.vonPlatte, // ein Treffer der Platte des Fadens (der Warm-Start)
                                // der Höhlen-Graph (Welle 7): je Dreieck die Zelle seiner Luft + Zellen · Seiten · Portale
                                hoehle: msg.hTri
                                    ? {
                                          tri: new Int32Array(msg.hTri),
                                          n: msg.hN | 0,
                                          knoten: new Float32Array(msg.hKnoten),
                                          muend: new Float32Array(msg.hMuend),
                                          seiten: new Float32Array(msg.hSeiten),
                                          kanten: new Float32Array(msg.hKanten),
                                          rand: new Int32Array(msg.hRand),
                                      }
                                    : null,
                            });
                        }
                    }
                } else if (msg.type === "water-sheet-result" && msg.requestId) {
                    // B1 (V18.345) — der OFF-THREAD-Wasser-Sheet (Streaming, CA-frei).
                    // Die rohen Geometrie-Arrays kommen zero-copy via Transferable;
                    // `_applyWorkerWaterSheet` macht daraus die BufferGeometry + Mesh.
                    const pending = this.state.voxelWorkerPending.get(msg.requestId);
                    if (pending) {
                        this.state.voxelWorkerPending.delete(msg.requestId);
                        if (msg.fehlt) {
                            pending.resolve({ fehlt: msg.fehlt }); // Verweise ohne Zellen im Faden (`_workerBuildWaterSheet`)
                        } else if (msg.empty) {
                            pending.resolve({ empty: true });
                        } else {
                            pending.resolve({
                                empty: false,
                                positions: new Float32Array(msg.positions),
                                indices: new Uint32Array(msg.indices),
                                aFlow: new Float32Array(msg.aFlow),
                                aWave: new Float32Array(msg.aWave),
                                aDepth: new Float32Array(msg.aDepth),
                                aSlope: new Float32Array(msg.aSlope),
                            });
                        }
                    }
                } else if (msg.type === "spiegel-feld-result" && msg.requestId) {
                    // D10 — ein Rechteck des Spiegel-Felds (`_voxelWorkerSpiegel`), zero-copy per Transferable
                    const pending = this.state.voxelWorkerPending.get(msg.requestId);
                    if (pending) {
                        this.state.voxelWorkerPending.delete(msg.requestId);
                        pending.resolve({
                            hoehen: new Uint16Array(msg.hoehen),
                            stoff: new Uint8Array(msg.stoff),
                            hoechste: new Float32Array(msg.hoechste),
                        });
                    }
                } else if (msg.type === "hydro-result" && msg.requestId) {
                    // die Region aus dem Faden (Karte hydro-faden): jedes Feld per Transfer (`hydroAntwort`), der Empfang ist
                    // `_hydroAn`. Flüsse und Seen liest im Spiel niemand: sie kommen als Bytes, ihr erster Leser (Linse, Tor)
                    // entpackt sie einmal (streaming.K5: bis dahin klonten sie 0,7 MB je Minute Fahrt in den Haupt-Faden)
                    const pending = this.state.voxelWorkerPending.get(msg.requestId);
                    if (pending) {
                        this.state.voxelWorkerPending.delete(msg.requestId);
                        const r = msg.region;
                        let d = null;
                        for (const k of ["rivers", "lakes"])
                            Object.defineProperty(r, k, {
                                get: () => (d = d || JSON.parse(new TextDecoder().decode(r.daten)))[k],
                            });
                        pending.resolve(msg);
                    }
                } else if (msg.type === "ack" && msg.requestId) {
                    const pending = this.state.voxelWorkerPending.get(msg.requestId);
                    if (pending) {
                        this.state.voxelWorkerPending.delete(msg.requestId);
                        pending.resolve(true);
                    }
                } else if (msg.type === "error") {
                    if (msg.requestId) {
                        const pending = this.state.voxelWorkerPending.get(msg.requestId);
                        if (pending) {
                            this.state.voxelWorkerPending.delete(msg.requestId);
                            // der Wurf trägt den Stapel des Fadens (die Zeile, die warf), nie nur die Meldung
                            pending.reject(
                                Object.assign(new Error(msg.message), msg.stapel ? { stack: msg.stapel } : null)
                            );
                        }
                    }
                    this.log(`Voxel-Worker-Fehler (${msg.op}): ${msg.message}`, "ERROR");
                }
            };
            worker.onerror = (err) => {
                this.log(`Voxel-Worker-Fehler: ${err.message}`, "ERROR");
                this.state.voxelWorkerReady = false;
            };
            this.state.voxelWorker = worker;
            // DER INIT DER GEBURT (B-K2) trägt den Stand (Seed, Gesetz, voxelEdits); jeder Auftrag reist hinter ihm
            // (`_voxelFadenAuftrag`), nie mit einem neuen init. Kommt der Faden erst nach der Weltgen (der Blob-Weg), trägt dieser
            // init schon die Welt: der Strom darf ihn fragen. Verwirft der Faden ihn, bricht es laut beim Namen.
            this._voxelWorkerSyncState({ op: "init" }).catch((e) => this._stoffBruch("der Voxel-Faden (init)", e));
            // DIE REGIONEN DIESER WELT (streaming.K5): der Stand trägt keine — ein Faden, der nach ihrer Bestellung geboren wird,
            // rechnet jede selbst direkt hinter seinem init (ohne Rückfrage: der Main hält sie). Bis dahin baute ein
            // nachgeborener Voxel-Faden jeden Chunk ohne Fluss und See (werk-im-wasser: 0 Häuser an 8 Uferorten, das Bild trocken)
            for (const [key, e] of this._hydroBestellt || [])
                if (e.gepostet) worker.postMessage({ type: "hydro", key, origin: e.origin });
            // die Bestellungen der Weltgen, die auf den Faden warteten (der Blob-Weg), reisen hinter seinem init
            if (this._voxelWeltWartet) for (const post of this._hydroWarte || []) post();
            this._hydroWarte = null;
            return worker;
        } catch (e) {
            this.log(`Voxel-Worker-Spawn-Fehler: ${e.message}`, "ERROR");
            return null;
        }
    }

    // DER SANDBOX-WEG DES VOXEL-FADENS (EIN Versuch): die Quelle per fetch (ACAO *) → Blob-URL → `_getVoxelWorker`
    // re-entrant. Scheitert er, bricht er laut beim Namen (K22).
    _voxelFadenBlobWeg() {
        this._voxelWorkerBlobTried = true;
        fetch(`voxel-worker.js?v=${AnazhRealm.VERSION}`)
            .then((r) => r.text())
            .then((src) => {
                // V18.112 — die absolute Basis injizieren: ein blob:-Worker
                // kann relative importScripts nicht auflösen (Sonden-Fang).
                const base = new URL(".", document.baseURI).href;
                const blobUrl = URL.createObjectURL(
                    new Blob([`self.__anazhBase=${JSON.stringify(base)};\n`, src], {
                        type: "application/javascript",
                    })
                );
                this._getVoxelWorker(blobUrl);
                if (this.state.voxelWorker)
                    this.log("Voxel-Worker über Blob-URL gestartet (Sandbox-Rekursion)", "INFO");
            })
            // LAUT (K22): ohne Faden baut der Haupt-Thread jeden Chunk selbst — der Bruch meldet sich beim Namen
            .catch((e2) => this._stoffBruch("der Voxel-Faden startet nicht (Blob-Weg)", e2));
    }

    // Voller State-Snapshot für den Worker (Seed, Gesetz, voxelEdits, …) — reine Daten des Mains, nie empfangene Bytes.
    _voxelWorkerSnapshotState() {
        const seed = (this.state.worldMeta && this.state.worldMeta.seed) || "anazh-realm-seed";
        const snap = {
            seed,
            baseHeight: this.state.terrainBaseHeight || 0,
            waterLevel: typeof this.state.waterLevel === "number" ? this.state.waterLevel : 0,
            voxelEdits: this._snapshotVoxelEdits(),
            stau: this.state.waterStau || null, // die Felder des Staus (`_stauFelder`), dieselben im Faden

            // DAS GESETZ DER HYDROSPHÄRE reist mit (Karte hydro-faden): der Faden rechnet mit ihm die Regionen (gelaende-core
            // `hydrosphaere`) und baut dasselbe Bett (Welle L: Freibord und die Bank)
            hydroGesetz: AnazhRealm.HYDROSPHERE,
            // die Kachel-Kante der Hydro-Regionen: das Gelände-Gesetzbuch rechnet den Kachel-Schlüssel aus der Lage
            regionSize: AnazhRealm.HYDROSPHERE.regionSize,
            // Die genVersion-Schleuse reist mit: der Worker-Spiegel gated die Feuchte-Mix-Linie identisch
            // (Legacy-Welten gen < 2 → feuchte = 0).
            genVersion: typeof this._genVersion === "function" ? this._genVersion() : 1,
            // DAS ERBGUT reist in seiner Normalform mit (die Terme der EINEN 2D-Höhe, das Wildnis-Gewicht): der Worker
            // rechnet dieselben Zahlen, nie eine eigene Ableitung.
            erbgut: this._erbgut(),
            // DER ERDBAU DER ORTE (K10): die Splat-Liste in der Reihenfolge der Orte — der Worker legt sie in die Normalform
            erdbau: this._erdbauRoh(),
            // DIE BODEN-PALETTE reist mit: der Worker färbt mit DENSELBEN linearen Zahlen (`attachFieldColors`),
            // kein hartkodierter Spiegel der Farben.
            bodenPalette: AnazhRealm.BODEN_FARBE,
            // DER VERSATZ DER SCHNEEGRENZE (stoffe.K3-2), den die Welt trägt (`_schneeGilt`; `_schneeTakt` zieht ihn nach)
            schneeVersatz: this._schneeGilt(),
            // DER PEGEL DER BINNEN-GEWÄSSER (stoffe.K3-2), den die Welt trägt (`_pegelGilt`; `_pegelTakt` zieht ihn nach)
            pegel: this._pegelGilt(),
            // DER WIESEN-GRUND reist mit (K53): Farbe, Wache und Fleck aus EINER Quelle (`WIESEN_GRUND`)
            wiesenGrund: AnazhRealm.WIESEN_GRUND,
            // DER FELS-STOFF reist mit (K17-2): der Worker baut ihn beim Chunk-Bau (gelaende-core `felsStoff`) mit DENSELBEN
            // Tönen und Schwellen wie der Sync-Bau des Stamms (`FELS_STOFF.basis` · `FELS_STOFF.netz`)
            felsStoff: { basis: AnazhRealm.FELS_STOFF.basis, netz: AnazhRealm.FELS_STOFF.netz },
            // DIE BODEN-KARTE reist mit (w4-b-boden): der Worker rastert sie beim Chunk-Bau (gelaende-core `bodenKarte`) mit
            // DERSELBEN Teilung und Wiesen-Wache wie der Stamm (`_bodenKarteAusMesh`)
            bodenKarte: {
                teilung: AnazhRealm.BODEN_KARTE_TEILUNG,
                gruenSchwelle: AnazhRealm.TERRAIN_GEOLOGY.gruenSchwelle,
            },
            // DIE PLATTE DES BODENS (Karte hydro-faden): der Faden führt den Warm-Start — ob er gilt, sein Stempel, sein Deckel
            platte: this._chunkPlatte(),
            // DIE KONSTANTEN DER FERNE reisen mit (B2): der Fern-Faden färbt den Horizont mit DENSELBEN Zahlen (`fernAuftrag`), der
            // Wald-Faden pflanzt nach DEMSELBEN Wald-Gesetz (`waldCtx`; bis zur Karte streaming-k5 reiste es mit jedem Auftrag)
            fern: {
                forest: AnazhRealm.FOREST,
                kronenSchatten: AnazhRealm.FERN_FARBE.kronenSchatten,
                geoSchutt: AnazhRealm.TERRAIN_GEOLOGY.schutt,
                felsMittel: AnazhRealm.FELS_STOFF.mittel,
                memo: AnazhRealm.FERN_FARBE.memo,
            },
        };
        // DIE REGIONEN reisen nie im Stand: jeder Faden rechnet sie selbst an derselben Stelle seiner Reihe (`_hydroBestellen`),
        // ein später geborener Voxel-Faden hinter seinem init (`_getVoxelWorker`), ein später geborener Neben-Faden bekommt sie
        // vom Voxel-Faden (`_nebenFaden`, per Transfer). Der Stand trägt nur die
        // Welt der Regionen (`hydroWelt`): eine neue räumt sie im Faden. Bis zur Karte streaming-k5 klonte der Haupt-Faden hier
        // Heimat und Kacheln (0,23 MB je Kalt-Boot).
        snap.hydroWelt = this._hydroWelt | 0;
        // V9.91 (Phase 3) — hydroBand für Cell-Klassifikations-Skip (Cells
        // außerhalb [bottom..top] sind garantiert AIR; spart 30-40% Cells-
        // Iterationen).
        snap.hydroBand = this.state.hydroBand
            ? { top: this.state.hydroBand.top, bottom: this.state.hydroBand.bottom }
            : null;
        return snap;
    }

    _snapshotVoxelEdits() {
        const edits = this.state.worldMeta && this.state.worldMeta.voxelEdits;
        if (!Array.isArray(edits)) return [];
        return edits.map((ed) => ({ ...ed }));
    }

    // DER EINE SENDER DES VOXEL-ZUSTANDS (K60-3): jede Zustands-Nachricht (init · state-set · state-update) reist in
    // derselben Reihe an JEDEN Faden, der am Zustand rechnet — den Voxel-Faden und jeden geborenen Neben-Faden
    // (`_nebenFaden`: Wald, Ferne — ohne Rückfrage-Nummer: seine Nummern sind seine Aufträge). Der Wald-Faden bekommt bei der Geburt
    // EINEN vollen Stand, danach dieselben Deltas wie der Voxel-Faden. Bis zur Prüfung K60-3-1 schickte er sich je
    // Stand-Wechsel (Generation + Edit-ZAHL) den vollen Zustand samt Hydro-Kacheln ein zweites Mal — ein ersetzter Edit bei
    // gleicher Zahl reiste nie, und jeder Wechsel klonte die Welt im Haupt-Faden.
    _voxelZustandPost(msg) {
        const w = this.state.voxelWorker;
        if (w) w.postMessage(msg);
        if (!this._nebenFaeden) return;
        const ohne = msg.requestId == null ? msg : Object.assign({}, msg, { requestId: null });
        for (const f of this._nebenFaeden.values()) f.worker.postMessage(ohne);
    }

    // State-Snapshot zum Worker: `op="init"` befüllt erstmalig (ack setzt voxelWorkerReady=true),
    // `op="state-set"` = voller Re-Sync nach Welt-Wechsel/Worldgen. Promise<true> beim ack.
    _voxelWorkerSyncState(opts = {}) {
        const worker = this.state.voxelWorker;
        if (!worker) return Promise.resolve(false);
        const op = opts.op === "state-set" ? "state-set" : "init";
        const requestId = this.state.voxelWorkerNextRequestId++;
        // stateGen bumpt am SEND-Zeitpunkt (der Ack ist nur Bestätigung) — so gilt nach
        // _voxelWorkerSyncWorldgenState deterministisch `syncedGen === stateGen`.
        this.state.voxelWorkerStateGen++;
        const promise = new Promise((resolve, reject) => {
            this.state.voxelWorkerPending.set(requestId, { resolve, reject });
        });
        this._voxelZustandPost({ type: op, snapshot: this._voxelWorkerSnapshotState(), requestId });
        return promise.then(() => {
            this.state.voxelWorkerReady = true;
            return true;
        });
    }

    // DER FADEN TRÄGT DEN STAND (B-K2) — das EINE Prädikat des Strom-Wegs: ab dem init (bzw. state-set) mit dem Stand der
    // Weltgen rechnet der Faden jeden Auftrag an diesem Stand (die Nachrichten eines Ports kommen in ihrer Reihe an); der Ack
    // ist nur Bestätigung. Bis B-K2 fragte der Strom den Faden erst nach dem Ack (`voxelWorkerReady`) und baute bis dahin
    // jeden Chunk im Haupt-Faden (GTX kalt: die Sekunde 3–4 ganz der Sync-Bau, 642 ms).
    _voxelFadenTraegt() {
        return !!(this.state.voxelWorker && this.state.voxelWorkerWorldgenSynced);
    }

    // DER EINE AUFTRAG AN DEN VOXEL-FADEN (B-K2): jeder Rechen-Auftrag reist hinter dem init seiner Geburt (der Stand: Seed,
    // Gesetz, voxelEdits — die Nachrichten eines Ports kommen in ihrer Reihe an), nie mit einem neuen init. Bis B-K2 schickte
    // jeder Auftrag vor dem Ack einen eigenen vollen Stand (`_voxelWorkerSyncState()`: je Auftrag ein Klon der Welt im
    // Haupt-Faden, Lehre 24). DIE REIHE DES PROGRAMMS (streaming.K5): der Auftrag geht SOFORT hinaus, in der Reihe, in der er
    // seine Verweise las — bis sk5-kopie wartete er einen Mikro-Takt auf die Zusage (`worker.zusage`), und eine Freigabe hinter
    // ihm im selben Takt (`zellen-frei` beim Tausch des Chunks) überholte ihn: das Wasser-Blatt fragte nach, und der Main
    // klonte die Zellen des Fadens zurück (0,13 MB je Block, an 607d0c73 0,27 MB in der Minute Fahrt). `msg` bekommt die
    // Rückfrage-Nummer, `transfer` sind seine Puffer (Lehre 24).
    _voxelFadenAuftrag(worker, msg, transfer) {
        const requestId = this.state.voxelWorkerNextRequestId++;
        const promise = new Promise((resolve, reject) => {
            this.state.voxelWorkerPending.set(requestId, { resolve, reject });
        });
        msg.requestId = requestId;
        worker.postMessage(msg, transfer || []);
        return promise;
    }

    // Density-Grid im Worker: Promise<Float32Array> mit (dimX+1)·(dimY+1)·(dimZ+1) Floats, Indizierung
    // identisch zu `_voxelSampleDensityGrid`. Test-Pfad: das Determinismus-Band vergleicht bit-identisch.
    _voxelWorkerComputeDensity(ox, oy, oz, dimX, dimY, dimZ, step) {
        const worker = this._getVoxelWorker();
        if (!worker) return Promise.reject(new Error("voxel-worker not available"));
        return this._voxelFadenAuftrag(worker, { type: "density-grid", ox, oy, oz, dimX, dimY, dimZ, step });
    }

    // Voller Chunk-Mesh im Worker → {empty, positions, indices, normals, colors, waterCells, lod}
    // (`empty` = kein Iso). Density/Iso/Cells/Colors (~145 ms) laufen off-thread; der Main baut nur
    // BufferGeometry + Architektur-Cell-Stempel + BVH + Scene-Attach. Der Auftrag trägt die Flut-Saat der Nachbarn
    // (`_flutSaat`, null ohne Carve im 3×3) — der Worker flutet damit wie der Sync-Bau.
    _voxelWorkerComputeChunkMesh(cx, cz, lod, platte = null) {
        const worker = this._getVoxelWorker();
        if (!worker) return Promise.reject(new Error("voxel-worker not available"));
        // die Saat am Stand der Bestellung — ändert ein Edit den Stand vor der Antwort, verwirft sie der Stand-Filter
        // (`_fetchOrRequestChunkMesh`, `_voxelStand`)
        const saat = this._flutSaat(cx, cz);
        return this._voxelFadenAuftrag(worker, { type: "chunk-mesh", cx, cz, lod: lod | 0, saat, platte });
    }

    // DAS SPIEGEL-FELD off-thread (D10): ein Rechteck der Welt-Zellen (`auftrag`: i0, j0, w, h, texel, bezug, wasserFarbe,
    // baeume, gestalten, block — `spiegelFeldBacken` im Worker) → { hoehen (RGBA-Halbfloat), stoff (RGBA8), hoechste je Block, wasser,
    // hMax } am
    // synchronisierten Zustand.
    _voxelWorkerSpiegel(auftrag) {
        const worker = this._getVoxelWorker();
        if (!worker) return Promise.reject(new Error("voxel-worker not available"));
        return this._voxelFadenAuftrag(worker, Object.assign({ type: "spiegel-feld" }, auftrag));
    }

    // DIE NEBEN-FÄDEN DES GESETZES (K60-3, B2): eigene Fäden aus DERSELBEN Quelle wie der Voxel-Faden (`voxel-worker.js`,
    // derselbe Gelände-Kern, dieselben Spiegel) — der Wald-Faden (die Darts) und der Fern-Faden (der Horizont, `_fernAuftrag`).
    // Im Voxel-Faden stünde jeder Auftrag hinter jedem Chunk (K60-3: die Darts kamen 3,5 s nach der Bestellung). Den Zustand
    // bringt der EINE Sender (`_voxelZustandPost`): bei der Geburt ein voller Stand, danach dieselben Nachrichten wie der
    // Voxel-Faden — ein Auftrag rechnet am Zustand, der vor ihm reiste. Ein Wurf des Fadens bricht laut beim Namen.
    _nebenFaden(name) {
        const alle = this._nebenFaeden || (this._nebenFaeden = new Map());
        let f = alle.get(name);
        if (f) return f;
        // der Voxel-Faden zuerst (er trägt die Quelle; lazy wie jeder Chunk-Auftrag) — steht er noch nicht (Blob-Weg), wartet der Rufer
        if (!this._getVoxelWorker() || !this._voxelFadenQuelle) return null;
        const worker = new Worker(this._voxelFadenQuelle, { name });
        f = { worker, pending: new Map(), next: 1 };
        const NAME = name.toUpperCase();
        const Name = name[0].toUpperCase() + name.slice(1);
        worker.onmessage = (e) => {
            const msg = e.data;
            if (!msg) return;
            if (msg.type === "error") this._bruchMelden(`${NAME}: der ${Name}-Faden warf (${msg.op}) — ${msg.message}`);
            const p = msg.requestId ? f.pending.get(msg.requestId) : null;
            if (!p) return;
            f.pending.delete(msg.requestId);
            if (msg.type === "error")
                p.reject(Object.assign(new Error(msg.message), msg.stapel ? { stack: msg.stapel } : null));
            else p.resolve(msg);
        };
        worker.onerror = (err) => this._bruchMelden(`${NAME}: der ${Name}-Faden brach — ` + (err && err.message));
        // der EINE volle Stand bei der Geburt, die Regionen dahinter vom Voxel-Faden über einen Port (`hydro-an`: jede, die er
        // trägt, per Transfer — der Haupt-Faden klont nie eine); jede spätere Änderung bringt der Sender des Zustands
        // (`_voxelZustandPost`), auch jede Bestellung ab jetzt
        const port = new MessageChannel();
        this.state.voxelWorker.postMessage({ type: "hydro-an", port: port.port1 }, [port.port1]);
        worker.postMessage({ type: "state-set", snapshot: this._voxelWorkerSnapshotState(), hydroVon: port.port2 }, [
            port.port2,
        ]);
        alle.set(name, f);
        return f;
    }
    _nebenAuftrag(name, msg, transfer) {
        const f = this._nebenFaden(name);
        if (!f) return Promise.reject(new Error("kein Voxel-Faden"));
        const requestId = f.next++;
        const promise = new Promise((resolve, reject) => f.pending.set(requestId, { resolve, reject }));
        f.worker.postMessage(Object.assign(msg, { requestId }), transfer || []);
        return promise;
    }

    // DER AUFTRAG DER FERNE (B2): Fern-Ring, Feld-Pass, Fern-Krone und die Linsen fragen den Fern-Faden (`fernAuftrag` im
    // Faden) — mit dem, was die Farbe aus diesem Faden liest: die Studio-Laubfarbe der Arten, der Wasser-Körper, der
    // Meeresspiegel. Die Antwort trägt die Zahlen per Transfer; ohne Faden gibt es keine Ferne (laut, kein Haupt-Faden-Weg).
    // DIE BAHN DES PANORAMAS (B4): das Feld („feld“: 9 216 Punkte von 8 bis 40 km, je Punkt das Gesetz mit dem Flussnetz der
    // fernen Kacheln) rechnet in seinem eigenen Faden neben dem Ring — im EINEN Fern-Faden stand jede Ring-Scheibe hinter ihm
    // (Radeon kalt am Kopf 130ba565: der Fern-Faden 6,6 s belegt, das Feld allein ~4,9 s, der Horizont hing bei 11 %).
    _fernAuftrag(art, msg, transfer) {
        const wl = Number.isFinite(this.state.waterLevel) ? this.state.waterLevel : 0;
        return this._nebenAuftrag(
            art === "feld" ? "feld" : "fern",
            Object.assign(
                { type: "fern", art, wl, laub: this._fernLaubLinear(), wasser: this._fernWasserKoerper() },
                msg
            ),
            transfer
        );
    }

    // Wasser-Sheet off-thread: der 3×3-Zell-Block geht an den Worker — als Verweis auf seine eigenen Zellen, wo der Main sie
    // unverändert trägt (Karte hydro-faden: bis dahin ein Klon von neun Blöcken je Bestellung, 79,7 MB je Minute Fahrt), sonst
    // als Klon (der Main braucht ihn weiter); der Worker rechnet byte-identisch zu `_computeWaterSheetData` → {empty:true}
    // oder die Geometrie-Arrays. Nur für CA-freie Nachbarschaften (`_waterSheetCaFree`), sonst sync im
    // Main. smoothPasses MUSS exakt `_mainWaterSheetCtx` entsprechen, sonst bricht die byte-Parität.
    _workerBuildWaterSheet(cx, cz) {
        const worker = this._getVoxelWorker();
        if (!worker) return Promise.reject(new Error("voxel-worker not available"));
        const entry = this.state.voxelChunks ? this.state.voxelChunks.get(`${cx},${cz}`) : null;
        if (!entry || !entry.waterCells) return Promise.resolve({ empty: true });
        // je Platz i = (dz+1)·3 + (dx+1) des 3×3 ein Verweis auf die Zellen des Fadens (`zellenId`: er baute sie, der Main trägt
        // sie samt der Liste seines Stempels, `zellenFest`) — sonst die eigenen Zellen des Mains (ohne Verweis, und je Verweis,
        // der den Faden verfehlte: `ganz`, die Plätze der Antwort). DER AUFTRAG REIST PER TRANSFER (Lehre 24): die Verweise als
        // EIN Int32Array (`zids`, 0 ohne Verweis), die Stempel als EINE Liste mit Grenzen (`fest`, Platz i in festAb[i]…festAb[i+1]);
        // geklont reisen nur eigene Zellen (`eigen`). Bis sk5-kopie klonte jede Bestellung neun Objekte (0,18 MB je Minute Fahrt).
        const zellen = (ganz) => {
            const [zids, festAb, listen, eigen] = [new Int32Array(9), new Int32Array(10), [], {}];
            let n = 0;
            for (let i = 0; i < 9; i++) {
                const e = i === 4 ? entry : this.state.voxelChunks.get(`${cx + (i % 3) - 1},${cz + ((i / 3) | 0) - 1}`);
                festAb[i] = n;
                if (!e || !e.waterCells) continue;
                if (!e.zellenId || (ganz && ganz.includes(i))) {
                    eigen[i] = e.waterCells;
                    continue;
                }
                zids[i] = e.zellenId;
                if (e.zellenFest) (listen.push(e.zellenFest), (n += e.zellenFest.length));
            }
            festAb[9] = n;
            const fest = new Int32Array(n);
            for (let i = 0, o = 0; i < listen.length; o += listen[i++].length) fest.set(listen[i], o);
            return { zids, festAb, fest, eigen };
        };
        const smoothRaw =
            this.state.atmosphere && Number.isFinite(this.state.atmosphere.waterSheetSmooth)
                ? Math.round(this.state.atmosphere.waterSheetSmooth)
                : 4;
        const smoothPasses = Math.max(0, Math.min(6, smoothRaw));
        // die Plätze, die den Faden verfehlten, wachsen, bis keiner mehr fehlt (höchstens neun Runden): fiel ein Verweis zwischen
        // zwei Runden (der Deckel des Fadens, `zellen-frei` beim Neubau), kam `{ fehlt }` als Blatt an — ein leeres Netz
        const auftrag = (ganz) => {
            const z = zellen(ganz);
            return this._voxelFadenAuftrag(worker, Object.assign({ type: "water-sheet", cx, cz, smoothPasses }, z), [
                z.zids.buffer,
                z.festAb.buffer,
                z.fest.buffer,
            ]).then((r) => (r && r.fehlt ? auftrag((ganz || []).concat(r.fehlt)) : r));
        };
        return auftrag(null);
    }

    // Off-thread (statischer Flood-Sheet) nur, wenn Chunk + 8 Nachbarn nicht in `waterCAActive` sind. Byte-identisch, weil
    // ein settled Chunk am Flood-Spiegel ruht → `_seedWaterLevel` setzt Zellen auf 1 → CA-Delta d == 0 → Main-Sheet ==
    // Worker-Sheet (`diag-worker-watersheet`); der Stau ist Gesetz des Spiegels (`_stauFelder`, im Faden dieselben Felder).
    // Aktiv fließende Chunks tragen ein echtes Delta → SYNC.
    _waterSheetCaFree(cx, cz) {
        const active = this.state.waterCAActive;
        const chunks = this.state.voxelChunks;
        const hasActive = active && active.size > 0;
        for (let dz = -1; dz <= 1; dz++) {
            for (let dx = -1; dx <= 1; dx++) {
                const k = `${cx + dx},${cz + dz}`;
                if (hasActive && active.has(k)) return false;
                // Ein gezeichnetes oder gewünschtes Dach im 3×3 (der Automat lief dort) baut der Main: der Worker kennt
                // es nicht — ein dachloses Worker-Sheet neben einem Main-Sheet mit Dach wäre die Wasser-Naht.
                const e = chunks ? chunks.get(k) : null;
                if (e && (e._caDach || e._caDachOffen)) return false;
            }
        }
        return true;
    }

    // Cache-First-Density für den Streaming-Pfad: Float32Array = Cache-Hit (one-shot, wird konsumiert),
    // null = Worker-Request pending (Pump kommt wieder), undefined = kein Worker → sync-Density.
    // Indizierung MUSS exakt zum `_buildVoxelChunkData`-Aufruf passen (ox-step, oy, oz-step, dim+3,
    // dimY, dim+3, step), sonst Drift. Ändert ein Edit oder ein Welt-Sync im Roundtrip den Stand des Chunks (`_voxelStand`) → Result verworfen.
    _fetchOrRequestChunkDensity(cx, cz, lod) {
        const cfg = this._voxelChunkConfig(lod);
        const { dim, step, span, dimY, floorDrop } = cfg;
        const base = this.state.terrainBaseHeight || 0;
        const ox = cx * span;
        const oz = cz * span;
        const oy = base - floorDrop;
        const cacheKey = `${cx},${cz},${lod}`;
        if (this.state.voxelDensityCache && this.state.voxelDensityCache.has(cacheKey)) {
            const cached = this.state.voxelDensityCache.get(cacheKey);
            this.state.voxelDensityCache.delete(cacheKey);
            return cached;
        }
        const worker = this._getVoxelWorker();
        if (!worker) return undefined;
        if (!this.state.voxelDensityPending) this.state.voxelDensityPending = new Set();
        if (this.state.voxelDensityPending.has(cacheKey)) return null;
        this.state.voxelDensityPending.add(cacheKey);
        const expectedStateGen = this._voxelStand(cx, cz);
        // Origin + Sample-Dimensions IDENTISCH zur Main-Thread-Geometry-Calls
        // (V9.42-d-Pad: ox-step + dim+3 in X/Z, vertikal dimY).
        this._voxelWorkerComputeDensity(ox - step, oy, oz - step, dim + 3, dimY, dim + 3, step)
            .then((density) => {
                this.state.voxelDensityPending.delete(cacheKey);
                // Stale-Result-Filter: änderte sich der Stand des Chunks während des Roundtrips (ein Edit in
                // seinem 3×3, ein Welt-Sync), ist das Grid gegen alten State berechnet — verwerfen.
                if (this._voxelStand(cx, cz) !== expectedStateGen) return;
                if (!this.state.voxelDensityCache) this.state.voxelDensityCache = new Map();
                this.state.voxelDensityCache.set(cacheKey, density);
            })
            .catch((err) => {
                this.state.voxelDensityPending.delete(cacheKey);
                this.log(`Voxel-Density-Worker-Fehler (${cacheKey}): ${err.message}`, "ERROR");
            });
        return null;
    }

    // ===== DER WARM-START =====
    // Der ROHE Reply des Fadens (VOR Architektur-Stempel/surfMap) liegt in IndexedDB ("anazhChunkMesh"/"chunks"); der zweite
    // Boot liest den Ring von der Platte. DIE PLATTE LEBT IM FADEN (Karte hydro-faden, Lehre 24: ein IDB-Put klont synchron im
    // Aufrufer) — bis dahin klonte der Haupt-Faden jeden Reply hinein und jeden Treffer heraus (38 MB je Minute Fahrt). Hier
    // nur, was der Faden über sie wissen muss: ob sie gilt (headless AUS; window.__anazhChunkIdb: true → an, diag-warm-start,
    // false → aus), ihr Stempel (AnazhRealm.VERSION — jeder Release bustet — + genVersion + der Hash des Erbguts: ein fremdes
    // Erbgut liest nie alte Bytes + die Form des Replys `CHUNK_IDB_FORM`; Mismatch → der Faden leert sie) und ihr Deckel.
    // Der SEED lebt im KEY (`_chunkIdbKey`).
    _chunkPlatte() {
        const hook = typeof window !== "undefined" ? window.__anazhChunkIdb : undefined;
        const an =
            typeof indexedDB !== "undefined" &&
            hook !== false &&
            (hook === true || !(this.state.renderer && this.state.renderer._isHeadlessNull));
        const genV = typeof this._genVersion === "function" ? this._genVersion() : 1;
        const stempel =
            AnazhRealm.VERSION + "|" + genV + "|landform|" + this._erbgut().hash + "|" + AnazhRealm.CHUNK_IDB_FORM;
        return { an, stempel, max: AnazhRealm.CHUNK_IDB_MAX };
    }
    // Der Warm-Start-Key: seed|cx,cz|lod — mehrere Welten teilen den Store
    // (der Stempel bustet grob bei Erbgut-/Versions-Wechsel, s. _chunkPlatte).
    // Ein Versatz der Schneegrenze (stoffe.K3-2, `_schneeGilt`) färbt den Chunk: er trägt seinen Schlüssel (die Sommer-Mitte 0
    // den alten); ebenso der Pegel, der sein Wasser hebt (`_pegelMarke`, "" wo nichts steigt).
    _chunkIdbKey(cx, cz, lod) {
        const seed = (this.state.worldMeta && this.state.worldMeta.seed) || "anazh-realm-seed";
        const schnee = this._schneeGilt();
        const pegel = this._pegelMarke(cx, cz);
        return `${seed}|${cx},${cz}|${lod}` + (schnee ? `|s${schnee}` : "") + (pegel ? `|p${pegel}` : "");
    }
    // Warm-Start-Gate (Read UND Write): liegt irgendein Edit in der 3×3-Chunk-Box um (cx,cz)? Wie
    // `_chunkRegionHasCarve`, aber ohne mode-Filter (auch fill ändert die Density). r ≤ 12 < span 43.2
    // und Pad ±1 Cell → die Box deckt den Mesh-Footprint konservativ.
    _chunkFootprintEditFrei(cx, cz) {
        const { span } = this._voxelChunkConfig();
        // der Erdbau eines Orts (K10) formt den Boden wie ein Edit: sein Umkreis liest nie alte Bytes der Platte
        const E = this._erdbauLage();
        if (E) {
            const Z = globalThis.__gelaendeCore.ERDBAU.zelleM;
            for (let a = Math.floor(((cx - 1) * span) / Z); a <= Math.floor(((cx + 2) * span) / Z); a++)
                for (let b = Math.floor(((cz - 1) * span) / Z); b <= Math.floor(((cz + 2) * span) / Z); b++)
                    if (E.zellen.has((a + 32768) * 65536 + (b + 32768))) return false;
        }
        // der Stau eines Werks (`waterStau`, `_stauAn`) flutet die Zellen seines Fensters wie ein Edit: auch dort nie alte Bytes —
        // ein Damm ist ein Bau, kein Edit, und bis ci-werk-wasser las der Faden unter seinem Stausee den Chunk ohne Stau
        for (const f of this.state.waterStau || [])
            if ((f.gx0 + f.w) * f.step > (cx - 1) * span && f.gx0 * f.step < (cx + 2) * span)
                if ((f.gz0 + f.h) * f.step > (cz - 1) * span && f.gz0 * f.step < (cz + 2) * span) return false;
        const edits = this._voxelEditsNah(cx, cz);
        if (!edits.length) return true;
        const loX = (cx - 1) * span,
            hiX = (cx + 2) * span,
            loZ = (cz - 1) * span,
            hiZ = (cz + 2) * span;
        for (let e = 0; e < edits.length; e++) {
            const ed = edits[e];
            if (ed && ed.x >= loX && ed.x <= hiX && ed.z >= loZ && ed.z <= hiZ) return false;
        }
        return true;
    }

    // Cache-First-Mesh für den Streaming-Pfad: {empty, positions, …} = Cache-Hit (`empty` = kein Iso),
    // null = Worker-Request läuft, undefined = kein Worker → sync. Ändert ein Edit den Stand des Chunks (`_voxelStand`) im
    // Roundtrip → Result verworfen. Warm-Start: ein edit-freier Footprint trägt seinen Platten-Schlüssel in den Auftrag — der
    // Faden liest ihn zuerst von seiner Platte und legt jeden frischen Bau dort ab (Karte hydro-faden).
    _fetchOrRequestChunkMesh(cx, cz, lod) {
        const cacheKey = `${cx},${cz},${lod}`;
        if (this.state.voxelMeshCache && this.state.voxelMeshCache.has(cacheKey)) {
            const cached = this.state.voxelMeshCache.get(cacheKey);
            this.state.voxelMeshCache.delete(cacheKey);
            return cached;
        }
        const worker = this._getVoxelWorker();
        if (!worker) return undefined;
        if (!this.state.voxelMeshPending) this.state.voxelMeshPending = new Set();
        if (!this.state.voxelMeshGenAtRequest) this.state.voxelMeshGenAtRequest = new Map();
        if (this.state.voxelMeshPending.has(cacheKey)) return null;
        this.state.voxelMeshPending.add(cacheKey);
        const expectedStateGen = this._voxelStand(cx, cz);
        const schnee = this._schneeGilt(); // der Faden färbt mit dem Versatz, den er bei diesem Auftrag trägt
        const pegel = this._pegelMarke(cx, cz); // … und hebt sein Wasser mit dem Pegel, den er trägt
        this.state.voxelMeshGenAtRequest.set(cacheKey, expectedStateGen);
        // die Platte NUR für edit-freie Footprints bei stehender Worldgen-Wahrheit (Lesen und Stiften, auch `empty:true`)
        const platte =
            this.state.voxelWorkerWorldgenSynced && this._chunkFootprintEditFrei(cx, cz)
                ? this._chunkIdbKey(cx, cz, lod)
                : null;
        this._voxelWorkerComputeChunkMesh(cx, cz, lod, platte)
            .then((meshData) => {
                this.state.voxelMeshPending.delete(cacheKey);
                if (
                    this._voxelStand(cx, cz) !== expectedStateGen ||
                    this._schneeGilt() !== schnee ||
                    this._pegelMarke(cx, cz) !== pegel
                ) {
                    this.state.voxelMeshGenAtRequest.delete(cacheKey);
                    return;
                }
                this.state.voxelMeshGenAtRequest.delete(cacheKey);
                if (!this.state.voxelMeshCache) this.state.voxelMeshCache = new Map();
                this.state.voxelMeshCache.set(cacheKey, meshData);
                if (meshData.vonPlatte) {
                    // Diagnose-Zähler (Linse diag-warm-start), keine Spiel-Logik
                    this.state._chunkIdbHits = (this.state._chunkIdbHits | 0) + 1;
                    if (!this.state._chunkIdbHitByKey) this.state._chunkIdbHitByKey = new Map();
                    this.state._chunkIdbHitByKey.set(cacheKey, (this.state._chunkIdbHitByKey.get(cacheKey) | 0) + 1);
                }
            })
            .catch((err) => {
                this.state.voxelMeshPending.delete(cacheKey);
                this.state.voxelMeshGenAtRequest.delete(cacheKey);
                this.log(`Voxel-Mesh-Worker-Fehler (${cacheKey}): ${err.message}`, "ERROR");
            });
        return null;
    }

    // Synchroner Build aus Worker-Mesh-Data: BufferGeometry, Material-Singleton, Architektur-Stempel auf
    // waterCells (Main-only), kein BVH. Returns `{mesh, kind, waterCells, lod, …}` wie
    // `_buildVoxelChunkData`.
    _buildVoxelChunkDataFromWorkerMesh(cx, cz, lod, meshData, _opts = {}) {
        if (!this.state.scene || typeof THREE === "undefined") return null;
        if (meshData.empty) return { mesh: null, kind: "empty", waterCells: null, lod, hasBVH: false };
        // V18.263 — der Worker LIEFERTE einen fertigen Mesh (der gesunde Pfad);
        // das Perf-Overlay zählt die Rate (0/s beim Laufen ⇒ Worker kommt nicht nach).
        this._perfMark("workerMesh");
        // DIE BYTES DES FADENS SIND DIE ATTRIBUTE (Lehre 24, B-K2): der Faden überträgt jedes Array (Transfer) — der Bau
        // übernimmt sie, statt sie zu kopieren (`Float32BufferAttribute` kopiert jedes Array; bis B-K2 elf Kopien je Chunk).
        // Eine eigene Kopie trägt das Morph-Ziel (der Geomorph beschreibt es, `_applyCrossLodGeomorph`, und setzt es aus
        // `userData.stufeZiel` bzw. der Position zurück), in der gröbsten Stufe auch Normalen- und Farb-Ziel — der Faden
        // macht sie (`chunkAntwort`, Karte hydro-faden), nie der Haupt-Faden.
        const attr = (a, n) => new THREE.BufferAttribute(a, n);
        const geom = new THREE.BufferGeometry();
        geom.setAttribute("position", attr(meshData.positions, 3));
        geom.setAttribute("normal", attr(meshData.normals, 3));
        geom.setAttribute("color", attr(meshData.colors, 3));
        geom.setIndex(attr(meshData.indices, 1));
        // DER GEOMORPH DER STUFE (K51-2): das Ziel jedes Vertex auf dem Netz der nächst gröberen Stufe (der Worker baut es,
        // `stufeZiel`), die Stufe im Morph-Code (`_morphCode`) — der Boden-Stoff wandert im Übergangs-Band dorthin.
        // Fail-closed: eine Stufe unter der gröbsten ohne Ziel spränge am Wechsel.
        const nVm = meshData.positions.length / 3;
        const zielDa = (z) => z && z.length === meshData.positions.length;
        if (
            !(zielDa(meshData.morphZiel) && zielDa(meshData.normalZiel) && zielDa(meshData.farbeZiel)) ||
            ((lod | 0) < 3 && !zielDa(meshData.stufeZiel))
        )
            throw new Error(
                `_buildVoxelChunkDataFromWorkerMesh(${cx},${cz}): der Worker liefert kein Stufen-Ziel (L${lod})`
            );
        geom.setAttribute("aMorphTarget", attr(meshData.morphZiel, 3));
        geom.setAttribute("aMorphWeight", attr(new Float32Array(nVm).fill(this._morphCode(lod, 0)), 1));
        geom.userData.stufeZiel = (lod | 0) < 3 ? meshData.stufeZiel : null;
        // Normale und Stoff-Farbe wandern mit (der Stoff mischt sie mit demselben Faktor) — die gröbste Stufe trägt ihre eigenen
        // (als eigene Kopie des Fadens: das Ziel bleibt das Bild des Baus, was immer später an Normale oder Farbe schreibt)
        geom.setAttribute("aNormalZiel", attr(meshData.normalZiel, 3));
        geom.setAttribute("aFarbeZiel", attr(meshData.farbeZiel, 3));
        // Der Höhlen-Graph (Welle 7, `_voxelHoehlenGraph` ↔ Worker `hoehlenGraph`): fail-closed — ein Boden ohne ihn
        // wüsste nicht, welche Fläche aus dem Himmel zu sehen ist.
        const H = meshData.hoehle;
        if (!H || !H.tri || H.tri.length * 3 !== meshData.indices.length)
            throw new Error(
                `_buildVoxelChunkDataFromWorkerMesh(${cx},${cz}): der Worker liefert keinen passenden Höhlen-Graph`
            );
        geom.hoehle = Object.assign({}, H, { step: this._voxelChunkConfig(lod).step });
        // DER STOFF KOMMT FERTIG (K17-2): Himmels-Sicht, Fels-Stoff (in `colors`) und Schutt baut der Worker, wo er das Netz baut
        // (gelaende-core `himmelsSicht` · `felsStoff`) — hier fällt kein Ruf des Fels-Gesetzes (`gate:hoehlen-sicht` (n)).
        const nV = meshData.positions.length / 3;
        if (!meshData.himmel || meshData.himmel.length !== nV || !meshData.schutt || meshData.schutt.length !== nV)
            throw new Error(
                `_buildVoxelChunkDataFromWorkerMesh(${cx},${cz}): der Worker liefert keinen Stoff (Himmels-Sicht · Schutt)`
            );
        geom.setAttribute("aHimmel", attr(meshData.himmel, 1));
        geom.setAttribute("aSchutt", attr(meshData.schutt, 1));
        if (meshData.felsFeuchte !== undefined) geom.userData.felsFeuchte = meshData.felsFeuchte;
        // Der CPU-Körper des Chunks (gezeichnet wird er als Bereich im Boden-Satz, `_chunkSatzEin`).
        const mat = this._getVoxelChunkMaterial();
        const mesh = new THREE.Mesh(geom, mat);
        mesh.userData = { voxelChunkX: cx, voxelChunkZ: cz };
        // Kein Chunk-BVH (~9 ms/Chunk Lauf-Freeze): die Kollision liest das Dichtefeld direkt
        // (`_stepCharacter`, `_creatureGroundY`), der Mesh ist nur Visual. `hasBVH` bleibt false,
        // bis die letzten Leser entfallen.
        const hasBVH = false;
        // Architektur-Stempel auf waterCells (Main-only, der Worker kennt keine Architekturen);
        // Cells sind IMMER LOD 0 → Stempel-Indizierung mit lod=0. Die Zellen des Chunks sind die des Fadens (`zellenId`) samt
        // der Zellen, die der Stempel fest machte (`zellenFest`): das Wasser-Sheet nimmt sie per Verweis (Karte hydro-faden).
        let waterCells = null;
        let zellenId = null;
        let zellenFest = null;
        if (meshData.waterCells && meshData.waterCells.length > 0) {
            waterCells = meshData.waterCells;
            const lod0Cfg = this._voxelChunkConfig(0);
            const base = this.state.terrainBaseHeight || 0;
            const ox = cx * lod0Cfg.span;
            const oz = cz * lod0Cfg.span;
            const oy = base - lod0Cfg.floorDrop;
            const fest = [];
            this._stampArchitectureSolidCellsInto(waterCells, ox, oy, oz, 0, fest);
            zellenId = meshData.zid || null;
            if (fest.length) zellenFest = new Int32Array(fest);
        }
        // die Karte liest die FERTIGE Farbe (nach dem Stein unter Fels), wie der synchrone Bau — vorher die rohe des
        // Workers: am Spawn-Chunk 27 Grün-Zellen anders als der Sync-Bau (playtest Perf-3.c Boden-Karte)
        // über der Naht (`_bodenKarteNaht`): die Basis des Inneren bleibt für jeden Naht-Morph der Geometrie.
        // DIE KARTE KOMMT FERTIG (w4-b-boden): der Faden rastert sie, wo er das Netz baut (gelaende-core `bodenKarte`, dieselbe
        // Rechnung wie `_bodenKarteAusMesh`) — der Einbau legt sie nur als Lage der Naht ab, wie `_bodenKarteNaht` es täte.
        // Fail-closed: ein Faden ohne Karte (eine alte Platte, ein fremder Faden) bricht laut.
        if (meshData.karte === undefined || ((lod | 0) < 3 && meshData.karte && !meshData.karteZiel))
            throw new Error(`_buildVoxelChunkDataFromWorkerMesh(${cx},${cz}): der Worker liefert keine Boden-Karte`);
        const karte = meshData.karte;
        const naht = this._bodenNaht(geom, cx, cz, lod);
        naht.lage = karte && Object.assign(karte, { ref: meshData.positions });
        // die Karte der Ziele (`_bodenStufeMisch`): ihre Lage ist das Morph-Ziel, das der Faden lieferte (der Satz trägt danach
        // eine eigene Kopie, dieses Feld ändert nichts mehr) — der erste Leser rastert nur, was der Naht-Morph am Saum zog
        naht.ziel = meshData.karteZiel && Object.assign(meshData.karteZiel, { ref: meshData.morphZiel });
        geom.userData.ausFaden = true; // ihr Netz und ihre Karte kamen aus dem Faden (`_bodenKarteNaht` wacht darüber)
        return {
            mesh,
            kind: "filled",
            waterCells,
            zellenId,
            zellenFest,
            lod,
            hasBVH,
            surfMap: karte && karte.hoehe,
            gruenMap: karte && karte.gruen,
        };
    }

    // V18.275 — liegt der Chunk-Mittelpunkt im perf-geregelten `foliageRadius`? (Die
    // KAPAZITÄTS-Wand für die Vegetation: nah → füllen, fern → warten bis der Radius wächst.)
    _foliageChunkInRadius(cx, cz) {
        const pm = this.state.playerMesh;
        if (!pm) return true; // kein Spieler (Boot/Test) → nicht gaten
        const fr = this.state.foliageRadius != null ? this.state.foliageRadius : AnazhRealm.PERF_FOLIAGE_RADIUS_MAX;
        const { span } = this._voxelChunkConfig();
        const ccx = cx * span + span / 2,
            ccz = cz * span + span / 2;
        // vor dem ersten Weltbild sät nur der Chunk im Blick (`_blickDerAnkunft`), die übrigen sät der Nachlauf
        return (
            Math.hypot(ccx - pm.position.x, ccz - pm.position.z) <= fr &&
            this._blickDerAnkunft(ccx, ccz, span * Math.SQRT1_2)
        );
    }

    // V18.275 — die Vegetation WÄCHST nach: Chunks, die jenseits des `foliageRadius` gebaut
    // wurden, füllen ihre Vegetation, sobald der (kapazitäts-gewachsene) Radius sie erreicht.
    // Budgetiert (sanftes Pop-In statt Freeze). Aufruf am Ende von `_tickVoxelChunkStreaming`.
    // EXISTENZ VOR FRAMERATE (Lehre 13, Prüfer K22-3): über dem Budget drosselt der Frame das TEMPO des Wachstums, nie
    // seine Existenz — je WUCHS_DROSSEL_MS (Wanduhr) wächst EIN Chunk, der nächste zum Spieler. Bis hierher kehrte das
    // Wachstum über dem Budget still um: auf der Radeon (Werkbank, Dorf) war das Budget in 60 von 60 und 160 von 160
    // Takten überschritten, die offenen Chunks im 64-m-Kreis blieben kahl (4 → 4), und ob Wald oder kahler Hügel im Bild
    // stand, entschied allein der frei laufende Boot.
    // DIE RUHE IST DER FIXPUNKT (feld.K3): liegt nach einem Gang kein wartender Chunk im Radius, schläft der Wuchs, bis der
    // Spieler um den Abstand des nächsten (`frei`) weiterging, der Radius oder die Chunk-Menge sich regt (`_wuchsSchlaf`) —
    // vorher prüfte er je Bild jeden wartenden Chunk (gate:stand-takt RUHE-SIM, Mess-Wiese 60 s: 32 400 Einheiten).
    _tickFoliageGrowth() {
        const pending = this.state.pendingFoliageChunks;
        if (!pending || pending.size === 0) return;
        const pm = this.state.playerMesh;
        const s = this._wuchsSchlaf;
        if (
            s &&
            s.n === pending.size &&
            s.welt === (this._weltRegung | 0) &&
            s.karte === (this._karteRegung | 0) &&
            s.fr === this.state.foliageRadius &&
            pm &&
            (pm.position.x - s.x) ** 2 + (pm.position.z - s.z) ** 2 < s.frei * s.frei
        )
            return;
        this._wuchsSchlaf = null;
        if (this._bepflanzungWartet()) return;
        // der Abstand des nächsten wartenden Chunks jenseits des Radius: so weit kann der Spieler gehen, ohne dass einer
        // hineinwächst; geht ein Gang ohne Wuchs zu Ende, schläft der Takt
        const fr = this.state.foliageRadius != null ? this.state.foliageRadius : AnazhRealm.PERF_FOLIAGE_RADIUS_MAX;
        const { span } = this._voxelChunkConfig();
        let frei = Infinity;
        const draussen = (cx, cz) => {
            if (!pm) return;
            const d = Math.hypot(cx * span + span / 2 - pm.position.x, cz * span + span / 2 - pm.position.z) - fr;
            if (d < frei) frei = d;
        };
        const schlafe = () => {
            if (!pm || !(frei > 0)) return;
            this._wuchsSchlaf = {
                n: pending.size,
                welt: this._weltRegung | 0,
                karte: this._karteRegung | 0,
                fr: this.state.foliageRadius,
                x: pm.position.x,
                z: pm.position.z,
                frei,
            };
        };
        const ueber = this.state._frameOverBudget;
        const jetzt = typeof performance !== "undefined" ? performance.now() : Date.now();
        if (ueber && this._wuchsNaechster !== undefined && jetzt < this._wuchsNaechster) return;
        // DER EINE RANG DER ANKUNFT in beiden Hälften (`_foundryAuftragD2`, Lehre 25: vor dem ersten Weltbild der Blick zuerst,
        // danach nah zuerst rundum): die wartenden Chunks im Radius nach dem Rang ihrer Mitte — bis gate:ankunft L2a säte der
        // Takt unter dem Budget in der Reihenfolge des Wartens, ein naher Chunk hinter dem Spieler hinter fernen
        const nah = [];
        for (const key of pending) {
            const ci = key.indexOf(",");
            const cx = parseInt(key.slice(0, ci), 10),
                cz = parseInt(key.slice(ci + 1), 10);
            if (!this._foliageChunkInRadius(cx, cz)) {
                draussen(cx, cz); // noch zu fern → warten
                continue;
            }
            nah.push({ key, cx, cz, d: this._foundryAuftragD2({ x: cx * span + span / 2, z: cz * span + span / 2 }) });
        }
        nah.sort((a, b) => a.d - b.d);
        // über dem Budget EIN Chunk je WUCHS_DROSSEL_MS (Instanz-Feld, nie im Spielstand); sonst zwei je Takt — eine Kappe
        // (`_kappeOffen`): unter dem Ladeschirm wächst das Laub bis zur Frist des Lade-Frames
        if (ueber && nah.length) {
            nah.length = 1;
            this._wuchsNaechster = jetzt + AnazhRealm.WUCHS_DROSSEL_MS;
        }
        let n = 0;
        for (const c of nah) {
            if (!this._kappeOffen(n, 2)) return;
            pending.delete(c.key);
            if (this.state.voxelChunks && this.state.voxelChunks.has(c.key)) {
                this._populateVoxelChunkVegetation(c.cx, c.cz);
                n++;
            }
        }
        // geschlafen wird, wenn kein Chunk im Radius mehr wartet (über dem Budget kann hinter dem einen noch einer warten)
        if (!nah.length || (n === 0 && !ueber)) schlafe();
    }

    // Worker-Update bei voxelEdit: nur der Delta-Edit (Atlas unverändert). Die Karte trägt ihn nach — die
    // Generation seiner Chunks steigt (`_voxelStand`), ihre Antworten im Flug fallen beim Eintreffen; aus den Caches
    // fallen nur die Chunks, deren Stand er ändert (sein Karten-Fußabdruck samt 3×3), je LOD. Der Rest der Welt streamt
    // weiter (bis K23 leerte jeder Edit beide Caches der ganzen Welt und verwarf jede Antwort im Flug).
    _voxelWorkerNotifyEdit(ed, anhang = true) {
        if (!this.state.voxelWorker) return;
        const k = this._voxelEditKarte();
        const span = k.span;
        const r = globalThis.__gelaendeCore.editReich(ed); // die Reichweite seiner Form, wie die Karte sie legt
        const cx0 = Math.floor((ed.x - r) / span) - 2;
        const cx1 = Math.floor((ed.x + r) / span) + 2;
        const cz0 = Math.floor((ed.z - r) / span) - 2;
        const cz1 = Math.floor((ed.z + r) / span) + 2;
        for (const cache of [this.state.voxelDensityCache, this.state.voxelMeshCache]) {
            if (!cache || !cache.size) continue;
            for (let cx = cx0; cx <= cx1; cx++)
                for (let cz = cz0; cz <= cz1; cz++)
                    for (let lod = 0; lod <= 3; lod++) cache.delete(`${cx},${cz},${lod}`);
        }
        if (!anhang) return; // die ganze Liste reist danach (`_standRueckspielen`)
        try {
            this._voxelZustandPost({
                type: "state-update",
                delta: {
                    voxelEditAppend: { x: ed.x, y: ed.y, z: ed.z, r: ed.r, mode: ed.mode },
                },
            });
        } catch (e) {
            this.log(`Voxel-Worker-Edit-Sync-Fehler: ${e.message}`, "ERROR");
        }
    }

    // Nach Worldgen: voller Atlas + waterLevel an den Worker; bumpt stateGen →
    // in-flight Requests vom Pre-Worldgen-Stand werden verworfen.
    _voxelWorkerSyncWorldgenState() {
        // V12.0-perf.b — Basis-Density-Cache bei Worldgen leeren (neue Welt =
        // neue Erosion/Tarn/Noise/Hydro → alte Basis ungültig). Worker-
        // unabhängig, daher VOR dem Worker-Early-Return.
        if (this.state.voxelBaseDensityCache) this.state.voxelBaseDensityCache.clear();
        // Hier wird der Voxel-Worker gebootstrappt (VOR der Hydrosphäre: er rechnet sie, Karte hydro-faden) — sonst spawnt
        // ihn nichts. Der Strom fragt den Faden erst, wenn die Heimat im Main steht (`_worldgenComputeAndBuildHydrosphere`),
        // dann schon vor dem Ack (B-K2).
        const neu = !this.state.voxelWorker;
        const worker = this._getVoxelWorker();
        if (!worker) {
            // der Blob-Weg bringt den Faden später: sein init trägt dann diese Welt (`_getVoxelWorker`)
            this._voxelWeltWartet = true;
            return;
        }
        if (this.state.voxelDensityCache) this.state.voxelDensityCache.clear();
        if (this.state.voxelMeshCache) this.state.voxelMeshCache.clear();
        // stateGen bumpt in _voxelWorkerSyncState (send-time). worldgenSynced bleibt ab jetzt true — der
        // Streaming-Pump traut dem Worker; Edits filtern je Chunk (`_voxelStand`). Ein eben geborener Faden trägt diese Welt
        // schon in seinem init — ein state-set dahinter wäre derselbe volle Klon ein zweites Mal (Lehre 24, B-K2).
        if (!neu) this._voxelWorkerSyncState({ op: "state-set" });
    }

    // ### Welten-Generierung ### V7.56
    generateTerrainWithParameters(steepness, baseHeight) {
        // V18.272 — WIDTH/DEPTH/CHUNK_SIZE waren nur die Maße des toten
        // Heightfield-Chunk-State (gekehrt); WORLD_SIZE lebt (Insel-Streuung).
        const WORLD_SIZE = 300;

        this._worldgenCleanupOldObjects();

        // Spieler-Position: first-spawn setzt auf (0,50,0), spätere Regen
        // erhalten die aktuelle Position. wasFirstSpawn wird VOR dem Setzen
        // von terrainEverGenerated gelesen (sowohl im Helfer als auch hier).
        const wasFirstSpawn = !this.state.terrainEverGenerated;
        this._worldgenInitPlayerPosition(wasFirstSpawn);
        this.state.terrainEverGenerated = true;
        if (wasFirstSpawn) this.grokMarkFirstSpawn();

        // V9.38 Phase 5c.2.c.3.b.ii — heightData/minHeight/maxHeight bleiben
        // null/0 in einer Voxel-Welt (voxelTerrain konstant true seit V9.35).
        // Alle Konsumenten sind voxel-aware (`getTerrainHeightAt` → `_voxelSurfaceY`).
        const heightData = null;
        const minHeight = 0;
        const maxHeight = 0;

        // ### Initiale Chunks-Setup ###
        // `voxelChunks` + `voxelChunkGrass` sind die EINE Terrain-Wahrheit (kein Heightfield-State mehr).
        if (!this.state.scaleFactor || this.state.scaleFactor <= 0) {
            this.state.scaleFactor = 1.0;
            this.log("scaleFactor ungültig oder nicht gesetzt, Fallback auf 1.0", "WARNING");
        }

        this._worldgenSpawnFloatingIslands(WORLD_SIZE);

        // V9.38/V9.43-c — `state.vegetation` bleibt als Sammler-Liste
        // (Worldgen-Vegetations-Pass + per-Chunk-Wasserfälle sind tot).
        this.state.vegetation = [];

        // ### Terrain-State ###
        // In der Voxel-Welt sind heightData/minHeight/maxHeight null bzw. 0 (Konsumenten ignorieren sie);
        // terrainSteepness trägt nur noch die Licht-Flachheit des Bodens (`terrainFlatten`) — das Gelände-Gesetz liest es seit
        // K16 nicht (die Landform liegt im Erbgut); terrainBaseHeight ist die Voxel-Anker-Höhe (Killplane-Basis,
        // getTerrainHeightAt-Fallback).
        this.state.groundHeightField = heightData;
        this.state.minHeight = minHeight;
        this.state.maxHeight = maxHeight;
        this.state.terrainSteepness = steepness;
        this.state.terrainBaseHeight = baseHeight;

        this._worldgenBuildVoxelChunkCache();
        // die Heimat entsteht im Faden (Karte hydro-faden): was das Wasser liest, folgt ihr — das Versprechen trägt es
        return this._worldgenComputeAndBuildHydrosphere().then((hydro) => {
            if (!hydro) return false; // eine neuere Welt kam ihr zuvor
            // Kreaturen sind deferierte Boot-Arbeit: `spawnCreatures(10)` (~3 s Skin-Isoflächen) gehört nicht
            // auf den kritischen Pfad — `_bootDeferCreatures` spawnt progressiv NACH der Kontrolle
            // (`_tickBootPhase3`), headless sofort (gate-treu).
            this._bootDeferCreatures(10);
            // V8.29 — Genesis-Plattform: beim ERSTEN Spawn einer Welt eine
            // erhöhte Stein-Scheibe am Zentrum, der Spieler startet darauf
            // (sieht von erhöhter Warte die Welt, fällt nicht blind in ein Tal).
            if (wasFirstSpawn) {
                try {
                    this._ensureGenesisPlatform();
                } catch (e) {
                    this.log(`Genesis-Plattform fehlgeschlagen: ${e.message}`, "ERROR");
                }
            }
            return true;
        });
    }

    // Alle alten Welt-Objekte abräumen: groundMesh, floatingIslands, ufos, creatures (+ creatureEmotions),
    // vegetation, Hydrosphären-Meshes (Fluss/See/Wasserfall).
    _worldgenCleanupOldObjects() {
        if (this.state.groundMesh) {
            this.state.scene.remove(this.state.groundMesh);
            // P3 — kein Ammo-Body mehr am Boden-Mesh.
            this.state.rigidBodies = this.state.rigidBodies.filter((rb) => rb !== this.state.groundMesh);
            this.state.groundMesh = null;
            this.state.groundHeightField = null;
            this.log("Alter Boden entfernt");
        }
        // Log nur bei count > 0 — `if (array)` ist auch für [] wahr (Phantom-Abriss im Boot-Log).
        if (this.state.floatingIslands && this.state.floatingIslands.length) {
            this.state.floatingIslands.forEach((island) => {
                this.state.scene.remove(island);
            });
            this.log(`Alte fliegende Inseln entfernt (${this.state.floatingIslands.length})`);
        }
        this.state.floatingIslands = [];
        if (this.state.ufos && this.state.ufos.length) {
            this.state.ufos.forEach((ufo) => this.state.scene.remove(ufo));
            this.log(`Alte UFOs entfernt (${this.state.ufos.length})`);
        }
        this.state.ufos = [];
        if (this.state.creatures && this.state.creatures.length) {
            this.state.creatures.forEach((creature) => {
                this.state.scene.remove(creature);
                // P3 — Kreaturen tragen keinen Ammo-Body mehr; nur die rigidBodies-Ref lösen.
                this.state.rigidBodies = this.state.rigidBodies.filter((rb) => rb !== creature);
            });
            this.log(`Alte Kreaturen entfernt (${this.state.creatures.length})`);
        }
        for (const l of this.state.leichname.slice()) this.removeCreature(l); // die Gefallenen gehen mit der alten Welt
        this.state.creatures = [];
        this.state.creatureEmotions = [];
        if (this.state.vegetation && this.state.vegetation.length) {
            this.state.vegetation.forEach((veg) => {
                this.state.scene.remove(veg);
            });
            this.log(`Alte Vegetation entfernt (${this.state.vegetation.length})`);
        }
        this.state.vegetation = [];
        // V9.43-c — Hydrosphären-Meshes (Fluss-Ribbons, See-Planes, Wasserfall-
        // Planes) abräumen. Der V9.43-a-per-Chunk-Wasserfall-Spawner ist abgelöst.
        this._disposeHydrosphereMeshes();
    }

    // Erster Spawn auf (0, 50, 0); spätere Regen-Aufrufe (Nexus terrainFlatten, „Spawne neue Welt")
    // behalten die Position, sonst teleportiert jede Selbstoptimierung den Spieler. Liegt er danach
    // unter dem Boden, fangen Kill-Plane + findSurfaceAbove ab.
    _worldgenInitPlayerPosition(isFirstSpawn) {
        if (!this.state.playerMesh) {
            this.log("Warnung: playerMesh nicht initialisiert – sollte in init() initialisiert sein", "ERROR");
            return;
        }
        this.state.playerMesh.visible = true;
        if (isFirstSpawn) {
            this.state.playerMesh.position.set(0, 50, 0);
            // Feld-nativ: die Velocity nullen, der vertikale Feld-Zustand zurück (kein Ammo-Body).
            if (this.state.playerVel) this.state.playerVel.setValue(0, 0, 0);
            this.state._fieldVy = 0;
            this.log("Welt erstmals gespawnt: Spieler bei (0, 50, 0)");
        } else {
            this.log("Welt regeneriert – Spieler-Position bleibt erhalten", "DEBUG");
        }
    }

    // V9.88 (Welle Perf-3.b — Distance-LOD): `lod` (0 oder 1) wählt die
    // Chunk-Auflösung — LOD 0 = volle Detail (24·24·124 Cells), LOD 1 =
    // 8× weniger Cells (12·12·62 für ferne Chunks). Doc §4 + Helper
    // `_voxelChunkLodFor` für die per-Frame-Entscheidung im Streaming-Tick.
    // V9.90 (Phase 2 — Worker-Density-Cutover): optionaler `preDensityOverride`
    // erlaubt dem Streaming-Pfad, ein vom Worker vorberechnetes Density-Grid
    // einzureichen — der teuerste Sampling-Loop (~91k Vertices für LOD 0)
    // läuft dann im Worker, nicht im Main-Thread. Wenn null, sampelt
    // `_buildVoxelChunkData` synchron wie zuvor (Fallback ohne Worker).
    _buildVoxelChunkData(cx, cz, lod = 0, preDensityOverride = null) {
        if (!this.state.scene) return null;
        // DER CHUNK-STOFF IM HAUPT-FADEN (Lehre 14): jeder Bau hier zählt an seiner Sync-Stelle oder bricht laut (`_fadenUmgangen`)
        this._fadenUmgangen(
            this._voxelFadenTraegt() ? "Chunk-Stoff neben dem Faden" : "Chunk-Stoff, kein Faden trägt den Stand"
        );
        const { dim, step, span, dimY, floorDrop } = this._voxelChunkConfig(lod);
        const base = this.state.terrainBaseHeight || 0;
        const ox = cx * span;
        const oz = cz * span;
        const oy = base - floorDrop;
        // Density-Grid EINMAL samplen und an Boden-Mesher + Cell-Build reichen (~71k Dichte-Calls/Chunk).
        // Grid = (dim+4)·(dimY+1)·(dim+4) Vertex-Dichten, Pad bei `ox-step, oz-step`. Kommt es vorberechnet
        // vom Worker, entfällt der Sample-Loop; die Indizierung (ox-step, dim+3, Pad) muss EXAKT zum Worker
        // passen, sonst Drift.
        let terrainDensity;
        if (preDensityOverride && preDensityOverride.length === (dim + 4) * (dimY + 1) * (dim + 4)) {
            // Worker/GPU-Grid direkt nutzen, aber NICHT als Basis cachen: GPU-WGSL rechnet transzendente
            // Funktionen implementation-defined, also nicht bit-identisch zur CPU. Der Base-Cache füllt sich
            // nur aus dem Sync-Pfad (else-Zweig).
            terrainDensity = preDensityOverride;
        } else {
            // V12.0-perf.b — base-gecachter Sync-Pfad. Statt ~126 ms
            // `_terrainDensityAt`-Grid-Sample wird die worldgen-frozen Basis
            // gecacht; nur die billige Form der Edits wird neu aufgelegt.
            terrainDensity = this._voxelEditedDensityGrid(
                `${cx},${cz},${lod}`,
                ox - step,
                oy,
                oz - step,
                dim + 3,
                dimY,
                dim + 3,
                step
            );
        }
        // Pad-Aufruf: Origin um einen `step` versetzt, dimX/Z = `dim + 3` (dim + 1 Skirt + 2·1 Pad),
        // `cropMargin = 1`, smoothIters=1. Mehr Glätt-Iterationen bräuchten 2 Zellen Pad im GETEILTEN
        // Density-Grid (die Wasser-Cells indizieren es bei dim+4) — nie nur hier ändern, sonst Seam-Riss.
        // Die Höhlen-Schicht (Welle 7): der Sicht-Graph der Höhlen-Luft aus demselben Gitter (der Worker baut ihn gleich).
        const hoehle = this._voxelHoehlenGraph(terrainDensity, ox - step, oy, oz - step, dim + 3, dimY, dim + 3, step);
        const geom = this._voxelChunkGeometry(
            ox - step,
            oy,
            oz - step,
            dim + 3,
            dimY,
            dim + 3,
            step,
            undefined,
            1,
            terrainDensity,
            1,
            hoehle
        );
        if (!geom) return { mesh: null, kind: "empty" };
        this._attachVoxelFieldColors(geom);
        // DER GEOMORPH DER STUFE (K51-2): das Ziel jedes Vertex auf dem Netz der nächst gröberen Stufe samt Normale und Stoff-
        // Farbe (derselbe Bau wie im Worker, `_stufeZielNetz`), die Stufe im Morph-Code — die gröbste Stufe trägt ihre eigenen
        {
            const A = geom.attributes;
            let nZ = A.normal.array,
                fZ = A.color.array;
            if (lod < 3) {
                const st = this._stufeZielNetz(A.position.array, A.normal.array, A.color.array, cx, cz, lod + 1);
                A.aMorphTarget.array.set(st.ziel);
                geom.userData.stufeZiel = st.ziel;
                nZ = st.felder[0];
                fZ = st.felder[1];
            }
            A.aMorphWeight.array.fill(this._morphCode(lod, 0));
            geom.setAttribute("aNormalZiel", new THREE.Float32BufferAttribute(new Float32Array(nZ), 3));
            geom.setAttribute("aFarbeZiel", new THREE.Float32BufferAttribute(new Float32Array(fZ), 3));
        }
        // Material-Singleton für alle Chunks (Vertex-Farben leben pro Geometrie; PBR, roughness/metalness
        // aus den Tags). NIEMALS disposen — sonst sterben alle anderen Chunks mit (s. `_disposeVoxelChunk`).
        // Der CPU-Körper des Chunks (gezeichnet als Bereich im Boden-Satz, `_chunkSatzEin`).
        const mat = this._getVoxelChunkMaterial();
        const mesh = new THREE.Mesh(geom, mat);
        mesh.userData = { voxelChunkX: cx, voxelChunkZ: cz };
        // Kein Chunk-BVH (Kollision liest feld-nativ das Dichtefeld). waterCells = EINZIGE Wasser-Wahrheit
        // je Chunk (im entry); das Trocken-Gate spart den ~200-ms-Cell-Bau, null überspringt der Iso-Bau.
        // Cells IMMER in LOD 0 (naht-frei): LOD 0 teilt `terrainDensity`, LOD ≥ 1 sampelt ein LOD-0-Grid.
        let waterCells = null;
        if (this._voxelChunkHasAnyWater(cx, cz)) {
            if (lod === 0) {
                waterCells = this._buildVoxelChunkWaterCells(ox, oy, oz, step, terrainDensity, 0);
            } else {
                // V12.0-perf.b — auch das LOD-0-Zweitgrid (Wasser-Cells für
                // einen LOD-1-Chunk) läuft base-gecacht. Eigener LOD-0-Cache-
                // Key, damit es nicht mit dem LOD-1-Terrain-Grid kollidiert.
                const lod0Cfg = this._voxelChunkConfig(0);
                const lod0Density = this._voxelEditedDensityGrid(
                    `${cx},${cz},0`,
                    ox - lod0Cfg.step,
                    oy,
                    oz - lod0Cfg.step,
                    lod0Cfg.dim + 3,
                    lod0Cfg.dimY,
                    lod0Cfg.dim + 3,
                    lod0Cfg.step
                );
                waterCells = this._buildVoxelChunkWaterCells(ox, oy, oz, lod0Cfg.step, lod0Density, 0);
            }
        }
        const karte = this._bodenKarteNaht(geom, cx, cz, lod, geom.attributes.position.array, "lage");
        return { mesh, kind: "filled", waterCells, lod, surfMap: karte && karte.hoehe, gruenMap: karte && karte.gruen };
    }

    // DIE geteilte Build-Kaskade für Streaming UND Edit-Rebuild: 1 Worker-Mesh-Cache (Main nur
    // BufferGeometry + Architektur-Stempel + BVH) · 2 Worker-Density-Cache · 3 Sync-CPU (base-gecacht).
    // Rückgabe: "pending" · null (Fail/degeneriert) · {mesh, kind, waterCells, lod, hasBVH?}.
    // `forceSync` (die Sync-Stelle beim Namen, `SYNC_STELLEN`; true = die Test-Naht) springt direkt zu Stufe 3 (kein
    // Worker-Roundtrip).
    _acquireVoxelChunkBuild(cx, cz, lod, opts = {}) {
        // Harte Kachel-Garantie am EINEN Build-Eingang: vor jedem Chunk-Bau steht die Hydrosphäre seines Footprints (+64 m Pad
        // für Reads über die Grenze), im Faden entstanden (Karte hydro-faden) — fehlt sie, ist sie bestellt und der Bau wartet.
        // Der Faden trägt sie vor jedem Auftrag dahinter (Nachrichten-Ordnung) → Main und Worker bauen aus derselben Kachel.
        if (!this._hydroSteht(cx, cz)) return "pending";
        if (opts.forceSync) {
            // V18.263 — der Player-Chunk-Sync-Build ist der Freeze-Verdächtige
            // (~239 ms, blockiert den Main-Thread). Der Perf-Sense misst ihn IMMER
            // (µs-Tap), damit der Nexus die Streaming-Last kennt, nicht rät.
            const _t0 = performance.now();
            const stelle = opts.forceSync === true ? "naht" : opts.forceSync;
            const _r = this._syncBauen(stelle, () => this._buildVoxelChunkData(cx, cz, lod));
            this._perfMark("syncBuild", performance.now() - _t0);
            return _r;
        }
        // Stufe 1: Worker-Mesh — sobald der Faden den Stand trägt, nicht erst nach seinem Ack (B-K2).
        const faden = this._voxelFadenTraegt();
        let workerMesh;
        if (faden) {
            workerMesh = this._fetchOrRequestChunkMesh(cx, cz, lod);
            if (workerMesh === null) return "pending";
        }
        // V9.92 Phase 4 — Lazy-BVH-Decision: BVH sofort nur im 2-Ring.
        let buildBVH = true;
        const lpc = this.state.lastPlayerVoxelChunk;
        if (lpc) buildBVH = this._voxelChunkLazyBVHFor(cx, cz, lpc.cx, lpc.cz);
        if (workerMesh) {
            return this._buildVoxelChunkDataFromWorkerMesh(cx, cz, lod, workerMesh, { buildBVH });
        }
        // Keine GPU-Density-Stufe: Worker (Stufe 2) + Sync-CPU (Stufe 3) sind die Wahrheit — ein dritter
        // Makro-Spiegel driftet. Käme WebGPU-Density, dann auf dem Renderer-Device (zero-copy).
        let preDensity = null;
        // Stufe 2: Worker-Density (Fallback wenn Worker-Mesh ineligible/down).
        if (!preDensity && faden) {
            const workerDensity = this._fetchOrRequestChunkDensity(cx, cz, lod);
            if (workerDensity === null) return "pending";
            preDensity = workerDensity;
        }
        // Stufe 3: der Chunk-Stoff im Haupt-Faden (base-gecacht V12.0-perf.b) — im Strom nur, wo KEIN Faden den Stand trägt
        // (kein Worker, ein ausgehängter Faden einer Test-Naht, vor der Weltgen), und dann laut (Lehre 14, `_fadenUmgangen` im
        // Bau): bis B-K2 baute der Strom hier still jeden Chunk bis zum Ack des Fadens (gate:worker-dichte Teil S).
        return this._buildVoxelChunkData(cx, cz, lod, preDensity);
    }

    // DER geteilte Finalize-Schritt beider Pfade: Mesh in die Scene, Entry setzen, Gras + Iso-Wasser +
    // Vegetation. `fresh` muss ein erfolgreicher Build sein. Gibt das Entry zurück oder null
    // (degenerierte Iso-Fläche → {empty:true}).
    _finalizeVoxelChunkBuild(cx, cz, lod, fresh, syncWater = false, altLod = null, stufe = false) {
        const key = `${cx},${cz}`;
        if (fresh.kind === "empty") {
            this.state.voxelChunks.set(key, { empty: true });
            this._weltRegt(true); // die Chunk-Menge regt sich: die Stand-Wache weckt die Fege-Takte (Boden-Stempel)
            return null;
        }
        // DER EINBAU DES FRAMES (K69-2): die nächste Ring-Distanz, in der dieser Frame einen Chunk einbaut — der Neubau-Takt
        // (`_tickDirtyVoxelChunks`) baut danach nur Näheres ein (Lehre 25: NAH zuerst); der Frame-Planer setzt sie zurück.
        {
            const lpc = this.state.lastPlayerVoxelChunk;
            const d = lpc ? Math.max(Math.abs(cx - lpc.cx), Math.abs(cz - lpc.cz)) : 0;
            const b = this.state._bodenEinbau;
            if (b == null || d < b) this.state._bodenEinbau = d;
        }
        // DER SATZ (Welle B): der Boden ist ein BEREICH im Boden-Satz (ein Befehl je Pass für den ganzen Ring);
        // der Chunk-Mesh bleibt der CPU-Körper (Boden-Karte, Geomorph, Stitch-Quelle) und betritt die Szene nie.
        // Worker- und Sync-Bau speisen denselben Eintritt.
        if (fresh.mesh && !fresh.mesh.name) fresh.mesh.name = "voxelChunk:" + key + ":lod" + lod;
        // Fail-closed: jeder Boden-Chunk trägt seinen Höhlen-Graph (Welle 7, `_voxelHoehlenGraph`) — ohne ihn wüsste der
        // Satz nicht, welche Fläche aus dem Himmel zu sehen ist.
        if (!fresh.mesh.geometry.hoehle) throw new Error(`_finalizeVoxelChunkBuild(${key}): Boden ohne Höhlen-Graph`);
        this._chunkSatzEin("boden", key, fresh.mesh.geometry, key);
        // V9.92 — `fresh.hasBVH` true wenn BVH gebaut (Lazy-Decision im Worker-
        // Mesh-Pfad). Sync-Build baut immer BVH → default true.
        const entry = {
            mesh: fresh.mesh,
            waterCells: fresh.waterCells || null,
            zellenId: fresh.zellenId || null, // die Zellen des Fadens (das Wasser-Sheet nimmt sie per Verweis)
            zellenFest: fresh.zellenFest || null, // … samt der Zellen, die der Architektur-Stempel fest machte
            // Die Boden-Karte (der GERENDERTE Boden, `_bodenKarteAusMesh`, beide Pfade): Stand, Gras und Streu
            // lesen sie über den EINEN Leser `_bodenSichtAt` (am Chunk-Rand die Karte des Nachbarn).
            surfMap: fresh.surfMap || null,
            gruenMap: fresh.gruenMap || null,
            lod,
            hasBVH: typeof fresh.hasBVH === "boolean" ? fresh.hasBVH : true,
        };
        this.state.voxelChunks.set(key, entry);
        this._streuFussNeu(cx, cz); // die Streu über ihm steht auf seiner Karte (Gelände H5)
        // DIE NEUEN ZELLEN TRAGEN DAS GESETZ (F3): Kappe und Quellen des Automaten leiten sich aus ihnen neu ab, und mit der
        // neuen Kappe legt `_ensureWaterCALevel` das Level auf das Gesetz. Bis F3 hielt der Automat die Kappe der alten Zellen,
        // wenn der Neubau nach dem Edit kam (der Fußabdruck baut im Worker, bau-faden): der Graben zeichnete trocken.
        if (this.state.waterCapJ) this.state.waterCapJ.delete(key);
        if (this.state.waterSourceCols) this.state.waterSourceCols.delete(key);
        // die Chunk-Menge regt sich: die Stand-Wache weckt die Fege-Takte (Boden-Stempel); ein reiner Stufen-Wechsel (`stufe`,
        // K51-5) regt nur die Boden-Karte — die Menge steht, Wald, Streu und Sichthöhen lesen sie nicht
        this._weltRegt(true, stufe);
        // Gras nur im Nah-Ring (Distanz-Gate unten); Iso-Wasser ist der EINZIGE Wasser-Render-Pfad,
        // Streu-Strukturen idempotent je Chunk einmal. span ist über alle LODs gleich (43.2 m) → derselbe
        // Gras-Build trägt LOD 0 und LOD 1.
        {
            const _pcx = this.state.lastPlayerVoxelChunk ? this.state.lastPlayerVoxelChunk.cx : cx;
            const _pcz = this.state.lastPlayerVoxelChunk ? this.state.lastPlayerVoxelChunk.cz : cz;
            const _gr = Math.max(Math.abs(cx - _pcx), Math.abs(cz - _pcz));
            // Gras-Ring bis Chunk-Distanz 4 (~389 m, Fog-Kante); die Ferne baut DÜNNER (lod ≥ 1 →
            // Dichte-Faktor, s. _buildVoxelChunkGrass). grass-dirty baut sofort, fehlend/LOD-Wechsel queued.
            if (_gr <= 4) {
                const _gKey = `${cx},${cz}`;
                const _gd = this.state.grassDirtyChunks;
                const _hasGrass = this.state.voxelChunkGrass && this.state.voxelChunkGrass.has(_gKey);
                const _gLod = this.state.voxelChunkGrassLod ? this.state.voxelChunkGrassLod.get(_gKey) : undefined;
                if (_gd && _gd.has(_gKey)) {
                    // Welle G-fix — die Oberfläche änderte sich (Carve/Fill): das
                    // (in _disposeVoxelChunk mit keepGrass=false entfernte) Gras
                    // SYNCHRON neu bauen → kein Flackern, nur DIESER Bereich.
                    _gd.delete(_gKey);
                    this._buildVoxelChunkGrass(cx, cz);
                } else if (!_hasGrass) {
                    // Welle A — Streaming/Erst-Build (kein Gras vorhanden): deferred
                    // (≤1/Frame, kein Flackern da kein altes Gras da war).
                    this._enqueueGrass(cx, cz);
                } else if (_gLod !== undefined && _gLod !== lod) {
                    // V18.97 — der Chunk wechselte die LOD-Stufe (fern↔nah):
                    // die Gras-DICHTE passt nicht mehr (fern baut dünner) →
                    // altes Gras weg + deferred neu in der neuen Dichte.
                    this._disposeVoxelChunkGrass(_gKey);
                    this._enqueueGrass(cx, cz);
                }
                // sonst: Gras existiert + Oberfläche unverändert (Nexus-Spawn/
                // Skirt) → es wurde gar nicht disposed → BEHALTEN.
            }
        }
        // Wasser-Iso sonst deferred (~78 ms Surface-Nets, ≤budget/Frame → kein Streaming-Spike). Beim
        // Edit-Rebuild (`syncWater`) SYNCHRON — sonst fehlt der Iso 1–2 Frames am Edit-Punkt (Flackern).
        if (syncWater) this._buildVoxelChunkWaterIsoSurface(cx, cz);
        // Erst-Paint off-thread: ein einstreamender Chunk ist CA-frei → der Worker baut das Sheet byte-identisch.
        // Nicht eligible (kein Worker · aktiv fließende Nachbarn · kein Wasser) → deferred Queue (Sync-Fallback im
        // Tick). DER WASSER-AUTOMAT WACHT NUR, WO DIE WELT ABWEICHT (Welle L, W-W1): Graben, Füllen, ein Damm wecken
        // ihn (`_wakeWaterCA` aus Edit/Stau); ungestörtes Wasser IST das Gesetz. Bis V18.531 weckte jeder einstreamende
        // Wasser-Chunk im Nah-Ring den Automaten — er rechnete den ruhenden Fluss in ganzen 1,8-m-Zellen nach, der
        // Quellen-Pin füllte sie bis 0,9 m über den Spiegel, das Wasser lief in jedes Ufer darunter: am Fluss der
        // Mess-Wiese trugen 81 von 233 trockenen Ufer-Proben Körper-Wasser bis 4,6 m über dem Gras (Tauch-Nebel),
        // und jeder geweckte Chunk zog seine Nachbarn aus dem Worker-Sheet in den Sync-Bau.
        else if (!this._tryWorkerWaterSheet(cx, cz)) this._enqueueWaterIso(cx, cz);
        // Der neue Chunk ist Flood-Wahrheit für seine Nachbarn, deren Iso evtl. gegen ihn als ABWESEND
        // gebaut wurde. Der Iso-Mesher liest alle 8 Nachbarn (inkl. DIAGONALEN) → alle 8 re-enqueuen, nicht
        // nur die Achsen (sonst klebt Wasser an Gebäude-Ecken). Nur wassertragende; idempotent über das Set.
        for (const [nx, nz] of [
            [cx - 1, cz],
            [cx + 1, cz],
            [cx, cz - 1],
            [cx, cz + 1],
            [cx - 1, cz - 1],
            [cx + 1, cz - 1],
            [cx - 1, cz + 1],
            [cx + 1, cz + 1],
        ]) {
            const nb = this.state.voxelChunks.get(`${nx},${nz}`);
            if (nb && nb.waterCells) this._enqueueWaterIso(nx, nz);
        }
        // V18.275 — KAPAZITÄTS-GATE: nur füllen, wenn der Chunk im `foliageRadius` liegt;
        // sonst wartet er in `pendingFoliageChunks`, bis der Radius (mit der gemessenen
        // Render-Kapazität) zu ihm wächst (`_tickFoliageGrowth`). So bleibt der Spawn leicht.
        if (!this._bepflanzungWartet() && this._foliageChunkInRadius(cx, cz)) {
            this._populateVoxelChunkVegetation(cx, cz);
        } else {
            if (!this.state.pendingFoliageChunks) this.state.pendingFoliageChunks = new Set();
            this.state.pendingFoliageChunks.add(`${cx},${cz}`);
        }
        // Cross-LOD-Geomorph: diesen Chunk an GROBE Nachbarn schmiegen + die Nachbarn des 3×3-Rings neu morphen, die ihn LESEN
        // (ein FEINER Nachbar, der auf diesen wartete, schließt jetzt seine Naht — auch an der Ecke). Main-only, render-only.
        // DIE FOLGE DES WECHSELS (K51-4): ein Nachbar schmiegt sich nur an gröbere Nachbarn — er liest diesen Chunk, wenn dessen
        // neue Stufe gröber ist als seine (die Naht folgt dem neuen Netz) oder dessen alte (`altLod`: die alte Naht fällt).
        // Jeder andere behält seinen Morph; bis K51-3 morphte jeder Wechsel alle acht neu (OMEN 1410-boden gehend: die
        // Folge-Neubauten des Stufen-Wechsels, Frame p95 28,7 → 41,6 ms; Radeon je Neubau ~9 Morphs à 1,2–1,5 ms).
        // Der Chunk selbst morpht sofort (sein erstes Netz); die Folge seiner Nachbarn geht in die Folge-Schlange
        // (`_tickMorphFolge`), die sein eigener Morph für ihn schließt.
        if (this.state._morphFolge) this.state._morphFolge.delete(key);
        this._applyCrossLodGeomorph(cx, cz);
        for (let dx = -1; dx <= 1; dx++)
            for (let dz = -1; dz <= 1; dz++) {
                if (dx === 0 && dz === 0) continue;
                const nb = this.state.voxelChunks.get(`${cx + dx},${cz + dz}`);
                if (!nb || nb.empty || !nb.mesh) continue;
                const nl = Number.isFinite(nb.lod) ? nb.lod : 0;
                if (!(lod > nl || (altLod !== null && altLod > nl))) continue;
                const F = this.state._morphFolge || (this.state._morphFolge = new Map());
                const nk = `${cx + dx},${cz + dz}`;
                if (!F.has(nk)) F.set(nk, this._schedFrameNo | 0);
            }
        return entry;
    }

    // DIE FOLGE DES WECHSELS IM TAKT (fahrt-takt, profiband.K1, Lehre 25): ein Nachbar, den ein Stufen-Wechsel neu morphen
    // lässt, wartet in der EINEN Folge-Schlange (Chunk → Takt der ersten Bitte) und morpht EINMAL gegen den letzten Stand
    // seiner Nachbarn — ein Ring-Wechsel baut seine Reihe Chunk für Chunk (je Takt einer), bis fahrt-takt morphte der Nachbar
    // nach jedem neu (Radeon in Fahrt 20 m/s: 648 von 1 119 Folge-Morphs wiederholten sich binnen 10 Takten, 481 von 762 ms).
    // Nah zuerst (Ring-Abstand, dann die ältere Bitte), im Takt ohne Chunk-Einbau bis `ms`, mindestens einer; nie verhungert:
    // eine Bitte, älter als MORPH_FOLGE_FRIST Takte, morpht in jedem Takt. Der Morph liest die Nachbarn, wie sie dann stehen —
    // byte-gleich mit dem Morph nach jedem Wechsel (der letzte gewinnt, `_applyCrossLodGeomorph` ist ein Zustand der Netze).
    _tickMorphFolge(ms) {
        const F = this.state._morphFolge;
        if (!F || F.size === 0) return 0;
        const takt = this._schedFrameNo | 0;
        const p = this.state.lastPlayerVoxelChunk;
        const reihe = [];
        for (const [key, seit] of F) {
            const k = key.indexOf(",");
            const cx = Number(key.slice(0, k)),
                cz = Number(key.slice(k + 1));
            reihe.push({ key, cx, cz, seit, d: p ? Math.max(Math.abs(cx - p.cx), Math.abs(cz - p.cz)) : 0 });
        }
        reihe.sort((a, b) => a.d - b.d || a.seit - b.seit || (a.key < b.key ? -1 : 1));
        const t0 = performance.now();
        let n = 0;
        for (const e of reihe) {
            const faellig = takt - e.seit >= AnazhRealm.MORPH_FOLGE_FRIST;
            if (!faellig && (ms <= 0 || (n > 0 && performance.now() - t0 >= ms))) continue;
            F.delete(e.key);
            this._applyCrossLodGeomorph(e.cx, e.cz);
            n++;
        }
        return n;
    }

    // DIE NAHT DES CHUNKS (gehen-takt, Lehre 25): was ein Naht-Morph berühren KANN, steht mit dem Netz fest — die Rand-Vertices
    // (bis zum Morph-Band, 2 Schritte, an einer Kante: nur sie zieht `_applyCrossLodGeomorph` an einen Nachbarn), die Rand-
    // Dreiecke (≥ 1 Rand-Vertex: nur sie tragen Stitch-Kanten) und je Seite (x−, x+, z−, z+) die Dreiecke, die ein FEINERER
    // Nachbar als grobe Fläche liest (eine Ecke ≤ 1,5 Schritte an der Kante), dazu je lesender Richtung ihre Kandidaten
    // (`kand`, der Morph legt sie an). Einmal je Geometrie (ihre Lage ist unveränderlich, ein Edit baut neu); bis gehen-takt
    // ging jeder Morph alle Vertices des Chunks und alle Dreiecke jedes gröberen Nachbarn (je Ecke ein Math.hypot) und
    // rasterte die ganze Boden-Karte — Radeon gehend 4,9 ms in den Spitzen-Takten (`werkbank takt`), in der Mitte 0. Die
    // Listen sind Obermengen (EPS): der Morph prüft jede Stelle exakt.
    _bodenNaht(geom, cx, cz, lod) {
        const u = geom.userData;
        if (u.naht) return u.naht;
        const { span: S, step } = this._voxelChunkConfig(lod);
        const P = geom.attributes.position.array;
        const idx = geom.index.array;
        const ox = cx * S,
            oz = cz * S;
        const EPS = 1e-3; // die Rundung zwischen `i · span − x` (der Morph) und `x − cx · span` (hier)
        const mb = 2 * step + EPS,
            bnd = 1.5 * step + EPS;
        const n = P.length / 3;
        const rand = [];
        const randSeite = [[], [], [], []]; // die Rand-Vertices je Seite x−, x+, z−, z+ (≤ Morph-Band an der Kante)
        const seiteV = new Uint8Array(n); // 16 = Rand-Vertex, dazu die Seiten-Bits 1 x− · 2 x+ · 4 z− · 8 z+ (≤ bnd)
        for (let v = 0; v < n; v++) {
            const lx = P[v * 3] - ox,
                lz = P[v * 3 + 2] - oz;
            const an = [lx <= mb, lx >= S - mb, lz <= mb, lz >= S - mb];
            if (!an.includes(true)) continue;
            rand.push(v);
            for (let s = 0; s < 4; s++) if (an[s]) randSeite[s].push(v);
            seiteV[v] =
                16 | (lx <= bnd ? 1 : 0) | (lx >= S - bnd ? 2 : 0) | (lz <= bnd ? 4 : 0) | (lz >= S - bnd ? 8 : 0);
        }
        const nT = Math.floor(idx.length / 3);
        const randTri = [];
        const seite = [[], [], [], []];
        for (let q = 0; q < nT; q++) {
            const f = seiteV[idx[q * 3]] | seiteV[idx[q * 3 + 1]] | seiteV[idx[q * 3 + 2]];
            if (!f) continue;
            randTri.push(q * 3);
            for (let s = 0; s < 4; s++) if (f & (1 << s)) seite[s].push(q * 3);
        }
        u.naht = {
            rand: Int32Array.from(rand),
            randSeite: randSeite.map((l) => Int32Array.from(l)),
            randTri: Int32Array.from(randTri),
            seite: seite.map((l) => Int32Array.from(l)),
            seiteV, // je Vertex die Seiten-Bits (das Naht-Band liest seine Kanten-Kandidaten daraus, `_rebuildLodStitchBand`)
            kanten: null,
            kand: [], // je lesender Richtung (dx, dz) die Kandidaten eines feineren Nachbarn (`_applyCrossLodGeomorph`)
            treffer: [], // je Richtung der Treffer dieses Netzes auf dem gröberen Nachbarn, mit dessen Geometrie
            gesetzt: false, // der erste Morph setzt das ganze Netz auf das Ziel seiner Stufe, jeder weitere nur den Rand
            lage: null, // die letzte Karte je Art samt ihrer Lage (`_bodenKarteNaht`)
            ziel: null,
        };
        return u.naht;
    }

    // DIE BODEN-KARTE ÜBER DER NAHT (gehen-takt): die erste Karte je Geometrie rastert ganz, jede weitere nur die Zellen, über
    // denen ein Dreieck gegen die vorige seine Lage ändert (`_bodenKarteAusMesh` mit `basis`); die Karte ist danach unveränderlich
    // und hält ihre Lage. `art` "lage": die gezeichnete Lage samt Grün (Bau und Naht-Morph, je Ruf ein neuer Puffer), "ziel": die
    // Morph-Ziele, nur die Höhe (`_bodenStufeMisch`; der Attribut-Puffer, darum eine Kopie).
    // `ganz`: jede Ecke kann sich bewegt haben (die vorläufige Gestalt eines Edits, `_editGestaltVorlaeufig`), nicht nur der Saum.
    _bodenKarteNaht(geom, cx, cz, lod, lage, art, ganz = false) {
        if (!geom.index) return null;
        const naht = this._bodenNaht(geom, cx, cz, lod);
        // DIE KARTE EINES FADEN-NETZES RASTERT DER FADEN (w4-b-boden): ihre erste Lage im Haupt-Faden ist ein Bau neben ihm —
        // er zählt an seiner Sync-Stelle oder bricht laut beim Namen (`_fadenUmgangen`, die Faden-Linse liest das Buch)
        if (!naht[art] && geom.userData.ausFaden && geom.index.array.length >= 3 && (art === "lage" || (lod | 0) < 3))
            this._fadenUmgangen(`Boden-Karte (${art}) eines Faden-Netzes`);
        const col = art === "lage" && geom.attributes.color ? geom.attributes.color.array : null;
        const ref = art === "lage" ? lage : new Float32Array(lage);
        // DIE KARTE AN ORT UND STELLE (w4-b-boden): jede weitere Karte derselben Geometrie rastert in die Felder der vorigen —
        // keine Kopie je Naht-Morph (die Karte kommt aus dem Faden: der Haupt-Faden kopierte ihre Bytes, Fahrt 12,7 MB/min,
        // gate:worker-dichte K5). Der Stand der Karte zählt jede neue Lage, je Zelle der Stand ihres letzten Wechsels: der
        // Leser einer früheren Lage (`_bodenKartenStehen`) fragt ihn statt einer alten Kopie.
        const alt = naht[art];
        const k = this._bodenKarteAusMesh(ref, geom.index.array, col, cx, cz, lod, alt, ganz ? null : naht, !!alt);
        if (!k || !alt) return (naht[art] = k && Object.assign(k, { ref }));
        // dieselbe Karte (dieselben Felder, dasselbe Objekt): ihr Stand steigt, die gewechselten Zellen tragen ihn
        alt.stand = (alt.stand | 0) + 1;
        alt.zelleStand = alt.zelleStand || new Uint32Array(alt.hoehe.length);
        for (const z of k.geaendert) alt.zelleStand[z] = alt.stand;
        return Object.assign(alt, { ref, geaendert: k.geaendert });
    }

    // Zieht die Boundary-Vertices dieses Chunks auf die GROBE Oberfläche jedes gröberen Achsen-
    // Nachbarn → die T-junction schließt. Render-only: setzt NUR aMorphTarget/aMorphWeight, Positionen
    // (Physik, Determinismus, BVH) bleiben; der Shader morpht via `geomorph`. Main-only (liest Nachbar-
    // MESHES). `entry.hasMorph` = Fast-Path: ohne Cross-LOD-Grenze + ohne alten Morph sofort zurück.
    // Die Morph-Arrays sind Views auf den Boden-Satz: der Pass schreibt direkt hinein und markiert seinen
    // Bereich (`_chunkSatzMarke`) — vergessen hieße: der Morph friert auf der GPU ein (T-Junction-Riss).
    _applyCrossLodGeomorph(cx, cz) {
        if (!this.state.voxelChunks) return;
        const entry = this.state.voxelChunks.get(`${cx},${cz}`);
        if (!entry || entry.empty || !entry.mesh || !entry.mesh.geometry) return;
        const geom = entry.mesh.geometry;
        const pos = geom.attributes.position;
        const tgtAttr = geom.attributes.aMorphTarget;
        const wAttr = geom.attributes.aMorphWeight;
        if (!pos || !tgtAttr || !wAttr) return;
        const myLod = Number.isFinite(entry.lod) ? entry.lod : 0;
        const cfg = this._voxelChunkConfig(myLod);
        const span = cfg.span;
        const fineStep = cfg.step;
        // die GROBEREN, gebauten Nachbarn des 3×3-Rings sammeln — Achse UND Ecke (K51): ein Vertex, den zwei Chunks derselben
        // Stufe teilen, schmiegt sich in beiden an dieselbe grobe Fläche. Nur mit den Achsen-Nachbarn rechnete jeder Chunk die
        // Naht-Ecke eines gröberen Nachbarn gegen ein anderes Netz — die geteilten Vertices klafften (Loch-Probe der Fern-Ring-
        // Naht, L1 ↔ L2: 6 Löcher je 1,8 m hinter der Kante)
        const coarseFaces = [];
        for (let dx = -1; dx <= 1; dx++)
            for (let dz = -1; dz <= 1; dz++) {
                if (dx === 0 && dz === 0) continue;
                const nb = this.state.voxelChunks.get(`${cx + dx},${cz + dz}`);
                if (!nb || nb.empty || !nb.mesh || !nb.mesh.geometry) continue;
                const nbLod = Number.isFinite(nb.lod) ? nb.lod : 0;
                if (nbLod <= myLod) continue; // nur an einen GROBEREN Nachbarn anschmiegen
                coarseFaces.push({ dx, dz, nbGeom: nb.mesh.geometry, nbLod });
            }
        // der XZ-Abstand eines Punkts zum Quadrat des Chunks (i, j) — für den Achsen-Nachbarn der Ebenen-Abstand, für die Ecke
        // der Abstand zum Eck-Punkt; derselbe Wert in jedem Chunk, der den Punkt trägt
        const quadratAbstand = (x, z, i, j) =>
            Math.hypot(Math.max(i * span - x, 0, x - (i + 1) * span), Math.max(j * span - z, 0, z - (j + 1) * span));
        // `quadratAbstand(x, z, i, j) > g`, ohne Wurzel, wo das Quadrat (mit Rundungs-Rand) schon entscheidet (gehen-takt)
        const jenseits = (x, z, i, j, g) => {
            const a = Math.max(i * span - x, 0, x - (i + 1) * span),
                b = Math.max(j * span - z, 0, z - (j + 1) * span);
            const q = a * a + b * b;
            return q > g * g * (1 + 1e-9) ? true : q < g * g * (1 - 1e-9) ? false : Math.hypot(a, b) > g;
        };
        // Fast-Path: keine Cross-LOD-Grenze UND kein alter Morph/Band → nichts zu tun (Normalfall)
        if (coarseFaces.length === 0 && !entry.hasMorph && !entry.lodStitchMesh) return;
        const n = pos.count;
        const P = pos.array;
        const tArr = tgtAttr.array;
        const wArr = wAttr.array;
        // DIE NAHT (`_bodenNaht`): nur die Rand-Vertices kann ein Morph ziehen — das Innere steht nach dem ersten Morph für immer
        // auf dem Ziel seiner Stufe (Naht 0, Beitrag 0 im Abdruck); der erste Morph je Geometrie geht das ganze Netz
        const saum = this._bodenNaht(geom, cx, cz, myLod);
        const R = saum.rand;
        const alle = !saum.gesetzt;
        // der Fingerabdruck des Morphs (die Karte zieht nur nach, wenn er sich ändert): je Vertex mit Naht ein Beitrag
        const beitrag = (w, x, y, z, v) => {
            const f = this._morphNaht(w);
            return f > 0 ? f * (x * 1.31 + y * 1.73 + z * 1.13 + v) : 0;
        };
        const abdruck = (ganz) => {
            let s = 0;
            for (let q = 0, m = ganz ? n : R.length; q < m; q++) {
                const v = ganz ? q : R[q];
                s += beitrag(wArr[v], tArr[v * 3], tArr[v * 3 + 1], tArr[v * 3 + 2], v);
            }
            return s;
        };
        // Basis = das Ziel der Stufe (K51-2, `stufeZiel`; die gröbste Stufe: die Position), Naht 0
        const basis = geom.userData.stufeZiel || P;
        const code0 = this._morphCode(myLod, 0);
        const cp = [0, 0, 0]; // Scratch für den nächsten Punkt auf einem Dreieck
        // DER TREFFER EINER RICHTUNG: je Vertex im Band des Nachbarn (`randSeite`, im Morph-Band) der nächste Punkt der groben
        // Fläche, sein Abstand und sein Ebenen-Abstand, in der Reihe der Rand-Liste.
        const trefferVon = (face, nbGeom, coarseStep) => {
            const nbPos = nbGeom.attributes.position,
                nbIdx = nbGeom.index.array;
            const ni = cx + face.dx,
                nj = cz + face.dz;
            const morphBand = fineStep * 2.0;
            const fk = (face.dx + 1) * 3 + face.dz + 1;
            const nbNaht = this._bodenNaht(nbGeom, ni, nj, face.nbLod);
            const ab = face.dx === 0 ? 0 : 4; // die Hülle längs der Kante: x an einer z-Kante, sonst z
            const quer = 4 - ab, // quer zur Kante (die Ecke: x)
                vor = face.dx || face.dz; // der Nachbar liegt quer in + oder −
            // Grobe Boundary-DREIECKE (≥1 Vertex nahe diesem Chunk) als flaches Array: gemorpht wird Punkt→Dreieck
            // auf die grobe OBERFLÄCHE, nie auf den nächsten groben VERTEX (sparse; 3D-nearest greift die
            // falsche Höhlen-Branche und lässt ~11 m Spalt). Kandidaten: die Seite des Nachbarn, die diesem Chunk zugewandt ist
            // (`_bodenNaht`; die Ecke liest seine x-Seite), in der Reihe seines Netzes; `box` die Hülle je Dreieck. Sie hängen nur
            // an der Nachbar-Geometrie und der Richtung: einmal angelegt (`kand`), liest sie jeder weitere Morph von hier.
            if (!nbNaht.kand[fk]) {
                const nbP = nbPos.array;
                const tris = [];
                const box = [];
                const bnd = coarseStep * 1.5;
                for (const t of nbNaht.seite[face.dx === 1 ? 0 : face.dx === -1 ? 1 : face.dz === 1 ? 2 : 3]) {
                    const i0 = nbIdx[t] * 3,
                        i1 = nbIdx[t + 1] * 3,
                        i2 = nbIdx[t + 2] * 3;
                    if (
                        jenseits(nbP[i0], nbP[i0 + 2], cx, cz, bnd) &&
                        jenseits(nbP[i1], nbP[i1 + 2], cx, cz, bnd) &&
                        jenseits(nbP[i2], nbP[i2 + 2], cx, cz, bnd)
                    )
                        continue;
                    tris.push(
                        nbP[i0],
                        nbP[i0 + 1],
                        nbP[i0 + 2],
                        nbP[i1],
                        nbP[i1 + 1],
                        nbP[i1 + 2],
                        nbP[i2],
                        nbP[i2 + 1],
                        nbP[i2 + 2]
                    );
                    for (let k = 0; k < 3; k++)
                        box.push(
                            Math.min(nbP[i0 + k], nbP[i1 + k], nbP[i2 + k]),
                            Math.max(nbP[i0 + k], nbP[i1 + k], nbP[i2 + k])
                        );
                }
                const nT = tris.length / 9;
                let u0 = Infinity,
                    u1 = -Infinity;
                for (let q = 0; q < nT; q++) {
                    u0 = Math.min(u0, box[q * 6 + ab]);
                    u1 = Math.max(u1, box[q * 6 + ab + 1]);
                }
                const W = coarseStep;
                const eimer = Array.from({ length: nT ? Math.floor((u1 - u0) / W) + 1 : 0 }, () => []);
                for (let q = 0; q < nT; q++)
                    for (
                        let e = Math.floor((box[q * 6 + ab] - u0) / W), e1 = Math.floor((box[q * 6 + ab + 1] - u0) / W);
                        e <= Math.min(e1, eimer.length - 1);
                        e++
                    )
                        eimer[e].push(q);
                // der Abstand der Hülle von der Kante, quer: die nahe Seite (Minimum bei +, Maximum bei −)
                const schl = Float64Array.from({ length: nT }, (_, q) =>
                    vor > 0 ? box[q * 6 + quer] : -box[q * 6 + quer + 1]
                );
                nbNaht.kand[fk] = {
                    tris: Float64Array.from(tris),
                    box: Float64Array.from(box),
                    schl,
                    u0,
                    eimer: eimer.map((l) => Int32Array.from(l.sort((x, y) => schl[x] - schl[y] || x - y))),
                };
            }
            const { tris, box, schl, u0, eimer } = nbNaht.kand[fk];
            const out = { nb: nbGeom, v: [], d3: [], ziel: [], eben: [] };
            if (tris.length === 0) return out;
            // DIE EIMER (gehen-takt): die Dreiecke nach ihrer Hülle längs der Kante (je ein grober Schritt). Ein Vertex fragt die
            // Eimer von seinem aus nach außen, bis die Lücke längs der Kante weiter ist als sein bester Treffer; ein Dreieck,
            // dessen Hülle weiter liegt, fällt ohne Rechnung (mit Rundungs-Rand: es könnte nie gleichziehen). Der Treffer ist das
            // kleinste (Abstand, Dreieck) — wie in der Reihe des Netzes, bei gleichem Abstand das frühere: byte-gleich. Im Eimer
            // stehen die Dreiecke nach ihrem Abstand von der Kante (`schl`): liegt die Hülle quer weiter als der Treffer, liegen
            // es alle folgenden auch.
            const nT = tris.length / 9;
            const W = coarseStep;
            const nE = eimer.length;
            const besucht = new Int32Array(nT).fill(-1);
            const nahe = saum.randSeite[face.dx === 1 ? 1 : face.dx === -1 ? 0 : face.dz === 1 ? 3 : 2];
            // der Treffer des vorigen Vertex zuerst (die Reihe des Netzes ist räumlich): der beste Abstand ist früh klein.
            // `best` = [Abstand², Dreieck, x, y, z] des laufenden Vertex `pv`
            const best = new Float64Array(5);
            const pv = new Float64Array(4);
            const kandidat = (q) => {
                if (besucht[q] === pv[3]) return;
                besucht[q] = pv[3];
                const px = pv[0],
                    py = pv[1],
                    pz = pv[2];
                const b = q * 6;
                const ax = box[b] - px,
                    bx = px - box[b + 1],
                    ay = box[b + 2] - py,
                    by = py - box[b + 3],
                    az = box[b + 4] - pz,
                    bz = pz - box[b + 5];
                const ex = ax > 0 ? ax : bx > 0 ? bx : 0,
                    ey = ay > 0 ? ay : by > 0 ? by : 0,
                    ez = az > 0 ? az : bz > 0 ? bz : 0;
                if (ex * ex + ey * ey + ez * ez > best[0] * (1 + 1e-9) + 1e-9) return;
                this._closestPtTri(px, py, pz, tris, q * 9, cp);
                const ddx = px - cp[0],
                    ddy = py - cp[1],
                    ddz = pz - cp[2];
                const d2 = ddx * ddx + ddy * ddy + ddz * ddz;
                if (d2 < best[0] || (d2 === best[0] && q < best[1])) {
                    best[0] = d2;
                    best[1] = q;
                    best[2] = cp[0];
                    best[3] = cp[1];
                    best[4] = cp[2];
                }
            };
            let vorQ = -1;
            for (const v of nahe) {
                const px = P[v * 3],
                    py = P[v * 3 + 1],
                    pz = P[v * 3 + 2];
                if (jenseits(px, pz, ni, nj, morphBand)) continue;
                const dPlane = quadratAbstand(px, pz, ni, nj);
                pv[0] = px;
                pv[1] = py;
                pv[2] = pz;
                pv[3] = v;
                best[0] = Infinity;
                best[1] = -1;
                best[2] = px;
                best[3] = py;
                best[4] = pz;
                if (vorQ >= 0) kandidat(vorQ);
                // dann der eigene Eimer und nach beiden Seiten, bis die Lücke zur Eimer-Kante weiter ist als der beste Treffer
                const pu = ab === 0 ? px : pz;
                const e0 = Math.max(0, Math.min(nE - 1, Math.floor((pu - u0) / W)));
                const weit = (luecke) => luecke > 0 && luecke * luecke > best[0] * (1 + 1e-9) + 1e-9;
                const sp = vor * (quer === 0 ? px : pz);
                const gehe = (e) => {
                    for (const q of eimer[e]) {
                        if (weit(schl[q] - sp)) break;
                        kandidat(q);
                    }
                };
                gehe(e0);
                for (let e = e0 - 1; e >= 0 && !weit(pu - (u0 + (e + 1) * W)); e--) gehe(e);
                for (let e = e0 + 1; e < nE && !weit(u0 + e * W - pu); e++) gehe(e);
                vorQ = best[1];
                out.v.push(v);
                out.d3.push(Math.sqrt(best[0]));
                out.ziel.push(best[2], best[3], best[4]);
                out.eben.push(dPlane);
            }
            return out;
        };
        // Grenz-ZEILE (dPlane < flat) morpht voll (w=1), danach Falloff bis morphBand (kein interner
        // Sprung). flat = 0.7·fineStep deckt die Surface-Nets-Offset-Streuung (~fineStep/2) ab.
        const flat = fineStep * 0.7;
        const morphBand = fineStep * 2.0;
        // DER TREFFER JE RICHTUNG (gehen-takt): je Vertex im Band der nächste Punkt der groben Fläche hängt nur an diesem Netz
        // und dem des Nachbarn — liest der Morph dieselbe Nachbar-Geometrie wie zuletzt, liest er ihn von hier (`treffer`).
        const richtungen = [];
        const an = new Array(9).fill(null);
        for (const face of coarseFaces) {
            const nbGeom = face.nbGeom;
            if (!nbGeom.attributes.position || !nbGeom.index) continue;
            const coarseStep = this._voxelChunkConfig(face.nbLod).step;
            const fk = (face.dx + 1) * 3 + face.dz + 1;
            if (!saum.treffer[fk] || saum.treffer[fk].nb !== nbGeom)
                saum.treffer[fk] = trefferVon(face, nbGeom, coarseStep);
            an[fk] = saum.treffer[fk];
            // Morph-Cap: an Cliffs divergieren feine + grobe Fläche vertikal (bis ~28 m); dorthin ziehen zerrt
            // die Wand. Jenseits des Caps bleibt w=0 und das Stitch-Band überbrückt den Spalt.
            richtungen.push({ tr: an[fk], achse: face.dx === 0 || face.dz === 0, snapCap: coarseStep * 2.5 });
        }
        // DER MORPH JE NACHBAR-SEITE (fahrt-takt, profiband.K1): ein Vertex des Rands hängt nur an den Treffern der Richtungen,
        // die ihn tragen. Der Morph merkt je Richtung den Treffer, den er anlegte (`an`), und je Vertex Abstand, Grenz-Zeile und
        // Naht-Ziel; der nächste rechnet nur die Vertices der Richtungen neu, deren Treffer wechselte (der Nachbar wechselte
        // Stufe oder Netz) — jeder andere Vertex sähe dieselben Treffer in derselben Reihe: byte-gleich mit dem ganzen Morph.
        // Wechselte keine, steht der Morph; was sich nicht ändert, zieht nicht nach (Hochladen, Karte, Naht-Band). Bis
        // fahrt-takt rechnete jeder Wechsel jeden feineren Nachbarn ganz (Radeon in Fahrt 20 m/s: 1 231 Morphs in 30 s,
        // `_applyCrossLodGeomorph` 2,9–4,4 ms je Takt ab p95, `werkbank takt --wandern fahrt`; je Seite 2,2–2,4, ABAB 22.10.).
        let M = saum.morph;
        let A = null;
        let inA = null;
        if (alle || !M || M.entry !== entry || M.netz !== entry.lodStitchMesh)
            M = saum.morph = {
                entry,
                an,
                abst: new Float32Array(n).fill(Infinity), // der Abstand des gewinnenden Treffers je Vertex
                band: new Uint8Array(n), // 1 = in der Grenz-Zeile (das Naht-Band hängt an ihr)
                ziel: new Float32Array(n * 3), // das Naht-Ziel (der gröbere Nachbar) — das Band brückt dorthin, auch hinter dem Cap
                netz: null,
            };
        else {
            inA = new Uint8Array(n);
            A = [];
            for (let fk = 0; fk < 9; fk++) {
                if (M.an[fk] === an[fk]) continue;
                for (const tr of [M.an[fk], an[fk]])
                    if (tr)
                        for (const v of tr.v)
                            if (!inA[v]) {
                                inA[v] = 1;
                                A.push(v);
                            }
            }
            M.an = an;
            if (A.length === 0) return;
        }
        const { abst, band, ziel } = M;
        // der Stand vor dem Teil-Morph (was er ändert, entscheidet, was nachzieht)
        const alt = A && {
            t: new Float32Array(A.length * 3),
            w: new Float32Array(A.length),
            b: new Uint8Array(A.length),
            z: new Float32Array(A.length * 3),
        };
        if (A)
            for (let q = 0; q < A.length; q++) {
                const v = A[q];
                for (let k = 0; k < 3; k++) {
                    alt.t[q * 3 + k] = tArr[v * 3 + k];
                    alt.z[q * 3 + k] = ziel[v * 3 + k];
                    ziel[v * 3 + k] = 0;
                }
                alt.w[q] = wArr[v];
                alt.b[q] = band[v];
                abst[v] = Infinity;
                band[v] = 0;
            }
        const abdruckAlt = A ? 0 : abdruck(alle);
        if (alle) {
            for (let v = 0; v < n * 3; v++) tArr[v] = basis[v];
            wArr.fill(code0);
            saum.gesetzt = true;
        } else
            for (const v of A || R) {
                tArr[v * 3] = basis[v * 3];
                tArr[v * 3 + 1] = basis[v * 3 + 1];
                tArr[v * 3 + 2] = basis[v * 3 + 2];
                wArr[v] = code0;
            }
        for (const { tr, achse, snapCap } of richtungen)
            for (let m = 0; m < tr.v.length; m++) {
                const v = tr.v[m],
                    d3 = tr.d3[m],
                    dPlane = tr.eben[m];
                if (inA && !inA[v]) continue;
                // A1 — die Band-Sammlung VOR dem Abstands-Skip (idempotente Maske):
                // ein KORNER-Vertex zwischen zwei groben Faces gehört in die Border-Row,
                // auch wenn das nähere Target von der ANDEREN Face kam. Das Band hängt an den ACHSEN-Kanten — der
                // Eck-Nachbar trägt nur den Morph (sein Band liegt an der Kante der beiden Achsen-Nachbarn).
                if (dPlane <= flat && achse) band[v] = 1;
                if (d3 >= abst[v]) continue; // ein näheres Face gewann diesen Vertex schon
                abst[v] = d3;
                tArr[v * 3] = ziel[v * 3] = tr.ziel[m * 3];
                tArr[v * 3 + 1] = ziel[v * 3 + 1] = tr.ziel[m * 3 + 1];
                tArr[v * 3 + 2] = ziel[v * 3 + 2] = tr.ziel[m * 3 + 2];
                // Gewicht: 1 in der Grenz-Zeile (dPlane ≤ flat) → linear auf 0 bei morphBand.
                // A1 — jenseits des Caps KEIN Naht-Morph (Naht 0): das Ziel bleibt das der Stufe (das Naht-Ziel trägt das Band),
                // sonst zöge das Stufen-Gewicht die Cliff-Wand an den Nachbarn.
                const naht = d3 > snapCap ? 0 : Math.max(0, Math.min(1, (morphBand - dPlane) / (morphBand - flat)));
                wArr[v] = this._morphCode(myLod, naht);
                if (naht === 0) for (let k = 0; k < 3; k++) tArr[v * 3 + k] = basis[v * 3 + k];
            }
        // die gekappten Naht-Vertices (Cliff: das Naht-Ziel weiter als der Cap, der Vertex trägt das Ziel seiner Stufe) — das
        // Naht-Band brückt sie (Leser: die Naht-Probe des Playtests)
        let touched = false;
        let gekappt = 0;
        for (const v of R)
            if (abst[v] < Infinity) {
                touched = true;
                if (this._morphNaht(wArr[v]) === 0) gekappt++;
            }
        entry.hasMorph = touched;
        entry.nahtGekappt = gekappt;
        // was der Teil-Morph änderte: die Lage (Hochladen), der Abdruck (Karte), die Grenz-Zeile (Naht-Band)
        let lage = !A,
            karte = false,
            nahtNeu = !A;
        if (A)
            for (let q = 0; q < A.length; q++) {
                const v = A[q],
                    o = v * 3,
                    p = q * 3;
                const gleich =
                    wArr[v] === alt.w[q] &&
                    tArr[o] === alt.t[p] &&
                    tArr[o + 1] === alt.t[p + 1] &&
                    tArr[o + 2] === alt.t[p + 2];
                if (!gleich) {
                    lage = true;
                    if (
                        beitrag(wArr[v], tArr[o], tArr[o + 1], tArr[o + 2], v) !==
                        beitrag(alt.w[q], alt.t[p], alt.t[p + 1], alt.t[p + 2], v)
                    )
                        karte = true;
                }
                if (
                    band[v] !== alt.b[q] ||
                    (band[v] &&
                        (!gleich ||
                            ziel[o] !== alt.z[p] ||
                            ziel[o + 1] !== alt.z[p + 1] ||
                            ziel[o + 2] !== alt.z[p + 2]))
                )
                    nahtNeu = true;
            }
        else karte = abdruck(false) !== abdruckAlt;
        if (lage) {
            entry.surfMapZiel = null; // die Karte der Ziele zieht nach (`_bodenStufeMisch`)
            this._chunkSatzMarke("boden", `${cx},${cz}`, ["aMorphTarget", "aMorphWeight"], R);
        }
        // DER BODEN-LESER LIEST, WAS GEZEICHNET WIRD (K51, Lehre 22): an einer Stufen-Naht zeichnet der Stoff die Grenz-Zeile
        // auf der groben Fläche — die Karte des Chunks (Stand, Nah-Wiese, Nah-Streu) kommt aus derselben gemorphten Lage. Mit der
        // Nah-Zone 3×3 liegt die Naht 43–65 m vor dem Auge, wo Tiere stehen (gate:koerper-stand K6: 346 von 772 Punkten mehr
        // als 25 cm neben dem gezeichneten Boden, die Karte las die rohe Lage).
        // das Innere liegt auf seiner Lage (Naht 0): nur der Rand trägt einen Morph, die Karte rastert nur seine Dreiecke neu
        if (karte) {
            const U = this.state.atmoUniforms;
            const At = this.state.atmosphere;
            const gm = U && U.geomorph ? U.geomorph.value : At && Number.isFinite(At.geomorph) ? At.geomorph : 1;
            const L = new Float32Array(P);
            for (const v of R) {
                const f = this._morphNaht(wArr[v]) * gm;
                L[v * 3] = P[v * 3] + (tArr[v * 3] - P[v * 3]) * f;
                L[v * 3 + 1] = P[v * 3 + 1] + (tArr[v * 3 + 1] - P[v * 3 + 1]) * f;
                L[v * 3 + 2] = P[v * 3 + 2] + (tArr[v * 3 + 2] - P[v * 3 + 2]) * f;
            }
            const k = this._bodenKarteNaht(geom, cx, cz, myLod, L, "lage");
            entry.surfMap = k && k.hoehe;
            entry.gruenMap = k && k.gruen;
            this._streuFussNeu(cx, cz);
        }
        if (nahtNeu) this._rebuildLodStitchBand(entry, band, `${cx},${cz}`, ziel, saum);
        M.netz = entry.lodStitchMesh;
    }

    // STITCH-BAND (Arme-Leute-Transvoxel): wo der Morph-Cap greift (Cliffs), bliebe ein Spalt. Pro
    // Mesh-KANTE der Grenz-Zeile (beide Endpunkte in der Border-Row — echte Topologie inkl. Höhlen-
    // Loops, kein Polyline-Sortieren) der Skirt und, wo ein Ende gekappt ist (Gewicht < 1), ein Quad von der
    // feinen Kante (position) zur groben Fläche (das Naht-Ziel). Render-only, keine BVH, main-only. Trägt ALLE Material-Attribute des Terrain-
    // Toons (WebGPU-strikt): color vom Quell-Vertex, die feine Kante Morph-Ziel und -Code ihres Quell-Vertex, sonst fest.
    // Dasselbe Material wie der Boden → ein Bereich `stitch:<chunk>` IM Boden-Satz (derselbe Befehl); der
    // Band-Mesh bleibt CPU-Körper (Naht-Sonden lesen seine Geometrie).
    _rebuildLodStitchBand(entry, bandVerts, key, nahtZiel, saum) {
        // Der Band-Bereich gehört dem Chunk-Key (nicht dem Eintrag): auch ein Neubau räumt ein altes Band.
        this._chunkSatzAus("boden", "stitch:" + key);
        if (entry.lodStitchMesh) {
            this._queueGeometryDispose(entry.lodStitchMesh.geometry);
            entry.lodStitchMesh = null;
        }
        if (!bandVerts || !bandVerts.includes(1) || !entry.mesh || !entry.mesh.geometry) return;
        const geom = entry.mesh.geometry;
        const pos = geom.attributes.position;
        const tgt = geom.attributes.aMorphTarget;
        const wgt = geom.attributes.aMorphWeight;
        if (!nahtZiel) throw new Error(`_rebuildLodStitchBand(${key}): kein Naht-Ziel`);
        const nrm = geom.attributes.normal;
        const col = geom.attributes.color;
        const him = geom.attributes.aHimmel;
        const idx = geom.index ? geom.index.array : null;
        if (!pos || !tgt || !idx) return;
        if (!wgt) throw new Error(`_rebuildLodStitchBand(${key}): die Quelle trägt kein Morph-Gewicht (aMorphWeight)`);
        if (!him) throw new Error(`_rebuildLodStitchBand(${key}): die Quelle trägt keine Himmels-Sicht (aHimmel)`);
        // Kürzere Spannen überspringen (Sliver). Nicht höher: dünne Risse (0.12–0.3 m) zeigen am
        // Grazing-Winkel den Nachthimmel; der Z-Fight ist durch Skirt + DoubleSide entschärft.
        const MIN_SPAN = 0.12;
        // SKIRT: kurzer VERTIKALER Vorhang unter der groben Kante (ta/tb nach unten, Tiefe ~LOD-Schritt) —
        // der Catch-all für Rest-Spalten (Streaming-Transienten, Ecken/Diagonalen, LOD2/3-Bänder). Liegt
        // normal unterm Terrain, sichtbar nur, wo sonst ein Loch wäre. Render-only.
        const SKIRT = 6.0;
        // die feine Kante der Brücke folgt der gezeichneten Kante (K51-2): ihre Ecken tragen Morph-Ziel und -Code des Quell-
        // Vertex (der Stoff zeichnet sie, wo er die Kante zeichnet — im Übergangs-Band wandert sie mit), die grobe Seite und der
        // Skirt stehen fest (Code 0, Ziel = Lage)
        const tA = tgt.array,
            wA = wgt.array,
            pA = pos.array;
        // die Ecken der feinen Kante und ihre Quell-Vertices: Normale und Stoff-Farbe wandern mit wie die Lage
        const nZiel = geom.attributes.aNormalZiel,
            fZiel = geom.attributes.aFarbeZiel;
        if (!nZiel || !fZiel)
            throw new Error(
                `_rebuildLodStitchBand(${key}): die Quelle trägt kein Stufen-Ziel (aNormalZiel · aFarbeZiel)`
            );
        const sch = geom.attributes.aSchutt;
        if (!sch) throw new Error(`_rebuildLodStitchBand(${key}): die Quelle trägt keinen Schutt (aSchutt)`);
        // DIE KANTEN-KANDIDATEN (fahrt-takt): jede Kante der Grenz-Zeile liegt in einem Rand-Dreieck (`_bodenNaht`: die Grenz-
        // Zeile ist Rand) zwischen zwei Vertices an einer Seite (≤ 1,5 Schritte, die Grenz-Zeile liegt ≤ 0,7 an der Kante) — einmal
        // je Geometrie, jede Kante einmal in der Reihe des Netzes; bis fahrt-takt ging jedes Band alle Rand-Dreiecke samt Menge
        if (!saum.kanten) {
            const seen = new Set();
            const K = [];
            for (const t of saum.randTri)
                for (let e = 0; e < 3; e++) {
                    const a = idx[t + e],
                        b = idx[t + ((e + 1) % 3)];
                    if (!(saum.seiteV[a] & 15) || !(saum.seiteV[b] & 15)) continue;
                    const k = a < b ? a * 200000 + b : b * 200000 + a;
                    if (seen.has(k)) continue;
                    seen.add(k);
                    K.push(a, b);
                }
            saum.kanten = Int32Array.from(K);
        }
        // erst die Kanten (a, b, Brücke), dann die Puffer in ihrer Größe (gehen-takt: kein Umweg über wachsende Listen)
        const kanten = [];
        {
            const K = saum.kanten;
            for (let q = 0; q < K.length; q += 2) {
                const a = K[q],
                    b = K[q + 1];
                if (!bandVerts[a] || !bandVerts[b]) continue;
                const spanA = Math.hypot(
                    nahtZiel[a * 3] - pA[a * 3],
                    nahtZiel[a * 3 + 1] - pA[a * 3 + 1],
                    nahtZiel[a * 3 + 2] - pA[a * 3 + 2]
                );
                const spanB = Math.hypot(
                    nahtZiel[b * 3] - pA[b * 3],
                    nahtZiel[b * 3 + 1] - pA[b * 3 + 1],
                    nahtZiel[b * 3 + 2] - pA[b * 3 + 2]
                );
                if (Math.max(spanA, spanB) < MIN_SPAN) continue;
                // DIE BRÜCKE (rohe Kante → grobe Fläche) nur, wo der Morph die Naht NICHT schliesst (K51): trägt er beide
                // Enden ganz (Gewicht 1), zeichnet die feine Kante schon auf der groben Fläche — die Brücke wäre eine Finne
                // zur unsichtbaren rohen Lage (14.10., Mess-Wiese: zwei von drei Naht-Dreiecken, in jedem Pass gezeichnet).
                kanten.push(a, b, this._morphNaht(wA[a]) >= 1 && this._morphNaht(wA[b]) >= 1 ? 0 : 1);
            }
        }
        if (kanten.length === 0) return;
        let nV = 0;
        for (let k = 2; k < kanten.length; k += 3) nV += kanten[k] ? 8 : 4;
        const [P, N, C, NZ, FZ, MT] = Array.from({ length: 6 }, () => new Float32Array(nV * 3));
        const [MW, HS, SC] = Array.from({ length: 3 }, () => new Float32Array(nV));
        // der Index in der Form, die `setIndex` aus einer Liste wählte (Uint16 bis 65 535 Ecken)
        const I = nV - 1 >= 65535 ? new Uint32Array((nV / 4) * 6) : new Uint16Array((nV / 4) * 6);
        let o = 0,
            oi = 0;
        const nA = nrm && nrm.array,
            cA = col && col.array,
            hA = him.array,
            sA = sch.array;
        // die Ecke o: Lage, Quell-Vertex v (Farbe, Himmel, Schutt, die Normale außer am Vorhang); \`morph\`: Ziel, Code, Ziel-
        // Normale und -Farbe des Quell-Vertex (die feine Kante wandert mit), sonst fest (Ziel = Lage, Code 0)
        const ecke = (x, y, z, v, morph, vorhang) => {
            const o3 = o * 3;
            P[o3] = x;
            P[o3 + 1] = y;
            P[o3 + 2] = z;
            MT[o3] = morph ? tA[v * 3] : x;
            MT[o3 + 1] = morph ? tA[v * 3 + 1] : y;
            MT[o3 + 2] = morph ? tA[v * 3 + 2] : z;
            MW[o] = morph ? wA[v] : 0;
            N[o3] = vorhang || !nA ? 0 : nA[v * 3];
            N[o3 + 1] = vorhang ? 0.2 : nA ? nA[v * 3 + 1] : 1;
            N[o3 + 2] = vorhang || !nA ? 0 : nA[v * 3 + 2];
            C[o3] = cA ? cA[v * 3] : 0.5;
            C[o3 + 1] = cA ? cA[v * 3 + 1] : 0.5;
            C[o3 + 2] = cA ? cA[v * 3 + 2] : 0.5;
            for (let k = 0; k < 3; k++) {
                NZ[o3 + k] = morph ? nZiel.array[v * 3 + k] : N[o3 + k];
                FZ[o3 + k] = morph ? fZiel.array[v * 3 + k] : C[o3 + k];
            }
            HS[o] = hA[v];
            SC[o] = sA[v];
            o++;
        };
        const quad = () => {
            I[oi++] = o - 4;
            I[oi++] = o - 3;
            I[oi++] = o - 2;
            I[oi++] = o - 4;
            I[oi++] = o - 2;
            I[oi++] = o - 1;
        };
        for (let k = 0; k < kanten.length; k += 3) {
            const a = kanten[k],
                b = kanten[k + 1];
            const tax = nahtZiel[a * 3],
                tay = nahtZiel[a * 3 + 1],
                taz = nahtZiel[a * 3 + 2],
                tbx = nahtZiel[b * 3],
                tby = nahtZiel[b * 3 + 1],
                tbz = nahtZiel[b * 3 + 2];
            if (kanten[k + 2]) {
                ecke(pA[a * 3], pA[a * 3 + 1], pA[a * 3 + 2], a, true, false);
                ecke(pA[b * 3], pA[b * 3 + 1], pA[b * 3 + 2], b, true, false);
                ecke(tbx, tby, tbz, b, false, false);
                ecke(tax, tay, taz, a, false, false);
                quad();
            }
            // Skirt-Quad (ta, tb, tb↓, ta↓) nach −SKIRT: Farbe vom groben Ziel-Vertex (Fels-Ton läuft weiter),
            // Normale ~horizontal-auswärts (der Vorhang ist meist verdeckt); DoubleSide → kein Backface-Loch.
            ecke(tax, tay, taz, a, false, true);
            ecke(tbx, tby, tbz, b, false, true);
            ecke(tbx, tby - SKIRT, tbz, b, false, true);
            ecke(tax, tay - SKIRT, taz, a, false, true);
            quad();
        }
        const bg = new THREE.BufferGeometry();
        bg.setAttribute("position", new THREE.Float32BufferAttribute(P, 3));
        bg.setAttribute("normal", new THREE.Float32BufferAttribute(N, 3));
        bg.setAttribute("color", new THREE.Float32BufferAttribute(C, 3));
        bg.setAttribute("aMorphTarget", new THREE.Float32BufferAttribute(MT, 3));
        bg.setAttribute("aMorphWeight", new THREE.Float32BufferAttribute(MW, 1));
        bg.setAttribute("aNormalZiel", new THREE.Float32BufferAttribute(NZ, 3));
        bg.setAttribute("aFarbeZiel", new THREE.Float32BufferAttribute(FZ, 3));
        // die Naht trägt die Himmels-Sicht ihrer beiden Ränder (je Vertex aus der Quelle kopiert, `HS`)
        bg.setAttribute("aHimmel", new THREE.Float32BufferAttribute(HS, 1));
        bg.setAttribute("aSchutt", new THREE.Float32BufferAttribute(SC, 1));
        bg.setIndex(new THREE.BufferAttribute(I, 1));
        const mesh = new THREE.Mesh(bg, this._getVoxelChunkMaterial());
        this._chunkSatzEin("boden", "stitch:" + key, bg, key);
        entry.lodStitchMesh = mesh;
    }

    // Nächster Punkt auf dem Dreieck (T[t..t+8] = A,B,C) zu P → out[0..2] (Ericson, RTCD §5.1.5):
    // Voronoi-Regionen Ecke/Kante/Innen. Für den Geomorph — robust auf der mehrwertigen Surface-Nets-
    // Fläche (der nächste Vertex griffe die falsche Branche).
    _closestPtTri(px, py, pz, T, t, out) {
        const ax = T[t],
            ay = T[t + 1],
            az = T[t + 2];
        const bx = T[t + 3],
            by = T[t + 4],
            bz = T[t + 5];
        const cx = T[t + 6],
            cy = T[t + 7],
            cz = T[t + 8];
        const abx = bx - ax,
            aby = by - ay,
            abz = bz - az;
        const acx = cx - ax,
            acy = cy - ay,
            acz = cz - az;
        const apx = px - ax,
            apy = py - ay,
            apz = pz - az;
        const d1 = abx * apx + aby * apy + abz * apz;
        const d2 = acx * apx + acy * apy + acz * apz;
        if (d1 <= 0 && d2 <= 0) {
            out[0] = ax;
            out[1] = ay;
            out[2] = az;
            return;
        }
        const bpx = px - bx,
            bpy = py - by,
            bpz = pz - bz;
        const d3 = abx * bpx + aby * bpy + abz * bpz;
        const d4 = acx * bpx + acy * bpy + acz * bpz;
        if (d3 >= 0 && d4 <= d3) {
            out[0] = bx;
            out[1] = by;
            out[2] = bz;
            return;
        }
        const vc = d1 * d4 - d3 * d2;
        if (vc <= 0 && d1 >= 0 && d3 <= 0) {
            const v = d1 / (d1 - d3);
            out[0] = ax + abx * v;
            out[1] = ay + aby * v;
            out[2] = az + abz * v;
            return;
        }
        const cpx = px - cx,
            cpy = py - cy,
            cpz = pz - cz;
        const d5 = abx * cpx + aby * cpy + abz * cpz;
        const d6 = acx * cpx + acy * cpy + acz * cpz;
        if (d6 >= 0 && d5 <= d6) {
            out[0] = cx;
            out[1] = cy;
            out[2] = cz;
            return;
        }
        const vb = d5 * d2 - d1 * d6;
        if (vb <= 0 && d2 >= 0 && d6 <= 0) {
            const w = d2 / (d2 - d6);
            out[0] = ax + acx * w;
            out[1] = ay + acy * w;
            out[2] = az + acz * w;
            return;
        }
        const va = d3 * d6 - d5 * d4;
        if (va <= 0 && d4 - d3 >= 0 && d5 - d6 >= 0) {
            const w = (d4 - d3) / (d4 - d3 + (d5 - d6));
            out[0] = bx + (cx - bx) * w;
            out[1] = by + (cy - by) * w;
            out[2] = bz + (cz - bz) * w;
            return;
        }
        const denom = 1 / (va + vb + vc);
        const v = vb * denom,
            w = vc * denom;
        out[0] = ax + abx * v + acx * w;
        out[1] = ay + aby * v + acy * w;
        out[2] = az + abz * v + acz * w;
    }

    // V12.0-perf.a — Fail/Empty/Finalize-Abschluss des Rebuild-Pfads. Bei
    // null (OOM/degeneriert): Retry-Counter (max 3) + re-dirty. Sonst:
    // Finalize. Returnt true bei aufgelöst (empty ODER filled), false bei Fail.
    _completeVoxelRebuild(key, cx, cz, lod, fresh, altLod = null, stufe = false) {
        if (fresh === null) {
            // Build fail (Heap-OOM oder degenerierte Iso-Fläche): Retry-Counter, nach 3 Versuchen {empty:true}.
            // Der nächste Edit auf den Bereich setzt den Counter zurück.
            if (!this.state.voxelRebuildAttempts) this.state.voxelRebuildAttempts = new Map();
            const attempts = (this.state.voxelRebuildAttempts.get(key) || 0) + 1;
            this.state.voxelRebuildAttempts.set(key, attempts);
            if (attempts >= 3) {
                this.state.voxelChunks.set(key, { empty: true });
                this._weltRegt(true); // die Chunk-Menge regt sich: die Stand-Wache weckt die Fege-Takte (Boden-Stempel)
                this.state.voxelRebuildAttempts.delete(key);
                this.log(`Voxel-Chunk ${key}: 3× OOM, als empty markiert`, "INFO");
                return false;
            }
            if (!this.state.dirtyVoxelChunks) this.state.dirtyVoxelChunks = new Set();
            this.state.dirtyVoxelChunks.add(key);
            return false;
        }
        if (this.state.voxelRebuildAttempts) this.state.voxelRebuildAttempts.delete(key);
        // V12.0-perf.h.1 — Edit-Rebuild-Pfad (`_rebuildVoxelChunk` ←
        // Carve/Fill/Architektur): Wasser-Iso SYNCHRON bauen (kein Flacker am
        // Edit-Punkt). Nur der Streaming-Pfad (ferne neue Chunks) deferred.
        this._finalizeVoxelChunkBuild(cx, cz, lod, fresh, true, altLod, stufe);
        return true;
    }

    // Edit-Rebuild erbt die Streaming-Kaskade. forceSync baut SYNC mit dispose-before-build (same-frame,
    // kein Loch). Sonst ASYNC: der alte Chunk bleibt sichtbar bis zum atomaren Swap (build-before-
    // dispose), Pending → dirty behalten; der Skirt-Nachbar-Stale ist sub-cell, dafür kein Frame-Spike.
    _rebuildVoxelChunk(cx, cz, lod = null, opts = {}) {
        if (!this.state.scene) return false;
        if (!this.state.voxelChunks) this.state.voxelChunks = new Map();
        const key = `${cx},${cz}`;
        const oldEntry = this.state.voxelChunks.get(key);
        const useLod = lod !== null ? lod : oldEntry && Number.isFinite(oldEntry.lod) ? oldEntry.lod : 0;
        // die Stufe, die der alte Chunk zeichnete — seine feineren Nachbarn lösen ihre Naht zu ihm (`_finalizeVoxelChunkBuild`)
        const altLod =
            oldEntry && !oldEntry.empty && oldEntry.mesh ? (Number.isFinite(oldEntry.lod) ? oldEntry.lod : 0) : null;
        // DER CHUNK-STOFF ENTSTEHT IM WORKER (Lehre 14, K69-2): jeder Neubau geht über den Worker-Pfad — der alte Mesh
        // bleibt sichtbar bis zum atomaren Swap, die Kollision liest das Dichtefeld (sofort aktuell), die Flut über die
        // Naht reist als Saat mit dem Auftrag (`_flutSaat`). Synchron baut nur, wer es ausdrücklich verlangt
        // (`opts.forceSync`: der Wasser-Fußabdruck eines Baus, `_drainDirtyVoxelChunks`); der Fußabdruck eines Edits baut im
        // Faden, bis dahin trägt das Netz seine vorläufige Gestalt (`_editGestaltVorlaeufig`, bau-faden).
        // Bis K69-2 baute der Neubau den Spieler-Chunk und jeden Chunk mit einem Schnitt im 3×3 synchron, solange der
        // Frame Zeit hatte — am Erdbau eines Dorfs um den Spieler 154–409 ms in EINEM Takt (gate:stand-takt ORT).
        // DER STUFEN-WECHSEL (K51-5): der Streaming-Takt tauscht nur die Stufe eines stehenden Chunks — keine Form-Änderung
        // wartet (kein Carve/Fill am Gras, kein Edit im Dirty-Satz). Er regt nur die Boden-Karte (`_weltRegt(true, true)`),
        // und sein offener Bau gehört dem Streaming-Takt (er bleibt wach, bis der Bau kommt) — nie dem Dirty-Takt, der
        // ohne Stufe die ALTE baute (gehend an der Mess-Wiese: ein Neubau in der alten Stufe je verzögertem Wechsel).
        const formWartet =
            (this.state.grassDirtyChunks && this.state.grassDirtyChunks.has(key)) ||
            (this.state.dirtyVoxelChunks && this.state.dirtyVoxelChunks.has(key));
        const stufe = altLod !== null && lod !== null && lod !== altLod && !formWartet;
        // synchron nur über stehender Wahrheit (`_hydroSteht`): fehlt die Hydrosphäre, wartet auch der Neubau des Fußabdrucks
        const forceSync = !!opts.forceSync && this._hydroSteht(cx, cz);
        // Welle G-fix — das Gras nur disposen, wenn die Oberfläche sich änderte
        // (Carve/Fill markierte den Chunk grass-dirty). Sonst behalten (kein
        // Flackern bei Nexus-Spawn/Skirt/LOD-Rebuild).
        const keepGrass = !(this.state.grassDirtyChunks && this.state.grassDirtyChunks.has(key));
        if (forceSync) {
            // V9.40-d — dispose-before-build (kein Loch, Sync-Build same-frame).
            if (oldEntry) this._disposeVoxelChunk(key, keepGrass, stufe);
            const fresh = this._acquireVoxelChunkBuild(cx, cz, useLod, { forceSync: opts.forceSync });
            return this._completeVoxelRebuild(key, cx, cz, useLod, fresh, altLod, stufe);
        }
        // Async: erst bauen/anfordern, NICHT vorher disposen.
        const fresh = this._acquireVoxelChunkBuild(cx, cz, useLod, { forceSync: false });
        if (fresh === "pending") {
            // Worker/GPU-Request läuft — alter Chunk bleibt sichtbar, dirty
            // behalten, der nächste Tick prüft erneut (Cache-Hit → Swap) — den Stufen-Wechsel der Streaming-Takt
            if (stufe) return false;
            if (!this.state.dirtyVoxelChunks) this.state.dirtyVoxelChunks = new Set();
            this.state.dirtyVoxelChunks.add(key);
            return false;
        }
        // Build fertig/fail → atomarer Swap: alten erst JETZT disposen.
        if (oldEntry) this._disposeVoxelChunk(key, keepGrass, stufe);
        return this._completeVoxelRebuild(key, cx, cz, useLod, fresh, altLod, stufe);
    }

    // Baut einen Voxel-Chunk an (cx, cz) über die geteilte Kaskade; No-op, wenn er existiert. Leeres
    // Dichte-Feld → {empty:true} (kein Re-Mesh je Frame). Fail → Retry-Counter (max 3), der nächste
    // Streaming-Tick versucht erneut. `lod` = Distanz-LOD vom Streaming-Tick (Mismatch → dirty).
    // Pending → null: der Chunk fehlt 1–2 Frames (Pump-Latenz).
    _ensureVoxelChunkAt(cx, cz, lod = 0) {
        if (!this.state.scene) return null;
        if (!this.state.voxelChunks) this.state.voxelChunks = new Map();
        const key = `${cx},${cz}`;
        if (this.state.voxelChunks.has(key)) return this.state.voxelChunks.get(key);
        // EINE Pfad-Quelle mit dem Rebuild: `_buildVoxelChunkData` liefert Mesh UND waterCells (sonst lädt
        // Wasser erst nach einem Edit). Pending → null (nächster Frame); Fail → Retry-Counter, kein re-dirty.
        // Auch der Spieler-Chunk baut async (Kollision ist feld-nativ → kein ~130-ms-Freeze beim Chunk-
        // Crossing); nur der Edit-Rebuild (`_rebuildVoxelChunk`) baut ihn sync.
        const fresh = this._acquireVoxelChunkBuild(cx, cz, lod, { forceSync: false });
        if (fresh === "pending") return null;
        if (fresh === null) {
            if (!this.state.voxelRebuildAttempts) this.state.voxelRebuildAttempts = new Map();
            const attempts = (this.state.voxelRebuildAttempts.get(key) || 0) + 1;
            this.state.voxelRebuildAttempts.set(key, attempts);
            if (attempts >= 3) {
                this.state.voxelChunks.set(key, { empty: true });
                this._weltRegt(true); // die Chunk-Menge regt sich: die Stand-Wache weckt die Fege-Takte (Boden-Stempel)
                this.state.voxelRebuildAttempts.delete(key);
                this.log(`Voxel-Chunk ${key}: 3× OOM beim Stream-Build, als empty markiert`, "INFO");
            }
            return null;
        }
        if (this.state.voxelRebuildAttempts) this.state.voxelRebuildAttempts.delete(key);
        return this._finalizeVoxelChunkBuild(cx, cz, lod, fresh);
    }
    // Legacy-Alias für V10.0-j.d-Code (Geometry-spezifisch).
    _queueGeometryDispose(geometry) {
        this._queueDispose(geometry);
    }

    // Räumt einen Voxel-Chunk: Kollision, Mesh, Geometrie, Material.
    // Idempotent.
    _disposeVoxelChunk(key, keepGrass = false, stufe = false) {
        if (!this.state.voxelChunks) return;
        // V18.275 — ein gepruneter Chunk verlässt auch die Foliage-Warteschlange (kein Leck).
        if (this.state.pendingFoliageChunks) this.state.pendingFoliageChunks.delete(key);
        const entry = this.state.voxelChunks.get(key);
        this._chunkSatzAus("boden", key); // DER SATZ: der Bereich wird frei, der Index legt sich neu
        // die vorläufige Säule über ihm (`_saeuleVorlaeufig`): sein Neubau zeichnet sie (der Stand trägt den Edit) — mit dem
        // letzten Chunk unter ihrem Grundriss geht sie aus dem Satz, im selben Takt, in dem sein Netz eintritt
        const S = this.state.saeulenVorlaeufig;
        if (S && S.size)
            for (const [k, s] of S)
                if (s.offen.delete(key) && !s.offen.size) {
                    this._chunkSatzAus("boden", k);
                    this._queueGeometryDispose(s.geom);
                    S.delete(k);
                }
        // der Faden gibt die Zellen frei, die nur dieser Chunk trug (Karte hydro-faden)
        if (entry && entry.zellenId && this.state.voxelWorker)
            this.state.voxelWorker.postMessage({ type: "zellen-frei", keys: [key], zids: [entry.zellenId] });
        if (entry && entry.mesh) {
            // V10.0-j.d — geometry.dispose deferred (siehe _queueGeometryDispose).
            this._queueGeometryDispose(entry.mesh.geometry);
            // V9.84 Perf-1.a — Material NICHT disposen: Singleton-geteilt.
        }
        // A1 — das Cross-LOD-Stitch-Band des Chunks räumen (sein Bereich im Boden-Satz gehört dem Chunk-Key).
        this._chunkSatzAus("boden", "stitch:" + key);
        if (entry && entry.lodStitchMesh) {
            this._queueGeometryDispose(entry.lodStitchMesh.geometry);
            entry.lodStitchMesh = null;
        }
        // keepGrass: ein Rebuild ohne Oberflächen-Änderung (Struktur-Spawn/Skirt/LOD) behält das Gras (kein
        // Flackern, kein ~34-ms-Rebuild); Prune + oberflächen-ändernde Rebuilds disposen.
        if (!keepGrass) this._disposeVoxelChunkGrass(key);
        // V9.72 (Welle C.2) / V9.75 (Welle C.4+5) — das Iso-Wasser-Mesh
        // disposen (einziger Wasser-Render-Pfad; der alte Quad-Pfad ist weg).
        this._disposeVoxelChunkWaterIso(key);
        // V12.0-perf.h — ausstehenden Wasser-Iso-Build für diesen Chunk
        // verwerfen (Chunk ist weg, nichts mehr zu bauen).
        if (this.state.pendingWaterIso) this.state.pendingWaterIso.delete(key);
        // Welle A — ausstehenden Gras-Build für diesen Chunk verwerfen.
        if (this.state.pendingGrass) this.state.pendingGrass.delete(key);
        this.state.voxelChunks.delete(key);
        this._weltRegt(true, stufe); // die Chunk-Menge regt sich (ein Stufen-Wechsel nur die Boden-Karte, K51-5)
        // V9.40-c — dirty-Marker mit-entfernen, sonst zeigt er auf einen
        // gleich-keyed Chunk, den der Streaming-Ring später frisch baut, und
        // triggert einen unnötigen Rebuild im nächsten Tick.
        if (this.state.dirtyVoxelChunks) this.state.dirtyVoxelChunks.delete(key);
        // Retry-Counter mit-entfernen: sonst stale Einträge je Prune-Zyklus; ein neu gestreamter Chunk an
        // derselben Stelle bekommt frische 3 Versuche.
        if (this.state.voxelRebuildAttempts) this.state.voxelRebuildAttempts.delete(key);
    }

    // Oberflächen-Höhe an (x,z): scannt von oben durchs Oberflächen-Band bis zur ersten Luft→Fest-
    // Grenze (Dichte > 0) — so sitzt Gras auch auf Überhängen auf der Kuppe. null ohne festes Terrain.
    _voxelSurfaceY(x, z) {
        const base = this.state.terrainBaseHeight || 0;
        // Scan-Bereich aus `_voxelChunkConfig` (eine Quelle): von knapp unter der Chunk-Decke bis knapp über
        // den Chunk-Boden; `-8`/`+12` sind die Marge, in der nie Terrain liegt.
        const cfg = this._voxelChunkConfig();
        const floorY = base - cfg.floorDrop;
        const top = floorY + cfg.dimY * cfg.step - 8;
        const bottom = floorY + 12;
        // Envelope-Skip: über `macroSurf + ROUGH(12) + 4·step` ist GARANTIERT Luft (dieselbe Zusicherung wie
        // der Band-Skip in `_voxelSampleDensityGrid`). Die Schleife läuft übers selbe y-Gitter (bit-exakt),
        // nur die Dichte-Probe entfällt in der Garantie-Luft (~300 → ~25 Proben/Spalte). Fill-Edits können
        // höher bauen → `_voxelEditsFillTop()` hebt die Grenze; Macro nicht endlich → Voll-Scan.
        // Spalten-Hoist: ~61 % jeder Dichte-Probe ist 2D-Spalten-Arbeit (Makro/Erosion/Hydro) → Kontext
        // EINMAL heben, die Probe liest `_fieldDensityAt(x,y,z,ctx)` — dieselbe Quelle wie die feld-native
        // Kollision, bit-identisch zu `_terrainDensityAt` (`_mitEdits` über base == über baseCol). Die Makro-Höhe der Garantie
        // ist die des Kontexts (`surf`, dieselbe `hoehe` derselben Spalte) — bis K60-2 rechnete die Spalte sie zweimal
        // (Radeon kalt 0,7 s bis zum ersten Weltbild, jeder Wald-Dart fragt fünf Spalten).
        const colCtx = this._terrainColumnContext(x, z);
        const macroSurf = colCtx.surf;
        const skipAbove = Number.isFinite(macroSurf)
            ? Math.max(macroSurf + 12 + 4 * cfg.step, this._voxelEditsFillTop() + 2)
            : Infinity;
        let prevAir = true;
        let prevD = null; // Dichte der Luft-Probe 1.2 m darüber (null = Garantie-Luft, nicht gemessen)
        for (let y = top; y >= bottom; y -= 1.2) {
            if (y > skipAbove) continue; // Garantie-Luft — Probe gespart, Gitter unverändert
            const d = this._fieldDensityAt(x, y, z, colCtx);
            const solid = d > 0;
            if (solid && prevAir) {
                // DER NULLDURCHGANG statt des Gitterpunkts: die Oberfläche liegt zwischen der Fels-Probe y und
                // der Luft-Probe y+1.2 — linear interpoliert wie die Marching-Cubes-Kante des Meshs. Der erste
                // Fels-Gitterpunkt lag bis 1,2 m UNTER dem gezeichneten Boden (gemessen 01.10.: Haus, Tiere,
                // Sonden-Kameras eingesunken; Kamera 0,5 m über dem Wert stand im Gelände).
                const dLuft = prevD != null ? prevD : this._fieldDensityAt(x, y + 1.2, z, colCtx);
                const t = d - dLuft > 1e-9 ? d / (d - dLuft) : 0;
                return y + 1.2 * Math.min(1, Math.max(0, t));
            }
            prevAir = !solid;
            prevD = d;
        }
        return null;
    }

    // ===== FELD-NATIVE KOLLISION =====
    // Die Kollision LIEST das Dichtefeld direkt statt eine Dreiecks-BVH abzuleiten (reine Helfer; der
    // Kapsel-Controller `_stepCharacter` baut darauf). Das Feld ist KEIN SDF → Dichte nur als geklammerter
    // Schritt-Hinweis, der Gradient gibt die Richtung, 2–3× iteriert (collide-and-slide). `ctx` =
    // `_terrainColumnContext(x,z)`: eine vertikale Probe teilt EINEN Spalten-Kontext über alle y.

    // Die kanonische Feld-Dichte für die Kollision: base (optional gehoistet) mit den Edits (`_mitEdits`, die Form des Kerns).
    // > 0 solide, ≤ 0 Luft/Wasser. Liest die Edits → ein gecarvter Tunnel ist SOFORT
    // begehbar (kein BVH-Rebuild, der heute teure Edit-Pfad).
    _fieldDensityAt(x, y, z, ctx) {
        const base = ctx ? globalThis.__gelaendeCore.dichteBasis(x, y, z, ctx) : this._terrainBaseDensityAt(x, y, z);
        const d = this._mitEdits(base, x, y, z);
        // der Keller ist hohl (S4, `erdbauHohl`) — dieselbe Dichte wie `_terrainDensityAt`; ob die Spalte über einem Keller
        // steht, trägt ihr Kontext (`keller`, EINMAL je Spalte gefragt): die Probe des Heiß-Pfads `_voxelSurfaceY` zahlt einen
        // Blick (gemessen: getTerrainHeightAt 1,40 → 2,10 µs, als jede Probe die Lage des Erdbaus fragte)
        const K = ctx ? ctx.keller : this._kellerLage(x, z);
        return K ? globalThis.__gelaendeCore.erdbauHohl(K, x, y, z, d) : d;
    }

    _fieldSolid(x, y, z, ctx) {
        return this._fieldDensityAt(x, y, z, ctx) > 0;
    }

    // Außen-Normale = −∇density/|∇density| (Dichte wächst ins Solide → auf Boden ny > 0). Zentral-
    // Differenzen, das y±e-Paar teilt den Spalten-Kontext. out = {x,y,z,mag} (mag = roher Betrag über
    // 2e, für den Distanz-Hinweis); verschwindender Gradient → Default nach oben.
    _fieldGradient(x, y, z, out) {
        const e = AnazhRealm.FIELD_GRAD_EPS;
        const ctx = this._terrainColumnContext(x, z);
        const gx = this._fieldDensityAt(x + e, y, z) - this._fieldDensityAt(x - e, y, z);
        const gy = this._fieldDensityAt(x, y + e, z, ctx) - this._fieldDensityAt(x, y - e, z, ctx);
        const gz = this._fieldDensityAt(x, y, z + e) - this._fieldDensityAt(x, y, z - e);
        const nx = -gx,
            ny = -gy,
            nz = -gz;
        const mag = Math.sqrt(nx * nx + ny * ny + nz * nz);
        out = out || {};
        if (mag > 1e-6) {
            out.x = nx / mag;
            out.y = ny / mag;
            out.z = nz / mag;
        } else {
            out.x = 0;
            out.y = 1;
            out.z = 0;
        }
        out.mag = mag;
        return out;
    }

    // Drückt EINE Kugel (p, radius) heraus, bis sie AUF der Oberfläche ruht. Signed Distance 1. Ordnung
    // sd ≈ −density·2e/|∇| (positiv außen), Überlappung gap = radius − sd; solange gap > 0 entlang der
    // Außen-Normale um min(gap, radius) schieben (gedeckelt = stabil trotz Nicht-SDF), max
    // FIELD_RESOLVE_ITERS. Mutiert p; true, wenn bewegt; letzte Normale → normalOut.
    _fieldResolveSphere(p, radius, normalOut) {
        const e = AnazhRealm.FIELD_GRAD_EPS;
        const g = {};
        let moved = false;
        for (let it = 0; it < AnazhRealm.FIELD_RESOLVE_ITERS; it++) {
            const dens = this._fieldDensityAt(p.x, p.y, p.z);
            this._fieldGradient(p.x, p.y, p.z, g);
            if (g.mag < 1e-6) break;
            const sd = (-dens * 2 * e) / g.mag; // signed distance, positiv = außerhalb
            const gap = radius - sd;
            if (gap <= 0) break; // Kugel ruht frei (≥ radius außerhalb) — fertig
            const step = Math.min(gap, radius);
            p.x += g.x * step;
            p.y += g.y * step;
            p.z += g.z * step;
            moved = true;
            if (normalOut) {
                normalOut.x = g.x;
                normalOut.y = g.y;
                normalOut.z = g.z;
            }
        }
        return moved;
    }

    // Lokale Kurz-Boden-Probe (nicht der teure `_voxelSurfaceY`-Spalten-Scan): solide Oberkante nahe
    // Start-y, EIN Spalten-Kontext + Bisektion. Start in Luft → abwärts zur ersten Luft→Solid-Grenze;
    // Start im Soliden → AUFWÄRTS zur Solid→Luft-Grenze (sonst clippt der steckende Spieler auf eine
    // Höhlen-Schicht). null ohne Grenze in Reichweite.
    // DAS RASTER DER WELT (K70-N1): die Proben liegen auf y = k · 0,5 m, nie im Abstand von der Start-Höhe — so trägt jeder
    // Ort EINEN Grund, gleich von wo gesucht wird. Bis dahin hing er um bis zu 7,8 mm an der Höhe des Suchenden: ein Werk,
    // das ab seiner eigenen Höhe sucht (`_werkBoden`), fand im Stand je Bild einen anderen Grund (der GT an der Gasse zitterte
    // 0,39 mm je Bild, nie in Ruhe) — zwei Läufe mit verschiedener Vorgeschichte trafen nie denselben Stand (gate:fahr-leben
    // L8: 1,2 mm nach 200 Schritten, CI 38712496194). Nur wenn das Raster-Fach über dem Start Fels trägt (eine Decke) oder
    // unter dem Start Luft (eine dünne Schicht), grenzt die Start-Höhe die Bisektion wie zuvor.
    _fieldSurfaceBelow(x, y, z, maxDist) {
        const ctx = this._terrainColumnContext(x, z);
        const step = 0.5;
        if (this._fieldSolid(x, y, z, ctx)) {
            // Start IM Soliden → aufwärts die Oberkante suchen (Penetrations-Heilung).
            const top = y + maxDist;
            for (let yy = Math.ceil(y / step) * step; yy <= top; yy += step) {
                if (!this._fieldSolid(x, yy, z, ctx)) {
                    // Grenze zwischen yy−step (solid) und yy (Luft) → Bisektion auf die Oberkante.
                    let lo = yy - step,
                        hi = yy;
                    if (lo < y && !this._fieldSolid(x, lo, z, ctx)) lo = y;
                    for (let b = 0; b < 6; b++) {
                        const mid = (lo + hi) / 2;
                        if (this._fieldSolid(x, mid, z, ctx)) lo = mid;
                        else hi = mid;
                    }
                    return lo;
                }
            }
            return null;
        }
        const end = y - maxDist;
        for (let yy = Math.floor(y / step) * step; yy >= end; yy -= step) {
            if (this._fieldSolid(x, yy, z, ctx)) {
                // Grenze zwischen yy (solid) und yy+step (Luft) → Bisektion verfeinern.
                let lo = yy,
                    hi = yy + step;
                if (hi > y && this._fieldSolid(x, hi, z, ctx)) hi = y;
                for (let b = 0; b < 6; b++) {
                    const mid = (lo + hi) / 2;
                    if (this._fieldSolid(x, mid, z, ctx)) lo = mid;
                    else hi = mid;
                }
                return lo;
            }
        }
        return null;
    }

    // Feld-nativer Raycast: DDA-Marsch (fester Schritt 0.2 m = Bau-Präzision) durchs Dichtefeld +
    // Segment-AABB-Test gegen `entry.blockerAABBs`; liefert den NÄCHSTEN Treffer { hit, x, y, z, nx, ny,
    // nz } (Welt-Koords + Außen-Normale). Für Grab/Graben/Platzieren/Decke/Kamera. `o.durchPflanzen`: der Strahl geht durch
    // die Hülle einer Pflanze (Box mit `pflanze`, `_populateBlockerAABBs`) — der Strahl der 3rd-Kamera: eine Pflanze hält sie
    // nie, sie wird durchsichtig (`_kameraDurchsichtNode`). `o.radius` (DIE KUGEL DER KAMERA, K06): der Wurf einer Kugel vom
    // Radius r — jede Box um r aufgeblasen (`_segmentKugelBox`); das Gelände fragt EINEN Mittelstrahl (trifft er, hält die
    // Mitte vor der Ebene des Treffers (r + 2 cm) / cos θ) und den Ring der Kugel (4 Punkte, je r quer zum Strahl) nur an der
    // Stelle, an der sie stehen soll; berührt ein Punkt dort Fels, geht er allein rückwärts (wachsende Schritte, Bisektion),
    // bis der ganze Ring frei ist. `t` ist die Stelle der MITTE: sie steht absolut r vor jeder Fläche. Der Gelände-Marsch
    // endet einen Schritt hinter dem Bau-Treffer. `o.gelaende === false` fragt nur die Bauten.
    _fieldRaycast(sx, sy, sz, ex, ey, ez, o) {
        const durchPflanzen = !!(o && o.durchPflanzen);
        const rad = o && o.radius > 0 ? o.radius : 0;
        const dx = ex - sx,
            dy = ey - sy,
            dz = ez - sz;
        const len = Math.sqrt(dx * dx + dy * dy + dz * dz);
        const out = { hit: false, x: ex, y: ey, z: ez, nx: 0, ny: 1, nz: 0, t: 1 };
        if (len < 1e-6) return out;
        const ux = dx / len,
            uy = dy / len,
            uz = dz / len;
        // (1) STRUKTUREN zuerst — Segment vs solide Part-AABBs (Slab-Methode), nähester Treffer. Gefragt wird die Nachbarschaft der
        // Blocker (`_blockerNetz`): nur die Einträge der Zellen, die die Hülle des Segments überdeckt (dazu die Riesen-Zelle),
        // je Eintrag der Nah-Cull wie immer, je Box ihre Hülle vor dem Slab — eine Box, deren Hülle die des Segments nicht
        // berührt, schneidet es nie (die Marge 1e-6 m trägt die Rundung des Slabs und seinen Kehrwert 1e9). Den Gleichstand
        // zweier Treffer entscheidet die Ordnung des Bestands und der Box wie die Schleife über das Array: die Treffer sind
        // byte-gleich (gate:blocker-netz). Vorher prüfte jeder Strahl jede Box im 80-m-Umkreis — an der Mess-Wiese 22 758
        // Slabs je Strahl der Decken-Probe (ein Strahl je Frame), keine Box berührte das 4,5-m-Segment.
        let structHitT = Infinity,
            sFace = null,
            sSeq = Infinity,
            sBox = 0;
        const arches = this.state.architectures;
        if (arches && arches.length) {
            const N = this._blockerNetz();
            const frage = ++N.frage;
            const M = 1e-6 + rad; // die Kugel: die Hülle des Segments um r weiter
            const qx0 = Math.min(sx, ex) - M,
                qx1 = Math.max(sx, ex) + M,
                qy0 = Math.min(sy, ey) - M,
                qy1 = Math.max(sy, ey) + M,
                qz0 = Math.min(sz, ez) - M,
                qz1 = Math.max(sz, ez) + M;
            const Z = AnazhRealm.BLOCKER_ZELLE;
            let spannen = null; // die Kugel: je berührte Box ihre Spanne (`_segmentKugelBox`)
            const ix0 = Math.floor(qx0 / Z),
                iz0 = Math.floor(qz0 / Z);
            const nx = Math.floor(qx1 / Z) - ix0 + 1;
            const nZellen = nx * (Math.floor(qz1 / Z) - iz0 + 1);
            for (let c = -1; c < nZellen; c++) {
                const zelle = N.zellen.get(
                    c < 0 ? AnazhRealm.BLOCKER_RIESE : (ix0 + (c % nx)) * 2097152 + iz0 + Math.floor(c / nx)
                );
                if (!zelle) continue;
                for (let i = 0; i < zelle.length; i++) {
                    const e = zelle[i];
                    if (e._blockerFrage === frage) continue;
                    e._blockerFrage = frage;
                    if (!e.blockerAABBs || !e.position || this._gerittenesWerk(e)) continue;
                    // V18.464: + _blockerReach (Rand-Parts großer Bauwerke, s. _stepCharacterStructures)
                    const rcCull = 80 + (e._blockerReach || 0);
                    if (Math.abs(e.position.x - sx) > rcCull || Math.abs(e.position.z - sz) > rcCull) continue;
                    // DER STRAHL KENNT JEDE GEZEICHNETE GESTALT (leib.K4): nach den Boxen des Eintrags seine Flügel, wie das Bild
                    // sie zeigt (`_fluegelBoxenVon`: der Tür- und Tor-Flügel als Instanz) — in der Ordnung danach
                    const boxes = e.blockerAABBs;
                    const fl = this._fluegelBoxenVon(e);
                    const nB = boxes.length;
                    const seq = e._blockerSeq;
                    for (let bi = 0, n = nB + fl.length; bi < n; bi++) {
                        const bx = bi < nB ? boxes[bi] : fl[bi - nB];
                        if (durchPflanzen && bx.pflanze === true) continue;
                        if (
                            bx.maxX < qx0 ||
                            bx.minX > qx1 ||
                            bx.topY < qy0 ||
                            bx.botY > qy1 ||
                            bx.maxZ < qz0 ||
                            bx.minZ > qz1
                        )
                            continue;
                        if (rad > 0) {
                            const k = this._segmentKugelBox(sx, sy, sz, dx, dy, dz, bx, rad);
                            if (k) (spannen || (spannen = [])).push(Object.assign(k, { box: bx }));
                            continue;
                        }
                        const hitInfo = this._segmentAABB(sx, sy, sz, dx, dy, dz, bx);
                        if (
                            hitInfo &&
                            (hitInfo.t < structHitT ||
                                (hitInfo.t === structHitT && (seq < sSeq || (seq === sSeq && bi < sBox))))
                        ) {
                            structHitT = hitInfo.t;
                            sFace = hitInfo;
                            sSeq = seq;
                            sBox = bi;
                        }
                    }
                }
            }
            // DIE STELLE DER KUGEL (K4): die Mitte hält vor jeder Box, die der dünne Strahl kreuzt, und vor der ersten Haut (der
            // um r aufgeblasenen Box), die die Strecke betritt. Eine Haut AM START (die Mitte steht schon an ihr, binnen 1 mm:
            // die Schulter an der Wand, der Abstieg neben dem GT) hält sie nur, wenn die Stelle noch in ihr läge — verlässt die
            // Strecke sie (über die Kante, von der Wand fort), ist der Weg frei; sonst hält die Mitte an ihrem Eintritt. Führt die
            // Strecke in der Haut TIEFER an die Box (`_hautTiefer`: die Schulter am offenen Tür-Flügel, der Orbit streift ihn),
            // stößt die Kugel sofort an: sie hält am Start — bis leib.K4 glitt der Arm dort durch die Haut (Dorf-Sonde, 3 von 18
            // Häusern: die Linse 0,151 m vor dem Blatt).
            if (spannen) {
                let st = 1;
                for (const k of spannen) {
                    const halt = Math.min(k.roh, k.t * len > 1e-3 ? k.t : Infinity);
                    if (halt < st) {
                        st = halt;
                        sFace = k;
                    }
                }
                for (const k of spannen)
                    if (
                        k.t * len <= 1e-3 &&
                        k.t < st &&
                        (st < k.aus || this._hautTiefer(sx, sy, sz, dx, dy, dz, k.box, Math.min(st, k.aus)))
                    ) {
                        st = k.t;
                        sFace = k;
                    }
                if (sFace) structHitT = st;
            }
        }
        // (2) TERRAIN — DDA durchs Dichtefeld: erster solider Punkt, dann Bisektion + Gradient. Der Gradient liest den Punkt
        // der Fläche (gx/gy/gz), nicht die Stelle der Kugel-Mitte. Der Marsch endet einen Schritt hinter dem Bau-Treffer
        // (billige Filter zuerst, Lehre 25): ein Fels dahinter verliert gegen ihn, ein Fels davor fällt in den Schritt.
        const step = 0.2;
        let bestT = Infinity;
        let gx = sx,
            gy = sy,
            gz = sz;
        let normale = null;
        const marsch = (bis) => {
            for (let d = step; d <= bis; d += step) {
                if (this._fieldSolid(sx + ux * d, sy + uy * d, sz + uz * d)) {
                    // Grenze zwischen d−step (Luft) und d (Solid) → bisektion auf die Oberfläche.
                    let lo = d - step,
                        hi = d;
                    for (let b = 0; b < 8; b++) {
                        const mid = (lo + hi) / 2;
                        if (this._fieldSolid(sx + ux * mid, sy + uy * mid, sz + uz * mid)) hi = mid;
                        else lo = mid;
                    }
                    return hi;
                }
            }
            return Infinity;
        };
        if (!(o && o.gelaende === false)) {
            if (this._fieldSolid(sx, sy, sz)) {
                bestT = 0; // Start schon im Soliden
            } else {
                const d = marsch(structHitT < Infinity ? Math.min(len, structHitT * len + step) : len);
                if (d < Infinity) {
                    gx = sx + ux * d;
                    gy = sy + uy * d;
                    gz = sz + uz * d;
                    bestT = Math.max(0, d - rad) / len;
                    if (rad > 0) {
                        // DIE KUGEL AN DER EBENE DES TREFFERS: ihre Mitte hält (r + 2 cm) / cos θ vor ihm (θ der Einfall gegen die
                        // Normale), am Hang also weiter als r — dieselbe Normale ist die des Ergebnisses
                        normale = this._fieldGradient(gx, gy, gz, {});
                        const cos = -(ux * normale.x + uy * normale.y + uz * normale.z);
                        if (cos > 0.05) bestT = Math.max(0, d - (rad + 0.02) / cos) / len;
                    }
                }
                if (rad > 0) {
                    // DER RING DER KUGEL (K06, Prüfung 1: vier Eckstrahlen marschierten auch ohne Treffer die volle Armlänge,
                    // Feld-Proben je 3rd-Bild 35 → 156): zwei Einheits-Achsen quer zum Strahl (p1 = u × Achse, p2 = u × p1), je
                    // ±r, gefragt nur an der Stelle, an der die Mitte stehen soll (der nähere Treffer von Bau und Gelände). Ein
                    // Ring-Punkt, der schon am Start im Fels liegt, sagt nichts (die Kugel streift ihn am Start) — erst ein
                    // berührender Punkt fragt seinen Start.
                    const ax = Math.abs(uy) > 0.9 ? 1 : 0;
                    const ay = 1 - ax;
                    let p1x = -uz * ay,
                        p1y = uz * ax,
                        p1z = ux * ay - uy * ax;
                    const n1 = Math.hypot(p1x, p1y, p1z) || 1;
                    p1x /= n1;
                    p1y /= n1;
                    p1z /= n1;
                    const p2x = uy * p1z - uz * p1y,
                        p2y = uz * p1x - ux * p1z,
                        p2z = ux * p1y - uy * p1x;
                    const amStart = [null, null, null, null];
                    // der Punkt k des Rings an der Stelle dd: Fels, der nicht schon an seinem Start liegt
                    const punktFest = (k, dd) => {
                        const a = k === 0 ? rad : k === 1 ? -rad : 0;
                        const b = k === 2 ? rad : k === 3 ? -rad : 0;
                        const qx = p1x * a + p2x * b,
                            qy = p1y * a + p2y * b,
                            qz = p1z * a + p2z * b;
                        const px = sx + ux * dd + qx,
                            py = sy + uy * dd + qy,
                            pz = sz + uz * dd + qz;
                        if (!this._fieldSolid(px, py, pz)) return false;
                        if (amStart[k] === null) amStart[k] = this._fieldSolid(sx + qx, sy + qy, sz + qz);
                        if (amStart[k]) return false;
                        gx = px;
                        gy = py;
                        gz = pz;
                        return true;
                    };
                    // der untere Punkt zuerst (der Boden), dann die Seiten, der obere zuletzt
                    const folge = p2y > 0 ? [3, 0, 1, 2] : [2, 0, 1, 3];
                    let stelle = Math.min(bestT, structHitT, 1) * len;
                    for (let runde = 0; runde < 4 && stelle > 0; runde++) {
                        let k = -1;
                        for (const j of folge)
                            if (punktFest(j, stelle)) {
                                k = j;
                                break;
                            }
                        if (k < 0) break;
                        // der berührende Punkt allein rückwärts: wachsende Schritte bis frei, dann die Bisektion auf 5 cm (am Start
                        // ist er frei, jeder Punkt dort ist sein eigener Start); danach fragt die nächste Runde den ganzen Ring
                        normale = null;
                        let hi = stelle,
                            w = 0.2,
                            lo = Math.max(0, hi - w);
                        while (lo > 0 && punktFest(k, lo)) {
                            hi = lo;
                            w *= 2;
                            lo = Math.max(0, hi - w);
                        }
                        while (hi - lo > 0.05) {
                            const mid = (lo + hi) / 2;
                            if (punktFest(k, mid)) hi = mid;
                            else lo = mid;
                        }
                        stelle = lo;
                        bestT = lo / len;
                    }
                }
            }
        }
        // (3) der nähere von Terrain vs Struktur gewinnt.
        if (structHitT < bestT) {
            out.hit = true;
            out.t = structHitT;
            out.x = sx + dx * structHitT;
            out.y = sy + dy * structHitT;
            out.z = sz + dz * structHitT;
            out.nx = sFace.nx;
            out.ny = sFace.ny;
            out.nz = sFace.nz;
        } else if (bestT < Infinity) {
            out.hit = true;
            out.t = bestT;
            out.x = sx + dx * bestT;
            out.y = sy + dy * bestT;
            out.z = sz + dz * bestT;
            const g =
                normale ||
                (rad > 0 ? this._fieldGradient(gx, gy, gz, {}) : this._fieldGradient(out.x, out.y, out.z, {}));
            out.nx = g.x;
            out.ny = g.y;
            out.nz = g.z;
        }
        return out;
    }

    // DIE BOX FÜR DIE KUGEL (K06 · K4, `_fieldRaycast` mit `radius`): die Spanne der Strecke in der um r aufgeblasenen Box —
    // `t` Eintritt (0, wenn die Kugel schon am Start in ihrer Haut steht), `aus` Austritt — und `roh` der Eintritt des dünnen
    // Strahls in die Box selbst (Infinity ohne Schnitt). Bis K4 hielt ein Start in der Haut die Mitte r ENTLANG der Strecke vor
    // der Box: im flachen Winkel stand die Kugel in der Wand (gate:kamera-leib K4 am Haus: 49 von 1096 Bildern, die Linse
    // 0,14 m vor der Fläche); ohne die Haut-Regel fiel der Arm beim Abstieg neben dem GT in das Blickziel (gate:fahr-leben T4).
    _segmentKugelBox(sx, sy, sz, dx, dy, dz, b, r) {
        const q =
            this._kugelBox ||
            (this._kugelBox = {
                minX: 0,
                maxX: 0,
                minZ: 0,
                maxZ: 0,
                topY: 0,
                botY: 0,
                obb: null,
                ob: { cx: 0, cz: 0, c: 1, s: 0, hx: 0, hz: 0 },
            });
        q.minX = b.minX - r;
        q.maxX = b.maxX + r;
        q.minZ = b.minZ - r;
        q.maxZ = b.maxZ + r;
        q.topY = b.topY + r;
        q.botY = b.botY - r;
        const ob = b.obb;
        if (ob) {
            q.ob.cx = ob.cx;
            q.ob.cz = ob.cz;
            q.ob.c = ob.c;
            q.ob.s = ob.s;
            q.ob.hx = ob.hx + r;
            q.ob.hz = ob.hz + r;
            q.obb = q.ob;
        } else q.obb = null;
        const h = this._segmentAABB(sx, sy, sz, dx, dy, dz, q);
        if (!h) return null;
        const g = this._segmentAABB(sx, sy, sz, dx, dy, dz, b);
        h.roh = g ? g.t : Infinity;
        return h;
    }

    // FÜHRT DIE STRECKE TIEFER AN DIE BOX? Der Abstand der Mitte zur Box (gedreht wie `_segmentAABB`) ist längs der Strecke
    // konvex: sein Minimum auf [0, bis] (Goldener Schnitt) liegt mehr als 1 cm unter dem am Start — dann stößt die Kugel, die am
    // Start schon an der Haut steht, sofort an (die Kante, an der sie entlang streicht, zählt nicht).
    _hautTiefer(sx, sy, sz, dx, dy, dz, b, bis) {
        const ob = b.obb;
        const ab = (t) => {
            const x = sx + dx * t;
            const y = sy + dy * t;
            const z = sz + dz * t;
            const qx = ob ? x - ob.cx : x - (b.minX + b.maxX) / 2;
            const qz = ob ? z - ob.cz : z - (b.minZ + b.maxZ) / 2;
            const lx = ob ? qx * ob.c - qz * ob.s : qx;
            const lz = ob ? qx * ob.s + qz * ob.c : qz;
            return Math.hypot(
                Math.max(0, Math.abs(lx) - (ob ? ob.hx : (b.maxX - b.minX) / 2)),
                Math.max(0, b.botY - y, y - b.topY),
                Math.max(0, Math.abs(lz) - (ob ? ob.hz : (b.maxZ - b.minZ) / 2))
            );
        };
        const g = (Math.sqrt(5) - 1) / 2;
        let lo = 0;
        let hi = bis;
        for (let i = 0; i < 24; i++) {
            const m1 = hi - g * (hi - lo);
            const m2 = lo + g * (hi - lo);
            if (ab(m1) < ab(m2)) hi = m2;
            else lo = m1;
        }
        return ab((lo + hi) / 2) < ab(0) - 0.01;
    }

    // Segment-AABB-Schnitt (Slab-Methode) für den Struktur-Raycast. start + dir·t, t ∈ [0,1].
    // Liefert { t, nx, ny, nz } (Eintritts-t + Außen-Normale der getroffenen Fläche) oder null.
    _segmentAABB(sx, sy, sz, dx, dy, dz, b) {
        // DIE GEDREHTE BOX (Haus-Hülle, Welle L): Start und Richtung in den Box-Rahmen, der Schnitt dort, die Normale zurück
        const ob = b.obb;
        if (ob) {
            const qx = sx - ob.cx;
            const qz = sz - ob.cz;
            const lb = this._obbSegBox || (this._obbSegBox = { minX: 0, maxX: 0, minZ: 0, maxZ: 0, topY: 0, botY: 0 });
            lb.minX = -ob.hx;
            lb.maxX = ob.hx;
            lb.minZ = -ob.hz;
            lb.maxZ = ob.hz;
            lb.topY = b.topY;
            lb.botY = b.botY;
            const h = this._segmentAABB(
                qx * ob.c - qz * ob.s,
                sy,
                qx * ob.s + qz * ob.c,
                dx * ob.c - dz * ob.s,
                dy,
                dx * ob.s + dz * ob.c,
                lb
            );
            if (h) {
                const nx = h.nx;
                const nz = h.nz;
                h.nx = nx * ob.c + nz * ob.s;
                h.nz = -nx * ob.s + nz * ob.c;
            }
            return h;
        }
        const inv = (v) => (Math.abs(v) < 1e-9 ? 1e9 : 1 / v);
        const ix = inv(dx),
            iy = inv(dy),
            iz = inv(dz);
        let t1 = (b.minX - sx) * ix,
            t2 = (b.maxX - sx) * ix;
        let tmin = Math.min(t1, t2),
            tmax = Math.max(t1, t2);
        let axis = 0,
            sign = t1 < t2 ? -1 : 1;
        t1 = (b.botY - sy) * iy;
        t2 = (b.topY - sy) * iy;
        const ymin = Math.min(t1, t2),
            ymax = Math.max(t1, t2);
        if (ymin > tmin) {
            tmin = ymin;
            axis = 1;
            sign = t1 < t2 ? -1 : 1;
        }
        tmax = Math.min(tmax, ymax);
        t1 = (b.minZ - sz) * iz;
        t2 = (b.maxZ - sz) * iz;
        const zmin = Math.min(t1, t2),
            zmax = Math.max(t1, t2);
        if (zmin > tmin) {
            tmin = zmin;
            axis = 2;
            sign = t1 < t2 ? -1 : 1;
        }
        tmax = Math.min(tmax, zmax);
        if (tmax < Math.max(0, tmin) || tmin > 1) return null; // kein Schnitt im Segment
        const t = tmin < 0 ? 0 : tmin;
        return {
            t,
            aus: tmax, // der Austritt (die Spanne der Kugel, `_segmentKugelBox`)
            nx: axis === 0 ? sign : 0,
            ny: axis === 1 ? sign : 0,
            nz: axis === 2 ? sign : 0,
        };
    }

    // Höchste Oberkante aller FILL-Edits (gelaende-core `editKrone`): darüber hebt der `_voxelSurfaceY`-Envelope-Skip
    // seine Grenze. Cache per Identität+Länge des Edit-Arrays (push via `_addVoxelEdit`; Welt-Wechsel/Regen
    // tauscht oder leert es). Keine Fill-Edits → −Infinity.
    _voxelEditsFillTop() {
        const meta = this.state.worldMeta;
        const edits = meta && Array.isArray(meta.voxelEdits) ? meta.voxelEdits : null;
        const len = edits ? edits.length : 0;
        const cache = this._editFillTopCache;
        if (cache && cache.edits === edits && cache.len === len) return cache.top;
        const topY = globalThis.__gelaendeCore.editKrone(edits);
        this._editFillTopCache = { edits, len, top: topY };
        return topY;
    }

    _tickVoxelChunkStreaming(playerPos) {
        if (!this.state.voxelTerrainActive || !playerPos) return;
        if (!this.state.voxelChunks) this.state.voxelChunks = new Map();
        const { span } = this._voxelChunkConfig();
        const pcx = Math.floor(playerPos.x / span);
        // V9.92 (Phase 4 — Lazy-BVH): aktuelle Spieler-Chunk-Position
        // zwischenspeichern, damit `_ensureVoxelChunkAt` Lazy-BVH-Decision
        // treffen kann (r ≤ 1 = sofort BVH, r ≥ 2 = lazy).
        this._setLastPlayerVoxelChunk(pcx, Math.floor(playerPos.z / span));
        const pcz = Math.floor(playerPos.z / span);
        this._ringWaechst(); // der Ring um die Zelle dieses Takts
        const { ringRadius } = this._voxelChunkConfig();
        // DAS AUGE DER STUFEN (K51-2): derselbe Punkt wählt die Stufe jedes Chunks und treibt den Geomorph des Boden-Stoffs
        this._stufeAugeTakt(playerPos);
        // Velocity-Prefetch: die 1–2 Chunks in Laufrichtung ZUERST in die Worker-Queue (der Ring läuft in
        // fester dz/dx-Reihenfolge, der kommende Chunk käme sonst ~5.) → der Boden steht, bevor der Spieler
        // ankommt. Billige Async-Anfrage (der Ring re-fragt als no-op); nur bei > 1 m/s.
        if (this.state.playerVel) {
            const v = this.state.playerVel;
            const vx = v.x(),
                vz = v.z();
            const speedSq = vx * vx + vz * vz;
            if (speedSq > 1) {
                const inv = 1 / Math.sqrt(speedSq);
                const dirX = vx * inv,
                    dirZ = vz * inv;
                for (let ahead = 1; ahead <= 2; ahead++) {
                    const acx = pcx + Math.round(dirX * ahead);
                    const acz = pcz + Math.round(dirZ * ahead);
                    if (!this.state.voxelChunks.has(`${acx},${acz}`)) {
                        this._ensureVoxelChunkAt(
                            acx,
                            acz,
                            this._voxelChunkLodFor(acx, acz, playerPos.x, playerPos.z, null)
                        );
                    }
                }
            }
        }
        let built = 0;
        // V18.263 — der PID-Regelkreis fährt diese zwei Stellgrößen (statt fix 4/6):
        // unter gemessener Last sinkt das Streaming-Budget → weniger Chunk-Builds pro
        // Frame → kleinerer Spike. `?? 4/6` = sicherer Default (alte Welten/Tests).
        // Beide sind Kappen je Takt (`_kappeOffen`, K60-2): im Lade-Takt baut der Strom bis zur EINEN Frist des Lade-Frames,
        // die er mit jedem Leser des ersten Weltbilds teilt — keine eigene Uhr (bis B4-n1 trug er eigene LADE_TAKT_MS, ein
        // zweiter Lade-Frame im Frame), kein Boden ohne Frist (B4: der Ring-Boden in EINEM Zug, ein Block von 1,4–1,8 s hielt
        // Buch und Leib auf, Radeon kalt Leib 6,3 -> 8,3 s); läuft sie ab, gehört der Takt den Antworten von Buch und Leib.
        const FRAME_BUDGET_MS = Number.isFinite(this.state._voxelStreamBudgetMs) ? this.state._voxelStreamBudgetMs : 4;
        const MAX_PER_FRAME = Number.isFinite(this.state._voxelStreamMaxPerFrame)
            ? this.state._voxelStreamMaxPerFrame
            : 6;
        // DIE STAND-WACHE: steht der Ring (jede Zelle in ihrer Stufe, keiner wartet) und regt sich nichts, geht der Gang
        // nicht — Ring, Prune und Wasser-Weckruf lesen die Stufen-Zelle (`_stufenZelle`: die Spieler-Zelle und das Fach der
        // Lage zwischen den Stufen-Schwellen in Metern, K51-3) und die Chunk-Menge. Nachwuchs läuft weiter.
        if (this._standRuht("strom", 1, this._stufenZelle(playerPos.x, playerPos.z), "boden")) {
            this._tickFoliageGrowth();
            return 0;
        }
        // DAS BILD DER ANKUNFT ZUERST (B-Blick): unter dem Ladeschirm geht der Ring erst die Stücke im Bild (`_rangImBild`, mit der
        // halben Diagonale wie der Boden-Term) mit der Frist des Lade-Frames, danach die übrigen mit der Kappe des Spiels (ohne
        // Frist, `_kappeOffen(…, false)`) — die Frist gehört dem Bild. JEDE HÄLFTE TRÄGT IHRE EIGENE KAPPE: Zähler und Uhr beginnen
        // mit ihr, und wie die Hälfte im Bild endet, nimmt der Hälfte außer Bild nie ihren Takt — der Ring steht rundum, wie lange
        // der Ladeschirm auch steht. Bis dahin teilten beide Zähler und Uhr (jeder Neu-Ruf eines Stücks im Flug zählt), und nach
        // dem Umstellen verhungerte der Ring hinter dem Spieler (integ-CI 39514723735: wiese Ring 0 von 2 nach 2224 Takten). Bis
        // B-Blick baute er rundum in Ring-Reihe (GTX kalt: 40 von 122 Ring-Rufen außer Blick, p3/n2010/blick/f5.txt).
        // DIE HÄLFTE AUSSER BILD GEHÖRT DEM LEERLAUF (w4-ankunft-2): unter dem Ladeschirm baut der Takt ein Stück außer Bild nur,
        // wenn der Haupt-Faden seit dem letzten Takt Leerlauf hatte (`_ringLeerlauf`, gesetzt von einem Leerlauf-Ruf ohne Frist,
        // `_imLeerlauf`: er kommt nur, wenn der Faden ruht). Trägt der Faden das Bild ganz (GTX kalt bis zum Bild 97 % belegt),
        // wartet der Ring hinter dem Spieler auf den Nachlauf des Bilds (`_nachlaufTakt`, rundum); wartet das Bild auf die Fäden
        // oder die GPU, baut er in ihrem Leerlauf — der Ring steht rundum, wie lange der Ladeschirm auch steht. Ein wartendes
        // Stück hält den Strom wach. Bis hierher nahm die Hälfte außer Bild jedem Lade-Takt seine Kappe (GTX kalt, B-Blick:
        // 40 Ring-Rufe, 10 Einbauten und 10 Saaten außer Blick, 0,94 s Haupt-Faden vor dem Bild).
        let [haelfte, n, t0, satt] = [null, 0, 0, false];
        const weiter = (frist) =>
            this._kappeOffen(++n, MAX_PER_FRAME, frist) &&
            this._kappeOffen(performance.now() - t0, FRAME_BUDGET_MS, frist);
        const [lade, halb, zellen] = [this._ladeTakt(), span * Math.SQRT1_2, []];
        const leerlauf = lade && this._ringLeerlauf === true;
        this._ringLeerlauf = false;
        let draussen = 0;
        for (let r = 0; r <= ringRadius; r++)
            for (let dz = -r; dz <= r; dz++)
                for (let dx = -r; dx <= r; dx++) {
                    if (Math.max(Math.abs(dx), Math.abs(dz)) !== r) continue;
                    const [cx, cz] = [pcx + dx, pcz + dz];
                    const bild = !lade || !r || this._rangImBild({ x: (cx + 0.5) * span, z: (cz + 0.5) * span }, halb);
                    zellen.push([cx, cz, bild]);
                }
        if (lade) zellen.sort((a, b) => b[2] - a[2]); // stabil: im Bild zuerst, je Hälfte in Ring-Reihe
        for (const [cx, cz, bild] of zellen) {
            if (bild !== haelfte) [haelfte, n, t0, satt] = [bild, 0, performance.now(), false]; // die Hälfte beginnt ihre Kappe
            if (satt) continue;
            const key = `${cx},${cz}`;
            // Distanz-LOD: gewünschte LOD je Frame aus der Spieler-Distanz; trägt ein Chunk eine ANDERE, wird
            // er dirty + rebuildet, sonst skipt der Tick (keine Re-Allokation bei stehendem Spieler).
            const existing = this.state.voxelChunks.get(key);
            // N3 — die jetzige LOD des Chunks fliesst in die Distanz-Wahl
            // (Hysterese-Deadband am Grat); ein frischer Chunk (kein
            // `existing`) bekommt die reine Band-LOD.
            const existingLod = existing && Number.isFinite(existing.lod) ? existing.lod : null;
            const desiredLod = this._voxelChunkLodFor(cx, cz, playerPos.x, playerPos.z, existingLod);
            if (existing) {
                const currentLod = existingLod !== null ? existingLod : 0;
                if (currentLod !== desiredLod && !existing.empty) {
                    if (lade && !bild && !leerlauf) {
                        draussen++;
                        continue;
                    }
                    this._rebuildVoxelChunk(cx, cz, desiredLod);
                    built++;
                    satt = !weiter(bild);
                }
                continue;
            }
            if (lade && !bild && !leerlauf) {
                draussen++;
                continue;
            }
            this._ensureVoxelChunkAt(cx, cz, desiredLod);
            built++;
            // Soft-Budget nach jedem Build (inkl. des letzten `_ensureVoxelChunkAt`): mindestens ein Chunk je
            // Frame und Hälfte auch über Budget — sonst friert das Streaming ein.
            satt = !weiter(bild);
        }
        // die Hälfte außer Bild wartet: der Leerlauf-Ruf (EINER zugleich) gibt dem nächsten Lade-Takt ihre Kappe
        if (draussen && !this._ringLeerlaufBestellt) {
            this._ringLeerlaufBestellt = true;
            this._imLeerlauf(() => {
                this._ringLeerlaufBestellt = false;
                this._ringLeerlauf = true;
            });
        }
        this._pruneDistantVoxelChunks(playerPos);
        // Ein Bau-Ruf (fertig, wartend oder verworfen) hält den Ring wach — auch ein Stück, das auf den Leerlauf wartet; die
        // Chunk-Menge regt die Welt selbst.
        this._standMeldet("strom", 1, false, built > 0 || draussen > 0);
        // DETERMINISMUS-BOGEN P3 — kein BVH-Pump/Watchdog mehr: die Spieler-Kollision
        // liest das Dichtefeld (`_stepCharacter`), das überall definiert ist (auch unter
        // ungebauten Chunks) → der Spieler kann nicht durchfallen, kein Sync-BVH-Anker nötig.
        this._tickFoliageGrowth(); // V18.275 — die Vegetation wächst nach, wenn der Radius wächst
        // V17.1 — die Bau-Zahl dieses Frames zurückgeben, damit der Loop die
        // Klein-Vegetation NUR streut, wenn der Ring sich gesetzt hat (Terrain-
        // Priorität, wie ein Profi-Engine: erst das Gelände, dann die Deko).
        return built;
    }

    // ### Voxel-Edits: 3D-Graben + Aufschütten ###
    // `carveVoxel` nimmt eine Säule heraus, `fillVoxel` vereinigt sie mit dem Boden (die Form des Kerns, gelaende-core
    // `editForm`: Radius r, halbe Höhe r, oben und unten eben) — beide über `_addVoxelEdit`. Der Edit landet in
    // worldMeta.voxelEdits (persistiert), `_terrainDensityAt` trägt ihn (Grube/Schacht/Turm); die betroffenen Chunks werden neu
    // gemesht.
    _addVoxelEdit(x, y, z, r, mode) {
        if (!this.state.worldMeta) return false;
        if (!Number.isFinite(x) || !Number.isFinite(y) || !Number.isFinite(z)) return false;
        if (!Array.isArray(this.state.worldMeta.voxelEdits)) this.state.worldMeta.voxelEdits = [];
        const edits = this.state.worldMeta.voxelEdits;
        const radius = Math.max(1, Math.min(12, Number(r) || 3.5));
        // y auf das nutzbare Chunk-Höhen-Band (+ Radius-Marge) klemmen: außerhalb liegen keine Dichte-
        // Zellen, der Edit wirkte nicht, triggerte aber leere Skirt-Remeshes. Weit außerhalb (> r+8) →
        // still verworfen. Band-Grenzen aus `_voxelChunkConfig` (eine Quelle).
        const base = this.state.terrainBaseHeight || 0;
        const cfg = this._voxelChunkConfig();
        const floorY = base - cfg.floorDrop;
        const ceilY = floorY + cfg.dimY * cfg.step;
        const Y_MIN = floorY - radius - 8;
        const Y_MAX = ceilY + radius + 8;
        if (y < Y_MIN || y > Y_MAX) return false;
        const yClamped = Math.max(floorY - radius, Math.min(ceilY + radius, y));
        const newEdit = { x, y: yClamped, z, r: radius, mode: mode === "fill" ? "fill" : "carve" };
        // Kein Deckel (K23): jeder Edit bleibt, Main und Worker tragen dieselbe Liste; die Leser fragen je Chunk (die
        // Karte, `_voxelEditKarte`). Bis K23 verdrängte ein FIFO-Deckel (256) still den ersten — nur im Main.
        edits.push(newEdit);
        this._editWirkt(newEdit, true);
        // Fill unter sich darf den Spieler nicht begraben (sonst steckt er Meter unter der neuen
        // Oberfläche im Fels) → Rettung. Nur fill schließt ein; carve öffnet.
        if (mode === "fill") this._rescuePlayerFromEditSolid(x, yClamped, z, radius);
        // Persistenz debounced (~1.2 s nach dem letzten Hit): der nächste Stand reicht dem Speicher-Faden die neuen Edits als
        // Anhang. Der Edit liegt schon in `worldMeta.voxelEdits`; jeder andere Save nimmt ihn sofort mit.
        this._scheduleEditSave();
        return true;
    }

    // DIE WIRKUNG EINES EDITS (der EINE Reaktiv-Pfad): Faden, Stau, Gras, Neubau, Wasser — für den neuen Edit (`neu`: der Faden
    // bekommt ihn als Anhang, das stehende Netz trägt seine Säule vorläufig) und für jeden, der mit einem zurückgespielten Stand
    // kam oder fiel (`_standRueckspielen`: der Faden bekommt danach die ganze Liste, der Neubau trägt den Boden ohne ihn).
    _editWirkt(ed, neu) {
        // DIE REICHWEITE DES EDITS (gelaende-core `editReich`): so weit ändert seine Form die Dichte — jeder Neubau, jede
        // Wasser-Kappe, jede Weckung unten deckt sie (der Radius allein ließ die Kehle der Vereinigung im Nachbar-Chunk alt).
        const { x, z } = ed;
        const reich = globalThis.__gelaendeCore.editReich(ed);
        // Edit-Delta an den Worker: die Generation der berührten Chunks steigt, ihre Antworten im Flug und im Cache
        // fallen; der Pump fordert frisch nach. No-op ohne gespawnten Worker (vor Worldgen).
        this._voxelWorkerNotifyEdit(ed, neu);
        // der Stau der Werke folgt dem Edit, ehe ein Faden die Chunks neu baut (ein Damm hält, ein Schnitt öffnet ihn)
        this._stauFelder();
        // `_remeshVoxelChunksAround` ist der EINZIGE Reaktiv-Pfad: die Chunks bauen neu, das Cell-Feld
        // klassifiziert die neue Lage (Carve unter waterLevel → WATER, Fill → SOLID) — Cells sind DERIVED,
        // kein Hydro-Recompute. Nur die Footprint-Chunks werden grass-dirty (Oberfläche geändert); die
        // Skirt-Nachbarn behalten ihr Gras.
        if (!this.state.grassDirtyChunks) this.state.grassDirtyChunks = new Set();
        const { span } = this._voxelChunkConfig();
        const fcx0 = Math.floor((x - reich) / span);
        const fcx1 = Math.floor((x + reich) / span);
        const fcz0 = Math.floor((z - reich) / span);
        const fcz1 = Math.floor((z + reich) / span);
        for (let fcx = fcx0; fcx <= fcx1; fcx++) {
            for (let fcz = fcz0; fcz <= fcz1; fcz++) this.state.grassDirtyChunks.add(`${fcx},${fcz}`);
        }
        this._remeshVoxelChunksAround(x, z, reich);
        // DER NEUBAU KOMMT AUS DEM FADEN (Lehre 14): Fußabdruck und Saum bauen über den Neubau-Takt (`_tickDirtyVoxelChunks`,
        // nah zuerst), bis dahin trägt das stehende Netz die Säule (`_editGestaltVorlaeufig`) — dasselbe Bild, in dem der
        // Klick fiel. Bis bau-faden baute der Edit seinen Fußabdruck synchron (`_syncRebuildEditFootprint`, 4 Chunks:
        // 215 ms je Bau-Klick im Haupt-Faden, höchstens 374 ms).
        if (neu) this._editGestaltVorlaeufig(ed);
        // Kappen/Quell-Markierungen/Stau-Felder der Region verwerfen — der Spill-Scan muss die FRISCHEN Zellen sehen (ein
        // Fill kann Damm sein, ein Carve ihn öffnen; die Zellen des Neubaus verwirft `_finalizeVoxelChunkBuild` ebenso), und
        // der Lazy-Neubau legt das Level auf das Gesetz der neuen Zellen (`_ensureWaterCALevel`, F3). Bis F3 säte der Edit das Level
        // vorher aus den alten Zellen (`_preSeedWaterCAForEdit`), damit der Automat den Graben sichtbar fülle — sein Dach
        // stand dabei je Spalte auf einer eigenen Höhe neben dem Spiegel (die zweite Fläche).
        this._invalidateWaterCapsAround(x, z, reich);
        // T4a-2 — den Wasser-Automaten in der Carve-Region + 1-Ring WECKEN: die Zellen änderten sich
        // (neuer Raum geöffnet/verfüllt) → das Wasser strömt nach (active-cell, settled danach inaktiv).
        {
            const { span } = this._voxelChunkConfig();
            const minCX = Math.floor((x - reich) / span) - 1;
            const maxCX = Math.floor((x + reich) / span) + 1;
            const minCZ = Math.floor((z - reich) / span) - 1;
            const maxCZ = Math.floor((z + reich) / span) + 1;
            for (let cx = minCX; cx <= maxCX; cx++) for (let cz = minCZ; cz <= maxCZ; cz++) this._wakeWaterCA(cx, cz);
        }
    }

    carveVoxel(x, y, z, r) {
        return this._addVoxelEdit(x, y, z, r, "carve");
    }

    fillVoxel(x, y, z, r) {
        return this._addVoxelEdit(x, y, z, r, "fill");
    }

    // Zieht `n` Material-Einheiten aus dem Inventar (alle Material-Slots, FIFO); false + Inventar
    // unberührt, wenn nicht genug da ist. Irgendein Material — die Voxel-Farbe kommt aus dem Welt-Feld.
    _consumeAnyMaterial(n) {
        const inv = this.state.player && this.state.player.inventory;
        if (!Array.isArray(inv)) return false;
        let total = 0;
        for (const slot of inv) {
            if (slot && slot.kind === "material") total += slot.count || 0;
        }
        if (total < n) return false;
        let remaining = n;
        for (let i = 0; i < inv.length && remaining > 0; i++) {
            const slot = inv[i];
            if (slot && slot.kind === "material" && slot.count > 0) {
                const take = Math.min(slot.count, remaining);
                slot.count -= take;
                remaining -= take;
                if (slot.count <= 0) inv[i] = null;
            }
        }
        return true;
    }

    // Modus-Gate fürs Aufschütten (Spiegel von `_buildMaterialGate`): pfad = Material-Kreis (graben
    // gibt, aufschütten kostet COST Material); frieden + schöpfer formen frei.
    _voxelFillGate() {
        const mode = typeof this.getGameMode === "function" ? this.getGameMode() : "frieden";
        if (mode !== "pfad") return { ok: true, free: true };
        const COST = 4;
        if (this._consumeAnyMaterial(COST)) return { ok: true, free: false, cost: COST };
        return { ok: false, reason: "kein Material" };
    }

    // Liegt ein CARVE-Edit in der 3×3-Chunk-Region um (cx,cz)? Nur dort seedet die Flut aus Nachbar-Zellen (`_flutSaat`,
    // im Sync-Bau wie im Worker-Auftrag), damit sie über die Naht läuft; unberührte Chunks bleiben atlas-only.
    _chunkRegionHasCarve(cx, cz) {
        const edits = this._voxelEditsNah(cx, cz);
        if (!edits.length) return false;
        const { span } = this._voxelChunkConfig();
        const loX = (cx - 1) * span,
            hiX = (cx + 2) * span,
            loZ = (cz - 1) * span,
            hiZ = (cz + 2) * span;
        for (let e = 0; e < edits.length; e++) {
            const ed = edits[e];
            if (ed && ed.mode === "carve" && ed.x >= loX && ed.x <= hiX && ed.z >= loZ && ed.z <= hiZ) return true;
        }
        return false;
    }

    // Markiert jeden Chunk, den die Reichweite r eines Edits berührt (±`skirt` Chunks), als dirty;
    // `_tickDirtyVoxelChunks` baut sie verteilt (≤1/Frame, nächster zuerst) statt 9 Sync-Rebuilds im
    // selben Frame. Tests drainen per `_drainDirtyVoxelChunks()`. skirt=1 für Density-Edits (Pad+Crop
    // liest 1 Cell in den Nachbarn → sonst Naht); skirt=0 für Architektur (nur Cell-Stempel, keine
    // Density → ~89 % weniger Rebuilds).
    _remeshVoxelChunksAround(x, z, r, skirt = 1) {
        if (!this.state.voxelChunks || this.state.voxelChunks.size === 0) return;
        if (!this.state.dirtyVoxelChunks) this.state.dirtyVoxelChunks = new Set();
        const { span } = this._voxelChunkConfig();
        const minCX = Math.floor((x - r) / span) - skirt;
        const maxCX = Math.floor((x + r) / span) + skirt;
        const minCZ = Math.floor((z - r) / span) - skirt;
        const maxCZ = Math.floor((z + r) / span) + skirt;
        for (let cx = minCX; cx <= maxCX; cx++) {
            for (let cz = minCZ; cz <= maxCZ; cz++) {
                const key = `${cx},${cz}`;
                if (this.state.voxelChunks.has(key)) {
                    this.state.dirtyVoxelChunks.add(key);
                }
            }
        }
    }

    // DIE VORLÄUFIGE GESTALT EINES EDITS (bau-faden): bis der Neubau aus dem Faden kommt, trägt das stehende Netz die Säule
    // des Kerns (gelaende-core `editForm`: Radius r, oben und unten eben bei y ± r) — jede Ecke in ihr rückt auf die Fläche,
    // der sie zugewandt ist: beim Aufschütten die nach oben gewandte auf die Krone, die nach unten gewandte auf den Fuß, beim
    // Graben umgekehrt. Lage und Morph-Ziel gehen in den Satz (`_chunkSatzMarke`), die Boden-Karte rastert die bewegten
    // Dreiecke der gezeichneten Lage neu (`_bodenKarteNaht` ganz): Fuß, Wiese und Streu lesen die Säule ab dem Bild des
    // Klicks, der Körper steht auf dem Gesetz (Lehre 22). Kein Chunk-Stoff entsteht hier; der Neubau ersetzt das Netz. Trägt
    // kein Netz die Krone eines Aufschüttens (keine Ecke in der Säule: der Block auf einem Bau), zeichnet die Säule sich selbst
    // (`_saeuleVorlaeufig`). Liefert die Zahl der Chunks, deren Netz die Säule trägt.
    _editGestaltVorlaeufig(ed) {
        const vc = this.state.voxelChunks;
        if (!vc || !vc.size || !(ed.r > 0)) return 0;
        const { span, step } = this._voxelChunkConfig();
        const [y0, y1, rr, fill] = [ed.y - ed.r, ed.y + ed.r, ed.r * ed.r, ed.mode === "fill"];
        // die Säule an der Lage A (Ecke v, ihre Normale in N): true, wo sie eine Ecke bewegt
        const saeule = (A, N) => {
            let bewegt = false;
            for (let v = 0; v < A.length; v += 3) {
                const [dx, y, dz] = [A[v] - ed.x, A[v + 1], A[v + 2] - ed.z];
                if (dx * dx + dz * dz >= rr || !(y > y0 && y < y1)) continue;
                A[v + 1] = N[v + 1] >= 0 === fill ? y1 : y0;
                bewegt = true;
            }
            return bewegt;
        };
        // die Chunks, deren Netz (samt Saum, ein Schritt) in die Säule reicht
        const [a0, a1] = [Math.floor((ed.x - ed.r - step) / span), Math.floor((ed.x + ed.r + step) / span)];
        const [b0, b1] = [Math.floor((ed.z - ed.r - step) / span), Math.floor((ed.z + ed.r + step) / span)];
        let n = 0;
        for (let cx = a0; cx <= a1; cx++)
            for (let cz = b0; cz <= b1; cz++) {
                const E = vc.get(`${cx},${cz}`);
                if (!E || E.empty || !E.mesh) continue;
                const g = E.mesh.geometry;
                const N = g.attributes.normal.array;
                if (!saeule(g.attributes.position.array, N)) continue;
                saeule(g.attributes.aMorphTarget.array, N);
                this._chunkSatzMarke("boden", `${cx},${cz}`, ["position", "aMorphTarget"]);
                // die Karte aus der gezeichneten Lage (samt Naht-Morph des Saums), die Säule darin wie im Netz
                const naht = this._bodenNaht(g, cx, cz, E.lod || 0);
                const L = new Float32Array((naht.lage && naht.lage.ref) || g.attributes.position.array);
                saeule(L, N);
                const k = this._bodenKarteNaht(g, cx, cz, E.lod || 0, L, "lage", true);
                // die Karte der Ziele trägt die Säule im Inneren (`ganz`, w4-b-boden): der Leser im Übergangs-Band rastert sonst
                // nur, was am Saum zog — sie liegt seit dem Einbau (aus dem Faden), ein Neu-Raster der Lage allein ließe sie alt
                const Z = g.attributes.aMorphTarget.array;
                const kz =
                    naht.ziel && (E.lod || 0) < 3 ? this._bodenKarteNaht(g, cx, cz, E.lod || 0, Z, "ziel", true) : null;
                [E.surfMap, E.gruenMap, E.surfMapZiel] = [k && k.hoehe, k && k.gruen, kz && kz.hoehe];
                this._streuFussNeu(cx, cz);
                n++;
            }
        if (fill) this._saeuleVorlaeufig(ed);
        return n;
    }

    // DIE SÄULE, DIE KEIN NETZ TRÄGT (w4-fall-wackler): ein Aufschütten, in dessen Säule kein Netz eine Ecke hat — der Block
    // auf einem Bau (dem Dachboden, einem Deck), über einem Grund, dessen Platte den Boden darunter schnitt (gelaende-core
    // `erdbauSchnitt`) —, rückt keine Ecke auf die Krone (`_editGestaltVorlaeufig`): bis zum Neubau aus dem Faden zeichnete
    // NICHTS den Block, auf dem der Leib ab dem Takt des Klicks stand (er steht auf dem Gesetz), der Sicht-Boden unter seinem
    // Fuß war blind (`_bodenSichtAt` null, 9–10 Takte bis zur ersten Antwort des Fadens). gate:fall-waechter B2 Dach sah es,
    // wenn die Landung vor dem Neubau kam: „SOHLE 198 m“ in der CI auf 2 Kernen (3 von 4 Läufen), lokal auf einem Kern. Dann
    // zeichnet die Säule sich selbst — die Form des Kerns (`editForm`: Radius r, eben bei y ± r) als Bereich `saeule:<n>` im
    // Boden-Satz, gefärbt wie jeder Boden (`_attachVoxelFieldColors`); ihre Krone ist der gezeichnete Boden des EINEN Lesers
    // (`_bodenSichtAt`), bis jeder Chunk unter ihrem Grundriss neu gebaut ist (der Stand verwirft jede ältere Antwort des
    // Fadens; `_disposeVoxelChunk` nimmt die Säule mit dem letzten). Liefert ihren Schlüssel oder null (das Netz trägt die
    // Krone über der Mitte, kein Chunk liegt unter ihr).
    _saeuleVorlaeufig(ed) {
        const vc = this.state.voxelChunks;
        if (!this.state.scene || !vc) return null;
        const { span, step } = this._voxelChunkConfig();
        const [r, y0, y1] = [ed.r, ed.y - ed.r, ed.y + ed.r];
        if (this._bodenSichtAt(ed.x, ed.z) >= y1 - step / 2) return null;
        const offen = new Set();
        for (let cx = Math.floor((ed.x - r) / span); cx <= Math.floor((ed.x + r) / span); cx++)
            for (let cz = Math.floor((ed.z - r) / span); cz <= Math.floor((ed.z + r) / span); cz++)
                if (vc.has(`${cx},${cz}`)) offen.add(`${cx},${cz}`);
        if (!offen.size) return null;
        const mitte = `${Math.floor(ed.x / span)},${Math.floor(ed.z / span)}`;
        const ck = offen.has(mitte) ? mitte : offen.values().next().value;
        // die Ecken: 0 die Mitte der Krone, je Rand-Schritt k die Krone (1 + k), der Mantel oben (1 + K + k) und unten
        // (1 + 2K + k), der Fuß (1 + 3K + k), 4K + 1 die Mitte des Fußes — die Normale der Krone zeigt nach oben, die des
        // Mantels nach außen, die des Fußes nach unten
        const K = AnazhRealm.SAEULE_ECKEN;
        const nV = 4 * K + 2;
        const [P, N] = [new Float32Array(nV * 3), new Float32Array(nV * 3)];
        const ecke = (i, x, y, z, nx, ny, nz) => {
            [P[i * 3], P[i * 3 + 1], P[i * 3 + 2], N[i * 3], N[i * 3 + 1], N[i * 3 + 2]] = [x, y, z, nx, ny, nz];
        };
        ecke(0, ed.x, y1, ed.z, 0, 1, 0);
        ecke(4 * K + 1, ed.x, y0, ed.z, 0, -1, 0);
        for (let k = 0; k < K; k++) {
            const [c, s] = [Math.cos((2 * Math.PI * k) / K), Math.sin((2 * Math.PI * k) / K)];
            const [x, z] = [ed.x + r * c, ed.z + r * s];
            ecke(1 + k, x, y1, z, 0, 1, 0);
            ecke(1 + K + k, x, y1, z, c, 0, s);
            ecke(1 + 2 * K + k, x, y0, z, c, 0, s);
            ecke(1 + 3 * K + k, x, y0, z, 0, -1, 0);
        }
        // je Rand-Schritt das Dreieck der Krone (von oben gegen den Uhrzeiger), das Viereck des Mantels, das Dreieck des Fußes
        const I = new Uint16Array(12 * K);
        for (let k = 0; k < K; k++) {
            const [j, m, f] = [(k + 1) % K, 1 + K, 1 + 2 * K];
            I.set(
                [0, 1 + j, 1 + k, m + k, m + j, f + j, m + k, f + j, f + k, 4 * K + 1, 1 + 3 * K + k, 1 + 3 * K + j],
                12 * k
            );
        }
        const g = new THREE.BufferGeometry();
        const attr = (a, n) => new THREE.Float32BufferAttribute(a, n);
        g.setAttribute("position", attr(P, 3));
        g.setAttribute("normal", attr(N, 3));
        g.setAttribute("aHimmel", attr(new Float32Array(nV).fill(1), 1)); // unter dem Himmel: die Säule trägt keinen Höhlen-Graph
        g.setIndex(new THREE.BufferAttribute(I, 1));
        this._attachVoxelFieldColors(g); // die Farbe des Bodens am Punkt und der Fels-Stoff, wie jeder Bau im Haupt-Faden
        const E = vc.get(ck);
        g.setAttribute("aMorphTarget", attr(new Float32Array(P), 3)); // kein Geomorph: das Ziel ist die Lage
        g.setAttribute("aMorphWeight", attr(new Float32Array(nV).fill(this._morphCode((E && E.lod) || 0, 0)), 1));
        g.setAttribute("aNormalZiel", attr(new Float32Array(N), 3));
        g.setAttribute("aFarbeZiel", attr(new Float32Array(g.attributes.color.array), 3));
        const S = this.state.saeulenVorlaeufig || (this.state.saeulenVorlaeufig = Object.assign(new Map(), { n: 0 }));
        const key = `saeule:${++S.n}`;
        this._chunkSatzEin("boden", key, g, ck);
        S.set(key, { x: ed.x, z: ed.z, rr: r * r, krone: y1, offen, geom: g });
        return key;
    }

    // Game-Loop-Hook: der Neubau der dirty Chunks über den Worker, NAH ZUERST (Lehre 25). Je Takt gehen die Aufträge der
    // nächsten `DIRTY_IM_FLUG` voraus (billig, der Worker baut sie nacheinander), eingebaut wird höchstens EINER — der
    // nächste fertige (`_finalizeVoxelChunkBuild`, am Dorf 15–60 ms je Chunk). Hat der Strom-Takt in diesem Frame schon
    // einen Chunk eingebaut (`state._bodenEinbau`, seine Ring-Distanz), wartet ein fertiger, der nicht näher liegt, auf
    // den nächsten Frame: zwei Einbauten trägt ein Frame nur für den nächsten Chunk. Bis K69-2 kam je Frame EIN Chunk
    // dran (Manhattan), sein Auftrag allein im Flug, und der Spieler-Chunk baute synchron. Pending/Fail re-dirtyt
    // `_rebuildVoxelChunk` selbst; ohne Worker baut jeder Neubau synchron — dann einer je Frame.
    _tickDirtyVoxelChunks(playerPos) {
        const dirty = this.state.dirtyVoxelChunks;
        if (!dirty || dirty.size === 0) return;
        if (!this.state.voxelChunks || !playerPos) return;
        const { span } = this._voxelChunkConfig();
        const pcx = Math.floor(playerPos.x / span);
        const pcz = Math.floor(playerPos.z / span);
        const reihe = [];
        for (const key of dirty) {
            // Streaming-Prune kann dirty Chunks aus voxelChunks entfernt haben (Spieler ging weg) — Marker stumm verwerfen.
            if (!this.state.voxelChunks.has(key)) {
                dirty.delete(key);
                continue;
            }
            const comma = key.indexOf(",");
            const cx = parseInt(key.slice(0, comma), 10);
            const cz = parseInt(key.slice(comma + 1), 10);
            reihe.push({ key, cx, cz, d: Math.max(Math.abs(cx - pcx), Math.abs(cz - pcz)) });
        }
        reihe.sort((a, b) => a.d - b.d);
        const st = this.state;
        const worker = this._voxelFadenTraegt();
        const imFlug = worker ? AnazhRealm.DIRTY_IM_FLUG : 1;
        const strom = st._bodenEinbau; // die Ring-Distanz des Einbaus, den der Strom in diesem Frame schon tat
        let einbau = false;
        for (let i = 0; i < reihe.length && i < imFlug; i++) {
            const c = reihe[i];
            if (einbau || (Number.isFinite(strom) && c.d >= strom)) {
                // der Frame hat seinen Einbau: ein fertiger Chunk wartet (sein Netz liegt im Cache), ein offener fragt an
                const e = this.state.voxelChunks.get(c.key);
                const lod = e && Number.isFinite(e.lod) ? e.lod : 0;
                if (st.voxelMeshCache && st.voxelMeshCache.has(`${c.cx},${c.cz},${lod}`)) continue;
            }
            dirty.delete(c.key);
            this._rebuildVoxelChunk(c.cx, c.cz);
            if (!dirty.has(c.key)) einbau = true; // eingebaut (oder aufgegeben)
        }
    }

    // Test-Naht: rebuildet ALLE dirty Chunks sofort an der Sync-Stelle „drain" (sonst liefe der Drain
    // headless gegen den async Worker-Pfad und baute nichts). Im Spiel-Pfad NIE gerufen.
    _drainDirtyVoxelChunks() {
        if (!this.state.dirtyVoxelChunks || this.state.dirtyVoxelChunks.size === 0) return 0;
        const keys = [...this.state.dirtyVoxelChunks];
        let built = 0;
        for (const key of keys) {
            this.state.dirtyVoxelChunks.delete(key);
            if (!this.state.voxelChunks || !this.state.voxelChunks.has(key)) continue;
            const comma = key.indexOf(",");
            const cx = parseInt(key.slice(0, comma), 10);
            const cz = parseInt(key.slice(comma + 1), 10);
            if (this._rebuildVoxelChunk(cx, cz, null, { forceSync: "drain" })) built++;
        }
        // V12.0-perf.h — der Rebuild enqueued den Wasser-Iso (deferred); die
        // Test-Naht braucht ihn sofort → die Wasser-Iso-Queue mit-drainen.
        this._drainPendingWaterIso();
        // Welle A — desgleichen das deferred Gras (sonst sehen Tests, die nach
        // dem Drain `voxelChunkGrass` lesen, leere Chunks).
        this._drainPendingGrass();
        return built;
    }

    generateNewWorld({ force = false } = {}) {
        // Cool-Down verhindert Death-Spirals: ohne ihn rief die Selbstanalyse
        // generateNewWorld() im Sekundentakt, während der Spieler durch das
        // gerade gelöschte Terrain fiel.
        const now = performance.now() / 1000;
        if (!force && now - this.state.lastWorldgen < this.state.worldgenCooldown) {
            this.log(
                `generateNewWorld unterdrückt (Cool-Down, noch ${(this.state.worldgenCooldown - (now - this.state.lastWorldgen)).toFixed(1)}s)`,
                "DEBUG"
            );
            return false;
        }
        // Kein Voxel-Flag-Sync: Voxel ist permanent (`worldMeta.voxelTerrain` via `ensureWorldMeta`). Alte
        // Voxel-Chunks bleiben; der Streaming-Ring + `_pruneDistantVoxelChunks` räumen sie.
        this.state.lastWorldgen = now;
        // Der Foundry-Worker startet VOR dem synchronen Worldgen-Block: er lädt Kerne + wärmt die
        // Bibliothek, während Main die Welt rechnet. Billig (Worker + Posts); das Boot-Gate prüft
        // `_ensureAssetFoundry` selbst (foundry-aus → null) — der Aufrufer dupliziert es nicht.
        if (!this._foundry) this._ensureAssetFoundry(); // ihr Boot-Fehler bricht in ihr selbst laut (K22)
        // das Versprechen der Welt: es erfüllt sich, wenn ihre Heimat aus dem Faden steht (Karte hydro-faden)
        return this.generateTerrainWithParameters(this.state.terrainSteepness, this.state.terrainBaseHeight);
    }
}
_stammZonen(AnazhRealm, [AnazhRealm_gelaende_chunks]);

// ===== ATLAS · Gelaende/chunks — Außen-Konstanten =====
// Eintrags-Deckel des Chunk-Mesh-Stores "anazhChunkMesh" (grobes Überlauf-Ventil der Platte im voxel-worker, `platteLege`,
// kein LRU): LOD-0-Chunk ≈ 0.2–0.6 MB → ~600 Einträge halten den Store unter wenigen hundert MB.
AnazhRealm.CHUNK_IDB_MAX = 600;
// Die FORM des rohen Worker-Replys im Store (ein Teil des Stempels, `_chunkPlatte`): ändert sich, was der Worker liefert,
// liest kein Boot die alte Form — seit Welle 7 trägt er den Höhlen-Graph (`hTri` · `hKnoten` · `hSeiten` · `hKanten`); seit
// Welle L liegt das Fluss-Bett auf dem Spiegel (`_hydrosphereCarveAt`): ein alter Chunk trüge den alten Kanal; und die
// Ufer-Farbe läuft mit der Kronen-Blende aus (`_waterLevelAt` → `ufer`): ein alter Chunk trüge das Rauten-Schachbrett; seit
// der Gegenprüfung läuft die Bank mit ihrer Neigung ins Gelände (Kanal und Damm): ein alter Chunk trüge die Gleit-Wand; seit
// Runde 3 trägt die Deck-Zelle das flache Wasser und das Ufer liest den Boden der Spalte: alte Zellen zeichneten den Bach nicht;
// und jede Quelle beginnt als Rinnsal: ein alter Chunk trüge den Kanal, der aus dem Nichts bricht; seit Runde 4 trägt der
// Damm eine Krone (`dammBreite`): ein alter Chunk trüge die Schneide, über die das Wasser ins tiefere Gelände lief; seit K17-2
// trägt die Antwort den Stoff (Himmels-Sicht, Schutt, die Feuchte des Mooses, der Fels in `colors`): ein alter Chunk trüge die
// Säulen-Farbe ohne Stoff; seit K17-2 NB1 wellt EIN Gradienten-Rauschen die Bänke und das Geröll streut wie die Referenz:
// ein alter Chunk trüge die Welle aus dem Wert-Rauschen; seit der Karte hydro-faden legt der Faden seinen rohen Reply ab (die
// Puffer, das Morph-Ziel als eigene Kopie): ein alter Eintrag trüge die Typ-Arrays des Mains ohne Morph-Ziel.
AnazhRealm.CHUNK_IDB_FORM = "faden-reply-karte";
// FERN_FARBE (`fernFarbeTeile` im Fern-Faden, linear): das Kronendach des Waldes aus der Ferne = die Studio-Laubfarbe der Arten
// am Ort × `kronenSchatten` (die Krone beschattet sich selbst: die Eiche, Blatt-Grün 0,195, trägt so 0,062 — die
// Satelliten-Bänder geschlossener Laubwald-Kronen im Sommer, grün ~0,05–0,07); die Saison multipliziert der Leser
// (`uSeasonMul`); der Feld-Pass malt neu, wenn die Saison je Kanal um mehr als `saisonDrift` gewandert ist. Das Wasser
// trägt keine Fern-Farbe: es ist der Wasser-Körper des Gesetzes (`_wasserKoerper`, im Ring der Blick des Wassers).
// `memo` = eine Generation des Fern-Farb-Gedächtnisses im Fern-Faden (zwei Generationen tragen > 2 volle Ringe).
AnazhRealm.FERN_FARBE = Object.freeze({
    kronenSchatten: 0.32,
    saisonDrift: 0.05,
    memo: 12288,
});
// Der Neubau der dirty Chunks (`_tickDirtyVoxelChunks`, K69-2): so viele der nächsten gehen je Takt als Auftrag an den
// Worker voraus (er baut sie nacheinander, ~150 ms je Chunk) — eingebaut wird je Takt höchstens EINER, der nächste fertige.
AnazhRealm.DIRTY_IM_FLUG = 3;
// DIE VORLÄUFIGE SÄULE (`_saeuleVorlaeufig`): so viele Ecken trägt ihr Rand — die Kante des Vielecks liegt bei r = 3,5 m höchstens
// r · (1 − cos(π / 16)) = 7 cm innerhalb des Kreises, dessen Krone der Boden-Leser liest. Wirts-Auflösung.
AnazhRealm.SAEULE_ECKEN = 16;
// DIE FOLGE-SCHLANGE der Nachbar-Morphs (`_tickMorphFolge`, fahrt-takt): je Takt ohne Chunk-Einbau so viele ms (mindestens
// ein Morph), eine Bitte älter als die Frist (Takte) morpht in jedem Takt.
AnazhRealm.MORPH_FOLGE_MS = 0.5;
AnazhRealm.MORPH_FOLGE_FRIST = 6;
// DAS WACHSTUM ÜBER BUDGET (`_tickFoliageGrowth`, Lehre 13): je WUCHS_DROSSEL_MS wächst EIN Chunk (der nächste) —
// das Budget drosselt das Tempo, nie die Existenz (dieselbe Garantie wie der Bau über Budget, `_handBauErlaubt`).
AnazhRealm.WUCHS_DROSSEL_MS = 250;
// (P3: SOFT_FLOOR_REST_OFFSET + PLAYER_CHUNK_STALL_MS entfallen — der „weiche Boden"
// + der Sync-BVH-Watchdog sind weg; der Feld-Controller erdet den Spieler direkt aus
// dem Dichtefeld, das überall definiert ist, auch unter ungebauten Chunks.)

// Schrittweite der Zentral-Differenzen im Feld-Gradient (`_fieldGradient`/`_fieldResolveSphere`):
// ≈ halbe Voxel-Schrittweite (eps ≈ λ/2 der Roughness) — fein genug für die echte Normale, grob
// genug gegen Hochfrequenz-Zittern.
AnazhRealm.FIELD_GRAD_EPS = 0.6;

// Max Auswurf-Iterationen pro Kugel (collide-and-slide): typisch 0–2 (flache Penetration), 4 tragen
// auch eine tiefere robust an die Oberfläche; der gesweepte Schritt hält sie radius-beschränkt.
AnazhRealm.FIELD_RESOLVE_ITERS = 4;
