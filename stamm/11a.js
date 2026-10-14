class AnazhRealm_Z11a {
    // ===== ATLAS §11 · VOXEL-MESHER/WASSER — Chunk-Build · Wasser-Zellen/Iso/Sheet · CA · Edits =====
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

    // true, wenn der Spieler in diesem Chunk steht (`state.lastPlayerVoxelChunk`, je Streaming-Tick).
    // Ein Edit hier MUSS sync rebuilden — der Spieler sieht Carve/Fill am Standort sofort.
    _voxelChunkIsPlayerChunk(cx, cz) {
        const lpc = this.state.lastPlayerVoxelChunk;
        return !!lpc && lpc.cx === cx && lpc.cz === cz;
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
    _finalizeVoxelChunkBuild(cx, cz, lod, fresh, syncWater = false) {
        const key = `${cx},${cz}`;
        if (fresh.kind === "empty") {
            this.state.voxelChunks.set(key, { empty: true });
            this._weltRegt(true); // die Chunk-Menge regt sich: die Stand-Wache weckt die Fege-Takte (Boden-Stempel)
            return null;
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
        this._weltRegt(true); // die Chunk-Menge regt sich: die Stand-Wache weckt die Fege-Takte (Boden-Stempel)
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
        // Cross-LOD-Geomorph: diesen Chunk an GROBE Nachbarn schmiegen + die 8 Nachbarn des 3×3-Rings neu morphen
        // (ein FEINER Nachbar, der auf diesen wartete, schließt jetzt seine Naht — auch an der Ecke). Main-only, render-only.
        for (let dx = -1; dx <= 1; dx++) for (let dz = -1; dz <= 1; dz++) this._applyCrossLodGeomorph(cx + dx, cz + dz);
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
        // Basis = Identität (un-morpht)
        for (let v = 0; v < n; v++) {
            tArr[v * 3] = pos.getX(v);
            tArr[v * 3 + 1] = pos.getY(v);
            tArr[v * 3 + 2] = pos.getZ(v);
            wArr[v] = 0;
        }
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
                tArr[v * 3] = bx;
                tArr[v * 3 + 1] = by;
                tArr[v * 3 + 2] = bz;
                // Gewicht: 1 in der Grenz-Zeile (dPlane ≤ flat) → linear auf 0 bei morphBand.
                // A1 — jenseits des Caps KEIN Morph (w=0, das Target bleibt fürs Band in tArr;
                // der Shader liest bei w=0 die rohe Position — kein Zerren der Cliff-Wand).
                wArr[v] = d3 > snapCap ? 0 : Math.max(0, Math.min(1, (morphBand - dPlane) / (morphBand - flat)));
                touched = true;
            }
        }
        entry.hasMorph = touched;
        this._chunkSatzMarke("boden", `${cx},${cz}`, ["aMorphTarget", "aMorphWeight"]);
        this._rebuildLodStitchBand(entry, bandVerts, `${cx},${cz}`);
    }

    // STITCH-BAND (Arme-Leute-Transvoxel): wo der Morph-Cap greift (Cliffs), bliebe ein Spalt. Pro
    // Mesh-KANTE der Grenz-Zeile (beide Endpunkte in der Border-Row — echte Topologie inkl. Höhlen-
    // Loops, kein Polyline-Sortieren) der Skirt und, wo ein Ende gekappt ist (Gewicht < 1), ein Quad von der
    // feinen Kante (position) zur groben Fläche (aMorphTarget). Render-only, keine BVH, main-only. Trägt ALLE Material-Attribute des Terrain-
    // Toons (WebGPU-strikt): color vom Quell-Vertex, aMorphTarget = Identität/w=0 (kein Doppel-Morph).
    // Dasselbe Material wie der Boden → ein Bereich `stitch:<chunk>` IM Boden-Satz (derselbe Befehl); der
    // Band-Mesh bleibt CPU-Körper (Naht-Sonden lesen seine Geometrie).
    _rebuildLodStitchBand(entry, bandVerts, key) {
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
            I = [];
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
                const tax = tgt.getX(a),
                    tay = tgt.getY(a),
                    taz = tgt.getZ(a);
                const tbx = tgt.getX(b),
                    tby = tgt.getY(b),
                    tbz = tgt.getZ(b);
                const spanA = Math.hypot(tax - ax, tay - ay, taz - az);
                const spanB = Math.hypot(tbx - bx, tby - by, tbz - bz);
                if (Math.max(spanA, spanB) < MIN_SPAN) continue;
                // DIE BRÜCKE (rohe Kante → grobe Fläche) nur, wo der Morph die Naht NICHT schliesst (K51): trägt er beide
                // Enden ganz (Gewicht 1), zeichnet die feine Kante schon auf der groben Fläche — die Brücke wäre eine Finne
                // zur unsichtbaren rohen Lage (14.10., Mess-Wiese: zwei von drei Naht-Dreiecken, in jedem Pass gezeichnet).
                if (!(wgt.getX(a) >= 1 && wgt.getX(b) >= 1)) {
                    const base = P.length / 3;
                    P.push(ax, ay, az, bx, by, bz, tbx, tby, tbz, tax, tay, taz);
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
        bg.setAttribute("aMorphTarget", new THREE.Float32BufferAttribute(new Float32Array(P), 3));
        bg.setAttribute("aMorphWeight", new THREE.Float32BufferAttribute(new Float32Array(P.length / 3), 1));
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
    _completeVoxelRebuild(key, cx, cz, lod, fresh) {
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
        this._finalizeVoxelChunkBuild(cx, cz, lod, fresh, true);
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
        // Implizite Sync-Pflicht (Spieler-Chunk / Carve-Region) nur, solange der Frame Zeit hat
        // (`!_frameOverBudget`) — sonst ASYNC (alter Mesh bleibt, Kollision ist feld-nativ sofort aktuell),
        // kein Dauer-Stall aus ~126-ms-Sync-Rebuilds beim Graben. Explizites `opts.forceSync`
        // (`_syncRebuildEditFootprint`, `_drainDirtyVoxelChunks`) baut IMMER sync.
        const editPressure = this._voxelChunkIsPlayerChunk(cx, cz) || this._chunkRegionHasCarve(cx, cz);
        const forceSync = opts.forceSync === true || (editPressure && !this.state._frameOverBudget);
        // Welle G-fix — das Gras nur disposen, wenn die Oberfläche sich änderte
        // (Carve/Fill markierte den Chunk grass-dirty). Sonst behalten (kein
        // Flackern bei Nexus-Spawn/Skirt/LOD-Rebuild).
        const keepGrass = !(this.state.grassDirtyChunks && this.state.grassDirtyChunks.has(key));
        if (forceSync) {
            // V9.40-d — dispose-before-build (kein Loch, Sync-Build same-frame).
            if (oldEntry) this._disposeVoxelChunk(key, keepGrass);
            const fresh = this._acquireVoxelChunkBuild(cx, cz, useLod, { forceSync: true });
            return this._completeVoxelRebuild(key, cx, cz, useLod, fresh);
        }
        // Async: erst bauen/anfordern, NICHT vorher disposen.
        const fresh = this._acquireVoxelChunkBuild(cx, cz, useLod, { forceSync: false });
        if (fresh === "pending") {
            // Worker/GPU-Request läuft — alter Chunk bleibt sichtbar, dirty
            // behalten, der nächste Tick prüft erneut (Cache-Hit → Swap).
            if (!this.state.dirtyVoxelChunks) this.state.dirtyVoxelChunks = new Set();
            this.state.dirtyVoxelChunks.add(key);
            return false;
        }
        // Build fertig/fail → atomarer Swap: alten erst JETZT disposen.
        if (oldEntry) this._disposeVoxelChunk(key, keepGrass);
        return this._completeVoxelRebuild(key, cx, cz, useLod, fresh);
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

    // Defer-Helper für JEDEN GPU-Dispose (Geometry/Material/Texture): WebGPU zerstört Buffer sofort bei
    // `.dispose()`, Submits laufen aber async → in `pendingDisposals` sammeln, Drain erst nach
    // `device.queue.onSubmittedWorkDone()` im Render-Loop.
    _queueDispose(obj) {
        if (!obj || typeof obj.dispose !== "function") return;
        // V10.0-j.g — Set-Add ist automatic dedup; gleiches Material mehrmals
        // gequeued (z.B. Compound mit shared Material) wird nur einmal disposed.
        this.state.pendingDisposals.add(obj);
    }
    // Legacy-Alias für V10.0-j.d-Code (Geometry-spezifisch).
    _queueGeometryDispose(geometry) {
        this._queueDispose(geometry);
    }

    // Räumt einen Voxel-Chunk: Kollision, Mesh, Geometrie, Material.
    // Idempotent.
    _disposeVoxelChunk(key, keepGrass = false) {
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
        this._weltRegt(true); // die Chunk-Menge regt sich: die Stand-Wache weckt die Fege-Takte (Boden-Stempel)
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
        const macroSurf = this._terrainMacroSurfaceY(x, z);
        const skipAbove = Number.isFinite(macroSurf)
            ? Math.max(macroSurf + 12 + 4 * cfg.step, this._voxelEditsFillTop() + 2)
            : Infinity;
        // Spalten-Hoist: ~61 % jeder Dichte-Probe ist 2D-Spalten-Arbeit (Makro/Erosion/Hydro) → Kontext
        // EINMAL heben, die Probe liest `_fieldDensityAt(x,y,z,ctx)` — dieselbe Quelle wie die feld-native
        // Kollision, bit-identisch zu `_terrainDensityAt` (base+Σdelta == baseCol+Σdelta).
        const colCtx = this._terrainColumnContext(x, z);
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
    _fieldSurfaceBelow(x, y, z, maxDist) {
        const ctx = this._terrainColumnContext(x, z);
        const step = 0.5;
        if (this._fieldSolid(x, y, z, ctx)) {
            // Start IM Soliden → aufwärts die Oberkante suchen (Penetrations-Heilung).
            const top = y + maxDist;
            for (let yy = y; yy <= top; yy += step) {
                if (!this._fieldSolid(x, yy, z, ctx)) {
                    // Grenze zwischen yy−step (solid) und yy (Luft) → Bisektion auf die Oberkante.
                    let lo = Math.max(y, yy - step),
                        hi = yy;
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
        for (let yy = y; yy >= end; yy -= step) {
            if (this._fieldSolid(x, yy, z, ctx)) {
                // Grenze zwischen yy (solid) und yy+step (Luft) → Bisektion verfeinern.
                let lo = yy,
                    hi = Math.min(y, yy + step);
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

    // === Der Hydrosphären-Atlas ===
    // Deterministisches Drainage-Netz aus der Voxel-Surface (Flüsse, Seen, Wasserfälle als reine Daten in
    // `state.hydrosphere`): Flow-Accumulation aus dem Seed, keine Live-Fluid-Simulation → multiplayer-
    // sicher. `_computeHydrosphere` orchestriert die Phasen (je eine Methode) in eine lokale Variable;
    // der Aufrufer setzt `state.hydrosphere` erst nach vollem Bau — kein Carve-Zirkel während des Baus.
    _computeHydrosphere(origin = null) {
        // Der Carve darf NICHT in die eigene Berechnung leiten: bei einem Re-Compute läse `_voxelSurfaceY`
        // sonst die GECARVTE Surface (Zirkel). Das transiente Flag unterdrückt den Carve für die Dauer des
        // Baus (try/finally setzt es auch im Fehlerfall zurück).
        this._hydroComputing = true;
        try {
            const ctx = this._hydroInit(origin);
            this._hydroMarkOcean(ctx);
            this._hydroPriorityFlood(ctx);
            const lakes = this._hydroExtractLakes(ctx);
            const rivers = this._hydroNetzFluesse(ctx);
            // Jeder Fluss-Punkt bekommt seine ECHTE Voxel-Surface-Höhe (`voxelY`): geroutet wird auf der glatten
            // Makro-Surface, Wasserfälle leben aber an den echten Klippen — das Ribbon hängt am Voxel-Relief.
            this._hydroSampleRiverSurfaces(rivers);
            // Der Spiegel jedes Fluss-Punkts (stromab nie steigend, quer waagrecht) — das Bett folgt ihm (Carve).
            this._hydroRiverSpiegel(ctx, rivers);
            const waterfalls = this._hydroExtractWaterfalls(ctx, rivers);
            const { dim, surf, waterLevel, lakeOf, isOcean } = ctx;
            let landCells = 0;
            let lakeCells = 0;
            let seaCells = 0;
            let surfMin = Infinity;
            let surfMax = -Infinity;
            for (let idx = 0; idx < dim * dim; idx++) {
                const s = surf[idx];
                if (s < surfMin) surfMin = s;
                if (s > surfMax) surfMax = s;
                if (lakeOf[idx] >= 0) lakeCells++;
                if (isOcean[idx]) {
                    seaCells++;
                    continue;
                }
                const i = idx % dim;
                const j = (idx / dim) | 0;
                if (i === 0 || j === 0 || i === dim - 1 || j === dim - 1) continue;
                landCells++;
            }
            // Diagnostik: steilstes Fluss-Segment der Voxel-Surface (Tuning-Anker für `waterfallSlope`) +
            // Netz-Vermessung (Fluss-Längen, See-Größen: echte Flüsse oder Pfützen-Kette?).
            let lakeCellsMax = 0;
            for (let li = 0; li < lakes.length; li++) {
                const c = lakes[li].cells ? lakes[li].cells.length : 0;
                if (c > lakeCellsMax) lakeCellsMax = c;
            }
            let riverMaxSlope = 0;
            let riverMaxDrop = 0;
            let riverPointsTotal = 0;
            let riverLenMax = 0;
            // die Breite des kleinsten vollen Flusses (Leser: die Quell-Hülle der Wasser-Linse)
            let bettMin = Infinity;
            for (let ri = 0; ri < rivers.length; ri++) {
                const pts = rivers[ri].points;
                riverPointsTotal += pts.length;
                if (pts.length > riverLenMax) riverLenMax = pts.length;
                for (const p of pts) if (p.quelle === 1 && p.width < bettMin) bettMin = p.width;
                for (let k = 0; k + 1 < pts.length; k++) {
                    const a = pts[k];
                    const b = pts[k + 1];
                    const ay = typeof a.voxelY === "number" ? a.voxelY : a.y;
                    const by = typeof b.voxelY === "number" ? b.voxelY : b.y;
                    const drop = ay - by;
                    if (drop <= 0) continue;
                    const horiz = Math.hypot(b.x - a.x, b.z - a.z) || ctx.cell;
                    if (drop / horiz > riverMaxSlope) riverMaxSlope = drop / horiz;
                    if (drop > riverMaxDrop) riverMaxDrop = drop;
                }
            }
            // V9.43-d — den Carve-Index aus dem fertigen Netz bauen (Fluss-Bucket-
            // Grid + See-Cut-Feld); `_terrainDensityAt` liest ihn beim Meshen.
            const carve = this._hydroBuildCarveIndex(ctx, rivers, lakes);
            // V9.49-a/e — das vereinte Wasser-Feld (`docs/hydrosphere.md` §12 + §13).
            const water = this._hydroBuildWaterField(ctx, lakes);
            return {
                ready: true,
                originX: ctx.originX,
                originZ: ctx.originZ,
                size: ctx.size,
                cell: ctx.cell,
                dim: ctx.dim,
                rivers,
                lakes,
                waterfalls,
                riverBuckets: carve.riverBuckets,
                bucketSize: carve.bucketSize,
                bucketsDim: carve.bucketsDim,
                lakeBedCell: carve.lakeBedCell,
                lakeW: carve.lakeW,
                lakeNear: carve.lakeNear,
                water,
                stats: {
                    cells: dim * dim,
                    landCells,
                    lakeCells,
                    seaCells,
                    bettMin: Number.isFinite(bettMin) ? Math.round(bettMin * 100) / 100 : null,
                    waterLevel: Math.round(waterLevel),
                    surfMin: Math.round(surfMin),
                    surfMax: Math.round(surfMax),
                    riverMaxSlope: Math.round(riverMaxSlope * 100) / 100,
                    riverMaxDrop: Math.round(riverMaxDrop * 10) / 10,
                    riverPointsTotal,
                    riverLenMax,
                    lakeCellsMax,
                },
            };
        } finally {
            this._hydroComputing = false;
        }
    }

    // Vereintes Wasser-Feld je Region-Zelle: flacher Spiegel `waterY` + `waterKind` (0 Land · 1 Ozean ·
    // 2 See). Stehendes Wasser = EINE Höhe je Körper (`waterLevel`/`lake.level`), kein per-Zelle-
    // `filled` (ε-Gefälle kippt den See). Trockene Zelle → Meeresspiegel: das Rand-Quad taucht unters
    // Ufer, die Uferlinie ist der emergente Schnitt. Reine Daten.
    _hydroBuildWaterField(ctx, lakes) {
        const { dim, isOcean, lakeOf, waterLevel } = ctx;
        const n = dim * dim;
        const waterY = new Float32Array(n);
        const waterKind = new Uint8Array(n);
        for (let idx = 0; idx < n; idx++) {
            if (isOcean[idx]) {
                waterKind[idx] = 1;
                waterY[idx] = waterLevel;
            } else if (lakeOf[idx] >= 0) {
                waterKind[idx] = 2;
                const lk = lakes[lakeOf[idx]];
                waterY[idx] = lk ? lk.level : waterLevel;
            } else {
                waterY[idx] = waterLevel;
            }
        }
        return { waterY, waterKind };
    }

    // DER BEZUG DER UFER-BÄNDER (der Boden-Farbe, Bank und Schilf; bit-gleich im Worker): MAX aus Ozean (`waterLevel`,
    // Default überall), See-Becken (`lake.level`) und Fluss-Bett-Profil. KEINE Wasser-Probe: „ist hier Wasser / wie tief"
    // fragt jeder Leser die EINE Wahrheit (`_nassAt` · `_koerperWasser`); bis Schau-2 (09.10.) urteilte über diesen Bezug
    // eine Zwillings-Probe des Lands, blind für das gezeichnete Wasser. `aus` (optional) bekommt die beiden Bezüge der
    // Ufer-Bänder getrennt: `see` (Meer/See), `fluss` (der Fluss-Spiegel oder null) und `ufer` (seine Kronen-Blende). Ein
    // Ufer-Band (Strand, Schlick, Pfad, Höhen-Feuchte) ist das Maximum aus dem Band über `see` und dem Band über `fluss`
    // × `ufer` — stetig über die Krone, wo der Fluss-Spiegel endet (bis Welle L lasen die Bänder das Maximum der Spiegel:
    // an der Krone sprang der Bezug auf den Meeresspiegel, die Bank trug ein Rauten-Schachbrett).
    _waterLevelAt(x, z, aus) {
        let level = typeof this.state.waterLevel === "number" ? this.state.waterLevel : 0;
        const h = this._hydroFor(x, z); // A3 (V18.132): Heimat ODER Kachel
        if (h && h.ready && h.water && h.water.waterKind) {
            // See: 3×3 der 16-m-Zellen (1-Zell-Dilatation gegen den quantisierten Becken-Rand); der
            // `_voxelSurfaceY`-Test klemmt danach exakt (ein Rand-Vertex über dem Spiegel testet trocken).
            const dim = h.dim;
            const cell = h.cell;
            const ci = Math.floor((x - h.originX) / cell);
            const cj = Math.floor((z - h.originZ) / cell);
            const wK = h.water.waterKind;
            const wY = h.water.waterY;
            for (let dj = -1; dj <= 1; dj++) {
                for (let di = -1; di <= 1; di++) {
                    const ni = ci + di;
                    const nj = cj + dj;
                    if (ni < 0 || nj < 0 || ni >= dim || nj >= dim) continue;
                    const idx = ni + nj * dim;
                    if (wK[idx] === 2 && wY[idx] > level) level = wY[idx];
                }
            }
        }
        const river = this._hydroRiverAt(x, z);
        if (aus) {
            aus.see = level;
            aus.fluss = river ? river.surfaceY : null;
            aus.ufer = river ? river.ufer : 0;
        }
        if (river && river.surfaceY > level) level = river.surfaceY;
        return level;
    }

    // Wasser-Spiegel für die Voxel-Cell-Klassifikation (ohne den Schatten der 3×3-Dilatation von
    // `_waterLevelAt`): Atlas-Ozean/-See → voller Spiegel, beliebige Tiefe; Fluss → Bett-Profil; Atlas-
    // LAND neben einem Körper (3×3) → dessen Spiegel, wenn `terrainTopY < rim` (Mulde bis zum Terrain
    // gefüllt, keine Ufer-Wand), sonst trocken. `terrainTopY` reicht der Aufrufer (Density-Grid bzw.
    // `_voxelSurfaceY`); Rückgabe -Infinity = „hier nie Wasser".
    // `aus` (optional) bekommt den Spiegel der Wasser-KÖRPER ohne den Fluss: `aus.koerper` (Meer, See; −Infinity = keiner).
    _atlasWaterLevelAt(x, z, terrainTopY, aus) {
        let level = -Infinity;
        let inRegion = false;
        const h = this._hydroFor(x, z); // A3 (V18.132): Heimat ODER Kachel
        if (h && h.ready && h.water && h.water.waterKind) {
            const dim = h.dim;
            const cell = h.cell;
            const ci = Math.floor((x - h.originX) / cell);
            const cj = Math.floor((z - h.originZ) / cell);
            if (ci >= 0 && cj >= 0 && ci < dim && cj < dim) {
                inRegion = true;
                const wK = h.water.waterKind;
                const wY = h.water.waterY;
                const here = wK[ci + cj * dim];
                if (here === 1 || here === 2) {
                    // echter Wasser-Körper an dieser Spalte — voller Spiegel.
                    level = wY[ci + cj * dim];
                } else {
                    // Atlas-Land neben einem Wasser-Körper: 16-m-Rand-Kandidat aus
                    // dem 3×3 (der Body-Spiegel der priority-flood-Konnektivität).
                    let rim = -Infinity;
                    for (let dj = -1; dj <= 1; dj++) {
                        for (let di = -1; di <= 1; di++) {
                            const ni = ci + di;
                            const nj = cj + dj;
                            if (ni < 0 || nj < 0 || ni >= dim || nj >= dim) continue;
                            const nk = wK[ni + nj * dim];
                            if ((nk === 1 || nk === 2) && wY[ni + nj * dim] > rim) rim = wY[ni + nj * dim];
                        }
                    }
                    // Verbundenes Wasser: Spalte bis zum Spiegel füllen, wenn ihr Terrain darunter liegt — JEDE Tiefe
                    // (ein Tiefen-Cap verwechselt „tief" mit „steiler Hang" → Wasser-AIR-Wände). Nur bei ENDLICHEM
                    // terrainTopY: „unbekannt" (−Infinity, z. B. `_ensureFarWaterSheet`) heißt KEINE Rim-Erweiterung,
                    // nie „immer nass" (sonst schweben Fern-Quads über trockenem Ufer). Mirror byte-identisch im
                    // Worker; Linse: `gate:wasser-wahrheit` Fixture 2.
                    if (Number.isFinite(terrainTopY) && rim > -Infinity && terrainTopY < rim) {
                        level = rim;
                    }
                }
            }
        }
        // V17.117 (H3) — der OZEAN ist GLOBAL: jenseits der region-bound Atlas-
        // Domäne (±1024 m) ist der Meeresspiegel der Default-Wasserkörper, genau
        // wie eine Atlas-Ozean-Zelle (waterKind===1 → waterLevel). Der Flood + die
        // soliden Terrain-Cells trennen Land/Wasser von selbst (eine Land-Spalte
        // hat unter waterLevel nur SOLID → kein AIR → kein Wasser; eine submerse
        // Spalte flutet bis waterLevel). In-Region bleibt der getunte V13-Atlas
        // UNANGETASTET (Determinismus, keine Küsten-Regression). CLAUDE.md-Gotcha:
        // „Worldgen lebt nur in ±1024 m … den Ozean-Default global vom waterLevel
        // ableiten (entkoppelt vom Atlas)". Seen/Flüsse bleiben region-lokal.
        if (h && h.ready && !inRegion) {
            const waterLevel = typeof this.state.waterLevel === "number" ? this.state.waterLevel : 0;
            level = waterLevel;
        }
        if (aus) aus.koerper = level;
        const river = this._hydroRiverAt(x, z);
        if (river && river.surfaceY > level) {
            // Auch beim Fluss: `_hydroRiverAt` trifft die volle Carve-Breite inkl. Bank-Rampe, deren surfaceY
            // oft ÜBER dem Boden liegt. Bei terrainTopY === −Infinity (Boden unbekannt) zählt daher nur der
            // Kanal-KERN (centerness > 0); +Infinity (Existenz-Probe) und endliches Terrain: volle Breite.
            if (terrainTopY !== -Infinity || river.centerness > 0) level = river.surfaceY;
        }
        return level;
    }

    // ═══ KOPPLUNG (1) — DIE EINE STRÖMUNGS-QUELLE ═══
    // Strömungs-Geschwindigkeit (m/s) aus dem kanonischen Fluss-Flow von `_hydroRiverAt` für jeden Leser: Körper
    // (`_stepCharacter` · Kreaturen in `updateCreatures` · Boot via `_afloat`) und Klang (Hör-Ring). Betrag = die
    // Strömung des Gesetzes (WASSER_GESETZ.wellen.adv, dieselbe Zeile, die das Wasser-Bild und der Studio-Bach tragen
    // und an der die Fluss-Stimme geeicht ist) × centerness (die Bank-Rampe schiebt nie). Bis V18.531 schob der Körper
    // mit 3,2 m/s (Host-Literal), das Bild floss mit 1,5/0,5/0,9 m/s. Reine Funktion der Welt-Position (Lockstep
    // bit-treu); degenerierte Richtung (See) → null.
    _waterFlowAt(x, z) {
        const rv = this._hydroRiverAt(x, z);
        if (!rv) return null;
        const m = Math.hypot(rv.flowX, rv.flowZ);
        if (!(m > 1e-6) || !Number.isFinite(m)) return null;
        const center = Number.isFinite(rv.centerness) ? Math.max(0, Math.min(1, rv.centerness)) : 0;
        if (center <= 0) return null;
        const WG =
            AnazhRealm.Gesetz("terrain:WASSER_GESETZ", null) || AnazhRealm._kernPflichtBruch("terrain:WASSER_GESETZ");
        const speed = WG.wellen.adv * center;
        return { x: (rv.flowX / m) * speed, z: (rv.flowZ / m) * speed };
    }

    // DER BODEN UNTER DEM KÖRPER (Q4, Kritik §2.1): die erste Fels-Grenze UNTER dem Körper — derselbe Feld-Scan wie der
    // Kapsel-Schritt (`_fieldSurfaceBelow`), ab der Körper-Höhe abwärts statt ab der Chunk-Decke. `_voxelSurfaceY` nahm
    // die erste Luft→Fels-Grenze von OBEN: ein Wolf, gerufen auf dem Höhlen-Boden, stand im ersten Frame auf dem Dach
    // (+32,6 m). Ohne Fels im Band (Sturz, Spawn hoch über dem Grund) trägt die Oberkante der Säule.
    // JEDER KÖRPER (Leben-Schau 2, 09.10., Spaltgrund −900,3/−976,1): auch das Gefährt und das gestoßene Tier lesen hier
    // ihren Boden. Der Fahr-Schritt las die Oberkante der Säule (`getTerrainHeightAt`): unter dem Überhang des Spalts
    // (Fels 22,3–29,5 m, Luft 16–22,3 m) stand der Boden 12 m ÜBER dem Wagen, der Flug-Zweig des Kerns ließ ihn fallen —
    // −6 428 m nach 30 s, durch den Grund bei 16 m. Leser: `_creatureGroundY`, `_creatureSlopeProbe`, `_kreaturStossSchritt`,
    // `_fahrBoden`, `_rittEbene`, `_rittSchritt`, `_todHebeTafel`, der Ruf `spawnCreatureAt`. gate:fall-waechter (Q) nennt
    // jede Methode beim Namen, die die Oberkante der Säule liest UND die Höhe eines Leibs berührt, ohne als Platzierung
    // (Geburt, Ersteh-Ort, Rettung aus der Leere) benannt zu sein.
    _koerperBodenUnter(x, yRef, z) {
        if (Number.isFinite(yRef)) {
            // eingegraben (der Hang stieg unter dem Schritt): nur eine Stufe aufwärts suchen — tiefer im Fels ist kein
            // Gang (ein Spawn im Gestein), dort trägt die Säule
            const y0 = yRef + AnazhRealm.PLAYER_STEP_UP;
            const g = this._fieldSurfaceBelow(x, y0, z, this._fieldSolid(x, y0, z) ? 2 : 40);
            if (g !== null) return g;
        }
        return this._voxelSurfaceY(x, z);
    }

    // DIE KANTE GENAU: die Fels-Grenze um den gefundenen Grund `g` (`_fieldSurfaceBelow` liegt bis 7,8 mm darunter, je nach
    // Start-Höhe) auf 0,2 µm — wer an ihr misst, misst den Ort, nie die Höhe, von der aus gesucht wurde. Leser: der Stoß.
    _feldKanteGenau(x, g, z) {
        let lo = g - 0.002;
        let hi = g + 0.01;
        if (!this._fieldSolid(x, lo, z) || this._fieldSolid(x, hi, z)) return g;
        for (let i = 0; i < 16; i++) {
            const m = (lo + hi) / 2;
            if (this._fieldSolid(x, m, z)) lo = m;
            else hi = m;
        }
        return lo;
    }

    // DER SCHRITT DES KÖRPERS (Leben-Schau 2, CI 38009273564): der Boden eines Leibs, der auf dem Grund `vg` bei (vx, vz)
    // stand und nach (x, z) geht — oder null: die WAND. Gelesen wie `_koerperBodenUnter` ab seinem Grund (abwärts, der
    // Hang 2 m aufwärts, jenseits die Oberkante der Säule — eine Klippe unter freiem Himmel), aber nie DURCH EIN DACH: steigt
    // der Leib über eine Stufe, muss über seinem alten Stand Luft bis über den neuen Grund sein, sonst liegt Fels dazwischen
    // (die Decke der Höhle, ein Überhang) und der Schritt geht in die Wand. Vorher trug jeder Schritt im Fels die Oberkante
    // der Säule: ein in der Höhle an die Wand gestoßener Wolf stand auf ihrem Dach (11,88 m über dem Grund), ein in sie
    // laufender ebenso (11,73 m). Leser: `_creatureGroundY`, `_kreaturStossSchritt`.
    _koerperSchritt(vx, vz, vg, x, z) {
        const y0 = vg + AnazhRealm.PLAYER_STEP_UP;
        if (!this._fieldSolid(x, y0, z)) {
            const g = this._fieldSurfaceBelow(x, y0, z, 40);
            return g !== null ? g : this._koerperBodenUnter(x, NaN, z);
        }
        const g = this._koerperBodenUnter(x, vg, z);
        const oben = g + 0.2;
        if (this._fieldSolid(vx, oben, vz)) return null;
        const fels = this._fieldSurfaceBelow(vx, oben, vz, oben - vg);
        return fels !== null && fels > y0 ? null : g;
    }

    // DER FELS-BEWEIS (Welle L, R2): liegt `_voxelSurfaceY(x, z)` sicher über `hoehe`? Der Scan läuft von oben über sein
    // Gitter und nimmt den ERSTEN Fels — ist ein Gitterpunkt über `hoehe` Fels, liegt die Oberfläche dort oder höher.
    // Dichte-Proben an genau diesen Gitterpunkten (dieselbe Subtraktions-Kette, derselbe Spalten-Kontext, dieselbe Dichte
    // `_fieldDensityAt` samt Edits) statt des Scans: (1) der höchste Punkt unter der Makro-Höhe (surf —
    // dort ist Fels, wo keine Höhle ist), sonst der tiefste über `hoehe`; (2) ist der tiefste über `hoehe` Luft und der
    // darunter Fels, liegt die Oberfläche auf der Kante dazwischen (die Interpolation des Scans, bitgleich) — oder höher,
    // falls darüber noch Fels hängt. false = unbewiesen, der Scan entscheidet. Die Wasser-Suche (`_findNearestWaterPoint`)
    // fragte je Probe den vollen Scan: trocken 351/1330/8037 Spalten für 40/80/200 m. `gate:v1-pfad` (R2) misst das Urteil
    // gegen den vollen Scan.
    _felsUeber(x, z, hoehe) {
        if (!Number.isFinite(hoehe)) return false;
        const ctx = this._terrainColumnContextIn(x, z, this._felsScratch || (this._felsScratch = {}));
        if (!Number.isFinite(ctx.surf)) return false;
        const cfg = this._voxelChunkConfig();
        const floorY = ctx.base - cfg.floorDrop;
        const top = floorY + cfg.dimY * cfg.step - 8;
        const bottom = floorY + 12;
        const skipAbove = Math.max(ctx.surf + 12 + 4 * cfg.step, this._voxelEditsFillTop() + 2);
        const band = ctx.surf;
        let unterBand = null,
            tiefster = null;
        for (let y = top; y >= bottom && y > hoehe; y -= 1.2) {
            tiefster = y;
            if (unterBand === null && y <= band) unterBand = y;
        }
        if (tiefster === null) return false;
        // (1) ein Gitterpunkt über `hoehe` ist Fels (über `skipAbove` sieht der Scan nur Luft)
        if (unterBand !== null && unterBand <= skipAbove && this._fieldDensityAt(x, unterBand, z, ctx) > 0) return true;
        if (unterBand === tiefster) return false; // dieselbe Probe — Luft, der Scan entscheidet
        if (tiefster > skipAbove) return false;
        const dOben = this._fieldDensityAt(x, tiefster, z, ctx);
        if (dOben > 0) return true;
        // (2) die Kante unter dem tiefsten Punkt über `hoehe`
        const unten = tiefster - 1.2;
        if (unten < bottom) return false;
        const dUnten = this._fieldDensityAt(x, unten, z, ctx);
        if (!(dUnten > 0)) return false;
        const t = dUnten - dOben > 1e-9 ? dUnten / (dUnten - dOben) : 0;
        return unten + 1.2 * Math.min(1, Math.max(0, t)) > hoehe;
    }

    // Boden-Cache je Kreatur: der Boden unter dem Körper (`_koerperBodenUnter`) nur neu scannen, wenn sie sich > 0.5 m
    // bewegt hat UND Frame-Budget frei ist — sonst Cache; eine frische Kreatur scannt einmal ohne Budget (ein
    // Makro-Schätzwert hob sie in der Höhle aufs Dach, und von dort fand der Scan nur noch das Dach). Der Scan-Aufwand pro
    // Frame ist unabhängig von der Kreatur-Zahl. EINE Quelle für Settle + `_creatureWaterContextAt` (kein Doppel-Scan); der
    // liefert { inWater, depthBelow, submerged, distToShore (Cap 12 m), shoreDir (XZ-Einheit Richtung Ufer | null) }.
    // DIE FELS-WAND DES TIERS (Leben-Schau 2, CI 38009273564): ein Schritt (kein Versetzen — weiter als 2 m vom letzten
    // Boden trägt die Säule, Ruf und Portal) liest den Boden als Schritt vom letzten Grund (`_koerperSchritt`): ging der
    // Leib in die Wand, steht er wieder, wo er zuletzt Boden las, sein Lauf hält, und die Ebene durch diesen Ort quer zum
    // Schritt hält ihn (`_wandHalt`, im Hüllen-Kontakt jedes Tier-Schritts). Jeder neue Boden blickt eine Cache-Weite
    // (0,5 m) längs der Gier voraus — liegt dort Wand, hält die Ebene den Leib davor, bevor er hinein geht (EINE
    // Dichte-Probe je Neu-Scan, die Wand-Regel nur, wo sie Fels trifft). Vorher trug der Fels-Fall die Oberkante der
    // Säule: der Wolf stand auf dem Dach der Höhle.
    // DIE KLETTERWAND (Prüfung 2 K02a): Wand ist auch, wo die Stirn des Leibs höher über seinem Heck steht, als er nicken
    // kann (`_kreaturKletterwand`) — der Schritt endet dort, wo die Stirn sie erreicht (`_kreaturGangBis`), und der Blick
    // voraus (`_kreaturBlickVoraus`) setzt die Ebene an denselben Ort: nach jedem neuen Grund, und wo der Grund ohne Blick
    // gesetzt wurde (Ruf, Stoß), die Gier sich dreht oder der Leib anläuft, auch am gecachten Ort. Die Regel gilt dem GANG
    // (der Leib läuft, `_steuer.v` > 0) UNTER FELS (`_kreaturUnterFels`) — ein Stoß, eine Hülle, die ihn schiebt, tragen ihn
    // wie zuvor (der Stoß hat seine 45°-Wand, `_kreaturStossSchritt`), eine Klippe unter freiem Himmel bleibt, wie sie war.
    // Vorher hielt nur ein Dach, und der Blick
    // fehlte nach dem Stoß: der laufende Wolf stieg die gekrümmte Höhlenwand 1 m hinauf und sprang beim nächsten Grund 0,5 m
    // zurück, unter CPU-Last hob ihn der Nick-Deckel 1,00 m über seinen Grund.
    _creatureGroundY(creature) {
        const cx = creature.position.x;
        const cz = creature.position.z;
        const ud = creature.userData;
        let schritt = false;
        if (ud.cachedGroundY !== undefined) {
            const dx = cx - ud.cachedGroundX;
            const dz = cz - ud.cachedGroundZ;
            const d2 = dx * dx + dz * dz;
            if (d2 < 0.25) {
                // < 0.5 m bewegt → Cache; läuft der Leib und fehlt sein Blick als Gang, oder drehte sich die Gier → er blickt
                // vom Ort des Grunds
                if (
                    this._creatureGroundBudget > 0 &&
                    Number.isFinite(ud.cachedGroundY) &&
                    ud._steuer &&
                    ud._steuer.v > 0 &&
                    (!ud._wandBlickGang || !(Math.abs((creature.rotation.y || 0) - ud._wandBlickGier) <= 0.25))
                ) {
                    this._creatureGroundBudget--;
                    this._kreaturBlickVoraus(creature, ud.cachedGroundX, ud.cachedGroundZ, ud.cachedGroundY);
                }
                return ud.cachedGroundY;
            }
            schritt = d2 < 4 && Number.isFinite(ud.cachedGroundY);
        }
        if (this._creatureGroundBudget > 0 || ud.cachedGroundY === undefined) {
            if (this._creatureGroundBudget > 0) this._creatureGroundBudget--;
            let gY = schritt
                ? this._koerperSchritt(ud.cachedGroundX, ud.cachedGroundZ, ud.cachedGroundY, cx, cz)
                : this._koerperBodenUnter(cx, creature.position.y - (ud._hopH || 0), cz);
            const hl = this._kreaturHalbLaenge(creature);
            if (schritt) {
                const x0 = ud.cachedGroundX;
                const z0 = ud.cachedGroundZ;
                const g0 = ud.cachedGroundY;
                const n = Math.hypot(cx - x0, cz - z0);
                const nx = (cx - x0) / n;
                const nz = (cz - z0) / n;
                const gang = !!(ud._steuer && ud._steuer.v > 0);
                const w =
                    gY === null
                        ? { t: 0, g: g0 }
                        : gang && this._kreaturUnterFels(x0, g0, z0)
                          ? this._kreaturGangBis(x0, z0, g0, cx, cz, gY, nx, nz, hl)
                          : { t: 1, g: gY };
                if (w.t < 1) {
                    // die Wand: der Leib steht, wo seine Stirn sie erreicht (oder wo er zuletzt Boden las), sein Lauf hält
                    const hx = x0 + (cx - x0) * w.t;
                    const hz = z0 + (cz - z0) * w.t;
                    ud._wandHalt = { x: hx, z: hz, nx, nz };
                    ud._wandBlickGier = creature.rotation.y || 0;
                    ud._wandBlickGang = gang;
                    creature.position.x = hx;
                    creature.position.z = hz;
                    if (ud._steuer) ud._steuer.v = 0;
                    ud.cachedGroundY = w.g;
                    ud.cachedGroundX = hx;
                    ud.cachedGroundZ = hz;
                    return w.g;
                }
            }
            ud.cachedGroundY = gY;
            ud.cachedGroundX = cx;
            ud.cachedGroundZ = cz;
            this._kreaturBlickVoraus(creature, cx, cz, gY);
            return gY;
        }
        // Budget erschöpft: der leicht veraltete Cache (imperzeptibel, < 1 Frame) — eine frische Kreatur scannte oben. Der
        // Makro-Schätzwert dahinter war unerreichbar und las die Oberkante der Säule (das Dach); er fiel (Leben-Schau 2).
        return ud.cachedGroundY;
    }

    // DER BLICK VORAUS des Tier-Schritts (`_creatureGroundY`): vom Grund g bei (x, z) eine Cache-Weite (0,5 m) längs der
    // Gier — liegt dort ein Dach über dem Weg (`_koerperSchritt` null) oder erreicht die Stirn eine Kletterwand
    // (`_kreaturGangBis`), hält die Ebene `_wandHalt` den Leib dort, wo es beginnt. Erst die Filter: Fels eine Stufe über dem
    // Grund dort, oder (im Gang unter Fels) die Kletterwand am nächsten Stand — erst dann der Schritt-Boden dort. Gier und
    // Gang des Blicks stehen in `_wandBlickGier` und `_wandBlickGang` (ein Ruf, ein Stoß löscht sie).
    _kreaturBlickVoraus(creature, x, z, g) {
        const ud = creature.userData;
        const gier = creature.rotation.y || 0;
        const gang = !!(ud._steuer && ud._steuer.v > 0);
        ud._wandBlickGier = gier;
        ud._wandBlickGang = gang;
        ud._wandHalt = null;
        if (!Number.isFinite(g)) return;
        const hl = this._kreaturHalbLaenge(creature);
        const vx = Math.sin(gier);
        const vz = Math.cos(gier);
        const ax = x + vx * 0.5;
        const az = z + vz * 0.5;
        const kletter = gang && this._kreaturUnterFels(x, g, z);
        if (
            !this._fieldSolid(ax, g + AnazhRealm.PLAYER_STEP_UP, az) &&
            !(kletter && this._kreaturKletterwand(ax, az, g, vx, vz, hl))
        )
            return;
        const gA = this._koerperSchritt(x, z, g, ax, az);
        const t = gA === null ? 0 : kletter ? this._kreaturGangBis(x, z, g, ax, az, gA, vx, vz, hl).t : 1;
        if (t < 1) ud._wandHalt = { x: x + vx * 0.5 * t, z: z + vz * 0.5 * t, nx: vx, nz: vz };
    }

    _creatureWaterContextAt(creature, surfaceY) {
        const x = creature.position.x;
        const z = creature.position.z;
        const cy = creature.position.y;
        // V17.113 — `surfaceY` kommt jetzt aus `_creatureGroundY` (gecacht) statt
        // einem eigenen `_voxelSurfaceY`-Scan → kein Doppel-Scan pro Kreatur. Das Wasser ist die EINE Wahrheit am Körper
        // (`_koerperWasser` über diesem Grund — dieselbe, die Lage und Schwimmen des Tiers trägt); bis zur Gegenprüfung las
        // die Ufer-Scheu das 3×3-gedehnte `_waterLevelAt`.
        const surfY = surfaceY === null || !Number.isFinite(surfaceY) ? cy : surfaceY;
        const waterY = this._koerperWasser(x, z, surfY);
        const depthBelow = waterY - surfY;
        const inWater = depthBelow > 0;
        const submerged = cy < waterY - 0.1;
        if (!inWater) {
            return { inWater: false, depthBelow, submerged, distToShore: 0, shoreDir: null };
        }
        // Nächste Land-Cell in 4 Himmelsrichtungen, 3-m-Schritte bis 12 m (≤16 Proben). Kürzeste Richtung
        // gewinnt, Gleichstand bevorzugt die zuerst geprüfte — harmlos, jede führt aus dem Wasser.
        const STEP = 3;
        const MAX = 12;
        let bestDist = Infinity;
        let bestDx = 0;
        let bestDz = 0;
        // dx/dz-Paare inline statt Array-Iteration (eine Allokation gespart).
        for (let d = 0; d < 4; d++) {
            const dx = d === 0 ? 1 : d === 1 ? -1 : 0;
            const dz = d === 2 ? 1 : d === 3 ? -1 : 0;
            for (let step = STEP; step <= MAX; step += STEP) {
                const lx = x + dx * step;
                const lz = z + dz * step;
                const lb = this._voxelSurfaceY(lx, lz);
                if (lb !== null && Number.isFinite(lb) && lb > this._koerperWasser(lx, lz, lb) + 0.1) {
                    if (step < bestDist) {
                        bestDist = step;
                        bestDx = dx;
                        bestDz = dz;
                    }
                    break;
                }
            }
        }
        if (!Number.isFinite(bestDist)) {
            return { inWater: true, depthBelow, submerged, distToShore: Infinity, shoreDir: null };
        }
        const shoreDir = new THREE.Vector3(bestDx, 0, bestDz);
        // bestDx/bestDz ist immer entweder ±1 oder 0 (Kardinal-Richtung) —
        // Länge ist genau 1, normalize() wäre tautologisch, hier explizit
        // für Code-Klarheit: Caller darf nicht über Magnitude überraschen.
        return { inWater: true, depthBelow, submerged, distToShore: bestDist, shoreDir };
    }
}
