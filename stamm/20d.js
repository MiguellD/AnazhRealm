class AnazhRealm_Z20d {
    // ===== ATLAS §20d · SPAWN-ÖKOLOGIE — Block Vegetation =====
    // Steht der geborene Dart `d` der Zelle (gx, gz)? Kronen-Schüchternheit: er steht, wenn KEIN besserer Dart (prio,
    // Positions-Tiebreak) in ±2 Nachbarzellen konkurriert. Rein → reihenfolge-unabhängig; strikte Total-Ordnung → kein
    // Paar akzeptierter Zentren < pack·(Ti+Tj). Shared shy-Distanz (phyto-core forestTooClose) + named prio-max
    // (forestPrioWins); FOREST_TOPOLOGY.host = "cell" (Feel-Entscheid .116). Einziger Leser ist der Pflanz-Gang
    // (`_forestPlantChunk`) — die Spawn-Wahl liest den Wald nicht, die Genesis-Lichtung hält ihn von der Plattform fern.
    _forestDartSteht(d, gx, gz, cellDarts) {
        const F = AnazhRealm.FOREST;
        const core = typeof globalThis !== "undefined" && globalThis.__phytoCore;
        const tooClose = core && typeof core.forestTooClose === "function" ? core.forestTooClose : null;
        const prioWins = core && core.forestPrioWins;
        for (let ax = -2; ax <= 2; ax++) {
            for (let az = -2; az <= 2; az++) {
                const nb = cellDarts(gx + ax, gz + az);
                for (let k = 0; k < nb.length; k++) {
                    const o = nb[k];
                    if (o === d) continue; // sich selbst (eigene Zelle) überspringen
                    const dx = d.x - o.x;
                    const dz = d.z - o.z;
                    // Distance: shared forestTooClose; Host residual = prio-max (nicht Lab sequential reject).
                    const conflict = tooClose
                        ? tooClose(dx, dz, d.T, o.T, F.pack)
                        : (() => {
                              const md = F.pack * (d.T + o.T);
                              return dx * dx + dz * dz < md * md;
                          })();
                    if (!conflict) continue; // kein Konflikt
                    // Konflikt: „besser" = forestPrioWins (prio, Tiebreak x dann z).
                    const better = prioWins
                        ? prioWins(o, d)
                        : o.prio > d.prio || (o.prio === d.prio && (o.x > d.x || (o.x === d.x && o.z > d.z)));
                    if (better) return false;
                }
            }
        }
        return true;
    }

    // DER SOLITÄR STEHT FREI (K20): kein stehender Baum des Wald-Gesetzes (`_forestDartSteht`) näher als phyto-core
    // FREISTAND.abstand × die Summe der Kronen (T eigene Krone in m; der Baum an derselben Stelle ist er selbst). Die Nachbarn reichen
    // ±4 Zellen (48 m trägt 2 × (6 + 18) m: Eiche neben dem größten Mammut). Mess-Wiese 12.10.: der Bestand steht bei
    // 1,2–1,5 × der Kronen-Summe, frei steht jeder sechste bis siebte Baum. Ein Nachbar steht nur, wo ihn auch der Pflanz-Gang
    // setzt (`_enqueueVegetationSpawn`): die Wildnis trägt seinen Ort (`_wildnisTraegt`) und die Wand des Orts lässt ihn durch
    // (`_ortWand` fragt nur den Grundriss; den Wagen fragt sie nicht, er fährt, und das Wasser des Gesetzes trägt schon
    // der Dart) — der Wurf im Haus stand nie (gate:fernwald F: die Eiche neben einem Haus über ihrem einzigen Nachbarn
    // blieb Bestand). Wer die Antwort merkt, merkt sie am Stand der Grundrisse (`_grundrissStand`).
    _forestStehtFrei(x, z, T, cellDarts) {
        const core = typeof globalThis !== "undefined" ? globalThis.__phytoCore : null;
        const FS = core && core.FREISTAND;
        if (!FS || !(FS.abstand > 0)) return AnazhRealm._kernPflichtBruch("phyto:FREISTAND.abstand");
        const CELL = AnazhRealm.FOREST.cell;
        const gx = Math.floor(x / CELL);
        const gz = Math.floor(z / CELL);
        for (let ax = -4; ax <= 4; ax++) {
            for (let az = -4; az <= 4; az++) {
                const nb = cellDarts(gx + ax, gz + az);
                for (let k = 0; k < nb.length; k++) {
                    const o = nb[k];
                    const r = FS.abstand * (T + o.T);
                    const dx = o.x - x;
                    const dz = o.z - z;
                    const d2 = dx * dx + dz * dz;
                    if (d2 < 1e-6 || d2 >= r * r) continue;
                    if (!this._forestDartSteht(o, gx + ax, gz + az, cellDarts)) continue;
                    if (!this._wildnisTraegt(o.x, o.z)) continue;
                    if (!this._ortWand(o.sp, { x: o.x, y: o.surfaceY + 0.5, z: o.z }, { scale: o.s })) return false;
                }
            }
        }
        return true;
    }

    _forestPlantChunk(cx, cz) {
        if (!this.state.scene || !this.state.blueprints) return 0;
        const F = AnazhRealm.FOREST;
        const CELL = F.cell;
        const { span } = this._voxelChunkConfig();
        const ox = cx * span;
        const oz = cz * span;
        const seedInt = this._forestSeedInt();
        // Perf-Kappung aus der EINEN Quelle `_effectiveFoliageDensity`: im Studio-Regime 1 (das Studio dünnt
        // den Wald nie), sonst der Perf-Regler; headless → 1.
        const fd = this._effectiveFoliageDensity();
        const c0x = Math.floor(ox / CELL);
        const c1x = Math.floor((ox + span) / CELL);
        const c0z = Math.floor(oz / CELL);
        const c1z = Math.floor((oz + span) / CELL);
        // Born-Dart-Memo (lokal je Aufruf → KEIN chunk-übergreifender mutabler Zustand →
        // Reihenfolge-Unabhängigkeit). `_forestCellDarts` ist rein → jede Zelle einmal.
        const memo = new Map();
        const cellDarts = (gx, gz) => {
            const k = gx + "," + gz;
            let d = memo.get(k);
            if (!d) {
                d = this._forestCellDarts(gx, gz, seedInt);
                memo.set(k, d);
            }
            return d;
        };
        let planted = 0;
        for (let gz = c0z; gz <= c1z; gz++) {
            for (let gx = c0x; gx <= c1x; gx++) {
                const own = cellDarts(gx, gz);
                for (const d of own) {
                    // Nur Darts, deren POSITION in DIESEN Chunk fällt (disjunkt → einmal).
                    if (d.x < ox || d.x >= ox + span || d.z < oz || d.z >= oz + span) continue;
                    if (!this._forestDartSteht(d, gx, gz, cellDarts)) continue;
                    // die Genesis-Lichtung hält die EINE Natur-Wand frei (`_naturSetzen`, die Plattform ist ein Grundriss)
                    // Dichte = die Vorlage: das Studio dünnt den Wald NIE (volle Dichte, Last über LOD + Sicht-Kappung).
                    // Im Studio-Regime ist fd=1 → dieser Check feuert nie; sonst dünnt der Perf-Regler.
                    if (fd < 1 && d.keep >= fd) continue;
                    // Der Baum wird ein ECHTER Architektur-Eintrag (spawnArchitecture über _enqueueVegetationSpawn) →
                    // harvestbar, kollidierbar, getaggt, LOD. Gespawnt wird die BASIS-Art (`d.sp`) + der Varianten-Index
                    // explizit, nie über `_growTreeBlueprintForSpawn` (baut ~170k-Geometrie eager). Der Render wählt die
                    // Quelle (Foundry, ohne Studio lazy `_buildVariantLODs`); die LOD-Identität (`_lodSpecies`/
                    // `_lodVariantIndex`) reist durch die Spawn-Opts — ohne sie kein L0/L1/L2/Impostor.
                    const regX = Math.floor(d.x / 256);
                    const regZ = Math.floor(d.z / 256);
                    const worldSeed = (this.state.worldMeta && this.state.worldMeta.seed) || "anazh-realm-seed";
                    const regionSeed = `${worldSeed}|${d.sp}|${regX},${regZ}`;
                    const variantIndex =
                        typeof this._treeVariantIndexFor === "function"
                            ? this._treeVariantIndexFor(d.sp, regionSeed)
                            : 0;
                    this._enqueueVegetationSpawn(
                        d.sp,
                        { x: d.x, y: d.surfaceY + 0.5, z: d.z },
                        {
                            seed: d.seed,
                            silent: true,
                            scale: d.s,
                            rotationY: d.rotY,
                            _lodSpecies: d.sp,
                            _lodVariantIndex: variantIndex,
                        }
                    );
                    planted++;
                    // Die Krone streut Laub, sobald der Baum als Eintrag steht (`spawnArchitecture`, Radius = die
                    // Kronen-Schüchternheit `_kronenRadiusFuer`) — nie schon beim Wurf.
                    // Die Scatter-Cell im Lookup REGISTRIEREN (species + variantIndex → der V18.221-Ω-H-
                    // Resolver mappt die Cell auf die reale Form) + den „tree"-Zähler ERHÖHEN (Cap-Wand).
                    if (this._scatterRegisterCell) {
                        this._scatterRegisterCell(d.x, d.z, "tree", d.sp, variantIndex);
                    }
                    if (this._scatterIncrementCounter) this._scatterIncrementCounter("tree");
                    // Totholz: ~TOTHOLZ_RATE der Bäume tragen einen gefallenen Stamm in 3–5 m Abstand. Im Studio-Regime
                    // AUS (Monolith-Regel ohne Studio-Gesetz, Fremd-Silhouette); foundry-aus prüft das Band über
                    // __anazhGateNoFoundry weiter.
                    if (d.totRoll < AnazhRealm.TOTHOLZ_RATE && !this._foundryEnabled()) {
                        const ang = d.rotY * 2.0;
                        const dist = 3 + d.keep * 2;
                        const tx = d.x + Math.cos(ang) * dist;
                        const tz = d.z + Math.sin(ang) * dist;
                        if (this._landAt(tx, tz, 0.4)) {
                            const tsy =
                                typeof this._voxelSurfaceY === "function" ? this._voxelSurfaceY(tx, tz) : d.surfaceY;
                            this._enqueueVegetationSpawn(
                                "stamm_gefallen",
                                { x: tx, y: (Number.isFinite(tsy) ? tsy : d.surfaceY) + 0.5, z: tz },
                                {
                                    seed: (d.seed ^ 0x7c2b1a93) >>> 0,
                                    silent: true,
                                    scale: 0.85 + d.totRoll * 3,
                                    rotationY: ang,
                                }
                            );
                        }
                    }
                }
            }
        }
        // Strauch-Teppich (Studio-Gesetz buildForest): Sträucher auf einem bushStep-RASTER (±2 m Jitter) mit
        // gc.shrub = gauss(L, 0.4, 0.16) · (1−rk) · 0.42; bushStep = PORTAL_RENDER_CONFIG.understory.bushStep
        // (Vertrags-Default 4.4). Eingänge: L = _canopyLightAt, rk aus der Platzierungs-Slope, Pfad =
        // _pathFieldAt. Raster an Welt-Koords, Wurf per Positions-Hash (Γ5) → reihenfolge-unabhängig; ein über
        // die Chunk-Naht gejitterter Punkt FÄLLT (kein Doppel). Bedingungslos das EINE Busch-Gesetz.
        {
            const uCfg = AnazhRealm._studioRenderConfig && AnazhRealm._studioRenderConfig.understory;
            const bushStep = uCfg && Number.isFinite(uCfg.bushStep) ? uCfg.bushStep : 4.4;
            const GS = AnazhRealm.GRASS_SLOPE;
            const g0x = Math.ceil(ox / bushStep);
            const g1x = Math.ceil((ox + span) / bushStep) - 1;
            const g0z = Math.ceil(oz / bushStep);
            const g1z = Math.ceil((oz + span) / bushStep) - 1;
            for (let bgz = g0z; bgz <= g1z; bgz++) {
                for (let bgx = g0x; bgx <= g1x; bgx++) {
                    let hs = ((bgx * 73856093) ^ (bgz * 19349663) ^ seedInt ^ 0x5bd1e995) >>> 0 || 1;
                    const hrnd = () => {
                        hs = (hs + 0x6d2b79f5) >>> 0;
                        let t = hs;
                        t = Math.imul(t ^ (t >>> 15), t | 1);
                        t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
                        return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
                    };
                    const bxp = bgx * bushStep + (hrnd() - 0.5) * 4.0; // Studio-Jitter ±2 m
                    const bzp = bgz * bushStep + (hrnd() - 0.5) * 4.0;
                    if (bxp < ox || bxp >= ox + span || bzp < oz || bzp >= oz + span) continue;
                    const bsy = this._voxelSurfaceY(bxp, bzp);
                    if (bsy === null || !Number.isFinite(bsy)) continue;
                    if (!this._landAt(bxp, bzp, 0.1)) continue;
                    const bFeuchte = this._feuchteAt ? this._feuchteAt(bxp, bzp, bsy) : 0;
                    const L = this._canopyLightAt(bxp, bzp, bsy, bFeuchte);
                    const slopeB = this._slopeAt(bxp, bzp);
                    const rk = Math.max(0, Math.min(1, (slopeB - GS.lo) / (GS.hi - GS.lo)));
                    const trail = this._pfadFeldAt(bxp, bzp, bsy);
                    const dL = L - 0.4;
                    const pShrub = Math.exp(-(dL * dL) / (2 * 0.16 * 0.16)) * (1 - rk) * 0.42 * (1 - trail * 0.92);
                    if (hrnd() >= pShrub) continue;
                    // Busch-Spawn-Name ist ein GEWACHSENER Bauplan: busch_hazel ist eine Grammatik-Spezies, kein Built-in
                    // — der Bauplan entsteht über den Richter (`_growTreeBlueprintForSpawn`, region-gecacht), der Render
                    // kommt aus der Foundry (busch_hazel→strauch). Ohne gewachsenen Key fällt der Punkt (kein Phantom).
                    let bushKey = null;
                    if (this._genVersion && this._genVersion() >= 4 && this._growTreeBlueprintForSpawn) {
                        const bRegX = Math.floor(bxp / 256);
                        const bRegZ = Math.floor(bzp / 256);
                        const bSeedW = (this.state.worldMeta && this.state.worldMeta.seed) || "anazh-realm-seed";
                        try {
                            bushKey = this._growTreeBlueprintForSpawn(
                                "busch_hazel",
                                `${bSeedW}|busch_hazel|${bRegX},${bRegZ}`
                            );
                        } catch (_gbe) {
                            bushKey = null;
                        }
                    }
                    if (!bushKey && this.state.blueprints && this.state.blueprints.busch_hazel) bushKey = "busch_hazel";
                    if (!bushKey) continue;
                    this._enqueueVegetationSpawn(
                        bushKey,
                        { x: bxp, y: bsy + 0.5, z: bzp },
                        {
                            seed: (hs ^ 0x2f6e2b1) >>> 0,
                            silent: true,
                            // Studio: SCALE.strauch × (0.8 + RNG()·0.5) — die Tabellen-Skala
                            // (0.332) trägt der Render-Pfad (V18.418), hier nur die Streuung.
                            scale: 0.8 + hrnd() * 0.5,
                            rotationY: hrnd() * Math.PI * 2,
                        }
                    );
                    planted++;
                }
            }
        }
        return planted;
    }

    // Landmark-Form: die Hangneigung wählt die Formations-Variante (steil → aufragend, flach → gedrungen).
    // Region-deterministisch (HISM-kohärent), Affinität unberührt; nur EINE Form im Pool → Region-Pick.
    _landmarkVariantIdx(prefix, n, regX, regZ, slope, worldSeed) {
        const g = this._rollGenome(`${worldSeed}|${regX},${regZ}`, `${prefix}-region`);
        const tall = (AnazhRealm.LANDMARK_TALL_FORMS && AnazhRealm.LANDMARK_TALL_FORMS[prefix]) || [];
        const wantTall = (slope || 0) > AnazhRealm.LANDMARK_SLOPE_TALL;
        const fit = [];
        for (let vi = 0; vi < n; vi++) {
            const vbp = this.state.blueprints && this.state.blueprints[`${prefix}_var${vi}`];
            if (vbp && tall.includes(vbp._formClass) === wantTall) fit.push(vi);
        }
        const choices = fit.length ? fit : null;
        return choices ? choices[g.int("pick", 0, choices.length - 1)] : g.int("pick", 0, n - 1);
    }

    // Stein-Geologie-Klasse (phytogenesis-placeRocks): FLACH → Findling, steil + hoch → Aufschluss (Grat),
    // steil + tief → Talus (Hang-Fuß), Mittelhang → kein Fels; Prüf-Folge Findling → Aufschluss → Talus.
    // Reine Funktion von (slope, relH) → Γ5-deterministisch.
    _rockGeologyClass(slope, relH) {
        const G = AnazhRealm.ROCK_GEOLOGY;
        const s = Number.isFinite(slope) ? slope : 0;
        const h = Number.isFinite(relH) ? relH : 0;
        if (s <= G.findlingSlopeMax) return "findling"; // flacher Grund
        if (s > G.aufschlussSlopeMin && h > G.aufschlussHeightMin) return "aufschluss"; // Fels bricht auf dem Grat durch
        if (s > G.talusSlopeMin) return "talus"; // Blockschutt am Steilhang-Fuß
        return null; // Mittelhang → kein Fels (die Nische trägt hier keinen Stein)
    }

    // V18.389 (P3) — die GRÖSSE folgt der Nische: Findling groß (Erratiker), Talus klein
    // (Schutt), Aufschluss mittel-groß. Deterministischer Wurf aus der Position (Γ5, kein
    // Math.random). `rng` = worldField.rngNoise (seed-gebunden).
    _rockGeologyScale(cls, rng, x, z) {
        const G = AnazhRealm.ROCK_GEOLOGY;
        let lo = 1,
            hi = 1;
        if (cls === "findling") {
            lo = G.findlingScaleLo;
            hi = G.findlingScaleHi;
        } else if (cls === "talus") {
            lo = G.talusScaleLo;
            hi = G.talusScaleHi;
        } else if (cls === "aufschluss") {
            lo = G.aufschlussScaleLo;
            hi = G.aufschlussScaleHi;
        }
        const t =
            rng && typeof rng.noise2D === "function" ? (rng.noise2D(x * 0.83 + 11.3, z * 0.83 - 7.1) + 1) / 2 : 0.5;
        return lo + (hi - lo) * (t < 0 ? 0 : t > 1 ? 1 : t);
    }

    // Fels-Variante, deren `_formClass` zur Nische passt (Findling→brocken, Talus→geroell, Aufschluss→
    // nadel/stapel); region-deterministisch, HISM-kohärent. Passt keine → reiner Region-Pick.
    _rockVariantForGeology(cls, regX, regZ, worldSeed) {
        const n = AnazhRealm.ROCK_VARIANTS;
        const forms = (AnazhRealm.ROCK_GEOLOGY_FORMS && AnazhRealm.ROCK_GEOLOGY_FORMS[cls]) || null;
        const g = this._rollGenome(`${worldSeed}|${regX},${regZ}`, `geology-${cls}`);
        const fit = [];
        for (let vi = 0; vi < n; vi++) {
            const vbp = this.state.blueprints && this.state.blueprints[`fels_var${vi}`];
            if (vbp && (!forms || forms.includes(vbp._formClass))) fit.push(vi);
        }
        const choices = fit.length ? fit : null;
        const idx = choices ? choices[g.int("pick", 0, choices.length - 1)] : g.int("pick", 0, n - 1);
        return `fels_var${idx}`;
    }

    _vegetationSampleSpawn(sampleX, sampleZ, surfaceY, seedForSpawn, tagsJe) {
        // Nichts wächst im Wasser (0.4 m Marge gegen knöcheltiefes Ufer). Eine Quelle: die Spalten-Probe `_nassAt` —
        // alle wasser-respektierenden Welt-Schichten lesen denselben Helfer.
        if (!this._landAt(sampleX, sampleZ, 0.4)) return 0;

        // Landmark-Pass: seltener, UNIFORMER Hash-Wurf. Eine Felsformation spawnt nur, wo die Region sie trägt
        // (dichte-getrieben); Bogen oder Turm entscheidet ein Hash-Münzwurf, kein Affinitäts-Wettstreit.
        const LANDMARK_RATE = 0.014;
        const BASE_RATE = 0.4;
        const AFFINITY_FLOOR = 0.18;
        // Kandidaten: alle Baumarten lesen dieselben Tags (holz+laub) → die Verteilung emergiert aus aff² ohne
        // Affinitäts-Verschiebung; die Variante (jung/normal/alt) wird seed-deterministisch NACH dem Sieg
        // gewählt. karst klettert Klippen (slopeMax 1.6). Büsche stehen NICHT hier — sie spawnen am Slot, wenn
        // der Baum scheitert (sonst verschöbe ihre Tag-Drift die Baum-Verteilung). baum_totholz fiel W1 aus den
        // Kandidaten: ein Baum-Sieg setzt hier keinen Baum (Wald-Marker, Bäume pflanzt `_forestPlantChunk`), gezeichnet
        // hat Totholz nur die Streu-Schicht litter — als belaubte Alias-Eiche (das Studio hat keinen Totholz-Körper).
        // Grammatik, Baum-Parameter und Tag-Variation der Art fielen 05.10. mit (gate:altlasten).
        const candidates = [
            "baum_eiche",
            "baum_kiefer",
            "baum_birke",
            "baum_erle",
            "baum_buche",
            "baum_tanne",
            "baum_karst",
            "stein_block",
            "kristall_geode",
            "glutbrunnen",
        ];
        // Nie Math.random im Worldgen: worldFieldAt() initialisiert state.worldField (inkl. rngNoise, seed-
        // gebunden) lazy — sonst würfelt jeder Peer anders (P2P-Drift).
        // Das Welt-Feld dieser Stelle EINMAL (es initialisiert auch den Rausch-Satz samt rngNoise): jede Affinität und
        // jeder Wald-/Busch-Wurf dieses Samples liest es.
        const welt = this.worldFieldAt(sampleX, sampleZ);
        const rng = this.state.worldField && this.state.worldField.rngNoise;
        // Γ1 — die FEUCHTE einmal pro Sample (surfaceY liegt hier schon vor;
        // der Bucket-Walk läuft 1× statt 1× je Kandidat) → alle Affinitäts-
        // Aufrufe dieses Samples lesen denselben Wert.
        const feuchte = this._feuchteAt(sampleX, sampleZ, surfaceY);
        const fw = Number.isFinite(feuchte) ? feuchte : this._feuchteAt(sampleX, sampleZ);
        // die Tags je Bauplan aus der Tafel des Chunks (`_populateVoxelChunkVegetation`), sonst einmal hier
        const tafel = tagsJe || new Map();
        const affinitaet = (name) => {
            const bp = this.state.blueprints && this.state.blueprints[name];
            if (!bp) return 0;
            let tags = tafel.get(bp);
            if (tags === undefined) tafel.set(bp, (tags = this.computeCompoundTags(bp)));
            return this._affinitaet(tags, welt, fw);
        };

        if ((seedForSpawn % 1000) / 1000 < LANDMARK_RATE) {
            const affBogen = affinitaet("felsbogen");
            const affTurm = affinitaet("felsturm");
            if (Math.max(affBogen, affTurm) >= AFFINITY_FLOOR) {
                const lmName = (seedForSpawn >>> 10) & 1 ? "felsturm" : "felsbogen";
                // Enqueue statt sofort spawnen: der Streaming-Pump öffnet 9+ Chunks mit je bis zu 64 Samples, jeder
                // Spawn kostet ~5-15 ms (Builder + Ammo-Body + BlockerAABBs + Remesh) → verteilt 4 Spawns/Frame.
                this._enqueueVegetationSpawn(
                    lmName,
                    { x: sampleX, y: surfaceY + 0.5, z: sampleZ },
                    {
                        seed: seedForSpawn,
                        silent: true,
                    }
                );
                return 1; // an dieser Stelle keine zweite Struktur
            }
        }

        // Wurde diese Zelle schon promotet (ein REALER Baum lebt hier), wird sie übersprungen.
        if (this._scatterIsCellPromoted && this._scatterIsCellPromoted(sampleX, sampleZ, "tree")) {
            return 0;
        }
        // V18.220 — die CAP-Wand. Plan §13 (600k Tree / 700k Under / 1.5M Stone).
        // Bei einer CPU-First-Welt ist die echte Decke ~10k pro Layer — der Cap
        // schützt vor Memory-Explosion bei extremen Welten.
        if (this._scatterCounterAtCap && this._scatterCounterAtCap("tree")) {
            return 0;
        }

        // Streu-Pass: beste-Affinität-Bauplan an dieser Position.
        let bestName = null;
        let bestAffinity = 0;
        for (const name of candidates) {
            const aff = affinitaet(name);
            if (aff > bestAffinity) {
                bestAffinity = aff;
                bestName = name;
            }
        }
        if (!bestName || bestAffinity < AFFINITY_FLOOR) return 0;

        // Per-Spezies Slope-/Höhen-Toleranz aus SPECIES_TREE_PARAMS (frozen; z. B. Birke slopeMax 0.6, Tanne
        // heightRange [-30, 200]). Kein Eintrag (Landmarks) → kein Gate, die Affinitäts-Achsen entscheiden.
        const sParams2 = AnazhRealm.SPECIES_TREE_PARAMS && AnazhRealm.SPECIES_TREE_PARAMS[bestName];
        if (sParams2) {
            // Höhe relativ zur Terrain-Basis: aus heightRange [min, max].
            const baseH = this.state.terrainBaseHeight || 0;
            const relH = surfaceY - baseH;
            const hr = sParams2.heightRange;
            if (Array.isArray(hr) && hr.length === 2) {
                if (relH < hr[0] || relH > hr[1]) return 0;
            }
            // Slope: |∇surf| über 4m-Fenster. Eine echte Hang-Steilheit, NICHT
            // pro-Frame teuer (4× getTerrainHeightAt ≈ 4 Density-Samples).
            const slopeMax = +sParams2.slopeMax || 1.5;
            if (slopeMax < 1.5 && typeof this.getTerrainHeightAt === "function") {
                const hxp = this.getTerrainHeightAt(sampleX + 2, sampleZ);
                const hxn = this.getTerrainHeightAt(sampleX - 2, sampleZ);
                const hzp = this.getTerrainHeightAt(sampleX, sampleZ + 2);
                const hzn = this.getTerrainHeightAt(sampleX, sampleZ - 2);
                if (Number.isFinite(hxp) && Number.isFinite(hxn) && Number.isFinite(hzp) && Number.isFinite(hzn)) {
                    const dhx = (hxp - hxn) / 4;
                    const dhz = (hzp - hzn) / 4;
                    const slope = Math.sqrt(dhx * dhx + dhz * dhz);
                    if (slope > slopeMax) return 0;
                }
            }
        }

        // Bernoulli-Probe via deterministischer noise2D (Multi-User-safe).
        // Γ5 — rng ist oben garantiert initialisiert (worldFieldAt lazy); der alte
        // Math.random-Fallback ist GESTRICHEN (P2P-Drift-Klasse).
        const probe = (rng.noise2D(sampleX * 0.31, sampleZ * 0.31) + 1) / 2;
        // Wald-Dichte: Bäume sind in lebendig-hohen Regionen VIEL wahrscheinlicher → echte Wälder aus den
        // bestehenden, abbaubaren Bäumen (kein paralleles Deko-System); getragen von HISM-Instancing,
        // Lazy-Collision (< 40 m) und Distanz-Culling. Felsen/Geoden/Glutbrunnen bleiben spärliche Landmarken.
        const TREE_NAMES = new Set([
            "baum_eiche",
            "baum_kiefer",
            "baum_birke",
            "baum_erle",
            "baum_buche",
            "baum_tanne",
            "baum_karst", // V18.216 — Klippen-Baum, derselbe Wald-Masken-Boost
        ]);
        const isTree = TREE_NAMES.has(bestName);
        let chance = BASE_RATE * bestAffinity * bestAffinity;
        // Streu-Seltenheit aus der Vorlagen-Quelle (PORTAL_RENDER_CONFIG.placement.rarity, live): wie selten
        // Kristall-/Fels-Formationen streuen (kristalle 0.05 = fast nie), editierbar ohne Code.
        {
            const _rcP = AnazhRealm._studioRenderConfig && AnazhRealm._studioRenderConfig.placement;
            const _rar = _rcP && _rcP.rarity;
            if (_rar) {
                const _preset = typeof this._foundryPresetFor === "function" ? this._foundryPresetFor(bestName) : null;
                if (_preset && Number.isFinite(_rar[_preset])) chance *= Math.max(0, Math.min(1, _rar[_preset]));
            }
        }
        if (isTree) {
            const lebendig = welt.lebendig;
            chance = Math.min(0.4, BASE_RATE * bestAffinity * (0.4 + lebendig * 0.9));
            // Wald-Maske = die volle Platzierungs-Ökologie aus der EINEN Quelle `_placementDensityFactor` (Stand-
            // Klump × Slope-flach × Feuchte × Höhe × Perf): echte Wälder mit Rand + Lichtungen statt glatter
            // Gradienten; mittelwert-neutral, tag-neutral (chance-Skalar).
            const forest = this._placementDensityFactor(sampleX, sampleZ, surfaceY, "forest");
            chance = Math.min(0.5, chance * forest);
        }
        if (probe >= chance) {
            // Busch-Sub-Spawn: kippt der Baum-Slot (probe fail), versuche einen BUSCH an der Stelle — feuchte
            // Lücken → Farn, lebendige → Blume, sonst Hazel. BUSH_RATE skaliert mit lebendig; Büsche laufen durch
            // denselben gen ≥ 4 Wachstums-Pfad (Tag-Variation deklariert).
            if (isTree) {
                const BUSH_RATE = 0.18; // Erst-Wurf-Wert; browser-justierbar
                const bushProbe = (rng.noise2D(sampleX * 0.47 - 2.1, sampleZ * 0.47 + 6.3) + 1) / 2;
                const lebendig2 = welt.lebendig;
                // Der Unterwuchs folgt derselben Platzierungs-Ökologie über den ':meadow'-Stand (λ~40 m Dickicht) →
                // dicht in feuchten flachen Lücken, licht am Hang.
                const meadowF = this._placementDensityFactor(sampleX, sampleZ, surfaceY, "meadow");
                const bushChance = BUSH_RATE * (0.4 + lebendig2 * 0.9) * meadowF;
                if (bushProbe < bushChance) {
                    // Spezies-Wahl: Feuchte > 0.55 → Farn; sonst lebendig >
                    // 0.5 → Blume; sonst Hazel. Deterministisch über noise2D.
                    let bushName;
                    if (feuchte > 0.55) bushName = "farn_busch";
                    else if (lebendig2 > 0.5) bushName = "blume_gross";
                    else bushName = "busch_hazel";
                    // Slope/Höhen-Gate für die GEWÄHLTE Busch-Spezies (eigene
                    // SPECIES_TREE_PARAMS-Toleranz, Hazel klettert weiter als
                    // die Blume).
                    const bushParams = AnazhRealm.SPECIES_TREE_PARAMS && AnazhRealm.SPECIES_TREE_PARAMS[bushName];
                    if (bushParams) {
                        const baseH2 = this.state.terrainBaseHeight || 0;
                        const relH2 = surfaceY - baseH2;
                        const bhr = bushParams.heightRange;
                        if (Array.isArray(bhr) && bhr.length === 2) {
                            if (relH2 < bhr[0] || relH2 > bhr[1]) return 0;
                        }
                        const bushSlopeMax = +bushParams.slopeMax || 1.5;
                        if (bushSlopeMax < 1.5 && typeof this.getTerrainHeightAt === "function") {
                            const hxp = this.getTerrainHeightAt(sampleX + 2, sampleZ);
                            const hxn = this.getTerrainHeightAt(sampleX - 2, sampleZ);
                            const hzp = this.getTerrainHeightAt(sampleX, sampleZ + 2);
                            const hzn = this.getTerrainHeightAt(sampleX, sampleZ - 2);
                            if (
                                Number.isFinite(hxp) &&
                                Number.isFinite(hxn) &&
                                Number.isFinite(hzp) &&
                                Number.isFinite(hzn)
                            ) {
                                const dhx = (hxp - hxn) / 4;
                                const dhz = (hzp - hzn) / 4;
                                const slope = Math.sqrt(dhx * dhx + dhz * dhz);
                                if (slope > bushSlopeMax) return 0;
                            }
                        }
                    }
                    // gen ≥ 4: durch den Wachstums-Pfad (rich Grammar baut den
                    // Busch genauso wie einen Baum — multi-level branches +
                    // foliage at anchors). Region-cache pro Busch-Spezies.
                    const gV2 = this._genVersion ? this._genVersion() : 1;
                    let bushSpawnName = bushName;
                    let bushScale = 0.9 + ((rng.noise2D(sampleX * 0.59 + 1.7, sampleZ * 0.59 - 0.3) + 1) / 2) * 0.3;
                    const bushYaw = ((rng.noise2D(sampleX * 0.73 + 3.7, sampleZ * 0.73 - 1.9) + 1) / 2) * Math.PI * 2;
                    if (gV2 >= 4) {
                        const regX = Math.floor(sampleX / 256);
                        const regZ = Math.floor(sampleZ / 256);
                        const worldSeed = (this.state.worldMeta && this.state.worldMeta.seed) || "anazh-realm-seed";
                        const regionSeed = `${worldSeed}|${bushName}|${regX},${regZ}`;
                        const grownKey = this._growTreeBlueprintForSpawn(bushName, regionSeed);
                        if (grownKey) bushSpawnName = grownKey;
                    }
                    this._enqueueVegetationSpawn(
                        bushSpawnName,
                        { x: sampleX, y: surfaceY + 0.5, z: sampleZ },
                        {
                            seed: seedForSpawn ^ 0x4d2a9b71, // eigener Suffix-Stream (Γ5)
                            silent: true,
                            scale: bushScale,
                            rotationY: bushYaw,
                        }
                    );
                    return 1;
                }
            }
            return 0;
        }

        // Gestalt + Größe + Rotation je Baum: der Affinitäts-Sieg (bestName) bleibt kanonisch (Verteilung
        // bit-identisch); danach wählen seed-deterministische Würfe Variante, Größe (±~40 %) und freie Yaw.
        // Felsen/Geoden drehen sich auch, behalten aber ihre eine Gestalt.
        let spawnName = bestName;
        let spawnScale = 1;
        let spawnYaw = 0;
        // Landmark-Genome: ist der Sieger ein Fels-/Kristall-/Glut-Wahrzeichen, wähle eine REGION-
        // deterministische Formation (ein Feld trägt EINEN Stil → HISM-Instancing wirkt). Die Gestalt kommt
        // NACH dem Sieg, der Name bleibt kanonischer Affinitäts-Träger (tag-frozen); je Stück scale/yaw.
        const landmarkPool = AnazhRealm.SCATTER_VARIANT_POOL && AnazhRealm.SCATTER_VARIANT_POOL[bestName];
        if (bestName === "stein_block") {
            // Geologie-Regel: der Fels folgt dem HANG (`_rockGeologyClass`) — Form-Klasse UND Größe (Findling
            // groß, Talus klein), Mittelhang ohne Fels. EINE Quelle: `_slopeAt` speist Nische, Form und Skala.
            const slopeR = typeof this._slopeAt === "function" ? this._slopeAt(sampleX, sampleZ) : 0;
            const baseHr = (this.state && this.state.terrainBaseHeight) || 0;
            const relHr = surfaceY - baseHr;
            const geoCls = this._rockGeologyClass(slopeR, relHr);
            if (!geoCls) return 0; // die Slope-Nische trägt hier keinen Stein (Mittelhang)
            const regX = Math.floor(sampleX / 256);
            const regZ = Math.floor(sampleZ / 256);
            const worldSeed = (this.state.worldMeta && this.state.worldMeta.seed) || "anazh-realm-seed";
            const key = this._rockVariantForGeology(geoCls, regX, regZ, worldSeed);
            if (key && this.state.blueprints && this.state.blueprints[key]) spawnName = key;
            // GRÖSSE nach Nische: Findling groß, Talus klein, Aufschluss aufragend.
            spawnScale = this._rockGeologyScale(geoCls, rng, sampleX, sampleZ);
        } else if (landmarkPool && landmarkPool.n > 0) {
            const regX = Math.floor(sampleX / 256);
            const regZ = Math.floor(sampleZ / 256);
            const worldSeed = (this.state.worldMeta && this.state.worldMeta.seed) || "anazh-realm-seed";
            // Die Form folgt dem Terrain (`_landmarkVariantIdx`): steil → aufragend (Nadel/Stapel/Druse/tiefe
            // Esse), flach → gedrungen (Brocken/Geröll/Cluster/Lava-See); der Region-Hash bricht Gleichstände
            // (HISM-kohärent). Affinität unberührt (Variante, nicht Art).
            const idx = this._landmarkVariantIdx(
                landmarkPool.prefix,
                landmarkPool.n,
                regX,
                regZ,
                this._slopeAt(sampleX, sampleZ),
                worldSeed
            );
            const key = `${landmarkPool.prefix}_var${idx}`;
            if (this.state.blueprints && this.state.blueprints[key]) spawnName = key;
        }
        if (isTree) {
            // Bäume kommen NICHT aus diesem per-Sample-Einzelsieger, sondern aus dem Wald-Generator
            // (`_forestPlantChunk`, aus `_populateVoxelChunkVegetation`) — EINE Quelle. Der Baum-Slot ist hier nur
            // Wald-Zonen-Marker; der Unterwuchs (probe-fail-Zweig oben) bleibt an diesem Sample-Raster.
            return 0;
        }
        // Yaw aus eigenen Seed-Bits — Bäume UND Felsen (alle ~radial-symmetrisch
        // im Footprint → der Quadrat-AABB der Kollision über-deckt; Gotcha).
        const yawRoll = (rng.noise2D(sampleX * 0.71 - 5.2, sampleZ * 0.71 + 3.9) + 1) / 2;
        spawnYaw = yawRoll * Math.PI * 2;

        this._enqueueVegetationSpawn(
            spawnName,
            { x: sampleX, y: surfaceY + 0.5, z: sampleZ },
            {
                seed: seedForSpawn,
                silent: true,
                scale: spawnScale,
                rotationY: spawnYaw,
            }
        );
        // Kein Totholz hier: der Snag gehört zur Wald-Ökologie (`_forestPlantChunk`), nicht zum Fels-/
        // Landmark-Raster.
        return 1;
    }

    // Per-Frame-Spawn-Budget: FIFO-Queue, `_tickPendingVegSpawns` arbeitet sie mit Frame-Limit ab;
    // Welt-Wechsel/Reload räumt sie. `this._vegSpawnImmediate === true` (Test/Worldgen) spawnt synchron.
    _enqueueVegetationSpawn(name, position, opts) {
        // Ein Wurf des Feldes (Wald, Unterholz, Totholz, Fels-Streu): wo die Wildnis nicht trägt, fällt er.
        if (!this._wildnisTraegt(position.x, position.z)) return;
        if (this._vegSpawnImmediate) {
            this._naturSetzen(name, position, opts);
            return;
        }
        if (!this.state.pendingVegSpawns) this.state.pendingVegSpawns = [];
        this.state.pendingVegSpawns.push({ name, position, opts });
    }

    // DIE EINE WAND „Natur weicht dem Bau" (Welle L, Q5/Q15, Entscheid D3): JEDE Quelle der Natur setzt durch sie — Wald,
    // Unterholz, Totholz und Fels-Streu (`_enqueueVegetationSpawn`), der Hof-Baum, die Streu-Zelle jeder Schicht
    // (`_scatterPass`), ihre Promotion zum echten Baum (`_promoteScatterCell`), die Nah-Streu (`_nahStreuKachel`) und der
    // Hain der KI (`spawn_tree`, `spawn_studio`). Liegt der Ort in einem Grundriss (`_imGrundriss`: ein Haus, die Lichtung
    // der Genesis-Plattform — dort mit der Krone des Wurfs, `_naturKrone`), fällt der Wurf (null); sonst baut `setzen` (eine
    // Quelle mit eigenem Bau: Instanz-Slots, Kachel-Pflanze) bzw. der Architektur-Eintrag `name`. Was vor dem Bau stand,
    // räumt `_grundrissRaeumen`. Vorher wuchsen 7 Bäume in 5 von 8 Häusern des Start-Dorfs, eine Birke im Türblatt, Wildwald
    // in den Gassen der Stadt (N-D5, S-W4), und die Streu lief an der Wand vorbei; an der Genesis-Scheibe wich nur der Wald
    // (ein eigener Filter im Pflanz-Gang): 28 promotete Bäume, 23 Streu-Zellen, 4 Kachel-Pflanzen und der Hain der KI standen
    // über ihr (gate:haus-welt W8). `absage(wo)` hört, wo ein Wurf fiel ("haus" | "lichtung") — der Hain der KI und des
    // Chats sagt es laut (`_ergebnisSatz`), nie still „gewachsen". Seit Welle L Folge setzt auch der Spieler durch sie:
    // der Bau-Modus (`confirmBuild`) und sein Phantom (`tickBuildMode`, das Urteil `_naturWand`).
    _naturSetzen(name, position, opts, setzen, absage) {
        const wo = this._naturWand(name, position, opts);
        if (wo) {
            if (absage) absage(wo);
            return null;
        }
        // die Wurzel nennt ihre Absage durch dieselbe Absage (`opts.absage`)
        return setzen
            ? setzen()
            : this.spawnArchitecture(name, position, absage ? Object.assign({}, opts, { absage }) : opts);
    }

    // Das Urteil der Natur-Wand für einen Wurf an `position` ("haus" | "lichtung" | "wagen" | "wasser" | false) — der EINE Leser von
    // Grundriss und Krone; `_naturSetzen` setzt danach, das Bau-Phantom färbt sich danach. NATUR WEICHT DEM WASSER (Schau-2
    // wasser-wahrheit): ein benannter Wurf steht nie, wo sein Fuß kein Land ist (`_stammFussLand`: die Achse und der
    // Fuß-Kreis, 5 cm über dem Spiegel — der Wald plante bis dahin gegen den Bezug der Ufer-Bänder, das Bau-Phantom stand am
    // Fluss grün, und die Wand fragte bis zur Gegenprüfung nur die Achse). Die Nah-Streu (ohne
    // Namen) urteilt selbst, ihr Schilf steht im Ufer-Wasser.
    _naturWand(name, position, opts) {
        if (!position) return false;
        const g = this._ortWand(name, position, opts);
        if (g) return g;
        if (this._imWagen(position.x, position.z, 0.8)) return "wagen";
        return name && !this._stammFussLand(position.x, position.z, 0.05) ? "wasser" : false;
    }

    // DIE WAND DES ORTS (K20): der Grundriss (`_imGrundriss`, die Krone des Wurfs) — die Hälfte der Natur-Wand, die der Ort
    // trägt. Der Wagen fährt und das gezeichnete Wasser folgt dem Laden der Chunks: beide urteilen nur über das Setzen
    // (`_naturWand`); das Wasser des Gesetzes trägt schon der Dart (`planForestCell`). Leser: `_naturWand` und das Wald-Gesetz
    // des Solitärs (`_forestStehtFrei`), dessen Antwort `_ortGestaltSame` am Stand der Grundrisse merkt.
    _ortWand(name, position, opts) {
        return this._imGrundriss(position.x, position.z, 0.8, this._naturKrone(name, opts));
    }

    // Liegt (x, z) in der Hülle eines Studio-Wagens (+ `rand`, der Stamm; eine Krone darf über das Dach)? Ein Wagen ist Bau,
    // nie Natur — aber kein Grundriss: er fährt, kein Haus räumt (`_grundrissRaeumen`) die Natur aus ihm, nur die Natur-Wand
    // (`_naturWand`) wirft keinen Baum in ihn (K12 Fahr-Bahn — Befund: nach dem Platz des Vorschau-GT setzte die Wald-Schlange,
    // `_tickPendingVegSpawns`, eine Tanne 2,1 m vor seinen Ursprung, in die Hülle; W 2 s brachte 0,08 m). Je Frage zählt die
    // lebende Lage der Wagen (das Blocker-Netz, wenige je Welt).
    _imWagen(x, z, rand) {
        for (const w of this._blockerMit("moveable")) {
            if (!w._fahrAchseX || !w.position) continue;
            const dx = x - w.position.x;
            const dz = z - w.position.z;
            const u = this._fahrUmriss(w);
            if (dx * dx + dz * dz > (Math.max(u.bug, -u.heck) + u.hw + rand) ** 2) continue;
            const ry = Number.isFinite(w._rideYaw)
                ? w._rideYaw
                : (Number.isFinite(w.rotationY) ? w.rotationY : 0) + Math.PI / 2;
            const l = dx * Math.sin(ry) + dz * Math.cos(ry);
            const q = dx * Math.cos(ry) - dz * Math.sin(ry);
            if (l >= u.heck - rand && l <= u.bug + rand && Math.abs(q) <= u.hw + rand) return true;
        }
        return false;
    }

    // Steht der Fuß eines Stamms an (x, z) auf dem Land? Die Achse und acht Punkte auf dem Fuß-Kreis (`STAMM_FUSS_M`) fragen
    // das Land eines Werks (`_landAt`, `marge` m über dem Spiegel) — die Achse zuerst (der billige Beweis). Leser: die
    // Natur-Wand (`_naturWand`) und die Würfe des Satzes (`_dslSpawnStudioItems`).
    _stammFussLand(x, z, marge) {
        if (!this._landAt(x, z, marge)) return false;
        const R = AnazhRealm.STAMM_FUSS_M;
        for (let k = 0; k < 8; k++) {
            const a = (k * Math.PI) / 4;
            if (!this._landAt(x + Math.cos(a) * R, z + Math.sin(a) * R, marge)) return false;
        }
        return true;
    }

    // STEHT DAS WERK IM WASSER? (Schau-2 wasser-wahrheit, Gegenprüfung) — das Urteil für ein Werk mit Grundriss-Gesetz
    // (`_werkGrundriss`: Haus, Tempel, Ausstattung) am Ort `position` mit der Drehung `opts.rotationY`: sein ganzes Fundament
    // samt dem Vorplatz der Haustür auf dem Land (`_fundamentLand`)? false für jedes Werk ohne Grundriss-Gesetz (Natur
    // urteilt die Natur-Wand am Stamm; Fahrzeug und Tor fragt der Satz an ihrem Ort). `seed`: der Same des Werks (die Wurzel
    // reicht ihren, sonst `opts.seed`). Leser: die Wurzel (`spawnArchitecture`) und die Ort-Suche (`_werkOrtSuchen`).
    _werkImWasser(type, position, opts, seed) {
        if (!position) return false;
        const g = this._werkGrundriss(type, opts, seed);
        if (!g) return false;
        const ry = opts && Number.isFinite(opts.rotationY) ? opts.rotationY : 0;
        return !this._fundamentLand(position.x, position.z, ry, g.fp, g.tuer, g.sockel);
    }

    // DER ORT EINES WERKS AM UFER (Schau-2 wasser-wahrheit, Gegenprüfung): wo die Welt ein Werk mit Grundriss-Gesetz hinstellt
    // (der Satz, der Tempel des Nexus, ein Programm), sucht sie den Ort, an dem sein ganzes Fundament auf dem Land steht —
    // `pos` selbst, sonst den nächsten in Ringen um den geklemmten Ort (1,5 m Schritt bis zur Reichweite des Grundrisses + 3 m
    // + Weg der Klemme, zwölf Richtungen ab dem Winkel `wurf()`, dem Strom des Samens). Geurteilt wird am Ort NACH der Spieler-Klemme der Wurzel
    // (`_structureSpawnPos`), wie die Wurzel urteilt (`_werkImWasser`). „am Wasser" liefert den Fleck 2 m hinter dem Ufer —
    // ein Stamm steht dort, ein Haus reicht 4–6 m ins Wasser. Rückgabe { x, y, z } (y wie `pos` über dem Boden) oder null
    // (kein tragender Ort in Reichweite). Ein Werk ohne Grundriss-Gesetz: `pos` geklemmt.
    // DAS MASS IST DER GEKLEMMTE ORT `p0` (werk-ufer): wo die Wurzel das Werk hinstellt, ist `pos` nach der Spieler-Klemme;
    // die Ringe liegen um `p0`, so weit, dass sie den Grundriss um `pos` decken, und jeder Kandidat misst sich (geklemmt) an
    // `p0`. Gemessen an `pos` lag jeder Kandidat nahe am Spieler auf dem Kreis der Klemme, alle fast gleich weit — das Maß
    // verlor die Richtung des Verlangten: am Gleithang −910/−623 (3,96 m vom Wasser) stand das Haus 13,5 m vom Wasser.
    _werkOrtSuchen(type, pos, opts, wurf) {
        const sc = opts && Number.isFinite(opts.scale) && opts.scale > 0 ? opts.scale : 1;
        const klemme = (p) => this._structureSpawnPos(type, p, { state: this.state }, sc);
        const p0 = klemme(pos);
        const g = this._werkGrundriss(type, opts);
        if (!g) return p0;
        if (!this._werkImWasser(type, p0, opts)) return p0;
        const reich =
            Math.hypot(g.fp.ex, g.fp.ez) + Math.hypot(g.fp.ox, g.fp.oz) + 3 + Math.hypot(p0.x - pos.x, p0.z - pos.z);
        const h0 = this.getTerrainHeightAt(p0.x, p0.z);
        const a0 = wurf() * Math.PI * 2;
        const kand = [];
        for (let r = 1.5; r <= reich; r += 1.5) {
            // je Ring so viele Richtungen, dass der Bogen ≤ 1,5 m bleibt (der Ring-Schritt): zwölf ließen auf 12 m Radius
            // 6,3 m zwischen zwei Kandidaten — das Haus am Ufer stand 12 m vom Wasser, wo 3 m trugen
            const n = Math.max(12, Math.ceil((2 * Math.PI * r) / 1.5));
            for (let k = 0; k < n; k++) {
                const a = a0 + (k * 2 * Math.PI) / n;
                const x = p0.x + Math.cos(a) * r;
                const z = p0.z + Math.sin(a) * r;
                const h = this.getTerrainHeightAt(x, z);
                const q = klemme({ x, y: Number.isFinite(h) && Number.isFinite(h0) ? p0.y + h - h0 : p0.y, z });
                kand.push([Math.hypot(q.x - p0.x, q.z - p0.z), q]);
            }
        }
        kand.sort((a, b) => a[0] - b[0]);
        for (const [, q] of kand) if (!this._werkImWasser(type, q, opts)) return q;
        return null;
    }

    // DAS ERGEBNIS EINES SETZ-OPS (Schau-2 wasser-wahrheit, Gegenprüfung Runde 3): jeder Op, der etwas in die Welt setzt
    // (Kreatur, Baum, Studio-Werk, Insel, UFO, Dorf, Tempel, Wasserfall, Bauplan, Fraktal), legt EINMAL ins Log, was tatsächlich
    // steht — gewollt, gesetzt, je gefallenem Wurf sein Grund (`SETZ_GRUND`: die Wand, das Budget, die Obergrenze, das Buch,
    // die Wurzel nennt ihren über `opts.absage`) —; ein Bau, der folgt (das Dorf), trägt seinen Satz (`folgt`) und meldet sein
    // Ergebnis selbst, wenn er steht. Der Satz des Spielers (`_ergebnisSatz`) liest nur das.
    _setzErgebnis(ctx, op, gewollt, gesetzt, gruende, art, verb, folgt) {
        ctx.log.push({
            event: "ergebnis",
            op,
            gewollt,
            gesetzt,
            gruende: Object.assign({}, gruende),
            art: art || null,
            verb: verb || "gesetzt",
            folgt: folgt || null,
        });
    }

    // DER SATZ DES ERGEBNISSES nach einem Programm (Leser: der Chat, der KI-Begleiter, die geteilte Stimme): setzte ein Op
    // weniger, als gewollt war, oder folgt sein Bau noch, sagt der Satz, was TATSÄCHLICH steht und warum der Rest nicht — je Op
    // und Art zusammengefasst („3 von 10 Kreaturen erschienen — 7 nicht: …", „Hier steht nichts: …", „Das Dorf wird gebaut
    // …"); der Wunsch des Parsers (`describe`) steht nur, wenn alles stand. Ein gefallener Wurf ohne Grund heißt „unbenannt"
    // (die Linse verbietet ihn). { satz } oder null. Befunde: „Baum gepflanzt" bei 0 Bäumen auf der Genesis-Plattform
    // (Welle L, D3); „6× Birke … gewachsen" bei 2 (Runde 2); „10 Kreaturen gespawnt" bei 3, 0 und 0, „tempel vor dir gebaut"
    // bei 0, „dorf vor dir gebaut" im See bei 0 (Runde 3).
    _ergebnisSatz(log) {
        const ops = new Map();
        for (const e of log || []) {
            if (!e || e.event !== "ergebnis") continue;
            const key = e.op + "|" + (e.art || "");
            let a = ops.get(key);
            if (!a) ops.set(key, (a = { art: e.art, verb: e.verb, gewollt: 0, gesetzt: 0, gruende: {}, folgt: null }));
            a.gewollt += e.gewollt || 0;
            a.gesetzt += e.gesetzt || 0;
            if (e.folgt) a.folgt = e.folgt;
            for (const k of Object.keys(e.gruende || {})) a.gruende[k] = (a.gruende[k] || 0) + e.gruende[k];
        }
        const liste = [...ops.values()];
        if (!liste.some((a) => a.folgt || a.gesetzt < a.gewollt)) return null;
        const G = AnazhRealm.SETZ_GRUND;
        const PRAESENS = { gewachsen: "wächst", gebaut: "steht", erschienen: "erscheint", gerufen: "erscheint" };
        const saetze = liste.map((a) => {
            if (a.folgt) return a.folgt;
            const fehl = a.gewollt - a.gesetzt;
            if (!(fehl > 0)) return `${a.gesetzt} ${a.art || ""} ${a.verb}.`.replace(/\s+/g, " ");
            let benannt = 0;
            for (const k of Object.keys(a.gruende)) benannt += a.gruende[k];
            if (benannt < fehl) a.gruende.unbenannt = fehl - benannt;
            const g = Object.keys(a.gruende)
                .filter((k) => a.gruende[k] > 0)
                .map((k) => (k === "obergrenze" ? `${G.obergrenze} (höchstens ${this.state.maxCreatures})` : G[k] || k))
                .join("; ");
            if (a.gesetzt)
                return `${a.gesetzt} von ${a.gewollt} ${a.art || ""} ${a.verb} — ${fehl} nicht: ${g}.`.replace(
                    / {2,}/g,
                    " "
                );
            const ort =
                a.gruende.lichtung || a.gruende.haus || a.gruende.bau || a.gruende.weg || a.gruende.wasser
                    ? " — geh ein paar Schritte weiter"
                    : "";
            const praes = PRAESENS[a.verb] || "steht";
            return liste.length > 1 ? `${a.art}: hier ${praes} nichts — ${g}.` : `Hier ${praes} nichts: ${g}${ort}.`;
        });
        return { satz: saetze.join(" ") };
    }

    // Das Wort des Spielers für ein Werk (Leben-Schau 07.10., V-D8): das Label seines Bauplans bis zum ersten Zusatz („Eiche",
    // „Alemannisch"), nie die interne id. Leser: der Studio-Satz (`describe`) und der Satz des Ergebnisses.
    _werkLabel(name) {
        const bp = this.state.blueprints && this.state.blueprints[name];
        return String((bp && bp.label) || name).split(/\s[·—(]/)[0];
    }

    // Die Krone eines Natur-Wurfs in der Welt (m) — wie weit er über seinen Ort reicht: der EINE Kronen-Radius seiner Art
    // (`_kronenRadiusFuer`: `FOREST.crown[art] × Größe`, die Kronen-Schüchternheit T des Wald-Gesetzes) × die Welt-Skala der
    // Art (`_foundryWorldScaleMatrix`, dieselbe, mit der der Baum gezeichnet wird); 0 für alles ohne Krone. Die Art:
    // `_lodSpecies` (Wald, Eintrag), die gewachsene Art des Bauplans (Promotion: `grown_…` → `_grownSpecies`), sonst der
    // Name; die Größe: `scale` (Wurf-Optionen, Streu-Zelle oder Eintrag). Gemessen 06.10. (echte GPU, die weiteste
    // Ast-Spitze der gezeichneten Instanz): die Studio-Tanne trägt bei T 3,0 m Äste bis 11,7 m, die Fichte bei T 2,6 m bis
    // 13,2 m, die Birke bei T 3,6 m bis 12,4 m. Je Art einmal gerechnet (die Streu fragt je Zelle); die LIVE-Quelle der
    // Welt-Skala (`PORTAL_RENDER_CONFIG.placement`) und das Buch (seine Wald-Arten) leeren den Merker mit ihrer Identität.
    _naturKrone(name, o) {
        const bp = name && this.state.blueprints ? this.state.blueprints[name] : null;
        const art = (o && o._lodSpecies) || (bp && bp._isGrown && bp._grownSpecies) || name;
        if (!art) return 0;
        const rc = AnazhRealm._studioRenderConfig;
        const quelle = rc && rc.placement ? rc.placement : null;
        const buch = this._foundry ? this._foundry.recipes : null;
        if (!this._kroneWeltK || this._kroneWeltQuelle !== quelle || this._kroneWeltBuch !== buch) {
            this._kroneWeltK = new Map();
            this._kroneWeltQuelle = quelle;
            this._kroneWeltBuch = buch;
        }
        let k = this._kroneWeltK.get(art);
        if (k === undefined) {
            // jede Baum-Art trägt eine Krone: die des Wald-Gesetzes (phyto-core planForestCell: `FOREST.crown[art] || 4`) —
            // `_kronenRadiusFuer` kennt nur die Wald-Arten (die Kronen-Karte malt den Wald), die Streu-Bäume (Buche, Palme,
            // Zypresse, Karst) tragen die 4 m des Gesetzes
            const t = /^baum_/.test(art) ? this._kronenRadiusFuer(art, 1) || 4.0 : 0;
            k = t ? t * (this._foundryWorldScaleMatrix(this._foundryPresetFor(art)).elements[0] || 1) : 0;
            this._kroneWeltK.set(art, k);
        }
        return k > 0 ? k * (o && Number.isFinite(o.scale) && o.scale > 0 ? o.scale : 1) : 0;
    }

    // Liegt (x, z) in einem Grundriss (`_grundrissVon`) oder auf der Fläche eines Dorfs (`_aufWeg`)? Drei Arten tragen einen
    // Grundriss: die Häuser einer Siedlung (die gedrehte Box um ihre Mitte plus `rand` — der Stamm, die Traufe; eine Krone
    // darf über das Dach), jeder andere Bau (die Hülle seiner Blocker-Boxen, K52: Tor, Esse, Brunnen, der Würfel des Spielers)
    // und die Lichtung eines Baus, dessen Bauplan sie trägt (der Genesis-Platz: Scheibe und Ring der Tore plus die Reichweite
    // des Wurfs, `max(rand, krone)` — über ihm steht keine Krone). Das Gitter (32 m, Zahlen-Schlüssel — die Streu fragt je
    // Zelle) hält die Bauten, die Lichtungen stehen daneben (eine je Welt); es entsteht faul aus den Einträgen und fällt bei
    // jedem Spawn/Abriss eines Baus mit Grundriss. Rückgabe: "lichtung" | "haus" | "bau" | "weg" | false.
    _imGrundriss(x, z, rand = 0.8, krone = 0) {
        const G = AnazhRealm.GRUNDRISS_ZELLE;
        const schluessel = AnazhRealm._grundrissSchluessel;
        const gitter = this._grundrissStand();
        const reich = Math.max(rand, krone);
        for (const L of gitter.lichtungen) if ((x - L.x) ** 2 + (z - L.z) ** 2 < (L.r + reich) ** 2) return "lichtung";
        const l = gitter.zellen.size ? gitter.zellen.get(schluessel(Math.floor(x / G), Math.floor(z / G))) : null;
        if (l)
            for (const e of l) {
                const fp = this._grundrissVon(e);
                if (!fp) continue;
                // die Hülle eines Baus liegt achsparallel in der Welt (`welt`), das Haus gedreht um seine Gier
                const ry = fp.welt ? 0 : Number.isFinite(e.rotationY) ? e.rotationY : 0;
                const c = Math.cos(ry);
                const sn = Math.sin(ry);
                const dx = x - e.position.x;
                const dz = z - e.position.z;
                if (
                    Math.abs(dx * c - dz * sn - fp.ox) <= fp.ex + rand &&
                    Math.abs(dx * sn + dz * c - fp.oz) <= fp.ez + rand
                )
                    return fp.welt ? "bau" : "haus";
            }
        return this._aufWeg(x, z, rand) ? "weg" : false;
    }

    // Liegt (x, z) auf einer Fläche, die ein Dorf dem Boden gibt (K52) — Straße, Feldweg, Platz, Anger, Acker, die
    // Trittfläche einer Ausstattung: die Formen der EINEN Wege-Karte (`wegeKarte.siedlungen`, je Siedlung ihre Hülle als
    // Vorfilter), dieselben Abstände, mit denen `_wegeKarteMale` den Boden malt, plus `rand` (der Stamm; eine Krone darf
    // über den Weg; der Gras-Anger trägt seine eigene Grenze `sperr`). Das Gesetzbuch des Dorfs pflanzt seine Bäume nach
    // derselben Regel neben Weg, Platz und Acker (fachwerk-core). Vorher urteilte nur die Wiese über den Weg: im Dorf der
    // Zelle −4,−4 standen 3 Tannen und 1 Birke auf seinen Wegen. Die Flächen stehen im Gitter der Grundrisse (`wege`, jede
    // Fläche mit 1 m Rand — der Stamm-Rand ist 0,8 m): die Frage kostet die Flächen ihrer Zelle, nie alle besuchten Dörfer.
    _aufWeg(x, z, rand) {
        const G = AnazhRealm.GRUNDRISS_ZELLE;
        const l = this._grundrissStand().wege.get(
            AnazhRealm._grundrissSchluessel(Math.floor(x / G), Math.floor(z / G))
        );
        if (!l) return false;
        for (const b of l) {
            if (x < b.x0 - rand || x > b.x1 + rand || z < b.z0 - rand || z > b.z1 + rand) continue;
            for (const f of b.formen)
                if (AnazhRealm._wegeFormAbstand(f, x, z) < (f.sperr !== undefined ? f.sperr : rand)) return true;
        }
        return false;
    }

    // DER STAND DER GRUNDRISSE (K20): das Gitter der Häuser, Bauten, Lichtungen und Dorf-Flächen, faul aus den Einträgen und
    // der Wege-Karte gebaut; es fällt bei jedem Spawn/Abriss eines Baus mit Grundriss und mit jeder Fläche, die die Wege-Karte
    // gewinnt oder verliert (K52), sein Objekt IST der Stand. Leser: `_imGrundriss` und wer eine Antwort merkt, die
    // durch die Natur-Wand geht (die Gestalt des Orts `_foundryGestaltFor`, die Streu-Gestalt `_scatterFoundrySeed`: ein
    // neues Haus über einem Nachbarn macht den Baum daneben frei).
    _grundrissStand() {
        if (this._grundrissGitter) return this._grundrissGitter;
        const G = AnazhRealm.GRUNDRISS_ZELLE;
        const gitter = (this._grundrissGitter = { zellen: new Map(), lichtungen: [], wege: new Map() });
        for (const e of this.state.architectures || []) {
            const fp = this._grundrissVon(e);
            if (!fp) continue;
            if (fp.lichtung) {
                gitter.lichtungen.push({ x: e.position.x, z: e.position.z, r: fp.lichtung });
                continue;
            }
            const r = Math.hypot(fp.ex, fp.ez) + Math.hypot(fp.ox, fp.oz) + 2;
            for (let gx = Math.floor((e.position.x - r) / G); gx <= Math.floor((e.position.x + r) / G); gx++)
                for (let gz = Math.floor((e.position.z - r) / G); gz <= Math.floor((e.position.z + r) / G); gz++) {
                    const k = AnazhRealm._grundrissSchluessel(gx, gz);
                    let l = gitter.zellen.get(k);
                    if (!l) gitter.zellen.set(k, (l = []));
                    l.push(e);
                }
        }
        // die Flächen der Dörfer (`_aufWeg`): jede Hülle der Wege-Karte in die Zellen, die sie mit 1 m Rand berührt
        const wk = this.state.wegeKarte;
        if (wk)
            for (const b of wk.siedlungen)
                for (let gx = Math.floor((b.x0 - 1) / G); gx <= Math.floor((b.x1 + 1) / G); gx++)
                    for (let gz = Math.floor((b.z0 - 1) / G); gz <= Math.floor((b.z1 + 1) / G); gz++) {
                        const k = AnazhRealm._grundrissSchluessel(gx, gz);
                        let l = gitter.wege.get(k);
                        if (!l) gitter.wege.set(k, (l = []));
                        l.push(b);
                    }
        return gitter;
    }

    // Ist der Eintrag Natur? Die Art steht am Eintrag (`_lodSpecies` des Walds, die Bauplan-Präfixe baum_/busch_/grown_,
    // der Totholz-Stamm) — unabhängig davon, ob das Studio-Buch schon geladen ist; sonst trägt das Gesetzbuch des
    // Terrain-Studios seine Art (`terrain:PHYTO_PRESETS`: Baum, Strauch, Fels, Farn, Totholz …; der Kern ist Pflicht —
    // unlesbar ist ein lauter Bruch, nie ein stilles „keine Natur", das nichts mehr räumt). Tor und Wagen sind nie Natur
    // (sie tragen auch eine Impostor-Zeile — die frühere Frage `_foundryPresetIsTree` hätte sie geräumt).
    _istNatur(e) {
        if (!e || typeof e.type !== "string") return false;
        if (e._lodSpecies || e.type === "stamm_gefallen" || /^(baum_|busch_|grown_)/.test(e.type)) return true;
        const tab =
            AnazhRealm.Gesetz("terrain:PHYTO_PRESETS", null) || AnazhRealm._kernPflichtBruch("terrain:PHYTO_PRESETS");
        const pr = this._foundryPresetForEntry(e);
        return !!(pr && Object.prototype.hasOwnProperty.call(tab, pr));
    }

    // Der Grundriss eines Baus (halbe Maße und Mitte, bau-lokal): der Footprint eines Hauses — oder die LICHTUNG eines Baus,
    // dessen Bauplan sie trägt (`lichtung`: die Genesis-Plattform, Befund V-D1): der GENESIS-PLATZ, die Scheibe des Bauplans
    // (cylinder, size.x = Durchmesser × die Größe des Eintrags) und der Ring der Tore um sie (`GENESIS_PLATZ`: Kreis plus
    // Tiefe eines Tors), `lichtung` = sein Radius (die Wand fragt dort die Krone) — oder, für jeden anderen Bau, die Hülle
    // seiner Blocker-Boxen (`welt`: achsparallel in der Welt, K52). Null für Natur, für was fährt (der Wagen urteilt über
    // `_imWagen`, er räumt nichts) und für einen Bau ohne Boxen.
    _grundrissVon(e) {
        if (!e || !e.position) return null;
        const f = e.fundament;
        if (f && Number.isFinite(f.ex) && Number.isFinite(f.ez))
            return { ex: f.ex, ez: f.ez, ox: Number.isFinite(f.ox) ? f.ox : 0, oz: Number.isFinite(f.oz) ? f.oz : 0 };
        const t = e.tuer;
        if (t && Number.isFinite(t.W) && Number.isFinite(t.D)) return { ex: t.W / 2, ez: t.D / 2, ox: 0, oz: 0 };
        // DIE HÜLLE TRÄGT DEN GRUNDRISS (K16, gate:kamera-leib K2): ein Haus ohne Fundament- und Tür-Zeile (gesetzt vom
        // Spieler, der KI, einer Probe) hatte keinen — die Natur wuchs hinein (eine Kiefer im haus_alemannisch der
        // Mess-Wiese). Die festen Boxen der Studio-Hülle (`_hausHuelleSetzen`) sind sein Grundriss, gemerkt je Hülle.
        const hu = e._hausHuelle;
        if (hu) {
            const m = e._grundrissHuelle;
            if (m && m.hu === hu) return m.fp;
            const fest = AnazhRealm._huelleVon(hu, "fest", "fachwerk:__huelle") || [];
            let x0 = Infinity,
                x1 = -Infinity,
                z0 = Infinity,
                z1 = -Infinity;
            for (const q of fest)
                if (q.art === "box") {
                    x0 = Math.min(x0, q.c[0] - q.h[0]);
                    x1 = Math.max(x1, q.c[0] + q.h[0]);
                    z0 = Math.min(z0, q.c[2] - q.h[2]);
                    z1 = Math.max(z1, q.c[2] + q.h[2]);
                }
            const k = Number.isFinite(e._hausHuelleSkala) ? e._hausHuelleSkala : 1;
            const fp =
                x1 > x0 && z1 > z0
                    ? {
                          ex: ((x1 - x0) / 2) * k,
                          ez: ((z1 - z0) / 2) * k,
                          ox: ((x0 + x1) / 2) * k,
                          oz: ((z0 + z1) / 2) * k,
                      }
                    : null;
            e._grundrissHuelle = { hu, fp };
            if (fp) return fp;
        }
        const bp = this.state.blueprints ? this.state.blueprints[e.type] : null;
        if (bp && bp.lichtung) {
            const p0 = Array.isArray(bp.parts) && bp.parts[0] && bp.parts[0].size;
            const g = Number.isFinite(e.scale) && e.scale > 0 ? e.scale : 1;
            const P = AnazhRealm.GENESIS_PLATZ;
            const r = Math.max(p0 && Number.isFinite(p0.x) ? (p0.x / 2) * g : 0, P.ringR + P.rand);
            return { ex: r, ez: r, ox: 0, oz: 0, lichtung: r };
        }
        // DER GRUNDRISS JEDES BAUS (K52): ein Tor, eine Esse, ein Brunnen, ein Marktstand, der Würfel des Spielers trugen
        // keinen — die Natur warf in sie (am Genesis-Ring ein Kristall 1,2 m vor dem Tor des Terrain-Studios). Die Hülle seiner
        // Blocker-Boxen (die Welt-AABB jeder Box) ist sein Grundriss, gemerkt je Box-Satz; die billigen Filter zuerst.
        const boxen = e.blockerAABBs;
        if (!boxen || !boxen.length) return null;
        const m = e._grundrissBoxen;
        if (m && m.satz === boxen) return m.fp;
        let fp = null;
        if (!(e.affordances && e.affordances.moveable) && !this._istNatur(e)) {
            let x0 = Infinity,
                x1 = -Infinity,
                z0 = Infinity,
                z1 = -Infinity;
            for (const b of boxen) {
                if (b.minX < x0) x0 = b.minX;
                if (b.maxX > x1) x1 = b.maxX;
                if (b.minZ < z0) z0 = b.minZ;
                if (b.maxZ > z1) z1 = b.maxZ;
            }
            if (x1 > x0 && z1 > z0)
                fp = {
                    ex: (x1 - x0) / 2,
                    ez: (z1 - z0) / 2,
                    ox: (x0 + x1) / 2 - e.position.x,
                    oz: (z0 + z1) / 2 - e.position.z,
                    welt: true,
                };
        }
        e._grundrissBoxen = { satz: boxen, fp };
        return fp;
    }

    // Das Grundriss-Gesetz einer Art: { preset, pre (die Zeile des Gesetzbuchs der Architektur), rec (die des Buchs) } für ein
    // Haus oder eine Ausstattung, sonst null (auch bei kaltem Buch).
    _grundrissGesetz(type) {
        const preset = this._foundryPresetForEntry({ type });
        const buch = this._foundry && this._foundry.recipes;
        const rec = preset && buch ? buch[preset] : null;
        if (!rec || (rec.kind !== "haus" && rec.kind !== "ausstattung")) return null;
        const PRE = AnazhRealm.Gesetz("fachwerk:PRESETS", null) || AnazhRealm._kernPflichtBruch("fachwerk:PRESETS");
        const pre = PRE[preset];
        return pre ? { preset, pre, rec } : null; // ohne Zeile: die Art spricht ein anderes Gesetzbuch
    }

    // DER GRUNDRISS EINES WERKS VOR SEINEM BAU (Schau-2 wasser-wahrheit, Gegenprüfung): die Fläche, auf der es steht, aus
    // seinem Gesetz — bau-lokal { fp: {ex, ez, ox, oz}, tuer } oder null (ein Werk ohne Grundriss-Gesetz). Die Siedlung reicht
    // ihn mit (`opts.fundament` aus dem obb des Exports, sonst der Kern der Tür-Zeile `opts.tuer`, wie `_grundrissVon`); sonst
    // spricht das Gesetzbuch der Architektur: ein HAUS misst seinen Mass-Bau (fachwerk `massBau(hausParams(Rezept, Stempel))`
    // mit der Gestalt seines Samens — dieselbe Zeile, aus der der Export der Siedlung sein obb und seine Tür nimmt, und der
    // Bau, den der Worker für diesen Samen baut: `_foundryVariantFor`), die AUSSTATTUNG ihre Trittfläche (`fx.tritt` × Größe);
    // beides × die Welt-Skala der Gestalt (`_foundryWorldScaleMatrix`, die Skala der Hülle) × die Größe des Eintrags. Gemerkt je
    // Gestalt, Same, Größe und Stempel (der Mass-Bau baut das Haus einmal). Leser: `_werkImWasser`, `_werkOrtSuchen`.
    _werkGrundriss(type, opts, seed) {
        const o = opts || {};
        const f = o.fundament;
        if (f && Number.isFinite(f.ex) && Number.isFinite(f.ez))
            return {
                fp: { ex: f.ex, ez: f.ez, ox: Number.isFinite(f.ox) ? f.ox : 0, oz: Number.isFinite(f.oz) ? f.oz : 0 },
                tuer: o.tuer || null,
                sockel: AnazhRealm.FUNDAMENT_SOCKEL_M, // das Fundament trägt sein Podest (`_archFundamentBox`)
            };
        const t = o.tuer;
        if (t && Number.isFinite(t.W) && Number.isFinite(t.D))
            return { fp: { ex: t.W / 2, ez: t.D / 2, ox: 0, oz: 0 }, tuer: t };
        const art = this._grundrissGesetz(type);
        if (!art) return null;
        const { preset, pre, rec } = art;
        const same = Number.isFinite(seed) ? seed : o.seed;
        const gestalt = this._foundryVariantFor(Number.isFinite(same) ? same : 0, preset);
        if (gestalt == null) return null; // Buch kalt: kein Grundriss, kein Urteil (die Wurzel blockiert den Bau ohnehin)
        const ov = o.studioOv && typeof o.studioOv === "object" && !Array.isArray(o.studioOv) ? o.studioOv : null;
        const k =
            (this._foundryWorldScaleMatrix(preset).elements[0] || 1) *
            (Number.isFinite(o.scale) && o.scale > 0 ? o.scale : 1);
        const key = `${preset}|${gestalt}|${k}|${ov ? JSON.stringify(ov) : ""}`;
        const M = this._werkGrundrissMerker || (this._werkGrundrissMerker = new Map());
        if (M.has(key)) return M.get(key);
        let g = null;
        if (rec.kind === "haus") {
            const hausParams =
                AnazhRealm.Gesetz("fachwerk:hausParams", null) || AnazhRealm._kernPflichtBruch("fachwerk:hausParams");
            const massBau =
                AnazhRealm.Gesetz("fachwerk:massBau", null) || AnazhRealm._kernPflichtBruch("fachwerk:massBau");
            const p = hausParams(pre, ov);
            if (!(ov && ov.seed != null)) p.seed = gestalt;
            const B = massBau(p);
            const e = B && B.ext;
            if (e && [e.x0, e.x1, e.z0, e.z1].every(Number.isFinite)) {
                const dm = B.dims && B.dims.tuer;
                g = {
                    fp: {
                        ex: ((e.x1 - e.x0) / 2) * k,
                        ez: ((e.z1 - e.z0) / 2) * k,
                        ox: ((e.x0 + e.x1) / 2) * k,
                        oz: ((e.z0 + e.z1) / 2) * k,
                    },
                    tuer:
                        dm && [dm.x, dm.z, dm.w].every(Number.isFinite)
                            ? { x: dm.x * k, z: dm.z * k, w: dm.w * k }
                            : null,
                };
            }
        } else {
            const tr = pre.fx && pre.fx.tritt;
            const gr =
                (ov && Number.isFinite(ov.groesse)
                    ? ov.groesse
                    : pre.s && Number.isFinite(pre.s.groesse)
                      ? pre.s.groesse
                      : 1) * k;
            if (tr && tr.typ === "kreis" && tr.r > 0)
                g = { fp: { ex: tr.r * gr, ez: tr.r * gr, ox: 0, oz: 0 }, tuer: null };
            else if (tr && tr.ex > 0 && tr.ez > 0)
                g = { fp: { ex: tr.ex * gr, ez: tr.ez * gr, ox: 0, oz: 0 }, tuer: null };
        }
        if (M.size >= 256) M.clear();
        M.set(key, g);
        return g;
    }

    // Ein Bau mit Grundriss steht: was die Natur schon in ihn geworfen hat, fällt — der Wald und die Streu standen oft vor
    // dem Dorf (das Auto-Dorf entsteht ab 260 m, die Streu-Region reicht 384 m), und ein älterer Stand trägt Bäume über der
    // Genesis-Scheibe. Natur-Einträge (`_istNatur`), die lebenden Streu-Zellen jeder Schicht (`_streuZelleRaeumen`) und die
    // Nah-Streu-Kacheln über dem Grundriss (sie bauen durch die Wand neu); an einer Lichtung mit der Krone (`_naturKrone`,
    // die Suche reicht eine Streu-Region weiter). Der billige Orts-Filter zuerst, die Art-Frage nur für Betroffene
    // (Lehre 25). Leser: `spawnArchitecture` (die Wurzel jedes Baus mit Grundriss), `_hausHuelleSetzen` (die Hülle bringt ihn)
    // und das Laden. Gibt die Zahl der geräumten
    // Natur-Stücke.
    _grundrissRaeumen(haus) {
        const fp = this._grundrissVon(haus);
        if (!fp) return 0;
        const nenne = (e) => {
            const b = this.state.blueprints ? this.state.blueprints[e.type] : null;
            return `„${String((b && b.label) || e.type).split(/\s[·—(]/)[0]}"`;
        };
        return this._naturRaeumen(
            haus.position.x,
            haus.position.z,
            fp.ex + fp.ez + Math.abs(fp.ox) + Math.abs(fp.oz) + 3,
            !!fp.lichtung,
            fp.lichtung ? "dem Genesis-Platz" : `dem Grundriss von ${nenne(haus)}`,
            haus
        );
    }

    // DIE RÄUMUNG EINER FLÄCHE (K52): jede Natur im Quadrat ±r um (hx, hz), die die Natur-Wand dort nicht mehr setzte
    // (`_imGrundriss` — Grundriss, Lichtung samt Krone, Weg des Dorfs), fällt: Einträge, lebende Streu-Zellen, und die
    // Nah-Streu-Kacheln wachsen durch die Wand neu. Leser: `_grundrissRaeumen` (ein Bau) und `_wegeRaeumen` (die Fläche eines
    // Dorfs, im Takt der Wege-Karte). `mitKrone`: eine Lichtung fragt die Krone, die Suche reicht eine Streu-Region weiter.
    // `wem` nennt die Fläche im Spieler-Satz, `ausser` ist der Bau selbst. Gibt die Zahl der geräumten Natur-Stücke.
    _naturRaeumen(hx, hz, r, mitKrone, wem, ausser) {
        // die Welt regt sich, bevor geräumt wird: der Gang schreibt die Nah-Streu-Kacheln (`nahStreu.kacheln`, über
        // `_nahStreuKachelEntsorgen` ihren `zustand`) — die Stand-Wache weckt die Fege-Takte (gate:stand-takt, Schreiber-Wand)
        this._weltRegt();
        this._grundrissGitter = null;
        const RM = AnazhRealm.SCATTER.regionM;
        const weit = mitKrone ? RM : 0; // eine Krone reicht nie über eine Streu-Region
        const weg = [];
        for (const e of this.state.architectures || []) {
            if (e === ausser || !e.position) continue;
            if (Math.abs(e.position.x - hx) > r + weit || Math.abs(e.position.z - hz) > r + weit) continue;
            if (!this._istNatur(e)) continue;
            const k = mitKrone ? this._naturKrone(e.type, e) : 0;
            if (!this._imGrundriss(e.position.x, e.position.z, 0.8, k)) continue;
            weg.push(e);
        }
        for (const e of weg) this.removeArchitecture(e);
        // Ein Werk des Spielers (string-id: gesetzt im Bau-Modus) weicht nie still — die Räumung nennt es im Spieler-Kanal
        // (Welle L Folge: jede Zerstörung nennt sich dem Spieler; ein älterer Stand trug die Werkstatt-Eiche auf der Lichtung,
        // ein Dorf gründet über einem gepflanzten Baum).
        const eigene = weg.filter((e) => typeof e.id === "string");
        if (eigene.length) {
            const nenne = (e) => {
                const b = this.state.blueprints ? this.state.blueprints[e.type] : null;
                return `„${String((b && b.label) || e.type).split(/\s[·—(]/)[0]}"`;
            };
            this._spielerSagt(`${eigene.map(nenne).join(", ")} wich${eigene.length > 1 ? "en" : ""} ${wem}.`);
        }
        let n = weg.length;
        const map = this.state.scatterRegions;
        if (map && map.size) {
            for (let rx = Math.floor((hx - r - weit) / RM); rx <= Math.floor((hx + r + weit) / RM); rx++)
                for (let rz = Math.floor((hz - r - weit) / RM); rz <= Math.floor((hz + r + weit) / RM); rz++) {
                    const region = map.get(`${rx},${rz}`);
                    if (!region || !Array.isArray(region.cells)) continue;
                    for (const cell of region.cells) {
                        if (!cell.slots && !cell.feld) continue;
                        if (Math.abs(cell.x - hx) > r + weit || Math.abs(cell.z - hz) > r + weit) continue;
                        const k = mitKrone ? this._naturKrone(cell.species, cell) : 0;
                        if (!this._imGrundriss(cell.x, cell.z, 0.8, k)) continue;
                        this._streuZelleRaeumen(cell);
                        n++;
                    }
                }
        }
        const ns = this.state.nahStreu;
        if (ns && ns.kacheln.size) {
            const K = AnazhRealm.NAH_STREU.kachel;
            for (let tx = Math.floor((hx - r) / K); tx <= Math.floor((hx + r) / K); tx++)
                for (let tz = Math.floor((hz - r) / K); tz <= Math.floor((hz + r) / K); tz++) {
                    const k = ns.kacheln.get(`${tx},${tz}`);
                    if (!k) continue;
                    this._nahStreuKachelEntsorgen(k);
                    ns.kacheln.delete(k.key);
                }
        }
        return n;
    }

    // DIE FLÄCHEN EINES DORFS RÄUMEN (K52): jede neue Fläche der Wege-Karte (Weg, Platz, Anger, Acker einer Siedlung —
    // `_stlWegeBuild`; die Trittfläche einer Ausstattung — `_trittFlaecheSetzen`) wartet in `wegeKarte.raeumen`, bis der
    // Takt der Wege-Karte sie räumt (`_naturRaeumen` über ihre Hülle): die Trittfläche entsteht im Instanz-Pfad, mitten im
    // Gang über die Bauten. Die Wand (`_aufWeg`) gilt der Fläche sofort; geräumt wird, was schon vor ihr stand.
    _wegeRaeumen() {
        const wk = this.state.wegeKarte;
        if (!wk || !wk.raeumen.length) return 0;
        let n = 0;
        for (const b of wk.raeumen.splice(0))
            n += this._naturRaeumen(
                (b.x0 + b.x1) / 2,
                (b.z0 + b.z1) / 2,
                Math.max(b.x1 - b.x0, b.z1 - b.z0) / 2 + 1,
                false,
                "dem Weg des Dorfs",
                null
            );
        return n;
    }

    // Eine Streu-Zelle verlässt die Welt (ihr Ort liegt im Grundriss eines Hauses): ihre Instanz-Slots, ihr Gesetz-Platz,
    // ihre Krone in der Kronen-Karte und ihr Lookup-Eintrag fallen; slot-los promotet und wechselt sie nie mehr die Stufe
    // (Promotion und LOD-Takt überspringen `!cell.slots`). Der Neubau der Region setzt durch die Wand (`_scatterPass`).
    _streuZelleRaeumen(cell) {
        this._scatterFreeSlots(cell.slots);
        cell.slots = null;
        if (cell.feld) {
            this._scatterFeldFrei(cell.feld);
            cell.feld = null;
        }
        cell.bpName = null;
        const layerName = cell.layer || "tree";
        if (cell.promotable) {
            this._kronenStreuWeg(`s:${layerName}:${cell.cellX},${cell.cellZ}`);
            if (this.state.scatterLookup)
                this.state.scatterLookup.delete(this._scatterCellKeyAt(cell.x, cell.z, layerName));
        }
    }

    // Pops bis zu maxPerFrame Tasks und ruft `spawnArchitecture` je Task: 4/Frame ≈ 20-25 ms statt
    // 200-500-ms-Burst; ein 9-Chunk-Ring verteilt sich über ~10-25 Frames.
    _tickPendingVegSpawns(maxPerFrame = 4) {
        const queue = this.state.pendingVegSpawns;
        if (!queue || queue.length === 0) return 0;
        let spawned = 0;
        for (let i = 0; i < maxPerFrame && queue.length > 0; i++) {
            const task = queue.shift();
            if (!task) continue;
            this._naturSetzen(task.name, task.position, task.opts);
            spawned++;
        }
        return spawned;
    }

    // Wasser-Iso deferred: `_buildVoxelChunkWaterIsoSurface` ist ~78 ms Main-Thread (schwerster Posten im
    // Finalize). Der Chunk finalisiert sofort mit Terrain + Boden + Collision (kein Loch), der Wasser-Iso
    // wird enqueued und ≤budget/Frame gebaut — kein Pile-Up mehrerer Wasser-Chunks in einem Frame.
    _enqueueWaterIso(cx, cz) {
        if (!this.state.pendingWaterIso) this.state.pendingWaterIso = new Set();
        this.state.pendingWaterIso.add(`${cx},${cz}`);
    }

    // Wasser-Sheet OFF-THREAD im Worker. true = Anfrage abgesetzt (Worker bereit · "cells"-Default · 3×3
    // nicht aktiv-fließend [`_waterSheetCaFree`] · Chunk trägt Wasser), sonst false → Aufrufer baut SYNC.
    // BUILD-BEFORE-DISPOSE (altes Sheet bleibt bis zur Antwort) + STALE-Schutz (geprunt → weg; State-
    // Bump zwischen Request und Antwort → sync neu über `_buildVoxelChunkWaterIsoSurface`). Aufrufer:
    // Finalize (vor dem CA-Wake) + Streaming-Tick; Carve/Edit/Test bleiben sync.
    _tryWorkerWaterSheet(cx, cz) {
        if (!this.state.voxelWorker || !this.state.voxelWorkerReady || !this._waterSheetCaFree(cx, cz)) return false;
        const key = `${cx},${cz}`;
        const entry = this.state.voxelChunks ? this.state.voxelChunks.get(key) : null;
        if (!entry || !entry.waterCells) return false; // kein Wasser → der Aufrufer baut sync (Map null)
        const genAtRequest = this._voxelStand(cx, cz);
        this._workerBuildWaterSheet(cx, cz)
            .then((data) => {
                if (!this.state.voxelChunks || !this.state.voxelChunks.has(key)) return; // gepruned
                if (this._voxelStand(cx, cz) !== genAtRequest) {
                    // Welt-State driftete (Carve/Regen) → die gesendeten Zellen sind stale → sync neu.
                    this._buildVoxelChunkWaterIsoSurface(cx, cz);
                    return;
                }
                if (!data || data.empty) {
                    this._disposeVoxelChunkWaterIso(key);
                    if (this.state.voxelChunkWaterIso) this.state.voxelChunkWaterIso.set(key, null);
                    return;
                }
                this._finalizeWaterSheetMesh(cx, cz, key, data);
            })
            .catch((e) => {
                // ein Worker-Fehler bricht laut beim Namen (K22); das Blatt baut danach der Haupt-Thread nach demselben
                // Gesetz (bit-identischer Spiegel) — kein verlorenes Wasser
                this._stoffBruch("das Wasser-Blatt " + key + " (Worker)", e);
                if (this.state.voxelChunks && this.state.voxelChunks.has(key))
                    this._buildVoxelChunkWaterIsoSurface(cx, cz);
            });
        return true;
    }

    // Der Streaming-Tick-Pfad: Worker (off-thread) ODER sync-Fallback.
    _buildWaterSheetStreaming(cx, cz) {
        if (!this._tryWorkerWaterSheet(cx, cz)) this._buildVoxelChunkWaterIsoSurface(cx, cz);
    }

    _tickPendingWaterIso(maxPerFrame = 4, deadlineMs = Infinity) {
        const queue = this.state.pendingWaterIso;
        if (!queue || queue.size === 0) return 0;
        // Zeit-Budget zusätzlich zum Count-Budget: maxPerFrame deckelt nur die Anzahl (4 große Ozean-Isos =
        // 33 ms). Nach JEDEM Build gegen die Frame-Deadline prüfen (ein Build überschießt höchstens einmal).
        // Deadline aus _loopVoxelStreaming; Default Infinity hält Test-/Drain-Pfade count-deterministisch.
        const _isoT0 = performance.now();
        // Nach Spieler-Distanz priorisieren: nahe Seen zuerst (sonst staut die Queue — jeder Chunk-Build
        // enqueued 4 Nachbarn — und nahe Seen verlieren ihr Iso-Mesh). Chunks weit außerhalb des Sicht-Rings
        // fliegen raus (werden ohnehin gepruned) → die Queue bleibt begrenzt.
        const pm = this.state.playerMesh ? this.state.playerMesh.position : null;
        const span = this._voxelChunkConfig(0).span;
        let keys = [...queue];
        if (pm) {
            const pcx = Math.floor((pm.x + span / 2) / span);
            const pcz = Math.floor((pm.z + span / 2) / span);
            const ring = (this.state.chunkRingRadius || 4) + 2;
            const distOf = (k) => {
                const ci = k.indexOf(",");
                const kx = parseInt(k.slice(0, ci), 10);
                const kz = parseInt(k.slice(ci + 1), 10);
                return Math.max(Math.abs(kx - pcx), Math.abs(kz - pcz));
            };
            // ferne (jenseits Sicht-Ring) verwerfen, Rest sortieren: ERST DIE LÜCKE — ein Chunk ohne aufgelöstes Sheet
            // zeigt sein leeres Seebett (seit V18.530 deckt kein Lade-Nebel die Wasser-Front), eine Auffrischung (der
            // Wasser-Automat, die Nachbarn) behält ihr altes Sheet bis zum Neubau; je Gruppe nah zuerst. Gemessen 05.10.
            // (echte GPU, Gang nach Norden, 5 m/s): bis 10 gebaute Chunks gleichzeitig ohne Wasser, der längste 210
            // Takte — die Auffrischungen fließenden Wassers belegten die Plätze.
            for (const k of keys) if (distOf(k) > ring) queue.delete(k);
            const wi = this.state.voxelChunkWaterIso;
            const luecke = (k) => (wi && wi.has(k) ? 1 : 0);
            keys = [...queue].sort((a, b) => luecke(a) - luecke(b) || distOf(a) - distOf(b));
        }
        // Anti-Starvation: (maxPerFrame−1) Slots nah-zuerst, der LETZTE Slot baut den ÄLTESTEN Eintrag (Set-
        // Insertion-Order = FIFO; ein Re-Add ändert sie nicht) → bounded Wartezeit für jeden Key. Reine
        // Distanz-Priorität + CA-Nachschub naher Keys ließe ferne Ozean-Chunks nie drankommen (Loch-Streifen).
        let built = 0;
        const distBudget = Math.max(1, maxPerFrame - 1);
        for (const key of keys) {
            if (built >= distBudget) break;
            if (built > 0 && performance.now() - _isoT0 > deadlineMs) break; // V18.261 Zeit-Deadline (≥1 garantiert)
            queue.delete(key);
            // Chunk inzwischen weg (gepruned)? Dann nichts bauen.
            if (!this.state.voxelChunks || !this.state.voxelChunks.has(key)) continue;
            const comma = key.indexOf(",");
            const cx = parseInt(key.slice(0, comma), 10);
            const cz = parseInt(key.slice(comma + 1), 10);
            // Streaming-Sheet baut im Worker (CA-frei), sonst sync; auf dem Main bleibt nur Zell-Copy +
            // postMessage, die Zeit-Deadline deckelt weiter.
            this._buildWaterSheetStreaming(cx, cz);
            built++;
        }
        // FIFO-Tail (Anti-Starvation): nur wenn das Count-Budget UND die
        // Zeit-Deadline noch Luft haben (built===0 garantiert immer ≥1 Build).
        if (built < maxPerFrame && (built === 0 || performance.now() - _isoT0 <= deadlineMs)) {
            for (const key of queue) {
                queue.delete(key);
                if (!this.state.voxelChunks || !this.state.voxelChunks.has(key)) continue;
                const comma = key.indexOf(",");
                const cx = parseInt(key.slice(0, comma), 10);
                const cz = parseInt(key.slice(comma + 1), 10);
                this._buildWaterSheetStreaming(cx, cz);
                built++;
                break;
            }
        }
        return built;
    }

    // Alle ausstehenden Wasser-Iso-Builds sofort abarbeiten (Test-Naht +
    // Edit-Instant-Feedback): wer den Wasser-Mesh DIREKT nach einem Build
    // prüft/braucht, drained die Queue. Im Spiel läuft der per-Frame-Tick.
    _drainPendingWaterIso() {
        const queue = this.state.pendingWaterIso;
        if (!queue || queue.size === 0) return 0;
        let built = 0;
        for (const key of [...queue]) {
            queue.delete(key);
            if (!this.state.voxelChunks || !this.state.voxelChunks.has(key)) continue;
            const comma = key.indexOf(",");
            const cx = parseInt(key.slice(0, comma), 10);
            const cz = parseInt(key.slice(comma + 1), 10);
            this._buildVoxelChunkWaterIsoSurface(cx, cz);
            built++;
        }
        return built;
    }

    // EIN deterministischer Tick des zellulären Wasser-Automaten über `level[idx]` ∈ [0,1] (Füllgrad) +
    // `cells[idx]` (SOLID blockt), zwei erhaltende Pässe: (1) GRAVITÄT top-down in-place (kaskadiert) in
    // die Zelle darunter, soweit Kapazität; (2) LATERAL per Delta-Puffer, jedes Paar (+i, +k) symmetrisch
    // Richtung Mittel (Rate < 0.5 für Stabilität). Pur über die Arrays (headless beweisbar), lokal, nicht
    // persistiert, kein Worker-Mirror. Rückgabe: Zahl bewegter Zellen (active-cell-only).
    _tickWaterCA(level, cells, dim, dimY, rate = 0.25, deltaScratch = null, band = null, cap = null) {
        const SOLID = AnazhRealm.CELL_STATE.SOLID;
        const dimSq = dim * dim;
        const EPS = 1e-4;
        // `moved` = die MAGNITUDE des bewegten Wassers (nicht Zell-Zahl) → der active-cell-Settle
        // greift, wenn die Lache wirklich ruht (Zell-Zahl bliebe bei langsamem Ausgleich ewig hoch).
        let moved = 0;
        // y-Band: der Tick läuft nur über die belegten Zeilen [band.jMin .. band.jMax], semantik-identisch zum
        // Voll-Sweep (Invariante: außerhalb level 0): die Gravitations-Kaskade folgt `gMin` nach unten, das
        // Band wird am Ende neu gemessen. `band = null` = Voll-Sweep (erster Tick nach Seed).
        const jHi = band ? Math.min(dimY - 1, band.jMax) : dimY - 1;
        const jLo = band ? Math.max(0, band.jMin) : 0;
        if (jHi < jLo) {
            if (band) {
                band.jMin = dimY;
                band.jMax = -1;
            }
            return 0;
        }
        // (1) GRAVITÄT — von oben nach unten, damit eine Säule in einem Tick durchkaskadiert.
        // `gMin` = tiefste Zeile, in die Wasser fiel: der Loop folgt der Kaskade unter das
        // Band (break, sobald keine Kaskade tiefer reicht) — exakt wie der Voll-Sweep.
        let gMin = Math.max(1, jLo);
        for (let j = jHi; j >= 1; j--) {
            if (j < gMin) break;
            const baseJ = j * dimSq;
            const belowJ = (j - 1) * dimSq;
            for (let c = 0; c < dimSq; c++) {
                const here = baseJ + c;
                const lv = level[here];
                if (lv <= EPS || cells[here] === SOLID) continue;
                const below = belowJ + c;
                if (cells[below] === SOLID) continue;
                const cap = 1 - level[below];
                if (cap <= EPS) continue;
                const flow = lv < cap ? lv : cap;
                level[here] = lv - flow;
                level[below] += flow;
                moved += flow;
                if (j - 1 < gMin) gMin = j - 1;
            }
        }
        // (2) LATERAL: jedes (+i)- und (+k)-Paar EINMAL, symmetrischer Transfer → exakte Erhaltung. Scratch
        // wird wiederverwendet und NUR im Fenster [rowLo..jHi] genullt — darunter ist er stale vom vorigen
        // Chunk, nie lesen.
        const rowLo = Math.max(0, Math.min(jLo, gMin));
        const winLo = rowLo * dimSq;
        const winHi = (jHi + 1) * dimSq;
        let delta = deltaScratch;
        if (delta && delta.length >= level.length) delta.fill(0, winLo, winHi);
        else delta = new Float64Array(level.length);
        // Receiver-Support: lateral nur in einen GESTÜTZTEN Empfänger (darunter SOLID oder ≥ 0.9 gefüllt; j=0
        // zählt gestützt) — Wasser fällt zuerst. Ohne die Regel diffundiert die oberste Schicht ewig in die
        // Ufer-Luft (Chunk settled nie); so füllt ein Carve Schicht für Schicht von unten.
        const SUPPORT = 0.9;
        // Distanz-Decay: jeder LATERALE Transfer liefert nur CA_FLOW_KEEP (95 %) ab → Wasser dünnt geometrisch
        // mit der Hop-Entfernung (0.95^n), Pooling fern der Quelle stirbt. Gravitation bleibt verlustfrei.
        // Die EINE bewusste Dissipation — ohne sie flutet die geschlossene Ring-Domäne.
        const KEEP = AnazhRealm.CA_FLOW_KEEP;
        // EPS_FLOW ≈ (1−KEEP): mit KEEP<1 bleibt an jeder Quell-Grenze ein Rest-Gefälle (Gleichgewicht
        // KEEP·Quelle) — ohne die Schwelle pumpt der Automat ewig; so ist der Decay-Zustand ein Fixpunkt.
        const EPS_FLOW = (1 - KEEP) * 1.1 + EPS;
        for (let j = rowLo; j <= jHi; j++) {
            const baseJ = j * dimSq;
            for (let k = 0; k < dim; k++) {
                const baseK = k * dim;
                for (let i = 0; i < dim; i++) {
                    const here = baseJ + baseK + i;
                    if (cells[here] === SOLID) continue;
                    const lv = level[here] + delta[here];
                    // +i-Nachbar
                    if (i + 1 < dim) {
                        const nb = here + 1;
                        if (cells[nb] !== SOLID) {
                            const diff = lv - (level[nb] + delta[nb]);
                            if (diff > EPS_FLOW || diff < -EPS_FLOW) {
                                const recv = diff > 0 ? nb : here;
                                const recvBelow = recv - dimSq;
                                // V18.93 — SPIEGEL-KAPPE: kein Zufluss über die Spalten-Kappe
                                // (rim-L bzw. Boden+Skin) — Wasser steigt nie über seinen Spiegel.
                                if (
                                    (!cap || j <= cap[recv % dimSq]) &&
                                    (recvBelow < 0 || cells[recvBelow] === SOLID || level[recvBelow] >= SUPPORT)
                                ) {
                                    const t = diff * rate;
                                    if (t > 0) {
                                        delta[here] -= t;
                                        delta[nb] += t * KEEP;
                                    } else {
                                        delta[here] -= t * KEEP;
                                        delta[nb] += t;
                                    }
                                    moved += t > 0 ? t : -t;
                                }
                            }
                        }
                    }
                    // +k-Nachbar
                    if (k + 1 < dim) {
                        const nb = here + dim;
                        if (cells[nb] !== SOLID) {
                            const diff = lv - (level[nb] + delta[nb]);
                            if (diff > EPS_FLOW || diff < -EPS_FLOW) {
                                const recv = diff > 0 ? nb : here;
                                const recvBelow = recv - dimSq;
                                // V18.93 — SPIEGEL-KAPPE: kein Zufluss über die Spalten-Kappe
                                // (rim-L bzw. Boden+Skin) — Wasser steigt nie über seinen Spiegel.
                                if (
                                    (!cap || j <= cap[recv % dimSq]) &&
                                    (recvBelow < 0 || cells[recvBelow] === SOLID || level[recvBelow] >= SUPPORT)
                                ) {
                                    const t = diff * rate;
                                    if (t > 0) {
                                        delta[here] -= t;
                                        delta[nb] += t * KEEP;
                                    } else {
                                        delta[here] -= t * KEEP;
                                        delta[nb] += t;
                                    }
                                    moved += t > 0 ? t : -t;
                                }
                            }
                        }
                    }
                }
            }
        }
        // Anwenden + das Band aus dem IST neu messen (Zeilen mit Wasser > EPS).
        let nMin = dimY;
        let nMax = -1;
        for (let n = winLo; n < winHi; n++) {
            const v = level[n] + delta[n];
            const c = v < 0 ? 0 : v > 1 ? 1 : v;
            level[n] = c;
            if (c > EPS) {
                const j = (n / dimSq) | 0;
                if (j < nMin) nMin = j;
                if (j > nMax) nMax = j;
            }
        }
        if (band) {
            band.jMin = nMin;
            band.jMax = nMax;
        }
        return moved;
    }

    // Verdunstungs-Boden: Wasser, das der CA in flood-trockene Spalten trug, settled sonst 0.5–0.9 über
    // der Render-Schwelle und friert als Blob ein. Ist ein Chunk ruhig (Bewegung < SETTLE über
    // CA_EVAP.QUIET_TICKS), verdunstet Live-Wasser in flood-trockenen Zellen auf 0 (RATE/Tick, Rest < SNAP
    // fällt) — bewusste Nicht-Erhaltung (Gegenstück zum Quellen-Pin). NIE: Quell-Spalten (src) und Flood-
    // WATER-Zellen (Ruhe-Wahrheit). Pur über die Arrays; Linse `gate:wasser-wahrheit` Fixture 3.
    _caEvaporateSettled(level, cells, src, dim, dimY, band) {
        const WATER = AnazhRealm.CELL_STATE.WATER;
        const SOLID = AnazhRealm.CELL_STATE.SOLID;
        const CFG = AnazhRealm.CA_EVAP;
        const dimSq = dim * dim;
        const jHi = band ? Math.min(dimY - 1, band.jMax) : dimY - 1;
        const jLo = band ? Math.max(0, band.jMin) : 0;
        let evap = 0;
        for (let j = jLo; j <= jHi; j++) {
            const baseJ = j * dimSq;
            for (let c = 0; c < dimSq; c++) {
                if (src && src[c]) continue; // Quell-Spalten: NIE verdunsten
                const idx = baseJ + c;
                const lv = level[idx];
                if (lv <= 0) continue;
                const cs = cells[idx];
                if (cs === WATER || cs === SOLID) continue; // nur LIVE-Zungen über trockenem Grund
                const nv = lv - CFG.RATE;
                const next = nv < CFG.SNAP ? 0 : nv;
                evap += lv - next;
                level[idx] = next;
            }
        }
        return evap;
    }

    // Reaktive Wasser-Level-Schicht: `state.waterLevelCells` ("cx,cz" → Float32Array) lebt SEPARAT von
    // den Chunk-Entries (überlebt Carve-Rebuilds), lokal, nicht persistiert, kein Worker-Mirror. Seed aus
    // der statischen Flood; danach autonom (Level + SOLID-Maske).
    _seedWaterLevel(cells) {
        const WATER = AnazhRealm.CELL_STATE.WATER;
        const level = new Float32Array(cells.length);
        for (let i = 0; i < cells.length; i++) if (cells[i] === WATER) level[i] = 1.0;
        return level;
    }

    // ===== DAS HOCH-BECKEN: der Stau-Spiegel (Regel an AnazhRealm.CA_STAU) =====
    // Alles LAZY + gecacht im bestehenden Kappen-Leben (waterCapJ/waterSourceCols), abgeleitet aus
    // persistierter Wahrheit (worldMeta.voxelEdits + architectures.blockerAABBs) → nach Reload füllt der
    // Fluss den See über Ticks neu. Main-only, kein Worker-Mirror.

    // Die Stau-Werke der Welt, zu Clustern verschmolzen (ein Damm aus vielen Blöcken/Fill-Kugeln ist EIN
    // Werk). Identitäts- + Längen-gecacht: Edit-Push / Architektur-Spawn/-Remove invalidiert exakt.
    // Deterministisch (stabile Listen-Ordnung).
    _stauWorkClusters() {
        const meta = this.state.worldMeta;
        const edits = meta && Array.isArray(meta.voxelEdits) ? meta.voxelEdits : null;
        const archs = Array.isArray(this.state.architectures) ? this.state.architectures : null;
        const eLen = edits ? edits.length : 0;
        const aLen = archs ? archs.length : 0;
        const c = this._stauClusterCache;
        if (c && c.edits === edits && c.eLen === eLen && c.archs === archs && c.aLen === aLen) return c.clusters;
        const CFG = AnazhRealm.CA_STAU;
        const works = [];
        for (let i = 0; i < eLen; i++) {
            const e = edits[i];
            if (!e || e.mode !== "fill") continue;
            const r = Number(e.r) || 0;
            if (r * 2 < CFG.MIN_EXTENT) continue;
            works.push({
                minX: e.x - r,
                maxX: e.x + r,
                minZ: e.z - r,
                maxZ: e.z + r,
                topY: (Number(e.y) || 0) + r,
                botY: (Number(e.y) || 0) - r,
            });
        }
        if (archs) {
            // Stau-Qualifikation: ein Architektur-AABB zählt NUR als Damm, wenn es (a) GEERDET ist (Basis ≤ 1
            // Sim-Zelle = 1,8 m über dem Terrain seiner Spalte) UND (b) GESCHLOSSEN (deckt in BEIDEN Achsen ≥ 1
            // volle Sim-Zelle) — schmaler versiegelt keine Spalte; Pfosten, dünne Wände, Stege fallen, ein Haus
            // wird nie zum Damm. Fill-Edits sind Terrain (bleiben). Linse: `gate:wasser-wahrheit` Fixture 4,
            // Stau-Harness `gate:carve`.
            const CELL = this._voxelChunkConfig(0).step;
            for (const entry of archs) {
                if (!entry || !entry.blockerAABBs) continue;
                for (const a of entry.blockerAABBs) {
                    if (Math.min(a.maxX - a.minX, a.maxZ - a.minZ) < CELL) continue; // (b) geschlossen
                    const terrY = this._terrainMacroSurfaceY((a.minX + a.maxX) * 0.5, (a.minZ + a.maxZ) * 0.5);
                    if (Number.isFinite(terrY) && Number.isFinite(a.botY) && a.botY > terrY + CELL) continue; // (a) geerdet
                    works.push({ minX: a.minX, maxX: a.maxX, minZ: a.minZ, maxZ: a.maxZ, topY: a.topY, botY: a.botY });
                }
            }
        }
        // Die Krone muss über dem lokalen Ruhe-Spiegel liegen (eine Atlas-Probe je Werk); Werke fern jedes
        // Wassers (rim=−Inf) bleiben drin. Die Rim-Frage reist mit der Werk-Basis (botY): Basis unter dem
        // Spiegel ⇒ rim greift, darüber ⇒ trocken-fundiert, bleibt drin.
        const qualified = [];
        for (const w of works) {
            const rim = this._atlasWaterLevelAt(
                (w.minX + w.maxX) * 0.5,
                (w.minZ + w.maxZ) * 0.5,
                Number.isFinite(w.botY) ? w.botY : -Infinity
            );
            if (rim > -Infinity && w.topY <= rim + 0.9) continue;
            qualified.push(w);
        }
        const GAP = CFG.CLUSTER_GAP;
        const clusters = [];
        for (const w of qualified) {
            let merged = { minX: w.minX, maxX: w.maxX, minZ: w.minZ, maxZ: w.maxZ, topY: w.topY };
            let changed = true;
            while (changed) {
                changed = false;
                for (let i = clusters.length - 1; i >= 0; i--) {
                    const cl = clusters[i];
                    if (cl.minX - GAP > merged.maxX || merged.minX - GAP > cl.maxX) continue;
                    if (cl.minZ - GAP > merged.maxZ || merged.minZ - GAP > cl.maxZ) continue;
                    merged = {
                        minX: Math.min(cl.minX, merged.minX),
                        maxX: Math.max(cl.maxX, merged.maxX),
                        minZ: Math.min(cl.minZ, merged.minZ),
                        maxZ: Math.max(cl.maxZ, merged.maxZ),
                        topY: Math.max(cl.topY, merged.topY),
                    };
                    clusters.splice(i, 1);
                    changed = true;
                }
            }
            clusters.push(merged);
        }
        for (const cl of clusters)
            cl.key =
                `${Math.round(cl.minX)},${Math.round(cl.minZ)},${Math.round(cl.maxX)},` +
                `${Math.round(cl.maxZ)},${Math.round(cl.topY)}`;
        this._stauClusterCache = { edits, eLen, archs, aLen, clusters };
        return clusters;
    }

    // PURE Priority-Flood: `barrier[c]` = Höhe, über der Wasser die Spalte passiert; `init[c]` = Halte-
    // Pegel der Außenwelt am Fensterrand (innen +Infinity). Liefert je Spalte den SPILL-Pegel (niedrigste
    // Fluchthöhe nach außen). Relaxation fill[nb] = max(fill[cur], barrier[nb]), min-Heap.
    _stauSpillLevels(barrier, w, h, init) {
        const n = w * h;
        const fill = new Float64Array(n);
        const heap = new Int32Array(n + 1);
        const pos = new Int32Array(n).fill(-1);
        let size = 0;
        const less = (a, b) => fill[a] < fill[b];
        const swap = (i, j) => {
            const t = heap[i];
            heap[i] = heap[j];
            heap[j] = t;
            pos[heap[i]] = i;
            pos[heap[j]] = j;
        };
        const up = (i) => {
            while (i > 1 && less(heap[i], heap[i >> 1])) {
                swap(i, i >> 1);
                i >>= 1;
            }
        };
        const down = (i) => {
            for (;;) {
                let m = i;
                const l = i * 2;
                const r = l + 1;
                if (l <= size && less(heap[l], heap[m])) m = l;
                if (r <= size && less(heap[r], heap[m])) m = r;
                if (m === i) break;
                swap(i, m);
                i = m;
            }
        };
        for (let c = 0; c < n; c++) {
            fill[c] = init[c];
            if (Number.isFinite(init[c])) {
                heap[++size] = c;
                pos[c] = size;
                up(size);
            }
        }
        const done = new Uint8Array(n);
        const NDX = [1, -1, 0, 0];
        const NDZ = [0, 0, 1, -1];
        while (size > 0) {
            const cur = heap[1];
            heap[1] = heap[size--];
            if (size > 0) {
                pos[heap[1]] = 1;
                down(1);
            }
            pos[cur] = -1;
            if (done[cur]) continue;
            done[cur] = 1;
            const ci = cur % w;
            const ck = (cur / w) | 0;
            for (let d = 0; d < 4; d++) {
                const ni = ci + NDX[d];
                const nk = ck + NDZ[d];
                if (ni < 0 || nk < 0 || ni >= w || nk >= h) continue;
                const nb = ni + nk * w;
                if (done[nb]) continue;
                const cand = Math.max(fill[cur], barrier[nb]);
                if (cand < fill[nb]) {
                    fill[nb] = cand;
                    if (pos[nb] >= 0) up(pos[nb]);
                    else {
                        heap[++size] = nb;
                        pos[nb] = size;
                        up(size);
                    }
                }
            }
        }
        return fill;
    }

    // Stau-Feld eines Werk-Clusters (gecacht in `state.waterStauFields`), WERK-zentriert → Nachbar-Chunks
    // lesen dasselbe Feld (keine Kappen-Naht). Fenster in Welt-Spalten (gx = floor(x/step) = cx·dim+i);
    // barrier aus der Zell-Wahrheit (ungeladene Rand-Spalten → Macro-Terrain, konservativ offen); Rand-
    // Init = Außenwelt (rim+0.5 bzw. Boden+Skin). Kein Quell-Atlas-Wasser im Fenster → null.
    _ensureStauField(cluster) {
        if (!this.state.waterStauFields) this.state.waterStauFields = new Map();
        if (this.state.waterStauFields.has(cluster.key)) return this.state.waterStauFields.get(cluster.key);
        const CFG = AnazhRealm.CA_STAU;
        const cfg = this._voxelChunkConfig(0);
        const step = cfg.step;
        const dim = cfg.dim;
        const dimY = cfg.dimY;
        const dimSq = dim * dim;
        const oy = (this.state.terrainBaseHeight || 0) - cfg.floorDrop;
        let gx0 = Math.floor(cluster.minX / step) - CFG.REACH;
        let gx1 = Math.floor(cluster.maxX / step) + CFG.REACH;
        let gz0 = Math.floor(cluster.minZ / step) - CFG.REACH;
        let gz1 = Math.floor(cluster.maxZ / step) + CFG.REACH;
        if (gx1 - gx0 + 1 > CFG.WIN_MAX) {
            const mid = (gx0 + gx1) >> 1;
            gx0 = mid - (CFG.WIN_MAX >> 1);
            gx1 = gx0 + CFG.WIN_MAX - 1;
        }
        if (gz1 - gz0 + 1 > CFG.WIN_MAX) {
            const mid = (gz0 + gz1) >> 1;
            gz0 = mid - (CFG.WIN_MAX >> 1);
            gz1 = gz0 + CFG.WIN_MAX - 1;
        }
        const w = gx1 - gx0 + 1;
        const h = gz1 - gz0 + 1;
        const SOLID = AnazhRealm.CELL_STATE.SOLID;
        const barrier = new Float64Array(w * h);
        const init = new Float64Array(w * h).fill(Infinity);
        let anySource = false;
        let teil = 0; // Spalten, deren Boden das Makro trägt (Chunk noch nicht geladen)
        for (let kz = 0; kz < h; kz++) {
            for (let ix = 0; ix < w; ix++) {
                const gx = gx0 + ix;
                const gz = gz0 + kz;
                const x = (gx + 0.5) * step;
                const z = (gz + 0.5) * step;
                const c = ix + kz * w;
                const ccx = Math.floor(gx / dim);
                const ccz = Math.floor(gz / dim);
                const entry = this.state.voxelChunks ? this.state.voxelChunks.get(`${ccx},${ccz}`) : null;
                let bY = null;
                if (entry && entry.waterCells && !entry.empty && (!Number.isFinite(entry.lod) || entry.lod === 0)) {
                    const cells = entry.waterCells;
                    const col = gx - ccx * dim + (gz - ccz * dim) * dim;
                    for (let j = dimY - 1; j >= 0; j--) {
                        if (cells[col + j * dimSq] === SOLID) {
                            bY = oy + (j + 1) * step;
                            break;
                        }
                    }
                    if (bY === null) bY = oy;
                } else {
                    const m = this._terrainMacroSurfaceY(x, z);
                    bY = Number.isFinite(m) ? m : oy;
                    teil++;
                }
                barrier[c] = bY;
                if (this._atlasWaterLevelAt(x, z, Infinity) > -Infinity) anySource = true;
                if (ix === 0 || kz === 0 || ix === w - 1 || kz === h - 1) {
                    // Rand-Rim mit bekanntem Boden (bY): Boden unter dem Spiegel ⇒ rim+0.5, darüber ⇒ Boden+Skin-Kappe
                    // (2 Zellen) — konsistent zur Kappe derselben Spalte im Nachbar-Chunk.
                    const rim = this._atlasWaterLevelAt(x, z, bY);
                    init[c] = Math.max(bY, rim > -Infinity ? rim + 0.5 : bY + 2 * step);
                }
            }
        }
        let field = null;
        if (anySource) {
            const fill = this._stauSpillLevels(barrier, w, h, init);
            // DAS FELD AUS HALBER WAHRHEIT IST VORLÄUFIG (K37): las es Rand-Spalten aus dem Makro, baut es neu, sobald ein
            // Chunk seines Fensters seine Zellen bringt (`_stauFeldVorlaeufig`, gerufen vom Zell-Stempel jedes Chunks). Nach dem
            // Reload baute der Damm im Tal 26/−120 sein Feld im ersten Takt mit 894 Makro-Spalten, das gecachte wich vom
            // vollen in 70 Spalten ab — der Stausee stand nach dem Reload 2 271 statt 2 252 nasse Punkte.
            field = { gx0, gz0, w, h, fillY: Float32Array.from(fill), teil: teil > 0 };
        }
        this.state.waterStauFields.set(cluster.key, field);
        return field;
    }

    // Ein Chunk (Ursprung ox/oz) bringt seine Zellen: jedes vorläufige Stau-Feld (`teil`, aus Makro-Rand gebaut), dessen
    // Fenster ihn schneidet, fällt samt den Kappen um sein Fenster, der Automat wacht — der nächste Kappen-Bau liest die Zellen.
    _stauFeldVorlaeufig(ox, oz) {
        const felder = this.state.waterStauFields;
        if (!felder || felder.size === 0) return;
        const cfg = this._voxelChunkConfig(0);
        const gxA = Math.round(ox / cfg.step);
        const gzA = Math.round(oz / cfg.step);
        let fallen = null;
        for (const f of felder.values()) {
            if (!f || !f.teil) continue;
            if (f.gx0 > gxA + cfg.dim - 1 || f.gx0 + f.w - 1 < gxA) continue;
            if (f.gz0 > gzA + cfg.dim - 1 || f.gz0 + f.h - 1 < gzA) continue;
            (fallen || (fallen = [])).push(f);
        }
        if (!fallen) return;
        for (const f of fallen)
            this._invalidateWaterCapsAround(
                (f.gx0 + f.w * 0.5) * cfg.step,
                (f.gz0 + f.h * 0.5) * cfg.step,
                Math.max(f.w, f.h) * 0.5 * cfg.step
            );
    }

    // Die Stau-Felder, deren Fenster den Chunk schneiden (für den Kappen-Bau).
    // null = keines (der häufige Fall — exakt der V18.93-Stand, null Extra-Kosten
    // jenseits des gecachten Cluster-Reads).
    _stauFieldsNear(cx, cz) {
        const clusters = this._stauWorkClusters();
        if (!clusters || clusters.length === 0) return null;
        const cfg = this._voxelChunkConfig(0);
        const R = AnazhRealm.CA_STAU.REACH;
        const gxA = cx * cfg.dim;
        const gxB = gxA + cfg.dim - 1;
        const gzA = cz * cfg.dim;
        const gzB = gzA + cfg.dim - 1;
        let out = null;
        for (const cl of clusters) {
            if (Math.floor(cl.maxX / cfg.step) + R < gxA || Math.floor(cl.minX / cfg.step) - R > gxB) continue;
            if (Math.floor(cl.maxZ / cfg.step) + R < gzA || Math.floor(cl.minZ / cfg.step) - R > gzB) continue;
            const f = this._ensureStauField(cl);
            if (f) (out || (out = [])).push(f);
        }
        return out;
    }

    // Der EINE Invalidations-Eingang nach einer Werk-Änderung (Edit / Architektur-Spawn/-Remove): Kappen +
    // Quell-Markierungen + Stau-Felder der Region verwerfen + CA wecken. NACH dem Rebuild rufen — sonst
    // sieht der Spill-Scan den Damm noch nicht.
    _invalidateWaterCapsAround(x, z, r) {
        const cfg = this._voxelChunkConfig(0);
        const R = (Number(r) || 0) + (AnazhRealm.CA_STAU.REACH + 4) * cfg.step + AnazhRealm.CA_STAU.CLUSTER_GAP;
        const minCX = Math.floor((x - R) / cfg.span);
        const maxCX = Math.floor((x + R) / cfg.span);
        const minCZ = Math.floor((z - R) / cfg.span);
        const maxCZ = Math.floor((z + R) / cfg.span);
        for (let cx = minCX; cx <= maxCX; cx++) {
            for (let cz = minCZ; cz <= maxCZ; cz++) {
                const key = `${cx},${cz}`;
                if (this.state.waterCapJ) this.state.waterCapJ.delete(key);
                if (this.state.waterSourceCols) this.state.waterSourceCols.delete(key);
                this._wakeWaterCA(cx, cz);
            }
        }
        if (this.state.waterStauFields) {
            for (const [key, f] of this.state.waterStauFields) {
                // null-Felder mit-verwerfen (das Werk-Bild änderte sich; billig neu).
                if (!f) {
                    this.state.waterStauFields.delete(key);
                    continue;
                }
                const fx0 = f.gx0 * cfg.step;
                const fx1 = (f.gx0 + f.w) * cfg.step;
                const fz0 = f.gz0 * cfg.step;
                const fz1 = (f.gz0 + f.h) * cfg.step;
                if (fx1 < x - R || fx0 > x + R || fz1 < z - R || fz0 > z + R) continue;
                this.state.waterStauFields.delete(key);
            }
        }
    }

    // EIN Seed-Eingang der CA-Level-Schicht: seedet aus den AKTUELLEN Zellen, markiert einmalig die
    // Quell-Spalten (Atlas-Wasser), legt das y-Band an (voll → der erste Tick misst). Der Edit-Pfad ruft
    // das VOR dem Carve-Rebuild → der Eintrag hält die Pre-Carve-Ruhe, das Nachfließen ist sichtbar.
    _ensureWaterCALevel(cx, cz) {
        const key = `${cx},${cz}`;
        const entry = this.state.voxelChunks ? this.state.voxelChunks.get(key) : null;
        if (!entry || entry.empty || !entry.waterCells || (Number.isFinite(entry.lod) && entry.lod !== 0)) return null;
        if (!this.state.waterLevelCells) this.state.waterLevelCells = new Map();
        if (!this.state.waterCABand) this.state.waterCABand = new Map();
        let lv = this.state.waterLevelCells.get(key);
        if (!lv) {
            lv = this._seedWaterLevel(entry.waterCells);
            this.state.waterLevelCells.set(key, lv);
            // Frischer Seed → das Band VOLL resetten (ein stale Band aus einer früheren
            // Level-Epoche würde das frische Wasser band-unsichtbar machen).
            const cfg = this._voxelChunkConfig(0);
            this.state.waterCABand.set(key, { jMin: 0, jMax: cfg.dimY - 1 });
        } else if (!this.state.waterCABand.has(key)) {
            const cfg = this._voxelChunkConfig(0);
            this.state.waterCABand.set(key, { jMin: 0, jMax: cfg.dimY - 1 });
        }
        // Quell-Spalten (einmalig je Eintrag, 576 Atlas-Probes) = unendliches Reservoir, der Pin füllt ihre
        // WATER-Zellen nach. Dazu die Kappe `waterCapJ` je Spalte (höchste Zeile, in die Wasser ZUFLIESSEN
        // darf). Reine EMPFÄNGER-Regel im Lateral-Pass → erhaltungs-neutral; Decay allein bändigt den
        // hydrostatischen Pool neben der Quelle nicht.
        // DIE RUHE IST DER FIXPUNKT (K37, 13.10.): die Kappe einer Spalte, die das Gesetz flutet, ist ihre oberste
        // Flut-Zelle — erwacht der Automat über ruhendem Wasser (jede Werk-Setzung am Ufer weckt ihn), bewegt er
        // nichts. Bis K37 lag die Kappe dort eine Zeile über der Ruhe (Spiegel + 0,5 m): die Deck-Zelle (4b, eine
        // volle Zelle über dem Spiegel ihrer Nachbarn) floss in die Zeile über dem See und aufs Land, die flachen
        // Ufer-Spalten leerten sich, und das Sheet zeichnete sie 14 m unter dem Spiegel — das weiße Treppen-Band am
        // See der Solitär-Eiche (nach dem Wecken 424 von 1594 Spalten gerissen, Wildwasser 105 → 1944 Vertices).
        // Eine trockene Spalte nimmt nur Wasser, wo ein Schnitt Raum öffnete (`_chunkRegionHasCarve`, das Gate der
        // reaktiven Flut): im Atlas-Gebiet bis Spiegel + 0,5 m, jenseits Boden + 2 Zellen (die fließende Haut);
        // sonst nie. Ein Stau hebt die Kappe (unten).
        if (!this.state.waterSourceCols) this.state.waterSourceCols = new Map();
        if (!this.state.waterCapJ) this.state.waterCapJ = new Map();
        if (!this.state.waterSourceCols.has(key) || !this.state.waterCapJ.has(key)) {
            const cfg = this._voxelChunkConfig(0);
            const dim = cfg.dim;
            const dimY = cfg.dimY;
            const dimSq = dim * dim;
            const oy = (this.state.terrainBaseHeight || 0) - cfg.floorDrop;
            const SOLID = AnazhRealm.CELL_STATE.SOLID;
            const cells = entry.waterCells;
            const src = new Uint8Array(dimSq);
            const cap = new Int16Array(dimSq);
            const ox = cx * cfg.span;
            const oz = cz * cfg.span;
            // V18.129 — die Stau-Felder der Spieler-Werke (null im häufigen Fall).
            const stauFields = this._stauFieldsNear(cx, cz);
            const stauMax = AnazhRealm.CA_STAU.MAX_CELLS;
            const WATER = AnazhRealm.CELL_STATE.WATER;
            const raumOffen = this._chunkRegionHasCarve(cx, cz); // ein Schnitt öffnete Raum (s. o.)
            for (let k = 0; k < dim; k++) {
                for (let i = 0; i < dim; i++) {
                    const c = i + k * dim;
                    const wx = ox + (i + 0.5) * cfg.step;
                    const wz = oz + (k + 0.5) * cfg.step;
                    if (this._atlasWaterLevelAt(wx, wz, Infinity) > -Infinity) src[c] = 1;
                    // Spalten-Boden ZUERST (höchste SOLID-Zelle), die Rim-Frage trägt das echte Bett: Boden unter dem
                    // Spiegel ⇒ rim-Kappe (der See speist bis zu SEINEM Niveau), darüber ⇒ Boden+Skin-Kappe (2 Zellen).
                    let gj = -1;
                    let flutJ = -1; // die oberste Flut-Zelle: die Ruhe des Gesetzes in dieser Spalte
                    for (let j = dimY - 1; j >= 0 && (gj < 0 || flutJ < 0); j--) {
                        const zs = cells[c + j * dimSq];
                        if (zs === SOLID && gj < 0) gj = j;
                        else if (zs === WATER && flutJ < 0) flutJ = j;
                    }
                    const bedTop = oy + (gj + 1) * cfg.step; // Boden-OBERFLÄCHE (gj=-1 → oy)
                    const rim = this._atlasWaterLevelAt(wx, wz, bedTop);
                    // jenseits des Atlas / Boden über dem Spiegel: Boden + 2 Zellen Skin.
                    const capRaum =
                        rim > -Infinity
                            ? Math.max(0, Math.min(dimY - 1, Math.floor((rim + 0.5 - oy) / cfg.step)))
                            : Math.min(dimY - 1, (gj >= 0 ? gj : 0) + 2);
                    cap[c] = flutJ >= 0 ? flutJ : raumOffen ? capRaum : -1;
                    // Stau-Spiegel: liegt die Spalte in einem Werk-Feld, hebt sich die Kappe auf den gehaltenen Pegel
                    // (Spill-Wahrheit, gedeckelt MAX_CELLS); eine gehobene Quell-Spalte wird STAU-Quelle (src=2), der Pin
                    // tropft sie über die Ruhe hinaus (s. _tickWorldWaterCA). Gehoben wird nur, wo der Pegel eine Zelle
                    // über dem Boden hält (stauJ > gj): die Krone des Damms selbst und eine trockene Spalte, deren Pegel
                    // auf ihrem Boden liegt, halten kein Wasser und werden nie Quelle (am Kopf a0d6a81b 21 solche Quellen
                    // am Damm des Tals 26/−120, an der Furt −937/−1064 20).
                    if (stauFields) {
                        const gx = cx * dim + i;
                        const gz = cz * dim + k;
                        for (const f of stauFields) {
                            const fi = gx - f.gx0;
                            const fk = gz - f.gz0;
                            if (fi < 0 || fk < 0 || fi >= f.w || fk >= f.h) continue;
                            const fillY = f.fillY[fi + fk * f.w];
                            const stauJ = Math.min(
                                Math.floor((fillY - oy) / cfg.step) - 1,
                                capRaum + stauMax,
                                dimY - 1
                            );
                            if (stauJ > cap[c] && stauJ > gj) {
                                cap[c] = stauJ;
                                if (src[c] === 1) src[c] = 2;
                            }
                        }
                    }
                }
            }
            this.state.waterSourceCols.set(key, src);
            this.state.waterCapJ.set(key, cap);
        }
        return lv;
    }

    // Der active-cell-Kern: ein Chunk tickt NUR, wenn er „aktiv" ist (frisch perturbiert). Der Carve
    // weckt seine Region → das Wasser strömt in den neuen Raum; ein Fluss über die Grenze weckt den
    // Nachbarn (cross-chunk-wake). Settled Chunks fallen raus (kein Voll-Sweep → 30→1100 FPS, §2.3).
    _wakeWaterCA(cx, cz) {
        if (!this.state.waterCAActive) this.state.waterCAActive = new Set();
        this.state.waterCAActive.add(`${cx},${cz}`);
    }

    // T4a-2/3 — EIN Welt-Tick des Wasser-Automaten über die AKTIVEN LOD0-Chunks. Lokal-reaktiv,
    // budgetiert (settled → inaktiv). Der cross-chunk-wake ist möglich, WEIL T1/T2 die Grenze
    // kohärent machten (eine konsistente Nachbar-Zell-Wahrheit — die These des ganzen Bogens).
    _tickWorldWaterCA() {
        const activeSet = this.state.waterCAActive;
        if (!activeSet || activeSet.size === 0 || !this.state.voxelChunks) return 0;
        // V18.292 — deterministischer Tick-Zähler für den Fluss-Re-Mesh-Throttle
        // (frame-basiert, KEINE Wall-Clock → headless deterministisch + sichtbar).
        this.state._caTickCount = (this.state._caTickCount || 0) + 1;
        if (!this.state.waterLevelCells) this.state.waterLevelCells = new Map();
        const cfg = this._voxelChunkConfig(0);
        const dim = cfg.dim,
            dimY = cfg.dimY;
        const need = dim * dim * dimY;
        if (!this.state.waterCAScratch || this.state.waterCAScratch.length < need)
            this.state.waterCAScratch = new Float64Array(need);
        const scratch = this.state.waterCAScratch;
        const SETTLE = 0.25; // bewegte MAGNITUDE < SETTLE → der Chunk ruht, raus aus active (active-cell)
        const dimSq = dim * dim;
        const WATER = AnazhRealm.CELL_STATE.WATER;
        const SOLID = AnazhRealm.CELL_STATE.SOLID; // V18.129 — der Stau-Tropf prüft die Stütze
        const bandMap = this.state.waterCABand || (this.state.waterCABand = new Map());
        const srcMap = this.state.waterSourceCols;
        const active = [];
        for (const key of [...activeSet]) {
            const entry = this.state.voxelChunks.get(key);
            if (!entry || entry.empty || !entry.waterCells || (Number.isFinite(entry.lod) && entry.lod !== 0)) {
                activeSet.delete(key);
                continue;
            }
            const comma = key.indexOf(",");
            const cx = parseInt(key.slice(0, comma), 10);
            const cz = parseInt(key.slice(comma + 1), 10);
            // W-B — EIN Seed-Eingang (`_ensureWaterCALevel`): Level + Quell-Spalten + y-Band.
            const lv = this._ensureWaterCALevel(cx, cz);
            if (!lv) {
                activeSet.delete(key);
                continue;
            }
            active.push({
                cx,
                cz,
                key,
                level: lv,
                cells: entry.waterCells,
                band: bandMap.get(key),
                cap: this.state.waterCapJ ? this.state.waterCapJ.get(key) : null,
            });
        }
        let total = 0;
        for (const a of active) {
            // Quellen-Pin: Atlas-Wasser-Spalten (See/Fluss/Ozean) sind unendliche Reservoirs — ihre WATER-Zellen
            // werden je Tick zur Flood-Ruhe aufgefüllt (ein See speist den gegrabenen Kanal bis zu dessen Niveau).
            // Die EINE bewusste Nicht-Erhaltung; zählt als Bewegung (Chunk bleibt aktiv, solange er nachspeist).
            // Pin VOR dem Tick.
            const src = srcMap ? srcMap.get(a.key) : null;
            let pinned = 0;
            if (src) {
                const cells = a.cells;
                const level = a.level;
                const band = a.band;
                const stauFeed = AnazhRealm.CA_STAU.FEED;
                for (let c = 0; c < dimSq; c++) {
                    if (!src[c]) continue;
                    for (let j = 0; j < dimY; j++) {
                        const idx = c + j * dimSq;
                        if (cells[idx] === WATER && level[idx] < 1) {
                            pinned += 1 - level[idx];
                            level[idx] = 1;
                            if (band) {
                                if (j < band.jMin) band.jMin = j;
                                if (j > band.jMax) band.jMax = j;
                            }
                        }
                    }
                    // Stau-Tropf: eine Quell-Spalte im Stau-Bereich (src=2) speist über ihre Ruhe hinaus — je Tick FEED in
                    // die unterste unvolle, gestützte Zelle ≤ Kappe; voll → kein Add → Settle-Fixpunkt.
                    if (src[c] === 2 && a.cap) {
                        const capJ = a.cap[c];
                        for (let j = 0; j <= capJ; j++) {
                            const idx = c + j * dimSq;
                            if (cells[idx] === SOLID) continue;
                            if (level[idx] >= 0.999) continue;
                            if (j > 0) {
                                const below = idx - dimSq;
                                if (cells[below] !== SOLID && level[below] < 0.9) break;
                            }
                            const add = Math.min(stauFeed, 1 - level[idx]);
                            level[idx] += add;
                            pinned += add;
                            if (band) {
                                if (j < band.jMin) band.jMin = j;
                                if (j > band.jMax) band.jMax = j;
                            }
                            break;
                        }
                    }
                }
            }
            a.moved = pinned + this._tickWaterCA(a.level, a.cells, dim, dimY, 0.25, scratch, a.band, a.cap);
            total += a.moved;
        }
        // cross-chunk-wake: Level über die +x/+z-Grenzen austauschen; ein Transfer weckt den Nachbarn.
        for (const a of active) {
            for (const [dx, dz] of [
                [1, 0],
                [0, 1],
            ]) {
                const nkey = `${a.cx + dx},${a.cz + dz}`;
                const nb = this.state.voxelChunks.get(nkey);
                if (!nb || nb.empty || !nb.waterCells || (Number.isFinite(nb.lod) && nb.lod !== 0)) continue;
                const bLevel = this._ensureWaterCALevel(a.cx + dx, a.cz + dz);
                if (!bLevel) continue;
                const touch = { jMin: dimY, jMax: -1 };
                const xfer = this._exchangeWaterBoundary(
                    a.level,
                    a.cells,
                    bLevel,
                    nb.waterCells,
                    dx,
                    dim,
                    dimY,
                    touch,
                    a.cap,
                    this.state.waterCapJ ? this.state.waterCapJ.get(nkey) : null
                );
                if (xfer > 0.01) {
                    this._wakeWaterCA(a.cx + dx, a.cz + dz);
                    a.moved += xfer;
                    // W-B — beide y-Bänder um die WIRKLICH berührten Zeilen weiten.
                    const nbBand = bandMap.get(nkey);
                    for (const b of [a.band, nbBand]) {
                        if (!b) continue;
                        if (touch.jMin < b.jMin) b.jMin = touch.jMin;
                        if (touch.jMax > b.jMax) b.jMax = touch.jMax;
                    }
                }
            }
            // Isotropie: auch mit INAKTIVEN −x/−z-Nachbarn tauschen (sonst läuft das Grenz-Paar nie, Wasser
            // propagiert nur nach Ost/Süd). Ist der Nachbar aktiv, führt ER das Paar als +x/+z aus (kein Doppel).
            for (const [dx, dz] of [
                [-1, 0],
                [0, -1],
            ]) {
                const wx = a.cx + dx,
                    wz = a.cz + dz;
                const wkey = `${wx},${wz}`;
                if (activeSet.has(wkey)) continue;
                const nb = this.state.voxelChunks.get(wkey);
                if (!nb || nb.empty || !nb.waterCells || (Number.isFinite(nb.lod) && nb.lod !== 0)) continue;
                const wLevel = this._ensureWaterCALevel(wx, wz);
                if (!wLevel) continue;
                // Der Nachbar ist die A-Seite des Paars (sein fernes i/k=dim−1 ↔ unser 0).
                const touch = { jMin: dimY, jMax: -1 };
                const xfer = this._exchangeWaterBoundary(
                    wLevel,
                    nb.waterCells,
                    a.level,
                    a.cells,
                    dx === -1 ? 1 : 0,
                    dim,
                    dimY,
                    touch,
                    this.state.waterCapJ ? this.state.waterCapJ.get(wkey) : null,
                    a.cap
                );
                if (xfer > 0.01) {
                    this._wakeWaterCA(wx, wz);
                    a.moved += xfer;
                    const nbBand = bandMap.get(wkey);
                    for (const b of [a.band, nbBand]) {
                        if (!b) continue;
                        if (touch.jMin < b.jMin) b.jMin = touch.jMin;
                        if (touch.jMax > b.jMax) b.jMax = touch.jMax;
                    }
                }
            }
        }
        // Verdunstung (Chokepoint `_caEvaporateSettled`): NACH Pin/Tick/Naht-Tausch führt `a.moved` die
        // Ruhe-Zählung (`entry._caStillTicks`, lifecycle-gebunden). Erst nach QUIET_TICKS beginnt sie; das
        // MAX_TICKS-Fenster je Ruhe-Episode garantiert Terminierung. Die verdunstete Magnitude zählt in
        // `a.moved` → das Re-Mesh zeigt das Schwinden.
        {
            const EVAP = AnazhRealm.CA_EVAP;
            for (const a of active) {
                const e = this.state.voxelChunks.get(a.key);
                if (!e) continue;
                if (a.moved < SETTLE) e._caStillTicks = (e._caStillTicks || 0) + 1;
                else e._caStillTicks = 0;
                a.evap = 0;
                if (e._caStillTicks >= EVAP.QUIET_TICKS && e._caStillTicks < EVAP.QUIET_TICKS + EVAP.MAX_TICKS) {
                    const ev = this._caEvaporateSettled(
                        a.level,
                        a.cells,
                        srcMap ? srcMap.get(a.key) : null,
                        dim,
                        dimY,
                        a.band
                    );
                    if (ev > 0) {
                        a.evap = ev;
                        a.moved += ev;
                        total += ev;
                    }
                }
            }
        }
        // Bewegte Chunks neu rendern (die Entscheidung legt das Dach als Wunsch ab, `_caRoofChanged`), budgetiert
        // über `pendingWaterIso` (4/Frame), nur bei echter Bewegung. Eingereiht wird der Chunk SELBST: sein Bau
        // zeichnet das neue Dach und reiht dann die 8 Nachbarn ein, die es über ±3 Spalten lesen
        // (`_buildVoxelChunkWaterCellSheet`) — nie früher (ein Nachbar vor dem Chunk gebaut zeigte ein Dach, das
        // der Chunk noch nicht zeigt). Nur SUBSTANZIELLE Bewegung (> 0.5) re-meshed live; der Schelf-Trickle
        // bekommt beim Settle EIN finales Mesh (sonst Dauer-Churn).
        if (!this.state.pendingWaterIso) this.state.pendingWaterIso = new Set();
        const enqueueZeichnen = (cx2, cz2) => {
            const rkey = `${cx2},${cz2}`;
            const re = this.state.voxelChunks.get(rkey);
            if (re && re.waterCells) this.state.pendingWaterIso.add(rkey);
        };
        // Re-Mesh nur bei sichtbarer Dach-Änderung: `moved` ist Brutto-Durchfluss (stationärer Fluss > 0.5).
        // Dach-Fingerprint (`_caRoofFingerprint`: oberste nasse Zeile + Füllgrad je Spalte, im y-Band) gegen
        // `entry._caMeshFp`: re-mesh bei max|Δ| > 0.25 (3×3-Glätten ÷9 → ~5 cm im Bild) ODER Σ|Δ| > 1.0
        // (breite Drift; FP schreibt nur beim Überschreiten fort). Geprüft nur alle CA_REMESH_TICK_INTERVAL
        // Ticks, VOR `_caRoofChanged` (mutiert den FP). Das Settle-Final-Mesh bleibt unbedingt.
        const caTick = this.state._caTickCount;
        const REMESH_INT = AnazhRealm.CA_REMESH_TICK_INTERVAL;
        for (const a of active) {
            if (a.moved <= 0.5) continue;
            const e = this.state.voxelChunks.get(a.key);
            const last = e && Number.isFinite(e._caRemeshTick) ? e._caRemeshTick : -Infinity;
            if (caTick - last < REMESH_INT) continue;
            if (this._caRoofChanged(a, dim, dimY)) {
                if (e) e._caRemeshTick = caTick;
                enqueueZeichnen(a.cx, a.cz);
            }
        }
        for (const a of active) {
            if (a.moved < SETTLE) {
                // Solange die Verdunstung arbeitet (a.evap > 0), bleibt der Chunk aktiv — sonst fröre eine halb-
                // verdunstete Zunge über der Render-Schwelle ein. Terminierung über das MAX_TICKS-Fenster.
                if (a.evap > 0) continue;
                // Der Settle-Final-Mesh teilt den Fluss-Throttle: ein perpetueller Fluss ping-pongt zwischen moved >
                // 0.5 und < SETTLE — ohne Throttle re-meshte dieser Zweig jeden Zyklus. Solange das Intervall nicht um
                // ist, BLEIBT die Region aktiv (kein delete) → der Final-Mesh kommt binnen ≤ INT Frames.
                const e = this.state.voxelChunks.get(a.key);
                const last = e && Number.isFinite(e._caRemeshTick) ? e._caRemeshTick : -Infinity;
                if (caTick - last < REMESH_INT) continue;
                activeSet.delete(a.key);
                // das finale RUHE-Mesh — ABER auch hier durchs Dach-Gate
                // (V18.121): ist der FP unverändert, IST der letzte sichtbare
                // Stand schon gezeichnet — nichts zu tun.
                if (this._caRoofChanged(a, dim, dimY)) {
                    if (e) e._caRemeshTick = caTick;
                    enqueueZeichnen(a.cx, a.cz);
                }
            }
        }
        return total;
    }

    // Dach-Fingerprint: je Spalte (dim²) oberste nasse Zeile + Füllgrad (j + frac) — exakt was das
    // Zell-Sheet rendert. Vergleicht gegen `entry._caMeshFp` und schreibt bei Überschreiten (oder
    // force=true, Settle) fort. Scratch wiederverwendet (alloc-frei), band-beschränkt.
    _caRoofChanged(a, dim, dimY) {
        const entry = this.state.voxelChunks ? this.state.voxelChunks.get(a.key) : null;
        if (!entry) return true;
        const dimSq = dim * dim;
        let fp = this.state._caFpScratch;
        if (!fp || fp.length < dimSq) fp = this.state._caFpScratch = new Float32Array(dimSq);
        const jHi = a.band ? Math.min(dimY - 1, a.band.jMax) : dimY - 1;
        const jLo = a.band ? Math.max(0, a.band.jMin) : 0;
        const level = a.level;
        for (let c = 0; c < dimSq; c++) {
            let v = 0;
            for (let j = jHi; j >= jLo; j--) {
                const lv = level[j * dimSq + c];
                if (lv > 0.05) {
                    v = j + lv;
                    break;
                }
            }
            fp[c] = v;
        }
        const old = entry._caMeshFp;
        if (!old || old.length !== dimSq) {
            entry._caMeshFp = new Float32Array(fp.subarray(0, dimSq));
            entry._caDachNeu = this._caDachAus(a.level, a.cells, dim, dimY, entry._caDachNeu);
            entry._caDachOffen = true;
            return true;
        }
        let maxAbs = 0;
        let sumAbs = 0;
        for (let c = 0; c < dimSq; c++) {
            const d = fp[c] - old[c];
            const ad = d < 0 ? -d : d;
            if (ad > maxAbs) maxAbs = ad;
            // Nur signifikante Spalten-Deltas (> 0.12) in die Summe: Quell-Pin-Spalten jittern dauerhaft ~0.05-0.1
            // (unsichtbar) und summierten sich sonst über viele Spalten auf > 1.0 → Re-Mesh jeden Frame für ein
            // unverändertes Bild. Breite Drift triggert weiter; maxAbs (0.25) fängt jede sichtbare Einzel-Spalte.
            if (ad > 0.12) sumAbs += ad;
        }
        if (maxAbs > 0.25 || sumAbs > 1.0) {
            old.set(fp.subarray(0, dimSq));
            entry._caDachNeu = this._caDachAus(a.level, a.cells, dim, dimY, entry._caDachNeu);
            entry._caDachOffen = true;
            return true;
        }
        return false;
    }

    // DAS GEZEICHNETE DACH eines Chunks: je Spalte die oberste nicht-solide Zeile mit Pegel > 0,5 plus ihr Füllgrad
    // (j + frac, −1 = keins) — exakt was das Zell-Sheet als Live-Dach rendert (`_caColumnScan`, derselbe Kern).
    // Die Re-Mesh-Entscheidung (`_caRoofChanged`) legt es als WUNSCH ab (`_caDachNeu`); gezeichnet wird es erst mit
    // dem EIGENEN Bau des Chunks (`_buildVoxelChunkWaterCellSheet` macht es zu `_caDach` und reiht die acht Nachbarn
    // ein). So liest jeder Nachbar immer genau das Dach, das der Chunk gerade zeigt — die Kante steht auf EINER Höhe.
    _caDachAus(level, cells, dim, dimY, out) {
        const dimSq = dim * dim;
        const d = out && out.length === dimSq ? out : new Float64Array(dimSq);
        for (let c = 0; c < dimSq; c++) {
            const sc = this._caColumnScan(cells, level, c, dimSq, dimY);
            d[c] = sc.liveTopJ >= 0 ? sc.liveTopJ + sc.liveFrac : -1;
        }
        return d;
    }

    // Level-Austausch über die gemeinsame Chunk-Grenze (lateral über die Naht, symmetrisch = Erhaltung).
    // dx=1: A.i=dim-1 ↔ B.i=0; dz=1: A.k=dim-1 ↔ B.k=0. Liefert die übertragene Menge. `touch` ({jMin,
    // jMax}) wird auf die WIRKLICH berührten Zeilen geweitet — damit weitet der Aufrufer die y-Bänder
    // BEIDER Chunks (die Union der alten Bänder reicht nicht: externe Level-Writes liegen ggf. außerhalb).
    _exchangeWaterBoundary(aLevel, aCells, bLevel, bCells, dx, dim, dimY, touch = null, aCap = null, bCap = null) {
        const SOLID = AnazhRealm.CELL_STATE.SOLID;
        const dimSq = dim * dim;
        const rate = 0.25;
        let xfer = 0;
        const SUPPORT = 0.9; // W-B — dieselbe Receiver-Support-Regel wie der Lateral-Pass
        const KEEP = AnazhRealm.CA_FLOW_KEEP; // V18.93 — derselbe Distanz-Decay über die Naht
        const EPS_FLOW = (1 - KEEP) * 1.1 + 1e-4; // V18.93 — der Decay-Fixpunkt (s. _tickWaterCA)
        for (let j = 0; j < dimY; j++) {
            const baseJ = j * dimSq;
            for (let s = 0; s < dim; s++) {
                const aIdx = dx === 1 ? baseJ + s * dim + (dim - 1) : baseJ + (dim - 1) * dim + s;
                const bIdx = dx === 1 ? baseJ + s * dim : baseJ + s;
                if (aCells[aIdx] === SOLID || bCells[bIdx] === SOLID) continue;
                const diff = aLevel[aIdx] - bLevel[bIdx];
                if (diff > EPS_FLOW || diff < -EPS_FLOW) {
                    // Empfänger gestützt? (darunter SOLID oder ≥0.9; j=0 = Weltboden)
                    const rcCells = diff > 0 ? bCells : aCells;
                    const rcLevel = diff > 0 ? bLevel : aLevel;
                    const rcIdx = diff > 0 ? bIdx : aIdx;
                    const rcCap = diff > 0 ? bCap : aCap;
                    if (rcCap && j > rcCap[rcIdx % dimSq]) continue; // V18.93 — Spiegel-Kappe
                    const rcBelow = rcIdx - dimSq;
                    if (rcBelow >= 0 && rcCells[rcBelow] !== SOLID && rcLevel[rcBelow] < SUPPORT) continue;
                    const t = diff * rate;
                    if (t > 0) {
                        aLevel[aIdx] -= t;
                        bLevel[bIdx] += t * KEEP;
                    } else {
                        aLevel[aIdx] -= t * KEEP;
                        bLevel[bIdx] += t;
                    }
                    xfer += t > 0 ? t : -t;
                    if (touch) {
                        if (j < touch.jMin) touch.jMin = j;
                        if (j > touch.jMax) touch.jMax = j;
                    }
                }
            }
        }
        return xfer;
    }

    // Der EINE Spalten-Scan-Kern des Zell-Sheets, top-down über EINE Spalte: höchste WATER-Zelle (Flood-
    // Ruhe), höchste nicht-solide Zelle mit Live-Level > 0.5 (nur mit `level`), höchste SOLID-Zelle
    // (Boden-Anker, liegt immer UNTER dem Wasser der Spalte).
    _caColumnScan(cells, level, colBase, dimSq, dimY) {
        const WATER = AnazhRealm.CELL_STATE.WATER;
        const SOLID = AnazhRealm.CELL_STATE.SOLID;
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

    // Welle A — die Gras-Queue synchron leeren (Test-Naht, Spiegel von
    // `_drainPendingWaterIso`): das Gras ist seit Welle A deferred, die Tests
    // brauchen es sofort nach einem Drain/Streaming.
    _drainPendingGrass() {
        const queue = this.state.pendingGrass;
        if (!queue || queue.size === 0) return 0;
        let built = 0;
        for (const key of [...queue]) {
            queue.delete(key);
            if (!this.state.voxelChunks || !this.state.voxelChunks.has(key)) continue;
            if (this.state.voxelChunkGrass && this.state.voxelChunkGrass.has(key)) continue;
            const comma = key.indexOf(",");
            const cx = parseInt(key.slice(0, comma), 10);
            const cz = parseInt(key.slice(comma + 1), 10);
            this._buildVoxelChunkGrass(cx, cz);
            built++;
        }
        return built;
    }

    // Streu-Strukturen eines Voxel-Chunks (Felsen/Geoden/Glutbrunnen/Formationen + Unterwuchs): Sample-
    // Raster über die Chunk-Bounds (`span`, origin-basiert) durch `_vegetationSampleSpawn`, Höhe aus
    // `_voxelSurfaceY`; die Bäume pflanzt `_forestPlantChunk`. Idempotent über
    // `state.voxelPopulatedChunks`, am Voxel-Chunk-Lifecycle aufgehängt.
    _populateVoxelChunkVegetation(cx, cz, opts = {}) {
        if (!this.state.scene || !this.state.blueprints) return 0;
        if (!this.state.voxelPopulatedChunks) this.state.voxelPopulatedChunks = new Set();
        const key = `${cx},${cz}`;
        if (this.state.voxelPopulatedChunks.has(key)) return 0;
        this.state.voxelPopulatedChunks.add(key);

        const { span } = this._voxelChunkConfig();
        const ox = cx * span;
        const oz = cz * span;
        // SAMPLES = 10 je Achse: mehr Sample-Stellen × dieselbe chance-Formel = dichtere Wald-Regionen, mehr
        // Lücken im Gras (forest-mask × clumpAt clumpt natürlich). Die Dichte regelt `foliageRadius`
        // kapazitäts-gemessen.
        const SAMPLES = 10;
        const step = span / SAMPLES;
        // `opts.immediate === true` umgeht die Spawn-Queue (Test-/Worldgen-Pfade, synchron); Default false →
        // Queue, per Frame gedrosselt.
        const prevImmediate = this._vegSpawnImmediate || false;
        this._vegSpawnImmediate = !!opts.immediate;
        let spawned = 0;
        // die Bauplan-Tags je Chunk EINMAL (Pläne und Stoffe ändern sich in diesem synchronen Lauf nicht)
        const tagsJe = new Map();
        try {
            for (let zi = 0; zi < SAMPLES; zi++) {
                for (let xi = 0; xi < SAMPLES; xi++) {
                    const sampleX = ox + (xi + 0.5) * step;
                    const sampleZ = oz + (zi + 0.5) * step;
                    const surfaceY = this._voxelSurfaceY(sampleX, sampleZ);
                    if (surfaceY === null || !Number.isFinite(surfaceY)) continue;
                    const seedForSpawn = ((cx * 73856093) ^ (cz * 19349663) ^ (xi * 83492791) ^ (zi * 11)) >>> 0;
                    spawned += this._vegetationSampleSpawn(sampleX, sampleZ, surfaceY, seedForSpawn, tagsJe);
                }
            }
            // Die Bäume pflanzt der Wald-Generator (`_forestPlantChunk`, zell-deterministisch: Poisson-Disc +
            // Nische + reverse-J + Dichte-Gradient), nicht das Sample-Raster. Jeder Baum gehört genau dem Chunk
            // seiner Position → genau einmal.
            spawned += this._forestPlantChunk(cx, cz);
        } finally {
            this._vegSpawnImmediate = prevImmediate;
        }
        return spawned;
    }

    // ### emergente Welt-Effekte ###
    // Ein gebauter Compound mit hoher Resonanz + Präzision lässt die Welt klingen + erinnert sich; hohe
    // Magieleitung wirft eine Emotion-Welle (awe + hope). One-shot pro Bauplan (kein Spawn-Spam);
    // Schwellen zentral in WORLD_EFFECT_THRESHOLDS.
    _applyCompoundWorldEffects(blueprintName) {
        const bp = this.state.blueprints && this.state.blueprints[blueprintName];
        if (!bp) return;
        // Welt-Effekte lesen räumlich angereicherte Tags (computeSpatialTags: Spitze richtet, Kontakt
        // überträgt) statt der atomaren MAX-Aggregation; computeCompoundTags bleibt die Basis für UI/Tests.
        const tags = this.computeSpatialTags(bp);
        const avgPrec = this._compoundAvgPrecision(bp);
        const T = AnazhRealm.WORLD_EFFECT_THRESHOLDS;
        // Präzision moduliert ALLE Effekt-Stärken (gleiches Material, 0.4 vs 0.97 Präzision → schwächer vs
        // stärker). Min-Faktor 0.3: raue Arbeit trägt etwas, bricht aber unter der Schwelle ab.
        const precisionFactor = Math.max(0.3, avgPrec);
        const resonates = (tags.resoniert || 0) >= T.resonance_strong;
        const magicConducts = (tags.magieleitung || 0) * precisionFactor >= T.magic_strong;
        const isPrecise = avgPrec >= T.precision_high;

        if (resonates && isPrecise) {
            this.journalAppendOnce(
                `singing:${blueprintName}`,
                "growth",
                `Eine Form singt: ${bp.label || blueprintName} schwingt rein im Klang.`,
                { blueprint: blueprintName, resonance: tags.resoniert, precision: avgPrec }
            );
            // Die Form singt: eine reine Sinus-Welle, die Tonhöhe folgt der Resonanz (klang:SUBSTANZ.singen) — am
            // Master (vorher am Ausgang vorbei: der Master-Regler erreichte sie nie).
            this._substanzKlang("singen", tags);
        }

        if (magicConducts && this.state.player && this.state.player.emotions) {
            this.state.player.emotions.awe = Math.min(1, (this.state.player.emotions.awe || 0) + 0.1);
            this.state.player.emotions.hope = Math.min(1, (this.state.player.emotions.hope || 0) + 0.1);
            this.journalAppendOnce(
                `magic_compound:${blueprintName}`,
                "growth",
                `Etwas Magisches in der Luft, als ${bp.label || blueprintName} entstand.`,
                { blueprint: blueprintName, magic: tags.magieleitung }
            );
        }

        // Brech-Warnung: liegt IRGENDEINE Verbindung unter 0.7, gibt es einen einmaligen Journal-Eintrag
        // (idempotent je Bauplan-Name); die rote Linie ist das visuelle Pendant. Nur Warnung.
        if (Array.isArray(bp.connections) && bp.connections.length > 0) {
            let weakest = Infinity;
            let weakestType = null;
            for (const c of bp.connections) {
                const s = this.computeConnectionStrength(c, bp);
                if (s < weakest) {
                    weakest = s;
                    weakestType = c.type;
                }
            }
            if (weakest < 0.7 && weakestType) {
                this.journalAppendOnce(
                    `weak_connection:${blueprintName}`,
                    "weakness",
                    `Eine ${weakestType}-Verbindung in „${bp.label || blueprintName}" trägt knapp ` +
                        `(Last ${weakest.toFixed(2)}).`,
                    { blueprint: blueprintName, weakest: weakest, type: weakestType }
                );
            }
        }
    }

    // Pro-Frame-Tick: animate() auf jeder Struktur mit Mesh + animate-Hook; cold (mesh=null) übersprungen.
    // Architektur-Idle (Mühlen drehen, Banner flattern): je Architektur EINMAL lazy klassifiziert
    // (`_idleMotion` über `computeMotionRoles` mit den Bauplan-Verbindungen), gefiltert auf SICHERE Rollen
    // — NUR rad/segel/tuer/wirbel; bein/arm/kopf-Resonanz wackelt NIE (eine Statue läuft nicht).
    tickArchitectures(currentTime) {
        const list = this.state.architectures;
        if (!list || list.length === 0) return;
        const tSec = currentTime / 1000;
        const mountedId = this.state.player && this.state.player.mountedArch;
        for (const entry of list) {
            if (!entry.mesh || !entry.mesh.userData) continue;
            // V18.150 — das GERITTENE Gefährt animiert der Fahr-Tick
            // (_tickMountedMovement: Phase ∝ Weg) — der Idle-Animator
            // pausiert dafür (sonst überschrieben sich beide pro Frame).
            if (mountedId !== null && mountedId !== undefined && entry.id === mountedId) continue;
            if (typeof entry.mesh.userData.animate === "function") {
                entry.mesh.userData.animate(currentTime);
            }
            if (entry.mesh.userData._idleMotion === undefined) {
                const bp = this.state.blueprints && this.state.blueprints[entry.type];
                const roles =
                    bp && Array.isArray(bp.parts) && bp.parts.length >= 2
                        ? this.computeMotionRoles(bp.parts, bp.connections)
                        : null;
                const idle = roles
                    ? roles.map((r) =>
                          r && (r.role === "rad" || r.role === "segel" || r.role === "tuer" || r.role === "wirbel")
                              ? r
                              : null
                      )
                    : null;
                entry.mesh.userData._idleMotion = idle && idle.some(Boolean) ? idle : null;
            }
            if (entry.mesh.userData._idleMotion) {
                this._animateCompoundMotion(entry.mesh, entry.mesh.userData._idleMotion, tSec, 0, false);
            }
        }
    }

    // Distanz-Culling: Daten-Einträge bleiben immer, nur die GPU-Last ist begrenzt — in Reichweite ohne
    // Mesh → bauen, außerhalb mit Mesh → disposen. So kann der Spieler unbegrenzt bauen.
    tickArchitectureCulling() {
        // Der Scan läuft je Frame (Distanz-Checks trivial), die teuren Builds sind auf
        // `architectureBuildBudgetPerFrame` gedeckelt (sonst baut ein Tick beim Eintritt in eine dichte Region
        // alles auf einmal). Cull (fern) ist billig → ungedeckelt.
        const playerPos = this.state.playerMesh ? this.state.playerMesh.position : null;
        if (!playerPos) return;
        // DIE STAND-WACHE: ging der Gang über alle Einträge ohne Bau, Räumung und Wartende, und regt sich nichts (Ort,
        // Bau-Menge, Ankunft, Cull-Radius), träfe er dieselben Urteile — kein Gang (gemessen 07.10., Mess-Wiese, Stand:
        // 1540 Einträge je Takt, 0 Bauten, 0 Räumungen).
        if (this._standRuht("archCull", 1, { pos: playerPos, rand: AnazhRealm.STAND_RAND_FERN_M }, "bau")) return;
        let regung = 0;
        const radius = this.state.architectureCullingRadius;
        const radiusSq = radius * radius;
        // Kollision ist feld-nativ (`entry.blockerAABBs` ab Spawn) → der Cull-Tick steuert NUR das Rendern,
        // keine Ammo-Bodies. Über Budget (_frameOverBudget) → 0 Bauten, bei Kopfraum der geregelte Durchsatz:
        // die Welt wächst in den Lücken, nie auf Kosten des Spielers. Das Cullen läuft weiter (billig).
        const budget = this.state._frameOverBudget ? 0 : Math.max(1, this.state.architectureBuildBudgetPerFrame || 3);
        let built = 0;
        const ziegelOffen = this._archZiegelOffen || (this._archZiegelOffen = []);
        const nahOffen = this._archNahOffen || (this._archNahOffen = []);
        const ohneFeld = !!(this.state.renderer && this.state.renderer._isHeadlessNull); // Null-Renderer: kein Feld
        // DER KARTEN-HORIZONT: die Karte eines gesetzten Karten-Dings trägt bis zu SEINEM Rand (`_archKartenHorizont`, im
        // Saum vor `SCATTER.outerM`, dem Rand der Deko-Streu); geräumt wird erst ein Totband dahinter (kein Flattern).
        const totband = AnazhRealm.KARTEN_HORIZONT_TOTBAND_M;
        const saumSq = (AnazhRealm.SCATTER.outerM - AnazhRealm.KARTEN_HORIZONT_SAUM_M) ** 2;
        for (const entry of this.state.architectures) {
            const dx = entry.position.x - playerPos.x;
            const dz = entry.position.z - playerPos.z;
            const distSq = dx * dx + dz * dz;
            // DIE FERNFORM DER KARTEN-DINGE (Studio-Vertrag B2c `fernform: "karte"`, `_archKartenPreset`): Baum und Strauch
            // tragen ihre Studio-Kette über die Mesh-Zone hinaus und SIND dort ihre Karte — dieselbe EINE Stufen-Wahl wie
            // nah (die Wahrnehmung legt jeden Baum jenseits seines L1↔Karte-Bands auf die Karte, einen Riesen erst dort;
            // eine eigene Zonen-Klemme am Radius sprang ihn bis zur Integration 05.10. ohne Band) — bis zu ihrem
            // Karten-Horizont, nie ein Analog-Satz. Bis 05.10. trug jeder gesetzte Baum
            // jenseits des Cull-Radius einen Kegel-und-Lappen-Satz im Welt-March: aus 45 m standen glatte, gestreifte,
            // einfarbig hellgrüne Ellipsoide vor dem Wald (Blick-Tour 10-panorama-45m, 895 Sätze an der Mess-Wiese), am
            // Radius sprang die Karte in den Satz. Eine Brücke braucht die Karten-Art nicht: steht ihre Wunsch-Stufe noch
            // nicht, trägt die gedockte Karte (`_rebuildArchitectureMesh`).
            if (this._archKartenPreset(entry)) {
                if (entry._ziegelSlot) {
                    this._archZiegelTod(entry);
                    regung++;
                }
                // diesseits des Saums trägt jedes; im Saum und dahinter fragt der Eintrag SEINEN Rand
                const h = distSq <= saumSq ? Infinity : this._archKartenHorizont(entry);
                if (distSq <= h * h) {
                    if (!this._archIsRendered(entry)) {
                        entry._nahD2 = distSq;
                        nahOffen.push(entry);
                    }
                } else if (distSq > (h + totband) ** 2 && this._archIsRendered(entry)) {
                    this._cullArchitectureMesh(entry);
                    regung++;
                }
                continue;
            }
            // DIE MESH-ZONE (der geregelte Cull-Radius, 100–150 m): hier IST das Studio-Mesh die Gestalt, der
            // LOD-Tick schaltet die Stufen nach Distanz. Bis das Mesh steht, trägt das Feld (kein Loch beim
            // Streamen); steht es, schweigt das Feld — sonst läge der konservative Box-Satz VOR dem Mesh. Jenseits
            // des Radius ist der Box-Satz die Gestalt der Bauten und Steine (klein im Bild, billig).
            if (distSq <= radiusSq) {
                // Der Ziegel-Ruf hängt NICHT am Mesh-Budget — er taktet sich selbst (Bake-Garantie, memoisiert).
                // Lebende Slots aktivieren sofort; ungebackene Bauten warten in DERSELBEN Distanz-Schlange wie die
                // fernen (Befund 02.10., gate:arch-feld: in Listen-Reihenfolge fraß das Dorf den überbuchten
                // Bake-Takt, 24 von 226 Anfragen bewilligt — ein frisch gesetztes Haus in 27 m blieb 200 Takte
                // ohne Feld UND ohne Mesh, unsichtbar).
                entry._ziegelNah = true;
                const echt = this._archIsRendered(entry);
                if (entry._ziegelSlot || entry._ziegelGebacken || ohneFeld) {
                    if (this._archZiegelFern(entry)) regung++;
                } else {
                    // Steht das Mesh schon, braucht der Bau keine Brücke: sein Satz bäckt NACH allen Bedürftigen
                    // vor (für den Rand der Mesh-Zone) und stiehlt ihnen nie den Takt.
                    entry._ziegelD2 = echt ? distSq + AnazhRealm.ZIEGEL_VORBACK_D2 : distSq;
                    ziegelOffen.push(entry);
                }
                if (!echt) {
                    entry._nahD2 = distSq;
                    nahOffen.push(entry);
                }
                if (entry._ziegelSlot) this._weltFeldAktiv(entry._ziegelSlot, !echt);
                if (entry.mesh && entry.mesh.visible !== echt) {
                    entry.mesh.visible = echt;
                    regung++;
                }
            } else {
                entry._ziegelNah = false;
                if (this._archIsRendered(entry)) {
                    this._cullArchitectureMesh(entry);
                    regung++;
                }
                // NAH ZUERST: lebende Slots aktivieren sofort (billig); ungebackene ferne Bauten warten auf den Gang
                // NACH der Liste, dort nach Distanz sortiert — sonst verhungert ein frisch gesetzter Bau hinter alten.
                if (entry._ziegelSlot || entry._ziegelGebacken || ohneFeld) {
                    if (this._archZiegelFern(entry)) regung++;
                } else {
                    entry._ziegelD2 = distSq;
                    ziegelOffen.push(entry);
                }
            }
        }
        // Wartende (ein Bau, ein Satz) halten den Gang wach; was hier entsteht oder fällt, regt die Welt.
        const offen = nahOffen.length + ziegelOffen.length;
        // Mesh-Bauten NAH ZUERST (die Mesh-Zone, dahinter die Karten-Zone der Karten-Dinge): budgetiert; über Budget
        // mit Takt-Garantie (ein Bau je 250 ms, wie die Bake-Garantie des Felds) — sonst bliebe auf langsamem Holz die
        // Mesh-Zone für immer Feld.
        // Das Budget zählt GEBAUTE Meshes, nicht Versuche: ein Eintrag, dessen Studio-Asset noch lädt (Flat null/
        // false — z. B. die L2-Karte im Bäcker), kehrt billig zurück und darf den fertigen dahinter nicht aushungern
        // (Befund 30.09.: die nächsten Karten-Wartenden fraßen jeden Takt das Budget, 7 bereite Eichen standen).
        // Versuche sind gedeckelt (ARCH_NAH_VERSUCHE je Takt). WER LÄDT, VERBRAUCHT KEINEN VERSUCH: ein Bau, dessen
        // Flat zuletzt null lieferte, wartet, bis die Foundry etwas Neues liefert (Ankunfts-Generation), höchstens
        // 1 s — sonst fraßen 24 nähere Wartende hinter einem ausgelasteten Worker jeden Takt die Kappe, und ein
        // sofort baubares Haus dahinter blieb 800 Takte ohne Mesh (gemessen 03.10., gate:arch-feld: 17 offene
        // Worker-Aufträge, Haus „grammatik", mesh false).
        if (nahOffen.length) {
            nahOffen.sort((a, b) => a._nahD2 - b._nahD2);
            const fA = this._foundry ? this._foundry.ankunft | 0 : 0;
            const uhr = () => (typeof performance !== "undefined" ? performance.now() : Date.now());
            const jetztN = uhr();
            // DIE GEDOCKTE STUDIO-STUFE IST KEIN BAU: liegt die Wunsch-Stufe (oder als Brücke die Karte) gedockt bereit,
            // kostet das Platzieren einen Instanz-Slot — gemessen 04.10. (echte GPU, Mess-Wiese): 197 Einträge in
            // 2,5 ms. Es läuft am Bau-Budget und an der Versuchs-Kappe vorbei, nah zuerst, begrenzt nur von der
            // Platzier-Uhr (`ARCH_PLATZ_MS`). Vorher zählte es wie ein Grammatik-Bau: über Budget ein Eintrag je
            // 250 ms — nach der Rückkehr an die Mess-Wiese standen 165 Analog-Sätze < 64 m und schmolzen 20 s lang
            // (die Klumpen der Blick-Tour).
            // Ist das Bau-Budget erschöpft, endet nur das BAUEN (`bauZu`), nie der Gang: der erste nahe Eintrag, dessen
            // Asset noch lädt oder dessen Grammatik baut, brach vorher die Schleife — alle gedockten dahinter warteten.
            const platzBis = jetztN + AnazhRealm.ARCH_PLATZ_MS;
            const fAn = this._foundryEnabled();
            let versuche = 0,
                bauZu = false,
                hand = null; // über Budget: EIN Takt-Garantie-Blick je Tick, er deckt Versuche bis zum ersten Bau
            for (const entry of nahOffen) {
                const fPre = fAn ? this._foundryPresetForEntry(entry) : null;
                if (fPre && uhr() < platzBis && this._foundryPlatzBereit(entry, fPre)) {
                    this._rebuildArchitectureMesh(entry);
                    if (this._archIsRendered(entry)) {
                        entry._nahWartet = null;
                        if (entry._ziegelSlot) this._weltFeldAktiv(entry._ziegelSlot, false);
                        regung++;
                        continue;
                    }
                }
                if (bauZu) continue;
                const w = entry._nahWartet;
                if (w && w.a === fA && jetztN - w.t < 1000) continue;
                if (versuche++ >= AnazhRealm.ARCH_NAH_VERSUCHE) {
                    bauZu = true;
                    continue;
                }
                if (built >= budget) {
                    if (hand === null) hand = this._handBauErlaubt(budget);
                    if (!hand) {
                        bauZu = true;
                        continue;
                    }
                }
                this._rebuildArchitectureMesh(entry);
                if (this._archIsRendered(entry)) {
                    entry._nahWartet = null;
                    if (built++ >= budget) hand = false;
                    if (entry._ziegelSlot) this._weltFeldAktiv(entry._ziegelSlot, false);
                    if (entry.mesh) entry.mesh.visible = true;
                    regung++;
                } else entry._nahWartet = { a: fA, t: jetztN };
            }
            nahOffen.length = 0;
        }
        // DIE EINE ZIEGEL-SCHLANGE (nah wie fern), nach Distanz: der Bake-Takt geht an den nächsten Bau. In der
        // Mesh-Zone trägt ein frischer Slot nur, solange das Mesh nicht steht.
        if (ziegelOffen.length) {
            ziegelOffen.sort((a, b) => a._ziegelD2 - b._ziegelD2);
            for (const entry of ziegelOffen) {
                if (this._archZiegelFern(entry)) regung++; // selbst-getaktet (Bake-Garantie)
                if (entry._ziegelNah && entry._ziegelSlot)
                    this._weltFeldAktiv(entry._ziegelSlot, !this._archIsRendered(entry));
            }
            ziegelOffen.length = 0;
        }
        // Foundry-Drain: baut kalte Foundry-Einträge + hebt vor Studio-ready gespawnte auf das Studio-Asset.
        // Budget-gedeckelt (pausiert über Budget) → die Erst-Welt konvergiert ohne Spike. Headless/Studio
        // nicht ready → früher No-op.
        const kalt = this._foundryRewarmColdTrees();
        // V18.297 — die Welt ATMET: autonome (Nexus-)Bauten sind gedeckelt; ist das
        // Limit erreicht, verblasst das FERNSTE (am Horizont, am wenigsten vermisst).
        this._capNexusStructures(playerPos);
        this._standMeldet("archCull", 1, regung > 0, offen + kalt > 0);
    }

    // Autonome Bauten bounded: sie spawnen fern (far_player, jenseits des Cull-Radius), der Bestand ist
    // gedeckelt; über dem Cap fällt das FERNSTE (am wenigsten vermisst; ohne Nebel ist sein Fall sichtbar) — der Heap
    // läuft nie voll. Filter +
    // Sort nur über Cap, im Culling-Tick.
    _capNexusStructures(playerPos) {
        const arches = this.state.architectures;
        if (!arches || arches.length === 0) return;
        const cap = AnazhRealm.MAX_NEXUS_STRUCTURES;
        const autos = [];
        for (const e of arches) if (e && e.autonomous) autos.push(e);
        if (autos.length <= cap) return;
        const pp = playerPos || (this.state.playerMesh ? this.state.playerMesh.position : null);
        const distSq = (e) => {
            if (!pp) return -(typeof e.id === "number" ? e.id : 0); // ohne Spieler: ältestes zuerst
            const dx = e.position.x - pp.x;
            const dz = e.position.z - pp.z;
            return dx * dx + dz * dz;
        };
        autos.sort((a, b) => distSq(b) - distSq(a)); // das Fernste zuerst
        const toEvict = autos.length - cap;
        for (let i = 0; i < toEvict; i++) this._evictArchitecture(autos[i]);
    }

    // V18.297 — eine Architektur vollständig entfernen (Mesh+Geometrie+Kollision via
    // _cullArchitectureMesh, dann der Eintrag). Die EINE Eviction-Quelle.
    _evictArchitecture(entry) {
        if (!entry) return;
        if (this._archIsRendered(entry)) this._cullArchitectureMesh(entry);
        const arches = this.state.architectures;
        const idx = arches ? arches.indexOf(entry) : -1;
        if (idx >= 0) {
            arches.splice(idx, 1);
            this._blockerAustritt(entry);
        }
        this._weltRegt(); // die Bau-Menge regt sich: die Stand-Wache weckt die Fege-Takte
    }

    // ### Bau-Modus (Phantom-Cursor) ###
    // Die Hotbar wählt den Bauplan; ein halb-transparentes Phantom schwebt bm.phantomDistance (5 m) vor
    // dem Spieler (Yaw-Richtung), F baut dort, ESC verlässt den Modus. Das Phantom ist ein normaler
    // Builder-Group mit transparenten Materialien — kein Sondermodell.

    // Hotbar-Slot 0..8 wählen: leerer Slot → Bau-Modus aus; derselbe aktive Slot erneut → Modus aus
    // (Toggle); sonst Phantom auf den neuen Bauplan.
    selectHotbarSlot(slotIndex) {
        const bm = this.state.buildMode;
        const idx = Math.max(0, Math.min(8, slotIndex | 0));
        const blueprintName = this.state.hotbar[idx];
        // Toggle: gleicher aktiver Slot → Modus aus.
        if (bm.active && bm.slotIndex === idx) {
            this._clearBuildMode();
            this._updateHotbarHighlight();
            return;
        }
        // Leerer Slot: keinen Modus aktivieren (aber Highlight setzen).
        if (!blueprintName || !this.state.blueprints[blueprintName]) {
            this._clearBuildMode();
            bm.slotIndex = idx;
            this._updateHotbarHighlight();
            return;
        }
        // Hotbar-Gate: die Natur des Bauplans (aus Rolle + Form gelesen, kein Hand-Flag) entscheidet — eine
        // PLATZIERBARE Struktur bekommt das Phantom (unten), alles andere (Gerät/Rüstung/Seele/Trank) geht in
        // die Hand/an den Körper. Re-Auswahl des gehaltenen Slots → ablegen.
        if (!this._isPlaceableBlueprint(this.state.blueprints[blueprintName])) {
            this._clearBuildMode(); // kein Phantom
            bm.slotIndex = idx;
            const heldNow = this.state.player && this.state.player.equipped && this.state.player.equipped.held;
            const label = this.state.blueprints[blueprintName].label || blueprintName;
            if (heldNow === blueprintName) {
                this.equipHeld(null); // schon in der Hand → ablegen (Faust)
                this.log(`Abgelegt: ${label}`, "INFO");
            } else {
                // S3-B — der Spieler-Pfad: ein ungeschmiedetes Gerät wird hier GESCHMIEDET (zahlt
                // pfad/frieden), ein geschmiedetes frei in die Hand genommen.
                const result = this.wieldBlueprint(blueprintName);
                if (!result.ok) {
                    // Die Absage des Griffs spricht der Spieler-Kanal (Gegenprüfung 08.10.: sie stand nur im
                    // eingeklappten Log) — derselbe Formatter wie Werkstatt-Knopf und Setzen (`_machTorHint`).
                    this._spielerSagt(`${String(label).split(/\s[·—(]/)[0]}: ${this._machTorHint(result)}`);
                } else {
                    this.log(`In der Hand: ${label} (Slot ${idx + 1})`, "INFO");
                }
            }
            this._updateHotbarHighlight();
            if (typeof this.renderPlayerEquipUI === "function") this.renderPlayerEquipUI();
            return;
        }
        bm.active = true;
        bm.slotIndex = idx;
        bm.blueprintName = blueprintName;
        this._bauPhantomNeu(); // das alte Phantom (Bauplan-Wechsel) weicht
        this._updateBuildModeHud();
        this._updateHotbarHighlight();
        this.log(`Bau-Modus: ${blueprintName} (Slot ${idx + 1})`, "INFO");
    }

    // Das Phantom des Bau-Modus NEU (die Auswahl eines Bauplans und jedes Setzen, das den nächsten Samen zieht): das alte
    // weicht (Ort und Blick gehen über, kein Bild am Ursprung), das neue liest die GETEILTE Merge-Cache der platzierten
    // Struktur (kein Neubau je Teil → kein Auswahl-Hänger); Transparenz/castShadow regelt `_buildPlacementGhost`
    // (gecachter Material-Klon). Die Studio-Gestalt führt, wenn das Studio sie trägt (dieselbe Quelle wie der finale Eintrag).
    _bauPhantomNeu() {
        const bm = this.state.buildMode;
        const alt = bm.phantomMesh;
        if (alt) {
            if (this.state.scene) this.state.scene.remove(alt);
            this._disposeSoulGroup(alt);
        }
        bm.phantomMesh = null;
        bm.phantomStudioPending = null; // B1 — frisches Phantom, kein Alt-Pending
        // der Ort des Phantoms: der des alten, sonst der Blick (die Gestalt eines Baums folgt ihm, `_phantomWerk`)
        const wo = alt ? alt.position : this.state.playerMesh && bm.active ? this._resolvePhantomTarget() : null;
        const phantom = this._buildPlacementGhost(this.state.blueprints[bm.blueprintName], { wo });
        phantom.name = "bau-phantom";
        if (alt) {
            phantom.position.copy(alt.position);
            phantom.rotation.y = alt.rotation.y;
        }
        if (this.state.scene) this.state.scene.add(phantom);
        bm.phantomMesh = phantom;
    }

    // EIN BAUWERK GEHT IN DEN BAU-MODUS, NIE IN DIE HAND (Welle L, Befund V-k11): sein Hotbar-Platz (vorhanden, sonst
    // der erste freie) wird gewählt — das Phantom steht vor dir, RMB oder F setzt es. Werkstatt-FERTIGEN legte die Eiche
    // (7,8 × 8,8 × 6,4 m) in die Hand, RMB schüttete dann auf, und keine UI leerte die Hand. Ohne freien Platz: laut.
    // Das Vorab-Tor sitzt HIER, in der Engstelle jedes Wegs in den Bau-Modus (Werkstatt-Knopf, Rezeptbuch, das Werk in
    // der Hand — Gegenprüfung 08.10.: es saß am Aufrufer, der Rechtsklick mit dem Werk in der Hand führte in frieden ohne
    // Material in einen Bau-Modus, der nur ablehnen konnte). Die Hotbar-Taste wählt den Platz selbst: dort nennt das
    // Bau-HUD die fehlenden Zahlen rot, und das Setzen sagt die Absage im Spieler-Kanal.
    _bauModusFuer(name) {
        if (!name || !this.state.blueprints || !this.state.blueprints[name]) return { ok: false, reason: "unknown" };
        const vorab = this._bauVorabTor(name);
        if (!vorab.ok) return vorab;
        const hb = this.state.hotbar || [];
        let idx = hb.indexOf(name);
        if (idx < 0) {
            idx = hb.findIndex((x) => !x);
            if (idx < 0) return { ok: false, reason: "hotbar_voll" }; // der Aufrufer sagt es (`_machTorHint`)
            this.setHotbarSlot(idx, name);
        }
        const bm = this.state.buildMode;
        if (!(bm.active && bm.slotIndex === idx && bm.blueprintName === name)) this.selectHotbarSlot(idx);
        return { ok: !!(bm.active && bm.blueprintName === name), slot: idx, free: !!vorab.free };
    }

    // DAS VORAB-TOR des Bau-Modus (Welle L Folge, L-Werkstatt): FERTIGEN führt nur dann in den Bau-Modus, wenn das Setzen
    // tragen KANN — das Gesetz des Modus: frieden und pfad zahlen Material, frei baut nur schöpfer (S2, Schöpfer-Befund
    // V17.60 „frieden bedeutet nicht gratis, das wäre der Schöpfer-Modus"). Es fragt `checkBuildCost`, ohne zu ziehen;
    // gezogen wird beim Setzen (`confirmBuild`, das EINE Mach-Tor). Befund: in frieden führte FERTIGEN in den Bau-Modus, der
    // Rechtsklick verweigerte, und die Absage stand nur im Log.
    _bauVorabTor(name) {
        if (this.getGameMode() === "schöpfer") return { ok: true, free: true };
        const c = this.checkBuildCost(name);
        return c.ok ? { ok: true } : { ok: false, reason: "not_enough_material", missing: c.missing, cost: c.cost };
    }

    // DAS URTEIL DES SETZENS (Integration V18.536, Auflage 2 der zweiten Werkstatt-Gegenprüfung): was `confirmBuild` am
    // Ort `ziel` ablehnen wird, in seiner Reihenfolge — pfad: der Standort trägt nicht (das Phantom ist instabil); pfad: keine
    // Werkstatt der Domäne in der Nähe (`_workshopStationGate`); ein Natur-Werk: die Natur-Wand (`_naturWand`); frieden und
    // pfad: das Material (`_bauVorabTor`, fragt ohne zu ziehen). Leser: das Phantom (`tickBuildMode` — grün nur, wenn das
    // Setzen trägt) und das Setzen selbst (Standort und Werkstatt; Natur-Wand und Material urteilen dort die Akte, die sie
    // tun). Befund: die Tönung urteilte nur über den Ort — auf dem Hotbar-Weg in frieden ohne Material stand das Phantom
    // grün, das Setzen lehnte ab. Rückgabe { ok, grund: standort | werkstatt | natur | material, … }.
    _setzUrteil(name, ziel, stabil) {
        if (this.getGameMode() === "pfad" && !stabil) return { ok: false, grund: "standort" };
        const station = this._workshopStationGate(name, ziel);
        if (!station.ok) {
            const d = station.neededDomain;
            const domaene = (AnazhRealm.TOOL_DOMAIN_LABELS && AnazhRealm.TOOL_DOMAIN_LABELS[d]) || d;
            return { ok: false, grund: "werkstatt", domaene };
        }
        const wand = this._istNatur({ type: name }) ? this._naturWand(name, ziel, {}) : false;
        if (wand) return { ok: false, grund: "natur", wand };
        const vorab = this._bauVorabTor(name);
        if (!vorab.ok) return Object.assign({ grund: "material" }, vorab);
        return { ok: true, grund: null };
    }

    // Bauplan in einen Hotbar-Slot legen. Persistiert sich automatisch via
    // Save. UI im Spieler-Drawer ruft das auf.
    setHotbarSlot(slotIndex, blueprintName) {
        const idx = Math.max(0, Math.min(8, slotIndex | 0));
        if (blueprintName && !this.state.blueprints[blueprintName]) {
            this.log(`Hotbar-Slot ${idx + 1}: unbekannter Bauplan '${blueprintName}'`, "ERROR");
            return false;
        }
        this.state.hotbar[idx] = blueprintName || null;
        this._renderHotbarDOM();
        // Wenn der aktive Slot geändert wurde, Phantom-Mesh neu bauen.
        if (this.state.buildMode.slotIndex === idx) {
            const wasActive = this.state.buildMode.active;
            this._clearBuildMode();
            if (wasActive && blueprintName) this.selectHotbarSlot(idx);
        }
        return true;
    }

    _clearBuildMode() {
        const bm = this.state.buildMode;
        if (bm.phantomMesh && this.state.scene) {
            this.state.scene.remove(bm.phantomMesh);
            this._disposeSoulGroup(bm.phantomMesh);
        }
        bm.active = false;
        bm.blueprintName = null;
        bm.phantomMesh = null;
        bm.phantomWand = null;
        bm.phantomGrund = null;
        bm.phantomStudioPending = null; // B1 — kein Heil-Swap für einen verlassenen Bauplan
        this._updateBuildModeHud();
    }
}
