//# allFunctionsCalledOnLoad
class AnazhRealm_koerper_seele {
    // ===== ATLAS · Koerper/seele — Spieler-Seele · Stats · Boosts · Ausrüstung · Inventar =====
    // === Hylomorphismus-Inventar ===
    // Tag-Resonanz statt Rezept-Tabelle: jeder Slot trägt Bauplan-Name + Count, die Wirkung emergiert aus
    // computeCompoundTags(bp): resoniert ≥ 0.5 → Hover-Ping · brennend ≥ 0.5 → orange Glühen ·
    // magieleitung ≥ 0.5 → violett · lebendig ≥ 0.5 → grüner Schimmer · dichte ≥ 0.7 → tiefer Schatten.
    // Hover-Audio hängt an state.symphony.masterGain — Symphonie aus ⇒ Inventar stumm (kein Mute-Bug).
    addToInventory(blueprintName, count = 1) {
        if (!this.state.player || !Array.isArray(this.state.player.inventory)) return false;
        const inv = this.state.player.inventory;
        const bp = this.state.blueprints && this.state.blueprints[blueprintName];
        if (!bp) return false;
        // Erster Stack mit demselben Bauplan-Namen: count erhöhen.
        // Welle 6.H P2B.5 — Schema-Erweiterung: Material-Slots haben kind:"material",
        // Bauplan-Slots haben kind:"blueprint" (oder kein kind = legacy blueprint).
        const existingIdx = inv.findIndex(
            (s) => s && s.blueprintName === blueprintName && (s.kind === "blueprint" || !s.kind)
        );
        if (existingIdx >= 0) {
            inv[existingIdx].count = (inv[existingIdx].count || 0) + count;
            this._refreshIchIfOpen(); // M5 — Pickup-Feedback ist instant
            return true;
        }
        // Erster leerer Slot.
        const emptyIdx = inv.findIndex((s) => !s);
        if (emptyIdx < 0) return false; // Inventar voll
        inv[emptyIdx] = { kind: "blueprint", blueprintName, count };
        this._refreshIchIfOpen(); // M5 — Pickup-Feedback ist instant
        return true;
    }

    // Material-Slot: beim Abbauen löst sich ein Compound in Rohmaterial auf. Stackt bei gleichem
    // material-Namen; material muss in state.materials existieren (Built-in oder define_material).
    addMaterialToInventory(material, count = 1) {
        if (!this.state.player || !Array.isArray(this.state.player.inventory)) return false;
        if (typeof material !== "string" || material.length === 0) return false;
        if (!this.state.materials || !this.state.materials[material]) return false;
        const inv = this.state.player.inventory;
        const n = Math.max(1, Math.floor(Number(count) || 1));
        const existingIdx = inv.findIndex((s) => s && s.kind === "material" && s.material === material);
        if (existingIdx >= 0) {
            inv[existingIdx].count = (inv[existingIdx].count || 0) + n;
            this._refreshIchIfOpen(); // M5 — Pickup-Feedback ist instant
            return true;
        }
        const emptyIdx = inv.findIndex((s) => !s);
        if (emptyIdx < 0) return false;
        inv[emptyIdx] = { kind: "material", material, count: n };
        this._refreshIchIfOpen(); // M5 — Pickup-Feedback ist instant
        return true;
    }

    removeFromInventory(slotIndex, count = 1) {
        if (!this.state.player || !Array.isArray(this.state.player.inventory)) return false;
        const inv = this.state.player.inventory;
        const slot = inv[slotIndex];
        if (!slot) return false;
        slot.count = Math.max(0, (slot.count || 0) - count);
        if (slot.count === 0) inv[slotIndex] = null;
        return true;
    }

    // ### Spieler-Seele: animierte Multi-Mesh-Körper ###
    // Je Seele eine THREE.Group aus Primitives (kein eval, kein Asset-Load). Ammo-Body bleibt die 0.5er
    // Half-Extent-Box (Visual ~1.7 > Hitbox, gewollt); `player_soul` bleibt aus `dslComposeAtomic`.
    // Vertrag `animate(group, t, walkPhase, isMoving, …)`: t in s (Idle); walkPhase in rad wächst nur in
    // Bewegung (Glieder frieren beim Stopp ein, statt zu springen); isMoving schaltet Walk ↔ Idle.
    get playerSoulDefs() {
        if (this._playerSoulDefsCache) return this._playerSoulDefsCache;
        // Seele = Bauplan aus Körper-Teilen (Form × Material) wie jede Struktur: Compound-Tags via
        // `computeCompoundTags` (MAX-Aggregation), kein hardcodetes `tags`-Profil. Drei Built-in-Seelen sind
        // Start-Charaktere; eigene über die DSL-Op `define_soul(name, bodyParts)`.
        this._playerSoulDefsCache = {
            human: {
                label: "Mensch",
                color: 0xff0000,
                build: () => this._buildHumanGroup(),
                // Die Emotionen reisen in den Rig: MOTION_RIG_MAP (sad/joy/fear/fight aus dem koerper-Gesetzbuch)
                // feuert im Spielpfad; neutral bleibt byte-alt (mp === mref → Delta 0).
                animate: (g, t, ph, mv, uw, _em, gait) => this._animateHuman(g, t, ph, mv, uw, _em, gait),
                // Positionierte bodyParts SPIEGELN die Hand-Visuals (build()) mit EXAKT denselben (Form,Material)-
                // Paaren — Tags sind MAX über Form×Material und positionsblind → Stat-Parität per Konstruktion.
                // So holt die Werkstatt den echten Körper und die Motion-Resonanz erkennt Glieder; build()+animate
                // bleiben das getragene Built-in-Visual.
                bodyParts: [
                    {
                        shape: "box",
                        material: "fleisch",
                        size: { x: 0.6, y: 0.7, z: 0.3 },
                        position: { x: 0, y: 0.45, z: 0 },
                        label: "Torso",
                    },
                    {
                        shape: "sphere",
                        material: "knochen",
                        size: { x: 0.38, y: 0.38, z: 0.38 },
                        position: { x: 0, y: 1.0, z: 0 },
                        label: "Kopf",
                    },
                    {
                        shape: "cylinder",
                        material: "fleisch",
                        size: { x: 0.16, y: 0.7, z: 0.16 },
                        position: { x: 0.42, y: 0.5, z: 0 },
                        label: "Arm rechts",
                    },
                    {
                        shape: "cylinder",
                        material: "fleisch",
                        size: { x: 0.16, y: 0.7, z: 0.16 },
                        position: { x: -0.42, y: 0.5, z: 0 },
                        label: "Arm links",
                    },
                    {
                        shape: "cylinder",
                        material: "knochen",
                        size: { x: 0.18, y: 0.8, z: 0.18 },
                        position: { x: 0.17, y: -0.05, z: 0 },
                        label: "Bein rechts",
                    },
                    {
                        shape: "cylinder",
                        material: "knochen",
                        size: { x: 0.18, y: 0.8, z: 0.18 },
                        position: { x: -0.17, y: -0.05, z: 0 },
                        label: "Bein links",
                    },
                ],
            },
        };
        return this._playerSoulDefsCache;
    }

    // Compound-Tags der Seele wie `computeCompoundTags(blueprint)`: je Body-Part `computePartTags`
    // (Form × Material), dann MAX über alle Teile. Leere `bodyParts` → leere Tags.
    computeSoulCompoundTags(soulDef) {
        if (!soulDef || !Array.isArray(soulDef.bodyParts) || soulDef.bodyParts.length === 0) {
            return {};
        }
        return this.computeCompoundTags({ parts: soulDef.bodyParts });
    }

    // addPlayerBoost({source, tagDelta, durationSeconds, label}). Sources: "emotion:<axis>" +
    // "world:resonance" (auto via tickPlayerBoosts) · "consume:<name>" (DSL-Op `apply_boost`).
    // Gleiche source verlängert expiresAt statt eines zweiten Eintrags.
    addPlayerBoost(spec) {
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
        if (!Array.isArray(this.state.player.boosts)) this.state.player.boosts = [];
        const existing = this.state.player.boosts.find((b) => b.source === source);
        if (existing) {
            existing.expiresAt = expiresAt;
            existing.tagDelta = tagDelta;
            existing.label = label;
        } else {
            this.state.player.boosts.push({ source, tagDelta, expiresAt, label });
        }
        this.recomputePlayerStats();
        return true;
    }

    // 1×/s aus dem Game-Loop: (1) Abgelaufene entfernen, (2) Emotions-Achsen >0.7 → Tag-Delta,
    // (3) nahe Signature-Struktur → Resonanz-Bonus. Bei Änderung EINMAL `recomputePlayerStats`.
    tickPlayerBoosts(currentTime) {
        if (!this.state.player) return;
        if (currentTime - (this.state.player.boostLastTick || -Infinity) < 1.0) return;
        this.state.player.boostLastTick = currentTime;
        const now = performance.now() / 1000;
        let changed = false;
        if (!Array.isArray(this.state.player.boosts)) this.state.player.boosts = [];

        // (1) Ablauf
        const kept = this.state.player.boosts.filter((b) => b.expiresAt > now);
        if (kept.length !== this.state.player.boosts.length) {
            this.state.player.boosts = kept;
            changed = true;
        }

        // (2) Emotion-Trigger
        const emotions = this.state.player.emotions || {};
        const threshold = this.state.player.emotionThreshold || 0.7;
        const lastTrig = this.state.player.boostLastTriggered || {};
        for (const axis of Object.keys(AnazhRealm.BOOST_EMOTION_TAG)) {
            const value = Number(emotions[axis]) || 0;
            const source = `emotion:${axis}`;
            const active = this.state.player.boosts.find((b) => b.source === source);
            if (value >= threshold && !active) {
                // Refract-Pause: nach Ablauf 60 s warten, bevor wir neu auslösen
                const lastEnded = lastTrig[source] || -Infinity;
                if (now - lastEnded < AnazhRealm.BOOST_EMOTION_REFRACT) continue;
                const def = AnazhRealm.BOOST_EMOTION_TAG[axis];
                this.state.player.boosts.push({
                    source,
                    tagDelta: { [def.tag]: def.delta },
                    expiresAt: now + AnazhRealm.BOOST_EMOTION_DURATION,
                    label: def.label,
                });
                changed = true;
            } else if (!active && lastTrig[source] === undefined) {
                // Initial-Mark für Refract — sonst würde lastEnded = -Infinity und
                // sofort wieder triggern können. Mark only on first see.
                lastTrig[source] = -Infinity;
            }
        }
        // Refract-Stempel setzen für gerade abgelaufene Boosts
        for (const b of kept) {
            if (b.expiresAt <= now && b.source.startsWith("emotion:")) {
                lastTrig[b.source] = now;
            }
        }

        // (3) Welt-Resonanz: in der Nähe einer Architektur mit
        // computeSpatialTags.resoniert >= WORLD_EFFECT_THRESHOLDS.resonance_signature.
        const playerPos = this.state.playerMesh ? this.state.playerMesh.position : null;
        let resonant = false;
        if (playerPos && Array.isArray(this.state.architectures)) {
            const T = AnazhRealm.WORLD_EFFECT_THRESHOLDS;
            const radiusSq = AnazhRealm.BOOST_RESONANCE_RADIUS * AnazhRealm.BOOST_RESONANCE_RADIUS;
            // die Plätze um den Spieler (`_blockerUmPlatz`, in der Ordnung des Bestands) — vorher jeder Eintrag je Sekunde
            const nahe = this._boostNahe || (this._boostNahe = []);
            nahe.length = 0;
            this._blockerUmPlatz(playerPos.x, playerPos.z, AnazhRealm.BOOST_RESONANCE_RADIUS + 1e-6, nahe);
            for (const entry of nahe) {
                if (!entry || !entry.position) continue;
                const dx = entry.position.x - playerPos.x;
                const dz = entry.position.z - playerPos.z;
                if (dx * dx + dz * dz > radiusSq) continue;
                const bp = this.state.blueprints && this.state.blueprints[entry.type];
                if (!bp) continue;
                const sTags = this.computeSpatialTags ? this.computeSpatialTags(bp) : this.computeCompoundTags(bp);
                if ((sTags.resoniert || 0) >= T.resonance_signature) {
                    resonant = true;
                    break;
                }
            }
        }
        const activeRes = this.state.player.boosts.find((b) => b.source === "world:resonance");
        if (resonant) {
            // Refresh-while-in-range: jede Sekunde 3 s in die Zukunft setzen.
            if (activeRes) {
                activeRes.expiresAt = now + 3;
            } else {
                this.state.player.boosts.push({
                    source: "world:resonance",
                    tagDelta: { resoniert: AnazhRealm.BOOST_RESONANCE_DELTA },
                    expiresAt: now + 3,
                    label: AnazhRealm.BOOST_RESONANCE_LABEL,
                });
                changed = true;
            }
        }

        if (changed) {
            this.recomputePlayerStats();
        }
        // UI 1×/s refreshen, damit die Boost-Restzeit sichtbar tickt — auch
        // wenn sich an Boost-Bestand selbst nichts geändert hat (Counter läuft).
    }

