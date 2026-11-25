class AnazhRealm_kreatur_leben {
    // ===== ATLAS · Kreatur/leben — Spawn · Stats · Tod · Fauna-Zyklus · Serialisierung =====
    // ### Kreaturen ### V7.42
    removeCreature(creature) {
        this._kreaturZiegelTod(creature); // das Feld stirbt mit dem Tier
        if (!creature) return;
        // der Leib geht, sein Tier bleibt im Bestand (oekologie.K2#2) — eine Zahl, bis die Zeichnung es wieder ruft
        if (creature.userData && creature.userData._bestand) creature.userData._bestand.leib = null;
        // ein entfernter Leib braucht keine Tod-Lage mehr (`_todLageBestellen`): sein Auftrag hielt ihn sonst, bis der Leerlauf
        // ihn rechnete (Zeitraffer 28.10.: ~400 MB je Spiel-Stunde in vier Regionen, die Seite fiel bei 4 GB)
        const Q = this._todLagen;
        if (Q) for (let i = Q.length - 1; i >= 0; i--) if (Q[i].creature === creature) Q.splice(i, 1);
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
        // auch die Gefallenen gehen mit der Welt. Der BESTAND bleibt (feld.K2#2): er ist die Welt, die Leiber nur ihre Zeichnung —
        // er reist im Stand (`_lebenImStand`), fällt mit der Saat (`_bestandRegionen`) und mit dem Leben eines geladenen Stands
        // (`_lebenAusStand`); die Wiederkehr der Leiber findet ihre Tiere darin wieder (`_bestandLeibWieder`). Bis feld.K2#2 fiel er
        // hier, die Wiederkehr nahm die Leiber neu an, und die Seite rechnete ihre Regionen ab leer nach.
        for (const l of this.state.leichname.slice()) this.removeCreature(l);
        // Über eine KOPIE: removeCreature spliced die Liste selbst — ein forEach über das Original übersprang jedes
        // zweite Tier, das als eingefrorener Geist in der Szene blieb (Leben-Prüfung R-D14: 6 Tiere → 3 Geister,
        // je ~46 Befehle; jeder Welt-Wechsel und jede Neu-Genese).
        for (const creature of (this.state.creatures || []).slice()) this.removeCreature(creature);
        this.state.creatures = [];
        // DAS ETIKETT-FELD fällt IMMER mit den Tieren (es läuft parallel zu `creatures`): bis 30.10. kehrte die Funktion bei null
        // Tieren vor dieser Zeile zurück — ein Etikett-Feld, das das Laden eben gesetzt hatte, blieb stehen, und jede Wiederkehr hängte
        // ihr Etikett an (headless nach dem Rudel von oekologie.K4#2: 1 Tier, 2 Etiketten; die Mess-Sitzung fand creatureEmotions abweichend)
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
        // DIE KAPPE WÄHLT, WER GEZEICHNET WIRD — nie, ob ein Akt geschieht (oekologie.K2#2): ist sie voll, weicht ein gezeichnetes
        // Tier des Bestands, das gehen darf (`_bestandWeicht`), als Zahl in sein Tier; die Obergrenze fällt nur, wenn keiner weichen
        // darf. Bis w5-studios-k1 sagte spawn_studio „die Welt trägt nicht mehr Kreaturen", sobald der Bestand die Plätze gezeichnet
        // hatte — an der OMEN prägte keine Gattung ein Werk (gate:praegung-welt (K): kreatur 0/5, Grund obergrenze, 147 von 152).
        let weicht = null;
        if (this.state.creatures.length >= this.state.maxCreatures && !(weicht = this._bestandWeicht()))
            return nein("obergrenze");
        // SPIELER-KLEMME: kein Wesen materialisiert IM Spieler — näher als CREATURE_SPAWN_CLEAR_M wird
        // radial auf den Ring geschoben (deckungsgleich → Goldwinkel über den Platz im Wurf, nie über die laufende Nummer).
        // Opt-out `precise` für bit-treue Pfade (Restore/Peer-Sicht).
        const ort = { x, z }; // der Ort des Leibs, wie ihn der Wurf rief: ein Pfad seiner Lose (`_leibLos`)
        if (!opts.precise && this.state.playerMesh) {
            const pm = this.state.playerMesh.position;
            const dx = x - pm.x;
            const dz = z - pm.z;
            const d = Math.hypot(dx, dz);
            const MIN = AnazhRealm.CREATURE_SPAWN_CLEAR_M;
            if (d < MIN) {
                const ang = d > 1e-4 ? Math.atan2(dz, dx) : ((opts.platz | 0) + 1) * 2.39996;
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
        if (weicht) this._bestandEntkoerpern(weicht); // erst der gegossene Leib nimmt den Platz (eine Absage räumt keinen)
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
        // creature-pos-Strom (Mitspieler keyen ihre Sicht-Kopie damit). Sie ist REINE KENNUNG und speist kein Los.
        this.state._creatureNetSeq = (this.state._creatureNetSeq || 0) + 1;
        group.userData.netId = "c" + this.state._creatureNetSeq;
        // DIE LOSE DES LEIBS (Welle SAMEN): Name, erster Ruhe-Pegel und Wander-Kurs ziehen aus der Los-Nummer (`userData.los`: der
        // Samen-Baum am Pfad Ort × Art × Platz im Wurf, `_leibLos`, oder die Kennung des Tiers im Bestand), nie aus `_creatureNetSeq`
        // (A gegen A am Ort dorf trugen die Leiber des Boot-Wurfs c18–c22 nach 593 Takten, c24–c28 nach 1300: D4 Tiere 4 von 29 anders).
        group.userData.los = Number.isFinite(opts.los) ? opts.los : this._leibLos(ort, chosenSoul, opts.platz | 0);
        group.userData.name = this._pickCreatureName("s" + group.userData.los);
        // DIE GRÖSSE (bs, die Skala des Gusses): die des Tiers im Bestand (`_bestandBs`, sein Erbe über das Alter) oder des
        // Snapshots (opts.bodySize); ein Leib ohne Bestand (Boot, DSL, Hof) ist das ART-MITTEL — a = 0, e = 0, erwachsen, bs = 1.
        // Weder die netId (reiner Sync-Schlüssel) noch die Los-Nummer würfelt sie (bis leben-erbe die netId aus vier Bändern).
        // Das Template wird NUR UNIFORM skaliert — Symmetrie und Physik-Verhältnisse bleiben invariant.
        // Muss VOR der hp-Init unten stehen (die Stats lesen bodySize).
        group.userData.bodySize = Number.isFinite(opts.bodySize) ? opts.bodySize : 1;
        // Die Körpergröße skaliert das Studio-Tier UNIFORM; die Glied-Dicke ist Gesetz der Art (ART_GESTALT.bein,
        // deriveTierParams: Beinmuskel ∝ Größe^0,67). Die Galileo-Allometrie des Wirts (√L auf die Glied-Kinder) fiel
        // (Integration W5-Körper): das Studio-Tier trägt keine Teil-Kinder, sie lief seit Welle 5 für kein Wesen mehr.
        group.scale.setScalar(group.userData.bodySize);
        group.userData.task = { name: "wander", args: {}, since: this.state.spielZeit };
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
            // ohne es kehrte jedes Tier 0 s alt wieder, sein Alterstod (lebensdauerS seines Leibs) kam erst ohne Reload
            alterS: ud.alterS > 0 ? ud.alterS : undefined,
            // S7 — die Körpergröße reist mit (Restore re-spawnt mit NEUER netId → bodySize
            // MUSS persistiert werden, sonst änderte das Wesen beim Reload seine Größe).
            bodySize: Number.isFinite(ud.bodySize) ? ud.bodySize : 1,
            // S6 — der Verband und sein Revier reisen mit (ohne sie zerfiele die Herde beim Reload)
            verband: ud.verband != null ? String(ud.verband) : undefined,
            // das Tier des Bestands, das der Leib zeichnet (feld.K2#2): die Wiederkehr findet es im Bestand des Stands wieder
            bestand: ud._bestand ? ud._bestand.id : undefined,
            bestandOrt: ud._bestand && ud._bestand.gau ? [ud._bestand.x, ud._bestand.z] : undefined, // der Ort seines Kopfs im Gau
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

    // DIE MARKE DES WESENS im Stand (speicher.K2#2): jeder Wert, den `_serializeCreature` liest — gleiche Marke, gleiches JSON.
    // Die Reihen (Gedächtnis, steckende Pfeile) wachsen am Ende und verlieren vorn (`_creatureRemember`, `_pfeilInsTier`): sie
    // selbst, ihre Länge, ihr jüngstes Glied. Ein Wesen, das ruht, fragt der Besen so ohne neues JSON.
    _kreaturMarke(creature) {
        const ud = creature.userData;
        const [p, rot, mem, pf, wa, t, eq] = [
            creature.position,
            creature.rotation,
            ud.memory,
            ud._steckPfeile,
            ud.wanderAnchor,
            ud.task,
            ud.equipped,
        ];
        const m = [ud.name, ud.soul, mem, mem && mem.length, mem && mem[mem.length - 1], ud.bornAt, ud.alterS];
        m.push(p && p.x, p && p.y, p && p.z, rot && rot.y, ud.bodySize, ud.verband, ud.feldWurf, ud.hp, ud.hpMax);
        m.push(wa, wa && wa.x, wa && wa.z, pf, pf && pf.length, pf && pf[pf.length - 1], ud.bond, ud.gussDials);
        m.push(eq, eq && eq.tool, eq && eq.armor, t, t && t.name, t && t.args, ud._bestand);
        if (t && t.args && typeof t.args === "object") m.push(...Object.values(t.args));
        return m;
    }

    // DIE GUSS-DIALS EINES STAND-WESENS, geprüft (undefined = die Gattung, wie sie ist) — EIN Leser für die Wiederkehr
    // (`_restoreCreatureFromSnapshot`) und für den Ofen-Vorrat, der ihre Vorlage vorab bestellt (`_ofenStandBestellen`): beide
    // müssen DENSELBEN Schlüssel der Vorlage treffen, sonst gießt die Wiederkehr neben der bestellten Vorlage auf dem Haupt-Faden.
    // Sie laufen durch DENSELBEN Prüfer wie der Übergabe-Kanal (Kreatur-PARAMS-Klemme) — ein hand-editierter Save schleust keine
    // Riesen-Dials ein; die Gattung (recId) pinnt TETRAPODA_SOUL_MAP.
    _standGussDials(snap) {
        if (!snap || !snap.gussDials || typeof snap.gussDials !== "object" || Array.isArray(snap.gussDials))
            return undefined;
        const recId = AnazhRealm.TETRAPODA_SOUL_MAP && AnazhRealm.TETRAPODA_SOUL_MAP[snap.soul];
        if (!recId) return undefined;
        const clean = this._studioWerkPruefen("kreatur", recId, snap.gussDials);
        return clean && Object.keys(clean).length ? clean : undefined;
    }

    // Spawnt am alten Ort mit alter Seele, setzt den persistierten Namen + memory; Specs nicht direkt
    // (live aus memory). Liefert die THREE.Group oder null.
    // `los`: die Los-Nummer, die der Rufer trägt (das Tier des Bestands); sonst zieht der Leib sie an seinem Ort (`_leibLos`).
    _restoreCreatureFromSnapshot(snap, emotion = "happy", los = undefined) {
        if (!snap || !snap.position) return null;
        // Restore ist PRECISE (bit-treu; die Spieler-Klemme gilt nur frischen Spawns); die Guss-Dials geprüft (`_standGussDials`).
        const restoreDials = this._standGussDials(snap);
        const c = this.spawnCreatureAt(snap.position.x, snap.position.y, snap.position.z, emotion, snap.soul, {
            precise: true,
            los,
            // S7 — die persistierte Körpergröße zurück; ein Leib, der sein Tier sucht (`snap.bestand`), trägt gleich danach
            // dessen Größe, einer ohne Tier ist kein Gesetz: er klemmt auf die Grenzen des Gesetzes (`_lebenSpanne` — ein Stand
            // von vor leben-erbe trug Band-Größen bis 2,7)
            bodySize: Number.isFinite(snap.bodySize) ? this._lebenSpanne(snap.bodySize) : undefined,
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
        if (typeof snap.bestand === "string") this._bestandLeibWieder(c, snap.bestand, snap.bestandOrt);
        // DER LEIB DES TIERS IST SEIN ERBE ZUR ZEIT (leben-erbe): kehrt er mit seinem Tier wieder, trägt er dessen Größe jetzt
        // (`_bestandBs`) — der Stand trug die Größe des Augenblicks, in dem er gespeichert wurde
        if (c.userData._bestand) this._kreaturGroesseSetzen(c, this._bestandBs(c.userData._bestand));
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
    // userData.boosts = [{source, tagDelta, expiresAt}] (der Name ist eine Funktion der Quelle, `_boostZeile`); gleiche source verlängert, der 1-Hz-Tick
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
        const now = this.state.spielZeit;
        const expiresAt = now + duration;
        if (!Array.isArray(creature.userData.boosts)) creature.userData.boosts = [];
        const existing = creature.userData.boosts.find((b) => b.source === source);
        const isNewBoost = !existing;
        if (existing) {
            // Selbe Quelle erneut → expiresAt verlängern, tagDelta aktualisieren (Konsumable könnte sich zwischen
            // Aktivierungen verändert haben). Selbe Disziplin wie Player.addPlayerBoost.
            existing.expiresAt = expiresAt;
            existing.tagDelta = tagDelta;
        } else {
            creature.userData.boosts.push({ source, tagDelta, expiresAt });
        }
        this._afterCreatureEquipChange(creature);
        // Proaktive Sprache nur bei NEUEM Boost (nicht beim Verlängern, sonst spräche sie jeden Tick);
        // der Throttle in _creatureSpeakProactive ist die zweite Verteidigung gegen Flood.
        if (isNewBoost && typeof this._creatureSpeakProactive === "function") {
            this._creatureSpeakProactive(creature, "boost_received", { label: this._boostZeile({ source }) });
        }
        return true;
    }

    // 1 Hz Tick — säubert abgelaufene Boosts. Wird aus Game-Loop aufgerufen
    // (analog tickPlayerBoosts). Iteriert alle Kreaturen — günstig genug bei
    // ≤120 Kreaturen × O(boostsCount) Filter pro Sekunde.
    tickCreatureBoosts(currentTime) {
        if (!Array.isArray(this.state.creatures)) return;
        const now = currentTime;
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
        });
        // DAS WESEN ERINNERT, WER ES FÜTTERTE (Ökologie K3): die Gabe senkt die Furcht vor dem Spieler (`_kreaturFurchtErinnert`)
        // die Erinnerung spricht zur Tür des Modells in der Quell-Sprache des Gesetzes (de), nie in der Sprache des Spielers von jetzt
        if (ok)
            this._creatureRemember(creature, "gefuettert", {
                gabe: blueprintName,
                label: AnazhRealm._etikettQuelle(bp),
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
            // das Wort des Spielers: die id oder der Name der Seele in seiner Sprache (die Zeile der Sprach-Tafel)
            const hit = souls.find((n) => norm(n) === w || norm(this._t(AnazhRealm.CREATURE_SOULS[n].label)) === w);
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
                this.journalAppend("relationship", ["journal.bedrohung-bezwungen", { name }]);
        }
        if (typeof this.journalAppend === "function") {
            const lootSummary = lootParts.length > 0 ? ` → ${lootParts.join(", ")}` : "";
            this.journalAppend("relationship", ["journal.fiel-im-kampf", { name, beute: lootSummary }], {
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
                    ["journal.last-zurueck", { name: ud.name || ["journal.ein-wesen"], last: zurueck.join(", ") }],
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
        this._bestandAus(creature); // sein Tier verlässt den Bestand (oekologie.K2#2), fiel es nicht schon im Gesetz
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
        // Lebenszyklus nimmt sein Opfer, wo es steht), lag ohne Tod-Lage — trat der Spieler heran, steckte die Flanke im Hang.
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
        try {
            this._todLageGang(offen);
        } finally {
            if (Q.length) this._imLeerlauf((f) => this._todLageTick(f), T.fristMs);
        }
    }
    // DIE TOD-LAGE IM TAKT (w28-preis-ort, Schnitt 3): auch der Takt rechnet an ihr — als Bauer der EINEN Frist im Planer
    // (`TAKT_BAUER.todLage`), Winkel für Winkel bis zur Frist. Der Leerlauf allein kam auf einem Gerät, dessen Faden auf die GPU
    // wartet, in den TOD_LAGE.vorlaufSec bis zum Fall kaum zum Zug: die Frist des Falls (`_todLageFrist`) rechnete dann die ganze
    // Tafel in EINEM Takt (Kopf 94f2e615, Radeon, Dorf stehend, Tiere frei: vier Bilder zu 124–150 ms in 60 s, `_todHebeTafel`).
    _todLageTakt() {
        const Q = this._todLagen;
        if (!Q || !Q.length) return;
        const bis = this._bauFrist("todLage");
        this._todLageGang(() => performance.now() < bis);
    }
    // der Gang der Tod-Lage: je Schritt ein Winkel des Gefallenen nah am Spieler, solange `offen()` — mindestens einer
    _todLageGang(offen) {
        const Q = this._todLagen;
        const p = this.state.playerMesh.position;
        do {
            let j = 0;
            let dj = Q[0].creature.position.distanceToSquared(p);
            for (let i = 1; i < Q.length; i++) {
                const di = Q[i].creature.position.distanceToSquared(p);
                if (di < dj) [j, dj] = [i, di];
            }
            if (this._todLageSchritt(Q[j])) Q.splice(j, 1);
        } while (Q.length && offen());
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

    // describeProgram-Helper für Kreatur-Tasks: der Zusatz des Auftrags als Zeile der Tafel (Material · Bauplan · Distanz) oder
    // null — abhängig von Task + Arg-Typ.
    _describeCreatureTaskArg(taskName, paramArg) {
        if (taskName === "gather" && typeof paramArg === "string" && paramArg.length > 0)
            return ["tat.auftrag.material", { was: paramArg }];
        if (taskName === "build" && typeof paramArg === "string" && paramArg.length > 0)
            return ["tat.auftrag.bauplan", { was: paramArg }];
        if (taskName === "follow_player" && Number.isFinite(paramArg))
            return ["tat.auftrag.distanz", { n: String(paramArg) }];
        return null;
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
            this.journalAppend("growth", ["journal.stufe", { name, stufe: newLevel, rolle: role }], {
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
        const name = creature.userData.name || "Wesen";
        // Async-Call ohne await — V3 lebt mit Eventual-Render; derselbe Weg wie das Gespräch (`llmCallCreature`: das
        // Gedächtnis, die Antwort-Form der Seele und die Prüfung gegen das Gedächtnis), der Moment als Anlass
        this.llmCallCreature(creature, "(Selbst-Reflexion: bedeutsamer Moment.)", {
            anlass: eventHint,
            hintergrund: true,
        })
            .then((reply) => {
                if (!reply || reply.error) return;
                if (reply.say) {
                    const sayText = String(reply.say).slice(0, 400);
                    const soulName = creature.userData.soul || "wesen";
                    const chatOutput = typeof document !== "undefined" ? document.getElementById("chat-output") : null;
                    if (chatOutput)
                        this._chatEcho(sayText, {
                            klasse: "chat-rare-event-line",
                            sprecher: name,
                            sprecherKlasse: `chat-creature-name soul-${soulName}`,
                        });
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
    // DIE BRÜCKE (fahrzeug.K2) trägt wie der Grund: die Trittfläche eines Werks unter der Stufe des Körpers (`_trittUeber`, die
    // Bahn der Jochbrücke) — der Wagen fährt, das Tier und der Bewohner gehen über den Bach, nie durch sein Bett.
    _koerperBodenUnter(x, yRef, z) {
        if (Number.isFinite(yRef)) {
            // eingegraben (der Hang stieg unter dem Schritt): nur eine Stufe aufwärts suchen — tiefer im Fels ist kein
            // Gang (ein Spawn im Gestein), dort trägt die Säule
            const y0 = yRef + AnazhRealm.PLAYER_STEP_UP;
            const g = this._koerperGrund(x, y0, z, this._fieldSolid(x, y0, z) ? 2 : 40);
            if (g !== null) return this._trittUeber(x, z, g, y0);
        }
        const oben = this._voxelSurfaceY(x, z);
        const eis = this._eisAt(x, z, NaN, Infinity, oben);
        if (eis !== null && !(oben >= eis)) return eis;
        return Number.isFinite(oben) ? oben - this._schneeTrittAt(x, oben, z) : oben;
    }

    // DIE TRITTFLÄCHE ÜBER DEM GRUND (fahrzeug.K2): die höchste Oberkante einer Box mit `tritt` (die Bahn eines Jochfelds,
    // `_populateBlockerAABBs`) über (x, z) zwischen dem Grund `g` und `bis` (die Stufe des Körpers) — sonst g. Der billige Beweis
    // zuerst (Lehre 25): ohne Trittfläche in der Welt (`_trittDa`) fragt kein Körper das Blocker-Netz. Leser: jeder Körper
    // (`_koerperBodenUnter`) und die Strecke des Gehenden (`_bewohnerWand`).
    // KEIN KÖRPER STECKT IN DER TRITTFLÄCHE (material.K4), wie keiner im Fels (die Säule trägt, `_koerperBodenUnter`): liegt der
    // Grund IN ihr (ihre Sohle darunter), trägt ihre Oberkante, über jede Stufe; gestapelt (der Quarz-Kern auf der Scheibe) die
    // oberste, in die der Grund so gelangt. Bis dahin stand ein Wagen, gesetzt auf die Genesis-Plattform, 0,85 m in ihr.
    _trittUeber(x, z, g, bis) {
        if (!this._trittDa) return g;
        const kand = this._trittKand || (this._trittKand = []);
        kand.length = 0;
        this._blockerNahe(x, z, 0, 0, kand);
        let top = g;
        for (let hob = true; hob;) {
            hob = false;
            for (const e of kand)
                for (const box of e.blockerAABBs || [])
                    if (
                        box.tritt &&
                        box.topY > top &&
                        (box.topY <= bis || box.botY <= top) &&
                        this._boxAbstand2(box, x, z) <= 0
                    )
                        ((top = box.topY), (hob = true));
        }
        return top;
    }

    // DER GRUND EINES KÖRPERS unter y0 binnen `maxDist`: die Fels-Grenze (`_fieldSurfaceBelow`) oder das Eis über ihr
    // (`_eisAt`) — das Höhere trägt, null ohne beides. Leser: der Kapsel-Schritt (`_stepCharacter`), `_koerperBodenUnter`,
    // `_koerperSchritt`, der Ausstieg vom Wagen (`_aussteigOrt`).
    // DIE SCHNEE-DECKE (wetter.K4) trägt nicht an ihrer Fläche: der Körper steht um ihren Tritt in ihr (`_schneeTrittAt`), das Eis
    // trägt an seiner.
    _koerperGrund(x, y0, z, maxDist) {
        const g = this._fieldSurfaceBelow(x, y0, z, maxDist);
        const e = this._eisAt(x, z, y0, maxDist, g);
        if (e !== null && !(g >= e)) return e;
        return g === null ? g : g - this._schneeTrittAt(x, g, z);
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
    // Die Teile einer Seele sind Daten: ihre Tags einmal je Seele gerechnet (die Geburt fragt sie je Kandidat und Region).
    _creatureSoulTags(soulName) {
        const soul = AnazhRealm.CREATURE_SOULS && AnazhRealm.CREATURE_SOULS[soulName];
        if (!soul || !soul.bodyParts) return {};
        const M = this._seelenTags || (this._seelenTags = new Map());
        if (!M.has(soul)) M.set(soul, Object.freeze(this.computeCompoundTags({ parts: soul.bodyParts })));
        return M.get(soul);
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
    // des Gelände-Gesetzes (`_terrainSaatY`, aus.hang) und die Bestandsdichte des Walds (`_forestStandDensity`).
    // DIE KLASSE LIEST NUR DIE SAAT (feld.K2#2): der Hang ist der des Geländes UNTER dem Erdbau der Orte. Bis w28-mp-boden
    // las sie `_terrainMacroSurfaceY` — wo ein Ort seinen Erdbau legt, nennt das Gesetz den Hang 0 (gelaende-core `hoehe`), die
    // Klasse der Zelle kippt, und der Bestand merkt sie sich einmal je Zelle (`_bestandFeld`): die Seite, die vor der Ankunft
    // des Erdbaus fragte, trug eine andere Klasse als die danach und als jeder Reload (gate:mp-sync (f): der Bestand EINER
    // Region lief auseinander, Leben 251 von 335 Zellen gleich — an main ein Kipper der CI, am Kopf w28-stadt-grammatik 22872718
    // 3 von 3 ROT, wo der Torplatz eines Orts auf der Mitte einer Zelle liegt).
    _bodenKlasseAt(x, z) {
        const LG = AnazhRealm._lebensraumGesetz();
        // die Leser der Saat; die Formel ist Kern (tetrapoda `bodenKlasseAm` — dieselbe ruft das Feld des Gaus im Faden)
        let W = this._bodenKlasseWelt;
        if (!W) {
            const aus = {};
            W = this._bodenKlasseWelt = {
                flussRand: (x, z) => this._hydroDistAt(x, z),
                hang: (x, z) => (this._terrainSaatY(x, z, true, aus), aus.hang),
                bestand: (x, z) => this._forestStandDensity(x, z),
            };
        }
        return LG.bodenKlasseAm(W, x, z, LG.L);
    }

    // [ATMOSPHERE] Lifecycle-Tod: Trauer (sorrow), journal-loss-Eintrag (mit der Ursache: hunger · alter), Aura-Pulse (ohne
    // `naehrt`: das Gesetz gab ihn schon am Anker des Tiers, `_bestandStirbt`), dann der Fall (_kreaturFaellt: der letzte Ruf,
    // kippen, liegen, sinken). Memory stirbt bewusst mit der Kreatur.
    _creatureNaturalDeath(creature, ursache = "alter", naehrt = true) {
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
        if (naehrt && creature.position)
            this._lebenGabe(
                creature.position.x,
                creature.position.z,
                AnazhRealm.LIFE_FIELD.pulseCenter * (0.8 + lebendig),
                null
            );
        // Journal-Eintrag
        if (typeof this.journalAppend === "function") {
            this.journalAppend("loss", ["journal.zur-erde", { name }], {
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
    // `frisch`: ein Strom, den niemand weiterzählt (der Takt des Bestands, je Region und Zeit einer, feld.K2#2) — nicht gemerkt
    _faunaRng(zweck = "fauna", frisch = false) {
        const seed = AnazhRealm._saatJe(this);
        let f = this._faunaStroeme;
        if (!f || f.seed !== seed) f = this._faunaStroeme = { seed, rng: Object.create(null) };
        const strom = f.rng[zweck] || this._streamRng(seed + "-" + zweck);
        return frisch ? strom : (f.rng[zweck] = strom);
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
    // Stünde der LEIB einer Gattung `g` der Größe `bs` an (x, z) im Blick? Seine Körper-Kugel wie `_kreaturAusserBlick`
    // (Reichweite + halbe Höhe um die halbe Höhe über dem Fuß, dazu der Saum) samt dem RAND DES BLICKS der Ruhe
    // (`_kreaturBlickRand`: das Frustum ist das des Vor-Takts, die Kamera dreht weiter) — dieselbe Frage, die die Ruhe an einen
    // Leib stellt; die Geburt fragt sie (`_kreaturWurf`, `_bestandLeibOrt`). Bis w7-begegnung fragte jede Geburt den Punkt
    // ohne Rand: ein Leib am Rand des Blicks, dessen Fuß-Punkt draußen lag, ragte bei der Geburt ins Bild (Kreis-Sonde der
    // Mess-Wiese, 400 s ein + 600 Spiel-s, Null-Renderer: am main 2d2a5f11 Ego 3, Third 5 im Blick erschienen, hier 0 und 0).
    _kreaturLeibImBlick(x, z, g, bs) {
        const fr = this._frustumCache;
        if (!fr) return false;
        const rand = this._kreaturBlickRand();
        if (rand < 0) return true; // die Kamera dreht schneller, als der Rand trägt: keine Geburt in diesem Takt
        // der Leib, der dort erst stünde: ein Stellvertreter ohne Gier trägt seine Hüfte (`_kreaturLeib` liest nur die Gier)
        const stell = this._geburtsStell || (this._geburtsStell = { rotation: { y: 0 } });
        const leib = this._kreaturLeib(
            stell,
            this._gattungLeib(g).beinL * bs,
            this._geburtsLeib || (this._geburtsLeib = {})
        );
        const s = this._geburtsKugel || (this._geburtsKugel = new THREE.Sphere(new THREE.Vector3(), 0));
        s.center.set(x, this.getTerrainHeightAt(x, z) + 0.5 * leib.hoehe, z);
        s.radius =
            leib.reichweite +
            0.5 * leib.hoehe +
            AnazhRealm.KREATUR_RUHE.saumM +
            s.center.distanceTo(this.state.camera.position) * rand;
        return fr.intersectsSphere(s);
    }
    // DER RAND DES BLICKS im Takt (`_tickKreaturRuhe`: tan(randGrad + doppelte Drehung des Vor-Frames), −1 bei zu schneller
    // Drehung); vor dem ersten Kreatur-Takt der Grund-Rand `KREATUR_RUHE.randGrad`.
    _kreaturBlickRand() {
        return Number.isFinite(this._blickRand)
            ? this._blickRand
            : Math.tan((AnazhRealm.KREATUR_RUHE.randGrad * Math.PI) / 180);
    }

    // TRÄGT DER GRUND EIN GEBORENES TIER? Die Geburt ist ein Wurf des Felds (`_wildnisTraegt`) und weicht dem Bau wie jeder
    // Wurf (`_weichtDemBau`): nie im Grundriss eines Baus und nie auf der Lichtung des Genesis-Platzes (`_imGrundriss`),
    // nie in der Hülle eines Dorfs (`wegeKarte.siedlungen`: Wege, Plätze, Äcker und die Häuser zwischen ihnen). Bis G4a
    // fragte die Geburt nur die Wildnis — ein Rudel hätte im Start-Dorf (110–170 m vom Genesis-Ort) geboren werden können.
    // Und nur auf dem LAND (`_landAt`, die EINE Frage jedes Wurfs: das gezeichnete Wasser und das des Gesetzes über dem Boden;
    // zuletzt, die teuerste): bis w13-pegel-heil fragte keine Geburt das Wasser — der Bestand ankerte Tiere im See und zeichnete
    // sie auf seinem Grund (gate:werk-im-wasser am Seeufer 1849/−6111: am main Fuchs und drei Wölfe 3,64 m, an 43584419 sechs
    // Hirsche 3,5–3,6 m unter dem Spiegel, gezeichnet und frei zum Weichen). Und nie im Reich eines Orts, der kommt
    // (`_imReichEinesOrts`: das Gesetz der Zellen, solange seine Hülle nicht steht) — bis tiere.K1#2 warf die Geburt in den Grund
    // eines Dorfs, das noch nicht erwacht war, und sein Erdbau trug den Boden unter dem Wurf ab (Herde am Hang: 2 von 5 Leibern
    // hinter der Böschung).
    _kreaturGrundFrei(x, z) {
        if (!this._wildnisTraegt(x, z) || this._imGrundriss(x, z)) return false;
        const wk = this.state.wegeKarte;
        if (wk) for (const b of wk.siedlungen) if (x >= b.x0 && x <= b.x1 && z >= b.z0 && z <= b.z1) return false;
        if (this._imReichEinesOrts(x, z)) return false;
        return this._landAt(x, z);
    }

    // DER WURF (G4a): die Geburt wirft eine GRUPPE nach dem Gesetz des Kerns (tetrapoda VERHALTEN.herde.wurf): die Kopfzahl
    // [min, max] der Gattung — das Rudel, die Herde, der Einzelgänger — und den Abstand der Geworfenen in Paar-Räumen. Der
    // erste steht am Ort, jeder weitere auf der Sonnenblumen-Spirale um ihn (Abstand × √k im Goldwinkel: keiner im Raum des
    // anderen, jeder im Fenster der Herde) — jeder nach dem Gesetz des Geburts-Orts: fern, außerhalb des Blicks, auf freiem
    // Grund; wo es nicht trägt, fehlt er. Alle teilen den Anker der Leine (den Wurf-Ort): die Gruppe bleibt beisammen.
    // `platz` deckelt die Kopfzahl (die Kosten-Kappe maxCreatures gilt für die Summe). Vorher warf jede Geburt EIN Tier an
    // einem Einzelort — Herden bildeten sich kaum, ein Rudel sah der Spieler nie (Fäden 16.10.: 25 %). Mit `tiere` (Tiere des
    // Bestands, `_bestandLeiber`) zeichnet der Wurf sie — ihre Seele, Größe und Zahl, kein Wurf der Kopfzahl, ihr Anker bleibt.
    // Liefert die Geborenen.
    _kreaturWurf(ort, seele, emotion, rng, platz, tiere = null) {
        const soul = tiere ? tiere[0].soul : this._pickCreatureSoulName(seele, rng);
        const geboren = [];
        if (!soul) return geboren;
        const W = AnazhRealm._verhaltenGesetz().herde.wurf;
        const zeile = W[AnazhRealm.TETRAPODA_SOUL_MAP[soul]];
        const kopf = tiere ? tiere.length : zeile ? zeile[0] + Math.floor(rng() * (zeile[1] - zeile[0] + 1)) : 1;
        const n = Math.min(kopf, platz);
        // hält der Platz die kleinste Gruppe der Gattung nicht, fällt der Wurf (kein Rudel aus einem Wolf: der Deckel
        // schneidet nie die Gruppe, er lässt einem Einzelgänger den Platz — Werkbank 16.10.: „wolf 1" am Ende des Boot-Wurfs)
        if (!tiere && zeile && n < zeile[0]) return geboren;
        const dreh = rng() * Math.PI * 2;
        const pm = this.state.playerMesh;
        const p = pm ? pm.position : { x: 0, y: 0, z: 0 };
        const symphonie = this.state.symphony && this.state.symphony.enabled;
        if (symphonie) this.state.symphony.enabled = false; // still: kein Ping-Schwall
        // der Abstand der Spirale: abstandRaum × der Paar-Raum der Gattung (der Raum des ersten bei Größe 1 — die Größe
        // jedes Tiers ist sein Erbe über sein Alter, `_bestandBs`); ein Platz, der nicht trägt, gibt sein Tier dem nächsten
        let abstand = 0;
        // DER LEBENSRAUM DES WURFS (Tiere K4): liegt der Wurf-Ort im Lebensraum der Gattung, steht jeder Geworfene in ihm (ein
        // Platz am Saum, der schon Wald ist, gibt sein Tier dem nächsten); ein Akt, der anderswo wirft, wirft frei
        const LG = AnazhRealm._lebensraumGesetz();
        const lebt = (x, z) => LG.lebensraum(AnazhRealm.TETRAPODA_SOUL_MAP[soul], this._bodenKlasseAt(x, z), LG.L) > 0;
        const imRaum = lebt(ort.x, ort.z);
        // das Fenster der Herde (herde.fensterRaum Paar-Räume): jeder Geworfene steht in ihm zu einem, der schon steht
        const fenster = AnazhRealm._verhaltenGesetz().herde.fensterRaum / W.abstandRaum;
        const gattung = AnazhRealm.TETRAPODA_SOUL_MAP[soul];
        for (let k = 0; geboren.length < n && k < 3 * n; k++) {
            // der Abstand wächst mit den Geworfenen, nicht mit den Würfen: ein Platz, der nicht trägt, gibt seinen Ring dem
            // nächsten Winkel
            const a = dreh + k * 2.39996;
            const x = ort.x + Math.cos(a) * abstand * Math.sqrt(geboren.length);
            const z = ort.z + Math.sin(a) * abstand * Math.sqrt(geboren.length);
            // außer Blick ist der LEIB, der dort stünde (seine Kugel, `_kreaturLeibImBlick`; ohne Bestand die größte Größe des
            // Gesetzes, `spanne()`) — auch der erste; ohne Bestand trägt er die Los-Nummer seines Platzes (`_leibLos`, Welle SAMEN)
            const los = tiere ? null : this._leibLos(ort, soul, geboren.length);
            const bs = tiere ? this._bestandBs(tiere[geboren.length]) : AnazhRealm._lebenKern().spanne()[1];
            // der Leib des Bestands erscheint nach seinem Gesetz (`_bestandErscheint`: an seinem Ort, ohne Ferne); die Geburt fern
            if (
                tiere
                    ? !this._bestandErscheint(x, z, gattung, bs)
                    : gattung && this._kreaturLeibImBlick(x, z, gattung, bs)
            )
                continue;
            if (k > 0) {
                const fern = !!tiere || Math.hypot(x - p.x, z - p.z) >= AnazhRealm.CREATURE_SPAWN_FAR_MIN;
                if (!fern || !this._kreaturGrundFrei(x, z) || (imRaum && !lebt(x, z))) continue;
                if (!geboren.some((g) => Math.hypot(g.position.x - x, g.position.z - z) <= fenster * abstand)) continue;
            }
            const gY = this.getTerrainHeightAt(x, z);
            const y = (Number.isFinite(gY) ? gY : p.y) + 1;
            const c = tiere
                ? this._bestandLeib(tiere[geboren.length], x, y, z)
                : this.spawnCreatureAt(x, y, z, emotion, soul, { los, platz: geboren.length });
            if (!c) break; // die Obergrenze oder die Gestalt: der Rest des Wurfs fällt mit
            if (!tiere) c.userData.wanderAnchor = { x: ort.x, z: ort.z };
            // DIE MARKE DES WURFS (`feldWurf`, wie am Wurf eines Werks, im Save): ein Bau, der nach der Geburt kommt, räumt das
            // Tier aus seinem Grundriss (`_weichtDemBau`, `_naturRaeumen`)
            c.userData.feldWurf = true;
            if (k === 0) abstand = (W.abstandRaum * 2 * this._kreaturRaum(c)) / c.userData.bodySize;
            geboren.push(c);
        }
        if (symphonie) this.state.symphony.enabled = true;
        if (!tiere) this._kreaturVerbinden(geboren);
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

    // [ATMOSPHERE] Geburt (Ökologie K2, oekologie.K2#2): in der Region `key` (ohne: die des Spielers) 6 Kandidaten-Orte auf
    // freiem Grund der Kachel (`_kreaturGrundFrei`), je die Seele ihres Lebensraums und ihr Affinity-Score. DIE BILANZ
    // (`_kreaturBestand`, tetrapoda bestandBilanz): jede Gattung unter ihrer Kapazität wirft mit IHRER Chance (kein Gemüt einer
    // Seite rückt sie, feld.K2#2), an ihrem Kandidaten mit dem höchsten Score (bei Gleichstand der frühere); ohne Bilanz
    // wirft der beste Ort, was sein Lebensraum trägt (die Frage der Lebensraum-Linse). Vorher warf je Takt nur der beste Ort —
    // EINE Gattung, die anderen warteten: ohne Wölfe blieb das Rotwild bei n/K ≈ 0,65 (Zeitraffer 27.10.), das Alter nahm, was
    // die gedrosselte Geburt brachte. Geboren wird in den BESTAND, nie ein Körper: die Gruppe der Gattung (die Kopfzahl aus
    // herde.wurf) tritt mit dem Wurf-Ort als Anker ins Verzeichnis der Region, wer gezeichnet wird, wählt `_bestandVerkoerpern`
    // nach der Kappe am Schirm (vorher warf die Geburt Körper, so viele, wie die Kappe ließ — die Kappe setzte den Bestand).
    // Liefert die Geborenen (Tiere des Bestands).
    _creatureNaturalBirth(
        bilanz,
        key = this._bestandHier(),
        rng = this._faunaRng("bestand:" + key),
        frisch = true,
        uhr = this.state.spielZeit
    ) {
        if (bilanz && !Object.values(bilanz).some((b) => b.geburt > 0)) return []; // jedes Revier ist voll
        const S = this._bestandSeite();
        const [ix, iz] = key.split(",").map(Number);
        const bester = {};
        let alle = null;
        for (let i = 0; i < 6; i++) {
            const x = (ix + rng()) * S;
            const z = (iz + rng()) * S;
            // DER WURF DES GESETZES FRAGT NUR DIE SAAT (feld.K2#2): ob die Wildnis den Ort trägt (`_wildnisTraegt`) — nie den Grundriss
            // der Seite (Bauten, Wege der Dorf-Pläne: sie kommen je Seite zu anderer Zeit an); den Leib setzt die Zeichnung auf freien
            // Grund (`_bestandLeibOrt`). Bis feld.K2#2 fragte er `_kreaturGrundFrei`: an (−138, −174) lag bei A ein Weg, bei B noch
            // keiner, der Strom des Takts lief auseinander und mit ihm der Bestand der Region.
            if (!this._wildnisTraegt(x, z)) continue;
            const field = this.worldFieldAt(x, z);
            const soul = this._pickFaunaSoulAtPlayer(x, z, rng);
            if (!soul) continue; // der Lebensraum trägt hier keine Gattung (Tiere K4)
            // Resonanz-Score: Soul-Tags · Field, total
            let score = 0;
            const tags = this._creatureSoulTags(soul);
            for (const ax of ["lebendig", "dichte", "glut", "magieleitung"])
                score += (field[ax] || 0) * (tags[ax] || 0);
            const c = { x, z, soul, score };
            const g = AnazhRealm.TETRAPODA_SOUL_MAP[soul];
            if (!bester[g] || score > bester[g].score) bester[g] = c;
            if (!alle || score > alle.score) alle = c;
        }
        const wuerfe = !bilanz
            ? [alle].filter(Boolean)
            : Object.keys(bilanz)
                  .filter((g) => bilanz[g].geburt > 0 && bester[g] && rng() < bilanz[g].geburt)
                  .map((g) => bester[g]);
        // DIE GEBURT AUS MUTTER UND VATER (leben-erbe, das Gesetz des Lebens `__lebenCore`): je Kind eine Mutter, gezogen aus den
        // REIFEN ihrer Art in der Region (`_bestandReif`) nach ihrer Wurf-Rate (`wurfGewicht`: ihr Haushalt m^¾ je Kind q·m — die
        // große Mutter gebiert seltener, Fenchel); der Vater ist das reife Tier derselben Art mit dem kleinsten Abstand zur Mutter
        // (bei Gleichstand zieht der Strom: die Tiere einer Herde teilen den Anker, die Reihe des Verzeichnisses machte sonst EIN
        // Tier zum Vater jedes Kinds), ohne ihn zieht `kind` einen Gründer-Zug für ihn. Das Kind trägt `kind(aM, aV, …)` und
        // seine Umwelt-Streuung `umwelt`, steht am Anker der Mutter in ihrem Verband und beginnt bei alterS 0 — es WÄCHST
        // (masseZurZeit). Ohne reife Mutter tritt eine Gründer-Gruppe am Kandidaten-Ort ein (`gruender`, erwachsen: alterS =
        // reifeS(M∞)). Den Zufall trägt der Strom des Takts (Saat, Region, Zeit). DIE KENNUNG ist eine Adresse:
        // `indId(Region, Welt-Takt, j)`, j die Lauf-Nummer der Geburt in diesem Takt dieser Region (aus dem Verzeichnis gelesen,
        // eine Kennung ist Zustand). Bis leben-erbe zählte ein Zähler der Region die Kennung, und ein Wurf der Größe aus vier
        // Bändern gab erwachsene Tiere ohne Eltern, die lebenslang gleich groß blieben.
        const R = this._bestandRegion(key, false, 0, Infinity, null, uhr);
        const L = AnazhRealm._lebenKern();
        const kopfId = key + ":" + R.t + ":";
        let j = 0;
        for (const t of R.tiere)
            if (String(t.id).startsWith(kopfId)) j = Math.max(j, Number(String(t.id).slice(kopfId.length)) + 1 || 0);
        // je Kind der Strom seiner Adresse (erbe-geburt): die Achsen jenseits der Größe ziehen aus ihm, der Strom des Takts bleibt
        const n = (adr) => this._lebenNormale(rng, adr);
        const geboren = [];
        for (const best of wuerfe) {
            const g = AnazhRealm.TETRAPODA_SOUL_MAP[best.soul];
            const zeile = AnazhRealm._verhaltenGesetz().herde.wurf[g];
            const kopf = zeile ? zeile[0] + Math.floor(rng() * (zeile[1] - zeile[0] + 1)) : 1;
            const reife = this._bestandFreie(R).filter((t) => t.g === g && this._bestandReif(t));
            const wurf = [];
            for (let k = 0; k < kopf; k++) {
                const id = L.indId(key, R.t, j++);
                const adr = this._faunaRng("erbe:" + id, true);
                if (reife.length) {
                    const mu = this._lebenZug(
                        reife,
                        (t) => L.wurfGewicht(this._bestandKg(t)) * this._bestandEignung(t),
                        rng
                    );
                    let nah = [],
                        d2 = Infinity;
                    for (const t of reife) {
                        if (t === mu) continue;
                        const d = (t.x - mu.x) ** 2 + (t.z - mu.z) ** 2;
                        if (d < d2) [nah, d2] = [[t], d];
                        else if (d === d2) nah.push(t);
                    }
                    const va = this._lebenZug(nah, (t) => this._bestandEignung(t), rng);
                    const a = L.kind(mu.a, va ? va.a : null, n(adr), n(adr), n(adr));
                    const e = L.umwelt(n(adr));
                    wurf.push({ id, soul: mu.soul, g, a, e, m: mu.id, alterS: 0, x: mu.x, z: mu.z, v: mu.v });
                    continue;
                }
                const [a, e] = [L.gruender(n(adr)), L.umwelt(n(adr))];
                const t = { id, soul: best.soul, g, a, e, m: null, alterS: 0, x: best.x, z: best.z };
                t.v = wurf.length ? wurf[0].id : id;
                t.alterS = this._bestandErbe(t).reif;
                wurf.push(t);
            }
            R.tiere.push(...wurf);
            geboren.push(...wurf);
            // Journal-Eintrag — Geburt ist Welt-Atem, leise Notiz mit Affinität (im Aufholen fern schweigt sie)
            if (!frisch) continue;
            const name = this._bestandName(wurf[0]);
            const text = kopf > 1 ? `${name} und ${kopf - 1} weitere treten` : `${name} tritt`;
            this.journalAppend("growth", ["journal.tritt-ein", { wer: text, seele: best.soul }], {
                creature: name,
                soul: best.soul,
                gruppe: kopf,
                affinityScore: best.score.toFixed(3),
                cause: "fauna_lifecycle",
            });
        }
        return geboren;
    }

    // DER DURST (Tiere K4, tetrapoda durst): die Zeit seit dem letzten Trinken auf der Kreatur-Uhr (ab der Geburt); nach einer
    // Suche ohne Wasser ruht er suchPauseS.
    _kreaturDurstig(creature) {
        const ud = creature.userData;
        // das Tier eines Geheges dürstet mit raten.durst (tetrapoda GEHEGE_GESETZ: der Pfleger tränkt, es sucht kein Wasser)
        if (ud._bestand && ud._bestand.gehege && !(AnazhRealm._gehegeGesetz().G.raten.durst > 0)) return false;
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
        // der erste Pegel aus der Los-Nummer des Leibs (Welle SAMEN, kein Zufall): die Tiere eines Orts ruhen nicht im Gleichschritt
        if (!Number.isFinite(ud._ruhe)) {
            const id = this._leibNummer(creature);
            ud._ruhe = ((this._verhaltenHash(id, 4099) % 1000) / 1000) * LG.E.schwelle.ruhig;
        }
        ud._ruhe = LG.ruhePegel(ud._ruhe, gez === "ruhen", dt, G);
        // DAS STEHEN NACH DER FLUCHT (H1, ETHOGRAMM_GESETZ.stehenS): die Herde steht und sichert, bevor sie ruht, äst oder zieht
        if (ud._motionZustand === "flucht") ud._stehenBis = now + LG.E.stehenS;
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
            VG.aas.hungerAnteil,
            now < (ud._stehenBis || 0)
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
        if (zeigt && Number.isFinite(zeigt.tempo)) return Math.max(0, zeigt.tempo);
        const def = zeigt && zeigt.aktion && AnazhRealm._verhaltenGesetz().aktionen[zeigt.aktion];
        return def && Number.isFinite(def.tempo) ? Math.max(0, def.tempo) : 1;
    }
    // DER ZUG DER TÄTIGKEIT (H1, S5): wer zieht, im Tempo des Gesetzes (tetrapoda `zugTempo`; vorher der Wolf 1,0 m/s im Schritt)
    _kreaturTaetigkeitZug(creature, direction, hueftL) {
        const { _verhaltenAktion: VA, _gezeigt: gz } = creature.userData;
        const zeigt = gz && AnazhRealm._lebensraumGesetz().E.zeigt[gz];
        const l = direction.length();
        if (zeigt && zeigt.zug && !(VA && this.state.creatureAnimationTime < VA.bis) && l > 1e-6)
            return direction.multiplyScalar(AnazhRealm._steuerGesetz().zugTempo(hueftL) / l);
        return direction.multiplyScalar(this._kreaturTaetigkeitTempo(creature));
    }

    // DIE NAHRUNG EINES ORTS für den Bestand (Ökologie K2): die Äsung = das Leben des Felds (`auraAt`.lebendig — das Substrat
    // das Leben-Overlay, das die Taten schreiben, und der Fraß des Gaus an der Zelle: `auraAt` liest ihn selbst, `_gauFrassAt`,
    // E3 — was die Herde des Gesetzes ließ, steht im Gau, nie im Overlay, und EIN Leser trägt es für jeden), 0..1.
    _kreaturNahrung(x, z, uhr) {
        const a = this.auraAt(x, z, 0, uhr);
        return a && a.lebendig > 0 ? Math.min(1, a.lebendig) : 0;
    }

    // DER BESTAND EINER REGION (Ökologie K2, tetrapoda BESTAND_GESETZ): je Gattung der Bestand n (die Tiere ihres Verzeichnisses,
    // gezeichnet oder nicht), die Kapazität K der Region (je Zelle ihres Felds `feld`, `_bestandFeld`: der Lebensraum der
    // Gattung in der Boden-Klasse × Fläche × die Nahrung nach ihrer Ernährung — die Äsung der Zelle, die Beute = die
    // Pflanzenfresser der Region), den Riss (Ökologie K1: die Kost der wilden Jäger gegen die Dichte ihrer Beute — wild und Beute
    // aus Gattung und Masse jedes Tiers, `_bestandWild`, wie `_kreaturIstBeute` am Leib) und die Bilanz {geburt, tod} je Takt.
    // `zellen` (wenn gegeben) sammelt je Zelle den Ort und je Gattung Lebensraum × Äsung — den Jungwuchs, den ihr Fraß liest
    // (`_kreaturFrass`). Ohne `key` die Region des Spielers.
    // Liefert { gattung: { n, K, frass, riss, beute, geburt, tod } } (beute: je Tier, das einem Jäger Beute ist, seine Jäger).
    _kreaturBestand(zellen, key = this._bestandHier(), feld = this._bestandFeld(key), takt = null) {
        const BG = AnazhRealm._bestandGesetz();
        const B = BG.B;
        const LG = AnazhRealm._lebensraumGesetz();
        const pflanz = AnazhRealm._verhaltenGesetz().temperament.gattung.pflanzDiet;
        const R = this._bestandRegionen().regionen[key];
        const tiere = R ? this._bestandFreie(R) : [];
        const n = {};
        const diet = this._bestandDiet();
        // DIE BILANZ RECHNET NUR DIE ALTLAST (Leben C2b): die Gattungen des Gesetzes (`_gauRolle`) stehen im Gau, sie liest sie als Beute
        for (const g in diet) if (!this._gauRolle(g)) n[g] = 0;
        for (const t of tiere) if (t.g in n) n[t.g]++;
        const { jaeger, gejagt, beuteVon } = this._bestandJagd(tiere, diet);
        const gau = this._gauRevier(key);
        let beuteN = !gau ? 0 : takt == null ? gau.koepfe.beute : this._gauBeuteAm(key, takt); // am Takt: die Spur (`_gauSpurAb`)
        for (const g in n) if (diet[g] <= pflanz) beuteN += n[g];
        const beute = Math.min(1, beuteN / B.beuteVoll);
        // je Zelle Lebensraum × Äsung (der Jungwuchs, den der Fraß liest); K aus der EINEN Formel (`_bestandKapazitaet`)
        if (zellen)
            for (const c of feld.zellen) {
                const je = {};
                for (const g in n) je[g] = LG.lebensraum(g, c.klasse, LG.L) * c.aesung;
                zellen.push({ x: c.x, z: c.z, je });
            }
        const aus = {};
        for (const g in n) {
            const k = this._bestandKapazitaet(g, feld, beute);
            const riss = BG.riss(jaeger[g], gejagt[g] / B.beuteVoll, B);
            aus[g] = Object.assign(
                { n: n[g], K: +k.toFixed(2), frass: BG.frass(diet[g], B), riss, beute: beuteVon },
                BG.bilanz(n[g], k, B)
            );
        }
        return aus;
    }
    // DIE KOST JE GATTUNG (GATTUNGEN diet über die EINE Übergabe der Dials, `_ofenKreaturDials`), fail-closed.
    _bestandDiet() {
        const diet = {};
        for (const g in AnazhRealm._lebensraumGesetz().L.gattung) {
            const d = this._ofenKreaturDials(g);
            if (!d || !d.dials || !Number.isFinite(d.dials.diet))
                return AnazhRealm._kernPflichtBruch("tetrapoda:GATTUNGEN." + g + ".diet");
            diet[g] = d.dials.diet;
        }
        return diet;
    }
    // DER RISS EINER GEMEINSCHAFT (`tiere`: die Freien einer Region, `_bestandFreie`, oder die Tiere EINES Geheges): wer einem
    // wilden Jäger Beute ist (einer anderen Gattung, nicht wild, höchstens beuteMasse × seine Masse), je Gattung gezählt (gejagt),
    // mit seinen Jägern (beuteVon), und die Kost der Jäger je Gattung, die sie jagen (jaeger). Die eigene Art ist keine Beute: seit
    // leben-erbe wächst jedes Junge heran und ist bis jagdKg „scheu“ — der Riss fraß sonst jeden Welpen des eigenen Rudels.
    _bestandJagd(tiere, diet) {
        const beuteMasse = AnazhRealm._verhaltenGesetz().jagd.beuteMasse;
        const jaeger = {};
        const gejagt = {};
        for (const g in diet) jaeger[g] = gejagt[g] = 0;
        const beuteVon = new Map();
        for (const h of tiere) {
            if (!(diet[h.g] > 0) || !this._bestandWild(h)) continue;
            const jagt = new Set();
            for (const o of tiere) {
                if (o.g === h.g || this._bestandWild(o) || this._bestandKg(o) > beuteMasse * this._bestandKg(h))
                    continue;
                jagt.add(o.g);
                const j = beuteVon.get(o);
                if (j) j.push(h);
                else beuteVon.set(o, [h]);
            }
            for (const g of jagt) jaeger[g] += diet[h.g];
        }
        for (const o of beuteVon.keys()) gejagt[o.g]++;
        return { jaeger, gejagt, beuteVon };
    }

    // DER FRASS (Ökologie K1, tetrapoda bestandFrass): je Takt nimmt jede äsende Gattung n × frass vom Jungwuchs der Zellen, die
    // ihr Bestand liest (`zellen` aus `_kreaturBestand`), je Zelle nach ihrem Anteil Lebensraum × Äsung — die Herde äst, wo der
    // Jungwuchs steht, und die Kapazität liest, was sie ließ (negativ ins Feld). Vorher fraß jedes Tier an seinem Ort, den das
    // Raster nie las (Zeitraffer am main 45c6aa19: ohne die Wölfe Jungwuchs −0,1 %).
    _kreaturFrass(bestand, zellen, uhr) {
        for (const g in bestand) {
            const F = bestand[g].n * bestand[g].frass;
            const summe = F > 0 ? zellen.reduce((s, c) => s + c.je[g], 0) : 0;
            if (summe > 0)
                for (const c of zellen) if (c.je[g] > 0) this._depositLife(c.x, c.z, (-F * c.je[g]) / summe, uhr);
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

    // ═══ DER BESTAND JE REGION (oekologie.K2#2: überall; fern als Zahl, nah als Körper) ═══
    // DIE REGION ist das Revier des Gesetzes als Kachel der Welt (BESTAND_REGION: Seite revierM·√π, die Fläche des Reviers). Ihr
    // BESTAND ist EINE Größe — das Verzeichnis ihrer Tiere (`state.faunaBestand`, je Tier Seele, Gattung, Größe, Alter, Anker,
    // Verband): ihn liest und schreibt das Gesetz, nah wie fern, jede Region mit ihrem eigenen Fauna-Strom (`bestand:<Region>`,
    // ein Wurf in einer re-rollt nie eine andere). Ein Körper ist die Zeichnung eines Tiers (`_bestandVerkoerpern`): die
    // Kosten-Kappe `maxCreatures` wählt, WER gezeichnet wird, nie wer lebt. Vorher war der Bestand die Liste der Körper
    // (state.creatures, um den Spieler): geboren wurde nur, was die Kappe ließ, und fern gab es keinen Bestand.
    _bestandRegionen() {
        const seed = AnazhRealm._saatJe(this);
        const F = this.state.faunaBestand;
        return F && F.seed === seed ? F : (this.state.faunaBestand = { seed, regionen: {} });
    }
    _bestandSeite() {
        return AnazhRealm._bestandGesetz().B.revierM * AnazhRealm.BESTAND_REGION.seiteJeRevier;
    }
    _bestandKey(x, z) {
        const S = this._bestandSeite();
        return Math.floor(x / S) + "," + Math.floor(z / S);
    }
    _bestandHier() {
        const pm = this.state.playerMesh;
        return pm ? this._bestandKey(pm.position.x, pm.position.z) : "0,0";
    }
    _bestandName(t) {
        if (t.name) return t.name;
        this._lebenGen = (this._lebenGen || 0) + 1; // der Name reist im Stand (`_lebenImStand`): eine Schrift wie jede
        return (t.name = this._pickCreatureName("b" + t.id));
    }

    // DIE NAHEN REGIONEN: die Kacheln, die der Kreis der halben Seite um den Spieler schneidet (eine bis vier) — sie leben im Takt
    // des Spielers und tragen Körper; jede andere ist eine Zahl, die das Gesetz beim Lesen nachholt (`_bestandRegion`).
    _bestandNah() {
        const pm = this.state.playerMesh;
        if (!pm) return [];
        const S = this._bestandSeite();
        const r = S / 2;
        const { x, z } = pm.position;
        const nah = [];
        for (let ix = Math.floor((x - r) / S); ix <= Math.floor((x + r) / S); ix++)
            for (let iz = Math.floor((z - r) / S); iz <= Math.floor((z + r) / S); iz++) {
                const dx = Math.max(ix * S - x, 0, x - (ix + 1) * S);
                const dz = Math.max(iz * S - z, 0, z - (iz + 1) * S);
                if (dx * dx + dz * dz < r * r) nah.push(ix + "," + iz);
            }
        return nah;
    }
    // WAS VOM BESTAND IM STAND REIST (w28-bestand-kennung, `_lebenImStand`): die nahen Regionen UND die Region jedes Tiers, das
    // ein Leib zeichnet. Ein Leib bleibt gezeichnet, solange er im Blick steht, gebunden ist oder einen Auftrag trägt
    // (`_bestandHaelt`) — auch wenn der Spieler die Region seines Tiers verließ; der Stand trägt den Leib mit der Kennung seines
    // Tiers (`_serializeCreature`), also trägt er das Tier. Höchstens `maxCreatures` Leiber: der Stand wächst nie mit dem Weg
    // (speicher.K3). Bis dahin reiste nur das Nahe: der Leib kehrte ohne Tier wieder (`_bestandLeibWieder` → `_ohneTier`) und ging,
    // sobald er außer Blick stand — der Begleiter nach 300 m Weg und einem Laden; die Mess-Sitzung fand `creatures` abweichend
    // vom Grund (Radeon df6c4721: fünf Leiber der Region -1,1, der Spieler in 0,0 — 116 von 124 Proben ungemessen).
    _bestandReist() {
        const keys = new Set(this._bestandNah());
        for (const c of this.state.creatures || []) {
            const t = c.userData && c.userData._bestand;
            if (t) keys.add(this._bestandKey(t.x, t.z));
        }
        return [...keys];
    }

    // DIE REGION `key` — FERN ALS ZAHL: eine Region, die das Gesetz nie las, beginnt aufholS vor dem Lesen leer (die Welt ist
    // eine Funktion: ihr Bestand ist die Stunde des Gesetzes ab leer); eine, die zurückliegt, holt ihre versäumten Takte nach,
    // höchstens die der letzten aufholS, `max` je Aufruf, bis `bis` Takte bleiben — jeder DERSELBE Takt wie nah, zu seiner
    // eigenen Zeit (die Spiel-Uhr steht für ihn auf seiner Stunde: Fraß, Gabe und Verblassen des Felds laufen wie damals), nur
    // das Journal schweigt. Vorher holte fern ein Takt ohne Fraß nach, am Substrat: fern trug das Rotwild das ganze Feld, nah
    // das abgeäste, und eine ferne Region stand unter der halben Nahrung still (27.10.: −4 %). Die Fälle gezeichneter Tiere
    // sammelt `tode` (ohne: sie fallen am Ende). Liefert die Region. JEDER TAKT STEHT AUF DEM RASTER DER WELT-UHR (feld.K2#2):
    // der Beginn ist ein Vielfaches von taktS — zwei Seiten und ein Reload zählen dieselben Takte zu denselben Zeiten.
    // DIE STUNDE LIEGT VOR DER WELT (w27-tiere-sicht): in einer jungen Welt (jünger als aufholS) beginnt JEDE Region aufholS vor der
    // Welt-Uhr 0 — für jede Seite derselbe Zeitpunkt, gleich, wann sie liest. Bis dahin begann sie frühestens bei 0: eine Welt unter
    // einer Stunde trug nur, was seit ihrer Geburt warf (Mess-Wiese 20 Spiel-s nach der Ankunft: 0–15 Tiere in den nahen Regionen,
    // nach 300 Spiel-s 28–46 — der Geher der ersten zehn Minuten ging durch leeres Land); ein Beginn aufholS vor dem LESEN hätte
    // den Gleichlauf gebrochen (gate:mp-sync (f): Leben 207 von 268 Zellen gleich, der Mitspieler liest später).
    _bestandRegion(key, aufholen = true, bis = 0, max = Infinity, tode = null, uhr = this.state.spielZeit) {
        const F = this._bestandRegionen();
        const B = AnazhRealm._bestandGesetz().B;
        const jetzt = uhr || 0;
        const AH = AnazhRealm.BESTAND_REGION.aufholS;
        const fern = jetzt < AH ? -AH : Math.floor((jetzt - AH) / B.taktS) * B.taktS;
        const R = F.regionen[key] || (F.regionen[key] = { t: fern, tiere: [] });
        this._gehegeEinsetzen(key, R);
        // KEIN ZWILLING (Leben C2b): ein freies Tier der Gattungen des Gesetzes steht nie im Verzeichnis der Region — eines aus
        // einem Stand von vor dem Gau verlässt es hier, sein Leib wird in den Gau angenommen (`_bestandAdoptieren`).
        if (R.tiere.some((t) => !t.gehege && this._gauRolle(t.g))) {
            for (const t of R.tiere)
                if (!t.gehege && this._gauRolle(t.g) && t.leib) [t.leib.userData._bestand, t.leib] = [null, null];
            R.tiere = R.tiere.filter((t) => t.gehege || !this._gauRolle(t.g));
        }
        if (R.t < fern) R.t = fern;
        if (!aufholen) return R;
        const fall = tode || [];
        for (let k = 0; k < max && jetzt - R.t >= (bis + 1) * B.taktS && this._bestandGauSteht(key, R); k++)
            this._bestandSchritt(key, R, true, fall);
        if (!tode) this._bestandTode(fall);
        return R;
    }

    // DIE REGION RECHNET ERST ÜBER STEHENDER WAHRHEIT (feld.K2#2, w28-mp-boden): ihr Takt liest die Boden-Klasse jeder Zelle
    // (`_bestandFeld`), die Klasse den Rand des nächsten Flusses (`_hydroDistAt`), und der steht in der Hydro-Region des Orts
    // (gelaende-core `hydroRegion`) — fehlt deren Kachel noch (sie entsteht im Faden, `_hydroBestellen`), antwortet der Kern aus
    // der Heimat: „kein Fluss“. Eine Seite, die vor der Ankunft der Kachel rechnete, trug eine andere Klasse (und merkte sie) als
    // die danach und als jeder Reload. Darum: die Heimat steht und jede Kachel über der Region ist da — sonst ist sie bestellt
    // (`_ensureHydroTilesAround`), und die Folge des Felds wartet auf sie (`_feldTakt`), wie der Chunk-Bau (`_hydroSteht`).
    _bestandBereit(key) {
        const h = this.state.hydrosphere;
        if (!h || !h.ready) return false;
        const S = this._bestandSeite();
        const [ix, iz] = key.split(",").map(Number);
        return this._ensureHydroTilesAround((ix + 0.5) * S, (iz + 0.5) * S, S / 2 + 1) === 0;
    }
    // … UND ÜBER DER SPUR SEINES GAUS (Leben C2b): der nächste Takt der Altlast liest die Köpfe der Beute an seinem Takt (`_gauBeuteAm`)
    // — ohne die Zeile des Fadens wartet die Folge geordnet, wie auf die Hydro-Wahrheit.
    _bestandGauSteht(key, R) {
        const k = Math.max(0, R.t / AnazhRealm._bestandGesetz().B.taktS + 1);
        return this._bestandBereit(key) && !!this._gauRevier(key) && this._gauBeuteAm(key, k) !== undefined;
    }

    // DAS FELD DER REGION: ihre zellen × zellen Zellen (je Zelle ihre Mitte), die Boden-Klasse (eine Funktion der Welt — EINMAL
    // je Zelle gefragt, die Kosten hängen an der Bewegung, nie am Takt) und die Äsung (`_kreaturNahrung`). GEMERKT wird die
    // Klasse nur über stehender Wahrheit (`_bestandBereit`): ein Leser davor bekommt die Antwort des Augenblicks, nie ins Merkbuch.
    _bestandFeld(key, uhr) {
        const BR = AnazhRealm.BESTAND_REGION;
        const S = this._bestandSeite();
        const [ix, iz] = key.split(",").map(Number);
        const seed = this._bestandRegionen().seed;
        let kl = this._bestandKlassen;
        if (!kl || kl.seed !== seed || kl.map.size > 4096) kl = this._bestandKlassen = { seed, map: new Map() };
        const merken = this._bestandBereit(key);
        const zellen = [];
        for (let i = 0; i < BR.zellen; i++)
            for (let j = 0; j < BR.zellen; j++) {
                const x = (ix + (i + 0.5) / BR.zellen) * S;
                const z = (iz + (j + 0.5) / BR.zellen) * S;
                const k = key + ":" + i + "," + j;
                let klasse = kl.map.get(k);
                if (klasse === undefined) {
                    klasse = this._bodenKlasseAt(x, z);
                    if (merken) kl.map.set(k, klasse);
                }
                zellen.push({ x, z, klasse, aesung: this._kreaturNahrung(x, z, uhr) });
            }
        return { ha: (S / BR.zellen) ** 2 / 1e4, zellen };
    }
    // DIE MASSE DES GUSSES einer Gattung (kg): das Volumen ihrer Gestalt bei Größe 1 (`_gattungLeib`) × ρ — M̄ der Art in Welle 1:
    // das mittlere erwachsene Tier IST der Guss (bs = 1).
    _gattungKg(g) {
        return this._gattungLeib(g).v * this._leibRho(false);
    }
    // DAS LEBEN EINES TIERS (Memo je Datensatz, nie im Datensatz: kein Feld reist in Stand oder Akt): M∞ hängt nur an Gattung,
    // Erbe und Umwelt-Streuung; Masse und Temperament am Alter — gerechnet einmal je Alter (der Takt rückt es), nie als gespeicherter Wert.
    _bestandLeben(t) {
        const e = this._bestandErbe(t);
        if (e.alter !== t.alterS) {
            // ein Kopf des Gaus trägt den Leib am Takt aus dem Zustand des Fadens (`kg`, Leben C2b), nie eine zweite Rechnung
            const kg = t.kg > 0 ? t.kg : AnazhRealm._lebenKern().masseZurZeit(e.M, t.alterS);
            [e.alter, e.kg, e.wild] = [t.alterS, kg, null];
        }
        return e;
    }
    _bestandWild(t) {
        const e = this._bestandLeben(t);
        if (e.wild === null) {
            const T = AnazhRealm._verhaltenGesetz().temperament.gattung;
            const d = this._ofenKreaturDials(t.g).dials;
            e.wild = AnazhRealm._steuerGesetz().temperamentDerGattung(d, e.kg, T) === "wild";
        }
        return e.wild;
    }
    // DIE GESTALT EINER GATTUNG bei Größe 1 (`_tierBaum`): ihr Volumen (m³, `leibV` — die Masse liest es) und ihre Hüft-Höhe
    // (m, `beinL` — der Leib, `_kreaturLeib`, und mit ihm die Frage der Geburt an den Blick); einmal je Gattung aus dem Ofen
    // gegossen und gemessen, der Guss danach frei — fail-closed ohne Gestalt.
    _gattungLeib(g) {
        const M = this._gattungLeibMemo || (this._gattungLeibMemo = {});
        if (M[g]) return M[g];
        const soul = AnazhRealm.CREATURE_SOUL_NAMES.find((n) => AnazhRealm.TETRAPODA_SOUL_MAP[n] === g);
        const leib = soul && this._buildCreatureGroup(soul);
        const tb = leib && leib.userData._tierBaum;
        const o = { v: tb ? tb.leibV : 0, beinL: tb ? tb.beinL : 0 };
        if (leib) this._disposeSoulGroup(leib);
        return o.v > 0 && o.beinL > 0
            ? (M[g] = o)
            : AnazhRealm._kernPflichtBruch("leib:Gestalt der Gattung " + g + " ohne Volumen oder Hüfte");
    }
    // EIN TAKT DES GESETZES in der Region R (tetrapoda BESTAND_GESETZ): je Tier das Alter um taktS; die Bilanz am Feld der Region
    // (`_kreaturBestand`), die Herde äst ihren Jungwuchs (`_kreaturFrass`); je Gattung über ihrer Kapazität mit ihrer Chance der
    // Hungertod dessen, dem die Reserve zuerst ausgeht (`_bestandHungerOpfer`), der Riss der Jäger nach dem Ertrag ihrer Beute
    // (`_bestandRissOpfer`, Ökologie K1); darunter die Geburt aus Mutter und Vater (`_creatureNaturalBirth`); jedes Tier jenseits
    // SEINER Lebensdauer (lebensdauerS(M∞)) stirbt am Alter. Bis leben-erbe nahmen sie das Älteste. Entschieden wird am
    // Verzeichnis, nie an Körpern: der Tod eines gezeichneten Tiers wird zum Fall seines Leibs (`tode`) — dieselbe Zahl, ob
    // gezeichnet oder nicht. DER TAKT IST EINE FUNKTION DER WELT-UHR UND DER AKTE (feld.K2#2, Lockstep): er steht auf SEINER Zeit
    // (R.t, ein Vielfaches von taktS — was er ins Feld schreibt und aus ihm liest, trägt diesen Stempel: er reicht ihn als `uhr`
    // an jeden Leser und Schreiber des Felds; bis zeit-ein-kalender bog er die Welt-Uhr), sein Wurf ist der Strom DIESES Takts
    // (Saat, Region, Zeit), und kein Gemüt einer Seite rückt seine Chancen. Bis feld.K2#2 stand der frische Takt auf der Bild-Uhr
    // der Seite, der Strom zählte die Würfe der Sitzung, und die Trauer und der Frieden des eigenen Spielers hoben den Hungertod.
    _bestandSchritt(key, R, still, tode) {
        const B = AnazhRealm._bestandGesetz().B;
        R.t += B.taktS;
        this._lebenGen = (this._lebenGen || 0) + 1; // die Marke des Lebens im Stand (`_lebenImStand`)
        this._bestandTakt(key, R, still, tode);
    }
    _bestandTakt(key, R, still, tode) {
        const B = AnazhRealm._bestandGesetz().B;
        const uhr = R.t; // die Zeit des Takts
        // die Freien liest das wilde Gesetz (`_bestandFreie`, frisch an jeder Stelle: ein Tod und eine Geburt dieses Takts zählen);
        // die Tiere eines Geheges gehen ihren eigenen Takt (`_gehegeSchritt`) — eine Region ohne Gehege liest dieselbe Liste
        for (const t of this._bestandFreie(R)) t.alterS += B.taktS;
        const rng = this._faunaRng("bestand:" + key + "@" + R.t, true);
        const zellen = [];
        const bestand = this._kreaturBestand(zellen, key, this._bestandFeld(key, uhr), Math.max(0, uhr / B.taktS));
        this._kreaturFrass(bestand, zellen, uhr);
        for (const g in bestand) {
            const { tod: p, riss, beute } = bestand[g];
            if (p > 0 && rng() < p) {
                const hunger = this._bestandHungerOpfer(this._bestandFreie(R), g, rng);
                if (hunger) this._bestandStirbt(R, hunger, "hunger", tode);
            }
            const opfer = riss > 0 && rng() < riss && this._bestandRissOpfer(this._bestandFreie(R), g, beute, rng);
            if (opfer) this._bestandStirbt(R, opfer, "jagd", tode, beute.get(opfer));
        }
        this._creatureNaturalBirth(bestand, key, rng, !still, uhr);
        const frei = this._bestandFreie(R);
        for (const t of frei.slice()) if (t.alterS > this._bestandErbe(t).tod) this._bestandStirbt(R, t, "alter", tode);
        if (frei !== R.tiere) this._gehegeSchritt(R, tode);
    }
    // DIE FREIEN DER REGION R: ihr Verzeichnis ohne die Tiere eines Geheges (der Term `gehege`); ohne Gehege dieselbe Liste.
    _bestandFreie(R) {
        return R.tiere.some((t) => t.gehege) ? R.tiere.filter((t) => !t.gehege) : R.tiere;
    }

    // EIN TIER DES BESTANDS STIRBT: es verlässt das Verzeichnis jetzt; der Tod am Hunger und am Alter nährt das Feld an seinem
    // Anker (dieselbe Gabe, ob gezeichnet oder nicht), der Riss eines Ungezeichneten prägt seine Furcht dort ein. Ist es
    // gezeichnet, fällt sein Leib nach dem Gesetz aller Regionen (`tode`, `_bestandTode`). JEDER Tod — Riss, Hunger, Alter, im
    // Gehege wie frei — legt seinen Leichnam in den Boden seines Ankers (`_aasTat`, oeko.zerfall#1).
    _bestandStirbt(R, t, ursache, tode, jaeger) {
        R.tiere.splice(R.tiere.indexOf(t), 1);
        this._aasTat(t, R.t);
        if (ursache !== "jagd") {
            const leb = Math.min(1, Math.max(0, this._creatureSoulTags(t.soul).lebendig || 0));
            this._depositLife(t.x, t.z, AnazhRealm.LIFE_FIELD.pulseCenter * (0.8 + leb), R.t);
        }
        if (t.leib) tode.push({ R, t, ursache, jaeger });
        else if (ursache === "jagd") this._depositEmotion(t.x, t.z, AnazhRealm._furchtGesetz().F.riss, R.t);
    }
    // DER TOD DÜNGT (oeko.zerfall#1, stoffe.K5#2): der Leichnam eines Tiers liegt in der 16-m-Zelle seines Ankers ab der
    // Welt-Stunde seines Takts (`uhr`) und nährt sie nach DEMSELBEN Gesetz wie der Leichnam eines Risses (`_naehrstoffAt`:
    // `TAT_NARBE.aas.naehr`, linear über seine Dauer, die Dauer aus `_tatDauer` — der Wuchs des Orts, gemessen EINMAL im Augenblick
    // des Tods). Das Feld der Leichname (`state.aasFeld`: Zelle → die Liste ihrer liegenden Leichname [Kennung, Stunde, Wuchs]) ist
    // Leben der Welt, keine Tat des Spielers: es schreibt nie in `worldMeta.taten`, weckt die Ruhe nicht und reist im Stand des
    // Lebens (`_lebenImStand`). Bis oeko-kreislauf 4 eine Tat „aas“ je Tod: 1 km Gang ohne Edit +11,4 kB worldMeta.taten,
    // gate:stand-takt RUHE-SIM 96 Einheiten Wuchs nach den Toden der Ruhe. DAS FELD HEILT HIER: ist die früheste Dauer eines
    // Leichnams um (`_aasFrist`), fallen die vergangenen aus ihrer Zelle und die leere Zelle aus dem Feld — es trägt nur, was liegt.
    // Derselbe Tod ein zweites Mal (eine Spur, die zweimal kommt, ein Reload) düngt nicht; ein Tod, dessen Leichnam schon
    // vergangen wäre, düngt nicht.
    _aasTat(t, uhr) {
        const N = AnazhRealm.TAT_NARBE;
        const [h, jetzt] = [Math.round(this._weltStunde(uhr) * 1e4) / 1e4, this._weltStunde()];
        const F = this.state.aasFeld || (this.state.aasFeld = new Map());
        const ende = (c) => c[1] + this._tatDauer({ tat: "aas", w: c[2] });
        if (!(this._aasFrist > jetzt)) {
            let frist = Infinity;
            for (const [k, L] of F) {
                const liegt = L.filter((c) => ende(c) > jetzt);
                if (!liegt.length) F.delete(k);
                else if (liegt.length < L.length) F.set(k, liegt);
                for (const c of liegt) frist = Math.min(frist, ende(c));
            }
            this._aasFrist = frist;
        }
        if (h + N.aas.stunden / N.lebMin <= jetzt) return null; // auch im kargsten Wuchs vergangen: ohne den Ort zu fragen
        const k = this._lifeCellKey(t.x, t.z);
        const L = F.get(k);
        if (L && L.some((c) => c[0] === t.id)) return null;
        const a = { tat: "aas", x: t.x, z: t.z };
        const c = [t.id, h, (this._tatDauer(a), a.w)];
        if (ende(c) <= jetzt) return null;
        F.set(k, (L || []).concat([c]));
        this._aasFrist = Math.min(this._aasFrist, ende(c));
        this._lebenGen = (this._lebenGen || 0) + 1; // die Marke des Lebens im Stand (`_lebenImStand`)
        return c;
    }
    // Der Nährstoff der Leichname an (x,z) zur Welt-Stunde `h` (der Leser `_naehrstoffAt`): je liegender Leichnam sein `naehr`
    // mal sein Rest — derselbe Ausdruck wie für die Taten der Zelle.
    _aasNaehrAt(x, z, h = this._weltStunde()) {
        const F = this.state.aasFeld;
        const L = F && F.size ? F.get(this._lifeCellKey(x, z)) : null;
        if (!L) return 0;
        const naehr = AnazhRealm.TAT_NARBE.aas.naehr;
        let n = 0;
        for (const c of L)
            n += naehr * Math.min(1, Math.max(0, 1 - (h - c[1]) / this._tatDauer({ tat: "aas", w: c[2] })));
        return n;
    }

    // DER FALL DER GEZEICHNETEN, nach dem Gesetz aller Regionen eines Takts (kein Gefühl eines Falls färbt eine Wahl desselben
    // Takts): Hunger und Alter fällen den Leib (`_creatureNaturalDeath`, ohne zweite Gabe ans Feld); den Riss reißt der nächste
    // gezeichnete Jäger (`_kreaturRiss`: nah als Körper, fern fällt er). Steht das Opfer im Nah-Kreis ohne gezeichneten Jäger,
    // bleibt sein Leib ohne Tier, bis er außer Blick geht (der Bestand entscheidet, nie die Zeichnung).
    _bestandTode(tode) {
        for (const { t, ursache, jaeger } of tode) {
            const c = t.leib;
            if (!c || !this.state.creatures.includes(c)) continue;
            [c.userData._bestand, t.leib, c.userData.alterS] = [null, null, t.alterS];
            if (ursache !== "jagd") {
                // ein Jäger am offenen Riss fällt erst, wenn sein Maul riss (sein Tier starb jetzt im Gesetz, die Zahl steht)
                if (this.state.creatures.some((o) => o.userData._rissVon === c)) c.userData._faelltNach = ursache;
                else this._creatureNaturalDeath(c, ursache, false);
                continue;
            }
            let j = null;
            for (const h of jaeger)
                if (
                    h.leib &&
                    (!j || h.leib.position.distanceToSquared(c.position) < j.position.distanceToSquared(c.position))
                )
                    j = h.leib;
            // DAS GESETZ ENTSCHEIDET, DER LEIB FOLGT (feld.K2#2): steht das Opfer im Nah-Kreis ohne gezeichneten Jäger, bleibt sein Leib
            // als Zeichnung ohne Tier (`_ohneTier`), bis er außer Blick geht (`_bestandVerkoerpern`) — kein Riss ohne Jäger vor dem
            // Auge. Bis feld.K2#2 starb an seiner Stelle das älteste Ungezeichnete seiner Gattung: welches Tier fiel, hing an der
            // Zeichnung der Seite, und die Bestände zweier Mitspieler liefen auseinander.
            if (j) this._kreaturRiss(c, j);
            else if (this._kreaturNah(c)) c.userData._ohneTier = true;
            else this._creatureCombatDeath(c, "jagd");
        }
    }

    // DIE ANNAHME: ein Leib, den kein Tier des Bestands zeichnet (der Boot-Wurf, der Nexus, ein Ruf, der Hof, ein
    // wiedergekehrter Stand), tritt in den Bestand der Region seines Ankers — eine Geburt außerhalb des Gesetzes ist eine Geburt.
    // Ein gerissener Leib (`_rissVon`: sein Tier starb im Gesetz) und eine Seele ohne Gattung bleiben draußen. DIE ANNAHME IST EIN
    // AKT DER SEITE (feld.K2#2, `_feldAkt`): der Leib ist ihre Zeichnung, sein Tier tritt auf jeder Seite zur selben Welt-Zeit in
    // denselben Bestand (bis dahin hält der Leib es offen, `zu`); seine Kennung zählt die Seite, nie die Region (die Kennungen der
    // Geburt im Gesetz, `indId`, bleiben auf jeder Seite dieselben) — aus dem Bestand gelesen (`_annahmeKennung`). Bis feld.K2#2
    // nahm jede Seite ihre eigenen Leiber an.
    _bestandAdoptieren() {
        const L = AnazhRealm._lebensraumGesetz().L.gattung;
        for (const c of this.state.creatures) {
            const ud = c.userData;
            const g = AnazhRealm.TETRAPODA_SOUL_MAP[ud.soul];
            if (ud._bestand || ud._rissVon || ud._faelltNach || ud._ohneTier || ud._gauWartet || !(g in L)) continue;
            const a = ud.wanderAnchor || c.position;
            // DIE GATTUNGEN DES GESETZES TRETEN IN DEN GAU (Leben C2b, E2): der Akt „ein“ mit Takt-Stempel (`_gauAnnahme`) — nie
            // in das Verzeichnis der Region (dort führe der Zwilling)
            const rolle = this._gauRolle(g);
            if (rolle) {
                this._gauAnnahme(c, g, rolle, a);
                continue;
            }
            const key = this._bestandKey(a.x, a.z);
            const v = ud.verband != null ? "n" + ud.verband : null;
            const id = this._annahmeKennung(key);
            // DAS ERBE DES ANGENOMMENEN (leben-erbe): sein gemessener Leib (`_bestandErbeAusLeib`: Erbe, Umwelt-Streuung und
            // Alter aus seiner Größe), keine Mutter, kein Wurf — seine Größe liest danach sein Tier (`_bestandBs`), ohne Sprung.
            const tier = { soul: ud.soul, g, a: null, e: null, m: null, alterS: 0, x: a.x, z: a.z, v, name: ud.name };
            this._bestandErbeAusLeib(Object.assign(tier, { id }), ud.bodySize, ud.alterS);
            delete tier.id;
            const t = Object.assign({ id }, tier, { leib: c, zu: true });
            ud._bestand = t;
            (this._annahmeOffen || (this._annahmeOffen = new Map())).set(id, t);
            this._feldAkt({ art: "annahme", w: this.state.spielZeit, key, id, tier }, true);
        }
    }
    // DIE KENNUNG DER ANNAHME KOMMT AUS DEM BESTAND (w28-bestand-kennung; Factorio FFF-340: eine Kennung ist Zustand, nie der
    // Zähler eines Prozesses): die nächste Zahl der Seite in der Region `key`, über ihren Tieren und den Akten der Annahme, die noch
    // reisen. Bis dahin zählte die Sitzung: jede neue Seite begann bei 1, die Annahme nach einem Laden trug die Kennung
    // eines Tiers, das der Stand schon trug — ihr Akt fiel am Bestand (`_feldAktWirkt`: die Kennung steht schon), der Leib hielt
    // ein Tier, das kein Gesetz kennt (`zu` für immer), und sein Fall (`_bestandAus`) nahm das fremde Tier aus dem Bestand.
    _annahmeKennung(key) {
        const p2p = this.state.p2p;
        const kopf = key + "." + ((p2p && p2p.peerId) || "ich") + ".";
        const R = this._bestandRegionen().regionen[key];
        let n = 0;
        const zahl = (id) => {
            const z = typeof id === "string" && id.startsWith(kopf) ? id.slice(kopf.length) : "";
            if (/^\d+$/.test(z)) n = Math.max(n, Number(z));
        };
        for (const t of R ? R.tiere : []) zahl(t.id);
        for (const a of this.state.feldAkte || []) if (a.art === "annahme") zahl(a.id);
        return kopf + (n + 1);
    }

    // DER LEIB FINDET SEIN TIER WIEDER (feld.K2#2): ein Leib des Stands zeichnete das Tier `id` — steht es im Bestand (oder tritt es
    // mit einem offenen Akt der Annahme hinein), zeichnet er es wieder; fiel es im Gesetz, ist er ein Leib ohne Tier
    // (`_ohneTier`, er geht außer Blick). Nie eine neue Annahme: das Tier trüge zweimal im Bestand, beim Mitspieler doppelt.
    // Gesucht wird die KENNUNG in jeder Region des Stands (≤ 4 nahe): bis w27-tiere-sicht las der Leib die Kachel aus dem Kopf der
    // Kennung — nach dem Umzug eines Stands in ein anderes Raster (`_lebenAusStand`) steht das Tier in der Kachel seines Ankers.
    _bestandLeibWieder(c, id, ort) {
        let t = null;
        for (const R of Object.values(this._bestandRegionen().regionen))
            if ((t = R.tiere.find((x) => x.id === id))) break;
        const a = !t && (this.state.feldAkte || []).find((x) => x.art === "annahme" && x.id === id);
        const tier = t || (a && Object.assign({ id }, a.tier, { zu: true }));
        // ein Leib der Gattungen des Gesetzes (Leben C2b) sucht sein Tier im Bild seines Gaus (`_gauAntwort`) — am Ort, den sein
        // Stand nennt (`ort`: der Anker des Kopfs; ein Begleiter steht beim Spieler, sein Kopf zwei Kacheln fern); trägt er die
        // Kennung eines Stands von vor dem Gau (ohne dessen Kopf), ist er ein Leib ohne Tier und wird angenommen
        if (!tier && this._gauRolle(AnazhRealm.TETRAPODA_SOUL_MAP[c.userData.soul])) {
            if (typeof id === "string" && id[0] === "g" && id.indexOf("/") > 1) c.userData._gauWartet = id;
            if (Array.isArray(ort) && ort.length === 2 && ort.every(Number.isFinite)) c.userData._gauWartetOrt = { x: ort[0], z: ort[1] }; // prettier-ignore
            return;
        }
        if (!tier || tier.leib) return void (c.userData._ohneTier = true);
        [tier.leib, c.userData._bestand] = [c, tier];
        if (a) (this._annahmeOffen || (this._annahmeOffen = new Map())).set(id, tier);
    }

    // EIN LEIB FÄLLT AUSSERHALB DES GESETZES (der Kampf, die Jagd am Leib, ein Akt): sein Tier verlässt den Bestand mit ihm — ein
    // Akt der Seite, deren Leib fiel (feld.K2#2, `_feldAkt`): auf jeder Seite zur selben Welt-Zeit.
    _bestandAus(c) {
        const t = c.userData && c.userData._bestand;
        if (!t) return;
        [c.userData._bestand, t.leib] = [null, null];
        if (t.gau) return void this._gauAus(t); // ein Kopf des Gaus: der Akt „aus“ mit Takt-Stempel (Leben C2b, E2)
        this._feldAkt({ art: "aus", w: this.state.spielZeit, key: this._bestandKey(t.x, t.z), id: t.id }, true);
    }

    // DIE ZEICHNUNG (die Kappe am Schirm): aus den nahen Regionen werden die Tiere gezeichnet, deren Gruppe dem Spieler am
    // nächsten ankert, bis die Kosten-Kappe `maxCreatures` voll ist; ein Leib bleibt, solange er im Blick oder im Nah-Kreis
    // steht, gebunden ist, einen Auftrag trägt oder ein Riss ihn nennt. Wer nicht mehr gezeichnet wird, geht als Zahl in sein
    // Tier zurück (`_bestandEntkoerpern`: sein Stand reist im Tier — Gedächtnis, Wunde, Name); gezeichnet wird je Takt eine
    // Gruppe, fern und außer Blick (`_bestandLeiber`). Die Kappe ändert nur, WER gezeichnet wird — nie den Bestand.
    _bestandVerkoerpern() {
        const st = this.state;
        if (!st.playerMesh || !this._kreaturenBereit()) return;
        const F = this._bestandRegionen();
        const a0 = this._lodAuge(); // das EINE Auge der Stufen: wer gezeichnet wird, misst vom Bild, nie vom Spieler
        const p = a0 ? { x: a0.x, y: a0.y, z: a0.z } : st.playerMesh.position;
        const gruppen = new Map();
        for (const key of this._bestandNah()) {
            for (const t of F.regionen[key] ? F.regionen[key].tiere : []) {
                if (t.gehege) continue; // das Gehege zeichnet nach seinem Term (`_gehegeGruppen`)
                const gk = key + "|" + (t.v != null ? t.v : "e" + t.id);
                let G = gruppen.get(gk);
                if (!G) gruppen.set(gk, (G = { d: Math.hypot(t.x - p.x, t.z - p.z), tiere: [] }));
                G.tiere.push(t);
            }
            // DIE GATTUNGEN DES GESETZES LIEST DIE ZEICHNUNG AUS DEM BILD DES GAUS (Leben C2b, `_gauRevier`): je Verband des
            // Fadens (die Herde des Reviers, das Rudel) eine Gruppe — Köpfe, Alter, Geschlecht und Mutter aus seinem Zustand
            const gau = this._gauRevier(key);
            for (const t of gau ? gau.tiere : []) {
                let G = gruppen.get(t.v);
                if (!G) gruppen.set(t.v, (G = { d: Math.hypot(t.x - p.x, t.z - p.z), tiere: [] }));
                G.tiere.push(t);
            }
        }
        this._gehegeGruppen(gruppen, p);
        // eine Gruppe, die gezeichnet steht, hält ihren Platz um eine halbe Kachel (kein Flattern, wenn eine nähere geboren wird)
        const S = this._bestandSeite();
        for (const G of gruppen.values()) if (G.tiere.some((t) => t.leib)) G.d -= S / 2;
        const reihe = [...gruppen.values()].sort((a, b) => a.d - b.d);
        const bleibt = new Set();
        // ein offener Riss hält Opfer UND Jäger am Leib (das Maul reißt den Körper; ein Jäger, der Zahl wird, ließe sein Opfer
        // ohne Maul fallen)
        const jagen = this._bestandJagen();
        for (const c of st.creatures) if (this._bestandHaelt(c, jagen)) bleibt.add(c);
        let platz = st.maxCreatures - bleibt.size;
        const soll = new Set();
        for (const G of reihe) for (const t of G.tiere) if (!(t.leib && bleibt.has(t.leib)) && platz-- > 0) soll.add(t);
        // wer gehen soll, bleibt, solange er im Blick steht (sein Platz wartet, die Kappe hält: gezeichnet wird nur in freien Platz);
        // ein Leib ohne Tier (sein Tier fiel im Gesetz ohne Jäger am Leib, `_bestandTode`) geht, sobald er außer Blick steht
        for (const c of st.creatures.slice())
            if (c.userData._ohneTier) {
                // der gebundene Leib bleibt (sein Kopf verließ das Bild des Gaus: er geht mit dem Spieler, außerhalb des Gesetzes)
                if (!(c.userData.bond > 0) && this._bestandAusserBlick(c)) this.removeCreature(c);
            } else if (!bleibt.has(c) && !soll.has(c.userData._bestand) && this._bestandAusserBlick(c))
                this._bestandEntkoerpern(c);
        // je Takt höchstens drei Orts-Suchen; eine Gruppe ohne Ort (fern, außer Blick, frei) fragt erst sechs Takte später wieder
        let suchen = 3;
        for (const G of reihe) {
            const fehlt = G.tiere.filter((t) => soll.has(t) && !t.leib);
            if (!fehlt.length || fehlt[0]._ohneOrt > st.spielZeit) continue;
            if (G.gehege) {
                this._gehegeLeiber(fehlt, G.tiere, G.ankunft);
                continue;
            }
            if (this._bestandLeiber(fehlt, G.tiere).length || !--suchen) break;
            fehlt[0]._ohneOrt = st.spielZeit + 6 * AnazhRealm._bestandGesetz().B.taktS;
        }
        // DER LEIB WÄCHST MIT SEINEM TIER (leben-erbe): je Takt trägt jeder gezeichnete Leib das Alter seines Tiers und, weicht
        // die Größe seines Erbes zur Zeit (`_bestandBs`) um mehr als 2 % von der gezeichneten, diese Größe (`_kreaturGroesseSetzen`,
        // der EINE Schreiber der Größe: Stats und Wunde gehen mit) — das Kalb wächst an seiner Mutter heran.
        for (const c of st.creatures) {
            const t = c.userData._bestand;
            if (!t) continue;
            c.userData.alterS = t.alterS;
            const bs = this._bestandBs(t);
            if (!(Math.abs(bs / c.userData.bodySize - 1) <= AnazhRealm.LEIB_WUCHS_TOLERANZ))
                this._kreaturGroesseSetzen(c, bs);
        }
    }
    // WER BLEIBT GEZEICHNET (die EINE Frage der Zeichnung und des Weichens): ein Leib außerhalb des Bestands, einer im Riss (Opfer
    // oder Jäger), gebunden, mit Auftrag oder im Nah-Kreis. `jagen` = die Jäger der offenen Risse (`_bestandJagen`).
    _bestandJagen() {
        return new Set(this.state.creatures.map((c) => c.userData._rissVon).filter(Boolean));
    }
    _bestandHaelt(c, jagen) {
        const ud = c.userData;
        return !!(
            !ud._bestand ||
            ud._bestand.zu ||
            ud._rissVon ||
            jagen.has(c) ||
            ud.bond > 0 ||
            (ud.task && ud.task.name !== "wander") ||
            this._kreaturNah(c)
        );
    }
    // DARF DER LEIB `c` VOR DEM AUGE GEHEN (die EINE Frage der Zeichnung und des Weichens an den Blick)? Ohne Frustum ja, sonst
    // nur, wenn der Leib selbst außer Blick steht — seine Kugel samt Saum und dem Rand des Blicks (`_kreaturAusserBlick`,
    // `_kreaturBlickRand`). Bis w13-pegel-heil fragte das Weichen (`_bestandWeicht`) den Fuß-Punkt (`_kreaturImBlick`): ein Leib
    // am Rand des Blicks, dessen Fuß eben draußen lag, verschwand an der vollen Kappe vor dem Auge.
    // Ein Leib jenseits seines Pixel-Horizonts (geparkt, `_weltLeibTakt`: `_kzFern` −1, unsichtbar) trägt kein Bild — er steht
    // außer Blick, auch im Kegel. Bis w28-halter-register hielt ihn der Frustum: nach der Runde reise standen 5 Leiber 2,6 bis
    // 5,7 km fern im Bestand und in `leibFern` (Radeon, Wiese; samt `_tierBaum` im Heap), kein Grund hielt sie.
    _bestandAusserBlick(c) {
        if (c.userData._kzFern === -1) return true;
        const fr = this._frustumCache;
        const rand = this._kreaturBlickRand();
        return !fr || (rand >= 0 && this._kreaturAusserBlick(c, fr, rand));
    }
    // DER PLATZ FÜR EINEN AKT (`spawnCreatureAt` an der vollen Kappe): der gezeichnete Leib des Bestands, der gehen darf, außer
    // Blick (`_bestandAusserBlick`, wie in der Zeichnung) und am fernsten vom Spieler (die Zeichnung hält die nahen Gruppen) —
    // oder keiner.
    _bestandWeicht() {
        const st = this.state;
        if (!st.playerMesh) return null; // ohne Spieler keine Zeichnung, kein Nah-Kreis
        const p = st.playerMesh.position;
        const jagen = this._bestandJagen();
        let wer = null,
            fern = -1;
        for (const c of st.creatures) {
            if (this._bestandHaelt(c, jagen) || !this._bestandAusserBlick(c)) continue;
            const d = Math.hypot(c.position.x - p.x, c.position.z - p.z);
            if (d > fern) [wer, fern] = [c, d];
        }
        return wer;
    }
    _bestandEntkoerpern(c) {
        const t = c.userData._bestand;
        [t.snap, t.name, c.userData._bestand] = [this._serializeCreature(c), c.userData.name, null];
        this.removeCreature(c);
        t.leib = null;
        if (t.gau) this._gauMerken(t);
    }

    // DIE GRUPPE WIRD GEZEICHNET — DER LEIB STEHT, WO SEIN TIER STEHT (tiere-im-blick; das Gesetz des Geheges, `_gehegeLeiber`):
    // ihr erster Leib steht am ersten Ort der Spirale um ihr Tier, der freien Grund und ihren Lebensraum trägt (`_bestandLeibOrt`),
    // die übrigen im Wurf um ihn (`_kreaturWurf` mit den Tieren — Raum, Fenster, Lebensraum der Herde); steht er dort im Blick,
    // wartet die Gruppe als Zahl, bis der Blick geht — bei der ANKUNFT erscheint jeder (`_bestandErscheint`). Der Verband bindet
    // alle gezeichneten Glieder. Liefert die neuen Leiber. Bis hier suchte die Spirale den nächsten Ort ≥ CREATURE_SPAWN_FAR_MIN
    // (130 m, die Boot-Regel V18.315) vom Spieler und außer Blick: an der Mess-Wiese stand die Herde, deren Tier 31 m fern steht,
    // 135–174 m fern, der nächste Leib im Median 93 m — die Ich-Sicht sah in 600 Spiel-s Gang kein Tier (tiere.K5#1).
    _bestandLeiber(fehlt, gruppe = fehlt) {
        const ort = this._bestandLeibOrt(fehlt[0]);
        if (!ort) return [];
        const platz = Math.min(
            this.state.maxCreatures - this.state.creatures.length,
            AnazhRealm.BESTAND_REGION.leiberJeTakt
        );
        const neu = this._kreaturWurf(ort, null, "happy", this._faunaRng("leib"), platz, fehlt);
        this._kreaturVerbinden(gruppe.map((t) => t.leib).filter(Boolean));
        return neu;
    }
    _bestandLeibOrt(t) {
        const LG = AnazhRealm._lebensraumGesetz();
        const lebt = (x, z) => LG.lebensraum(t.g, this._bodenKlasseAt(x, z), LG.L) > 0;
        const imRaum = lebt(t.x, t.z);
        for (let k = 0; k < 64; k++) {
            const x = t.x + Math.cos(k * 2.39996) * 25 * Math.sqrt(k);
            const z = t.z + Math.sin(k * 2.39996) * 25 * Math.sqrt(k);
            if (!this._kreaturGrundFrei(x, z) || (imRaum && !lebt(x, z))) continue;
            return this._bestandErscheint(x, z, t.g, this._bestandBs(t)) ? { x, z } : null;
        }
        return null;
    }
    // DARF EIN LEIB DES BESTANDS AN (x, z) ERSCHEINEN? KEIN LEIB ERSCHEINT SICHTBAR: nie im Raum des Spielers
    // (CREATURE_SPAWN_CLEAR_M); bei der Ankunft überall (das Bild ist neu, `_bestandAnkunftTakt`); sonst außer Blick (der Leib als
    // Kugel samt Rand, `_kreaturLeibImBlick`) ODER im Blick so fern, dass seine Höhe am Schirm ≤ erscheinenPx Bildpunkte misst
    // (Johnson 1958: ein Ziel ERKENNT das Auge ab 4,0 ± 0,8 Linienpaaren = 8 px über seiner kritischen Ausdehnung, darunter ist es
    // ein Punkt). Bis tiere-im-blick 2 erschien kein Leib im Blick: was dem Gehenden vor die Augen kam, stand im Kegel und erschien
    // nie — die Ich-Sicht sah in 600 Spiel-s Gang 0 Tiere (tiere.K5#1). Ein Rothirsch misst 8 px Höhe am Maß 720 Zeilen bei ~76 m.
    _bestandErscheint(x, z, g, bs) {
        const p = this.state.playerMesh.position;
        if (Math.hypot(x - p.x, z - p.z) < AnazhRealm.CREATURE_SPAWN_CLEAR_M) return false;
        if (this._bestandAnkunft > 0 || !this._kreaturLeibImBlick(x, z, g, bs)) return true;
        const cam = this.state.camera;
        const stell = this._geburtsStell || (this._geburtsStell = { rotation: { y: 0 } });
        const h = this._kreaturLeib(
            stell,
            this._gattungLeib(g).beinL * bs,
            this._geburtsLeib || (this._geburtsLeib = {})
        ).hoehe;
        const d = Math.hypot(
            x - cam.position.x,
            this.getTerrainHeightAt(x, z) + 0.5 * h - cam.position.y,
            z - cam.position.z
        );
        return (h * AnazhRealm._brennweite(this._schirm().hoehe)) / d <= AnazhRealm.BESTAND_REGION.erscheinenPx;
    }
    // DIE ANKUNFT: springt der Spieler zwischen zwei Takten weiter als die halbe Seite einer Region (der Boot, ein Stand, ein
    // Ort-Wechsel, ein Sprung der Welt-Uhr — `_bestandSprung`), ist das Bild neu — ankunftTakte Takte lang zeichnet die Zeichnung
    // je Takt (sonst je taktS) und jeder Leib erscheint an seinem Ort, auch im Blick (`_bestandErscheint`). Die Kosten hängen an
    // der Änderung: höchstens leiberJeTakt Leiber je Takt. Liefert, ob die Ankunft läuft.
    _bestandAnkunftTakt() {
        const p = this.state.playerMesh.position;
        const l = this._bestandLage || (this._bestandLage = { x: NaN, z: NaN });
        if (!(Math.hypot(p.x - l.x, p.z - l.z) <= this._bestandSeite() / 2))
            this._bestandAnkunft = AnazhRealm.BESTAND_REGION.ankunftTakte;
        else if (this._bestandAnkunft > 0) this._bestandAnkunft--;
        [l.x, l.z] = [p.x, p.z];
        return this._bestandAnkunft > 0;
    }
    // EIN TIER WIRD LEIB: sein Stand kehrt wieder (`_restoreCreatureFromSnapshot` — Gedächtnis, Wunde, Bindung), ein Tier ohne
    // Stand wird gegossen (Seele, Größe); Alter, Anker und Name sind die des Tiers. Die Größe ist die seines Erbes zur Zeit
    // (`_bestandBs`), auch für den Stand: er trug die Größe des Augenblicks, in dem der Leib ging.
    _bestandLeib(t, x, y, z) {
        // DIE KENNUNG IST DIE DES TIERS (w28-funktion-welt-2): netId, Los-Nummer (Wander-Kurs, Revier-Ziele, erster Ruhe-Pegel) und
        // Verband (`_kreaturVerbinden`) aus der Adresse des Tiers im Bestand (`t.id`, seit leben-erbe `indId`) über den EINEN Text-Hash
        // (samen-core `samenHash`), nie aus `_creatureNetSeq` (A gegen A an ea7885fb `tier:wesen` anders: je Lauf kamen andere Leiber)
        const nr = 1e6 + (globalThis.__samenCore.samenHash(String(t.id)) % 9e8);
        const bodySize = this._bestandBs(t);
        const c = t.snap
            ? this._restoreCreatureFromSnapshot(
                  Object.assign({}, t.snap, { position: { x, y, z }, verband: undefined, bodySize }),
                  "happy",
                  nr
              )
            : this.spawnCreatureAt(x, y, z, "happy", t.soul, { bodySize, los: nr });
        if (!c) return null;
        // die Wiederkehr klemmt den Stand auf die Spanne (`_lebenSpanne`); das Tier trägt seine eine Masse ungeklemmt
        if (c.userData.bodySize !== bodySize) this._kreaturGroesseSetzen(c, bodySize);
        const netId = "c" + nr;
        Object.assign(c.userData, {
            netId,
            alterS: t.alterS,
            wanderAnchor: { x: t.x, z: t.z },
            name: this._bestandName(t),
        });
        [c.userData._bestand, t.leib, t.snap] = [t, c, null];
        if (t.gau && this._gauMerk) this._gauMerk.delete(t.id);
        return c;
    }

    // DER LEBENSZYKLUS (Ökologie K2, tetrapoda BESTAND_GESETZ): je taktS s der Spiel-Zeit (`spielZeit`: das Portal friert sie
    // ein) die Leiber außerhalb des Bestands angenommen (`_bestandAdoptieren`), die offenen Risse gerissen, dann je nahe Region
    // ihre versäumten Takte als Zahl und der Takt des Spielers (`_bestandSchritt`), der Fall der Gezeichneten und die Zeichnung
    // nach der Kappe (`_bestandVerkoerpern`). Bis Ökologie K2 setzte ein Deckel den Bestand (FAUNA_TARGET/MAX_POPULATION, die
    // Wanduhr); bis oekologie.K2#2 war er die Liste der Körper um den Spieler, und die Kappe hielt die Geburt an. Die Marke des
    // letzten Takts reist nicht mit der Uhr: das Laden setzt sie an die Uhr des Stands (halten.K5,
    // `_loadStateRestoreSoulAndAtmosphere`).
    // DER BESTAND LEBT, WENN DIE KREATUREN BEREIT SIND (die EINE Regel der Kreaturen, `_kreaturenBereit`, K60): vorher steht
    // seine Uhr. Bis w7-begegnung lief der Takt schon unter dem Ladeschirm und fragte die Regel erst an der Geburt — die Regionen
    // holten ihre Stunde ohne eine Geburt nach, und die Stunde war verbraucht (Mess-Wiese: vier Regionen leer bis auf einen Bären).
    // Das Aufholen geht NAH zuerst (Lehre 25): die Region des Spielers vor ihren Nachbarn.
    tickFaunaLifecycle() {
        const st = this.state;
        const L = st.faunaLifecycle;
        const B = AnazhRealm._bestandGesetz().B;
        if (!this._kreaturenBereit()) return;
        const wu = this._weltUhrSprung | 0; // der Sprung der Welt-Uhr (`_weltUhrNimm`) nimmt die Leiber (`_bestandSprung`)
        if ((this._faunaUhrSprung ?? wu) !== (this._faunaUhrSprung = wu)) this._bestandSprung();
        this._gauTakt(); // der Leser des Gaus bestellt das Bild der Gattungen des Gesetzes (Leben C2b)
        this._feldTakt();
        // zwischen zwei Takten zeichnet nur die Ankunft: die des Spielers (`_bestandAnkunftTakt`) und die eines Geheges
        // (`_gehegeKommtAn`: seine Tiere stehen im selben Bild)
        const ankunft = !!st.playerMesh && this._bestandAnkunftTakt();
        if (st.spielZeit - (L.lastTick || 0) < B.taktS)
            return void ((ankunft || this._gehegeKommtAn()) && this._bestandVerkoerpern());
        L.lastTick = st.spielZeit;
        this._bestandAdoptieren();
        // DIE OFFENEN RISSE (oekologie.K2): ein Leib, den ein Riss im Nah-Kreis seinem Jäger nannte (sein Tier starb im Gesetz),
        // reißt die Jagd, solange der Jäger lebt und er seine Beute ist — nah als Körper; fern oder ohne Jäger fällt er.
        for (const c of st.creatures.slice()) {
            const j = c.userData._rissVon;
            if (!j) continue;
            if (st.creatures.includes(j) && this._kreaturIstBeute(j, c)) this._kreaturRiss(c, j);
            else this._creatureCombatDeath(c, "jagd");
        }
        for (const c of st.creatures.slice())
            if (c.userData._faelltNach && !st.creatures.some((o) => o.userData._rissVon === c))
                this._creatureNaturalDeath(c, c.userData._faelltNach, false);
        this._bestandVerkoerpern();
    }

    // DER SPRUNG DER UHR NIMMT DIE LEIBER (w28-funktion-welt-2): der Bestand ist eine Funktion der Welt-Uhr (`_feldTakt`), seine
    // Leiber trugen die Takte davor — wann, wo und in welcher Reihe sie gezeichnet wurden, wohin sie liefen, ihr Stand im Tier
    // (`snap`), die Frist der Orts-Suche (`_ohneOrt`) und die Ströme des Lebens (`_faunaRng`). Springt die Welt-Uhr (ein Stand
    // lädt, die Uhr eines Mitspielers), wird jeder Leib des Bestands wieder Zahl, sein Stand fällt, die Ströme beginnen am Samen —
    // gezeichnet wird danach aus dem Bestand der neuen Uhr, wie der Tag der Bewohner danach f(Same, t) ist (`_bewohnerTakt`). Der
    // gebundene Leib (`bond`) und die Leiber eines offenen Risses bleiben. Bis hier hing die Herde nach dem Sprung an der Zahl
    // der Takte davor: A gegen A an 2a1a6e1c unter Last 12 gegen 16 Tiere am Dorf, `tier:bestaeuber` und die Leiber anders.
    _bestandSprung() {
        const st = this.state;
        // ein Leib ohne Tier (der Boot-Wurf, ein Ruf) tritt zuerst in den Bestand — sonst trüge er die Takte davor über den
        // Sprung (A gegen A an 60231b1c fünf Leiber des Boot-Wurfs am Dorf ohne Tier in A, angenommen in B)
        this._bestandAdoptieren();
        const jagen = this._bestandJagen();
        for (const c of st.creatures.slice()) {
            const ud = c.userData;
            if (ud._bestand && !(ud.bond > 0) && !ud._rissVon && !jagen.has(c)) this._bestandEntkoerpern(c);
            // ein Leib, der bleibt, sucht seinen Kopf im Bild der neuen Uhr (Leben C2b: die Bilder der Gaue fallen mit dem Sprung)
            else if (ud._bestand && ud._bestand.gau && !ud._bestand.zu)
                [ud._gauWartet, ud._gauWartetOrt, ud._bestand.leib, ud._bestand] = [ud._bestand.id, { x: ud._bestand.x, z: ud._bestand.z }, null, null]; // prettier-ignore
        }
        [this._gauBildStand, this._gauMerk, this._gauJaegerOrt] = [null, null, null];
        this._bestandAnkunft = AnazhRealm.BESTAND_REGION.ankunftTakte; // das Bild der neuen Uhr ist eine Ankunft
        for (const R of Object.values(this._bestandRegionen().regionen))
            for (const t of R.tiere) {
                t._ohneOrt = undefined;
                if (!t.leib) t.snap = null;
            }
        this._faunaStroeme = null;
    }

    // DER FELD-TAKT (feld.K2#2, Lockstep): das Leben der nahen Regionen ist eine Funktion der Welt-Uhr und der Akte, nie der
    // Bild-Folge. Jeder Takt des Gesetzes steht auf dem Raster der Welt-Uhr (`_bestandSchritt`), und ALLE Takte der nahen Regionen
    // laufen in EINER Folge: der früheste zuerst, bei gleicher Zeit die Regionen in der Ordnung ihrer Schlüssel — so schreibt die
    // Herde zweier Nachbarn an ihrer gemeinsamen Grenze auf jeder Seite in derselben Reihe. DAS AUFHOLEN FOLGT DER WELT-UHR: je
    // taktS verstrichener Spiel-Zeit aufholJeTakt Takte — springt die Uhr (ein Stand lädt, `_weltUhrNimm`; eine Bühne rafft die
    // Zeit), holen die nahen Regionen ihre Stunde im Takt des Sprungs nach, ehe die Welt danach etwas schreibt (w13-brand-takt:
    // bis dahin lief die Vergangenheit über die folgenden Minuten und las das Feld der Gegenwart). Gerufen je Takt des Spiels: was
    // fällig ist, rechnet er, sonst ein Vergleich je Region. In DIESELBE Folge treten die Feld-Akte (`_feldAkt`, die Eingaben der
    // Seiten): ein Akt vor dem Takt, der nicht früher ist als er. Mit Mitspielern rechnet er bis zum Horizont (`_feldHorizont`: die
    // früheste Uhr der Mitspieler, weniger dem Vorlauf): bis dahin hat jeder Akt jede Seite erreicht. Bis feld.K2#2 holte jede Region für sich nach (die nächste
    // zuerst, je Seite eine andere Reihe), der frische Takt stand auf der Bild-Uhr, und gerechnet wurde nur je taktS.
    _feldTakt() {
        const st = this.state;
        const L = st.faunaLifecycle;
        const B = AnazhRealm._bestandGesetz().B;
        const bis = this._feldHorizont();
        const schritte = Math.max(1, Math.round((bis - (L.feldUhr ?? bis)) / B.taktS));
        L.feldUhr = Math.max(L.feldUhr ?? bis, bis);
        const regionen = this._bestandNah()
            .sort()
            .map((key) => [key, this._bestandRegion(key, false)]);
        const A = st.feldAkte || [];
        let budget = AnazhRealm.BESTAND_REGION.aufholJeTakt * schritte;
        const tode = [];
        for (;;) {
            let wahl = null;
            for (const e of regionen) if (bis - e[1].t >= B.taktS && (!wahl || e[1].t < wahl[1].t)) wahl = e;
            if (A.length && A[0].w <= bis && (!wahl || A[0].w <= wahl[1].t + B.taktS)) {
                this._feldAktWirkt(A.shift());
                continue;
            }
            // die Folge wartet GEORDNET: der früheste Takt steht an, seine Region noch ohne ihre Hydro-Wahrheit (`_bestandBereit`)
            if (!wahl || budget-- <= 0 || !this._bestandGauSteht(wahl[0], wahl[1])) break;
            this._bestandSchritt(wahl[0], wahl[1], bis - wahl[1].t >= 2 * B.taktS, tode);
            L.feldLetzt = wahl[1].t; // das zuletzt gerechnete Ereignis der Folge (der Moment des Felds, gate:mp-sync (f))
        }
        if (tode.length) this._bestandTode(tode);
    }

    // DER NAH-KREIS (das Feld des Stufen-Gesetzes, `_feldGrenzen`): steht der Leib dort, wo das Bild ihn als Körper zeichnet? Mit
    // Bild sagt es der Ziegel (`_kzNah`, mit seiner Hysterese), ohne Bild und für die Sicht-Kopie (kein Ziegel) dasselbe Gesetz
    // am Auge der Stufen, mit der Hysterese des Satzes — die EINE Frage des Tier-Satzes (`_tickTierSatz`) und des Risses.
    _kreaturNah(cr, auge) {
        const u = cr.userData;
        if (!(this.state.renderer && this.state.renderer._isHeadlessNull) && !u._kopie) return u._kzNah === true;
        const a = auge || this._lodAuge() || this.state.playerMesh.position;
        const dx = cr.position.x - a.x,
            dz = cr.position.z - a.z;
        return !this._feldTraegt(!!u._menge, Math.sqrt(dx * dx + dz * dz), !!u._satz);
    }

    // ═══ DER TIER-SATZ (profiband.K1 „Sturm mit 50 Tieren“: jedes Tier im Nah-Kreis war ein Leib — L0 8, L1 5 Draws je Tier
    // in Bild und Kaskade; an der GTX bei 50 Tieren +42 / +25 Befehle, Render 6,0 → 11,4–13,0 ms) ═══
    // Im Nah-Kreis (`_kreaturNah`) leben die `KREATUR_SATZ.nahLeiber` Bedeutendsten als Leib (`_bedeutung` am Auge der Stufen:
    // Größe am Schirm mal Bewegung; ihre Stufe wählt der Stufen-Schalter `_gelenkStufe`; die Wahl hält mit dessen Hysterese) — jedes andere
    // Tier steht und geht im Satz seiner Gestalt (`_gangSatz`, derselbe Baustein wie der Bewohner): die gelenkige Grobstufe
    // (L1, das Studio-Mesh) als Senken Fell · Glimmen (das Auge, das leuchtet) · Rest und der Wurf (`wurf.seh` der Kern-Zeile).
    // Sein Leib zeichnet nicht und geht nicht (`_animateTierBaum` fällt für ihn, `_tierSatzGang`); der Satz geht das EINE
    // Gang-Gesetz in den Bändern der Gangarten (GANG_FOLGE, `_tierSatzBacken`), die Phase rückt mit dem WEG des Leibs — kein
    // Gleiten. Wer beißt, lebt als Leib (der Biss liest den Kopf, `_kreaturBissTakt`). Die Befehle hängen nie an der Kopfzahl.
    _tickTierSatz(auge) {
        const st = this.state;
        const K = AnazhRealm.KREATUR_SATZ;
        const M = this._tierSaetze || (this._tierSaetze = new Map());
        const takt = (this._tierSatzTakt = (this._tierSatzTakt || 0) + 1);
        for (const Z of M.values()) if (Z) Z.dabei = 0;
        // ein Gefallener verlässt den Satz (er liegt als Leib, `_tickLeichname`)
        for (const cr of st.leichname) if (cr.userData._satz) this._tierSatzAus(cr, true);
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
            if (!this._kreaturNah(cr, auge) || u._ruht === true) {
                if (u._satz) this._tierSatzAus(cr);
                continue;
            }
            const h = u._gelenk.hyst;
            // die Hysterese der Nah-Wahl: wer lebt, zählt um 1 / (1 − h)² bedeutender — ein Paar an gleichem Abstand tauscht nicht je Takt
            const dx = cr.position.x - auge.x,
                dz = cr.position.z - auge.z;
            const b = this._bedeutung(cr.scale.x || 1, Math.sqrt(dx * dx + dz * dz), u._laufV, cr.position);
            u._satzB = u._satz ? b : b / ((1 - h) * (1 - h));
            kand.push(cr);
        }
        kand.sort((a, b) => b.userData._satzB - a.userData._satzB);
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
            for (const m of platz.senken)
                AnazhRealm._gangSatzInstanz(m, i, m4, u._satzBand, u._satzPh, u._satzW, null, u._satzStand || 0);
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
        const s = u._satzS || (u._satzS = new Float64Array(11).fill(NaN));
        const p = cr.position;
        const q = cr.quaternion;
        const g = u._satzBand + u._satzPh - Math.floor(u._satzPh);
        const v = [p.x, p.y, p.z, q.x, q.y, q.z, q.w, cr.scale.x, g, u._satzW, u._satzStand || 0];
        let regt = false;
        for (let i = 0; i < 11; i++)
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
        // DIE STÄNDE DES SATZES (H1, KREATUR_SATZ.staende: 0 stehen und ziehen, äsen, ruhen) aus dem Posen-Gesetz des Leibs
        const kopfUnten = K.staende.map(() => false);
        const satz = this._gangSatz(
            {
                name: "tier-satz",
                inventar: "tier",
                n: K.phasen,
                baender: K.baender.length,
                staende: K.staende.length,
                quellen,
                cap: K.cap,
                senken: ["fell", "glimm", "rest", "wurf"]
                    .filter((k) => teilVon[k].length)
                    .map((k) => ({ teil: k, quellen: teilVon[k], stoff: stoffVon[k], wurf: k === "wurf" })),
            },
            (S) => K.staende.forEach((h, k) => (kopfUnten[k] = this._tierSatzStand(S, leib, k, h)))
        );
        const Z = {
            satz,
            leib,
            kopfUnten,
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
            back: { band: 0, schritt: 0, k: -1, sub: 0, t: 0, m: 1, dt: AnazhRealm.FIXED_DT },
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
            if (B.k === -1) {
                schritt(AnazhRealm.FIXED_DT);
                if (++B.schritt < K.einschwingen) continue;
                const T = (2 * Math.PI) / Math.max(1e-3, tb._gang.omega);
                B.m = Math.max(1, Math.ceil((T / S.n) * 60));
                B.dt = T / S.n / B.m;
                Z.schritt[B.band] = Z.tempo[B.band] * T;
                B.k = -2;
                B.sub = 0;
                continue;
            }
            // DER VORLAUF IM SCHRITT DES BACKENS (KREATUR_SATZ.vorlauf): die Glieder folgen ihrem Ziel je Schritt (legA aus dt)
            // — wechselte der Takt erst am ersten Bild des Zyklus von FIXED_DT auf B.dt, lag der Einschwung des neuen Schritts
            // IN den Posen, je nach der Phase, an der das Einschwingen endete (gate:tier-gang Satz Bär im Trab 0,036 → 0,053 an
            // einer Hysterese 0,2 → 0,1; Satz Fuchs im Trab 0,035–0,059 über einschwingen 150/300/450, der Leib 0,014).
            if (B.k === -2) {
                schritt(B.dt);
                if (++B.sub < K.vorlauf * S.n * B.m) continue;
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
        u._satzStand = Math.max(0, K.staende.indexOf(u._gezeigt || null));
        u._satzWahl = { v: G ? G.v || 0 : 0, art: G ? G.art : undefined };
        u._satzPh = G ? (G.ph[0] - Z.ph0[band]) / (2 * Math.PI) : 0;
        u._satzW = G && G.schritt > 0 ? Math.min(1, G.schritt) : 0;
        u._satzX = cr.position.x;
        u._satzZ = cr.position.z;
        cr.visible = false;
    }
    // EIN TIER VERLÄSST DEN SATZ: der Leib steht wieder im Bild, ausgewertet vor dem ersten Bild (`_kreaturPoseFrisch`); trägt
    // das Feld ihn (fern), gehört `visible` dem Ziegel; ein Leichnam (`liegt`) liegt in der Pose bei 0
    _tierSatzAus(cr, liegt) {
        const u = cr.userData;
        u._satz = null;
        this._kreaturPoseFrisch(cr, liegt);
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
        u._satzStand = Math.max(0, K.staende.indexOf(u._gezeigt || null));
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
    _tickLeichname(delta, auge, zeilen) {
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
            this._leibSicht(creature, this.isInFrustum(creature), auge, zeilen);
        }
    }

    // DAS REVIER (_creatureCharacterWander): liegt der Anker `a` im Lebensraum der Gattung (tetrapoda lebensraum über
    // `_bodenKlasseAt`, trockener Grund), legt sich die Leine in ihn — der Ort im Sechseck-Gitter um `a` (Ringe zu ½ Leine, bis
    // 1½ Leinen), dessen Leine (die Mitte und das Sechseck bei 0,7 Leinen) der Lebensraum am vollsten trägt, der nächste bei
    // Gleichstand; trägt er sie ganz, bleibt der Anker (darum legt ein zweiter Lauf, nach dem Speicherstand, nicht um). Ein Anker
    // außerhalb (ein Akt, der anderswo setzt — wie der Wurf, `_kreaturWurf`) bleibt und ist FREI: sein Tier zieht in der Leine,
    // wohin es will. Liefert den gelegten Anker { x, z, revier, frei? }.
    _kreaturRevier(creature, a, leash) {
        // das Revier des Gehege-Tiers ist sein Gehege, der Anker sein Ruhe-Platz (`_gehegeRevierTraegt`, `_gehegeLeine`)
        const t = creature.userData._bestand;
        if (t && t.gehege) return { x: a.x, z: a.z, revier: true, gehege: t.gehege };
        const LG = AnazhRealm._lebensraumGesetz();
        const g = this._kreaturGattung(creature);
        const traegt = (x, z) => LG.lebensraum(g, this._bodenKlasseAt(x, z), LG.L) > 0 && !this._nassAt(x, z);
        if (!LG.L.gattung[g] || !traegt(a.x, a.z)) return { x: a.x, z: a.z, revier: true, frei: true };
        // die Leine als Mitte, Sechseck bei 0,5 und um 30° gedreht bei 0,9 Leinen (gleiche Fläche je Punkt): bis tiere-im-blick
        // nur das Sechseck bei 0,7 — der Rand blieb ungefragt, der erste Bär der Probe tagesbudget ankerte, wo sein Lebensraum
        // 0,53 der Scheibe erreichbar trug (0,47 × π·Leine²)
        const anteil = (cx, cz) => {
            let n = traegt(cx, cz) ? 1 : 0;
            for (let k = 0; k < 12; k++) {
                const w = (k * Math.PI) / 6;
                const f = leash * (k & 1 ? 0.9 : 0.5);
                n += traegt(cx + Math.cos(w) * f, cz + Math.sin(w) * f) ? 1 : 0;
            }
            return n / 13;
        };
        let best = { x: a.x, z: a.z, s: anteil(a.x, a.z) };
        for (let ring = 1; ring <= 3 && best.s < 1; ring++)
            for (let k = 0; k < 6 * ring; k++) {
                const w = (k / (6 * ring)) * Math.PI * 2;
                const x = a.x + Math.cos(w) * ring * leash * 0.5;
                const z = a.z + Math.sin(w) * ring * leash * 0.5;
                const s = traegt(x, z) ? anteil(x, z) : 0;
                if (s > best.s) best = { x, z, s };
                if (best.s >= 1) break;
            }
        return { x: best.x, z: best.z, revier: true };
    }

    // DAS ZIEL DES ZUGS (_creatureCharacterWander): ein Ort in der Leine um den Anker, gleichverteilt in ihrer Fläche (Radius
    // Leine·√u), deterministisch aus netId × der Zahl der Ziele (sin-Hash wie der Kurs), der erste von sechs Würfen, den das Revier
    // trägt (`_kreaturRevierTraegt`) und — steht das Netz des Reviers (`_kreaturRevierNetz`) — zu dem vom Tier aus ein Weg durch
    // den Lebensraum führt (sein Feld, `_kreaturNetzFeld`); sonst der Anker, auch über eine Lücke. Es gilt, bis das Tier es auf
    // `blick` erreicht (dann null: es streift dort) oder das Tier seinen WEG darauf ging — den Abstand zu ihm und einen halben
    // Umweg (`rest`, je Slot weniger `weg`, der Weg dieses Slots im Tempo seiner Tätigkeit). Bis tiere-im-blick galt es 4 Leinen
    // in Schritten zu `blick` — doch `blick` ist wenigstens der Raum des Tiers (Hirsch 1,17 m), sein Weg im Äsen 0,3 m je Slot:
    // das Ziel fiel nach rund einer Leine Weg, das äsende Wild kam selten an den Rand seiner Leine (headless, Probe tagesbudget,
    // 24 Spielstunden: Hirsch 0,51–0,60 × π·Leine², Bär 0,47–0,72, der ziehende Fuchs 0,93); 4 Leinen WEG hielten den Bären an
    // fünf Zielen je Tag (0,28–0,47). Ein Ziel von vorher bekommt sein Feld, sobald das Netz steht. Liefert das Ziel
    // { x, z, n, rest, feld } oder null.
    _kreaturWanderZiel(creature, idNum, slot, blick, leash, weg = blick) {
        if (!(blick > 0)) return null;
        const ud = creature.userData;
        const p = creature.position;
        const Z = ud._wanderZiel;
        const N = this._kreaturRevierNetz(creature, leash);
        const feldZu = (x, z) => {
            const kz = N ? this._kreaturNetzZelle(N, x, z) : -1;
            return kz >= 0 && N.zelle[kz] >= 2 ? this._kreaturNetzFeld(N, kz) : null;
        };
        if (Z && (Z.rest -= weg) > 0) {
            if (N && Z.feld === undefined) Z.feld = feldZu(Z.x, Z.z);
            return Math.hypot(Z.x - p.x, Z.z - p.z) > blick ? Z : null;
        }
        const a = ud.wanderAnchor;
        const n = Z ? Z.n + 1 : 0;
        const wurf = (j) => {
            const h = Math.sin((idNum * 131 + n * 977 + j) * 78.233) * 43758.5453;
            return h - Math.floor(h);
        };
        const kp = N ? this._kreaturNetzZelle(N, p.x, p.z) : -1;
        let ziel = null;
        for (let j = 0; j < 6 && !ziel; j++) {
            const r = leash * Math.sqrt(wurf(2 * j));
            const w = wurf(2 * j + 1) * Math.PI * 2;
            const x = a.x + Math.cos(w) * r;
            const z = a.z + Math.sin(w) * r;
            if (!this._kreaturRevierTraegt(creature, x, z)) continue;
            const feld = kp >= 0 ? feldZu(x, z) : undefined;
            if (feld === undefined || (feld && this._kreaturNetzStufe(N, feld, kp) >= 0)) ziel = { x, z, feld };
        }
        if (!ziel) ziel = { x: a.x, z: a.z, feld: N ? feldZu(a.x, a.z) : undefined };
        ud._wanderZiel = Object.assign(ziel, { n, rest: 1.5 * Math.hypot(ziel.x - p.x, ziel.z - p.z) + blick });
        return ud._wanderZiel;
    }

    // DER KURS IM REVIER (_creatureCharacterWander): vom Kurs `kurs` aus abwechselnd links und rechts die Kurse des Sechsecks,
    // der erste, dessen Ende (`weg` m voraus) das Revier trägt und der die Leine nicht nach außen verlässt; trägt keiner, bleibt
    // der Kurs. Trägt das Ziel `Z` sein Feld, ist der Kurs der des Wegs (`_kreaturNetzKurs`): auf ihm trägt auch das Wasser des
    // Lebensraums, und er weicht höchstens ein Sechstel — der Weg geht nie zurück (sonst pendelte das Tier am Saum, wo die
    // Mitte einer Zelle trägt und ihr Rand nicht: der erste Bär 60 Spielminuten auf der Stelle); neben dem Weg geht es
    // geradewegs zu ihm. Ein freier Anker hält jeden Kurs. Vorher wich jeder Zug nur `weg` voraus vom geraden Kurs zum Ziel: am
    // Saum zwischen Ufer und Hang, am Fluss und am Waldrand glitt das Tier am Rand entlang und kam dem Ziel nicht näher
    // (headless, Probe tagesbudget, 24 Spielstunden: der erste Bär ging 432 seiner 683 m in Zielen, deren Kurs auswich, und kam
    // ihnen 83 m näher; der zweite Wolf 420 m, 30 m).
    _kreaturWanderKurs(creature, kurs, weg, leash, Z) {
        const a = creature.userData.wanderAnchor;
        if (a.frei) return kurs;
        const N = Z && Z.feld ? this._kreaturRevierNetz(creature, leash) : null;
        const wN = N ? this._kreaturNetzKurs(creature, N, Z, weg) : null;
        if (wN !== null && Z.neben) return wN;
        if (wN !== null) kurs = wN;
        const p = creature.position;
        for (let k = 0; k < (wN !== null ? 3 : 6); k++) {
            const w = kurs + (k % 2 ? 1 : -1) * Math.ceil(k / 2) * (Math.PI / 3);
            const x = p.x + Math.cos(w) * weg;
            const z = p.z + Math.sin(w) * weg;
            if (Math.hypot(x - a.x, z - a.z) > leash && Math.cos(w) * (p.x - a.x) + Math.sin(w) * (p.z - a.z) > 0)
                continue;
            if (this._kreaturRevierTraegt(creature, x, z, wN !== null)) return w;
        }
        return kurs;
    }

    // trägt das Revier des Tiers den Ort (x, z): sein Lebensraum auf trockenem Grund — auf dem Weg (`weg`) auch sein Wasser —,
    // am freien Anker jeder Ort, am Anker eines Geheges jeder Ort in seinem Rand
    _kreaturRevierTraegt(creature, x, z, weg = false) {
        if (creature.userData.wanderAnchor.frei) return true;
        if (creature.userData.wanderAnchor.gehege) return this._gehegeRevierTraegt(creature, x, z);
        const LG = AnazhRealm._lebensraumGesetz();
        return (
            LG.lebensraum(this._kreaturGattung(creature), this._bodenKlasseAt(x, z), LG.L) > 0 &&
            (weg || !this._nassAt(x, z))
        );
    }

    // DAS NETZ DES REVIERS (_kreaturWanderZiel, _kreaturWanderKurs): die Leinen-Scheibe um den Anker als Gitter zu Leine/10 bis
    // 1,2 Leinen (die Zellen der Probe tagesbudget), je Zelle, was der Lebensraum der Gattung an ihrer Mitte trägt — 1 nichts,
    // 2 den Weg (Wasser, wo der Lebensraum es trägt: der Bär lebt am Fluss und durchquert ihn), 3 auch den Aufenthalt
    // (trockener Grund; 0 liegt außerhalb). Es wächst im Takt — je Bild höchstens 8 Zellen für alle Tiere, ein Wurf wird nie
    // zur Spitze — und gilt für jedes Tier mit diesem Anker, dieser Leine und dieser Gattung (der Verband teilt es). Liefert das
    // fertige Netz oder null (ein freier Anker hat keines).
    _kreaturRevierNetz(creature, leash) {
        const ud = creature.userData;
        const a = ud.wanderAnchor;
        if (!a || a.frei || a.gehege) return null; // (der Rand eines Geheges ist konvex: jeder Weg in ihm ist gerade)
        const g = this._kreaturGattung(creature);
        const gleich = (M) => M && M.x === a.x && M.z === a.z && M.leine === leash && M.g === g;
        let N = ud._revierNetz;
        if (!gleich(N)) {
            N = null;
            for (const o of this._kreaturVerbandGlieder(creature) || [])
                if (gleich(o.userData._revierNetz)) N = o.userData._revierNetz;
            const R = 12;
            N = ud._revierNetz = N || { x: a.x, z: a.z, leine: leash, g, h: leash / 10, R, W: 2 * R + 1, k: 0 };
            if (!N.zelle) N.zelle = new Uint8Array(N.W * N.W);
        }
        const n = N.W * N.W;
        if (N.k >= n) return N;
        if (this._kreaturNetzBild !== this._creatureAiFrame) {
            this._kreaturNetzBild = this._creatureAiFrame;
            this._kreaturNetzRest = 8;
        }
        const LG = AnazhRealm._lebensraumGesetz();
        while (N.k < n && this._kreaturNetzRest > 0) {
            const k = N.k++;
            const i = (k % N.W) - N.R;
            const j = (k - (k % N.W)) / N.W - N.R;
            if (i * i + j * j > N.R * N.R) continue;
            this._kreaturNetzRest--;
            const x = N.x + i * N.h;
            const z = N.z + j * N.h;
            N.zelle[k] = LG.lebensraum(g, this._bodenKlasseAt(x, z), LG.L) > 0 ? (this._nassAt(x, z) ? 2 : 3) : 1;
        }
        return N.k >= n ? N : null;
    }

    // die Zelle des Netzes `N` am Ort (x, z), -1 außerhalb
    _kreaturNetzZelle(N, x, z) {
        const i = Math.round((x - N.x) / N.h) + N.R;
        const j = Math.round((z - N.z) / N.h) + N.R;
        if (i < 0 || j < 0 || i >= N.W || j >= N.W || !N.zelle[j * N.W + i]) return -1;
        return j * N.W + i;
    }

    // DAS FELD DES ZIELS: die Schritte jeder Zelle des Netzes `N` bis zur Ziel-Zelle `kz` über Zellen, die den Weg tragen (acht
    // Nachbarn, keine Ecke durch eine Zelle ohne Weg; -1 ohne Weg). Mit dem Feld `F0` statt der Ziel-Zelle: die Schritte über
    // jede Zelle der Scheibe bis zum nächsten Ort, den `F0` erreicht — der kürzeste Weg über die Lücke.
    _kreaturNetzFeld(N, kz, F0) {
        const W = N.W;
        const ab = F0 ? 1 : 2;
        const F = new Int16Array(W * W).fill(-1);
        const Q = new Int16Array(W * W);
        let [q0, q1] = [0, 0];
        if (F0) {
            for (let m = 0; m < W * W; m++) if (F0[m] >= 0) [F[m], Q[q1++]] = [0, m];
        } else [F[kz], Q[q1++]] = [0, kz];
        while (q0 < q1) {
            const k = Q[q0++];
            const i = k % W;
            const j = (k - i) / W;
            for (let di = -1; di <= 1; di++)
                for (let dj = -1; dj <= 1; dj++) {
                    const [ii, jj] = [i + di, j + dj];
                    if ((!di && !dj) || ii < 0 || jj < 0 || ii >= W || jj >= W) continue;
                    const m = jj * W + ii;
                    if (F[m] >= 0 || N.zelle[m] < ab) continue;
                    if (di && dj && (N.zelle[j * W + ii] < ab || N.zelle[jj * W + i] < ab)) continue;
                    F[m] = F[k] + 1;
                    Q[q1++] = m;
                }
        }
        return F;
    }

    // die Zelle, von der aus das Tier in Zelle `k` dem Feld `F` folgt: sie selbst, wenn das Feld sie erreicht, sonst der
    // Nachbar mit dem kürzesten Weg (das Tier steht am Saum, wo die Mitte seiner Zelle draußen liegt); -1 ohne
    _kreaturNetzStufe(N, F, k) {
        if (k < 0 || F[k] >= 0) return k;
        const W = N.W;
        const i = k % W;
        const j = (k - i) / W;
        let best = -1;
        for (let di = -1; di <= 1; di++)
            for (let dj = -1; dj <= 1; dj++) {
                const [ii, jj] = [i + di, j + dj];
                if (ii < 0 || jj < 0 || ii >= W || jj >= W) continue;
                const m = jj * W + ii;
                if (F[m] >= 0 && (best < 0 || F[m] < F[best])) best = m;
            }
        return best;
    }

    // DER KURS DES WEGS: von der Zelle des Tiers den Schritten des Felds nach — je Schritt der Nachbar näher am Ziel, unter
    // gleich nahen der dem Ziel geradeste — wenigstens `weg` (eine Zelle) voraus und weiter, solange die Strecke vom Tier dorthin
    // frei ist (im offenen Revier geht es geradewegs zum Ziel wie vorher), oder bis zum Ziel; der Kurs zeigt auf sie. Erreicht das Feld des Ziels das Tier nicht (nach Flucht oder Trunk jenseits einer Lücke), führt das Feld
    // über die Lücke (`_kreaturNetzFeld` mit F0) zum nächsten Ort des Wegs, und `Z.neben` sagt es. null außerhalb des Netzes.
    _kreaturNetzKurs(creature, N, Z, weg) {
        const p = creature.position;
        let k = this._kreaturNetzStufe(N, Z.feld, this._kreaturNetzZelle(N, p.x, p.z));
        Z.neben = k < 0;
        if (Z.neben) k = this._kreaturNetzZelle(N, p.x, p.z);
        if (k < 0) return null;
        const F = Z.neben ? Z.zuFeld || (Z.zuFeld = this._kreaturNetzFeld(N, -1, Z.feld)) : Z.feld;
        if (F[k] < 0) return null;
        const W = N.W;
        const ab = Z.neben ? 1 : 2;
        const mitte = (m) => [N.x + ((m % W) - N.R) * N.h, N.z + ((m - (m % W)) / W - N.R) * N.h];
        const vor = Math.max(weg, N.h);
        // frei: jede Zelle auf der Strecke vom Tier zum Ort (x, z) trägt den Weg (Proben zu einer halben Zelle)
        const frei = (x, z) => {
            const n = Math.ceil((2 * Math.hypot(x - p.x, z - p.z)) / N.h);
            for (let s = 1; s <= n; s++) {
                const m = this._kreaturNetzZelle(N, p.x + ((x - p.x) * s) / n, p.z + ((z - p.z) * s) / n);
                if (m < 0 || N.zelle[m] < ab) return false;
            }
            return true;
        };
        let [tx, tz] = mitte(k);
        while (F[k] > 0) {
            const i = k % W;
            const j = (k - i) / W;
            let next = -1;
            let nd = Infinity;
            for (let di = -1; di <= 1; di++)
                for (let dj = -1; dj <= 1; dj++) {
                    const [ii, jj] = [i + di, j + dj];
                    if (ii < 0 || jj < 0 || ii >= W || jj >= W) continue;
                    const m = jj * W + ii;
                    if (F[m] !== F[k] - 1) continue;
                    if (di && dj && (N.zelle[j * W + ii] < ab || N.zelle[jj * W + i] < ab)) continue;
                    const [mx, mz] = mitte(m);
                    const d = Math.hypot(mx - Z.x, mz - Z.z);
                    if (d < nd) [next, nd] = [m, d];
                }
            if (next < 0) break;
            const [mx, mz] = mitte(next);
            if (Math.hypot(tx - p.x, tz - p.z) >= vor && !frei(mx, mz)) break;
            [k, tx, tz] = [next, mx, mz];
        }
        if (!Z.neben && F[k] === 0) [tx, tz] = [Z.x, Z.z];
        if (Math.hypot(tx - p.x, tz - p.z) < 1e-6) return null;
        return Math.atan2(tz - p.z, tx - p.x);
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
// je Seele `label` der Schlüssel ihres Namens in der Sprach-Tafel (`wesen.…`); jeder Leser spricht ihn über `_t`.
AnazhRealm.CREATURE_SOULS = Object.freeze({
    // `wesen` ist ein Vierbeiner aus dem Skelett-Gesetz: Rumpf (box stein) + Kopf (sphere holz) +
    // Hals/Beine/Schwanz (holz `limb`-Kapseln). limb aktiviert wie cylinder → Compound-Tags
    // bit-identisch zum alten wesen.
    wesen: Object.freeze({
        // ERFINDER-WELLE — der ehrliche NAME der Gestalt: das wesen IST der Hirsch
        // (deer-Gattung/Archetyp seit F1). Der Schlüssel `wesen` bleibt load-bearing
        // (Saves · Tests · TETRAPODA_SOUL_MAP), nur das Schild modernisiert.
        label: "wesen.hirsch",
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
        label: "wesen.wolf",
        bodyParts: Object.freeze(
            AnazhRealm._creatureSkeleton(
                Object.assign({ archetype: AnazhRealm.CREATURE_ARCHETYPES.wolf }, AnazhRealm.CREATURE_SKELETON_G.wolf)
            ).map((p) => Object.freeze(p))
        ),
        auraY: 0.75,
    }),
    fuchs: Object.freeze({
        label: "wesen.fuchs",
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
        label: "wesen.baer",
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
// DAS GEWICHT EINER ERINNERUNG (KI K3): wie bedeutsam ein Typ dem Wesen ist — der Abruf des Gedächtnisses
// (`_creatureGedaechtnis`) wählt aus den 30 Erinnerungen die 8 mit Gewicht + Frische, das Bedeutsamste zuerst (der Abruf
// der Generative Agents: Wichtigkeit × Aktualität). Die Taten des Schöpfers am Wesen wiegen voll, die Arbeit mittel; das
// Gespräch selbst (0) ist kein Erlebnis — seine Zeile trägt nicht, was gesagt wurde, der Abruf übergeht es (der Hof zeigt es
// weiter). Bis KI K3 (03.11.) war „sprach den Schöpfer von selbst an" nach einer Gabe die jüngste Zeile, und das Wesen
// erzählte sie statt der Gabe und erfand ihren Inhalt (qwen3:4b-instruct, 3 von 4 Gaben: „das war mein erster Satz").
AnazhRealm.ERINNERUNG_GEWICHT = Object.freeze({
    geschlagen: 1,
    gefuettert: 1,
    gefolgt: 1,
    accepted_action: 0.8,
    rejected_action: 0.8,
    no_inventory_for_build: 0.7,
    auto_executed_action: 0.7,
    built: 0.6,
    delivered: 0.6,
    gathered: 0.4,
    took_materials: 0.4,
    drank: 0.3,
    no_material: 0.3,
    no_blueprint: 0.3,
    no_water: 0.3,
    proposed_action: 0.3,
    proposal_blocked: 0.3,
    spoken_rare_event: 0,
    spoken: 0,
    spoke_proactive: 0,
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
// Analog-Satz diesseits ist ein Befund mit Namen (`_analogZensus`, gate:analog-nah). Bis zu ihr ist das Studio-Tier die Gestalt,
// dahinter die Glieder-Kapseln im Welt-March — die Grenze des Felds im Stufen-Gesetz (`_feldGrenzen`, Hysterese
// LOD_SCHIRM.leib.feldHystM); bis 04.10. stand der Eintritt bei 55 m: ein nahendes Tier lief zwischen 55 und 64 m als Kapsel-Satz.
AnazhRealm.ANALOG_NAH_M = 64;
// DIE REGION DES BESTANDS (oekologie.K2#2, `_bestandRegion`): die Kachel hat die Fläche des Reviers (Seite revierM·√π) in
// zellen × zellen Zellen des Rasters (tetrapoda BESTAND_GESETZ rasterM 50 m: 4 × 4 auf 200 m Seite — bis w27-tiere-sicht 7 × 7
// auf 354 m, dieselbe Gemeinschaft auf dem dreifachen Land: 0,72 Köpfe je ha; die Station tiere.K5#1 zählte an der Mess-Wiese
// in 10 Spielminuten Gang Ego 1 · Third 3 Sichtungen, jetzt 3–10 · 5–10 in drei Welten, swiftshader 320×180); eine Region, die
// das Gesetz nie las, beginnt aufholS vor dem Lesen leer, in einer jungen Welt aufholS vor der Welt-Uhr 0, und der Takt des Spielers
// holt in seinen nahen Regionen höchstens aufholJeTakt versäumte Takte nach (~0,25 ms je Takt — die Kosten hängen an der
// Bewegung, nie an der Weltgröße; eine neue Region hat ihre Stunde in drei Minuten); gezeichnet
// werden je Takt höchstens leiberJeTakt Leiber (ein Leib kostet ~0,6 ms, eine Herde wächst über zwei Takte am selben Ort).
AnazhRealm.BESTAND_REGION = Object.freeze({
    seiteJeRevier: Math.sqrt(Math.PI),
    zellen: 4,
    aufholS: 3600,
    aufholJeTakt: 20,
    leiberJeTakt: 3,
    // die Takte der Ankunft (`_bestandAnkunftTakt`): eine Kappe von 20 Leibern zu leiberJeTakt je Takt steht nach 7 Takten
    ankunftTakte: 60,
    // die Höhe (px am Schirm), bis zu der ein Leib im Blick erscheinen darf (`_bestandErscheint`; Johnson 1958, Erkennen 4 Linienpaare)
    erscheinenPx: 8,
});
// DER TIER-SATZ (profiband.K1, `_tickTierSatz`): `nahLeiber` Tiere leben im Nah-Kreis als Leib, jedes andere steht im Satz seiner
// Gestalt — `phasen` Posen je Band (der Knoten legt zwischen zwei Zeilen linear: mit 16 glitt der Stand-Fuß an den Kanten des
// Stands, gate:tier-gang Satz Wolf im Schritt 0,054, mit 32 0,033), die Bänder sind die Gangarten der GANG_FOLGE, gebacken an der Froude-Zahl `froude` (die Mitte
// jeder Gangart: Schritt unter froudeTrab 0,5, Trab bis froudeGalopp 2,5, Galopp darüber); `einschwingen` Gang-Schritte vor dem
// Zyklus, dann `vorlauf` Zyklen im Schritt des Backens (der Einschwung des Schritt-Wechsels liegt vor den Posen, nie in ihnen:
// gate:tier-gang Satz im Trab Wolf/Fuchs/Bär/Wesen 0,020/0,033/0,036/0,026 → 0,014/0,010/0,015/0,014 an der Hysterese 0,2),
// `backJeTakt` Schritte je Takt (Lehre 14), `cap` Instanzen je Senke, `leerTakte` bis ein leerer Satz geht.
AnazhRealm.KREATUR_SATZ = Object.freeze({
    nahLeiber: 4,
    phasen: 32,
    staende: Object.freeze([null, "nahrung", "ruhen"]),
    baender: Object.freeze(["schritt", "trab", "galopp"]),
    froude: Object.freeze([0.25, 1.5, 4]),
    einschwingen: 150,
    vorlauf: 2,
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
        typeof k.bodenKlasseAm === "function" &&
        typeof k.lebensraum === "function" &&
        typeof k.lebensraumWahl === "function" &&
        k.DURST_GESETZ &&
        [k.DURST_GESETZ.durstS, k.DURST_GESETZ.suchPauseS].every(Number.isFinite) &&
        typeof k.durst === "function" &&
        k.ETHOGRAMM_GESETZ &&
        Number.isFinite(k.ETHOGRAMM_GESETZ.daemmerSin) &&
        ["lichtPhase", "ruhePegel", "aesung", "taetigkeit"].every((f) => typeof k[f] === "function") &&
        k.STOERUNG_GESETZ &&
        Number.isFinite(k.STOERUNG_GESETZ.reichM) &&
        typeof k.stoerung === "function"
    ) {
        AnazhRealm._lebensraumMemo = Object.freeze({
            L,
            S: k.STOERUNG_GESETZ,
            stoerung: k.stoerung,
            bodenKlasseAm: k.bodenKlasseAm,
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
