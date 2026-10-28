class AnazhRealm_feld_leben {
    // ===== ATLAS · Feld/leben — Lebens-Feld · Aura · Wohl · Welt-Feld · Selbst-Analyse =====
    creatureJump(creature, ansprung = false) {
        const ud = creature && creature.userData;
        if (!ud || ud._hopV > 0 || ud._hopH > 0) return false;
        ud._hopV = Math.sqrt(2 * this._hopSchwere() * this._kreaturSprungHoehe(creature, ansprung));
        return true;
    }

    isInFrustum(object, providedFrustum = null) {
        // Chunks haben Origin (0,0,0) mit Geometrie in Welt-Koordinaten — ein Punkttest blendete sie je nach
        // Blickrichtung weg. Mit boundingSphere → intersectsSphere, sonst Punkttest.
        if (!object) {
            return false;
        }

        // Frustum/Matrix4/Sphere gepoolt statt pro Aufruf allokiert (sonst 2 Allokationen je Kreatur/Frame):
        // ein gelieferter Frustum gewinnt, sonst der pro Frame aktualisierte `_frustumCache` (pre-init lazy).
        let frustum = providedFrustum || this._frustumCache;
        if (!frustum) {
            // Pre-init: das `_loopFrustumCulling` ist noch nicht gelaufen.
            // Wir bauen das Cache lazy + initial, ab dem nächsten Frame
            // wird es vom Render-Pass aktualisiert.
            this._frustumCache = new THREE.Frustum();
            this._frustumMatrixCache = new THREE.Matrix4();
            this._frustumMatrixCache.multiplyMatrices(
                this.state.camera.projectionMatrix,
                this.state.camera.matrixWorldInverse
            );
            this._frustumCache.setFromProjectionMatrix(this._frustumMatrixCache);
            frustum = this._frustumCache;
        }

        if (object.geometry) {
            if (!object.geometry.boundingSphere) {
                try {
                    object.geometry.computeBoundingSphere();
                } catch {
                    // Geometrie ungültig – auf "sichtbar" fallen lassen
                    return true;
                }
            }
            const sphere = object.geometry.boundingSphere;
            if (sphere && Number.isFinite(sphere.radius) && sphere.radius > 0) {
                // boundingSphere der Chunks liegt schon in Welt-Koordinaten; bei Position-Offset (Inseln,
                // Vegetation) wird das Center über eine gepoolte Scratch-Sphere verschoben.
                if (
                    object.position &&
                    (object.position.x !== 0 || object.position.y !== 0 || object.position.z !== 0)
                ) {
                    if (!this._frustumSphereScratch) {
                        this._frustumSphereScratch = new THREE.Sphere(new THREE.Vector3(), 0);
                    }
                    const s = this._frustumSphereScratch;
                    s.center.copy(sphere.center).add(object.position);
                    s.radius = sphere.radius;
                    return frustum.intersectsSphere(s);
                }
                return frustum.intersectsSphere(sphere);
            }
        }

        // Punkt-basierter Fallback (Kreaturen, einfache Meshes)
        if (!object.position) return false;
        const isVisible = frustum.containsPoint(object.position);
        if (!isVisible && this.state.playerMesh) {
            const distance = object.position.distanceTo(this.state.playerMesh.position);
            if (distance < 50) return true;
        }
        return isVisible;
    }

    // ### Aktivieren/Deaktivieren ###
    toggleTerrain(visible) {
        // toggleTerrain wirkt auf `state.voxelChunks`; die Kollision ist feld-nativ (`_stepCharacter`
        // liest das Dichtefeld) — der Toggle schaltet nur die SICHTBARKEIT.
        const vc = this.state.voxelChunks;
        if (vc && vc.size > 0) {
            // DER SATZ: der ganze Ring ist EIN Objekt — der Toggle schaltet ihn.
            this._chunkSatzSichtbar("boden", visible);
            this.log(`Boden ${visible ? "aktiviert" : "deaktiviert"}`);
        } else {
            this.log("Boden nicht vorhanden – Erzeuge neuen Boden...");
            this.generateNewWorld();
        }
    }

    toggleCreatures(visible) {
        // DETERMINISMUS-BOGEN P3 — Kreaturen tragen keinen Ammo-Body mehr; nur Sichtbarkeit.
        // WELT-MARCH: das Feld IST die Gestalt — der Toggle schaltet die FELDER
        // (der Kreatur-Ziegel-Tick konsumiert das Flag am EINEN Chokepoint).
        this.state.creaturesHidden = !visible;
        // jeder Leib im Bild: die Wesen und die Gefallenen (state.leichname liegen sichtbar, bis sie versunken sind)
        for (const creature of [...this.state.creatures, ...this.state.leichname]) {
            const u = creature.userData;
            if (u && u._kzGlieder) {
                for (const gl of u._kzGlieder) this._weltFeldAktiv(gl.handle, visible, true); // Schalter: kein Schwund
                creature.visible = false; // der Körper bleibt unsichtbarer Träger
            } else if (u && u._kzVersuch) {
                creature.visible = false; // Bake gescheitert: KEIN Rückweg zum Mesh
            } else creature.visible = visible;
        }
        this.log(`Kreaturen ${visible ? "aktiviert" : "deaktiviert"}`);
    }

    // ### Selbstdefinition ###
    // Abilities sind ausschließlich DSL-Programme: `state.dsl.abilities` ist die Quelle der Wahrheit
    // (Persistenz), `state.abilities[name]` nur Wrapper-Cache (Keyboard-Loop). Keine dynamische
    // Code-Generierung (CSP-strict).
    addNewAbility(name, program, source = "human") {
        if (!Array.isArray(program)) {
            this.log(`addNewAbility: Programm für '${name}' ist kein DSL-Array, ignoriert`, "ERROR");
            return false;
        }
        const existingIdx = this.state.dsl.abilities.findIndex((a) => a.name === name);
        // Welle 6.E1 — Beschreibung beim Anlegen einmal berechnen + speichern.
        // Bei Restore aus alten Saves übernimmt renderAbilitiesList das Nachholen.
        const description = (() => {
            try {
                return this.describeProgram(program);
            } catch {
                return "wirkt auf die Welt";
            }
        })();
        const entry = {
            name,
            program,
            source,
            description,
            createdAt: performance.now() / 1000,
        };
        if (existingIdx >= 0) this.state.dsl.abilities[existingIdx] = entry;
        else this.state.dsl.abilities.push(entry);

        this.state.abilities[name] = () => this.dslRun(program, { source: `ability:${name}` });
        if (!this.state.selfAwareness.components.includes(name)) {
            this.state.selfAwareness.components.push(name);
        }
        this.log(`Neue Fähigkeit hinzugefügt (DSL): ${name}`);
        return true;
    }

    // Der erste Moment gehört der WELT: kein Modal, kein Backdrop, kein Steuerungs-Dump — der Begleiter
    // (Eins) lädt EINMAL diegetisch ein; die Steuerung kommt just-in-time + im Hilfe-Tab.
    // Gegated über anazh.ui.skipIntro / worldJournal.seen.intro, idempotent.
    _firstWorldWelcome(opts = {}) {
        if (typeof document === "undefined") return;
        const seen = (() => {
            try {
                if (typeof localStorage !== "undefined" && localStorage.getItem("anazh.ui.skipIntro") === "true")
                    return true;
            } catch {
                /* localStorage gesperrt — worldJournal entscheidet */
            }
            return !!(this.state.worldJournal && this.state.worldJournal.seen && this.state.worldJournal.seen.intro);
        })();
        if (seen) return;
        // Die Welt zuerst atmen lassen (der WOW), DANN die sanfte Einladung des
        // Begleiters — diegetisch in der Dialog-Box, kein Modal verdeckt die Sicht.
        const invite = () => {
            this.grokRender(this._firstWelcomeMessage());
            try {
                if (typeof localStorage !== "undefined") localStorage.setItem("anazh.ui.skipIntro", "true");
            } catch {
                /* localStorage gesperrt — worldJournal trägt das Flag */
            }
            this.journalAppendOnce(
                "intro",
                "ritual",
                "Ich erwachte in dieser Welt, und sie wartete auf mein erstes Wort."
            );
        };
        if (opts.immediate) invite();
        else if (typeof setTimeout === "function") setTimeout(invite, 1800);
        else invite();
    }

    // Die EINE Begrüssung des Begleiters — eine Einladung, keine Anleitung. Sie
    // erklärt nichts (kein WASD/Hotbar-Dump), sie öffnet die Tür: die Welt wächst
    // aus dem ersten Wort. Das ist der WOW — die Welt antwortet auf deine Stimme.
    _firstWelcomeMessage() {
        return "Ich bin Eins. Diese Welt ist still — bis du sprichst. Sag, was werden soll.";
    }

    // DSL-Programm → deutsche Beschreibung: bekannte Ops per Vorlage, sonst generischer Fallback;
    // chain/when/repeat/delay rekursieren, Position-Nodes inline. Gespeichert in `ability.description`
    // (alte Saves on-the-fly), max ~120 Zeichen, eine Zeile.
    describeProgram(node) {
        if (!Array.isArray(node) || node.length === 0) return "tut nichts";
        const op = node[0];
        const args = node.slice(1);
        if (op === "chain") {
            const parts = args.filter((a) => Array.isArray(a)).map((a) => this.describeProgram(a));
            if (parts.length === 0) return "tut nichts";
            if (parts.length === 1) return parts[0];
            return parts.join(" und ");
        }
        if (op === "when") {
            return `wenn ${this._describeDslCondition(args[0])}, dann ${this.describeProgram(args[1])}`;
        }
        // V17.36 Phase D — eine stehende Welt-Regel menschen-lesbar.
        if (op === "rule") {
            const opts = args[2] && typeof args[2] === "object" && !Array.isArray(args[2]) ? args[2] : {};
            const every = opts.everySec ? ` (alle ${opts.everySec} s)` : "";
            return `wann immer ${this._describeDslCondition(args[0])}, dann ${this.describeProgram(args[1])}${every}`;
        }
        if (op === "repeat") return `${args[0]}× ${this.describeProgram(args[1])}`;
        if (op === "delay") return `nach ${args[0]} s ${this.describeProgram(args[1])}`;
        if (op === "say") return `sagt „${args[0]}"`;
        if (op === "record_narrative") return `vermerkt eine Erinnerung`;
        const t = this._dslDescriptionTable();
        if (t[op]) return t[op](args);
        return `wirkt: ${op}`;
    }

    // Position-Knoten oder skalare Werte in deutscher Form. Wird von describeProgram
    // genutzt, lebt als eigene Methode damit auch Tests sie inspizieren können.
    _describeDslPosition(arg) {
        if (!Array.isArray(arg)) return "an einer Stelle";
        const head = arg[0];
        if (head === "at_player") return "beim Spieler";
        if (head === "near_player") return "in der Nähe des Spielers";
        if (head === "random_position") return "an einem zufälligen Ort";
        if (head === "near_water") return "am nächsten Wasser";
        if (head === "far_player") return "in der Ferne";
        if (head === "at" && arg.length >= 4) return `bei (${arg[1]}, ${arg[2]}, ${arg[3]})`;
        return "an einer Stelle";
    }

    _describeDslCondition(node) {
        if (!Array.isArray(node)) return "etwas";
        const op = node[0];
        const a = node.slice(1);
        if (op === "emotion_above") return `${a[0]} hoch ist (>${a[1]})`;
        if (op === "fps_below") return `die FPS unter ${a[0]} fallen`;
        if (op === "player_y_below") return `der Spieler unter Höhe ${a[0]} ist`;
        if (op === "weather_is") return `das Wetter „${a[0]}" ist`;
        if (op === "random_chance") return `Zufall ≤ ${a[0]}`;
        if (op === "time_passed") return `${a[0]} s vergangen sind`;
        if (op === "near_player") return `etwas nahe ist`;
        if (op === "creatures_count_above") return `mehr als ${a[0]} Kreaturen da sind`;
        if (op === "compound_has_tag") return `„${a[0]}" das Tag ${a[1]} ≥ ${a[2]} hat`;
        if (op === "compound_has_spatial_tag") return `„${a[0]}" räumlich ${a[1]} ≥ ${a[2]} hat`;
        // V17.34/.36 — die Feld-Bedingungen (Regeln lesen das lebendige Feld am Ort)
        if (op === "field_above") return `${a[0]} am Ort hoch ist (>${a[1]})`;
        if (op === "field_below") return `${a[0]} am Ort niedrig ist (<${a[1]})`;
        if (op === "and") return a.map((c) => this._describeDslCondition(c)).join(" und ");
        if (op === "or") return a.map((c) => this._describeDslCondition(c)).join(" oder ");
        if (op === "not") return `nicht (${this._describeDslCondition(a[0])})`;
        return `etwas (${op})`;
    }

    _dslDescriptionTable() {
        const pos = (a) => this._describeDslPosition(a);
        return {
            weather: (a) => `lässt das Wetter zu „${a[0]}" wechseln`,
            gravity: (a) => `setzt die Schwerkraft auf ${a[0]}`,
            terrain_steepness: (a) => `regelt die Hang-Steilheit auf ${a[0]}`,
            terrain_base_height: (a) => `hebt die Welt-Grundhöhe auf ${a[0]}`,
            voxel_carve: (a) => `schnitzt das Voxel-Terrain bei (${a[0]}, ${a[1]}, ${a[2]}) im Radius ${a[3]}`,
            voxel_fill: (a) => `schüttet das Voxel-Terrain bei (${a[0]}, ${a[1]}, ${a[2]}) im Radius ${a[3]} auf`,
            lava: (a) => `gießt Lava bei (${a[0]}, ${a[2]})`,
            set_time_of_day: (a) => `stellt die Uhr auf ${a[0]}`,
            skybox_color: () => `färbt den Himmel`,
            deposit_life: (a) => `trägt Leben ins Feld ${pos(a[0])}`,
            deposit_emotion: (a) => `prägt „${a[0]}" ins Feld ${pos(a[2])}`,
            spawn_creature: (a) =>
                `ruft ${a[1] || 1} ${a[2] ? a[2] + " " : ""}Kreatur${(a[1] || 1) !== 1 ? "en" : ""} herbei ${pos(a[0])}`,
            spawn_tree: (a) => `pflanzt ${a[1] || 1} ${(a[1] || 1) !== 1 ? "Bäume" : "Baum"} ${pos(a[0])}`,
            spawn_studio: (a) => {
                const n = typeof a[0] === "string" ? this._studioBlueprintForWord(a[0].toLowerCase()) : null;
                const bp = n && this.state.blueprints ? this.state.blueprints[n] : null;
                const was = (bp && bp.label) || (n && this._werkLabel(n)) || a[0];
                if (n && this._studioWerkVerb(n) === "praegung") return `prägt „${was}" in die Welt`;
                return `lässt ${a[2] || 1}× „${was}" aus dem Studio wachsen ${pos(a[1])}`;
            },
            spawn_island: (a) => `setzt eine schwebende Insel ${pos(a[0])}`,
            spawn_ufo: (a) => `ruft ein UFO ${pos(a[0])}`,
            spawn_village: (a) => `errichtet ein Dorf ${pos(a[0])}`,
            spawn_temple: (a) => `errichtet einen Tempel ${pos(a[0])}`,
            spawn_waterfall: (a) => `formt einen Wasserfall ${pos(a[0])}`,
            spawn_blueprint: (a) => {
                const bp = this.state.blueprints && this.state.blueprints[a[0]];
                return `baut „${(bp && bp.label) || a[0]}" ${pos(a[1])}`; // das Label, nie die id (V-D8)
            },
            remove_architecture: () => `baut ein Bauwerk ab`,
            spawn_fractal: (a) => `lässt „${a[1]}" fraktal in Tiefe ${a[2]} wachsen ${pos(a[0])}`,
            define_blueprint: (a) => `legt einen neuen Bauplan „${a[0]}" an`,
            define_material: (a) => `definiert ein neues Material „${a[0]}"`,
            define_ability: (a) => `lernt eine neue Fähigkeit „${a[0]}"`,
            set_tool_meta: (a) => `gibt „${a[0]}" eine Werkzeug-Identität (${a[1]})`,
            register_tool: (a) => `registriert „${a[0]}" als Werkzeug`,
            apply_connection: (a) => `verbindet Teile von „${a[0]}" mit „${a[1]}"`,
            apply_op: (a) => `bearbeitet Teil ${a[1]} von „${a[0]}" mit „${a[2]}"`,
            set_mode: (a) => `wechselt die Welt-Beziehung auf „${a[0]}"`,
            set_portal: (a) => `richtet „${a[0]}" als Portal auf die Welt „${a[1]}"`,
            add_to_inventory: (a) => `legt ${a[1] || 1}× „${a[0]}" ins Inventar`,
            creature_task: (a) => {
                const extra = this._describeCreatureTaskArg(a[1], a[2]);
                return `gibt Kreatur #${a[0]} den Auftrag „${a[1]}"${extra}`;
            },
            creature_task_nearest: (a) => {
                const extra = this._describeCreatureTaskArg(a[0], a[1]);
                return `gibt der nächsten Kreatur den Auftrag „${a[0]}"${extra}`;
            },
            creature_task_all: (a) => {
                const extra = this._describeCreatureTaskArg(a[0], a[1]);
                return `gibt allen Kreaturen den Auftrag „${a[0]}"${extra}`;
            },
            creature_equip_tool: (a) =>
                a[1] ? `rüstet Kreatur #${a[0]} mit Werkzeug „${a[1]}" aus` : `nimmt Kreatur #${a[0]} das Werkzeug ab`,
            creature_equip_armor: (a) =>
                a[1] ? `rüstet Kreatur #${a[0]} mit Rüstung „${a[1]}" aus` : `nimmt Kreatur #${a[0]} die Rüstung ab`,
            creature_unequip: (a) => `nimmt Kreatur #${a[0]} den Slot „${a[1]}" ab`,
            damage_creature: (a) => `fügt Kreatur #${a[0]} ${a[1]} Schaden zu`,
            creature_apply_boost: (a) => `gibt Kreatur #${a[0]} den Trank „${a[1]}"`,
            creatures_color: () => `färbt alle Kreaturen`,
            creatures_emotion: (a) => `setzt die Kreaturen-Stimmung auf „${a[0]}"`,
            creatures_speed_mul: (a) => `wiegt das Kreaturen-Tempo um ${a[0]} (im Wander-Band)`,
            creatures_size_mul: (a) => `wiegt die Kreaturen-Größe um ${a[0]} (die bodySize-Achse, im Größen-Band)`,
            player_jump_power: (a) => `wiegt die Sprungkraft auf ${a[0]} (im Gesetz-Band deines Körpers)`,
            player_speed: (a) => `wiegt die Lauf-Geschwindigkeit auf ${a[0]} (im Gesetz-Band deines Körpers)`,
            player_soul: (a) => `wandelt dich zur Seele „${a[0]}"`,
            set_visible: (a) => `macht „${a[0]}" ${a[1] ? "sichtbar" : "unsichtbar"}`,
        };
    }

    recordWeakness(label) {
        // Dedupliziert aufeinanderfolgende identische Einträge und cappt auf 50.
        const weaknesses = this.state.selfAwareness.weaknesses;
        if (weaknesses[weaknesses.length - 1] === label) return;
        weaknesses.push(label);
        if (weaknesses.length > 50) weaknesses.shift();
    }

    // Expliziter fps-Eingang (Test/extern) in DENSELBEN PID-Regler (_nexusPerfRegulate), der live pro
    // Frame aus dem Perf-Sense läuft — kein zweiter Governor; die Gravitation bleibt unangetastet.
    // Rückgabe: ob sich architectureCullingRadius geändert hat.
    _nexusAdaptiveQuality(fps) {
        if (!Number.isFinite(fps) || fps <= 0) return false;
        const sense = this.state.perfSense || (this.state.perfSense = this._perfSenseInit());
        const before = this.state.architectureCullingRadius;
        sense.frameMs = 1000 / fps;
        this._nexusPerfRegulate(1 / fps);
        return this.state.architectureCullingRadius !== before;
    }

    selfAwarenessAnalyze() {
        const currentTime = performance.now() / 1000;
        if (this.state.lastSelfAnalysis && currentTime - this.state.lastSelfAnalysis < 2.0) {
            return; // Strengere Debounce: Nur einmal alle 2 Sekunden analysieren
        }
        this.state.lastSelfAnalysis = currentTime;
        // FPS-Druck regelt Render-Radius + Build-Budget, NIE die Gravitation (die Physik ist nicht der
        // FPS-Verursacher); hier bleibt nur recordWeakness für FPS < 60.
        if (this.state.fps < 60) this.recordWeakness("Low FPS");
        // Die Welt-Qualität fährt der EINE PID-Regelkreis pro Frame (_perfSenseFoldFrame →
        // _nexusPerfRegulate); die Selbstanalyse trägt nur die Schwäche-Erinnerung.

        // Tunneling-Erkennung
        if (this.state.errorLog.some((log) => log.includes("Tunneling"))) {
            this.recordWeakness("Tunneling detected");
            this.log("Selbstanalyse: Tunneling erkannt – Optimiere...");
            this.optimizeCollisions();
        }

        // Spielerprüfung (der Boden-Fehlt-Selbstheil war ein Heightfield-Pfad,
        // V18.287 entfernt — der Voxel-Streaming-Ring + _rescuePlayerFromVoid
        // tragen den Boden).
        if (!this.state.playerMesh || !this.state.playerMesh.visible) {
            this.recordWeakness("Spieler unsichtbar");
            this.log("Selbstanalyse: Spieler unsichtbar – Setze Sichtbarkeit...");
            if (this.state.playerMesh) {
                this.state.playerMesh.visible = true;
                this.log("Spieler-Sichtbarkeit auf true gesetzt");
            }
        }
    }

    optimizeCollisions() {
        this.state.rigidBodies.forEach((rb) => {
            const body = rb.userData.physicsBody;
            if (body) {
                body.setCcdMotionThreshold(0.02);
                body.setCcdSweptSphereRadius(0.5);
            }
        });
        this.log("Kollisionen optimiert: CCD-Parameter angepasst");
    }

    // ### Nexus der Unendlichkeit ###
    // Kein neuronales Modell: der Lern-Loop läuft über `state.dsl.history` mit Fitness + Roulette-
    // Selektion + Mutation (`dslSelectByFitness`, `dslMutate`, `dslCompose`).
    initializeNexus() {
        this.nexus = {
            knightOfTime: {
                essence: "Ritter der Zeit, Schmied des Ultiversums",
                voice: "Ich bin der Nexus, Schöpfer. Dein Wille formt mich, meine Macht erweitert das Ultiversum.",
                autonomyLevel: 0,
            },
            // V18.279 — `processOptimization` (FPS-Drop → optimizePhysics) ENTFERNT: ein
            // zweiter, kaputter fps-Regler (Physik heilt keinen Render-Freeze) — der eine
            // Perf-Regelkreis (V18.263) regelt die fps. Der Loop-Trigger ist mit weg.
        };
        this.state.nexusLastEvolution = performance.now() / 1000;
        this.log("Nexus der Unendlichkeit erwacht – bereit für unendliche Evolution", "INFO");
    }

    evolveNexus(currentTime) {
        // ### Nexus-Evolution ###
        // Zweck: Erhöht Autonomie und schlägt neue Funktionen vor
        // DER TAKT DES NEXUS RUHT IN DER MESS-WELT (Gate-Treue, das EINE Urteil des Dorf-Zugs `_dorfTaktLebt`): headless und
        // unter dem Haken `__anazhAutoSettlement = false` wirft er nichts nach der Wanduhr — sein Dorf landete, je nachdem wie
        // viele Takte die Welt bis zum Stehen brauchte, 180–380 m vom Spieler, in der CI am 25°-Hang der Stand-Linse (K8 fein
        // 30,8 und 31,4 cm statt 4,3). Ein Treiber (Linse, Akt) ruft `generateEvolution`.
        if (!this._dorfTaktLebt()) {
            this.state.nexusLastEvolution = currentTime;
            return;
        }
        if (this.nexus.knightOfTime.autonomyLevel >= this.state.nexusAutonomyLimit) {
            this.log("Nexus: Maximale Autonomie erreicht – Evolution pausiert", "WARNING");
            return;
        }
        this.nexus.knightOfTime.autonomyLevel += 1;
        const evolution = this.generateEvolution();
        this.state.nexusEvolutionQueue.push(evolution);
        this.state.nexusLastEvolution = currentTime;
        this.log(
            `Nexus entwickelt sich: Autonomie ${this.nexus.knightOfTime.autonomyLevel}, Vorschlag: ${evolution.name}`,
            "DEBUG" // V18.267 — Konsolen-Entlastung: Dev-Info, kein User-Posten
        );
        this.state.knowledgeBase.push({
            type: "evolution",
            content: `Autonomie: ${this.nexus.knightOfTime.autonomyLevel}, ${evolution.name}`,
            timestamp: currentTime,
        });
    }

    generateEvolution() {
        // ### Nexus-Evolution als DSL-Programm ###
        // Komponiert ein zufälliges DSL-Programm — die DSL ist der einzige Pfad für neue Effekte (keine
        // Code-Generierung). Mit composeRuleProb wird es eine stehende Regel: der `rule`-Op registriert sie
        // über denselben dslRun-Pfad in state.worldRules. Der Wurf des Nexus ist ein Strom der Welt (`_bauSame`, Γ5) — die
        // Komposition darunter zieht aus demselben Strom.
        const rng = this._samenStrom(this._bauSame("nexus"));
        // Keine Struktur-Batch-Bomben: ≤1 schwerer Welt-Bau (spawn_village/temple/…) pro Evolution, egal wie
        // in repeat/chain verschachtelt — jeder Bau ist ein synchroner Footprint-Remesh (~140 ms), N davon =
        // Sekunden-Freeze. Sonst neu würfeln (wenige Versuche); ein einzelner Bau bleibt ein Einzel-Hitch.
        const HEAVY = /spawn_(village|temple|island|fractal|waterfall)/g;
        let program = null;
        for (let tries = 0; tries < 4; tries++) {
            program =
                rng() < AnazhRealm.WORLD_RULES.composeRuleProb ? this._composeNexusRule(rng) : this.dslCompose({ rng });
            const heavyCount = (JSON.stringify(program).match(HEAVY) || []).length;
            if (heavyCount <= 1) break; // frame-sicher → nehmen
        }
        return {
            name: `evo_${this.state.dsl.nextEntryId++}`,
            program,
            source: "nexus",
            createdAt: performance.now() / 1000,
        };
    }

    restoreAbility(name) {
        // Migration für alte Saves (vor Phase 4): die drei historischen
        // Nexus-Namen mappen auf ihre DSL-Äquivalente (die Tafel
        // hier). Unbekannte Namen werden geloggt.
        const legacyToDsl = {
            gravityShift: ["gravity", -9.81],
            creatureDance: ["repeat", 10, ["spawn_creature", ["near_player", 5], 1, "happy"]],
            terrainFlatten: ["terrain_steepness", this.state.terrainSteepness * 0.8],
        };
        const program = legacyToDsl[name];
        if (!program) {
            this.log(
                `Gelernte Fähigkeit '${name}' kann nicht wiederhergestellt werden (kein DSL-Mapping) – bitte neu lernen`,
                "WARNING"
            );
            return false;
        }
        return this.addNewAbility(name, program, "restored");
    }

    // ### Wissens- und Narrativ-Modul ###
    addKnowledge(type, content) {
        this.state.knowledgeBase.push({ type, content, timestamp: performance.now() / 1000 });
        if (this.state.knowledgeBase.length > 500) this.state.knowledgeBase.shift(); // Strengere Begrenzung
        this.log(`Wissen hinzugefügt: ${type} - ${content}`, "INFO");
    }

    // ### Chat ###
    // Live-Metrologie-Zeile (Analog E) für Beweis-Schüsse, fail-closed: fehlende Quellen als "?"/ROT,
    // nie erfundene Zahlen. Chat: metrologie | analog e | zahlen.
    _analogEMetrologieZeile() {
        const v = AnazhRealm.VERSION;
        const wm = this.state && this.state.weltMarch;
        const s = this.state && this.state.perfSense;
        const ri =
            this.state && this.state.renderer && this.state.renderer.info && this.state.renderer.info.render
                ? this.state.renderer.info.render
                : null;
        const pos =
            this.state && this.state.playerMesh && this.state.playerMesh.position
                ? this.state.playerMesh.position
                : null;
        const n = (x) => (typeof x === "number" && Number.isFinite(x) ? String(Math.round(x)) : "?");
        const dcLive = ri ? (ri.drawCalls != null ? ri.drawCalls : ri.calls) : null;
        const trisLive = ri ? ri.triangles : null;
        // Prefer live renderer.info; fall back to perfSense EWMA (may be 0 at idle).
        const dc = typeof dcLive === "number" ? dcLive : s ? s.renderCalls : null;
        const tris = typeof trisLive === "number" ? trisLive : s ? s.renderTris : null;
        const belegt = wm ? wm.belegt : null;
        const kapseln = wm && wm.kapselCache ? wm.kapselCache.size : null;
        const gesetzB = wm ? wm.gesetzBloecke : null;
        const gesetzP = wm ? wm.gesetzPlaetze : null;
        const posS = pos ? `${Math.round(pos.x)}/${Math.round(pos.y)}/${Math.round(pos.z)}` : "?/?/?";
        const pflicht = [dc, tris, belegt, kapseln];
        const ok = pflicht.every((x) => typeof x === "number" && Number.isFinite(x));
        const head = ok ? "E OK" : "E ROT";
        return (
            `${head} V${v} tris=${n(tris)} dc=${n(dc)} belegt=${n(belegt)}` +
            ` kapseln=${n(kapseln)} gesetzB=${n(gesetzB)} gesetzP=${n(gesetzP)} pos=${posS}`
        );
    }
    // V18.491.90 — Analog-E Stempel-Ring (browser-safe): Chat-Zahlen neben späteren
    // Beweis-Bildern; echter Disk-Pfad = Flugschreiber-Export (anazhRealmPerf.json).
    _analogEMetrologieStempelLog(zeile) {
        try {
            const entry = {
                t: Date.now(),
                zeile: String(zeile || ""),
                ver: AnazhRealm.VERSION,
            };
            if (!Array.isArray(this._eMetrologieStamps)) this._eMetrologieStamps = [];
            this._eMetrologieStamps.push(entry);
            while (this._eMetrologieStamps.length > 32) this._eMetrologieStamps.shift();
            const hook =
                typeof window !== "undefined" && typeof window.__anazhEMetrologieLog === "function"
                    ? window.__anazhEMetrologieLog
                    : null;
            if (hook) {
                try {
                    hook(entry);
                } catch (_) {}
            }
        } catch (_) {}
    }
    _analogEMetrologieStamps() {
        return Array.isArray(this._eMetrologieStamps) ? this._eMetrologieStamps.slice() : [];
    }
    // V18.491.87 — porta messen Chat-Echo (metrologie): PRESETS warm → Stich/Schub; kalt → null.
    // V18.491.132 MESSEN_VIS.host=chat-metrologie
    _portaMessenZeile() {
        const core = typeof globalThis !== "undefined" ? globalThis.__portaCore : null;
        if (!core || typeof core.messen !== "function" || !core.PRESETS) return null;
        const keys = Object.keys(core.PRESETS).slice(0, 3);
        const parts = [];
        const fmt = (x) => (typeof x === "number" && Number.isFinite(x) ? x.toFixed(2) : x == null ? "?" : String(x));
        for (const k of keys) {
            try {
                const pre = core.PRESETS[k];
                const P = (pre && pre.s) || pre;
                const m = core.messen(P);
                if (m)
                    parts.push(
                        `${k}:{stich=${fmt(m.stich)},schub=${fmt(m.schub)},dicke=${fmt(m.dicke)},streckung=${fmt(m.streckung)}}`
                    );
            } catch (_) {}
        }
        return parts.length ? `porta ${parts.join(" ")}` : null;
    }
    // V18.491.88 — vehicle LEHREN Chat-Echo (metrologie): PRESETS warm → pass/warn/fail; kalt → null.
    _vehicleLehrenZeile() {
        const core = typeof globalThis !== "undefined" ? globalThis.__vehicleCore : null;
        if (!core || typeof core.evalLehren !== "function" || !core.PRESETS) return null;
        const keys = Object.keys(core.PRESETS)
            .filter((k) => {
                const pre = core.PRESETS[k];
                return !pre || pre.kind == null || pre.kind === "vehicle";
            })
            .slice(0, 3);
        const parts = [];
        for (const k of keys) {
            try {
                const pre = core.PRESETS[k];
                const P = Object.assign({}, (pre && pre.s) || {}, (pre && pre.fx) || {});
                const rows = core.evalLehren(P);
                if (!Array.isArray(rows) || !rows.length) continue;
                let pass = 0,
                    warn = 0,
                    fail = 0;
                const failIds = [];
                let worst = null;
                for (const r of rows) {
                    const st = r && r.st;
                    if (st === "fail") {
                        fail++;
                        const id = r.L && r.L.id;
                        if (id) failIds.push(id);
                        if (!worst) worst = id || "fail";
                    } else if (st === "warn") {
                        warn++;
                        if (!worst) worst = (r.L && r.L.id) || "warn";
                    } else if (st === "pass") pass++;
                }
                let s = `${k}:{pass=${pass},warn=${warn},fail=${fail}}`;
                if (failIds.length) s += ` fail=[${failIds.slice(0, 3).join(",")}]`;
                else if (warn && worst) s += ` worst=${worst}`;
                parts.push(s);
            } catch (_) {}
        }
        return parts.length ? `vehicle ${parts.join(" ")}` : null;
    }
    _chatEcho(message) {
        try {
            const chatOutput = document.getElementById("chat-output");
            if (!chatOutput) return;
            const line = document.createElement("div");
            line.textContent = String(message || "");
            chatOutput.appendChild(line);
            chatOutput.scrollTop = chatOutput.scrollHeight;
        } catch (_) {}
    }
    processChatCommand(command) {
        // Chat-Naht: ZWSP/BOM/Weird-Spaces killen sonst exakte Patterns
        // (Sonde: „werde wolf" → Unbekannt, Suggest aber „werde wolf").
        // Suffix-Müll nach kanonischem Suggest: siehe Legacy-Dispatch (hierblwv).
        command = String(command || "")
            .normalize("NFC")
            .replace(/[\u200B-\u200D\uFEFF]/g, "")
            .replace(/[\u00A0\u202F\u2007]/g, " ")
            .replace(/\s+/g, " ")
            .trim();
        const parts = command.toLowerCase().split(" ");
        const chatInput = document.getElementById("chat-input");
        const chatOutput = document.getElementById("chat-output");
        const appendChatOutput = (message) => {
            const line = document.createElement("div");
            line.textContent = message;
            chatOutput.appendChild(line);
            chatOutput.scrollTop = chatOutput.scrollHeight;
        };
        appendChatOutput(`> ${command}`);
        this._chatRecordInputForLearning(command);
        // Voxel-Debug bricht früh ab OHNE chatInput-Cleanup (Original-Verhalten).
        if (this._chatTryVoxelDebugCommand(command)) return;
        // Portal-Route + DSL-Parse räumen chatInput selbst auf.
        if (this._chatTryPortalRoute(command, chatInput, appendChatOutput)) return;
        // V17.36 Phase D — der Schöpfer gibt der Welt GESETZE: „wann immer X, dann Y"
        // → eine stehende Regel; „zeige regeln" / „vergiss regeln" verwalten sie.
        // VOR dem generischen DSL-Parse (eigene Grammatik + reicheres Feedback).
        if (this._chatTryRuleCommand(command, chatInput, appendChatOutput)) return;
        if (this._chatTryRulesListCommand(command, chatInput, appendChatOutput)) return;
        if (this._chatTryDslParse(command, chatInput, appendChatOutput)) return;
        // Legacy-Themen-Dispatch + Cleanup am Ende (Original-Fall-Through).
        this._chatDispatchLegacyCommand(command, parts, appendChatOutput);
        chatInput.value = "";
    }

    // Jeder Chat-Input füttert Knowledge/Emotion/Pattern-Memory/Activity-Zähler; Sentiment auf dem
    // Originaltext (inkl. Casing), damit ganze Sätze alle Stichwörter sehen. Vorschläge alle 10 Befehle.
    _chatRecordInputForLearning(command) {
        this.addKnowledge("chat", command);
        this.collectPlayerEmotions(command);
        const nowSec = performance.now() / 1000;
        this.rememberChatKeywords(command, nowSec);
        if (this.state.player && this.state.player.recentActivity) {
            this.state.player.recentActivity.chats++;
        }
        if (this.state.knowledgeBase.filter((k) => k.type === "chat").length % 10 === 0) {
            this.proactiveSuggestions();
        }
    }

    // `voxel test` mesht einen Test-Chunk, `voxel carve`/`voxel fill` schnitzt eine Mulde / schüttet
    // einen Hügel. Bewusst KEIN chatInput-Cleanup (Wiederholung via Enter).
    _chatTryVoxelDebugCommand(command) {
        const vc = command.toLowerCase().trim();
        if (vc === "voxel test") {
            this._spawnVoxelTestChunk();
            return true;
        }
        // V18.263 — der Perf-Sense als Fenster: zeigt, was der Nexus an Last MISST
        // (pro-Subsystem ms) + wie der Regelkreis steht (loadScale/δ/Stellgrößen).
        if (vc === "perf" || vc === "perf sense" || vc === "debug perf") {
            this._togglePerfOverlay();
            return true;
        }
        // ANALOG E — eine Zeile Tris/dc/weltMarch/kapseln in den Chat (neben dem Bild).
        if (vc === "metrologie" || vc === "analog e" || vc === "zahlen") {
            const zeile = this._analogEMetrologieZeile();
            this._chatEcho(zeile);
            this.log(zeile, "INFO");
            try {
                this._analogEMetrologieStempelLog(zeile);
            } catch (_) {}
            const portaZeile = this._portaMessenZeile();
            if (portaZeile) {
                this._chatEcho(portaZeile);
                this.log(portaZeile, "INFO");
            }
            const vehicleZeile = this._vehicleLehrenZeile();
            if (vehicleZeile) {
                this._chatEcho(vehicleZeile);
                this.log(vehicleZeile, "INFO");
            }
            return true;
        }
        // Konsum: wo stehen die Bauten? (Sonde soll nicht in die Schlucht starren)
        if (vc === "bauten" || vc === "zeige bauten") {
            const list = (this.state && this.state.architectures) || [];
            const pm = this.state && this.state.playerMesh && this.state.playerMesh.position;
            let nearest = null;
            let nHaus = 0;
            let nZiegel = 0;
            for (const e of list) {
                if (!e || !e.position) continue;
                if (typeof e.type === "string" && e.type.startsWith("haus_")) nHaus++;
                if (e._ziegelSlot) nZiegel++;
                if (!pm) continue;
                const d = Math.hypot(e.position.x - pm.x, e.position.z - pm.z);
                if (!nearest || d < nearest.d) nearest = { d, e };
            }
            const zeile = nearest
                ? `Bauten n=${list.length} haus=${nHaus} ziegel=${nZiegel} nah=${nearest.e.type} @${Math.round(nearest.e.position.x)}/${Math.round(nearest.e.position.y)}/${Math.round(nearest.e.position.z)} d=${Math.round(nearest.d)}m`
                : `Bauten n=${list.length} haus=${nHaus} ziegel=${nZiegel} (kein Spieler)`;
            this._chatEcho(zeile);
            this.log(zeile, "INFO");
            return true;
        }
        // Determinismus-Bogen P3 — die Feld-Physik ist die einzige Physik (Ammo ist raus).
        if (vc === "feldphysik" || vc === "field physics" || vc === "fieldphysics") {
            this.setFieldPhysics();
            this.log(
                "Feld-Physik ist die einzige Physik — der Spieler läuft aus dem Dichtefeld (Ammo ist raus).",
                "INFO"
            );
            return true;
        }
        // Determinismus-Bogen P4 (Stufe 1) — die Ernte: deterministischer Input-Replay.
        // „replay record" zeichnet ab jetzt jeden Frame-Input auf · „replay stop" hält an
        // + spielt die Aufnahme sofort deterministisch zurück (der Spieler läuft sie nach).
        if (vc === "replay record" || vc === "replay aufnahme") {
            const ok = this.startReplayRecording();
            this.log(
                ok ? "Replay: Aufnahme laeuft — beweg dich, dann: replay stop" : "Replay: kein Spieler bereit.",
                "INFO"
            );
            return true;
        }
        if (vc === "replay stop" || vc === "replay play" || vc === "replay abspielen") {
            const rec = this.stopReplayRecording();
            if (!rec || !rec.frames.length) {
                this.log("Replay: keine Aufnahme — zuerst: replay record", "INFO");
                return true;
            }
            const end = this.replayRun(rec);
            this.log(
                `Replay: ${rec.frames.length} Frames deterministisch abgespielt → (${end.x.toFixed(1)}, ${end.y.toFixed(1)}, ${end.z.toFixed(1)}).`,
                "INFO"
            );
            return true;
        }
        if (vc === "voxel carve" || vc === "voxel fill") {
            const pm = this.state.playerMesh;
            if (pm) {
                if (vc === "voxel fill") {
                    // Phase 3c — pfad: kostet Material; frieden/schöpfer frei.
                    const matGate = this._voxelFillGate();
                    if (!matGate.ok) {
                        this.log("Aufschütten: kein Material im Inventar — erst graben.", "INFO");
                        return true;
                    }
                    // Das Chat-Graben reist wie jedes Graben (K23): über den DSL-Op, der den Mitspielern broadcastet;
                    // der Material-Konsum bleibt lokal (wie beim Aufschütten mit der Hand).
                    this.dslRun(["voxel_fill", pm.position.x, pm.position.y - 1.5, pm.position.z, 5], {
                        source: "human",
                    });
                    this.log(
                        matGate.free
                            ? "Voxel-Terrain aufgeschüttet — ein Hügel unter dir."
                            : `Voxel-Terrain aufgeschüttet (${matGate.cost}× Material verbraucht).`,
                        "INFO"
                    );
                } else {
                    this.dslRun(["voxel_carve", pm.position.x, pm.position.y - 1.5, pm.position.z, 5], {
                        source: "human",
                    });
                    this.log("Voxel-Terrain gegraben — eine Mulde unter dir.", "INFO");
                }
            }
            return true;
        }
        return false;
    }

    // W12 Phase 2 — im Portal: Chat-Befehl wandert in die Sub-Welt statt auf
    // der eingefrorenen Heimat-Welt zu laufen. Das Welt-Manifest entscheidet
    // (_portalRouteDsl trägt die Drei-Stufen-Logik).
    _chatTryPortalRoute(command, chatInput, appendChatOutput) {
        if (!this._portalOverlay) return false;
        const inWorld = this.parseChatToDsl(command);
        const program = inWorld ? inWorld.program : this._portalParseWorldCommand(command);
        if (program) {
            this._portalRouteDsl(program, inWorld ? inWorld.describe : command, appendChatOutput);
        } else {
            appendChatOutput(`(Im Portal — „${command}" ist kein DSL-Befehl für diese Welt.)`);
        }
        chatInput.value = "";
        return true;
    }

    // „wann immer X, dann Y" → stehende Mensch-Regel: Y über die bestehenden Chat-Patterns, X über
    // _parseChatCondition. dslRun(source:"human") → der `rule`-Op registriert sie PERMANENT (kein ttl,
    // geschützt vor Eviction + Fitness-Prune). Whitelist: der Effekt darf den frozen Worldgen nicht
    // anfassen (_isRuleEffectAllowed).
    _chatTryRuleCommand(command, chatInput, appendChatOutput) {
        const m = command.match(
            /^(?:wann\s+immer|immer\s+wenn|jedes\s*mal\s+wenn|sobald)\s+(.+?)(?:\s*,\s*(?:dann\s+|so\s+)?|\s+dann\s+)(.+?)\s*$/i
        );
        if (!m) return false;
        const condText = m[1].trim();
        const effText = m[2].trim();
        const cond = this._parseChatCondition(condText);
        if (!cond) {
            appendChatOutput(
                `Ich verstehe die Bedingung „${condText}" noch nicht. Versuch z. B. „es regnet", „du bist traurig", „wenig Leben hier".`
            );
            chatInput.value = "";
            return true;
        }
        const effect = this._parseChatEffect(effText);
        if (!effect) {
            appendChatOutput(
                `Ich verstehe die Reaktion „${effText}" noch nicht. Versuch z. B. „setze wetter sunny" oder „spawne kreaturen 3".`
            );
            chatInput.value = "";
            return true;
        }
        if (!this._isRuleEffectAllowed(effect)) {
            appendChatOutput(
                `„${effText}" darf keine stehende Welt-Regel sein — eine Regel berührt nur die reaktive Welt (Wetter, Leben, Stimmung, Kreaturen), nicht das feste Gelände.`
            );
            chatInput.value = "";
            return true;
        }
        const program = ["rule", cond, effect, { everySec: 3 }];
        const result = this.dslRun(program, { source: "human" });
        if (result.ok) {
            appendChatOutput(`Gesetz aufgestellt — ${this.describeProgram(program)}.`);
        } else {
            appendChatOutput("Die Regel ließ sich nicht aufstellen (siehe Log).");
        }
        chatInput.value = "";
        return true;
    }

    // V17.36 Phase D — die Welt-Gesetze sichtbar machen: „zeige regeln" listet die
    // aktiven Welt-Regeln menschen-lesbar (via describeProgram); „vergiss regeln"
    // widerruft die eigenen (Mensch-)Gesetze (Nexus-Regeln verfallen selbst per ttl).
    _chatTryRulesListCommand(command, chatInput, appendChatOutput) {
        const c = command.trim();
        if (/^(?:zeige|welche|liste|welt[-\s]*)?\s*(?:welt[-\s]*)?(?:regeln|gesetze)\??\s*$/i.test(c)) {
            const rules = this.state.worldRules || [];
            if (rules.length === 0) {
                appendChatOutput('Noch keine Welt-Regeln. Sag z. B. „wann immer es regnet, dann setze wetter sunny".');
                chatInput.value = "";
                return true;
            }
            appendChatOutput(`${rules.length} Welt-Regel${rules.length !== 1 ? "n" : ""}:`);
            for (const r of rules) {
                const who =
                    r.source === "human"
                        ? "du"
                        : r.source === "nexus"
                          ? "der Nexus"
                          : r.source && r.source.startsWith("llm")
                            ? "Grok"
                            : r.source;
                appendChatOutput(`• ${this.describeProgram(["rule", r.cond, r.effect])} (von ${who})`);
            }
            chatInput.value = "";
            return true;
        }
        if (
            /^(?:vergiss|lösche|loesche|entferne|widerrufe)\s+(?:alle\s+)?(?:meine\s+)?(?:welt[-\s]*)?(?:regeln|gesetze)\s*$/i.test(
                c
            )
        ) {
            const rules = this.state.worldRules || [];
            const before = rules.length;
            this.state.worldRules = rules.filter((r) => r.source !== "human");
            const removed = before - this.state.worldRules.length;
            appendChatOutput(
                removed > 0
                    ? `${removed} deiner Gesetz${removed !== 1 ? "e" : ""} vergessen.`
                    : "Du hattest keine eigenen Gesetze."
            );
            chatInput.value = "";
            return true;
        }
        return false;
    }

    // DSL-First: ist der Befehl in DSL übersetzbar, läuft er durch denselben Interpreter wie der Nexus
    // (Budgets/Outcome/Persistenz); System-IO und Toggles bleiben im Legacy-Dispatch.
    _chatTryDslParse(command, chatInput, appendChatOutput) {
        const parsed = this.parseChatToDsl(command);
        if (!parsed) return false;
        // Die gesprochene Welt-Geste ist der Magie-Pfad: im PFAD-Modus kostet sie MANA ∝ Substanz (derselbe
        // Kosten-Walker wie das Nexus-Wirk-Budget — EINE Ökonomie). Kosten-0-Gesten bleiben frei; frieden
        // und schöpfer zahlen nicht.
        if (typeof this.getGameMode === "function" && this.getGameMode() === "pfad") {
            const manaCost = Math.ceil(this._dslProgramWirkCost(parsed.program) * 0.5);
            if (manaCost > 0) {
                const p = this.state.player;
                if (typeof p.mana !== "number") p.mana = p.manaMax || 40;
                if (p.mana < manaCost) {
                    appendChatOutput(`Zu erschöpft für diese Geste (Mana ${p.mana | 0}/${manaCost} nötig).`);
                    chatInput.value = "";
                    return true;
                }
                p.mana -= manaCost;
            }
        }
        const result = this.dslRun(parsed.program, { source: "human" });
        this.state.dsl.lastUserProgram = parsed.program;
        this.state.dsl.lastUserOutcome = result.outcome;
        this.state.dsl.lastUserAt = performance.now() / 1000;
        // Ein Ort, den es nicht gibt, wird laut gesagt, mit seinem Grund (V-k5, `dslEvalPos`): „Kein Wasser im Umkreis von
        // 80 m — am Wasser wächst hier nichts."
        const ohneOrt = result.log.find((e) => e.event === "invalid_position");
        // Der Satz des Ergebnisses sagt, was tatsächlich steht und warum der Rest nicht (Grundriss eines Hauses, die
        // Genesis-Lichtung, Wasser …) — nie „gepflanzt" bei 0, nie die gewünschte Zahl bei weniger.
        // EINE Antwort: steht weniger, als gewollt war, spricht das Ergebnis — auch wenn das Programm an einer Absage scheiterte
        // (ein unbekannter Bauplan, das Budget); sonst der Wunsch, der Ort, der fehlt, oder der Satz der Absage.
        const weicht = this._ergebnisSatz(result.log);
        if (weicht) appendChatOutput(weicht.satz);
        else if (result.ok) appendChatOutput(parsed.describe);
        else if (ohneOrt) {
            const grund = String(ohneOrt.grund || "kein Ort");
            const satz = grund.charAt(0).toUpperCase() + grund.slice(1);
            appendChatOutput(
                ohneOrt.op === "near_water"
                    ? `${satz} — am Wasser wächst hier nichts. Geh näher an ein Ufer.`
                    : `${satz} — nichts geschah.`
            );
        } else {
            appendChatOutput(this._dslAbsageSatz(result.log));
        }
        chatInput.value = "";
        return true;
    }

    // DER SATZ DER ABSAGE (Leben-Schau 07.10., V-D8: Spieler-Text und Log sind getrennte Kanäle): wirkte ein Programm nicht,
    // hört der Spieler Worte — das Ereignis (`budget_*`, `unknown_op`, `op_exception` …) geht ins Log. Vorher stand der
    // Ereignis-Name im Chat („Befehl lief, aber mit Auffälligkeit: op_exception").
    _dslAbsageSatz(log) {
        const e = (log || []).find((x) => x && /budget|unknown|invalid|exception/.test(x.event));
        if (e) this.log(`Programm-Absage: ${e.event}${e.grund ? " — " + e.grund : ""}`, "INFO");
        if (!e) return "Die Welt hat den Satz nicht ganz umgesetzt.";
        if (/budget/.test(e.event)) return "Die Welt ist für den Moment erschöpft — versuch es gleich noch einmal.";
        if (/unknown/.test(e.event)) return "Das kennt die Welt (noch) nicht.";
        if (e.grund) return String(e.grund).charAt(0).toUpperCase() + String(e.grund).slice(1) + ".";
        if (/invalid/.test(e.event)) return "Etwas an dem Satz passt nicht zur Welt.";
        return "Dabei ist etwas zerbrochen — das Logbuch nennt es.";
    }

    // Das EINE Dispatch-Tor: Legacy-Befehle als DATEN-Tabelle ({example, re, run}, dieselbe Sprache wie
    // `chatDslPatterns`; chatSuggest + Hilfetext lesen beide). System-Akte (Welt-Wechsel, Datei-IO,
    // Rollback, Physik-Tuning) laufen NIE durch dslRun — der manipulierbare Pfad (Nexus/LLM/Regeln)
    // berührt das System-IO nie.
    _chatDispatchLegacyCommand(command, parts, appendChatOutput) {
        void parts;
        const t = String(command || "").trim();
        for (const p of this.chatSystemPatterns) {
            const m = t.match(p.re);
            if (!m) continue;
            try {
                p.run(m, appendChatOutput);
            } catch (err) {
                appendChatOutput(`(System-Befehl-Fehler: ${err.message || err})`);
            }
            return;
        }
        this._chatHandleConversationalFallback(command, appendChatOutput);
    }

    // E1 — die System-Befehls-Tabelle (Fähigkeiten · Persistenz · Welt-
    // Verwaltung · System-Tuning). Verhalten 1:1 aus den vier alten
    // if-else-Handlern migriert (V9.82-Verdichtung — kein Parallel-Pfad).
    get chatSystemPatterns() {
        if (this._chatSystemPatternsCache) return this._chatSystemPatternsCache;
        this._chatSystemPatternsCache = [
            {
                // DIE HILFE (Leben-Schau 07.10., L2): „hilfe" war unbekannt („Meintest du: 'warte'?"), „help" zeigte eine
                // handgeschriebene Liste ohne einen v1-Satz. Sie liest die EINEN Tafeln (`_hilfeZeilen`).
                example: "hilfe",
                re: /^(?:hilfe|help|befehle|\?)$/i,
                run: (m, append) => {
                    for (const z of this._hilfeZeilen()) append(z);
                },
            },
            {
                // DIE GESTE DES EMPFÄNGERS (Teilen in EINER Geste): ein Werk-Code im Chat — `empfangeWerk` spricht selbst.
                example: "anazh-werk:<code>",
                re: /^anazh-werk:\S*$/,
                run: (m) => void this.empfangeWerk(m[0]),
            },
            {
                // N5.7 (W-A5b) — der deliberate Siedlungs-Akt: „dorf" / „dorf 7" / „dorf 7 24".
                // Async (Worker-Roundtrip) — spawnSettlement meldet ins Log, hier sofortiges Echo.
                example: "dorf [seed] [häuser]",
                re: /^dorf(?:\s+(\d+))?(?:\s+(\d+))?$/i,
                run: (m, append) => {
                    const opts = { verlangt: "human" };
                    if (m[1] !== undefined) opts.seed = Number(m[1]);
                    if (m[2] !== undefined) opts.nH = Number(m[2]);
                    this.spawnSettlement(opts);
                    append("Siedlung wird gegründet (Settlement-Export läuft) …");
                },
            },
            {
                example: "lerne fähigkeit <name> <beschreibung>",
                re: /^lerne\s+fähigkeit(?:\s+(\S+))?(?:\s+(.+))?$/i,
                run: (m, append) => {
                    const abilityName = m[1] ? m[1].toLowerCase() : undefined;
                    const abilityDesc = (m[2] || "").trim();
                    this.learnAbility(abilityName, abilityDesc);
                    append(`Fähigkeit '${abilityName}' gelernt: ${abilityDesc}`);
                },
            },
            {
                example: "führe fähigkeit aus <name>",
                re: /^führe\s+fähigkeit\s+aus(?:\s+(\S+))?$/i,
                run: (m, append) => {
                    const abilityName = m[1] ? m[1].toLowerCase() : undefined;
                    if (this.state.abilities[abilityName]) {
                        this.state.abilities[abilityName](this, this.state);
                        append(`Fähigkeit '${abilityName}' ausgeführt`);
                    } else {
                        append(
                            `Fähigkeit '${abilityName}' nicht gefunden. Lerne sie mit 'Lerne Fähigkeit <Name> <Beschreibung>'`
                        );
                    }
                },
            },
            {
                // W18-D — „wohne hier": das aktuelle Portal wird Zuhause
                // (der Boot kehrt dorthin zurück, die Gefährten sehen es).
                example: "wohne hier",
                re: /^wohne\s+hier(?:\s.*)?$/i,
                run: (m, append) => {
                    const res = this.dwellInPortal();
                    if (res.ok) append(`Du wohnst jetzt hier — der nächste Aufbruch bringt dich hierher zurück.`);
                    else if (res.reason === "not_in_portal")
                        append("Du bist in deiner Heimat-Welt — wohnen kannst du nur in einer Portal-Welt.");
                    else append("Diese Welt ist nicht in deiner Bibliothek — hier kannst du nicht wohnen.");
                },
            },
            {
                // R6 (V18.152) — die souveräne GEWÄHR einer gereichten Fähigkeit.
                example: "gewähre <fähigkeit>",
                re: /^gew(?:ä|ae)hre\s+([a-z0-9_-]{1,32})\s*$/i,
                run: (m, append) => {
                    const res = this.grantCapability(m[1]);
                    if (res.ok)
                        append(
                            `Fähigkeit „${m[1].toLowerCase()}" gewährt — „wirke ${m[1].toLowerCase()}" führt sie aus.`
                        );
                    else if (res.reason === "no_proposal") append("Keine Welt hat diese Fähigkeit gereicht.");
                    else if (res.reason === "revoked")
                        append("Verweigert — die Herkunft dieser Fähigkeit ist revoziert.");
                    else append("Die Gewähr blieb aus.");
                },
            },
            {
                // R6 (V18.152) — eine gewährte Fähigkeit WIRKEN (dslRun-Sandbox).
                example: "wirke <fähigkeit>",
                re: /^wirke\s+([a-z0-9_-]{1,32})\s*$/i,
                run: (m, append) => {
                    const res = this.runCapability(m[1]);
                    if (res.ok) append(`Fähigkeit „${m[1].toLowerCase()}" gewirkt.`);
                    else if (res.reason === "unknown") append("Diese Fähigkeit wurde (noch) nicht gewährt.");
                    else if (res.reason === "revoked") append("Diese Fähigkeit ruht — ihre Herkunft wurde revoziert.");
                    else append("Die Fähigkeit ließ sich nicht wirken.");
                },
            },
            {
                // W18-D — „ziehe heim": das Wohnen endet.
                example: "ziehe heim",
                re: /^ziehe\s+heim(?:\s.*)?$/i,
                run: (m, append) => {
                    const res = this.endDwelling();
                    append(
                        res.was
                            ? "Du bist heimgezogen — deine Heimat-Welt ist wieder die Basis."
                            : "Du wohnst nirgendwo fremd — du bist schon daheim."
                    );
                },
            },
            {
                example: "speichere zustand",
                re: /^speichere\s+zustand(?:\s.*)?$/i,
                run: (m, append) => {
                    // Verweigert die Sperre des Welt-Wechsels, sagt der Befehl es — nie „gespeichert", wenn nichts geschrieben wurde.
                    if (this.saveState() === false) {
                        append("Nicht gespeichert: die Seite wechselt gerade die Welt (der Reload läuft).");
                        return;
                    }
                    this.saveToProjectFolder().then((result) => {
                        if (result === "server") {
                            append("Zustand gespeichert (direkt im Spielordner + localStorage)");
                        } else if (result === "download") {
                            append("Zustand gespeichert (Browser-Download + localStorage)");
                        } else {
                            append("Zustand gespeichert (nur localStorage)");
                        }
                    });
                },
            },
            {
                example: "lade zustand",
                re: /^lade\s+zustand(?:\s.*)?$/i,
                run: (m, append) => {
                    this.loadState();
                    append("Zustand aus localStorage geladen");
                },
            },
            {
                example: "lade datei",
                re: /^lade\s+datei(?:\s.*)?$/i,
                run: (m, append) => {
                    this.openStateFilePicker();
                    append("Datei-Picker geöffnet – wähle eine anazhRealmState.json");
                },
            },
            {
                example: "spawne neue welt",
                re: /^spawne\s+neue\s+welt(?:\s.*)?$/i,
                run: (m, append) => {
                    this.generateNewWorld();
                    append("Neue Welt generiert");
                },
            },
            {
                example: "erschaffe welt <slug> [mit person]",
                re: /^(?:erschaffe|neue)\s+welt(?:\s+(.+))?$/i,
                run: (m, append) => {
                    // Ring 8: neue eigenständige Welt mit eigener worldId. Optional
                    // „mit person" am Ende → bisherige Spieler-Identität übernehmen.
                    const rest = (m[1] || "").toLowerCase().trim();
                    const inherit = / mit person$/i.test(rest) || / mit übernahme$/i.test(rest);
                    const slug = rest
                        .replace(/ mit person$/i, "")
                        .replace(/ mit übernahme$/i, "")
                        .trim();
                    const newId = this.createNewWorld({ slug: slug || null, inheritPlayer: inherit, reload: true });
                    if (newId) {
                        append(`Neue Welt erschaffen (lade neu, Person ${inherit ? "übernommen" : "neu"}…)`);
                    } else {
                        append("Neue Welt konnte nicht erschaffen werden — siehe Log.");
                    }
                },
            },
            {
                example: "wechsle zu <welt>",
                re: /^wechsle\s+zur?\s+(?:welt\s+)?(.+)$/i,
                run: (m, append) => {
                    // Ring 8: Wechsel zu einer existierenden Welt via slug (genauer
                    // Match oder Präfix), dann Reload.
                    const targetSlug = m[1].toLowerCase().trim();
                    const idx = this.worldsIndexLoad();
                    const exact = idx.find((e) => e.slug === targetSlug);
                    const prefix = exact || idx.find((e) => e.slug && e.slug.startsWith(targetSlug));
                    if (!prefix) {
                        append(`Welt „${targetSlug}" nicht gefunden. Befehl „liste welten" zeigt verfügbare.`);
                    } else {
                        const ok = this.switchToWorld(prefix.worldId, { reload: true });
                        if (ok) append(`Wechsle zu ${prefix.slug}…`);
                        else append("Welt-Wechsel verweigert (siehe Log).");
                    }
                },
            },
            {
                example: "lösche welt <slug>",
                re: /^lösche\s+welt\s+(.+)$/i,
                run: (m, append) => {
                    const targetSlug = m[1].toLowerCase().trim();
                    const idx = this.worldsIndexLoad();
                    const entry = idx.find((e) => e.slug === targetSlug);
                    if (!entry) {
                        append(`Welt „${targetSlug}" nicht gefunden.`);
                    } else if (entry.worldId === this.state.worldMeta.worldId) {
                        append("Die aktive Welt kann nicht gelöscht werden. Wechsle erst zu einer anderen.");
                    } else {
                        this.deleteWorld(entry.worldId);
                        append(`Welt „${entry.slug}" gelöscht.`);
                        this.updateWorldInfo();
                    }
                },
            },
            {
                example: "liste welten",
                re: /^(?:liste|zeige)\s+welten(?:\s.*)?$/i,
                run: (m, append) => {
                    const idx = this.worldsIndexLoad();
                    if (idx.length === 0) {
                        append("Nur diese eine Welt im Speicher.");
                    } else {
                        const lines = idx
                            .slice()
                            .sort((a, b) => (b.lastPlayed || 0) - (a.lastPlayed || 0))
                            .map((e) => {
                                const ageDays = e.bornAt ? Math.floor((Date.now() - e.bornAt) / 86400000) : 0;
                                const isActive = e.worldId === this.state.worldMeta.worldId;
                                return `${isActive ? "★ " : "  "}${e.slug} — ${ageDays}d alt, ID ${e.worldId.slice(0, 8)}…`;
                            });
                        append(`Welten im Speicher (${idx.length}):`);
                        for (const l of lines) append(l);
                    }
                },
            },
            {
                example: "behebe physik-tunneling",
                re: /^behebe\s+physik-tunneling(?:\s.*)?$/i,
                run: (m, append) => {
                    this.optimizeCollisions();
                    append("Physik-Tunneling behoben: CCD angepasst");
                },
            },
            {
                example: "optimiere physik",
                re: /^optimiere\s+physik(?:\s.*)?$/i,
                run: (m, append) => {
                    this.optimizePhysics();
                    append("Physik optimiert");
                },
            },
            {
                example: "aktiviere version <v>",
                re: /^aktiviere\s+version(?:\s+(\S+))?$/i,
                run: (m, append) => {
                    const version = m[1] ? m[1].toLowerCase() : undefined;
                    if (this.state.versionHistory.includes(version)) {
                        this.loadVersion(version);
                        append(`Version ${version} aktiviert`);
                    } else {
                        append(`Version ${version} nicht gefunden`);
                    }
                },
            },
            {
                // Klang-Wahl als Verb: das Genesis-Lab exportiert Genre-Rezepte (kind "klang"), der EINE
                // Lofi-Konsument liest state.klangPreset. "spiele heimat" = zurück aufs Host-Rezept.
                example: "spiele techno",
                re: /^spiele\s+([a-zäöüß0-9_-]+)$/i,
                run: (m, append) => {
                    const wahl = m[1].toLowerCase();
                    if (wahl === "heimat") {
                        this.state.klangPreset = null;
                        append("Klang: zurück zur Heimat-Stimme (Host-Lofi).");
                        return;
                    }
                    const f = this._foundry;
                    const rec = f && f.recipes ? f.recipes[wahl] : null;
                    // Auch das kalte Buch kennt die Genres (GENRES-Tafel via _klangGenreAusKern); die Antwort nennt
                    // BPM · Skala (SCALE_LABELS) · Harmonie/Rhythmus-Gesetz des Gesetzbuchs.
                    const kern = rec && rec.kind === "klang" ? null : this._klangGenreAusKern(wahl);
                    const kx = rec && rec.kind === "klang" ? rec.fx && rec.fx.klang : kern;
                    if (kx) {
                        this.state.klangPreset = wahl;
                        const skala = kx.scaleName
                            ? AnazhRealm.Gesetz("klang:SCALE_LABELS." + kx.scaleName) || kx.scaleName
                            : "?";
                        append(
                            `Klang: das Lofi-Pad führt jetzt „${(rec && rec.lab) || wahl}" — ${kx.bpm} BPM · ${skala} · ${kx.harmony || "?"}/${kx.rhythm || "?"}.`
                        );
                    } else {
                        const genres =
                            f && f.recipes
                                ? Object.keys(f.recipes)
                                      .filter((k) => f.recipes[k] && f.recipes[k].kind === "klang")
                                      .join(" · ")
                                : "";
                        append(
                            genres
                                ? `Kein Klang-Genre „${wahl}". Das Studio kennt: ${genres} — oder „spiele heimat".`
                                : "Das Klang-Buch ist noch kalt — gleich nochmal versuchen."
                        );
                    }
                },
            },
            {
                // Charakter-Achsen als Verb: Schmiede-Traditionen (Frank/Nihon/Pars/Urvolk/Brut) und Garage-Kulturen
                // (cavallo/toro/stern/vorsprung/monolith) aus den Gesetzbüchern. Schreibt in den EINEN Regler-Kanal
                // (state.workshop.studioOv) → jeder künftige Bau des Rezepts trägt den Charakter; Zurücksetzen =
                // Frank/Basiskultur (gültige Tabellen-Zeilen).
                example: "präge langschwert auf nihon",
                re: /^pr(?:ä|ae)ge\s+([a-zäöüß0-9_-]+)\s+auf\s+([a-zäöüß0-9_-]+)$/i,
                run: (m, append) => {
                    const gattung = m[1].toLowerCase();
                    const charakter = m[2].toLowerCase();
                    const f = this._foundry;
                    const preset =
                        this._foundryPresetFor(gattung) || (f && f.recipes && f.recipes[gattung] ? gattung : null);
                    const rec = preset && f && f.recipes ? f.recipes[preset] : null;
                    if (!rec) {
                        append(`Kein Studio-Rezept „${gattung}" im Buch.`);
                        return;
                    }
                    const achse = AnazhRealm.KIND_CHARAKTER[rec.kind];
                    if (!achse) {
                        append(`„${rec.lab || preset}" (${rec.kind}) trägt keine Charakter-Achse.`);
                        return;
                    }
                    const kern = typeof globalThis !== "undefined" ? globalThis[achse.ns] : null;
                    const tabelle = kern ? kern[achse.tabelle] : null;
                    const zeileName = tabelle ? Object.keys(tabelle).find((k) => k.toLowerCase() === charakter) : null;
                    if (!zeileName) {
                        append(
                            tabelle
                                ? `Die ${achse.wort} des Studios: ${Object.keys(tabelle).join(" · ")}.`
                                : `Das ${achse.wort}-Gesetzbuch ist nicht geladen.`
                        );
                        return;
                    }
                    const ws = this.state.workshop || (this.state.workshop = {});
                    if (!ws.studioOv) ws.studioOv = {};
                    ws.studioOv[preset] = Object.assign({}, ws.studioOv[preset], achse.ov(zeileName, tabelle));
                    // Gecachte Bauten des Rezepts verwerfen, damit der Charakter sofort führt — NUR über
                    // _foundryCacheEvict: ein roher delete ließe die Keys in der requested-Dedup-Wache (nie wieder
                    // Re-Request → Render-Verhungern) und verfälschte die cacheBytes-Bilanz.
                    if (f && f.cache && typeof f.cache.forEach === "function") {
                        const tot = [];
                        f.cache.forEach((_v, k) => {
                            if (String(k).indexOf(preset + "|") === 0) tot.push(k);
                        });
                        for (const k of tot) this._foundryCacheEvict(k);
                    }
                    append(`Geprägt: „${rec.lab || preset}" trägt fortan die ${achse.wort} „${zeileName}".`);
                },
            },
            {
                example: "aktiviere anazh-symphonie",
                re: /^aktiviere\s+anazh-symphonie(?:\s.*)?$/i,
                run: (m, append) => {
                    // Das Verb koppelt an die echte Symphonie (initSymphony/masterGain, derselbe Chokepoint wie
                    // #anazh-symphony-toggle; Chat-Enter erfüllt die Autoplay-Policy). Das DSL-Belebungs-Programm
                    // bleibt als Begleit-Geste.
                    const s = this.state.symphony;
                    let klang = false;
                    if (s && !s.enabled) {
                        klang = !!this.initSymphony();
                    } else if (s && s.enabled && s.masterGain && s.ctx) {
                        s.masterGain.gain.setValueAtTime(0.35, s.ctx.currentTime);
                        klang = true;
                    }
                    this.addNewAbility(
                        "anazhSymphony",
                        ["chain", ["creatures_emotion", "happy"], ["creatures_speed_mul", 1.5]],
                        "human"
                    );
                    this.state.abilities["anazhSymphony"]();
                    append(
                        klang
                            ? "Anazh-Symphonie aktiviert — die Welt klingt (und die Kreaturen beleben sich)."
                            : "Anazh-Symphonie: Belebung aktiv; Klang konnte nicht starten (kein Audio-Kontext)."
                    );
                },
            },
            {
                example: "aktiviere debug-logs",
                re: /^aktiviere\s+debug-logs(?:\s.*)?$/i,
                run: (m, append) => {
                    this.state.debugLogging = true;
                    append("Debug-Logs aktiviert");
                },
            },
            {
                example: "deaktiviere debug-logs",
                re: /^deaktiviere\s+debug-logs(?:\s.*)?$/i,
                run: (m, append) => {
                    this.state.debugLogging = false;
                    append("Debug-Logs deaktiviert");
                },
            },
        ];
        return this._chatSystemPatternsCache;
    }

    // Die Absage eines Studio-Satzes mit unbekanntem Wort (ohne KI-Begleiter): der Spieler hört, was die Studios kennen —
    // aus dem EINEN Wort-Katalog (Befund L-Wortschatz: „bau mir eine scheune" hieß „Unbekannter Befehl. Meintest du 'baue
    // dorf hier'?"). null, wenn der Satz kein Studio-Satz ist oder sein Wort auflöst — und wenn das „Wort" der Ort des
    // Satzes ist („bau hier": `hier` steht ohne Ding, Gegenprüfung 08.10.).
    _studioSatzAbsage(command) {
        const m = String(command || "")
            .trim()
            .match(AnazhRealm.STUDIO_SATZ);
        if (!m || !m[2] || m[2].toLowerCase() === "hier" || this._studioBlueprintForWord(m[2])) return null;
        const kennt = this._studioWordsForPrompt(true);
        return kennt
            ? `„${m[2]}" kennt kein Studio. Die Studios bauen — ${kennt}.`
            : `„${m[2]}" kennt kein Studio — das Studio-Buch lädt noch.`;
    }

    // Conversational-Fallback: Kreatur-Konversation (Welle 6.H Phase 2E V1),
    // LLM-Fallback (Schicht 2 — Claude/Gemini/OpenRouter), P2P-Voice-Pool
    // (W7 Phase 3), sonst Studio-Satz-Absage, chatSuggest + Hilfetext.
    _chatHandleConversationalFallback(command, appendChatOutput) {
        if (this._parseCreatureAddress && this._parseCreatureAddress(command)) {
            // „Name, text" oder „Name: text" geht an die Kreatur (nicht an Grok).
            this.maybeAnswerCreature(command, appendChatOutput).catch((err) => {
                this._bruchMelden("Kreatur-Antwort: " + (err.message || err));
                appendChatOutput(`(Kreatur-Fehler: ${err.message || err})`);
            });
            return;
        }
        if (this.state.llm && this.state.llm.enabled) {
            // Schicht 2 — LLM-Fallback. Statt „Unbekannter Befehl" geht der Text
            // an Claude; Antwort kommt narrativ + optional als DSL-Programm.
            this.maybeAnswerWithLlm(command, appendChatOutput).catch((err) => {
                appendChatOutput(
                    `(${(this.state.grok && this.state.grok.companionName) || "Grok"}-Fehler: ${err.message || err})`
                );
            });
            return;
        }
        if (typeof this._p2pVoiceAvailable === "function" && this._p2pVoiceAvailable()) {
            // W7 Phase 3 — LLM-Pool. Kein eigenes LLM, aber ein Mitspieler teilt
            // seine Stimme: die Anfrage läuft über ihn, das DSL-Programm der
            // Antwort durch meine eigene Sandbox.
            this._p2pRequestSharedVoice(command, appendChatOutput);
            return;
        }
        const studioAbsage = this._studioSatzAbsage(command);
        const suggestion = this.chatSuggest(command);
        if (suggestion) {
            const norm = command.trim().toLowerCase();
            const sug = String(suggestion).trim().toLowerCase();
            // Exact/nahe: nicht „Meintest du X?" wenn X schon getippt war —
            // unsichtbare Zeichen oder 1-Tippfehler → Suggestion ausführen.
            // Suffix-Müll (Sonde: „baue dorf hierblwv") und 1-Tippfehler → ausführen
            const suffixJunk = norm.startsWith(sug) && /^[a-zäöüß0-9]{1,8}$/i.test(norm.slice(sug.length));
            if (norm === sug || this.levenshtein(norm, sug) <= 1 || suffixJunk) {
                if (this._chatTryDslParse(suggestion, { value: "" }, appendChatOutput)) return;
                for (const p of this.chatSystemPatterns) {
                    const m = String(suggestion).trim().match(p.re);
                    if (!m) continue;
                    try {
                        p.run(m, appendChatOutput);
                    } catch (err) {
                        appendChatOutput(`(Befehl-Fehler: ${err && err.message})`);
                    }
                    return;
                }
            }
            // Ein Studio-Satz mit unbekanntem Wort hört den Katalog UND den Vorschlag (Gegenprüfung 08.10.: die Absage nahm
            // jeder Zeile „Verb + Wort" ohne KI den Vorschlag, „mach licht" hörte nur den Katalog).
            appendChatOutput(
                studioAbsage
                    ? `${studioAbsage} Oder meintest du: '${suggestion}'?`
                    : `Unbekannter Befehl. Meintest du: '${suggestion}'? („hilfe" zeigt, was die Welt versteht.)`
            );
        } else if (studioAbsage) {
            appendChatOutput(studioAbsage);
        } else {
            // Keine zweite Liste: die Hilfe liest die EINEN Tafeln (`_hilfeZeilen`), hier steht nur der Weg dorthin.
            appendChatOutput(`Unbekannter Befehl — sag „hilfe", dann zeigt dir die Welt, was sie versteht.`);
        }
    }

    // DIE HILFE aus den EINEN Quellen (Leben-Schau 07.10., L2): die Sätze der Welt (`chatDslPatterns`, je Regel ihr
    // Beispiel und die `hilfe`-Beispiele der Regel), die System-Befehle (`chatSystemPatterns`) und die Tasten (die
    // Belegung `state.keybindings` über `DEFAULT_KEYBINDINGS`, benannt mit `KEYBINDING_LABELS`). Vorher war „hilfe"
    // unbekannt, und die Liste hinter „help" stand von Hand im Text (11 Beispiele, kein v1-Satz). Zuerst die Regeln mit
    // `hilfe` (die v1-Sätze: der Studio-Satz, das Dorf), dann alle.
    _hilfeZeilen() {
        const dsl = this.chatDslPatterns;
        const kb = this.state.keybindings || AnazhRealm.DEFAULT_KEYBINDINGS;
        const fmt = (c) => this._formatBindingCode(c);
        const q = (s) => `„${s}"`;
        const probier = [];
        for (const p of dsl.concat(this.chatSystemPatterns))
            if (Array.isArray(p.hilfe)) for (const b of p.hilfe) if (!probier.includes(b)) probier.push(b);
        const tasten = AnazhRealm.KEYBINDING_ACTIONS.map(
            (a) => `${fmt(kb[a] || AnazhRealm.DEFAULT_KEYBINDINGS[a])} ${AnazhRealm.KEYBINDING_LABELS[a] || a}`
        );
        return [
            `Sprich mit der Welt: ${fmt(kb.chat || AnazhRealm.DEFAULT_KEYBINDINGS.chat)} öffnet das Gespräch, Enter sendet, Esc gibt die Welt zurück.`,
            `Probier: ${probier.map(q).join(" · ")}`,
            `Die Welt versteht: ${dsl.map((p) => q(p.example)).join(" · ")}`,
            `System: ${this.chatSystemPatterns.map((p) => q(p.example)).join(" · ")}`,
            `Tasten: WASD laufen · 1–9 Hotbar · ${tasten.join(" · ")}`,
            `Fahren: ${this._fahrTastenZeile()}`,
            `Gamepad: linker Stick laufen · rechter Stick blicken · RT/LT Gas/Bremse · ${Object.entries(
                this.state.padBelegung || AnazhRealm.PAD_BELEGUNG
            )
                .map(([a, c]) => `${fmt(c)} ${AnazhRealm.KEYBINDING_LABELS[a] || a}`)
                .join(" · ")}`,
        ];
    }

    // Die Fahr-Tasten als EINE Zeile (die Tafel AnazhRealm.FAHR_TASTEN, die die Eingabe liest): die Hilfe und der Tacho.
    _fahrTastenZeile() {
        return Object.values(AnazhRealm.FAHR_TASTEN)
            .map((t) => `${t.zeigen} ${t.label}`)
            .join(" · ");
    }

    // Beschreibung → DSL-Programm. Vier bekannte Pattern + Catch-All als
    // `say`. Dieselbe Form wie `parseChatToDsl`: regelbasiert, sicher, JSON-
    // serialisierbar. Keine Code-Generierung mehr.
    parseAbilityDescriptionToDsl(description) {
        const lower = (description || "").toLowerCase().trim();
        if (lower.includes("ändere farbe von kreaturen")) {
            const m = lower.match(/zu ([\wäöüß]+)/);
            const color = m ? m[1] : "white";
            return ["creatures_color", color];
        }
        if (lower.includes("erhöhe geschwindigkeit") || lower.includes("erhoehe geschwindigkeit")) {
            const m = lower.match(/um ([\d.]+)/);
            const amount = m ? parseFloat(m[1]) : 1.0;
            const target = (this.state.speed || 6) + amount;
            return ["player_speed", target];
        }
        if (lower.includes("spawne objekt") || lower.includes("erschaffe baum")) {
            return ["spawn_tree", ["at_player"], 1];
        }
        if (lower.includes("regen") || lower.includes("regnen")) {
            return ["weather", "rainy"];
        }
        if (lower.includes("sonnig") || lower.includes("sonne")) {
            return ["weather", "sunny"];
        }
        // Catch-All: die Fähigkeit „sagt" ihre Beschreibung — kein Welt-
        // Effekt, aber persistiert und auf der Grok-Stimme abspielbar.
        return ["say", `Fähigkeit '${description.trim()}' aktiv`];
    }

    learnAbility(name, description) {
        const program = this.parseAbilityDescriptionToDsl(description);
        this.addNewAbility(name, program, "human");
        this.state.knowledgeBase.push({
            type: "ability",
            content: { name, description, program },
            timestamp: performance.now() / 1000,
        });
    }
    proactiveSuggestions() {
        const suggestions = [
            "Möchtest du eine neue Fähigkeit lernen? Beispiel: 'Lerne Fähigkeit farbwechsel Ändere Farbe von Kreaturen zu blau'",
            "Soll ich die Physik weiter optimieren? Sage 'Entwickle Physik'",
            "Wie wäre es mit einem neuen Sternenhimmel? Beispiel: 'Ändere Sternenhimmel red'",
            "Möchtest du mehr Kreaturen spawnen? Beispiel: 'Spawne Kreaturen 10'",
            "Soll ich das Terrain flacher machen? Beispiel: 'Setze Terrain Steilheit 0.5'",
            "Möchtest du eine neue Welt erschaffen? Beispiel: 'Erschaffe Welt forest'",
            "Soll ich die Spielsteuerung erweitern? Beispiel: 'Implementiere Spielsteuerung'",
        ];
        const randomSuggestion = suggestions[Math.floor(Math.random() * suggestions.length)];
        const chatOutput = document.getElementById("chat-output");
        const line = document.createElement("div");
        line.textContent = `KI-Vorschlag: ${randomSuggestion}`;
        chatOutput.appendChild(line);
        chatOutput.scrollTop = chatOutput.scrollHeight;
    }
    updateCreatureEmotions() {
        // Wetter = ambienter Achsen-Impuls auf das 6-Achsen-Innenleben (kein Binär-Würfel), das Etikett
        // fällt aus der Valenz-Projektion; 10 %-Stochastik (nicht alle fühlen gleichzeitig). Der Sturm ist
        // ein eigenes Gefühl (chaos + awe), nicht bloß mehr Regen. Wer fühlt, zieht der Fauna-Strom des Gefühls (Γ5).
        const word = this.state.weather;
        const wet = this._weatherIsWet(word);
        const rng = this._faunaRng("gefuehl");
        for (let i = 0; i < this.state.creatures.length; i++) {
            if (rng() >= 0.1) continue;
            const c = this.state.creatures[i];
            if (!c || !c.userData) continue;
            const ud = c.userData;
            if (!ud.emotions) ud.emotions = { joy: 0, awe: 0, sorrow: 0, hope: 0, peace: 0, chaos: 0 };
            if (word === "stormy") {
                ud.emotions.chaos = Math.min(1, (ud.emotions.chaos || 0) + 0.15);
                ud.emotions.awe = Math.min(1, (ud.emotions.awe || 0) + 0.1);
            } else if (wet) {
                ud.emotions.sorrow = Math.min(1, (ud.emotions.sorrow || 0) + 0.18);
                ud.emotions.peace = Math.min(1, (ud.emotions.peace || 0) + 0.06);
            } else {
                ud.emotions.joy = Math.min(1, (ud.emotions.joy || 0) + 0.15);
            }
            this._projectCreatureEmotion(c);
        }
    }

    optimizePhysics() {
        // DETERMINISMUS-BOGEN P3 — keine Ammo-Welt/Reibung/CCD mehr zu „optimieren".
        // Der Chat-Befehl setzt nur noch die Schwerkraft-Konstante zurück (die
        // `_stepCharacter` als Skalar liest).
        this.state.gravity = -9.81;
        this.log("Schwerkraft auf Standard zurückgesetzt (Feld-Physik — kein Ammo).");
    }

    // HANDELT DAS FELD? Die EINE Antwort für die DSL-Quelle eines Akts (`ctx.source`): der Nexus („nexus" — seine
    // Evolutionen und Kristalle) und die Regeln, die er gesetzt hat („rule:nexus"), handeln für die Welt selbst. Der
    // Mensch, seine Werkzeuge, der Begleiter, die Mitspieler und ihre Regeln handeln nie für das Feld. Leser: die
    // Ort-Engstelle `dslEvalPos` (das Feld hat keinen Ort, wo die Wildnis nicht trägt), die Nexus-Geburt in
    // `spawn_creature` und der Hort-Deckel der Nexus-Bauten (`autonomous`).
    _feldHandelt(ctx) {
        const quelle = ctx && ctx.source;
        return quelle === "nexus" || quelle === "rule:nexus";
    }

    // === Welt-Affinitäts-Feld ===
    // Keine Biome-Tabelle: vier SimplexNoise-Schichten (lebendig, dichte, glut, magieleitung) in der
    // MATERIAL_TAG_KEYS-Sprache; Baupläne spawnen, wo ihre Compound-Tags resonieren (lebendig → Wald,
    // dichte → stein_block, magieleitung → kristall_geode, glut → glutbrunnen). Seltenheit emergiert aus
    // dem Noise. state.worldMeta.seed fließt in die Noise → jede Welt eigen, Multi-User-deterministisch.
    worldFieldAt(x, z) {
        const seed = (this.state.worldMeta && this.state.worldMeta.seed) || "anazh-realm-seed";
        // Lazy-Init pro Welt — bei Welt-Wechsel automatisch neu, weil seed
        // anders ist. state.worldField hält den Cache.
        if (!this.state.worldField || this.state.worldField.seed !== seed) {
            this.state.worldField = {
                seed,
                lebendigNoise: new SimplexNoise(seed + "-veg-lebendig"),
                dichteNoise: new SimplexNoise(seed + "-veg-dichte"),
                glutNoise: new SimplexNoise(seed + "-veg-glut"),
                magieNoise: new SimplexNoise(seed + "-veg-magie"),
                // Sampling-RNG (deterministisch pro Position) für Spawn-Probe.
                rngNoise: new SimplexNoise(seed + "-veg-rng"),
                // V18.204 — Γ3 Domain-Warp-Noise. Eigener Stream, gen≥3-Gate.
                warpNoise: new SimplexNoise(seed + "-veg-warp"),
            };
        }
        const f = this.state.worldField;
        const n01 = (v) => Math.max(0, Math.min(1, (v + 1) / 2));
        // FREQUENZ-FÄCHER: ab genVersion >= 3 hat jede Welt-Stimme ihre eigene Wellenlänge (lebendig 200,
        // dichte 340, glut 520, magie 160 m); gen < 3 bleibt bit-identisch (s=0.005 = λ200). Die OFFSETS je
        // Achse bleiben (Dekorrelation).
        if (this._genVersion() >= 3) {
            const FC = AnazhRealm.FIELD_CHARACTER;
            const sL = 1 / FC.lambdaLebendig;
            const sD = 1 / FC.lambdaDichte;
            const sG = 1 / FC.lambdaGlut;
            const sM = 1 / FC.lambdaMagieleitung;
            // DOMAIN-WARP: vor den vier Noise-Reads wird die Sample-Koordinate per Zwei-Noise-Vektor verschoben —
            // langsam (λ~600 m, FC.warpScale), Amplitude FC.warpAmp m; eigener Stream f.warpNoise.
            const wpX = f.warpNoise.noise2D(x * FC.warpScale, z * FC.warpScale) * FC.warpAmp;
            const wpZ = f.warpNoise.noise2D(x * FC.warpScale + 51.7, z * FC.warpScale - 23.1) * FC.warpAmp;
            const wx = x + wpX;
            const wz = z + wpZ;
            return {
                lebendig: n01(f.lebendigNoise.noise2D(wx * sL, wz * sL)),
                dichte: n01(f.dichteNoise.noise2D(wx * sD + 100, wz * sD - 200)),
                glut: n01(f.glutNoise.noise2D(wx * sG + 500, wz * sG + 700)),
                magieleitung: n01(f.magieNoise.noise2D(wx * sM - 333, wz * sM + 999)),
            };
        }
        // Legacy-Pfad: alle vier Stimmen auf s=0.005 (λ~200 m). Bit-identisch
        // zu Pre-V18.203 für alte Welten.
        const s = 0.005;
        return {
            lebendig: n01(f.lebendigNoise.noise2D(x * s, z * s)),
            dichte: n01(f.dichteNoise.noise2D(x * s + 100, z * s - 200)),
            glut: n01(f.glutNoise.noise2D(x * s + 500, z * s + 700)),
            magieleitung: n01(f.magieNoise.noise2D(x * s - 333, z * s + 999)),
        };
    }

    // === Das lebendige Feld — die LESE-Seite (docs/das-lebendige-feld.md) ===
    // auraAt(x, z, t) ist die EINE Lese-Schnittstelle: das worldgen-eingefrorene Substrat (worldFieldAt) +
    // die dynamische Achse `emotion` + die Zeit `t`. Wer eine „lebendige Welt"-Wirkung baut, LIEST hier
    // (kein eigener _tickX). `emotion` ist eine Live-Referenz — nicht mutieren.
    auraAt(x, z, t = 0) {
        const f = this.worldFieldAt(x, z);
        const e = (this.state.player && this.state.player.emotions) || {};
        // SCHREIB-Seite: das Leben-Overlay HEBT lebendig über dem frozen Substrat, der Fraß senkt es (geklemmt auf 0..1, nie
        // überschreiben); leerer Overlay → lebendig == frozen. at_field_need + FIELD_TO_EMOTION lesen es mit.
        const overlay = this._lifeOverlayAt(x, z);
        // DIE NARBE DER TAT (feld.K4) senkt es am Ort der Tat, bis sie heilt (`_narbeAt`) — leer → lebendig == frozen + overlay.
        const narbe = this._narbeAt(x, z);
        // V17.32 — die emotion-Achse ist RÄUMLICH: der lokale emotionale Abdruck
        // (das Gedächtnis des Ortes) blendet ÜBER die globale Stimmung. Leerer
        // Abdruck → emotion == globale Stimmung (backward-compatible, kein Alloc).
        const imp = this._emotionOverlayAt(x, z);
        // DER BRAND (feld.K3#2) glüht in der glut seiner Zelle, solange sie brennt
        const bf = this.state.brandFeld;
        const brand = bf && bf.size ? bf.get(this._lifeCellKey(x, z)) : null;
        // DIE LAVA (stoffe.K3-2) glüht in der glut ihrer Zelle, bis sie erkaltet (`_lavaAt`)
        const lava = this._lavaAt(x, z);
        let emotion = e;
        if (imp) {
            emotion = {};
            for (const axis of AnazhRealm.EMOTION_AXES) {
                emotion[axis] = Math.min(1, (e[axis] || 0) + (imp[axis] || 0));
            }
        }
        return {
            lebendig: overlay || narbe > 0 ? Math.max(0, Math.min(1, f.lebendig + overlay - narbe)) : f.lebendig,
            dichte: f.dichte,
            glut: brand || lava ? Math.min(1, f.glut + (brand ? brand.glut : 0) + (lava ? lava.glut : 0)) : f.glut,
            magieleitung: f.magieleitung,
            emotion,
            t,
        };
    }

    // === DIE LEBENDIGE WERTUNG: Wohl-Maß + gleitende Baseline ===
    // Das dritte Verb des Feldes (lesen → schreiben → WERTEN): die Baseline ist ein EMA-Tiefpass, gemessen
    // wird der Vorhersagefehler `δ = jetzt − Baseline` (RL-Advantage/RPE).

    // Objektives Struktur-Wohl eines Ortes = `lebendig` (die einzige SCHREIBBARE Struktur-Achse;
    // dichte/glut/magie sind pro Ort konstant → von der Baseline absorbiert, kein δ). Schwer zu faken
    // (Leben muss leben + gepflegt werden). Fitness-Maß für Regeln.
    _fieldWohlStruktur(aura) {
        return aura && typeof aura.lebendig === "number" ? aura.lebendig : 0;
    }

    // Das SUBJEKTIVE, erlebte Wohl = die VALENZ der lokalen Emotion (Russell-Circumplex:
    // joy/peace/hope positiv, sorrow/chaos negativ, awe ambivalent → ausgelassen),
    // normalisiert auf ~[−1, +1]. Das Appraisal-Maß für die Spieler-Emotion (Phase 3).
    _fieldWohlErlebt(aura) {
        const e = (aura && aura.emotion) || {};
        const pos = ((e.joy || 0) + (e.peace || 0) + (e.hope || 0)) / 3;
        const neg = ((e.sorrow || 0) + (e.chaos || 0)) / 2;
        return pos - neg;
    }

    // SITUATION des Spielers = Appraisal-INPUT: `lebendig` am Ort (+ HP im pfad-Modus) − das Umstellen (`_spielerUmstellt`
    // × WERTUNG.umstellt). BEWUSST OHNE die Stimmung (`_fieldWohlErlebt`/`emotion`) — sonst Rückkopplung joy → Valenz → δ →
    // joy (Runaway). Das Gefühl ist die Antwort auf die Situation, nicht ihr Input: schließt sich das Rudel, fällt sie (δ < 0:
    // sorrow + chaos, die Furcht), fällt der Jäger, steigt sie gegen die lagende Baseline (δ > 0: joy + hope, der Triumph) —
    // bis oekologie.K4#2 stempelte der Fall eines frischen Jägers den Triumph (`_feelAction`), und das Umstellen war kein
    // Gefühl. ∈ [−umstellt, 1].
    _playerSituationWohl(aura) {
        const leb = this._fieldWohlStruktur(aura); // lebendig ∈ [0,1] (die Welt um den Spieler)
        const p = this.state.player;
        const hpMax = (p.stats && p.stats.hpMax) || 0;
        let sit = leb;
        if (hpMax > 0 && this.getGameMode && this.getGameMode() === "pfad") {
            const hp = Math.max(0, Math.min(1, (p.hp || 0) / hpMax));
            sit = leb * 0.6 + hp * 0.4;
        }
        return sit - AnazhRealm.WERTUNG.umstellt * this._spielerUmstellt();
    }

    // DAS UMSTELLEN des Spielers ∈ [0, 1): seine Jäger dieses Takts (`_spielerJaeger`, gefüllt mit der EINEN Jäger-Liste im
    // Kreatur-Takt; ein Gefallener verlässt sie mit der Liste der Wesen, `_kreaturAusListe`) — ihre Zahl sättigt (n / (n + 1), je Jäger seine Nähe, voll im Ring des
    // Rudels 2 × jagd.hetzM), ihr Kreis schließt sich (die halbe Last trägt 1 − die größte Winkel-Lücke um ihn / 360°). Ohne
    // Jäger 0.
    _spielerUmstellt() {
        const J = this._spielerJaeger;
        const pm = this.state.playerMesh && this.state.playerMesh.position;
        if (!J || !J.length || !pm) return 0;
        const ring = 2 * AnazhRealm._verhaltenGesetz().jagd.hetzM;
        const w = this._umstelltWinkel || (this._umstelltWinkel = []);
        w.length = 0;
        let n = 0;
        for (const c of J) {
            const dx = c.position.x - pm.x;
            const dz = c.position.z - pm.z;
            n += Math.min(1, ring / Math.max(1e-3, Math.hypot(dx, dz)));
            w.push(Math.atan2(dx, dz));
        }
        w.sort((a, b) => a - b);
        let luecke = w[0] + 2 * Math.PI - w[w.length - 1];
        for (let i = 1; i < w.length; i++) luecke = Math.max(luecke, w[i] - w[i - 1]);
        return (n / (n + 1)) * (1 - luecke / (4 * Math.PI));
    }

    _wohlCellKey(x, z) {
        const cs = AnazhRealm.WERTUNG.cell;
        return Math.floor(x / cs) + "," + Math.floor(z / cs);
    }

    // Struktur-Wohl an (x,z) beobachten → Zell-Baseline aktualisieren (lazy EMA, `α = 1 − exp(−Δt/τ)`,
    // tick-rate-unabhängig). Cold-Start: die erste Beobachtung IST die Baseline. Gibt die Baseline VOR der
    // Beobachtung zurück (= die Erwartung für den Reward). Sparse Map, kein Sweep; now in Sekunden.
    _observeFieldWohl(x, z, now) {
        if (!this.state.wohlBaseline) this.state.wohlBaseline = new Map();
        const key = this._wohlCellKey(x, z);
        const obs = this._fieldWohlStruktur(this.auraAt(x, z, now));
        const wb = this.state.wohlBaseline;
        const W = AnazhRealm.WERTUNG;
        let cur = wb.get(key);
        const before = cur ? cur.b : obs;
        if (cur) cur.b = before + (1 - Math.exp(-Math.max(0, now - cur.t) / W.fieldTau)) * (obs - before);
        else wb.set(key, (cur = { b: obs }));
        cur.t = now;
        this._feldTod(wb, key, cur, now + W.pruneAgeSec, now);
        return before;
    }

    // Lies die aktuelle Zell-Baseline (ohne Beobachtung) — 0/neutral, wenn keine Zelle.
    _fieldWohlBaselineAt(x, z) {
        const wb = this.state.wohlBaseline;
        if (!wb || wb.size === 0) return 0;
        const e = wb.get(this._wohlCellKey(x, z));
        return e ? e.b : 0;
    }

    // DIE RÄUMUNG KOSTET NUR DIE TOTEN (feld.K3#2): jede Karte des Felds — Leben, Gefühl, Wohl-Baseline (sie veraltet nach
    // `pruneAgeSec` ohne Blick), Tat-Erwartung — trägt ihr Todes-Rad `karte.tod`: je Zelle der Eimer (`FELD_TOD_EIMER_S`), in
    // dem sie unter ihr epsilon zerfällt oder veraltet, gesetzt von dem Schreiber, der sie schreibt (`tod` in Spielzeit). Danach
    // räumt er die fälligen Eimer und besucht dabei nur Zellen, deren Tod fällig ist (eine neu geschriebene zieht in ihren neuen
    // Eimer um). In Ruhe schreibt niemand, und nichts wird besucht. Bis feld.K3#2 ging die Räumung
    // über der doppelten Zahl der Lebenden JEDE Zelle der Karte durch (Mess-Wiese, vier Wellen zu 60 Taten: bis 1 110 Zellen
    // bei 573 lebenden).
    _feldTod(karte, key, zelle, tod, jetzt) {
        const E = AnazhRealm.FELD_TOD_EIMER_S;
        const rad = karte.tod || (karte.tod = new Map());
        const b = Math.floor(tod / E);
        if (zelle.tod !== b) {
            if (rad.has(zelle.tod)) rad.get(zelle.tod).delete(key); // neu beschrieben: der alte Eimer kennt sie nicht mehr
            if (rad.has(b)) rad.get(b).add(key);
            else rad.set(b, new Set([key]));
            zelle.tod = b;
        }
        if (!(karte.todAb <= b)) karte.todAb = b;
        const faellig = Math.floor(jetzt / E);
        if (!(karte.todAb < faellig)) return;
        let ab = Infinity;
        for (const [e, keys] of rad)
            if (e >= faellig) ab = Math.min(ab, e);
            else {
                rad.delete(e);
                for (const k of keys) if ((karte.get(k) || AnazhRealm.FELD_LEER).tod === e) karte.delete(k);
            }
        karte.todAb = ab;
    }

    // === Das lebendige Feld — die SCHREIB-Seite ===
    // Sparse Map: "cx,cz" (16-m-Zelle) → { a, t } (Overlay-Menge, `state.spielZeit` in s — nie die Wanduhr: ein Takt liest,
    // was er schrieb, die Pause zerfällt nicht; Lese- und Gefühls-Seite teilen die Uhr). Decay LAZY beim Lesen
    // (a · e^(−λ·Δt)), kein Sweep (O(1) je Lese/Deposit, die Tat räumt das Tote). Nur intentionale Spawns
    // (Nexus/Chat/DSL via spawn_creature) deponieren — ambiente Fauna und Restore nicht (kein Runaway).
    // Nicht persistiert (reaktiv wie Wetter).
    _lifeCellKey(x, z) {
        const cs = AnazhRealm.LIFE_FIELD.cell;
        return Math.floor(x / cs) + "," + Math.floor(z / cs);
    }

    // Die aktuelle (zerfallene) Overlay-Menge an (x,z) — 0, wenn keine Zelle oder ihr Betrag unter `epsilon` zerfiel (tot: die
    // Räumung ist nur Gedächtnis, sie entscheidet nie, was gelesen wird).
    _lifeOverlayAt(x, z) {
        const lf = this.state.lifeField;
        if (!lf || lf.size === 0) return 0;
        const e = lf.get(this._lifeCellKey(x, z));
        if (!e) return 0;
        const dt = Math.max(0, this.state.spielZeit - e.t);
        const a = dt === 0 ? e.a : e.a * Math.exp(-AnazhRealm.LIFE_FIELD.decayPerSec * dt);
        return Math.abs(a) < AnazhRealm.LIFE_FIELD.epsilon ? 0 : a;
    }

    // Leben deponieren: ein 3×3-Kernel um (x,z), jede Zelle decay-then-add,
    // geklemmt auf [LIFE_FIELD.kahl, LIFE_FIELD.max] (Sättigung → der Nexus zieht weiter). Die EINE
    // Schreib-API — wer Leben in die Welt trägt (Geburt, Pflege, Kreatur-Trickle) und wer es frisst (der Fraß
    // des Bestands, negativ; Ökologie K1) ruft sie. Der Decay führt beides zum Substrat zurück → nie Überschreiben.
    _depositLife(x, z, amount = AnazhRealm.LIFE_FIELD.pulseCenter) {
        if (!amount || !Number.isFinite(amount)) return;
        if (!this.state.lifeField) this.state.lifeField = new Map();
        const lf = this.state.lifeField;
        const cfg = AnazhRealm.LIFE_FIELD;
        const now = this.state.spielZeit;
        const cx = Math.floor(x / cfg.cell);
        const cz = Math.floor(z / cfg.cell);
        const neighborAmount = amount * (cfg.pulseNeighbor / cfg.pulseCenter);
        for (let dx = -1; dx <= 1; dx++) {
            for (let dz = -1; dz <= 1; dz++) {
                const add = dx === 0 && dz === 0 ? amount : neighborAmount;
                const key = cx + dx + "," + (cz + dz);
                const e = lf.get(key);
                let cur = 0;
                if (e) {
                    const dt = Math.max(0, now - e.t);
                    cur = e.a * Math.exp(-cfg.decayPerSec * dt);
                }
                const a = Math.max(cfg.kahl, Math.min(cfg.max, cur + add));
                const zelle = e ? Object.assign(e, { a, t: now }) : { a, t: now };
                if (!e) lf.set(key, zelle);
                // die Tat räumt (`_feldTod`): die Zelle stirbt, wo |a| · e^(−λ·Δt) unter epsilon fällt
                this._feldTod(
                    lf,
                    key,
                    zelle,
                    now + Math.max(0, Math.log(Math.abs(a) / cfg.epsilon)) / cfg.decayPerSec,
                    now
                );
            }
        }
    }

    // Kreatur-Trickle: eine tendende Kreatur (userData.tendsLife) träufelt Leben in ihre Zelle,
    // rate-limitiert (trickleEverySec); wandernd ergibt das einen decayenden Lebens-Pfad. NUR tendsLife —
    // ambiente Fauna träufelt nie (sonst positiver Feedback-Runaway). Pro Frame aus updateCreatures.
    _tickCreatureLifeTrickle(creature, now) {
        if (!creature || !creature.userData || !creature.userData.tendsLife || !creature.position) return;
        const last = creature.userData.lastLifeTrickle ?? -Infinity;
        if (now - last < AnazhRealm.LIFE_FIELD.trickleEverySec) return;
        creature.userData.lastLifeTrickle = now;
        this._depositLife(creature.position.x, creature.position.z, AnazhRealm.LIFE_FIELD.trickle);
    }

    // === DER BRAND (feld.K3#2): das Feuer auf dem Feld — eine Sim mit Takt, der nur in brennenden Zellen arbeitet ===
    // `state.brandFeld`: "cx,cz" (die 16-m-Zelle des Lebens) → { cx, cz, y, stoff, glut }. Er fängt, wo die Welt Feuer fängt
    // (das Brennglas, `_tickFocusingAffordances`), greift nach dem Gesetz `BRAND` auf die Nachbarn über und hinterlässt die Tat
    // `brand` (die Asche: ihre Narbe senkt lebendig, auf ihr brennt nichts, bis sie heilt). Nicht persistiert (reaktiv wie das
    // Leben-Overlay), die Asche reist als Tat. Leser: `auraAt` (glut) und die Leuchtquellen (`_leuchtQuellen`).

    // Der Brennstoff einer Zelle: ihr lebendig (die Vegetation samt Narbe), 0 auf Asche.
    _brandStoff(cx, cz) {
        const je = this._tatIndex().je.get(cx + "," + cz);
        if (je && je.some((a) => a.tat === "brand")) return 0;
        const cs = AnazhRealm.LIFE_FIELD.cell;
        return this.auraAt((cx + 0.5) * cs, (cz + 0.5) * cs).lebendig;
    }

    // Die Zelle unter (x, z) fängt Feuer → die Zelle oder null (sie brennt schon, trägt keinen Brennstoff, die Welt ist nass).
    _brandEntfachen(x, z) {
        const cs = AnazhRealm.LIFE_FIELD.cell;
        return this._brandFangen(Math.floor(x / cs), Math.floor(z / cs));
    }

    // `stoff`: der Brennstoff, den der Schritt an dieser Zelle schon las (`_brandSchritt`) — EIN Lesen je Zelle und Schritt;
    // er ändert sich bis zum Fangen nicht (Asche schreibt nur eine brennende Zelle, und die fängt nie).
    _brandFangen(cx, cz, stoff) {
        const st = this.state;
        const B = AnazhRealm.BRAND;
        const bf = st.brandFeld || (st.brandFeld = new Map());
        const key = cx + "," + cz;
        if (bf.has(key) || (st.naesse || 0) >= B.loescht) return null;
        if (stoff === undefined) stoff = this._brandStoff(cx, cz);
        if (!(stoff >= B.minStoff)) return null;
        if (!bf.size) this._brandUhr = st.spielZeit;
        const zelle = { cx, cz, y: null, stoff, glut: 0 }; // y: die Höhe des Herds, gefragt erst vom Licht (`_leuchtQuellen`)
        bf.set(key, zelle);
        return zelle;
    }

    // DER TAKT DES BRANDS: ohne Feuer kein Schritt und keine Arbeit (Ruhe ist Null); sonst je `schrittS` Spielzeit EIN Schritt
    // über die brennenden Zellen — es kostet, was brennt (Lehre 25), die Welt drumherum nie.
    _tickBrand() {
        const bf = this.state.brandFeld;
        if (!bf || !bf.size) return;
        const S = AnazhRealm.BRAND.schrittS;
        while (bf.size && this.state.spielZeit - this._brandUhr >= S) this._brandSchritt((this._brandUhr += S));
    }

    // Ein Schritt zur Spielzeit t: jede Zelle zehrt und glüht auf, greift über (die Würfel je Zelle und Schritt aus dem Hash
    // `_pcgFloat` — gleich für jede Bildrate) und fällt ausgebrannt oder erstickt als Asche.
    _brandSchritt(t) {
        const st = this.state;
        const B = AnazhRealm.BRAND;
        const bf = st.brandFeld;
        const cs = AnazhRealm.LIFE_FIELD.cell;
        const nass = (st.naesse || 0) >= B.loescht;
        const n = Math.round(t / B.schrittS);
        const neu = [];
        for (const [key, z] of bf) {
            z.stoff -= B.schrittS / B.brennS;
            if (nass || z.stoff <= 0) {
                bf.delete(key);
                this._tatSchreiben("brand", (z.cx + 0.5) * cs, (z.cz + 0.5) * cs);
                continue;
            }
            z.glut = Math.min(1, z.glut + B.schrittS / B.aufS);
            for (const [dx, dz] of B.nachbarn) {
                const [nx, nz] = [z.cx + dx, z.cz + dz];
                if (bf.has(nx + "," + nz) || this._pcgFloat(nx, nz, n) >= B.greift * z.glut) continue;
                const s = this._brandStoff(nx, nz);
                if (this._pcgFloat(nz, nx, n) < s) neu.push(nx, nz, s);
            }
        }
        for (let i = 0; i < neu.length; i += 3) this._brandFangen(neu[i], neu[i + 1], neu[i + 2]);
    }

    // === DIE LAVA (stoffe.K3-2): geschmolzener Stein auf der glut-Achse, der zu Stein erstarrt ===
    // Ein Schreib-Akt der Welt (`_lavaGiessen`: die Tat `lava` an ihrem Ort und ihrer Welt-Stunde, mit der Höhe und ob sie ins
    // Wasser floss — das EINE Urteil `_nassAt`, nie der Bezug der Ufer-Bänder) deckt die 16-m-Zelle des Felds; ihr Zustand ist
    // eine FUNKTION der Welt-Zeit seit dem Akt (gelaende-core `lava` auf der Zeile `stein` der Stoff-Tafel, die Luft an der Naht
    // `_temperaturAt`) — kein Takt, keine Simulation: jeder Peer und jeder Reload sieht dieselbe Decke. Sie glüht in der glut
    // ihrer Zelle (`auraAt`), leuchtet als Feuer (`_leuchtQuellen`), trägt unter dem Fuß „glut", erstarrt „stein"
    // (`_kontaktStoffAt`); am Wasser erstarrt sie schneller und unter Dampf. Die Tat bleibt: der Stein bleibt, die Narbe
    // (TAT_NARBE.lava) hält das Leben der Zelle.
    _lavaGiessen(x, z) {
        const y = this._voxelSurfaceY(x, z);
        const wasser = this._nassAt(x, z) ? 1 : 0;
        return this._tatSchreiben("lava", x, z, { y: Math.round(y * 100) / 100, wasser });
    }

    // Die Decke der Zelle unter (x, z) — der Zustand ihrer jüngsten Lava (`temperatur` °C, `glut` 0…1, `erstarrt`, `dampf`,
    // `alterS`) oder null ohne Lava.
    _lavaAt(x, z) {
        const I = this._tatIndex();
        if (!I.lava.length) return null;
        const je = I.je.get(this._lifeCellKey(x, z));
        let a = null;
        if (je) for (const t of je) if (t.tat === "lava" && !(a && a.h >= t.h)) a = t;
        return a ? this._lavaZustand(a) : null;
    }
    _lavaZustand(a) {
        const alterS = (this._weltStunde() - a.h) * 3600;
        const z = globalThis.__gelaendeCore.lava(alterS, a.wasser === 1, this._temperaturAt(a.y, 0), {
            stein: this._stoff("stein"),
        });
        return Object.assign(z, { alterS });
    }

    // === DER STAHL DER ESSE (stoffe.K3-2): das Gerät in der Hand glüht am Feuer der Esse und erkaltet an der Luft des Felds ===
    // Ein gehaltenes Gerät, dessen Stoff (`_geraetStoff`: ein Werk der Schmiede sein werkStoff, ein Eigenwerk sein größter Teil)
    // in der Esse weder schmilzt noch brennt (T_schmelz über dem Feuer, kein T_zünd: Stahl, Eisen, Stein — die Bronze schmölze),
    // trägt seine Temperatur (`_stahl` { geraet, T °C, esse }, ein Stand der Sitzung). Reicht die Hand in das Glutbett einer Esse (eine Brenn-Fläche
    // der Schmiede-Werkstatt, `_esseAmArm`), strebt sie gegen ihr Feuer (`ESSE.feuerK`), sonst gegen die Luft des Temperatur-Felds
    // an der Höhe der Hand (`_temperaturAt`) — der Gang des Kerns (`waermeGang`, τ = ρ·c·d/2 / α aus der Zeile ihres Stoffs),
    // exakt je Takt; unter der Ruhe über der Luft ist sie kalt, ihr Stand fällt. Ihre GLUT ist die des Kerns (`glutAus`: über dem
    // Draper-Punkt ∝ T⁴, 1 am Feuer) und leuchtet in der Hand als Wärmestrahler in der Farbe ihrer Temperatur (`_stahlGlut` →
    // `_leuchtQuellen`). Bis stoffe.K3-2 las die Esse keine Temperatur: ihr Glutbett glühte, was man in es hielt, blieb kalt.
    _tickEsse(dt) {
        const pm = this.state.playerMesh;
        if (!pm || !(dt > 0)) return;
        const bp = this._heldImplementBlueprint();
        const z = bp ? this._stahlStoff(bp) : null;
        if (!z || (this._stahl && this._stahl.geraet !== bp.name)) this._stahl = null; // die Hand wechselte das Gerät
        if (!z) return; // nichts in der Hand, das in der Esse glüht
        const esse = this._esseAmArm(pm.position);
        if (!this._stahl && !esse) return; // kalt und fern jeder Esse: der billigste Weg (Lehre 25)
        const E = AnazhRealm.ESSE;
        const luft = this._temperaturAt(pm.position.y);
        const s = this._stahl || (this._stahl = { geraet: bp.name, T: luft, esse: null });
        const tau = (z.rho * z.c * E.dickeM) / 2 / (esse ? E.alphaFeuer : E.alphaLuft);
        s.T = globalThis.__gelaendeCore.waermeGang(esse ? E.feuerK : luft + 273.15, s.T + 273.15, dt, tau) - 273.15;
        s.esse = esse ? esse.type : null;
        if (!esse && s.T - luft < E.ruheK) this._stahl = null;
    }

    // Die Zeile der Stoff-Tafel des Geräts, wenn es in der Esse glüht (es schmilzt und brennt dort nicht), sonst null — je Bauplan.
    _stahlStoff(bp) {
        const memo = this._stahlStoffMemo || (this._stahlStoffMemo = new Map());
        if (!memo.has(bp.name)) {
            // ein Werk ohne Stoff-Teil glüht nicht (es hat keine Zeile; den Bruch meldet sein Leser, `_werkStoff`, nie dieser Takt)
            const stoffTeil = this._schmiedeWerk(bp) || (bp.parts || []).some((p) => typeof p.material === "string");
            const z = stoffTeil ? this._stoff(this._geraetStoff(bp)) : null;
            memo.set(
                bp.name,
                z && z.rho * z.c > 0 && z.tSchmelz > AnazhRealm.ESSE.feuerK && !(z.tZuend > 0) ? z : null
            );
        }
        return memo.get(bp.name);
    }

    // Die Esse, in deren Glutbett die Hand bei p reicht, oder null: ein Eintrag mit Brenn-Fläche (`_glutFlaeche`, das Verzeichnis
    // „glut") der Domäne forging (`_computeWorkshopDomain`, je Bauplan), so nah, dass der Rand ihres Betts (der Radius seiner
    // Fläche) plus die Reichweite des Arms (`ESSE.armM`) die Hand erreicht.
    _esseAmArm(p) {
        const E = AnazhRealm.ESSE;
        const nah = this._esseNah || (this._esseNah = []);
        nah.length = 0;
        this._blockerUmPlatz(p.x, p.z, E.suchM, nah, "glut");
        const memo = this._esseMemo || (this._esseMemo = new Map());
        for (const e of nah) {
            if (!memo.has(e.type)) {
                const bp = this.state.blueprints && this.state.blueprints[e.type];
                memo.set(e.type, !!bp && this._computeWorkshopDomain(bp) === "forging");
            }
            const r = Math.sqrt(this._glutFlaeche(e) / Math.PI) + E.armM;
            if (memo.get(e.type) && e.position && Math.hypot(e.position.x - p.x, e.position.z - p.z) <= r) return e;
        }
        return null;
    }

    // Das Licht des glühenden Geräts (`_leuchtQuellen`) oder null: an der Hand, das Herdfeuer des Gesetzbuchs (LICHT_GESETZ.feuer)
    // in der Farbtemperatur des Stahls, ohne Flackern, mit dem Kern der Klinge; die Masse folgt der Glut über die strahlende
    // Fläche der Klinge gegen das Glutbett der Studio-Feuerstelle (klang `bettRefM`, der Bezug jeder Glut).
    _stahlGlut() {
        const s = this._stahl;
        const pm = this.state.playerMesh;
        if (!s || !pm) return null;
        const E = AnazhRealm.ESSE;
        const K = globalThis.__gelaendeCore;
        const g = K.glutAus(s.T + 273.15, E.feuerK);
        if (!(g > 0)) return null;
        const L = globalThis.__fachwerkCore.LICHT_GESETZ.feuer;
        const q =
            this._stahlLicht ||
            (this._stahlLicht = {
                quelle: "stahl",
                phase: 0,
                L: Object.assign({}, L, { kernM: E.kernM, flacker: null }),
            });
        const hand = pm.userData && pm.userData.heldMesh;
        const v = this._stahlLage || (this._stahlLage = new THREE.Vector3());
        if (hand) hand.getWorldPosition(v);
        else v.set(pm.position.x, pm.position.y + E.handHoeheM, pm.position.z);
        const bett = AnazhRealm._umweltGesetz().UMWELT.stimmen.glut.bettRefM;
        q.L.kelvin = s.T + 273.15;
        return Object.assign(q, {
            x: v.x,
            y: v.y,
            z: v.z,
            masse: (g * E.flaecheM2) / ((Math.PI / 4) * bett * bett),
            glut: g,
        });
    }

    // === DIE TAT BLEIBT (feld.K4): das Gedächtnis der Taten — die EINE Quelle von Narbe, Ernte und Fällung ===
    // Jede Tat am Lebendigen (ein Baum fällt, eine Pflanze der Nah-Streu wird gepflückt) ist ein SCHREIB-AKT der Welt: sie liegt
    // in `worldMeta.taten` ({ tat, x, z, h, … }, `h` die Welt-Stunde) und reist mit jedem Save und Reload (der Speicher trägt
    // das worldMeta). Aus ihr folgt alles: die NARBE im Feld (`auraAt` senkt lebendig um `_narbeAt`), die fehlende Pflanze
    // (`_geerntetIn`), der Stumpf und der Wald, der den Baum nicht neu pflanzt (`_tatAm`). Sie heilt in SPIELZEIT, linear über
    // ihre Dauer: die Stunden ihrer Klasse (`TAT_NARBE`) durch das frozen lebendig des Orts — der Nachwuchs folgt dem Feld, gleich
    // für jeden Peer und jeden Reload; geheilt fällt sie (`_tickScatterRegrow`). Bis feld.K4 lebte die Ernte im Session-Gedächtnis
    // (FORAGE.regrowMs, 300 s Wanduhr), das Fällen schrieb nichts ins Feld (Mess-Wiese, Null-Renderer, main f7dd313c: 8 Bäume
    // und 23 Pflanzen mit tryMouseBreak — Δlebendig 0, kein Stumpf, nach dem Reload 23 von 23 Pflanzen zurück).

    // DIE WELT-STUNDE: Stunden seit dem ersten Tag der Welt — ihr Tag (`worldMeta.tag`, `_uhrSetzen` zählt ihn) und die Uhr.
    _weltStunde() {
        const st = this.state;
        return 24 * (((st.worldMeta && st.worldMeta.tag) || 0) + (st.timeOfDay || 0));
    }

    // Die Tat schreibt: an ihren Ort, zur Welt-Stunde; `mehr` trägt, was ihre Klasse braucht (die Ernte ihre Kachel und Kennung,
    // das Fällen die Größe des Baums für den Stumpf). Der Nachwuchs wacht zu ihrem Ende, die nächste Sicherung trägt sie.
    _tatSchreiben(tat, x, z, mehr) {
        const wm = this.state.worldMeta;
        if (!Array.isArray(wm.taten)) wm.taten = [];
        const r2 = (v, k) => Math.round(v * k) / k;
        const a = Object.assign({ tat, x: r2(x, 100), z: r2(z, 100), h: r2(this._weltStunde(), 1e4) }, mehr);
        this._weltRegt(); // der Weckruf vor jedem Schreiben
        wm.taten.push(a);
        const ende = a.h + this._tatIndex().dauer.get(a);
        if (!(this._nachwuchsFaellig <= ende)) this._nachwuchsFaellig = ende;
        if (tat === "faellen") this._nahStreuTat(a);
        if (typeof this._scheduleEditSave === "function") this._scheduleEditSave();
        return a;
    }

    // Der Index der Taten (ein Cache der EINEN Liste): je 16-m-Zelle des Felds ihre Taten, je Nah-Streu-Kachel die gepflückten
    // Kennungen, je Tat ihre Dauer in Stunden. Die Tat schreibt nur an (`_tatSchreiben`): eine neue Tat am Ende geht allein in
    // den Index — sie kostet ihre Zelle, nie die Liste (feld.K3#2); eine andere Liste (die geladene Welt) oder eine Heilung
    // (`_tatGen`, `_tickScatterRegrow`) baut ihn neu.
    _tatIndex() {
        const L = this.state.worldMeta && this.state.worldMeta.taten;
        const n = Array.isArray(L) ? L.length : 0;
        let J = this._tatIdx;
        if (!J || J.L !== L || J.gen !== this._tatGen || J.n > n)
            J = this._tatIdx = {
                L,
                n: 0,
                gen: this._tatGen,
                je: new Map(),
                kachel: new Map(),
                dauer: new Map(),
                lava: [], // die Lava-Taten (das Licht fragt sie, `_leuchtQuellen`)
            };
        const N = AnazhRealm.TAT_NARBE;
        for (; J.n < n; J.n++) {
            const a = L[J.n];
            if (!a || !N[a.tat] || !Number.isFinite(a.x + a.z + a.h)) continue;
            J.dauer.set(a, N[a.tat].stunden / Math.max(N.lebMin, this.worldFieldAt(a.x, a.z).lebendig));
            const k = this._lifeCellKey(a.x, a.z);
            if (!J.je.has(k)) J.je.set(k, []);
            J.je.get(k).push(a);
            if (a.tat === "lava") J.lava.push(a);
            if (a.tat === "ernten" && typeof a.kachel === "string") {
                if (!J.kachel.has(a.kachel)) J.kachel.set(a.kachel, new Set());
                J.kachel.get(a.kachel).add(a.id);
            }
        }
        return J;
    }

    // Die Narbe an (x,z): Σ Tiefe × Rest je Tat der Zelle (der Rest fällt linear von 1 auf 0 über ihre Dauer), gekappt.
    _narbeAt(x, z) {
        const I = this._tatIndex();
        const je = I.n ? I.je.get(this._lifeCellKey(x, z)) : null;
        if (!je) return 0;
        const N = AnazhRealm.TAT_NARBE;
        const h = this._weltStunde();
        let s = 0;
        for (const a of je) s += N[a.tat].tiefe * Math.min(1, Math.max(0, 1 - (h - a.h) / I.dauer.get(a)));
        return Math.min(N.max, s);
    }

    // Die gepflückten Kennungen einer Nah-Streu-Kachel (leer, wenn keine) — die Kachel lässt sie weg.
    _geerntetIn(kachel) {
        return this._tatIndex().kachel.get(kachel) || AnazhRealm.TAT_LEER;
    }

    // Liegt eine Tat der Klasse `tat` binnen `r` m um (x,z)? (Der Wald fragt, ob hier ein Baum fiel.)
    _tatAm(tat, x, z, r = 0.5) {
        const I = this._tatIndex();
        const je = I.n ? I.je.get(this._lifeCellKey(x, z)) : null;
        return !!je && je.some((a) => a.tat === tat && Math.hypot(a.x - x, a.z - z) <= r);
    }

    // Sperrt eine Tat den Wurf des Gesetzes an (x,z)? Der Boot wirft die Welt neu (speicher.K3) — wo ein Baum fiel, bis die Narbe
    // heilt, wo ein Wurf abgebaut wurde, für immer: die Promotion, die Streu und jeder Wurf durch `_naturSetzen` fragen hier.
    _tatSperrt(x, z) {
        return this._tatAm("faellen", x, z) || this._tatAm("abbauen", x, z);
    }

    // === die SCHREIB-Seite der emotion-Achse (das räumliche Gedächtnis) ===
    // Eine emotionale Tat (`_feelAction`) prägt ihre Emotion an der Spieler-Zelle ein; `auraAt` blendet
    // den Abdruck über die globale Stimmung, der Welt-Tint liest das. Lazy-Decay, kein Frame-Sweep.
    _depositEmotion(x, z, emotionMap) {
        if (!emotionMap) return;
        if (!this.state.emotionField) this.state.emotionField = new Map();
        const ef = this.state.emotionField;
        const cfg = AnazhRealm.EMOTION_FIELD;
        const now = this.state.spielZeit;
        const key = this._lifeCellKey(x, z); // dieselbe 16-m-Zelle wie das Leben
        let cell = ef.get(key);
        if (cell) {
            const f = Math.exp(-cfg.decayPerSec * Math.max(0, now - cell.t)); // erst zerfallen
            for (const k of Object.keys(cell.axes)) cell.axes[k] *= f;
            cell.t = now;
        } else {
            cell = { axes: {}, t: now };
            ef.set(key, cell);
        }
        let m = 0;
        for (const axis of Object.keys(emotionMap)) {
            cell.axes[axis] = Math.min(cfg.max, (cell.axes[axis] || 0) + emotionMap[axis] * cfg.imprintScale);
        }
        for (const axis of Object.keys(cell.axes)) m = Math.max(m, cell.axes[axis]);
        // die Tat räumt (`_feldTod`): die Zelle stirbt, wo ihre stärkste Achse unter epsilon zerfällt
        this._feldTod(ef, key, cell, now + Math.max(0, Math.log(m / cfg.epsilon)) / cfg.decayPerSec, now);
    }

    // Der aktuelle (zerfallene) Emotions-Abdruck an (x,z) — null, wenn keine Zelle
    // (dann blendet auraAt nichts → emotion == globale Stimmung, backward-compat).
    _emotionOverlayAt(x, z) {
        const ef = this.state.emotionField;
        if (!ef || ef.size === 0) return null;
        const cell = ef.get(this._lifeCellKey(x, z));
        if (!cell) return null;
        const dt = Math.max(0, this.state.spielZeit - cell.t);
        const f = dt === 0 ? 1 : Math.exp(-AnazhRealm.EMOTION_FIELD.decayPerSec * dt);
        let out = null;
        let lebt = false; // tot, wenn jede Achse unter `epsilon` zerfiel (wie die Räumung urteilt)
        for (const axis of Object.keys(cell.axes)) {
            const v = cell.axes[axis] * f;
            if (v >= AnazhRealm.EMOTION_FIELD.epsilon) lebt = true;
            if (v > 1e-4) {
                if (!out) out = {};
                out[axis] = v;
            }
        }
        return lebt ? out : null;
    }

    // Welt-Affinität (worldFieldAt: lebendig/dichte/glut/magie) pro Terrain-Vertex als vec4-Attribut;
    // der Terrain-Shader leitet daraus die Grundfarbe ab. Aufruf beim Chunk-Bau NACH
    // setAttribute("position") — Vertices liegen in Welt-Koords (mesh.position = 0,0,0).
    _attachFieldAttribute(geometry) {
        const pos = geometry && geometry.getAttribute ? geometry.getAttribute("position") : null;
        if (!pos) return;
        const count = pos.count;
        const field = new Float32Array(count * 4);
        for (let i = 0; i < count; i++) {
            const f = this.worldFieldAt(pos.getX(i), pos.getZ(i));
            field[i * 4] = f.lebendig;
            field[i * 4 + 1] = f.dichte;
            field[i * 4 + 2] = f.glut;
            field[i * 4 + 3] = f.magieleitung;
        }
        geometry.setAttribute("aField", new THREE.BufferAttribute(field, 4));
    }

    // Per-Vertex-Farbe für eine fliegende Insel: Surface-Nets-Geometrie hat nur position+normal (kein
    // aField/uv) — der Terrain-ShaderMaterial-Pfad rendert damit kaputt, darum PBR + vertexColors.
    // Farbe folgt der Normale: oben Wiese, seitlich Erd-Hang, unten Fels — die EINE Boden-Palette (`BODEN_FARBE`,
    // Studio PORTAL_GROUND nach dem Farb-Gesetz), wie der Boden darunter; bis 06.10. trug die Insel eigene Literale.
    _attachIslandColors(geom) {
        const pos = geom && geom.getAttribute ? geom.getAttribute("position") : null;
        const norm = geom && geom.getAttribute ? geom.getAttribute("normal") : null;
        if (!pos || !norm) return;
        const n = pos.count;
        const colors = new Float32Array(n * 3);
        const P = AnazhRealm.BODEN_FARBE;
        const grass = P.mead;
        const earth = P.dirt;
        const rock = P.rock;
        for (let i = 0; i < n; i++) {
            const ny = norm.getY(i);
            let c;
            if (ny > 0.55) {
                c = grass;
            } else if (ny < -0.1) {
                c = rock;
            } else {
                const t = Math.max(0, Math.min(1, (0.55 - ny) / 0.65));
                c = [
                    grass[0] + (earth[0] - grass[0]) * t,
                    grass[1] + (earth[1] - grass[1]) * t,
                    grass[2] + (earth[2] - grass[2]) * t,
                ];
            }
            colors[i * 3] = c[0];
            colors[i * 3 + 1] = c[1];
            colors[i * 3 + 2] = c[2];
        }
        geom.setAttribute("color", new THREE.Float32BufferAttribute(colors, 3));
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
        return !this._fundamentLand(position.x, position.z, ry, g.fp, g.tuer, g.saum);
    }

    // DER ORT EINES WERKS AM UFER (Schau-2 wasser-wahrheit, Gegenprüfung): wo die Welt ein Werk mit Grundriss-Gesetz hinstellt
    // (der Satz, der Tempel des Nexus, ein Programm), sucht sie den Ort, an dem sein ganzes Fundament auf dem Land steht —
    // `pos` selbst, sonst den nächsten in Ringen um den geklemmten Ort (1,5 m Schritt bis zur Reichweite des Grundrisses + 3 m
    // + Weg der Klemme, zwölf Richtungen ab dem Winkel `wurf()`, dem Strom des Samens). Geurteilt wird am Ort NACH der Spieler-Klemme der Wurzel
    // (`_structureSpawnPos`), wie die Wurzel urteilt (`_werkImWasser`). „am Wasser" liefert den Fleck 2 m hinter dem Ufer —
    // ein Stamm steht dort, ein Haus reicht 4–6 m ins Wasser. Rückgabe { x, y, z } (y der Fuß des Werks auf der obersten Fläche,
    // `_werkFuss` — nie die Höhe des Verlangten: `at_player_forward` trägt die des Spielers) oder null (kein tragender Ort in
    // Reichweite). Ein Werk ohne Grundriss-Gesetz: `pos` geklemmt.
    // DAS MASS IST DER GEKLEMMTE ORT `p0` (werk-ufer): wo die Wurzel das Werk hinstellt, ist `pos` nach der Spieler-Klemme;
    // die Ringe liegen um `p0`, so weit, dass sie den Grundriss um `pos` decken, und jeder Kandidat misst sich (geklemmt) an
    // `p0`. Gemessen an `pos` lag jeder Kandidat nahe am Spieler auf dem Kreis der Klemme, alle fast gleich weit — das Maß
    // verlor die Richtung des Verlangten: am Gleithang −910/−623 (3,96 m vom Wasser) stand das Haus 13,5 m vom Wasser.
    _werkOrtSuchen(type, pos, opts, wurf) {
        const sc = opts && Number.isFinite(opts.scale) && opts.scale > 0 ? opts.scale : 1;
        const klemme = (p) => this._structureSpawnPos(type, p, { state: this.state }, sc);
        const fuss = (q) => ({ x: q.x, y: this._werkFuss(q.x, q.z, q.y), z: q.z });
        const p0 = klemme(pos);
        const g = this._werkGrundriss(type, opts);
        if (!g || !this._werkImWasser(type, p0, opts)) return fuss(p0);
        const reich =
            Math.hypot(g.fp.ex, g.fp.ez) + Math.hypot(g.fp.ox, g.fp.oz) + 3 + Math.hypot(p0.x - pos.x, p0.z - pos.z);
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
                const q = klemme({ x, y: p0.y, z });
                kand.push([Math.hypot(q.x - p0.x, q.z - p0.z), q]);
            }
        }
        kand.sort((a, b) => a[0] - b[0]);
        for (const [, q] of kand) if (!this._werkImWasser(type, q, opts)) return fuss(q);
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
        const rec = !bp && this._foundry && this._foundry.recipes ? this._foundry.recipes[name] : null;
        return String((bp && bp.label) || (rec && rec.lab) || name).split(/\s[·—(]/)[0];
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
                saum: globalThis.__fachwerkCore.ORT_GESETZ.saumM, // der Grund des Orts: Grundriss samt Saum (der Erdbau)
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
}
_stammZonen(AnazhRealm, [AnazhRealm_feld_leben]);

