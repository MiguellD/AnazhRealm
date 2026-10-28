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
        // … und die Jäger des Spielers dieses Takts (`_spielerJaeger`): ein Gefallener umstellt ihn nicht mehr
        const sj = this._spielerJaeger ? this._spielerJaeger.indexOf(creature) : -1;
        if (sj >= 0) this._spielerJaeger.splice(sj, 1);
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
        // DIE GEBURT BESTELLT DIE GLIEDER (treffer-kalt, Lehre 14): ist die Gattung kalt, legt der Leerlauf ihren Vorrat, nah
        // zuerst, lange bevor das Tier in Hieb-Reichweite kommt — ab dem ersten Bild in Reichweite ist der Leib treffbar
        this._gliederBestellen(group);
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
        // wirksame Prägung der Gattung ein — nur wenn eine aktiv war (Default-Kreaturen bleiben feld-los).
        // So trägt der Snapshot die Guss-Wahrheit, nicht die spätere Prägung.
        {
            const recIdS = AnazhRealm.TETRAPODA_SOUL_MAP && AnazhRealm.TETRAPODA_SOUL_MAP[chosenSoul];
            if (gussOv) {
                group.userData.gussDials = gussOv;
            } else if (recIdS && this._studioPraegung(recIdS)) {
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
        // + bei der „folge mir"-Geste; gewichtet die Contagion + den Schmerz des Verlusts. Sie ist Zustand und reist mit
        // dem Folgen in den Speicher (`_serializeCreature` bindung, halten.K5).
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
    // NICHT persistiert: Specs (live aus memory abgeleitet), Tasks + carrying (reaktiv) — außer der Bindung.
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
            // DAS ALTER reist mit (Spiel-Zeit, `alterS` des Lebenszyklus — die EINE Uhr des Alters; bornAt ist nur Identität):
            // ohne es kehrte jedes Tier 0 s alt wieder, der Alterstod kam erst nach FAUNA_MAX_AGE_MS ohne Reload
            alterS: ud.alterS > 0 ? ud.alterS : undefined,
            // S7 — die Körpergröße reist mit (Restore re-spawnt mit NEUER netId → bodySize
            // MUSS persistiert werden, sonst änderte das Wesen beim Reload seine Größe).
            bodySize: Number.isFinite(ud.bodySize) ? ud.bodySize : 1,
            // S6 — der Verband und sein Revier reisen mit (ohne sie zerfiele die Herde beim Reload)
            verband: ud.verband != null ? String(ud.verband) : undefined,
            feldWurf: ud.feldWurf === true ? true : undefined, // die Herkunft weicht dem Bau auch nach dem Reload
            revier:
                ud.wanderAnchor && Number.isFinite(ud.wanderAnchor.x) && Number.isFinite(ud.wanderAnchor.z)
                    ? { x: ud.wanderAnchor.x, z: ud.wanderAnchor.z }
                    : undefined,
            // Q12 (Kritik 06.10. §2.5): die Wunde und die Blickrichtung reisen mit — ein verwundeter Hirsch kehrte geheilt
            // zurück (hp 97,3 → 115,4), jeder Leib blickte nach dem Reload nach +z. DIE WUNDE IST EIN ANTEIL DES LEBENS (Welle
            // LF kampf Nachbesserung 2): wie beim Wachsen (_kreaturGroesseSetzen) reist hp/hpMax — das Leben selbst rechnet der Leib
            // beim Restore neu (Gattung × Größe × Masse); ein absolutes hp stand nach einem neuen Lebens-Gesetz verwundet da.
            hpAnteil: Number.isFinite(ud.hp) && ud.hpMax > 0 ? +(ud.hp / ud.hpMax).toFixed(4) : undefined,
            gier: Number.isFinite(creature.rotation && creature.rotation.y)
                ? +creature.rotation.y.toFixed(4)
                : undefined,
            // halten.K4 — die Pfeile, die im Tier stecken, reisen mit (Glied + Lage im Glied, `_pfeileDesTiers`)
            pfeile: this._pfeileDesTiers(creature),
            // halten.K5 — DIE BINDUNG an den Spieler ist Zustand: die Tiefe (bond) und das Folgen (die Argumente des Auftrags
            // follow_player); vorher kehrte jedes gebundene Tier nach dem Reload ungebunden wieder (bond 0,12 → 0, folgt → wander)
            bindung:
                ud.bond > 0 || (ud.task && ud.task.name === "follow_player")
                    ? {
                          bond: +(ud.bond || 0).toFixed(4),
                          folgt: ud.task && ud.task.name === "follow_player" ? { ...ud.task.args } : null,
                      }
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
        // Guss-Dials laufen durch DENSELBEN Prüfer wie der Übergabe-Kanal (Kreatur-PARAMS-Klemme) — ein hand-editierter Save
        // schleust keine Riesen-Dials ein; die Gattung (recId) pinnt TETRAPODA_SOUL_MAP.
        let restoreDials;
        if (snap.gussDials && typeof snap.gussDials === "object" && !Array.isArray(snap.gussDials)) {
            const recIdR = AnazhRealm.TETRAPODA_SOUL_MAP && AnazhRealm.TETRAPODA_SOUL_MAP[snap.soul];
            if (recIdR) {
                const clean = this._studioWerkPruefen("kreatur", recIdR, snap.gussDials);
                if (clean && Object.keys(clean).length) restoreDials = clean;
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
        // ein Stand vor heim-z29b trug kein alterS (das Alter war die Wanduhr seit bornAt, sie zählte Pause und Portal): er
        // beginnt in der Spiel-Zeit bei 0
        if (snap.alterS > 0) c.userData.alterS = snap.alterS;
        // S6 — der Verband kehrt gebunden wieder: seine alte Kennung zeigt auf die netId seines ersten Wiedergekehrten (die
        // Wiederkehr vergibt neue netIds; eine alte Kennung träfe sonst ein fremdes, neu geborenes Leittier), das Revier zurück
        if (snap.verband != null) {
            const wk = this._verbandWiederkehr || (this._verbandWiederkehr = new Map());
            if (!wk.has(snap.verband)) wk.set(snap.verband, c.userData.netId);
            c.userData.verband = wk.get(snap.verband);
        }
        if (snap.revier && Number.isFinite(snap.revier.x) && Number.isFinite(snap.revier.z))
            c.userData.wanderAnchor = { x: snap.revier.x, z: snap.revier.z };
        if (snap.feldWurf === true) c.userData.feldWurf = true;
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
        if (Array.isArray(snap.pfeile)) this._pfeileInsTierLaden(c, snap.pfeile); // halten.K4: die Pfeile stecken wieder
        // halten.K5: die Bindung kehrt wieder — still (keine Geste, kein Sprung der Bindung, kein Ruf)
        const B = snap.bindung;
        if (B && typeof B === "object") {
            if (Number.isFinite(B.bond)) c.userData.bond = Math.max(0, Math.min(1, B.bond));
            if (B.folgt && typeof B.folgt === "object")
                this.assignCreatureTask(c, "follow_player", B.folgt, { silent: true });
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
        // DAS WESEN ERINNERT, WER ES FÜTTERTE (Ökologie K3): die Gabe senkt die Furcht vor dem Spieler (`_kreaturFurchtErinnert`)
        if (ok) this._creatureRemember(creature, "gefuettert", { gabe: blueprintName, label: bp.label });
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
        // (_leibMasse — das Volumen der Gestalt × ρ(fleisch) der Stoff-Zeile: Gattung UND Größe, dieselbe Masse wie Stoß, Beute und
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
        if (opts.source === "player") this._bewohnerZeuge(creature.position); // wer es sieht, erinnert es (mensch.K5)
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
        // DAS WESEN ERINNERT, WER ES SCHLUG (Ökologie K3): der Schlag des Spielers wird eine Erinnerung — das Furcht-Gesetz
        // liest sie bei jeder Begegnung (`_kreaturFurchtErinnert`), sie reist im Speicherstand (`_serializeCreature`)
        if (opts.source === "player") this._creatureRemember(creature, "geschlagen", { von: "spieler" });
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
            // jagte das gefallene Wesen dich FRISCH (lastHuntAt im Fenster), sagt es das Tagebuch; der TRIUMPH selbst ist kein
            // Stempel mehr — der Fall löst das Umstellen in der Situation (`_spielerUmstellt`), ihr δ hebt joy + hope
            const lastHunt = creature.userData && creature.userData.lastHuntAt;
            if (
                Number.isFinite(lastHunt) &&
                this.state.creatureAnimationTime - lastHunt < AnazhRealm._verhaltenGesetz().jagd.triumphWindowSec
            )
                this.journalAppend(
                    "relationship",
                    AnazhRealm._datum`Du hast die Bedrohung bezwungen — ${name} jagt dich nie wieder.`
                );
        }
        if (typeof this.journalAppend === "function") {
            const lootSummary = lootParts.length > 0 ? ` → ${lootParts.join(", ")}` : "";
            this.journalAppend("relationship", AnazhRealm._datum`${name} fiel im Kampf${lootSummary}.`, {
                source,
                loot,
            });
        }
        // DER ORT ERINNERT DEN RISS (Ökologie K3, tetrapoda FURCHT_GESETZ.riss): der Tod im Kampf prägt die Emotion des Schadens
        // in die Zelle des Falls (`_depositEmotion`) — die Beute meidet sie, bis der Abdruck verblasst (`_kreaturFurchtOrt`).
        // Von Spieler-Hand ist der Fall eine Tat (`_handTat`, affekt K1#2): sein Fehlen geht ins Leben des Orts (die Narbe
        // `TAT_NARBE.riss`, `_tatSchreiben`), gewertet an der Situation davor und danach — der Riss senkt sie, der Fall eines
        // Jägers löst sein Umstellen. Der Riss eines Jägers der Wildnis ist ihr Kreislauf (der Kadaver nährt), keine Narbe: mit
        // ihr kippte die Kaskade (gate:kreatur-takt kaskade, Wölfe −0,52 statt 0).
        const p = creature.position;
        const fall = () => {
            if (p) this._depositEmotion(p.x, p.z, AnazhRealm._furchtGesetz().F.riss);
            this._kreaturFaellt(creature); // der Fall: kippen, liegen, sinken — kein Wesen mehr
        };
        if (source === "player" && p) this._handTat("toeten", p, () => (this._tatSchreiben("riss", p.x, p.z), fall()));
        else fall();
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
                    AnazhRealm._datum`${ud.name || "Ein Wesen"} fiel mit seiner Last — sie fällt an dich zurück: ${zurueck.join(", ")}.`,
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
        // wohin Platz ist (die Flanke hangab, steht dort eine Wand, die andere Flanke: `_todKippWahl`), rechnet der Leerlauf
        // (`_todLageBestellen`): bis die Tafel steht, ist `hebe` undefined und der Leib steht in der Haltung seines Todes —
        // `fall` (die Uhr des Kippens) zählt ab TOD_LAGE.vorlaufSec nach dem Tod (`_todLageFrist`), `t` (die Uhr des
        // Leichnams: Kadaver, Frist) ab dem Tod
        creature.userData.dying = {
            t: 0,
            fall: 0,
            dauer: K.kippDauerSec,
            nachklang: K.leichnamSec,
            sinken: K.leichnamSinkSec,
            dirX: hx,
            dirZ: hz,
            baseQuat: creature.quaternion.clone(),
            baseY: creature.position.y,
            hebe: undefined,
        };
        this._todLageBestellen(creature, creature.userData.dying);
        // DER KADAVER (Meisterkarte Tiere H3, tetrapoda VERHALTEN.aas): der gefallene Leib trägt sein Fleisch (kg: fleischAnteil ×
        // die EINE Masse des Leibs, _leibMasse), sein Alter ist die Uhr seines Falls (dying.t). Fressen verbraucht es
        // (_kreaturAasZug), sein Geruch ruft jeden Nicht-Pflanzenfresser, ein leerer Kadaver sinkt (_tickLeichname). Ein Leib
        // ohne gemessene Gestalt hat keine Masse und kein Fleisch.
        const tbK = ud._tierBaum;
        if (tbK && tbK.leibV > 0)
            ud.kadaver = { fleisch: AnazhRealm._verhaltenGesetz().aas.fleischAnteil * this._leibMasse(creature) };
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
    // Kippen bis 54,2 cm; ohne Hebung lag er 84 cm im Gelände (gate:koerper-stand K5). Einmal je Tod, nie je Frame, nie im
    // Takt: ein Gang (`yield` je Winkel), den der Leerlauf treibt (`_todLageTick`); die Haut liest `_todHaut` einmal je Tod,
    // das Boden-Raster `zellen` um die Wurzel ist für jede Kipp-Richtung desselben Tods dasselbe.
    *_todHebeTafel(creature, haut, zellen, hx, hz) {
        const n = AnazhRealm.TOD_KIPP_STUETZ;
        const wMax = AnazhRealm.TOD_KIPP_RAD;
        const px = creature.position.x;
        const py = creature.position.y;
        const pz = creature.position.z;
        const ax = hz; // die Kipp-Achse (horizontal, ⊥ h)
        const az = -hx;
        const pD = [];
        const pY = haut.y;
        const pE = [];
        for (let i = 0; i < pY.length; i++) {
            pD.push(haut.x[i] * hx + haut.z[i] * hz);
            pE.push(haut.x[i] * ax + haut.z[i] * az);
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
        yield;
        // DAS SOLL DES KLEINSTEN ABSTANDS: was er im Stand war — stand der Leib schon im Boden (der Stand am Fuß einer Wand
        // steiler als 45°, stand < 0), geht das Soll im Kippen linear auf 0: der tote Leib legt sich AUF den Boden, nie
        // tiefer. Vorher hielt die Tafel den Stand-Fehler: ein Wolf, der 0,68 m im Hang stand, sank kippend 0,92 m in den Grund.
        const hebe = new Float32Array(n + 1);
        for (let k = 1; k <= n; k++) {
            const soll = stand < 0 ? stand * (1 - k / n) : stand;
            const sp = spalt(k);
            hebe[k] = Number.isFinite(sp) ? soll - sp : hebe[k - 1];
            if (k < n) yield;
        }
        return hebe;
    }

    // DIE HAUT DER TOD-LAGE: die Punkte der gezeigten Stufe in der Haltung des Todes (Skin angewandt) relativ zur Wurzel,
    // höchstens TOD_KIPP_PUNKTE — einmal je Tod, jede Kipp-Richtung liest sie. null: keine Haut.
    _todHaut(creature) {
        const px = creature.position.x;
        const py = creature.position.y;
        const pz = creature.position.z;
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
        const x = [];
        const y = [];
        const z = [];
        for (const o of haut) {
            const pa = o.geometry.attributes.position;
            for (let i = 0; i < pa.count; i += schritt) {
                o.getVertexPosition(i, v);
                v.applyMatrix4(o.matrixWorld);
                x.push(v.x - px);
                y.push(v.y - py);
                z.push(v.z - pz);
            }
        }
        return { x, y, z };
    }

    // DIE KIPP-RICHTUNG (Prüfung 2 K02a, Wolf am Wandfuß, Gier 225°): der Leib kippt auf die Flanke hangab (_kreaturFaellt)
    // — steigt dort der Boden unter der gekippten Haut so, dass die Tafel die Wurzel mehr als eine Stufe heben müsste, kippt
    // er in eine Wand (unter Fels gelesen am Punkt: die Wurzel stieg 2,8 m auf den Wand-Buckel; aus dem Raster ohne Wand sank
    // er 0,84 m hinein). Dann fällt er dorthin, wo Platz ist: zuerst auf die andere Flanke, erst wo keine Flanke Platz hat
    // längs der Achse (der Leib liegt auf einer Flanke — längs der Achse stand der Hirsch auf dem Hinterteil, Bild ks09);
    // hat keine Richtung Platz, die mit dem kleinsten Hub. Hebt die erste Flanke höchstens eine Stufe, bleibt alles, wie es war.
    // Ein Gang wie die Tafel: die Haut (im Tod gelesen, `_todLageBestellen`) und das Raster einmal, je Richtung ihre Tafel; am
    // Ende { hx, hz, hebe }.
    *_todKippWahl(creature, hx, hz, haut) {
        if (!haut) return { hx, hz, hebe: null };
        const zellen = new Map();
        const hub = (h) => (h ? Math.max(...h) : Infinity);
        const stufe = AnazhRealm.PLAYER_STEP_UP;
        let best = { hx, hz, hebe: yield* this._todHebeTafel(creature, haut, zellen, hx, hz) };
        if (!(hub(best.hebe) > stufe)) return best;
        for (const [x, z] of [
            [-hx, -hz],
            [hz, -hx],
            [-hz, hx],
        ]) {
            const hebe = yield* this._todHebeTafel(creature, haut, zellen, x, z);
            if (hub(hebe) < hub(best.hebe)) best = { hx: x, hz: z, hebe };
            if (!(hub(best.hebe) > stufe)) return best;
        }
        return best;
    }

    // DIE TOD-LAGE IM LEERLAUF (dorf-takt-z13, Lehre 14 und 25): jeder Tod bestellt seine Lage (`_kreaturFaellt`), der
    // Leerlauf des Haupt-Fadens rechnet sie (`_imLeerlauf`) Winkel für Winkel, solange sein Fenster reicht, den Gefallenen
    // nah am Spieler zuerst — nie im Takt. `fall` ist der Fall des Leibs (`dying`), `fall.lage` das Versprechen der Tafel.
    // Bis dorf-takt-z13 rechnete der Tod sie im Takt: auf der Radeon 12–17 ms je Tafel, ein Hungertod im Dorf ein Takt von
    // 41,3 ms (Tod-Lage 31,3 ms).
    _todLageBestellen(creature, fall) {
        const Q = this._todLagen || (this._todLagen = []);
        // die Haut in der Haltung des Todes liest der Tod selbst (halten.K5, Ereignis-Zeit): rechnete erst der Leerlauf oder
        // die Frist sie, trug die Tafel die Haltung jenes Augenblicks — unter Last 0,2 s später, 6 mm anders gelegt
        const gang = this._todKippWahl(creature, fall.dirX, fall.dirZ, this._todHaut(creature));
        fall.lage = new Promise((fertig) => Q.push({ creature, fall, gang, fertig }));
        if (Q.length === 1) this._imLeerlauf((frist) => this._todLageTick(frist), AnazhRealm.TOD_LAGE.fristMs);
    }
    // Ein Fenster des Leerlaufs (`frist`, die IdleDeadline; ohne sie — die Frist lief ab, die API fehlt — eine Scheibe von
    // TOD_LAGE.scheibeMs): je Schritt ein Winkel; steht die Tafel eines Gefallenen, beginnt sein Fall (`_tickLeichname`).
    _todLageTick(frist) {
        const Q = this._todLagen;
        if (!Q || !Q.length) return;
        const T = AnazhRealm.TOD_LAGE;
        const ende = performance.now() + T.scheibeMs;
        const offen =
            frist && !frist.didTimeout && typeof frist.timeRemaining === "function"
                ? () => frist.timeRemaining() > T.scheibeMs
                : () => performance.now() < ende;
        const p = this.state.playerMesh.position;
        try {
            do {
                let j = 0;
                let dj = Q[0].creature.position.distanceToSquared(p);
                for (let i = 1; i < Q.length; i++) {
                    const di = Q[i].creature.position.distanceToSquared(p);
                    if (di < dj) [j, dj] = [i, di];
                }
                if (this._todLageSchritt(Q[j])) Q.splice(j, 1);
            } while (Q.length && offen());
        } finally {
            if (Q.length) this._imLeerlauf((f) => this._todLageTick(f), T.fristMs);
        }
    }
    // EIN Winkel der Tafel eines Gefallenen; steht sie (oder liegt er nicht mehr), trägt sein Fall ihre Lage — dann true.
    _todLageSchritt(a) {
        const s = this.state.leichname.indexOf(a.creature) !== -1 ? a.gang.next() : { done: true, value: null };
        if (!s.done) return false;
        if (s.value) {
            a.fall.dirX = s.value.hx;
            a.fall.dirZ = s.value.hz;
        }
        a.fall.hebe = s.value ? s.value.hebe : null;
        a.fertig(a.fall.hebe);
        return true;
    }
    // DIE FRIST DER TOD-LAGE (halten.K5, Ereignis-Zeit): steht die Tafel TOD_LAGE.vorlaufSec nach dem Tod (Kreatur-Uhr) nicht,
    // rechnet der Takt ihren Rest jetzt (`_tickLeichname`) — der Fall beginnt bei jeder Bildrate und Last im selben Augenblick.
    _todLageFrist(creature) {
        const Q = this._todLagen || [];
        const j = Q.findIndex((a) => a.creature === creature);
        if (j < 0) return;
        while (!this._todLageSchritt(Q[j]));
        Q.splice(j, 1);
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
            this.journalAppend("growth", AnazhRealm._datum`${name} erreicht Stufe ${newLevel} als ${role}.`, {
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
            ? `Du hast gerade die HÖCHSTE Stufe (5) als ${kind === "gather" ? "Sammler" : "Bauer"} von „${AnazhRealm._datum(key)}" erreicht. Drücke aus, was dieser Meisterschafts-Moment in dir auslöst — und biete ggf. eine Welt-Aktion an, die zu deiner Freude passt.`
            : `Du hast eine NEUE Stärke entwickelt: ${kind === "gather" ? "Sammler" : "Bauer"} von „${AnazhRealm._datum(key)}" (Stufe ${newLevel}). Drücke diesen Wachstums-Moment aus — und biete ggf. eine Welt-Aktion an, die diesen neuen Pfad feiert.`;
        const personaPrompt = this._buildCreaturePersonaPrompt(creature);
        if (!personaPrompt) return false;
        const fullPrompt = personaPrompt + "\n\n" + eventHint;
        const name = creature.userData.name || "Wesen";
        // Async-Call ohne await — V3 lebt mit Eventual-Render
        this.llmCall("(Selbst-Reflexion: bedeutsamer Moment.)", fullPrompt, { hintergrund: true })
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
            .catch((e) => this._bruchMelden("Kreatur-Ereignis (LLM): " + ((e && e.message) || e)));
        return true;
    }

    // Nächste Architektur, deren Bauplan einen Part aus diesem Material trägt. Nur sichtbare (mesh !==
    // null) zählen — Distance-Culling ist die natürliche Reichweite (wie _pickArchitectureAtCrosshair).
    _findNearestArchitectureWithMaterial(fromPos, materialName) {
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
            if (this._gerittenesWerk(a)) continue;
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
    // `_fahrBoden`, `_rittEbene`, `_rittSchritt`, `_todHebeTafel`, der Ruf `spawnCreatureAt`, die Geburt eines Bewohners
    // (`_bewohnerGeburt`). gate:fall-waechter (Q) nennt
    // jede Methode beim Namen, die die Oberkante der Säule liest UND die Höhe eines Leibs berührt, ohne als Platzierung
    // (Geburt, Ersteh-Ort, Rettung aus der Leere) benannt zu sein.
    // DAS EIS (stoffe.K3) trägt wie Fels: ein gefrorener Spiegel (`_eisAt`) über der Fels-Grenze ist der Grund.
    _koerperBodenUnter(x, yRef, z) {
        if (Number.isFinite(yRef)) {
            // eingegraben (der Hang stieg unter dem Schritt): nur eine Stufe aufwärts suchen — tiefer im Fels ist kein
            // Gang (ein Spawn im Gestein), dort trägt die Säule
            const y0 = yRef + AnazhRealm.PLAYER_STEP_UP;
            const g = this._koerperGrund(x, y0, z, this._fieldSolid(x, y0, z) ? 2 : 40);
            if (g !== null) return g;
        }
        const oben = this._voxelSurfaceY(x, z);
        const eis = this._eisAt(x, z, NaN, Infinity, oben);
        return eis !== null && !(oben >= eis) ? eis : oben;
    }

    // DER GRUND EINES KÖRPERS unter y0 binnen `maxDist`: die Fels-Grenze (`_fieldSurfaceBelow`) oder das Eis über ihr
    // (`_eisAt`) — das Höhere trägt, null ohne beides. Leser: der Kapsel-Schritt (`_stepCharacter`), `_koerperBodenUnter`,
    // `_koerperSchritt`, der Ausstieg vom Wagen (`_aussteigOrt`).
    _koerperGrund(x, y0, z, maxDist) {
        const g = this._fieldSurfaceBelow(x, y0, z, maxDist);
        const e = this._eisAt(x, z, y0, maxDist, g);
        return e !== null && !(g >= e) ? e : g;
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
            g = this._koerperGrund(x, y0, z, 40);
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

    // DIE ART WÄHLT DER ORT (Tiere K4, tetrapoda lebensraumWahl): die Boden-Klasse des Orts (`_bodenKlasseAt`) und je Gattung
    // ihr Lebensraum (Eignung × Häufigkeit), ein Wurf aus dem Fauna-Strom; trägt der Ort keine Geburt, gibt es keine Seele
    // (null). Vorher wählte ein Affinitäts-Pick über Tags × Feld mit 0,15 Rauschen — die Seelen sind tag-gleich (Lehre 8), es
    // entschied das Rauschen. Ohne Ort gilt der Ort des Spielers.
    _pickFaunaSoulAtPlayer(x, z, rng = this._faunaRng()) {
        const pm = this.state.playerMesh;
        const LG = AnazhRealm._lebensraumGesetz();
        const klasse = this._bodenKlasseAt(x !== undefined ? x : pm.position.x, z !== undefined ? z : pm.position.z);
        const g = LG.wahl(klasse, rng(), LG.L);
        return AnazhRealm.CREATURE_SOUL_NAMES.find((n) => AnazhRealm.TETRAPODA_SOUL_MAP[n] === g) || null;
    }

    // DIE BODEN-KLASSE an (x, z) (Tiere K4, tetrapoda bodenKlasse): der Rand des nächsten Flusses (`_hydroDistAt`), der Hang
    // des Gelände-Gesetzes (`_terrainMacroSurfaceY`, aus.hang) und die Bestandsdichte des Walds (`_forestStandDensity`).
    _bodenKlasseAt(x, z) {
        const LG = AnazhRealm._lebensraumGesetz();
        const h = this._hydroDistAt(x, z);
        const aus = this._bodenKlasseAus || (this._bodenKlasseAus = {});
        this._terrainMacroSurfaceY(x, z, true, aus);
        return LG.bodenKlasse(h.dist - Math.max(1, h.halfW), aus.hang || 0, this._forestStandDensity(x, z), LG.L);
    }

    // Findet die älteste Kreatur — das größte Alter in Spiel-Zeit (`alterS`, gezählt im Lebenszyklus), bei Gleichstand die
    // früher Geborene (die Liste trägt die Geburts-Folge) —, mit gattung nur ihrer Gattung, mit nur (Set) nur unter ihm. Für die
    // Tod-Wahl am Hunger, am Riss und am Alter: wer am längsten da ist, geht zuerst. Vorher wählte die Wanduhr der Geburt
    // (bornAt): Geschwister eines Wurfs teilten oder trennten ihre Millisekunde je nach Lauf, dieselbe Saat starb anders.
    _findOldestCreature(gattung, nur = null) {
        let oldest = null;
        for (const c of this.state.creatures) {
            if ((gattung && AnazhRealm.TETRAPODA_SOUL_MAP[c.userData.soul] !== gattung) || (nur && !nur.has(c)))
                continue;
            if (!oldest || (c.userData.alterS || 0) > (oldest.userData.alterS || 0)) oldest = c;
        }
        return oldest;
    }

    // [ATMOSPHERE] Lifecycle-Tod: Trauer (sorrow), journal-loss-Eintrag (mit der Ursache: hunger · alter), Aura-Pulse, dann
    // der Fall (_kreaturFaellt: der letzte Ruf, kippen, liegen, sinken). Memory stirbt bewusst mit der Kreatur.
    _creatureNaturalDeath(creature, ursache = "alter") {
        if (!creature) return false;
        const name = (creature.userData && creature.userData.name) || "(unbenannt)";
        const soul = (creature.userData && creature.userData.soul) || "wesen";
        const ageSec = (creature.userData && creature.userData.alterS) || 0; // das Alter in Spiel-Zeit (`alterS`)
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
            this.journalAppend("loss", AnazhRealm._datum`${name} kehrt zur Erde zurück.`, {
                creature: name,
                soul,
                ageSec,
                cause: "fauna_lifecycle",
                ursache,
            });
        }
        // DER FALL (Posten 7): das Wesen fällt auf die Flanke, liegt und sinkt in die Erde (_kreaturFaellt — derselbe Weg wie
        // der Tod im Kampf); das Lebewohl, der letzte Ruf (klang:UMWELT.tier, Trauer-Kontur), klingt im Fall — der Leichnam
        // ruft nie. Memory wird bewusst verworfen, nicht ins Journal kopiert.
        this._kreaturFaellt(creature);
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
    // `platz` deckelt die Kopfzahl (die Kosten-Kappe maxCreatures gilt für die Summe). Vorher warf jede Geburt EIN Tier an
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
        // DER LEBENSRAUM DES WURFS (Tiere K4): liegt der Wurf-Ort im Lebensraum der Gattung, steht jeder Geworfene in ihm (ein
        // Platz am Saum, der schon Wald ist, gibt sein Tier dem nächsten); ein Akt, der anderswo wirft, wirft frei
        const LG = AnazhRealm._lebensraumGesetz();
        const lebt = (x, z) => LG.lebensraum(AnazhRealm.TETRAPODA_SOUL_MAP[soul], this._bodenKlasseAt(x, z), LG.L) > 0;
        const imRaum = lebt(ort.x, ort.z);
        // das Fenster der Herde (herde.fensterRaum Paar-Räume): jeder Geworfene steht in ihm zu einem, der schon steht
        const fenster = AnazhRealm._verhaltenGesetz().herde.fensterRaum / W.abstandRaum;
        for (let k = 0; geboren.length < n && k < 3 * n; k++) {
            // der Abstand wächst mit den Geworfenen, nicht mit den Würfen: ein Platz, der nicht trägt, gibt seinen Ring dem
            // nächsten Winkel
            const a = dreh + k * 2.39996;
            const x = ort.x + Math.cos(a) * abstand * Math.sqrt(geboren.length);
            const z = ort.z + Math.sin(a) * abstand * Math.sqrt(geboren.length);
            if (k > 0) {
                const fern = Math.hypot(x - p.x, z - p.z) >= AnazhRealm.CREATURE_SPAWN_FAR_MIN;
                if (!fern || this._kreaturImBlick(x, z) || !this._kreaturGrundFrei(x, z) || (imRaum && !lebt(x, z)))
                    continue;
                if (!geboren.some((g) => Math.hypot(g.position.x - x, g.position.z - z) <= fenster * abstand)) continue;
            }
            const gY = this.getTerrainHeightAt(x, z);
            const c = this.spawnCreatureAt(x, (Number.isFinite(gY) ? gY : p.y) + 1, z, emotion, soul);
            if (!c) break; // die Obergrenze oder die Gestalt: der Rest des Wurfs fällt mit
            c.userData.wanderAnchor = { x: ort.x, z: ort.z };
            // DIE MARKE DES WURFS (`feldWurf`, wie am Wurf eines Werks, im Save): ein Bau, der nach der Geburt kommt, räumt das
            // Tier aus seinem Grundriss (`_weichtDemBau`, `_naturRaeumen`)
            c.userData.feldWurf = true;
            if (k === 0) abstand = (W.abstandRaum * 2 * this._kreaturRaum(c)) / c.userData.bodySize;
            geboren.push(c);
        }
        if (symphonie) this.state.symphony.enabled = true;
        this._kreaturVerbinden(geboren);
        return geboren;
    }

    // DER VERBAND (S6): der Wurf bindet seine Geborenen — das Rudel, die Herde — zu EINEM Verband, ein Datum am Leib
    // (`userData.verband` = die netId des Erstgeborenen, des Leittiers; nie ein Tag, nie die Gattung — Lehre 8), und ihr
    // Revier ist der gemeinsame Anker der Leine (`wanderAnchor`, der Wurf-Ort). Der Verband zieht seine Glieder zusammen
    // und richtet sie aus (tetrapoda verbandZug), alarmiert sie gemeinsam (`_kreaturVerbandAlarm`) und jagt als Rudel
    // (rudelPlatz); ein fremder Verband derselben Art verschmilzt nie mit ihm. Vorher stellte der Wurf die Tiere nur
    // nebeneinander — jedes wanderte und floh für sich (Linse herde 18.10.: auf der Flucht 0,186 der Glieder beisammen).
    _kreaturVerbinden(glieder) {
        if (!glieder || !glieder.length) return;
        const vb = glieder[0].userData.netId;
        for (const c of glieder) c.userData.verband = vb;
    }

    // [ATMOSPHERE] Geburt: 6 Kandidaten-Orte nach dem Geburts-Gesetz (fern, außerhalb des Blicks), je die Seele ihres
    // Lebensraums; der Kandidat mit höchstem Affinity-Score gewinnt (bei Gleichstand der frühere Wurf). Die Geburt wirft die
    // GRUPPE der Gattung (`_kreaturWurf`), still; ihr Platz ist, was die Kosten-Kappe `maxCreatures` der Summe lässt. DIE
    // BILANZ (Ökologie K2, `_kreaturBestand`): mit ihr wirft nur eine Gattung unter ihrer Kapazität, mit deren Chance (die
    // Hoffnung des Spielers hebt, sein Frieden dämpft); ohne sie wirft der Ort, was sein Lebensraum trägt (die Frage der
    // Lebensraum-Linse an den Ort). Liefert die Zahl der Geborenen.
    _creatureNaturalBirth(bilanz) {
        if (typeof this.spawnCreatureAt !== "function") return 0;
        const pm = this.state.playerMesh;
        if (!pm) return 0;
        const rng = this._faunaRng();
        // 6 Kandidaten-Orte + jeweilige Seele des Lebensraums
        const candidates = [];
        for (let i = 0; i < 6; i++) {
            const ort = this._kreaturGeburtsOrt(rng);
            if (!ort) continue; // die Wildnis trägt den Ort nicht
            const field = typeof this.worldFieldAt === "function" ? this.worldFieldAt(ort.x, ort.z) : null;
            const soul = this._pickFaunaSoulAtPlayer(ort.x, ort.z, rng);
            if (!soul) continue; // der Lebensraum trägt hier keine Gattung (Tiere K4)
            if (bilanz && !(bilanz[AnazhRealm.TETRAPODA_SOUL_MAP[soul]].geburt > 0)) continue; // ihr Revier ist voll
            // Resonanz-Score: Soul-Tags · Field, total
            let score = 0;
            if (field) {
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
        if (bilanz) {
            const p = bilanz[AnazhRealm.TETRAPODA_SOUL_MAP[best.soul]].geburt;
            if (!(rng() < this._emotionModulate(p, { hope: { mul: 1.5 }, peace: { mul: 0.75 } }))) return 0;
        }
        const platz = this.state.maxCreatures - this.state.creatures.length;
        if (platz <= 0) return 0;
        const geboren = this._kreaturWurf(best, best.soul, "happy", rng, platz);
        if (!geboren.length) return 0;
        // Journal-Eintrag — Geburt ist Welt-Atem, leise Notiz mit Affinität
        if (typeof this.journalAppend === "function") {
            const name = (geboren[0].userData && geboren[0].userData.name) || "(Wesen)";
            const n = geboren.length;
            const text = n > 1 ? `${name} und ${n - 1} weitere treten` : `${name} tritt`;
            this.journalAppend("growth", AnazhRealm._datum`${text} in die Welt ein (${best.soul}).`, {
                creature: name,
                soul: best.soul,
                gruppe: n,
                affinityScore: best.score.toFixed(3),
                cause: "fauna_lifecycle",
            });
        }
        return geboren.length;
    }

    // DER DURST (Tiere K4, tetrapoda durst): die Zeit seit dem letzten Trinken auf der Kreatur-Uhr (ab der Geburt); nach einer
    // Suche ohne Wasser ruht er suchPauseS.
    _kreaturDurstig(creature) {
        const ud = creature.userData;
        const now = this.state.creatureAnimationTime;
        if (!Number.isFinite(ud._getrunken)) ud._getrunken = now;
        if (now < ud._durstSucheBis) return false;
        const LG = AnazhRealm._lebensraumGesetz();
        if (LG.durst(now - ud._getrunken, LG.D) < 1) return false;
        // kein Fluss im Umkreis der Suche (der Rand aus `_hydroDistAt`, ein Blick in die Eimer): keine Suche über das Gelände
        const h = this._hydroDistAt(creature.position.x, creature.position.z);
        if (h.dist - Math.max(1, h.halfW) <= AnazhRealm.CREATURE_DRINK_SEARCH_RADIUS) return true;
        ud._durstSucheBis = now + LG.D.suchPauseS;
        return false;
    }

    // DER TAG DES TIERS (Tiere K4, tetrapoda ETHOGRAMM_GESETZ): je KI-Takt die Pegel über die Zeit seit dem Vor-Takt mit der
    // Tätigkeit, die das Tier in ihr ZEIGTE (`_gezeigt`, gestempelt vom Wandern, `_creatureCharacterWander` — Flucht, Jagd,
    // Kadaver und Auftrag zeigen keine: wach): der Magen (`_kreaturMagen`) und, wer weidet (diet bis weideDiet), seine Äsung;
    // der Ruhe-Pegel. Dann die Tätigkeit aus Pegel und Lichtphase — im Verband die des Leittiers (die Herde ruht und äst
    // beisammen). Eine Gattung ohne Zeile im Ethogramm hat keine (null). Vorher ruhte jedes Tier, solange die Sonne unter
    // nachtSin stand, und weidete am Tag in Aktionen mit Pausen dazwischen (das Rotwild äste ~ 15 % des Tages).
    _kreaturTaetigkeit(creature) {
        const ud = creature.userData;
        const LG = AnazhRealm._lebensraumGesetz();
        const G = LG.E.gattung[AnazhRealm.TETRAPODA_SOUL_MAP[ud.soul]];
        const gez = ud._gezeigt;
        ud._gezeigt = null;
        if (!G) return (ud._taetigkeit = null);
        const now = this.state.creatureAnimationTime;
        const dt = Number.isFinite(ud._taetigT) ? Math.max(0, now - ud._taetigT) : 0;
        ud._taetigT = now;
        const VG = AnazhRealm._verhaltenGesetz();
        const voll = this._kreaturMagenVoll(creature);
        const weidet = this._kreaturDiet(creature) <= VG.stimmung.schwellen.weideDiet;
        let magen = this._kreaturMagen(creature);
        if (gez === "nahrung" && weidet && voll > 0)
            magen = ud.magen = Math.min(voll, magen + LG.aesung(voll, VG.aas.verdauSec, G) * dt);
        // der erste Pegel aus der Identität (deterministisch, kein Zufall): die Tiere eines Orts ruhen nicht im Gleichschritt
        if (!Number.isFinite(ud._ruhe)) {
            const id = parseInt(String(ud.netId || "c0").slice(1), 10) || 0;
            ud._ruhe = ((this._verhaltenHash(id, 4099) % 1000) / 1000) * LG.E.schwelle.ruhig;
        }
        ud._ruhe = LG.ruhePegel(ud._ruhe, gez === "ruhen", dt, G);
        const leit = this._kreaturLeittier(creature);
        if (leit !== creature && leit.userData._taetigkeit) return (ud._taetigkeit = leit.userData._taetigkeit);
        if (this._lichtUhr !== this.state.timeOfDay) {
            this._lichtUhr = this.state.timeOfDay;
            this._lichtPhase = LG.lichtPhase(this._sonnenRichtung().y, VG.stimmung.schwellen.nachtSin, LG.E);
        }
        const anteil = voll > 0 ? magen / voll : 1;
        return (ud._taetigkeit = LG.taetigkeit(
            ud._taetigkeit,
            ud._ruhe,
            anteil,
            this._lichtPhase,
            weidet,
            G,
            LG.E,
            VG.aas.hungerAnteil
        ));
    }
    // DAS LEITTIER eines Verbands: das Glied, dessen netId der Verband trägt (der Erstgeborene des Wurfs), fiel es, das erste
    // Glied; ohne Verband das Tier selbst.
    _kreaturLeittier(creature) {
        const glieder = this._kreaturVerbandGlieder(creature);
        if (!glieder || glieder.length < 2) return creature;
        const vb = creature.userData.verband;
        for (const g of glieder) if (g.userData.netId === vb) return g;
        return glieder[0];
    }
    // DAS TEMPO DER TÄTIGKEIT, die das Wandern zeigt: das ihrer Aktion (ETHOGRAMM_GESETZ.zeigt — ruhen steht, äsen geht im
    // Tempo des Grasens; ziehen wandert); spielt eine Aktion, trägt sie ihr eigenes Tempo (1 hier, der Aktions-Block danach).
    _kreaturTaetigkeitTempo(creature) {
        const ud = creature.userData;
        const VA = ud._verhaltenAktion;
        if (VA && this.state.creatureAnimationTime < VA.bis) return 1;
        const zeigt = ud._gezeigt && AnazhRealm._lebensraumGesetz().E.zeigt[ud._gezeigt];
        const def = zeigt && zeigt.aktion && AnazhRealm._verhaltenGesetz().aktionen[zeigt.aktion];
        return def && Number.isFinite(def.tempo) ? Math.max(0, def.tempo) : 1;
    }

    // DIE NAHRUNG EINES ORTS für den Bestand (Ökologie K2): die Äsung = das Leben des Felds (`auraAt`.lebendig — das Substrat
    // und das Leben-Overlay, das die Taten schreiben), 0..1.
    _kreaturNahrung(x, z) {
        const a = this.auraAt(x, z);
        return a && a.lebendig > 0 ? Math.min(1, a.lebendig) : 0;
    }

    // DER BESTAND IM REVIER (Ökologie K2, tetrapoda BESTAND_GESETZ): je Gattung der Bestand n (die lebenden Tiere), die
    // Kapazität K des Reviers um den Spieler (die Zellen des Rasters rasterM bis revierM: je Zelle der Lebensraum der Gattung in
    // ihrer Boden-Klasse × Fläche × die Nahrung nach ihrer Ernährung — die Äsung des Orts `_kreaturNahrung`, die Beute = die
    // Pflanzenfresser im Revier), den Riss (Ökologie K1: die Kost der wilden Jäger gegen die Dichte ihrer Beute — Beute ist,
    // was `_kreaturIstBeute` einem Jäger zuspricht, dieselbe Frage wie die Jagd im Takt) und die Bilanz {geburt, tod} je
    // Takt. Die Boden-Klasse einer Zelle ist eine Funktion der Welt (Gelände, Fluss, Wald): sie wird je Zelle EINMAL gefragt
    // (die Kosten hängen an der Bewegung, nie am Takt). `zellen` (wenn gegeben) sammelt je Zelle den Ort und je Gattung
    // Lebensraum × Äsung — den Jungwuchs, den ihr Fraß liest (`_kreaturFrass`).
    // Liefert { gattung: { n, K, frass, riss, beute, geburt, tod } } (beute: je Tier, das einem Jäger Beute ist, sein nächster
    // Jäger — der Körper, den der Riss im Nah-Kreis ruft, `_kreaturRiss`).
    _kreaturBestand(zellen) {
        const BG = AnazhRealm._bestandGesetz();
        const B = BG.B;
        const LG = AnazhRealm._lebensraumGesetz();
        const pflanz = AnazhRealm._verhaltenGesetz().temperament.gattung.pflanzDiet;
        const pm = this.state.playerMesh;
        const px = pm ? pm.position.x : 0;
        const pz = pm ? pm.position.z : 0;
        const n = {};
        const diet = {};
        const jaeger = {};
        const gejagt = {};
        for (const g in LG.L.gattung) {
            n[g] = jaeger[g] = gejagt[g] = 0;
            const d = this._ofenKreaturDials(g);
            if (!d || !d.dials || !Number.isFinite(d.dials.diet))
                return AnazhRealm._kernPflichtBruch("tetrapoda:GATTUNGEN." + g + ".diet");
            diet[g] = d.dials.diet;
        }
        const gattung = (c) => AnazhRealm.TETRAPODA_SOUL_MAP[c.userData.soul];
        for (const c of this.state.creatures) if (gattung(c) in n) n[gattung(c)]++;
        // der Riss: wer einem wilden Jäger Beute ist, je Gattung gezählt, mit seinem nächsten Jäger, und die Kost der Jäger je
        // Gattung, die sie jagen
        const beuteVon = new Map();
        for (const c of this.state.creatures) {
            const d = diet[gattung(c)];
            if (!(d > 0) || this._creatureTemperament(c) !== "wild") continue;
            const jagt = new Set();
            for (const o of this.state.creatures) {
                if (!(gattung(o) in n) || !this._kreaturIstBeute(c, o)) continue;
                jagt.add(gattung(o));
                const j = beuteVon.get(o);
                if (!j || c.position.distanceToSquared(o.position) < j.position.distanceToSquared(o.position))
                    beuteVon.set(o, c);
            }
            for (const g of jagt) jaeger[g] += d;
        }
        for (const o of beuteVon.keys()) gejagt[gattung(o)]++;
        let beuteN = 0;
        for (const g in n) if (diet[g] <= pflanz) beuteN += n[g];
        const beute = Math.min(1, beuteN / B.beuteVoll);
        const seed = (this.state.worldMeta && this.state.worldMeta.seed) || "";
        let kl = this._bestandKlassen;
        if (!kl || kl.seed !== seed || kl.map.size > 4096) kl = this._bestandKlassen = { seed, map: new Map() };
        const r = B.rasterM;
        const ha = (r * r) / 1e4;
        const w = Math.ceil(B.revierM / r);
        const ix0 = Math.round(px / r);
        const iz0 = Math.round(pz / r);
        const K = {};
        for (const g in n) K[g] = 0;
        for (let ix = ix0 - w; ix <= ix0 + w; ix++)
            for (let iz = iz0 - w; iz <= iz0 + w; iz++) {
                const x = ix * r;
                const z = iz * r;
                if (Math.hypot(x - px, z - pz) > B.revierM) continue;
                const key = ix + "," + iz;
                let klasse = kl.map.get(key);
                if (klasse === undefined) kl.map.set(key, (klasse = this._bodenKlasseAt(x, z)));
                const aesung = this._kreaturNahrung(x, z);
                const je = {};
                for (const g in n) {
                    const l = LG.lebensraum(g, klasse, LG.L);
                    if (l > 0) K[g] += l * ha * BG.nahrung(diet[g], aesung, beute);
                    je[g] = l * aesung;
                }
                if (zellen) zellen.push({ x, z, je });
            }
        const aus = {};
        for (const g in n) {
            const k = B.kopfJeHa * K[g];
            const riss = BG.riss(jaeger[g], gejagt[g] / B.beuteVoll, B);
            aus[g] = Object.assign(
                {
                    n: n[g],
                    K: +k.toFixed(2),
                    frass: BG.frass(diet[g], B),
                    riss,
                    beute: beuteVon,
                },
                BG.bilanz(n[g], k, B)
            );
        }
        return aus;
    }

    // DER FRASS (Ökologie K1, tetrapoda bestandFrass): je Takt nimmt jede äsende Gattung n × frass vom Jungwuchs der Zellen, die
    // ihr Bestand liest (`zellen` aus `_kreaturBestand`), je Zelle nach ihrem Anteil Lebensraum × Äsung — die Herde äst, wo der
    // Jungwuchs steht, und die Kapazität liest, was sie ließ (negativ ins Feld). Vorher fraß jedes Tier an seinem Ort, den das
    // Raster nie las (Zeitraffer am main 45c6aa19: ohne die Wölfe Jungwuchs −0,1 %).
    _kreaturFrass(bestand, zellen) {
        for (const g in bestand) {
            const F = bestand[g].n * bestand[g].frass;
            const summe = F > 0 ? zellen.reduce((s, c) => s + c.je[g], 0) : 0;
            if (summe > 0) for (const c of zellen) if (c.je[g] > 0) this._depositLife(c.x, c.z, (-F * c.je[g]) / summe);
        }
    }

    // DER RISS EINES OPFERS (Ökologie K1; oekologie.K2: fern als Zahl, nah als Körper): fern nimmt es die Zahl — der Tod eines
    // Bisses (`_creatureCombatDeath`, Quelle jagd: der Ort erinnert ihn, der Leib liegt für den Fraß der Jäger); im Nah-Kreis
    // (`_kreaturNah`, dort zeichnet das Bild den Leib) nennt er es seinem Jäger (`_rissVon`), und dessen Jagd reißt es — Hetze
    // und Biss, das Leben aus dem Leib-Gesetz (tiere.K2, `_creatureScentHuntDir`). Vorher fiel es auch im Blick des Spielers
    // ohne Jäger am Leib (der Prüfer von Zug 29: 14 Risse in 180 s, ein Bär „durch Jagd").
    _kreaturRiss(opfer, jaeger) {
        if (this._kreaturNah(opfer)) opfer.userData._rissVon = jaeger;
        else this._creatureCombatDeath(opfer, "jagd");
    }

    // DER LEBENSZYKLUS (Ökologie K2, tetrapoda BESTAND_GESETZ): je taktS s der Spiel-Zeit (`spielZeit`: das Portal friert sie
    // ein) die Bilanz des Reviers (`_kreaturBestand`) — je Gattung über ihrer Kapazität stirbt mit ihrer Chance das Älteste am
    // Hunger (die Trauer des Spielers hebt, sein Frieden dämpft), darunter wirft der Ort eine Gruppe (`_creatureNaturalBirth`);
    // zuvor äst die Herde den Jungwuchs ihres Reviers (`_kreaturFrass`), und die Jäger reißen ihre Beute (Ökologie K1).
    // Jenseits der Lebensspanne kehrt das älteste Wesen zur Erde zurück. Bis Ökologie K2 setzte ein Deckel den Bestand (Ziel
    // 4–14 und Deckel 4–28 Tiere aus dem Feld am Spieler, FAUNA_TARGET/MAX_POPULATION), getaktet in der Wanduhr (Abklingen 25
    // bzw. 35 s); kein Fraß, keine Beute änderte eine Geburt, gestorben wurde nur über dem Deckel und am Alter. Die Marke des
    // letzten Takts reist nicht mit der Uhr: das Laden setzt sie an die Uhr des Stands (halten.K5,
    // `_loadStateRestoreSoulAndAtmosphere`).
    tickFaunaLifecycle() {
        const st = this.state;
        const L = st.faunaLifecycle;
        if (st.spielZeit - (L.lastTick || 0) < AnazhRealm._bestandGesetz().B.taktS) return;
        L.lastTick = st.spielZeit;
        // das Alter in Spiel-Zeit: je Takt taktS (dieselbe Uhr wie die Bilanz; vorher zählte die Wanduhr, Date.now − bornAt:
        // im Portal und in der Pause alterte jedes Tier, im Zeitraffer keines)
        for (const c of st.creatures)
            c.userData.alterS = (c.userData.alterS || 0) + AnazhRealm._bestandGesetz().B.taktS;
        const zellen = [];
        const bestand = this._kreaturBestand(zellen);
        this._kreaturFrass(bestand, zellen);
        // DIE OFFENEN RISSE (oekologie.K2): ein Opfer, das ein Riss im Nah-Kreis seinem Jäger nannte, behält seinen Riss — nah
        // reißt es die Jagd, fern die Zahl (`_kreaturRiss`, mit seinem nächsten Jäger); ohne Jäger fällt er. Ein zweiter Riss
        // nennt es nie: der Übergang nah ↔ fern ändert nur, wer gezeichnet wird, nie den Bestand
        for (const c of st.creatures.slice()) {
            const b = c.userData._rissVon && bestand[AnazhRealm.TETRAPODA_SOUL_MAP[c.userData.soul]];
            if (!b) continue;
            if (b.beute.has(c)) this._kreaturRiss(c, b.beute.get(c));
            else delete c.userData._rissVon;
            b.beute.delete(c);
        }
        const rng = this._faunaRng();
        for (const g in bestand) {
            const { tod: p, riss, beute } = bestand[g];
            if (p > 0 && rng() < this._emotionModulate(p, { sorrow: { mul: 1.5 }, peace: { mul: 0.7 } })) {
                const alt = this._findOldestCreature(g);
                if (alt) this._creatureNaturalDeath(alt, "hunger");
            }
            // DER RISS (Ökologie K1): die Jäger nehmen das Älteste ihrer Beute unter den Lebenden (nach dem Hungertod gewählt) —
            // fern als Zahl, nah als Körper (`_kreaturRiss`)
            const opfer = riss > 0 && rng() < riss && this._findOldestCreature(g, beute);
            if (opfer) this._kreaturRiss(opfer, beute.get(opfer));
        }
        // die Geburt folgt der EINEN Regel der Kreaturen (`_kreaturenBereit`, K60): unter dem Ladeschirm goss sie, sobald
        // Boot-Phase 3 wartete, die Gattung synchron (Radeon kalt 0,7 s vor dem ersten Bild)
        if (this._kreaturenBereit()) this._creatureNaturalBirth(bestand);
        // Alter zählt: jenseits der Lebensspanne kehrt das älteste Wesen zur Erde zurück, auch im Soll der Bilanz
        const alt = st.creatures.length > 2 && this._findOldestCreature();
        if (alt && alt.userData.alterS * 1000 > AnazhRealm.FAUNA_MAX_AGE_MS) this._creatureNaturalDeath(alt, "alter");
    }

    // DER NAH-KREIS (KREATUR_NAH_MESH): steht der Leib dort, wo das Bild ihn als Körper zeichnet? Mit Bild sagt es der Ziegel
    // (`_kzNah`, mit seiner Hysterese), ohne Bild und für die Sicht-Kopie (kein Ziegel) der Abstand zum Spieler, mit der
    // Hysterese des Satzes — die EINE Frage des Tier-Satzes (`_tickTierSatz`) und des Risses (`_kreaturRiss`).
    _kreaturNah(cr) {
        const u = cr.userData;
        if (!(this.state.renderer && this.state.renderer._isHeadlessNull) && !u._kopie) return u._kzNah === true;
        const N = AnazhRealm.KREATUR_NAH_MESH;
        const r = u._satz ? N.aus : N.ein;
        const p = this.state.playerMesh.position;
        return (cr.position.x - p.x) ** 2 + (cr.position.z - p.z) ** 2 < r * r;
    }

    // ═══ DER TIER-SATZ (profiband.K1 „Sturm mit 50 Tieren“: jedes Tier im Nah-Kreis war ein Leib — L0 8, L1 5 Draws je Tier
    // in Bild und Kaskade; an der GTX bei 50 Tieren +42 / +25 Befehle, Render 6,0 → 11,4–13,0 ms) ═══
    // Im Nah-Kreis (`_kreaturNah`) leben die `KREATUR_SATZ.nahLeiber` Nächsten als Leib (ihre Stufe
    // wählt der Stufen-Schalter `_gelenkStufe`; die Wahl hält mit dessen Hysterese) — jedes andere
    // Tier steht und geht im Satz seiner Gestalt (`_gangSatz`, derselbe Baustein wie der Bewohner): die gelenkige Grobstufe
    // (L1, das Studio-Mesh) als Senken Fell · Glimmen (das Auge, das leuchtet) · Rest und der Wurf (`wurf.seh` der Kern-Zeile).
    // Sein Leib zeichnet nicht und geht nicht (`_animateTierBaum` fällt für ihn, `_tierSatzGang`); der Satz geht das EINE
    // Gang-Gesetz in den Bändern der Gangarten (GANG_FOLGE, `_tierSatzBacken`), die Phase rückt mit dem WEG des Leibs — kein
    // Gleiten. Wer beißt, lebt als Leib (der Biss liest den Kopf, `_kreaturBissTakt`). Die Befehle hängen nie an der Kopfzahl.
    _tickTierSatz(playerPos) {
        const st = this.state;
        const K = AnazhRealm.KREATUR_SATZ;
        const M = this._tierSaetze || (this._tierSaetze = new Map());
        const takt = (this._tierSatzTakt = (this._tierSatzTakt || 0) + 1);
        for (const Z of M.values()) if (Z) Z.dabei = 0;
        // ein Gefallener verlässt den Satz (er liegt als Leib, `_tickLeichname`)
        for (const cr of st.leichname) if (cr.userData._satz) this._tierSatzAus(cr);
        const kand = this._tierSatzKand || (this._tierSatzKand = []);
        kand.length = 0;
        // die Menge: die eigenen Tiere und die Sicht-Kopien der Mitspieler (`_p2pTickRemoteCreatures`; ein Gefallener nie)
        const kopien = st.p2p && st.p2p.remoteCreatures;
        const menge =
            kopien && kopien.size
                ? st.creatures.concat(Array.from(kopien.values(), (rc) => (rc.tq ? null : rc.mesh)))
                : st.creatures;
        for (const cr of menge) {
            const u = cr && cr.userData;
            if (!u || !u._gelenk) continue;
            const d2 = (cr.position.x - playerPos.x) ** 2 + (cr.position.z - playerPos.z) ** 2;
            if (!this._kreaturNah(cr) || u._ruht === true) {
                if (u._satz) this._tierSatzAus(cr);
                continue;
            }
            const h = u._gelenk.hyst;
            // die Hysterese der Nah-Wahl: wer lebt, zählt um (1 − h) näher — ein Paar an gleichem Abstand tauscht nicht je Takt
            u._satzD2 = u._satz ? d2 : d2 * (1 - h) * (1 - h);
            kand.push(cr);
        }
        kand.sort((a, b) => a.userData._satzD2 - b.userData._satzD2);
        let leiber = 0;
        for (const cr of kand) {
            const u = cr.userData;
            const VA = u._verhaltenAktion;
            const nah = leiber < K.nahLeiber || !!(VA && VA.biss);
            const Z = nah ? null : this._tierSatzWahl(cr);
            if (Z && Z.dabei < Z.satz.cap) {
                if (u._satz !== Z) {
                    this._tierSatzEin(cr, Z);
                    Z.glieder.push(cr);
                }
                u._satzTakt = takt;
                Z.dabei++;
            } else {
                if (nah) leiber++;
                if (u._satz) this._tierSatzAus(cr);
            }
        }
        for (const [key, Z] of M) {
            if (!Z) continue;
            if (!Z.fertig) this._tierSatzBacken(Z, K.backJeTakt);
            if (Z.satz.senken[0].parent !== st.scene) for (const m of Z.satz.senken) st.scene.add(m);
            // die Reihe hält (wer bleibt, behält seinen Platz; wer ging, fällt heraus); wer sich rührte, zählt seine Fassung
            // hoch (`_tierSatzStempel`). Auge und Wurf schreibt der Blick des Bilds (`_tierSatzImBild`).
            let w = 0;
            for (const cr of Z.glieder)
                if (cr.userData._satz === Z && cr.userData._satzTakt === takt) Z.glieder[w++] = cr;
            Z.glieder.length = w;
            for (const cr of Z.glieder)
                if (this._tierSatzStempel(cr)) cr.userData._satzVer = (cr.userData._satzVer || 0) + 1;
            // ein Satz ohne Tier geht nach `leerTakte` Takten (seine Gestalt kommt wieder: er backt neu)
            Z.leer = w > 0 ? 0 : Z.leer + 1;
            if (Z.leer > K.leerTakte) {
                this._tierSatzFort(Z);
                M.delete(key);
            }
        }
    }

    // DER BLICK DES BILDS AUF DEN SATZ (im Render-Pfad, `_ruheImBild`: der Frustum DIESES Bilds): das Auge zeichnet jedes
    // Satz-Tier, das nicht außer Blick ist (`_kreaturAusserBlick`, die Körper-Kugel samt Saum — dieselbe Frage wie die Ruhe),
    // der Wurf jedes, dessen Schatten den Blick treffen kann (`_kreaturWurfAusserBlick`) — kein anderes: ein Instanz-Satz
    // cullt nicht je Instanz, weder im Auge noch in den Kaskaden (Gebot 7: die Kosten am Schirm)
    _tierSatzImBild(fr) {
        const M = this._tierSaetze;
        if (!M) return;
        const aus = this.state.creaturesHidden === true;
        const licht = this._kreaturLicht();
        const sicht = this._tierSatzSicht || (this._tierSatzSicht = []);
        const wurf = this._tierSatzWurf || (this._tierSatzWurf = []);
        for (const Z of M.values()) {
            if (!Z) continue;
            sicht.length = wurf.length = 0;
            for (const cr of aus ? [] : Z.glieder) {
                if (!this._kreaturAusserBlick(cr, fr, 0)) sicht.push(cr);
                else if (this._kreaturWurfAusserBlick(cr, fr, licht)) continue;
                wurf.push(cr);
            }
            this._tierSatzPlaetze(Z.platzB, sicht);
            this._tierSatzPlaetze(Z.platzW, wurf);
        }
    }
    // DIE PLÄTZE EINER SENKEN-ART des Satzes (Auge oder Wurf: `platz.senken`): dicht je Tier der Liste; ein Platz schreibt
    // nur, wenn ein anderes Tier ihn nimmt oder sein Tier sich seit dem letzten Schreiben rührte (`_satzVer`), und nur, was
    // sich schrieb, lädt neu (Gebot 7: die Kosten an der Änderung)
    _tierSatzPlaetze(platz, liste) {
        const m4 = this._tierSatzM4 || (this._tierSatzM4 = new THREE.Matrix4());
        let neu = false;
        liste.forEach((cr, i) => {
            const u = cr.userData;
            if (platz.tier[i] === cr && platz.ver[i] === u._satzVer) return;
            m4.compose(cr.position, cr.quaternion, cr.scale);
            for (const m of platz.senken) AnazhRealm._gangSatzInstanz(m, i, m4, u._satzBand, u._satzPh, u._satzW);
            platz.tier[i] = cr;
            platz.ver[i] = u._satzVer;
            neu = true;
        });
        platz.tier.length = platz.ver.length = liste.length;
        for (const m of platz.senken) {
            AnazhRealm._instanzZahl(m, liste.length);
            if (neu) AnazhRealm._gangSatzNeu(m);
        }
    }

    // DER STEMPEL EINES SATZ-TIERS: rührte es sich seit dem letzten Schreiben (Lage, Drehung, Größe, Band + Phase, Gewicht)?
    // Der Stempel wird zugleich neu gesetzt. Das Gewicht des Gangs klingt im Stand exponentiell aus (`_gaitBlendStep`): unter
    // `KREATUR_SATZ.gewichtSaum` ist es kein Rühren.
    _tierSatzStempel(cr) {
        const u = cr.userData;
        const s = u._satzS || (u._satzS = new Float64Array(10).fill(NaN));
        const p = cr.position;
        const q = cr.quaternion;
        const g = u._satzBand + u._satzPh - Math.floor(u._satzPh);
        const v = [p.x, p.y, p.z, q.x, q.y, q.z, q.w, cr.scale.x, g, u._satzW];
        let regt = false;
        for (let i = 0; i < 10; i++)
            if (i === 9 ? !(Math.abs(s[i] - v[i]) < AnazhRealm.KREATUR_SATZ.gewichtSaum) : s[i] !== v[i]) {
                s[i] = v[i];
                regt = true;
            }
        return regt;
    }

    // DIE WAHL DES SATZES für ein Tier, das nicht als Leib lebt: der Satz seiner Gestalt (je Grobstufe EINER — die Gestalt ist
    // seed-invariant, GESTALTEN_JE_REZEPT, ein Guss mit eigenen Studio-Reglern hat seine eigene), sobald sein Gang gebacken
    // ist; bis dahin (und wenn er nicht entstehen kann) bleibt der Leib.
    _tierSatzWahl(cr) {
        const Z = this._tierSatzFuer(cr);
        return Z && Z.fertig ? Z : null;
    }

    // DER SATZ EINER GESTALT entsteht an einem eigenen Back-Leib (derselbe Guss wie das Tier, `_buildCreatureGroup` — ohne
    // Träger setzt er die Pfoten auf die Ebene seiner Lage, `_kreaturFussBoden`): die Quellen sind die Teile seiner Grobstufe,
    // gebunden an seine Knochen. Der Stand sofort, der Gang im Takt (`_tierSatzBacken`).
    _tierSatzFuer(cr) {
        const u = cr.userData;
        const key = u._gelenk.meshes[0].geometry;
        const M = this._tierSaetze || (this._tierSaetze = new Map());
        if (M.has(key)) return M.get(key);
        M.set(key, null);
        const K = AnazhRealm.KREATUR_SATZ;
        const TC = window.__tetrapodaCore;
        const z1 = this._ofenZeile(TC, "kreatur", 1).zeile;
        const leib = this._buildCreatureGroup(u.soul, u.gussDials ? { dialsOv: u.gussDials } : undefined);
        const gl = leib && leib.userData._gelenk;
        if (!gl || gl.meshes[0].geometry !== key || !z1 || !z1.wurf) {
            if (leib) this._disposeSoulGroup(leib);
            this._bruchMelden(`TIER-SATZ: der Back-Leib von „${u.soul}“ trägt die Grobstufe des Tiers nicht`);
            return null;
        }
        const quellen = [];
        const teilVon = { fell: [], glimm: [], rest: [], wurf: [] };
        const stoffVon = { fell: null, glimm: null, rest: null };
        let groesst = 0;
        for (const m of gl.meshes) {
            if (!m.isSkinnedMesh) continue;
            const seh = m.userData.__seh;
            const q = { m, beid: m.material.side === THREE.DoubleSide };
            quellen.push(q);
            const tris = m.geometry.index.count / 3;
            const k = seh === "haar" ? "fell" : m.material.emissive && m.material.emissive.getHex() ? "glimm" : "rest";
            teilVon[k].push(q);
            if (k !== "rest") stoffVon[k] = stoffVon[k] || m.material;
            else if (tris > groesst) {
                groesst = tris;
                stoffVon.rest = m.material;
            }
            if (z1.wurf.seh.indexOf(seh) >= 0) teilVon.wurf.push(q);
        }
        stoffVon.wurf = stoffVon.fell;
        if (!stoffVon.fell || !teilVon.wurf.length) {
            this._disposeSoulGroup(leib);
            this._bruchMelden(`TIER-SATZ: die Grobstufe von „${u.soul}“ trägt Fell und Wurf nicht`);
            return null;
        }
        const tb = leib.userData._tierBaum;
        const g = this._gangZeile(false).g;
        const satz = this._gangSatz(
            {
                name: "tier-satz",
                inventar: "tier",
                n: K.phasen,
                baender: K.baender.length,
                quellen,
                cap: K.cap,
                senken: ["fell", "glimm", "rest", "wurf"]
                    .filter((k) => teilVon[k].length)
                    .map((k) => ({ teil: k, quellen: teilVon[k], stoff: stoffVon[k], wurf: k === "wurf" })),
            },
            (S) => {
                this._tierBaumNeutralStance(leib);
                leib.updateMatrixWorld(true);
                this._gangSatzPose(S, S.baender * S.n, tb.teile, leib.matrixWorld);
            }
        );
        const Z = {
            satz,
            leib,
            fertig: false,
            glieder: [],
            dabei: 0,
            // die Plätze des Auges und des Wurfs: ihre Senken, je Platz das Tier, das ihn zuletzt schrieb, und seine Fassung
            platzB: { senken: satz.senken.filter((m) => !m.castShadow), tier: [], ver: [] },
            platzW: { senken: satz.senken.filter((m) => m.castShadow), tier: [], ver: [] },
            leer: 0,
            // je Band das Tempo des Backens (die Froude-Zahl der Gangart an der Hüft-Höhe), der Schritt (m je Zyklus bei
            // Größe 1) und die Phase des ersten Beins in Zeile 0
            tempo: K.froude.map((fr) => Math.sqrt(fr * g * tb.beinL)),
            schritt: K.baender.map(() => 0),
            ph0: K.baender.map(() => 0),
            back: { band: 0, schritt: 0, k: -1, sub: 0, t: 0, m: 1, dt: 1 / 60 },
        };
        M.set(key, Z);
        return Z;
    }

    // DER GANG WIRD GEBACKEN (Lehre 14: im Takt, höchstens `je` Schritte des Gang-Gesetzes je Takt): je Band läuft der Back-Leib
    // mit dem Tempo seiner Gangart geradeaus (`_animateTierBaum`, das EINE Gang-Gesetz der Tiere: Folge, Tastgrad, Pfoten auf
    // dem Boden), schwingt `einschwingen` Schritte ein und legt dann über EINEN Zyklus (2π/ω) `phasen` Posen in den Puffer.
    // Sein Weg in diesem Zyklus ist der Schritt des Bands — der Satz rückt seine Phase um Weg / Schritt. Ist das letzte Band
    // gebacken, lädt die Textur EINMAL neu, der Satz geht, der Back-Leib fällt.
    _tierSatzBacken(Z, je) {
        const K = AnazhRealm.KREATUR_SATZ;
        const S = Z.satz;
        const B = Z.back;
        const g = Z.leib;
        const tb = g.userData._tierBaum;
        const schritt = (dt) => {
            B.t += dt;
            g.position.z += Z.tempo[B.band] * dt;
            g.updateMatrixWorld(true);
            this._animateTierBaum(g, B.t, 0, true, null);
        };
        const pose = () => {
            g.updateMatrixWorld(true);
            this._gangSatzPose(S, B.band * S.n + B.k, tb.teile, g.matrixWorld);
        };
        for (; je > 0 && B.band < S.baender; je--) {
            if (B.schritt === 0) {
                this._tierBaumNeutralStance(g);
                tb._gang = null;
                g.position.set(0, 0, 0);
                B.t = 0;
                B.k = -1;
            }
            if (B.k < 0) {
                schritt(1 / 60);
                if (++B.schritt < K.einschwingen) continue;
                const T = (2 * Math.PI) / Math.max(1e-3, tb._gang.omega);
                B.m = Math.max(1, Math.ceil((T / S.n) * 60));
                B.dt = T / S.n / B.m;
                Z.schritt[B.band] = Z.tempo[B.band] * T;
                Z.ph0[B.band] = tb._gang.ph[0];
                B.k = 0;
                B.sub = 0;
                pose();
                continue;
            }
            schritt(B.dt);
            if (++B.sub < B.m) continue;
            B.sub = 0;
            if (++B.k < S.n) pose();
            else {
                B.band++;
                B.schritt = 0;
            }
        }
        if (B.band < S.baender) return;
        S.tex.needsUpdate = true;
        Z.fertig = true;
        this._disposeSoulGroup(Z.leib);
        Z.leib = null;
    }

    // EIN TIER BETRITT DEN SATZ: sein Leib zeichnet nicht mehr; Band, Phase und Gewicht übernimmt der Satz aus seinem Gang
    // (die Phase des ersten Beins gegen die der Zeile 0 seines Bands)
    _tierSatzEin(cr, Z) {
        const u = cr.userData;
        if (u._satz) this._tierSatzAus(cr);
        const G = u._tierBaum && u._tierBaum._gang;
        const K = AnazhRealm.KREATUR_SATZ;
        const band = Math.max(0, K.baender.indexOf(G && G.art));
        u._satz = Z;
        u._satzBand = band;
        u._satzWahl = { v: G ? G.v || 0 : 0, art: G ? G.art : undefined };
        u._satzPh = G ? (G.ph[0] - Z.ph0[band]) / (2 * Math.PI) : 0;
        u._satzW = G && G.schritt > 0 ? Math.min(1, G.schritt) : 0;
        u._satzX = cr.position.x;
        u._satzZ = cr.position.z;
        cr.visible = false;
    }
    // EIN TIER VERLÄSST DEN SATZ: der Leib steht in seiner Stand-Pose wieder im Bild (der Gang setzt neu an); trägt das Feld
    // ihn (fern), gehört `visible` dem Ziegel
    _tierSatzAus(cr) {
        const u = cr.userData;
        u._satz = null;
        this._tierBaumNeutralStance(cr);
        if (!this._kzBesitztFeld(cr)) cr.visible = this.state.creaturesHidden !== true;
    }
    // DER GANG IM SATZ je Takt (statt `_animateTierBaum`): der Weg des Leibs seit dem letzten Takt — ein Sprung der Lage ist
    // kein Lauf (`_lageTempo`) — rückt die Phase (`_tierSatzSchritt`)
    _tierSatzGang(cr, dt) {
        const u = cr.userData;
        // ein Takt ohne Zeit rückt keinen Gang (der Weg dieses Takts ist kein Schritt)
        if (!(dt > 0)) {
            u._satzX = cr.position.x;
            u._satzZ = cr.position.z;
            return;
        }
        const dx = cr.position.x - u._satzX;
        const dz = cr.position.z - u._satzZ;
        u._satzX = cr.position.x;
        u._satzZ = cr.position.z;
        const v = dt > 0 ? AnazhRealm._lageTempo(dx, dz, dt) : 0;
        this._tierSatzSchritt(u, v === null ? 0 : Math.hypot(dx, dz), v || 0, dt, cr);
    }
    // DER SCHRITT IM SATZ: die Gangart aus der Wahl des Leibs (`_gangWahl`, Tempo und Hysterese wie im Leib — das Band; wer
    // steht, behält es), das Gewicht des Gangs (`_gaitBlendStep`) und die Phase in Zyklen um Weg / Schritt des Bands × Größe
    _tierSatzSchritt(u, weg, v, dt, cr) {
        const K = AnazhRealm.KREATUR_SATZ;
        const Z = u._satz;
        const gs = AnazhRealm._gangWahl(
            u._satzWahl,
            v,
            dt,
            true,
            u._tierBaum.beinL * (cr.scale.x || 1),
            this._gangZeile(false)
        );
        if (gs.art !== "stand") u._satzBand = Math.max(0, K.baender.indexOf(gs.art));
        u._satzW = this._gaitBlendStep(u._satzW, v, dt);
        u._satzPh += weg / (Z.schritt[u._satzBand] * (cr.scale.x || 1));
    }
    // DER ABSCHIED EINES TIER-SATZES (`_gangSatzAbschied`; ein Back-Leib, der noch backt, fällt mit)
    _tierSatzFort(Z) {
        for (const cr of this.state.creatures) if (cr.userData._satz === Z) this._tierSatzAus(cr);
        if (Z.leib) this._disposeSoulGroup(Z.leib);
        Z.leib = null;
        this._gangSatzAbschied(Z.satz);
    }
    // DER MAGEN (kg, VERHALTEN.aas) — der EINE Hunger: so viel frisst ein Tier auf einmal — magenAnteil × die EINE Masse seines
    // Leibs; ein Leib ohne gemessene Gestalt hat keinen (0). Er leert sich in verdauSec auf der Kreatur-Uhr (gerechnet, wenn ihn
    // einer liest) und füllt sich am Kadaver (`_kreaturAasZug`) und, wer weidet, beim Äsen (`_kreaturTaetigkeit`).
    _kreaturMagenVoll(creature) {
        const tb = creature.userData && creature.userData._tierBaum;
        return tb && tb.leibV > 0 ? AnazhRealm._verhaltenGesetz().aas.magenAnteil * this._leibMasse(creature) : 0;
    }
    _kreaturMagen(creature) {
        const ud = creature.userData;
        const now = this.state.creatureAnimationTime;
        const dt = Number.isFinite(ud._magenT) ? Math.max(0, now - ud._magenT) : 0;
        ud._magenT = now;
        if (!(ud.magen > 0)) return (ud.magen = 0);
        const voll = this._kreaturMagenVoll(creature);
        ud.magen = Math.max(0, ud.magen - (voll / AnazhRealm._verhaltenGesetz().aas.verdauSec) * dt);
        return ud.magen;
    }
    // SATT (VERHALTEN.aas.hungerAnteil): wer mehr als diesen Anteil seines Magens trägt, jagt keine Beute und frisst nicht an.
    _kreaturSatt(creature) {
        const voll = this._kreaturMagenVoll(creature);
        return voll > 0 && this._kreaturMagen(creature) >= AnazhRealm._verhaltenGesetz().aas.hungerAnteil * voll;
    }

    // ═══ KAMPF-GEFÜHL — DER LEICHNAM (Welle LF kampf, Posten 7) ═══
    // Ein Gefallener (state.leichname, _kreaturFaellt) ohne KI, Gang und Stimme: TOD_LAGE.vorlaufSec nach dem Tod (Kreatur-Uhr;
    // die Tafel rechnete der Leerlauf oder `_todLageFrist`, halten.K5) kippt er (~83° smoothstep über kippDauerSec) auf ihre Flanke,
    // liegt bis zur Frist, sinkt, DANN removeCreature; je Takt seine Sicht (_leibSicht). Rein optisch, der Strom trägt die Lage (q).
    _tickLeichname(delta, playerPos) {
        const L = this.state.leichname;
        for (let i = L.length - 1; i >= 0; i--) {
            const creature = L[i];
            const dying = creature.userData.dying;
            dying.t += delta;
            if (dying.hebe === undefined && dying.t >= AnazhRealm.TOD_LAGE.vorlaufSec) this._todLageFrist(creature);
            dying.fall = dying.hebe === undefined ? 0 : Math.max(0, dying.t - AnazhRealm.TOD_LAGE.vorlaufSec);
            const u = Math.min(1, dying.fall / Math.max(1e-6, dying.dauer));
            const ang = AnazhRealm.TOD_KIPP_RAD * u * u * (3 - 2 * u); // ~83° — gekippt, nicht vergraben
            const axis = this._kampfTipAxis || (this._kampfTipAxis = new THREE.Vector3());
            axis.set(dying.dirZ, 0, -dying.dirX).normalize(); // ⊥ Kipp-Richtung: up kippt AUF sie zu
            const q = this._kampfTipQ || (this._kampfTipQ = new THREE.Quaternion());
            q.setFromAxisAngle(axis, ang);
            creature.quaternion.copy(q);
            if (dying.baseQuat) creature.quaternion.multiply(dying.baseQuat);
            const hebe = dying.hebe;
            if (hebe && Number.isFinite(dying.baseY)) {
                const f = (ang / AnazhRealm.TOD_KIPP_RAD) * (hebe.length - 1);
                const k0 = Math.max(0, Math.min(hebe.length - 2, Math.floor(f)));
                creature.position.y = dying.baseY + hebe[k0] + (hebe[k0 + 1] - hebe[k0]) * (f - k0);
            }
            // der leere Kadaver (sein Fleisch ist gefressen, _kreaturAasZug) sinkt jetzt: die Frist endet mit dem Versinken
            const KF = creature.userData.kadaver;
            if (KF && !(KF.fleisch > 0) && dying.t >= dying.dauer)
                dying.nachklang = Math.min(dying.nachklang, dying.t - dying.dauer + dying.sinken);
            // er sinkt in der letzten Spanne seiner Frist in die Erde (die Höhe seines Leibs), dann fällt er
            const ende = dying.dauer + dying.nachklang;
            if (dying.sinken > 0 && dying.t > ende - dying.sinken) {
                if (!Number.isFinite(dying.liegeY)) dying.liegeY = creature.position.y;
                const u2 = Math.min(1, (dying.t - (ende - dying.sinken)) / dying.sinken);
                creature.position.y =
                    dying.liegeY -
                    u2 * u2 * this._kreaturLeib(creature, 0, this._sinkLeib || (this._sinkLeib = {})).hoehe;
            }
            if (dying.t >= ende) {
                this.removeCreature(creature); // rückwärts: der Splice überspringt keinen
                continue;
            }
            const dx = creature.position.x - playerPos.x,
                dz = creature.position.z - playerPos.z;
            this._leibSicht(creature, dx * dx + dz * dz, this.isInFrustum(creature));
        }
    }
    // DIE VÖGEL (Klang K1, tetrapoda VOGEL_GESETZ): jeder Vogel-Ruf hat einen Leib — gesehen = gehört. Je Takt die Reviere im
    // Hör-Kreis des Ohrs (klang:UMWELT.stimmen.vogel.hoerweiteM), je Revier seine Bahn auf der Uhr der Welt
    // (`spielZeit`: sie reist im Stand und im Netz — jeder Peer und jeder Reload sieht dieselben Vögel): wer singt,
    // fliegt und wird gezeichnet, wer schweigt, sitzt im Gras. `state.voegel` trägt die singenden Leiber ({x, y, z}) — die
    // EINE Quelle, die das Ohr liest (`_umweltLage`). Die Karte merkt je Zelle ihre Würfe und ihr Revier (`_vogelZelle`);
    // je Takt frischt eine Zelle Leben und Deckung nach (Pflanzen, Fällen, Pflege), ferne fallen — die Kosten hängen am
    // Hör-Kreis, nie an der Welt. Gezeichnet wird in EINEM Pool mit dem Stoff der Bau-Pools (`_kistenPool`: EIN Programm, EIN
    // Befehl), je Vogel seine Teile und zwei Flügel im Schlag. Danach der Schwarm (`_vogelSchwarmTakt`, luftwasser.K5): derselbe
    // Leib und Stoff, sein eigener Pool, fern EIN Agent.
    _vogelTakt() {
        const st = this.state;
        const pm = st.playerMesh;
        if (!pm || !st.scene) return;
        const VG = AnazhRealm._vogelGesetz();
        const V = VG.V;
        const hw = AnazhRealm._umweltGesetz().UMWELT.stimmen.vogel.hoerweiteM;
        const welt = (st.worldMeta && st.worldMeta.seed) || "anazh-realm-seed";
        let vk = this._vogelKarte;
        if (!vk || vk.welt !== welt)
            vk = this._vogelKarte = {
                welt,
                saat: parseInt(this._fastHash(welt + "-vogel"), 16) >>> 0,
                zellen: new Map(),
                lauf: null,
            };
        const { x: px, y: py, z: pz } = pm.position;
        const Z = V.zelleM;
        const r = Math.ceil(hw / Z);
        if (vk.zellen.size > 4 * (2 * r + 1) * (2 * r + 1)) {
            for (const [k, c] of vk.zellen)
                if (Math.abs(c.ix * Z - px) > 2 * hw || Math.abs(c.iz * Z - pz) > 2 * hw) vk.zellen.delete(k);
            vk.lauf = null;
        }
        if (vk.zellen.size) {
            let e = vk.lauf ? vk.lauf.next() : null;
            if (!e || e.done) e = (vk.lauf = vk.zellen.values()).next();
            this._vogelZelle(vk, e.value);
        }
        const wf = this._weatherFieldFor(st.weather);
        const anteil = VG.lied(this._sonnenRichtung().y, wf.rain, this._windAt(px, pz, this._bildZeit).staerke, V);
        const uhr = st.spielZeit;
        const b = this._vogelBahnAus || (this._vogelBahnAus = {});
        const voegel = st.voegel || (st.voegel = []);
        const ix0 = Math.floor(px / Z);
        const iz0 = Math.floor(pz / Z);
        let n = 0;
        for (let ix = ix0 - r; ix <= ix0 + r; ix++)
            for (let iz = iz0 - r; iz <= iz0 + r; iz++) {
                const k = ix * 1048576 + iz;
                let c = vk.zellen.get(k);
                if (!c) vk.zellen.set(k, (c = this._vogelZelle(vk, { ix, iz })));
                if (!c.revier || !VG.bahn(c.wurf, anteil, uhr, c.deckung, V, b)) continue;
                const x = c.x + b.dx;
                const y = c.y + b.h;
                const z = c.z + b.dz;
                if (!(Math.hypot(x - px, y - py, z - pz) < hw)) continue;
                const v = voegel[n] || (voegel[n] = {});
                v.x = x;
                v.y = y;
                v.z = z;
                v.gier = b.gier;
                v.schlag = b.schlag;
                n++;
            }
        voegel.length = n;
        this._vogelZeichnen(voegel, V.leib, (V.leib.teile.length + 2) * (2 * r + 1) * (2 * r + 1));
        this._vogelSchwarmTakt(this._sonnenRichtung().y, wf.rain);
    }
    // DER SCHWARM (luftwasser.K5, tetrapoda VOGEL_GESETZ.schwarm): fern EIN Agent. Je Takt die Schwarm-Zellen um das Auge
    // (sichtM): je Zelle einmal ihr Wurf (Mitte, Würfe), je frischeS ihr Revier aus der Kronen-Deckung der Mitte, je fliegendem Schwarm sein
    // ZENTRUM auf der Uhr der Welt (`schwarmZentrum`: jeder Peer und jeder Reload sieht denselben Schwarm). Jenseits von sichtM
    // oder mit der Hülle außer dem Blick (`_frustumCache`) rechnet er nur das; im Bild trägt er seine Glieder, nah (nahM) fliegen
    // sie im Verband (`_schwarmVerband`: verbandZug wie die Herde, die Separation über das Gitter). Die Kosten hängen an den
    // Gliedern im Bild, nie an der Welt. Gezeichnet über
    // `_vogelZeichnen` in EINEN Pool (Stoff und Leib der Sänger: EIN Programm, EIN Befehl). `state.schwarm` trägt die Lage des
    // Takts: fliegende Schwärme, Schwärme und Glieder im Bild, nahe Schwärme, Paare der Separation.
    _vogelSchwarmTakt(sonne, regen) {
        const st = this.state;
        const cam = st.camera;
        if (!cam) return;
        const VG = AnazhRealm._vogelGesetz();
        const V = VG.V;
        const S = V.schwarm;
        const welt = (st.worldMeta && st.worldMeta.seed) || "anazh-realm-seed";
        let sk = this._schwarmKarte;
        if (!sk || sk.welt !== welt)
            sk = this._schwarmKarte = {
                welt,
                saat: parseInt(this._fastHash(welt + "-schwarm"), 16) >>> 0,
                zellen: new Map(),
                lagen: new Float32Array(3 * S.glieder[1]),
                gitter: {},
                zentrum: {},
                glied: {},
                kugel: new THREE.Sphere(),
                voegel: [],
            };
        const { x: ax, y: ay, z: az } = cam.position;
        const Z = S.zelleM;
        const r = Math.ceil(S.sichtM / Z);
        if (sk.zellen.size > 4 * (2 * r + 1) * (2 * r + 1))
            for (const [k, c] of sk.zellen)
                if (Math.abs(c.ix * Z - ax) > 2 * S.sichtM || Math.abs(c.iz * Z - az) > 2 * S.sichtM)
                    sk.zellen.delete(k);
        const lage = st.schwarm || (st.schwarm = {});
        Object.assign(lage, { fliegen: 0, imBild: 0, glieder: 0, nah: 0, paare: 0 });
        const F = this._frustumCache;
        const f = S.form;
        const uhr = st.spielZeit;
        const zt = sk.zentrum;
        const p = sk.lagen;
        const voegel = sk.voegel;
        let n = 0;
        const ix0 = Math.floor(ax / Z);
        const iz0 = Math.floor(az / Z);
        for (let ix = ix0 - r; ix <= ix0 + r; ix++)
            for (let iz = iz0 - r; iz <= iz0 + r; iz++) {
                const k = ix * 1048576 + iz;
                let c = sk.zellen.get(k);
                if (!c) {
                    const w = (j) => VG.wurf(sk.saat, ix, iz, j);
                    c = {
                        ix,
                        iz,
                        x: (ix + w(1)) * Z,
                        z: (iz + w(2)) * Z,
                        u: w(0),
                        wurf: [w(3), w(4), w(5), w(6), w(7)],
                    };
                    sk.zellen.set(k, c);
                }
                // das Revier folgt der Deckung (Pflanzen, Fällen; die Karte der Kronen steht erst nach dem Boot): je frischeS neu
                if (!(Math.abs(uhr - c.frisch) <= S.frischeS)) {
                    c.frisch = uhr;
                    c.revier = VG.schwarmRevier(c.u, this._kronenStreuAt(c.x, c.z), V);
                }
                if (!c.revier || !VG.schwarmZentrum(c.wurf, uhr, sonne, regen, V, zt)) continue;
                lage.fliegen++;
                const x = c.x + zt.dx;
                const z = c.z + zt.dz;
                // die Hülle: der Ball der Formation, atmend und mit Welle und Zittern (großzügig: die Längs-Achse × 1,5)
                const huelle =
                    1.5 * f[0] * S.abstandM * Math.cbrt((zt.n * S.raumJeGlied) / (4.18879 * f[0] * f[1] * f[2])) + 1;
                if (Math.hypot(x - ax, z - az) > S.sichtM + huelle) continue;
                const y = this._terrainMacroSurfaceY(x, z) + zt.h;
                if (F && !F.intersectsSphere(sk.kugel.set(sk.kugel.center.set(x, y, z), huelle))) continue;
                lage.imBild++;
                lage.glieder += zt.n;
                const nah = Math.hypot(x - ax, y - ay, z - az) < S.nahM + huelle;
                lage.nah += nah;
                lage.paare += this._schwarmVerband(c, zt, x, y, z, uhr, nah, voegel, n);
                for (let i = 0; i < zt.n; i++, n++) {
                    const v = voegel[n];
                    v.x = p[3 * i];
                    v.y = p[3 * i + 1];
                    v.z = p[3 * i + 2];
                }
            }
        voegel.length = n;
        this._vogelZeichnen(voegel, V.leib, (V.leib.teile.length + 2) * S.glieder[1] * 2, "vogelSchwarmPool");
    }
    // DER VERBAND DES SCHWARMS (luftwasser.K2, tetrapoda verbandZug — derselbe Zug wie die Herde): c die Zelle, zt ihr Zentrum
    // in diesem Takt an (x, y, z). Der Zustand je Glied (`c.verband`: Lage und Lauf im Kurs-Rahmen des Zentrums, quer und
    // längs) entsteht aus dem Wurf der Formation (`schwarmGlied`). Nah, je Takt der Welt-Uhr bis verband.dtMax: jedes Glied
    // wünscht seinen Kurs (`schwarmWunsch`), verbandZug zieht ihn zum Leittier (das Zentrum, leit) und zu den Gliedern
    // i + 1 + m·⌊n/k⌋ (k = maxNachbarn − 1 neben dem Leittier; VERHALTEN.herde, der Paar-Raum raumM), es fliegt ihn, die
    // Separation hält die Paare auseinander. Fern trägt das Zentrum die Formation in seinem Rahmen (gedreht mit seinem Kurs).
    // Die Höhe ist die Scheibe der Funktion, der Blick der Lauf. Schreibt die Lagen in die Karte (`lagen`), Blick und Schlag
    // in voegel ab n0; liefert die Paare der Separation.
    _schwarmVerband(c, zt, x, y, z, uhr, nah, voegel, n0) {
        const VG = AnazhRealm._vogelGesetz();
        const V = VG.V;
        const S = V.schwarm;
        const sk = this._schwarmKarte;
        const [g, p, n] = [sk.glied, sk.lagen, zt.n];
        const [co, si] = [Math.cos(zt.gier), Math.sin(zt.gier)];
        let vb = c.verband;
        if (!vb || vb.n !== n) {
            vb = c.verband = { n, lage: new Float32Array(2 * n), lauf: new Float32Array(2 * n), zeit: uhr };
            for (let i = 0; i < n; i++) {
                VG.glied(i, n, uhr, c.wurf[0], zt.gier, V, g);
                vb.lage[2 * i] = co * g.x - si * g.z;
                vb.lage[2 * i + 1] = si * g.x + co * g.z;
                vb.lauf[2 * i + 1] = S.tempoMs;
            }
        }
        const dt = uhr - vb.zeit;
        const fliegt = nah && dt > 0 && dt <= S.verband.dtMax;
        // der Rahmen der Lagen: das Zentrum des Vor-Takts (es fliegt) oder dieses (es trägt); Rahmen → Welt: x = c·q + s·l,
        // z = −s·q + c·l
        const [bx, bz, bg] = fliegt ? [vb.x, vb.z, vb.gier] : [x, z, zt.gier];
        const [bc, bs] = [Math.cos(bg), Math.sin(bg)];
        const L = vb.lage;
        const U = vb.lauf;
        const W = vb.welt || (vb.welt = new Float32Array(2 * n));
        for (let i = 0; i < n; i++) {
            p[3 * i] = bx + bc * L[2 * i] + bs * L[2 * i + 1];
            p[3 * i + 2] = bz - bs * L[2 * i] + bc * L[2 * i + 1];
            W[2 * i] = bc * U[2 * i] + bs * U[2 * i + 1];
            W[2 * i + 1] = -bs * U[2 * i] + bc * U[2 * i + 1];
            VG.glied(i, n, uhr, c.wurf[0], zt.gier, V, g);
            p[3 * i + 1] = y + g.y;
            (voegel[n0 + i] || (voegel[n0 + i] = {})).schlag = g.schlag;
        }
        let paare = 0;
        if (fliegt) {
            const K = AnazhRealm._steuerGesetz();
            const H = AnazhRealm._verhaltenGesetz().herde;
            const raum = S.raumM / 2;
            const k = Math.min(H.maxNachbarn - 1, n - 1);
            const schritt = Math.floor(n / k);
            const E = sk.eintraege || (sk.eintraege = []);
            for (let m = 0; m <= k; m++) E[m] = E[m] || { x: 0, z: 0, vx: 0, vz: 0, raum, leit: false };
            E.length = k + 1;
            Object.assign(E[0], { x, z, vx: S.tempoMs * si, vz: S.tempoMs * co, raum, leit: true });
            const N = vb.neu || (vb.neu = new Float32Array(2 * n));
            const w = sk.wunsch || (sk.wunsch = { x: 0, z: 0 });
            const zug = sk.zug || (sk.zug = { x: 0, z: 0, n: 0 });
            for (let i = 0; i < n; i++) {
                for (let m = 1; m <= k; m++) {
                    const [j, e] = [(i + 1 + (m - 1) * schritt) % n, E[m]];
                    e.x = p[3 * j];
                    e.z = p[3 * j + 2];
                    e.vx = W[2 * j];
                    e.vz = W[2 * j + 1];
                }
                VG.wunsch(i, uhr, zt.gier, V, w);
                K.verbandZug(p[3 * i], p[3 * i + 2], w.x, w.z, S.tempoMs, raum, E, H, zug);
                N[2 * i] = zug.x;
                N[2 * i + 1] = zug.z;
            }
            for (let i = 0; i < n; i++) {
                W[2 * i] = N[2 * i];
                W[2 * i + 1] = N[2 * i + 1];
                p[3 * i] += W[2 * i] * dt;
                p[3 * i + 2] += W[2 * i + 1] * dt;
            }
            paare = VG.separation(p, n, S.raumM, sk.gitter);
        }
        // zurück in den Rahmen dieses Takts (Welt → Rahmen: q = c·x − s·z, l = s·x + c·z); der Blick längs des Laufs
        for (let i = 0; i < n; i++) {
            const [rx, rz] = [p[3 * i] - x, p[3 * i + 2] - z];
            L[2 * i] = co * rx - si * rz;
            L[2 * i + 1] = si * rx + co * rz;
            U[2 * i] = co * W[2 * i] - si * W[2 * i + 1];
            U[2 * i + 1] = si * W[2 * i] + co * W[2 * i + 1];
            voegel[n0 + i].gier = zt.gier + Math.atan2(U[2 * i], U[2 * i + 1]);
        }
        Object.assign(vb, { zeit: uhr, x, z, gier: zt.gier });
        return paare;
    }
    // DIE ZELLE der Vogel-Karte: ihre Würfe (einmal: das Revier, die Mitte, die Bahn) und ihr Revier aus Leben und Deckung an
    // der Mitte (je Aufruf neu; die Deckung hebt auch den Singflug über das Dach); die Mitte steht auf der EINEN 2D-Höhe, im
    // Wasser wohnt keiner.
    _vogelZelle(vk, c) {
        const VG = AnazhRealm._vogelGesetz();
        if (!c.wurf) {
            const w = (k) => VG.wurf(vk.saat, c.ix, c.iz, k);
            c.x = (c.ix + w(1)) * VG.V.zelleM;
            c.z = (c.iz + w(2)) * VG.V.zelleM;
            c.y = this._terrainMacroSurfaceY(c.x, c.z);
            c.u = w(0);
            c.wurf = [w(3), w(4), w(5), w(6)];
        }
        c.deckung = this._kronenStreuAt(c.x, c.z);
        c.revier = !this._nassAt(c.x, c.z) && VG.revier(c.u, this.auraAt(c.x, c.z).lebendig, c.deckung, VG.V);
        return c;
    }
    // DER LEIB IM BILD: je singenden Vogel seine Teile und zwei Flügel (am Schultergelenk, um die Längsachse im Schlag) —
    // die Matrizen direkt in den Puffer des Pools (Spalten-Ordnung, Gier um y), die Farben je Platz einmal beim Bau (die
    // Teile-Folge ist je Vogel gleich). `cap` = so viele Plätze, wie der Hör-Kreis Zellen trägt; `feld` = der Pool im Stand
    // (`vogelPool` die Sänger, `vogelSchwarmPool` der Schwarm) — trägt das Bild mehr Teile als der Pool Plätze, wächst er auf das
    // Doppelte des Bedarfs (der alte fällt über `_instanzAbschied`): kein Glied fällt still aus dem Bild.
    _vogelZeichnen(voegel, L, cap, feld = "vogelPool") {
        const st = this.state;
        const je = L.teile.length + 2;
        let P = st[feld];
        if (P && voegel.length * je > P.cap) {
            st.scene.remove(P.mesh);
            this._instanzAbschied(P.mesh);
            P = st[feld] = null;
            cap = 2 * voegel.length * je;
        }
        if (!P) {
            // je Teil ein Doppel-Keil der Ausdehnung 1 (8 Dreiecke; das Gesetz trägt die Maße)
            const mesh = this._kistenPool("vogel", cap, new THREE.OctahedronGeometry(0.5));
            const farbe = new THREE.Color();
            for (let i = 0; i < cap; i++)
                mesh.setColorAt(i, farbe.setHex(i % je < L.teile.length ? L.teile[i % je].farbe : L.fluegel.farbe));
            mesh.instanceColor.needsUpdate = true;
            st.scene.add(mesh);
            P = st[feld] = { mesh, cap };
        }
        const A = P.mesh.instanceMatrix.array;
        let o = 0;
        // ein Teil: die Spalten e0 = (ax, ay, 0), e1 = (bx, by, 0), e2 = (0, 0, gz) und die Lage l im Leib-Raum, gedreht um die
        // Gier (c, s: x' = c·x + s·z, z' = −s·x + c·z) und an den Leib v gesetzt
        const teil = (v, c, s, ax, ay, bx, by, gz, lx, ly, lz) => {
            const k = 16 * o++;
            A[k + 3] = A[k + 7] = A[k + 9] = A[k + 11] = 0;
            A[k] = c * ax;
            A[k + 1] = ay;
            A[k + 2] = -s * ax;
            A[k + 4] = c * bx;
            A[k + 5] = by;
            A[k + 6] = -s * bx;
            A[k + 8] = s * gz;
            A[k + 10] = c * gz;
            A[k + 12] = v.x + c * lx + s * lz;
            A[k + 13] = v.y + ly;
            A[k + 14] = v.z - s * lx + c * lz;
            A[k + 15] = 1;
        };
        const F = L.fluegel;
        const [gx, gy, gz] = F.groesse;
        for (let i = 0; i < voegel.length && o + je <= P.cap; i++) {
            const v = voegel[i];
            const c = Math.cos(v.gier);
            const s = Math.sin(v.gier);
            for (const T of L.teile)
                teil(v, c, s, T.groesse[0], 0, 0, T.groesse[1], T.groesse[2], T.lage[0], T.lage[1], T.lage[2]);
            for (const seite of [1, -1]) {
                const cf = Math.cos(seite * v.schlag);
                const sf = Math.sin(seite * v.schlag);
                const h = (seite * gx) / 2;
                teil(
                    v,
                    c,
                    s,
                    gx * cf,
                    gx * sf,
                    -gy * sf,
                    gy * cf,
                    gz,
                    seite * F.schulter[0] + h * cf,
                    F.schulter[1] + h * sf,
                    F.schulter[2]
                );
            }
        }
        AnazhRealm._instanzZahl(P.mesh, o);
        if (o > 0) P.mesh.instanceMatrix.needsUpdate = true;
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
// DIE ERINNERUNG IN WORTEN (KI K3): je Typ von `_creatureRemember` EIN Satz im Präteritum ohne Subjekt (1. und 3. Person
// gleich) — der Persona-Prompt liest „ich …", die Geschichte im Hof „… vor 5s"; Namen reisen als Datum. Bis KI K3 kannte der
// Prompt 8 von 18 Typen: geschlagen und gefüttert (die Furcht des Wesens liest sie) fielen still aus dem Gespräch.
AnazhRealm.ERINNERUNG_SATZ = Object.freeze({
    geschlagen: () => "wurde vom Schöpfer geschlagen",
    gefuettert: (c) => AnazhRealm._datum`bekam vom Schöpfer ${c.label || c.gabe}`,
    gefolgt: () => "folgte dem Schöpfer",
    gathered: (c) => AnazhRealm._datum`sammelte ${c.material || c.blueprintName}`,
    built: (c) => AnazhRealm._datum`baute ${c.blueprint}`,
    delivered: () => "übergab dem Schöpfer Material",
    took_materials: (c) => AnazhRealm._datum`nahm Material für ${c.blueprint}`,
    no_material: (c) => AnazhRealm._datum`fand kein ${c.material}`,
    no_blueprint: (c) => AnazhRealm._datum`kannte den Bauplan ${c.blueprint} nicht`,
    no_inventory_for_build: () => "bekam vom Schöpfer kein Material",
    no_water: () => "fand kein Wasser",
    drank: () => "trank am Ufer",
    spoken: () => "sprach mit dem Schöpfer",
    spoke_proactive: () => "sprach den Schöpfer von selbst an",
    spoken_rare_event: () => "sprach über einen bedeutsamen Moment",
    proposed_action: () => "schlug dem Schöpfer eine Tat vor",
    proposal_blocked: () => "schlug eine Tat vor, die nicht geschah",
    rejected_action: () => "schlug eine Tat vor, die der Schöpfer verwarf",
    accepted_action: () => "sah meinen Vorschlag vom Schöpfer angenommen",
    auto_executed_action: () => "veränderte die Welt für den Schöpfer",
});
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
// DER TIER-SATZ (profiband.K1, `_tickTierSatz`): `nahLeiber` Tiere leben im Nah-Kreis als Leib, jedes andere steht im Satz seiner
// Gestalt — `phasen` Posen je Band (der Knoten legt zwischen zwei Zeilen linear: mit 16 glitt der Stand-Fuß an den Kanten des
// Stands, gate:tier-gang Satz Wolf im Schritt 0,054, mit 32 0,033), die Bänder sind die Gangarten der GANG_FOLGE, gebacken an der Froude-Zahl `froude` (die Mitte
// jeder Gangart: Schritt unter froudeTrab 0,5, Trab bis froudeGalopp 2,5, Galopp darüber); `einschwingen` Gang-Schritte vor dem
// Zyklus, `backJeTakt` Schritte je Takt (Lehre 14), `cap` Instanzen je Senke, `leerTakte` bis ein leerer Satz geht.
AnazhRealm.KREATUR_SATZ = Object.freeze({
    nahLeiber: 4,
    phasen: 32,
    baender: Object.freeze(["schritt", "trab", "galopp"]),
    froude: Object.freeze([0.25, 1.5, 4]),
    einschwingen: 150,
    backJeTakt: 40,
    cap: 256,
    leerTakte: 1800,
    gewichtSaum: 1e-3,
});
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
// DIE TOD-LAGE IM LEERLAUF (`_todLageTick`): die Frist, nach der ein Fenster auch ohne Leerlauf kommt (ms), und die Scheibe
// (ms) — die Reserve, die ein Leerlauf-Fenster dem nächsten Bild lässt, und die Länge eines Fensters ohne Leerlauf. Gemessen
// (Radeon, Dorf Ego, unter Fremdlast): ein Tod kostete den Takt 28–84 ms, jetzt 0,3–0,6 ms; die Lage läuft in Fenstern von
// höchstens 9,7 ms, die Tafel steht 0,13–0,58 s nach dem Tod. `vorlaufSec` (halten.K5): so lange nach dem Tod (Kreatur-Uhr)
// steht der Leib in der Haltung seines Todes, dann fällt er — steht die Tafel da nicht, rechnet der Takt ihren Rest
// (`_todLageFrist`); vorher fiel er, wann der Leerlauf sie brachte (headless unbelastet 0,05 s, unter Last 15 Hz 0,67 s).
AnazhRealm.TOD_LAGE = Object.freeze({ fristMs: 50, scheibeMs: 2, vorlaufSec: 0.2 });
// DER LEBENSRAUM (tetrapoda LEBENSRAUM_GESETZ + bodenKlasse · lebensraum · lebensraumWahl, DURST_GESETZ + durst,
// ETHOGRAMM_GESETZ + lichtPhase · ruhePegel · aesung · taetigkeit, Tiere K4): Art × Ort × Uhr — die Boden-Klasse eines Orts, die
// Eignung je Gattung und ihr Tag. Fail-closed.
AnazhRealm._lebensraumGesetz = function () {
    if (AnazhRealm._lebensraumMemo) return AnazhRealm._lebensraumMemo;
    const k = typeof globalThis !== "undefined" ? globalThis.__tetrapodaCore : null;
    const L = k && k.LEBENSRAUM_GESETZ;
    if (
        L &&
        [L.flussM, L.hangTan, L.waldSd, L.randSd].every(Number.isFinite) &&
        L.gattung &&
        L.haeufigkeit &&
        typeof k.bodenKlasse === "function" &&
        typeof k.lebensraum === "function" &&
        typeof k.lebensraumWahl === "function" &&
        k.DURST_GESETZ &&
        [k.DURST_GESETZ.durstS, k.DURST_GESETZ.suchPauseS].every(Number.isFinite) &&
        typeof k.durst === "function" &&
        k.ETHOGRAMM_GESETZ &&
        Number.isFinite(k.ETHOGRAMM_GESETZ.daemmerSin) &&
        ["lichtPhase", "ruhePegel", "aesung", "taetigkeit"].every((f) => typeof k[f] === "function")
    ) {
        AnazhRealm._lebensraumMemo = Object.freeze({
            L,
            bodenKlasse: k.bodenKlasse,
            lebensraum: k.lebensraum,
            wahl: k.lebensraumWahl,
            D: k.DURST_GESETZ,
            durst: k.durst,
            E: k.ETHOGRAMM_GESETZ,
            lichtPhase: k.lichtPhase,
            ruhePegel: k.ruhePegel,
            aesung: k.aesung,
            taetigkeit: k.taetigkeit,
        });
        return AnazhRealm._lebensraumMemo;
    }
    return AnazhRealm._kernPflichtBruch("tetrapoda:LEBENSRAUM_GESETZ");
};
// DER BESTAND (tetrapoda BESTAND_GESETZ + bestandNahrung · bestandBilanz, Ökologie K2): das Revier, die Kapazität aus Nahrung ×
// Lebensraum und die logistische Bilanz je Takt der Spiel-Zeit. Fail-closed.
AnazhRealm._bestandGesetz = function () {
    if (AnazhRealm._bestandGesetzMemo) return AnazhRealm._bestandGesetzMemo;
    const k = typeof globalThis !== "undefined" ? globalThis.__tetrapodaCore : null;
    const B = k && k.BESTAND_GESETZ;
    if (
        B &&
        [B.taktS, B.revierM, B.rasterM, B.kopfJeHa, B.beuteVoll, B.geburt, B.tod, B.fress, B.riss, B.rissHalb].every(
            Number.isFinite
        ) &&
        typeof k.bestandNahrung === "function" &&
        typeof k.bestandBilanz === "function" &&
        typeof k.bestandFrass === "function" &&
        typeof k.bestandRiss === "function"
    ) {
        AnazhRealm._bestandGesetzMemo = Object.freeze({
            B,
            nahrung: k.bestandNahrung,
            bilanz: k.bestandBilanz,
            frass: k.bestandFrass,
            riss: k.bestandRiss,
        });
        return AnazhRealm._bestandGesetzMemo;
    }
    return AnazhRealm._kernPflichtBruch("tetrapoda:BESTAND_GESETZ");
};
// DER VOGEL (tetrapoda VOGEL_GESETZ + vogelWurf · vogelRevier · vogelLied · vogelBahn, Klang K1): Revier, Lied, Singflug und
// Leib — gelesen vom Vogel-Takt und vom Klang-Zensus (die Teile je Vogel); dazu der Schwarm (schwarmRevier · schwarmZentrum ·
// schwarmGlied · schwarmWunsch · schwarmSeparation, luftwasser.K5 und K2), gelesen vom Schwarm-Takt. Fail-closed.
AnazhRealm._vogelGesetz = function () {
    if (AnazhRealm._vogelGesetzMemo) return AnazhRealm._vogelGesetzMemo;
    const k = typeof globalThis !== "undefined" ? globalThis.__tetrapodaCore : null;
    const V = k && k.VOGEL_GESETZ;
    if (
        V &&
        [V.zelleM, V.proHa, V.habitatBasis].every(Number.isFinite) &&
        V.lied &&
        V.flug &&
        V.leib &&
        V.schwarm &&
        [
            "vogelWurf",
            "vogelRevier",
            "vogelLied",
            "vogelBahn",
            "schwarmRevier",
            "schwarmZentrum",
            "schwarmGlied",
            "schwarmWunsch",
            "schwarmSeparation",
        ].every((f) => typeof k[f] === "function") &&
        V.schwarm.verband
    ) {
        AnazhRealm._vogelGesetzMemo = Object.freeze({
            V,
            wurf: k.vogelWurf,
            revier: k.vogelRevier,
            lied: k.vogelLied,
            bahn: k.vogelBahn,
            schwarmRevier: k.schwarmRevier,
            schwarmZentrum: k.schwarmZentrum,
            glied: k.schwarmGlied,
            wunsch: k.schwarmWunsch,
            separation: k.schwarmSeparation,
        });
        return AnazhRealm._vogelGesetzMemo;
    }
    return AnazhRealm._kernPflichtBruch("tetrapoda:VOGEL_GESETZ");
};
