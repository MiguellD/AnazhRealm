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
                worker = new Worker(srcUrl || `voxel-worker.js?v=${AnazhRealm.VERSION}`);
                this._voxelFadenQuelle = srcUrl || `voxel-worker.js?v=${AnazhRealm.VERSION}`; // der Wald-Faden lädt dieselbe
            } catch (_workerErr) {
                // Der Sandbox-Weg ist EIN Versuch (K22): scheitert der Faden über die Blob-URL oder ein zweites Mal, bricht
                // er laut (der äußere Fang meldet ERROR) — nie wieder still mit null, während der Haupt-Thread jeden Chunk
                // selbst baut.
                if (srcUrl || this._voxelWorkerBlobTried) throw _workerErr;
                this._voxelFadenBlobWeg();
                return null;
            }
            this.state.voxelWorkerPending = new Map();
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
                            pending.resolve({ empty: true, lod: msg.lod | 0 });
                        } else {
                            pending.resolve({
                                empty: false,
                                lod: msg.lod | 0,
                                positions: new Float32Array(msg.positions),
                                // das Ziel der gröberen Stufe je Vertex (K51-2, Geomorph), null in der gröbsten Stufe
                                stufeZiel: msg.stufeZiel ? new Float32Array(msg.stufeZiel) : null,
                                normalZiel: msg.normalZiel ? new Float32Array(msg.normalZiel) : null,
                                farbeZiel: msg.farbeZiel ? new Float32Array(msg.farbeZiel) : null,
                                normals: new Float32Array(msg.normals),
                                indices: new Uint32Array(msg.indices),
                                colors: new Float32Array(msg.colors),
                                // der Stoff (K17-2): Himmels-Sicht und Schutt je Vertex, die Feuchte des Mooses je Netz
                                himmel: new Float32Array(msg.himmel),
                                schutt: new Float32Array(msg.schutt),
                                felsFeuchte: msg.felsFeuchte,
                                waterCells: new Uint8Array(msg.waterCells),
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
                        if (msg.empty) {
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
                            pending.reject(new Error(msg.message));
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
            // Der Worker ist erst nutzbar, wenn sein State (Seed, Atlas, voxelEdits) gesetzt
            // ist; fire-and-forget, das Ready-Flag setzt der init-ack.
            this._voxelWorkerSyncState({ op: "init" });
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

    // Voller State-Snapshot für den Worker (Seed, Hydrosphäre-Atlas, voxelEdits, …).
    // Structured Clone statt Transfer: der Main-Thread muss die Atlas-Daten BEHALTEN.
    _voxelWorkerSnapshotState() {
        const seed = (this.state.worldMeta && this.state.worldMeta.seed) || "anazh-realm-seed";
        const snap = {
            seed,
            baseHeight: this.state.terrainBaseHeight || 0,
            waterLevel: typeof this.state.waterLevel === "number" ? this.state.waterLevel : 0,
            voxelEdits: this._snapshotVoxelEdits(),
            hydroComputing: !!this._hydroComputing,
            // der Fluss-Kanal (Welle L): Freibord und das Gesetz der Bank reisen mit — der Worker baut dasselbe Bett
            spiegelFreibord: AnazhRealm.HYDROSPHERE.spiegelFreibord,
            bankNeigung: AnazhRealm.HYDROSPHERE.bankNeigung,
            bankKruemmung: AnazhRealm.HYDROSPHERE.bankKruemmung,
            bankWeite: AnazhRealm.HYDROSPHERE.bankWeite,
            bankRundung: AnazhRealm.HYDROSPHERE.bankRundung,
            dammBreite: AnazhRealm.HYDROSPHERE.dammBreite,
            dammFreibord: AnazhRealm.HYDROSPHERE.dammFreibord,
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
            // DER WIESEN-GRUND reist mit (K53): Farbe, Wache und Fleck aus EINER Quelle (`WIESEN_GRUND`)
            wiesenGrund: AnazhRealm.WIESEN_GRUND,
            // DER FELS-STOFF reist mit (K17-2): der Worker baut ihn beim Chunk-Bau (gelaende-core `felsStoff`) mit DENSELBEN
            // Tönen und Schwellen wie der Sync-Bau des Stamms (`FELS_STOFF.basis` · `FELS_STOFF.netz`)
            felsStoff: { basis: AnazhRealm.FELS_STOFF.basis, netz: AnazhRealm.FELS_STOFF.netz },
            // DIE KONSTANTEN DER FERNE reisen mit (B2): der Fern-Faden färbt den Horizont mit DENSELBEN Zahlen (`fernAuftrag`)
            fern: {
                forest: AnazhRealm.FOREST,
                kronenSchatten: AnazhRealm.FERN_FARBE.kronenSchatten,
                geoSchutt: AnazhRealm.TERRAIN_GEOLOGY.schutt,
                felsMittel: AnazhRealm.FELS_STOFF.mittel,
                memo: AnazhRealm.FERN_FARBE.memo,
            },
        };
        const h = this.state.hydrosphere;
        if (h && h.ready) {
            snap.hydrosphere = {
                ready: true,
                originX: h.originX,
                originZ: h.originZ,
                cell: h.cell,
                dim: h.dim,
                bucketSize: h.bucketSize,
                bucketsDim: h.bucketsDim,
                // riverBuckets ist ein Array of Arrays of segment-Objekten —
                // strukturierte Klon-Kompatibel ohne weitere Transformation.
                riverBuckets: h.riverBuckets,
                lakeBedCell: h.lakeBedCell,
                lakeW: h.lakeW,
                lakeNear: h.lakeNear,
                // h.water trägt waterY/waterKind für den `_waterLevelAt`-Spiegel im Worker (Cell-Klassifikation,
                // Strand-Tint) — ohne sie kennt der Worker nur state.waterLevel, keine Bergsee-Spiegel.
                water: h.water || null,
            };
        } else {
            snap.hydrosphere = null;
        }
        // V9.91 (Phase 3) — hydroBand für Cell-Klassifikations-Skip (Cells
        // außerhalb [bottom..top] sind garantiert AIR; spart 30-40% Cells-
        // Iterationen).
        snap.hydroBand = this.state.hydroBand
            ? { top: this.state.hydroBand.top, bottom: this.state.hydroBand.bottom }
            : null;
        // Die fernen Kacheln reisen mit (plain Object {key: tile}, gelesen in hydroFor) — sonst
        // baut der Worker ferne Chunks gegen die OOB-Wahrheit = Determinismus-Bruch main↔worker.
        snap.hydroTiles = null;
        if (this.state.hydroTiles && this.state.hydroTiles.size) {
            snap.hydroTiles = {};
            for (const [key, t] of this.state.hydroTiles) {
                if (!t || !t.ready) continue;
                snap.hydroTiles[key] = {
                    ready: true,
                    originX: t.originX,
                    originZ: t.originZ,
                    cell: t.cell,
                    dim: t.dim,
                    bucketSize: t.bucketSize,
                    bucketsDim: t.bucketsDim,
                    riverBuckets: t.riverBuckets,
                    lakeBedCell: t.lakeBedCell,
                    lakeW: t.lakeW,
                    lakeNear: t.lakeNear,
                    water: t.water || null,
                };
            }
        }
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

    // Density-Grid im Worker: Promise<Float32Array> mit (dimX+1)·(dimY+1)·(dimZ+1) Floats, Indizierung
    // identisch zu `_voxelSampleDensityGrid`. Test-Pfad: das Determinismus-Band vergleicht bit-identisch.
    _voxelWorkerComputeDensity(ox, oy, oz, dimX, dimY, dimZ, step) {
        const worker = this._getVoxelWorker();
        if (!worker) return Promise.reject(new Error("voxel-worker not available"));
        const ensureReady = this.state.voxelWorkerReady ? Promise.resolve(true) : this._voxelWorkerSyncState();
        return ensureReady.then(() => {
            const requestId = this.state.voxelWorkerNextRequestId++;
            const promise = new Promise((resolve, reject) => {
                this.state.voxelWorkerPending.set(requestId, { resolve, reject });
            });
            worker.postMessage({ type: "density-grid", ox, oy, oz, dimX, dimY, dimZ, step, requestId });
            return promise;
        });
    }

    // Voller Chunk-Mesh im Worker → {empty, positions, indices, normals, colors, waterCells, lod}
    // (`empty` = kein Iso). Density/Iso/Cells/Colors (~145 ms) laufen off-thread; der Main baut nur
    // BufferGeometry + Architektur-Cell-Stempel + BVH + Scene-Attach. Der Auftrag trägt die Flut-Saat der Nachbarn
    // (`_flutSaat`, null ohne Carve im 3×3) — der Worker flutet damit wie der Sync-Bau.
    _voxelWorkerComputeChunkMesh(cx, cz, lod) {
        const worker = this._getVoxelWorker();
        if (!worker) return Promise.reject(new Error("voxel-worker not available"));
        const ensureReady = this.state.voxelWorkerReady ? Promise.resolve(true) : this._voxelWorkerSyncState();
        return ensureReady.then(() => {
            const requestId = this.state.voxelWorkerNextRequestId++;
            const promise = new Promise((resolve, reject) => {
                this.state.voxelWorkerPending.set(requestId, { resolve, reject });
            });
            const saat = this._flutSaat(cx, cz);
            worker.postMessage({ type: "chunk-mesh", cx, cz, lod: lod | 0, saat, requestId });
            return promise;
        });
    }

    // DAS SPIEGEL-FELD off-thread (D10): ein Rechteck der Welt-Zellen (`auftrag`: i0, j0, w, h, texel, bezug, wasserFarbe,
    // baeume, gestalten, block — `spiegelFeldBacken` im Worker) → { hoehen (RGBA-Halbfloat), stoff (RGBA8), hoechste je Block, wasser,
    // hMax } am
    // synchronisierten Zustand.
    _voxelWorkerSpiegel(auftrag) {
        const worker = this._getVoxelWorker();
        if (!worker) return Promise.reject(new Error("voxel-worker not available"));
        const ensureReady = this.state.voxelWorkerReady ? Promise.resolve(true) : this._voxelWorkerSyncState();
        return ensureReady.then(() => {
            const requestId = this.state.voxelWorkerNextRequestId++;
            const promise = new Promise((resolve, reject) => {
                this.state.voxelWorkerPending.set(requestId, { resolve, reject });
            });
            worker.postMessage(Object.assign({ type: "spiegel-feld", requestId }, auftrag));
            return promise;
        });
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
        const worker = new Worker(this._voxelFadenQuelle);
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
            if (msg.type === "error") p.reject(new Error(msg.message));
            else p.resolve(msg);
        };
        worker.onerror = (err) => this._bruchMelden(`${NAME}: der ${Name}-Faden brach — ` + (err && err.message));
        // der EINE volle Stand bei der Geburt; jede spätere Änderung bringt der Sender des Zustands (`_voxelZustandPost`)
        worker.postMessage({ type: "state-set", snapshot: this._voxelWorkerSnapshotState() });
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
    _fernAuftrag(art, msg, transfer) {
        const wl = Number.isFinite(this.state.waterLevel) ? this.state.waterLevel : 0;
        return this._nebenAuftrag(
            "fern",
            Object.assign(
                { type: "fern", art, wl, laub: this._fernLaubLinear(), wasser: this._fernWasserKoerper() },
                msg
            ),
            transfer
        );
    }

    // Wasser-Sheet off-thread: der 3×3-Zell-Block (`entry.waterCells`, KOPIERT — der Main braucht ihn
    // weiter) geht an den Worker, der byte-identisch zu `_computeWaterSheetData` rechnet → {empty:true}
    // oder die Geometrie-Arrays. Nur für CA-freie Nachbarschaften (`_waterSheetCaFree`), sonst sync im
    // Main. smoothPasses MUSS exakt `_mainWaterSheetCtx` entsprechen, sonst bricht die byte-Parität.
    _workerBuildWaterSheet(cx, cz) {
        const worker = this._getVoxelWorker();
        if (!worker) return Promise.reject(new Error("voxel-worker not available"));
        const entry = this.state.voxelChunks ? this.state.voxelChunks.get(`${cx},${cz}`) : null;
        if (!entry || !entry.waterCells) return Promise.resolve({ empty: true });
        const cells = new Array(9).fill(null);
        for (let dz = -1; dz <= 1; dz++) {
            for (let dx = -1; dx <= 1; dx++) {
                if (dx === 0 && dz === 0) {
                    cells[4] = entry.waterCells;
                    continue;
                }
                const nb = this.state.voxelChunks.get(`${cx + dx},${cz + dz}`);
                if (nb && nb.waterCells) cells[(dz + 1) * 3 + (dx + 1)] = nb.waterCells;
            }
        }
        const smoothRaw =
            this.state.atmosphere && Number.isFinite(this.state.atmosphere.waterSheetSmooth)
                ? Math.round(this.state.atmosphere.waterSheetSmooth)
                : 4;
        const smoothPasses = Math.max(0, Math.min(6, smoothRaw));
        const ensureReady = this.state.voxelWorkerReady ? Promise.resolve(true) : this._voxelWorkerSyncState();
        return ensureReady.then(() => {
            const requestId = this.state.voxelWorkerNextRequestId++;
            const promise = new Promise((resolve, reject) => {
                this.state.voxelWorkerPending.set(requestId, { resolve, reject });
            });
            worker.postMessage({ type: "water-sheet", cx, cz, requestId, smoothPasses, cells });
            return promise;
        });
    }

    // Off-thread (statischer Flood-Sheet) nur, wenn Chunk + 8 Nachbarn nicht in `waterCAActive` sind und
    // kein Stau (`waterStauFields`) im 3×3 liegt. Byte-identisch, weil ein settled Chunk am Flood-Spiegel
    // ruht → `_seedWaterLevel` setzt Zellen auf 1 → CA-Delta d == 0 → Main-Sheet == Worker-Sheet
    // (`diag-worker-watersheet`). Aktiv fließende und Stau-Chunks tragen ein echtes Delta → SYNC.
    _waterSheetCaFree(cx, cz) {
        const active = this.state.waterCAActive;
        const stau = this.state.waterStauFields;
        const chunks = this.state.voxelChunks;
        const hasActive = active && active.size > 0;
        const hasStau = stau && stau.size > 0;
        for (let dz = -1; dz <= 1; dz++) {
            for (let dx = -1; dx <= 1; dx++) {
                const k = `${cx + dx},${cz + dz}`;
                if (hasActive && active.has(k)) return false;
                if (hasStau && stau.has(k)) return false;
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
    // Der ROHE Worker-Reply (VOR Architektur-Stempel/surfMap, structured-clone-sicher) reist unverändert
    // in IndexedDB ("anazhChunkMesh"/"chunks"); der zweite Boot liest den Ring von der Platte. Stempel-
    // Mismatch → clear, Fehler → Worker-only (`_idbDead`), Headless → AUS. EINE Naht:
    // `_fetchOrRequestChunkMesh`. window.__anazhChunkIdb: true → an (diag-warm-start), false → aus.
    _chunkIdbInit() {
        if (!this._chunkIdb) this._chunkIdb = {};
        const c = this._chunkIdb;
        if (c._idbReady) return c._idbReady;
        const off = () => {
            c._idbDead = true;
            return null;
        };
        const hook = typeof window !== "undefined" ? window.__anazhChunkIdb : undefined;
        if (
            typeof indexedDB === "undefined" ||
            hook === false ||
            (hook !== true && this.state.renderer && this.state.renderer._isHeadlessNull)
        ) {
            c._idbReady = Promise.resolve(null);
            c._idbDead = true;
            return c._idbReady;
        }
        // Stempel = AnazhRealm.VERSION (jeder Release bustet — bewusst statt SHA über den Stamm) + genVersion
        // + die Form des Replys (CHUNK_IDB_FORM);
        // Mismatch → clear. Der SEED lebt im
        // KEY (`_chunkIdbKey`); Welt-Wechsel ohne Reload behält den Boot-Stempel (Keys sind seed-scoped).
        const genV = typeof this._genVersion === "function" ? this._genVersion() : 1;
        // + der Hash des Erbguts (seine Terme und die Regler der Landform formen jeden Chunk: ein fremdes Erbgut darf nie
        // alte Bytes lesen).
        const stamp =
            AnazhRealm.VERSION + "|" + genV + "|landform|" + this._erbgut().hash + "|" + AnazhRealm.CHUNK_IDB_FORM;
        c._stamp = stamp;
        c._idbReady = new Promise((resolve) => {
            try {
                const req = indexedDB.open("anazhChunkMesh", 1);
                req.onupgradeneeded = () => {
                    req.result.createObjectStore("chunks");
                };
                req.onerror = () => resolve(off());
                req.onsuccess = () => {
                    const db = req.result;
                    const tx = db.transaction("chunks", "readwrite");
                    const st = tx.objectStore("chunks");
                    const g = st.get("__stamp");
                    g.onsuccess = () => {
                        if (g.result !== stamp) {
                            // Gesetz-Version/Erbgut geändert → der GANZE Cache
                            // ist potenziell Drift → leeren (Foundry-Disziplin).
                            st.clear();
                            st.put(stamp, "__stamp");
                            c._count = 1; // nur der Stempel-Eintrag
                        } else {
                            // Zähler-Basis fürs Überlauf-Ventil (inkl. __stamp — grob genügt).
                            const cn = st.count();
                            cn.onsuccess = () => {
                                c._count = cn.result | 0;
                            };
                        }
                    };
                    tx.oncomplete = () => {
                        c._idbDb = db;
                        resolve(db);
                    };
                    tx.onerror = () => resolve(off());
                };
            } catch (_e) {
                resolve(off());
            }
        });
        return c._idbReady;
    }
    // Der Warm-Start-Key: seed|cx,cz|lod — mehrere Welten teilen den Store
    // (der Stempel bustet grob bei Erbgut-/Versions-Wechsel, s. _chunkIdbInit).
    _chunkIdbKey(cx, cz, lod) {
        const seed = (this.state.worldMeta && this.state.worldMeta.seed) || "anazh-realm-seed";
        return `${seed}|${cx},${cz}|${lod}`;
    }
    _chunkIdbGet(key) {
        const c = this._chunkIdb;
        if (!c || c._idbDead || !c._idbDb) return Promise.resolve(null);
        return new Promise((resolve) => {
            try {
                const g = c._idbDb.transaction("chunks", "readonly").objectStore("chunks").get(key);
                g.onsuccess = () => resolve(g.result != null ? g.result : null);
                g.onerror = () => resolve(null);
            } catch (_e) {
                resolve(null);
            }
        });
    }
    _chunkIdbPut(key, payload) {
        const c = this._chunkIdb;
        if (!c || c._idbDead || !c._idbDb || !payload) return;
        try {
            const tx = c._idbDb.transaction("chunks", "readwrite");
            const st = tx.objectStore("chunks");
            // Grobes Überlauf-Ventil statt LRU: der Zähler approximiert (Überschreiben zählt doppelt → räumt eher
            // zu früh); bei Überlauf wird der GANZE Store geleert — Korrektheit hängt nie am Cache.
            if ((c._count | 0) >= AnazhRealm.CHUNK_IDB_MAX) {
                st.clear();
                st.put(c._stamp, "__stamp");
                c._count = 1;
            }
            // st.put KLONT SOFORT (synchron) — die ROHEN Worker-Bytes, bevor
            // der Konsument den Architektur-Stempel in waterCells brennt.
            st.put(payload, key).onerror = () => {
                c._idbDead = true; // Quota/Fehler → still auf den Worker-only-Pfad (Foundry-Vorbild)
            };
            c._count = (c._count | 0) + 1;
        } catch (_e) {
            c._idbDead = true;
        }
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
    // Roundtrip → Result verworfen. Warm-Start: VOR dem Worker-Zweig fragt ein edit-freier Footprint
    // die IndexedDB (pending-Semantik), der resolve füllt denselben `voxelMeshCache`-Pfad.
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
        // Warm-Start-Hit: IDB bereit + 3×3-Footprint edit-frei + kein gemerkter Store-Miss → async get,
        // pending vermerken, null (exakt die pending-Semantik). Der resolve füllt `state.voxelMeshCache` —
        // derselbe Konsum-Pfad + Gen-Stale-Filter wie der Worker-Zweig. Init lazy beim ersten Fetch.
        if (!this._chunkIdb) this._chunkIdbInit();
        const cIdb = this._chunkIdb;
        if (
            cIdb &&
            cIdb._idbDb &&
            !cIdb._idbDead &&
            (!this.state._chunkIdbMiss || !this.state._chunkIdbMiss.has(cacheKey)) &&
            this._chunkFootprintEditFrei(cx, cz)
        ) {
            const genAtIdbRequest = this._voxelStand(cx, cz);
            this.state.voxelMeshPending.add(cacheKey);
            this.state.voxelMeshGenAtRequest.set(cacheKey, genAtIdbRequest);
            this._chunkIdbGet(this._chunkIdbKey(cx, cz, lod)).then((payload) => {
                this.state.voxelMeshPending.delete(cacheKey);
                this.state.voxelMeshGenAtRequest.delete(cacheKey);
                // Derselbe Stale-Filter wie der Worker-Zweig: änderte ein Edit
                // den Stand während des Platten-Roundtrips, ist der Payload
                // gegen alten State — verwerfen (der Pump resubmittet frisch).
                if (this._voxelStand(cx, cz) !== genAtIdbRequest) return;
                // ein Payload ohne Stufen-Ziel (K51-2) ist das alte Format: ein Fehlgriff, der Worker baut frisch
                if (payload && !payload.empty && (payload.lod | 0) < 3 && !(payload.stufeZiel && payload.farbeZiel))
                    payload = null;
                if (payload) {
                    if (!this.state.voxelMeshCache) this.state.voxelMeshCache = new Map();
                    this.state.voxelMeshCache.set(cacheKey, payload);
                    // Diagnose-Zähler (Linse diag-warm-start), keine Spiel-Logik.
                    this.state._chunkIdbHits = (this.state._chunkIdbHits | 0) + 1;
                    if (!this.state._chunkIdbHitByKey) this.state._chunkIdbHitByKey = new Map();
                    this.state._chunkIdbHitByKey.set(cacheKey, (this.state._chunkIdbHitByKey.get(cacheKey) | 0) + 1);
                } else {
                    // Store-MISS gemerkt: der nächste Pump-Tick nimmt direkt
                    // den Worker (sonst fragte der Tick die Platte endlos).
                    // Die Stiftung räumt den Merker wieder.
                    if (!this.state._chunkIdbMiss) this.state._chunkIdbMiss = new Set();
                    this.state._chunkIdbMiss.add(cacheKey);
                }
            });
            return null;
        }
        this.state.voxelMeshPending.add(cacheKey);
        const expectedStateGen = this._voxelStand(cx, cz);
        this.state.voxelMeshGenAtRequest.set(cacheKey, expectedStateGen);
        this._voxelWorkerComputeChunkMesh(cx, cz, lod)
            .then((meshData) => {
                this.state.voxelMeshPending.delete(cacheKey);
                if (this._voxelStand(cx, cz) !== expectedStateGen) {
                    this.state.voxelMeshGenAtRequest.delete(cacheKey);
                    return;
                }
                this.state.voxelMeshGenAtRequest.delete(cacheKey);
                if (!this.state.voxelMeshCache) this.state.voxelMeshCache = new Map();
                this.state.voxelMeshCache.set(cacheKey, meshData);
                // Warm-Start-Stiftung NUR für edit-freie Footprints bei stehender Worldgen-Wahrheit; auch
                // `empty:true` stiften (spart Retries). Der Put klont die rohen Worker-Bytes SOFORT, VOR dem
                // Architektur-Stempel des Konsumenten.
                if (this.state.voxelWorkerWorldgenSynced && this._chunkFootprintEditFrei(cx, cz)) {
                    this._chunkIdbPut(this._chunkIdbKey(cx, cz, lod), meshData);
                    if (this.state._chunkIdbMiss) this.state._chunkIdbMiss.delete(cacheKey);
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
        const geom = new THREE.BufferGeometry();
        geom.setAttribute("position", new THREE.Float32BufferAttribute(meshData.positions, 3));
        geom.setAttribute("normal", new THREE.Float32BufferAttribute(meshData.normals, 3));
        geom.setAttribute("color", new THREE.Float32BufferAttribute(meshData.colors, 3));
        geom.setIndex(new THREE.BufferAttribute(meshData.indices, 1));
        // DER GEOMORPH DER STUFE (K51-2): das Ziel jedes Vertex auf dem Netz der nächst gröberen Stufe (der Worker baut es,
        // `stufeZiel`), die Stufe im Morph-Code (`_morphCode`) — der Boden-Stoff wandert im Übergangs-Band dorthin.
        // Fail-closed: eine Stufe unter der gröbsten ohne Ziel spränge am Wechsel.
        const nVm = meshData.positions.length / 3;
        const zielDa = (z) => z && z.length === meshData.positions.length;
        if ((lod | 0) < 3 && !(zielDa(meshData.stufeZiel) && zielDa(meshData.normalZiel) && zielDa(meshData.farbeZiel)))
            throw new Error(
                `_buildVoxelChunkDataFromWorkerMesh(${cx},${cz}): der Worker liefert kein Stufen-Ziel (L${lod})`
            );
        geom.setAttribute(
            "aMorphTarget",
            new THREE.Float32BufferAttribute(
                (lod | 0) < 3 ? new Float32Array(meshData.stufeZiel) : new Float32Array(meshData.positions),
                3
            )
        );
        geom.setAttribute(
            "aMorphWeight",
            new THREE.Float32BufferAttribute(new Float32Array(nVm).fill(this._morphCode(lod, 0)), 1)
        );
        geom.userData.stufeZiel = (lod | 0) < 3 ? meshData.stufeZiel : null;
        // Normale und Stoff-Farbe wandern mit (der Stoff mischt sie mit demselben Faktor) — die gröbste Stufe trägt ihre eigenen
        geom.setAttribute(
            "aNormalZiel",
            new THREE.Float32BufferAttribute(
                new Float32Array((lod | 0) < 3 ? meshData.normalZiel : meshData.normals),
                3
            )
        );
        geom.setAttribute(
            "aFarbeZiel",
            new THREE.Float32BufferAttribute(new Float32Array((lod | 0) < 3 ? meshData.farbeZiel : meshData.colors), 3)
        );
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
        geom.setAttribute("aHimmel", new THREE.Float32BufferAttribute(meshData.himmel, 1));
        geom.setAttribute("aSchutt", new THREE.Float32BufferAttribute(meshData.schutt, 1));
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
        // Cells sind IMMER LOD 0 → Stempel-Indizierung mit lod=0.
        let waterCells = null;
        if (meshData.waterCells && meshData.waterCells.length > 0) {
            waterCells = meshData.waterCells;
            const lod0Cfg = this._voxelChunkConfig(0);
            const base = this.state.terrainBaseHeight || 0;
            const ox = cx * lod0Cfg.span;
            const oz = cz * lod0Cfg.span;
            const oy = base - lod0Cfg.floorDrop;
            this._stampArchitectureSolidCellsInto(waterCells, ox, oy, oz, 0);
        }
        // die Karte liest die FERTIGE Farbe (nach dem Stein unter Fels), wie der synchrone Bau — vorher die rohe des
        // Workers: am Spawn-Chunk 27 Grün-Zellen anders als der Sync-Bau (playtest Perf-3.c Boden-Karte)
        const karte = this._bodenKarteAusMesh(
            meshData.positions,
            meshData.indices,
            geom.attributes.color.array,
            cx,
            cz,
            lod
        );
        return {
            mesh,
            kind: "filled",
            waterCells,
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
        return Math.hypot(ccx - pm.position.x, ccz - pm.position.z) <= fr;
    }

    // V18.275 — die Vegetation WÄCHST nach: Chunks, die jenseits des `foliageRadius` gebaut
    // wurden, füllen ihre Vegetation, sobald der (kapazitäts-gewachsene) Radius sie erreicht.
    // Budgetiert (sanftes Pop-In statt Freeze). Aufruf am Ende von `_tickVoxelChunkStreaming`.
    // EXISTENZ VOR FRAMERATE (Lehre 13, Prüfer K22-3): über dem Budget drosselt der Frame das TEMPO des Wachstums, nie
    // seine Existenz — je WUCHS_DROSSEL_MS (Wanduhr) wächst EIN Chunk, der nächste zum Spieler. Bis hierher kehrte das
    // Wachstum über dem Budget still um: auf der Radeon (Werkbank, Dorf) war das Budget in 60 von 60 und 160 von 160
    // Takten überschritten, die offenen Chunks im 64-m-Kreis blieben kahl (4 → 4), und ob Wald oder kahler Hügel im Bild
    // stand, entschied allein der frei laufende Boot.
    _tickFoliageGrowth() {
        const pending = this.state.pendingFoliageChunks;
        if (!pending || pending.size === 0) return;
        if (this.state._frameOverBudget) {
            const jetzt = typeof performance !== "undefined" ? performance.now() : Date.now();
            if (this._wuchsNaechster !== undefined && jetzt < this._wuchsNaechster) return;
            const pm = this.state.playerMesh;
            const { span } = this._voxelChunkConfig();
            let naechster = null;
            let naechsterD = Infinity;
            for (const key of pending) {
                const ci = key.indexOf(",");
                const cx = parseInt(key.slice(0, ci), 10),
                    cz = parseInt(key.slice(ci + 1), 10);
                if (!this._foliageChunkInRadius(cx, cz)) continue; // noch zu fern → warten
                const d = pm
                    ? Math.hypot(cx * span + span / 2 - pm.position.x, cz * span + span / 2 - pm.position.z)
                    : 0;
                if (d < naechsterD) {
                    naechsterD = d;
                    naechster = { key, cx, cz };
                }
            }
            if (!naechster) return;
            this._wuchsNaechster = jetzt + AnazhRealm.WUCHS_DROSSEL_MS; // Instanz-Feld (nie im Spielstand)
            pending.delete(naechster.key);
            if (this.state.voxelChunks && this.state.voxelChunks.has(naechster.key))
                this._populateVoxelChunkVegetation(naechster.cx, naechster.cz);
            return;
        }
        let budget = 2;
        for (const key of pending) {
            if (budget <= 0) break;
            const ci = key.indexOf(",");
            const cx = parseInt(key.slice(0, ci), 10),
                cz = parseInt(key.slice(ci + 1), 10);
            if (!this._foliageChunkInRadius(cx, cz)) continue; // noch zu fern → warten
            pending.delete(key);
            if (this.state.voxelChunks && this.state.voxelChunks.has(key)) {
                this._populateVoxelChunkVegetation(cx, cz);
                budget--;
            }
        }
    }

    // Worker-Update bei voxelEdit: nur der Delta-Edit (Atlas unverändert). Die Karte trägt ihn nach — die
    // Generation seiner Chunks steigt (`_voxelStand`), ihre Antworten im Flug fallen beim Eintreffen; aus den Caches
    // fallen nur die Chunks, deren Stand er ändert (sein Karten-Fußabdruck samt 3×3), je LOD. Der Rest der Welt streamt
    // weiter (bis K23 leerte jeder Edit beide Caches der ganzen Welt und verwarf jede Antwort im Flug).
    _voxelWorkerNotifyEdit(ed) {
        if (!this.state.voxelWorker) return;
        const k = this._voxelEditKarte();
        const span = k.span;
        const r = Number.isFinite(ed.r) ? Math.max(ed.r, 1) : 1;
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
        try {
            this._voxelZustandPost({
                type: "state-update",
                delta: {
                    voxelEditAppend: { x: ed.x, y: ed.y, z: ed.z, r: ed.r, strength: ed.strength, mode: ed.mode },
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
        // Hier wird der Voxel-Worker gebootstrappt (NACH dem Hydrosphäre-Build, init-sync mit fertigem
        // Snapshot) — sonst spawnt ihn nichts und jeder Chunk baut sync (~71 ms Main-Block pro Chunk).
        // Ab voxelWorkerReady baut der Streaming-Pfad async; nur der Spieler-Chunk baut sync (Kollision).
        const worker = this._getVoxelWorker();
        if (!worker) return; // Browser ohne Worker-Support → voller Sync-Fallback (Stufe 3)
        if (this.state.voxelDensityCache) this.state.voxelDensityCache.clear();
        if (this.state.voxelMeshCache) this.state.voxelMeshCache.clear();
        // stateGen bumpt in _voxelWorkerSyncState (send-time). worldgenSynced bleibt ab jetzt true — der
        // Streaming-Pump traut dem Worker; Edits filtern je Chunk (`_voxelStand`).
        this._voxelWorkerSyncState({ op: "state-set" });
        this.state.voxelWorkerWorldgenSynced = true;
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
        this._worldgenComputeAndBuildHydrosphere();

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
            // gecacht; nur der billige voxelEdit-Delta wird neu aufgelegt.
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
        const karte = this._bodenKarteAusMesh(
            geom.attributes.position.array,
            geom.index ? geom.index.array : null,
            geom.attributes.color ? geom.attributes.color.array : null,
            cx,
            cz,
            lod
        );
        return { mesh, kind: "filled", waterCells, lod, surfMap: karte && karte.hoehe, gruenMap: karte && karte.gruen };
    }

    // DIE geteilte Build-Kaskade für Streaming UND Edit-Rebuild: 1 Worker-Mesh-Cache (Main nur
    // BufferGeometry + Architektur-Stempel + BVH) · 2 Worker-Density-Cache · 3 Sync-CPU (base-gecacht).
    // Rückgabe: "pending" · null (Fail/degeneriert) · {mesh, kind, waterCells, lod, hasBVH?}.
    // `forceSync` (Spieler-Chunk + Test-Naht) springt direkt zu Stufe 3 (kein Worker-Roundtrip).
    _acquireVoxelChunkBuild(cx, cz, lod, opts = {}) {
        // Harte Kachel-Garantie am EINEN Build-Eingang: vor jedem Chunk-Bau steht die Hydro/Erosions-
        // Kachel seines Footprints (+64 m Pad für Reads über die Grenze). Eine NEUE Kachel re-synct den
        // Worker VOR dem Request (Nachrichten-Ordnung) → Main und Worker bauen aus derselben Kachel.
        {
            const { span } = this._voxelChunkConfig(0);
            const half = span / 2;
            this._ensureHydroTilesAround(cx * span + half, cz * span + half, half + 64);
        }
        if (opts.forceSync === true) {
            // V18.263 — der Player-Chunk-Sync-Build ist der Freeze-Verdächtige
            // (~239 ms, blockiert den Main-Thread). Der Perf-Sense misst ihn IMMER
            // (µs-Tap), damit der Nexus die Streaming-Last kennt, nicht rät.
            const _t0 = performance.now();
            const _r = this._buildVoxelChunkData(cx, cz, lod);
            this._perfMark("syncBuild", performance.now() - _t0);
            return _r;
        }
        // Stufe 1: Worker-Mesh.
        let workerMesh;
        if (this.state.voxelWorker && this.state.voxelWorkerReady && this.state.voxelWorkerWorldgenSynced) {
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
        if (
            !preDensity &&
            this.state.voxelWorker &&
            this.state.voxelWorkerReady &&
            this.state.voxelWorkerWorldgenSynced
        ) {
            const workerDensity = this._fetchOrRequestChunkDensity(cx, cz, lod);
            if (workerDensity === null) return "pending";
            preDensity = workerDensity;
        }
        // Stufe 3: Sync-CPU-Build (letzter Fallback, base-gecacht V12.0-perf.b).
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
            // Die Boden-Karte (der GERENDERTE Boden, `_bodenKarteAusMesh`, beide Pfade): Stand, Gras und Streu
            // lesen sie über den EINEN Leser `_bodenSichtAt` (am Chunk-Rand die Karte des Nachbarn).
            surfMap: fresh.surfMap || null,
            gruenMap: fresh.gruenMap || null,
            lod,
            hasBVH: typeof fresh.hasBVH === "boolean" ? fresh.hasBVH : true,
        };
        this.state.voxelChunks.set(key, entry);
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
        if (this._foliageChunkInRadius(cx, cz)) {
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
        for (let dx = -1; dx <= 1; dx++)
            for (let dz = -1; dz <= 1; dz++) {
                if (dx !== 0 || dz !== 0) {
                    const nb = this.state.voxelChunks.get(`${cx + dx},${cz + dz}`);
                    if (!nb || nb.empty || !nb.mesh) continue;
                    const nl = Number.isFinite(nb.lod) ? nb.lod : 0;
                    if (!(lod > nl || (altLod !== null && altLod > nl))) continue;
                }
                this._applyCrossLodGeomorph(cx + dx, cz + dz);
            }
        return entry;
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
        // Fast-Path: keine Cross-LOD-Grenze UND kein alter Morph/Band → nichts zu tun (Normalfall)
        if (coarseFaces.length === 0 && !entry.hasMorph && !entry.lodStitchMesh) return;
        const n = pos.count;
        const tArr = tgtAttr.array;
        const wArr = wAttr.array;
        // der Fingerabdruck des alten Morphs (die Karte zieht nur nach, wenn er sich ändert)
        const abdruck = () => {
            let s = 0;
            for (let v = 0; v < n; v++) {
                const w = this._morphNaht(wArr[v]);
                if (w > 0) s += w * (tArr[v * 3] * 1.31 + tArr[v * 3 + 1] * 1.73 + tArr[v * 3 + 2] * 1.13 + v);
            }
            return s;
        };
        const abdruckAlt = abdruck();
        // Basis = das Ziel der Stufe (K51-2, `stufeZiel`; die gröbste Stufe: die Position), Naht 0
        const basis = geom.userData.stufeZiel || pos.array;
        const code0 = this._morphCode(myLod, 0);
        for (let v = 0; v < n * 3; v++) tArr[v] = basis[v];
        wArr.fill(code0);
        // das Naht-Ziel je Vertex (der gröbere Nachbar) — das Naht-Band brückt dorthin, auch wo der Cap den Morph stoppt
        const nahtZiel = coarseFaces.length ? new Float32Array(n * 3) : null;
        let touched = false;
        const bestDist = coarseFaces.length ? new Float32Array(n).fill(Infinity) : null;
        // A1/N1 (gigant-plan §5 · Naht §12.2) — die Grenz-Zeilen-Vertices für das
        // Stitch-Band sammeln (Index → hat ein echtes Morph-Target in tArr).
        const bandVerts = new Set();
        const cp = [0, 0, 0]; // Scratch für den nächsten Punkt auf einem Dreieck
        for (const face of coarseFaces) {
            const nbGeom = face.nbGeom;
            const nbPos = nbGeom.attributes.position;
            const nbIdx = nbGeom.index ? nbGeom.index.array : null;
            if (!nbPos || !nbIdx) continue;
            const coarseStep = this._voxelChunkConfig(face.nbLod).step;
            const ni = cx + face.dx,
                nj = cz + face.dz;
            // Grobe Boundary-DREIECKE (≥1 Vertex nahe diesem Chunk) als flaches Array: gemorpht wird Punkt→Dreieck
            // auf die grobe OBERFLÄCHE, nie auf den nächsten groben VERTEX (sparse; 3D-nearest greift die
            // falsche Höhlen-Branche und lässt ~11 m Spalt).
            const tris = [];
            const bnd = coarseStep * 1.5;
            for (let t = 0; t < nbIdx.length; t += 3) {
                const i0 = nbIdx[t],
                    i1 = nbIdx[t + 1],
                    i2 = nbIdx[t + 2];
                if (
                    quadratAbstand(nbPos.getX(i0), nbPos.getZ(i0), cx, cz) > bnd &&
                    quadratAbstand(nbPos.getX(i1), nbPos.getZ(i1), cx, cz) > bnd &&
                    quadratAbstand(nbPos.getX(i2), nbPos.getZ(i2), cx, cz) > bnd
                )
                    continue;
                tris.push(
                    nbPos.getX(i0),
                    nbPos.getY(i0),
                    nbPos.getZ(i0),
                    nbPos.getX(i1),
                    nbPos.getY(i1),
                    nbPos.getZ(i1),
                    nbPos.getX(i2),
                    nbPos.getY(i2),
                    nbPos.getZ(i2)
                );
            }
            if (tris.length === 0) continue;
            // Grenz-ZEILE (dPlane < flat) morpht voll (w=1), danach Falloff bis morphBand (kein interner
            // Sprung). flat = 0.7·fineStep deckt die Surface-Nets-Offset-Streuung (~fineStep/2) ab.
            const flat = fineStep * 0.7;
            const morphBand = fineStep * 2.0;
            // Morph-Cap: an Cliffs divergieren feine + grobe Fläche vertikal (bis ~28 m); dorthin ziehen zerrt
            // die Wand. Jenseits des Caps bleibt w=0 und das Stitch-Band überbrückt den Spalt.
            const snapCap = coarseStep * 2.5;
            for (let v = 0; v < n; v++) {
                const px = pos.getX(v),
                    py = pos.getY(v),
                    pz = pos.getZ(v);
                const dPlane = quadratAbstand(px, pz, ni, nj);
                if (dPlane > morphBand) continue;
                let bd = Infinity,
                    bx = px,
                    by = py,
                    bz = pz;
                for (let t = 0; t < tris.length; t += 9) {
                    this._closestPtTri(px, py, pz, tris, t, cp);
                    const ddx = px - cp[0],
                        ddy = py - cp[1],
                        ddz = pz - cp[2];
                    const d2 = ddx * ddx + ddy * ddy + ddz * ddz;
                    if (d2 < bd) {
                        bd = d2;
                        bx = cp[0];
                        by = cp[1];
                        bz = cp[2];
                    }
                }
                const d3 = Math.sqrt(bd);
                // A1 — die Band-Sammlung VOR dem bestDist-Skip (idempotentes Set):
                // ein KORNER-Vertex zwischen zwei groben Faces gehört in die Border-Row,
                // auch wenn das nähere Target von der ANDEREN Face kam. Das Band hängt an den ACHSEN-Kanten — der
                // Eck-Nachbar trägt nur den Morph (sein Band liegt an der Kante der beiden Achsen-Nachbarn).
                if (dPlane <= flat && (face.dx === 0 || face.dz === 0)) bandVerts.add(v);
                if (d3 >= bestDist[v]) continue; // ein näheres Face gewann diesen Vertex schon
                bestDist[v] = d3;
                tArr[v * 3] = nahtZiel[v * 3] = bx;
                tArr[v * 3 + 1] = nahtZiel[v * 3 + 1] = by;
                tArr[v * 3 + 2] = nahtZiel[v * 3 + 2] = bz;
                // Gewicht: 1 in der Grenz-Zeile (dPlane ≤ flat) → linear auf 0 bei morphBand.
                // A1 — jenseits des Caps KEIN Naht-Morph (Naht 0): das Ziel bleibt das der Stufe (das Naht-Ziel trägt das Band),
                // sonst zöge das Stufen-Gewicht die Cliff-Wand an den Nachbarn.
                const naht = d3 > snapCap ? 0 : Math.max(0, Math.min(1, (morphBand - dPlane) / (morphBand - flat)));
                wArr[v] = this._morphCode(myLod, naht);
                if (naht === 0) for (let k = 0; k < 3; k++) tArr[v * 3 + k] = basis[v * 3 + k];
                touched = true;
            }
        }
        entry.hasMorph = touched;
        // die gekappten Naht-Vertices (Cliff: das Naht-Ziel weiter als der Cap, der Vertex trägt das Ziel seiner Stufe) — das
        // Naht-Band brückt sie (Leser: die Naht-Probe des Playtests)
        let gekappt = 0;
        if (bestDist)
            for (let v = 0; v < n; v++) if (bestDist[v] < Infinity && this._morphNaht(wArr[v]) === 0) gekappt++;
        entry.nahtGekappt = gekappt;
        entry.surfMapZiel = null; // die Karte der Ziele zieht nach (`_bodenKarteZiel`)
        this._chunkSatzMarke("boden", `${cx},${cz}`, ["aMorphTarget", "aMorphWeight"]);
        // DER BODEN-LESER LIEST, WAS GEZEICHNET WIRD (K51, Lehre 22): an einer Stufen-Naht zeichnet der Stoff die Grenz-Zeile
        // auf der groben Fläche — die Karte des Chunks (Stand, Nah-Wiese, Nah-Streu) kommt aus derselben gemorphten Lage. Mit der
        // Nah-Zone 3×3 liegt die Naht 43–65 m vor dem Auge, wo Tiere stehen (gate:koerper-stand K6: 346 von 772 Punkten mehr
        // als 25 cm neben dem gezeichneten Boden, die Karte las die rohe Lage).
        if (abdruck() !== abdruckAlt) {
            const U = this.state.atmoUniforms;
            const A = this.state.atmosphere;
            const gm = U && U.geomorph ? U.geomorph.value : A && Number.isFinite(A.geomorph) ? A.geomorph : 1;
            const P = pos.array;
            const lage = new Float32Array(P.length);
            for (let v = 0; v < n; v++) {
                const f = this._morphNaht(wArr[v]) * gm;
                lage[v * 3] = P[v * 3] + (tArr[v * 3] - P[v * 3]) * f;
                lage[v * 3 + 1] = P[v * 3 + 1] + (tArr[v * 3 + 1] - P[v * 3 + 1]) * f;
                lage[v * 3 + 2] = P[v * 3 + 2] + (tArr[v * 3 + 2] - P[v * 3 + 2]) * f;
            }
            const karte = this._bodenKarteAusMesh(
                lage,
                geom.index ? geom.index.array : null,
                geom.attributes.color ? geom.attributes.color.array : null,
                cx,
                cz,
                myLod
            );
            entry.surfMap = karte && karte.hoehe;
            entry.gruenMap = karte && karte.gruen;
        }
        this._rebuildLodStitchBand(entry, bandVerts, `${cx},${cz}`, nahtZiel);
    }

    // STITCH-BAND (Arme-Leute-Transvoxel): wo der Morph-Cap greift (Cliffs), bliebe ein Spalt. Pro
    // Mesh-KANTE der Grenz-Zeile (beide Endpunkte in der Border-Row — echte Topologie inkl. Höhlen-
    // Loops, kein Polyline-Sortieren) der Skirt und, wo ein Ende gekappt ist (Gewicht < 1), ein Quad von der
    // feinen Kante (position) zur groben Fläche (das Naht-Ziel). Render-only, keine BVH, main-only. Trägt ALLE Material-Attribute des Terrain-
    // Toons (WebGPU-strikt): color vom Quell-Vertex, die feine Kante Morph-Ziel und -Code ihres Quell-Vertex, sonst fest.
    // Dasselbe Material wie der Boden → ein Bereich `stitch:<chunk>` IM Boden-Satz (derselbe Befehl); der
    // Band-Mesh bleibt CPU-Körper (Naht-Sonden lesen seine Geometrie).
    _rebuildLodStitchBand(entry, bandVerts, key, nahtZiel) {
        // Der Band-Bereich gehört dem Chunk-Key (nicht dem Eintrag): auch ein Neubau räumt ein altes Band.
        this._chunkSatzAus("boden", "stitch:" + key);
        if (entry.lodStitchMesh) {
            this._queueGeometryDispose(entry.lodStitchMesh.geometry);
            entry.lodStitchMesh = null;
        }
        if (!bandVerts || bandVerts.size === 0 || !entry.mesh || !entry.mesh.geometry) return;
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
        const P = [],
            N = [],
            C = [],
            HS = [],
            SC = [],
            MT = [],
            MW = [],
            I = [];
        // die feine Kante der Brücke folgt der gezeichneten Kante (K51-2): ihre Ecken tragen Morph-Ziel und -Code des Quell-
        // Vertex (der Stoff zeichnet sie, wo er die Kante zeichnet — im Übergangs-Band wandert sie mit), die grobe Seite und der
        // Skirt stehen fest (Code 0, Ziel = Lage)
        const tA = tgt.array,
            wA = wgt.array;
        const fest = (x, y, z) => {
            MT.push(x, y, z);
            MW.push(0);
        };
        // die Ecken der feinen Kante und ihre Quell-Vertices: Normale und Stoff-Farbe wandern mit wie die Lage
        const quelle = [];
        const nZiel = geom.attributes.aNormalZiel,
            fZiel = geom.attributes.aFarbeZiel;
        if (!nZiel || !fZiel)
            throw new Error(
                `_rebuildLodStitchBand(${key}): die Quelle trägt kein Stufen-Ziel (aNormalZiel · aFarbeZiel)`
            );
        const sch = geom.attributes.aSchutt;
        if (!sch) throw new Error(`_rebuildLodStitchBand(${key}): die Quelle trägt keinen Schutt (aSchutt)`);
        const seen = new Set();
        for (let t = 0; t < idx.length; t += 3) {
            const i0 = idx[t],
                i1 = idx[t + 1],
                i2 = idx[t + 2];
            for (let e = 0; e < 3; e++) {
                const a = e === 0 ? i0 : e === 1 ? i1 : i2;
                const b = e === 0 ? i1 : e === 1 ? i2 : i0;
                if (!bandVerts.has(a) || !bandVerts.has(b)) continue;
                const k = a < b ? a * 200000 + b : b * 200000 + a;
                if (seen.has(k)) continue;
                seen.add(k);
                const ax = pos.getX(a),
                    ay = pos.getY(a),
                    az = pos.getZ(a);
                const bx = pos.getX(b),
                    by = pos.getY(b),
                    bz = pos.getZ(b);
                const tax = nahtZiel[a * 3],
                    tay = nahtZiel[a * 3 + 1],
                    taz = nahtZiel[a * 3 + 2];
                const tbx = nahtZiel[b * 3],
                    tby = nahtZiel[b * 3 + 1],
                    tbz = nahtZiel[b * 3 + 2];
                const spanA = Math.hypot(tax - ax, tay - ay, taz - az);
                const spanB = Math.hypot(tbx - bx, tby - by, tbz - bz);
                if (Math.max(spanA, spanB) < MIN_SPAN) continue;
                // DIE BRÜCKE (rohe Kante → grobe Fläche) nur, wo der Morph die Naht NICHT schliesst (K51): trägt er beide
                // Enden ganz (Gewicht 1), zeichnet die feine Kante schon auf der groben Fläche — die Brücke wäre eine Finne
                // zur unsichtbaren rohen Lage (14.10., Mess-Wiese: zwei von drei Naht-Dreiecken, in jedem Pass gezeichnet).
                if (!(this._morphNaht(wgt.getX(a)) >= 1 && this._morphNaht(wgt.getX(b)) >= 1)) {
                    const base = P.length / 3;
                    P.push(ax, ay, az, bx, by, bz, tbx, tby, tbz, tax, tay, taz);
                    MT.push(tA[a * 3], tA[a * 3 + 1], tA[a * 3 + 2], tA[b * 3], tA[b * 3 + 1], tA[b * 3 + 2]);
                    MW.push(wA[a], wA[b]);
                    quelle.push(base, a, base + 1, b);
                    fest(tbx, tby, tbz);
                    fest(tax, tay, taz);
                    for (const v of [a, b, b, a]) {
                        N.push(nrm ? nrm.getX(v) : 0, nrm ? nrm.getY(v) : 1, nrm ? nrm.getZ(v) : 0);
                        C.push(col ? col.getX(v) : 0.5, col ? col.getY(v) : 0.5, col ? col.getZ(v) : 0.5);
                        HS.push(him.getX(v));
                        SC.push(sch.getX(v));
                    }
                    I.push(base, base + 1, base + 2, base, base + 2, base + 3);
                }
                // Skirt-Quad (ta, tb, tb↓, ta↓) nach −SKIRT: Farbe vom groben Ziel-Vertex (Fels-Ton läuft weiter),
                // Normale ~horizontal-auswärts; DoubleSide → kein Backface-Loch.
                const sBase = P.length / 3;
                P.push(tax, tay, taz, tbx, tby, tbz, tbx, tby - SKIRT, tbz, tax, tay - SKIRT, taz);
                for (let q = P.length - 12; q < P.length; q += 3) fest(P[q], P[q + 1], P[q + 2]);
                for (let s = 0; s < 4; s++) {
                    N.push(0, 0.2, 0); // grob nach oben/aussen — der Vorhang ist meist verdeckt
                    const cv = s === 1 || s === 2 ? b : a;
                    C.push(col ? col.getX(cv) : 0.5, col ? col.getY(cv) : 0.5, col ? col.getZ(cv) : 0.5);
                    HS.push(him.getX(cv));
                    SC.push(sch.getX(cv));
                }
                I.push(sBase, sBase + 1, sBase + 2, sBase, sBase + 2, sBase + 3);
            }
        }
        if (I.length === 0) return;
        const bg = new THREE.BufferGeometry();
        bg.setAttribute("position", new THREE.Float32BufferAttribute(P, 3));
        bg.setAttribute("normal", new THREE.Float32BufferAttribute(N, 3));
        bg.setAttribute("color", new THREE.Float32BufferAttribute(C, 3));
        bg.setAttribute("aMorphTarget", new THREE.Float32BufferAttribute(MT, 3));
        bg.setAttribute("aMorphWeight", new THREE.Float32BufferAttribute(MW, 1));
        const NZ = new Float32Array(N),
            FZ = new Float32Array(C);
        for (let q = 0; q < quelle.length; q += 2)
            for (let k = 0; k < 3; k++) {
                NZ[quelle[q] * 3 + k] = nZiel.array[quelle[q + 1] * 3 + k];
                FZ[quelle[q] * 3 + k] = fZiel.array[quelle[q + 1] * 3 + k];
            }
        bg.setAttribute("aNormalZiel", new THREE.Float32BufferAttribute(NZ, 3));
        bg.setAttribute("aFarbeZiel", new THREE.Float32BufferAttribute(FZ, 3));
        // die Naht trägt die Himmels-Sicht ihrer beiden Ränder (je Vertex aus der Quelle kopiert, `HS`)
        bg.setAttribute("aHimmel", new THREE.Float32BufferAttribute(HS, 1));
        bg.setAttribute("aSchutt", new THREE.Float32BufferAttribute(SC, 1));
        bg.setIndex(I);
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
        // (`opts.forceSync`: `_syncRebuildEditFootprint`, der Wasser-Fußabdruck eines Baus, `_drainDirtyVoxelChunks`).
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
        const forceSync = opts.forceSync === true;
        // Welle G-fix — das Gras nur disposen, wenn die Oberfläche sich änderte
        // (Carve/Fill markierte den Chunk grass-dirty). Sonst behalten (kein
        // Flackern bei Nexus-Spawn/Skirt/LOD-Rebuild).
        const keepGrass = !(this.state.grassDirtyChunks && this.state.grassDirtyChunks.has(key));
        if (forceSync) {
            // V9.40-d — dispose-before-build (kein Loch, Sync-Build same-frame).
            if (oldEntry) this._disposeVoxelChunk(key, keepGrass, stufe);
            const fresh = this._acquireVoxelChunkBuild(cx, cz, useLod, { forceSync: true });
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
        // Kollision, bit-identisch zu `_terrainDensityAt` (base+Σdelta == baseCol+Σdelta). Die Makro-Höhe der Garantie
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

    // Die kanonische Feld-Dichte für die Kollision: base (optional gehoistet) + Edit-Delta.
    // > 0 solide, ≤ 0 Luft/Wasser. Liest die Edits → ein gecarvter Tunnel ist SOFORT
    // begehbar (kein BVH-Rebuild, der heute teure Edit-Pfad).
    _fieldDensityAt(x, y, z, ctx) {
        const base = ctx ? this._terrainBaseDensityAtCol(x, y, z, ctx) : this._terrainBaseDensityAt(x, y, z);
        return base + this._voxelEditDeltaAt(x, y, z);
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
                    if (!e.blockerAABBs || !e.position) continue;
                    // V18.464: + _blockerReach (Rand-Parts großer Bauwerke, s. _stepCharacterStructures)
                    const rcCull = 80 + (e._blockerReach || 0);
                    if (Math.abs(e.position.x - sx) > rcCull || Math.abs(e.position.z - sz) > rcCull) continue;
                    const boxes = e.blockerAABBs;
                    const seq = e._blockerSeq;
                    for (let bi = 0; bi < boxes.length; bi++) {
                        const bx = boxes[bi];
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
                        const hitInfo =
                            rad > 0
                                ? this._segmentKugelBox(sx, sy, sz, dx, dy, dz, bx, rad)
                                : this._segmentAABB(sx, sy, sz, dx, dy, dz, bx);
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

    // DIE BOX FÜR DIE KUGEL (K06, `_fieldRaycast` mit `radius`): der Schnitt der Strecke mit der Box, um r aufgeblasen — die
    // Mitte der Kugel betritt sie, wo die Kugel die Box berührt (an Kanten und Ecken hält sie etwas früher als die runde
    // Hülle). Beginnt die Strecke schon in der aufgeblasenen Box (die Kugel streift sie am Start), hält die Mitte r vor der Box
    // selbst, entlang der Strecke — der Weg von ihr fort ist frei, an ihr entlang endet er nie auf ihrer Fläche.
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
        if (!h || h.t > 0) return h;
        const g = this._segmentAABB(sx, sy, sz, dx, dy, dz, b);
        if (g) g.t = Math.max(0, g.t - r / Math.sqrt(dx * dx + dy * dy + dz * dz));
        return g;
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
            nx: axis === 0 ? sign : 0,
            ny: axis === 1 ? sign : 0,
            nz: axis === 2 ? sign : 0,
        };
    }

    // Höchste Oberkante aller FILL-Edits (y + r): darüber hebt der `_voxelSurfaceY`-Envelope-Skip seine
    // Grenze. Cache per Identität+Länge des Edit-Arrays (push via `_addVoxelEdit`; Welt-Wechsel/Regen
    // tauscht oder leert es). Keine Fill-Edits → −Infinity.
    _voxelEditsFillTop() {
        const meta = this.state.worldMeta;
        const edits = meta && Array.isArray(meta.voxelEdits) ? meta.voxelEdits : null;
        const len = edits ? edits.length : 0;
        const cache = this._editFillTopCache;
        if (cache && cache.edits === edits && cache.len === len) return cache.top;
        let topY = -Infinity;
        for (let i = 0; i < len; i++) {
            const e = edits[i];
            if (e && e.mode === "fill") {
                const t = (Number(e.y) || 0) + (Number(e.r) || 0);
                if (t > topY) topY = t;
            }
        }
        this._editFillTopCache = { edits, len, top: topY };
        return topY;
    }

    _tickVoxelChunkStreaming(playerPos) {
        if (!this.state.voxelTerrainActive || !playerPos) return;
        if (!this.state.voxelChunks) this.state.voxelChunks = new Map();
        const { span, ringRadius } = this._voxelChunkConfig();
        const pcx = Math.floor(playerPos.x / span);
        // V9.92 (Phase 4 — Lazy-BVH): aktuelle Spieler-Chunk-Position
        // zwischenspeichern, damit `_ensureVoxelChunkAt` Lazy-BVH-Decision
        // treffen kann (r ≤ 1 = sofort BVH, r ≥ 2 = lazy).
        this._setLastPlayerVoxelChunk(pcx, Math.floor(playerPos.z / span));
        const pcz = Math.floor(playerPos.z / span);
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
        // Im Lade-Takt (`_ladeTakt`) trägt der Strom das Budget des Lade-Frames, ohne Stück-Deckel: der Boden des ersten
        // Weltbilds (RING_EXIST_FLOOR) wuchs sonst mit einem Chunk je Lade-Frame.
        const lade = this._ladeTakt();
        const FRAME_BUDGET_MS = lade
            ? AnazhRealm.LADE_TAKT_MS
            : Number.isFinite(this.state._voxelStreamBudgetMs)
              ? this.state._voxelStreamBudgetMs
              : 4;
        const MAX_PER_FRAME = lade
            ? Infinity
            : Number.isFinite(this.state._voxelStreamMaxPerFrame)
              ? this.state._voxelStreamMaxPerFrame
              : 6;
        // DIE STAND-WACHE: steht der Ring (jede Zelle in ihrer Stufe, keiner wartet) und regt sich nichts, geht der Gang
        // nicht — Ring, Prune und Wasser-Weckruf lesen die Stufen-Zelle (`_stufenZelle`: die Spieler-Zelle und das Fach der
        // Lage zwischen den Stufen-Schwellen in Metern, K51-3) und die Chunk-Menge. Nachwuchs läuft weiter.
        if (this._standRuht("strom", 1, this._stufenZelle(playerPos.x, playerPos.z), "boden")) {
            this._tickFoliageGrowth();
            return 0;
        }
        const tStart = performance.now();
        outer: for (let r = 0; r <= ringRadius; r++) {
            for (let dz = -r; dz <= r; dz++) {
                for (let dx = -r; dx <= r; dx++) {
                    if (Math.max(Math.abs(dx), Math.abs(dz)) !== r) continue;
                    const cx = pcx + dx;
                    const cz = pcz + dz;
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
                            this._rebuildVoxelChunk(cx, cz, desiredLod);
                            if (++built >= MAX_PER_FRAME) break outer;
                            if (performance.now() - tStart > FRAME_BUDGET_MS) break outer;
                        }
                        continue;
                    }
                    this._ensureVoxelChunkAt(cx, cz, desiredLod);
                    if (++built >= MAX_PER_FRAME) break outer;
                    // Soft-Budget nach jedem Build (inkl. des letzten `_ensureVoxelChunkAt`): mindestens ein Chunk je
                    // Frame auch über Budget — sonst friert das Streaming ein.
                    if (performance.now() - tStart > FRAME_BUDGET_MS) break outer;
                }
            }
        }
        this._pruneDistantVoxelChunks(playerPos);
        // Ein Bau-Ruf (fertig, wartend oder verworfen) hält den Ring wach; die Chunk-Menge regt die Welt selbst.
        this._standMeldet("strom", 1, false, built > 0);
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
    // `carveVoxelSphere` schnitzt eine Kugel Luft, `fillVoxelSphere` schüttet eine Kugel Fest — beide
    // über `_addVoxelEdit`. Der Edit landet in worldMeta.voxelEdits (persistiert), `_terrainDensityAt`
    // zieht ab/addiert (Loch/Tunnel/Hügel); die betroffenen Chunks werden neu gemesht.
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
        const newEdit = { x, y: yClamped, z, r: radius, strength: 48, mode: mode === "fill" ? "fill" : "carve" };
        // Kein Deckel (K23): jeder Edit bleibt, Main und Worker tragen dieselbe Liste; die Leser fragen je Chunk (die
        // Karte, `_voxelEditKarte`). Bis K23 verdrängte ein FIFO-Deckel (256) still den ersten — nur im Main.
        edits.push(newEdit);
        // Edit-Delta an den Worker: die Generation der berührten Chunks steigt, ihre Antworten im Flug und im Cache
        // fallen; der Pump fordert frisch nach. No-op ohne gespawnten Worker (vor Worldgen).
        this._voxelWorkerNotifyEdit(newEdit);
        // `_remeshVoxelChunksAround` ist der EINZIGE Reaktiv-Pfad: die Chunks bauen neu, das Cell-Feld
        // klassifiziert die neue Lage (Carve unter waterLevel → WATER, Fill → SOLID) — Cells sind DERIVED,
        // kein Hydro-Recompute. Nur die Footprint-Chunks werden grass-dirty (Oberfläche geändert); die
        // Skirt-Nachbarn behalten ihr Gras.
        if (!this.state.grassDirtyChunks) this.state.grassDirtyChunks = new Set();
        const { span } = this._voxelChunkConfig();
        const fcx0 = Math.floor((x - radius) / span);
        const fcx1 = Math.floor((x + radius) / span);
        const fcz0 = Math.floor((z - radius) / span);
        const fcz1 = Math.floor((z + radius) / span);
        for (let fcx = fcx0; fcx <= fcx1; fcx++) {
            for (let fcz = fcz0; fcz <= fcz1; fcz++) this.state.grassDirtyChunks.add(`${fcx},${fcz}`);
        }
        // W-B (V18.90) — die CA-Level der Edit-Region VOR dem Rebuild aus den PRE-Carve-
        // Zellen seeden → das Nachfließen ist deterministisch sichtbar (s. Methoden-Doku).
        this._preSeedWaterCAForEdit(x, z, radius);
        this._remeshVoxelChunksAround(x, z, radius);
        // Die direkt berührten FOOTPRINT-Chunks SYNCHRON im Edit-Frame heilen (nicht 1/Frame verteilt) —
        // sonst ~2 Frames sichtbare Abbau-Naht zwischen Nachbarn. Die Skirt-Nachbarn (nur das 1-Zell-Pad
        // sah die Kugel, sub-cell) bleiben ASYNC → kein Edit-Cluster-Spike.
        this._syncRebuildEditFootprint(x, z, radius);
        // NACH dem Rebuild: Kappen/Quell-Markierungen/Stau-Felder der Region verwerfen — der Spill-Scan
        // muss die FRISCHEN Zellen sehen (ein Fill kann Damm sein, ein Carve ihn öffnen). Der Pre-Seed
        // löschte sie schon davor; dieser zweite Wurf macht den Lazy-Neubau wahrheits-frisch.
        this._invalidateWaterCapsAround(x, z, radius);
        // Gebackene Region-Felder im Footprint dirty markieren (Region-Raster 256 m → 1–2 Regionen).
        // Lazy-Rebake im nächsten Tick; bis dahin gelten die stale Daten.
        this._invalidateBakedRegionsAround(x, z, radius);
        // Fill unter sich darf den Spieler nicht begraben (sonst steckt er Meter unter der neuen
        // Oberfläche im Fels) → Rettung. Nur fill schließt ein; carve öffnet.
        if (mode === "fill") this._rescuePlayerFromEditSolid(x, yClamped, z, radius);
        // T4a-2 — den Wasser-Automaten in der Carve-Region + 1-Ring WECKEN: die Zellen änderten sich
        // (neuer Raum geöffnet/verfüllt) → das Wasser strömt nach (active-cell, settled danach inaktiv).
        {
            const { span } = this._voxelChunkConfig();
            const minCX = Math.floor((x - radius) / span) - 1;
            const maxCX = Math.floor((x + radius) / span) + 1;
            const minCZ = Math.floor((z - radius) / span) - 1;
            const maxCZ = Math.floor((z + radius) / span) + 1;
            for (let cx = minCX; cx <= maxCX; cx++) for (let cz = minCZ; cz <= maxCZ; cz++) this._wakeWaterCA(cx, cz);
        }
        // Persistenz debounced (~1.2 s nach dem letzten Hit): `saveState()` baut den VOLLEN Snapshot +
        // JSON.stringify + synchrones localStorage.setItem — je Carve-Hit ein Ruckler. Der Edit liegt schon
        // in `worldMeta.voxelEdits`; World-Switch/Beforeunload/andere Saves flushen sofort.
        this._scheduleEditSave();
        return true;
    }

    // Pre-Carve-Seed: die CA-Level der Edit-Region VOR dem Rebuild aus den Pre-Carve-Zellen seeden. Der
    // Re-Flood füllt die Zellen instant (statische Wahrheit), das LIVE-Level hält die Ruhe von davor →
    // der CA füllt den neuen Raum sichtbar über Ticks (deterministisch, unabhängig von sync/async).
    // Muss VOR `_remeshVoxelChunksAround`/`_syncRebuildEditFootprint` laufen.
    _preSeedWaterCAForEdit(x, z, radius) {
        if (!this.state.voxelChunks) return;
        const { span } = this._voxelChunkConfig();
        const minCX = Math.floor((x - radius) / span) - 1;
        const maxCX = Math.floor((x + radius) / span) + 1;
        const minCZ = Math.floor((z - radius) / span) - 1;
        const maxCZ = Math.floor((z + radius) / span) + 1;
        for (let cx = minCX; cx <= maxCX; cx++) {
            for (let cz = minCZ; cz <= maxCZ; cz++) {
                // V18.93 — die Spiegel-Kappe der Edit-Region REFRESHEN (ein Carve senkt
                // den Boden → die Boden+Skin-Kappe jenseits des Atlas muss mitwandern).
                if (this.state.waterCapJ) this.state.waterCapJ.delete(`${cx},${cz}`);
                if (this.state.waterSourceCols) this.state.waterSourceCols.delete(`${cx},${cz}`);
                this._ensureWaterCALevel(cx, cz);
            }
        }
    }

    carveVoxelSphere(x, y, z, r) {
        return this._addVoxelEdit(x, y, z, r, "carve");
    }

    fillVoxelSphere(x, y, z, r) {
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

    // Markiert jeden Chunk, den die Schnitz-Kugel berührt (±`skirt` Chunks), als dirty;
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

    // Heilt die FOOTPRINT-Chunks (skirt=0, die die Kugel wirklich überdeckt) SYNCHRON im Edit-Frame —
    // derselbe Pfad wie `_drainDirtyVoxelChunks` (forceSync, dispose-before-build, Wasser-Iso sync).
    // Skirt-Nachbarn bleiben async (Oberfläche unverändert). Billig (~2 ms/Chunk über den Base-
    // Density-Cache) → 2–4 Chunks ≈ sub-Frame.
    _syncRebuildEditFootprint(x, z, r) {
        if (!this.state.voxelChunks || this.state.voxelChunks.size === 0) return;
        if (!this.state.dirtyVoxelChunks) return;
        // Über Budget den Footprint NICHT sync bauen: die Chunks bleiben dirty und heilen async (Kollision
        // ist feld-nativ sofort korrekt, der Mesh swappt 1–2 Frames später, kein Loch) — sonst ~126 ms
        // Stall je Carve auf schwacher HW. Test/Naht erzwingen sync über
        // `_rebuildVoxelChunk(... forceSync:true)`.
        if (this.state._frameOverBudget) return;
        const { span } = this._voxelChunkConfig();
        const minCX = Math.floor((x - r) / span);
        const maxCX = Math.floor((x + r) / span);
        const minCZ = Math.floor((z - r) / span);
        const maxCZ = Math.floor((z + r) / span);
        for (let cx = minCX; cx <= maxCX; cx++) {
            for (let cz = minCZ; cz <= maxCZ; cz++) {
                const key = `${cx},${cz}`;
                if (!this.state.voxelChunks.has(key)) continue;
                // aus dem Dirty-Set nehmen (wir bauen ihn JETZT) + sync rebuilden. Bei Fail
                // (OOM) re-markiert `_completeVoxelRebuild` ihn dirty → der async-Tick versucht's.
                this.state.dirtyVoxelChunks.delete(key);
                this._rebuildVoxelChunk(cx, cz, null, { forceSync: true });
            }
        }
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
        const worker = !!(st.voxelWorker && st.voxelWorkerReady && st.voxelWorkerWorldgenSynced);
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

    // Test-Naht: rebuildet ALLE dirty Chunks sofort mit `forceSync: true` (sonst liefe der Drain
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
            if (this._rebuildVoxelChunk(cx, cz, null, { forceSync: true })) built++;
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
        this.generateTerrainWithParameters(this.state.terrainSteepness, this.state.terrainBaseHeight);
        return true;
    }
}
_stammZonen(AnazhRealm, [AnazhRealm_gelaende_chunks]);

// ===== ATLAS · Gelaende/chunks — Außen-Konstanten =====
// Eintrags-Deckel des Chunk-Mesh-Stores "anazhChunkMesh" (grobes Überlauf-Ventil in `_chunkIdbPut`,
// kein LRU): LOD-0-Chunk ≈ 0.2–0.6 MB → ~600 Einträge halten den Store unter wenigen hundert MB.
AnazhRealm.CHUNK_IDB_MAX = 600;
// Die FORM des rohen Worker-Replys im Store (ein Teil des Stempels, `_chunkIdbInit`): ändert sich, was der Worker liefert,
// liest kein Boot die alte Form — seit Welle 7 trägt er den Höhlen-Graph (`hTri` · `hKnoten` · `hSeiten` · `hKanten`); seit
// Welle L liegt das Fluss-Bett auf dem Spiegel (`_hydrosphereCarveAt`): ein alter Chunk trüge den alten Kanal; und die
// Ufer-Farbe läuft mit der Kronen-Blende aus (`_waterLevelAt` → `ufer`): ein alter Chunk trüge das Rauten-Schachbrett; seit
// der Gegenprüfung läuft die Bank mit ihrer Neigung ins Gelände (Kanal und Damm): ein alter Chunk trüge die Gleit-Wand; seit
// Runde 3 trägt die Deck-Zelle das flache Wasser und das Ufer liest den Boden der Spalte: alte Zellen zeichneten den Bach nicht;
// und jede Quelle beginnt als Rinnsal: ein alter Chunk trüge den Kanal, der aus dem Nichts bricht; seit Runde 4 trägt der
// Damm eine Krone (`dammBreite`): ein alter Chunk trüge die Schneide, über die das Wasser ins tiefere Gelände lief; seit K17-2
// trägt die Antwort den Stoff (Himmels-Sicht, Schutt, die Feuchte des Mooses, der Fels in `colors`): ein alter Chunk trüge die
// Säulen-Farbe ohne Stoff; seit K17-2 NB1 wellt EIN Gradienten-Rauschen die Bänke und das Geröll streut wie die Referenz:
// ein alter Chunk trüge die Welle aus dem Wert-Rauschen.
AnazhRealm.CHUNK_IDB_FORM = "fels-rausch-atlas";
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
