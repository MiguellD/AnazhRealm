class AnazhRealm_Z06a {
    // ===== ATLAS §06 · KREATUREN — Seelen · Innenleben/Emotion · Motion · Aufträge · Jagd =====
    // ### Kreaturen ### V7.42
    removeCreature(creature) {
        this._kreaturZiegelTod(creature); // das Feld stirbt mit dem Tier
        if (!creature) return;
        this._leibZeichenFrei(creature); // die Zeichen über dem Leib (ein Gefallener trägt seit dem Fall keine mehr)
        this.state.scene.remove(creature);
        // Welle 6.H Phase 2A — Kreatur ist jetzt eine Group; tiefes Disposal
        // wie bei Soul-Wechsel, sonst leakt jede Sub-Mesh-Geometrie.
        this._disposeSoulGroup(creature);
        // DETERMINISMUS-BOGEN P3 — Kreaturen tragen keinen Ammo-Body mehr (sie erden
        // feld-nativ über `_creatureGroundY`); nur die Mesh-Referenz aus `rigidBodies` lösen.
        creature.userData.physicsBody = null;
        this.state.rigidBodies = this.state.rigidBodies.filter((rb) => rb !== creature);
        // Aus der Liste der Wesen (samt der Parallel-Liste der Emotionen) oder der Gefallenen — sonst bliebe bei
        // Einzel-Aufrufen die tote Referenz im Save.
        if (!this._kreaturAusListe(creature)) {
            const li = this.state.leichname.indexOf(creature);
            if (li !== -1) this.state.leichname.splice(li, 1);
        }
        if (typeof this._renderTaskStatusUI === "function") this._renderTaskStatusUI();
        this._uiDirty("hof"); // W3 (V18.176) — der UI-Puls (war _renderCreatureListUI direkt)
    }

    // DIE ZEICHEN ÜBER DEM LEIB (die Aura des Auftrags, das Sprite der Traglast) räumen — der EINE Weg für den Abschied
    // (removeCreature) und den Fall (_kreaturFaellt: ein Leichnam trägt keinen Auftrag, keine Last). Die Textur ist geteilt
    // (_getCreatureTaskAuraTexture, lebt mit der Realm-Klasse) — nur das Material geht, aufgeschoben (V10.0-j.e, das
    // Submit-Rennen unter WebGPU); sonst bliebe das Sprite als Geist im Heap. `nur` räumt EIN Zeichen ("taskAura" |
    // "carryingSprite"): das Ende eines Auftrags (_refreshCreatureTaskAura) und einer Traglast (_refreshCreatureCarryingVisual)
    // gehen DENSELBEN Weg (K13 — vorher räumten beide in eigenen Kopien dieses Codes).
    _leibZeichenFrei(creature, nur = null) {
        const ud = creature && creature.userData;
        if (!ud) return;
        for (const feld of nur ? [nur] : ["taskAura", "carryingSprite"]) {
            const z = ud[feld];
            if (!z) continue;
            if (this.state.scene) this.state.scene.remove(z);
            if (z.material) this._queueDispose(z.material);
            ud[feld] = null;
        }
    }

    // DIE EINE STELLE, an der ein Leib die Wesen verlässt (der Tod → state.leichname, removeCreature): die Parallel-Liste der
    // Emotionen zieht mit, und ein laufender Kreatur-Takt behält sein Tier — fällt eines, das er schon getragen hat (ein Biss
    // mitten im Takt), rückt sein Index nach (`_kreaturTaktI`), sonst übersprang er das nächste.
    _kreaturAusListe(creature) {
        const cs = this.state.creatures;
        const idx = cs.indexOf(creature);
        if (idx === -1) return false;
        cs.splice(idx, 1);
        const em = this.state.creatureEmotions;
        if (Array.isArray(em) && idx < em.length) em.splice(idx, 1);
        if (Number.isInteger(this._kreaturTaktI) && idx <= this._kreaturTaktI) this._kreaturTaktI--;
        return true;
    }

    clearCreatures() {
        for (const l of this.state.leichname.slice()) this.removeCreature(l); // auch die Gefallenen gehen mit der Welt
        if (!this.state.creatures || this.state.creatures.length === 0) return;
        // Über eine KOPIE: removeCreature spliced die Liste selbst — ein forEach über das Original übersprang jedes
        // zweite Tier, das als eingefrorener Geist in der Szene blieb (Leben-Prüfung R-D14: 6 Tiere → 3 Geister,
        // je ~46 Befehle; jeder Welt-Wechsel und jede Neu-Genese).
        for (const creature of this.state.creatures.slice()) this.removeCreature(creature);
        this.state.creatures = [];
        this.state.creatureEmotions = [];
    }

    spawnCreatureAt(x, y, z, emotion = "happy", soulName = null, opts = {}) {
        // Welle 6.H Phase 2A — Kreatur ist jetzt eine Hylomorphismus-Group.
        // Selber Renderpfad wie Architektur + Spieler-Seele: _buildFromBlueprint
        // konsumiert bodyParts × Material aus CREATURE_SOULS.
        // Jede Absage trägt ihren Grund (`opts.absage`, wie die Wurzel der Werke): die Obergrenze, die Seele, die Gestalt.
        const nein = (grund) => {
            if (typeof opts.absage === "function") opts.absage(grund);
            return null;
        };
        if (this.state.creatures.length >= this.state.maxCreatures) return nein("obergrenze");
        // SPIELER-KLEMME: kein Wesen materialisiert IM Spieler — näher als CREATURE_SPAWN_CLEAR_M wird
        // radial auf den Ring geschoben (deckungsgleich → Goldwinkel über netSeq, kein Math.random).
        // Opt-out `precise` für bit-treue Pfade (Restore/Peer-Sicht).
        if (!opts.precise && this.state.playerMesh) {
            const pm = this.state.playerMesh.position;
            const dx = x - pm.x;
            const dz = z - pm.z;
            const d = Math.hypot(dx, dz);
            const MIN = AnazhRealm.CREATURE_SPAWN_CLEAR_M;
            if (d < MIN) {
                const ang = d > 1e-4 ? Math.atan2(dz, dx) : ((this.state._creatureNetSeq || 0) + 1) * 2.39996;
                x = pm.x + Math.cos(ang) * MIN;
                z = pm.z + Math.sin(ang) * MIN;
            }
        }
        const chosenSoul = this._pickCreatureSoulName(soulName);
        if (!chosenSoul) return nein("seele"); // unbekannte Seele: laute Absage (geloggt), kein Ersatz-Tier
        // RELOAD-TREUE: beim Restore kommen die beim ersten Guss eingefrorenen Dials als opts.dialsOv, damit
        // die Kreatur wie GEGOSSEN wiederkehrt, auch wenn die aktuelle Übergabe inzwischen anders ist.
        // Frischer Spawn (kein dialsOv) liest die aktuelle Übergabe.
        const gussOv = opts.dialsOv && typeof opts.dialsOv === "object" ? opts.dialsOv : null;
        const group = this._buildCreatureGroup(chosenSoul, gussOv ? { dialsOv: gussOv } : undefined);
        if (!group) return nein("gestalt");
        group.position.set(x, y, z);
        // Die Gier ist die äußere Drehung (Q3): der Hang-Pitch (rotation.x) neigt den Leib um SEINE Querachse, auch wenn
        // er nicht längs Welt-z läuft (in der XYZ-Ordnung kippte er bei Gier ≠ 0 seitlich).
        group.rotation.order = "YXZ";
        group.visible = true;
        group.userData.kind = "creature";
        group.userData.soul = chosenSoul;
        // ANALOG A — kanonische Gattung am Körper (Dedup-Schlüssel Gattung×Glied):
        // Studio-Rezept-Id wenn gemappt, sonst die Seele selbst (Custom/Geist).
        group.userData.gattung =
            (AnazhRealm.TETRAPODA_SOUL_MAP && AnazhRealm.TETRAPODA_SOUL_MAP[chosenSoul]) || chosenSoul;
        // Kreatur-Sicht-Sync — eine pro-Peer eindeutige netId für den
        // creature-pos-Strom (Mitspieler keyen ihre Sicht-Kopie damit).
        this.state._creatureNetSeq = (this.state._creatureNetSeq || 0) + 1;
        group.userData.netId = "c" + this.state._creatureNetSeq;
        group.userData.name = this._pickCreatureName(group.userData.netId);
        // GRÖSSENKLASSE: jede Kreatur trägt eine Körpergröße (klein/normal/gross/GIGANT), deterministisch
        // aus ihrer netId (Peer-/Re-Wachstum-konsistent) oder aus dem Snapshot (opts.bodySize).
        // Das Template wird NUR UNIFORM skaliert — Symmetrie und Physik-Verhältnisse bleiben invariant.
        // Muss VOR der hp-Init unten stehen (die Stats lesen bodySize).
        group.userData.bodySize = Number.isFinite(opts.bodySize)
            ? opts.bodySize
            : this._creatureBodySize(group.userData.netId);
        // Die Körpergröße skaliert das Studio-Tier UNIFORM; die Glied-Dicke ist Gesetz der Art (ART_GESTALT.bein,
        // deriveTierParams: Beinmuskel ∝ Größe^0,67). Die Galileo-Allometrie des Wirts (√L auf die Glied-Kinder) fiel
        // (Integration W5-Körper): das Studio-Tier trägt keine Teil-Kinder, sie lief seit Welle 5 für kein Wesen mehr.
        group.scale.setScalar(group.userData.bodySize);
        group.userData.task = { name: "wander", args: {}, since: performance.now() / 1000 };
        // bornAt = Identitäts-Marker: persistierte Kreaturen behalten ihn über Reload, neue bekommen jetzt.
        group.userData.bornAt = Date.now();
        // Guss-Stempel der Studio-Dials: Restore-Dials kehren am Wesen zurück; sonst frieren wir die JETZT
        // wirksame Übergabe der Gattung ein — nur wenn eine aktiv war (Default-Kreaturen bleiben feld-los).
        // So trägt der Snapshot die Guss-Wahrheit, nicht die spätere Übergabe.
        {
            const recIdS = AnazhRealm.TETRAPODA_SOUL_MAP && AnazhRealm.TETRAPODA_SOUL_MAP[chosenSoul];
            if (gussOv) {
                group.userData.gussDials = gussOv;
            } else if (
                recIdS &&
                this.state.studioUebergabe &&
                this.state.studioUebergabe.kreatur &&
                this.state.studioUebergabe.kreatur[recIdS] &&
                this.state.studioUebergabe.kreatur[recIdS].s
            ) {
                const eff = this._tetrapodaStudioDials(recIdS);
                if (eff && typeof eff === "object") {
                    try {
                        group.userData.gussDials = JSON.parse(JSON.stringify(eff));
                    } catch (_e) {
                        /* nicht-klonbar → kein Stempel (fail-closed) */
                    }
                }
            }
        }
        // Welle 6.H Phase 2F.2 — Equipped-Slots wie Spieler. Initial leer;
        // wird via equipCreatureTool/equipCreatureArmor mutiert. Persistent
        // über _serializeCreature → snap.equipped.
        group.userData.equipped = { tool: null, armor: null };
        // Welle 6.H Phase 2F.3 — Boost-Container. Initial leer; via
        // applyCreatureBoost gefüllt, via tickCreatureBoosts gesäubert.
        // KEINE Persistenz — Boosts sind „Geste lebt im Moment".
        group.userData.boosts = [];
        // W4 (V17.48) — die BINDUNG (∈ [0,1]): wächst, während die Kreatur folgt + nah ist
        // + bei der „folge mir"-Geste; gewichtet die Contagion + den Schmerz des Verlusts.
        // Reaktiv, NICHT persistiert (wie der Task — die Beziehung wird gelebt, nicht gespeichert).
        group.userData.bond = 0;
        // Kreatur-HP: init = hpMax aus DERSELBEN Stat-Pipeline wie der Spieler; der Snapshot trägt die Wunde
        // (_serializeCreature → _restoreCreatureFromSnapshot, Q12); damageCreature lazy-init't ebenfalls.
        const _cStats = this.computeCreatureStats(group).stats;
        group.userData.hpMax = _cStats.hpMax;
        group.userData.hp = _cStats.hpMax;
        // DAS GEMÜT WIRD MIT DEM LEIB GEGOSSEN (Welle LF): Gattung × die EINE Masse des eben gegossenen Leibs
        // (`_creatureTemperament` → `_leibMasse`), gecacht je Gattung × Größe — der Takt liest es, statt es zu rechnen.
        this._creatureTemperament(group);
        // DER ERSTE GRUND (Leben-Schau 2): der Ort des Rufs liest seinen Boden (`_koerperBodenUnter`, im Gestein trägt die
        // Säule) — jede Bewegung danach ist ein SCHRITT von ihm (`_koerperSchritt`, die Wand hält). Vorher las erst der
        // erste Takt den Boden: schob ihn ein Stoß (der Spieler am selben Ort) 0,7 m in den Fuß der Höhlenwand, stand der
        // frische Wolf auf dem Dach (42,90 m über dem Grund 30,40). DIE FELS-BLASE: die Höhe des Rufers ist eine Schätzung
        // (die des Spielers, ein Ort 2–15 m daneben am Hang) — ein Ruf landet nur in einer Luft, die einen Leib trägt (2 m
        // über dem Grund frei), in einer engeren Blase im Hang trägt die Säule wie im Gestein (gate:kreatur-takt: ein Fuchs,
        // gerufen 8 m unter der Wiese, lag in 1,2 m Luft unter 7 m Fels).
        let grund0 = this._koerperBodenUnter(x, y, z);
        if (this._fieldSolid(x, grund0 + 2, z)) grund0 = this._koerperBodenUnter(x, NaN, z);
        group.userData.cachedGroundY = grund0;
        group.userData.cachedGroundX = x;
        group.userData.cachedGroundZ = z;
        if (this.state.scene) this.state.scene.add(group);
        this.state.creatures.push(group);
        this.state.creatureEmotions.push(emotion === "sad" ? "sad" : "happy");
        // V18.100 (G4-1) — das Innenleben startet kongruent zum Spawn-Etikett
        // (sad → Trauer-Grundton, sonst ruhige Freude); ab jetzt schreibt nur
        // noch _feelCreatureAction/Wetter, das Etikett ist Projektion.
        group.userData.emotions =
            emotion === "sad"
                ? { joy: 0, awe: 0, sorrow: 0.4, hope: 0, peace: 0, chaos: 0 }
                : { joy: 0.2, awe: 0, sorrow: 0, hope: 0.1, peace: 0.15, chaos: 0 };
        // Kein Physik-Body: Kreaturen erden feld-nativ (`_creatureGroundY` → der Boden unter dem Körper), bewegen sich
        // kinematisch in `updateCreatures`; Knockback via `creature.userData.knockVel`.
        // Der erste Ruf des neuen Wesens (klang:UMWELT.tier — die Stimme folgt dem Körper).
        this._tierRuf(group, emotion === "sad" ? "trauer" : "freude");
        return group;
    }

    // === Komponenten-Persistenz für Kreaturen ===
    // Komponenten-Snapshot statt Mesh: {name, soul, memory, position, bornAt, …} je Kreatur (~1 KB).
    // NICHT persistiert: Specs (live aus memory abgeleitet), Tasks + carrying (reaktiv).
    _serializeCreature(creature) {
        if (!creature || !creature.userData) return null;
        const ud = creature.userData;
        return {
            name: typeof ud.name === "string" ? ud.name : null,
            soul: typeof ud.soul === "string" ? ud.soul : null,
            memory: Array.isArray(ud.memory) ? ud.memory.slice() : [],
            position: {
                x: creature.position ? creature.position.x : 0,
                y: creature.position ? creature.position.y : 5,
                z: creature.position ? creature.position.z : 0,
            },
            bornAt: Number.isFinite(ud.bornAt) ? ud.bornAt : Date.now(),
            // S7 — die Körpergröße reist mit (Restore re-spawnt mit NEUER netId → bodySize
            // MUSS persistiert werden, sonst änderte das Wesen beim Reload seine Größe).
            bodySize: Number.isFinite(ud.bodySize) ? ud.bodySize : 1,
            // Q12 (Kritik 06.10. §2.5): die Wunde und die Blickrichtung reisen mit — ein verwundeter Hirsch kehrte geheilt
            // zurück (hp 97,3 → 115,4), jeder Leib blickte nach dem Reload nach +z. DIE WUNDE IST EIN ANTEIL DES LEBENS (Welle
            // LF kampf Nachbesserung 2): wie beim Wachsen (_kreaturGroesseSetzen) reist hp/hpMax — das Leben selbst rechnet der Leib
            // beim Restore neu (Gattung × Größe × Masse); ein absolutes hp stand nach einem neuen Lebens-Gesetz verwundet da.
            hpAnteil: Number.isFinite(ud.hp) && ud.hpMax > 0 ? +(ud.hp / ud.hpMax).toFixed(4) : undefined,
            gier: Number.isFinite(creature.rotation && creature.rotation.y)
                ? +creature.rotation.y.toFixed(4)
                : undefined,
            // Eingefrorene Guss-Dials reisen mit — nur wenn unter einer Studio-Übergabe gegossen (Default-
            // Kreaturen tragen das Feld nicht); der Restore pinnt sie als dialsOv.
            gussDials:
                ud.gussDials && typeof ud.gussDials === "object" && !Array.isArray(ud.gussDials)
                    ? ud.gussDials
                    : undefined,
            // Welle 6.H Phase 2F.2 — Equipped-Slots persistieren. Tasks +
            // carrying bleiben weiterhin Geste (nicht persistiert), aber
            // Werkzeug + Rüstung sind Identitäts-Komponenten wie Memory.
            equipped: {
                tool: ud.equipped && typeof ud.equipped.tool === "string" ? ud.equipped.tool : null,
                armor: ud.equipped && typeof ud.equipped.armor === "string" ? ud.equipped.armor : null,
            },
        };
    }

    // Spawnt am alten Ort mit alter Seele, setzt den persistierten Namen + memory; Specs nicht direkt
    // (live aus memory). Liefert die THREE.Group oder null.
    _restoreCreatureFromSnapshot(snap, emotion = "happy") {
        if (!snap || !snap.position) return null;
        // Restore ist PRECISE (bit-treu; die Spieler-Klemme gilt nur frischen Spawns).
        // Guss-Dials laufen durch DENSELBEN Validator (Kreatur-PARAMS-Clamps) — ein hand-editierter Save
        // schleust keine Riesen-Dials ein; die Gattung (recId) pinnt TETRAPODA_SOUL_MAP.
        let restoreDials;
        if (snap.gussDials && typeof snap.gussDials === "object" && !Array.isArray(snap.gussDials)) {
            const recIdR = AnazhRealm.TETRAPODA_SOUL_MAP && AnazhRealm.TETRAPODA_SOUL_MAP[snap.soul];
            if (recIdR) {
                const clean = this._studioUebergabeValidate("kreatur", { gattung: recIdR, s: snap.gussDials });
                if (clean && clean.s) restoreDials = clean.s;
            }
        }
        const c = this.spawnCreatureAt(snap.position.x, snap.position.y, snap.position.z, emotion, snap.soul, {
            precise: true,
            // S7 — die persistierte Körpergröße zurück (sonst würfelte der Restore aus der
            // neuen netId eine andere Größe).
            bodySize: Number.isFinite(snap.bodySize) ? snap.bodySize : undefined,
            dialsOv: restoreDials,
        });
        if (!c) return null;
        if (typeof snap.name === "string" && snap.name.length > 0) {
            c.userData.name = snap.name;
        }
        if (Array.isArray(snap.memory)) {
            const cap = AnazhRealm.CREATURE_MEMORY_CAP;
            c.userData.memory = snap.memory.slice(-cap);
        }
        if (Number.isFinite(snap.bornAt)) {
            c.userData.bornAt = snap.bornAt;
        }
        // die Wunde als Anteil des Lebens, das der Leib jetzt hat; ein Stand vor dem Anteil (Q12 bis Welle LF kampf Nachbesserung 2)
        // trug hp gegen das Leben VOR dem Massen-Gesetz (Substanz × Größen-Symmetrie, computeCreatureStats.hpOhneMasse) —
        // vorher stand ein voller Hirsch danach bei 124/168, ein voller Bär bei 159/391 (verwundet, ohne Wunde)
        const hpMaxR = c.userData.hpMax;
        let anteil = null;
        if (Number.isFinite(snap.hpAnteil) && snap.hpAnteil > 0) anteil = snap.hpAnteil;
        else if (Number.isFinite(snap.hp) && snap.hp > 0) {
            const alt = this.computeCreatureStats(c).hpOhneMasse;
            anteil = alt > 0 ? snap.hp / alt : null;
        }
        if (anteil !== null && Number.isFinite(hpMaxR)) c.userData.hp = Math.min(1, anteil) * hpMaxR;
        if (Number.isFinite(snap.gier)) {
            c.rotation.y = snap.gier;
            c.userData._steuer = { gier: snap.gier, v: 0 };
        }
        // Equipped-Slots defensiv restoren: tool muss in state.tools existieren, armor role:"armor" tragen —
        // sonst null (die Welt kann sich zwischen Save und Load geändert haben).
        if (snap.equipped && typeof snap.equipped === "object") {
            c.userData.equipped = c.userData.equipped || { tool: null, armor: null };
            const tn = snap.equipped.tool;
            if (typeof tn === "string" && this.state.tools && this.state.tools[tn]) {
                c.userData.equipped.tool = tn;
            }
            const an = snap.equipped.armor;
            if (
                typeof an === "string" &&
                this.state.blueprints &&
                this.state.blueprints[an] &&
                this.state.blueprints[an].role === "armor"
            ) {
                c.userData.equipped.armor = an;
            }
        }
        return c;
    }

    // === Kreatur-Equipped (Werkzeug + Rüstung) ===
    // API wie beim Spieler (equipTool/equipArmor/unequip), nur mit expliziter Kreatur; state.tools ist
    // Welt-Wissen (kein Kreatur-Inventar). Wirkt über computeCreatureStats (TOOL_STAT_WEIGHT /
    // ARMOR_STAT_WEIGHT). null/leerer Name = abnehmen; Validierung wie beim Spieler.

    equipCreatureTool(creature, name) {
        if (!creature || !creature.userData) return { ok: false, reason: "no_creature" };
        creature.userData.equipped = creature.userData.equipped || { tool: null, armor: null };
        if (!name) {
            creature.userData.equipped.tool = null;
            this._afterCreatureEquipChange(creature);
            return { ok: true, equipped: null };
        }
        if (!this.state.tools || !this.state.tools[name]) {
            return { ok: false, reason: "tool_unknown" };
        }
        creature.userData.equipped.tool = name;
        this._afterCreatureEquipChange(creature);
        return { ok: true, equipped: name };
    }

    equipCreatureArmor(creature, name) {
        if (!creature || !creature.userData) return { ok: false, reason: "no_creature" };
        creature.userData.equipped = creature.userData.equipped || { tool: null, armor: null };
        if (!name) {
            creature.userData.equipped.armor = null;
            this._afterCreatureEquipChange(creature);
            return { ok: true, equipped: null };
        }
        const bp = this.state.blueprints && this.state.blueprints[name];
        if (!bp) return { ok: false, reason: "blueprint_unknown" };
        if (bp.role !== "armor") return { ok: false, reason: "not_marked_as_armor" };
        creature.userData.equipped.armor = name;
        this._afterCreatureEquipChange(creature);
        return { ok: true, equipped: name };
    }

    unequipCreatureSlot(creature, slot) {
        if (!creature || !creature.userData) return { ok: false, reason: "no_creature" };
        if (slot !== "tool" && slot !== "armor") return { ok: false, reason: "invalid_slot" };
        creature.userData.equipped = creature.userData.equipped || { tool: null, armor: null };
        creature.userData.equipped[slot] = null;
        this._afterCreatureEquipChange(creature);
        return { ok: true, slot };
    }

    // Equip-Change-Hook: Stats neu cachen + Liste re-rendern damit Tooltip
    // + Pills sofort die neuen Werte zeigen. Symmetrie zu Player-
    // recomputePlayerStats das renderPlayerStatsUI aufruft.
    _afterCreatureEquipChange(creature) {
        if (typeof this._refreshCreatureStatsCache === "function") {
            this._refreshCreatureStatsCache(creature);
        }
        this._uiDirty("hof"); // W3 (V18.176) — der UI-Puls (war _renderCreatureListUI direkt)
    }

    // === Kreatur-Boosts via Konsumables ===
    // Boost EMERGIERT aus computeCompoundTags(blueprint) × scale (symmetrisch zu activateConsumable).
    // userData.boosts = [{source, tagDelta, expiresAt, label}]; gleiche source verlängert, der 1-Hz-Tick
    // (boostLastTick) entfernt Abgelaufene; computeCreatureStats summiert tagDelta. NICHT persistiert.

    applyCreatureBoost(creature, spec) {
        if (!creature || !creature.userData) return false;
        if (!spec || typeof spec !== "object") return false;
        const source = String(spec.source || "").slice(0, 60);
        if (!source) return false;
        const tagDelta = {};
        const inputDelta = spec.tagDelta || {};
        for (const tag of AnazhRealm.MATERIAL_TAG_KEYS) {
            const v = Number(inputDelta[tag]);
            if (Number.isFinite(v) && v !== 0) tagDelta[tag] = Math.max(-1, Math.min(1, v));
        }
        if (Object.keys(tagDelta).length === 0) return false;
        const duration = Math.max(0.5, Math.min(600, Number(spec.durationSeconds) || 30));
        const now = performance.now() / 1000;
        const expiresAt = now + duration;
        const label = String(spec.label || source).slice(0, 80);
        if (!Array.isArray(creature.userData.boosts)) creature.userData.boosts = [];
        const existing = creature.userData.boosts.find((b) => b.source === source);
        const isNewBoost = !existing;
        if (existing) {
            // Selbe Quelle erneut → expiresAt verlängern, tagDelta + label
            // aktualisieren (Konsumable könnte sich zwischen Aktivierungen
            // verändert haben). Selbe Disziplin wie Player.addPlayerBoost.
            existing.expiresAt = expiresAt;
            existing.tagDelta = tagDelta;
            existing.label = label;
        } else {
            creature.userData.boosts.push({ source, tagDelta, expiresAt, label });
        }
        this._afterCreatureEquipChange(creature);
        // Proaktive Sprache nur bei NEUEM Boost (nicht beim Verlängern, sonst spräche sie jeden Tick);
        // der Throttle in _creatureSpeakProactive ist die zweite Verteidigung gegen Flood.
        if (isNewBoost && typeof this._creatureSpeakProactive === "function") {
            this._creatureSpeakProactive(creature, "boost_received", { label });
        }
        return true;
    }

    // 1 Hz Tick — säubert abgelaufene Boosts. Wird aus Game-Loop aufgerufen
    // (analog tickPlayerBoosts). Iteriert alle Kreaturen — günstig genug bei
    // ≤120 Kreaturen × O(boostsCount) Filter pro Sekunde.
    tickCreatureBoosts(currentTime) {
        if (!Array.isArray(this.state.creatures)) return;
        const now = performance.now() / 1000;
        for (const c of this.state.creatures) {
            if (!c || !c.userData) continue;
            if (currentTime - (c.userData.boostLastTick || -Infinity) < 1.0) continue;
            c.userData.boostLastTick = currentTime;
            if (!Array.isArray(c.userData.boosts) || c.userData.boosts.length === 0) continue;
            const kept = c.userData.boosts.filter((b) => b.expiresAt > now);
            if (kept.length !== c.userData.boosts.length) {
                c.userData.boosts = kept;
                // Stats-Cache + UI refreshen (selber Hook wie equip).
                this._afterCreatureEquipChange(c);
            }
        }
    }

    // Tag-Bonus EMERGIERT aus computeCompoundTags(bp) × scale; scale=0.2 bildet Compound-Tags bis ~3
    // auf Boost-Deltas 0..0.5 ab (spürbar, nicht dominant).
    activateCreatureConsumable(creature, blueprintName) {
        if (!creature) return { ok: false, reason: "no_creature" };
        const bp = this.state.blueprints && this.state.blueprints[blueprintName];
        if (!bp) return { ok: false, reason: "blueprint_unknown" };
        if (bp.role !== "consumable") {
            return { ok: false, reason: "not_marked_as_consumable" };
        }
        // Welle 11 ext. — consumableMeta optional (siehe activateConsumable):
        // emergente Nahrung ist auch für Kreaturen verfütterbar.
        const meta = bp.consumableMeta || {};
        const tags = this.computeCompoundTags(bp);
        const scale = meta.scale || 0.2;
        // V8.39 — Qualität skaliert die Trank-Stärke (selber Pfad wie
        // activateConsumable).
        const qMul = 0.5 + 0.5 * this.computeBlueprintQuality(bp) * this._blueprintRoleFit(bp, "consumable");
        const tagBonus = {};
        for (const tag of Object.keys(tags)) {
            const v = tags[tag] * scale * qMul;
            if (Math.abs(v) > 0.001) tagBonus[tag] = Math.max(-1, Math.min(1, v));
        }
        if (Object.keys(tagBonus).length === 0) {
            return { ok: false, reason: "blueprint_has_no_tags" };
        }
        const ok = this.applyCreatureBoost(creature, {
            source: `consume:${blueprintName}`,
            tagDelta: tagBonus,
            durationSeconds: meta.durationSeconds || 30,
            label: meta.label || bp.label || blueprintName,
        });
        return ok ? { ok: true, tagBonus } : { ok: false, reason: "boost_apply_failed" };
    }

    // Die Seele zu einem Wunsch: ein Schlüssel (wesen/wolf/fuchs/baer) oder ihr Schild ("Hirsch", "Bär"); ein
    // unbekannter Wunsch ist eine laute Absage (null — spawnCreatureAt bricht ab), nie ein still gewürfelter Ersatz
    // (die Kritik 06.10.: `spawnCreatureAt(…, "hirsch")` ergab einen Bären). Ohne Wunsch der Ambient-Pick aus dem
    // Fauna-Strom (Γ5).
    _pickCreatureSoulName(requested, rng = this._faunaRng()) {
        const souls = AnazhRealm.CREATURE_SOUL_NAMES;
        if (typeof requested === "string" && requested) {
            if (souls.includes(requested)) return requested;
            const norm = (t) => String(t).toLowerCase().replace(/ä/g, "ae").replace(/ö/g, "oe").replace(/ü/g, "ue");
            const w = norm(requested);
            const hit = souls.find((n) => norm(n) === w || norm(AnazhRealm.CREATURE_SOULS[n].label || "") === w);
            if (hit) return hit;
            this.log(`Kreatur-Seele „${requested}" unbekannt (${souls.join(", ")}) — kein Ersatz.`, "WARN");
            return null;
        }
        // PHASE E — Raubtier-Seelen entstehen nur auf BEWUSSTEN Wunsch
        // (requested), nie aus dem Ambient-Pick (sparsam: keine
        // friedliche Welt voll Aggression).
        const gentle = souls.filter((n) => !AnazhRealm.CREATURE_SOULS[n].predator);
        const pool = gentle.length ? gentle : souls;
        return pool[Math.min(pool.length - 1, Math.floor(rng() * pool.length))];
    }

    // Aura-Y-Offset folgt der Soul-Höhe (auraY-Hint pro Seele), damit die
    // Aura über Sprite und Wesen unterschiedlich hoch schwebt.
    _creatureAuraOffsetY(creature) {
        if (!creature || !creature.userData) return 0.9;
        const soulName = creature.userData.soul;
        const soul = soulName && AnazhRealm.CREATURE_SOULS[soulName];
        return soul && Number.isFinite(soul.auraY) ? soul.auraY : 0.9;
    }

    // Der Name aus der Identität (netId, Γ5): derselbe Wurf auf jedem Peer und nach jedem Reload-Guss.
    _pickCreatureName(netId) {
        const pool = AnazhRealm.CREATURE_NAME_POOL;
        const g = this._rollGenome(String(netId == null ? "c0" : netId), "creature-name");
        return pool[Math.min(pool.length - 1, Math.floor(g.axis("name") * pool.length))];
    }

    // ═══ DAS KREATUR-SKELETT-GESETZ ═══
    // Ein Wesen = Rumpf (Wirbelsäulen-Achse) + Glied-PAARE + Hals + Kopf/Schnauze + Schwanz + Accessoires;
    // die Anatomie emergiert aus wenigen Achsen. Reine Daten (kein THREE, kein `this`) → läuft schon bei
    // der CREATURE_SOULS-Definition. AFFINITÄT-WAND: das Genom wählt SHAPES, NIE neue Tags (holz-`limb`
    // = cylinder → Compound-MAX bit-identisch); Form/Größe/Position sind tag-neutral.
    static _creatureSkeleton(g) {
        // ALTLASTEN-NULL HERZ — das Skelett-GESETZ wohnt im Evolutions-
        // Gesetzbuch (tetrapoda-core, EINE Anatomie-Quelle; index.html lädt
        // den Kern vor dem Stamm). Fail-closed: ohne Gesetzbuch kein Tier.
        const core = (typeof globalThis !== "undefined" && globalThis.__tetrapodaCore) || null;
        if (!core || typeof core.buildSkeleton !== "function") {
            throw new Error(
                "tetrapoda-core fehlt — das Skelett-Gesetz wohnt im Kern (index.html lädt ihn vor dem Stamm)"
            );
        }
        return core.buildSkeleton(g);
    }

    // Genom-Roller: aus EINEM Seed ein deterministisches Körper-Genom (Geschlecht · Statur · Muskel ·
    // Kopf-Verhältnis · Größe · Haut/Haar-Ton) — gleicher Seed → gleicher Körper auf allen Peers.
    _rollHumanoidGenome(seed) {
        const g = this._rollGenome(String(seed == null ? "h0" : seed), "humanoid");
        // KONVERGENZ II — die Paletten wohnen im Gesetzbuch (koerper-core.SKIN_TONES/
        // HAIR_COLORS): der Roller PICKT aus der Lab-Wahrheit, kein Zwilling mehr.
        const core = typeof window !== "undefined" && window.__koerperCore;
        const skinTones =
            core && core.SKIN_TONES ? Object.keys(core.SKIN_TONES).map((k) => core.SKIN_TONES[k].hex) : [0xc48566];
        const hairTones =
            core && core.HAIR_COLORS ? Object.keys(core.HAIR_COLORS).map((k) => core.HAIR_COLORS[k].base) : [0x2a1a10];
        return {
            sex: g.axis("sex"),
            build: g.axis("build"),
            muscle: Math.max(0, Math.min(1, g.axis("muscle") * 0.65 + g.axis("build") * 0.35)),
            headRatio: g.range("head", 0.92, 1.16),
            kh: g.range("height", 0.195, 0.235), // Welt-Höhe ~1.56–1.88 m
            skinColor: g.pick("skin", skinTones),
            hairColor: g.pick("hair", hairTones),
        };
    }
    // Genom→Dial-Brücke: der EINE Bau-Pfad ist bauMensch(dials); die Brücke invertiert die
    // KOERPER_DIAL_MAP-Zeilen (EINE Quelle, kein zweiter Zahlensatz). height = kh/PLAYER-Einheit.
    _dialsAusGenom(g) {
        const core = typeof window !== "undefined" && window.__koerperCore;
        const start = core && core.START_PARAMS ? core.START_PARAMS : {};
        const d = Object.assign({}, start);
        const MAP = AnazhRealm.KOERPER_DIAL_MAP || [];
        for (const row of MAP) {
            if (!row || !Number.isFinite(row.base) || !Number.isFinite(row.mul) || row.mul === 0) continue;
            if (row.axis === "khMul") {
                const kh = Number.isFinite(g.kh) ? g.kh : AnazhRealm.PLAYER_KH;
                d[row.dial] = (kh / AnazhRealm.PLAYER_KH - row.base) / row.mul;
            } else if (Number.isFinite(g[row.axis])) {
                d[row.dial] = (g[row.axis] - row.base) / row.mul;
            }
        }
        return d;
    }

    // koerper-core.bauMensch liefert den EINEN Teile-Baum, morphAuf trägt die Regler; der Stamm baut
    // keinen eigenen Körper, er hängt sein Rig an die GELENK-GRUPPEN des Baums. Rückgabe
    // { mesh, rig, kh, bones:[] }; mesh in Welt-Maß (f = 8·0.2125/6 je Lab-Einheit, Größe via charScale).
    _buildHumanoidRig(g) {
        // Template aus dem Mensch-Ofen (Foundry wie Kreatur/Pflanze, memo je Dials+Farben); der Körper ist
        // ein CLONE (Geometrien + Materialien geteilt). Signatur + Rückgabe bleiben stabil für
        // Animator/Equip/Werkstatt/Peers.
        if (typeof THREE === "undefined") return null;
        g = g || {};
        const kh = g.kh || AnazhRealm.PLAYER_KH;
        const oy = g.oy || 0;
        const core = typeof window !== "undefined" && window.__koerperCore;
        if (!core || typeof core.bauMensch !== "function" || typeof core.morphAuf !== "function") {
            this.log(
                "KÖRPER-KERN KALT: koerper-core.bauMensch fehlt — ohne Gesetzbuch kein Mensch (fail-closed).",
                "ERROR"
            );
            return null;
        }
        const dials = Object.assign({}, core.START_PARAMS || {}, g.bmDials || this._dialsAusGenom(g));
        // BOOT-LITERAL-ABSCHIED (18.07.): ohne explizite Guss-Farbe greift die
        // Anker-Palette des Gesetzbuchs (fail-closed — der Kern ist oben schon
        // als warm bewiesen, die Tabellen sind Vertragsfläche).
        const anker = this._menschAnkerFarben();
        if (!anker && (typeof g.skinColor !== "number" || typeof g.hairColor !== "number")) {
            this.log("KÖRPER-KERN ohne Paletten (SKIN_TONES/HAIR_COLORS) — fail-closed, kein Ersatz-Ton.", "ERROR");
            return null;
        }
        const skinCol = typeof g.skinColor === "number" ? g.skinColor : anker.skin;
        const hairCol = typeof g.hairColor === "number" ? g.hairColor : anker.hair;
        const t0 = this._ofenMenschTemplate(dials, skinCol, hairCol, 0, g.eigen === true);
        if (!t0 || !t0.teile || !t0.teile.mensch) {
            this.log("Mensch-Ofen fiel aus (kalter Kern?) — fail-closed, kein Ersatz-Körper.", "ERROR");
            return null;
        }
        const klon = t0.root.clone(true);
        const teile = {};
        klon.traverse((n) => {
            if ((n.isGroup || n.isBone) && n.name) teile[n.name] = n;
        });
        AnazhRealm._ofenKlonRebind(klon, teile);
        const f = (8 * AnazhRealm.PLAYER_KH) / 6.0;
        const wrap = new THREE.Group();
        wrap.scale.setScalar(f);
        wrap.position.y = oy;
        wrap.add(klon);
        wrap.userData._creatureSkin = true; // die 1st-Person-Regel deckt den GANZEN Leib (wie zuvor die Haut)
        wrap.userData.hautTon = skinCol; // die EINE Farb-Wahrheit für Leser (Band/Tint — Genom/Studio-Zahl)
        // Die Grobstufe aus derselben Pipe (lod 1, gelenkig — dasselbe Gesetz wie das Tier, `_gelenkGestalt`): unter
        // DEMSELBEN Wrap an die Knochen der feinen gebunden, Wurf und Stufen-Grenze aus der Kern-Zeile; fehlt sie, gibt
        // es keinen Menschen (fail-closed).
        const t1 = this._ofenMenschTemplate(dials, skinCol, hairCol, 1, g.eigen === true);
        const gelenk = this._gelenkGestalt(core, "koerper", wrap, klon, teile, t1);
        if (!gelenk) {
            this.log("Mensch: ohne gelenkige Grobstufe kein Körper (fail-closed).", "ERROR");
            return null;
        }
        wrap.userData._gelenk = gelenk;
        this._gelenkStufe(wrap, 0);
        // der Leib meldet sich bei seinen Vorlagen an (die Grenze des Ofen-Memos, `_ofenVorlage`)
        this._ofenVorlagenBinden(wrap, [t0, t1]);
        const P2 = (n2) => teile[n2] || null;
        const rig = {
            hips: teile.mensch,
            spine: P2("torso"),
            chest: P2("torso"),
            neck: P2("head"),
            head: P2("head"),
            armL: { shoulder: P2("arm1"), elbow: P2("elbow1"), wrist: P2("hand1") },
            armR: { shoulder: P2("arm-1"), elbow: P2("elbow-1"), wrist: P2("hand-1") },
            legL: { hip: P2("hip1"), knee: P2("knee1"), ankle: P2("ankle1") },
            legR: { hip: P2("hip-1"), knee: P2("knee-1"), ankle: P2("ankle-1") },
            // kh in BAUM-Einheiten: der Animator schreibt ·kh-Welt-Beträge auf Knoten
            // UNTER wrap(·f) — kh/f hält die Amplituden welt-gleich.
            kh: kh / f,
            _baum: true,
            _morphDials: dials,
            // Die Hand-Mitte je Handgelenk (Ofen-Beipack, Hand-Raum): dort sitzt der Griff der Faust (_refreshHeldMesh).
            // Eigenes Feld, nie in armL/armR — deren Glieder setzt die Pose je Schlüssel auf neutral.
            handMitte: t0.handMitte || null,
            _skinMat: null, // GEFALLEN mit dem Inline-Bau — die Farb-Wahrheit ist userData.hautTon (Pipe: Vertex-Farben)
        };
        // V18.491.85 — Augen-Welle: iris/lid aus Ofen-Gelenken (fail-closed ohne Refs).
        // Nicht MOTION_RIG_MAP — eigene Welle außerhalb der Knochen-Map.
        rig.irisL = P2("irisL");
        rig.irisR = P2("irisR");
        rig.lidTL = P2("lidTL");
        rig.lidTR = P2("lidTR");
        rig.lidBL = P2("lidBL");
        rig.lidBR = P2("lidBR");
        wrap.userData._leibNah = klon; // die Nah-Gestalt (die Masse misst ihre Haut, nie die Fern-Gestalt)
        return { mesh: wrap, rig, kh, bones: [] };
    }

    // DIE GELENK-GESTALT (S3, Lehre 19 — die Grobstufe ist gelenkig, das Standbild fiel an der Wurzel): EIN Wrap trägt
    // beide Klone; die Grobstufe (lod 1) bindet in der Ruhe-Pose an die Knochen der feinen — EIN Skelett je Gestalt (der
    // Ofen bindet jedes ihrer Teile, auch die starren mit Gewicht 1). Den Wurf liest sie aus der Kern-Zeile (`_ofenZeile`):
    // Stufe 0 wirft über `schatten` (1 = die Grobstufe ist ihr Zwilling), die Grobstufe wirft mit ihrem Teil `wurf.seh`,
    // jeder andere Teil nie; die Stufen-Grenze (`ab` × Größe, `hyst`) kommt aus derselben Zeile. Die Grobstufe ist Pflicht:
    // fehlt sie, ihre Zeile oder die Bindung eines Teils, schreit der Bau und liefert nichts (fail-closed).
    _gelenkGestalt(core, kind, wrap, klon, teile, t1) {
        const z0 = this._ofenZeile(core, kind, 0);
        const z1 = this._ofenZeile(core, kind, 1);
        const s1 = z1.zeile;
        if (!t1 || !t1.root || !z0.zeile || z1.stufe !== 1 || !s1 || !(s1.ab > 0) || !(z0.hyst > 0 && z0.hyst < 0.5)) {
            this.log(
                `GELENK-GESTALT ${kind}: die Grobstufe oder ihre Kern-Zeile (ab, hyst) fehlt — fail-closed`,
                "ERROR"
            );
            return null;
        }
        const fern = t1.root.clone(true);
        const seh = s1.wurf && Array.isArray(s1.wurf.seh) ? s1.wurf.seh : null;
        const meshes = [];
        const lose = [];
        fern.traverse((n) => {
            if (!n.isMesh) return;
            const namen = n.isSkinnedMesh ? n.userData.__skinJoints : null;
            if (!Array.isArray(namen) || !namen.length || namen.some((nm) => !teile[nm])) lose.push(n.name || n.type);
            n.castShadow = n.castShadow && s1.schatten === 1 && (!seh || seh.indexOf(n.userData.__seh) >= 0);
            meshes.push(n);
        });
        if (lose.length) {
            this.log(
                `GELENK-GESTALT ${kind}: ${lose.length} Teile der Grobstufe ohne Knochen der feinen — fail-closed`,
                "ERROR"
            );
            return null;
        }
        AnazhRealm._ofenKlonRebind(fern, teile); // EIN Skelett: die Grobstufe trägt die Knochen der feinen
        // EINE Körper-Kugel je Gestalt: die Grobstufe cullt (Bild und Kaskaden) gegen die Kugel der feinen — ihre eigene
        // (ohne die Fell-Schalen) ließ den Schweif im Gang hinaus (Pose-Probe gate:kreatur-kosten (R): 4 von 246 240).
        let kugel = null;
        klon.traverse((n) => {
            if (n.isMesh) n.castShadow = n.castShadow && z0.zeile.schatten === 0;
            if (!kugel && n.isSkinnedMesh && n.boundingSphere)
                kugel = n.boundingSphere.clone().applyMatrix4(n.matrixWorld);
        });
        const inv = new THREE.Matrix4();
        if (kugel)
            for (const m of meshes) m.boundingSphere = kugel.clone().applyMatrix4(inv.copy(m.matrixWorld).invert());
        wrap.add(fern);
        // DIE RUHE des Menschen: die Pose seiner Gelenke beim Bau (der Klon der Vorlage, die Ruhe-Pose des Ofens) —
        // jenseits der Grenze steht er in ihr (`_gelenkRuhe`). Das Tier ruht in der Kern-STAND_POSE (kein Satz nötig).
        const ruhe =
            kind === "kreatur"
                ? null
                : Object.keys(teile).map((nm) => {
                      const k = teile[nm];
                      return [k, k.position.clone(), k.quaternion.clone(), k.scale.clone()];
                  });
        return {
            nah: klon,
            fern,
            meshes,
            abM: s1.ab,
            hyst: z0.hyst,
            zwilling: z0.zeile.schatten === 1,
            istFern: true,
            // die Haltung steht fest (der Fall setzt sie, `_kreaturFaellt`): der Wechsel nach fern stellt nie in die Ruhe
            haltungFest: false,
            ruhe,
        };
    }

    // DER EINE STUFEN-SCHALTER der Gelenk-Gestalt (Tier, Mensch, Peer, Werkstatt): jenseits `ab` × Größe trägt die
    // Grobstufe das Bild, diesseits die feine — und die Grobstufe wirft als ihr Zwilling auf SHADOW_TWIN_LAYER (die
    // Haupt-Kamera sieht sie nie, die Kaskaden immer). Hysterese ±`hyst` (fern erst jenseits (1+h)·Grenze, zurück erst
    // innerhalb (1−h)·Grenze); geschaltet werden nur `visible` und die Ebenen, nur beim Wechsel. Jenseits ruht jeder Gang
    // (updateCreatures, der Peer-Tick, die Sicht-Kopie) außer dem eines laufenden Tiers (`_kreaturLaeuft`, Welle LF) —
    // der Wechsel nach fern stellt die Gestalt in ihre Ruhe (`_gelenkRuhe`), denn beide Stufen tragen dieselben Knochen;
    // eine Gestalt mit fester Haltung (`haltungFest`: der Gefallene, Welle LF kampf) bleibt in ihr. Rückgabe: fern?
    _gelenkStufe(gruppe, distSq) {
        const g = gruppe.userData._gelenk;
        const s = gruppe.scale.x || 1;
        const grenzSq = g.abM * g.abM * s * s;
        const h = g.hyst;
        const fern = !(distSq < grenzSq * (g.istFern ? (1 - h) * (1 - h) : (1 + h) * (1 + h)));
        if (fern !== g.istFern) {
            g.istFern = fern;
            g.nah.visible = !fern;
            g.fern.visible = fern || g.zwilling;
            // das Auge (Ebene 0) schaltet; den Wurf trägt die Wurf-Ebene, die `castShadow` schreibt (K72, `_wurfEbene`)
            const W = 1 << AnazhRealm.SHADOW_TWIN_LAYER;
            for (const m of g.meshes) m.layers.mask = ((fern ? 1 : 0) | (m.layers.mask & W)) >>> 0;
            // wer läuft, behält seinen Schritt (Welle LF, der ferne Gang: die Raten-Leiter wertet ihn jenseits weiter aus); eine
            // Gestalt, die ihre Haltung hält (`haltungFest`, gesetzt vom Fall `_kreaturFaellt`: die Tod-Lage rechnete mit ihr),
            // bleibt in ihr (Tod-Zensus „haltung": der stehend gefallene Hirsch drehte jenseits der Grenze legFL um 1,66 rad)
            if (fern && !g.haltungFest && !this._kreaturLaeuft(gruppe)) this._gelenkRuhe(gruppe);
        }
        return fern;
    }

    // DIE RUHE der Gelenk-Gestalt (S3): die Grobstufe hängt an den Knochen der feinen — wo der Gang ruht, stünde sie sonst
    // mitten im Schritt erstarrt (gate:kreatur-kosten (F): der ferne Mensch-Peer 0,454 rad, die Sicht-Kopie 1,064 rad). Das
    // Tier steht in der Kern-STAND_POSE (`_tierBaumNeutralStance`, dieselbe wie hinter der Anim-Leiter), der Mensch in der
    // Ruhe-Pose seiner Vorlage (die Pose, die das Standbild der Basis trug).
    _gelenkRuhe(gruppe) {
        const ruhe = gruppe.userData._gelenk.ruhe;
        if (!ruhe) return this._tierBaumNeutralStance(gruppe);
        for (const [k, p, q, s] of ruhe) {
            k.position.copy(p);
            k.quaternion.copy(q);
            k.scale.copy(s);
        }
    }

    // ═══ KÖRPER-BEWEGUNG — DIE GANG-GESETZE ═══
    // EINE kanonische Gang-Mathe für animatePlayerSoul, _p2pUpdatePeer und _animateHumanoidRig.
    // Rein RENDER-seitig — kein Snapshot-/Worker-/Sim-Pfad liest diese Zahlen.
    // Linse: gate:koerper-bewegung.

    // DAS EINE GANG-GESETZ DES ZWEIBEINERS (K07): Takt, Fußweg und Tastgrad aus tetrapoda `gangSchritt` — dieselbe Formel,
    // nach der die Tiere gehen — mit der Zweibeiner-Zeile fx.bewegung.gang; L = die GEBAUTE Beinlänge (einmal am Rig
    // vermessen, Welt-Maß aus der Gelenk-Skala). Die Phase bleibt weg-getrieben (2π je Doppelschritt Λ, ω = 2π·v/Λ).
    // Vorher eichte ein Faktor des Schritt-Blocks (4,0 × Bein ≈ 3,4 m je Schritt) den Takt auf 5,5 rad/s beim Basistempo:
    // beim Gehen 0,34 Schritte/s, zwei Schritt-Töne in sechs Sekunden, der Fuß glitt 130 % des Wegs.
    _gaitGesetz(rig, speed) {
        const core = typeof window !== "undefined" && window.__tetrapodaCore;
        if (!core || typeof core.gangSchritt !== "function")
            return AnazhRealm._kernPflichtBruch("tetrapoda:gangSchritt");
        const v = Number.isFinite(speed) && speed > 0 ? speed : 0;
        return core.gangSchritt(v, this._gaitBeinMass(rig).L, this._gangZeile(true));
    }
    // DIE ZEILE DES GANGS IN DER WELT (K07): das Gang-Gesetz misst Froude-Zahl und Becken an der Schwere der Welt
    // (`state.gravity`, die DSL setzt sie) — Mensch und Tier lesen sie aus EINER Zeile, Schritt und Becken aus derselben
    // (der Mensch: fx.bewegung.gang, das Tier: GANG_GESETZ). Vorher las der Schritt GANG_GESETZ.g, das Becken ein Literal
    // 9,81, und eine Welt mit anderer Schwere ging wie die Erde. Memo je Schwere und Block.
    _gangZeile(mensch) {
        const g = -this.state.gravity;
        const Z = AnazhRealm._bewegungsBlock("gang", AnazhRealm.GANG_FELDER);
        let m = this._gangZeileMemo;
        if (!m || m.g !== g || m.Z !== Z)
            m = this._gangZeileMemo = { g, Z, mensch: Object.assign({}, Z, { g }), tier: { g } };
        return mensch ? m.mensch : m.tier;
    }
    // Die Bein-Maße des Rigs, einmal vermessen: Ober- und Unterschenkel im Gelenk-Raum (l1, l2), die Welt-Skala der
    // Hüfte lotrecht (wpl) und längs (wz — das Becken des Menschen ist ungleich skaliert, 0,93 quer und längs: ein
    // Fußweg in Metern ist längs ein anderes Maß im Gelenk-Raum als lotrecht, sonst kurzt die Pose den Stand um 7 % und
    // der Fuß gleitet), die Beinlänge in Metern (L = (l1 + l2)·wpl — die L, an der das Gang-Gesetz die Schrittlänge misst).
    _gaitBeinMass(rig) {
        if (rig && rig._beinMass) return rig._beinMass;
        let l1 = 0,
            l2 = 0,
            wpl = 0,
            wz = 0;
        if (rig && rig.legL && rig.legL.hip && rig.legL.knee && rig.legL.ankle) {
            const sv = this._gaitTmpV || (this._gaitTmpV = new THREE.Vector3());
            rig.legL.hip.getWorldScale(sv);
            wpl = Math.abs(sv.y) || 1;
            wz = Math.abs(sv.z) || wpl;
            l1 = rig.legL.knee.position.length();
            l2 = rig.legL.ankle.position.length();
        }
        const M = { l1, l2, wpl, wz, L: (l1 + l2) * wpl };
        if (rig && M.L > 0.1) rig._beinMass = M;
        return M;
    }
    // POSEN-BLEND: w(speed) exp-geglättet statt hartem isMoving-Schnitt — Rampe 0.25→0.55 m/s, k=10,
    // plus harte ±0.2-Steilheits-Wand je Tick. NaN-Wände VOR dem Gedächtnis.
    _gaitBlendStep(wPrev, speed, dt) {
        const w0 = Number.isFinite(wPrev) ? Math.min(1, Math.max(0, wPrev)) : 0;
        const v = Number.isFinite(speed) && speed > 0 ? speed : 0;
        const ziel = Math.min(1, Math.max(0, (v - 0.25) / 0.3));
        const d = Number.isFinite(dt) && dt > 0 ? Math.min(0.1, dt) : 0.016;
        let dw = (ziel - w0) * (1 - Math.exp(-10 * d));
        if (dw > 0.2) dw = 0.2;
        else if (dw < -0.2) dw = -0.2;
        return w0 + dw;
    }
    // ZWEI-KNOCHEN-IK (Kosinussatz) in der Sagittal-Ebene; vor/unten = Ziel-Offset in l1/l2-Einheiten.
    // hip = rotation.x (negativ = Bein vor), knee ≥ 0 beugt NACH HINTEN. Ziel im Hüftpunkt oder außer
    // Reichweite → gestreckt Richtung Ziel, reached=false — nie NaN.
    _twoBoneIK(l1, l2, vor, unten) {
        const L1 = Number(l1);
        const L2 = Number(l2);
        if (!(L1 > 1e-6) || !(L2 > 1e-6)) return { hip: 0, knee: 0, reached: false };
        const dF = Number.isFinite(vor) ? vor : 0;
        const dU = Number.isFinite(unten) ? unten : 0;
        let d = Math.hypot(dF, dU);
        if (!(d > 1e-6)) return { hip: 0, knee: 0, reached: false }; // Ziel = Hüftpunkt
        const at = Math.atan2(dF, dU); // Ziel-Winkel von der Senkrechten (vorwärts positiv)
        if (d >= L1 + L2 - 1e-6) return { hip: -at, knee: 0, reached: false }; // außer Reichweite: gestreckt
        const minD = Math.abs(L1 - L2) + 1e-6;
        if (d < minD) d = minD;
        const cosK = Math.max(-1, Math.min(1, (L1 * L1 + L2 * L2 - d * d) / (2 * L1 * L2)));
        const knie = Math.PI - Math.acos(cosK);
        const cosG = Math.max(-1, Math.min(1, (L1 * L1 + d * d - L2 * L2) / (2 * L1 * d)));
        const hip = -(at + Math.acos(cosG));
        if (!Number.isFinite(hip) || !Number.isFinite(knie)) return { hip: 0, knee: 0, reached: false };
        return { hip, knee: knie, reached: true };
    }
    // (4) HANG-PITCH aus zwei Bodenproben (vorn/hinten). rotation.x-Konvention:
    // +x kippt die Nase ABWÄRTS ⇒ vorn höher → negativ (die Nase hebt sich).
    // Klemme ±GANG_DECKEL_RAD (0,6 rad, ~34°) — steiler ist Kletterwand, kein Gang (`_kreaturKletterwand`).
    _slopePitch(gVorn, gHinten, spann) {
        if (!Number.isFinite(gVorn) || !Number.isFinite(gHinten) || !(spann > 1e-3)) return 0;
        const p = Math.atan2(gHinten - gVorn, spann);
        const d = AnazhRealm.GANG_DECKEL_RAD;
        return Math.max(-d, Math.min(d, p));
    }
    // DER EINE GANG-TICK (Chokepoint Spieler + Peers): Weg-Phase am Halter akkumulieren, Blend-Gewicht
    // glätten, Amplitude mit dem Tempo skalieren (≈1 Basis, 1.3 Sprint). opts.ik=true rüstet Fuß-IK —
    // NUR der lokale Avatar (Budget); Peers tragen Blend + Weg-Takt ohne Boden-IK.
    _gaitTick(mesh, halter, speed, dt, opts) {
        const rig = mesh && mesh.userData && mesh.userData.rig;
        if (!rig || !halter) return null;
        const v = Number.isFinite(speed) && speed > 0 ? speed : 0;
        const d = Number.isFinite(dt) && dt > 0 ? dt : 0;
        const emoF = opts && Number.isFinite(opts.emoFaktor) && opts.emoFaktor > 0 ? opts.emoFaktor : 1;
        const gs = this._gaitGesetz(rig, v);
        const g =
            halter._gait || (halter._gait = { w: 0, amp: 1, ik: null, S: 0, tast: 0.5, auf: Math.PI, omega: 0, L: 0 });
        // DER STEHENDE FUSS HÄLT (K07, tetrapoda `gangPhaseHaelt`): ändert sich die Zeile (Tempo, Gangart, Emotion), setzt
        // sich die Phase so, dass das stehende Bein sein Fuß-Ziel behält; aus dem Stand (S0 = 0) setzt das nähere Bein in
        // der Mitte seines Stands ein (der Anlauf). Vorher lief die Phase weiter: der gelockte Fuß lag nach dem Tempo-Sprung
        // hinter dem Ziel des Laufs, das Becken reichte ihn nicht, der Lock löste (je 1 Löser bei 5,16 und 6,75 m/s).
        const S1 = gs.S / emoF;
        if (gs.omega > 0) {
            const steht = !(halter._gaitW > 0.05) || !(g.S > 0);
            const S0 = steht ? 0 : g.S;
            if (steht || Math.abs(S0 - S1) > 1e-9 || g.tast !== gs.tast)
                halter.walkPhase = window.__tetrapodaCore.gangPhaseHaelt(
                    Number.isFinite(halter.walkPhase) ? halter.walkPhase : 0,
                    S0,
                    g.tast,
                    S1,
                    gs.tast
                );
        }
        halter.walkPhase = (halter.walkPhase || 0) + d * gs.omega * emoF;
        halter._gaitW = this._gaitBlendStep(halter._gaitW, v, d);
        g.w = halter._gaitW;
        // das Fuß-Ziel des Gesetzes: der Fußweg im Stand (die Emotion reist als Kadenz — bei gleichem Weg kürzt sie den
        // Schritt, der Fuß im Stand bleibt stehen), der Tastgrad, die Phase des Aufsetzens (2π·(1 − Tastgrad)), die Beinlänge
        g.S = S1;
        g.tast = gs.tast;
        g.hub = gs.hub;
        g.auf = 2 * Math.PI * (1 - gs.tast);
        g.omega = gs.omega * emoF;
        g.L = this._gaitBeinMass(rig).L;
        // ZWILLINGS-ABSCHIED (19.07.): der „|| 6"-Nebenzwilling fiel — der
        // Falsy-Arm (nur vor der Boot-Eichung erreichbar) liest die Eichungs-
        // Wahrheit selbst (fail-closed via _bewegungsKoeff, kurzgeschlossen).
        const vRef = Math.max(
            1,
            Number(this.state.speed) ||
                AnazhRealm._bewegungsKoeff("speed").base + AnazhRealm._bewegungsKoeff("speed").leicht
        );
        g.amp = Math.max(0.7, Math.min(1.3, 0.55 + 0.45 * (v / vRef)));
        g.ik = opts && opts.ik ? this._gaitIKPrep(mesh, opts.soleY, opts.yaw) : null;
        // ohne Boden-IK (Luft, Peer) löst jeder Fuß-Lock — die Landung friert die Stand-Füße frisch ein
        const ikC = !g.ik && mesh.userData && mesh.userData._gaitIK;
        if (ikC) ikC.lockL.on = ikC.lockR.on = false;
        return g;
    }
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
    // DER STAND-LESER DER SICHT (Q4 Erdung, Entscheid a der Leben-Synthese): die Sim steht auf dem Gesetz, die Sicht auf
    // dem, was das Auge sieht. Steht der Körper auf einem Bauwerk (`struktur`), trägt dessen Oberkante (eben per
    // Definition); sonst die Boden-Karte (`_bodenSichtAt`, bilinear, das gezeichnete Mesh) — solange sie im
    // STAND_SICHT_BAND um den Träger liegt. Außerhalb (Höhle, Überhang: die Karte trägt die Oberkante der Säule) liest er das
    // GESETZ AM PUNKT — den Boden unter dem Körper ab dem Träger (`_koerperBodenUnter`: abwärts, der Hang zwei Meter hinauf),
    // im selben Band. Prüfung 2 K02a: dort trug der Träger JEDEN Punkt — die Pfoten des Wolfs am Wandfuß standen auf der
    // Höhe seines Leibs, nicht auf dem Boden unter ihnen (die Haut 0,30–0,46 m im Fels in 5 von 8 Blickrichtungen), und der
    // in die Wand laufende Wolf stand auf seinem 0,5-m-Grund-Cache 0,55 m unter dem Hang. Die Kosten folgen den Körpern
    // unter Fels (nur dort tastet das Feld); ohne Karte (fern, ungebaut) trägt der Träger. Leser: Fuß-IK des Menschen
    // (`_gaitBodenY`) und des Tiers (`_kreaturFussBoden`), Tier-Lage (`_creatureSlopeProben`, die Mitte im Frame-Takt), der
    // Stoß-Schritt, die Tod-Lage. Die Karte am Punkt liest `_bodenSichtAt` (am Chunk-Rand die des Nachbarn).
    _standSicht(x, z, traegerY, struktur) {
        if (struktur === true) return traegerY;
        const k = this._bodenSichtAt(x, z);
        if (!Number.isFinite(traegerY)) return Number.isFinite(k) ? k : NaN;
        const band = AnazhRealm.STAND_SICHT_BAND;
        if (!Number.isFinite(k)) return traegerY;
        if (Math.abs(k - traegerY) <= band) return k;
        const g = this._koerperBodenUnter(x, traegerY, z);
        return Number.isFinite(g) && Math.abs(g - traegerY) <= band ? g : traegerY;
    }
    // Der Boden unterm Fuß — der EINE Proben-Chokepoint des Biped-IK: der Stand-Leser der Sicht um den TRÄGER desselben
    // Kapsel-Schritts (`_stepCharacter` stempelt `_kapselTraegerY`/`_kapselStruktur`). Vorher las die Probe das Gelände
    // (`getTerrainHeightAt`): auf dem Haus-Podest zog die Fuß-IK Becken und Sohlen 0,25 m ins Podest, in jeder Höhle
    // stand die Probe auf der Wiese darüber und die IK schwieg (Leben-Prüfung N-D1, Kritik §2.1). Ohne Träger (in der Luft)
    // NaN — keine IK.
    _gaitBodenY(x, z) {
        const s = this.state;
        return this._standSicht(x, z, s._kapselTraegerY, s._kapselStruktur);
    }
    // Die Bodenprobe je Frame: der Stand-Leser ist eine Karten-Lesung (bilinear), kein Feld-Scan — der Fuß, der auf ein
    // Podest tritt, liest es im selben Frame (der frühere 0,3-m-Cache hielt den alten Boden).
    _gaitProbe(p, x, z) {
        const g = this._gaitBodenY(x, z);
        p.x = x;
        p.z = z;
        p.g = Number.isFinite(g) ? g : NaN;
    }
    // Fuß-IK-Kontext, einmal vermessen: Segment-Längen aus Gelenk-Offsets × Welt-Skala, Knöchel→Sohle
    // aus der Neutral-Pose. Fehlende Gelenke / ungebauter Chunk → null (kein IK diesen Frame).
    _gaitIKPrep(mesh, soleY, yaw) {
        const r = mesh && mesh.userData && mesh.userData.rig;
        if (!r || !Number.isFinite(soleY)) return null;
        const L = r.legL;
        const R = r.legR;
        if (!L || !R || !L.hip || !L.knee || !L.ankle || !R.hip || !R.knee || !R.ankle || !r.hips) return null;
        let ik = mesh.userData._gaitIK;
        if (!ik) {
            const tv = this._gaitTmpV || (this._gaitTmpV = new THREE.Vector3());
            L.hip.getWorldScale(tv);
            const wpl = Math.abs(tv.y) || 0;
            const wz = Math.abs(tv.z) || wpl;
            const l1 = L.knee.position.length() * wpl;
            const l2 = L.ankle.position.length() * wpl;
            if (!(l1 > 0.02) || !(l2 > 0.02)) return null;
            L.ankle.getWorldPosition(tv);
            const soleH = Math.max(0, tv.y - soleY);
            ik = mesh.userData._gaitIK = {
                l1,
                l2,
                wpl,
                wz,
                soleH,
                hang: 0,
                soleY: 0,
                yaw: 0,
                probeL: { x: NaN, z: NaN, g: NaN },
                probeR: { x: NaN, z: NaN, g: NaN },
                lockL: { on: false, x: 0, z: 0 },
                lockR: { on: false, x: 0, z: 0 },
                footL: { x: mesh.position.x, z: mesh.position.z },
                footR: { x: mesh.position.x, z: mesh.position.z },
            };
        }
        ik.soleY = soleY;
        ik.yaw = Number.isFinite(yaw) ? yaw : 0;
        this._gaitProbe(ik.probeL, ik.footL.x, ik.footL.z);
        this._gaitProbe(ik.probeR, ik.footR.x, ik.footR.z);
        if (!Number.isFinite(ik.probeL.g) || !Number.isFinite(ik.probeR.g)) return null;
        // leichte RUMPF-Neigung am Hang: die Fuß-Proben entlang der Blick-
        // Achse tragen die Steigung (exp-geglättet; Füße beisammen → 0).
        const sep = (ik.footL.x - ik.footR.x) * Math.sin(ik.yaw) + (ik.footL.z - ik.footR.z) * Math.cos(ik.yaw);
        let ziel = 0;
        if (Math.abs(sep) > 0.15) {
            ziel =
                sep > 0
                    ? this._slopePitch(ik.probeL.g, ik.probeR.g, Math.abs(sep))
                    : this._slopePitch(ik.probeR.g, ik.probeL.g, Math.abs(sep));
        }
        ik.hang += (ziel - ik.hang) * 0.12;
        if (!Number.isFinite(ik.hang)) ik.hang = 0;
        return ik;
    }
    // FUSS-IK + FOOT-LOCK, NACH der Posen-Blende: Becken senkt sich aufs tiefere Bein, der Stance-Fuß
    // lockt an seiner gecachten Boden-Position (Two-Bone-IK), der Rumpf lehnt in den Hang; das
    // Schwung-Bein bleibt Pose. Der Lock löst, sobald das Ziel die Reichweite verlässt (kein Spagat/Pop).
    _gaitApplyFussIK(r, walkPhase, w, ik) {
        const dyL = Math.max(-0.7, Math.min(0.7, ik.probeL.g - ik.soleY));
        const dyR = Math.max(-0.7, Math.min(0.7, ik.probeR.g - ik.soleY));
        // Becken: nur SENKEN (das tiefere Bein muss reichen; heben macht die Physik).
        let drop = Math.min(dyL, dyR, 0) * 0.9;
        const reach = ik.l1 + ik.l2;
        if (drop < -0.3 * reach) drop = -0.3 * reach;
        if (drop < -0.005 && r.hips && ik.wpl > 0) r.hips.position.y += drop / ik.wpl;
        if (r.spine) r.spine.rotation.x += ik.hang * 0.35;
        // der Stand jedes Beins kommt aus dem Gang-Gesetz (die Pose dieses Takts, _animateHumanoidRig)
        const st = r._gangStand;
        const standL = !st || st[0],
            standR = !st || st[1];
        // DER ROLLENDE FUSS (tetrapoda gangRolle, die Pose dieses Takts): der Lock hält den Fuß, wie er aufsetzte; im späten
        // Stand steht sein Knöchel um heb höher und um dx (im Fußweg) weiter vorn — der Ballen bleibt, wo er stand
        const rolle = r._gangRoll || [null, null];
        // EINE SCHWELLE (K07): R (`_gaitReich`) führt das Becken des Gesetzes und hält den stehenden Fuß. Liegt ein
        // gelockter Fuß jenseits von R (der Boden der Probe weicht vom Ruhe-Maß der Pose ab — die Verhältnisse 0,9951 bis
        // 0,9969 lösten 3 von 213 Stand-Takten beim Gehen), senkt sich das Becken um den Fehlbetrag; der Lock löst nur, wo
        // auch das nicht reicht (vorn/hinten jenseits von R oder mehr als 0,05 Bein — Stufe, Kante: dort tritt der Fuß).
        if (w >= 0.35 && r.hips && ik.wpl > 0) {
            let mehr = Math.max(
                standL && ik.lockL.on ? this._gaitLockBedarf(r.legL, ik, ik.probeL, ik.lockL, rolle[0]) : 0,
                standR && ik.lockR.on ? this._gaitLockBedarf(r.legR, ik, ik.probeR, ik.lockR, rolle[1]) : 0
            );
            if (mehr > 0 && mehr <= 0.05 * (ik.l1 + ik.l2)) r.hips.position.y -= mehr / ik.wpl;
        }
        this._gaitLegIK(r.legL, ik, ik.probeL, ik.lockL, ik.footL, standL, w, rolle[0]);
        this._gaitLegIK(r.legR, ik, ik.probeR, ik.lockR, ik.footR, standR, w, rolle[1]);
    }
    // Der Fehlbetrag eines gelockten Fußes an R: wie weit das Becken sinken muss, damit die Kette ihn erreicht (0 = er
    // liegt in R; Infinity = er liegt vorn/hinten jenseits von R, kein Senken hilft).
    _gaitLockBedarf(leg, ik, probe, lock, rolle) {
        const hv = this._gaitTmpV2 || (this._gaitTmpV2 = new THREE.Vector3());
        leg.hip.getWorldPosition(hv);
        const rx = rolle && rolle.roll > 0 ? rolle.rollDx * ik.wpl : 0,
            ry = rolle && rolle.roll > 0 ? rolle.heb * ik.wpl : 0;
        const vor =
            ((lock.x - hv.x) * Math.sin(ik.yaw) + (lock.z - hv.z) * Math.cos(ik.yaw)) * (ik.wpl / (ik.wz || ik.wpl)) +
            rx;
        const unten = hv.y - (probe.g + ik.soleH) - ry;
        const R = AnazhRealm._gaitReich(ik.l1 + ik.l2);
        if (!Number.isFinite(unten) || Math.abs(vor) >= R) return Infinity;
        return Math.max(0, unten - Math.sqrt(R * R - vor * vor));
    }
    _gaitLegIK(leg, ik, probe, lock, foot, imStand, w, rolle) {
        const av = this._gaitTmpV || (this._gaitTmpV = new THREE.Vector3());
        leg.ankle.getWorldPosition(av); // FK nach Pose+Becken (frische Ahnen-Matrizen)
        foot.x = av.x;
        foot.z = av.z;
        const geht = w >= 0.35;
        const stance = geht ? imStand : true; // Idle: beide Füße geplantet
        if (!stance) {
            lock.on = false;
            return; // Schwung-Bein: die Pose bleibt (nur die Stance ankert)
        }
        let tx = foot.x;
        let tz = foot.z;
        if (geht) {
            if (!lock.on) {
                lock.on = true; // Stance-Beginn: den Fuß-Weltpunkt EINMAL einfrieren
                lock.x = foot.x;
                lock.z = foot.z;
            }
            tx = lock.x;
            tz = lock.z;
        } else if (Math.abs(probe.g - ik.soleY) < 0.03) {
            return; // ebener Boden im Stand: die Kontrapost-Pose bleibt byte-alt
        }
        const hv = this._gaitTmpV2 || (this._gaitTmpV2 = new THREE.Vector3());
        leg.hip.getWorldPosition(hv);
        // der Vorlauf längs in das lotrechte Maß der Kette (das Becken ist längs ungleich skaliert, _gaitBeinMass)
        // der rollende Fuß im Gang (rolle aus der Pose): der Knöchel über dem gehaltenen Ballen, die Sohle gekippt
        const rollt = geht && rolle && rolle.roll > 0;
        const vor =
            ((tx - hv.x) * Math.sin(ik.yaw) + (tz - hv.z) * Math.cos(ik.yaw)) * (ik.wpl / (ik.wz || ik.wpl)) +
            (rollt ? rolle.rollDx * ik.wpl : 0);
        const unten = hv.y - (probe.g + ik.soleH) - (rollt ? rolle.heb * ik.wpl : 0);
        if (!(unten > 0.05)) {
            lock.on = false;
            return; // Boden über der Hüfte (Klippe/ungebaut) — NaN-Wand
        }
        if (geht && Math.hypot(vor, unten) > AnazhRealm._gaitReich(ik.l1 + ik.l2) + 1e-6) {
            lock.on = false;
            return; // das Ziel entläuft der Reichweite → Lock löst, die Pose übernimmt
        }
        const res = this._twoBoneIK(ik.l1, ik.l2, vor, unten);
        leg.hip.rotation.x = res.hip;
        leg.knee.rotation.x = res.knee;
        leg.ankle.rotation.x = (rollt ? rolle.roll : 0) - (res.hip + res.knee); // die Sohle bleibt eben, der rollende Fuß kippt
    }

    _animateHumanoidRig(rig, t, walkPhase, isMoving, underwater, emotions, gait) {
        if (!rig) return;
        const r = rig;
        const z = (b, v) => {
            if (b) b.rotation.z = v;
        };
        const x = (b, v) => {
            if (b) b.rotation.x = v;
        };
        // alles zuerst auf neutral (absolut → kein Drift zwischen Posen)
        for (const b of [r.hips, r.spine, r.chest, r.neck, r.head]) if (b) b.rotation.set(0, 0, 0);
        for (const side of [r.armL, r.armR, r.legL, r.legR])
            for (const k in side) if (side[k]) side[k].rotation.set(0, 0, 0);
        if (underwater) {
            // Schwimm-Pose: Körper waagerecht (group-Lehne in _animateHuman); hier kraulen die Arme, flattern
            // die Beine, der Kopf hebt leicht. Die Kraul-Winkel wohnen in fx.bewegung.schwimmen.pose.
            const SP = AnazhRealm._schwimmGesetz().pose;
            x(r.head, SP.kopf);
            const aA = isMoving ? SP.armZug : SP.armTreten;
            x(r.armL.shoulder, Math.sin(walkPhase) * aA - SP.armAb);
            x(r.armR.shoulder, Math.sin(walkPhase + Math.PI) * aA - SP.armAb);
            z(r.armL.shoulder, SP.armSpreiz);
            z(r.armR.shoulder, -SP.armSpreiz);
            const kA = isMoving ? SP.beinZug : SP.beinTreten;
            x(r.legL.hip, Math.sin(walkPhase * SP.beinTakt) * kA);
            x(r.legR.hip, Math.sin(walkPhase * SP.beinTakt + Math.PI) * kA);
            return;
        }
        // POSEN-BLEND: BEIDE Posen gerechnet und ADDITIV über das Null-Reset gelerpt (Ruhe ×(1−w) +
        // Gehen ×w) — kein Plopp an der Schwelle. Aufrufer ohne gait: w = isMoving ? 1 : 0.
        // Die Walk-Amplitude skaliert mit dem Tempo (gait.amp).
        const w = gait && Number.isFinite(gait.w) ? Math.max(0, Math.min(1, gait.w)) : isMoving ? 1 : 0;
        const amp = gait && Number.isFinite(gait.amp) ? Math.max(0.5, Math.min(1.6, gait.amp)) : 1;
        const add = (b, ax, v) => {
            if (b && v) b.rotation[ax] += v;
        };
        if (w < 0.999) {
            // ── RUHE ×(1−w) — Kontrapost (Standbein R): Hüfte kippt, Wirbelsäule lehnt gegen, Kopf zurück.
            // Das koerper-fx.motion-Profil (über die EINE Emotions-Brücke) führt Atem (breath/freq, auf das
            // Lab-idle normalisiert) und Emotions-POSE (MOTION_RIG_MAP-Deltas relativ zum Lab-idle, inkl.
            // headY·spineY·hipLZ/hipRZ). Kaltes Buch → mp null → Host-Konstanten. Der Rig LIEST nur Studio-Zahlen.
            const wi = 1 - w;
            const mp = this._koerperMotionProfile(false, emotions);
            const mref = mp ? this._koerperMotionProfile(false, null) : null;
            const bAmp =
                mp && mref && Number.isFinite(mp.breath) && mref.breath > 0 ? 0.02 * (mp.breath / mref.breath) : 0.02;
            const bRate = mp && mref && Number.isFinite(mp.freq) && mref.freq > 0 ? 1.6 * (mp.freq / mref.freq) : 1.6;
            const breath = Math.sin(t * bRate) * bAmp;
            add(r.spine, "z", 0.1 * wi); // Oberkörper lehnt zur Standbein-Seite
            add(r.chest, "z", -0.06 * wi); // Brust-Gegenkipp
            add(r.neck, "z", 0.05 * wi); // Kopf wieder aufrecht (krönt die S-Kurve)
            add(r.spine, "x", (-0.02 + breath) * wi); // sanfter Atem
            // Spielbein (L) leicht gebeugt + vorgestellt, Standbein (R) gestreckt
            add(r.legL.hip, "x", 0.08 * wi);
            add(r.legL.knee, "x", 0.16 * wi); // Knie beugt nach hinten (menschlich, + wie Walk/Sitz)
            add(r.legR.knee, "x", 0.04 * wi);
            // Arme ADDUZIERT aus der A-Pose-Spreizung an den Körper, mit LUFT zum Rumpf
            // (sonst presst der Arm eine Kontakt-FALTE in den Torso = ein „Riss").
            add(r.armL.shoulder, "z", -0.19 * wi);
            add(r.armR.shoulder, "z", 0.17 * wi);
            add(r.armL.elbow, "x", -0.18 * wi); // sanfte Ellbogen-Beuge
            add(r.armR.elbow, "x", -0.1 * wi);
            // Die Emotions-Pose als DATEN-Deltas (mp === mref am Neutralpunkt → Schleife
            // trägt Nullen → byte-alt; mp/mref sind dieselbe Preset-Referenz bei "idle").
            // V18.491.142 KPMUL_VIS α-path; kpMul>=1 byte-alt instant; tetrapoda .81 sibling.
            const kpMul = mp && Number.isFinite(Number(mp.kpMul)) ? Number(mp.kpMul) : 1;
            const dtK = r._kpmulT != null ? Math.max(0, Math.min(0.08, t - r._kpmulT)) : 0;
            r._kpmulT = t;
            if (mp && mref && mp === mref) r._kpmulAcc = null;
            if (mp && mref && mp !== mref) {
                if (!r._kpmulAcc) r._kpmulAcc = Object.create(null);
                const a = kpMul >= 0.999 || dtK <= 0 ? 1 : 1 - Math.exp(-Math.max(18, 55 * kpMul) * dtK);
                for (const row of AnazhRealm.MOTION_RIG_MAP) {
                    const dv = ((Number(mp[row.key]) || 0) - (Number(mref[row.key]) || 0)) * wi;
                    const accKey = row.key + "." + row.axis;
                    const prev = r._kpmulAcc[accKey] || 0;
                    const out = prev + (dv - prev) * a;
                    r._kpmulAcc[accKey] = out;
                    if (!out) continue;
                    const seg = row.bone.split(".");
                    const bone = seg.length === 2 ? r[seg[0]] && r[seg[0]][seg[1]] : r[seg[0]];
                    if (bone && bone.rotation) bone.rotation[row.axis] += out * row.mul;
                }
            }
            // BODY-WELLE (18.491.86) — Lab Root-Pitch/Roll + Mikro-Sway → Host hips.
            // Nicht MOTION_RIG_MAP (kein Knochen-Gap; Überlapp Kontrapost bewusst klein halten).
            if (r.hips && mp) {
                const m0 = mref || mp;
                const dX = ((Number(mp.bodyX) || 0) - (Number(m0.bodyX) || 0)) * wi;
                const dZ = ((Number(mp.bodyZ) || 0) - (Number(m0.bodyZ) || 0)) * wi;
                add(r.hips, "x", dX);
                add(r.hips, "z", dZ);
                // Mikro-Sway: absolute Amp wie Lab e.sway (idle bleibt fühlbar; mp===mref → nur sway)
                const swayA = Number.isFinite(mp.sway) ? mp.sway : 0.022;
                add(r.hips, "z", Math.sin(t * 1.1) * swayA * wi);
                add(r.hips, "x", Math.sin(t * 0.7) * swayA * 0.35 * wi);
            }
            // V18.491.142 KPMUL_VIS.host=map-alpha — map-α reads kpMul; still no MOTION_RIG_MAP kpMul row (Vertrag .87 Map-Verbot).
        }
        // DIE BEINE AUF DAS ZIEL DES GESETZES (K07): jeder Fuß folgt tetrapoda `gangFuss` — im Stand wandert er am Boden
        // mit genau dem Tempo des Leibs zurück (er steht in der Welt), im Schwung kehrt er gehoben nach vorn —, Hüfte, Knie
        // und Knöchel stellt die Zwei-Knochen-IK auf dieses Ziel (die Sohle bleibt eben). Das Becken trägt tetrapoda
        // `gangBecken` (dasselbe im Körper-Studio): nur die STEHENDEN Füße senken es, an der Reichweite R, an der die Fuß-IK
        // den stehenden Fuß hält (`_gaitReich`, EINE Schwelle); der Schwung-Fuß faltet sich unter R (vorher zog er das
        // Becken über beide Füße hinab: im Lauf 46 cm, an der Spitze 77 cm). Derselbe Pfad trägt den lokalen Avatar, den
        // Peer und jeden Bewohner mit Rig; vorher schwangen die Beine ±0,5 rad als Sinus um einen 3,4-m-Schritt.
        const S = w > 0.001 && gait && gait.S > 0 ? gait.S : 0;
        const M = S > 0 ? this._gaitBeinMass(r) : null;
        let sw = Math.sin(walkPhase);
        r._gangSenke = 0;
        if (r._gangStand) r._gangStand[0] = r._gangStand[1] = true; // ohne Gesetzes-Pose stehen beide Füße
        if (r._gangRoll) r._gangRoll[0] = r._gangRoll[1] = null; // ohne Gesetzes-Pose steht die Sohle flach
        if (M && M.l1 > 0 && M.l2 > 0) {
            const core = window.__tetrapodaCore;
            const Z = this._gangZeile(true);
            const tast = gait.tast;
            const Sl = S / M.wz; // der Fußweg längs, im Gelenk-Raum
            const hubL = (gait.hub * M.L) / M.wpl;
            const L12 = M.l1 + M.l2;
            const R = AnazhRealm._gaitReich(L12);
            // der Fuß rollt im späten Stand über den Ballen (tetrapoda gangRolle): sein Knöchel steigt um heb, die Sohle
            // kippt um roll — die Fuß-IK hält den Ballen, nicht die Ferse (`_gaitLegIK`, `r._gangRoll`)
            const FL = core.gangFuss(walkPhase, Sl, tast, Z, R);
            const FR = core.gangFuss(walkPhase + Math.PI, Sl, tast, Z, R);
            const roll = r._gangRoll || (r._gangRoll = [null, null]);
            roll[0] = FL;
            roll[1] = FR;
            // die Senke im Gelenk-Raum über der gestreckten Kette (die Schwere der Zeile im lotrechten Gelenk-Maß)
            const tief = L12 - R + core.gangBecken(walkPhase, Sl, tast, R, gait.omega, Z, M.wpl);
            r._gangSenke = tief;
            const auf = 2 * Math.PI * (1 - tast);
            const u = (p) => ((p % (2 * Math.PI)) + 2 * Math.PI) % (2 * Math.PI);
            r._gangStand = r._gangStand || [false, false];
            r._gangStand[0] = u(walkPhase) >= auf;
            r._gangStand[1] = u(walkPhase + Math.PI) >= auf;
            // der Fuß unter der Hüfte: gehoben um seinen Hub, nie jenseits von R (der Schwung-Fuß faltet sich)
            const unten = (F, h) => Math.min(L12 - tief - h, Math.sqrt(Math.max(0, R * R - F.dz * F.dz)));
            const ikL = this._twoBoneIK(M.l1, M.l2, FL.dz, unten(FL, FL.hub * hubL + FL.heb));
            const ikR = this._twoBoneIK(M.l1, M.l2, FR.dz, unten(FR, FR.hub * hubL + FR.heb));
            add(r.legL.hip, "x", ikL.hip * w);
            add(r.legL.knee, "x", ikL.knee * w);
            add(r.legL.ankle, "x", (FL.roll - ikL.hip - ikL.knee) * w);
            add(r.legR.hip, "x", ikR.hip * w);
            add(r.legR.knee, "x", ikR.knee * w);
            add(r.legR.ankle, "x", (FR.roll - ikR.hip - ikR.knee) * w);
            // das Bein-Signal für Arme und Becken: −1, wenn das linke Bein vorn steht (Arm L schwingt gegen Bein L)
            sw = Math.max(-1, Math.min(1, (FR.dz - FL.dz) / Sl));
        }
        if (w > 0.001) {
            // ── GEHEN ×w — Arme gegen die Beine, Becken-Roll/Yaw + Brust-Gegendreh im Takt des Bein-Signals.
            const wa = w * amp;
            // Arme gegen die Beine (Arm L mit Bein R)
            add(r.armL.shoulder, "x", -0.4 * sw * wa);
            add(r.armR.shoulder, "x", 0.4 * sw * wa);
            add(r.armL.elbow, "x", (-0.3 - 0.2 * Math.max(0, -sw) * amp) * w);
            add(r.armR.elbow, "x", (-0.3 - 0.2 * Math.max(0, sw) * amp) * w);
            // Rumpf-Roll/Yaw über dem Becken + Brust-Gegendreh: das Becken trägt die Beine und dreht nicht mit (eine
            // Becken-Drehung schwenkte die Bein-Kette um die Hüfte, der Stand-Fuß glitt 8 cm je Schritt seitlich)
            add(r.spine, "z", 0.05 * sw * wa);
            add(r.spine, "y", 0.07 * sw * wa);
            add(r.chest, "y", -0.06 * sw * wa);
        }
        // Die Becken-Senke des Gangs — absolut über der EINMAL gecachten Basis;
        // ×w: sie klingt beim Stopp aus, statt eingefroren stehenzubleiben.
        if (r.hips) {
            if (r._baseHipY == null) r._baseHipY = r.hips.position.y;
            r.hips.position.y = r._baseHipY - r._gangSenke * w;
        }
        // ═══ KÖRPER-BEWEGUNG (3) — Fuß-IK/Foot-Lock/Becken/Hang-Lehne (nur mit
        // gerüstetem Kontext = der lokale Avatar; s. _gaitTick Budget-Disziplin).
        if (gait && gait.ik) this._gaitApplyFussIK(r, walkPhase, w, gait.ik);
        // V18.491.85 — Augen-Welle außerhalb MOTION_RIG_MAP (irisSpeed/blinkRate).
        this._animateHumanoidAugen(r, t, emotions);
    }

    // V18.491.85 — Augen-Welle: Ofen-Joints iris/lid aus koerper-MOTION (außerhalb Map).
    // Fail-closed ohne Refs; Idle erlaubt schwachen Blink (Lab-idle blinkRate).
    // V18.491.131 AUGEN_VIS.host=noise-iris
    _animateHumanoidAugen(rig, t, emotions) {
        if (!(rig && (rig.irisL || rig.irisR || rig.lidTL || rig.lidTR))) return;
        const mp = this._koerperMotionProfile(false, emotions);
        if (!mp) return;
        const blinkRate = Math.max(0.1, Number(mp.blinkRate) || 0.5);
        if (rig._lidBaseY == null) {
            const sample = rig.lidTL || rig.lidTR;
            rig._lidBaseY = sample && sample.scale ? sample.scale.y : 0.35;
        }
        // Deterministisch: Periode aus blinkRate (Lab-Mitte ~1.0/rate), Pulse ~0.09s.
        const period = 1.0 / blinkRate;
        const phase = ((t % period) + period) % period;
        const blinkDur = 0.09;
        let open = 1.0;
        if (phase < blinkDur) {
            const bf = phase / blinkDur;
            // Lab-Form: zu → 0.3 → auf; open 1→0.3→1
            open = bf < 0.45 ? 1.0 - (bf / 0.45) * 0.7 : 0.3 + ((bf - 0.45) / 0.55) * 0.7;
        }
        const lidY = rig._lidBaseY * open; // offen≈base, zu≈0.3*base
        if (rig.lidTL && rig.lidTL.scale) rig.lidTL.scale.y = lidY;
        if (rig.lidTR && rig.lidTR.scale) rig.lidTR.scale.y = lidY;
        const irisSpeed = Number.isFinite(mp.irisSpeed) ? mp.irisSpeed : 0.3;
        if (rig.irisL && !rig._irisBaseL && rig.irisL.position) {
            rig._irisBaseL = rig.irisL.position.clone();
        }
        if (rig.irisR && !rig._irisBaseR && rig.irisR.position) {
            rig._irisBaseR = rig.irisR.position.clone();
        }
        const ox = Math.sin(t * (2 + irisSpeed * 2)) * 0.003;
        const oy = Math.sin(t * (1.6 + irisSpeed * 1.6) + 1.7) * 0.002;
        if (rig.irisL && rig._irisBaseL) {
            rig.irisL.position.set(rig._irisBaseL.x + ox, rig._irisBaseL.y + oy, rig._irisBaseL.z);
        }
        if (rig.irisR && rig._irisBaseR) {
            rig.irisR.position.set(rig._irisBaseR.x + ox, rig._irisBaseR.y + oy, rig._irisBaseR.z);
        }
    }

    // ABSCHIEDS-WELLE (Koerper-Dock A2) — DIE EINE KREATUR-DIAL-QUELLE: liest die fünf
    // allometrischen Dials einer tetrapoda-Gattung LIVE (f.recipes[id].s — das
    // `_klangStudioPreset`-Muster). Fail-soft: kaltes Buch/fremder kind → null.
    _tetrapodaStudioDials(recId) {
        const f = this._foundry;
        const rec = f && f.recipes ? f.recipes[recId] : null;
        // WELCHES Rezept eine Seele liest, pinnt TETRAPODA_SOUL_MAP (Daten) — hier nur
        // die Form-Wache (must-ignore, kein kind-Literal: das klang-Leser-Muster).
        const s = rec && rec.s && typeof rec.s === "object" ? rec.s : null;
        // STUDIO-ÜBERGABE = VORRANG-Quelle je Gattung: validiert am EINEN Empfänger _studioUebergabeEmpfang,
        // mischen die fünf allometrischen Dials ÜBER das Buch. Beide Konsumenten folgen: _ofenKreaturDials
        // (Memo-Key trägt die Dials) und _tetrapodaSoulParts. Nur KÜNFTIGE Spawns lesen hier; bestehende
        // Kreaturen bleiben wie gegossen.
        const ue = this.state && this.state.studioUebergabe && this.state.studioUebergabe.kreatur;
        const ueS = ue && ue[recId] && ue[recId].s;
        if (ueS && typeof ueS === "object") return Object.assign({}, s || {}, ueS);
        return s;
    }
    // ═══ DER KREATUR-OFEN ═══
    // Die Gattung reist als ASSET durch dieselbe Foundry wie die Pflanzen (BAKERS_BY_KIND.kreatur, Worker
    // UND hier); der Stamm assembliert via _foundryBuildMesh und memoiert je Art+Dials+Stufe → jede
    // Kreatur ist ein Template-CLONE. _ofenKreaturDials: TETRAPODA_SOUL_MAP = welches Rezept,
    // TETRAPODA_DIAL_MAP = wie; tag-neutral (nur Längen/Positionen). null → Modul-bodyParts bleiben.
    _ofenKreaturDials(recId, ovOpt) {
        const core = typeof window !== "undefined" && window.__tetrapodaCore;
        if (!core || !core.GATTUNGEN || !core.GATTUNGEN[recId]) return null;
        const basis = core.GATTUNGEN[recId];
        const buch = this._tetrapodaStudioDials(recId);
        const dials = Object.assign({}, basis, buch || {}, ovOpt && typeof ovOpt === "object" ? ovOpt : {});
        // istDefault steuert den IDB-Pfad: nur die unveränderte Gattungs-Gestalt
        // darf die Platte lesen/schreiben (Regler-Unikate bleiben Unikate, W-A1).
        const istDefault = !ovOpt && JSON.stringify(dials) === JSON.stringify(Object.assign({}, basis));
        return { dials, istDefault };
    }
    _ofenKreaturKey(recId, dials, lod) {
        let d = "";
        try {
            d = JSON.stringify(dials || {});
        } catch (_e) {
            d = "";
        }
        return recId + "|" + (lod | 0) + "|" + d;
    }
    // KLON-REBIND (V18.463, ein Gesetz für Mensch UND Tier): SkinnedMesh.clone teilt das Template-Skelett —
    // jede Instanz bindet auf IHRE geklonten Bones um (Bind-Matrix bleibt).
    static _ofenKlonRebind(klon, teile) {
        klon.traverse((n) => {
            if (!n.isSkinnedMesh || !n.userData.__skinJoints) return;
            const bones = n.userData.__skinJoints.map((nm) => teile[nm]).filter(Boolean);
            if (bones.length) n.bind(new THREE.Skeleton(bones), n.bindMatrix.clone());
        });
    }
    // DIE STARR-BINDUNG (Mensch UND Tier, am EINEN Ofen-Chokepoint): jedes starre Teil (Pfote · Ohr · Lid ·
    // Kopf · Kiefer · Schwanzspitze …) hing als eigenes Mesh an seinem Gelenk — ein Draw plus ein Schatten-Draw
    // je Teil. Gemessen 02.10. (Mess-Wiese, Holz voll): 5 nahe Wölfe = 421 von 474 Draws, je Wolf 35 starre
    // Teile. Teile derselben Sippe (Stoff × Attribut-Form, phyto-core `budgetSippe`; die Farbe reist als Vertex-Farbe)
    // verschmelzen zu EINEM SkinnedMesh; jeder Vertex hängt starr an sein Gelenk (skinIndex = Gelenk, Gewicht
    // 1), die GPU posiert, was vorher der Szenen-Graph je Teil trug. Die Gelenke bleiben Gelenke: Gang,
    // Lid-Skala, Iris, Halter, Fern-Fit (dominanter Bone) lesen dieselben Objekte. Geometrie im Wurzel-Raum der
    // Bind-Pose; Klone binden über __skinJoints um (_ofenKlonRebind) wie die Haut.
    static _ofenStarrBinden(root) {
        root.updateMatrixWorld(true);
        const wurzelInv = new THREE.Matrix4().copy(root.matrixWorld).invert();
        // Gelenk-Namen müssen eindeutig sein — der Klon findet seine Bones über den Namen.
        const namen = new Map();
        root.traverse((n) => {
            if (!n.isMesh && n.name) namen.set(n.name, namen.has(n.name) ? null : n);
        });
        const gruppen = new Map();
        root.traverse((n) => {
            if (!n.isMesh || n.isSkinnedMesh || n.isInstancedMesh || !n.geometry || !n.parent) return;
            if (Array.isArray(n.material) || !n.material || n.visible === false) return;
            const g = n.geometry;
            if (!g.attributes.position || (g.morphAttributes && Object.keys(g.morphAttributes).length)) return;
            // DIE SIPPE des Budget-Gesetzes (phyto-core `budgetSippe`, am Mesh gestempelt) sagt, was bindet — dieselbe
            // Regel, mit der es die Draws zählt; null (Tür-Flügel drehen sich selbst, eine Haut ist ihr eigenes
            // SkinnedMesh) bindet nie. Zwei Materialien teilen nie eine Geometrie.
            const sippe = n.userData ? n.userData.__sippe : null;
            if (!sippe) return;
            let gelenk = n.parent;
            while (gelenk && gelenk.isMesh) gelenk = gelenk.parent;
            if (!gelenk || !gelenk.name || namen.get(gelenk.name) !== gelenk) return;
            const key = sippe + "|" + n.material.uuid;
            let gr = gruppen.get(key);
            if (!gr) gruppen.set(key, (gr = []));
            gr.push({ mesh: n, gelenk });
        });
        const m = new THREE.Matrix4();
        const nm = new THREE.Matrix3();
        const v = new THREE.Vector3();
        for (const teile of gruppen.values()) {
            if (teile.length < 2) continue;
            const g0 = teile[0].mesh.geometry;
            const attrNamen = Object.keys(g0.attributes);
            let nV = 0,
                nI = 0;
            for (const t of teile) {
                const g = t.mesh.geometry;
                nV += g.attributes.position.count;
                nI += g.index ? g.index.count : g.attributes.position.count;
            }
            const daten = {};
            for (const a of attrNamen) daten[a] = new Float32Array(nV * g0.attributes[a].itemSize);
            const index = nV > 65535 ? new Uint32Array(nI) : new Uint16Array(nI);
            const skinIndex = new Uint16Array(nV * 4);
            const skinWeight = new Float32Array(nV * 4);
            const bones = [];
            const boneIdx = new Map();
            let ov = 0,
                oi = 0;
            for (const t of teile) {
                const g = t.mesh.geometry;
                const n = g.attributes.position.count;
                m.multiplyMatrices(wurzelInv, t.mesh.matrixWorld);
                nm.getNormalMatrix(m);
                for (const a of attrNamen) {
                    const src = g.attributes[a];
                    const dst = daten[a];
                    const k = src.itemSize;
                    for (let i = 0; i < n; i++) {
                        if (a === "position" || a === "normal") {
                            v.fromBufferAttribute(src, i);
                            if (a === "position") v.applyMatrix4(m);
                            else v.applyMatrix3(nm).normalize();
                            dst[(ov + i) * 3] = v.x;
                            dst[(ov + i) * 3 + 1] = v.y;
                            dst[(ov + i) * 3 + 2] = v.z;
                        } else for (let c = 0; c < k; c++) dst[(ov + i) * k + c] = src.getComponent(i, c);
                    }
                }
                let b = boneIdx.get(t.gelenk);
                if (b === undefined) {
                    b = bones.length;
                    bones.push(t.gelenk);
                    boneIdx.set(t.gelenk, b);
                }
                for (let i = 0; i < n; i++) {
                    skinIndex[(ov + i) * 4] = b;
                    skinWeight[(ov + i) * 4] = 1;
                }
                if (g.index) for (let i = 0; i < g.index.count; i++) index[oi++] = g.index.getX(i) + ov;
                else for (let i = 0; i < n; i++) index[oi++] = ov + i;
                ov += n;
            }
            const geo = new THREE.BufferGeometry();
            for (const a of attrNamen) {
                const src = g0.attributes[a];
                geo.setAttribute(a, new THREE.BufferAttribute(daten[a], src.itemSize, src.normalized));
            }
            geo.setIndex(new THREE.BufferAttribute(index, 1));
            geo.setAttribute("skinIndex", new THREE.Uint16BufferAttribute(skinIndex, 4));
            geo.setAttribute("skinWeight", AnazhRealm._hautGewicht(skinWeight, 4));
            const t0 = teile[0].mesh;
            const starr = new THREE.SkinnedMesh(geo, t0.material);
            starr.castShadow = t0.castShadow;
            starr.receiveShadow = t0.receiveShadow;
            starr.userData.sharedGeom = true;
            if (t0.userData && t0.userData.__klasse) starr.userData.__klasse = t0.userData.__klasse;
            starr.userData.__skinJoints = bones.map((b) => b.name);
            for (const t of teile) t.mesh.parent.remove(t.mesh);
            root.add(starr);
            starr.updateMatrixWorld(true);
            starr.bind(new THREE.Skeleton(bones), starr.matrixWorld.clone());
            // Die Bind-Box reist mit (wie die der Haut aus dem Assemble): Box3-Leser der Welt-Gestalt messen den
            // Klon sonst über ein frisch umgebundenes, noch nicht posiertes Skelett.
            geo.computeBoundingBox();
            starr.boundingBox = geo.boundingBox.clone();
        }
    }
    // Der Beipack-Leser (GENERISCH für jede Gelenk-Gattung — Tier UND Mensch):
    // Reply-Einträge → Gelenk-Gruppen (benannt!) + Meshes an ihren Gelenken.
    // Liefert {root, teile, tailNamen, minY} oder null.
    _ofenAssembleAsset(meshes) {
        if (!Array.isArray(meshes) || !meshes.length || typeof THREE === "undefined") return null;
        let skelett = null;
        for (const m of meshes) if (m && m.kind === "__skelett" && m.skelett) skelett = m.skelett;
        if (!skelett || !Array.isArray(skelett.joints) || !skelett.joints.length) return null;
        const root = new THREE.Group();
        const teile = {};
        // V18.463 — trägt der Beipack skinJoints (Mensch-Hüllen), werden die
        // Gelenke BONES (Bone erbt Object3D — Gruppen-Semantik bleibt), damit
        // die Haut-/Kleid-Hüllen als SkinnedMesh binden können.
        const mitBones = Array.isArray(skelett.skinJoints) && skelett.skinJoints.length > 0;
        for (const j of skelett.joints) {
            if (!j || !j.name) continue;
            const g = mitBones ? new THREE.Bone() : new THREE.Group();
            g.name = j.name;
            teile[j.name] = g;
        }
        const rootName = skelett.root || "wolf";
        for (const j of skelett.joints) {
            if (!j || !j.name) continue;
            const g = teile[j.name];
            if (j.parent && teile[j.parent]) teile[j.parent].add(g);
            else if (j.name === rootName) root.add(g);
            else (teile[rootName] || root).add(g);
            if (Array.isArray(j.pos)) g.position.set(j.pos[0], j.pos[1], j.pos[2]);
            if (Array.isArray(j.quat)) g.quaternion.set(j.quat[0], j.quat[1], j.quat[2], j.quat[3]);
            if (Array.isArray(j.scale)) g.scale.set(j.scale[0], j.scale[1], j.scale[2]);
        }
        // das Volumen der geschlossenen Haut (1310-15, der Ofen misst es vor dem Stoff-Schnitt) hängt am Gelenk der Hülle —
        // die Masse liest es (`_leibVolumen`), nie die offene Fläche
        if (skelett.leibV > 0 && teile[rootName]) teile[rootName].userData.__leibV = skelett.leibV;
        let gebaut = 0;
        for (const m of meshes) {
            if (!m || m.kind === "__skelett") continue;
            const mesh = this._foundryBuildMesh(m);
            if (!mesh) continue;
            // Template-Geometrie ist über ALLE Klone geteilt — der Dispose-
            // Chokepoint (_disposeSoulGroup) lässt sharedGeom stehen.
            mesh.userData.sharedGeom = true;
            // Die Seh-Klasse des Stoffs steht am Teil: die Gelenk-Gestalt wählt mit ihr den Wurf-Teil (`wurf.seh`, S3).
            if (m.mat && typeof m.mat.seh === "string") mesh.userData.__seh = m.mat.seh;
            (teile[m.joint] || teile[rootName] || root).add(mesh);
            gebaut++;
        }
        if (!gebaut) return null;
        root.updateMatrixWorld(true);
        // V18.463 — die Haut-/Kleid-Hüllen BINDEN: SkinnedMesh an die Bone-
        // Gelenke der Default-Pose (Bind-Matrix = Welt-Pose beim Assemble;
        // die Geometrie ist Charakter-lokal gebacken — deckungsgleich).
        if (mitBones) {
            const bones = skelett.skinJoints.map((nm) => teile[nm]).filter(Boolean);
            root.traverse((n) => {
                if (!n.isSkinnedMesh) return;
                n.userData.__skinJoints = skelett.skinJoints.slice();
                n.bind(new THREE.Skeleton(bones), n.matrixWorld.clone());
            });
        }
        // DIE SOHLE steht auf dem Boden, nie das Fell darunter (Integration W5-Körper): die Fell-Schalen (aSchale) reichen
        // unter der Pfote bis 3,3 cm tiefer (Bär) — sie hoben das Tier um ihre Länge über den Boden (Wolf 1,3 cm). Der
        // Stand (minY: Boden-Versatz, Bein-IK, Bein-Länge) liest die Haut.
        const sohle = new THREE.Box3();
        root.traverse((n) => {
            if (n.isMesh && !(n.geometry && n.geometry.attributes && n.geometry.attributes.aSchale))
                sohle.expandByObject(n);
        });
        const bb = new THREE.Box3().setFromObject(root);
        AnazhRealm._ofenStarrBinden(root);
        // DIE KÖRPER-KUGEL: jede geskinnte Hülle (Haut · Fell · Kleid · starre Teile) cullt gegen die Bind-Hülle
        // des GANZEN Körpers × 1,25 — jede Pose bleibt darin (Glieder drehen um Gelenke im Leib). Die Bind-BBox
        // der Einzel-Hülle log (darum zeichneten Haut und Fell nie gecullt), die Körper-Hülle nicht: außerhalb
        // des Blicks und je Schatten-Kaskade fällt der Draw. Klone erben die Kugel (SkinnedMesh.copy).
        if (!bb.isEmpty()) {
            const kugel = bb.getBoundingSphere(new THREE.Sphere());
            kugel.radius *= 1.25;
            const inv = new THREE.Matrix4();
            root.updateMatrixWorld(true);
            root.traverse((n) => {
                if (!n.isSkinnedMesh) return;
                n.boundingSphere = kugel.clone().applyMatrix4(inv.copy(n.matrixWorld).invert());
                n.frustumCulled = true;
            });
        }
        return {
            root,
            teile,
            tailNamen: Array.isArray(skelett.tailSegs) ? skelett.tailSegs.slice() : [],
            minY: Number.isFinite(sohle.min.y) ? sohle.min.y : 0,
            // die Hand-Mitte je Hand-Gelenk (Mensch nah, im Hand-Raum) — der Griff der Faust
            handMitte: skelett.handMitte || null,
        };
    }
    // Das Art-Template (memo): warm aus dem Prefetch/IDB, kalt über den EINEN
    // Bäcker synchron (foundry-core auf der Stamm-Seite — ein Gesetz, zwei
    // Scheduler). null = LAUT beim Aufrufer (fail-closed, kein Ersatz-Körper).
    _ofenKreaturTemplate(recId, ovOpt, lod, eigen) {
        const core = typeof window !== "undefined" && window.__tetrapodaCore;
        const d = this._ofenKreaturDials(recId, ovOpt);
        if (!core || !d) return null;
        return this._ofenVorlage(this._ofenKreaturKey(recId, d.dials, lod), eigen, () => {
            try {
                const BAKER = typeof globalThis !== "undefined" ? globalThis.BAKERS_BY_KIND : null;
                if (!BAKER || typeof BAKER.kreatur !== "function") return null;
                const g = BAKER.kreatur(core, recId, 0, lod | 0, d.dials);
                const eintraege = [];
                g.traverse((o) => {
                    if (o.isMesh) eintraege.push(this._ofenMeshEintragAusThree(o));
                });
                if (g.userData && g.userData.__skelett)
                    eintraege.push({ kind: "__skelett", skelett: g.userData.__skelett });
                return this._ofenAssembleAsset(this._ofenBudget(core, "kreatur", lod, eintraege, recId));
            } catch (e) {
                this.log("Kreatur-Ofen kalt-Guss scheiterte (" + (e && e.message) + ")", "ERROR");
                return null;
            }
        });
    }
    // DIE EIGENTÜMERSCHAFT DER OFEN-GÜSSE (Frost-Nachbesserung 08.10.) — der EINE Weg in das Memo `_tierOfenMemo`
    // (Kreatur- und Mensch-Ofen). Das Memo hält die Vorlagen, die ÜBERLEBEN (Welt-Spawns, Restore, Peers, Prefetch): ihre
    // Meshes tragen `sharedGeom` (`_ofenAssembleAsset`), jeder Klon teilt sie, keine Gruppe entsorgt sie. Ein Guss `eigen`
    // (das Regler-Einzelstück der Werkstatt) ist keine Vorlage: er betritt das Memo nie, seine Meshes verlieren die
    // Geteilt-Markierung, er gehört dem, der ihn zeigt — der entsorgt ihn über `_disposeSoulGroup`. Befund (Radeon, Wolf,
    // 20 Regler-Werte): jeder Wert legte zwei Einzelstücke für immer ins Memo, als geteilt markiert — der Grafikspeicher
    // der Werkstatt wuchs 2,4 → 50,1 MB, ihre Geometrien 11 → 171. Trifft ein eigener Guss eine Vorlage im Memo (dieselben
    // Dials), zeigt er die Vorlage — geteilt, wie sie ist.
    // DIE GRENZE (Frost-Nachbesserung 4): das Memo wuchs mit jeder neuen Mitspieler-Erscheinung um zwei Vorlagen (~9,6 MB
    // JS) und gab nie frei. Jede Vorlage zählt ihre lebenden Leiber (`_ofenVorlagenBinden` beim Klonen, die Rückgabe in
    // `_disposeSoulGroup`); `fest` hält die Gattungs- und Spieler-Vorlagen des Prefetch (Off-Thread gebacken — ein Neuguss
    // wäre ein Haupt-Thread-Guss); von den übrigen hält das Memo höchstens OFEN_MEMO_RUHEND ohne Leib, die älteste fällt.
    _ofenVorlage(key, eigen, giessen, fest) {
        const memo = AnazhRealm._tierOfenMemo || (AnazhRealm._tierOfenMemo = new Map());
        const takt = (AnazhRealm._ofenTakt = (AnazhRealm._ofenTakt || 0) + 1);
        const da = memo.get(key);
        if (da) {
            if (da.__ofen) {
                da.__ofen.zuletzt = takt;
                if (fest === true) da.__ofen.fest = true;
            }
            return da;
        }
        const asm = giessen();
        if (!asm) return null;
        if (eigen === true)
            asm.root.traverse((n) => {
                if (n.userData && n.userData.sharedGeom) delete n.userData.sharedGeom;
            });
        else {
            asm.__ofen = { key, nutzer: 0, fest: fest === true, zuletzt: takt };
            memo.set(key, asm);
            this._ofenMemoRaeumen();
        }
        return asm;
    }
    static get OFEN_MEMO_RUHEND() {
        return 2;
    }
    // Ein Leib aus Ofen-Vorlagen (Kreatur, Mensch) meldet sich bei jeder an; `_disposeSoulGroup` gibt sie zurück. Ein
    // eigener Guss (`eigen`) steht nicht im Memo und zählt nicht.
    _ofenVorlagenBinden(leib, vorlagen) {
        const liste = vorlagen.filter((v) => v && v.__ofen);
        for (const v of liste) v.__ofen.nutzer++;
        if (liste.length) leib.__ofenVorlagen = (leib.__ofenVorlagen || []).concat(liste);
    }
    _ofenVorlageLoesen(v) {
        if (!v || !v.__ofen) return;
        v.__ofen.nutzer = Math.max(0, v.__ofen.nutzer - 1);
        if (v.__ofen.nutzer === 0) this._ofenMemoRaeumen();
    }
    // Die Räumung: Vorlagen ohne lebenden Leib und ohne `fest`, über OFEN_MEMO_RUHEND hinaus, fallen — die älteste zuerst —
    // und ihre Geometrie wird entsorgt (das Memo ist ihr Eigentümer; Stoffe gehören den Klassen-Caches und bleiben).
    _ofenMemoRaeumen() {
        const memo = AnazhRealm._tierOfenMemo;
        if (!memo) return;
        const ruhend = [];
        for (const v of memo.values()) if (v.__ofen && !v.__ofen.fest && v.__ofen.nutzer === 0) ruhend.push(v);
        if (ruhend.length <= AnazhRealm.OFEN_MEMO_RUHEND) return;
        ruhend.sort((a, b) => a.__ofen.zuletzt - b.__ofen.zuletzt);
        for (const v of ruhend.slice(0, ruhend.length - AnazhRealm.OFEN_MEMO_RUHEND)) {
            memo.delete(v.__ofen.key);
            v.root.traverse((n) => {
                if (n.geometry) this._queueDispose(n.geometry);
            });
        }
    }
    // DIE ZEILE DER GELENK-GESTALT (S3, Lehre 19) — der EINE Leser der Kern-Zeile für Tier und Mensch: phyto-core
    // `budgetZeile` (die Stufen-Klammer) und die Art-Ebene (`hyst`). Der Ausgang des Ofens (`_ofenBudget`) faltet auf sie,
    // die Gestalt (`_gelenkGestalt`) liest aus ihr den Wurf (`schatten`, `wurf.seh`) und die Stufen-Grenze (`ab`, `hyst`).
    _ofenZeile(core, kind, lod) {
        const cfg = core && core.PORTAL_RENDER_CONFIG;
        const bz = globalThis.__phytoCore.budgetZeile(cfg, kind, lod | 0);
        const block = cfg && cfg.lod && cfg.lod.budget ? cfg.lod.budget[kind] : null;
        return {
            stufe: bz ? bz.stufe : null,
            zeile: bz ? bz.zeile : null,
            hyst: block && typeof block.hyst === "number" ? block.hyst : null,
        };
    }
    // DAS BUDGET-GESETZ im Sync-Guss (W8): der Haupt-Thread-Guss verlässt das Studio an DERSELBEN Stelle wie die
    // Worker-Antwort (`__replyBuildAsset`) — phyto-core `budgetErzwingen` auf der Zeile des Kerns (seine
    // PORTAL_RENDER_CONFIG.lod.budget[kind][stufe], `_ofenZeile`); ein Bruch schreit, nie still.
    _ofenBudget(core, kind, lod, eintraege, name) {
        const PC = globalThis.__phytoCore;
        const bz = this._ofenZeile(core, kind, lod);
        const res = PC.budgetErzwingen(eintraege, bz.zeile);
        if (res.bericht.bruch.length)
            this.log("BUDGET-BRUCH " + name + " L" + (lod | 0) + ": " + JSON.stringify(res.bericht.bruch), "ERROR");
        return res.meshes;
    }
    // Sync-Pendant des Shell-Extractors (phytogenesis __extractAssetMesh): DIESELBE Eintrags-Form, damit
    // _ofenAssembleKreatur/_foundryBuildMesh die EINE Konversion bleiben. Arrays reisen als Referenz.
    _ofenMeshEintragAusThree(mesh) {
        const geo = mesh.geometry;
        const mat = mesh.material || {};
        // DIE KLASSE REIST MIT: der Studio-Bäcker stempelt `material.userData.__klasse` (fell · straehne* · skin ·
        // haut · hair); der Material-Weber webt für GENAU diese Namen die Lab-Shader-Gesetze (FELL_LOOK/HAUT_LOOK/
        // HAAR_LOOK). Befund 30.09.: hier stand `kind: "unknown"` fest — 0 von 11 Wolf-Materialien trugen das
        // Fell-Gesetz, der Weber war ein toter Leser. Andere Klassen (Auge, Klaue …) bleiben "unknown".
        const kl = mat.userData && mat.userData.__klasse;
        const out = { kind: typeof kl === "string" && globalThis.__phytoCore.budgetLook(kl) ? kl : "unknown" };
        if (mesh.userData && mesh.userData.__assetJoint) out.joint = mesh.userData.__assetJoint;
        out.mat = {
            roughness: typeof mat.roughness === "number" ? mat.roughness : 0.7,
            metalness: typeof mat.metalness === "number" ? mat.metalness : 0,
            flatShading: !!mat.flatShading,
            envMapIntensity: typeof mat.envMapIntensity === "number" ? mat.envMapIntensity : 1,
            side: mat.side === THREE.DoubleSide ? 2 : 0,
            alphaTest: typeof mat.alphaTest === "number" ? mat.alphaTest : 0,
            hasNormalMap: !!mat.normalMap,
        };
        if (mat.color && typeof mat.color.r === "number") out.mat.color = [mat.color.r, mat.color.g, mat.color.b];
        if (mat.userData && mat.userData.__webe) out.mat.webe = mat.userData.__webe;
        // Die Seh-Klasse des Gesetzbuchs reist mit (das Budget-Gesetz faltet nur innerhalb EINER, `_ofenBudget`).
        if (mat.userData && mat.userData.__seh) out.mat.seh = mat.userData.__seh;
        if (mat.userData && typeof mat.userData.__leucht === "number") out.mat.leucht = mat.userData.__leucht;
        if (mat.userData && typeof mat.userData.__licht === "string") out.mat.licht = mat.userData.__licht; // K11 (Brücke)
        if (mat.emissive && (mat.emissive.r || mat.emissive.g || mat.emissive.b)) {
            out.mat.emissive = [mat.emissive.r, mat.emissive.g, mat.emissive.b];
            out.mat.emissiveIntensity = typeof mat.emissiveIntensity === "number" ? mat.emissiveIntensity : 1;
        }
        // Klarlack und Durchsicht reisen wie in der Brücke (phytogenesis `__extractAssetMesh`, W5) — DIESELBE Eintrags-
        // Form; ein Bäcker-Stoff ohne die Felder (jede Kreatur heute) bleibt byte-alt.
        if (typeof mat.clearcoat === "number" && mat.clearcoat > 0) {
            out.mat.clearcoat = mat.clearcoat;
            out.mat.clearcoatRoughness = typeof mat.clearcoatRoughness === "number" ? mat.clearcoatRoughness : 0;
        }
        if (mat.transparent && typeof mat.opacity === "number" && mat.opacity < 1) out.mat.opacity = mat.opacity;
        if (geo && geo.attributes) {
            for (const name in geo.attributes) {
                const at = geo.attributes[name];
                if (!at || !at.array) continue;
                out[name] = { array: at.array, itemSize: at.itemSize || 3 };
            }
            if (geo.index) out.index = geo.index.array;
        }
        return out;
    }
    // Anker-Farben des Default-Menschen (Boot-Avatar, Peers ohne Übergabe, Ofen-Prefetch) aus den
    // Kern-Tabellen koerper-core SKIN_TONES/HAIR_COLORS — FNV-deterministisch aus dem Welt-Seed
    // (reload-stabil, alle Peers gleich). Kalter Kern → null (fail-closed).
    _menschAnkerFarben() {
        const kc = typeof window !== "undefined" && window.__koerperCore;
        if (!kc || !kc.SKIN_TONES || !kc.HAIR_COLORS) return null;
        const seed = (this.state && this.state.worldSeed) >>> 0 || 1;
        if (this._menschAnkerMemo && this._menschAnkerMemo.seed === seed) return this._menschAnkerMemo;
        const pick = (tab, salt) => {
            const keys = Object.keys(tab);
            let h = (0x811c9dc5 ^ seed) >>> 0;
            const s = "mensch:" + salt;
            for (let i = 0; i < s.length; i++) {
                h ^= s.charCodeAt(i);
                h = Math.imul(h, 0x01000193);
            }
            return tab[keys[(h >>> 0) % keys.length]];
        };
        this._menschAnkerMemo = {
            seed,
            skin: pick(kc.SKIN_TONES, "haut").hex >>> 0,
            hair: pick(kc.HAIR_COLORS, "haar").base >>> 0,
        };
        return this._menschAnkerMemo;
    }

    // DER EINE FARB-MÜNZER des Mensch-Gusses: Anker-Farben, von der Übergabe (skinTone/hairColor →
    // Kern-Tabellen-Lookup) überstimmt. Guss (_buildHumanGroup) UND Prefetch lesen dieselbe Auflösung,
    // damit der Boot-Avatar sein Memo warm trifft.
    _menschGussFarben(dials) {
        const kc = typeof window !== "undefined" && window.__koerperCore;
        const anker = this._menschAnkerFarben();
        const f = { skin: anker ? anker.skin : null, hair: anker ? anker.hair : null };
        if (dials && kc) {
            if (
                typeof dials.skinTone === "string" &&
                kc.SKIN_TONES &&
                Object.prototype.hasOwnProperty.call(kc.SKIN_TONES, dials.skinTone)
            ) {
                f.skin = kc.SKIN_TONES[dials.skinTone].hex >>> 0;
            }
            if (
                typeof dials.hairColor === "string" &&
                kc.HAIR_COLORS &&
                Object.prototype.hasOwnProperty.call(kc.HAIR_COLORS, dials.hairColor)
            ) {
                f.hair = kc.HAIR_COLORS[dials.hairColor].base >>> 0;
            }
        }
        return f;
    }

    // DER EINE KEY-MÜNZER des Mensch-Ofens (18.07.): Guss und Prefetch münzen
    // DENSELBEN Schlüssel — das Key-Format lebt genau einmal.
    _ofenMenschKey(dials, skinColor, hairColor, lod) {
        let dKey = "";
        try {
            dKey = JSON.stringify(dials || {});
        } catch (_e) {
            dKey = "";
        }
        return "mensch|" + (lod | 0) + "|" + dKey + "|" + (skinColor >>> 0) + "|" + (hairColor >>> 0);
    }

    // DER MENSCH-OFEN (PIPE-VOLLENDUNG V18.459): derselbe Tisch, Zeile "koerper" —
    // bauMensch+morphAuf backen im Bäcker, der Stamm assembliert + memoisiert je
    // Dials+Farben. Der Spieler/Peer ist ein Template-Clone wie jede Kreatur.
    _ofenMenschTemplate(dials, skinColor, hairColor, lod, eigen) {
        const core = typeof window !== "undefined" && window.__koerperCore;
        if (!core || typeof core.bauMensch !== "function") return null;
        return this._ofenVorlage(this._ofenMenschKey(dials, skinColor, hairColor, lod), eigen, () => {
            try {
                const BAKER = typeof globalThis !== "undefined" ? globalThis.BAKERS_BY_KIND : null;
                if (!BAKER || typeof BAKER.koerper !== "function") return null;
                const g = BAKER.koerper(core, "mensch", 0, lod | 0, { dials, skinColor, hairColor });
                const eintraege = [];
                g.traverse((o) => {
                    if (o.isMesh) eintraege.push(this._ofenMeshEintragAusThree(o));
                });
                if (g.userData && g.userData.__skelett)
                    eintraege.push({ kind: "__skelett", skelett: g.userData.__skelett });
                return this._ofenAssembleAsset(this._ofenBudget(core, "koerper", lod, eintraege, "mensch"));
            } catch (e) {
                this.log("Mensch-Ofen kalt-Guss scheiterte (" + (e && e.message) + ")", "ERROR");
                return null;
            }
        });
    }
    // DER LEIB DES SPIELERS AUS DEM FADEN (K60-2): die zwei Spieler-Vorlagen (Mensch lod 0 und 1, gelenkige Grobstufe) gießt
    // das Werk der Foundry, sobald das Buch steht — die Gestalt des Leibs steht im Buch (`_koerperStudioDials`, die Farben
    // `_menschGussFarben`), derselbe Dial-Merge und derselbe Key-Münzer wie der Rig-Guss (`_buildHumanoidRig`): der Bau des
    // Spielers trifft danach das Memo (Klon ~1 ms). Bis K60-2 goss der Haupt-Faden den Leib im sechsten Frame (Radeon kalt
    // 2,36 s bis zum ersten Weltbild, K602/p2.cpuprofile) und nach dem Buch ein zweites Mal mit den Dials des Studios. Der
    // Auftrag geht NAH zuerst (am Ort des Spielers); der Vorrat (`_ofenPrefetchKreaturen`) wartet auf denselben Zug.
    // `{ steht, da }`: steht = beide Vorlagen liegen im Memo — oder ihr Guss fiel LAUT (`OFEN-PREFETCH LEER`), dann gießt
    // der Bau sie hier wie ohne Faden.
    _ofenSpielerVorlagen() {
        if (this._spielerVorlagen) return this._spielerVorlagen;
        const z = { steht: false, da: null };
        this._spielerVorlagen = z;
        const memo = AnazhRealm._tierOfenMemo || (AnazhRealm._tierOfenMemo = new Map());
        const auftraege = [];
        // Prefetch münzt aus den LEBENDEN Quellen — derselbe Dial-Merge (START_PARAMS + _koerperStudioDials)
        // und Farb-Münzer (_menschGussFarben) wie der Rig-Guss, durch den EINEN Key-Münzer → warmes Memo.
        const kc = typeof window !== "undefined" && window.__koerperCore;
        if (kc && kc.START_PARAMS) {
            const bmD = this._koerperStudioDials();
            const dM = Object.assign({}, kc.START_PARAMS, bmD || {});
            const fM = this._menschGussFarben(bmD);
            const pm = this.state.playerMesh;
            // KREATUR-KOSTEN (3) — beide Stufen vorbacken (das Kreatur-Muster
            // unten): lod 0 = der animierte Gelenk-Baum, lod 1 = die gelenkige
            // Grobstufe (`_gelenkGestalt`). Warm = Spawn ~1 ms.
            for (const lodM of [0, 1]) {
                if (fM.skin === null || fM.hair === null) break; // Kern kalt → der Guss schreit ohnehin
                const keyM = this._ofenMenschKey(dM, fM.skin, fM.hair, lodM);
                // die Spieler-Vorlage ist fest (`_ofenVorlage`) — auch wenn ein Sync-Guss sie schon legte
                if (memo.has(keyM)) {
                    this._ofenVorlage(keyM, false, () => null, true);
                    continue;
                }
                const auftrag = this._foundryRequest(
                    "mensch",
                    0,
                    lodM,
                    { dials: dM, skinColor: fM.skin, hairColor: fM.hair },
                    pm ? pm.position : undefined
                ).then((meshes) => {
                    // fail-LAUT (V18.462): ein toter Prefetch war von Erfolg
                    // nicht unterscheidbar — das eine Wort macht ihn sichtbar.
                    if (!meshes || !meshes.length) {
                        if (!memo.has(keyM))
                            this.log(`OFEN-PREFETCH LEER: mensch lod${lodM} (Buch kalt/Timeout)`, "WARN");
                        return;
                    }
                    this._ofenVorlage(keyM, false, () => this._ofenAssembleAsset(meshes), true);
                });
                auftraege.push(auftrag);
            }
        }
        const steht = () => {
            z.steht = true;
        };
        z.da = Promise.all(auftraege).then(steht, (e) => {
            steht();
            this._stoffBruch("die Spieler-Vorlagen (Mensch-Ofen im Faden)", e);
        });
        return z;
    }
    // Ist der Leib des Spielers gießbar, ohne den Haupt-Faden zu halten? Ohne Studio-Faden (`_foundryEnabled`: kein Worker,
    // die Grammatik-Bänder) gießt ihn der Bau hier; sonst wartet er auf das Buch und seine zwei Vorlagen im Memo.
    _leibBereit() {
        if (!this._foundryEnabled()) return true;
        const f = this._foundry;
        if (!f || !f.ready || !f.recipes) return false;
        return this._ofenSpielerVorlagen().steht;
    }
    // Boot-Prefetch (nach Book-Ingest): die Gattungen off-thread backen — die
    // Welt-Spawns treffen dann NUR noch das Memo (Clone ~1 ms, kein Freeze).
    // DER OFEN-VORRAT NACH DEM ERSTEN BILD (K60, die Regel des Vorrats aus K30): kein Leser des ersten Bildes liest ihn —
    // den Leib des Spielers gießt sein eigener Bau (`_deferredAvatarSoul`), die Kreaturen kommen nach dem Bild
    // (`_tickBootPhase3`). Bis K60 stellte er sich beim Worker-Start vor das Buch-Werk: acht Güsse (Mensch, Reh, Wolf,
    // Fuchs je zwei Stufen) hielten den Faden kalt 7 s, und jeder nahe Baum wartete hinter ihnen (Radeon, Kalt-Zeile
    // 24,9 s: die erste Baum-Antwort bei 13,8 s). Er wartet auf das EREIGNIS des Bildes (`_weltbildKommt`), nie auf die
    // Uhr; `_ofenVorratSteht` sagt Boot-Phase 3, dass jede Gattung im Memo liegt (oder laut fehlt).
    async _ofenPrefetchKreaturen() {
        await this._weltbildKommt();
        const auftraege = [];
        const map = AnazhRealm.TETRAPODA_SOUL_MAP || {};
        const memo = AnazhRealm._tierOfenMemo || (AnazhRealm._tierOfenMemo = new Map());
        const gesehen = new Set();
        // die Spieler-Vorlagen (Mensch, beide Stufen) bestellt der Leib des Spielers selbst, sobald das Buch steht
        // (`_ofenSpielerVorlagen`, K60-2) — der Vorrat wartet auf denselben Zug und hält sie fest
        auftraege.push(this._ofenSpielerVorlagen().da);
        for (const soulKey of Object.keys(map)) {
            const recId = map[soulKey];
            if (!recId || gesehen.has(recId)) continue;
            gesehen.add(recId);
            const d = this._ofenKreaturDials(recId, null);
            if (!d) continue;
            for (const lod of [0, 1]) {
                const key = this._ofenKreaturKey(recId, d.dials, lod);
                if (memo.has(key)) {
                    this._ofenVorlage(key, false, () => null, true);
                    continue;
                }
                const auftrag = this._foundryRequest(recId, 0, lod, d.istDefault ? null : d.dials).then((meshes) => {
                    if (!meshes || !meshes.length) {
                        if (!memo.has(key))
                            this.log(`OFEN-PREFETCH LEER: ${recId} lod${lod} (Buch kalt/Timeout)`, "WARN");
                        return;
                    }
                    this._ofenVorlage(key, false, () => this._ofenAssembleAsset(meshes), true);
                });
                auftraege.push(auftrag);
            }
        }
        await Promise.all(auftraege);
        this._ofenVorratSteht = true;
    }
    // DAS BEIN-MASS der Gestalt (Welle 5, die Zwei-Knochen-IK des Gang-Gesetzes): je Bein an der Vorlage in der Ruhe-Pose
    // (alle Gelenke 0) in der Sagittal-Ebene (y, z) des Rumpfs vermessen — a = Bein-Gelenk → Unterglied-Gelenk (Kette[2]),
    // b = Unterglied-Gelenk → Pfoten-Gelenk (Kette[3]), c = Pfoten-Gelenk → Aufsetz-Punkt (am Boden darunter), phi0 =
    // Ruhe-Winkel von a nach b, zr = Aufsetz-Punkt vor dem Bein-Gelenk, h = Gelenk-Höhe über dem Boden. In Metern (× f),
    // memoisiert an der Vorlage.
    static _tierBeinMass(t0, f) {
        if (t0._beinMass) return t0._beinMass;
        const T = t0.teile;
        const ketten = [
            [T.legFL, T.flU, T.flL, T.flP],
            [T.legFR, T.frU, T.frL, T.frP],
            [T.legHL, T.hlT, T.hlC, T.hlP],
            [T.legHR, T.hrT, T.hrC, T.hrP],
        ];
        t0.root.updateMatrixWorld(true);
        const lage = (o) => new THREE.Vector3().setFromMatrixPosition(o.matrixWorld);
        const mass = ketten.map((K) => {
            const p0 = lage(K[0]),
                p1 = lage(K[2]),
                p2 = lage(K[3]);
            const ay = (p1.y - p0.y) * f,
                az = (p1.z - p0.z) * f,
                by = (p2.y - p1.y) * f,
                bz = (p2.z - p1.z) * f;
            const p0w = T.wolf.worldToLocal(p0.clone());
            return {
                p0: [p0w.x * f, p0w.y * f, p0w.z * f],
                a: [ay, az],
                b: [by, bz],
                c: [(t0.minY - p2.y) * f, 0],
                phi0: Math.atan2(ay * bz - az * by, ay * by + az * bz),
                zr: (p2.z - p0.z) * f,
                h: (p0.y - t0.minY) * f,
            };
        });
        t0._beinMass = mass;
        return mass;
    }
    // Der Baum-GANG konsumiert das EINE Gang-Gesetz: cpgStep + STAND_POSE + MOTION-Profile (LIVE-Buch
    // über _motionProfileName) treiben die vier Bein-KETTEN des bauTier-Baums (Lab-Ziel-Mathe direkt,
    // nicht PD-geglättet). Deterministisch (Stand-Unruhe aus t-Sinus); der CPG-Zustand wohnt an
    // tb._gang, walkPhase ist nur der Phasen-Seed.
    _animateTierBaum(group, t, walkPhase, moving, emotions) {
        const tb = group && group.userData && group.userData._tierBaum;
        if (!tb || !tb.teile) return;
        const core = typeof window !== "undefined" && window.__tetrapodaCore;
        const T = tb.teile;
        // KREATUR-LEBEN/SCHWIMM-HEIMAT — der Körper-Zustand des Halters
        // (updateCreatures stempelt ud._motionZustand) führt in der EINEN Brücke.
        const zust = (group.userData && group.userData._motionZustand) || null;
        const name = this._motionProfileName(moving, emotions, "kreatur", zust) || (moving ? "joy" : "idle");
        // Die Kern-Tafel ist die EINZIGE Basis: unbekannter Profil-Name → idle-Zeile; Kern kalt → keine
        // Animation.
        const MOT = core && core.MOTION;
        let P = this._motionStudioProfile(moving, emotions, zust) || (MOT && (MOT[name] || MOT.idle)) || null;
        if (!P) return;
        // Verhaltens-AKTION als transienter Profil-Overlay (tetrapoda fx.verhalten, updateCreatures stempelt):
        // profil-Felder überlagern P, die Sonder-Kanäle dreh/kopfSweep/rollAmp/rollRate wirken an Rumpf/Kopf.
        // Abgelaufene Aktion fällt HIER (EIN Verfalls-Ort für beide Leser).
        // Lab-Spiegel: BEH_PICK.host = "aktionen.profil".
        let VA = group.userData && group.userData._verhaltenAktion;
        if (VA) {
            const nowS = this.state.creatureAnimationTime; // die Kreatur-Uhr, an der updateCreatures die Aktion stempelt
            // (ein Biss, der noch nicht geschnappt hat, fällt erst im Schnappen — die Landung trägt den Kopf: _kreaturBissTakt)
            if ((nowS >= VA.bis && !VA.biss) || !VA.def) {
                group.userData._verhaltenAktion = null;
                VA = null;
            } else if (VA.def.profil) {
                if (!VA._P || VA._Pbase !== P) {
                    VA._P = Object.assign({}, P, VA.def.profil);
                    VA._Pbase = P;
                }
                P = VA._P;
            }
        }
        // AUSKLINGE-SAUM: vor der Stufen-Grenze (`ab` × Größe) schreibt updateCreatures ud._animFade (1→0); Schritt/Sway/
        // Schwanz/Kopf klingen in die Stand-Pose aus, damit der Stufen-Schalter (`_gelenkStufe`) eine STEHENDE Gestalt
        // trifft. Aufrufer ohne _animFade → fadeMul 1.
        const fade = group.userData._animFade;
        const fadeMul = fade !== undefined && fade < 1 ? (fade > 0 ? fade : 0) : 1;
        let g = tb._gang;
        // Der Gang-Phasen-Seed liest das Gesetz (P.phases je MOTION-Preset: Trab/Pass/Stand — jede Zeile trägt es, ein
        // Muster ohne Zeile ist ein Bruch, kein zweiter Trab im Wirt) und seedet bei Profil-Wechsel neu (wie Lab emo.set).
        // Der walkPhase-Versatz (Desync je Kreatur) bleibt; das gesetzte Muster wohnt am Gang (g.off), der Takt des Leibs
        // liest es dort.
        const phGesetz = Array.isArray(P.phases) && P.phases.length === 4 ? P.phases : null;
        if (!phGesetz) return AnazhRealm._kernPflichtBruch("tetrapoda:MOTION." + name + ".phases");
        if (!g || g.profil !== name) {
            g = tb._gang = g || { ph: [0, 0, 0, 0], lastT: t };
            for (let pi = 0; pi < 4; pi++) g.ph[pi] = walkPhase + phGesetz[pi];
            g.off = phGesetz;
            g.profil = name;
        }
        // dtWeg = die echte Uhr-Spanne seit der letzten Auswertung (die Raten-Leiter wertet ferne Wesen nur jeden 2./4.
        // Takt aus) — der Weg teilt sich durch sie, nie durch den gedeckelten Animations-Schritt. Der TAKT rückt um
        // dieselbe Spanne vor (dtTakt, in Schritten ≤ 0,1 s — die Kopplung bleibt stabil; eine Pause über 1 s ist kein
        // Gang): mit dem gedeckelten Schritt blieb die Phase bei 30 fps und Raten-Leiter 1/4 (0,133 s je Auswertung)
        // 25 % hinter dem Weg, die Pfoten glitten (gate:tier-gang unter Last: Schlupf 0,27 → siehe Commit).
        const dtWeg = t - g.lastT;
        const dt = Math.max(0, Math.min(0.1, dtWeg));
        const dtTakt = Math.max(0, Math.min(1, dtWeg));
        g.lastT = t;
        // DAS GANG-GESETZ (Welle 5, tetrapoda gangSchritt): Takt und Hüft-Auslenkung folgen dem WEG des Leibs — die
        // Geschwindigkeit misst der Chokepoint selbst (Lage-Änderung je Uhr-Schritt, geglättet; jeder Halter — Welt,
        // Peer, Werkstatt — läuft durch ihn), die Bein-Länge trägt der Guss (tb.beinL × Körpergröße). Vorher kam der
        // Takt aus dem Gefühls-Profil (Freude 3,2 rad/s bei 0,06 rad Schritt, jede Geschwindigkeit): Schlupf 1,0. Ein
        // SPRUNG der Lage ist kein Lauf (`_lageTempo`): die Pfoten setzen am neuen Ort — vorher las der Gang einen Ruf über
        // 20 m als Lauf mit 8,5 m/s, und die Anker am alten Ort zogen die Beine 20 m zurück (gate:koerper-stand K5).
        const lage = group.position;
        if (dtWeg > 0 && Number.isFinite(g.lageX)) {
            const vLage = AnazhRealm._lageTempo(lage.x - g.lageX, lage.z - g.lageZ, dtWeg);
            if (vLage === null) g.fuss = null;
            g.v = (g.v || 0) + ((vLage || 0) - (g.v || 0)) * (1 - Math.exp(-8 * dt));
        }
        g.lageX = lage.x;
        g.lageZ = lage.z;
        const skala = group.scale.x || 1;
        const gs = core.gangSchritt(moving ? g.v || 0 : 0, tb.beinL * skala, this._gangZeile(false));
        g.omega = gs.omega; // der Takt des Gangs — die Raten-Leiter tastet ihn nie gröber als ein Viertel ab
        const st = gs.S * fadeMul;
        const freq = st > 0 ? gs.omega : Number(P.freq) || 0.25;
        const phAlt = g.ph.slice();
        if (dtTakt > 0 && typeof core.cpgStep === "function" && core.CPG_COUPLING) {
            const nT = Math.ceil(dtTakt / 0.1);
            for (let k = 0; k < nT; k++) core.cpgStep(g.ph, freq, core.CPG_COUPLING, dtTakt / nT);
        }
        // DER LEIB WIEGT SICH IM SCHRITT, NIE IM STAND (Welle LF, die Pfoten-IK): Wiegen (sway) und Federn (bob) sind die
        // Gewichts-Verlagerung von Tritt zu Tritt — ihr Anteil folgt dem Schritt des Gang-Gesetzes (eingeblendet in ~0,25 s).
        // Ein Leib, der laufen WILL und steht (der Wunsch ohne Weg), wiegte sonst im Lauf-Takt, und die stehenden Pfoten
        // knickten die Knie nach (gemessen am stehenden Wolf: Knie-Falte 0,16 rad statt < 0,05).
        g.schritt = (g.schritt || 0) + ((st > 0.002 ? 1 : 0) - (g.schritt || 0)) * (dt > 0 ? 1 - Math.exp(-4 * dt) : 1);
        // DER TAKT DES LEIBS (K07): der Kreis-Mittelwert der vier Bein-Phasen, je um ihren Versatz im Muster (im doppelten
        // Takt: Wiegen und Federn schwingen je Tritt) — im Muster gleich dem Takt des ersten Beins; ein Bein, das an der
        // Grenze seiner Kette abhebt (seine Phase springt auf den Schwung-Anfang), schüttelt den Rumpf nicht. Der Versatz
        // ist das Muster, mit dem die Beine gesetzt wurden (g.off).
        const offL = g.off;
        let cL = 0,
            sL = 0;
        for (let k = 0; k < 4; k++) {
            cL += Math.cos(2 * (g.ph[k] - offL[k]));
            sL += Math.sin(2 * (g.ph[k] - offL[k]));
        }
        const takt2 = Math.atan2(sL, cL) + 2 * offL[0];
        let roll = Math.sin(takt2) * (Number(P.sway) || 0) * fadeMul * g.schritt;
        // V18.491.80 — ZIP/LAB→HOST: bodyZ reist im MOTION-Preset (Lab-Roll-
        // additiv neben sway·sin); ohne Feld 0 = byte-alt.
        roll += (Number(P.bodyZ) || 0) * fadeMul;
        // KREATUR-LEBEN — die Sonder-Kanäle der Aktion: Schüttel-Rolle, Ganz-
        // körper-Drehung (linear über die Dauer — endet bei dreh=2π nahtlos),
        // Kopf-Pendel (Scan). Ohne Aktion alles 0 = byte-alt.
        let drehY = 0;
        let sweepY = 0;
        if (VA && VA.def) {
            const nowS = this.state.creatureAnimationTime;
            const d = VA.def;
            if (Number.isFinite(d.rollAmp)) roll += Math.sin(nowS * (d.rollRate || 10)) * d.rollAmp * fadeMul;
            if (Number.isFinite(d.dreh)) {
                const frac = Math.max(0, Math.min(1, (nowS - VA.start) / Math.max(0.001, VA.bis - VA.start)));
                drehY = d.dreh * frac;
            }
            if (Number.isFinite(d.kopfSweep)) sweepY = Math.sin(nowS * 1.3) * d.kopfSweep * fadeMul;
        }
        // DIE HALTUNG DES BISSES (Welle LF kampf, Posten 5): im Ansprung neigen sich Rumpf und Kopf auf den Leib des Ziels
        // (VA.rumpfZiel · VA.kopfZiel, _kreaturBissKopf) — mit der Folge-Rate der Glieder (ihr Boden 18/s, legA); endet der
        // Ansprung, löst sich die Haltung ebenso.
        {
            const BZ = VA && VA.bissAkt ? VA : null;
            const haltA = dt > 0 ? 1 - Math.exp(-18 * dt) : 1;
            g.bissRumpf = (g.bissRumpf || 0) + (((BZ && BZ.rumpfZiel) || 0) - (g.bissRumpf || 0)) * haltA;
            g.bissKopf = (g.bissKopf || 0) + (((BZ && BZ.kopfZiel) || 0) - (g.bissKopf || 0)) * haltA;
        }
        if (T.wolf) {
            T.wolf.rotation.z = roll;
            // bodyX-Konsum: die Rumpf-Neigung der Profile (hunt duckt, playbow verbeugt); der Hang-Pitch lebt
            // getrennt am Kreatur-ROOT (creature.rotation.x). bob (Galopp-Federn, Lab: spineX·bob·sin(ph·2))
            // wird auf wolf.rotation.x verdichtet.
            const bob = (Number(P.bob) || 0) * fadeMul;
            T.wolf.rotation.x = (Number(P.bodyX) || 0) * fadeMul + Math.sin(takt2) * bob * g.schritt + g.bissRumpf;
            T.wolf.rotation.y = drehY;
        }
        // PD-Kanäle aus dem MOTION-Preset: tension → Stand-Unruhe + Rumpf-Plant-Pitch; kpMul → einpolige
        // Bein-Näherung. Fehlend → 1.0 (Lab-idle).
        const tension = Number.isFinite(Number(P.tension)) ? Number(P.tension) : 1.0;
        const kpMul = Number.isFinite(Number(P.kpMul)) ? Number(P.kpMul) : 1.0;
        if (!g.prevSt) g.prevSt = [0, 0, 0, 0];
        if (!Number.isFinite(g.plantX)) g.plantX = 0;
        if (dt > 0) g.plantX *= Math.exp(-14 * dt);
        if (st > 0.002) {
            for (let pi = 0; pi < 4; pi++) {
                const ns = Math.max(0, -Math.sin(g.ph[pi]));
                if (g.prevSt[pi] < 0.05 && ns > 0.15) g.plantX -= 0.012 * tension;
                g.prevSt[pi] = ns;
            }
        } else {
            for (let pi = 0; pi < 4; pi++) g.prevSt[pi] = Math.max(0, -Math.sin(g.ph[pi]));
        }
        if (T.wolf) T.wolf.rotation.x += g.plantX * fadeMul;
        // V18.491.80 — ear: Lab setzt earL.z=+ear / earR.z=−ear (MOTION.ear);
        // teile.earL/earR kommen aus dem __skelett-Beipack (Ofen). Fehlt → skip.
        const ear = (Number(P.ear) || 0) * fadeMul;
        if (T.earL) T.earL.rotation.z = ear;
        if (T.earR) T.earR.rotation.z = -ear;
        const ketten = [
            [T.legFL, T.flU, T.flL, T.flP],
            [T.legFR, T.frU, T.frL, T.frP],
            [T.legHL, T.hlT, T.hlC, T.hlP],
            [T.legHR, T.hrT, T.hrC, T.hrP],
        ];
        const seiten = [-1, 1, -1, 1];
        // V18.491.81 — kpMul: Lab skaliert pd.kp/kd; Host = einpolige Ziel-Näherung
        // (höher → knackiger). State an tb._gang; NeutralStance nullt den Gang.
        if (!g.legCur)
            g.legCur = [
                [0, 0, 0, 0, 0],
                [0, 0, 0, 0, 0],
                [0, 0, 0, 0, 0],
                [0, 0, 0, 0, 0],
            ];
        // die Glieder folgen ihrem Ziel im Gang ohne Nachlauf (die Ziele sind stetig: der Schwung kam mit dem alten Faktor
        // 2,5 um bis zu 5 cm hinter seinem Ziel auf und strich dabei über den Boden)
        const legA = dt > 0 ? 1 - Math.exp(-Math.max(18, 55 * kpMul) * (st > 0 ? 6 : 1) * dt) : 1;
        // DIE PFOTE STEHT AUF DEM BODEN UNTER IHR, DAS BEIN IM LOT (Welle LF, Leben-Schau 07.10.: am Querhang standen die
        // Beine 20–31° aus dem Lot — sie kippten mit dem Leib, die Pfoten zielten auf die Ebene des Leibs; der Stand-Schlupf
        // lag bei 0,56–1,27). Drei Schritte je Takt: das Fuß-Ziel in der WELT (Schritt 1, mit dem Halt des stehenden
        // Fußes), die Senke des Rumpfs auf die Reichweite der Beine (Schritt 2), die Pfote auf ihr Ziel per Abspreizen und
        // ebener Zwei-Knochen-IK im Rumpf-Raum (Schritt 3). Der Boden unter der Pfote ist _kreaturFussBoden (der
        // Stand-Leser der Sicht um den Träger des Leibs; wer schwimmt oder springt, hält die Pfote an seiner Ebene).
        const GG = core.GANG_GESETZ;
        const LANDUNG = 0.85; // der Anteil seines Wegs, ab dem ein sinkender Fuß den Punkt hält, an dem er aufsetzt
        const fLab = tb.f || 1;
        const vZiel = this._gangV || (this._gangV = new THREE.Vector3());
        const vHuefte = this._gangH || (this._gangH = new THREE.Vector3());
        // der Rumpf in seiner Ruhe-Lage (die Senke dieses Takts folgt aus den Zielen, Schritt 2)
        const ruhe = T.wolf ? tb._rumpfRuhe || (tb._rumpfRuhe = T.wolf.position.clone()) : null;
        if (T.wolf) {
            T.wolf.position.copy(ruhe);
            T.wolf.updateWorldMatrix(true, false);
        }
        // die Hüften im Leib (Gruppen-Raum) in der RUHE des Rumpfs, einmal je Tier: das Federn und Wiegen des Rumpfs dreht
        // die Hüfte um seinen Drehpunkt — folgte das Fuß-Ziel ihm, glitte der Fuß im Stand mit
        if (!tb._huefteLeib && T.wolf && T.wolf.parent) {
            const M = new THREE.Matrix4().copy(group.matrixWorld).invert();
            M.multiply(T.wolf.parent.matrixWorld).multiply(
                new THREE.Matrix4().compose(T.wolf.position, new THREE.Quaternion(), T.wolf.scale)
            );
            tb._huefteLeib = tb.bein.map((B) =>
                new THREE.Vector3(B.p0[0] / fLab, B.p0[1] / fLab, B.p0[2] / fLab).applyMatrix4(M)
            );
        }
        const gier = group.rotation.y || 0;
        const vorX = Math.sin(gier),
            vorZ = Math.cos(gier);
        const stand = st < 0.002;
        const fl = g.fuss || (g.fuss = [{ an: false }, { an: false }, { an: false }, { an: false }]);
        const ziele =
            g.ziele ||
            (g.ziele = [
                [0, 0, 0, 0],
                [0, 0, 0, 0],
                [0, 0, 0, 0],
                [0, 0, 0, 0],
            ]);
        const glied = (B) => (Math.hypot(B.a[0], B.a[1]) + Math.hypot(B.b[0], B.b[1])) * skala;
        // wo die Pfote JETZT steht: ihre Sohle (das Ende des Pfoten-Glieds c — der Punkt, den die IK auf den Boden stellt;
        // das Gelenk darüber liegt am geneigten Leib um |c|·sin(Neigung) versetzt)
        const pfoteHier = (K, L, fx, fz, BM) => {
            if (K[3] && g.legInit) {
                K[3].updateWorldMatrix(true, false);
                vZiel.set(0, BM.c[0] / fLab, BM.c[1] / fLab).applyMatrix4(K[3].matrixWorld);
                L.x = vZiel.x;
                L.z = vZiel.z;
            } else {
                L.x = fx;
                L.z = fz;
            }
            L.an = true;
        };
        // SCHRITT 1 — DAS FUSS-ZIEL IN DER WELT je Bein: unter der Hüfte in der Ruhe des Rumpfs (die Lage des Leibs mit
        // Gier, Nick und Wank — ohne sein Federn und Wiegen), längs der Blickrichtung um die Ruhe-Lage und den Schritt des
        // Gang-Gesetzes versetzt, auf dem Boden dort. Ein Fuß, der steht, GLEITET NIE: im Stand des Beins beim Gehen (Phase
        // π … 2π) bleibt er, wo er aufsetzte (das Ziel des Gesetzes wandert mit dem Leib zurück — Wank, Nick-Regeln und
        // Schub verschöben ihn sonst); er hebt erst im frühen Schwung ab (beginnt der Gang spät im Schwung, bleibt er stehen
        // bis zum nächsten) und führt vom Abhebe-Punkt auf das Ziel des Gesetzes. Ein STEHENDES Tier lässt die Pfoten, wo
        // sie stehen. Wo eine stehende Pfote fern ihrer Lage ist — im Stand fern dem Lot, im Gehen von der Hüfte nicht
        // mehr erreichbar —, TRITT sie dorthin: gehoben, in einer Viertel-Sekunde, eine nach der anderen.
        let tritt = false;
        for (let i = 0; i < 4; i++) if (fl[i].tritt >= 0) tritt = true;
        for (let i = 0; i < 4; i++) {
            const ph = g.ph[i];
            const K = ketten[i];
            const BM = tb.bein[i];
            const L = fl[i];
            // der Fußweg dieses Beins folgt SEINER Phasen-Rate (die Kopplung beschleunigt/bremst einzelne Beine): im Stand
            // wandert der Fuß mit genau der Geschwindigkeit des Leibs zurück
            const rate = dtTakt > 0 ? (g.ph[i] - phAlt[i]) / dtTakt : freq;
            const F = stand ? null : core.gangFuss(ph, st * (freq / Math.max(0.25 * freq, rate)));
            let hub = F ? F.hub : 0;
            if (tb._huefteLeib) vHuefte.copy(tb._huefteLeib[i]).applyMatrix4(group.matrixWorld);
            else vHuefte.copy(group.position);
            const vor = BM.zr * skala + (F ? F.dz : 0);
            let fx = vHuefte.x + vorX * vor,
                fz = vHuefte.z + vorZ * vor;
            const u = ((ph % (2 * Math.PI)) + 2 * Math.PI) % (2 * Math.PI);
            const imStand = stand || u >= Math.PI;
            // der WELTFESTE ANKER (K07): ein gehender Fuß setzt auf, wo das Gesetz ihn hinstellt — sein Ziel am Ende des
            // Schwungs ist in der Welt stetig (die Hermite-Enden laufen mit der Stand-Rate); die Sohle des letzten Takts
            // lag mit den alten Gelenken am NEUEN Leib, der Anker sprang je Aufsetzen um v·dt nach vorn (am Wolf 1,6 m/s
            // 2,7 cm bei 60 fps, unter der Raten-Leiter das Vierfache — gate:tier-gang Schlupf 0,07–0,13). Ein stehendes Tier
            // lässt die Pfote, wo sie steht.
            if (imStand && !L.an && !(L.tritt >= 0)) {
                if (stand || !g.legInit) pfoteHier(K, L, fx, fz, BM);
                else {
                    // die Pfote setzt, wo die Landung in der Welt stand (unten), sonst auf das Ziel des Gesetzes
                    L.x = L.land ? L.lx : fx;
                    L.z = L.land ? L.lz : fz;
                    L.an = true;
                }
                L.land = false;
            }
            if (imStand && L.an && !(L.tritt >= 0) && !tritt) {
                const fern = stand
                    ? Math.hypot(fx - L.x, fz - L.z) > 0.15 * BM.h * skala
                    : Math.hypot(vHuefte.x - L.x, vHuefte.z - L.z) > glied(BM) - BM.c[0] * skala;
                if (fern) {
                    L.tritt = 0;
                    L.ax = L.x;
                    L.az = L.z;
                    tritt = true;
                }
            }
            // der freie Fuß (Tritt oder Schwung) und ob er schon sinkt (DIE LANDUNG, unten)
            let frei = true,
                sinkt = false;
            if (L.tritt >= 0) {
                L.tritt = Math.min(1, L.tritt + dt / 0.25);
                const w = L.tritt * L.tritt * (3 - 2 * L.tritt);
                fx = L.ax + (fx - L.ax) * w;
                fz = L.az + (fz - L.az) * w;
                hub = Math.pow(Math.sin(Math.PI * L.tritt), GG.hubForm);
                sinkt = L.tritt >= LANDUNG;
            } else if (imStand) {
                frei = false;
                fx = L.x;
                fz = L.z;
            } else {
                if (L.an && u < 0.7 * Math.PI) {
                    L.ax = L.x;
                    L.az = L.z;
                    L.au = u;
                    L.an = false;
                }
                if (L.an) {
                    // der Gang beginnt spät im Schwung: der Fuß bleibt stehen bis zum nächsten
                    fx = L.x;
                    fz = L.z;
                    hub = 0;
                } else if (Number.isFinite(L.ax)) {
                    const w0 = Math.max(0, Math.min(1, (u - L.au) / Math.max(0.2 * Math.PI, 0.8 * Math.PI - L.au)));
                    const w = w0 * w0 * (3 - 2 * w0);
                    fx = L.ax + (fx - L.ax) * w;
                    fz = L.az + (fz - L.az) * w;
                }
                sinkt = !L.an && u >= LANDUNG * Math.PI;
            }
            // DIE LANDUNG STEHT IN DER WELT (K07) — EIN Halt für jeden sinkenden Fuß: ab LANDUNG seines Wegs (der Schwung ab
            // 0,85 π, der Tritt ab 0,85 seiner Viertel-Sekunde) hält die Pfote den Punkt, an dem sie aufsetzt. Das Ziel des
            // Gesetzes läuft mit dem Leib: im Schwung, wo Phase und Leib im Folgen voneinander abwichen, strich die Pfote die
            // letzten 3 cm über den Boden (am Querhang 64 % des Wolf-Schlupfs); den Tritt hielt nichts (K16-Q) — läuft der
            // Leib an, während eine Pfote tritt, setzte sie auf das Ziel unter der wandernden Hüfte und strich in ihren
            // letzten zwei Takten je 3,6–4,1 cm über den Boden (Querhang 22,2°, Wolf: 8,3 cm von 41 cm Schlupf).
            if (sinkt) {
                if (!L.land) {
                    L.land = true;
                    L.lx = fx;
                    L.lz = fz;
                }
                fx = L.lx;
                fz = L.lz;
            } else if (frei) L.land = false;
            if (L.tritt >= 0) {
                L.x = fx;
                L.z = fz;
                L.an = true;
                if (L.tritt >= 1) {
                    L.tritt = -1;
                    L.land = false;
                }
            }
            const Z = ziele[i];
            Z[0] = fx;
            Z[1] = this._kreaturFussBoden(group, fx, fz);
            Z[2] = fz;
            Z[3] = hub;
        }
        // SCHRITT 2 — DIE SENKE (die Reichweite der Beine): die Beine stehen in der Ruhe fast gestreckt. Das Ende des
        // Schritts (Ruhe-Lage ± halber Fußweg) und am Hang der Boden unter der talseitigen Hüfte (der Leib neigt und rollt,
        // die Hüfte wandert talwärts, das Lot darunter trifft den Boden tiefer) lagen jenseits ihrer Länge — die IK klemmte,
        // die Pfote schwebte und glitt dem Ziel nach. Der Rumpf senkt sich LOTRECHT (die Hüften sinken auf ihr Lot, die
        // Fuß-Ziele bleiben), bis jede Pfote ihren Boden erreicht: je Bein das Gelenk über der Pfote höchstens
        // √(Glied² − seitlich² − Schritt-Ende²) unter der Hüfte; gedeckelt auf ein Drittel der Hüft-Höhe (ein Rumpf kriecht
        // nicht).
        let senke = 0;
        const vHw = this._gangHW || (this._gangHW = new THREE.Vector3());
        if (T.wolf) {
            for (let i = 0; i < 4; i++) {
                const B = tb.bein[i],
                    Z = ziele[i];
                vHw.set(B.p0[0] / fLab, B.p0[1] / fLab, B.p0[2] / fLab);
                vHw.applyMatrix4(T.wolf.matrixWorld);
                const dx = Z[0] - vHw.x,
                    dz = Z[2] - vHw.z;
                const quer = dx * vorZ - dz * vorX;
                const weit = Math.max(Math.abs(dx * vorX + dz * vorZ), Math.abs(B.zr) * skala + st / 2);
                const lg = glied(B) * 0.98;
                const ueber = vHw.y - (Z[1] - B.c[0] * skala); // die Hüfte über dem Pfoten-Gelenk auf dem Boden
                const noetig = ueber - Math.sqrt(Math.max(0, lg * lg - quer * quer - weit * weit));
                if (noetig > senke) senke = Math.min(noetig, (B.h * skala) / 3);
            }
        }
        g.senke = (g.senke || 0) + (senke - (g.senke || 0)) * (dt > 0 ? 1 - Math.exp(-6 * dt) : 1);
        if (T.wolf && T.wolf.parent) {
            // das Lot im Raum des Rumpf-Halters: die Senke wirkt längs der Welt-Senkrechten, nie längs des geneigten Leibs
            const Pinv = (this._gangM || (this._gangM = new THREE.Matrix4())).copy(T.wolf.parent.matrixWorld).invert();
            const vA = vHw.copy(group.position).applyMatrix4(Pinv);
            const ax = vA.x,
                ay = vA.y,
                az = vA.z;
            vHw.copy(group.position);
            vHw.y -= g.senke;
            vHw.applyMatrix4(Pinv);
            T.wolf.position.set(ruhe.x + vHw.x - ax, ruhe.y + vHw.y - ay, ruhe.z + vHw.z - az);
            T.wolf.updateMatrix();
            T.wolf.matrixWorld.multiplyMatrices(T.wolf.parent.matrixWorld, T.wolf.matrix);
        }
        const Rinv = T.wolf
            ? (this._gangR || (this._gangR = new THREE.Matrix4())).copy(T.wolf.matrixWorld).invert()
            : null;
        // SCHRITT 3 — DIE PFOTE AUF DEM ZIEL: in den Rumpf-Raum gerechnet (er neigt, rollt, federt) stellt die Hüfte das Bein
        // erst seitlich in die Ebene des Ziels (Abspreizen um die Längs-Achse: der Leib rollt, das Bein bleibt im Lot), dann
        // die ebene Zwei-Knochen-IK. Dieselbe IK trägt den Stand mit seiner Gewichts-Unruhe.
        for (let i = 0; i < 4; i++) {
            const K = ketten[i];
            const BM = tb.bein[i];
            const Z = ziele[i];
            const hub = Z[3];
            const p0x = BM.p0[0] * skala,
                p0y = BM.p0[1] * skala,
                p0z = BM.p0[2] * skala;
            vZiel.set(Z[0], Z[1] + hub * GG.hub * BM.h * skala, Z[2]);
            if (Rinv) vZiel.applyMatrix4(Rinv).multiplyScalar(fLab * skala);
            // das Abspreizen: die Hüfte dreht die Bein-Ebene um die Längs-Achse durch das Ziel
            const lx = vZiel.x - p0x,
                ly = vZiel.y - p0y;
            const ab = Math.atan2(lx, -ly);
            const ty = -Math.hypot(lx, ly) - BM.c[0] * skala,
                tz = vZiel.z - p0z;
            let z0, z1, z2, z3;
            {
                const ay = BM.a[0] * skala,
                    az = BM.a[1] * skala,
                    by = BM.b[0] * skala,
                    bz = BM.b[1] * skala;
                const la = Math.hypot(ay, az),
                    lb = Math.hypot(by, bz);
                const dZiel = Math.hypot(ty, tz);
                // DIE GRENZE DES BEINS (K07, die hintere Extremlage): ein gehaltener Fuß — im Stand oder spät im Schwung
                // wartend —, den die Kette nicht mehr erreicht, hebt ab: sein Schwung beginnt im nächsten Takt (die Phase
                // springt auf den Schwung-Anfang, die Kopplung führt sie zurück). Vorher hielt der Anker ihn bis zum Ende
                // der Phase, die IK klemmte, die Pfote schleifte dem Leib nach (am Querhang 0,08 des Leib-Wegs; im Folgen
                // mit nachlaufender Phase bis 0,96 m hinter der Hüfte). Das Maß ist die Kette selbst — eine Schätzung vor
                // der IK lag 4–9 cm neben ihr —, um den Weg des Leibs in einem Bild (1/60 s) vorausgedacht: der Fuß hebt,
                // bevor er schleift, nicht ein Bild danach (nie um den Weg einer Raten-Stufe: der Stand schrumpfte dort
                // auf ein Drittel).
                if (!stand && dZiel > la + lb - (g.v || 0) * Math.min(dt, 1 / 60) && fl[i].an && !(fl[i].tritt >= 0)) {
                    const u = ((g.ph[i] % (2 * Math.PI)) + 2 * Math.PI) % (2 * Math.PI);
                    if (u >= 0.7 * Math.PI) g.ph[i] += 2 * Math.PI - u;
                }
                const d = Math.min(la + lb - 1e-4, Math.max(Math.abs(la - lb) + 1e-4, dZiel));
                const gam = Math.acos(Math.max(-1, Math.min(1, (d * d - la * la - lb * lb) / (2 * la * lb))));
                const thK = (BM.phi0 < 0 ? -gam : gam) - BM.phi0;
                const cK = Math.cos(thK),
                    sK = Math.sin(thK);
                const sy = ay + (by * cK - bz * sK),
                    sz = az + (by * sK + bz * cK);
                // der Winkel-Unterschied auf (−π, π] (beide Richtungen zeigen nach unten: atan2 springt dort um 2π)
                let thH = Math.atan2(tz, ty) - Math.atan2(sz, sy);
                thH -= 2 * Math.PI * Math.round(thH / (2 * Math.PI));
                z0 = thH;
                z1 = 0;
                z2 = thK;
                // die Pfote faltet im Schwung und streckt sich, bevor sie den Boden erreicht (hub²: beim steilen Hub
                // stünde die gefaltete Sohle sonst noch in den untersten Zentimetern schräg und striche über den Boden; K07:
                // hub⁴ — mit hub² drehte die Pfote in den untersten 3 cm noch 0,05–0,09 rad je Takt um die Handwurzel, ihr
                // Aufsetz-Punkt fegte 0,5–1,4 cm je Takt über den Boden, Schlupf 0,06–0,085 beim Schritt)
                const h2 = hub * hub;
                z3 = -(thH + thK) + h2 * h2 * GG.falte;
                if (stand) {
                    // die Gewichts-Unruhe des Stands (Lab-Mathe, t-Sinus; tension skaliert sie) auf der IK
                    const wn = (Math.sin(t * 2.5 + i * 1.7) * 0.004 + Math.sin(t * 1.3 + i * 2.3) * 0.003) * tension;
                    const wShift = roll * seiten[i] * 0.025;
                    z0 += wn + wShift;
                    z1 += wn * 0.5 + wShift * 0.3;
                    z2 += wn * 0.3 - wShift * 0.2;
                    z3 += wn * 0.2;
                }
            }
            const cur = g.legCur[i];
            // DER GEHALTENE FUSS STEHT IN DEN GELENKEN (K16-Q): die einpolige Näherung (legA, kpMul) glättet nur den freien
            // Fuß — Schwung und Tritt. Ein Fuß, den das Gesetz in der Welt hält (an, kein Tritt), steht in der Lösung der IK
            // selbst: im Stand lief die Näherung mit einem Sechstel ihrer Gang-Rate, die Gelenke hinkten dem Anker nach, und
            // die Pfote glitt mit dem Leib — am Querhang (22,2°) drehte der stehende Wolf 4,15° je Takt, die hintere Pfote lag
            // 6,9 cm neben ihrem Anker und schnappte beim Anlaufen in einem Takt zurück (6,3 cm, der größte Einzel-Schlupf).
            if (!g.legInit || (fl[i].an && !(fl[i].tritt >= 0))) {
                cur[0] = z0;
                cur[1] = z1;
                cur[2] = z2;
                cur[3] = z3;
                cur[4] = ab;
            } else {
                cur[0] += (z0 - cur[0]) * legA;
                cur[1] += (z1 - cur[1]) * legA;
                cur[2] += (z2 - cur[2]) * legA;
                cur[3] += (z3 - cur[3]) * legA;
                cur[4] += (ab - cur[4]) * legA;
            }
            if (K[0]) {
                // erst abspreizen (um die Längs-Achse des Rumpfs), dann schwingen: Rz · Rx
                K[0].rotation.order = "ZXY";
                K[0].rotation.z = cur[4];
                K[0].rotation.x = cur[0];
            }
            if (K[1]) K[1].rotation.x = cur[1];
            if (K[2]) K[2].rotation.x = cur[2];
            if (K[3]) K[3].rotation.x = cur[3];
        }
        g.legInit = true;
        if (T.headGroup) {
            // im Ansprung eines Bisses zielt der Kopf auf den Leib des Ziels (die Haltung des Bisses, g.bissKopf)
            T.headGroup.rotation.x = ((Number(P.headX) || 0) + 0.04 * Math.sin(t * 1.7)) * fadeMul + g.bissKopf;
            // KREATUR-LEBEN — das Scan-Pendel (kopfSweep); ohne Aktion 0 = byte-alt.
            // V18.491.80 — headY aus MOTION-Preset (Lab-Yaw) + Sweep additiv.
            T.headGroup.rotation.y = sweepY + (Number(P.headY) || 0) * fadeMul;
        }
        const amp = (Number(P.tailAmp) || 0.1) * fadeMul;
        const rate = Math.max(0.4, Number(P.tailRate) || 0.5);
        const ts = tb.tailSegs || [];
        for (let i = 0; i < ts.length; i++) ts[i].rotation.y = Math.sin(t * rate - i * 0.5) * amp;
    }

    // DER BODEN UNTER EINER PFOTE (Welle LF, die Pfoten-IK _animateTierBaum): der Stand-Leser der Sicht um den Träger des
    // Leibs (updateCreatures stempelt ihn je Takt: _traegerY, _traegerStruktur — die Höhe, auf der der Leib steht, und ob
    // ein Bau ihn trägt). Wer keinen Boden unter den Pfoten hat — schwimmend, im Sprung, oder ein Halter außerhalb der Welt
    // (Werkstatt, Sicht-Kopie ohne Träger) —, hält die Pfote an der Ebene seines Leibs (seine Lage).
    _kreaturFussBoden(group, x, z) {
        const ud = group.userData || {};
        const ebene = group.position.y;
        if (!Number.isFinite(ud._traegerY) || ud._motionZustand === "schwimmen" || ud._hopH > 0) return ebene;
        return this._standSicht(x, z, ud._traegerY, ud._traegerStruktur === true);
    }

    _tetrapodaSoulParts(soulKey, ovOpt) {
        const recId = AnazhRealm.TETRAPODA_SOUL_MAP[soulKey];
        const gSpec = AnazhRealm.CREATURE_SKELETON_G[soulKey];
        if (!recId || !gSpec) return null;
        // ERFINDER-WELLE — der optionale ov-Kanal (Werkstatt-Regler): Overrides mergen
        // ueber die LIVE-Buch-Dials (ohne ovOpt byte-alt; kaltes Buch + ov → nur ov,
        // die Finite-Wache je Zeile traegt Teilvektoren).
        const s0 = this._tetrapodaStudioDials(recId);
        const s = ovOpt && typeof ovOpt === "object" ? Object.assign({}, s0 || {}, ovOpt) : s0;
        if (!s) return null;
        const arch = Object.assign({}, AnazhRealm.CREATURE_ARCHETYPES[gSpec.archetypeName] || {});
        for (const row of AnazhRealm.TETRAPODA_DIAL_MAP) {
            const v = Number(s[row.dial]);
            if (!Number.isFinite(v)) continue;
            arch[row.axis] = row.base + row.mul * v;
        }
        try {
            return AnazhRealm._creatureSkeleton(Object.assign({ archetype: arch }, gSpec));
        } catch (_e) {
            return null;
        }
    }

    // Das Pferd aus dem EINEN Skelett-Gesetz `_creatureSkeleton` (REITTIER_SKELETON_G = horse-Archetyp),
    // BODEN-GELIFTET (ein Bauplan steht auf y=0, kein Kreatur-Grounding) + QUARZ-KERN (magieleitung =
    // Antrieb, `_isMoveable`). Tags wert-gleich + Rolle vehicle (kein leder-Limb: gewann nie ein Tag-MAX).
    _holzrossParts() {
        const G = AnazhRealm.REITTIER_SKELETON_G.holzross;
        const arch = Object.assign({}, AnazhRealm.CREATURE_ARCHETYPES[G.archetypeName] || {});
        const parts = AnazhRealm._creatureSkeleton(Object.assign({ archetype: arch }, G));
        let minY = Infinity;
        for (const q of parts) minY = Math.min(minY, q.position.y - (q.size.y || 0) / 2);
        for (const q of parts) q.position.y -= minY;
        const t0 = parts[0].position;
        parts.push({
            shape: "octahedron",
            material: "quarz",
            position: { x: 0, y: t0.y, z: t0.z - 0.2 },
            size: { x: G.kern, y: G.kern, z: G.kern },
        });
        return parts;
    }

    // Builder: Group aus CREATURE_SOULS[name] (unbekannte Soul → wesen). Die Parts aus
    // `_tetrapodaSoulParts` sind die MECHANIK-Wahrheit (Tags/Stats/Physik/Allometrie lesen
    // `userData._soulParts`), die GESTALT trägt der Studio-Baum (bauTier). Tags/Stats aus den frozen
    // bodyParts — dial-tag-neutral, die Spawn-Affinität kippt NIE.
    _buildCreatureGroup(soulName, opts) {
        if (typeof THREE === "undefined") return null;
        const soulKey = AnazhRealm.CREATURE_SOULS[soulName] ? soulName : "wesen";
        const soul = AnazhRealm.CREATURE_SOULS[soulKey];
        // JEDE Kreatur ist ein FOUNDRY-ASSET: Art-Template aus dem Kreatur-Ofen (memo + Prefetch), die
        // Kreatur ein CLONE (Geometrien + Materialien geteilt, ~1 ms — kein Spawn-Freeze). Custom-Namen
        // kanonisieren oben auf wesen. Kalter Kern → LAUT null, nie ein Ersatz-Körper.
        const recId = AnazhRealm.TETRAPODA_SOUL_MAP[soulKey];
        const t0 = recId ? this._ofenKreaturTemplate(recId, opts && opts.dialsOv, 0, !!(opts && opts.eigen)) : null;
        if (t0 && t0.teile && t0.teile.wolf) {
            const parts2 = this._tetrapodaSoulParts(soulKey, opts && opts.dialsOv) || soul.bodyParts;
            const group2 = new THREE.Group();
            // DIE EINE WELT-GRÖSSE (Welle 5): der Maßstab des Gesetzbuchs (tetrapoda MASSSTAB, Meter je Lab-Einheit) —
            // der Wolf steht mit 0,8 m am Widerrist. Vorher maß die Gestalt sich an der Scheitel-Höhe der Seelen-Teile,
            // und die Allometrie-Schleife überschrieb diese Skala mit 1: die Welt zeigte Lab-Einheiten als Meter.
            const f2 = window.__tetrapodaCore.MASSSTAB.meterJeEinheit;
            const klon = t0.root.clone(true);
            const teile = {};
            klon.traverse((n) => {
                if ((n.isGroup || n.isBone) && n.name) teile[n.name] = n;
            });
            // Die Tier-Haut (V18.497) ist geskinnt: der Klon bindet an SEINE Bones.
            AnazhRealm._ofenKlonRebind(klon, teile);
            const tailSegs = (t0.tailNamen || []).map((n) => teile[n]).filter(Boolean);
            const wrap2 = new THREE.Group();
            wrap2.scale.setScalar(f2);
            wrap2.position.y = -t0.minY * f2;
            wrap2.add(klon);
            wrap2.userData._creatureSkin = true; // die 1st-Person-Regel deckt den Leib (beide Stufen)
            group2.add(wrap2);
            // DIE GROBSTUFE aus DERSELBEN Pipe (lod 1, gelenkig): unter DEMSELBEN Wrap an die Knochen der feinen gebunden,
            // Wurf und Stufen-Grenze aus der Kern-Zeile (`_gelenkGestalt`); fehlt sie, gibt es kein Tier (fail-closed).
            const t1 = this._ofenKreaturTemplate(recId, opts && opts.dialsOv, 1, !!(opts && opts.eigen));
            const gelenk = this._gelenkGestalt(window.__tetrapodaCore, "kreatur", wrap2, klon, teile, t1);
            if (!gelenk) {
                this.log(`Kreatur „${soulKey}": ohne gelenkige Grobstufe kein Tier (fail-closed).`, "ERROR");
                return null;
            }
            // der Leib meldet sich bei seinen Vorlagen an (die Grenze des Ofen-Memos, `_ofenVorlage`)
            this._ofenVorlagenBinden(group2, [t0, t1]);
            group2.userData._soulParts = parts2;
            group2.userData._gelenk = gelenk;
            group2.userData._tierBaum = {
                teile,
                tailSegs,
                f: f2,
                // die Hüft-Höhe der Gestalt in Metern (das Gang-Gesetz misst die Schritt-Länge an ihr)
                beinL: (new THREE.Vector3().setFromMatrixPosition(t0.teile.legHL.matrixWorld).y - t0.minY) * f2,
                bein: AnazhRealm._tierBeinMass(t0, f2),
                wrap: wrap2,
                // das Volumen der Gestalt bei Größe 1 (m³, die Nah-Gestalt im Rahmen des Tiers) — die Masse liest es
                leibV: AnazhRealm._leibVolumen(klon, group2),
                // die RUHE der Gestalt (`_gestaltRuhe`): die benannten Glieder der Vorlage, die nie ein Gang bewegt
                ruhe:
                    t0.ruheTeile ||
                    (t0.ruheTeile = (() => {
                        const R = {};
                        t0.root.traverse((n) => {
                            if ((n.isGroup || n.isBone) && n.name) R[n.name] = n;
                        });
                        return R;
                    })()),
            };
            this._gelenkStufe(group2, 0);
            return group2;
        }
        this.log(`Kreatur-Ofen für „${soulKey}" fiel aus (kalter Kern?) — fail-closed, kein Ersatz-Körper.`, "ERROR");
        return null;
    }

    // KÖRPERGRÖSSE-ACHSE: aus der netId eine deterministische Größe in BÄNDERN (klein/normal/gross/
    // GIGANT, Koloss selten) über den geteilten Roller (UNSIGNED) → Peer- und Re-Wachstum-konsistent.
    _creatureBodySize(idStr) {
        const g = this._rollGenome(String(idStr == null ? "c0" : idStr), "creature-size");
        const roll = g.axis("class");
        // SCHLUSS-WELLE — die Größen-Bänder (klein/normal/groß/GIGANT) sind
        // tetrapoda-Gesetz (VERHALTEN.groessen, Lehre 8: DIE Differenzierungs-
        // Achse); derselbe Wurf (axis/range) → gleiche Welt bei gleichem Kern.
        const K = AnazhRealm._verhaltenGesetz().groessen;
        for (let i = 0; i < K.length - 1; i++) {
            if (roll < K[i].bis) return g.range(K[i].name, K[i].min, K[i].max);
        }
        const letzte = K[K.length - 1];
        return g.range(letzte.name, letzte.min, letzte.max);
    }

    // Der size-Dial braucht KEINE eigene Achse (ein Doppel-Faktor wäre falsch): er reist durch die EINE
    // Pipe (_tetrapodaStudioDials → _ofenKreaturDials); die Spawn-Höhe = Template-Höhe × bodySize-Wurf
    // (gate:studio-uebergabe).

    // === DIE MOTION-RESONANZ ===
    // Die Bewegungs-Rolle JEDES Parts emergiert aus Form × Lage × Spiegelung gegen
    // MOTION_ROLE_SIGNATURES (argmax, Floor); nur Built-in-Seelen behalten Hand-Skelette
    // (_animateHuman/Phoenix/Dragon). Render-only. Input: parts (Bauplan ODER Soul-bodyParts);
    // Output: parts-alignierte Liste ({role, side, phase} | null) oder null, wenn nichts resoniert.
    computeMotionRoles(parts, connections) {
        if (!Array.isArray(parts) || parts.length < 2) return null;
        const SIG = AnazhRealm.MOTION_ROLE_SIGNATURES;
        const FLOOR = AnazhRealm.MOTION_ROLE_FLOOR;
        const eps = 1e-6;
        const info = [];
        let minY = Infinity;
        let maxY = -Infinity;
        let maxAX = eps;
        let maxAZ = eps;
        for (const p of parts) {
            if (!p || p.shape === "blueprint") {
                info.push(null);
                continue;
            }
            const s = p.size || {};
            let sx = Math.abs(Number(s.x) || 0.3);
            let sy = Math.abs(Number(s.y) || 0.3);
            let sz = Math.abs(Number(s.z) || 0.3);
            // Rotations-bewusste Ausmaße: |R|·s (Beträge der Rotations-Matrix × Halbachsen) = AABB-Hülle des
            // gedrehten Quaders — sonst liest der Klassifikator einen liegenden Schweif als stehendes Bein.
            const rot = p.rotation;
            if (rot && (rot.x || rot.y || rot.z)) {
                const cx = Math.abs(Math.cos(rot.x || 0));
                const sxr = Math.abs(Math.sin(rot.x || 0));
                const cy = Math.abs(Math.cos(rot.y || 0));
                const syr = Math.abs(Math.sin(rot.y || 0));
                const cz = Math.abs(Math.cos(rot.z || 0));
                const szr = Math.abs(Math.sin(rot.z || 0));
                // |R| für Euler XYZ, komponentenweise konservativ kombiniert.
                const ex = cy * cz * sx + (szr * cx + sxr * syr * cz) * sy + (sxr * szr + cx * syr * cz) * sz;
                const ey = cy * szr * sx + (cx * cz + sxr * syr * szr) * sy + (sxr * cz + cx * syr * szr) * sz;
                const ez = syr * sx + sxr * cy * sy + cx * cy * sz;
                sx = ex;
                sy = ey;
                sz = ez;
            }
            const pos = p.position || {};
            const px = Number(pos.x) || 0;
            const py = Number(pos.y) || 0;
            const pz = Number(pos.z) || 0;
            info.push({ sx, sy, sz, px, py, pz, shape: p.shape || "box" });
            minY = Math.min(minY, py - sy / 2);
            maxY = Math.max(maxY, py + sy / 2);
            maxAX = Math.max(maxAX, Math.abs(px) + sx / 2);
            maxAZ = Math.max(maxAZ, Math.abs(pz) + sz / 2);
        }
        const H = Math.max(eps, maxY - minY);
        const c01 = (v) => Math.max(0, Math.min(1, v));
        const roles = parts.map(() => null);
        let any = false;
        for (let i = 0; i < info.length; i++) {
            const a = info[i];
            if (!a) continue;
            const f = {
                elongV: c01((a.sy / Math.max(a.sx, a.sz, eps) - 1) / 1.5),
                elongH: c01((Math.max(a.sx, a.sz) / Math.max(a.sy, eps) - 1) / 1.5),
                // flat = PLATTE: die KLEINSTE Achse ist viel dünner als die
                // MITTLERE (nicht max/min — ein dünner LANGER Zylinder ist
                // gestreckt, keine Platte; der Arm-als-Flügel-Riss, V18.101).
                flat: (() => {
                    const d = [a.sx, a.sy, a.sz].sort((u, v) => u - v);
                    return c01((d[1] / (d[0] + eps) - 2.2) / 3);
                })(),
                lowAnchor: c01(1 - (a.py - a.sy / 2 - minY) / (0.3 * H)),
                topMount: c01((a.py - (minY + 0.55 * H)) / (0.45 * H)),
                sideMount: c01((Math.abs(a.px) / maxAX - 0.35) / 0.45),
                rearMount: c01((Math.abs(a.pz) / maxAZ - 0.4) / 0.4),
                roundish: a.shape === "sphere" || a.shape === "octahedron" ? 1 : a.shape === "box" ? 0.35 : 0.15,
                central: c01(1 - (Math.abs(a.px) / maxAX + Math.abs(a.pz) / maxAZ)),
                paired: 0,
            };
            // paired: ein Spiegel-Zwilling (gleiche Form, ähnliche Größe) auf
            // der x- ODER z-Achse — die Konjunktion als 0/1-Achse (V17.107).
            for (let j = 0; j < info.length; j++) {
                if (j === i) continue;
                const b = info[j];
                if (!b || b.shape !== a.shape) continue;
                if (Math.abs(a.sx - b.sx) + Math.abs(a.sy - b.sy) + Math.abs(a.sz - b.sz) > 0.2) continue;
                const mirrorX =
                    Math.abs(a.px + b.px) < 0.12 && Math.abs(a.px) > 0.04 && Math.abs(a.py - b.py) < 0.2 * H;
                const mirrorZ =
                    Math.abs(a.pz + b.pz) < 0.12 && Math.abs(a.pz) > 0.04 && Math.abs(a.py - b.py) < 0.2 * H;
                if (mirrorX || mirrorZ) {
                    f.paired = 1;
                    break;
                }
            }
            // Ψ1 — das EINE argmax-Organ (der f-Feature-Vektor ist dieselbe
            // Σ tag·gewicht-Sprache); der Floor bleibt die NACH-Prüfung wie eh.
            const m = this._resonateArgmax(f, SIG);
            const bestRole = m.key;
            if (m.score < FLOOR || !bestRole) continue;
            // Seite + Phase: Beine im Diagonal-Trab (die Dragon-Signatur
            // generalisiert: (x>0) xor (z>0) → Gegenphase), Arme gegen das
            // gleichseitige Bein, der Schwanz als |z|-versetzte Welle.
            const side = a.px > 0.02 ? 1 : a.px < -0.02 ? -1 : a.pz >= 0 ? 1 : -1;
            let phase = 0;
            if (bestRole === "bein") phase = ((a.px >= 0 ? 0 : 1) + (a.pz >= 0 ? 0 : 1)) % 2 === 0 ? 0 : Math.PI;
            else if (bestRole === "arm") phase = a.px >= 0 ? Math.PI : 0;
            else if (bestRole === "schwanz") phase = Math.abs(a.pz) * 0.8;
            roles[i] = { role: bestRole, side, phase };
            any = true;
        }
        // VERBINDUNGEN ALS GELENKE (Vorrang-Quelle): {partA, partB} definiert einen ANKER (nächster Punkt
        // zwischen den Zentren, größen-gewichtet) + Gelenk-Typ per Resonanz: RAD (kleinerer Part Zylinder,
        // Achse ⊥ Verbindung) · TÜR (flach, vertikale Achse) · WIRBEL (Kette ≥3, Phase = Index) · sonst
        // SCHARNIER (schwingt um den Anker). Ohne Verbindungen: Lage-Heuristik. ATTACHMENT-Punkte
        // (griff/sitz/trage, partB=-1) sind keine Gelenke; unbekannte Typen passieren (Typ aus Geometrie).
        if (Array.isArray(connections)) {
            connections = connections.filter((cn) => {
                const t = cn && AnazhRealm.CONNECTION_TYPES[cn.type];
                return !(t && t.attachment);
            });
        }
        if (Array.isArray(connections) && connections.length > 0) {
            const vol = (a) => (a ? a.sx * a.sy * a.sz : 0);
            const half = (a) => (a ? (a.sx + a.sy + a.sz) / 6 : 0.2);
            // AUTO-Verbindungen (`auto:1`, Kontakt-Emergenz) sind STRUKTUR: Statik, Stats, RAD und SCHARNIER
            // (das Architektur-Idle filtert es). Mehrdeutige Gelenke nur aus manuellen Verbindungen: flat+y trifft
            // jede Wand-auf-Boden (jede Hüttenwand schwenkte als Tür), jeder ≥3-Stapel ist ein Grad-≤2-Pfad
            // (jeder Turm wellte) → Ketten + TÜR nur manuell. Hütten wackeln NIE.
            const manualConns = connections.filter((cn) => !(cn && cn.auto));
            // Ketten-Erkennung: Verbindungs-Grad pro Part (nur bewusste Hand).
            const degree = new Map();
            for (const cn of manualConns) {
                degree.set(cn.partA, (degree.get(cn.partA) || 0) + 1);
                degree.set(cn.partB, (degree.get(cn.partB) || 0) + 1);
            }
            const chainIdx = new Map();
            {
                // Ketten = zusammenhängende Pfade, deren Glieder Grad ≤ 2 haben.
                const adj = new Map();
                for (const cn of manualConns) {
                    if (!adj.has(cn.partA)) adj.set(cn.partA, []);
                    if (!adj.has(cn.partB)) adj.set(cn.partB, []);
                    adj.get(cn.partA).push(cn.partB);
                    adj.get(cn.partB).push(cn.partA);
                }
                const seen = new Set();
                for (const [start, nbs] of adj) {
                    if (seen.has(start) || nbs.length !== 1 || (degree.get(start) || 0) > 2) continue;
                    // vom Ketten-Ende entlangwandern
                    const path = [start];
                    seen.add(start);
                    let cur = start;
                    for (;;) {
                        const nxt = (adj.get(cur) || []).find((n) => !seen.has(n) && (degree.get(n) || 0) <= 2);
                        if (nxt === undefined) break;
                        path.push(nxt);
                        seen.add(nxt);
                        cur = nxt;
                    }
                    if (path.length >= 3) for (let k = 0; k < path.length; k++) chainIdx.set(path[k], k);
                }
            }
            for (const cn of connections) {
                const A = info[cn.partA];
                const B = info[cn.partB];
                if (!A || !B) continue;
                // der KLEINERE bewegt sich um den Anker
                const movIdx = vol(A) <= vol(B) ? cn.partA : cn.partB;
                const fixIdx = movIdx === cn.partA ? cn.partB : cn.partA;
                const M = info[movIdx];
                const F = info[fixIdx];
                const dx = F.px - M.px,
                    dy = F.py - M.py,
                    dz = F.pz - M.pz;
                const w = half(M) / (half(M) + half(F));
                const anchor = { x: M.px + dx * w, y: M.py + dy * w, z: M.pz + dz * w };
                // dominante Verbindungs-Achse
                const ax = Math.abs(dx),
                    ay = Math.abs(dy),
                    az = Math.abs(dz);
                const connAxis = ay >= ax && ay >= az ? "y" : ax >= az ? "x" : "z";
                const mf = {
                    flat: (() => {
                        const d = [M.sx, M.sy, M.sz].sort((u, v) => u - v);
                        return c01((d[1] / (d[0] + eps) - 2.2) / 3);
                    })(),
                    lowAnchor: c01(1 - (M.py - M.sy / 2 - minY) / (0.3 * H)),
                };
                // F5 (§11): ein `spokeWheel` IST ein Rad (wie der Zylinder, den es ersetzt) →
                // es bekommt dieselbe RAD-Gelenk-Erkennung (rollt um seine Eigen-Achse). Sonst
                // verlöre der Wagen seine Gelenke/Fahr-Tiefe (V18.119/V18.150/M3).
                const isCyl = M.shape === "cylinder" || M.shape === "spokeWheel";
                const longAxis = M.sy >= M.sx && M.sy >= M.sz ? "y" : M.sx >= M.sz ? "x" : "z";
                let jointRole, jointAxis, phase;
                if (chainIdx.has(movIdx)) {
                    jointRole = "wirbel";
                    jointAxis = "y";
                    phase = chainIdx.get(movIdx) * 0.9;
                } else if (isCyl && longAxis !== connAxis && mf.lowAnchor > 0.4) {
                    jointRole = "rad";
                    // Das Rad rollt um seine ZYLINDER-EIGEN-Achse (_cylinderWorldAxis), NICHT um die Verbindungs-
                    // Richtung — die ist am Wagen die Fahrt-Richtung (das Rad drehte wie ein Propeller).
                    jointAxis = this._cylinderWorldAxis(parts[movIdx]);
                    // Die Achse läuft DURCH das RAD-Zentrum: der größen-gewichtete
                    // Zwischen-Anker ließe das Rad auf einer ~0.26-m-Kreisbahn EIERN.
                    anchor.x = M.px;
                    anchor.y = M.py;
                    anchor.z = M.pz;
                    phase = 0;
                } else if (connAxis === "y" && mf.flat > 0.4 && !cn.auto) {
                    // §7.1 — TÜR nur aus bewusster Hand (s. manualConns oben).
                    jointRole = "tuer";
                    jointAxis = "y";
                    phase = 0;
                } else {
                    jointRole = "scharnier";
                    // Schwung um die horizontale Achse ⊥ zur Verbindungs-Richtung
                    jointAxis = connAxis === "x" ? "z" : "x";
                    phase = (M.px >= 0 ? 0 : 1) % 2 === 0 ? 0 : Math.PI;
                }
                const side = M.px > 0.02 ? 1 : M.px < -0.02 ? -1 : 1;
                const roleObj = { role: jointRole, side, phase, anchor, axis: jointAxis, joint: true };
                // V18.491.120 — Achs-Semantik front/heck placeholder (second pass fills from longitudinal x)
                if (jointRole === "rad") roleObj.front = false;
                roles[movIdx] = roleObj;
                any = true;
            }
        }
        // V18.491.120 — Achs-Semantik front/heck from longitudinal x (Lab corners.front; Host had none).
        const rads = [];
        for (let i = 0; i < roles.length; i++) {
            if (roles[i] && roles[i].role === "rad") rads.push(roles[i]);
        }
        if (rads.length >= 2) {
            let sx = 0;
            for (let i = 0; i < rads.length; i++) sx += rads[i].anchor.x;
            const mid = sx / rads.length;
            for (let i = 0; i < rads.length; i++) rads[i].front = rads[i].anchor.x > mid + 1e-4;
        }
        return any ? roles : null;
    }

    // Welt-Achse der Zylinder-HÖHE: lokale Y durch die Euler-Rotation ('XYZ': R = Rx·Ry·Rz; v = R·e_y =
    // die mittlere Spalte), dominante |Komponente| → "x"/"y"/"z" (rotation.z=π/2 → X; rotation.x=π/2
    // → Z; unrotiert → Y).
    _cylinderWorldAxis(part) {
        const rot = (part && part.rotation) || {};
        const cx = Math.cos(rot.x || 0),
            sx = Math.sin(rot.x || 0);
        const cy = Math.cos(rot.y || 0),
            sy = Math.sin(rot.y || 0);
        const cz = Math.cos(rot.z || 0),
            sz = Math.sin(rot.z || 0);
        const vx = Math.abs(-sz * cy);
        const vy = Math.abs(cz * cx - sz * sy * sx);
        const vz = Math.abs(cz * sx + sz * sy * cx);
        return vy >= vx && vy >= vz ? "y" : vx >= vz ? "x" : "z";
    }

    // Bewegungs-Rollen pro Kreatur-Seele — einmal berechnet (eine Seele =
    // EINE Part-Liste = EINE Rollen-Liste; Map-Cache über den Seelen-Namen).
    _motionRolesForSoul(soulName) {
        if (!soulName) return null;
        if (!this._motionRolesCache) this._motionRolesCache = new Map();
        if (this._motionRolesCache.has(soulName)) return this._motionRolesCache.get(soulName);
        const soul = AnazhRealm.CREATURE_SOULS[soulName];
        const roles = soul && Array.isArray(soul.bodyParts) ? this.computeMotionRoles(soul.bodyParts) : null;
        this._motionRolesCache.set(soulName, roles);
        return roles;
    }

    // STUDIO-BEWEGUNGS-PROFIL: der EINE Leser der tetrapoda-fx.motion-Daten (Vertrag §8.2). Rezept =
    // Daten-Zeile MOTION_HOST_RECIPE, Zustand→Profil = MOTION_PROFILE_MAP. Kein zweites Animations-System:
    // _animateCompoundMotion LIEST die Zahlen (Schwanz: tailRate/tailAmp); _animateHumanoidRig bleibt
    // unberührt. Kaltes Buch → null, jeder Leser fällt auf seine Konstante.
    _motionStudioProfile(moving, emotions, zustand) {
        const f = this._foundry;
        const rec = f && f.recipes ? f.recipes[AnazhRealm.MOTION_HOST_RECIPE] : null;
        const m = rec && rec.fx && rec.fx.motion && rec.fx.motion.presets;
        if (!m) return null;
        const p = m[this._motionProfileName(moving, emotions, "kreatur", zustand)];
        return p && typeof p === "object" ? p : null;
    }
    // DER EINE VERHALTENS-LESER: Aktions-Katalog + Stimmung→Wahl wohnen im tetrapoda-Gesetzbuch
    // (fx.verhalten, LIVE-Buch; Kern-Alias derselben Quelle). null = Buch UND Kern kalt → kein Verhalten.
    _tetrapodaVerhalten() {
        const f = this._foundry;
        const rec = f && f.recipes ? f.recipes[AnazhRealm.MOTION_HOST_RECIPE] : null;
        const v = rec && rec.fx && rec.fx.verhalten;
        if (v && v.aktionen && v.stimmung) return v;
        const core = typeof globalThis !== "undefined" ? globalThis.__tetrapodaCore : null;
        const v2 = core && core.VERHALTEN;
        return v2 && v2.aktionen && v2.stimmung ? v2 : null;
    }
    // KREATUR-LEBEN — der EINE Jagd/Flucht-Stempel für die Motion-Brücke:
    // setzt/löscht NUR die eigenen Zustände (der Schwimm-Stempel im Wasser-
    // Block führt physisch danach — Wasser schlägt Land).
    _kreaturZustandStempel(creature, zustand) {
        const ud = creature.userData;
        if (!ud) return;
        if (zustand) ud._motionZustand = zustand;
        else if (ud._motionZustand === "jagd" || ud._motionZustand === "hetzen" || ud._motionZustand === "flucht")
            ud._motionZustand = null;
    }
    // KREATUR-LEBEN — der deterministische Verhaltens-Hash (FNV-1a über zwei
    // Zahlen; kein Math.random — dieselbe Kreatur würfelt reproduzierbar).
    _verhaltenHash(a, b) {
        let h = 2166136261 >>> 0;
        h ^= a >>> 0;
        h = Math.imul(h, 16777619) >>> 0;
        h ^= b >>> 0;
        h = Math.imul(h, 16777619) >>> 0;
        return h >>> 0;
    }
    // VERHALTENS-TICK (je nahe Kreatur): Stimmung aus dem echten Zustand (jagd/flucht/schwimmen →
    // Emotions-Achsen → Tag/Nacht-Bedürfnis), im deterministischen Takt (alle=[min,max] s, Hash aus Index
    // + Zeit-Bucket) eine AKTION aus dem Buch an ud._verhaltenAktion; _animateTierBaum trägt sie, tempo
    // und hop wirken im Bewegungs-Pfad. Flucht/Schwimmen tragen keine Aktion.
    _tickKreaturVerhalten(creature, i, nowS) {
        const ud = creature.userData;
        if (!ud) return;
        // der Ansprung eines Bisses (_kreaturBissAnsatz) spielt zu Ende — auch in Hetze und Flucht, bis zur Landung
        if (this._kreaturAnsprungOffen(creature)) return;
        const z = ud._motionZustand;
        if (z === "flucht" || z === "schwimmen" || z === "hetzen") {
            ud._verhaltenAktion = null;
            return;
        }
        const V = this._tetrapodaVerhalten();
        if (!V) return;
        let mood;
        if (z === "jagd") {
            mood = "jagd";
        } else {
            // SCHLUSS-WELLE — die Stimmungs-Schwellen des Ticks sind Gesetzbuch-
            // Zeilen (tetrapoda VERHALTEN.stimmung.schwellen, fail-closed).
            const SW = AnazhRealm._verhaltenGesetz().stimmung.schwellen;
            const em = ud.emotions;
            if (em && (Number(em.chaos) || 0) >= SW.chaos) mood = "alert";
            else if (em && (Number(em.joy) || 0) >= SW.joy) mood = "joy";
            else {
                // dieselbe EINE Sonnen-Formel (timeOfDay 0.5 = Mittag): tiefe
                // Nacht = Ruhe; am Tag weiden Pflanzenfresser (diet ≤ weideDiet,
                // tetrapoda-Dials über die Soul-Karte — einmal je Wesen gemerkt).
                const tod = typeof this.state.timeOfDay === "number" ? this.state.timeOfDay : 0.5;
                const nacht = Math.sin(this._sonnenWinkel(tod)) < SW.nachtSin;
                if (ud._verhaltenDiet === undefined) {
                    const recId = AnazhRealm.TETRAPODA_SOUL_MAP && AnazhRealm.TETRAPODA_SOUL_MAP[ud.soul];
                    const dials = recId && this._tetrapodaStudioDials ? this._tetrapodaStudioDials(recId) : null;
                    ud._verhaltenDiet = dials && Number.isFinite(dials.diet) ? dials.diet : 1;
                }
                mood = nacht ? "nacht" : ud._verhaltenDiet <= SW.weideDiet ? "tag" : "idle";
            }
        }
        const A = ud._verhaltenAktion;
        if (A && nowS < A.bis) return; // die laufende Aktion spielt zu Ende
        const row = V.stimmung[mood] || V.stimmung.idle;
        if (!row || !Array.isArray(row.aktionen) || !row.aktionen.length) return;
        const alle = Array.isArray(row.alle) && row.alle.length === 2 ? row.alle : [6, 12];
        if (ud._verhaltenMood !== mood || !Number.isFinite(ud._verhaltenNext)) {
            // Stimmungs-Wechsel: neuen Takt würfeln (deterministisch), noch keine Aktion.
            ud._verhaltenMood = mood;
            const h0 = this._verhaltenHash(i + 1, (nowS * 10) | 0);
            ud._verhaltenNext = nowS + alle[0] + ((h0 % 1000) / 1000) * (alle[1] - alle[0]);
            return;
        }
        if (nowS < ud._verhaltenNext) return;
        const h = this._verhaltenHash((i + 1) * 2654435761, nowS | 0);
        // BEH_PICK.host — Feel .119; picks V.aktionen[name] (aktionen.profil world).
        const name = row.aktionen[h % row.aktionen.length];
        const def = V.aktionen[name];
        if (!def) return;
        const dauer = Number.isFinite(def.dauer) ? def.dauer : 1;
        ud._verhaltenAktion = { name, def, start: nowS, bis: nowS + dauer };
        // hop: die Aktion springt — über das EINE Sprung-Gesetz (creatureJump: Höhe aus der Freude, Abflug √(2·g·h)); der
        // Würfel je Frame ist gefallen, ein Sprung startet nur hier.
        if (def.hop === true) this.creatureJump(creature);
        ud._verhaltenNext = nowS + dauer + alle[0] + ((h % 977) / 977) * (alle[1] - alle[0]);
    }
    // DER EINE BRÜCKEN-RESOLVER (MOTION_EMOTION_PROFILES, Vorrang-Zeilen; keine Achse über der Schwelle
    // → MOTION_PROFILE_MAP-Default). Beide Leser (_koerperMotionProfile + _motionStudioProfile) fließen
    // hier durch — EINE Quelle, zwei Spalten (koerper/kreatur).
    _motionProfileName(moving, emotions, column, zustand) {
        // Der KÖRPER-ZUSTAND führt VOR der Emotions-Achse (schwimmend paddelt, jagend pirscht):
        // MOTION_ZUSTAND_PROFILES ist Daten; kein Zustand / keine Zeile → Emotions-Pfad.
        if (zustand) {
            const zrow = AnazhRealm.MOTION_ZUSTAND_PROFILES[zustand];
            const zname = zrow && zrow[column];
            if (zname) return zname;
        }
        const e = emotions && typeof emotions === "object" ? emotions : null;
        if (e) {
            for (const row of AnazhRealm.MOTION_EMOTION_PROFILES) {
                const v = Number(e[row.axis]) || 0;
                if (v < row.min || !row[column]) continue;
                // SCHLUSS-WELLE — die optionale GEGEN-ACHSEN-Wand einer Zeile
                // (Zorn = chaos OHNE Bedrohungs-sorrow): liegt die benannte
                // Gegen-Achse auf/über ihrer max-Schwelle, fällt die Zeile.
                if (row.unter && (Number(e[row.unter.axis]) || 0) >= row.unter.max) continue;
                return row[column][moving ? "moving" : "idle"];
            }
        }
        const d = AnazhRealm.MOTION_PROFILE_MAP[column];
        return d ? d[moving ? "moving" : "idle"] : null;
    }
    // KOERPER-BEWEGUNGS-PROFIL: der EINE Leser der koerper-fx.motion-Daten (Vertrag §8.2), Schwester von
    // `_motionStudioProfile` (Spalte "koerper"). Kaltes Buch → null, Leser fallen auf ihre Konstante.
    _koerperMotionProfile(moving, emotions) {
        const f = this._foundry;
        const rec = f && f.recipes ? f.recipes[AnazhRealm.KOERPER_HOST_RECIPE] : null;
        const m = rec && rec.fx && rec.fx.motion && rec.fx.motion.presets;
        if (!m) return null;
        // Der KAMPF-ZUSTAND führt vor der Emotions-Achse — NUR im Live-Read (emotions gesetzt): die
        // Referenz-Reads (emotions=null) bleiben Neutral-Anker der Delta-Brücken, sonst wäre fight-Delta 0.
        const zust = emotions ? this._koerperKampfZustand() : null;
        const p = m[this._motionProfileName(moving, emotions, "koerper", zust)];
        return p && typeof p === "object" ? p : null;
    }
    // ZENSUS-REST V18.488 — DER KAMPF-ZUSTAND DES AVATARS: im Schwung ODER in
    // der Nachklang-Haltung (KAMPF_HALTUNG_SEC nach dem letzten Angriff) steht
    // der Körper in Garde ("fight" — die erste lebende koerper-Zustands-Zeile).
    _koerperKampfZustand() {
        const p = this.state && this.state.player;
        if (!p) return null;
        if (p._swing) return "kampf";
        const now = performance.now() / 1000;
        if (Number.isFinite(p.lastAttackAt) && now - p.lastAttackAt < AnazhRealm.KAMPF_HALTUNG_SEC) return "kampf";
        return null;
    }
    // DIE EINE GESTALT-DIAL-QUELLE: liest die acht Morph-Dials des Da-Vinci-Studios LIVE
    // (f.recipes[mensch].s). Kaltes Buch → null → Avatar aus den Host-Konstanten (_buildHumanGroup).
    _koerperStudioDials() {
        const f = this._foundry;
        const rec = f && f.recipes ? f.recipes[AnazhRealm.KOERPER_HOST_RECIPE] : null;
        const s0 = rec && rec.s;
        const s = s0 && typeof s0 === "object" ? s0 : null;
        // STUDIO-ÜBERGABE = VORRANG-Quelle: validiert am EINEN Empfänger _studioUebergabeEmpfang, mischen
        // ihre Dials ÜBER das Buch; die Gestalt-Wahlen reisen im selben Objekt (bmDials → Mensch-Ofen-Memo-
        // Key → bakeMenschInstance). Beim Peer-Avatar-Guss FÜHRT die Übergabe des SENDERS: _p2pApplyPeerSoul
        // setzt sie transient in this._activePeerUebergabe (try/finally) — derselbe Merge, andere Quelle.
        const ue =
            this._activePeerUebergabe !== undefined && this._activePeerUebergabe !== null
                ? this._activePeerUebergabe
                : this.state && this.state.studioUebergabe && this.state.studioUebergabe.koerper;
        if (ue && ue.s && typeof ue.s === "object") {
            return Object.assign({}, s || {}, ue.s, ue.gestalt && typeof ue.gestalt === "object" ? ue.gestalt : {});
        }
        return s;
    }

    // Der Mensch hängt an derselben Größen-Achse: die koerperstudio-Dials tragen den Größen-Faktor in
    // _applySizeMultipliersToStats. Default-Dials (height 1.0 · mass 0.35 · tone 0.5) → EXAKT 1.0;
    // Spanne ≈ 0.63…1.61 (wie Custom-Avatare 0.7…1.7). Höhe quadratisch, Masse/Tonus linear-mild;
    // der Aufrufer dämpft per sqrt.
    _humanDialSizeFactor() {
        const s = this._koerperStudioDials();
        if (!s) return 1;
        const height = Number.isFinite(s.height) ? s.height : 1.0;
        const mass = Number.isFinite(s.mass) ? s.mass : 0.35;
        const tone = Number.isFinite(s.tone) ? s.tone : 0.5;
        return height * height * (1 + 0.25 * (mass - 0.35)) * (1 + 0.1 * (tone - 0.5));
    }

    // Der EINE generische Animator: Rollen auf die Compound-Children (`children[i] ↔ parts[i]`, der
    // _buildFromBlueprint-Vertrag). Absolute Werte pro Frame (Basis + Delta, kein Drift); part.rotation
    // wird einmal eingefangen und geehrt. t in Sekunden.
    _animateCompoundMotion(group, roles, t, walkPhase, moving, emotions, steerYaw) {
        // KONVERGENZ III — EIN Chokepoint: Baum-Tiere (bauTier-Gestalt) animieren
        // über den Baum-Gang; ALLE Aufrufer (Welt-Kreaturen, Peers, Verkörperung)
        // laufen hier durch — kein Parallel-Verzweigen an jedem Aufrufer.
        if (group && group.userData && group.userData._tierBaum) {
            return this._animateTierBaum(group, t, walkPhase, moving, emotions);
        }
        if (!group || !roles || !Array.isArray(group.children)) return;
        // Studio-Profil EINMAL je Aufruf (lazy, nur für schwanz/kopf); `emotions` vom Halter (Kreatur
        // ud.emotions · Spieler state.player.emotions · Peers null) durch _motionProfileName.
        // ref = Lab-idle-Profil (Delta-Null der Emotions-Offsets).
        let _mpDone = false;
        let _mp = null;
        let _mpRef = null;
        const studioProf = () => {
            if (!_mpDone) {
                _mpDone = true;
                _mp = this._motionStudioProfile(moving, emotions);
                _mpRef = _mp ? this._motionStudioProfile(false, null) : null;
            }
            return _mp;
        };
        const kids = group.children;
        let base = group.userData._motionBase;
        if (!base || base.length !== kids.length) {
            base = kids.map((c) => ({
                rx: c.rotation.x,
                ry: c.rotation.y,
                rz: c.rotation.z,
                px: c.position.x,
                py: c.position.y,
                pz: c.position.z,
            }));
            group.userData._motionBase = base;
        }
        // Rotation um den GELENK-ANKER (Bauplan-lokal): rot += θ UND pos = anchor + R(θ)·(basePos−anchor).
        // Eine-Achsen-Rotation von Hand (kein Quaternion-Alloc pro Frame).
        const applyJoint = (c, b, r, theta) => {
            const a = r.anchor;
            const ox = b.px - a.x,
                oy = b.py - a.y,
                oz = b.pz - a.z;
            const cs = Math.cos(theta),
                sn = Math.sin(theta);
            let nx = ox,
                ny = oy,
                nz = oz;
            if (r.axis === "x") {
                ny = oy * cs - oz * sn;
                nz = oy * sn + oz * cs;
                c.rotation.set(b.rx + theta, b.ry, b.rz);
            } else if (r.axis === "y") {
                nx = ox * cs + oz * sn;
                nz = -ox * sn + oz * cs;
                c.rotation.set(b.rx, b.ry + theta, b.rz);
            } else {
                nx = ox * cs - oy * sn;
                ny = ox * sn + oy * cs;
                c.rotation.set(b.rx, b.ry, b.rz + theta);
            }
            c.position.set(a.x + nx, a.y + ny, a.z + nz);
        };
        for (let i = 0; i < roles.length && i < kids.length; i++) {
            const r = roles[i];
            if (!r) continue;
            const c = kids[i];
            const b = base[i];
            if (!c || !b) continue;
            if (r.joint) {
                // C1 — die Gelenk-Rollen (Verbindungs-Vorrang)
                if (r.role === "rad") {
                    // das Rad ROLLT: mit Fahrt ∝ walkPhase, im Idle (Architektur:
                    // Mühle/Wasserrad) eine ruhige Dauer-Drehung.
                    applyJoint(c, b, r, moving ? walkPhase * 1.6 : t * 0.7);
                    // V18.491.120 — Lab hub.rotation.y = car.steer. Roll is typically x/z; compose yaw on Y from captured base.
                    if (r.front && Number.isFinite(steerYaw) && r.axis !== "y") {
                        c.rotation.y = b.ry + steerYaw;
                    }
                } else if (r.role === "tuer") {
                    applyJoint(c, b, r, Math.sin(t * 0.7 + r.phase) * 0.12);
                } else if (r.role === "wirbel") {
                    applyJoint(c, b, r, Math.sin(t * 2.2 + r.phase) * 0.3);
                } else {
                    // scharnier: schwingt wie ein Glied — um den ECHTEN Anker
                    applyJoint(
                        c,
                        b,
                        r,
                        moving ? Math.sin(walkPhase + r.phase) * 0.4 : Math.sin(t * 1.1 + r.phase) * 0.04
                    );
                }
                continue;
            }
            if (r.role === "bein") {
                c.rotation.x = b.rx + (moving ? Math.sin(walkPhase + r.phase) * 0.45 : 0);
            } else if (r.role === "arm") {
                c.rotation.x =
                    b.rx + (moving ? Math.sin(walkPhase + r.phase) * 0.3 : Math.sin(t * 1.2) * 0.05 * r.side);
            } else if (r.role === "fluegel") {
                const flap = Math.sin(t * (moving ? 11 : 5.5) + r.phase) * (moving ? 0.65 : 0.3);
                c.rotation.z = b.rz + flap * r.side;
            } else if (r.role === "schwanz") {
                // Schwanz: tailRate/tailAmp aus dem Studio-Profil, sonst aus der synchronen Kern-Tafel (MOTION
                // joy/idle, dieselbe Brücke wie der Baum-Animator). Kern kalt → kein Wedeln.
                const mp = studioProf();
                const _tc = typeof window !== "undefined" && window.__tetrapodaCore;
                const kernRow = _tc && _tc.MOTION && (_tc.MOTION[moving ? "joy" : "idle"] || _tc.MOTION.idle);
                const tr =
                    mp && Number.isFinite(mp.tailRate)
                        ? mp.tailRate
                        : kernRow && Number.isFinite(kernRow.tailRate)
                          ? kernRow.tailRate
                          : 0;
                const ta =
                    mp && Number.isFinite(mp.tailAmp)
                        ? mp.tailAmp
                        : kernRow && Number.isFinite(kernRow.tailAmp)
                          ? kernRow.tailAmp
                          : 0;
                c.rotation.y = b.ry + Math.sin(t * tr + r.phase) * ta;
            } else if (r.role === "kopf") {
                // ABSCHIEDS-WELLE — der KOPF liest die Studio-Haltung als DELTA relativ
                // zum Lab-idle (hunt: −0.12 gesenkt/pirschend · joy: +0.04 gehoben);
                // neutral/ohne Rezept exakt byte-alt (Delta 0 bzw. mp null).
                const mp = studioProf();
                const dHead =
                    mp && _mpRef && Number.isFinite(mp.headX) && Number.isFinite(_mpRef.headX)
                        ? mp.headX - _mpRef.headX
                        : 0;
                c.rotation.x = b.rx + Math.sin(t * 1.6) * 0.05 + (moving ? 0.04 : 0) + dHead;
            } else if (r.role === "segel") {
                // C2 — das Tuch/Segel FLATTERT (Wind): kleine schnelle Wellen.
                c.rotation.z = b.rz + Math.sin(t * 4.2 + r.phase + i) * 0.07;
            }
        }
    }

    // Compound-Tags der Kreatur via einheitlicher Pipeline. Vision §1.3 fraktal:
    // dieselbe MAX-Aggregation wie computeCompoundTags(blueprint) / computeSoulCompoundTags.
    computeCreatureCompoundTags(creature) {
        if (!creature) return {};
        const soulName = creature.userData && creature.userData.soul;
        const soul = soulName && AnazhRealm.CREATURE_SOULS[soulName];
        if (!soul) return {};
        return this.computeCompoundTags({ parts: soul.bodyParts });
    }
}
