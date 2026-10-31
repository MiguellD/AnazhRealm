class AnazhRealm_siedlung_bauten {
    // ===== ATLAS · Siedlung/bauten — Arch-Mesh · Arch-Flatten · Chunk-Satz · Varianten-LOD · Okklusion =====
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
    // → LOD2. Hysterese (thrLo für schon Verdeckte) gegen Flattern; kein Regler in der Schwelle (lod.K5).
    _occlusionOccludes(camX, camZ, tx, tz, dr, wasOccluded) {
        const grid = this._occlGrid;
        if (!grid || grid.size === 0 || !(dr > 0)) return false;
        const O = AnazhRealm.OCCLUSION;
        const cellM = O.cellM;
        const ix = (tx - camX) / dr;
        const iz = (tz - camZ) / dr;
        const tEnd = dr - O.endMargin;
        const thr = wasOccluded ? O.thrLo : O.thrHi;
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
        // V18.389 (SUBSYSTEM 3) — Occlusion-Demotion aktiv? Headless (Null-Renderer) → AUS
        // (gate-treu: das Gate sieht die reine Distanz-LOD, unperturbiert). Bei aktiv das
        // Kronen-Gitter throttled neu bauen (einmal je Gang eingehängt).
        const st = this.state;
        const occlOn = st.useOcclusionDemotion !== false && !(st.renderer && st.renderer._isHeadlessNull);
        // DIE BEWEGTEN (das EINE Stufen-Gesetz: Bewegte prüfen) urteilen vor der Wache — ihre Kosten tragen sie selbst
        const bewegt = this._archBewegteUrteilen(pm, occlOn);
        // DIE STAND-WACHE: ging die Stufen-Wahl eine volle Runde über alle Einträge, ohne zu wechseln und ohne dass einer
        // wartete, und regt sich nichts (Ort, Bau-Menge, Ankunft, Regler), wählt sie dieselben Stufen — kein Gang. Ohne
        // Eintrag ist die Runde 0 und gegangen: auch die leere Wahl geht durch die Wache, nie an ihr vorbei.
        const n = Array.isArray(archs) ? archs.length : 0;
        if (this._standRuht("archLod", n, { pos: pm, rand: AnazhRealm.STAND_RAND_M }, "bau")) return bewegt;
        // Rolling cursor: jeder Tick walkt nur einen Slice des Arrays. Bei
        // grossen Welten (10k+ Architekturen) bleibt der Tick bounded. Den
        // Cursor speichern wir an state — er reist nicht im Snapshot.
        if (!Number.isFinite(this._archLODCursor)) this._archLODCursor = 0;
        if (occlOn) this._maybeRebuildOcclusionGrid();
        const z = this._archStufeZaehler();
        const sliceLen = Math.min(archs.length, 256); // wieviele Einträge pro Frame ANSCHAUEN
        // Der Cursor rückt um die BESUCHTEN Einträge vor: endete die Scheibe am Wechsel-Budget, ging der Rest der Scheibe
        // bis 05.10. eine ganze Runde leer aus (gate:fernwald D: nach 18 m Weg stand der Baum am Radius 40 Takte ohne
        // seinen Zonen-Stempel).
        let besucht = 0;
        for (let i = 0; i < sliceLen && bewegt + z.switches < maxSwitchesPerFrame; i++) {
            besucht = i + 1;
            const entry = archs[(this._archLODCursor + i) % archs.length];
            if (entry) this._archStufeUrteil(entry, pm, occlOn, z);
        }
        this._archLODCursor = (this._archLODCursor + besucht) % archs.length;
        // Mit Verdeckung schläft die Wahl nur auf einem Gitter, das den jetzigen Bau-Stand trägt (sonst hielte sie ein
        // Urteil über eine Krone, die es nicht mehr gibt) — bis zum nächsten gedrosselten Neubau bleibt sie wach.
        const gitterAlt = occlOn && this._occlGridRegung !== (this._weltRegung | 0);
        this._standMeldet("archLod", besucht, z.switches + z.regung > 0, z.offen > 0 || gitterAlt);
        return bewegt + z.switches;
    }

    // Der Zähler eines Gangs der Stufen-Wahl (Wechsel · Regung · Offene), je Gang genullt — EIN Objekt, keine Last je Bild.
    _archStufeZaehler() {
        const z = this._archStufeZ || (this._archStufeZ = { switches: 0, regung: 0, offen: 0 });
        z.switches = z.regung = z.offen = 0;
        return z;
    }

    // DAS URTEIL DER STUFE EINES EINTRAGS am Auge `pm` (die EINE Wahl, die der rollende Gang und die Bewegten fragen): Distanz,
    // Sichthöhe, Grenzen des Gesetzbuchs oder Hysterese der Bäume, Verdeckung, Vorlauf, Band-Pflege, Wechsel. `z` zählt
    // Wechsel, Regung und Offene (die Stufe lädt, der Partner lädt, die Höhe lädt).
    _archStufeUrteil(entry, pm, occlOn, z) {
        if (!entry.instanced) return;
        const st = this.state;
        // Auch platzierte Studio-Architektur (instFoundry) tickt LOD — sonst behält ein Haus im Cull-Radius
        // seine Bau-Stufe für immer (~75k Tris/Haus auch bei 120 m). Eligibility ist daten-getrieben; die
        // Stufen je Art bleiben kindStages in _foundryFlattenFor (kein kind-Literal).
        const treeLike = !!entry._lodSpecies && Number.isFinite(entry._lodVariantIndex);
        if (!treeLike && entry.instFoundry !== true) return;
        const dx = entry.position.x - pm.x;
        const dz = entry.position.z - pm.z;
        const dist = Math.sqrt(dx * dx + dz * dz);
        // V18.387 — Baum-Einträge reichen ihre Sichthöhe durch → Wahrnehmungs-
        // Distanz-LOD (größere Bäume schalten später, unter Last alle früher).
        const visH = this._lodTreeVisHeight(entry);
        if (visH === null) {
            z.offen++;
            return; // die Höhen-Stufe lädt: der Baum hält Stufe und Band
        }
        // Die BRÜCKE trägt keinen Hysterese-Zustand: ihre Stufe 2 ist die gedockte Karte, nicht die Wahl. Mit ihr als
        // Zustand blieb die Wahl im Band [thresh12 − hyst, thresh12] (22,6–26 m) auf 2, die Brücke löste sich als
        // „Karte" auf und blendete nach Distanz aus — ohne L1-Partner, der Baum stand halb ausgedithert.
        // DIE GRENZEN DES GESETZBUCHS (K43): nennt die Art ihre Stufen-Grenzen (B2c `ab`), wählt der Takt nach ihnen — in
        // der Ankunft aus der Ferne (`_ankunftsFerne`, B2) die Grobstufe
        // DIE FERNE IST KEIN ZUSTAND (w4-genesis-tore): die Hysterese hält eine Stufe gegen das Zittern eines BEWEGTEN Auges —
        // sie gilt nur für eine Stufe, die die Wahl am echten Abstand bestätigt hat (`_lodAmAbstand`). Was die Ankunft setzte
        // (der Kalt-Schätzer `_foundryLodForEntry` und jede Wahl, solange die Ferne > 1 misst), wählt danach am Abstand ohne
        // Zustand, bis die Stufe steht. Bis hier hielt das Band der Grobstufe (12 m ± 10 %) jedes Ring-Tor in 11 m auf der L2
        // der Ankunft — für immer (Genesis Ego: 7 von 7 Studio-Toren L2, 20 px Umriss-Fehler; die Wahl am Abstand ist die L1).
        // Dieselbe Klasse am Baum: was im Band seiner Schwelle stand, hielt die Karte der Ankunft.
        const ferne = this._ankunftsFerne();
        if (ferne > 1) entry._lodAmAbstand = false;
        const zustand = entry._lodAmAbstand === true ? entry._lodLevel : undefined;
        const grenzen = treeLike ? null : this._archStufenGrenzen(entry);
        let newLOD = grenzen
            ? AnazhRealm._stufeNachGrenzen(
                  dist * ferne,
                  zustand,
                  grenzen,
                  Number.isFinite(entry.scale) && entry.scale > 0 ? entry.scale : 1
              )
            : this._chooseLODForDistance(dist, entry._bruecke ? undefined : zustand, visH);
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
                z.regung++;
            } else {
                entry._occluded = occ;
            }
            if (occ) newLOD = 2;
        } else if (entry._occluded) {
            entry._occluded = false;
            this._lodSlotOcclusionRefresh(entry);
            z.regung++;
        }
        // DER STUFEN-VORLAUF (`_stufenVorlaufWahl`): unter dem Ladeschirm trägt der Baum seiner Art die L1
        if (this._imStufenVorlauf(entry)) newLOD = 1;
        // steht der Eintrag auf der Wahl am Abstand (ohne Ferne), ist seine Stufe ab jetzt ein Zustand der Hysterese
        if (ferne <= 1 && newLOD === entry._lodLevel) entry._lodAmAbstand = true;
        if (newLOD === entry._lodLevel) {
            // Die Distanz-Wahl ist selbst die Karte: die Brücke ist keine mehr, die Karte blendet wie jede Fernstufe.
            if (entry._bruecke) {
                entry._bruecke = false;
                this._lodSlotOcclusionRefresh(entry);
                z.regung++;
            }
            // Band-Pflege ohne Primär-Wechsel: der Eintrag wandert durchs Dither-Crossfade-Band, die
            // Doppel-Mitgliedschaft folgt der Partner-Wahl. Band-Add/-Remove zählt aufs selbe Spike-Budget.
            // Flag-Wand zuerst (foundryCrossfade aus → billiger Tick).
            if (st.foundryCrossfade === true && this._updateFoundryLodBand(entry, dist)) z.switches++;
            if (entry._lodHaltWartet === true) z.offen++; // der Partner lädt: die Stufe hält, die Wahl bleibt wach
            return;
        }
        // LOD-Switch — re-allocate
        const vorher = entry._lodLevel;
        const success = this._switchArchitectureLOD(entry, newLOD, dist);
        if (success) z.switches++;
        else if (entry._lodLevel !== vorher)
            z.regung++; // nur die Distanz-Autorität gestempelt (Stufen-Klammer)
        else if (entry._lodLevel !== newLOD) {
            // die Stufe lädt (oder bäckt): der Eintrag wartet — und seine stehende Stufe hält VOLL, wo ihr Partner
            // fehlt (die L1 jenseits des Bands vor der ungebackenen Karte war sonst ganz verworfen: ein Loch)
            z.offen++;
            if (st.foundryCrossfade === true && this._updateFoundryLodBand(entry, dist)) z.regung++;
        }
    }

    // DIE BEWEGTEN (das EINE Stufen-Gesetz für jede Familie: Komposit erbt, Bewegte prüfen). Die Bau-Takte (Stufen-Wahl, Cull)
    // und ihre Stand-Wache sind für Stehendes gebaut: die Wache weckt nur Auge, Spieler, Stempel und Bau-Regung, der Cursor
    // kommt nach einer Runde über den Bestand. Ein Eintrag, dessen Lage nach dem Eintritt wandert (`_blockerBewegt`: der Wagen
    // des Verkehrs, das gerittene Werk, der gestoßene Wagen, `_archBewegt`), urteilt darum in dem Takt nach seinem Schritt
    // selbst — seine Stufe (`_archStufeUrteil`, dieselbe Wahl), seine Fernform (der Satz im Welt-March folgt seiner Lage,
    // `_weltFeldMatrix`) und sein Bild: steht es nicht, wie der Radius des Culls es will (ohne Bild im Radius, gezeichnet
    // dahinter), weckt er den Cull (`_standWecken`), der ihn setzt oder räumt. Wer wartet (die Stufe lädt), urteilt im
    // nächsten Takt wieder, auch wenn er hält. Die Kosten tragen die Bewegten, nie die Menge (Gebot 7); ihre Wechsel wecken
    // keinen Gang über den Bestand. Bis hier schliefen im Stand beide Bau-Takte jedes Bild (Blick-Sonde 31.10., Radeon,
    // stadt-voll Third: 808 von 808 Bildern): ein Wagen fuhr als Karte 16,7 s bis 11 m an den Spieler, ein anderer ohne Bild bis
    // 1,8 m, und sein Satz stand weiß, wo er gebacken wurde — 181 m hinter ihm. Rückgabe: die Wechsel dieses Takts.
    _archBewegteUrteilen(pm, occlOn) {
        const B = this._archBewegte;
        if (!B || !B.size) return 0;
        const z = this._archStufeZaehler();
        const M = this._archBewegtM || (this._archBewegtM = new THREE.Matrix4());
        const sp = this.state.playerMesh && this.state.playerMesh.position;
        const R = this.state.architectureCullingRadius;
        let cull = false;
        for (const entry of B) {
            const offen = z.offen;
            if (entry._ziegelSlot) this._weltFeldMatrix(entry._ziegelSlot, this._archWeltMatrix(entry, M));
            this._archStufeUrteil(entry, pm, occlOn, z);
            if (z.offen === offen) B.delete(entry);
            const d2 = sp ? (entry.position.x - sp.x) ** 2 + (entry.position.z - sp.z) ** 2 : NaN;
            if (!cull && d2 >= 0 && this._archIsRendered(entry) !== d2 <= R * R && !this._archKartenPreset(entry))
                cull = true;
        }
        if (cull) this._standWecken("archCull");
        return z.switches;
    }

    // Ein Eintrag wanderte (die Naht `_blockerBewegt`): er urteilt seine Stufe und seine Fernform im nächsten Takt der
    // Stufen-Wahl (`_archBewegteUrteilen`).
    _archBewegt(entry) {
        (this._archBewegte || (this._archBewegte = new Set())).add(entry);
    }

    // Instanced Architektur auf andere LOD-Stufe: _archInstanceRemove → entry.type auf den neuen
    // LOD-Key → _archInstanceAdd. blockerAABBs bleiben (LOD ist reine Render-Schicht).
    _switchArchitectureLOD(entry, newLOD, dist) {
        if (!entry) return false;
        // Studio-Architektur wechselt über den EINEN Foundry-Zweig unten; der Grammatik-Zweig (grown_..._lodN) bleibt den
        // Wald-Varianten (_lodSpecies + _lodVariantIndex).
        const treeLike = !!entry._lodSpecies && Number.isFinite(entry._lodVariantIndex);
        // Foundry-LOD: kennt die Foundry die Art, ist sie die EINE Quelle — für JEDEN Eintrag ihrer Art, platziert oder KALT:
        // ihre Stufe servieren ODER den aktuellen Zustand halten, NIE Grammatik (sonst erweckt
        // der Switch einen gewachsenen Nachbau). Die Distanz-Wahl newLOD führt; kein entry.type-Wechsel —
        // das Studio-LOD lebt im leafKey (`f:preset|gestalt|lod`). Grammatik nur bei Foundry aus oder
        // unbekannter Art. Die Zulassung liest die Art, nie die Geschichte (lod.K5): bis lod-stufen ließ der Wechsel einen Bau
        // nur mit `instFoundry` zu — der Marke einer früheren Platzierung —, ein kalt gesetztes Haus, Tor oder Fahrzeug stellte
        // er nie (die Stufen-Linse an der Mess-Wiese: Haus, Haus, Wagen „Stufe nicht gestellt").
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
        this._stufenSchirm();
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
                if (this._imStufenVorlauf(entry)) desired = null; // der Vorlauf hält seine L1 voll, ohne Partner
            }
        }
        const cur = Number.isFinite(entry && entry._lodBandLevel) ? entry._lodBandLevel : null;
        if (cur === desired) {
            this._lodHaltSetzen(entry, cur === null); // der Partner steht: kein Halt — ohne ihn hält die Stufe voll
            return false;
        }
        let geaendert = false;
        if (entry.instSlotsBand) {
            this._archInstanceRemove(entry, { bandOnly: true });
            geaendert = true;
        }
        entry._lodBandLevel = null;
        if (desired === null) {
            this._lodHaltSetzen(entry, true);
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
            this._lodHaltSetzen(entry, false); // die Art trägt keine weitere Stufe: sie blendet nach ihrem Gesetz aus
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
    // Stempel: aKarte.w der Karte, aH0L der 3D-Stufen negativ), bis der Partner steht — auch wo die Wahl keinen verlangt
    // (F1, 19.10.): die Wahl misst vom Auge VOR dem Rig, die Maske vom Auge danach; nach Ego → Third (das Auge 0 → 8,8 m) blendete
    // der GT ein Bild lang zu einem Partner, den die Wahl nie setzte (Richter: gate:foundry-crossfade GEISTER-BAUM sprung,
    // der gesetzte Bau und die Streu-Zelle). Ohne Partner weicht die Maske nur, wo sie ins Nichts blendete. `halt`: false
    // (der Partner steht) · true (keiner steht, still) · "wartet" (der Partner lädt: der Tick bleibt wach). true = der
    // Stempel wechselte.
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

    // === Architektur-Instancing ===
    // Der Builder ignoriert den Seed (`() => _buildFromBlueprint(bp)`) → jeder Spawn eines Bauplans ist
    // geometrisch IDENTISCH, nur Position + Scale variieren. Darum Instancing statt Mesh je Part: geteilte
    // Geometrie+Material je (Bauplan, Leaf) + Per-Instance-Matrix (bit-gleich zu matrixWorld).

    // Die Welt-Matrix eines Architektur-Eintrags (ohne die Leaf-Lokal-
    // Matrix): T(pos.x, pos.y-0.5, pos.z) × S(scale). Spiegelt exakt, was
    // `_rebuildArchitectureMesh` der klassischen Group gibt (group.position
    // = baseY = pos.y-0.5, group.scale = scalar(scale), keine Rotation).
    // `ungefedert` (Welle L, Q13 F-D8): die Lage der RÄDER — Gelände-Nick und -Wank ja, die Aufbau-Federn (Nick, Kurven-
    // Wank, Hub) nein: beim Bremsen taucht der Aufbau, die Räder bleiben am Boden.
    _archEntryWorldMatrix(entry, out, ungefedert) {
        const m = out || new THREE.Matrix4();
        // HEAVE (N7-Rest, 19.07.) — der Squat des gerittenen Studio-Gefaehrts
        // reist in die Instanz-Matrix (0/undefined fuer alles Nicht-Gerittene =
        // byte-alte Matrix; dasselbe Muster wie rp/rr unten).
        const baseY =
            (Number.isFinite(entry.position.y) ? entry.position.y - 0.5 : 0) +
            (!ungefedert && Number.isFinite(entry._rideHeave) ? entry._rideHeave : 0);
        const s = Number.isFinite(entry.scale) && entry.scale > 0 ? entry.scale : 1;
        // PRO-INSTANZ-ROTATION: `entry.rotationY` (seed-gesetzt für Bäume/Felsen, default 0 = Bauwerke
        // unberührt) dreht die Instanz um die Hoch-Achse — sonst liest sich ein Wald als Klon-Feld. Reine
        // Instanz-Matrix; der Quadrat-AABB der Kollision überdeckt den gedrehten Stamm.
        const ry = Number.isFinite(entry.rotationY) ? entry.rotationY : 0;
        // Render-Nick des gerittenen Studio-Gefährts: kleiner R_x NACH R_y·S (Scale uniform → kommutiert);
        // entry._ridePitch setzt nur _tickMountedMovement (Feder-Rezept), sonst unveränderte Matrix. Gelände-
        // Nick addiert, Wank als R_z danach. NUR Optik — Kollisions-AABB/Blocker lesen rotationY allein.
        const rp =
            (!ungefedert && Number.isFinite(entry._ridePitch) ? entry._ridePitch : 0) +
            (Number.isFinite(entry._rideTerrainPitch) ? entry._rideTerrainPitch : 0);
        // ZENSUS-REST V18.488 — der Kurven-Wank addiert auf den Gelände-Wank
        // (derselbe R_z wie der Group-Pfad; 0 für Nicht-Gerittenes).
        const rr =
            (Number.isFinite(entry._rideRoll) ? entry._rideRoll : 0) +
            (!ungefedert && Number.isFinite(entry._rideKurvenRoll) ? entry._rideKurvenRoll : 0);
        if (ry !== 0) {
            const c = Math.cos(ry);
            const sn = Math.sin(ry);
            // T × R_y × S (Spalten-Major, Three.js): R_y skaliert mit s.
            m.set(
                c * s,
                0,
                sn * s,
                entry.position.x || 0,
                0,
                s,
                0,
                baseY,
                -sn * s,
                0,
                c * s,
                entry.position.z || 0,
                0,
                0,
                0,
                1
            );
            if (rp || rr) this._archRittNeigung(entry, m, rp, rr);
            if (entry._gesetz) this._werkPoseMal(entry, m); // der Sturz und das Rollen des Werks (`_werkGesetzSetzen`)
            return m;
        }
        // compose(T, R=identity, S) — direkt gesetzt (schneller als compose).
        m.makeScale(s, s, s);
        m.elements[12] = entry.position.x || 0;
        m.elements[13] = baseY;
        m.elements[14] = entry.position.z || 0;
        if (rp || rr) this._archRittNeigung(entry, m, rp, rr);
        if (entry._gesetz) this._werkPoseMal(entry, m);
        return m;
    }

    // Nick (Bug ab = +) und Wank im KÖRPER des gerittenen Werks, nach R_y·S: längs z (Teile-Werk) Nick um x und Wank
    // um z; längs x (Studio-Fahrzeug, `_fahrAchseX`, Bug +x) Nick um z gegen den Sinn und Wank um x — derselbe
    // Rahmen wie `_rittMeshPose`. Vorher drehte der Nick des Studio-Fahrzeugs um seine LÄNGS-Achse (ein Wank).
    _archRittNeigung(entry, m, rp, rr) {
        const rx = this._archTmpRideRx || (this._archTmpRideRx = new THREE.Matrix4());
        const rz = this._archTmpRideRz || (this._archTmpRideRz = new THREE.Matrix4());
        if (entry._fahrAchseX) {
            if (rp) m.multiply(rz.makeRotationZ(-rp));
            if (rr) m.multiply(rx.makeRotationX(rr));
        } else {
            if (rp) m.multiply(rx.makeRotationX(rp));
            if (rr) m.multiply(rz.makeRotationZ(rr));
        }
    }

    // Die EINE Part-Farb-Quelle: baseColor aus part.color/Material-Substanz + Präzisions-Helligkeit
    // 0.6..1.0, 8-bit-gerundet — spiegelt EXAKT `_buildFromBlueprint` + die Per-Vertex-Formel in
    // `_mergeBlueprintByMaterial`. Konsumenten: _archLeafMaterial + _archFlattenBlueprint (leaf.tint).
    _archPartTintColor(part) {
        let baseColor = typeof part.color === "number" ? part.color : null;
        const partMatDef =
            typeof part.material === "string" && this.state.materials ? this.state.materials[part.material] : null;
        if (baseColor === null && partMatDef && typeof partMatDef.color === "number") {
            baseColor = partMatDef.color;
        }
        if (baseColor === null) baseColor = 0xffffff;
        const precision = this.computePartPrecision(part);
        const brightness = 0.6 + 0.4 * Math.max(0, Math.min(1, precision));
        const r8 = (baseColor >> 16) & 0xff;
        const g8 = (baseColor >> 8) & 0xff;
        const b8 = baseColor & 0xff;
        return (
            ((Math.round(r8 * brightness) & 0xff) << 16) |
            ((Math.round(g8 * brightness) & 0xff) << 8) |
            (Math.round(b8 * brightness) & 0xff)
        );
    }

    // Geteiltes Leaf-Material: EINES je TAG-SIGNATUR (_sharedFoliageMaterial); die Part-Farbe reist als
    // INSTANZ-Farbe (leaf.tint → _archSlotColor → setColorAt, neutral WEISS). Ein Material je Farbe
    // zersplitterte die Pipelines (je Farbe eine Material-Familie). AUSNAHME:
    // GLÜHENDE Substanz behält die Farbe in der Signatur (Emissiv liest opts.color; Spiegel der Klammer
    // `emissiv − 0.5 > 0.01`, gate:render-diaet). ARCH_LEAF_MAT_SHARED=false nur als Linsen-Beweis.
    _archLeafMaterial(part) {
        const tintedColor = this._archPartTintColor(part);
        const partMatDef =
            typeof part.material === "string" && this.state.materials ? this.state.materials[part.material] : null;
        const matOpts = { color: tintedColor };
        // W-E (§8.3) — die Antenne IST die Substanz (Spiegel zu _buildFromBlueprint).
        if (partMatDef && partMatDef.tags) matOpts.tags = partMatDef.tags;
        if (partMatDef) matOpts.stoff = part.material; // die Optik der Zeile (material.K5, `_stoffOptik`)
        // laub/fleisch-Materialien (waerme>0.5 im Substanz-Profil) bekommen den useInstanceTint-Marker:
        // _archInstanceAdd setzt setColorAt je Slot aus entry.tintH/S/V (Stein bleibt monochrom).
        if (partMatDef && partMatDef.tags) {
            const waerme = +partMatDef.tags.lebendig || 0;
            if (waerme > 0.5) matOpts.useInstanceTint = true;
        }
        if (Number.isFinite(part.opacity) && part.opacity < 1) {
            matOpts.transparent = true;
            matOpts.opacity = part.opacity;
        }
        if (AnazhRealm.ARCH_LEAF_MAT_SHARED === false) return this._buildToonNodeMaterial(matOpts); // A/B-Hebel (Linse)
        // Die Glüh-Frage über die EINE Profil-Quelle (_substanceResponseProfile;
        // tagless fällt wie im PBR-Bau auf defaults.werk → glüht → fail-closed
        // bleibt die Farbe gebacken).
        const profil = matOpts.tags
            ? this._substanceResponseProfile(matOpts.tags)
            : AnazhRealm.SUBSTANCE_RESPONSE.defaults.werk;
        const glueht = Math.max(0, (Number(profil && profil.emissiv) || 0) - 0.5) > 0.01;
        if (!glueht) {
            matOpts.color = 0xffffff; // die Farbe reist als Instanz-Kanal (leaf.tint)
            matOpts.leafTint = true; // Signatur-Marker — keine Kollision mit echt-weiß gebackenen Signaturen
        }
        const mat = this._sharedFoliageMaterial(matOpts);
        if (matOpts.leafTint && mat.userData) mat.userData.leafTint = true;
        return mat;
    }

    // Welle B — DIE LICHTQUELLE: ein Teil, dessen Genom das Leuchten trägt (`emissiveBoost`, das Glut-/Kristall-
    // Genom) UND dessen Substanz glimmt (dieselbe Klammer `emissiv − 0.5 > 0.01` wie _archLeafMaterial). Die Klammer
    // allein trifft auch Holz, Laub, Leder (ihr Glimmen ist ein Ton, kein Feuer) — erst die Genom-Deklaration macht
    // den Teil zum Licht. Eine Lichtquelle wirft keinen Schatten (Glut-Bett und -Zungen; das Becken wirft).
    _archTeilLeuchtet(part) {
        if (!part || !Number.isFinite(part.emissiveBoost)) return false;
        const def =
            typeof part.material === "string" && this.state.materials ? this.state.materials[part.material] : null;
        const profil =
            def && def.tags ? this._substanceResponseProfile(def.tags) : AnazhRealm.SUBSTANCE_RESPONSE.defaults.werk;
        return Math.max(0, (Number(profil && profil.emissiv) || 0) - 0.5) > 0.01;
    }

    // Minimaler Geometrie-Merger (BufferGeometryUtils.mergeGeometries fehlt im vendored Bundle). Erwartet
    // IDENTISCHE Attribute (position, normal, color), Eingänge optional indexed; Ausgabe nicht-indiziert.
    _mergeGeometries(geometries) {
        if (!Array.isArray(geometries) || geometries.length === 0) return null;
        // 1. Totale Vertex-Anzahl (nicht-indizierte Output-Form).
        let totalVerts = 0;
        for (const g of geometries) {
            if (!g || !g.attributes || !g.attributes.position) return null;
            // Indexed → wir expandieren beim Lesen via index.
            const idx = g.index;
            totalVerts += idx ? idx.count : g.attributes.position.count;
        }
        if (totalVerts === 0) return null;
        const posOut = new Float32Array(totalVerts * 3);
        const norOut = new Float32Array(totalVerts * 3);
        const colOut = new Float32Array(totalVerts * 3);
        // 2. Pro Eingangs-Geometry: Vertices in den Output schreiben.
        let cursor = 0;
        for (const g of geometries) {
            const posIn = g.attributes.position.array;
            const norIn = g.attributes.normal ? g.attributes.normal.array : null;
            const colIn = g.attributes.color ? g.attributes.color.array : null;
            const idx = g.index ? g.index.array : null;
            const vCount = idx ? idx.length : g.attributes.position.count;
            for (let i = 0; i < vCount; i++) {
                const srcIdx = idx ? idx[i] : i;
                const o3 = (cursor + i) * 3;
                const s3 = srcIdx * 3;
                posOut[o3] = posIn[s3];
                posOut[o3 + 1] = posIn[s3 + 1];
                posOut[o3 + 2] = posIn[s3 + 2];
                if (norIn) {
                    norOut[o3] = norIn[s3];
                    norOut[o3 + 1] = norIn[s3 + 1];
                    norOut[o3 + 2] = norIn[s3 + 2];
                }
                if (colIn) {
                    colOut[o3] = colIn[s3];
                    colOut[o3 + 1] = colIn[s3 + 1];
                    colOut[o3 + 2] = colIn[s3 + 2];
                }
            }
            cursor += vCount;
        }
        const merged = new THREE.BufferGeometry();
        merged.setAttribute("position", new THREE.BufferAttribute(posOut, 3));
        merged.setAttribute("normal", new THREE.BufferAttribute(norOut, 3));
        merged.setAttribute("color", new THREE.BufferAttribute(colOut, 3));
        merged.computeBoundingBox();
        merged.computeBoundingSphere();
        return merged;
    }

    // Mergt einen Bauplan je Material-Schlüssel zu EINER geom + EINEM mat (Baum: ~80 Parts, 2 Materialien
    // → 2 Draw-Calls). Part-Farbe → Per-Vertex-Color, Part-Transform per applyMatrix4 gebacken; Leaves
    // tragen Identity-localMatrix (`_archInstanceAdd` schreibt die Entry-Matrix). TAG-NEUTRAL: bp.parts
    // bleibt unverändert (computeCompoundTags liest sie) — reine Render-Optimierung.
    _mergeBlueprintByMaterial(bp) {
        if (!bp || !Array.isArray(bp.parts) || bp.parts.length === 0) return null;
        // Parts nach Material-Schlüssel gruppieren (ohne `material` → "_default"). Nested Baupläne
        // (shape:"blueprint") werden NICHT gemergt → unmergebar, Per-Part-Pfad.
        const groups = new Map();
        for (const part of bp.parts) {
            if (!part || part.shape === "blueprint") return null; // nested → unmergebar
            if (part.animate === "water_wave") return null; // V18.211-Bäume tragen das nie, aber defensive Wand
            const key = typeof part.material === "string" ? part.material : "_default";
            if (!groups.has(key)) groups.set(key, []);
            groups.get(key).push(part);
        }
        if (groups.size === 0) return null;
        // Per-Material: Geometries + Per-Vertex-Color sammeln → mergen.
        const leaves = [];
        const tmpQuat = new THREE.Quaternion();
        const tmpVec = new THREE.Vector3();
        const tmpEuler = new THREE.Euler();
        const tmpMatrix = new THREE.Matrix4();
        for (const parts of groups.values()) {
            const geomsInGroup = [];
            for (const part of parts) {
                const geom = this._makePartGeometry(part);
                if (!geom || !geom.attributes || !geom.attributes.position) continue;
                // Per-Part-Transform auf die Vertices applyen (Position +
                // Rotation; size ist schon in _makePartGeometry gebaked).
                const pos = part.position || { x: 0, y: 0, z: 0 };
                tmpVec.set(pos.x || 0, pos.y || 0, pos.z || 0);
                if (part.rotation) {
                    tmpEuler.set(part.rotation.x || 0, part.rotation.y || 0, part.rotation.z || 0);
                    tmpQuat.setFromEuler(tmpEuler);
                } else {
                    tmpQuat.identity();
                }
                tmpMatrix.compose(tmpVec, tmpQuat, new THREE.Vector3(1, 1, 1));
                geom.applyMatrix4(tmpMatrix);
                // Sicherstellen, dass normal-Attribut existiert (für Toon-Lit).
                if (!geom.attributes.normal) geom.computeVertexNormals();
                // Per-Vertex-Color attachen (uniform pro Part, aus der berechneten
                // tintedColor — Spiegel zu _archLeafMaterial Brightness-Formel).
                let baseColor = typeof part.color === "number" ? part.color : null;
                const partMatDef =
                    typeof part.material === "string" && this.state.materials
                        ? this.state.materials[part.material]
                        : null;
                if (baseColor === null && partMatDef && typeof partMatDef.color === "number") {
                    baseColor = partMatDef.color;
                }
                if (baseColor === null) baseColor = 0xffffff;
                const precision = this.computePartPrecision(part);
                const brightness = 0.6 + 0.4 * Math.max(0, Math.min(1, precision));
                const r = (((baseColor >> 16) & 0xff) * brightness) / 255;
                const g = (((baseColor >> 8) & 0xff) * brightness) / 255;
                const b = ((baseColor & 0xff) * brightness) / 255;
                const vCount = geom.attributes.position.count;
                const colArr = new Float32Array(vCount * 3);
                for (let i = 0; i < vCount; i++) {
                    colArr[i * 3] = r;
                    colArr[i * 3 + 1] = g;
                    colArr[i * 3 + 2] = b;
                }
                geom.setAttribute("color", new THREE.BufferAttribute(colArr, 3));
                geomsInGroup.push(geom);
            }
            if (geomsInGroup.length === 0) continue;
            const merged = this._mergeGeometries(geomsInGroup);
            // Per-Part-Geometries waren nur Zwischenträger → disposen.
            for (const g of geomsInGroup) {
                if (g && typeof g.dispose === "function") g.dispose();
            }
            if (!merged) continue;
            // Material: vertexColors-Variante mit dem Tag-Profil des ersten Parts (eine Gruppe teilt matKey →
            // gleiche Tags); useInstanceTint für lebendig>0.5 (Spiegel zu _archLeafMaterial).
            const refPart = parts[0];
            const refMatDef =
                typeof refPart.material === "string" && this.state.materials
                    ? this.state.materials[refPart.material]
                    : null;
            const matOpts = { vertexColors: true };
            if (refMatDef && refMatDef.tags) {
                matOpts.tags = refMatDef.tags;
                matOpts.stoff = refPart.material; // die Optik der Zeile (material.K5)
                const waerme = +refMatDef.tags.lebendig || 0;
                if (waerme > 0.5) matOpts.useInstanceTint = true;
            }
            // Opts sind über alle Varianten identisch (globale holz/laub-Tags, Farbe per-Vertex) → das geteilte
            // Tag-Signatur-Material (_foliageMatCache-Konvention: NIE disposen).
            const mat = this._sharedFoliageMaterial(matOpts);
            leaves.push({ geom: merged, mat, localMatrix: new THREE.Matrix4() });
        }
        if (leaves.length === 0) return null;
        return { leaves };
    }

    // Platzierte Strukturen per Material zu wenigen Meshes verschmelzen (dieselbe
    // `_mergeBlueprintByMaterial`-Infra wie die Bäume): ~248 → ~2–5 Draw-Calls + Schatten-Caster,
    // Geometrie/Farben bit-gleich. Die Kollision liest `bp.parts` separat (entry.blockerAABBs).
    // Per-Teil-Fallback (`_buildFromBlueprint`): nested Baupläne · water_wave · connections · < 6 Teile.
    _buildArchMeshMerged(bp) {
        if (!bp || !Array.isArray(bp.parts) || bp.parts.length < 6) return this._buildFromBlueprint(bp);
        if (Array.isArray(bp.connections) && bp.connections.length > 0) return this._buildFromBlueprint(bp);
        // GEOMETRIE-CACHE: ein Bauplan ist je Spawn geometrisch identisch → EINMAL mergen (Tempel ~14 ms),
        // je Bauplan cachen (WeakMap → auto-GC), je Spawn nur die Geometrie KLONEN (~0,5 ms). Sicher, weil
        // _disposeSoulGroup NUR Geometrie disposed: Material geteilt, jeder Spawn besitzt seinen Klon.
        if (!this._archMergeCache) this._archMergeCache = new WeakMap();
        let leaves = this._archMergeCache.get(bp);
        if (!leaves) {
            let merged = null;
            try {
                merged = this._mergeBlueprintByMaterial(bp);
            } catch (_e) {
                throw this._stoffBruch("der Bauplan-Merge (Stoff-Gruppen)", _e);
            }
            if (!merged || !Array.isArray(merged.leaves) || merged.leaves.length === 0) {
                return this._buildFromBlueprint(bp); // nested/animate → Per-Teil-Wahrheit
            }
            leaves = merged.leaves;
            this._archMergeCache.set(bp, leaves);
        }
        const group = new THREE.Group();
        for (const leaf of leaves) {
            if (!leaf || !leaf.geom || !leaf.mat) continue;
            // Geometrie KLONEN (disposal-sicher), Material TEILEN (Singleton, nie disposed).
            const m = new THREE.Mesh(leaf.geom.clone(), leaf.mat);
            m.castShadow = true;
            m.receiveShadow = true;
            group.add(m);
        }
        if (group.children.length === 0) return this._buildFromBlueprint(bp); // defensive
        group.userData.archMerged = true;
        return group;
    }

    // Der Platzier-GHOST liest den GETEILTEN Merge-Cache (`_buildArchMeshMerged`) — derselbe Pfad wie die
    // platzierte Struktur. Transparenz über einen per-Material GECACHTEN Klon (`_ghostMaterialFor`), NIE
    // Mutation des geteilten Materials (sonst leckt „transparent" in platzierte Bauten + Recompile je
    // Auswahl); der Klon kompiliert einmal (Idle-Vorbacken).
    // Der Alpha-Test des Klons skaliert mit seiner Deckkraft (Welle L Folge, L-Rückmeldung „kein Phantom"): r184 multipliziert
    // die Alpha mit `opacity` VOR dem Test — jeder Studio-Stoff trägt alphaTest 0,5 (der Dither der LOD-Maske und die
    // Blatt-Kontur fallen in die Alpha), bei Deckkraft 0,4 fiel JEDES Fragment (0,4 < 0,5): das Phantom eines Baums, Hauses,
    // Tors war unsichtbar, der Spieler zielte ins Leere. Mit alphaTest × Deckkraft fällt genau, was das Werk selbst verwirft.
    // Die Tönung wirkt, wo der Stoff seine Farbe liest (Gegenprüfung 08.10.): ein Studio-Stoff liest colorNode (die Vertex-
    // Farbe), nie `material.color` — sein Geist mischt den EINEN Tönungs-Uniform (`_phantomTint`) zu 30 % in colorNode.rgb,
    // die Alpha (Blatt-Kontur, LOD-Dither) bleibt. Befund: das Phantom über der Lichtung stand grau, nur die HUD-Zeile rot.
    _ghostMaterialFor(mat) {
        if (!mat) return mat;
        if (!this._ghostMatCache) this._ghostMatCache = new WeakMap();
        let g = this._ghostMatCache.get(mat);
        if (!g) {
            g = mat.clone();
            g.transparent = true;
            g.opacity = 0.4;
            g.alphaTest = (Number.isFinite(mat.alphaTest) ? mat.alphaTest : 0) * g.opacity;
            g.depthWrite = false;
            const tint = mat.colorNode ? this._phantomTint() : null;
            if (tint) {
                const TSL = THREE.TSL;
                const farbe = TSL.vec4(mat.colorNode);
                g.colorNode = TSL.vec4(TSL.mix(farbe.rgb, tint, 0.3), farbe.a);
            }
            this._ghostMatCache.set(mat, g);
        }
        return g;
    }

    // DER EINE Tönungs-Uniform jedes Geist-Stoffs (linear, aus dem sRGB-Hex — das Farb-Gesetz): `_applyPhantomTint` setzt
    // ihn je Takt (grün: das Setzen trägt, rot: es wird abgelehnt). Es gibt nur ein Phantom zugleich.
    _phantomTint() {
        if (!this._phantomTintU) {
            const TSL = THREE.TSL;
            this._phantomTintU = TSL.uniform(new THREE.Color(0x88ff88));
        }
        return this._phantomTintU;
    }

    // Der Ghost IST der finale Eintrag (`_rebuildArchitectureMesh`: Foundry-Preset → `_foundryFlattenFor`, Stufe 0): derselbe
    // Same (`_werkSame` mit dem Bau-Modus — der Same des nächsten Setzens, `confirmBuild` setzt ihn) und derselbe Stempel
    // (`_studioStampFor` — die Prägung, die das Setzen mitgibt). Foundry aus/kalt → null: der Donor-Ghost bleibt,
    // `tickBuildMode` swappt, sobald das Asset dockt. Geteilte Studio-Geometrie ist sharedGeom-markiert + hält
    // `foundrySrcGroup` (`_disposeSoulGroup` lässt sie stehen); Material = der gecachte Klon (`_ghostMaterialFor`).
    // `wo` = der Ort des Phantoms (`_phantomWerk`): ein Baum zeigt die Gestalt dieses Orts, die Gruppe trägt sie
    // (`userData.studioGestalt`), `tickBuildMode` tauscht, sobald der Ort eine andere wählt.
    // DAS WERK DES PHANTOMS (K20): der Eintrag, den `confirmBuild` an diesem Ort stellt — der Same des nächsten Setzens
    // (`_werkSame` mit dem Bau-Modus), der Stempel (`_studioStampFor`) und der Ort (`wo`, der Spawn-Ort des Setzens: x, z
    // des Phantoms): ein Baum fragt die Gestalt seines Orts (`_foundryGestaltFor`) wie das gesetzte Werk. Befund: das
    // Phantom fragte ohne Ort den rohen Samen und zeigte den Solitär (eiche|3), an seinem Ort im Bestand stand eiche|2.
    _phantomWerk(bp, wo) {
        const werk = { seed: this._werkSame(bp, bp.name, this.state.buildMode), type: bp.name };
        const stempel = this._studioStampFor(bp.name);
        if (stempel) werk.studioOv = stempel;
        if (wo && Number.isFinite(wo.x) && Number.isFinite(wo.z)) werk.position = { x: wo.x, y: wo.y + 0.5, z: wo.z };
        return werk;
    }
    // Die Gestalt, die das Phantom am Ort `wo` zeigen muss (das Gedächtnis des Orts `_ortGestaltSame` merkt jeden Ort);
    // null = kein Studio-Werk oder der Ort wartet.
    _phantomGestalt(bp, wo) {
        const preset = this._foundryPresetForEntry({ type: bp.name });
        return preset ? this._foundryGestaltFor(this._phantomWerk(bp, wo), preset) : null;
    }
    _buildStudioPlacementGhost(bp, wo) {
        if (!bp || typeof bp.name !== "string") return null;
        if (typeof this._foundryEnabled !== "function" || !this._foundryEnabled()) return null;
        const preset = this._foundryPresetForEntry({ type: bp.name });
        if (!preset) return null;
        const werk = this._phantomWerk(bp, wo);
        const flat = this._foundryFlattenFor(werk, preset, 0);
        if (!flat || !flat.instanceable || !Array.isArray(flat.leaves) || !flat.leaves.length) {
            // null = lädt noch (die Anfrage ist unterwegs) → tickBuildMode heilt den Donor-
            // Ghost zur Studio-Gestalt; false = kann nicht → Donor-Ghost bleibt (fail-soft).
            if (flat === null && this.state.buildMode) this.state.buildMode.phantomStudioPending = bp.name;
            return null;
        }
        const grp = new THREE.Group();
        for (const leaf of flat.leaves) {
            if (!leaf.geom || !leaf.mat || leaf.shadowTwin) continue; // der Schatten-Zwilling ist kamera-unsichtbar
            const mesh = new THREE.Mesh(leaf.geom, this._ghostMaterialFor(leaf.mat));
            mesh.applyMatrix4(leaf.localMatrix);
            mesh.castShadow = false;
            mesh.userData.sharedGeom = true; // GETEILTE Studio-Geometrie — der Dispose lässt sie stehen
            // Der Tint-Anker liest die NIE-getintete Quell-Farbe (der geteilte Ghost-Klon
            // bliebe sonst nach einem Rot/Grün-Frame die „Original"-Basis → Drift).
            if (leaf.mat.color) mesh.userData._origColor = leaf.mat.color.getHex();
            grp.add(mesh);
        }
        if (!grp.children.length) return null;
        const src = flat.leaves[0]._srcGroup;
        if (src) {
            src._liveRefs = (src._liveRefs || 0) + 1;
            grp.userData.foundrySrcGroup = src;
        }
        grp.userData.studioGhost = true;
        grp.userData.studioGestalt = this._foundryGestaltFor(werk, preset);
        if (this.state.buildMode && this.state.buildMode.phantomStudioPending === bp.name) {
            this.state.buildMode.phantomStudioPending = null;
        }
        return grp;
    }

    // Platzier-Phantom: mergeable (≥6 Teile, keine connections) → gecachte Merge-Geometrie + gecachter
    // Ghost-Mat-Klon; sonst `_buildFromBlueprint` mit FRISCHEN Per-Teil-Materialien. castShadow aus.
    // ZUERST die Studio-Gestalt (Quelle des finalen Eintrags), sonst der Donor-Bau; `opts.donorOnly` =
    // Prebake-Pfad (Cache/Pipeline wärmen ohne Studio-Bake je Katalog-Bauplan); `opts.wo` = der Ort des Phantoms.
    _buildPlacementGhost(bp, opts) {
        if (!(opts && opts.donorOnly)) {
            const studio = this._buildStudioPlacementGhost(bp, opts && opts.wo);
            if (studio) return studio;
        }
        const group = this._buildArchMeshMerged(bp);
        const merged = !!(group.userData && group.userData.archMerged);
        group.traverse((node) => {
            if (node.material) {
                if (merged) {
                    // geteiltes Material → GECACHTER transparenter Klon (kein Leck in die platzierte Struktur).
                    node.material = this._ghostMaterialFor(node.material);
                } else {
                    // Fallback-Pfad: die Per-Teil-Materialien sind FRISCH (nicht geteilt) → Mutation sicher; der Alpha-
                    // Test skaliert mit der Deckkraft wie im Klon (`_ghostMaterialFor`).
                    node.material.transparent = true;
                    node.material.opacity = 0.4;
                    node.material.alphaTest =
                        (Number.isFinite(node.material.alphaTest) ? node.material.alphaTest : 0) * 0.4;
                    node.material.depthWrite = false;
                }
            }
            if (node.castShadow !== undefined) node.castShadow = false;
        });
        return group;
    }

    // Idle-Vorbacken: wärmt Merge-Cache + Ghost-Material-Klone, solange der Spieler steht und das
    // Chunk-Streaming nichts baut (gerufen aus `_tickScatterStreaming`). EINS je Idle-Tick (kein Spike) —
    // der Erst-Merge (~5–14 ms) passiert VOR der Auswahl. `_prebakedBlueprints` merkt die warmen Namen.
    _tickBlueprintPrebake() {
        const st = this.state;
        if (st._frameOverBudget) return; // erst die Frame-Zeit, dann vorausplanen (V18.282-Wand)
        // erst das Bild, dann vorausplanen (K60-2): kein Leser des ersten Weltbilds wählt einen Bauplan — unter dem Ladeschirm
        // (`_ladeTakt`, der kein Budget reißt) wärmte das Vorbacken Radeon kalt 0,71 s Geister vor dem Bild (K602/p1)
        if (this._ladeTakt()) return;
        if (!st.blueprints) return;
        if (!this._prebakedBlueprints) this._prebakedBlueprints = new Set();
        const done = this._prebakedBlueprints;
        // Das GANZE auswählbare Sortiment: die Hotbar ZUERST, dann der Rest der Bibliothek (Inventar/Menü).
        const names = (Array.isArray(st.hotbar) ? st.hotbar.filter(Boolean) : []).concat(Object.keys(st.blueprints));
        for (const name of names) {
            if (!name || done.has(name)) continue;
            const bp = st.blueprints && st.blueprints[name];
            if (!bp) {
                done.add(name);
                continue;
            }
            // nur PLATZIERBARE Baupläne bekommen ein Ghost-Phantom (Geräte/Rüstung/Seele/Trank nicht).
            if (!this._isPlaceableBlueprint(bp)) {
                done.add(name);
                continue;
            }
            try {
                // B1: donorOnly — der Prebake wärmt Merge-Cache + Ghost-Mat-Klone des Donor-Pfads;
                // Studio-Ghost-Assets zieht erst die ECHTE Auswahl (kein Katalog-weiter Bake-Sturm,
                // und das Freigeben darf hier nie geteilte Studio-Geometrie treffen). Die Pipeline des Geists
                // entsteht bei seiner ersten Zeichnung (die Erst-Zeichnung, `_configureRenderer`).
                this._disposeSoulGroup(this._buildPlacementGhost(bp, { donorOnly: true }));
            } catch (_e) {
                this._stoffBruch("das Vorbacken des Bauplans " + name, _e);
            }
            done.add(name);
            return; // EINS pro Idle-Tick
        }
    }

    // KERN-PFLICHT-WAND: fehlt ein Gesetzbuch (AnazhRealm.GESETZ_KERNE) auf dem Main-Thread, SCHREIT die
    // Welt (rotes Banner + ERROR-Log) statt still auf Fallback zu laufen. Einmal je Boot, im Loop
    // (defer-Scripts sind dann geladen).
    _kernPflichtWand() {
        if (this._kernWandGeprueft) return;
        this._kernWandGeprueft = true;
        const fehlt = [];
        for (const id in AnazhRealm.GESETZ_KERNE) {
            const nsName = AnazhRealm.GESETZ_KERNE[id];
            if (typeof globalThis === "undefined" || !globalThis[nsName]) fehlt.push(id);
        }
        if (!fehlt.length) return;
        const text = "KERN FEHLT (Gesetzbuch lädt nicht auf dem Main-Thread): " + fehlt.join(" · ");
        this.log(text, "ERROR");
        if (typeof document !== "undefined" && document.body && !document.getElementById("kern-pflicht-banner")) {
            const b = document.createElement("div");
            b.id = "kern-pflicht-banner";
            b.textContent = "⚠ " + text + " — jeder Gesetz-Leser bricht laut (KERN-PFLICHT), es gibt keine Ersatz-Welt";
            b.style.cssText =
                "position:fixed;top:0;left:0;right:0;z-index:99999;background:#7a1010;color:#fff;" +
                "font:14px monospace;padding:8px 12px;text-align:center";
            document.body.appendChild(b);
        }
    }

    // DIE BACKEND-WAND der WGSL-Konsumenten (Welt-March · Feld-Pass): sie urteilt am BACKEND — ohne Adapter fällt der
    // r184-Renderer STILL auf WebGL2, wo die TSL-Klassen weiter existieren (eine Existenz-Prüfung wäre blind).
    _gpuComputeFaehig() {
        const r = this.state.renderer;
        return !!(r && !r._isHeadlessNull && r.backend && r.backend.isWebGPUBackend === true);
    }

    // Bauplan flach in Leaf-Primitive auflösen (cached); nested Blueprints rekursiv mit komponierter
    // Lokal-Matrix. Nicht instanzierbar bei: water_wave-Part · Top-Level-connections · Tiefe > 4 oder
    // Zyklus. Rückgabe: { instanceable, reason, leaves:[{geom, mat, localMatrix}] }.
    _archFlattenBlueprint(name) {
        if (!this.state.archFlattenCache) this.state.archFlattenCache = new Map();
        const cache = this.state.archFlattenCache;
        if (cache.has(name)) return cache.get(name);
        const bp = this.state.blueprints && this.state.blueprints[name];
        const result = { instanceable: false, reason: "", leaves: [] };
        if (!bp || !Array.isArray(bp.parts) || bp.parts.length === 0) {
            result.reason = "no-parts";
            cache.set(name, result);
            return result;
        }
        // Primärer Gate: nur `instanced: true` (Worldgen-Massen-Vegetation) geht in die HISM-Registry; alle
        // anderen bleiben klassisch (Group + Interaktion via entry.mesh).
        if (bp.instanced !== true) {
            result.reason = "classic-intent";
            cache.set(name, result);
            return result;
        }
        if (Array.isArray(bp.connections) && bp.connections.length > 0) {
            result.reason = "connections";
            cache.set(name, result);
            return result;
        }
        // Affordances, die `entry.mesh` lesen, bleiben klassisch: `magnifying` (Raycast in
        // `_hasMagnifyingInSight`) + `moveable` (Mount-Follow setzt entry.mesh.position). Die übrigen lesen
        // entry.position + affordanceStrength → instancing-safe.
        const aff =
            typeof this.computeBlueprintAffordances === "function" ? this.computeBlueprintAffordances(bp) : null;
        if (aff && (aff.magnifying || aff.moveable)) {
            result.reason = "affordance-needs-mesh";
            cache.set(name, result);
            return result;
        }
        // SKELETON-Pfad: ein Bauplan mit `_skeleton` wird einmalig zu zwei organischen Geometries gebaut
        // (bark-Tube + foliage), ihr Stoff trägt den EINEN Wind-Term (`_baumWindStoff`). `bp.parts` bleibt UNVERÄNDERT
        // → computeCompoundTags + Snapshot-Re-Growth wie zuvor.
        if (bp._skeleton && Array.isArray(bp._skeleton.branches) && bp._skeleton.branches.length > 0) {
            if (!this.state.archMergedGeomCache) this.state.archMergedGeomCache = new Map();
            let skelEntry = this.state.archMergedGeomCache.get(name);
            if (!skelEntry) {
                skelEntry = this._buildTreeSkeletonLeaves(bp);
                if (skelEntry) this.state.archMergedGeomCache.set(name, skelEntry);
            }
            if (skelEntry && Array.isArray(skelEntry.leaves) && skelEntry.leaves.length > 0) {
                result.instanceable = true;
                result.leaves = skelEntry.leaves;
                result.merged = true; // Diagnose-Marker (kompatibel zu V18.213-Tests)
                result.skeleton = true; // V18.214-spezifischer Marker
                cache.set(name, result);
                return result;
            }
            // Skeleton-Bau fehlgeschlagen → Fallback auf V18.213 cylinder-merge.
        }
        // MERGE-Pfad: `_isMerged:true` → einmalig per Material gemerged (~2 Leaves holz+laub statt ~80
        // Per-Part). `bp.parts` bleibt unverändert → Tag-Neutralität + Snapshot-Re-Wachstum.
        if (bp._isMerged === true) {
            if (!this.state.archMergedGeomCache) this.state.archMergedGeomCache = new Map();
            let mergedEntry = this.state.archMergedGeomCache.get(name);
            if (!mergedEntry) {
                mergedEntry = this._mergeBlueprintByMaterial(bp);
                if (mergedEntry) this.state.archMergedGeomCache.set(name, mergedEntry);
            }
            if (mergedEntry && Array.isArray(mergedEntry.leaves) && mergedEntry.leaves.length > 0) {
                result.instanceable = true;
                result.leaves = mergedEntry.leaves;
                result.merged = true; // Diagnose-Marker
                cache.set(name, result);
                return result;
            }
            // Merge fehlgeschlagen (z.B. nested blueprint im Bauplan) →
            // fällt auf den Per-Part-Pfad zurück (defensive Wand).
        }
        const MAX_DEPTH = 4;
        const leaves = [];
        let blocked = null;
        // applyScale: nested Sub-Blueprints erben part.scale (wie `_buildFromBlueprint`); Leaf-Primitive NICHT
        // — der klassische Builder setzt mesh.scale nie (Größe aus part.size) → Bit-Gleichheit.
        const composePart = (part, applyScale) => {
            const pos = part.position || {};
            const tp = new THREE.Vector3(pos.x || 0, pos.y || 0, pos.z || 0);
            const te = new THREE.Euler(
                part.rotation ? part.rotation.x || 0 : 0,
                part.rotation ? part.rotation.y || 0 : 0,
                part.rotation ? part.rotation.z || 0 : 0
            );
            const tq = new THREE.Quaternion().setFromEuler(te);
            let ts = new THREE.Vector3(1, 1, 1);
            if (applyScale) {
                const s = part.scale;
                if (typeof s === "number" && s > 0) ts.set(s, s, s);
                else if (s && typeof s === "object") ts.set(s.x || 1, s.y || 1, s.z || 1);
            }
            return new THREE.Matrix4().compose(tp, tq, ts);
        };
        const recurse = (blueprint, parentMatrix, depth, seen) => {
            if (blocked) return;
            if (depth > MAX_DEPTH) {
                blocked = "depth";
                return;
            }
            if (seen.has(blueprint.name)) {
                blocked = "cycle";
                return;
            }
            seen.add(blueprint.name);
            for (const part of blueprint.parts || []) {
                if (blocked) break;
                if (part.animate === "water_wave") {
                    blocked = "water_wave";
                    break;
                }
                if (part.shape === "blueprint" && typeof part.refName === "string") {
                    const ref = this.state.blueprints && this.state.blueprints[part.refName];
                    if (!ref) continue;
                    const childMatrix = new THREE.Matrix4().multiplyMatrices(parentMatrix, composePart(part, true));
                    recurse(ref, childMatrix, depth + 1, seen);
                    continue;
                }
                const geom = this._makePartGeometry(part);
                geom.computeBoundingBox();
                const mat = this._archLeafMaterial(part);
                const localMatrix = new THREE.Matrix4().multiplyMatrices(parentMatrix, composePart(part, false));
                const leaf = { geom, mat, localMatrix };
                // V18.475 — RENDER-DIÄT: trägt das geteilte Material den leafTint-
                // Marker (Farbe NICHT in der Signatur), reist die Part-Farbe als
                // Instanz-Farbe (der EINE Slot-Farb-Chokepoint _archSlotColor).
                if (mat.userData && mat.userData.leafTint) leaf.tint = this._archPartTintColor(part);
                // Welle B — Glut-Teile werfen nicht (Lichtquelle, _archTeilLeuchtet; aus beiden Kaskaden raus).
                if (this._archTeilLeuchtet(part)) leaf.castShadow = false;
                leaves.push(leaf);
            }
            seen.delete(blueprint.name);
        };
        recurse(bp, new THREE.Matrix4(), 0, new Set());
        // Welle B — DIE DRAW-EINHEIT IST MATERIAL × GEOMETRIE: LICHTQUELLEN-Teile (_archTeilLeuchtet; ihr Material
        // backt die Farbe, sie werfen nicht) verschmelzen je Material und Attribut-Form zu EINEM Leaf (Geometrie im
        // Bauplan-Raum, localMatrix = Identität) — dieselben Dreiecke, dasselbe Material, ein Befehl statt je Teil
        // einer (die Glut-Zungen einer Variante: 1–3 → 1). Jeder andere Teil bleibt je Teil (deckungsgleich zum
        // klassischen Bau). Der Foundry-Flat trägt dasselbe Gesetz (_foundryFlatVerschmelzen).
        if (!blocked && leaves.length > 1) leaves.splice(0, leaves.length, ...this._archLeavesVerschmelzen(leaves));
        if (blocked || leaves.length === 0) {
            // Unbenutzte Leaf-Ressourcen freigeben (nicht instancbar).
            for (const l of leaves) {
                if (l.geom && l.geom.dispose) l.geom.dispose();
                // V18.475 — geteilte Tag-Signatur-Materialien leben im
                // _foliageMatCache (viele Leser) → NIE disposen.
                if (l.mat && l.mat.dispose && !(l.mat.userData && l.mat.userData.sharedFoliage)) l.mat.dispose();
            }
            result.reason = blocked || "empty";
            cache.set(name, result);
            return result;
        }
        result.instanceable = true;
        result.leaves = leaves;
        cache.set(name, result);
        return result;
    }

    // Die Verschmelzung des Per-Teil-Flattens (Reihenfolge = erstes Vorkommen; ein Einzelner bleibt unberührt).
    _archLeavesVerschmelzen(leaves) {
        const sig = (lf) => {
            const g = lf.geom;
            if (!g || !g.attributes || !g.attributes.position || lf.tuer || lf.shadowTwin) return null;
            // nur Lichtquellen (castShadow false aus _archTeilLeuchtet) ohne Instanz-Farb-Kanal
            if (lf.castShadow !== false || lf.tint !== undefined) return null;
            if (g.groups && g.groups.length) return null;
            for (const k in g.attributes) if (g.attributes[k].isInterleavedBufferAttribute) return null;
            const a = Object.keys(g.attributes)
                .sort()
                .map((k) => k + ":" + g.attributes[k].itemSize + (g.attributes[k].normalized ? "n" : ""))
                .join(",");
            return [lf.mat.uuid, g.index ? "i" : "x", a].join("|");
        };
        const sippen = new Map();
        const aus = [];
        for (const lf of leaves) {
            const k = sig(lf);
            if (k === null) {
                aus.push(lf);
                continue;
            }
            let sp = sippen.get(k);
            if (!sp) {
                sp = [];
                sippen.set(k, sp);
                aus.push(sp); // Platzhalter an der Stelle des ersten Vorkommens
            }
            sp.push(lf);
        }
        return aus.map((x) => {
            if (!Array.isArray(x)) return x;
            if (x.length === 1) return x[0];
            // Attribut-treu (jedes Attribut der Sippe, Index mit Vertex-Versatz) — die Teile im Bauplan-Raum.
            const geoms = x.map((lf) => lf.geom.clone().applyMatrix4(lf.localMatrix));
            const merged = new THREE.BufferGeometry();
            let vSumme = 0;
            for (const g of geoms) vSumme += g.attributes.position.count;
            for (const name of Object.keys(geoms[0].attributes)) {
                const a0 = geoms[0].attributes[name];
                const arr = new a0.array.constructor(vSumme * a0.itemSize);
                let o = 0;
                for (const g of geoms) {
                    const a = g.attributes[name];
                    arr.set(a.array.subarray(0, a.count * a.itemSize), o);
                    o += a.count * a.itemSize;
                }
                merged.setAttribute(name, new THREE.BufferAttribute(arr, a0.itemSize, a0.normalized));
            }
            if (geoms[0].index) {
                let iSumme = 0;
                for (const g of geoms) iSumme += g.index.count;
                const idx = vSumme > 65535 ? new Uint32Array(iSumme) : new Uint16Array(iSumme);
                let o = 0,
                    v = 0;
                for (const g of geoms) {
                    const li = g.index.array;
                    for (let i = 0; i < g.index.count; i++) idx[o + i] = li[i] + v;
                    o += g.index.count;
                    v += g.attributes.position.count;
                }
                merged.setIndex(new THREE.BufferAttribute(idx, 1));
            }
            for (const g of geoms) g.dispose();
            for (const lf of x) lf.geom.dispose();
            merged.computeBoundingBox();
            const out = { geom: merged, mat: x[0].mat, localMatrix: new THREE.Matrix4() };
            if (x[0].castShadow === false) out.castShadow = false;
            return out;
        });
    }

    // === Instancing (HISM-Registry) ===
    // Eine InstancedMesh je (Bauplan, Leaf-Index); der Culling-Tick schreibt/löscht Per-Instance-Matrizen
    // statt Groups → Draw-Calls ~(Typen × Parts).

    _archIsRendered(entry) {
        return !!(entry && (entry.mesh || entry.instanced));
    }

    // DAS KOMPOSIT ERBT (das EINE Stufen-Gesetz): trägt der Eintrag seine Passagiere (`_passagiere`, die Leiber, die er trägt —
    // der Fahrer am Steuer)? Nur gezeichnet (Instanz oder Mesh) und in einer Stufe unter 2 — Stufe 2 ist die Fernstufe jeder
    // Art (die Karte der Karten-Dinge, die Grobstufe der übrigen), in ihr sitzt kein Leib; ohne Bild (die Stufe lädt, der Satz
    // trägt) auch nicht. Leser: die Nah-Wahl der Fahrer (`_tickVerkehr`) und die Naht der Stufe (`_kompositErbt`).
    _archTraegt(entry) {
        return this._archIsRendered(entry) && !(entry._servedLod >= 2);
    }

    // Die Naht der gezeichneten Stufe (Instanz und Mesh, hinein und heraus): trägt der Eintrag seine Passagiere nicht mehr,
    // verbergen sie sich im selben Takt — zeigen tut sie wieder, wer sie setzt (der Takt des Verkehrs setzt den Leib in den
    // Sitz). Bis hier zeigte sich der Fahrer im Kreis `leibM` neben jedem Wagen: über der Karte und über dem Wagen, der noch
    // lud (der fliegende Fahrer, Schöpfer-Fund 30.10.).
    _kompositErbt(entry) {
        if (!entry._passagiere || !entry._passagiere.size || this._archTraegt(entry)) return;
        for (const g of entry._passagiere) g.visible = false;
    }

    // SCHATTEN-DISTANZ in den LOD-Stufen: der Schatten-Pass ist ein zweiter Voll-Render, ferne Bäume
    // werfen nur winzige fog-verschleierte Schatten. Die LOD-Stufe steht IM Bauplan-Namen
    // (`grown_<art>_v<idx>_lod1/_lod2`) → der LOD-Tick (_switchArchitectureLOD) trägt die Entscheidung
    // mit. Bauten ohne `_lodN` werfen immer.
    _archGroupCastsShadow(name) {
        // L0 UND L1 werfen, nur die Fernstufe L2/Impostor nie (L1 beginnt schon bei ~20 m — sonst verlöre ein
        // Baum im Sichtfeld den Schatten). Kein Doppel-Schatten im Band: Shadow-Maps sind Tiefen-Tests.
        return !/_lod2$/.test(String(name || ""));
    }

    // GETEILTE Bewuchs-Materialien, per Opts-Signatur memoisiert: identische Configs teilen EIN Material
    // (die Art-Farbe läuft pro Instanz via useInstanceTint + setColorAt) — sonst je Baum eine eigene
    // Pipeline (Compile-Stutter + Pipeline-Switch je Draw). NIE disposed (archFlattenCache-Konvention:
    // _archDisposeAllInstanceGroups lässt g.mat stehen).
    _sharedFoliageMaterial(opts) {
        if (!this.state._foliageMatCache) this.state._foliageMatCache = new Map();
        const sig = JSON.stringify(opts);
        let mat = this.state._foliageMatCache.get(sig);
        if (!mat) {
            mat = this._buildToonNodeMaterial(opts);
            mat.userData.sharedFoliage = true;
            this.state._foliageMatCache.set(sig, mat);
        }
        return mat;
    }

    // Trägt das Backend Bündel? Nur das WebGPU-Backend implementiert die Bundle-API (beginBundle/finishBundle/addBundle) —
    // auf dem WebGL2-Rückfall wirft eine BundleGroup im Render-Loop. Klassen-Existenz ist blind; das Urteil fällt am
    // BACKEND. Headless: Bundles sind reine Gruppen-Knoten. Leser: die Region-Bündel und die Leib-Hülle (`_leibHuelle`).
    _buendelTraegt() {
        const r = this.state.renderer;
        return !(r && !r._isHeadlessNull && !(r.backend && r.backend.isWebGPUBackend === true));
    }

    // RENDERBUNDLES: EINE BundleGroup je Streu-/Platzier-Region; der statische Subbaum wird einmal
    // recorded und replayed (kein per-Frame-Encode je Draw). Wasser bleibt DRAUSSEN; der Leib jeder Gelenk-Gestalt ist sein
    // EIGENES Bündel (`_leibHuelle`, sein Stand je Pass `_leibBuendelStand`), nie Bürger einer Region.
    // Im Replay leben nur Uniform-/Textur-Bindings, Attribute wie instanceMatrix frieren ein. Die Bundles
    // sind der EINE Weg (04.10. in EINER Welt gegen den direkten Pfad gemessen, echte GPU, Mess-Wiese: Render-CPU p50
    // −1,1 ms im Stand, −0,3 ms im Gehen trotz ~0,8 Neuaufnahmen je Frame, +11 % gezeichnete Frames); ihre Wahrheit
    // (Aufnahme-Stapel, kein Bundle unter einem Override-Stoff) hält `_configureRenderer` am Chokepoint `_renderScene`,
    // die Klasse THREE.BundleGroup pinnt gate:vendor-anker.
    _archRegionBundleFor(regionKey) {
        if (regionKey == null || !this._buendelTraegt()) return null;
        const scene = this.state.scene;
        if (!scene) return null;
        let map = this.state._regionBundles;
        if (!map) map = this.state._regionBundles = new Map();
        let bg = map.get(regionKey);
        if (!bg) {
            bg = new THREE.BundleGroup();
            bg.name = "regionBundle:" + regionKey;
            // STATISCH (E-Bauart): das Bündel rückt nie — es fällt aus dem Matrix-Gang und dem Lage-Vergleich der Diät
            bg.matrixAutoUpdate = false;
            bg.userData.regionKey = regionKey;
            // Analytische Region-Kugel für den Frame-Cull (ersetzt das im Replay eingefrorene three-Culling).
            // Keys: "x,z" · Super-Region "s:x,z". Über-Inklusion ist sicher (nur GPU-Preis), Unter-Inklusion
            // wäre ein Pop → großzügiger Höhen-/Überhang-Puffer.
            const m = /^(s:)?(-?\d+),(-?\d+)$/.exec(String(regionKey));
            if (m) {
                const S = m[1] ? AnazhRealm.SCATTER_FERN_SUPERREGION : 1;
                const R = AnazhRealm.ARCH_REGION_M * S;
                const cy = (Number.isFinite(this.state.terrainBaseHeight) ? this.state.terrainBaseHeight : 0) + 40;
                bg.userData.cullSphere = new THREE.Sphere(
                    new THREE.Vector3((Number(m[2]) + 0.5) * R, cy, (Number(m[3]) + 0.5) * R),
                    R * Math.SQRT1_2 + 140
                );
            }
            scene.add(bg);
            map.set(regionKey, bg);
            this._buendelReihe(scene);
        }
        return bg;
    }
    // DER ANKER DER REIHE (1310-9): die Augen-Lage, an der die Bündel ihre Kinder zuletzt nach Abstand stellten. Je Frame nur
    // dieser Vergleich; erst wenn das Auge BUENDEL_ANKER_M weiter steht, stellt jedes Region-Bündel seine Reihe neu und nimmt
    // EINMAL neu auf — die Kosten folgen der Bewegung, nie dem Frame (Gebot 7). Stufen-Wechsel stellen die Reihe über die
    // Aufnahme (`_archInstanceGroupFor`).
    _buendelAnkerPruefen(pos) {
        const a = this._buendelAuge;
        const R = AnazhRealm.BUENDEL_ANKER_M;
        if (a && (pos.x - a.x) * (pos.x - a.x) + (pos.z - a.z) * (pos.z - a.z) <= R * R) return false;
        this._buendelAuge = { x: pos.x, z: pos.z };
        const sc = this.state.scene;
        if (sc)
            for (const c of sc.children)
                if (c && c.isBundleGroup && c.userData && c.userData.regionKey != null) {
                    AnazhRealm._buendelKinderReihe(c, this._buendelAuge);
                    c.needsUpdate = true;
                }
        return true;
    }

    // Bundle-Invalidierung für ein MESH in einer Region-BundleGroup: jede Mutation seiner Draw-Wahrheit
    // (Slot-Alloc/-Free · instanceMatrix/instanceColor · Fassade · count) muss hierher; sonst No-op.
    _archMeshBundleTouch(mesh) {
        const p = mesh ? mesh.parent : null;
        if (p && p.isBundleGroup) p.needsUpdate = true;
        // Welle 6 — eine Satz-Gruppe zeichnet als Bereich im Satz ihres Stoffs: der Bereich legt sich neu.
        else if (mesh && mesh.userData.bauSatz)
            this._bauSatzMarke(mesh.userData.archInstanceKey, mesh.userData.bauSatz);
    }

    // Parent-bewusstes Entfernen (die scene.remove-Falle: remove() wirkt nur auf
    // DIREKTE Kinder — eine Gruppe in der BundleGroup bliebe sonst hängen = Leck).
    // Leere Bundles verlassen die Szene mit (Region weggestreamt).
    _archBundleSceneRemove(mesh) {
        const p = mesh ? mesh.parent : null;
        if (!p) return;
        p.remove(mesh);
        if (p.isBundleGroup) {
            p.needsUpdate = true;
            if (p.children.length === 0) {
                if (p.parent) p.parent.remove(p);
                this._bundleQueryProxyTod(p); // ④ — der Query-Proxy fällt mit dem Bundle
                if (this.state._regionBundles) this.state._regionBundles.delete(p.userData.regionKey);
            }
        }
    }

    // ═══ DER SATZ (Welle B) ═══
    // Die Draw-Einheit ist Material × Geometrie über den ganzen Ring, nie Chunk × Material. Befund (Inventur der
    // echten GPU, Mess-Wiese): 78 Chunk-Böden zeichneten in JEDEM Pass einzeln — 234 GPU-Befehle, weil der Vendor
    // den Bundle-Replay je (Bundle, Kamera) zieht und seine Mitglieder nie cullt. Je Satz-Art (Boden · Wasser · je Stoff
    // des gesetzten Baus) lebt EIN Szenen-Mesh mit Pool-Puffern; ein Chunk (bzw. sein Stitch-Band, eine Bau-Gruppe) ist ein
    // BEREICH darin. Die Vertex-Bereiche vergibt First-Fit aus einer Freiliste, lebende Bereiche wandern nie: die
    // Chunk-Geometrie trägt subarray-Views auf den Satz (jeder CPU-Leser bleibt byte-gleich, der Geomorph schreibt hinein und
    // markiert seinen Bereich). Ein Bereich zerfällt in ZELLEN (Boden/Wasser: Viertel um die Mitte seiner Lage; Bau: je
    // Instanz), je Zelle ein Index-Lauf und eine Hülle; der Index (Uint32) trägt je
    // PASS einen ABSCHNITT: die Zellen, deren Hülle das Frustum der Pass-Kamera schneidet (`_chunkSatzPass` im Haken jedes
    // Passes), Boden nah → fern (Early-Z, wie three's Objekt-Sortierung), Wasser fern → nah (transparent). Befund 05.10.
    // (echte GPU, Mess-Wiese): der Satz zeichnete den ganzen Ring in JEDEM Pass — Hauptbild, Kaskade 0 und Kaskade 1 je
    // 245 696 Dreiecke, auch hinter dem Blick und jenseits jeder Kaskaden-Box. Jeder Schreibvorgang ist ein Teil-Upload
    // (`_chunkSatzSchreib` → addUpdateRange → queue.writeBuffer(offset)); ein Wachsen (Vertices ×1,5, Indizes ×1,25 oder
    // auf die Summe der Abschnitte) baut eine frische Geometrie und zeigt die Views neu.
    _chunkSatzArt(art) {
        if (art === "boden")
            return {
                name: "bodenSatz",
                // DIE VERTEX-FORM (K44): die Normale trägt snorm8x4, die Farbe float16x4 (`_satzPacke`), der Chunk behält seine
                // Float32-Arrays für jeden CPU-Leser. DER GEOMORPH DER STUFE (K51-2) bringt Normale und Stoff-Farbe des Ziels
                // (`aNormalZiel` snorm8x4, `aFarbeZiel` float16x4); die vierte Komponente trägt je einen Skalar des Chunks
                // (Morph-Code in der Farbe, Himmels-Sicht im Normal-Ziel, Schutt im Farb-Ziel) — 48 B je Vertex wie zuvor
                attr: [
                    ["position", 3],
                    ["normal", 3, "snorm8"],
                    ["color", 3, "half", "aMorphWeight"],
                    ["aMorphTarget", 3],
                    ["aNormalZiel", 3, "snorm8", "aHimmel"],
                    ["aFarbeZiel", 3, "half", "aSchutt"],
                ],
                mat: this._getVoxelChunkMaterial(),
                schatten: true, // der Boden wirft (Hang auf Tal) — je Kaskade 1 Befehl, ihr Abschnitt
                empfang: true,
                renderOrder: 0,
                richtung: 1, // nah → fern
                userData: { chunkSatz: "boden", inventar: "boden-satz", zeichenSchicht: "boden" },
            };
        if (art === "wasser")
            return {
                name: "wasserSatz",
                attr: [
                    ["position", 3],
                    ["aFlow", 2],
                    ["aWave", 1],
                    ["aDepth", 1],
                    ["aSlope", 1],
                ],
                mat: this._ensureHydroSurfaceMaterial(),
                schatten: false,
                empfang: false,
                renderOrder: 1, // transparent — nach den opaken Objekten
                richtung: -1, // fern → nah (transparent: der Maler-Algorithmus innerhalb des Satzes)
                hub: AnazhRealm._wasserHubM(), // der Shader hebt und senkt die Fläche (die Zellen-Hülle trägt es)
                userData: { chunkSatz: "wasser", isHydrosphere: true, hydroKind: "chunk-water-satz" },
            };
        // DER STOFF-SATZ: je Familie × Stoff × Wurf ein Satz — sein Stoff ist der geteilte Studio-Stoff. Der Bau-Satz
        // (`_bauSatzArt`): ein Bereich ist eine Instanz-Gruppe (alle ihre Instanzen in Welt-Lage, `_bauSatzBlock`). Der
        // Streu-Satz (`_streuSatzArt`, W7): ein Bereich ist der Block einer Kachel in einer Senke der Nah-Streu, seine Attribute
        // trägt der Eintrag (der wiegende Stoff dazu `aWiege`), seine Kapazität ist die der Streu.
        const bau = this.state.satzStoffe ? this.state.satzStoffe.get(art) : null;
        // Ein NUR-WURF-Satz (`bauWurf`, S3) liegt NUR auf SHADOW_TWIN_LAYER (die Kaskaden-Kameras sehen ihn, das Hauptbild
        // nie — `_chunkSatzPass` wählt dort nichts) und empfängt nichts.
        if (bau)
            return {
                name: bau.name,
                attr: bau.attr || AnazhRealm.BAU_SATZ_ATTR,
                mat: bau.mat,
                schatten: bau.wurf,
                empfang: bau.nurWurf !== true,
                nurWurf: bau.nurWurf === true,
                renderOrder: 0,
                richtung: bau.mat.transparent === true ? -1 : 1, // ein durchscheinender Stoff fern → nah
                userData: bau.userData || { bauSatz: bau.name },
                kapazitaet: bau.kapazitaet || "bau",
            };
        throw new Error(`_chunkSatzArt: unbekannte Satz-Art „${art}"`);
    }

    // Der Satz einer Art (lazy): EIN Szenen-Kind, frustumCulled=false (die Wahl je Pass trifft der Abschnitt).
    _chunkSatz(art) {
        const st = this.state;
        if (!st.chunkSaetze) st.chunkSaetze = new Map();
        let s = st.chunkSaetze.get(art);
        if (s) return s;
        if (!st.scene) throw new Error(`_chunkSatz(${art}): keine Szene`);
        const spec = this._chunkSatzArt(art);
        const C = AnazhRealm.CHUNK_SATZ[spec.kapazitaet || art];
        if (!C) throw new Error(`_chunkSatz: keine Start-Kapazität für „${art}" (CHUNK_SATZ)`);
        s = {
            art,
            spec,
            attrNamen: spec.attr.map((a) => a[0]),
            // je Attribut die Vertex-Form auf der GPU (`_satzForm`): `gis` = die Breite im Satz-Array (gepackt 4)
            // `w`: der Name eines Skalars des Chunks, den die vierte Komponente trägt (ohne Float16Array: Float32 × 4, `voll4`)
            attr: spec.attr.map(([name, is, form, w]) => {
                const f = this._satzForm(form) || (w ? "voll4" : null);
                return { name, is, form: f, gis: f ? 4 : is, w: w || null };
            }),
            geom: null,
            mesh: null,
            vKap: 0,
            iKap: 0,
            vEnde: 0,
            vFrei: [],
            bloecke: new Map(),
            ordnung: [],
            // je Pass-Schlüssel (haupt · k<i> · anders) sein Abschnitt im Index: { start, kap, n, liste, takt }
            abschnitte: new Map(),
            iEnde: 0, // Hochwasser der Abschnitte im Index
            iSumme: 0, // Indizes aller Bereiche (der ganze Ring)
            takt: 0, // Render-Takt (_tickChunkSatz) — ein Abschnitt, den kein Pass mehr fragt, fällt beim Umlegen
            vInhalt: 0, // die Vertices aller Bereiche (der Inhalt, den `_chunkSatzVerdichten` misst)
            ueberSeit: -1, // der Takt, seit dem die Kapazität über `schwelle` × Ziel liegt (-1 = sie liegt darunter)
            ueberHoch: 0, // das Hochwasser des Inhalts seit `ueberSeit`
            ueberStart: 0, // der Inhalt zu Beginn der Frist (wächst er um mehr als `stetig`, beginnt sie neu)
            schmutzig: false,
            anker: null,
            verborgen: false,
            grundAlt: false,
            wachse: 0,
            // DER STAND (Welle C): jede neue Hülle und jede neue Ordnung zählt — ein Abschnitt, gewählt in einem älteren Stand,
            // wählt neu (`_satzAbschnittSteht`)
            stand: 0,
            // DIE NEUSCHREIB-LINSE: Index-Bytes je „Verursacher>Abschnitt" (ein Pass, der den Abschnitt eines anderen
            // schreibt, steht beim Namen) — kumulativ, die Linsen lesen die Differenz je Frame
            schreiben: {},
        };
        this._chunkSatzGeometrie(s, C.v, C.i);
        const mesh = this._chunkSatzMesh(s); // unsichtbar, bis der erste Bereich liegt
        st.chunkSaetze.set(art, s);
        st.scene.add(mesh);
        return s;
    }

    // Die Pool-Geometrie (neu oder gewachsen): die Vertex-Attribute bis zum Hochwasser, der Index bis zum Hochwasser der
    // Abschnitte kopiert, die Views aller Bereiche neu gezeigt, die alte Geometrie geht in die verzögerte Entsorgung. Ein
    // Wachsen mitten im Frame (ein Schatten-Pass, dessen Abschnitt keinen Platz findet) ist richtig: der Mesh trägt ab
    // sofort die neue Geometrie, die den Abschnitt des Hauptbilds an seiner Stelle trägt (`_chunkSatzUmlegen` lässt ihn
    // liegen); was der Haupt-Pass schon aufzeichnete, liest die alte, die bis zur Abgabe lebt.
    _chunkSatzGeometrie(s, vKap, iKap) {
        const alt = s.geom;
        const waechst = vKap > s.vKap || iKap > s.iKap; // `wachse` zählt das Wachsen, nie das Schrumpfen (`_chunkSatzVerdichten`)
        const g = new THREE.BufferGeometry();
        for (const { name, form, gis } of s.attr) {
            const arr =
                form === "snorm8"
                    ? new Int8Array(vKap * 4)
                    : form === "half"
                      ? new globalThis.Float16Array(vKap * 4)
                      : new Float32Array(vKap * gis);
            if (alt) arr.set(alt.attributes[name].array.subarray(0, s.vEnde * gis));
            g.setAttribute(name, new THREE.BufferAttribute(arr, gis, form === "snorm8"));
        }
        const idx = new Uint32Array(iKap);
        const iN = alt ? Math.min(s.iEnde, alt.index.array.length, iKap) : 0;
        if (iN > 0) idx.set(alt.index.array.subarray(0, iN));
        g.setIndex(new THREE.BufferAttribute(idx, 1));
        if (alt) g.setDrawRange(alt.drawRange.start, alt.drawRange.count);
        else g.setDrawRange(0, 0);
        // frustumCulled=false: eine ehrliche „überall"-Kugel statt eines Laufs über die ganze Kapazität. Ihre Mitte liest
        // r184 nur als Sortier-Tiefe — die Reihe trägt `_zeichenRang` (T3; die Inhalts-Mitte gemessen: Genesis Ego +4,4 ms)
        g.boundingSphere = new THREE.Sphere(new THREE.Vector3(), 1e9);
        s.geom = g;
        s.vKap = vKap;
        s.iKap = iKap;
        for (const b of s.bloecke.values()) this._chunkSatzViews(s, b);
        // Ein Wachsen tauscht die Geometrie am SELBEN Mesh: seine Render-Objekte sehen den Tausch beim nächsten Zeichnen
        // (r184 `needsGeometryUpdate` → `setGeometry`). Die Falle des Tauschs — r184 hängt den Entsorgungs-Hörer einer
        // Geometrie an ihr ERSTES Render-Objekt und liest dessen Attribute erst beim Entsorgen, nach dem Tausch die der neuen
        // (Welle 6, echte GPU: die Normale des werfenden Bau-Satzes ohne Puffer, „Vertex buffer slot 5 … was not set") —
        // fällt an der Wurzel, für jede Geometrie: `_renderObjektRegister` nimmt den Hörer heraus, die alten Puffer verlassen
        // die GPU über den Kehraus (`_gpuKehraus`). Ein frischer Mesh je Wachsen ließe seine alten Render-Objekte am geteilten
        // Stoff hängen (sein dispose-Hörer hält sie).
        if (s.mesh) s.mesh.geometry = g;
        if (alt) {
            if (waechst) s.wachse++;
            this._queueGeometryDispose(alt);
        }
    }

    // DER SATZ FOLGT SEINEM INHALT (W7): die Kapazität eines Satzes folgte seiner Geschichte — er wuchs (×1,5) und schrumpfte
    // nie, ein leerer kehrte nur auf die Start-Kapazität zurück. Befund (echte GPU, Mess-Wiese, Puffer-Linse): in Ruhe hielt
    // der Wasser-Satz 3,25 MB für 0,33 MB Inhalt (9 745 von 65 536 Vertices), drei Bau-Sätze je 0,44 MB für 48 bis 1 464
    // Vertices; nach drei Wander-Schleifen à 1,2 km hielt der Boden-Satz 24,9 statt 16,4 MB und die Bau-Sätze 12,0 statt
    // 1,3 MB. Je Render-Takt misst der Satz sein Ziel: das Hochwasser seines Inhalts (die Vertices seiner Bereiche) über die
    // Frist × `luft`, die Indizes aus dem Hochwasser der Abschnitte, die ein Pass noch fragt, mindestens vMin/iMin. Liegt die
    // Kapazität `ruheTakte` Takte lang über `schwelle` × Ziel (die Schwelle über dem Wachs-Schritt hält ihn ruhig), schrumpft
    // er auf das Ziel — ohne auf eine Ruhe seiner Bereiche zu warten (die Wasser-Bereiche treten fast je Takt neu ein), aber
    // nie, solange er füllt: wächst sein Inhalt um mehr als `stetig` über den Stand zu Beginn der Frist (der Ring im Boot,
    // ein Dorf, das einströmt), beginnt die Frist neu. Dann ziehen die Bereiche dicht nach vorn (jeder Index-Lauf um die
    // Verschiebung seines Bereichs, Zellen und Hüllen bleiben), die Abschnitte fallen und jeder Pass legt seinen im nächsten
    // Frame neu, die Geometrie tauscht am SELBEN Mesh, die Views der Chunks zeigen auf die neuen Arrays (jeder CPU-Leser
    // bleibt byte-gleich). Ein leerer Satz ist der Fall „Inhalt 0". Die alten Puffer verlassen die GPU hier, vor dem Zeichnen
    // des Frames (`_loopRender`): ein Render-Objekt, das die alte Geometrie las, tauscht beim nächsten Zeichnen, und der
    // Kehraus hielte die Puffer eines unsichtbaren Satzes für gezeichnet (W6: Bau-Sätze 38,3 → 31,4 statt 45,2 MB).
    _chunkSatzVerdichten(s) {
        if (s.reserviert > 0) return false; // ein Bereich in Raten (`_bauSatzRate`) hält seine Lage, bis er eintritt
        const V = AnazhRealm.CHUNK_SATZ_VERDICHTEN;
        const R = AnazhRealm.CHUNK_SATZ_ABSCHNITT.ruheTakte;
        let iBedarf = 0;
        for (const a of s.abschnitte.values()) if (s.takt - a.takt <= R) iBedarf += this._chunkSatzKap(a.hoch);
        const hoch = s.ueberSeit < 0 ? s.vInhalt : Math.max(s.ueberHoch, s.vInhalt);
        const vZiel = Math.max(V.vMin, Math.ceil(hoch * V.luft));
        const iZiel = Math.max(V.iMin, Math.ceil(iBedarf * V.luft));
        const vNeu = s.vKap > vZiel * V.schwelle ? vZiel : s.vKap;
        const iNeu = s.iKap > iZiel * V.schwelle ? iZiel : s.iKap;
        if (vNeu === s.vKap && iNeu === s.iKap) {
            s.ueberSeit = -1;
            return false;
        }
        if (s.ueberSeit < 0 || s.vInhalt > s.ueberStart * V.stetig) {
            s.ueberSeit = s.takt;
            s.ueberStart = s.vInhalt;
        }
        s.ueberHoch = hoch;
        if (s.takt - s.ueberSeit <= R) return false;
        s.ueberSeit = -1;
        if (vNeu < s.vKap) {
            // dicht nach vorn, in Lage-Folge: jedes Ziel liegt vor seiner Quelle, kein Bereich überschreibt einen ungezogenen
            const folge = Array.from(s.bloecke.values()).sort((x, y) => x.vStart - y.vStart);
            let pos = 0;
            for (const b of folge) {
                const d = pos - b.vStart;
                if (d !== 0) {
                    for (const { name, gis } of s.attr)
                        s.geom.attributes[name].array.copyWithin(
                            pos * gis,
                            b.vStart * gis,
                            (b.vStart + b.vAnzahl) * gis
                        );
                    const idx = b.idx;
                    for (let i = 0; i < idx.length; i++) idx[i] += d;
                    b.vStart = pos;
                }
                pos += b.vAnzahl;
            }
            s.vEnde = pos;
            s.vFrei.length = 0;
        }
        s.abschnitte.clear();
        s.iEnde = 0;
        const alt = s.geom;
        this._chunkSatzGeometrie(s, vNeu, iNeu);
        s.geom.setDrawRange(0, 0); // der Index ist leer, bis jeder Pass seinen Abschnitt legt
        s.verdichtet = (s.verdichtet || 0) + 1;
        for (const k in alt.attributes) this._gpuAbschied(alt.attributes[k]);
        if (alt.index) this._gpuAbschied(alt.index);
        return true;
    }

    // Der EINE Mesh eines Satzes über seiner Pool-Geometrie (ein Wachsen tauscht nur die Geometrie).
    _chunkSatzMesh(s) {
        const spec = s.spec;
        const mesh = new THREE.Mesh(s.geom, spec.mat);
        mesh.name = spec.name;
        mesh.matrixAutoUpdate = false; // STATISCH (E-Bauart): die Lage des Satzes liegt in seinen Vertices
        mesh.frustumCulled = false;
        mesh.castShadow = spec.schatten;
        mesh.receiveShadow = spec.empfang;
        mesh.renderOrder = spec.renderOrder;
        mesh.visible = s.grundAlt = this._chunkSatzGrund(s);
        Object.assign(mesh.userData, spec.userData);
        if (spec.nurWurf) mesh.layers.disable(0); // der Wurf-Satz: nur die Kaskaden (sein Wurf ist die Wurf-Ebene, K72)
        s.mesh = mesh;
        return mesh;
    }

    // Die Views eines Bereichs: jedes Float32-Attribut des Chunks zeigt in den Satz; ein gepacktes (`form`) behält der Chunk
    // als eigenes Float32-Array — der CPU-Leser liest den Wert des Gesetzes, die GPU seine Vertex-Form.
    _chunkSatzViews(s, b) {
        for (const { name, form, is } of s.attr)
            if (!form)
                b.geom.attributes[name].array = s.geom.attributes[name].array.subarray(
                    b.vStart * is,
                    (b.vStart + b.vAnzahl) * is
                );
    }

    // DIE VERTEX-FORM des Satzes (K44, gemessen 14.10. Radeon, Genesis third: der Boden-Satz 14,6 von 40,1 MB Puffer, 60 B je
    // Vertex, Normale und Farbe 24 B davon in Float32): die Normale (Einheitsvektor, |n| ≤ 1) reist als snorm8x4 (4 B, ≤ 0,45°
    // — die Form der Profi-Engines für Vertex-Normalen), die Farbe als float16x4 (8 B, 11 Bit Mantisse, Werte über 1 bleiben;
    // unorm hätte die Glut-Farben über 1 gekappt). Die vierte Komponente: Normale 0, Farbe 1 (Alpha). Rückgabe: die Form oder
    // null (Float32). Ohne Float16Array (vor Chrome 135) bleibt die Farbe Float32 — laut, einmal je Welt.
    _satzForm(form) {
        if (!form) return null;
        if (form === "snorm8") return form;
        if (form === "half") {
            if (typeof globalThis.Float16Array === "function") return form;
            if (!this._satzFormLaut) {
                this._satzFormLaut = true;
                this.log(
                    "VERTEX-FORM: Float16Array fehlt (Browser vor Chrome 135) — die Satz-Farbe bleibt Float32",
                    "ERROR"
                );
            }
            return null;
        }
        throw new Error(`_satzForm: unbekannte Vertex-Form „${form}"`);
    }

    // Packt `n` Vertices (Breite `is`, aus `src` ab Vertex 0) in die Vertex-Form `form` nach `dst` ab Vertex `ab` (Breite 4).
    // EINE Quelle für Satz und Linse (gate:chunk-satz (f) prüft den Bereich gegen genau diese Packung).
    // `w` (optional): ein Skalar je Vertex für die vierte Komponente (snorm8: −1…1, sonst roh; ohne: Normale 0, Farbe 1).
    static _satzPacke(form, src, is, dst, ab, n, w) {
        const o0 = ab * 4;
        if (form === "snorm8")
            for (let v = 0; v < n; v++) {
                const q = v * is,
                    o = o0 + v * 4;
                for (let k = 0; k < 3; k++) {
                    const x = src[q + k];
                    dst[o + k] = Math.round((x > 1 ? 1 : x < -1 ? -1 : x) * 127);
                }
                const x = w ? w[v] : 0;
                dst[o + 3] = Math.round((x > 1 ? 1 : x < -1 ? -1 : x) * 127);
            }
        else
            for (let v = 0; v < n; v++) {
                const q = v * is,
                    o = o0 + v * 4;
                dst[o] = src[q];
                dst[o + 1] = src[q + 1];
                dst[o + 2] = src[q + 2];
                dst[o + 3] = w ? w[v] : 1;
            }
    }

    // DER VERGLEICHENDE SCHREIBER der Sätze (K71): legt `quelle` (ein Array derselben Art, oder EIN Wert für `n` Plätze) ab
    // `ab` in `ziel` und schreibt nur den Lauf, der sich dort ändert — `lauf` trägt ihn danach als [von, bis) relativ zu `ab`;
    // Rückgabe false, wenn jedes Element schon so lag. Ein Satz-Schreiber hebt die Version seines Puffers nur über diesen
    // Lauf: eine gehobene Version ohne neue Bytes frischte jedes Render-Objekt des Satzes in jedem Pass voll auf (Genesis
    // Third in Ruhe: ein Bau-Bereich, dessen letzte Instanz der Cull nahm, trat mit denselben Bytes am selben Ort neu ein).
    static _satzSetze(ziel, ab, quelle, n, lauf) {
        const wert = typeof quelle === "number";
        if (!wert) n = quelle.length;
        let von = 0;
        if (wert) while (von < n && ziel[ab + von] === quelle) von++;
        else while (von < n && ziel[ab + von] === quelle[von]) von++;
        if (von === n) return false;
        let bis = n;
        if (wert) while (ziel[ab + bis - 1] === quelle) bis--;
        else while (ziel[ab + bis - 1] === quelle[bis - 1]) bis--;
        if (wert) ziel.fill(quelle, ab + von, ab + bis);
        else ziel.set(von === 0 && bis === n ? quelle : quelle.subarray(von, bis), ab + von);
        lauf[0] = von;
        lauf[1] = bis;
        return true;
    }

    // DIE FREILISTE des Satzes — EINE Mechanik für seine Vertex-Bereiche und die Zellen-Plätze seiner Abschnitte: Läufe
    // [start, länge], nach Start sortiert, Nachbarn verschmolzen. `_satzFreiNimm` nimmt First-Fit den ersten Lauf, der
    // reicht (−1: keiner); `_satzFreiGib` legt einen Lauf zurück und gibt das neue Hochwasser zurück (ein Lauf, der das
    // Hochwasser `ende` berührt, senkt es).
    _satzFreiNimm(frei, n) {
        for (let i = 0; i < frei.length; i++) {
            const f = frei[i];
            if (f[1] < n) continue;
            const start = f[0];
            if (f[1] === n) frei.splice(i, 1);
            else {
                f[0] += n;
                f[1] -= n;
            }
            return start;
        }
        return -1;
    }

    // Nimmt genau [start, start + n) aus der Freiliste (ein Bereich wächst an seinem Ende); false: der Lauf ist nicht frei.
    _satzFreiAb(frei, start, n) {
        for (let i = 0; i < frei.length; i++) {
            const f = frei[i];
            if (f[0] > start) return false;
            if (f[0] !== start) continue;
            if (f[1] < n) return false;
            if (f[1] === n) frei.splice(i, 1);
            else {
                f[0] += n;
                f[1] -= n;
            }
            return true;
        }
        return false;
    }

    _satzFreiGib(frei, start, n, ende) {
        let i = 0;
        while (i < frei.length && frei[i][0] < start) i++;
        frei.splice(i, 0, [start, n]);
        if (i + 1 < frei.length && frei[i][0] + frei[i][1] === frei[i + 1][0]) {
            frei[i][1] += frei[i + 1][1];
            frei.splice(i + 1, 1);
        }
        if (i > 0 && frei[i - 1][0] + frei[i - 1][1] === frei[i][0]) {
            frei[i - 1][1] += frei[i][1];
            frei.splice(i, 1);
        }
        const letzt = frei[frei.length - 1];
        if (letzt && letzt[0] + letzt[1] === ende) {
            frei.pop();
            return letzt[0];
        }
        return ende;
    }

    // Ein Vertex-Bereich: First-Fit aus der Freiliste, sonst am Hochwasser; reicht die Kapazität nicht, wächst der Satz.
    _chunkSatzVAlloc(s, n) {
        const frei = this._satzFreiNimm(s.vFrei, n);
        if (frei >= 0) return frei;
        if (s.vEnde + n > s.vKap) this._chunkSatzGeometrie(s, Math.max(s.vEnde + n, Math.ceil(s.vKap * 1.5)), s.iKap);
        const start = s.vEnde;
        s.vEnde += n;
        return start;
    }

    // Ein Vertex-Bereich zurück in die Freiliste.
    _chunkSatzVFrei(s, start, n) {
        s.vEnde = this._satzFreiGib(s.vFrei, start, n, s.vEnde);
    }

    // DER EINE EINTRITT eines Chunk-Bürgers in die Szene: `key` ist der Bereichs-Name (Chunk-Key oder
    // `stitch:<chunk>`), `chunkKey` sein Chunk (für die Nah-fern-Ordnung). Fail-closed: jedes Satz-Attribut muss
    // mit seiner Breite vorliegen, ein Index muss da sein — ein fehlender Wert ist ein lauter Bruch.
    _chunkSatzEin(art, key, geom, chunkKey) {
        const s = this._chunkSatz(art);
        const alt = s.bloecke.get(key);
        if (alt) this._chunkSatzAus(art, key);
        const n = geom && geom.attributes && geom.attributes.position ? geom.attributes.position.count : 0;
        for (const [name, is, , w] of s.spec.attr)
            for (const [nm, b] of w
                ? [
                      [name, is],
                      [w, 1],
                  ]
                : [[name, is]]) {
                const a = geom && geom.attributes ? geom.attributes[nm] : null;
                if (!a || a.itemSize !== b || a.count !== n)
                    throw new Error(
                        `_chunkSatzEin(${art}, ${key}): Attribut ${nm} fehlt oder passt nicht (${n} Vertices)`
                    );
            }
        if (!geom.index || !geom.index.array) throw new Error(`_chunkSatzEin(${art}, ${key}): kein Index`);
        const vStart = this._chunkSatzVAlloc(s, n);
        this._chunkSatzLege(s, vStart, geom.attributes, n, !!alt && alt.vStart === vStart);
        return this._chunkSatzBuerger(s, key, geom, vStart, n, chunkKey);
    }

    // Legt `n` Ecken (`A`: je Satz-Attribut sein Array) ab `vStart` in die Pool-Geometrie des Satzes. Jedes Attribut lädt
    // nur den Lauf, der sich ändert (K71, `_satzSetze`): ein Bereich, der am selben Ort neu eintritt (`amOrt`: der Cull
    // nahm die letzte Instanz einer Bau-Gruppe), trägt dort meist dieselben Bytes. Ein gepacktes Attribut packt dann erst
    // in einen Vorrat und vergleicht; an einem fremden Ort packt es direkt.
    _chunkSatzLege(s, vStart, A, n, amOrt) {
        const g = s.geom;
        const L = this._satzLauf || (this._satzLauf = [0, 0]);
        for (const { name, is, form, gis, w } of s.attr) {
            const ga = g.attributes[name];
            let quelle = A[name].array;
            if (form && amOrt) {
                const V = this._satzVorrat || (this._satzVorrat = new Map());
                let vr = V.get(ga.array.constructor);
                if (!vr || vr.length < n * gis)
                    V.set(ga.array.constructor, (vr = new ga.array.constructor(n * gis * 2)));
                AnazhRealm._satzPacke(form, quelle, is, vr, 0, n, w && A[w].array);
                quelle = vr.subarray(0, n * gis);
            } else if (form) {
                AnazhRealm._satzPacke(form, quelle, is, ga.array, vStart, n, w && A[w].array);
                ga.addUpdateRange(vStart * gis, n * gis);
                ga.needsUpdate = true;
                continue;
            }
            if (!AnazhRealm._satzSetze(ga.array, vStart * gis, quelle, 0, L)) continue;
            // genau der Lauf: ein gepacktes Element trägt 1 oder 2 Bytes, die 4-Byte-Wörter rundet die Wort-Schrift
            ga.addUpdateRange(vStart * gis + L[0], L[1] - L[0]);
            ga.needsUpdate = true;
        }
    }

    // Der Bürger eines gelegten Bereichs (`_chunkSatzEin`; der Bau-Satz in Raten, `_bauSatzRate`): seine Views, Zellen und
    // Hüllen — ab hier zeichnet er.
    _chunkSatzBuerger(s, key, geom, vStart, n, chunkKey) {
        const li = geom.index.array;
        const ck = String(chunkKey);
        const komma = ck.indexOf(",");
        const b = {
            key,
            chunkKey: ck,
            cx: Number(ck.slice(0, komma)),
            cz: Number(ck.slice(komma + 1)),
            geom,
            vStart,
            vAnzahl: n,
            idx: null,
            iAnzahl: li.length,
            zellen: null,
            huelle: null,
        };
        s.bloecke.set(key, b);
        s.vInhalt += n;
        this._chunkSatzViews(s, b);
        // Ein Boden-Chunk bringt seinen Höhlen-Graph (Welle 7): seine Zellen werden Knoten, verknüpft mit den Nachbarn
        if (geom.hoehle) this._hoehlenKnoten(s, b, geom.hoehle);
        this._chunkSatzZellen(b, li, vStart, geom.zellen || null, geom.hoehle || null);
        this._chunkSatzHuelle(s, b);
        if (b.hoehle) this._hoehlenVerknuepfe(s, b);
        // EIN FLÜCHTIGER BLOCK (K69, `_satzBlock`): seine Arrays sind Views der Werkbank — der Bereich hält keine davon (die
        // nächste Rechnung überschreibt sie), nur die Views in den Satz; wer die Werte braucht, rechnet sie aus `quelle` nach.
        if (geom.fluechtig) {
            for (const { name, form } of s.attr) if (form) geom.attributes[name].array = null;
            geom.index = null;
            geom.zellen = null;
        }
        s.iSumme += b.iAnzahl;
        s.schmutzig = true;
        return b;
    }

    // DIE ZELLEN eines Bereichs — die Einheit, die ein Pass wählt: der Bereichs-Index (um den Bereichs-Anfang verschoben)
    // legt sie als zusammenhängende Läufe hintereinander, je Zelle eine Hülle. Ein Bau-Bereich bringt seine Läufe mit
    // (`grenzen`: Index-Offsets, je Instanz einer — `_bauSatzBlock`; vorher zog die Kaskade den Lauf vom ersten bis zum letzten
    // Bereich im Frustum, k1 fast den ganzen Fels-Satz); ein Boden-/Wasser-Bereich zerfällt in VIERTEL (`_chunkSatzViertel`).
    // Fail-closed: Grenzen, die den Index nicht lückenlos in ganzen Dreiecken teilen, sind ein lauter Bruch.
    _chunkSatzZellen(b, li, vStart, grenzen, hoehle) {
        if (!grenzen) return this._chunkSatzViertel(b, li, vStart, hoehle);
        const ende = grenzen.length - 1;
        if (ende < 1 || grenzen[0] !== 0 || grenzen[ende] !== li.length)
            throw new Error(`_chunkSatzZellen(${b.key}): die Grenzen teilen den Index nicht (${li.length} Indizes)`);
        const idx = new Uint32Array(li.length);
        for (let i = 0; i < li.length; i++) idx[i] = li[i] + vStart;
        b.idx = idx;
        b.iAnzahl = idx.length;
        b.zellen = [];
        for (let z = 0; z < ende; z++) {
            const a = grenzen[z],
                e = grenzen[z + 1];
            if (e < a || a % 3 !== 0 || e % 3 !== 0)
                throw new Error(`_chunkSatzZellen(${b.key}): Grenze ${z} [${a}, ${e}) teilt kein ganzes Dreieck`);
            if (e > a) b.zellen.push({ bereich: b, idx: idx.subarray(a, e), huelle: new THREE.Box3() });
        }
    }

    // DIE VIERTEL eines Boden-/Wasser-Bereichs: jedes Dreieck nach seinem Schwerpunkt (xz) in eine von 2×2 Zellen um die
    // Mitte der Lage des Bereichs (Werkbank 05.10., Mess-Wiese, Mittag, ein Blick: ganze Chunks 337k Dreiecke über drei
    // Pässe, Viertel 282k, Sechzehntel 263k). Ein Boden-Chunk mit Höhlen-Graph (Welle 7) legt die Dreiecke der HIMMELS-Luft
    // in die Viertel und jedes Dreieck der Höhlen-Luft in die Zelle seines Knotens (`knoten`: nur sie wählt die Höhlen-Sicht).
    _chunkSatzViertel(b, li, vStart, hoehle) {
        const P = b.geom.attributes.position.array;
        let x0 = Infinity,
            x1 = -Infinity,
            z0 = Infinity,
            z1 = -Infinity;
        for (let k = 0; k < P.length; k += 3) {
            if (P[k] < x0) x0 = P[k];
            if (P[k] > x1) x1 = P[k];
            if (P[k + 2] < z0) z0 = P[k + 2];
            if (P[k + 2] > z1) z1 = P[k + 2];
        }
        // gegen die Schwerpunkt-SUMME (drei Ecken) verglichen: die Mitte × 3
        const mx3 = 1.5 * (x0 + x1),
            mz3 = 1.5 * (z0 + z1);
        const nT = (li.length / 3) | 0;
        // Zellen 0…3 die Viertel der Himmels-Luft, 4 + k der Höhlen-Knoten k
        const H = hoehle ? hoehle.tri : null;
        if (H && H.length !== nT)
            throw new Error(`_chunkSatzViertel(${b.key}): ${H.length} Höhlen-Zellen für ${nT} Dreiecke`);
        const nZ = 4 + (hoehle ? hoehle.n : 0);
        const zelle = new Int32Array(nT);
        const zahl = new Int32Array(nZ);
        for (let t = 0, i = 0; t < nT; t++, i += 3) {
            let z;
            if (H && H[t] >= 0) z = 4 + H[t];
            else {
                const a = li[i] * 3,
                    c = li[i + 1] * 3,
                    d = li[i + 2] * 3;
                z = (P[a] + P[c] + P[d] > mx3 ? 1 : 0) + (P[a + 2] + P[c + 2] + P[d + 2] > mz3 ? 2 : 0);
            }
            zelle[t] = z;
            zahl[z]++;
        }
        const start = new Int32Array(nZ);
        for (let z = 1; z < nZ; z++) start[z] = start[z - 1] + zahl[z - 1] * 3;
        const idx = new Uint32Array(nT * 3);
        const pos = start.slice();
        for (let t = 0, i = 0; t < nT; t++, i += 3) {
            const p = pos[zelle[t]];
            idx[p] = li[i] + vStart;
            idx[p + 1] = li[i + 1] + vStart;
            idx[p + 2] = li[i + 2] + vStart;
            pos[zelle[t]] = p + 3;
        }
        b.idx = idx;
        b.iAnzahl = idx.length;
        b.zellen = [];
        for (let z = 0; z < nZ; z++)
            if (zahl[z] > 0) {
                const zl = {
                    bereich: b,
                    idx: idx.subarray(start[z], start[z] + zahl[z] * 3),
                    huelle: new THREE.Box3(),
                };
                if (z >= 4) {
                    zl.knoten = b.hoehle.knoten[z - 4];
                    zl.knoten.zelle = zl;
                }
                b.zellen.push(zl);
            }
    }

    // DIE HÜLLE eines Bereichs und seiner Zellen (Welt-AABB + `randM`): der Satz lebt außerhalb jedes Bundles (EIN
    // Szenen-Mesh), jeder Pass wählt seine Zellen über ihre Hülle (`_chunkSatzAbschnitt`); die Kaskaden-Box liest die
    // Bereichs-Hülle jedes werfenden Satzes als Empfänger-Band (der Boden unter der Scheibe empfängt) und als Werfer (ein
    // Hang zur Sonne hin wirft über die nahe Ebene). Der Boden-Shader zeichnet zwischen Position und Morph-Ziel; das Ziel
    // zählt nur, wo sein Gewicht greift (ungewichtete Ziele tragen keine Lage). Ein Satz, dessen Stoff die Fläche senkrecht
    // hebt (das Wasser, `spec.hub` = `_wasserHubM`), trägt den Hub oben und unten.
    // `nur` (fahrt-takt): ein Schreiber, der nur diese Vertices des Bereichs bewegt (der Teil-Morph, `_applyCrossLodGeomorph`),
    // lässt jede andere Ecke stehen — je Zelle die feste Hülle (die Lage jeder Ecke, das Ziel jeder anderen) einmal je Bereich und
    // Rand, danach nur die Ziele des Rands; dieselbe Hülle wie über jede Ecke (Minimum und Maximum kennen keine Reihe).
    _chunkSatzHuelle(s, b, nur = null, von = 0, bis = -1) {
        s.stand++;
        const h = b.huelle || (b.huelle = new THREE.Box3());
        h.makeEmpty();
        if (bis < 0) bis = b.zellen.length;
        const A = b.geom.attributes;
        const P = A.position.array,
            Z = A.aMorphTarget ? A.aMorphTarget.array : null;
        const vs = b.vStart;
        const rand = AnazhRealm.SCHATTEN_KASKADE.randM;
        const hub = s.spec.hub || 0;
        let F = nur && Z ? b.festRand : null;
        if (nur && Z && !(F && F.nur === nur && F.zellen === b.zellen)) {
            // einmal je Bereich und Rand (der erste Morph ruft sie ohnehin ganz): je Zelle die feste Kiste und ihre Rand-Ecken
            const inR = new Uint8Array(P.length / 3);
            for (const v of nur) inR[v] = 1;
            const marke = new Int32Array(P.length / 3);
            F = b.festRand = { nur, zellen: b.zellen, je: [] };
            for (let zi = 0; zi < b.zellen.length; zi++) {
                const I = b.zellen[zi].idx;
                let x0 = Infinity,
                    y0 = Infinity,
                    z0 = Infinity,
                    x1 = -Infinity,
                    y1 = -Infinity,
                    z1 = -Infinity;
                const rv = [];
                for (let i = 0; i < I.length; i++) {
                    const v = I[i] - vs,
                        o = v * 3;
                    let x = P[o],
                        y = P[o + 1],
                        z = P[o + 2];
                    if (x < x0) x0 = x;
                    if (x > x1) x1 = x;
                    if (y < y0) y0 = y;
                    if (y > y1) y1 = y;
                    if (z < z0) z0 = z;
                    if (z > z1) z1 = z;
                    if (inR[v]) {
                        if (marke[v] !== zi + 1) {
                            marke[v] = zi + 1;
                            rv.push(v);
                        }
                        continue;
                    }
                    x = Z[o];
                    y = Z[o + 1];
                    z = Z[o + 2];
                    if (x < x0) x0 = x;
                    if (x > x1) x1 = x;
                    if (y < y0) y0 = y;
                    if (y > y1) y1 = y;
                    if (z < z0) z0 = z;
                    if (z > z1) z1 = z;
                }
                const k = [x0, y0, z0, x1, y1, z1];
                F.je.push({ kiste: k, rv: Int32Array.from(rv) });
            }
        }
        for (let zi = von; zi < bis; zi++) {
            const zelle = b.zellen[zi];
            const I = zelle.idx;
            const fk = F && F.je[zi].kiste;
            let x0 = fk ? fk[0] : Infinity,
                y0 = fk ? fk[1] : Infinity,
                z0 = fk ? fk[2] : Infinity,
                x1 = fk ? fk[3] : -Infinity,
                y1 = fk ? fk[4] : -Infinity,
                z1 = fk ? fk[5] : -Infinity;
            const dazu = (q, k) => {
                const x = q[k],
                    y = q[k + 1],
                    z = q[k + 2];
                if (x < x0) x0 = x;
                if (x > x1) x1 = x;
                if (y < y0) y0 = y;
                if (y > y1) y1 = y;
                if (z < z0) z0 = z;
                if (z > z1) z1 = z;
            };
            if (F) for (const v of F.je[zi].rv) dazu(Z, v * 3);
            else
                for (let i = 0; i < I.length; i++) {
                    const v = I[i] - vs;
                    dazu(P, v * 3);
                    // das Morph-Ziel trägt Lage, sobald der Geomorph greift — Naht wie Stufe (K51-2: das Stufen-Gewicht folgt dem
                    // Auge, jedes Ziel kann ganz gezeichnet werden)
                    if (Z) dazu(Z, v * 3);
                }
            const zh = zelle.huelle;
            zh.makeEmpty();
            if (x1 >= x0) {
                zh.min.set(x0, y0, z0);
                zh.max.set(x1, y1, z1);
                zh.expandByScalar(rand);
                zh.min.y -= hub;
                zh.max.y += hub;
            }
        }
        for (const zelle of b.zellen) if (!zelle.huelle.isEmpty()) h.union(zelle.huelle);
    }

    // Der Austritt: die Chunk-Geometrie behält ihre Daten als EIGENE Kopie (ihr Bereich wird frei und neu
    // vergeben), jeder Abschnitt legt sich in seinem nächsten Pass neu.
    _chunkSatzAus(art, key) {
        const s = this.state.chunkSaetze ? this.state.chunkSaetze.get(art) : null;
        const b = s ? s.bloecke.get(key) : null;
        if (!b) return false;
        // ein flüchtiger Block (`_satzBlock`) hat keinen Eigner, der seine Daten behielte — keine Kopie
        if (!b.geom.fluechtig)
            for (const { name, form } of s.attr) {
                const a = b.geom.attributes[name];
                if (a && !form) a.array = a.array.slice(); // ein gepacktes trägt der Chunk ohnehin selbst
            }
        if (b.hoehle) this._hoehlenLoese(s, b);
        this._chunkSatzVFrei(s, b.vStart, b.vAnzahl);
        s.bloecke.delete(key);
        s.vInhalt -= b.vAnzahl;
        s.iSumme -= b.iAnzahl;
        s.schmutzig = true;
        return true;
    }

    // Ein CPU-Schreiber (Geomorph) hat Attribute seines Bereichs geändert → genau dieser Bereich lädt hoch; `nur`: er bewegte
    // nur diese Vertices (die Hülle, `_chunkSatzHuelle`).
    _chunkSatzMarke(art, key, namen, nur = null) {
        const s = this.state.chunkSaetze ? this.state.chunkSaetze.get(art) : null;
        const b = s ? s.bloecke.get(key) : null;
        if (!b) throw new Error(`_chunkSatzMarke(${art}, ${key}): kein Bereich im Satz`);
        if (b.geom.fluechtig)
            throw new Error(
                `_chunkSatzMarke(${art}, ${key}): ein flüchtiger Block trägt keinen CPU-Schreiber (_satzBlock)`
            );
        // je geschriebenem Namen das Satz-Attribut, das ihn trägt — selbst oder in seiner vierten Komponente (`w`)
        for (const fa of s.attr) {
            if (!namen.includes(fa.name) && !(fa.w && namen.includes(fa.w))) continue;
            const ga = s.geom.attributes[fa.name];
            // ein gepacktes Attribut liest der Schreiber im Chunk (Float32) — der Satz packt es neu
            if (fa.form)
                AnazhRealm._satzPacke(
                    fa.form,
                    b.geom.attributes[fa.name].array,
                    fa.is,
                    ga.array,
                    b.vStart,
                    b.vAnzahl,
                    fa.w && b.geom.attributes[fa.w].array
                );
            ga.addUpdateRange(b.vStart * ga.itemSize, b.vAnzahl * ga.itemSize);
            ga.needsUpdate = true;
        }
        this._chunkSatzHuelle(s, b, nur); // der Geomorph legt neue Ziele — die Hülle folgt
        // und der Horizont (`_hoehlenHorizont`) liest sie neu — jede gemerkte Sperre misst ihn neu (`H.boden`)
        if (b.hoehle) {
            b.hoehle.horizont = null;
            s.hoehle.boden++;
        }
    }

    // Die Grund-Sicht des Satzes (außerhalb jedes Passes): nicht verborgen und ein Bereich da.
    _chunkSatzGrund(s) {
        return !s.verborgen && s.iSumme > 0;
    }

    _chunkSatzSichtbar(art, sichtbar) {
        const s = this.state.chunkSaetze ? this.state.chunkSaetze.get(art) : null;
        if (!s) return;
        s.verborgen = !sichtbar;
        s.grundAlt = this._chunkSatzGrund(s);
        s.mesh.visible = s.grundAlt;
    }

    // Je Render (vor dem Zeichnen): jeder geänderte Satz ordnet seine Bereiche neu (ein Spieler-Chunk-Wechsel: Ring-
    // Distanz); die Abschnitte legt jeder Pass in seinem Haken.
    _tickChunkSatz() {
        this._tickBauSatz();
        const saetze = this.state.chunkSaetze;
        if (!saetze || saetze.size === 0) return;
        for (const s of saetze.values()) {
            s.takt++;
            this._chunkSatzBereit(s);
            this._chunkSatzVerdichten(s);
        }
    }

    _chunkSatzBereit(s) {
        const lpc = this.state.lastPlayerVoxelChunk;
        const anker = lpc ? lpc.cx + "," + lpc.cz : "";
        if (s.schmutzig || s.anker !== anker) this._chunkSatzOrdnen(s, lpc, anker);
    }

    _chunkSatzOrdnen(s, lpc, anker) {
        const pcx = lpc ? lpc.cx : 0,
            pcz = lpc ? lpc.cz : 0;
        const r = s.spec.richtung;
        const neu = Array.from(s.bloecke.values());
        for (const b of neu) b._d = lpc ? Math.max(Math.abs(b.cx - pcx), Math.abs(b.cz - pcz)) : 0;
        neu.sort((a, b) => (a._d - b._d) * r || (a.key < b.key ? -1 : a.key > b.key ? 1 : 0));
        s.ordnung = neu;
        s.stand++;
        // die Grund-Sicht schreibt der Satz nur, wenn sie kippt (erster Bereich, letzter fort) — ein Werkzeug, das ihn
        // verbirgt, bleibt Herr seiner Sicht
        const grund = this._chunkSatzGrund(s);
        if (grund !== s.grundAlt) {
            s.mesh.visible = grund;
            s.grundAlt = grund;
        }
        s.schmutzig = false;
        s.anker = anker;
    }

    // DER SATZ JE PASS (aus `_passSicht`, dem Haken jedes Renders, mit der Lage des Passes in `S.lage`): jeder Satz zeichnet
    // in diesem Pass seinen Abschnitt — die Zellen, deren Hülle das EINE Gesetz der Pass-Wahl trifft (`_passTrifftBox`). Das
    // Hauptbild wählt mit dem Frustum der Haupt-Kamera, jede Kaskade (`k` ≥ 0) mit ihrer Box (die Kaskaden-Kamera samt
    // Werfer-Raum zum Licht: ein Hang hinter dem Blick, der in die nahe Scheibe wirft, wirft) UND der Licht-Kapsel gegen ihre
    // Scheibe (eine Zelle, deren Schatten keinen Empfänger der Scheibe trifft, wirft dort nicht), jede andere Kamera mit ihrem
    // Frustum; ein Satz, der nicht wirft, ruht im Schatten-Pass (three zieht ihn dort nie). Nach jedem Pass zeigt der Satz
    // wieder den Abschnitt des Hauptbilds — ein Schatten-Pass läuft mitten im Haupt-Pass. STEHT die Lage des Passes und der
    // Stand des Satzes (`_satzAbschnittSteht`, Welle C), zeichnet der Abschnitt, wie er liegt: keine Höhlen-Sicht, keine
    // Prüfung, kein Byte — nach jedem Pass, auch dem Nachher-Haken, rechnet nichts neu.
    _chunkSatzPass(kamera, nach, k, S) {
        const saetze = this.state.chunkSaetze;
        if (!saetze || saetze.size === 0) return;
        const haupt = !nach && kamera === this.state.camera;
        const key = nach || haupt ? "haupt" : k >= 0 ? "k" + k : "anders";
        for (const s of saetze.values()) {
            if (nach) {
                this._chunkSatzZeige(s, s.abschnitte.get("haupt"), null);
                continue;
            }
            if (k >= 0 && s.spec.schatten !== true) continue;
            this._chunkSatzBereit(s);
            // Das Hauptbild läuft vor jedem Zeichnen des Frames: hier legt der Satz seine Abschnitte dicht neu, sobald der
            // Verschnitt (die verlassenen Läufe umgezogener Abschnitte) wächst.
            if (haupt) {
                let belegt = 0;
                for (const a of s.abschnitte.values()) belegt += a.kap;
                if (s.iEnde - belegt > s.iKap * AnazhRealm.CHUNK_SATZ_ABSCHNITT.verschnitt)
                    this._chunkSatzUmlegen(s, null, 0, key);
            }
            // DER WURF-SATZ (S3, `nurWurf`) zeichnet nur in den Kaskaden: das Hauptbild legt seine Abschnitte dicht (oben),
            // wählt keine Zelle und zieht keinen Befehl
            if (k < 0 && s.spec.nurWurf === true) {
                this._chunkSatzZeige(s, null, null);
                continue;
            }
            let a = s.abschnitte.get(key);
            if (this._satzAbschnittSteht(s, a, S.lage, kamera)) {
                this._chunkSatzRuht(s, a, key);
                // die Höhlen-Sicht dieses Passes prüfte keine Mündung frisch
                if (s.hoehle && s.hoehle.offen && kamera.isPerspectiveCamera === true) s.hoehle.offen.length = 0;
            } else {
                // Die Höhlen-Schicht (Welle 7): welche Höhlen-Zelle die Pass-Kamera durch Luft erreicht
                if (s.hoehle) this._hoehlenSicht(s, kamera, S, haupt);
                a = this._chunkSatzAbschnitt(s, key, S.lage, haupt);
                this._satzAbschnittMerke(s, a, S.lage, kamera);
            }
            this._chunkSatzZeige(s, a, S.ab);
        }
    }

    // STEHT der Abschnitt eines Passes (Welle C)? Er wurde in derselben Lage gewählt (`L.gen`, `_passLageGen`), der Satz hat
    // seither keinen Bereich, keine Hülle und keine Ordnung geändert (`s.stand`), und seine Höhlen-Sicht gilt noch: derselbe
    // Boden (`H.boden`); perspektivisch trug sie jede Mündung im Bild mit ihrer Horizont-Sperre (`voll` — eine Mündung ohne
    // frische Probe galt als offen, die nächste Wahl schneidet weiter), die Kaskade las dieselben Empfänger des Hauptbilds
    // (`H.sichtGen`). Und der Abschnitt trägt noch die Zellen seiner Wahl (dieselbe Liste — wer ihn leert oder neu legt,
    // legt eine neue).
    _satzAbschnittSteht(s, a, L, kamera) {
        const w = a && a.wahl;
        if (!w || w.gen !== L.gen || w.stand !== s.stand || w.liste !== a.liste) return false;
        const H = s.hoehle;
        if (!H) return true;
        if (w.boden !== H.boden) return false;
        return kamera.isPerspectiveCamera === true ? w.voll === true : w.empfang === H.sichtGen;
    }

    _satzAbschnittMerke(s, a, L, kamera) {
        const w = a.wahl || (a.wahl = { gen: 0, stand: 0, boden: 0, voll: false, empfang: 0, liste: null });
        const H = s.hoehle;
        w.gen = L.gen;
        w.liste = a.liste;
        w.stand = s.stand;
        w.boden = H ? H.boden : 0;
        w.voll = H ? kamera.isPerspectiveCamera === true && H.voll === true : true;
        w.empfang = H ? H.sichtGen : 0;
    }

    // Ein Abschnitt, dessen Wahl ruht: er lebt (`takt`), und nach `dichtNach` ruhigen Pässen legt sich ein Lauf mit Lücken
    // oder fremder Folge einmal dicht in Satz-Ordnung (ein Pass, der beim Drehen nur einen Frame stillsteht, verdichtet nicht).
    _chunkSatzRuht(s, a, key) {
        a.takt = s.takt;
        if (!a.dicht && ++a.ruhe >= AnazhRealm.CHUNK_SATZ_ABSCHNITT.dichtNach)
            this._chunkSatzDicht(s, a, a.liste, a.n, key, false);
        return a;
    }

    // Der Abschnitt wird der Zeichen-Bereich [start, start + ende) — seine Zellen und die entarteten Lücken zwischen ihnen;
    // ein Abschnitt ohne Zelle ruht diesen Pass (`ab` merkt den Satz für die Rückkehr am Anfang des nächsten Hakens, wie die
    // abgewählten Werfer) — sonst bleibt die Sicht, wie sie ist (Grund-Sicht, Werkzeug).
    _chunkSatzZeige(s, a, ab) {
        const n = a ? a.n : 0;
        s.geom.setDrawRange(a ? a.start : 0, n > 0 ? a.ende : 0);
        if (ab && n === 0 && s.mesh.visible) {
            s.mesh.visible = false;
            ab.push(s.mesh);
        }
    }

    // DER ABSCHNITT eines Passes: die Zellen in Satz-Ordnung, deren Hülle das Gesetz der Pass-Wahl in der Lage L trifft
    // (erst der Bereich, dann seine Zellen — jede Zelle liegt in der Hülle ihres Bereichs), in EINEM Lauf des Index
    // (`start`, Kapazität `kap`, Hochwasser `ende`); jede Zelle hat dort ihren PLATZ. Dieselben Zellen wie im letzten Pass
    // schreiben nichts. Ändert sich die Wahl, schreibt der Pass nur die Änderung (`_chunkSatzTausch`): eine Zelle, die geht,
    // hinterlässt eine entartete Lücke (drei gleiche Ecken zeichnen nichts), eine, die kommt, nimmt First-Fit eine Lücke
    // oder hängt an — Befund 06.10. (echte GPU, Mess-Wiese, Drehen 1°/Frame): der Pass schrieb ab dem ersten Unterschied
    // neu, 0,5–0,7 MB je Pass und Frame. Ein Satz, der seine Ordnung braucht (das durchscheinende Wasser, fern → nah),
    // schreibt dicht ab dem ersten Unterschied. Dicht in Satz-Ordnung (das Early-Z der Nah-fern-Folge, exakt) legt der Pass
    // neu, wenn die Wahl ruht, die Lücken `verschnitt` des Laufs übersteigen oder eine Zelle keinen Platz findet. Passt die
    // Zahl der Indizes nicht in die Kapazität, zieht der Abschnitt um: hinten an, wo Platz ist, sonst legt
    // `_chunkSatzUmlegen` alle Abschnitte dicht neu (`umlegen`: das Hauptbild, vor jedem Zeichnen des Frames). Kein Pass
    // nimmt einem anderen seinen Lauf (vorher verdrängten die Kaskaden einander: 32 Verdrängungen in 36 Frames, 2,2 MB je
    // Frame für k0 + k1); reicht der Index nicht, wächst er.
    _chunkSatzAbschnitt(s, key, L, umlegen) {
        const liste = [];
        let n = 0;
        // eine Höhlen-Zelle (Welle 7) zeichnet nur, wenn die Höhlen-Sicht dieses Passes sie erreicht hat
        const stempel = s.hoehle ? s.hoehle.stempel : 0;
        for (const b of s.ordnung) {
            if (!b.huelle || b.huelle.isEmpty() || !this._passTrifftBox(L, b.huelle, 0)) continue;
            for (const z of b.zellen)
                if (
                    (z.knoten === undefined || z.knoten.sicht === stempel) &&
                    !z.huelle.isEmpty() &&
                    this._passTrifftBox(L, z.huelle, 0)
                ) {
                    liste.push(z);
                    n += z.idx.length;
                }
        }
        let a = s.abschnitte.get(key);
        if (a) {
            a.takt = s.takt;
            // die Wahl ruht (dieselben Zellen in derselben Folge)
            if (this._satzListeGleich(a.liste, liste)) return this._chunkSatzRuht(s, a, key);
            a.ruhe = 0;
            if (n > a.hoch) a.hoch = n;
        } else {
            a = {
                key,
                start: 0,
                kap: 0,
                n: 0,
                ende: 0,
                liste: [],
                platz: new Map(),
                frei: [],
                dicht: true,
                ruhe: 0,
                hoch: n,
                takt: s.takt,
            };
            s.abschnitte.set(key, a);
        }
        if (n > a.kap) {
            const kap = this._chunkSatzKap(a.hoch);
            this._chunkSatzLeer(a);
            if (umlegen || s.iEnde + kap > s.iKap) this._chunkSatzUmlegen(s, a, kap, key);
            else {
                a.start = s.iEnde;
                a.kap = kap;
                s.iEnde += kap;
            }
            this._chunkSatzDicht(s, a, liste, n, key, false);
        } else if (s.spec.richtung < 0 || a.liste.length === 0) this._chunkSatzDicht(s, a, liste, n, key, true);
        else this._chunkSatzTausch(s, a, liste, n, key);
        return a;
    }

    _satzListeGleich(x, y) {
        if (x.length !== y.length) return false;
        for (let i = 0; i < x.length; i++) if (x[i] !== y[i]) return false;
        return true;
    }

    // Ein Abschnitt ohne Inhalt (vor einem Umzug, ohne Zelle).
    _chunkSatzLeer(a) {
        a.liste = [];
        a.n = 0;
        a.ende = 0;
        a.platz.clear();
        a.frei.length = 0;
        a.dicht = true;
    }

    // DICHT: die Zellen der Wahl in Satz-Ordnung hintereinander ab `start`; `abUnterschied` (der Lauf liegt schon dicht in
    // Satz-Ordnung) schreibt erst ab der ersten Zelle, die sich unterscheidet.
    _chunkSatzDicht(s, a, liste, n, wer, abUnterschied) {
        const index = s.geom.index.array;
        let p = 0;
        if (abUnterschied && a.dicht) {
            const alt = a.liste;
            while (p < alt.length && p < liste.length && alt[p] === liste[p]) p++;
        }
        a.platz.clear();
        a.frei.length = 0;
        const L = this._satzLauf || (this._satzLauf = [0, 0]);
        let o = 0,
            von = -1,
            bis = -1;
        for (let i = 0; i < liste.length; i++) {
            const z = liste[i];
            a.platz.set(z, o);
            // eine Zelle, die mit denselben Indizes am selben Platz liegt (ein Bereich, der neu eintrat), lädt nichts
            if (i >= p && AnazhRealm._satzSetze(index, a.start + o, z.idx, 0, L)) {
                if (von < 0) von = o + L[0];
                bis = o + L[1];
            }
            o += z.idx.length;
        }
        if (von >= 0) this._chunkSatzSchreib(s, wer, a.key, a.start + von, bis - von);
        a.ende = o;
        a.n = n;
        a.liste = liste;
        a.dicht = true;
    }

    // DER TAUSCH: nur die Änderung der Wahl — jede Zelle, die geht, wird eine entartete Lücke (ihr erster Index für jede
    // Ecke: ein Dreieck ohne Fläche zeichnet nichts) oder fällt am Hochwasser ab; jede, die kommt, nimmt First-Fit eine
    // Lücke (dieselbe Freiliste wie die Vertex-Bereiche) oder hängt an. Findet sie keinen Platz oder übersteigen die Lücken
    // `verschnitt` des Laufs, rafft der Pass (`_chunkSatzRaffen`). Die Plätze, die gehen, werden erst NACH dem Einzug entartet,
    // und nur, wo keine kommende Zelle sie belegt (Welle C — beim Drehen geht auf der einen Seite, was auf der anderen kommt:
    // vorher schrieb der Pass jeden frei gewordenen Platz zweimal, entartet und neu belegt).
    _chunkSatzTausch(s, a, liste, n, wer) {
        const index = s.geom.index.array;
        const L = this._satzLauf || (this._satzLauf = [0, 0]);
        const neu = new Set(liste);
        const offen = []; // die frei gewordenen Plätze: Anfang, Länge, der Index ihrer Entartung
        for (const [z, off] of a.platz)
            if (!neu.has(z)) {
                const len = z.idx.length;
                a.platz.delete(z);
                a.ende = this._satzFreiGib(a.frei, off, len, a.ende);
                offen.push(off, len, z.idx[0]);
            }
        const belegt = []; // die Plätze der kommenden Zellen: Anfang, Ende
        for (const z of liste)
            if (!a.platz.has(z)) {
                const len = z.idx.length;
                let off = this._satzFreiNimm(a.frei, len);
                if (off < 0) {
                    if (a.ende + len > a.kap) return this._chunkSatzDicht(s, a, liste, n, wer, false);
                    off = a.ende;
                    a.ende += len;
                }
                if (AnazhRealm._satzSetze(index, a.start + off, z.idx, 0, L))
                    this._chunkSatzSchreib(s, wer, a.key, a.start + off + L[0], L[1] - L[0]);
                a.platz.set(z, off);
                belegt.push([off, off + len]);
            }
        // die frei gewordenen Plätze unter dem Hochwasser, die keine kommende Zelle belegt: entartet
        belegt.sort((x, y) => x[0] - y[0]);
        for (let k = 0; k < offen.length; k += 3) {
            const o = offen[k],
                e = Math.min(offen[k] + offen[k + 1], a.ende),
                w = offen[k + 2];
            let lo = 0,
                hi = belegt.length;
            while (lo < hi) {
                const m = (lo + hi) >> 1;
                if (belegt[m][1] <= o) lo = m + 1;
                else hi = m;
            }
            let cur = o;
            for (let i = lo; i < belegt.length && belegt[i][0] < e && cur < e; i++) {
                if (belegt[i][0] > cur && AnazhRealm._satzSetze(index, a.start + cur, w, belegt[i][0] - cur, L))
                    this._chunkSatzSchreib(s, wer, a.key, a.start + cur + L[0], L[1] - L[0]);
                if (belegt[i][1] > cur) cur = belegt[i][1];
            }
            if (cur < e && AnazhRealm._satzSetze(index, a.start + cur, w, e - cur, L))
                this._chunkSatzSchreib(s, wer, a.key, a.start + cur + L[0], L[1] - L[0]);
        }
        a.n = n;
        a.liste = liste;
        a.dicht = false;
        if (a.ende - n > a.ende * AnazhRealm.CHUNK_SATZ_ABSCHNITT.verschnitt)
            this._chunkSatzRaffen(s, a, liste, n, wer);
    }

    // DAS RAFFEN (Welle C): übersteigen die Lücken eines getauschten Abschnitts `verschnitt` seines Laufs, rücken seine
    // HINTERSTEN Zellen in die vordersten Lücken, die sie fassen (First-Fit vor ihrem Platz), bis die Lücken unter die halbe
    // Schwelle fallen — geschrieben wird nur, was umzieht; eine Zelle am Hochwasser senkt es. Bis hier legte der Pass den
    // ganzen Abschnitt dicht neu (beim Drehen 360 × 1° an der Mess-Wiese: die Kaskaden je Neulegung 0,5–0,9 MB, gut ein
    // Drittel aller Index-Bytes). Fasst keine Lücke eine Zelle und bleibt der Verschnitt, legt der Pass dicht neu.
    _chunkSatzRaffen(s, a, liste, n, wer) {
        const V = AnazhRealm.CHUNK_SATZ_ABSCHNITT.verschnitt;
        const index = s.geom.index.array;
        const hinten = Array.from(a.platz).sort((x, y) => y[1] - x[1]);
        for (let k = 0; k < hinten.length && a.ende - n > a.ende * V * 0.5; k++) {
            const [z, off] = hinten[k];
            const len = z.idx.length;
            // die vorderste Lücke, die die Zelle ganz vor ihrem Platz fasst
            const frei = a.frei;
            let neu = -1;
            for (let i = 0; i < frei.length && frei[i][0] + len <= off; i++) {
                const f = frei[i];
                if (f[1] < len) continue;
                neu = f[0];
                if (f[1] === len) frei.splice(i, 1);
                else {
                    f[0] += len;
                    f[1] -= len;
                }
                break;
            }
            if (neu < 0) continue;
            const L = this._satzLauf || (this._satzLauf = [0, 0]);
            if (AnazhRealm._satzSetze(index, a.start + neu, z.idx, 0, L))
                this._chunkSatzSchreib(s, wer, a.key, a.start + neu + L[0], L[1] - L[0]);
            a.platz.set(z, neu);
            a.ende = this._satzFreiGib(a.frei, off, len, a.ende);
            if (off < a.ende && AnazhRealm._satzSetze(index, a.start + off, z.idx[0], len, L))
                this._chunkSatzSchreib(s, wer, a.key, a.start + off + L[0], L[1] - L[0]);
        }
        if (a.ende - n > a.ende * V) this._chunkSatzDicht(s, a, liste, n, wer, false);
    }

    // Die Kapazität eines Abschnitts: das Hochwasser seiner Länge (`hoch`, die größte Wahl seines Passes) mit Luft — er
    // wächst, ohne umzuziehen; ein Umzug zieht die anderen Abschnitte mit (Befund 06.10., echte GPU, Mess-Wiese, Drehen
    // 1°/Frame: mit der Kapazität aus der LETZTEN Länge zogen die Kaskaden beim Drehen je Frame im Mittel 0,18 MB fremd um).
    // Auf 3072 Indizes gerundet.
    _chunkSatzKap(n) {
        return n > 0 ? Math.ceil((n * AnazhRealm.CHUNK_SATZ_ABSCHNITT.luft) / 3072) * 3072 : 0;
    }

    // DAS UMLEGEN: alle Abschnitte dicht ab 0, das Hauptbild zuerst (ein Abschnitt, den seit `ruheTakte` Takten kein Pass
    // fragte, fällt), jeder mit frischer Luft; `neu` (der Abschnitt, der nicht passte) bekommt `kapNeu` und schreibt der
    // Aufrufer, jeder andere zieht MIT seinem Inhalt um; reicht der Index nicht, wächst er (×1,25 oder auf die Summe). Das
    // Hauptbild liegt immer bei 0 — ein Umlegen mitten im Frame (ein anderer Pass, `wer`) lässt seinen Lauf unberührt, den
    // der schon aufgezeichnete Befehl des Haupt-Passes liest; ein dichter Abschnitt, der an seiner Stelle bleibt, schreibt
    // nichts.
    _chunkSatzUmlegen(s, neu, kapNeu, wer) {
        const R = AnazhRealm.CHUNK_SATZ_ABSCHNITT.ruheTakte;
        for (const [k, a] of s.abschnitte) if (a !== neu && s.takt - a.takt > R) s.abschnitte.delete(k);
        const h = s.abschnitte.get("haupt");
        const hauptFest = !!h && h !== neu && wer !== "haupt";
        const folge = h ? [h] : [];
        for (const a of s.abschnitte.values()) if (a !== h) folge.push(a);
        let summe = 0;
        for (const a of folge) {
            if (a === neu) a.kap = kapNeu;
            else if (!(a === h && hauptFest)) a.kap = this._chunkSatzKap(a.hoch);
            summe += a.kap;
        }
        if (summe > s.iKap) this._chunkSatzGeometrie(s, s.vKap, Math.max(summe, Math.ceil(s.iKap * 1.25)));
        let pos = 0;
        for (const a of folge) {
            const vorher = a.start;
            a.start = pos;
            pos += a.kap;
            if (a === neu || (a === h && hauptFest)) continue;
            if (a.n === 0) this._chunkSatzLeer(a);
            else if (a.start !== vorher || !a.dicht) this._chunkSatzDicht(s, a, a.liste, a.n, wer, false);
        }
        s.iEnde = pos;
    }

    // Der EINE Index-Schreiber (Teil-Upload ab `ab`, `n` Indizes — der Lauf, den `_satzSetze` änderte); die Neuschreib-Linse bucht die Bytes auf
    // „Verursacher>Abschnitt" — `wer` ≠ `wen` heißt: ein Pass schrieb den Abschnitt eines anderen.
    _chunkSatzSchreib(s, wer, wen, ab, n) {
        const index = s.geom.index;
        index.addUpdateRange(ab, n);
        index.needsUpdate = true;
        const k = wer + ">" + wen;
        s.schreiben[k] = (s.schreiben[k] || 0) + 4 * n;
    }
    // DIE EINE WAHL DER STUFE (das Stufen-Gesetz, lod.K5 — jede Familie wählt hier: Bau, Tor, Baum, Streu, Wagen, Mensch, Tier):
    // wer eine Stufe trägt, hält sie bis (1 − h)·ab, wer davor steht, kommt ab (1 + h)·ab hinein; ohne Zustand (Spawn) die Grenze
    // selbst. `G` = die Grenzen des Gesetzes (`_wechselGesetz`: der Fehler der Stufe am Schirm, höchstens ihr Haushalt), je Grenze
    // ihre Hysterese `h` (sonst die der Art, G.h); `s` = die Größe des Eintrags (die Grenzen stehen bei Größe 1).
    static _stufeNachGrenzen(d, cur, G, s) {
        let st = G.erste;
        for (const g of G.grenzen) {
            const ab = g.ab * s;
            const h = g.h > 0 ? g.h : G.h;
            const schwelle = !Number.isFinite(cur) ? ab : cur >= g.stufe ? ab * (1 - h) : ab * (1 + h);
            if (d > schwelle) st = g.stufe;
        }
        return st;
    }
    // DIE GEMERKTE WAHL (Lehre 25: der Takt kostet, was ihn betrifft) — die EINE Wahl (`_stufeNachGrenzen`) mit dem Gedächtnis
    // `m` ihres Eintrags (`_wahlGedaechtnis`): sie rechnet nur neu, wenn die Grenzen eine neue Epoche tragen (ein anderes `G`:
    // der Schirm, das Buch, ein Täter), die Größe `s` oder die getragene Stufe `cur` eine andere ist, oder wenn Eintrag und Auge
    // zusammen weiter wanderten als ihr SPIELRAUM — der Abstand der letzten Wahl zur nächsten Schwelle, die die gewählte Stufe
    // liest: jeder Abstand darin wählt dieselbe Stufe (die Hysterese hält sie als Fixpunkt), der Weg zählt je Achse
    // (|Δx| + |Δy| + |Δz| ≥ seine Länge) — die Wahl hält nie, wo das Gesetz anders wählte. Steht das Auge und rührt sich kein
    // Eintrag, rechnet sie nichts. `wo` der Eintrag, `auge` das Auge (je x, z; `raum`: der Abstand im Raum, mit y).
    static _stufeGemerkt(m, cur, G, s, wo, auge, raum = false) {
        const x = wo.x,
            z = wo.z,
            ax = auge.x,
            az = auge.z,
            y = raum ? wo.y : 0,
            ay = raum ? auge.y : 0;
        if (
            m.G === G &&
            m.s === s &&
            m.st === cur &&
            Math.abs(x - m.x) +
                Math.abs(y - m.y) +
                Math.abs(z - m.z) +
                Math.abs(ax - m.ax) +
                Math.abs(ay - m.ay) +
                Math.abs(az - m.az) <
                m.spiel
        )
            return cur;
        const d = Math.sqrt((x - ax) * (x - ax) + (y - ay) * (y - ay) + (z - az) * (z - az));
        const st = AnazhRealm._stufeNachGrenzen(d, cur, G, s);
        let spiel = Infinity;
        for (const g of G.grenzen) {
            const ab = g.ab * s;
            const h = g.h > 0 ? g.h : G.h;
            spiel = Math.min(spiel, Math.abs(d - (st >= g.stufe ? ab * (1 - h) : ab * (1 + h))));
        }
        m.G = G;
        m.s = s;
        m.st = st;
        m.x = x;
        m.y = y;
        m.z = z;
        m.ax = ax;
        m.ay = ay;
        m.az = az;
        m.spiel = spiel;
        return st;
    }
    // Das Gedächtnis EINER gemerkten Wahl (`_stufeGemerkt`) — leer: die erste Frage wählt.
    static _wahlGedaechtnis() {
        return { G: null, s: 0, st: NaN, x: 0, y: 0, z: 0, ax: 0, ay: 0, az: 0, spiel: -1 };
    }
}
_stammZonen(AnazhRealm, [AnazhRealm_siedlung_bauten]);