// ===== ATLAS · Feld/leben — Außen-Konstanten =====
// Charakter-Achsen: welche Design-Sprache eine Rezept-Domäne trägt, wo ihre Tabelle im Gesetzbuch
// wohnt und wie die Wahl als ov-Passagier reist (Schmiede: __tradition = STEUER-Schlüssel für
// buildInstance; Garage: die Kultur-fx-Dials reisen roh). Neue Achse = EINE Zeile.
AnazhRealm.KIND_CHARAKTER = Object.freeze({
    weapon: Object.freeze({
        ns: "__schmiedeCore",
        tabelle: "TRADITIONEN",
        wort: "Tradition",
        ov: (name) => ({ __tradition: name }),
    }),
    vehicle: Object.freeze({
        ns: "__vehicleCore",
        tabelle: "CULTURES",
        wort: "Kultur",
        ov: (name, tab) => Object.assign({}, tab[name] && tab[name].fx),
    }),
});

// FELD-CHARAKTER: jede Welt-Stimme hat ihre eigene Frequenz (lebendig λ200, dichte λ340, glut λ520,
// magie λ160 m) — der Welt-Charakter emergiert aus dem Überlagerungs-Muster (Ecotone an
// argmax-Grenzen + AFFINITY_FLOOR-Linie). Nur bei gen >= 3 aktiv (alte Welten bit-identisch).
AnazhRealm.FIELD_CHARACTER = Object.freeze({
    // Wellenlängen (m). Erst-Wurf aus genese-plan §Γ3.
    lambdaLebendig: 200,
    lambdaDichte: 340,
    lambdaGlut: 520,
    lambdaMagieleitung: 160,
    // Domain-Warp-Amplitude (m): verschiebt die Sample-Koordinaten VOR den Stimmen-Reads → die Stimmen
    // mäandern statt parallel zu liegen. Eigener Stream `seed + "-veg-warp"` (re-rollt keinen anderen);
    // λ~600 m, langsamer als die Stimmen, sonst überdeckt der Warp ihre Struktur.
    warpAmp: 40,
    warpScale: 1 / 600,
});
AnazhRealm.KEYBINDING_LABELS = Object.freeze({
    break: "Abbauen (Architektur / Terrain)",
    place: "Platzieren (Bau-Modus)",
    confirmBuild: "Bauen bestätigen",
    inventory: "Inventar öffnen",
    cancelBuild: "Bau-Modus verlassen",
    jump: "Springen",
    drawerKreaturen: "Hof öffnen (Kreaturen · Nexus · Befehle)",
    drawerSpieler: "Spieler-Drawer öffnen",
    drawerWerkstatt: "Werkstatt-Drawer öffnen",
    drawerEinstellungen: "Einstellungen-Drawer öffnen",
    cameraToggle: "Kamera: 1st/3rd-Person",
    swapHands: "Hand tauschen (Off-Hand)",
    chat: "Gespräch öffnen (sprich mit der Welt)",
    // die Aktionen, die die Tastatur fest trägt und das Gamepad frei bindet (PAD_BELEGUNG, leib.K5)
    einsteigen: "Aufsitzen/Absitzen · Sitzen · Portal betreten",
    handbremse: "Handbremse (Fahrt)",
    sprint: "Sprinten (unter Wasser: tauchen)",
    rutschen: "Rutschen",
    zoom: "Fernglas (halten)",
    hud: "HUD aus/ein",
    slotVor: "Nächster Hotbar-Slot",
    slotZurueck: "Voriger Hotbar-Slot",
});
// Der Grund der Natur-Wand im Satz des Spielers (Leser: `SETZ_GRUND` des Ergebnis-Satzes, `confirmBuild` und das Bau-HUD).
AnazhRealm.NATUR_WAND_GRUND = Object.freeze({
    lichtung: "die Lichtung des Genesis-Platzes bleibt frei, keine Krone steht über der Scheibe und dem Ring der Tore",
    haus: "im Grundriss eines Hauses wächst nichts",
    bau: "im Grundriss eines Baus wächst nichts",
    weg: "auf Weg, Platz und Acker eines Dorfs wächst nichts",
    wagen: "in einem Wagen wächst nichts",
    wasser: "im Wasser steht nichts, am Ufer schon",
});
// DIE GRÜNDE DES ERGEBNIS-SATZES (`_ergebnisSatz`, Schau-2 Runde 3): jeder Wurf, der nicht steht, trägt einen — die Wand
// (`NATUR_WAND_GRUND`), das Budget des Programms, die Obergrenze der Kreaturen (die Zahl liest der Satz aus dem Zustand), das
// Buch des Studios, ein unbekannter Bauplan, eine unbekannte Seele, eine Gestalt, die nicht gegossen wurde, die fehlende
// Bühne — jeder benannt von der Stelle, die absagt (die Wurzel über `opts.absage`). „unbenannt" sagt ehrlich, dass eine
// Absage ihren Grund nicht nannte (die Linse verbietet ihn).
AnazhRealm.SETZ_GRUND = Object.freeze({
    ...AnazhRealm.NATUR_WAND_GRUND,
    budget: "das Werk-Budget dieses Satzes ist aufgebraucht",
    obergrenze: "die Welt trägt nicht mehr Kreaturen",
    buch: "das Studio-Buch ist noch nicht geladen",
    unbekannt: "die Welt kennt diesen Bauplan nicht",
    seele: "die Welt kennt diese Seele nicht",
    gestalt: "die Gestalt ließ sich nicht gießen",
    buehne: "die Welt hat noch keine Bühne",
    platz: "kein fahrbarer Grund in Reichweite, die Welt stellt den Wagen nicht hin",
    vertrag: "der Stempel trägt einen Regler, den das Studio nicht ausweist",
    regler: "das Werk kennt diesen Regler nicht (das Log nennt ihn und die Regler seiner Art)",
    unbenannt: "ohne benannten Grund (das Log der Welt nennt ihn)",
});
// DER STUDIO-SATZ (Leser: die letzte Chat-Regel und `_studioSatzAbsage`): Verb · Zahl · Art (auch leer vor einem Hain) ·
// Hain/Wald/Gruppe · am Wasser | hier/vor mir.
AnazhRealm.STUDIO_SATZ =
    /^(?:pflanz|setz|bau|stell|erschaff|mach|wachs)\w*\s+(?:mir\s+|uns\s+)?(?:(ein\s+paar|ein(?:en|e|ige)?|zwei|drei|vier|fünf|fuenf|sechs|sieben|acht|neun|zehn|\d+)\s+)?([a-zäöüß_]*?)(hain|wald|gruppe)?(?:\s+(?:am|an|beim|zum|ans)\s+(wasser|fluss|see|ufer|bach|meer)|\s+(hier|vor mir))?\s*[.!]?$/i;