    // Welle 6.D Etappe 3a — Schaden zufügen. Quellen: DSL-Op `damage`,
    // zukünftige Welt-Hazards (6.G), feindliche Kreaturen (6.H). HP-Reduktion
    // wird durch heatResist (für Feuer/Hitze-Quellen) gedämpft.
    damagePlayer(amount, source) {
        if (!this.state.player || typeof amount !== "number" || !Number.isFinite(amount)) return false;
        const value = Math.max(0, Math.min(1000, amount));
        if (value === 0) return false;
        // Modus-Gate: in frieden und schöpfer wird Schaden stumm verworfen (kein Log-Spam); hp und
        // Todes-Pfad bleiben unangefasst.
        const mode = this.getGameMode ? this.getGameMode() : "frieden";
        if (mode !== "pfad") return false;
        // Respawn-Gnade: kein doppelter Tod (Spieler ist unverwundbar während der Heilungs-Phase, das ist Teil der Mythos) —
        // auf der Spiel-Uhr (`spielZeit`, halten.K5): auf der Wanduhr endete sie unter Last früher als die Takte der Jäger.
        const now = this.state.spielZeit;
        if ((this.state.player.respawnGraceUntil || -Infinity) > now) return false;
        // Resistenz: feuer/hitze-Quellen werden durch heatResist gedämpft.
        const stats = this.state.player.stats || {};
        let scaled = value;
        if (typeof source === "string" && /heat|fire|feuer|hitze|flame|glut/i.test(source)) {
            const resist = Math.max(0, Math.min(0.9, stats.heatResist || 0));
            scaled = value * (1 - resist);
        }
        // Kreatur-Schläge (jagd/gegenwehr) dämpft die Rüstung — DASSELBE Gesetz wie bei den Wesen (_ruestungDaempft).
        // Andere Quellen (Fall/Hitze/Welt) bleiben ungedämpft.
        const creatureStrike = source === "jagd" || source === "gegenwehr";
        if (creatureStrike) scaled = this._ruestungDaempft(scaled, stats.defense);
        const hpBefore = Number(this.state.player.hp) || 0;
        const hp = Math.max(0, hpBefore - scaled);
        this.state.player.hp = hp;
        // die Wunde als Stoß des Leibs: das Rumble (`_rumbleTakt`) ∝ Schaden je Lebenskraft × die Wunden-Verstärkung des Pads
        this.state.player._stoss = Math.max(
            this.state.player._stoss || 0,
            Math.min(1, (scaled / Math.max(1, stats.hpMax || 0)) * AnazhRealm.PAD_GESETZ.rumble.wunde)
        );
        // V17.30 — Schaden/Gefahr hebt sorrow + chaos (akut; die chronische
        // Wund-Dread trägt der ZUSTAND-Kanal in updatePlayerEmotions).
        this._feelAction("damage");
        // Furcht: gejagt + niedrige HP → der damage-Affekt wächst, je tiefer die HP sinken
        // (sorrow+chaos via ACTION_TO_EMOTION.threatened).
        if (creatureStrike) {
            const hpFrac = stats.hpMax > 0 ? hp / stats.hpMax : 1;
            if (hpFrac < AnazhRealm._verhaltenGesetz().jagd.fearHpFrac) {
                this._feelAction("threatened", { magnitude: 1 + (1 - hpFrac) });
            }
        }
        this.log(
            `Schaden ${scaled.toFixed(1)} (${source || "unbekannt"}) → HP ${hp.toFixed(0)}/${stats.hpMax || 0}`,
            "INFO"
        );
        if (hp <= 0) this._playerDeathRespawn(source);
        return true;
    }

    // Tod feld-nativ: HP=0 → _depositLife merkt den Ort, der Körper bleibt DERSELBE (Identität), Rückkehr
    // am Genesis-Anker; deathWoundIntensity trägt die Wunde als Stat-Penalty, respawnGraceUntil verhindert
    // Ping-Pong-Tod auf der Spiel-Uhr (`spielZeit`). Deterministisch.
    _playerDeathRespawn(source) {
        const now = this.state.spielZeit;
        if ((this.state.player.respawnGraceUntil || -Infinity) > now) return;
        this.state.player.respawnGraceUntil = now + AnazhRealm.RESPAWN_GRACE_SEC;
        // Welt-Trauer: zwei Achsen schwingen mit — Tod ist Verlust + Rückkehr.
        if (this.state.player.emotions) {
            this.state.player.emotions.sorrow = Math.min(1, (this.state.player.emotions.sorrow || 0) + 0.3);
            this.state.player.emotions.awe = Math.min(1, (this.state.player.emotions.awe || 0) + 0.2);
        }
        this.state.player.deathWoundIntensity = 1.0;
        // Der Tod steigt ab — am Ort, wie dismountArchitecture: der Körper kehrt am Anker wieder, das Gefährt bleibt,
        // wo er fiel (Leben-Prüfung V-k8: der Sattel riss den Wagen 85 m mit, er stand unter der Plattform).
        if (this.state.player.mountedArch !== null && this.state.player.mountedArch !== undefined) {
            this.dismountArchitecture();
        }
        // Das dritte Verb: der Todesort trägt eine Lebens-Spur ins Feld.
        const pm = this.state.playerMesh;
        if (pm && pm.position && typeof this._depositLife === "function") {
            this._depositLife(pm.position.x, pm.position.z);
        }
        // Rückkehr am Genesis-Anker (die Start-Plattform, `_genesisPlattform` — die EINE Quelle des Genesis-Orts); ohne
        // Anker der offene Spawn-Spot.
        const anchor = this._genesisPlattform();
        let ax = 0;
        let az = 0;
        let ay = null;
        if (anchor) {
            ax = anchor.position.x;
            az = anchor.position.z;
            ay = anchor.position.y + 2.2;
        } else if (typeof this._findOpenSpawnSpot === "function") {
            const spot = this._findOpenSpawnSpot();
            ax = spot.x;
            az = spot.z;
        }
        const surf = this.getTerrainHeightAt(ax, az);
        const safeY = Math.max(Number.isFinite(surf) ? surf + 2.0 : 2.0, ay || -Infinity);
        if (pm) {
            pm.position.set(ax, safeY, az);
            if (this.state.playerVel) this.state.playerVel.setValue(0, 0, 0);
            this.state._fieldVy = 0;
        }
        // Die Lebenswerte kehren voll zurück (das Maximum der verwundeten Gestalt) — die WUNDE (Stat-Penalty,
        // 10-min-Regen) trägt die Erinnerung, nicht ein HP-Malus.
        this.recomputePlayerStats({ voll: true });
        this.journalAppend(
            "loss",
            AnazhRealm._datum`Der Körper fiel ${source ? `(${source}) ` : ""}— am Ursprung kehrt er wieder.`,
            {
                source: source || null,
                at: now,
            }
        );
        this.log(`Tod (${source || "unbekannt"}) → Rückkehr am Anker (${ax.toFixed(0)}, ${az.toFixed(0)})`, "INFO");
    }

    // 1×/s Vitals-Tick: Wunden-Regen (10 min Erinnerung), Stamina-Regen,
    // Mana-Regen (magieleitungs-gehoben). ALTLASTEN-NULL: der Phönix-Timer ist
    // gefallen — der Tod lebt in _playerDeathRespawn, die Vitals hier.
    tickPlayerVitals(currentTime) {
        if (!this.state.player) return;
        if (currentTime - (this.state.player.deathLastTick || -Infinity) < 1.0) return;
        const dt = Math.max(0.1, Math.min(10, currentTime - this.state.player.deathLastTick));
        this.state.player.deathLastTick = currentTime;
        // Welle 6.D Etappe 3a+ — Wunde regenerieren UNABHÄNGIG von der
        // Respawn-Rückkehr. Die Stat-Wunde bleibt 10 min als Erinnerung.
        const woundIntensity = this.state.player.deathWoundIntensity || 0;
        if (woundIntensity > 0) {
            const regenRate = 1 / (this.state.player.deathWoundRegenSeconds || 600);
            this.state.player.deathWoundIntensity = Math.max(0, woundIntensity - regenRate * dt);
            this.recomputePlayerStats(); // Stat-Penalty sinkt sichtbar
        }
        // Welle 6.D Etappe 3a+ — Stamina-Regen (immer, nicht nur in Wandlung).
        // Linear bis staminaMax. Verbraucht durch applyOpToPart u. a.
        const staMax = this.state.player.staminaMax || 100;
        const sta = this.state.player.stamina || 0;
        // SCHWIMM-HEIMAT — unter Wasser ruht der Regen (die Züge zehren, das
        // Wasser gibt nichts zurück); an Land byte-alt. EIN Regen-Chokepoint.
        if (sta < staMax && !this.state.playerUnderwater) {
            const rate = AnazhRealm.STAMINA_REGEN_PER_SEC;
            this.state.player.stamina = Math.min(staMax, sta + rate * dt);
        }
        // Mana-Regen symmetrisch zu Stamina: Base 3/s (Stamina 5/s — Mana ist mächtiger); Magieleitung im
        // Spieler-Compound hebt die Rate.
        const manaMax = this.state.player.manaMax || 0;
        const mana = this.state.player.mana || 0;
        if (manaMax > 0 && mana < manaMax) {
            const magBoost =
                (this.state.player.stats &&
                    this.state.player.stats.tags &&
                    this.state.player.stats.tags.magieleitung) ||
                0;
            const manaRate = AnazhRealm.MANA_REGEN_PER_SEC * (1 + magBoost);
            this.state.player.mana = Math.min(manaMax, mana + manaRate * dt);
        }
    }

    // Welle 6.D Etappe 1.6 — Seele auflösen: erst Built-in, dann Custom.
    // Single-Pfad für alle Lese-Stellen (computePlayerStats, applyPlayerSoul,
    // renderPlayerStatsUI). Gibt null zurück wenn unbekannt.
    _getSoulDef(name) {
        if (!name) return null;
        if (this.playerSoulDefs[name]) return this.playerSoulDefs[name];
        if (this.state.customSouls && this.state.customSouls[name]) return this.state.customSouls[name];
        return null;
    }

    // Benannte Anker einer Compound-Seele (Built-ins, Customs, Peers): `userData.parts` (head ·
    // left/rightArm · left/rightWing · left/rightLeg) aus `computeMotionRoles`. Konsumenten: Kopf-Hide in
    // 1st-Person + Hand-Anker (`_refreshHeldMesh`: leftArm||leftWing). side +1 = px>0 = rechts;
    // kein Treffer → parts leer (die Hand fällt auf die Körper-Wurzel).
    _stampSoulPartRefs(group, bodyParts) {
        if (!group || !group.userData || !Array.isArray(bodyParts) || !Array.isArray(group.children)) return;
        const roles = this.computeMotionRoles(bodyParts);
        if (!roles) return;
        const parts = {};
        const SLOT = { kopf: "head", arm: "Arm", fluegel: "Wing", bein: "Leg" };
        for (let i = 0; i < roles.length && i < group.children.length; i++) {
            const r = roles[i];
            if (!r || !SLOT[r.role]) continue;
            const child = group.children[i];
            if (!child) continue;
            if (r.role === "kopf") {
                if (!parts.head) parts.head = child;
                continue;
            }
            const key = (r.side < 0 ? "left" : "right") + SLOT[r.role];
            if (!parts[key]) parts[key] = child;
        }
        if (Object.keys(parts).length) group.userData.parts = parts;
    }

    // Klont die bodyParts der Quell-Seele als voll editierbare Custom-Seele.
    cloneSoulToCustom(sourceName, newName) {
        const source = this._getSoulDef(sourceName);
        if (!source || !Array.isArray(source.bodyParts)) {
            return { ok: false, reason: "source_unknown" };
        }
        // Deep-Copy der bodyParts, damit Edits an der Kopie das Original
        // (besonders Built-ins!) nicht berühren.
        const cloned = source.bodyParts.map((p) => JSON.parse(JSON.stringify(p)));
        return this.createOrUpdateSoulFromDsl(newName, cloned);
    }

    // Eine Custom-Seele löschen. Wenn der Spieler aktuell diese Seele trägt,
    // schalten wir zurück auf "human" (Default-Seele).
    deleteCustomSoul(name) {
        if (!this.state.customSouls || !this.state.customSouls[name]) {
            return { ok: false, reason: "not_found" };
        }
        delete this.state.customSouls[name];
        if (this.state.player.soul === name) {
            this.applyPlayerSoul("human");
        }
        if (typeof this._refreshSoulSelect === "function") this._refreshSoulSelect();
        return { ok: true };
    }

    // Ein Body-Part an eine bestehende Custom-Seele anhängen. Wenn der
    // Spieler aktuell diese Seele trägt, werden Mesh + Stats neu gebaut.
    addPartToCustomSoul(soulName, part) {
        const soul = this.state.customSouls && this.state.customSouls[soulName];
        if (!soul) return { ok: false, reason: "soul_not_found" };
        const newParts = soul.bodyParts.concat([part]);
        const valid = this.validateBlueprintParts(newParts);
        if (!valid.ok) return { ok: false, reason: valid.reason };
        soul.bodyParts = valid.parts;
        this._refreshIfWornSoul(soulName);
        return { ok: true };
    }

    // Ein Body-Part einer Custom-Seele bearbeiten. `patch` enthält die Felder,
    // die überschrieben werden sollen (shape/material/position/size).
    updatePartInCustomSoul(soulName, idx, patch) {
        const soul = this.state.customSouls && this.state.customSouls[soulName];
        if (!soul) return { ok: false, reason: "soul_not_found" };
        if (idx < 0 || idx >= soul.bodyParts.length) return { ok: false, reason: "index_out_of_range" };
        const next = soul.bodyParts.slice();
        next[idx] = { ...next[idx], ...patch };
        const valid = this.validateBlueprintParts(next);
        if (!valid.ok) return { ok: false, reason: valid.reason };
        soul.bodyParts = valid.parts;
        this._refreshIfWornSoul(soulName);
        return { ok: true };
    }