// ===== ATLAS · Siedlung/bauten — Außen-Konstanten =====
// DER SATZ (Welle B, `_chunkSatz`) — die Start-Kapazität je Satz-Art (Vertices · Indizes): die Vertices gemessen am
// vollen Ring 4 am Spawn (81 Chunks + 16 Stitch-Bänder = 179 046 Vertices) plus Luft für Fragmentierung und Gebirge,
// damit eine typische Sitzung nie wächst; die Indizes tragen die Abschnitte der Pässe (Hauptbild · k0 · k1, gemessen
// 05.10. an der Mess-Wiese mittags 333 774 + 439 746 + 272 535 = 1 046 055 bei 737 088 im ganzen Ring, mit Luft 1 259 520)
// — 1,25 · 2^20 statt 2^20 (+1 MB). Wo die Pässe mehr tragen (die Gate-Welt mittags ~1,57 M, nach dem Wandern ~1,6 M, am
// Abend mit der Sonne im Rücken bis ~2,2 M), wächst der Index auf ihre Summe — kein Abschnitt verdrängt einen anderen.
// Ein Wachsen (Vertices ×1,5, Indizes ×1,25 oder auf die Summe) kostet eine frische Geometrie mit vollem Upload.
AnazhRealm.CHUNK_SATZ = Object.freeze({
    boden: Object.freeze({ v: 229376, i: 1310720 }),
    // Der Wasser-Satz (0910-1 B) beginnt bei seinem Inhalt an der Mess-Wiese: 9 849 Vertices und ein Index-Hochwasser von
    // 30 720 (werkbank, OMEN, Satz-Takt 579) — bis dahin begann er bei 2^16 / 2^18 und hielt so 3,0 MiB für ~0,4 MiB Inhalt, bis
    // ihn die Ruhe-Frist verdichtete (`_chunkSatzVerdichten`, 600 Takte; das Band nach der Ankunft misst davor). Ein Seen-Land
    // wächst ihn wie jeden Satz (×1,5): 8 Floats je Vertex, ein Wachsen lädt höchstens wenige MB neu.
    wasser: Object.freeze({ v: 1 << 14, i: 1 << 16 }),
    // Der Bau-Satz (Welle 6) beginnt klein: je Stoff ein Satz, das Dorf der Mess-Wiese trägt in seinem größten Stoff
    // ~40k Vertices — er wächst in wenigen Schritten, eine Formation bleibt darunter.
    bau: Object.freeze({ v: 1 << 13, i: 1 << 14 }),
    // Der Streu-Satz (W7) je Stoff der Nah-Streu: der größte Stoff (das wiegende Laub) trägt an der Mess-Wiese ~38k
    // Vertices im Ring, ein seltener (Totholz) eine Pflanze mit 101 — er beginnt klein und wächst.
    streu: Object.freeze({ v: 1 << 10, i: 1 << 11 }),
});
// DIE ABSCHNITTE des Satzes (`_chunkSatzAbschnitt`): je Pass ein Lauf im Index mit `luft` über seiner Länge (er wächst,
// ohne umzuziehen); einer, den `ruheTakte` Render-Takte kein Pass fragte, fällt beim Umlegen; das Hauptbild legt dicht
// neu, sobald der Verschnitt (verlassene Läufe hinter umgezogenen Abschnitten) `verschnitt` × Index-Kapazität übersteigt;
// ein Abschnitt verdichtet seine Lücken (`verschnitt` seines Laufs) und, nach `dichtNach` Pässen mit ruhender Wahl, seine
// Folge (dicht in Satz-Ordnung, exakt).
AnazhRealm.CHUNK_SATZ_ABSCHNITT = Object.freeze({ luft: 1.2, ruheTakte: 600, verschnitt: 0.25, dichtNach: 30 });
// DAS VERDICHTEN des Satzes (`_chunkSatzVerdichten`): nach der Ruhe-Frist schrumpft ein Satz, dessen Kapazität mehr als
// `schwelle` × Ziel trägt, auf das Ziel = Inhalt × `luft` (Vertices: die Bereiche; Indizes: das Hochwasser der lebenden
// Abschnitte), mindestens vMin/iMin. Die Schwelle 1,5 liegt auf dem Wachs-Schritt der Vertices: nach einem Schrumpfen wächst
// der Satz erst, wenn sein Inhalt um ein Viertel zunimmt, und schrumpft erst wieder, wenn er ein Drittel verliert. Wächst der
// Inhalt während der Frist um mehr als `stetig` (10 %), beginnt sie neu — ein Satz, der füllt, schrumpft nie.
AnazhRealm.CHUNK_SATZ_VERDICHTEN = Object.freeze({ luft: 1.25, schwelle: 1.5, stetig: 1.1, vMin: 1024, iMin: 3072 });