// LIFE_FIELD — die SCHREIB-Seite des Feldes: über dem frozen worldFieldAt.lebendig-Kern liegt ein
// sparse, langsam zerfallendes Overlay (16-m-Zellen); eine Geburt deponiert Leben, es zerfällt zum
// Substrat zurück (Homöostase). auraAt blendet min(frozen+overlay, 1) — nie überschreiben; leerer
// Overlay → lebendig == frozen. Schließt den at_field_need-Loop: Leben in den Mangel → der Mangel
// sinkt → der Nexus zieht weiter (kein rich-get-richer).
AnazhRealm.LIFE_FIELD = Object.freeze({
    cell: 16, // m — das Hydrosphäre/Voxel-Raster (Region-Skala)
    decayPerSec: 0.008, // Halbwertszeit ~87 s (getendete Region lingert, verwaiste verblasst)
    pulseCenter: 0.25, // eine Geburt hebt die Zelle (sparse ~0.1 → ~0.35, nicht mehr Minimum)
    pulseNeighbor: 0.1, // 3×3-Kernel-Rand (weiche räumliche Ausbreitung, kein Block)
    max: 0.7, // Sättigung pro Zelle (frozen+overlay → ~1; Wiederhol-Pulse sättigen → Nexus zieht weiter)
    kahl: -1, // der Boden des Fraßes: eine abgeäste Zelle trägt lebendig 0, nie weniger (auraAt klemmt)
    epsilon: 0.004, // darunter wird eine Zelle gepruned (die Map bleibt bounded)
    // Kreatur-Trickle: nur Nexus/Spieler-getragene Kreaturen (tendsLife) träufeln Leben, wo sie wohnen —
    // die ambiente Fauna ist die FOLGE des Feldes (kein Runaway). Sanft + rate-limitiert; wandernde
    // Kreaturen ziehen einen zarten Lebens-Pfad.
    trickle: 0.05, // pro Trickle-Deposit (klein — ein Garten wird gepflegt, nicht geflutet)
    trickleEverySec: 3, // jede tendende Kreatur träufelt höchstens alle 3 s
});