    // Ein Body-Part entfernen. Wenn das letzte Part entfernt würde, ablehnen
    // (eine Seele braucht mindestens einen Körper-Teil).
    removePartFromCustomSoul(soulName, idx) {
        const soul = this.state.customSouls && this.state.customSouls[soulName];
        if (!soul) return { ok: false, reason: "soul_not_found" };
        if (soul.bodyParts.length <= 1) return { ok: false, reason: "would_be_empty" };
        if (idx < 0 || idx >= soul.bodyParts.length) return { ok: false, reason: "index_out_of_range" };
        soul.bodyParts = soul.bodyParts.slice(0, idx).concat(soul.bodyParts.slice(idx + 1));
        this._refreshIfWornSoul(soulName);
        return { ok: true };
    }

    // Wenn der Spieler die geänderte Seele aktuell trägt: Mesh + Stats
    // refreshen. Sonst nur stille Daten-Mutation.
    _refreshIfWornSoul(soulName) {
        if (this.state.player.soul === soulName) {
            // applyPlayerSoul re-baut Mesh + ruft recomputePlayerStats.
            this.applyPlayerSoul(soulName);
        }
    }

    // Rüstung am Avatar: die getragene armor als Kind-Gruppe der Soul-Group über denselben
    // `_buildFromBlueprint`-Pfad. Lazy: rebuild NUR beim Wechsel (equipped.armor !== _wornArmor).
    // Die Gruppe hängt am ENDE der children, sonst bricht der Motion-Vertrag (roles[i]↔kids[i]).
    _tickWornArmorVisual() {
        const pm = this.state.playerMesh;
        const p = this.state.player;
        if (!pm || !p) return;
        const worn = (p.equipped && p.equipped.armor) || null;
        if (pm.userData._wornArmor === worn) return;
        if (pm.userData._wornArmorMesh) {
            pm.remove(pm.userData._wornArmorMesh);
            pm.userData._wornArmorMesh = null;
        }
        pm.userData._wornArmor = worn;
        if (!worn) return;
        const bp = this.state.blueprints && this.state.blueprints[worn];
        if (!bp || bp.role !== "armor" || typeof this._buildFromBlueprint !== "function") return;
        try {
            const g = this._buildFromBlueprint(bp, 0, new Set());
            if (!g) return;
            const ext = typeof this._compoundVisualExtent === "function" ? this._compoundVisualExtent(bp) : null;
            // Generischer FIT für JEDEN Bauplan: Träger-Torso-Hülle (1.15 m hoch · ~0.95 m breit) ÷ Werk-Hülle,
            // Höhe UND Breite deckeln. Das Hüllen-Feld heißt `dy`, nicht `ext.y`.
            let sc = 0.96;
            if (ext) {
                const dy = Math.max(0.01, ext.dy || 0);
                const dw = Math.max(0.01, ext.dx || 0, ext.dz || 0);
                sc = Math.max(0.25, Math.min(3, Math.min(1.15 / dy, 0.95 / dw)));
            }
            g.scale.setScalar(sc);
            // Den TRAGE-Punkt (Masse-Zentrum bzw. expliziter trage-Punkt) auf den Torso-Anker (0, 0.18, 0) legen,
            // nicht den Bauplan-Ursprung — ein um y≈1.1 designter Brustpanzer landete sonst auf Kopfhöhe.
            const ap = this._attachPointFor(bp, "trage");
            g.position.set(-ap.point.x * sc, 0.18 - ap.point.y * sc, -ap.point.z * sc);
            g.userData._wornArmorVisual = true;
            g.traverse((o) => {
                o.castShadow = false;
                o.receiveShadow = false;
            });
            pm.add(g);
            pm.userData._wornArmorMesh = g;
        } catch (_e) {
            this._stoffBruch("die Rüstungs-Optik " + worn, _e);
        }
    }

    // Welle 6.D Etappe 3b — Bauplan als Rüstung markieren. Analog zu
    // `set_tool_meta`/`register_tool`: ein eigener Bauplan kann mit
    // role:"armor" markiert werden, danach equipbar via `equipArmor`.
    setBlueprintAsArmor(name) {
        const bp = this.state.blueprints && this.state.blueprints[name];
        if (!bp) return { ok: false, reason: "blueprint_unknown" };
        if (bp.builtIn) return { ok: false, reason: "cannot_modify_builtin" };
        bp.role = "armor";
        // Welle 9a — manuellen Override merken damit emergente Berechnung
        // diesen Bauplan in Ruhe lässt
        bp.roleManual = true;
        return { ok: true, name };
    }

    // M5 (V18.157) — die Markierung LÖSEN: roleManual fällt, die Rolle EMERGIERT
    // wieder aus der Substanz. Macht den Rollen-Chip-Tooltip („zurücksetzen via
    // Markier-Sektion") WAHR — die alte Sektion hatte nie einen Reset (toter Verweis).
    resetBlueprintRole(name) {
        const bp = this.state.blueprints && this.state.blueprints[name];
        if (!bp) return { ok: false, reason: "blueprint_unknown" };
        if (bp.builtIn) return { ok: false, reason: "cannot_modify_builtin" };
        delete bp.roleManual;
        delete bp.role;
        this._refreshBlueprintRoleEmergent(name);
        return { ok: true, name, role: bp.role };
    }

    // Bauplan als WELT-WERKSTATT markieren: die Werkstatt-Natur ist Intent, kein Substanz-Signal (Esse und
    // dichtes Bauwerk sind Substanz-Zwillinge) — die Designation ist Geste, die bediente DOMÄNE emergiert
    // (`_computeWorkshopDomain`). Spiegel von setBlueprintAsArmor; nur eigene Baupläne.
    setBlueprintAsWorkshopStation(name) {
        const bp = this.state.blueprints && this.state.blueprints[name];
        if (!bp) return { ok: false, reason: "blueprint_unknown" };
        if (bp.builtIn) return { ok: false, reason: "cannot_modify_builtin" };
        bp.role = "workshop-station";
        bp.roleManual = true;
        return { ok: true, name, domain: this._computeWorkshopDomain(bp) };
    }

    // Bauplan als Waffe markieren (Spiegel von setBlueprintAsArmor): role:"weapon" + roleManual, die
    // Emergenz lässt die Rolle in Ruhe. Das Kampf-Profil (damage/knockback/attackSpeed) emergiert beim
    // Ausrüsten aus den Compound-Tags.
    setBlueprintAsWeapon(name) {
        const bp = this.state.blueprints && this.state.blueprints[name];
        if (!bp) return { ok: false, reason: "blueprint_unknown" };
        if (bp.builtIn) return { ok: false, reason: "cannot_modify_builtin" };
        bp.role = "weapon";
        bp.roleManual = true;
        return { ok: true, name };
    }

    // EIN gehaltenes Gerät: equipHeld nimmt JEDEN Bauplan (kein Rollen-Schloss); sein form-bewusstes
    // Profil bestimmt, was es kann. recomputePlayerStats faltet seine Tags mit HELD_STAT_WEIGHT; Abbauen
    // und Angriff lesen DASSELBE Gerät.
    equipHeld(name) {
        if (!this.state.player) return { ok: false, reason: "no_player" };
        const eq = (this.state.player.equipped = this.state.player.equipped || { held: null, armor: null });
        if (!name) {
            eq.held = null;
            this.recomputePlayerStats();
            this._refreshHeldMesh(); // S9 — die Hand-Optik leeren
            this._refreshIchIfOpen(); // M5 — Equip-Feedback ist instant
            return { ok: true, equipped: null };
        }
        // den Bauplan auflösen: ein direkter Bauplan ODER ein gecraftetes Werkzeug (name == Bauplan
        // bzw. über sourceBlueprint). builtIn-Crafting-Tools (hammer/feile, kein Bauplan) → abgelehnt
        // (sie sind die Werkstatt-Schicht, kein Welt-Gerät).
        let bpName = name;
        if (!(this.state.blueprints && this.state.blueprints[name])) {
            const tool = this.state.tools && this.state.tools[name];
            bpName = tool && tool.sourceBlueprint ? tool.sourceBlueprint : null;
        }
        if (!bpName || !this.state.blueprints[bpName]) return { ok: false, reason: "blueprint_unknown" };
        eq.held = bpName;
        this.recomputePlayerStats();
        this._refreshHeldMesh(); // S9 — das Gerät in der Hand sichtbar machen
        this._refreshIchIfOpen(); // M5 — Equip-Feedback ist instant
        return { ok: true, equipped: bpName };
    }

    // ===== UI-Puls: ein dirty(raum) → eine Render-Insel =====
    // Mechanik-Pfade melden nur `_uiDirty(raum)`; EIN rAF-gebündelter Puls rendert jede schmutzige Insel
    // GENAU EINMAL pro Frame (Set dedupt → kein Doppel-Render, kein vergessener Pfad). `isOpen` (optional)
    // skippt die Insel bei geschlossenem Raum; ohne rendert sie IMMER (verstecktes Drawer-DOM bleibt
    // frisch). Jede Insel läuft in try/catch — ein Wurf killt nicht den Puls der anderen.
    _uiRoomRegistry() {
        if (this._uiRooms) return this._uiRooms;
        const overlayOpen = () => {
            const o = typeof document !== "undefined" && document.getElementById("inventory-overlay");
            return !!o && o.style.display !== "none" && o.getAttribute("aria-hidden") !== "true";
        };
        const drawerOpen = (n) => {
            const d = typeof document !== "undefined" && document.querySelector(`.drawer[data-drawer="${n}"]`);
            return !!d && !d.hidden;
        };
        this._uiRooms = {
            // Ich: skip-when-closed (M5-verifiziert — der Open-Pfad rendert frisch).
            ich: { render: () => this.renderInventoryUI && this.renderInventoryUI(), isOpen: overlayOpen },
            // Hof: skip-when-closed (der V18.176-On-Open-Render im Drawer-Hook
            // macht das Öffnen selbst-genügsam → das hidden-DOM darf ruhen).
            hof: {
                render: () => this._renderCreatureListUI && this._renderCreatureListUI(),
                isOpen: () => drawerOpen("kreaturen"),
            },
        };
        return this._uiRooms;
    }

    // V17.57 W2-B — equipTool/equipWeapon sind jetzt ALIASE auf equipHeld (ein Slot, kein
    // Schloss). Die DSL-Ops, der Chat, die Persistenz-Restore + das Abnehmen routen darüber —
    // so bleibt die ganze bestehende API heil, während das Modell sich vereint.
    equipTool(name) {
        return this.equipHeld(name);
    }
    equipWeapon(name) {
        return this.equipHeld(name);
    }

    // Hand-Tausch: EIN Akt tauscht Haupt- ↔ Off-Hand; die Haupt-Hand läuft durch den EINEN equipHeld-Pfad
    // (Stats + Hand-Mesh), die Off-Hand ist reiner Bereitschafts-Slot (kein Schmiede-Gate).
    // Konsumenten: Key G (DEFAULT_KEYBINDINGS.swapHands) + Off-Hand-Slot neben der Hotbar.
    swapHands() {
        const p = this.state.player;
        if (!p) return { ok: false, reason: "no_player" };
        const eq = (p.equipped = p.equipped || { held: null, offhand: null, armor: null });
        const main = eq.held || null;
        const off = eq.offhand || null;
        if (!main && !off) return { ok: false, reason: "both_empty" };
        // tote Off-Hand (Bauplan inzwischen gelöscht) → fällt, statt zu duplizieren.
        if (off && !(this.state.blueprints && this.state.blueprints[off])) {
            eq.offhand = null;
            return { ok: false, reason: "offhand_unknown" };
        }
        eq.offhand = main;
        this.equipHeld(off); // null → leert die Haupt-Hand sauber (Stats + Mesh)
        if (typeof this._renderHotbarDOM === "function") this._renderHotbarDOM();
        return { ok: true, held: eq.held || null, offhand: eq.offhand || null };
    }

