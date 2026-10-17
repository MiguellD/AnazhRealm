class AnazhRealm_wasser_hydro {
    // ===== ATLAS · Wasser/hydro — Hydrosphäre · Flüsse · Seen · Wasserfälle · Pegel · die Wasser-Wahrheit =====
    // DIE KLETTERWAND (Prüfung 2 K02a, gate:fall-waechter „Wolf läuft in die Wand"): steht ein Leib mit der Wurzel bei (x, z)
    // auf dem Grund g und blickt längs (dx, dz), liegen Stirn und Heck eine halbe Länge `hl` vor und hinter ihr — ihr Boden
    // das Gesetz am Punkt ab g (`_koerperBodenUnter`, wie die Sicht unter Fels die vier Proben der Lage liest). Steht die
    // Stirn höher über dem Heck, als der Leib nicken kann (2 · hl · tan GANG_DECKEL_RAD — darüber hebt ihn der Deckel), ist
    // dort kein Gang, nur Wand. Sie gilt UNTER FELS (`_kreaturUnterFels`); unter freiem Himmel bleibt eine Klippe, wie sie
    // war (`_koerperSchritt`). Vorher stieg der laufende Wolf die gekrümmte Höhlenwand hinauf, bis seine Stirn 1,40 m über
    // dem Heck lag, und der Nick-Deckel hob ihn 1,00 m über seinen Grund.
    _kreaturKletterwand(x, z, g, dx, dz, hl) {
        const vorn = this._koerperBodenUnter(x + dx * hl, g, z + dz * hl);
        const heck = this._koerperBodenUnter(x - dx * hl, g, z - dz * hl);
        return vorn - heck > 2 * hl * Math.tan(AnazhRealm.GANG_DECKEL_RAD);
    }

    // UNTER FELS steht ein Leib auf dem Grund g bei (x, z), wenn über ihm Fels hängt — in 2,5 bis 13 m Höhe (fünf
    // Dichte-Proben: die Höhle trägt ≥ 2,4 m Luft, `STAND_SICHT_BAND`; ein Überhang ebenso). Ein Spalt im Gesetz, den das
    // 1,8-m-Netz nicht zeichnet, ist offen zum Himmel: dort nicht (gate:kreatur-takt, der Wolf jagte den Sprinter durch
    // einen 2,7 m tiefen Spalt und blieb sonst darin). Leser: die Kletterwand des Tier-Schritts (`_creatureGroundY`).
    _kreaturUnterFels(x, g, z) {
        if (!Number.isFinite(g)) return false;
        for (const h of [2.5, 4, 6, 9, 13]) if (this._fieldSolid(x, g + h, z)) return true;
        return false;
    }

    // DER GANG BIS ZUR WAND: welcher Teil t ∈ [0, 1] eines Schritts von (x0, z0, g0) nach (x1, z1, g1) trägt die Stirn
    // (längs dx, dz) noch unter dem Deckel, und sein Grund g — {t: 1, g: g1}, wenn sein Ende es tut, sonst vier Halbierungen
    // über den Schritt, jede mit ihrem Schritt-Boden (`_koerperSchritt`; ein Dach ist Wand). Der Leib hält dort, wo die Stirn
    // die Wand erreicht, nie einen ganzen Cache-Schritt (0,5 m) davor oder dahinter. Kosten nur an der Wand.
    _kreaturGangBis(x0, z0, g0, x1, z1, g1, dx, dz, hl) {
        if (!this._kreaturKletterwand(x1, z1, g1, dx, dz, hl)) return { t: 1, g: g1 };
        let lo = 0;
        let gLo = g0;
        let hi = 1;
        for (let k = 0; k < 4; k++) {
            const t = (lo + hi) / 2;
            const x = x0 + (x1 - x0) * t;
            const z = z0 + (z1 - z0) * t;
            const g = this._koerperSchritt(x0, z0, g0, x, z);
            if (g === null || this._kreaturKletterwand(x, z, g, dx, dz, hl)) hi = t;
            else {
                lo = t;
                gLo = g;
            }
        }
        return { t: lo, g: gLo };
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
            // V9.49-a/e — das vereinte Wasser-Feld.
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
                ? this._koerperSchritt(
                      ud.cachedGroundX,
                      ud.cachedGroundZ,
                      ud.cachedGroundY,
                      cx,
                      cz,
                      this._kreaturLeib(creature, 0, this._kreaturSchrittLeib || (this._kreaturSchrittLeib = {})).hoehe
                  )
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

    // Nächstes Fluss-Segment an (x,z), wenn der Punkt im Kanal liegt (dist ≤ halbe Breite + Tiefe / bankNeigung, die
    // Krone der Bank — jenseits der Krone trägt der Fluss kein Wasser). Liefert Flow-Richtung (normiert), Bett-Tiefe
    // `depth` und centerness des nächsten Segments, dazu die Wasser-Oberfläche `surfaceY`: der Spiegel der Segmente
    // (`_hydroRiverSpiegel`, linear zwischen ihren Enden — stromab nie steigend, quer waagrecht), gemittelt mit einem
    // Gewicht, das zur Krone stetig auf 0 fällt — ein breiter Fluss überdeckt in der Biegung mehrere Segmente, das
    // nächste allein gäbe dort eine Stufe. O(1) über `riverBuckets`. Worker bit-identisch (speist die Zellen).
    _hydroRiverAt(x, z) {
        const h = this._hydroFor(x, z); // A3 (V18.132): Heimat ODER Kachel
        if (!h || !h.ready || !h.riverBuckets) return null;
        const bs = h.bucketSize;
        const bd = h.bucketsDim;
        const bi = Math.floor((x - h.originX) / bs);
        const bj = Math.floor((z - h.originZ) / bs);
        if (bi < 0 || bj < 0 || bi >= bd || bj >= bd) return null;
        const list = h.riverBuckets[bj * bd + bi];
        if (!list) return null;
        const HC = AnazhRealm.HYDROSPHERE;
        let bestD = Infinity;
        let dirX = 0;
        let dirZ = 0;
        let depth = 0;
        let bestHalfW = 1;
        let gSumme = 0;
        let sSumme = 0;
        let ufer = 0;
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
            const krone = halfW + D / HC.bankNeigung;
            if (dist > krone) continue;
            const g = (1 - dist / krone) * (1 - dist / krone) + 1e-6;
            gSumme += g;
            sSumme += g * (seg.sA + (seg.sB - seg.sA) * t);
            // Die Kronen-Blende: 1 bis zur Kanal-Kante, smoothstep auf 0 an der Krone (das Maximum der Segmente).
            const u = dist <= halfW ? 0 : (dist - halfW) / (krone - halfW);
            const uS = 1 - u * u * (3 - 2 * u);
            if (uS > ufer) ufer = uS;
            if (dist < bestD) {
                bestD = dist;
                const len = Math.sqrt(len2);
                dirX = ex / len;
                dirZ = ez / len;
                depth = D;
                bestHalfW = halfW;
            }
        }
        if (bestD === Infinity) return null;
        return {
            flowX: dirX,
            flowZ: dirZ,
            depth,
            surfaceY: sSumme / gSumme,
            // Zentrums-Nähe [0..1] (1 Mittellinie, 0 Kanal-Kante): die Strömung trägt nur im Kanal.
            centerness: Math.max(0, 1 - bestD / Math.max(bestHalfW, 1)),
            // Die Kronen-Blende [0..1]: die Ufer-Bänder (Strand, Schlick, Pfad, Höhen-Feuchte) über diesem Spiegel
            // laufen mit ihr zur Krone aus — dort endet der Spiegel, der Bezug springt auf den Meeresspiegel.
            ufer,
        };
    }

    // DER SPIEGEL QUER (Gegenprüfung 07.10., Runde 3): der Spiegel des nächsten Fluss-Segments an (x, z), auch jenseits der
    // Krone — der Fluss-Spiegel liegt quer waagrecht (`_hydroRiverSpiegel`). Nur das Wasser-Sheet liest ihn, für Rand-Vertices
    // jenseits der Krone (dort taucht das Sheet unter den Boden; das Mittel oder ein Extrem der Nachbar-Dächer setzte das Ende
    // eines steilen Laufs zu tief oder zu hoch). −Infinity ohne Segment im Bucket. Worker bit-identisch (`hydroSpiegelQuer`).
    _hydroSpiegelQuer(x, z) {
        const h = this._hydroFor(x, z);
        if (!h || !h.ready || !h.riverBuckets) return -Infinity;
        const bs = h.bucketSize;
        const bd = h.bucketsDim;
        const bi = Math.floor((x - h.originX) / bs);
        const bj = Math.floor((z - h.originZ) / bs);
        if (bi < 0 || bj < 0 || bi >= bd || bj >= bd) return -Infinity;
        const list = h.riverBuckets[bj * bd + bi];
        if (!list) return -Infinity;
        let bestD = Infinity;
        let spiegel = -Infinity;
        for (let s = 0; s < list.length; s++) {
            const seg = list[s];
            const ex = seg.bx - seg.ax;
            const ez = seg.bz - seg.az;
            const len2 = ex * ex + ez * ez || 1;
            let t = ((x - seg.ax) * ex + (z - seg.az) * ez) / len2;
            if (t < 0) t = 0;
            else if (t > 1) t = 1;
            const dist = Math.hypot(x - (seg.ax + ex * t), z - (seg.az + ez * t));
            if (dist < bestD) {
                bestD = dist;
                spiegel = seg.sA + (seg.sB - seg.sA) * t;
            }
        }
        return spiegel;
    }

    // Phase 1 — Surface-Sampling: Region-Raster mit `_terrainMacroSurfaceY` OHNE Detail-Oktave
    // (`includeDetail=false`): die aliast bei 16-m-Abtastung (±4 m, λ~22 m) und übertrifft das Makro-
    // Gefälle je Zelle — die Drainage folgte dem Rauschen. Keine 3D-Roughness/Höhlen; 3 Noise-Calls je
    // Zelle. `state.hydrosphere` ist während des Baus null (kein Carve-Zirkel).
    _hydroInit(origin = null) {
        const H = AnazhRealm.HYDROSPHERE;
        const base = this.state.terrainBaseHeight || 0;
        let waterLevel = this.state.waterLevel;
        if (typeof waterLevel !== "number" || !Number.isFinite(waterLevel)) {
            waterLevel = base - globalThis.__gelaendeCore.GRUND.meerUnterBasis;
        }
        const size = H.regionSize;
        const cell = H.cell;
        const dim = Math.max(8, Math.round(size / cell));
        // A3 (V18.132) — parametrisierter Ursprung: ohne `origin` die Heimat-
        // Region (bit-identisch zu immer); mit `origin` eine ferne KACHEL
        // (seed-deterministisch — f(seed, Kachel-Koordinate), nie Spieler-Pfad).
        const originX = origin && Number.isFinite(origin.x) ? origin.x : -size / 2;
        const originZ = origin && Number.isFinite(origin.z) ? origin.z : -size / 2;
        const n = dim * dim;
        const raw = new Float64Array(n);
        for (let j = 0; j < dim; j++) {
            for (let i = 0; i < dim; i++) {
                const s = this._terrainMacroSurfaceY(originX + (i + 0.5) * cell, originZ + (j + 0.5) * cell, false);
                raw[j * dim + i] = Number.isFinite(s) ? s : base - 52;
            }
        }
        const surf = this._hydroBlur(raw, dim);
        return {
            base,
            waterLevel,
            size,
            cell,
            dim,
            originX,
            originZ,
            surf,
            isOcean: null,
            filled: null,
            lakeOf: null,
        };
    }

    // 3×3-Box-Blur übers Höhen-Raster (Rand-clamp; Ränder sind ohnehin Priority-Flood-Auslässe) —
    // Schutz gegen Aliasing-Reste der ridged-Oktave.
    _hydroBlur(src, dim) {
        const out = new Float64Array(dim * dim);
        for (let j = 0; j < dim; j++) {
            for (let i = 0; i < dim; i++) {
                let sum = 0;
                let cnt = 0;
                for (let dj = -1; dj <= 1; dj++) {
                    for (let di = -1; di <= 1; di++) {
                        const ni = i + di;
                        const nj = j + dj;
                        if (ni < 0 || nj < 0 || ni >= dim || nj >= dim) continue;
                        sum += src[ni + nj * dim];
                        cnt++;
                    }
                }
                out[i + j * dim] = sum / cnt;
            }
        }
        return out;
    }

    // Phase 1.5 — Ozean-Maske: Ozean = die mit dem Region-RAND verbundene Komponente der Zellen unter
    // Meeresspiegel; eine Binnen-Mulde darunter ist ein abflussloses Becken (See). Sonst wäre jede
    // Senke ein Auslass und der Abfluss versickerte, statt sich zu Flüssen zu sammeln.
    _hydroMarkOcean(ctx) {
        const { dim, surf, waterLevel } = ctx;
        const n = dim * dim;
        const isOcean = new Uint8Array(n);
        const stack = [];
        for (let j = 0; j < dim; j++) {
            for (let i = 0; i < dim; i++) {
                const border = i === 0 || j === 0 || i === dim - 1 || j === dim - 1;
                if (!border) continue;
                const idx = i + j * dim;
                if (surf[idx] <= waterLevel && !isOcean[idx]) {
                    isOcean[idx] = 1;
                    stack.push(idx);
                }
            }
        }
        const NB = [
            [-1, -1],
            [0, -1],
            [1, -1],
            [-1, 0],
            [1, 0],
            [-1, 1],
            [0, 1],
            [1, 1],
        ];
        while (stack.length) {
            const c = stack.pop();
            const ci = c % dim;
            const cj = (c / dim) | 0;
            for (let k = 0; k < 8; k++) {
                const ni = ci + NB[k][0];
                const nj = cj + NB[k][1];
                if (ni < 0 || nj < 0 || ni >= dim || nj >= dim) continue;
                const nidx = ni + nj * dim;
                if (!isOcean[nidx] && surf[nidx] <= waterLevel) {
                    isOcean[nidx] = 1;
                    stack.push(nidx);
                }
            }
        }
        ctx.isOcean = isOcean;
    }

    // Phase 2 — Depression-Filling (Priority-Flood + ε, Barnes et al. 2014): Min-Heap mit Rand- +
    // Ozean-Zellen seeden, tiefste poppen, Nachbarn auf max(Höhe, Pop-Füllhöhe + ε) füllen. ε gibt jeder
    // Zelle Gefälle (D8 auch auf See-Flächen) und einen echt-tieferen Nachbarn. filled > surf = Seen.
    _hydroPriorityFlood(ctx) {
        const { dim, surf, isOcean, waterLevel } = ctx;
        const EPS = AnazhRealm.HYDROSPHERE.fillEpsilon;
        const n = dim * dim;
        const filled = new Float64Array(n);
        const visited = new Uint8Array(n);
        // Binärer Min-Heap in parallelen Arrays (Priorität + Zell-Index). Gleichstand nach Index →
        // deterministischer Pop (sonst hinge filled an der Heap-Reihenfolge).
        const hp = [];
        const hv = [];
        const less = (a, b) => hp[a] < hp[b] || (hp[a] === hp[b] && hv[a] < hv[b]);
        const swap = (a, b) => {
            const tp = hp[a];
            hp[a] = hp[b];
            hp[b] = tp;
            const tv = hv[a];
            hv[a] = hv[b];
            hv[b] = tv;
        };
        const push = (p, v) => {
            hp.push(p);
            hv.push(v);
            let c = hp.length - 1;
            while (c > 0) {
                const par = (c - 1) >> 1;
                if (!less(c, par)) break;
                swap(c, par);
                c = par;
            }
        };
        const pop = () => {
            const top = hv[0];
            const lastP = hp.pop();
            const lastV = hv.pop();
            if (hp.length) {
                hp[0] = lastP;
                hv[0] = lastV;
                let c = 0;
                for (;;) {
                    const l = c * 2 + 1;
                    const r = l + 1;
                    let s = c;
                    if (l < hp.length && less(l, s)) s = l;
                    if (r < hp.length && less(r, s)) s = r;
                    if (s === c) break;
                    swap(s, c);
                    c = s;
                }
            }
            return top;
        };
        for (let j = 0; j < dim; j++) {
            for (let i = 0; i < dim; i++) {
                const idx = i + j * dim;
                const border = i === 0 || j === 0 || i === dim - 1 || j === dim - 1;
                const sea = isOcean[idx] === 1;
                if (border || sea) {
                    // Ozean-Zellen werden auf den flachen Meeresspiegel
                    // geseedet; eine Rand-Land-Zelle auf ihre echte Höhe.
                    filled[idx] = sea ? waterLevel : surf[idx];
                    visited[idx] = 1;
                    push(filled[idx], idx);
                }
            }
        }
        const NB = [
            [-1, -1],
            [0, -1],
            [1, -1],
            [-1, 0],
            [1, 0],
            [-1, 1],
            [0, 1],
            [1, 1],
        ];
        while (hp.length) {
            const c = pop();
            const ci = c % dim;
            const cj = (c / dim) | 0;
            for (let k = 0; k < 8; k++) {
                const ni = ci + NB[k][0];
                const nj = cj + NB[k][1];
                if (ni < 0 || nj < 0 || ni >= dim || nj >= dim) continue;
                const nidx = ni + nj * dim;
                if (visited[nidx]) continue;
                filled[nidx] = Math.max(surf[nidx], filled[c] + EPS);
                visited[nidx] = 1;
                push(filled[nidx], nidx);
            }
        }
        ctx.filled = filled;
    }

    // Phase 5a — Seen: Komponenten der aufgefüllten Zellen (filled > surf, über Meereshöhe). Je See:
    // Füll-Level (≈ Überlauf-Höhe), Boden, Rand-Höhe, Bounding-Box, Zell-Indizes (für die See-Plane).
    _hydroExtractLakes(ctx) {
        const { dim, surf, filled, isOcean } = ctx;
        const n = dim * dim;
        const TOL = 0.02;
        const lakeOf = new Int32Array(n).fill(-1);
        const lakes = [];
        // ein See ist eine aufgefüllte Zelle (filled > surf), die NICHT
        // Ozean ist — ein abflussloses Becken, das das Priority-Flood füllte
        // (auch eines unter Meereshöhe — wie das Tote Meer).
        const isLakeCell = (idx) => !isOcean[idx] && filled[idx] > surf[idx] + TOL;
        const NB = [
            [-1, -1],
            [0, -1],
            [1, -1],
            [-1, 0],
            [1, 0],
            [-1, 1],
            [0, 1],
            [1, 1],
        ];
        for (let start = 0; start < n; start++) {
            if (lakeOf[start] >= 0 || !isLakeCell(start)) continue;
            const id = lakes.length;
            const cells = [];
            const stack = [start];
            lakeOf[start] = id;
            let floorY = Infinity;
            let level = Infinity;
            let minX = Infinity;
            let minZ = Infinity;
            let maxX = -Infinity;
            let maxZ = -Infinity;
            while (stack.length) {
                const c = stack.pop();
                cells.push(c);
                if (surf[c] < floorY) floorY = surf[c];
                if (filled[c] < level) level = filled[c];
                const ci = c % dim;
                const cj = (c / dim) | 0;
                const wx = ctx.originX + (ci + 0.5) * ctx.cell;
                const wz = ctx.originZ + (cj + 0.5) * ctx.cell;
                if (wx < minX) minX = wx;
                if (wx > maxX) maxX = wx;
                if (wz < minZ) minZ = wz;
                if (wz > maxZ) maxZ = wz;
                for (let k = 0; k < 8; k++) {
                    const ni = ci + NB[k][0];
                    const nj = cj + NB[k][1];
                    if (ni < 0 || nj < 0 || ni >= dim || nj >= dim) continue;
                    const nidx = ni + nj * dim;
                    if (lakeOf[nidx] < 0 && isLakeCell(nidx)) {
                        lakeOf[nidx] = id;
                        stack.push(nidx);
                    }
                }
            }
            // Mikro-Senken (< minLakeCells) sind keine Seen: gefüllt bleibt die Drainage korrekt, aber sie
            // werden nicht gelistet + lakeOf zurückgesetzt (Fluss darf hindurch) — sonst hunderte Geister-Seen.
            if (cells.length < AnazhRealm.HYDROSPHERE.minLakeCells) {
                for (let ci2 = 0; ci2 < cells.length; ci2++) lakeOf[cells[ci2]] = -1;
                continue;
            }
            // Rand-Höhe: kleinste Füllhöhe der Nicht-See-Nachbarn ringsum.
            // Der See füllt bis zu seinem Überlauf — level ≈ rimY.
            let rimY = Infinity;
            for (let ci2 = 0; ci2 < cells.length; ci2++) {
                const c = cells[ci2];
                const ci = c % dim;
                const cj = (c / dim) | 0;
                for (let k = 0; k < 8; k++) {
                    const ni = ci + NB[k][0];
                    const nj = cj + NB[k][1];
                    if (ni < 0 || nj < 0 || ni >= dim || nj >= dim) continue;
                    const nidx = ni + nj * dim;
                    // nur der Nicht-See-, Nicht-Ozean-Rand zählt — der
                    // Überlauf läuft über Land zum Abfluss, nicht in den Ozean.
                    if (lakeOf[nidx] !== id && !isOcean[nidx] && filled[nidx] < rimY) {
                        rimY = filled[nidx];
                    }
                }
            }
            lakes.push({
                id,
                level,
                floorY,
                rimY: Number.isFinite(rimY) ? rimY : level,
                cells,
                bbox: { minX, minZ, maxX, maxZ },
            });
        }
        ctx.lakeOf = lakeOf;
        return lakes;
    }

    // Phase 5b — DIE FLÜSSE SIND DAS NETZ DES GESETZES (K16): die Läufe der Ebenen 0 und 1 aus gelaende-core
    // (`flussLaeufe`) — dasselbe Netz, das die Täler schneidet; die Hydrosphäre rechnet kein zweites (bis K16 eine D8-
    // Akkumulation auf der geglätteten Makro-Fläche: ihr Kanal fräste den gebauten Boden quer durch Hänge und Ebenen, 3,94
    // Senken > 1 m je km² und 1 Dorfplatz gegen 0,26 und 6 ohne ihn). Je Glied die Punkte seiner BAHN (der Mäander des
    // Gesetzes, `bahn`: Abstand ≤ Zelle auf dem Bogen; ein geteilter Unterlauf trägt dieselben Punkte); `y` die Sohle des
    // Gesetzes am Ort der Sehne (stromab streng fallend), die Richtung die der Bahn, die Breite aus dem Einzugsgebiet (Kern
    // `flussBreite`), an der Quelle das Rinnsal (W-F5: quellBett + quellWeitung je Meter Bogen). Ein Lauf endet am Meer, am
    // See (`mouth` "see", `seeY` sein Spiegel), als Zufluss auf der Bahn seines Hauptlaufs ("zufluss") oder am Rand der Kachel.
    _hydroNetzFluesse(ctx) {
        const { dim, cell, originX, originZ, size, filled, lakeOf, isOcean } = ctx;
        const HC = AnazhRealm.HYDROSPHERE;
        const G = globalThis.__gelaendeCore;
        const laeufe = G.flussLaeufe(this._gelaende(), originX, originZ, originX + size, originZ + size, cell);
        const zelle = (x, z) => {
            const i = Math.floor((x - originX) / cell);
            const j = Math.floor((z - originZ) / cell);
            return i >= 0 && j >= 0 && i < dim && j < dim ? i + j * dim : -1;
        };
        const rivers = [];
        for (const lf of laeufe) {
            let lauf = lf.quelle ? 0 : Infinity;
            let points = [];
            let mouth = null;
            let seeY = NaN;
            const abschluss = (m) => {
                if (points.length >= 2) {
                    const rv = { points, mouth: m };
                    if (m === "see" && Number.isFinite(seeY)) rv.seeY = seeY;
                    if (lf.term) rv.term = lf.term; // der Lauf eines Terms (die Klamm `rinne`): Gesetz des Erbguts, kein Wurf des Feldes
                    rivers.push(rv);
                }
                points = [];
            };
            for (let g = 0; g < lf.glieder.length && !mouth; g++) {
                const gl = lf.glieder[g];
                const B = gl.bahn;
                const voll = G.flussBreite(gl.A);
                const bis = g === lf.glieder.length - 1 ? B.length : B.length - 1;
                for (let m = 0; m < bis; m++) {
                    const { t, x, z } = B[m];
                    const idx = zelle(x, z);
                    if (idx < 0) {
                        abschluss("border");
                        continue;
                    }
                    if (isOcean[idx]) {
                        mouth = "sea";
                        break;
                    }
                    if (lakeOf[idx] >= 0) {
                        mouth = "see";
                        seeY = filled[idx];
                        break;
                    }
                    const s = lauf + B[m].s;
                    const quelle = Math.min(1, (HC.quellBett + HC.quellWeitung * s) / voll);
                    points.push({
                        x,
                        z,
                        y: gl.ba + (gl.bb - gl.ba) * t,
                        width: voll * quelle,
                        quelle,
                        flowX: B[m].fx,
                        flowZ: B[m].fz,
                        inLake: false,
                    });
                }
                lauf += B[B.length - 1].s;
            }
            const ende = { meer: "sea", see: "see", muendung: "zufluss" };
            abschluss(mouth || ende[lf.ende] || "border");
        }
        return rivers;
    }

    // Phase 5c-Vorbereitung: jeder Fluss-Punkt bekommt `voxelY` = `_voxelSurfaceY` an seiner Position.
    // Geroutet wird auf der glatten Makro-Surface, gerendert + nach Wasserfällen gesucht auf der
    // echten; `state.hydrosphere` ist noch null → un-gecarvte Surface (kein Zirkel).
    _hydroSampleRiverSurfaces(rivers) {
        for (let ri = 0; ri < rivers.length; ri++) {
            const pts = rivers[ri].points;
            for (let k = 0; k < pts.length; k++) {
                const p = pts[k];
                if (p.inLake) {
                    // V9.46 — im See ist die Wasser-Oberfläche der Füllstand
                    // (`p.y`), NICHT die gecarvte Bett-Surface — sonst meldete
                    // der Wasserfall-Scan einen Sturz am flachen See-Boden.
                    p.voxelY = p.y;
                    continue;
                }
                const v = this._voxelSurfaceY(p.x, p.z);
                p.voxelY = Number.isFinite(v) ? v : p.y;
            }
        }
    }

    // DER FLUSS-SPIEGEL (Welle L, Q7-Gestalt, W-F1/F2/F3): je Fluss-Punkt der Spiegel `S` — stromab nie steigend,
    // quer waagrecht; das Bett folgt ihm (`_hydrosphereCarveAt`). Ziel je Punkt: das tiefste Ufer seines Querschnitts
    // (die ungecarvte Voxel-Fläche in der Mitte und an beiden Kanal-Kanten, halbe Breite + Bank-Rampe) minus dem
    // Freibord-Anteil der Bett-Tiefe; die Folge ist die monotone Ausgleichs-Kurve (PAVA, kleinste Quadrate) je Reach
    // zwischen zwei Seen — der Kanal schneidet Buckel und überbrückt Senken, beides so wenig wie möglich. Ein Reach endet
    // nie unter dem See, in den er mündet (oder dem Meer), und beginnt nie über dem See, aus dem er kommt. Geteilte
    // Unterläufe (zwei Quellen, ein Fluss) tragen EIN S: die längsten Flüsse zuerst, ein Zufluss endet am Spiegel seiner
    // Mündung. Bis V18.531 war der Spiegel die Makro-Höhe des Orts plus ein Buckel (14,3 % der Lauf-Schritte stiegen,
    // der Querschnitt wölbte sich 1,55 m). Läuft im Bau (`_hydroComputing`: die Ufer sind ungecarvt).
    _hydroRiverSpiegel(ctx, rivers) {
        const HC = AnazhRealm.HYDROSPHERE;
        const schluessel = (p) => p.x + "," + p.z;
        const S = new Map();
        const ziel = (p) => {
            const D = AnazhRealm._flussTiefe(p);
            const rand = p.width * 0.5 + D / HC.bankNeigung;
            let tief = Number.isFinite(p.voxelY) ? p.voxelY : p.y;
            for (let sg = -1; sg <= 1; sg += 2) {
                const v = this._voxelSurfaceY(p.x - p.flowZ * rand * sg, p.z + p.flowX * rand * sg);
                if (Number.isFinite(v) && v < tief) tief = v;
            }
            return tief - HC.spiegelFreibord * D;
        };
        // PAVA (pool adjacent violators): benachbarte Verletzer verschmelzen zu ihrem Mittel, bis die Folge nicht steigt.
        const pava = (t) => {
            const summe = [];
            const zahl = [];
            for (let i = 0; i < t.length; i++) {
                summe.push(t[i]);
                zahl.push(1);
                let n = summe.length;
                while (n > 1 && summe[n - 2] / zahl[n - 2] < summe[n - 1] / zahl[n - 1]) {
                    summe[n - 2] += summe[n - 1];
                    zahl[n - 2] += zahl[n - 1];
                    summe.pop();
                    zahl.pop();
                    n--;
                }
            }
            const aus = [];
            for (let b = 0; b < summe.length; b++) for (let i = 0; i < zahl[b]; i++) aus.push(summe[b] / zahl[b]);
            return aus;
        };
        const reihe = rivers.slice().sort((a, b) => b.points.length - a.points.length);
        // (1) die Ausgleichs-Kurve je Reach, mit den Schranken der Seen und der Mündung.
        const reaches = [];
        const deckel = new Map();
        for (const rv of reihe) {
            const P = rv.points;
            let k = 0;
            while (k < P.length) {
                if (P[k].inLake || S.has(schluessel(P[k]))) {
                    k++;
                    continue;
                }
                let e = k;
                while (e < P.length && !P[e].inLake && !S.has(schluessel(P[e]))) e++;
                const t = [];
                for (let i = k; i < e; i++) {
                    const p = P[i];
                    t.push(ziel(p));
                    // Die HEBUNG ist gedeckelt: der Kanal überbrückt eine Senke höchstens um eine Bett-Tiefe über ihrem
                    // Grund — tiefer (eine Schlucht) fällt der Fluss hinein und schneidet stromab.
                    const D = AnazhRealm._flussTiefe(p);
                    const mitte = Number.isFinite(p.voxelY) ? p.voxelY : p.y;
                    deckel.set(schluessel(p), mitte + (1 - HC.spiegelFreibord) * D);
                }
                const f = pava(t);
                for (let i = k; i < e; i++) S.set(schluessel(P[i]), f[i - k]);
                reaches.push({ rv, k, e });
                k = e;
            }
        }
        // (2) der Deckel, dann stromab nie steigend: in Fluss-Reihenfolge (die Füllhöhe y fällt entlang des Flusses
        // strikt) gibt jeder Punkt sein Minimum an den nächsten weiter — über Zusammenflüsse, nie in einen See.
        const naechster = new Map();
        const punkte = new Map();
        for (const rv of rivers) {
            const P = rv.points;
            for (let i = 0; i < P.length; i++) {
                if (P[i].inLake) continue;
                punkte.set(schluessel(P[i]), P[i]);
                if (i + 1 < P.length && !P[i + 1].inLake) naechster.set(schluessel(P[i]), schluessel(P[i + 1]));
            }
        }
        for (const [key, d] of deckel) if (S.get(key) > d) S.set(key, d);
        const nachHoehe = [...punkte.keys()].sort((a, b) => punkte.get(b).y - punkte.get(a).y);
        for (const key of nachHoehe) {
            const n = naechster.get(key);
            if (n !== undefined && S.get(n) > S.get(key)) S.set(n, S.get(key));
        }
        // (3) die Schranken: nie unter dem See, in den der Reach mündet (oder dem Meer), nie über dem See, aus dem er
        // kommt (eine Konstante wahrt die Monotonie).
        for (const { rv, k, e } of reaches) {
            const P = rv.points;
            const oben = k > 0 && P[k - 1].inLake ? P[k - 1].y : Infinity;
            let unten = -Infinity;
            if (e < P.length) unten = P[e].inLake ? P[e].y : S.get(schluessel(P[e]));
            else if (rv.mouth === "sea") unten = ctx.waterLevel;
            else if (rv.mouth === "see" && Number.isFinite(rv.seeY)) unten = rv.seeY;
            for (let i = k; i < e; i++) {
                const key = schluessel(P[i]);
                S.set(key, Math.min(oben, Math.max(unten, S.get(key))));
            }
            // Der Abfluss beginnt bündig mit seinem See (sonst schnitte der Kanal den Becken-Rand auf den tieferen Lauf
            // und das See-Wasser stünde als Wand darüber); die Stufe liegt im ersten Segment.
            if (Number.isFinite(oben)) S.set(schluessel(P[k]), oben);
        }
        // (4) DIE FRÄSE DES BREITEREN (K16, W-F5): die Ufer eines Zuflusses liest `ziel` ungefräst — liegt er im Kanal oder
        // auf der Böschung eines BREITEREN Flusses, schneidet dessen Fräse den Boden unter ihn, und sein Wasser stand darüber
        // (am Ursprung 0,5–2,9 m tief statt des Rinnsals; im Kanal des Stamms hob es dessen Spiegel bis 0,71 m). Je Segment
        // des breiteren (die breitesten zuerst — ihr Spiegel steht dann fest) trägt jeder schmalere Punkt eines anderen Laufs
        // in seiner Reichweite höchstens die Kanal-Fläche des Segments (die Gestalt von `_hydrosphereCarveAt`) minus seinem
        // Freibord, nie weniger als den Spiegel des breiteren. Danach wieder stromab nie steigend.
        {
            const sN = HC.bankNeigung;
            const sK = HC.bankKruemmung;
            const fuss = HC.bankRundung;
            const zelle = (x, z) =>
                Math.round((x - ctx.originX) / ctx.cell - 0.5) + "," + Math.round((z - ctx.originZ) / ctx.cell - 0.5);
            const raster = new Map();
            for (const [key, p] of punkte) {
                const zk = zelle(p.x, p.z);
                if (!raster.has(zk)) raster.set(zk, []);
                raster.get(zk).push(key);
            }
            const stromab = (kp, kz, n) => {
                for (let k = naechster.get(kp), g = 0; k !== undefined && g < n; k = naechster.get(k), g++)
                    if (k === kz) return true;
                return false;
            };
            const segmente = [...naechster.entries()].sort(
                (a, b) => (punkte.get(b[0]).width || 0) - (punkte.get(a[0]).width || 0)
            );
            let gekappt = false;
            for (const [ka, kb] of segmente) {
                const a = punkte.get(ka);
                const b = punkte.get(kb);
                if (!b) continue;
                const hwA = a.width * 0.5;
                const hwB = b.width * 0.5;
                const dA = AnazhRealm._flussTiefe(a);
                const dB = AnazhRealm._flussTiefe(b);
                const weit = Math.max(hwA + dA / sN, hwB + dB / sN) + HC.dammBreite + HC.bankWeite;
                const nZ = Math.ceil(weit / ctx.cell) + 1;
                const ia = Math.round((a.x - ctx.originX) / ctx.cell - 0.5);
                const ja = Math.round((a.z - ctx.originZ) / ctx.cell - 0.5);
                const ex = b.x - a.x;
                const ez = b.z - a.z;
                const len2 = ex * ex + ez * ez || 1;
                for (let dj = -nZ; dj <= nZ; dj++)
                    for (let di = -nZ; di <= nZ; di++) {
                        const liste = raster.get(ia + di + "," + (ja + dj));
                        if (!liste) continue;
                        for (const kp of liste) {
                            if (kp === ka || kp === kb) continue;
                            const p = punkte.get(kp);
                            let t = ((p.x - a.x) * ex + (p.z - a.z) * ez) / len2;
                            t = t < 0 ? 0 : t > 1 ? 1 : t;
                            const halfW = hwA + (hwB - hwA) * t;
                            if (!(p.width * 0.5 < halfW)) continue;
                            const D = dA + (dB - dA) * t;
                            const dK = halfW + D / sN;
                            const dist = Math.hypot(p.x - (a.x + ex * t), p.z - (a.z + ez * t));
                            if (dist >= dK + HC.dammBreite + HC.bankWeite) continue;
                            const spiegel = S.get(ka) + (S.get(kb) - S.get(ka)) * t;
                            if (!(S.get(kp) > spiegel)) continue;
                            if (stromab(kp, ka, nZ + 2)) continue; // der eigene Lauf mündet hier
                            const B = spiegel - (1 - HC.spiegelFreibord) * D;
                            const u0 = dist - halfW;
                            let flaeche =
                                u0 <= -fuss
                                    ? B
                                    : u0 < fuss
                                      ? B + (sN * (u0 + fuss) * (u0 + fuss)) / (4 * fuss)
                                      : B + sN * u0;
                            if (dist > dK) flaeche += sK * (dist - dK) * (dist - dK);
                            const grenze = Math.max(spiegel, flaeche - HC.spiegelFreibord * AnazhRealm._flussTiefe(p));
                            if (S.get(kp) > grenze) {
                                S.set(kp, grenze);
                                gekappt = true;
                            }
                        }
                    }
            }
            if (gekappt)
                for (const key of nachHoehe) {
                    const n = naechster.get(key);
                    if (n !== undefined && S.get(n) > S.get(key)) S.set(n, S.get(key));
                }
        }
        for (const rv of rivers) for (const p of rv.points) p.S = p.inLake ? p.y : S.get(schluessel(p));
    }

    // Phase 5c — Wasserfälle: Fluss-Läufe, deren SPIEGEL (`S`) steil fällt (Steigung > waterfallSlope, in Summe ≥
    // waterfallMinDrop) = ein Sturz; aufeinanderfolgende steile Segmente verschmelzen zu EINEM. Jedes Segment zählt
    // EINMAL: zwei Quellen teilen ihren Unterlauf, und der Sturz darin gehört beiden (bis V18.531 19 Einträge an 13 Orten,
    // W-F4).
    _hydroExtractWaterfalls(ctx, rivers) {
        const HC = AnazhRealm.HYDROSPHERE;
        const waterfalls = [];
        const yOf = (p) => (Number.isFinite(p.S) ? p.S : p.y);
        const gesehen = new Set();
        for (let ri = 0; ri < rivers.length; ri++) {
            const pts = rivers[ri].points;
            let runStart = -1; // Index des oberen Punkts des steilen Laufs
            const flush = (lowerK) => {
                if (runStart < 0) return;
                const a = pts[runStart];
                const b = pts[lowerK];
                const topY = yOf(a);
                const bottomY = yOf(b);
                if (topY - bottomY >= HC.waterfallMinDrop) {
                    waterfalls.push({
                        x: (a.x + b.x) / 2,
                        z: (a.z + b.z) / 2,
                        topY,
                        bottomY,
                        width: a.width,
                        flowX: a.flowX || b.flowX,
                        flowZ: a.flowZ || b.flowZ,
                        riverIndex: ri,
                    });
                }
                runStart = -1;
            };
            for (let k = 0; k + 1 < pts.length; k++) {
                const a = pts[k];
                const b = pts[k + 1];
                // V9.46 — eine See-Durchquerung ist flach (Wasser-Oberfläche),
                // kein Wasserfall; ein laufender steiler Lauf endet an ihr. Ein schon gezähltes Segment (geteilter
                // Unterlauf) beendet den Lauf ebenso.
                const seg = a.x + "," + a.z;
                if (a.inLake || b.inLake || gesehen.has(seg)) {
                    flush(k);
                    continue;
                }
                gesehen.add(seg);
                const drop = yOf(a) - yOf(b);
                const horiz = Math.hypot(b.x - a.x, b.z - a.z) || ctx.cell;
                const steep = drop > 0 && drop / horiz > HC.waterfallSlope;
                if (steep) {
                    if (runStart < 0) runStart = k;
                } else {
                    flush(k); // k ist der untere Punkt des letzten steilen Segments
                }
            }
            flush(pts.length - 1);
        }
        return waterfalls;
    }

    // Carve-Index für `_hydrosphereCarveAt` + `_hydrosphereLakeAt`: (1) Fluss-Bucket-Grid (jedes Segment
    // in alle Buckets seiner um die Kanal-Reichweite erweiterten BBox; eine Abfrage liest einen Bucket),
    // (2) See-Raster `lakeBedCell`, `lakeW`, `lakeNear` (Early-Out). Pure Daten — kein
    // `_terrainDensityAt`, kein Zirkel.
    _hydroBuildCarveIndex(ctx, rivers, lakes) {
        const HC = AnazhRealm.HYDROSPHERE;
        const { dim, originX, originZ, size, waterLevel } = ctx;
        // --- Fluss-Bucket-Grid ---
        const bucketSize = HC.carveBucketSize;
        const bucketsDim = Math.max(1, Math.ceil(size / bucketSize));
        const riverBuckets = new Array(bucketsDim * bucketsDim);
        const addSeg = (seg) => {
            // die Reichweite des Kanals: Krone (halbe Breite + Tiefe / Neigung) + die Krone des Damms + die Böschung dahinter
            const reach =
                Math.max(seg.hwA, seg.hwB) + Math.max(seg.dA, seg.dB) / HC.bankNeigung + HC.dammBreite + HC.bankWeite;
            let bi0 = Math.floor((Math.min(seg.ax, seg.bx) - reach - originX) / bucketSize);
            let bi1 = Math.floor((Math.max(seg.ax, seg.bx) + reach - originX) / bucketSize);
            let bj0 = Math.floor((Math.min(seg.az, seg.bz) - reach - originZ) / bucketSize);
            let bj1 = Math.floor((Math.max(seg.az, seg.bz) + reach - originZ) / bucketSize);
            if (bi0 < 0) bi0 = 0;
            if (bj0 < 0) bj0 = 0;
            if (bi1 >= bucketsDim) bi1 = bucketsDim - 1;
            if (bj1 >= bucketsDim) bj1 = bucketsDim - 1;
            for (let bj = bj0; bj <= bj1; bj++) {
                for (let bi = bi0; bi <= bi1; bi++) {
                    const k = bj * bucketsDim + bi;
                    if (!riverBuckets[k]) riverBuckets[k] = [];
                    riverBuckets[k].push(seg);
                }
            }
        };
        // Ein geteilter Unterlauf ist EIN Segment (zwei Quellen, ein Fluss — die Buckets trugen ihn je Quelle).
        const segGesehen = new Set();
        for (let ri = 0; ri < rivers.length; ri++) {
            const pts = rivers[ri].points;
            for (let k = 0; k + 1 < pts.length; k++) {
                const a = pts[k];
                const b = pts[k + 1];
                // V9.46 — eine See-Durchquerung NICHT carven: das Becken-Bett
                // ist schon von `_hydrosphereLakeAt` flach gesculptet; ein
                // Fluss-Carve grübe sonst eine Rinne in den flachen See-Boden.
                if (a.inLake || b.inLake) continue;
                const segKey = a.x + "," + a.z;
                if (segGesehen.has(segKey)) continue;
                segGesehen.add(segKey);
                addSeg({
                    ax: a.x,
                    az: a.z,
                    bx: b.x,
                    bz: b.z,
                    hwA: a.width * 0.5,
                    hwB: b.width * 0.5,
                    dA: AnazhRealm._flussTiefe(a),
                    dB: AnazhRealm._flussTiefe(b),
                    // der Spiegel an beiden Enden (`_hydroRiverSpiegel`): Fluss-Fläche und Bett lesen ihn linear
                    sA: a.S,
                    sB: b.S,
                });
            }
        }
        // --- See-Becken-Raster ---
        // `lakeBedCell` = flache Bett-Höhe `bedY` (2 Ringe propagiert für saubere bilineare Ufer-Ecken);
        // `lakeW` = Becken-Zugehörigkeit 0/1 (daraus rampt die Ufer-Mischung); `lakeNear` = 1-Ring-Maske.
        // `bedY` ∈ [waterLevel+0.5, level−1.2]: über dem Meer (Meeres-Plane verdeckt), unter dem Spiegel.
        // Seen ≤ waterLevel+2 werden nicht gesculptet — das Meer deckt sie (keine zwei Wasser-Ebenen).
        const n = dim * dim;
        const lakeBedCell = new Float32Array(n);
        const lakeW = new Float32Array(n);
        const lakeNear = new Uint8Array(n);
        for (let li = 0; li < lakes.length; li++) {
            const lake = lakes[li];
            if (lake.level <= waterLevel + 2.0) continue; // faktisch Meeresspiegel
            let bedY = lake.level - HC.carveLakeBedDepth;
            const minBed = waterLevel + 0.5;
            const maxBed = lake.level - 1.2;
            if (bedY < minBed) bedY = minBed;
            if (bedY > maxBed) bedY = maxBed;
            const cells = lake.cells || [];
            for (let c = 0; c < cells.length; c++) {
                const idx = cells[c];
                const ci = idx % dim;
                const cj = (idx / dim) | 0;
                lakeW[idx] = 1;
                for (let dj = -2; dj <= 2; dj++) {
                    for (let di = -2; di <= 2; di++) {
                        const ni = ci + di;
                        const nj = cj + dj;
                        if (ni < 0 || nj < 0 || ni >= dim || nj >= dim) continue;
                        const nidx = ni + nj * dim;
                        lakeBedCell[nidx] = bedY; // bedY auf 2 Ringe propagiert
                        if (di >= -1 && di <= 1 && dj >= -1 && dj <= 1) lakeNear[nidx] = 1;
                    }
                }
            }
        }
        return { riverBuckets, bucketSize, bucketsDim, lakeBedCell, lakeW, lakeNear };
    }

    // === Die Hydrosphäre wird sichtbar ===
    // Läuft NACH dem Setzen von `state.hydrosphere` (Carve aktiv): je gestreamtem Chunk die Wasser-Cells
    // (LOD 0) neu bauen + das Iso-Wasser meshen; trockene Chunks verlieren Cells + Iso. EIN Material
    // (`_ensureHydroSurfaceMaterial`) für alles Iso-Wasser, gespeist von `_applyDayNightToScene`.
    _buildHydrosphereMeshes() {
        if (!this.state.scene || typeof THREE === "undefined") return;
        const hydro = this.state.hydrosphere;
        if (!hydro || !hydro.ready) return;
        this._disposeHydrosphereMeshes(); // idempotenter Rebuild
        const meshes = [];
        // Keine Wasserfall-Plane: steile Läufe trägt das Wildwasser (aSlope-Schaum) + die Steilkanten-Form im
        // Zell-Sheet (das Wasserfall-Material ohne Leser fiel mit der Welle L).
        this.state.hydrosphereMeshes = meshes;
        // V9.75 — schon gestreamte Voxel-Chunks bekommen ihr Iso-Mesh neu
        // gebaut, damit Chunks aus der Pre-Hydrosphäre-Phase (vor dem Atlas)
        // die Lake/Fluss-Wahrheit aus `_waterLevelAt` jetzt sehen. ZWEI PHASEN (die Wasser-Naht): erst die Zellen
        // ALLER Chunks, dann die Sheets — ein Sheet liest die Zellen seiner Nachbarn; im Wechsel gebaut las der
        // frühere Chunk die alten Zellen des späteren, und niemand baute ihn danach neu (Kante auf zwei Höhen).
        if (this.state.voxelChunks) {
            const neu = [];
            for (const key of this.state.voxelChunks.keys()) {
                const ci = key.indexOf(",");
                const cx = Number(key.slice(0, ci));
                const cz = Number(key.slice(ci + 1));
                const entry = this.state.voxelChunks.get(key);
                if (entry && entry.mesh) {
                    // Trocken-Gate auch hier: Hochland-Chunks ohne Wasser sparen den 71k-Cell-Density-Pass (erst mit
                    // fertigem Atlas ist das Gate verlässlich).
                    if (this._voxelChunkHasAnyWater(cx, cz)) {
                        // Wasser-Cells IMMER in LOD 0 — naht-freie Wasser-Oberfläche über LOD-Grenzen hinweg.
                        const lod0Cfg = this._voxelChunkConfig(0);
                        const base = this.state.terrainBaseHeight || 0;
                        entry.waterCells = this._buildVoxelChunkWaterCells(
                            cx * lod0Cfg.span,
                            base - lod0Cfg.floorDrop,
                            cz * lod0Cfg.span,
                            lod0Cfg.step,
                            null,
                            0
                        );
                        neu.push([cx, cz]);
                    } else {
                        entry.waterCells = null;
                        this._disposeVoxelChunkWaterIso(`${cx},${cz}`);
                    }
                }
            }
            for (const [cx, cz] of neu) this._buildVoxelChunkWaterIsoSurface(cx, cz);
            // die Wasser-Zellen der Chunks sind neu: die Welt und ihr Boden regen sich — die Stand-Wache weckt die Fege-
            // Takte, auch im Stand (der Wasser-Automat selbst läuft auf seiner eigenen Uhr)
            this._weltRegt(true);
        }
        this.log(
            `V9.75: Hydrosphäre gerendert — Iso-Wasser (${hydro.waterfalls.length} Fall-Läufe im CA-Wildwasser)`,
            "INFO"
        );
    }

    // Räumt alle gerenderten Hydrosphären-Meshes (Geometrie disposen, aus der
    // Scene nehmen). Die Materialien sind welt-global geteilt — NICHT disposen
    // (V9.43-a-Lehre: ein geteiltes Material disposen bricht jedes andere
    // Wasser-Mesh). Idempotent.
    _disposeHydrosphereMeshes() {
        if (!Array.isArray(this.state.hydrosphereMeshes)) {
            this.state.hydrosphereMeshes = [];
            return;
        }
        for (const m of this.state.hydrosphereMeshes) {
            if (this.state.scene) this.state.scene.remove(m);
            // V10.0-j.f — Defer (WebGPU Submit-Race-frei).
            if (m.geometry) this._queueDispose(m.geometry);
        }
        this.state.hydrosphereMeshes = [];
    }

    // DIE EINE WASSER-WAHRHEIT AM KÖRPER (Welle L, Q6): der Spiegel an (x, z), den das Auge sieht — das GEZEICHNETE Wasser
    // (`_koerperWasserSpiegel` über `_wasserBildAt`: die Dreiecke des Sheets, die der Renderer bekommt, mit dem Live-Dach des
    // Automaten und dem flachen Ufer der Deck-Zelle) über dem Grund des Körpers. Spieler, Kreatur, Mitspieler, Schritt-Klang,
    // Klang-Nässe, Tier-Scheu, Trink-Ziel und die Pflanzen am Boden (Nah-Streu, Nah-Wiese) lesen nur sie. Bis V18.531 trug der
    // Spieler das Dach der obersten Wasser-ZELLE (1,8-m-Raster: in Ruhe 0,47 m über dem See), das Tier den rohen Spiegel, der
    // Mitspieler den Meeresspiegel; bis zur Gegenprüfung (Runde 4) las der Körper den Spiegel des Gesetzes an seinem Punkt,
    // die Welt zeichnete ihn auf dem 1,8-m-Gitter — am Bach der Mess-Wiese 64 m Breite Wasser, in dem der Körper trocken stand
    // (Runde 3 umgekehrt: 177 m, die die Welt nicht zeichnete). Rückgabe: Spiegel (m) oder −Infinity (kein Wasser).
    // DIE DECKE (D11, Gegenprüfung 07.10.): eine geflutete Zelle des Körpers trägt das gezeichnete Wasser, solange keine
    // FEST-Zelle dazwischen liegt; sonst trägt es ihn nur unter offenem Himmel (`_koerperWasserSpiegel`) — unter Fels steht er
    // trocken. Bis 8f09227d las der Körper den Spiegel ohne Decke: in trockenen Höhlen unter und neben dem See der Mess-Wiese
    // 3511 von 3511 Proben „nass".
    // DIE GESTALT (D10): mit `gestalt` (`{ linie }` — die Wasserlinie über der Unterkante des Körpers; Infinity = sie trägt
    // nie) schreibt die Wahrheit die LAGE hinein: `gestalt.lage = { tiefe, schwimmt, unterkante }` — der Körper schwimmt,
    // sobald die Säule über seinem Grund die Linie übersteigt (seine Unterkante liegt dann auf Spiegel − Linie), sonst steht er
    // auf dem Grund (er watet; dichter als Wasser sinkt er). Leser: das Gefährt (`_fahrBoden`, `_rittSchritt`).
    _koerperWasser(x, z, grundY, gestalt) {
        const spiegel = this._koerperWasserSpiegel(x, z, grundY);
        if (gestalt) {
            const tiefe = Number.isFinite(grundY) && spiegel > grundY ? spiegel - grundY : 0;
            const schwimmt = tiefe > gestalt.linie;
            const L = gestalt.lage || (gestalt.lage = {});
            L.tiefe = tiefe;
            L.schwimmt = schwimmt;
            L.unterkante = schwimmt ? spiegel - gestalt.linie : grundY;
        }
        return spiegel;
    }

    // Der Spiegel am Körper (die Wahrheit ohne Gestalt) — nur `_koerperWasser` ruft ihn. Wo ein Chunk geladen ist, ist es das
    // GEZEICHNETE Wasser (`_wasserBildAt`: das Sheet, auch der Küsten-Aquifer, das Live-Dach des Automaten, das flache Ufer)
    // unter der DECKE (D11), gelesen an der Zelle des Körpers (die erste nicht-feste über seinem Grund): ist sie geflutet,
    // trägt sie das Wasser bis zum Spiegel, solange keine FEST-Zelle dazwischen liegt; sonst trägt es den Körper nur unter
    // offenem Himmel — liegt die oberste Fläche des Gesetzes (`_voxelSurfaceY`) mehr als eine Zelle über seinem Grund, steht
    // er unter Fels (eine Höhle unter oder neben dem Wasser): trocken, auch wo der Rand eines Sheets unter das Gelände in die
    // Höhle taucht (am See der Mess-Wiese lag die Anker-Kante in einer 16 m hohen Höhle 15 m über ihrem Boden). Ein Bau-Stempel
    // (Stamm, Pfeiler) ist kein Fels: das Gesetz kennt ihn nicht, das Sheet läuft durch ihn wie das Wasser um ihn.
    // Ohne Chunk (die Ferne, die niemand sieht) der Spiegel des Gesetzes über seinem Grund.
    _koerperWasserSpiegel(x, z, grundY) {
        const endlich = Number.isFinite(grundY);
        const bild = this._wasserBildAt(x, z);
        if (bild === undefined) return this._atlasWaterLevelAt(x, z, endlich ? grundY : -Infinity);
        if (bild === null) return -Infinity;
        if (!endlich || !(bild > grundY)) return bild;
        const { dim, dimY, step, span, floorDrop } = this._voxelChunkConfig(0);
        const cx = Math.floor(x / span);
        const cz = Math.floor(z / span);
        const entry = this.state.voxelChunks.get(`${cx},${cz}`);
        const cells = entry ? entry.waterCells : null;
        if (!cells) return bild;
        const oy = (this.state.terrainBaseHeight || 0) - floorDrop;
        const dq = dim * dim;
        const b = Math.floor((x - cx * span) / step) + Math.floor((z - cz * span) / step) * dim;
        const ZS = AnazhRealm.CELL_STATE;
        let jK = Math.max(0, Math.min(dimY - 1, Math.floor((grundY - oy) / step)));
        for (let n = 0; n < 2 && jK + 1 < dimY && cells[b + jK * dq] === ZS.SOLID; n++) jK++;
        if (cells[b + jK * dq] === ZS.WATER) {
            for (let j = jK + 1; j < dimY && oy + j * step < bild; j++)
                if (cells[b + j * dq] === ZS.SOLID) return -Infinity;
            return bild;
        }
        const oben = this._voxelSurfaceY(x, z);
        return oben !== null && grundY < oben - step ? -Infinity : bild;
    }

    // DER BLICK DES WASSERS (K16, EIN Baustein für den Wasser-Stoff und den Fern-Ring): was die Fläche mit der Normale `n`
    // dem Auge `viewDir` zurückwirft, über dem Grund mit dem Durchlass `T` — der Körper im Licht des Orts (R∞ × E/π), soweit
    // er den Grund deckt (1 − T) und nicht gespiegelt wird (1 − F); der Himmel × F; der Glanz. Liefert { eigen, fres }.
    _wasserBlick(TSL, WG, o) {
        const { float, vec2, vec3, vec4, normalize, reflect, max, dot, pow, clamp, texture, step } = TSL;
        const HG =
            AnazhRealm.Gesetz("terrain:HIMMEL_GESETZ", null) || AnazhRealm._kernPflichtBruch("terrain:HIMMEL_GESETZ");
        // Schlick-Fresnel (WASSER_GESETZ): fres = f0 + f1·(1−n·v)^f2 — EIN Fresnel für Spiegel UND Durchlass.
        const ndvW = clamp(dot(o.n, o.viewDir), 0.0, 1.0);
        const fres = float(WG.fresnel[0]).add(
            float(WG.fresnel[1]).mul(pow(float(1.0).sub(ndvW), float(WG.fresnel[2])))
        );
        // DER SPIEGEL DER WELT (D10, A1): was der gespiegelte Strahl trifft — Ufer, Hang, Krone, Haus, Wolke, sonst der Himmel
        // (`_spiegelPass`, 1/teil Auflösung: zuerst das gezeichnete Bild, jenseits des Schirms das Spiegel-Feld des Gesetzes,
        // dahinter die Himmels-Sicht der Kuppel) — der Welt-Punkt `o.ort` reprojiziert in die Ansicht, aus der der Pass rechnete,
        // die Kräusel-Normale versetzt den Abgriff. Der Pass deckt jedes Wasser-Pixel ganz (vorab multipliziert, Deckung `w`).
        const S = this._spiegelLeser();
        const clip = S.vp.mul(vec4(o.ort, 1.0));
        const sw = max(clip.w, float(1e-4));
        const suv = vec2(clip.x.div(sw).mul(0.5).add(0.5), float(0.5).sub(clip.y.div(sw).mul(0.5))).add(
            o.n.xz.mul(0.03)
        );
        const sp = texture(S.rt.texture, suv).level(float(0));
        const drin = step(0.0, suv.x)
            .mul(step(suv.x, 1.0))
            .mul(step(0.0, suv.y))
            .mul(step(suv.y, 1.0))
            .mul(step(0.0, clip.w));
        const deckt = drin.mul(S.an);
        const w = clamp(sp.a, 0.0, 1.0).mul(deckt);
        // DER HIMMEL, WO DER PASS NICHT DECKT (jenseits des Felds, das ferne Wasser, der Fern-Ring, vor dem ersten Lauf, am
        // Ufer-Saum): die Atmosphäre der Himmels-Sicht (`himmelFarbe`, die Tafel der Kuppel) in Richtung des gespiegelten Strahls,
        // nie unter den Horizont, an dem die Wolken enden (`hor[0]`, Kräusel-Normalen). Jenseits des Felds (368 m) liegt der
        // Strahl aus Augenhöhe unter `hor[0]`: dort IST die Himmels-Sicht die Atmosphäre allein, die Wolke ist null
        // (`_himmelSicht`). Die Wolke rechnet der Pass in 1/teil, nie das Wasser je Pixel (A1-n1, `werkbank zerlegen` gehend,
        // Radeon: Wasser mit Pass 2,95 ms mit zwei fbm im Wasser-Stoff, auch ungenommen, gegen 1,48–2,32 ohne, die Basis vor
        // A1 2,67–2,91). Bis A1 die Umgebung von 128 × 64
        // (`_himmelUmgebungTex`, die Quelle der IBL): ein Verlauf ohne Wolke über dem ganzen See (A0). Bis V18.530 spiegelte das
        // Wasser die Zenit-Tönung × die SONNEN-Stärke (uLight 7,4): 3–5× über dem Himmel, weiß wie Eis (Blick-Tour 07).
        const _R = reflect(o.viewDir.negate(), o.n);
        const _Rh = normalize(vec3(_R.x, max(_R.y, float(HG.hor[0])), _R.z));
        const himmel = sp.rgb.mul(deckt).add(this._atmoLutBau().himmelFarbe(_Rh).mul(float(1).sub(w)));
        // W10 — der Sonnen-Glitzer der Vorlage: reflect-basiert, Exponent/Gewinn aus dem Gesetz, die Sonne selbst
        // (Rayleigh-Farbe sunCol × ihre Stärke light).
        const spec = pow(max(dot(reflect(normalize(o.sunDir).negate(), o.n), o.viewDir), 0.0), float(WG.spec[0]));
        const glanz = o.sunCol.mul(spec).mul(WG.spec[1]).mul(o.light);
        const eigen = o.koerper
            .mul(o.irr)
            .mul(float(1.0).sub(o.T))
            .mul(float(1.0).sub(fres))
            .add(himmel.mul(fres))
            .add(glanz);
        return { eigen, fres };
    }

    // DER BODEN UNTER EINEM WERK (Leben-Schau 2, 09.10.): der Boden des Körpers (`_koerperBodenUnter`) ab der Höhe des
    // Werks — der Ebene seiner Räder im Fahr-Zustand, sonst seiner Basis (y − 0,5). Bis dahin las jeder Fahr- und Ritt-Leser
    // die Oberkante der Säule: unter einem Überhang oder in einer Höhle lag der Boden über dem Werk (der Wagen fiel im
    // Spaltgrund durch die Welt, ein in der Höhle gesetzter Wagen sprang aufs Dach). Je Werk EINE Funktion.
    _werkBoden(entry) {
        if (entry._werkBodenFn) return entry._werkBodenFn;
        entry._werkBodenFn = (x, z) => {
            const fz = entry._fahr;
            const ref =
                fz && Number.isFinite(fz.y)
                    ? fz.y
                    : entry.position && Number.isFinite(entry.position.y)
                      ? entry.position.y - 0.5
                      : NaN;
            return this._koerperBodenUnter(x, ref, z);
        };
        return entry._werkBodenFn;
    }
}
_stammZonen(AnazhRealm, [AnazhRealm_wasser_hydro]);