// TAT_NARBE — die Narbe je Tat-Klasse (feld.K4, `_tatSchreiben`): `tiefe` senkt lebendig in der 16-m-Zelle der Tat, `stunden`
// ist ihre Dauer in Welt-Stunden bei lebendig 1 (die Dauer = stunden / max(lebMin, frozen lebendig): wo das Feld lebt, heilt
// es schneller). Ein Baum hält die Lichtung Spieltage, eine gepflückte Pflanze Stunden; `max` kappt die Narbe einer Zelle.
AnazhRealm.TAT_NARBE = Object.freeze({
    faellen: Object.freeze({ tiefe: 0.12, stunden: 48 }),
    ernten: Object.freeze({ tiefe: 0.01, stunden: 3 }),
    abbauen: Object.freeze({ tiefe: 0, stunden: Infinity }), // ein Wurf des Gesetzes, abgebaut: er kehrt nie zurück (speicher.K3)
    brand: Object.freeze({ tiefe: 0.3, stunden: 72 }), // die Asche (`_brandSchritt`): solange sie liegt, brennt die Zelle nicht
    lava: Object.freeze({ tiefe: 0.5, stunden: Infinity }), // die Lava (`_lavaGiessen`): erstarrt bleibt sie Stein
    riss: Object.freeze({ tiefe: 0.03, stunden: 24 }), // ein Tod von Spieler-Hand (`_creatureCombatDeath`): ein Leben fehlt dem Ort
    max: 0.6,
    lebMin: 0.1,
});
AnazhRealm.TAT_LEER = Object.freeze(new Set()); // die Kachel ohne Ernte (`_geerntetIn`)