    // Das gehaltene Gerät SICHTBAR in der Hand über _buildFromBlueprint (kein Parallel-Pfad): ein Mesh am
    // Arm/Flügel des Avatars (schwingt über die Transform-Kette mit — kein per-Frame-Update), sonst an der
    // Körper-Wurzel. Liest state.player.equipped.held + state.playerMesh; gerufen aus equipHeld +
    // applyPlayerSoul (re-attach an den neuen Körper). Optik/Pose/Skala: AnazhRealm.HELD_MESH.
    _refreshHeldMesh() {
        const pm = this.state.playerMesh;
        if (!pm) return;
        // Vorhandenes Hand-Mesh DIESES Körpers abräumen (Equip-Wechsel). Beim Körper-Wechsel disposed
        // applyPlayerSoul den alten Körper samt heldMesh-Kind; der neue hat noch keins.
        const prev = pm.userData && pm.userData.heldMesh;
        if (prev) {
            if (prev.parent) prev.parent.remove(prev);
            this._disposeSoulGroup(prev);
            pm.userData.heldMesh = null;
        }
        // V18.109 — E8: auch das Off-Hand-Mesh räumen (derselbe Lifecycle).
        const prevOff = pm.userData && pm.userData.offhandMesh;
        if (prevOff) {
            if (prevOff.parent) prevOff.parent.remove(prevOff);
            this._disposeSoulGroup(prevOff);
            pm.userData.offhandMesh = null;
        }
        const eq = this.state.player && this.state.player.equipped;
        const parts = pm.userData && pm.userData.parts;
        const cfg = AnazhRealm.HELD_MESH;
        // EIN Bau-Helfer für beide Hände (Spiegel: links negiert die x-Offsets).
        const buildHand = (bpName, side) => {
            const bp = this.state.blueprints && this.state.blueprints[bpName];
            if (!bp || !Array.isArray(bp.parts) || !bp.parts.length) return null;
            // Studio-Gestalt in der Hand: löst der EINE Preset-Resolver den Bauplan auf (klinge_<id> → LIVE-Buch)
            // UND ist die Foundry-Gruppe warm, tragen Wrapper um die GETEILTE Studio-Geometrie die Optik; die
            // Parts bleiben unsichtbare Substanz-Wahrheit (Tags · Ω-PHYSIS · wield). "pending" → der Part-Bau
            // trägt sichtbar als Interim (die Hand ist nie leer); null → Part-Pfad byte-alt.
            const studio = this._heldFoundryGroup(bpName);
            const isStudio = !!(studio && studio !== "pending");
            const mesh = isStudio ? studio : this._buildFromBlueprint({ name: `held_${bpName}`, parts: bp.parts });
            // das Gerät in der Hand ist keine Haut: die Ich-Regel (_applyEgoSicht) lässt es sichtbar
            mesh.userData._gehalten = true;
            // Der Erst-Zeig-Stall (die V18.367-Klasse) fällt an der Erst-Zeichnung (`_configureRenderer`): die Hand
            // zeichnet ab dem Frame, in dem ihr Stoff gebaut und ihre Pipeline steht.
            // Anker: der Arm/Flügel der Seite (schwingt mit dem Walk-Cycle) wenn die Seele ihn
            // benennt, sonst die Körper-Wurzel (Custom-/Flug-Seelen).
            const anchor =
                (parts && (side === "left" ? parts.leftArm || parts.leftWing : parts.rightArm || parts.rightWing)) ||
                pm;
            // DIE WAHRE GRÖSSE (W5 Gegenstände): das Gerät erbt die Welt-Skala seines Ankers — der Studio-Mensch steht
            // als Baum in Studio-Einheiten unter einer 0,283-Gruppe, sein Handgelenk misst 0,26–0,28 Welt je Einheit.
            // Bis W5 skalierte die Hand im Anker-Raum: das Langschwert (Gesetzbuch 1,228 m) schrumpfte auf 0,62 Einheiten
            // × 0,27 = 0,17 m, ein Spielzeug im Faustinneren. Jetzt rechnet die Hand in WELT-Metern: die Studio-Gestalt
            // trägt ihre Gesetzbuch-Länge (die Schmiede baut in Metern — Masse, Balance und Reichweite rechnen damit),
            // ein Part-Bau seine Werkzeug-Spanne `targetSpanM`; der Anker-Faktor wird herausgeteilt.
            let ankerSkala = 1;
            try {
                anchor.updateWorldMatrix(true, false);
                const ws = anchor.getWorldScale(new THREE.Vector3());
                const m = (Math.abs(ws.x) + Math.abs(ws.y) + Math.abs(ws.z)) / 3;
                if (Number.isFinite(m) && m > 1e-4) ankerSkala = m;
            } catch (_e) {
                /* Anker ohne Welt-Matrix — Welt = Anker-Raum */
            }
            // die wahre Größe: die Studio-Gestalt in Metern, ein Part-Bau in der EINEN Skala, mit der er auch wiegt
            // (`_geraetWeltSkala`: die rotations-bewusste Spanne seiner Teile auf die Werkzeug-Spanne)
            mesh.scale.setScalar((isStudio ? 1 : this._geraetWeltSkala(bp)) / ankerSkala);
            const sx = side === "left" ? -1 : 1;
            // V18.110 — C7: der GRIFF-Punkt liegt in der Hand — das Mesh wird so
            // verschoben, dass der griffigste Part (bzw. der explizite griff-
            // Punkt) am Hand-Anker sitzt, nicht der Bauplan-Ursprung.
            const ms = mesh.scale && Number.isFinite(mesh.scale.x) ? mesh.scale.x : 1;
            // DIE FAUST (W5): ein Studio-Gerät im Handgelenk des Studio-Menschen (die Rig-Gelenke, `_buildHumanGroup`)
            // liegt, wie eine Hand greift — der Griff quer zum Unterarm durch die Faust, das Blatt zur Daumenseite und
            // `neigung` unter die Waagrechte (der entspannte Arm), die Schneide (Klinge) bzw. der Kopf (Axt, Hammer,
            // Spaten) in der Schwung-Ebene nach unten; der Bogen liegt mit seiner Länge im Griff. Die Gelenk-Achsen des
            // Handgelenks: −y zu den Fingern, +z nach vorn (Daumenseite), x quer. Vorher stand die Klinge mit 0,5 rad
            // Kipp den Unterarm hinauf (ein Handgelenk, um 160° überstreckt) — Messname: Haltung, Hand-Griff-Versatz.
            const rig = pm.userData && pm.userData.rig;
            const faust =
                isStudio &&
                !!rig &&
                ((rig.armR && anchor === rig.armR.wrist) || (rig.armL && anchor === rig.armL.wrist));
            if (faust) {
                // DIE HAND-MITTE kommt aus der Hand selbst (Ofen-Beipack: der Schwerpunkt der Hand-Haut im Hand-Raum) —
                // vorher eine Welt-Konstante der Hand vor Welle 5 (0,107 m fingerwärts); die neue Hand (kleiner, höher)
                // ließ den Griff 0,072 m neben ihr (gate:nervensystem-schmiede H-F). Ohne Mitte keine Faust: LAUT.
                const hm = rig.handMitte && rig.handMitte[anchor.name];
                if (!hm) {
                    this.log("FAUST: die Hand trägt keine Hand-Mitte (Ofen-Beipack handMitte) — kein Griff.", "ERROR");
                    return null;
                }
                const fo = { x: hm[0], y: hm[1], z: hm[2] };
                const art = mesh.userData && mesh.userData.heldArt;
                // Der Bogen steht rechtwinklig zum Unterarm (gestreckter Bogen-Arm: der Bogen senkrecht zum Pfeil), eine
                // Klinge oder ein Schaft `neigung` unter der Waagrechten des hängenden Arms.
                const ng = art === "bogen" ? 0 : cfg.neigung;
                const c = Math.cos(ng),
                    s = Math.sin(ng);
                const griff = new THREE.Vector3(0, -s, c); // die Griff-Achse: vorn, `neigung` hinab
                const oben = new THREE.Vector3(0, c, s); // quer dazu in der Schwung-Ebene, oben
                const quer = new THREE.Vector3(1, 0, 0);
                const B = new THREE.Matrix4();
                // Spalten = Bild der Template-Achsen X · Y · Z (rechtshändig).
                if (art === "bogen")
                    B.makeBasis(oben, griff, quer); // Länge Y im Griff, Sehne nach oben
                else if (art === "klinge")
                    B.makeBasis(griff, oben, quer.clone().negate()); // Klinge X, Schneiden-Ebene XY
                else B.makeBasis(griff, quer.clone().negate(), oben.clone().negate()); // Kopf +Z nach unten
                mesh.quaternion.setFromRotationMatrix(B);
                const gpT =
                    art === "bogen"
                        ? new THREE.Vector3(0, 0, 0)
                        : new THREE.Vector3((mesh.userData && mesh.userData.heldGripX) || 0, 0, 0);
                gpT.multiplyScalar(ms).applyQuaternion(mesh.quaternion);
                mesh.position.set(fo.x - gpT.x, fo.y - gpT.y, fo.z - gpT.z);
                anchor.add(mesh);
                return mesh;
            }
            const off = anchor === pm ? cfg.rootOffset : cfg.handOffset;
            // Der Griff der Studio-Gestalt kommt als DATEN (heldGripX aus dem LIVE-Buch). Template-Achse ist X
            // (Griff bei 0, Klinge nach +X) → rotation.z += π/2 (Euler XYZ: Z wirkt zuerst) stellt sie in die
            // Hand-Konvention (lange Achse +Y, Griff unten); (gripX,0,0) liegt danach bei (0,gripX,0) — dieselbe
            // Versatz-Formel wie der Part-Pfad (_attachPointFor), tilt bewusst nicht eingerechnet.
            const gp = isStudio
                ? { x: 0, y: (mesh.userData && mesh.userData.heldGripX) || 0, z: 0 }
                : this._attachPointFor(bp, "griff").point;
            const axisRot = isStudio && mesh.userData && mesh.userData.heldAxis === "x" ? Math.PI / 2 : 0;
            mesh.position.set(off.x * sx - gp.x * ms, off.y - gp.y * ms, off.z - gp.z * ms);
            mesh.rotation.set(cfg.tilt.x, cfg.tilt.y * sx, cfg.tilt.z * sx + axisRot);
            anchor.add(mesh);
            return mesh;
        };
        if (eq && eq.held) pm.userData.heldMesh = buildHand(eq.held, "right");
        if (eq && eq.offhand) pm.userData.offhandMesh = buildHand(eq.offhand, "left");
    }

    // Die EINE Quelle der gehaltenen Studio-Gruppe, drei-wertig wie _workshopStudioPreviewFrom:
    // THREE.Group (Wrapper via _workshopWrapFoundryGroup) · "pending" (Part-Bau bleibt sichtbar) · null
    // (Part-Pfad byte-alt). Cache-Schlüssel == Werkstatt/Welt (`_foundryKoerperKey`, Stufe 0) → ein Werkstatt-
    // Asset dient der Hand instant. Miss → GENAU EINE Anfrage + EIN _refreshHeldMesh bei Ankunft. Der
    // Wrapper zählt _liveRefs (LRU disposed nie Gehaltenes); _disposeSoulGroup gibt den Ref zurück.
    _heldFoundryGroup(bpName) {
        const preset =
            typeof this._foundryPresetForEntry === "function" ? this._foundryPresetForEntry({ type: bpName }) : null;
        const f = this._ensureAssetFoundry(); // der Chokepoint prüft das Regime selbst (N7.4-Muster)
        if (!f) return null;
        if (!f.ready || !f.recipes) {
            // Worker bootet / Buch kalt: die Hand hängt sich an die EINE Buch-Zusage und baut GENAU EINMAL neu, sobald das
            // Buch steht — bis dahin trägt der Part-Bau (die Hand ist nie leer).
            this._foundryWecker(f.buchDa, "hand", () => {
                try {
                    this._refreshHeldMesh();
                } catch (_e) {
                    this._stoffBruch("die Hand (Neubau nach dem Buch)", _e);
                }
            });
            return preset ? "pending" : null;
        }
        if (!preset) return null;
        // Same → Variante EXAKT wie die Werkstatt-Vorschau (W-A1) → derselbe Cache-Schlüssel (der EINE `_werkSame`).
        const bp = this.state.blueprints ? this.state.blueprints[bpName] : null;
        const variant = this._foundryVariantFor(this._werkSame(bp, bpName), preset);
        if (variant == null) return "pending"; // Buch ohne Gestalten-Budget: die Hand wartet (der Part-Bau trägt)
        // Der beim Guss gestempelte Charakter (bp.studioOv) reist in den Hand-Bau: der ov-Hash trennt den
        // Cache-Schlüssel (ungeprägt bleibt byte-alt), das ov geht als 4. Arg an _foundryRequest.
        const heldOv = this._artifactStudioOv(bp);
        // Stufe 0 — die Hand ist NAH (kindStages.weapon == [0]; für mehrstufige Arten ist 0 die reiche Stufe).
        const key = this._foundryKoerperKey(preset, variant, 0, heldOv);
        const group = this._foundryCacheGet(key);
        if (group === undefined) {
            // Der EINE Zug des Schlüssels (zog ihn schon die Werkstatt oder die Welt, hängt sich die Hand an): bei Ankunft
            // die Hand GENAU EINMAL neu (Cache-Treffer, kein Loop); nach Ablauf fragt der nächste Equip neu.
            this._foundryWecker(this._foundryZug(key, preset, variant, 0, heldOv, 0), "hand", (ok) => {
                if (!ok) return;
                try {
                    this._refreshHeldMesh();
                } catch (_e) {
                    this._stoffBruch("die Hand (Neubau nach der Lieferung)", _e);
                }
            });
            return "pending";
        }
        if (group === null || !group.children || !group.children.length) return null;
        const wrap = this._workshopWrapFoundryGroup(group); // EINE Wrapper-Quelle (W-A1)
        if (!wrap) return null;
        wrap.userData.foundryHeld = true;
        wrap.userData.heldPreset = preset;
        // V4(B)-Ref: die Hand hält die Quell-Geometrie lebendig — die LRU räumt sie erst
        // nach der Rückgabe (_disposeSoulGroup) wirklich frei.
        group._liveRefs = (group._liveRefs || 0) + 1;
        wrap.userData.foundrySrcGroup = group;
        // Griff + Achse als DATEN: die KIND_POLICY-Zeile deklariert die Template-Handachse (weapon: handAxis
        // "x"), das LIVE-Buch die Griff-Mitte (`fx.held.gripX`, im Kern aus stations(P) wie buildInstance).
        // Kein Dial-Raten im Wirt; Fallback ohne held-Feld: die Klingen-Formel s.griff/2, sonst 0.
        const rec = f.recipes[preset];
        const pol = rec && rec.kind ? AnazhRealm.KIND_POLICY[rec.kind] : null;
        const ax = !!(pol && pol.handAxis === "x");
        wrap.userData.heldAxis = ax ? "x" : "y";
        // Die Werk-Art als DATEN (fx.task.art aus dem LIVE-Buch: klinge · keil · graben · pick · bogen): die Faust legt
        // danach die Schneide bzw. den Kopf in die Schwung-Ebene und den Bogen längs in den Griff (`_refreshHeldMesh`).
        wrap.userData.heldArt = (rec && rec.fx && rec.fx.task && rec.fx.task.art) || null;
        const held = rec && rec.fx && rec.fx.held;
        const s = rec && rec.s;
        wrap.userData.heldGripX =
            held && Number.isFinite(held.gripX) ? held.gripX : ax && s && Number.isFinite(s.griff) ? s.griff * 0.5 : 0;
        return wrap;
    }

