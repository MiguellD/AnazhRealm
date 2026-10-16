class AnazhRealm_Z15b {
    // ===== ATLAS §15b · SPIELER-SEELEN/BEWEGUNG — Block Siedlung =====
    // LOD-Baupläne je (species, variantIndex): Keys `grown_<species>_v<idx>_lod{0|1|2}`; LOD0 routet auf
    // den bestehenden `grown_<species>_v<idx>` (keine Doppel-Registrierung), LOD1/2 on-demand. Alle
    // Stufen teilen den variantSeed (nur die Polylinien-Dichte sinkt) und die (shape, material)-Combos
    // → identische Tags. _loadStateRestoreWorldMeta räumt sie beim Welt-Wechsel.
    _buildVariantLODs(species, variantIndex) {
        if (!this.state.blueprints) return null;
        // DER CHOKEPOINT: _buildVariantLODs ist die EINE Quelle gewachsener Baum-Geometrie. Lebt die Foundry
        // und kennt die Art, wird die Grammatik NICHT gebaut (null) — kein Aufrufer kann einen Nachbau
        // setzen. Nur im Boot-Spalt vor `f.ready` trägt noch die Grammatik.
        if (typeof this._foundryEnabled === "function" && this._foundryEnabled()) {
            const f = this._foundry;
            if (f && f.ready && typeof this._foundryPresetFor === "function" && this._foundryPresetFor(species)) {
                return null;
            }
        }
        // Statische Deko-Baupläne (Kiesel/Felsen, keine Pflanze des Gesetzbuchs): EIN Bauplan dient allen drei
        // LOD-Slots — so fließen sie durch denselben Scatter-Pfad wie die Bäume.
        if (!this._phytoArt(species)) {
            if (this.state.blueprints[species]) return { 0: species, 1: species, 2: species };
            return null;
        }
        const N = AnazhRealm.VARIANTS_PER_SPECIES;
        const seeds = this._variantSeedsFor(species);
        if (!seeds) return null;
        if (!Number.isFinite(variantIndex) || variantIndex < 0 || variantIndex >= N) return null;
        const variantSeed = seeds[variantIndex];
        const speciesLabel = String(species || "Baum")
            .replace(/^baum_/, "")
            .replace(/^./, (c) => c.toUpperCase());
        const genV = typeof this._genVersion === "function" ? this._genVersion() : 1;
        const isMerged = genV >= 6;
        const keys = {};
        // Alle 3 Stufen am exakten Key bauen ((species, variantIndex)-Identität). LOD0 teilt den Key mit
        // _growTreeBlueprintForSpawn — kein Doppel-Bau; gleicher variantSeed → bit-identische Geometrie.
        for (const lod of [0, 1, 2]) {
            const cacheKey =
                lod === 0 ? `grown_${species}_v${variantIndex}` : `grown_${species}_v${variantIndex}_lod${lod}`;
            keys[lod] = cacheKey;
            if (this.state.blueprints[cacheKey]) continue;
            const parts = this._growTreeBlueprintRich(species, variantSeed, { lod });
            if (!Array.isArray(parts) || parts.length < 1) continue;
            const isSkeletonMeshed =
                genV >= 7 && this._lastTreeSkeleton && Array.isArray(this._lastTreeSkeleton.branches);
            this.state.blueprints[cacheKey] = {
                name: cacheKey,
                label: lod === 0 ? `${speciesLabel} (gewachsen)` : `${speciesLabel} (gewachsen, LOD${lod})`,
                builtIn: true,
                _isGrown: true,
                _grownSpecies: species,
                _grownSeed: variantSeed,
                _variantIndex: variantIndex,
                _lodLevel: lod,
                _isMerged: isMerged,
                _skeleton: isSkeletonMeshed ? this._lastTreeSkeleton : null,
                instanced: true,
                parts,
            };
            if (isSkeletonMeshed) this._lastTreeSkeleton = null;
            // LOD0 + LRU-Ring (eviction-bewusst wie V18.217-Pfad)
            if (lod === 0) {
                if (!this._growTreeRing) this._growTreeRing = [];
                if (this._growTreeRing.indexOf(cacheKey) === -1) this._growTreeRing.push(cacheKey);
            }
        }
        return keys;
    }

    // Kronen-Dichte-Gitter neu bauen: jede Krone trägt ihr Gewicht (∝ scale·nominalH, geklammert) in
    // IHRE 3m-Zelle; _occlusionOccludes marschiert die Sichtlinie hindurch. Periodisch (throttled), da
    // Bäume streamen; architectures ist streaming-bounded → der Loop bleibt klein.
    // Siehe _chooseLODForDistance (Hysterese aus LOD_DISTANCES) und _tickArchitectureLOD
    // (≤ maxSwitchesPerFrame Wechsel/Frame; Flag state.atmosphere.treeLOD; blockerAABBs bleiben).
    _rebuildOcclusionGrid() {
        const O = AnazhRealm.OCCLUSION;
        let grid = this._occlGrid;
        if (!grid) grid = this._occlGrid = new Map();
        else grid.clear();
        const archs = this.state.architectures;
        if (!Array.isArray(archs)) return grid;
        const cellM = O.cellM;
        for (let i = 0; i < archs.length; i++) {
            const e = archs[i];
            if (!e || !e.instanced || !e._lodSpecies || !e.position) continue;
            const s = Number.isFinite(e.scale) && e.scale > 0 ? e.scale : 1;
            const w = Math.max(O.weightMin, Math.min(O.weightMax, s * O.nominalH * O.weightPerM));
            const gx = Math.floor(e.position.x / cellM);
            const gz = Math.floor(e.position.z / cellM);
            const k = gx + "," + gz;
            grid.set(k, (grid.get(k) || 0) + w);
        }
        return grid;
    }

    // Throttled: alle OCCLUSION.rebuildInterval Frames (~3×/s) neu bauen — die Bäume
    // sind quasi-statisch, ein leicht veraltetes Gitter fängt die Hysterese ab.
    _maybeRebuildOcclusionGrid() {
        const O = AnazhRealm.OCCLUSION;
        this._occlFrameCounter = (this._occlFrameCounter || 0) + 1;
        if (!this._occlGrid || this._occlFrameCounter >= O.rebuildInterval) {
            this._occlFrameCounter = 0;
            this._occlGridRegung = this._weltRegung | 0; // der Bau-Stand, den das Gitter trägt (die Stand-Wache liest ihn)
            this._rebuildOcclusionGrid();
        }
    }

    // Sichtlinie Kamera→Baum durchs Kronen-Dichte-Gitter: kumulierte Dichte über der Schwelle → verdeckt
    // → LOD2. Hysterese (thrLo für schon Verdeckte) gegen Flattern. Die Schwelle skaliert mit
    // _foliageDensityScale (EIN Regler) — unter Last werden mehr Bäume LOD2.
    _occlusionOccludes(camX, camZ, tx, tz, dr, wasOccluded) {
        const grid = this._occlGrid;
        if (!grid || grid.size === 0 || !(dr > 0)) return false;
        const O = AnazhRealm.OCCLUSION;
        const cellM = O.cellM;
        const ix = (tx - camX) / dr;
        const iz = (tz - camZ) / dr;
        const tEnd = dr - O.endMargin;
        let thr = wasOccluded ? O.thrLo : O.thrHi;
        const fd = this.state._foliageDensityScale;
        if (Number.isFinite(fd) && fd < 1) thr *= O.perfThrMin + (1 - O.perfThrMin) * fd;
        let s = 0;
        for (let t = O.startM; t < tEnd; t += O.stepM) {
            const gx = Math.floor((camX + ix * t) / cellM);
            const gz = Math.floor((camZ + iz * t) / cellM);
            const d = grid.get(gx + "," + gz);
            if (d) {
                s += d;
                if (s > thr) return true;
            }
        }
        return false;
    }

    // `auge`: der Ort, von dem die Wahl misst — das Auge der Maske (`_lodAuge`, der Takt reicht es), nie der Spieler: die
    // Maske misst vom Auge, misst die Wahl vom Spieler, steht in der Verfolger-Kamera (9,6 m Arm) die Stufe ohne den Partner,
    // zu dem ihre Maske blendet (K36, Genesis: 9 halbe Tore und Ruinen im Bild).
    _tickArchitectureLOD(maxSwitchesPerFrame = 5, auge = null) {
        const atmo = this.state.atmosphere;
        if (atmo && atmo.treeLOD === false) return 0;
        const pm = auge;
        if (!pm) return 0;
        // in der Ankunft aus der Ferne (B2: vor dem Bild und im Gleiten) wechselt die Wahl mit der Maske Schritt (`uLodPerf`)
        if (this._ankunftsFerne() > 1) maxSwitchesPerFrame = Math.max(maxSwitchesPerFrame, AnazhRealm.ANKUNFT_TAKT.bau);
        this._buendelAnkerPruefen(pm); // DIE REIHE NACH ABSTAND (1310-9): neu nur beim Anker-Wechsel
        const archs = this.state.architectures;
        if (!Array.isArray(archs) || archs.length === 0) return 0;
        // DIE STAND-WACHE: ging die Stufen-Wahl eine volle Runde über alle Einträge, ohne zu wechseln und ohne dass einer
        // wartete, und regt sich nichts (Ort, Bau-Menge, Ankunft, Regler), wählt sie dieselben Stufen — kein Gang.
        if (this._standRuht("archLod", archs.length, { pos: pm, rand: AnazhRealm.STAND_RAND_M }, "bau")) return 0;
        let regung = 0;
        let offen = 0;
        // Rolling cursor: jeder Tick walkt nur einen Slice des Arrays. Bei
        // grossen Welten (10k+ Architekturen) bleibt der Tick bounded. Den
        // Cursor speichern wir an state — er reist nicht im Snapshot.
        if (!Number.isFinite(this._archLODCursor)) this._archLODCursor = 0;
        // V18.389 (SUBSYSTEM 3) — Occlusion-Demotion aktiv? Headless (Null-Renderer) → AUS
        // (gate-treu: das Gate sieht die reine Distanz-LOD, unperturbiert). Bei aktiv das
        // Kronen-Gitter throttled neu bauen (einmal je Tick eingehängt).
        const st = this.state;
        const occlOn = st.useOcclusionDemotion !== false && !(st.renderer && st.renderer._isHeadlessNull);
        if (occlOn) this._maybeRebuildOcclusionGrid();
        let switches = 0;
        const sliceLen = Math.min(archs.length, 256); // wieviele Einträge pro Frame ANSCHAUEN
        // Der Cursor rückt um die BESUCHTEN Einträge vor: endete die Scheibe am Wechsel-Budget, ging der Rest der Scheibe
        // bis 05.10. eine ganze Runde leer aus (gate:fernwald D: nach 18 m Weg stand der Baum am Radius 40 Takte ohne
        // seinen Zonen-Stempel).
        let besucht = 0;
        for (let i = 0; i < sliceLen && switches < maxSwitchesPerFrame; i++) {
            besucht = i + 1;
            const idx = (this._archLODCursor + i) % archs.length;
            const entry = archs[idx];
            if (!entry || !entry.instanced) continue;
            // Auch platzierte Studio-Architektur (instFoundry) tickt LOD — sonst behält ein Haus im Cull-Radius
            // seine Bau-Stufe für immer (~75k Tris/Haus auch bei 120 m). Eligibility ist daten-getrieben; die
            // Stufen je Art bleiben kindStages in _foundryFlattenFor (kein kind-Literal).
            const treeLike = !!entry._lodSpecies && Number.isFinite(entry._lodVariantIndex);
            if (!treeLike && entry.instFoundry !== true) continue;
            const dx = entry.position.x - pm.x;
            const dz = entry.position.z - pm.z;
            const dist = Math.sqrt(dx * dx + dz * dz);
            // V18.387 — Baum-Einträge reichen ihre Sichthöhe durch → Wahrnehmungs-
            // Distanz-LOD (größere Bäume schalten später, unter Last alle früher).
            const visH = this._lodTreeVisHeight(entry);
            if (visH === null) {
                offen++;
                continue; // die Höhen-Stufe lädt: der Baum hält Stufe und Band
            }
            // Die BRÜCKE trägt keinen Hysterese-Zustand: ihre Stufe 2 ist die gedockte Karte, nicht die Wahl. Mit ihr als
            // Zustand blieb die Wahl im Band [thresh12 − hyst, thresh12] (22,6–26 m) auf 2, die Brücke löste sich als
            // „Karte" auf und blendete nach Distanz aus — ohne L1-Partner, der Baum stand halb ausgedithert.
            // DIE GRENZEN DES GESETZBUCHS (K43): nennt die Art ihre Stufen-Grenzen (B2c `ab`), wählt der Takt nach ihnen — in
            // der Ankunft aus der Ferne (`_ankunftsFerne`, B2) die Grobstufe
            const grenzen = treeLike ? null : this._archStufenGrenzen(entry);
            let newLOD = grenzen
                ? AnazhRealm._stufeNachGrenzen(
                      dist * this._ankunftsFerne(),
                      entry._lodLevel,
                      grenzen,
                      Number.isFinite(entry.scale) && entry.scale > 0 ? entry.scale : 1
                  )
                : this._chooseLODForDistance(dist, entry._bruecke ? undefined : entry._lodLevel, visH);
            // Occlusion-Demotion: ein ferner 3D-Baum (LOD0/1) hinter dichter Kronen-Masse fällt auf LOD2.
            // `entry._occluded` trägt die Hysterese — transient, NICHT im Snapshot.
            if (occlOn && newLOD < 2 && dist > AnazhRealm.OCCLUSION.occDist) {
                const occ = this._occlusionOccludes(
                    pm.x,
                    pm.z,
                    entry.position.x,
                    entry.position.z,
                    dist,
                    entry._occluded === true
                );
                // AUSLÖSCHUNGS-WELLE (Feld B, vOcc) — ein Occlusion-WECHSEL ohne Stufen-
                // Switch (fern-verdeckt ↔ fern-frei auf L2) zieht die Verdeckungs-Slots (Vorzeichen von aKarte.w) nach
                // (das Studio-vOcc: die Karte des verdeckt-demotierten Baums blendet VOLL).
                if (entry._occluded !== occ) {
                    entry._occluded = occ;
                    this._lodSlotOcclusionRefresh(entry);
                    regung++;
                } else {
                    entry._occluded = occ;
                }
                if (occ) newLOD = 2;
            } else if (entry._occluded) {
                entry._occluded = false;
                this._lodSlotOcclusionRefresh(entry);
                regung++;
            }
            if (newLOD === entry._lodLevel) {
                // Die Distanz-Wahl ist selbst die Karte: die Brücke ist keine mehr, die Karte blendet wie jede Fernstufe.
                if (entry._bruecke) {
                    entry._bruecke = false;
                    this._lodSlotOcclusionRefresh(entry);
                    regung++;
                }
                // Band-Pflege ohne Primär-Wechsel: der Eintrag wandert durchs Dither-Crossfade-Band, die
                // Doppel-Mitgliedschaft folgt der Partner-Wahl. Band-Add/-Remove zählt aufs selbe Spike-Budget.
                // Flag-Wand zuerst (foundryCrossfade aus → billiger Tick).
                if (st.foundryCrossfade === true && this._updateFoundryLodBand(entry, dist)) switches++;
                if (entry._lodHaltWartet === true) offen++; // der Partner lädt: die Stufe hält, die Wahl bleibt wach
                continue;
            }
            // LOD-Switch — re-allocate
            const vorher = entry._lodLevel;
            const success = this._switchArchitectureLOD(entry, newLOD, dist);
            if (success) switches++;
            else if (entry._lodLevel !== vorher)
                regung++; // nur die Distanz-Autorität gestempelt (Stufen-Klammer)
            else if (entry._lodLevel !== newLOD) {
                // die Stufe lädt (oder bäckt): der Eintrag wartet — und seine stehende Stufe hält VOLL, wo ihr Partner
                // fehlt (die L1 jenseits des Bands vor der ungebackenen Karte war sonst ganz verworfen: ein Loch)
                offen++;
                if (st.foundryCrossfade === true && this._updateFoundryLodBand(entry, dist)) regung++;
            }
        }
        this._archLODCursor = (this._archLODCursor + besucht) % archs.length;
        // Mit Verdeckung schläft die Wahl nur auf einem Gitter, das den jetzigen Bau-Stand trägt (sonst hielte sie ein
        // Urteil über eine Krone, die es nicht mehr gibt) — bis zum nächsten gedrosselten Neubau bleibt sie wach.
        const gitterAlt = occlOn && this._occlGridRegung !== (this._weltRegung | 0);
        this._standMeldet("archLod", besucht, switches + regung > 0, offen > 0 || gitterAlt);
        return switches;
    }

    // Instanced Architektur auf andere LOD-Stufe: _archInstanceRemove → entry.type auf den neuen
    // LOD-Key → _archInstanceAdd. blockerAABBs bleiben (LOD ist reine Render-Schicht).
    _switchArchitectureLOD(entry, newLOD, dist) {
        if (!entry) return false;
        // Platzierte Studio-Architektur (instFoundry) wechselt über den EINEN Foundry-Zweig unten; der
        // Grammatik-Zweig (grown_..._lodN) bleibt den Wald-Varianten (_lodSpecies + _lodVariantIndex).
        const treeLike = !!entry._lodSpecies && Number.isFinite(entry._lodVariantIndex);
        if (!treeLike && entry.instFoundry !== true) return false;
        // Foundry-LOD: kennt die Foundry die Art, ist sie die EINE Quelle — auch für einen KALTEN Baum ohne
        // instFoundry: ihre Stufe servieren ODER den aktuellen Zustand halten, NIE Grammatik (sonst erweckt
        // der Switch einen gewachsenen Nachbau). Die Distanz-Wahl newLOD führt; kein entry.type-Wechsel —
        // das Studio-LOD lebt im leafKey (`f:preset|gestalt|lod`). Grammatik nur bei Foundry aus oder
        // unbekannter Art.
        if (this._foundryEnabled()) {
            const preset = this._foundryPresetForEntry(entry);
            if (preset) {
                const fFlat = this._foundryFlattenFor(entry, preset, newLOD);
                if (fFlat && fFlat.instanceable) {
                    // Clamp-Kurzschluss: liefert die kindStages-Klammer dieselbe servierte Stufe (Ein-Stufen-Art wie
                    // fels [0]), wäre Remove+Add ein identischer Re-Alloc — nur die Distanz-Autorität stempeln.
                    // Bäume (kindStages [0,1,2]) erreichen den Zweig nie.
                    if (entry.instanced && Number.isFinite(fFlat.lod) && fFlat.lod === entry._servedLod) {
                        entry._lodLevel = newLOD;
                        return false;
                    }
                    this._archInstanceRemove(entry); // räumt Primär UND Band (W5.4-Default)
                    entry._lodLevel = newLOD;
                    this._archInstanceAdd(entry, fFlat);
                    // W5.4 — die Band-Mitgliedschaft nach dem Primär-Wechsel SOFORT nachziehen
                    // (im Band wechselt der Primär die Seite → der Partner ist die alte Stufe;
                    // dieselbe EINE Pflege-Quelle wie im Tick, idempotent).
                    // Die Distanz misst vom Auge der Maske: der Takt reicht seine, ein Ruf ohne fragt `_lodAuge`.
                    if (this.state.foundryCrossfade === true) {
                        const _auge = Number.isFinite(dist) ? null : this._lodAuge();
                        const _d =
                            _auge && entry.position
                                ? Math.hypot(entry.position.x - _auge.x, entry.position.z - _auge.z)
                                : dist;
                        if (Number.isFinite(_d)) this._updateFoundryLodBand(entry, _d, preset);
                    }
                    return true;
                }
                // null (lädt) ODER false (Bake-Lücke) → aktuelle Stufe HALTEN, NIE Grammatik (kein Nachbau).
                return false;
            }
        }
        // TRIAS-WELLE — platzierte Studio-Architektur (nicht treeLike) hat KEINEN
        // Grammatik-Zweig: ohne aufloesbares Preset (Foundry aus/kalt) Stufe halten.
        if (!treeLike) return false;
        const species = entry._lodSpecies;
        const varIdx = entry._lodVariantIndex;
        // Sicherstellen, dass alle 3 LOD-Bauplane existieren (lazy-build)
        const keys = this._buildVariantLODs(species, varIdx);
        if (!keys || !keys[newLOD]) return false;
        const newType = keys[newLOD];
        if (newType === entry.type) {
            entry._lodLevel = newLOD;
            return false;
        }
        const newBp = this.state.blueprints && this.state.blueprints[newType];
        if (!newBp) return false;
        // Prüfen: ist der neue Bauplan instanced + flatten-bar?
        const newFlat = this._archFlattenBlueprint(newType);
        if (!newFlat || !newFlat.instanceable || !Array.isArray(newFlat.leaves) || newFlat.leaves.length === 0) {
            return false;
        }
        // Alte Slots frei (boundingSphere, instanceMatrix.needsUpdate werden gesetzt)
        this._archInstanceRemove(entry);
        // entry.type updaten — die Architektur ist jetzt eine andere LOD-Variante
        entry.type = newType;
        entry._lodLevel = newLOD;
        // Neue Slots allozieren via Standard-Pfad
        this._archInstanceAdd(entry, newFlat);
        return true;
    }

    // Band-Partner-Wahl: welche ZWEITE Stufe hält ein Foundry-Baum im Dither-Crossfade-Band (Übersetzung
    // der phytogenesis-Mitgliedschaft, M = Hysterese-Rand): L0 bis dn < D0+M · L1 ab dnL > D0−FADE0−M
    // (Blatt-Metrik), bis dn < D1+M (Baum-Metrik) · Billboard ab dn > D1−FADE−M. Partner = Nachbar der
    // Primär-Stufe im Band (die Bänder überlappen bei den Defaults nie), sonst null. dn/dnL aus der
    // EINEN Quelle _lodPerceptionDistance (Blatt auf leafVisCap gekappt, wie der aH0L-Stempel).
    // undefined = die Höhe ist (noch) nicht bekannt: kein Urteil, das Band bleibt.
    _foundryLodBandPartner(entry, dist) {
        const visH = this._lodTreeVisHeight(entry);
        return visH === null ? undefined : this._lodBandPartnerFor(dist, visH, entry._lodLevel | 0, entry.scale);
    }
    // Entry-freier Partner-Kern: Architektur-Einträge UND der Scatter fragen DIESELBE Regel, welche
    // zweite Stufe im Dither-Crossfade-Band wohnt (Mitgliedschaft ±M um die Fade-Fenster).
    // s = die Instanz-Skala: die Blatt-Kappe gilt der VORLAGE (Stempel aH0L = min(Vorlage, Kappe) × s, Studio
    // phytogenesis Z.2582 bhL = min(H0, Kappe) · sc — CPU == GPU), nie der skalierten Höhe.
    _lodBandPartnerFor(dist, visH, cur, s) {
        const cfg = AnazhRealm.LOD_DISTANCES;
        if (!cfg) return null;
        const M = cfg.hysteresis;
        const D0 = cfg.thresh01,
            D1 = cfg.thresh12,
            FADE = cfg.fade,
            FADE0 = cfg.fade0;
        const dn = visH > 0 ? this._lodPerceptionDistance(dist, visH) : dist;
        cur = Math.max(0, Math.min(2, cur | 0));
        if (cur === 0) {
            const capL = cfg.leafVisCap;
            const sS = Number.isFinite(s) && s > 0 ? s : 1;
            const dnL = visH > 0 ? this._lodPerceptionDistance(dist, Math.min(visH / sS, capL) * sS) : dist;
            return dnL > D0 - FADE0 - M ? 1 : null;
        }
        if (cur === 1) {
            if (dn < D0 + M) return 0;
            if (dn > D1 - FADE - M) return 2;
            return null;
        }
        return dn < D1 + M ? 1 : null;
    }

    // Die EINE Band-Pflege: hält die Band-Mitgliedschaft eines Foundry-Baums synchron zur Partner-Wahl
    // (vom LOD-Tick und nach dem Foundry-LOD-Switch), Add/Remove nur über die Slot-Chokepoints.
    // Nur unter `foundryCrossfade` (Maske + Band schalten ZUSAMMEN, sonst Doppel-Draw bzw. Löcher),
    // nur instFoundry, nur Baum-Presets (_foundryPresetIsTree). Partner noch nicht geladen → Band leer,
    // nächster Tick versucht neu. true = Mitgliedschaft geändert (zählt aufs Switch-Budget).
    _updateFoundryLodBand(entry, dist, presetOpt) {
        const st = this.state;
        let desired = null;
        let preset = null;
        if (
            st &&
            st.foundryCrossfade === true &&
            entry &&
            entry.instanced &&
            entry.instFoundry &&
            Number.isFinite(dist) &&
            this._foundryEnabled()
        ) {
            preset = presetOpt || this._foundryPresetForEntry(entry);
            if (preset && this._foundryPresetIsTree(preset)) {
                desired = this._foundryLodBandPartner(entry, dist);
                if (desired === undefined) return false; // die Höhen-Stufe lädt: das Band bleibt, wie es ist
                if (desired === entry._lodLevel) desired = null; // defensiv: Partner nie == Primär
            }
        }
        const cur = Number.isFinite(entry && entry._lodBandLevel) ? entry._lodBandLevel : null;
        if (cur === desired) {
            this._lodHaltSetzen(entry, false); // der Partner steht (oder keiner ist verlangt): kein Halt
            return false;
        }
        let geaendert = false;
        if (entry.instSlotsBand) {
            this._archInstanceRemove(entry, { bandOnly: true });
            geaendert = true;
        }
        entry._lodBandLevel = null;
        if (desired === null) {
            this._lodHaltSetzen(entry, false);
            return geaendert;
        }
        const flat = this._foundryFlattenFor(entry, preset, desired);
        if (!flat || !flat.instanceable) {
            // lädt (null) oder kann nicht (false, die Bake-Lücke) → Band leer, die Primär-Stufe HÄLT; lädt der Partner,
            // wartet der Eintrag (der nächste Tick versucht neu), die Lücke hält still
            this._lodHaltSetzen(entry, flat === null ? "wartet" : true);
            return geaendert;
        }
        // Klammer-Wand: kollabiert kindStages den Partner auf dieselbe servierte Stufe wie die Primär-Stufe,
        // wäre das Band ein voll-opaker Doppel-Draw. Flats sind je Stufe gecacht → Identität ist der Test.
        const primFlat = this._foundryFlattenFor(entry, preset, entry._lodLevel | 0);
        if (primFlat && flat === primFlat) {
            this._lodHaltSetzen(entry, false);
            return geaendert;
        }
        this._archInstanceAdd(entry, this._bandOhneZwilling(flat, primFlat), { band: true, bandLod: desired });
        this._lodHaltSetzen(entry, false);
        return true;
    }

    // DER HALT DER STUFE (K36, der Geister-Baum): die Maske blendet ein PAAR — eine Stufe weicht ihrem Partner, wo das
    // Gesetz ihn zeigt. Steht der Partner nicht (die Karte bäckt, die Stufe lädt, die Art trägt keine), wich die Stufe dem
    // Nichts: die L1 vor der ungebackenen Karte stand halb durchsichtig über der Szene, jenseits des Bands fehlte sie ganz.
    // Eine Stufe ohne ihren Partner hält VOLL — dasselbe Vorzeichen wie die verdeckte Karte (`_lodSlotVoll` → der Slot-
    // Stempel: aKarte.w der Karte, aH0L der 3D-Stufen negativ), bis der Partner steht. `halt`: false · true (die Lücke,
    // still) · "wartet" (der Partner lädt: der Tick bleibt wach). true = der Stempel wechselte.
    _lodHaltSetzen(entry, halt) {
        if (!entry) return false;
        entry._lodHaltWartet = halt === "wartet";
        if ((entry._lodHalt === true) === !!halt) return false;
        entry._lodHalt = !!halt;
        this._lodSlotOcclusionRefresh(entry);
        return true;
    }
    // Der Band-Partner trägt keinen Zwilling, den die Primär-Stufe schon wirft (EIN Werfer je Gestalt: L0 und L1 eines
    // Baums tragen DIESELBEN Zwillings-Leaves) — der Baum im L0↔L1-Band wirft einmal, nicht zweimal.
    _bandOhneZwilling(flat, primFlat) {
        if (!primFlat || !Array.isArray(primFlat.leaves) || !flat || !Array.isArray(flat.leaves)) return flat;
        const prim = new Set();
        for (const lf of primFlat.leaves) if (lf.shadowTwin) prim.add(lf.leafKey);
        if (!prim.size || !flat.leaves.some((lf) => lf.shadowTwin && prim.has(lf.leafKey))) return flat;
        return Object.assign({}, flat, {
            leaves: flat.leaves.filter((lf) => !(lf.shadowTwin && prim.has(lf.leafKey))),
        });
    }

    // ═══ GPU-FELD-BAKE ═══
    // Region = 256 × 256 m (16 Voxel-Chunks). Pro Texel: height (voxelSurfaceY) · slope (|∇surface|) ·
    // moisture (_feuchteAt) · lebendig/glut/magie (worldFieldAt). LRU-Cache (32 Regionen), on demand
    // gebaut, bei Edit invalidiert. CPU-First: der Scatter liest die Float32Array direkt.

    _bakeRegionConfig() {
        // res 32 (8 m/Texel) genügt fürs Scatter-Gating (slope/lebendig sind groß-λ-glatt) und ist 4×
        // billiger als 64 — der Warmup-Pump erstickt nicht am Bake.
        return {
            sizeM: 256, // Welt-Meter pro Region-Kante
            res: 32, // Texel pro Kante (Auflösung)
            texelM: 256 / 32, // = 8 m pro Texel
            channels: 6, // height/slope/moisture/lebendig/glut/magie
            cacheCap: 32, // LRU
        };
    }

    _bakedRegionKey(regX, regZ) {
        return `${regX | 0},${regZ | 0}`;
    }

    _ensureBakedRegionMap() {
        if (!this.state.bakedRegionFields) this.state.bakedRegionFields = new Map();
        if (!this._bakedRegionRing) this._bakedRegionRing = [];
        return this.state.bakedRegionFields;
    }

    // Bake-Akt: eine Region voll sampeln, Ergebnis gecacht (LRU). Optional in j-Zeilen-Scheiben
    // (cont + deadlineMs, vom `_scatterRegion` mit Deadline): der HALBE Bake lebt NUR in cont.bakeEntry,
    // NIE in der Map — _sampleBakedField kann keine halben Felder lesen. Ohne cont: One-Shot.
    _bakeRegionFields(regX, regZ, cont, deadlineMs) {
        const map = this._ensureBakedRegionMap();
        const key = this._bakedRegionKey(regX, regZ);
        const existing = map.get(key);
        if (existing && !existing.dirty) {
            // LRU touch
            if (this._bakedRegionRing) {
                const idx = this._bakedRegionRing.indexOf(key);
                if (idx >= 0) {
                    this._bakedRegionRing.splice(idx, 1);
                    this._bakedRegionRing.push(key);
                }
            }
            if (cont) {
                cont.bakeEntry = null;
                cont.bakeJ = null;
            }
            return existing;
        }
        const cfg = this._bakeRegionConfig();
        const N = cfg.res;
        const t = cfg.texelM;
        const originX = regX * cfg.sizeM;
        const originZ = regZ * cfg.sizeM;
        // Reuse den bestehenden Float-Buffer wenn dirty (kein Re-Alloc); eine offene
        // Scheiben-Fortsetzung trägt ihren halben Buffer selbst (cont.bakeEntry).
        const entry = (cont && cont.bakeEntry) ||
            existing || {
                regX: regX | 0,
                regZ: regZ | 0,
                originX,
                originZ,
                res: N,
                texelM: t,
                channels: cfg.channels,
                data: new Float32Array(N * N * cfg.channels),
                dirty: true,
                bakedAt: 0,
                sampleCount: 0,
            };
        // CPU-Sampling: pro Texel die echten Wahrheits-Quellen aufrufen
        // (das gleiche, was die CPU-Spawn-Pipeline liest → bit-Wahrheits-
        // Konsistenz im V18.220-Fallback-Pfad).
        const data = entry.data;
        const _jStart = cont && Number.isFinite(cont.bakeJ) ? cont.bakeJ : 0;
        for (let j = _jStart; j < N; j++) {
            const z = originZ + (j + 0.5) * t;
            // W3.3b — Scheiben-Schnitt am ZEILEN-Anfang (reine Unterbrechung: jede
            // Texel-Zeile rechnet identisch, egal in welcher Scheibe; ~1,4 ms/Zeile).
            if (cont && Number.isFinite(deadlineMs) && j > _jStart && performance.now() > deadlineMs) {
                cont.bakeEntry = entry;
                cont.bakeJ = j;
                return null; // Scheibe voll — der Aufrufer kommt im nächsten Frame wieder
            }
            for (let i = 0; i < N; i++) {
                const x = originX + (i + 0.5) * t;
                const idx = (j * N + i) * cfg.channels;
                const sy = typeof this._voxelSurfaceY === "function" ? this._voxelSurfaceY(x, z) : 0;
                data[idx + 0] = Number.isFinite(sy) ? sy : 0;
                // Slope: |∇h| über 4-Sample-Cross — V18.351 jetzt durch DIE EINE Formel `_slopeAt`
                // (getTerrainHeightAt ±2 m als Sampler → byte-gleich zum alten Inline, aber EINE Quelle;
                // Gras, Scatter-Fallback und dieser Bäcker teilen sie nun statt je eine eigene Regel).
                data[idx + 1] =
                    typeof this.getTerrainHeightAt === "function"
                        ? this._slopeAt(x, z, (px, pz) => this.getTerrainHeightAt(px, pz), 2)
                        : 0;
                // Moisture: _feuchteAt (mit surf-Argument)
                data[idx + 2] = typeof this._feuchteAt === "function" ? this._feuchteAt(x, z, sy) : 0;
                // Field-Stimmen (lebendig/glut/magie)
                const f = typeof this.worldFieldAt === "function" ? this.worldFieldAt(x, z) : null;
                data[idx + 3] = f ? +f.lebendig || 0 : 0;
                data[idx + 4] = f ? +f.glut || 0 : 0;
                data[idx + 5] = f ? +f.magieleitung || 0 : 0;
            }
        }
        entry.dirty = false;
        entry.bakedAt = typeof performance !== "undefined" && performance.now ? performance.now() : Date.now();
        entry.sampleCount = N * N;
        if (cont) {
            cont.bakeEntry = null;
            cont.bakeJ = null;
        }
        map.set(key, entry);
        // LRU-Ring + Eviction
        if (!this._bakedRegionRing) this._bakedRegionRing = [];
        const ringIdx = this._bakedRegionRing.indexOf(key);
        if (ringIdx >= 0) this._bakedRegionRing.splice(ringIdx, 1);
        this._bakedRegionRing.push(key);
        while (this._bakedRegionRing.length > cfg.cacheCap) {
            const drop = this._bakedRegionRing.shift();
            if (drop && map.has(drop)) map.delete(drop);
        }
        return entry;
    }

    // Welt-(x,z) aus dem Region-Bake samplen (bilinear über die 4 nächsten Texel); Cache-Miss baut die
    // Region lazy. Alle Scatter-Konsumenten lesen hierdurch.
    _sampleBakedField(x, z) {
        const cfg = this._bakeRegionConfig();
        const regX = Math.floor(x / cfg.sizeM);
        const regZ = Math.floor(z / cfg.sizeM);
        const entry = this._bakeRegionFields(regX, regZ);
        if (!entry || !entry.data) return null;
        const localX = (x - entry.originX) / entry.texelM - 0.5;
        const localZ = (z - entry.originZ) / entry.texelM - 0.5;
        const i0 = Math.max(0, Math.min(entry.res - 1, Math.floor(localX)));
        const j0 = Math.max(0, Math.min(entry.res - 1, Math.floor(localZ)));
        const i1 = Math.min(entry.res - 1, i0 + 1);
        const j1 = Math.min(entry.res - 1, j0 + 1);
        const fx = Math.max(0, Math.min(1, localX - i0));
        const fz = Math.max(0, Math.min(1, localZ - j0));
        const idx00 = (j0 * entry.res + i0) * entry.channels;
        const idx10 = (j0 * entry.res + i1) * entry.channels;
        const idx01 = (j1 * entry.res + i0) * entry.channels;
        const idx11 = (j1 * entry.res + i1) * entry.channels;
        const lerp = (a, b, t) => a + (b - a) * t;
        const out = { height: 0, slope: 0, moisture: 0, lebendig: 0, glut: 0, magie: 0 };
        const keys = ["height", "slope", "moisture", "lebendig", "glut", "magie"];
        for (let c = 0; c < entry.channels; c++) {
            const v00 = entry.data[idx00 + c];
            const v10 = entry.data[idx10 + c];
            const v01 = entry.data[idx01 + c];
            const v11 = entry.data[idx11 + c];
            const v0 = lerp(v00, v10, fx);
            const v1 = lerp(v01, v11, fx);
            out[keys[c]] = lerp(v0, v1, fz);
        }
        return out;
    }

    // ═══ SCATTER + BITMASK ═══
    // Cell-Bitmask (promovierte Cells überspringen die Deko-Instanz), Cap-Wand je Schicht (600k Bäume,
    // 700k Understory, 1.5M Steine), Lookup-Buffer (cell → species, variantIndex). Die drei Schichten
    // teilen das Cell-Raster (3.4 / 2.4 / 2.1 m); Bitmask + Caps wirken auch auf _vegetationSampleSpawn.

    _scatterConfig() {
        return {
            // Plan §8.2 Cell-Raster
            treeCellM: 3.4,
            underCellM: 2.4,
            stoneCellM: 2.1,
            // Plan §13 Cap-Wand
            capTrees: 600000,
            capUnderstory: 700000,
            capStones: 1500000,
        };
    }

    // V18.220 — Cell-Key in Welt-Koords (deterministisch, P2P-sicher).
    // Layer ∈ {"tree", "under", "stone"}; das Cell-Raster pro Layer.
    _scatterCellKeyAt(x, z, layer) {
        const cfg = this._scatterConfig();
        let cell;
        if (layer === "under") cell = cfg.underCellM;
        else if (layer === "stone") cell = cfg.stoneCellM;
        else cell = cfg.treeCellM;
        const cx = Math.floor(x / cell);
        const cz = Math.floor(z / cell);
        return `${layer}:${cx},${cz}`;
    }

    // V18.220 — die PROMOTED-Bitmask. Plan §2 + §8: ein Cell, das via Ω-H
    // promoted wurde, wird vom Scatter-Pass übersprungen (kein dekorativer
    // Doppel-Tree). Snapshot-getragen — die Promotion überlebt den Reload.
    _ensureScatterPromotedSet() {
        if (!this.state.scatterPromoted || !(this.state.scatterPromoted instanceof Set)) {
            this.state.scatterPromoted = new Set();
        }
        return this.state.scatterPromoted;
    }

    _scatterIsCellPromoted(x, z, layer) {
        const set = this.state.scatterPromoted;
        if (!set || set.size === 0) return false;
        return set.has(this._scatterCellKeyAt(x, z, layer || "tree"));
    }

    _scatterMarkCellPromoted(x, z, layer) {
        const set = this._ensureScatterPromotedSet();
        set.add(this._scatterCellKeyAt(x, z, layer || "tree"));
    }

    // V18.220 — die Cap-Wand. Pro Layer ein Zähler; das CPU-Scatter erhöht
    // ihn bei jedem _enqueueVegetationSpawn (Architektur-Promotion via Ω-H
    // wandert NICHT, die ist auf REALE Bäume gerichtet).
    _ensureScatterCounters() {
        if (!this.state.scatterCounters) {
            this.state.scatterCounters = { tree: 0, under: 0, stone: 0 };
        }
        return this.state.scatterCounters;
    }

    _scatterIncrementCounter(layer) {
        const c = this._ensureScatterCounters();
        if (layer === "under") c.under = (c.under | 0) + 1;
        else if (layer === "stone") c.stone = (c.stone | 0) + 1;
        else c.tree = (c.tree | 0) + 1;
    }

    _scatterCounterAtCap(layer) {
        const cfg = this._scatterConfig();
        const c = this._ensureScatterCounters();
        if (layer === "under") return c.under >= cfg.capUnderstory;
        if (layer === "stone") return c.stone >= cfg.capStones;
        return c.tree >= cfg.capTrees;
    }

    // Lookup cellKey → {species, variantIndex}: JEDER gesetzte Scatter-Punkt MUSS hier eintragen — sonst
    // kann die Promotion die Cell nicht zur Form-Identität auflösen.
    _ensureScatterLookup() {
        if (!this.state.scatterLookup || !(this.state.scatterLookup instanceof Map)) {
            this.state.scatterLookup = new Map();
        }
        return this.state.scatterLookup;
    }

    _scatterRegisterCell(x, z, layer, species, variantIndex) {
        const map = this._ensureScatterLookup();
        const key = this._scatterCellKeyAt(x, z, layer || "tree");
        map.set(key, { species: String(species || ""), variantIndex: variantIndex | 0 });
    }

    _scatterLookupCell(x, z, layer) {
        const map = this.state.scatterLookup;
        if (!map || map.size === 0) return null;
        return map.get(this._scatterCellKeyAt(x, z, layer || "tree")) || null;
    }

    // ═══════════════════════════════════════════════════════════════════
    // V18.224 (DER LEBENDIGE GIGANT §5+§8+§2 — DAS HERZ) — ECHTER SCATTER + PROMOTION
    // ═══════════════════════════════════════════════════════════════════

    // pcg2d (Jarzynski & Olano 2020): Integer-Hash, bit-identisch CPU↔GPU (nur IEEE-deterministische
    // Ops). Liefert ein uint32-Paar, genutzt wird [0] — Scatter P2P-identisch und WGSL-liftbar.
    _pcg2d(a, b) {
        let x = (a >>> 0) * 1664525 + 1013904223;
        let y = (b >>> 0) * 1664525 + 1013904223;
        x = (x >>> 0) + (((y >>> 0) * 1664525) >>> 0);
        y = (y >>> 0) + (((x >>> 0) * 1664525) >>> 0);
        x = (x >>> 0) ^ (x >>> 16);
        y = (y >>> 0) ^ (y >>> 16);
        x = (x >>> 0) + (((y >>> 0) * 1664525) >>> 0);
        y = (y >>> 0) + (((x >>> 0) * 1664525) >>> 0);
        x = (x >>> 0) ^ (x >>> 16);
        return x >>> 0;
    }

    // Ein deterministischer Float [0,1) aus zwei Integer-Achsen + Salt.
    _pcgFloat(cx, cz, salt) {
        return this._pcg2d((cx * 73856093) ^ ((salt | 0) * 19349663), cz * 83492791) / 4294967296;
    }

    _ensureScatterRegionMap() {
        if (!this.state.scatterRegions || !(this.state.scatterRegions instanceof Map)) {
            this.state.scatterRegions = new Map();
        }
        return this.state.scatterRegions;
    }

    // Baum-Spezies je Scatter-Cell aus Feld-Bändern statt voller spawnAffinity (zu teuer × Tausende):
    // feucht → Erle/Birke, hoch lebendig → Buche/Eiche, sonst Tanne/Kiefer; der Hash streut die Varianz.
    _scatterSpeciesForCell(lebendig, moisture, hash) {
        const pick = (hash >>> 7) & 0xff;
        if (moisture > 0.6) {
            return pick < 128 ? "baum_erle" : "baum_birke";
        }
        if (lebendig > 0.62) {
            return pick < 110 ? "baum_buche" : pick < 200 ? "baum_eiche" : "baum_birke";
        }
        if (lebendig > 0.4) {
            // T1 (wahrerwuchs §4.1) — eine PALME in milder Zone (die Blatt-Typ-Vielfalt
            // sichtbar; selten → ein gefundener Hain, kein Klon-Teppich).
            if (pick >= 232) return "baum_palme";
            return pick < 120 ? "baum_eiche" : pick < 200 ? "baum_kiefer" : "baum_tanne";
        }
        // karger Boden → Nadelwald + Karst + (selten) säulen-förmige ZYPRESSE (Schuppen-Laub)
        if (pick < 140) return "baum_tanne";
        if (pick < 190) return "baum_kiefer";
        if (pick < 214) return "baum_zypresse"; // T1: mediterrane Säulen-Zypresse
        return "baum_karst";
    }

    // V18.225 — die Spezies-Wahl pro SCHICHT. Canopy nutzt den Baum-Picker; Understory verteilt
    // Strauch/Kraut/Bodenflora nach Feld (feucht → Farn, lebendig → Blume, sonst Hazel); Fels nach Hash.
    // Die Streu-Schicht „litter" (→ baum_totholz) fiel W1 final: das Studio hat keinen Totholz-Körper, sie
    // zeichnete eine belaubte 21-m-Eiche; die Grammatik-Art Totholz fiel 05.10. mit (kein Erzeuger mehr).
    _scatterSpeciesForLayer(kind, lebendig, moisture, hash) {
        if (kind === "under") {
            if (moisture > 0.55) return "farn_busch"; // Kraut-Stratum (feuchte Senken)
            if (lebendig > 0.5) return "blume_gross"; // Bodenflora (üppige Lichtungen)
            return "busch_hazel"; // Strauch-Stratum (Standard-Understory)
        }
        if (kind === "rock") {
            // V18.227 (Ω-OPSIS Säule II Ω-O5) — Fels-Stratum: meist Kiesel, an
            // exponierten Graten gelegentlich ein grösserer Felsbrocken (hash-
            // gewählt). stein_block bleibt der platzierbare Block (nicht gestreut).
            return hash % 100 < 12 ? "felsbrocken" : "kiesel";
        }
        return this._scatterSpeciesForCell(lebendig, moisture, hash); // Canopy
    }

    // Deterministische Cell-Transform — EINE Quelle für Streu UND Promotion, damit der promovierte Baum
    // bit-genau auf der Deko-Position landet. Je Schicht parametrisiert (cellM, scaleBase/scaleVar);
    // Default = Baum-Schicht (SCATTER.cellM).
    _scatterCellTransform(cellX, cellZ, cellM, scaleBase, scaleVar) {
        const cm = Number.isFinite(cellM) ? cellM : AnazhRealm.SCATTER.cellM;
        const sb = Number.isFinite(scaleBase) ? scaleBase : 0.7;
        const sv = Number.isFinite(scaleVar) ? scaleVar : 0.66;
        const jx = this._pcgFloat(cellX, cellZ, 1);
        const jz = this._pcgFloat(cellX, cellZ, 2);
        const x = (cellX + 0.15 + jx * 0.7) * cm;
        const z = (cellZ + 0.15 + jz * 0.7) * cm;
        const yawRoll = this._pcgFloat(cellX, cellZ, 3);
        const szRoll = this._pcgFloat(cellX, cellZ, 4);
        return { x, z, yaw: yawRoll * Math.PI * 2, scale: sb + szRoll * sv };
    }

    // Deko-Instanz in die GETEILTEN HISM-Gruppen (kein Architektur-Eintrag): derselbe
    // _archInstanceGroupFor/_archGroupAlloc-Pfad wie echte Bäume → ein Draw-Call, kein Sprung bei
    // Promotion. Liefert die belegten {key, slot}-Paare zum Freigeben.
    _scatterInstanceAdd(blueprintName, x, y, z, yaw, scale, tint, regionKey, flatOverride) {
        // `flatOverride` reicht einen FERTIGEN Foundry-Flat herein (dieselben leaves wie
        // _archFlattenBlueprint) — der Fern-Scatter serviert das Studio-Asset (nah = fern = Studio).
        // Ohne Override der Blueprint-Flat (Fels/Kiesel/Fallback).
        const flat = flatOverride || this._archFlattenBlueprint(blueprintName);
        if (!flat || !flat.instanceable || !Array.isArray(flat.leaves) || flat.leaves.length === 0) return null;
        const ew = this._archTmpScatterEntryM || (this._archTmpScatterEntryM = new THREE.Matrix4());
        const q = this._archTmpScatterQ || (this._archTmpScatterQ = new THREE.Quaternion());
        const e = this._archTmpScatterE || (this._archTmpScatterE = new THREE.Euler());
        const v = this._archTmpScatterV || (this._archTmpScatterV = new THREE.Vector3());
        const s = this._archTmpScatterS || (this._archTmpScatterS = new THREE.Vector3());
        e.set(0, yaw || 0, 0);
        q.setFromEuler(e);
        v.set(x, y, z);
        s.set(scale || 1, scale || 1, scale || 1);
        ew.compose(v, q, s);
        const m = this._archTmpScatterLeafM || (this._archTmpScatterLeafM = new THREE.Matrix4());
        const tintColor = this._archTmpScatterTint || (this._archTmpScatterTint = new THREE.Color());
        // PARITÄT: der Instanz-Tint MULTIPLIZIERT die Studio-Blattfarbe → neutral ist WEISS (1,1,1),
        // nicht 0.5-Grau (das war eine stille 50-%-Verdunkelung jeder tint-losen Instanz).
        if (tint) tintColor.setRGB(tint.h, tint.s, tint.v);
        else tintColor.setRGB(1, 1, 1);
        const slots = [];
        for (let i = 0; i < flat.leaves.length; i++) {
            const leaf = flat.leaves[i];
            // Auch der Schatten-Zwilling der gestreuten Gestalt wirft in der Gruppe der Streu-Stufe, nie in der des gesetzten
            // Walds: die Kaskade wählt Werfer je GRUPPE (ihre Hülle), eine geteilte Gruppe zeichnete die nahen gesetzten
            // Bäume auch in k1 (gemessen 05.10.: f:fichte k1 29k → 73k Dreiecke für 4 Befehle weniger).
            const g = this._archInstanceGroupFor(blueprintName, i, leaf, regionKey);
            // Kein Eintrag (slotEntry null = DEKO) → der Crosshair-Raycast ignoriert den Slot, bis er promoted wird.
            const ref = this._archGroupAlloc(g, null);
            const slot = ref.slot;
            m.multiplyMatrices(ew, leaf.localMatrix);
            g.mesh.setMatrixAt(slot, m);
            // Die mesh-level boundingSphere MUSS nach jedem Add auf null: THREE cacht sie sonst beim ersten
            // Cull, spät gestreamte Instanzen liegen außerhalb und die ganze Region cullt weg.
            // Slot-Farbe über den EINEN Chokepoint _archSlotColor (leaf.tint × Streu-Tint).
            const slotColor = this._archSlotColor(leaf, tintColor);
            g.mesh.instanceMatrix.needsUpdate = true;
            if (slotColor) {
                g.mesh.setColorAt(slot, slotColor);
                if (g.mesh.instanceColor) g.mesh.instanceColor.needsUpdate = true;
            }
            g.mesh.boundingSphere = null;
            // AUSLÖSCHUNGS-WELLE (Feld B) — die per-Instanz-Metrik stempeln (reverse-J-Skala), die Karte ihre Schicht.
            this._lodSlotStamp(g, slot, scale, false, leaf);
            slots.push(ref);
        }
        return slots;
    }

    // Welle B — JEDE leere Gruppe fällt (die Reap-Frage nach dem Schlüssel-Format ist gefallen): seit der platzierte
    // Bau global keyt, hätte die alte Ausnahme „Grammatik-Globale bleiben" jede leere Bau-Hülle als Szene-Kind für
    // immer stehen lassen. Der EINE Leer-Chokepoint (_archGroupLeerDispose) prüft liveCount 0 und gibt der Hülle im
    // Spiel die Gnadenfrist (kein Churn); Neuaufbau lazy via _archInstanceGroupFor.
    _scatterFreeSlots(slots) {
        if (!Array.isArray(slots)) return;
        const reap = [];
        for (const ref of slots) {
            const g = this.state.archInstanceGroups && this.state.archInstanceGroups.get(ref.key);
            if (g) {
                this._archGroupFree(g, ref);
                reap.push(ref.key);
            }
        }
        // SUBMIT-WAL (Flugschreiber-Befund: sceneChildren wächst monoton beim Wandern,
        // Schöpfer-Trace 481 archInstanceGroup-Kinder): geht der LETZTE Bewohner einer
        // geteilten/globalen Hülle, verlässt sie die Szene WIRKLICH — dieselbe Empty-
        // Dispose wie _archInstanceRemove (V4(B)); _disposeArchInstanceGroup ist
        // foundry-src-bewusst.
        // GNADENFRIST (18.07.) — der Leer-Dispose läuft durch den EINEN Chokepoint
        // (_archGroupLeerDispose): sofort headless (byte-alt), im echten Spiel erst
        // nach der Frist (der Churn-Befund: Familien oszillieren um liveCount 0).
        for (const key of reap) this._archGroupLeerDispose(key);
    }

    // Der EINE Leer-Chokepoint: headless reapt SOFORT; im Spiel bekommt die leere Hülle
    // ARCH_LEER_GNADE_MS — sonst macht jede Oszillation um liveCount 0 (Wandern/LOD) einen Voll-Dispose +
    // Re-Mint (Mesh, GPU-Puffer, Bundle, Pipeline). Kehrt ein Bewohner zurück, löscht _archGroupAlloc
    // _leerSeit; sonst räumt der Reaper-Tick. Die wartende Hülle zeichnet nicht (count 0, unsichtbar —
    // `_archGroupFree`); sie kostet nur ihren Puffer und ihren Platz im Bundle.
    _archGroupLeerDispose(key) {
        const g = this.state.archInstanceGroups && this.state.archInstanceGroups.get(key);
        if (!g || (g.liveCount || 0) > 0) return;
        const r = this.state.renderer;
        if (!r || r._isHeadlessNull) {
            this._disposeArchInstanceGroup(key);
            return;
        }
        if (!g._leerSeit) g._leerSeit = performance.now();
        (this._archLeerKandidaten || (this._archLeerKandidaten = new Set())).add(key);
    }
    // Der Reaper (1×/s aus dem Loop): räumt Kandidaten, deren Frist ablief;
    // wiederbelebte (liveCount > 0 bzw. _leerSeit gelöscht) fallen still raus.
    _tickArchGruppenReaper(now) {
        const kand = this._archLeerKandidaten;
        if (!kand || !kand.size) return;
        if (this._archLeerReapT && now - this._archLeerReapT < 1000) return;
        this._archLeerReapT = now;
        const gnade = AnazhRealm.ARCH_LEER_GNADE_MS;
        const groups = this.state.archInstanceGroups;
        for (const key of Array.from(kand)) {
            const g = groups && groups.get(key);
            if (!g) {
                kand.delete(key);
                continue;
            }
            if ((g.liveCount || 0) > 0 || !g._leerSeit) {
                g._leerSeit = 0; // wiederbelebt — die Frist beginnt beim nächsten Leerstand neu
                kand.delete(key);
                continue;
            }
            // Die Churn-Linse ist Aktuator: ein bekannter Wiederkehrer (Mint-Zahl ≥ 2) bekommt Frist × Mints,
            // gedeckelt ×6 (60 s). Eine leere Hülle im Bundle ist ≈ frei; der Reaper bleibt die harte Schranke.
            const _mc = (this._archGruppenMintMap && this._archGruppenMintMap.get(key)) || 1;
            if (now - g._leerSeit >= gnade * Math.min(6, Math.max(1, _mc))) {
                this._disposeArchInstanceGroup(key);
                kand.delete(key);
            }
        }
    }

    // Die EINE Streu-Dichte-Quelle: im Studio-Regime VOLLE Dichte (1), sonst der Perf-Regler
    // _foliageDensityScale. ALLE Leser (_scatterPass · builtDensity in _scatterRegion ·
    // _tickFoliageThin) lesen DIESE Quelle — sonst dünnt der Regler eine bei roh=1 verbuchte Region und
    // baut sie identisch neu (Dispose+Rebuild-Endlosschleife).
    _effectiveFoliageDensity() {
        if (typeof this._foundryEnabled === "function" && this._foundryEnabled()) return 1;
        return this.state._foliageDensityScale != null ? this.state._foliageDensityScale : 1;
    }

    // Scatter-Generator einer Region: Cell-Raster gegen die gebackenen Felder, Deko-Instanzen in die
    // HISM-Gruppen; deterministisch (pcg2d), bounded durch perRegionCap; Cells im promoteRadius und
    // promotete Cells übersprungen. Mit `deadlineMs` in Zeit-Scheiben: Fortsetzung in `region._cont`
    // (Phase, Zeiger + Snapshot der Bau-Eingänge). Jeder Wurf ist positions-gehasht, nur emitted<cap ist
    // ordnungs-gekoppelt → cz-major/cx-minor bewahrt ⇒ byte-gleich zum One-Shot (gate:scatter-slice).
    _scatterRegion(regX, regZ, playerPos, deadlineMs) {
        if (typeof THREE === "undefined" || !this.state.scene) return null;
        const SC = AnazhRealm.SCATTER;
        const map = this._ensureScatterRegionMap();
        const key = `${regX},${regZ}`;
        const _existing = map.get(key);
        if (_existing && !_existing._cont) return _existing;
        if (_existing && _existing._cont) return this._scatterRegionWork(_existing, regX, regZ, key, deadlineMs);
        // Die Region baut, was warm ist, und wartet nur auf IHR Asset: eine kalte Zelle bestellt es (`_foundryFlattenFor`) und
        // schiebt die Region auf, die Lieferung baut sie neu (`_scatterRefillPending`). Bis K30 wartete sie leer auf den
        // ganzen Vorrat (Wagen, Siedlungs-Probe) — und nach seinem Ende weckte sie keine Lieferung: an der Radeon standen
        // 4 Wald-Stücke 15 s still, das erste Weltbild kam ohne Streu.
        // V18.280 — die Dichte, bei der diese Region gebaut wurde (für das Nach-Dünnen:
        // sinkt die perf-geregelte Dichte unter diesen Wert, wird die Region re-gestreamt).
        // W1 — die Buchhaltung liest den ANGEWANDTEN Wert (die eine Quelle), nie den rohen.
        const region = {
            regX,
            regZ,
            cells: [],
            instanceCount: 0,
            byLayer: {},
            builtDensity: this._effectiveFoliageDensity(),
            // V18.300 — Schnappschuss: in welchem Modus wurde diese Region gebaut?
            // _disposeScatterRegion liest IHN (nicht das Live-Flag) → ein Laufzeit-
            // Toggle bleibt sauber (alte Regionen entsorgen sich nach ihrer Bauweise).
            regional: this.state.useRegionFoliageCull !== false,
        };
        if (Number.isFinite(deadlineMs)) {
            // Scheiben-Modus: der SNAPSHOT der bau-zeitlichen Eingänge — die Fortsetzung
            // liest IHN, nie die Live-Werte (sonst driftete der emitted-Satz gegen den
            // One-Shot, wenn Spieler/Regler zwischen zwei Scheiben wandern).
            region._cont = {
                phase: "bake",
                bakeEntry: null,
                bakeJ: null,
                layerIdx: 0,
                cz: 0,
                cx: 0,
                emitted: 0,
                hit: false,
                px: playerPos ? playerPos.x : 0,
                pz: playerPos ? playerPos.z : 0,
                fdScale: this._effectiveFoliageDensity(),
            };
        }
        map.set(key, region); // ab jetzt sichtbar — Fortsetzung/Dispose finden sie
        return this._scatterRegionWork(region, regX, regZ, key, deadlineMs, playerPos);
    }

    // Die Bau-Arbeit (One-Shot UND Scheiben-Fortsetzung, EIN Chokepoint): Bake-Phase (j-Zeilen) →
    // Schicht-Pässe. Bei erschöpfter Deadline zurück mit stehendem `region._cont`; der nächste Aufruf
    // (finish-first im Streaming-Tick) setzt exakt fort.
    // DIE REGION SAMMELT IHRE ZUSAGEN (K60-2): solange ihre Scheibe läuft, ist sie der Wartende (`_streuSammler`) — jede
    // Zusage, auf die eine ihrer Zellen wartet (Zug, Buch, Karte: `_streuWartetAuf`), landet in ihrem Satz; vollendet und
    // aufgeschoben spannt sie ihren Wecker (`_streuWeckerSpannen`).
    _scatterRegionWork(region, regX, regZ, key, deadlineMs, playerPos) {
        this._weltRegt(); // jede Scheibe setzt Streu-Zellen: die Stand-Wache weckt die Fege-Takte
        const vorher = this._streuSammler;
        this._streuSammler = region._zusagen || (region._zusagen = new Set());
        try {
            const r = this._scatterRegionScheibe(region, regX, regZ, key, deadlineMs, playerPos);
            if (!region._cont && region._deferredFoundry) this._streuWeckerSpannen(region);
            return r;
        } finally {
            this._streuSammler = vorher;
        }
    }

    // DER WECKER DER AUFGESCHOBENEN REGION (K60-2): sie baut neu, wenn JEDE ihrer Zusagen kam (`region._geweckt`) — nie bei
    // jeder fremden Lieferung. Bis K60-2 warf jede Ankunft eines Körpers oder einer Karte jede aufgeschobene Region weg, und
    // die vier Wald-Stücke der Ankunft streuten ab dem Buch bis zum Bild immer neu (Radeon kalt, K602b/s2-1D: Streu 0,1–0,6 s
    // je Sekunde von 3 s bis 17 s). Wartet sie auf nichts Benanntes (die Wahrheit des Walds), weckt sie jede Lieferung wie zuvor.
    _streuWeckerSpannen(region) {
        const zusagen = region._zusagen;
        region._zusagen = null;
        region._geweckt = false;
        if (!zusagen || zusagen.size === 0) {
            region._geweckt = true;
            return;
        }
        let offen = zusagen.size;
        const kam = () => {
            if (--offen > 0) return;
            region._geweckt = true;
            this._scatterRefillPending = true;
        };
        for (const z of zusagen) z.then(kam, kam);
    }

    // Ein Wartender der Streu-Scheibe meldet seine Zusage (der Zug eines Körpers, das Buch, die Karte) — nur, solange eine
    // Region streut (`_streuSammler`); jeder andere Leser fragt wie bisher.
    _streuWartetAuf(zusage) {
        const s = this._streuSammler;
        if (s && zusage && typeof zusage.then === "function") s.add(zusage);
    }

    _scatterRegionScheibe(region, regX, regZ, key, deadlineMs, playerPos) {
        const SC = AnazhRealm.SCATTER;
        const cont = region._cont || null;
        if (cont && cont.phase === "bake") {
            const bcfg = this._bakeRegionConfig();
            const done = this._bakeRegionFields(
                Math.floor((regX * SC.regionM) / bcfg.sizeM),
                Math.floor((regZ * SC.regionM) / bcfg.sizeM),
                cont,
                deadlineMs
            );
            if (!done) return region; // Bake-Scheibe voll — der nächste Frame setzt fort
            cont.phase = "cells";
        }
        const worldSeed = (this.state.worldMeta && this.state.worldMeta.seed) || "anazh-realm-seed";
        let seedHash = 2166136261 >>> 0;
        for (let i = 0; i < worldSeed.length; i++) seedHash = ((seedHash ^ worldSeed.charCodeAt(i)) * 16777619) >>> 0;
        // V18.225 — die Strata über drei Pässe (Canopy · Understory · Fels).
        // Jeder Pass sein eigenes Zell-Raster + Cap. Die Pässe teilen
        // die gebackenen Felder + die Bitmask + die HISM-Gruppen.
        const layers = SC.layers || [
            {
                name: "tree",
                cellM: SC.cellM,
                cap: SC.perRegionCap,
                floor: SC.densityFloor,
                scaleBase: 0.7,
                scaleVar: 0.66,
                slopeMax: SC.slopeMax,
                kind: "tree",
                promotable: true,
            },
        ];
        const startLayer = cont ? cont.layerIdx : 0;
        for (let li = startLayer; li < layers.length; li++) {
            const layer = layers[li];
            if (cont) cont.layerIdx = li;
            const n = this._scatterPass(region, layer, regX, regZ, seedHash, playerPos, cont, deadlineMs);
            if (cont && cont.hit) {
                cont.hit = false;
                return region; // Zellen-Scheibe voll — cont trägt cz/cx/emitted exakt
            }
            region.byLayer[layer.name] = n;
            region.instanceCount += n;
            if (cont) {
                cont.cz = 0;
                cont.cx = 0;
                cont.emitted = 0; // die nächste Schicht beginnt frisch
            }
        }
        region._cont = null; // vollendet
        return region;
    }

    // V18.225 — EIN Scatter-Pass für eine Schicht (Plan §13 5-Strata). Walkt das
    // schicht-eigene Zell-Raster, gated gegen die gebackenen Felder, schreibt
    // Deko-Instanzen in die GETEILTEN HISM-Gruppen. Deterministisch (pcg2d).
    _scatterPass(region, layer, regX, regZ, seedHash, playerPos, cont, deadlineMs) {
        const SC = AnazhRealm.SCATTER;
        // Die Streu-Zelle ist ein Wurf des Feldes: trägt die Wildnis die Region nicht, entsteht keine (und keine Promotion).
        if (!this._wildnisTraegt((regX + 0.5) * SC.regionM, (regZ + 0.5) * SC.regionM)) return 0;
        const cellM = layer.cellM;
        const cellsPerRegion = Math.round(SC.regionM / cellM);
        const baseCellX = Math.round((regX * SC.regionM) / cellM);
        const baseCellZ = Math.round((regZ * SC.regionM) / cellM);
        // W3.3c — im Scheiben-Modus lesen die Distanz-Gates den SNAPSHOT (cont.px/pz),
        // nie die Live-Position — sonst driftete der emitted-Satz gegen den One-Shot.
        const px = cont ? cont.px : playerPos ? playerPos.x : 0;
        const pz = cont ? cont.pz : playerPos ? playerPos.z : 0;
        // DAS AUGE DER STUFEN (K36): der Ring streamt um den Spieler (seine Distanz-Gates oben), die Stufe der Geburt und
        // ihr Band-Partner messen vom Auge der Maske (`_lodAuge`) wie der Takt (`_tickScatterLod`) — sonst trug die Geburt in
        // der Verfolger-Kamera die Wahl der Spieler-Distanz, bis der Takt die Zelle besuchte.
        const auge = this._lodAuge() || { x: px, z: pz };
        const N = AnazhRealm.VARIANTS_PER_SPECIES;
        const slopeMax = Number.isFinite(layer.slopeMax) ? layer.slopeMax : SC.slopeMax;
        const floor = Number.isFinite(layer.floor) ? layer.floor : SC.densityFloor;
        // Salt pro Schicht (eigener Hash-Stream — kein Re-Roll der Baum-Schicht).
        let layerSalt = 0;
        for (let i = 0; i < layer.name.length; i++) layerSalt = (layerSalt * 131 + layer.name.charCodeAt(i)) >>> 0;
        // Der Dichte-Faktor lichtet Platzierungs-Wahrscheinlichkeit UND Pro-Region-Cap — sonst blieben
        // cap-saturierte dichte Wälder unter Last unverändert. Quelle: _effectiveFoliageDensity (Studio-Regime
        // = 1); im Scheiben-Modus der bau-zeitliche Snapshot (kein Regler-Drift zwischen Scheiben).
        const fdScale = cont && cont.fdScale != null ? cont.fdScale : this._effectiveFoliageDensity();
        const cap = Math.max(1, Math.round(layer.cap * fdScale));
        let emitted = cont ? cont.emitted : 0;
        const _czStart = cont ? cont.cz : 0;
        const _cxFirst = cont ? cont.cx : 0;
        const _dlOn = cont && Number.isFinite(deadlineMs);
        let _dlCheck = 0;
        for (let cz = _czStart; cz < cellsPerRegion && emitted < cap; cz++) {
            for (let cx = cz === _czStart ? _cxFirst : 0; cx < cellsPerRegion && emitted < cap; cx++) {
                // Scheiben-Schnitt VOR der Zellen-Arbeit (alle ~64 Zellen): Zelle (cz,cx) ist noch unberührt, die
                // Fortsetzung beginnt exakt hier ⇒ emitted<cap zählt byte-identisch zum One-Shot.
                if (_dlOn && (++_dlCheck & 63) === 0 && performance.now() > deadlineMs) {
                    cont.cz = cz;
                    cont.cx = cx;
                    cont.emitted = emitted;
                    cont.hit = true;
                    return emitted;
                }
                const cellX = baseCellX + cx;
                const cellZ = baseCellZ + cz;
                const h = this._pcg2d((cellX ^ seedHash ^ layerSalt) >>> 0, (cellZ * 2654435761) >>> 0);
                const tf = this._scatterCellTransform(cellX, cellZ, cellM, layer.scaleBase, layer.scaleVar);
                const dx = tf.x - px;
                const dz = tf.z - pz;
                const dist = Math.sqrt(dx * dx + dz * dz);
                if (dist < SC.innerM) continue;
                if (dist > SC.outerM) continue;
                // promotete Cell DIESER Schicht → skip (Understory/Streu sind nie
                // promotable → ihre Bitmask bleibt leer; die Baum-Schicht schützt
                // ihre realen Bäume)
                if (this._scatterIsCellPromoted(tf.x, tf.z, layer.name)) continue;
                // Gate-Ordnung: billiges Feld zuerst, dann Slope, erst DANN das teure exakte Wasser-Verdikt (steile
                // Zellen sparen den _voxelSurfaceY-Scan). Zwischen den Gates zieht nichts aus dem RNG → identischer
                // Satz (gate:scatter-ab). Das Wasser-Verdikt bleibt die EXAKTE Spalten-Probe `_nassAt`: das Feld weicht
                // bis ~48 m ab (Content-Drift). `state.__scatterExactWater` erzwingt die Legacy-Ordnung (A/B-Ufer).
                const _legacyOrder = this.state.__scatterExactWater === true;
                if (_legacyOrder && !this._landAt(tf.x, tf.z, 0.4)) continue;
                const field = this._sampleBakedField ? this._sampleBakedField(tf.x, tf.z) : null;
                let lebendig, slope, moisture, surfY;
                if (field) {
                    lebendig = field.lebendig;
                    slope = field.slope;
                    moisture = field.moisture;
                    surfY = field.height;
                } else {
                    const f = this.worldFieldAt ? this.worldFieldAt(tf.x, tf.z) : null;
                    lebendig = f ? f.lebendig : 0;
                    // V18.351 — die EINE Slope-Quelle statt `slope = 0` (der alte Fallback ließ Fels OHNE
                    // gebackenes Feld NIE durchbrechen [exposure∝slope] UND nie skippen [slope>slopeMax]).
                    slope = this._slopeAt ? this._slopeAt(tf.x, tf.z) : 0;
                    surfY = this._voxelSurfaceY ? this._voxelSurfaceY(tf.x, tf.z) : 0;
                    moisture = this._feuchteAt ? this._feuchteAt(tf.x, tf.z, surfY) : 0;
                }
                if (slope > slopeMax) continue;
                if (!_legacyOrder && !this._landAt(tf.x, tf.z, 0.4)) continue;
                let prob;
                if (layer.kind === "rock") {
                    // rockExposure: Fels bricht an STEILEN, TROCKENEN, KAHLEN Hängen durch — slope hebt, (1−moisture)
                    // hebt leicht, lebendig senkt stark (kein Kiesel in der saftigen Wiese).
                    const exposure = slope * 1.1 + (1 - moisture) * 0.25 - lebendig * 0.5 - 0.15;
                    const dScale = Number.isFinite(layer.densityScale) ? layer.densityScale : SC.densityScale;
                    prob = Math.min(0.85, floor + Math.max(0, exposure) * dScale);
                } else {
                    prob = Math.min(0.95, floor + lebendig * SC.densityScale);
                }
                // V18.277 — die kapazitäts-gewachsene Dichte lichtet auch die Platzierungs-
                // WAHRSCHEINLICHKEIT (zusätzlich zum Cap oben) → unter Last weniger Instanzen.
                if (this._pcgFloat(cellX ^ layerSalt, cellZ, 9) >= prob * fdScale) continue;
                const species = this._scatterSpeciesForLayer(layer.kind, lebendig, moisture, h);
                const variantIndex = h % N;
                // V18.387 — Baum-Schichten (nicht Fels/Kiesel) reichen die Sichthöhe
                // durch → die Erst-LOD-Wahl nutzt die Wahrnehmungs-Distanz.
                const visH = this._scatterSichtHoehe(layer, species, cellX, cellZ, variantIndex, tf);
                if (visH === null) {
                    // die Höhen-Stufe des Foundry-Baums lädt: die Region wartet wie auf ein ladendes Asset
                    region._deferredFoundry = true;
                    continue;
                }
                const distAuge = Math.hypot(tf.x - auge.x, tf.z - auge.z); // die Stufen-Distanz: vom Auge (K36)
                const lod = this._chooseLODForDistance(distAuge, undefined, visH);
                // Trägt die Foundry die Baum-Art, serviert der Scatter IHR Asset (fern = Studio-Billboard, nah =
                // Studio-Geometrie) — nie ein paralleles Grammatik-Baum-System (Doppel-Bake + Look-Bruch nah/fern).
                // Foundry-gegated; headless (Foundry aus) bleibt Grammatik. Die Zelle setzt durch die EINE Natur-Wand
                // (`_naturSetzen`, mit Art und Größe — ihre Krone): im Grundriss eines Hauses und über der Genesis-Lichtung
                // wird sie nie Streu.
                const rec = this._naturSetzen(species, tf, tf, () =>
                    this._scatterMaterializeCell(
                        region,
                        layer,
                        layerSalt,
                        cellX,
                        cellZ,
                        cellM,
                        tf,
                        distAuge,
                        surfY,
                        species,
                        variantIndex,
                        visH,
                        lod,
                        regX,
                        regZ,
                        false
                    )
                );
                if (!rec) continue;
                region.cells.push(rec);
                // Lookup nur für die promotable (Baum-)Schicht — die Promotion liest ihn; ihre Krone streut Laub.
                if (layer.promotable) {
                    this._scatterRegisterCell(tf.x, tf.z, layer.name, species, variantIndex);
                    // Der Kronen-Radius: der des Wald-Generators für die Art (× Skala), sonst aus der Sichthöhe.
                    const kc = AnazhRealm.FOREST.crown[species];
                    const kr = kc
                        ? kc * tf.scale
                        : Number.isFinite(visH)
                          ? visH * AnazhRealm.LAUB_STREU.kroneJeHoehe
                          : 0;
                    this._kronenStreuNeu(`s:${layer.name}:${cellX},${cellZ}`, tf.x, tf.z, kr);
                }
                emitted++;
            }
        }
        return emitted;
    }

    // Der rohe Same einer Streu-Zelle (Γ5: aus Zelle + Varianten-Index, nie Zufall) — die Klon-Linse (gate:fluss) misst
    // seine Verteilung über die Gestalten.
    _scatterRohSame(cellX, cellZ, variantIndex) {
        return ((cellX * 73856093) ^ (cellZ * 19349663) ^ (variantIndex + 1)) >>> 0;
    }
    // Der EINE Foundry-Same einer Streu-Zelle: die Materialisierung (Primär-Stufe · Gesetz-Bahn · Band-Partner), die
    // Sichthöhe der Stufenwahl und die Promotion zum echten Eintrag lesen ihn — die Gestalt (`_foundryVariantFor`) bleibt
    // beim Kristallisieren dieselbe. Die Gestalt folgt dem Ort (K20): der Streu-Baum am Ort tf (x, z, scale) fragt die EINE
    // Gestalt des Orts (`_ortGestaltSame`) wie der gepflanzte, null = sie wartet auf die Wahrheit ihres Orts. Ohne Foundry
    // trägt die Zelle keine Gestalt (Grammatik) — dieselbe Regel wie ihr Bau (`_scatterMaterializeCell`): der rohe Same.
    _scatterFoundrySeed(cellX, cellZ, variantIndex, species, tf) {
        const roh = this._scatterRohSame(cellX, cellZ, variantIndex);
        const preset = this._foundryEnabled() ? this._foundryPresetFor(species) : null;
        if (!preset) return roh;
        const krone = AnazhRealm.FOREST.crown[species];
        return this._ortGestaltSame(tf.x, tf.z, krone > 0 ? krone * tf.scale : 0, roh, preset);
    }

    // Die Sichthöhe einer Streu-Zelle für die Stufenwahl: Fels 0 (roh), ein Foundry-Baum der Stempel seines Assets
    // (_foundrySichtHoehe — dieselbe Zahl, die seine Masken lesen; null = die Höhen-Stufe lädt, die Zelle wartet),
    // sonst der Grammatik-Bauplan.
    _scatterSichtHoehe(layer, species, cellX, cellZ, variantIndex, tf) {
        if (layer.kind === "rock") return 0;
        const preset = this._foundryEnabled() ? this._foundryPresetFor(species) : null;
        if (preset && this._foundryPresetIsTree(preset)) {
            const seed = this._scatterFoundrySeed(cellX, cellZ, variantIndex, species, tf);
            // DER RANG DER STREU (R1): jede Bestellung einer Zelle trägt ihren Ort als `wo` (der Rang der Foundry-Schlange,
            // `_foundryAuftragD2`), nie als `position` (die Gestalt bleibt die des Samens, `_foundryGestaltFor`). Ohne ihn stand
            // der Wald der Spieler-Region im Vorrats-Rang (d² = ∞) hinter jedem Haus und Fels der Mesh-Zone: GTX kalt am Kopf
            // 985a923b wartete die Streu 3–5 s in der Schlange und war der letzte Term des ersten Weltbilds.
            return seed === null ? null : this._foundrySichtHoehe(preset, { seed, wo: tf }, tf.scale);
        }
        return this._lodTreeVisHeightFor(species, variantIndex, tf.scale);
    }

    // Die EINE Zellen-Materialisierung (gate:scatter-ab ist die Byte-Wand): baut für eine Streu-Zelle die
    // Instanz-Slots (Foundry-Flat oder Grammatik, inkl. Band-Partner + Tint) auf der gewünschten Stufe
    // → Zellen-Datensatz oder null (deferriert/ungemappt). Leser: Region-Bau + _tickScatterLod.
    // ctxNoDefer: der LOD-Tick markiert die Region NICHT als deferriert (alte Stufe bleibt, Retry).
    _scatterMaterializeCell(
        region,
        layer,
        layerSalt,
        cellX,
        cellZ,
        cellM,
        tf,
        dist,
        surfY,
        species,
        variantIndex,
        visH,
        lod,
        regX,
        regZ,
        ctxNoDefer
    ) {
        let bpName = null,
            foundryFlat = null;
        // EINE Quelle je Streu-Art: kennt die lebende Foundry die Art (Baum, Fels, Kiesel, Blume, Strauch),
        // kommt das ECHTE Studio-Asset — oder solange es lädt, bei Bäumen das Studio-Billboard (LOD2).
        // Ist beides nicht bereit: DEFERRIEREN, NIE Grammatik als Lückenbüßer. Nur eine wirklich
        // ungemappte Art fällt auf Grammatik (dort die einzige Quelle); Foundry aus → alles Grammatik.
        const foundryPreset = this._foundryEnabled() ? this._foundryPresetFor(species) : null;
        // Der EINE Streu-Same der Zelle (`_scatterFoundrySeed`): Primär-Stufe, Gesetz-Bahn, Band-Partner und die
        // Promotion lesen ihn — dieselbe Gestalt auf jeder Bahn.
        const fseed = foundryPreset ? this._scatterFoundrySeed(cellX, cellZ, variantIndex, species, tf) : 0;
        const gestalt = foundryPreset && fseed !== null ? this._foundryVariantFor(fseed, foundryPreset) : null;
        if (foundryPreset && gestalt == null) {
            if (!ctxNoDefer) region._deferredFoundry = true; // Buch kalt → deferrieren wie ein ladendes Asset
            return null;
        }
        if (foundryPreset) {
            const preset = foundryPreset;
            // DIE FERNFORM VOR JEDEM MESH-ZUG (Studio-Vertrag B2c `lod.budget[kind].fernform`, `_foundryFernForm`): mit
            // Fern-Wunsch IST die Art, was ihr Budget sagt — "karte" geht den Mesh-Pfad unten (die Karten-Stufe),
            // "gesetz" ist ihr PLATZ im Gesetz-Block ihrer Kachel (die Passung der Studio-Gestalt, kein Feld-Listen-
            // Slot je Instanz), "boden" ist keine Geometrie (die Boden-Funktion trägt). Steht der Satz nicht (Fit-
            // Takt, Gesetz-Bahn ohne echten Renderer, erschöpfte Kapsel-Liste — die meldet sich laut), WARTET die
            // Zelle ohne Geometrie und der LOD-Tick wiederholt — nie das geklemmte L0 über die Instanz-Bahn (bis
            // V18.526 der stille Rückfall: headless an der Mess-Wiese 1564 Blume/Geröll-L0-Instanzen jenseits 29,4 m).
            // Die Fernform gilt erst jenseits der EINEN Nah-Grenze (`_streuFernBahn`, ANALOG_NAH_M): diesseits ist auch
            // der Fern-Wunsch das Studio-Mesh der Art, nie ein Kapsel-Satz und nie ein Loch.
            const fern = this._streuFernBahn(preset, lod, dist);
            if (fern) {
                // Die Streu trägt "gesetz" und "boden"; eine gestreute Art mit anderer Fernform ("huelle" gehört dem gesetzten
                // Bau, `_archFoundryZiegel`) hat hier keinen Leser — laut, nie still als Boden.
                if (fern !== "gesetz" && fern !== "boden")
                    return AnazhRealm._kernPflichtBruch(
                        "phyto:lod.budget fernform " + fern + " in der Streu (" + preset + ")"
                    );
                const feld =
                    fern === "gesetz" && this._weltMarchGezeichnet()
                        ? this._streuGesetzSpawn(
                              preset,
                              fseed,
                              tf.x,
                              Number.isFinite(surfY) ? surfY : 0,
                              tf.z,
                              tf.yaw || 0,
                              tf.scale || 1
                          )
                        : null;
                return {
                    cellX,
                    cellZ,
                    cellM,
                    layer: layer.name,
                    promotable: layer.promotable === true,
                    species,
                    variantIndex,
                    lod: 2,
                    form: fern,
                    wartet: fern === "gesetz" && !feld,
                    bpName: (fern === "gesetz" ? "agesetz:" : "boden:") + preset + ":" + gestalt,
                    slots: [],
                    feld,
                    x: tf.x,
                    z: tf.z,
                    scale: tf.scale, // die Größe der Zelle: ihre Krone (`_naturKrone`, die Natur-Wand räumt die Lichtung)
                    gestalt,
                    yaw: tf.yaw,
                };
            }
            let ff = this._foundryFlattenFor({ seed: fseed, wo: tf }, preset, lod);
            if (
                !(ff && ff.instanceable && Array.isArray(ff.leaves) && ff.leaves.length) &&
                this._foundryPresetIsTree(preset)
            ) {
                // Nur Bäume haben ein gebackenes Fern-Billboard (LOD2). Der LOD-Tick (ctxNoDefer) nimmt den
                // Billboard-Fallback für einen NAH-Wunsch (lod<2) nicht an — sonst friert die Zelle als
                // Nah-Billboard ein, das der vLodD-Dither nah ausmaskiert (Loch statt Baum).
                if (ctxNoDefer && lod < 2) return null;
                const imp = this._foundryFlattenFor({ seed: fseed, wo: tf }, preset, 2);
                if (imp && imp.instanceable && Array.isArray(imp.leaves) && imp.leaves.length) ff = imp;
            }
            if (ff && ff.instanceable && Array.isArray(ff.leaves) && ff.leaves.length) {
                foundryFlat = ff;
                bpName = "fscatter:" + preset + ":" + gestalt + ":" + ff.lod;
            } else {
                // Studio-Asset noch nicht da → DEFERRIEREN (KEIN Grammatik-Nachbau). Die Region merkt
                // sich das → `_tickScatterFoundryRefill` streamt sie neu, sobald das Studio liefert.
                if (!ctxNoDefer) region._deferredFoundry = true;
                return null;
            }
        }
        if (!bpName) {
            // Nur eine UNGEMAPPTE Art erreicht das (ihre Grammatik ist die einzige Quelle). Sicherheits-Wand:
            // bei lebender Foundry rendert KEIN Baum Grammatik (gate:no-second-treebuilder).
            if (layer.kind === "tree" && this._foundryEnabled()) return null;
            const keys = this._buildVariantLODs(species, variantIndex);
            if (!keys) return null;
            bpName = keys[lod] || keys[0];
        }
        // Instanz-Tint NEUTRAL-NAH: ±8 % Luminanz + ein Hauch warm/kühl, nie ein Farbwurf — die Felder
        // h/s/v werden als r/g/b konsumiert (_scatterInstanceAdd) und multiplizieren die Studio-Blattfarbe.
        // Vielfalt kommt aus den gewachsenen Varianten.
        const _tl = 0.92 + this._pcgFloat(cellX ^ layerSalt, cellZ, 5) * 0.16; // Luminanz 0.92..1.08
        const _tw = (this._pcgFloat(cellX ^ layerSalt, cellZ, 6) - 0.5) * 0.06; // warm/kühl ±3 %
        const tint = {
            h: Math.min(1.08, _tl + _tw),
            s: _tl,
            v: Math.min(1.08, Math.max(0, _tl - _tw)),
        };
        const slots = this._scatterInstanceAdd(
            bpName,
            tf.x,
            Number.isFinite(surfY) ? surfY : 0,
            tf.z,
            tf.yaw,
            tf.scale,
            tint,
            // V18.300 — der REGION-Key (regX,regZ) macht die Streu-Gruppe lokal +
            // frustum-cullbar. V18.303 — das Per-Region-Keying half beim Drehen, aber
            // es sprengte die Draw-Calls (426→1693, allein ~1000 winzige LOD2-Fern-
            // Gruppen mit ~2 Instanzen, GEMESSEN) → LOD1/2 wurden GLOBAL.
            // V18.390 (Eins W2 — der Wald-Kollaps, diff-A1 §5D): die VORLAGEN-WEISHEIT
            // „Bäume GLOBAL instanziert, NUR der Boden gekachelt" — die tree-Schicht
            // geht auf ALLEN LODs global (wenige große Gruppen statt N Regionen ×
            // Varianten × Leaves; tragbar, weil A+C die Gruppen-Zahl gesenkt haben).
            // Boden-Schichten (under/rock) BLEIBEN region-gekachelt — sie
            // tragen die V18.300-Cull-Rate (diag-turn-cull bleibt die Wand).
            // DAS FELD URTEILT (das-feld-zeichnet §2 Stufe 1) — der Dither-Wal fällt.
            // MESSGRUND (V18.481-Trace): 7 anonyme Fern-Batches, 1188 Tris/Instanz,
            // frustumCulled=false — der Shader-Dither cullt nur FRAGMENTE, die
            // Vertex-Arbeit blieb für JEDE residente Instanz voll. Darum reicht
            // jetzt JEDE Stufe der Nicht-Baum-Layer den Region-Key: die Fern-Stufe
            // kollabiert am Keying-Chokepoint auf die SUPER-REGION (_archFernRegionKey
            // matcht fscatter:*:2/_lod2 → `@s:` — keine V18.303-DC-Explosion),
            // L0/L1 bleiben region-privat (`@regX,regZ`); regional=true gibt
            // frustumCulled/Bundle-Cull, _disposeScatterRegion + Empty-Reap halten
            // die Counts. Bäume bleiben GLOBAL (V18.390-Weisheit — ihr Fern-Wal
            // ist per _tickScatterLod aufs Billboard geheilt).
            this.state.useRegionFoliageCull !== false && layer.kind !== "tree" ? regX + "," + regZ : null,
            foundryFlat // V18.393 — Foundry-Flat (oder null → Grammatik-Fallback)
        );
        if (!slots) return null;
        // Der Foundry-Baum an einer Stufen-Kante wohnt in BEIDEN Stufen — dieselbe Partner-Quelle wie die
        // Architektur (_lodBandPartnerFor); Partner-Slots reisen in cell.slots (Region-Dispose räumt beide). Steht der
        // Partner nicht (er lädt, die Karte bäckt), HÄLT die Primär-Stufe voll (K36, `_lodSlotStamp`): die Zelle merkt
        // Wunsch und Halt, der LOD-Tick pflegt das Band (`_streuBandWechsel`).
        let bandDient = null,
            bandWunsch = null,
            bandHalt = false;
        if (
            foundryFlat &&
            this.state.foundryCrossfade === true &&
            foundryPreset &&
            this._foundryPresetIsTree(foundryPreset)
        ) {
            const _curLod = Number.isFinite(foundryFlat.lod) ? foundryFlat.lod : lod;
            bandDient = _curLod;
            const _partner = this._lodBandPartnerFor(dist, visH, _curLod, tf.scale);
            if (_partner != null && _partner !== _curLod) {
                bandWunsch = _partner;
                const pf0 = this._foundryFlattenFor({ seed: fseed, wo: tf }, foundryPreset, _partner);
                const pf = pf0 && pf0.instanceable ? this._bandOhneZwilling(pf0, foundryFlat) : pf0;
                bandHalt = !(pf && pf.instanceable) ? (pf0 === null ? "wartet" : true) : false;
                if (pf && pf.instanceable && Array.isArray(pf.leaves) && pf.leaves.length && pf.lod !== _curLod) {
                    const pSlots = this._scatterInstanceAdd(
                        "fscatter:" + foundryPreset + ":" + gestalt + ":" + pf.lod,
                        tf.x,
                        Number.isFinite(surfY) ? surfY : 0,
                        tf.z,
                        tf.yaw,
                        tf.scale,
                        tint,
                        null, // Bäume sind GLOBAL instanziert (V18.390-Weisheit)
                        pf
                    );
                    if (pSlots) for (const ps of pSlots) slots.push(ps);
                    else bandHalt = true;
                }
            }
            // die Primär-Slots (die Liste trägt bis hier nur sie, der Partner hängt dahinter) halten voll
            if (bandHalt) for (const ref of slots) this._streuSlotHalt(ref, tf.scale);
        }
        return {
            dient: bandDient, // die gelieferte Stufe des Bands (K36)
            bandWunsch,
            halt: bandHalt,
            cellX,
            cellZ,
            cellM,
            layer: layer.name,
            promotable: layer.promotable === true,
            species,
            variantIndex,
            // Der WUNSCH (die Distanz-Stufe) ist der Hysterese-Zustand — eine Stufen-Klammer (Fels [0], Strauch
            // [1,2]) friert die Zelle sonst auf ihrer gelieferten Stufe ein, und der Fern-Wunsch käme nie an. Einzig
            // das Boot-Billboard (Karte für einen Nah-Wunsch, solange die Gestalt lädt) trägt lod=2: der LOD-Tick heilt
            // die Zelle, sobald die echte Stufe gecacht ist.
            lod: foundryFlat && foundryFlat.lod === 2 && lod < 2 ? 2 : lod,
            form: foundryFlat && foundryFlat.lod === 2 ? "karte" : "mesh",
            bpName,
            slots,
            x: tf.x,
            z: tf.z,
            scale: tf.scale, // die Größe der Zelle: ihre Krone (`_naturKrone`, die Natur-Wand räumt die Lichtung)
            // ihre Gestalt und Drehung (D10: der Spiegel liest ihre Krone im Kronen-Buch, nie eine zweite Rechnung)
            gestalt,
            yaw: tf.yaw,
        };
    }

    // Trägt eine Mesh-Zelle auf der neuen Wunsch-Stufe DIESELBE Gestalt? Foundry: die EINE Stufen-Klammer des Flattens
    // (`_foundryServierStufe`) bildet beide Wünsche auf dieselbe gelieferte Stufe ab — auch den Fern-Wunsch 2 diesseits
    // der Nah-Grenze (Fels [0] bleibt sein L0, die Blume [0, 2] trägt ihre L2); jenseits entscheidet die Fernform (`_streuFernBahn`). Die Karte
    // (Baum/Strauch-Stufe 2) ist nie dieselbe Gestalt wie ein Körper. Grammatik: derselbe Bauplan-Schlüssel.
    // Fernform-Datensätze (slots []) nie.
    _scatterGleicheGestalt(cell, newLod, dist) {
        if (!cell.slots.length) return false;
        const fp = this._foundryEnabled() ? this._foundryPresetFor(cell.species) : null;
        if (fp) {
            if (this._streuFernBahn(fp, newLod, dist)) return false;
            const neu = this._foundryServierStufe(fp, newLod);
            return neu < 2 && neu === this._foundryServierStufe(fp, cell.lod);
        }
        const keys = this._buildVariantLODs(cell.species, cell.variantIndex);
        return !!keys && (keys[newLod] || keys[0]) === cell.bpName;
    }

    // Scatter-LOD-Tick: Stufe + Band-Partner wurden beim Region-Bau zur BAU-Zeit-Distanz gewählt, der
    // Dither maskiert aber nach LIVE-Distanz (ferne Bäume verschwänden). Ein gedeckeltes Rolling-Slice
    // (bounded Scan + wenige Reallokationen/Frame) rechnet mit DENSELBEN Quellen neu:
    // _chooseLODForDistance (cell.lod als Hysterese-Zustand) + _scatterMaterializeCell. Lädt das Ziel
    // noch, bleibt die alte Stufe (ctxNoDefer hält die Region aus dem Refill heraus).
    _tickScatterLod(playerPos, maxRealloc = 4, maxScan = 160) {
        const map = this.state.scatterRegions;
        if (!map || map.size === 0 || !playerPos) return 0;
        // in der Ankunft aus der Ferne (B2) folgt der Fernwald der gleitenden Maske im selben Schritt wie die Bauten
        if (this._ankunftsFerne() > 1) {
            maxRealloc = Math.max(maxRealloc, AnazhRealm.ANKUNFT_TAKT.streu);
            maxScan = Math.max(maxScan, AnazhRealm.ANKUNFT_TAKT.streuScan);
        }
        const SC = AnazhRealm.SCATTER;
        if (!this._scatterLayerByName) {
            this._scatterLayerByName = new Map();
            for (const l of SC.layers) this._scatterLayerByName.set(l.name, l);
        }
        // Schlüssel-Spiegel nur bei GRÖSSEN-Wechsel der Region-Map neu münzen (sonst ~1 MB/s Müll): Regionen
        // werden nie in-place ersetzt. Netto-Null-Loch (Remove+Add, size gleich) deckelt der 128er-Takt auf
        // ~2 s; tote Schlüssel hoppt der Cursor schadlos.
        this._scatterLodKeyTick = (this._scatterLodKeyTick || 0) + 1;
        let keys = this._scatterLodKeys;
        if (!keys || this._scatterLodKeysN !== map.size || (this._scatterLodKeyTick & 127) === 0) {
            keys = this._scatterLodKeys = Array.from(map.keys());
            this._scatterLodKeysN = map.size;
        }
        if (!this._scatterLodCursor) this._scatterLodCursor = { k: 0, c: 0 };
        // DIE STAND-WACHE: ging die Stufen-Wahl eine volle Runde über alle Zellen ohne Zug und ohne Wartende, und regt sich
        // nichts (Ort, Streu-Menge, Ankunft, Regler), wählt sie dieselben Stufen — kein Gang.
        let zellen = 0;
        for (const reg of map.values()) if (reg && Array.isArray(reg.cells)) zellen += reg.cells.length;
        if (this._standRuht("streuLod", zellen, { pos: playerPos, rand: AnazhRealm.STAND_RAND_M })) return 0;
        let regung = 0;
        let offen = 0;
        const cur = this._scatterLodCursor;
        let scanned = 0;
        let realloc = 0;
        let hops = 0;
        while (scanned < maxScan && realloc < maxRealloc && hops <= keys.length) {
            if (cur.k >= keys.length) cur.k = 0;
            const key = keys[cur.k];
            const region = map.get(key);
            const cells = region && Array.isArray(region.cells) ? region.cells : null;
            if (!cells || cur.c >= cells.length) {
                cur.k++;
                cur.c = 0;
                hops++;
                continue;
            }
            const cell = cells[cur.c++];
            scanned++;
            if (!cell || !cell.slots || !cell.bpName) continue; // promoted/freigegeben
            const layer = this._scatterLayerByName.get(cell.layer);
            if (!layer) continue;
            // Zellen mit region-privaten Slots (@regX,regZ) dürfen zurück in die Fern-Stufe wandern (der
            // Ursprungs-Bounding-Sphere-Hazard ist an der Wurzel weg: die Gruppe ist dicht, die Kugel umspannt nur
            // Lebende, _archGroupFree) — sonst frieren Millionen L1-Tris ein. Promotions (→ näher) bleiben dem
            // Region-Lifecycle. Super-Region-Slots (`@s:`, _archFernRegionKey) wandern beidseitig.
            let hatRegional = false;
            for (const s of cell.slots) {
                if (s && typeof s.key === "string") {
                    const at = s.key.indexOf("@");
                    if (at >= 0 && !s.key.startsWith("@s:", at)) {
                        hatRegional = true;
                        break;
                    }
                }
            }
            const dx = cell.x - playerPos.x;
            const dz = cell.z - playerPos.z;
            const dist = Math.sqrt(dx * dx + dz * dz);
            if (dist > SC.outerM + 96) continue; // jenseits räumt der Region-Ring selbst
            const tf = this._scatterCellTransform(cell.cellX, cell.cellZ, cell.cellM, layer.scaleBase, layer.scaleVar);
            const visH = this._scatterSichtHoehe(layer, cell.species, cell.cellX, cell.cellZ, cell.variantIndex, tf);
            if (visH === null) {
                offen++;
                continue; // die Höhen-Stufe lädt: die Zelle hält ihre Stufe
            }
            const newLod = this._chooseLODForDistance(dist, cell.lod, visH);
            // DIE NAH-GRENZE wechselt die Bahn auch ohne Stufen-Wechsel — dieselbe Grenze wie der Zellen-Chokepoint
            // (`_streuFernBahn`, ANALOG_NAH_M): eine Fernform-Zelle (Gesetz-Platz oder Boden), die näher kommt, tauscht
            // auf ihr Studio-Mesh; eine Mesh-Zelle, die sich entfernt, zieht erst 8 m hinter der Grenze in ihre Fernform
            // (Totband gegen Flattern). Sonst blieb der Kapsel-Satz einer Fern-Zelle stehen, wenn der Spieler auf sie zuging.
            const istFern = cell.form === "gesetz" || cell.form === "boden";
            const fernArt =
                layer.kind !== "tree" && newLod >= 2 && newLod === cell.lod && this._foundryEnabled()
                    ? this._foundryPresetFor(cell.species)
                    : null;
            const bahnWechsel =
                !!fernArt && istFern !== !!this._streuFernBahn(fernArt, newLod, istFern ? dist : dist - 8);
            // Eine WARTENDE Gesetz-Zelle (ihr Satz stand beim Bau nicht: Fit-Takt, Kapsel-Liste) wiederholt den Spawn,
            // solange ihr Fern-Wunsch jenseits der Grenze gilt — slot-frei, nur wo ein echter Renderer den Welt-March zeichnet.
            const warten = !bahnWechsel && cell.wartet === true && newLod === cell.lod && this._weltMarchGezeichnet();
            // DAS BAND DER STREU (K36): wandert die Zelle durchs Band, folgt ihr Partner dem Auge wie bei der Architektur;
            // hält sie, weil ihr Partner lud, tauscht sie, sobald er steht — die Zelle materialisiert neu (Partner + Halt).
            const bandWechsel =
                !warten && !bahnWechsel && newLod === cell.lod && this._streuBandWechsel(cell, dist, visH, tf);
            if (!bandWechsel && cell.halt === "wartet") offen++; // der Partner lädt: die Wahl bleibt wach
            if (newLod === cell.lod && !warten && !bahnWechsel && !bandWechsel) continue;
            // DIESELBE GESTALT auf der neuen Stufe (die EINE Stufen-Klammer: Fels [0], Blume [0,2], Strauch [1,2]; Grammatik
            // ohne eigene Stufe; diesseits der Nah-Grenze auch der Fern-Wunsch) → nur den Wunsch quittieren: kein
            // Materialisieren, kein Duplikat-Slot.
            if (!warten && !bahnWechsel && !bandWechsel && this._scatterGleicheGestalt(cell, newLod, dist)) {
                cell.lod = newLod;
                regung++;
                continue;
            }
            // Private Boden-Zellen wandern NUR in die Fern-Stufe zurück (newLod 2), erst mit Fade-Marge (auch
            // `fade` m näher wäre es noch L2 — kein Flackern am Dither-Band). Die leere private Hülle reapt
            // _scatterFreeSlots (jede leere Gruppe fällt durch den Leer-Chokepoint).
            if (hatRegional) {
                const fadeM = AnazhRealm.LOD_DISTANCES.fade;
                if (newLod !== 2 || this._chooseLODForDistance(Math.max(0, dist - fadeM), cell.lod, visH) !== 2)
                    continue;
            }
            // dieselbe Oberflächen-Quelle wie der Erst-Bau (Feld → Voxel-Fallback)
            const field = this._sampleBakedField ? this._sampleBakedField(cell.x, cell.z) : null;
            const surfY = field ? field.height : this._voxelSurfaceY ? this._voxelSurfaceY(cell.x, cell.z) : 0;
            let layerSalt = 0;
            for (let i = 0; i < layer.name.length; i++) layerSalt = (layerSalt * 131 + layer.name.charCodeAt(i)) >>> 0;
            const comma = key.indexOf(",");
            const regX = parseInt(key.slice(0, comma), 10);
            const regZ = parseInt(key.slice(comma + 1), 10);
            // ZUERST materialisieren (deferred-sicher): kommt null (Asset lädt),
            // bleibt die alte Stufe unangetastet stehen.
            const rec = this._scatterMaterializeCell(
                region,
                layer,
                layerSalt,
                cell.cellX,
                cell.cellZ,
                cell.cellM,
                tf,
                dist,
                Number.isFinite(surfY) ? surfY : 0,
                cell.species,
                cell.variantIndex,
                visH,
                newLod,
                regX,
                regZ,
                true
            );
            if (!rec || (warten && rec.wartet)) {
                offen++; // das Asset lädt — oder der Satz steht weiter nicht: die Zelle wartet, kein Zug
                continue;
            }
            regung++;
            const hatteSlots = cell.slots.length > 0;
            this._scatterFreeSlots(cell.slots);
            if (cell.feld) {
                this._scatterFeldFrei(cell.feld); // die alte Feld-Stufe fällt mit dem Band-Wechsel
                cell.feld = null;
            }
            cell.lod = rec.lod;
            cell.bpName = rec.bpName;
            cell.slots = rec.slots;
            cell.feld = rec.feld || null;
            cell.form = rec.form;
            cell.wartet = rec.wartet === true;
            cell.dient = rec.dient;
            cell.bandWunsch = rec.bandWunsch;
            cell.halt = rec.halt;
            // Das Realloc-Budget deckelt Mesh-Züge; ein slot-freier Fernform-Wechsel (Gesetz-Platz) zählt nicht.
            if (hatteSlots || rec.slots.length) realloc++;
        }
        this._standMeldet("streuLod", scanned, regung > 0, offen > 0);
        return realloc;
    }

    // Wechselt das Band einer Streu-Zelle (K36)? Ihr Partner-Wunsch vom Auge (dieselbe Regel wie die Architektur,
    // `_lodBandPartnerFor` an ihrer gelieferten Stufe) ist ein anderer, als sie trägt — oder sie hält, weil ihr Partner lud,
    // und er steht jetzt. Eine Zelle ohne Foundry-Band (Grammatik, Nicht-Baum) wechselt nie.
    _streuBandWechsel(cell, dist, visH, tf) {
        if (!Number.isFinite(cell.dient) || this.state.foundryCrossfade !== true) return false;
        const w = this._lodBandPartnerFor(dist, visH, cell.dient, tf.scale);
        const wunsch = w != null && w !== cell.dient ? w : null;
        if (wunsch !== (cell.bandWunsch == null ? null : cell.bandWunsch)) return true;
        if (cell.halt !== "wartet" || wunsch === null) return false;
        const preset = this._foundryPresetFor(cell.species);
        // derselbe Same wie ihr Bau (die Gestalt des Orts, `_scatterFoundrySeed`) — bis K69-2 fragte er ohne Art und Ort den
        // rohen Samen, also den Partner einer anderen Gestalt
        const seed = this._scatterFoundrySeed(cell.cellX, cell.cellZ, cell.variantIndex, cell.species, tf);
        const pf = preset && seed !== null ? this._foundryFlattenFor({ seed, wo: tf }, preset, wunsch) : null;
        return !!(pf && pf.instanceable);
    }

    // Der Halt eines Streu-Slots (K36): die Primär-Stufe ohne Partner zeichnet voll (`_lodSlotStamp`, Vorzeichen).
    _streuSlotHalt(ref, scale) {
        const g = this.state.archInstanceGroups && this.state.archInstanceGroups.get(ref.key);
        if (g) this._lodSlotStamp(g, ref.slot, scale, true);
    }

    _disposeScatterRegion(key) {
        const map = this.state.scatterRegions;
        if (!map) return false;
        const region = map.get(key);
        if (!region) return false;
        this._weltRegt(); // die Streu-Menge regt sich
        // W3.3c — DISPOSE-STORNO: eine offene Fortsetzung stirbt MIT der Region (sonst
        // schriebe die nächste Scheibe Slots in entsorgte HISM-Gruppen — der zweite
        // Fehlermodus neben emitted<cap; `gate:scatter-slice` prüft ihn mit Absturz-Probe).
        region._cont = null;
        // Regional gebaute Region: ihre Gruppen (Key @regX,regZ) GANZ entsorgen (geom/mat geteilt, bleiben) —
        // nie per-Slot-Free, das Null-Skalieren bläht die Bounding-Sphere zum Ursprung.
        const regionGroupKeys = region.regional ? new Set() : null;
        const sharedSlots = regionGroupKeys ? [] : null;
        for (const cell of region.cells) {
            // Die Krone eines Streu-Baums fällt mit seiner Region aus der Kronen-Karte (die Region zeichnet ihn neu).
            if (cell.promotable) this._kronenStreuWeg(`s:${cell.layer}:${cell.cellX},${cell.cellZ}`);
            // DIE BAUM-/GESETZ-BAHN: das Feld eines Baum-Zells bzw. der
            // Gesetz-Platz einer Klein-Streu-Zelle stirbt mit seiner Region
            // (Dedup-Refcount — das geteilte Brick fällt erst mit dem letzten).
            if (cell.feld) {
                this._scatterFeldFrei(cell.feld);
                cell.feld = null;
            }
            if (regionGroupKeys) {
                // NUR den EIGENEN Region-Suffix (`@` + key) ganz entsorgen. Globale Gruppen (Bäume, Fern-Laub) und
                // Super-Region-Keys (`@s:SX,SZ`, bis 4×4 Regionen geteilt) risse ein Ganz-Dispose bei den Nachbarn
                // mit → per-Slot-Free über den EINEN Chokepoint _scatterFreeSlots (dort reapt der Leer-Dispose).
                if (Array.isArray(cell.slots)) {
                    const own = "@" + key;
                    for (const s of cell.slots) {
                        if (typeof s.key === "string" && s.key.endsWith(own)) regionGroupKeys.add(s.key);
                        else sharedSlots.push(s);
                    }
                }
            } else {
                this._scatterFreeSlots(cell.slots);
            }
            // V18.225 — nur promotable (Baum-)Cells haben einen Lookup-Eintrag;
            // den NICHT löschen, wenn promoted (die Seele lebt); sonst räumen.
            const layerName = cell.layer || "tree";
            if (
                cell.promotable &&
                this.state.scatterLookup &&
                !this._scatterIsCellPromoted(cell.x, cell.z, layerName)
            ) {
                this.state.scatterLookup.delete(this._scatterCellKeyAt(cell.x, cell.z, layerName));
            }
        }
        if (sharedSlots && sharedSlots.length) this._scatterFreeSlots(sharedSlots);
        if (regionGroupKeys) for (const gk of regionGroupKeys) this._disposeArchInstanceGroup(gk);
        map.delete(key);
        return true;
    }

    // V18.300 — eine REGIONALE Streu-Gruppe vollständig entsorgen (region-privat →
    // kein anderer Konsument). Der Mesh verlässt die Szene, seine Instanz-Puffer die GPU
    // (_instanzAbschied); geom/mat sind geteilt (archFlattenCache) → bleiben.
    _disposeArchInstanceGroup(groupKey) {
        const g = this.state.archInstanceGroups && this.state.archInstanceGroups.get(groupKey);
        if (!g) return;
        this._archGruppenDisposes = (this._archGruppenDisposes || 0) + 1; // CHURN-LINSE (18.07.)
        this.state.archInstanceGroups.delete(groupKey);
        if (g.wahl) this._instanzWahlGruppen().delete(g);
        g._wahlJe = null; // eine entsorgte Gruppe hält keine Wahl (ihre Marken zeigen auf freigegebene Slots)
        if (g.satz) this._bauSatzMarke(groupKey, g.satz); // Welle 6 — der Bereich verlässt den Satz im nächsten Takt
        if (g.mesh) {
            // SUBMIT-WAL — parent-bewusst (die scene.remove-Falle): eine regionale Gruppe hängt in ihrer
            // Region-BundleGroup; ein leeres Bundle
            // verlässt die Szene mit (_archBundleSceneRemove räumt beides).
            this._archBundleSceneRemove(g.mesh);
            this._instanzAbschied(g.mesh);
            // V4(B) — spiegelt die Ref-Erhöhung aus _archInstanceGroupFor: geht die letzte lebende
            // InstancedMesh-Gruppe dieser Foundry-Cache-Gruppe UND ist sie schon LRU-geräumt
            // (`_evicted`), gibt jetzt der letzte Halter ihre geteilte Geometrie frei (deferred).
            if (g._foundrySrc) {
                g._foundrySrc._liveRefs = Math.max(0, (g._foundrySrc._liveRefs || 0) - 1);
                if (g._foundrySrc._liveRefs <= 0 && g._foundrySrc._evicted)
                    this._disposeFoundryGroupGeom(g._foundrySrc);
            }
        }
    }

    _disposeAllScatterRegions() {
        if (!this.state.scatterRegions) return;
        for (const key of Array.from(this.state.scatterRegions.keys())) this._disposeScatterRegion(key);
    }

    // Promotion: eine Deko-Cell kristallisiert zu einem echten spawnArchitecture-Eintrag (harvestbar,
    // getaggt, Provenienz) an der bit-gleichen Transform (_scatterCellTransform) mit gleicher
    // Spezies+Variante — dieselbe Geometrie, kein Sprung. Cell promoted-markiert; liefert Eintrag/null.
    _promoteScatterCell(cellEntry) {
        if (!cellEntry || !this.state.scene) return null;
        // V18.225 — nur die promotable (Baum-)Schicht kristallisiert (Understory/
        // Streu bleiben Deko — die SEELEN-Band-Vision gilt den harvestbaren Bäumen).
        if (cellEntry.promotable === false) return null;
        const layerName = cellEntry.layer || "tree";
        if (this._scatterIsCellPromoted(cellEntry.x, cellEntry.z, layerName)) return null;
        // LOD0-Bauplan (die Hero-Form) für den echten Baum
        const keys = this._buildVariantLODs(cellEntry.species, cellEntry.variantIndex);
        if (!keys || !keys[0]) return null;
        // Skalen-Streuung aus der LAYER-Tabelle (der Zellen-Datensatz trägt scaleBase/scaleVar nicht) —
        // sonst ploppt der promotete Baum in anderer Größe als sein Deko-Zwilling.
        let promLayer = null;
        for (const l of AnazhRealm.SCATTER.layers) {
            if (l.name === layerName) {
                promLayer = l;
                break;
            }
        }
        const tf = this._scatterCellTransform(
            cellEntry.cellX,
            cellEntry.cellZ,
            cellEntry.cellM,
            promLayer ? promLayer.scaleBase : cellEntry.scaleBase,
            promLayer ? promLayer.scaleVar : cellEntry.scaleVar
        );
        // Der Same der Zelle (die Gestalt des Orts) vor dem Freigeben: wartet sie, wartet die Promotion mit ihr.
        const same = this._scatterFoundrySeed(
            cellEntry.cellX,
            cellEntry.cellZ,
            cellEntry.variantIndex,
            cellEntry.species,
            tf
        );
        if (same === null) return null;
        const surfY = this._voxelSurfaceY ? this._voxelSurfaceY(tf.x, tf.z) : cellEntry.y || 0;
        // Deko-Slots freigeben BEVOR der echte Baum spawnt (kein Doppel-Mesh) — und die Krone der Zelle mit ihnen: der
        // Eintrag trägt seine eigene ein (`spawnArchitecture`), sonst summierte die Karte sie doppelt.
        this._scatterFreeSlots(cellEntry.slots);
        cellEntry.slots = null;
        this._kronenStreuWeg(`s:${layerName}:${cellEntry.cellX},${cellEntry.cellZ}`);
        // Promoted-Bitmask setzen (vor dem Spawn — spawnArchitecture markiert
        // ebenfalls, doppelt ist idempotent)
        this._scatterMarkCellPromoted(tf.x, tf.z, layerName);
        // Der Same der Zelle reist mit (Γ5): der echte Eintrag trägt DIESELBE Gestalt wie seine Streu-Instanz —
        // ohne ihn würfelte spawnArchitecture Math.random, und die Gestalt wechselte am Promotions-Ring. Der Baum setzt
        // durch die EINE Natur-Wand (`_naturSetzen`): im Grundriss eines Hauses fällt er mit seiner Streu-Instanz.
        const entry = this._naturSetzen(
            keys[0],
            { x: tf.x, y: (Number.isFinite(surfY) ? surfY : 0) + 0.5, z: tf.z },
            {
                silent: true,
                precise: true,
                scale: tf.scale,
                rotationY: tf.yaw,
                seed: same,
            }
        );
        if (entry) {
            // Provenienz (Plan §2): geboren aus Welt-Genese-Cell, durch Berührung
            // kristallisiert. harvestArchitecture (V18.212) liest _grownSpecies.
            entry.provenance = {
                bornFrom: "world-genesis-cell",
                species: cellEntry.species,
                variantIndex: cellEntry.variantIndex,
                cell: { cellX: cellEntry.cellX, cellZ: cellEntry.cellZ },
            };
            cellEntry.promotedId = entry.id;
        }
        return entry;
    }

    // Scatter-Streaming: 3×3-Region-Ring um den Spieler generieren, ferne disposen, nahe Cells
    // promovieren. Gated auf `state.atmosphere.gpuScatter`; bounded durch maxRegionsPerFrame.
    // Eine Streu-Region streamt nur, wenn ihre NÄCHSTE Kante im `foliageRadius` liegt (gekappt auf die gebaute Ring-Kante) —
    // kein Fern-Billboard vor dem Boden. Die Spieler-Region streamt immer; ferne holt der nächste Tick selbst-heilend nach.
    // Headless: foliageRadius = MAX. Die EINE Regel für den Streamer und das erste Weltbild (`_weltbildFehlt`).
    _streuRegionInReichweite(rx, rz, p) {
        const SC = AnazhRealm.SCATTER;
        const st = this.state;
        const R = st.foliageRadius != null ? st.foliageRadius : AnazhRealm.PERF_FOLIAGE_RADIUS_MAX;
        const nx = Math.max(rx * SC.regionM, Math.min(p.x, (rx + 1) * SC.regionM));
        const nz = Math.max(rz * SC.regionM, Math.min(p.z, (rz + 1) * SC.regionM));
        return Math.hypot(nx - p.x, nz - p.z) <= R;
    }

    // Steht die Streu? — die EINE Antwort (das erste Weltbild `_weltbildFehlt`, die Bühnen-Linse): wie viele Streu-Regionen
    // in Reichweite (`_streuRegionInReichweite`) nicht stehen — sie fehlen, warten auf ihr Asset oder tragen eine offene
    // Scheibe. Keine Regionen-Karte heißt: der Streamer lief noch nie (der Deko-Job wartet, solange der Ring Chunks baut),
    // jede Region in Reichweite fehlt. Befund 09.10. (gate:ankunft, CI 37942425121): bei langsamem Takt stand der Ring am
    // Existenz-Boden, bevor der Streamer einen Frame bekam — die fehlende Karte galt als „nichts wartet", der Ladeschirm wich
    // ohne ein einziges Wald-Stück. Ist die Streu aus (`gpuScatter === false`), wartet nichts; ohne Spieler-Ort steht keine.
    // `liste` (optional) nimmt je wartende Region ihren Schlüssel und Grund auf (`_streuRegionWartet`).
    _streuWartet(p, liste) {
        const SC = AnazhRealm.SCATTER;
        const st = this.state;
        if (st.atmosphere && st.atmosphere.gpuScatter === false) return 0;
        if (!p) {
            if (liste) liste.push("kein Spieler-Ort");
            return 1;
        }
        const rx0 = Math.floor(p.x / SC.regionM);
        const rz0 = Math.floor(p.z / SC.regionM);
        let warten = 0;
        for (let dz = -SC.ringRegions; dz <= SC.ringRegions; dz++)
            for (let dx = -SC.ringRegions; dx <= SC.ringRegions; dx++) {
                const rx = rx0 + dx;
                const rz = rz0 + dz;
                if (!this._streuRegionInReichweite(rx, rz, p)) continue;
                const grund = this._streuRegionWartet(`${rx},${rz}`);
                if (!grund) continue;
                warten++;
                if (liste) liste.push(`${rx},${rz} ${grund}`);
            }
        return warten;
    }

    // Worauf EINE Streu-Region wartet — die Regel je Region (null: sie steht): sie fehlt (keine Karte oder kein Eintrag),
    // wartet auf ihr Asset (`_deferredFoundry`, der Nachschub baut sie nach der Lieferung neu) oder trägt eine offene
    // Scheibe (`_cont`). Jeder Leser fragt hier, keiner liest die Marken selbst.
    _streuRegionWartet(rk) {
        const regionen = this.state.scatterRegions;
        const reg = regionen ? regionen.get(rk) : null;
        if (!reg) return "fehlt";
        if (reg._deferredFoundry) return "wartet auf ihr Asset";
        if (reg._cont) return "Scheibe offen";
        return null;
    }

    _tickScatterStreaming(playerPos, deadlineMs) {
        const atmo = this.state.atmosphere;
        if (atmo && atmo.gpuScatter === false) return 0;
        if (!playerPos) return 0;
        const SC = AnazhRealm.SCATTER;
        const map = this._ensureScatterRegionMap();
        const pRegX = Math.floor(playerPos.x / SC.regionM);
        const pRegZ = Math.floor(playerPos.z / SC.regionM);
        let work = 0;
        // Finish-first: offene Scheiben-Fortsetzungen zuerst vollenden (Region für Region, kein Stau); steht
        // danach noch eine (Deadline erschöpft), beginnt dieser Frame keine neue.
        let _sliceFull = false;
        for (const reg of map.values()) {
            if (work >= SC.maxRegionsPerFrame) break;
            if (!reg || !reg._cont) continue;
            this._scatterRegion(reg.regX, reg.regZ, playerPos, deadlineMs);
            work++;
            if (reg._cont) {
                _sliceFull = true;
                break;
            }
        }
        // (1) fehlende Ring-Regionen generieren (bounded) — nur, wenn im Radius (der Boden ist da,
        // `_streuRegionInReichweite`); W3.3c: mit Deadline (Scheiben-Modus) + nie, wenn eine Fortsetzung den Frame schon füllte.
        // DIE STREU BEGINNT MIT DEM BUCH (K60-2): bei lebender Foundry trägt jede Streu-Art ihr Studio-Asset — vor dem Buch
        // schob jede Zelle auf, und die Region streute ganz, nur um nach dem Buch neu zu streuen (Radeon kalt bis 8 s ab Navigation).
        const _fb = this._foundryEnabled() ? this._foundry : null;
        const _buchKalt = this._foundryEnabled() && !(_fb && _fb.ready && _fb.recipes);
        for (
            let dz = -SC.ringRegions;
            dz <= SC.ringRegions && work < SC.maxRegionsPerFrame && !_sliceFull && !_buchKalt;
            dz++
        ) {
            for (let dx = -SC.ringRegions; dx <= SC.ringRegions && work < SC.maxRegionsPerFrame; dx++) {
                const rk = `${pRegX + dx},${pRegZ + dz}`;
                if (!map.has(rk) && this._streuRegionInReichweite(pRegX + dx, pRegZ + dz, playerPos)) {
                    this._scatterRegion(pRegX + dx, pRegZ + dz, playerPos, deadlineMs);
                    work++;
                    if (Number.isFinite(deadlineMs) && performance.now() > deadlineMs) {
                        _sliceFull = true;
                        break;
                    }
                }
            }
        }
        // (2) ferne Regionen disposen (außerhalb ringRegions+1)
        const disposeR = SC.ringRegions + 1;
        for (const rk of Array.from(map.keys())) {
            const region = map.get(rk);
            if (!region) continue;
            if (Math.abs(region.regX - pRegX) > disposeR || Math.abs(region.regZ - pRegZ) > disposeR) {
                this._disposeScatterRegion(rk);
            }
        }
        // Refill: hat die Foundry seit dem letzten Mal geliefert (`_scatterRefillPending`, gesetzt in
        // _foundryRewarmColdTrees), die Regionen mit deferrierten Fern-Bäumen neu streamen. Einmal je
        // Liefer-Batch; Schritt (1) baut sie über die nächsten Ticks.
        if (this._scatterRefillPending) {
            this._scatterRefillPending = false;
            for (const rk of Array.from(map.keys())) {
                const region = map.get(rk);
                if (!region || !region._deferredFoundry || !region._geweckt) continue;
                if (Math.abs(region.regX - pRegX) <= disposeR && Math.abs(region.regZ - pRegZ) <= disposeR) {
                    this._disposeScatterRegion(rk); // Schritt (1) im nächsten Tick baut sie mit dem Studio-Asset neu
                }
            }
        }
        // (3) Touch→Real: Scatter-Cells im promoteRadius zu echten Bäumen
        // kristallisieren (max 3/Frame — kein Spawn-Spike). Nur die Ring-Region
        // des Spielers walken (die nahen Cells leben dort).
        let promotions = 0;
        const pr2 = SC.promoteM * SC.promoteM;
        // Promotion scannt ALLE Regionen, deren Quadrat den promoteM-Kreis schneidet (max 2×2) — nicht nur
        // die Home-Region, sonst promotet eine Zelle knapp jenseits der Grenze nie. pr2-Filter je Zelle.
        // Anker „baum-D2-Heilung": die Quell-Probe in diag-scatter-lod sucht diesen Block — nie umbenennen.
        const regM = AnazhRealm.SCATTER.regionM;
        const pr = AnazhRealm.SCATTER.promoteM;
        const rx0 = Math.floor((playerPos.x - pr) / regM);
        const rx1 = Math.floor((playerPos.x + pr) / regM);
        const rz0 = Math.floor((playerPos.z - pr) / regM);
        const rz1 = Math.floor((playerPos.z + pr) / regM);
        for (let rX = rx0; rX <= rx1 && promotions < 3; rX++) {
            for (let rZ = rz0; rZ <= rz1 && promotions < 3; rZ++) {
                const region = map.get(`${rX},${rZ}`);
                if (!region || !Array.isArray(region.cells)) continue;
                for (let i = 0; i < region.cells.length && promotions < 3; i++) {
                    const cell = region.cells[i];
                    if (!cell.slots) continue; // schon promoted/freigegeben
                    if (!cell.promotable) continue; // V18.225 — nur die Baum-Schicht kristallisiert
                    const dx = cell.x - playerPos.x;
                    const dz = cell.z - playerPos.z;
                    if (dx * dx + dz * dz <= pr2) {
                        if (this._promoteScatterCell(cell)) promotions++;
                    }
                }
            }
        }
        // Nach-Dünnen: eine Region, gebaut bei höherer Dichte als jetzt gilt, wird dünner re-gestreamt —
        // auch beim reinen Drehen ohne Re-Stream.
        this._tickFoliageThin(playerPos);
        // Die Wiese dünnt nie (Kapazität atmet über Ring/LOD/Schatten); der Streu-Thin oben ist der Hebel.
        // Idle-Pass (Chunk-Streaming baut nichts): Merge-Cache der Hotbar-Baupläne vorwärmen → Auswahl/
        // Ghost/Platzieren ohne Hänger. Eins/Tick, nur unter Budget.
        this._tickBlueprintPrebake();
        // GNADENFRIST (18.07.) — der Gruppen-Reaper räumt abgelaufene leere Hüllen (1×/s;
        // headless entsteht nie ein Kandidat — der Leer-Chokepoint reapt dort sofort).
        this._tickArchGruppenReaper(performance.now());
        // N5.7-AUTO (Nachlese-Welle) — der Worldgen-Konsument des "settlement"-Kanals:
        // Dörfer entstehen von selbst (seed-deterministische Zellen, Site-Wände,
        // budgetierte Materialisierung; headless ruht er — s. _tickAutoSettlement).
        this._tickAutoSettlement(playerPos);
        return work + promotions;
    }

    // Nach-Dünnen: eine Region, deren `builtDensity` deutlich über der geregelten Dichte liegt, wird
    // dünner re-gestreamt. 1 Region/Tick und nur in Budget-Lücken (erst Frame-Zeit, dann nachregeln);
    // negative Rückkopplung konvergiert.
    _tickFoliageThin(playerPos) {
        const st = this.state;
        // Im Studio-Regime dünnt die Streu NIE: der Bau pflanzt voll (fdScale=1), Dünnen baute nur identisch
        // neu. Zweite Wand neben _effectiveFoliageDensity (builtDensity == scale == 1).
        if (typeof this._foundryEnabled === "function" && this._foundryEnabled()) return 0;
        if (st._frameOverBudget) return 0; // erst die Frame-Zeit, dann dünnen (V18.282)
        const map = st.scatterRegions;
        if (!map || map.size === 0 || !playerPos) return 0;
        const scale = this._effectiveFoliageDensity();
        const SC = AnazhRealm.SCATTER;
        // die NÄCHSTE deutlich-zu-dichte Region finden (Margin 0.12 → kein Thrash am Ziel).
        let bestKey = null,
            bestReg = null,
            bestDist = Infinity;
        for (const [key, region] of map) {
            if (!region || region.builtDensity == null) continue;
            if (region.builtDensity <= scale + 0.12) continue;
            const rcx = (region.regX + 0.5) * SC.regionM,
                rcz = (region.regZ + 0.5) * SC.regionM;
            const d = (rcx - playerPos.x) ** 2 + (rcz - playerPos.z) ** 2;
            if (d < bestDist) {
                bestDist = d;
                bestKey = key;
                bestReg = region;
            }
        }
        if (!bestReg) return 0;
        const { regX, regZ } = bestReg;
        this._disposeScatterRegion(bestKey);
        this._scatterRegion(regX, regZ, playerPos); // baut bei der AKTUELLEN (geringeren) Dichte
        return 1;
    }

    // Voxel-Edit → Bake-Regionen im Radius dirty markieren (Lazy-Rebake beim nächsten Sample); pro Edit
    // höchstens 2×2 Regionen.
    _invalidateBakedRegionsAround(x, z, radius) {
        if (!this.state.bakedRegionFields || this.state.bakedRegionFields.size === 0) return;
        const cfg = this._bakeRegionConfig();
        const r = Math.max(1, radius || 6);
        const minRX = Math.floor((x - r) / cfg.sizeM);
        const maxRX = Math.floor((x + r) / cfg.sizeM);
        const minRZ = Math.floor((z - r) / cfg.sizeM);
        const maxRZ = Math.floor((z + r) / cfg.sizeM);
        for (let rx = minRX; rx <= maxRX; rx++) {
            for (let rz = minRZ; rz <= maxRZ; rz++) {
                const key = this._bakedRegionKey(rx, rz);
                const entry = this.state.bakedRegionFields.get(key);
                if (entry) entry.dirty = true;
            }
        }
    }

    // Die EINE Wahrnehmungs-Distanz (Screen-Space-Error-LOD, phytogenesis
    // `vLodD = camDist·min(uLodRef/(aH0·instScale),1)`): (a) min(lodRef/visHeight, 1) — ein größerer
    // Baum schaltet später, ein kleiner nie früher als nominal; (b) der EINE Perf-Regler
    // _foliageDensityScale dehnt die Distanz bis perfDistMulMax× (Maximum bei
    // fd == PERF_FOLIAGE_DENSITY_MIN, 1 bei fd == 1) → unter Last schalten alle früher.
    _lodPerceptionDistance(rawDist, visHeight) {
        const cfg = AnazhRealm.LOD_DISTANCES;
        if (!cfg) return rawDist;
        // V18.387 — die EINE LIVE-Quelle `state.lodRef` (Gesetz #0): dieselbe Zahl, die die Shader-
        // Blende (`state.lodUniforms.uLodRef`) liest → CPU-LOD-Mitgliedschaft UND das Dither-
        // Crossfade teilen den Referenz-Wert, live ohne Rebuild. Default seedet aus `cfg.lodRef`.
        const cfgRef = cfg.lodRef;
        const lodRef =
            this.state && Number.isFinite(this.state.lodRef) && this.state.lodRef > 0 ? this.state.lodRef : cfgRef;
        const hRaw = Number.isFinite(visHeight) && visHeight > 0 ? visHeight : lodRef;
        // SSE-Stretch UNGEDECKELT wie das Studio (`min(uLodRef/(aH0·_isy),1)`, foundry-core.js): ein großer
        // Baum behält Detail proportional länger; ein Deckel demotet Riesen ~2× zu früh. visStretchMax =
        // Infinity ist bewusst gültig (kein Number.isFinite-Guard — > 0 reicht).
        const stretchMax = cfg.visStretchMax;
        const h = Math.min(hRaw, lodRef * stretchMax);
        const heightFactor = Math.min(lodRef / Math.max(h, 1e-4), 1);
        return rawDist * heightFactor * this._lodPerfMul();
    }

    // Der Perf-Multiplikator der Wahrnehmungs-Distanz aus der EINEN Regler-Quelle (_foliageDensityScale): unter Last
    // schalten alle Stufen früher. ZWEI Leser, EINE Zahl: die CPU-Stufenwahl (_lodPerceptionDistance) UND die
    // Shader-Masken (uLodPerf, je Frame in _loopRender gespiegelt) — liest nur die CPU ihn, legt sie die Stufe um,
    // deren Fragmente die Maske noch verwirft (gemessen 04.10. unter Last, fd 0,22 → ×1,3: die Birke auf 15,7 m
    // stand als L1 allein, ihre Rinde zu 66 % gezeichnet — ein Geist).
    _lodPerfMul() {
        const cfg = AnazhRealm.LOD_DISTANCES;
        const fd = this.state && this.state._foliageDensityScale != null ? this.state._foliageDensityScale : 1;
        const fdMin = AnazhRealm.PERF_FOLIAGE_DENSITY_MIN;
        const mulMax = cfg.perfDistMulMax;
        const ankunft = this._ankunftsFerne(); // bis zum ersten Weltbild steht jede Karten-Art als Karte (B2)
        if (!(fd < 1 && fdMin < 1)) return ankunft;
        const frac = Math.max(0, Math.min(1, (1 - fd) / (1 - fdMin)));
        return (1 + (mulMax - 1) * frac) * ankunft;
    }

    // Sichthöhe eines Baum-Eintrags = y-Ausdehnung des LOD0-Bauplans × entry.scale. Gecacht je
    // (species, variantIndex) bei scale 1 im Instanz-Feld `this._treeVisHeightCache` (frozen
    // variantSeed → stabil); kein state-Feld → nicht serialisiert.
    _lodTreeVisHeightFor(species, variantIndex, scale) {
        if (!this._treeVisHeightCache) this._treeVisHeightCache = new Map();
        const key = species + "#" + variantIndex;
        let baseH = this._treeVisHeightCache.get(key);
        if (baseH === undefined) {
            baseH = 0;
            const keys = this._buildVariantLODs(species, variantIndex);
            const bpName = keys && keys[0];
            const bp = bpName && this.state.blueprints ? this.state.blueprints[bpName] : null;
            if (bp) {
                const ext = this._compoundVisualExtent(bp);
                baseH = ext && ext.dy > 0 ? ext.dy : 0;
            }
            this._treeVisHeightCache.set(key, baseH);
        }
        const s = Number.isFinite(scale) && scale > 0 ? scale : 1;
        return baseH * s;
    }

    // V18.387 — die Sichthöhe eines bereits gespawnten Architektur-Eintrags
    // (Baum-HISM). Nicht-Baum-Einträge → 0 (der Chooser läuft dann roh).
    _lodTreeVisHeight(entry) {
        if (!entry) return 0;
        const s = Number.isFinite(entry.scale) && entry.scale > 0 ? entry.scale : 1;
        const preset = this._foundryEnabled() ? this._foundryPresetForEntry(entry) : null;
        if (preset && this._foundryPresetIsTree(preset)) return this._foundrySichtHoehe(preset, entry, s);
        if (!entry._lodSpecies || !Number.isFinite(entry._lodVariantIndex)) return 0;
        return this._lodTreeVisHeightFor(entry._lodSpecies, entry._lodVariantIndex, s);
    }

    // DIE EINE SICHTHÖHE EINES FOUNDRY-BAUMS — die Zahl, die seine Masken lesen: die Höhe der Höhen-Stufe
    // (_foundryBaumHoehe; Template-Höhe × Preset-Welt-Skala) × Instanz-Skala, exakt was die Instanz-Fassade je Slot
    // stempelt (_lodSlotStamp) — für L0, L1 UND das Billboard. Befund 04.10. (Werkbank, Mess-Wiese): die CPU las die
    // Höhe aus dem Grammatik-Bauplan, den _buildVariantLODs bei lebender Foundry nie baut — 190 von 190 Bäumen
    // standen mit Sichthöhe 0, die Stufenwahl lief roh, die Masken mit 17–60 m Sichthöhe: zwischen ~12 und ~25 m stand
    // ein Baum als L1 ALLEIN, deren Maske ihn erst halb einblendet (Birke 15,7 m: Rinde zu 66 % gezeichnet, die L0
    // fehlte) — die gerasterten Geister. null = die Höhe ist (noch) nicht bekannt: KEIN Stufen-Urteil, nie roh.
    _foundrySichtHoehe(preset, entry, scale) {
        const h0 = this._foundryBaumHoehe(preset, entry);
        if (h0 == null) return null;
        return h0 * (Number.isFinite(scale) && scale > 0 ? scale : 1);
    }

    // Die Höhe eines Baum-Körpers (Art · Gestalt · Prägung) aus dem Höhen-Buch (_foundryCacheSet: Körper-Schlüssel
    // der Höhen-Stufe → _foundryGruppenHoehe). Unbekannt: die Höhen-Stufe wird bestellt (der EINE Bestell-Weg
    // _foundryFlattenFor, nah zuerst über die Eintrags-Position) und null kommt zurück — der Aufrufer wartet wie auf
    // ein ladendes Asset. Kann das Studio die Höhen-Stufe nicht bauen, meldet sich das einmal je Körper LAUT. `wer`
    // (optional, K38-N2): ein Wartender { wo, wecke(zusage) } bekommt den EINEN Zug der Höhen-Stufe, in seinem Rang.
    _foundryBaumHoehe(preset, entry, wer) {
        const f = this._foundry;
        const gestalt = f ? this._foundryGestaltFor(entry, preset) : null;
        if (gestalt == null) return null; // Buch kalt
        const stufe = this._foundryHoehenStufe(preset);
        const ovH = this._artifactStudioOv(entry);
        const key = this._foundryKoerperKey(preset, gestalt, stufe, ovH);
        const h0 = f.hoehen ? f.hoehen.get(key) : undefined;
        if (h0 > 0) return h0;
        const bestellt = this._foundryFlattenFor(entry, preset, stufe);
        // bestellt (null): der Zug läuft — der Wartende hängt sich an und hebt seinen Rang (`_foundryZug` im Flug)
        if (bestellt === null && wer) wer.wecke(this._foundryZug(key, preset, gestalt, stufe, ovH, wer.wo));
        if (bestellt === false) {
            if (!f.hoeheFehlt) f.hoeheFehlt = new Set();
            if (!f.hoeheFehlt.has(key)) {
                f.hoeheFehlt.add(key);
                this.log(
                    `Foundry: die Höhen-Stufe ${key} ist nicht baubar — dieser Baum bekommt keine Stufe.`,
                    "ERROR"
                );
            }
        }
        return null;
    }

    // DIE KRONE EINES BAUM-KÖRPERS (D10) aus dem Kronen-Buch (`_foundryCacheSet`, Beipack `__krone` der Höhen-Stufe): die
    // Laub-Teile [cx, cy, cz, rXZ, rY] der GEZEICHNETEN Krone im Vorlagen-Maß und ihre Farbe (linear) — derselbe Körper-
    // Schlüssel (Art · Gestalt · Höhen-Stufe · Prägung) wie die Höhe (`_foundryBaumHoehe`). Ein reiner Leser ohne Bestellung
    // und ohne Hüllen-Folge: undefined, solange die Höhen-Stufe nicht ankam — bis dahin zeichnet das Bild den Baum auch nicht
    // (die Stufen-Wahl wartet auf seine Höhe und bestellt sie).
    _foundryBaumKrone(preset, gestalt, ov) {
        const f = this._foundry;
        if (!f || !f.kronen || gestalt == null) return undefined;
        return f.kronen.get(this._foundryKoerperKey(preset, gestalt, this._foundryHoehenStufe(preset), ov));
    }

    // Die Höhen-Stufe eines Baum-Presets: die L1 (sie reist mit jeder L0, der Schatten-Stellvertreter, und trägt
    // jeden Mittel-Baum) — alle Stufen eines Baums stempeln IHRE Höhe (_foundryStufenHoeheAngleichen), sonst
    // trennen L0 und L1 die Rinde nicht mehr exakt (keepL0 XOR keepL1 braucht dasselbe f0 auf beiden).
    _foundryHoehenStufe(preset) {
        return this._foundryDeclaredStage(preset, 1);
    }

    // Eine Stufe eines Baums auf die Höhe h0 seiner Höhen-Stufe stempeln (aH0; aH0L Laub gekappt auf leafVisCap,
    // Rinde == aH0) — VOR dem Flat-Bau, also bevor eine Instanz-Fassade die Vorlage liest. Gemessen 04.10.: L0 und L1
    // derselben Variante wichen je Stufen-Ausdehnung 1–4 % (eiche|15 23,19 / 24,15 m) — im L0/L1-Band ein Lochgitter
    // in der Rinde.
    _foundryStufenHoeheAngleichen(group, h0) {
        const D = AnazhRealm.LOD_DISTANCES;
        const capL = D.leafVisCap;
        for (const ch of group.children) {
            const at = ch.geometry && ch.geometry.attributes;
            if (!at || !at.aH0 || !at.aH0L) continue;
            const fk = ch.material && ch.material.userData ? ch.material.userData.foundryKind : null;
            const fol = fk === "foliage" || fk === "foliageTex" || fk === "grass";
            at.aH0.array.fill(h0);
            at.aH0L.array.fill(fol ? Math.min(h0, capL) : h0);
            at.aH0.needsUpdate = true;
            at.aH0L.needsUpdate = true;
        }
    }

    _chooseLODForDistance(distance, currentLOD, visHeight) {
        const cfg = AnazhRealm.LOD_DISTANCES;
        if (!cfg) return 0;
        // V18.387 — MIT visHeight läuft die rohe Distanz durch die Wahrnehmungs-
        // Distanz (Screen-Space-Error + Perf-Regler); OHNE (nicht-Baum-Architektur)
        // bleibt der rohe Pfad BYTE-IDENTISCH.
        const d =
            Number.isFinite(visHeight) && visHeight > 0 ? this._lodPerceptionDistance(distance, visHeight) : distance;
        const t01 = cfg.thresh01;
        const t12 = cfg.thresh12;
        const h = cfg.hysteresis;
        // Ohne Hysterese-Zustand: einfache Stufenfunktion (Spawn/erstes Setup).
        if (!Number.isFinite(currentLOD)) {
            if (d > t12) return 2;
            if (d > t01) return 1;
            return 0;
        }
        const cur = Math.max(0, Math.min(2, currentLOD | 0));
        // Hysterese: wir wechseln NUR, wenn die Distanz die nächste Schwelle
        // PLUS hysteresis überschreitet, oder die vorige MINUS hysteresis
        // unterschreitet.
        // Jede Schwelle trägt ihre eigene Hysterese; liegt die Distanz jenseits ZWEIER Schwellen, springt die Wahl
        // durch (Teleport, rollender Streu-Tick): ein Schritt je Aufruf liess region-private Fern-Streu, die nur in
        // die Fern-Stufe zurückwandern darf, für immer auf L0 stehen (04.10.: 1121 Blumen/Geröll in 85–384 m).
        if (cur === 0) {
            if (d > t12 + h) return 2;
            if (d > t01 + h) return 1;
            return 0;
        }
        if (cur === 1) {
            if (d > t12 + h) return 2;
            if (d < t01 - h) return 0;
            return 1;
        }
        // cur === 2
        if (d < t01 - h) return 0;
        if (d < t12 - h) return 1;
        return 2;
    }

    // Die EINE Varianten-Wahl (ohne Geometrie-Bau): regionSeed → eine von VARIANTS_PER_SPECIES
    // Varianten, damit der Wald source-neutral spawnt (der Render wählt Studio oder grown-Fallback).
    // FNV-1a, die HOHEN Bits (`hash >>> 24`) wählen — die Low-Bits sind mod 2er-Potenz degeneriert.
    // _growTreeBlueprintForSpawn (unten): registrierter Bauplan "grown_<species>_v<variantIndex>"
    // (builtIn, instanced wie baum_eiche); Tag-Wand vor Reuse, schlägt sie an → baum_eiche.
    _treeVariantIndexFor(species, seed) {
        const N = AnazhRealm.VARIANTS_PER_SPECIES;
        const sKey = String(seed || species || "g7-default");
        let hash = 2166136261 >>> 0;
        for (let i = 0; i < sKey.length; i++) hash = ((hash ^ sKey.charCodeAt(i)) * 16777619) >>> 0;
        return (hash >>> 24) % N;
    }
    _growTreeBlueprintForSpawn(species, seed) {
        if (!this.state.blueprints) return null;
        // Varianten-Pool: der regionSeed rastert in EINE von VARIANTS_PER_SPECIES Varianten — die Welt
        // bleibt beschränkt, HISM teilt über Regionen, und ein berührter Baum re-wächst BIT-GENAU aus
        // variantSeed[index] (Voraussetzung der Promotion). Die Zeile der Art: _variantSeedsFor.
        const seeds = this._variantSeedsFor(species);
        if (!seeds) return null;
        // Hash für die VARIANTEN-WAHL — fnv-1a über (species, regionSeed):
        // gleicher regionSeed → gleicher variantIndex (Region trägt EINEN
        // lokalen Stil); verschiedene regionSeeds streuen über N Varianten.
        const variantIndex = this._treeVariantIndexFor(species, seed);
        const cacheKey = `grown_${species}_v${variantIndex}`;
        // Cache-Hit?
        const cached = this.state.blueprints[cacheKey];
        if (cached) {
            // V18.65-Lehre: Touch-Order halten (LRU-Hint, wenn _growTreeRing existiert).
            if (this._growTreeRing) {
                const idx = this._growTreeRing.indexOf(cacheKey);
                if (idx >= 0) {
                    this._growTreeRing.splice(idx, 1);
                    this._growTreeRing.push(cacheKey);
                }
            }
            return cacheKey;
        }
        // Die Spezies moduliert FORM/FARBE, die Materialien (holz+laub) bleiben über alle Arten identisch →
        // Spawn-Affinitäts-Achsen verschieben sich nie. Geometrie aus dem gefrorenen variantSeed:
        // bit-identisch zwischen Erstwachstum und Re-Growth nach Restore (Promotion ohne Sprung).
        const variantSeed = seeds[variantIndex];
        const parts = this._growTreeBlueprint(species, variantSeed);
        if (!Array.isArray(parts) || parts.length < 4) return null;
        // Variations-Wand: nur UNDEKLARIERTE Achsen strikt (Δ < 0.05); in SPECIES_TAG_VARIATION deklarierte
        // Achsen sind form-begründet erlaubt (z. B. Totholz ohne Laub-Krone). Die Disziplin ist die
        // DEKLARATION, nicht die Schwelle. Referenz-Signatur: die frozen SPECIES_TAG_REFERENCE.
        const refTags =
            (AnazhRealm.SPECIES_TAG_REFERENCE && AnazhRealm.SPECIES_TAG_REFERENCE[species]) ||
            (AnazhRealm.SPECIES_TAG_REFERENCE && AnazhRealm.SPECIES_TAG_REFERENCE.baum_eiche);
        if (refTags) {
            const newTags = this.computeCompoundTags({ parts }) || {};
            const axes = ["lebendig", "dichte", "brennbar", "magieleitung"];
            const variation = (AnazhRealm.SPECIES_TAG_VARIATION && AnazhRealm.SPECIES_TAG_VARIATION[species]) || {};
            for (const a of axes) {
                if (a in variation) continue; // form-begründete Achse → freipass
                const d = Math.abs((newTags[a] || 0) - (refTags[a] || 0));
                if (d > 0.05) return null; // undeklarierte Drift → ablehnen
            }
        }
        // Als Built-In-Bauplan registrieren (HISM-fähig). `_isGrown:true` ist der Snapshot-Anker: echte
        // Built-ins fallen raus (im Code), gewachsene müssen reisen (zur Laufzeit entstanden, referenziert).
        const speciesLabel = String(species || "Baum")
            .replace(/^baum_/, "")
            .replace(/^./, (c) => c.toUpperCase());
        // gen ≥ 6: merge-fähig — steuert NUR den Render-Pfad in _archFlattenBlueprint (zwei merged Leaves
        // statt N Per-Part); bp.parts bleibt → Tags + Re-Growth unverändert. gen < 6: Per-Part-Pfad.
        const genV = typeof this._genVersion === "function" ? this._genVersion() : 1;
        const isMerged = genV >= 6;
        // gen ≥ 7: skeleton-meshed — _archFlattenBlueprint baut aus bp._skeleton (Polylinien + Anchors, aus
        // _lastTreeSkeleton gespiegelt) eine bark-Tube (Flare am Fuß) + eine foliage-cards-Geometrie statt
        // ~75 Primitive. bp.parts bleibt unverändert (Tags stabil).
        const isSkeletonMeshed = genV >= 7 && this._lastTreeSkeleton && Array.isArray(this._lastTreeSkeleton.branches);
        this.state.blueprints[cacheKey] = {
            name: cacheKey,
            label: `${speciesLabel} (gewachsen)`,
            builtIn: true,
            _isGrown: true,
            _grownSpecies: species,
            // V18.217 — der GEFRORENE variantSeed reist als _grownSeed mit;
            // beim Restore re-wächst die Geometrie BIT-GENAU aus ihm. Plan §2.5:
            // „f(variantSeed) ist das Erbgut — kein Datensatz, eine Funktion".
            _grownSeed: variantSeed,
            // Varianten-Index als Querverweis: die Promotion mappt damit die scatter-instanceId auf den realen
            // Bauplan. Deterministisch aus regionSeed + genVersion.
            _variantIndex: variantIndex,
            _isMerged: isMerged,
            _skeleton: isSkeletonMeshed ? this._lastTreeSkeleton : null,
            instanced: true,
            parts,
        };
        // Skeleton ist eingebaut → den Side-Channel räumen (defensive,
        // nächster Aufruf setzt ihn neu).
        if (isSkeletonMeshed) this._lastTreeSkeleton = null;
        // Ring + architektur-bewusste Eviction: ein gewachsener Bauplan wird NIE evictet, solange eine
        // Architektur ihn als `type` referenziert (sonst Crash beim Streaming-Rebuild). Cap 256 ist Marge.
        if (!this._growTreeRing) this._growTreeRing = [];
        this._growTreeRing.push(cacheKey);
        const CAP = 256;
        let safety = 0;
        while (this._growTreeRing.length > CAP && safety < 1024) {
            safety++;
            const drop = this._growTreeRing.shift();
            if (!drop) break;
            // Architektur-Sieb: ist der Bauplan noch in der Welt aktiv?
            const inUse = this._isGrownBlueprintReferenced(drop);
            if (inUse) {
                // hinten anhängen (LRU-skip), nicht evicten — der Hain steht noch
                this._growTreeRing.push(drop);
                continue;
            }
            if (this.state.blueprints[drop]) delete this.state.blueprints[drop];
        }
        return cacheKey;
    }

    // Eviction-Wand: wird ein gewachsener Bauplan noch von einer Architektur referenziert? O(N) über
    // state.architectures (die kanonische Quelle) — nur bei Cap-Überschreitung, kein Hot-Path.
    _isGrownBlueprintReferenced(grownKey) {
        const archs = this.state && this.state.architectures;
        if (!Array.isArray(archs)) return false;
        for (let i = 0; i < archs.length; i++) {
            if (archs[i] && archs[i].type === grownKey) return true;
        }
        return false;
    }

    _growTreeBlueprint(speciesKey, seed) {
        // Welt-Routing: ab gen >= 5 wächst jede Art mit Rezept-Zeile im Gesetzbuch (_phytoArt) aus dem Kern,
        // davor die Legacy-Form (alte Welten bit-identisch).
        if (this._genVersion && this._genVersion() >= 5 && this._phytoArt(speciesKey)) {
            return this._growTreeBlueprintRich(speciesKey, seed);
        }
        return this._growTreeBlueprintLegacy(speciesKey, seed);
    }

    // Phyto-Wuchs-Kern (Port von phytogenesis growTreeNodes): rein, THREE-frei, seed-deterministisch
    // (Zufall nur aus seq()). McMahon: Stammradius folgt aus Höhe+Schlankheit · da Vinci: Querschnitt an
    // jeder Gabel erhalten (cr = area^(1/Δ)) · Apikaldominanz: api>0.62 exkurrent, sonst dekurrent.
    // Ausgabe {segs, leaves, trunkR, height, runMeta}; der Aufrufer gruppiert segs nach runId zu
    // Polylinien. `count`/`leafBudget` sind die Perf-Wand; headless: diag-phyto-tree.
    _phytoGrowSkeleton(P, seq) {
        // Delegator: die Wuchs-Mathematik lebt in der EINEN Quelle phyto-core.js
        // (`globalThis.__phytoCore.growSkeleton`; Main, voxel-worker und Terrain-Portal laden sie). Ohne Kern kein Baum.
        const core = typeof globalThis !== "undefined" && globalThis.__phytoCore;
        if (!core || typeof core.growSkeleton !== "function") return AnazhRealm._kernPflichtBruch("phyto:growSkeleton");
        return core.growSkeleton(P, seq);
    }

    // DIE ART EINER PFLANZE (K24): der Welt-Name → seine Rezept-Zeile der Studio-Tafel (foundry-core PRESETS, SYNCHRON über
    // __terrainCore.PHYTO_PRESETS — nie der async Buch-Stand, lockstep-fest). Die EINE Quelle von Reglern, Phänotyp und
    // Gestalt jedes gewachsenen Baums, Strauchs und Krauts: der gefühlte Baum (Wuchs → Kollision/Silhouette) liest dieselbe
    // Zeile wie der gesehene (buildInstance im Worker). Eine zweite Grammatik im Stamm gibt es nicht mehr. null = keine
    // Pflanze mit Regler-Zeile (Fels, Bauwerk, unbekannter Name).
    _phytoArt(speciesKey) {
        const tc = typeof globalThis !== "undefined" ? globalThis.__terrainCore : null;
        const tab = tc && tc.PHYTO_PRESETS;
        if (!tab) return AnazhRealm._kernPflichtBruch("terrain:PHYTO_PRESETS");
        const id = this._foundryPresetFor(speciesKey);
        const rec = id ? tab[id] : null;
        if (!rec || !rec.s || !Number.isFinite(rec.s.api)) return null;
        const k = rec.kind;
        if (k !== "tree" && k !== "shrub" && k !== "flower" && k !== "fern") return null;
        return { id, rec };
    }

    // Die 5 Regler {api,slim,trop,delta,leaf} einer Art (Werkstatt-Panel, Regrow) — ihre Rezept-Zeile im Gesetzbuch.
    _treeRecipeDials(speciesKey) {
        const art = this._phytoArt(speciesKey);
        if (!art) return null;
        const s = art.rec.s;
        return { api: s.api, slim: s.slim, trop: s.trop, delta: s.delta, leaf: s.leaf };
    }

    _growTreeBlueprintRich(speciesKey, seed, opts) {
        // LOD-Stufen aus EINEM Gesetz: `opts.lod` ist die Bau-Stufe von treeParams (Blatt-Stride, Blatt-Maß, Wurzeln) und
        // beschneidet die Part-Tiefe, nie die Form — lod 0 = Hero · lod 1 = nur L1 · lod 2 = Stamm + 1 Kronen-Anker. Der
        // seed ist über alle Stufen identisch; die Kronen-Mitte (Skeleton-Anchors) wandert nicht → kein LOD-Pop.
        const lodLevel = opts && Number.isFinite(opts.lod) ? Math.max(0, Math.min(2, opts.lod | 0)) : 0;
        const sKey = String(speciesKey || "baum_eiche") + "|" + String(seed || "g8-default") + "|v5";
        let hash = 2166136261;
        for (let i = 0; i < sKey.length; i++) hash = ((hash ^ sKey.charCodeAt(i)) * 16777619) >>> 0;
        if (!this._growTreeNoise) {
            const worldSeed = (this.state.worldMeta && this.state.worldMeta.seed) || "anazh-realm-seed";
            this._growTreeNoise = new SimplexNoise(worldSeed + "-veg-grammatik");
        }
        const n = this._growTreeNoise;
        let step = 0;
        const r01 = () => {
            step++;
            const v = n.noise2D((hash >>> 0) * 0.0137 + step * 17.31, step * 7.79 - (hash >>> 8) * 0.0083);
            return (v + 1) * 0.5;
        };
        const lerp = (a, b, t) => a + (b - a) * t;
        // ─── DIE ART UND IHR GESETZ (K24) ───
        // Regler, Phänotyp und Bau-Stufe fließen durch die EINE Ableitung `__phytoCore.treeParams` — mit der Phänotyp-Zeile
        // der Art (die Buche ihre glatte graue Rinde, der Karst-Baum seinen Wurzelanlauf), wie der gesehene Baum im Worker.
        // Instanz-Varianz = der Saat-Wurf des Gesetzes (±16 % Höhe, ±0,1 Regler, der Farb-Wurf). opts.recipeDials
        // überschreibt die Regler (Werkstatt → Live-Vorschau). Keine Genom-Krone, keine Neigung, kein Herbst-Ton: der
        // gefühlte Baum trägt nur, was das Gesetz trägt.
        const art = this._phytoArt(speciesKey);
        if (!art) return null;
        const pc = globalThis.__phytoCore;
        if (!pc || typeof pc.treeParams !== "function") return AnazhRealm._kernPflichtBruch("phyto:treeParams");
        const dials = (opts && opts.recipeDials) || art.rec.s;
        // DIE GESTALT (K20): `opts.gestalt` = { g, ov } — der gefühlte Baum IST der gezeichnete: sein Skelett wächst aus
        // derselben Gestalt, wie der Worker sie baut (foundry-core `skelettDerGestalt`: Same g, Strom, Ableitung samt
        // Prägung des Orts, Stufen-Rezept). Ohne Gestalt (Werkstatt, Grammatik-Welt) der Same des Aufrufers.
        const gestalt = opts && opts.gestalt;
        let gewachsen = null;
        if (gestalt) {
            const tc = globalThis.__terrainCore;
            if (!tc || typeof tc.skelettDerGestalt !== "function")
                return AnazhRealm._kernPflichtBruch("terrain:skelettDerGestalt");
            gewachsen = tc.skelettDerGestalt(art.id, gestalt.g, lodLevel, gestalt.ov || null);
            if (!gewachsen) return null;
        }
        // DAS WELT-MASS (K20): der gefühlte Baum wächst mit der Welt-Skala seiner Art, wie der Wald den gesehenen pflanzt
        // (die EINE Template→Welt-Quelle `_foundryWorldScaleMatrix`, dieselbe Zahl wie der Kern `__weltSkalaArt`) — der
        // Stamm, den die Kollision liest, misst H/hd wie der gezeichnete (vorher der Stamm der Form: Eiche 0,88 statt 0,22 m).
        const P0 = gewachsen
            ? gewachsen.P
            : pc.treeParams(dials, hash >>> 0, lodLevel, art.rec, this._foundryWorldScaleMatrix(art.id).elements[0]);
        // Die Größenklasse ist ein abgeleitetes Etikett der Ableitung (nur baum_*: Sträucher und Kräuter SIND klein).
        const isTreeSpecies = String(speciesKey || "").startsWith("baum_");
        let sizeClass;
        if (!isTreeSpecies) sizeClass = "normal";
        else if (P0.barkType === "sequoia" || P0.height >= 18) sizeClass = "gigant";
        else if (P0.height >= 9) sizeClass = "gross";
        else sizeClass = "normal";
        const parts = [];
        // Skeleton-Container: flacher Branch-Pool (Polylinien-Punkte + Level + isTrunk), Foliage-Anker und
        // Welt-Höhe für die Flex-Berechnung; nach dem Bau in `_lastTreeSkeleton` gespiegelt.
        const totalH = P0.height;
        // Das Laub der Art aus dem Gesetz: Nadel oder Blatt (der Phänotyp), kahl das Totholz, das Blatt-Maß der Stufe.
        const laub = { kind: P0.tot ? "none" : P0.conifer ? "needleSpray" : "leafCluster", size: P0.leafSize };
        const skeleton = {
            species: speciesKey,
            art: art.id,
            laub,
            totalH,
            branches: [], // [{ points: [{x,y,z,r}, ...], level: int, isTrunk: bool }]
            anchors: [], // [{x,y,z}]
            // Der Wurzelanlauf aus dem Gesetz (P.flare, der Phänotyp der Art — die Studio-Gestalt liest dieselbe Größe);
            // die Rippen sind ein Maß der Werkstatt-Röhre (der Stamm des Studios ist glatt). Die Hand-Zeile je Art
            // (SPECIES_TREE_PARAMS.flare) und ihr stiller Ersatz DEFAULT_TREE_FLARE sind gefallen (K24-N1).
            flareAmp: P0.flare,
            flareLobes: AnazhRealm.STAMM_RIPPEN,
            // die Blatt-Form der Art (Superformel des Phänotyps) — die Klingen der Werkstatt lesen sie wie das Studio
            leafShape: P0.leafShape,
            // V18.218 — die LOD-Stufe reist in den Skeleton; die Tube-/Cards-
            // Geometrie-Builder können sie lesen (z.B. radialSegs reduzieren).
            lodLevel: lodLevel,
        };
        // emitCylinderBetween: die EINE Stelle, die eine Segment-Kante zu einem holz-Zylinder-
        // Part macht (Trunk/Äste/Buttress teilen sie). Tag-neutral (material "holz").
        const emitCylinderBetween = (a, b, segments) => {
            const mx = (a.x + b.x) * 0.5;
            const my = (a.y + b.y) * 0.5;
            const mz = (a.z + b.z) * 0.5;
            const dx = b.x - a.x;
            const dy = b.y - a.y;
            const dz = b.z - a.z;
            const len = Math.sqrt(dx * dx + dy * dy + dz * dz);
            if (!(len > 0.001)) return;
            const r = Math.max(0.04, (a.r + b.r) * 0.5);
            const horizLen = Math.sqrt(dx * dx + dz * dz);
            const pitch = Math.atan2(horizLen, dy); // 0 = aufrecht, π/2 = waagrecht
            const yaw = Math.atan2(dx, dz);
            parts.push({
                shape: "cylinder",
                material: "holz",
                position: { x: mx, y: my, z: mz },
                size: { x: r * 2, y: len, z: r * 2 },
                rotation: { y: yaw, z: pitch },
                segments: segments || 5,
            });
        };
        // Stamm + Äste wachsen aus den GESETZEN (McMahon H→D · da Vinci r^Δ · Apikaldominanz): der Phyto-Kern
        // (_phytoGrowSkeleton) ist die EINE Wuchs-Quelle, P die EINE Ableitung. Eigener Sub-Strom `genome.seq`
        // (unabhängig von r01). Ausgänge: parts[] (cylinder holz + sphere laub, Tags frozen) + `_lastTreeSkeleton`.
        const phytoSeq = this._rollGenome(sKey, "tree-genome").seq("phyto-growth");
        // Hier reiten nur die Render-Budgets auf P (countCap/leafBudget schneiden DETAIL nach dem Wuchs, nie den
        // Zufalls-Strom; trunkMul=1). leafBudget 480 bei L0 füllt die Krone wie die Vorlage.
        const P = Object.assign({}, P0, {
            trunkMul: 1,
            countCap: lodLevel === 0 ? 3600 : lodLevel === 1 ? 600 : 90,
            leafBudget: lodLevel === 0 ? 480 : lodLevel === 1 ? 90 : 8,
        });
        // die Gestalt trägt ihr gewachsenes Skelett (der Strom des Workers), sonst wächst es hier aus dem Samen
        const phyto = gewachsen ? gewachsen.nodes : this._phytoGrowSkeleton(P, phytoSeq);
        const trunkBaseR = phyto.trunkR;
        // Trunk-Kette = run 0 + die durchgehende Lead-Nachkommen-Kette. Der Wuchs ist tiefen-zuerst mit dem
        // Lead als children[0] → countCap beschneidet nur Seiten-Äste, NIE die Stammhöhe.
        const runMeta = phyto.runMeta;
        const isTrunkRun = {};
        for (const rid in runMeta) {
            const m = runMeta[rid];
            isTrunkRun[rid] = m.parentRun < 0 || (m.isLead && isTrunkRun[m.parentRun] === true);
        }
        // Segmente nach runId zu Polylinien gruppieren (der Card-/Tube-Builder liest Polylinien).
        const runPolys = {};
        for (const s of phyto.segs) {
            let poly = runPolys[s.runId];
            if (!poly) {
                poly = runPolys[s.runId] = {
                    points: [{ x: s.p0[0], y: s.p0[1], z: s.p0[2], r: s.r0 }],
                    depth: s.depth,
                };
            }
            poly.points.push({ x: s.p1[0], y: s.p1[1], z: s.p1[2], r: s.r1 });
        }
        // Die Trunk-Kette als EINE Skeleton-Branch (wie der alte Stamm) + trunkPts für die
        // Downstream-Leser (Foot-Flare/Buttress).
        const trunkPts = [];
        const trunkRunIds = Object.keys(runPolys)
            .filter((rid) => isTrunkRun[rid])
            .map(Number)
            .sort((a, b) => a - b);
        for (const rid of trunkRunIds) {
            const pts = runPolys[rid].points;
            for (let i = 0; i < pts.length; i++) {
                if (trunkPts.length && i === 0) continue; // der geteilte Naht-Punkt nicht doppeln
                trunkPts.push(pts[i]);
            }
        }
        if (trunkPts.length < 2) {
            trunkPts.length = 0;
            trunkPts.push({ x: 0, y: 0, z: 0, r: trunkBaseR }, { x: 0, y: totalH, z: 0, r: trunkBaseR * 0.2 });
        }
        // LOD-Dezimierung der Stamm-Polylinie (ein Zylinder-Part je Kante; LOD1 ≤20 · LOD2 ≤10 Parts):
        // erster + letzter Punkt bleiben (Höhe/Verjüngung), dazwischen jeden n-ten.
        if (lodLevel > 0 && trunkPts.length > 3) {
            const stride = lodLevel === 1 ? 3 : Math.max(2, Math.ceil((trunkPts.length - 1) / 3));
            const dec = [trunkPts[0]];
            for (let i = stride; i < trunkPts.length - 1; i += stride) dec.push(trunkPts[i]);
            dec.push(trunkPts[trunkPts.length - 1]);
            trunkPts.length = 0;
            for (const pt of dec) trunkPts.push(pt);
        }
        skeleton.branches.push({
            points: trunkPts.map((p) => ({ x: p.x, y: p.y, z: p.z, r: p.r })),
            level: 0,
            isTrunk: true,
        });
        // Trunk-Zylinder-Parts (immer voll — der Stamm ist die tragende Form). branchPartCount
        // trägt über in die Ast-Konvertierung (Span 2), damit MAX_BRANCH_PARTS gesamt cappt.
        let branchPartCount = 0;
        for (let i = 1; i < trunkPts.length; i++) {
            emitCylinderBetween(trunkPts[i - 1], trunkPts[i], 6);
            branchPartCount++;
        }

        // ─── BAUM-FUSS / WURZELANLAUF ───
        // Flache, moos-grüne Disk (y-gequetschte sphere) bindet den Stamm an den Voxel-Boden. laub-Material
        // + gleiche Shape/Material-Combo wie der Foliage-Anker → computeCompoundTags (MAX) bleibt invariant.
        const flareR = trunkBaseR * 2.2 * lerp(0.85, 1.15, r01());
        const flareH = trunkBaseR * 0.5;
        // Mossy-Tönung — ein gedämpftes Grün das mit dem Foliage-Color
        // gleitet (Krone gibt den Wald-Ton, der Sockel folgt sanft).
        const flareTint = (P0.leafCol & 0x7f7f7f) | 0x1a1a1a; // gedämpfte Version der Laub-Farbe des Gesetzes
        parts.push({
            shape: "sphere",
            material: "laub",
            color: flareTint,
            position: { x: 0, y: flareH * 0.4, z: 0 },
            size: { x: flareR * 2, y: flareH * 1.6, z: flareR * 2 },
        });
        // Brettwurzeln nur am GIGANT: N strebende holz-Zylinder am Fuß (gleiche Form+Material wie der Stamm
        // → Tags bit-identisch). Niedrig + auswärts angewinkelt, damit der Knick-Richter sie nicht prüft.
        if (sizeClass === "gigant" && trunkBaseR > 0.001) {
            const nButt = 5 + Math.floor(r01() * 3); // 5-7 Brettwurzeln
            const buttH = totalH * (0.05 + r01() * 0.04); // niedriger Anlauf
            const outR = trunkBaseR * (1.8 + r01() * 0.8);
            for (let b = 0; b < nButt; b++) {
                const th = (b / nButt) * Math.PI * 2 + r01() * 0.3;
                const baseP = { x: Math.cos(th) * outR, y: 0, z: Math.sin(th) * outR, r: trunkBaseR * 0.5 };
                const topP = {
                    x: Math.cos(th) * trunkBaseR * 0.6,
                    y: buttH,
                    z: Math.sin(th) * trunkBaseR * 0.6,
                    r: trunkBaseR * 0.85,
                };
                emitCylinderBetween(baseP, topP, 5);
                skeleton.branches.push({
                    points: [baseP, topP].map((p) => ({ x: p.x, y: p.y, z: p.z, r: p.r })),
                    level: 0,
                    isTrunk: false,
                });
            }
        }

        // DAS NEUE KLEID K1 — die SEITEN-ÄSTE + FOLIAGE-ANKER aus dem Phyto-Wuchs (Span 2).
        // Die alte collectTips/growBranch/crownEnvelope-Rekursion ist der Phyto-Kern (K0)
        // geworden; hier wird sein Ergebnis in die zwei kanonischen Ausgänge konvertiert.
        const sizeCapBoost = sizeClass === "gigant" ? 1.5 : sizeClass === "gross" ? 1.2 : 1;
        const MAX_BRANCH_PARTS = Math.round((lodLevel === 0 ? 44 : lodLevel === 1 ? 8 : 2) * sizeCapBoost);
        // Bark-Tubes (teuer, gemergt) nach DICKE cappen: Stamm + Haupt-Limbs bleiben, haardünne Terminal-
        // Zweige unterm Laub fallen; die Foliage-Cards tragen die Krone. Skalen-gerecht (sizeCapBoost).
        const MAX_SKELETON_BRANCHES = Math.round((lodLevel === 0 ? 72 : lodLevel === 1 ? 22 : 0) * sizeCapBoost);
        const foliageAnchors = [];
        // LOD-Pruning der Seiten-Äste: lod0 alle · lod1 flachere (depth ≤ 2) · lod2 nur Stamm.
        const maxBranchDepth = lodLevel === 0 ? 99 : lodLevel === 1 ? 2 : 0;
        // Seiten-Äste nach START-DICKE sortiert (die dicksten = die tragende Struktur zuerst),
        // dann bis MAX_SKELETON_BRANCHES cappen.
        const nonTrunk = Object.keys(runPolys)
            .filter((rid) => !isTrunkRun[rid] && runPolys[rid].depth <= maxBranchDepth)
            .map((rid) => runPolys[rid])
            .sort((a, b) => (b.points[0] ? b.points[0].r : 0) - (a.points[0] ? a.points[0].r : 0));
        for (let bi = 0; bi < nonTrunk.length && bi < MAX_SKELETON_BRANCHES; bi++) {
            const poly = nonTrunk[bi];
            // Skeleton-Branch (Tube-Builder liest die volle Polylinie; die Tubes mergen zu
            // EINER Geometrie pro Template → kein Draw-Call-Sprung, V18.214-Muster).
            skeleton.branches.push({
                points: poly.points.map((pt) => ({ x: pt.x, y: pt.y, z: pt.z, r: pt.r })),
                level: Math.max(1, Math.min(3, poly.depth)),
                isTrunk: false,
            });
            // Zylinder-Parts (die Tag-tragende + fallback-Geometrie) — separat gecappt.
            for (let i = 1; i < poly.points.length && branchPartCount < MAX_BRANCH_PARTS; i++) {
                emitCylinderBetween(poly.points[i - 1], poly.points[i], 4);
                branchPartCount++;
            }
        }
        // Foliage-Anker aus den PHYTO-BLÄTTERN — ihre Positionen (aus der gesetz-wahren
        // Verzweigung) treiben die Cards; das IST der K1-Gewinn (Laub sitzt, wo das Gesetz es
        // wachsen ließ, nicht auf geratenen Ankern). lod2: ein zentraler Krone-Anker.
        if (laub.kind !== "none") {
            if (lodLevel === 2) {
                const top = trunkPts[trunkPts.length - 1];
                foliageAnchors.push({ x: top.x, y: totalH * 0.85, z: top.z });
            } else {
                // Die VOLLEN Phyto-Blätter tragen (pos/dir/up/scale/needle/phase — phase dreht die Karte) — daraus
                // baut `__phytoCore.buildFoliageQuads` die Krone.
                const phytoLeaves = [];
                for (const l of phyto.leaves) {
                    foliageAnchors.push({ x: l.pos[0], y: l.pos[1], z: l.pos[2] });
                    phytoLeaves.push({
                        pos: [l.pos[0], l.pos[1], l.pos[2]],
                        dir: [l.dir[0], l.dir[1], l.dir[2]],
                        up: l.up ? [l.up[0], l.up[1], l.up[2]] : [0, 1, 0],
                        scale: l.scale,
                        needle: !!l.needle,
                        phase: l.phase,
                    });
                }
                skeleton.phytoLeaves = phytoLeaves;
                if (!foliageAnchors.length) {
                    const top = trunkPts[trunkPts.length - 1];
                    foliageAnchors.push({ x: top.x, y: totalH * 0.85, z: top.z });
                }
            }
        }
        // ─── LAUB AN DEN ANKERN (§3.4) ───
        // Farbe und Maß aus dem Gesetz: die Rinde der Art (P.barkA/barkB, ihr Phänotyp), das Laub ihr Farb-Wurf (P.leafCol,
        // der r128-Wurf des Gesetzes), das Blatt-Maß der Stufe (P.leafSize) — derselbe Ton wie der gesehene Baum.
        skeleton.barkA = P0.barkA;
        skeleton.barkB = P0.barkB;
        const laubColor = P0.leafCol;
        // Laub-Cap je LOD (35 / 4 / 1 × sizeCapBoost): EIN Laub-Ball je Anker-Probe, mehr Anker als das Limit →
        // gleichmäßig jedes step-te samplen (kein Sektor-Bias).
        const MAX_FOLIAGE_PARTS = Math.round((lodLevel === 0 ? 35 : lodLevel === 1 ? 4 : 1) * sizeCapBoost);
        const anchorStep = Math.max(1, Math.floor(foliageAnchors.length / Math.max(1, MAX_FOLIAGE_PARTS)));
        let foliageEmitted = 0;
        if (laub.kind !== "none") {
            for (let ai = 0; ai < foliageAnchors.length && foliageEmitted < MAX_FOLIAGE_PARTS; ai += anchorStep) {
                const a = foliageAnchors[ai];
                const lR = laub.size * lerp(0.75, 1.1, r01());
                // Nadel: y-gestreckte sphere (Nadel-Optik) · Blatt: kompakter Laub-Knäul — kein neuer Shape-Typ, die
                // Tags bleiben neutral.
                const nadel = laub.kind === "needleSpray";
                parts.push({
                    shape: "sphere",
                    material: "laub",
                    color: laubColor,
                    position: { x: a.x, y: a.y, z: a.z },
                    size: nadel
                        ? { x: lR * 1.5, y: lR * 1.9, z: lR * 1.5 }
                        : { x: lR * 2.0, y: lR * 1.45, z: lR * 2.0 },
                });
                foliageEmitted++;
            }
        }
        // Die foliageAnchors sind die echten Card-Anker: ins Skeleton kopieren — _buildTreeFoliageCardGeometry
        // baut daraus card{cross} je Anchor mit normalBend zur Kronen-Sphere.
        skeleton.anchors = foliageAnchors.map((a) => ({ x: a.x, y: a.y, z: a.z }));
        skeleton.foliageColor = laubColor;
        skeleton.sizeClass = sizeClass;
        // Side-Channel: der Aufrufer (\`_growTreeBlueprintForSpawn\`,
        // \`_loadStateRestoreGrownBlueprints\`) liest das direkt nach dem Aufruf.
        this._lastTreeSkeleton = skeleton;
        return parts;
    }

    _growTreeBlueprintLegacy(speciesKey, seed) {
        // Die SPEZIES geht in den Seed-Hash (Determinismus je Art) UND in die Form-Modulation (Tanne konisch
        // + dunkel, Birke schmal + hell, Eiche breit + warm-grün). Materialien bleiben holz+laub (Tags fest).
        const sKey = String(speciesKey || "baum_eiche") + "|" + String(seed || "g7-default");
        let hash = 2166136261;
        for (let i = 0; i < sKey.length; i++) hash = ((hash ^ sKey.charCodeAt(i)) * 16777619) >>> 0;
        // Lazy-Init Noise-Stream
        if (!this._growTreeNoise) {
            const worldSeed = (this.state.worldMeta && this.state.worldMeta.seed) || "anazh-realm-seed";
            this._growTreeNoise = new SimplexNoise(worldSeed + "-veg-grammatik");
        }
        const n = this._growTreeNoise;
        // Deterministische [0, 1)-RNG je seed: SimplexNoise mit hash als x und step-Zähler als y (eigene
        // Sequenz pro seed, unabhängig von der Position).
        let step = 0;
        const r01 = () => {
            step++;
            const v = n.noise2D((hash >>> 0) * 0.0137 + step * 17.31, step * 7.79 - (hash >>> 8) * 0.0083);
            return (v + 1) * 0.5;
        };
        const lerp = (a, b, t) => a + (b - a) * t;
        const parts = [];
        // Spezies-Profil: je Art ein Form-Modulations-Block (Stamm-Aspect, Kronen-Farbe, Astzahl/-Form) als
        // Multiplier auf die base-Ranges. Default = Eiche.
        const SPECIES_PROFILE = {
            baum_eiche: {
                trunkMul: 1.0,
                trunkR: 1.0,
                crownColor: 0x4a8a3a,
                crownScale: 1.0,
                astExtra: 1,
                taperBase: 0.65,
            },
            baum_kiefer: {
                trunkMul: 1.15,
                trunkR: 0.85,
                crownColor: 0x3a6b3a,
                crownScale: 0.75,
                astExtra: 0,
                taperBase: 0.78,
            },
            baum_birke: {
                trunkMul: 1.1,
                trunkR: 0.65,
                crownColor: 0x7ab86a,
                crownScale: 0.8,
                astExtra: 0,
                taperBase: 0.72,
            },
            baum_erle: {
                trunkMul: 0.95,
                trunkR: 0.95,
                crownColor: 0x5a8c4a,
                crownScale: 0.95,
                astExtra: 1,
                taperBase: 0.68,
            },
            baum_buche: {
                trunkMul: 1.05,
                trunkR: 1.05,
                crownColor: 0x6a9a4a,
                crownScale: 1.05,
                astExtra: 1,
                taperBase: 0.65,
            },
            baum_tanne: {
                trunkMul: 1.25,
                trunkR: 0.7,
                crownColor: 0x2c5a2c,
                crownScale: 0.7,
                astExtra: -1,
                taperBase: 0.82,
            },
        };
        const prof = SPECIES_PROFILE[speciesKey] || SPECIES_PROFILE.baum_eiche;
        // STAMM — 3 Segmente, wander + taper, spezies-moduliert.
        const stammHoehe = lerp(3.5, 5.5, r01()) * prof.trunkMul;
        const stammRadius = lerp(0.5, 0.85, r01()) * prof.trunkR;
        const taperRate = lerp(prof.taperBase, prof.taperBase + 0.15, r01()); // pro Spezies eigenes Taper-Profil
        const wanderJitter = lerp(0.04, 0.18, r01()); // wie sehr der Stamm wandert
        let trunkX = 0,
            trunkZ = 0;
        let trunkY = 0;
        let trunkR = stammRadius;
        const segH = stammHoehe / 3;
        for (let i = 0; i < 3; i++) {
            const segCenterY = trunkY + segH * 0.5;
            parts.push({
                shape: "cylinder",
                material: "holz",
                position: { x: trunkX, y: segCenterY, z: trunkZ },
                size: { x: trunkR * 2, y: segH, z: trunkR * 2 },
                segments: 6,
            });
            // wander für nächstes Segment
            trunkX += (r01() - 0.5) * wanderJitter * segH;
            trunkZ += (r01() - 0.5) * wanderJitter * segH;
            trunkY += segH;
            trunkR *= taperRate; // taper
        }
        // WHORL-ÄSTE — Astzahl + Länge spezies-moduliert (Tanne hat weniger,
        // dichte sich-überlappende Äste; Eiche/Buche haben mehr, weiter
        // ausladende Äste).
        const astCount = Math.max(2, 3 + prof.astExtra + Math.floor(r01() * 2));
        const astLen = lerp(1.4, 2.4, r01()) * prof.crownScale;
        const astRadius = lerp(0.18, 0.32, r01());
        const astBaseY = trunkY * 0.6; // mittlere Höhe des Stammes
        // Ende-Positionen für Ebene-2-Krone speichern
        const astEnds = [];
        for (let a = 0; a < astCount; a++) {
            const phi = (a / astCount) * Math.PI * 2 + r01() * 0.4; // Whorl-Anordnung + jitter
            const tilt = lerp(0.6, 1.1, r01()); // Neigungs-Winkel der Achse
            const tipX = Math.cos(phi) * astLen * Math.sin(tilt);
            const tipZ = Math.sin(phi) * astLen * Math.sin(tilt);
            const tipY = astBaseY + astLen * Math.cos(tilt) * 0.6;
            const midX = tipX * 0.5;
            const midZ = tipZ * 0.5;
            const midY = (astBaseY + tipY) * 0.5;
            parts.push({
                shape: "cylinder",
                material: "holz",
                position: { x: trunkX + midX, y: midY, z: trunkZ + midZ },
                size: { x: astRadius * 2, y: astLen, z: astRadius * 2 },
                // rotation aus Phi+Tilt: rotation.z (+ rotation.y) kippt den cylinder so, dass seine y-Achse entlang
                // des Ast-Vektors liegt.
                rotation: {
                    z: tilt,
                    y: phi,
                },
                segments: 5,
            });
            astEnds.push({ x: trunkX + tipX, y: tipY, z: trunkZ + tipZ });
        }
        // KRONE — Laub-Ellipsoide NUR an Ebene-2-Enden (1–2 je Ast, Größe deterministisch variiert);
        // die Spezies moduliert Farb-Basis + Kronen-Größe.
        const baseColor = prof.crownColor;
        // V18.235 (§5 Ω-O9) — PER-KANAL-Variation (das numerische `baseColor + jitter`
        // ließ die Bytes überlaufen → Grün wusch zu Purple). ±16 pro Kanal, geklemmt.
        const _lbR = (baseColor >> 16) & 0xff,
            _lbG = (baseColor >> 8) & 0xff,
            _lbB = baseColor & 0xff;
        const _lcl = (v) => Math.max(0, Math.min(255, v | 0));
        const laubColor =
            (_lcl(_lbR + Math.floor((r01() - 0.5) * 32)) << 16) |
            (_lcl(_lbG + Math.floor((r01() - 0.5) * 32)) << 8) |
            _lcl(_lbB + Math.floor((r01() - 0.5) * 32));
        const laubRadiusBase = lerp(0.85, 1.4, r01()) * prof.crownScale;
        for (const end of astEnds) {
            const subCount = 1 + Math.floor(r01() * 2); // 1 oder 2 Ellipsoide
            for (let s = 0; s < subCount; s++) {
                const ox = (r01() - 0.5) * 0.6;
                const oz = (r01() - 0.5) * 0.6;
                const oy = r01() * 0.4;
                const lR = laubRadiusBase * lerp(0.7, 1.1, r01());
                parts.push({
                    shape: "sphere",
                    material: "laub",
                    color: laubColor,
                    position: { x: end.x + ox, y: end.y + oy, z: end.z + oz },
                    size: { x: lR * 2, y: lR * 1.6, z: lR * 2 },
                });
            }
        }
        return parts;
    }
}
