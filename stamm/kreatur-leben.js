class AnazhRealm_kreatur_leben {
    // ===== ATLAS · Kreatur/leben — Spawn · Stats · Tod · Fauna-Zyklus · Serialisierung =====
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
        // jede Seele, auch der Wolf (G4a: der predator-Filter fiel — das Rudel gehört zur Welt; jagen wird es nur im pfad)
        return souls[Math.min(souls.length - 1, Math.floor(rng() * souls.length))];
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
            const k = AnazhRealm.HARVEST_VOLUME_TO_UNITS;
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
        this._leibMatrix(creature);
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

    // DAS SPRUNG-GESETZ (Q1, Welle L): der EINE Start eines Hüpfers. Die Höhe ist das Freude-Gesetz (VERHALTEN.freude): ein
    // frohes Wesen springt hopHochM, jedes andere den Grund-Hüpfer hopBasisM — dasselbe Etikett, das sein Tempo hebt
    // (freude.tempoMul). Der Abflug ist die Parabel v0 = √(2·g·h) mit dem g des Gang-Gesetzes; der Takt in updateCreatures
    // trägt sie ON TOP der geerdeten Lage (die Erdung bleibt die Wahrheit). Eine Aktion mit `hop` (bound, pounce) zündet
    // ihn (_tickKreaturVerhalten) — kein Abflug in m/s daneben (der alte `def.hop` war ein Zwilling: der frohe Sprung stieg
    // 0,52 statt 1,2 m). Ein Wesen in der Luft springt nicht neu. `ansprung`: der Sprung eines Bisses (_kreaturSprungHoehe).
    // DIE SCHWERE DES HÜPFERS ist die Schwere der Welt (`state.gravity`, die DSL setzt sie) — wie der Gang (`_gangZeile`): ein
    // Wesen springt in einer Welt mit anderer Schwere anders, nie mit der Erd-Schwere seines Studios (K2).
    _hopSchwere() {
        return -this.state.gravity;
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
        const g = this._hopSchwere();
        return g > 0 ? Math.max(BG.dauer, 2 * Math.sqrt((2 * this._kreaturSprungHoehe(creature, true)) / g)) : BG.dauer;
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
    // laufender ebenso (11,73 m). Und nie UNTER EIN DACH (K55-2): über dem neuen Grund steht Luft bis über den Leib — seine
    // Höhe `hoehe` (`_kreaturLeib`, ohne sie eine Stufe) und die Spanne, um die der gezeichnete Boden über dem Gesetz liegt
    // (`KOERPER_SICHT_SPANNE`, Lehre 22: Surface-Nets auf 1,8 m trägt ±0,2 m), sonst ist der Spalt niedriger als der Leib und der
    // Schritt geht in die Wand. In der Höhle 2,6/72,0 fällt der Grund unter einen Überhang (der Keil: 1,1 m Luft, dann 0,8,
    // dann 0,4), ein an die Wand gestoßener Wolf glitt hinein und lag 0,6 m über seinem Fuß im Fels (gate:fall-waechter O3, die
    // Höhle aus der Welt). Leser: `_creatureGroundY`, `_kreaturStossSchritt`, der Blick voraus, der Gang bis zur Wand.
    _koerperSchritt(vx, vz, vg, x, z, hoehe) {
        const stufe = AnazhRealm.PLAYER_STEP_UP;
        const y0 = vg + stufe;
        let g;
        if (!this._fieldSolid(x, y0, z)) {
            g = this._fieldSurfaceBelow(x, y0, z, 40);
            if (g === null) return this._koerperBodenUnter(x, NaN, z);
        } else {
            g = this._koerperBodenUnter(x, vg, z);
            const oben = g + 0.2;
            if (this._fieldSolid(vx, oben, vz)) return null;
            const fels = this._fieldSurfaceBelow(vx, oben, vz, oben - vg);
            if (fels !== null && fels > y0) return null;
        }
        const kopf = (hoehe > 0 ? hoehe : stufe) + AnazhRealm.KOERPER_SICHT_SPANNE;
        return this._fieldSolid(x, g + kopf, z) ? null : g;
    }

    // [ATMOSPHERE] Compound-Tags einer Soul (ohne Kreatur-Instanz zu brauchen).
    // Wrapper um computeCompoundTags({parts: soul.bodyParts}) — wird in
    // _pickFaunaSoulAtPlayer für Affinity-Vergleich vor dem Spawn gebraucht.
    _creatureSoulTags(soulName) {
        const soul = AnazhRealm.CREATURE_SOULS && AnazhRealm.CREATURE_SOULS[soulName];
        if (!soul || !soul.bodyParts) return {};
        return this.computeCompoundTags({ parts: soul.bodyParts });
    }

    // [ATMOSPHERE] Soul-Wahl für eine neue Kreatur per Affinity-Pick: Compound-Tags · Welt-Feld
    // (Dot-Product), höchste Resonanz gewinnt (dieselbe Logik wie spawnAffinityForBlueprint);
    // noise 0.15 streut wiederholte Spawns (aus dem Fauna-Strom). Optionales x, z ersetzt die Spieler-Position.
    _pickFaunaSoulAtPlayer(x, z, rng = this._faunaRng()) {
        const pm = this.state.playerMesh;
        if ((!pm && (x === undefined || z === undefined)) || typeof this.worldFieldAt !== "function") {
            return this._pickCreatureSoulName(null, rng);
        }
        const px = x !== undefined ? x : pm.position.x;
        const pz = z !== undefined ? z : pm.position.z;
        const field = this.auraAt(px, pz); // §5 (V17.25): via auraAt (living Lese-API)
        if (!field) return this._pickCreatureSoulName(null, rng);
        // Kandidaten: alle Built-in-Souls mit ihren Compound-Tags — auch der Wolf (G4a: das Rudel kommt ambient in die Wildnis;
        // bis dahin hielt ein predator-Filter jedes Raubtier aus der Welt, der Spieler sah ein Rudel nur, wenn er es rief)
        const souls = AnazhRealm.CREATURE_SOULS;
        if (!souls) return this._pickCreatureSoulName(null, rng);
        const candidates = Object.keys(souls).map((name) => ({
            name,
            tags: this._creatureSoulTags(name),
        }));
        const { pick } = this._affinityPickFromCandidates(candidates, field, 0.15, rng);
        return (pick && pick.name) || this._pickCreatureSoulName(null, rng);
    }

    // Findet die älteste Kreatur (kleinster bornAt). Für Tod-Wahl bei
    // Überpopulation — wer am längsten da ist, geht zuerst. Defensiv gegen
    // Kreaturen ohne bornAt (z.B. aus Legacy-Save).
    _findOldestCreature() {
        if (!this.state.creatures || this.state.creatures.length === 0) return null;
        let oldest = null;
        let oldestBorn = Infinity;
        for (const c of this.state.creatures) {
            const b = (c && c.userData && c.userData.bornAt) || 0;
            if (b < oldestBorn) {
                oldestBorn = b;
                oldest = c;
            }
        }
        return oldest;
    }

    // [ATMOSPHERE] Lifecycle-Tod: Trauer (sorrow), journal-loss-Eintrag, Aura-Pulse, dann der Fall (_kreaturFaellt: der
    // letzte Ruf, kippen, liegen, sinken). Memory stirbt bewusst mit der Kreatur.
    _creatureNaturalDeath(creature) {
        if (!creature) return false;
        const name = (creature.userData && creature.userData.name) || "(unbenannt)";
        const soul = (creature.userData && creature.userData.soul) || "wesen";
        const bornAt = (creature.userData && creature.userData.bornAt) || 0;
        const ageSec = bornAt > 0 ? (Date.now() - bornAt) / 1000 : null;
        // Tags BEVOR das Wesen fällt
        const tags = this.computeCreatureCompoundTags(creature);
        // Trauer ∝ Bindung × Vitalität: eine gebundene Gefährtin zu verlieren schmerzt mehr. Der
        // `lebendig`-Tag färbt hier SORROW (nicht joy wie die Bau-Brücke) — darum eine explizite Magnitude
        // statt der Tag-Brücke.
        const bond = (creature.userData && creature.userData.bond) || 0;
        const lebendig = Math.min(1, Math.max(0, (tags && tags.lebendig) || 0));
        const griefMag = 0.3 + bond * 1.2 + lebendig * 0.4; // ungebunden ~klein, tief gebunden ~Trauer
        this._feelAction("loss", { magnitude: griefMag });
        // Der Tod nährt das Feld: das Wesen gibt seine Lebendigkeit (∝ lebendig-Substanz) an den Ort
        // zurück — im SELBEN Overlay, in das die Geburt schreibt.
        if (typeof this._depositLife === "function" && creature.position) {
            this._depositLife(
                creature.position.x,
                creature.position.z,
                AnazhRealm.LIFE_FIELD.pulseCenter * (0.8 + lebendig)
            );
        }
        // Journal-Eintrag
        if (typeof this.journalAppend === "function") {
            this.journalAppend("loss", `${name} kehrt zur Erde zurück.`, {
                creature: name,
                soul,
                ageSec,
                cause: "fauna_lifecycle",
            });
        }
        // DER FALL (Posten 7): das Wesen fällt auf die Flanke, liegt und sinkt in die Erde (_kreaturFaellt — derselbe Weg wie
        // der Tod im Kampf); das Lebewohl, der letzte Ruf (klang:UMWELT.tier, Trauer-Kontur), klingt im Fall — der Leichnam
        // ruft nie. Memory wird bewusst verworfen, nicht ins Journal kopiert.
        this._kreaturFaellt(creature);
        this.state.faunaLifecycle.lastDeathAt = Date.now();
        return true;
    }

    // DER FAUNA-STROM (Lehre 7, Γ5): jeder Wurf des Tier-Lebens zieht aus einem seed-gebundenen Strom der Welt, nie aus
    // Math.random (Peers und Reloads würfelten sonst verschiedene Faunen) — je ZWECK ein eigener Strom (das Stream-Gesetz
    // `_streamRng`: ein Wurf mehr re-rollt nie einen anderen): "fauna" der Lebenszyklus (Geburts-Ort, Seele, Gemüt, Geburts-
    // und Todes-Takt, Gegenwehr), "gefuehl" das Wetter-Gefühl, "stimme" die Wahl der Worte, "hof" der Ort einer Hof-Geburt.
    // Wechselt die Welt (ihr Seed), beginnen die Ströme neu.
    _faunaRng(zweck = "fauna") {
        const seed = (this.state.worldMeta && this.state.worldMeta.seed) || "anazh-realm-seed";
        let f = this._faunaStroeme;
        if (!f || f.seed !== seed) f = this._faunaStroeme = { seed, rng: Object.create(null) };
        return f.rng[zweck] || (f.rng[zweck] = this._streamRng(seed + "-" + zweck));
    }

    // DER GEBURTS-ORT — die Boot-Regel als EIN Gesetz für den Boot-Spawn UND die natürliche Geburt: fern
    // (CREATURE_SPAWN_FAR_MIN + Streu-Spanne um den Spieler), außerhalb des Blicks und auf freiem Grund
    // (`_kreaturGrundFrei`); das Wesen taucht aus der Distanz auf, sein Satz blendet ein (`einblenden`). Die Leben-Prüfung
    // (R-D13) sah die Geburt 12–25 m vor dem Spieler, einen Hirsch 2 m neben ihm. Bis zu acht Würfe suchen einen freien Ort
    // außerhalb des Blicks; fern ist jeder. Ein WUNSCH-Ort (die Nexus-Geburt am Ort des Bedarfs) gilt, wenn er selbst fern,
    // außerhalb des Blicks und frei liegt.
    _kreaturGeburtsOrt(rng, spanne = 80, wunsch = null) {
        const pm = this.state.playerMesh;
        const cx = pm ? pm.position.x : 0;
        const cz = pm ? pm.position.z : 0;
        if (wunsch && Math.hypot(wunsch.x - cx, wunsch.z - cz) >= AnazhRealm.CREATURE_SPAWN_FAR_MIN) {
            if (!this._kreaturImBlick(wunsch.x, wunsch.z))
                return this._kreaturGrundFrei(wunsch.x, wunsch.z) ? { x: wunsch.x, z: wunsch.z } : null;
        }
        // Die Geburt ist ein Wurf des Feldes: trägt kein Wurf freien Grund, gibt es keinen Ort (null — kein Boot-, Natur-
        // oder Nexus-Tier; der Akt eines Menschen ruft Leben weiter überall).
        let ort = null;
        for (let k = 0; k < 8; k++) {
            const ang = rng() * Math.PI * 2;
            const d = AnazhRealm.CREATURE_SPAWN_FAR_MIN + rng() * spanne;
            const x = cx + Math.cos(ang) * d;
            const z = cz + Math.sin(ang) * d;
            if (!this._kreaturGrundFrei(x, z)) continue;
            ort = { x, z };
            if (!this._kreaturImBlick(x, z)) break;
        }
        return ort;
    }

    // Steht (x, z) im Blick des Spielers (das Frustum des Vor-Takts, einen Meter über dem Grund)? Ohne Frustum nie.
    _kreaturImBlick(x, z) {
        const fr = this._frustumCache;
        if (!fr) return false;
        const v = this._geburtsOrtV || (this._geburtsOrtV = new THREE.Vector3());
        return fr.containsPoint(v.set(x, this.getTerrainHeightAt(x, z) + 1, z));
    }

    // TRÄGT DER GRUND EIN GEBORENES TIER? Die Geburt ist ein Wurf des Felds (`_wildnisTraegt`) und weicht dem Bau wie jeder
    // Wurf (`_weichtDemBau`): nie im Grundriss eines Baus und nie auf der Lichtung des Genesis-Platzes (`_imGrundriss`),
    // nie in der Hülle eines Dorfs (`wegeKarte.siedlungen`: Wege, Plätze, Äcker und die Häuser zwischen ihnen). Bis G4a
    // fragte die Geburt nur die Wildnis — ein Rudel hätte im Start-Dorf (110–170 m vom Genesis-Ort) geboren werden können.
    _kreaturGrundFrei(x, z) {
        if (!this._wildnisTraegt(x, z) || this._imGrundriss(x, z)) return false;
        const wk = this.state.wegeKarte;
        if (wk) for (const b of wk.siedlungen) if (x >= b.x0 && x <= b.x1 && z >= b.z0 && z <= b.z1) return false;
        return true;
    }

    // DER WURF (G4a): die Geburt wirft eine GRUPPE nach dem Gesetz des Kerns (tetrapoda VERHALTEN.herde.wurf): die Kopfzahl
    // [min, max] der Gattung — das Rudel, die Herde, der Einzelgänger — und den Abstand der Geworfenen in Paar-Räumen. Der
    // erste steht am Ort, jeder weitere auf der Sonnenblumen-Spirale um ihn (Abstand × √k im Goldwinkel: keiner im Raum des
    // anderen, jeder im Fenster der Herde) — jeder nach dem Gesetz des Geburts-Orts: fern, außerhalb des Blicks, auf freiem
    // Grund; wo es nicht trägt, fehlt er. Alle teilen den Anker der Leine (den Wurf-Ort): die Gruppe bleibt beisammen.
    // `platz` deckelt die Kopfzahl (FAUNA_MAX und maxCreatures gelten für die Summe). Vorher warf jede Geburt EIN Tier an
    // einem Einzelort — Herden bildeten sich kaum, ein Rudel sah der Spieler nie (Fäden 16.10.: 25 %). Liefert die Geborenen.
    _kreaturWurf(ort, seele, emotion, rng, platz) {
        const soul = this._pickCreatureSoulName(seele, rng);
        const geboren = [];
        if (!soul) return geboren;
        const W = AnazhRealm._verhaltenGesetz().herde.wurf;
        const zeile = W[AnazhRealm.TETRAPODA_SOUL_MAP[soul]];
        const kopf = zeile ? zeile[0] + Math.floor(rng() * (zeile[1] - zeile[0] + 1)) : 1;
        const n = Math.min(kopf, platz);
        // hält der Platz die kleinste Gruppe der Gattung nicht, fällt der Wurf (kein Rudel aus einem Wolf: der Deckel
        // schneidet nie die Gruppe, er lässt einem Einzelgänger den Platz — Werkbank 16.10.: „wolf 1" am Ende des Boot-Wurfs)
        if (zeile && n < zeile[0]) return geboren;
        const dreh = rng() * Math.PI * 2;
        const pm = this.state.playerMesh;
        const p = pm ? pm.position : { x: 0, y: 0, z: 0 };
        const symphonie = this.state.symphony && this.state.symphony.enabled;
        if (symphonie) this.state.symphony.enabled = false; // still: kein Ping-Schwall
        // der Abstand der Spirale: abstandRaum × der Paar-Raum der Gattung (der Raum des ersten bei Größe 1 — die Größe
        // jedes Tiers ist seine Identität, `_creatureBodySize`); ein Platz, der nicht trägt, gibt sein Tier dem nächsten
        let abstand = 0;
        for (let k = 0; geboren.length < n && k < 2 * n; k++) {
            const a = dreh + k * 2.39996;
            const x = ort.x + Math.cos(a) * abstand * Math.sqrt(k);
            const z = ort.z + Math.sin(a) * abstand * Math.sqrt(k);
            if (k > 0) {
                const fern = Math.hypot(x - p.x, z - p.z) >= AnazhRealm.CREATURE_SPAWN_FAR_MIN;
                if (!fern || this._kreaturImBlick(x, z) || !this._kreaturGrundFrei(x, z)) continue;
            }
            const gY = this.getTerrainHeightAt(x, z);
            const c = this.spawnCreatureAt(x, (Number.isFinite(gY) ? gY : p.y) + 1, z, emotion, soul);
            if (!c) break; // die Obergrenze oder die Gestalt: der Rest des Wurfs fällt mit
            c.userData.wanderAnchor = { x: ort.x, z: ort.z };
            if (k === 0) abstand = (W.abstandRaum * 2 * this._kreaturRaum(c)) / c.userData.bodySize;
            geboren.push(c);
        }
        if (symphonie) this.state.symphony.enabled = true;
        return geboren;
    }

    // [ATMOSPHERE] Geburt: 6 Kandidaten-Orte nach dem Geburts-Gesetz (fern, außerhalb des Blicks), je die affinity-beste
    // Soul; der Kandidat mit höchstem Affinity-Score gewinnt (bei Gleichstand der frühere Wurf). Die Geburt wirft die GRUPPE
    // der Gattung (`_kreaturWurf`), still; ihr Platz ist, was FAUNA_MAX der Summe lässt. Liefert die Zahl der Geborenen.
    _creatureNaturalBirth() {
        if (typeof this.spawnCreatureAt !== "function") return 0;
        const pm = this.state.playerMesh;
        if (!pm) return 0;
        const rng = this._faunaRng();
        // 6 Kandidaten-Orte + jeweilige Affinity-beste-Soul
        const candidates = [];
        for (let i = 0; i < 6; i++) {
            const ort = this._kreaturGeburtsOrt(rng);
            if (!ort) continue; // die Wildnis trägt den Ort nicht
            const field = typeof this.worldFieldAt === "function" ? this.worldFieldAt(ort.x, ort.z) : null;
            const soul = this._pickFaunaSoulAtPlayer(ort.x, ort.z, rng);
            // Resonanz-Score: Soul-Tags · Field, total
            let score = 0;
            if (field && soul) {
                const tags = this._creatureSoulTags(soul);
                for (const ax of ["lebendig", "dichte", "glut", "magieleitung"]) {
                    score += (field[ax] || 0) * (tags[ax] || 0);
                }
            }
            candidates.push({ x: ort.x, z: ort.z, soul, score });
        }
        // Welt entscheidet: höchster Resonanz-Score gewinnt; der Strom streut schon die Orte.
        if (!candidates.length) return 0;
        let best = candidates[0];
        for (const c of candidates) if (c.score > best.score) best = c;
        const platz = Math.max(1, this._currentFaunaMax() - this.state.creatures.length);
        const geboren = this._kreaturWurf(best, best.soul, "happy", rng, platz);
        if (!geboren.length) return 0;
        // Journal-Eintrag — Geburt ist Welt-Atem, leise Notiz mit Affinität
        if (typeof this.journalAppend === "function") {
            const name = (geboren[0].userData && geboren[0].userData.name) || "(Wesen)";
            const n = geboren.length;
            const text = n > 1 ? `${name} und ${n - 1} weitere treten` : `${name} tritt`;
            this.journalAppend("growth", `${text} in die Welt ein (${best.soul}).`, {
                creature: name,
                soul: best.soul,
                gruppe: n,
                affinityScore: best.score.toFixed(3),
                cause: "fauna_lifecycle",
            });
        }
        this.state.faunaLifecycle.lastBirthAt = Date.now();
        return geboren.length;
    }

    // [ATMOSPHERE] Fauna-Ziel-Population skaliert mit worldFieldAt(player).lebendig: üppiger Wald trägt
    // 12–14 Kreaturen, karger Fels 3–4.
    _currentFaunaTarget() {
        const baseTarget = this.constructor.FAUNA_TARGET_POPULATION; // 8
        const pm = this.state.playerMesh;
        if (!pm || typeof this.auraAt !== "function") return baseTarget;
        const f = this.auraAt(pm.position.x, pm.position.z);
        if (!f) return baseTarget;
        // V17.25 (§5: alle Achsen, via auraAt) — die VOLLE Feld-Lese statt nur
        // lebendig: lebendig HEBT (Leben trägt Leben, +0..10), glut DÄMPFT (eine
        // glühende Ödnis trägt weniger, −0..5). Geklemmt ≥ 2 (nie ganz leer).
        const lebendig = Math.max(0, Math.min(1, f.lebendig || 0));
        const glut = Math.max(0, Math.min(1, f.glut || 0));
        return Math.max(2, Math.round(4 + lebendig * 10 - glut * 5));
    }

    // [ATMOSPHERE] Fauna-Max-Population — symmetrisches Pattern zu Target.
    // Bei sehr lebendiger Region erlauben wir mehr Kreaturen (cap höher).
    _currentFaunaMax() {
        const baseMax = this.constructor.FAUNA_MAX_POPULATION; // 20
        const pm = this.state.playerMesh;
        if (!pm || typeof this.auraAt !== "function") return baseMax;
        const f = this.auraAt(pm.position.x, pm.position.z);
        if (!f) return baseMax;
        // V17.25 (§5: alle Achsen) — lebendig hebt (+0..16), glut dämpft (−0..8).
        const lebendig = Math.max(0, Math.min(1, f.lebendig || 0));
        const glut = Math.max(0, Math.min(1, f.glut || 0));
        return Math.max(4, Math.round(12 + lebendig * 16 - glut * 8)); // 4..28
    }

    // [ATMOSPHERE] Tick alle FAUNA_TICK_INTERVAL_MS: Target + Max aus Welt-Lebendigkeit
    // (_currentFaunaTarget / _currentFaunaMax); Geburt/Tod-Wahrscheinlichkeit durch Emotionen moduliert
    // (sorrow → Tod, peace bremst, hope → Geburten).
    tickFaunaLifecycle(currentTime) {
        const ms = currentTime * 1000;
        const last = this.state.faunaLifecycle.lastTick || 0;
        const interval = this.constructor.FAUNA_TICK_INTERVAL_MS;
        if (ms - last < interval) return;
        this.state.faunaLifecycle.lastTick = ms;
        const count = (this.state.creatures && this.state.creatures.length) || 0;
        const target = this._currentFaunaTarget();
        const max = this._currentFaunaMax();
        const birthCd = this.constructor.FAUNA_BIRTH_COOLDOWN_MS;
        const deathCd = this.constructor.FAUNA_DEATH_COOLDOWN_MS;
        const now = Date.now();
        // die Geburt folgt der EINEN Regel der Kreaturen (`_kreaturenBereit`, K60): unter dem Ladeschirm goss sie, sobald
        // Boot-Phase 3 wartete, die Gattung synchron (Radeon kalt 0,7 s vor dem ersten Bild)
        if (count < target && this._kreaturenBereit()) {
            const sinceBirth = now - (this.state.faunaLifecycle.lastBirthAt || 0);
            // Emotion-Modulation: hope beschleunigt Geburt, peace verlangsamt
            const baseBirth = this.constructor.FAUNA_BIRTH_PROBABILITY;
            const birthP = this._emotionModulate(baseBirth, { hope: 0.08, peace: -0.05 });
            if (sinceBirth >= birthCd && this._faunaRng()() < Math.max(0.02, Math.min(0.5, birthP))) {
                this._creatureNaturalBirth();
            }
        } else if (count > max) {
            const sinceDeath = now - (this.state.faunaLifecycle.lastDeathAt || 0);
            // sorrow erhöht Tod, peace dämpft
            const baseDeath = this.constructor.FAUNA_DEATH_PROBABILITY;
            const deathP = this._emotionModulate(baseDeath, { sorrow: 0.1, peace: -0.06 });
            if (sinceDeath >= deathCd && this._faunaRng()() < Math.max(0.02, Math.min(0.5, deathP))) {
                const oldest = this._findOldestCreature();
                if (oldest) this._creatureNaturalDeath(oldest);
            }
        }
        // Alter zählt: jenseits der Lebensspanne kehrt das älteste Wesen zur Erde zurück, auch bei
        // Population im Soll. Ein Kandidat pro Tick, teilt deathCd.
        {
            const sinceDeath = now - (this.state.faunaLifecycle.lastDeathAt || 0);
            if (count > 2 && sinceDeath >= deathCd) {
                const oldest = this._findOldestCreature();
                const bornAt = oldest && oldest.userData && oldest.userData.bornAt;
                if (bornAt && now - bornAt > AnazhRealm.FAUNA_MAX_AGE_MS) {
                    this._creatureNaturalDeath(oldest);
                    this.state.faunaLifecycle.lastDeathAt = now;
                }
            }
        }
        // Bond-Geburt: ein tief gebundenes Wesen an einem lebendigen Ort (`auraAt`) darf sich über das Soll
        // hinaus fortpflanzen; selbst-limitierend (kleine Chance, geteilter Cooldown, `max` bleibt die Wand).
        if (count >= target && count < max) {
            const sinceBirth = now - (this.state.faunaLifecycle.lastBirthAt || 0);
            if (sinceBirth >= birthCd * 2 && this._faunaRng()() < 0.12) {
                const creatures = this.state.creatures || [];
                for (const c of creatures) {
                    const bond = (c && c.userData && c.userData.bond) || 0;
                    if (bond < 0.6 || !c.position) continue;
                    const aura = typeof this.auraAt === "function" ? this.auraAt(c.position.x, c.position.z) : null;
                    if (!aura || (aura.lebendig || 0) < 0.55) continue;
                    this._creatureNaturalBirth();
                    this.state.faunaLifecycle.lastBirthAt = now;
                    break;
                }
            }
        }
    }
}
_stammZonen(AnazhRealm, [AnazhRealm_kreatur_leben]);

// ===== ATLAS · Kreatur/leben — Außen-Konstanten =====
// DIE KAMPF-GRÖSSE DES LEIBS (Welle LF, Posten 6): die Bezugs-Masse und die Exponenten von Biss, Haut und Leben aus dem
// tetrapoda-Gesetzbuch (KAMPF) — der EINE Leser (computeCreatureStats). Fail-closed.
AnazhRealm._kampfGroesseGesetz = function () {
    if (AnazhRealm._kampfGroesseMemo) return AnazhRealm._kampfGroesseMemo;
    const T = typeof globalThis !== "undefined" ? globalThis.__tetrapodaCore : null;
    const K = T && T.KAMPF;
    if (!K || !(K.refKg > 0) || ![K.biss, K.haut, K.leben].every((x) => Number.isFinite(x) && x >= 0))
        return AnazhRealm._kernPflichtBruch("tetrapoda:KAMPF");
    AnazhRealm._kampfGroesseMemo = Object.freeze({ refKg: K.refKg, biss: K.biss, haut: K.haut, leben: K.leben });
    return AnazhRealm._kampfGroesseMemo;
};

// CREATURE_ARCHETYPES — Tier-Baupläne als Bruchteile der Körper-Länge L: legFrac = Hüfte→Boden,
// segRatio = Ober:Unterschenkel, torsoW/H = Rumpf-Querschnitt, neckFrac/neckTilt = Hals, headFrac,
// tailFrac, eyeFront (1 = Jäger vorwärts, 0 = Pflanzer seitlich), kneeFwd = Knie-Knick. Die EINE
// Quelle ist tetrapoda-core.ARCHETYPES (der Stamm liest nur); der Physik-Richter sichert das Stehen.
Object.defineProperty(AnazhRealm, "CREATURE_ARCHETYPES", {
    get() {
        const core = (typeof globalThis !== "undefined" && globalThis.__tetrapodaCore) || null;
        return (core && core.ARCHETYPES) || null;
    },
});
AnazhRealm.CREATURE_ARCHETYPE_NAMES = Object.freeze(Object.keys(AnazhRealm.CREATURE_ARCHETYPES));
// Die EINE Skelett-g-Quelle der studio-gedockten Seelen: dieselben Werte, die CREATURE_SOULS beim
// Init in `_creatureSkeleton` gießt — damit `_tetrapodaSoulParts` zur BAU-Zeit dasselbe g mit
// dial-überschriebenem Archetyp erneut gießen kann (ohne Rezept bleiben die Modul-bodyParts die
// Wahrheit). archetypeName wird beim Guss über CREATURE_ARCHETYPES aufgelöst.
AnazhRealm.CREATURE_SKELETON_G = Object.freeze({
    wesen: Object.freeze({
        size: 0.6,
        archetypeName: "deer",
        bodyMat: "stein",
        limbMat: "holz",
        headMat: "holz",
        shapes: Object.freeze({ torso: "box", limb: "limb", head: "sphere", snout: "limb", tail: "limb" }),
        bodyBarrel: true,
        bodyColor: 0x6e4d30,
        limbColor: 0x6e4d30,
    }),
    // Die tetrapoda-Gattungen (wolf · fox · bear) als Seelen aus DEMSELBEN Skelett-Gesetz.
    // Shapes+Materialien bewusst = die wesen-Menge ({box,limb,sphere} × stein/holz) → Compound-Tags
    // IDENTISCH zu wesen = keine Spawn-Affinitäts-Verdrängung (winner-take-all); nur Farben +
    // Gattungs-Dials unterscheiden. size = stats-tragende Tarierung (Tie-Band um wesen 0.6).
    wolf: Object.freeze({
        size: 0.58,
        archetypeName: "wolf",
        bodyMat: "stein",
        limbMat: "holz",
        headMat: "holz",
        shapes: Object.freeze({ torso: "box", limb: "limb", head: "sphere", snout: "limb", tail: "limb" }),
        bodyColor: 0x6b6f75,
        limbColor: 0x5c6066,
    }),
    fuchs: Object.freeze({
        size: 0.45,
        archetypeName: "weasel",
        bodyMat: "stein",
        limbMat: "holz",
        headMat: "holz",
        shapes: Object.freeze({ torso: "box", limb: "limb", head: "sphere", snout: "limb", tail: "limb" }),
        bodyColor: 0xa5502a,
        limbColor: 0x7c3a1e,
    }),
    baer: Object.freeze({
        size: 0.72,
        archetypeName: "bear",
        bodyMat: "stein",
        limbMat: "holz",
        headMat: "holz",
        shapes: Object.freeze({ torso: "box", limb: "limb", head: "sphere", snout: "limb", tail: "limb" }),
        bodyBarrel: true,
        bodyColor: 0x4a3524,
        limbColor: 0x3e2c1e,
    }),
});
AnazhRealm.CREATURE_SOULS = Object.freeze({
    // `wesen` ist ein Vierbeiner aus dem Skelett-Gesetz: Rumpf (box stein) + Kopf (sphere holz) +
    // Hals/Beine/Schwanz (holz `limb`-Kapseln). limb aktiviert wie cylinder → Compound-Tags
    // bit-identisch zum alten wesen.
    wesen: Object.freeze({
        // ERFINDER-WELLE — der ehrliche NAME der Gestalt: das wesen IST der Hirsch
        // (deer-Gattung/Archetyp seit F1). Der Schlüssel `wesen` bleibt load-bearing
        // (Saves · Tests · TETRAPODA_SOUL_MAP), nur das Schild modernisiert.
        label: "Hirsch",
        // Das g lebt als Daten in CREATURE_SKELETON_G (byte-identischer Guss): `size` 0.6 = sizeFactor-
        // Tarierung ins Tie-Band (stats-tragend, darum kein Studio-Dial), deer-Archetyp = sanfter
        // Pflanzenfresser. Zur BAU-Zeit dockt `_tetrapodaSoulParts` die tetrapoda-Dials auf denselben Guss;
        // diese Modul-bodyParts bleiben die frozen Wahrheit für Tags/Stats (Dials sind tag-neutral).
        bodyParts: Object.freeze(
            AnazhRealm._creatureSkeleton(
                Object.assign({ archetype: AnazhRealm.CREATURE_ARCHETYPES.deer }, AnazhRealm.CREATURE_SKELETON_G.wesen)
            ).map((p) => Object.freeze(p))
        ),
        auraY: 0.8,
    }),
    // Die restlichen tetrapoda-Gattungen als Seelen (Dials formen sie zur BAU-Zeit über
    // `_tetrapodaSoulParts`, TETRAPODA_SOUL_MAP). Tag-identisch zu wesen → sie teilen seine Spawn-Nische
    // statt sie zu verdrängen; jede ist ambient (G4a: der predator-Stempel des Wolfs fiel mit dem Filter der Picker —
    // wild macht ihn die Gattung, `_creatureTemperament`).
    wolf: Object.freeze({
        label: "Wolf",
        bodyParts: Object.freeze(
            AnazhRealm._creatureSkeleton(
                Object.assign({ archetype: AnazhRealm.CREATURE_ARCHETYPES.wolf }, AnazhRealm.CREATURE_SKELETON_G.wolf)
            ).map((p) => Object.freeze(p))
        ),
        auraY: 0.75,
    }),
    fuchs: Object.freeze({
        label: "Fuchs",
        bodyParts: Object.freeze(
            AnazhRealm._creatureSkeleton(
                Object.assign(
                    { archetype: AnazhRealm.CREATURE_ARCHETYPES.weasel },
                    AnazhRealm.CREATURE_SKELETON_G.fuchs
                )
            ).map((p) => Object.freeze(p))
        ),
        auraY: 0.6,
    }),
    baer: Object.freeze({
        label: "Bär",
        bodyParts: Object.freeze(
            AnazhRealm._creatureSkeleton(
                Object.assign({ archetype: AnazhRealm.CREATURE_ARCHETYPES.bear }, AnazhRealm.CREATURE_SKELETON_G.baer)
            ).map((p) => Object.freeze(p))
        ),
        auraY: 0.85,
    }),
});
AnazhRealm.CREATURE_SOUL_NAMES = Object.freeze(Object.keys(AnazhRealm.CREATURE_SOULS));

AnazhRealm.CREATURE_NAME_POOL = Object.freeze([
    "Nira",
    "Vex",
    "Lumin",
    "Skara",
    "Thal",
    "Yune",
    "Orin",
    "Kai",
    "Aro",
    "Sai",
    "Mira",
    "Zen",
    "Pyx",
    "Quin",
    "Rae",
    "Yto",
    "Una",
    "Wel",
    "Bran",
    "Cova",
    "Nox",
    "Fae",
    "Glim",
    "Hira",
    "Ilen",
    "Joro",
    "Lera",
    "Maev",
    "Toren",
    "Tara",
]);
// W-D/M-F1 (V18.170, R-017) — der Min-Abstand frischer Kreatur-Spawns zum
// Spieler (die M6-Struktur-Klemme aufs Wesen; Restore/Peer-Sicht = precise).
AnazhRealm.CREATURE_SPAWN_CLEAR_M = 3;
// V18.301 — DER LADE-RHYTHMUS-RING: der beim Boot aktive Terrain-Chunk-Ring startet KLEIN
// (eine settled Basis statt 81 Chunks auf einmal) und wächst monoton zum chunkRingRadius-Ziel.
AnazhRealm.CREATURE_SPAWN_FAR_MIN = 130; // V18.315 — Boot-Kreaturen spawnen ≥130 m fern: sie tauchen aus der Distanz auf, ihr Satz blendet ein (_weltFeldEintrag, einblenden)
// Berg-Schatten (feld-natives Hi-Z, s. _archRegionBundleCull): konservativer Sichtlinien-Test
// Kamera→Kugel-Oberkante gegen das EINE Höhen-Gesetz — je bergiger die Welt, desto billiger.
// DIE EINE NAH-GRENZE DES ANALOG-FELDS (Schöpfer-Wort 30.09.: „am Ende AAA-Niveau, nicht Kapseln"): bis hierher ist
// das Studio-Mesh die Gestalt jeder Klasse (Baum · Bau · Tier · Streu), jenseits darf der Analog-Satz tragen. Ein
// Analog-Satz diesseits ist ein Befund mit Namen (`_analogZensus`, gate:analog-nah).
AnazhRealm.ANALOG_NAH_M = 64;
// Bis zur Nah-Grenze ist das Studio-Tier die Gestalt (m, Hysterese ein/aus gegen Flackern); dahinter die Glieder-
// Kapseln im Welt-March (dort sind sie klein im Bild und sparen die Mesh-Kosten). Bis 04.10. stand `ein` bei 55 m:
// ein nahendes Tier lief zwischen 55 und 64 m als Kapsel-Satz.
AnazhRealm.KREATUR_NAH_MESH = Object.freeze({ ein: AnazhRealm.ANALOG_NAH_M, aus: AnazhRealm.ANALOG_NAH_M + 10 });
// Die Spanne, um die der gezeichnete Boden über dem Gesetz liegen kann (Lehre 22: Surface-Nets auf 1,8 m trägt die Feinform
// ±0,2 m): der Schritt eines Leibs (`_koerperSchritt`) verlangt über dem Grund des Gesetzes Luft bis Leib-Höhe + Spanne.
AnazhRealm.KOERPER_SICHT_SPANNE = 0.2;
AnazhRealm.TOD_KIPP_STUETZ = 16;
AnazhRealm.TOD_KIPP_PUNKTE = 1500;
// Die Zelle des Boden-Rasters der Tod-Lage (m): je Zelle EIN Schritt-Boden des Leibs (`_koerperSchritt`), bilinear dazwischen.
// Gemessen 10.10. (Null-Renderer, je 5 Tode): in der Höhle O3 liegt der Wolf 0,02–0,06 m über seinem Stand-Kontakt (die alte
// Tafel: 0,46–0,52 m darunter); je Tod kostet das Raster 180 (Höhle) bzw. 206 (Freiland) Feld-Proben neben den 25 568
// Karten-Lesungen, die auch die alte Tafel trug.
AnazhRealm.TOD_BODEN_ZELLE = 0.5;