    // ── PRÄGUNG-WELT (Linse gate:praegung-welt) ──
    // Die Prägung REIST MIT DEM ARTEFAKT: beim Guss (_forgeMaterialAndFreeze · schöpfer-wield ·
    // confirmBuild) wird state.workshop.studioOv als `studioOv` auf Bauplan bzw. Welt-Eintrag gestempelt.
    // Die Welt-Chokepoints (_foundryFlattenFor · _heldFoundryGroup) lesen NUR den Stempel, nie den Kanal —
    // späteres präge ändert Bestehendes nicht. Reist im Snapshot + im place-DSL (spawn_blueprint Slot 6).

    // Der EINE deterministische ov-Hash: JSON-stabil (Schlüssel rekursiv sortiert) → FNV-1a 32 bit → hex +
    // Längen-Zweitdiskriminator (gegen stille 32-bit-Kollisionen). Trennt Cache-/Request-/Batch-Schlüssel
    // (leafKey) geprägter von ungeprägten Instanzen, in beide Richtungen. Bewusst OHNE "{" (die Cache-
    // Reinheits-Probe prüft „kein JSON-Key im Cache"). WeakMap-Memo je Objekt (Inhalt per Guss gefroren).
    _studioOvHash(ov) {
        if (!this._studioOvHashMemo) this._studioOvHashMemo = new WeakMap();
        const memo = this._studioOvHashMemo.get(ov);
        if (memo !== undefined) return memo;
        const stable = (v) => {
            if (v === null || typeof v !== "object") return JSON.stringify(v);
            if (Array.isArray(v)) return "[" + v.map(stable).join(",") + "]";
            return (
                "{" +
                Object.keys(v)
                    .sort()
                    .map((k) => JSON.stringify(k) + ":" + stable(v[k]))
                    .join(",") +
                "}"
            );
        };
        const s = stable(ov);
        let h = 0x811c9dc5;
        for (let i = 0; i < s.length; i++) {
            h ^= s.charCodeAt(i);
            h = Math.imul(h, 0x01000193);
        }
        const out = (h >>> 0).toString(16) + "." + s.length;
        this._studioOvHashMemo.set(ov, out);
        return out;
    }

    // Der EINE Lese-Punkt des Artefakt-Stempels (Bauplan ODER Welt-Eintrag): liefert
    // ein non-leeres plain object oder null (fail-closed gegen Müll-Formen — ein
    // manipulierter Save/Peer kann hier keinen Nicht-Objekt-Stempel einschleusen).
    _artifactStudioOv(obj) {
        const ov = obj ? obj.studioOv : null;
        if (!ov || typeof ov !== "object" || Array.isArray(ov)) return null;
        return Object.keys(ov).length ? ov : null;
    }

    // STEMPEL-Chokepoint des Gusses: friert die Werkstatt-Prägung (_workshopStudioOvFor) als
    // bp.studioOv ein (tiefe JSON-Kopie). Neuer Guss ohne Prägung räumt den Alt-Stempel; Nicht-Studio-
    // Baupläne bleiben byte-unberührt. __-Schlüssel (z. B. __tradition) reisen unangetastet mit.
    _stampStudioOv(bp, name) {
        if (!bp) return;
        const preset =
            typeof this._foundryPresetForEntry === "function"
                ? this._foundryPresetForEntry({ type: name || bp.name })
                : null;
        if (!preset) return;
        const ov = typeof this._workshopStudioOvFor === "function" ? this._workshopStudioOvFor(preset) : null;
        // dieselbe 8-KiB-Taille-Wand wie _deserializeBlueprint (`_stempelVon`): ein Riesen-Kanal stempelt gar nicht erst — sonst
        // lebte er live und würde beim Reload still gewaschen
        const stempel = AnazhRealm._stempelVon(ov);
        if (stempel) bp.studioOv = stempel;
        else if (bp.studioOv !== undefined) delete bp.studioOv;
    }

    // Werkstatt-Gate am Mach-Akt: ein domain-tragender Bauplan (forging → Esse, alchemy → Brennkolben)
    // verlangt im pfad-Modus die passende Welt-Werkstatt in WORKSHOP_PROXIMITY_M; domain-los oder
    // frieden/schöpfer überspringt (wie das Build-Gate); ohne Spieler-Position kein Check. Der WERK-KERN
    // _forgeMaterialAndFreeze zahlt + friert `forgedPrecision` ein; ausrüsten macht der Aufrufer.
    _makeStationGate(name) {
        const pm = this.state.playerMesh && this.state.playerMesh.position;
        if (!pm) return { ok: true };
        return this._workshopStationGate(name, { x: pm.x, y: pm.y, z: pm.z });
    }

    _forgeMaterialAndFreeze(name) {
        const bp = this.state.blueprints && this.state.blueprints[name];
        if (!bp) return { ok: false, reason: "blueprint_unknown" };
        const station = this._makeStationGate(name);
        if (!station.ok) {
            return { ok: false, reason: "no_workshop_station", neededDomain: station.neededDomain };
        }
        const gate = this._makeCostGate(name);
        if (!gate.ok) {
            return { ok: false, reason: "not_enough_material", missing: gate.missing || {}, cost: gate.cost || {} };
        }
        bp.forgedPrecision = this._compoundAvgPrecisionFromParts(bp.parts);
        // PRÄGUNG-WELT — der Guss stempelt: die JETZT aktive Werkstatt-Prägung friert
        // als bp.studioOv ein (der EINE Werk-Kern deckt schmieden/weben/fertigen).
        this._stampStudioOv(bp, name);
        // Frisch geschmiedet startet mit voller wear (REPAIR_TARGET_WEAR); Hiebe zehren sie, bei Erschöpfung
        // braucht es den Repair-Akt.
        bp.wear = AnazhRealm.REPAIR_TARGET_WEAR;
        if (typeof this._feelAction === "function") this._feelAction("create", { blueprint: name });
        return { ok: true, free: !!gate.free, forgedPrecision: bp.forgedPrecision };
    }

    // W5 (V18.192) — der EINE Lese-Punkt für wear (Migration-tolerant): ein
    // Bauplan ohne wear-Feld liest 1 (voll — alte Welten verlieren NICHTS,
    // jede Erst-Welt fängt voll an). Der Schreib-Pfad nutzt `_clampWear`.
    _blueprintWear(bp) {
        if (!bp || typeof bp !== "object") return 1;
        const w = Number(bp.wear);
        if (!Number.isFinite(w)) return 1;
        return Math.max(0, Math.min(1, w));
    }

    // W5 — clamp + write. Wenn wear ≤ 0, gilt das Gerät als verbraucht (der
    // Hieb wird verweigert, der Spieler bekommt den Repair-Aufruf).
    _setBlueprintWear(bp, value) {
        if (!bp) return 0;
        bp.wear = Math.max(0, Math.min(1, Number(value) || 0));
        return bp.wear;
    }

    // Verschleiß je Hieb = WEAR_PER_STRIKE_BASE × FLOOR / clamp(härte, FLOOR, CEIL)
    // (WEAR_HARDNESS_FLOOR · WEAR_HARDNESS_CEIL): harte Materialien zehren langsamer; CEIL klemmt
    // unrealistisch harte (sonst unzerstörbar), FLOOR deckelt den Verschleiß weicher Materialien. Ein Werk der Schmiede
    // zehrt aus der EINEN Stoff-Zeile seines Stoffs (schmiede werkStoff: der Werkstoff von Klinge, Kopf und Blatt, das Holz von
    // Keule und Bogen) — die Bronze-Axt schneller als die Stahl-Axt (halten.K3); vorher las es die Teile seines Spenders
    // (geraet_schwert, geraet_spitzhacke): zwei Raten für 22 Gestalten und jeden Stoff. Ein Eigenwerk liest seine Teile.
    _wearPerStrike(bp) {
        const werk = this._schmiedeWerk(bp);
        const stoff = werk ? this._geraetStoff(bp) : null;
        const zeile = stoff ? (this.state.materials || {})[stoff] : null;
        if (stoff && !zeile) this._bruchMelden("STOFF-ZEILE fehlt: das Werk aus „" + stoff + "“ zehrt ohne Härte");
        const tags = zeile ? zeile.tags : !werk && bp ? this.computeCompoundTags(bp) : null;
        const haerte = tags && typeof tags["härte"] === "number" ? tags["härte"] : 0.5;
        const floor = AnazhRealm.WEAR_HARDNESS_FLOOR;
        const ceil = AnazhRealm.WEAR_HARDNESS_CEIL;
        const norm = Math.max(floor, Math.min(ceil, haerte));
        // Härte normiert zu Verschleiß-Skalierung: floor → 1.0×, ceil → 1/3.
        const scale = floor / norm;
        return AnazhRealm.WEAR_PER_STRIKE_BASE * scale;
    }

    // DER STOFF DES GERÄTS (halten.K2 · K3): woraus der Teil ist, der am Ziel arbeitet — ein Werk der Schmiede ihr werkStoff
    // (Klinge, Kopf, Blatt; das Holz von Keule und Bogen), ein Eigenwerk der Stoff seines größten festen Teils (`_werkStoff`),
    // die leere Hand der Leib. Leser: der Verschleiß (`_wearPerStrike`) und der Treffer (`_trefferPaar`).
    _geraetStoff(bp) {
        if (!bp) return this._leibStoff(true);
        if (!this._schmiedeWerk(bp)) return this._werkStoff({ type: bp.name });
        const sc = globalThis.__schmiedeCore;
        if (typeof sc.werkStoff !== "function") AnazhRealm._kernPflichtBruch("schmiede:werkStoff");
        return sc.werkStoff(this._schmiedeGestalt(bp), this._artifactStudioOv(bp) || undefined);
    }

    // wear-Faktor auf den Treffer-Schaden des gehaltenen Geräts, linear: wear=0 → WEAR_STAT_FLOOR (0.3, nie 0 —
    // ein abgenutztes Werkzeug wirkt noch), wear=1 → 1.0. Der EINE Leser: _kampfKraft (Welle L, K-D6 — Klinge und Pfeil).
    _wearStatFactor(bp) {
        const w = this._blueprintWear(bp);
        const floor = AnazhRealm.WEAR_STAT_FLOOR;
        return floor + (1 - floor) * w;
    }

    // REPAIR-Akt für das gehaltene Gerät (kein DSL-Op, nur UI/API-Geste). Kosten = Voll-Bau-Kosten ×
    // REPAIR_COST_FRACTION × (1 − wear); schöpfer frei (Ledger-Fakt ohne Inventar-Abzug).
    // Liefert {ok, before, after, cost} oder Fehler-Reason.
    repairHeldDevice() {
        const heldName = this.state.player && this.state.player.equipped ? this.state.player.equipped.held : null;
        if (!heldName) return { ok: false, reason: "no_held_device" };
        const bp = this.state.blueprints && this.state.blueprints[heldName];
        if (!bp) return { ok: false, reason: "blueprint_unknown" };
        const before = this._blueprintWear(bp);
        if (before >= AnazhRealm.REPAIR_TARGET_WEAR - 0.001) {
            return { ok: false, reason: "already_full", wear: before };
        }
        // Schaden-Anteil (1 - wear) bestimmt den Material-Bedarf — eine
        // 50%-Abnutzung zahlt 25 % vom Voll-Bau (= 0.5 × REPAIR_FRACTION),
        // eine kaputte 47.5 % (= 0.95 × REPAIR_FRACTION).
        const damageFraction = AnazhRealm.REPAIR_TARGET_WEAR - before;
        const repairScale = AnazhRealm.REPAIR_COST_FRACTION * damageFraction;
        // Voll-Kosten holen — `computeBuildCost` liefert die Material-Tabelle.
        const fullCost = typeof this.computeBuildCost === "function" ? this.computeBuildCost(bp) || {} : {};
        const repairCost = {};
        for (const [mat, units] of Object.entries(fullCost)) {
            if (typeof units !== "number" || units <= 0) continue;
            const need = Math.max(1, Math.round(units * repairScale));
            repairCost[mat] = need;
        }
        // Modus: schöpfer = frei (kein Material-Zug), pfad/frieden = ehrlich zahlen.
        const mode = typeof this.getGameMode === "function" ? this.getGameMode() : "frieden";
        const free = mode === "schöpfer";
        if (!free) {
            // Bestand prüfen (alle Materialien gleichzeitig — atomar).
            const inv = (this.state.player && this.state.player.inventory) || {};
            const missing = {};
            for (const [mat, need] of Object.entries(repairCost)) {
                const have = inv[mat] || 0;
                if (have < need) missing[mat] = need - have;
            }
            if (Object.keys(missing).length > 0) {
                return { ok: false, reason: "not_enough_material", missing, cost: repairCost };
            }
            // Zahlen.
            for (const [mat, need] of Object.entries(repairCost)) {
                inv[mat] = (inv[mat] || 0) - need;
                if (inv[mat] <= 0) delete inv[mat];
            }
        }
        const after = this._setBlueprintWear(bp, AnazhRealm.REPAIR_TARGET_WEAR);
        if (typeof this.recomputePlayerStats === "function") this.recomputePlayerStats();
        if (typeof this._refreshIchIfOpen === "function") this._refreshIchIfOpen();
        if (typeof this._feelAction === "function") this._feelAction("repair", { blueprint: heldName });
        this.log(
            `Werkzeug repariert: „${bp.label || heldName}" → ${Math.round(after * 100)} % wear${
                free
                    ? " (schöpfer-frei)"
                    : ` · ${Object.entries(repairCost)
                          .map(([m, n]) => `${n}× ${m}`)
                          .join(", ")}`
            }.`,
            "INFO"
        );
        if (typeof this.saveState === "function") this.saveState();
        return { ok: true, before, after, cost: repairCost, free };
    }

