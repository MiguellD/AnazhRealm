class AnazhRealm_kreatur_verhalten {
    // ===== ATLAS · Kreatur/verhalten — Aufgaben · Scheu · Jagd · Rudel · Kreatur-Takt =====
    _getCreatureTask(creature) {
        if (!creature) return null;
        const ud = creature.userData;
        if (!ud || !ud.task || typeof ud.task !== "object") return null;
        const task = ud.task;
        if (!task.name || !AnazhRealm.CREATURE_TASKS.includes(task.name)) return null;
        return task;
    }

    assignCreatureTask(creature, taskName, args = {}, options = {}) {
        if (!creature) return false;
        if (!AnazhRealm.CREATURE_TASKS.includes(taskName)) {
            this.log(`assignCreatureTask: unbekannter Task '${taskName}'`, "WARNING");
            return false;
        }
        const prev = this._getCreatureTask(creature);
        const prevName = prev && prev.name;
        creature.userData = creature.userData || {};
        creature.userData.task = {
            name: taskName,
            args: args && typeof args === "object" ? args : {},
            since: performance.now() / 1000,
        };
        this._refreshCreatureTaskAura(creature);
        // Welle 6.H V2 — Vision-Antwort bei echtem Task-Wechsel. `silent` ist
        // für Spawn-Defaults + Test-Reset, damit das Init nicht 10 Rufe
        // hagelt und das Journal nicht mit Default-Wechseln flutet.
        const antwortet = !options.silent && prevName && prevName !== taskName;
        if (antwortet) this._journalCreatureTask(creature, taskName, prevName);
        // V17.30 — eine Kreatur bindet sich (folgt dem Spieler) → peace + joy
        // (Beziehung, Pfeiler 1). Nur die echte Spieler-Geste (nicht silent =
        // Spawn-Default/Test-Reset).
        if (!options.silent && taskName === "follow_player" && prevName !== "follow_player") {
            this._feelAction("bond", { creature });
            // W4 (V17.48) — die „folge mir"-Geste vertieft die Bindung (ein Sprung; sie
            // wächst dann weiter, während die Kreatur nah folgt — _tickEmotionContagion).
            if (creature.userData) {
                creature.userData.bond = Math.min(
                    1,
                    (creature.userData.bond || 0) + AnazhRealm.EMOTION_CONTAGION.bondFollowBump
                );
            }
        }
        // Die Antwort auf die Geste ist die STIMME des Tiers (klang:UMWELT.tier: Grundton aus seinem Körper, Kontur aus
        // seiner Stimmung — nach der Bindung —, am Ort über der Hörschwelle); das Lösen der Bindung (wander) bleibt still.
        if (antwortet && taskName !== "wander") this._tierRuf(creature);
        if (typeof this._renderTaskStatusUI === "function") this._renderTaskStatusUI();
        this._uiDirty("hof"); // W3 (V18.176) — der UI-Puls (war _renderCreatureListUI direkt)
        return true;
    }

    // Vision §1.1 — Welt erinnert sich an die Beziehungs-Geste. Pro echtem
    // Task-Wechsel ein „relationship"-Journal-Eintrag. NICHT idempotent —
    // jeder Ruf „folge mir" ist eine eigene Geste, das Journal trägt jede.
    _journalCreatureTask(creature, taskName, prevName) {
        if (typeof this.journalAppend !== "function") return;
        const labels = {
            wander: "streift wieder frei",
            follow_player: "schließt sich an",
            wait: "harrt",
            gather: "sucht Material",
            build: "wird zur Schöpferin",
            drink: "sucht Wasser am Ufer",
        };
        this.journalAppend(
            "relationship",
            AnazhRealm._datum`Eine Kreatur ${labels[taskName] || "ändert ihren Auftrag"}.`,
            {
                task: taskName,
                from: prevName,
                creatures_total: this.state.creatures.length,
            }
        );
    }

    assignTaskToNearestCreature(toPos, taskName, args = {}, maxDist = 60) {
        const target = this.findNearestCreature(toPos, maxDist);
        if (!target) {
            // Leerschläge nie stumm: der Spieler erfährt den Grund per Chat-Output UND Welt-Journal.
            if (typeof document !== "undefined") {
                const chatOutput = document.getElementById("chat-output");
                if (chatOutput) {
                    const line = document.createElement("div");
                    line.textContent = "(Keine Kreatur in der Nähe.)";
                    line.style.opacity = "0.65";
                    chatOutput.appendChild(line);
                    chatOutput.scrollTop = chatOutput.scrollHeight;
                }
            }
            if (typeof this.log === "function") {
                this.log("Keine Kreatur in Reichweite für Auftrag", "INFO");
            }
            if (typeof this.journalAppend === "function") {
                this.journalAppend("reach", AnazhRealm._datum`Ein Auftrag „${taskName}" verhallte ohne Hörer.`, {
                    task: taskName,
                    maxDist,
                });
            }
            return null;
        }
        if (this.assignCreatureTask(target, taskName, args)) return target;
        return null;
    }

    assignTaskToAllCreatures(taskName, args = {}, filterFn = null) {
        // Hof-F (hof-plan §D.2/§G.4) — der optionale `filterFn` ist das Gruppen-Dirigat: die Sektions-Befehle
        // im Hof rufen DENSELBEN Pfad wie die Omnibox `k:`/der Chat (kein Parallel-System), nur gefiltert.
        let count = 0;
        for (const c of this.state.creatures) {
            if (filterFn && !filterFn(c)) continue;
            if (this.assignCreatureTask(c, taskName, args)) count++;
        }
        return count;
    }

    findNearestCreature(toPos, maxDist = Infinity) {
        if (!toPos || !Array.isArray(this.state.creatures)) return null;
        let best = null;
        let bestDist = maxDist;
        for (const c of this.state.creatures) {
            if (!c || !c.position) continue;
            const dx = c.position.x - toPos.x;
            const dz = c.position.z - toPos.z;
            const d = Math.hypot(dx, dz);
            if (d < bestDist) {
                bestDist = d;
                best = c;
            }
        }
        return best;
    }

    // DIE GLIEDER DES VERBANDS (S6): die Liste dieses Takts (`updateCreatures` sammelt sie je Verband) mit dem Wesen darin,
    // oder null — ein Ungebundener (ohne Wurf geboren: DSL, Hof, Test) hat keinen Verband.
    _kreaturVerbandGlieder(creature) {
        const vb = creature && creature.userData && creature.userData.verband;
        if (vb == null || !this._verbaende) return null;
        return this._verbaende.get(vb) || null;
    }

    // DER ZUG DES VERBANDS (S6, tetrapoda verbandZug) auf den Wunsch `direction` (m/s), den der wilde Zweig schrieb: die
    // ANDEREN Glieder mit Ort, Wunsch (ihr KI-Wunsch dieses oder des Vor-Takts, `aiDir`), Raum und Leittier (das Glied,
    // dessen netId der Verband trägt — der Erstgeborene des Wurfs). Das Tempo des Zugs ist das größere aus dem Schritt und
    // dem Wunsch (auf der Flucht der Sprint). Die Zahlen: VERHALTEN.herde (gewicht · fensterRaum · maxNachbarn).
    _kreaturVerbandZug(creature, direction, speed, hueftL) {
        const glieder = this._kreaturVerbandGlieder(creature);
        if (!glieder || glieder.length < 2) return;
        const vb = creature.userData.verband;
        const nb = this._verbandNachbarn || (this._verbandNachbarn = []);
        const pool = this._verbandEintraege || (this._verbandEintraege = []);
        nb.length = 0;
        for (const g of glieder) {
            if (g === creature || !g.position) continue;
            const e = pool[nb.length] || (pool[nb.length] = { x: 0, z: 0, vx: 0, vz: 0, raum: 0, leit: false });
            const w = g.userData.aiDir;
            e.x = g.position.x;
            e.z = g.position.z;
            e.vx = w ? w.x : 0;
            e.vz = w ? w.z : 0;
            e.raum = this._kreaturRaum(g);
            e.leit = g.userData.netId === vb;
            nb.push(e);
        }
        const zug = AnazhRealm._steuerGesetz().verbandZug(
            creature.position.x,
            creature.position.z,
            direction.x,
            direction.z,
            Math.max(speed, Math.hypot(direction.x, direction.z)),
            this._kreaturRaum(creature, hueftL),
            nb,
            AnazhRealm._verhaltenGesetz().herde,
            this._verbandZugOut || (this._verbandZugOut = { x: 0, z: 0, n: 0 })
        );
        direction.x = zug.x;
        direction.z = zug.z;
    }

    // DER ALARM DES VERBANDS (S6): wer selbst nichts fürchtet (w unter fleeThreshold), flieht mit dem nächsten fliehenden Glied
    // seines Verbands DIESELBE Flucht (`_fluchtOrt`: Ort und Radius, die nur das eigene Wittern anlegt — tetrapoda fluchtRadius,
    // Tiere K1). Vorher floh nur, wer selbst witterte (Linse herde 18.10.); danach trug jedes Glied aus zweiter Hand einen
    // weiteren Radius, und der Verband hielt es gegen seine Flucht fest (Linse herde 24.10.: 300 s Flucht auf der Stelle).
    _kreaturVerbandAlarm(creature, NAT, von, w) {
        const ud = creature.userData;
        ud._alarmEigen = w >= NAT.fleeThreshold;
        if (ud._alarmEigen || !von) return w;
        const glieder = this._kreaturVerbandGlieder(creature);
        if (!glieder) return w;
        let best = Infinity;
        let B = null;
        for (const g of glieder) {
            const gu = g.userData;
            if (g === creature || gu._motionZustand !== "flucht" || !gu._fluchtOrt) continue;
            const d = Math.hypot(g.position.x - creature.position.x, g.position.z - creature.position.z);
            if (d < best) {
                best = d;
                B = gu._fluchtOrt;
            }
        }
        if (!B) return w;
        von.x = B.x;
        von.z = B.z;
        von.r = B.r;
        return Math.max(w, NAT.fleeThreshold);
    }

    // WARINESS = die natürliche Reaktion eines wilden Wesens auf den Spieler, EIN emergentes Signal:
    // deine Aura-MENACE (v. a. `chaos`, feedback-frei, minus peace/joy) gegen die Natur des Wesens
    // (dicht/hart kühn, lebendig scheu) + BINDUNG + MODUS + frische Kampf-Furcht.
    // Negativ = neugierig (näher), positiv = scheu (fort). DER ALARM DES VERBANDS (S6) liegt darüber: wer selbst nichts
    // fürchtet, flieht mit seinem Verband (`_kreaturVerbandAlarm`).
    _creatureWariness(creature) {
        const NAT = AnazhRealm._verhaltenGesetz().furcht;
        const w = this._creatureWarinessEigen(creature);
        const ud = creature.userData;
        return ud ? this._kreaturVerbandAlarm(creature, NAT, ud._bedrohtVon, w) : w;
    }

    // Die EIGENE Wariness des Wesens: was es selbst wittert — den Spieler und den jagenden Jäger.
    _creatureWarinessEigen(creature) {
        // SPIEGEL-ZENSUS — die Wariness-Gewichte wohnen im tetrapoda-Gesetzbuch
        // (VERHALTEN.furcht via _verhaltenGesetz, fail-soft byte-gleich).
        const NAT = AnazhRealm._verhaltenGesetz().furcht;
        const ud = creature.userData || {};
        // DIE BEDROHUNG (Q11): die Wariness liest JEDE Bedrohung — den Spieler (unten) und den jagenden Jäger in der
        // Witterung — und merkt Ort und Flucht-Radius der stärksten (der Flucht-Zweig flieht von dort). Vorher las sie nur
        // den Spieler: ein gebissener Hirsch wanderte neben dem Wolf weiter (R-D4/K-D11).
        const von = ud._bedrohtVon || (ud._bedrohtVon = { x: 0, z: 0, r: 0 });
        if (this._creatureTemperament(creature) === "wild") return this._creatureWarinessSpieler(creature, NAT, von);
        // DER ORT ERINNERT (Ökologie K3): die Beute wittert die Furcht des Orts wie eine Bedrohung (`_kreaturFurchtOrt`)
        const wSpieler = this._kreaturFurchtOrt(creature, NAT, von, this._creatureWarinessSpieler(creature, NAT, von));
        const jaeger = this._kreaturJaeger;
        if (!jaeger || !jaeger.length) return wSpieler;
        // Ein PIRSCHENDER Jäger bleibt unbemerkt bis jagd.pirschSichtM, ein HETZENDER fällt ab noticeRadius auf (Welle LF:
        // die Jagd gelingt aus der Pirsch — vorher sah die Beute jeden Jäger auf 22 m und floh, ehe er nahe war).
        const sichtPirsch = AnazhRealm._verhaltenGesetz().jagd.pirschSichtM;
        let best = Infinity;
        let J = null;
        for (const j of jaeger) {
            if (j === creature || !j.position) continue;
            const sicht = j.userData && j.userData._motionZustand === "hetzen" ? NAT.noticeRadius : sichtPirsch;
            const d = Math.hypot(j.position.x - creature.position.x, j.position.z - creature.position.z);
            if (d < sicht && d < best) {
                best = d;
                J = j;
            }
        }
        // Ein jagender Jäger in der Witterung wiegt wie ein Treffer (combatFearWariness): die Beute flieht, solange sie
        // ihn wittert (Flucht-Radius = noticeRadius).
        if (!J || NAT.combatFearWariness < wSpieler) return wSpieler;
        von.x = J.position.x;
        von.z = J.position.z;
        von.r = NAT.noticeRadius;
        return NAT.combatFearWariness;
    }

    // Die Wariness vor dem SPIELER (Aura-Menace × Natur × Bindung × Modus + frische Kampf-Furcht); merkt seinen Ort und
    // den Flucht-Radius in `von`.
    _creatureWarinessSpieler(creature, NAT, von) {
        const now = this.state.creatureAnimationTime; // die Kampf-Furcht auf der Kreatur-Uhr (damageCreature)
        const ud = creature.userData || {};
        const fearActive = Number.isFinite(ud.fearUntil) && now < ud.fearUntil;
        const pm = this.state.playerMesh && this.state.playerMesh.position;
        if (!pm) return fearActive ? NAT.combatFearWariness : 0;
        // DAS WESEN ERINNERT (Ökologie K3, tetrapoda furchtErinnert): wer es schlug, den fürchtet es — die erinnerte Furcht hebt
        // die Wariness und weitet Witterung und Flucht-Distanz; wer es fütterte, dem nähert es sich (die Furcht sinkt unter 0).
        // Vorher las kein Verhalten das Gedächtnis (nur Spezialisierung, Prompt und Hof).
        const FG = AnazhRealm._furchtGesetz();
        const erinnert = this._kreaturFurchtErinnert(creature);
        const weit = 1 + Math.max(0, erinnert) * FG.F.fluchtJeFurcht;
        const witterung = NAT.noticeRadius * weit;
        von.x = pm.x;
        von.z = pm.z;
        von.r = NAT.fleeRadius * weit;
        const dist = Math.hypot(creature.position.x - pm.x, creature.position.z - pm.z);
        if (!fearActive && dist > witterung) return 0; // fern → neutral, das Wesen wandert
        const e = (this.state.player && this.state.player.emotions) || {};
        // DIE BEDROHUNG der Aura (tetrapoda bedrohung — dieselbe, die den Abdruck am Ort wiegt). DIE FURCHT DER BEUTE SCHRECKT
        // IHREN JÄGER NIE (oekologie.K4#2): wer den Spieler jetzt pirscht oder hetzt, liest seine Aura nicht — er ist Beute wie
        // jedes Tier (keine Beute trägt ihre Aura in die Wariness ihres Jägers); der Hieb (fearActive) und die Erinnerung
        // schrecken weiter. Bis oekologie.K4#2 verscheuchte die Furcht des Umstellten (chaos × menaceFromChaos) sein Rudel.
        const menace = (this._spielerJaeger || []).includes(creature) ? 0 : FG.bedrohung(e, NAT);
        // DIE NATUR des Wesens ist das Temperament seiner Gattung (Welle LF 08.10.): der Mut der Art (_kreaturMut) macht
        // kühn oder scheu, Bindung macht mutig. Vorher lasen hier die Substanz-Tags (dichte · härte · lebendig), die für
        // alle Tiere gleich sind (Lehre 8) — jeder Hirsch stand mit Wariness −1,0 neugierig am Spieler.
        const boldness = (this._kreaturMut(creature) * 2 - 1) * NAT.mutGewicht + (ud.bond || 0) * NAT.boldFromBond;
        const mode = typeof this.getGameMode === "function" ? this.getGameMode() : "frieden";
        const modeMul = mode === "pfad" ? 1 : mode === "frieden" ? NAT.friedenMenace : NAT.schoepferMenace;
        const proximity = Math.max(0, 1 - dist / witterung);
        let wariness = (menace * modeMul - boldness + erinnert) * (fearActive ? 1 : proximity);
        if (fearActive) wariness = Math.max(wariness, NAT.combatFearWariness);
        return wariness;
    }

    // Die erinnerte Furcht des Wesens vor dem Spieler (tetrapoda furchtErinnert über `userData.memory`: geschlagen ·
    // gefüttert; die Einträge schreiben `damageCreature` und `activateCreatureConsumable`, sie reisen im Speicherstand).
    _kreaturFurchtErinnert(creature) {
        const FG = AnazhRealm._furchtGesetz();
        return FG.furchtErinnert(creature.userData && creature.userData.memory, FG.F);
    }

    // DIE FURCHT DES ORTS (Ökologie K3, tetrapoda furchtOrt): die Beute (ein Pflanzenfresser, diet bis
    // temperament.gattung.pflanzDiet — der Jäger und der Aasfresser gehen an den Riss) liest den Abdruck der Zellen um sich
    // (das Emotions-Feld `_emotionOverlayAt`, 3 × 3 Zellen der Kante LIFE_FIELD.cell); die Furcht einer Zelle wiegt bis
    // ortRadiusZellen Zellen um ihre Mitte, linear zum Rand. Ist sie größer als die Wariness w, ist der Ort die Bedrohung: `von`
    // ist die Mitte der Zelle, ihr Flucht-Radius der Umkreis. Liefert die Wariness. Ein Riss prägt den Ort
    // (`_creatureCombatDeath`); vorher trug der Ort Gefühle, die kein Tier las.
    _kreaturFurchtOrt(creature, NAT, von, w) {
        const ef = this.state.emotionField;
        if (!ef || ef.size === 0) return w;
        const VG = AnazhRealm._verhaltenGesetz();
        if (this._kreaturDiet(creature) > VG.temperament.gattung.pflanzDiet) return w;
        const FG = AnazhRealm._furchtGesetz();
        const zelle = AnazhRealm.LIFE_FIELD.cell;
        const R = FG.F.ortRadiusZellen * zelle;
        const x = creature.position.x,
            z = creature.position.z;
        const cx = Math.floor(x / zelle),
            cz = Math.floor(z / zelle);
        let best = w,
            bx = 0,
            bz = 0;
        for (let i = -1; i <= 1; i++)
            for (let j = -1; j <= 1; j++) {
                const mx = (cx + i + 0.5) * zelle,
                    mz = (cz + j + 0.5) * zelle;
                const m = FG.furchtOrt(this._emotionOverlayAt(mx, mz), NAT, FG.F);
                if (!(m > 0)) continue;
                const wo = m * Math.max(0, 1 - Math.hypot(x - mx, z - mz) / R);
                if (wo > best) {
                    best = wo;
                    bx = mx;
                    bz = mz;
                }
            }
        if (best === w) return w;
        von.x = bx;
        von.z = bz;
        von.r = R;
        return best;
    }

    // DER JAGD-SINN: das WILDE Wesen wittert Beute über das Geruch-Feld (`_scentAt` an seiner Nase; Quelle = der Leib der
    // Beute, der Wind trägt). DIE WITTERUNG FÜHRT ZUR BEUTE (Welle LF 08.10.): von allen Leibern, die Beute sind
    // (_kreaturIstBeute — nicht wild, höchstens jagd.beuteMasse × die eigene Masse) und in scentRangeM liegen, wählt es den,
    // dessen Geruch am stärksten herüberweht, merkt ihn als `userData._beute` und liefert die Richtung zu ihm (der Jagd-Weg
    // _kreaturJagdZug führt dorthin). DER SPIELER IST EIN LEIB WIE JEDES TIER (oekologie.K4): seine Masse, seine Witterung,
    // derselbe Wind, dieselbe Reichweite. Vorher jagte ihn ein zweiter Trieb nur in jagd.radius 12 m ohne Wind und ohne
    // Hunger — ein Rudel 40 m im Revier nahm ihn nie wahr; und die Stärke jeder Quelle war der Größen-Faktor der Seele (je
    // Art flach 0,75–1,6, kein Maß des Spielers) — jeder Leib riecht gleich, Abstand und Wind wählen. Vorher folgte es dem
    // Gradienten des Felds über vier Proben: nah an der Quelle wog der Wind-Winkel bis zwölfmal mehr als der Abstand, der
    // Gradient zeigte vom Ziel fort (Leben-Schau 07.10.: ein Wolf 1200 Takte „jagd", 0,3 m bewegt, 0 Bisse in 3600 Takten).
    // Kein Ziel → null (der Aufrufer wandert neutral). Nur pfad; verängstigt (wariness ≥ fleeThreshold), satt oder
    // erschöpft jagt nicht.
    _creatureScentHuntDir(creature, wariness) {
        const ud = creature.userData || {};
        ud._beute = null;
        if (typeof this.getGameMode !== "function" || this.getGameMode() !== "pfad") return null;
        if (this._creatureTemperament(creature) !== "wild") return null;
        const VG = AnazhRealm._verhaltenGesetz();
        if (wariness >= VG.furcht.fleeThreshold) return null;
        if (this._kreaturSatt(creature)) return null; // satt jagt keine Beute (VERHALTEN.aas)
        if (this._kreaturErschoepft(creature)) return null; // die Jagd endete, der Jäger ruht (Tiere K2)
        const scentRange = VG.jagd.scentRangeM;
        const cx = creature.position.x;
        const cz = creature.position.z;
        const quelle =
            this._creatureScentSourcesScratch || (this._creatureScentSourcesScratch = [{ x: 0, z: 0, strength: 1 }]);
        const creatures = this.state.creatures || [];
        let best = null,
            bestS = 0;
        // die Leiber der Welt: jedes Tier, zuletzt der Spieler, sobald er seinen Leib trägt (bis sein Guss steht,
        // `_deferredAvatarSoul`, ist er der leere Anker — ohne Gestalt keine Masse und keine Witterung)
        const spieler = this.state._deferredAvatarSoul ? null : this.state.playerMesh;
        for (let i = 0; i <= creatures.length; i++) {
            const other = i < creatures.length ? creatures[i] : spieler;
            if (!other || !other.position) continue;
            const dx = other.position.x - cx;
            const dz = other.position.z - cz;
            const fern = dx * dx + dz * dz > scentRange * scentRange;
            // DER RISS NENNT DIE BEUTE (oekologie.K2, `_kreaturRiss`): das Opfer, das der Bestand im Nah-Kreis diesem Jäger
            // oder seinem Verband zusprach, ist das Ziel, wo es auch steht
            const von = other.userData && other.userData._rissVon;
            if ((fern && !von) || !this._kreaturIstBeute(creature, other)) continue;
            if (von && (von === creature || (ud.verband != null && von.userData.verband === ud.verband))) {
                best = other;
                break;
            }
            if (fern) continue;
            quelle[0].x = other.position.x;
            quelle[0].z = other.position.z;
            const witterung = this._scentAt(cx, cz, quelle);
            if (witterung > bestS) {
                bestS = witterung;
                best = other;
            }
        }
        if (!best) return null;
        ud._beute = best;
        const dx = best.position.x - cx,
            dz = best.position.z - cz;
        const d = Math.hypot(dx, dz) || 1;
        const out = this._creatureScentDirScratch || (this._creatureScentDirScratch = new THREE.Vector3());
        out.set(dx / d, 0, dz / d);
        return out;
    }

    // DER KADAVER RUFT (Meisterkarte Tiere H3, tetrapoda VERHALTEN.aas): ein Tier, das kein Pflanzenfresser ist (diet über
    // temperament.gattung.pflanzDiet) und nicht satt, wittert die Gefallenen mit Fleisch über das Geruch-Feld (_scentAt an
    // seiner Nase, Quelle = das Fleisch in kg, in jagd.scentRangeM — dieselbe Nase wie die Jagd), wählt den stärksten Geruch
    // und geht hin (das Ankunfts-Gesetz; der Halt, wo das Maul am liegenden Leib ist). Dort FRISST es: je Sekunde der
    // Kreatur-Uhr magenAnteil × die eigene Masse / fressSec, bis der Magen voll oder der Kadaver leer ist (der Zustand
    // „fressen" senkt den Kopf, _tickKreaturVerhalten). Rückgabe: true, wenn der Kadaver den Weg schrieb (dann zieht kein
    // Verband). Vorher lag der Riss ohne Zustand, kein Tier sah ihn an, und nach 90 s sank er.
    _kreaturAasZug(creature, direction, speed, hueftL) {
        const ud = creature.userData;
        const L = this.state.leichname;
        if (!L.length) return ud._motionZustand === "fressen" ? this._kreaturFrisstNicht(creature) : false;
        const frass = ud._motionZustand === "fressen";
        const VG = AnazhRealm._verhaltenGesetz();
        const voll = this._kreaturMagenVoll(creature);
        const hunger = voll > 0 && this._kreaturMagen(creature) < (frass ? voll : VG.aas.hungerAnteil * voll);
        if (!hunger || this._kreaturDiet(creature) <= VG.temperament.gattung.pflanzDiet)
            return this._kreaturFrisstNicht(creature);
        const R = VG.jagd.scentRangeM;
        const cx = creature.position.x,
            cz = creature.position.z;
        const quelle = this._aasQuelle || (this._aasQuelle = [{ x: 0, z: 0, strength: 1 }]);
        let best = null,
            bestS = 0;
        for (const k of L) {
            const K = k.userData.kadaver;
            if (!K || !(K.fleisch > 0)) continue;
            const dx = k.position.x - cx,
                dz = k.position.z - cz;
            if (dx * dx + dz * dz > R * R) continue;
            quelle[0].x = k.position.x;
            quelle[0].z = k.position.z;
            quelle[0].strength = K.fleisch;
            const w = this._scentAt(cx, cz, quelle);
            if (w > bestS) {
                bestS = w;
                best = k;
            }
        }
        if (!best) return this._kreaturFrisstNicht(creature);
        const lE = this._kreaturLeib(creature, hueftL, this._aasLeibE || (this._aasLeibE = {}));
        const lK = this._kreaturLeib(best, 0, this._aasLeibK || (this._aasLeibK = {}));
        const dx = best.position.x - cx,
            dz = best.position.z - cz;
        // der Spalt zwischen Maul (die Brust halb + radius vor der Mitte) und dem liegenden Leib; gefressen wird, wo das Maul
        // ihn irgendwo auf seiner Länge erreicht (± halb um seine Mitte) — am Kadaver drängen sich die Fresser, der Paar-Raum
        // weicht (kein Anstellen, _kreaturZiel ohne den freien Weg; die Separation hält die Leiber auseinander)
        const rest = Math.hypot(dx, dz) - lE.halb - lE.radius - lK.radius;
        const now = this.state.creatureAnimationTime;
        if (rest > lK.halb) {
            ud._fressT = null;
            this._kreaturZustandStempel(creature, null); // wer zum Kadaver geht, jagt nicht (und frisst noch nicht)
            this._kreaturZiel(direction, dx, dz, rest, speed, null, creature);
            return true;
        }
        this._kreaturZustandStempel(creature, "fressen");
        direction.set(0, 0, 0);
        const dt = Number.isFinite(ud._fressT) ? Math.max(0, Math.min(1, now - ud._fressT)) : 0;
        ud._fressT = now;
        const K = best.userData.kadaver;
        const biss = Math.min(K.fleisch, voll - ud.magen, (voll / VG.aas.fressSec) * dt);
        if (biss > 0) {
            K.fleisch -= biss;
            ud.magen += biss;
        }
        return true;
    }
    _kreaturFrisstNicht(creature) {
        const ud = creature.userData;
        ud._fressT = null;
        if (ud._motionZustand === "fressen") {
            this._kreaturZustandStempel(creature, null);
            if (ud._verhaltenAktion && ud._verhaltenAktion.name === "fressen") ud._verhaltenAktion = null;
        }
        return false;
    }

    // IST DAS BEUTE für diesen Jäger? Nicht wild (wild jagt nicht wild) und höchstens jagd.beuteMasse ×
    // die Masse des Jägers — die EINE Masse des Leibs (`_leibMasse`, kg: Volumen der Gestalt × Dichte des Kerns), die
    // auch der Stoß liest (Welle LF: der Wolf, 64 kg, jagt Hirsch und Fuchs, nie den Bären, 335 kg). Der Spieler trägt keine
    // Gattung und kein Temperament: ihn wiegt allein die Masse seines Leibs (der Wolf jagt den Menschen, der Fuchs nie).
    _kreaturIstBeute(jaeger, o) {
        if (!o || o === jaeger || !o.position || !o.userData) return false;
        if (o !== this.state.playerMesh && this._creatureTemperament(o) === "wild") return false;
        return this._leibMasse(o) <= AnazhRealm._verhaltenGesetz().jagd.beuteMasse * this._leibMasse(jaeger);
    }

    // DIE JAGD (Welle LF 08.10.): der EINE Weg eines Jägers zu seinem Ziel (der Spieler oder seine Beute, zielKey benennt
    // es). DAS RUDEL — die Jäger DESSELBEN Verbands auf dasselbe Ziel (der Vor-Takt; S6: ein fremdes Rudel am selben Ziel
    // verschmilzt nicht, ein Ungebundener jagt allein) — verteilt sich auf dem Ring jagd.hetzM um das Ziel nach dem Gesetz
    // des Kerns (tetrapoda rudelPlatz): die Plätze liegen im Winkel-Abstand 2π/n, in der Reihenfolge, in der die Jäger um
    // das Ziel stehen, um ihre mittlere Richtung. Wer seinen Platz nicht hat, pirscht (Pirsch-Tempo) zum Platz — nah am Ring kreist er außen herum, statt
    // durch das Ziel zu laufen; wer in seinem Sektor auf dem Ring steht, HETZT im Sprint der Gestalt (STEUER sprintTempo)
    // auf das Ziel und hält erst ein, wenn es weiter als drei Ringe davonläuft. LÄUFT DAS ZIEL DAVON (sein Lauf vx, vz zeigt
    // vom Jäger fort, schneller als ein Schritt), hetzt der Jäger schon aus drei Ringen. Vorher pirschte jeder Jäger einzeln
    // im Schritt-Tempo geradewegs auf das Ziel (Leben-Schau 07.10.: drei Wölfe von einer Seite, größte Lücke 239–288°; der
    // Sprinter entkam immer).
    _kreaturJagdZug(creature, tx, tz, zielKey, direction, speed, hueftL, vx = 0, vz = 0, ziel = null) {
        const J = AnazhRealm._verhaltenGesetz().jagd;
        const ud = creature.userData;
        const p = creature.position;
        ud._jagdZiel = zielKey;
        const dx = tx - p.x,
            dz = tz - p.z;
        const d = Math.hypot(dx, dz);
        const TAU = Math.PI * 2;
        const eigen = Math.atan2(p.x - tx, p.z - tz);
        const rudel = this._rudelWinkel || (this._rudelWinkel = []);
        rudel.length = 0;
        const vb = ud.verband;
        if (vb != null)
            for (const j of this._kreaturJaeger || []) {
                const ju = j.userData;
                if (j === creature || !ju || ju._jagdZiel !== zielKey || ju.verband !== vb) continue;
                rudel.push(Math.atan2(j.position.x - tx, j.position.z - tz));
            }
        const R = AnazhRealm._steuerGesetz().rudelPlatz(
            eigen,
            rudel,
            this._rudelPlatzOut || (this._rudelPlatzOut = { platz: 0, n: 1, umstellt: true })
        );
        const n = R.n;
        const platz = R.platz;
        let abw = eigen - platz;
        abw -= TAU * Math.round(abw / TAU);
        // UMSTELLT: das Rudel hetzt erst, wenn es das Ziel umringt (die größte Winkel-Lücke ≤ anderthalb Plätze, rudelPlatz);
        // vorher hetzte, wer zuerst auf dem Ring stand.
        const umstellt = R.umstellt;
        const hetzt = ud._motionZustand === "hetzen";
        const davon = d > 1e-6 && (vx * dx + vz * dz) / d > AnazhRealm._steuerGesetz().tempoEinheit(hueftL);
        const hetze =
            ((hetzt || davon) && d <= 3 * J.hetzM) || (d <= J.hetzM && Math.abs(abw) <= Math.PI / n && umstellt);
        if (this._kreaturJagdEndet(creature, zielKey, hetze)) {
            this._kreaturZustandStempel(creature, null);
            direction.set(0, 0, 0);
            return;
        }
        if (hetze) {
            this._kreaturZustandStempel(creature, "hetzen");
            // die Ankunft gegen ein LAUFENDES Ziel: das Brems-Tempo vor dem Biss plus der Lauf des Ziels von ihm fort — sonst
            // bremste der Hetzer vor einem Sprinter dort, wo sein Brems-Tempo dessen Lauf glich (3,8 m, nie in Biss-Weite)
            const K = AnazhRealm._steuerGesetz();
            const fort = d > 1e-6 ? Math.max(0, (vx * dx + vz * dz) / d) : 0;
            const sprint = this._kreaturSprint(creature, hueftL);
            // DIE HETZE HÄLT IN DER WEITE DES ANSPRUNGS (Welle LF kampf, Posten 5): der Rest ist der Spalt vor dem Maul
            // (_kreaturBissRadial, waagrecht, die Gestalt des Jägers am Leib des Ziels) weniger dem halben Weg des Ansprungs
            // (_kreaturBissReich) — der Jäger steht, wo sein Sprung den Leib sicher erreicht, und drängt sich nicht an ihn;
            // liegt der Leib über seinem Sprung (ein Sims), wartet er dort unten, ohne anzuspringen (_kreaturBissSpalt).
            // Vorher hielt sie bei jagd.pirschStoppM 1,6 m um die Mitten, für jede Gestalt (ein kleiner Fuchs stand dort, wo
            // sein Ansprung den Spieler nie erreichte).
            const spalt = this._kreaturBissRadial(creature, ziel);
            const rest = spalt === null ? d : spalt - this._kreaturBissReich(creature) / 2;
            const vh = rest > 0 ? Math.min(sprint, K.ankunftTempo(rest, sprint) + fort) : 0;
            if (d > 1e-6) direction.set((dx / d) * vh, 0, (dz / d) * vh);
            else direction.set(0, 0, 0);
            return;
        }
        this._kreaturZustandStempel(creature, "jagd");
        const v = speed * J.speedBoost;
        if (d < 1.5 * J.hetzM && Math.abs(abw) > Math.PI / (4 * n)) {
            // außen herum: tangential zum Platz (die Drehung um das Ziel, die die Abweichung schließt), radial auf den Ring
            const dreh = abw > 0 ? -1 : 1;
            const ux = Math.cos(eigen) * dreh,
                uz = -Math.sin(eigen) * dreh;
            const rad = Math.max(-1, Math.min(1, (d - J.hetzM) / J.hetzM));
            const wx = ux + (d > 1e-6 ? (dx / d) * rad : 0),
                wz = uz + (d > 1e-6 ? (dz / d) * rad : 0);
            const wl = Math.hypot(wx, wz) || 1;
            direction.set((wx / wl) * v, 0, (wz / wl) * v);
            return;
        }
        if (d <= J.hetzM) {
            // auf dem Platz: warten, bis das Rudel umstellt (die Pirsch hält)
            direction.set(0, 0, 0);
            return;
        }
        const qx = tx + Math.sin(platz) * J.hetzM - p.x,
            qz = tz + Math.cos(platz) * J.hetzM - p.z;
        this._kreaturZiel(direction, qx, qz, Math.hypot(qx, qz), v, null, creature);
    }

    // DIE JAGD HAT EIN ENDE (Tiere K2, tetrapoda JAGD_GESETZ): die erste Hetze auf ein Ziel beginnt die Jagd (ruhte die Hetze
    // länger als ruheS, beginnt die nächste eine neue); dauert die Jagd dauerS — in der Hetze oder in der Pirsch danach —, bricht der
    // Jäger ab und ist ruheS erschöpft: er jagt nicht (`_kreaturErschoepft`). Liefert true, wenn die Jagd jetzt endet. Vorher hetzte das Rudel, bis die Beute fiel (der
    // Riss nach 7–9 Minuten, eine Quote je Jagd gab es nicht).
    _kreaturJagdEndet(creature, zielKey, hetze) {
        const ud = creature.userData;
        const now = this.state.creatureAnimationTime;
        const J = AnazhRealm._jagdGesetz().J;
        // eine Jagd, deren letzte Hetze länger als eine Ruhe her ist, ist vorbei; erst die Hetze beginnt eine neue
        if (ud._jagd && (ud._jagd.ziel !== zielKey || now - ud._jagd.zuletzt > J.ruheS)) ud._jagd = null;
        if (!ud._jagd) {
            if (!hetze) return false;
            ud._jagd = { ziel: zielKey, beginn: now, zuletzt: now };
        }
        if (hetze) ud._jagd.zuletzt = now;
        if (now - ud._jagd.beginn < J.dauerS) return false;
        ud._jagd = null;
        ud._erschoepftBis = now + J.ruheS;
        return true;
    }
    _kreaturErschoepft(creature) {
        const b = creature.userData && creature.userData._erschoepftBis;
        return Number.isFinite(b) && this.state.creatureAnimationTime < b;
    }
    // DER SPRINT DES LEIBS (STEUER sprintTempo × tetrapoda wundTempo): die Wunde bremst Flucht, Hetze und Ansprung
    _kreaturSprint(creature, hueftL) {
        const ud = creature.userData;
        const JG = AnazhRealm._jagdGesetz();
        const anteil = ud && ud.hpMax > 0 && Number.isFinite(ud.hp) ? ud.hp / ud.hpMax : 1;
        return AnazhRealm._steuerGesetz().sprintTempo(hueftL) * JG.wundTempo(anteil, JG.J);
    }

    // SEPARATIONS-KRAFT am EINEN Bewegungs-Chokepoint: updateCreatures ruft sie JEDEN Frame auf die
    // LIVE-Richtung, NACH dem aiDir-Cache (nie stale gebacken). Nachbarn im PAAR-RAUM (der persönliche Raum beider Leiber,
    // _kreaturRaum — Gattung und Größe, Welle LF) → Abstoß linear 1→0 zum Rand, Summe auf 1 geklemmt; O(n²) (maxCreatures
    // 20). Deterministisch: bei exakter Deckung drückt jede Kreatur in ihre Index-Goldwinkel-Richtung.
    _applyCreatureSeparation(creature, index, direction, speed) {
        // SCHLUSS-WELLE — der Herden-Abstand ist Arterhaltungs-Gefühl und wohnt
        // im tetrapoda-Gesetzbuch (VERHALTEN.separation, fail-closed); der
        // Stamm-Zwilling CREATURE_SEPARATION ist gefallen (Absenz-Wand).
        const SEP = AnazhRealm._verhaltenGesetz().separation;
        const creatures = this.state.creatures || [];
        const raumI = this._kreaturRaum(creature);
        // der grobe Filter: kein Paar-Raum dieses Takts reicht weiter als der eigene Raum + der weiteste (updateCreatures)
        const grob = Number.isFinite(this._raumMaxTakt) ? raumI + this._raumMaxTakt : Infinity;
        let pushX = 0;
        let pushZ = 0;
        for (let j = 0; j < creatures.length; j++) {
            if (j === index) continue;
            const other = creatures[j];
            if (!other || !other.position || other === creature) continue;
            const dx = creature.position.x - other.position.x;
            const dz = creature.position.z - other.position.z;
            const dSq = dx * dx + dz * dz;
            if (dSq >= grob * grob) continue;
            const radius = raumI + this._kreaturRaum(other);
            if (dSq >= radius * radius) continue;
            const d = Math.sqrt(dSq);
            const w = 1 - d / radius; // 1 bei voller Deckung → 0 am Rand
            if (d > 1e-4) {
                pushX += (dx / d) * w;
                pushZ += (dz / d) * w;
            } else {
                // exakte Deckung: der Goldwinkel des EIGENEN Index (deterministisch)
                const ang = index * 2.39996;
                pushX += Math.cos(ang) * w;
                pushZ += Math.sin(ang) * w;
            }
        }
        // DER SPIELER ZU FUSS hält seinen Raum wie jedes Tier (Welle LF, der Paar-Raum ist die Summe, `_spielerRaum`): vorher
        // stieß nur die Schar — ein Nachbar im Rücken drückte das vordere Tier in den Spieler, bis der Leib-Löser es im
        // nächsten Sim-Schritt zurückschob (die Neugier am ruhigen Spieler: 20 Takte mit dem Leib bis 3,5 cm im Spieler).
        const pm = this.state.playerMesh;
        if (pm && pm.position && !(this.state.player && this.state.player.mountedArch != null)) {
            const radius = raumI + this._spielerRaum();
            const dx = creature.position.x - pm.position.x;
            const dz = creature.position.z - pm.position.z;
            const d = Math.hypot(dx, dz);
            if (d < radius && d > 1e-4) {
                const w = 1 - d / radius;
                pushX += (dx / d) * w;
                pushZ += (dz / d) * w;
            }
        }
        if (pushX === 0 && pushZ === 0) return;
        // Klemme: ein dichter Haufen darf keinen Explosions-Impuls summieren.
        const pl = Math.hypot(pushX, pushZ);
        if (pl > 1) {
            pushX /= pl;
            pushZ /= pl;
        }
        direction.x += pushX * speed * SEP.strength;
        direction.z += pushZ * speed * SEP.strength;
    }

    // CHARAKTER-BEWEGUNG liest vorhandene Achsen, gecacht pro Soul×bodySize×Tempo-Hauch:
    // speedMul = _creatureBodySpeedMultiplier (computeCreatureStats.speed / 7) × Tempo-Hauch, geklemmt auf [0.6, 1.6];
    // leashM = Mut-Achse aus dem Temperament der Gattung (_kreaturMut: wehrhaft ~28 m … scheu 8 m) × bodySize
    // (Differenzierung über Gattung und Größe, nie Tags): das scheue Kitz ~4,8 m, der wehrhafte Koloss-Hirsch ~67 m.
    _creatureMoveCharacter(creature) {
        const ud = creature.userData || {};
        const hauch = Number.isFinite(ud.tempoHauch) ? ud.tempoHauch : 1;
        const key = (ud.soul || "") + "|" + (Number.isFinite(ud.bodySize) ? ud.bodySize : 1) + "|" + hauch;
        if (ud._moveChar && ud._moveCharKey === key) return ud._moveChar;
        // SPIEGEL-ZENSUS — Leine + Profile wohnen im tetrapoda-Gesetzbuch
        // (VERHALTEN.wandern/temperament via _verhaltenGesetz, fail-soft byte-gleich).
        const VG = AnazhRealm._verhaltenGesetz();
        const K = VG.wandern;
        // Der TEMPO-HAUCH (creatures_speed_mul, `_kreaturTempoHauch`) wiegt den Charakter INNERHALB des Wander-Bands.
        const raw = this._creatureBodySpeedMultiplier(creature) * hauch;
        const speedMul = Math.min(K.speedMulMax, Math.max(K.speedMulMin, Number.isFinite(raw) ? raw : 1));
        // Mut ∈ [0,1] aus dem Temperament der Gattung (_kreaturMut: fleeMul zwischen scheu und wehrhaft)
        const mut = this._kreaturMut(creature);
        const bs = Number.isFinite(ud.bodySize) ? ud.bodySize : 1;
        const leashM = (K.leashBaseM + K.leashSpanM * (mut * 2 - 1)) * bs;
        ud._moveChar = Object.freeze({ speedMul, leashM });
        ud._moveCharKey = key;
        return ud._moveChar;
    }

    // DER TEMPO-HAUCH der Tiere (creatures_speed_mul; Leben-Schau 07.10., Neu 1): ein Op wiegt das Charakter-Tempo jedes Tiers
    // mit dem Faktor (der jüngste Hauch gilt — Ruhe 0,7, Zorn 1,5, kein Aufschaukeln über Rufe), der Hauch und das Ergebnis
    // bleiben im Wander-Band (VERHALTEN.wandern.speedMulMin..Max, `_creatureMoveCharacter` liest ihn). Vorher schrieb der Op
    // `userData.speedMul`, das niemand las.
    _kreaturTempoHauch(faktor, ctx) {
        const f = Number(faktor);
        if (!(f > 0)) {
            if (ctx && ctx.log) ctx.log.push({ event: "invalid_tempo_hauch", faktor });
            return;
        }
        const K = AnazhRealm._verhaltenGesetz().wandern;
        const h = Math.min(K.speedMulMax, Math.max(K.speedMulMin, f));
        let n = 0;
        for (const cr of this.state.creatures) {
            const ud = cr && cr.userData;
            if (!ud) continue;
            ud.tempoHauch = h;
            n++;
        }
        if (ctx && ctx.log) ctx.log.push({ event: "tempo_hauch", faktor: f, tiere: n });
        this.log(`Tempo-Hauch (${(ctx && ctx.source) || "dsl"}): ${n} Tiere ×${f} im Wander-Band`, "INFO");
    }

    // DIE GRÖSSE EINES TIERS nur über seine bodySize-Achse (Leben-Schau 07.10., Neu 1 — die Klasse von D2): der EINE
    // Schreiber nach der Geburt, in den Bändern des Gesetzes (VERHALTEN.groessen); die Skala IST die Achse, die
    // Größen-Gedächtnisse (Körperlänge, Hang-Spanne, Stats) fallen mit. Vorher skalierte creatures_size_mul die Skala ohne
    // Achse (16 von 16 Tieren ×1,11, bodySize blieb 1).
    _kreaturGroesseSetzen(cr, bs) {
        const ud = cr && cr.userData;
        if (!ud || !Number.isFinite(bs)) return false;
        const GB = AnazhRealm._verhaltenGesetz().groessen;
        let lo = Infinity,
            hi = -Infinity;
        for (const z of GB) {
            if (z.min < lo) lo = z.min;
            if (z.max > hi) hi = z.max;
        }
        const neu = Math.min(hi, Math.max(lo, bs));
        const hpAnteil = Number.isFinite(ud.hp) && ud.hpMax > 0 ? ud.hp / ud.hpMax : null;
        ud.bodySize = neu;
        cr.scale.setScalar(neu);
        ud._koerperLaengeM = undefined;
        ud._slopeHalbLen = undefined;
        this._refreshCreatureStatsCache(cr);
        const hpMax = ud.stats && ud.stats.hpMax;
        if (Number.isFinite(hpMax)) {
            ud.hpMax = hpMax;
            if (hpAnteil !== null) ud.hp = hpAnteil * hpMax;
        }
        return true;
    }

    _kreaturGroesseHauch(faktor, ctx) {
        const f = Number(faktor);
        if (!(f > 0)) {
            if (ctx && ctx.log) ctx.log.push({ event: "invalid_groesse_hauch", faktor });
            return;
        }
        let n = 0;
        for (const cr of this.state.creatures) {
            const ud = cr && cr.userData;
            if (!ud) continue;
            if (this._kreaturGroesseSetzen(cr, (Number.isFinite(ud.bodySize) ? ud.bodySize : 1) * f)) n++;
        }
        if (ctx && ctx.log) ctx.log.push({ event: "groesse_hauch", faktor: f, tiere: n });
        this.log(`Größen-Hauch (${(ctx && ctx.source) || "dsl"}): ${n} Tiere ×${f} auf der bodySize-Achse`, "INFO");
    }

    // DER PERSÖNLICHE RAUM eines Leibs (m, Welle LF 08.10.): die Körper-Kugel des Leibs (halb + Radius — die waagrechte
    // Spanne der Gestalt um ihre Mitte, _kreaturLeib; die Art und die Größe tragen sie über die Hüft-Höhe L) ×
    // VERHALTEN.separation.raumKugel. Der Paar-Raum zweier Tiere ist die Summe; der Spieler hält den Raum seiner Wand-Kapsel
    // (_spielerRaum). Darin stößt die Separation, die Herde zieht nicht, die Neugier hält an. Vorher galt für jede Art
    // 1,6 m × bodySize (die neugierige Schar kroch auf 0,7 m zusammen, Leben-Schau 07.10.). Gecacht je L.
    _kreaturRaum(creature, L) {
        const ud = creature.userData || (creature.userData = {});
        const l = L > 0 ? L : this._kreaturHueftL(creature);
        if (ud._raumL === l && Number.isFinite(ud._raum)) return ud._raum;
        const lb = this._kreaturLeib(creature, l, this._kreaturRaumLeib || (this._kreaturRaumLeib = {}));
        ud._raumL = l;
        ud._raum = (lb.halb + lb.radius) * AnazhRealm._verhaltenGesetz().separation.raumKugel;
        return ud._raum;
    }

    _spielerRaum() {
        return AnazhRealm.PLAYER_WALL_RADIUS * AnazhRealm._verhaltenGesetz().separation.raumKugel;
    }

    // DER FREIE WEG eines Tiers zu seinem Ziel (Richtung dx, dz): wie weit es auf der Geraden geht, bevor es in den Paar-Raum
    // eines anderen Tiers tritt (der Strahl gegen den Kreis aus beiden Räumen; steht es schon darin, geht es nicht weiter
    // auf das andere zu) — die Neugier stellt sich an, statt sich durch die Schar zu drücken (Welle LF: die Schar am
    // Spieler stand Leib an Leib). Unbegrenzt: Infinity.
    _kreaturFreierWeg(creature, dx, dz, raumEigen) {
        const d0 = Math.hypot(dx, dz);
        if (!(d0 > 1e-6)) return Infinity;
        const ux = dx / d0,
            uz = dz / d0;
        const p = creature.position;
        // der grobe Filter (updateCreatures, der weiteste Raum des Takts): wer weder nah steht noch nah am Weg liegt, zählt nie
        const grob = Number.isFinite(this._raumMaxTakt) ? raumEigen + this._raumMaxTakt : Infinity;
        let frei = Infinity;
        for (const o of this.state.creatures) {
            if (!o || o === creature || !o.userData) continue;
            const ox = o.position.x - p.x,
                oz = o.position.z - p.z;
            const vor = ox * ux + oz * uz;
            const d2 = ox * ox + oz * oz;
            if (d2 >= grob * grob && (!(vor > 0) || d2 - vor * vor >= grob * grob)) continue;
            const R = raumEigen + this._kreaturRaum(o);
            if (d2 < R * R) {
                if (vor > 0) frei = Math.min(frei, 0);
                continue;
            }
            if (!(vor > 0)) continue;
            const quer2 = d2 - vor * vor;
            if (quer2 >= R * R) continue;
            frei = Math.min(frei, vor - Math.sqrt(R * R - quer2));
        }
        return frei;
    }

    // Die Hüft-Höhe L eines Tiers (m) — dieselbe L, an der das Gang-Gesetz die Schritt-Länge misst (tb.beinL × Körper-
    // größe); ein Leib ohne Studio-Baum (Seele ohne Rezept) misst sie an seiner Körperlänge (Hüfte ≈ 0,45 × Länge).
    _kreaturHueftL(creature) {
        const tb = creature.userData && creature.userData._tierBaum;
        const s = (creature.scale && creature.scale.x) || 1;
        if (tb && tb.beinL > 0) return tb.beinL * s;
        return 0.45 * this._creatureKoerperLaenge(creature);
    }

    // DAS ANKUNFTS-GESETZ am EINEN Ort (Q3, tetrapoda ankunftTempo): der Wunsch zu einem Ziel in Richtung (dx, dz),
    // `rest` Meter vor dem Halt — höchstens vMax, nah am Halt nur das Tempo, aus dem die Brems-Grenze dort steht. Folgen,
    // Pirsch, Neugier, Sammeln, Bauen und Trinken lesen es; vorher war jeder dieser Wege Gas oder Bremse (R-D17: 4 m/s
    // oder 0, Tempo-Sprünge ~290 m/s²). DER PERSÖNLICHE RAUM (Welle LF): der Halt kommt früher, wenn der Weg vorher in den
    // Paar-Raum eines anderen Tiers führt (_kreaturFreierWeg) — wer folgt, stellt sich an, statt in den Vordermann zu laufen.
    // DER UMWEG (Ökologie K5, tetrapoda umwegSeite): hielt eine Wand das Tier eben (`_halt`) und zeigt der Wunsch fast frontal in
    // sie, geht es längs der Wand um sie herum — `umweg` ist das Tier (auch wo der Paar-Raum nicht gilt: Pirsch, Aas).
    _kreaturZiel(out, dx, dz, rest, vMax, creature, umweg = creature) {
        if (creature) rest = Math.min(rest, this._kreaturFreierWeg(creature, dx, dz, this._kreaturRaum(creature)));
        const d = Math.hypot(dx, dz);
        if (!(d > 1e-6) || !(rest > 0) || !(vMax > 0)) return out.set(0, 0, 0);
        const v = AnazhRealm._steuerGesetz().ankunftTempo(rest, vMax);
        let [ux, uz] = [dx / d, dz / d];
        const h = umweg && umweg.userData._halt;
        const t = this.state.creatureAnimationTime;
        const U = h && AnazhRealm._umwegGesetz();
        if (h && t - h.t <= U.UMWEG_GESETZ.haltS && ux * h.nx + uz * h.nz < 0) {
            const p = umweg.position;
            const alt = t - h.umweg <= U.UMWEG_GESETZ.haltS ? h.seite : 0;
            h.seite = U.umwegSeite(ux, uz, h.nx, h.nz, p.x - h.cx, p.z - h.cz, alt);
            if (h.seite) [h.umweg, ux, uz] = [t, -h.nz * h.seite, h.nx * h.seite];
        }
        return out.set(ux * v, 0, uz * v);
    }

    // DER HALT AN DER WAND (der Umweg liest ihn): ein Schub aus einer Hülle merkt seine Normale (nx, nz) und die Mitte (cx, cz)
    // der Box auf der Kreatur-Uhr. Die Fels-Wand (`_wandHalt`) hält längs des Schritts, ihre Ebene ist keine Normale der Wand.
    _kreaturHaltMerken(creature, nx, nz, cx, cz) {
        const n = Math.hypot(nx, nz);
        if (!(n > 1e-9)) return;
        const ud = creature.userData;
        const h = ud._halt || (ud._halt = { t: -Infinity, nx: 0, nz: 0, cx: 0, cz: 0, seite: 0, umweg: -Infinity });
        [h.t, h.nx, h.nz, h.cx, h.cz] = [this.state.creatureAnimationTime, nx / n, nz / n, cx, cz];
    }

    // DER LEIB DES TIERS (D2, Welle L): EINE benannte Größe je Tier, gelesen von jedem Körper, der ein Tier berührt (der
    // Hüllen-Kontakt _kreaturHuellenKontakt; der Wagen liest denselben Leib, nie einen zweiten Kreis). Drei Achsen längs
    // der Gier bei −halb · 0 · +halb (Becken, Rumpf-Mitte, Brust: der Vierbeiner ist ~1,6 Hüft-Höhen lang — die Schnauze
    // ragt nicht in die Wand, die Flanke darf an ihr vorbei), je Achse der halbe Rumpf als Radius (0,3·L), die Höhe vom Fuß
    // bis zum Kopf (1,8·L). L ist die Hüft-Höhe der Gestalt (dieselbe L, an der das Gang- und das Steuer-Gesetz messen; die
    // Art unterscheidet die Gestalt, nie ein Tag). `out` wird überschrieben (allokationsfrei im Takt).
    // Die REICHWEITE ist die waagrechte Spanne der ganzen Gestalt um die Mitte: an den End-Achsen hängt höchstens ein Glied
    // von Leib-Höhe (Hals mit Kopf, Rute) — halb + Höhe. Sie liest, wer wissen muss, ob eine Strecke das Tier ÜBERHAUPT
    // erreichen kann (das Grob-Tor des Treffers, _trefferErreichbar), bevor die Gestalt selbst richtet. Gemessen über die
    // Treffer-Glieder als räumliche Spanne vom Fuß-Ursprung (sie deckt jede Lage des Leibs), vier Gattungen × acht Größen
    // im Spiel-Takt: Wolf 1,86 · Bär 2,00 · Hirsch 2,01 · Fuchs 2,21 L (die Rute) gegen 2,6 L (gate:kampf-gefuehl T12).
    _kreaturLeib(creature, L, out) {
        const l = L > 0 ? L : this._kreaturHueftL(creature);
        const o = out || {};
        o.L = l;
        o.radius = Math.max(0.12, 0.3 * l);
        o.halb = 0.8 * l;
        o.hoehe = Math.max(0.5, 1.8 * l);
        o.reichweite = o.halb + o.hoehe;
        o.fx = Math.sin(creature.rotation.y);
        o.fz = Math.cos(creature.rotation.y);
        return o;
    }

    // DER STOFF EINES LEIBS (physik K1): ein Tier ist Fleisch (das Gewebe aus tetrapoda, unter dem Fell), der Mensch Leib
    // (samt der Luft seiner Lunge, aus koerper) — je eine Zeile der EINEN Stoff-Tafel. Leser: die Masse (`_leibMasse`), das
    // Wasser, das ihn trägt (`_leibGetragen`), und der Treffer (`_trefferPaar`).
    _leibStoff(mensch) {
        return mensch ? "leib" : "fleisch";
    }

    _leibRho(mensch) {
        return this._stoffRho(this._leibStoff(mensch));
    }

    // DAS WASSER TRÄGT DEN LEIB (Archimedes, physik K1): ein Leib schwimmt, solange er nicht dichter ist als Wasser
    // (`_eintauchAnteil` ≤ 1) — dann hält er seine Schwimm-Linie (der Mensch am Brustkorb, das Tier am
    // Schultergelenk); dichter sinkt er und geht auf dem Grund. Leser: der Schritt des Spielers (`_stepCharacter`) und die
    // Wasser-Regel der Tiere (`_kreaturSchwimmt`).
    _leibGetragen(mensch) {
        return this._eintauchAnteil(this._leibRho(mensch)) <= 1;
    }

    // DIE MASSE EINES LEIBS (kg, das EINE Impuls-Gesetz AnazhRealm.STOSS): das Volumen seiner Gestalt (die geschlossene
    // Haut, `_leibVolumen`, bei Größe 1 gemessen) × Skala³ × ρ seines Stoffs (`_leibRho`) — ein Tier (`_tierBaum.leibV`)
    // oder ein Mensch (`userData._leibV` am Avatar oder an einem Kind). Fail-closed: ein Leib ohne gemessene Gestalt bricht
    // laut. Vorher: eine Kapsel aus der Hüft-Höhe × 1000 im Wirt (Bär 255 kg, Hirsch 436 kg).
    _leibMasse(koerper) {
        const tb = koerper && koerper.userData ? koerper.userData._tierBaum : null;
        // die Skala als Kette der LOKALEN Skalen bis zur Szene — nie über die Welt-Matrix (getWorldScale): die trägt die
        // Hang-Neigung, die der Frame-Takt glättet, und die Masse wich je Bildrate im 1e-9-Bereich ab (0710-5, L8: der
        // Stoß eines Bären unterschied sich ab Schritt 90, nach 200 Schritten stand der Wagen 0,07 m anders)
        const kette = (o) => {
            let v = 1;
            for (let n = o; n && !n.isScene; n = n.parent) v *= n.scale.x * n.scale.y * n.scale.z;
            return v;
        };
        if (tb && tb.leibV > 0) return tb.leibV * kette(koerper) * this._leibRho(false);
        let avatar = null;
        if (koerper && typeof koerper.traverse === "function")
            koerper.traverse((o) => {
                if (!avatar && o.userData && o.userData._leibV > 0) avatar = o;
            });
        if (avatar) return avatar.userData._leibV * kette(avatar) * this._leibRho(true);
        return AnazhRealm._kernPflichtBruch("leib:Gestalt ohne Volumen (" + ((koerper && koerper.name) || "?") + ")");
    }

    // DIE GESCHWINDIGKEIT EINES LEIBS (m/s, Welt-XZ): sein Steuer-Schritt (Gier × Tempo) und der Stoß, den er trägt — der
    // Partner der Relativ-Geschwindigkeit im Impuls-Gesetz (ein fortgleitender Leib wird nicht noch einmal gestoßen).
    _kreaturGeschw(creature) {
        const ud = creature && creature.userData;
        const st = ud && ud._steuer;
        const sv = ud && ud._stossV;
        const v = st && Number.isFinite(st.v) && Number.isFinite(st.gier) ? st.v : 0;
        return {
            x: (v ? Math.sin(st.gier) * v : 0) + (sv ? sv.x : 0),
            z: (v ? Math.cos(st.gier) * v : 0) + (sv ? sv.z : 0),
        };
    }

    // DER BISS (das EINE Impuls-Gesetz, 0710-4): die Vorhand des Jägers (BISS.masseAnteil seiner Leib-Masse) trifft im
    // Tempo des Ansprungs (pounce.tempo × tempoEinheit seiner Hüft-Höhe) das Ziel längs der Linie Jäger → Ziel — ein Tier
    // (`_kreaturStoss`) oder den Spieler (`ziel` = null: `_spielerStoss`). Der Bär beißt schwerer als der Fuchs, der
    // Fuchs fliegt weiter als der Bär. Vorher: Schaden ohne Rückstoß (alle drei Biss-Wege: Jagd auf Beute, Jagd auf den
    // Spieler, Gegenwehr). Rückgabe {J, dv} oder null.
    _bissStoss(beisser, ziel) {
        if (!beisser || !beisser.position) return null;
        const BG = AnazhRealm._bissGesetz();
        const spieler = !ziel;
        const zk = spieler ? this.state.playerMesh : ziel;
        if (!zk || !zk.position) return null;
        const dx = zk.position.x - beisser.position.x;
        const dz = zk.position.z - beisser.position.z;
        const d = Math.hypot(dx, dz);
        if (!(d > 1e-6)) return null;
        const mB = this._leibMasse(beisser) * BG.masseAnteil;
        const mZ = this._leibMasse(zk);
        const v = this._kreaturBissTempo(beisser);
        const J = AnazhRealm._stossImpuls(mB, mZ, v, AnazhRealm.STOSS.stossZahl.leib);
        if (!(J > 0)) return null;
        if (spieler) this._spielerStoss(dx / d, dz / d, J / mZ);
        else this._kreaturStoss(ziel, dx / d, dz / d, J / mZ);
        return { J, dv: J / mZ };
    }

    // DIE TEILNEHMER DES IMPULS-GESETZES (0710-4): ein Tier (sein Leib), der Spieler (`state.playerMesh`) oder ein Wagen
    // (ein Eintrag mit Fahr-Satz) — je Masse (`_leibMasse` / `_fahrMasse`), Geschwindigkeit (Steuer + getragener Stoß /
    // `playerVel` / Fahr-Zustand) und der Kanal, der einen Stoß trägt (`_kreaturStoss` / `_spielerStoss` /
    // `_fahrWagenStoss`). `out` wird überschrieben; null = kein Teilnehmer.
    _stossKoerper(q, out) {
        const o = out || {};
        const st = this.state;
        if (q && q === st.playerMesh) {
            o.art = "spieler";
            o.m = this._leibMasse(q);
            o.vx = st.playerVel ? st.playerVel.x() : 0;
            o.vz = st.playerVel ? st.playerVel.z() : 0;
        } else if (q && q.userData && q.userData.kind === "creature") {
            const v = this._kreaturGeschw(q);
            o.art = "tier";
            o.m = this._leibMasse(q);
            o.vx = v.x;
            o.vz = v.z;
        } else {
            const G = q ? this._fahrStossSatz(q) : null;
            if (!G) return null;
            const v = this._fahrWagenGeschw(q);
            o.art = "wagen";
            o.G = G;
            o.m = this._fahrMasse(q, G.m);
            o.vx = v ? v.x : 0;
            o.vz = v ? v.z : 0;
        }
        o.q = q;
        return o.m > 0 ? o : null;
    }
    _stossAuf(K, nx, nz, dv) {
        if (!(dv > 0)) return;
        if (K.art === "spieler") this._spielerStoss(nx, nz, dv);
        else if (K.art === "tier") this._kreaturStoss(K.q, nx, nz, dv);
        else this._fahrWagenStoss(K.q, K.G, nx * dv, nz * dv);
    }
    // DAS PAAR: n (Einheit) zeigt von A nach B. Nähern sie sich längs n (v_rel = (vA − vB) · n > 0), tauschen sie Impuls
    // nach dem EINEN Gesetz: A bekommt −n · J/mA, B +n · J/mB (Leib an Leib e 0,1, Wagen an Wagen e 0,3). Rückgabe J.
    _stossPaar(qa, qb, nx, nz) {
        const A = this._stossKoerper(qa, this._stossPaarA || (this._stossPaarA = {}));
        const B = A ? this._stossKoerper(qb, this._stossPaarB || (this._stossPaarB = {})) : null;
        if (!A || !B) return 0;
        const vRel = (A.vx - B.vx) * nx + (A.vz - B.vz) * nz;
        if (!(vRel > 0)) return 0;
        const ST = AnazhRealm.STOSS.stossZahl;
        const e = A.art === "wagen" && B.art === "wagen" ? ST.wagen : ST.leib;
        const J = AnazhRealm._stossImpuls(A.m, B.m, vRel, e);
        this._stossAuf(A, -nx, -nz, J / A.m);
        this._stossAuf(B, nx, nz, J / B.m);
        return J;
    }

    // DER LEIB DES SPIELERS unter den Leibern (Welle LF): seine Wand-Kapsel — die Mitte (x, z), der Radius PLAYER_WALL_RADIUS,
    // vom Fuß (y0) bis über den Stufen-Saum (y1). Ihn lesen der Kontakt Leib an Leib (_leibKontakte) und der Biss
    // (_kreaturBissSpalt, _kreaturBissKontakt) — EINE Gestalt des Spielers, an die ein Tier stößt und die es beißt.
    _spielerKapsel(out) {
        const pm = this.state.playerMesh;
        const fd = AnazhRealm.PLAYER_FOOT_OFFSET;
        const o = out || {};
        o.x = pm.position.x;
        o.z = pm.position.z;
        o.r = AnazhRealm.PLAYER_WALL_RADIUS;
        o.y0 = pm.position.y - fd;
        o.y1 = pm.position.y + fd + AnazhRealm.PLAYER_STEP_UP;
        return o;
    }

    // LEIB AN LEIB (das EINE Impuls-Gesetz, 0710-4): je Paar naher Leiber — Tier an Tier, Tier am Spieler zu Fuß — ihre
    // Achsen (das Tier: die Strecke −halb … +halb längs seiner Gier mit seinem Radius, `_kreaturLeib`; der Spieler: seine
    // Kapsel r PLAYER_WALL_RADIUS) als Strecke gegen Strecke. Durchdringen sie sich, trennt der Kontakt sie nach ihren Massen
    // (der leichte weicht; die Lage des Spielers setzt allein sein Sim-Schritt — gegen ihn weicht das Tier ganz), und nähern
    // sie sich längs der Normalen, tauschen sie Impuls (`_stossPaar`): der Fuchs prallt am Bären ab, der Bär wankt kaum.
    // Vorher trennte nur der Herden-Abstand als Steuer-Wunsch (`_applyCreatureSeparation`) — Leiber gingen durcheinander,
    // ohne Impuls. Paare in Index-Folge, ohne Frame-Delta, ohne Zufall, im festen Sim-Schritt (`_stepFixedSim`, 0710-5).
    // DIE GÄNGE (Welle LF, die dichte Schar): eine Trennung schiebt einen Leib in den nächsten — der Löser geht die Paare
    // erneut durch, bis kein Leib mehr weicht (höchstens LEIB_GAENGE); der Impuls fließt je Paar einmal (nach dem Tausch
    // entfernen sie sich, `_stossPaar` gibt 0). Vorher ein Gang: acht neugierige Tiere am Spieler standen Leib an Leib.
    _leibKontakte() {
        const st = this.state;
        const cr = st.creatures || [];
        const T = this._leibKontaktTeile || (this._leibKontaktTeile = []);
        let n = 0;
        const teil = (k) => T[k] || (T[k] = { leib: {} });
        for (let i = 0; i < cr.length; i++) {
            const c = cr[i];
            if (!c || !c.position || !c.userData) continue;
            this._leibTeil(c, teil(n++));
        }
        const pm = st.playerMesh;
        if (pm && pm.position && !(st.player && st.player.mountedArch != null)) this._leibTeil(pm, teil(n++));
        if (n < 2) return;
        const nah = this._leibKontaktNah || (this._leibKontaktNah = {});
        for (let gang = 0; gang < AnazhRealm.LEIB_GAENGE; gang++) {
            if (!this._leibKontaktGang(T, n, nah)) break;
        }
    }
    // DER TEIL EINES LEIBS im Kontakt Leib an Leib: das Tier seine Strecke −halb … +halb längs der Gier mit seinem Radius
    // (`_kreaturLeib`), der Spieler zu Fuß seine Kapsel (`_spielerKapsel`). `t` wird überschrieben.
    _leibTeil(q, t) {
        t.q = q;
        if (q === this.state.playerMesh) {
            const K = this._spielerKapsel(this._leibKapsel || (this._leibKapsel = {}));
            t.x = K.x;
            t.z = K.z;
            t.hx = 0;
            t.hz = 0;
            t.r = K.r;
            t.y0 = K.y0;
            t.y1 = K.y1;
            t.reich = t.r;
            return t;
        }
        const lb = this._kreaturLeib(q, 0, t.leib || (t.leib = {}));
        t.x = q.position.x;
        t.z = q.position.z;
        t.hx = lb.fx * lb.halb;
        t.hz = lb.fz * lb.halb;
        t.r = lb.radius;
        t.y0 = q.position.y;
        t.y1 = q.position.y + lb.hoehe;
        t.reich = lb.halb + lb.radius;
        return t;
    }
    // EIN GANG über alle Paare (`_leibKontakte`): true, wenn ein Leib wich.
    _leibKontaktGang(T, n, nah) {
        let wich = false;
        for (let i = 0; i < n; i++)
            for (let j = i + 1; j < n; j++) if (this._leibPaar(T[i], T[j], i + j, nah)) wich = true;
        return wich;
    }
    // DAS PAAR Leib an Leib — gelesen vom Gang (`_leibKontaktGang`) und vom Weg des Leibs (`_leibGegenLeiber`): durchdringen
    // sich a und b (Teile aus `_leibTeil`), weicht der leichte nach dem Verhältnis der Massen, und sie tauschen Impuls; `saat`
    // dreht die Normale bei genauer Deckung (deterministisch). true, wenn ein Leib wich.
    _leibPaar(a, b, saat, nah) {
        const grob = a.reich + b.reich;
        if (Math.abs(a.x - b.x) > grob || Math.abs(a.z - b.z) > grob) return false;
        if (a.y1 <= b.y0 || b.y1 <= a.y0) return false;
        AnazhRealm._streckenNah2D(
            a.x - a.hx,
            a.z - a.hz,
            a.x + a.hx,
            a.z + a.hz,
            b.x - b.hx,
            b.z - b.hz,
            b.x + b.hx,
            b.z + b.hz,
            nah
        );
        const tief = a.r + b.r - nah.d;
        if (!(tief > 0)) return false;
        const wich = tief > 1e-4; // ein Rest unter 0,1 mm ruft keinen weiteren Gang
        let nx;
        let nz;
        if (nah.d > 1e-6) {
            nx = (nah.qx - nah.px) / nah.d;
            nz = (nah.qz - nah.pz) / nah.d;
        } else {
            // genaue Deckung: der Goldwinkel des Paares (deterministisch)
            nx = Math.cos(saat * 2.39996);
            nz = Math.sin(saat * 2.39996);
        }
        // die Lage: der leichte weicht nach dem Verhältnis der Massen (der Spieler weicht nie — sein Sim-Schritt)
        const KA = this._stossKoerper(a.q, this._leibKontaktKA || (this._leibKontaktKA = {}));
        const KB = this._stossKoerper(b.q, this._leibKontaktKB || (this._leibKontaktKB = {}));
        if (!KA || !KB) return wich;
        const fest = (K) => K.art === "spieler";
        const wa = fest(KA) ? 0 : fest(KB) ? 1 : KB.m / (KA.m + KB.m);
        const wb = fest(KB) ? 0 : fest(KA) ? 1 : KA.m / (KA.m + KB.m);
        if (wa > 0) {
            const x0 = a.q.position.x;
            const z0 = a.q.position.z;
            a.q.position.x -= nx * tief * wa;
            a.q.position.z -= nz * tief * wa;
            this._kreaturHuellenKontakt(a.q, 0, x0, z0); // die Trennung schiebt nie in eine Wand
            a.x = a.q.position.x;
            a.z = a.q.position.z;
        }
        if (wb > 0) {
            const x0 = b.q.position.x;
            const z0 = b.q.position.z;
            b.q.position.x += nx * tief * wb;
            b.q.position.z += nz * tief * wb;
            this._kreaturHuellenKontakt(b.q, 0, x0, z0);
            b.x = b.q.position.x;
            b.z = b.q.position.z;
        }
        this._stossPaar(a.q, b.q, nx, nz);
        return wich;
    }
    // DER WEG GEGEN DIE LEIBER (je Teil-Schritt des Wegs, `_kreaturWeg`): der gehende Leib c (Index i) gegen jeden anderen in
    // seiner Reichweite — das Paar des Kontakts Leib an Leib (`_leibPaar`). Der grobe Filter liest den weitesten Raum des
    // Takts (`_raumMaxTakt` ≥ die Reichweite jedes Leibs).
    _leibGegenLeiber(c, i) {
        const st = this.state;
        const cr = st.creatures || [];
        const a = this._leibTeil(c, this._leibWegA || (this._leibWegA = { leib: {} }));
        const b = this._leibWegB || (this._leibWegB = { leib: {} });
        const nah = this._leibWegNah || (this._leibWegNah = {});
        const rm = this._raumMaxTakt;
        const grob = a.reich + (Number.isFinite(rm) ? Math.max(rm, AnazhRealm.PLAYER_WALL_RADIUS) : Infinity);
        for (let j = 0; j < cr.length; j++) {
            const o = cr[j];
            if (o === c || !o || !o.position || !o.userData) continue;
            if (Math.abs(o.position.x - a.x) > grob || Math.abs(o.position.z - a.z) > grob) continue;
            this._leibPaar(a, this._leibTeil(o, b), i + j, nah);
        }
        const pm = st.playerMesh;
        if (!pm || !pm.position || (st.player && st.player.mountedArch != null)) return;
        if (Math.abs(pm.position.x - a.x) > grob || Math.abs(pm.position.z - a.z) > grob) return;
        this._leibPaar(a, this._leibTeil(pm, b), i + cr.length, nah);
    }

    // DER STOSS AUF DEN SPIELER: dv (m/s) längs (nx, nz) in seine Geschwindigkeit — die Beschleunigungs- und Brems-Kurven
    // des Gehens (`_loopPlayerMovement`) zehren ihn auf wie jede Fahrt. Im Sattel trägt ihn das Gefährt (kein Stoß).
    _spielerStoss(nx, nz, dv) {
        const st = this.state;
        if (!(dv > 0) || !st.playerVel || (st.player && st.player.mountedArch != null)) return;
        const v = st.playerVel;
        v.setValue(v.x() + nx * dv, v.y(), v.z() + nz * dv);
    }

    // DER WEG DES LEIBS (kontakt-tempo, Lehre 13): EIN Weg für jeden Schritt, der ein Tier trägt — den Gang im Frame-Takt
    // (updateCreatures: Gier × Tempo + Strömung) und den Stoß im Sim-Schritt (`_kreaturStossSchritt`). v·dt geht in
    // Teil-Schritten von höchstens LEIB_TEIL.radius Leib-Radien (mindestens LEIB_TEIL.minM), je Teil-Schritt die EINE Hülle
    // (`_kreaturHuellenKontakt`) und im Gang (`leiber`: der Frame-Takt, dem bis zum nächsten Sim-Schritt kein Löser folgt) das
    // EINE Paar Leib an Leib (`_leibGegenLeiber`; den Stoß trennt `_leibKontakte` im selben Sim-Schritt): die Achse erreicht in
    // einem Teil-Schritt nie die Mitte einer Wand oder eines Leibs, gleich wie dünn, gleich bei welcher Bildrate. Was die
    // Berührung schiebt, nimmt v die Komponente in sie (v wird fortgeschrieben). Vorher ging der Gang EINEN Schritt je Frame
    // mit EINER Hülle: bei 10 fps (der Takt-Deckel 100 ms) liefen Fuchs, Wolf und Bär im Galopp 6 von 6 Mal durch eine
    // 0,35-m-Mauer, 4 von 4 durch die 0,3-m-Wand des Hauses, der Wolf 2 von 4 durch einen stehenden Bären. Die Kosten folgen
    // dem Weg (Gebot 7): ein stehender Leib geht einen Teil-Schritt, ohne Leib-Paar.
    _kreaturWeg(c, L, v, dt, i, leiber) {
        const leib = this._kreaturLeib(c, L, this._kreaturWegLeib || (this._kreaturWegLeib = {}));
        const T = AnazhRealm.LEIB_TEIL;
        const weg = Math.hypot(v.x, v.z) * dt;
        const teile = Math.max(1, Math.ceil(weg / Math.max(T.minM, T.radius * leib.radius)));
        const h = dt / teile;
        for (let k = 0; k < teile; k++) {
            const x0 = c.position.x;
            const z0 = c.position.z;
            c.position.x += v.x * h;
            c.position.z += v.z * h;
            const kx = c.position.x;
            const kz = c.position.z;
            this._kreaturHuellenKontakt(c, L, x0, z0);
            if (leiber && weg > 0) this._leibGegenLeiber(c, i);
            const hx = c.position.x - kx;
            const hz = c.position.z - kz;
            const hd = Math.hypot(hx, hz);
            const vn = hd > 1e-6 ? (v.x * hx + v.z * hz) / hd : 0;
            if (vn < 0) {
                v.x -= (vn * hx) / hd;
                v.z -= (vn * hz) / hd;
            }
        }
        return v;
    }

    // DER GESTOSSENE LEIB IM SIM-SCHRITT (0710-5, Lehre 13: was einen Körper bewegt, läuft im festen Schritt): je Tier mit
    // getragenem Stoß der Weg dieses Schritts (`_kreaturWeg`, Teil-Schritte gegen die Hülle; dieselbe Regel wie der Deckel des
    // Wagens: nie mehr als eine Stufe in eine Box je Schritt). Hält ein
    // Hindernis den Leib, stirbt sein Stoß in das Hindernis (unelastisch); danach zehrt die Reibung μ·g·dt, μ aus der Zeile
    // des Stoffs unter ihm (`_kontaktStoffAt`, stoffe.K1: auf Eis gleitet er weit, auf Fels kurz). Vorher bewegte
    // updateCreatures ihn je Frame um _stossV·delta ohne Weg-Prüfung (30 fps und gemischte Frames: 9 von 10 Bären durch eine
    // 0,35-m-Mauer; nach 200 Sim-Schritten stand der Bär 1,39 m, der Wagen 0,06 m anders, je nach Bildrate).
    _kreaturStossSchritt(dt) {
        const wesen = this.state.creatures;
        if (!wesen || !wesen.length || !(dt > 0)) return;
        const ST = AnazhRealm.STOSS;
        const leib = this._kreaturStossLeib || (this._kreaturStossLeib = {});
        for (let i = 0; i < wesen.length; i++) {
            const c = wesen[i];
            const ud = c && c.userData;
            const sv = ud && ud._stossV;
            if (!sv) continue;
            const boden = this._stoff(this._kontaktStoffAt(c.position.x, c.position.z, c.position.y));
            const ab = boden && boden.mu > 0 ? boden.mu * Math.abs(this.state.gravity) * dt : Infinity;
            const sp = Math.hypot(sv.x, sv.z);
            if (!(sp > Math.max(ab, ST.ruheMs))) {
                ud._stossV = null;
                continue;
            }
            const L = this._kreaturHueftL(c);
            this._kreaturLeib(c, L, leib);
            ud._wandHalt = null; // der Stoß trägt den Leib, seine Wand ist die des Schritts (unten)
            ud._wandBlickGang = false; // sein Grund (unten) ist ohne Blick voraus gesetzt — der Gang blickt neu
            // der Grund, von dem dieser Schritt ausgeht — der SIM-Zustand des Stoßes (Lehre 13: was einen Körper bewegt, läuft
            // im festen Schritt): der Grund des letzten Stoß-Schritts, steht der Leib noch dort; sonst der Boden unter ihm. Nie
            // der Boden-Cache des Frame-Takts (Budget, Bildrate: gate:fahr-leben L8, Bär 1,8 cm je Bildrate).
            const sx = c.position.x;
            const sz = c.position.z;
            const sg0 = ud._stossGrund;
            const amOrt = sg0 && sg0.x === sx && sg0.z === sz;
            const sg = amOrt ? sg0.g : this._koerperBodenUnter(sx, c.position.y, sz);
            const sgGenau = amOrt ? sg0.genau : this._feldKanteGenau(sx, sg, sz);
            this._kreaturWeg(c, L, sv, dt, i, false);
            // die HÖHE des gleitenden Leibs gehört demselben Schritt (Q4: die Sim steht auf dem Gesetz, die Sicht liest es um
            // den Stand-Leser): erdete erst der Frame-Takt (Budget, 0,5-m-Cache), lag die Höhe je Bildrate verschieden, und
            // das Höhen-Band der Wagen-Hülle las sie (L8: Schritt 91, Bär y −0,016 m, nach 200 Schritten 0,07 m). Der
            // Boden-Cache des Frames bekommt denselben Wert; der Frame-Takt lässt die Höhe stehen, solange der Stoß trägt.
            // Schwimmt er (die EINE Wasser-Regel, `_kreaturSchwimmt`: die Wahrheit am Körper über dem Grund des Gesetzes, die
            // Wasserlinie seiner Gestalt), steht er an seiner Schwimm-Linie (`_kreaturSchwimmLinie`, dieselbe wie im
            // Frame-Takt) — vorher setzte dieser Schritt auch im Wasser den Boden (gate:fahr-leben L10: ein Fuchs in 3,2 m Wasser
            // sank beim Gleiten 2,77 m tief), danach setzte der Frame-Takt die Höhe mit seiner Welle (L8: 0,127 m je Bildrate).
            // der Boden UNTER dem Leib (`_koerperBodenUnter`, ab seiner Höhe), nie die Oberkante der Säule — ein in der Höhle
            // gestoßenes Tier glitt sonst aufs Dach. Der Boden ist der SCHRITT vom Grund des Schritt-Beginns (`_koerperSchritt`):
            // trug er den Leib in die Wand, steht er, wo der Schritt begann, und der Stoß stirbt in der Wand (unelastisch, wie
            // an jeder Hülle).
            let gesetz = this._koerperSchritt(sx, sz, sg, c.position.x, c.position.z, leib.hoehe);
            if (gesetz === null) {
                c.position.x = sx;
                c.position.z = sz;
                sv.x = 0;
                sv.z = 0;
                gesetz = sg;
            }
            // DIE STEILE WAND: ein Stoß schiebt den Leib keinen Hang steiler als 45° hinauf — dort stirbt er wie an jeder Wand.
            // Vorher hielt ihn nur die Reibung, und ein mit 6 m/s gestoßener Wolf glitt 4,7 m die 56°-Wand der Höhle hinauf.
            // Gemessen an der GENAUEN Kante (`_feldKanteGenau`): die Bisektion des Boden-Lesers trägt 8 mm je nach Start-Höhe,
            // und die Start-Höhe trägt die Bildrate (Lockstep, gate:fahr-leben L8).
            let genau = gesetz === sg ? sgGenau : this._feldKanteGenau(c.position.x, gesetz, c.position.z);
            if (genau - sgGenau > Math.hypot(c.position.x - sx, c.position.z - sz)) {
                c.position.x = sx;
                c.position.z = sz;
                sv.x = 0;
                sv.z = 0;
                gesetz = sg;
                genau = sgGenau;
            }
            const sgN = ud._stossGrund || (ud._stossGrund = { x: 0, z: 0, g: 0, genau: 0 });
            sgN.x = c.position.x;
            sgN.z = c.position.z;
            sgN.g = gesetz;
            sgN.genau = genau;
            const spiegelS = this._kreaturSchwimmt(c, gesetz);
            if (spiegelS !== null) c.position.y = this._kreaturSchwimmLinie(c, spiegelS);
            else {
                const sicht = this._standSicht(c.position.x, c.position.z, gesetz, false);
                c.position.y = Number.isFinite(sicht) ? sicht : gesetz;
                // DIE AUFLAGE DER BAUTEN gilt auch hier (dieselbe Regel wie im Frame-Takt, `_kreaturAuflage`): der Leib, den der
                // Schritt ruhen lässt, steht, wo der Frame-Takt ihn stellen würde. Vorher stellte erst der Frame-Takt ihn auf den
                // Sockel — bei 60 fps einen Schritt früher als bei gemischten Frames (gate:fahr-leben L8 an der Mess-Wiese
                // −278/−1038: der Bär 28,017 gegen 27,563 m, der Wagen nach 200 Schritten 1,77 mm anders).
                const auflage = this._kreaturAuflage(c, L);
                if (auflage > c.position.y) c.position.y = auflage;
            }
            ud.cachedGroundY = gesetz;
            ud.cachedGroundX = c.position.x;
            ud.cachedGroundZ = c.position.z;
            const sp2 = Math.hypot(sv.x, sv.z);
            if (!(sp2 > Math.max(ab, ST.ruheMs))) ud._stossV = null;
            else {
                sv.x *= (sp2 - ab) / sp2;
                sv.z *= (sp2 - ab) / sp2;
            }
        }
    }

    // RUHT DER LEIB IM SCHRITT: kein Stoß trägt ihn, und er steht genau, wo ihn sein letzter Stoß-Schritt ließ (`_stossGrund`) —
    // der Schritt hat seine Lage gegen die Hüllen gelöst und seine Höhe gesetzt; der Sim-Schritt liest sie (die Hülle eines
    // Wagens, der nächste Stoß). Leser: der Frame-Takt (`updateCreatures`), der ihn dann nicht anfasst.
    _kreaturRuhtImSchritt(c) {
        const ud = c.userData;
        const sg = ud && ud._stossGrund;
        return !!sg && !ud._stossV && sg.x === c.position.x && sg.z === c.position.z;
    }

    // DIE EINE WASSER-REGEL DER TIERE (Welle L Q6 + welle-m-impuls, vereint V18.536): die EINE Wasser-Wahrheit am Körper
    // (`_koerperWasser` über dem Grund des Leibs) und seine GESTALT — die Wasserlinie liegt am Schultergelenk (die Gelenk-
    // Höhe des Vorderlaufs × Körpergröße, `_tierBaum.bein`; ohne Gestalt-Baum die Schwimm-Tiefe des Gesetzes). Der Leib
    // schwimmt, sobald die Säule über dem Grund tiefer ist als diese Linie (mindestens VERHALTEN.wasser.schwimmTiefeM) und
    // das Wasser ihn trägt (`_leibGetragen`, ρ der Stoff-Zeile, physik K1 — ein dichterer Leib geht auf dem Grund) — JEDES
    // Tier, nie nur im 50-m-Kreis um den Spieler. Rückgabe: der Spiegel, der ihn trägt, oder null (er watet/steht).
    // Leser: der Frame-Takt (updateCreatures) und der Sim-Schritt des Stoßes (`_kreaturStossSchritt`) — vorher las der
    // Stoß-Schritt einen zweiten Wasser-Kontext (`_creatureWaterContextAt`, nur nahe dem Spieler, der 3×3-gedehnte
    // `_waterLevelAt`) und stellte die Sohle 0,3 m unter ihn: in Wasser zwischen 0,5 m und Schulterhöhe hielt niemand die
    // Höhe eines gleitenden Tiers.
    _kreaturSchwimmt(creature, boden) {
        const ud = creature.userData;
        const W = AnazhRealm._verhaltenGesetz().wasser;
        const tb = ud._tierBaum;
        ud._wasserlinie = tb && tb.bein ? tb.bein[0].h * (creature.scale.x || 1) : W.schwimmTiefeM;
        if (!Number.isFinite(boden)) return null;
        const spiegel = this._koerperWasser(creature.position.x, creature.position.z, boden);
        return spiegel - boden > Math.max(W.schwimmTiefeM, ud._wasserlinie) && this._leibGetragen(false)
            ? spiegel
            : null;
    }
    // DIE SCHWIMM-LINIE: die Sohle eines schwimmenden Leibs hängt um seine Wasserlinie unter dem Spiegel (das Paddeln trägt
    // der Gang, MOTION.schwimmen) — Leser: der Frame-Takt und der Stoß-Schritt (beide ohne Welle).
    _kreaturSchwimmLinie(creature, spiegel) {
        return spiegel - creature.userData._wasserlinie;
    }

    // DER STOSS AUF EINEN LEIB: dv (m/s) längs (nx, nz) — er trägt den Leib, bis die Reibung ihn aufzehrt.
    _kreaturStoss(creature, nx, nz, dv) {
        if (!creature || !creature.userData || !(dv > 0)) return;
        const sv = creature.userData._stossV || (creature.userData._stossV = { x: 0, z: 0 });
        sv.x += nx * dv;
        sv.z += nz * dv;
    }

    // DER KÖRPER DES TIERS GEGEN DIE HÜLLEN (Q11 + Lehre 25): jedes Tier — im Blick oder nicht — löst seine Achse gegen die
    // soliden Part-Boxen naher Bauwerke über den EINEN Kontakt-Löser des Spielers (_resolveCapsuleVsAABB; die Hülle selbst
    // ist das Gesetz von _populateBlockerAABBs). Die Nähe-Liste je Tier ist gecacht — neu nach 4 m Weg oder einer Sekunde
    // Kreatur-Uhr —, die Boxen liest der Löser live (ein fahrendes Gefährt zieht sie mit). Vorher: ein Feld-Strahl je Tier
    // und Frame auf eine feste Diagonale (DDA durchs Dichtefeld + Segment gegen JEDES Bauwerk), nur im Blick, die Antwort
    // ein Math.random-Stoß — 29–37 % der CPU (OMEN-Profil), und die Tiere liefen durch Häuser (R-D7: 21 % der Frames).
    _kreaturHuellenKontakt(creature, L, px0, pz0) {
        const ud = creature.userData;
        const p = creature.position;
        // DIE GIER VOR DEM SCHRITT: „schon im Kasten“ misst die Achse in Lage UND Gier vor dem Schritt — sonst trug eine Drehung
        // die End-Achse in die Wand und machte sie frei (der Umweg dreht an der Wand: die Schnauze 0,4 m im Stein, Probe folgen)
        const gierVor = ud && Number.isFinite(ud._gierKontakt) ? ud._gierKontakt : creature.rotation.y || 0;
        if (ud) ud._gierKontakt = creature.rotation.y || 0;
        // DIE FELS-WAND (`_creatureGroundY`): die Ebene vor der Wand hält den Leib — er geht seitlich und zurück, nie hinein
        const wh = ud && ud._wandHalt;
        if (wh) {
            const ein = (p.x - wh.x) * wh.nx + (p.z - wh.z) * wh.nz;
            if (ein > 0) {
                p.x -= wh.nx * ein;
                p.z -= wh.nz * ein;
            }
        }
        const arches = this.state.architectures;
        if (!arches || !arches.length) return;
        const t = this.state.creatureAnimationTime;
        let nah = ud._huellenNah;
        if (!nah || Math.abs(p.x - nah.x) > 4 || Math.abs(p.z - nah.z) > 4 || !(t - nah.t < 1)) {
            const liste = nah ? nah.liste : [];
            liste.length = 0;
            // DIE NACHBARSCHAFT (0710-7): die Plätze um das Tier (`_blockerUmPlatz`, Obermenge in der Ordnung des Bestands),
            // dieselbe Probe je Eintrag — die Liste ist dieselbe wie die Schleife über den Bestand (gate:blocker-netz N).
            // Vorher durchlief jeder Neubau den ganzen Bestand (Mess-Wiese: 1 156 Einträge, 133 je Frame).
            const kand = this._blockerPlatzKand || (this._blockerPlatzKand = []);
            kand.length = 0;
            this._blockerUmPlatz(p.x, p.z, 8 + 1e-6, kand);
            for (let a = 0; a < kand.length; a++) {
                const e = kand[a];
                if (!e || !e.position) continue;
                const r = 8 + (e._blockerReach || 0);
                if (Math.abs(e.position.x - p.x) > r || Math.abs(e.position.z - p.z) > r) continue;
                liste.push(e);
            }
            nah = ud._huellenNah = { x: p.x, z: p.z, t, liste };
        }
        if (!nah.liste.length) return;
        // DER LEIB (_kreaturLeib, die EINE benannte Größe): drei Achsen längs der Gier, je Achse sein Radius, die Höhe vom
        // Fuß bis zum Kopf. Eine Achse, die der Löser schiebt, schiebt den ganzen Leib.
        const leib = this._kreaturLeib(creature, L, this._kreaturLeibHuelle || (this._kreaturLeibHuelle = {}));
        const radius = leib.radius;
        const halb = leib.halb;
        const feetY = p.y;
        const headY = feetY + leib.hoehe;
        const k = this._kreaturKontakt || (this._kreaturKontakt = { nx: 0, nz: 0 });
        const q = this._kreaturAchse || (this._kreaturAchse = { x: 0, z: 0 });
        const fx = leib.fx,
            fz = leib.fz;
        const [f0x, f0z] = [Math.sin(gierVor), Math.cos(gierVor)];
        // Eine Wand hält nur, wer von AUSSEN kommt: stand die Achse schon vor dem Schritt im Kasten (geboren, gestoßen,
        // eine Boden-Stufe machte eine flache Box zur Wand), stößt der Kasten sie nicht quer durch sich hinaus — sie
        // geht frei heraus. Sonst sprang ein Tier je Frame um Meter (gemessen: Tempo-Sprünge bis 7000 m/s²).
        const rInnen2 = 0.81 * radius * radius;
        // Kosten an Betroffene: eine Box, die der Leib weder erreicht (waagrecht jenseits halb + radius) noch in der Höhe
        // schneidet (unter der Stufe des Fußes oder über dem Kopf — der Löser würde sie als Wand übergehen), fällt vor
        // jeder Achse heraus. Reichweite und Innen-Test messen im Rahmen der gedrehten Box (`_boxAbstand2`, D5).
        const reich2 = (halb + radius) * (halb + radius);
        const stufe = feetY + AnazhRealm.PLAYER_STEP_UP;
        for (const e of nah.liste) {
            const boxes = e.blockerAABBs;
            if (!boxes) continue;
            for (let b = 0; b < boxes.length; b++) {
                const box = boxes[b];
                if (box.topY <= stufe || box.botY >= headY) continue;
                if (this._boxAbstand2(box, p.x, p.z) > reich2) continue;
                for (let o = -1; o <= 1; o++) {
                    const off = o * halb;
                    if (this._boxAbstand2(box, px0 + f0x * off, pz0 + f0z * off) < rInnen2) continue;
                    q.x = p.x + fx * off;
                    q.z = p.z + fz * off;
                    const ax = q.x,
                        az = q.z;
                    this._resolveCapsuleVsAABB(box, q, feetY, headY, radius, -Infinity, k);
                    p.x += q.x - ax;
                    p.z += q.z - az;
                    if (q.x !== ax || q.z !== az)
                        this._kreaturHaltMerken(
                            creature,
                            q.x - ax,
                            q.z - az,
                            (box.minX + box.maxX) / 2,
                            (box.minZ + box.maxZ) / 2
                        );
                }
            }
        }
    }

    // DIE AUFLAGE eines Tiers auf den Hüllen der Bauten (Welle LF): dieselbe Haft-Regel wie die Kapsel des Spielers
    // (_resolveCapsuleVsAABB: eine Oberkante im Band [Fuß − PLAYER_GROUND_SNAP, Fuß + PLAYER_STEP_UP] über dem Fußabdruck
    // trägt), gemessen an den drei Achsen des EINEN Leibs (_kreaturLeib); die höchste trägt. Die Nähe-Liste ist die des
    // Hüllen-Kontakts (ud._huellenNah). Keine Auflage → −Infinity.
    _kreaturAuflage(creature, L) {
        const nah = creature.userData && creature.userData._huellenNah;
        if (!nah || !nah.liste.length) return -Infinity;
        const p = creature.position;
        const leib = this._kreaturLeib(creature, L, this._kreaturLeibAuflage || (this._kreaturLeibAuflage = {}));
        const lo = p.y - AnazhRealm.PLAYER_GROUND_SNAP,
            hi = p.y + AnazhRealm.PLAYER_STEP_UP;
        const r2 = leib.radius * leib.radius;
        const reich = leib.halb + leib.radius; // der grobe Filter: ein Bau, dessen Reichweite den Leib nicht erreicht
        let top = -Infinity;
        for (const e of nah.liste) {
            const boxes = e.blockerAABBs;
            if (!boxes || !e.position) continue;
            const er = (e._blockerReach || 0) + reich;
            if (Math.abs(e.position.x - p.x) > er || Math.abs(e.position.z - p.z) > er) continue;
            for (let b = 0; b < boxes.length; b++) {
                const box = boxes[b];
                if (box.gedeckt === true || !(box.topY >= lo && box.topY <= hi) || box.topY <= top) continue; // die Fuge trägt nie
                if (
                    p.x < box.minX - reich ||
                    p.x > box.maxX + reich ||
                    p.z < box.minZ - reich ||
                    p.z > box.maxZ + reich
                )
                    continue;
                for (let o = -1; o <= 1; o++) {
                    const off = o * leib.halb;
                    if (this._boxAbstand2(box, p.x + leib.fx * off, p.z + leib.fz * off) <= r2) {
                        top = box.topY;
                        break;
                    }
                }
            }
        }
        return top;
    }

    // CHARAKTER-WANDERN, die EINE Wander-Quelle (Flucht-Fallback + NEUTRAL): ein ZUG je Zeit-Slot
    // (strideSec), Heading deterministisch aus netId × Slot (sin-Hash; ein Goldwinkel-INKREMENT wäre
    // falsch — rotierende Einheitsvektoren summieren sich zum Kreisel). Emotionen modulieren Amplitude
    // + Rhythmus (chaos bis +50 %, sorrow bis −40 %, Boden 0.3); die LEINE (leashM) zieht zum Anker
    // (Geburtsort, lazy beim ersten freien Tick — Restore-sicher).
    _creatureCharacterWander(creature, direction, speed, zeigt = true) {
        const K = AnazhRealm._verhaltenGesetz().wandern;
        const ud = creature.userData || {};
        const em = ud.emotions;
        let amp = 1 + (em ? (em.chaos || 0) * K.chaosGain - (em.sorrow || 0) * K.sorrowDamp : 0);
        if (amp < K.ampFloor) amp = K.ampFloor;
        const stride = K.strideSec / Math.max(0.5, amp);
        const t = this.state.creatureAnimationTime || 0;
        const slot = Math.floor(t / stride);
        if (ud._wanderSlot !== slot || !Number.isFinite(ud._wanderHeading)) {
            ud._wanderSlot = slot;
            const idNum = parseInt(String(ud.netId || "c0").slice(1), 10) || 0;
            const h = Math.sin((idNum * 131 + slot) * 12.9898) * 43758.5453;
            ud._wanderHeading = (h - Math.floor(h)) * Math.PI * 2;
        }
        const mag = speed * K.wanderSpeedMul * amp;
        direction.set(Math.cos(ud._wanderHeading) * mag, 0, Math.sin(ud._wanderHeading) * mag);
        // die LEINE: furchtsam bleibt nah am Anker, mutig streift weiter.
        if (!ud.wanderAnchor) ud.wanderAnchor = { x: creature.position.x, z: creature.position.z };
        const leash = this._creatureMoveCharacter(creature).leashM;
        const dx = ud.wanderAnchor.x - creature.position.x;
        const dz = ud.wanderAnchor.z - creature.position.z;
        const d = Math.hypot(dx, dz);
        // das Wandern zeigt die Tätigkeit des Tiers (Tiere K4, _kreaturTaetigkeit) — in seiner Leine; jenseits zieht es heim:
        // es ruht und äst nur in seinem Revier (vorher graste das scheue Kitz 45 m vor dem Anker im Tempo des Grasens weiter)
        ud._gezeigt = zeigt && ud._taetigkeit ? (d > leash ? "ziehen" : ud._taetigkeit) : null;
        if (d > leash) {
            const pull = K.anchorPull * speed * Math.min(1, (d - leash) / Math.max(1, leash));
            direction.x += (dx / d) * pull;
            direction.z += (dz / d) * pull;
        }
    }

    // DER BISS AUF EINE BEUTE (V18.210 §1-A3, die Jagd auf Tiere): unter allen Tieren, die Beute sind (_kreaturIstBeute),
    // das, dessen Leib das Maul am nächsten erreicht (_kreaturBissSpalt — wer außerhalb des Grob-Tors steht, kostet keine
    // Gestalt) — es setzt den EINEN Biss an (_kreaturBissAnsatz). Der Biss-Takt läuft auf der Kreatur-Uhr (Welle LF, Q1).
    _tickCreatureScentStrike(creature) {
        const HUNT = AnazhRealm._verhaltenGesetz().jagd;
        const ud = creature.userData || {};
        if (Number.isFinite(ud.nextHuntStrikeAt) && this.state.creatureAnimationTime < ud.nextHuntStrikeAt)
            return false;
        // das Maul erst, wenn ein Leib das Tor des Leibs passiert (_kreaturBissGrob) — ein ferner Jäger rechnet keine Gestalt
        let maul = null;
        let nearest = null;
        let nearestSpalt = this._kreaturBissReich(creature);
        const creatures = this.state.creatures || [];
        for (let i = 0; i < creatures.length; i++) {
            const other = creatures[i];
            if (!this._kreaturIstBeute(creature, other) || !this._kreaturBissGrob(creature, other)) continue;
            if (!maul) maul = this._kreaturMaul(creature, this._bissMaulBeute || (this._bissMaulBeute = {}));
            if (!maul) return false;
            const spalt = this._kreaturBissSpalt(creature, other, maul);
            if (spalt !== null && spalt <= nearestSpalt) {
                nearestSpalt = spalt;
                nearest = other;
            }
        }
        if (!nearest) return false;
        // Der Biss-TAKT konsumiert das tag-emergente attackSpeed-Profil (leicht+flink beißt schneller) — das Gegenstück zur
        // √I-Schwungdauer des Spielers (im Ansatz).
        const stats = this.computeCreatureStats(creature).stats || {};
        return this._kreaturBissAnsatz(creature, nearest, "jagd", Math.max(2, (stats.damage || 4) * HUNT.damageMul));
    }

    // DER BISS AUF DEN SPIELER (die Jagd): erreicht das Maul ihn, setzt das Tier den EINEN Biss an (_kreaturBissAnsatz); der
    // Schaden geht beim Schnappen durch DASSELBE damagePlayer-Tor wie die Gegenwehr (Quelle "jagd").
    _tickCreatureHuntStrike(creature) {
        const HUNT = AnazhRealm._verhaltenGesetz().jagd;
        const stats = this.computeCreatureStats(creature).stats || {};
        return this._kreaturBissAnsatz(creature, null, "jagd", Math.max(2, (stats.damage || 4) * HUNT.damageMul));
    }

    // DER BISS IST DER ANSPRUNG (Welle LF kampf, Posten 5 — K-D13): EIN Akt für alle drei Biss-Wege (Jagd auf den Spieler,
    // Jagd auf Beute, Gegenwehr). Der ANSATZ: erreicht das Maul das Ziel (_kreaturBissSpalt ≤ _kreaturBissReich — so weit
    // trägt der Ansprung den Kopf) und ist die Biss-Uhr frei, springt das Tier an — die Geste ist die Aktion pounce des
    // tetrapoda-Gesetzbuchs (_bissGesetz().geste), ihr Hüpfer das EINE Sprung-Gesetz, ihr Ansprung der Wunsch auf das Ziel
    // (updateCreatures). Gebissen wird im SCHNAPPEN (_kreaturBissTakt): wenn der Kopf den Leib berührt, nie aus der Ferne;
    // endet die Geste ohne Berührung, schnappt das Maul ins Leere. Vorher biss jedes Tier aus jagd.strikeRange 2,4 m um die
    // Mitten, ohne Geste (Leben-Schau 07.10.: 9 von 12 Bissen ohne Geste, aus 1,36–2,39 m XZ). `ziel` = ein Tier oder null
    // (der Spieler), `quelle` "jagd" | "gegenwehr", `dmg` der Schaden. Rückgabe: true, wenn der Ansprung beginnt.
    _kreaturBissAnsatz(creature, ziel, quelle, dmg) {
        const ud = creature && creature.userData;
        if (!ud) return false;
        const now = this.state.creatureAnimationTime;
        if (this._kreaturAnsprungOffen(creature)) return false; // ein Ansprung läuft
        if (Number.isFinite(ud.nextHuntStrikeAt) && now < ud.nextHuntStrikeAt) return false;
        const spalt = this._kreaturBissSpalt(creature, ziel);
        if (spalt === null || spalt > this._kreaturBissReich(creature)) return false;
        const HUNT = AnazhRealm._verhaltenGesetz().jagd;
        const def = AnazhRealm._bissGesetz().geste;
        const stats = this.computeCreatureStats(creature).stats || {};
        ud.nextHuntStrikeAt =
            now + HUNT.strikeCooldownSec / Math.max(0.25, Number.isFinite(stats.attackSpeed) ? stats.attackSpeed : 1);
        ud.lastHuntAt = now;
        ud._verhaltenAktion = {
            name: "pounce",
            def,
            start: now,
            bis: now + this._kreaturSprungZeit(creature),
            bissAkt: true,
            biss: { ziel: ziel || null, quelle, dmg },
        };
        if (def.hop === true) this.creatureJump(creature, true);
        this._feelCreatureAction(creature, "attack", 1);
        return true;
    }

    // DER OFFENE ANSPRUNG (K13) — die EINE Frage aller Biss-Wege (Ansatz, Schnappen, Wunsch, Verhaltens-Takt): ein Ansprung ist
    // offen, solange seine Geste läuft (Kreatur-Uhr < bis) oder sein Biss noch nicht geschnappt hat und der Leib noch nicht
    // steht (der Hüpfer in der Luft) — die Landung gehört zum Sprung.
    _kreaturAnsprungOffen(creature) {
        const ud = creature && creature.userData;
        const A0 = ud && ud._verhaltenAktion;
        if (!A0 || !A0.bissAkt) return false;
        if (this.state.creatureAnimationTime < A0.bis) return true;
        return !!A0.biss && (ud._hopH > 0 || ud._hopV > 0);
    }

    // DAS SCHNAPPEN (je Kreatur-Takt, solange ein Ansprung offen ist — nach der Lage und der Pose des Takts): berührt der Kopf
    // den Leib des Ziels (_kreaturBissKontakt), beißt das Tier EINMAL — der Schaden durch das Tor des Ziels (damagePlayer /
    // damageCreature), der Stoß durch das EINE Impuls-Gesetz (_bissStoss). Ein Ziel, das stirbt oder fort ist, schließt den Biss
    // ohne Schaden, ebenso das Ende des Ansprungs (_kreaturAnsprungOffen): DIE LANDUNG ZÄHLT NOCH (K13) — der Takt, in dem der
    // Leib aufsetzt, trägt den Kopf auf den Leib; vorher schloss die Uhr der Geste den Biss in genau diesem Takt, bevor der Kopf
    // ihn berührte (ein ruhiger Fuchs: der Spalt −0,03 m im Landungs-Takt, kein Biss).
    _kreaturBissTakt(creature) {
        const ud = creature.userData;
        const A0 = ud && ud._verhaltenAktion;
        const B = A0 && A0.biss;
        if (!B) return;
        const ziel = B.ziel;
        if (ziel && this.state.creatures.indexOf(ziel) === -1) {
            A0.biss = null; // ins Leere
            return;
        }
        if (!this._kreaturBissKontakt(creature, ziel)) {
            if (!this._kreaturAnsprungOffen(creature)) {
                A0.biss = null; // gelandet, ins Leere
                return;
            }
            const m = this._kreaturMaul(creature, this._bissMaulKon || (this._bissMaulKon = {}));
            if (m) this._kreaturBissKopf(creature, A0, m, ziel);
            return;
        }
        A0.biss = null; // der Biss schnappt — EINMAL je Ansprung
        if (ziel) {
            const res = this.damageCreature(ziel, B.dmg, { source: B.quelle });
            if (res && res.ok && !res.killed) this._bissStoss(creature, ziel);
            return;
        }
        const gnade = this.state.player.respawnGraceUntil; // der tödliche Biss stößt nie den Wiedergekehrten (K5)
        if (this.damagePlayer(B.dmg, B.quelle) && this.state.player.respawnGraceUntil === gnade)
            this._bissStoss(creature, null);
        const name = ud.name || "Ein wildes Wesen";
        if (B.quelle === "gegenwehr") {
            this.log(`${name} wehrt sich!`, "INFO");
            return;
        }
        this.log(`${name} jagt dich!`, "WARN");
        if (typeof this.journalAppendOnce === "function") {
            this.journalAppendOnce(
                `hunted:${name}`,
                "relationship",
                AnazhRealm._datum`${name} witterte dich als Beute — die Wildnis hat Zähne.`
            );
        }
    }

    // DAS MAUL (Posten 5): der Kopf der Gestalt — die Treffer-Glieder der Zone kopf (tetrapoda trefferZone) in der laufenden
    // Pose, dieselbe Gestalt, die die Klinge trifft. `out` = die Kopf-Kapsel in der Welt (a, b, r) und vorM: wie weit ihre
    // Spitze waagrecht um die Mitte des Leibs reicht (das Maul, wenn das Tier sich dem Ziel zuwendet). null = keine Gestalt —
    // ein Leib ohne Kopf beißt nicht.
    _kreaturMaul(creature, out) {
        const gl = this._kreaturTrefferGlieder(creature);
        if (!gl) return null;
        const v = this._maulVek || (this._maulVek = [new THREE.Vector3(), new THREE.Vector3()]);
        const cx = creature.position.x,
            cz = creature.position.z;
        const o = out || {};
        let best = -Infinity;
        for (const g of gl) {
            if (g.zone !== "kopf") continue;
            g.anker.updateWorldMatrix(true, false);
            const pa = v[0].copy(g.a).applyMatrix4(g.anker.matrixWorld);
            const pb = v[1].copy(g.b).applyMatrix4(g.anker.matrixWorld);
            const rg = g.r * g.anker.matrixWorld.getMaxScaleOnAxis();
            const spanne = Math.max(Math.hypot(pa.x - cx, pa.z - cz), Math.hypot(pb.x - cx, pb.z - cz)) + rg;
            if (spanne <= best) continue;
            best = spanne;
            o.ax = pa.x;
            o.ay = pa.y;
            o.az = pa.z;
            o.bx = pb.x;
            o.by = pb.y;
            o.bz = pb.z;
            o.r = rg;
            o.vorM = spanne;
        }
        return best > -Infinity ? o : null;
    }

    // DAS TEMPO DES ANSPRUNGS (m/s): pounce.tempo × die Tempo-Einheit der Hüft-Höhe — dasselbe Tempo, mit dem der Biss stößt
    // (_bissStoss). DIE REICHWEITE (m): so weit trägt es den Kopf, solange der Ansprung dauert (_kreaturSprungZeit).
    _kreaturBissTempo(creature) {
        return AnazhRealm._bissGesetz().tempo * AnazhRealm._steuerGesetz().tempoEinheit(this._kreaturHueftL(creature));
    }
    _kreaturBissReich(creature) {
        return this._kreaturBissTempo(creature) * this._kreaturSprungZeit(creature);
    }

    // DER SPALT, DEN DER ANSPRUNG SCHLIESSEN MUSS (m, Welle LF kampf Nachbesserung 2): erreicht ein Ansprung den Leib, ist es der
    // waagrechte Spalt vor dem Maul (_kreaturBissRadial); erreicht ihn keiner, ist er unendlich. Ihn lesen alle drei Biss-Wege
    // gegen _kreaturBissReich (der Ansatz _kreaturBissAnsatz, die Gegenwehr, die Wahl der Beute). Zwei Tore vor der Gestalt:
    // (1) DIE HÖHE — höher als der Kopf plus die Höhe des Sprungs trägt kein Ansprung: liegt die Unterkante des Leibs darüber
    // (der Spieler auf einem Sims, über einem Abhang), erreicht ihn kein Sprung, wie nah er auch steht. Vorher war der Rest nach
    // oben ein Teil des waagrechten Spalts und wurde gegen die waagrechte Reichweite gemessen — ein Wolf unter einem Sims, das
    // 1 m über seinem Sprung lag, sprang alle 1,6 s ins Leere. (2) DAS GROB-TOR des Leibs (_trefferErreichbar, dieselbe
    // Reichweite, die Klinge und Pfeil fragen): liegt die Mitte des Ziels weiter als Maul + Ansprung + die Spanne seiner Gestalt,
    // rechnet keine Gestalt (Lehre 25 — vorher rechnete die Wahl der Beute je Takt die ganze Gestalt jedes Beutetiers der Welt
    // samt erzwungener Welt-Matrix: 1,29–2,35 ms je Jäger bei 15 Tieren). Vor beiden steht das Tor des LEIBS (_kreaturBissGrob):
    // weder das Maul des Jägers noch die Gestalt des Ziels wird gerechnet, solange der ganze Leib samt Ansprung es nicht
    // erreicht. null = kein Maul oder ein Ziel ohne Gestalt.
    _kreaturBissSpalt(creature, ziel, maul) {
        if (!this._kreaturBissGrob(creature, ziel)) return Infinity;
        const m = maul || this._kreaturMaul(creature, this._bissMaulRad || (this._bissMaulRad = {}));
        if (!m) return null;
        const kopfOben =
            Math.max(m.ay, m.by) +
            m.r +
            (AnazhRealm._bissGesetz().geste.hop ? this._kreaturSprungHoehe(creature, true) : 0);
        if (!ziel) {
            const K = this._spielerKapsel(this._bissKapsel || (this._bissKapsel = {}));
            if (K.y0 > kopfOben) return Infinity;
            return this._kreaturBissRadial(creature, null, m);
        }
        if (ziel.position.y > kopfOben) return Infinity;
        const reich = this._kreaturBissReich(creature);
        if (!this._trefferErreichbar(ziel, creature.position.x, creature.position.z, m.vorM + reich)) return Infinity;
        if (!this._kreaturTrefferGlieder(ziel)) return null;
        return this._kreaturBissRadial(creature, ziel, m);
    }

    // DAS TOR DES LEIBS VOR JEDER GESTALT (Welle LF kampf Nachbesserung 3, Lehre 14/25): erreicht der ganze Leib des Jägers —
    // seine Reichweite (_kreaturLeib, sie deckt jedes Glied samt Maul, gate:kampf-gefuehl T12) — mit dem Ansprung
    // (_kreaturBissReich) das Ziel überhaupt (der Leib des Tiers, _trefferErreichbar; die Kapsel des Spielers)? Ohne jede
    // Gestalt: weder das Maul des Jägers noch die Glieder des Ziels werden zerlegt, solange es zu ist. Vorher zerlegte die Wahl
    // der Beute eine noch kalte Gattung synchron im Kreatur-Takt, an der Bake-Uhr vorbei — der Wolf sein Maul in 21,2 ms, die
    // Gestalt eines Fuchses 4,9 ms, beide 35 m außer Reichweite.
    _kreaturBissGrob(creature, ziel) {
        const L = this._kreaturLeib(creature, 0, this._bissGrobLeib || (this._bissGrobLeib = {}));
        const spanne = L.reichweite + this._kreaturBissReich(creature);
        const cx = creature.position.x,
            cz = creature.position.z;
        if (ziel) return this._trefferErreichbar(ziel, cx, cz, spanne);
        const K = this._spielerKapsel(this._bissKapsel || (this._bissKapsel = {}));
        return Math.hypot(K.x - cx, K.z - cz) - K.r <= spanne;
    }

    // DER SPALT VOR DEM MAUL (m, waagrecht), wenn das Tier sich dem Ziel zuwendet: der Abstand seiner Mitte zum Leib des Ziels
    // — der Spieler-Kapsel (_spielerKapsel) oder der Gestalt eines Tiers (seine Treffer-Glieder, dieselben, die das Maul
    // berühren muss) — weniger die Spanne des Mauls (vorM). Ihn liest die Hetze, die dort hält, wo das Maul den Leib waagrecht
    // erreicht (unter einem Sims wartet der Jäger, statt in den Fels zu laufen); ob ein Ansprung ihn schließt, sagt
    // _kreaturBissSpalt. null = kein Maul oder ein Ziel ohne Gestalt.
    _kreaturBissRadial(creature, ziel, maul) {
        const m = maul || this._kreaturMaul(creature, this._bissMaulRad || (this._bissMaulRad = {}));
        if (!m) return null;
        const cx = creature.position.x,
            cz = creature.position.z;
        if (!ziel) {
            const K = this._spielerKapsel(this._bissKapsel || (this._bissKapsel = {}));
            return Math.hypot(K.x - cx, K.z - cz) - m.vorM - K.r;
        }
        const gl = this._kreaturTrefferGlieder(ziel);
        if (!gl) return null;
        this._leibMatrix(ziel);
        const v = this._maulVek2 || (this._maulVek2 = [new THREE.Vector3(), new THREE.Vector3()]);
        let best = Infinity;
        for (const g of gl) {
            const pa = v[0].copy(g.a).applyMatrix4(g.anker.matrixWorld);
            const pb = v[1].copy(g.b).applyMatrix4(g.anker.matrixWorld);
            const ux = pb.x - pa.x,
                uz = pb.z - pa.z;
            const uu = ux * ux + uz * uz;
            const t = uu > 1e-12 ? Math.max(0, Math.min(1, ((cx - pa.x) * ux + (cz - pa.z) * uz) / uu)) : 0;
            const d =
                Math.hypot(cx - pa.x - ux * t, cz - pa.z - uz * t) - g.r * g.anker.matrixWorld.getMaxScaleOnAxis();
            if (d < best) best = d;
        }
        return best - m.vorM;
    }

    // DER WEG DES KOPFES (m, waagrecht, Posten 5): wie weit die Kopf-Kapsel (_kreaturMaul) noch von der Mittel-Linie des
    // Leibs liegt — der Achse der Spieler-Kapsel, dem nächsten Treffer-Glied eines Tiers. Der Ansprung trägt den Kopf über
    // den Leib, nicht an seinen Rand (am Rand fiele er daneben, über einem kleinen Leib fiele er darüber hinweg). null = ein
    // Ziel ohne Gestalt.
    _kreaturBissKopfWeg(ziel, m) {
        let d2 = Infinity;
        if (!ziel) {
            const K = this._spielerKapsel(this._bissKapsel || (this._bissKapsel = {}));
            d2 = this._segSegDistSq(m.ax, 0, m.az, m.bx, 0, m.bz, K.x, 0, K.z, K.x, 0, K.z);
        } else {
            const gl = this._kreaturTrefferGlieder(ziel);
            if (!gl) return null;
            this._leibMatrix(ziel);
            const v = this._maulVek2 || (this._maulVek2 = [new THREE.Vector3(), new THREE.Vector3()]);
            for (const g of gl) {
                const pa = v[0].copy(g.a).applyMatrix4(g.anker.matrixWorld);
                const pb = v[1].copy(g.b).applyMatrix4(g.anker.matrixWorld);
                d2 = Math.min(d2, this._segSegDistSq(m.ax, 0, m.az, m.bx, 0, m.bz, pa.x, 0, pa.z, pb.x, 0, pb.z));
            }
        }
        return Math.sqrt(d2) - m.r;
    }

    // DER KOPF ZIELT (Posten 5): im Ansprung neigt das Tier den Kopf auf den Leib des Ziels — die Schnauze (vom Kopf-Gelenk zur
    // Spitze der Kopf-Kapsel) auf den nächsten Punkt seines Leibs (die Achse der Spieler-Kapsel, das nächste Treffer-Glied). Die
    // Neigung lebt an der Geste (`VA.kopfZiel`, rad, Nase abwärts positiv wie headX), _animateTierBaum trägt sie auf den Kopf;
    // je Takt rückt sie um den Rest-Winkel nach (die Pose des Takts zeigt, wohin die Schnauze jetzt weist).
    _kreaturBissKopf(creature, VA, m, ziel) {
        const kopf = creature.userData._tierBaum && creature.userData._tierBaum.teile.headGroup;
        if (!kopf) return;
        const H = kopf.getWorldPosition(this._bissKopfH || (this._bissKopfH = new THREE.Vector3()));
        // die Spitze: das Ende der Kopf-Kapsel, das weiter vom Gelenk liegt
        const da = (m.ax - H.x) ** 2 + (m.ay - H.y) ** 2 + (m.az - H.z) ** 2;
        const db = (m.bx - H.x) ** 2 + (m.by - H.y) ** 2 + (m.bz - H.z) ** 2;
        const sx = db >= da ? m.bx : m.ax,
            sy = db >= da ? m.by : m.ay,
            sz = db >= da ? m.bz : m.az;
        let zx, zy, zz;
        if (!ziel) {
            const K = this._spielerKapsel(this._bissKapsel || (this._bissKapsel = {}));
            zx = K.x;
            zy = Math.max(K.y0 + K.r, Math.min(K.y1 - K.r, H.y));
            zz = K.z;
        } else {
            const gl = this._kreaturTrefferGlieder(ziel);
            if (!gl) return;
            const v = this._maulVek2 || (this._maulVek2 = [new THREE.Vector3(), new THREE.Vector3()]);
            let bd = Infinity;
            for (const g of gl) {
                const pa = v[0].copy(g.a).applyMatrix4(g.anker.matrixWorld);
                const pb = v[1].copy(g.b).applyMatrix4(g.anker.matrixWorld);
                const d2 = this._segSegDistSq(H.x, H.y, H.z, H.x, H.y, H.z, pa.x, pa.y, pa.z, pb.x, pb.y, pb.z);
                if (d2 >= bd) continue;
                bd = d2;
                const t = this._segSegST.t;
                zx = pa.x + (pb.x - pa.x) * t;
                zy = pa.y + (pb.y - pa.y) * t;
                zz = pa.z + (pb.z - pa.z) * t;
            }
            if (!(bd < Infinity)) return;
        }
        const BG = AnazhRealm._bissGesetz();
        // DER REST ZÄHLT AB DER GEZEIGTEN POSE (Nachbesserung 2): gemessen wird an der Pose dieses Takts, die die Haltung TRÄGT
        // (_animateTierBaum: g.bissRumpf · g.bissKopf, mit der Folge-Rate der Glieder hinter dem Ziel); das neue Ziel ist sie
        // plus der Rest. Vorher zählte der Rest auf das ZIEL des Vor-Takts: solange die Pose nachlief, summierte er sich je
        // Takt auf und lief bis an die Klemme — der Kopf stürzte unter den Leib (Spalt 0,06–0,16 m, 7 von 7 Ansprüngen auf
        // ein gestelltes Reh ins Leere).
        const gang = creature.userData._tierBaum._gang || {};
        // die Front: liegt der Punkt tiefer als das Kopf-Gelenk, senkt sich der Rumpf (um sein Gelenk), bis das Kopf-Gelenk auf
        // seiner Höhe steht — höchstens rumpfNeigung; nie hebt er sich (ein höheres Ziel erreicht der Kopf allein)
        const rumpf = creature.userData._tierBaum.teile.wolf;
        if (rumpf) {
            const R = rumpf.getWorldPosition(this._bissRumpfR || (this._bissRumpfR = new THREE.Vector3()));
            const hebel = Math.max(0.1, Math.hypot(H.x - R.x, H.z - R.z));
            VA.rumpfZiel = Math.max(0, Math.min(BG.rumpfNeigung, (gang.bissRumpf || 0) + Math.atan2(H.y - zy, hebel)));
        }
        const ist = Math.atan2(H.y - sy, Math.hypot(sx - H.x, sz - H.z));
        const soll = Math.atan2(H.y - zy, Math.hypot(zx - H.x, zz - H.z));
        VA.kopfZiel = Math.max(BG.kopfNeigung[0], Math.min(BG.kopfNeigung[1], (gang.bissKopf || 0) + soll - ist));
    }

    // DIE BERÜHRUNG: der Kopf (_kreaturMaul) am Leib des Ziels — an der Spieler-Kapsel (die Achse zwischen ihren Kappen, ihr
    // Radius) oder an der Gestalt eines Tiers (_kreaturGliedTreffer, dieselben Glieder, die Klinge und Pfeil treffen).
    _kreaturBissKontakt(creature, ziel) {
        const m = this._kreaturMaul(creature, this._bissMaulKon || (this._bissMaulKon = {}));
        if (!m) return false;
        if (ziel) return this._kreaturGliedTreffer(ziel, m.ax, m.ay, m.az, m.bx, m.by, m.bz, m.r) !== null;
        const K = this._spielerKapsel(this._bissKapsel || (this._bissKapsel = {}));
        const rr = m.r + K.r;
        return (
            this._segSegDistSq(m.ax, m.ay, m.az, m.bx, m.by, m.bz, K.x, K.y0 + K.r, K.z, K.x, K.y1 - K.r, K.z) <=
            rr * rr
        );
    }

    // Direction-Berechnung für den aktiven Task. Liefert immer einen
    // THREE.Vector3 (nullt bei wait, Spieler-Vektor bei follow_player,
    // null bei wander → Caller fällt auf heutige Emotion-Logik zurück).
    _tickCreatureTaskDirection(creature, task, emotion) {
        if (!task || task.name === "wander") return null;
        // Alle Task-Return-Richtungen teilen EINEN Scratch-Vector3 (`_creatureTaskScratchDir`), keine
        // Allokation je Aufruf. Sicher, weil updateCreatures den Wert SYNCHRON liest und in
        // creature.position schreibt, bevor die nächste Kreatur dran ist.
        if (task.name === "wait") return this._creatureTaskOutDir().set(0, 0, 0);
        if (task.name === "follow_player") return this._tickCreatureFollowPlayer(creature, task, emotion);
        if (task.name === "gather") return this._tickCreatureGather(creature, task);
        if (task.name === "build") return this._tickCreatureBuild(creature, task);
        if (task.name === "drink") return this._tickCreatureDrink(creature, task);
        return null;
    }

    // Trinken am Ufer, drei Phasen: suchen (Ring-Scan nach Wasser; keins im Radius → wander +
    // "no_water"-memory + Journal) · walken (Distanz > HALT_DIST; Y-Override schwimmt durch Wasser-
    // Cells) · trinken (≤ HALT_DIST: DURATION_S stehen, dann happy + "drank"-memory + Journal → wander).
    _tickCreatureDrink(creature, task) {
        const out = this._creatureTaskOutDir();
        const HALT_DIST = AnazhRealm.CREATURE_DRINK_HALT_DIST;
        const DURATION_S = AnazhRealm.CREATURE_DRINK_DURATION_S;
        const SEARCH_RADIUS = AnazhRealm.CREATURE_DRINK_SEARCH_RADIUS;
        const SPEED = AnazhRealm.CREATURE_DRINK_SPEED;
        const cx = creature.position.x;
        const cz = creature.position.z;
        // Phase 1: Wasser-Punkt suchen wenn keiner gesetzt.
        const now = this.state.creatureAnimationTime; // das Trinken läuft auf der Kreatur-Uhr (Welle LF, Q1)
        const ud = creature.userData;
        // DER DURST TRINKT NUR IN RUHE (Tiere K4): wer aus Durst zum Wasser zieht, flieht vor der Bedrohung
        const durst = task.args.durst === true;
        if (durst && this._creatureWariness(creature) >= AnazhRealm._verhaltenGesetz().furcht.fleeThreshold) {
            this.assignCreatureTask(creature, "wander", {}, { silent: true });
            return null;
        }
        if (!task.args._target) {
            const water = this._findNearestWaterPoint(cx, cz, SEARCH_RADIUS);
            if (!water && durst) {
                ud._durstSucheBis = now + AnazhRealm._lebensraumGesetz().D.suchPauseS;
                this.assignCreatureTask(creature, "wander", {}, { silent: true });
                return null;
            }
            if (!water) {
                this._creatureRemember(creature, "no_water", { searchedFrom: { x: cx, z: cz } });
                if (typeof this.journalAppend === "function") {
                    this.journalAppend("reach", "Eine Kreatur sucht Wasser — aber das nächste Ufer ist zu fern.", {
                        creatures_total: this.state.creatures.length,
                    });
                }
                this.assignCreatureTask(creature, "wander", {}, { silent: true });
                return null;
            }
            task.args._target = water;
        }
        const tx = task.args._target.x;
        const tz = task.args._target.z;
        const dx = tx - cx;
        const dz = tz - cz;
        const dist = Math.hypot(dx, dz);
        // Phase 3: am Wasser angekommen → trinken (Pause + Happiness). DAS MAUL AM UFER (Tiere K4): am Ziel oder, wo die Brust
        // über dem Wasser steht (`_nassAt` die halbe Länge voraus) — die Herde trinkt nebeneinander. Vorher drängten sich die
        // Durstigen eines Wurfs um ihre Ziel-Punkte (Probe tagesbudget: neun Tiere bis 1 250 s im Auftrag).
        const hL = this._kreaturHalbLaenge(creature);
        const gier = creature.rotation.y;
        if (dist <= HALT_DIST || this._nassAt(cx + Math.sin(gier) * hL, cz + Math.cos(gier) * hL, 0.2)) {
            if (!task.args._drinkStart) {
                task.args._drinkStart = now;
                // Das Tier ruft zum Trink-Beginn (seine Stimme, multisensorisch — Vision §1.2).
                this._tierRuf(creature);
            }
            if (now - task.args._drinkStart >= DURATION_S) {
                ud._getrunken = now; // der Durst ist gestillt (Tiere K4)
                if (durst) {
                    this.assignCreatureTask(creature, "wander", {}, { silent: true });
                    return null;
                }
                // Trinken vollendet → Sättigung fühlt sich als Fülle (harvest:
                // joy+hope, V18.100 G4-1 — dasselbe Substrat wie der Spieler;
                // die "happy"-Projektion fällt aus der Valenz) + Erinnerung + wander.
                this._feelCreatureAction(creature, "harvest", 2);
                this._creatureRemember(creature, "drank", {
                    at: { x: tx, z: tz },
                    durationS: DURATION_S,
                });
                if (typeof this.journalAppend === "function") {
                    const cname = (creature.userData && creature.userData.name) || "Kreatur";
                    this.journalAppend(
                        "growth",
                        AnazhRealm._datum`${cname} trank am Ufer — das Wasser nährte sie, sie fühlt sich erfrischt.`,
                        { creatures_total: this.state.creatures.length }
                    );
                }
                this.assignCreatureTask(creature, "wander", {}, { silent: true });
                return null;
            }
            // Pausen-Phase — stehen (der Gang trägt die Ruhe-Animation).
            return out.set(0, 0, 0);
        }
        // Phase 2: walk Richtung Ziel (das Ankunfts-Gesetz bremst vor dem Halt). Am Ufer drängen sich die Trinker wie die
        // Fresser am Kadaver (_kreaturAasZug): kein Anstellen hinter einem, der dort ruht oder äst — die Separation weicht.
        const speed = SPEED * this._creatureBodySpeedMultiplier(creature);
        return this._kreaturZiel(out, dx, dz, dist - HALT_DIST, speed, null, creature);
    }

    // Ring-Scan: konzentrische Ringe in 4-m-Schritten bis radius, je Ring so viele Richtungen, dass der Bogen
    // zwischen zwei Proben ≤ 4 m bleibt (bis 06.10. 8 Strahlen: bei 80 m lagen 63 m zwischen zwei Proben, ein Bach
    // fiel durch); der erste Treffer gewinnt — innen nach außen = kürzeste Distanz. Treffer = Wasser oder sein Rand (bis
    // 0,2 m über dem Spiegel), wie der Körper es trägt (`_nassAt` über `_koerperWasser`); bis zur Gegenprüfung der Welle L
    // die Zwillings-Probe des Lands (34 von 451 Zielen trocken). → {x, z} | null. `land`: der nächste TROCKENE Fleck (das
    // Ufer dessen, der im Wasser steht: „am Wasser" der DSL) — dieselbe Spalten-Probe, 0,4 m über dem Spiegel.
    _findNearestWaterPoint(cx, cz, radius, land = false) {
        const STEP = 4;
        for (let r = STEP; r <= radius; r += STEP) {
            const DIRS = Math.max(8, Math.ceil((2 * Math.PI * r) / STEP));
            for (let d = 0; d < DIRS; d++) {
                const angle = (d / DIRS) * Math.PI * 2;
                const x = cx + Math.cos(angle) * r;
                const z = cz + Math.sin(angle) * r;
                if (land ? this._landAt(x, z, 0.4) : this._nassAt(x, z, 0.2)) {
                    return { x, z };
                }
            }
        }
        return null;
    }

    _creatureTaskOutDir() {
        return this._creatureTaskScratchDir || (this._creatureTaskScratchDir = new THREE.Vector3());
    }

    // Welle 6.H — folgt dem Spieler bis CREATURE_FOLLOW_DISTANCE (oder task-
    // spezifischer Halt-Distanz). Happy-Emotion läuft volle Speed, sonst 70%.
    _tickCreatureFollowPlayer(creature, task, emotion) {
        const out = this._creatureTaskOutDir();
        const player = this.state.playerMesh ? this.state.playerMesh.position : null;
        if (!player) return out.set(0, 0, 0);
        const haltDist =
            Number.isFinite(task.args?.distance) && task.args.distance > 0
                ? Math.min(20, Math.max(0.5, task.args.distance))
                : AnazhRealm.CREATURE_FOLLOW_DISTANCE;
        const dx = player.x - creature.position.x;
        const dz = player.z - creature.position.z;
        const dist = Math.hypot(dx, dz);
        if (dist <= haltDist) {
            // DAS WESEN ERINNERT, WEM ES FOLGTE (KI K3): angekommen beim Spieler, einmal je Auftrag — das Gespräch liest es
            if (!task.erinnert) ((task.erinnert = true), this._creatureRemember(creature, "gefolgt", {}));
            return out.set(0, 0, 0);
        }
        const speed =
            emotion === "happy" ? AnazhRealm.CREATURE_FOLLOW_MAX_SPEED : AnazhRealm.CREATURE_FOLLOW_MAX_SPEED * 0.7;
        return this._kreaturZiel(out, dx, dz, dist - haltDist, speed, creature);
    }

    // Welle 6.H Phase 2B.5 — zwei-Phasen-gather (Vision §1.1 Beziehungs-Geste):
    // Phase 1 = sucht Material + erntet (cyan-Aura); Phase 2 = trägt Ernte zum
    // Spieler + übergibt (purple-Aura via _refreshCreatureCarryingVisual).
    _tickCreatureGather(creature, task) {
        const out = this._creatureTaskOutDir();
        const material = task.args && task.args.material;
        if (typeof material !== "string" || material.length === 0) {
            this.assignCreatureTask(creature, "wander", {}, { silent: true });
            return null;
        }
        const carrying = creature.userData && creature.userData.carrying;
        if (carrying) {
            // BRING-PHASE: zurück zum Spieler, dann übergeben.
            const player = this.state.playerMesh ? this.state.playerMesh.position : null;
            if (!player) return out.set(0, 0, 0);
            const dxp = player.x - creature.position.x;
            const dzp = player.z - creature.position.z;
            const distp = Math.hypot(dxp, dzp);
            const handover = AnazhRealm.CREATURE_HANDOVER_DIST;
            if (distp <= handover) {
                // Übergabe: jedes Material aus carrying ins Spieler-Inventar.
                const summary = [];
                for (const [mat, n] of Object.entries(carrying.materials || {})) {
                    if (this.addMaterialToInventory(mat, n)) {
                        summary.push(`${n}× ${mat}`);
                    }
                }
                this._creatureRemember(creature, "delivered", {
                    materials: carrying.materials,
                    blueprint: carrying.blueprint,
                });
                if (typeof this.journalAppend === "function" && summary.length > 0) {
                    this.journalAppend(
                        "growth",
                        AnazhRealm._datum`Eine Kreatur übergab dem Schöpfer: ${summary.join(", ")}.`,
                        {
                            materials: carrying.materials,
                            blueprint: carrying.blueprint,
                        }
                    );
                }
                creature.userData.carrying = null;
                if (typeof this._refreshCreatureCarryingVisual === "function") {
                    this._refreshCreatureCarryingVisual(creature);
                }
                this._uiDirty("hof"); // W3 (V18.176) — der UI-Puls (war _renderCreatureListUI direkt)
                return out.set(0, 0, 0);
            }
            const speed =
                AnazhRealm.CREATURE_GATHER_SPEED *
                this._creatureTaskSpeedMultiplier(creature, "gather", task.args) *
                this._creatureBodySpeedMultiplier(creature);
            return this._kreaturZiel(out, dxp, dzp, distp - handover, speed, creature);
        }
        // ERNTE-PHASE: Ziel suchen, hingehen, harvesten.
        let target = task.args._target;
        // Ein INSTANZIERTER Eintrag (Foundry/HISM, der Normalfall) trägt KEIN .mesh (lebt in instSlots) —
        // nacktes `!target.mesh` hieße „weg“ und erzwänge jeden Tick einen Nearest-Scan.
        // Weg = aus der Welt entfernt ODER weder Mesh noch Instanz.
        const targetGone = !target || !this.state.architectures.includes(target) || (!target.mesh && !target.instanced);
        if (targetGone) {
            target = this._findNearestArchitectureWithMaterial(creature.position, material);
            if (!target) {
                this._creatureRemember(creature, "no_material", { material });
                if (typeof this._creatureSpeakProactive === "function") {
                    this._creatureSpeakProactive(creature, "no_material_found", { material });
                }
                if (typeof this.journalAppend === "function") {
                    this.journalAppend(
                        "reach",
                        AnazhRealm._datum`Eine Kreatur findet kein „${material}" in der Nähe.`,
                        {
                            material,
                            creatures_total: this.state.creatures.length,
                        }
                    );
                }
                this.assignCreatureTask(creature, "wander", {}, { silent: true });
                return null;
            }
            task.args._target = target;
        }
        const dx = target.position.x - creature.position.x;
        const dz = target.position.z - creature.position.z;
        const dist = Math.hypot(dx, dz);
        if (dist <= AnazhRealm.CREATURE_GATHER_HALT_DIST) {
            // Angekommen — ernten via harvestArchitecture (EINE Funktion,
            // Spieler-LMB nutzt dieselbe). Materialien gehen in carrying,
            // nicht direkt ins Spieler-Inventar — Bring-Phase folgt.
            const harvesterName = (creature.userData && creature.userData.name) || "Kreatur";
            const harvest = this.harvestArchitecture(target, `creature:${harvesterName}`);
            task.args._target = null;
            if (harvest && harvest.materials && Object.keys(harvest.materials).length > 0) {
                creature.userData = creature.userData || {};
                creature.userData.carrying = {
                    materials: { ...harvest.materials },
                    blueprint: harvest.blueprint,
                    since: performance.now() / 1000,
                };
                if (typeof this._refreshCreatureCarryingVisual === "function") {
                    this._refreshCreatureCarryingVisual(creature);
                }
                this._creatureRemember(creature, "gathered", {
                    material,
                    blueprint: harvest.blueprint,
                    materials: harvest.materials,
                });
            }
            this._uiDirty("hof"); // W3 (V18.176) — der UI-Puls (war _renderCreatureListUI direkt)
            return out.set(0, 0, 0); // diesen Tick stehen, nächster sucht neues Ziel
        }
        const speed =
            AnazhRealm.CREATURE_GATHER_SPEED *
            this._creatureTaskSpeedMultiplier(creature, "gather", task.args) *
            this._creatureBodySpeedMultiplier(creature);
        return this._kreaturZiel(out, dx, dz, dist - AnazhRealm.CREATURE_GATHER_HALT_DIST, speed, creature);
    }

    // Build = Umkehrung zu gather: take (zum Spieler, Material aus dem Inventar, modus-gated via
    // _buildMaterialGate — pfad und frieden zahlen, schöpfer frei) → walk (bis CREATURE_BUILD_PLACEMENT_DIST) →
    // spawn (Architektur am Kreatur-Ort). Ablehnungen fallen auf wander mit memory + Journal.
    _tickCreatureBuild(creature, task) {
        const out = this._creatureTaskOutDir();
        const blueprint = task.args && task.args.blueprint;
        if (typeof blueprint !== "string" || blueprint.length === 0) {
            this.assignCreatureTask(creature, "wander", {}, { silent: true });
            return null;
        }
        const bp = this.state.blueprints && this.state.blueprints[blueprint];
        if (!bp) {
            this._creatureRemember(creature, "no_blueprint", { blueprint });
            if (typeof this.journalAppend === "function") {
                this.journalAppend("reach", AnazhRealm._datum`Eine Kreatur kennt den Bauplan „${blueprint}" nicht.`, {
                    blueprint,
                });
            }
            this.assignCreatureTask(creature, "wander", {}, { silent: true });
            return null;
        }
        const carrying = creature.userData && creature.userData.carrying;
        const player = this.state.playerMesh ? this.state.playerMesh.position : null;
        if (!player) return out.set(0, 0, 0);
        const buildSpeed =
            AnazhRealm.CREATURE_BUILD_SPEED *
            this._creatureTaskSpeedMultiplier(creature, "build", task.args) *
            this._creatureBodySpeedMultiplier(creature);
        if (!carrying) {
            // TAKE-PHASE: zum Spieler laufen, Material entnehmen.
            const dxp = player.x - creature.position.x;
            const dzp = player.z - creature.position.z;
            const distp = Math.hypot(dxp, dzp);
            const handover = AnazhRealm.CREATURE_HANDOVER_DIST;
            if (distp <= handover) {
                // Material entnehmen — selber modus-gated Pfad wie Spieler-
                // confirmBuild (pfad+frieden konsumieren, nur schöpfer kostenlos — S2/§11.2).
                const gate = this._buildMaterialGate(blueprint);
                if (!gate.ok) {
                    const missingStr = Object.entries(gate.missing || {})
                        .map(([m, n]) => `${n}× ${m}`)
                        .join(", ");
                    this._creatureRemember(creature, "no_inventory_for_build", {
                        blueprint,
                        missing: gate.missing,
                    });
                    if (typeof this._creatureSpeakProactive === "function") {
                        this._creatureSpeakProactive(creature, "no_inventory_for_build", { blueprint });
                    }
                    if (typeof this.journalAppend === "function") {
                        this.journalAppend(
                            "reach",
                            AnazhRealm._datum`Der Schöpfer hat kein Material für „${blueprint}" (fehlt: ${missingStr}).`,
                            { blueprint, missing: gate.missing }
                        );
                    }
                    this.assignCreatureTask(creature, "wander", {}, { silent: true });
                    return null;
                }
                // Visual + Journal zeigen die symbolischen Kosten (computeBuildCost) — auch in frieden+schöpfer,
                // wo nichts abgezogen wird.
                const symbolicCost = this.computeBuildCost(blueprint);
                creature.userData = creature.userData || {};
                creature.userData.carrying = {
                    kind: "build",
                    materials: symbolicCost,
                    blueprint,
                    free: !!gate.free,
                    since: performance.now() / 1000,
                };
                if (typeof this._refreshCreatureCarryingVisual === "function") {
                    this._refreshCreatureCarryingVisual(creature);
                }
                this._creatureRemember(creature, "took_materials", {
                    blueprint,
                    materials: symbolicCost,
                    free: !!gate.free,
                });
                if (!gate.free && typeof this.renderInventoryUI === "function") {
                    this.renderInventoryUI();
                }
                this._uiDirty("hof"); // W3 (V18.176) — der UI-Puls (war _renderCreatureListUI direkt)
                return out.set(0, 0, 0);
            }
            return this._kreaturZiel(out, dxp, dzp, distp - handover, buildSpeed, creature);
        }
        // WALK-PHASE: von Spieler weg bis Bau-Distanz, dann SPAWN.
        const dxp2 = creature.position.x - player.x;
        const dzp2 = creature.position.z - player.z;
        const distp2 = Math.hypot(dxp2, dzp2);
        const placement = AnazhRealm.CREATURE_BUILD_PLACEMENT_DIST;
        if (distp2 < placement) {
            // Noch zu nah — laufe in der gegenwärtigen Richtung weg
            // (nimmt Spieler-Bewegung implizit auf, falls Spieler folgt).
            if (distp2 < 0.001) {
                // Spieler steht direkt auf der Kreatur — willkürliche Richtung.
                return out.set(buildSpeed, 0, 0);
            }
            return this._kreaturZiel(out, dxp2, dzp2, placement - distp2, buildSpeed, creature);
        }
        // SPAWN-PHASE: am Kreatur-Ort. spawnArchitecture y+0.5-Konvention
        // (analog confirmBuild, kalibriert auf at_player wo player.y die
        // Sphäre-Mitte ist). Materialien wurden in TAKE-PHASE konsumiert.
        const spawnPos = {
            x: creature.position.x,
            y: creature.position.y + 0.5,
            z: creature.position.z,
        };
        this.spawnArchitecture(blueprint, spawnPos);
        this._creatureRemember(creature, "built", {
            blueprint,
            materials: carrying.materials,
            position: spawnPos,
        });
        if (typeof this.journalAppend === "function") {
            this.journalAppend("growth", AnazhRealm._datum`Eine Kreatur erschuf „${blueprint}" für den Schöpfer.`, {
                blueprint,
                materials: carrying.materials,
            });
        }
        creature.userData.carrying = null;
        if (typeof this._refreshCreatureCarryingVisual === "function") {
            this._refreshCreatureCarryingVisual(creature);
        }
        this.assignCreatureTask(creature, "wander", {}, { silent: true });
        return out.set(0, 0, 0);
    }

    // Welle 6.H V2 — geteilte Gradient-Textur als Cache (analog 6.D
    // Player-Aura). Ein einziges Canvas-Bild, jede Aura tintet via
    // material.color. 20 Task-Wechsel = 1 Textur statt 20.
    _getCreatureTaskAuraTexture() {
        if (this._creatureAuraTextureCache) return this._creatureAuraTextureCache;
        if (typeof document === "undefined" || typeof THREE === "undefined") return null;
        const canvas = document.createElement("canvas");
        canvas.width = 64;
        canvas.height = 64;
        const cx = canvas.getContext("2d");
        const g = cx.createRadialGradient(32, 32, 4, 32, 32, 30);
        g.addColorStop(0, "rgba(255,255,255,0.55)");
        g.addColorStop(0.4, "rgba(255,255,255,0.25)");
        g.addColorStop(1, "rgba(255,255,255,0)");
        cx.fillStyle = g;
        cx.fillRect(0, 0, 64, 64);
        this._creatureAuraTextureCache = new THREE.CanvasTexture(canvas);
        this._creatureAuraTextureCache.name = "kreatur-aura";
        // V12.0-vendor.3 — Canvas-Inhalt ist sRGB-encoded.
        this._creatureAuraTextureCache.colorSpace = THREE.SRGBColorSpace;
        return this._creatureAuraTextureCache;
    }

    // Aura-Sprite: lazy beim ersten non-wander-Task, disposed bei wander; Position folgt im
    // updateCreatures-Loop. Textur shared — nur das SpriteMaterial je Aura.
    _refreshCreatureTaskAura(creature) {
        if (!creature) return;
        const task = this._getCreatureTask(creature);
        const hue = task ? AnazhRealm.CREATURE_TASK_AURA_HUE[task.name] : null;
        const aura = creature.userData && creature.userData.taskAura;
        if (hue === null || hue === undefined) {
            this._leibZeichenFrei(creature, "taskAura"); // Task wander → die Aura geht (die geteilte Textur bleibt)
            return;
        }
        // Aura existiert → nur Hue aktualisieren über Material-Color-Setter
        if (aura && aura.material && aura.material.color) {
            aura.material.color.setHSL(hue / 360, 0.6, 0.65);
            return;
        }
        // Aura neu erstellen — Textur kommt aus shared cache (V2-Fix gegen Memory-Churn).
        if (typeof THREE === "undefined") return;
        const texture = this._getCreatureTaskAuraTexture();
        if (!texture) return;
        const mat = new THREE.SpriteMaterial({
            map: texture,
            blending: THREE.AdditiveBlending,
            depthWrite: false,
            transparent: true,
        });
        mat.color.setHSL(hue / 360, 0.6, 0.65);
        const sprite = new THREE.Sprite(mat);
        sprite.name = "kreatur-aura";
        sprite.scale.set(1.4, 1.4, 1);
        const auraY = this._creatureAuraOffsetY(creature);
        sprite.position.set(creature.position.x, creature.position.y + auraY, creature.position.z);
        if (this.state.scene) this.state.scene.add(sprite);
        creature.userData = creature.userData || {};
        creature.userData.taskAura = sprite;
    }

    // Welle 6.H P2B.5 — Carrying-Visual: kleines Sprite über der Kreatur
    // in der Farbe des getragenen Materials. Lifecycle wie taskAura (lazy,
    // disposed in removeCreature, Position-Update pro Frame).
    _refreshCreatureCarryingVisual(creature) {
        if (!creature) return;
        const ud = creature.userData || {};
        const carrying = ud.carrying;
        const oldSprite = ud.carryingSprite;
        if (!carrying) {
            this._leibZeichenFrei(creature, "carryingSprite"); // keine Traglast → das Sprite geht
            return;
        }
        // Material-Farbe ermitteln — dominantes Material aus carrying.materials.
        let dominantMat = null;
        let dominantCount = 0;
        for (const [m, n] of Object.entries(carrying.materials || {})) {
            if (n > dominantCount) {
                dominantCount = n;
                dominantMat = m;
            }
        }
        const mat = dominantMat && this.state.materials && this.state.materials[dominantMat];
        const colorHex = (mat && mat.color) || 0xcccccc;
        if (oldSprite && oldSprite.material && oldSprite.material.color) {
            oldSprite.material.color.setHex(colorHex);
            return;
        }
        if (typeof THREE === "undefined") return;
        const texture = this._getCreatureTaskAuraTexture();
        if (!texture) return;
        const spriteMat = new THREE.SpriteMaterial({
            map: texture,
            blending: THREE.AdditiveBlending,
            depthWrite: false,
            transparent: true,
        });
        spriteMat.color.setHex(colorHex);
        const sprite = new THREE.Sprite(spriteMat);
        sprite.name = "kreatur-traglast";
        sprite.scale.set(0.7, 0.7, 1);
        const offY = (this._creatureAuraOffsetY ? this._creatureAuraOffsetY(creature) : 0.9) + 0.5;
        sprite.position.set(creature.position.x, creature.position.y + offY, creature.position.z);
        if (this.state.scene) this.state.scene.add(sprite);
        creature.userData = creature.userData || {};
        creature.userData.carryingSprite = sprite;
    }

    // Welle 6.H V2 — UX: Status-Bar zeigt aktive Aufträge auf einen Blick.
    // „2 folgen · 1 warten" / „—" wenn alle wandern. Update kommt aus
    // assignCreatureTask + removeCreature + spawnCreatures (Lifecycle-Events).
    _renderTaskStatusUI() {
        if (typeof document === "undefined") return;
        const el = document.getElementById("status-tasks");
        if (!el) return;
        let follow = 0;
        let wait = 0;
        let gather = 0;
        let build = 0;
        let drink = 0;
        if (Array.isArray(this.state.creatures)) {
            for (const c of this.state.creatures) {
                const t = this._getCreatureTask(c);
                if (!t) continue;
                if (t.name === "follow_player") follow++;
                else if (t.name === "wait") wait++;
                else if (t.name === "gather") gather++;
                else if (t.name === "build") build++;
                else if (t.name === "drink") drink++;
            }
        }
        const parts = [];
        if (follow > 0) parts.push(`${follow} folgen`);
        if (wait > 0) parts.push(`${wait} warten`);
        if (gather > 0) parts.push(`${gather} sammeln`);
        if (build > 0) parts.push(`${build} bauen`);
        if (drink > 0) parts.push(`${drink} trinken`);
        el.textContent = parts.length ? parts.join(" · ") : "—";
    }

    spawnCreatures(count = 10, soulName = null) {
        // Alle Initial-Spawns laufen über spawnCreatureAt (derselbe Pfad wie DSL-Spawns); soulName fixiert
        // optional die Seele (Tests). Hat loadState Snapshots gestasht (_pendingCreatureSnapshots), werden
        // die restoriert statt neu gewürfelt.
        const pending = this.state._pendingCreatureSnapshots;
        if (Array.isArray(pending) && pending.length > 0) {
            this.clearCreatures();
            const symBefore = this.state.symphony && this.state.symphony.enabled;
            if (this.state.symphony) this.state.symphony.enabled = false;
            const emotions = Array.isArray(this.state.creatureEmotions) ? this.state.creatureEmotions : [];
            let restored = 0;
            this._verbandWiederkehr = new Map(); // S6: die Verbände des Stands, neu gebunden (_restoreCreatureFromSnapshot)
            for (let i = 0; i < pending.length; i++) {
                const emotion = emotions[i] || "happy";
                if (this._restoreCreatureFromSnapshot(pending[i], emotion)) restored++;
            }
            this._verbandWiederkehr = null;
            if (this.state.symphony) this.state.symphony.enabled = symBefore;
            this.state._pendingCreatureSnapshots = null;
            this.log(`Kreaturen wiederhergestellt: ${restored} aus persistiertem Save`, "INFO");
            if (typeof this._renderTaskStatusUI === "function") this._renderTaskStatusUI();
            this._uiDirty("hof"); // W3 (V18.176) — der UI-Puls (war _renderCreatureListUI direkt)
            return;
        }
        this.clearCreatures();
        const safeCount = Math.max(0, Math.min(count, this.state.maxCreatures));
        if (safeCount !== count) {
            this.log(`Kreaturen-Anzahl auf ${safeCount} begrenzt (max=${this.state.maxCreatures})`, "WARNING");
        }
        // je Wurf eine Gruppe (`_kreaturWurf`), bis die Zahl steht; höchstens doppelt so viele Würfe wie Tiere (ein Wurf ohne
        // Ort fehlt, eine Gruppe, die der Rest nicht hält, fällt — der nächste Wurf würfelt die Seele neu)
        let n = 0;
        for (let i = 0; i < 2 * safeCount && n < safeCount; i++)
            n += this._spawnOneInitialCreature(soulName, 50, safeCount - n);
        this.log(`Kreaturen gespawnt: ${n} Kreaturen`);
        if (typeof this._renderTaskStatusUI === "function") this._renderTaskStatusUI();
        this._uiDirty("hof"); // W3 (V18.176) — der UI-Puls (war _renderCreatureListUI direkt)
    }

    // Ein Initial-Wurf an zufälliger offener Position — die EINE Quelle für den Boot-Spawn (`spawnCreatures`) UND die
    // deferierte Progression (`_tickBootPhase3`): derselbe Wurf wie die natürliche Geburt (`_kreaturWurf`, G4a — das Rudel,
    // die Herde), die Seele aus der Affinität des Felds am Ort (`_pickFaunaSoulAtPlayer`, wie jede Geburt) oder gewünscht.
    // `platz` deckelt die Kopfzahl. Liefert die Zahl der Geborenen.
    _spawnOneInitialCreature(soulName = null, spawnRadius = 50, platz = 1) {
        // V18.315 — FERN spawnen: das Wesen taucht aus der Distanz auf, statt dir vor die Füße zu ploppen; sein Satz
        // blendet beim ersten Erscheinen ein (`einblenden`). Der Ort ist das EINE Geburts-Gesetz (_kreaturGeburtsOrt:
        // fern um den Spieler, außerhalb des Blicks), jeder Wurf aus dem Fauna-Strom (Γ5).
        const rng = this._faunaRng();
        const ort = this._kreaturGeburtsOrt(rng, Math.max(80, spawnRadius * 1.6));
        if (!ort) return 0; // die Wildnis trägt den Ort nicht: kein Boot-Tier
        const nass = this._weatherIsWet();
        const emotion = rng() < 0.7 ? (nass ? "sad" : "happy") : nass ? "happy" : "sad";
        const soul = soulName || this._pickFaunaSoulAtPlayer(ort.x, ort.z, rng);
        if (!soul) return 0; // der Lebensraum trägt hier keine Gattung (Tiere K4)
        return this._kreaturWurf(ort, soul, emotion, rng, platz).length;
    }

    // ===== DAS BOOT-PHASEN-GERÜST (P0–P3) =====
    // „Erst handeln, dann laden“: der Boot baut nur den kritischen Pfad (Terrain + Grund + Plattform),
    // übergibt die Kontrolle und streamt das Schwere danach. P0 = Kontrolle+Grund · P1 = echte Kollision
    // (async) · P2 = Ring+Laub nach Kapazität · P3 = Kreatur-Spawns. Headless → alles sofort (gate-treu).

    // P3-Einrichtung: Kreaturen aus dem kritischen Boot-Pfad nehmen. Headless ODER Save-Restore
    // (_pendingCreatureSnapshots) → sofort über `spawnCreatures` (Gate + Identität brauchen die volle
    // Welt synchron); echte Hardware → leeren + `_tickBootPhase3` scharf schalten.
    _bootDeferCreatures(count = 10) {
        const headless = this.state.renderer && this.state.renderer._isHeadlessNull;
        const hasPending =
            Array.isArray(this.state._pendingCreatureSnapshots) && this.state._pendingCreatureSnapshots.length > 0;
        if (headless || hasPending) {
            // der Null-Renderer des Gates ist die Test-Naht (`SYNC_STELLEN`); der Restore gießt laut, wo das Memo fehlt
            this._syncBauen(headless ? "naht" : null, () => this.spawnCreatures(count));
            return;
        }
        this.clearCreatures();
        const safe = Math.max(0, Math.min(count, this.state.maxCreatures));
        this.state._bootPhase3 = { creaturesLeft: safe, lastAt: 0, announced: false };
    }

    // DIE EINE REGEL, AB WANN EINE KREATUR ENTSTEHT (K60): nach dem ersten Weltbild (`_weltbildDa`, die Kontrolle) und nach dem
    // Ofen-Vorrat (`_ofenVorratSteht`) — dann trifft jeder Spawn das Memo (Clone), nie einen Guss auf dem Haupt-Faden. Leser:
    // Boot-Phase 3 und die Geburt des Fauna-Takts (`tickFaunaLifecycle`); ohne Foundry gibt es keinen Vorrat, auf den sie warten.
    _kreaturenBereit() {
        return !!this.state._weltbildDa && (!this._foundryEnabled() || !!this._ofenVorratSteht);
    }

    // P3-Progression: je „Atem“ ein Wurf (eine Gruppe, G4a), NACHDEM die Kontrolle steht und nur mit Frame-Luft
    // (`_frameOverBudget` falsy) — Bewegung/Laden gehen vor. No-op ohne offene P3-Arbeit.
    // DIE KONTROLLE IST DAS ERSTE WELTBILD (K60): bis K60 prüfte der Tick sie nie — er spawnte ab dem ersten Takt unter dem
    // Ladeschirm, und jede Kreatur goss ihre Gattung synchron auf dem Haupt-Faden (Radeon kalt 0,7–1,1 s vor dem Bild),
    // neben dem Ofen-Vorrat, der dieselbe Vorlage im Faden backte. Jetzt wartet er auf das Bild (`_weltbildDa`) und auf den
    // Ofen-Vorrat (`_ofenVorratSteht`): jeder Spawn trifft das Memo (Clone), nie einen Guss.
    _tickBootPhase3(now) {
        const p3 = this.state._bootPhase3;
        if (!p3) return;
        if (!this._kreaturenBereit()) return;
        if (this.state._frameOverBudget) return; // Kontrolle + Streaming zuerst
        if (now - (p3.lastAt || 0) < AnazhRealm.BOOT_PHASE3_SPAWN_MS) return;
        p3.lastAt = now;
        if (p3.creaturesLeft > 0)
            p3.creaturesLeft -= Math.max(1, this._spawnOneInitialCreature(null, 50, p3.creaturesLeft));
        if (p3.creaturesLeft <= 0) {
            if (typeof this._renderTaskStatusUI === "function") this._renderTaskStatusUI();
            this._uiDirty("hof");
            this.log("Boot-Phase 3 (Kreaturen) progressiv vollendet.", "INFO");
            this.state._bootPhase3 = null;
        }
    }

    // DIE EINE BÜHNEN-WAHRHEIT (das W2-Prädikat aus `diag-boot-stage.cjs`, live): alle spielfremden
    // Tick-Quellen (Nexus, Wetter, Brennglas …) LESEN sie statt eigener Boot-Heuristik. „Bühne steht“ =
    // Ring am Ziel + Gras/Wasser aufgeholt + die Streu steht (`_streuWartet` 0) — bewusst OHNE Impostor-Term (die Streu
    // wartet auf ihre Karten; der Karten-Bäcker läuft seit 04.10. frei im festen Takt, nie hinter der Bühne — der Kreis
    // Bühne → Streu → Karte → Bühne ist gelöst). Latch `state._buehneStand`; headless sofort.
    // Deckel: nach BUEHNE_SETTLE_CAP_MS öffnet sie bedingungslos und laut (WARN mit der Lücke) — Dauer-über-Budget
    // erreicht nie das Ziel
    _buehneSteht() {
        const st = this.state;
        if (st._buehneStand) return true;
        if (st.renderer && st.renderer._isHeadlessNull) {
            st._buehneStand = true;
            return true;
        }
        if (this._buehneT0 == null) this._buehneT0 = performance.now();
        // Was der Bühne fehlt — je Term ein Satz mit seiner Zahl. Die Streu steht nach der EINEN Antwort (`_streuWartet`):
        // der eigene Zähler las die fehlende Regionen-Karte (der Streamer lief noch nie) als „keine deferierte Region"
        // (Befund 09.10.).
        const fehlt = [];
        const ringTarget = Math.max(1, Math.min(12, st.chunkRingRadius || 4));
        if (!(st._activeRingRadius != null && st._activeRingRadius >= ringTarget))
            fehlt.push(`der Ring (${st._activeRingRadius != null ? st._activeRingRadius : "—"} von ${ringTarget})`);
        if (st.pendingGrass && st.pendingGrass.size) fehlt.push(`${st.pendingGrass.size} Gras-Stücke`);
        if (st.pendingWaterIso && st.pendingWaterIso.size) fehlt.push(`${st.pendingWaterIso.size} Wasser-Stücke`);
        const streuListe = [];
        const streu = this._streuWartet(st.playerMesh ? st.playerMesh.position : null, streuListe);
        if (streu) fehlt.push(`${streu} Wald-Stücke (${streuListe.slice(0, 3).join(" · ")})`);
        // der Deckel: die Welt hat settled, was die Hardware trägt — er öffnet LAUT wie das erste Weltbild (`_ankunftsBild`):
        // das Log nennt die Lücke
        const gedeckelt = performance.now() - this._buehneT0 > AnazhRealm.BUEHNE_SETTLE_CAP_MS;
        if (fehlt.length && !gedeckelt) return false;
        st._buehneStand = true;
        if (fehlt.length)
            this.log(
                `Die Bühne steht ohne: ${fehlt.join(" · ")} — der Deckel von ${AnazhRealm.BUEHNE_SETTLE_CAP_MS} ms ist erreicht.`,
                "WARN"
            );
        this.log("Die Bühne steht — die Welt-Systeme (Wetter-Zug · Nexus · Begleiter · Fern-Deko) starten.", "INFO");
        return true;
    }

    // ═══ KREATUR-KOSTEN — DIE ANIM-RATEN-LEITER ═══
    // EINE Rate je Distanz relativ zur Stufen-Grenze der Gelenk-Gestalt (`ab` × Größe, dieselbe wie `_gelenkStufe`): 1 =
    // jeden Frame · 2 · 4 · 0 = jenseits der Grenze (eingefroren in Stand-Pose). walkPhase + Anim-Uhr akkumulieren
    // JEDEN Frame → der Gang bleibt gleich schnell, nur seltener ausgewertet. Linse: gate:kreatur-kosten.
    // Jenseits der Grenze friert nur ein Tier, das STEHT (Welle LF, der ferne Gang): wer läuft (laeuft), wird auf der
    // Stufe 1/8 weiter ausgewertet (nie gröber als ein Viertel seines Takts) — seine Knochen tragen die gelenkige
    // Grobstufe (EIN Skelett, S3) und die Glieder-Kapseln.
    _creatureAnimDiv(dist, fernDist, omega, frameDt, laeuft) {
        if (!(fernDist > 0) || !(dist >= 0)) return 1;
        if (dist >= fernDist && laeuft !== true) return 0;
        const div = dist >= fernDist ? 8 : dist >= fernDist * 0.75 ? 4 : dist >= fernDist * 0.5 ? 2 : 1;
        // Der Gang wird nie gröber als ein Viertel seines Takts abgetastet (ω des Gang-Gesetzes aus der letzten
        // Auswertung): ein Fuchs im schnellen Trab (Takt 0,24 s) traf bei 30 fps und Stufe 1/4 (0,133 s je Auswertung)
        // seine Stand-Phase nie zweimal — die Beine sprangen (gate:tier-gang unter Last, Schlupf 1,33).
        if (div > 1 && omega > 0 && frameDt > 0)
            return Math.max(1, Math.min(div, Math.floor((2 * Math.PI) / omega / (4 * frameDt))));
        return div;
    }
    // DER LAUF DES LEIBS (Welle LF, der ferne Gang): je Takt die Lage-Änderung des Leibs, geglättet (ein Sprung über das
    // vMax des Gang-Gesetzes — Spawn, Teleport, Peer-Schnapp — ist kein Lauf); „läuft" mit Hysterese (ein ab 0,2 m/s, aus
    // unter 0,1 m/s). Leser: _kreaturLaeuft — die Raten-Leiter (updateCreatures) und die Ruhe am Stufen-Schalter (`_gelenkStufe`).
    _kreaturLaufTakt(creature, delta) {
        const tc = globalThis.__tetrapodaCore;
        if (!tc || !tc.GANG_GESETZ) AnazhRealm._kernPflichtBruch("tetrapoda:GANG_GESETZ");
        const ud = creature.userData;
        const p = creature.position;
        const alt = ud._laufLage;
        if (!alt) ud._laufLage = { x: p.x, z: p.z };
        else if (delta > 0) {
            const v = AnazhRealm._lageTempo(p.x - alt.x, p.z - alt.z, delta) || 0;
            const lv = ud._laufV || 0;
            ud._laufV = lv + (v - lv) * (1 - Math.exp(-6 * Math.min(0.1, delta)));
            alt.x = p.x;
            alt.z = p.z;
        }
        const lv = ud._laufV || 0;
        ud._laeuft = ud._laeuft === true ? lv > 0.1 : lv > 0.2;
    }
    _kreaturLaeuft(creature) {
        return !!(creature && creature.userData && creature.userData._laeuft === true);
    }
    // AUSKLINGE-SAUM (letzte 15 % vor der Stufen-Grenze): 1 → 0 linear; _animateTierBaum
    // multipliziert Schritt/Schwanz/Sway/Kopf damit → der Stufen-Schalter trifft die Stand-Pose. Jenseits 0.
    _creatureAnimFade(dist, fernDist) {
        if (!(fernDist > 0) || !(dist >= 0)) return 1;
        const saum = fernDist * 0.85;
        if (dist <= saum) return 1;
        if (dist >= fernDist) return 0;
        return 1 - (dist - saum) / (fernDist - saum);
    }
    // NEUTRALE STAND-POSE (die Ruhe des Tiers jenseits der Grenze, auch `_gelenkRuhe`): friert den bauTier-Baum in der
    // Kern-STAND_POSE ein (Ketten = Stand-Winkel, Schwanz/Kopf/Roll = 0) statt mitten im Schritt. tb._gang fällt → beim
    // Aufwachen seedet der CPG frisch aus walkPhase. Ketten-Ordnung = _animateTierBaum.
    _tierBaumNeutralStance(group) {
        const tb = group && group.userData && group.userData._tierBaum;
        if (!tb || !tb.teile) return;
        const core = typeof window !== "undefined" && window.__tetrapodaCore;
        const SP = core.STAND_POSE;
        const T = tb.teile;
        if (T.wolf) {
            T.wolf.rotation.z = 0;
            T.wolf.rotation.x = 0;
            if (tb._rumpfRuhe) T.wolf.position.copy(tb._rumpfRuhe); // die Senke des Schritts (Welle LF) fällt mit
        }
        if (T.headGroup) {
            T.headGroup.rotation.x = 0;
            T.headGroup.rotation.y = 0;
        }
        // V18.491.80 — ear-Kanäle mit einfrieren (sonst Mid-ear-Pop beim Aufwachen).
        if (T.earL) T.earL.rotation.z = 0;
        if (T.earR) T.earR.rotation.z = 0;
        const ketten = [
            [T.legFL, T.flU, T.flL, T.flP],
            [T.legFR, T.frU, T.frL, T.frP],
            [T.legHL, T.hlT, T.hlC, T.hlP],
            [T.legHR, T.hrT, T.hrC, T.hrP],
        ];
        for (let i = 0; i < 4; i++) {
            const K = ketten[i];
            // das Abspreizen der Pfoten-IK (Welle LF) und die Sohle am Hang (K8 huf) fallen mit
            for (let k = 0; k < 4; k++) if (K[k]) K[k].rotation.set(SP[i][k], 0, 0);
        }
        const ts = tb.tailSegs || [];
        for (let i = 0; i < ts.length; i++) ts[i].rotation.y = 0;
        tb._gang = null;
    }

    // DIE KÖRPERLÄNGE (m) einer Kreatur: die z-Ausdehnung ihrer Seelen-Teile (`_soulParts`, die Körper-Achse) ×
    // Uniform-Skala, einmal je Kreatur — EINE Quelle für den Hang (Halblänge) und die Stimme (der Tier-Ruf).
    // Ohne Teile die Bezugslänge 1,2 m.
    _creatureKoerperLaenge(creature) {
        const ud = creature.userData || (creature.userData = {});
        if (Number.isFinite(ud._koerperLaengeM)) return ud._koerperLaengeM;
        let len = 1.2;
        const parts = ud._soulParts;
        if (Array.isArray(parts) && parts.length) {
            let minZ = Infinity;
            let maxZ = -Infinity;
            for (const q of parts) {
                const cz = (q && q.position && q.position.z) || 0;
                const hz = ((q && q.size && q.size.z) || 0) / 2;
                if (cz - hz < minZ) minZ = cz - hz;
                if (cz + hz > maxZ) maxZ = cz + hz;
            }
            if (Number.isFinite(maxZ - minZ) && maxZ - minZ > 0.2) len = maxZ - minZ;
        }
        ud._koerperLaengeM = len * ((creature.scale && creature.scale.x) || 1);
        return ud._koerperLaengeM;
    }

    // DIE HALBE LÄNGE des Leibs (m) — vom Ort der Wurzel bis zur Probe vorn und hinten (`_creatureSlopeProben`) und bis zur
    // Stirn seines Schritts (`_kreaturKletterwand`): 0,35 × Körperlänge, 0,25–4 m, einmal je Kreatur.
    _kreaturHalbLaenge(creature) {
        const ud = creature.userData;
        if (!Number.isFinite(ud._slopeHalbLen))
            ud._slopeHalbLen = Math.min(4, Math.max(0.25, this._creatureKoerperLaenge(creature) * 0.35));
        return ud._slopeHalbLen;
    }

    // ═══ TIER-BODENKONTAKT ═══
    // Vier Bodenproben je NAHER Kreatur im Leib-Rahmen (vorn/hinten längs der Gier, links/rechts quer): Pitch und Roll
    // über _slopePitch (dieselbe Hang-Formel wie der Biped), Basis = Proben-Mitte. Jede Probe liest die SICHT
    // (`_standSicht`: die Boden-Karte des gezeichneten Meshs, bilinear, je Frame) um ihre Gesetz-Probe (gecacht,
    // Budget wie _creatureGroundY). Vorher standen zwei Gesetz-Proben längs der festen Welt-z: die Sohlen lagen am
    // Hang-Fuß bis 0,63 m im sichtbaren Boden, der 0,5-m-Cache war die Y-Quelle (Treppen bis 0,64 m je Frame), Roll 0
    // bei 27° Querhang (Leben-Prüfung R-D15, R-D10, R-D11). Keine finite Probe → null. Linse: gate:tier-stand.
    _creatureSlopeProben(creature, centerG) {
        const ud = creature.userData;
        const hl = this._kreaturHalbLaenge(creature);
        const hw = hl * 0.45; // die halbe Spur der Pfoten quer zum Leib
        const yaw = creature.rotation.y || 0;
        const fX = Math.sin(yaw);
        const fZ = Math.cos(yaw);
        const P = ud._slopeProben || (ud._slopeProben = [0, 1, 2, 3].map(() => ({ x: NaN, z: NaN, g: NaN })));
        const ox = [fX * hl, -fX * hl, fZ * hw, -fZ * hw];
        const oz = [fZ * hl, -fZ * hl, -fX * hw, fX * hw];
        const y = [0, 0, 0, 0];
        let mitteSicht = null;
        // der Ort, an dem die Mitte ihr Gesetz las (`_creatureGroundY`, Cache je 0,5 m)
        const gx = Number.isFinite(ud.cachedGroundX) ? ud.cachedGroundX : creature.position.x;
        const gz = Number.isFinite(ud.cachedGroundZ) ? ud.cachedGroundZ : creature.position.z;
        for (let k = 0; k < 4; k++) {
            const px = creature.position.x + ox[k];
            const pz = creature.position.z + oz[k];
            this._creatureSlopeProbe(P[k], px, pz, centerG);
            const v = this._standSicht(px, pz, Number.isFinite(P[k].g) ? P[k].g : centerG, false);
            // EINE KANTE ist keine Ebene (Leben-Schau 2, gate:fall-waechter — wie der Fahr-Kern `fahrEbene`): liegt das Gesetz
            // einer Probe steiler als 45° über oder unter dem der Mitte — gemessen zwischen den Orten, an denen beide ihr Gesetz
            // lasen (ihre Caches wandern je 0,5 m, eine nachlaufende Hang-Probe ist keine Kante) — und weiter als zwei Stufen,
            // trägt sie weniger, ab vier Stufen nicht mehr: sie stünde in einer anderen Schicht (ein Loch in die tiefere Höhle),
            // und die Mitte der vier zog den Leib in den Fels (ein in der Höhle gestoßener Wolf stand 1,5 m unter seinem Grund).
            // Dort trägt die Sicht unter der Mitte. Weich, damit eine Hang-Stufe keine Treppe zieht (gate:koerper-stand).
            const roh = Number.isFinite(v) ? v : centerG;
            const dh = Number.isFinite(P[k].g) ? Math.abs(P[k].g - centerG) : 0;
            const stufe = AnazhRealm.PLAYER_STEP_UP;
            const w =
                dh <= Math.hypot(P[k].x - gx, P[k].z - gz)
                    ? 1
                    : Math.max(0, Math.min(1, (4 * stufe - dh) / (2 * stufe)));
            if (w >= 1) y[k] = roh;
            else {
                if (mitteSicht === null) {
                    const ms = this._standSicht(creature.position.x, creature.position.z, centerG, false);
                    mitteSicht = Number.isFinite(ms) ? ms : centerG;
                }
                y[k] = mitteSicht + (roh - mitteSicht) * w;
            }
        }
        if (!y.every(Number.isFinite)) return null;
        const pitch = this._slopePitch(y[0], y[1], 2 * hl);
        const deckel = AnazhRealm.GANG_DECKEL_RAD;
        const roll = Math.max(-deckel, Math.min(deckel, Math.atan2(y[2] - y[3], 2 * hw)));
        // DER DECKEL DES NICKS hebt den Leib (Prüfung 2 K02a, Wolf am Wandfuß, Gier 180°): steiler als der Deckel (0,6 rad)
        // stünde die bergseitige Probe unter der Ebene des Leibs — die Wurzel hebt sich um das, was der Deckel offen lässt,
        // der Leib liegt auf der höheren Stütze (die Pfoten talseitig reicht der Gang). Ohne Deckel (≤ 34°) bleibt die Mitte.
        // Ein GEHENDER Leib kommt dorthin nie (die Kletterwand seines Schritts, `_creatureGroundY`): der Hub trägt den
        // gesetzten oder gestoßenen Leib am Wandfuß, nie den, der in die Wand läuft.
        const offen =
            Math.max(0, Math.abs(y[1] - y[0]) / 2 - hl * Math.tan(Math.abs(pitch))) +
            Math.max(0, Math.abs(y[2] - y[3]) / 2 - hw * Math.tan(Math.abs(roll)));
        return { mitte: (y[0] + y[1] + y[2] + y[3]) / 4 + offen, pitch, roll };
    }
    // EINE Gesetz-Probe (gecacht): re-scannt nur nach > 0.5 m Wanderung UND mit freiem Frame-Budget (der
    // Kreatur-FPS-Dirigent V17.113 — dieselbe Kasse wie _creatureGroundY; Budget leer → der stale Cache trägt den Frame).
    // Der Boden UNTER dem Körper (`_koerperBodenUnter` ab der Gesetz-Höhe der Mitte), nie die Oberkante der Säule.
    _creatureSlopeProbe(p, x, z, yRef) {
        const dx = x - p.x;
        const dz = z - p.z;
        if (Number.isFinite(p.g) && Number.isFinite(dx) && Number.isFinite(dz) && dx * dx + dz * dz < 0.25) return;
        if (!(this._creatureGroundBudget > 0)) return;
        this._creatureGroundBudget--;
        const g = this._koerperBodenUnter(x, yRef, z);
        p.x = x;
        p.z = z;
        p.g = typeof g === "number" && Number.isFinite(g) ? g : NaN;
    }

    // ═══ DER KREATUR-ZIEGEL: nah das Studio-Tier, fern die Glieder-Kapseln ═══
    // Nah (KREATUR_NAH_MESH, mit Hysterese) IST das Studio-Tier (tierBaum-Mesh) die Gestalt — seine Kapseln schweigen,
    // three cullt es je Pass (Körper-Kugel gegen Blick und Kaskaden-Box). Fern ist jedes GLIED Achse + Radius + Farbe
    // (dedupl. je Gattung×Glied), je Frame reist die Knochen-Matrix in die Liste (_weltFeldMatrix) → der March
    // sphere-tract im Glied-Raum. Bake getaktet, headless unverändert.
    _tickKreaturZiegel(playerPos) {
        const st = this.state;
        if (!playerPos || (st.renderer && st.renderer._isHeadlessNull)) return;
        // jeder Leib im Bild trägt seine Gestalt — die Wesen UND die Gefallenen (ein Leichnam liegt fern als Feld, nah als
        // Studio-Tier, wie er lag, bis er versunken ist)
        const W = st.creatures,
            LG = st.leichname;
        for (let k = 0, n = W.length + LG.length; k < n; k++) {
            const cr = k < W.length ? W[k] : LG[k - W.length];
            if (!cr || !cr.position) continue;
            // der ruhende Leib (K59) zeichnet nirgends: sein Satz ist aus (`_tickKreaturRuhe`), er schreibt keine Glied-Matrix
            // und lädt die Liste nicht hoch; erwacht, schreibt er im selben Takt (`_kzLeib`)
            if (cr.userData && cr.userData._ruht === true) continue;
            this._kzLeib(cr, playerPos);
        }
    }

    // DER ZIEGEL EINES LEIBS: nah das Studio-Tier (mit Hysterese), fern seine Glieder ins Feld — je Takt aus dem Ziegel, und
    // für einen Leib, den der Blick des Bilds weckt (`_ruheImBild`), direkt vor dem Zeichnen. `vorab`: die Glieder backen
    // schon nah (im Takt des Bakes, ruhend) — ein Leib, der hinausgeht, trägt sein Feld ab dem ersten Schritt (mensch.K2).
    _kzLeib(cr, playerPos, vorab = false) {
        const N = (cr.userData && cr.userData._kzN) || AnazhRealm.KREATUR_NAH_MESH; // eine Art mit eigener Grenze trägt sie (`_kzN`)
        const dx = cr.position.x - playerPos.x;
        const dz = cr.position.z - playerPos.z;
        const d2 = dx * dx + dz * dz;
        const u = cr.userData || (cr.userData = {});
        u._kzNah = u._kzNah === true ? d2 < N.aus * N.aus : d2 < N.ein * N.ein;
        if (u._kzNah) {
            u._kzNahGewesen = true; // das Studio-Tier stand schon im Bild — sein Satz übernimmt später, ohne Einblenden
            if (vorab && !u._kzGlieder && !u._kzVersuch && this._gattungGlieder(cr) && this._weltBakeErlaubt(d2)) {
                u._kzVersuch = true;
                this._leibMatrix(cr);
                u._kzGlieder = this._kreaturGliederBacken(cr, false);
            }
            // Der schwindende Satz folgt den Knochen weiter (sonst geisterte er 0,5 s an der alten Pose).
            if (u._kzGlieder)
                for (const gl of u._kzGlieder) {
                    if (gl.handle._schwundT0 !== undefined) this._weltFeldMatrix(gl.handle, gl.teil.matrixWorld);
                    this._weltFeldAktiv(gl.handle, false);
                }
            return; // das Studio-Tier trägt (gecullt je Pass an seiner Körper-Kugel)
        }
        if (!u._kzGlieder) {
            if (u._kzVersuch) {
                // Fern-Fit gescheitert (Atlas voll) — das Fehlen ist sichtbar, laut im Register.
                cr.visible = false;
                return;
            }
            // getaktet, oder die Gattung kalt (ihr Vorrat im Leerlauf bestellt, `_gattungGlieder`): bis dahin trägt der Körper
            if (!this._gattungGlieder(cr) || !this._weltBakeErlaubt(d2)) return;
            u._kzVersuch = true;
            this._leibMatrix(cr);
            // Fern geboren (nie nah im Bild, kein Satz trug ihn): die Glieder blenden bei ihrer Geburt ein, statt zu ploppen.
            u._kzGlieder = this._kreaturGliederBacken(cr, !u._kzNahGewesen && !u._satz);
            if (!u._kzGlieder) {
                cr.visible = false;
                return;
            }
        }
        // DIE KNOCHEN TRAGEN DIE FELDER (die Pose der letzten Animations-Auswertung als inverse
        // Welt-Matrix je Glied):
        const an = this.state.creaturesHidden !== true;
        for (const gl of u._kzGlieder) {
            this._weltFeldMatrix(gl.handle, gl.teil.matrixWorld);
            this._weltFeldAktiv(gl.handle, an);
        }
        cr.visible = false; // fern IST das Feld die Gestalt
    }

    // Gehört dieses Tier dem Feld? Nur FERN und sobald ein Bake-Versuch lief (mit Gliedern oder
    // gescheitert); nah und in der Bake-Rampe ist das Studio-Tier sichtbar, three cullt es je Pass. Ein Bewohner in seinem
    // Haus (`_drinnen`, mensch.K2) gehört keinem Feld.
    _kzBesitztFeld(cr) {
        const u = cr && cr.userData;
        return !!(u && u._kzNah !== true && u._drinnen !== true && (u._kzGlieder || u._kzVersuch));
    }

    // DAS FELL-BILDSCHIRM-GESETZ (Gebot 7: Kosten an den Schirm): das Fell (seit V18.497 die Schalen, dazu
    // Rest-Strähnen wie der Nasenrücken) zeichnet nur, solange seine projizierte Breite FELL_BILDSCHIRM.pxMin
    // erreicht — darunter trägt die Haut mit FELL_LOOK das Tier. Die Grenze folgt dem EINEN Schirm-Maßstab (`_schirm`:
    // Zeichenpuffer + Sichtfeld) und der Tiergröße (jedes Holz, jede Auflösung — ein kleinerer Schirm schaltet früher
    // ab); Hysterese gegen Flackern, geschaltet wird nur `visible`. Ohne Schirm (kein Renderer) bleibt der Zustand.
    _fellBildschirmGesetz(creature, tB) {
        if (!tB.straehnen) {
            tB.straehnen = [];
            tB.wrap.traverse((o) => {
                const kl = o.isMesh && o.userData && o.userData.__klasse;
                if (typeof kl === "string" && (kl.indexOf("straehne") === 0 || kl === "fellSchale"))
                    tB.straehnen.push(o);
            });
        }
        if (!tB.straehnen.length) return;
        const cam = this.state.camera;
        const pxJeM = this._schirm().pxJeM;
        if (!cam || pxJeM == null) return;
        const F = AnazhRealm.FELL_BILDSCHIRM;
        const breite = F.breiteM * (tB.f || 1) * (creature.scale.x || 1);
        const d = Math.max(0.1, cam.position.distanceTo(creature.position));
        const px = (breite * pxJeM) / d;
        const war = tB._fellAn !== false;
        const an = px >= F.pxMin * (war ? 1 - F.hyst : 1 + F.hyst);
        if (an === war && tB._fellAn !== undefined) return;
        tB._fellAn = an;
        for (const s of tB.straehnen) s.visible = an;
    }

    _kreaturZiegelTod(cr) {
        const u = cr && cr.userData;
        if (!u) return;
        if (u._kzGlieder) for (const gl of u._kzGlieder) this._weltFeldFrei(gl.handle);
        u._kzGlieder = null;
        u._kzVersuch = false;
    }

    // DIE SICHT EINES LEIBS (je Takt — die Wesen im Kreatur-Takt, die Gefallenen in _tickLeichname): die EINE Stelle, an der
    // ein Leib im Bild seine Darstellung wählt. Der Sichtbarkeits-Besitzer: trägt das Tier sein Feld, gehört `visible` dem
    // Kreatur-Ziegel (der Mesh-Rückweg bliebe sonst lebendig; _kzVersuch hält den Körper unsichtbar, auch bei Atlas-
    // Erschöpfung) — sonst ist das Mesh-Tier sichtbar, gecullt JE PASS an der Körper-Kugel jeder Hülle (frustumCulled, gegen
    // den Blick UND jede Kaskaden-Box: ein Tier hinter dem Blick wirft ins Bild). Die STUFE folgt dem Abstand, in und außer
    // Blick, am EINEN Schalter der Gelenk-Gestalt (`_gelenkStufe`, Grenze `ab` × Größe und Hysterese aus der Kern-Zeile) —
    // jenseits die gelenkige Grobstufe, diesseits die Gestalt mit Schatten (die Grobstufe wirft als ihr Zwilling): ein Leib
    // hinter dem Blick wirft in die Kaskaden, und der Gang der Sicht-Kopie hängt an ihrer Stufe (gate:kreatur-kosten (F):
    // eine Kopie außer Blick ging jenseits der Grenze mitten im Schritt weiter, 1,407 rad). Im Blick dazu das
    // Fell-Bildschirm-Gesetz und die Zeichen über dem Leib (die Aura des Auftrags, die Traglast — ein Gefallener trägt keine,
    // `_kreaturFaellt`). Vorher lebte die Wahl im Takt der Wesen: ein Leichnam behielt 90 s die Stufe, in der er fiel
    // (Tod-Zensus: fern gefallen lag er auf 2 m als Fern-Guss ohne Schatten, nah gefallen trug er auf 40 m die volle Gestalt
    // — 2 400 von 5 460 Leichnam-Takten). Rückgabe: fern?
    _leibSicht(creature, distSq, inFrustum) {
        const ud = creature.userData;
        // im Satz (`_tickTierSatz`) zeichnet der Leib nicht
        if (!this._kzBesitztFeld(creature)) creature.visible = this.state.creaturesHidden !== true && !ud._satz;
        const fern = this._gelenkStufe(creature, distSq);
        if (!inFrustum) return fern; // das Bild-Gesetz setzt DERSELBE Frame, in dem der Leib in den Blick kommt
        if (!fern && ud._tierBaum) this._fellBildschirmGesetz(creature, ud._tierBaum);
        // Welle 6.H — die Aura des Auftrags folgt dem Leib (über dem Mesh), das Sprite der Traglast darüber (P2B.5)
        const auraY = ud.taskAura || ud.carryingSprite ? this._creatureAuraOffsetY(creature) : 0;
        if (ud.taskAura)
            ud.taskAura.position.set(creature.position.x, creature.position.y + auraY, creature.position.z);
        if (ud.carryingSprite)
            ud.carryingSprite.position.set(creature.position.x, creature.position.y + auraY + 0.5, creature.position.z);
        return fern;
    }

    // ═══ DER RUHENDE LEIB (K59, Gebot 7: Kosten an Schirm + Änderung) ═══
    // Vorher ging jedes Tier jeden Frame voll: an Genesis (Third, OMEN) kosteten 10 ferne Tiere außer Bild 0,72 ms
    // Kreatur-Takt (der Ziegel schrieb 120 Glied-Matrizen und lud die Feld-Liste hoch) und 0,23 ms Matrix-Gang der Szene
    // (750 ihrer 1 070 Knoten sind diese Skelette). Je Takt entscheidet `_kreaturRuht` (KREATUR_RUHE) neu. Ein ruhender
    // Leib ZEICHNET NIRGENDS: er ruht nur, wenn das Feld seine Gestalt trägt (`_kzBesitztFeld` — sein Mesh zeichnet und
    // wirft nicht), sein Satz geht beim Ruhe-Beginn sofort aus, und der Blick des Bilds (`_ruheImBild`, im Render-Pfad)
    // weckt jeden, den die Kamera dieses Bilds sieht. Er geht im groben Takt (`_kreaturTaktDt`), schreibt kein Feld
    // (`_tickKreaturZiegel`) und verlässt den Matrix-Gang (`AnazhRealm._ruhendeWurzel` an seiner Wurzel). Wer seine Glieder
    // liest, liest sie frisch (`_kreaturTrefferGlieder`, `_leibMatrix`: Biss, Treffer, Tod); wer erwacht, zieht den ganzen
    // Leib nach, bevor das Feld ihn liest. Die Gefallenen ruhen nie. Linse: gate:kreatur-kosten (G).
    _tickKreaturRuhe(delta, playerPos) {
        const R = AnazhRealm.KREATUR_RUHE;
        const st = this.state;
        const W = st.creatures;
        for (const c of st.leichname) if (c && c.userData && c.userData._ruht === true) this._kreaturErwacht(c);
        const fr = this._frustumCache;
        const cam = st.camera;
        // DER RAND DES BLICKS: der Frustum ist der des Vor-Frames, die Kamera dreht bis zum Render dieses Frames weiter —
        // der Rand wächst um die doppelte Drehung des Vor-Frames; dreht sie schneller als ~69°, ruht in diesem Frame keiner.
        let rand = -1;
        if (fr && cam && playerPos) {
            const q = this._ruheKamQ || (this._ruheKamQ = cam.quaternion.clone());
            const dreh = 2 * Math.acos(Math.min(1, Math.abs(q.dot(cam.quaternion))));
            q.copy(cam.quaternion);
            const winkel = R.randGrad * (Math.PI / 180) + 2 * dreh;
            if (winkel < 1.2) rand = Math.tan(winkel);
        }
        for (let i = 0; i < W.length; i++) {
            const c = W[i];
            if (!c || !c.userData) continue;
            if (rand >= 0 && this._kreaturRuht(c, playerPos, fr, rand, delta)) {
                if (c.userData._ruht !== true) {
                    c.userData._ruht = true;
                    c.updateMatrixWorld = AnazhRealm._ruhendeWurzel;
                    // sein Satz geht SOFORT aus (außer Bild, kein Mesh übernimmt): sonst stünde er, wo die Ruhe begann
                    if (c.userData._kzGlieder)
                        for (const gl of c.userData._kzGlieder) this._weltFeldAktiv(gl.handle, false, true);
                }
            } else if (c.userData._ruht === true) this._kreaturErwacht(c);
        }
    }

    // Ruht dieser Leib in diesem Takt? Billige Filter zuerst (Lehre 25): der Zustand, die Gestalt, die Ferne, das Tempo,
    // die Jäger des Takts (`_kreaturJaeger`, die EINE Liste — in ihrer Witterung ruht kein Tier, der Biss liest die Glieder
    // der Beute) — der Blick zuletzt (die Körper-Kugel samt Saum und Rand gegen den Frustum).
    _kreaturRuht(c, playerPos, frustum, rand, delta) {
        const R = AnazhRealm.KREATUR_RUHE;
        const u = c.userData;
        if (u._stossV || (u._hopH || 0) > 0 || (u._hopV || 0) > 0) return false;
        const z = u._motionZustand;
        if (z === "jagd" || z === "hetzen" || z === "flucht" || z === "schwimmen") return false;
        if (u._verhaltenAktion && u._verhaltenAktion.biss) return false;
        const task = this._getCreatureTask(c);
        if (task && task.name !== "wander") return false;
        // nur wem das Feld die Gestalt trägt (fern UND gebacken): ungebacken oder nah (`_kzNah`, auch im Takt, in dem er
        // `aus` nach außen kreuzt) zeichnet sein Mesh und wirft in die Kaskaden — er ruht nie
        if (!this._kzBesitztFeld(c)) return false;
        const p = c.position;
        const N = AnazhRealm.KREATUR_NAH_MESH;
        const dx = p.x - playerPos.x,
            dz = p.z - playerPos.z;
        if (dx * dx + dz * dz < N.aus * N.aus) return false;
        const v = u._steuer ? Math.abs(u._steuer.v) : 0;
        if (v * R.takt * delta > R.wegMax) return false;
        const w2 = R.witterungM * R.witterungM;
        const jaeger = this._kreaturJaeger;
        if (jaeger)
            for (const j of jaeger) {
                if (j === c) continue;
                const jx = j.position.x - p.x,
                    jz = j.position.z - p.z;
                if (jx * jx + jz * jz < w2) return false;
            }
        return this._kreaturAusserBlick(c, frustum, rand);
    }

    // DER LEIB AUSSER BLICK (die EINE Frage des Blicks an einen Leib — die Ruhe `_kreaturRuht`, das Auge des Satzes
    // `_tierSatzImBild`): die Körper-Kugel samt Saum (`KREATUR_RUHE.saumM`) und Rand (`rand` je Meter Abstand zur Kamera: im
    // Takt der Vor-Frame-Frustum und die Drehung bis zum Render, `_tickKreaturRuhe`; im Bild 0) gegen den Frustum
    _kreaturAusserBlick(c, frustum, rand) {
        const R = AnazhRealm.KREATUR_RUHE;
        const u = c.userData;
        const p = c.position;
        // die Körper-Kugel: Reichweite des Leibs waagrecht, die halbe Höhe senkrecht (je Leib und Größe einmal)
        if (!(u._ruheKugelR > 0) || u._ruheKugelS !== c.scale.x) {
            const leib = this._kreaturLeib(c, 0, this._ruheLeib || (this._ruheLeib = {}));
            u._ruheKugelR = leib.reichweite + 0.5 * leib.hoehe;
            u._ruheKugelH = 0.5 * leib.hoehe;
            u._ruheKugelS = c.scale.x;
        }
        const s = this._ruheKugel || (this._ruheKugel = new THREE.Sphere(new THREE.Vector3(), 0));
        s.center.set(p.x, p.y + u._ruheKugelH, p.z);
        const cp = this.state.camera.position;
        s.radius = u._ruheKugelR + R.saumM + s.center.distanceTo(cp) * rand;
        return !frustum.intersectsSphere(s);
    }

    // DIE RICHTUNG DES SCHATTENS (die EINE Licht-Quelle der Kaskaden, `directionalLight`): waagrecht weg vom Licht (`x`, `z`)
    // und die Länge je Meter Höhe des Werfers (`cot`, der Kotangens der Licht-Höhe); null ohne Licht
    _kreaturLicht() {
        const dl = this.state.directionalLight;
        if (!dl) return null;
        const v = (this._kreaturLichtV || (this._kreaturLichtV = new THREE.Vector3()))
            .subVectors(dl.position, dl.target.position)
            .normalize();
        const h = Math.hypot(v.x, v.z) || 1;
        return { x: -v.x / h, z: -v.z / h, cot: h / Math.max(v.y, 1e-3) };
    }
    // DER WURF AUSSER BLICK: der Leib ist außer Blick, und sein Schatten auch — die Körper-Kugel längs des Schattens (Länge
    // Höhe × `licht.cot`, gekappt bei `KREATUR_RUHE.wurfM`), um die halbe Länge gewachsen, gegen den Frustum
    _kreaturWurfAusserBlick(c, frustum, licht) {
        if (!this._kreaturAusserBlick(c, frustum, 0)) return false;
        if (!licht) return true;
        const u = c.userData;
        const L = Math.min(AnazhRealm.KREATUR_RUHE.wurfM, 2 * u._ruheKugelH * licht.cot);
        const s = this._ruheKugel;
        s.center.set(c.position.x + 0.5 * L * licht.x, c.position.y + u._ruheKugelH, c.position.z + 0.5 * L * licht.z);
        s.radius = u._ruheKugelR + AnazhRealm.KREATUR_RUHE.saumM + 0.5 * L;
        return !frustum.intersectsSphere(s);
    }

    // DIE ZEIT DES SCHRITTS (der grobe Takt): ein ruhender Leib sammelt die Frame-Zeit und geht nur in seinem Fenster
    // (`slot` % takt === 0) mit allem Gesammelten — null = kein Schritt in diesem Frame; ein erwachter trägt den Rest in
    // seinen ersten Schritt. `_taktN` = die Frames, die dieser Schritt trägt (wach 1): die KI rechnet, wenn in ihre Spanne
    // ein KI-Takt fiel (die Kadenz, nie die Entscheidung).
    _kreaturTaktDt(creature, slot, delta) {
        const u = creature.userData;
        if (u._ruht === true) {
            u._ruheDt = (u._ruheDt || 0) + delta;
            u._ruheN = (u._ruheN || 0) + 1;
            if (slot % AnazhRealm.KREATUR_RUHE.takt !== 0) return null;
        } else if (!(u._ruheDt > 0)) {
            u._taktN = 1;
            return delta;
        } else {
            u._ruheDt += delta;
            u._ruheN = (u._ruheN || 0) + 1;
        }
        const dt = u._ruheDt;
        u._taktN = u._ruheN;
        u._ruheDt = 0;
        u._ruheN = 0;
        return dt;
    }

    // DAS ERWACHEN: die eigene Matrix-Wurzel fällt (der Szenen-Gang steigt wieder ins Skelett), und der ganze Leib zieht
    // JETZT nach — vor dem Ziegel, der seine Glieder ins Feld schreibt, und vor jedem Leser dieses Takts.
    _kreaturErwacht(c) {
        c.userData._ruht = false;
        delete c.updateMatrixWorld;
        c.updateMatrixWorld(true);
    }

    // DER BLICK DES BILDS (im Render-Pfad `_loopRender` — dem EINEN, durch den auch die Ausgabe-Aufnahme zeichnet): die Ruhe
    // entschied der Takt am Frustum des Vor-Frames; danach kann die Kamera springen (Teleport, Portal, Respawn), schneller
    // drehen als der Rand oder ohne Takt gesetzt werden (die Aufnahme). Hier steht der Blick DIESES Bilds: jeder ruhende Leib,
    // der unter ihm nicht mehr ruht (`_kreaturRuht` mit seinem Frustum, ohne Rand — im Bild oder dem Spieler jetzt nah),
    // erwacht und schreibt Feld (`_kzLeib`) und Sicht (`_leibSicht`), bevor das Bild ihn zeichnet. Rückgabe: die Geweckten.
    _ruheImBild() {
        const st = this.state;
        const cam = st.camera;
        const pm = st.playerMesh && st.playerMesh.position;
        if (!cam || !pm) return 0;
        let fr = null;
        const blick = () => {
            if (!fr) {
                cam.updateWorldMatrix(true, false);
                const m = (this._ruheBildM || (this._ruheBildM = new THREE.Matrix4())).multiplyMatrices(
                    cam.projectionMatrix,
                    cam.matrixWorldInverse
                );
                fr = (this._ruheBildF || (this._ruheBildF = new THREE.Frustum())).setFromProjectionMatrix(m);
            }
            return fr;
        };
        // das Auge des Tier-Satzes sieht mit demselben Blick (`_tierSatzImBild`)
        if (this._tierSaetze && this._tierSaetze.size) this._tierSatzImBild(blick());
        let n = 0;
        for (const c of st.creatures) {
            if (!c || !c.userData || c.userData._ruht !== true) continue;
            if (this._kreaturRuht(c, pm, blick(), 0, 0)) continue;
            this._kreaturErwacht(c);
            n++;
            if (st.renderer && st.renderer._isHeadlessNull) continue;
            this._kzLeib(c, pm);
            const dx = c.position.x - pm.x,
                dz = c.position.z - pm.z;
            this._leibSicht(c, dx * dx + dz * dz, true);
        }
        return n;
    }

    updateCreatures(delta) {
        this.state.creatureAnimationTime += delta;
        // W4 (V17.48) — die emotionale CONTAGION + das Wachsen der Bindung leben HIER
        // (im Kreatur-Tick), nicht im Emotion-Tick → die Emotion-Kern-Ticks bleiben isoliert.
        this._tickEmotionContagion(delta);
        // V8.49 — der Wunsch-Vektor EINMAL angelegt + pro Kreatur pro Frame wiederverwendet, statt je Kreatur zu
        // allokieren (bei 120 Kreaturen waren das ~400 Allokationen/Frame → GC-Ruckeln).
        const scratchDir = this._creatureScratchDir || (this._creatureScratchDir = new THREE.Vector3());
        const playerPos = this.state.playerMesh.position;
        // DIE JÄGER dieses Takts (Q11): wer jagt (der Zustand des Vor-Takts), ist eine Bedrohung für jede Beute in seiner
        // Witterung — _creatureWariness liest die Liste (die Beute floh vorher nur vor dem Spieler, R-D4/K-D11), und in
        // ihr ruht kein Tier (`_kreaturRuht`, K59: der Biss liest die Glieder der Beute). EINE Liste je Takt, VOR der Ruhe.
        const jaeger = this._kreaturJaeger || (this._kreaturJaeger = []);
        jaeger.length = 0;
        // DIE JÄGER DES SPIELERS dieses Takts (oekologie.K4#2): wer ihn pirscht oder hetzt und wessen Jagd auf ihn läuft — auch
        // zwischen den Ansprüngen, bis das Gesetz sie endet (`_kreaturJagdEndet`: dauerS, oder ruheS ohne Hetze). Leser: sein
        // Umstellen (`_spielerUmstellt`) und die Wariness des Jägers (die Furcht der Beute schreckt ihn nicht).
        const spielerJaeger = this._spielerJaeger || (this._spielerJaeger = []);
        spielerJaeger.length = 0;
        const jetzt = this.state.creatureAnimationTime;
        const ruheS = AnazhRealm._jagdGesetz().J.ruheS;
        // DER WEITESTE RAUM dieses Takts (Lehre 25: billige Filter zuerst): die Separation und der freie Weg prüfen ein
        // Paar erst genau (`_kreaturRaum` des anderen), wenn es näher steht als der eigene Raum + dieser — vorher fragte
        // jedes Tier den Raum JEDES anderen (40 Tiere: 1 600 Rufe je Takt).
        let raumMax = 0;
        for (const c of this.state.creatures) {
            const u = c && c.userData;
            if (!u) continue;
            const zj = u._motionZustand;
            const jagt = zj === "jagd" || zj === "hetzen";
            if (jagt) jaeger.push(c);
            if (
                (jagt && u._jagdZiel === "spieler") ||
                (u._jagd && u._jagd.ziel === "spieler" && jetzt - u._jagd.zuletzt <= ruheS)
            )
                spielerJaeger.push(c);
            raumMax = Math.max(raumMax, this._kreaturRaum(c));
        }
        this._raumMaxTakt = raumMax;
        // DER RUHENDE LEIB (K59): wer außer Bild, fern und ohne Zustand ist, ruht in diesem Takt — VOR dem Ziegel (ein
        // ruhender Leib schreibt kein Feld; ein erwachender zieht seine Matrizen nach, bevor das Feld sie liest).
        this._tickKreaturRuhe(delta, playerPos);
        // DER KREATUR-ZIEGEL (Analog A): Tiere sind Kapsel-Feld — das Feld
        // WANDERT mit dem Tier (lebende Knochen-Matrix, Matrix der Matrix).
        this._tickKreaturZiegel(playerPos);
        this._tickLeichname(delta, playerPos); // die Gefallenen: kippen, liegen, sinken — kein Wesen mehr, ihre Sicht wie jede
        // DER LAUF DES SPIELERS in diesem Takt (die Lage-Änderung, gleich welcher Weg ihn bewegt): ein Jäger hetzt, wenn
        // sein Ziel davonläuft (_kreaturJagdZug).
        {
            const sa =
                this._spielerLageAlt || (this._spielerLageAlt = { x: playerPos.x, z: playerPos.z, vx: 0, vz: 0 });
            const dtS = delta > 1e-6 ? delta : 1 / 60;
            sa.vx = (playerPos.x - sa.x) / dtS;
            sa.vz = (playerPos.z - sa.z) / dtS;
            if (!(Math.hypot(sa.vx, sa.vz) < 50)) sa.vx = sa.vz = 0; // ein Sprung der Lage (Teleport) ist kein Lauf
            sa.x = playerPos.x;
            sa.z = playerPos.z;
        }
        // DIE VERBÄNDE dieses Takts (S6): die Glieder je Verband (der Wurf bindet sie, `_kreaturVerbinden`) — EINE Liste je
        // Takt, die Listen im Pool (keine Allokation je Frame). Sie ersetzt das Herden-Gitter (5-m-Zellen der Kohäsion je
        // Gattung): der Verband reicht, so weit seine Glieder stehen, und kennt kein fremdes Tier.
        if (!this._verbaende) {
            this._verbaende = new Map();
            this._verbandPool = [];
        }
        const verbaende = this._verbaende;
        for (const glieder of verbaende.values()) {
            glieder.length = 0;
            this._verbandPool.push(glieder);
        }
        verbaende.clear();
        for (const c of this.state.creatures) {
            const vb = c && c.userData && c.userData.verband;
            if (vb == null) continue;
            let glieder = verbaende.get(vb);
            if (!glieder) verbaende.set(vb, (glieder = this._verbandPool.pop() || []));
            glieder.push(c); // der Leib, nie sein Index: ein Tod mitten im Takt verschiebt die Liste
        }
        const lifeTrickleNow = performance.now() / 1000;
        // Frame-Budget für volle `_voxelSurfaceY`-Scans in `_creatureGroundY`, egal wie viele Kreaturen;
        // der Rest nutzt den Cache.
        this._creatureGroundBudget = 20;
        // Ferne Kreaturen rechnen die teure KI-Richtung seltener (Band-`aiDiv`), bewegen sich aber jeden
        // Frame glatt weiter; der Frame-Zähler staffelt die Neuberechnung (kein Sammel-Spike).
        const aiFrame = (this._creatureAiFrame = (this._creatureAiFrame || 0) + 1);
        // SCHLUSS-WELLE — das EINE Verhaltens-Gesetz für den ganzen Tick
        // (memoisiert, fail-closed): Freude-Tempo/Hüpf-Höhen · Herde · Wasser.
        const VGL = AnazhRealm._verhaltenGesetz();
        // DER TAKT-INDEX lebt am Wirt (`_kreaturTaktI`): fällt mitten im Takt ein Tier, das er schon getragen hat (ein Biss
        // tötet die Beute), rückt _kreaturAusListe ihn nach — das nächste Tier läuft, keines doppelt, keines übersprungen.
        for (this._kreaturTaktI = 0; this._kreaturTaktI < this.state.creatures.length; this._kreaturTaktI++) {
            const i = this._kreaturTaktI;
            const creature = this.state.creatures[i];
            const emotion = this.state.creatureEmotions[i];
            // DER GROBE TAKT (K59): ein ruhender Leib geht nur in seinem Fenster (jeder `takt`-te Frame, gestaffelt am Index)
            // mit der aufgelaufenen Zeit; ein erwachter trägt die Rest-Zeit in seinen ersten Schritt. Der Takt ändert die
            // Kadenz, nie die Entscheidung (Q11): derselbe Schritt, dieselbe Zeit, der Kontakt hält über den Teil-Schritt (`_kreaturWeg`).
            const dt = this._kreaturTaktDt(creature, aiFrame + i, delta);
            if (dt === null) continue;
            // DAS TEMPO IN m/s (Q3): die Tempo-Einheit des Verhaltens aus dem Gang-Gesetz (tetrapoda tempoEinheit,
            // tempo·√(g·L) an der Hüft-Höhe L — ein großes Tier läuft schneller, ein kleines kürzer), darauf der Charakter
            // (computeCreatureStats.speed / 7, geklemmt [0.6, 1.6], gecacht pro Soul×bodySize) und die Freude
            // (VERHALTEN.freude.tempoMul). Vorher war der Charakter-Faktor selbst die Geschwindigkeit in m/s (R-D6: das
            // Tempo ein Verhältnis, nach Arten flach 1,10–1,30).
            const hueftL = this._kreaturHueftL(creature);
            const speed =
                (emotion === "happy" ? VGL.freude.tempoMul : 1) *
                this._creatureMoveCharacter(creature).speedMul *
                AnazhRealm._steuerGesetz().tempoEinheit(hueftL);
            // V17.29 — tendende Kreatur (Nexus/Spieler-getragen) träufelt Leben
            // in ihre Zelle (Leben sustainiert, wo es wohnt; rate-limitiert).
            this._tickCreatureLifeTrickle(creature, lifeTrickleNow);

            // Im Sichtfeld? Nur für das Bild-Gesetz des Leibs (_leibSicht: Fell, Aura) und den Gang ferner Läufer — nie für
            // eine Bewegungs-Entscheidung (Q11: Herde und Hindernis hingen am Blick des Spielers, R-D5).
            const inFrustum = this.isInFrustum(creature);

            // Das Distanz-Band bestimmt, wie oft die KI-Richtung neu rechnet. distSq (XZ) EINMAL hier (der
            // Wasser-Kontext nutzt es wieder), die Wurzel EINMAL (die Anim-Raten-Leiter liest sie).
            const dxToPlayer = creature.position.x - playerPos.x;
            const dzToPlayer = creature.position.z - playerPos.z;
            const distSqToPlayer = dxToPlayer * dxToPlayer + dzToPlayer * dzToPlayer;
            const distToPlayer = Math.sqrt(distSqToPlayer);
            const aiBand = this._detailBand(distToPlayer / 43.2);
            // (der grobe Schritt eines ruhenden Leibs trägt `_taktN` Frames: fiel in sie ein KI-Takt, rechnet er — K59)
            const recomputeAI =
                aiBand.aiDiv <= 1 ||
                !creature.userData.aiDir ||
                (aiFrame + i) % aiBand.aiDiv < creature.userData._taktN;
            // Ein non-wander-Task hat Vorrang (follow_player / wait …); sonst Emotions-/Charakter-Bewegung.
            // Ferne Kreaturen (Band 2/3) rechnen die Richtung nur jeden aiDiv-ten Frame (Cache → glatt).
            let task = null;
            let direction;
            if (recomputeAI) {
                task = this._getCreatureTask(creature);
                this._kreaturTaetigkeit(creature); // der Tag des Tiers (Tiere K4): Pegel und Tätigkeit vor jedem Zweig
                // DER DURST ZIEHT ZUM WASSER (Tiere K4): ein Tier in Ruhe, ohne Auftrag des Spielers, trinkt, wenn es durstig ist
                if (
                    (!task || task.name === "wander") &&
                    !creature.userData._motionZustand &&
                    this._kreaturDurstig(creature)
                ) {
                    this.assignCreatureTask(creature, "drink", { durst: true }, { silent: true });
                    task = this._getCreatureTask(creature);
                }
                direction = this._tickCreatureTaskDirection(creature, task, emotion);
                if (direction === null) {
                    direction = scratchDir.set(0, 0, 0);
                    // Die wilde Kreatur LIEST den Spieler über die WARINESS (Aura-Menace × Natur × Bindung × Modus +
                    // Kampf-Furcht): neugierig NÄHER · scheu FORT · sonst gemächlich wandern.
                    const wariness = this._creatureWariness(creature);
                    // SPIEGEL-ZENSUS — Furcht/Jagd-Zahlen aus dem tetrapoda-
                    // Gesetzbuch (VERHALTEN via _verhaltenGesetz, fail-soft).
                    const VG = AnazhRealm._verhaltenGesetz();
                    const NAT = VG.furcht;
                    let jagt = false;
                    let frisst = false;
                    // JAGD: ein wildes, unverängstigtes Wesen pirscht ZUR gewitterten Beute — Tier oder Spieler, EINE Witterung
                    // (_creatureScentHuntDir) — und beißt in Reichweite; Furcht, Flucht und Hunger am Kadaver gehen vor
                    if (wariness >= NAT.fleeThreshold || creature.userData._motionZustand === "flucht") {
                        // SCHEU/verschreckt — fort von der BEDROHUNG (_creatureWariness merkt Ort und Radius), im Sprint; sonst
                        // Charakter-Wandern. DER FLUCHTWEG (Tiere K1, tetrapoda fluchtRadius): die Flucht im Radius merkt den
                        // Ort und läuft bis zu ihrem Radius (vorher endete sie am Radius: die Herde hielt 14,0 m vor dem Spieler).
                        const ud = creature.userData;
                        const B = ud._bedrohtVon;
                        const F = ud._fluchtOrt || (ud._fluchtOrt = { x: 0, z: 0, r: 0 });
                        const nah = Math.hypot(creature.position.x - B.x, creature.position.z - B.z) < B.r;
                        if (wariness >= NAT.fleeThreshold && nah) {
                            const glieder = this._kreaturVerbandGlieder(creature);
                            Object.assign(F, B).r = AnazhRealm._furchtGesetz().fluchtRadius(B, glieder, ud._alarmEigen);
                        } else if (ud._motionZustand !== "flucht") F.r = 0;
                        const fx = creature.position.x - F.x;
                        const fz = creature.position.z - F.z;
                        const fd = Math.hypot(fx, fz);
                        if (fd < F.r) {
                            this._kreaturZustandStempel(creature, "flucht");
                            // DIE FLUCHT IST DER SPRINT DER GESTALT (Welle LF, STEUER sprintTempo): ein Fluchttier galoppiert
                            // davon (vorher ein Trab, 1,6 × Schlendern — jede Hetze holte es ein, jeder Mensch auch)
                            const fv = fd > 1e-6 ? this._kreaturSprint(creature, hueftL) / fd : 0;
                            direction.set(fx * fv, 0, fz * fv);
                        } else {
                            this._kreaturZustandStempel(creature, null);
                            // V18.472 (C2) — die EINE Wander-Quelle (Charakter statt Rauschen); wer sich fürchtet, ruht und äst
                            // nicht (Tiere K4): er zieht mit seinem Verband
                            this._creatureCharacterWander(creature, direction, speed, false);
                        }
                    } else if (this._kreaturAasZug(creature, direction, speed, hueftL)) {
                        // DER KADAVER (Meisterkarte Tiere H3): Hunger schlägt Neugier und Jagd — ein hungriges Tier frisst,
                        // was schon liegt; der Weg zum Kadaver ist sein eigener (kein Verband zieht)
                        frisst = true;
                    } else if (this._creatureScentHuntDir(creature, wariness)) {
                        jagt = true;
                        const beute = creature.userData._beute;
                        // DIE JAGD (Welle LF): die gewitterte Beute ist das Ziel des EINEN Wegs — Pirsch, der Platz im Rudel,
                        // die Hetze im Sprint; ihr Lauf ist der des Spielers in diesem Takt oder die Flucht des Tiers, und der
                        // Biss gilt ihr (das Biss-Gesetz nennt den Spieler null)
                        const spieler = beute === this.state.playerMesh;
                        const bs = beute.userData._steuer;
                        const bv = bs && beute.userData._motionZustand === "flucht" ? bs.v : 0;
                        const sv = this._spielerLageAlt;
                        this._kreaturJagdZug(
                            creature,
                            beute.position.x,
                            beute.position.z,
                            spieler ? "spieler" : beute.userData.netId || beute.uuid,
                            direction,
                            speed,
                            hueftL,
                            spieler ? sv.vx : Math.sin(beute.rotation.y) * bv,
                            spieler ? sv.vz : Math.cos(beute.rotation.y) * bv,
                            spieler ? null : beute
                        );
                        if (spieler) this._tickCreatureHuntStrike(creature);
                        else this._tickCreatureScentStrike(creature);
                    } else if (wariness <= NAT.curiousThreshold) {
                        // NEUGIERIG — näher zum Spieler (sanfte Aura lockt das Wesen heran).
                        this._kreaturZustandStempel(creature, null);
                        // DIE NEUGIER HÄLT ABSTAND (Welle LF): sie hält am Paar-Raum mit dem Spieler an (der Raum des Leibs +
                        // der des Spielers, _kreaturRaum/_spielerRaum), davor bremst das Ankunfts-Gesetz. Vorher hielt sie bei
                        // festen 2 m um die Mitte des Spielers — ein Bär stand mit dem Leib im Spieler.
                        const tpx = playerPos.x - creature.position.x;
                        const tpz = playerPos.z - creature.position.z;
                        const rest = Math.hypot(tpx, tpz) - this._kreaturRaum(creature, hueftL) - this._spielerRaum();
                        this._kreaturZiel(direction, tpx, tpz, rest, speed, creature);
                    } else {
                        this._kreaturZustandStempel(creature, null);
                        // NEUTRAL — weder gelockt noch verschreckt noch witternd → gemächliches
                        // Wandern. V18.472 (C2): das CHARAKTER-Wandern (Stats/Emotionen/Leine)
                        // statt weißem Rauschen — die EINE Wander-Quelle.
                        this._creatureCharacterWander(creature, direction, speed);
                    }
                    // DER VERBAND (S6, tetrapoda verbandZug): EIN Zug für jeden wilden Zweig — Wandern, Flucht, Neugier — auf
                    // den Wunsch, den der Zweig schrieb: die Glieder richten sich aus und halten zusammen. Nur die Jagd folgt
                    // ihrem Ring (rudelPlatz). Vorher zog die Herden-Form allein im Neugier-Zweig, und nur Nachbarn im Fenster.
                    if (!jagt && !frisst) this._kreaturVerbandZug(creature, direction, speed, hueftL);
                    // DIE TÄTIGKEIT TRÄGT DEN ZUG (Tiere K4): wer wandernd ruht, steht, auch im Verband; wer äst, grast
                    if (creature.userData._gezeigt) direction.multiplyScalar(this._kreaturTaetigkeitTempo(creature));
                }
                // V17.115 U3 — die KI-Richtung cachen; ferne Kreaturen verwenden sie
                // aiDiv Frames lang wieder → glatte Bewegung, seltene Neuberechnung.
                if (!creature.userData.aiDir) creature.userData.aiDir = new THREE.Vector3();
                creature.userData.aiDir.copy(direction);
            } else {
                direction = scratchDir.copy(creature.userData.aiDir);
            }

            // Separation JEDEN Frame auf die LIVE-Richtung (nach dem aiDir-Cache, nie stale): Nachbarn im PAAR-RAUM (der
            // persönliche Raum beider Leiber, Welle LF) stoßen ab, deterministisch aus Positionen + Index.
            this._applyCreatureSeparation(creature, i, direction, speed);

            // DER KÖRPER IM WASSER (Welle L, Q6 — JEDE Kreatur, nie nur im 50-m-Kreis um den Spieler): die EINE
            // Wasser-Wahrheit am Körper (`_koerperWasser` über ihrem Grund) und ihre GESTALT — die Wasserlinie liegt am
            // Schultergelenk (die Gelenk-Höhe des Vorderlaufs × Körpergröße, `_tierBaum.bein`). Sie schwimmt, sobald die
            // Säule über dem Grund tiefer ist als diese Linie (mindestens wasser.schwimmTiefeM); flacher watet sie.
            // Bis V18.531: jenseits 50 m stand jedes Tier am Seegrund (8 m tief, 4,27-m-Sprung beim Näherkommen), und
            // die Sohle lag bei jeder Größe 0,3 ± 0,2 m unter dem rohen Spiegel (der Hirsch stand AUF dem See).
            // Die EINE Wasser-Regel der Tiere (`_kreaturSchwimmt`, auch der Leser des Stoß-Schritts).
            const udW = creature.userData;
            const waterSurface = this._kreaturSchwimmt(creature, this._creatureGroundY(creature));
            // Körper-Zustand für die EINE Motion-Brücke: schwimmt die Kreatur (dieselbe Wahrheit wie ihre Lage), paddelt
            // der Baum-Gang (MOTION.schwimmen); an Land fällt NUR der Schwimm-Stempel.
            if (waterSurface !== null) udW._motionZustand = "schwimmen";
            else if (udW._motionZustand === "schwimmen") udW._motionZustand = null;
            // XZ-Distanz, nicht 3D: bei großer Y-Variation (Spieler auf dem Berg, Kreatur am See-Boden) risse
            // Δy² allein die 2500-Schwelle — das Gate meint horizontale Sichtnähe. distSqToPlayer (XZ) kommt
            // schon von oben; hier nur das <50-m-Verhaltens-Gate.
            if (distSqToPlayer < 2500) {
                // SCHLUSS-WELLE — die Ufer-Scheu ist Wasser-Gesetz (tetrapoda
                // VERHALTEN.wasser: Tiefen-Schwellen + Ufer-Bias, byte-gleich).
                const WAS = VGL.wasser;
                const wctx = this._creatureWaterContextAt(creature, this._creatureGroundY(creature));
                if (wctx.inWater) {
                    if (wctx.depthBelow > WAS.tiefenScheuM && wctx.shoreDir && (!task || task.name === "wander")) {
                        // shoreDir ist Kardinal-Vector3 (±1 oder 0) — keine
                        // normalize() nötig. Der uferBias (× Speed) gibt der
                        // Tiefen-Scheu klaren Vorrang ohne Schwarm-Bewegung zu zerstören.
                        direction.x += wctx.shoreDir.x * speed * WAS.uferBias;
                        direction.z += wctx.shoreDir.z * speed * WAS.uferBias;
                    }
                }
                // Verhaltens-Tick (nahe Wesen, dieselbe 50-m-Wand): tempo bremst/stoppt die Bewegung unten, hop
                // zündet beim Start den feld-nativen Hüpfer. Die Uhr der Aktion ist die Kreatur-Uhr (Q1: was den
                // Körper bewegt, läuft im Takt — die Wand-Uhr ließ eine Aktion je nach Bildrate verschieden lang wirken).
                this._tickKreaturVerhalten(creature, i, this.state.creatureAnimationTime);
            }
            // DER BEWEGUNGS-ANSPRUCH DER AKTION (Q11, Kritik §2.3): tempo bremst oder stoppt den Wunsch für JEDES Tier, das
            // die Aktion trägt — die 50-m-Wand endet nur das Wählen neuer Aktionen. Vorher galt er nur in ihr: ein Tier, das
            // hinaus wanderte, lag in der Ruhe-Pose und lief (95 % der Ruhe-Takte bewegt).
            {
                const VA = udW._verhaltenAktion;
                const now = this.state.creatureAnimationTime;
                const B = VA && VA.biss;
                if (B && this._kreaturAnsprungOffen(creature)) {
                    // DER ANSPRUNG (Welle LF kampf, Posten 5): solange der Biss nicht geschnappt hat, trägt der Sprung den Kopf
                    // auf das Ziel — derselbe Weg wie die Hetze (_kreaturJagdZug): der Wunsch zeigt auf es, das Ankunfts-Gesetz
                    // im Sprint der Gestalt plus dem Lauf des Ziels von ihm fort hält ihn dort, wo der Kopf über der
                    // Mittel-Linie des Leibs steht (_kreaturBissKopfWeg); im Fallen neigt er sich auf den Leib
                    // (_kreaturBissKopf). Ein Sprung, der weiterflöge, trüge den Kopf über ein kleines Ziel hinweg; einer, der
                    // am Rand hielte, schnappte daneben; einer im Schritt verlöre jede fliehende Beute.
                    const zp = B.ziel ? B.ziel.position : playerPos;
                    const bx = zp.x - creature.position.x,
                        bz = zp.z - creature.position.z;
                    const bd = Math.hypot(bx, bz);
                    const mB = this._kreaturMaul(creature, this._bissMaulZug || (this._bissMaulZug = {}));
                    const weg = mB ? this._kreaturBissKopfWeg(B.ziel, mB) : null;
                    let zvx = 0,
                        zvz = 0;
                    if (B.ziel) {
                        const g = this._kreaturGeschw(B.ziel);
                        zvx = g.x;
                        zvz = g.z;
                    } else if (this._spielerLageAlt) {
                        zvx = this._spielerLageAlt.vx;
                        zvz = this._spielerLageAlt.vz;
                    }
                    const fort = bd > 1e-6 ? Math.max(0, (zvx * bx + zvz * bz) / bd) : 0;
                    const SG = AnazhRealm._steuerGesetz();
                    const sprint = this._kreaturSprint(creature, hueftL);
                    // (ein Hauch von Wunsch bleibt: er trägt die Wendung zum Ziel, auch wenn der Kopf es schon erreicht)
                    const bv = Math.max(1e-3, weg > 0 ? Math.min(sprint, SG.ankunftTempo(weg, sprint) + fort) : fort);
                    if (bd > 1e-6) direction.set((bx / bd) * bv, 0, (bz / bd) * bv);
                } else if (VA && VA.def && Number.isFinite(VA.def.tempo) && now < VA.bis) {
                    direction.multiplyScalar(Math.max(0, VA.def.tempo));
                }
            }

            // DER STEUER-SCHRITT (Q3, tetrapoda steuerSchritt): `direction` ist der WUNSCH (Welt-XZ, m/s) aus Auftrag,
            // Flucht, Jagd, Neugier, Wandern, Separation, Ufer-Scheu und Aktion. Er dreht die Gier mit der Wendegrenze
            // der Art auf sich zu; der Leib läuft nur VORWÄRTS längs seiner Gier, mit dem Teil des Wunschs, der vor ihm
            // liegt, das Tempo folgt mit Anfahr- und Brems-Grenze — die Gier IST die Laufrichtung. Vorher schrieb niemand
            // rotation.y: die Tiere liefen im Krebsgang (R-D1: Lauf ↔ Blick p50 63–108°, rückwärts 30–59 % der Frames),
            // Tempo-Sprünge ~290 m/s².
            const udS = creature.userData;
            const steuer = udS._steuer || (udS._steuer = { gier: creature.rotation.y || 0, v: 0 });
            AnazhRealm._steuerGesetz().steuerSchritt(steuer, direction.x, direction.z, dt, hueftL);
            creature.rotation.y = steuer.gier;
            // DER GANG geht den EINEN Weg des Leibs (`_kreaturWeg`): Gier × Tempo und die STRÖMUNG, die SCHWIMMENDE Kreaturen
            // trägt (waterSurface !== null ⇔ die Säule ist tiefer als ihre Wasserlinie — Land-Läufer nie: eine Drift des
            // Wassers, kein Wunsch des Tiers; Quelle = DIESELBE `_waterFlowAt` wie beim Spieler), in Teil-Schritten gegen Hülle
            // und Leiber.
            const gang = this._kreaturGangV || (this._kreaturGangV = { x: 0, z: 0 });
            gang.x = Math.sin(steuer.gier) * steuer.v;
            gang.z = Math.cos(steuer.gier) * steuer.v;
            if (waterSurface !== null) {
                const _fl = this._waterFlowAt(creature.position.x, creature.position.z);
                if (_fl) {
                    gang.x += _fl.x;
                    gang.z += _fl.z;
                }
            }
            // Der STOSS, den ein Leib trägt, bewegt ihn im festen Sim-Schritt (`_kreaturStossSchritt`, 0710-5), nie hier im
            // Frame-Takt: hier trug `_stossV · delta` ihn je Frame ohne Weg-Prüfung — bei 30 fps (0,46 m je Frame aus 13,7 m/s)
            // sprang ein Bär 9 von 10 Mal durch eine 0,35-m-Wand, und der Wagen las das Frame-Gedächtnis im Sim-Schritt.
            // DER RUHENDE LEIB GEHÖRT DEM SCHRITT: steht ein Leib, wo ihn sein letzter Stoß-Schritt ließ (`_kreaturRuhtImSchritt`),
            // und geht er nicht, löst der Frame-Takt ihn weder gegen die Hüllen noch setzt er seine Höhe — beides tat der
            // Stoß-Schritt mit derselben Regel; erst wenn er selbst geht, trägt ihn der Frame-Takt.
            const ruhtImSchritt = gang.x === 0 && gang.z === 0 && this._kreaturRuhtImSchritt(creature);
            if (!ruhtImSchritt) this._kreaturWeg(creature, hueftL, gang, dt, i, true);

            // Sanfter Decay des Innenlebens (~17 s Halbwert); ruhige Wesen werden sparse (null = kein Tick-Rest),
            // beim Ausklingen projiziert die Valenz auf "happy" zurück — getroffene Wesen erholen sich.
            if (creature.userData.emotions) {
                const dk = Math.max(0, 1 - dt * 0.04);
                let live = false;
                const em = creature.userData.emotions;
                for (const ax in em) {
                    const v = em[ax] * dk;
                    em[ax] = v < 0.005 ? 0 : v;
                    if (em[ax] > 0) live = true;
                }
                if (!live) {
                    creature.userData.emotions = null;
                    // der Index JETZT (ein Tod mitten im Takt rückt ihn, _kreaturAusListe)
                    const ie = this._kreaturTaktI;
                    if (Array.isArray(this.state.creatureEmotions) && this.state.creatures[ie] === creature)
                        this.state.creatureEmotions[ie] = "happy";
                }
            }

            // Boden über den gecachten `_creatureGroundY` (Budget) statt vollem `_voxelSurfaceY`-Scan je Frame;
            // Semantik wie `getTerrainHeightAt` (null → terrainBaseHeight). Nie state.groundHeightField direkt
            // lesen — in Voxel-Welten schwebten die Kreaturen sonst.
            const _gY = this._creatureGroundY(creature);
            const terrainHeight =
                typeof _gY === "number" && Number.isFinite(_gY) ? _gY : this.state.terrainBaseHeight || 0;
            // Nasse + tiefe Spalte → 0.3 m unter dem Wasser-Spiegel (Schwimm-Surface + Bob). An Land stehen die
            // Sohlen des bauTier-Baums AUF dem Boden (wrap normalisiert minY→0). Nahe Wesen proben vorn/hinten →
            // Root-Pitch folgt dem Hang, Basis = Proben-Mitte; ferne stehen auf der Center-Probe (Pitch klingt
            // aus). Render-only — kein Sim-/Task-Pfad liest rotation.x.
            let baseY;
            let pitchZiel = 0;
            let rollZiel = 0;
            let traegtBau = false;
            if (waterSurface !== null) {
                // Die Wasserlinie am Schultergelenk: die Sohle hängt so tief unter dem Spiegel (das Paddeln trägt der
                // Gang selbst, MOTION.schwimmen; das Literal −0,3 ± 0,2 m fiel) — `_kreaturSchwimmLinie`, dieselbe wie im
                // Stoß-Schritt.
                baseY = this._kreaturSchwimmLinie(creature, waterSurface);
            } else {
                // DIE SICHT STEHT AUF DEM MESH (Q4): jedes Tier steht auf dem Stand-Leser um sein Gesetz — nahe Wesen auf
                // ihren vier Proben, ferne auf der Mitte (je Frame bilinear, kein Cache-Sprung).
                baseY = this._standSicht(creature.position.x, creature.position.z, terrainHeight, false);
                if (!Number.isFinite(baseY)) baseY = terrainHeight;
                const fLB = creature.scale.x || 1;
                if (distToPlayer < creature.userData._gelenk.abM * fLB * 0.5) {
                    const sp = this._creatureSlopeProben(creature, terrainHeight);
                    if (sp) {
                        baseY = sp.mitte;
                        pitchZiel = sp.pitch;
                        rollZiel = sp.roll;
                    }
                }
                // DIE AUFLAGE DER BAUTEN (Welle LF, Neu 4/D7): trägt eine Box der Hüllen den Leib (ihre Oberkante in der
                // Stufe über dem Fuß — Sockel, Podest, Stufe), steht das Tier auf ihr, wie der Spieler; vorher las es nur
                // den Boden und ging 0,35 m tief im Haus-Sockel, auf dem der Spieler stand.
                const auflage = this._kreaturAuflage(creature, hueftL);
                if (auflage > baseY) {
                    baseY = auflage;
                    pitchZiel = 0;
                    rollZiel = 0;
                    traegtBau = true;
                }
            }
            {
                // Root-Lage exp-geglättet (NaN-Wand vor dem Gedächtnis, Lehre 13): Nick längs der Gier, Wank quer —
                // Euler YXZ, erst die Gier, dann Nick und Wank im Leib-Rahmen (in XYZ kippte der Nick um die Welt-x).
                const udP = creature.userData;
                const pk = 1 - Math.exp(-8 * Math.min(0.1, dt || 0.016));
                let hp = (udP._hangPitch || 0) + (pitchZiel - (udP._hangPitch || 0)) * pk;
                if (!Number.isFinite(hp)) hp = 0;
                let hr = (udP._hangRoll || 0) + (rollZiel - (udP._hangRoll || 0)) * pk;
                if (!Number.isFinite(hr)) hr = 0;
                udP._hangPitch = hp;
                udP._hangRoll = hr;
                creature.rotation.x = hp;
                creature.rotation.z = hr;
            }
            // DER HÜPFER (Q1): ein Versatz ON TOP der geerdeten baseY (die Erdung bleibt Wahrheit), EIN Integrator auf
            // dem Takt `dt` — die Parabel des Gesetzes (g des Gang-Gesetzes), je Schritt exakt (h += v·dt − g·dt²/2),
            // darum dieselbe Flugzeit bei jeder Bildrate; er startet nur aus einer Aktion (bound/pounce) über das EINE
            // Sprung-Gesetz creatureJump (Höhe aus der Freude). Vorher rechnete er je Frame feste 0,05 s (bei 144 Hz
            // ein Sechstel der Flugzeit) und ein Würfel je Frame zündete ihn (Leben-Prüfung R-D3: 21–26 % Luft-Frames).
            let hopOffset = 0;
            const udH = creature.userData;
            if (udH._hopV > 0 || udH._hopH > 0) {
                const g = this._hopSchwere();
                const h = (udH._hopH || 0) + (udH._hopV || 0) * dt - 0.5 * g * dt * dt;
                udH._hopV = (udH._hopV || 0) - g * dt;
                if (!(h > 0)) {
                    udH._hopH = 0;
                    udH._hopV = 0;
                } else udH._hopH = h;
                hopOffset = udH._hopH;
            }
            // ein gleitender Leib (er trägt einen Stoß) steht auf der Höhe seines Sim-Schritts (`_kreaturStossSchritt`) — an
            // Land wie im Wasser (L8: die Höhe des gestoßenen Schwimmers lebt im Sim-Schritt, gleich bei jeder Bildrate)
            if (!creature.userData._stossV && !(ruhtImSchritt && !(hopOffset > 0)))
                creature.position.y = baseY + hopOffset;
            // DER TRÄGER der Pfoten (Welle LF): die Höhe, auf der der Leib steht, und ob ein Bau ihn trägt (_kreaturFussBoden)
            udH._traegerY = baseY;
            udH._traegerStruktur = traegtBau;
            // DER LAUF DES LEIBS (Welle LF, der ferne Gang): wer läuft, dem laufen die Beine in jeder Ferne
            this._kreaturLaufTakt(creature, dt);

            // Emergente Bewegung aus den Soul-Parts (Beine schwingen, Flügel schlagen, Schwänze wellen) — NACH der Lage des
            // Takts (Welle LF): die Beine stellen sich auf den Boden unter jeder Pfote (_animateTierBaum liest Höhe, Nick und
            // Wank dieses Takts, nicht die des vorigen).
            // walkPhase läuft nur in Bewegung (kein Glieder-Sprung beim Stopp). Kosten: wenige sin() je Wesen.
            {
                const mroles = this._motionRolesForSoul(creature.userData.soul);
                // im Satz geht der Satz (`_tickTierSatz`): der Leib zeichnet nicht, sein Weg rückt die Phase
                if (creature.userData._satz) this._tierSatzGang(creature, dt);
                else if (mroles) {
                    const movingNow = steuer.v > 0.1; // der Leib läuft (das Tempo des Steuer-Schritts), nicht der Wunsch
                    creature.userData.walkPhase = (creature.userData.walkPhase || 0) + (movingNow ? dt * 5.0 : 0);
                    // ANIM-RATEN-LOD: walkPhase + creatureAnimationTime akkumulieren JEDEN Frame (Gang gleich schnell),
                    // ferne Wesen werten nur 1/2 · 1/4 aus ((aiFrame+i)-Stagger, kein Spike). Jenseits der Stufen-Grenze
                    // tickt nur, wer läuft (1/8) — wer steht, friert EINMAL in der Stand-Pose ein (die Grobstufe trägt
                    // dieselben Knochen). Die Grenze der Gestalt (`ab` aus der Kern-Zeile, `_gelenkGestalt`) × Größe —
                    // dieselbe wie der Schalter.
                    const fLA = creature.scale.x || 1;
                    const fernDist = creature.userData._gelenk.abM * fLA;
                    const tBA = creature.userData._tierBaum;
                    const omegaGang = tBA && tBA._gang ? tBA._gang.omega : 0;
                    // KOSTEN AN DEN SCHIRM (Gebot 7): jenseits der Stufen-Grenze läuft der Gang nur, wo der Blick ihn
                    // sieht — ein ferner Läufer hinter der Kamera steht still, bis er ins Bild kommt (39 Tiere, 32 fern:
                    // der Kreatur-Takt kostete mit jedem fernen Läufer 0,78 ms statt 0,41)
                    const laeuft = this._kreaturLaeuft(creature) && (inFrustum || distToPlayer < fernDist);
                    let animDiv = this._creatureAnimDiv(distToPlayer, fernDist, omegaGang, dt, laeuft);
                    // ein offener Biss braucht seine Pose in jedem Takt (Posten 5): ob das Maul den Leib berührt, entscheidet
                    // der geneigte Kopf (_kreaturBissTakt), auch ungesehen — die Kosten trägt nur der Ansprung (unter 1 s)
                    const VAb = creature.userData._verhaltenAktion;
                    if (VAb && VAb.biss) animDiv = 1;
                    if (animDiv === 0) {
                        if (!creature.userData._animEingefroren) {
                            creature.userData._animEingefroren = true;
                            this._tierBaumNeutralStance(creature);
                        }
                    } else if (animDiv === 1 || (aiFrame + i) % animDiv === 0) {
                        creature.userData._animEingefroren = false;
                        // der Ausklinge-Saum: vor der Schwelle blendet der Schritt in
                        // die Stand-Pose — der Stufen-Schalter trifft eine STEHENDE
                        // Gestalt (_animateTierBaum konsumiert _animFade).
                        // (wer läuft, behält seinen Schritt: die Ruhe trägt nur, wer steht)
                        creature.userData._animFade = laeuft ? 1 : this._creatureAnimFade(distToPlayer, fernDist);
                        // ABSCHIEDS-WELLE (Motion-Vollendung) — das Kreatur-Innenleben reist in
                        // die EINE Emotions→Profil-Brücke (chaos→flee · joy→joy · null→Default).
                        this._animateCompoundMotion(
                            creature,
                            mroles,
                            this.state.creatureAnimationTime,
                            creature.userData.walkPhase,
                            movingNow,
                            creature.userData.emotions
                        );
                    }
                }
            }
            // DAS SCHNAPPEN (Posten 5): nach der Lage UND der Pose des Takts berührt der Kopf den Leib — oder nicht
            if (creature.userData._verhaltenAktion && creature.userData._verhaltenAktion.biss)
                this._kreaturBissTakt(creature);

            // DIE SICHT DES LEIBS (die EINE Wahl jedes Leibs im Bild — Stufe, Fell, Zeichen; die Gefallenen gehen denselben Weg)
            this._leibSicht(creature, distSqToPlayer, inFrustum);
            // Farb-Updates nur `inFrustum` — beim Hinschwenken sofort zurück. Bewegung + Physik laufen für ALLE Kreaturen.
            if (inFrustum) {
                // Farbe aus der Emotion; defensiv ohne material (bricht den Frame nicht ab).
                // Zwei gepoolte THREE.Color statt Allokation je Kreatur × Frame (GC-Spikes); `material.color.lerp`
                // mutiert nur material.color, nie das Ziel → die Singletons bleiben rein.
                if (creature.material && creature.material.color) {
                    if (!this._creatureHappyColor) {
                        this._creatureHappyColor = new THREE.Color(0x00ff00);
                        this._creatureNeutralColor = new THREE.Color(0x0000ff);
                    }
                    const targetColor = emotion === "happy" ? this._creatureHappyColor : this._creatureNeutralColor;
                    creature.material.color.lerp(targetColor, 0.05);
                }
            }

            // Kill Plane
            if (creature.position.y < -50) {
                creature.position.set(creature.position.x, terrainHeight + 1.0, creature.position.z);
                this.log(`Kreatur ${i} zu tief gefallen, zurückgesetzt zu y=${terrainHeight + 1.0}`);
            }

            // DETERMINISMUS-BOGEN P3 — kein Ammo-Body-Shadow mehr: die Kreatur-Position IST
            // die Wahrheit (feld-geerdet über `_creatureGroundY`), nichts zu synchronisieren.
        }
        this._kreaturTaktI = null;
        // DIE MENGE (profiband.K1): wer nicht als Leib lebt, steht und geht im Satz seiner Gestalt
        this._tickTierSatz(playerPos);
    }
}
_stammZonen(AnazhRealm, [AnazhRealm_kreatur_verhalten]);

