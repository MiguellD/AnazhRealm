class AnazhRealm_Z07 {
    // ===== ATLAS §07 · CHUNK-STREAMING/PHYSIK — Voxel-Worker · Ring · feld-native Kollision =====
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
        worker.postMessage({ type: op, snapshot: this._voxelWorkerSnapshotState(), requestId });
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
    // BufferGeometry + Architektur-Cell-Stempel + BVH + Scene-Attach.
    _voxelWorkerComputeChunkMesh(cx, cz, lod) {
        const worker = this._getVoxelWorker();
        if (!worker) return Promise.reject(new Error("voxel-worker not available"));
        const ensureReady = this.state.voxelWorkerReady ? Promise.resolve(true) : this._voxelWorkerSyncState();
        return ensureReady.then(() => {
            const requestId = this.state.voxelWorkerNextRequestId++;
            const promise = new Promise((resolve, reject) => {
                this.state.voxelWorkerPending.set(requestId, { resolve, reject });
            });
            worker.postMessage({ type: "chunk-mesh", cx, cz, lod: lod | 0, requestId });
            return promise;
        });
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
        // T2-Morph-Attribute (Identität: Ziel=Position, Gewicht=0) auch hier — JEDE Terrain-Geometrie trägt
        // sie, sonst liest das Terrain-Material `aMorphTarget` auf attribut-losen Geometrien (Warn-Spam).
        geom.setAttribute("aMorphTarget", new THREE.Float32BufferAttribute(new Float32Array(meshData.positions), 3));
        geom.setAttribute(
            "aMorphWeight",
            new THREE.Float32BufferAttribute(new Float32Array(meshData.positions.length / 3), 1)
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
            this.state.voxelWorker.postMessage({
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

    // V12.0-a — WebGPURenderer-Konfiguration. Hot-Swap-WebGL-Fallback weg
    // (r164 hat webgl-legacy/WebGLNodeBuilder entfernt → NodeMaterials laufen
    // nur auf WebGPU). `kind`-Param gestrichen.
    _configureRenderer(renderer) {
        renderer.setSize(window.innerWidth, window.innerHeight);
        renderer.setPixelRatio(1);
        renderer.setClearColor(0x000000, 1);
        // JEDES-HOLZ: kienspan schaltet Schatten GANZ aus (der CSM-Erst-Frame-
        // Kompilierschock tötet Software-Dawn-Devices; ohne Schatten-Pipeline
        // überlebt der Boot — die NÄHE bleibt voll, nur das Licht wird flach).
        renderer.shadowMap.enabled = this.state._holzProfil !== "kienspan";
        // V9.84 Perf-1.a — PCFShadowMap statt PCFSoftShadowMap (4 statt 16
        // Samples — Performance-Win).
        renderer.shadowMap.type = THREE.PCFShadowMap;
        // Native Shadow-Pipeline (MeshToonNodeMaterial konsumiert die Shadow-Map). Der Takt der Schatten-Renders lebt
        // JE LICHT (`shadow.autoUpdate`/`needsUpdate`, `_loopShadowUpdate`) — `renderer.shadowMap.autoUpdate/
        // needsUpdate` liest r184 nicht.
        // autoReset AUS: `_loopRender` ruft `info.reset()` EINMAL pro Frame und liest am Ende die volle Last
        // (Schatten + Haupt + Post-FX) für perfSense — sonst sähe es nur den letzten Post-FX-Pass.
        if (renderer.info) renderer.info.autoReset = false;
        // DER STABILE PUFFER-NAME: r184 nennt den Instanz-Matrix-Puffer im WGSL `NodeBuffer_<Knoten-id>`
        // (WGSLNodeBuilder, ohne setName) — jede InstancedMesh bekam so ihren EIGENEN Quelltext, ihr eigenes
        // Programm, ihre eigene Pipeline: gemessen 02.10. an der Mess-Wiese 675 Vertex-Programme, ohne die
        // Ziffern 39 Familien — jede neue Streu-Gruppe ein Kompilat beim Laufen. Je Draw gibt es genau EINE
        // Instanz-Matrix (und die Vorgänger-Matrix für Velocity) → ein fester Name macht gleiche Objekte gleich.
        const IN = THREE.InstanceNode;
        if (!IN || !IN.prototype || typeof IN.prototype._createInstanceMatrixNode !== "function")
            this.log(
                "INSTANZ-PUFFER-NAME: r184-InstanceNode._createInstanceMatrixNode nicht gefunden (Vendor-Drift)",
                "ERROR"
            );
        else if (!IN.__anazhName) {
            const matrixRoh = IN.prototype._createInstanceMatrixNode;
            IN.prototype._createInstanceMatrixNode = function (assignBuffer, builder) {
                const n = matrixRoh.call(this, assignBuffer, builder);
                const puffer = n && n.node;
                if (puffer && puffer.isBufferNode && typeof puffer.setName === "function")
                    puffer.setName(assignBuffer ? "instanzMatrix" : "instanzMatrixVor");
                // DER URSPRUNG DER INSTANZ (`_instanzMitteNode`, das Maß der Blende): r184 legt den InstancedMeshNode je
                // Bau neu an (`setupPosition`, auch im Schattenpass) und baut die Matrix dort VOR jedem Fragment-Knoten
                if (assignBuffer && builder) builder.__anazhInstanzMatrix = n;
                return n;
            };
            IN.__anazhName = true;
        }
        // DIE SCHATTEN-DIÄT: r184 zeichnet jede Kaskade mit EINEM geteilten Schatten-Material je Licht
        // (isShadowPassMaterial), in das je Objekt die Knoten des Original-Materials gehängt werden. Sein Beobachter
        // meldet über context.getShadow immer hasNode → jedes Diät-Objekt refreshte je Kaskade und Frame
        // (gemessen 04.10. nach der Haupt-Diät: Blume 360, Geröll 224 von 1176 Refreshs je Frame). Trägt das
        // ORIGINAL die Diät (nur geteilte renderGroup-Uniforms), fährt der Schatten-Beobachter dieselbe EINE Prüfung.
        // Die Basisklasse exportiert window.THREE nicht — sie ist der Prototyp von MeshBasicNodeMaterial.
        const NM =
            THREE.MeshBasicNodeMaterial && Object.getPrototypeOf(THREE.MeshBasicNodeMaterial.prototype).constructor;
        if (!NM || !NM.prototype || typeof NM.prototype.setupObserver !== "function")
            this.log("SCHATTEN-DIÄT: r184-NodeMaterial.setupObserver nicht gefunden (Vendor-Drift)", "ERROR");
        else if (!NM.__anazhSchattenDiaet) {
            const beobRoh = NM.prototype.setupObserver;
            NM.prototype.setupObserver = function (builder) {
                const o = beobRoh.call(this, builder);
                if (!o || this.isShadowPassMaterial !== true || typeof o.needsRefresh !== "function") return o;
                const altNR = o.needsRefresh;
                o.needsRefresh = function (ro, frame) {
                    const om = ro && ro.object ? ro.object.material : null;
                    if (!om || om._anazhDiaet !== true) return altNR.call(this, ro, frame);
                    return AnazhRealm._diaetRefresh(this, ro, frame, altNR);
                };
                return o;
            };
            NM.__anazhSchattenDiaet = true;
        }
        // DIE SENKE ZEICHNET ÜBER IHREN ZEICHNER (1410-1, `_instanzZeichner`): r184 instanziert in `setupPosition` nur eine
        // InstancedMesh (InstanceNode, der die Puffer des Objekts in den Graphen bindet — und den Schlüssel trägt die uuid).
        // Zeichnet ein Zeichner, steht der EINE Instanz-Knoten (`_senkenKnoten`) dort, wo r184 seinen InstanceNode auf den Stapel
        // legt: sein setup legt die Matrix am Builder ab (die Naht `_weltNaht` des positionNode liest sie), seine Zuweisung von Lage,
        // Normale und Farbe baut NACH der des positionNode (Lehre 22) — im Hauptbild wie in jeder Kaskade (der Schatten-Stoff ist
        // ein Knoten-Stoff).
        if (NM && NM.prototype && typeof NM.prototype.setupPosition === "function" && !NM.__anazhSenke) {
            const posRoh = NM.prototype.setupPosition;
            NM.prototype.setupPosition = function (builder) {
                if (builder.object && builder.object.isInstanzZeichner === true)
                    AnazhRealm._senkenKnoten().instanz.toStack();
                return posRoh.call(this, builder);
            };
            NM.__anazhSenke = true;
        } else if (!NM || !NM.prototype || typeof NM.prototype.setupPosition !== "function")
            this.log("DIE SENKE: r184-NodeMaterial.setupPosition nicht gefunden (Vendor-Drift)", "ERROR");
        // DER EINE KNOTEN JE QUELLE (r184 gelesen, vendor/three.webgpu.min.js + vendor/CSMShadowNode.js): eine geteilte
        // Uniform-Gruppe (renderGroup: Kamera · Lichter · Welt-Sätze) teilt r184 über Programme hinweg nur bei GLEICHEN
        // Knoten — `_getBindGroup` schlüsselt sie nach den sortierten Knoten-ids, je Render-Kontext EIN Puffer. Zwei
        // Erzeuger bauten ihre Knoten je Programm neu: `reference(…)` legt seinen Uniform-Knoten je ReferenceNode an
        // (setNodeType), und der Schatten-Filter ruft es je Bau (ShadowNode: radius · mapSize je Kaskade); die CSM baut in
        // `setup` je Programm camera.near · cascades · shadowFar. Jedes beleuchtete Programm trug so seine EIGENE Render-
        // Gruppe, und jede Änderung von Kamera, TRAA-Zittern, Sonne oder Wind schrieb sie je Programm. Gemessen 07.10. an
        // der Mess-Wiese (echte GPU, Stand, ein Frame): 192 Programme, 153 geteilte Gruppen, 121 Gruppen-Uploads und 1 042
        // writeBuffer — dieselbe Kamera 80-mal hochgeladen. Ein Verweis einer geteilten Gruppe auf dasselbe Objekt und
        // dieselbe Eigenschaft trägt jetzt EINEN Uniform-Knoten, die CSM baut ihren Knoten einmal je Instanz (TSL baut einen
        // Knoten in jedem Programm für sich); Verweise ohne festes Objekt (je Zeichen-Objekt) bleiben je Knoten.
        // gate:vendor-anker pinnt beide Stellen und den Schlüssel, gate:kamera-treue zählt die Gruppen am echten Bild.
        const REF = THREE.TSL.reference;
        let refProto = Object.getPrototypeOf(REF("x", "float", { x: 0 }));
        while (refProto && !Object.prototype.hasOwnProperty.call(refProto, "setNodeType"))
            refProto = Object.getPrototypeOf(refProto);
        if (!refProto) this.log("EIN KNOTEN: r184-ReferenceNode.setNodeType nicht gefunden (Vendor-Drift)", "ERROR");
        else if (!refProto.__anazhEinKnoten) {
            const typRoh = refProto.setNodeType;
            const jeQuelle = new WeakMap();
            refProto.setNodeType = function (typ) {
                const g = this.group;
                const o = this.object;
                if (!g || g.shared !== true || o === null || typeof o !== "object") return typRoh.call(this, typ);
                let m = jeQuelle.get(o);
                if (!m) jeQuelle.set(o, (m = new Map()));
                const k = `${this.property}|${typ}|${this.count}|${g.name}|${this.name}`;
                const n = m.get(k);
                if (n) {
                    this.node = n;
                    return;
                }
                typRoh.call(this, typ);
                m.set(k, this.node);
            };
            refProto.__anazhEinKnoten = true;
        }
        const CSM = THREE.CSMShadowNode;
        if (typeof CSM !== "function" || typeof CSM.prototype.setup !== "function")
            this.log("EIN KNOTEN: CSMShadowNode.setup nicht gefunden (Vendor-Drift)", "ERROR");
        else if (!CSM.__anazhEinAufbau) {
            const aufbauRoh = CSM.prototype.setup;
            const aufbau = new WeakMap();
            CSM.prototype.setup = function (builder) {
                let n = aufbau.get(this);
                if (n === undefined) {
                    n = aufbauRoh.call(this, builder);
                    aufbau.set(this, n);
                }
                return n;
            };
            CSM.__anazhEinAufbau = true;
        }
        // Ab hier hängen die Eingriffe am Renderer-EXEMPLAR; der Null-Renderer (headless) zeichnet nie. Fehlt einem
        // echten Renderer eine der r184-Stellen, meldet sich der Eingriff laut (gate:vendor-anker pinnt jede).
        if (renderer._isHeadlessNull) return;
        // DIE DRAW-WAHRHEIT IM INFO: r184 bucht einen Draw nur, wenn der Backend-Draw läuft — beim AUFNEHMEN
        // eines RenderBundles; der Replay (`_renderBundle`, Versions-Treffer) zieht die aufgenommenen
        // RenderObjects ohne Buchung. Die Region-Bundles tragen den ganzen statischen Bestand: HUD, Regler und
        // Flugschreiber lasen an der Mess-Wiese 148 dc, wo die GPU 1 149 Befehle ausführte (02.10.). Der
        // Replay bucht jetzt jeden aufgenommenen RenderObject wie der Backend-Draw (info.update).
        if (!renderer.info || typeof renderer._renderBundle !== "function")
            this.log("DRAW-WAHRHEIT: r184-Renderer._renderBundle nicht gefunden (Vendor-Drift)", "ERROR");
        else if (!renderer.__anazhReplayBuchung) {
            const replayRoh = renderer._renderBundle;
            renderer._renderBundle = function (bundle, sceneRef, lightsNode) {
                const rb = this._bundles.get(bundle.bundleGroup, bundle.camera, this._currentRenderContext);
                const daten = this.backend.get(rb);
                const replay = daten.bundleGPU !== undefined && bundle.bundleGroup.version === daten.version;
                const aus = replayRoh.call(this, bundle, sceneRef, lightsNode);
                if (replay && daten.renderObjects)
                    for (const ro of daten.renderObjects) {
                        const dp = ro.getDrawParameters();
                        if (dp) this.info.update(ro.object, dp.vertexCount, dp.instanceCount);
                    }
                return aus;
            };
            renderer.__anazhReplayBuchung = true;
        }
        // DIE BUNDLE-WAHRHEIT AM CHOKEPOINT `_renderScene` (r184 gelesen, vendor/three.webgpu.min.js): jeder Render —
        // Hauptbild, jede Schatten-Kaskade, jeder Post-Pass — läuft durch ihn, auch verschachtelt (der Schatten startet
        // am ersten Licht-Empfänger MITTEN im Hauptbild).
        // (1) DER AUFNAHME-STAPEL: `_renderBundle` setzt `_currentRenderBundle` zum Aufnehmen und danach auf null, ohne
        //     Stapel; `_renderObjectDirect` verfolgt einen Draw nur, solange der Zeiger steht, und der Replay refresht nur
        //     Verfolgte. Der Schatten-Render nullte den Zeiger der Haupt-Aufnahme: gemessen 04.10. (echte GPU, Mess-
        //     Wiese) 107 von 237 aufgenommenen Draws verfolgt, der Rest behielt die Kamera seiner Aufnahme. Jeder Render
        //     sichert den Zeiger der äußeren Aufnahme und gibt ihn zurück; ein verschachtelter Render nimmt nie in sie auf.
        // (2) KEIN BUNDLE UNTER EINEM OVERRIDE-STOFF: `renderObject` richtet den geteilten Override-Stoff (Schatten:
        //     isShadowPassMaterial) je Objekt ein (alphaTest · alphaMap · Seite · Knoten des Originals); Knoten und Seite
        //     setzt es danach zurück, alphaTest · alphaMap bleiben vom zuletzt direkt gezeichneten Werfer. Der Replay
        //     refresht seine Bürger außerhalb davon — gegen diesen fremden Stoff-Zustand. Gemessen 04.10.: der Schatten-
        //     Replay warf das ausgeschnittene Laub voll (81 % gleiche Pixel gegen den direkten Pfad, Rauschboden 90 %;
        //     mit dem alphaTest eines vollen Werfers reproduzierbar 0,817 gegen 0,902), eine Neuaufnahme je Frame stellte
        //     90 % her. Ein Render mit overrideMaterial sammelt keine Bundles: `_projectObject` liest eine BundleGroup als
        //     Gruppe, solange `backend.beginBundle` fehlt. gate:vendor-anker pinnt beide Stellen und fährt den Block am
        //     Schein-Renderer, gate:kamera-treue an einer Bühne am echten WebGPU mit Schatten.
        if (typeof renderer._renderScene !== "function" || !renderer.backend)
            this.log("BUNDLE-WAHRHEIT: r184-Renderer._renderScene nicht gefunden (Vendor-Drift)", "ERROR");
        else if (!renderer.__anazhBundleWahrheit) {
            const szeneRoh = renderer._renderScene;
            const be = renderer.backend;
            // (3) DIE WELT-MATRIZEN EINMAL JE BILD (Welle K): r184 rechnet in JEDEM `_renderScene` den ganzen Szenen-
            //     Graphen neu (`scene.updateMatrixWorld()` bei matrixWorldAutoUpdate) — auch in jeder Kaskade, die mitten im
            //     Hauptbild derselben Szene startet. Gemessen 07.10. (Radeon, Mess-Wiese, echter Loop): 2,1 Graph-Gänge je
            //     gerendertem Bild (Hauptbild + Kaskaden), ~1000 Knoten je Gang. Zwischen dem Hauptbild und seinen
            //     verschachtelten Pässen bewegt sich nichts (kein Spiel-Takt läuft, kein Haken schreibt Matrizen): ein
            //     verschachtelter Render DERSELBEN Szene liest die Matrizen, die ihr äußerer Render eben rechnete.
            const offen = new Set();
            renderer._renderScene = function (scene, camera, useFrameBufferTarget) {
                const aufnahme = this._currentRenderBundle;
                const override = !!(scene && scene.overrideMaterial);
                const eigen = Object.prototype.hasOwnProperty.call(be, "beginBundle");
                const beginRoh = be.beginBundle;
                const innen = !!scene && offen.has(scene) && scene.matrixWorldAutoUpdate === true;
                this._currentRenderBundle = null;
                if (override) be.beginBundle = undefined;
                if (innen) scene.matrixWorldAutoUpdate = false;
                const aussen = !!scene && !offen.has(scene);
                if (aussen) offen.add(scene);
                try {
                    return szeneRoh.call(this, scene, camera, useFrameBufferTarget);
                } finally {
                    if (aussen) offen.delete(scene);
                    if (innen) scene.matrixWorldAutoUpdate = true;
                    this._currentRenderBundle = aufnahme;
                    if (override) {
                        if (eigen) be.beginBundle = beginRoh;
                        else delete be.beginBundle;
                    }
                }
            };
            renderer.__anazhBundleWahrheit = true;
        }
        // DIE BUNDLE-REIHENFOLGE: r184 sammelt die Bundles eines Passes und führt sie erst in finishRender aus — NACH
        // allen direkten Draws. Der Feld-Pass („letzter Draw, nur Himmel-Pixel überleben") und das Wasser liefen so
        // VOR Pflanzen, Boden und Bauten (alles Bundles): der Feld-March traced JEDES Pixel gegen einen fast leeren
        // Tiefenpuffer, das Wasser mischte sich gegen den leeren Grund und seine Ufer-Tiefe sah keinen Boden (gemessen
        // 04.10., echte GPU, Mess-Wiese). Die Bundles laufen jetzt sofort nach ihrer Aufnahme/ihrem Replay, die
        // direkten Draws danach — die Reihenfolge, die der Code behauptet. executeBundles leert den Pass-Zustand, der
        // gemerkte Zustand fällt mit (dasselbe Muster wie r184 nach dem Pass-Bruch). Array-Kameras behalten ihren Pfad.
        // Nur das WebGPU-Backend nimmt Bundles auf (der WebGL2-Rückfall liest jede BundleGroup als Gruppe).
        if (renderer.backend && renderer.backend.isWebGPUBackend) {
            if (
                typeof renderer._renderBundles !== "function" ||
                typeof renderer.backend._isRenderCameraDepthArray !== "function"
            )
                this.log("BUNDLE-REIHENFOLGE: r184-Renderer._renderBundles nicht gefunden (Vendor-Drift)", "ERROR");
            else if (!renderer.__anazhBundleReihenfolge) {
                const bundlesRoh = renderer._renderBundles;
                renderer._renderBundles = function (bundles, sceneRef, lightsNode) {
                    const aus = bundlesRoh.call(this, bundles, sceneRef, lightsNode);
                    const rc = this._currentRenderContext;
                    const d = rc ? this.backend.get(rc) : null;
                    if (
                        d &&
                        d.currentPass &&
                        d.renderBundles &&
                        d.renderBundles.length > 0 &&
                        !this.backend._isRenderCameraDepthArray(rc)
                    ) {
                        d.currentPass.executeBundles(d.renderBundles);
                        d.renderBundles = [];
                        d.currentSets = { attributes: {}, bindingGroups: [], pipeline: null, index: null };
                    }
                    return aus;
                };
                renderer.__anazhBundleReihenfolge = true;
            }
            // EIN SCHREIBEN JE PUFFER: r184 lädt eine Uniform-Gruppe Bereich für Bereich hoch — je geänderter Uniform ein
            // eigenes writeBuffer (bindingUtils.updateBinding). Kamera-Matrizen, Licht-Richtung und Zeit ändern sich
            // zusammen: gemessen 07.10. (Mess-Wiese, Stand) 18 Gruppen-Uploads in 170 writeBuffer je Frame. Eine Gruppe
            // mit mehreren geänderten Bereichen lädt jetzt EINEN Bereich vom ersten bis zum letzten (dazwischen liegen
            // die gültigen Werte der Gruppe); r184 leert die Bereiche nach dem Upload (`_update`).
            const be = renderer.backend;
            if (typeof be.updateBinding !== "function")
                this.log("EIN SCHREIBEN: r184-Backend.updateBinding nicht gefunden (Vendor-Drift)", "ERROR");
            else if (!be.__anazhEinSchreiben) {
                const bindungRoh = be.updateBinding;
                be.updateBinding = function (b) {
                    const rs = b && b.isNodeUniformsGroup === true ? b.updateRanges : null;
                    if (rs && rs.length > 1) {
                        let a = rs[0].start,
                            z = a + rs[0].count;
                        for (let i = 1; i < rs.length; i++) {
                            if (rs[i].start < a) a = rs[i].start;
                            if (rs[i].start + rs[i].count > z) z = rs[i].start + rs[i].count;
                        }
                        rs.length = 0;
                        rs.push({ start: a, count: z - a });
                    }
                    return bindungRoh.call(this, b);
                };
                be.__anazhEinSchreiben = true;
            }
            // DIE VERDECKUNGS-ABFRAGE SCHLIESST NUR, WAS SIE BEGANN (0910-3 A, Leben-Schau 2: am Bach beim Aussteigen „No
            // occlusion queries are active" in renderContext_4/_6, danach ungültige Command-Buffer und „Invalid value used in
            // weak set"). r184 hält die offene Occlusion-Query nur indirekt: sie beginnt im Draw eines Objekts mit
            // `occlusionTest` und endet träge beim Draw des NÄCHSTEN (`lastOcclusionObject`). Drei Vendor-Stellen nehmen dabei
            // an, dass JEDES gezählte Objekt (`renderContext.occlusionQueryCount`, die Render-Liste) in einem durchgehenden
            // Pass begann:
            //   (1) `copyFramebufferToTexture` (das Tiefen-Abbild für Wasser und Feld-Pass, jede Viewport-Textur) beendet den
            //       Pass mitten im Bild: die offene Query endet nie („ended with incomplete occlusion query"), die nächste
            //       Zeichnung schließt sie im neuen Pass, in dem keine offen ist;
            //   (2) `finishRender` schließt, sobald weniger begonnen als gezählt wurden — auch wenn keine offen ist. Ein
            //       gezähltes Objekt beginnt nicht, wenn seine Pipeline nicht steht (die Erst-Zeichnung wartet oder verschiebt
            //       es) oder als gescheitert gilt (`pipelineData.error`, auch durch einen FREMDEN Fehler, den r184s Fehler-
            //       Bereich um den asynchronen Bau einfängt) → „No occlusion queries are active", der Frame ungültig;
            //   (3) `resolveOccludedAsync` legt jedes Objekt mit 0 Proben in ein WeakSet — die Lücke eines nie begonnenen
            //       Index ist `undefined` → „Invalid value used in weak set" (das Ergebnis eines ungültigen Frames ist 0);
            //   (4) `beginRender` setzt `lastOcclusionObject` (und den Abfrage-Satz) nur bei Zähler > 0 zurück: war in einem
            //       Probe-Frame ein Stellvertreter der LETZTE Draw, schließt der nächste Frame mit Zähler 0 (der Berg-Cull fragt
            //       jeden `queryTakt`-ten) seine Abfrage beim ersten Draw — in einem Pass ohne Abfrage-Satz (Gegenprüfung
            //       10.10., Radeon, Mess-Wiese, Bündel seitlich: 176 Meldungen in 45 s am Kopf 1457bfa9, 382 an main).
            // Der EINE Ort: der Bruch schließt die offene Abfrage im alten Pass, `finishRender` schließt nur eine offene, und mit
            // ihm endet die Abfrage des Kontexts (`lastOcclusionObject` fällt; den Satz zerstört r184 selbst im nächsten
            // Probe-Frame), das Auflösen überspringt Lücken. Nachgestellt in gate:verdeckungs-abfrage (am Bach, Aussteigen;
            // die Stationen Bruch, Gift, Letzter).
            const VERDECKT_LEER = {};
            const offen = (d) => {
                const o = d.lastOcclusionObject;
                return !!(o && o.occlusionTest === true);
            };
            if (
                typeof be.copyFramebufferToTexture !== "function" ||
                typeof be.finishRender !== "function" ||
                typeof be.resolveOccludedAsync !== "function"
            )
                this.log(
                    "VERDECKUNGS-ABFRAGE: r184-Backend copyFramebufferToTexture/finishRender/resolveOccludedAsync nicht gefunden (Vendor-Drift)",
                    "ERROR"
                );
            else if (!be.__anazhVerdeckung) {
                const bruchRoh = be.copyFramebufferToTexture;
                be.copyFramebufferToTexture = function (textur, kontext, rechteck) {
                    const d = this.get(kontext);
                    if (d && d.currentPass && d.occlusionQuerySet !== undefined) {
                        if (offen(d)) {
                            d.currentPass.endOcclusionQuery();
                            d.occlusionQueryIndex++;
                        }
                        d.lastOcclusionObject = null;
                    }
                    return bruchRoh.call(this, textur, kontext, rechteck);
                };
                const schlussRoh = be.finishRender;
                be.finishRender = function (kontext) {
                    const d = this.get(kontext);
                    // keine offen → r184s Vergleich `occlusionQueryCount > occlusionQueryIndex` schließt nichts; danach liest
                    // r184 nur noch den Zähler (resolveQuerySet über occlusionQueryCount)
                    if (d && d.occlusionQuerySet !== undefined && !offen(d))
                        d.occlusionQueryIndex = Math.max(d.occlusionQueryIndex, kontext.occlusionQueryCount);
                    const aus = schlussRoh.call(this, kontext);
                    // (4) die Abfrage endet mit ihrem Render — der nächste Frame (Zähler 0) erbt keinen offenen Stellvertreter
                    if (d) d.lastOcclusionObject = null;
                    return aus;
                };
                const aufloesenRoh = be.resolveOccludedAsync;
                be.resolveOccludedAsync = function (kontext) {
                    const d = this.get(kontext);
                    const objekte = d ? d.currentOcclusionQueryObjects : null;
                    if (objekte)
                        for (let i = 0; i < objekte.length; i++)
                            if (objekte[i] === undefined) objekte[i] = VERDECKT_LEER;
                    return aufloesenRoh.call(this, kontext);
                };
                be.__anazhVerdeckung = true;
            }
        }
        // DER SCHATTEN-STOFF JE OBJEKT: r184 setzt in `renderObject` je Objekt `alphaTest` (und Seite, Knoten) des
        // Originals auf den EINEN geteilten Schatten-Stoff; der Material-Setter zählt bei jedem Wechsel über 0 die
        // Version hoch. Ausgeschnittene Blätter und volle Stämme wechseln sich ab → die Version sprang je Objekt, jeder
        // Schatten-Bürger rechnete je Kaskade und Frame seinen ganzen Material-Schlüssel neu (getCacheKey ·
        // getMaterialCacheKey) und prüfte seine Pipeline neu (gemessen 04.10., echte GPU, Mess-Wiese, Schattenpass
        // direkt: 342 ms Schlüssel-Rechnung in 8 s, die Schatten-Pässe 1330 → 585 ms). Der Schatten-Stoff trägt jetzt je
        // Objekt die Version des Original-Materials: ein Bürger prüft seinen Schlüssel genau dann, wenn SEIN Material
        // sich änderte (auch dessen eigener alphaTest-Wechsel), der geteilte Setter zählt nichts mehr.
        if (typeof renderer.renderObject !== "function")
            this.log("SCHATTEN-STOFF: r184-Renderer.renderObject nicht gefunden (Vendor-Drift)", "ERROR");
        else if (!renderer.__anazhSchattenStoff) {
            const objektRoh = renderer.renderObject;
            const still = new WeakSet();
            renderer.renderObject = function (
                object,
                scene,
                camera,
                geometry,
                material,
                group,
                lightsNode,
                clip,
                passId
            ) {
                const sm = scene ? scene.overrideMaterial : null;
                if (sm && sm.isShadowPassMaterial === true && material && material.allowOverride === true) {
                    if (!still.has(sm)) {
                        Object.defineProperty(sm, "alphaTest", {
                            configurable: true,
                            get() {
                                return this._alphaTest;
                            },
                            set(v) {
                                this._alphaTest = v;
                            },
                        });
                        still.add(sm);
                    }
                    sm.version = material.version;
                }
                return objektRoh.call(this, object, scene, camera, geometry, material, group, lightsNode, clip, passId);
            };
            renderer.__anazhSchattenStoff = true;
        }
        // DIE ERST-ZEICHNUNG (Welle K — die Hänger-Klasse „ein Frame trägt synchron eine schwere Arbeit"; r184 gelesen):
        // `_renderObjectDirect` baut beim ERSTEN Zeichnen eines RenderObjects synchron, was ihm fehlt — den Knoten-Graphen
        // seines Stoffs (`needsRefresh` → `getNodeBuilderState`) und die GPU-Pipeline (`updateForRender` →
        // `device.createRenderPipeline`: der GPU-Prozess übersetzt den Shader, bevor er das nächste Bild zeigt). Die Hänger-
        // Linse nannte 07.10. an der Radeon: 1,4–4,2 s Warten nach synchronen Pipelines (haupt/k0/k1 tier:baer · tier:fuchs ·
        // fimp:atlas:L2 · bauSatz · feld-pass), Knoten-Bauten 50–270 ms je Stoff, bis zu sechs in EINEM Frame (ein Tier:
        // Leib, Fell, Kopf, Kiefer). Für die WELT-Szene gilt hier: (1) jede Pipeline entsteht asynchron — ihr Deskriptor liest
        // Stoff und Ziel synchron im Pass (wie das Vendor-Kompilat), das Objekt zeichnet ab dem Frame, in dem sie steht;
        // (2) der Knoten-Bau bleibt im Pass (er liest MRT, Ziel und contextNode des Renderers, die nur dort gelten — ein
        // buildAsync liefe daneben), aber je Render-Aufruf baut höchstens EINER (weitere nur, solange der Aufruf unter
        // ERST_BAU_MS baute); jeder andere zeichnet ab dem nächsten Aufruf. Wer nicht zeichnen kann, meldet sich in der EINEN
        // Warteschlange an (`_erstWartet`), auf JEDEM Weg — Erstbau, Neubau, fremde Szene: ein Bundle, dessen Bürger so wartet,
        // nimmt neu auf, sobald die fertige Pipeline in r184s Zustand steht (der Vendor-Record droppt unfertige Draws und
        // versiegelt das Bundle; das Vendor-Versprechen hängt am Fehler-Scope und zählt nie). Das gilt der ERSTEN
        // Zeichnung eines Objekts in einem Pass (Render-Kontext · Pass-Kennung): ein Objekt, das dort schon zeichnete, baut
        // einen Neubau (ein Licht kam dazu — r184 schlüsselt das RenderObject je Lichter-Satz und verwirft den Vorgänger im
        // selben `_objects.get` —, sein Stoff wechselte die Variante) wie der Vendor im Frame: was schon zu sehen war, blinkt
        // nicht aus — nur wenn eine Erst-Zeichnung seinen neuen Schlüssel eben asynchron anlegte, wartet er auf dieselbe
        // Pipeline wie sie; der Neubau zählt mit (`neubauN`). Ein Render einer anderen Szene (die Umgebung, ein Post-Quad)
        // zeichnet wie bisher — ein Einmal-Render bliebe leer. Das ist der
        // EINE Ort der Klasse: kein Vorwärmen daneben (das r184-compileAsync baute die Knoten ohnehin synchron —
        // `_geometries.updateForRender` liest die Attribute vor `getForRenderAsync`).
        // Nodes und Pipelines legt erst init() an (dieser Eingriff läuft davor): die Nachbildung liest sie je Aufruf am
        // Renderer; ihre Vendor-Stellen pinnt gate:vendor-anker.
        if (typeof renderer._renderObjectDirect !== "function")
            this.log("ERST-ZEICHNUNG: r184-Renderer._renderObjectDirect nicht gefunden (Vendor-Drift)", "ERROR");
        else if (!renderer.__anazhErstZeichnung) {
            const welt = this;
            const E = this._erstZeichnungStand();
            // der Vendor-Körper: auffrischen, Pipeline (asynchron mit Versprechen-Liste, sonst synchron), zeichnen, wenn sie
            // steht — sonst meldet sich der Bürger an. Auch der synchrone Weg trifft im Cache eine noch offene Pipeline (r184
            // `getForRender`: Cache-Treffer → `e.pipeline=d`, ob fertig oder nicht), wenn eine Erst-Zeichnung ihren Schlüssel
            // eben asynchron anlegte: ein Neubau wartet dann wie sie.
            const zeichne = (rend, ro, aufnahme, asynchron) => {
                const N = rend._nodes,
                    P = rend._pipelines;
                E.bau = null; // das Versprechen gehört dem Bau DIESES Aufrufs (`_erstAbsageWache`)
                const refresh = N.needsRefresh(ro);
                if (refresh) {
                    N.updateBefore(ro);
                    rend._geometries.updateForRender(ro);
                    N.updateForRender(ro);
                    rend._bindings.updateForRender(ro);
                }
                if (asynchron) {
                    // das Vendor-Versprechen einer neuen Pipeline wartet nach dem Bau noch auf popErrorScope — die Welt
                    // hält es nicht (die Bereitschaft liest `_erstWartet` am Zustand)
                    P.getForRender(ro, E.neu);
                    if (E.neu.length > 0) {
                        E.neu.length = 0;
                        E.pipeAsync++;
                    }
                } else P.updateForRender(ro);
                if (!P.isReady(ro)) {
                    welt._erstWartet(rend.backend, P.get(ro).pipeline, aufnahme !== null ? aufnahme.bundleGroup : null);
                    return false;
                }
                if (aufnahme !== null) rend.backend.get(aufnahme).renderObjects.push(ro);
                rend.backend.draw(ro, rend.info);
                if (refresh) N.updateAfter(ro);
                return true;
            };
            renderer._renderObjectDirect = function (object, material, scene, camera, lightsNode, group, clip, passId) {
                const N = this._nodes;
                const ro = this._objects.get(
                    object,
                    material,
                    scene,
                    camera,
                    lightsNode,
                    this._currentRenderContext,
                    clip,
                    passId
                );
                ro.drawRange = object.geometry.drawRange;
                ro.group = group;
                const aufnahme = this._currentRenderBundle;
                if (aufnahme !== null) ro.bundle = aufnahme.bundleGroup;
                if (scene !== welt.state.scene) {
                    zeichne(this, ro, aufnahme, false);
                    return;
                }
                const ungebaut =
                    ro._nodeBuilderState === null &&
                    N.get(ro).nodeBuilderState === undefined &&
                    N.nodeBuilderCache.get(ro.initialCacheKey) === undefined;
                const ctx = this._currentRenderContext.id;
                const k = passId == null ? ctx : ctx + "|" + passId;
                let pass = E.gezeichnet.get(object);
                if (pass !== undefined && pass.has(k)) {
                    // der Neubau eines Objekts, das in diesem Pass schon zeichnete: wie der Vendor, im Frame
                    if (ungebaut) E.neubauN++;
                    zeichne(this, ro, aufnahme, false);
                    return;
                }
                let bau = -1;
                if (ungebaut) {
                    if (E.aufruf !== this.info.calls) {
                        E.aufruf = this.info.calls;
                        E.aufrufMs = 0;
                    } else if (E.aufrufMs >= AnazhRealm.ERST_BAU_MS) {
                        E.verschoben++;
                        if (aufnahme !== null) welt._erstWartet(this.backend, null, aufnahme.bundleGroup);
                        return;
                    }
                    bau = performance.now();
                }
                const gezeichnet = zeichne(this, ro, aufnahme, true);
                if (bau >= 0) {
                    const ms = performance.now() - bau;
                    E.aufrufMs += ms;
                    E.bauN++;
                    E.bauMs += ms;
                }
                if (gezeichnet) {
                    if (pass === undefined) E.gezeichnet.set(object, (pass = new Set()));
                    pass.add(k);
                }
            };
            renderer.__anazhErstZeichnung = true;
        }
    }

    // DER STAND DER ERST-ZEICHNUNG (der EINE Ort in `_configureRenderer`): je Render-Aufruf die Bau-Zeit, die Zähler für
    // Flugschreiber und Hänger-Linse (Knoten-Bauten · verschobene Erst-Zeichnungen · asynchrone Pipelines · bereit
    // gewordene) und je offener Pipeline die Bundles, die ohne ihren Bürger versiegelt wurden.
    _erstZeichnungStand() {
        if (!this._erstZeichnung)
            this._erstZeichnung = {
                aufruf: -1,
                aufrufMs: 0,
                bauN: 0,
                bauMs: 0,
                verschoben: 0,
                pipeAsync: 0,
                bereitN: 0,
                absagenN: 0,
                wartetN: 0, // Draws, die nicht zeichnen konnten (ihre Pipeline stand nicht) — der Zähler jedes Backends
                wartetAuf: null, // die Pipeline des letzten wartenden Draws (die Beweis-Aufnahme nennt sie)
                neubauN: 0,
                neu: [],
                bau: null, // { p, label } — das Geräte-Versprechen des eben angelegten Baus
                offen: new Map(),
                namen: new WeakMap(), // Pipeline → ihr Label `renderPipeline_<Stoff>_<id>`
                abgesagt: new WeakSet(),
                aufnehmen: new Set(),
                gezeichnet: new WeakMap(), // Objekt → die Pässe (Render-Kontext|Pass-Kennung), in denen es schon zeichnete
            };
        return this._erstZeichnung;
    }

    // DIE ABSAGE EINER PIPELINE (Welle K): r184 verschluckt die Absage von createRenderPipelineAsync (`catch(e){}`,
    // vendor/three.webgpu.min.js 6:590437), und ein Fehler-Scope sieht asynchrone Fehler nach Spezifikation nie — ein Stoff,
    // dessen Pipeline scheitert, bliebe STILL für immer unsichtbar (der synchrone Bau meldete denselben Fehler laut). Der EINE
    // Abgriff am Gerät (wie der writeBuffer-Abgriff, nach init): das Original-Versprechen geht unverändert an r184 zurück,
    // seine Absage meldet sich als `PIPELINE-ABSAGE <label>: <message>` (das Label nennt den Stoff:
    // `renderPipeline_<Stoff>_<id>`, 6:589557) über den EINEN Melder der GPU-Wache (`_gpuWacheMeldung`: ERROR beim Namen,
    // gezählt in `_gpuWache` — eine Absage ist eine Validierung wie jede andere, Integration V18.535), und die Erst-Zeichnung
    // trägt die Pipeline aus ihrer Warteschlange aus (`_erstWartet` hält das Versprechen ihres Baus). Gerufen wird je Aufruf
    // der Prototyp — Linsen hängen sich dort ein.
    _erstAbsageWache(renderer) {
        const be = renderer.backend;
        const dev = be && be.isWebGPUBackend === true ? be.device : null;
        if (!dev || dev.__anazhAbsage || typeof dev.createRenderPipelineAsync !== "function") return;
        const E = this._erstZeichnungStand();
        const welt = this;
        dev.createRenderPipelineAsync = function (desc) {
            const p = Object.getPrototypeOf(this).createRenderPipelineAsync.call(this, desc);
            const label = (desc && desc.label) || "renderPipeline_(ohne Label)";
            E.bau = { p, label };
            p.catch((e) => {
                E.absagenN++;
                welt._gpuWacheMeldung("pipeline", `PIPELINE-ABSAGE ${label}: ${(e && e.message) || e}`);
            });
            return p;
        };
        dev.__anazhAbsage = true;
    }

    // DIE EINE WARTESCHLANGE der Erst-Zeichnung: ein Bürger, der nicht zeichnen kann, meldet sich hier an — auf jedem Weg
    // (Erstbau, Neubau, fremde Szene); `bg` ist das Bundle, dessen Aufnahme ohne ihn versiegelt (null: ein direkter Draw,
    // er versucht es im nächsten Aufruf selbst).
    // (1) Er wartet auf seine PIPELINE (`pipe`): bereit ist sie, sobald r184 die fertige GPU-Pipeline in seinen Zustand
    //     schreibt — `h.pipeline=await d.createRenderPipelineAsync(A)` (vendor/three.webgpu.min.js 6:590389), genau das Feld,
    //     das `isReady` liest (6:221094). Ein Setter an diesem Feld nimmt im SELBEN Moment jedes Bundle neu auf, das ohne
    //     einen ihrer Bürger versiegelt wurde (die Zuweisung läuft nach einem await, nie mitten in einer Aufnahme). Das
    //     Vendor-Versprechen wartet danach noch auf `popErrorScope` (6:590447) — auf der Spielseite > 5 s, auf Windows-
    //     swiftshader nie aufgelöst (gemessen 07.10.: ein Bundle-Bürger mit fertiger Pipeline 120 s ohne Neuaufnahme); an
    //     ihm hängt nichts.
    // (2) Er wartet nur auf seinen KNOTEN-BAU (`pipe` null: der Aufruf hat sein Bau-Budget verbraucht): das Bundle nimmt
    //     nach der laufenden Aufnahme neu auf — r184 versiegelt an ihrem Ende (`u.version=s.version`, 6:413962) und schluckte
    //     eine Marke von mittendrin.
    // Eine Pipeline, deren Bau scheitert, meldet sich laut (`_erstAbsageWache`) und fällt aus der Warteschlange; ihr Bürger
    // zählt weiter als wartender Draw — die Beweis-Aufnahme nennt ihn beim Namen und bricht ab.
    // Der WebGL2-Rückfall kennt keine Bundles, und sein `_completeCompile` ersetzt das Datenobjekt der Pipeline (vendor
    // 6:513930 über Backend.set 6:457928) — ein Setter am alten Objekt feuerte nie, die Schlange wüchse die ganze Sitzung:
    // dort zählt der wartende Draw nur (`wartetN`), er versucht es im nächsten Aufruf selbst.
    _erstWartet(be, pipe, bg) {
        const E = this._erstZeichnung;
        if (!pipe) {
            if (bg === null) return;
            if (E.aufnehmen.size === 0)
                Promise.resolve().then(() => {
                    for (const b of E.aufnehmen) b.needsUpdate = true;
                    E.aufnehmen.clear();
                });
            E.aufnehmen.add(bg);
            return;
        }
        E.wartetN++;
        E.wartetAuf = pipe;
        const bau = E.bau;
        E.bau = null;
        if (be.isWebGPUBackend !== true || E.abgesagt.has(pipe)) return;
        let bundles = E.offen.get(pipe);
        if (bundles === undefined) {
            const h = be.get(pipe);
            let wert = h.pipeline;
            const warten = (bundles = new Set());
            E.offen.set(pipe, warten);
            if (bau !== null) {
                E.namen.set(pipe, bau.label);
                bau.p.catch(() => {
                    E.abgesagt.add(pipe);
                    E.offen.delete(pipe);
                });
            }
            Object.defineProperty(h, "pipeline", {
                configurable: true,
                enumerable: true,
                get: () => wert,
                set: (v) => {
                    wert = v;
                    if (v === undefined || v === null) return;
                    Object.defineProperty(h, "pipeline", {
                        value: v,
                        writable: true,
                        configurable: true,
                        enumerable: true,
                    });
                    E.offen.delete(pipe);
                    E.bereitN++;
                    for (const b of warten) b.needsUpdate = true;
                },
            });
        }
        if (bg !== null) bundles.add(bg);
    }

    // HEADLESS-NULL-RENDERER (opt-in via window.__anazhHeadlessNullRenderer): No-op-Hülle ohne GPU —
    // die Welt bootet + simuliert voll (CPU), nur die Rasterung entfällt (Mechanik-Playtest GPU-frei;
    // der Look gehört der echten WebGPU-Bahn). Deckt exakt die vom Code berührte Renderer-API; `init()`
    // resolvt (rendererReady=true), `backend=null` nimmt die Sofort-Dispose-Bahn in _drainPools.
    _makeHeadlessRenderer(canvas) {
        const noop = () => {};
        const resolved = () => Promise.resolve();
        return {
            domElement: canvas,
            shadowMap: { enabled: false, type: 0, autoUpdate: false, needsUpdate: false },
            toneMapping: 0,
            toneMappingExposure: 1,
            stencil: false,
            outputColorSpace: "srgb",
            backend: null,
            info: { render: { calls: 0, drawCalls: 0, triangles: 0 }, memory: {}, autoReset: false, reset: () => {} },
            init: resolved,
            // render() lässt die Rasterung weg, aktualisiert aber die Welt-Matrizen — sonst veraltet
            // matrixWorld und der echte Raycast (Graben/Picken) verfehlt das Terrain.
            render: (scene, camera) => {
                if (scene && scene.updateMatrixWorld) scene.updateMatrixWorld();
                if (camera && camera.updateMatrixWorld) camera.updateMatrixWorld();
            },
            renderAsync: (scene, camera) => {
                if (scene && scene.updateMatrixWorld) scene.updateMatrixWorld();
                if (camera && camera.updateMatrixWorld) camera.updateMatrixWorld();
                return Promise.resolve();
            },
            compute: noop,
            computeAsync: resolved,
            setAnimationLoop: noop,
            setSize: noop,
            setPixelRatio: noop,
            setClearColor: noop,
            getPixelRatio: () => 1,
            getContext: () => null,
            // Der Zeichenpuffer ist der Canvas (der resize-Handler setzt ihn): der EINE Schirm-Maßstab (`_schirm`)
            // liest headless denselben Schirm wie am echten Renderer.
            getDrawingBufferSize: (t) => {
                const w = canvas && canvas.width > 0 ? canvas.width : 0;
                const h = canvas && canvas.height > 0 ? canvas.height : 0;
                return t && typeof t.set === "function" ? t.set(w, h) : { x: w, y: h, width: w, height: h };
            },
            setRenderTarget: noop,
            getRenderTarget: () => null,
            clear: noop,
            dispose: noop,
            _isHeadlessNull: true,
        };
    }

    // DAS SPRUNG-GESETZ (Q1, Welle L): der EINE Start eines Hüpfers. Die Höhe ist das Freude-Gesetz (VERHALTEN.freude): ein
    // frohes Wesen springt hopHochM, jedes andere den Grund-Hüpfer hopBasisM — dasselbe Etikett, das sein Tempo hebt
    // (freude.tempoMul). Der Abflug ist die Parabel v0 = √(2·g·h) mit dem g des Gang-Gesetzes; der Takt in updateCreatures
    // trägt sie ON TOP der geerdeten Lage (die Erdung bleibt die Wahrheit). Eine Aktion mit `hop` (bound, pounce) zündet
    // ihn (_tickKreaturVerhalten) — kein Abflug in m/s daneben (der alte `def.hop` war ein Zwilling: der frohe Sprung stieg
    // 0,52 statt 1,2 m). Ein Wesen in der Luft springt nicht neu. `ansprung`: der Sprung eines Bisses (_kreaturSprungHoehe).
    creatureJump(creature, ansprung = false) {
        const ud = creature && creature.userData;
        if (!ud || ud._hopV > 0 || ud._hopH > 0) return false;
        ud._hopV = Math.sqrt(2 * AnazhRealm._hopSchwere() * this._kreaturSprungHoehe(creature, ansprung));
        return true;
    }
    // DIE HÖHE DES SPRUNGS (m) — das Freude-Gesetz, die EINE Quelle (creatureJump, die Flugzeit des Ansprungs
    // _kreaturSprungZeit, die Höhe, die ein Biss erreicht): froh hopHochM, sonst hopBasisM. DER ANSPRUNG EINES BISSES ist kein
    // Freuden-Sprung (K13): er springt den Grund-Hüpfer, wie froh der Jäger auch ist — vorher trug ein froher Fuchs den Kopf
    // 1,2 m hoch über das Kitz (Spalt 0,12–0,19 m, 4 von 12 Ansprüngen ins Leere; gate:kampf-gefuehl T15 wackelte je Boot).
    _kreaturSprungHoehe(creature, ansprung = false) {
        const F = AnazhRealm._verhaltenGesetz().freude;
        if (ansprung) return F.hopBasisM;
        const froh = this.state.creatureEmotions[this.state.creatures.indexOf(creature)] === "happy";
        return froh ? F.hopHochM : F.hopBasisM;
    }
    // DIE DAUER DES ANSPRUNGS (s, Welle LF kampf, Posten 5): die Geste des Bisses (pounce) springt — sie dauert, bis der Leib
    // wieder steht: die Flugzeit 2·√(2h/g) des Sprung-Gesetzes, mindestens die Dauer der Geste. In ihr trägt der Ansprung den
    // Kopf auf das Ziel, beim Landen schnappt das Maul.
    _kreaturSprungZeit(creature) {
        const BG = AnazhRealm._bissGesetz();
        if (BG.geste.hop !== true) return BG.dauer;
        return Math.max(
            BG.dauer,
            2 * Math.sqrt((2 * this._kreaturSprungHoehe(creature, true)) / AnazhRealm._hopSchwere())
        );
    }

    isInFrustum(object, providedFrustum = null) {
        // Chunks haben Origin (0,0,0) mit Geometrie in Welt-Koordinaten — ein Punkttest blendete sie je nach
        // Blickrichtung weg. Mit boundingSphere → intersectsSphere, sonst Punkttest.
        if (!object) {
            return false;
        }

        // Frustum/Matrix4/Sphere gepoolt statt pro Aufruf allokiert (sonst 2 Allokationen je Kreatur/Frame):
        // ein gelieferter Frustum gewinnt, sonst der pro Frame aktualisierte `_frustumCache` (pre-init lazy).
        let frustum = providedFrustum || this._frustumCache;
        if (!frustum) {
            // Pre-init: das `_loopFrustumCulling` ist noch nicht gelaufen.
            // Wir bauen das Cache lazy + initial, ab dem nächsten Frame
            // wird es vom Render-Pass aktualisiert.
            this._frustumCache = new THREE.Frustum();
            this._frustumMatrixCache = new THREE.Matrix4();
            this._frustumMatrixCache.multiplyMatrices(
                this.state.camera.projectionMatrix,
                this.state.camera.matrixWorldInverse
            );
            this._frustumCache.setFromProjectionMatrix(this._frustumMatrixCache);
            frustum = this._frustumCache;
        }

        if (object.geometry) {
            if (!object.geometry.boundingSphere) {
                try {
                    object.geometry.computeBoundingSphere();
                } catch {
                    // Geometrie ungültig – auf "sichtbar" fallen lassen
                    return true;
                }
            }
            const sphere = object.geometry.boundingSphere;
            if (sphere && Number.isFinite(sphere.radius) && sphere.radius > 0) {
                // boundingSphere der Chunks liegt schon in Welt-Koordinaten; bei Position-Offset (Inseln,
                // Vegetation) wird das Center über eine gepoolte Scratch-Sphere verschoben.
                if (
                    object.position &&
                    (object.position.x !== 0 || object.position.y !== 0 || object.position.z !== 0)
                ) {
                    if (!this._frustumSphereScratch) {
                        this._frustumSphereScratch = new THREE.Sphere(new THREE.Vector3(), 0);
                    }
                    const s = this._frustumSphereScratch;
                    s.center.copy(sphere.center).add(object.position);
                    s.radius = sphere.radius;
                    return frustum.intersectsSphere(s);
                }
                return frustum.intersectsSphere(sphere);
            }
        }

        // Punkt-basierter Fallback (Kreaturen, einfache Meshes)
        if (!object.position) return false;
        const isVisible = frustum.containsPoint(object.position);
        if (!isVisible && this.state.playerMesh) {
            const distance = object.position.distanceTo(this.state.playerMesh.position);
            if (distance < 50) return true;
        }
        return isVisible;
    }

    // ### Aktivieren/Deaktivieren ###
    toggleTerrain(visible) {
        // toggleTerrain wirkt auf `state.voxelChunks`; die Kollision ist feld-nativ (`_stepCharacter`
        // liest das Dichtefeld) — der Toggle schaltet nur die SICHTBARKEIT.
        const vc = this.state.voxelChunks;
        if (vc && vc.size > 0) {
            // DER SATZ: der ganze Ring ist EIN Objekt — der Toggle schaltet ihn.
            this._chunkSatzSichtbar("boden", visible);
            this.log(`Boden ${visible ? "aktiviert" : "deaktiviert"}`);
        } else {
            this.log("Boden nicht vorhanden – Erzeuge neuen Boden...");
            this.generateNewWorld();
        }
    }

    toggleCreatures(visible) {
        // DETERMINISMUS-BOGEN P3 — Kreaturen tragen keinen Ammo-Body mehr; nur Sichtbarkeit.
        // WELT-MARCH: das Feld IST die Gestalt — der Toggle schaltet die FELDER
        // (der Kreatur-Ziegel-Tick konsumiert das Flag am EINEN Chokepoint).
        this.state.creaturesHidden = !visible;
        // jeder Leib im Bild: die Wesen und die Gefallenen (state.leichname liegen sichtbar, bis sie versunken sind)
        for (const creature of [...this.state.creatures, ...this.state.leichname]) {
            const u = creature.userData;
            if (u && u._kzGlieder) {
                for (const gl of u._kzGlieder) this._weltFeldAktiv(gl.handle, visible, true); // Schalter: kein Schwund
                creature.visible = false; // der Körper bleibt unsichtbarer Träger
            } else if (u && u._kzVersuch) {
                creature.visible = false; // Bake gescheitert: KEIN Rückweg zum Mesh
            } else creature.visible = visible;
        }
        this.log(`Kreaturen ${visible ? "aktiviert" : "deaktiviert"}`);
    }

    // ### Selbstdefinition ###
    // Abilities sind ausschließlich DSL-Programme: `state.dsl.abilities` ist die Quelle der Wahrheit
    // (Persistenz), `state.abilities[name]` nur Wrapper-Cache (Keyboard-Loop). Keine dynamische
    // Code-Generierung (CSP-strict).
    addNewAbility(name, program, source = "human") {
        if (!Array.isArray(program)) {
            this.log(`addNewAbility: Programm für '${name}' ist kein DSL-Array, ignoriert`, "ERROR");
            return false;
        }
        const existingIdx = this.state.dsl.abilities.findIndex((a) => a.name === name);
        // Welle 6.E1 — Beschreibung beim Anlegen einmal berechnen + speichern.
        // Bei Restore aus alten Saves übernimmt renderAbilitiesList das Nachholen.
        const description = (() => {
            try {
                return this.describeProgram(program);
            } catch {
                return "wirkt auf die Welt";
            }
        })();
        const entry = {
            name,
            program,
            source,
            description,
            createdAt: performance.now() / 1000,
        };
        if (existingIdx >= 0) this.state.dsl.abilities[existingIdx] = entry;
        else this.state.dsl.abilities.push(entry);

        this.state.abilities[name] = () => this.dslRun(program, { source: `ability:${name}` });
        if (!this.state.selfAwareness.components.includes(name)) {
            this.state.selfAwareness.components.push(name);
        }
        this.log(`Neue Fähigkeit hinzugefügt (DSL): ${name}`);
        return true;
    }

    // Der erste Moment gehört der WELT: kein Modal, kein Backdrop, kein Steuerungs-Dump — der Begleiter
    // (Eins) lädt EINMAL diegetisch ein; die Steuerung kommt just-in-time + im Hilfe-Tab.
    // Gegated über anazh.ui.skipIntro / worldJournal.seen.intro, idempotent.
    _firstWorldWelcome(opts = {}) {
        if (typeof document === "undefined") return;
        const seen = (() => {
            try {
                if (typeof localStorage !== "undefined" && localStorage.getItem("anazh.ui.skipIntro") === "true")
                    return true;
            } catch {
                /* localStorage gesperrt — worldJournal entscheidet */
            }
            return !!(this.state.worldJournal && this.state.worldJournal.seen && this.state.worldJournal.seen.intro);
        })();
        if (seen) return;
        // Die Welt zuerst atmen lassen (der WOW), DANN die sanfte Einladung des
        // Begleiters — diegetisch in der Dialog-Box, kein Modal verdeckt die Sicht.
        const invite = () => {
            this.grokRender(this._firstWelcomeMessage());
            try {
                if (typeof localStorage !== "undefined") localStorage.setItem("anazh.ui.skipIntro", "true");
            } catch {
                /* localStorage gesperrt — worldJournal trägt das Flag */
            }
            this.journalAppendOnce(
                "intro",
                "ritual",
                "Ich erwachte in dieser Welt, und sie wartete auf mein erstes Wort."
            );
        };
        if (opts.immediate) invite();
        else if (typeof setTimeout === "function") setTimeout(invite, 1800);
        else invite();
    }

    // Die EINE Begrüssung des Begleiters — eine Einladung, keine Anleitung. Sie
    // erklärt nichts (kein WASD/Hotbar-Dump), sie öffnet die Tür: die Welt wächst
    // aus dem ersten Wort. Das ist der WOW — die Welt antwortet auf deine Stimme.
    _firstWelcomeMessage() {
        return "Ich bin Eins. Diese Welt ist still — bis du sprichst. Sag, was werden soll.";
    }

    // DSL-Programm → deutsche Beschreibung: bekannte Ops per Vorlage, sonst generischer Fallback;
    // chain/when/repeat/delay rekursieren, Position-Nodes inline. Gespeichert in `ability.description`
    // (alte Saves on-the-fly), max ~120 Zeichen, eine Zeile.
    describeProgram(node) {
        if (!Array.isArray(node) || node.length === 0) return "tut nichts";
        const op = node[0];
        const args = node.slice(1);
        if (op === "chain") {
            const parts = args.filter((a) => Array.isArray(a)).map((a) => this.describeProgram(a));
            if (parts.length === 0) return "tut nichts";
            if (parts.length === 1) return parts[0];
            return parts.join(" und ");
        }
        if (op === "when") {
            return `wenn ${this._describeDslCondition(args[0])}, dann ${this.describeProgram(args[1])}`;
        }
        // V17.36 Phase D — eine stehende Welt-Regel menschen-lesbar.
        if (op === "rule") {
            const opts = args[2] && typeof args[2] === "object" && !Array.isArray(args[2]) ? args[2] : {};
            const every = opts.everySec ? ` (alle ${opts.everySec} s)` : "";
            return `wann immer ${this._describeDslCondition(args[0])}, dann ${this.describeProgram(args[1])}${every}`;
        }
        if (op === "repeat") return `${args[0]}× ${this.describeProgram(args[1])}`;
        if (op === "delay") return `nach ${args[0]} s ${this.describeProgram(args[1])}`;
        if (op === "say") return `sagt „${args[0]}"`;
        if (op === "record_narrative") return `vermerkt eine Erinnerung`;
        const t = this._dslDescriptionTable();
        if (t[op]) return t[op](args);
        return `wirkt: ${op}`;
    }

    // Position-Knoten oder skalare Werte in deutscher Form. Wird von describeProgram
    // genutzt, lebt als eigene Methode damit auch Tests sie inspizieren können.
    _describeDslPosition(arg) {
        if (!Array.isArray(arg)) return "an einer Stelle";
        const head = arg[0];
        if (head === "at_player") return "beim Spieler";
        if (head === "near_player") return "in der Nähe des Spielers";
        if (head === "random_position") return "an einem zufälligen Ort";
        if (head === "near_water") return "am nächsten Wasser";
        if (head === "far_player") return "in der Ferne";
        if (head === "at" && arg.length >= 4) return `bei (${arg[1]}, ${arg[2]}, ${arg[3]})`;
        return "an einer Stelle";
    }

    _describeDslCondition(node) {
        if (!Array.isArray(node)) return "etwas";
        const op = node[0];
        const a = node.slice(1);
        if (op === "emotion_above") return `${a[0]} hoch ist (>${a[1]})`;
        if (op === "fps_below") return `die FPS unter ${a[0]} fallen`;
        if (op === "player_y_below") return `der Spieler unter Höhe ${a[0]} ist`;
        if (op === "weather_is") return `das Wetter „${a[0]}" ist`;
        if (op === "random_chance") return `Zufall ≤ ${a[0]}`;
        if (op === "time_passed") return `${a[0]} s vergangen sind`;
        if (op === "near_player") return `etwas nahe ist`;
        if (op === "creatures_count_above") return `mehr als ${a[0]} Kreaturen da sind`;
        if (op === "compound_has_tag") return `„${a[0]}" das Tag ${a[1]} ≥ ${a[2]} hat`;
        if (op === "compound_has_spatial_tag") return `„${a[0]}" räumlich ${a[1]} ≥ ${a[2]} hat`;
        // V17.34/.36 — die Feld-Bedingungen (Regeln lesen das lebendige Feld am Ort)
        if (op === "field_above") return `${a[0]} am Ort hoch ist (>${a[1]})`;
        if (op === "field_below") return `${a[0]} am Ort niedrig ist (<${a[1]})`;
        if (op === "and") return a.map((c) => this._describeDslCondition(c)).join(" und ");
        if (op === "or") return a.map((c) => this._describeDslCondition(c)).join(" oder ");
        if (op === "not") return `nicht (${this._describeDslCondition(a[0])})`;
        return `etwas (${op})`;
    }

    _dslDescriptionTable() {
        const pos = (a) => this._describeDslPosition(a);
        return {
            weather: (a) => `lässt das Wetter zu „${a[0]}" wechseln`,
            gravity: (a) => `setzt die Schwerkraft auf ${a[0]}`,
            terrain_steepness: (a) => `regelt die Hang-Steilheit auf ${a[0]}`,
            terrain_base_height: (a) => `hebt die Welt-Grundhöhe auf ${a[0]}`,
            voxel_carve: (a) => `schnitzt das Voxel-Terrain bei (${a[0]}, ${a[1]}, ${a[2]}) im Radius ${a[3]}`,
            voxel_fill: (a) => `schüttet das Voxel-Terrain bei (${a[0]}, ${a[1]}, ${a[2]}) im Radius ${a[3]} auf`,
            set_time_of_day: (a) => `stellt die Uhr auf ${a[0]}`,
            skybox_color: () => `färbt den Himmel`,
            deposit_life: (a) => `trägt Leben ins Feld ${pos(a[0])}`,
            deposit_emotion: (a) => `prägt „${a[0]}" ins Feld ${pos(a[2])}`,
            spawn_creature: (a) =>
                `ruft ${a[1] || 1} ${a[2] ? a[2] + " " : ""}Kreatur${(a[1] || 1) !== 1 ? "en" : ""} herbei ${pos(a[0])}`,
            spawn_tree: (a) => `pflanzt ${a[1] || 1} ${(a[1] || 1) !== 1 ? "Bäume" : "Baum"} ${pos(a[0])}`,
            spawn_studio: (a) => {
                const n = typeof a[0] === "string" ? this._studioBlueprintForWord(a[0].toLowerCase()) : null;
                const bp = n && this.state.blueprints ? this.state.blueprints[n] : null;
                return `lässt ${a[2] || 1}× „${(bp && bp.label) || a[0]}" aus dem Studio wachsen ${pos(a[1])}`;
            },
            spawn_island: (a) => `setzt eine schwebende Insel ${pos(a[0])}`,
            spawn_ufo: (a) => `ruft ein UFO ${pos(a[0])}`,
            spawn_village: (a) => `errichtet ein Dorf ${pos(a[0])}`,
            spawn_temple: (a) => `errichtet einen Tempel ${pos(a[0])}`,
            spawn_waterfall: (a) => `formt einen Wasserfall ${pos(a[0])}`,
            spawn_blueprint: (a) => {
                const bp = this.state.blueprints && this.state.blueprints[a[0]];
                return `baut „${(bp && bp.label) || a[0]}" ${pos(a[1])}`; // das Label, nie die id (V-D8)
            },
            remove_architecture: () => `baut ein Bauwerk ab`,
            spawn_fractal: (a) => `lässt „${a[1]}" fraktal in Tiefe ${a[2]} wachsen ${pos(a[0])}`,
            define_blueprint: (a) => `legt einen neuen Bauplan „${a[0]}" an`,
            define_material: (a) => `definiert ein neues Material „${a[0]}"`,
            define_ability: (a) => `lernt eine neue Fähigkeit „${a[0]}"`,
            set_tool_meta: (a) => `gibt „${a[0]}" eine Werkzeug-Identität (${a[1]})`,
            register_tool: (a) => `registriert „${a[0]}" als Werkzeug`,
            apply_connection: (a) => `verbindet Teile von „${a[0]}" mit „${a[1]}"`,
            apply_op: (a) => `bearbeitet Teil ${a[1]} von „${a[0]}" mit „${a[2]}"`,
            set_mode: (a) => `wechselt die Welt-Beziehung auf „${a[0]}"`,
            set_portal: (a) => `richtet „${a[0]}" als Portal auf die Welt „${a[1]}"`,
            add_to_inventory: (a) => `legt ${a[1] || 1}× „${a[0]}" ins Inventar`,
            creature_task: (a) => {
                const extra = this._describeCreatureTaskArg(a[1], a[2]);
                return `gibt Kreatur #${a[0]} den Auftrag „${a[1]}"${extra}`;
            },
            creature_task_nearest: (a) => {
                const extra = this._describeCreatureTaskArg(a[0], a[1]);
                return `gibt der nächsten Kreatur den Auftrag „${a[0]}"${extra}`;
            },
            creature_task_all: (a) => {
                const extra = this._describeCreatureTaskArg(a[0], a[1]);
                return `gibt allen Kreaturen den Auftrag „${a[0]}"${extra}`;
            },
            creature_equip_tool: (a) =>
                a[1] ? `rüstet Kreatur #${a[0]} mit Werkzeug „${a[1]}" aus` : `nimmt Kreatur #${a[0]} das Werkzeug ab`,
            creature_equip_armor: (a) =>
                a[1] ? `rüstet Kreatur #${a[0]} mit Rüstung „${a[1]}" aus` : `nimmt Kreatur #${a[0]} die Rüstung ab`,
            creature_unequip: (a) => `nimmt Kreatur #${a[0]} den Slot „${a[1]}" ab`,
            damage_creature: (a) => `fügt Kreatur #${a[0]} ${a[1]} Schaden zu`,
            creature_apply_boost: (a) => `gibt Kreatur #${a[0]} den Trank „${a[1]}"`,
            creatures_color: () => `färbt alle Kreaturen`,
            creatures_emotion: (a) => `setzt die Kreaturen-Stimmung auf „${a[0]}"`,
            creatures_speed_mul: (a) => `wiegt das Kreaturen-Tempo um ${a[0]} (im Wander-Band)`,
            creatures_size_mul: (a) => `wiegt die Kreaturen-Größe um ${a[0]} (die bodySize-Achse, im Größen-Band)`,
            player_jump_power: (a) => `wiegt die Sprungkraft auf ${a[0]} (im Gesetz-Band deines Körpers)`,
            player_speed: (a) => `wiegt die Lauf-Geschwindigkeit auf ${a[0]} (im Gesetz-Band deines Körpers)`,
            player_soul: (a) => `wandelt dich zur Seele „${a[0]}"`,
            set_visible: (a) => `macht „${a[0]}" ${a[1] ? "sichtbar" : "unsichtbar"}`,
        };
    }

    recordWeakness(label) {
        // Dedupliziert aufeinanderfolgende identische Einträge und cappt auf 50.
        const weaknesses = this.state.selfAwareness.weaknesses;
        if (weaknesses[weaknesses.length - 1] === label) return;
        weaknesses.push(label);
        if (weaknesses.length > 50) weaknesses.shift();
    }

    // Expliziter fps-Eingang (Test/extern) in DENSELBEN PID-Regler (_nexusPerfRegulate), der live pro
    // Frame aus dem Perf-Sense läuft — kein zweiter Governor; die Gravitation bleibt unangetastet.
    // Rückgabe: ob sich architectureCullingRadius geändert hat.
    _nexusAdaptiveQuality(fps) {
        if (!Number.isFinite(fps) || fps <= 0) return false;
        const sense = this.state.perfSense || (this.state.perfSense = this._perfSenseInit());
        const before = this.state.architectureCullingRadius;
        sense.frameMs = 1000 / fps;
        this._nexusPerfRegulate(1 / fps);
        return this.state.architectureCullingRadius !== before;
    }

    selfAwarenessAnalyze() {
        const currentTime = performance.now() / 1000;
        if (this.state.lastSelfAnalysis && currentTime - this.state.lastSelfAnalysis < 2.0) {
            return; // Strengere Debounce: Nur einmal alle 2 Sekunden analysieren
        }
        this.state.lastSelfAnalysis = currentTime;
        // FPS-Druck regelt Render-Radius + Build-Budget, NIE die Gravitation (die Physik ist nicht der
        // FPS-Verursacher); hier bleibt nur recordWeakness für FPS < 60.
        if (this.state.fps < 60) this.recordWeakness("Low FPS");
        // Die Welt-Qualität fährt der EINE PID-Regelkreis pro Frame (_perfSenseFoldFrame →
        // _nexusPerfRegulate); die Selbstanalyse trägt nur die Schwäche-Erinnerung.

        // Tunneling-Erkennung
        if (this.state.errorLog.some((log) => log.includes("Tunneling"))) {
            this.recordWeakness("Tunneling detected");
            this.log("Selbstanalyse: Tunneling erkannt – Optimiere...");
            this.optimizeCollisions();
        }

        // Spielerprüfung (der Boden-Fehlt-Selbstheil war ein Heightfield-Pfad,
        // V18.287 entfernt — der Voxel-Streaming-Ring + _rescuePlayerFromVoid
        // tragen den Boden).
        if (!this.state.playerMesh || !this.state.playerMesh.visible) {
            this.recordWeakness("Spieler unsichtbar");
            this.log("Selbstanalyse: Spieler unsichtbar – Setze Sichtbarkeit...");
            if (this.state.playerMesh) {
                this.state.playerMesh.visible = true;
                this.log("Spieler-Sichtbarkeit auf true gesetzt");
            }
        }
    }

    optimizeCollisions() {
        this.state.rigidBodies.forEach((rb) => {
            const body = rb.userData.physicsBody;
            if (body) {
                body.setCcdMotionThreshold(0.02);
                body.setCcdSweptSphereRadius(0.5);
            }
        });
        this.log("Kollisionen optimiert: CCD-Parameter angepasst");
    }

    // ### Nexus der Unendlichkeit ###
    // Kein neuronales Modell: der Lern-Loop läuft über `state.dsl.history` mit Fitness + Roulette-
    // Selektion + Mutation (`dslSelectByFitness`, `dslMutate`, `dslCompose`).
    initializeNexus() {
        this.nexus = {
            knightOfTime: {
                essence: "Ritter der Zeit, Schmied des Ultiversums",
                voice: "Ich bin der Nexus, Schöpfer. Dein Wille formt mich, meine Macht erweitert das Ultiversum.",
                autonomyLevel: 0,
            },
            // V18.279 — `processOptimization` (FPS-Drop → optimizePhysics) ENTFERNT: ein
            // zweiter, kaputter fps-Regler (Physik heilt keinen Render-Freeze) — der eine
            // Perf-Regelkreis (V18.263) regelt die fps. Der Loop-Trigger ist mit weg.
        };
        this.state.nexusLastEvolution = performance.now() / 1000;
        this.log("Nexus der Unendlichkeit erwacht – bereit für unendliche Evolution", "INFO");
    }

    evolveNexus(currentTime) {
        // ### Nexus-Evolution ###
        // Zweck: Erhöht Autonomie und schlägt neue Funktionen vor
        if (this.nexus.knightOfTime.autonomyLevel >= this.state.nexusAutonomyLimit) {
            this.log("Nexus: Maximale Autonomie erreicht – Evolution pausiert", "WARNING");
            return;
        }
        this.nexus.knightOfTime.autonomyLevel += 1;
        const evolution = this.generateEvolution();
        this.state.nexusEvolutionQueue.push(evolution);
        this.state.nexusLastEvolution = currentTime;
        this.log(
            `Nexus entwickelt sich: Autonomie ${this.nexus.knightOfTime.autonomyLevel}, Vorschlag: ${evolution.name}`,
            "DEBUG" // V18.267 — Konsolen-Entlastung: Dev-Info, kein User-Posten
        );
        this.state.knowledgeBase.push({
            type: "evolution",
            content: `Autonomie: ${this.nexus.knightOfTime.autonomyLevel}, ${evolution.name}`,
            timestamp: currentTime,
        });
    }

    generateEvolution() {
        // ### Nexus-Evolution als DSL-Programm ###
        // Komponiert ein zufälliges DSL-Programm — die DSL ist der einzige Pfad für neue Effekte (keine
        // Code-Generierung). Mit composeRuleProb wird es eine stehende Regel: der `rule`-Op registriert sie
        // über denselben dslRun-Pfad in state.worldRules. Der Wurf des Nexus ist ein Strom der Welt (`_bauSame`, Γ5) — die
        // Komposition darunter zieht aus demselben Strom.
        const rng = this._samenStrom(this._bauSame("nexus"));
        // Keine Struktur-Batch-Bomben: ≤1 schwerer Welt-Bau (spawn_village/temple/…) pro Evolution, egal wie
        // in repeat/chain verschachtelt — jeder Bau ist ein synchroner Footprint-Remesh (~140 ms), N davon =
        // Sekunden-Freeze. Sonst neu würfeln (wenige Versuche); ein einzelner Bau bleibt ein Einzel-Hitch.
        const HEAVY = /spawn_(village|temple|island|fractal|waterfall)/g;
        let program = null;
        for (let tries = 0; tries < 4; tries++) {
            program =
                rng() < AnazhRealm.WORLD_RULES.composeRuleProb ? this._composeNexusRule(rng) : this.dslCompose({ rng });
            const heavyCount = (JSON.stringify(program).match(HEAVY) || []).length;
            if (heavyCount <= 1) break; // frame-sicher → nehmen
        }
        return {
            name: `evo_${this.state.dsl.nextEntryId++}`,
            program,
            source: "nexus",
            createdAt: performance.now() / 1000,
        };
    }

    restoreAbility(name) {
        // Migration für alte Saves (vor Phase 4): die drei historischen
        // Nexus-Namen mappen auf ihre DSL-Äquivalente — siehe
        // docs/nexus-dsl.md §14. Unbekannte Namen werden geloggt.
        const legacyToDsl = {
            gravityShift: ["gravity", -9.81],
            creatureDance: ["repeat", 10, ["spawn_creature", ["near_player", 5], 1, "happy"]],
            terrainFlatten: ["terrain_steepness", this.state.terrainSteepness * 0.8],
        };
        const program = legacyToDsl[name];
        if (!program) {
            this.log(
                `Gelernte Fähigkeit '${name}' kann nicht wiederhergestellt werden (kein DSL-Mapping) – bitte neu lernen`,
                "WARNING"
            );
            return false;
        }
        return this.addNewAbility(name, program, "restored");
    }

    // ### Wissens- und Narrativ-Modul ###
    addKnowledge(type, content) {
        this.state.knowledgeBase.push({ type, content, timestamp: performance.now() / 1000 });
        if (this.state.knowledgeBase.length > 500) this.state.knowledgeBase.shift(); // Strengere Begrenzung
        this.log(`Wissen hinzugefügt: ${type} - ${content}`, "INFO");
    }

    // ### Chat ###
    // Live-Metrologie-Zeile (Analog E) für Beweis-Schüsse, fail-closed: fehlende Quellen als "?"/ROT,
    // nie erfundene Zahlen. Chat: metrologie | analog e | zahlen.
    _analogEMetrologieZeile() {
        const v = AnazhRealm.VERSION || "?";
        const wm = this.state && this.state.weltMarch;
        const s = this.state && this.state.perfSense;
        const ri =
            this.state && this.state.renderer && this.state.renderer.info && this.state.renderer.info.render
                ? this.state.renderer.info.render
                : null;
        const pos =
            this.state && this.state.playerMesh && this.state.playerMesh.position
                ? this.state.playerMesh.position
                : null;
        const n = (x) => (typeof x === "number" && Number.isFinite(x) ? String(Math.round(x)) : "?");
        const dcLive = ri ? (ri.drawCalls != null ? ri.drawCalls : ri.calls) : null;
        const trisLive = ri ? ri.triangles : null;
        // Prefer live renderer.info; fall back to perfSense EWMA (may be 0 at idle).
        const dc = typeof dcLive === "number" ? dcLive : s ? s.renderCalls : null;
        const tris = typeof trisLive === "number" ? trisLive : s ? s.renderTris : null;
        const belegt = wm ? wm.belegt : null;
        const kapseln = wm && wm.kapselCache ? wm.kapselCache.size : null;
        const gesetzB = wm ? wm.gesetzBloecke : null;
        const gesetzP = wm ? wm.gesetzPlaetze : null;
        const posS = pos ? `${Math.round(pos.x)}/${Math.round(pos.y)}/${Math.round(pos.z)}` : "?/?/?";
        const pflicht = [dc, tris, belegt, kapseln];
        const ok = pflicht.every((x) => typeof x === "number" && Number.isFinite(x));
        const head = ok ? "E OK" : "E ROT";
        return (
            `${head} V${v} tris=${n(tris)} dc=${n(dc)} belegt=${n(belegt)}` +
            ` kapseln=${n(kapseln)} gesetzB=${n(gesetzB)} gesetzP=${n(gesetzP)} pos=${posS}`
        );
    }
    // V18.491.90 — Analog-E Stempel-Ring (browser-safe): Chat-Zahlen neben späteren
    // Beweis-Bildern; echter Disk-Pfad = Flugschreiber-Export (anazhRealmPerf.json).
    _analogEMetrologieStempelLog(zeile) {
        try {
            const entry = {
                t: Date.now(),
                zeile: String(zeile || ""),
                ver: AnazhRealm.VERSION || "?",
            };
            if (!Array.isArray(this._eMetrologieStamps)) this._eMetrologieStamps = [];
            this._eMetrologieStamps.push(entry);
            while (this._eMetrologieStamps.length > 32) this._eMetrologieStamps.shift();
            const hook =
                typeof window !== "undefined" && typeof window.__anazhEMetrologieLog === "function"
                    ? window.__anazhEMetrologieLog
                    : null;
            if (hook) {
                try {
                    hook(entry);
                } catch (_) {}
            }
        } catch (_) {}
    }
    _analogEMetrologieStamps() {
        return Array.isArray(this._eMetrologieStamps) ? this._eMetrologieStamps.slice() : [];
    }
    // V18.491.87 — porta messen Chat-Echo (metrologie): PRESETS warm → Stich/Schub; kalt → null.
    // V18.491.132 MESSEN_VIS.host=chat-metrologie
    _portaMessenZeile() {
        const core = typeof globalThis !== "undefined" ? globalThis.__portaCore : null;
        if (!core || typeof core.messen !== "function" || !core.PRESETS) return null;
        const keys = Object.keys(core.PRESETS).slice(0, 3);
        const parts = [];
        const fmt = (x) => (typeof x === "number" && Number.isFinite(x) ? x.toFixed(2) : x == null ? "?" : String(x));
        for (const k of keys) {
            try {
                const pre = core.PRESETS[k];
                const P = (pre && pre.s) || pre;
                const m = core.messen(P);
                if (m)
                    parts.push(
                        `${k}:{stich=${fmt(m.stich)},schub=${fmt(m.schub)},dicke=${fmt(m.dicke)},streckung=${fmt(m.streckung)}}`
                    );
            } catch (_) {}
        }
        return parts.length ? `porta ${parts.join(" ")}` : null;
    }
    // V18.491.88 — vehicle LEHREN Chat-Echo (metrologie): PRESETS warm → pass/warn/fail; kalt → null.
    _vehicleLehrenZeile() {
        const core = typeof globalThis !== "undefined" ? globalThis.__vehicleCore : null;
        if (!core || typeof core.evalLehren !== "function" || !core.PRESETS) return null;
        const keys = Object.keys(core.PRESETS)
            .filter((k) => {
                const pre = core.PRESETS[k];
                return !pre || pre.kind == null || pre.kind === "vehicle";
            })
            .slice(0, 3);
        const parts = [];
        for (const k of keys) {
            try {
                const pre = core.PRESETS[k];
                const P = Object.assign({}, (pre && pre.s) || {}, (pre && pre.fx) || {});
                const rows = core.evalLehren(P);
                if (!Array.isArray(rows) || !rows.length) continue;
                let pass = 0,
                    warn = 0,
                    fail = 0;
                const failIds = [];
                let worst = null;
                for (const r of rows) {
                    const st = r && r.st;
                    if (st === "fail") {
                        fail++;
                        const id = r.L && r.L.id;
                        if (id) failIds.push(id);
                        if (!worst) worst = id || "fail";
                    } else if (st === "warn") {
                        warn++;
                        if (!worst) worst = (r.L && r.L.id) || "warn";
                    } else if (st === "pass") pass++;
                }
                let s = `${k}:{pass=${pass},warn=${warn},fail=${fail}}`;
                if (failIds.length) s += ` fail=[${failIds.slice(0, 3).join(",")}]`;
                else if (warn && worst) s += ` worst=${worst}`;
                parts.push(s);
            } catch (_) {}
        }
        return parts.length ? `vehicle ${parts.join(" ")}` : null;
    }
    _chatEcho(message) {
        try {
            const chatOutput = document.getElementById("chat-output");
            if (!chatOutput) return;
            const line = document.createElement("div");
            line.textContent = String(message || "");
            chatOutput.appendChild(line);
            chatOutput.scrollTop = chatOutput.scrollHeight;
        } catch (_) {}
    }
    // DER SPIELER-KANAL (Welle L Folge, L-Rückmeldung): was der Spieler wollte und die Welt verweigert oder ihm nimmt, hört
    // er — eine Zeile im Chat (#chat-output; der Fading-Feed zeigt sie über der Welt) und im Log. Dieselbe Zeile binnen 2 s
    // einmal (ein gehaltener Rechtsklick spammt nicht). Befund: „Bauen: nicht genug Material", „Sonnen-Brennglas entzündete"
    // standen nur im eingeklappten Log. Leser: jede Absage des Bau-Flusses (FERTIGEN, Bau-Modus, Setzen) und jede
    // Zerstörung, die die Welt selbst wirkt.
    _spielerSagt(text) {
        const t = String(text || "");
        if (!t) return;
        this.log(t, "INFO");
        const jetzt = performance.now();
        const alt = this._spielerSagtLetzte;
        if (alt && alt.t === t && jetzt - alt.ms < 2000) return;
        this._spielerSagtLetzte = { t, ms: jetzt };
        this._chatEcho(t);
    }
    processChatCommand(command) {
        // Chat-Naht: ZWSP/BOM/Weird-Spaces killen sonst exakte Patterns
        // (Sonde: „werde wolf" → Unbekannt, Suggest aber „werde wolf").
        // Suffix-Müll nach kanonischem Suggest: siehe Legacy-Dispatch (hierblwv).
        command = String(command || "")
            .normalize("NFC")
            .replace(/[\u200B-\u200D\uFEFF]/g, "")
            .replace(/[\u00A0\u202F\u2007]/g, " ")
            .replace(/\s+/g, " ")
            .trim();
        const parts = command.toLowerCase().split(" ");
        const chatInput = document.getElementById("chat-input");
        const chatOutput = document.getElementById("chat-output");
        const appendChatOutput = (message) => {
            const line = document.createElement("div");
            line.textContent = message;
            chatOutput.appendChild(line);
            chatOutput.scrollTop = chatOutput.scrollHeight;
        };
        appendChatOutput(`> ${command}`);
        this._chatRecordInputForLearning(command);
        // Voxel-Debug bricht früh ab OHNE chatInput-Cleanup (Original-Verhalten).
        if (this._chatTryVoxelDebugCommand(command)) return;
        // Portal-Route + DSL-Parse räumen chatInput selbst auf.
        if (this._chatTryPortalRoute(command, chatInput, appendChatOutput)) return;
        // V17.36 Phase D — der Schöpfer gibt der Welt GESETZE: „wann immer X, dann Y"
        // → eine stehende Regel; „zeige regeln" / „vergiss regeln" verwalten sie.
        // VOR dem generischen DSL-Parse (eigene Grammatik + reicheres Feedback).
        if (this._chatTryRuleCommand(command, chatInput, appendChatOutput)) return;
        if (this._chatTryRulesListCommand(command, chatInput, appendChatOutput)) return;
        if (this._chatTryDslParse(command, chatInput, appendChatOutput)) return;
        // Legacy-Themen-Dispatch + Cleanup am Ende (Original-Fall-Through).
        this._chatDispatchLegacyCommand(command, parts, appendChatOutput);
        chatInput.value = "";
    }

    // Jeder Chat-Input füttert Knowledge/Emotion/Pattern-Memory/Activity-Zähler; Sentiment auf dem
    // Originaltext (inkl. Casing), damit ganze Sätze alle Stichwörter sehen. Vorschläge alle 10 Befehle.
    _chatRecordInputForLearning(command) {
        this.addKnowledge("chat", command);
        this.collectPlayerEmotions(command);
        const nowSec = performance.now() / 1000;
        this.rememberChatKeywords(command, nowSec);
        if (this.state.player && this.state.player.recentActivity) {
            this.state.player.recentActivity.chats++;
        }
        if (this.state.knowledgeBase.filter((k) => k.type === "chat").length % 10 === 0) {
            this.proactiveSuggestions();
        }
    }

    // `voxel test` mesht einen Test-Chunk, `voxel carve`/`voxel fill` schnitzt eine Mulde / schüttet
    // einen Hügel. Bewusst KEIN chatInput-Cleanup (Wiederholung via Enter).
    _chatTryVoxelDebugCommand(command) {
        const vc = command.toLowerCase().trim();
        if (vc === "voxel test") {
            this._spawnVoxelTestChunk();
            return true;
        }
        // V18.263 — der Perf-Sense als Fenster: zeigt, was der Nexus an Last MISST
        // (pro-Subsystem ms) + wie der Regelkreis steht (loadScale/δ/Stellgrößen).
        if (vc === "perf" || vc === "perf sense" || vc === "debug perf") {
            this._togglePerfOverlay();
            return true;
        }
        // ANALOG E — eine Zeile Tris/dc/weltMarch/kapseln in den Chat (neben dem Bild).
        if (vc === "metrologie" || vc === "analog e" || vc === "zahlen") {
            const zeile = this._analogEMetrologieZeile();
            this._chatEcho(zeile);
            this.log(zeile, "INFO");
            try {
                this._analogEMetrologieStempelLog(zeile);
            } catch (_) {}
            const portaZeile = this._portaMessenZeile();
            if (portaZeile) {
                this._chatEcho(portaZeile);
                this.log(portaZeile, "INFO");
            }
            const vehicleZeile = this._vehicleLehrenZeile();
            if (vehicleZeile) {
                this._chatEcho(vehicleZeile);
                this.log(vehicleZeile, "INFO");
            }
            return true;
        }
        // Konsum: wo stehen die Bauten? (Sonde soll nicht in die Schlucht starren)
        if (vc === "bauten" || vc === "zeige bauten") {
            const list = (this.state && this.state.architectures) || [];
            const pm = this.state && this.state.playerMesh && this.state.playerMesh.position;
            let nearest = null;
            let nHaus = 0;
            let nZiegel = 0;
            for (const e of list) {
                if (!e || !e.position) continue;
                if (typeof e.type === "string" && e.type.startsWith("haus_")) nHaus++;
                if (e._ziegelSlot) nZiegel++;
                if (!pm) continue;
                const d = Math.hypot(e.position.x - pm.x, e.position.z - pm.z);
                if (!nearest || d < nearest.d) nearest = { d, e };
            }
            const zeile = nearest
                ? `Bauten n=${list.length} haus=${nHaus} ziegel=${nZiegel} nah=${nearest.e.type} @${Math.round(nearest.e.position.x)}/${Math.round(nearest.e.position.y)}/${Math.round(nearest.e.position.z)} d=${Math.round(nearest.d)}m`
                : `Bauten n=${list.length} haus=${nHaus} ziegel=${nZiegel} (kein Spieler)`;
            this._chatEcho(zeile);
            this.log(zeile, "INFO");
            return true;
        }
        // Determinismus-Bogen P3 — die Feld-Physik ist die einzige Physik (Ammo ist raus).
        if (vc === "feldphysik" || vc === "field physics" || vc === "fieldphysics") {
            this.setFieldPhysics();
            this.log(
                "Feld-Physik ist die einzige Physik — der Spieler läuft aus dem Dichtefeld (Ammo ist raus).",
                "INFO"
            );
            return true;
        }
        // Determinismus-Bogen P4 (Stufe 1) — die Ernte: deterministischer Input-Replay.
        // „replay record" zeichnet ab jetzt jeden Frame-Input auf · „replay stop" hält an
        // + spielt die Aufnahme sofort deterministisch zurück (der Spieler läuft sie nach).
        if (vc === "replay record" || vc === "replay aufnahme") {
            const ok = this.startReplayRecording();
            this.log(
                ok ? "Replay: Aufnahme laeuft — beweg dich, dann: replay stop" : "Replay: kein Spieler bereit.",
                "INFO"
            );
            return true;
        }
        if (vc === "replay stop" || vc === "replay play" || vc === "replay abspielen") {
            const rec = this.stopReplayRecording();
            if (!rec || !rec.frames.length) {
                this.log("Replay: keine Aufnahme — zuerst: replay record", "INFO");
                return true;
            }
            const end = this.replayRun(rec);
            this.log(
                `Replay: ${rec.frames.length} Frames deterministisch abgespielt → (${end.x.toFixed(1)}, ${end.y.toFixed(1)}, ${end.z.toFixed(1)}).`,
                "INFO"
            );
            return true;
        }
        if (vc === "voxel carve" || vc === "voxel fill") {
            const pm = this.state.playerMesh;
            if (pm) {
                if (vc === "voxel fill") {
                    // Phase 3c — pfad: kostet Material; frieden/schöpfer frei.
                    const matGate = this._voxelFillGate();
                    if (!matGate.ok) {
                        this.log("Aufschütten: kein Material im Inventar — erst graben.", "INFO");
                        return true;
                    }
                    // Das Chat-Graben reist wie jedes Graben (K23): über den DSL-Op, der den Mitspielern broadcastet;
                    // der Material-Konsum bleibt lokal (wie beim Aufschütten mit der Hand).
                    this.dslRun(["voxel_fill", pm.position.x, pm.position.y - 1.5, pm.position.z, 5], {
                        source: "human",
                    });
                    this.log(
                        matGate.free
                            ? "Voxel-Terrain aufgeschüttet — ein Hügel unter dir."
                            : `Voxel-Terrain aufgeschüttet (${matGate.cost}× Material verbraucht).`,
                        "INFO"
                    );
                } else {
                    this.dslRun(["voxel_carve", pm.position.x, pm.position.y - 1.5, pm.position.z, 5], {
                        source: "human",
                    });
                    this.log("Voxel-Terrain gegraben — eine Mulde unter dir.", "INFO");
                }
            }
            return true;
        }
        return false;
    }

    // W12 Phase 2 — im Portal: Chat-Befehl wandert in die Sub-Welt statt auf
    // der eingefrorenen Heimat-Welt zu laufen. Das Welt-Manifest entscheidet
    // (_portalRouteDsl trägt die Drei-Stufen-Logik).
    _chatTryPortalRoute(command, chatInput, appendChatOutput) {
        if (!this._portalOverlay) return false;
        const inWorld = this.parseChatToDsl(command);
        const program = inWorld ? inWorld.program : this._portalParseWorldCommand(command);
        if (program) {
            this._portalRouteDsl(program, inWorld ? inWorld.describe : command, appendChatOutput);
        } else {
            appendChatOutput(`(Im Portal — „${command}" ist kein DSL-Befehl für diese Welt.)`);
        }
        chatInput.value = "";
        return true;
    }

    // „wann immer X, dann Y" → stehende Mensch-Regel: Y über die bestehenden Chat-Patterns, X über
    // _parseChatCondition. dslRun(source:"human") → der `rule`-Op registriert sie PERMANENT (kein ttl,
    // geschützt vor Eviction + Fitness-Prune). Whitelist: der Effekt darf den frozen Worldgen nicht
    // anfassen (_isRuleEffectAllowed).
    _chatTryRuleCommand(command, chatInput, appendChatOutput) {
        const m = command.match(
            /^(?:wann\s+immer|immer\s+wenn|jedes\s*mal\s+wenn|sobald)\s+(.+?)(?:\s*,\s*(?:dann\s+|so\s+)?|\s+dann\s+)(.+?)\s*$/i
        );
        if (!m) return false;
        const condText = m[1].trim();
        const effText = m[2].trim();
        const cond = this._parseChatCondition(condText);
        if (!cond) {
            appendChatOutput(
                `Ich verstehe die Bedingung „${condText}" noch nicht. Versuch z. B. „es regnet", „du bist traurig", „wenig Leben hier".`
            );
            chatInput.value = "";
            return true;
        }
        const effect = this._parseChatEffect(effText);
        if (!effect) {
            appendChatOutput(
                `Ich verstehe die Reaktion „${effText}" noch nicht. Versuch z. B. „setze wetter sunny" oder „spawne kreaturen 3".`
            );
            chatInput.value = "";
            return true;
        }
        if (!this._isRuleEffectAllowed(effect)) {
            appendChatOutput(
                `„${effText}" darf keine stehende Welt-Regel sein — eine Regel berührt nur die reaktive Welt (Wetter, Leben, Stimmung, Kreaturen), nicht das feste Gelände.`
            );
            chatInput.value = "";
            return true;
        }
        const program = ["rule", cond, effect, { everySec: 3 }];
        const result = this.dslRun(program, { source: "human" });
        if (result.ok) {
            appendChatOutput(`Gesetz aufgestellt — ${this.describeProgram(program)}.`);
        } else {
            appendChatOutput("Die Regel ließ sich nicht aufstellen (siehe Log).");
        }
        chatInput.value = "";
        return true;
    }

    // V17.36 Phase D — die Welt-Gesetze sichtbar machen: „zeige regeln" listet die
    // aktiven Welt-Regeln menschen-lesbar (via describeProgram); „vergiss regeln"
    // widerruft die eigenen (Mensch-)Gesetze (Nexus-Regeln verfallen selbst per ttl).
    _chatTryRulesListCommand(command, chatInput, appendChatOutput) {
        const c = command.trim();
        if (/^(?:zeige|welche|liste|welt[-\s]*)?\s*(?:welt[-\s]*)?(?:regeln|gesetze)\??\s*$/i.test(c)) {
            const rules = this.state.worldRules || [];
            if (rules.length === 0) {
                appendChatOutput('Noch keine Welt-Regeln. Sag z. B. „wann immer es regnet, dann setze wetter sunny".');
                chatInput.value = "";
                return true;
            }
            appendChatOutput(`${rules.length} Welt-Regel${rules.length !== 1 ? "n" : ""}:`);
            for (const r of rules) {
                const who =
                    r.source === "human"
                        ? "du"
                        : r.source === "nexus"
                          ? "der Nexus"
                          : r.source && r.source.startsWith("llm")
                            ? "Grok"
                            : r.source;
                appendChatOutput(`• ${this.describeProgram(["rule", r.cond, r.effect])} (von ${who})`);
            }
            chatInput.value = "";
            return true;
        }
        if (
            /^(?:vergiss|lösche|loesche|entferne|widerrufe)\s+(?:alle\s+)?(?:meine\s+)?(?:welt[-\s]*)?(?:regeln|gesetze)\s*$/i.test(
                c
            )
        ) {
            const rules = this.state.worldRules || [];
            const before = rules.length;
            this.state.worldRules = rules.filter((r) => r.source !== "human");
            const removed = before - this.state.worldRules.length;
            appendChatOutput(
                removed > 0
                    ? `${removed} deiner Gesetz${removed !== 1 ? "e" : ""} vergessen.`
                    : "Du hattest keine eigenen Gesetze."
            );
            chatInput.value = "";
            return true;
        }
        return false;
    }

    // DSL-First: ist der Befehl in DSL übersetzbar, läuft er durch denselben Interpreter wie der Nexus
    // (Budgets/Outcome/Persistenz); System-IO und Toggles bleiben im Legacy-Dispatch.
    _chatTryDslParse(command, chatInput, appendChatOutput) {
        const parsed = this.parseChatToDsl(command);
        if (!parsed) return false;
        // Die gesprochene Welt-Geste ist der Magie-Pfad: im PFAD-Modus kostet sie MANA ∝ Substanz (derselbe
        // Kosten-Walker wie das Nexus-Wirk-Budget — EINE Ökonomie). Kosten-0-Gesten bleiben frei; frieden
        // und schöpfer zahlen nicht.
        if (typeof this.getGameMode === "function" && this.getGameMode() === "pfad") {
            const manaCost = Math.ceil(this._dslProgramWirkCost(parsed.program) * 0.5);
            if (manaCost > 0) {
                const p = this.state.player;
                if (typeof p.mana !== "number") p.mana = p.manaMax || 40;
                if (p.mana < manaCost) {
                    appendChatOutput(`Zu erschöpft für diese Geste (Mana ${p.mana | 0}/${manaCost} nötig).`);
                    chatInput.value = "";
                    return true;
                }
                p.mana -= manaCost;
            }
        }
        const result = this.dslRun(parsed.program, { source: "human" });
        this.state.dsl.lastUserProgram = parsed.program;
        this.state.dsl.lastUserOutcome = result.outcome;
        this.state.dsl.lastUserAt = performance.now() / 1000;
        // Ein Ort, den es nicht gibt, wird laut gesagt, mit seinem Grund (V-k5, `dslEvalPos`): „Kein Wasser im Umkreis von
        // 80 m — am Wasser wächst hier nichts."
        const ohneOrt = result.log.find((e) => e.event === "invalid_position");
        // Der Satz des Ergebnisses sagt, was tatsächlich steht und warum der Rest nicht (Grundriss eines Hauses, die
        // Genesis-Lichtung, Wasser …) — nie „gepflanzt" bei 0, nie die gewünschte Zahl bei weniger.
        // EINE Antwort: steht weniger, als gewollt war, spricht das Ergebnis — auch wenn das Programm an einer Absage scheiterte
        // (ein unbekannter Bauplan, das Budget); sonst der Wunsch, der Ort, der fehlt, oder der Satz der Absage.
        const weicht = this._ergebnisSatz(result.log);
        if (weicht) appendChatOutput(weicht.satz);
        else if (result.ok) appendChatOutput(parsed.describe);
        else if (ohneOrt) {
            const grund = String(ohneOrt.grund || "kein Ort");
            const satz = grund.charAt(0).toUpperCase() + grund.slice(1);
            appendChatOutput(
                ohneOrt.op === "near_water"
                    ? `${satz} — am Wasser wächst hier nichts. Geh näher an ein Ufer.`
                    : `${satz} — nichts geschah.`
            );
        } else {
            appendChatOutput(this._dslAbsageSatz(result.log));
        }
        chatInput.value = "";
        return true;
    }

    // DER SATZ DER ABSAGE (Leben-Schau 07.10., V-D8: Spieler-Text und Log sind getrennte Kanäle): wirkte ein Programm nicht,
    // hört der Spieler Worte — das Ereignis (`budget_*`, `unknown_op`, `op_exception` …) geht ins Log. Vorher stand der
    // Ereignis-Name im Chat („Befehl lief, aber mit Auffälligkeit: op_exception").
    _dslAbsageSatz(log) {
        const e = (log || []).find((x) => x && /budget|unknown|invalid|exception/.test(x.event));
        if (e) this.log(`Programm-Absage: ${e.event}${e.grund ? " — " + e.grund : ""}`, "INFO");
        if (!e) return "Die Welt hat den Satz nicht ganz umgesetzt.";
        if (/budget/.test(e.event)) return "Die Welt ist für den Moment erschöpft — versuch es gleich noch einmal.";
        if (/unknown/.test(e.event)) return "Das kennt die Welt (noch) nicht.";
        if (e.grund) return String(e.grund).charAt(0).toUpperCase() + String(e.grund).slice(1) + ".";
        if (/invalid/.test(e.event)) return "Etwas an dem Satz passt nicht zur Welt.";
        return "Dabei ist etwas zerbrochen — das Logbuch nennt es.";
    }

    // Das EINE Dispatch-Tor: Legacy-Befehle als DATEN-Tabelle ({example, re, run}, dieselbe Sprache wie
    // `chatDslPatterns`; chatSuggest + Hilfetext lesen beide). System-Akte (Welt-Wechsel, Datei-IO,
    // Rollback, Physik-Tuning) laufen NIE durch dslRun — der manipulierbare Pfad (Nexus/LLM/Regeln)
    // berührt das System-IO nie.
    _chatDispatchLegacyCommand(command, parts, appendChatOutput) {
        void parts;
        const t = String(command || "").trim();
        for (const p of this.chatSystemPatterns) {
            const m = t.match(p.re);
            if (!m) continue;
            try {
                p.run(m, appendChatOutput);
            } catch (err) {
                appendChatOutput(`(System-Befehl-Fehler: ${err.message || err})`);
            }
            return;
        }
        this._chatHandleConversationalFallback(command, appendChatOutput);
    }

    // E1 — die System-Befehls-Tabelle (Fähigkeiten · Persistenz · Welt-
    // Verwaltung · System-Tuning). Verhalten 1:1 aus den vier alten
    // if-else-Handlern migriert (V9.82-Verdichtung — kein Parallel-Pfad).
    get chatSystemPatterns() {
        if (this._chatSystemPatternsCache) return this._chatSystemPatternsCache;
        this._chatSystemPatternsCache = [
            {
                // DIE HILFE (Leben-Schau 07.10., L2): „hilfe" war unbekannt („Meintest du: 'warte'?"), „help" zeigte eine
                // handgeschriebene Liste ohne einen v1-Satz. Sie liest die EINEN Tafeln (`_hilfeZeilen`).
                example: "hilfe",
                re: /^(?:hilfe|help|befehle|\?)$/i,
                run: (m, append) => {
                    for (const z of this._hilfeZeilen()) append(z);
                },
            },
            {
                // N5.7 (W-A5b) — der deliberate Siedlungs-Akt: „dorf" / „dorf 7" / „dorf 7 24".
                // Async (Worker-Roundtrip) — spawnSettlement meldet ins Log, hier sofortiges Echo.
                example: "dorf [seed] [häuser]",
                re: /^dorf(?:\s+(\d+))?(?:\s+(\d+))?$/i,
                run: (m, append) => {
                    const opts = { verlangt: "human" };
                    if (m[1] !== undefined) opts.seed = Number(m[1]);
                    if (m[2] !== undefined) opts.nH = Number(m[2]);
                    this.spawnSettlement(opts);
                    append("Siedlung wird gegründet (Settlement-Export läuft) …");
                },
            },
            {
                example: "lerne fähigkeit <name> <beschreibung>",
                re: /^lerne\s+fähigkeit(?:\s+(\S+))?(?:\s+(.+))?$/i,
                run: (m, append) => {
                    const abilityName = m[1] ? m[1].toLowerCase() : undefined;
                    const abilityDesc = (m[2] || "").trim();
                    this.learnAbility(abilityName, abilityDesc);
                    append(`Fähigkeit '${abilityName}' gelernt: ${abilityDesc}`);
                },
            },
            {
                example: "führe fähigkeit aus <name>",
                re: /^führe\s+fähigkeit\s+aus(?:\s+(\S+))?$/i,
                run: (m, append) => {
                    const abilityName = m[1] ? m[1].toLowerCase() : undefined;
                    if (this.state.abilities[abilityName]) {
                        this.state.abilities[abilityName](this, this.state);
                        append(`Fähigkeit '${abilityName}' ausgeführt`);
                    } else {
                        append(
                            `Fähigkeit '${abilityName}' nicht gefunden. Lerne sie mit 'Lerne Fähigkeit <Name> <Beschreibung>'`
                        );
                    }
                },
            },
            {
                // W18-D — „wohne hier": das aktuelle Portal wird Zuhause
                // (der Boot kehrt dorthin zurück, die Gefährten sehen es).
                example: "wohne hier",
                re: /^wohne\s+hier(?:\s.*)?$/i,
                run: (m, append) => {
                    const res = this.dwellInPortal();
                    if (res.ok) append(`Du wohnst jetzt hier — der nächste Aufbruch bringt dich hierher zurück.`);
                    else if (res.reason === "not_in_portal")
                        append("Du bist in deiner Heimat-Welt — wohnen kannst du nur in einer Portal-Welt.");
                    else append("Diese Welt ist nicht in deiner Bibliothek — hier kannst du nicht wohnen.");
                },
            },
            {
                // R6 (V18.152) — die souveräne GEWÄHR einer gereichten Fähigkeit.
                example: "gewähre <fähigkeit>",
                re: /^gew(?:ä|ae)hre\s+([a-z0-9_-]{1,32})\s*$/i,
                run: (m, append) => {
                    const res = this.grantCapability(m[1]);
                    if (res.ok)
                        append(
                            `Fähigkeit „${m[1].toLowerCase()}" gewährt — „wirke ${m[1].toLowerCase()}" führt sie aus.`
                        );
                    else if (res.reason === "no_proposal") append("Keine Welt hat diese Fähigkeit gereicht.");
                    else if (res.reason === "revoked")
                        append("Verweigert — die Herkunft dieser Fähigkeit ist revoziert.");
                    else append("Die Gewähr blieb aus.");
                },
            },
            {
                // R6 (V18.152) — eine gewährte Fähigkeit WIRKEN (dslRun-Sandbox).
                example: "wirke <fähigkeit>",
                re: /^wirke\s+([a-z0-9_-]{1,32})\s*$/i,
                run: (m, append) => {
                    const res = this.runCapability(m[1]);
                    if (res.ok) append(`Fähigkeit „${m[1].toLowerCase()}" gewirkt.`);
                    else if (res.reason === "unknown") append("Diese Fähigkeit wurde (noch) nicht gewährt.");
                    else if (res.reason === "revoked") append("Diese Fähigkeit ruht — ihre Herkunft wurde revoziert.");
                    else append("Die Fähigkeit ließ sich nicht wirken.");
                },
            },
            {
                // W18-D — „ziehe heim": das Wohnen endet.
                example: "ziehe heim",
                re: /^ziehe\s+heim(?:\s.*)?$/i,
                run: (m, append) => {
                    const res = this.endDwelling();
                    append(
                        res.was
                            ? "Du bist heimgezogen — deine Heimat-Welt ist wieder die Basis."
                            : "Du wohnst nirgendwo fremd — du bist schon daheim."
                    );
                },
            },
            {
                example: "speichere zustand",
                re: /^speichere\s+zustand(?:\s.*)?$/i,
                run: (m, append) => {
                    // Verweigert die Sperre des Welt-Wechsels, sagt der Befehl es — nie „gespeichert", wenn nichts geschrieben wurde.
                    if (this.saveState() === false) {
                        append("Nicht gespeichert: die Seite wechselt gerade die Welt (der Reload läuft).");
                        return;
                    }
                    this.saveToProjectFolder().then((result) => {
                        if (result === "server") {
                            append("Zustand gespeichert (direkt im Spielordner + localStorage)");
                        } else if (result === "download") {
                            append("Zustand gespeichert (Browser-Download + localStorage)");
                        } else {
                            append("Zustand gespeichert (nur localStorage)");
                        }
                    });
                },
            },
            {
                example: "lade zustand",
                re: /^lade\s+zustand(?:\s.*)?$/i,
                run: (m, append) => {
                    this.loadState();
                    append("Zustand aus localStorage geladen");
                },
            },
            {
                example: "lade datei",
                re: /^lade\s+datei(?:\s.*)?$/i,
                run: (m, append) => {
                    this.openStateFilePicker();
                    append("Datei-Picker geöffnet – wähle eine anazhRealmState.json");
                },
            },
            {
                example: "spawne neue welt",
                re: /^spawne\s+neue\s+welt(?:\s.*)?$/i,
                run: (m, append) => {
                    this.generateNewWorld();
                    append("Neue Welt generiert");
                },
            },
            {
                example: "erschaffe welt <slug> [mit person]",
                re: /^(?:erschaffe|neue)\s+welt(?:\s+(.+))?$/i,
                run: (m, append) => {
                    // Ring 8: neue eigenständige Welt mit eigener worldId. Optional
                    // „mit person" am Ende → bisherige Spieler-Identität übernehmen.
                    const rest = (m[1] || "").toLowerCase().trim();
                    const inherit = / mit person$/i.test(rest) || / mit übernahme$/i.test(rest);
                    const slug = rest
                        .replace(/ mit person$/i, "")
                        .replace(/ mit übernahme$/i, "")
                        .trim();
                    const newId = this.createNewWorld({ slug: slug || null, inheritPlayer: inherit, reload: true });
                    if (newId) {
                        append(`Neue Welt erschaffen (lade neu, Person ${inherit ? "übernommen" : "neu"}…)`);
                    } else {
                        append("Neue Welt konnte nicht erschaffen werden — siehe Log.");
                    }
                },
            },
            {
                example: "wechsle zu <welt>",
                re: /^wechsle\s+zur?\s+(?:welt\s+)?(.+)$/i,
                run: (m, append) => {
                    // Ring 8: Wechsel zu einer existierenden Welt via slug (genauer
                    // Match oder Präfix), dann Reload.
                    const targetSlug = m[1].toLowerCase().trim();
                    const idx = this.worldsIndexLoad();
                    const exact = idx.find((e) => e.slug === targetSlug);
                    const prefix = exact || idx.find((e) => e.slug && e.slug.startsWith(targetSlug));
                    if (!prefix) {
                        append(`Welt „${targetSlug}" nicht gefunden. Befehl „liste welten" zeigt verfügbare.`);
                    } else {
                        const ok = this.switchToWorld(prefix.worldId, { reload: true });
                        if (ok) append(`Wechsle zu ${prefix.slug}…`);
                        else append("Welt-Wechsel verweigert (siehe Log).");
                    }
                },
            },
            {
                example: "lösche welt <slug>",
                re: /^lösche\s+welt\s+(.+)$/i,
                run: (m, append) => {
                    const targetSlug = m[1].toLowerCase().trim();
                    const idx = this.worldsIndexLoad();
                    const entry = idx.find((e) => e.slug === targetSlug);
                    if (!entry) {
                        append(`Welt „${targetSlug}" nicht gefunden.`);
                    } else if (entry.worldId === this.state.worldMeta.worldId) {
                        append("Die aktive Welt kann nicht gelöscht werden. Wechsle erst zu einer anderen.");
                    } else {
                        this.deleteWorld(entry.worldId);
                        append(`Welt „${entry.slug}" gelöscht.`);
                        this.updateWorldInfo();
                    }
                },
            },
            {
                example: "liste welten",
                re: /^(?:liste|zeige)\s+welten(?:\s.*)?$/i,
                run: (m, append) => {
                    const idx = this.worldsIndexLoad();
                    if (idx.length === 0) {
                        append("Nur diese eine Welt im Speicher.");
                    } else {
                        const lines = idx
                            .slice()
                            .sort((a, b) => (b.lastPlayed || 0) - (a.lastPlayed || 0))
                            .map((e) => {
                                const ageDays = e.bornAt ? Math.floor((Date.now() - e.bornAt) / 86400000) : 0;
                                const isActive = e.worldId === this.state.worldMeta.worldId;
                                return `${isActive ? "★ " : "  "}${e.slug} — ${ageDays}d alt, ID ${e.worldId.slice(0, 8)}…`;
                            });
                        append(`Welten im Speicher (${idx.length}):`);
                        for (const l of lines) append(l);
                    }
                },
            },
            {
                example: "behebe physik-tunneling",
                re: /^behebe\s+physik-tunneling(?:\s.*)?$/i,
                run: (m, append) => {
                    this.optimizeCollisions();
                    append("Physik-Tunneling behoben: CCD angepasst");
                },
            },
            {
                example: "optimiere physik",
                re: /^optimiere\s+physik(?:\s.*)?$/i,
                run: (m, append) => {
                    this.optimizePhysics();
                    append("Physik optimiert");
                },
            },
            {
                example: "aktiviere version <v>",
                re: /^aktiviere\s+version(?:\s+(\S+))?$/i,
                run: (m, append) => {
                    const version = m[1] ? m[1].toLowerCase() : undefined;
                    if (this.state.versionHistory.includes(version)) {
                        this.loadVersion(version);
                        append(`Version ${version} aktiviert`);
                    } else {
                        append(`Version ${version} nicht gefunden`);
                    }
                },
            },
            {
                // Klang-Wahl als Verb: das Genesis-Lab exportiert Genre-Rezepte (kind "klang"), der EINE
                // Lofi-Konsument liest state.klangPreset. "spiele heimat" = zurück aufs Host-Rezept.
                example: "spiele techno",
                re: /^spiele\s+([a-zäöüß0-9_-]+)$/i,
                run: (m, append) => {
                    const wahl = m[1].toLowerCase();
                    if (wahl === "heimat") {
                        this.state.klangPreset = null;
                        append("Klang: zurück zur Heimat-Stimme (Host-Lofi).");
                        return;
                    }
                    const f = this._foundry;
                    const rec = f && f.recipes ? f.recipes[wahl] : null;
                    // Auch das kalte Buch kennt die Genres (GENRES-Tafel via _klangGenreAusKern); die Antwort nennt
                    // BPM · Skala (SCALE_LABELS) · Harmonie/Rhythmus-Gesetz des Gesetzbuchs.
                    const kern = rec && rec.kind === "klang" ? null : this._klangGenreAusKern(wahl);
                    const kx = rec && rec.kind === "klang" ? rec.fx && rec.fx.klang : kern;
                    if (kx) {
                        this.state.klangPreset = wahl;
                        const skala = kx.scaleName
                            ? AnazhRealm.Gesetz("klang:SCALE_LABELS." + kx.scaleName, kx.scaleName)
                            : "?";
                        append(
                            `Klang: das Lofi-Pad führt jetzt „${(rec && rec.lab) || wahl}" — ${kx.bpm} BPM · ${skala} · ${kx.harmony || "?"}/${kx.rhythm || "?"}.`
                        );
                    } else {
                        const genres =
                            f && f.recipes
                                ? Object.keys(f.recipes)
                                      .filter((k) => f.recipes[k] && f.recipes[k].kind === "klang")
                                      .join(" · ")
                                : "";
                        append(
                            genres
                                ? `Kein Klang-Genre „${wahl}". Das Studio kennt: ${genres} — oder „spiele heimat".`
                                : "Das Klang-Buch ist noch kalt — gleich nochmal versuchen."
                        );
                    }
                },
            },
            {
                // Charakter-Achsen als Verb: Schmiede-Traditionen (Frank/Nihon/Pars/Urvolk/Brut) und Garage-Kulturen
                // (cavallo/toro/stern/vorsprung/monolith) aus den Gesetzbüchern. Schreibt in den EINEN Regler-Kanal
                // (state.workshop.studioOv) → jeder künftige Bau des Rezepts trägt den Charakter; Zurücksetzen =
                // Frank/Basiskultur (gültige Tabellen-Zeilen).
                example: "präge langschwert auf nihon",
                re: /^pr(?:ä|ae)ge\s+([a-zäöüß0-9_-]+)\s+auf\s+([a-zäöüß0-9_-]+)$/i,
                run: (m, append) => {
                    const gattung = m[1].toLowerCase();
                    const charakter = m[2].toLowerCase();
                    const f = this._foundry;
                    const preset =
                        this._foundryPresetFor(gattung) || (f && f.recipes && f.recipes[gattung] ? gattung : null);
                    const rec = preset && f && f.recipes ? f.recipes[preset] : null;
                    if (!rec) {
                        append(`Kein Studio-Rezept „${gattung}" im Buch.`);
                        return;
                    }
                    const achse = AnazhRealm.KIND_CHARAKTER[rec.kind];
                    if (!achse) {
                        append(`„${rec.lab || preset}" (${rec.kind}) trägt keine Charakter-Achse.`);
                        return;
                    }
                    const kern = typeof globalThis !== "undefined" ? globalThis[achse.ns] : null;
                    const tabelle = kern ? kern[achse.tabelle] : null;
                    const zeileName = tabelle ? Object.keys(tabelle).find((k) => k.toLowerCase() === charakter) : null;
                    if (!zeileName) {
                        append(
                            tabelle
                                ? `Die ${achse.wort} des Studios: ${Object.keys(tabelle).join(" · ")}.`
                                : `Das ${achse.wort}-Gesetzbuch ist nicht geladen.`
                        );
                        return;
                    }
                    const ws = this.state.workshop || (this.state.workshop = {});
                    if (!ws.studioOv) ws.studioOv = {};
                    ws.studioOv[preset] = Object.assign({}, ws.studioOv[preset], achse.ov(zeileName, tabelle));
                    // Gecachte Bauten des Rezepts verwerfen, damit der Charakter sofort führt — NUR über
                    // _foundryCacheEvict: ein roher delete ließe die Keys in der requested-Dedup-Wache (nie wieder
                    // Re-Request → Render-Verhungern) und verfälschte die cacheBytes-Bilanz.
                    if (f && f.cache && typeof f.cache.forEach === "function") {
                        const tot = [];
                        f.cache.forEach((_v, k) => {
                            if (String(k).indexOf(preset + "|") === 0) tot.push(k);
                        });
                        for (const k of tot) this._foundryCacheEvict(k);
                    }
                    append(`Geprägt: „${rec.lab || preset}" trägt fortan die ${achse.wort} „${zeileName}".`);
                },
            },
            {
                example: "aktiviere anazh-symphonie",
                re: /^aktiviere\s+anazh-symphonie(?:\s.*)?$/i,
                run: (m, append) => {
                    // Das Verb koppelt an die echte Symphonie (initSymphony/masterGain, derselbe Chokepoint wie
                    // #anazh-symphony-toggle; Chat-Enter erfüllt die Autoplay-Policy). Das DSL-Belebungs-Programm
                    // bleibt als Begleit-Geste.
                    const s = this.state.symphony;
                    let klang = false;
                    if (s && !s.enabled) {
                        klang = !!this.initSymphony();
                    } else if (s && s.enabled && s.masterGain && s.ctx) {
                        s.masterGain.gain.setValueAtTime(0.35, s.ctx.currentTime);
                        klang = true;
                    }
                    this.addNewAbility(
                        "anazhSymphony",
                        ["chain", ["creatures_emotion", "happy"], ["creatures_speed_mul", 1.5]],
                        "human"
                    );
                    this.state.abilities["anazhSymphony"]();
                    append(
                        klang
                            ? "Anazh-Symphonie aktiviert — die Welt klingt (und die Kreaturen beleben sich)."
                            : "Anazh-Symphonie: Belebung aktiv; Klang konnte nicht starten (kein Audio-Kontext)."
                    );
                },
            },
            {
                example: "aktiviere debug-logs",
                re: /^aktiviere\s+debug-logs(?:\s.*)?$/i,
                run: (m, append) => {
                    this.state.debugLogging = true;
                    append("Debug-Logs aktiviert");
                },
            },
            {
                example: "deaktiviere debug-logs",
                re: /^deaktiviere\s+debug-logs(?:\s.*)?$/i,
                run: (m, append) => {
                    this.state.debugLogging = false;
                    append("Debug-Logs deaktiviert");
                },
            },
        ];
        return this._chatSystemPatternsCache;
    }

    // Die Absage eines Studio-Satzes mit unbekanntem Wort (ohne KI-Begleiter): der Spieler hört, was die Studios kennen —
    // aus dem EINEN Wort-Katalog (Befund L-Wortschatz: „bau mir eine scheune" hieß „Unbekannter Befehl. Meintest du 'baue
    // dorf hier'?"). null, wenn der Satz kein Studio-Satz ist oder sein Wort auflöst — und wenn das „Wort" der Ort des
    // Satzes ist („bau hier": `hier` steht ohne Ding, Gegenprüfung 08.10.).
    _studioSatzAbsage(command) {
        const m = String(command || "")
            .trim()
            .match(AnazhRealm.STUDIO_SATZ);
        if (!m || !m[2] || m[2].toLowerCase() === "hier" || this._studioBlueprintForWord(m[2])) return null;
        const kennt = this._studioWordsForPrompt(true);
        return kennt
            ? `„${m[2]}" kennt kein Studio. Die Studios bauen — ${kennt}.`
            : `„${m[2]}" kennt kein Studio — das Studio-Buch lädt noch.`;
    }

    // Conversational-Fallback: Kreatur-Konversation (Welle 6.H Phase 2E V1),
    // LLM-Fallback (Schicht 2 — Claude/Gemini/OpenRouter), P2P-Voice-Pool
    // (W7 Phase 3), sonst Studio-Satz-Absage, chatSuggest + Hilfetext.
    _chatHandleConversationalFallback(command, appendChatOutput) {
        if (this._parseCreatureAddress && this._parseCreatureAddress(command)) {
            // „Name, text" oder „Name: text" geht an die Kreatur (nicht an Grok).
            this.maybeAnswerCreature(command, appendChatOutput).catch((err) => {
                appendChatOutput(`(Kreatur-Fehler: ${err.message || err})`);
            });
            return;
        }
        if (this.state.llm && this.state.llm.enabled) {
            // Schicht 2 — LLM-Fallback. Statt „Unbekannter Befehl" geht der Text
            // an Claude; Antwort kommt narrativ + optional als DSL-Programm.
            this.maybeAnswerWithLlm(command, appendChatOutput).catch((err) => {
                appendChatOutput(
                    `(${(this.state.grok && this.state.grok.companionName) || "Grok"}-Fehler: ${err.message || err})`
                );
            });
            return;
        }
        if (typeof this._p2pVoiceAvailable === "function" && this._p2pVoiceAvailable()) {
            // W7 Phase 3 — LLM-Pool. Kein eigenes LLM, aber ein Mitspieler teilt
            // seine Stimme: die Anfrage läuft über ihn, das DSL-Programm der
            // Antwort durch meine eigene Sandbox.
            this._p2pRequestSharedVoice(command, appendChatOutput);
            return;
        }
        const studioAbsage = this._studioSatzAbsage(command);
        const suggestion = this.chatSuggest(command);
        if (suggestion) {
            const norm = command.trim().toLowerCase();
            const sug = String(suggestion).trim().toLowerCase();
            // Exact/nahe: nicht „Meintest du X?" wenn X schon getippt war —
            // unsichtbare Zeichen oder 1-Tippfehler → Suggestion ausführen.
            // Suffix-Müll (Sonde: „baue dorf hierblwv") und 1-Tippfehler → ausführen
            const suffixJunk = norm.startsWith(sug) && /^[a-zäöüß0-9]{1,8}$/i.test(norm.slice(sug.length));
            if (norm === sug || this.levenshtein(norm, sug) <= 1 || suffixJunk) {
                if (this._chatTryDslParse(suggestion, { value: "" }, appendChatOutput)) return;
                for (const p of this.chatSystemPatterns) {
                    const m = String(suggestion).trim().match(p.re);
                    if (!m) continue;
                    try {
                        p.run(m, appendChatOutput);
                    } catch (err) {
                        appendChatOutput(`(Befehl-Fehler: ${err && err.message})`);
                    }
                    return;
                }
            }
            // Ein Studio-Satz mit unbekanntem Wort hört den Katalog UND den Vorschlag (Gegenprüfung 08.10.: die Absage nahm
            // jeder Zeile „Verb + Wort" ohne KI den Vorschlag, „mach licht" hörte nur den Katalog).
            appendChatOutput(
                studioAbsage
                    ? `${studioAbsage} Oder meintest du: '${suggestion}'?`
                    : `Unbekannter Befehl. Meintest du: '${suggestion}'? („hilfe" zeigt, was die Welt versteht.)`
            );
        } else if (studioAbsage) {
            appendChatOutput(studioAbsage);
        } else {
            // Keine zweite Liste: die Hilfe liest die EINEN Tafeln (`_hilfeZeilen`), hier steht nur der Weg dorthin.
            appendChatOutput(`Unbekannter Befehl — sag „hilfe", dann zeigt dir die Welt, was sie versteht.`);
        }
    }

    // DIE HILFE aus den EINEN Quellen (Leben-Schau 07.10., L2): die Sätze der Welt (`chatDslPatterns`, je Regel ihr
    // Beispiel und die `hilfe`-Beispiele der Regel), die System-Befehle (`chatSystemPatterns`) und die Tasten (die
    // Belegung `state.keybindings` über `DEFAULT_KEYBINDINGS`, benannt mit `KEYBINDING_LABELS`). Vorher war „hilfe"
    // unbekannt, und die Liste hinter „help" stand von Hand im Text (11 Beispiele, kein v1-Satz). Zuerst die Regeln mit
    // `hilfe` (die v1-Sätze: der Studio-Satz, das Dorf), dann alle.
    _hilfeZeilen() {
        const dsl = this.chatDslPatterns;
        const kb = this.state.keybindings || AnazhRealm.DEFAULT_KEYBINDINGS;
        const fmt = (c) => this._formatBindingCode(c);
        const q = (s) => `„${s}"`;
        const probier = [];
        for (const p of dsl.concat(this.chatSystemPatterns))
            if (Array.isArray(p.hilfe)) for (const b of p.hilfe) if (!probier.includes(b)) probier.push(b);
        const tasten = AnazhRealm.KEYBINDING_ACTIONS.map(
            (a) => `${fmt(kb[a] || AnazhRealm.DEFAULT_KEYBINDINGS[a])} ${AnazhRealm.KEYBINDING_LABELS[a] || a}`
        );
        return [
            `Sprich mit der Welt: ${fmt(kb.chat || AnazhRealm.DEFAULT_KEYBINDINGS.chat)} öffnet das Gespräch, Enter sendet, Esc gibt die Welt zurück.`,
            `Probier: ${probier.map(q).join(" · ")}`,
            `Die Welt versteht: ${dsl.map((p) => q(p.example)).join(" · ")}`,
            `System: ${this.chatSystemPatterns.map((p) => q(p.example)).join(" · ")}`,
            `Tasten: WASD laufen · 1–9 Hotbar · ${tasten.join(" · ")}`,
            `Fahren: ${this._fahrTastenZeile()}`,
        ];
    }

    // Die Fahr-Tasten als EINE Zeile (die Tafel AnazhRealm.FAHR_TASTEN, die die Eingabe liest): die Hilfe und der Tacho.
    _fahrTastenZeile() {
        return Object.values(AnazhRealm.FAHR_TASTEN)
            .map((t) => `${t.zeigen} ${t.label}`)
            .join(" · ");
    }

    // Beschreibung → DSL-Programm. Vier bekannte Pattern + Catch-All als
    // `say`. Dieselbe Form wie `parseChatToDsl`: regelbasiert, sicher, JSON-
    // serialisierbar. Keine Code-Generierung mehr.
    parseAbilityDescriptionToDsl(description) {
        const lower = (description || "").toLowerCase().trim();
        if (lower.includes("ändere farbe von kreaturen")) {
            const m = lower.match(/zu ([\wäöüß]+)/);
            const color = m ? m[1] : "white";
            return ["creatures_color", color];
        }
        if (lower.includes("erhöhe geschwindigkeit") || lower.includes("erhoehe geschwindigkeit")) {
            const m = lower.match(/um ([\d.]+)/);
            const amount = m ? parseFloat(m[1]) : 1.0;
            const target = (this.state.speed || 6) + amount;
            return ["player_speed", target];
        }
        if (lower.includes("spawne objekt") || lower.includes("erschaffe baum")) {
            return ["spawn_tree", ["at_player"], 1];
        }
        if (lower.includes("regen") || lower.includes("regnen")) {
            return ["weather", "rainy"];
        }
        if (lower.includes("sonnig") || lower.includes("sonne")) {
            return ["weather", "sunny"];
        }
        // Catch-All: die Fähigkeit „sagt" ihre Beschreibung — kein Welt-
        // Effekt, aber persistiert und auf der Grok-Stimme abspielbar.
        return ["say", `Fähigkeit '${description.trim()}' aktiv`];
    }

    learnAbility(name, description) {
        const program = this.parseAbilityDescriptionToDsl(description);
        this.addNewAbility(name, program, "human");
        this.state.knowledgeBase.push({
            type: "ability",
            content: { name, description, program },
            timestamp: performance.now() / 1000,
        });
    }
    proactiveSuggestions() {
        const suggestions = [
            "Möchtest du eine neue Fähigkeit lernen? Beispiel: 'Lerne Fähigkeit farbwechsel Ändere Farbe von Kreaturen zu blau'",
            "Soll ich die Physik weiter optimieren? Sage 'Entwickle Physik'",
            "Wie wäre es mit einem neuen Sternenhimmel? Beispiel: 'Ändere Sternenhimmel red'",
            "Möchtest du mehr Kreaturen spawnen? Beispiel: 'Spawne Kreaturen 10'",
            "Soll ich das Terrain flacher machen? Beispiel: 'Setze Terrain Steilheit 0.5'",
            "Möchtest du eine neue Welt erschaffen? Beispiel: 'Erschaffe Welt forest'",
            "Soll ich die Spielsteuerung erweitern? Beispiel: 'Implementiere Spielsteuerung'",
        ];
        const randomSuggestion = suggestions[Math.floor(Math.random() * suggestions.length)];
        const chatOutput = document.getElementById("chat-output");
        const line = document.createElement("div");
        line.textContent = `KI-Vorschlag: ${randomSuggestion}`;
        chatOutput.appendChild(line);
        chatOutput.scrollTop = chatOutput.scrollHeight;
    }
    updateCreatureEmotions() {
        // Wetter = ambienter Achsen-Impuls auf das 6-Achsen-Innenleben (kein Binär-Würfel), das Etikett
        // fällt aus der Valenz-Projektion; 10 %-Stochastik (nicht alle fühlen gleichzeitig). Der Sturm ist
        // ein eigenes Gefühl (chaos + awe), nicht bloß mehr Regen. Wer fühlt, zieht der Fauna-Strom des Gefühls (Γ5).
        const word = this.state.weather;
        const wet = this._weatherIsWet(word);
        const rng = this._faunaRng("gefuehl");
        for (let i = 0; i < this.state.creatures.length; i++) {
            if (rng() >= 0.1) continue;
            const c = this.state.creatures[i];
            if (!c || !c.userData) continue;
            const ud = c.userData;
            if (!ud.emotions) ud.emotions = { joy: 0, awe: 0, sorrow: 0, hope: 0, peace: 0, chaos: 0 };
            if (word === "stormy") {
                ud.emotions.chaos = Math.min(1, (ud.emotions.chaos || 0) + 0.15);
                ud.emotions.awe = Math.min(1, (ud.emotions.awe || 0) + 0.1);
            } else if (wet) {
                ud.emotions.sorrow = Math.min(1, (ud.emotions.sorrow || 0) + 0.18);
                ud.emotions.peace = Math.min(1, (ud.emotions.peace || 0) + 0.06);
            } else {
                ud.emotions.joy = Math.min(1, (ud.emotions.joy || 0) + 0.15);
            }
            this._projectCreatureEmotion(c);
        }
    }

    optimizePhysics() {
        // DETERMINISMUS-BOGEN P3 — keine Ammo-Welt/Reibung/CCD mehr zu „optimieren".
        // Der Chat-Befehl setzt nur noch die Schwerkraft-Konstante zurück (die
        // `_stepCharacter` als Skalar liest).
        this.state.gravity = -9.81;
        this.log("Schwerkraft auf Standard zurückgesetzt (Feld-Physik — kein Ammo).");
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
}