// DER ANKER DER REIHE IM BÜNDEL (1310-9): ab diesem Weg des Auges stellen die Bündel ihre Kinder neu nach Abstand (je
// Anker-Wechsel EINE Neuaufnahme jedes Bündels, nie je Frame).
AnazhRealm.BUENDEL_ANKER_M = 16;

// Varianten PRO SPEZIES im gefrorenen Welt-Pool: jede Variante ist eine eigene Geometrie → eigene
// InstancedMesh-Gruppe → eigene Draw-Calls (× Leaf-Gruppen × LODs). Die Vielfalt trägt die
// Pro-Instanz-Variation (scale/rotationY/HSV-Tint, `_scatterInstanceAdd`/`_archInstanceAdd`) — 3
// Basis-Formen genügen. Der (hash>>>24)%N-Pick bleibt bei N=3 gleichverteilt (hohe fnv-1a-Bits).
// Pool-Aufstellung lazy, kein Welt-Reset nötig.
AnazhRealm.VARIANTS_PER_SPECIES = 3;

// Kronen-Dichte-Gitter (Occlusion-Demotion): die Sichtlinie Kamera→ferner Baum marschiert durchs
// Gitter; übersteigt die kumulierte Dichte die Schwelle, fällt der Baum auf LOD2 (`grown_*_lod2`) —
// die Silhouette bleibt, Pop-in ist konstruktiv unmöglich. Bäume streamen → periodischer Neubau
// (`_rebuildOcclusionGrid`). Kein LOD-Regler: die Demotion hebt nur die gewählte Stufe an, ihre Schwelle ist fest (lod.K5 —
// bis w3v-lod sank sie mit `_foliageDensityScale` unter Last auf 60 %, die Stufe folgte der Bildrate).
AnazhRealm.OCCLUSION = Object.freeze({
    cellM: 3, // Kronen-Dichte-Gitter (3m-Zelle, wie phytogenesis _occG)
    occDist: 30, // erst JENSEITS dieser Distanz occlusion-marschieren (nahe Bäume bleiben voll-3D)
    startM: 7, // Marsch-Start (überspringt die eigene + direkte Nachbar-Krone)
    endMargin: 8, // Marsch-Ende = dr − 8 m (die Zielbaum-eigene Krone zählt NICHT mit)
    stepM: 3, // Schrittweite = Zellgröße
    thrHi: 3.6, // Demotions-Schwelle (Hysterese OBEN: klarer Baum → LOD2 erst hier)
    thrLo: 2.8, // Re-Promotions-Schwelle (Hysterese UNTEN: demotierter Baum bleibt es länger → kein Flattern)
    weightMin: 0.35, // Kronen-Gewicht-Klammer (phytogenesis clamp)
    weightMax: 1.6,
    nominalH: 14, // nominale Baum-Sichthöhe (m) für das skalen-basierte Kronen-Gewicht
    weightPerM: 0.045, // Kronen-Gewicht ∝ (scale·nominalH) (scale 1 → 0.63, scale 2 → 1.26)
    rebuildInterval: 20, // Gitter-Neubau alle N Frames (Bäume streamen → periodisch, nicht statisch wie die Vorlage)
});
// Die Streu-Region-Kantenlänge (= _bakeRegionConfig().sizeM, 256 m): Region-Bundles und Fern-Superregion der
// Streu. Der platzierte Bau keyt seit Welle B nicht mehr regional (global in der Mesh-Zone).
AnazhRealm.ARCH_REGION_M = 256;
// Fern-Superregion (4×4 Regionen à 256 m = 1024 m): Fern-Leaves (camera-facing Impostor-Quads) haben
// wenig per-Region-Cull-Nutzen, kosten aber je winziger Gruppe einen Draw-Call — eine Gruppe je Art
// deckt die Fern-Sicht und bleibt endlich (Rücken-Cull lebt; instanz-bewusste Bounding-Sphere, jeder
// Add invalidiert). Konsument an GENAU EINER Stelle: _archFernRegionKey (gate:scatter-lod, Block F).
AnazhRealm.SCATTER_FERN_SUPERREGION = 4;
// Render-Diät: EIN geteiltes Leaf-Material je TAG-SIGNATUR statt je Part-Farbe — die Farbe reist als
// Instanz-Farbe (leaf.tint → _archSlotColor → setColorAt), die Pipelines kollabieren je Signatur.
// Einziger Konsument: _archLeafMaterial; false = das alte Je-Farbe-Muster, nur als A/B-Hebel der Linse
// (gate:render-diaet).
AnazhRealm.ARCH_LEAF_MAT_SHARED = true;

