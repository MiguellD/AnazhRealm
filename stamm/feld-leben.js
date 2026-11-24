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
                // boundingSphere der Chunks liegt schon in Welt-Koordinaten; bei Position-Offset (Bauten,
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
        // die Beschreibung liest die Liste je Zeichnen aus dem Programm (`describeProgram`, in der Sprache von jetzt) — sie
        // reist nie im Stand (bis spielgang.K5#2 stand sie deutsch im Eintrag)
        const entry = {
            name,
            program,
            source,
            createdAt: this.state.spielZeit,
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
            this.grokRender(this._firstWelcomeZeile());
            try {
                if (typeof localStorage !== "undefined") localStorage.setItem("anazh.ui.skipIntro", "true");
            } catch {
                /* localStorage gesperrt — worldJournal trägt das Flag */
            }
            this.journalAppendOnce("intro", "ritual", ["journal.erstes-wort"]);
        };
        if (opts.immediate) invite();
        else if (typeof setTimeout === "function") setTimeout(invite, 1800);
        else invite();
    }

    // Die EINE Begrüssung des Begleiters — eine Einladung, keine Anleitung. Sie
    // erklärt nichts (kein WASD/Hotbar-Dump), sie öffnet die Tür: die Welt wächst
    // aus dem ersten Wort. Das ist der WOW — die Welt antwortet auf deine Stimme.
    _firstWelcomeZeile() {
        return ["rede.eins-gruss"];
    }
    _firstWelcomeMessage() {
        return this._t(...this._firstWelcomeZeile());
    }

    // DIE TAT IN WORTEN (spielgang.K5#2): ein DSL-Programm als EINE Zeile der Tafel `[schlüssel, werte]` — jede Sprache liest
    // sie in ihrer Spalte, ein Wert ist selbst eine Zeile (der Ort, die Bedingung, das Wetter, die Teil-Tat einer Kette); ein
    // Leser, der Text braucht, liest sie über `_t`. chain/when/repeat/delay rekursieren. Bis spielgang.K5#2 schrieb diese
    // Methode deutschen Text, und die Antwort der KI stand im englischen Chat halb deutsch („The world changed: lässt …").
    describeProgram(node) {
        if (!Array.isArray(node) || node.length === 0) return ["tat.nichts"];
        const op = node[0];
        const args = node.slice(1);
        if (op === "chain") {
            const parts = args.filter((a) => Array.isArray(a)).map((a) => this.describeProgram(a));
            if (parts.length === 0) return ["tat.nichts"];
            return parts.reduce((a, b) => ["tat.und", { a, b }]);
        }
        if (op === "when")
            return ["tat.wenn", { bedingung: this._describeDslCondition(args[0]), tat: this.describeProgram(args[1]) }];
        // V17.36 Phase D — eine stehende Welt-Regel menschen-lesbar.
        if (op === "rule") {
            const opts = args[2] && typeof args[2] === "object" && !Array.isArray(args[2]) ? args[2] : {};
            const werte = { bedingung: this._describeDslCondition(args[0]), tat: this.describeProgram(args[1]) };
            return opts.everySec ? ["tat.regel-takt", { ...werte, s: opts.everySec }] : ["tat.regel", werte];
        }
        if (op === "repeat") return ["tat.mal", { n: String(args[0]), tat: this.describeProgram(args[1]) }];
        if (op === "delay") return ["tat.nach", { s: String(args[0]), tat: this.describeProgram(args[1]) }];
        if (op === "say") return ["tat.sagt", { text: String(args[0]) }];
        if (op === "record_narrative") return ["tat.vermerkt"];
        const t = this._dslDescriptionTable();
        if (t[op]) return t[op](args);
        return ["tat.wirkt", { op: String(op) }];
    }

    // Der Ort eines Positions-Knotens als Zeile der Tafel (ein Wert der Tat-Zeile): jeder Ort der DSL (`dslPositions`, aus
    // derselben Tafel liest die KI ihre Orte) ist eine Zeile `tat.ort.<ort>` — gate:sprache F zählt sie aus `dslPositions`.
    _describeDslPosition(arg) {
        const head = Array.isArray(arg) ? arg[0] : null;
        if (head === "at")
            return arg.length >= 4 ? ["tat.ort.at", { x: arg[1], y: arg[2], z: arg[3] }] : ["tat.ort.stelle"];
        return typeof head === "string" && Object.hasOwn(this.dslPositions, head)
            ? [`tat.ort.${head.replace(/_/g, "-")}`]
            : ["tat.ort.stelle"];
    }

    // Die Bedingung eines Gesetzes als Zeile der Tafel; ihre Achse (joy, lebendig …) und Zahl sind Werte.
    _describeDslCondition(node) {
        if (!Array.isArray(node)) return ["tat.wenn.etwas"];
        const op = node[0];
        const a = node.slice(1);
        const w = (i) => String(a[i]);
        if (op === "emotion_above")
            return a[1] == null
                ? ["tat.wenn.emotion", { achse: w(0) }]
                : ["tat.wenn.emotion-ueber", { achse: w(0), n: w(1) }];
        if (op === "fps_below") return ["tat.wenn.fps", { n: w(0) }];
        if (op === "player_y_below") return ["tat.wenn.hoehe", { n: w(0) }];
        if (op === "weather_is") return ["tat.wenn.wetter", { wetter: this._wetterZeile(a[0]) }];
        if (op === "random_chance") return ["tat.wenn.zufall", { n: w(0) }];
        if (op === "time_passed") return ["tat.wenn.zeit", { n: w(0) }];
        if (op === "near_player") return ["tat.wenn.nahe"];
        if (op === "creatures_count_above") return ["tat.wenn.kreaturen", { n: w(0) }];
        if (op === "compound_has_tag") return ["tat.wenn.tag", { was: w(0), tag: w(1), n: w(2) }];
        if (op === "compound_has_spatial_tag") return ["tat.wenn.raum-tag", { was: w(0), tag: w(1), n: w(2) }];
        // V17.34/.36 — die Feld-Bedingungen (Regeln lesen das lebendige Feld am Ort)
        if (op === "field_above") return ["tat.wenn.feld-hoch", { achse: w(0), n: w(1) }];
        if (op === "field_below") return ["tat.wenn.feld-niedrig", { achse: w(0), n: w(1) }];
        if (op === "and" || op === "or")
            return a
                .map((c) => this._describeDslCondition(c))
                .reduce((x, y) => [op === "and" ? "tat.wenn.und" : "tat.wenn.oder", { a: x, b: y }]);
        if (op === "not") return ["tat.wenn.nicht", { bedingung: this._describeDslCondition(a[0]) }];
        return ["tat.wenn.op", { op: String(op) }];
    }

    // Das Wort des Wetters als Zeile der Tafel (`wetter.<wort>`, je Wort der DSL: `WETTER_WOERTER`); ein Wort, das die Welt
    // nicht kennt, steht als Datum.
    _wetterZeile(wort) {
        return AnazhRealm.WETTER_WOERTER.includes(wort) ? [`wetter.${wort}`] : String(wort);
    }

    _dslDescriptionTable() {
        const pos = (a) => this._describeDslPosition(a);
        const s = (x) => String(x);
        const n = (x) => String(x || 1);
        const kreatur = (k, kMit, a) => {
            const extra = this._describeCreatureTaskArg(a[1], a[2]);
            const werte = { id: s(a[0]), auftrag: s(a[1]) };
            return extra ? [kMit, { ...werte, extra }] : [k, werte];
        };
        return {
            weather: (a) =>
                a[0] === "frei" ? ["tat.wetter-frei"] : ["tat.wetter", { wetter: this._wetterZeile(a[0]) }],
            gravity: (a) => ["tat.schwere", { n: s(a[0]) }],
            terrain_steepness: (a) => ["tat.steilheit", { n: s(a[0]) }],
            terrain_base_height: (a) => ["tat.grundhoehe", { n: s(a[0]) }],
            voxel_carve: (a) => ["tat.schnitzt", { x: s(a[0]), y: s(a[1]), z: s(a[2]), r: s(a[3]) }],
            voxel_fill: (a) => ["tat.schuettet", { x: s(a[0]), y: s(a[1]), z: s(a[2]), r: s(a[3]) }],
            lava: (a) => ["tat.lava", { x: s(a[0]), z: s(a[2]) }],
            set_time_of_day: (a) => ["tat.uhr", { n: s(a[0]) }],
            set_season: (a) => ["tat.saison", { saison: s(a[0]) }],
            skybox_color: () => ["tat.himmel"],
            deposit_life: (a) => ["tat.leben", { ort: pos(a[0]) }],
            deposit_emotion: (a) => ["tat.praegt-feld", { achse: s(a[0]), ort: pos(a[2]) }],
            spawn_creature: (a) =>
                a[2]
                    ? [
                          (a[1] || 1) !== 1 ? "tat.kreaturen-gemuet" : "tat.kreatur-gemuet",
                          { n: n(a[1]), gemuet: s(a[2]), ort: pos(a[0]) },
                      ]
                    : [(a[1] || 1) !== 1 ? "tat.kreaturen" : "tat.kreatur", { n: n(a[1]), ort: pos(a[0]) }],
            spawn_tree: (a) => [(a[1] || 1) !== 1 ? "tat.baeume" : "tat.baum", { n: n(a[1]), ort: pos(a[0]) }],
            spawn_studio: (a) => {
                const name = typeof a[0] === "string" ? this._studioBlueprintForWord(a[0].toLowerCase()) : null;
                const bp = name && this.state.blueprints ? this.state.blueprints[name] : null;
                const was = (bp && (bp.etikett || bp.label)) || (name && this._werkLabel(name)) || s(a[0]); // Etikett: Zeile
                if (name && this._studioWerkVerb(name) === "praegung") return ["tat.praegt", { was }];
                return ["tat.studio", { n: n(a[2]), was, ort: pos(a[1]) }];
            },
            spawn_village: (a) => ["tat.dorf", { ort: pos(a[0]) }],
            spawn_temple: (a) => ["tat.tempel", { ort: pos(a[0]) }],
            spawn_waterfall: (a) => ["tat.wasserfall", { ort: pos(a[0]) }],
            spawn_blueprint: (a) => {
                const bp = this.state.blueprints && this.state.blueprints[a[0]];
                // der Name, nie die id (V-D8): das Etikett als Zeile (es wechselt mit der Sprache), sonst das Wort als Daten
                const was = bp && (Array.isArray(bp.etikett) ? bp.etikett : bp.label);
                return ["tat.baut", { was: was || s(a[0]), ort: pos(a[1]) }];
            },
            remove_architecture: () => ["tat.abbau"],
            spawn_fractal: (a) => ["tat.fraktal", { was: s(a[1]), tiefe: s(a[2]), ort: pos(a[0]) }],
            define_blueprint: (a) => ["tat.bauplan", { was: s(a[0]) }],
            define_material: (a) => ["tat.material", { was: s(a[0]) }],
            define_ability: (a) => ["tat.faehigkeit", { was: s(a[0]) }],
            set_tool_meta: (a) => ["tat.werkzeug-meta", { was: s(a[0]), art: s(a[1]) }],
            register_tool: (a) => ["tat.werkzeug", { was: s(a[0]) }],
            apply_connection: (a) => ["tat.verbindet", { was: s(a[0]), mit: s(a[1]) }],
            apply_op: (a) => ["tat.bearbeitet", { was: s(a[0]), teil: s(a[1]), mit: s(a[2]) }],
            set_mode: (a) => ["tat.modus", { modus: s(a[0]) }],
            set_portal: (a) => ["tat.portal", { was: s(a[0]), welt: s(a[1]) }],
            add_to_inventory: (a) => ["tat.inventar", { n: n(a[1]), was: s(a[0]) }],
            creature_task: (a) => kreatur("tat.auftrag", "tat.auftrag-mit", a),
            creature_task_nearest: (a) => kreatur("tat.auftrag-naechste", "tat.auftrag-naechste-mit", [0, ...a]),
            creature_task_all: (a) => kreatur("tat.auftrag-alle", "tat.auftrag-alle-mit", [0, ...a]),
            creature_equip_tool: (a) =>
                a[1] ? ["tat.ruestet-werkzeug", { id: s(a[0]), was: s(a[1]) }] : ["tat.ohne-werkzeug", { id: s(a[0]) }],
            creature_equip_armor: (a) =>
                a[1] ? ["tat.ruestet-ruestung", { id: s(a[0]), was: s(a[1]) }] : ["tat.ohne-ruestung", { id: s(a[0]) }],
            creature_unequip: (a) => ["tat.ohne-slot", { id: s(a[0]), slot: s(a[1]) }],
            damage_creature: (a) => ["tat.schaden", { id: s(a[0]), n: s(a[1]) }],
            creature_apply_boost: (a) => ["tat.trank", { id: s(a[0]), was: s(a[1]) }],
            creatures_color: () => ["tat.kreaturen-farbe"],
            creatures_emotion: (a) => ["tat.kreaturen-gemuet-setzt", { gemuet: s(a[0]) }],
            creatures_speed_mul: (a) => ["tat.kreaturen-tempo", { n: s(a[0]) }],
            creatures_size_mul: (a) => ["tat.kreaturen-groesse", { n: s(a[0]) }],
            player_jump_power: (a) => ["tat.sprungkraft", { n: s(a[0]) }],
            player_speed: (a) => ["tat.tempo", { n: s(a[0]) }],
            player_soul: (a) => ["tat.seele", { seele: s(a[0]) }],
            set_visible: (a) => [a[1] ? "tat.sichtbar" : "tat.unsichtbar", { was: s(a[0]) }],
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
        const currentTime = this.state.spielZeit;
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
        this.state.nexusLastEvolution = this.state.spielZeit;
        this._gemuetGesetze(); // die Gesetze des Gemüts erwachen mit der Welt (affekt.K2)
        this.log("Nexus der Unendlichkeit erwacht – bereit für unendliche Evolution", "INFO");
    }

    evolveNexus(currentTime) {
        // ### Nexus-Evolution ###
        // Zweck: Erhöht Autonomie und schlägt neue Funktionen vor
        // DER TAKT DES NEXUS RUHT IN DER MESS-WELT (das EINE Urteil des Dorf-Zugs `_dorfTaktLebt`): unter dem Haken des Orts
        // `__anazhAutoSettlement = false` (jede Linse an der Ankunft, `server.zeige`) wirft er nichts nach der Wanduhr — sein Dorf
        // landete, je nachdem wie viele Takte die Welt bis zum Stehen brauchte, 180–380 m vom Spieler, in der CI am 25°-Hang der Stand-Linse (K8 fein
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
        // ### Nexus-Evolution als DSL-Programm ### Komponiert ein zufälliges DSL-Programm — die DSL ist der einzige Pfad für neue
        // Effekte (keine Code-Generierung). Mit composeRuleProb wird es eine stehende Regel: der `rule`-Op registriert sie über
        // denselben dslRun-Pfad in state.worldRules. Der Wurf des Nexus ist ein Strom der Welt (`_bauSame`, Γ5) — die
        // Komposition darunter zieht aus demselben Strom. Die Kennung `evo_<n>` ist der Schlüssel, die Seite liest `etikett`.
        const rng = this._samenStrom(this._bauSame("nexus"));
        // Keine Struktur-Batch-Bomben: ≤1 schwerer Welt-Bau (spawn_village/temple/…) pro Evolution, egal wie
        // in repeat/chain verschachtelt — jeder Bau ist ein synchroner Footprint-Remesh (~140 ms), N davon =
        // Sekunden-Freeze. Sonst neu würfeln (wenige Versuche); ein einzelner Bau bleibt ein Einzel-Hitch.
        const HEAVY = /spawn_(village|temple|fractal|waterfall)/g;
        let program = null;
        for (let tries = 0; tries < 4; tries++) {
            program =
                rng() < AnazhRealm.WORLD_RULES.composeRuleProb ? this._composeNexusRule(rng) : this.dslCompose({ rng });
            const heavyCount = (JSON.stringify(program).match(HEAVY) || []).length;
            if (heavyCount <= 1) break; // frame-sicher → nehmen
        }
        const n = String(this.state.dsl.nextEntryId++);
        return {
            name: `evo_${n}`,
            etikett: ["hud.geste-nexus", { n }],
            program,
            source: "nexus",
            createdAt: this.state.spielZeit,
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
        this.state.knowledgeBase.push({ type, content, timestamp: this.state.spielZeit });
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
    // DIE EINE CHAT-ZEILE (spielgang.K5): jede Zeile in #chat-output entsteht hier. Spricht die Welt, ist sie eine Zeile der
    // Tafel `[schlüssel, werte]` und trägt ihren Schlüssel am Knoten (`_tSetze`: der Wechsel der Sprache liest sie neu);
    // ein Text (das Wort des Spielers, der KI, eines Mitspielers) ist Daten (`translate="no"`). `sprecher` setzt den Namen
    // davor (Daten), `klasse` die Art der Zeile.
    _chatEcho(zeile, { klasse = null, sprecher = null, sprecherKlasse = null } = {}) {
        const chatOutput = typeof document !== "undefined" && document.getElementById("chat-output");
        if (!chatOutput) return null;
        const line = document.createElement("div");
        if (klasse) line.className = klasse;
        if (sprecher != null) {
            const nameSpan = document.createElement("span");
            nameSpan.className = sprecherKlasse || "chat-creature-name";
            nameSpan.translate = false;
            nameSpan.textContent = `${sprecher}: `;
            line.appendChild(nameSpan);
        }
        const text = document.createElement("span");
        if (Array.isArray(zeile)) this._tSetze(text, zeile[0], zeile[1]);
        else {
            text.textContent = String(zeile == null ? "" : zeile);
            text.translate = false;
        }
        line.appendChild(text);
        chatOutput.appendChild(line);
        chatOutput.scrollTop = chatOutput.scrollHeight;
        return line;
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
        const appendChatOutput = (zeile) => this._chatEcho(zeile);
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
        const nowSec = this.state.spielZeit;
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
            appendChatOutput(["chat.portal.kein-befehl", { befehl: command }]);
        }
        chatInput.value = "";
        return true;
    }

    // „wann immer X, dann Y" → stehende Mensch-Regel aus dem EINEN Satz-Parser (`_regelAusSatz`). dslRun(source:"human") →
    // der `rule`-Op registriert sie PERMANENT (kein ttl, geschützt vor Eviction + Fitness-Prune) und reist über den dsl-Kanal
    // zum Mitspieler (`p2pBroadcastDsl`), wo sie als sein Gesetz steht (`_gesetzGeber`).
    _chatTryRuleCommand(command, chatInput, appendChatOutput) {
        const g = this._regelAusSatz(command);
        if (!g) return false;
        if (g.program) {
            const result = this.dslRun(g.program, { source: "human" });
            appendChatOutput(
                result.ok
                    ? ["chat.gesetz.aufgestellt", { tat: this.describeProgram(g.program) }]
                    : ["chat.gesetz.nicht-aufgestellt"]
            );
        } else appendChatOutput(g.absage);
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
                appendChatOutput(["chat.regeln.keine", { vorlage: AnazhRealm.GESETZ_VORLAGEN[0] }]);
                chatInput.value = "";
                return true;
            }
            appendChatOutput(
                rules.length === 1
                    ? ["chat.regeln.eine", { n: rules.length }]
                    : ["chat.regeln.viele", { n: rules.length }]
            );
            for (const r of rules) {
                const who =
                    this._gesetzGeber(r) ||
                    (r.source === "nexus"
                        ? this._t("chat.regeln.der-nexus")
                        : r.source && r.source.startsWith("llm")
                          ? "Grok"
                          : r.source);
                appendChatOutput([
                    "chat.regeln.zeile",
                    {
                        regel: this.describeProgram(["rule", r.cond, r.effect]),
                        wer: String(who),
                    },
                ]);
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
                    ? removed === 1
                        ? ["chat.gesetze.eins-vergessen", { n: removed }]
                        : ["chat.gesetze.vergessen", { n: removed }]
                    : ["chat.gesetze.keine-eigenen"]
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
                    appendChatOutput(["chat.mana.erschoepft", { mana: p.mana | 0, kosten: manaCost }]);
                    chatInput.value = "";
                    return true;
                }
                p.mana -= manaCost;
            }
        }
        const result = this.dslRun(parsed.program, { source: "human" });
        this.state.dsl.lastUserProgram = parsed.program;
        this.state.dsl.lastUserOutcome = result.outcome;
        this.state.dsl.lastUserAt = this.state.spielZeit;
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
            const satz = ohneOrt.grund || ["chat.ort.kein-ort"];
            appendChatOutput(
                ohneOrt.op === "near_water" ? ["chat.ort.kein-wasser", { satz }] : ["chat.ort.nichts-geschah", { satz }]
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
        // der Grund ist eine Zeile der Tafel (die DSL: `dslEvalPos`, das Band eines Werts) oder ein Text des Fremden
        const grund = e && e.grund ? (Array.isArray(e.grund) ? e.grund : String(e.grund)) : null;
        const zeile = (g) => (Array.isArray(g) ? AnazhRealm._tIn("de", g[0], g[1]) : g);
        if (e) this.log(`Programm-Absage: ${e.event}${grund ? " — " + zeile(grund) : ""}`, "INFO");
        if (!e) return ["chat.absage.nicht-ganz"];
        if (/budget/.test(e.event)) return ["chat.absage.erschoepft"];
        if (/unknown/.test(e.event)) return ["chat.absage.unbekannt"];
        if (grund) return ["ergebnis.punkt", { s: grund }];
        if (/invalid/.test(e.event)) return ["chat.absage.passt-nicht"];
        return ["chat.absage.zerbrochen"];
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
                this._chatBefehlLauf(p, p.run(m, appendChatOutput));
            } catch (err) {
                appendChatOutput(["chat.fehler.system", { fehler: err.message || err }]);
            }
            return;
        }
        this._chatHandleConversationalFallback(command, appendChatOutput);
    }

    // Ein System-Befehl darf asynchron laufen (die Gewähr wartet auf grantCapability): sein Promise bricht nie still — das
    // try/catch der Rufer fängt nur den synchronen Teil, der Rest meldet sich hier beim Namen des Befehls.
    _chatBefehlLauf(p, lauf) {
        if (lauf && typeof lauf.catch === "function")
            lauf.catch((err) =>
                this._bruchMelden(`CHAT-BEFEHL: „${p.example}" brach (${(err && err.message) || err})`)
            );
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
                // N5.7 (W-A5b) — der deliberate Siedlungs-Akt: „dorf" / „dorf 7" / „dorf 7 24" — und sein Jahr (siedlung.K4):
                // „dorf 7 300 jahr 1560" oder die Epoche beim Namen („dorf 7 300 hanse"); die Zahl ist die Größe der Gegenwart.
                // Async (Worker-Roundtrip) — spawnSettlement meldet ins Log, hier sofortiges Echo.
                example: "dorf [seed] [häuser] [jahr 1560]",
                re: /^dorf(?:\s+(\d+))?(?:\s+(\d+))?(?:\s+(?:jahr\s+(\d{1,4})|([a-zäöü]+)))?$/i,
                run: (m, append) => {
                    const opts = { verlangt: "human" };
                    if (m[1] !== undefined) opts.seed = Number(m[1]);
                    if (m[2] !== undefined) opts.nH = Number(m[2]);
                    if (m[3] !== undefined) opts.jahr = Number(m[3]);
                    const EP = globalThis.__fachwerkCore && globalThis.__fachwerkCore.EPOCHEN;
                    if (m[4] !== undefined && !(EP && Object.hasOwn(EP, m[4].toLowerCase()))) {
                        append(
                            EP
                                ? this._t("chat.befehl.dorf.keine-epoche", {
                                      epoche: m[4],
                                      epochen: Object.keys(EP).join(", "),
                                  })
                                : this._t("chat.befehl.dorf.keine-epoche-kern", { epoche: m[4] })
                        );
                        return;
                    }
                    if (m[4] !== undefined) opts.epoche = m[4].toLowerCase();
                    this.spawnSettlement(opts);
                    append(this._t("chat.befehl.dorf.gruendung"));
                },
            },
            {
                example: "lerne fähigkeit <name> <beschreibung>",
                re: /^lerne\s+fähigkeit(?:\s+(\S+))?(?:\s+(.+))?$/i,
                run: (m, append) => {
                    const abilityName = m[1] ? m[1].toLowerCase() : undefined;
                    const abilityDesc = (m[2] || "").trim();
                    this.learnAbility(abilityName, abilityDesc);
                    append(
                        this._t("chat.befehl.faehigkeit.gelernt", {
                            name: String(abilityName),
                            beschreibung: abilityDesc,
                        })
                    );
                },
            },
            {
                example: "führe fähigkeit aus <name>",
                re: /^führe\s+fähigkeit\s+aus(?:\s+(\S+))?$/i,
                run: (m, append) => {
                    const abilityName = m[1] ? m[1].toLowerCase() : undefined;
                    if (this.state.abilities[abilityName]) {
                        this.state.abilities[abilityName](this, this.state);
                        append(this._t("chat.befehl.faehigkeit.ausgefuehrt", { name: String(abilityName) }));
                    } else {
                        append(this._t("chat.befehl.faehigkeit.nicht-gefunden", { name: String(abilityName) }));
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
                    if (res.ok) append(this._t("chat.befehl.wohnen.hier"));
                    else if (res.reason === "not_in_portal") append(this._t("chat.befehl.wohnen.heimat"));
                    else append(this._t("chat.befehl.wohnen.nicht-bibliothek"));
                },
            },
            {
                // R6 (V18.152) — die souveräne GEWÄHR einer gereichten Fähigkeit.
                example: "gewähre <fähigkeit>",
                re: /^gew(?:ä|ae)hre\s+([a-z0-9_-]{1,32})\s*$/i,
                // Die Gewähr ist asynchron (grantCapability gibt ein Promise): der Dispatch meldet ein Brechen über `.catch`.
                run: async (m, append) => {
                    const res = await this.grantCapability(m[1]);
                    if (res.ok) append(this._t("chat.befehl.faehigkeit.gewaehrt", { name: m[1].toLowerCase() }));
                    else if (res.reason === "no_proposal") append(this._t("chat.befehl.faehigkeit.nicht-gereicht"));
                    else if (res.reason === "revoked") append(this._t("chat.befehl.faehigkeit.revoziert"));
                    else append(this._t("chat.befehl.faehigkeit.gewaehr-aus"));
                },
            },
            {
                // R6 (V18.152) — eine gewährte Fähigkeit WIRKEN (dslRun-Sandbox).
                example: "wirke <fähigkeit>",
                re: /^wirke\s+([a-z0-9_-]{1,32})\s*$/i,
                run: (m, append) => {
                    const res = this.runCapability(m[1]);
                    if (res.ok) append(this._t("chat.befehl.faehigkeit.gewirkt", { name: m[1].toLowerCase() }));
                    else if (res.reason === "unknown") append(this._t("chat.befehl.faehigkeit.nicht-gewaehrt"));
                    else if (res.reason === "revoked") append(this._t("chat.befehl.faehigkeit.ruht"));
                    else append(this._t("chat.befehl.faehigkeit.nicht-wirkbar"));
                },
            },
            {
                // W18-D — „ziehe heim": das Wohnen endet.
                example: "ziehe heim",
                re: /^ziehe\s+heim(?:\s.*)?$/i,
                run: (m, append) => {
                    const res = this.endDwelling();
                    append(res.was ? this._t("chat.befehl.heim.gezogen") : this._t("chat.befehl.heim.schon-daheim"));
                },
            },
            {
                example: "speichere zustand",
                re: /^speichere\s+zustand(?:\s.*)?$/i,
                run: (m, append) => {
                    // Verweigert die Sperre des Welt-Wechsels, sagt der Befehl es — nie „gespeichert", wenn nichts geschrieben wurde.
                    if (this.saveState() === false) {
                        append(this._t("chat.befehl.zustand.nicht-gespeichert"));
                        return;
                    }
                    this.saveToProjectFolder().then((result) => {
                        if (result === "server") {
                            append(this._t("chat.befehl.zustand.gespeichert-ordner"));
                        } else if (result === "download") {
                            append(this._t("chat.befehl.zustand.gespeichert-download"));
                        } else {
                            append(this._t("chat.befehl.zustand.gespeichert-lokal"));
                        }
                    });
                },
            },
            {
                example: "lade zustand",
                re: /^lade\s+zustand(?:\s.*)?$/i,
                run: (m, append) => {
                    this.loadState();
                    append(this._t("chat.befehl.zustand.geladen"));
                },
            },
            {
                example: "lade datei",
                re: /^lade\s+datei(?:\s.*)?$/i,
                run: (m, append) => {
                    this.openStateFilePicker();
                    append(this._t("chat.befehl.zustand.datei-picker"));
                },
            },
            {
                example: "spawne neue welt",
                re: /^spawne\s+neue\s+welt(?:\s.*)?$/i,
                run: (m, append) => {
                    this.generateNewWorld();
                    append(this._t("chat.befehl.welt.generiert"));
                },
            },
            {
                example: "erschaffe welt <slug> [saat <saat>] [mit person]",
                re: /^(?:erschaffe|neue)\s+welt(?:\s+(.+))?$/i,
                run: (m, append) => {
                    // Ring 8: neue eigenständige Welt mit eigener worldId. Optional
                    // „mit person" am Ende → bisherige Spieler-Identität übernehmen.
                    // DIE SAAT DES SCHÖPFERS (saat-im-lauf): „saat <Saat>“ nennt die Saat, aus der die neue Welt wächst (ihr Wortlaut
                    // bleibt, wie er geschrieben ist) — dieselbe Saat, dieselbe Welt; ohne sie würfelt die Geburt.
                    const roh = (m[1] || "").trim();
                    const saatM = /(?:^|\s)saat\s+(\S+)/i.exec(roh);
                    const rest = roh
                        .replace(/(?:^|\s)saat\s+\S+/i, " ")
                        .toLowerCase()
                        .trim();
                    const inherit = /(?:^| )mit person$/i.test(rest) || /(?:^| )mit übernahme$/i.test(rest);
                    const slug = rest
                        .replace(/(?:^| )mit person$/i, "")
                        .replace(/(?:^| )mit übernahme$/i, "")
                        .trim();
                    const newId = this.createNewWorld({
                        slug: slug || null,
                        inheritPlayer: inherit,
                        reload: true,
                        saat: saatM ? saatM[1] : null,
                    });
                    if (newId) {
                        append(
                            inherit
                                ? this._t("chat.befehl.welt.erschaffen-mit-person")
                                : this._t("chat.befehl.welt.erschaffen-neue-person")
                        );
                    } else {
                        append(this._t("chat.befehl.welt.nicht-erschaffen"));
                    }
                },
            },
            {
                example: "wechsle zu <welt>",
                re: /^wechsle\s+zur?\s+(?:welt\s+)?(.+)$/i,
                run: (m, append) => {
                    // Ring 8: Wechsel zu einer existierenden Welt via slug (genauer
                    // Match oder Präfix), dann der Wechsel.
                    const targetSlug = m[1].toLowerCase().trim();
                    const idx = this.worldsIndexLoad();
                    const exact = idx.find((e) => e.slug === targetSlug);
                    const prefix = exact || idx.find((e) => e.slug && e.slug.startsWith(targetSlug));
                    if (!prefix) {
                        append(this._t("chat.befehl.welt.nicht-gefunden-liste", { slug: targetSlug }));
                    } else {
                        const ok = this.switchToWorld(prefix.worldId, { reload: true });
                        if (ok) append(this._t("chat.befehl.welt.wechsle", { slug: prefix.slug }));
                        else append(this._t("chat.befehl.welt.wechsel-verweigert"));
                    }
                },
            },
            {
                // DER ORT DER WELT (Reise): „reise“ ohne Ziel sagt, wo diese Welt auf ihrem Planeten liegt — eine Reise-Welt aus
                // dem Teil `ort` ihres Gesetzes (Lage und Zeit, ohne Rechnung), die Heimat aus dem Anker (`_planetAnker`, im
                // Planet-Faden, geboren mit diesem Satz). Trägt der Planet des Samens keinen Anker (oder fiel der Faden), hört der
                // Spieler den Grund, und der Bruch geht beim Namen ins Log (`_chatBefehlLauf`).
                example: "reise",
                re: /^reise$/i,
                run: (m, append) => {
                    const teil = this._gelaende().ort.teil;
                    if (teil) {
                        append([
                            "chat.befehl.reise.hier-ort",
                            this._reiseWorte(teil.breite, teil.laenge, teil.zeitMa, teil),
                        ]);
                        return null;
                    }
                    return this._planetAnker().then(
                        (a) => {
                            const grad = (rad) => (rad * 180) / Math.PI;
                            const w = this._reiseWorte(grad(a.breite), grad(a.laenge), 0, a);
                            append([
                                "chat.befehl.reise.ort",
                                Object.assign(w, { kueste: this._reiseZahl(a.kuesteKm, 0) }),
                            ]);
                        },
                        (e) => {
                            append(["chat.befehl.reise.ohne-ort", { grund: String((e && e.message) || e) }]);
                            throw e;
                        }
                    );
                },
            },
            {
                // HEIM (Reise): aus einer Reise-Welt in die Welt ihres Heimtors (`worldMeta.heimTor`, die Heimat des Planeten) —
                // derselbe Wechsel wie „wechsle zu“ (`switchToWorld`); in der Heimat sagt der Satz, dass sie es ist. Steht VOR
                // dem Ziel-Satz und vor der Ähnlichkeit der Konsole (Gegner Spiel F4: „reise heim“ schlug „ziehe heim“ vor).
                example: "reise heim",
                re: /^reise\s+(?:heim|nach\s+hause|zurück)$/i,
                run: (m, append) => {
                    const wm = this.state.worldMeta || {};
                    const ht = wm.heimTor;
                    if (!this._gelaende().ort.teil || !ht || typeof ht.weltId !== "string") {
                        append(["chat.befehl.reise.daheim"]);
                        return;
                    }
                    if (!localStorage.getItem(this.worldStorageKey(ht.weltId))) {
                        append(["chat.befehl.reise.heim-fehlt", { welt: ht.weltId.slice(0, 8) }]);
                        return;
                    }
                    append(["chat.befehl.reise.heim", { welt: String(ht.label || ht.weltId.slice(0, 8)) }]);
                    if (!this.switchToWorld(ht.weltId, { reload: true }))
                        append(["chat.befehl.welt.wechsel-verweigert"]);
                },
            },
            {
                // DIE REISE (Reise, Schnitt 3): „reise <Breite> <Länge> [<Zeit in Ma>]“ — Grad (Süden und Westen negativ, oder
                // mit N/S/O/E/W), die Zeit in ganzen Millionen Jahren (−4 000 bis +1 000, ohne sie heute). Der Planet-Faden rechnet
                // den Ort zur Zeit (`planet-ort`: EIN Auftrag, die Zeit ist sein Parameter), liegt dort Meer, sagt es der Satz und
                // gebiert nichts; sonst führt die EINE Tür in die Welt des Orts (`_reiseBetreten`). An der Lage des Ankers (heute)
                // gibt es nur die Heimat. Ein System-Akt der Konsole, nie eine Op der DSL (die KI trägt den Spieler nicht fort).
                example: "reise <Breite> <Länge> [<Zeit in Ma>]",
                re: /^reise\s+(-?\d{1,3}(?:[.,]\d+)?)\s*°?\s*([NS])?\s+(-?\d{1,3}(?:[.,]\d+)?)\s*°?\s*([OEW])?(?:\s+(-?\d{1,4}))?$/i,
                run: (m, append) => {
                    const zahl = (s) => Number(String(s).replace(",", "."));
                    const breite = Math.round(zahl(m[1]) * (/s/i.test(m[2] || "") ? -1 : 1) * 100) / 100;
                    const laenge = Math.round(zahl(m[3]) * (/w/i.test(m[4] || "") ? -1 : 1) * 100) / 100;
                    const zeitMa = m[5] ? Number(m[5]) : 0;
                    if (!(Math.abs(breite) <= 90 && Math.abs(laenge) <= 180 && zeitMa >= -4000 && zeitMa <= 1000)) {
                        append(["chat.befehl.reise.form"]);
                        return null;
                    }
                    const samen = this._planetSamen();
                    return Promise.all([
                        this._planetAnker(),
                        this._fadenQuelle().then(() =>
                            this._planetAuftrag({ type: "planet-ort", samen, breite, laenge, zeitMa })
                        ),
                    ]).then(
                        ([a, o]) => {
                            const w = this._reiseWorte(breite, laenge, zeitMa, o);
                            const zwei = (rad) => Math.round((rad * 180 * 100) / Math.PI) / 100;
                            if (zeitMa === 0 && zwei(a.breite) === breite && zwei(a.laenge) === laenge) {
                                const wm = this.state.worldMeta || {};
                                if (!this._gelaende().ort.teil) append(["chat.befehl.reise.daheim"]);
                                else if (wm.heimTor && this.switchToWorld(wm.heimTor.weltId, { reload: true }))
                                    append(["chat.befehl.reise.heim", { welt: String(wm.heimTor.label || "") }]);
                                return;
                            }
                            if (!o.land) {
                                append([
                                    "chat.befehl.reise.meer",
                                    Object.assign(w, { kueste: this._reiseZahl(-o.kuesteKm, 0) }),
                                ]);
                                return;
                            }
                            const r = this._reiseBetreten(o);
                            if (!r.ok) {
                                append(["chat.befehl.reise.nicht", { grund: String(r.reason) }]);
                                return;
                            }
                            const O = globalThis.__gelaendeCore.ortGesetz(r.ort);
                            append([
                                "chat.befehl.reise.ziel",
                                Object.assign(w, {
                                    sommer: this._reiseZahl(O.klimaHeute.sommer, 1),
                                    winter: this._reiseZahl(O.klimaHeute.winter, 1),
                                    schnee: this._reiseZahl(globalThis.__gelaendeCore.SCHNEE.start + O.schneeBandM, 0),
                                    meer: this._reiseZahl(-O.meerUnterBasisM, 1),
                                }),
                            ]);
                        },
                        (e) => {
                            append(["chat.befehl.reise.ohne-ort", { grund: String((e && e.message) || e) }]);
                            throw e;
                        }
                    );
                },
            },
            {
                // jede andere Form der Reise antwortet mit der Form — nie mit einem fremden Satz der Ähnlichkeit
                example: "reise …",
                re: /^reise\s+.+$/i,
                run: (m, append) => append(["chat.befehl.reise.form"]),
            },
            {
                example: "lösche welt <slug>",
                re: /^lösche\s+welt\s+(.+)$/i,
                run: (m, append) => {
                    const targetSlug = m[1].toLowerCase().trim();
                    const idx = this.worldsIndexLoad();
                    const entry = idx.find((e) => e.slug === targetSlug);
                    if (!entry) {
                        append(this._t("chat.befehl.welt.nicht-gefunden", { slug: targetSlug }));
                    } else if (entry.worldId === this.state.worldMeta.worldId) {
                        append(this._t("chat.befehl.welt.aktiv-nicht-loeschbar"));
                    } else {
                        this.deleteWorld(entry.worldId);
                        append(this._t("chat.befehl.welt.geloescht", { slug: entry.slug }));
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
                        append(this._t("chat.befehl.welten.nur-eine"));
                    } else {
                        const lines = idx
                            .slice()
                            .sort((a, b) => (b.lastPlayed || 0) - (a.lastPlayed || 0))
                            .map((e) => {
                                const ageDays = e.bornAt ? Math.floor((Date.now() - e.bornAt) / 86400000) : 0;
                                const isActive = e.worldId === this.state.worldMeta.worldId;
                                const werte = { slug: String(e.slug), tage: ageDays, id: e.worldId.slice(0, 8) };
                                return isActive
                                    ? this._t("chat.befehl.welten.zeile-aktiv", werte)
                                    : this._t("chat.befehl.welten.zeile", werte);
                            });
                        append(this._t("chat.befehl.welten.kopf", { n: idx.length }));
                        for (const l of lines) append(l);
                    }
                },
            },
            {
                example: "behebe physik-tunneling",
                re: /^behebe\s+physik-tunneling(?:\s.*)?$/i,
                run: (m, append) => {
                    this.optimizeCollisions();
                    append(this._t("chat.befehl.physik.tunneling"));
                },
            },
            {
                example: "optimiere physik",
                re: /^optimiere\s+physik(?:\s.*)?$/i,
                run: (m, append) => {
                    this.optimizePhysics();
                    append(this._t("chat.befehl.physik.optimiert"));
                },
            },
            {
                example: "aktiviere version <v>",
                re: /^aktiviere\s+version(?:\s+(\S+))?$/i,
                run: (m, append) => {
                    const version = m[1] ? m[1].toLowerCase() : undefined;
                    if (this.state.versionHistory.includes(version)) {
                        this.loadVersion(version);
                        append(this._t("chat.befehl.version.aktiviert", { version: String(version) }));
                    } else {
                        append(this._t("chat.befehl.version.nicht-gefunden", { version: String(version) }));
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
                        append(this._t("chat.befehl.klang.heimat"));
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
                            this._t("chat.befehl.klang.fuehrt", {
                                genre: (rec && rec.lab) || wahl,
                                bpm: String(kx.bpm),
                                skala,
                                harmonie: kx.harmony || "?",
                                rhythmus: kx.rhythm || "?",
                            })
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
                                ? this._t("chat.befehl.klang.kein-genre", { wahl, genres })
                                : this._t("chat.befehl.klang.buch-kalt")
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
                        append(this._t("chat.befehl.praege.kein-rezept", { gattung }));
                        return;
                    }
                    const achse = AnazhRealm.KIND_CHARAKTER[rec.kind];
                    if (!achse) {
                        append(
                            this._t("chat.befehl.praege.keine-achse", {
                                rezept: rec.lab || preset,
                                art: String(rec.kind),
                            })
                        );
                        return;
                    }
                    const kern = typeof globalThis !== "undefined" ? globalThis[achse.ns] : null;
                    const tabelle = kern ? kern[achse.tabelle] : null;
                    const zeileName = tabelle ? Object.keys(tabelle).find((k) => k.toLowerCase() === charakter) : null;
                    if (!zeileName) {
                        append(
                            tabelle
                                ? this._t("chat.befehl.praege.zeilen", {
                                      achse: achse.wort,
                                      zeilen: Object.keys(tabelle).join(" · "),
                                  })
                                : this._t("chat.befehl.praege.buch-fehlt", { achse: achse.wort })
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
                    append(
                        this._t("chat.befehl.praege.gepraegt", {
                            rezept: rec.lab || preset,
                            achse: achse.wort,
                            zeile: zeileName,
                        })
                    );
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
                        klang ? this._t("chat.befehl.symphonie.aktiviert") : this._t("chat.befehl.symphonie.ohne-klang")
                    );
                },
            },
            {
                example: "aktiviere debug-logs",
                re: /^aktiviere\s+debug-logs(?:\s.*)?$/i,
                run: (m, append) => {
                    this.state.debugLogging = true;
                    append(this._t("chat.befehl.debug.an"));
                },
            },
            {
                example: "deaktiviere debug-logs",
                re: /^deaktiviere\s+debug-logs(?:\s.*)?$/i,
                run: (m, append) => {
                    this.state.debugLogging = false;
                    append(this._t("chat.befehl.debug.aus"));
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
        return kennt ? ["studio.absage.wort", { wort: m[2], kennt }] : ["studio.absage.buch", { wort: m[2] }];
    }

    // Conversational-Fallback: Kreatur-Konversation (Welle 6.H Phase 2E V1),
    // LLM-Fallback (Schicht 2 — Claude/Gemini/OpenRouter), P2P-Voice-Pool
    // (W7 Phase 3), sonst Studio-Satz-Absage, chatSuggest + Hilfetext.
    _chatHandleConversationalFallback(command, appendChatOutput) {
        if (this._parseCreatureAddress && this._parseCreatureAddress(command)) {
            // „Name, text" oder „Name: text" geht an die Kreatur (nicht an Grok).
            this.maybeAnswerCreature(command, appendChatOutput).catch((err) => {
                this._bruchMelden("Kreatur-Antwort: " + (err.message || err));
                appendChatOutput(["chat.fehler.kreatur", { fehler: err.message || err }]);
            });
            return;
        }
        if (this.state.llm && this.state.llm.enabled) {
            // Schicht 2 — LLM-Fallback. Statt „Unbekannter Befehl" geht der Text
            // an Claude; Antwort kommt narrativ + optional als DSL-Programm.
            this.maybeAnswerWithLlm(command, appendChatOutput).catch((err) => {
                const compName = (this.state.grok && this.state.grok.companionName) || "Grok";
                appendChatOutput(["chat.fehler.begleiter", { name: compName, fehler: err.message || err }]);
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
        // die Frage nach dem Wetter beantwortet die Welt selbst: das Wetter und wer es schrieb (affekt.K4#2)
        const warum = this._wetterWarum(command);
        if (warum) {
            appendChatOutput(warum);
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
                        this._chatBefehlLauf(p, p.run(m, appendChatOutput));
                    } catch (err) {
                        appendChatOutput(["chat.fehler.befehl", { fehler: String(err && err.message) }]);
                    }
                    return;
                }
            }
            // Ein Studio-Satz mit unbekanntem Wort hört den Katalog UND den Vorschlag (Gegenprüfung 08.10.: die Absage nahm
            // jeder Zeile „Verb + Wort" ohne KI den Vorschlag, „mach licht" hörte nur den Katalog).
            appendChatOutput(
                studioAbsage
                    ? ["chat.vorschlag.oder", { absage: studioAbsage, vorschlag: suggestion }]
                    : ["chat.vorschlag.unbekannt", { vorschlag: suggestion }]
            );
        } else if (studioAbsage) {
            appendChatOutput(studioAbsage);
        } else {
            // Keine zweite Liste: die Hilfe liest die EINEN Tafeln (`_hilfeZeilen`), hier steht nur der Weg dorthin.
            appendChatOutput(["chat.unbekannt"]);
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
        // der Name einer Aktion: die eingebaute liest ihre Zeile der Tafel; eine DSL-Fähigkeit, die der Spieler aufs Pad band,
        // trägt den Namen, den er ihr gab (Spieler-Inhalt bleibt, wie er geschrieben wurde)
        const name = (a) => (AnazhRealm.KEYBINDING_LABELS[a] ? this._t(AnazhRealm.KEYBINDING_LABELS[a]) : a);
        const tasten = AnazhRealm.KEYBINDING_ACTIONS.map(
            (a) => `${fmt(kb[a] || AnazhRealm.DEFAULT_KEYBINDINGS[a])} ${name(a)}`
        );
        // je Zeile eine Zeile der Tafel (spielgang.K5#2): die Sätze der Welt sind Daten (die DSL spricht Deutsch), der Rahmen die
        // Sprache des Spielers
        const pad = Object.entries(this.state.padBelegung || AnazhRealm.PAD_BELEGUNG).map(
            ([a, c]) => `${fmt(c)} ${name(a)}`
        );
        return [
            ["hilfe.zeile.sprich", { taste: fmt(kb.chat || AnazhRealm.DEFAULT_KEYBINDINGS.chat) }],
            ["hilfe.zeile.probier", { liste: probier.map(q).join(" · ") }],
            ["hilfe.zeile.versteht", { liste: dsl.map((p) => q(p.example)).join(" · ") }],
            ["hilfe.zeile.system", { liste: this.chatSystemPatterns.map((p) => q(p.example)).join(" · ") }],
            ["hilfe.zeile.tasten", { liste: tasten.join(" · ") }],
            ["hilfe.zeile.fahren", { liste: this._fahrTastenZeile() }],
            ["hilfe.zeile.gamepad", { liste: pad.join(" · ") }],
        ];
    }

    // Die Fahr-Tasten als EINE Zeile (die Tafel AnazhRealm.FAHR_TASTEN, die die Eingabe liest): je Verb die Taste seiner Aktion
    // aus der Belegung (`state.keybindings`) — die Hilfe und der Tacho.
    _fahrTastenZeile() {
        const kb = this.state.keybindings || AnazhRealm.DEFAULT_KEYBINDINGS;
        const taste = (a) => this._formatBindingCode(kb[a]);
        return Object.values(AnazhRealm.FAHR_TASTEN)
            .map((t) => `${t.aktionen ? t.aktionen.map(taste).join(" · ") : taste(t.aktion)} ${t.label}`)
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
            timestamp: this.state.spielZeit,
        });
    }
    proactiveSuggestions() {
        const suggestions = [
            ["chat.ki-vorschlag.faehigkeit"],
            ["chat.ki-vorschlag.physik"],
            ["chat.ki-vorschlag.sternenhimmel"],
            ["chat.ki-vorschlag.kreaturen"],
            ["chat.ki-vorschlag.terrain"],
            ["chat.ki-vorschlag.welt"],
            ["chat.ki-vorschlag.steuerung"],
        ];
        const randomSuggestion = suggestions[Math.floor(Math.random() * suggestions.length)];
        this._chatEcho(["chat.ki-vorschlag", { vorschlag: randomSuggestion }]);
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
        this.state.gravity = AnazhRealm.WELT_GESETZ_ERDE.schwere; // das Wort schreibt das Gesetz der Welt (ultiversum.K1)
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
        const seed = AnazhRealm._saatJe(this);
        // die Ströme je Welt (`state.worldField`; ein anderer Samen baut sie neu) und die Formel sind Kern: gelaende-core
        // `weltFeldRausch` · `weltFeld` — dieselbe Quelle liest jeder Faden (voxel-worker `worldFieldAt`, das Feld des Gaus)
        const G = globalThis.__gelaendeCore;
        if (!this.state.worldField || this.state.worldField.seed !== seed)
            this.state.worldField = G.weltFeldRausch(SimplexNoise, seed);
        return G.weltFeld(this.state.worldField, this._genVersion(), x, z);
    }

    // === Das lebendige Feld — die LESE-Seite (docs/das-lebendige-feld.md) ===
    // auraAt(x, z, t) ist die EINE Lese-Schnittstelle: das worldgen-eingefrorene Substrat (worldFieldAt) +
    // die dynamische Achse `emotion` + die Zeit `t`. Wer eine „lebendige Welt"-Wirkung baut, LIEST hier
    // (kein eigener _tickX). `emotion` ist eine Live-Referenz — nicht mutieren. `uhr` (s der Welt-Uhr): der Augenblick, zu dem
    // das Feld gelesen wird (der Takt des Bestands auf seinem Raster) — ohne ihn jetzt; die Welt-Uhr selbst biegt kein Leser.
    auraAt(x, z, t = 0, uhr) {
        const jetzt = uhr === undefined;
        if (jetzt) uhr = this.state.spielZeit;
        const f = this.worldFieldAt(x, z);
        const e = (this.state.player && this.state.player.emotions) || {};
        // SCHREIB-Seite: das Leben-Overlay HEBT lebendig über dem frozen Substrat, der Fraß senkt es (geklemmt auf 0..1, nie
        // überschreiben); leerer Overlay → lebendig == frozen. at_field_need + FIELD_TO_EMOTION lesen es mit.
        const overlay = this._lifeOverlayAt(x, z, uhr);
        // DIE NARBE DER TAT (feld.K4) senkt es am Ort der Tat, bis sie heilt (`_narbeAt`) — leer → lebendig == frozen + overlay.
        const narbe = this._narbeAt(x, z, uhr);
        // DER FRASS DES GAUS (Leben C2b, E3): was die Herde des Gesetzes ließ, steht als Schicht im Zustand des Gaus — das nahe
        // Feld LIEST sie am Ort (`_gauFrassAt`: die Zelle des Reviers aus dem letzten Bild, ≤ 0 abgeäst, 0 ohne Bild), nie schreibt
        // der Stamm sie ins Overlay. Ein Leser mit Stempel (`uhr`: der Takt des Bestands, der Brand) liest sie an SEINEM Takt aus der
        // Spur des Fadens (`_gauFrassAm` — das Bild trägt die Zeit der Seite, der Takt die des Felds: Mehrspieler-Gleichlauf).
        const gau = jetzt ? this._gauFrassAt(x, z) : this._gauFrassAm(x, z, uhr);
        // V17.32 — die emotion-Achse ist RÄUMLICH: der lokale emotionale Abdruck
        // (das Gedächtnis des Ortes) blendet ÜBER die globale Stimmung. Leerer
        // Abdruck → emotion == globale Stimmung (backward-compatible, kein Alloc).
        const imp = this._emotionOverlayAt(x, z, uhr);
        // DER BRAND (feld.K3#2) glüht in der glut seiner Zelle, solange sie brennt
        const bf = this.state.brandFeld;
        const brand = bf && bf.size ? bf.get(this._lifeCellKey(x, z)) : null;
        // DIE LAVA (stoffe.K3-2) glüht in der glut ihrer Zelle, bis sie erkaltet (`_lavaAt`)
        const lava = this._lavaAt(x, z, uhr);
        let emotion = e;
        if (imp) {
            emotion = {};
            for (const axis of AnazhRealm.EMOTION_AXES) {
                emotion[axis] = Math.min(1, (e[axis] || 0) + (imp[axis] || 0));
            }
        }
        return {
            lebendig:
                overlay || narbe > 0 || gau ? Math.max(0, Math.min(1, f.lebendig + overlay + gau - narbe)) : f.lebendig,
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
    // bei 573 lebenden). DIE EIMER LIEGEN IN EINER HALDE (`karte.todHalde`, binärer Min-Heap der Eimer-Nummern): oben der
    // früheste Tod, die Räumung nimmt nur die fälligen Eimer, ein neuer Eimer kostet log(Eimer). Bis w3u-nachfolge ging jede
    // fällige Räumung JEDEN Eimer des Rads durch, um den nächsten zu finden: ein Tod in der Ruhe (10 Zellen) kostete 46
    // Eimer-Schritte (gate:stand-takt RUHE-TAT, CI 0192f468 und f653389d: 57 Einheiten für 10 geschriebene).
    _feldTod(karte, key, zelle, tod, jetzt) {
        const E = AnazhRealm.FELD_TOD_EIMER_S;
        const rad = karte.tod || (karte.tod = new Map());
        const H = karte.todHalde || (karte.todHalde = []);
        const b = Math.floor(tod / E);
        if (zelle.tod !== b) {
            if (rad.has(zelle.tod)) rad.get(zelle.tod).delete(key); // neu beschrieben: der alte Eimer kennt sie nicht mehr
            if (rad.has(b)) rad.get(b).add(key);
            else {
                rad.set(b, new Set([key]));
                let i = H.push(b) - 1;
                for (let p; i > 0 && H[(p = (i - 1) >> 1)] > b; i = p) H[i] = H[p];
                H[i] = b;
            }
            zelle.tod = b;
        }
        const faellig = Math.floor(jetzt / E);
        while (H.length && H[0] < faellig) {
            const e = H[0];
            const letzt = H.pop();
            let i = 0;
            for (let c = 1; c < H.length; i = c, c = 2 * i + 1) {
                if (c + 1 < H.length && H[c + 1] < H[c]) c++;
                if (H[c] >= letzt) break;
                H[i] = H[c];
            }
            if (H.length) H[i] = letzt;
            const keys = rad.get(e);
            rad.delete(e);
            if (keys) for (const k of keys) if ((karte.get(k) || AnazhRealm.FELD_LEER).tod === e) karte.delete(k);
        }
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
    _lifeOverlayAt(x, z, uhr = this.state.spielZeit) {
        const lf = this.state.lifeField;
        if (!lf || lf.size === 0) return 0;
        const e = lf.get(this._lifeCellKey(x, z));
        if (!e) return 0;
        const dt = Math.max(0, uhr - e.t);
        const a = dt === 0 ? e.a : e.a * Math.exp(-AnazhRealm.LIFE_FIELD.decayPerSec * dt);
        return Math.abs(a) < AnazhRealm.LIFE_FIELD.epsilon ? 0 : a;
    }

    // Leben deponieren: ein 3×3-Kernel um (x,z), jede Zelle decay-then-add,
    // geklemmt auf [LIFE_FIELD.kahl, LIFE_FIELD.max] (Sättigung → der Nexus zieht weiter). Die EINE
    // Schreib-API — wer Leben in die Welt trägt (Geburt, Pflege, Kreatur-Trickle) und wer es frisst (der Fraß
    // des Bestands, negativ; Ökologie K1) ruft sie. Der Decay führt beides zum Substrat zurück → nie Überschreiben.
    _depositLife(x, z, amount = AnazhRealm.LIFE_FIELD.pulseCenter, uhr = this.state.spielZeit) {
        if (!amount || !Number.isFinite(amount)) return;
        this._lebenGen = (this._lebenGen || 0) + 1; // die Marke des Lebens im Stand (`_lebenImStand`)
        if (!this.state.lifeField) this.state.lifeField = new Map();
        const lf = this.state.lifeField;
        const cfg = AnazhRealm.LIFE_FIELD;
        const now = uhr;
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
                // der Ort sieht den Akt (feld.K5): die Zelle wird JETZT fällig — der Wecker der Stufen (`_tickLebenStufen`) malt
                // sie im nächsten Takt, nur wo ihre Stufe springt; die Tat trägt nur ihre Zelle (gate:stand-takt RUHE-TAT, FELD-BESUCH)
                AnazhRealm._lebenWecken(this, key, now);
            }
        }
    }

    // DIE TAT-UHR (feld.K2#2, Lockstep: Zufall und Takt nur aus Saat, Welt-Uhr und Eingaben). Das Feld schreiben das Gesetz des
    // Bestands (Fraß und Tod im Takt der Welt-Uhr, `_feldTakt` — jede Seite rechnet es selbst) und die EINGABEN: was eine Seite
    // schreibt, die ein Mitspieler nicht selbst rechnet — der Nexus und seine Gesetze, das Gemüt, die eigenen Wesen (die Gabe
    // ihrer Geburt, ihr Träufeln, die Annahme eines Leibs in den Bestand, sein Fall außerhalb des Gesetzes), der Tod des Spielers
    // — und der Akt des Spielers, dessen Programm reist (die Pflege im Gespräch). Jede Eingabe ist ein FELD-AKT mit dem Stempel der
    // Welt-Uhr `w` in der EINEN Reihe der Akte (`feldAkte`, nach Stempel und Inhalt), und sie wirkt auf jeder Seite zur selben
    // Welt-Zeit in derselben Folge mit den Takten des Bestands (`_feldTakt`); wo ihr Programm nicht reist (`reist`), reist sie
    // selbst über den dsl-Kanal (`feld`). Mit Mitspielern wirkt sie `FELD_VORLAUF_S` nach ihrem Stempel — die Frist, in der jeder
    // Akt jede Seite erreicht (der Vorlauf des Lockstep), allein sofort; ein Akt, der später kam, wirkt bei Ankunft. Bis feld.K2#2
    // schrieb jede Seite sofort an ihrer Bild-Uhr, die Pflege des Mitspielers zur Ankunft, jede Seite nahm ihre eigenen Leiber in
    // ihren Bestand, und das Leben zweier Seiten lief auseinander (gate:mp-sync (f): 15 von 1 172 Zellen gleich, nach dem Reload 0).
    _feldAkt(akt, reist, sofort = true, fremd = false) {
        const st = this.state;
        const A = st.feldAkte || (st.feldAkte = []);
        akt.k = akt.k || JSON.stringify([akt.art, akt.key, akt.id, akt.x, akt.z, akt.a]);
        let i = A.length;
        while (i > 0 && (A[i - 1].w > akt.w || (A[i - 1].w === akt.w && A[i - 1].k > akt.k))) i--;
        const gewirkt = this._feldAktGewirkt || (this._feldAktGewirkt = new Map());
        const id = akt.w + "|" + akt.k;
        // ein Akt eines Mitspielers, doppelt empfangen (nachgeholt, über zwei Wege), ist einer; die eigenen zählt die Seite selbst
        if (fremd && ((i > 0 && A[i - 1].w === akt.w && A[i - 1].k === akt.k) || gewirkt.has(id))) return false;
        this._lebenGen = (this._lebenGen || 0) + 1;
        if (reist) {
            const feld = Object.assign({}, akt);
            delete feld.k; // der Schlüssel der Reihe ist die Sache jeder Seite
            this._aktSenden({ type: "dsl", w: akt.w, feld });
        }
        if (sofort && akt.w <= this._feldHorizont() && !A.some((x) => x.w <= akt.w) && this._feldFolgeSteht(akt.w)) {
            const wirkt = this._feldAktWirkt(akt);
            return akt.art === "brand" ? wirkt : true; // das Entfachen sagt, ob die Zelle fing
        }
        A.splice(i, 0, akt);
        return true;
    }

    // DIE FOLGE STEHT BIS w (feld.K2#2, w28-mp-boden): das Feld hat EINEN Schreiber — die Folge der Takte und Akte nach Welt-Zeit
    // (`_feldTakt`). Am Eingang wirkt ein Akt nur sofort, wenn er dort an der Reihe ist: kein Takt einer nahen Region steht vor
    // seinem Stempel aus (jede trägt ihren Takt bis w: R.t + taktS ≥ w). Sonst tritt er in die Reihe, und die Folge nimmt ihn
    // hinter den Takten davor. Bis hier wirkte er sofort, gleich wo die Folge stand: holten die nahen Regionen ihre Stunde noch
    // nach (aufholJeTakt je Bild — auf einem langsamen Gerät länger als die taktS bis zur ersten Annahme), trat jedes angenommene
    // Tier VOR den Takten seiner Stunde in den Bestand und alterte, fraß und warf in ihnen mit; die Seite daneben nahm es nach
    // ihnen an. Gemessen unter Last (3 Wände auf 2 Kernen, gate:mp-sync (f)): bei B 20 Annahmen bei w 124 vor den Takten ab
    // −2990, der Zähler der Geburt zweier Regionen 190/199 und 255/207, Leben 176 von 356 Zellen gleich.
    _feldFolgeSteht(w) {
        const T = AnazhRealm._bestandGesetz().B.taktS;
        const F = this._bestandRegionen().regionen;
        for (const key of this._bestandNah()) {
            const R = F[key];
            if (!R || R.t + T < w) return false;
        }
        return true;
    }

    // DER FELD-AKT EINES MITSPIELERS (`_p2pMsgDsl`, `feld`): fremde Bytes — nur, was ein Akt sein kann, mit endlichen Zahlen; sein
    // Stempel `w` ist der des Absenders.
    _feldAktFremd(f, w, sofort = true) {
        const zahl = (v) => Number.isFinite(v);
        if (!f || typeof f !== "object" || !zahl(w)) return false;
        if (f.art === "gau") return this._gauAktFremd(f); // ein Akt eines Gaus (Leben C2b) wirkt zu seinem Takt
        if (f.art === "leben")
            return zahl(f.x) && zahl(f.z) && zahl(f.a) && Math.abs(f.a) <= 1
                ? this._feldAkt({ art: "leben", w, x: f.x, z: f.z, a: f.a }, false, sofort, true)
                : false;
        if (f.art === "brand")
            return zahl(f.x) && zahl(f.z)
                ? this._feldAkt({ art: "brand", w, x: f.x, z: f.z }, false, sofort, true)
                : false;
        const key = typeof f.key === "string" && /^-?\d+,-?\d+$/.test(f.key) ? f.key : null;
        const id = typeof f.id === "string" && f.id.length <= 96 ? f.id : null;
        if (!key || !id) return false;
        if (f.art === "aus") return this._feldAkt({ art: "aus", w, key, id }, false, sofort, true);
        const t = f.tier;
        const L = AnazhRealm._lebensraumGesetz().L.gattung;
        if (f.art !== "annahme" || !t || typeof t.soul !== "string" || !(t.g in L)) return false;
        // das Tier reist mit seinem Erbe (`a`, ein Vektor über die Achsen des Gesetzes des Lebens), seiner Umwelt-Streuung (`e`,
        // ebenso) und seiner Mutter (`m`, null = Gründer) — nie mit einer Größe: die ist Physik des Erbes über das Alter auf jeder
        // Seite (leben-erbe)
        if (!this._lebenErbeGilt(t.a) || !this._lebenErbeGilt(t.e) || ![t.alterS, t.x, t.z].every(zahl)) return false;
        if (t.m != null && !(typeof t.m === "string" && t.m.length <= 96)) return false;
        const LK = AnazhRealm._lebenKern();
        const tier = { soul: t.soul.slice(0, 48), g: t.g, a: LK.erbeVoll(t.a), e: LK.erbeVoll(t.e), m: t.m == null ? null : t.m }; // prettier-ignore
        Object.assign(tier, { alterS: t.alterS, x: t.x, z: t.z });
        tier.v = typeof t.v === "string" ? t.v.slice(0, 48) : null;
        tier.name = typeof t.name === "string" ? t.name.slice(0, 48) : undefined;
        return this._feldAkt({ art: "annahme", w, key, id, tier }, false, sofort, true);
    }

    // DAS LEBEN DER WELT IM STAND (feld.K2#2): der Bestand der NAHEN Regionen (Takt, Zähler der Geburt, die Tiere ohne ihre
    // Zeichnung), das Feld über ihnen samt dem Saum einer Zelle (je Zelle Betrag und Stempel, wie die Karte sie trägt — auch die
    // Tote, die erst die nächste Schrift räumt, `_feldTod`) und die Akte, die noch wirken oder eben wirkten — ein Reload setzt
    // denselben Zustand fort, den der Mitspieler weiterrechnet. Nur das Nahe reist: der Stand wächst nie mit dem Weg (speicher.K3);
    // eine ferne Region holt ihre Stunde nach, wenn sie wieder nah wird (`_bestandRegion`). Eine Funktion seiner Marke (`_lebenGen`,
    // die nahen Regionen): jede Schrift zählt sie. Bis feld.K2#2 reiste keins davon: nach dem Reload rechnete die Seite ihre
    // Regionen ab leer nach, ihr Feld trug 0 von 1 172 Zellen des Mitspielers. Mit dem Nahen reist die Region jedes gezeichneten
    // Tiers (`_bestandReist`): kein Leib des Stands kehrt ohne sein Tier wieder.
    // DAS ERBE AUS FREMDER HAND (Stand, Draht): ein Vektor endlicher Zahlen, je Achse des Gesetzes des Lebens eine
    // (`__lebenCore.gesetz().achsen`) — oder weniger: ein Stand von vor einer Achse (erbe-geburt: [lnM] vor [lnM, scheu]) trägt
    // die neuen nicht, sie lesen als das Art-Mittel (`__lebenCore.erbeVoll`, die benannte Wandlung). Alles andere ist kein Erbe.
    _lebenErbeGilt(a) {
        const n = AnazhRealm._lebenKern().gesetz().achsen.length;
        return Array.isArray(a) && a.length >= 1 && a.length <= n && a.every((x) => typeof x === "number" && Number.isFinite(x)); // prettier-ignore
    }
    // DIE WANDLUNG DES ALTEN STANDS (leben-erbe — benannt, deterministisch, nie still): ein Tier eines Stands von vor dem Erbe
    // trägt kein `a`, nur seine gewürfelte Größe `bs` — es wird als GRÜNDER SEINER KENNUNG gelesen (`_erbeGruender(id)`: a und e
    // aus Saat und Kennung, `m` null; ein Tier eines Geheges ebenso wie bei seinem Einsetzen, `_gehegeEinsetzen`), derselbe alte
    // Stand ergibt auf jeder Seite und in jedem Boot dasselbe Tier. SEIN ALTER ist sein Anteil am Leben: im alten Stand trat jedes
    // Tier ERWACHSEN bei alterS 0 ein und lebte die eine Spanne refS (35 min) — es steht jetzt reif plus derselbe Anteil seines
    // eigenen erwachsenen Lebens, reifeS + (alterS / refS)·(lebensdauerS − reifeS): kein altes Tier schrumpft beim Laden zum
    // Kalb, und keines stirbt im ersten Takt nur, weil seine Art kürzer lebt. Die alte Größe fällt ungelesen (sie war ein Wurf
    // der Bänder, kein Erbe). Ein Tier mit Erbe kehrt wieder, wie es reiste — ein Erbe von vor einer Achse (erbe-geburt: ohne die
    // Scheu) mit dem Art-Mittel auf ihr (`__lebenCore.erbeVoll`).
    _lebenWandeln(t) {
        const tier = Object.assign({}, t, { v: t.v == null ? null : String(t.v) });
        delete tier.bs;
        const LK = AnazhRealm._lebenKern();
        if (t.a !== undefined)
            return Object.assign(tier, { a: LK.erbeVoll(t.a), e: LK.erbeVoll(t.e), m: t.m == null ? null : t.m });
        Object.assign(tier, this._erbeGruender(t.id), { m: null });
        const [E, anteil] = [this._bestandErbe(tier), Math.min(1, Math.max(0, t.alterS) / LK.gesetz().refS)];
        tier.alterS = E.reif + anteil * (E.tod - E.reif);
        return tier;
    }
    _lebenImStand(nahe = this._bestandReist()) {
        const st = this.state;
        const seed = AnazhRealm._saatJe(this);
        const F = st.faunaBestand && st.faunaBestand.seed === seed ? st.faunaBestand.regionen : {};
        const [S, cs] = [this._bestandSeite(), AnazhRealm.LIFE_FIELD.cell];
        const bestand = {};
        const kacheln = [];
        for (const key of nahe) {
            const [ix, iz] = key.split(",").map(Number);
            kacheln.push([ix * S - cs, iz * S - cs, (ix + 1) * S + cs, (iz + 1) * S + cs]);
            const R = F[key];
            if (!R) continue;
            const tiere = R.tiere.map(({ id, soul, g, a, e, m, alterS, x, z, v, name, gehege }) => ({
                id,
                soul,
                g,
                a, // das Erbe (leben-erbe) — die Größe reist nie, sie ist Physik des Erbes über das Alter
                e, // die Umwelt-Streuung (nie vererbt, gezogen bei der Geburt)
                m, // die Mutter (null = Gründer)
                alterS,
                x,
                z,
                v,
                name,
                gehege, // der Term des Geheges (tetrapoda GEHEGE_GESETZ): das Tier kehrt als Tier seines Geheges wieder
            }));
            bestand[key] = { t: R.t, tiere }; // der Zähler der Geburt (`seq`) fiel: die Kennung ist `__lebenCore.indId`
        }
        const nah = (k) => {
            const [x, z] = k.split(",").map((n) => (Number(n) + 0.5) * cs);
            return kacheln.some(([x0, z0, x1, z1]) => x >= x0 && x <= x1 && z >= z0 && z <= z1);
        };
        const feld = [...(st.lifeField || [])].filter(([k]) => nah(k)).map(([k, e]) => [k, e.a, e.t]);
        // die Leichname (oeko.zerfall#1, `_aasTat`): je nahe Zelle ihre liegenden [Kennung, Stunde, Wuchs]
        const h = this._weltStunde();
        const aas = [...(st.aasFeld || [])]
            .filter(([k]) => nah(k))
            .map(([k, L]) => [k, L.filter((c) => c[1] + this._tatDauer({ tat: "aas", w: c[2] }) > h)])
            .filter(([, L]) => L.length);
        const akte = (st.feldAkte || []).map(({ k: _k, ...a }) =>
            a.art === "annahme" ? { ...a, tier: { ...a.tier } } : a
        );
        // die Akte, die schon wirkten (je Stempel und Inhalt): ein nachgeholter Akt (`_akteNachholen`) wirkt nach dem Reload nie zweimal
        const G = [...(this._feldAktGewirkt || [])];
        const bis = Math.max(-Infinity, ...G.map(([, w]) => w)) - 2 * AnazhRealm.AKT_NACHHOL_S;
        const stand = { feld, bestand, akte, gewirkt: G.filter(([, w]) => w >= bis).map(([k]) => k), seite: S };
        // DIE AKTE DER GAUE reisen mit (Leben C2a, `_gauImStand`): der Bestand unter dem Gesetz der Zeit und der Jagd ist die
        // Funktion von Saat, Akten und Takt — ein Stand ohne Akte trägt das Feld nicht (seine Bytes bleiben, wie sie waren)
        const gaue = this._gauImStand();
        if (gaue.length) stand.gaue = gaue;
        if (aas.length) stand.aas = aas;
        return stand;
    }
    _lebenAusStand(v) {
        const st = this.state;
        const L = AnazhRealm.LIFE_FIELD;
        const zahl = (x) => Number.isFinite(x);
        const jetzt = st.spielZeit;
        if (!v || typeof v !== "object") return; // ein Stand ohne Leben (vor feld.K2#2) lässt das Leben der Sitzung stehen
        const lf = (st.lifeField = new Map());
        [this._lebenStand, this._lebenWecker, this._annahmeOffen] = [null, null, null];
        // die offenen Annahmen und die Bilder der Gaue gehören der Sitzung (ihre Datensätze halten Leiber der alten Welt): der
        // Stand bringt nur die Akte, der Faden antwortet ihm neu — sonst band der Leser des Gaus den wiedergekehrten Begleiter
        // nie an sein Tier (sein Datensatz trug noch den Leib vor dem Laden)
        this._gauOffen = this._gauBildStand = null;
        st.feldAkte = [];
        st.faunaBestand = undefined;
        this._lebenGen = (this._lebenGen || 0) + 1;
        this._gauAusStand(v.gaue); // die Akte der Gaue (Leben C2a): die Reihen des Stands ersetzen die der Sitzung
        const gewirkt = (this._feldAktGewirkt = new Map());
        for (const k of Array.isArray(v.gewirkt) ? v.gewirkt : [])
            if (typeof k === "string" && k.length < 400) gewirkt.set(k, Number(k.split("|")[0]));
        for (const z of Array.isArray(v.feld) ? v.feld : []) {
            if (!Array.isArray(z) || typeof z[0] !== "string" || !zahl(z[1]) || !zahl(z[2]) || !(Math.abs(z[1]) <= 1))
                continue;
            const zelle = { a: z[1], t: z[2] };
            lf.set(z[0], zelle);
            // ihr Tod ins Rad, ohne zu räumen: die Karte trägt, was die des Mitspielers trägt, bis die nächste Schrift räumt
            const tod = z[2] + Math.max(0, Math.log(Math.abs(z[1]) / L.epsilon)) / L.decayPerSec;
            this._feldTod(lf, z[0], zelle, tod, -Infinity);
            AnazhRealm._lebenWecken(this, z[0], jetzt);
        }
        // die Leichname des Stands (oeko.zerfall#1): je Zelle ihre liegenden [Kennung, Stunde, Wuchs]; die Frist rechnet der
        // nächste Tod neu (`_aasTat`)
        const aas = (st.aasFeld = new Map());
        this._aasFrist = null;
        for (const z of Array.isArray(v.aas) ? v.aas : []) {
            if (!Array.isArray(z) || typeof z[0] !== "string" || !Array.isArray(z[1])) continue;
            const L = z[1].filter((c) => Array.isArray(c) && typeof c[0] === "string" && zahl(c[1]) && zahl(c[2]));
            if (L.length)
                aas.set(
                    z[0],
                    L.map(([id, hi, w]) => [id, hi, w])
                );
        }
        const R = this._bestandRegionen().regionen;
        const LG = AnazhRealm._lebensraumGesetz().L.gattung;
        // DAS RASTER DES STANDS (`seite`, die Seite seiner Kacheln): ein Stand eines anderen Rasters (bis w27-tiere-sicht 354 m,
        // ohne Marke) nennt mit seinen Schlüsseln andere Orte — sein Bestand zieht um: jedes Tier in die Kachel seines Ankers (der
        // Takt der Kachel ist der späteste ihrer Quellen: keine Kennung `indId(key, t, j)` kehrt wieder). Ohne den Umzug läse die
        // Kachel am alten Schlüssel Tiere, die 500 m entfernt ankern. Der Zähler der Geburt (`seq`) eines alten Stands fällt
        // ungelesen (leben-erbe).
        const fremd = v.seite !== this._bestandSeite();
        for (const [key, r] of Object.entries(v.bestand && typeof v.bestand === "object" ? v.bestand : {})) {
            if (!/^-?\d+,-?\d+$/.test(key) || !r || !zahl(r.t) || !Array.isArray(r.tiere)) continue;
            const tiere = r.tiere
                .filter(
                    (t) =>
                        t &&
                        typeof t.id === "string" &&
                        typeof t.soul === "string" &&
                        t.g in LG &&
                        [t.alterS, t.x, t.z].every(zahl) &&
                        (t.a === undefined || (this._lebenErbeGilt(t.a) && this._lebenErbeGilt(t.e))) &&
                        (t.m == null || (typeof t.m === "string" && t.m.length <= 96))
                )
                .map((t) => this._lebenWandeln(t));
            if (!fremd) R[key] = { t: r.t, tiere };
            else
                for (const t of tiere) {
                    const k = this._bestandKey(t.x, t.z);
                    const Z = R[k] || (R[k] = { t: r.t, tiere: [] });
                    Z.t = Math.max(Z.t, r.t);
                    Z.tiere.push(t);
                }
        }
        // die offenen Akte treten in die Reihe (sie wirken in der Folge mit den Takten, nie beim Laden)
        // (eine offene Annahme eines Stands von vor dem Erbe trägt ihr Tier ohne `a`: dieselbe Wandlung, `_lebenWandeln`)
        for (const a of Array.isArray(v.akte) ? v.akte : [])
            if (a && typeof a === "object")
                this._feldAktFremd(
                    a.art === "annahme" && a.tier && typeof a.tier === "object" && a.tier.a === undefined
                        ? { ...a, tier: this._lebenWandeln({ ...a.tier, id: String(a.id) }) }
                        : a,
                    a.w,
                    false
                );
    }

    // DIE AKTE DER SEITE REISEN NACH (feld.K2#2): wer beitritt — ein neuer Mitspieler, eine Seite nach ihrem Reload —, trägt die
    // Akte nicht, die zwischen seinem Stand und seinem Beitritt fielen. Jede Seite merkt sich ihre eigenen gesendeten Akte (Feld-Akte,
    // Wünsche der Welt) der letzten AKT_NACHHOL_S und sendet sie dem Beitretenden erneut (`_p2pMsgPeerJoin`); der Empfänger trägt
    // jeden Akt einmal (je Stempel und Inhalt, `_feldAkt`, `_wunschNimm`), auch über seinen Stand hinweg.
    _aktSenden(msg) {
        const L = this._eigeneAkte || (this._eigeneAkte = []);
        const alt = this.state.spielZeit - AnazhRealm.AKT_NACHHOL_S;
        while (L.length && !(L[0].w >= alt)) L.shift();
        L.push(msg);
        this.p2pSend(Object.assign({}, msg));
    }
    _akteNachholen() {
        const alt = this.state.spielZeit - AnazhRealm.AKT_NACHHOL_S;
        for (const m of this._eigeneAkte || []) if (m.w >= alt) this.p2pSend(Object.assign({}, m));
    }

    // DER HORIZONT DES FELDS (s, Lockstep): bis zu welcher Welt-Zeit die Folge der Takte und Akte (`_feldTakt`) gerechnet werden darf —
    // allein bis zur Uhr; mit Mitspielern bis zur frühesten Welt-Uhr, die einer von ihnen zuletzt trug (`pos.w`, `weltUhr` am Eintrag:
    // jeder seiner späteren Akte trägt einen Stempel danach), weniger dem Vorlauf (die Frist, in der ein Akt jede Seite erreicht,
    // auch über zwei Wege). So überholt keine Seite einen Akt, der noch reist — auch nicht, wenn ihre Uhr springt: bis feld.K2#2
    // rechnete A die 20 min eines Sprungs sofort nach, und die Akte, die B davor gestempelt hatte, kamen zu spät (der Bestand einer
    // Region lief ab dem fünften Wurf auseinander).
    _feldHorizont() {
        const st = this.state;
        const p2p = st.p2p;
        let h = st.spielZeit;
        if (!(p2p && p2p.enabled && p2p.peers && p2p.peers.size)) return h;
        for (const e of p2p.peers.values()) if (Number.isFinite(e.weltUhr)) h = Math.min(h, e.weltUhr);
        return h - AnazhRealm.FELD_VORLAUF_S;
    }

    // Ein Feld-Akt wirkt — zu SEINER Zeit (`w`: was er schreibt, trägt diesen Stempel — er reicht ihn jedem Schreiber als `uhr`; bis
    // zeit-ein-kalender bog er dafür die Welt-Uhr um und setzte sie zurück): Leben an
    // einem Ort (`leben`), ein Tier tritt in den Bestand seiner Region (`annahme`, der Leib der Seite, die es annahm, zeichnet es)
    // oder verlässt ihn (`aus`: sein Leib fiel außerhalb des Gesetzes — eine Zeichnung des Tiers auf dieser Seite geht, sobald
    // sie außer Blick steht).
    _feldAktWirkt(akt) {
        const st = this.state;
        const jetzt = st.spielZeit;
        const gewirkt = this._feldAktGewirkt || (this._feldAktGewirkt = new Map());
        gewirkt.set(akt.w + "|" + akt.k, akt.w);
        this._lebenGen = (this._lebenGen || 0) + 1; // die Marke des Lebens im Stand
        st.faunaLifecycle.feldLetzt = akt.w; // das zuletzt gerechnete Ereignis der Folge des Felds (`_feldTakt`)
        if (gewirkt.size > 512)
            for (const [k, w] of gewirkt) if (w < jetzt - 2 * AnazhRealm.AKT_NACHHOL_S) gewirkt.delete(k);
        if (akt.art === "leben") return void this._depositLife(akt.x, akt.z, akt.a, akt.w);
        if (akt.art === "brand") return this._brandFangen(akt.x, akt.z, akt.ein, akt.w);
        const R = this._bestandRegion(akt.key, false, 0, Infinity, null, akt.w);
        if (akt.art === "annahme") {
            const offen = this._annahmeOffen && this._annahmeOffen.get(akt.id);
            if (offen) this._annahmeOffen.delete(akt.id);
            if (R.tiere.some((t) => t.id === akt.id)) return;
            const t = offen || Object.assign({}, akt.tier, { id: akt.id });
            delete t.zu;
            R.tiere.push(t);
            return;
        }
        const i = R.tiere.findIndex((t) => t.id === akt.id);
        if (i < 0) return;
        const [t] = R.tiere.splice(i, 1);
        if (t.leib) [t.leib.userData._bestand, t.leib.userData._ohneTier, t.leib] = [null, true, null];
    }

    // DIE GABE EINER EINGABE (jedes Leben, das nicht das Gesetz des Bestands schreibt): ein Feld-Akt zur Welt-Uhr seines Akts.
    // Der empfangene Akt eines Mitspielers (`ctx.akt`) wirkt zu dessen Stempel; ein Programm des Spielers reist selbst
    // (`dslRun`), ein Gesetz eines Spielers trägt jede Seite selbst — beide reisen nicht noch einmal; alles andere reist.
    _lebenGabe(x, z, a, ctx) {
        const gesetz = !!(ctx && ctx.regel && this._gesetzGeber(ctx.regel)); // ein Gesetz eines Spielers: zur Zeit seiner Scheibe
        const reistSelbst = !!(ctx && ctx.akt) || (ctx && ctx.source === "human") || gesetz;
        const w = ctx && (ctx.akt || gesetz) && ctx.uhr != null ? ctx.uhr : this.state.spielZeit;
        return this._feldAkt({ art: "leben", w, x, z, a }, !reistSelbst, true, !!(ctx && ctx.akt));
    }

    // DIE LEBEN-STUFE am Ort (feld.K5): das Leben-Overlay in Stufen (`LIFE_FIELD.stufen` je Einheit) — die Nah-Streu liest sie
    // (`_nahStreuKachel`, das Boden-Gesetz `leben`: die gepflegte Wiese blüht), nie den stetigen Zerfall; so baut sie nur, wo
    // eine Stufe springt. Ohne Overlay 0: die Streu steht byte-gleich. DER FRASS DES GAUS (Leben C2b, E3) zählt in dieselbe Stufe
    // (`_gauFrassAt`, die Zelle des Reviers): springt seine Stufe mit einer Antwort des Fadens, wächst die Streu der Zelle neu
    // (`_gauAntwort` ruft `_nahStreuNeuIn`) — die abgeäste Wiese der Herde steht im Bild.
    _lebenStufe(x, z) {
        const S = AnazhRealm.LIFE_FIELD.stufen;
        return Math.round((this._lebenStufeHalt(x, z)[0] + this._gauFrassAt(x, z)) * S) / S;
    }
    // DIE STUFE HÄLT ZWEI TAKTE DES BESTANDS (w27-tiere-sicht): ihr Zerfall zählt erst zwei Takte (`taktS`) nach der letzten Schrift
    // der Zelle — der Fraß der Herde schreibt je Takt, und die Stufe folgt dem Takt des Gesetzes, das sie schreibt, nie dem Zerfall
    // dazwischen. Eine Funktion von Betrag und Stempel der Zelle (Stand und Mitspieler tragen beide): kein Pendel, keine Geschichte.
    // Bis dahin stand eine abgeäste Wiesen-Zelle im Gleichgewicht des Fraßes (−0,065) an der Grenze der Stufe (−0,0625): jeder Takt
    // malte sie −1 und der Zerfall 5 s später 0 (gate:stand-takt RUHE an der Mess-Wiese: nahStreu 1 014 Einheiten in 7 von 30
    // Frames; 60 s Stand 192 Kacheln neu gewürfelt). Rückgabe [Betrag (unter epsilon 0), Beginn des Zerfalls].
    _lebenStufeHalt(x, z) {
        const L = AnazhRealm.LIFE_FIELD;
        const e = this.state.lifeField && this.state.lifeField.get(this._lifeCellKey(x, z));
        if (!e) return [0, 0];
        const ab = e.t + 2 * AnazhRealm._bestandGesetz().B.taktS;
        const a = e.a * Math.exp(-L.decayPerSec * Math.max(0, this.state.spielZeit - ab));
        return [Math.abs(a) < L.epsilon ? 0 : a, ab];
    }

    // Die Stufe der Zelle (cx, cz) malen: springt sie gegen die zuletzt gemalte (`_lebenStand`), wächst die Nah-Streu darüber neu
    // (`_nahStreuNeuIn`, nur die Kacheln dieser Zelle). Die Zelle wacht zum nächsten Sprung ihres Zerfalls (|a| fällt unter die
    // halbe Stufe darunter, `_lebenWecken`); auf Stufe 0 schläft sie — die Kosten tragen die Sprünge, nie das Feld.
    _lebenStufeMalen(cx, cz) {
        const L = AnazhRealm.LIFE_FIELD;
        const st = this._lebenStand || (this._lebenStand = new Map());
        const key = cx + "," + cz;
        const [x, z] = [(cx + 0.5) * L.cell, (cz + 0.5) * L.cell];
        const [a, ab] = this._lebenStufeHalt(x, z);
        const k = Math.round(a * L.stufen);
        const alt = st.get(key);
        if ((alt ? alt.k : 0) !== k)
            this._nahStreuNeuIn(cx * L.cell, cz * L.cell, (cx + 1) * L.cell, (cz + 1) * L.cell);
        if (k === 0) return void st.delete(key); // gemalt heißt aus der Halde genommen (`_tickLebenStufen`): kein Platz bleibt
        if (alt) alt.k = k;
        else st.set(key, { key, k, wach: Infinity, i: -1 });
        // der nächste Sprung: ab dem Beginn des Zerfalls (`_lebenStufeHalt`), bis |a| unter die halbe Stufe darunter fällt
        AnazhRealm._lebenWecken(
            this,
            key,
            Math.max(this.state.spielZeit, ab) +
                Math.log(Math.abs(a) / ((Math.abs(k) - 0.5) / L.stufen)) / L.decayPerSec +
                1e-6
        );
    }

    // DER WECKER DER LEBEN-STUFEN (feld.K5, Ereignis statt Takt): die Zelle `key` wird um Spielzeit `wach` fällig — ihr Eintrag
    // im Stand (`_lebenStand`, mit Stufe 0 angelegt, wo die Tat eine neue Zelle schreibt) trägt die Zeit und seinen Platz `i`
    // in der Halde (`_lebenWecker`, Min-Heap der Stand-Einträge nach `wach`, -1 = nicht darin). JEDE ZELLE STEHT HÖCHSTENS
    // EINMAL in der Halde: ein neu geplanter Eintrag rückt an seinem Platz auf oder ab — die Halde ist nie länger als der Stand,
    // der Stand nie größer als die berührten Zellen (Gebot 7). Bis zum Schnitt legte jede Tat je Zelle einen NEUEN Platz an
    // (der alte blieb stumm liegen): im Zeitraffer der Kaskade (Fraß je Tier und Takt, 9 Zellen je Tat, ohne Takt der Stufen)
    // wuchs sie ohne Schranke, bis die Seite abstürzte (voll 2/18, z170/z174: „Page crashed!“; gate:stand-takt HALDE).
    // Statisch: die Tat ruft ihn je geschriebener Zelle, er besucht nie eine andere.
    static _lebenWecken(welt, key, wach) {
        const st = welt._lebenStand || (welt._lebenStand = new Map());
        const H = welt._lebenWecker || (welt._lebenWecker = []);
        let e = st.get(key);
        if (!e) st.set(key, (e = { key, k: 0, wach, i: -1 }));
        e.wach = wach;
        if (e.i < 0) e.i = H.push(e) - 1;
        AnazhRealm._lebenHaldeRueck(H, e.i);
    }

    // Den Eintrag an Platz `i` der Halde an seinen Ort rücken (auf, sonst ab) — jeder Eintrag kennt seinen Platz (`e.i`)
    static _lebenHaldeRueck(H, i) {
        const e = H[i];
        for (let p; i > 0 && H[(p = (i - 1) >> 1)].wach > e.wach; i = p) (H[i] = H[p]).i = i;
        for (let c; (c = 2 * i + 1) < H.length; i = c) {
            if (c + 1 < H.length && H[c + 1].wach < H[c].wach) c++;
            if (H[c].wach >= e.wach) break;
            (H[i] = H[c]).i = i;
        }
        (H[i] = e).i = i;
    }

    // Der Zerfall der Leben-Stufen (je Takt, scatterDeco): schläft, bis die Halde ihre früheste Zelle fällig nennt — dann nimmt er
    // nur die fälligen heraus und malt sie (`_lebenStufeMalen`), jede plant ihren nächsten Sprung neu. Im Stand ohne Tat: ein
    // Vergleich je Takt.
    _tickLebenStufen() {
        const H = this._lebenWecker;
        while (H && H.length && H[0].wach <= this.state.spielZeit) {
            const e = H[0];
            const letzt = H.pop();
            e.i = -1;
            if (H.length) ((H[0] = letzt), AnazhRealm._lebenHaldeRueck(H, 0));
            const [cx, cz] = e.key.split(",").map(Number);
            this._lebenStufeMalen(cx, cz);
        }
    }

    // Kreatur-Trickle: eine tendende Kreatur (userData.tendsLife) träufelt Leben in ihre Zelle,
    // rate-limitiert (trickleEverySec); wandernd ergibt das einen decayenden Lebens-Pfad. NUR tendsLife —
    // ambiente Fauna träufelt nie (sonst positiver Feedback-Runaway). Pro Frame aus updateCreatures. `now` ist die Spiel-Uhr
    // (`spielZeit`); steht sie hinter der letzten Gabe (ein Stand lud eine frühere Uhr), zählt die Frist ab ihr neu.
    _tickCreatureLifeTrickle(creature, now) {
        if (!creature || !creature.userData || !creature.userData.tendsLife || !creature.position) return;
        const last = creature.userData.lastLifeTrickle ?? -Infinity;
        if (now >= last && now - last < AnazhRealm.LIFE_FIELD.trickleEverySec) return;
        creature.userData.lastLifeTrickle = now;
        this._lebenGabe(creature.position.x, creature.position.z, AnazhRealm.LIFE_FIELD.trickle, null); // ein Akt der Seite (feld.K2#2)
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
        this._lavaTaktT = -Infinity; // der nächste Takt malt die neue Decke in den Boden (`_lavaTakt`)
        return this._tatSchreiben("lava", x, z, { y: Math.round(y * 100) / 100, wasser });
    }

    // Die Decke der Zelle unter (x, z) — der Zustand ihrer jüngsten Lava (`temperatur` °C, `glut` 0…1, `erstarrt`, `dampf`,
    // `alterS`) oder null ohne Lava.
    _lavaAt(x, z, uhr) {
        const a = this._lavaJuengste(this._lifeCellKey(x, z));
        return a ? this._lavaZustand(a, uhr) : null;
    }
    // Die jüngste Lava-Tat der Zelle mit dem Schlüssel `k` (`_lifeCellKey`) oder null — die EINE Wahl der Decke.
    _lavaJuengste(k) {
        const I = this._tatIndex();
        if (!I.lava.length) return null;
        const je = I.je.get(k);
        let a = null;
        if (je) for (const t of je) if (t.tat === "lava" && !(a && a.h >= t.h)) a = t;
        return a;
    }
    _lavaZustand(a, uhr) {
        const alterS = (this._weltStunde(uhr) - a.h) * AnazhRealm.WELT_GESETZ_ERDE.kalender.stundeS;
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
    // ihre Dauer: die Stunden ihrer Klasse (`TAT_NARBE`) durch den Wuchs des Orts (Feuchte × Licht, `_tatDauer`, stoffe.K5), gleich
    // für jeden Reload; geheilt fällt sie (`_tickScatterRegrow`). Bis feld.K4 lebte die Ernte im Session-Gedächtnis
    // (FORAGE.regrowMs, 300 s Wanduhr), das Fällen schrieb nichts ins Feld (Mess-Wiese, Null-Renderer, main f7dd313c: 8 Bäume
    // und 23 Pflanzen mit tryMouseBreak — Δlebendig 0, kein Stumpf, nach dem Reload 23 von 23 Pflanzen zurück).

    // DER TAG DER PROZESSE (w28-lava-nachlauf): die EINE Zeit, an der alles altert, was ein Prozess ist — die Welt-Uhr
    // (`spielZeit`: sie reist, geht nie zurück, die spätere gilt, `_weltUhrNimm`) im Tag des Kalenders (die Kalender-Zeit, stetig
    // über den Regler), ab dem Null-Punkt der Welt (`worldMeta.tagNull`, `_weltTagEichen`). Leser: die
    // Welt-Stunde (`_weltStunde`: das Erkalten der Lava, Stempel und Heilung der Taten, der Nachwuchs, die Sukzession), der
    // Pfad (`_trittJetzt`, sein Tag-Wechsel in `_tickWegeKarte`) und das Alter der Werke (`_werkAlter`, `_werkeAltern`). Bis
    // hier lasen sie den Tag der SICHT (`worldMeta.tag` + `timeOfDay`, der Sonnenstand des Spielers): ein Zug am Regler der Uhr
    // ließ die Lava erkalten und die Narbe heilen, Brand, Nässe und Wetter (an der Welt-Uhr) standen — zwei Uhren für eine
    // Welt, und die eine reiste nie. Die Uhr des Spielers (`_uhrSetzen`) bewegt jetzt keinen Prozess mehr. `uhr` (s der Welt-Uhr):
    // der Augenblick, zu dem ein Takt rechnet (der Takt des Bestands auf seinem Raster, ein Feld-Akt zu seinem Stempel) — ohne
    // ihn jetzt. Der Tag ist der des Kalenders (`_kalenderZeit`, zeit-ein-kalender): bis dahin las er den festen Tag des Pegels
    // (3 600 s Welt-Uhr), am 8-min-Tag lief das Licht 7,5-mal so schnell wie Lava, Narbe und Pegel.
    _weltTag(uhr = this.state.spielZeit) {
        const wm = this.state.worldMeta;
        return (+(wm && wm.tagNull) || 0) + this._kalenderZeit(uhr) / this._kalender().normS;
    }

    // DER KALENDER DER WELT (zeit.K1, zeit-ein-kalender — `WELT_GESETZ_ERDE.kalender`): die EINE Tag-Länge `tagS` (die Wahl des
    // Spielers, `dayLengthMinutes`, Sekunden der Welt-Uhr je Tag) und das Jahr in Kalender-Zeit (`jahrK` = normS ÷ `jahreJeTag`: es folgt dem Tag). Leser: der
    // Gang der Uhr (`tickDayNight`), der Tag der Prozesse (`_weltTag`), der Pegel (über die Kalender-Zeit), die Nässe des Bodens,
    // das Jahr (`_saisonAnkerGilt`, `setSeason`, das Laden) und die Stunde der Bewohner. Fehlt die Tag-Länge, WIRFT er beim Namen
    // (kein Leser rechnet still mit einem anderen Tag). `normS`: der Standard-Tag (`DAY_LENGTH_DEFAULT_MINUTES`), die Einheit
    // der Kalender-Zeit.
    _kalender() {
        const st = this.state;
        const K = AnazhRealm.WELT_GESETZ_ERDE.kalender;
        const min = st.dayLengthMinutes;
        if (!(typeof min === "number" && min > 0))
            throw new Error(`Der Kalender: keine Tag-Länge (state.dayLengthMinutes ${min})`);
        const tagS = min * 60;
        const normS = AnazhRealm.DAY_LENGTH_DEFAULT_MINUTES * 60;
        return { tagS, normS, jahrK: normS / K.jahreJeTag, tagStunden: K.tagStunden, jahrTage: K.jahrTage };
    }

    // DIE KALENDER-ZEIT zur Welt-Uhr `z` (s, ohne sie jetzt): die Welt-Uhr im Gang des Kalenders, gezählt in Sekunden des
    // Standard-Tags — k(z) = Versatz + z · normS ÷ tagS. Am Standard-Tag ist sie die Welt-Uhr selbst (Versatz 0: jede Welt am
    // Standard rechnet byte-gleich wie vor dem Kalender). Was im Tag rechnet, liest sie: der Tag der Prozesse (`_weltTag`) und
    // der Pegel (Stempel des Regens, Zustand, Lauf — sein Tag ist `normS` Kalender-Zeit, `tagS` Welt-Uhr). DER GANG IST STETIG
    // ÜBER DEN REGLER: wechselt die Tag-Länge, legt sich der Versatz so, dass die Kalender-Zeit im Augenblick des Wechsels nicht
    // springt (`worldMeta.kalender` = [Versatz, Tag-Länge]; ohne ihn [0, Standard] — so trug jeder Stand vor dem Kalender seine
    // Zeit; er reist im worldMeta). Eine Tag-Länge, die die Zeit anhält (die Bühne: 10¹² min), hält damit jeden Prozess des Tags an.
    _kalenderZeit(z = this.state.spielZeit) {
        const st = this.state;
        const { tagS, normS } = this._kalender();
        const wm = st.worldMeta;
        let [versatz, laenge] = (wm && wm.kalender) || [0, normS];
        if (wm && laenge !== tagS) {
            const jetzt = st.spielZeit || 0;
            versatz += jetzt * (normS / laenge) - jetzt * (normS / tagS);
            laenge = tagS;
            if (versatz === 0 && laenge === normS) delete wm.kalender;
            else wm.kalender = [versatz, laenge];
        }
        return versatz + (z || 0) * (normS / tagS); // am Standard-Tag × 1: die Welt-Uhr, bit-gleich
    }
    // die Welt-Uhr zur Kalender-Zeit `k` (die Umkehrung von `_kalenderZeit` im Gang, der jetzt gilt)
    _kalenderUhr(k) {
        const { tagS, normS } = this._kalender();
        const wm = this.state.worldMeta;
        this._kalenderZeit();
        const versatz = (wm && wm.kalender && wm.kalender[0]) || 0;
        return (k - versatz) * (tagS / normS);
    }

    // DER NULL-PUNKT EINES STANDS VON VOR DEM SCHNITT: seine Stempel (Taten `h`, Lava `h`, Werke `geburt`, Tritte) tragen den
    // Tag der Sicht — der Null-Punkt legt den Tag der Prozesse EINMAL auf ihn, nach Welt-Uhr und Stunde des Stands
    // (`_loadStateRestoreSoulAndAtmosphere`); von da an läuft er nur noch an der Welt-Uhr. Eine neue Welt trägt ihn ab der
    // Geburt (`_weltGeburt`).
    _weltTagEichen() {
        const [st, wm] = [this.state, this.state.worldMeta];
        if (!wm || Number.isFinite(wm.tagNull)) return;
        wm.tagNull = (wm.tag || 0) + (st.timeOfDay || 0) - this._kalenderZeit() / this._kalender().normS;
    }

    // DIE GEBURT EINER WELT (welt-tag-null): der EINE Ort, an dem ein worldMeta zur Welt wird — ihr Tag der Prozesse beginnt bei
    // 0 (`tagNull`), nie hält ein Laden sie für einen Stand von vor dem Schnitt. Bis hier trug die frische Welt keinen Null-Punkt,
    // das erste Laden eichte ihn auf den Tag der Sicht: der Tag der Prozesse (Lava, Heilung, Nachwuchs) sprang um +0,4999, und die
    // Grundstellung der Maschine brach an `worldMeta.tagNull` (GTX f68dbf09: 26 Abbrüche). Rufer: der Boot einer frischen Welt
    // (`ensureWorldMeta`), `_generateFreshWorldMeta` (neue Welt, Welt-Tor, Reise), die Fusion und `_weltMetaDa`.
    static _weltGeburt(m) {
        m.tagNull = 0;
        return m;
    }

    // DAS worldMeta DER SEITE für jeden Schreiber: das der Welt, sonst eine Welt aus der Geburt — nie ein loses `{}`.
    _weltMetaDa() {
        return this.state.worldMeta || (this.state.worldMeta = AnazhRealm._weltGeburt(AnazhRealm._weltMetaVorlage()));
    }

    // DIE WELT-STUNDE: Stunden seit dem ersten Tag der Welt, am Tag der Prozesse (`_weltTag`, zur Uhr `uhr`), in den Stunden des
    // Kalenders.
    _weltStunde(uhr) {
        return AnazhRealm.WELT_GESETZ_ERDE.kalender.tagStunden * this._weltTag(uhr);
    }

    // Die Tat schreibt: an ihren Ort, zur Welt-Stunde; `mehr` trägt, was ihre Klasse braucht (die Ernte ihre Kachel und Kennung,
    // das Fällen die Größe des Baums für den Stumpf). Der Nachwuchs wacht zu ihrem Ende (die Asche und der Stubben zur nächsten
    // Stufe ihrer Sukzession, `_sukzessionNaechste`), die nächste Sicherung trägt sie.
    _tatSchreiben(tat, x, z, mehr) {
        const wm = this.state.worldMeta;
        if (!Array.isArray(wm.taten)) wm.taten = [];
        const r2 = (v, k) => Math.round(v * k) / k;
        const a = Object.assign({ tat, x: r2(x, 100), z: r2(z, 100), h: r2(this._weltStunde(), 1e4) }, mehr);
        this._weltRegt(); // der Weckruf vor jedem Schreiben
        wm.taten.push(a);
        const folge = tat === "brand" || tat === "faellen";
        const ende = folge ? this._sukzessionNaechste(a) : a.h + this._tatIndex().dauer.get(a);
        if (!(this._nachwuchsFaellig <= ende)) this._nachwuchsFaellig = ende;
        if (tat === "faellen") this._nahStreuTat(a);
        // die Asche liegt (stoffe.K2#2): Boden-Decke, Wiese und Streu der Narbe, und der Brand nimmt die Bäume in ihr — ihre erste
        // Stufe malt der Nachwuchs (`_tickScatterRegrow`, die Schlange der frischen Taten)
        if (folge) (this._sukzessionNeu || (this._sukzessionNeu = [])).push(a);
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
                brand: [], // die Aschen (die Boden-Decke malt sie, `_ascheStufeMalen`; die Sukzession weckt sie)
                bestellen: [], // die bestellten Stücke der Äcker (der Körper des Ackers legt sie, `_ackerKoerperTakt`)
            };
        const N = AnazhRealm.TAT_NARBE;
        J.baut = true; // der Nährstoff jeder neuen Tat liest nur die Taten vor ihr (`_naehrstoffAt`)
        for (; J.n < n; J.n++) {
            const a = L[J.n];
            if (!a || !N[a.tat] || !Number.isFinite(a.x + a.z + a.h)) continue;
            J.dauer.set(a, this._tatDauer(a));
            const k = this._lifeCellKey(a.x, a.z);
            if (!J.je.has(k)) J.je.set(k, []);
            J.je.get(k).push(a);
            if (a.tat === "lava") J.lava.push(a);
            if (a.tat === "brand") J.brand.push(a);
            if (a.tat === "bestellen") J.bestellen.push(a);
            if (a.tat === "ernten" && typeof a.kachel === "string") {
                if (!J.kachel.has(a.kachel)) J.kachel.set(a.kachel, new Set());
                J.kachel.get(a.kachel).add(a.id);
            }
        }
        J.baut = false;
        return J;
    }

    // Die Narbe an (x,z): Σ Tiefe × Rest je Tat der Zelle (der Rest fällt linear von 1 auf 0 über ihre Dauer), gekappt.
    _narbeAt(x, z, uhr) {
        const I = this._tatIndex();
        const je = I.n ? I.je.get(this._lifeCellKey(x, z)) : null;
        if (!je) return 0;
        const N = AnazhRealm.TAT_NARBE;
        const h = this._weltStunde(uhr);
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
    // heilt (sein Jungwuchs, der Wurf in der Prägung `ov` mit dem Alter des Orts, `_baumAlter`, steht), wo ein Wurf abgebaut
    // wurde, für immer: die Promotion, die Streu und jeder Wurf durch `_naturSetzen` fragen hier.
    _tatSperrt(x, z, ov) {
        if (this._tatAm("abbauen", x, z)) return true;
        return this._tatAm("faellen", x, z) && !(ov && ov.alter > 0 && ov.alter === this._baumAlter(x, z));
    }

    // === die SCHREIB-Seite der emotion-Achse (das räumliche Gedächtnis) ===
    // Eine emotionale Tat (`_feelAction`) prägt ihre Emotion an der Spieler-Zelle ein; `auraAt` blendet
    // den Abdruck über die globale Stimmung, der Welt-Tint liest das. Lazy-Decay, kein Frame-Sweep.
    _depositEmotion(x, z, emotionMap, uhr = this.state.spielZeit) {
        if (!emotionMap) return;
        if (!this.state.emotionField) this.state.emotionField = new Map();
        const ef = this.state.emotionField;
        const cfg = AnazhRealm.EMOTION_FIELD;
        const now = uhr;
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
    _emotionOverlayAt(x, z, uhr = this.state.spielZeit) {
        const ef = this.state.emotionField;
        if (!ef || ef.size === 0) return null;
        const cell = ef.get(this._lifeCellKey(x, z));
        if (!cell) return null;
        const dt = Math.max(0, uhr - cell.t);
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

    // STEHT DAS WERK IM WASSER? (Schau-2 wasser-wahrheit, Gegenprüfung) — das Urteil für ein Werk mit Grundriss-Gesetz
    // (`_grundrissVon` mit der Art: Haus, Tempel, Ausstattung) am Ort `position` mit der Drehung `opts.rotationY`: sein ganzes Fundament
    // samt dem Vorplatz der Haustür auf dem Land (`_fundamentLand`)? false für jedes Werk ohne Grundriss-Gesetz (Natur
    // urteilt die Natur-Wand am Stamm; Fahrzeug und Tor fragt der Satz an ihrem Ort). `seed`: der Same des Werks (die Wurzel
    // reicht ihren, sonst `opts.seed`). Leser: die Wurzel (`spawnArchitecture`) und die Ort-Suche (`_werkOrtSuchen`).
    _werkImWasser(type, position, opts, seed) {
        if (!position) return false;
        const g = this._grundrissVon(opts || {}, type, seed);
        if (!g) return false;
        const ry = opts && Number.isFinite(opts.rotationY) ? opts.rotationY : 0;
        return !this._fundamentLand(position.x, position.z, ry, g, g.tuer, g.saum);
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
        const g = this._grundrissVon(opts || {}, type);
        if (!g || !this._werkImWasser(type, p0, opts)) return fuss(p0);
        const reich = Math.hypot(g.ex, g.ez) + Math.hypot(g.ox, g.oz) + 3 + Math.hypot(p0.x - pos.x, p0.z - pos.z);
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
    // (Kreatur, Baum, Studio-Werk, Dorf, Tempel, Wasserfall, Bauplan, Fraktal), legt EINMAL ins Log, was tatsächlich
    // steht — gewollt, gesetzt, je gefallenem Wurf sein Grund (`SETZ_GRUND`: die Wand, das Budget, die Obergrenze, das Buch,
    // die Wurzel nennt ihren über `opts.absage`) —; ein Bau, der folgt (das Dorf), trägt seinen Satz (`folgt`) und meldet sein
    // Ergebnis selbst, wenn er steht. Der Satz des Spielers (`_ergebnisSatz`) liest nur das.
    _setzErgebnis(ctx, op, gewollt, gesetzt, gruende, art, verb = "gesetzt", folgt) {
        if (!Object.hasOwn(AnazhRealm.SETZ_VERB, verb))
            throw new Error(`_setzErgebnis: das Verb „${verb}“ fehlt in SETZ_VERB`);
        ctx.log.push({
            event: "ergebnis",
            op,
            gewollt,
            gesetzt,
            gruende: Object.assign({}, gruende),
            art: art || null,
            verb,
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
            const key = e.op + "|" + JSON.stringify(e.art || ""); // die Art: ein Wort, eine Zeile oder `{ kopf }`
            let a = ops.get(key);
            if (!a) ops.set(key, (a = { art: e.art, verb: e.verb, gewollt: 0, gesetzt: 0, gruende: {}, folgt: null }));
            a.gewollt += e.gewollt || 0;
            a.gesetzt += e.gesetzt || 0;
            if (e.folgt) a.folgt = e.folgt;
            for (const k of Object.keys(e.gruende || {})) a.gruende[k] = (a.gruende[k] || 0) + e.gruende[k];
        }
        const liste = [...ops.values()];
        if (!liste.some((a) => a.folgt || a.gesetzt < a.gewollt)) return null;
        // jeder Satz ist eine Zeile der Tafel (spielgang.K5#2): die Art (ein Etikett der Sprache von jetzt oder eine Zeile), das
        // Verb und jeder Grund (`SETZ_GRUND`: Schlüssel der Tafel) sind Werte; `kern` trägt die Sätze ohne Punkt (die Stimme
        // des Felds setzt sie in Klammern), `satz` mit Punkt für den Chat
        const G = AnazhRealm.SETZ_GRUND;
        const kette = (zeilen, k) => zeilen.reduce((x, y) => [k, { a: x, b: y }]);
        const saetze = liste.map((a) => {
            if (a.folgt) return a.folgt;
            const fehl = a.gewollt - a.gesetzt;
            const art = a.art || ["ergebnis.ding.werke"];
            const verb = [`ergebnis.verb.${a.verb}`];
            if (!(fehl > 0)) return ["ergebnis.alle", { n: String(a.gesetzt), art, verb }];
            let benannt = 0;
            for (const k of Object.keys(a.gruende)) benannt += a.gruende[k];
            if (benannt < fehl) a.gruende.unbenannt = fehl - benannt;
            const gruende = kette(
                Object.keys(a.gruende)
                    .filter((k) => a.gruende[k] > 0)
                    .map((k) =>
                        k === "obergrenze"
                            ? ["grund.obergrenze-zahl", { n: String(this.state.maxCreatures) }]
                            : G[k]
                              ? [G[k]]
                              : k
                    ),
                "ergebnis.und"
            );
            if (a.gesetzt)
                return [
                    "ergebnis.teil",
                    { n: String(a.gesetzt), von: String(a.gewollt), art, verb, fehl: String(fehl), gruende },
                ];
            const weiter = a.gruende.lichtung || a.gruende.haus || a.gruende.bau || a.gruende.weg || a.gruende.wasser;
            const praes = AnazhRealm.SETZ_VERB[a.verb];
            return liste.length > 1
                ? ["ergebnis.mehrere", { art, nichts: [`ergebnis.art.${praes}`], gruende }]
                : [
                      weiter ? "ergebnis.einzeln-weiter" : "ergebnis.einzeln",
                      { nichts: [`ergebnis.hier.${praes}`], gruende },
                  ];
        });
        return {
            satz: kette(
                saetze.map((z) => ["ergebnis.punkt", { s: z }]),
                "ergebnis.folge"
            ),
            kern: kette(saetze, "ergebnis.und"),
        };
    }

    // Das Wort des Spielers für ein Werk (Leben-Schau 07.10., V-D8): das Label seines Bauplans bis zum ersten Zusatz („Eiche",
    // „Alemannisch"), nie die interne id. Leser: der Studio-Satz (`describe`) und der Satz des Ergebnisses.
    _werkLabel(name) {
        const bp = this.state.blueprints && this.state.blueprints[name];
        const rec = !bp && this._foundry && this._foundry.recipes ? this._foundry.recipes[name] : null;
        // ein Etikett bleibt Schlüssel (`{ kopf }`, wechselt mit der Sprache), ein Rezept trägt den Namen seines Studios (Daten)
        return bp ? AnazhRealm._namensZeile(bp, name) : AnazhRealm._namensKopf((rec && rec.lab) || name);
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

// FELD-CHARAKTER: jede Welt-Stimme hat ihre eigene Frequenz (lebendig λ200, dichte λ340, glut λ520, magie λ160 m) und der
// Domain-Warp verschiebt die Lage vor dem Lesen — die Zahlen sind Kern (gelaende-core `WELT_FELD`, die Formel `weltFeld`).
AnazhRealm.FIELD_CHARACTER = globalThis.__gelaendeCore.WELT_FELD;
// Die Namen der Aktionen: je Aktion ihr Schlüssel der Sprach-Tafel (`taste.*`, der Leser ruft `_t`) — die Tasten-Liste, die
// Hilfe und die Ankunfts-Linse lesen dieselbe Zeile.
AnazhRealm.KEYBINDING_LABELS = Object.freeze({
    vor: "taste.vor",
    zurueck: "taste.zurueck",
    links: "taste.links",
    rechts: "taste.rechts",
    slot0: "taste.slot-1",
    slot1: "taste.slot-2",
    slot2: "taste.slot-3",
    slot3: "taste.slot-4",
    slot4: "taste.slot-5",
    slot5: "taste.slot-6",
    slot6: "taste.slot-7",
    slot7: "taste.slot-8",
    slot8: "taste.slot-9",
    break: "taste.abbauen",
    place: "taste.platzieren",
    confirmBuild: "taste.bauen-bestaetigen",
    inventory: "taste.inventar",
    cancelBuild: "taste.bau-verlassen",
    jump: "taste.springen",
    drawerKreaturen: "taste.hof",
    drawerSpieler: "taste.spieler-drawer",
    drawerWerkstatt: "taste.werkstatt-drawer",
    drawerEinstellungen: "taste.einstellungen-drawer",
    cameraToggle: "taste.kamera",
    swapHands: "taste.hand-tauschen",
    chat: "taste.gespraech",
    // die Aktionen, die Tastatur und Gamepad frei binden (PAD_BELEGUNG, leib.K5)
    einsteigen: "taste.aufsitzen",
    handbremse: "taste.handbremse",
    sprint: "taste.sprinten",
    rutschen: "taste.rutschen",
    zoom: "taste.fernglas",
    hud: "taste.hud",
    slotVor: "taste.slot-vor",
    slotZurueck: "taste.slot-zurueck",
});
// Der Grund der Natur-Wand im Satz des Spielers (Leser: `SETZ_GRUND` des Ergebnis-Satzes, `confirmBuild` und das Bau-HUD).
AnazhRealm.NATUR_WAND_GRUND = Object.freeze({
    lichtung: "grund.lichtung",
    haus: "grund.haus",
    bau: "grund.bau",
    weg: "grund.weg",
    wagen: "grund.wagen",
    wasser: "grund.wasser",
});
// DIE GRÜNDE DES ERGEBNIS-SATZES (`_ergebnisSatz`, Schau-2 Runde 3): jeder Wurf, der nicht steht, trägt einen — die Wand
// (`NATUR_WAND_GRUND`), das Budget des Programms, die Obergrenze der Kreaturen (die Zahl liest der Satz aus dem Zustand), das
// Buch des Studios, ein unbekannter Bauplan, eine unbekannte Seele, eine Gestalt, die nicht gegossen wurde, die fehlende
// Bühne — jeder benannt von der Stelle, die absagt (die Wurzel über `opts.absage`). „unbenannt" sagt ehrlich, dass eine
// Absage ihren Grund nicht nannte (die Linse verbietet ihn). Jeder Grund ist ein Schlüssel der Tafel (spielgang.K5#2: die
// Sprache des Spielers liest ihn, das Log die Quell-Sprache).
AnazhRealm.SETZ_GRUND = Object.freeze({
    ...AnazhRealm.NATUR_WAND_GRUND,
    budget: "grund.budget",
    obergrenze: "grund.obergrenze",
    buch: "grund.buch",
    unbekannt: "grund.unbekannt",
    seele: "grund.seele",
    gestalt: "grund.gestalt",
    buehne: "grund.buehne",
    platz: "grund.platz",
    vertrag: "grund.vertrag",
    regler: "grund.regler",
    unbenannt: "grund.unbenannt",
});
// DIE VERBEN DES ERGEBNIS-SATZES (`_setzErgebnis`): je Verb sein Präsens („hier wächst nichts"); Verb und Präsens sind Zeilen
// der Tafel (`ergebnis.verb.<verb>`, `ergebnis.art.<präsens>`, `ergebnis.hier.<präsens>` — gate:sprache F zählt sie hier). Ein
// Verb außerhalb der Tafel bricht laut am Setzer, nie erst im Satz.
AnazhRealm.SETZ_VERB = Object.freeze({
    gesetzt: "steht",
    gebaut: "steht",
    gepraegt: "steht",
    gewachsen: "waechst",
    erschienen: "erscheint",
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
// DER VORLAUF DER FELD-AKTE (feld.K2#2, `_feldAkt`): mit Mitspielern wirkt jede Eingabe ins Feld und jeder Takt des Bestands
// FELD_VORLAUF_S nach seinem Stempel der Welt-Uhr — die Frist, in der ein Akt jede Seite eines Raums erreicht (der Vorlauf des
// Lockstep; im Raum zweier Seiten unter Last ~0,1 s).
AnazhRealm.FELD_VORLAUF_S = 2;
// DAS NACHHOLEN DER AKTE (feld.K2#2, `_akteNachholen`): jede Seite sendet einem Beitretenden ihre eigenen Akte der letzten
// AKT_NACHHOL_S erneut — länger als der Abstand zweier Stände (5 s) samt einem Reload unter Last (bis 79 s).
AnazhRealm.AKT_NACHHOL_S = 120;
AnazhRealm.LIFE_FIELD = Object.freeze({
    cell: 16, // m — das Hydrosphäre/Voxel-Raster (Region-Skala)
    decayPerSec: 0.008, // Halbwertszeit ~87 s (getendete Region lingert, verwaiste verblasst)
    pulseCenter: 0.25, // eine Geburt hebt die Zelle (sparse ~0.1 → ~0.35, nicht mehr Minimum)
    pulseNeighbor: 0.1, // 3×3-Kernel-Rand (weiche räumliche Ausbreitung, kein Block)
    max: 0.7, // Sättigung pro Zelle (frozen+overlay → ~1; Wiederhol-Pulse sättigen → Nexus zieht weiter)
    kahl: -1, // der Boden des Fraßes: eine abgeäste Zelle trägt lebendig 0, nie weniger (auraAt klemmt)
    epsilon: 0.004, // darunter wird eine Zelle gepruned (die Map bleibt bounded)
    stufen: 8, // je Einheit: so fein liest die Nah-Streu das Overlay (`_lebenStufe`) — sie baut nur, wo eine Stufe springt
    // Kreatur-Trickle: nur Nexus/Spieler-getragene Kreaturen (tendsLife) träufeln Leben, wo sie wohnen —
    // die ambiente Fauna ist die FOLGE des Feldes (kein Runaway). Sanft + rate-limitiert; wandernde
    // Kreaturen ziehen einen zarten Lebens-Pfad.
    trickle: 0.05, // pro Trickle-Deposit (klein — ein Garten wird gepflegt, nicht geflutet)
    trickleEverySec: 3, // jede tendende Kreatur träufelt höchstens alle 3 s
});

// TAT_NARBE — die Narbe je Tat-Klasse (feld.K4, `_tatSchreiben`): `tiefe` senkt lebendig in der 16-m-Zelle der Tat, `stunden`
// ist ihre Dauer in Welt-Stunden bei vollem Wuchs (die Dauer = stunden / max(lebMin, Wuchs), `_tatDauer`: wo Wasser und Licht
// sind, heilt es schneller). Ein Baum hält die Lichtung Spieltage, eine gepflückte Pflanze Stunden; `max` kappt die Narbe einer Zelle.
// `naehr` verschiebt den Nährstoff der Zelle (stoffe.K5#2, `_naehrstoffAt`), solange die Narbe liegt: Ernte und Fällen nehmen ihn mit
// der Pflanze, Asche und Leichnam geben ihn zurück.
AnazhRealm.TAT_NARBE = Object.freeze({
    faellen: Object.freeze({ tiefe: 0.12, stunden: 48, naehr: -0.3 }), // der Stamm trägt den Nährstoff des Orts davon
    ernten: Object.freeze({ tiefe: 0.01, stunden: 3, naehr: -0.02 }),
    abbauen: Object.freeze({ tiefe: 0, stunden: Infinity }), // ein Wurf des Gesetzes, abgebaut: er kehrt nie zurück (speicher.K3)
    brand: Object.freeze({ tiefe: 0.3, stunden: 72, naehr: 0.4 }), // die Asche (`_brandSchritt`): solange sie liegt, brennt die Zelle nicht; sie düngt
    lava: Object.freeze({ tiefe: 0.5, stunden: Infinity }), // die Lava (`_lavaGiessen`): erstarrt bleibt sie Stein
    riss: Object.freeze({ tiefe: 0.03, stunden: 24, naehr: 0.2 }), // ein Tod von Spieler-Hand (`_creatureCombatDeath`): ein Leben fehlt dem Ort, sein Leichnam nährt ihn
    bestellen: Object.freeze({ tiefe: 0, stunden: Infinity }), // ein Stück Acker, gepflügt und gesät (`_ackerBestellen`): es trägt seine Frucht ab seiner Stunde (phyto ackerStand)
    aas: Object.freeze({ tiefe: 0, stunden: 24, naehr: 0.2 }), // der Leichnam jedes Tods des Bestands (`_aasTat`, keine Tat: ein Feld des Lebens): er nährt wie der des Risses; das Leben gibt der Tod selbst (`_bestandStirbt`)
    max: 0.6,
    lebMin: 0.1,
});
AnazhRealm.TAT_LEER = Object.freeze(new Set()); // die Kachel ohne Ernte (`_geerntetIn`)

// Die Scheibe des Todes-Rads einer Feld-Karte in Spielzeit-Sekunden (`_feldTod`): eine tote Zelle liegt höchstens so lange
// über ihrem Tod in der Karte (gelesen ist sie schon tot); FELD_LEER die fehlende Zelle.
AnazhRealm.FELD_TOD_EIMER_S = 8;
AnazhRealm.FELD_LEER = Object.freeze({});

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