// ===== ATLAS · Kreatur/verhalten — Außen-Konstanten =====
// Der EINE Verhaltens-Gesetz-Leser: die Verhaltens-Zahlen der Welt-Wesen (jagd = Witterung/Biss ·
// furcht = Wariness/Flucht · temperament = Signaturen/Floor/Gegenwehr · wandern = Leine/Schlendern)
// aus dem tetrapoda-Gesetzbuch (VERHALTEN). Fail-closed: die Gültigkeits-Wand deckt je Block ein
// Feld — alter Kern → Bruch, nie Misch-Gesetz. Memo nur im Erfolgs-Fall.
AnazhRealm._verhaltenGesetz = function () {
    if (AnazhRealm._verhaltenGesetzMemo) return AnazhRealm._verhaltenGesetzMemo;
    try {
        const v = AnazhRealm.Gesetz("tetrapoda:VERHALTEN", null);
        if (
            v &&
            v.jagd &&
            Number.isFinite(v.jagd.strikeCooldownSec) &&
            v.furcht &&
            Number.isFinite(v.furcht.fleeThreshold) &&
            v.temperament &&
            v.temperament.profile &&
            // DAS TEMPERAMENT DER GATTUNG (Welle LF, Vertrags-Akt 08.10.): die Gattungs-Zeile und der Mut der Natur
            // (die Substanz-Signaturen und ihr Floor fielen).
            v.temperament.gattung &&
            Number.isFinite(v.temperament.gattung.jagdKg) &&
            Number.isFinite(v.furcht.mutGewicht) &&
            v.wandern &&
            Number.isFinite(v.wandern.leashBaseM) &&
            // SCHLUSS-WELLE (17.07.) — die neun heimgekehrten Blöcke sind
            // Kern-Pflicht: je Block deckt EIN Feld (alter Kern → Bruch,
            // nie ein Misch-Gesetz aus neuem Leser + fehlender Zeile).
            Number.isFinite(v.jagd.hetzM) &&
            Number.isFinite(v.jagd.pirschSichtM) &&
            Number.isFinite(v.jagd.beuteMasse) &&
            v.stimmung &&
            v.stimmung.schwellen &&
            Number.isFinite(v.stimmung.schwellen.weideDiet) &&
            v.freude &&
            Number.isFinite(v.freude.tempoMul) &&
            // DER KADAVER (Meisterkarte Tiere H3, Vertrags-Akt 20.10.)
            v.aas &&
            Number.isFinite(v.aas.fleischAnteil) &&
            Number.isFinite(v.aas.magenAnteil) &&
            Number.isFinite(v.aas.fressSec) &&
            Number.isFinite(v.aas.verdauSec) &&
            Number.isFinite(v.aas.hungerAnteil) &&
            Number.isFinite(v.freude.hopHochM) &&
            Number.isFinite(v.freude.hopBasisM) &&
            Array.isArray(v.groessen) &&
            v.groessen.length >= 2 &&
            v.separation &&
            Number.isFinite(v.separation.raumKugel) &&
            v.aufgaben &&
            Number.isFinite(v.aufgaben.followTempo) &&
            v.herde &&
            Number.isFinite(v.herde.fensterRaum) &&
            Number.isFinite(v.herde.gewicht) &&
            v.herde.wurf && // G4a: die Geburt wirft Gruppen (Kopfzahl je Gattung, Abstand in Paar-Räumen)
            Number.isFinite(v.herde.wurf.abstandRaum) &&
            v.wasser &&
            Number.isFinite(v.wasser.uferBias)
        ) {
            AnazhRealm._verhaltenGesetzMemo = v;
            return v;
        }
    } catch (_e) {}
    return AnazhRealm._kernPflichtBruch("tetrapoda:VERHALTEN");
};
// DAS STEUER-GESETZ (tetrapoda STEUER_GESETZ + steuerSchritt · tempoEinheit · ankunftTempo, Welle L; verbandZug ·
// rudelPlatz, S6): der EINE Steuer-Schritt je Tier und Takt, das Ankunfts-Gesetz, die Tempo-Einheit √(g·L), der Verband
// und der Platz im Rudel; dazu das Temperament
// der Gattung (temperamentDerGattung, Welle LF). Fail-closed.
// DER UMWEG (Ökologie K5): der EINE Leser von tetrapoda UMWEG_GESETZ + umwegSeite, fail-closed.
AnazhRealm._umwegGesetz = function () {
    if (AnazhRealm._umwegGesetzMemo) return AnazhRealm._umwegGesetzMemo;
    const k = typeof globalThis !== "undefined" ? globalThis.__tetrapodaCore : null;
    const U = k && k.UMWEG_GESETZ;
    if (U && [U.haltS, U.quer].every(Number.isFinite) && typeof k.umwegSeite === "function")
        return (AnazhRealm._umwegGesetzMemo = k);
    return AnazhRealm._kernPflichtBruch("tetrapoda:UMWEG_GESETZ");
};
AnazhRealm._steuerGesetz = function () {
    if (AnazhRealm._steuerGesetzMemo) return AnazhRealm._steuerGesetzMemo;
    const S = AnazhRealm.Gesetz("tetrapoda:STEUER_GESETZ", null);
    const k = typeof globalThis !== "undefined" ? globalThis.__tetrapodaCore : null;
    if (
        S &&
        Number.isFinite(S.tempo) &&
        Number.isFinite(S.wende) &&
        k &&
        typeof k.steuerSchritt === "function" &&
        typeof k.tempoEinheit === "function" &&
        typeof k.ankunftTempo === "function" &&
        typeof k.verbandZug === "function" &&
        typeof k.rudelPlatz === "function" &&
        k.VERBAND_GESETZ &&
        Number.isFinite(k.VERBAND_GESETZ.ausrichtung) &&
        Number.isFinite(k.VERBAND_GESETZ.leitGewicht) &&
        typeof k.temperamentDerGattung === "function" &&
        Number.isFinite(S.sprint) &&
        typeof k.sprintTempo === "function"
    ) {
        AnazhRealm._steuerGesetzMemo = k;
        return k;
    }
    return AnazhRealm._kernPflichtBruch("tetrapoda:STEUER_GESETZ");
};
// DAS FURCHT-GESETZ (tetrapoda FURCHT_GESETZ + bedrohung · furchtErinnert · furchtOrt, Ökologie K3): die EINE Bedrohung eines
// Gefühls (Aura des Spielers, Abdruck am Ort), das Gedächtnis des Wesens an den Spieler und die Furcht des Orts. Fail-closed.
AnazhRealm._furchtGesetz = function () {
    if (AnazhRealm._furchtGesetzMemo) return AnazhRealm._furchtGesetzMemo;
    const k = typeof globalThis !== "undefined" ? globalThis.__tetrapodaCore : null;
    const F = k && k.FURCHT_GESETZ;
    if (
        F &&
        F.erinnerung &&
        Number.isFinite(F.erinnerung.geschlagen) &&
        Number.isFinite(F.erinnerung.gefuettert) &&
        Number.isFinite(F.erinnerung.gewalt) &&
        Number.isFinite(F.deckel) &&
        Number.isFinite(F.fluchtJeFurcht) &&
        F.riss &&
        Number.isFinite(F.ortGewicht) &&
        Number.isFinite(F.ortRadiusZellen) &&
        typeof k.bedrohung === "function" &&
        typeof k.furchtErinnert === "function" &&
        typeof k.furchtOrt === "function" &&
        typeof k.fluchtRadius === "function"
    ) {
        AnazhRealm._furchtGesetzMemo = Object.freeze({
            F,
            bedrohung: k.bedrohung,
            furchtErinnert: k.furchtErinnert,
            furchtOrt: k.furchtOrt,
            fluchtRadius: k.fluchtRadius,
        });
        return AnazhRealm._furchtGesetzMemo;
    }
    return AnazhRealm._kernPflichtBruch("tetrapoda:FURCHT_GESETZ");
};
// DIE JAGD HAT EIN ENDE (tetrapoda JAGD_GESETZ + wundTempo, Tiere K2): die Dauer der Jagd, die Ruhe des Erschöpften, die Wunde,
// die den Sprint bremst. Fail-closed.
AnazhRealm._jagdGesetz = function () {
    if (AnazhRealm._jagdGesetzMemo) return AnazhRealm._jagdGesetzMemo;
    const k = typeof globalThis !== "undefined" ? globalThis.__tetrapodaCore : null;
    const J = k && k.JAGD_GESETZ;
    if (J && [J.dauerS, J.ruheS, J.wundExp].every(Number.isFinite) && typeof k.wundTempo === "function") {
        AnazhRealm._jagdGesetzMemo = Object.freeze({ J, wundTempo: k.wundTempo });
        return AnazhRealm._jagdGesetzMemo;
    }
    return AnazhRealm._kernPflichtBruch("tetrapoda:JAGD_GESETZ");
};
// die Gänge des EINEN Leib-Lösers je Sim-Schritt (`_leibKontakte`): eine Klemme in der dichten Schar löst sich in wenigen
AnazhRealm.LEIB_GAENGE = 8;
// der Teil-Schritt des EINEN Wegs jedes Tiers (`_kreaturWeg`, Gang und Stoß): höchstens `radius` Leib-Radien, mindestens `minM` m
AnazhRealm.LEIB_TEIL = Object.freeze({ radius: 0.5, minM: 0.02 });
// DER BISS ALS STOSS (0710-4): der Anteil der Jäger-Masse hinter dem Biss (tetrapoda BISS.masseAnteil) und das Tempo
// des Ansprungs (VERHALTEN.aktionen.pounce.tempo, in der Tempo-Einheit des Steuer-Gesetzes). DER BISS IST DER ANSPRUNG
// (Welle LF kampf, Posten 5): seine Geste ist die Aktion pounce — ihre Dauer und ihr Tempo sind die Reichweite des Mauls
// (_kreaturBissReich). Fail-closed.
AnazhRealm._bissGesetz = function () {
    if (AnazhRealm._bissGesetzMemo) return AnazhRealm._bissGesetzMemo;
    const T = typeof globalThis !== "undefined" ? globalThis.__tetrapodaCore : null;
    const anteil = T && T.BISS ? T.BISS.masseAnteil : NaN;
    const VG = AnazhRealm._verhaltenGesetz();
    const pounce = VG && VG.aktionen && VG.aktionen.pounce;
    if (!(anteil > 0 && anteil <= 1)) return AnazhRealm._kernPflichtBruch("tetrapoda:BISS.masseAnteil");
    if (!pounce || !(pounce.tempo > 0))
        return AnazhRealm._kernPflichtBruch("tetrapoda:VERHALTEN.aktionen.pounce.tempo");
    if (!(pounce.dauer > 0)) return AnazhRealm._kernPflichtBruch("tetrapoda:VERHALTEN.aktionen.pounce.dauer");
    const kopf = T && T.BISS ? T.BISS.kopfNeigung : null;
    if (!(Array.isArray(kopf) && kopf.length === 2 && kopf[0] < 0 && kopf[1] > 0))
        return AnazhRealm._kernPflichtBruch("tetrapoda:BISS.kopfNeigung");
    const rumpf = T && T.BISS ? T.BISS.rumpfNeigung : NaN;
    if (!(rumpf > 0)) return AnazhRealm._kernPflichtBruch("tetrapoda:BISS.rumpfNeigung");
    AnazhRealm._bissGesetzMemo = Object.freeze({
        masseAnteil: anteil,
        tempo: pounce.tempo,
        dauer: pounce.dauer,
        geste: pounce,
        kopfNeigung: kopf,
        rumpfNeigung: rumpf,
    });
    return AnazhRealm._bissGesetzMemo;
};
// Die nächsten Punkte zweier Strecken AB und CD in der Ebene (x, z): P auf AB, Q auf CD und ihr Abstand d (`out`).
AnazhRealm._streckenNah2D = function (ax, az, bx, bz, cx, cz, dx, dz, out) {
    const ux = bx - ax;
    const uz = bz - az;
    const vx = dx - cx;
    const vz = dz - cz;
    const wx = ax - cx;
    const wz = az - cz;
    const a = ux * ux + uz * uz;
    const b = ux * vx + uz * vz;
    const c = vx * vx + vz * vz;
    const d = ux * wx + uz * wz;
    const e = vx * wx + vz * wz;
    const nenner = a * c - b * b;
    let s = 0;
    let t = 0;
    if (a <= 1e-12 && c <= 1e-12) {
        s = 0;
        t = 0;
    } else if (a <= 1e-12) {
        t = Math.max(0, Math.min(1, e / c));
    } else if (c <= 1e-12) {
        s = Math.max(0, Math.min(1, -d / a));
    } else {
        s = nenner > 1e-12 ? Math.max(0, Math.min(1, (b * e - c * d) / nenner)) : 0;
        t = (b * s + e) / c;
        if (t < 0) {
            t = 0;
            s = Math.max(0, Math.min(1, -d / a));
        } else if (t > 1) {
            t = 1;
            s = Math.max(0, Math.min(1, (b - d) / a));
        }
    }
    out.px = ax + ux * s;
    out.pz = az + uz * s;
    out.qx = cx + vx * t;
    out.qz = cz + vz * t;
    out.d = Math.hypot(out.qx - out.px, out.qz - out.pz);
    return out;
};
// J längs der Normalen (A → B) bei schließender Geschwindigkeit vRel > 0; mB = Infinity für einen starren Gegner.
AnazhRealm._stossImpuls = function (mA, mB, vRel, e) {
    if (!(vRel > 0) || !(mA > 0) || !(mB > 0)) return 0;
    return ((1 + e) * vRel) / (1 / mA + (Number.isFinite(mB) ? 1 / mB : 0));
};
// V18.308 — DAS BOOT-PHASEN-GERÜST: der Atem zwischen zwei deferierten P3-Kreatur-Spawns.
// 280 ms → ~10 Wesen erscheinen sanft über ~2,8 s NACH der Kontrolle (statt aller
// Spawns synchron im Boot). Headless ist davon unberührt (dort spawnt P3 sofort, gate-treu).
AnazhRealm.BOOT_PHASE3_SPAWN_MS = 280;
// Sicherheits-Deckel der Bühne (`_buehneSteht`): erreicht eine Maschine das Ring-Ziel nie (der Ring
// wächst nur mit Frame-Kopfraum), öffnet die Bühne nach dieser Wall-Clock trotzdem — gegen den
// ewigen Verschluss; auf gesunder Hardware schließt das Prädikat in Sekunden. Bis dahin gehört der
// Boot exklusiv Boden-Streaming + Bewegung.
AnazhRealm.BUEHNE_SETTLE_CAP_MS = 90000;
// DER RUHENDE LEIB (K59, Gebot 7: Kosten an Schirm + Änderung): ein lebendes Tier außer Bild, dem das Feld die Gestalt
// trägt (`_kzBesitztFeld`: jenseits der Nah-Gestalt `KREATUR_NAH_MESH.aus` und gebacken — sein Mesh zeichnet und wirft
// nicht, das Feld wirft keinen Schatten), ohne laufenden Zustand ruht (`_kreaturRuht`): es geht nur jeden `takt`-ten Frame,
// mit der aufgelaufenen Zeit (`_kreaturTaktDt` — die Zeit geht nie verloren), sein Satz ist aus (er zeichnet nirgends), und
// es verlässt den Matrix-Gang der Szene. Der grobe Schritt bleibt kürzer als `wegMax` m (ein schnellerer Leib geht voll; der
// Weg fegt in Teil-Schritten, `_kreaturWeg`). Der Blick-Test des Takts hinkt einen Frame (die Kamera dreht nach dem
// Kreatur-Takt): der Rand wächst um `randGrad`° plus die doppelte Drehung des Vor-Frames, dazu `saumM` m — und der Blick
// des Bilds (`_ruheImBild` in `_loopRender`) weckt, was die Kamera dieses Bilds dennoch sieht (Teleport, Portal, Aufnahme).
// In der Witterung eines Jägers (`witterungM` m) ruht kein Tier (der Biss liest seine Glieder). Ein Schatten reicht höchstens
// `wurfM` m weit (`_kreaturWurfAusserBlick`).
AnazhRealm.KREATUR_RUHE = Object.freeze({ takt: 4, wegMax: 0.25, randGrad: 10, saumM: 2, witterungM: 60, wurfM: 12 });
// Die Wurzel eines ruhenden Leibs trägt diese `updateMatrixWorld` als eigene Eigenschaft: der Szenen-Gang (three r184
// steigt sonst in jedes Kind, auch unter `matrixWorldAutoUpdate = false`) übergeht sein Skelett. Leser ziehen über
// `_leibMatrix` nach, das Erwachen (`_kreaturErwacht`) nimmt sie wieder ab.
AnazhRealm._ruhendeWurzel = function ruhendeWurzel() {};
// Das Fell-Bildschirm-Gesetz: mittlere Strähnen-Breite in Vorlagen-Einheiten (der Bäcker legt 2·t·1.8 an der
// Wurzel, 2·t·0.65 an der Spitze, t ≈ 0.006–0.008; die Welt skaliert mit dem Guss-Faktor f ≈ 0,1) · Mindest-Breite
// in Pixeln · Hysterese-Band. pxMin GEMESSEN (Fell-Linse diag-fell-blick, git-Archiv, 720p, fov 75°): die Strähnen ändern
// 23 592 px bei 1,5 m · 8 421 bei 3 m · 1 808 bei 6 m · 0 ab 10 m — viele Strähnen unter einem Pixel wirken als
// Dichte, bis ~0,1 px je Strähne (≈ 8 m bei 720p, ≈ 12 m bei 1080p).
AnazhRealm.FELL_BILDSCHIRM = Object.freeze({ breiteM: 0.018, pxMin: 0.1, hyst: 0.1 });
// DIE TOD-LAGE (`_todHebeTafel`): der Kipp-Winkel des sterbenden Körpers (~83° — gekippt, nicht vergraben), die Zahl der
// Winkel-Abschnitte der Hebe-Tafel (der Kipp-Takt liest sie linear) und die höchste Zahl der Haut-Punkte je Tod.
AnazhRealm.TOD_KIPP_RAD = 1.45;