// ===== ATLAS · Wasser/hydro — Außen-Konstanten =====
// Die Kerne sind PFLICHT (index.html lädt alle Gesetzbücher, _kernPflichtWand meldet den Ausfall):
// ein unlesbares Gesetz ist ein lauter BRUCH, nie eine stille Ersatz-Welt. Keine Zahlen-Zwillinge im
// Stamm — die Zwillings-Absenz-Wand (gate:studio-vertrag) hält sie draußen.
// DIE BETT-TIEFE eines Fluss-Punkts (der EINE Leser): carveBedMin + carveBedK · volle Breite, an der Quelle mit ihrem
// Anteil (W-F5: eine Quelle ist ein Rinnsal, nie ein 1,4-m-Graben aus dem Nichts). Leser: `_hydroRiverSpiegel`,
// `_hydroBuildCarveIndex` (seg.dA/dB → der Kanal, `_hydroRiverAt`, der Worker).
AnazhRealm._flussTiefe = function (p) {
    const HC = AnazhRealm.HYDROSPHERE;
    const q = p.quelle;
    if (!(q > 0 && q <= 1)) throw new Error(`_flussTiefe: Fluss-Punkt ohne Quell-Anteil (quelle = ${q})`);
    return Math.min(HC.kanalTiefe, (HC.carveBedMin + (HC.carveBedK * p.width) / q) * q);
};