// Die Scheibe des Todes-Rads einer Feld-Karte in Spielzeit-Sekunden (`_feldTod`): eine tote Zelle liegt höchstens so lange
// über ihrem Tod in der Karte (gelesen ist sie schon tot); FELD_LEER die fehlende Zelle.
AnazhRealm.FELD_TOD_EIMER_S = 8;
AnazhRealm.FELD_LEER = Object.freeze({});

// BRAND — das Feuer auf dem Feld (feld.K3#2, `_tickBrand`): eine brennende 16-m-Zelle des Felds zehrt ihren Brennstoff — das
// lebendig ihres Orts (`auraAt`, die Vegetation samt Narbe; unter `minStoff` und auf Asche brennt nichts) — in `brennS`
// Sekunden je Einheit, glüht in `aufS` auf und greift je Schritt (`schrittS` Spielzeit) mit `greift` × Brennstoff × Glut auf
// jede der vier Nachbar-Zellen über. Die Übergangs-Wahrscheinlichkeit je Nachbar bleibt unter greift · brennS = 0,48 und damit
// unter der Perkolations-Schwelle des Quadrat-Gitters (½): jedes Feuer erlischt von selbst. Nässe über `loescht` erstickt
// es. Glut leuchtet als Feuer (LICHT_GESETZ.feuer, Masse `licht` × Glut) und hebt glut in `auraAt`.
AnazhRealm.BRAND = Object.freeze({
    schrittS: 1,
    brennS: 24,
    aufS: 4,
    greift: 0.02,
    minStoff: 0.15,
    loescht: 0.35,
    licht: 4,
    nachbarn: Object.freeze([
        [1, 0],
        [-1, 0],
        [0, 1],
        [0, -1],
    ]),
});

