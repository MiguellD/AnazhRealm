class AnazhRealm_gelaende_boden {
    // ===== ATLAS · Gelaende/boden — Welt-Genese · Genesis-Platz · Boden-Sicht · Hang und Fels · Stufen-Kette · Höhe =====
    // DER GEZEICHNETE BODEN AM WELT-PUNKT (K07, der Chunk-Rand): je Punkt die OBERSTE tragende Fläche aller Meshe, die dort
    // zeichnen — das Gesetz der Boden-Karte (`_bodenKarteAusMesh`) über die Chunk-Naht hinweg. Am unteren Rand jedes Chunks
    // (je Achse ein halber Zellen-Schritt, 0,9 m) zeichnet das Mesh des NACHBARN (Surface-Nets: die Fläche zwischen seiner
    // letzten und der ersten eigenen Zelle gehört ihm); die Karte des Eigners ist dort leer oder trägt nur, was er darunter
    // zeichnet (einen Höhlen-Boden 60 m tiefer), und die Naht der Meshe liegt zwischen zwei Punkten des Rasters. Darum nimmt
    // jede Ecke der Raster-Zelle das Maximum aus Eigner und unteren Nachbarn: die Karten einer Stufe tasten dasselbe Raster der
    // Welt ab (Ursprung Chunk − Schritt, Abstand Schritt/Teilung, der Chunk ein Vielfaches davon), ihr Saum reicht zwei Schritte
    // herüber. Vorher las der Stand-Leser nur die Karte des Eigners und fiel im Streifen auf den Träger: 4,9 % der Fläche, ein
    // Netz aus 0,9-m-Streifen, auf dem Pfoten und Füße auf der Höhe des Leibs standen (am 30°-Hang 86 von 869 Stand-Pfoten im
    // Trab 12–22 cm über dem Boden, ein stehender Wolf hangauf mit den Hinterpfoten 0,40 m — gate:koerper-stand K6). null ohne
    // Karte (fern, ungebaut) oder ohne Boden an einer Ecke. DER EINE LESER DES GEZEICHNETEN BODENS (K21): Stand-Leser, Nah-Wiese
    // (Fuß, Hang, Grün) und Nah-Streu (Fuß, Hang) lesen nur ihn — bis K21 lasen Wiese und Streu nur die Karte des Eigners, im
    // Rand-Streifen fiel kaum ein Büschel (Dichte 0,11 gegen 1,31 je m², gate:koerper-stand K7). `aus` (optional) trägt den
    // Grün-Kanal (0…1) der Karte, die an jeder Ecke gewinnt; welche Karten ein Rechteck liest, nennt `_bodenSichtChunks`.
    _bodenSichtAt(x, z, aus) {
        const vc = this.state.voxelChunks;
        if (!vc) return null;
        const span = this._voxelChunkConfig(0).span;
        const cx = Math.floor(x / span);
        const cz = Math.floor(z / span);
        const e = vc.get(`${cx},${cz}`);
        const lod = e ? e.lod || 0 : 0;
        const cfg = this._voxelChunkConfig(lod);
        const T = AnazhRealm.BODEN_KARTE_TEILUNG;
        const h = cfg.step / T;
        const M = T * (cfg.dim + 3) + 1;
        const n = cfg.dim * T; // Raster-Abstände je Chunk
        const gx = Math.floor(x / h);
        const gz = Math.floor(z / h);
        let a = -Infinity,
            b = -Infinity,
            c = -Infinity,
            d = -Infinity;
        let ga = 0,
            gb = 0,
            gc = 0,
            gd = 0;
        // DIE STUFEN-NAHT (K51): ein unterer Nachbar einer anderen Stufe tastet sein eigenes Raster ab — er trägt seine Fläche
        // bilinear in SEINEM Raster bei (alle vier Ecken), die Karten der Stufe des Eigners je Ecke. Bis K51 las der Leser über die
        // Stufen-Grenze nichts: im Rand-Streifen einer Naht (die Nah-Zone 3×3, 43–65 m vor dem Auge) fiel er auf den Träger
        // (gate:koerper-stand K6: 346 von 772 Punkten mehr als 25 cm neben dem gezeichneten Boden, Pfoten 24 cm).
        let fremd = -Infinity,
            fremdG = 0;
        for (let q = 0; q < 4; q++) {
            const ax = cx - (q & 1);
            const az = cz - (q >> 1);
            const E = q === 0 ? e : vc.get(`${ax},${az}`);
            if (E && E.surfMap && (E.lod || 0) !== lod) {
                const v = this._bodenKarteBilinear(E, ax, az, x, z, aus);
                if (v !== null && v.y > fremd) {
                    fremd = v.y;
                    fremdG = v.gruen;
                }
                continue;
            }
            const m = E && (E.lod || 0) === lod ? E.surfMap : null;
            if (!m) continue;
            const i = gx - ax * n + T;
            const j = gz - az * n + T;
            if (i < 0 || j < 0 || i + 1 >= M || j + 1 >= M) continue;
            const o = i + j * M;
            const g = aus ? E.gruenMap : null;
            // DER GEOMORPH DER STUFE (K51-2): im Übergangs-Band zeichnet der Stoff zwischen der Karte der Lage und der des Ziels
            const st = this._bodenStufeMisch(E, ax, az, x, z);
            const ka = st ? st(m, o) : m[o],
                kb = st ? st(m, o + 1) : m[o + 1],
                kc = st ? st(m, o + M) : m[o + M],
                kd = st ? st(m, o + M + 1) : m[o + M + 1];
            if (ka > a) {
                a = ka;
                ga = g ? g[o] : 0;
            }
            if (kb > b) {
                b = kb;
                gb = g ? g[o + 1] : 0;
            }
            if (kc > c) {
                c = kc;
                gc = g ? g[o + M] : 0;
            }
            if (kd > d) {
                d = kd;
                gd = g ? g[o + M + 1] : 0;
            }
        }
        const eigen = a > -Infinity && b > -Infinity && c > -Infinity && d > -Infinity;
        const fu = x / h - gx;
        const fv = z / h - gz;
        const y = eigen ? (a * (1 - fu) + b * fu) * (1 - fv) + (c * (1 - fu) + d * fu) * fv : -Infinity;
        if (fremd > y) {
            if (aus) aus.gruen = fremdG;
            return fremd;
        }
        if (!eigen) return null;
        if (aus) aus.gruen = ((ga * (1 - fu) + gb * fu) * (1 - fv) + (gc * (1 - fu) + gd * fu) * fv) / 255;
        return y;
    }
    // Die Karte EINES Chunks (ax, az) bilinear am Punkt in ihrem eigenen Raster (Schritt ihrer Stufe / Teilung): { y, gruen }
    // oder null (der Punkt liegt nicht über der Karte, eine Ecke ohne Boden). Der Leser der Stufen-Naht (`_bodenSichtAt`).
    _bodenKarteBilinear(E, ax, az, x, z, aus) {
        const cfg = this._voxelChunkConfig(E.lod || 0);
        const T = AnazhRealm.BODEN_KARTE_TEILUNG;
        const h = cfg.step / T;
        const M = T * (cfg.dim + 3) + 1;
        const n = cfg.dim * T;
        const gx = Math.floor(x / h);
        const gz = Math.floor(z / h);
        const i = gx - ax * n + T;
        const j = gz - az * n + T;
        if (i < 0 || j < 0 || i + 1 >= M || j + 1 >= M) return null;
        const m = E.surfMap;
        const o = i + j * M;
        const st = this._bodenStufeMisch(E, ax, az, x, z);
        const a = st ? st(m, o) : m[o],
            b = st ? st(m, o + 1) : m[o + 1],
            c = st ? st(m, o + M) : m[o + M],
            d = st ? st(m, o + M + 1) : m[o + M + 1];
        if (!(a > -Infinity && b > -Infinity && c > -Infinity && d > -Infinity)) return null;
        const fu = x / h - gx;
        const fv = z / h - gz;
        const g = aus ? E.gruenMap : null;
        return {
            y: (a * (1 - fu) + b * fu) * (1 - fv) + (c * (1 - fu) + d * fu) * fv,
            gruen: g
                ? ((g[o] * (1 - fu) + g[o + 1] * fu) * (1 - fv) + (g[o + M] * (1 - fu) + g[o + M + 1] * fu) * fv) / 255
                : 0,
        };
    }
    // DIE KARTE DES ZIELS (K51-2): die Boden-Karte des Chunks aus seinen Morph-Zielen (`aMorphTarget` — das Netz der nächst
    // gröberen Stufe, an der Naht der gröbere Nachbar), lazy beim ersten Leser im Übergangs-Band, neu nach jedem Naht-Morph
    // (`_applyCrossLodGeomorph` leert sie). Der Stoff zeichnet Lage + (Ziel − Lage) · Faktor; Naht + Stufe − Naht · Stufe ist in
    // der Stufe linear: die Karte der Lage (`surfMap`, Naht eingerechnet) und die des Ziels, gemischt mit dem Stufen-Gewicht.
    // Liefert die Misch-Funktion (Karte, Index) → Höhe am Punkt (x, z), oder null, wo das Gewicht 0 ist.
    _bodenStufeMisch(E, ax, az, x, z) {
        if (!E || !E.mesh || !E.mesh.geometry || (E.lod || 0) >= 3) return null;
        const U = this.state.atmoUniforms;
        const w = this._stufeGewicht(E.lod || 0, x, z) * (U && U.geomorph ? U.geomorph.value : 1);
        if (!(w > 0)) return null;
        if (!E.surfMapZiel) {
            const g = E.mesh.geometry;
            const k = this._bodenKarteAusMesh(
                g.attributes.aMorphTarget.array,
                g.index ? g.index.array : null,
                g.attributes.color ? g.attributes.color.array : null,
                ax,
                az,
                E.lod || 0
            );
            E.surfMapZiel = k && k.hoehe;
            if (!E.surfMapZiel) return null;
        }
        const mz = E.surfMapZiel;
        return (m, o) => (m[o] > -Infinity && mz[o] > -Infinity ? m[o] + (mz[o] - m[o]) * w : m[o]);
    }
    // DIE KARTEN DES BODEN-LESERS über einem Rechteck (Welt-XZ): jeder Chunk, dessen Karte `_bodenSichtAt` dort liest — der
    // Eigner und, in den ersten zwei Zellen-Schritten des Chunks (so weit reicht der Saum einer Karte herüber), seine unteren
    // Nachbarn. Map Schlüssel → Karte (ein leerer Chunk mit undefined: baut er später Boden, ist das ein Neubau); null,
    // solange einer davon noch keine Karte hat — die Kachel wartet auf ihren GANZEN Boden, nie nach Streaming-Reihenfolge.
    _bodenSichtChunks(x0, z0, x1, z1) {
        const vc = this.state.voxelChunks;
        if (!vc) return null;
        const cfg = this._voxelChunkConfig(0);
        const out = new Map();
        for (let cz = Math.floor((z0 - 2 * cfg.step) / cfg.span); cz <= Math.floor(z1 / cfg.span); cz++) {
            for (let cx = Math.floor((x0 - 2 * cfg.step) / cfg.span); cx <= Math.floor(x1 / cfg.span); cx++) {
                const k = `${cx},${cz}`;
                const e = vc.get(k);
                if (!e || !(e.surfMap || e.empty)) return null;
                out.set(k, e.surfMap);
            }
        }
        return out;
    }

    // Täler und Seen trägt das Flussnetz des Gelände-Gesetzbuchs (K16): ein See ist eine Senke des Netzes (Ebene 0),
    // die Hydrosphäre füllt sie — keine Erosions-Simulation, kein Tarn-Pass, das Gelände entwässert aus sich selbst.

    // Worldgen-Inseln über `spawnIslandAt` (Surface-Nets, ein Pfad); Spawn-Y aus der echten Voxel-Surface
    // (`maxHeight` ist in Voxel-Welten 0 — `maxHeight + 20` landete Inseln IM Terrain).
    _worldgenSpawnFloatingIslands(WORLD_SIZE) {
        this.state.floatingIslands = [];
        this.state.ufos = [];
        // V18.331 — Dev-Drossel revertiert (schneller Cold-Start): fliegende Inseln zurück auf 3.
        const numIslands = 3;
        // Γ5-Stream-Gesetz: Math.random im Worldgen würfelt Peers in verschiedene Welten — pro Insel ein
        // eigener Stream (seed + "-island-i") für Größe/Höhe/Position.
        const baseSeed = (this.state.worldMeta && this.state.worldMeta.seed) || "anazh-realm-seed";
        for (let i = 0; i < numIslands; i++) {
            const rng = this._streamRng(baseSeed + `-island-${i}`);
            const islandSize = 14 + rng() * 30; // 14..44 m Durchmesser
            const islandHeight = 6 + rng() * 10; // 6..16 m Wölbung
            const islandX = (rng() - 0.5) * WORLD_SIZE * 0.8;
            const islandZ = (rng() - 0.5) * WORLD_SIZE * 0.8;
            // Die Schwebe-Insel ist ein Wurf des Feldes: trägt die Wildnis den Ort nicht, steht keine (die Würfe davor
            // bleiben, der Strom je Insel ist eigen).
            if (!this._wildnisTraegt(islandX, islandZ)) continue;
            const surfY = typeof this._voxelSurfaceY === "function" ? this._voxelSurfaceY(islandX, islandZ) : 0;
            const baseSurf = Number.isFinite(surfY) ? surfY : this.state.terrainBaseHeight || 0;
            const islandY = baseSurf + 50 + rng() * 90; // 50..140 m über dem Boden
            const islandSeed = baseSeed + `-island-${i}`;
            const island = this.spawnIslandAt(islandX, islandY, islandZ, islandHeight, {
                size: islandSize,
                seed: islandSeed,
            });
            if (!island) continue;
            this.log(
                `Fliegende Insel ${i} erstellt: Position (${islandX.toFixed(1)}, ${islandY.toFixed(1)}, ${islandZ.toFixed(1)}), Grösse ${islandSize.toFixed(1)} m, Höhe ${islandHeight.toFixed(1)} m`
            );
            // V18.364 — die kosmetischen Insel-Begleiter-UFOs entfernt (Schöpfer „die
            // können raus, wirken falsch + flach, keine Struktur"). `spawnUfoAt`/`spawn_ufo`
            // bleiben fürs explizite Beschwören; der Himmel bleibt klar von Auto-UFOs.
        }
    }

    // Populated-Chunks-Cache aus dem Architektur-Altbestand ableiten (Reload → kein Doppel-Spawn).
    // Vegetation streamt am Chunk-Lifecycle (`_populateVoxelChunkVegetation` in `_ensureVoxelChunkAt`).
    _worldgenBuildVoxelChunkCache() {
        try {
            const vspan = this._voxelChunkConfig().span;
            this.state.voxelPopulatedChunks = new Set();
            // V9.96 — Spawn-Queue beim Worldgen-Reset leeren. Pending-Tasks
            // aus der alten Welt sind nicht mehr relevant (Atlas + Surface
            // sind neu generiert, alte Positionen können kollidieren).
            this.state.pendingVegSpawns = [];
            for (const a of this.state.architectures || []) {
                if (!a || !a.position) continue;
                const cx = Math.floor(a.position.x / vspan);
                const cz = Math.floor(a.position.z / vspan);
                this.state.voxelPopulatedChunks.add(`${cx},${cz}`);
            }
            this.log(
                `Welle 6.G P2: voxel-basierte Welt — Vegetation streamt mit den Voxel-Chunks (${this.state.voxelPopulatedChunks.size} Chunks aus Altbestand abgeleitet)`,
                "INFO"
            );
        } catch (e) {
            this.log(`populateChunkVegetation initial fehlgeschlagen: ${e.message}`, "ERROR");
        }
    }

    // Hydrosphären-Atlas (Drainage-Netz: Flüsse/Seen/Wasserfälle) + Render; Atlas VOR Render (Render
    // liest state.hydrosphere). Zwei try/catch — keine Stufe darf den Worldgen brechen.
    _worldgenComputeAndBuildHydrosphere() {
        try {
            // A3 (V18.132) — ein Welt-Regen erneuert die Heimat-Wahrheit: die
            // fernen Kacheln des ALTEN Seeds muessen fallen (lazy-Neubau aus
            // dem neuen Seed; derived, nie persistiert).
            this.state.hydroTiles = new Map();
            const hydro = this._computeHydrosphere();
            this.state.hydrosphere = hydro;
            this.log(
                `V9.43-b: Hydrosphäre berechnet — ${hydro.rivers.length} Flüsse, ${hydro.lakes.length} Seen, ${hydro.waterfalls.length} Wasserfälle`,
                "INFO"
            );
        } catch (e) {
            this.state.hydrosphere = null;
            this.log(`Hydrosphäre-Berechnung fehlgeschlagen: ${e.message}`, "ERROR");
        }
        // Globales Wasser-Y-Band für die Cell-Klassifikation: alle Chunks teilen es → Cells außerhalb sind
        // deterministisch gleich (above=AIR, below=WATER), die OOB-Naht bleibt konsistent.
        this._computeHydroBand();
        try {
            this._buildHydrosphereMeshes();
        } catch (e) {
            this.log(`Hydrosphäre-Rendering fehlgeschlagen: ${e.message}`, "ERROR");
        }
        // Der Worker erhält fertigen Atlas (full state-set); ab
        // `voxelWorkerSyncedHydroStateGen === voxelWorkerStateGen` traut ihm der Streaming-Pfad.
        // Bumpt stateGen → in-flight Pre-Worldgen-Requests werden verworfen.
        this._voxelWorkerSyncWorldgenState();
    }

    // Globales Wasser-Y-Band: top = der höchste Spiegel JEDES Wasser-Körpers (waterLevel, jeder See, jeder Punkt jedes Flusses)
    // + 10 m, bottom = waterLevel − 10 m (reicht, weil die Iso nur die OBERE Wassergrenze rendert). Cells außerhalb werden ohne
    // Density-Sample klassifiziert (above=AIR, below=WATER) — dieselbe Regel wie der OOB-Live-Compute in
    // `_buildVoxelChunkWaterIsoSurface` → nahtfrei. DER FLUSS GEHÖRT HINEIN (K16): das Band kannte nur die Seen; seit die
    // Landform im Gelände-Gesetz liegt, steigen die Flüsse in die Täler des Mittelgebirges (Spiegel bis 55 m), das Band endete
    // bei 23,7 m (der höchste See + 10) — der Zell-Bau ließ jede Fluss-Zelle darüber AIR: in der Heimat 344 von 549 Fluss-
    // Segmenten ohne gezeichnetes Wasser (am Bach -744/-872 Wasser-Meshes 0, die Quellen trocken).
    _computeHydroBand() {
        const wl = typeof this.state.waterLevel === "number" ? this.state.waterLevel : 0;
        let topY = wl;
        const hebe = (h) => {
            if (!h) return;
            if (Array.isArray(h.lakes))
                for (const lake of h.lakes) if (Number.isFinite(lake.level) && lake.level > topY) topY = lake.level;
            if (Array.isArray(h.rivers))
                for (const fluss of h.rivers)
                    for (const p of fluss.points || []) if (Number.isFinite(p.S) && p.S > topY) topY = p.S;
        };
        hebe(this.state.hydrosphere);
        // A3 (V18.132) — das Band ist GLOBAL (V9.77: alle Chunks teilen die
        // Thresholds): die Spiegel der fernen Kacheln heben es mit, sonst
        // wuerde der Band-Skip ihre Zellen als garantiert-AIR ueberspringen.
        if (this.state.hydroTiles) for (const t of this.state.hydroTiles.values()) hebe(t);
        this.state.hydroBand = {
            top: topY + 10,
            bottom: wl - 10,
        };
    }

    // Das Wasser-Cell-Feld ist DERIVED (Worldgen-Density + voxelEdits + Architektur-Stempel): Spieler-
    // Mutationen propagieren via `_remeshVoxelChunksAround`, keine zweite Reaktiv-Schicht; der Atlas
    // (`state.hydrosphere`) bleibt worldgen-frozen.

    // Deterministischer (alle Peers gleich) offener, flacher, trockener Spawn-Punkt: Ring-Spirale um
    // (0,0), der ERSTE Punkt, der (a) kein Kavernenboden ist (surf ≥ macro − 6; `getTerrainHeightAt` ist
    // die echte Voxel-Oberfläche), (b) trocken liegt — über JEDEM Wasser (`_nassAt`, Marge 1,5 m: See,
    // Fluss, Tarn; bis 06.10. nur über dem Meeresspiegel), (c) die Scheibe der Genesis-Plattform trägt: der Grund unter ihr
    // (`_genesisGrund`) streut höchstens ihre Dicke — sie liegt auf und keine Kante steckt im Hang (K52; bis dahin ±6-m-Proben
    // mit Δ ≤ 3,5 m, die Scheibe schwebte darum 5 m darüber). Die Lichtung um die Plattform hält die EINE Natur-Wand frei
    // (ihr Bauplan trägt sie, Befund V-D1). Nichts gefunden bis 240 m → (0,0).
    _findOpenSpawnSpot() {
        const candidates = [[0, 0]];
        for (let r = 12; r <= 240; r += 12) {
            for (let a = 0; a < 8; a++) {
                const ang = (a / 8) * Math.PI * 2;
                candidates.push([Math.round(Math.cos(ang) * r), Math.round(Math.sin(ang) * r)]);
            }
        }
        const S = this._genesisScheibe();
        for (const [x, z] of candidates) {
            const surf = this.getTerrainHeightAt(x, z);
            if (!Number.isFinite(surf)) continue;
            const macro = this._terrainMacroSurfaceY(x, z);
            if (Number.isFinite(macro) && surf < macro - 6) continue; // Kavernen-/Kraterboden
            if (!this._landAt(x, z, 1.5)) continue; // nass (jedes Wasser)
            const g = this._genesisGrund(x, z, S.r);
            if (!(g.max - g.min <= S.dick)) continue;
            return { x, z, y: surf };
        }
        const h0 = this.getTerrainHeightAt(0, 0);
        return { x: 0, z: 0, y: Number.isFinite(h0) ? h0 : 0 };
    }

    // Die Scheibe der Genesis-Plattform aus ihrem Bauplan (die erste Scheibe: cylinder, size.x = Durchmesser, size.y = Dicke) —
    // dieselbe Zeile, aus der `_grundrissVon` ihre Lichtung misst. Der Bauplan ist eingebaut; fehlt er, bricht es laut.
    _genesisScheibe() {
        const bp = this.state.blueprints && this.state.blueprints.start_plattform;
        const p0 = bp && Array.isArray(bp.parts) && bp.parts[0] && bp.parts[0].size;
        if (!p0 || !(p0.x > 0) || !(p0.y > 0)) throw new Error("start_plattform: der Bauplan trägt keine Scheibe");
        return { r: p0.x / 2, dick: p0.y };
    }

    // Der Grund unter einer Scheibe mit Radius r um (x, z): der tiefste und der höchste Punkt des EINEN Boden-Gesetzes
    // (`getTerrainHeightAt` → `_voxelSurfaceY`) in der Mitte und auf zwei Ringen (r/2, r; je 12 Proben). { min, max }.
    _genesisGrund(x, z, r) {
        let min = this.getTerrainHeightAt(x, z);
        let max = min;
        for (const f of [0.5, 1])
            for (let k = 0; k < 12; k++) {
                const a = (k / 12) * Math.PI * 2;
                const h = this.getTerrainHeightAt(x + Math.cos(a) * r * f, z + Math.sin(a) * r * f);
                if (!(h >= min)) min = h;
                if (!(h <= max)) max = h;
            }
        return { min, max };
    }

    // Genesis-Plattform, idempotent (nur wenn keine start_plattform existiert, z. B. nach Reload — die EINE Quelle
    // `_genesisPlattform` sagt es); der Spieler steht oben drauf. Der Punkt kommt aus `_findOpenSpawnSpot`.
    // DIE SOHLE LIEGT AUF DEM GRUND (K52): die Scheibe steht mit ihrer Sohle auf dem tiefsten Punkt des Bodens unter ihr
    // (`_genesisGrund`) — sie schwebt an keiner Stelle, die höhere Kante sinkt höchstens ihre Dicke ein (die Wahl des Orts).
    // Bis K52 stand sie 5 m über dem Grund („erhöhte Warte", V8.29): seit der Ring der Tore um sie auf dem Boden steht
    // (V18.486), schwebte eine graue Scheibe über den Toren (Genesis 0/0: Sohle 95,31 m über Grund 90,01–90,57 m).
    _ensureGenesisPlatform() {
        if (!this.state.architectures) return;
        if (this._genesisPlattform()) return;
        const spot = this._findOpenSpawnSpot();
        const S = this._genesisScheibe();
        const g = this._genesisGrund(spot.x, spot.z, S.r);
        const sohle = Number.isFinite(g.min) ? g.min : spot.y;
        // spawnArchitecture setzt den Bau 0.5 unter den gereichten Ort (at_player-Kalibrierung): sein Ursprung ist die Sohle.
        this.spawnArchitecture("start_plattform", { x: spot.x, y: sohle + 0.5, z: spot.z }, { silent: true });
        // die Lichtung (ihr Bauplan, `_grundrissVon`): was die Natur schon um die Scheibe geworfen hat, fällt wie im Haus —
        // geräumt an der Wurzel (`spawnArchitecture`)
        // Spieler oben auf die Plattform setzen: die Oberseite liegt bei Sohle + Dicke, +1,2 Puffer.
        const spawnY = sohle + S.dick + 1.2;
        if (this.state.playerMesh) {
            this.state.playerMesh.position.set(spot.x, spawnY, spot.z);
            // Feld-nativ: Velocity nullen + vertikalen Feld-Zustand zurück (kein Ammo-Body).
            if (this.state.playerVel) this.state.playerVel.setValue(0, 0, 0);
            this.state._fieldVy = 0;
        }
        this.log(
            `Genesis-Plattform erstellt bei (${spot.x}, ${spot.z}), Sohle y=${sohle.toFixed(1)}, Spieler auf y=${spawnY.toFixed(1)}`
        );
    }

    // ### Terrain-Erweiterung ###
    // Höhen-Quelle ist `_voxelSurfaceY` (oberste Fest/Luft-Grenze im Dichte-Feld `_voxelDensityAt`);
    // `getTerrainHeightAt` + `findSurfaceAbove` routen darüber.

    // ### Das Dichte-Feld + Surface Nets ###
    // Tunnel/Höhlen/Überhänge brauchen ein 3D-Dichte-Feld — ein Heightfield hebt/senkt nur Säulen.

    // Dichte-Feld: > 0 fest, < 0 Luft, 0 Oberfläche = 2D-Makro-Oberfläche (`surf − y`) + zwei 3D-Noise-
    // Bänder (Höhlen, Überhänge); die Makro-Oberfläche ist die EINE Quelle für Dichte UND Hydrosphäre.
    // ===== FERNE BINNENGEWAESSER: die seed-deterministischen KACHELN =====
    // Die Heimat-Region (state.hydrosphere, ±1024 m) bleibt unangetastet; jenseits liefert eine
    // lazy Kachel (2048 m, dieselbe Maschinerie) Seen·Flüsse = f(seed, Kachel) — für jeden Peer
    // gleich. Der Kachel-Schlüssel wohnt im Gelände-Gesetzbuch (gelaende-core.js
    // `kachelSchluessel`), Stamm und voxel-worker lesen ihn dort; Kacheln sind DERIVED (nie im
    // Snapshot), Welt-Regen leert sie.
    // Die EINE Region-Aufloesung fuer alle Hydro-Leser: Heimat-Region, wenn
    // (x,z) in ihr liegt; sonst die Kachel; sonst die Heimat (deren OOB-Logik
    // in den Lesern = exakt der alte Pfad — H3-Ozean etc., bit-identisch).
    _hydroFor(x, z) {
        const h = this.state.hydrosphere;
        if (h && h.ready) {
            const sizeM = h.dim * h.cell;
            if (x >= h.originX && z >= h.originZ && x < h.originX + sizeM && z < h.originZ + sizeM) return h;
            const tiles = this.state.hydroTiles;
            if (tiles && tiles.size) {
                const t = tiles.get(globalThis.__gelaendeCore.kachelSchluessel(this._gelaende(), x, z));
                if (t && t.ready) return t;
            }
        }
        return h;
    }

    // Stellt sicher, dass jede Kachel, die [x±r, z±r] schneidet, berechnet ist (Heimat "0,0" immer).
    // Am Chunk-Build-Eingang gerufen = die HARTE Garantie: kein Chunk baut vor seiner Wasser/Erosions-
    // Wahrheit (keine Kachel-Naht durch Build-Reihenfolge). Neue Kachel → hydroBand neu + voller Worker-
    // Re-Sync (gen-bump verwirft stale Builds; die Nachrichten-Ordnung garantiert Kachel-vor-Request).
    _ensureHydroTilesAround(x, z, r) {
        const h = this.state.hydrosphere;
        if (!h || !h.ready) return 0; // vor dem Worldgen gibt es keine Wahrheit zu kacheln
        const size = AnazhRealm.HYDROSPHERE.regionSize;
        const half = size / 2;
        const r0x = Math.floor((x - r + half) / size);
        const r1x = Math.floor((x + r + half) / size);
        const r0z = Math.floor((z - r + half) / size);
        const r1z = Math.floor((z + r + half) / size);
        let made = 0;
        for (let rx = r0x; rx <= r1x; rx++) {
            for (let rz = r0z; rz <= r1z; rz++) {
                if (rx === 0 && rz === 0) continue;
                const key = `${rx},${rz}`;
                if (!this.state.hydroTiles) this.state.hydroTiles = new Map();
                if (this.state.hydroTiles.has(key)) continue;
                const t0 = performance.now();
                const origin = { x: rx * size - half, z: rz * size - half };
                this.state.hydroTiles.set(key, this._computeHydrosphere(origin));
                this._computeHydroBand();
                made++;
                const t = this.state.hydroTiles.get(key);
                this.log(
                    `A3: Hydro-Kachel ${key} berechnet (${Math.round(performance.now() - t0)} ms — ` +
                        `${t.rivers ? t.rivers.length : 0} Fluesse, ${t.lakes ? t.lakes.length : 0} Seen)`,
                    "INFO"
                );
            }
        }
        // NUR einen existierenden Worker syncen, NIE bootstrappen (`_voxelWorkerSyncWorldgenState` würde einen
        // genullten Worker re-spawnen; ohne Worker baut der Main sync mit der Kachel-Wahrheit). Kein Cache-
        // Clear nötig: kein Chunk der neuen Kachel wurde je gebaut, in-flight verwirft der gen-bump.
        if (made && this.state.voxelWorker) this._voxelWorkerSyncState({ op: "state-set" });
        return made;
    }

    // Slope + Rock-Exposure als abgeleitete Welt-Felder direkt aus `_voxelSurfaceY` — am Genese-Leser
    // (Spawn/Streu/Boden/Material), NICHT in worldFieldAt (Hot-Path). Vier `_voxelSurfaceY`-Calls pro
    // Slope: OK für Punkt-Probes, nicht für Massen-Aufrufe.
    // h_dx, h_dz: Δ über 2 m → slope dimensionslos (m/m): ~0 flach, ~1 = 45°, ~2 Klippe.
    _slopeAt(x, z, surf, eps) {
        // Die EINE Platzierungs-Slope-Quelle: |∇h| (m/m); Sampler + eps sind Parameter — Gras reicht die
        // gecachte surfMap, der Scatter-Bäcker getTerrainHeightAt ±2 m, Default _voxelSurfaceY. So lesen Gras
        // und Fels DIESELBE Steilheit. Die Fragment-Slope `aSlope`/`_steep` (Fels-FARBE) bleibt bewusst
        // getrennt (gerenderte Normale pro Pixel).
        const s = surf || ((px, pz) => this._voxelSurfaceY(px, pz));
        const e = eps || 1;
        const yE = s(x + e, z);
        const yW = s(x - e, z);
        const yN = s(x, z - e);
        const yS = s(x, z + e);
        if (!Number.isFinite(yE) || !Number.isFinite(yW) || !Number.isFinite(yN) || !Number.isFinite(yS)) {
            return 0;
        }
        const dxh = (yE - yW) / (2 * e);
        const dzh = (yS - yN) / (2 * e);
        return Math.hypot(dxh, dzh);
    }

    // Rock-Exposure: slope-getrieben, `smoothstep(0.75, 1.45, slope)` — die Kliffs und Flanken des Flussnetzes tragen
    // den Fels (K16: der Massiv-Bias des Ein-Massiv-Ankers fiel mit ihm). Returnt [0, 1].
    _rockExposureAt(x, z) {
        const slope = this._slopeAt(x, z);
        const ss = (e0, e1, v) => {
            let t = (v - e0) / (e1 - e0);
            t = t < 0 ? 0 : t > 1 ? 1 : t;
            return t * t * (3 - 2 * t);
        };
        return ss(0.75, 1.45, slope);
    }

    // DIE EINE 2D-HÖHE der Welt: das Gelände-Gesetzbuch (gelaende-core.js `hoehe` — der Term-Auswerter des Erbguts,
    // der Wildnis-Term, der Makro-Anker) an der Lage dieser Welt. Liest jeder Leser der Höhe (Dichte, Hydrosphäre,
    // Fern-Ring, Spawn-Ort, Erosion); der voxel-worker ruft DASSELBE Gesetzbuch mit seinem Zustand (kein Spiegel).
    // `aus` (optional) trägt den Hang der Fläche (`hang`, tan) — der Spalten-Kontext liest ihn für die Höhlen-Mündung.
    _terrainMacroSurfaceY(x, z, includeDetail = true, aus) {
        return globalThis.__gelaendeCore.hoehe(this._gelaende(), x, z, includeDetail, aus);
    }

    // DIE GELÄNDE-LAGE: was das Gesetzbuch liest, unter den Namen des Worker-Zustands — eine LEBENDE Sicht auf
    // `state` (jeder Zugriff liest den Stand von jetzt; kein zweiter Speicher, nichts zu synchronisieren). Der Rausch-
    // Strom `_voxelNoise` entsteht beim ersten Lesen aus der Saat; `erbgut` ist die gemerkte Normalform (sie trägt die
    // Regler der Landform), `regionSize` die Kachel-Kante der Hydrosphäre.
    _gelaende() {
        if (this._gelaendeLage) return this._gelaendeLage;
        const realm = this;
        this._gelaendeLage = {
            get seed() {
                return (realm.state.worldMeta && realm.state.worldMeta.seed) || "anazh-realm-seed";
            },
            get noise() {
                if (!realm._voxelNoise)
                    realm._voxelNoise = globalThis.__gelaendeCore.lageRausch(this.seed, SimplexNoise);
                return realm._voxelNoise;
            },
            get baseHeight() {
                return realm.state.terrainBaseHeight;
            },
            get waterLevel() {
                return realm.state.waterLevel;
            },
            get erbgut() {
                return realm._erbgutCache || realm._erbgut();
            },
            get regionSize() {
                return AnazhRealm.HYDROSPHERE.regionSize;
            },
            get erdbau() {
                return realm._erdbauLage();
            },
        };
        return this._gelaendeLage;
    }

    // DER ERDBAU DER ORTE (K10, Welt = Funktion + Abweichungen): `worldMeta.erdbau` trägt je Ort (Schlüssel) die Splats seines
    // Plans v2 (fachwerk `ortPlan`); die Gelände-Funktion liest sie als letzten Term (gelaende-core `erdbauY`) — Stamm und
    // voxel-worker dieselbe Liste in derselben Reihenfolge (die Reihenfolge, in der die Orte entstanden). Reist im Snapshot
    // (worldMeta) und zum Gast; jeder Peer, der denselben Akt ausführt, legt denselben Erdbau.
    _erdbauRoh() {
        const wm = this.state.worldMeta;
        const E = wm && wm.erdbau && typeof wm.erdbau === "object" ? wm.erdbau : null;
        const out = [];
        if (!E) return out;
        for (const k of Object.keys(E)) if (Array.isArray(E[k])) for (const p of E[k]) out.push(p);
        return out;
    }
    // Die Normalform des Erdbaus (gemerkt je Stand; null = kein Ort) — die Gelände-Lage liest sie je Höhe.
    _erdbauLage() {
        const wm = this.state.worldMeta;
        const roh = wm ? wm.erdbau : undefined;
        if (
            this._erdbauGemerkt === true &&
            this._erdbauGemerktRoh === roh &&
            this._erdbauGemerktStand === this._erdbauStand
        )
            return this._erdbauNorm;
        this._erdbauNorm = globalThis.__gelaendeCore.erdbauNormal(this._erdbauRoh());
        this._erdbauGemerkt = true;
        this._erdbauGemerktRoh = roh;
        this._erdbauGemerktStand = this._erdbauStand;
        return this._erdbauNorm;
    }
    // Ein Ort legt seinen Erdbau (einmal je Schlüssel): die Gelände-Funktion, ihre Caches, der Worker, die Chunks und Felder im
    // Umkreis folgen, und der Wald plant den Ort frei. Fail-closed: eine fremde Splat-Art wirft, bevor die Welt sie trägt.
    // DER ERDBAU FÄLLT AM ORT (K69, das Gesetz der Edits seit K23): der Term wirkt nur bis `ERDBAU.reichweiteM` um seine
    // Flächen (gelaende-core `erdbauY`) — so fallen nur die Gedächtnisse, die er ändern kann: Dichte, Basis-Dichte und Mesh
    // der Chunks im Umkreis, die Antworten des Workers im Flug nur dort (`_voxelStand`), der Wald seiner Zellen samt allem,
    // was sie liest (`_forestDartsFallen`). Bis K69 warf jeder Erdbau die Gedächtnisse der ganzen Welt: der Gang in ein Dorf
    // (der Dorf-Zug legt das nächste) plante danach 2 579 Wald-Zellen synchron neu, der längste Takt 880 ms (Null-Renderer,
    // Dorfweg gehend), an der Radeon ein Frame von 3,1 s (`_forestCellDarts › planForestCell`, die Hänger-Linse).
    _erdbauSetzen(key, splats) {
        const wm = this.state.worldMeta || (this.state.worldMeta = {});
        if (!wm.erdbau || typeof wm.erdbau !== "object") wm.erdbau = {};
        if (wm.erdbau[key] || !Array.isArray(splats) || !splats.length) return false;
        const G = globalThis.__gelaendeCore;
        // gefragt VOR dem Eintrag: ändert dieser Erdbau den Grund an gezeichnetem Wasser? (`_erdbauAmWasser`)
        const amWasser = this._erdbauAmWasser(G.erdbauNormal(splats));
        wm.erdbau[key] = splats;
        this._erdbauStand = (this._erdbauStand || 0) + 1;
        let x0 = Infinity;
        let x1 = -Infinity;
        let z0 = Infinity;
        let z1 = -Infinity;
        for (const p of splats) {
            const flaeche = p.art !== "trasse"; // platte und frei: ein Rechteck um (cx, cz)
            const r = flaeche ? Math.hypot(p.ex, p.ez) : p.w / 2;
            const xs = flaeche ? [p.cx] : [p.x0, p.x1];
            const zs = flaeche ? [p.cz] : [p.z0, p.z1];
            for (const x of xs) {
                x0 = Math.min(x0, x - r);
                x1 = Math.max(x1, x + r);
            }
            for (const z of zs) {
                z0 = Math.min(z0, z - r);
                z1 = Math.max(z1, z + r);
            }
        }
        const R = G.ERDBAU.reichweiteM;
        const { span } = this._voxelChunkConfig();
        // die Chunks des Umkreises samt einem Chunk Rand (der Mesher liest eine Zelle in den Nachbarn), je Stufe
        const ka = Math.floor((x0 - R) / span) - 1;
        const kb = Math.floor((x1 + R) / span) + 1;
        const la = Math.floor((z0 - R) / span) - 1;
        const lb = Math.floor((z1 + R) / span) + 1;
        const caches = [this.state.voxelBaseDensityCache, this.state.voxelDensityCache, this.state.voxelMeshCache];
        const genKarte = this._erdbauGenKarte || (this._erdbauGenKarte = new Map());
        this._editGenZaehler = (this._editGenZaehler || 0) + 1; // EIN steigender Zähler mit den Edits (nie wiederholt)
        for (let a = ka; a <= kb; a++)
            for (let b = la; b <= lb; b++) {
                genKarte.set((a + 32768) * 65536 + (b + 32768), this._editGenZaehler);
                for (const c of caches)
                    if (c && c.size) for (let lod = 0; lod <= 3; lod++) c.delete(`${a},${b},${lod}`);
            }
        this._forestDartsFallen(x0, z0, x1, z1);
        // der Erdbau reist an JEDEN Faden am Zustand (Voxel- und Wald-Faden) über den EINEN Sender (`_voxelZustandPost`)
        this._voxelZustandPost({ type: "state-update", delta: { erdbau: this._erdbauRoh() } });
        const cx = (x0 + x1) / 2;
        const cz = (z0 + z1) / 2;
        const rad = Math.hypot(x1 - x0, z1 - z0) / 2 + R;
        if (!this.state.grassDirtyChunks) this.state.grassDirtyChunks = new Set();
        for (let a = Math.floor((cx - rad) / span); a <= Math.floor((cx + rad) / span); a++)
            for (let b = Math.floor((cz - rad) / span); b <= Math.floor((cz + rad) / span); b++)
                this.state.grassDirtyChunks.add(`${a},${b}`);
        this._remeshVoxelChunksAround(cx, cz, rad);
        if (amWasser) this._invalidateWaterCapsAround(cx, cz, rad);
        this._invalidateBakedRegionsAround(cx, cz, rad);
        if (typeof this._scheduleEditSave === "function") this._scheduleEditSave();
        return true;
    }
    // DAS WASSER DES ERDBAUS (K10): ändert der Erdbau E (die Normalform seiner Splats) den Grund an gezeichnetem Wasser? Die
    // Regel des Zell-Stempels — ein Bau weckt den Automaten nur, wenn er eine Wasser-Zelle berührt (gate:werk-im-wasser R:
    // das Dorf am Seerand weckte ihn, ohne Wasser zu verdrängen). Je Zelle seiner Reichweite (gelaende-core `zellen`) ein
    // 2-m-Raster: an jeder nassen Spalte (`_nassAt`) rückt E den Grund in eine andere Sim-Zelle (DIESELBEN Zellen, die der
    // Automat liest — ein Grund, der in seiner Zelle bleibt, ändert kein Wasser), oder eine Sim-Zelle daneben schneidet E ihn
    // eine Zelle tiefer unter den Spiegel (ein Schnitt öffnet dem Wasser einen Weg; eine Schüttung daneben verdrängt keins).
    _erdbauAmWasser(E) {
        if (!E) return false;
        const G = globalThis.__gelaendeCore;
        const Z = G.ERDBAU.zelleM;
        const cfg = this._voxelChunkConfig(0);
        const d = cfg.step;
        const oy = (this.state.terrainBaseHeight || 0) - cfg.floorDrop;
        const zelle = (h) => Math.floor((h - oy) / d);
        let spiegel = -Infinity;
        const aendert = (x, z, nurSchnitt) => {
            const h0 = this._terrainMacroSurfaceY(x, z, true);
            const h1 = G.erdbauY(E, x, z, h0);
            return nurSchnitt ? zelle(h1) < zelle(h0) && h1 < spiegel : zelle(h1) !== zelle(h0);
        };
        for (const key of E.zellen.keys()) {
            const a = Math.floor(key / 65536) - 32768;
            const b = (key % 65536) - 32768;
            for (let i = 1; i < Z; i += 2)
                for (let j = 1; j < Z; j += 2) {
                    const x = a * Z + i;
                    const z = b * Z + j;
                    if (!this._nassAt(x, z)) continue;
                    if (aendert(x, z, false)) return true;
                    spiegel = this._atlasWaterLevelAt(x, z, -1e9);
                    if (
                        aendert(x + d, z, true) ||
                        aendert(x - d, z, true) ||
                        aendert(x, z + d, true) ||
                        aendert(x, z - d, true)
                    )
                        return true;
                }
        }
        return false;
    }
    *_ortWahl(plan, origin) {
        if (plan && plan.version === 2) return plan;
        // je Ort EIN Plan v2 (der zweite Akt am selben Anker liest sonst den Erdbau des ersten als Gelände)
        const key = "ort:" + (plan.seed >>> 0) + ":" + Math.round(origin.x) + "," + Math.round(origin.z);
        const ple = this._ortPlaene || (this._ortPlaene = new Map());
        let v2 = ple.get(key);
        if (!v2) {
            const mass = (this._ortWahlMass = { kandidaten: 0, scheiben: 0, ms: 0, maxMs: 0, abstandM: null });
            // das Welt-Wasser des GESETZES (Meer, See, Fluss: `_atlasWaterLevelAt` über der Höhe — nie das gezeichnete, das
            // vom Lade-Stand abhinge: jeder Peer legt denselben Plan) setzt das Brücken-Etikett; unter der Brücke legt der
            // Erdbau nichts
            const ctx = globalThis.__gelaendeCore.ortCtx(this._gelaende(), (x, z) => {
                const w = this._atlasWaterLevelAt(x, z, -1e9);
                return w > -Infinity && w > this._terrainMacroSurfaceY(x, z, true);
            });
            const W = AnazhRealm.ORT_WAHL;
            let reich = 0; // so weit reicht der Plan um seinen Ursprung (das Wasser jedes Kandidaten muss gekachelt sein)
            for (const s of plan.slots) reich = Math.max(reich, Math.hypot(s.x || 0, s.z || 0) + 16);
            for (let ring = 0; ring <= W.ringe && !v2; ring++) {
                const n = ring ? Math.ceil(2 * Math.PI * ring) : 1;
                for (let i = 0; i < n && !v2; i++) {
                    const a = (2 * Math.PI * i) / n;
                    const o = {
                        x: origin.x + Math.cos(a) * ring * W.schrittM,
                        z: origin.z + Math.sin(a) * ring * W.schrittM,
                    };
                    // das Wasser des Kandidaten ist gekachelt, bevor er urteilt — je Kandidat, nie die ganze Suche voraus (eine neue
                    // Kachel kostet ~200 ms; die Wahl reicht sie erst, wenn ihr Ring sie braucht)
                    if (this._ensureHydroTilesAround(o.x, o.z, reich)) yield;
                    const k = globalThis.__fachwerkCore.ortPlan(plan, o, ctx);
                    mass.kandidaten++;
                    yield;
                    // grob zuerst (`grobM`: ein Kanal ist Meter breit, die nassen Orte fallen dort), dann das Raster der Wand
                    if ((yield* this._ortTraegt(plan, k, W.grobM)) && (yield* this._ortTraegt(plan, k, 0.5))) {
                        v2 = k;
                        mass.abstandM = ring * W.schrittM;
                    }
                }
            }
            if (!v2) {
                v2 = globalThis.__fachwerkCore.ortPlan(plan, origin, ctx);
                this.log(
                    `ORT: der Plan „${plan.name || "?"}" findet binnen ${W.ringe * W.schrittM} m um ` +
                        `${Math.round(origin.x)}/${Math.round(origin.z)} keinen Ort, der jedes Haus trocken trägt — die Wand ` +
                        "wirft die nassen Häuser",
                    "WARN"
                );
            }
            this._erdbauSetzen(key, v2.erdbau);
            ple.set(key, v2);
        }
        const dx = v2.ort.x - origin.x;
        const dz = v2.ort.z - origin.z;
        origin.x = v2.ort.x;
        origin.z = v2.ort.z;
        if (origin.mitte) origin.mitte = { x: origin.mitte.x + dx, z: origin.mitte.z + dz };
        return v2;
    }
    // TRÄGT DER PLAN v2 `k` JEDES HAUS des Exports `plan`? (die Ort-Wahl, `_ortWahl`; ein Generator, der nach jedem Haus
    // abgibt) Jeder Punkt des Fundament-Rasters (`_fundamentRaster` im Schritt `schritt`: 0,5 m ist das Raster der Wand,
    // `_fundamentLand`; Grundriss samt Saum `ORT_GESETZ.saumM` und Vorplatz) und jede Laterne liegt mit dem Boden, den der
    // Erdbau des Plans baut, mindestens `WERK_LAND_M` über dem Wasser des Gesetzes an dieser Höhe (`_atlasWaterLevelAt`) —
    // das Urteil der Wand (`_fundamentLand` → `_landAt`) über dem Boden, den der Erdbau baut —, kein Haus berührt den Spieler
    // (Reichweite + `STRUCTURE_PLAYER_CLEAR_MARGIN`, das Dorf vor dir, `_siedlungsAnker`) und im Raster der Wand steht keins
    // in einem Bau (`_bauFrei`, die zweite Wand der Slot-Quelle: der Genesis-Platz, ein früheres Dorf).
    *_ortTraegt(plan, k, schritt) {
        if (!k || !Array.isArray(k.slots) || k.slots.length !== plan.slots.length) return false;
        const saum = globalThis.__fachwerkCore.ORT_GESETZ.saumM;
        const M = AnazhRealm.WERK_LAND_M;
        const pm = this.state.playerMesh;
        const frei = AnazhRealm.STRUCTURE_PLAYER_CLEAR_MARGIN;
        // der Boden, den der Erdbau des Plans baut (gelaende-core `erdbauY` über dem Gesetz samt dem Erdbau früherer Orte)
        const G = globalThis.__gelaendeCore;
        const E = G.erdbauNormal(k.erdbau);
        // und die Gestalt des Gewässers darüber — DIESELBE Formel wie die Dichte (`_gewaesserForm`: der Damm füllt tieferes
        // Gelände zur Krone, der Fluss-Kanal schneidet höheres zur Böschung, das See-Becken blendet zu seinem Bett; eine Dichte
        // ist Höhe − y, in y = 0 also die Höhe selbst): die Platte im Kanal liegt so tief, wie die Welt sie baut
        const nass = (x, z) => {
            const h0 = this._terrainMacroSurfaceY(x, z, true);
            const he = E ? G.erdbauY(E, x, z, h0) : h0;
            const h = AnazhRealm._gewaesserForm(he, 0, this._hydrosphereCarveAt(x, z), this._hydrosphereLakeAt(x, z));
            // die Welt baut den Boden des Plans, wie er geplant ist: ein Kanal unter der Platte (oder ein Damm über ihr) legt
            // das Haus auf einen Sockel bzw. in den Boden — am Kanal-Ort 72 m westlich des Auto-Dorfs 10,2 m Sockel, 15/16 Türen
            if (Math.abs(h - he) > AnazhRealm.ORT_WAHL.bodenTolM) return true;
            return h < this._atlasWaterLevelAt(x, z, h) + M;
        };
        for (const l of k.laternen || []) if (l && nass(k.ort.x + l.x, k.ort.z + l.z)) return false;
        const wand = schritt <= 0.5;
        let punkte = 0; // je 128 Punkte gibt die Wahl ab (ein Haus im Raster der Wand trägt bis zu 700)
        for (const sl of k.slots) {
            const { fundament, fp } = AnazhRealm._slotGrundriss(sl);
            if (!fp) continue;
            const wx = k.ort.x + sl.x;
            const wz = k.ort.z + sl.z;
            if (pm && Math.hypot(pm.position.x - wx, pm.position.z - wz) < Math.hypot(fp.ex, fp.ez) + frei)
                return false;
            const s = fundament ? saum : 0;
            const ry = sl.phi || 0;
            const c = Math.cos(ry);
            const sn = Math.sin(ry);
            const raster = { ex: fp.ex + s, ez: fp.ez + s, ox: fp.ox, oz: fp.oz };
            for (const [lx, lz] of AnazhRealm._fundamentRaster(raster, sl.tuer, schritt)) {
                const px = wx + lx * c + lz * sn;
                const pz = wz - lx * sn + lz * c;
                if (nass(px, pz)) return false;
                if (++punkte % 128 === 0) yield;
            }
            if (wand && !this._bauFrei(wx, wz, ry, fp, sl.tuer, sl.y)) return false;
            yield;
        }
        return true;
    }
    // DIE ALTEN ORTE ZIEHEN UM (K10 × Entscheid §5.4: „alte Welten ziehen um, ihre Bauten werden auf das neue Gelände
    // geerdet"): ein Haus eines Orts (`fundament`), das kein Erdbau trägt — ein Save vor dem Plan v2 stellte es auf die höchste
    // Ecke seines Grunds über ein Podest, das mit dem Erdbau fiel —, erhält die Platte seines Grundrisses samt Saum (fachwerk
    // `ORT_GESETZ.saumM`) auf seinem Boden (`yVon(haus)` − 0,5): der Grund steigt zum Haus, das Haus bleibt, wo es stand.
    // `liste` sind die Bauten (gespeichert oder lebend), `yVon` ihre Höhe. Der Boden-Umzug ruft es, BEVOR er die Höhen aller
    // Bauten rechnet (`_bodenUmzug`: Baum, Brunnen und Bau neben einem Haus stehen dann auf dem geerdeten Grund), das Laden
    // danach für die Häuser eines Saves desselben Bodens. Gibt die Zahl der geerdeten Häuser.
    _erdbauAltOrte(liste, yVon) {
        const saum = globalThis.__fachwerkCore.ORT_GESETZ.saumM;
        const platten = [];
        for (const e of liste) {
            const f = e && e.fundament;
            if (!f || !Number.isFinite(f.ex) || !Number.isFinite(f.ez) || !e.position) continue;
            const y = yVon(e);
            if (!Number.isFinite(y)) continue;
            const ry = Number.isFinite(e.rotationY) ? e.rotationY : 0;
            const c = Math.cos(ry);
            const s = Math.sin(ry);
            const lx = Number.isFinite(f.ox) ? f.ox : 0;
            const lz = Number.isFinite(f.oz) ? f.oz : 0;
            const cx = e.position.x + lx * c + lz * s;
            const cz = e.position.z - lx * s + lz * c;
            if (!this._ortFrei(cx, cz, 0.01)) continue; // ein Erdbau trägt das Haus schon
            platten.push({ art: "platte", cx, cz, phi: ry, ex: f.ex + saum, ez: f.ez + saum, y: y - 0.5 });
        }
        if (!platten.length) return 0;
        const p0 = platten[0];
        this._erdbauSetzen(`alt:${platten.length}:${Math.round(p0.cx)},${Math.round(p0.cz)}`, platten);
        return platten.length;
    }
    // Trägt der Grund an (x, z) eine Krone vom Radius T, ohne einen Ort zu berühren? (der Erdbau ist der reservierte Grund:
    // Grundrisse, Vorplätze, Platz, Gassen). Leser: der Wald-Plan (phyto `planForestCell`, ctx.ortFrei).
    _ortFrei(x, z, T) {
        const E = this._erdbauLage();
        if (!E) return true;
        const Z = globalThis.__gelaendeCore.ERDBAU.zelleM;
        const liste = E.zellen.get((Math.floor(x / Z) + 32768) * 65536 + (Math.floor(z / Z) + 32768));
        if (!liste) return true;
        for (const i of liste) {
            const p = E.splats[i];
            if (p.frei) continue; // unter einer Brücke ist der Grund frei
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

    // DAS ERBGUT der Welt (`worldMeta.erbgut`), validiert und gemerkt: { terme, wildnis, hash }. Fehlt es, ist die Welt
    // [wildnis] (jeder heutige Save). Die Empfänger-Wand ist fail-closed und
    // ohne stillen Ersatz: eine unbekannte Term-Art, eine fehlende Zahl oder eine Form außerhalb der Regeln WIRFT — die
    // Welt erwacht nicht und sagt es auf dem Ladeschirm (init), nie still Wildnis. `wildnis` ist das Gewicht des
    // Wildnis-Terms (1 = die Welt trägt ihn, 0 = nicht); `_wildnisTraegt` und die Spalte lesen es.
    _erbgut() {
        const wm = this.state.worldMeta;
        const roh = wm ? wm.erbgut : undefined;
        if (this._erbgutCache && this._erbgutRoh === roh) return this._erbgutCache;
        const terme = globalThis.__gelaendeCore.erbgutNormal(roh);
        this._erbgutRoh = roh;
        this._erbgutCache = {
            terme,
            wildnis: terme[0].art === "wildnis" ? 1 : 0,
            hash: this._fastHash(JSON.stringify(terme)),
        };
        return this._erbgutCache;
    }

    // Der Hydrosphäre-Compute-Pfad (`_hydroInit`) liest direkt
    // `_terrainMacroSurfaceY` (worldgen-frozen); der Spieler-Wille lebt im Cell-Feld, nie in der Drainage.

    // Spalten-Kontext: die rein 2D-Arbeit (Makro-Oberfläche `_terrainMacroSurfaceY` ~61 % der Density-
    // Kosten, eroR, Höhlen-Mündung, Hydro-Carve/See) EINMAL pro (x,z) statt pro Voxel; der per-Voxel
    // `_terrainBaseDensityAtCol` liest sie byte-identisch. Die Basis-Dichte OHNE voxelEdits ist
    // worldgen-frozen → pro Chunk+LOD cachebar (`state.voxelBaseDensityCache`), Edits legen nur das
    // Kugel-Delta drauf. MUSS bit-identisch im Worker (`terrainColumnContext`).
    _terrainColumnContext(x, z) {
        return this._terrainColumnContextIn(x, z, {});
    }
    // Füll-Variante: identische Werte, der Aufrufer stellt den Behälter. Halter-Pfade (Chunk-Bau,
    // _fieldSurfaceBelow, Gradient-y-Paar) münzen frisch über den Wrapper; nur der ctx-lose Heiß-Pfad
    // (_terrainBaseDensityAt) füllt seinen privaten Scratch.
    _terrainColumnContextIn(x, z, out) {
        const L = this._gelaende();
        const n = L.noise;
        const base = this.state.terrainBaseHeight || 0;
        const mess = this._spaltenHang || (this._spaltenHang = { hang: 0 });
        const surf = this._terrainMacroSurfaceY(x, z, true, mess);
        // DAS WILDNIS-GEWICHT der Spalte: die 3D-Rauheit und die Höhlen-Hülle sind Wildnis — sie wiegen mit ihm (Wildnis-
        // Welt ≡ 1: jeder Wert byte-gleich; ohne Wildnis-Term 0: kein noise3D, keine Höhle, der Boden ist die Term-Höhe).
        const wild = (this._erbgutCache || this._erbgut()).wildnis;
        let ceilOffset = -24;
        if (wild > 0) {
            // Die Höhlen-Decke bleibt unter dem Boden (16 m, unter Wasser 24 m — T7b-ii, kein Abfluss): die Höhle bricht
            // nie als Grube durch die Wiese (die Canyon-Maske fiel, K16). DIE MÜNDUNG ist Gesetz (gelaende-core
            // `hoehlenMund`): wo die Flanke Fels trägt, hebt ihr Gewicht die Decke über den Boden — der Mund steht im Fels.
            const waterLevelD = typeof this.state.waterLevel === "number" ? this.state.waterLevel : base + 4;
            const G = globalThis.__gelaendeCore;
            ceilOffset = surf < waterLevelD + 1 ? -24 : -16 + G.HOEHLEN_MUND.hub * G.hoehlenMund(mess.hang);
        }
        // V9.43-d/-45-b — der Hydrosphären-Carve (Fluss-Rinnen + See-Becken-Blend), 2D je Spalte.
        const hydro = this.state.hydrosphere;
        const hydroActive = !!(hydro && hydro.ready && !this._hydroComputing);
        let hydroCarve = null; // der Fluss-Kanal { P, L, k } (`_hydrosphereCarveAt`) oder null
        let lake = null;
        if (hydroActive) {
            hydroCarve = this._hydrosphereCarveAt(x, z);
            lake = this._hydrosphereLakeAt(x, z);
        }
        out.n = n;
        out.base = base;
        out.surf = surf;
        out.wild = wild;
        out.ceilOffset = ceilOffset;
        out.hydroActive = hydroActive;
        out.hydroCarve = hydroCarve;
        out.lake = lake;
        return out;
    }

    // Die per-VOXEL-Hälfte (y-abhängig): die zwei Oberflächen-3D-Roughness-Bänder, die Höhlen-
    // Hüllkurve + drei Carve-Felder (Wurm/Kavernen/Hallen), der See-Blend. Liest den Spalten-Kontext
    // (`ctx`) statt die 2D-Arbeit neu zu rechnen. Reihenfolge der `d`-Akkumulation = exakt das Original.
    _terrainBaseDensityAtCol(x, y, z, ctx) {
        const n = ctx.n;
        const base = ctx.base;
        const surf = ctx.surf;
        let d = surf - y;
        // Rauheit und Höhlen sind Wildnis: ohne ihr Gewicht (ctx.wild 0) wird kein noise3D gerechnet.
        if (ctx.wild > 0) {
            const caveFloor = Math.max(0, Math.min(1, (y - (base - 28)) / 8));
            const caveCeil = Math.max(0, Math.min(1, (surf + ctx.ceilOffset - y) / 8));
            const caveEnv = caveFloor * caveCeil * ctx.wild;
            if (caveEnv > 0) {
                const ridge = 1 - Math.abs(n.noise3D(x * 0.03, y * 0.034, z * 0.03));
                const cave = Math.max(0, (ridge - 0.7) / 0.3);
                d -= cave * caveEnv * 36;
                const cavern = n.noise3D(x * 0.013, y * 0.018, z * 0.013);
                const cavernCarve = Math.max(0, (cavern - 0.55) / 0.45);
                d -= cavernCarve * caveEnv * 46;
                const hall = n.noise3D(x * 0.0045 + 71.3, y * 0.006 - 12.7, z * 0.0045 + 5.1);
                const hallCarve = Math.max(0, (hall - 0.5) / 0.5);
                d -= hallCarve * caveEnv * 72;
            }
        }
        if (ctx.hydroActive) d = AnazhRealm._gewaesserForm(d, y, ctx.hydroCarve, ctx.lake);
        return d;
    }

    // DIE FORM DES GEWÄSSERS (EINE Formel für die Dichte des Chunks und die Fläche der Ferne, `_fernNass`): der Fluss-Kanal
    // `kn` (`_hydrosphereCarveAt`) als weiches Maximum aus Gelände und Damm, davon das weiche Minimum mit dem Kanal
    // (polynomial, Rundung k: m ∓ h² · k / 4, h = max(k − |a − b|, 0) / k); das See-Becken `lk` danach. `d` ist die Dichte
    // an der Höhe `y` (die Fläche − y); mit y = 0 und d = der Höhe einer Spalte ist das Ergebnis ihre Fläche.
    static _gewaesserForm(d, y, kn, lk) {
        if (kn) {
            const dL = kn.L - y;
            let hk = Math.max(kn.k - Math.abs(d - dL), 0) / kn.k;
            const damm = Math.max(d, dL) + hk * hk * kn.k * 0.25;
            const dP = kn.P - y;
            hk = Math.max(kn.k - Math.abs(damm - dP), 0) / kn.k;
            d = Math.min(damm, dP) - hk * hk * kn.k * 0.25;
        }
        if (lk) {
            const flatD = lk.bedY - y;
            d = d * (1 - lk.w) + flatD * lk.w;
        }
        return d;
    }

    // Die EINE-Punkt-API (Edits/Raycast/Carve-Leser): Kontext + per-Voxel = byte-identisch zur alten
    // monolithischen Form. Der GRID-Pfad (`_voxelSampleDensityGrid`) hoistet den Kontext pro Spalte.
    _terrainBaseDensityAt(x, y, z) {
        // Der EINE ctx-lose Chokepoint füllt einen privaten SCRATCH (Gradient-, Raycast-, Kreatur-Proben
        // münzten sonst je einen frischen Kontext). Sicher, weil der Konsum in _terrainBaseDensityAtCol
        // rein synchron ist (Hydro-Füller rufen nie zurück) und kein Aufrufer dieses ctx hält.
        const s = this._fieldCtxScratch || (this._fieldCtxScratch = {});
        return this._terrainBaseDensityAtCol(x, y, z, this._terrainColumnContextIn(x, z, s));
    }

    // Volle Terrain-Dichte = Basis + voxelEdit-Delta für Punkt-Samples (Wasser-Iso-OOB, `_voxelSurfaceY`,
    // direkte Aufrufer); der Chunk-Grid-Pfad nutzt `_voxelEditedDensityGrid` (base-gecacht + Delta).
    _terrainDensityAt(x, y, z) {
        // Die Edit-Deltas leben in `_voxelEditDeltaAt`, damit der feld-native Kollisions-Pfad
        // (`_fieldDensityAt`) DIESELBE Edit-Wahrheit liest. Das Chunk-GITTER (`_voxelEditedDensityGrid`) legt die
        // Edits in Float32 auf das Basis-Gitter; sein Worker-Spiegel `computeDensityGrid` ist byte-gleich
        // (gate:worker-dichte: maxDiff 0, LOD 0–3, mit Edits über dem Band).
        return this._terrainBaseDensityAt(x, y, z) + this._voxelEditDeltaAt(x, y, z);
    }

    // DIE EDIT-KARTE (K23): die Edits der Welt je Chunk. `worldMeta.voxelEdits` bleibt die EINE Liste (persistiert, in
    // Setz-Reihenfolge, ohne Deckel — kein Edit fällt still); die Karte legt jeden Edit in jeden Chunk, den seine Kugel
    // samt einem Chunk Rand berührt (Spalten floor((x − r)/span) − 1 … floor((x + r)/span) + 1, r mindestens 1 m), in
    // derselben Reihenfolge; der KERN ohne Rand dient der Punkt-Probe. Ein Leser fragt nur seinen Chunk statt alle Edits
    // zu summieren, und die Summe bleibt Bit für Bit die der ganzen Liste (ein Edit außerhalb trägt nichts bei). Je Chunk
    // eine Generation aus EINEM steigenden Zähler (nie wiederholt) — der Stale-Filter der Worker-Antworten
    // (`_voxelStand`). Identität und Länge der Liste halten die Karte frisch: ein Push wird nachgetragen, ein Tausch oder
    // Kürzen baut sie neu. Der Worker spiegelt sie byte-gleich (`editKarte`, voxel-worker.js).
    _voxelEditKarte() {
        const meta = this.state.worldMeta;
        const edits = meta && Array.isArray(meta.voxelEdits) ? meta.voxelEdits : null;
        let k = this._editKarte;
        if (!k || k.edits !== edits || k.n > (edits ? edits.length : 0)) {
            k = this._editKarte = {
                edits,
                n: 0,
                span: this._voxelChunkConfig().span,
                je: new Map(),
                kern: new Map(),
                gen: new Map(),
            };
        }
        if (edits && k.n < edits.length) {
            const span = k.span;
            while (k.n < edits.length) {
                const ed = edits[k.n++];
                if (!ed || !Number.isFinite(ed.x) || !Number.isFinite(ed.z)) continue;
                const r = Number.isFinite(ed.r) ? Math.max(ed.r, 1) : 1;
                this._editGenZaehler = (this._editGenZaehler || 0) + 1;
                const g = this._editGenZaehler;
                // Der Kasten der Kugel in Chunks (ka … kb); die Karte nimmt einen Chunk Rand dazu.
                const kax = Math.floor((ed.x - r) / span);
                const kbx = Math.floor((ed.x + r) / span);
                const kaz = Math.floor((ed.z - r) / span);
                const kbz = Math.floor((ed.z + r) / span);
                for (let cx = kax - 1; cx <= kbx + 1; cx++) {
                    for (let cz = kaz - 1; cz <= kbz + 1; cz++) {
                        const key = (cx + 32768) * 65536 + (cz + 32768);
                        const liste = k.je.get(key);
                        if (liste) liste.push(ed);
                        else k.je.set(key, [ed]);
                        k.gen.set(key, g);
                        // DER KERN (ohne Rand): die Punkt-Probe fragt nur die Edits, deren Kasten ihren Chunk berührt.
                        if (cx >= kax && cx <= kbx && cz >= kaz && cz <= kbz) {
                            const kern = k.kern.get(key);
                            if (kern) kern.push(ed);
                            else k.kern.set(key, [ed]);
                        }
                    }
                }
            }
        }
        return k;
    }

    // Die Edits, die den Chunk (cx, cz) samt einem Chunk Rand berühren können — in Setz-Reihenfolge, leer ohne.
    _voxelEditsNah(cx, cz) {
        return this._voxelEditKarte().je.get((cx + 32768) * 65536 + (cz + 32768)) || AnazhRealm.KEINE_EDITS;
    }

    // Die Edits, die den waagrechten Kasten [x0, x1] × [z0, z1] berühren können: liegt er (mit 1 m Rand) im 3×3 um den
    // Chunk seiner Mitte, ist es dessen Karten-Eintrag (jedes Chunk-Gitter samt Pad), sonst die ganze Liste.
    _voxelEditsImKasten(x0, x1, z0, z1) {
        const k = this._voxelEditKarte();
        if (!k.edits || !k.edits.length) return AnazhRealm.KEINE_EDITS;
        const span = k.span;
        const cx = Math.floor((x0 + x1) / 2 / span);
        const cz = Math.floor((z0 + z1) / 2 / span);
        if (
            x0 - 1 > (cx - 1) * span &&
            x1 + 1 < (cx + 2) * span &&
            z0 - 1 > (cz - 1) * span &&
            z1 + 1 < (cz + 2) * span
        )
            return k.je.get((cx + 32768) * 65536 + (cz + 32768)) || AnazhRealm.KEINE_EDITS;
        return k.edits;
    }

    // Der Stand eines Chunks für den Stale-Filter der Worker- und Platten-Antworten: der Welt-Sync
    // (`voxelWorkerStateGen`) und die jüngste Generation eines Edits oder eines Erdbaus (`_erdbauSetzen`, K69) im 3×3 um
    // ihn. Ein Edit und ein Ort verwerfen nur die Antworten ihrer Nachbarschaft, nie die der ganzen Welt.
    _voxelStand(cx, cz) {
        const gen = this._voxelEditKarte().gen;
        const erd = this._erdbauGenKarte;
        let g = 0;
        for (let dx = -1; dx <= 1; dx++) {
            for (let dz = -1; dz <= 1; dz++) {
                const k = (cx + dx + 32768) * 65536 + (cz + dz + 32768);
                const v = gen.get(k);
                if (v > g) g = v;
                const w = erd ? erd.get(k) : undefined;
                if (w > g) g = w;
            }
        }
        return `${this.state.voxelWorkerStateGen}|${g}`;
    }

    // Voxel-Edit-Deltas (EINE Quelle): jede Schnitz-Kugel zieht Dichte ab (carve) oder schüttet auf
    // (fill). Edits leben in worldMeta.voxelEdits (persistiert) und gelten ZULETZT — der Spieler-Wille
    // überschreibt Terrain UND Hydrosphäre-Sculpting. Summiert werden nur die Edits, deren Kasten den Chunk der Probe
    // berührt (der Kern der Karte).
    _voxelEditDeltaAt(x, y, z) {
        const meta = this.state.worldMeta;
        if (!meta || !meta.voxelEdits || !meta.voxelEdits.length) return 0;
        const k = this._voxelEditKarte();
        const edits = k.kern.get((Math.floor(x / k.span) + 32768) * 65536 + (Math.floor(z / k.span) + 32768));
        if (!edits) return 0;
        let d = 0;
        for (let e = 0; e < edits.length; e++) {
            const ed = edits[e];
            if (!ed) continue;
            const dx = x - ed.x;
            const dy = y - ed.y;
            const dz = z - ed.z;
            const dist2 = dx * dx + dy * dy + dz * dz;
            const r = ed.r;
            if (dist2 < r * r) {
                const fall = 1 - Math.sqrt(dist2) / r;
                const amt = fall * (ed.strength || 48);
                // `fill` addiert Dichte (Boden aufschütten), `carve` (Default,
                // auch mode-lose Alt-Edits) zieht ab.
                if (ed.mode === "fill") d += amt;
                else d -= amt;
            }
        }
        return d;
    }

    // Base-gecachter Density-Grid-Pfad: (dimX+1)·(dimY+1)·(dimZ+1)-Grid identisch zu
    // `_voxelSampleDensityGrid`, aber das teure Basis-Grid wird pro Chunk+LOD gecacht; der Edit-Rebuild
    // legt nur die Kugel-Deltas auf eine Kopie (~2 ms statt ~126 ms). Ohne Edits: read-only-Reuse.
    // Bit-identisch zu `_terrainDensityAt` (base + Σ edit-delta).
    _voxelEditedDensityGrid(cacheKey, gox, goy, goz, dimX, dimY, dimZ, step) {
        const Nx = dimX + 1;
        const Ny = dimY + 1;
        const Nz = dimZ + 1;
        const expectedLen = Nx * Ny * Nz;
        if (!this.state.voxelBaseDensityCache) this.state.voxelBaseDensityCache = new Map();
        let baseGrid = this.state.voxelBaseDensityCache.get(cacheKey);
        if (!baseGrid || baseGrid.length !== expectedLen) {
            const baseSample = (x, y, z) => this._terrainBaseDensityAt(x, y, z);
            // V18.321 — der Spalten-Hoist: colVoxel = die per-Voxel-Hälfte (liest den 2D-Kontext).
            const colVoxel = (x, y, z, ctx) => this._terrainBaseDensityAtCol(x, y, z, ctx);
            baseGrid = this._voxelSampleDensityGrid(gox, goy, goz, dimX, dimY, dimZ, step, baseSample, colVoxel);
            this.state.voxelBaseDensityCache.set(cacheKey, baseGrid);
        }
        // Die Edits des Gitter-Kastens (die Karte, `_voxelEditsImKasten`; der Worker fragt denselben Kasten).
        const edits = this._voxelEditsImKasten(gox, gox + dimX * step, goz, goz + dimZ * step);
        if (!edits.length) return baseGrid; // Basis IST das Grid (read-only)
        // Edit-Delta auf eine Kopie legen. Nur Vertices im Kugel-Radius werden
        // berührt (Index-Bounding-Box), der Rest bleibt Basis → billig.
        const out = new Float32Array(baseGrid);
        for (let e = 0; e < edits.length; e++) {
            const ed = edits[e];
            if (!ed) continue;
            const r = ed.r;
            const r2 = r * r;
            const strength = ed.strength || 48;
            const isFill = ed.mode === "fill";
            // Grid-Index-Bounding-Box der Kugel (clamp auf [0, N-1]).
            const i0 = Math.max(0, Math.floor((ed.x - r - gox) / step));
            const i1 = Math.min(Nx - 1, Math.ceil((ed.x + r - gox) / step));
            const j0 = Math.max(0, Math.floor((ed.y - r - goy) / step));
            const j1 = Math.min(Ny - 1, Math.ceil((ed.y + r - goy) / step));
            const k0 = Math.max(0, Math.floor((ed.z - r - goz) / step));
            const k1 = Math.min(Nz - 1, Math.ceil((ed.z + r - goz) / step));
            for (let k = k0; k <= k1; k++) {
                const wz = goz + k * step;
                const dz = wz - ed.z;
                for (let j = j0; j <= j1; j++) {
                    const wy = goy + j * step;
                    const dy = wy - ed.y;
                    for (let i = i0; i <= i1; i++) {
                        const wx = gox + i * step;
                        const dx = wx - ed.x;
                        const dist2 = dx * dx + dy * dy + dz * dz;
                        if (dist2 < r2) {
                            const fall = 1 - Math.sqrt(dist2) / r;
                            const amt = fall * strength;
                            const idx = i + j * Nx + k * Nx * Ny;
                            if (isFill) out[idx] += amt;
                            else out[idx] -= amt;
                        }
                    }
                }
            }
        }
        return out;
    }

    // DER FLUSS-KANAL an xz: die Gestalt, die das Gelände im Fluss-Korridor annimmt — `{ P, L, k }` oder null. P ist die
    // Höhe des KANALS (Flachboden auf Spiegel − (1 − Freibord) · Tiefe bis zur halben Breite, die Bank steigt mit
    // bankNeigung bis zur Krone auf Spiegel + Freibord · Tiefe, dahinter die Böschung, die mit dem Abstand steiler wird), L die
    // Höhe des DAMMS (seine Krone auf Spiegel + max(Freibord · Tiefe, dammFreibord), eben bis dammBreite hinter der Krone des
    // Kanals, dahinter fällt er wie die Böschung steigt — die Krone trägt das 1,8-m-Gitter), k die Rundung. Die Dichte
    // nimmt das weiche Maximum aus Gelände und Damm (tieferes Gelände wird zur Krone gefüllt) und davon das weiche Minimum
    // mit dem Kanal (höheres Gelände wird zur Böschung geschnitten): wo das Gelände zwischen beiden liegt, bleibt es, wie es
    // ist — die Bank läuft mit ihrer eigenen Neigung ins Gelände aus, nie als Wand. Mehrere Segmente (Biegung, Mündung):
    // der tiefste Kanal und der höchste Damm (die Vereinigung). So schneidet der Kanal Buckel und überbrückt Senken, und die
    // Krone hält das Wasser. Bis 8f09227d mischte ein Gewicht das Gelände zur Gestalt: die Krone nach 0,6 der Bank-Rampe,
    // dahinter eine Gleit-Zone von 0,4 der Rampe — eine Wand von bis zu ≈ 73° mit Fels-Rauten (Gegenprüfung 07.10.).
    // Leere-Bucket-Early-Out → wasserlose Welt ~5 Ops (millionenfach beim Meshing). See-Becken: `_hydrosphereLakeAt`.
    _hydrosphereCarveAt(x, z) {
        const h = this._hydroFor(x, z); // A3 (V18.132): Heimat ODER Kachel
        if (!h || !h.ready) return null;
        const rb = h.riverBuckets;
        if (!rb) return null;
        const bs = h.bucketSize;
        const bd = h.bucketsDim;
        const bi = Math.floor((x - h.originX) / bs);
        const bj = Math.floor((z - h.originZ) / bs);
        if (bi < 0 || bj < 0 || bi >= bd || bj >= bd) return null;
        const list = rb[bj * bd + bi];
        if (!list) return null;
        const HC = AnazhRealm.HYDROSPHERE;
        const sN = HC.bankNeigung;
        const sK = HC.bankKruemmung;
        const fuss = HC.bankRundung;
        const kB = HC.dammBreite;
        let P = Infinity;
        let L = -Infinity;
        for (let s = 0; s < list.length; s++) {
            const seg = list[s];
            const ex = seg.bx - seg.ax;
            const ez = seg.bz - seg.az;
            const len2 = ex * ex + ez * ez || 1;
            let t = ((x - seg.ax) * ex + (z - seg.az) * ez) / len2;
            if (t < 0) t = 0;
            else if (t > 1) t = 1;
            const px = seg.ax + ex * t;
            const pz = seg.az + ez * t;
            const dist = Math.hypot(x - px, z - pz);
            const halfW = seg.hwA + (seg.hwB - seg.hwA) * t;
            const D = seg.dA + (seg.dB - seg.dA) * t;
            const dK = halfW + D / sN;
            if (dist >= dK + kB + HC.bankWeite) continue;
            const spiegel = seg.sA + (seg.sB - seg.sA) * t;
            const B = spiegel - (1 - HC.spiegelFreibord) * D;
            const u0 = dist - halfW;
            let p = u0 <= -fuss ? B : u0 < fuss ? B + (sN * (u0 + fuss) * (u0 + fuss)) / (4 * fuss) : B + sN * u0;
            const u = dist - dK;
            if (u > 0) p += sK * u * u;
            // der Damm: seine Krone eben bis dammBreite hinter der Krone des Kanals, dahinter die Böschung
            let l = spiegel + Math.max(HC.spiegelFreibord * D, HC.dammFreibord);
            const uL = u - kB;
            if (uL > 0) l -= sN * uL + sK * uL * uL;
            if (p < P) P = p;
            if (l > L) L = l;
        }
        return P < Infinity ? { P, L, k: fuss } : null;
    }

    // Fluss-Distanz an (x,z): derselbe riverBuckets-Walk wie _hydrosphereCarveAt (EINE Quelle), liefert
    // Distanz + Segment-Halbbreite. Anders als der Carve liest er die 3×3-Bucket-Nachbarschaft
    // (Feuchte-Reichweite ~26 m > Bankbreite).
    _hydroDistAt(x, z) {
        const h = this._hydroFor(x, z);
        if (!h || !h.ready || !h.riverBuckets) return { dist: Infinity, halfW: 0 };
        const rb = h.riverBuckets;
        const bs = h.bucketSize;
        const bd = h.bucketsDim;
        const bi0 = Math.floor((x - h.originX) / bs);
        const bj0 = Math.floor((z - h.originZ) / bs);
        let best = Infinity;
        let bestHw = 0;
        let bestRand = Infinity;
        let bestSp = NaN;
        for (let dj = -1; dj <= 1; dj++) {
            for (let di = -1; di <= 1; di++) {
                const bi = bi0 + di;
                const bj = bj0 + dj;
                if (bi < 0 || bj < 0 || bi >= bd || bj >= bd) continue;
                const list = rb[bj * bd + bi];
                if (!list) continue;
                for (let s = 0; s < list.length; s++) {
                    const seg = list[s];
                    const ex = seg.bx - seg.ax;
                    const ez = seg.bz - seg.az;
                    const len2 = ex * ex + ez * ez || 1;
                    let t = ((x - seg.ax) * ex + (z - seg.az) * ez) / len2;
                    if (t < 0) t = 0;
                    else if (t > 1) t = 1;
                    const dist = Math.hypot(x - (seg.ax + ex * t), z - (seg.az + ez * t));
                    const hw = seg.hwA + (seg.hwB - seg.hwA) * t;
                    // der nächste RAND (Abstand minus die Halbbreite, wie die Leser sie nehmen), nie die nächste Mittellinie
                    // (K16, U1): zwischen zwei Segmenten ungleicher Breite sprang sonst die Halbbreite und mit ihr die Feuchte
                    // (0,83 → 0,44 in 2 cm, 213/−890) — so ist jedes Band das Maximum der Segmente, stetig
                    const rand = dist - Math.max(1, hw);
                    if (rand < bestRand) {
                        bestRand = rand;
                        best = dist;
                        bestHw = hw;
                        bestSp = seg.sA + (seg.sB - seg.sA) * t;
                    }
                }
            }
        }
        return { dist: best, halfW: bestHw, spiegel: bestSp };
    }

    // Γ1 (genese-plan) — die GENESE-Version der Welt: fehlend = 1 (Legacy —
    // bestehende Welten behalten ihr Gesicht; das Drainage-Netz-Gesetz
    // konsequent: Genese ist Welt-Identität). Neue Welten werden mit 2 geboren.
    _genVersion() {
        return (this.state.worldMeta && this.state.worldMeta.genVersion) || 1;
    }

    // Das Feuchte-Feld, abgeleitet aus der HYDROSPHÄRE (Terrain → Wasser → Feuchte → Leben), nicht aus
    // Noise. Lebt am Genese-Leser (Spawn/Scatter/Boden), NICHT in worldFieldAt (Bucket-Walk nicht in den
    // Hot-Path; der Höhen-Term braucht surfY). max() aus (a) Fluss-Nähe (smoothstep über die Segment-
    // Distanz) und (b) Höhe über dem Wasserspiegel (feuchte Niederungen). Die Fläche der Ferne (`fussM`, das Mittel der
    // Fluss-Bänder über den Abdruck) rechnet der Fern-Faden (`feuchteAt` im voxel-worker, B2).
    _feuchteAt(x, z, surfY) {
        if (this._genVersion() < 2) return 0;
        const F = AnazhRealm.FEUCHTE;
        let fluss = 0;
        const r = this._hydroDistAt(x, z);
        if (Number.isFinite(r.dist)) {
            const inner = Math.max(1, r.halfW);
            const outer = inner + F.flussReichweite;
            const t = Math.max(0, Math.min(1, (outer - r.dist) / (outer - inner)));
            fluss = t * t * (3 - 2 * t);
        }
        let hoehe = 0;
        const sy = Number.isFinite(surfY) ? surfY : this._voxelSurfaceY ? this._voxelSurfaceY(x, z) : null;
        if (Number.isFinite(sy)) {
            // die Ufer-Bänder über beiden Bezügen (`_waterLevelAt`): See/Meer voll, der Fluss mit seiner Kronen-Blende
            const uf = { see: 0, fluss: null, ufer: 0 };
            this._waterLevelAt(x, z, uf);
            const band = (above) => {
                const t = Math.max(0, Math.min(1, (F.hoeheFern - above) / (F.hoeheFern - F.hoeheNah)));
                return t * t * (3 - 2 * t) * F.hoeheGewicht;
            };
            hoehe = band(sy - uf.see);
            if (uf.fluss !== null) hoehe = Math.max(hoehe, uf.ufer * band(sy - uf.fluss));
        }
        return Math.max(0, Math.min(1, Math.max(fluss, hoehe)));
    }

    // Pfad-Feld: Fluss-Bänke sind getrampelte Erde — knapp außerhalb der Wasserkante (dist ∈ [halfW,
    // halfW+bankW]) auf niedriger Bank (0..5 m über dem Spiegel) → Pfad ∈ [0,1]. Render-only (Boden-
    // Farbe, Gras unterdrückt); liest den worker-gespiegelten _hydroDistAt → P2P bit-identisch. Die Bank der Ferne (das
    // Mittel über die Fläche, `fussM`) rechnet der Fern-Faden (`pathFieldAt` im voxel-worker, B2).
    _pathFieldAt(x, z, surfY) {
        if (this._genVersion() < 2) return 0;
        const bankW = 4.5;
        const niedrig = (above) => (above < 0 || above > 5 ? 0 : 1);
        const r = this._hydroDistAt(x, z);
        if (!Number.isFinite(r.dist)) return 0;
        const inner = Math.max(1, r.halfW);
        const d = r.dist - inner;
        if (d < 0 || d > bankW) return 0;
        const band = 1 - d / bankW;
        if (!Number.isFinite(surfY)) return band * band;
        // niedrige Bank (0..5 m) über einem der beiden Bezüge (`_waterLevelAt`): See/Meer voll, der Fluss mit seiner
        // Kronen-Blende
        const uf = { see: 0, fluss: null, ufer: 0 };
        this._waterLevelAt(x, z, uf);
        let w = niedrig(surfY - uf.see);
        if (uf.fluss !== null) w = Math.max(w, uf.ufer * niedrig(surfY - uf.fluss));
        return band * band * w;
    }

    // See-Becken an xz → `{bedY, w}` oder null: `bedY` = flache, wasserdichte Bett-Höhe, `w` ∈ [0,1] die
    // Becken-Zugehörigkeit (rampt über den 1-Zellen-Ring zum Ufer). `_terrainDensityAt` blendet mit `w`
    // zur Bett-Ebene → lückenloser Boden, keine Roughness im Becken, Bett über dem Meeresspiegel.
    // Bilinear; der `lakeNear`-Early-Out hält die wasserlose Welt billig.
    _hydrosphereLakeAt(x, z) {
        const h = this._hydroFor(x, z); // A3 (V18.132): Heimat ODER Kachel
        if (!h || !h.ready) return null;
        const lw = h.lakeW;
        const lb = h.lakeBedCell;
        const ln = h.lakeNear;
        if (!lw || !lb || !ln) return null;
        const dim = h.dim;
        const cell = h.cell;
        const ci = Math.floor((x - h.originX) / cell);
        const cj = Math.floor((z - h.originZ) / cell);
        if (ci < 0 || cj < 0 || ci >= dim || cj >= dim || !ln[ci + cj * dim]) return null;
        const cf = (x - h.originX) / cell - 0.5;
        const gf = (z - h.originZ) / cell - 0.5;
        const i0 = Math.floor(cf);
        const j0 = Math.floor(gf);
        const tx = cf - i0;
        const tz = gf - j0;
        const cl = (v) => (v < 0 ? 0 : v >= dim ? dim - 1 : v);
        const i0c = cl(i0);
        const i1c = cl(i0 + 1);
        const r0 = cl(j0) * dim;
        const r1 = cl(j0 + 1) * dim;
        const w =
            (lw[i0c + r0] * (1 - tx) + lw[i1c + r0] * tx) * (1 - tz) +
            (lw[i0c + r1] * (1 - tx) + lw[i1c + r1] * tx) * tz;
        if (w <= 0) return null;
        const bedY =
            (lb[i0c + r0] * (1 - tx) + lb[i1c + r0] * tx) * (1 - tz) +
            (lb[i0c + r1] * (1 - tx) + lb[i1c + r1] * tx) * tz;
        return { bedY, w };
    }

    // Surface Nets: (1) je Zelle mit Oberflächen-Schnitt EIN Vertex (Mittel der Kanten-Kreuzungen);
    // (2) je Gitter-Kante mit Vorzeichenwechsel ein Quad aus 4 Zell-Vertices → BufferGeometry oder null.
    // dimX/dimY/dimZ = Zell-Zahlen; der Chunk ist bewusst nicht würfelförmig (`span` breit, aber hoch
    // genug fürs ganze Oberflächen-Band — sonst ein Loch, wo die Oberfläche aus dem Kasten tritt).
    _voxelChunkGeometry(
        ox,
        oy,
        oz,
        dimX,
        dimY,
        dimZ,
        step,
        densityFn,
        cropMargin = 0,
        preDensity = null,
        smoothIters = 1,
        hoehle = null
    ) {
        const sample = densityFn || ((x, y, z) => this._terrainDensityAt(x, y, z));
        // `preDensity`: hat der Aufrufer das Grid schon (Cell-Klassifikation), läuft die teure Sample-
        // Schleife (~90k `_terrainDensityAt`-Calls) nur einmal pro Chunk-Build.
        // ein eigener Sampler (`densityFn`, die Schwebe-Insel) ist nicht der Boden: er trägt dessen Band nicht
        const density =
            preDensity ||
            this._voxelSampleDensityGrid(ox, oy, oz, dimX, dimY, dimZ, step, sample, undefined, !densityFn);
        const { positions, vertCells, cellVert, sharp } = this._voxelExtractSurfaceVertices(
            density,
            ox,
            oy,
            oz,
            dimX,
            dimY,
            dimZ,
            step
        );
        if (positions.length === 0) return null;
        // `hoehle` (der Höhlen-Graph des Boden-Chunks, `_voxelHoehlenGraph`): je Dreieck die Zelle seiner Luft
        const triZelle = hoehle ? [] : null;
        const indices = this._voxelEmitQuadIndices(
            density,
            cellVert,
            dimX,
            dimY,
            dimZ,
            hoehle ? hoehle.lab : null,
            triZelle
        );
        this._voxelLaplacianSmoothPositions(positions, indices, smoothIters, sharp);
        this._voxelCropPad(positions, indices, vertCells, dimX, dimZ, cropMargin, triZelle);
        if (positions.length === 0) return null;
        // Gradient-Normals nutzen das geteilte preDensity-Grid (statt ~18k Dichte-Calls);
        // _voxelGradientNormals interpoliert trilinear, Out-of-Bounds → sample().
        const Nx = dimX + 1;
        const Ny = dimY + 1;
        const Nz = dimZ + 1;
        const preGrid = { density, ox, oy, oz, Nx, Ny, Nz, step };
        const normals = this._voxelGradientNormals(positions, sample, step, preGrid);
        const geom = new THREE.BufferGeometry();
        geom.setAttribute("position", new THREE.Float32BufferAttribute(positions, 3));
        if (indices.length > 0) geom.setIndex(indices);
        geom.setAttribute("normal", new THREE.Float32BufferAttribute(normals, 3));
        // JEDE Terrain-Geometrie trägt die Morph-Attribute — WebGPU-strikt: ein NodeMaterial-`attribute()`
        // MUSS auf jedem Mesh existieren (sonst Pipeline-Crash), darum ZENTRAL hier. Default Identität
        // (Ziel = Position, Gewicht 0), bis `_applyCrossLodGeomorph` Cross-LOD-Boundary-Vertices auf die
        // grobe Nachbar-Oberfläche zieht. Render-only (Vertex-Shader), main-only, Physik-Position unberührt.
        geom.setAttribute("aMorphTarget", new THREE.Float32BufferAttribute(new Float32Array(positions), 3));
        geom.setAttribute("aMorphWeight", new THREE.Float32BufferAttribute(new Float32Array(positions.length / 3), 1));
        geom.setAttribute(
            "aHimmel",
            new THREE.Float32BufferAttribute(
                globalThis.__gelaendeCore.himmelsSicht(indices, triZelle, positions.length / 3, step),
                1
            )
        );
        if (hoehle)
            geom.hoehle = {
                tri: Int32Array.from(triZelle),
                n: hoehle.n,
                knoten: hoehle.knoten,
                muend: hoehle.muend,
                seiten: hoehle.seiten,
                kanten: hoehle.kanten,
                rand: hoehle.rand,
                step,
            };
        return geom;
    }

    // DIE BODEN-KARTE (V18.508): die Höhe des GERENDERTEN Bodens je Chunk, gerastert aus dem fertigen
    // Mesh (Surface-Nets-Vertices nach Glättung + Crop) auf ein Gitter von step/BODEN_KARTE_TEILUNG (LOD 0:
    // 0,45 m, Origin chunk − step, über das Pad (dim+3)·step); je Punkt die OBERSTE nicht-steile Fläche (Wände
    // tragen nichts), NaN ohne Boden, dazu der Grün-Kanal (Uint8). Vorher las die Karte die Dichte-Spalten
    // (Nulldurchgang an den Gitter-Ecken) — gemessen 01.10.: an der Mess-Wiese −1004/−790 liegt der gerenderte
    // Boden ±0,22 m (q05–q95, max +0,43) neben dem Gesetz, im Spawn-Chunk Median 45 cm; das 1,8-m-Netz trägt
    // die Feinform der Funktion nicht, die Glättung verdoppelt die Abweichung. Die Karte trifft das Mesh im
    // Median auf 0,9 cm. Ein Halm von 8–24 cm auf der
    // Gesetzes-Höhe steckte so halb im sichtbaren Boden. Wer etwas AUF den sichtbaren Boden stellt (Gras,
    // Streu, Deko), liest diese Karte; Körper (Spieler, Tiere, Bäume) stehen weiter auf dem Gesetz
    // (`_voxelSurfaceY`, deterministisch für den Lockstep — die Karte hängt am Streaming-Zustand).
    _bodenKarteAusMesh(pos, idx, col, cx, cz, lod) {
        if (!pos || !idx || idx.length < 3) return null;
        const cfg = this._voxelChunkConfig(lod || 0);
        const T = AnazhRealm.BODEN_KARTE_TEILUNG;
        const h = cfg.step / T;
        const M = T * (cfg.dim + 3) + 1;
        const ox = cx * cfg.span - cfg.step;
        const oz = cz * cfg.span - cfg.step;
        const map = new Float32Array(M * M).fill(NaN);
        const gruen = new Uint8Array(M * M); // 0…255 = Wiesen-Gewicht 0…1
        const gs = AnazhRealm.TERRAIN_GEOLOGY.gruenSchwelle;
        for (let t = 0; t + 2 < idx.length; t += 3) {
            const a = idx[t] * 3;
            const b = idx[t + 1] * 3;
            const c = idx[t + 2] * 3;
            const ax = pos[a];
            const az = pos[a + 2];
            const bx = pos[b];
            const bz = pos[b + 2];
            const qx = pos[c];
            const qz = pos[c + 2];
            // Flächen-Neigung aus der GEOMETRIE (Betrag, wicklungs-frei): |n_y| ≥ 0,3·|n| trägt, Wände nicht.
            // Die Gradienten-Normalen der Vertices kippen an dünnen Platten (gemessen: Spawn-Plattform 7 m
            // unter dem sichtbaren Deckel), die Wicklung zeigt oben nach unten — beides taugt nicht als Wache.
            const ux = bx - ax;
            const uy = pos[b + 1] - pos[a + 1];
            const uz = bz - az;
            const vx = qx - ax;
            const vy = pos[c + 1] - pos[a + 1];
            const vz = qz - az;
            const ny = uz * vx - ux * vz;
            const nl = Math.hypot(uy * vz - uz * vy, ny, ux * vy - uy * vx);
            if (!(Math.abs(ny) >= 0.3 * nl)) continue;
            const d = (bz - qz) * (ax - qx) + (qx - bx) * (az - qz);
            if (Math.abs(d) < 1e-9) continue;
            const i0 = Math.max(0, Math.ceil((Math.min(ax, bx, qx) - ox) / h));
            const i1 = Math.min(M - 1, Math.floor((Math.max(ax, bx, qx) - ox) / h));
            const k0 = Math.max(0, Math.ceil((Math.min(az, bz, qz) - oz) / h));
            const k1 = Math.min(M - 1, Math.floor((Math.max(az, bz, qz) - oz) / h));
            for (let k = k0; k <= k1; k++) {
                const pz = oz + k * h;
                for (let i = i0; i <= i1; i++) {
                    const px = ox + i * h;
                    const w1 = ((bz - qz) * (px - qx) + (qx - bx) * (pz - qz)) / d;
                    const w2 = ((qz - az) * (px - qx) + (ax - qx) * (pz - qz)) / d;
                    const w3 = 1 - w1 - w2;
                    if (w1 < -1e-6 || w2 < -1e-6 || w3 < -1e-6) continue;
                    const y = w1 * pos[a + 1] + w2 * pos[b + 1] + w3 * pos[c + 1];
                    const m = k * M + i;
                    if (map[m] >= y) continue;
                    map[m] = y;
                    // Grün-Kanal: dieselbe Wiesen-Wache wie das Boden-Fragment (`_green` in
                    // `_terrainGeologyAlbedo`: smoothstep(0, gruenSchwelle, g − (r+b)/2)) aus der Vertex-Farbe.
                    if (col) {
                        let g = 0;
                        for (const [w, o] of [
                            [w1, a],
                            [w2, b],
                            [w3, c],
                        ])
                            g += w * (col[o + 1] - 0.5 * (col[o] + col[o + 2]));
                        const t2 = Math.max(0, Math.min(1, g / gs));
                        gruen[m] = Math.round(255 * t2 * t2 * (3 - 2 * t2));
                    }
                }
            }
        }
        return { hoehe: map, gruen };
    }

    // Pass 0 — Density-Grid: Nx*Ny*Nz Eck-Werte vom Sample. Float32Array,
    // Indizierung gi = i + j*Nx + k*Nx*Ny.
    // DAS BAND IST DAS DES BODENS (`boden`): ein Feld in eigenen Koordinaten (die Schwebe-Insel, `_voxelChunkGeometry` mit
    // eigenem Sampler) sampelt jede Ecke. Bis 10.10. schnitt das Boden-Band jedes Feld — die Insel (lokal um 0|0|0) bekam
    // das Band des Bodens am Welt-Ursprung: lag er tiefer als ~−3 m, verlor sie ihre Kuppe, unter ~−20 m (Tiefsee) jede
    // Ecke, und `new THREE.Mesh(null)` riss den Boot ab (1 von 40 frisch geborenen Welten erwachte nie).
    _voxelSampleDensityGrid(ox, oy, oz, dimX, dimY, dimZ, step, sample, colVoxel, boden = true) {
        const Nx = dimX + 1;
        const Ny = dimY + 1;
        const Nz = dimZ + 1;
        const density = new Float32Array(Nx * Ny * Nz);
        // BAND-SKIP: pro Spalte (i,k) nur die j-Ebenen um die Oberfläche sample()-n — über `surf + Roughness`
        // garantiert Luft, unter base−40 (Höhlen-Band endet base−28) garantiert Fels → −1/+1 statt sample(),
        // bit-identische Geometrie, ~60–70 % weniger Calls; Edits (strength 48) dominieren das ±1.
        // MUSS bit-identisch im Worker (`computeDensityGrid`).
        const base = this.state.terrainBaseHeight || 0;
        const ROUGH = 12; // max 3D-Roughness (noise·7 + noise·5)
        // Der Band-Top-Margin MUSS den Gradient-eps von `_voxelGradientNormals` (1.5 Zellen) decken — ein
        // Gipfel-Vertex sampelt +eps nach oben, das muss im echt gesampelten Band liegen (sonst kippt die
        // Gipfel-Normale). eps 1.5 + Puffer → 4 Zellen.
        const topMargin = 4 * step;
        // Spalten-Hoist: mit `colVoxel` wird `_terrainColumnContext` EINMAL pro Spalte gerechnet und deckt
        // Band-Grenzen (`ctx.surf`) UND per-Voxel-Auswertung (`colVoxel(...,ctx)` == sample, byte-identisch).
        // Ohne `colVoxel` (Edit-/Sonder-Sampler) der direkte Pfad. MUSS bit-identisch im Worker.
        for (let k = 0; k < Nz; k++) {
            const wz = oz + k * step;
            for (let i = 0; i < Nx; i++) {
                const wx = ox + i * step;
                const ctx = colVoxel ? this._terrainColumnContext(wx, wz) : null;
                const surf = !boden ? 0 : ctx ? ctx.surf : this._terrainMacroSurfaceY(wx, wz);
                const bandTopJ = boden ? Math.floor((surf + ROUGH + topMargin - oy) / step) + 1 : Ny;
                // Band-Boden: unter `min(surf, base) − 40` ist garantiert Fels. Er MUSS surf folgen — in einer
                // Tiefsee-Rinne (~−75 m) füllte ein fixes base−40 die Wassersäule fälschlich als Fels.
                const bandBotJ = boden ? Math.floor((Math.min(surf, base) - 40 - oy) / step) : -1;
                const colBase = i + k * Nx * Ny;
                for (let j = 0; j < Ny; j++) {
                    const idx = colBase + j * Nx;
                    if (j > bandTopJ) density[idx] = -1;
                    else if (j < bandBotJ) density[idx] = 1;
                    else density[idx] = ctx ? colVoxel(wx, oy + j * step, wz, ctx) : sample(wx, oy + j * step, wz);
                }
            }
        }
        return density;
    }

    // Pass 1 — ein Vertex pro oberflächen-schneidender Zelle. Liefert positions (x/y/z-Tripel),
    // cellVert (Zell-Index → Vertex-Index, -1 ohne Oberfläche), vertCells (i/j/k pro Vertex, Crop-Filter).
    _voxelExtractSurfaceVertices(density, ox, oy, oz, dimX, dimY, dimZ, step) {
        const Nx = dimX + 1;
        const Ny = dimY + 1;
        const gi = (i, j, k) => i + j * Nx + k * Nx * Ny;
        const ci = (i, j, k) => i + j * dimX + k * dimX * dimY;
        // Die 12 Würfel-Kanten als Eck-Paare (Eck c: bit0=x, bit1=y, bit2=z).
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
        const solid = (v) => v > 0;
        const cellVert = new Int32Array(dimX * dimY * dimZ).fill(-1);
        const positions = [];
        const vertCells = [];
        const sharp = []; // T3 — pro Vertex: 1, wenn das QEF eine echte FEATURE-Ecke fand (scharf)
        // T3 (Manifold Dual Contouring): LAMBDA regularisiert das QEF Richtung Mass-Point (=der
        // alte Surface-Nets-Mittel-Vertex). Klein → scharf (QEF dominiert, Feature-Ecken); gross →
        // glatt (Mass-Point). Browser-justierbar; das Clamp auf die Zelle bannt Self-Intersection.
        const LAMBDA = AnazhRealm.DC_LAMBDA;
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
                    // Mass-Point (Mittel der Kanten-Kreuzungen) + QEF (Dual Contouring): jede Kreuzung p_i mit Hermite-
                    // Normale n_i (analytischer Trilinear-Gradient) spannt n_i·(x−p_i)=0; das Minimum von
                    // Σ(n_i·(x−p_i))² sitzt am Feature-Eckpunkt.
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
                        // analytischer Trilinear-Gradient an (px,py,pz) aus den 8 Ecken
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
                        if (glen < 1e-9) continue; // flacher Punkt → nur Mass-Point
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
                        cz = vz * s; // Mass-Point (= der alte Surface-Nets-Vertex)
                    // QEF + Mass-Point-Regularisierung (λ), dann 3×3 via Cramer (deterministisch)
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
                        // „scharf" = das QEF zog den Vertex spürbar vom Mass-Point weg (ein echtes
                        // Feature, kein flaches Mittel) → der feature-bewusste Laplacian verschont ihn.
                        const dxm = fx - cx,
                            dym = fy - cy,
                            dzm = fz - cz;
                        if (dxm * dxm + dym * dym + dzm * dzm > AnazhRealm.DC_SHARP_MOVE2) isSharp = 1;
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

    // Pass 2 — je Gitter-Kante mit Vorzeichenwechsel ein Quad; die Diagonale alterniert mit der
    // Zell-Parität `(i+j+k) & 1` (sonst Streifen-Muster auf flachen Hügeln). cv() ist die Out-of-Range-
    // Wand: ohne sie aliast `ci(dim, j, k)` in einen fremden Zell-Slot → Streck-Dreieck an jeder Naht.
    // Mit `lab` (je Gitter-Punkt die Höhlen-Zelle, `_voxelHoehlenGraph`) trägt `triZelle` je Dreieck die Zelle des
    // LUFT-Endes seiner Kante (−1: Himmels-Luft) — die Fläche gehört der Luft, aus der man sie sieht.
    _voxelEmitQuadIndices(density, cellVert, dimX, dimY, dimZ, lab = null, triZelle = null) {
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
        // die Zelle des Luft-Endes der Kante p0–p1 (s0: p0 fest)
        const luft = (p0, p1, s0) => (lab ? lab[s0 ? p1 : p0] : -1);
        for (let k = 0; k <= dimZ; k++) {
            for (let j = 0; j <= dimY; j++) {
                for (let i = 0; i <= dimX; i++) {
                    const p0 = gi(i, j, k);
                    const s0 = solid(density[p0]);
                    const parity = (i + j + k) & 1;
                    // +x-Kante → 4 Zellen bei (i, j-1..j, k-1..k)
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
                    // +y-Kante → 4 Zellen bei (i-1..i, j, k-1..k)
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
                    // +z-Kante → 4 Zellen bei (i-1..i, j-1..j, k)
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

    // DIE HÖHLEN-SCHICHT (Welle 7) — der Sicht-Graph der Höhlen-Luft aus dem Dichte-Gitter des Chunks (MUSS bit-identisch
    // im Worker, `hoehlenGraph`). Befund (echte GPU, Mess-Wiese −900/−850, Gitter-Probe): 68 % der Boden-Kanten trennen Fels
    // von HÖHLEN-Luft, und der Boden-Satz zeichnete sie in jedem Pass; eine Tiefen-Grenze unter der Oberfläche risse an
    // Mündungen, Überhängen und Klippen Löcher. Die Wahrheit liegt in der Luft: HIMMELS-Luft ist ein Luft-Punkt über der
    // obersten festen Ecke seiner Spalte, HÖHLEN-Luft einer darunter. Senkrecht unter Himmels-Luft liegt nur Himmels-Luft
    // oder Fels — ein Strahl aus dem Himmel betritt Höhlen-Luft nur WAAGERECHT, durch eine MÜNDUNG (Höhlen-Luft neben
    // Himmels-Luft). Eine ZELLE ist eine Höhlen-Luft-Komponente (6-Nachbarschaft, wie Surface-Nets die Luft trennt) je
    // Chunk-Teil (Kachel × Lage); ein PORTAL sind zwei 6-benachbarte Punkte verschiedener Zellen (über eine Teil-Grenze); das RAND-BAND
    // trägt die Punkte bis einen Schritt jenseits jeder Chunk-Kante (dort verknüpft der Haupt-Thread die Nachbar-Chunks,
    // `_hoehlenVerknuepfe`). Zelle 0 sammelt die versiegelten Komponenten (keine Mündung, kein Portal, kein Rand-Band — von
    // außen nie zu sehen). Rückgabe: `lab` (je Gitter-Punkt die Zelle, −1 = keine Höhlen-Luft), `n` Zellen, `knoten` (je
    // Zelle ihre Luft-Box, min xyz · max xyz, leer = +∞/−∞), `muend` (je Zelle und Fach von 4³ Punkten eine Mündungs-Box:
    // Zelle · Box), `seiten` (je Zelle und Seite −x · +x ·
    // −z · +z die Box ihrer Rand-Band-Punkte), `kanten` (je Portal Zelle a · Zelle b · Box), `rand` (die Höhlen-Punkte auf
    // den Chunk-Kanten, `_hoehlenVerknuepfe`).
    _voxelHoehlenGraph(density, ox, oy, oz, dimX, dimY, dimZ, step) {
        const Nx = dimX + 1;
        const Ny = dimY + 1;
        const Nz = dimZ + 1;
        const NxNy = Nx * Ny;
        const N = NxNy * Nz;
        // die oberste feste Ecke je Spalte (−1: keine)
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
        const teil = (i, j, k) =>
            kachel(i, dimX - 3) + TEIL * kachel(k, dimZ - 3) + TEIL * TEIL * Math.floor(j / SCHICHT);
        // (1) die Komponenten je Teil (Breitensuche über einen Stapel, Punkte in Index-Folge — deterministisch)
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
        // (2) je Komponente: Luft-Box, Mündungs-Boxen je Fach, Rand-Bänder (Gitter-Indizes) und die Portale zu den Nachbar-Teilen
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
        const offen = new Uint8Array(nRoh); // Mündung, Portal oder Rand-Band → nicht versiegelt
        const paare = []; // je Portal-Fund [a, b, i, j, k, i2, k2]
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
            // die Mündung: ein waagerechter Nachbar in Himmels-Luft
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
            // das Portal: der +x-, +y- bzw. +z-Nachbar in einer anderen Zelle (nur über eine Teil-Grenze möglich)
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
        // (3) Zellen: die versiegelten → 0, jede offene Komponente ihre Zelle 1…n−1 (in Fund-Folge)
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
        // eine Gitter-Box (Int32, leer: min > max) in eine Welt-Box (Float32) vereinen
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
        // (4) die Portale je Zellen-Paar (a < b) als EINE Box beider Punkte, in Fund-Folge
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

    // Laplacian-Smooth MUTIERT positions in place (Surface-Nets-Treppen → sanfte Schrägen).
    // Naht: N Iterationen propagieren N Zellen → pad+crop MUSS N Zellen breit sein, sonst Risse zwischen
    // Nachbar-Chunks (Seam-Test). Alle Pfade nutzen 1 (cropMargin 1); mehr braucht einen breiteren pad
    // im geteilten Density-Grid (auch von den Wasser-Cells indiziert).
    _voxelLaplacianSmoothPositions(positions, indices, iterations = 1, sharp = null) {
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
                // T3 — feature-bewusst: ein scharfer QEF-Vertex (Feature-Ecke) bleibt UNgesmootht,
                // sonst rundet der Laplacian die Kante wieder weg (er fügte vor T3 die Blobigkeit zu).
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

    // Crop-Pass: die äußersten `cropMargin` Zell-Ebenen in X/Z (nur Smooth-Stützen) verwerfen. MUTIERT
    // positions + indices in place (.length=0 + push — der Aufrufer hält Referenzen).
    // `triZelle` (die Höhlen-Zelle je Dreieck, `_voxelEmitQuadIndices`) fällt mit seinen Dreiecken.
    _voxelCropPad(positions, indices, vertCells, dimX, dimZ, cropMargin, triZelle = null) {
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

    // Normalen = −∇d des Dichtefelds (die wahre Iso-Normale, facettierungs-unabhängig) statt
    // `computeVertexNormals` (nimmt jede Quad-Diagonal-Faltung auf → Rauten-Facetten). Mit preGrid
    // trilinear aus den 8 Corner-Densities (spart 6 Dichte-Calls/Vertex); nicht abgedeckt → sample().
    _voxelGradientNormals(positions, sample, step, preGrid = null) {
        const normals = new Float32Array(positions.length);
        // NIE up-Normalen in die Geometrie backen: die Geometrie trägt die echte Oberflächen-Normale (der Boden-Stoff
        // liest sie als `normalWorldGeometry` — das Bump-Tor nach Hangneigung, die Mischung zur Senkrechten), das
        // Shading flacht im Material-normalNode (TERRAIN_NORMAL_FLATTEN). Der Schatten-Versatz liest NICHT die
        // Geometrie, sondern die End-Normale dieses normalNode (r184 `normalWorld`).
        const eps = step * 1.5;
        // Schneller Trilinear-Sampler aus dem Grid. Wenn preGrid==null oder
        // Sample-Punkt out-of-bounds → fallback auf sample(x,y,z).
        let lookup;
        if (preGrid) {
            const d = preGrid.density;
            const gOx = preGrid.ox;
            const gOy = preGrid.oy;
            const gOz = preGrid.oz;
            const gStep = preGrid.step;
            const Nx = preGrid.Nx;
            const Ny = preGrid.Ny;
            const Nz = preGrid.Nz;
            const NxNy = Nx * Ny;
            const NxMax = Nx - 1;
            const NyMax = Ny - 1;
            const NzMax = Nz - 1;
            lookup = (x, y, z) => {
                const fx = (x - gOx) / gStep;
                const fy = (y - gOy) / gStep;
                const fz = (z - gOz) / gStep;
                const i = Math.floor(fx);
                const j = Math.floor(fy);
                const k = Math.floor(fz);
                // Beide Bounds-Seiten prüfen (i+1 muss noch im Grid liegen).
                if (i < 0 || j < 0 || k < 0 || i >= NxMax || j >= NyMax || k >= NzMax) {
                    return sample(x, y, z);
                }
                const tx = fx - i;
                const ty = fy - j;
                const tz = fz - k;
                const base = i + j * Nx + k * NxNy;
                const d000 = d[base];
                const d100 = d[base + 1];
                const d010 = d[base + Nx];
                const d110 = d[base + 1 + Nx];
                const d001 = d[base + NxNy];
                const d101 = d[base + 1 + NxNy];
                const d011 = d[base + Nx + NxNy];
                const d111 = d[base + 1 + Nx + NxNy];
                const d00 = d000 * (1 - tx) + d100 * tx;
                const d10 = d010 * (1 - tx) + d110 * tx;
                const d01 = d001 * (1 - tx) + d101 * tx;
                const d11 = d011 * (1 - tx) + d111 * tx;
                const d0 = d00 * (1 - ty) + d10 * ty;
                const d1 = d01 * (1 - ty) + d11 * ty;
                return d0 * (1 - tz) + d1 * tz;
            };
        } else {
            lookup = sample;
        }
        // Konforme Rand-Normale: Same-LOD-Nachbarn teilen Rand-Verts float-exakt, aber trilinear (lokales
        // Grid) vs. sample()-Fallback (Nachbar out-of-bounds) ergibt verschiedene Normalen → Lichtungs-Naht.
        // Darum in der RAND-SCHALE (≤3 Zellen vom Grid-Rand) den ganzen Gradienten via sample() = reine
        // Funktion der Welt-Position → identische Normale; das Innere bleibt trilinear. Worker-Mirror
        // (`gradientNormals`), maxDiff 0. gridBound* nur mit preGrid (sonst ist lookup schon sample).
        const hasGrid = !!preGrid;
        let gx0 = 0,
            gx1 = 0,
            gz0 = 0,
            gz1 = 0,
            boundMargin = 0;
        if (hasGrid) {
            const gStep = preGrid.step;
            gx0 = preGrid.ox;
            gx1 = preGrid.ox + (preGrid.Nx - 1) * gStep;
            gz0 = preGrid.oz;
            gz1 = preGrid.oz + (preGrid.Nz - 1) * gStep;
            boundMargin = 3 * gStep;
        }
        for (let v = 0; v < positions.length; v += 3) {
            const px = positions[v];
            const py = positions[v + 1];
            const pz = positions[v + 2];
            // Rand-Schale → sample() (konforme Normale); sonst der schnelle Grid-Trilinear.
            const useSample =
                hasGrid &&
                (px - gx0 < boundMargin || gx1 - px < boundMargin || pz - gz0 < boundMargin || gz1 - pz < boundMargin);
            const L = useSample ? sample : lookup;
            const gx = L(px + eps, py, pz) - L(px - eps, py, pz);
            const gy = L(px, py + eps, pz) - L(px, py - eps, pz);
            const gz = L(px, py, pz + eps) - L(px, py, pz - eps);
            const len = Math.hypot(gx, gy, gz);
            if (len < 1e-6) {
                // Gradient ~0 (sehr seltener Sattelpunkt) → Default „oben".
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
    // Welt-Feld-Farbe pro Voxel-Vertex als `color`-Attribut: jeder Vertex durch DIE EINE BODEN-FARBE.
    _attachVoxelFieldColors(geom) {
        const pos = geom && geom.getAttribute ? geom.getAttribute("position") : null;
        if (!pos || typeof this.worldFieldAt !== "function") return;
        const n = pos.count;
        const colors = new Float32Array(n * 3);
        const out = [0, 0, 0];
        for (let i = 0; i < n; i++) {
            this._bodenFarbeAt(pos.getX(i), pos.getY(i), pos.getZ(i), out);
            colors[i * 3] = out[0];
            colors[i * 3 + 1] = out[1];
            colors[i * 3 + 2] = out[2];
        }
        geom.setAttribute("color", new THREE.Float32BufferAttribute(colors, 3));
        this._felsStoff(geom);
    }

    // DER FELS HAT STOFF (K17; davor K02a „unter Fels wächst nichts"): das EINE Gesetz rechnet ihn — gelaende-core `felsStoff`
    // (die Pakete, die Rinde aus der Krümmung, Mulden, Flechte, Moos und der Schutt des Schicht-Gesetzes, Gewicht aus Himmels-
    // Sicht und Steile). Er entsteht, wo das Netz entsteht (K17-2): der Streaming-Pfad bekommt ihn fertig vom voxel-worker
    // (`buildChunkMesh`, per Transfer — `_buildVoxelChunkDataFromWorkerMesh` setzt nur die Attribute), der Haupt-Thread rechnet
    // ihn nur im Sync-Bau (`_attachVoxelFieldColors`: Spieler-Chunk, Graben, Voxel-Test). Bis K17-2 rechnete `_felsStoff` je
    // Worker-Bau im Haupt-Thread (Mess-Wiese Σ 59,4 ms je Ring, max 7,3 ms je Chunk, `gate:hoehlen-sicht` (n)).
    _felsStoff(geom) {
        const col = geom.attributes.color;
        const him = geom.attributes.aHimmel;
        const nor = geom.attributes.normal;
        const pos = geom.attributes.position;
        if (!col || !nor || !pos)
            throw new Error("_felsStoff: der Boden trägt nicht color · normal · position (fail-closed)");
        // Ohne Höhlen-Graph (nur der Voxel-Test `_voxelTest`: ein Gitter ohne Sicht-Graph) steht jeder Vertex unter dem
        // Himmel — jeder Chunk trägt `aHimmel` (`_buildVoxelChunkData*` bauen den Graph fail-closed).
        const S = globalThis.__gelaendeCore.felsStoff(
            this._gelaende(),
            AnazhRealm.FELS_STOFF.basis,
            AnazhRealm.FELS_STOFF.netz,
            pos.array,
            nor.array,
            geom.index ? geom.index.array : null,
            him ? him.array : null,
            col.array,
            pos.count,
            (x, z, y) => this._feuchteAt(x, z, y)
        );
        geom.setAttribute("aSchutt", new THREE.Float32BufferAttribute(S.schutt, 1));
        // die Linse (`gate:hoehlen-sicht` (k)) liest, womit das Moos gerechnet wurde
        if (S.feuchte !== undefined) geom.userData.felsFeuchte = S.feuchte;
        col.needsUpdate = true;
    }

    // DIE EINE BODEN-FARBE (V18.530): die Welt-Feld-Farbe eines Boden-Punkts aus derselben fraktalen Sprache
    // (worldFieldAt) → dieselben Biom-Regionen wie der Boden. Der Voxel-Chunk färbt jeden Vertex durch sie, der
    // Fern-Ring und das Feld-Panorama lesen sie für die Ferne (kein vereinfachter Fern-Zwilling); der Worker
    // rechnet sie bit-identisch (`attachFieldColors`) mit DERSELBEN Palette (`bodenPalette` im Schnappschuss).
    // Die Farben sind die Studio-Palette nach dem FARB-GESETZ (`BODEN_FARBE`): bis V18.530 trug der Boden Absichts-
    // Werte roh als linear (der Stein 0,42/0,44/0,49 mit dem Magie-Violett darüber: weiß-lavendel, Blick-Tour 05).
    // Magie ist ein AKZENT in Flecken, der Seegrund unter jedem Wasser Schlick. Die Laubstreu liegt NICHT hier: sie
    // folgt den echten Kronen (`_kronenStreuNeu` → `_wegeBodenFarbe`). `out` = [r, g, b] (linear, wie das Vertex-
    // Attribut). Die Ferne (das Mittel der Flecken und Bänder über eine Fläche) rechnet der Fern-Faden (`bodenFarbe` im
    // voxel-worker mit `fussM`, B2) — ohne fussM dieselben Zahlen wie hier.
    _bodenFarbeAt(x, y, z, out) {
        // V9.60-b.2 — Sand-Variation: lazy-laden des deterministischen
        // Welt-Noises (gleiche Instanz wie `_terrainMacroSurfaceY`). Macht
        // Strand-Breite + Intensität regional variabel statt überall gleich.
        const sandNoise = this._gelaende().noise;
        const base = this.state.terrainBaseHeight || 0;
        const P = AnazhRealm.BODEN_FARBE;
        const stone = P.rock;
        const earth = P.mead;
        const dampEarth = P.wet;
        const lava = P.basalt;
        const violet = P.magie;
        const snow = P.schnee;
        const sed = P.sediment;
        const sand = P.sand;
        const packedDirt = P.dirt;
        const ss = (e0, e1, x) => {
            let t = (x - e0) / (e1 - e0);
            t = t < 0 ? 0 : t > 1 ? 1 : t;
            return t * t * (3 - 2 * t);
        };
        // Feuchte-Sichtbarkeitskurve aus AnazhRealm.FEUCHTE (im Main justierbar); der Worker-Spiegel
        // hardkodiert sie — eine Runtime-Tunable bräche den bit-Vertrag.
        const F_VIS_LO = (AnazhRealm.FEUCHTE && AnazhRealm.FEUCHTE.sichtbarLo) || 0.3;
        const F_VIS_HI = (AnazhRealm.FEUCHTE && AnazhRealm.FEUCHTE.sichtbarHi) || 0.85;
        const f = this.worldFieldAt(x, z);
        const c = [stone[0], stone[1], stone[2]];
        const mix = (target, t) => {
            c[0] += (target[0] - c[0]) * t;
            c[1] += (target[1] - c[1]) * t;
            c[2] += (target[2] - c[2]) * t;
        };
        mix(earth, ss(0.25, 0.85, f.lebendig));
        // Feuchte schiebt den Boden Richtung dampEarth. Reihenfolge im mix-Stack ist Pflicht: nach earth, VOR
        // lava/snow/sed/strand. genVersion-Schleuse via _feuchteAt (< 2 → 0); Vertex-y ist die Surface.
        const feuchte = typeof this._feuchteAt === "function" ? this._feuchteAt(x, z, y) : 0;
        mix(dampEarth, ss(F_VIS_LO, F_VIS_HI, feuchte));
        // Kein Kronendach im Vertex: bis 06.10. dunkelte das Kronenlicht-Feld der Platzierung (`_canopyLightAt`, wo
        // Bäume wachsen DÜRFEN) den Boden × (0,58 + 0,46 · Licht) — zu 98 % ohne Baum darüber, unter einem Baum
        // zusätzlich zu seinem echten Schatten. Die Laubstreu unter den echten Kronen legt `_wegeBodenFarbe` auf.
        // Lichen: grüne Patina = feuchte × dichte (Stein, nicht Erde/Lava) × cluster (Flecken). Im Mix-Stack
        // NACH dampEarth, VOR lava/snow/sed/strand (die überschreiben den Stein). Schwellen in
        // AnazhRealm.LICHEN (der Worker spiegelt sie hardkodiert), die Farbe ist die Flechte der Palette.
        const LCH = AnazhRealm.LICHEN;
        const lichenCluster = (sandNoise.noise2D(x * 0.04 + 7.7, z * 0.04 - 3.3) + 1) * 0.5; // [0..1]
        const lichenMix =
            ss(LCH.feuchteLo, LCH.feuchteHi, feuchte) *
            ss(LCH.dichteLo, LCH.dichteHi, f.dichte || 0) *
            lichenCluster *
            LCH.strength;
        mix(P.flechte, lichenMix);
        mix(lava, ss(0.48, 1.02, f.glut) * 0.65); // dunkles Basalt, gekappt — kein flaches Rot
        // Der Magie-Akzent: Flecken (λ ≈ 11 m, ein Sechstel der Fläche, höchstens 30 %) in den Magie-Regionen — nie die Grundfarbe.
        const magieFleck = ss(0.6, 0.85, (sandNoise.noise2D(x * 0.09 + 3.1, z * 0.09 - 8.7) + 1) * 0.5);
        mix(violet, ss(0.55, 1.0, f.magieleitung) * magieFleck * 0.3);
        // Die Schneegrenze ist Gesetz (gelaende-core `schnee`: die Höhe über dem Meer, dieselbe Funktion ruft der Worker
        // in `attachFieldColors`).
        mix(snow, globalThis.__gelaendeCore.schnee(this._gelaende(), y, x, z));
        // Der Seegrund: unter JEDEM Wasser (Meer, See, Fluss — der Spiegel des Orts) liegt Schlick, voll ab 4 m
        // Tiefe (bis V18.530 nur unter dem Meeresspiegel y < −2: die Bergseen lagen auf Wiese und Streu).
        // Schlick und Strand sind Ufer-Bänder über beiden Bezügen (`_waterLevelAt`): See/Meer voll, der Fluss mit seiner
        // Kronen-Blende — stetig über die Krone, wo der Fluss-Spiegel endet.
        const uf = { see: 0, fluss: null, ufer: 0 };
        this._waterLevelAt(x, z, uf);
        const aboveWater = y - uf.see;
        const aboveFluss = uf.fluss !== null ? y - uf.fluss : null;
        let schlick = ss(-0.5, -4, aboveWater);
        if (aboveFluss !== null) schlick = Math.max(schlick, uf.ufer * ss(-0.5, -4, aboveFluss));
        // Strand: Glocken-Profil über dem Wasser (`_waterLevelAt` O(1) für Ozean; See-Vertices bekommen den
        // See-Spiegel). Drei Noise-Modulationen statt einer Schwelle: (a) Breite (λ~570 m), (b) Intensität
        // (λ~290 m), (c) karge Fels-Patches ohne Sand. Die Glocke trägt bis 0,6 + 1,9 m — das Fenster schneidet sie nie
        // (bis Welle L endete es bei 2,0 m: ein Sprung im Strand jeder breiten Glocke).
        const imStrand = (a) => a !== null && a > -1.3 && a < 2.5;
        mix(sed, schlick);
        if (imStrand(aboveWater) || (uf.ufer > 0 && imStrand(aboveFluss))) {
            const widthNoise = (sandNoise.noise2D(x * 0.0018, z * 0.0018) + 1) * 0.5; // [0, 1]
            const intenseNoise = (sandNoise.noise2D(x * 0.0034 + 17, z * 0.0034 - 9) + 1) * 0.5;
            if (widthNoise > 0.18) {
                const width = 0.5 + 1.4 * widthNoise; // [0.5, 1.9] m
                const intensity = 0.25 + 0.55 * intenseNoise; // [0.25, 0.8]
                const glocke = (a) => Math.max(0, 1 - Math.abs(a - 0.6) / width);
                let shoreBlend = glocke(aboveWater);
                if (aboveFluss !== null) shoreBlend = Math.max(shoreBlend, uf.ufer * glocke(aboveFluss));
                mix(sand, shoreBlend * intensity);
            }
            // widthNoise <= 0.18 → karge Stelle, Sand bleibt aus (Stone/
            // Earth gewinnt). Spielt mit den V9.60-b.1-Hochseen zusammen:
            // jeder See hat sein eigenes Mix aus Sand-Strand und Fels-Ufer.
        }
        // V18.230 (Ω-OPSIS Säule II Ω-O6) — die PFADE: die Fluss-Bänke sind
        // getrampelte, gepackte Erde (Gras wird zusätzlich unterdrückt, s.
        // _buildVoxelChunkGrass). Lawful aus dem Drainage-Netz (_pathFieldAt).
        const pathF = this._pathFieldAt(x, z, y);
        if (pathF > 0.01) mix(packedDirt, pathF * 0.6);
        // DER WIESEN-GRUND (K53, `WIESEN_GRUND`): wo die Wache Grün sagt, deckt das Mittel des Halms den Grund, der Fleck
        // (λ 7,7 m) lässt karge Stellen.
        const WG = AnazhRealm.WIESEN_GRUND;
        const gruen = ss(0, WG.schwelle, c[1] - 0.5 * (c[0] + c[2]));
        if (gruen > 0) {
            const fleck = (sandNoise.noise2D(x * 0.13 + 5.3, z * 0.13 - 2.9) + 1) * 0.5;
            mix(WG.farbe, gruen * (0.5 + 0.5 * fleck));
        }
        out[0] = c[0];
        out[1] = c[1];
        out[2] = c[2];
        return out;
    }

    // Test-Chunk (`voxel test`): ein Voxel-Chunk wird neben dem Spieler gemesht und in die Szene gestellt
    // (begehbar über die feld-native Kollision); ein zweiter Aufruf ersetzt den alten.
    _spawnVoxelTestChunk() {
        if (!this.state.scene) return null;
        if (this._voxelTestMesh) {
            this.state.scene.remove(this._voxelTestMesh);
            // V10.0-j.f — Defer (WebGPU Submit-Race-frei).
            if (this._voxelTestMesh.geometry) this._queueDispose(this._voxelTestMesh.geometry);
            if (this._voxelTestMesh.material) this._queueDispose(this._voxelTestMesh.material);
            this._voxelTestMesh = null;
        }
        const pm = this.state.playerMesh;
        const px = pm ? pm.position.x : 0;
        const pz = pm ? pm.position.z : 0;
        const dim = 24;
        const stepSize = 1.6;
        const ox = px + 22;
        const oz = pz - dim * stepSize * 0.5;
        // V14.7 — das vertikale Band straddelt die ECHTE Oberfläche am Chunk-Zentrum
        // (vorher fix `base-20`; die V14.7-Massive heben surf weit über base → ein
        // festes Tiefband läge ganz unter Grund → leeres Mesh). Robust für jede Höhe.
        const oy = Math.round(this._terrainMacroSurfaceY(ox + dim * stepSize * 0.5, oz + dim * stepSize * 0.5)) - 20;
        const geom = this._voxelChunkGeometry(ox, oy, oz, dim, dim, dim, stepSize);
        if (!geom) {
            this.log("Voxel-Test: das Dichte-Feld war hier leer.", "INFO");
            return null;
        }
        this._attachVoxelFieldColors(geom);
        // V10.0-g — Voxel-Test-Mesh nutzt den ToonNodeMaterial-Helper (WebGPU-kompatibel).
        const mat = this._buildToonNodeMaterial({ vertexColors: true, side: THREE.DoubleSide });
        const mesh = new THREE.Mesh(geom, mat);
        mesh.name = "voxel-testchunk";
        mesh.castShadow = true;
        mesh.receiveShadow = true;
        this.state.scene.add(mesh);
        this._voxelTestMesh = mesh;
        const vCount = geom.getAttribute("position").count;
        this.log(
            `Voxel-Test-Chunk gemesht: ${vCount} Vertices (Surface Nets) — begehbar (feld-native Kollision).`,
            "INFO"
        );
        return mesh;
    }

    // ### Der Voxel-Chunk-Ring ###
    // Voxel-Chunks streamen um den Spieler.

    // Konfiguration des Voxel-Chunk-Rings — eine Quelle der Wahrheit, optional per `lod`.
    // span = dim·step = 43.2 m ist LOD-invariant → Chunks sind über LOD-Grenzen world-aligned, ebenso die
    // vertikale Spanne. Jede gröbere LOD verdoppelt step (weniger Cells), Fog tarnt die Differenz;
    // Pad+Crop gilt nur innerhalb einer LOD. EINE Geometrie-Maschinerie (`_voxelChunkGeometry`),
    // mehrere step-Varianten.
    _voxelChunkConfig(lod = 0) {
        // ringRadius folgt dem Sicht-Ring-Regler (Default 4), beim Boot gedeckelt durch `_activeRingRadius`:
        // der startet klein und wächst nur, wenn der aktuelle Ring VOLL steht und der Frame Luft hat
        // (`_nexusPerfActuate`) — eine kleine settled Basis statt 81 Chunks auf einmal.
        const targetRing = Math.max(1, Math.min(12, this.state.chunkRingRadius || 4));
        const activeRing = this.state._activeRingRadius != null ? this.state._activeRingRadius : targetRing;
        // Der Boot-Ring darf 0 sein (EIN Chunk, RING_RAMP_START=0) — ein `Math.max(1,…)`-Floor erzwänge 3×3.
        // Der Nebel/Void-Boden trägt den Rand, bis Ring 1 nachzieht.
        const ringRadius = Math.max(0, Math.min(targetRing, activeRing));
        // LOD-Pyramide: alle Stufen teilen Horizontal-Span (dim·step = 43.2 m) UND Vertikal-Span → LOD-
        // invariant; LOD2/LOD3 sind die fernen Ringe. Das Vertikal-Gitter ist FEST und ausgerichtet (kein
        // per-Chunk-`oy` — das bräche die Ausrichtung → neue Nähte): Band floorDrop 135 .. Decke +282.6
        // (417.6 m) umfasst Gipfel ~+247 m und Tiefsee bis ~−144 m; der Band-Skip hält die Hülle billig.
        if (lod >= 3) {
            // LOD 3 — step 14.4, dim 3 (64× weniger Cells als LOD0). Fernster Ring. span 29·14.4 = 417.6.
            return { dim: 3, step: 14.4, span: 43.2, ringRadius, dimY: 29, floorDrop: 135, lod: 3 };
        }
        if (lod >= 2) {
            // LOD 2 — step 7.2, dim 6 (16× weniger Cells als LOD0). span 58·7.2 = 417.6.
            return { dim: 6, step: 7.2, span: 43.2, ringRadius, dimY: 58, floorDrop: 135, lod: 2 };
        }
        if (lod >= 1) {
            // LOD 1 — Half-Resolution (8× weniger Cells). span 116·3.6 = 417.6.
            return { dim: 12, step: 3.6, span: 43.2, ringRadius, dimY: 116, floorDrop: 135, lod: 1 };
        }
        // LOD 0 — volle Auflösung, Band base−135 .. base+282.6; der Band-Skip sampelt nur um die Oberfläche
        // (die Hülle kostet nur Allokation). Vertikal-Span 232·1.8 = 116·3.6 = 58·7.2 = 29·14.4 = 417.6 m —
        // LOD-invariant, damit Wasser-Zellen/Cross-Chunk-Logik ausgerichtet bleiben.
        return { dim: 24, step: 1.8, span: 43.2, ringRadius, dimY: 232, floorDrop: 135, lod: 0 };
    }

    // ===== DIE DETAIL-KASKADE — die EINE Distanz-Quelle =====
    // EIN kamera-relatives Distanz-Feld (`r` = Chebyshev-Chunk-Distanz vom Spieler), das alle Welt-
    // Schichten für „wie viel Detail HIER" lesen (Farbe, Geometrie-LOD, Schatten, Deko/Kreaturen,
    // Draw-Calls). EINE frozen Tabelle (`DETAIL_CASCADE`); jedes Band-Feld braucht einen verifizierten
    // Leser. Alles ist `f(r)`, derived → kein State, kein Drift.
    _detailBand(r) {
        const c = AnazhRealm.DETAIL_CASCADE;
        for (let i = 0; i < c.length; i++) if (r <= c[i].maxRing) return c[i];
        return c[c.length - 1];
    }

    // DIE STUFE EINES CHUNKS (K51-2, CDLOD): aus dem KASTEN-Abstand des Spielers (px, pz in Metern) zum Chunk-Quadrat
    // (Chebyshev) — verfeinert, sobald er unter `bis + vorlauf` seiner Stufe fällt (`BODEN_STUFEN`), mit `currentLod`
    // (Streaming-Takt) hält die Hysterese einen feineren Chunk, bis der Abstand `bis + vorlauf + halt` erreicht. Der
    // Wechsel geschieht so nur, wo jeder Vertex des Chunks ganz auf der gröberen Fläche liegt (Gewicht 1, `_stufeGewicht`):
    // der Ring der Stufe-0-Zone (r ≤ 1) war für die CDLOD-Bedingung zu grob — ein Chunk-Ring trägt 2 Spannen Abstand.
    _voxelChunkLodFor(cx, cz, px, pz, currentLod = null) {
        const B = AnazhRealm.BODEN_STUFEN;
        const S = this._voxelChunkConfig(0).span;
        const d = Math.max(Math.max(cx * S - px, 0, px - (cx + 1) * S), Math.max(cz * S - pz, 0, pz - (cz + 1) * S));
        const st = B.stufen;
        let lod = st[st.length - 1].lod;
        for (let i = 0; i < st.length; i++)
            if (d < st[i].bis + B.vorlauf) {
                lod = st[i].lod;
                break;
            }
        // Hysterese nur beim VERGRÖBERN; verfeinern greift sofort — Detail erscheint prompt, nur das Entfernen ist träge
        if (currentLod === null || !Number.isFinite(currentLod) || currentLod >= lod) return lod;
        const halt = st.find((x) => x.lod === currentLod);
        return halt && d < halt.bis + B.vorlauf + B.halt ? currentLod : lod;
    }

    // DIE STUFEN-ZELLE (K51-3): wo sich die Wahl des Rings ändern KANN — die Spieler-Zelle und je Achse das Fach der Lage
    // in ihr zwischen den kritischen Brüchen. Der Kasten-Abstand zu einem Chunk ist je Achse i·S − f (vorne) oder
    // f + (|i| − 1)·S (hinten), er kreuzt eine Schwelle t (`bis + vorlauf`, `bis + vorlauf + halt`) nur bei f = S − t mod S
    // oder f = t mod S; dazwischen trägt jeder Chunk dieselbe Stufe. Der Stempel der Strom-Wache (`_tickVoxelStreaming`) und
    // die Gehen-Probe der Stand-Linse lesen sie: Gehen kostet die Änderung, nie die 2-m-Spur.
    _stufenZelle(px, pz) {
        const B = AnazhRealm.BODEN_STUFEN;
        const S = this._voxelChunkConfig(0).span;
        const cx = Math.floor(px / S),
            cz = Math.floor(pz / S);
        const fach = (f) => {
            let n = 0;
            for (const s of B.stufen) {
                if (!(s.bis < Infinity)) continue;
                for (const t of [s.bis + B.vorlauf, s.bis + B.vorlauf + B.halt]) {
                    const m = t % S;
                    if (f >= m) n++;
                    if (f >= S - m) n++;
                }
            }
            return n;
        };
        return cx + "," + cz + ":" + fach(px - cx * S) + "," + fach(pz - cz * S);
    }

    // DAS GEWICHT DER STUFE am Welt-Punkt (x, z): 0 im Inneren der Stufe `lod`, 1 an ihrer Grenze `bis` — smoothstep über das
    // Übergangs-Band `band` im Chebyshev-Abstand zum Auge der Stufen (`state.stufeAuge`, der Spieler des Streaming-Takts).
    // Der CPU-Spiegel des Boden-Stoffs (`_buildPbrNodeMaterial` geomorph); Leser: der Boden-Leser und die Sprung-Linse.
    _stufeGewicht(lod, x, z) {
        const st = AnazhRealm.BODEN_STUFEN.stufen[Math.min(2, Math.max(0, lod | 0))];
        const a = this.state.stufeAuge;
        if (!a || !(st.bis < Infinity)) return 0;
        const d = Math.max(Math.abs(x - a.x), Math.abs(z - a.z));
        const t = Math.max(0, Math.min(1, (d - (st.bis - st.band)) / st.band));
        return t * t * (3 - 2 * t);
    }

    // DER MORPH-CODE DES BODENS (K51-2): EIN Float je Vertex (`aMorphWeight`) trägt die Stufe des Chunks und das Naht-Gewicht
    // (0…1, `_applyCrossLodGeomorph`) — 2 · Stufe + Naht. Der Stoff liest beide: die Stufe wählt das Übergangs-Band, die Naht
    // zieht die Grenz-Zeile an den gröberen Nachbarn; der Faktor ist Naht + Stufe − Naht · Stufe (`_morphFaktor`).
    _morphCode(lod, naht) {
        return 2 * (lod | 0) + Math.max(0, Math.min(1, naht || 0));
    }
    _morphNaht(code) {
        return code - 2 * Math.floor(code * 0.5);
    }
    _morphFaktor(code, x, z) {
        const s = this._morphNaht(code);
        const w = this._stufeGewicht(Math.floor(code * 0.5), x, z);
        const U = this.state.atmoUniforms;
        const gm = U && U.geomorph ? U.geomorph.value : 1;
        return (s + w - s * w) * gm;
    }

    // DAS AUGE DER STUFEN: der Spieler des Streaming-Takts — die Stufen-Wahl und der Boden-Stoff lesen denselben Punkt
    _stufeAugeTakt(p) {
        const a = this.state.stufeAuge || (this.state.stufeAuge = { x: 0, z: 0 });
        a.x = p.x;
        a.z = p.z;
        const U = this.state.atmoUniforms;
        if (U && U.stufeAuge) U.stufeAuge.value.set(p.x, p.z);
    }

    // DAS ZIEL DER GRÖBEREN STUFE im Sync-Bau (Spiegel von `stufeZielNetz` im voxel-worker): das Netz der Stufe `grobLod` um
    // den Chunk-Ursprung mit einer Zelle Polster vor der Kante, die Ziele über das EINE Gesetz (gelaende-core `stufeZiel`)
    _stufeZielNetz(fein, feinNormal, feinFarbe, cx, cz, grobLod) {
        const g = this._voxelChunkConfig(grobLod);
        const gs = g.step;
        const ox = cx * g.span - 2 * gs;
        const oz = cz * g.span - 2 * gs;
        const oy = (this.state.terrainBaseHeight || 0) - g.floorDrop;
        const gd = g.dim + 4;
        const dichte = this._voxelEditedDensityGrid(`${cx},${cz},${grobLod},ziel`, ox, oy, oz, gd, g.dimY, gd, gs);
        const hoehle = this._voxelHoehlenGraph(dichte, ox, oy, oz, gd, g.dimY, gd, gs);
        const geo = this._voxelChunkGeometry(ox, oy, oz, gd, g.dimY, gd, gs, undefined, 1, dichte, 1, hoehle);
        const G = globalThis.__gelaendeCore;
        const leer = new Float32Array(0);
        if (!geo)
            return G.stufeZiel(fein, leer, new Uint32Array(0), gs, [
                { fein: feinNormal, grob: leer, einheit: true },
                { fein: feinFarbe, grob: leer },
            ]);
        this._attachVoxelFieldColors(geo);
        const A = geo.attributes;
        const ziel = G.stufeZiel(fein, A.position.array, geo.index.array, gs, [
            { fein: feinNormal, grob: A.normal.array, einheit: true },
            { fein: feinFarbe, grob: A.color.array },
        ]);
        geo.dispose();
        return ziel;
    }

    // Inline-Kollision beim Stream (`buildBVH`)? Entscheidet die Chebyshev-Distanz r zum Spieler-Chunk.
    _voxelChunkLazyBVHFor(cx, cz, pcx, pcz) {
        const r = Math.max(Math.abs(cx - pcx), Math.abs(cz - pcz));
        // NUR der Spieler-Chunk (r===0) baut inline — ein Kollisions-Baum kostet ~10 ms/Chunk, 9 inline in
        // einem Frame waren ein ~300-ms-Lauf-Spike.
        return r === 0;
    }

    // explore-Magnitude emergiert aus Neuheit (erste Begegnung > Wiederkehr) + Distanz vom Ursprung +
    // Kühnheit (karge/glut-Aura via auraAt): ein neuer, ferner, karger Vorstoß bewegt viel, vertrautes
    // Pendeln wenig. `state.visitedRegions` ist reaktiv (nicht persistiert), bounded.
    _exploreMagnitude(pcx, pcz) {
        const cfg = AnazhRealm.EXPLORE;
        if (!this.state.visitedRegions) this.state.visitedRegions = new Set();
        const regions = this.state.visitedRegions;
        const key = pcx + "," + pcz;
        const novel = !regions.has(key);
        regions.add(key);
        if (regions.size > cfg.maxRegions) {
            const it = regions.values(); // Set hält Insertion-Order → die ältesten zuerst
            for (let i = 0; i < cfg.pruneRegions; i++) {
                const next = it.next();
                if (next.done) break;
                regions.delete(next.value);
            }
        }
        const pm = this.state.playerMesh && this.state.playerMesh.position;
        const dist = pm ? Math.hypot(pm.x, pm.z) : 0;
        const distTerm = Math.min(1, dist / cfg.distScale) * cfg.distWeight; // das epische Reisen
        let boldTerm = 0;
        if (pm) {
            const aura = this.auraAt(pm.x, pm.z, performance.now() / 1000);
            const bold = Math.max(0, Math.min(1, (1 - (aura.lebendig || 0)) * 0.5 + (aura.glut || 0) * 0.5));
            boldTerm = bold * cfg.boldWeight; // Kühnheit: in das Karge/Glühende wagen
        }
        const noveltyTerm = novel ? cfg.noveltyNew : cfg.noveltyRevisit;
        return Math.max(cfg.min, Math.min(cfg.max, cfg.base + noveltyTerm + distTerm + boldTerm));
    }

    // Der gebaute zusammenhängende Ring: größtes k, dessen Ringe 0..k VOLL stehen (mesh ODER empty;
    // pending/fehlend bricht; ≤ ~81 Map-Gets); null solange der Spieler-Chunk unbekannt ist.
    _builtRingRadius() {
        const st = this.state;
        if (!st || !st.voxelChunks || !st.lastPlayerVoxelChunk) return null;
        const cfg = this._voxelChunkConfig();
        const { cx, cz } = st.lastPlayerVoxelChunk;
        let k = -1;
        outer: for (let ring = 0; ring <= cfg.ringRadius; ring++) {
            for (let dx = -ring; dx <= ring; dx++) {
                for (let dz = -ring; dz <= ring; dz++) {
                    if (Math.max(Math.abs(dx), Math.abs(dz)) !== ring) continue;
                    const e = st.voxelChunks.get(`${cx + dx},${cz + dz}`);
                    if (!e || (!e.mesh && !e.empty)) break outer;
                }
            }
            k = ring;
        }
        return k;
    }

    _setLastPlayerVoxelChunk(pcx, pcz) {
        if (!this.state) return;
        // Erkundung: betritt der Spieler einen anderen Chunk, heben sich awe + hope — rate-limitiert (~6 s)
        // und graduiert über `_exploreMagnitude` (Neuheit + Distanz + Kühnheit).
        const prev = this.state.lastPlayerVoxelChunk;
        if (prev && (prev.cx !== pcx || prev.cz !== pcz)) {
            const now = performance.now() / 1000;
            if (now - (this.state.lastExploreFelt ?? -Infinity) >= 6) {
                this.state.lastExploreFelt = now;
                this._feelAction("explore", { magnitude: this._exploreMagnitude(pcx, pcz) });
            }
        }
        this.state.lastPlayerVoxelChunk = { cx: pcx, cz: pcz };
    }

    // DER FELS-STOFF DER WELT (K17): das EINE Gesetz (gelaende-core `FELS`, `felsFarbe`) mit dem Stein der Boden-Palette als
    // Grundton (`felsBasis`: die dunkle Lage und die helle Bank aus ihm), der Kante des Nah-Netzes (1,8 m: was es nicht trägt,
    // trägt sein Mittel) und dem Mittel für die Ferne (`felsMittel`). Ohne den Kern bricht der Boden laut (Kern-Pflicht).
    static get FELS_STOFF() {
        if (AnazhRealm._felsStoffMemo) return AnazhRealm._felsStoffMemo;
        const GK = globalThis.__gelaendeCore;
        if (
            !GK ||
            typeof GK.felsFarbe !== "function" ||
            typeof GK.felsKruemmung !== "function" ||
            typeof GK.felsFein !== "function" ||
            typeof GK.schuttKorn !== "function" ||
            !GK.FELS
        )
            AnazhRealm._kernPflichtBruch("gelaende:felsFarbe");
        const basis = GK.felsBasis(AnazhRealm.BODEN_FARBE.rock);
        const G = AnazhRealm.TERRAIN_GEOLOGY;
        AnazhRealm._felsStoffMemo = Object.freeze({
            gesetz: GK.FELS,
            basis,
            // die Kante des Nah-Netzes (1,8 m) lebt EINMAL in `netz.fuss` (bis K17-2 NB1 stand ein ungelesener Zwilling daneben)
            // die Geologie des Boden-Netzes für gelaende-core `felsStoff` — der Stamm (Sync-Bau) und der voxel-worker (der
            // Init-Schnappschuss `felsStoff`) lesen DIESELBEN Zahlen
            netz: Object.freeze({
                rockLo: G.rockLo,
                rockHi: G.rockHi,
                schuttKandidat: G.schuttKandidat,
                schuttGitter: G.schuttGitter,
                schutt: G.schutt,
                fuss: 1.8,
            }),
            mittel: Object.freeze(GK.felsMittel(basis)),
            mittelWerte: GK.felsMittelWerte(),
        });
        return AnazhRealm._felsStoffMemo;
    }

    // DER BODEN-UMZUG (K16, Schöpfer-Entscheid §5.4): ein Save einer anderen Boden-Generation (vor K16: keine) schrieb seine
    // Höhen auf einen Boden, den es nicht mehr gibt (Basis → K16 im Umkreis ±500 m: |Δh| p50 37,7 m). Jeder Bau und der
    // Spieler stehen nach dem Laden auf dem Boden des Gesetzes in ihrer Höhe über Grund — `ueberGrund` des Saves, sonst die
    // Fuß-Höhe, auf der jeder Bau und jeder Spieler gesetzt wird (`PLAYER_FOOT_OFFSET`). Liefert die neuen Höhen je Bau-Index
    // (null: derselbe Boden) und nennt die Zahl (`state.bodenUmzug`, Log): wie viele Bauten sich bewegen, um wie viel.
    _bodenUmzug(state) {
        const gen = globalThis.__gelaendeCore.BODEN_GENERATION;
        if (!state || state.bodenGeneration === gen) return null;
        const fuss = AnazhRealm.PLAYER_FOOT_OFFSET;
        const hoehen = new Map();
        const dh = [];
        const liste = Array.isArray(state.architectures) ? state.architectures : [];
        // DIE ALTEN ORTE ZUERST (K10): der Erdbau des alten Bodens fällt (seine Höhen standen auf einem Gelände, das es nicht
        // mehr gibt), die Häuser jedes Orts legen ihre Platten auf den neuen Boden in ihrer Höhe über Grund — erst danach fallen
        // die Höhen aller Bauten, auf dem geerdeten Grund (vorher stand der Baum am Rand eines Orts bis 2,28 m neben seinem Boden).
        const wmU = this.state.worldMeta;
        if (wmU && wmU.erdbau) {
            delete wmU.erdbau;
            this._erdbauStand = (this._erdbauStand || 0) + 1;
        }
        const geerdet = this._erdbauAltOrte(liste, (a) => {
            const p = a.position;
            const g = Number.isFinite(p.x) && Number.isFinite(p.z) ? this._voxelSurfaceY(p.x, p.z) : NaN;
            return g + (Number.isFinite(a.ueberGrund) ? a.ueberGrund : fuss);
        });
        for (let i = 0; i < liste.length; i++) {
            const a = liste[i];
            const p = a && a.position;
            if (!p || !Number.isFinite(p.x) || !Number.isFinite(p.z)) continue;
            const g = this._voxelSurfaceY(p.x, p.z);
            if (!Number.isFinite(g)) continue;
            const y = g + (Number.isFinite(a.ueberGrund) ? a.ueberGrund : fuss);
            hoehen.set(i, y);
            dh.push(Number.isFinite(p.y) ? Math.abs(y - p.y) : 0);
        }
        let spieler = null;
        const pm = this.state.playerMesh;
        if (pm && state.playerPosition) {
            const g = this._voxelSurfaceY(pm.position.x, pm.position.z);
            if (Number.isFinite(g)) {
                const y = g + (Number.isFinite(state.spielerUeberGrund) ? state.spielerUeberGrund : fuss);
                spieler = Math.round((y - pm.position.y) * 100) / 100;
                pm.position.y = y;
            }
        }
        dh.sort((p, q) => p - q);
        const q = (f) =>
            dh.length ? Math.round(dh[Math.min(dh.length - 1, Math.floor(f * dh.length))] * 100) / 100 : 0;
        const bericht = {
            von: Number.isFinite(state.bodenGeneration) ? state.bodenGeneration : 0,
            nach: gen,
            bauten: dh.length,
            bewegt: dh.filter((d) => d > 0.05).length,
            geerdet,
            dhP50: q(0.5),
            dhMax: q(1),
            spieler,
        };
        this.state.bodenUmzug = bericht;
        this.log(
            `BODEN-UMZUG: ${bericht.bewegt} von ${bericht.bauten} Bauten stehen auf dem Boden der Generation ${gen} ` +
                `(|Δh| p50 ${bericht.dhP50} m, max ${bericht.dhMax} m), der Spieler ${spieler} m`,
            "INFO"
        );
        return hoehen;
    }
    // Der Same, dessen Gestalt der Ort wählt (K20): `_foundryVariantFor` liest h = Same × 2654435761 in T Eimern; der Ort
    // legt den Eimer fest (frei: der Solitär T, Bestand: 1..T−1 = die V Bestand-Gestalten nach dem eigenen Wurf), die Lage
    // im Eimer bleibt die des Samens, und das Inverse des Knuth-Faktors gibt den Samen zurück. Synchron am Spawn aus dem
    // Kern (der Bestand pflanzt vor dem Buch). Eine Art ohne Solitär behält ihren Samen; `stehtFrei` fragt den Ort nur dann.
    _foundryGestaltSame(seed, preset, stehtFrei) {
        const T = AnazhRealm._studioGestaltenKern(preset);
        if (!(T >= 2) || AnazhRealm._solitaerVon(preset, T - 1) !== T) return seed >>> 0;
        const h = Math.imul(seed >>> 0 || 0, 2654435761) >>> 0;
        const lage = h / 4294967296;
        const eimer = stehtFrei() ? T - 1 : Math.floor(lage * (T - 1));
        const h2 = Math.ceil((eimer * 4294967296) / T) + Math.floor(lage * (Math.floor(4294967296 / T) - 1));
        return Math.imul(h2 >>> 0, AnazhRealm.KNUTH_INVERS) >>> 0;
    }

    // ### 6.G3.c — Fauna-Lifecycle ###

    // Raycast-Helper: der Aufrufer übergibt einen Extractor (Normale, hitPoint oder nur hasHit) —
    // der Lifecycle bleibt in dieser EINEN Funktion. `o` reicht die Optionen des Feld-Strahls durch (`_fieldRaycast`).
    _runRaycast(rayStart, rayEnd, extractor, o) {
        // Feld-nativer Raycast (DDA durch das Dichtefeld + Struktur-Box-Ray, kein Ammo). Ein synthetisches
        // `cb` mit derselben Schnittstelle (get_m_hitPointWorld/get_m_hitNormalWorld/hasHit) hält alle
        // Aufrufer unverändert. rayStart/rayEnd in skalierten Einheiten → × sf rein, ÷ sf im cb raus.
        const sf = this.state.scaleFactor || 1;
        const rc = this._fieldRaycast(
            rayStart.x() * sf,
            rayStart.y() * sf,
            rayStart.z() * sf,
            rayEnd.x() * sf,
            rayEnd.y() * sf,
            rayEnd.z() * sf,
            o
        );
        const cb = {
            get_m_hitPointWorld: () => ({ x: () => rc.x / sf, y: () => rc.y / sf, z: () => rc.z / sf }),
            get_m_hitNormalWorld: () => ({ x: () => rc.nx, y: () => rc.ny, z: () => rc.nz }),
            hasHit: () => rc.hit,
        };
        return extractor(cb, rc.hit);
    }

    // Voxel ist permanent: getTerrainHeightAt/findSurfaceAbove lesen nur den Voxel-Pfad; Default
    // `terrainBaseHeight || 0`, falls `_voxelSurfaceY` nicht-finit ist (vor Welt-Aufbau, Edge-Case).
    getTerrainHeightAt(x, z) {
        const vy = this._voxelSurfaceY(x, z);
        if (typeof vy === "number" && Number.isFinite(vy)) return vy;
        return this.state.terrainBaseHeight || 0;
    }
}
_stammZonen(AnazhRealm, [AnazhRealm_gelaende_boden]);

// ===== ATLAS · Gelaende/boden — Außen-Konstanten =====
// Die leere Edit-Liste eines Chunks ohne Edits (`_voxelEditsNah`, `_voxelEditsImKasten`): eingefroren, nie beschrieben.
AnazhRealm.KEINE_EDITS = Object.freeze([]);
// DIE ORT-WAHL eines Plans (K10, `_ortWahl`): Ringe um den Wunsch-Anker (`ringe` × `schrittM` = 128 m, die halbe
// Siedlungs-Zelle fachwerk `SIEDLUNG.cellM`; auf jedem Ring Orte im Abstand ≤ `schrittM`), der nächste Ort, an dem der Plan
// jedes Haus trägt (`_ortTraegt`), gewinnt. `grobM`: das Raster des ersten Urteils (die Wand urteilt im halben Meter).
// `bodenTolM`: so weit darf die Gestalt des Gewässers (`_gewaesserForm`) den Boden des Plans unter einem Haus verschieben.
// `taktMs`: so lange rechnet die Wahl je Takt-Scheibe (`_ortWahlScheibe`, Lehre 14), mindestens einen Schritt.
AnazhRealm.ORT_WAHL = Object.freeze({ schrittM: 16, ringe: 8, grobM: 2, bodenTolM: 0.05, taktMs: 3 });

// DIE BODEN-STUFEN (K51, K51-2 CDLOD) — die Stufen-Kette des Chunk-Netzes (`_voxelChunkConfig(lod)`: Schritt 1,8 · 3,6 · 7,2 ·
// 14,4 m) nach dem KASTEN-Abstand des Spielers zum Chunk-Quadrat (Chebyshev, `_voxelChunkLodFor`): `bis` die Grenze der Stufe,
// `band` ihr Übergangs-Band davor — darin wandert jeder Vertex stetig auf das Netz der nächst gröberen Stufe (`stufeZiel`,
// `_stufeGewicht`), an `bis` liegt er ganz auf ihr. Verfeinert wird unter `bis + vorlauf` (der Bau hat den Vorlauf Zeit, das
// feine Netz erscheint ganz gemorpht), vergröbert erst ab `bis + vorlauf + halt` (Hysterese). Die CDLOD-Bedingung: ein Chunk
// der Stufe L reicht bis `bis(L) + vorlauf + halt + Spanne + Saum-Zelle` — dort darf das Band von L+1 noch nicht beginnen
// (36 + 7 + 43,2 + 1,8 = 88 ≤ 100 − 12; 100 + 7 + 43,2 + 3,6 = 153,8 ≤ 388,8 − 40). Die Ring-Kette (K51: L0 bis Ring 1, L1
// Ring 2) konnte sie nie halten — ein Ring trägt zwei Spannen Abstand, der Wechsel sprang sichtbar bei 43–65 m (Gang über die
// Kante an der Mess-Wiese, Radeon: p99,9 der Luma-Änderung 17 gegen 5 im Rauschen). Stufe 0 trägt das Auge bis 24 m ganz
// (Nah-Wiese 14 m, Nah-Streu 24 m, `_bodenSichtAt`), Stufe 3 erst jenseits 388,8 m (Ring 10).
AnazhRealm.BODEN_STUFEN = Object.freeze({
    vorlauf: 3,
    halt: 4,
    stufen: Object.freeze([
        Object.freeze({ lod: 0, bis: 36, band: 12 }),
        Object.freeze({ lod: 1, bis: 100, band: 12 }),
        Object.freeze({ lod: 2, bis: 388.8, band: 40 }),
        Object.freeze({ lod: 3, bis: Infinity, band: 0 }),
    ]),
});

// LICHEN: grüne Patina auf alten/feuchten Steinen — reine Render-Schicht im
// `_bodenFarbeAt`-Mix-Stack (kein Tag). Der Worker hardkodiert diese Schwellen
// spiegelbildlich (bit-Vertrag: jede Änderung in BEIDE); die Farbe ist die Flechte der Boden-Palette.
AnazhRealm.LICHEN = Object.freeze({
    // Feuchte muss ≥ feuchteLo sein für Lichen-Wachstum (trockene Steine bleiben blank).
    feuchteLo: 0.5,
    feuchteHi: 0.9,
    // Dichte (Stein-Achse) muss ≥ dichteLo sein (kein Lichen auf Erde/Glut/Quarz).
    dichteLo: 0.5,
    dichteHi: 0.85,
    // Maximaler Mix-Anteil (sehr subtil — Lichen ist eine Tönung, kein
    // Decken-Anstrich).
    strength: 0.22,
});
// Compound-Bonus-Faktoren (SPATIAL_*_BONUS, weiter unten): multiplikativ auf die aggregierten
// Compound-Tags nach Standard-MAX, konservativ — der große Effekt entsteht aus der Kombination.
// MACRO_ANKER wohnt im Gelände-Gesetzbuch (gelaende-core.js, K09a).
// FEUCHTE (unten) — die fünfte Welt-Stimme (aus der Hydrosphäre abgeleitet, nicht Noise).
AnazhRealm.FEUCHTE = Object.freeze({
    flussReichweite: 26, // m jenseits der Fluss-Halbbreite, smoothstep-Fade
    hoeheNah: 1.5, // ≤ so hoch überm Wasserspiegel = voll feucht (Niederung)
    hoeheFern: 7, // ab so hoch überm Spiegel = trocken (der Höhen-Fade)
    hoeheGewicht: 0.85, // V6 (Look-Finale, 3): 0.6→0.85 — das FEUCHTE-DACH gehoben (breitere, sattere Niederungen → dichtere Wald-/Wiesen-Nähe); bit-identisch im Worker FEUCHTE_HOEHE_GEWICHT
    affinitaetGewicht: 0.8, // feuchte × lebendig in der Spawn-Affinität
    erdeGewicht: 0.35, // Γ1-Lesart Boden: feuchte hebt die erde-Achse beim Graben
    // Feuchte sichtbar: Vertex-Color-Mix einer dunkleren, satteren Erd-Schicht über der lebendig-Erde —
    // ein Ufer liest sich als Ufer, auch ohne Wasser im Frame. sichtbarLo/sichtbarHi = schmale, deutliche
    // Kurve (Niederungen kippen, trockener Boden bleibt earth). Bit-identisch im Worker
    // `attachFieldColors` (dort hardkodiert — jede Änderung in BEIDE).
    sichtbarLo: 0.3,
    sichtbarHi: 0.85,
});
// Der Keil der Hüllen-Form im Welt-March: die First-Kante → der Typ der Kapsel-Liste (pB.w; 0 Kasten · 1 Ellipsoid). Der
// Walm (0..1) reist im Bruchteil (Typ + 0,49 · walm), das WGSL (`sdKeil`) schneidet die zwei Stirnen mit der Dach-Neigung.
AnazhRealm.HUELLE_KEIL_TYP = Object.freeze({ "+z": 2, "-z": 3, "+x": 4, "-x": 5 });

// === Der emotionale Kern — das ABENTEUER GRADUIERT ===
// Die explore-Magnitude emergiert aus NEUHEIT (erste Begegnung mit einer Region,
// `state.visitedRegions`), DISTANZ vom Ursprung und KÜHNHEIT (in eine karge/glut-Aura wagen, via
// auraAt). Die Appraisal wertet das Ziel, dies den Akt des Wagens.
AnazhRealm.EXPLORE = Object.freeze({
    base: 0.3, // der Grund-Beitrag jedes Chunk-Wechsels
    noveltyNew: 0.7, // erste Begegnung mit einer Region → starkes Staunen
    noveltyRevisit: 0.05, // Wiederkehr → kaum (du kennst den Ort)
    distScale: 600, // m — die Distanz vom Ursprung, ab der das Reisen episch wird
    distWeight: 0.4, // der Distanz-Beitrag (geklemmt auf 1× distWeight)
    boldWeight: 0.5, // die Kühnheit (karge/glut-Aura) als Mut-Beitrag
    min: 0.3,
    max: 1.8, // ein neuer, ferner, karger Wagnis bewegt ~6× ein vertrautes Pendeln
    maxRegions: 4000, // die visitedRegions-Map bounded halten
    pruneRegions: 1000, // beim Überlauf die ältesten Regionen vergessen
});