    // S3 (kampf-plan §11.7, §10-F3) — das Gerät SCHMIEDEN: der WERK-Kern (Material + Präzision-Snapshot +
    // Affekt) + das gehaltene Gerät AUSRÜSTEN (equipHeld). Der Spiegel von „bauen" für gehaltene Geräte.
    // (equipHeld bleibt der freie GEBRAUCH; das Kosten-Tor sitzt hier im WERK-Akt.)
    forgeBlueprint(name) {
        const make = this._forgeMaterialAndFreeze(name);
        if (!make.ok) return make;
        const eq = this.equipHeld(name);
        return { ok: true, equipped: eq.equipped, free: make.free, forgedPrecision: make.forgedPrecision };
    }

    // „In die Hand nehmen": UNgeschmiedet in pfad/frieden → erst SCHMIEDEN (Material zahlen + Präzision
    // einfrieren); geschmiedet (forgedPrecision, reist im Snapshot) oder schöpfer → frei ausrüsten.
    // equipHeld bleibt das freie Low-Level-Primitiv (Restore/DSL/Chat/Aliase).
    wieldBlueprint(name) {
        if (!name) return this.equipHeld(null);
        const bp = this.state.blueprints && this.state.blueprints[name];
        if (!bp) return this.equipHeld(name); // unbekannt → equipHeld liefert die saubere Ablehnung
        const mode = typeof this.getGameMode === "function" ? this.getGameMode() : "frieden";
        if (Number.isFinite(bp.forgedPrecision) || mode === "schöpfer") {
            // Im schöpfer-Modus gibt es keinen Schmiede-Akt: der Griff zu einem UNgeschmiedeten Gerät IST sein
            // Guss → hier stempeln; ein geschmiedetes bleibt unangetastet.
            if (!Number.isFinite(bp.forgedPrecision) && mode === "schöpfer") this._stampStudioOv(bp, name);
            return this.equipHeld(name);
        }
        return this.forgeBlueprint(name);
    }

    // S4 (kampf-plan §11.7) — Rüstung SCHMIEDEN/WEBEN: derselbe WERK-Kern wie das Gerät, nur in den
    // armor-Slot ausgerüstet. Verlangt einen als Rüstung markierten Bauplan (role:"armor" — die Schutz-
    // Lesart, gesetzt via setBlueprintAsArmor); dann zahlt der Akt Material + friert die Präzision ein.
    forgeArmor(name) {
        const bp = this.state.blueprints && this.state.blueprints[name];
        if (!bp) return { ok: false, reason: "blueprint_unknown" };
        if (bp.role !== "armor") return { ok: false, reason: "not_marked_as_armor" };
        const make = this._forgeMaterialAndFreeze(name);
        if (!make.ok) return make;
        const eq = this.equipArmor(name);
        return { ok: true, equipped: eq.equipped, free: make.free, forgedPrecision: make.forgedPrecision };
    }

    // „Rüstung anlegen" (Spiegel von wieldBlueprint): UNgemacht in pfad/frieden → erst schmieden/weben
    // (zahlt + friert ein); gemacht (forgedPrecision) oder schöpfer → frei tragen. equipArmor bleibt das
    // freie Low-Level-Primitiv (Restore/DSL/Chat).
    wearArmor(name) {
        if (!name) return this.equipArmor(null);
        const bp = this.state.blueprints && this.state.blueprints[name];
        if (!bp) return this.equipArmor(name);
        const mode = typeof this.getGameMode === "function" ? this.getGameMode() : "frieden";
        if (Number.isFinite(bp.forgedPrecision) || mode === "schöpfer") return this.equipArmor(name);
        return this.forgeArmor(name);
    }

    // Trank BRAUEN: die Zutaten (Material-Kosten des Konsumable-Bauplans, z. B. `laub`) laufen durchs
    // Mach-Tor (pfad/frieden zahlen, schöpfer frei), DANN wirkt activateConsumable — kein Gratis-Boost.
    // activateConsumable bleibt das freie Low-Level-Primitiv (DSL/Chat/Tabellen-Tränke).
    brewConsumable(name) {
        const bp = this.state.blueprints && this.state.blueprints[name];
        if (!bp || bp.role !== "consumable") return { ok: false, reason: "not_a_consumable" };
        const station = this._makeStationGate(name);
        if (!station.ok) {
            return { ok: false, reason: "no_workshop_station", neededDomain: station.neededDomain };
        }
        const gate = this._makeCostGate(name);
        if (!gate.ok) {
            return { ok: false, reason: "not_enough_material", missing: gate.missing || {}, cost: gate.cost || {} };
        }
        const res = this.activateConsumable(name);
        return { ok: !!res.ok, reason: res.reason, free: !!gate.free };
    }

    // S4/S5/S6 (kampf-plan §11.5) — der EINE „Fertigen"-Akt der Werkstatt: routet nach der Rolle in den
    // richtigen Werk-Verb (Rüstung → weben, Seele → Körper formen, Trank → brauen, sonst → Gerät schmieden).
    // Der Keim der EINEN Werkstatt-Gebärmutter (§11.5) — ein Akt, rollen-gerecht.
    fertigeBlueprint(name) {
        const bp = this.state.blueprints && this.state.blueprints[name];
        if (bp && bp.role === "armor") return this.forgeArmor(name);
        if (bp && bp.role === "soul") return this.forgeAvatar(name);
        if (bp && bp.role === "consumable") return this.brewConsumable(name);
        // Ein Bauwerk wird gebaut, nicht gehalten (Welle L, V-k11): der Bau-Modus übernimmt (confirmBuild zahlt beim
        // Setzen); Schublade und Inventar schließen, damit das Phantom in der Welt steht. Der EINE Weg jedes Bauwerks —
        // Werkstatt-FERTIGEN und Rezeptbuch („Bauen") rufen ihn (Welle L Folge: das Rezeptbuch zahlte beim Fertigen UND
        // beim Setzen und legte das Werk ins Inventar). Kann das Setzen nicht tragen (`_bauVorabTor` in der Engstelle
        // `_bauModusFuer`: das Gesetz des Modus), sagt FERTIGEN es, statt in einen Bau-Modus zu führen, der nur abgelehnt
        // werden kann. DIE WAHL IST DER WILLE (bauen.K1): das Werk steht, wohin der Spieler vor dem Öffnen blickte — das
        // Setzen (`confirmBuild`, das EINE Mach-Tor) folgt im selben Akt; lehnt der Ort ab, spricht es und das Phantom bleibt
        // zum Zielen (F/Rechtsklick), sonst endet der Bau-Modus (das nächste Werk derselben Art liegt in der Hotbar).
        // Befund 22.10. (diag-werkstatt-weg, echte Eingaben): Werkstatt und Rezeptbuch verlangten nach der Wahl eine zweite
        // Bestätigung im Bau-Modus.
        if (bp && this._isPlaceableBlueprint(bp)) {
            const res = this._bauModusFuer(name);
            if (!res.ok) return res;
            this.closeAllDrawers();
            if (this.state.inventoryOpen) this.toggleInventoryOverlay(false);
            this.tickBuildMode();
            const steht = this.confirmBuild();
            if (steht) this._clearBuildMode();
            return { ok: true, bauModus: !steht, steht, slot: res.slot, free: !!res.free };
        }
        return this.forgeBlueprint(name);
    }

    // Rüstung ausrüsten. Akzeptiert null/leer für „abnehmen". Blueprint muss
    // mit role:"armor" markiert sein (via setBlueprintAsArmor). (Rüstung bleibt ein
    // eigener GETRAGENER Slot — sie ist nicht „in der Hand".)
    equipArmor(name) {
        if (!this.state.player) return { ok: false, reason: "no_player" };
        if (!name) {
            this.state.player.equipped = this.state.player.equipped || { held: null, armor: null };
            this.state.player.equipped.armor = null;
            this.recomputePlayerStats();
            this._refreshIchIfOpen(); // M5 — Equip-Feedback ist instant
            return { ok: true, equipped: null };
        }
        const bp = this.state.blueprints && this.state.blueprints[name];
        if (!bp) return { ok: false, reason: "blueprint_unknown" };
        if (bp.role !== "armor") return { ok: false, reason: "not_marked_as_armor" };
        this.state.player.equipped = this.state.player.equipped || { held: null, armor: null };
        this.state.player.equipped.armor = name;
        this.recomputePlayerStats();
        this._refreshIchIfOpen(); // M5 — Equip-Feedback ist instant
        return { ok: true, equipped: name };
    }

    // Welle 6.D Etappe 3a — Konsumable definieren. Validiert tagBonus (nur
    // MATERIAL_TAG_KEYS, ge-clamp ±1), duration (0.5..600 s), Cap 32 eigene.
    createOrUpdateConsumable(name, tagBonus, durationSeconds, label) {
        if (typeof name !== "string" || name.length === 0 || name.length > 40) {
            return { ok: false, reason: "invalid_name" };
        }
        const safe = name.replace(/[^a-z0-9_-]/gi, "").slice(0, 40);
        if (!safe) return { ok: false, reason: "invalid_name_after_sanitize" };
        const cleanedBonus = {};
        if (tagBonus && typeof tagBonus === "object") {
            for (const tag of AnazhRealm.MATERIAL_TAG_KEYS) {
                const v = Number(tagBonus[tag]);
                if (Number.isFinite(v) && v !== 0) cleanedBonus[tag] = Math.max(-1, Math.min(1, v));
            }
        }
        if (Object.keys(cleanedBonus).length === 0) return { ok: false, reason: "no_tag_bonus" };
        const dur = Math.max(0.5, Math.min(600, Number(durationSeconds) || 30));
        if (!this.state.consumables) this.state.consumables = {};
        const existing = this.state.consumables[safe];
        const count = Object.keys(this.state.consumables).length;
        if (!existing && count >= 32) return { ok: false, reason: "too_many_consumables" };
        this.state.consumables[safe] = {
            name: safe,
            label: typeof label === "string" ? label.slice(0, 60) : safe.replace(/_/g, " "),
            tagBonus: cleanedBonus,
            durationSeconds: dur,
            createdAt: performance.now() / 1000,
        };
        return { ok: true, name: safe };
    }

    // Bauplan als Konsumabel markieren: die Wirkung emergiert aus der Komposition —
    // tagBonus = computeCompoundTags × scale (z. B. Wasser-Part + Pflanze-Part), keine Wert-Tabelle.
    setBlueprintAsConsumable(name, durationSeconds, label, scale) {
        const bp = this.state.blueprints && this.state.blueprints[name];
        if (!bp) return { ok: false, reason: "blueprint_unknown" };
        if (bp.builtIn) return { ok: false, reason: "cannot_modify_builtin" };
        const dur = Math.max(0.5, Math.min(600, Number(durationSeconds) || 30));
        const sc = Math.max(0.02, Math.min(1, Number(scale) || 0.2));
        bp.role = "consumable";
        // Welle 9a — manueller Role-Override (siehe setBlueprintAsArmor)
        bp.roleManual = true;
        bp.consumableMeta = {
            durationSeconds: dur,
            scale: sc,
            label: typeof label === "string" ? label.slice(0, 60) : bp.label || name,
        };
        return { ok: true, name };
    }

    // Bauplan als Welt-Portal: die Tor-Natur emergiert aus der Substanz (_isPortalShaped); diese Methode
    // bindet das ZIEL (portalMeta.world) und erzwingt die Rolle (roleManual = true), wie
    // setBlueprintAsConsumable/-Armor. Beim Betreten lädt die Welt im sandboxed iframe.
    setBlueprintAsPortal(name, portalMeta) {
        const bp = this.state.blueprints && this.state.blueprints[name];
        if (!bp) return { ok: false, reason: "blueprint_unknown" };
        if (bp.builtIn) return { ok: false, reason: "cannot_modify_builtin" };
        bp.role = "portal";
        // manuellen Override merken (siehe setBlueprintAsArmor)
        bp.roleManual = true;
        bp.portalMeta = this._sanitizePortalMeta(portalMeta, bp.label || name);
        // Stehende Einträge nachziehen: Affordances werden beim Spawn eingefroren — ein schon platziertes Tor
        // bliebe sonst bis zum Reload tot. Dieselbe EINE Quelle (computeBlueprintAffordances) je Eintrag.
        const arches = this.state.architectures;
        if (Array.isArray(arches)) {
            for (const entry of arches) {
                if (entry && entry.type === name) {
                    entry.affordances = this.computeBlueprintAffordances(bp);
                    this._blockerNetzSetzen(entry); // das Verzeichnis der Affordanzen
                }
            }
        }
        return { ok: true, name };
    }

