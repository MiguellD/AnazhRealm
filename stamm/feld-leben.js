class AnazhRealm_feld_leben {
    // ===== ATLAS · Feld/leben — Lebens-Feld · Aura · Wohl · Welt-Feld · Selbst-Analyse =====
    // DIE ASCHE an (x, z) ∈ [0, 1] (stoffe.K2#2) — der Kanal G derselben Karte, bilinear aus denselben Bytes, die der Boden-Stoff
    // liest (`_wegeBodenFarbe`): 1 frisch verbrannt, 0 nachgegrünt. Die Nah-Wiese liest sie (auf der Asche steht kein Halm).
    _ascheAt(x, z) {
        return this._bodenDeckeAt(x, z, true);
    }

    // DIE NARBE DES BRANDS an (x, z) (stoffe.K2#2) → { m, asche, busch, wald } oder null (kein Brand um den Ort): die verbrannte
    // Fläche ist eine weiche Grenze AUS DEM FELD, nie das 16-m-Raster seiner Zellen. Der Anteil `o` der verbrannten Zellen um den
    // Ort (die vier Zell-Mitten um ihn, smoothstep-bilinear — eine Zerlegung der Eins: im Innern einer Brandfläche 1, auf der
    // Kante einer verbrannten und einer stehenden Zelle 0,5, eine Treppe von Zellen ein glatter Zug) ist der Abstand zum
    // Brand-Rand; das EINE Rauschen (gelaende-core `rauschRaum`, die Schicht aus der Saat der Welt) verschiebt ihn in den Oktaven
    // von `BRAND.narbe`, und die Grenze fällt über `band`: `m` ∈ [0, 1], wie sehr der Ort verbrannte. `asche`, `busch`, `wald`
    // sind die Sukzession der verbrannten Zellen um ihn (ihr gewichtetes Mittel, `_brandZelle`). `zelle(cx, cz)` → null oder die
    // Sukzession der Zelle — der Maler reicht seinen Speicher (`_brandZellen`). `_brandNarbeFn(zelle)` ist dieselbe Narbe als
    // reine Funktion (x, z) für EINEN Gang (der Maler je Texel: die Saat einmal, die Zellen aus dem Speicher — der Schritt des
    // Brands kostet seine Zellen, nie ihre Texel). Bis w3v-brand-bild malte jede Zelle ihr Quadrat: die Asche lag als Platte mit
    // geraden Kanten im 16-m-Raster, die Halme endeten an der Zellkante.
    _brandNarbe(x, z, zelle = this._brandZellen()) {
        return this._brandNarbeFn(zelle)(x, z);
    }
    _brandNarbeFn(zelle) {
        const [cs, N, R, L] = [
            AnazhRealm.LIFE_FIELD.cell,
            AnazhRealm.BRAND.narbe,
            globalThis.__gelaendeCore.rauschRaum,
            this._forestSeedInt() % 251,
        ];
        const S = (t) => t * t * (3 - 2 * t);
        const amp = N.amp.reduce((s, a) => s + a, 0);
        return (x, z) => {
            const u = x / cs - 0.5;
            const v = z / cs - 0.5;
            const i = Math.floor(u);
            const j = Math.floor(v);
            const a = S(u - i);
            const b = S(v - j);
            let [o, as, bu, wa] = [0, 0, 0, 0];
            for (let k = 0; k < 4; k++) {
                const w = (k & 1 ? a : 1 - a) * (k & 2 ? b : 1 - b);
                const c = w > 0 ? zelle(i + (k & 1), j + (k >> 1)) : null;
                if (c) ((o += w), (as += w * c.asche), (bu += w * c.busch), (wa += w * c.wald));
            }
            if (!(o > 0)) return null;
            // das Rauschen wirkt am Rand (4·o·(1 − o)): im Innern einer Brandfläche bleibt sie ganz, fern von ihr ganz frei —
            // gerechnet nur, wo es die Grenze verschieben kann (|Rauschen| ≤ 1, gelaende-core `RAUSCH.skala`)
            const rand = 4 * o * (1 - o);
            let r = 0;
            if (Math.abs(o - 0.5) < N.band / 2 + amp * rand)
                for (let k = 0; k < N.lambda.length; k++)
                    r += N.amp[k] * R(x / N.lambda[k], z / N.lambda[k], L + 7 * k);
            return {
                m: Math.min(1, Math.max(0, (o - 0.5 + r * rand) / N.band + 0.5)),
                asche: as / o,
                busch: bu / o,
                wald: wa / o,
            };
        };
    }

    // Die Sukzession der verbrannten Zelle (cx, cz) → { asche, busch, wald } (die stärkste Asche, der jüngste Busch und Wald
    // ihrer Taten `brand`, `_sukzession`) oder null; `_brandZellen` ist ihr Speicher für EINEN Gang (der Maler, die Wiese).
    _brandZelle(cx, cz) {
        const I = this._tatIndex();
        let c = null;
        for (const a of I.brand.length ? I.je.get(cx + "," + cz) || [] : []) {
            if (a.tat !== "brand") continue;
            const s = this._sukzession(a);
            c = c
                ? {
                      asche: Math.max(c.asche, s.asche),
                      busch: Math.min(c.busch, s.busch),
                      wald: Math.min(c.wald, s.wald),
                  }
                : { asche: s.asche, busch: s.busch, wald: s.wald };
        }
        return c;
    }
    _brandZellen() {
        const M = new Map();
        return (cx, cz) => {
            const k = (cx + 32768) * 65536 + cz + 32768;
            let c = M.get(k);
            if (c === undefined) M.set(k, (c = this._brandZelle(cx, cz)));
            return c;
        };
    }

    // DIE ASCHE MALEN (stoffe.K2#2): die Asche der Zelle (cx, cz) und ihrer Ränder in jeder zentrierten Stufe — der Kanal G
    // jedes Texels ist die Narbe an seiner Mitte mal ihre Asche (`_brandNarbe`); die Narbe einer Zelle reicht bis an die Mitten
    // ihrer Nachbarinnen, gemalt wird die Fläche ±½ Zelle um sie. Wo sich ein Texel ändert, baut die Nah-Wiese darüber neu (auf
    // der Asche steht kein Halm, über die Grenze dünnen sie aus). Rückgabe: ob sich ein Texel änderte.
    _ascheMalen(cx, cz) {
        const wk = this.state.wegeKarte;
        if (!wk) return false;
        const cs = AnazhRealm.LIFE_FIELD.cell;
        const [x0, z0, x1, z1] = [(cx - 0.5) * cs, (cz - 0.5) * cs, (cx + 1.5) * cs, (cz + 1.5) * cs];
        const zelle = this._brandZellen();
        let neu = false;
        for (const stufe of wk.stufen)
            if (stufe.zentriert && this._ascheFlaeche(stufe, x0, z0, x1, z1, zelle)) neu = true;
        if (neu) this._nahRingNeuIn(x0, z0, x1, z1);
        return neu;
    }

    // Die Fläche [x0, x1) × [z0, z1) in EINE Stufe malen: jedes Texel, dessen Mitte in ihr liegt, trägt die Asche der Narbe an
    // seiner Mitte. Rückgabe: ob sich ein Texel änderte.
    _ascheFlaeche(stufe, x0, z0, x1, z1, zelle) {
        const kr = stufe.kronen;
        const N = kr.N;
        const t = stufe.S.fensterM / N;
        const x0w = stufe.mitteX - stufe.S.fensterM / 2;
        const z0w = stufe.mitteZ - stufe.S.fensterM / 2;
        const i0 = Math.max(0, Math.ceil((x0 - x0w) / t - 0.5));
        const i1 = Math.min(N - 1, Math.ceil((x1 - x0w) / t - 0.5) - 1);
        const j0 = Math.max(0, Math.ceil((z0 - z0w) / t - 0.5));
        const j1 = Math.min(N - 1, Math.ceil((z1 - z0w) / t - 0.5) - 1);
        if (i1 < i0 || j1 < j0) return false;
        const [A, narbe] = [kr.asche, this._brandNarbeFn(zelle)];
        let neu = false;
        for (let j = j0; j <= j1; j++)
            for (let i = i0; i <= i1; i++) {
                const n = narbe(x0w + (i + 0.5) * t, z0w + (j + 0.5) * t);
                const v = n ? Math.round(n.m * n.asche * 255) : 0;
                if (v !== A[j * N + i]) ((A[j * N + i] = v), (neu = true));
            }
        if (neu) AnazhRealm._kronenSchmutz(kr, i0, i1, j0, j1);
        return neu;
    }

    // Die Asche EINER zentrierten Stufe ganz neu (nach ihrem Umzug, einer geladenen Welt): leeren, jede Tat `brand` im Fenster
    // malt die vier Flächen zwischen den Zell-Mitten um ihre Zelle, jede Fläche einmal — die Kosten tragen die Aschen, nie die Welt.
    _ascheStufeMalen(stufe) {
        const kr = stufe.kronen;
        kr.asche.fill(0);
        const cs = AnazhRealm.LIFE_FIELD.cell;
        const h = stufe.S.fensterM / 2 + cs;
        const [zelle, gemalt] = [this._brandZellen(), new Set()];
        for (const a of this._tatIndex().brand) {
            if (Math.abs(a.x - stufe.mitteX) > h || Math.abs(a.z - stufe.mitteZ) > h) continue;
            const [cx, cz] = [Math.floor(a.x / cs), Math.floor(a.z / cs)];
            for (let qj = cz - 1; qj <= cz; qj++)
                for (let qi = cx - 1; qi <= cx; qi++) {
                    if (gemalt.has(qi + "," + qj)) continue;
                    gemalt.add(qi + "," + qj);
                    const [x0, z0] = [(qi + 0.5) * cs, (qj + 0.5) * cs];
                    this._ascheFlaeche(stufe, x0, z0, x0 + cs, z0 + cs, zelle);
                }
        }
        kr.schmutz = [0, kr.N - 1, 0, kr.N - 1];
    }

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
        if (op === "emotion_above") return `${a[0]} hoch ist (>${a[1] ?? "deiner Schwelle"})`;
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
            weather: (a) => (a[0] === "frei" ? "gibt das Wetter frei" : `lässt das Wetter zu „${a[0]}" wechseln`),
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
        const currentTime = this._taktUhr();
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
        this.state.nexusLastEvolution = this._taktUhr();
        this._gemuetGesetze(); // die Gesetze des Gemüts erwachen mit der Welt (affekt.K2)
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
            createdAt: this._taktUhr(),
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
                    ? `Gesetz aufgestellt — ${this.describeProgram(g.program)}.`
                    : "Die Regel ließ sich nicht aufstellen (siehe Log)."
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
                appendChatOutput(`Noch keine Welt-Regeln. Sag z. B. „${AnazhRealm.GESETZ_VORLAGEN[0]}".`);
                chatInput.value = "";
                return true;
            }
            appendChatOutput(`${rules.length} Welt-Regel${rules.length !== 1 ? "n" : ""}:`);
            for (const r of rules) {
                const who =
                    this._gesetzGeber(r) ||
                    (r.source === "nexus" ? "der Nexus" : r.source && r.source.startsWith("llm") ? "Grok" : r.source);
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
    // dichte → stein_block, magieleitung → kristall_geode; glut wirft kein Feuer, `FELD_WURF`). Seltenheit emergiert aus
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

    // === DER BRAND (stoffe.K2 · feld.K3#2): das Feuer auf dem Feld — die Front läuft nach Rothermel, gerechnet, wo es brennt ===
    // `state.brandFeld`: "cx,cz" (die 16-m-Zelle des Lebens) → die Zellen des Feuers: die brennenden (`t0` die Ankunft der Front,
    // `ende` die Zeit, zu der sie ausgebrannt ist, `glut`, ihr Bett `stoff`, ihr Tempo `R` längs `kopf`) und die, die die Front
    // erreichen wird (`t0` null, `an` ihre Ankunft); jede trägt den Punkt, an dem die Front sie erreicht (`ex`, `ez`), und die
    // Zelle, von der sie kam (`von`).
    // Die Front ist die KÜRZESTE LAUF-ZEIT über die acht Nachbarn (Finney 2002, FARSITE): fängt eine Zelle, trägt sie ihr Tempo
    // je Richtung (`_brandTempo`, die EINE Funktion von Bett, Wind und Hang) als Ankunft in jede Nachbarin (`_brandZuenden`), die
    // früheste gilt — eine Funktion der Spielzeit, gleich für jede Bildrate. Sie fängt, wo die Welt Feuer fängt (das Brennglas,
    // `_tickFocusingAffordances`), hält, wo kein Bett brennt (Fels, Wasser, Asche) und wo die Nässe das Bett erstickt, und
    // hinterlässt die Tat `brand` (die Asche: ihre Narbe senkt lebendig, auf ihr brennt nichts, bis sie heilt). Nicht
    // persistiert (reaktiv wie das Leben-Overlay), die Asche reist als Tat. Leser: `auraAt` (glut) und die Leuchtquellen.

    // Das Bett einer Zelle → { zeile, leb, x, z, y, boden } oder null: die Zeile der Stoff-Tafel unter ihrer Mitte
    // (`_kontaktStoffAt`), wenn sie ein Brennstoff-Bett trägt (ihre Spalte `brenn`), ihr lebendig (die Vegetation samt Narbe,
    // `auraAt`) als Anteil ihrer Last und die Feuchte ihres Bodens (`_feuchteAt`, die Hydrosphäre: am Ufer und in der Niederung,
    // über dem Spiegel, den der Pegel des Regens hebt) — kein Bett auf Asche, über Wasser (das EINE Urteil `_nassAt`) und unter
    // `minStoff`.
    // DAS BETT, WIE DIE FRONT ES ANTRIFFT (stoffe.K2#2): je Brand misst die Welt jede Zelle EINMAL — Stoff, Last, Boden, Höhe und
    // das Gefälle über die Zelle (`gx`, `gz`, das `_brandTempo` liest) —, erreicht sie die Front wieder (eine zweite Nachbarin
    // brennt), liest sie das Gemessene (`_brandBett`, geleert, wenn ein neuer Brand fängt). Die Asche fragt der Index jedes Mal.
    _brandStoff(cx, cz) {
        const key = cx + "," + cz;
        const je = this._tatIndex().je.get(key);
        if (je && je.some((a) => a.tat === "brand")) return null;
        const M = this._brandBett || (this._brandBett = new Map());
        if (M.has(key)) return M.get(key);
        const cs = AnazhRealm.LIFE_FIELD.cell;
        const [x, z] = [(cx + 0.5) * cs, (cz + 0.5) * cs];
        const leb = this.auraAt(x, z).lebendig;
        let f = null;
        if (leb >= AnazhRealm.BRAND.minStoff && !this._nassAt(x, z)) {
            const y = this._voxelSurfaceY(x, z);
            const zeile = this._stoff(this._kontaktStoffAt(x, z, y));
            if (zeile && zeile.brenn) {
                const h = cs / 2;
                const [gx, gz] = [(this._voxelSurfaceY(x + h, z) - y) / h, (this._voxelSurfaceY(x, z + h) - y) / h];
                f = { zeile, leb, x, z, y, gx, gz, boden: this._feuchteAt(x, z, y) };
            }
        }
        M.set(key, f);
        return f;
    }

    // DIE FEUCHTE DES BETTS AM ORT (stoffe.K2#2) — Wasser je Trocken-Masse des toten Fein-Brennstoffs, EINE Funktion des Bodens
    // (`boden`, die Feuchte der Zelle aus `_brandStoff`) und der EINEN Nässe der Welt (`state.naesse`, wetter.K2): die
    // Luft-Trockene `trocken`; über nassem Boden steht das Bett in gesättigter Luft und nimmt Wasser bis zur Faser-Sättigung
    // `faser` (das Gras am Ufer hält die Front); der Regen legt freies Wasser auf die Faser, bis zu dem, was durchnässte Streu
    // hält (`nass`) — er löscht, wo sie die Erlöschungs-Feuchte des Betts erreicht. Bis stoffe.K2#2 trug die Nässe nur bis zur
    // Faser-Sättigung (0,35) und kein Ort sein eigenes Bett: das Laub fiel im Landregen erst nach 196 s, das Gras am Ufer
    // brannte wie das auf der Kuppe.
    _brandFeuchte(boden) {
        const F = AnazhRealm.BRAND.feuchte;
        return F.trocken + (F.faser - F.trocken) * (boden || 0) + F.nass * (this.state.naesse || 0);
    }

    // DAS TEMPO DER FRONT (stoffe.K2) → { R, ecc, px, pz, tr } oder null (das Bett erstickt): Rothermel 1972 (USDA INT-115) mit
    // Albini 1976 — das Bett aus der Zeile seines Stoffs (σ, Last × lebendig, Tiefe, Heizwert, Erlöschungs-Feuchte `mx`, ρ der
    // Partikel), die Zünd-Wärme Q_ig = c·(T_zünd − T_Luft) + M·(c_w·(100 °C − T_Luft) + L_v) aus derselben Zeile, der des Wassers
    // und der Luft des Temperatur-Felds (`_temperaturAt`); der Wind des EINEN Felds (`_windAt` am Ort zur Uhr des Brands) in der
    // Stärke, die das Gesetz ihm gibt — `sturmMS` bei Böe 1 ist Beaufort (WIND_FELD), also ohne die wandernde Böe und ihre Drift
    // (`_windWob`), die die Front über die Querung einer Zelle (zwei Böen-Perioden) mittelt; die Böe des Zünd-Augenblicks gehalten
    // streute die Köpfe an EINER Pose 0,10–1,14 m/s, ihr Mittel 0,7 statt der Beaufort-Stärke hielt sie bei 0,51 —, in 10 m Höhe
    // (÷ 1,15 auf 20 ft) auf Flammenhöhe (Albini–Baughman 1979 aus der Tiefe des Betts, gedeckelt bei 0,9·I_R), und der Hang (das
    // Gefälle der Oberfläche über die Zelle) addieren als Vektoren zum effektiven φ (BehavePlus). R ist das Tempo der Spitze in
    // m/s längs (px, pz); die Ellipse (Anderson 1983, L/B aus dem effektiven Wind) gibt R(θ) = R·(1 − ecc)/(1 − ecc·cos θ), gegen
    // den Wind das Rückfeuer R·(1 − ecc)/(1 + ecc). tr: die Verweilzeit der Flamme (384/σ min). Die Gleichungen in ihren
    // Einheiten (ft, lb, Btu, min).
    _brandTempo(f, t) {
        const B = AnazhRealm.BRAND;
        const [Z, b] = [f.zeile, f.zeile.brenn];
        const [sig, tiefe, w0] = [b.sigma * 0.3048, b.tiefe / 0.3048, b.last * Math.min(1, f.leb) * 0.204816];
        const beta = w0 / tiefe / (Z.rho * 0.062428);
        const q = beta / (3.348 * sig ** -0.8189);
        const A = 133 * sig ** -0.7913;
        const gam = (sig ** 1.5 / (495 + 0.0594 * sig ** 1.5)) * q ** A * Math.exp(A * (1 - q));
        const M = this._brandFeuchte(f.boden);
        // an der Erlöschungs-Feuchte ist η_M null (Rothermel 1972) — im Gleitkomma blieb das Polynom bei 4·10⁻¹⁶, und das nasse Bett
        // fing mit einem Tempo, das nie ausbrannte (stoffe.K2#2: 3 nasse Zellen am Ufer brannten)
        if (!(M < b.mx)) return null;
        const r = M / b.mx;
        const etaM = 1 - 2.59 * r + 5.11 * r * r - 3.52 * r * r * r;
        const IR = gam * w0 * (1 - B.mineral.gesamt) * b.heiz * 4.2992e-4 * etaM * 0.174 * B.mineral.frei ** -0.19;
        if (!(IR > 0)) return null;
        const [W, luft] = [this._stoff("wasser"), this._temperaturAt(f.y)];
        const Qig = ((Z.tZuend - 273.15 - luft) * Z.c + M * (W.c * (100 - luft) + W.Lv)) * 4.2992e-4;
        const R0 =
            (IR * Math.exp((0.792 + 0.681 * sig ** 0.5) * (beta + 0.1))) /
            (192 + 0.2595 * sig) /
            ((w0 / tiefe) * Math.exp(-138 / sig) * Qig);
        const w = this._windAt(f.x, f.z, t);
        const [C, Bw, E] = [
            7.47 * Math.exp(-0.133 * sig ** 0.55),
            0.02526 * sig ** 0.54,
            0.715 * Math.exp(-3.59e-4 * sig),
        ];
        const u =
            ((w.ms / 1.15 / (w.boe * this._windWob(t))) * 196.85 * 1.83) /
            Math.log((20 + 0.36 * tiefe) / (0.13 * tiefe));
        const phiW = C * Math.min(0.9 * IR, u) ** Bw * q ** -E;
        const [gx, gz] = [f.gx, f.gz];
        const phiS = (5.275 * beta ** -0.3 * (gx * gx + gz * gz)) / (Math.hypot(gx, gz) || 1);
        const [vx, vz] = [phiW * w.x + phiS * gx, phiW * w.z + phiS * gz];
        const phi = Math.hypot(vx, vz);
        const mph = ((phi * q ** E) / C) ** (1 / Bw) / 88;
        const lb = Math.min(B.lbMax, 0.936 * Math.exp(0.2566 * mph) + 0.461 * Math.exp(-0.1548 * mph) - 0.397);
        const ecc = Math.sqrt(Math.max(0, lb * lb - 1)) / lb;
        return { R: R0 * (1 + phi) * 0.00508, ecc, px: phi ? vx / phi : 1, pz: phi ? vz / phi : 0, tr: 23040 / sig };
    }

    // Die Zelle unter (x, z) fängt Feuer → die Zelle oder null (sie brennt schon, trägt kein Bett, die Welt ist zu nass).
    _brandEntfachen(x, z) {
        const st = this.state;
        const bf = st.brandFeld || (st.brandFeld = new Map());
        const cs = AnazhRealm.LIFE_FIELD.cell;
        const [cx, cz] = [Math.floor(x / cs), Math.floor(z / cs)];
        const n = bf.get(cx + "," + cz);
        if (n && n.t0 !== null) return null;
        // ein neuer Brand misst sein Bett neu, und nichts eines alten wartet
        if (!bf.size)
            [this._brandUhr, this._brandBett, this._brandRest, bf.glutBlock] = [st.spielZeit, null, null, null];
        return this._brandZuenden(cx, cz, st.spielZeit, x, z);
    }

    // Die Front erreicht die Zelle zur Zeit t am Punkt (ex, ez) ihres Rands (der Herd: am Ort der Tat). Ihr Bett und ihr Tempo
    // tragen die Front weiter, als Welle vom Eintrittspunkt (Huygens): die Zeit bis zu einem Punkt v ist
    // (|v| − ecc·v·ψ) / (R·(1 − ecc)) — die Ellipse mit dem Herd im Brennpunkt —, und jede Nachbarin, die noch nicht brennt,
    // erhält die Ankunft am ersten Punkt ihrer Fläche, den die Welle berührt (das Minimum über Ecken, Kanten-Mitten, den nächsten
    // Punkt und den Eintritt der Achse) — die frühere gewinnt. So läuft die Spitze längs ihrer Achse durch die Zellen, die sie
    // kreuzt, in ihrem Tempo, wie schmal die Ellipse auch ist (an den Mitten gemessen verlor das Gitter der acht Nachbarn 75 %
    // der Spitze). Die Zelle brennt, bis die Spitze sie längs ihres Kopfs durchquert hat (bis an ihre fernste Ecke), und die
    // Flamme ihre Verweilzeit; was langsamer in sie zurückläuft (Flanke, Rückfeuer), trägt die Ankunft ihrer Nachbarinnen, nicht
    // ihr Brennen. Ohne Bett oder Tempo fällt sie aus dem Feld (null).
    _brandZuenden(cx, cz, t, ex, ez) {
        const bf = this.state.brandFeld;
        const key = cx + "," + cz;
        const f = this._brandStoff(cx, cz);
        const T = f && this._brandTempo(f, t);
        if (!T || !(T.R > 0)) {
            bf.delete(key);
            return null;
        }
        const cs = AnazhRealm.LIFE_FIELD.cell;
        const k = 1 / (T.R * (1 - T.ecc));
        const zeit = (x, z) => (Math.hypot(x - ex, z - ez) - T.ecc * ((x - ex) * T.px + (z - ez) * T.pz)) * k;
        // die erste Berührung der Fläche [x0, x0 + cs] × [z0, z0 + cs] → [Zeit, x, z]
        const ankunft = (x0, z0) => {
            const [x1, z1] = [x0 + cs, z0 + cs];
            const P = [
                [x0, z0],
                [x1, z0],
                [x0, z1],
                [x1, z1],
                [x0 + cs / 2, z0],
                [x0 + cs / 2, z1],
                [x0, z0 + cs / 2],
                [x1, z0 + cs / 2],
            ];
            P.push([Math.min(x1, Math.max(x0, ex)), Math.min(z1, Math.max(z0, ez))]);
            const sx = T.px ? [(x0 - ex) / T.px, (x1 - ex) / T.px] : [0, 0];
            const sz = T.pz ? [(z0 - ez) / T.pz, (z1 - ez) / T.pz] : [0, 0];
            const s = Math.max(0, Math.min(...sx), Math.min(...sz));
            const [ax, az] = [ex + s * T.px, ez + s * T.pz];
            if (ax >= x0 - 1e-6 && ax <= x1 + 1e-6 && az >= z0 - 1e-6 && az <= z1 + 1e-6) P.push([ax, az]);
            let best = null;
            for (const [x, z] of P) {
                const z0t = zeit(x, z);
                if (!best || z0t < best[0]) best = [z0t, x, z];
            }
            return best;
        };
        const [x0, z0] = [cx * cs, cz * cs];
        const quer = Math.max(
            ...[x0, x0 + cs].flatMap((x) => [z0, z0 + cs].map((z) => (x - ex) * T.px + (z - ez) * T.pz))
        );
        const zelle = Object.assign(bf.get(key) || { cx, cz, y: null }, {
            t0: t,
            an: t,
            ende: t + quer / T.R + T.tr,
            glut: 0,
            mx: f.zeile.brenn.mx,
            boden: f.boden,
            y: f.y,
            stoff: f.zeile.name,
            ex,
            ez,
            R: T.R,
            kopf: [T.px, T.pz],
            ecc: T.ecc,
            tr: T.tr,
            gx: f.gx,
            gz: f.gz,
            // H·w (kJ/m²): die Wärme des Betts je Fläche — mal dem Tempo die Intensität der Front (Byram), die das Bild liest
            iw: (f.zeile.brenn.heiz / 1000) * f.zeile.brenn.last * Math.min(1, f.leb),
        });
        bf.set(key, zelle);
        for (const [dx, dz] of AnazhRealm.BRAND.nachbarn) {
            const nk = cx + dx + "," + (cz + dz);
            const n = bf.get(nk);
            if (n && n.t0 !== null) continue;
            const [dt, ax, az] = ankunft(x0 + dx * cs, z0 + dz * cs);
            if (n && n.an <= t + dt) continue;
            const neu = n || { cx: cx + dx, cz: cz + dz, y: null, glut: 0, t0: null };
            bf.set(nk, Object.assign(neu, { an: t + dt, ex: ax, ez: az, mx: zelle.mx, boden: zelle.boden, von: key }));
        }
        return zelle;
    }

    // DER TAKT DES BRANDS: ohne Feuer kein Schritt und keine Arbeit (Ruhe ist Null); sonst je `schrittS` Spielzeit EIN Schritt
    // über die Zellen des Feuers — es kostet, was brennt (Lehre 25), die Welt drumherum nie. DIE ARBEIT EINES SCHRITTS IST GETEILT
    // (stoffe.K2#2): die Aschen und die Zündungen, die er findet (`_brandSchritt`), geht der Takt in seinem Budget je Bild
    // (`BRAND.budgetMs`, mindestens `BRAND.mindestJeBild` Stück), den Rest im nächsten (`_brandArbeit`); der nächste Schritt beginnt
    // erst, wenn der vorige ganz ist, und jede Zelle fängt zur Zeit ihrer Ankunft, nie zur Zeit des Bilds. Bis stoffe.K2#2 ging ein
    // Schritt in einem Bild: 2 000 brennende Zellen kosteten 7,4 ms (headless, Radeon-Laptop), die Aschen eines Schritts zusammen.
    _tickBrand() {
        const bf = this.state.brandFeld;
        if (!bf || !bf.size) return;
        const B = AnazhRealm.BRAND;
        const frist = performance.now() + B.budgetMs;
        while (this._brandArbeit(frist) && bf.size && this.state.spielZeit - this._brandUhr >= B.schrittS)
            this._brandSchritt((this._brandUhr += B.schrittS));
        if (!bf.size && !this._brandRest) this._brandBett = null; // erloschen: das Gemessene fällt
    }

    // Ein Schritt zur Spielzeit t: wo die Feuchte das Bett erstickt (die Feuchte am Ort der Zelle über ihrem `mx`, der Front die
    // ihrer Quelle), erlischt das Feuer; jede brennende Zelle glüht auf (die glühenden lesen Licht, Rauch und Ohr: `glutBlock`) und
    // fällt ausgebrannt als Asche; die Front erreicht die fälligen Zellen in der Folge ihrer Ankunft — die Arbeit (Aschen, Zündungen)
    // liegt danach in `_brandRest`.
    _brandSchritt(t) {
        const bf = this.state.brandFeld;
        const [aschen, faellig, glueht] = [[], [], []];
        for (const [key, z] of bf) {
            const M = this._brandFeuchte(z.boden);
            if (M < z.mx && z.t0 === null) {
                if (z.an <= t) faellig.push(z);
                continue;
            }
            if (M < z.mx && t < z.ende) {
                z.glut = Math.min(1, (t - z.t0) / AnazhRealm.BRAND.aufS);
                if (z.glut > 0) glueht.push(z);
                continue;
            }
            bf.delete(key);
            if (z.t0 !== null) aschen.push(z);
        }
        faellig.sort((a, b) => a.an - b.an);
        // die glühenden je Block von `blockZellen`² Zellen: die Leser fragen nur die Blöcke um ihren Ort (`_brandGlutUm`)
        const G = new Map();
        const K = AnazhRealm.BRAND.blockZellen;
        for (const z of glueht) {
            const k = Math.floor(z.cx / K) + "," + Math.floor(z.cz / K);
            const L = G.get(k);
            if (L) L.push(z);
            else G.set(k, [z]);
        }
        bf.glutBlock = G;
        this._brandRest = { t, aschen, faellig, i: 0 };
    }

    // Die glühenden Zellen des letzten Schritts in den Blöcken um (x, z) bis R — `fn(zelle)` je Zelle, die feine Prüfung trägt der
    // Leser (das Licht, der Rauch, das Ohr). Die Kosten tragen die Blöcke um den Ort, nie der ganze Brand (Gebot 7).
    _brandGlutUm(x, z, R, fn) {
        const bf = this.state.brandFeld;
        const G = bf && bf.size ? bf.glutBlock : null;
        if (!G || !G.size) return;
        const K = AnazhRealm.LIFE_FIELD.cell * AnazhRealm.BRAND.blockZellen;
        for (let bz = Math.floor((z - R) / K), z1 = Math.floor((z + R) / K); bz <= z1; bz++)
            for (let bx = Math.floor((x - R) / K), x1 = Math.floor((x + R) / K); bx <= x1; bx++) {
                const L = G.get(bx + "," + bz);
                if (L) for (const b of L) fn(b);
            }
    }

    // Die Arbeit des angefangenen Schritts bis zur Frist (`performance.now`; mindestens `mindestJeBild` Stück): zuerst die Aschen
    // (jede misst den Wuchs ihres Orts mit der Feuchte, die ihr Bett schon trägt — `_tatDauer` liest `w`), dann die Zündungen in
    // der Folge ihrer Ankunft. Rückgabe: ob der Schritt ganz ist.
    _brandArbeit(frist) {
        const R = this._brandRest;
        if (!R) return true;
        const [B, cs, bf] = [AnazhRealm.BRAND, AnazhRealm.LIFE_FIELD.cell, this.state.brandFeld];
        const n = R.aschen.length;
        for (let k = 0; R.i < n + R.faellig.length; R.i++, k++) {
            if (k >= B.mindestJeBild && performance.now() > frist) return false;
            if (R.i < n) {
                const z = R.aschen[R.i];
                const [ax, az] = [(z.cx + 0.5) * cs, (z.cz + 0.5) * cs];
                this._tatSchreiben("brand", ax, az, { w: Math.round(this._wuchsAt(ax, az, z.boden) * 1e3) / 1e3 });
                continue;
            }
            const z = R.faellig[R.i - n];
            if (z.t0 === null && bf.get(z.cx + "," + z.cz) === z) this._brandZuenden(z.cx, z.cz, z.an, z.ex, z.ez);
        }
        this._brandRest = null;
        return true;
    }

    // Der Ort einer glühenden Zelle für ihre Leser (Licht, Rauch): über ihrer Mitte, gemessen beim ersten Lesen.
    _brandOrt(b) {
        const cs = AnazhRealm.LIFE_FIELD.cell;
        const [x, z] = [(b.cx + 0.5) * cs, (b.cz + 0.5) * cs];
        const y = (b.y != null ? b.y : this._voxelSurfaceY(x, z) || 0) + 1;
        const phase = (((x * 12.9898 + z * 78.233) % 6.2832) + 6.2832) % 6.2832;
        return (b.ort = { x, y, z, phase, brand: true, id: "brand:" + b.cx + "," + b.cz });
    }

    // DAS BILD DES BRANDS (stoffe.K2#2): jede glühende Zelle um das Auge (`_brandGlutUm` bis `BRAND.bild.weiteM` — dieselben
    // Zellen in demselben Zustand, den Licht, Ohr und Asche lesen) zeichnet ihre FLAMMEN auf ihrer Front und ihren RAUCH als
    // Fahne. DIE FRONT einer Zelle zur Spielzeit t ist die Ellipse ihres Eintritts (`_brandZuenden`: der Brennpunkt am Eintritt,
    // die Spitze längs `kopf`): r(θ) = (t − t0)·R(θ), R(θ) = R·(1 − ecc)/(1 − ecc·cos θ). Die Flammen stehen auf ihr, soweit sie
    // in der Zelle liegt, je eine halbe Länge auseinander; die Länge nach Byram 1959 (L = 0,0775·I^0,46, I = H·w·R(θ) in kW/m aus
    // der Zeile des Betts), geneigt mit dem EINEN Wind (Froude: tan φ = u/√(g·L)), flackernd nach dem Datum des Feuer-Lichts
    // (fachwerk `lichtFlackern`), Gestalt und Ton aus dem Flammen-Gesetz des Fachwerks (`FLAMME`, wie die Feuerstelle). DER RAUCH
    // ist eine Linien-Fahne (Morton–Taylor–Turner 1956): je glühende Zelle Ballen im Takt ihrer Glut von ihren Flammen, sie
    // steigen mit der Auftriebs-Geschwindigkeit der Front w = (g·I/(ρ·c·T))^⅓, wachsen mit der Höhe (b = b0 + α·Δz), verdünnen
    // (Deckung ∝ b0/b) und ziehen mit dem Wind. Bis w3v-brand-bild las nur der Kamin-Rauch die Zelle (Kistchen à 0,34 m, 26 für
    // jede Quelle der Welt: ein Faden, durch den die Krone schien), und keine Flamme stand im Bild — nur der Fleck des Lichts.
    _brandBild(dt) {
        const st = this.state;
        const auge = st.camera ? st.camera.position : st.playerMesh && st.playerMesh.position;
        // die Flammen des Bilds aus dem Vorrat der Instanz (je Bild keine neuen Objekte: der Müll trüge die Spitzen)
        const [fl, vorrat] = [
            this._brandFlammen || (this._brandFlammen = []),
            this._flammenVorrat || (this._flammenVorrat = []),
        ];
        fl.length = 0;
        const qu = [];
        const [B, K, t] = [AnazhRealm.BRAND.bild, AnazhRealm.LIFE_FIELD.cell, st.spielZeit];
        const FW = globalThis.__fachwerkCore;
        const L = FW.LICHT_GESETZ.feuer;
        // das Flackern des Licht-Gesetzes in `flackerPhasen` Phasen je Bild (jede Flamme trägt eine), die Winkel der Front je
        // Abtastung N EINMAL (cos, sin, gemerkt an der Instanz)
        const P = B.flackerPhasen;
        const fla = Array.from(
            { length: P },
            (_, k) => 1 + L.flacker.amp * FW.lichtFlackern(L, this._bildZeit, (2 * Math.PI * k) / P)
        );
        const tafeln = this._brandWinkel || (this._brandWinkel = new Map());
        const tafel = (N) => {
            if (!tafeln.has(N))
                tafeln.set(
                    N,
                    Array.from({ length: 2 * N + 2 }, (_, i) =>
                        Math[i % 2 ? "sin" : "cos"](Math.PI * ((2 * (i >> 1)) / N - 1))
                    )
                );
            return tafeln.get(N);
        };
        // der Wind je Zelle des Felds EINMAL je Bild und Uhr (seine Form hängt an der Zelle, die Böe wandert über 100 m) — die
        // Flammen lesen ihn zur Uhr des Brands, die Fahne zur Bild-Uhr
        const WM = new Map();
        const wind = (x, z, uhr) => {
            const M = WM.get(uhr) || WM.set(uhr, new Map()).get(uhr);
            const k = (Math.floor(x / 16) + 32768) * 65536 + Math.floor(z / 16) + 32768;
            let w = M.get(k);
            if (!w) M.set(k, (w = this._windAt(x, z, uhr)));
            return w;
        };
        // die brennenden Zellen im Bild, die nächste zuerst: die Deckel der Flammen und der Fahne fallen fern, nie nah
        const [Z, paare] = [[], this._brandUmVorrat || (this._brandUmVorrat = [])];
        if (auge)
            this._brandGlutUm(auge.x, auge.z, B.weiteM, (b) => {
                const d = Math.hypot((b.cx + 0.5) * K - auge.x, (b.cz + 0.5) * K - auge.z);
                if (!(b.t0 !== null && b.R > 0 && t > b.t0 && d <= B.weiteM)) return;
                const e = paare[Z.length] || (paare[Z.length] = [0, null]);
                e[0] = d;
                e[1] = b;
                Z.push(e);
            });
        Z.sort((u, v) => u[0] - v[0]);
        for (const [d, b] of Z) {
            if (fl.length >= B.flammenMax || qu.length >= B.zellenMax) break;
            const [x0, z0, xc, zc] = [b.cx * K, b.cz * K, (b.cx + 0.5) * K, (b.cz + 0.5) * K];
            const [px, pz] = b.kopf;
            const w = wind(xc, zc, t);
            const u = w.ms * B.flammenWind;
            const n0 = fl.length;
            // die Front fern gröber abgetastet (die Kosten tragen der Schirm und die Nähe, Gebot 7), eine junge nach ihrem Umfang
            // (höchstens 2π·R·Alter, je Flamme mindestens `abstandMinM`)
            const umfang = Math.ceil((2 * Math.PI * b.R * (t - b.t0)) / B.abstandMinM);
            const N = Math.max(B.winkelMin, Math.min(B.winkel, Math.round((B.winkel * B.nahM) / d), umfang));
            const wt = tafel(N);
            let [s, naechste, vx, vz] = [0, 0, null, null];
            for (let i = 0; i <= N; i++) {
                const [c, sn] = [wt[2 * i], wt[2 * i + 1]];
                const Rt = (b.R * (1 - b.ecc)) / (1 - b.ecc * c);
                const r = (t - b.t0) * Rt;
                const [x, z] = [b.ex + r * (px * c - pz * sn), b.ez + r * (pz * c + px * sn)];
                if (vx !== null) s += Math.sqrt((x - vx) * (x - vx) + (z - vz) * (z - vz));
                [vx, vz] = [x, z];
                if (s < naechste || x < x0 || x >= x0 + K || z < z0 || z >= z0 + K) continue;
                const lang = 0.0775 * Math.pow(b.iw * Rt, 0.46);
                naechste = s + Math.max(B.abstandMinM, B.abstand * lang);
                const phase = (((x * 12.9898 + z * 78.233) % 6.2832) + 6.2832) % 6.2832;
                const f = vorrat[fl.length] || (vorrat[fl.length] = {});
                f.x = x;
                f.y = b.y + b.gx * (x - xc) + b.gz * (z - zc);
                f.z = z;
                f.lang = lang * fla[Math.floor((phase / 6.2832) * P) % P];
                f.kipp = Math.atan(u / Math.sqrt(9.81 * lang));
                f.wx = w.x;
                f.wz = w.z;
                f.dreh = phase;
                f.I = b.iw * Rt;
                fl.push(f);
            }
            if (fl.length > n0) qu.push({ b, von: n0, bis: fl.length });
        }
        this._brandFlammenZeichnen(fl);
        this._brandRauch(dt, qu, wind);
    }

    // DIE FAHNE DES BRANDS (`_brandBild`): `qu` die glühenden Zellen mit ihren Flammen [von, bis) im Bild. Je Zelle und Sekunde
    // `rauch.jeS` × Glut Ballen an einer ihrer Flammen (der Same ist der Zähler der Fahne, kein Zufall der Bild-Uhr), höchstens
    // `rauch.max` im Himmel (der älteste weicht dem neuen); jeder steigt, wächst, verdünnt und zieht (`_windAt` am Ballen).
    _brandRauch(dt, qu, wind = (x, z, uhr) => this._windAt(x, z, uhr)) {
        const st = this.state;
        const R = AnazhRealm.BRAND.bild.rauch;
        const T = st.brandRauch.teilchen;
        const s = Number.isFinite(dt) && dt > 0 ? Math.min(dt, 0.1) : 0;
        const fl = this._brandFlammen;
        // das Budget der Fahne: `max` Ballen über alle Zellen ihres Lebens lang — trägt ein großer Brand mehr Zellen, als es
        // fasst, steigt je Zelle seltener ein größerer Ballen (bis `kMax`: dieselbe Deckung der Fläche); bis w3v-brand-bild schob
        // jeder neue den ältesten aus dem Himmel, und die Fahne eines großen Brands stieg nie
        const anteil = R.max / (Math.max(1, qu.length) * R.lebenS);
        for (const q of qu) {
            const voll = R.jeS * q.b.glut;
            const rate = Math.min(voll, anteil);
            const k = rate > 0 ? Math.min(R.kMax, Math.sqrt(voll / rate)) : 1;
            q.b.rauchSchuld = (q.b.rauchSchuld || 0) + rate * s;
            for (; q.b.rauchSchuld >= 1; q.b.rauchSchuld--) {
                if (T.length >= R.max) T.shift(); // die ältesten Ballen verwehen, der Fuß der Fahne bleibt dicht
                const h = Math.imul(++st.brandRauch.n, 2654435761) >>> 0;
                const f = fl[q.von + (h % (q.bis - q.von))];
                T.push({
                    x: f.x,
                    y: f.y + f.lang,
                    z: f.z,
                    y0: f.y + f.lang,
                    b0: R.b0 * f.lang * k,
                    s: R.b0 * f.lang * k,
                    w: Math.min(R.wMax, Math.cbrt((9.81 * f.I * 1000) / (1.2 * 1005 * 300))),
                    a: R.a0,
                    alt: 0,
                });
            }
        }
        for (let k = T.length - 1; k >= 0; k--) {
            const p = T[k];
            const w = wind(p.x, p.z, this._bildZeit);
            p.y += p.w * s;
            p.x += w.x * w.ms * s;
            p.z += w.z * w.ms * s;
            p.alt += s;
            p.s = p.b0 + R.alpha * (p.y - p.y0);
            p.a = (R.a0 * p.b0) / p.s;
            if (p.a < R.aKill || p.alt > R.lebenS) T.splice(k, 1);
        }
        this._rauchZeichnen(R, T, "brandRauchSatz");
    }

    // Die Flammen des Bilds (`_brandBild`) als EIN Satz: die Zunge des Flammen-Gesetzes (fachwerk `FLAMME`) als Drehkörper mit
    // dem Ton von der Wurzel zur Spitze, leuchtend (Ton × leucht, additiv, die Spitze verlischt), je Flamme ihre Matrix (Ort,
    // Neigung in den Wind, Drehung, Länge; Breite `bild.breite` × Länge).
    _brandFlammenZeichnen(fl) {
        const st = this.state;
        let S = st.brandFlammenSatz;
        if ((!S && !fl.length) || typeof THREE === "undefined" || !st.scene) return;
        const B = AnazhRealm.BRAND.bild;
        if (!S) {
            const F = globalThis.__fachwerkCore.FLAMME;
            const geo = new THREE.LatheGeometry(
                F.zunge.map(([r, y]) => new THREE.Vector2(r, y)),
                B.zungeSegmente
            );
            const P = geo.attributes.position;
            const [ton, deck] = [new Float32Array(P.count * 3), new Float32Array(P.count)];
            for (let i = 0; i < P.count; i++) {
                const y = P.getY(i);
                for (let c = 0; c < 3; c++) ton[3 * i + c] = (F.ton[c][0] - F.ton[c][1] * y) * F.leucht;
                deck[i] = Math.pow(1 - y, B.spitze);
            }
            geo.setAttribute("aTon", new THREE.BufferAttribute(ton, 3));
            geo.setAttribute("aDeck", new THREE.BufferAttribute(deck, 1));
            const T = THREE.TSL;
            const mat = new THREE.MeshBasicNodeMaterial({
                transparent: true,
                depthWrite: false,
                blending: THREE.AdditiveBlending,
                side: THREE.DoubleSide,
            });
            mat.colorNode = T.vec4(T.attribute("aTon", "vec3"), T.attribute("aDeck", "float"));
            const mesh = AnazhRealm._instanzMesh(geo, mat, B.flammenMax);
            mesh.name = "brand-flammen";
            mesh.userData.inventar = "brand"; // Identitäts-Stempel (gate:asset-inventory: Welt-Substanz)
            mesh.castShadow = false;
            mesh.receiveShadow = false;
            mesh.frustumCulled = false;
            AnazhRealm._instanzZahl(mesh, 0);
            st.scene.add(mesh);
            S = st.brandFlammenSatz = { mesh };
        }
        const n = Math.min(fl.length, B.flammenMax);
        const M = S.mesh.instanceMatrix.array;
        for (let k = 0; k < n; k++) {
            const f = fl[k];
            // die Matrix der Flamme, gerechnet statt komponiert: R = Neigung um die Achse quer zum Wind (Rodrigues, a = hoch ×
            // Wind) · die eigene Drehung der Zunge um die Hochachse, die Spalten × Breite, Länge, Breite, dann der Ort
            const wl = Math.hypot(f.wx, f.wz) || 1;
            const [ax, az, cp, sp, cd, sd] = [f.wz / wl, -f.wx / wl, Math.cos(f.kipp), Math.sin(f.kipp), Math.cos(f.dreh), Math.sin(f.dreh)]; // prettier-ignore
            const v = 1 - cp;
            const T = [
                cp + v * ax * ax,
                -sp * az,
                v * ax * az,
                sp * az,
                cp,
                -sp * ax,
                v * ax * az,
                sp * ax,
                cp + v * az * az,
            ];
            const [b, l, o] = [B.breite * f.lang, f.lang, 16 * k];
            for (let r = 0; r < 3; r++) {
                M[o + r] = (T[3 * r] * cd - T[3 * r + 2] * sd) * b;
                M[o + 4 + r] = T[3 * r + 1] * l;
                M[o + 8 + r] = (T[3 * r] * sd + T[3 * r + 2] * cd) * b;
            }
            [M[o + 3], M[o + 7], M[o + 11], M[o + 12], M[o + 13], M[o + 14], M[o + 15]] = [0, 0, 0, f.x, f.y, f.z, 1];
        }
        AnazhRealm._instanzZahl(S.mesh, n);
        if (n > 0) S.mesh.instanceMatrix.needsUpdate = true;
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
    // ihre Dauer: die Stunden ihrer Klasse (`TAT_NARBE`) durch den Wuchs des Orts (Feuchte × Licht, `_tatDauer`, stoffe.K5), gleich
    // für jeden Reload; geheilt fällt sie (`_tickScatterRegrow`). Bis feld.K4 lebte die Ernte im Session-Gedächtnis
    // (FORAGE.regrowMs, 300 s Wanduhr), das Fällen schrieb nichts ins Feld (Mess-Wiese, Null-Renderer, main f7dd313c: 8 Bäume
    // und 23 Pflanzen mit tryMouseBreak — Δlebendig 0, kein Stumpf, nach dem Reload 23 von 23 Pflanzen zurück).

    // DIE WELT-STUNDE: Stunden seit dem ersten Tag der Welt — ihr Tag (`worldMeta.tag`, `_uhrSetzen` zählt ihn) und die Uhr.
    _weltStunde() {
        const st = this.state;
        return 24 * (((st.worldMeta && st.worldMeta.tag) || 0) + (st.timeOfDay || 0));
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
            if (a.tat === "ernten" && typeof a.kachel === "string") {
                if (!J.kachel.has(a.kachel)) J.kachel.set(a.kachel, new Set());
                J.kachel.get(a.kachel).add(a.id);
            }
        }
        J.baut = false;
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
    // heilt (sein Jungwuchs, der Wurf in der Prägung `ov` mit dem Alter des Orts, `_baumAlter`, steht), wo ein Wurf abgebaut
    // wurde, für immer: die Promotion, die Streu und jeder Wurf durch `_naturSetzen` fragen hier.
    _tatSperrt(x, z, ov) {
        if (this._tatAm("abbauen", x, z)) return true;
        return this._tatAm("faellen", x, z) && !(ov && ov.alter > 0 && ov.alter === this._baumAlter(x, z));
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
    max: 0.6,
    lebMin: 0.1,
});
AnazhRealm.TAT_LEER = Object.freeze(new Set()); // die Kachel ohne Ernte (`_geerntetIn`)

// Die Scheibe des Todes-Rads einer Feld-Karte in Spielzeit-Sekunden (`_feldTod`): eine tote Zelle liegt höchstens so lange
// über ihrem Tod in der Karte (gelesen ist sie schon tot); FELD_LEER die fehlende Zelle.
AnazhRealm.FELD_TOD_EIMER_S = 8;
AnazhRealm.FELD_LEER = Object.freeze({});

// BRAND — das Feuer auf dem Feld (stoffe.K2 · feld.K3#2, `_tickBrand`): der Takt zieht je `schrittS` Spielzeit EINEN Schritt; eine
// Zelle glüht in `aufS` auf, unter `minStoff` lebendig trägt sie kein Bett. Das Bett selbst ist die Zeile seines Stoffs (die
// Spalte `brenn` der Stoff-Tafel, `_brandTempo`); hier steht nur, was kein Stoff trägt: die Feuchte des toten Fein-Brennstoffs
// (`feuchte`, `_brandFeuchte`: luft-trocken an einem klaren Tag 6 %, über nassem Boden bis zur Faser-Sättigung 35 %, Rothermel
// 1972, Anderson 1982; der Regen als freies Wasser bis zu dem, was durchnässte Streu hält, 250 %, Matthews 2006 — im Landregen
// erstickt das Gras nach 6 s, das Laub nach 20 s, im Sturm nach 4 und 12 s), der Mineral-Anteil der Partikel (gesamt, kieselfrei; Rothermel 1972, gleich für jedes Modell), das größte L/B der
// Ellipse (Anderson 1983) und die acht Nachbarn der Front. Glut leuchtet als Feuer (LICHT_GESETZ.feuer, Masse `licht` × Glut)
// und hebt glut in `auraAt`.
AnazhRealm.BRAND = Object.freeze({
    schrittS: 1,
    aufS: 4,
    minStoff: 0.15,
    licht: 4,
    budgetMs: 0.25, // so viel Arbeit eines Schritts geht je Bild (`_brandArbeit`) …
    mindestJeBild: 8, // … und mindestens so viele Aschen und Zündungen (ein kleiner Brand geht seinen Schritt in einem Bild)
    blockZellen: 4, // die Leser fragen die glühenden Zellen je Block von 4 × 4 Zellen (64 m, `_brandGlutUm`)
    hoerM: 256, // so weit hört das Ohr den Brand knistern (`_glutAmOhr`)
    // das Bild (`_brandBild`): bis `weiteM` um das Auge, die Front in `winkel` Schritten abgetastet (jenseits von `nahM` je
    // Abstand gröber, nie unter `winkelMin`), je Flamme ein Abstand von
    // `abstand` × ihrer Länge (mindestens `abstandMinM`), höchstens `flammenMax` je Bild aus höchstens `zellenMax` Zellen, die
    // nächsten zuerst (ein Brand von 2 000 Zellen kostet das Bild, nie die Welt); das Flackern in `flackerPhasen`; `flammenWind` der Wind auf Flammenhöhe je Wind
    // in 10 m (Albini–Baughman 1979, offenes Gras); die Zunge in `zungeSegmente` Kanten, `breite` × Länge breit, ihre Deckung
    // fällt zur Spitze mit (1 − h)^spitze. Der Rauch: `jeS` Ballen je Zelle und Sekunde bei voller Glut, höchstens `max` (ein
    // großer Brand je Zelle seltener, bis `kMax` × größer), die Ballen beginnen mit `b0` × Flammen-Länge, wachsen um `alpha` je Meter Steigen, decken anfangs `a0` und fallen unter
    // `aKill` oder nach `lebenS`; Steigen höchstens `wMax` m/s; der Satz (Ballen, Stoff `color`, Kante `size`, Gestalt `form`)
    bild: Object.freeze({
        weiteM: 160,
        winkel: 96,
        winkelMin: 4,
        nahM: 12,
        abstand: 0.45,
        abstandMinM: 0.5,
        flammenMax: 384,
        zellenMax: 32,
        flackerPhasen: 8,
        flammenWind: 0.4,
        zungeSegmente: 6,
        breite: 0.42,
        spitze: 0.8,
        rauch: Object.freeze({
            jeS: 8,
            max: 600,
            b0: 0.6,
            alpha: 0.16,
            a0: 0.82,
            aKill: 0.08,
            lebenS: 25,
            kMax: 3,
            wMax: 7,
            color: 0x8d8881,
            size: 1,
            form: "ballen",
            maxTeilchen: 600,
            name: "brand-rauch",
            inventar: "brand",
        }),
    }),
    // die Grenze der Narbe (`_brandNarbe`): das Rauschen je Oktave (Wellenlänge m, Hub im Anteil der Zellen am Rand — der Hub
    // verschiebt die Kante um bis zu 4 m, eine halbe Zelle) und die Breite, über die sie fällt (0,18 im Anteil: ~2 m angesengter Saum)
    narbe: Object.freeze({ lambda: Object.freeze([14, 5]), amp: Object.freeze([0.7, 0.25]), band: 0.18 }),
    feuchte: Object.freeze({ trocken: 0.06, faser: 0.35, nass: 2.5 }),
    mineral: Object.freeze({ gesamt: 0.0555, frei: 0.01 }),
    lbMax: 8,
    nachbarn: Object.freeze(
        [
            [1, 0],
            [-1, 0],
            [0, 1],
            [0, -1],
            [1, 1],
            [1, -1],
            [-1, 1],
            [-1, -1],
        ].map(Object.freeze)
    ),
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
