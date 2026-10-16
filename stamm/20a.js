class AnazhRealm_Z20a {
    // ===== ATLAS §20 · SPAWN-ÖKOLOGIE — Affinität · Boden-Material · Klump/Streu-Verteilung =====
    // Affinity = wie stark resonieren die Compound-Tags eines Bauplans mit
    // dem Welt-Feld an Position (x, z)? Dot-Product über die 4 Achsen des
    // Welt-Feldes. Resultat 0..1 (sum / 4 da MAX-aggregierte Tags ebenfalls
    // 0..1 nach computeCompoundTags + Felder 0..1). Bauplan-Tags > 1 bei
    // räumlicher Verstärkung würden das überschreiten — wir clampen final.
    spawnAffinityForBlueprint(name, x, z, feuchte) {
        const bp = this.state.blueprints && this.state.blueprints[name];
        if (!bp) return 0;
        const world = this.worldFieldAt(x, z);
        const tags = this.computeCompoundTags(bp);
        // Fünfte Stimme: feuchte resoniert mit lebendig (Bäume folgen Flüssen; brennbar resoniert nicht).
        // Der Populator reicht feuchte je Sample (kein Hot-Path-Bucket-Walk); fehlt sie, misst der seltene
        // Direkt-Aufrufer (Diag/UI) selbst. Legacy-Welten: _feuchteAt → 0.
        return this._affinitaet(tags, world, Number.isFinite(feuchte) ? feuchte : this._feuchteAt(x, z));
    }

    // DIE AFFINITÄT (die EINE Formel): Bauplan-Tags × Welt-Feld an einer Stelle × Feuchte. Der Populator rechnet das
    // Feld je Sample EINMAL und die Tags je Chunk EINMAL (`_vegetationSampleSpawn`) — bis Welle K rechnete jeder der
    // zwölf Kandidaten je Sample beides neu (sechs Rausch-Abfragen, alle Teile des Bauplans).
    _affinitaet(tags, world, fw) {
        if (!tags) return 0;
        let score = 0;
        // Vier Achsen × Tag-Wert. Wenn eine Welt-Achse hoch und der Bauplan
        // dort Material-Tag-Wert hoch hat → Resonanz.
        score += world.lebendig * (tags.lebendig || 0);
        score += world.dichte * (tags.dichte || 0);
        score += world.glut * (tags.brennbar || 0); // glut → brennbar (Material-Achse)
        score += world.magieleitung * (tags.magieleitung || 0);
        score += fw * (tags.lebendig || 0) * AnazhRealm.FEUCHTE.affinitaetGewicht;
        return Math.max(0, Math.min(1, score / 4));
    }

    // Der Boden ist Materie: liest DASSELBE Feld wie der Terrain-Shader (`worldFieldAt`); die dominante
    // der vier Achsen nennt das Material an (x,z). Keine Biom-Tabelle — was der Spieler SIEHT, bekommt
    // er beim Graben.
    _terrainMaterialAt(x, z, y) {
        const f = typeof this.worldFieldAt === "function" ? this.worldFieldAt(x, z) : null;
        if (!f) return "stein";
        // Γ1 (genese-plan, Lesart Boden): die FEUCHTE hebt die erde-Achse —
        // Ufer und Niederungen sind grabbar weich (erde schlägt stein), die
        // Farbe, die der Spieler sieht, bleibt das Material, das er bekommt.
        const fw = this._genVersion() >= 2 ? this._feuchteAt(x, z) : 0;
        const axes = [
            [(f.lebendig || 0) + fw * AnazhRealm.FEUCHTE.erdeGewicht, "erde"],
            [f.dichte || 0, "stein"],
            [f.glut || 0, "glut"],
            [f.magieleitung || 0, "quarz"],
        ];
        let best = axes[0];
        for (let i = 1; i < axes.length; i++) {
            if (axes[i][0] > best[0]) best = axes[i];
        }
        // STRATA: mit y schichtet das Material nach Tiefe — mehr als STRATA_STEIN_DEPTH unter `_voxelSurfaceY`
        // wird es "stein", auch wenn die erde-Achse gewinnt (erde/glut/quarz nur am obersten Band).
        // Ohne y bleibt das Verhalten bit-identisch.
        if (typeof y === "number" && Number.isFinite(y)) {
            const surfY = this._voxelSurfaceY ? this._voxelSurfaceY(x, z) : null;
            if (Number.isFinite(surfY)) {
                const depth = surfY - y;
                if (depth > AnazhRealm.STRATA_STEIN_DEPTH) {
                    // IRON-BANDS: tief (> IRON_BANDS.minDepth) und dichte-haltig (> dichteFloor) kann eine vertikale
                    // Eisen-Ader den Stein ersetzen.
                    if (depth > AnazhRealm.IRON_BANDS.minDepth && (f.dichte || 0) > AnazhRealm.IRON_BANDS.dichteFloor) {
                        const ironAder = this._eisenAderAt(x, z);
                        if (ironAder > AnazhRealm.IRON_BANDS.threshold) {
                            return "eisen";
                        }
                    }
                    return "stein";
                }
            }
        }
        return best[1];
    }

    // Ader-Sampler: Single-Octave-Ridge (1−|noise|)² auf (x,z) → vertikale Säulen in 3D, bewusst nicht
    // rotiert, [0,1]. Eigener Seed-Suffix `-iron-bands` (Γ5: re-rollt keinen anderen Welt-Stream).
    _eisenAderAt(x, z) {
        if (!this._ironBandsNoise) {
            const seed = (this.state.worldMeta && this.state.worldMeta.seed) || "anazh-realm-seed";
            this._ironBandsNoise = new SimplexNoise(seed + "-iron-bands");
        }
        const n = this._ironBandsNoise;
        const SCALE = AnazhRealm.IRON_BANDS.scale;
        const v = n.noise2D(x * SCALE, z * SCALE);
        const nv = 1 - Math.abs(v);
        return nv * nv; // [0, 1] mit Konzentration an Graten
    }

    // Natur-Clumping: EIN seed-deterministisches Klump-Rauschen, zwei Leser auf zwei Skalen — Gras/
    // Büsche λ~28 m (Dickicht ↔ Lichtung), Bäume λ~170 m (Wald ↔ offen). clamp(1 + amp·noise, lo, hi)
    // ist mittelwert-neutral (≈1): die Gesamt-Dichte bleibt, nur die Verteilung ändert sich. Main-only
    // Deko, seed-gebunden (alle Peers gleich); tag-neutral (reiner chance-Skalar, diag-arch-tags wacht).
    _clumpAt(x, z, freq) {
        if (!this._clumpNoise) {
            const seed = ((this.state.worldMeta && this.state.worldMeta.seed) || "anazh-realm-seed") + ":clump";
            this._clumpNoise = new SimplexNoise(seed);
        }
        return this._clumpNoise.noise2D(x * freq, z * freq);
    }

    // STAND-Klumpung je Zweck (phytogenesis-standDensity): Γ5-Suffix ':forest' für Bäume λ~170 m,
    // ':meadow' für Unterwuchs λ~40 m. Main-only Deko, seed-gebunden (alle Peers gleich), tag-neutral
    // (reiner chance-Skalar, diag-arch-tags wacht).
    _placementStandAt(x, z, purpose) {
        const P = AnazhRealm.PLACEMENT_DENSITY;
        const suffix = purpose === "meadow" ? ":meadow" : ":forest";
        if (!this._placementNoise) this._placementNoise = {};
        if (!this._placementNoise[suffix]) {
            const seed = ((this.state.worldMeta && this.state.worldMeta.seed) || "anazh-realm-seed") + suffix;
            this._placementNoise[suffix] = new SimplexNoise(seed);
        }
        const freq = purpose === "meadow" ? P.meadowFreq : P.forestFreq;
        return this._placementNoise[suffix].noise2D(x * freq, z * freq);
    }

    // DIE EINE Quelle für „wo wächst wie viel": dicht wo feucht + flach + niedrig, licht an Steilhang +
    // Höhe. Achsen: (1) STAND-Klump `_placementStandAt` (mittelwert-neutral) · (2) SLOPE `_slopeAt`
    // (flach favorisiert, auf |∇h| kalibriert) · (3) FEUCHTE `_feuchteAt` (nass → dichter) · (4) HÖHE
    // über Terrain-Basis (hoch → licht). Perf: × `_foliageDensityScale` (headless 1 = voll).
    _placementDensityFactor(x, z, surfaceY, purpose) {
        const P = AnazhRealm.PLACEMENT_DENSITY;
        const ss = (e0, e1, v) => {
            let t = (v - e0) / (e1 - e0);
            t = t < 0 ? 0 : t > 1 ? 1 : t;
            return t * t * (3 - 2 * t);
        };
        // (1) STAND-Klumpung — Wald ↔ Lichtung / Dickicht ↔ magere Stelle.
        const stand = this._placementStandAt(x, z, purpose); // [-1,1]
        const clump = Math.max(P.clumpLo, Math.min(P.clumpHi, 1 + P.clumpAmp * stand));
        // (2) SLOPE-Gate — flach dicht, Steilwand kahl (die Vorlagen-Flach-Präferenz).
        const slope = typeof this._slopeAt === "function" ? this._slopeAt(x, z) : 0;
        const slopeF = 1 - ss(P.slopeLo, P.slopeHi, slope);
        // (3) FEUCHTE-Antrieb — nass → dichter, trocken → licht.
        let wet = typeof this._feuchteAt === "function" ? this._feuchteAt(x, z, surfaceY) : 0;
        wet = wet < 0 ? 0 : wet > 1 ? 1 : wet;
        const wetF = P.wetBase + P.wetGain * wet;
        // (4) HÖHE über Terrain-Basis — die Höhe lichtet (Vorlagen-`dry`).
        const baseH = (this.state && this.state.terrainBaseHeight) || 0;
        const relH = Number.isFinite(surfaceY) ? surfaceY - baseH : 0;
        const highF = 1 - P.highAmp * ss(P.highLo, P.highHi, relH);
        let f = clump * slopeF * wetF * highF;
        // (5) PERF — der EINE Qualitäts-Regler; headless (Null-Renderer) → 1 (voll).
        const fd = this.state && this.state._foliageDensityScale != null ? this.state._foliageDensityScale : 1;
        f *= fd;
        return f < 0 ? 0 : f;
    }

    // Das Kronenlicht-Feld der PLATZIERUNG, [0,1] (1 = Lichtung, →0 geschlossen): wo Kronen stehen DÜRFEN — der
    // Strauch-Teppich des Chunk-Streuers liest es (er wird mit dem Wald gepflanzt, vor dessen Kronen); das Licht der
    // STEHENDEN Kronen, das Nah-Wiese und Nah-Streu lesen, ist `_bodenLichtFeld`. Liest dieselben Treiber,
    // aus denen der Wald gepflanzt wird (`_placementStandAt("forest")` × wet × Höhe), statt Baum-
    // Positionen (der Wald streamt chunkweise); ohne Slope/Perf (Ökologie ist perf-unabhängig). Rein +
    // seed-gebunden (Γ5); `wetHint` spart den `_feuchteAt`-Zweitaufruf.
    _canopyLightAt(x, z, surfaceY, wetHint) {
        const P = AnazhRealm.PLACEMENT_DENSITY;
        const U = AnazhRealm.UNDERGROWTH;
        const ss = (e0, e1, v) => {
            let t = (v - e0) / (e1 - e0);
            t = t < 0 ? 0 : t > 1 ? 1 : t;
            return t * t * (3 - 2 * t);
        };
        // Kronen-Deckung ≈ die P1-Wald-Dichte (DERSELBE forestStand × wet × Höhe wie
        // `_placementDensityFactor("forest")`, aber ohne Slope/Perf).
        const stand = typeof this._placementStandAt === "function" ? this._placementStandAt(x, z, "forest") : 0; // [-1,1]
        const clump = Math.max(P.clumpLo, Math.min(P.clumpHi, 1 + P.clumpAmp * stand));
        let wet = Number.isFinite(wetHint)
            ? wetHint
            : typeof this._feuchteAt === "function"
              ? this._feuchteAt(x, z, surfaceY)
              : 0;
        wet = wet < 0 ? 0 : wet > 1 ? 1 : wet;
        const wetF = P.wetBase + P.wetGain * wet;
        const baseH = (this.state && this.state.terrainBaseHeight) || 0;
        const relH = Number.isFinite(surfaceY) ? surfaceY - baseH : 0;
        const highF = 1 - P.highAmp * ss(P.highLo, P.highHi, relH); // hoch → weniger Kronen → mehr Bodenlicht
        let cover = clump * wetF * highF;
        if (cover < 0) cover = 0;
        const L = Math.exp(-cover * U.canopyK);
        return L < 0 ? 0 : L > 1 ? 1 : L;
    }

    // ─── DER WALD-GENERATOR (die phytogenesis-plantForest-Ökologie, übersetzt) ───
    // Variabel-radius Poisson-Disc (Kronen-Schüchternheit) + Arten-Nische + reverse-J-Größe + bimodaler
    // Dichte-Gradient + Mammut-Nische. ZELL-DETERMINISTISCH statt globaler Poisson: jede FOREST.cell-Zelle
    // trägt Darts (mulberry32 aus Zelle × Seed), ein Dart steht gegen die ±2-Nachbarzellen per reiner Wahl
    // (prio-Maximum im Konflikt-Radius, Positions-Tiebreak) → reihenfolge-unabhängig (Chunk A→B == B→A).

    // Die geteilte Wald-Noise (this._x, wie `_clumpNoise` — seed-gebunden, kein Snapshot; der Wald-Faden zieht dieselbe
    // Noise aus demselben Seed, `waldCtx` in voxel-worker.js, gate:worker-dichte Teil W). EIN Instanz, an verschiedenen Frequenzen/Offsets
    // gelesen (die Vorlage sampelt ihre `fbm2` genauso mehrkanalig). 2-Oktav-fbm → [0,1].
    _forestFbm(px, pz) {
        if (!this._forestNoise) {
            const seed = ((this.state.worldMeta && this.state.worldMeta.seed) || "anazh-realm-seed") + ":forest";
            this._forestNoise = new SimplexNoise(seed);
        }
        const n = this._forestNoise;
        const a = (n.noise2D(px, pz) + 1) * 0.5;
        const b = (n.noise2D(px * 2.7 + 11.3, pz * 2.7 - 5.9) + 1) * 0.5;
        return a * 0.65 + b * 0.35;
    }

    // ─── PLACE-POLICIES: place { mode, layer?, step?, density?, affinity?, siteTag?, seedSuffix? } ───
    // DIE EINE Auflösung: fx.place im Rezept FÜHRT, sonst KIND_POLICY (placeExtra "forest" → "forest",
    // sonst "none"). Unbekannte Felder reisen unangetastet mit; unbekannter/fehlender mode → GESCHLOSSEN
    // "none". Nicht-Buch-Arten (Basis-Nischen, Understory, Fels/Kiesel) leben bewusst außerhalb.
    _placePolicyFor(rec, kindPolicy) {
        const pol = kindPolicy !== undefined ? kindPolicy : rec && AnazhRealm.KIND_POLICY[rec.kind];
        const src = rec && rec.fx && rec.fx.place && typeof rec.fx.place === "object" ? rec.fx.place : null;
        if (src) {
            const out = Object.assign({}, src); // must-preserve: unbekannte Felder reisen unangetastet mit
            out.mode = AnazhRealm.PLACE_MODES[src.mode] === 1 ? src.mode : "none"; // fail-closed
            return out;
        }
        return { mode: pol && pol.placeExtra === "forest" ? "forest" : "none" };
    }
    // DER PLACE-DISPATCH-CHOKEPOINT: place.mode → Kanal-Name oder null (kein Worldgen); er BENENNT nur,
    // die bestehenden Systeme bauen. forest → Wald-Nische (_forestExtraSpecies → planForestCell; Auflösung
    // VOR den Darts, Γ5). scatter → benannt, noch ohne Konsument. hand/none/site → null (siteTag nur als
    // Daten). settlement → `spawnSettlement` (Seed-Stream ":stadt"); Worldgen streut es nicht automatisch.
    _placeDispatch(policy, _ctx) {
        const mode = policy && policy.mode;
        if (mode === "forest") return "forest";
        if (mode === "scatter") return "scatter"; // benannter Kanal — heute ohne Konsument (s. o.)
        if (mode === "settlement") return "settlement"; // N5.7 — deliberater Kanal (spawnSettlement)
        return null;
    }

    // Auto-Arten für den Wald-Generator: alle Wald-fähigen Presets des LIVE-Rezeptbuchs (Place-Auflösung →
    // "forest") ohne historische Nische; Patch-Zentrum + Grundgewicht per Namens-Hash (seed-frei —
    // der Name IST die Identität). Gecacht auf Buch-Identität, sortiert (deterministische Pick-Folge).
    _forestExtraSpecies() {
        const f = this._foundry;
        const book = f && f.recipes;
        if (!book) return [];
        if (this._forestExtraCache && this._forestExtraCacheBook === book) return this._forestExtraCache;
        const BASE = { eiche: 1, fichte: 1, tanne: 1, birke: 1, weide: 1, mammut: 1 };
        const out = [];
        const ids = Object.keys(book).sort();
        for (const id of ids) {
            const rec = book[id];
            // Wald-Fähigkeit aus der EINEN Place-Auflösung + Dispatch-Chokepoint, nie direkt aus placeExtra.
            // Der prefix bleibt Pflicht (fail-closed: ohne Namensregel keine Nische).
            const _pol = rec && AnazhRealm.KIND_POLICY[rec.kind];
            if (!_pol || !_pol.prefix || BASE[id]) continue;
            if (this._placeDispatch(this._placePolicyFor(rec, _pol), { id }) !== "forest") continue;
            let h = 2166136261 >>> 0;
            for (let i = 0; i < id.length; i++) h = Math.imul(h ^ id.charCodeAt(i), 16777619) >>> 0;
            out.push({
                species: _pol.prefix + id,
                w0: 0.18, // bescheidenes Grundgewicht — die neue Art mischt sich ein, dominiert nicht
                center: 0.05 + (h % 1000) / 1110, // Patch-Zentrum ∈ [0.05, 0.95] — eigene Haine
            });
        }
        this._forestExtraCache = out;
        this._forestExtraCacheBook = book;
        return out;
    }

    _forestStandDensity(x, z) {
        // „Drähte statt Kopien" (08.07.): die Formel lebt in phyto-core (forestStandDensity —
        // Studio-Modell: Mittel 0.72, Kontrast 1.35, dichte Kerne + gelichtete Säume); hier nur
        // der Draht mit AnazhRealms fbm. Diag-Linsen (diag-forest-*) lesen weiter diese Methode.
        const core = typeof globalThis !== "undefined" && globalThis.__phytoCore;
        if (core && typeof core.forestStandDensity === "function")
            return core.forestStandDensity((px, pz) => this._forestFbm(px, pz), x, z);
        return 0;
    }

    // Der Welt-Seed als 32-bit-Int (fnv-1a, gecacht) — treibt die Zell-Hashes → alle
    // Peers/Reloads sehen denselben Wald (Γ5: seed-deterministisch, nie Math.random).
    _forestSeedInt() {
        const s = (this.state.worldMeta && this.state.worldMeta.seed) || "anazh-realm-seed";
        if (this._forestSeedStr === s && this._forestSeedVal != null) return this._forestSeedVal;
        let h = 2166136261 >>> 0;
        for (let i = 0; i < s.length; i++) h = Math.imul(h ^ s.charCodeAt(i), 16777619) >>> 0;
        this._forestSeedStr = s;
        this._forestSeedVal = h >>> 0;
        return this._forestSeedVal;
    }

    // Ein deterministischer mulberry32 pro Zelle (Hash aus Zell-Koord × Welt-Seed).
    _forestCellRng(cx, cz, seedInt) {
        // Draht zur EINEN Quelle (phyto-core.forestCellRng) — Diag-Linsen lesen weiter hier.
        const core = typeof globalThis !== "undefined" && globalThis.__phytoCore;
        if (core && typeof core.forestCellRng === "function") return core.forestCellRng(cx, cz, seedInt);
        return () => 0;
    }

    // DIE WAHRHEIT DES WALDS (K20): die Darts lesen Boden, Wasser und Feuchte (`_voxelSurfaceY`, `_atlasWaterLevelAt`,
    // `_feuchteAt` — Erosion, Flüsse und Seen der Hydro-Kachel ihres Orts). Vor dem Worldgen (keine Heimat-Hydrosphäre)
    // gibt es sie nicht: jede Antwort des Walds ist dann vorläufig und wird nie gemerkt (`_forestCellDarts`), die Gestalt
    // des Orts wartet (`_foundryGestaltFor` → null, wie auf ein kaltes Buch).
    _forestGesetzWahr() {
        const h = this.state.hydrosphere;
        return !!(h && h.ready);
    }

    // DER STAND DES WALD-GESETZES (K20): die Darts sind eine Funktion von Welt-Same, Arten-Satz (die Arten des Buchs,
    // `_forestExtraSpecies`) und Hydrosphäre. Ein neuer Same, ein neues Buch, eine neue Hydrosphäre (der Welt-Regen) oder neue
    // Arten (`_foundryAutoRegisterSpecies` leert das Gedächtnis) legen ein neues Dart-Gedächtnis an — seine Nummer IST der
    // Stand. Wer eine Antwort des Walds merkt (die Gestalt des Orts `_foundryGestaltFor`, die Streu-Gestalt
    // `_scatterFoundrySeed`), merkt sie an diesem Stand, nie an der Reihenfolge: der Zweit-Boot fragte den gesetzten Baum,
    // bevor die Wasser-Wahrheit seines Orts stand, und seine Gestalt blieb die eines anderen Walds (A1-Eiche bei −740/−1190:
    // Gestalt 1 statt 2; gate:fernwald E).
    _forestDartStand(seedInt) {
        const buch = this._foundry ? this._foundry.recipes || null : null;
        const hydro = this.state.hydrosphere || null;
        if (
            !this._forestDartMemo ||
            this._forestDartMemoSeed !== seedInt ||
            this._forestDartMemoBuch !== buch ||
            this._forestDartMemoHydro !== hydro
        ) {
            this._forestDartMemo = new Map();
            this._forestDartMemoSeed = seedInt;
            this._forestDartMemoBuch = buch;
            this._forestDartMemoHydro = hydro;
            this._forestDartGen = (this._forestDartGen || 0) + 1;
        }
        return this._forestDartGen;
    }

    // DER WALD FÄLLT AM ORT (K69, Lehre 25): legt ein Ort seinen Erdbau über die Flächen im Kasten x0…x1 · z0…z1, ändern sich
    // die Darts nur in den Zellen, die der Kasten samt Böschung (`ERDBAU.reichweiteM`, dazu die Hang-Probe von 2 m) oder samt der
    // größten Krone (`KRONE_MAX_M`: `ortFrei` fragt die Krone gegen die Fläche) berührt. Nur sie fallen aus dem Dart-Gedächtnis
    // des Stands (der Stand bleibt), mit ihnen das Urteil jedes Darts, der sie als Nachbarn liest (±2 Zellen, `_forestDartSteht`),
    // die Freistand-Antwort jedes Orts, der diese Urteile liest (±4 Zellen darum, `_forestStehtFrei`), und die Gestalt des Orts
    // dort (`_ortSameFaellt`). Bis K69 fiel das Gedächtnis der ganzen Welt (`_forestDartMemo = null`, ein neuer Stand) — und mit
    // ihm jede Gestalt jedes Orts. → die Zahl der gefallenen Zellen.
    _forestDartsFallen(x0, z0, x1, z1) {
        const memo = this._forestDartMemo;
        if (!memo || !memo.size) return 0;
        const C = AnazhRealm.FOREST.cell;
        const R = Math.max(globalThis.__gelaendeCore.ERDBAU.reichweiteM + 2, AnazhRealm.KRONE_MAX_M);
        const ga = Math.floor((x0 - R) / C);
        const gb = Math.floor((x1 + R) / C);
        const ha = Math.floor((z0 - R) / C);
        const hb = Math.floor((z1 + R) / C);
        let n = 0;
        for (let gx = ga; gx <= gb; gx++) for (let gz = ha; gz <= hb; gz++) if (memo.delete(gx + "," + gz)) n++;
        const steht = this._forestStehtMemo;
        if (steht)
            for (let gx = ga - 2; gx <= gb + 2; gx++)
                for (let gz = ha - 2; gz <= hb + 2; gz++) {
                    const d = memo.get(gx + "," + gz);
                    if (d) for (const o of d) steht.delete(o);
                }
        const fm = this._freistandMemo;
        if (fm && fm.size && this._freistandMemoVon === memo)
            for (const k of fm.keys()) {
                const i = k.indexOf(",");
                const gx = Math.floor(Number(k.slice(0, i)) / C);
                const gz = Math.floor(Number(k.slice(i + 1, k.indexOf(",", i + 1))) / C);
                if (gx >= ga - 6 && gx <= gb + 6 && gz >= ha - 6 && gz <= hb + 6) fm.delete(k);
            }
        this._ortSameFaellt((ga - 6) * C, (ha - 6) * C, (gb + 7) * C, (hb + 7) * C);
        return n;
    }

    // BORN-Darts einer Zelle, reine Funktion von (cx,cz,seed): standDensity-Wurf → Boden/Wasser → Slope →
    // Arten-Nische → reverse-J-Größe → Mammut. Nur geborene Darts treten in die Kronen-Schüchternheit ein.
    _forestCellDarts(cx, cz, seedInt) {
        // Zell-Memo über Aufrufe: jeder Chunk liest ±2 Rand-Zellen (~4× Redundanz), und die Dart-Generierung
        // (`_voxelSurfaceY`-Scan + Slope + Feuchte) dominiert die Plant-Zeit. Seed-gebunden (Welt-Wechsel
        // leert), bounded (voll → clear); Instanz-Feld, kein state/Snapshot. Die Wahrheit zuerst (`_forestGesetzWahr`): wie
        // der Chunk-Bau (`_acquireVoxelChunkBuild`) steht die Hydro-Kachel der Zelle vor der Frage; vor dem Worldgen ist die
        // Antwort vorläufig (`vorlaeufig`) und kein Gedächtnis.
        const memoKey = cx + "," + cz;
        let memo = null;
        if (this._forestGesetzWahr()) {
            this._forestDartStand(seedInt);
            memo = this._forestDartMemo;
            const hit = memo.get(memoKey);
            if (hit) return hit;
            const C = AnazhRealm.FOREST.cell;
            this._ensureHydroTilesAround((cx + 0.5) * C, (cz + 0.5) * C, C);
        }
        // Die Pflanz-Logik lebt EINMAL in phyto-core (planForestCell); hier nur Memo + Welt-Reads als ctx-
        // Funktionen (Oberfläche · Wasser · Slope · Feuchte · fbm). Ohne Kern → leerer Wald.
        const core = typeof globalThis !== "undefined" && globalThis.__phytoCore;
        // Das Wasser eines Darts ist das Gesetz über SEINEM Boden (`_atlasWaterLevelAt`, die Hälfte von `_landAt`, aus der
        // das Bild wird): der Plan bleibt eine reine Funktion von Zelle und Same (jeder Peer, jede Lade-Reihenfolge derselbe
        // Wald) — das gezeichnete Wasser fragt die Natur-Wand beim Setzen (`_naturWand` → `_landAt`). Der Kern liest erst die
        // Oberfläche, dann das Wasser derselben Stelle — der Boden reist mit. Bis Schau-2 (09.10.) las der Wald den Bezug
        // der Ufer-Bänder (`_waterLevelAt`).
        let bodenX = NaN;
        let bodenZ = NaN;
        let bodenY = null;
        const out =
            core && typeof core.planForestCell === "function"
                ? core.planForestCell(cx, cz, seedInt, {
                      F: AnazhRealm.FOREST,
                      baseH: (this.state && this.state.terrainBaseHeight) || 0,
                      extras: this._forestExtraSpecies(),
                      fbm: (px, pz) => this._forestFbm(px, pz),
                      surfaceYAt: (x, z) => {
                          bodenX = x;
                          bodenZ = z;
                          bodenY = this._voxelSurfaceY(x, z);
                          return bodenY;
                      },
                      waterYAt: (x, z) =>
                          this._atlasWaterLevelAt(
                              x,
                              z,
                              x === bodenX && z === bodenZ ? bodenY : this._voxelSurfaceY(x, z)
                          ),
                      slopeAt: (x, z) =>
                          typeof this._slopeAt === "function"
                              ? this._slopeAt(x, z, (px, pz) => this.getTerrainHeightAt(px, pz), 2)
                              : 0,
                      feuchteAt: (x, z, sy) => (typeof this._feuchteAt === "function" ? this._feuchteAt(x, z, sy) : 0),
                      // der Ort vor dem Wald (K10): keine Krone über dem Grund eines Orts (`_ortFrei`, der Erdbau)
                      ortFrei: (x, z, T) => this._ortFrei(x, z, T),
                  })
                : [];
        if (!memo) {
            out.vorlaeufig = true;
            return out;
        }
        if (memo.size > 8192) memo.clear(); // bounded — die Front ist lokal, ein Clear kostet nur Re-Compute
        memo.set(memoKey, out);
        return out;
    }

    // DER WALD PLANT IM TAKT (K69, Lehre 14 + 25): eine frische Wald-Zelle zu planen kostet 1–3 ms (`planForestCell`, ~160
    // Sichthöhen); die Gestalt EINES Baums in frischem Wald fragt bis zu 13 × 13 Zellen (der Freistand ±4, das Urteil jedes
    // Nachbarn ±2: `WALD_PLAN.reich`). Bis K69 plante der erste Frager am Stück — beim Gang ins Dorf die Ausstattung des Dorfs
    // 366 Zellen in EINER Aufgabe neben dem Takt (551 ms, Null-Renderer), ein Takt 113 Zellen (245 ms). Jetzt fragt die
    // Gestalt des Orts (`_ortGestaltSame`) hier: steht der Plan um (x, z), gilt ihr Urteil sofort; fehlen Zellen, bestellt sie
    // sie in der Schlange des Walds (`_tickWaldPlan`) und wartet — wie auf ein kaltes Buch, so warten ihre Leser schon (die
    // Hülle, die Streu, die Promotion, die Karte). Die Frage merkt ihre fehlenden Zellen je Zelle des Orts: jede weitere
    // kostet einen Blick, bis die letzte steht. Fiel eine bestellte Zelle aus der Schlange (ein neuer Stand, ein Erdbau),
    // bestellt die Frage neu.
    _waldPlanSteht(x, z) {
        const memo = this._forestDartMemo;
        if (!memo) return false;
        const C = AnazhRealm.FOREST.cell;
        const gx = Math.floor(x / C);
        const gz = Math.floor(z / C);
        const bk = gx + "," + gz;
        if (!this._waldWarten || this._waldWarten.size > 4096) this._waldWarten = new Map();
        const Q = this._waldPlanSchlange || (this._waldPlanSchlange = new Map());
        let fehlt = this._waldWarten.get(bk);
        if (fehlt) {
            while (fehlt.length && memo.has(fehlt[fehlt.length - 1])) fehlt.pop();
            if (fehlt.length) {
                if (!Q.has(fehlt[fehlt.length - 1]))
                    for (const k of fehlt) {
                        if (memo.has(k) || Q.has(k)) continue;
                        const i = k.indexOf(",");
                        Q.set(k, [Number(k.slice(0, i)), Number(k.slice(i + 1))]);
                    }
                return false;
            }
            this._waldWarten.delete(bk);
        }
        const R = AnazhRealm.WALD_PLAN.reich;
        fehlt = [];
        if (this._waldPlanKasten(gx - R, gz - R, gx + R, gz + R, fehlt)) return true;
        this._waldWarten.set(bk, fehlt);
        return false;
    }

    // Der Plan des Walds im Zell-Kasten ga…gb · ha…hb (inklusiv): true = jede Zelle steht im Dart-Gedächtnis des Stands;
    // sonst bestellt er die fehlenden in der Schlange des Walds (`_tickWaldPlan`), merkt sie in `fehlt` (optional) → false.
    _waldPlanKasten(ga, ha, gb, hb, fehlt) {
        const memo = this._forestDartMemo;
        if (!memo) return false;
        const Q = this._waldPlanSchlange || (this._waldPlanSchlange = new Map());
        let steht = true;
        for (let gx = ga; gx <= gb; gx++)
            for (let gz = ha; gz <= hb; gz++) {
                const k = gx + "," + gz;
                if (memo.has(k)) continue;
                steht = false;
                if (fehlt) fehlt.push(k);
                if (!Q.has(k)) Q.set(k, [gx, gz]);
            }
        return steht;
    }

    // Der Zell-Kasten, den der Pflanz-Gang eines Chunks liest: seine Zellen samt ±2 (das Urteil jedes Darts).
    _waldPflanzKasten(cx, cz) {
        const { span } = this._voxelChunkConfig();
        const C = AnazhRealm.FOREST.cell;
        const ox = cx * span;
        const oz = cz * span;
        return [
            Math.floor(ox / C) - 2,
            Math.floor(oz / C) - 2,
            Math.floor((ox + span) / C) + 2,
            Math.floor((oz + span) / C) + 2,
        ];
    }

    // DIE SCHLANGE DES WALDS (K69): der Takt-Planer (Job `waldPlan`, Welt-Substanz) nimmt die bestellten Zellen
    // (`_waldPlanSteht`) nah zuerst. IHR RECHNER IST DER WALD-FADEN (K60-3, `_waldFadenSchicken`): wo ein Voxel-Faden lebt,
    // plant der Haupt-Faden keine Zelle der Schlange — sie reisen in Aufträgen an den Wald-Faden und landen im Gedächtnis
    // (`_waldDartsAn`). Ohne Faden plant der Takt je Takt höchstens `WALD_PLAN.ms` (mindestens eine Zelle — nie verhungert;
    // der Lade-Takt gibt sein ganzes Budget). Bis zur Vereinigung K60-4 bestellte die Streu ihre Darts an der Schlange
    // vorbei beim Faden (`_waldDartsBestellen`), und jeder andere Leser plante im Haupt-Faden: zwei Wege an EIN Gedächtnis.
    // Ihre Regung (`_waldPlanGeplant`) weckt die Fege-Takte, deren Bäume auf ihre Zellen warten. → die Zahl der Zellen.
    _tickWaldPlan(ms) {
        const Q = this._waldPlanSchlange || (this._waldPlanSchlange = new Map());
        const P = this._waldPflanzWarten;
        if (!Q.size && !(P && P.size)) return 0;
        if (!this._forestGesetzWahr()) return 0;
        const seedInt = this._forestSeedInt();
        const t0 = performance.now();
        let n = 0;
        if (this._waldFadenLebt()) this._waldFadenSchicken(seedInt);
        else {
            this._forestDartStand(seedInt);
            const liste = this._waldPlanListe(null);
            const budget = Number.isFinite(ms) ? ms : Infinity;
            const frist = this._ladeTakt() ? budget : Math.min(budget, AnazhRealm.WALD_PLAN.ms);
            for (const [, k, g] of liste) {
                if (n > 0 && performance.now() - t0 >= frist) break;
                this._forestCellDarts(g[0], g[1], seedInt);
                Q.delete(k);
                n++;
            }
        }
        // die wartenden Pflanz-Gänge (`_forestPlantChunk`): steht der Plan ihres Chunks, pflanzt die Schlange ihn jetzt — auch
        // wenn sein Chunk inzwischen ging: die Pflanzung geschieht EINMAL je Chunk (`voxelPopulatedChunks` fällt nie), ein
        // verworfener Gang ließ seinen Wald für immer leer (K69-2: die Klang-Linse fand am Waldort 5 Bäume ≤ 15 m)
        if (P && P.size)
            for (const key of [...P]) {
                const i = key.indexOf(",");
                const cx = Number(key.slice(0, i));
                const cz = Number(key.slice(i + 1));
                if (this._waldPlanKasten(...this._waldPflanzKasten(cx, cz))) this._forestPlantChunk(cx, cz);
            }
        if (n > 0) this._waldPlanGeplant(t0);
        return n;
    }

    // Die offenen Zellen der Schlange nah zuerst ([d², Schlüssel, [gx, gz]]): was das Gedächtnis schon trägt, fällt aus ihr;
    // was im Flug ist (`flug`, optional), bleibt in ihr, aber nicht in der Liste.
    _waldPlanListe(flug) {
        const Q = this._waldPlanSchlange;
        const memo = this._forestDartMemo;
        const C = AnazhRealm.FOREST.cell;
        const liste = [];
        for (const [k, g] of Q) {
            if (memo.has(k)) Q.delete(k);
            else if (!flug || !flug.has(k)) liste.push([this._spielerD2((g[0] + 0.5) * C, (g[1] + 0.5) * C), k, g]);
        }
        liste.sort((a, b) => a[0] - b[0]);
        return liste;
    }

    // Zellen sind geplant (von welchem Rechner auch immer): die Regung (`_waldPlanRegung`) liest der Stand-Stempel — sie
    // weckt die Fege-Takte, wenn die Schlange leer ist, und solange sie plant, höchstens alle 250 ms.
    // DIE STREU WARTET AUF DEN WALD WIE AUF IHR ASSET (K69-2): eine Streu-Region, deren Bäume auf die Gestalt ihres Orts
    // warten (`_scatterFoundrySeed` → null), schiebt sich auf (`_deferredFoundry`) und wartet benannt auf die leere Schlange
    // (`_waldPlanZusage`, ihr Wecker `_streuWeckerSpannen`). Ohne Nachschub stand sie für immer: Null-Gang an der Mess-Wiese
    // 6 von 6 Regionen nach geleerter Schlange aufgeschoben (CI 38736568849). Ist die Schlange leer, steht jede bestellte
    // Zelle — die Region baut neu wie nach einer Lieferung.
    _waldPlanGeplant(t0) {
        const Q = this._waldPlanSchlange;
        const leer = !(Q && Q.size);
        if (leer || !(t0 < this._waldPlanWeckBis)) {
            this._waldPlanRegung = (this._waldPlanRegung | 0) + 1;
            this._waldPlanWeckBis = t0 + 250;
        }
        if (!leer) return;
        this._scatterRefillPending = true;
        const z = this._waldLeer;
        if (z) {
            this._waldLeer = null;
            z.loesen();
        }
    }

    // Die Zusage der leeren Schlange (der Wecker der Streu wartet auf sie, `_streuWartetAuf`): null, wenn nichts bestellt ist.
    _waldPlanZusage() {
        const Q = this._waldPlanSchlange;
        if (!Q || !Q.size) return null;
        if (!this._waldLeer) {
            let loesen = null;
            const z = new Promise((res) => {
                loesen = res;
            });
            z.loesen = loesen;
            this._waldLeer = z;
        }
        return this._waldLeer;
    }

    // Der Wald-Faden kann rechnen: ein Voxel-Faden lebt, und seine Quelle ist bekannt (`_voxelWorkerWaldDarts`).
    _waldFadenLebt() {
        return !!(this.state.voxelWorker && this._voxelFadenQuelle);
    }

    // DER STOFF DES WALDS IM FADEN (K60-3): die offenen Zellen der Schlange nah zuerst, je Auftrag `WALD_PLAN.faden` Zellen,
    // höchstens `WALD_PLAN.fadenFlug` Aufträge im Flug (der nächste geht mit der Ankunft des vorigen, nie erst im nächsten
    // Takt). Die Wahrheit jeder Zelle reist vor ihr (`_ensureHydroTilesAround`), der Zustand über den EINEN Sender. Bis K60-3
    // rechnete der Haupt-Faden jeden Dart der Streu selbst: Radeon kalt bis zum ersten Bild 1,6 von 2,2 s Streu (K602c/q2:
    // `_forestCellDarts` 1,9 s, davon die Oberfläche 1,5 s).
    _waldFadenSchicken(seedInt) {
        this._forestDartStand(seedInt);
        const memo = this._forestDartMemo;
        if (this._waldFlugVon !== memo || !this._waldFlug) {
            this._waldFlug = new Set(); // die Zellen im Flug gelten dem Gedächtnis, für das sie geschickt wurden
            this._waldFlugVon = memo;
            this._waldFlugAuftraege = 0;
        }
        const W = AnazhRealm.WALD_PLAN;
        if (this._waldFlugAuftraege >= W.fadenFlug) return;
        const flug = this._waldFlug;
        const liste = this._waldPlanListe(flug);
        const C = AnazhRealm.FOREST.cell;
        const extras = this._forestExtraSpecies();
        for (let a = 0; a < liste.length && this._waldFlugAuftraege < W.fadenFlug; a += W.faden) {
            const zellen = [];
            for (let b = a; b < Math.min(liste.length, a + W.faden); b++) {
                const g = liste[b][2];
                this._ensureHydroTilesAround((g[0] + 0.5) * C, (g[1] + 0.5) * C, C);
                flug.add(liste[b][1]);
                zellen.push(g[0], g[1]);
            }
            this._waldFlugAuftraege++;
            const erd = this._erdbauStand | 0;
            this._voxelWorkerWaldDarts(new Int32Array(zellen), seedInt, extras).then(
                (r) => this._waldDartsAn(memo, zellen, r, erd),
                (e) => {
                    this._waldDartsAn(memo, zellen, null, erd); // die Zellen bleiben in der Schlange, der Takt schickt neu
                    this._bruchMelden("WALD: der Faden rechnete die Darts nicht — " + (e && e.message ? e.message : e));
                }
            );
        }
    }

    // Die Darts des Fadens ins Gedächtnis ihres Stands: ein gewechselter Stand oder ein Erdbau seit dem Auftrag
    // (`_erdbauStand`, K69: der Faden rechnete am alten Grund) verwirft sie — die Zellen bleiben in der Schlange, ein neuer
    // Auftrag rechnet sie; eine inzwischen gerechnete Zelle behält ihre Darts (die Urteile der Nachbarn merken die Objekte).
    // Die Schranke des Gedächtnisses greift VOR der Lieferung, nie mitten in ihr (Prüfung K60-3-1).
    _waldDartsAn(memo, zellen, r, erd) {
        if (this._waldFlugVon === memo) {
            this._waldFlugAuftraege--;
            for (let i = 0; i < zellen.length; i += 2) this._waldFlug.delete(zellen[i] + "," + zellen[i + 1]);
        }
        const Q = this._waldPlanSchlange;
        let n = 0;
        if (r && this._forestDartMemo === memo && (this._erdbauStand | 0) === erd) {
            if (memo.size + zellen.length / 2 > 8192) memo.clear(); // bounded wie `_forestCellDarts`
            const alle = this._waldDartsEntpacken(r, zellen.length / 2);
            for (let i = 0; i < alle.length; i++) {
                const k = zellen[i * 2] + "," + zellen[i * 2 + 1];
                if (!memo.has(k)) memo.set(k, alle[i]);
                if (Q) Q.delete(k);
                n++;
            }
        }
        if (n > 0) this._waldPlanGeplant(performance.now());
        if (Q && Q.size && this._waldFadenLebt() && this._forestGesetzWahr())
            this._waldFadenSchicken(this._forestSeedInt());
    }

    // Die gepackten Darts des Fadens (je Zelle `anzahl`, je Dart 11 Werte, die Arten als Tafel) → je Zelle die Darts, wie
    // `_forestCellDarts` sie gibt (gate:worker-dichte Teil W vergleicht sie Wort für Wort).
    _waldDartsEntpacken(r, zellenZahl) {
        const w = r.werte;
        const alle = [];
        let j = 0;
        for (let i = 0; i < zellenZahl; i++) {
            const out = [];
            for (let m = r.anzahl[i]; m > 0; m--, j += 11)
                out.push({
                    x: w[j],
                    z: w[j + 1],
                    sp: r.arten[w[j + 2]],
                    s: w[j + 3],
                    T: w[j + 4],
                    prio: w[j + 5],
                    keep: w[j + 6],
                    totRoll: w[j + 7],
                    rotY: w[j + 8],
                    seed: w[j + 9],
                    surfaceY: Number.isNaN(w[j + 10]) ? null : w[j + 10],
                });
            alle.push(out);
        }
        return alle;
    }

    // ==================== ASSET-FOUNDRY: die Vorlage pflanzt ihre echten Bäume ====================
    // Der Studio-Generator (die Kerne + die Foundry-Brücke foundry-bruecke.js, K42) läuft als Worker und liefert
    // seine echten Baum-Instanzen (buildInstance, eigenes LOD) als Geometrie-Puffer; AnazhRealm baut daraus
    // Meshes — kein Nachbau. Ein Edit am Kern oder an der Brücke ändert die Bäume hier, ein Edit am Labor nie.
    _foundryEnabled() {
        // Studio-Asset AUSLESEN + PLATZIEREN, nie nachbauen. Der Geometrie-Motor läuft als WORKER (die Brücke
        // startet ohne Renderer → kein zweiter GPU-Kontext), auch headless — die EINE aktive Quelle.
        // Kein Grammatik-Render-Fallback: ein noch nicht gebackenes Asset heißt kurz KEIN Mesh. Richter
        // (`_growTreeBlueprintRich`) + Understory-Grammatik (`_growTreeBlueprintForSpawn`) bleiben.
        // Nur ohne Worker (exotische Einbettung) → Alt-Pfad.
        if (typeof Worker === "undefined") return false;
        // TEST-HOOK: Gate-Bänder, die die Grammatik-MECHANIK isoliert prüfen (Richter, LOD-Bauplan, Scatter-
        // Promotion, Understory), schalten die Foundry aus; die Foundry als Quelle beweisen
        // foundry-warm/deadlock/parity/contract.
        if (typeof window !== "undefined" && window.__anazhGateNoFoundry) return false;
        return true;
    }
    _ensureAssetFoundry() {
        if (!this._foundryEnabled()) return null;
        if (this._foundry) return this._foundry;
        const f = {
            worker: null, // P3a: der Studio-Generator als Web-Worker (Geometrie/Daten, kein DOM)
            // P5→BÄCKER-VEREINIGUNG: das GL-Bake-iframe UND der Welt-RTT-Nachbau sind
            // GESCHNITTEN — der Impostor-Atlas backt im STUDIO-Bäcker (Kanal "bake-impostor" → Reply "impostor"). EIN
            // Bake-Pfad — in den Bäcker-Fäden (`_foundryBaecker`: derselbe Boot-Blob, mit dem Studio geboren, K60-2).
            baecker: null,
            baeckerBereit: false,
            bootUrl: null,
            ready: false,
            platte: false, // die Transport-Schale führt die Platte (gesetzt beim Worker-Boot)
            pending: new Map(),
            reqSeq: 1,
            cache: new Map(),
            retry: [],
            _vorrat: false, // die Phase des Vorrats (`VORRAT_PHASE`); false = steht nicht an oder ist durch (warm)
            recipes: null,
            // DAS BUCH IST EIN EREIGNIS (K22, Nachbesserung 4): wer auf das Studio-Buch wartet (der Vorrat, der Dorf-Spawn,
            // die Portal-Vorschau, die Werkstatt-Vorschau, die Hand), wartet auf `buchDa` — `_foundryIngestBook` erfüllt es. Bis hierher wartete der Vorrat
            // 2 s auf die Uhr und wärmte danach ohne Rezepte (FOUNDRY WARM: fünf kritische Presets fehlen im Buch).
            buchDa: null,
            buchKam: null,
            // V4(B) — die Leck-Linse: gebaute vs. deferred-freigegebene Foundry-Geometrien (die
            // Schnitte heben sie ohnehin lazy via `|| 0`; hier explizit für die Auffindbarkeit).
            _geomBuiltCount: 0,
            _geomDisposedCount: 0,
        };
        f.buchDa = new Promise((r) => (f.buchKam = r));
        this._foundry = f;
        try {
            // Studio-Generator als WORKER (self.__PHYTO_FOUNDRY_WORKER=true; die Brücke startet ohne Renderer).
            // importScripts braucht ABSOLUTE URLs (Blob-URL ohne Basis → new URL(..., location.href)). ALLES aus
            // cores.manifest.json (EINE Quelle), ?v= Pflicht. Reihenfolge: die lib der Kerne (three r128 + die
            // Geometrie-Helfer — keine Labor-Szene) → Kerne in Manifest-Folge (phyto- VOR foundry-core) → die Brücke
            // ZULETZT (K42: keine Labor-Shell im Worker). Async: f.ready bleibt false bis zum ready-Handshake; jeder
            // Fetch-/Parse-Fehler lässt es so.
            const v = "?v=" + AnazhRealm.VERSION;
            fetch("cores.manifest.json" + v)
                .then((res) => res.text())
                .then((manifestText) => {
                    const manifest = JSON.parse(manifestText);
                    // kein Kern-Satz, kein Faden: der Boot bricht laut (der catch unten reicht den Bruch unverändert weiter)
                    if (!Array.isArray(manifest) || !manifest.length)
                        throw this._stoffBruch("die Foundry bootet nicht — das Kern-Manifest trägt keinen Kern");
                    const rel = [];
                    for (const core of manifest) {
                        if (!core || !Array.isArray(core.lib)) continue;
                        for (const s of core.lib) if (typeof s === "string" && s) rel.push(s);
                    }
                    for (const core of manifest) {
                        if (!core || !Array.isArray(core.scripts)) continue;
                        for (const s of core.scripts) if (typeof s === "string" && s) rel.push(s);
                    }
                    for (const core of manifest) {
                        if (core && typeof core.bruecke === "string" && core.bruecke) rel.push(core.bruecke);
                    }
                    const base = typeof window !== "undefined" && window.location ? window.location.href : "";
                    const abs = rel.map((p) => new URL(p + v, base).href);
                    // self.__anazhCores reist VOR den importScripts in den Worker (Brücke liest die ns-Kerne generisch);
                    // das Manifest ist reines JSON → JSON.stringify ist ein sicheres JS-Literal. DIE TRANSPORT-SCHALE
                    // steht davor (`_foundrySchale`): sie registriert ihren Kanal-Hörer VOR dem Studio.
                    // Der Stempel hasht JEDE Generator-Quelle: die Kern-Skripte UND die Brücke (K42) — sie trägt
                    // `__extractAssetMesh` (backt matrixWorld in die Vertices) und `bakeImpostorAtlas` (die Karte); ein
                    // Brücken-Edit ohne Stempel lieferte stale Körper und Karten. Die Labor-Shell hasht er nie: ein UI-Edit
                    // am Pflanzen-Labor leert keinen Asset-Cache.
                    const stempelUrls = [];
                    for (const core of manifest) {
                        if (!core || !Array.isArray(core.scripts)) continue;
                        for (const s of core.scripts)
                            if (typeof s === "string" && s) stempelUrls.push(new URL(s + v, base).href);
                    }
                    for (const core of manifest) {
                        if (core && typeof core.bruecke === "string" && core.bruecke)
                            stempelUrls.push(new URL(core.bruecke + v, base).href);
                    }
                    // Die Platte: aus unter dem Null-Renderer (gate-deterministisch) und ohne IndexedDB/WebCrypto.
                    const rend = this.state.renderer;
                    f.platte =
                        typeof indexedDB !== "undefined" &&
                        typeof crypto !== "undefined" &&
                        !!crypto.subtle &&
                        !(rend && rend._isHeadlessNull);
                    const schale = {
                        lesen: AnazhRealm.FOUNDRY_LESEN,
                        format: AnazhRealm.FOUNDRY_PLATTE_FORMAT,
                        platte: f.platte,
                        manifestText,
                        stempelUrls,
                    };
                    const boot =
                        "(function " +
                        AnazhRealm._foundrySchale.toString() +
                        ")(" +
                        JSON.stringify(schale) +
                        ");" +
                        "self.__PHYTO_FOUNDRY_WORKER=true;self.__anazhCores=" +
                        JSON.stringify(manifest) +
                        ";importScripts(" +
                        abs.map((u) => JSON.stringify(u)).join(",") +
                        ");"; // die Brücke startet sich selbst (Foundry-Modus, Kanal-Hörer, ready)
                    f.bootUrl = URL.createObjectURL(new Blob([boot], { type: "text/javascript" }));
                    const worker = new Worker(f.bootUrl);
                    f.worker = worker;
                    // DER FADEN WARTET NIE AUF DEN HAUPT-FADEN (K60-2): die Buch-Frage reist mit der Geburt — der Faden
                    // hält sie, bis sein Studio steht (eine Nachricht vor dem Ende seines Start-Skripts wartet auf seinen
                    // Hörer), und antwortet ohne Rundlauf; Helfer und Bäcker kommen mit ihm (`_foundryHelfer`). Bis K60-2
                    // fragte erst die Antwort auf „ready" — Radeon kalt ruhte der Buch-Faden 0,8 s, bis der volle Haupt-
                    // Faden sie las, und die Helfer begannen ihren Start 2,4 s nach ihm (K602c/q2: Buch 6,8 s).
                    try {
                        worker.postMessage({ type: "get-book", reqId: "book" });
                    } catch (_e) {
                        throw this._stoffBruch("die Buch-Anfrage an den Foundry-Faden (get-book)", _e);
                    }
                    this._foundryHelfer(f);
                    // Ein Boot-/Laufzeit-Fehler des Studio-Fadens bricht LAUT (K22): ohne Faden kein Studio-Mesh, und es
                    // gibt keinen Alt-Pfad (`_foundryEnabled`: ein nicht gebackenes Asset heißt KEIN Mesh)
                    worker.onerror = (ev) =>
                        this._stoffBruch(
                            "der Foundry-Faden fällt — " + ((ev && ev.message) || "Boot-/Laufzeit-Fehler")
                        );
                    worker.onmessage = (ev) => {
                        const m = ev.data;
                        if (!m || typeof m !== "object") return;
                        if (m.type === "ready" && m.world === "terrain") {
                            f.ready = true; // der Stand-Stempel liest die Antwort selbst (`_standStempel`)
                            // EIN Umschlag: das komplette Studio-Buch (Rezepte + B4-Tabellen + Welt-Palette + Wahrnehmung)
                            // ist mit der Geburt gefragt, DANN die Assets vorwärmen. Der Vorrat wartet ohne Frist auf das
                            // Buch (`f.buchDa`): fällt die Anfrage, bricht sie LAUT beim Namen (K22).
                            this._foundryPrefetchLibrary();
                            // DIE EINE PIPE: die Gattungs-Templates off-thread vorwärmen —
                            // Welt-Spawns treffen dann nur noch das Memo (Clone, kein Freeze). Er wartet auf das erste
                            // Bild (K60) wie der Vorrat der Bibliothek; ein Bruch seines Gusses meldet sich laut.
                            this._ofenPrefetchKreaturen().catch((e) => this._stoffBruch("der Ofen-Vorrat", e));
                        } else if (m.type === "book") {
                            this._foundryIngestBook(m);
                        } else this._foundryAntwort(f, m);
                        this._foundryPumpe(f); // ein Platz im Worker wurde frei → der nächste Wartende (nah zuerst)
                    };
                })
                .catch((e) => this._stoffBruch("die Foundry bootet nicht (Kern-Manifest, Faden-Boot)", e));
        } catch (_e) {
            this._stoffBruch("die Foundry bootet nicht", _e);
        }
        return f;
    }
    // Die Antwort eines Studio-Fadens (Werk wie Bäcker) löst ihren Auftrag ein: Körper (asset), Siedlung (settlement),
    // Karte (impostor) — EINE pending-Map, die reqIds sind disjunkt.
    _foundryAntwort(f, m) {
        if (m.type === "asset") {
            // Das Budget-Gesetz am Studio-Ausgang (W8) meldet einen Bruch LAUT — nie still.
            if (Array.isArray(m.budgetBruch) && m.budgetBruch.length)
                this.log("BUDGET-BRUCH " + m.presetId + " L" + m.lod + ": " + JSON.stringify(m.budgetBruch), "ERROR");
            const p = f.pending.get(m.reqId);
            if (p) {
                f.pending.delete(m.reqId);
                p(m.meshes || []);
            }
        } else if (m.type === "settlement") {
            // N5.7 (W-A5b) — der Settlement-Kanal: die Slot-DATEN einer Siedlung (fachwerk exportSettlement, generisch
            // über die Zweit-Kern-Schleife der Brücke).
            const ps = f.pending.get(m.reqId);
            if (ps) {
                f.pending.delete(m.reqId);
                ps(m.plan || null);
            }
        } else if (m.type === "impostor") {
            // Studio-Bäcker-Antwort (Kanal "bake-impostor" → Reply "impostor": die Atlas-Schicht + Rahmen); Konsum:
            // `_applyStudioImpostorPayload`.
            const pi = f.pending.get(m.reqId);
            if (pi) {
                f.pending.delete(m.reqId);
                if (m.payload && m.platte === true) m.payload.vonPlatte = true; // Zensus: von der Platte
                pi(m.payload || null);
            }
        }
        // die Antwort ist das Ereignis der Fristen: die Uhr des nächsten ihres Fadens läuft an (`_foundryUhren`)
        this._foundryUhren(f);
    }
    // DER BÄCKER HAT SEINEN FADEN. Die Karte rendert das Studio offscreen mit WebGL (`bakeImpostorAtlas`: Kontext,
    // Programme, 8 Winkel, Rücklesen) und hält dabei den Faden fest, der sie trägt. Bis 05.10. war das der EINE
    // Werk-Worker: hinter einem Bake wartete jede Geometrie — gemessen (gate:arch-feld, Erst-Boot an der Mess-Wiese,
    // swiftshader): der erste, kalte Bake hielt den Worker 387 Takte ohne eine einzige Antwort, die nahe Eichen-L0 kam
    // danach in 5 Takten, die gepflanzte Eiche in 10 m stand über 400 Takte ohne Gestalt (die Satz-Brücke fiel mit dem
    // Fernwald; in Stufe 1 hielt derselbe Bake 233 Takte und die Brücke verdeckte es). Jetzt bäckt DASSELBE Studio
    // (derselbe Boot-Blob, dieselbe Schale, dieselbe Platte) in einem zweiten Faden, geboren beim ersten Bake-Auftrag
    // (headless bäckt nie einer). Die EINE Schlange (`_foundryAuftrag`) bleibt — sie speist zwei Bahnen
    // (`_foundryPumpe`), und eine Karte nimmt der Geometrie keinen Platz mehr.
    // DIE KARTEN BACKEN IN BAHNEN (K60-2): Radeon kalt bis zum ersten Bild buk EIN Bäcker 17 Karten nacheinander, je eine im
    // Flug — er bootete erst beim ersten Karten-Auftrag (1,65 s, 8 s nach der Navigation), jede Karte wartete danach auf den
    // Rundlauf durch den vollen Haupt-Faden, und die Bäume der Mesh-Zone, deren Stufe die Karte ist, warteten mit (die Werk-
    // Fäden ruhten von 10 bis 16 s, der Bäcker lief bis 19 s). Jetzt backen so viele Bäcker-Fäden wie Werk-Fäden
    // (`_foundryFaedenZahl`, dasselbe Gesetz der Kerne), je eine Karte im Flug (`_tickImpostorBake`); geboren werden sie mit
    // dem Studio, sobald ein echter Renderer zeichnet (`_foundryHelfer`) — headless bäckt nie einer, dort gebiert sie wie
    // bisher erst ein Karten-Auftrag. Der erste Bäcker heißt weiter `f.baecker` (Bahn "baecker"), jeder weitere trägt seinen
    // Faden in der Nummer (`imp` + `b<k>_`, Bahn "baecker<k>", `_foundryBahn`).
    _foundryBaecker(f) {
        if (f.baecker || !f.bootUrl) return f.baecker;
        const geburt = (k) => {
            const w = new Worker(f.bootUrl);
            const h = { k, w, bereit: false };
            // ein Boot-/Laufzeit-Fehler eines Bäckers bricht LAUT (K22): ohne ihn wartet jede Karte seiner Bahn
            w.onerror = (ev) =>
                this._stoffBruch(
                    `der Bäcker-Faden${k ? " " + k : ""} fällt — ` + ((ev && ev.message) || "Boot-/Laufzeit-Fehler")
                );
            w.onmessage = (ev) => {
                const m = ev.data;
                if (!m || typeof m !== "object") return;
                if (m.type === "ready" && m.world === "terrain") {
                    h.bereit = true;
                    if (k === 0) f.baeckerBereit = true;
                } else this._foundryAntwort(f, m);
                this._foundryPumpe(f);
            };
            return h;
        };
        f.baecker = geburt(0).w;
        f.baeckerHelfer = [];
        for (let k = 1; k < this._foundryFaedenZahl(); k++) f.baeckerHelfer.push(geburt(k));
        return f.baecker;
    }
    // Wie viele Studio-Fäden je Arbeit (Werk wie Bäcker): einer je vier Kerne, höchstens FOUNDRY_WERK_FAEDEN — die Kerne
    // allein entscheiden, nie der Renderer.
    _foundryFaedenZahl() {
        const kerne =
            typeof navigator !== "undefined" && Number.isFinite(navigator.hardwareConcurrency)
                ? navigator.hardwareConcurrency
                : 4;
        return Math.max(1, Math.min(AnazhRealm.FOUNDRY_WERK_FAEDEN, Math.floor(kerne / 4)));
    }
    // DIE WERK-FÄDEN (K60): das Werk baut jeden Körper in EINEM Faden — Radeon kalt bis zum ersten Bild hielt er 19 s Arbeit
    // (Bäume, Bauten, das Dorf), während 20 der 24 Kerne der Maschine ruhten. Jetzt bauen neben ihm Helfer aus DEMSELBEN
    // Boot-Blob (dieselbe Schale, dieselbe Platte, dasselbe Studio — der Bäcker-Weg, `_foundryBaecker`); die EINE Schlange
    // speist sie (`_foundryPumpe`). Ihre Zahl folgt der Maschine: ein Werk-Faden je vier Kerne, höchstens
    // FOUNDRY_WERK_FAEDEN (das Werk zählt mit). Die Kerne allein entscheiden, nie der Renderer: bis zur Prüfung K60-1 baute
    // unter dem Null-Renderer das Werk allein — kein Tor fuhr die Mehrbahn-Pumpe (gate:fluss W6 gibt der Seite 16 Kerne).
    _foundryHelfer(f) {
        if (f.helfer || !f.bootUrl) return;
        f.helfer = [];
        // die Bäcker kommen mit dem Studio, wo ein echter Renderer zeichnet (`_foundryBaecker`, K60-2)
        const r = this.state.renderer;
        if (r && !r._isHeadlessNull) this._foundryBaecker(f);
        const n = this._foundryFaedenZahl();
        for (let k = 1; k < n; k++) {
            const w = new Worker(f.bootUrl);
            const h = { k, w, bereit: false };
            // ein Boot-/Laufzeit-Fehler eines Helfers bricht LAUT (K22) wie der des Werks
            w.onerror = (ev) =>
                this._stoffBruch(`der Werk-Faden ${k} fällt — ` + ((ev && ev.message) || "Boot-/Laufzeit-Fehler"));
            w.onmessage = (ev) => {
                const m = ev.data;
                if (!m || typeof m !== "object") return;
                if (m.type === "ready" && m.world === "terrain") h.bereit = true;
                else this._foundryAntwort(f, m);
                this._foundryPumpe(f);
            };
            f.helfer.push(h);
        }
    }
    // DER EINE INGEST-CHOKEPOINT für das Studio-Buch (Kanal "get-book" → Reply "book"): das Rezeptbuch
    // (PRESETS: Regler s + fx) wird die EINE Quelle, der Blueprint liest daraus statt Hardcodes. Feste
    // Reihenfolge: Rezepte→Blueprint/AutoRegister · Welt-Palette→Farben · Wahrnehmung→LOD/Fog/Placement.
    // must-ignore: fehlt ein Teilfeld, bleibt dieser Teil byte-alt.
    _foundryIngestBook(m) {
        if (!m || typeof m !== "object") return;
        this._foundryIngestRecipes(m.book, m.paramsByKind);
        // der Leib des Spielers zuerst (K60-2): seine zwei Vorlagen gehen vor jedem Baum ins Werk (`_ofenSpielerVorlagen`) —
        // bestellte erst der nächste Takt, stand der Guss im Faden hinter zwölf Bäumen (Radeon kalt: Leib 7,5 s nach dem Buch)
        if (this.state._deferredAvatarSoul) this._ofenSpielerVorlagen();
        this._foundryIngestWorldParams(m.worldParams);
        this._foundryIngestRenderConfig(m.renderConfig);
        this._foundryIngestSiedlung(m.siedlung);
        // Die Fracht des EINEN Blatt-Atlas (S7, 05.10.): im Worker gemalt, gemippt und kodiert, per Transfer —
        // `_ensureFoliageClusterAtlas` lädt sie, ohne im Haupt-Thread zu malen.
        if (m.blattAtlas && m.blattAtlas.rgba && Array.isArray(m.blattAtlas.rgba.mips) && m.blattAtlas.rgba.mips.length)
            this._blattAtlasBild = m.blattAtlas;
        // das Ereignis für jeden, der auf das Buch wartet (`buchDa`); ein Buch ohne Rezepte bricht laut, die Wartenden
        // sehen es (der Vorrat: FOUNDRY WARM je kritischem Preset, der Dorf-Spawn: FOUNDRY KALT)
        if (!m.book || typeof m.book !== "object") this._stoffBruch("das Studio-Buch kam ohne Rezepte (get-book)");
        if (this._foundry && this._foundry.buchKam) this._foundry.buchKam();
        // Der Katalog steht: die Hotbar urteilt über ihre Namen und legt, wenn sie leer ist, den Start-Gurt.
        this._hotbarNachBuch();
        // (Die Stamm-Hüllen brauchen das Buch nicht mehr: die Welt-Skala liest vor ihm DIESELBE Tafel aus dem Kern —
        // `_baumHuellenNachBuch` fiel mit dem Hand-Spiegel, Leben-Schau 2.)
    }

    // DER START-GURT (Leben-Schau 07.10., L7): je Studio-Art EIN platzierbares Werk, in der Reihenfolge des Katalogs
    // (`_katalogSichtbar` — dieselbe Sicht wie Werkstatt und Rezeptbuch; die Art ist der kind des Studio-Rezepts). Heute:
    // Eiche · GT · Drachentor · ein Fachwerkhaus. Vorher Felsblock · Wasserfall · Damm (Alt-Baupläne, der Felsblock ein
    // Alt-Doppel, im Katalog versteckt). Null bei kaltem Buch.
    _startGurt() {
        const f = this._foundry;
        if (!f || !f.recipes) return null;
        const bps = this.state.blueprints || {};
        const arten = new Set();
        const gurt = [];
        for (const name of Object.keys(bps)) {
            if (!this._katalogSichtbar(name, bps[name]) || !this._isPlaceableBlueprint(bps[name])) continue;
            const preset = this._foundryPresetFor(name);
            const rec = preset ? f.recipes[preset] : null;
            if (!rec || typeof rec.kind !== "string" || arten.has(rec.kind)) continue;
            arten.add(rec.kind);
            gurt.push(name);
        }
        return gurt;
    }

    // Nach der Buch-Ankunft: ein Name ohne Bauplan fällt aus der Hotbar (laut), und eine ganz leere Hotbar bekommt den
    // Start-Gurt — ein neuer Spieler wie einer, dessen Gurt leer gespeichert wurde.
    _hotbarNachBuch() {
        const hb = this.state.hotbar;
        if (!Array.isArray(hb)) return;
        for (let i = 0; i < hb.length; i++) {
            if (hb[i] && !this.state.blueprints[hb[i]]) {
                this.log(`Hotbar-Slot ${i + 1}: „${hb[i]}" hat keinen Bauplan im Buch — der Platz wird frei.`, "WARN");
                hb[i] = null;
            }
        }
        // ein Studio-Name, der vor dem Buch ohne Bauplan stand, bekommt sein Phantom-Vorbacken zurück
        if (this._prebakedBlueprints) for (const n of hb) if (n) this._prebakedBlueprints.delete(n);
        if (hb.some(Boolean)) return this._renderHotbarDOM();
        const gurt = this._startGurt() || [];
        for (let i = 0; i < gurt.length && i < hb.length; i++) hb[i] = gurt[i];
        this._renderHotbarDOM();
    }
    // Siedlungs-Gesetz aus dem Buch (fachwerk-core SIEDLUNG, Feld `siedlung`): wo und wie viele Dörfer.
    // Ganz oder gar nicht: EIN nicht-finites Feld → kein Gesetz (`_siedlungGesetz` → null, kein Dorf — nie ein Ersatz).
    // Jeder Siedlungs-Urteils-Pfad läuft erst nach Buch-Ankunft (`_autoSettlementChannelLive`/Export) — Rezepte und
    // Gesetz kommen im selben Buch (`_foundryIngestBook`).
    _foundryIngestSiedlung(s) {
        if (
            s &&
            typeof s === "object" &&
            Number.isFinite(s.cellM) &&
            Number.isFinite(s.rarity) &&
            Number.isFinite(s.nHMin) &&
            Number.isFinite(s.nHSpan) &&
            Number.isFinite(s.slopeMax)
        ) {
            AnazhRealm._siedlungGesetzMemo = s;
        }
    }
    _foundryIngestRecipes(book, paramsByKind) {
        const f = this._foundry;
        if (!f || !book || typeof book !== "object") return;
        f.recipes = book;
        // B4-Regler-Tabellen der Kerne je kind (id/lab/min/max/step/def/law/grp): die Werkstatt rendert ihre
        // Slider daraus. must-ignore: Alt-Brücke ohne Feld → {} (keine Studio-Regler).
        f.paramsByKind = paramsByKind && typeof paramsByKind === "object" ? paramsByKind : {};
        // Der Blueprint WIRD das Rezeptbuch: je Studio-Preset ein Rezept-Eintrag im foundry-State,
        // den der Generierungs-Pfad (_foundryRequest -> Studio buildInstance) + die kuenftige
        // in-process-Ableitung lesen. Kein Abbild in Code — die Daten leben im State, vom Studio gespeist.
        let n = 0;
        for (const id in book) {
            if (Object.prototype.hasOwnProperty.call(book, id)) n++;
        }
        f.recipeCount = n;
        // AUTO-BLUEPRINT: jedes kind:"tree"-Preset ohne AnazhRealm-Spezies registriert sich als
        // `baum_<preset>` — Identität (Name·Tags·_grownSpecies) geklont von baum_eiche (der Physik-Richter
        // urteilt sie als Baum), der RENDER kommt ganz aus dem Studio (`_foundryPresetFor`, alle drei LODs,
        // Werkstatt-Regler aus dem Rezept). Der Wald streut sie über `_forestExtraSpecies`. Idempotent.
        this._foundryAutoRegisterSpecies(book);
        // Avatar zieht nach: baute der Boot den Rig-Avatar vor der Buch-Ankunft, trägt er die Konstanten-
        // Gestalt (`_koerperDials === null`). Jetzt EINMAL über den Seelen-Chokepoint applyPlayerSoul neu
        // gießen (Position/Physik/Held reisen mit; der Stempel wird non-null → idempotent).
        try {
            const pmU = this.state.playerMesh && this.state.playerMesh.userData;
            if (pmU && pmU._koerperDials === null && this._koerperStudioDials()) {
                this.applyPlayerSoul(this.state.player.soul || "human");
            }
        } catch (_e) {
            this._stoffBruch("der Avatar (Körper-Studio-Gestalt)", _e);
        }
    }
    _foundryAutoRegisterSpecies(book) {
        const bps = this.state && this.state.blueprints;
        if (!bps || !book) return 0;
        // DER EINE Register-Chokepoint läuft die KIND_POLICY-Tabelle (Tabelle vor if): eine neue Domäne ist
        // eine Policy-Zeile + Donor, kein Zweig. Fail-closed je kind (kein Donor → Klasse übersprungen).
        // `grown` trägt die Pflanzen-Identität (`_grownSpecies` = der load-bearing Name, clone.name bleibt
        // Donor), sonst clone.name; `builtIn` nur wenn die Policy es definiert. Unbekannter kind: must-ignore.
        const KP = AnazhRealm.KIND_POLICY;
        let registered = 0;
        for (const id in book) {
            if (!Object.prototype.hasOwnProperty.call(book, id)) continue;
            const rec = book[id];
            const pol = rec && KP[rec.kind];
            if (!pol) continue;
            // N4.4 — eine RENDER-ONLY-Policy-Zeile (nur `impostor`, kein prefix/donor — heute
            // shrub) registriert KEINEN Blueprint: fail-closed ueberspringen, BEVOR ein
            // undefined-Praefix einen Namen formen koennte.
            if (!pol.prefix || !pol.donor) continue;
            const name = pol.prefix + id;
            if (bps[name]) {
                // Heilung persistierter Alt-Klone: ein früher registrierter Auto-Blueprint erbte donorOnly über den
                // JSON-Klon (picker-unsichtbar) — beim Ingest entfernen (die eine Klon-Sichtbarkeits-Regel).
                if (bps[name]._foundryAutoSpecies && bps[name].donorOnly) delete bps[name].donorOnly;
                // Heilung persistierter Alt-Blueprints: trägt ein Auto-Blueprint seine Rezept-Identität nur im Namen,
                // verliert ein Klon/Umbenennen sie → `studioGestalt` nachstempeln (dieselbe Daten-Zeile wie unten).
                if (bps[name]._foundryAutoSpecies && typeof bps[name].studioGestalt !== "string") {
                    bps[name].studioGestalt = id;
                }
                // Heilung persistierter Alt-Klone: die role-Zeile der Policy (gate → "portal") nachstempeln, damit
                // ein altes tor_* zum Welt-Tor wird (Affordances stehender Einträge ziehen Spawn/setBlueprintAsPortal
                // nach).
                if (bps[name]._foundryAutoSpecies && pol.role && !bps[name].role) {
                    bps[name].role = pol.role;
                    bps[name].roleManual = true;
                }
                continue; // existiert (historische Arten + schon registrierte)
            }
            // Donor-Auflösung: ein LEBENDER Blueprint (tree → baum_eiche) ODER die eingefrorene Substanz-Zeile
            // (KIND_SUBSTANCE); donorTool (Policy-Daten): ein fx.tool-Rezept zieht die Werkzeug-Substanz.
            const dKey = pol.donorTool && rec.fx && rec.fx.tool ? pol.donorTool : pol.donor;
            const donor = bps[dKey] || (AnazhRealm.KIND_SUBSTANCE && AnazhRealm.KIND_SUBSTANCE[dKey]) || null;
            if (!donor || !Array.isArray(donor.parts)) continue; // fail-closed je kind (Blueprint UND Tabelle leer)
            const clone = JSON.parse(JSON.stringify(donor));
            // DIE EINE Klon-Sichtbarkeits-Regel (wie cloneBlueprint, gate:trias B10): ein Klon ist SICHTBAR —
            // `donorOnly` reist NIE mit (sonst fällt jeder Auto-Blueprint still aus allen Pickern).
            delete clone.donorOnly;
            clone.label = rec.lab || rec.label || id.charAt(0).toUpperCase() + id.slice(1);
            if (pol.grown) clone._grownSpecies = name;
            else clone.name = name;
            if (pol.builtIn !== undefined) clone.builtIn = pol.builtIn;
            clone._foundryAutoSpecies = id; // die Herkunfts-Marke (Diag/Provenienz)
            // Rezept-Identität als DATEN-Feld, nicht nur im Namen: `studioGestalt` liest der EINE Resolver
            // (`_foundryPresetForEntry`), `cloneBlueprint` erbt es → jeder Klon/Umbenennung behält die Gestalt.
            clone.studioGestalt = id;
            // V18.464 — die role-DATEN-Zeile der Policy stempeln (gate → "portal"):
            // jedes registrierte Studio-Tor ist ab Geburt ein Welt-Tor.
            if (pol.role) {
                clone.role = pol.role;
                clone.roleManual = true;
            }
            bps[name] = clone;
            registered++;
        }
        if (registered > 0) {
            // Neue Arten in FRISCHE Zellen: den Dart-Memo (vor Rezept-Ankunft gecacht) einmal leeren — gepflanzte
            // Chunks bleiben (kein Churn). Deterministisch je (Seed, Rezept-Satz).
            this._forestDartMemo = null;
            this._forestExtraCache = null; // die Auto-Arten-Liste neu ableiten (gleiche Buch-Identität möglich)
            this.log(`Nervensystem: ${registered} neue Studio-Baumart(en) automatisch registriert.`, "INFO");
        }
        return registered;
    }
    // Studio-Welt-Parameter (der Buch-Umschlag): die Atmosphäre-Anker. Die Boden-Palette reist NICHT hier — sie
    // liegt synchron im Terrain-Namensraum (`AnazhRealm.BODEN_FARBE`), der Voxel-Worker braucht sie vor dem ersten Chunk.
    _foundryIngestWorldParams(params) {
        if (!params || typeof params !== "object") return;
        this.state.studioWorldParams = params;
        // DIE ATMOSPHAERE-ANKER (Mittag): Himmel-Top + Sonnenfarbe als HEX (der Tag/Nacht-Zyklus
        // rechnet in Hex, nicht linear) → `DAY_NIGHT_STOPS` bindet seinen Mittags-Stop hieran. Additiv:
        // nur der Mittag folgt dem Studio, der ganze Zyklus bleibt AnazhRealms. Fallback = 0 Regress.
        const sk = params.sky || {};
        const sky = {};
        if (typeof sk.top === "number") sky.top = sk.top;
        if (typeof sk.sun === "number") sky.sun = sk.sun;
        AnazhRealm._studioSky = Object.keys(sky).length ? sky : null;
    }
    // Wahrnehmungs-Kanal: Studio-PORTAL_RENDER_CONFIG ist die EINE Quelle für Sichtweite/LOD/Fades/Dichte.
    // LOD-Distanzen/Fades → mutables LOD_DISTANCES (CPU-/Shader-Leser ziehen live nach) + state.lodRef;
    // Sichtweite/Dichte/Understory → statisches `AnazhRealm._studioRenderConfig` (Fallback = alter Wert).
    _foundryIngestRenderConfig(config) {
        if (!config || typeof config !== "object") return;
        this.state.studioRenderConfig = config;
        AnazhRealm._studioRenderConfig = config; // der Stand-Stempel liest die Wahrnehmung selbst (`_standStempel`)
        // LOD-Distanzen/Fades in die EINE LOD-Quelle (LOD_DISTANCES ist jetzt mutable — die Defaults
        // matchen die Vorlage schon; hier folgt AnazhRealm einem LIVE-Edit des Config-Blocks).
        const L = config.lod;
        const D = AnazhRealm.LOD_DISTANCES;
        if (L && typeof L === "object") {
            // Die Welt liest die Studio-Distanzen (W5, Lehre 19): die Kosten einer Stufe wohnen im Asset (Studio-
            // Budget lod.budget, gate:asset-contract), nie in einem Host-Umweg, der d0/d1 umrechnet.
            if (Number.isFinite(L.d0)) D.thresh01 = L.d0;
            if (Number.isFinite(L.d1)) D.thresh12 = L.d1;
            if (Number.isFinite(L.fade)) D.fade = L.fade;
            if (Number.isFinite(L.fade0)) D.fade0 = L.fade0;
            if (Number.isFinite(L.hyst)) D.hysteresis = L.hyst;
            if (Number.isFinite(L.ref)) {
                D.lodRef = L.ref;
                // leafVisCap NIE an ref koppeln: die Blatt-Kappe ist die eigene Zeile lod.blattKappe (24 m), LOD_DISTANCES
                // liest sie beim Laden. state.lodRef ist die LIVE-Spiegel-Quelle (CPU-Membership + Shader-
                // uLodRef, in _loopRender gespiegelt).
                if (this.state) this.state.lodRef = L.ref;
            }
        }
        // DER MERGE-CHOKEPOINT: die Blöcke der Zweit-Kerne — Stufen (N7.5), Budget je Art (B2c) und Gestalten je Rezept
        // (W8) — fallen NUR hier in die EINEN Karten `lod.kindStages` / `lod.budget` / `lod.budget.gestalten`,
        // disjunkt, first-wins (foundry-core führt), unbekannte Felder must-ignore (phyto-core `kerneVereinen` —
        // dieselbe Funktion liest die Wand auf dem Umschlag). Der Clamp-Leser (_foundryFlattenFor) und die Gestalten-
        // Wahl (_foundryGestalten: ein Haus, ein Tor, eine Klinge zählt seine Gestalten aus SEINEM Gesetzbuch) sehen ihn.
        globalThis.__phytoCore.kerneVereinen(config);
    }
    // Das Rezept eines Presets (aus dem Studio-Buch) — die EINE Rezept-Quelle fuer den Blueprint.
    _foundryRecipeFor(preset) {
        const f = this._foundry;
        return f && f.recipes ? f.recipes[preset] || null : null;
    }
    // ==================== DIE TRANSPORT-SCHALE: der Host-Teil des Foundry-Kanals IM Worker ====================
    // Befund 02.10. (Fluss-Linse, Mess-Wiese, Holz voll): beim Boot liefen 262 Studio-Assets = 404 MB durch den
    // HAUPT-Thread — strukturierter Klon beim Empfang (Σ 600 ms, max 76 ms je Antwort), IDB-Put-Serialisierung
    // (Σ 3,7 s, max 207 ms) und IDB-Gets hinter den Schreib-Transaktionen (Median 3,3 s, max 60 s); 32 % der
    // Bytes (aWind · aCenter · aType) las niemand. Die Schale läuft im Worker VOR den Studio-Skripten (der
    // Boot-Blob stellt ihren Quelltext voran, `_ensureAssetFoundry`) und trägt den ganzen Transport:
    //   PLATTE        Stempel (SHA-256 über Manifest + alle Kern-Skripte + die Brücke, `|f<FOUNDRY_PLATTE_FORMAT>`) · Get · Put
    //                 — der Haupt-Thread fasst den Asset-Cache nie mehr an (Store `anazhFoundryAssets/assets`).
    //   KONSUM-WAND   nur die Attribute, die `_foundryBuildMesh` liest (FOUNDRY_LESEN), reisen und liegen auf Platte.
    //   VERENGUNG     Index Uint32 → Uint16, wo das Teil ≤ 65 536 Vertices trägt.
    //   TRANSFER      jede Asset-/Karten-/Pixel-Antwort reist zero-copy (die Puffer sind frisch je Antwort).
    //   SAISON-NAGEL  jeder Körper und jede Karte erreicht das Studio als Sommer (das Jahr färbt der Host).
    // Ein `build-asset` mit `platte` (Schlüssel `_foundryKoerperKey`: `<preset>|<gestalt>|<lod>[|ov:…]`) fragt erst die
    // Platte; ein Miss geht an das Studio (byte-unberührt), dessen Antwort die Schale abfängt, verschlankt, schreibt und
    // überträgt. `vorrat` wärmt nur die Platte (leere Antwort). Ein `bake-impostor` trägt das Schicht-Format des Hosts
    // (`fmt` "bc" | "rgba8"): die Schale kodiert jeden frischen Bake zur Atlas-Schicht (Karten-Codec in phyto-core:
    // deckungstreue Mips, sRGB, BC1/BC5), schreibt sie mit `platte` (`karte|…|<fmt>`) und liest dort zuerst.
    // `nurPlatte` (der Ship-Hook `__anazhLiveBake === false`) baut nie: Miss = leere Antwort. Diese Funktion läuft als
    // Quelltext im Worker — sie greift auf nichts außerhalb ihres eigenen Rumpfs zu.
    static _foundrySchale(cfg) {
        const W = globalThis; // der Worker-Scope (self)
        const LESEN = new Set(cfg.lesen);
        const roh = W.postMessage.bind(W);
        const schreibAuftrag = new Map(); // reqId → Platten-Schlüssel des Studio-Baus, der gerade läuft
        // DIE PLATTE HÄLT KEINEN FADEN. Zwei Studio-Fäden (Werk und Bäcker, `_foundryBaecker`) teilen EINE IndexedDB. Ein
        // synchroner Studio-Lauf, gerufen aus dem Lese-Erfolg, hält dessen Transaktion bis zu seinem Ende offen — und jede
        // Transaktion des anderen Fadens wartet dahinter (gemessen 05.10., gate:arch-feld Erst-Boot: fünf L1-Körper des
        // Werks, in Takt 3 gesendet, kamen in Takt 746–753, einen Takt nach dem kalten Karten-Bake des Bäckers, der seine
        // Karten-Lese-Transaktion 742 Takte offen hielt). Darum läuft ein Studio-Auftrag erst, wenn DIESER Faden keine
        // Transaktion offen hat (`offen`), in Ankunfts-Reihenfolge — die Arbeits-Uhr des Hosts bleibt FIFO je Faden.
        let offen = 0,
            laeuft = false;
        const bauten = [];
        const los = () => {
            while (!laeuft && offen === 0 && bauten.length) {
                laeuft = true;
                try {
                    bauten.shift()();
                } catch (e) {
                    // laut wie vorher (das Fehler-Ereignis des Workers), und die Schlange dahinter läuft weiter
                    setTimeout(() => {
                        throw e;
                    });
                } finally {
                    laeuft = false;
                }
            }
        };
        const tx = (d, art) => {
            const t = d.transaction("assets", art);
            offen++;
            let zu = false;
            const ende = () => {
                if (zu) return;
                zu = true;
                offen--;
                los();
            };
            t.addEventListener("complete", ende);
            t.addEventListener("abort", ende);
            return t;
        };
        let db = null;
        let dbTot = !cfg.platte || typeof indexedDB === "undefined";
        const platte = dbTot
            ? Promise.resolve(null)
            : Promise.all([cfg.manifestText, ...cfg.stempelUrls.map((u) => fetch(u).then((r) => r.text()))])
                  .then((srcs) => crypto.subtle.digest("SHA-256", new TextEncoder().encode(srcs.join("\n"))))
                  .then((buf) => {
                      const stempel =
                          Array.from(new Uint8Array(buf))
                              .map((b) => b.toString(16).padStart(2, "0"))
                              .join("") +
                          "|f" +
                          cfg.format;
                      return new Promise((resolve) => {
                          const req = indexedDB.open("anazhFoundryAssets", 1);
                          req.onupgradeneeded = () => req.result.createObjectStore("assets");
                          req.onerror = () => resolve(null);
                          req.onsuccess = () => {
                              const d = req.result;
                              const t = tx(d, "readwrite");
                              const st = t.objectStore("assets");
                              const g = st.get("__stamp");
                              g.onsuccess = () => {
                                  // Generator oder Transport-Format geändert → der GANZE Cache ist Drift → leeren.
                                  if (g.result !== stempel) {
                                      st.clear();
                                      st.put(stempel, "__stamp");
                                  }
                              };
                              t.oncomplete = () => resolve(d);
                              t.onerror = () => resolve(null);
                          };
                      });
                  })
                  .catch(() => null)
                  .then((d) => {
                      db = d;
                      if (!d) dbTot = true;
                      return d;
                  });
        // Der Platten-Wert eines Schlüssels: Körper `{ meshes }`, Karte `{ payload }` (oder null).
        const lies = (key) =>
            platte.then((d) =>
                d
                    ? new Promise((resolve) => {
                          try {
                              const g = tx(d, "readonly").objectStore("assets").get(key);
                              g.onsuccess = () => resolve(g.result && typeof g.result === "object" ? g.result : null);
                              g.onerror = () => resolve(null);
                          } catch (_e) {
                              resolve(null);
                          }
                      })
                    : null
            );
        const schreib = (key, wert) => {
            if (!db || dbTot) return;
            try {
                const t = tx(db, "readwrite");
                t.objectStore("assets").put(wert, key).onerror = () => {
                    dbTot = true; // Quota/Fehler → nur noch Studio, nie still halb
                };
                // Der Put schließt, ohne dass dieser Faden seinen Erfolg erst abholt (er fällt mitten in einen Studio-
                // Lauf): der nächste Lauf wartet nur einen Ereignis-Umlauf, nie die Schreib-Zeit.
                if (typeof t.commit === "function") t.commit();
            } catch (_e) {
                dbTot = true;
            }
        };
        // Eine Karte ist brauchbar, wenn ihre drei Felder (Albedo, Normale, Sonnen-Sicht — A7) als eigene Puffer reisen UND sie die NICHT-LEERE-WAND des
        // Karten-Gesetzes hält (ein Bäcker-Fehler liefert maßtreue Clear-Pixel): eine leere Karte reist nie auf die
        // Platte und nie von ihr — sie kommt als payload null (die Retry-Disziplin des Hosts).
        const karteOk = (p) => {
            const G = W.__phytoCore && W.__phytoCore.KARTEN_GESETZ;
            return !!(
                G &&
                p &&
                ArrayBuffer.isView(p.albedo) &&
                ArrayBuffer.isView(p.normal) &&
                ArrayBuffer.isView(p.licht) &&
                p.albedo.buffer !== p.normal.buffer &&
                p.licht.buffer !== p.normal.buffer &&
                p.opak >= G.minOpak
            );
        };
        // Liegt der Schlüssel auf der Platte? (count statt get: der Vorrat fragt nur, nie die Bytes)
        const hat = (key) =>
            platte.then((d) =>
                d
                    ? new Promise((resolve) => {
                          try {
                              const c = tx(d, "readonly").objectStore("assets").count(key);
                              c.onsuccess = () => resolve(c.result > 0);
                              c.onerror = () => resolve(false);
                          } catch (_e) {
                              resolve(false);
                          }
                      })
                    : false
            );
        const schlank = (meshes) => {
            for (const m of meshes) {
                if (!m || typeof m !== "object") continue;
                for (const k of Object.keys(m)) {
                    const a = m[k];
                    if (a && a.array && ArrayBuffer.isView(a.array) && !LESEN.has(k)) delete m[k];
                }
                if (m.index instanceof Uint32Array && m.position && m.position.array.length / 3 <= 65536)
                    m.index = Uint16Array.from(m.index);
            }
            return meshes;
        };
        const puffer = (meshes) => {
            const set = new Set();
            for (const m of meshes) {
                if (!m || typeof m !== "object") continue;
                for (const k of Object.keys(m)) {
                    const a = m[k];
                    if (a && a.array && ArrayBuffer.isView(a.array)) set.add(a.array.buffer);
                }
                if (m.index && ArrayBuffer.isView(m.index)) set.add(m.index.buffer);
            }
            return Array.from(set);
        };
        const antwort = (m, meshes, vonPlatte) =>
            roh(
                {
                    type: "asset",
                    world: "terrain",
                    cv: 1,
                    reqId: m.reqId,
                    presetId: m.presetId,
                    seed: m.seed,
                    lod: m.lod | 0,
                    meshes,
                    platte: vonPlatte,
                },
                puffer(meshes)
            );
        W.postMessage = function (msg, a, b) {
            if (msg && msg.type === "asset" && Array.isArray(msg.meshes)) {
                schlank(msg.meshes);
                const auftrag = schreibAuftrag.get(msg.reqId);
                if (auftrag !== undefined) {
                    schreibAuftrag.delete(msg.reqId);
                    // Put VOR dem Transfer (die Serialisierung läuft hier im Worker; danach sind die Puffer weg).
                    if (msg.meshes.length) schreib(auftrag.key, { meshes: msg.meshes });
                    // Der Vorrat: der Körper liegt jetzt auf der Platte — zum Haupt-Thread reist er nicht (kein Leser).
                    if (auftrag.vorrat) return roh(Object.assign({}, msg, { meshes: [], vorrat: true }));
                }
                return roh(msg, puffer(msg.meshes));
            }
            const p = msg && msg.payload;
            const auftragK = msg && msg.type === "impostor" ? schreibAuftrag.get(msg.reqId) : undefined;
            if (auftragK !== undefined) {
                // DIE KARTE WIRD IM WORKER ZUR ATLAS-SCHICHT (W6): deckungstreue Mips + BC1/BC5 (ohne BC-Feature rgba8/
                // rg8) aus dem Karten-Codec (__phytoCore.karteKodiere), Platten-Put VOR dem Transfer — der Haupt-Thread
                // kopiert nur noch eine Schicht. Ein Kodier-Bruch reist als payload null (die Retry-Disziplin des Hosts).
                schreibAuftrag.delete(msg.reqId);
                const core = W.__phytoCore;
                const k = p && auftragK.fmt && core ? core.karteKodiere(p, auftragK.fmt) : null;
                if (!karteOk(k)) return roh(Object.assign({}, msg, { payload: null }));
                if (auftragK.key) schreib(auftragK.key, { payload: k });
                return roh(Object.assign({}, msg, { payload: k }), [k.albedo.buffer, k.normal.buffer, k.licht.buffer]);
            }
            if (msg && msg.type === "render-native" && p && p.pixels) return roh(msg, [p.pixels.buffer]);
            // Das Buch trägt das Bild des EINEN Blatt-Atlas: die Schale macht es im Worker zur FRACHT
            // (`__phytoCore.blattAtlasFracht`: BC3 ab Stufe 0 für den Wirt mit BC (K20), rgba ab Stufe 1 ohne) und reicht
            // sie per Transfer, nie als Klon — der Haupt-Thread kodiert nichts.
            if (msg && msg.type === "book" && msg.blattAtlas && Array.isArray(msg.blattAtlas.mips)) {
                const fr = W.__phytoCore.blattAtlasFracht(msg.blattAtlas, true);
                const stufen = fr ? fr.rgba.mips.concat(fr.bc ? fr.bc.mips : []) : [];
                return roh(
                    Object.assign({}, msg, { blattAtlas: fr }),
                    Array.from(new Set(stufen.map((st) => st.data.buffer)))
                );
            }
            return roh(msg, a, b);
        };
        // Der Kanal-Hörer steht VOR dem `onmessage` des Studios (registriert beim Import) — er sieht jede
        // Nachricht zuerst und hält jeden Körper- und Karten-Auftrag an. DER SAISON-NAGEL (V18.527): jeder Bau ist
        // Golden-Sommer — das Studio sieht season "summer", gleich was der Auftrag trägt; das Jahr färbt der Host
        // (uSeasonMul). So kann kein Saison-Rest im Studio (setSeasonColors) einen Körper oder die Platte färben.
        W.addEventListener("message", (ev) => {
            const m = ev.data;
            if (!m || (m.type !== "build-asset" && m.type !== "bake-impostor")) return;
            ev.stopImmediatePropagation();
            const weiter = Object.assign({}, m, { season: "summer" });
            delete weiter.platte;
            delete weiter.nurPlatte;
            const studio = () => {
                bauten.push(() => {
                    if (typeof W.onmessage === "function") W.onmessage({ data: weiter });
                });
                los();
            };
            if (m.type === "bake-impostor") {
                // DIE KARTE: jeder Bake wird hier zur Atlas-Schicht im Format des Hosts (`fmt`, postMessage oben).
                // Mit `platte` (`karte|<art>|<gestalt>[|ov:…]|<fmt>`) liest die Schale zuerst: Treffer → Antwort ohne
                // Studio (zero-copy); Miss → das Studio bäckt, die Schale kodiert und schreibt. `nurPlatte` (Ship-Hook)
                // bäckt nie: Miss = payload null.
                const fmt = typeof m.fmt === "string" ? m.fmt : null;
                const backe = () => {
                    schreibAuftrag.set(m.reqId, { key: typeof m.platte === "string" ? m.platte : null, fmt });
                    studio();
                };
                if (typeof m.platte !== "string") return backe();
                return lies(m.platte).then((wert) => {
                    const p = wert && wert.payload;
                    if (karteOk(p) && p.fmt === fmt)
                        return roh(
                            {
                                type: "impostor",
                                world: "terrain",
                                reqId: m.reqId,
                                presetId: m.presetId,
                                seed: m.seed,
                                payload: p,
                                platte: true,
                            },
                            [p.albedo.buffer, p.normal.buffer, p.licht.buffer]
                        );
                    if (m.nurPlatte)
                        return roh({ type: "impostor", world: "terrain", reqId: m.reqId, payload: null, platte: true });
                    backe();
                });
            }
            if (typeof m.platte !== "string") return studio();
            if (m.vorrat) {
                // DER VORRAT wärmt nur die Platte: liegt der Körper schon dort — oder gibt es keine Platte (nichts zu
                // wärmen) —, antwortet die Schale leer ohne Bau; sonst baut das Studio, die Schale schreibt.
                return hat(m.platte).then((da) => {
                    if (da || dbTot) return antwort(m, [], da);
                    schreibAuftrag.set(m.reqId, { key: m.platte, vorrat: true });
                    studio();
                });
            }
            lies(m.platte).then((wert) => {
                const hit = wert && Array.isArray(wert.meshes) ? wert.meshes : null;
                if (hit) return antwort(m, hit, true);
                if (m.nurPlatte) return antwort(m, [], true);
                schreibAuftrag.set(m.reqId, { key: m.platte, vorrat: false });
                studio();
            });
        });
    }
    // Siedlung als DATEN anfragen: der Worker rechnet exportSettlement und liefert reine Slot-Daten (kein
    // Mesh, kein Cache — ein deliberater Akt). Fail-closed: kein Worker/nicht ready → null. Dieselbe
    // pending-Map wie die Assets.
    _foundryRequestSettlement(dp) {
        const f = this._ensureAssetFoundry();
        if (!f || !f.ready || !f.worker) return Promise.resolve(null);
        // Durch DIE EINE WORKER-SCHLANGE, sofort dran (ein deliberater Akt, reine Daten). Dieselbe EINE Frist (45 s
        // Arbeit): ohne Uhr hielte ein verlorener Export die FIFO-Uhr aller späteren Aufträge an.
        return this._foundryAuftrag(
            f,
            "stl-",
            { type: "export-settlement", dp: dp || {} },
            0,
            45000,
            "FOUNDRY TIMEOUT: export-settlement nach 45 s Arbeit ohne Reply → null"
        );
    }
    // DIE EINE SLOT-QUELLE: `_spawnSettlementFromExport` (alle Slots sofort) und `_tickAutoSettlement`
    // (über Ticks) heben jeden Slot hier. Blueprint-Name aus KIND_POLICY über den kind des LIVE-Rezepts
    // (prefix + kultur, kein "haus_"-Literal); die Spalten-Probe `_nassAt` über dem ganzen Fundament vor JEDEM Spawn; fehlender Blueprint/
    // fremde Kultur → Slot fällt GESCHLOSSEN aus. Γ5: aller Zufall lebt im Export, hier nur lesen +
    // platzieren (spawnArchitecture silent). Rückgabe true = platziert.
    // DIE BAU-WAND (Integration Welle L, Stufe kampf-maus): ein Haus landet nie IN einem bestehenden Bau, und vor seiner
    // Haustür bleibt der Zugang frei. Geprüft werden der Grundriss (haus-lokal Mitte {ox, oz}, halbe Maße {ex, ez}, Gier ry
    // um den Slot-Ort x/z) und der Vorplatz der Tür (1,2 m vor der Front −z, Türbreite) gegen die Hülle jedes Baus, der
    // nicht weicht (Natur und Würfe des Felds weichen dem Haus: `_weichtDemBau`, `_grundrissRaeumen`) — die Boxen über dem Boden des Hauses (Oberkante über
    // bodenY + Stufe), gedreht im Rahmen ihrer obb; ein Haus ohne gestempelte Hülle mit seinem Grundriss. Berührung ist kein
    // Überlapp (die Reihenhäuser einer Siedlung teilen ihre Wand). Seit „vor dir" vorn liegt (_blickVorn), gründet der
    // Chat-Akt „dorf" sein Dorf vor dem Spieler — an der Start-Plattform stand ein Haus 3,6 m tief in ihr (die Treppe
    // versperrt), ein zweites mit der Haustür an ihrer Wand (gate:haus-welt W1/W3/W7). Gibt false, wenn ein Bau im Weg ist.
    _bauFrei(x, z, ry, fp, tuer, bodenY) {
        const c = Math.cos(ry);
        const s = Math.sin(ry);
        const T = 0.05;
        const flaeche = (lx, lz, hx, hz) => ({ cx: x + lx * c + lz * s, cz: z - lx * s + lz * c, hx, hz, c, s });
        const flaechen = [flaeche(fp.ox, fp.oz, Math.max(0, fp.ex - T), Math.max(0, fp.ez - T))];
        if (tuer && Number.isFinite(tuer.x) && Number.isFinite(tuer.z) && Number.isFinite(tuer.w))
            flaechen.push(flaeche(tuer.x, tuer.z - 0.6, tuer.w / 2, 0.6 - T));
        const R = Math.hypot(fp.ex, fp.ez) + Math.hypot(fp.ox, fp.oz) + 2;
        const STEP = AnazhRealm.PLAYER_STEP_UP;
        const b2 = this._bauFreiBox || (this._bauFreiBox = { cx: 0, cz: 0, hx: 0, hz: 0, c: 1, s: 0 });
        const trifft = () => {
            for (const a of flaechen) if (this._rechteckeSchneiden(a, b2)) return true;
            return false;
        };
        for (const e of this.state.architectures || []) {
            if (!e || !e.position) continue;
            const r = R + (e._blockerReach || 0) + 8;
            if (Math.abs(e.position.x - x) > r || Math.abs(e.position.z - z) > r) continue;
            if (this._weichtDemBau(e)) continue; // Natur und die Würfe des Felds weichen dem Haus (`_naturRaeumen`)
            // Die Lichtung eines Baus (der Genesis-Platz: Scheibe und Ring der Tore, `_grundrissVon`) sperrt in jeder Höhe: ihr
            // Stein ist im Feld gestempelt, ein Haus fand dort „ebenen Boden" auf Höhe der Scheibe und stand auf ihr (der
            // Ersatz-Ort eines Slots an der Plattform: 6,0 m von ihrer Mitte, die Scheibe trägt 6,5 m); seit K52 steht kein Haus
            // zwischen den Toren.
            const gL = this._grundrissVon(e);
            if (gL && gL.lichtung) {
                b2.cx = e.position.x;
                b2.cz = e.position.z;
                b2.hx = gL.ex;
                b2.hz = gL.ez;
                b2.c = 1;
                b2.s = 0;
                if (trifft()) return false;
                continue;
            }
            const boxen = e.blockerAABBs;
            if (boxen && boxen.length) {
                for (const b of boxen) {
                    if (!(b.topY > bodenY + STEP)) continue;
                    const ob = b.obb;
                    if (ob) {
                        b2.cx = ob.cx;
                        b2.cz = ob.cz;
                        b2.hx = ob.hx;
                        b2.hz = ob.hz;
                        b2.c = ob.c;
                        b2.s = ob.s;
                    } else {
                        b2.cx = (b.minX + b.maxX) / 2;
                        b2.cz = (b.minZ + b.maxZ) / 2;
                        b2.hx = (b.maxX - b.minX) / 2;
                        b2.hz = (b.maxZ - b.minZ) / 2;
                        b2.c = 1;
                        b2.s = 0;
                    }
                    if (trifft()) return false;
                }
                continue;
            }
            const g = this._grundrissVon(e);
            if (!g) continue;
            const ery = Number.isFinite(e.rotationY) ? e.rotationY : 0;
            b2.c = Math.cos(ery);
            b2.s = Math.sin(ery);
            b2.cx = e.position.x + g.ox * b2.c + g.oz * b2.s;
            b2.cz = e.position.z - g.ox * b2.s + g.oz * b2.c;
            b2.hx = g.ex;
            b2.hz = g.ez;
            if (trifft()) return false;
        }
        return true;
    }

    // Die Bau-Wand für einen runden Bau des Dorfs (Brunnen, Marktstand): das Quadrat in seinem Fußabdruck-Kreis (Radius aus
    // dem Bauplan) — ein Nachbar, der den Kreis nur streift, sperrt nicht.
    _bauFreiRund(type, x, z, bodenY) {
        const R = Math.max(0.5, (this._blueprintFootprintRadius(type, 1) || 0) * Math.SQRT1_2);
        return this._bauFrei(x, z, 0, { ex: R, ez: R, ox: 0, oz: 0 }, null, bodenY);
    }

    // Schneiden sich zwei gedrehte Rechtecke der Ebene? Je Rechteck Mitte {cx, cz}, halbe Maße {hx, hz} und die Drehung
    // {c, s} im Rahmen der Hülle (lokal → Welt: x = cx + lx·c + lz·s, z = cz − lx·s + lz·c; dieselbe wie `box.obb`).
    // Trennende Achsen: die vier Kanten-Richtungen; Berührung zählt nicht.
    _rechteckeSchneiden(a, b) {
        const dx = b.cx - a.cx;
        const dz = b.cz - a.cz;
        for (let i = 0; i < 4; i++) {
            const R = i < 2 ? a : b;
            const nx = i % 2 === 0 ? R.c : R.s;
            const nz = i % 2 === 0 ? -R.s : R.c;
            const ra = a.hx * Math.abs(a.c * nx - a.s * nz) + a.hz * Math.abs(a.s * nx + a.c * nz);
            const rb = b.hx * Math.abs(b.c * nx - b.s * nz) + b.hz * Math.abs(b.s * nx + b.c * nz);
            if (Math.abs(dx * nx + dz * nz) >= ra + rb) return false;
        }
        return true;
    }

    // DAS EINE RASTER EINES FUNDAMENTS (bau-lokal, [lx, lz, flaeche]): die Fläche des Grundrisses `fp` {ex, ez, ox, oz} in
    // Schritten ≤ 2 m samt ihren Kanten (flaeche true) und der Vorplatz der Haustür `tuer` (0,25 m und 1 m vor der Front −z,
    // je drei Punkte über die Türbreite; flaeche false). Integration Welle L: vier Ecken und die Mitte ließen den Buckel
    // zwischen sich durch — an einer Kuppe der Front lag die Haustür 2,9 m unter dem Gelände (gate:haus-welt W1). Leser: die
    // Höhe der Siedlung (`_spawnSettlementSlot`) und das Land jedes Fundaments (`_fundamentLand`).
    // `schritt` (m, Vorgabe 2): die Höhe misst Buckel in 2 m, das Land misst die Wasserlinie in 1 m (werk-ufer: zwischen
    // den 2-m-Punkten lag die Linie 0,85 m tief im Grundriss, das Haus am Gleithang stand 0,27 m im Wasser — Z misst ≤ 1 m).
    static _fundamentRaster(fp, tuer, schritt = 2) {
        const out = [];
        if (!fp || !Number.isFinite(fp.ex) || !Number.isFinite(fp.ez) || !(fp.ex > 0) || !(fp.ez > 0)) return out;
        const ox = Number.isFinite(fp.ox) ? fp.ox : 0;
        const oz = Number.isFinite(fp.oz) ? fp.oz : 0;
        const deckel = Math.ceil(24 / schritt);
        const nx = Math.min(deckel, Math.max(1, Math.ceil((2 * fp.ex) / schritt)));
        const nz = Math.min(deckel, Math.max(1, Math.ceil((2 * fp.ez) / schritt)));
        for (let i = 0; i <= nx; i++)
            for (let j = 0; j <= nz; j++)
                out.push([ox + fp.ex * ((2 * i) / nx - 1), oz + fp.ez * ((2 * j) / nz - 1), true]);
        if (tuer && Number.isFinite(tuer.x) && Number.isFinite(tuer.z) && Number.isFinite(tuer.w))
            for (let i = -1; i <= 1; i++) {
                out.push([tuer.x + (i * tuer.w) / 2, tuer.z - 0.25, false]);
                out.push([tuer.x + (i * tuer.w) / 2, tuer.z - 1, false]);
            }
        return out;
    }

    // DER GRUNDRISS EINES SLOTS (haus-lokal): das obb des Exports um seine Mitte — die obb-Mitte (Siedlungs-Rahmen wie
    // slot.x/z) liegt bis 1,8 m neben dem Haus-Ursprung (das Hof-Haus 4 m), haus-lokal als Versatz {ox,oz}. Ohne obb
    // (fremder Export) der Kern der Tür-Zeile — derselbe Grundriss, den die Wand jedes Werks an der Wurzel aus den
    // Optionen liest (`_werkGrundriss`). `fundament` nur mit obb (das Haus eines Orts trägt den Saum seines Erdbaus).
    // Leser: die Slot-Quelle (`_spawnSettlementSlot`) und die Ort-Wahl (`_ortTraegt`).
    static _slotGrundriss(slot) {
        const ry = slot.phi || 0;
        const rc = Math.cos(ry);
        const rs = Math.sin(ry);
        const obb = slot.obb;
        const tu = slot.tuer;
        let fundament = null;
        if (obb && Number.isFinite(obb.ex) && Number.isFinite(obb.ez) && obb.ex > 0 && obb.ez > 0) {
            const dxw = Number.isFinite(obb.cx) ? obb.cx - slot.x : 0;
            const dzw = Number.isFinite(obb.cz) ? obb.cz - slot.z : 0;
            fundament = { ex: obb.ex, ez: obb.ez, ox: dxw * rc - dzw * rs, oz: dxw * rs + dzw * rc };
        }
        const fp =
            fundament ||
            (tu && Number.isFinite(tu.W) && Number.isFinite(tu.D)
                ? { ex: tu.W / 2, ez: tu.D / 2, ox: 0, oz: 0 }
                : null);
        return { fundament, fp };
    }

    _spawnSettlementSlot(slot, origin, f, so) {
        if (!slot || typeof slot.kultur !== "string" || !origin) return false;
        // DER BODEN DES PLANS (K10): der Slot trägt seine Höhe `y` aus dem Plan v2 (fachwerk `ortPlan`, `_ortPlanSetzen`) — die
        // Welt erfindet keine Höhe mehr: die hMax-Suche über das Raster, das Podest, die Klippen-Wand und die Ersatz-Orte fielen,
        // der Erdbau des Orts trägt das Haus. Ein Slot ohne y fällt geschlossen und laut.
        if (!Number.isFinite(slot.y)) {
            this.log(
                `SIEDLUNG: der Slot „${slot.kultur}" trägt keinen Boden y — der Plan v2 fehlt (fail-closed)`,
                "ERROR"
            );
            return false;
        }
        const rec = f && f.recipes ? f.recipes[slot.kultur] : null;
        const pol = rec && AnazhRealm.KIND_POLICY[rec.kind];
        const name = pol && pol.prefix ? pol.prefix + slot.kultur : null;
        if (!name || !this.state.blueprints[name]) return false; // fail-closed
        const ry = slot.phi || 0;
        const tu = slot.tuer;
        const { fundament, fp } = AnazhRealm._slotGrundriss(slot);
        const wx = origin.x + slot.x;
        const wz = origin.z + slot.z;
        // DIE WASSER-WAND über dem ganzen Grundriss und dem Vorplatz der Tür (`_fundamentLand`, die EINE Probe mit der Wand
        // jedes Werks) und DIE BAU-WAND (kein Haus IN einem bestehenden Bau, keine Haustür an dessen Wand, `_bauFrei`): der
        // Slot fällt an seinem Ort geschlossen — der Plan ist das Dorf, die Welt rückt kein Haus.
        if (!this._fundamentLand(wx, wz, ry, fp, tu, fundament ? globalThis.__fachwerkCore.ORT_GESETZ.saumM : 0))
            return false;
        if (!this._bauFrei(wx, wz, ry, fp || { ex: 0.5, ez: 0.5, ox: 0, oz: 0 }, tu, slot.y)) return false;
        // DIE WANDLATERNEN DES HAUSES (K66-2): die Laternen des Plans mit seinem Slot (`so.plan`, `so.si`) hängen an seiner
        // Wand — ihre Wasser- und Bau-Wand fragt VOR dem Haus (das eigene Haus sperrt sie nie), sie stehen NACH ihm. Bis
        // K66-2 Nachbesserung hob der Dorf-Akt sie vor den Häusern: die Laterne sperrte ihr eigenes Haus (Auto-Dorf 13/16).
        const wand = [];
        if (so && so.plan && Array.isArray(so.plan.laternen))
            so.plan.laternen.forEach((l, k) => {
                if (!l || !l.wand || l.slot !== so.si) return;
                const ort = this._dorfLaterneOrt(l, origin);
                if (ort) wand.push([l, ort, k]);
            });
        const wy = slot.y + 0.5; // der Bauplan-Boden liegt 0,5 m unter dem Ursprung (`_archEntryWorldMatrix` baseY)
        // AUSLÖSCHUNGS-WELLE — `autonomous` reist durch (spawn_village vom Nexus →
        // die Häuser zählen in den Nexus-Cap, die V18.297-Hort-Lehre).
        const entry = this.spawnArchitecture(
            name,
            { x: wx, y: wy, z: wz },
            {
                seed: slot.seed >>> 0,
                rotationY: slot.phi || 0,
                silent: true,
                autonomous: !!(so && so.autonomous),
                fundament,
                // DORF-ERLEBNIS — die Tür-Zeile des Exports (Blocker-Tür-Lücke +
                // Flügel-Reichweite; alte Exporte ohne Feld → undefined, byte-alt).
                tuer: slot.tuer || undefined,
                // KAMIN-RAUCH (.105): Spitze haus-lokal (exportSettlement) — rauchQuelle; null ist das Nein des Exports
                // (kein Kamin: der Host baut das Haus nicht nach), ein Alt-Export ohne Feld bleibt undefined
                chimney: slot.chimney,
                // Das Slot-Rezept (exportSettlement ov) reist als Guss-Stempel: die Optik baut aus DERSELBEN Wahrheit
                // wie Blocker/ext (ov überstimmt den Kultur-Default). Alt-Exporte ohne ov: must-ignore.
                studioOv: slot.ov && typeof slot.ov === "object" ? slot.ov : undefined,
            }
        );
        if (entry) for (const [l, ort, k] of wand) this._dorfLaterneSetzen(so.plan, l, ort, k, so);
        return entry || false; // das gesetzte Haus (die Dorf-Mitte summiert, wo es steht)
    }
    // DER ORT EINER LATERNE DES PLANS (K10 × K11 × K66-2): die Studio-Gestalt (Bauplan `laterne_dorf` bzw. mit `wand` die
    // Wandlaterne `wandlaterne_dorf`, ihr Licht LICHT_GESETZ.wandlaterne) am Anker, hinter Wasser- und Bau-Wand — die
    // Wandlaterne hängt vor der Wand, die Bau-Wand prüft nur ihren Kopf (der Rund-Fußabdruck reichte in die eigene Wand).
    // Null, wo sie nicht stehen darf. Leser: `_spawnSettlementErlebnis` (der Mast) und `_spawnSettlementSlot` (die Wand).
    _dorfLaterneOrt(l, origin) {
        if (!l || !Number.isFinite(l.x) || !Number.isFinite(l.z)) return null;
        const typ = l.wand ? "wandlaterne_dorf" : "laterne_dorf";
        if (!this.state.blueprints || !this.state.blueprints[typ]) return null;
        const wx = origin.x + l.x;
        const wz = origin.z + l.z;
        if (!this._landAt(wx, wz, 0.2)) return null;
        const wy = this.getTerrainHeightAt(wx, wz);
        if (!Number.isFinite(wy)) return null;
        const frei = l.wand
            ? this._bauFrei(wx, wz, 0, { ex: 0.1, ez: 0.1, ox: 0, oz: 0 }, null, wy)
            : this._bauFreiRund(typ, wx, wz, wy);
        return frei ? { typ, x: wx, y: wy + 0.5, z: wz } : null; // die Bau-Wand: nie in einem Bau
    }
    // Die Laterne des Plans steht: Same je Siedlung und Nummer `k`, gedreht nach ihrem Plan (`th`).
    _dorfLaterneSetzen(plan, l, ort, k, so) {
        return this.spawnArchitecture(
            ort.typ,
            { x: ort.x, y: ort.y, z: ort.z },
            {
                seed: ((plan.seed >>> 0 || 1) + 97 + k * 7919) >>> 0,
                rotationY: Number.isFinite(l.th) ? -l.th : 0,
                silent: true,
                autonomous: !!(so && so.autonomous),
            }
        );
    }
    // ═══ DORF-ERLEBNIS: der EINE Hebe-Chokepoint für die Nicht-Haus-Schichten des Exports ═══
    // Wege/Feldwege/Platz → Wege-Pool (`_stlWegeBuild`, dieselbe Höhen-Quelle wie die Häuser); Brunnen
    // über `spawnArchitecture` (Bauplan `brunnen_dorf`). Aufrufer: `spawnSettlement` ·
    // `_autoSettlementSpawnCell` · Reload-Rebuild (so.nurWege — Brunnen sind persistierte Architektur).
    // Konsum: fences/felder/trees/staende/brunnen/laternen (die Studio-Gestalt `laterne_dorf`, ihr Licht das Datum ihres
    // Rezepts); unkonsumiert (export-stripped): mauer/fluss.
    _spawnSettlementErlebnis(plan, origin, so) {
        if (!plan || !origin) return;
        this._stlWegeBuild(plan, origin, so && so.key ? so.key : null);
        if (so && so.nurWege) return;
        // DIE LATERNEN (K10 × K11): jede Laterne des Plans steht als Studio-Gestalt (Bauplan `laterne_dorf`, fachwerk
        // AUSSTATTUNG `laterne`) — der Leib und das Licht EINER Quelle: das Verzeichnis „licht" stempelt den Eintrag aus dem
        // Datum seines Rezepts (`_lichtDatumDerGestalt`), der Licht-Takt liest ihn wie jede Feuerstelle. Keine Kappe: das
        // Gesetz des Plans setzt die Zahl (je Platz eine, je 25 m Weg eine); Wasser- und Bau-Wand wie der Brunnen. Die Laterne
        // des Plans mit `wand` (K66-2) ist die Wandlaterne: sie hängt an der Wand ihres Hauses und steht MIT ihm
        // (`_spawnSettlementSlot`), nie hier.
        if (Array.isArray(plan.laternen)) {
            let k = 0;
            for (const l of plan.laternen) {
                if (!l || l.wand) continue;
                const ort = this._dorfLaterneOrt(l, origin);
                if (ort) this._dorfLaterneSetzen(plan, l, ort, k++, so);
            }
        }
        if (!Array.isArray(plan.brunnen) || !this.state.blueprints || !this.state.blueprints.brunnen_dorf) return;
        let n = 0;
        for (const b of plan.brunnen) {
            if (n >= 5) break; // Kappe (Kernel-Brunnen + je 8 Häuser einer)
            if (!b || !Number.isFinite(b.x) || !Number.isFinite(b.z)) continue;
            const wx = origin.x + b.x;
            const wz = origin.z + b.z;
            if (!this._landAt(wx, wz, 0.2)) continue; // die Wasser-Wand (EINE Quelle)
            const wy = this.getTerrainHeightAt(wx, wz);
            if (!Number.isFinite(wy)) continue;
            if (!this._bauFreiRund("brunnen_dorf", wx, wz, wy)) continue; // die Bau-Wand: nie in einem Bau
            const entry = this.spawnArchitecture(
                "brunnen_dorf",
                { x: wx, y: wy + 0.5, z: wz },
                {
                    seed: ((plan.seed >>> 0 || 1) + n * 7919) >>> 0, // deterministisch je Siedlung+Platz
                    silent: true,
                    autonomous: !!(so && so.autonomous),
                }
            );
            if (entry) n++;
        }
        // SCHICHT-VOLLENDUNG (18.07.) — DIE MARKTSTÄNDE (staende-Schicht, nur
        // Markt-Plätze): das brunnen_dorf-Muster — builtIn-Bauplan, der EINE
        // Chokepoint, Kappe 3, Wasser-Wand, deterministisch je Siedlung+Platz.
        if (Array.isArray(plan.staende) && this.state.blueprints && this.state.blueprints.marktstand_dorf) {
            let m = 0;
            for (const st of plan.staende) {
                if (m >= 3) break;
                if (!st || !Number.isFinite(st.x) || !Number.isFinite(st.z)) continue;
                const wx = origin.x + st.x;
                const wz = origin.z + st.z;
                if (!this._landAt(wx, wz, 0.2)) continue;
                const wy = this.getTerrainHeightAt(wx, wz);
                if (!Number.isFinite(wy)) continue;
                if (!this._bauFreiRund("marktstand_dorf", wx, wz, wy)) continue; // die Bau-Wand: nie in einem Bau
                // Die Front (−z des Gesetzbuch-Stands) schaut zur Platz-Mitte — dieselbe Regel wie das Labor-Dorf.
                const pz = plan.platz;
                const entry = this.spawnArchitecture(
                    "marktstand_dorf",
                    { x: wx, y: wy + 0.5, z: wz },
                    {
                        seed: ((plan.seed >>> 0 || 1) + 53 + m * 7919) >>> 0,
                        rotationY: pz && Number.isFinite(pz.cx) ? Math.atan2(-(pz.cx - st.x), -(pz.cz - st.z)) : 0,
                        silent: true,
                        autonomous: !!(so && so.autonomous),
                    }
                );
                if (entry) m++;
            }
        }
        // Hof-Bäume der Siedlung: die Export-Plätze ({x,z,h}) heben als Studio-Bäume durch spawnArchitecture;
        // h skaliert auf die Export-Höhe (eiche fx.height 6.2). Kappe 12 (Architektur-LOD/Instanzen-Budget),
        // Wasser-Wand, deterministisch je Siedlung + Platz.
        if (!Array.isArray(plan.trees)) return;
        const baumArten = ["baum_eiche", "baum_birke"];
        let t = 0;
        for (const b of plan.trees) {
            if (t >= 12) break;
            if (!b || !Number.isFinite(b.x) || !Number.isFinite(b.z)) continue;
            const wx = origin.x + b.x;
            const wz = origin.z + b.z;
            if (!this._landAt(wx, wz, 0.2)) continue;
            const wy = this.getTerrainHeightAt(wx, wz);
            if (!Number.isFinite(wy)) continue;
            const seedT = ((plan.seed >>> 0 || 1) + 31 + t * 7919) >>> 0;
            const art = baumArten[seedT % baumArten.length];
            // der Hof-Baum geht durch DENSELBEN Grundriss-Chokepoint wie jeder Wurf der Natur (`_naturSetzen`)
            const entry = this._naturSetzen(
                art,
                { x: wx, y: wy, z: wz },
                {
                    seed: seedT,
                    scale: Math.max(0.35, Math.min(0.8, (Number.isFinite(b.h) ? b.h : 3.4) / 6.2)),
                    rotationY: ((seedT >>> 3) % 628) / 100,
                    silent: true,
                    autonomous: !!(so && so.autonomous),
                }
            );
            if (entry) t++;
        }
    }
    _spawnSettlementFromExport(plan, origin, so) {
        if (!plan || !Array.isArray(plan.slots) || !origin) return { placed: 0, skipped: 0, mitte: null };
        plan = this._ortPlanSetzen(plan, origin); // der Ort auf dem Gelände (K10): jeder Slot trägt seinen Boden
        const f = this._foundry;
        let placed = 0;
        let skipped = 0;
        let mx = 0;
        let mz = 0;
        const haeuser = [];
        for (let si = 0; si < plan.slots.length; si++) {
            // das gesetzte Haus (`_spawnSettlementSlot`): am Anker + seinem Slot, auf dem Boden des Plans (K10), mit seinen
            // Wandlaternen (K66-2: `plan` + `si`)
            const haus = this._spawnSettlementSlot(plan.slots[si], origin, f, {
                autonomous: !!(so && so.autonomous),
                plan,
                si,
            });
            if (haus) {
                placed++;
                haeuser.push(haus);
                mx += haus.position.x;
                mz += haus.position.z;
            } else skipped++;
        }
        // die Mitte der gesetzten Häuser — dorthin schaut, wer das Dorf verlangt hat (`_nachDorfOrientieren`)
        const mitte = placed ? { x: mx / placed, z: mz / placed } : null;
        return {
            placed,
            skipped,
            name: plan.name || null,
            groesse: plan.groesse || null,
            mitte,
            haeuser,
        };
    }

    // DAS DORF VOR DIR (Leben-Schau 07.10.: „dorf 7 18" umringte den Spieler — die Mitte 16 m bei cos +0,56, die drei
    // nächsten Häuser HINTER ihm, cos −1,00 / −0,48 / −0,12): der Anker kam aus der Klemme `_structureSpawnPos` mit dem
    // geschätzten Fußabdruck „haus_basis × 3", der Plan des Studios reichte weiter. Jetzt misst der Akt den Plan selbst
    // (Slot-Orte + obb-Reichweite) und legt ihn in den BLICKKEGEL: die Achse ist die EINE Vorwärts-Richtung (`_blickVorn`;
    // mit verlangtem Ort die Richtung zu ihm), die Mitte der Häuser liegt auf ihr, und der Plan rückt genau so weit vor, dass
    // jedes Haus mit seiner Reichweite `STRUCTURE_PLAYER_CLEAR_MARGIN` vor dem Spieler und im Bildwinkel der Welt-Kamera
    // steht — so nah wie möglich, nie um ihn. Ein verlangter Ort, dessen Häuser den Spieler nicht
    // berühren, bleibt, wie er ist. Gibt den Plan-Ursprung (der Bezug der Slot-Orte), die Mitte und den Radius zurück.
    // `blick` {gier, tanH} (das Programm eines Sprechers, „baue dorf hier"): der Sprecher steht am verlangten Ort und blickt
    // mit SEINER Gier durch SEINEN Bildwinkel — der Anker hängt dann an keinem Zustand des ausführenden Peers (Spieler,
    // Blick, Fenster), jeder baut dasselbe Dorf an derselben Stelle (Gegenprüfung Runde 1: ~60 m Versatz).
    _siedlungsAnker(plan, wunsch, blick) {
        const pm = this.state.playerMesh;
        const haeuser = [];
        let cx = 0;
        let cz = 0;
        for (const s of plan.slots || []) {
            if (!s || !Number.isFinite(s.x) || !Number.isFinite(s.z)) continue;
            const o = s.obb;
            haeuser.push([s.x, s.z, o && Number.isFinite(o.ex) && Number.isFinite(o.ez) ? Math.hypot(o.ex, o.ez) : 6]);
            cx += s.x;
            cz += s.z;
        }
        if (haeuser.length) {
            cx /= haeuser.length;
            cz /= haeuser.length;
        }
        let R = 0;
        for (const [x, z, reich] of haeuser) R = Math.max(R, Math.hypot(x - cx, z - cz) + reich);
        const ergebnis = (x, z, y) => {
            const h = this.getTerrainHeightAt(x, z);
            return { x, y: Number.isFinite(h) ? h : y, z, radius: R, mitte: { x: x + cx, z: z + cz } };
        };
        const sprecher = blick && wunsch && Number.isFinite(blick.gier);
        if (!pm && !sprecher) return ergebnis(wunsch.x, wunsch.z, wunsch.y);
        // der Blickende: der Sprecher am verlangten Ort (sein Programm trägt den Blick) oder der eigene Spieler
        const p = sprecher ? wunsch : pm.position;
        const M = AnazhRealm.STRUCTURE_PLAYER_CLEAR_MARGIN;
        let vx;
        let vz;
        if (wunsch && !sprecher) {
            const dx = wunsch.x + cx - p.x;
            const dz = wunsch.z + cz - p.z;
            const d = Math.hypot(dx, dz);
            if (d >= R + M) return ergebnis(wunsch.x, wunsch.z, wunsch.y); // der Ort berührt den Spieler nicht
            if (d > 1e-3) {
                vx = dx / d;
                vz = dz / d;
            }
        }
        if (vx === undefined) {
            const vorn = this._blickVorn(sprecher ? blick.gier : this.state.yaw, 0);
            const l = Math.hypot(vorn.x, vorn.z) || 1;
            vx = vorn.x / l;
            vz = vorn.z / l;
        }
        // Der Bildwinkel (horizontal, aus fov und Seitenverhältnis) — der des Sprechers, sonst der Welt-Kamera; vom
        // Blickenden aus gemessen (die 3rd-Kamera steht hinter ihm und sieht weiter).
        const cam = this.state.camera;
        const fov = cam && Number.isFinite(cam.fov) ? cam.fov : 75;
        const asp = cam && Number.isFinite(cam.aspect) && cam.aspect > 0 ? cam.aspect : 16 / 9;
        const tanH = sprecher && blick.tanH > 0 ? blick.tanH : Math.tan((fov * Math.PI) / 360) * asp;
        // je Haus: vorn f (längs der Achse) und quer q (um die Mitte); die Mitte rückt um t vor, bis f + t − Reichweite
        // ≥ max(M, |q| / tanH) für jedes Haus gilt.
        let t = 0;
        for (const [x, z, reich] of haeuser) {
            const f = (x - cx) * vx + (z - cz) * vz;
            const q = (x - cx) * vz - (z - cz) * vx;
            t = Math.max(t, Math.max(M, Math.abs(q) / tanH) - f + reich);
        }
        return ergebnis(p.x + vx * t - cx, p.z + vz * t - cz, p.y);
    }
    // spawnSettlement (unten) — der Siedlungs-Akt (Chat „dorf [seed] [n]", DSL `spawn_village` je Quelle, Gate): Samen
    // Γ5-treu aus dem Welt-Seed-Stream (Suffix ":stadt", nie Math.random), Export vom Worker, Platzierung
    // am ANKER, den der Plan selbst misst (`_siedlungsAnker`): vor dem Spieler, nie um ihn. Async — der Rückweg
    // meldet ins Chat-Log.

    // WER VERLANGT? Die DSL-Quelle eines Akts (`ctx.source`): der Spieler selbst — „human" (sein Chat, der Befehl „dorf"),
    // seine Werkzeuge (`AnazhRealm.SPIELER_QUELLEN`: die Fähigkeit per Taste „ability:<name>", das Wirken „capability:<key>",
    // der Verzehr „consume:<bauplan>") — und der Begleiter, der seinen Satz ausführt („llm:<name>"); Nexus, Welt-Regeln,
    // Resonanz und Mitspieler („remote-…") handeln für die Welt, nicht für ihn.
    _spielerVerlangt(quelle) {
        if (quelle === "human") return true;
        if (typeof quelle !== "string") return false;
        for (const vor of AnazhRealm.SPIELER_QUELLEN) if (quelle.startsWith(vor)) return true;
        return false;
    }

    // Nach einem Dorf-Spawn: hat der SPIELER das Dorf verlangt (`verlangt`, die Quelle des Akts), schaut er auf die Mitte
    // DIESES Dorfs (`res.mitte`, die gesetzten Häuser; ohne sie der Anker) — ein Nexus- oder Welt-Dorf lässt seinen Blick
    // stehen (OMEN 0710-6, Boot 4B: ein Nexus-Dorf drehte die Gier mitten im Lauf auf −2,745; und der Blick zielte auf den
    // Schwerpunkt ALLER Häuser der Welt, gate:settlement C7). Dazu die Bauten-Zeile und das nächste Haus sofort gemesht.
    _nachDorfOrientieren(res, verlangt) {
        try {
            const list = (this.state && this.state.architectures) || [];
            // die Häuser DIESES Dorfs: die eben gesetzten (`res.haeuser`, ihre Mitte `res.mitte`) — nie die Mitte aller Häuser
            // der Welt (ein Auto-Dorf 300 m weiter drehte den Blick vom neuen Dorf weg), nie ein Kreis um den Anker (er fing die
            // Häuser eines Nachbar-Dorfs mit); ohne gesetztes Haus kein Blick
            const houses = (res && res.haeuser) || [];
            const pm = this.state && this.state.playerMesh;
            const ziel = res && res.mitte;
            if (pm && ziel && this._spielerVerlangt(verlangt)) {
                const dx = ziel.x - pm.position.x;
                const dz = ziel.z - pm.position.z;
                if (Math.hypot(dx, dz) > 0.5) {
                    // der Blick zum Dorf (die Umkehrung der EINEN Vorwärts-Richtung)
                    this.state.yaw = this._blickGierZu(dx, dz);
                }
            }
            const nHaus = houses.length;
            let nZiegel = 0;
            let nearest = null;
            for (const e of houses) {
                if (e._ziegelSlot) nZiegel++;
                if (!pm) continue;
                const d = Math.hypot(e.position.x - pm.position.x, e.position.z - pm.position.z);
                if (!nearest || d < nearest.d) nearest = { d, e };
            }
            const zeile = nearest
                ? `Bauten n=${list.length} haus=${nHaus} ziegel=${nZiegel} nah=${nearest.e.type} @${Math.round(nearest.e.position.x)}/${Math.round(nearest.e.position.y)}/${Math.round(nearest.e.position.z)} d=${Math.round(nearest.d)}m`
                : `Bauten n=${list.length} haus=${nHaus} ziegel=${nZiegel} placed=${res && res.placed}`;
            // Die Zählung ist Entwickler-Telemetrie: sie geht ins Log, nie in den Spieler-Chat (Befund V-D8: „Bauten
            // n=330 haus=21 ziegel=10 nah=… d=10m" nach jeder Dorf-Gründung).
            this.log(zeile, "INFO");
            // Hand-Dichte: nächstes haus_ sofort meshen (nicht auf Cull-Budget warten)
            if (nearest && nearest.e && typeof this._rebuildArchitectureMesh === "function") {
                try {
                    this._rebuildArchitectureMesh(nearest.e);
                    if (nearest.e.mesh) nearest.e.mesh.visible = true;
                    this._archZiegelFern?.(nearest.e);
                } catch (_r) {
                    this._stoffBruch("das Dorf-Haus (Neubau nach der Orientierung)", _r);
                }
            }
        } catch (_e) {
            this._stoffBruch("die Dorf-Orientierung", _e);
        }
    }

    async spawnSettlement(opts) {
        const o = opts && typeof opts === "object" ? opts : {};
        let seed = Number.isFinite(o.seed) ? Number(o.seed) : NaN;
        if (!Number.isFinite(seed)) seed = this._bauSame("stadt");
        // ZENSUS-REST V18.488 — der Stamm KLEMMT nur, er defaultet nie: ohne
        // o.nH führt der Kern-Default (fachwerk DORF: DP.nH — die EINE
        // Wahrheit; der divergente Stamm-Zwilling 18 vs Kern 24 ist gefallen).
        let nH = Number.isFinite(o.nH) ? Math.max(4, Math.min(120, Number(o.nH))) : undefined;
        // Ein VERLANGTER Ort, den es nicht gibt, wird nie der Spieler-Ort (V-k5-Klasse): ohne `position` gründet der
        // Akt beim Spieler (Chat „dorf"), mit `position` nur dort — eine leere oder unendliche ist eine laute Absage.
        if ("position" in o && !(o.position && Number.isFinite(o.position.x) && Number.isFinite(o.position.z))) {
            this.log("Siedlung ohne Ort: der verlangte Ort fehlt — keine Gründung (nie still beim Spieler).", "ERROR");
            this._chatEcho?.("Hier kann kein Dorf entstehen: der Ort fehlt.");
            return null;
        }
        // FOUNDRY-WARM — Dorf braucht export-settlement. Kaltes Buch → LAUT blockieren
        // (kein WARN-Nichts). Autonome Worldgen-Zellen warten schon auf Channel-Live.
        // Die Größe aus dem Siedlungs-Gesetz (`nHAusGesetz`, der DSL-Akt `spawn_village`) wartet auf das Buch — auch der
        // autonome Akt (das Gesetz kommt im Buch, `_foundryIngestSiedlung`).
        if (!o.autonomous || o.nHAusGesetz) {
            const warm = await this._foundryAwaitBook(45000);
            if (!warm.ok) {
                const msg = `FOUNDRY KALT: Siedlung/Dorf-Spawn BLOCKIERT (${warm.reason}; ready=${warm.ready} recipes=${warm.recipes}) — kein stilles Nichts.`;
                this.log(msg, "ERROR");
                this._chatEcho?.(AnazhRealm.SIEDLUNG_KALT_SATZ);
                return null;
            }
        }
        if (o.nHAusGesetz && nH === undefined) {
            const SG = AnazhRealm._siedlungGesetz();
            if (!SG) {
                this.log("SIEDLUNGS-GESETZ FEHLT im Buch: Dorf-Spawn BLOCKIERT (keine Größe ohne Gesetz).", "ERROR");
                this._chatEcho?.(AnazhRealm.SIEDLUNG_KALT_SATZ);
                return null;
            }
            nH = SG.nHMin + ((seed >>> 24) % SG.nHSpan);
        }
        return this._foundryRequestSettlement({ seed, nH, epoche: o.epoche, budget: o.budget }).then(async (plan) => {
            if (!plan) {
                this.log(
                    "FOUNDRY KALT: Siedlung — export-settlement leer/aus — Spawn BLOCKIERT (kein stilles Nichts).",
                    "ERROR"
                );
                this._chatEcho?.(AnazhRealm.SIEDLUNG_KALT_SATZ);
                return null;
            }
            // der Ort aus dem Plan selbst: das Dorf liegt vor dem Spieler, nie um ihn (`_siedlungsAnker`)
            const anchor = this._siedlungsAnker(plan, o.position || null, o.blick || null);
            // DER ORT AUF DEM GELÄNDE (K10): der Plan v2 am Anker — Höhen, Wege, Laternen und der Erdbau, den die Welt trägt;
            // die Ort-Wahl rechnet in Takt-Scheiben (`_ortPlanWarten`, Lehre 14), der Akt wartet auf sie
            plan = await this._ortPlanWarten(plan, anchor);
            const res = this._spawnSettlementFromExport(plan, anchor, { autonomous: !!o.autonomous });
            // DORF-ERLEBNIS — Wege/Platz/Brunnen + das Rebuild-Gedächtnis („d:<seed>"
            // im selben settlementCells-Pfad: die Wege-Streifen überleben den Reload).
            const wmD = this.state.worldMeta || (this.state.worldMeta = {});
            if (!wmD.settlementCells || typeof wmD.settlementCells !== "object") wmD.settlementCells = {};
            // der Wege-Schlüssel trägt den ORT: zwei Siedlungen mit demselben Samen bauen je ihre Wege (vorher gewann die
            // erste, die Stadt `dorf 7 120` neben `dorf 7 18` stand ohne einen Weg — Leben-Prüfung S-W1)
            const dKey = "d:" + seed + "@" + Math.round(anchor.x) + "," + Math.round(anchor.z);
            if (!wmD.settlementCells[dKey]) wmD.settlementCells[dKey] = { seed, nH, x: anchor.x, z: anchor.z };
            this._spawnSettlementErlebnis(plan, anchor, { key: dKey, autonomous: !!o.autonomous });
            // Zwei Kanäle (V-D8): das Log trägt Same, Größe und Slots; wer das Dorf verlangt hat (`_spielerVerlangt`,
            // die Quelle des Akts), hört den Satz der Welt und schaut auf SEIN Dorf — Nexus, Welt-Regeln und Mitspieler handeln
            // für die Welt: kein Satz an den Empfänger, kein Blick.
            this.log(
                `Siedlung „${res.name || "?"}" (${res.groesse || "?"}, Seed ${seed}): ${res.placed} Häuser platziert, ${res.skipped} Slots übersprungen; Mitte ${Math.round(anchor.radius || 0)} m Radius.`,
                "INFO"
            );
            if (this._spielerVerlangt(o.verlangt))
                this._chatEcho?.(
                    res.placed > 0
                        ? `„${res.name || "Das Dorf"}" steht vor dir: ${res.placed} ${res.placed === 1 ? "Haus" : "Häuser"}.`
                        : "Hier findet kein Haus Grund — zu steil, zu nass oder verbaut. Versuch es an einem anderen Ort."
                );
            // Konsum: Blick (nur für den, der das Dorf verlangt hat) + Locator automatisch
            this._nachDorfOrientieren(res, o.verlangt);
            return res;
        });
    }
    // DER BAU-SAME (Γ5): zieht aus dem Welt-Seed-Stream (Suffix ":<art>", FNV-1a — das _worldRuleSeed-Muster); je Art zählt
    // ein Akt-Zähler hoch → jeder neue Bau derselben Welt ein ANDERER, aber deterministischer Same. Die Siedlung trägt die
    // Art "stadt". Leser: `spawnSettlement` (Chat `dorf`), jeder Chat-Satz mit Same (`baue … hier`, Insel, Fraktal, der
    // Studio-Hain — der Same reist im Programm), der Strom jedes Programms ohne eigenen Seed (`dslCtx`), der Standard-Same
    // der Wurzel `spawnArchitecture` (Bau einer Kreatur, Plattform, Portal), der Würfel der Werkstatt, die Komposition des
    // Nexus. Der Zähler ist Welt-Gedächtnis (`worldMeta.bauSame`, reist im Snapshot und zum Gast): als Sitzungs-Feld
    // begann er nach jedem Reload neu, und derselbe Satz am selben Ort stellte einen deckungsgleichen zweiten Hain.
    _bauSame(art) {
        const wm = this.state.worldMeta || (this.state.worldMeta = {});
        const z = wm.bauSame && typeof wm.bauSame === "object" ? wm.bauSame : (wm.bauSame = {});
        const n = (z[art] = (Number(z[art]) || 0) + 1);
        const s = `${wm.seed || "anazh-realm-seed"}:${art}:${n}`;
        let h = 2166136261 >>> 0;
        for (let i = 0; i < s.length; i++) {
            h ^= s.charCodeAt(i);
            h = Math.imul(h, 16777619) >>> 0;
        }
        return h >>> 0 || 1;
    }
    // Der Strom EINES Samens (LCG, [0, 1)): was ein Akt würfelt — Streuung, Drehung, Größe — ist eine Funktion seines Samens,
    // auf jedem Peer und nach jedem Reload dieselbe. Das EINE LCG der Welt: Leser `_streamRng` (der Strom eines Namens),
    // `dslCtx` (der Programm-Strom), `_dslSpawnStudioItems`, die Nexus-Komposition und der Schwebe-Takt eines UFOs.
    _samenStrom(same) {
        let s = Number(same) >>> 0 || 1;
        return () => {
            s = (s * 1664525 + 1013904223) >>> 0;
            return s / 4294967296;
        };
    }
    // DER SAME EINES WERKS (Gegenprüfung 08.10.): EIN Same je Bauplan — der Wurf der Werkstatt (`_grownSeed` · `_rockSeedBase`
    // · `_crystalSeedBase`), sonst sein Name (ein Studio-Rezept ohne Bauplan: seine id) —, gehasht in die Gestalt-Wahl
    // (`_foundryVariantFor`). Leser: die Werkstatt-Vorschau (Bauplan und Rezept), die Hand, das Phantom UND das Setzen
    // (`confirmBuild`): was die Vorschau zeigt, zeigt das Phantom, und genau das steht. Befund: vier Kopien des Hashes, und
    // das Setzen würfelte den Samen aus Math.random — die Eiche des Phantoms (Gestalt 2) stand als Gestalt 1.
    // JEDES SETZEN EIN NEUES WERK (Integration V18.536, Auflage 1 der zweiten Werkstatt-Gegenprüfung): trägt der Bauplan
    // keinen Wurf der Werkstatt, zieht der Bau-Modus (`bm`) je Setzen den nächsten Samen des Welt-Stroms seiner Art
    // (`_bauSame("bau:" + name)`, derselbe Strom wie der Standard-Same der Wurzel) — Phantom, Setzen und Nachricht an den
    // Mitspieler lesen ihn, nach dem Setzen zieht das nächste Phantom neu. Befund: jedes Setzen derselben Eiche stand als
    // dieselbe Gestalt mit derselben Tönung (vorher wählte Math.random zwischen zwei Gestalten und streute ±8 %). Ohne
    // `bm` (Vorschau, Hand) zeigt der Name das Werk der Art; ein Wurf der Werkstatt steht genau so, wie gewürfelt.
    _werkSame(bp, name, bm) {
        const wurf = bp ? bp._grownSeed || bp._rockSeedBase || bp._crystalSeedBase : null;
        const art = name != null ? name : bp && bp.name;
        if (wurf == null && bm) {
            if (!bm.setzSame || bm.setzSame.art !== art) bm.setzSame = { art, same: this._bauSame("bau:" + art) };
            return bm.setzSame.same;
        }
        const s = String(wurf != null ? wurf : art);
        let h = 0;
        for (let i = 0; i < s.length; i++) h = (Math.imul(h, 131) + s.charCodeAt(i)) >>> 0;
        return h;
    }
    // ═══ WORLDGEN-AUTO-DÖRFER (der Worldgen-Konsument des "settlement"-Kanals) ═══
    // Γ5: je Welt-Zelle (SIEDLUNG.cellM) entscheidet FNV-1a(worldSeed:dorf:cx,cz) Existenz (1 von
    // `rarity`), Seed, Größe, Anker; Wände: flach · über Wasser · spawnClearM (sonst FindSite).
    // Export async über den Foundry-Worker, Häuser budgetiert (nur `!_frameOverBudget`) über
    // `_spawnSettlementSlot`; `worldMeta.settlementCells` markiert bei Export-ANKUNFT (nie Doppel-Dorf).
    // Headless ruht der Zug (Gate-Hook `__anazhAutoSettlement`). Unten: Zelle → {seed, nH, Anker} | null.
    _autoSettlementCellInfo(cx, cz) {
        // ZENSUS 17.07. — Existenz/Raster/Größe sind fachwerk-Gesetz (SIEDLUNG); kaltes Buch → keine Zelle.
        const A = AnazhRealm._siedlungGesetz();
        if (!A) return null;
        const wm = this.state.worldMeta || {};
        const s = `${wm.seed || "anazh-realm-seed"}:dorf:${cx},${cz}`;
        let h = 2166136261 >>> 0;
        for (let i = 0; i < s.length; i++) {
            h ^= s.charCodeAt(i);
            h = Math.imul(h, 16777619) >>> 0;
        }
        if (h % A.rarity !== 0) return null; // Dörfer sind besonders (selten)
        // getrennte Seed-Bit-Bänder (die V18.181-Disziplin): Anker-Jitter (>>>8/>>>16,
        // ±¼ Zelle — kein Raster-Look) + Dorf-Größe (>>>24).
        const jx = (((h >>> 8) & 0xff) / 255 - 0.5) * A.cellM * 0.5;
        const jz = (((h >>> 16) & 0xff) / 255 - 0.5) * A.cellM * 0.5;
        return {
            key: cx + "," + cz,
            seed: h >>> 0 || 1,
            nH: A.nHMin + ((h >>> 24) % A.nHSpan),
            x: (cx + 0.5) * A.cellM + jx,
            z: (cz + 0.5) * A.cellM + jz,
        };
    }
    // Site-Wände am Anker (die Slot-Wände prüft `_spawnSettlementSlot` je Haus zusätzlich). `noSpawnClear`
    // öffnet NUR dem Start-Dorf die Spawn-Klar-Wand; Wasser/Steil bleiben für jede Site dieselbe Wand.
    // DER GENESIS-ORT (EINE Quelle): die Mitte der Start-Plattform — dort kommt der Spieler an, um sie stehen die
    // Kern-Portale (Schöpfer V18.486: „die kernportale um die genesis-plattform anordnen"), um sie bleibt die
    // Warmup-Welt dorffrei und wächst das Start-Dorf. Ohne Plattform der Welt-Ursprung. Bis 06.10. lasen diese vier
    // den Ursprung, während die Plattform dort stand, wo `_findOpenSpawnSpot` Platz fand (36 m daneben, seit der
    // Kronen-Wand V-D1 dort, wo kein Baum durch die Scheibe wächst).
    _genesisMitte() {
        const p = this._genesisPlattform();
        return p ? { x: p.position.x, z: p.position.z } : { x: 0, z: 0 };
    }
    _genesisPlattform() {
        const p = (this.state.architectures || []).find((a) => a && a.type === "start_plattform");
        return p && p.position ? p : null;
    }

    _autoSettlementSiteOk(x, z, noSpawnClear) {
        // Der Dorf-Ort ist ein Wurf des Feldes (Auto-Dorf, Start-Dorf): wo die Wildnis nicht trägt, steht keins.
        if (!this._wildnisTraegt(x, z)) return false;
        const A = AnazhRealm.AUTO_SETTLEMENT; // Wirt-Streaming (spawnClearM)
        if (!noSpawnClear) {
            const g = this._genesisMitte();
            if (Math.hypot(x - g.x, z - g.z) < A.spawnClearM) return false; // die Warmup-Welt bleibt dorffrei
        }
        if (!this._landAt(x, z, 0.2)) return false; // die Wasser-Wand (EINE Quelle)
        const slope = this._slopeAt ? this._slopeAt(x, z) : 0;
        // ZENSUS 17.07. — die Steil-Wand ist fachwerk-Gesetz (SIEDLUNG.slopeMax).
        const SG = AnazhRealm._siedlungGesetz();
        return !!SG && !(Number.isFinite(slope) && slope > SG.slopeMax); // flach genug
    }
    // Site-Suche: der flache, trockene Fleck NAHE des Ankers statt Tod an einem Punkt (sonst fällt die
    // Mehrheit der Zellen an der Steil-Wand). Γ5 aus dem Zell-Seed: Anker zuerst, dann je Probe-Ring
    // 4 Proben (Phase aus Seed, Ring 2 um 45° verdreht) durch `_autoSettlementSiteOk`. null = kein Dorf.
    _autoSettlementFindSite(info) {
        const A = AnazhRealm.AUTO_SETTLEMENT; // Wirt-Streaming (siteProbeR)
        if (this._autoSettlementSiteOk(info.x, info.z)) return { x: info.x, z: info.z };
        const phase = (((info.seed >>> 4) & 0xff) / 255) * 2 * Math.PI;
        for (let ri = 0; ri < A.siteProbeR.length; ri++) {
            // ZENSUS 17.07. — das Zell-Raster ist fachwerk-Gesetz (SIEDLUNG.cellM).
            const SG = AnazhRealm._siedlungGesetz();
            if (!SG) return null;
            const rad = A.siteProbeR[ri] * SG.cellM;
            for (let i = 0; i < 4; i++) {
                const a = phase + (i / 4) * 2 * Math.PI + ri * (Math.PI / 4);
                const px = info.x + Math.cos(a) * rad;
                const pz = info.z + Math.sin(a) * rad;
                if (this._autoSettlementSiteOk(px, pz)) return { x: px, z: pz };
            }
        }
        return null;
    }
    // `_autoSettlementStartInfo` (unten): EINMAL je Welt ein Start-Dorf ~110–170 m vom Spawn (Γ5
    // ":startdorf"), Radien × 8 Winkel durch `_autoSettlementSiteOk` mit offener Spawn-Klar-Wand.
    // GENESIS-PORTAL-RING: EINMAL je Welt stehen alle Built-in-Portale (WORLD_REGISTRY) im Kreis um den
    // Genesis-Ort (`_genesisMitte`), deterministisch. Doppelt idempotent: worldMeta-Stempel UND Existenz-Probe (ein
    // restauriertes Ring-Portal setzt den Stempel nach). Terrain/Bauplan nicht bereit → nächster Tick.
    _genesisPortalRing(playerPos) {
        const st = this.state;
        const wm = st.worldMeta;
        if (!wm || wm.genesisPortalRing || this._genesisRingFertig) return;
        const M = this._genesisMitte();
        if ((playerPos.x - M.x) ** 2 + (playerPos.z - M.z) ** 2 > 60 * 60) return; // nur am Genesis-Ort
        const bps = st.blueprints || {};
        const namen = Object.keys(bps).filter((n) => {
            const b = bps[n];
            return b && b.builtIn && b.role === "portal" && b.portalMeta && b.portalMeta.world;
        });
        if (!namen.length) return;
        // Existenz-Probe: trägt die Welt schon ein Ring-Portal nahe des Genesis-Orts
        // (Restore eines Saves ohne Stempel), gilt der Ring als gebaut.
        for (const e of st.architectures || []) {
            if (!e || !e.position) continue;
            const d2 = (e.position.x - M.x) ** 2 + (e.position.z - M.z) ** 2;
            if (d2 <= 20 * 20 && namen.includes(e.type)) {
                this._genesisRingFertig = true;
                wm.genesisPortalRing = true;
                return;
            }
        }
        const R = AnazhRealm.GENESIS_PLATZ.ringR; // der Kreis der Tore auf dem Genesis-Platz (seine Lichtung trägt ihn)
        let gebaut = 0;
        for (let i = 0; i < namen.length; i++) {
            const a = (i / namen.length) * 2 * Math.PI;
            const x = M.x + Math.cos(a) * R;
            const z = M.z + Math.sin(a) * R;
            const y = this.getTerrainHeightAt(x, z);
            if (!Number.isFinite(y)) return; // Terrain reift noch — nächster Tick
            const entry = this.spawnArchitecture(namen[i], { x, y, z }, { seed: ((i + 1) * 7919) >>> 0 });
            if (entry) gebaut++;
        }
        if (gebaut > 0) {
            wm.genesisPortalRing = true;
            this._genesisRingFertig = true;
            this.log(`Genesis-Ring: ${gebaut} Kern-Portale im Kreis um die Plattform.`, "INFO");
        }
    }
    // DER WUNSCH-ORT DER VORSCHAU vor einem Tor des Genesis-Rings: ~8 m radial nach außen, vom Genesis-Ort aus gesehen (der
    // Ring steht um ihn); `blick` ist die Richtung vom Ring hinaus (sin, cos). Wo ein Wagen dann steht, entscheidet das
    // Platz-Gesetz (`_fahrPlatzSuche`). Leser: `_ensurePortalPreview` und die Fahr-Linse (gate:fahr-leben P: an jedem Tor).
    // → { x, y, z, blick } oder null (kein Boden).
    _portalVorschauOrt(portal) {
        const M = this._genesisMitte();
        const px = portal.position.x || 0;
        const pz = portal.position.z || 0;
        const len = Math.hypot(px - M.x, pz - M.z) || 1;
        const ox = px + ((px - M.x) / len) * 8;
        const oz = pz + ((pz - M.z) / len) * 8;
        const y = this.getTerrainHeightAt(ox, oz);
        if (!Number.isFinite(y)) return null;
        return { x: ox, y: y + 0.5, z: oz, blick: Math.atan2(px - M.x, pz - M.z) };
    }

    // PORTAL-PREVIEW: EIN Preview je Studio-Tor (~8 m radial vor welt_<worldKey>), sichtbar vorm iframe.
    // Doppelt idempotent (worldMeta.portalPreview<Key> + Existenz-Probe auf id); Foundry kalt → Skip + EIN
    // Await-Book je worldKey, nächster Tick retry. Typen: fachwerk→haus_alemannisch, garage→fahrzeug_gt,
    // schmiede→esse, portale→tor_drachentor (spawnArchitecture silent/autonomous).
    _ensurePortalPreview(worldKey, type, id) {
        if (typeof worldKey !== "string" || !worldKey || typeof type !== "string" || !type) return;
        if (typeof id !== "string" || !id) return;
        const st = this.state;
        const wm = st.worldMeta;
        const metaKey = "portalPreview" + worldKey.charAt(0).toUpperCase() + worldKey.slice(1);
        const fertig = (this._portalPreviewFertig = this._portalPreviewFertig || Object.create(null));
        const awaiting = (this._portalPreviewAwaiting = this._portalPreviewAwaiting || Object.create(null));
        if (!wm || wm[metaKey] || fertig[worldKey]) return;
        const arches = st.architectures || [];
        for (const e of arches) {
            if (e && e.id === id) {
                fertig[worldKey] = true;
                wm[metaKey] = true;
                return;
            }
        }
        const portalType = "welt_" + worldKey;
        let portal = null;
        for (const e of arches) {
            if (e && e.type === portalType && e.position) {
                portal = e;
                break;
            }
        }
        if (!portal) return;
        const f = this._foundry;
        const bpOk = !!(st.blueprints && st.blueprints[type]);
        if (!f || !f.ready || !f.recipes || !bpOk) {
            if (awaiting[worldKey]) return;
            awaiting[worldKey] = true;
            Promise.resolve(this._foundryAwaitBook(8000))
                .then((warm) => {
                    awaiting[worldKey] = false;
                    if (warm && warm.ok) this._ensurePortalPreview(worldKey, type, id);
                })
                .catch((e) => {
                    awaiting[worldKey] = false;
                    this._stoffBruch("die Portal-Vorschau " + worldKey, e);
                });
            return;
        }
        const ort = this._portalVorschauOrt(portal);
        if (!ort) return;
        // Deterministische Seeds: fachwerk 49177 · garage 49178 · schmiede 49179 · portale 49180.
        const seed =
            worldKey === "fachwerk"
                ? 49177
                : worldKey === "garage"
                  ? 49178
                  : worldKey === "schmiede"
                    ? 49179
                    : worldKey === "portale"
                      ? 49180
                      : 49170;
        const opts = { silent: true, autonomous: true, id, seed };
        // Der Vorschau-Wagen schaut vom Ring hinaus in die Welt (Studio-Wagen: Template-Gier = Fahrt − π/2); wo er steht,
        // entscheidet das Platz-Gesetz (`_fahrPlatzSuche` in spawnArchitecture: der nächste fahrbare Grund mit Bahn).
        if (worldKey === "garage") opts.rotationY = ort.blick - Math.PI / 2;
        // Nur fachwerk/haus_*: die Vorschau trägt ihre Prägung (studioOv: Stil, Verband, Geschosse, Maße, Dach) — der
        // Bau des Gesetzbuchs liest sie, fremde Schlüssel ignoriert er. Der Stempel gewinnt: ein Eintrag ohne studioOv
        // bleibt; ov nur bei Neu-Spawn.
        // Die Maße (Breite · Tiefe · Dachneigung · Geschosse) sind das fränkische Preset des Gesetzbuchs (fachwerk PRESETS
        // fraenkisch.s), kein Zahlen-Zwilling (K2); Stil, Verband, Gaube und Flügel wählt die Vorschau.
        if (worldKey === "fachwerk" && type.startsWith("haus_")) {
            const PRE =
                AnazhRealm.Gesetz("fachwerk:PRESETS.fraenkisch.s") || AnazhRealm._kernPflichtBruch("fachwerk:PRESETS");
            opts.studioOv = Object.freeze(
                Object.assign({}, PRE, { stil: "alt", brace: "andreas", gaube: true, fluegel: true, fluegelSide: 1 })
            );
        }
        // DER PLATZ DES VORSCHAU-WAGENS IM TAKT: die Suche des Platz-Gesetzes (`_fahrPlatzWege`) läuft vor dem Bau, je Takt
        // höchstens FAHR_PLATZ_JE_TAKT Orte (die Ring-Suche kostete am Garage-Tor bis 0,66 s in EINEM Takt); der Wagen entsteht
        // dort, wo sie endet — die Wurzel prüft den Ort dann in einem Schritt. Kein Platz: dieses Tor bleibt ohne Vorschau.
        if (this._fahrzeugGesetzFor({ type })) {
            const wege = (this._vorschauPlatzWege = this._vorschauPlatzWege || Object.create(null));
            let job = wege[worldKey];
            if (!job) {
                const probe = { type, position: { x: ort.x, y: ort.y, z: ort.z }, rotationY: opts.rotationY, scale: 1 };
                job = wege[worldKey] = { probe, weg: this._fahrPlatzWege(probe), ende: null };
            }
            for (let i = 0; i < AnazhRealm.FAHR_PLATZ_JE_TAKT && job.ende === null; i++) {
                const r = job.weg.next();
                if (r.done) job.ende = r.value;
            }
            if (job.ende === null) return;
            delete wege[worldKey];
            if (!job.ende) {
                fertig[worldKey] = true;
                return;
            }
            ort.x = job.probe.position.x;
            ort.z = job.probe.position.z;
            opts.rotationY = job.probe.rotationY;
        }
        // die Absage der Wurzel beim Namen: findet das Platz-Gesetz keinen fahrbaren Grund, steht dieses Tor ohne Vorschau —
        // einmal (die Suche liefe sonst in jedem Takt neu)
        let absage = null;
        opts.absage = (g) => (absage = g);
        const entry = this.spawnArchitecture(type, { x: ort.x, y: ort.y, z: ort.z }, opts);
        if (entry) {
            wm[metaKey] = true;
            fertig[worldKey] = true;
            this.log(`Portal-Preview ${worldKey}: ${type} ~8 m vor ${portalType}.`, "INFO");
        } else if (absage === "platz") fertig[worldKey] = true;
    }

    // Approach-Prefetch: nähert sich der Spieler einem Genesis-Tor (~22 m), Previews über
    // `_ensurePortalPreview` schärfen und bei kalter Foundry EIN Await-Book feuern.
    // koerperstudio/terrain/klang/tetrapoda haben keinen Preview-Typ.
    _portalApproachPrefetch(playerPos) {
        if (!playerPos) return;
        const rows = [
            ["fachwerk", "haus_alemannisch", "portal-preview-fachwerk"],
            ["garage", "fahrzeug_gt", "portal-preview-garage"],
            ["schmiede", "esse", "portal-preview-schmiede"],
            ["portale", "tor_drachentor", "portal-preview-portale"],
        ];
        const arches = (this.state && this.state.architectures) || [];
        const R2 = 22 * 22;
        let nearAny = false;
        for (let i = 0; i < rows.length; i++) {
            const worldKey = rows[i][0];
            const type = rows[i][1];
            const id = rows[i][2];
            const portalType = "welt_" + worldKey;
            let portal = null;
            for (let j = 0; j < arches.length; j++) {
                const e = arches[j];
                if (e && e.type === portalType && e.position) {
                    portal = e;
                    break;
                }
            }
            if (!portal) continue;
            const dx = (portal.position.x || 0) - playerPos.x;
            const dz = (portal.position.z || 0) - playerPos.z;
            if (dx * dx + dz * dz > R2) continue;
            nearAny = true;
            this._ensurePortalPreview(worldKey, type, id);
        }
        if (!nearAny) return;
        const f = this._foundry;
        if (f && f.ready) return;
        if (this._portalApproachAwaiting) return;
        this._portalApproachAwaiting = true;
        Promise.resolve(this._foundryAwaitBook(8000))
            .then(() => {
                this._portalApproachAwaiting = false;
            })
            .catch((e) => {
                this._portalApproachAwaiting = false;
                this._stoffBruch("das Studio-Buch vor dem Portal (Foundry-Boot)", e);
            });
    }

    _autoSettlementStartInfo() {
        const A = AnazhRealm.AUTO_SETTLEMENT; // Wirt-Streaming (startRadiusM)
        // ZENSUS 17.07. — die Dorf-Größe ist fachwerk-Gesetz (SIEDLUNG.nHMin/nHSpan); kaltes Buch → kein Start-Dorf.
        const S = AnazhRealm._siedlungGesetz();
        if (!S) return null;
        const wm = this.state.worldMeta || {};
        const s = `${wm.seed || "anazh-realm-seed"}:startdorf`;
        let h = 2166136261 >>> 0;
        for (let i = 0; i < s.length; i++) {
            h ^= s.charCodeAt(i);
            h = Math.imul(h, 16777619) >>> 0;
        }
        const phase = (((h >>> 8) & 0xff) / 255) * 2 * Math.PI;
        const M = this._genesisMitte(); // um den Genesis-Ort, wo der Spieler ankommt
        for (let ri = 0; ri < A.startRadiusM.length; ri++) {
            for (let i = 0; i < 8; i++) {
                const a = phase + (i / 8) * 2 * Math.PI;
                const x = M.x + Math.cos(a) * A.startRadiusM[ri];
                const z = M.z + Math.sin(a) * A.startRadiusM[ri];
                if (!this._autoSettlementSiteOk(x, z, true)) continue;
                return { key: "start", seed: h >>> 0 || 1, nH: S.nHMin + ((h >>> 24) % S.nHSpan), x, z };
            }
        }
        return null;
    }
    // Auto-Dörfer laufen NUR, wenn das LIVE-Buch ein Rezept trägt, dessen Place-Auflösung über
    // `_placeDispatch` auf "settlement" fällt. Gecacht auf Buch-Identität (wie _forestExtraSpecies).
    _autoSettlementChannelLive() {
        const f = this._foundry;
        const book = f && f.ready && f.recipes;
        if (!book) return false;
        if (this._autoStlChannelBook === book && this._autoStlChannelCache != null) return this._autoStlChannelCache;
        let live = false;
        for (const id in book) {
            if (this._placeDispatch(this._placePolicyFor(book[id]), { id }) === "settlement") {
                live = true;
                break;
            }
        }
        this._autoStlChannelCache = live;
        this._autoStlChannelBook = book;
        return live;
    }
    // Epochen-Legende: jede dritte Siedlung trägt seed-deterministisch eine Epoche der fachwerk-EPOCHEN-
    // Tafel (DP.epoche fixiert Region + Zeit), die übrigen würfelt der Same (Region-Historie). Reine
    // Funktion des Zell-Seeds → der Wege-Rebuild trifft dieselbe Epoche. Fail-closed bei kaltem Kern.
    _siedlungEpoche(seed) {
        const E = AnazhRealm.Gesetz("fachwerk:EPOCHEN", null);
        const namen = E && typeof E === "object" ? Object.keys(E) : [];
        if (!namen.length) return AnazhRealm._kernPflichtBruch("fachwerk:EPOCHEN");
        let h = (Math.imul(seed >>> 0 || 1, 2654435761) + 0x9e3779b9) >>> 0;
        h = (h ^ (h >>> 16)) >>> 0;
        if (h % 3 !== 0) return undefined; // 2 von 3 bleiben Region-Historie (die legitime Weiche)
        return namen[(h >>> 4) % namen.length];
    }
    // Eine Dorf-Zelle heben (Gate/Test und Tick teilen den Pfad): reserviert bei Export-ANKUNFT
    // (`worldMeta.settlementCells[key]`), Slots in die budgetierte Queue. Kein Export → nichts markiert.
    _autoSettlementSpawnCell(cx, cz, info) {
        const st = this.state;
        const i2 = info || this._autoSettlementCellInfo(cx, cz);
        if (!i2) return Promise.resolve(null);
        const wm = st.worldMeta || (st.worldMeta = {});
        if (!wm.settlementCells || typeof wm.settlementCells !== "object") wm.settlementCells = {};
        const key = i2.key || cx + "," + cz; // Zell-Infos tragen cx,cz — das Start-Dorf trägt "start"
        if (wm.settlementCells[key] || this._autoSettlementPendingKey) return Promise.resolve(null);
        this._autoSettlementPendingKey = key;
        return this._foundryRequestSettlement({
            seed: i2.seed,
            nH: i2.nH,
            epoche: this._siedlungEpoche(i2.seed), // ZENSUS-REST V18.488 — die Epochen-Legende
        }).then((plan) => {
            this._autoSettlementPendingKey = null;
            if (!plan || !Array.isArray(plan.slots)) return null; // fail-closed (Foundry kalt)
            // Der Anker misst den Plan selbst (`_siedlungsAnker`, die EINE Regel jedes Dorfs): nie um den Spieler —
            // relevant nur im Restore-nahe-einer-unbesiedelten-Zelle-Fall, fern bleibt die Zelle, wie sie ist. Die
            // Schätzung `_structureSpawnPos("haus_basis")` vor dem Plan ist gefallen (Gegenprüfung Runde 1).
            const anchor = this._siedlungsAnker(plan, { x: i2.x, y: 0, z: i2.z });
            // DER ORT AUF DEM GELÄNDE (K10): der Plan v2 am Ort, den die Ort-Wahl um den Anker findet (der Anker folgt ihm),
            // sein Erdbau liegt, bevor das erste Haus steht; die Wahl rechnet in Takt-Scheiben (`_ortPlanWarten`, Lehre 14) —
            // so lange gilt der Export als unterwegs (der Zug beginnt keine zweite Zelle, die Messung schwingt nicht ein)
            this._autoSettlementPendingKey = key;
            return this._ortPlanWarten(plan, anchor).then((v2) => {
                this._autoSettlementPendingKey = null;
                // Die Reservierung trägt das Rebuild-Gedächtnis {seed,nH,x,z}: Häuser/Brunnen persistieren als
                // architectures, die Wege (kein Save-Byte) baut `_tickAutoSettlement` nach Reload am Anker neu.
                // Alle Leser fragen nur Existenz (truthy).
                wm.settlementCells[key] = { seed: i2.seed, nH: i2.nH, x: anchor.x, z: anchor.z };
                this._autoSettlementQueue = { plan: v2, origin: { x: anchor.x, z: anchor.z }, idx: 0, cellKey: key };
                // Wege/Platz/Brunnen sofort bei ANKUNFT (klein + einmalig; die Häuser
                // materialisieren budgetiert über die Ticks).
                this._spawnSettlementErlebnis(v2, { x: anchor.x, z: anchor.z }, { key });
                if (typeof this._scheduleEditSave === "function") this._scheduleEditSave();
                return v2;
            });
        });
    }
    // Der Worldgen-Konsument des "settlement"-Kanals — gerufen aus dem Idle-Pass
    // `_tickScatterStreaming` (feuert nur, wenn das Chunk-Streaming nichts baut).
    // DER GENESIS-ORT VOR JEDEM BUDGET (Existenz vor Framerate, Lehre 13): der Ring der Kern-Portale (einmalig je Welt,
    // Schöpfer 17.07.) und die Portal-Vorschauen (GT, Haus, Esse, Tor; nur bei Tor-Nähe, frühes Await-Book) stehen in
    // ihrem eigenen Takt (1×/s), nie hinter den Dorf-Akten. Bis 06.10. lagen sie im Siedlungs-Takt hinter
    // `_frameOverBudget` (und der Siedlungs-Takt im Deko-Job, der bei leerem Budget wartet): auf der echten GPU (Radeon
    // 890M, frische Welt) war das Budget in 160 von 160 Proben über 40 s überschritten — kein Ring, kein GT am Ring, der
    // v1-Schritt 6 ohne Wagen. Headless ruht er wie der Siedlungs-Takt (der Hook führt, Gate-Treue).
    _tickGenesisOrt(currentTime) {
        const st = this.state;
        const pm = st.playerMesh;
        if (!pm || !this._dorfTaktLebt()) return;
        if (this._genesisOrtT && currentTime - this._genesisOrtT < 1000) return;
        this._genesisOrtT = currentTime; // Instanz-Feld (die _editSaveTimer-Klasse: nicht serialisiert)
        this._genesisPortalRing(pm.position);
        this._portalApproachPrefetch(pm.position);
    }

    // DER DORF-TAKT LEBT (Gate-Treue): headless ruht der Auto-Zug, der Hook `__anazhAutoSettlement` führt — EIN Urteil für
    // den Siedlungs-Takt, den Genesis-Ort und das erste Weltbild (Term „dorf", `_weltbildLuecken`): ein Dorf, das kein Takt
    // baut, hält kein Bild.
    _dorfTaktLebt() {
        const hook = typeof window !== "undefined" ? window.__anazhAutoSettlement : undefined;
        if (hook === false) return false;
        return hook === true || !(this.state.renderer && this.state.renderer._isHeadlessNull);
    }

    // DAS START-DORF IST FÄLLIG (EIN Urteil für den Takt und das erste Weltbild, K60-4): einmalig je Welt, solange es weder
    // steht (`settlementCells.start`) noch hoffnungslos ist, und nur nahe des Genesis-Orts (kein Fern-Spawn hinter dem Rücken).
    _startDorfFaellig(playerPos) {
        const wm = this.state.worldMeta || {};
        const cells = wm.settlementCells && typeof wm.settlementCells === "object" ? wm.settlementCells : null;
        if ((cells && cells.start) || this._autoSettlementStartHopeless) return false;
        const gM = this._genesisMitte();
        const n = AnazhRealm.AUTO_SETTLEMENT.nearM;
        return (playerPos.x - gM.x) ** 2 + (playerPos.z - gM.z) ** 2 <= n * n;
    }

    _tickAutoSettlement(playerPos) {
        const st = this.state;
        if (!playerPos || !this._dorfTaktLebt()) return;
        const A = AnazhRealm.AUTO_SETTLEMENT; // Wirt-Streaming (perTick/nearM)
        // (a) BUDGETIERTE MATERIALISIERUNG zuerst: ein angekommener Export baut seine
        // Häuser über Ticks verteilt — erst fertig wachsen, dann die nächste Zelle.
        // EXISTENZ VOR FRAMERATE (Lehre 13, Leben-Prüfung N-D9): das Frame-Budget drosselt das TEMPO des Dorf-Akts, nie
        // seine Existenz — über dem Budget trägt jeder A.drosselTakte-te Takt EINEN Slot bzw. EINEN Akt. Vorher kehrte der
        // Takt über dem Budget um (60 von 60 Proben): auf jedem Gerät über dem Sollwert entstand das Start-Dorf nie.
        const ueber = !!st._frameOverBudget;
        if (ueber) {
            this._dorfDrossel = (this._dorfDrossel || 0) + 1;
            if (this._dorfDrossel % A.drosselTakte !== 0) return;
        }
        const q = this._autoSettlementQueue;
        if (q && q.plan) {
            const f = this._foundry;
            let n = 0;
            // unter dem Ladeschirm hebt der Zug Slots bis zur Frist des Lade-Frames (`_kappeOffen`, K60-2): die Häuser der
            // Ankunft gehören ins erste Weltbild (Term „dorf")
            while (q.idx < q.plan.slots.length && this._kappeOffen(n, ueber ? 1 : A.perTick)) {
                const si = q.idx++;
                this._spawnSettlementSlot(q.plan.slots[si], q.origin, f, { plan: q.plan, si }); // mit seinen Wandlaternen (K66-2)
                n++;
            }
            if (q.idx >= q.plan.slots.length) {
                this._autoSettlementQueue = null;
                this.log(
                    `Siedlung „${q.plan.name || "?"}" gewachsen (Zelle ${q.cellKey}, ${q.plan.slots.length} Slots).`,
                    "INFO"
                );
            }
            return;
        }
        if (this._autoSettlementPendingKey) return; // ein Export-Roundtrip zur Zeit
        if (!this._autoSettlementChannelLive()) return; // der Dispatch-Kanal entscheidet (M8)
        const wm = st.worldMeta || {};
        const cells = wm.settlementCells && typeof wm.settlementCells === "object" ? wm.settlementCells : null;
        // Wege-Rebuild: Zellen mit Gedächtnis {seed,nH,x,z} bauen ihre Wege je Session lazy aus DEMSELBEN
        // Export am gemerkten Anker neu (nurWege — Häuser/Brunnen sind persistiert). Alt-Saves mit Wert 1 →
        // keine Wege. EIN Roundtrip zur Zeit, nur nahe Zellen.
        if (cells && !this._stlWegePending) {
            for (const k in cells) {
                const c = cells[k];
                if (!c || typeof c !== "object" || !Number.isFinite(c.x) || !Number.isFinite(c.seed)) continue;
                if (this._stlWegeKeys && this._stlWegeKeys.has(k)) continue;
                const rdx = c.x - playerPos.x;
                const rdz = c.z - playerPos.z;
                if (rdx * rdx + rdz * rdz > A.nearM * A.nearM) continue;
                this._stlWegePending = true; // Instanz-Feld (die _editSaveTimer-Klasse)
                this._foundryRequestSettlement({
                    seed: c.seed,
                    nH: c.nH,
                    epoche: this._siedlungEpoche(c.seed), // dieselbe EINE Epochen-Funktion (Rebuild-Treue)
                }).then((plan2) => {
                    this._stlWegePending = false;
                    if (plan2) this._spawnSettlementErlebnis(plan2, { x: c.x, z: c.z }, { key: k, nurWege: true });
                });
                return; // EIN Dorf-Akt pro Tick
            }
        }
        // Start-Dorf zuerst (einmalig je Welt): nur nahe des Genesis-Orts materialisieren (kein Fern-Spawn hinter
        // dem Rücken). Fail-closed + session-gemerkt: eine Welt ohne Fleck urteilt immer gleich.
        if (this._startDorfFaellig(playerPos)) {
            const si = this._autoSettlementStartInfo();
            if (!si)
                this._autoSettlementStartHopeless = true; // Instanz-Feld (die _editSaveTimer-Klasse)
            else {
                this._autoSettlementSpawnCell(0, 0, si);
                return; // EIN Dorf-Akt pro Tick
            }
        }
        if (!this._autoSettlementRejected) this._autoSettlementRejected = new Set(); // Instanz-Feld (die _editSaveTimer-Klasse)
        // ZENSUS 17.07. — DASSELBE Zell-Raster wie die Zell-Wahrheit
        // (_autoSettlementCellInfo): SIEDLUNG.cellM, das fachwerk-Gesetz.
        const SGz = AnazhRealm._siedlungGesetz();
        if (!SGz) return;
        const cellM = SGz.cellM;
        const pcx = Math.floor(playerPos.x / cellM);
        const pcz = Math.floor(playerPos.z / cellM);
        for (let dz = -1; dz <= 1; dz++) {
            for (let dx = -1; dx <= 1; dx++) {
                const cx = pcx + dx;
                const cz = pcz + dz;
                const key = cx + "," + cz;
                if ((cells && cells[key]) || this._autoSettlementRejected.has(key)) continue;
                const info = this._autoSettlementCellInfo(cx, cz);
                if (!info) {
                    this._autoSettlementRejected.add(key); // Zelle trägt kein Dorf (Hash)
                    continue;
                }
                const ddx = info.x - playerPos.x;
                const ddz = info.z - playerPos.z;
                if (ddx * ddx + ddz * ddz > A.nearM * A.nearM) continue; // noch fern — später
                const site = this._autoSettlementFindSite(info); // Anker zuerst, dann die Probe-Ringe
                if (!site) {
                    this._autoSettlementRejected.add(key); // die ganze Zelle untauglich (Wasser/steil/Spawn-nah)
                    continue;
                }
                this._autoSettlementSpawnCell(
                    cx,
                    cz,
                    site.x === info.x && site.z === info.z ? info : Object.assign({}, info, { x: site.x, z: site.z })
                );
                return; // EIN Dorf-Akt pro Tick
            }
        }
    }
}