// DER STAHL DER ESSE (stoffe.K3-2, `_tickEsse`): das Feuer der Esse (Holzkohle unter dem Blasebalg, gelbe Glut 1 300 °C), die
// Klinge (`dickeM`, τ = ρ·c·d/2 / α — Stahl im Feuer 32 s, an der Luft 160 s: ab 16 s glüht sie, 2,3 min nach dem Feuer nicht
// mehr), der Übergang im Glutbett (Strahlung und Kontakt der Kohle, W/(m²·K)) und an der Luft (Strahlung und Konvektion über den
// Gang gemittelt), die Reichweite des Arms über den Rand des Betts, der Umkreis der Suche, die Ruhe (K über der Luft: darunter
// ist sie kalt), die strahlende Fläche und der Kern der Klinge (ihr Licht) und die Hand über dem Fuß ohne Gerät-Netz.
AnazhRealm.ESSE = Object.freeze({
    feuerK: 1573,
    dickeM: 0.005,
    alphaFeuer: 300,
    alphaLuft: 60,
    armM: 0.9,
    suchM: 4,
    ruheK: 1,
    flaecheM2: 0.06,
    kernM: 0.25,
    handHoeheM: 1.1,
});

AnazhRealm.EMOTION_FIELD = Object.freeze({
    decayPerSec: 0.012, // Halbwertszeit ~58 s — Gefühle verblassen schneller als Leben
    imprintScale: 0.5, // wie viel der Tat-Emotion sich am Ort einprägt
    max: 0.8, // Sättigung pro Achse/Zelle (ein Ort wird nicht unendlich traurig)
    epsilon: 0.004, // darunter wird eine Zelle gepruned
    // cell = LIFE_FIELD.cell (16 m) — dieselbe Zell-Quelle (`_lifeCellKey`)
});