// DER FUSS DER STADTMAUER (siedlung.K2, `_stlMauerBuild`): so tief (m) reicht Wand und Turm unter den tiefsten Boden-Punkt
// unter ihnen — die Kiste folgt dem Hang als Sehne, der Fuß deckt die Mulde dazwischen (das Labor steht auf seinem Boden-Gitter).
AnazhRealm.STADTMAUER_FUSS_M = 1.5;

// DER STEMPEL EINES EINTRAGS (`studioOv`): eine tiefe JSON-Kopie der Prägung, höchstens TAILLE_UNKNOWN_FIELD_MAX Zeichen, sonst
// keiner (nicht-serialisierbar oder zu groß: fail-closed). Leser: die Wurzel `spawnArchitecture` und der Vorrat des Dorfs
// (`_dorfVorbacken`: derselbe Stempel nennt denselben Körper der Foundry).
AnazhRealm._stempelVon = function (ov) {
    if (!ov || typeof ov !== "object" || Array.isArray(ov)) return undefined;
    try {
        const json = JSON.stringify(ov);
        return json && json.length > 2 && json.length <= AnazhRealm.TAILLE_UNKNOWN_FIELD_MAX
            ? JSON.parse(json)
            : undefined;
    } catch (_e) {
        return undefined;
    }
};