    // Eigenen Bauplan auf eine registrierte Welt richten (per id oder Label): die Welt-Registry liefert
    // Pfad + Manifest, setBlueprintAsPortal verdrahtet — jeder Magie-Ring wird ein gezieltes Tor.
    aimBlueprintAtWorld(blueprintName, worldId) {
        const key = String(worldId || "")
            .trim()
            .toLowerCase();
        // W14 Phase 3 — Built-in-Registry UND importierte Welten als Ziel.
        let entry = this._worldEntry(key);
        if (!entry) {
            entry = this._libraryWorlds().find((w) => w.label.toLowerCase() === key);
        }
        if (!entry) return { ok: false, reason: "world_unknown" };
        const meta = {
            world: entry.world,
            label: entry.label,
            dsl: entry.dsl.slice(),
        };
        // V8.70 — die Vertrauensstufe der Welt mitgeben (sandboxed → das
        // Portal-iframe wird null-origin: eine echte fremde Engine läuft
        // voll, kann AnazhRealm aber nicht berühren).
        if (entry.trust) meta.trust = entry.trust;
        // KI-Übersetzer Phase 2 — eine aufgebaute übersetzte Welt teilt sich
        // den generischen Renderer worlds/translated/; die translatedWorldId
        // sagt ihm beim enter-Handshake, welche Szene er aufbauen soll.
        const custom = this.state.customWorlds && this.state.customWorlds[entry.id];
        if (custom && custom.translated) meta.translatedWorldId = entry.id;
        // multiplayer-Marke → das Portal lädt mit dem Transport-Shim und lädt beim Betreten die Gruppe ein;
        // `serverMode:"js-compute"` → ein Peer wird Compute-Host der autoritativen Server-JS.
        if (entry.multiplayer === true) meta.multiplayer = true;
        if (entry.serverMode === "js-compute") meta.serverMode = "js-compute";
        // W18-B — deklariert die Welt das Ko-Präsenz-Protokoll, trägt ihr
        // Portal die Marke: das Mesh wird ihre Multiplayer-Schicht.
        if (entry.coPresence === true) meta.coPresence = true;
        return this.setBlueprintAsPortal(blueprintName, meta);
    }

    // ===== Bibliothek =====
    // Die WORLD_REGISTRY als spieler-erreichbarer Ort: ein Klick legt einen Portal-Bauplan ins Inventar,
    // der Spieler platziert ihn und geht hindurch.

    // Portal-Bauplan für eine registrierte Welt: einmal pro Welt wird der Magie-Ring welt_portal nach
    // portal_<id> geklont (cloneBlueprint: nur Substanz, builtIn:false) und via aimBlueprintAtWorld
    // gerichtet; danach nur noch ins Inventar (addToInventory stackt) — eine Welt, ein Portal-Bauplan.
    obtainPortalForWorld(worldId) {
        const key = String(worldId || "")
            .trim()
            .toLowerCase();
        // W14 Phase 3 — Built-in-Registry UND importierte Welten.
        const entry = this._worldEntry(key);
        if (!entry) return { ok: false, reason: "world_unknown" };
        // Eine importierte Welt ohne erreichbare Dateien ergäbe ein Portal
        // ins Leere — kein Bauplan, ehrlicher Befund (der KI-Übersetzer
        // müsste die Welt-Dateien erst vendorn).
        if (this.state.customWorlds && this.state.customWorlds[key] && entry.reachable === false) {
            return { ok: false, reason: "world_unreachable" };
        }
        const bpName = `portal_${entry.id}`;
        // Bauplan einmal anlegen (Klon des portal-förmigen Magie-Rings).
        const justCloned = !this.state.blueprints || !this.state.blueprints[bpName];
        if (justCloned) {
            if (!this.cloneBlueprint("welt_portal", bpName)) {
                return { ok: false, reason: "clone_failed" };
            }
            this.state.blueprints[bpName].label = `Portal: ${entry.label}`;
        }
        // Immer (neu) ausrichten: danach trägt der Bauplan garantiert role "portal" + frisches portalMeta —
        // auch ein Portal, das seine Ausrichtung verlor, heilt so.
        const aim = this.aimBlueprintAtWorld(bpName, entry.id);
        if (!aim.ok) {
            if (justCloned) delete this.state.blueprints[bpName];
            return { ok: false, reason: aim.reason };
        }
        if (!this.addToInventory(bpName, 1)) {
            return { ok: false, reason: "inventory_full" };
        }
        // Die erste Entdeckung jeder Welt ist eine Erinnerung wert;
        // journalAppendOnce verhindert ein Fluten bei wiederholtem Holen.
        this.journalAppendOnce(
            `portalObtained:${entry.id}`,
            "growth",
            AnazhRealm._datum`Ein Tor zur ${entry.label} fand den Weg in deine Sammlung.`,
            { world: entry.id }
        );
        this.saveState();
        return { ok: true, blueprint: bpName, label: entry.label };
    }

    // Konsumable aktivieren = Boost mit Source `consume:<name>` (Dedupe: Doppelklick verlängert statt zu
    // duplizieren). Zuerst Bauplan mit role consumable (Compound-Tags), dann state.consumables-Tabelle.
    activateConsumable(name) {
        // Bauplan mit role:"consumable": tagBonus aus Compound-Tags × consumableMeta.scale (Default 0.2) —
        // Tags reichen bis 3, Boost-Deltas sollen 0..0.5 bleiben (spürbar, nicht dominant).
        const bp = this.state.blueprints && this.state.blueprints[name];
        if (bp && bp.role === "consumable") {
            // Welle 11 ext. — consumableMeta ist optional: eine emergente
            // Nahrung (lebendig+weich) oder ein alchemy-Domain-Bauplan trägt
            // keine Meta, ist aber dennoch essbar — Defaults greifen.
            const meta = bp.consumableMeta || {};
            const tags = this.computeCompoundTags(bp);
            const scale = meta.scale || 0.2;
            // V8.39 — Qualität skaliert die Trank-Stärke: ein grob gebrautes
            // Konsumable wirkt halb, ein fein gefertigtes voll.
            const qMul = 0.5 + 0.5 * this.computeBlueprintQuality(bp) * this._blueprintRoleFit(bp, "consumable");
            const tagBonus = {};
            for (const tag of Object.keys(tags)) {
                const v = tags[tag] * scale * qMul;
                if (Math.abs(v) > 0.001) tagBonus[tag] = Math.max(-1, Math.min(1, v));
            }
            if (Object.keys(tagBonus).length === 0) {
                return { ok: false, reason: "blueprint_has_no_tags" };
            }
            const ok = this.addPlayerBoost({
                source: `consume:${name}`,
                tagDelta: tagBonus,
                durationSeconds: meta.durationSeconds || 30,
                label: meta.label || bp.label || name,
            });
            return { ok };
        }
        // Pfad 2: alte Tabelle (state.consumables) — DSL-direktes Konsumabel
        const c = this.state.consumables && this.state.consumables[name];
        if (!c) return { ok: false, reason: "not_found" };
        const ok = this.addPlayerBoost({
            source: `consume:${c.name}`,
            tagDelta: c.tagBonus,
            durationSeconds: c.durationSeconds,
            label: c.label,
        });
        return { ok };
    }

    // DSL-Pfad für eigene Seelen: validateBlueprintParts (Shape-Whitelist, Cap 32 parts, Material muss
    // existieren, Position/Size/Rotation geclampt). Cap 16 Custom-Seelen/Welt; Built-in-Namen geschützt.
    createOrUpdateSoulFromDsl(name, bodyParts) {
        if (typeof name !== "string" || name.length === 0 || name.length > 40) {
            return { ok: false, reason: "invalid_name" };
        }
        const safe = name.replace(/[^a-z0-9_-]/gi, "").slice(0, 40);
        if (!safe) return { ok: false, reason: "invalid_name_after_sanitize" };
        if (this.playerSoulDefs[safe]) return { ok: false, reason: "builtin_protected" };
        if (!this.state.customSouls) this.state.customSouls = {};
        const existing = this.state.customSouls[safe];
        const count = Object.keys(this.state.customSouls).length;
        if (!existing && count >= 16) return { ok: false, reason: "too_many_souls" };
        this.state.customSouls[safe] = {
            name: safe,
            label: safe.replace(/_/g, " "),
            bodyParts: bodyParts,
            createdAt: performance.now() / 1000,
        };
        return { ok: true, name: safe };
    }

    // Geruch an (x, z) aus `sources` [{x, z, strength}], Σ über alle Quellen, ∈ [0, ∞) — cappen und
    // deuten die Konsumenten. Je Quelle: decay = exp(−dist/rangeM); dot = toRecv · windDir (toRecv =
    // Einheitsvektor Quelle→Empfänger, windDir = der EINE Wind an der Quelle, `_windAt` auf der Sim-Uhr — die Nase riecht
    // den Wind, den das Gras zeigt, und das Verhalten hängt nie an der Bildrate; positiv = downwind); windMod = max(minDirectional, (1−windFactor) + windFactor ·
    // max(0, dot)); geruch = strength · decay · windMod.
    _scentAt(x, z, sources) {
        if (!Array.isArray(sources) || sources.length === 0) return 0;
        const S = AnazhRealm.SCENT;
        let total = 0;
        for (const src of sources) {
            if (!src || typeof src.x !== "number" || typeof src.z !== "number") continue;
            const strength = typeof src.strength === "number" ? src.strength : 1;
            if (!(strength > 0)) continue;
            const dx = x - src.x;
            const dz = z - src.z;
            const dist = Math.hypot(dx, dz);
            if (dist > S.rangeM * 4) continue; // jenseits 4× range vernachlässigbar
            const decay = Math.exp(-dist / S.rangeM);
            // Wind an der Quelle (der Wind, der den Geruch wegträgt)
            const wind = this._windAt(src.x, src.z, this.state._simZeit);
            // Normierter Vektor von Source zum Receiver
            const norm = dist > 0.001 ? 1 / dist : 0;
            const dirX = dx * norm;
            const dirZ = dz * norm;
            // dot mit windDir: positiv = Receiver liegt downwind (wind weht
            // VON src ZU recv, trägt also den Geruch hin).
            const dot = dirX * wind.x + dirZ * wind.z;
            const windMod = Math.max(S.minDirectional, 1 - S.windFactor + S.windFactor * Math.max(0, dot));
            total += strength * decay * windMod;
        }
        return total;
    }

    // DER EINE Stat-Chokepoint: jede Mutation der Spieler-Stats ruft recomputePlayerStats
    // (computePlayerStats ist die EINE Berechnung) — nie inline neu rechnen, sonst driftet eine zweite
    // Stat-Wahrheit. Die LEBENSWERTE (hp · stamina · mana) sind ZUSTAND: jede Neuberechnung klemmt sie auf das
    // neue Maximum, keine hebt sie. Auf das Maximum setzen nur die Wandlung (applyPlayerSoul) und die Rückkehr
    // (_playerDeathRespawn) mit `{ voll: true }` — vorher heilte jeder Rufer voll: Gerät, Panel, Boost und der
    // Tod-Takt (K27, gate:kampf-gefuehl T27). Ein fehlender Wert (vor der ersten Wandlung) ist nie 0: er steht voll.
    // player_speed/player_jump_power dürfen danach überschreiben.
    recomputePlayerStats(opts) {
        const computed = this.computePlayerStats();
        if (!this.state.player) return computed;
        const pl = this.state.player;
        pl.stats = computed.stats;
        pl.statTags = computed.tags;
        // Anwendung auf die Live-Bewegungs-Werte. V9.44-b: speed + sprintSpeed
        // über den kanonischen Setter — Sprint = 2× speed konsistent gehalten.
        this._applyPlayerSpeed(computed.stats.speed);
        this.state.jumpPower = computed.stats.jumpPower;
        // Die Lebenswerte: das Maximum aus der Berechnung, der Zustand geklemmt (Mana ist die zweite Ausdauer-Achse;
        // Verbrauch und Regen leben in den Verben und tickPlayerVitals).
        const voll = !!(opts && opts.voll);
        const lebenswert = (v, max) => (voll || v == null ? max : Math.min(v, max));
        pl.hpMax = computed.stats.hpMax;
        pl.hp = lebenswert(pl.hp, pl.hpMax);
        pl.staminaMax = computed.stats.staminaMax;
        pl.stamina = lebenswert(pl.stamina, pl.staminaMax);
        pl.manaMax = computed.stats.manaMax;
        pl.mana = lebenswert(pl.mana, pl.manaMax);
        return computed;
    }

