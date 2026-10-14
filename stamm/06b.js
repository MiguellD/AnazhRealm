class AnazhRealm_Z06b {
    // ===== ATLAS §06b · KREATUREN — Block Kreatur =====
    // DAS TEMPERAMENT DER GATTUNG (Welle LF 08.10., D16/K-D12): wild · wehrhaft · sanft · scheu aus der Ernährung der
    // Gattung (Dial diet, wie das Tier gegossen ist) und der EINEN Masse des Leibs (`_leibMasse`, kg) — tetrapoda
    // temperamentDerGattung; gecacht je Gattung × Körpergröße. Konsumenten: der Mut der Art (_kreaturMut: Leine und
    // Wariness), die Beute (_kreaturIstBeute), der Kampf (damageCreature: Gegenwehr, Furcht-Dauer) und _creatureProfile.
    _creatureTemperament(creature) {
        if (!creature || !creature.userData) return "scheu";
        const ud = creature.userData;
        const bs = Number.isFinite(ud.bodySize) ? ud.bodySize : 1;
        const gattung = this._kreaturGattung(creature);
        const key = gattung + "|" + bs;
        if (ud._temperament && ud._temperamentKey === key) return ud._temperament;
        // Ein Fleischfresser mit Masse jagt, ein Pflanzenfresser flieht, wer Masse hat, wehrt sich. Die Tiere sind tag-gleich
        // (Lehre 8): vorher entschied die Resonanz der Substanz-Tags, Hirsch, Fuchs und Bär waren „wehrhaft", nur der
        // predator-Stempel machte den Wolf wild. Ohne Gattungs-Dials (kalter Kern) bricht es laut, ohne Gestalt die Masse.
        const d = this._ofenKreaturDials(gattung, ud.gussDials || null);
        if (!d || !d.dials) return AnazhRealm._kernPflichtBruch("tetrapoda:GATTUNGEN." + gattung);
        const t = AnazhRealm._steuerGesetz().temperamentDerGattung(
            d.dials,
            this._leibMasse(creature),
            AnazhRealm._verhaltenGesetz().temperament.gattung
        );
        ud._temperament = t;
        ud._temperamentKey = key;
        return t;
    }

    // DER MUT DER ART ∈ [0, 1] aus dem Temperament (Gattung × Größe): die Flucht-Neigung fleeMul seines Profils, gespannt
    // zwischen dem scheuesten und dem kühnsten Profil des Gesetzbuchs (scheu 1,7 → 0 · wehrhaft 0,5 → 1). EINE Quelle für
    // die Leine (_creatureMoveCharacter) und die Natur der Wariness (_creatureWarinessSpieler).
    _kreaturMut(creature) {
        const P = AnazhRealm._verhaltenGesetz().temperament.profile;
        let lo = Infinity,
            hi = -Infinity;
        for (const k in P) {
            const f = P[k] && P[k].fleeMul;
            if (!Number.isFinite(f)) continue;
            if (f < lo) lo = f;
            if (f > hi) hi = f;
        }
        const prof = P[this._creatureTemperament(creature)] || P.scheu;
        const f = Number.isFinite(prof.fleeMul) ? prof.fleeMul : hi;
        return hi > lo ? Math.max(0, Math.min(1, (hi - f) / (hi - lo))) : 0.5;
    }

    // === Kreatur-Stats wie Spieler ===
    // Kreatur ≡ Spieler ≡ Architektur = Compound(parts × Material × Form); die 8 Stats emergieren aus
    // derselben Pipeline (STAT_FROM_TAGS). Specs: +0.05 magieleitung je Top-Spec (Hand-Wissen leitet).
    computeCreatureStats(creature) {
        if (!creature) return { tags: {}, stats: {} };
        // Body-Tags via existing pipeline.
        const compoundTags = this.computeCreatureCompoundTags(creature);
        // Tag-Clamp [0, 1] für die Stat-Pipe (selbe Disziplin wie Player,
        // siehe Lehre Welle 6.D Polish — STAT_FROM_TAGS-Formeln brauchen
        // normalisierte Werte, sonst werden Speed/HP negativ).
        const finalTags = {};
        for (const key of AnazhRealm.MATERIAL_TAG_KEYS) {
            const raw = Number(compoundTags[key]) || 0;
            finalTags[key] = Math.max(0, Math.min(1, raw));
        }
        // Spec-Bonus auf magieleitung (Wissen leitet wie Strom — vision-
        // poetische Tag-Wahl). Pro Top-Spec +0.05; deckt die Hand-Wissen-
        // Schicht ab ohne neue Stat-Achse zu öffnen.
        if (typeof this._creatureTopSpecializations === "function") {
            const tops = this._creatureTopSpecializations(creature, 5);
            const specBonus = tops.reduce((sum, s) => sum + (s.level || 0) * 0.01, 0);
            finalTags.magieleitung = (finalTags.magieleitung || 0) + specBonus;
        }
        // Equipped-Stacking wie computePlayerStats: Werkzeug + Rüstung addieren ihre Compound-Tags ×
        // TOOL_STAT_WEIGHT/ARMOR_STAT_WEIGHT.
        const equipped = (creature.userData && creature.userData.equipped) || {};
        // Werkzeug-Beitrag — nur Bauplan-Werkzeuge (sourceBlueprint), nicht
        // Starter-Built-ins (die wirken über opChain-Präzision, nicht Stats —
        // gleiche Disziplin wie Player Etappe 3b).
        if (equipped.tool && this.state.tools && this.state.tools[equipped.tool]) {
            const tool = this.state.tools[equipped.tool];
            if (tool.sourceBlueprint && this.state.blueprints[tool.sourceBlueprint]) {
                // V18.311 (Gesetz #0) — der kanonische Equip-Fold, geteilt mit dem Spieler
                // (eine Quelle, kein zweiter driftender Pfad). Verhalten unverändert: die
                // Kreatur trug nie den Größen-Faktor, ihr Fold IST schon die einfachere Form.
                this._foldEquippedStatTags(
                    finalTags,
                    this.state.blueprints[tool.sourceBlueprint],
                    AnazhRealm.TOOL_STAT_WEIGHT,
                    "held"
                );
            }
        }
        // Rüstung-Beitrag (immer aus Bauplan mit role:"armor")
        if (equipped.armor && this.state.blueprints[equipped.armor]) {
            const bp = this.state.blueprints[equipped.armor];
            if (bp.role === "armor") {
                // V18.311 (Gesetz #0) — der kanonische Equip-Fold, geteilt mit dem Spieler.
                this._foldEquippedStatTags(finalTags, bp, AnazhRealm.ARMOR_STAT_WEIGHT, "armor");
            }
        }
        // Welle 6.H Phase 2F.3 / V18.312 — aktive Boosts (Konsum · Welt-Resonanz · Memory-Echo)
        // addieren ihre Tag-Deltas über die kanonische Quelle (geteilt mit dem Spieler, §1.3).
        this._applyBoostsToStatTags(finalTags, (creature.userData && creature.userData.boosts) || []);
        // V18.312 (Gesetz #0) — Tags → Stats + Invers-dichte-Floor über die kanonische Quelle
        // (DIESELBE wie der Spieler — §1.3 fraktal: eine Sprache, eine Berechnung, zwei Anwendungen).
        const stats = this._statsFromTags(finalTags);
        // das Leben der Substanz VOR der Größen-Symmetrie — die Kampf-Größe des Leibs trägt es (unten)
        const hpSubstanz = stats.hpMax;
        // Größen-Stat-Symmetrie (wie beim Spieler): größer = robuster (HP/Stamina/Mana), aber langsamer
        // (speed/attackSpeed/jumpPower). `_compoundSizeFactor` ∈ [0.7, 1.7], sqrt → mul ∈ [0.84, 1.30].
        const creatureSoulName = creature.userData && creature.userData.soul;
        const creatureSoul =
            creatureSoulName && AnazhRealm.CREATURE_SOULS && AnazhRealm.CREATURE_SOULS[creatureSoulName];
        if (creatureSoul && Array.isArray(creatureSoul.bodyParts)) {
            // bodySize speist dieselbe Symmetrie: Hüll-Volumen ∝ bodySize³, der Volumen-Exponent macht daraus
            // ~bodySize^0.5. Default 1 (ohne bodySize unverändert).
            const bodySize =
                creature.userData && Number.isFinite(creature.userData.bodySize) ? creature.userData.bodySize : 1;
            const creatureSize = this._compoundSizeFactor({ parts: creatureSoul.bodyParts }) * Math.pow(bodySize, 0.5);
            // V18.312 (Gesetz #0) — die Größen-Anwendung über die kanonische Quelle (geteilt mit dem Spieler);
            // HIER wird nur der kreatur-eigene Eingang berechnet (Substanz-Größe × bodySize^0.5).
            this._applySizeMultipliersToStats(stats, Math.sqrt(creatureSize));
        }
        // DIE KAMPF-GRÖSSE DES LEIBS (Welle LF 09.10., Posten 6 / K-D18): Biss, Haut und Leben folgen der EINEN Masse des Leibs
        // (_leibMasse — das Volumen der Gestalt × MASSSTAB.dichteKgM3: Gattung UND Größe, dieselbe Masse wie Stoß, Beute und
        // Temperament) gegen die Bezugs-Masse des tetrapoda-Gesetzbuchs (KAMPF.refKg, der Wolf der Größe 1): damage ×
        // (m/ref)^biss, defense × (m/ref)^haut, hpMax = Leben der Substanz × (m/ref)^leben. Vorher damage 19,75 und defense 11,9
        // für jede Gattung und Größe (die Tiere sind tag-gleich), hpMax nur 99,8–158,9 von Fuchs 0,62 bis Bär 2. Ein Leib ohne
        // Gestalt (kein Studio-Tier: kein _tierBaum mit Volumen) hat keine Masse — er behält die Werte seiner Substanz, dieselbe
        // Grenze wie ein ungemessenes Gerät.
        // das Leben, wie es vor dem Massen-Gesetz galt (Substanz × Größen-Symmetrie) — nur der Restore eines Stands, dessen
        // Wunde absolut reiste (vor dem Anteil), liest es (_restoreCreatureFromSnapshot)
        const hpOhneMasse = stats.hpMax;
        const tbK = creature.userData && creature.userData._tierBaum;
        if (tbK && tbK.leibV > 0) {
            const KG = AnazhRealm._kampfGroesseGesetz();
            const q = this._leibMasse(creature) / KG.refKg;
            stats.damage *= Math.pow(q, KG.biss);
            stats.defense *= Math.pow(q, KG.haut);
            stats.hpMax = hpSubstanz * Math.pow(q, KG.leben);
        }
        return { tags: finalTags, stats, hpOhneMasse };
    }

    // Stats sind live-computed (O(MATERIAL_TAG_KEYS) je Aufruf); userData.stats ist nur ein
    // UI-Display-Cache.
    _refreshCreatureStatsCache(creature) {
        if (!creature || !creature.userData) return;
        const computed = this.computeCreatureStats(creature);
        creature.userData.stats = computed.stats;
        creature.userData.statTags = computed.tags;
    }

    // DIE RÜSTUNG DÄMPFT, SIE SCHLUCKT NICHT (Welle L, Befund K-D5): dealt = roh² / (roh + defense) — ein Treffer so stark
    // wie die Rüstung bringt die Hälfte durch, ein dreimal stärkerer drei Viertel, ein schwacher einen Bruchteil, nie 0.
    // Die flache Wand max(1, roh − defense) fraß die leichten Klingen: der Dolch (roh 18,89 gegen defense 11,9) verlor
    // 63 %, jeder Treffer unter 12,9 roh blieb bei 1. EIN Gesetz für Wesen und Spieler (damageCreature, damagePlayer).
    _ruestungDaempft(roh, defense) {
        const r = Math.max(0, Number(roh) || 0);
        const d = Math.max(0, Number(defense) || 0);
        return r > 0 ? (r * r) / (r + d) : 0;
    }

    // Schaden (symmetrisch zum Spieler, DIESELBE computeCreatureStats-Pipeline für hpMax + defense): die Rüstung dämpft
    // (_ruestungDaempft); hp ≤ 0 → Kampf-Tod (Loot + removeCreature). Der Rückstoß nur, wenn der Angreifer Ort und Stoß
    // liefert (opts.fromPos + opts.stoss {p, m} — das EINE Impuls-Gesetz, AnazhRealm.STOSS; ein Feld knockback liest niemand).
    damageCreature(creature, amount, opts = {}) {
        if (!creature || !creature.userData || creature.userData.kind !== "creature") {
            return { ok: false, reason: "not_creature" };
        }
        // KAMPF-GEFÜHL — ein sterbendes (kippendes) Wesen ist inert: kein Doppel-Tod,
        // kein Loot-Doppelgriff, keine Gegenwehr aus dem Fallen heraus (die Wand im
        // EINEN Schadens-Chokepoint, Lehre 2 — kein Aufrufer muss es wissen).
        if (creature.userData.dying) return { ok: false, reason: "dying" };
        const stats =
            creature.userData.stats && Number.isFinite(creature.userData.stats.hpMax)
                ? creature.userData.stats
                : this.computeCreatureStats(creature).stats;
        if (typeof creature.userData.hp !== "number") creature.userData.hp = stats.hpMax; // lazy-init (Restore/alt)
        const dealt = this._ruestungDaempft(amount, stats.defense);
        creature.userData.hp -= dealt;
        if (creature.userData.hp <= 0) {
            this._creatureCombatDeath(creature, opts.source || "unknown");
            return { ok: true, dealt, killed: true };
        }
        // Die Antwort eines überlebenden Wesens emergiert aus seinem TEMPERAMENT (_creatureTemperament):
        // wehrhaft schlägt hart zurück · wild entflammt (chaos moduliert) · sanft weicht, schlägt NIE · scheu
        // flieht LANG. frieden/schöpfer bleiben über das damagePlayer-Modus-Gate unberührt. Furcht-Dauer
        // (fleeMul) + Profile aus dem tetrapoda-Gesetzbuch (VERHALTEN.temperament/furcht, _verhaltenGesetz).
        const VG = AnazhRealm._verhaltenGesetz();
        const temperament = this._creatureTemperament(creature);
        const tProf = VG.temperament.profile[temperament] || VG.temperament.profile.scheu;
        // die Kampf-Furcht läuft auf der Kreatur-Uhr (Welle LF, Q1: was den Körper bewegt, läuft im Takt — auf der Wand-Uhr
        // floh ein Tier je nach Bildrate verschieden lang)
        creature.userData.fearUntil = this.state.creatureAnimationTime + VG.furcht.fearSec * tProf.fleeMul;
        // V18.100 (G4-1) — der Treffer fühlt sich über DASSELBE Substrat wie
        // beim Spieler (ACTION_TO_EMOTION.damage → sorrow+chaos); die binäre
        // "sad"-Projektion fällt aus der Valenz, statt direkt gestempelt zu werden.
        this._feelCreatureAction(creature, "damage", 2.5);
        if (opts.fromPos && typeof this.getGameMode === "function" && this.getGameMode() === "pfad") {
            const chaos = (creature.userData.emotions && creature.userData.emotions.chaos) || 0;
            const strikeChance = Math.min(tProf.strikeCap, tProf.strike + chaos * tProf.strikeChaos);
            // DIE GEGENWEHR IST DER EINE BISS (Welle LF kampf, Posten 5): erreicht das Maul den Spieler (_kreaturBissSpalt ≤
            // _kreaturBissReich — die EINE Biss-Reichweite, die Reichweite des Ansprungs) und fällt der Wurf aus dem
            // Fauna-Strom (Γ5, nie Math.random), springt das Tier an (_kreaturBissAnsatz); gebissen wird im Schnappen, wenn
            // der Kopf den Leib berührt. Vorher biss es sofort aus jagd.strikeRange 2,4 m um die Mitten, ohne Geste.
            if (strikeChance > 0 && this.state.playerMesh) {
                const spalt = this._kreaturBissSpalt(creature, null);
                if (spalt !== null && spalt <= this._kreaturBissReich(creature) && this._faunaRng()() < strikeChance)
                    this._kreaturBissAnsatz(
                        creature,
                        null,
                        "gegenwehr",
                        Math.max(2, (stats.damage || 4) * tProf.counterMul)
                    );
            }
        }
        // DER RÜCKSTOSS (das EINE Impuls-Gesetz, AnazhRealm.STOSS — 0710-2, K-D9), nur wenn der Angreifer Ort und Stoß
        // liefert (LMB-Angriff, Pfeil; der DSL-Op gibt keinen) und NACH der Gegenwehr (Welle L, K-D16): der Schlag ist ein
        // Körper — die wirksame Masse m und sein Impuls p aus dem Treffer-Urteil des Schmiede-Kerns, verstärkt um die Wucht
        // der Arena (`gefuehl.wucht`) —, das Ziel ruht mit der Masse seines Leibs; was der Leib bekommt, trägt ihn im
        // festen Sim-Schritt (`_kreaturStossSchritt`), bis die Reibung es aufzehrt. Vorher ein Positions-Satz min(stossCap, kb·stossProKb)·stossSkala:
        // 2,16 m für jede Waffe und jedes Ziel, in EINEM Frame.
        if (opts.fromPos && opts.stoss && opts.stoss.p > 0 && opts.stoss.m > 0) {
            const G = AnazhRealm._arenaGesetz().gefuehl;
            const dx = creature.position.x - opts.fromPos.x;
            const dz = creature.position.z - opts.fromPos.z;
            const len = Math.hypot(dx, dz) || 1;
            const mT = this._leibMasse(creature);
            const mS = opts.stoss.m;
            const J = AnazhRealm._stossImpuls(mS, mT, (G.wucht * opts.stoss.p) / mS, AnazhRealm.STOSS.stossZahl.leib);
            this._kreaturStoss(creature, dx / len, dz / len, J / mT);
        }
        this._uiDirty("hof"); // W3 (V18.176) — der UI-Puls (war _renderCreatureListUI direkt)
        return { ok: true, dealt, killed: false };
    }

    // V17.53 — die Loot-Materialien einer Kreatur, aus ihren Soul-bodyParts mit
    // DERSELBEN Volumen-Formel wie harvestArchitecture (eine Sprache: Abbauen ≡
    // Erlegen, beide ernten die Substanz). Kleine Kreaturen tragen wenig.
    _creatureLootMaterials(creature) {
        const soulName = creature && creature.userData && creature.userData.soul;
        const soul = soulName && AnazhRealm.CREATURE_SOULS[soulName];
        const materials = {};
        if (soul && Array.isArray(soul.bodyParts)) {
            const k = AnazhRealm.HARVEST_VOLUME_TO_UNITS || 4;
            for (const part of soul.bodyParts) {
                if (!part || typeof part.material !== "string") continue;
                const sx = Math.abs((part.size && part.size.x) || 1);
                const sy = Math.abs((part.size && part.size.y) || 1);
                const sz = Math.abs((part.size && part.size.z) || 1);
                materials[part.material] = (materials[part.material] || 0) + Math.max(1, Math.round(sx * sy * sz * k));
            }
        }
        return materials;
    }

    // V17.53 — der Kampf-Tod: Loot (NUR wenn der Spieler der Töter war — kein Loot
    // bei einem DSL-/Welt-Tod), eine Welt-Erinnerung, dann removeCreature. Der
    // W5-Affekt (Triumph/Schuld ∝ lebendig×bond) wird in Phase D/F eingewebt.
    _creatureCombatDeath(creature, source) {
        const name = (creature.userData && creature.userData.name) || "Ein Wesen";
        const loot = this._creatureLootMaterials(creature);
        const lootParts = [];
        if (source === "player") {
            for (const [mat, n] of Object.entries(loot)) {
                if (this.addMaterialToInventory(mat, n)) lootParts.push(`${n}× ${mat}`);
            }
            // SCHULD: ein friedliches lebendig-Wesen zu töten schmerzt ∝ Vitalität × Bindung (lebendig-Tag im
            // Tötungs-Kontext → sorrow). Material-Wesen (lebendig≈0) lösen keine Schuld aus.
            const ctags = this.computeCreatureCompoundTags(creature) || {};
            const leb = Math.min(1, Math.max(0, ctags.lebendig || 0));
            const bond = Math.min(1, Math.max(0, (creature.userData && creature.userData.bond) || 0));
            const guiltMag = leb * (0.4 + 0.6 * bond);
            if (guiltMag > 0.02) this._feelAction("loss", { magnitude: guiltMag });
            // TRIUMPH: jagte das gefallene Wesen dich FRISCH (lastHuntAt im Fenster), wirkt sein Fall als
            // Erleichterung (joy+hope). Unabhängig von der Schuld — beides darf zugleich feuern.
            const lastHunt = creature.userData && creature.userData.lastHuntAt;
            if (
                Number.isFinite(lastHunt) &&
                this.state.creatureAnimationTime - lastHunt < AnazhRealm._verhaltenGesetz().jagd.triumphWindowSec
            ) {
                this._feelAction("triumph", { magnitude: 1 });
                this.journalAppend("relationship", `Du hast die Bedrohung bezwungen — ${name} jagt dich nie wieder.`);
            }
        }
        if (typeof this.journalAppend === "function") {
            const lootSummary = lootParts.length > 0 ? ` → ${lootParts.join(", ")}` : "";
            this.journalAppend("relationship", `${name} fiel im Kampf${lootSummary}.`, { source, loot });
        }
        this._kreaturFaellt(creature); // der Fall: kippen, liegen, sinken — kein Wesen mehr
    }

    // ═══ DER FALL — EIN TIER STIRBT WIE EIN TIER (Welle LF kampf, Posten 7 — K-D19) ═══
    // Der EINE Weg, auf dem ein Tier stirbt, gleich woran: im Kampf (_creatureCombatDeath, nach Loot, Schuld und Journal) und
    // am Alter (_creatureNaturalDeath, nach Trauer und Journal). Vorher nahm der Tod am Alter den Leib sofort (removeCreature):
    // „kehrt zur Erde zurück" und er war fort, mitten im Bild.
    _kreaturFaellt(creature) {
        const ud = creature.userData;
        // DER ÜBERGANG LEBEND → LEICHNAM (Welle LF kampf Nachbesserung 4): was das lebende Tier trug, endet HIER, in EINEM
        // Schritt — vorher endete es erst im Abschied 90 s später (removeCreature) oder nie (Tod-Zensus: die Aura des
        // Auftrags hing 90 s in der Luft, die Traglast blieb, ein Wolf, im Scheitel seines Sprungs getötet, lag 1,2 m über dem
        // Boden, der letzte Ruf kam aus dem liegenden Leib). Der letzte Ruf klingt im Fall — die Stimme des sterbenden Tiers;
        // der Leichnam ruft nie. Ein Tod im Sprung legt den Leib auf seinen Stand (die Wurzel ohne den Hüpfer; ein gleitender
        // Leib steht schon auf der Höhe seines Sim-Schritts), ein getragener Stoß endet (kein Sim-Schritt trägt einen
        // Gefallenen). Auftrag und Traglast enden: die Last fällt an den Schöpfer zurück (für ihn geerntet oder ihm entnommen —
        // eine freie Bau-Last war nie seine), die Zeichen über dem Leib gehen (_leibZeichenFrei). Seine Sicht wählt danach der
        // Takt der Gefallenen wie die jedes Leibs im Bild (_leibSicht): die Stufe nach dem Abstand, nah mit Schatten.
        this._tierRuf(creature, "trauer");
        if (ud._hopH > 0 && !ud._stossV) creature.position.y -= ud._hopH;
        ud._hopH = 0;
        ud._hopV = 0;
        ud._stossV = null;
        const last = ud.carrying;
        if (last && last.free !== true) {
            const zurueck = [];
            for (const [mat, n] of Object.entries(last.materials || {}))
                if (this.addMaterialToInventory(mat, n)) zurueck.push(`${n}× ${mat}`);
            if (zurueck.length)
                this.journalAppend(
                    "loss",
                    `${ud.name || "Ein Wesen"} fiel mit seiner Last — sie fällt an dich zurück: ${zurueck.join(", ")}.`,
                    {
                        materials: last.materials,
                    }
                );
        }
        ud.carrying = null;
        ud.task = null;
        // Der Körper kippt render-seitig auf seine FLANKE (~1 s, _tickLeichname treibt `dying`): die Kipp-Richtung steht
        // quer zur Leibes-Achse (vorn = (sin ry, cos ry)), auf die Seite, die hangab liegt (_fieldGradient: die waagrechte
        // Komponente der Außen-Normale gegen die Flanke), auf flachem Boden oder bei Gefälle längs der Achse zur rechten
        // Seite. Dann LIEGT er (gefuehl.leichnamSec, Kreatur-Uhr) und sinkt in der letzten Spanne (leichnamSinkSec) in die
        // Erde, DANN removeCreature. Ein sterbendes Wesen ist inert (damageCreature-Wand). Vorher kippte er in die
        // Hang-Richtung, wie sie fiel — längs der Achse stand der Hirsch auf dem Hinterteil, Kopf senkrecht (Bild ks09) —, und
        // nach 0,35 s Nachklang war er fort.
        const K = AnazhRealm._arenaGesetz().gefuehl; // Kipp-Dauer, Leichnam, Versinken = ARENA-Daten
        const g = this._fieldGradient(creature.position.x, creature.position.y + 0.5, creature.position.z, {});
        const ry = creature.rotation.y || 0;
        // die Flanke (rechts der Blickrichtung); hangab, wo das Gefälle quer zur Achse fällt
        let hx = Math.cos(ry);
        let hz = -Math.sin(ry);
        if (g.x * hx + g.z * hz < -0.05) {
            hx = -hx;
            hz = -hz;
        }
        // die Haltung des Falls steht fest: die Tod-Lage rechnet mit der Pose dieses Augenblicks, und kein Stufen-Wechsel
        // stellt den Leib danach in die Ruhe der Gestalt (`_gelenkStufe`; beide Stufen tragen dieselben Knochen)
        ud._gelenk.haltungFest = true;
        // wohin Platz ist: die Flanke hangab, steht dort eine Wand, die andere Flanke (_todKippWahl)
        const kipp = this._todKippWahl(creature, hx, hz);
        creature.userData.dying = {
            t: 0,
            dauer: K.kippDauerSec,
            nachklang: K.leichnamSec,
            sinken: K.leichnamSinkSec,
            dirX: kipp.hx,
            dirZ: kipp.hz,
            baseQuat: creature.quaternion.clone(),
            baseY: creature.position.y,
            hebe: kipp.hebe,
        };
        this._leibZeichenFrei(creature);
        // DER LEICHNAM IST KEIN WESEN (Welle LF kampf Nachbesserung 3): er verlässt die EINE Liste der Wesen im Moment des
        // Todes und liegt in state.leichname, wo der Kreatur-Takt seinen Fall treibt (_tickLeichname). Jeder Leser, der Wesen
        // zählt oder wählt — Kappe, Nexus, Hof, Fadenkreuz, Mehrspieler-Strom, Lebenszyklus, der Nächste, die Anzeige, das
        // LLM, der Snapshot —, liest state.creatures ohne Frage. Vorher lag er dort 90 s weiter: 14 Methoden fragten je selbst
        // nach `dying`, 5 Leser über eine Frage-Methode, die übrigen zählten ihn (die Kopie beim Mitspieler stand 90 s
        // aufrecht, der Lebenszyklus wählte ihn als Ältesten und ließ ihn ein zweites Mal sterben, findNearestCreature gab ihm
        // einen Auftrag).
        this._kreaturAusListe(creature);
        this.state.leichname.push(creature);
        this._uiDirty("hof");
        this._renderTaskStatusUI(); // sein Auftrag zählt nicht mehr
    }

    // DIE TOD-LAGE (Q4, K-D19): der Körper kippt um seine Wurzel auf die Kipp-Richtung h = (hx, hz) zu. Ein Punkt der Haut
    // mit Abstand d längs h, Höhe y über der Wurzel und e längs der Kipp-Achse liegt beim Winkel θ bei d·cosθ + y·sinθ längs
    // h, auf der Höhe y·cosθ − d·sinθ. Die Wurzel steigt je Winkel so weit, dass der kleinste Abstand Haut − Boden (der
    // gezeichnete Boden unter JEDEM Punkt, `_standSicht`) bleibt, was er im Stand war — die Flanke legt sich auf den Hang,
    // nie in ihn, nie darüber. Punkte: die Haut der gezeigten Stufe in der Todes-Pose (Skin angewandt), höchstens TOD_KIPP_PUNKTE; die
    // Tafel trägt TOD_KIPP_STUETZ + 1 Winkel bis TOD_KIPP_RAD, der Kipp-Takt liest sie linear. Vorher hob eine Welt-AABB-
    // Flanke (flanke·sinθ) den Körper: präzise gemessen lag er am Ende 10,4 cm über seinem Stand-Kontakt und schwebte im
    // Kippen bis 54,2 cm; ohne Hebung lag er 84 cm im Gelände (gate:koerper-stand K5). Einmal je Tod, nie je Frame.
    _todHebeTafel(creature, hx, hz) {
        const n = AnazhRealm.TOD_KIPP_STUETZ;
        const wMax = AnazhRealm.TOD_KIPP_RAD;
        const px = creature.position.x;
        const py = creature.position.y;
        const pz = creature.position.z;
        const ax = hz; // die Kipp-Achse (horizontal, ⊥ h)
        const az = -hx;
        const v = this._todV || (this._todV = new THREE.Vector3());
        creature.updateMatrixWorld(true);
        let gesamt = 0;
        const istHaut = (o) => o.isMesh && !o.isInstancedMesh && o.geometry && o.geometry.attributes.position;
        // die Haut der gezeigten Stufe (Gestalt oder Fern-Guss, das Fell nach seinem Schirm-Gesetz) — die WURZEL zählt immer:
        // fern verbirgt der Kreatur-Ziegel sie, das Feld trägt den Leib (_kzBesitztFeld), die Haut ist dieselbe. Vorher las
        // traverseVisible eine verborgene Wurzel als „keine Haut": ein Tier, das jenseits der Mesh-Zone starb (der
        // Lebenszyklus nimmt den Ältesten, wo er steht), lag ohne Tod-Lage — trat der Spieler heran, steckte die Flanke im Hang.
        // Gezeigt heißt: auf der Ebene der Haupt-Kamera (0) — nah wirft die Grobstufe als Zwilling auf SHADOW_TWIN_LAYER
        // und ist sichtbar, doch keine Haut im Bild (`_gelenkStufe`); sie zählte sonst ein zweites Mal mit.
        const haut = [];
        const sammle = (o) => {
            if (istHaut(o) && o.layers.isEnabled(0)) haut.push(o);
            for (const k of o.children) if (k.visible) sammle(k);
        };
        sammle(creature);
        for (const o of haut) gesamt += o.geometry.attributes.position.count;
        if (!gesamt) return null;
        const schritt = Math.max(1, Math.ceil(gesamt / AnazhRealm.TOD_KIPP_PUNKTE));
        const pD = [];
        const pY = [];
        const pE = [];
        for (const o of haut) {
            const pa = o.geometry.attributes.position;
            for (let i = 0; i < pa.count; i += schritt) {
                o.getVertexPosition(i, v);
                v.applyMatrix4(o.matrixWorld);
                const dx = v.x - px;
                const dz = v.z - pz;
                pD.push(dx * hx + dz * hz);
                pY.push(v.y - py);
                pE.push(dx * ax + dz * az);
            }
        }
        // DER BODEN UNTER JEDEM PUNKT (Leben-Schau 2, Gegenprüfung 10.10.): das Gesetz unter einem Punkt ist der Schritt-Boden
        // des Leibs von seiner Wurzel aus (`_koerperSchritt` vom Boden UNTER dem Leib, `_koerperBodenUnter`: über den Hang,
        // nie durch ein Dach — eine Wand ist null und trägt keinen Punkt), auf einem Raster von TOD_BODEN_ZELLE um die
        // Wurzel (je Zelle einmal je Tod, bilinear); gezeichnet ist die Karte, wo sie im Band um dieses Gesetz liegt
        // (`_standSicht`, Lehre 22). In der Höhle trägt die Karte das Dach, außerhalb des Bands: dort trägt das Gesetz. Bis
        // dahin las die Tod-Lage die Oberkante der Säule als Gesetz der Wurzel und je Punkt nur dieses eine: in der Höhle der
        // Schau (−876,0/−1229,5, der Grund fällt 45° längs der Kipp-Richtung) sank der tote Wolf 0,46 m in den Grund
        // (gate:fall-waechter O3).
        const g0 = this._koerperBodenUnter(px, py - (creature.userData._hopH || 0), pz);
        const Z = AnazhRealm.TOD_BODEN_ZELLE;
        const zellen = new Map();
        const zelle = (i, k) => {
            const key = (i + 512) * 1024 + (k + 512);
            let g = zellen.get(key);
            if (g === undefined) {
                const s = this._koerperSchritt(px, pz, g0, px + i * Z, pz + k * Z);
                g = s === null ? NaN : s;
                zellen.set(key, g);
            }
            return g;
        };
        const boden = (x, z) => {
            const fx = (x - px) / Z;
            const fz = (z - pz) / Z;
            const i = Math.floor(fx);
            const k = Math.floor(fz);
            const tx = fx - i;
            const tz = fz - k;
            // bilinear über die Ecken mit Boden (eine Wand-Ecke fällt aus dem Gewicht, nie der ganze Punkt)
            const g00 = zelle(i, k);
            const g10 = zelle(i + 1, k);
            const g01 = zelle(i, k + 1);
            const g11 = zelle(i + 1, k + 1);
            const w00 = Number.isFinite(g00) ? (1 - tx) * (1 - tz) : 0;
            const w10 = Number.isFinite(g10) ? tx * (1 - tz) : 0;
            const w01 = Number.isFinite(g01) ? (1 - tx) * tz : 0;
            const w11 = Number.isFinite(g11) ? tx * tz : 0;
            const sw = w00 + w10 + w01 + w11;
            if (!(sw > 0)) return NaN;
            const sg = (w00 && g00 * w00) + (w10 && g10 * w10) + (w01 && g01 * w01) + (w11 && g11 * w11);
            return this._standSicht(x, z, sg / sw, false);
        };
        // je Winkel: der kleinste Abstand Haut − Boden bei Wurzel-Hebung 0
        const spalt = (k) => {
            const t = (wMax * k) / n;
            const c = Math.cos(t);
            const s = Math.sin(t);
            let min = Infinity;
            for (let i = 0; i < pD.length; i++) {
                const l = pD[i] * c + pY[i] * s;
                const g = boden(px + hx * l + ax * pE[i], pz + hz * l + az * pE[i]);
                if (!Number.isFinite(g)) continue;
                const a = py + pY[i] * c - pD[i] * s - g;
                if (a < min) min = a;
            }
            return min;
        };
        const stand = spalt(0);
        if (!Number.isFinite(stand)) return null;
        // DAS SOLL DES KLEINSTEN ABSTANDS: was er im Stand war — stand der Leib schon im Boden (der Stand am Fuß einer Wand
        // steiler als 45°, stand < 0), geht das Soll im Kippen linear auf 0: der tote Leib legt sich AUF den Boden, nie
        // tiefer. Vorher hielt die Tafel den Stand-Fehler: ein Wolf, der 0,68 m im Hang stand, sank kippend 0,92 m in den Grund.
        const hebe = new Float32Array(n + 1);
        for (let k = 1; k <= n; k++) {
            const soll = stand < 0 ? stand * (1 - k / n) : stand;
            const sp = spalt(k);
            hebe[k] = Number.isFinite(sp) ? soll - sp : hebe[k - 1];
        }
        return hebe;
    }

    // DIE KIPP-RICHTUNG (Prüfung 2 K02a, Wolf am Wandfuß, Gier 225°): der Leib kippt auf die Flanke hangab (_kreaturFaellt)
    // — steigt dort der Boden unter der gekippten Haut so, dass die Tafel die Wurzel mehr als eine Stufe heben müsste, kippt
    // er in eine Wand (unter Fels gelesen am Punkt: die Wurzel stieg 2,8 m auf den Wand-Buckel; aus dem Raster ohne Wand sank
    // er 0,84 m hinein). Dann fällt er dorthin, wo Platz ist: zuerst auf die andere Flanke, erst wo keine Flanke Platz hat
    // längs der Achse (der Leib liegt auf einer Flanke — längs der Achse stand der Hirsch auf dem Hinterteil, Bild ks09);
    // hat keine Richtung Platz, die mit dem kleinsten Hub. Hebt die erste Flanke höchstens eine Stufe, bleibt alles, wie es war.
    _todKippWahl(creature, hx, hz) {
        const hub = (h) => (h ? Math.max(...h) : Infinity);
        const stufe = AnazhRealm.PLAYER_STEP_UP;
        let best = { hx, hz, hebe: this._todHebeTafel(creature, hx, hz) };
        if (!(hub(best.hebe) > stufe)) return best;
        for (const [x, z] of [
            [-hx, -hz],
            [hz, -hx],
            [-hz, hx],
        ]) {
            const hebe = this._todHebeTafel(creature, x, z);
            if (hub(hebe) < hub(best.hebe)) best = { hx: x, hz: z, hebe };
            if (!(hub(best.hebe) > stufe)) return best;
        }
        return best;
    }

    // === Helper: kontext-abhängiges Args-Mapping für creature_task(paramArg) ===
    // gather + string → {material}; follow_player + number → {distance: clamped}; sonst {}.
    // Unbekannte Materialien werden NICHT abgelehnt — der Tick findet nichts und fällt auf wander.
    _buildCreatureTaskArgs(taskName, paramArg) {
        const c = (v, lo, hi) => Math.max(lo, Math.min(hi, Number(v)));
        if (taskName === "gather" && typeof paramArg === "string" && paramArg.length > 0) {
            return { material: paramArg };
        }
        if (taskName === "build" && typeof paramArg === "string" && paramArg.length > 0) {
            return { blueprint: paramArg };
        }
        if (taskName === "follow_player" && Number.isFinite(paramArg)) {
            return { distance: c(paramArg, 0.5, 20) };
        }
        return {};
    }

    // describeProgram-Helper für Kreatur-Tasks. Liefert " (Distanz X)" /
    // " (Material X)" / " (Bauplan X)" / "" — abhängig von Task + Arg-Typ.
    _describeCreatureTaskArg(taskName, paramArg) {
        if (taskName === "gather" && typeof paramArg === "string" && paramArg.length > 0) {
            return ` (Material „${paramArg}")`;
        }
        if (taskName === "build" && typeof paramArg === "string" && paramArg.length > 0) {
            return ` (Bauplan „${paramArg}")`;
        }
        if (taskName === "follow_player" && Number.isFinite(paramArg)) {
            return ` (Distanz ${paramArg}m)`;
        }
        return "";
    }

    // === Kreatur-Erinnerung + Architektur-Lookup ===
    // memory[] je Kreatur: Cap 30 FIFO, Schema `{type, content, at}` wie worldJournal. Hebt ein Push den
    // Skill-Level (gather:material / build:blueprint), feuert _onCreatureLevelUp (Ping + Journal).
    _creatureRemember(creature, type, content) {
        if (!creature || !creature.userData) return;
        if (!Array.isArray(creature.userData.memory)) creature.userData.memory = [];
        const mem = creature.userData.memory;
        // Welle 6.H Phase 2D — Skill-Level VOR dem Push erfassen, damit der
        // Vergleich nach dem Push erkennt ob ein Aufstieg stattfand.
        const skillKey = this._creatureSkillKeyForMemory(type, content);
        const levelBefore = skillKey ? this._creatureSpecializationLevel(creature, skillKey.kind, skillKey.key) : 0;
        mem.push({ type: String(type), content, at: Date.now() });
        const cap = AnazhRealm.CREATURE_MEMORY_CAP;
        while (mem.length > cap) mem.shift();
        if (skillKey) {
            const levelAfter = this._creatureSpecializationLevel(creature, skillKey.kind, skillKey.key);
            if (levelAfter > levelBefore) {
                this._onCreatureLevelUp(creature, skillKey.kind, skillKey.key, levelAfter);
            }
        }
    }

    // === Spezialisierung aus Memory ===
    // Skill-Levels (gather:material, build:blueprint) emergieren LIVE aus memory, ohne Cache; nur Erfolge
    // zählen (no_material/no_blueprint/no_inventory_for_build nicht).
    // Speed-Bonus im Tick: × (1 + level × 0.15), Level 5 = +75 %.

    // Memory-Eintrag → Skill-Key (oder null wenn kein Spezialisierungs-Eintrag).
    // 'gathered' mit content.material → gather:material; 'built' mit
    // content.blueprint → build:blueprint. Failures bleiben null.
    _creatureSkillKeyForMemory(type, content) {
        if (type === "gathered" && content && typeof content.material === "string" && content.material.length > 0) {
            return { kind: "gather", key: content.material };
        }
        if (type === "built" && content && typeof content.blueprint === "string" && content.blueprint.length > 0) {
            return { kind: "build", key: content.blueprint };
        }
        return null;
    }

    // Live-Aggregation der Erfolge aus memory → {gather: {holz: 5}, build: {stein_block: 7}}.
    // O(memory.length ≤ 30) — billig genug pro Tick, darum bewusst ohne Cache (keine Invalidierungs-Bugs).
    _computeCreatureSpecializations(creature) {
        const result = { gather: {}, build: {} };
        if (!creature || !creature.userData || !Array.isArray(creature.userData.memory)) return result;
        for (const entry of creature.userData.memory) {
            const skill = this._creatureSkillKeyForMemory(entry.type, entry.content);
            if (!skill) continue;
            result[skill.kind][skill.key] = (result[skill.kind][skill.key] || 0) + 1;
        }
        return result;
    }

    // Skill-Level für (kind, key): floor(count / THRESHOLD), gedeckelt bei MAX.
    // Liefert 0 wenn keine Erfolge. Symmetrisch für gather + build.
    _creatureSpecializationLevel(creature, kind, key) {
        if (!creature || typeof kind !== "string" || typeof key !== "string") return 0;
        const specs = this._computeCreatureSpecializations(creature);
        const count = (specs[kind] && specs[kind][key]) || 0;
        const threshold = AnazhRealm.CREATURE_SPECIALIZATION_LEVEL_THRESHOLD;
        const max = AnazhRealm.CREATURE_SPECIALIZATION_MAX_LEVEL;
        return Math.min(max, Math.floor(count / threshold));
    }

    // Top-N Spezialisierungen sortiert nach Level (ties: nach Count). Für UI-
    // Pills in der Kreatur-Liste. Liefert Array `[{kind, key, level, count}]`,
    // leeres Array wenn keine Skills mit Level ≥1.
    _creatureTopSpecializations(creature, n = 2) {
        const specs = this._computeCreatureSpecializations(creature);
        const all = [];
        const threshold = AnazhRealm.CREATURE_SPECIALIZATION_LEVEL_THRESHOLD;
        const max = AnazhRealm.CREATURE_SPECIALIZATION_MAX_LEVEL;
        for (const kind of ["gather", "build"]) {
            for (const [key, count] of Object.entries(specs[kind] || {})) {
                const level = Math.min(max, Math.floor(count / threshold));
                if (level >= 1) all.push({ kind, key, level, count });
            }
        }
        all.sort((a, b) => b.level - a.level || b.count - a.count);
        return all.slice(0, Math.max(0, n));
    }

    // Speed-Multiplikator aus Spezialisierungen. Liefert 1.0 ohne Spezialisierung
    // (kein Bonus, kein Malus). Wird in _tickCreatureTaskDirection genutzt.
    _creatureTaskSpeedMultiplier(creature, taskName, args) {
        if (!creature || !args) return 1;
        const bonus = AnazhRealm.CREATURE_SPECIALIZATION_SPEED_BONUS_PER_LEVEL;
        if (taskName === "gather" && typeof args.material === "string") {
            const lvl = this._creatureSpecializationLevel(creature, "gather", args.material);
            return 1 + lvl * bonus;
        }
        if (taskName === "build" && typeof args.blueprint === "string") {
            const lvl = this._creatureSpecializationLevel(creature, "build", args.blueprint);
            return 1 + lvl * bonus;
        }
        return 1;
    }

    // Body-Speed-Modulator: stats.speed normiert auf die STAT_FROM_TAGS-Basis (7) — Sprite ≈1.21,
    // Wesen ≈1.0, Geist ≈1.1. Body × Spec multiplizieren sich im Tick.
    _creatureBodySpeedMultiplier(creature) {
        if (!creature || typeof this.computeCreatureStats !== "function") return 1;
        const stats = this.computeCreatureStats(creature).stats;
        // REALITÄTS-EICHUNG 17.07. — normalisiert gegen die LEBENDE Gesetz-Base
        // (fx.bewegung.speed.base; war hartkodiert 7 = der alte Arcade-Zwilling —
        // eine Eichung des Kerns hätte alle Kreaturen still verlangsamt).
        const base = AnazhRealm._bewegungsKoeff("speed").base;
        if (!Number.isFinite(stats.speed) || stats.speed <= 0 || !(base > 0)) return 1;
        return stats.speed / base;
    }

    // Level-Up-Antwort: das Tier ruft vor Freude (seine Stimme, klang:UMWELT.tier — Grundton aus seinem Körper, am
    // Ort, über der Hörschwelle) + Welt-Journal-Eintrag (growth) + List-UI-Refresh + optional Chat-Hinweis. Vision
    // §1.2 multisensorisch + §1.1 Welt erinnert.
    _onCreatureLevelUp(creature, kind, key, newLevel) {
        this._tierRuf(creature, "freude");
        // Journal
        if (typeof this.journalAppend === "function") {
            const labels = {
                gather: `Sammler von „${key}"`,
                build: `Bauer von „${key}"`,
            };
            const role = labels[kind] || `Spezialist von „${key}"`;
            const name = (creature.userData && creature.userData.name) || "Eine Kreatur";
            this.journalAppend("growth", `${name} erreicht Stufe ${newLevel} als ${role}.`, {
                kind,
                key,
                level: newLevel,
                creature: name,
            });
        }
        // List-UI-Refresh damit die neue Pill sofort sichtbar wird.
        this._uiDirty("hof"); // W3 (V18.176) — der UI-Puls (war _renderCreatureListUI direkt)
        // Welle 6.H Phase 2E V2 — proaktive Sprache bei Level-Up.
        // Event-Typ je nach Skill-Art: gather/build. Throttle in
        // _creatureSpeakProactive verhindert Flood bei Mehr-Level-Bursts.
        if (typeof this._creatureSpeakProactive === "function") {
            const eventType = kind === "gather" ? "level_up_gather" : "level_up_build";
            const ctx = kind === "gather" ? { material: key, level: newLevel } : { blueprint: key, level: newLevel };
            this._creatureSpeakProactive(creature, eventType, ctx);
        }
        // Seltene Events (L5 erreicht ODER neue Top-3-Spec) rufen das LLM mit Persona + Event-Kontext; die
        // Antwort darf say und program tragen. Globaler Throttle CREATURE_LLM_RARE_EVENT_GAP gegen Bursts.
        if (typeof this._maybeTriggerCreatureRareEventLlm === "function") {
            this._maybeTriggerCreatureRareEventLlm(creature, kind, key, newLevel);
        }
    }

    // LLM-Trigger: Level 5 ODER neue Top-3-Spec (heuristisch: (kind, key) war vorher nicht Top-3);
    // globaler 10-min-Throttle, damit Massen-Level-Ups keine Call-Salve auslösen.
    _maybeTriggerCreatureRareEventLlm(creature, kind, key, newLevel) {
        if (!this.state.llm || !this.state.llm.enabled) return false;
        const now = performance.now() / 1000;
        const lastCall = this.state.lastCreatureLlmRareEvent || -Infinity;
        if (now - lastCall < AnazhRealm.CREATURE_LLM_RARE_EVENT_GAP) return false;
        // Diskriminator: rare = L5 ODER neue Top-Spec
        const isMaxLevel = newLevel >= AnazhRealm.CREATURE_SPECIALIZATION_MAX_LEVEL;
        let isNewTopSpec = false;
        if (typeof this._creatureTopSpecializations === "function") {
            const top = this._creatureTopSpecializations(creature, 3);
            // Heuristik „neu in Top“: newLevel === 1 UND (kind, key) steht jetzt in den Top-Specs
            // (_creatureRemember liefert newLevel schon als vor/nach-Vergleich).
            isNewTopSpec = newLevel === 1 && top.some((s) => s.kind === kind && s.key === key);
        }
        if (!isMaxLevel && !isNewTopSpec) return false;
        // Throttle-Stempel JETZT setzen (vor await), damit parallele
        // Level-Ups nicht alle gleichzeitig durchrutschen.
        this.state.lastCreatureLlmRareEvent = now;
        // LLM mit Persona + Event-Hint asynchron rufen. Antwort wird wie
        // reaktiver Pfad behandelt: say in Chat (Soul-Span), program durch
        // _handleCreatureProposedProgram.
        const eventHint = isMaxLevel
            ? `Du hast gerade die HÖCHSTE Stufe (5) als ${kind === "gather" ? "Sammler" : "Bauer"} von „${key}" erreicht. Drücke aus, was dieser Meisterschafts-Moment in dir auslöst — und biete ggf. eine Welt-Aktion an, die zu deiner Freude passt.`
            : `Du hast eine NEUE Stärke entwickelt: ${kind === "gather" ? "Sammler" : "Bauer"} von „${key}" (Stufe ${newLevel}). Drücke diesen Wachstums-Moment aus — und biete ggf. eine Welt-Aktion an, die diesen neuen Pfad feiert.`;
        const personaPrompt = this._buildCreaturePersonaPrompt(creature);
        if (!personaPrompt) return false;
        const fullPrompt = personaPrompt + "\n\n" + eventHint;
        const name = creature.userData.name || "Wesen";
        // Async-Call ohne await — V3 lebt mit Eventual-Render
        this.llmCall("(Selbst-Reflexion: bedeutsamer Moment.)", fullPrompt)
            .then((reply) => {
                if (!reply || reply.error) return;
                if (reply.say) {
                    const sayText = String(reply.say).slice(0, 400);
                    const soulName = creature.userData.soul || "wesen";
                    const chatOutput = typeof document !== "undefined" ? document.getElementById("chat-output") : null;
                    if (chatOutput) {
                        const line = document.createElement("div");
                        line.className = "chat-rare-event-line";
                        const nameSpan = document.createElement("span");
                        nameSpan.className = `chat-creature-name soul-${soulName}`;
                        nameSpan.textContent = `${name}: `;
                        line.appendChild(nameSpan);
                        line.appendChild(document.createTextNode(sayText));
                        chatOutput.appendChild(line);
                        chatOutput.scrollTop = chatOutput.scrollHeight;
                    }
                    if (typeof this._creatureRemember === "function") {
                        this._creatureRemember(creature, "spoken_rare_event", {
                            said: sayText.slice(0, 120),
                            level: newLevel,
                            kind,
                            key,
                        });
                    }
                }
                if (Array.isArray(reply.program) && reply.program.length > 0) {
                    this._handleCreatureProposedProgram(creature, name, reply.program);
                }
            })
            .catch(() => {
                /* silent — rare-event-llm ist nice-to-have */
            });
        return true;
    }

    // Nächste Architektur, deren Bauplan einen Part aus diesem Material trägt. Nur sichtbare (mesh !==
    // null) zählen — Distance-Culling ist die natürliche Reichweite (wie _pickArchitectureAtCrosshair).
    _findNearestArchitectureWithMaterial(fromPos, materialName) {
        const riddenId = this.state.player ? this.state.player.mountedArch : null;
        if (!fromPos || typeof materialName !== "string" || materialName.length === 0) return null;
        if (!Array.isArray(this.state.architectures)) return null;
        let best = null;
        let bestDist = Infinity;
        for (const a of this.state.architectures) {
            // V12.0-perf.c.2 — gerendert = klassischer Mesh ODER instanced
            // (Bäume sind jetzt instanced; ohne diesen Fix fände die Kreatur
            // kein „holz" mehr).
            if (!a || !this._archIsRendered(a)) continue;
            // V18.150 — das GERITTENE Gefährt ist kein Sammler-Ziel.
            if (riddenId !== null && riddenId !== undefined && a.id === riddenId) continue;
            const bp = this.state.blueprints && this.state.blueprints[a.type];
            if (!bp || !Array.isArray(bp.parts)) continue;
            const hasMaterial = bp.parts.some((p) => p && p.material === materialName);
            if (!hasMaterial) continue;
            const dx = a.position.x - fromPos.x;
            const dz = a.position.z - fromPos.z;
            const d = Math.hypot(dx, dz);
            if (d < bestDist) {
                bestDist = d;
                best = a;
            }
        }
        return best;
    }

    // === Kreaturen-Aufträge ===
    // Mutation NUR über `assignCreatureTask` — wer userData.task direkt setzt, muss
    // `_refreshCreatureTaskAura` selbst rufen. Kreatur-Befehle stehen in NON_BROADCASTABLE_OPS:
    // „die nächste Kreatur“ meinte beim Empfänger eine andere.

    // ### Welt-Lebendigkeit ###
    // Tag-Nacht-Stops: timeOfDay 0..1 → {sky, light, intensity}; 0 Mitternacht, 0.25 Aufgang, 0.5 Mittag,
    // 0.75 Untergang. Dicht an den Übergängen + smoothstep in _interpolateDayNight — sonst springt die
    // Farbe (violett→orange in 10 % Zeit). Der Sky-Tint wird mit dem Wetter-Tint kombiniert.
    static get DAY_NIGHT_STOPS() {
        // Der MITTAGS-Stop (t=0.5) folgt LIVE dem Studio-Himmel (`_studioSky.top`/`.sun` via
        // get-world-params); der restliche Tag/Nacht-Zyklus bleibt AnazhRealms. Fallback = Vorlagen-Werte.
        const sk = AnazhRealm._studioSky;
        const noonSky = (sk && typeof sk.top === "number" && sk.top) || 0x6a9ed0;
        return Object.freeze([
            Object.freeze({ t: 0.0, sky: 0x161830, light: 0x6a7aa8, intensity: 0.28 }),
            Object.freeze({ t: 0.15, sky: 0x1e1e3a, light: 0x7888b8, intensity: 0.35 }),
            Object.freeze({ t: 0.22, sky: 0x3a2c54, light: 0x9080c8, intensity: 0.48 }),
            Object.freeze({ t: 0.27, sky: 0x6a4258, light: 0xc090b8, intensity: 0.65 }),
            Object.freeze({ t: 0.32, sky: 0xa05a52, light: 0xe8b298, intensity: 0.78 }),
            Object.freeze({ t: 0.38, sky: 0xc88060, light: 0xffd0a8, intensity: 0.9 }),
            // Stop 0.44 = sanfter Vormittag zwischen warmem Aufgang und blauem Mittag (sonst R-Sprung).
            // Im Tag-Fenster (0.44–0.62) ist lightColor WEISS: die Rayleigh-Physik (`_atmosphere`) wärmt schon —
            // eine warme LUT darüber wärmte doppelt. Dämmerung/Nacht (≤0.38 / ≥0.68) sind eigene Dramaturgie;
            // uSunCol färbt nur den Himmel-Shader, nie das Richtlicht.
            Object.freeze({ t: 0.44, sky: 0x8e9bb8, light: 0xffffff, intensity: 0.95 }),
            // Vorlage phytogenesis Z.1248: Mittags-Himmel = weiches Dunst-Blau (uTop 0x6a9ed0,
            // NICHT das gesättigte 0x4b75c2) — der Himmel-Anker folgt LIVE dem Studio.
            Object.freeze({ t: 0.5, sky: noonSky, light: 0xffffff, intensity: 1.0 }),
            // Symmetrisch: Zwischenstop nach Mittag, vor Sonnenuntergang
            Object.freeze({ t: 0.56, sky: 0x7ba0c8, light: 0xffffff, intensity: 0.97 }),
            Object.freeze({ t: 0.62, sky: 0x9078b0, light: 0xffffff, intensity: 0.92 }),
            Object.freeze({ t: 0.68, sky: 0xc04a7a, light: 0xffba88, intensity: 0.8 }),
            Object.freeze({ t: 0.74, sky: 0x804060, light: 0xb888a8, intensity: 0.62 }),
            Object.freeze({ t: 0.82, sky: 0x3a2c54, light: 0x8888b8, intensity: 0.42 }),
            Object.freeze({ t: 0.9, sky: 0x1e1e3a, light: 0x7080a8, intensity: 0.32 }),
            Object.freeze({ t: 1.0, sky: 0x161830, light: 0x6a7aa8, intensity: 0.28 }),
        ]);
    }
    // Welle 6.G3 — Wetter-Tint, zusammen mit Tag-Nacht-Tint kombiniert
    // (Multiply-Blend). Sunny lässt den Tagestint durch, rainy dämpft ihn.
    static get WEATHER_TINTS() {
        return Object.freeze({
            sunny: Object.freeze({ skyMul: 1.0, lightMul: 1.0 }),
            rainy: Object.freeze({ skyMul: 0.55, lightMul: 0.7 }),
            stormy: Object.freeze({ skyMul: 0.42, lightMul: 0.55 }),
        });
    }
    // Wetter = INTENSITÄTS-ACHSE, kein Binär-Paar: jeder wetter-abhängige Skalar lerpt über sie
    // (`_weatherBlendedValue`); ein neues Wort = EIN Tabellen-Eintrag, alle Leser erben es. stormy
    // extrapoliert über rainy — [0,1]-Shader clampen lokal. Nässe-Frage nur über `_weatherIsWet`.
    static get WEATHER_INTENSITY() {
        return Object.freeze({ sunny: 0, rainy: 1, stormy: 1.35 });
    }
    // Wetter als 5-Kanal-Feld {fog,sun,grey,wind,rain} je Wort; der EINE LOOK-Leser `_weatherFieldFor(w)`
    // interpoliert transition-aware (wie `_weatherBlendedValue`). grey entsättigt NUR das Licht, nie den
    // Himmel; wind = Böen-Amplitude; fog multipliziert fogMult; rain/sun Reserve.
    // `_weatherBlendedValue` bleibt für die Nicht-LOOK-Skalare.
    static get WEATHER_FIELD() {
        return Object.freeze({
            sunny: Object.freeze({ fog: 0.15, sun: 1.0, grey: 0.0, wind: 0.06, rain: 0.0 }),
            rainy: Object.freeze({ fog: 0.4, sun: 0.55, grey: 0.6, wind: 0.35, rain: 0.6 }),
            stormy: Object.freeze({ fog: 0.7, sun: 0.42, grey: 0.85, wind: 1.0, rain: 1.0 }),
        });
    }
    // V6 — grey→Licht-Entsättigung: der grey-Kanal zieht das RICHTLICHT so weit
    // Richtung neutral-grau (Luminanz-erhaltend). ~0.7 → stormy dämpft die
    // Licht-Sättigung deutlich, ohne die Farbe ganz zu töten. Der HIMMEL bleibt.
    static get WEATHER_GREY_K() {
        return 0.7;
    }
    // V6 — Wind-Amplitude: uWindStrength = field.wind · AMP. stormy (wind 1.0)
    // → 0.55 (kräftige Böe), sunny (wind 0.06) → 0.033 (ruhig). Browser-tunbar.
    static get WEATHER_WIND_AMP() {
        return 0.55;
    }
    // DIE WANDERNDE BÖE — EINE Quelle für Auge und Ohr: gust = sin(omega·t − k·dot(xz, windDir))·amp + mitte
    // (λ = 2π/k ≈ 164 m, Periode 2π/omega ≈ 15,7 s). `_windSwayOffset` (Gras/Streu/Laub im Shader) und `_windBoeAt`
    // (der Wind am Ohr, klang:UMWELT) lesen dieselben Zahlen.
    static get WIND_BOE() {
        return globalThis.__phytoCore.WIND_GESETZ.boe; // die Zahlen leben im Wind-Gesetz des Kerns (K19) — das Labor liest sie dort
    }
    static get WEATHER_TRANSITION_DURATION_MS() {
        return 45000; // 45 s — sanft, nicht zu lang
    }
    static get DAY_LENGTH_MIN_MINUTES() {
        return 1; // Slider-Minimum
    }
    static get DAY_LENGTH_MAX_MINUTES() {
        return 60; // Slider-Maximum
    }
    // DER TAG TRÄGT EINE SZENE (Leben-Schau 2, 09.10.): eine frische Welt beginnt am Mittag (0,5), die Sonne geht bei 0,75
    // unter — von der Ankunft bis zum Sonnenuntergang vergeht ein Viertel des Tags. Die Szenen der Schau dauerten 9–12,3 min
    // (aus den Zeitstempeln der Bilder: A-5 Dorf und Haus 11 min, A-7 Bauen 9 min, C-9 Rudel 12,3 min); eine Szene ist 15 min.
    // Mit dem alten Tag von 8 min war es nach 2 min Abend und nach 3–6 min Nacht (3 von 3 Spuren, jede stellte selbst auf 60).
    static get TAG_SZENE_MINUTEN() {
        return 15;
    }
    static get DAY_LENGTH_DEFAULT_MINUTES() {
        return AnazhRealm.TAG_SZENE_MINUTEN * 4; // 60 min: Mittag bis Sonnenuntergang = eine Szene
    }
    // DER TAKT DES WETTER-ZUGS: das Wetter steht so lange, bevor der Zug das nächste Wort zieht (mit dem 45-s-Übergang steht
    // es ~75 s). Leser: der Zug (`_loopWeatherAndGrowth`) — und damit jeder Wunsch der Welt, den nur der Zug erfüllt.
    static get WETTER_ZUG_SEK() {
        return 120;
    }
    // Fauna-Lifecycle: TARGET = untere Schwelle für Geburten, MAX = obere für sanften Tod; Check alle
    // 10 s, unabhängig von DAY_LENGTH.
    static get FAUNA_TICK_INTERVAL_MS() {
        return 10000; // 10 s — fauna lebt langsam
    }
    static get FAUNA_TARGET_POPULATION() {
        return 8; // wenn weniger → langsame Geburten
    }
    static get FAUNA_MAX_POPULATION() {
        return 20; // wenn mehr → langsame Todesfälle
    }
    static get FAUNA_BIRTH_PROBABILITY() {
        return 0.18; // pro 10s-Check (~1.08/min Max-Rate)
    }
    static get FAUNA_DEATH_PROBABILITY() {
        return 0.12; // pro 10s-Check
    }
    static get FAUNA_BIRTH_COOLDOWN_MS() {
        return 25000; // mind. 25 s zwischen Geburten
    }
    static get FAUNA_DEATH_COOLDOWN_MS() {
        return 35000; // mind. 35 s zwischen Toden — Welt soll nicht massensterben
    }
    // D3 (gigant-plan §5 — G4-3): die natürliche Lebens-Spanne eines Wesens.
    // Jenseits davon kehrt es zur Erde zurück (der Tod nährt das lebendig-Feld)
    // — natürlicher Umschlag statt ewiger Wesen. ~35 min Echtzeit.
    static get FAUNA_MAX_AGE_MS() {
        return 35 * 60 * 1000;
    }
    // δ WIRD WÄHRUNG — das WIRK-BUDGET des Nexus: eine Tat kostet ∝ Substanz (computeBuildCost), das
    // Budget regeneriert aus bewährter Schöpfung (Outcome-Fitness > 0.5) + Idle-Tropf → Spam verarmt
    // sich selbst (kein Rate-Limit). Materie kostet in pfad+frieden, frei nur in schöpfer.
    // start/max/regen sind vorläufige Größen.
    static get NEXUS_WIRK() {
        return Object.freeze({
            start: 60,
            max: 150,
            regenPerValue: 30, // pro finalisiertem Outcome: (fitness−0.5)·30
            idleRegenPer5s: 2, // der Tropf (in _loopSelfAnalysis, 5-s-Takt)
            ruleRegisterCost: 6,
            costCap: 80,
        });
    }

    // Hydrosphären-Atlas: das Drainage-Netz rechnet über eine feste Region um den Ursprung (Flow-
    // Accumulation braucht eine endliche Wasserscheide); cell 16 m → 128² Zellen im Perf-Budget.
    static get HYDROSPHERE() {
        return Object.freeze({
            regionSize: globalThis.__gelaendeCore.GRUND.kachel, // Region-Kantenlänge in m (um den Welt-Ursprung; der Grund des Kerns)
            cell: 16, // Zell-Größe in m → dim = regionSize / cell = 128
            fillEpsilon: 0.01, // Priority-Flood-ε: definiertes Gefälle je Zelle
            minLakeCells: 6, // ein See ist ≥ 6 Zellen — kleinere Füll-Senken
            // sind Mikro-Pits (Drainage gefüllt, aber kein gelisteter See)
            // DIE BREITE (K16) ist das Gesetz des Kerns (gelaende-core `flussBreite`, `FLUSS_BREITE`): der Mäander misst seine
            // Wellenlänge daran, jeder Fluss-Punkt trägt sie (`width`).
            // Gegen die ECHTE Voxel-Surface getunt (steilstes Fluss-Segment ~0.5): Wasserfall = Lauf steiler
            // als 0.4 UND in Summe ≥ 6 m Absturz (`_hydroExtractWaterfalls` verschmilzt Kaskaden per run-merge).
            waterfallSlope: 0.4, // Δy/Δhoriz, ab dem ein Fluss-Segment steil zählt
            waterfallMinDrop: 6, // Mindest-Gesamtdrop in m für einen Wasserfall
            maxRiverPoints: 800, // Sicherheits-Cap je Fluss-Polylinie
            // V9.43-d — der Carve: `_terrainDensityAt` senkt die Dichte im
            // Fluss-Kanal + in See-Senken, der Chunk-Mesher produziert echte
            // Rinnen + gemuldete Becken. Bett-Tiefe ∝ Fluss-Breite.
            carveBedMin: 1.4, // m — Mindest-Tiefe eines Fluss-Betts
            carveBedK: 0.16, // m je m Fluss-Breite — breitere Flüsse schneiden tiefer
            // DER KANAL IN DER AUE (K16): die Bett-Tiefe ist höchstens kanalTiefe — die Aue des Gelände-Gesetzes ist das
            // Hochwasser-Bett, der Kanal liegt in ihr, nie als Graben unter ihr (am 30-m-Raster: keine Senke > 1 m).
            kanalTiefe: 0.8,
            // DER FLUSS-SPIEGEL (Welle L, Q7-Gestalt): der Spiegel liegt um diesen Anteil der Bett-Tiefe unter dem
            // tiefsten Ufer seines Querschnitts (und so tief unter der Kanal-Krone); das Bett liegt um den Rest darunter.
            spiegelFreibord: 0.25,
            // DIE BANK (Gegenprüfung 07.10.): vom Flachboden steigt die Bank mit dieser Neigung (tan 35°, unter dem Geröll
            // des Boden-Gesetzes ab ≈ 37°) bis zur KRONE auf Spiegel + Freibord · Tiefe; jenseits der Krone schneidet der
            // Kanal höheres Gelände mit einer Böschung und hält tieferes mit einem Damm, beide mit derselben Neigung, die mit
            // dem Abstand von der Krone um bankKruemmung je m zunimmt (ein Tal: flach am Wasser, steiler den Hang hinauf),
            // bis bankWeite hinter der Krone; die Kanten (Fuß, Krone, Saum ins Gelände) runden über bankRundung (weiches
            // Minimum der Dichten). Bis 8f09227d lag die Krone nach 0,6 der Bank-Rampe (≈ 61°), und dahinter glitt eine
            // Wand ins Gelände (bis ≈ 73°: Fels-Rauten an 19 von 46 Bank-Profilen der Mess-Wiese).
            bankNeigung: 0.7,
            bankKruemmung: 0.04, // je m hinter der Krone
            bankWeite: 24, // m hinter der Krone
            bankRundung: 0.6, // m
            // DIE DAMM-KRONE (Gegenprüfung 07.10., Runde 4): hält der Kanal tieferes Gelände mit einem Damm, trägt der Damm
            // eine Krone, die das 1,8-m-Gitter trägt — dammBreite hinter der Krone des Kanals eben auf Spiegel + max(Freibord ·
            // Tiefe, dammFreibord), erst dahinter fällt er mit der Neigung der Bank. Die Breite reicht, so weit das Wasser-Sheet
            // hinter der Krone auf dem Spiegel liegt (die äußere Ecke einer Spalte, die an der Krone flutet: 1,8 m · √2), das
            // Freibord über den Fehler der gezeichneten Fläche. Bis zur Gegenprüfung war der Damm eine Schneide (Breite 0, beim
            // Rinnsal 7 cm über dem Spiegel): das Mesh trug ihn nicht (an der Krone des Bachs der Mess-Wiese lag der gezeichnete
            // Boden in 68 von 152 Profilen unter dem Spiegel, p50 0,28 m), und das Wasser lief über ihn ins tiefere Gelände.
            dammBreite: 2.6, // m hinter der Krone des Kanals
            dammFreibord: 0.2, // m über dem Spiegel, mindestens
            // DIE QUELLE (W-F5): jede beginnt als Rinnsal mit quellBett Meter Bett (Wasser höchstens 2,3 m breit und 0,37 m
            // tief) und weitet sich stromab um quellWeitung je Meter Lauf (m/m), bis sie die Breite ihres Einzugsgebiets trägt
            // — Breite und Tiefe wachsen aus dem Gesetz, nichts bricht aus dem Nichts.
            quellBett: 1.2,
            quellWeitung: 0.25,
            carveLakeBedDepth: 8, // m — der See-Boden liegt ~so weit unter dem Spiegel
            carveBucketSize: 32, // m — Kantenlänge einer Fluss-Index-Bucket-Zelle
        });
    }

    static get CREATURE_TASKS() {
        return Object.freeze(["wander", "follow_player", "wait", "gather", "build", "drink"]);
    }
    static get CREATURE_TASK_AURA_HUE() {
        return Object.freeze({
            wander: null, // keine Aura — Default ist stumm
            follow_player: 120, // grünlich, "ich bin dabei"
            wait: 40, // bernsteinfarben, "ich harre"
            gather: 200, // cyan, "ich suche"
            build: 280, // violett, "ich erschaffe"
            drink: 210, // azur, "ich nähre mich am Wasser" (V11.0-d.3)
        });
    }
    // drink-Konstanten: die Getter bleiben die Chokepoints, die ZAHLEN wohnen im tetrapoda-Gesetzbuch
    // (VERHALTEN.aufgaben, fail-closed via _verhaltenGesetz).
    static get CREATURE_DRINK_HALT_DIST() {
        return AnazhRealm._verhaltenGesetz().aufgaben.trinkHaltM; // m — am Wasser-Punkt angekommen, beginne Pause
    }
    static get CREATURE_DRINK_DURATION_S() {
        return AnazhRealm._verhaltenGesetz().aufgaben.trinkDauerS; // s — Pausen-Dauer am Ufer (Trink-Geste sichtbar)
    }
    static get CREATURE_DRINK_SEARCH_RADIUS() {
        return AnazhRealm._verhaltenGesetz().aufgaben.trinkSuchM; // m — max Suchradius für nächsten Wasser-Punkt
    }
    static get CREATURE_DRINK_SPEED() {
        return AnazhRealm._verhaltenGesetz().aufgaben.trinkTempo; // m/s — gleich wie gather, sichtbares Bewegen
    }
    // Welle 6.H Phase 2B.1 — gather-spezifische Konstanten. SCHLUSS-WELLE
    // 17.07.: die Zahlen wohnen im tetrapoda-Gesetzbuch (VERHALTEN.aufgaben).
    static get CREATURE_GATHER_HALT_DIST() {
        return AnazhRealm._verhaltenGesetz().aufgaben.gatherHaltM; // m — bei dieser Distanz erntet die Kreatur
    }
    static get CREATURE_GATHER_SPEED() {
        return AnazhRealm._verhaltenGesetz().aufgaben.gatherTempo; // m/s — langsamer als follow, Sammeln bleibt sichtbar
    }
    static get CREATURE_MEMORY_CAP() {
        return 200; // Erinnerungen pro Kreatur — Phase 2D.1 (V7.86): von 30 → 200 für persistente Identitäten mit Geschichte. Cap bleibt FIFO bei Überlauf. 50 Kreaturen × 200 Einträge × ~100 Byte = ~1 MB im Save-Worst-Case; in Praxis viel weniger weil Failures + alte Einträge selten sind.
    }
    // Welle 6.H Phase 2B.5 — Zwei-Phasen-gather Konstanten. SCHLUSS-WELLE
    // 17.07.: die Zahlen wohnen im tetrapoda-Gesetzbuch (VERHALTEN.aufgaben).
    static get CREATURE_HANDOVER_DIST() {
        return AnazhRealm._verhaltenGesetz().aufgaben.uebergabeM; // m — bei dieser Distanz übergibt die Kreatur die Ernte
    }
    static get CREATURE_FOLLOW_DISTANCE() {
        return AnazhRealm._verhaltenGesetz().aufgaben.followHaltM; // m — Standard-Halte-Abstand für follow_player
    }
    static get CREATURE_FOLLOW_MAX_SPEED() {
        return AnazhRealm._verhaltenGesetz().aufgaben.followTempo; // m/s — schneller als wander, Folgen bleibt sichtbar
    }
    // build-Konstanten (Umkehrung zu gather: Spieler = Material-Quelle, Welt = Bauplan-Senke):
    // take (zum Spieler) → build (weg bis Bau-Distanz) → spawn (am Kreatur-Ort).
    static get CREATURE_BUILD_PLACEMENT_DIST() {
        return AnazhRealm._verhaltenGesetz().aufgaben.bauAbstandM; // m — wie weit vom Spieler entfernt die Kreatur baut
    }
    static get CREATURE_BUILD_SPEED() {
        return AnazhRealm._verhaltenGesetz().aufgaben.bauTempo; // m/s — analog gather, sichtbar-aktiv aber ohne Hetze
    }
    // === Proaktive Sprache ===
    // Event-getriebener Chat-Output (Level-Up, Boost, Material-Mangel …) aus pre-baked Phrasen je
    // Event × Soul-Profil, kein LLM je Event (Flood bei vielen Kreaturen). Throttle 60 s je Kreatur + 8 s
    // global; Verletzung → silent drop (keine Queue, sonst Lawine). ${material}/${blueprint}/${level}/
    // ${label} werden vorab ersetzt.
    static get CREATURE_PROACTIVE_GAP_PER_CREATURE() {
        return 60; // s — Mindest-Abstand zwischen zwei Aussagen DERSELBEN Kreatur
    }
    static get CREATURE_PROACTIVE_GAP_GLOBAL() {
        return 8; // s — Mindest-Abstand zwischen ALLEN Kreatur-Aussagen
    }
    static get CREATURE_PROACTIVE_PHRASES() {
        // [eventType][soulName] → Array von Phrase-Templates.
        // soulName "default" wirkt als Fallback wenn ein neuer Soul-Typ
        // hinzukommt ohne spezifische Phrasen.
        return Object.freeze({
            level_up_gather: {
                wesen: Object.freeze([
                    "Mein Boden trägt ${material} jetzt fester. Stufe ${level}.",
                    "Ich kenne ${material} tiefer. Stufe ${level} in mir.",
                    "${material} wird zu meinem Hand-Wissen — Stufe ${level}.",
                ]),
                default: Object.freeze(["Ich werde besser im Sammeln von ${material}. Stufe ${level}."]),
            },
            level_up_build: {
                wesen: Object.freeze([
                    "Ich baue ${blueprint} jetzt mit ruhigerer Hand. Stufe ${level}.",
                    "${blueprint} wird Teil meines Wesens — Stufe ${level}.",
                ]),
                default: Object.freeze(["Ich verstehe ${blueprint} jetzt tiefer. Stufe ${level}."]),
            },
            boost_received: {
                wesen: Object.freeze([
                    "${label} setzt sich warm in mein Innerstes.",
                    "Ich fühle ${label} durch meine Glieder gehen.",
                ]),
                default: Object.freeze(["Der Trank ${label} wirkt in mir."]),
            },
            no_material_found: {
                wesen: Object.freeze([
                    "${material} ist nirgends in Reichweite.",
                    "Ich finde kein ${material}. Soll ich anderes suchen?",
                ]),
                default: Object.freeze(["Ich finde kein ${material} mehr."]),
            },
            no_inventory_for_build: {
                wesen: Object.freeze([
                    "Du hast kein Material für ${blueprint} bei dir.",
                    "Mir fehlt für ${blueprint} der Stoff aus deiner Hand.",
                ]),
                default: Object.freeze(["Mir fehlt Material für ${blueprint}."]),
            },
        });
    }
    // === Kreatur-DSL-Vorschläge (Sandbox) ===
    // Whitelist: atmosphärisch + Terrain — KEIN player_*, KEIN define_*, kein Bauplan-Löschen;
    // voxel_carve/voxel_fill bewusst erlaubt. chain erlaubt; der Validator walkt die AST rekursiv
    // gegen die Whitelist.
    static get CREATURE_PROPOSED_OPS() {
        return Object.freeze(
            new Set([
                "weather",
                "skybox_color",
                "creatures_emotion",
                "creatures_color",
                "spawn_creature",
                "spawn_blueprint",
                "spawn_village",
                "spawn_temple",
                "spawn_waterfall",
                "spawn_tree",
                "spawn_island",
                "spawn_ufo",
                "spawn_fractal",
                "set_visible",
                "voxel_carve",
                "voxel_fill",
                "chain",
                "say", // narrative-only Op (existing) bleibt erlaubt
            ])
        );
    }
    // Throttle für die LLM-Vertiefung seltener Events (L5, neue Top-Spec) gegen API-Bursts; die
    // pre-baked Phrasen bleiben der Default.
    static get CREATURE_LLM_RARE_EVENT_GAP() {
        return 600; // s — 10 Min global
    }

    // Spezialisierung: je THRESHOLD erfolgreiche Aktionen ein Level, gedeckelt bei MAX_LEVEL;
    // SPEED_BONUS moduliert die Tick-Geschwindigkeit.
    static get CREATURE_SPECIALIZATION_LEVEL_THRESHOLD() {
        return 3; // Erfolge pro Level — nach 3 Holz-Ernten Level 1, nach 6 Level 2
    }
    static get CREATURE_SPECIALIZATION_MAX_LEVEL() {
        return 5; // Cap — nach 15 Erfolgen ist Level 5 erreicht (Meisterschaft)
    }
    static get CREATURE_SPECIALIZATION_SPEED_BONUS_PER_LEVEL() {
        return 0.15; // L5 = +75 % Geschwindigkeit (3.0 → 5.25 m/s)
    }
}