    // Pro-Frame-Animation des aktuellen Soul-Group. Wird im Render-Loop
    // direkt nach der Kamera aufgerufen — playerMesh.position ist da schon
    // mit dem Physik-Body synchronisiert.
    animatePlayerSoul(currentTime) {
        const mesh = this.state.playerMesh;
        if (!mesh || !mesh.userData) return;
        const p = this.state.player;
        // DER HIT-STOP HÄLT DEN GANZEN LEIB (halten.K2): die Pose ist eine Funktion der Anzeige-Uhr — der Takt des Treffers
        // legt sie (die Klinge am Ziel, die Phase steht: dt × Faktor 0), danach schreibt bis zum Ende dieses Halts kein Glied:
        // Gang, Atem, Sitz, der Schwung und seine Achse zum Ziel (das gestoßene Tier gleitet im festen Schritt weiter). Vorher
        // fror nur die Phase, die Achse folgte dem Ziel je Bild: die Hand glitt im Halt bis 55,8 mm je Takt (Radeon, Hit-Stop
        // 1 Bild Third/Ego). Die fixe Sim (_loopFixedStep/_stepFixedSim) liest den Faktor NIE (gate:kampf-gefuehl).
        const uhr = this._hitStopFactor(currentTime);
        if (uhr === 0 && mesh.userData._haltPose === p._hitStopUntil) {
            p.animationLastTick = currentTime;
            return;
        }
        mesh.userData._haltPose = uhr === 0 ? p._hitStopUntil : null;
        const soulName = p.soul || "human";
        const def = this.playerSoulDefs[soulName];
        const hasSkeleton = !!(def && typeof def.animate === "function" && mesh.userData.parts);
        // Custom-Seelen erben die emergente Bewegung: Rollen aus ihren bodyParts (einmal je Seele am Mesh
        // gecacht — ein Wechsel baut eine frische Group), derselbe Geh-/Schwimm-Takt wie die Hand-Skelette.
        let customRoles = null;
        if (!hasSkeleton) {
            // ABSCHIEDS-WELLE (Konvergenz C) — die EINE Rollen-Quelle für ALLE Compound-
            // Seelen: `_getSoulDef` deckt Built-ins (Phönix/Drache — ihre Hand-Skelette
            // sind konvergiert, sie bauen + bewegen wie jede Custom-Seele) UND Customs.
            const sdef = this._getSoulDef(soulName);
            if (!sdef || !Array.isArray(sdef.bodyParts)) return;
            if (mesh.userData._motionSoul !== soulName) {
                mesh.userData._motionSoul = soulName;
                mesh.userData._motionRoles = this.computeMotionRoles(sdef.bodyParts);
                mesh.userData._motionBase = null;
            }
            customRoles = mesh.userData._motionRoles;
            if (!customRoles) return;
        }
        // Im Sattel pausiert der Schritt (Phase eingefroren); der Mensch-Avatar SITZT (_applySeatPose),
        // andere Seelen ruhen in der Idle-Pose.
        const mounted = p.mountedArch !== null && p.mountedArch !== undefined;
        if (mounted) {
            p.animationLastTick = currentTime;
            if (hasSkeleton && soulName === "human" && mesh.userData.parts) {
                this._applySeatPose(mesh, currentTime);
            } else if (hasSkeleton) {
                def.animate(mesh, currentTime, p.walkPhase, false, false, p.emotions);
            } else if (customRoles) {
                this._animateCompoundMotion(mesh, customRoles, currentTime, p.walkPhase, false, p.emotions);
            }
            return;
        }
        if (mesh.userData.rig && mesh.userData.rig._sitzLage) this._sitzLageLoesen(mesh.userData.rig);
        // isMoving aus horizontaler Geschwindigkeit. Schwelle 0.4 m/s
        // verhindert Mikro-Walk wenn der Spieler steht aber leicht rutscht.
        let speedNow = 0;
        if (this.state.playerVel) {
            const v = this.state.playerVel;
            speedNow = Math.hypot(v.x(), v.z());
            if (!Number.isFinite(speedNow)) speedNow = 0;
        }
        const isMoving = speedNow > 0.4;
        // V8.33 — unter Wasser schwimmt der Avatar statt zu laufen.
        const underwater = !!this.state.playerUnderwater;
        // Frame-Delta aus animationLastTick auf der Anzeige-Uhr (im Takt des Treffers 0; der gehaltene Leib oben rückt die Marke
        // mit — nach dem Halt läuft der Gang ohne Sprung weiter).
        const last = p.animationLastTick;
        const dt = (last > -Infinity ? Math.max(0, currentTime - last) : 0) * uhr;
        p.animationLastTick = currentTime;
        let gait = null;
        if (underwater) {
            // Schwimm-Takt: die Phase läuft auch im Stillstand (Wasser-Treten), in Bewegung schneller — kein
            // Rhythmus-Sprung bei Start/Stopp. Takt aus dem koerperstudio-Gesetzbuch (_schwimmGesetz).
            const SG = AnazhRealm._schwimmGesetz();
            p.walkPhase += dt * (isMoving ? SG.taktZug : SG.taktTreten);
        } else if (hasSkeleton && mesh.userData.rig) {
            // ═══ KÖRPER-BEWEGUNG ═══
            // Der Biped geht die WEG-Phase (Weg / Schrittlänge — der Sprint skatet nie); w(speed) blendet die
            // Posen; nur der lokale Avatar trägt Fuß-IK/Foot-Lock/Becken/Hang-Lehne (_gaitTick = der EINE
            // Chokepoint). Die Emotion reist als Kadenz-Faktor (neutral 1, sorrow 0.8×); kaltes Buch → 1.
            let emoF = 1;
            const mpv = this._koerperMotionProfile(true, p.emotions);
            const mpr = mpv ? this._koerperMotionProfile(true, null) : null;
            if (mpv && mpr && Number.isFinite(mpv.freq) && mpr.freq > 0) emoF = mpv.freq / mpr.freq;
            gait = this._gaitTick(mesh, p, speedNow, dt, {
                emoFaktor: emoF,
                // LUFT-SPERRE: nur der stehende Körper erdet die Füße — im Sprung blieb die IK an, das Becken sank 0,25 m,
                // während die Kapsel 0,24–0,31 m stieg (der sichtbare Sprung fast null, Leben-Prüfung N-D1).
                ik: this.state.isInAir !== true,
                soleY: mesh.position.y - AnazhRealm.PLAYER_FOOT_OFFSET,
                yaw: mesh.rotation.y,
            });
        } else if (isMoving) {
            // Compound-/Nicht-Rig-Seelen bleiben zeit-getrieben (Flügel/Räder takten zur Uhr); Takt-Basis +
            // Emotions-Brücke im EINEN Chokepoint _compoundTaktHz (Kern: schritt.taktCompound).
            p.walkPhase += dt * this._compoundTaktHz(p.emotions);
        }
        // Schritt-Klang als Konsument der Gang-Phase (keine eigene Uhr): je Halbzyklus ein Schritt, nur
        // geerdet + über der Tempo-Schwelle; Hit-Stop friert ihn mit, im Sattel kein Fuß-Klappern.
        this._schrittKlangTick(p, speedNow, underwater, mesh);
        if (hasSkeleton) {
            this._kampfHuelle(mesh); // die Hülle ohne den Ausfall des letzten Takts: die Fuß-IK misst den Leib in Ruhe
            def.animate(mesh, currentTime, p.walkPhase, isMoving, underwater, p.emotions, gait);
            // Der 3-Phasen-Kampf-Schwung ist ein additiver Oberkörper-Layer über der Lokomotion (dieselbe
            // Null-Reset-Basis, danach +=) — kein zweites Rig-System. No-op ohne Schwung/Rig.
            this._applyKampfSchwungPose(mesh);
        } else {
            // ABSCHIEDS-WELLE (Konvergenz C) — DIE EINE SCHWIMM-LEHNE für jede Compound-
            // Seele (konvergierte Built-ins + Customs; die Spieler-Gruppe ist IMMER YXZ,
            // applyPlayerSoul erzwingt die Order → die Lehne kippt lokal-vorwärts).
            const L = AnazhRealm.SOUL_SWIM_LEAN;
            mesh.rotation.x = underwater ? (isMoving ? L.moving : L.idle) : 0;
            this._animateCompoundMotion(mesh, customRoles, currentTime, p.walkPhase, isMoving, p.emotions);
        }
    }
}
_stammZonen(AnazhRealm, [AnazhRealm_koerper_seele]);

// ===== ATLAS · Koerper/seele — Außen-Konstanten =====
// Das gehaltene Gerät sichtbar in der Hand: _buildFromBlueprint (kein Parallel-Pfad) → Mesh am
// rechten Arm/Flügel (schwingt über die THREE-Transform-Kette mit), sonst an der Körper-Wurzel.
// Pose/Skala/Sitz sind browser-justierbar; headless beweist nur Existenz + Lifecycle + Anker.
AnazhRealm.HELD_MESH = Object.freeze({
    targetSpanM: 0.62, // die längste Dimension des Geräts in der Hand (auf Werkzeug-Größe skaliert)
    minScale: 0.04,
    maxScale: 3,
    handOffset: Object.freeze({ x: 0, y: -0.5, z: 0.12 }), // im Arm-Anker-Lokalraum (Handfläche/-spitze)
    rootOffset: Object.freeze({ x: 0.42, y: 0.9, z: 0.32 }), // Fallback: vorn-rechts an der Körper-Wurzel
    tilt: Object.freeze({ x: 0.5, y: 0, z: 0 }), // ein leichter Vorwärts-Neigung (ein langes Werkzeug zeigt nach vorn/unten)
    // DIE FAUST (W5) — das Studio-Gerät im Handgelenk des Studio-Menschen (−y zu den Fingern, +z Daumenseite): die
    // Griff-Mitte sitzt in der Hand-Mitte, die die Hand selbst trägt (rig.handMitte je Handgelenk, Ofen-Beipack); die
    // Griff-Achse zeigt nach vorn und `neigung` unter die Waagrechte (der entspannte Arm: das Langschwert-Ende über dem
    // Boden statt im Boden).
    neigung: 0.44,
});
AnazhRealm.STAMINA_REGEN_PER_SEC = 5;
// V18.196 — MANA-Symmetrie (zweite Ausdauer-Achse). Langsamer als Stamina
// weil Mana mächtiger ist; magieleitung im Spieler-Compound boostet die
// Rate emergent (effektiv = base × (1 + magieleitung)). Erst-Wurf-Tuning.
AnazhRealm.MANA_REGEN_PER_SEC = 3;

// GERUCH-Feld: reist mit dem Wind, fällt mit Distanz ab; Quellen sind diskret (Kreaturen, Pflanzen,
// Strukturen — die Konsumenten geben sie ein). Fundament-Funktion, noch ohne Kreatur-KI-Verdrahtung.
AnazhRealm.SCENT = Object.freeze({
    // Reichweite (m): Geruch fällt auf ~37% bei rangeM, ~5% bei 3×rangeM.
    rangeM: 80,
    // Wind-Modulation: 1.0 = volle Richtungs-Wirkung (upwind = 0); 0.0 = isotrop.
    // Erst-Wurf 0.6 — Wind hilft deutlich, isoliert aber nicht (upwind-Geruch
    // dimmt, verschwindet nicht ganz).
    windFactor: 0.6,
    // Minimaler Richtungs-Faktor (gegen Wind): nie ganz 0, sonst wäre der
    // Geruch upwind invisible — eine Schwelle, die "Restduft" trägt.
    minDirectional: 0.2,
});

// Emotion→Tag-Mapping für Boosts: jede der 6 Emotionen koppelt an einen MATERIAL_TAG_KEY; über 0.7
// wirkt ein Tag-Delta auf den Spieler-Compound (Stat-Steigerung ~10–15 %, spürbar, nicht dominant).
AnazhRealm.BOOST_EMOTION_TAG = Object.freeze({
    joy: { tag: "wärmeleitung", delta: 0.15, label: "Freude wärmt" },
    awe: { tag: "magieleitung", delta: 0.15, label: "Ehrfurcht öffnet" },
    sorrow: { tag: "resoniert", delta: 0.15, label: "Trauer schwingt tief" },
    hope: { tag: "lebendig", delta: 0.1, label: "Hoffnung belebt" },
    peace: { tag: "zähigkeit", delta: 0.1, label: "Friede härtet leise" },
    chaos: { tag: "stromleitung", delta: 0.15, label: "Chaos sprüht Funken" },
});
AnazhRealm.BOOST_EMOTION_DURATION = 30; // s, läuft mit Emotion mit
AnazhRealm.BOOST_EMOTION_REFRACT = 60; // s Pause nach Ablauf, sonst Endlos-Pulsen
AnazhRealm.BOOST_RESONANCE_RADIUS = 18; // m, in deren Nähe das Welt-Effekt-Boost greift
AnazhRealm.BOOST_RESONANCE_DELTA = 0.15; // +0.15 resoniert auf Spieler-Compound
AnazhRealm.BOOST_RESONANCE_LABEL = "Welt-Resonanz";
// Werkzeug-Abnutzung (kein Perpetuum mobile): ein gehaltenes Gerät trägt wear (0..1), der je Hieb
// sinkt; unter WEAR_KAPUTT_SCHWELLE ist es verbraucht. Reparieren zahlt MATERIAL
// (REPAIR_COST_FRACTION × Voll-Bau-Kosten × Schaden-Anteil) → wear=1: Bauen → Abbauen → Reparieren
// ist netto nicht-positiv. Ohne wear-Feld liest ein Bauplan 1 (alte Welten verlieren nichts).
AnazhRealm.WEAR_PER_STRIKE_BASE = 0.018; // ein voll-neues Werkzeug hält ~55 Hiebe Basis
AnazhRealm.WEAR_HARDNESS_FLOOR = 0.4; // härte<0.4 → trägt den Voll-Basis-Verschleiß
AnazhRealm.WEAR_HARDNESS_CEIL = 3.0; // härte≥3 (eisen+) → ~1/3 Verschleiß (hartes Werkzeug widersteht)
AnazhRealm.WEAR_STAT_FLOOR = 0.3; // wear-Faktor auf den Treffer-Schaden: min 30 % auch bei 0 % wear
AnazhRealm.REPAIR_COST_FRACTION = 0.5; // eine Reparatur kostet 50 % der Voll-Bau-Kosten × Schaden
AnazhRealm.REPAIR_TARGET_WEAR = 1.0; // eine erfolgreiche Reparatur stellt voll her
// DIE EINE SCHWIMM-LEHNE: jede Compound-Seele (Built-ins, Custom, Peers) legt sich unter Wasser über
// dieselbe Daten-Zeile (der Rig-Avatar in _animateHuman ebenso). Sie wohnt im Schwimm-Gesetz
// (schwimmen.leanSoul), gelesen fail-closed über _schwimmGesetz.
Object.defineProperty(AnazhRealm, "SOUL_SWIM_LEAN", {
    get() {
        return AnazhRealm._schwimmGesetz().leanSoul;
    },
});
// ALTLASTEN-NULL — die Gnaden-Frist nach dem feld-nativen Tod (Sekunden):
// innerhalb dieser Frist zieht kein Schaden und feuert kein zweiter Respawn.
AnazhRealm.RESPAWN_GRACE_SEC = 8;
