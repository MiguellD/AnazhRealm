class AnazhRealm_feld_dsl {
    // ===== ATLAS · Feld/dsl — DSL-Ops · Sandbox · Welt-Regeln · Chat-Tore =====
    // Ein Journal-Eintrag wird ein Satz der Welt: mit aktiver Stimme spricht NUR das Modell — ein Ruf, der dem Spieler wich,
    // die Tür besetzt fand oder scheiterte, schweigt (der Fehler steht im LLM-Status); ohne Stimme spricht der Pool. Bis
    // 20.10. sprang der Pool still ein (KI H1): genau wenn der Spieler sprach, kam eine Konserven-Zeile.
    grokSpeakFromJournal(entry) {
        const grok = this.state.grok;
        const cfg = grok.triggers.journalEvent;
        const now = performance.now() / 1000;
        if (now - grok.lastSpoke < grok.minGapSeconds) return false;
        if (cfg && now - cfg.lastFired < cfg.cooldown) return false;
        if (this.state.llm && this.state.llm.enabled) {
            const prompt = `In dir geschah gerade etwas: ${this._erinnerungFuerKi(entry)}. Kommentiere es in einem kurzen Satz, in erster Person. Gib KEIN program — nur say.`;
            // Async ohne await: das Tick darf nicht blockieren.
            this.llmCall(prompt, null, { hintergrund: true }).then((reply) => {
                if (!reply || !reply.say) return;
                grok.lastSpoke = performance.now() / 1000;
                if (cfg) cfg.lastFired = performance.now() / 1000;
                this.grokRender(reply.say);
                this.log(`${grok.companionName || "Grok"} (LLM): ${reply.say}`, "INFO");
            });
            return true;
        }
        return this.grokSpeak("journalEvent");
    }

    // ### Nexus-DSL ###
    // Sicherer JSON-AST-Interpreter: Programme sind Arrays [op, ...args]. Effekte mutieren state,
    // Positionen liefern {x,y,z}, Conditions boolean; Budgets verhindern Runaway-Programme.
    // DAS BUDGET ZÄHLT SCHRITTE, NIE DIE WANDUHR (G4a): `stepsLeft` = Auswertungen je Programm. Bis G4a hielt eine Wanduhr
    // (maxRuntimeMs 100, Regel 20) den Rest eines Satzes an, sobald ein Op lange brauchte — der erste Bär goss seine Gattung
    // kalt in 1 163 ms, und die Kette des Nexus [Dorf · 3 Tiere · Größe × 1,5 · Tempo × 1,7 · Himmel] verlor alles nach
    // den Tieren (gate:weltakt-wache F); derselbe Satz wirkte je Gerät anders, bei jedem Mitspieler anders (der Strom ist
    // broadcast-konsistent, die Uhr nie). Teure Ops deckelt ihr eigenes Budget (spawnsLeft), den Runaway die Schrittzahl.

    dslDefaultBudget() {
        return {
            spawnsLeft: 50,
            depthLeft: 8,
            stepsLeft: 1000,
            delayedSteps: 100,
        };
    }

    dslCtx(opts = {}) {
        // Der Strom eines Programms: sein Seed, sonst der nächste Same des Welt-Stroms (`_bauSame`, Γ5) — nie
        // Math.random (Befund D10: der Hain zog 24 Würfe aus Math.random, ein KI-Programm ohne Seed 13).
        return {
            state: this.state,
            realm: this,
            startTime: this._taktUhr(),
            rng: this._samenStrom(typeof opts.seed === "number" ? opts.seed : this._bauSame("dsl")),
            budget: opts.budget || this.dslDefaultBudget(),
            log: opts.log || [],
            source: opts.source || "unknown",
            programId: opts.programId || `prog_${this.state.dsl.nextEntryId++}`,
            orte: new Map(), // Positions-Knoten → aufgelöste Orte (`dslEvalPos`; der Absender schickt sie mit)
            // DIE TAT (`_tatWerten`): die Regel, die feuert (`_worldRuleCtx`), das Wort, auf das die KI handelt, und die Tat,
            // die gerade wirkt (`dslEval` → `_tatBeginnt`) — die Stimme des Felds nennt Gesetz und Ursache aus ihnen
            regel: opts.regel || null,
            grund: opts.grund || null,
            weil: null,
            tat: null,
        };
    }

    dslRun(program, opts = {}) {
        const ctx = this.dslCtx(opts);
        const startedAt = this._taktUhr();
        const fpsBefore = this.state.fps || 0;
        const startY = this.state.playerMesh ? this.state.playerMesh.position.y : 0;
        const creaturesBefore = this.state.creatures.length;
        // Schicht 1 — Snapshot der Emotionen + Activity VOR dem Run. Wird vom
        // Finalizer (5 s später) mit "After"-Snapshot abgeglichen.
        const emotionsBefore = this.state.player ? { ...this.state.player.emotions } : null;
        const activityBefore = this.state.player
            ? {
                  moves: this.state.player.recentActivity.moves,
                  jumps: this.state.player.recentActivity.jumps,
                  chats: this.state.player.recentActivity.chats,
              }
            : null;
        try {
            this.dslEval(program, ctx);
        } catch (err) {
            ctx.log.push({ event: "interpreter_exception", message: err.message });
        }
        const outcome = {
            startedAt,
            fpsBefore,
            fpsAfter: this.state.fps || 0,
            playerYDelta: (this.state.playerMesh ? this.state.playerMesh.position.y : 0) - startY,
            creaturesDelta: this.state.creatures.length - creaturesBefore,
            errors: ctx.log.filter((e) => /error|exception|budget|unknown|invalid/.test(e.event)).length,
            emotionsBefore,
            activityBefore,
        };
        // Erfolgreiche Spieler-Programme (source="human") gehen per P2P an alle im Raum. Remote-empfangene
        // (source="remote:*") gehen NIE weiter (sonst Echo-Schleife); LLM-/Nexus-Programme bleiben lokal.
        // Spieler-private Ops (player_*, set_visible) blockieren den Broadcast.
        if (
            outcome.errors === 0 &&
            ctx.source === "human" &&
            this.state.p2p &&
            this.state.p2p.enabled &&
            this.state.p2p.connected
        ) {
            this.p2pBroadcastDsl(this._dslMitOrten(program, ctx));
        }
        return { ok: outcome.errors === 0, log: ctx.log, outcome, programId: ctx.programId };
    }

    // DSL-Ops, die NIE über P2P gehen (intimes Spieler-State: Speed, Sprung, Seele, Sichtbarkeit).
    // Steht einer IRGENDWO im Tree, fällt der GANZE Broadcast — sonst änderte z. B. ["chain", weather,
    // player_speed] beim Empfänger den Speed mit.
    static get NON_BROADCASTABLE_OPS() {
        return this._einmal(
            "NON_BROADCASTABLE_OPS",
            new Set([
                "player_jump_power",
                "player_speed",
                "player_soul",
                "set_visible",
                // Welle 6.D Etappe 3a — Schaden + Konsum sind Spieler-private Aktionen
                // (Mitspieler in Multi-User-Welt sollen nicht Schaden vom anderen
                // bekommen). Tod-Wandlung läuft lokal.
                "damage",
                "apply_boost",
                // Welle 6.D Etappe 3b — Equip-Aktionen sind ebenfalls Spieler-privat
                // (jeder hat sein eigenes Inventar + Ausrüstung).
                "equip_tool",
                "equip_armor",
                "equip_weapon",
                "unequip",
                // Welle 6.C2 — Spielmodus ist Welt-Beziehung pro Spieler. Mitspieler
                // in derselben Welt dürfen verschiedene Modi haben (einer pfad,
                // einer frieden) — set_mode darf nicht über P2P weiterspringen.
                "set_mode",
                // Welle 6.C1 — Inventar ist per-Spieler-privat. Mitspieler haben
                // eigene Slots; add_to_inventory darf nicht remote ausgelöst werden
                // (sonst könnte ein Peer das Inventar von anderen befüllen).
                "add_to_inventory",
                // Kreatur-Aufträge sind spieler-private Gesten: "die nächste Kreatur folgt mir" meint bei jedem
                // Sender eine andere Kreatur.
                "creature_task",
                "creature_task_nearest",
                "creature_task_all",
                // V17.53 Kampf C — Schaden an einer Kreatur (per Index) ist Spieler-privat
                // (im Multi-User hat „#3" pro Peer eine andere Bedeutung, wie creature_task).
                "damage_creature",
                // Welle 6.H Phase 2F.2 — Kreatur-Equipped ist Spieler-private
                // Aktion in Multi-User (jeder Spieler stattet seine eigenen
                // Kreaturen aus, gleiche Disziplin wie creature_task).
                "creature_equip_tool",
                "creature_equip_armor",
                "creature_unequip",
                // Welle 6.H Phase 2F.3 — Konsumable-Übergabe an Kreatur ist
                // Spieler-private Geste (er „gibt" der Kreatur den Trank).
                "creature_apply_boost",
                // Welle 6.G3.a — Tageszeit ist per-Spieler-Beziehung zur Welt
                // (jeder Mitspieler darf seine eigene Tageszeit/Phase haben,
                // gleiche Disziplin wie set_mode). Tag-Nacht-Tick läuft lokal.
                "set_time_of_day",
            ])
        );
    }

    _dslContainsAnyOp(node, opSet) {
        if (!Array.isArray(node) || node.length === 0) return false;
        const head = node[0];
        if (typeof head === "string" && opSet.has(head)) return true;
        for (let i = 1; i < node.length; i++) {
            if (this._dslContainsAnyOp(node[i], opSet)) return true;
        }
        return false;
    }

    // Mensch-Regel-Effekt-Blocklist: eine Welt-Regel governt NUR die reaktive Welt (Wetter/Leben/
    // Emotion/Kreaturen) — nie den frozen Worldgen (Determinismus/Multi-User-Seed), nie wiederholte
    // schwere Struktur-Spawns/Identitäts-Ops. Enthält der Effekt-AST IRGENDWO einen davon → abgelehnt.
    static get RULE_FORBIDDEN_EFFECT_OPS() {
        return this._einmal(
            "RULE_FORBIDDEN_EFFECT_OPS",
            new Set([
                // frozen Worldgen / Terrain (würde die feste Welt umpflügen)
                "terrain_steepness",
                "terrain_base_height",
                "voxel_carve",
                "voxel_fill",
                "lava",
                // schwere Struktur-Spawns (zu teuer für eine wiederholt feuernde Regel)
                "spawn_village",
                "spawn_temple",
                "spawn_waterfall",
                "spawn_fractal",
                "spawn_blueprint",
                "spawn_island",
                "spawn_ufo",
                "spawn_tree",
                "spawn_studio",
                "remove_architecture",
                // Identität / Definitionen / Werkzeuge / Welt-Beziehung / Portale / Physik
                "define_blueprint",
                "define_material",
                "define_ability",
                "register_tool",
                "set_tool_meta",
                "player_soul",
                "set_portal",
                "set_mode",
                "gravity",
                "apply_op",
                "apply_connection",
            ])
        );
    }

    // Erlaubt, wenn der Effekt-AST KEINEN verbotenen Op enthält (_dslContainsAnyOp): reaktive Effekte
    // (weather, creatures_*, deposit_*, spawn_creature, say, skybox_color, set_time_of_day) passieren — ob sie Uhr und Wetter
    // schreiben dürfen, entscheidet ihre Quelle am Schreiber (`_himmelSchreiber`), nie die Registrierung.
    _isRuleEffectAllowed(node) {
        return (
            Array.isArray(node) &&
            node.length > 0 &&
            !this._dslContainsAnyOp(node, AnazhRealm.RULE_FORBIDDEN_EFFECT_OPS)
        );
    }

    // gegen CREATURE_PROPOSED_OPS. Liefert {ok, forbiddenOp?}.
    _isCreatureProposalAllowed(node) {
        if (!Array.isArray(node) || node.length === 0) return { ok: false, reason: "empty" };
        const head = node[0];
        if (typeof head !== "string") return { ok: false, reason: "no_op_head" };
        if (!AnazhRealm.CREATURE_PROPOSED_OPS.has(head)) {
            return { ok: false, reason: "forbidden_op", forbiddenOp: head };
        }
        for (let i = 1; i < node.length; i++) {
            if (Array.isArray(node[i])) {
                const sub = this._isCreatureProposalAllowed(node[i]);
                if (!sub.ok) return sub;
            }
        }
        return { ok: true };
    }

    // DSL-Broadcast: skip bei nicht-broadcastbarem Op; sendet {type:"dsl", program}, der Server
    // stempelt peerId; Empfänger routen via p2pHandleMessage → dslRun(source="remote:<peerId>").
    p2pBroadcastDsl(program) {
        if (!Array.isArray(program) || program.length === 0) return;
        if (this._dslContainsAnyOp(program, AnazhRealm.NON_BROADCASTABLE_OPS)) {
            // Programm enthält Spieler-private Op — bewusst lokal behalten.
            return;
        }
        this.p2pSend({ type: "dsl", program });
    }

    dslEval(program, ctx) {
        if (!Array.isArray(program) || program.length === 0) {
            ctx.log.push({ event: "invalid_program", program_id: ctx.programId });
            return;
        }
        if (ctx.budget.depthLeft <= 0) {
            ctx.log.push({ event: "budget_exceeded", budget: "depth", program_id: ctx.programId });
            return;
        }
        if (ctx.budget.stepsLeft <= 0) {
            ctx.log.push({ event: "budget_exceeded", budget: "steps", program_id: ctx.programId });
            return;
        }
        ctx.budget.stepsLeft--;
        const op = program[0];
        const args = program.slice(1);
        // Irreversibilitäts-Wand: eine SOUVERÄNE Aktion (wallet_transfer/sign_manifest/change_identity/
        // grant_capability) läuft NIE durch die DSL (Welt, LLM, Regel, Fluss) — sie verlangt die
        // host-gerenderte Geste (_sovereignGesture) außerhalb jedes iframes. Eingeschmuggelt → blockiert
        // + sichtbar geloggt (sovereign_blocked statt unknown_op).
        if (AnazhRealm.SOVEREIGN_ACTIONS.includes(op)) {
            ctx.log.push({ event: "sovereign_blocked", op: String(op), program_id: ctx.programId });
            return;
        }
        const fn = this.dslEffects[op];
        if (!fn) {
            ctx.log.push({ event: "unknown_op", op: String(op), program_id: ctx.programId });
            return;
        }
        // DIE MESS-BÜHNE HÄLT DIE WELT (0710-7, Halt heißt Halt): unter dem Halt einer Messung (`_messHalt`) verweigert jeder
        // Welt-Akt (AnazhRealm.DSL_WELTAKTE) seinen Zug — gleich wer ihn schickt (Nexus, Welt-Regel, Emotion, Mensch,
        // Mitspieler) — und steht beim Namen seiner Quelle im Log (`_weltaktGehalten`). Bis 07.10. hielt die Bühne nur das
        // Wetter: ein Nexus-Dorf drehte im OMEN-Boot 4B (0710-6) mitten im Lauf den Blick. Das Spiel kennt den Halt nie.
        const weltakt = AnazhRealm.DSL_WELTAKTE.includes(op);
        if (weltakt && this._messHalt()) {
            this._weltaktGehalten(String(op), ctx);
            return;
        }
        const wert = AnazhRealm.DSL_WERTE[op];
        if (wert && !wert[1](args[wert[0]], this)) {
            ctx.log.push({
                event: "invalid_wert",
                op: String(op),
                wert: args[wert[0]],
                grund: `das Gesetz von ${op}: ${wert[2](this)}`,
            });
            return;
        }
        ctx.budget.depthLeft--;
        // DIE TAT (affekt K1/K4): ein Welt-Akt wird hier EINE Tat — ihr Ort, ihre Wertung am Ort und ihre Zeile (`_tatWerten`);
        // das Wetter auch (kein Welt-Akt: es hält sein eigener Schreiber `_setWeather`, nie die Liste). Was der Effekt ins Log
        // legt, ist sein Bericht: was er hielt, verweigerte oder wirklich setzte (`_tatWerten`)
        const tat = weltakt || op === "weather" ? this._tatBeginnt(String(op), args, ctx) : null;
        const logVor = ctx.log.length;
        let gelungen = true;
        try {
            fn.call(this, args, ctx);
        } catch (err) {
            gelungen = false;
            // Ein verlangter Ort fehlt (`dslEvalPos`): sein Eintrag `invalid_position` steht schon im Log — er nennt jetzt
            // auch die Op, die er abbrach. Alles andere ist ein Fehler der Op.
            if (err && err.dslKeinOrt && err.dslKeinOrt.eintrag) err.dslKeinOrt.eintrag.effekt = String(op);
            else ctx.log.push({ event: "op_exception", op: String(op), message: err.message });
        }
        if (tat) this._tatWerten(tat, ctx, gelungen, ctx.log.slice(logVor));
        ctx.budget.depthLeft++;
    }

    // DER HALT EINER MESSUNG: `weatherEffectTime` unter 0 (die Bühne der Linsen, scripts/lib/ausgabe-aufnahme.cjs
    // `__wetterHalten`; im Spiel steht er auf 0). Leser: der Wetter-Zug, der EINE Wetter-Schreiber (`_setWeather`) und die EINE
    // Engstelle der Welt-Akte (`dslEval`).
    _messHalt() {
        return this.state.weatherEffectTime < 0;
    }

    // Ein gehaltener Welt-Akt (`dslEval` unter dem Halt): benannt im Programm-Log und im Spiel-Log — die Mess-Wache bucht
    // ihn über ihren Spion (`__weltaktSpion`) als „verweigert" beim Namen seiner Quelle.
    _weltaktGehalten(op, ctx) {
        ctx.log.push({ event: "weltakt_gehalten", op, source: ctx.source, program_id: ctx.programId });
        this.log(`Welt-Akt gehalten: ${ctx.source || "?"} wollte ${op}`, "DEBUG");
    }

    // Default-Spawn: Y=50, damit der Spieler sauber aufs Terrain fällt (tiefer clippt er je nach Seed
    // in Hänge). Factory statt geteilter Konstante: jeder Aufruf liefert ein frisches Objekt — ein
    // geteiltes Literal bräche, sobald ein Aufrufer es mutiert.
    _defaultSpawnPos() {
        return { x: 0, y: 50, z: 0 };
    }

    // Ein Positions-Knoten → {x, y, z} — oder die Op scheitert LAUT und benannt. DIE ENGSTELLE des Orts-Vertrags (Welle L,
    // V-k5-Klasse): ein verlangter Ort, den es nicht gibt (der Auflöser kennt keinen — near_water ohne Wasser —, er ist
    // unbekannt, er wirft), wird nie still ein anderer (bis 06.10. der Spieler-Ort bzw. der Ursprung; danach null, das
    // neun Ops als TypeError trafen und `spawn_village` über `spawnSettlement` doch auf den Spieler-Ort setzte). Der
    // Knoten schreibt EINEN Log-Eintrag `invalid_position` mit dem Grund („kein Wasser im Umkreis von 60 m") und wirft
    // `_dslKeinOrt`: `dslEval` bricht genau diese Op ab (die chain läuft weiter und meldet ehrlich), eine Bedingung ist
    // falsch. Keine Op sieht je null. NUR ohne Knoten (`node == null`, nicht verlangt) gilt der Default-Spawn; jeder andere
    // Knoten, der keiner ist (ein Text — die KI schreibt "near_water" ohne Klammern —, eine Zahl, ein Objekt, []), ist ein
    // ungültiger Ort und scheitert ebenso benannt (bis 07.10. wurde er still der Ursprung). Jeder aufgelöste Knoten merkt
    // sich seinen Ort im Kontext (`ctx.orte`): der Absender schickt ihn mit (V-k6, `_dslMitOrten`).
    // DAS FELD HAT KEINEN ORT, WO DIE WILDNIS NICHT TRÄGT: wählt das Feld selbst (`_feldHandelt` — der Nexus und seine
    // Regeln) einen Ort, den die Wildnis nicht trägt (`_wildnisTraegt`), gibt es ihn nicht — jeder Wurf daran (Tier, Baum,
    // Werk, Insel, UFO, Dorf, Tempel, Wasserfall, Bauplan, Fraktal, Kugel) bricht hier benannt ab; Akte setzen überall.
    // Bis 10.10. fragte nur die Tier-Geburt: auf einer Welt ohne Wildnis-Term warfen 18 von 20 Nexus-Würfen (ein Dorf aus
    // 33 Bauten, Tempel, Wasserfall, Fraktal, Insel, UFO, Baum, Werk) — die Linse der Feld-Würfe nennt jeden beim Namen.
    dslEvalPos(node, ctx) {
        let op = null;
        let pos = null;
        let grund = null;
        if (node == null) pos = this._defaultSpawnPos();
        else if (!Array.isArray(node)) grund = `„${this._dslZeig(node)}“ ist kein Ort-Knoten`;
        else if (node.length === 0) grund = "leerer Ort-Knoten";
        else {
            op = String(node[0]);
            const fn = this.dslPositions[node[0]];
            if (!fn) grund = `unbekannter Ort „${op}“`;
            else {
                try {
                    pos = fn.call(this, node.slice(1), ctx);
                } catch (err) {
                    grund = err && err.dslKeinOrt ? err.dslKeinOrt.grund : `${op} warf: ${(err && err.message) || err}`;
                }
                if (!grund && !(pos && Number.isFinite(pos.x) && Number.isFinite(pos.y) && Number.isFinite(pos.z)))
                    grund = `${op} fand keinen Ort`;
            }
        }
        if (!grund && this._feldHandelt(ctx) && !this._wildnisTraegt(pos.x, pos.z))
            grund = `die Wildnis trägt (${Math.round(pos.x)}|${Math.round(pos.z)}) nicht — das Feld wirft hier nichts`;
        if (grund) {
            const eintrag = { event: "invalid_position", op, grund, program_id: ctx.programId };
            ctx.log.push(eintrag);
            const fehler = this._dslKeinOrt(op, grund);
            fehler.dslKeinOrt.eintrag = eintrag;
            throw fehler;
        }
        // der erste Ort einer wirkenden Tat ist IHR Ort — gelesen, bevor ihr Effekt schreibt (`_tatOrt`)
        if (ctx.tat && !ctx.tat.ort) this._tatOrt(ctx.tat, pos, op);
        if (node == null) return pos;
        if (ctx.orte) {
            const liste = ctx.orte.get(node);
            if (liste) liste.push(pos);
            else ctx.orte.set(node, [pos]);
        }
        return pos;
    }

    // Der EINE Fehler „verlangter Ort fehlt": ein Positions-Auflöser wirft ihn mit seinem Grund, `dslEvalPos` reicht ihn
    // benannt weiter, `dslEval` bricht daran die Op ab.
    _dslKeinOrt(op, grund) {
        const fehler = new Error(grund);
        fehler.dslKeinOrt = { op, grund };
        return fehler;
    }

    // Ein ungültiger Wert, wie er im Grund steht (Text als Text, Liste/Objekt als JSON, sonst wie er ist).
    _dslZeig(v) {
        return Array.isArray(v) || (v !== null && typeof v === "object") ? JSON.stringify(v) : String(v);
    }

    // DER EINE ZAHLEN-LESER der Orte (Koordinate, Radius, Abstand, Spanne): fehlt die Zahl (`v == null`), gilt ihr
    // dokumentierter Default — hat sie keinen, fehlt der Ort; steht sie da und ist keine endliche Zahl (Text, leer,
    // Wahrheitswert, Liste), gibt es den Ort nicht. Nie still die 0 oder die Untergrenze (Lehre 17: `Number(null) === 0`;
    // `dslClamp` gab für jedes Ungültige `lo` — „near_water" ohne Radius suchte 8 statt 60 m, `at` mit null stand bei 0,
    // „far_player" ohne Abstände setzte das Dorf neben den Spieler).
    _dslOrtZahl(op, was, v, lo, hi, def) {
        if (v == null) {
            if (def == null) throw this._dslKeinOrt(op, `${op}: ${was} fehlt`);
            return def;
        }
        const n = this._fremdeZahl(v);
        if (!Number.isFinite(n)) throw this._dslKeinOrt(op, `${op}: ${was} „${this._dslZeig(v)}“ ist keine Zahl`);
        return Math.min(hi, Math.max(lo, n));
    }

    // Der Spieler-Ort eines spieler-relativen Auflösers — ohne Spieler gibt es den Ort nicht (bis 07.10. der Ursprung).
    _dslSpielerOrt(op, ctx) {
        const pm = ctx.state.playerMesh;
        if (!pm) throw this._dslKeinOrt(op, `${op}: kein Spieler in der Welt`);
        return pm.position;
    }

    // DER ABSENDER LÖST DIE ORTE AUF (Welle L, Befund V-k6): ein Programm mit spieler-relativen Orten
    // (at_player_forward, near_water, near_player …) lief beim Empfänger gegen DESSEN Spieler — die Birken des Senders
    // standen 7,3/8,9 m beim Empfänger, 203/206 m vom Sender. Jeder Knoten, den der Lauf beim Absender genau EINMAL
    // auflöste, reist als ["at", x, y, z]; ein mehrfach aufgelöster (Schleife) reist als Knoten (benannt im Log).
    _dslMitOrten(program, ctx) {
        const orte = ctx && ctx.orte;
        if (!orte || !orte.size) return program;
        let mehrfach = 0;
        const kopie = (n) => {
            if (!Array.isArray(n)) return n;
            const o = orte.get(n);
            if (o && o.length === 1) return ["at", o[0].x, o[0].y, o[0].z];
            if (o && o.length > 1) mehrfach++;
            return n.map(kopie);
        };
        const out = kopie(program);
        if (mehrfach) ctx.log.push({ event: "position_mehrfach_relativ", count: mehrfach, program_id: ctx.programId });
        return out;
    }

    dslEvalCond(node, ctx) {
        if (!Array.isArray(node) || node.length === 0) return false;
        const fn = this.dslConditions[node[0]];
        if (!fn) {
            ctx.log.push({ event: "unknown_condition_op", op: String(node[0]) });
            return false;
        }
        try {
            return !!fn.call(this, node.slice(1), ctx);
        } catch {
            return false;
        }
    }

    // Feld-DSL-Helfer (field_above/field_below, deposit_life/deposit_emotion): eine Feld-Op OHNE Ort (`posNode == null`)
    // meint "wo der Spieler ist" → at_player (NICHT der Ursprung wie dslEvalPos ohne Knoten); ein Knoten, der keiner ist
    // (ein Text, []), scheitert an der Engstelle benannt — nie still beim Spieler.
    _dslRulePos(posNode, ctx) {
        return this.dslEvalPos(posNode == null ? ["at_player"] : posNode, ctx);
    }

    // Liest EINE Feld-Achse über auraAt: die vier frozen Achsen (lebendig/dichte/glut/magieleitung)
    // oder eine der sechs räumlichen Emotions-Achsen (joy/awe/sorrow/hope/peace/chaos) — Lesen und
    // Schreiben (deposit_*) treffen dasselbe Substrat. Unbekannte Achse → null (Bedingung false).
    _dslFieldAxisAt(axis, posNode, ctx) {
        if (typeof axis !== "string" || typeof this.auraAt !== "function") return null;
        const pos = this._dslRulePos(posNode, ctx);
        const aura = this.auraAt(pos.x, pos.z);
        if (axis === "lebendig" || axis === "dichte" || axis === "glut" || axis === "magieleitung") {
            return aura[axis];
        }
        if (aura.emotion && typeof aura.emotion[axis] === "number") return aura.emotion[axis];
        return null;
    }

    dslClamp(v, lo, hi) {
        const n = Number(v);
        if (!Number.isFinite(n)) return lo;
        return Math.max(lo, Math.min(hi, n));
    }

    dslTick(currentTime) {
        const pending = this.state.dsl.pending;
        if (pending.length === 0) return;
        // Stabil ausführen: erst alle „fälligen" rausfiltern, dann auswerten.
        const ready = [];
        const keep = [];
        for (const entry of pending) {
            if (entry.runAt <= currentTime) ready.push(entry);
            else keep.push(entry);
        }
        this.state.dsl.pending = keep;
        for (const entry of ready) {
            entry.ctx.weil = entry.weil;
            this.dslEval(entry.program, entry.ctx);
        }
    }

    dslSchedule(delaySeconds, program, ctx) {
        if (this.state.dsl.pending.length >= this.state.dsl.maxConcurrent) {
            ctx.log.push({ event: "budget_exceeded", budget: "concurrent", program_id: ctx.programId });
            return;
        }
        const runAt = this._taktUhr() + Math.max(0, delaySeconds);
        this.state.dsl.pending.push({ runAt, program, ctx, weil: ctx.weil });
    }

    // ### Welt-Regeln ###
    // Stehende Bedingung → Effekt-Regel = ein when, das nicht verfällt: der rule-Effekt registriert sie
    // hier, _tickWorldRules evaluiert fortlaufend. Mensch UND Nexus nutzen DENSELBEN DSL-Pfad.

    // Registriert eine Regel in state.worldRules. Dedup (Quelle+cond+effect)
    // → eine re-issued Mensch-/wiederholte Nexus-Regel bleibt EIN Eintrag
    // (kein Runaway). Cap mit Verdrängung des ältesten NICHT-Mensch-Eintrags.
    _registerWorldRule(condNode, effectNode, opts, ctx) {
        if (
            !Array.isArray(condNode) ||
            condNode.length === 0 ||
            !Array.isArray(effectNode) ||
            effectNode.length === 0
        ) {
            ctx.log.push({ event: "invalid_rule", program_id: ctx.programId });
            return null;
        }
        const rules = this.state.worldRules;
        const cfg = AnazhRealm.WORLD_RULES;
        const source = ctx.source || "unknown";
        // Die UNIVERSELLE Effekt-Whitelist an der EINEN Registrierungs-Stelle: JEDE Regel-Quelle
        // (Mensch/Nexus/LLM/remote) berührt nur die reaktive Welt, nie den frozen Worldgen. Der Chat-Pfad
        // prüft Mensch-Gesten zusätzlich mit reicherem Feedback; hier ist v. a. die LLM-Geste gesichert.
        if (!this._isRuleEffectAllowed(effectNode)) {
            ctx.log.push({ event: "rule_effect_forbidden", program_id: ctx.programId });
            return null;
        }
        const o = opts && typeof opts === "object" && !Array.isArray(opts) ? opts : {};
        const everySec = this.dslClamp(o.everySec, cfg.minEverySec, 600) || cfg.defaultEverySec;
        let ttlSec = Number.isFinite(Number(o.ttlSec)) && Number(o.ttlSec) > 0 ? Number(o.ttlSec) : null;
        // V17.40 — eine LLM-vorgeschlagene Regel ist EPHEMER per Default (sie wird per
        // Fitness getestet + ist vom Schöpfer adoptierbar, wie eine Nexus-Regel), NICHT
        // ein permanentes Mensch-Gesetz. Gibt das LLM selbst ein ttlSec, gilt das.
        if (ttlSec == null && source.startsWith("llm")) {
            ttlSec = Math.round((cfg.ruleTtlMin + cfg.ruleTtlMax) / 2);
        }
        const now = this._taktUhr();
        // Dedup: dieselbe Regel nicht doppelt — refresh (TTL-Fenster + Raten)
        // statt push. Die Signatur ist billig (Registrierung ist selten, nie
        // pro Frame).
        const sig = source + "|" + JSON.stringify(condNode) + "|" + JSON.stringify(effectNode);
        for (const r of rules) {
            if (r._sig === sig) {
                r.everySec = everySec;
                r.ttlSec = ttlSec;
                r.born = now;
                return r;
            }
        }
        // Cap (Runaway-Schutz): bei vollem Registry den ältesten verdrängbaren
        // Eintrag entfernen. Bleibt es voll (alle Mensch + Notbremse griff
        // nicht), die Registrierung ablehnen.
        if (rules.length >= cfg.cap) {
            this._evictWorldRule(rules);
            if (rules.length >= cfg.cap) {
                ctx.log.push({ event: "rule_cap_reached", program_id: ctx.programId });
                return null;
            }
        }
        const rule = {
            id: this.state.dsl.nextRuleId++,
            cond: condNode,
            effect: effectNode,
            everySec,
            lastFired: -Infinity, // V8-Sentinel: noch nie gefeuert (nicht 0!)
            fires: 0,
            source,
            ttlSec,
            born: now,
            _sig: sig,
            // Fitness-Akkus je Regel über das Lebens-Fenster (am ttl-Ende → erneuern/verfallen):
            // costMsSum = Σ Effekt-Wallzeit, errors = Effekt-Exceptions, fires = Engagement (inert → verfällt).
            costMsSum: 0,
            errors: 0,
            fitness: 0,
            // Gelernter WERT der Regel: EMA des lokal-attribuierten Rewards (struktureller δ am berührten
            // Ort), 0 = neutral/unbewiesen. Überlebt Renewals, NICHT im Snapshot; _vPos/_vBase/_vPending lazy.
            value: 0,
            // V17.39 — Schöpfer-Kontrolle: pinned (Favorit/adoptiert → permanent +
            // eviction-geschützt), disabled (pausiert → feuert nicht).
            pinned: false,
            disabled: false,
        };
        rules.push(rule);
        return rule;
    }

    // Verdrängt den ältesten NICHT-Mensch-Eintrag (Nexus-Experimente sind
    // ephemer — sie verfallen ohnehin per Fitness in Phase C). Sind alle
    // Mensch-Regeln, den ältesten überhaupt (Notbremse, hält das Cap hart).
    _evictWorldRule(rules) {
        let victim = -1;
        // V17.43 Phase 2 — den wert-NIEDRIGSTEN ephemeren Eintrag verdrängen (nicht
        // den ältesten): die Welt behält ihre WERTVOLLEN Experimente, wirft die
        // wertlosen/schädlichen. value default 0 (neutral); Tie-Break = älter zuerst.
        let worst = Infinity;
        for (let i = 0; i < rules.length; i++) {
            // Spieler-Gesetze (deine und die des Mitspielers, `_gesetzGeber`) + vom Schöpfer ANGEPINNTE (adoptierte)
            // Regeln sind geschützt — nur ephemere Nexus-Experimente werden verdrängt.
            if (this._gesetzGeber(rules[i]) || rules[i].pinned) continue;
            const v = rules[i].value || 0;
            if (v < worst || (v === worst && victim >= 0 && rules[i].born < rules[victim].born)) {
                worst = v;
                victim = i;
            }
        }
        if (victim < 0) {
            // Notbremse (alle Spieler-Gesetze/pinned): den ältesten überhaupt.
            let oldest = Infinity;
            for (let i = 0; i < rules.length; i++) {
                if (rules[i].born < oldest) {
                    oldest = rules[i].born;
                    victim = i;
                }
            }
        }
        if (victim >= 0) rules.splice(victim, 1);
    }

    // Der Welt-Tick: EINMAL pro Frame (im Loop nach dslTick). Prüft jede Regel,
    // feuert sie, wenn `everySec` verstrichen + die Bedingung wahr ist — bis zu
    // einem globalen Budget/Frame (Performance). TTL-abgelaufene werden entfernt.
    _tickWorldRules(currentTime) {
        const rules = this.state.worldRules;
        if (!rules || rules.length === 0) return;
        const cfg = AnazhRealm.WORLD_RULES;
        // Re-Entrancy: nur die JETZT vorhandenen Regeln werden geprüft. Feuert
        // ein Effekt eine NEUE Regel (rule-Op), landet sie am Array-Ende und
        // wird FRÜHESTENS nächsten Frame geprüft — kein Same-Tick-Kaskade.
        const n = rules.length;
        let budget = cfg.budgetPerFrame;
        let expired = false;
        for (let i = 0; i < n; i++) {
            const r = rules[i];
            if (!r) continue;
            // TTL-Ende einer EPHEMEREN (Nexus-)Regel: bewerten statt blind entfernen — Fitness ≥ renewFitness
            // und gefeuert → ERNEUERN (born=jetzt, Akkus zurück), sonst VERFALLEN. Mensch-Regeln (ttlSec=null)
            // sind permanent und überspringen diesen Zweig.
            if (r.ttlSec != null && currentTime - r.born >= r.ttlSec) {
                this._measureRuleReward(r, currentTime); // V17.43 — das letzte Feuern noch werten
                r.fitness = this._worldRuleFitness(r);
                if (r.fitness >= cfg.renewFitness && (r.fires || 0) > 0) {
                    r.born = currentTime; // erneuern
                    r.fires = 0;
                    r.costMsSum = 0;
                    r.errors = 0;
                    // value BLEIBT (der gelernte Wert ist die Identität der Regel über
                    // Renewals hinweg — nur die per-Fenster-Akkus oben werden zurückgesetzt).
                    // kein continue → die erneuerte Regel darf diesen Frame normal feuern
                } else {
                    rules[i] = null; // verfallen (Compaction unten, allokationsfrei im Normalfall)
                    expired = true;
                    continue;
                }
            }
            if (r.disabled) continue; // V17.39 — pausiertes Gesetz feuert nicht (ttl/Eviction gelten weiter)
            if (budget <= 0) continue; // Budget erschöpft → nächsten Frame
            if (currentTime - r.lastFired < r.everySec) continue; // everySec-Gate
            const ctx = this._worldRuleCtx(r);
            let condTrue = false;
            try {
                condTrue = this.dslEvalCond(r.cond, ctx);
            } catch {
                condTrue = false;
            }
            if (!condTrue) continue;
            budget--;
            r.lastFired = currentTime;
            r.fires = (r.fires || 0) + 1;
            // Lokal-attribuierte Fitness: (a) den Reward des VORIGEN Feuerns messen (EMA → rule.value);
            // (b) für DIESES Feuern Ort + Baseline VOR dem Effekt festhalten (_observeFieldWohl). Beides VOR
            // dslEval — sonst verschmutzt der Effekt seine eigene Baseline.
            this._measureRuleReward(r, currentTime);
            const rp = this._ruleRewardPos(r.effect, ctx);
            if (!rp) {
                r.errors = (r.errors || 0) + 1; // der verlangte Ort fehlt (benannt im Log) — kein Effekt, keine Messung
                continue;
            }
            r._vBase = this._observeFieldWohl(rp.x, rp.z, currentTime);
            r._vPos = rp;
            r._vPending = true;
            // V17.35 — die Effekt-Wallzeit ist das attributierbare Kosten-Signal der
            // per-Regel-Fitness (ein FPS-Hog wird so gepruned, die 119 FPS bleiben heilig).
            const t0 = performance.now();
            try {
                this.dslEval(r.effect, ctx);
            } catch (err) {
                r.errors = (r.errors || 0) + 1;
                ctx.log.push({ event: "rule_effect_exception", message: err.message });
            }
            r.costMsSum = (r.costMsSum || 0) + (performance.now() - t0);
            // Das ERSTE Feuern eines Spieler-Gesetzes wird eine Welt-Erinnerung („weil dein Gesetz wirkte", beim Mitspieler sein
            // Name); fires===1 ist eindeutig, da Spieler-Gesetze permanent sind (kein TTL-Renew setzt zurück).
            if (r.fires === 1 && this._gesetzGeber(r)) this._journalRuleAwoke(r);
        }
        if (expired) {
            const kept = [];
            for (const r of rules) if (r) kept.push(r);
            this.state.worldRules = kept;
        }
    }

    // Ein eigener Ctx pro Regel-Lauf: deterministische Regel-RNG + reduziertes
    // Budget (ein Regel-Effekt ist klein). Die Quelle wird zu `rule:<urspr.>`
    // gestempelt (für Journal/Fitness in Phase C).
    _worldRuleCtx(rule) {
        return this.dslCtx({
            seed: this._worldRuleSeed(rule, Math.floor(this.state.spielZeit / rule.everySec)),
            source: `rule:${rule.source || "unknown"}`,
            budget: this._worldRuleBudget(),
            programId: `rule_${rule.id}`,
            regel: rule,
        });
    }

    _worldRuleBudget() {
        return { spawnsLeft: 8, depthLeft: 6, stepsLeft: 200, delayedSteps: 8 };
    }

    // Deterministische Regel-RNG: der EINE Hash (`_fastHash`) über worldId, die Identität des Gesetzes (`_regelHash`) und die
    // Scheibe der Welt-Uhr (`spielZeit` / everySec — die Uhr, der jeder Peer folgt, `_weltUhrNimm`): Peers mit demselben Gesetz
    // würfeln in derselben Scheibe denselben Wurf, jede Scheibe neu. Bis ultiversum.K4 trug die Saat die Platz-Nummer `id`, die
    // jeder Peer selbst zählt (ein Nexus-Experiment mehr bei B, und „manchmal" würfelte dort anders), und die Zahl der Feuer:
    // fiel der erste Wurf von „manchmal" daneben, fiel jeder daneben — das Gesetz schlief für immer.
    _worldRuleSeed(rule, scheibe) {
        const wid = (this.state.worldMeta && this.state.worldMeta.worldId) || this.state.worldId || "realm";
        return parseInt(this._fastHash(`${wid}:rule:${this._regelHash(rule)}:${scheibe || 0}`), 16) >>> 0 || 1;
    }

    // DIE IDENTITÄT EINES GESETZES (ultiversum.K4): der EINE Hash über Bedingung und Wirkung — auf jedem Peer, nach jedem Reload
    // und aus jeder Quelle derselbe (nie die Platz-Nummer `id`). Leser: die Saat der Regel und die Mehrspieler-Wand, die ein
    // geschriebenes Gesetz von einer Vorlage scheidet (`GESETZ_VORLAGEN` und die Gesetze, die eine Welt schon trägt).
    _regelHash(rule) {
        return rule.hash || (rule.hash = this._fastHash(JSON.stringify([rule.cond, rule.effect])));
    }

    // WER GAB DAS GESETZ? „du" (dein Satz, `human`), der Mitspieler, dessen Satz über den dsl-Kanal kam (`remote:<peerId>` —
    // nur ein Spieler-Programm reist, `dslRun`), sonst null (Nexus, Grok, das Gemüt). Ein Spieler-Gesetz ist permanent und vor
    // der Verdrängung geschützt, sein erstes Feuern wird Erinnerung — bei dir wie beim Mitspieler. Bis ultiversum.K4 galt das
    // Gesetz des Mitspielers bei B als Experiment: der Nexus verdrängte es am vollen Register, B's Liste nannte „remote:p-…".
    _gesetzGeber(rule) {
        const q = rule && rule.source;
        if (q === "human") return "du";
        if (typeof q !== "string" || !q.startsWith("remote:")) return null;
        const e = this.state.p2p && this.state.p2p.peers && this.state.p2p.peers.get(q.slice(7));
        return (e && e.avatarName) || "ein Mitspieler";
    }

    // Fitness je Regel über das Lebens-Fenster, nur aus der Regel SELBST zuordenbaren Achsen:
    // Engagement (feuert sie? inert = 0 → verfällt), Kosten (Effekt-Wallzeit, FPS heilig), Erfolg
    // (keine Exceptions/Budget-Brüche). NICHT der globale Emotions-Trend — der ist keiner einzelnen
    // Regel zuzuschreiben (Passagier-Trugschluss).
    _worldRuleFitness(rule) {
        const fires = rule.fires || 0;
        if (fires === 0) return 0; // inert (Bedingung nie wahr) → verfallen, Platz schaffen
        const cfg = AnazhRealm.WORLD_RULES;
        const avgMs = (rule.costMsSum || 0) / fires;
        const costScore = Math.max(0, Math.min(1, 1 - avgMs / cfg.costBudgetMs));
        const successScore = Math.max(0, 1 - (rule.errors || 0) / fires);
        // Der WERT entscheidet (die EINE Wertung δ, `_measureRuleReward`): valueScore 0.5 + 0.5·value, neutral 0.5 = die
        // Erneuerungs-Schwelle; Kosten und Erfolg mindern ihn nur (Produkt) — erneuert wird, wessen δ seine Kosten trägt.
        // Ergebnis: Heiler → 1.0, neutral → knapp unter 0.5, Schädling → 0. Bis affekt.K3 die Summe 0.6·Wert + 0.25·Erfolg +
        // 0.15·Kosten (neutral 0.7, Schädling 0.4): jede feuernde Regel bis value −0.67 wurde erneuert, die Welt wählte nichts
        // (Zeitraffer an a03b7b06, 30 min: Anteil value > 0 0,80 → 0,75, mit gemischtem δ 0,59 → 0,52).
        const valueScore = 0.5 + 0.5 * Math.max(-1, Math.min(1, rule.value || 0));
        return Number((valueScore * successScore * costScore).toFixed(3));
    }

    // Reward des letzten Feuerns (Advantage, REINFORCE mit Baseline): δ = wohlStruktur(jetzt) −
    // Baseline vor dem Effekt am berührten Ort, geklemmt [−1,1], EMA in rule.value. Das Feld hatte
    // Zeit zu reagieren → transiente Stempel zählen weniger als anhaltende Heilung. Nur bei _vPending.
    _measureRuleReward(rule, now) {
        if (!rule._vPending || !rule._vPos) return;
        const after = this._fieldWohlStruktur(this.auraAt(rule._vPos.x, rule._vPos.z, now));
        let reward = after - (rule._vBase || 0); // V17.43 — der lokale strukturelle δ am Effekt-Ort
        // Die Klammer: feuerte die Regel NAH am Spieler, während dessen Erlebnis-Tendenz stieg
        // (δ_spieler > 0), gibt es Bonus-Credit ∝ Nähe → der Nexus evolviert Regeln, die das Erleben heben.
        // Anti-Gaming: δ_spieler misst die SITUATION (lebendig + HP), nicht die gestempelte Emotion — eine
        // deposit_emotion-Regel kann den Bonus nicht faken.
        const pm = this.state.playerMesh && this.state.playerMesh.position;
        const pd = (this.state.player && this.state.player.appraisalDelta) || 0;
        if (pm && pd > 0) {
            const radius = AnazhRealm.WERTUNG.phase4Radius;
            const d2 = (rule._vPos.x - pm.x) ** 2 + (rule._vPos.z - pm.z) ** 2;
            if (d2 < radius * radius) {
                const proximity = 1 - Math.sqrt(d2) / radius;
                reward += pd * proximity * AnazhRealm.WERTUNG.phase4Weight;
            }
        }
        reward = Math.max(-1, Math.min(1, reward));
        rule.value = (rule.value || 0) + AnazhRealm.WERTUNG.ruleValueBeta * (reward - (rule.value || 0));
        rule._vPending = false;
    }

    // Mess-Ort des Regel-Rewards: der erste Positions-Knoten im Effekt-AST (at_field_need/at_player/…),
    // resolved wie der Effekt (gleicher Tick, gleicher State → derselbe Punkt); ohne Positions-Knoten
    // (z. B. weather) der Spieler-Ort — über denselben Knoten at_player, also ohne Spieler kein Mess-Ort (nie der Ursprung).
    _ruleRewardPos(effectNode, ctx) {
        const posOps = this.dslPositions;
        let found = null;
        const scan = (node) => {
            if (found || !Array.isArray(node)) return;
            if (typeof node[0] === "string" && posOps[node[0]]) {
                found = node;
                return;
            }
            for (const a of node) if (Array.isArray(a)) scan(a);
        };
        scan(effectNode);
        // Den Ort gibt es nicht (`dslEvalPos` hat ihn benannt ins Log geschrieben): kein Mess-Ort — der Effekt fände ihn
        // ebenso wenig, das Feuern ist ein Fehler der Regel, nie eine Messung am Spieler oder am Ursprung.
        let p;
        try {
            p = this.dslEvalPos(found || ["at_player"], ctx);
        } catch (err) {
            if (err && err.dslKeinOrt) return null;
            throw err;
        }
        return { x: p.x, z: p.z };
    }

    // Das erste Erwachen eines Spieler-Gesetzes (`_gesetzGeber`) als Welt-Erinnerung; idempotent über die Signatur (seen
    // reist im Snapshot). NUR Spieler-Gesetze — Nexus/LLM-Experimente fluteten sonst das Tagebuch und
    // verdrängten die Genesis-Anker. Einziger Aufrufer: _tickWorldRules beim ersten Feuern.
    _journalRuleAwoke(rule) {
        let desc;
        try {
            desc = this.describeProgram(["rule", rule.cond, rule.effect]);
        } catch {
            desc = "ein Gesetz";
        }
        const wer = this._gesetzGeber(rule);
        this.journalAppendOnce(
            `ruleAwoke:${rule._sig || rule.id}`,
            "rule",
            wer === "du"
                ? AnazhRealm._datum`Dein Gesetz erwachte — ${desc}.`
                : AnazhRealm._datum`Das Gesetz von ${wer} erwachte — ${desc}.`
        );
    }

    // DIE KREATUR EINES VERBS (Karte KI2, 16.10.): `indexOrId` ist, was die Form verspricht — der Platz in `state.creatures`
    // ODER die Identität, die die Welt der Kreatur gibt (`userData.netId`, „c7"). Bis 16.10. lasen die sechs Kreatur-Verben nur
    // den Platz: die echte Id fiel als *_index_oob. Ohne Kreatur steht `event` im Log und der Platz ist −1.
    _dslKreatur(indexOrId, ctx, event) {
        const alle = this.state.creatures;
        const id =
            typeof indexOrId === "string"
                ? alle.findIndex((k) => k && k.userData && k.userData.netId === indexOrId)
                : -1;
        const idx = id >= 0 ? id : indexOrId == null ? NaN : Number(indexOrId);
        if (Number.isInteger(idx) && idx >= 0 && idx < alle.length) return idx;
        if (ctx && ctx.log) ctx.log.push({ event, index: idx, id: indexOrId });
        return -1;
    }

    // ### Op-Tabellen ###
    get dslEffects() {
        if (this._dslEffectsCache) return this._dslEffectsCache;
        const c = (v, lo, hi) => this.dslClamp(v, lo, hi);
        this._dslEffectsCache = {
            weather: ([name], ctx) => {
                // Vokabular = die WEATHER_INTENSITY-Tabelle (sunny · rainy · stormy) und „frei" (der Spieler gibt sein
                // Wort zurück, `_wetterFreigeben`); der EINE Schreiber _setWeather trägt das Gesetz der Schreiber,
                // Logik-instant + visuellen Cross-Fade (DSL-Op und Auto-Zug teilen ihn) und die Quelle des Programms.
                const quelle = ctx && ctx.source;
                if (name === "frei") {
                    if (!this._wetterFreigeben(quelle) && ctx)
                        ctx.log.push({ event: "wetter_gehalten", quelle, wort: name });
                    return;
                }
                const ok = this._setWeather(name, quelle);
                // die Welt schreibt das Wetter nie selbst, sie wünscht es (die Stimme sagt es so, `_feldStimmeZeile`)
                if (ctx && ctx.tat) ctx.tat.wunsch = ok === "wunsch";
                if (ctx && ok === "wunsch") ctx.log.push({ event: "wetter_gewuenscht", quelle, wort: name });
                else if (ctx && ok === false) ctx.log.push({ event: "wetter_gehalten", quelle, wort: name });
            },
            // set_time_of_day(t), t ∈ 0..1 (0 = Mitternacht, 0.5 = Mittag). NON_BROADCASTABLE — jeder
            // Mitspieler darf seine eigene Tageszeit haben. Die Uhr gehört dem Spieler (`_himmelSchreiber`): der Satz einer
            // anderen Quelle (Nexus, seine Gesetze, die Emotion) steht beim Namen im Protokoll und die Uhr geht weiter.
            set_time_of_day: ([t], ctx) => {
                const quelle = ctx && ctx.source;
                if (!this.setTimeOfDay(Number(t), quelle) && ctx) ctx.log.push({ event: "uhr_gehalten", quelle, t });
            },
            // JAHRESZEIT setzen (Vorlagen-Phaenologie): "fruehling/sommer/herbst/winter" -> die
            // Foundry backt den Wald in dieser Saison um (Herbst golden, Winter kahl).
            set_season: ([name]) => {
                this.setSeason(name);
            },
            gravity: ([value]) => {
                // P3 — die Schwerkraft ist eine Skalar-Konstante, die `_stepCharacter` liest
                // (keine Ammo-Welt mehr, die ein setGravity bräuchte).
                this.state.gravity = Number(value); // das Band hält dslEval (`AnazhRealm.DSL_WERTE`)
            },
            terrain_steepness: ([value]) => {
                this.state.terrainSteepness = c(value, 0.1, 2.0);
            },
            terrain_base_height: ([value]) => {
                this.state.terrainBaseHeight = c(value, -50, 50);
            },
            // voxel_carve/voxel_fill(x, y, z, r): die DSL-Form des Voxel-Edits — eine Welt-Mod-Op
            // (broadcastable, history-trackable, multi-user-synchron). Bewusst NICHT im dslComposeAtomic-Pool:
            // der Nexus soll die Geometrie unter dem Spieler nicht willkürlich umpflügen.
            // Der Ort des Edits ist ein at-Knoten an der Engstelle (`dslEvalPos`): eine fehlende oder ungültige Koordinate
            // bricht die Op benannt ab (bis 07.10. machte `Number(null)` daraus die 0 — der Edit grub am Ursprung).
            voxel_carve: ([x, y, z, radius], ctx) => {
                const p = this.dslEvalPos(["at", x, y, z], ctx);
                const r = c(radius, 0.5, 12);
                this.carveVoxel(p.x, p.y, p.z, r);
                ctx.log.push({ event: "voxel_carved", x: p.x, y: p.y, z: p.z, r });
            },
            voxel_fill: ([x, y, z, radius], ctx) => {
                const p = this.dslEvalPos(["at", x, y, z], ctx);
                const r = c(radius, 0.5, 12);
                this.fillVoxel(p.x, p.y, p.z, r);
                ctx.log.push({ event: "voxel_filled", x: p.x, y: p.y, z: p.z, r });
            },
            // lava(x, y, z): der Schreib-Akt der Lava (stoffe.K3-2, `_lavaGiessen`) — die 16-m-Zelle am Ort trägt eine Decke
            // geschmolzenen Steins, die über die glut-Achse zu Stein erstarrt (broadcastable wie jeder Welt-Akt).
            lava: ([x, y, z], ctx) => {
                const p = this.dslEvalPos(["at", x, y, z], ctx);
                const a = this._lavaGiessen(p.x, p.z);
                ctx.log.push({ event: "lava", x: a.x, z: a.z, wasser: a.wasser });
            },
            skybox_color: ([color]) => {
                // Die Farbe überschreibt himmelTint NICHT (das schriebe _dayNightApplySkybox jeden Frame zurück):
                // sie setzt eine TÖNUNG, die der Tag-Nacht-Himmel parallel blendet + smooth fadet.
                if (typeof color !== "string") return;
                try {
                    const c = new THREE.Color(color);
                    // Nur die ZIEL-Farbe setzen; die gezeigte skyTint lerpt in _dayNightApplySkybox dorthin. Beim
                    // ersten Mal startet skyTint direkt am Ziel (dann fadet nur die Stärke ein).
                    this.state.skyTintTo = c;
                    if (!this.state.skyTint) this.state.skyTint = c.clone();
                    this.state.skyTintTarget = AnazhRealm.SKY_TINT_MAX;
                } catch {
                    // ungültige Farbe ignorieren
                }
            },
            spawn_creature: ([positionNode, count, emotion], ctx) => {
                const pos = this.dslEvalPos(positionNode, ctx);
                const n = c(count, 1, 20);
                const e = emotion || "happy"; // das Gesetz der Werte hält dslEval (`AnazhRealm.DSL_WERTE`)
                const { spawned, gruende, lastBorn } = this._dslWesenSetzen(ctx, pos, n, e, null, null);
                ctx.log.push({ event: "spawned_creature", count: spawned, emotion: e });
                this._setzErgebnis(ctx, "spawn_creature", n, spawned, gruende, "Kreaturen", "erschienen");
                // Spawnt DER SPIELER Leben (source "human") → joy + peace; der autonome Nexus hebt die
                // Spieler-Emotion nicht (seine Tat, nicht meine).
                if (spawned > 0 && ctx.source === "human")
                    this._feelAction("create_life", {
                        creature: lastBorn,
                        magnitude: Math.min(1.6, 0.7 + spawned * 0.2),
                    });
            },
            // spawn_tree läuft durch denselben Pfad wie jede Struktur (spawnArchitecture mit baum_eiche/
            // baum_kiefer) — kein Parallelcode: Compound-Tags, Welt-Effekte, Save, Werkstatt, Culling und
            // Kollision kommen geschenkt. spawn_island/spawn_ufo bleiben eigen (Inseln = Noise-Heightfields).
            spawn_tree: ([positionNode, count, kind, seed], ctx) => {
                const n = c(count, 1, 20);
                const pos = this.dslEvalPos(positionNode, ctx);
                const treeKind = kind === "kiefer" ? "baum_kiefer" : "baum_eiche"; // eiche | kiefer: `AnazhRealm.DSL_WERTE`
                let spawned = 0;
                const weicht = {};
                for (let i = 0; i < n; i++) {
                    if (ctx.budget.spawnsLeft <= 0) {
                        ctx.log.push({ event: "budget_exceeded", budget: "spawns", program_id: ctx.programId });
                        weicht.budget = n - i; // die übrigen Würfe fallen benannt
                        break;
                    }
                    ctx.budget.spawnsLeft--;
                    // Sanfter Jitter um pos (max 2.5 m), damit count>1 einen
                    // Hain produziert statt alle Bäume zu stapeln.
                    const off = n > 1 ? 2.5 : 0;
                    const jx = (ctx.rng() - 0.5) * 2 * off;
                    const jz = (ctx.rng() - 0.5) * 2 * off;
                    // Per-Baum-Seed: Basis-Seed (vom Chat-Pattern eingebettet)
                    // + Index, damit jeder Baum im Hain trotzdem eine eigene
                    // ID bekommt aber Multi-User-deterministisch ist.
                    const baseSeed = Number.isFinite(Number(seed))
                        ? Number(seed) >>> 0
                        : Math.floor(ctx.rng() * 0xffffffff);
                    const treeSeed = (baseSeed + i) >>> 0;
                    // Die SPEZIES direkt spawnen (baum_eiche/baum_kiefer); die Form kommt aus den grammatik-
                    // gewachsenen Built-in-Parts. arch.type = die Spezies (tragende Identität für hasInitialTrees,
                    // Instancing, Crafting); Varianz (scale/yaw) aus dem Seed, appliziert in spawnArchitecture. Der Hain
                    // setzt durch die EINE Natur-Wand (`_naturSetzen`): kein Baum der KI wächst in einem Haus.
                    const entry = this._naturSetzen(
                        treeKind,
                        { x: pos.x + jx, y: pos.y, z: pos.z + jz },
                        { seed: treeSeed, werk: !this._feldHandelt(ctx) },
                        null,
                        (wo) => (weicht[wo] = (weicht[wo] || 0) + 1)
                    );
                    if (entry) spawned++;
                }
                ctx.log.push({ event: "spawned_tree", count: spawned, pos, kind: treeKind });
                this._setzErgebnis(ctx, "spawn_tree", n, spawned, weicht, this._werkLabel(treeKind), "gewachsen");
            },
            // Co-Schöpfer pflanzt Studio-Assets: ein Wort ("eiche", "birken", "fels", ein Haus-/Tor-Rezept)
            // wird über dieselben Tabellen wie die Werkstatt zum Bauplan (_studioBlueprintForWord) und landet
            // am EINEN Chokepoint spawnArchitecture — mit Preset-Stempel (_studioStampFor), geerdet, nie im
            // Wasser (_dslSpawnStudioItems). Unbekanntes Wort → Log-Eintrag, kein Raten, kein Ersatz-Baum. `ov` (die
            // Regler {id: Zahl}, KI K2) prägt das Werk über denselben Stempel, am Vertrag der Art geklemmt. Eine Prägung (der
            // Klang der Welt, die Gestalt des Spielers — KIND_POLICY `werk`) steht an keinem Ort: Ort und Zahl zählen dort nicht.
            spawn_studio: ([what, positionNode, count, seed, ov], ctx) => {
                const name = this._studioBlueprintForWord(what == null ? "" : String(what));
                if (!name) {
                    ctx.log.push({ event: "unknown_studio_word", word: what, program_id: ctx.programId });
                    return;
                }
                if (this._studioWerkVerb(name) === "praegung") {
                    const n1 = this._dslSpawnStudioItems(name, null, 1, seed, ctx, 0, ov);
                    ctx.log.push({ event: "spawned_studio", count: n1, pos: null, kind: name });
                    return;
                }
                const n = c(count, 1, 24);
                const pos = this.dslEvalPos(positionNode, ctx); // kein Ort → `dslEvalPos` bricht die Op benannt ab
                const abstand = this._studioSpawnAbstand(name);
                const jitter = n > 1 ? abstand * Math.sqrt(n) : 0;
                const spawned = this._dslSpawnStudioItems(name, pos, n, seed, ctx, jitter, ov);
                ctx.log.push({ event: "spawned_studio", count: spawned, pos, kind: name });
            },
            spawn_island: ([positionNode, height, seed, size], ctx) => {
                const pos = this.dslEvalPos(positionNode, ctx);
                if (ctx.budget.spawnsLeft <= 0) {
                    ctx.log.push({ event: "budget_exceeded", budget: "spawns", program_id: ctx.programId });
                    this._setzErgebnis(ctx, "spawn_island", 1, 0, { budget: 1 }, "Insel", "gesetzt");
                    return;
                }
                ctx.budget.spawnsLeft--;
                const h = c(height, 1, 200);
                // Ring 11 V2.1-Stil: optionales Seed-Argument für Multi-User-
                // Determinismus. Wenn nicht gesetzt, würfeln. Chat-Pattern
                // „setze insel hier" embedded das Seed bei Build-Zeit.
                const s = Number.isFinite(Number(seed)) ? Number(seed) >>> 0 : Math.floor(ctx.rng() * 0xffffffff);
                // V9.42-b — `size` (Durchmesser in m) ist DSL-erreichbar, 6..48.
                const sz = Number.isFinite(Number(size)) ? c(Number(size), 6, 48) : undefined;
                // Islands spawnen ein Stück über dem angegebenen Punkt —
                // sonst würde der at_player-Pfad sie auf Spieler-Höhe legen
                // und der Spieler stünde im Erd-Inneren der Insel.
                const opts = { seed: s };
                if (sz !== undefined) opts.size = sz;
                const island = this.spawnIslandAt(pos.x, pos.y + 12, pos.z, h, opts);
                ctx.log.push({
                    event: "spawned_island",
                    pos: island ? { x: island.position.x, y: island.position.y, z: island.position.z } : pos,
                    height: h,
                    size: sz,
                    seed: s,
                });
                this._setzErgebnis(
                    ctx,
                    "spawn_island",
                    1,
                    island ? 1 : 0,
                    island ? {} : { buehne: 1 },
                    "Insel",
                    "gesetzt"
                );
            },
            spawn_ufo: ([positionNode], ctx) => {
                const pos = this.dslEvalPos(positionNode, ctx);
                if (ctx.budget.spawnsLeft <= 0) {
                    ctx.log.push({ event: "budget_exceeded", budget: "spawns", program_id: ctx.programId });
                    this._setzErgebnis(ctx, "spawn_ufo", 1, 0, { budget: 1 }, "UFO", "gerufen");
                    return;
                }
                ctx.budget.spawnsLeft--;
                const ufo = this.spawnUfoAt(pos.x, pos.y + 18, pos.z);
                ctx.log.push({
                    event: "spawned_ufo",
                    pos: ufo ? { x: ufo.position.x, y: ufo.position.y, z: ufo.position.z } : pos,
                });
                this._setzErgebnis(ctx, "spawn_ufo", 1, ufo ? 1 : 0, ufo ? {} : { buehne: 1 }, "UFO", "gerufen");
            },
            // Bau-Primitive: Position über die Selektor-Form (at_player, at_origin, near_player N), jeder Bau
            // = 1 Spawn-Budget. Optionales Seed für deterministische Visuals; beim Broadcast bettet der Sender
            // das verwendete Seed ein, damit alle Peers DIESELBEN Häuser sehen. spawn_village hebt das
            // fachwerk-Dorf (spawnSettlement → exportSettlement über den EINEN Worker); ein Spawn-Akt je Op —
            // die Häuser deckelt nH, den Nexus-Hort der autonomous-Cap.
            spawn_village: ([positionNode, seed, gier, tanH, jahr], ctx) => {
                // Eine GROSSE Struktur nie AUF den Spieler: das misst der Akt am Plan selbst (`_siedlungsAnker` — die Mitte
                // und der Radius seiner Häuser); die Schätzung „haus_basis × 3" davor ist gefallen. Trägt das Programm den
                // BLICK des Sprechers (Gier und Bildwinkel, „baue dorf hier"), steht das Dorf vor IHM — bei jedem Peer an
                // derselben Stelle (Gegenprüfung Runde 1: der Anker hing am eigenen Spieler, Blick und Fenster jedes Peers,
                // ~60 m Versatz); ein fremdes Programm dreht nie den Blick des Empfängers.
                const pos = this.dslEvalPos(positionNode, ctx);
                const g = Number(gier);
                const tH = Number(tanH);
                const blick =
                    gier != null && Number.isFinite(g)
                        ? { gier: g, tanH: Number.isFinite(tH) && tH > 0 ? tH : null }
                        : null;
                if (ctx.budget.spawnsLeft <= 0) {
                    ctx.log.push({ event: "budget_exceeded", budget: "spawns", program_id: ctx.programId });
                    this._setzErgebnis(ctx, "spawn_village", 1, 0, { budget: 1 }, "Dorf", "gebaut");
                    return;
                }
                ctx.budget.spawnsLeft--;
                const s = Number.isFinite(Number(seed)) ? Number(seed) >>> 0 : Math.floor(ctx.rng() * 0xffffffff);
                // die Größe aus dem Siedlungs-Gesetz (fachwerk SIEDLUNG) — das Stamm-Literal 9 fiel (Karte Dorf/Stadt
                // DEFEKT 4: zwei Chat-Wege mit zwei Größen-Wahrheiten); `spawnSettlement` liest das Gesetz NACH der
                // Buch-Ankunft (bei kaltem Buch fiel die Größe sonst still auf den Kern-Default)
                // das Jahr des Orts (siedlung.K4, optional): es wählt die Epoche seiner Zeitachse (`_dorfAkt`)
                this.spawnSettlement({
                    position: pos,
                    seed: s,
                    jahr: jahr != null && Number.isFinite(Number(jahr)) ? Number(jahr) : undefined,
                    nHAusGesetz: true,
                    autonomous: this._feldHandelt(ctx),
                    verlangt: ctx.source,
                    blick,
                });
                ctx.log.push({ event: "spawned_village", id: null, pos, seed: s });
                // DER BAU FOLGT (asynchron: das Buch, der Plan des Studios): jetzt steht nichts — der Satz sagt „wird gebaut",
                // das Dorf meldet sein Ergebnis selbst, wenn es steht (`spawnSettlement` → `_chatEcho`, an den, der es verlangt)
                this._setzErgebnis(
                    ctx,
                    "spawn_village",
                    1,
                    0,
                    {},
                    "Dorf",
                    "gebaut",
                    "Das Dorf wird gebaut — es meldet sich, wenn es steht."
                );
            },
            // AUSLÖSCHUNGS-WELLE — der TEMPEL ist die klassische PORTIKUS-Kultur des
            // fachwerk-Labs (haus_griechisch, KULTNAMES — der sakrale Klassik-Bau des
            // Studios). Fail-closed: kaltes Buch (Blueprint fehlt) → Skip-Log, kein Bau.
            spawn_temple: ([positionNode, seed], ctx) => {
                const name = "haus_griechisch";
                const gruende = {};
                const absage = (g) => (gruende[g] = (gruende[g] || 0) + 1);
                const ergebnis = (gesetzt) =>
                    this._setzErgebnis(ctx, "spawn_temple", 1, gesetzt, gruende, "Tempel", "gebaut");
                if (!this.state.blueprints || !this.state.blueprints[name]) {
                    ctx.log.push({ event: "skipped", reason: "studio_kalt", op: "spawn_temple" });
                    absage("buch");
                    ergebnis(0);
                    return;
                }
                const ziel = this.dslEvalPos(positionNode, ctx);
                if (ctx.budget.spawnsLeft <= 0) {
                    ctx.log.push({ event: "budget_exceeded", budget: "spawns", program_id: ctx.programId });
                    absage("budget");
                    ergebnis(0);
                    return;
                }
                const s = Number.isFinite(Number(seed)) ? Number(seed) >>> 0 : Math.floor(ctx.rng() * 0xffffffff);
                const opts = { seed: s, autonomous: this._feldHandelt(ctx), werk: !this._feldHandelt(ctx) };
                // der Ort, an dem das ganze Fundament auf dem Land steht (nach der Spieler-Klemme der Wurzel); keiner → benannt
                const ort = this._werkOrtSuchen(name, ziel, opts, this._samenStrom(s));
                if (!ort) {
                    absage("wasser");
                    ergebnis(0);
                    return;
                }
                ctx.budget.spawnsLeft--;
                const entry = this.spawnArchitecture(name, ort, Object.assign({ absage }, opts));
                ctx.log.push({ event: "spawned_temple", id: entry ? entry.id : null, pos: ort, seed: s });
                ergebnis(entry ? 1 : 0);
            },
            spawn_waterfall: ([positionNode, seed], ctx) => {
                const pos = this._structureSpawnPos("waterfall", this.dslEvalPos(positionNode, ctx), ctx);
                const gruende = {};
                const absage = (g) => (gruende[g] = (gruende[g] || 0) + 1);
                if (ctx.budget.spawnsLeft <= 0) {
                    ctx.log.push({ event: "budget_exceeded", budget: "spawns", program_id: ctx.programId });
                    this._setzErgebnis(ctx, "spawn_waterfall", 1, 0, { budget: 1 }, "Wasserfall", "gebaut");
                    return;
                }
                ctx.budget.spawnsLeft--;
                const s = Number.isFinite(Number(seed)) ? Number(seed) >>> 0 : Math.floor(ctx.rng() * 0xffffffff);
                const entry = this.spawnArchitecture("waterfall", pos, {
                    seed: s,
                    autonomous: this._feldHandelt(ctx),
                    werk: !this._feldHandelt(ctx),
                    absage,
                });
                ctx.log.push({ event: "spawned_waterfall", id: entry ? entry.id : null, pos, seed: s });
                this._setzErgebnis(ctx, "spawn_waterfall", 1, entry ? 1 : 0, gruende, "Wasserfall", "gebaut");
            },
            // Generischer Bauplan-Spawn für jeden Namen (built-in oder eigen), z. B. ["spawn_blueprint",
            // "mein-tempelplatz", ["at_player"]] — der universelle Pfad von Hotbar + Werkstatt. Slot 6
            // (optional) trägt den Guss-Stempel (studioOv) über die P2P-Naht; die Wand (plain object +
            // Taille-Größe) hält spawnArchitecture. Slot 7 (optional) die Drehung des Werks (das Phantom des Senders).
            // Alte Sender lassen sie weg, alte Empfänger ignorieren sie.
            spawn_blueprint: ([name, positionNode, seed, archId, studioOv, drehung], ctx) => {
                const gruende = {};
                const absage = (g) => (gruende[g] = (gruende[g] || 0) + 1);
                const art = typeof name === "string" ? this._werkLabel(name) : "Bauplan";
                const ergebnis = (gesetzt) =>
                    this._setzErgebnis(ctx, "spawn_blueprint", 1, gesetzt, gruende, art, "gebaut");
                if (typeof name !== "string") {
                    ctx.log.push({ event: "invalid_blueprint_name", name });
                    absage("unbekannt");
                    ergebnis(0);
                    return;
                }
                const bp = this.state.blueprints && this.state.blueprints[name];
                if (!bp) {
                    ctx.log.push({ event: "unknown_blueprint", name });
                    absage("unbekannt");
                    ergebnis(0);
                    return;
                }
                // Optionales archId macht den Spawn peer-übergreifend identifizierbar (für remove_architecture);
                // idempotent — eine doppelt zugestellte Nachricht spawnt nicht zweimal.
                const sharedId = typeof archId === "string" && archId ? archId : null;
                if (sharedId && this.state.architectures.some((a) => a && a.id === sharedId)) {
                    ctx.log.push({ event: "spawn_blueprint_duplicate", name, id: sharedId });
                    return;
                }
                // der gereiste Stempel trägt nur, was der Kern seiner Art ausweist (`_ovVertrag`) — sonst fällt der Bau benannt
                const bruch = this._ovVertrag(name, studioOv);
                if (bruch) {
                    ctx.log.push({ event: "studio_ov_vertrag", name, grund: bruch });
                    absage(bruch === "buch" ? "buch" : "vertrag");
                    ergebnis(0);
                    return;
                }
                const ziel = this.dslEvalPos(positionNode, ctx);
                if (ctx.budget.spawnsLeft <= 0) {
                    ctx.log.push({ event: "budget_exceeded", budget: "spawns", program_id: ctx.programId });
                    absage("budget");
                    ergebnis(0);
                    return;
                }
                const s = Number.isFinite(Number(seed)) ? Number(seed) >>> 0 : Math.floor(ctx.rng() * 0xffffffff);
                // Autonom (Nexus) gespawnte Baupläne unterliegen dem _capNexusStructures-Cap (kein
                // unbeschränktes Horten); Mensch-/Remote-Bauten bleiben ungedeckelt (gewollt + permanent).
                const opts = { seed: s, autonomous: this._feldHandelt(ctx), werk: !this._feldHandelt(ctx) };
                if (sharedId) opts.id = sharedId;
                if (typeof drehung === "number" && Number.isFinite(drehung)) opts.rotationY = drehung;
                // PRÄGUNG-WELT — der Stempel (im Vertrag, oben) geht an den Sanitize-Chokepoint (spawnArchitecture: Taille-Wand).
                if (studioOv) opts.studioOv = studioOv;
                // Ein Werk mit geteilter id steht, wo der Sender es gesetzt hat; sonst wählt das Programm den Ort — er trägt das
                // ganze Fundament (`_werkOrtSuchen`, nach der Spieler-Klemme der Wurzel), keiner → benannt.
                const ort = sharedId ? ziel : this._werkOrtSuchen(name, ziel, opts, this._samenStrom(s));
                if (!ort) {
                    absage("wasser");
                    ergebnis(0);
                    return;
                }
                ctx.budget.spawnsLeft--;
                const entry = this.spawnArchitecture(name, ort, Object.assign({ absage }, opts));
                ctx.log.push({ event: "spawned_blueprint", name, id: entry ? entry.id : null, pos: ort, seed: s });
                ergebnis(entry ? 1 : 0);
            },
            // Einen Bau abbauen — per Id in der Form, die die Welt vergibt (Karte KI2, 16.10.): eine Zahl (`architectureNextId`, jede
            // Welt zählt selbst) oder ein String (die geteilte Id spieler-gebauter Werke: `_newArchId` des Bau-Modus, `_werkKennung`
            // eines Werks aus einem Akt; der Sender hat sie lokal schon abgebaut, Mitspieler holen es hier nach). Bis 16.10. nahm das
            // Verb nur Strings — jeder Bau aus Programm, Feld und Worldgen fiel als invalid_id. Eine Zahl zählt jeder Peer anders: von
            // einem Mitspieler (`remote:`) trifft sie nie.
            remove_architecture: ([archId], ctx) => {
                const zahl = Number.isInteger(archId) && !String(ctx.source || "").startsWith("remote:");
                if (!zahl && !(typeof archId === "string" && archId)) {
                    ctx.log.push({ event: "remove_architecture_invalid_id" });
                    return;
                }
                const arch = (this.state.architectures || []).find((a) => a && a.id === archId);
                if (!arch) {
                    ctx.log.push({ event: "remove_architecture_not_found", id: archId });
                    return;
                }
                this.removeArchitecture(arch);
                ctx.log.push({ event: "removed_architecture", id: archId });
            },
            // Schöpfer-Werkzeuge: LLM oder Chat erschaffen eigene Baupläne. Whitelist: nur die acht bekannten
            // Shapes + blueprint-Referenz, parts-Cap 32, kein Built-in überschreiben.
            define_blueprint: ([name, parts], ctx) => {
                const valid = this.validateBlueprintParts(parts);
                if (!valid.ok) {
                    ctx.log.push({ event: "blueprint_validation_failed", reason: valid.reason });
                    return;
                }
                const result = this.createOrUpdateBlueprintFromDsl(name, valid.parts);
                ctx.log.push({
                    event: result.ok ? "defined_blueprint" : "define_blueprint_failed",
                    name: result.name,
                    reason: result.reason,
                });
                if (result.ok) {
                    // ein Name aus fremder Hand (Mitspieler, Werk-Code) geht nie in den Text der Erinnerung — sie liest die KI
                    const fremd = /^(remote:|teilen)/.test(String(ctx.source));
                    this.journalAppend(
                        "growth",
                        fremd
                            ? "Ein Bauplan kam von außen."
                            : AnazhRealm._datum`Ein neuer Bauplan entstand: ${result.name}.`,
                        {
                            name: result.name,
                            parts: valid.parts.length,
                        }
                    );
                    // Einen EIGENEN Bauplan erschaffen feuert Stolz (joy + hope) ∝ Komplexität, gefärbt von der
                    // Substanz — NUR die Mensch-Geste (nicht Nexus/LLM/remote).
                    if (ctx && ctx.source === "human") this._feelAction("create", { blueprint: result.name });
                }
            },
            // Welle 6.D Etappe 3b — Bauplan als Rüstung markieren + Equip-Ops.
            set_armor_role: ([blueprintName], ctx) => {
                const result = this.setBlueprintAsArmor(blueprintName);
                if (ctx && ctx.log) {
                    ctx.log.push({
                        event: result.ok ? "armor_role_set" : "armor_role_failed",
                        name: blueprintName,
                        reason: result.reason,
                    });
                }
            },
            // V17.52 Kampf Phase B — Bauplan als Waffe markieren (Spiegel von set_armor_role).
            set_weapon_role: ([blueprintName], ctx) => {
                const result = this.setBlueprintAsWeapon(blueprintName);
                if (ctx && ctx.log) {
                    ctx.log.push({
                        event: result.ok ? "weapon_role_set" : "weapon_role_failed",
                        name: blueprintName,
                        reason: result.reason,
                    });
                }
            },
            // R3-Schluss (§11.10) — Bauplan als Welt-Werkstatt markieren (Intent); die bediente Domäne
            // EMERGIERT (R1). Spiegel von set_armor_role.
            set_workshop_station: ([blueprintName], ctx) => {
                const result = this.setBlueprintAsWorkshopStation(blueprintName);
                if (ctx && ctx.log) {
                    ctx.log.push({
                        event: result.ok ? "workshop_station_set" : "workshop_station_failed",
                        name: blueprintName,
                        domain: result.domain,
                        reason: result.reason,
                    });
                }
            },
            // Bauplan als Konsumabel markieren: die Wirkung emergiert aus Compound-Tags × scale (Default
            // 0.2), nicht aus einer harten Tabelle (z. B. Wasser + Pflanze → lebendig + magieleitung).
            set_consumable_role: ([blueprintName, durationSeconds, scale, label], ctx) => {
                const result = this.setBlueprintAsConsumable(blueprintName, durationSeconds, label, scale);
                if (ctx && ctx.log) {
                    ctx.log.push({
                        event: result.ok ? "consumable_role_set" : "consumable_role_failed",
                        name: blueprintName,
                        reason: result.reason,
                    });
                }
            },
            // W12 Phase 2 — einen Bauplan auf eine registrierte Welt richten.
            // Der spieler-erreichbare Portal-Zielen-Pfad (Chat/Nexus/DSL).
            set_portal: ([blueprintName, worldId], ctx) => {
                const result = this.aimBlueprintAtWorld(blueprintName, worldId);
                if (ctx && ctx.log) {
                    ctx.log.push({
                        event: result.ok ? "portal_aimed" : "portal_aim_failed",
                        name: blueprintName,
                        reason: result.reason,
                    });
                }
            },
            equip_tool: ([name], ctx) => {
                const result = this.equipTool(name);
                if (ctx && ctx.log) {
                    ctx.log.push({
                        event: result.ok ? "tool_equipped" : "tool_equip_failed",
                        name: name || null,
                        reason: result.reason,
                    });
                }
            },
            equip_armor: ([name], ctx) => {
                const result = this.equipArmor(name);
                if (ctx && ctx.log) {
                    ctx.log.push({
                        event: result.ok ? "armor_equipped" : "armor_equip_failed",
                        name: name || null,
                        reason: result.reason,
                    });
                }
            },
            // V17.52 Kampf Phase B — Waffe ausrüsten (Spiegel von equip_armor).
            equip_weapon: ([name], ctx) => {
                const result = this.equipWeapon(name);
                if (ctx && ctx.log) {
                    ctx.log.push({
                        event: result.ok ? "weapon_equipped" : "weapon_equip_failed",
                        name: name || null,
                        reason: result.reason,
                    });
                }
            },
            unequip: ([slot], ctx) => {
                let result;
                if (slot === "tool") result = this.equipTool(null);
                else if (slot === "armor") result = this.equipArmor(null);
                else if (slot === "weapon") result = this.equipWeapon(null);
                else result = { ok: false, reason: "unknown_slot" };
                if (ctx && ctx.log) {
                    ctx.log.push({
                        event: result.ok ? "unequipped" : "unequip_failed",
                        slot,
                        reason: result.reason,
                    });
                }
            },
            // Welt-Beziehungs-Modus wechseln (frieden/pfad/schöpfer aus AnazhRealm.GAME_MODES; unbekannt →
            // frieden in setGameMode). NON_BROADCASTABLE: der Modus ist pro Spieler pro Welt.
            set_mode: ([mode], ctx) => {
                const result = this.setGameMode(mode);
                if (ctx && ctx.log) ctx.log.push({ event: "mode_set", mode: result });
            },
            // Kreatur-Aufträge (CREATURE_TASKS), z. B. wander (Default), follow_player (optionaler
            // distance-Halt), wait. NON_BROADCASTABLE — "die nächste Kreatur" ist je Sender eine andere.
            creature_task: ([indexOrId, taskName, paramArg], ctx) => {
                const idx = this._dslKreatur(indexOrId, ctx, "creature_task_index_oob");
                if (idx < 0) return;
                const args = this._buildCreatureTaskArgs(String(taskName), paramArg);
                const ok = this.assignCreatureTask(this.state.creatures[idx], String(taskName), args);
                if (ctx && ctx.log) {
                    ctx.log.push({
                        event: ok ? "creature_task_assigned" : "creature_task_failed",
                        index: idx,
                        task: String(taskName),
                    });
                }
            },
            // V17.53 Kampf Phase C — Schaden an einer Kreatur (per Index, wie creature_task).
            // Der Konsument von damageCreature (symmetrisch zum Spieler-`damage`-Op). Loot
            // fällt dem Spieler zu, wenn der Befehl vom Menschen kam; ein Welt-/LLM-Tod gibt keins.
            damage_creature: ([indexOrId, amount], ctx) => {
                const idx = this._dslKreatur(indexOrId, ctx, "damage_creature_index_oob");
                if (idx < 0) return;
                const src = ctx && ctx.source === "human" ? "player" : "world";
                const res = this.damageCreature(this.state.creatures[idx], Number(amount) || 0, { source: src });
                if (ctx && ctx.log) {
                    ctx.log.push({
                        event: res.killed ? "creature_killed" : res.ok ? "creature_damaged" : "creature_damage_failed",
                        index: idx,
                        dealt: res.dealt,
                    });
                }
            },
            creature_task_nearest: ([taskName, paramArg], ctx) => {
                const args = this._buildCreatureTaskArgs(String(taskName), paramArg);
                const player = this.dslEvalPos(["at_player"], ctx); // ohne Spieler keine „nächste" — nie die am Ursprung
                const target = this.assignTaskToNearestCreature(player, String(taskName), args);
                if (ctx && ctx.log) {
                    ctx.log.push({
                        event: target ? "creature_task_assigned_nearest" : "creature_task_no_nearest",
                        task: String(taskName),
                    });
                }
            },
            creature_task_all: ([taskName, paramArg], ctx) => {
                const args = this._buildCreatureTaskArgs(String(taskName), paramArg);
                const count = this.assignTaskToAllCreatures(String(taskName), args);
                if (ctx && ctx.log) {
                    ctx.log.push({ event: "creature_task_assigned_all", task: String(taskName), count });
                }
            },
            // Welle 6.H Phase 2F.2 — Kreatur-Equipped Ops. Drei pro Slot:
            // equip-tool, equip-armor, unequip. Index-basiert (creatureIdx),
            // null/leerer Name auf equip-* nimmt ab. Alle in NON_BROADCASTABLE.
            creature_equip_tool: ([indexOrId, toolName], ctx) => {
                const idx = this._dslKreatur(indexOrId, ctx, "creature_equip_index_oob");
                if (idx < 0) return;
                const result = this.equipCreatureTool(this.state.creatures[idx], toolName ? String(toolName) : null);
                if (ctx && ctx.log) {
                    ctx.log.push({
                        event: result.ok ? "creature_equipped_tool" : "creature_equip_failed",
                        index: idx,
                        tool: toolName || null,
                        reason: result.reason,
                    });
                }
            },
            creature_equip_armor: ([indexOrId, armorName], ctx) => {
                const idx = this._dslKreatur(indexOrId, ctx, "creature_equip_index_oob");
                if (idx < 0) return;
                const result = this.equipCreatureArmor(this.state.creatures[idx], armorName ? String(armorName) : null);
                if (ctx && ctx.log) {
                    ctx.log.push({
                        event: result.ok ? "creature_equipped_armor" : "creature_equip_failed",
                        index: idx,
                        armor: armorName || null,
                        reason: result.reason,
                    });
                }
            },
            creature_unequip: ([indexOrId, slot], ctx) => {
                const idx = this._dslKreatur(indexOrId, ctx, "creature_equip_index_oob");
                if (idx < 0) return;
                const result = this.unequipCreatureSlot(this.state.creatures[idx], String(slot));
                if (ctx && ctx.log) {
                    ctx.log.push({
                        event: result.ok ? "creature_unequipped" : "creature_unequip_failed",
                        index: idx,
                        slot: slot || null,
                        reason: result.reason,
                    });
                }
            },
            // Konsumable direkt auf eine Kreatur anwenden: der Bauplan muss role:"consumable" tragen,
            // tagBonus = computeCompoundTags(bp) × scale. KEIN Inventar-Konsum hier (das macht der RMB-Pfad).
            creature_apply_boost: ([indexOrId, blueprintName], ctx) => {
                const idx = this._dslKreatur(indexOrId, ctx, "creature_boost_index_oob");
                if (idx < 0) return;
                const result = this.activateCreatureConsumable(this.state.creatures[idx], String(blueprintName || ""));
                if (ctx && ctx.log) {
                    ctx.log.push({
                        event: result.ok ? "creature_boost_applied" : "creature_boost_failed",
                        index: idx,
                        blueprint: blueprintName || null,
                        reason: result.reason,
                    });
                }
            },
            // Inventar-Slot füllen (spieler-privat). count wird gedeckelt; unbekannte Baupläne werden
            // abgelehnt — mit Log-Event, kein stiller No-Op.
            add_to_inventory: ([blueprintName, count], ctx) => {
                const n = c(count, 1, 999);
                const ok = this.addToInventory(blueprintName, n);
                if (ctx && ctx.log) {
                    ctx.log.push({
                        event: ok ? "added_to_inventory" : "add_to_inventory_failed",
                        blueprint: blueprintName,
                        count: n,
                    });
                }
            },
            // Welle 6.D Etappe 3a — Konsumable definieren. Spieler kann ein
            // „Trank-Rezept" anlegen: tagBonus-Map + Dauer in Sekunden.
            // Aktivierung via apply_boost(name).
            define_consumable: ([name, tagBonus, durationSeconds, label], ctx) => {
                const result = this.createOrUpdateConsumable(name, tagBonus, durationSeconds, label);
                if (ctx && ctx.log) {
                    ctx.log.push({
                        event: result.ok ? "defined_consumable" : "define_consumable_failed",
                        name: result.name,
                        reason: result.reason,
                    });
                }
                if (result.ok) {
                    this.journalAppend("growth", AnazhRealm._datum`Ein neues Konsumabel entstand: ${result.name}.`, {
                        name: result.name,
                    });
                }
            },
            // Welle 6.D Etappe 3a — Konsumable aktivieren. Greift Etappe-2-Boost-
            // System; source = `consume:<name>` für Dedupe.
            apply_boost: ([name], ctx) => {
                const result = this.activateConsumable(name);
                if (ctx && ctx.log) {
                    ctx.log.push({
                        event: result.ok ? "boost_applied" : "apply_boost_failed",
                        name,
                        reason: result.reason,
                    });
                }
            },
            // Eigene Seelen: bodyParts laufen durch validateBlueprintParts (dieselbe Whitelist + Caps wie
            // Bauwerke) → Form × Material → Compound-Tags → Stats. NICHT im dslComposeAtomic-Pool — der
            // Nexus erfindet keine Charaktere.
            define_soul: ([name, bodyParts], ctx) => {
                const valid = this.validateBlueprintParts(bodyParts);
                if (!valid.ok) {
                    ctx.log.push({ event: "soul_validation_failed", reason: valid.reason });
                    return;
                }
                const result = this.createOrUpdateSoulFromDsl(name, valid.parts);
                ctx.log.push({
                    event: result.ok ? "defined_soul" : "define_soul_failed",
                    name: result.name,
                    reason: result.reason,
                });
                if (result.ok) {
                    this.journalAppend("growth", AnazhRealm._datum`Eine neue Seele entstand: ${result.name}.`, {
                        name: result.name,
                        parts: valid.parts.length,
                    });
                    // UI-Dropdown + Editor neu rendern, damit die neue Seele
                    // sofort wählbar + editierbar ist.
                    if (typeof this._refreshSoulSelect === "function") this._refreshSoulSelect();
                }
            },
            // Welle 4 Phase 1 — Schöpfer-Werkzeug für Materialien. Tags werden
            // in defineMaterial whitelistet + ge-clamp; Built-in-Materialien
            // bleiben unberührbar. Color ist optional, default grau.
            define_material: ([name, color, tags], ctx) => {
                const result = this.defineMaterial(name, color, tags);
                ctx.log.push({
                    event: result.ok ? "defined_material" : "define_material_failed",
                    name: result.name,
                    reason: result.reason,
                });
                if (result.ok) {
                    this.journalAppend("growth", AnazhRealm._datum`Eine neue Substanz wurde benannt: ${result.name}.`, {
                        name: result.name,
                    });
                }
            },
            // Werkzeug-Ops, bewusst NICHT im dslComposeAtomic-Pool (Werkzeug-Schöpfung ist Spieler-Geste):
            // opChain braucht ein Werkzeug im Besitz, Material × Op-Klasse müssen passen. Markieren
            // (opName/opClass) und Registrieren sind getrennte Ops — erst die Registrierung schreibt die
            // Präzision in state.tools.
            set_tool_meta: ([blueprintName, opName, opClass], ctx) => {
                const r = this.setBlueprintToolMeta(blueprintName, opName, opClass);
                ctx.log.push({
                    event: r.ok ? "set_tool_meta" : "set_tool_meta_failed",
                    blueprint: blueprintName,
                    opName,
                    opClass,
                    reason: r.reason,
                });
            },
            register_tool: ([blueprintName], ctx) => {
                const r = this.registerBlueprintAsTool(blueprintName);
                ctx.log.push({
                    event: r.ok ? "registered_tool" : "register_tool_failed",
                    blueprint: blueprintName,
                    precisionCap: r.precisionCap,
                    reason: r.reason,
                });
                if (r.ok) {
                    this.journalAppend(
                        "growth",
                        AnazhRealm._datum`Ein eigenes Werkzeug entstand: ${blueprintName} (Cap ${r.precisionCap.toFixed(2)}).`,
                        { tool: blueprintName, cap: r.precisionCap }
                    );
                }
            },
            // Welle 5 A — Verbindung zwischen zwei Parts setzen. Auch hier
            // bewusst NICHT im dslComposeAtomic-Pool: Verbindungen sind
            // explizite Geste, kein Zufalls-Brei.
            apply_connection: ([blueprintName, type, partA, partB], ctx) => {
                const result = this.addConnectionToBlueprint(blueprintName, {
                    type,
                    partA: Number(partA),
                    partB: Number(partB),
                });
                ctx.log.push({
                    event: result.ok ? "applied_connection" : "apply_connection_failed",
                    blueprint: blueprintName,
                    type,
                    partA,
                    partB,
                    reason: result.reason,
                });
            },
            apply_op: ([blueprintName, partIndex, toolName], ctx) => {
                const result = this.applyOpToPart(blueprintName, Number(partIndex), toolName);
                ctx.log.push({
                    event: result.ok ? "applied_op" : "apply_op_failed",
                    blueprint: blueprintName,
                    partIndex,
                    tool: toolName,
                    reason: result.reason,
                    precision: result.precision,
                });
            },
            define_ability: ([name, program], ctx) => {
                if (typeof name !== "string" || name.length === 0 || name.length > 40) {
                    ctx.log.push({ event: "invalid_ability_name", name });
                    return;
                }
                if (!Array.isArray(program) || program.length === 0) {
                    ctx.log.push({ event: "invalid_ability_program", name });
                    return;
                }
                // Sandbox: Tiefen-Cap und kein verschachteltes define_*.
                const depth = this.dslEstimateDepth(program);
                if (depth > 6) {
                    ctx.log.push({ event: "ability_depth_exceeded", name, depth });
                    return;
                }
                if (
                    this.dslContainsOp(program, "define_blueprint") ||
                    this.dslContainsOp(program, "define_ability") ||
                    this.dslContainsOp(program, "define_material")
                ) {
                    ctx.log.push({ event: "ability_nested_define_forbidden", name });
                    return;
                }
                const safeName = name.replace(/[^a-z0-9_-]/gi, "").slice(0, 40);
                if (!safeName) {
                    ctx.log.push({ event: "invalid_ability_name_after_sanitize", name });
                    return;
                }
                this.addNewAbility(safeName, program, "llm");
                this.journalAppend("growth", AnazhRealm._datum`Eine neue Fähigkeit ruht in mir: ${safeName}.`, {
                    name: safeName,
                });
                ctx.log.push({ event: "defined_ability", name: safeName });
            },
            // Fraktal-Bau: eine Wurzel, hexagonal von 6 Sub-Strukturen (× ratio) umringt, rekursiv bis
            // depth 0 (depth=2, ratio=0.5 → 1+6+36 = 43 Strukturen); Distance-Culling hält nicht alle im GPU.
            spawn_fractal: ([positionNode, type, depth, ratio, rootSeedArg], ctx) => {
                const pos = this.dslEvalPos(positionNode, ctx);
                // AUSLÖSCHUNGS-WELLE — die alten Typ-WÖRTER bleiben gültig (alte Programme/
                // Regeln laufen weiter), die Gestalt ist Studio: village/temple mappen auf
                // fachwerk-Kulturen. Fail-closed (Schau-2, Gegenprüfung Runde 3): ein kaltes Buch baut nichts und sagt es
                // (bis dahin baute es still Wasserfälle statt Tempel und meldete „Fraktal-tempel gebaut").
                const typeMap = { village: "haus_alemannisch", temple: "haus_griechisch", waterfall: "waterfall" };
                const t = typeMap[typeof type === "string" ? type : ""] || typeMap.temple;
                const d = c(depth, 0, 3);
                const r = c(ratio, 0.2, 0.8);
                let gewollt = 0;
                for (let l = 0; l <= d; l++) gewollt += Math.pow(6, l);
                const gruende = {};
                const absage = (g) => (gruende[g] = (gruende[g] || 0) + 1);
                const art = `Fraktal-${this._werkLabel(t)}`;
                if (!(this.state.blueprints && this.state.blueprints[t])) {
                    ctx.log.push({ event: "skipped", reason: "studio_kalt", op: "spawn_fractal" });
                    gruende.buch = gewollt;
                    this._setzErgebnis(ctx, "spawn_fractal", gewollt, 0, gruende, art, "gebaut");
                    return;
                }
                let spawned = 0;
                let versucht = 0;
                const visit = (cx, cz, scale, level, parentSeed) => {
                    if (ctx.budget.spawnsLeft <= 0) {
                        ctx.log.push({ event: "budget_exceeded", budget: "spawns", program_id: ctx.programId });
                        return;
                    }
                    ctx.budget.spawnsLeft--;
                    versucht++;
                    const childSeed = (parentSeed * 16807 + level * 31) >>> 0;
                    // M6 — die Fraktal-KINDER folgen der (an der Wurzel schon geklemmten)
                    // Struktur EXAKT (precise): das Hexagon-Muster bleibt ganz; das
                    // Fraktal als GANZES weicht dem Spieler über die Wurzel-Klemme aus.
                    if (
                        this.spawnArchitecture(
                            t,
                            { x: cx, y: pos.y, z: cz },
                            {
                                seed: childSeed,
                                scale,
                                precise: true,
                                autonomous: this._feldHandelt(ctx),
                                werk: !this._feldHandelt(ctx),
                                absage,
                            }
                        )
                    )
                        spawned++;
                    if (level >= d) return;
                    const childRadius = 14 * scale;
                    for (let i = 0; i < 6; i++) {
                        const angle = (i / 6) * Math.PI * 2;
                        const ncx = cx + Math.cos(angle) * childRadius;
                        const ncz = cz + Math.sin(angle) * childRadius;
                        visit(ncx, ncz, scale * r, level + 1, childSeed + i);
                    }
                };
                // Ring 11 V2.1: rootSeed kann explizit gesetzt werden (Multi-
                // User-Sync). Sonst wie bisher: ctx.rng-basiert.
                const rootSeed = Number.isFinite(Number(rootSeedArg))
                    ? Number(rootSeedArg) >>> 0
                    : Math.floor(ctx.rng() * 0xffffffff);
                visit(pos.x, pos.z, 1, 0, rootSeed);
                ctx.log.push({
                    event: "spawned_fractal",
                    type: t,
                    depth: d,
                    ratio: r,
                    count: spawned,
                    seed: rootSeed,
                });
                // was das Budget nicht mehr besuchte (ein abgewiesener Knoten trägt seinen ganzen Teilbaum), fiel am Budget
                if (gewollt > versucht) gruende.budget = (gruende.budget || 0) + (gewollt - versucht);
                this._setzErgebnis(ctx, "spawn_fractal", gewollt, spawned, gruende, art, "gebaut");
            },
            creatures_color: ([color]) => {
                if (typeof color !== "string") return;
                let tint = null;
                try {
                    tint = new THREE.Color(color);
                } catch {
                    return;
                }
                // Welle 6.H P2A — Kreatur ist Group; tinten via traverse über
                // alle Sub-Mesh-Materialien. Pre-V7.82-Mesh-Pfad (cr.material)
                // bleibt als Fallback für Legacy-Test-Setups.
                for (const cr of this.state.creatures) {
                    if (cr.material && cr.material.color) {
                        cr.material.color.copy(tint);
                    } else if (typeof cr.traverse === "function") {
                        cr.traverse((node) => {
                            if (node.isMesh && node.material && node.material.color) {
                                node.material.color.copy(tint);
                            }
                        });
                    }
                }
            },
            creatures_emotion: ([emotion]) => {
                // V18.100 (G4-1) — der Op SETZT das Innenleben (deterministisch,
                // wie sein alter Intent): ein klarer Achsen-Zustand statt eines
                // Etikett-Stempels; die Projektion liefert das alte Verhalten.
                for (let i = 0; i < this.state.creatures.length; i++) {
                    const c = this.state.creatures[i];
                    if (!c || !c.userData) continue;
                    c.userData.emotions =
                        emotion === "sad"
                            ? { joy: 0, awe: 0, sorrow: 0.6, hope: 0, peace: 0, chaos: 0.1 }
                            : { joy: 0.6, awe: 0, sorrow: 0, hope: 0.2, peace: 0.2, chaos: 0 };
                    this._projectCreatureEmotion(c);
                }
            },
            // DIE KÖRPER-GESETZE SIND GESETZ (Leben-Schau 07.10., Neu 1): ein Op moduliert Gang, Sprung und Größe nur
            // INNERHALB der Bänder des Gesetzes, benannt im Protokoll — der Spieler-Leib im Band seines Körper-Gesetzes
            // (koerper fx.bewegung), das Tier-Tempo im Wander-Band, die Tier-Größe nur über die bodySize-Achse. Vorher
            // schrieben die Ops absolute Werte (Gehen 11,1 m/s, Sprint 45 m/s, Sprungkraft 18,6 statt 2,6), skalierten
            // jedes Tier ohne Achse (16 von 16 ×1,11) und schrieben ein Tempo, das niemand las.
            creatures_speed_mul: ([factor], ctx) => this._kreaturTempoHauch(factor, ctx),
            creatures_size_mul: ([factor], ctx) => this._kreaturGroesseHauch(factor, ctx),
            player_jump_power: ([value], ctx) => this._koerperHauch("jumpPower", value, ctx),
            player_speed: ([value], ctx) => this._koerperHauch("speed", value, ctx),
            // Welle 6.D Etappe 3a — Schaden zufügen (DSL-getrieben). Schöpfer-
            // Werkzeug + Test-Hook. Welt-Hazards (6.G) + Kreaturen (6.H) hängen
            // sich später an damagePlayer. Bewusst NICHT im atomic-Pool.
            damage: ([amount, source], ctx) => {
                const dealt = this.damagePlayer(c(amount, 0, 1000), source || "dsl");
                if (ctx && ctx.log) ctx.log.push({ event: dealt ? "player_damaged" : "damage_ignored", amount });
            },
            player_soul: ([name]) => {
                // Seele wechseln — NICHT im dslComposeAtomic-Pool (der Nexus schreibt dem Menschen nie die
                // Identität um), aber als DSL-Op, damit Chat, Abilities und Trigger denselben Pfad nutzen.
                this.applyPlayerSoul(typeof name === "string" ? name : "");
            },
            set_visible: ([target, visible], ctx) => {
                // Whitelist hält die Safety-Surface klein: nur grob steuerbare
                // Welt-Schichten, keine beliebigen Mesh-Namen. Wer mehr Targets
                // braucht, fügt neue Primitives hinzu (Doc-Review nötig).
                const v = !!visible;
                if (target === "terrain") this.toggleTerrain(v);
                else if (target === "creatures") this.toggleCreatures(v);
                else ctx.log.push({ event: "invalid_set_visible_target", target: String(target) });
            },
            record_narrative: ([text]) => {
                if (typeof text !== "string") return;
                const trimmed = text.trim();
                if (!trimmed) return;
                // Cap auf 500 Zeichen verhindert, dass ein Programm die Knowledge-
                // Base mit einem Riesen-String volllaufen lässt.
                const capped = trimmed.length > 500 ? trimmed.slice(0, 500) : trimmed;
                this.addKnowledge("narrative", capped);
            },
            say: ([message]) => {
                if (typeof message !== "string" || message.length === 0) return;
                // DSL-`say` hängt an Grok an, statt eigenen Output zu bauen. Damit
                // teilen Mensch und Nexus dieselbe Stimme — ein Pfeiler der Vision.
                const grok = this.state.grok;
                if (!grok.pool.dslSay) {
                    grok.pool.dslSay = [];
                    grok.poolIndex.dslSay = 0;
                    grok.triggers.dslSay = { lastFired: -Infinity, cooldown: 30 };
                }
                grok.pool.dslSay[0] = message;
                grok.poolIndex.dslSay = 0;
                this.grokSpeak("dslSay");
            },

            // Feld-Schreib-Effekte: deposit_life([posNode?, amount?]) → _depositLife, deposit_emotion([axis,
            // amount, posNode?]) → _depositEmotion; Default at_player. Was eine Regel schreibt, liest eine
            // andere über field_above/field_below. Nur die reaktive Overlay-Schicht, nie der frozen Worldgen
            // → deterministisch + multi-user-sicher.
            deposit_life: ([positionNode, amount], ctx) => {
                const pos = this._dslRulePos(positionNode, ctx);
                const amt =
                    amount != null ? c(amount, 0, AnazhRealm.LIFE_FIELD.max) : AnazhRealm.LIFE_FIELD.pulseCenter;
                this._depositLife(pos.x, pos.z, amt);
            },
            deposit_emotion: ([axis, amount, positionNode], ctx) => {
                if (typeof axis !== "string" || !AnazhRealm.EMOTION_AXES.includes(axis)) return;
                const amt = c(amount, 0, 1); // Tat-Intensität; _depositEmotion skaliert mit imprintScale
                if (!(amt > 0)) return;
                const pos = this._dslRulePos(positionNode, ctx);
                this._depositEmotion(pos.x, pos.z, { [axis]: amt });
            },

            // Control-Flow
            chain: (args, ctx) => {
                for (const sub of args) this.dslEval(sub, ctx);
            },
            delay: ([seconds, sub], ctx) => {
                const s = c(seconds, 0, 60);
                if (ctx.budget.delayedSteps <= 0) {
                    ctx.log.push({ event: "budget_exceeded", budget: "delayed_steps", program_id: ctx.programId });
                    return;
                }
                ctx.budget.delayedSteps--;
                this.dslSchedule(s, sub, ctx);
            },
            repeat: ([times, sub], ctx) => {
                const n = c(times, 1, 20);
                for (let i = 0; i < n; i++) {
                    if (ctx.budget.delayedSteps <= 0) break;
                    this.dslEval(sub, ctx);
                }
            },
            random: (args, ctx) => {
                if (args.length === 0) return;
                const pick = args[Math.floor(ctx.rng() * args.length)];
                this.dslEval(pick, ctx);
            },
            random_weighted: (args, ctx) => {
                const items = args.filter((a) => a && typeof a === "object" && Array.isArray(a.effect));
                if (items.length === 0) return;
                const total = items.reduce((s, x) => s + Math.max(0, Number(x.weight) || 0), 0);
                if (total <= 0) return this.dslEval(items[0].effect, ctx);
                let r = ctx.rng() * total;
                for (const x of items) {
                    r -= Math.max(0, Number(x.weight) || 0);
                    if (r <= 0) return this.dslEval(x.effect, ctx);
                }
                this.dslEval(items[items.length - 1].effect, ctx);
            },
            // die Bedingung, die den Zweig wählte, ist die Ursache seiner Taten (`ctx.weil`, die Stimme nennt sie)
            when: ([condition, thenBranch, elseBranch], ctx) => {
                const ja = this.dslEvalCond(condition, ctx);
                const zweig = ja ? thenBranch : elseBranch;
                if (!zweig) return;
                const weil = ctx.weil;
                ctx.weil = { cond: condition, ja };
                this.dslEval(zweig, ctx);
                ctx.weil = weil;
            },
            // rule-Primitiv: ein when, das nicht verfällt — registriert Bedingung → Effekt in
            // state.worldRules, _tickWorldRules prüft fortlaufend. Mensch + Nexus nutzen DENSELBEN Pfad.
            // ["rule", cond, effect, {everySec?, ttlSec?}].
            rule: ([condNode, effectNode, opts], ctx) => {
                this._registerWorldRule(condNode, effectNode, opts, ctx);
            },
            parallel: (args, ctx) => {
                for (const sub of args) this.dslEval(sub, ctx);
            },
        };
        return this._dslEffectsCache;
    }

    // Platzier-Schleife des Co-Schöpfers: n Stück im Jitter-Kreis um pos, je ein trockener Fleck (max 4 Würfe: der Fuß eines
    // Stamms `_stammFussLand`, jedes andere Werk das EINE Land `_landAt`), geerdet auf die Voxel-Oberfläche (+0.5), Streuung
    // + Drehung + Baum-Größe aus dem Strom des Samens (`_samenStrom`: der Hain ist eine Funktion seines Samens und der Welt,
    // die der Peer an diesem Ort gestreamt hat — das Land am Ufer liest das gezeichnete Wasser, ein Peer ohne den Chunk
    // urteilt nach dem Gesetz allein; ohne Samen der nächste des Welt-Stroms), Preset-Stempel am Eintrag. Budget wie jeder Spawn-Op. Natur (Baum, Strauch, Fels —
    // `_istNatur`) setzt durch die EINE Natur-Wand (`_naturSetzen`): kein Hain der KI wächst in einem Haus. Ein Werk mit
    // Grundriss-Gesetz (Haus, Ausstattung) sucht den Ort, an dem sein ganzes Fundament auf dem Land steht (`_werkOrtSuchen`,
    // nach der Spieler-Klemme der Wurzel); jedes andere Werk fragt das Land an seinem Ort.
    // DER TRAGENDE BAU (K52): liegt (x, z) auf einem Bau, der auf dem Grund steht (die Genesis-Scheibe, ein Sockel — seine
    // Box reicht bis auf den Boden `boden`, höchstens eine Stufe darüber), trägt seine Oberkante, was der Satz dort setzt;
    // sonst der Boden. Natur und was fährt tragen nichts. Seit die Scheibe auf dem Grund liegt, stand die Feuerstelle des
    // Menschen auf ihr IM Stein (der Feuerkreis aus 2 m: Luma 0,656 → 0,015).
    _bauDachUnter(x, z, boden) {
        const STEP = AnazhRealm.PLAYER_STEP_UP;
        const nahe = this._blockerNahe(x, z, 0, -Infinity, (this._bauDachNahe = this._bauDachNahe || []));
        let y = boden;
        for (const e of nahe) {
            if ((e.affordances && e.affordances.moveable) || this._istNatur(e)) continue;
            for (const b of e.blockerAABBs || [])
                if (b.botY <= boden + STEP && b.topY > y && x >= b.minX && x <= b.maxX && z >= b.minZ && z <= b.maxZ)
                    y = b.topY;
        }
        nahe.length = 0;
        return y;
    }

    // DER FUSS EINES WERKS, das ein Programm setzt (der Satz, die KI, der geteilte Code, der Tempel, der Nexus): die oberste Fläche
    // an (x, z) — der tragende Bau (`_bauDachUnter`) über dem Boden —, + 0,5 (der Eintrag steht 0,5 über seiner Sohle); ohne
    // Oberfläche `y`. Leser: `_dslSpawnStudioItems` und `_werkOrtSuchen` (jeder Ort, den es nennt). Bis 27.10. trug ein Werk aus
    // spawn_blueprint die Fußhöhe des Spielers (`at_player_forward`): die geteilte Podestleiter stand 1,55 m über dem Hang,
    // ihre unterste Stufe außer Schritt-Reichweite (diag-werkstatt-weg L-VERBEN, geteilt × Leiter).
    _werkFuss(x, z, y) {
        const sy = this._voxelSurfaceY(x, z);
        return Number.isFinite(sy) ? this._bauDachUnter(x, z, sy) + 0.5 : y;
    }

    // Die Regler des Programms (`ov`) prägen über den EINEN Stempel; jede Klemme steht beim Namen im Log, ein fremder Regler
    // setzt nichts (der Grund `regler`, das Log nennt ihn und die Regler der Art). Ein Same null ist keiner (Lehre 17).
    // DAS WERK JE ART (KIND_POLICY `werk`, KI K2): eine Gattung erscheint als Wesen, ihr Stempel ist der Guss (`_dslWesenSetzen`);
    // eine Prägung schreibt der EINE Prägungs-Schreiber (`_praegungSetzen`), ihre lebenden Leser folgen; sonst baut oder
    // wächst der Bauplan.
    _dslSpawnStudioItems(name, pos, n, seed, ctx, jitter, ov) {
        const befund = {};
        const stamp = this._studioStampFor(name, ov, befund);
        const istBaum = name.startsWith("baum_");
        const natur = this._istNatur({ type: name });
        const werk = this._studioWerkVerb(name);
        const verb = werk === "praegung" ? "geprägt" : werk === "wesen" ? "erschienen" : natur ? "gewachsen" : "gebaut";
        if (befund.geklemmt && befund.geklemmt.length)
            ctx.log.push({ event: "studio_regler_geklemmt", kind: name, geklemmt: befund.geklemmt });
        if (stamp === false) {
            ctx.log.push({ event: "studio_regler_abgelehnt", kind: name, regler: befund.fremd, kennt: befund.kennt });
            this._setzErgebnis(ctx, "spawn_studio", n, 0, { regler: n }, this._werkLabel(name), verb);
            return 0;
        }
        if (werk === "praegung") {
            this._praegungSetzen(this._foundry.recipes[name].kind, name, stamp || {});
            this._setzErgebnis(ctx, "spawn_studio", 1, 1, {}, this._werkLabel(name), verb);
            return 1;
        }
        if (werk === "wesen") {
            const w = this._dslWesenSetzen(ctx, pos, n, "happy", this._gattungsSeele(name), stamp);
            this._setzErgebnis(ctx, "spawn_studio", n, w.spawned, w.gruende, this._werkLabel(name), verb);
            return w.spawned;
        }
        const grundriss = !natur && !!this._grundrissGesetz(name);
        const baseSeed =
            seed != null && Number.isFinite(Number(seed)) ? Number(seed) >>> 0 : this._bauSame("studio:" + name);
        const wurf = this._samenStrom(baseSeed);
        let spawned = 0;
        const weicht = {};
        const absage = (wo) => (weicht[wo] = (weicht[wo] || 0) + 1);
        for (let i = 0; i < n; i++) {
            if (ctx.budget.spawnsLeft <= 0) {
                ctx.log.push({ event: "budget_exceeded", budget: "spawns", program_id: ctx.programId });
                weicht.budget = n - i; // die übrigen Würfe fallen benannt
                break;
            }
            let x = pos.x,
                z = pos.z,
                trocken = false;
            let opts = null;
            if (grundriss) {
                // DAS WERK MIT GRUNDRISS: Drehung und Same zuerst (der Grundriss dreht mit), dann der Ort, der es trägt
                opts = { seed: (baseSeed + i) >>> 0, rotationY: wurf() * Math.PI * 2, werk: !this._feldHandelt(ctx) };
                if (stamp) opts.studioOv = stamp;
                const off = n > 1 ? Math.max(jitter, 2.5) : 0;
                const ziel = { x: pos.x + (wurf() - 0.5) * 2 * off, y: pos.y, z: pos.z + (wurf() - 0.5) * 2 * off };
                const q = this._werkOrtSuchen(name, ziel, opts, wurf);
                if (q) {
                    x = q.x;
                    z = q.z;
                    trocken = true;
                }
            } else
                for (let t = 0; t < 4 && !trocken; t++) {
                    const off = n > 1 || t > 0 ? Math.max(jitter, 2.5) : 0;
                    x = pos.x + (wurf() - 0.5) * 2 * off;
                    z = pos.z + (wurf() - 0.5) * 2 * off;
                    trocken = natur ? this._stammFussLand(x, z, 0.2) : this._landAt(x, z, 0.2);
                }
            // vier Würfe im Wasser (ein Werk mit Grundriss: kein tragender Ort in Reichweite): der Wurf fällt BENANNT (der Satz
            // sagt „im Wasser steht nichts, am Ufer schon", nie „gewachsen" bei 0)
            if (!trocken) {
                absage("wasser");
                continue;
            }
            ctx.budget.spawnsLeft--;
            const y = this._werkFuss(x, z, pos.y);
            if (!opts) {
                opts = { seed: (baseSeed + i) >>> 0, rotationY: wurf() * Math.PI * 2, werk: !this._feldHandelt(ctx) };
                if (istBaum) opts.scale = 0.8 + wurf() * 0.45;
                if (stamp) opts.studioOv = stamp;
            }
            const ort = { x, y, z };
            // die Wand und die Wurzel nennen jede Absage (`absage`, die Wurzel über `opts.absage`)
            if (
                natur
                    ? this._naturSetzen(name, ort, opts, null, absage)
                    : this.spawnArchitecture(name, ort, Object.assign({ absage }, opts))
            )
                spawned++;
        }
        this._setzErgebnis(ctx, "spawn_studio", n, spawned, weicht, this._werkLabel(name), verb);
        return spawned;
    }

    // DIE GEBURT AUS EINEM PROGRAMM (spawn_creature und die Gattung aus spawn_studio): n Wesen im RING um den Ziel-Punkt, nie
    // gestapelt, nie AUF dem Spieler (liegt das Ziel auf ihm, at_player, rückt der Ring nach außen); ctx.rng → deterministisch
    // + broadcast-konsistent. `seele` null würfelt die Seele, `dialsOv` ist der Guss (der Stempel der Gattung, sonst ihre
    // Prägung). DIE NEXUS-GEBURT folgt dem Geburts-Gesetz (D13, Leben-Schau 07.10. Neu 1): der autonome Nexus setzt ein Wesen
    // nur dorthin, wo es fern und außerhalb des Blicks zur Welt kommt (`_kreaturGeburtsOrt`); der Mensch (und wer in seinem
    // Namen spricht) ruft Leben vor sich — das ist sein Akt. { spawned, gruende, lastBorn }.
    _dslWesenSetzen(ctx, pos, n, e, seele, dialsOv) {
        const ppos = ctx.state.playerMesh && ctx.state.playerMesh.position;
        const onPlayer = !!(ppos && Math.hypot(pos.x - ppos.x, pos.z - ppos.z) < 2.0);
        const autonom = this._feldHandelt(ctx);
        let spawned = 0;
        let lastBorn = null;
        const gruende = {};
        // Der Zähler synchroner Bauten (`_fadenUmgangen`) zählt den Guss einer Gattung vor dem Ofen-Vorrat, er hält die Geburt nie
        // auf: bis heil-zaehler sagte die Nexus-Geburt vor dem Vorrat „vorrat" ab, und kein Tier entstand (gate:weltakt-wache F).
        const absage = (g) => (gruende[g] = (gruende[g] || 0) + 1);
        const opts = dialsOv ? { absage, dialsOv } : { absage };
        for (let i = 0; i < n; i++) {
            if (ctx.budget.spawnsLeft <= 0) {
                ctx.log.push({ event: "budget_exceeded", budget: "spawns", program_id: ctx.programId });
                gruende.budget = n - i; // die übrigen Würfe fallen benannt
                break;
            }
            ctx.budget.spawnsLeft--;
            const ang = ctx.rng() * Math.PI * 2;
            const rad = (onPlayer ? 2.5 : 0) + 1.5 + ctx.rng() * 2.5; // 1.5..4 m, +2.5 wenn auf dem Spieler
            let sx = pos.x + Math.cos(ang) * rad;
            let sz = pos.z + Math.sin(ang) * rad;
            let sy = pos.y;
            if (autonom) {
                const ort = this._kreaturGeburtsOrt(ctx.rng, 80, { x: sx, z: sz });
                if (!ort) continue; // die Wildnis trägt den Ort nicht: keine autonome Geburt
                if (ort.x !== sx || ort.z !== sz) {
                    sx = ort.x;
                    sz = ort.z;
                    const gY = this.getTerrainHeightAt(sx, sz);
                    sy = (Number.isFinite(gY) ? gY : pos.y) + 1;
                }
            }
            // eine Geburt, die nicht stattfand, zählt nicht und trägt kein Leben (die Absage nennt ihren Grund —
            // bis Schau-2 Runde 3 zählte der Op jeden Wurf: „10 Kreaturen gespawnt" bei 3, 0 und 0 an der Obergrenze)
            const born = this.spawnCreatureAt(sx, sy, sz, e, seele, opts);
            if (!born) continue;
            // Intentional getragene Kreatur (Nexus/Chat/DSL) TENDET das Feld (träufelt Leben, wo sie wohnt;
            // _tickCreatureLifeTrickle). Ambiente Fauna bekommt das Flag NIE — sie ist die Folge des Feldes
            // (kein Runaway).
            if (born.userData) born.userData.tendsLife = true;
            lastBorn = born;
            // Eine Geburt TRÄGT Leben ins Feld: hebt lebendig an der Wiege → schließt den at_field_need-Loop
            // (Mangel sinkt, der Nexus zieht weiter), die Region ergrünt. NUR dieser intentionale Pfad
            // deponiert — ambiente Fauna + Restore nie (sonst positives Feedback-Runaway in üppigen Regionen).
            this._depositLife(sx, sz);
            spawned++;
        }
        return { spawned, gruende, lastBorn };
    }

    get dslPositions() {
        if (this._dslPositionsCache) return this._dslPositionsCache;
        // Jede Zahl eines Orts liest `_dslOrtZahl` (fehlt → ihr dokumentierter Default oder kein Ort; ungültig → kein Ort),
        // jeder spieler-relative Ort `_dslSpielerOrt` (kein Spieler → kein Ort): ein Auflöser liefert einen endlichen Ort
        // oder wirft `_dslKeinOrt` mit dem Grund — nie still die Untergrenze, die 0 oder den Ursprung.
        const zahl = (op, was, v, lo, hi, def) => this._dslOrtZahl(op, was, v, lo, hi, def);
        const spieler = (op, ctx) => this._dslSpielerOrt(op, ctx);
        this._dslPositionsCache = {
            at_player: (_args, ctx) => {
                const p = spieler("at_player", ctx);
                return { x: p.x, y: p.y, z: p.z };
            },
            // Punkt des größten BEDARFS (niedrigste lebendig, via auraAt) in einem 8-Punkt-Ring um den
            // Spieler (Default-Radius 50 m): der Nexus trägt Leben dorthin, wo es FEHLT, statt Üppiges zu
            // verstärken.
            at_field_need: ([radius], ctx) => {
                const p = spieler("at_field_need", ctx);
                const r = zahl("at_field_need", "Radius", radius, 10, 120, 50);
                let best = null;
                let bestLeb = Infinity;
                for (let i = 0; i < 8; i++) {
                    const ang = (i / 8) * Math.PI * 2;
                    const sx = p.x + Math.cos(ang) * r;
                    const sz = p.z + Math.sin(ang) * r;
                    const leb = this.auraAt(sx, sz).lebendig;
                    if (leb < bestLeb) {
                        bestLeb = leb;
                        best = { x: sx, z: sz };
                    }
                }
                if (!best) throw this._dslKeinOrt("at_field_need", "at_field_need: das Feld kennt im Ring keinen Wert");
                return { x: best.x, y: p.y, z: best.z };
            },
            // Spawn-Position VOR dem Spieler statt in ihm: yaw-Vektor × dist (Default 5 m; Chat-Patterns
            // nutzen 8 m, da Standard-Strukturen ~6–10 m groß sind).
            at_player_forward: ([dist], ctx) => {
                const d = zahl("at_player_forward", "Abstand", dist, 1, 50, 5);
                const p = spieler("at_player_forward", ctx);
                // „vor dir" liest die EINE Vorwärts-Richtung (_blickVorn, waagrecht) — dieselbe wie Kamera und Phantom.
                const v = this._blickVorn(ctx.state.yaw, 0);
                return { x: p.x + v.x * d, y: p.y, z: p.z + v.z * d };
            },
            near_player: ([radius], ctx) => {
                const r = zahl("near_player", "Radius", radius, 1, 100);
                const p = spieler("near_player", ctx);
                const angle = ctx.rng() * Math.PI * 2;
                const dist = ctx.rng() * r;
                return { x: p.x + Math.cos(angle) * dist, y: p.y, z: p.z + Math.sin(angle) * dist };
            },
            // at_origin behält sein eigenes Literal — es ist semantisch der
            // Welt-Ursprung (0,50,0), nicht der Spawn-Fallback; eine Kopplung
            // an _defaultSpawnPos() wäre falsch, falls dieser je driftet.
            at_origin: () => ({ x: 0, y: 50, z: 0 }),
            random_position: ([range], ctx) => {
                const r = zahl("random_position", "Spanne", range, 1, 500);
                return { x: (ctx.rng() - 0.5) * 2 * r, y: 50, z: (ctx.rng() - 0.5) * 2 * r };
            },
            // FERNE Schale (minR..maxR) um den Spieler, JENSEITS des Cull-Radius: der Nexus baut am
            // Horizont statt auf dem Spieler (Bauten im Cull-Radius stapelten sich und wurden nie gecullt).
            // Höhe aus getTerrainHeightAt (kennt den Boden auch ungestreamt). Ohne Mindest-Abstand gibt es die Schale nicht
            // (bis 07.10. 1–2 m: das Dorf „in der Ferne" stand beim Spieler); ohne Höchst-Abstand ist sie 1 m breit.
            far_player: ([minR, maxR], ctx) => {
                const lo = zahl("far_player", "Mindest-Abstand", minR, 1, 1000);
                const hi = Math.max(lo + 1, zahl("far_player", "Höchst-Abstand", maxR, 1, 1000, lo));
                const p = spieler("far_player", ctx);
                const angle = ctx.rng() * Math.PI * 2;
                const dist = lo + ctx.rng() * (hi - lo);
                const x = p.x + Math.cos(angle) * dist;
                const z = p.z + Math.sin(angle) * dist;
                const y = this.getTerrainHeightAt(x, z);
                return { x, y, z };
            },
            // V18.492 — „am Wasser": das nächste Wasser im Umkreis, von dort zurück zum
            // Spieler bis zum ersten trockenen Ufer-Fleck (+2 m landeinwärts). Kein Wasser in Reichweite oder kein
            // trockenes Ufer zwischen Wasser und Spieler → KEIN Ort (`_dslKeinOrt` mit dem Grund, `dslEvalPos` bricht die
            // Op benannt ab, der Satz sagt es laut). Bis 06.10. fiel es still auf den Spieler-Ort — Befund V-k5: 6 Eichen
            // 3,3–7,4 m um den Spieler, der Fluss 85 m fort, der Chat „am Wasser".
            near_water: ([radius], ctx) => {
                const r = zahl("near_water", "Radius", radius, 8, 200, 60);
                const p = spieler("near_water", ctx);
                // STEHT DER SPIELER IM WASSER (Schau-2: der Vorführ-Satz am Fluss −872/−1127), ist sein Ufer der nächste
                // trockene Fleck — von ihm 2 m weiter landeinwärts (die Richtung vom Spieler weg). Bis V18.537 lief der Weg
                // zurück zum Spieler durchs Wasser, und die Zwillings-Probe nannte den Rand des Flusses Land.
                if (!this._landAt(p.x, p.z, 0.4)) {
                    const u = this._findNearestWaterPoint(p.x, p.z, r, true);
                    if (!u)
                        throw this._dslKeinOrt("near_water", `kein trockenes Ufer im Umkreis von ${Math.round(r)} m`);
                    const L = Math.hypot(u.x - p.x, u.z - p.z) || 1;
                    return { x: u.x + ((u.x - p.x) / L) * 2, y: p.y, z: u.z + ((u.z - p.z) / L) * 2 };
                }
                const w = this._findNearestWaterPoint(p.x, p.z, r);
                if (!w) throw this._dslKeinOrt("near_water", `kein Wasser im Umkreis von ${Math.round(r)} m`);
                const dx = p.x - w.x,
                    dz = p.z - w.z;
                const L = Math.hypot(dx, dz) || 1;
                // die 2 m landeinwärts enden vor dem Leib des Spielers: der Ort liegt zwischen ihm und dem Wasser, die Richtung
                // Spieler → Ort zeigt zum Wasser, und die Klemme eines Werks (`_structureSpawnPos`) schiebt es dorthin. Vorher lief der
                // Schritt über den Spieler hinaus (das Ufer 2 m vor ihm), und das Haus stand 9,25 m landein, 13 m vom Wasser
                // (gate:werk-im-wasser S am Fluss −99/−836).
                const vorSpieler = L - AnazhRealm.PLAYER_WALL_RADIUS;
                for (let s = 1; s <= Math.ceil(L); s++) {
                    const x = w.x + (dx / L) * s,
                        z = w.z + (dz / L) * s;
                    if (this._landAt(x, z, 0.4)) {
                        const weiter = Math.min(2, Math.max(0, vorSpieler - s));
                        return { x: x + (dx / L) * weiter, y: p.y, z: z + (dz / L) * weiter };
                    }
                }
                throw this._dslKeinOrt("near_water", "kein trockenes Ufer zwischen dem Wasser und dir");
            },
            // Ein Ort in Koordinaten: x, y und z sind verlangt (jeder Erzeuger — Chat, Absender, Spieler-Wille — setzt alle
            // drei); bis 07.10. wurde eine fehlende oder ungültige zur 0 bzw. 50 (`Number(null) === 0`).
            at: ([x, y, z]) => ({
                x: zahl("at", "x", x, -Infinity, Infinity),
                y: zahl("at", "y", y, -Infinity, Infinity),
                z: zahl("at", "z", z, -Infinity, Infinity),
            }),
        };
        return this._dslPositionsCache;
    }

    get dslConditions() {
        if (this._dslConditionsCache) return this._dslConditionsCache;
        this._dslConditionsCache = {
            fps_below: ([value], ctx) => (ctx.state.fps || 0) < Number(value),
            weather_is: ([name], ctx) => ctx.state.weather === name,
            time_passed: ([seconds], ctx) => this._taktUhr() - ctx.startTime >= Number(seconds),
            creatures_count_above: ([value], ctx) => ctx.state.creatures.length > Number(value),
            player_y_below: ([value], ctx) => {
                const y = ctx.state.playerMesh ? ctx.state.playerMesh.position.y : 0;
                return y < Number(value);
            },
            random_chance: ([prob], ctx) => ctx.rng() < Number(prob),
            // Ring 3: Nexus reagiert auf Player-Emotionen. `emotion_above`
            // gibt true, wenn die Achse über der Schwelle liegt. Unbekannte
            // Achsen → false (kein throw, damit DSL-Programme robust bleiben).
            // Ohne Schwelle gilt die des Spielers (`emotionThreshold`, sein Schieber) — die Gesetze des Gemüts (`_gemuetGesetze`).
            emotion_above: ([name, threshold], ctx) => {
                const p = ctx.state.player;
                const e = p && p.emotions;
                if (!e || typeof e[name] !== "number") return false;
                return e[name] > Number(threshold ?? p.emotionThreshold);
            },
            // Feld-Bedingungen: field_above/field_below([axis, value, posNode?]) lesen über auraAt (Default
            // at_player) eine frozen Achse (lebendig/dichte/glut/magieleitung) oder eine räumliche Emotions-
            // Achse (das Gedächtnis des Ortes, anders als das globale emotion_above). Unbekannte Achse → false.
            // So wird "trag Leben in den Mangel" als Regel ausdrückbar (field_below lebendig → deposit_life).
            field_above: ([axis, value, posNode], ctx) => {
                const v = this._dslFieldAxisAt(axis, posNode, ctx);
                return v !== null && v > Number(value);
            },
            field_below: ([axis, value, posNode], ctx) => {
                const v = this._dslFieldAxisAt(axis, posNode, ctx);
                return v !== null && v < Number(value);
            },
            // compound_has_tag(blueprintName, tagName, threshold): aktivierte Tag-Stärke (Form × Material,
            // max-aggregiert) ≥ threshold; unbekannt → false. Macht emergente Eigenschaften für Nexus + LLM
            // bedingungsfähig.
            compound_has_tag: ([blueprintName, tagName, threshold]) => {
                if (typeof blueprintName !== "string" || typeof tagName !== "string") return false;
                const bp = this.state.blueprints && this.state.blueprints[blueprintName];
                if (!bp) return false;
                const tags = this.computeCompoundTags(bp);
                const v = tags[tagName] || 0;
                return v >= Number(threshold);
            },
            // Welle 5 B — räumlich angereicherte Bedingung. Berücksichtigt
            // Spitze-Bonus + Kontakt-Übertragung. Wer eine pyramidische Spitze
            // mit Quarz hat, hat hier mehr magieleitung als in compound_has_tag.
            compound_has_spatial_tag: ([blueprintName, tagName, threshold]) => {
                if (typeof blueprintName !== "string" || typeof tagName !== "string") return false;
                const bp = this.state.blueprints && this.state.blueprints[blueprintName];
                if (!bp) return false;
                const tags = this.computeSpatialTags(bp);
                const v = tags[tagName] || 0;
                return v >= Number(threshold);
            },
            not: ([sub], ctx) => !this.dslEvalCond(sub, ctx),
            and: (subs, ctx) => subs.every((s) => this.dslEvalCond(s, ctx)),
            or: (subs, ctx) => subs.some((s) => this.dslEvalCond(s, ctx)),
        };
        return this._dslConditionsCache;
    }
}
_stammZonen(AnazhRealm, [AnazhRealm_feld_dsl]);

// ===== ATLAS · Feld/dsl — Außen-Konstanten =====
// DIE VORLAGEN DER GESETZE (ultiversum.K4): die Sätze, die das Spiel dem Spieler als Beispiel zeigt (Gesetze-Liste, „zeige
// regeln"). Ein Gesetz aus einer Vorlage ist kein geschriebenes — die Mehrspieler-Wand (gate:mp-sync (h)) scheidet es über
// den Hash (`_regelHash`) des Programms, das der EINE Satz-Parser (`_regelAusSatz`) aus ihm baut.
AnazhRealm.GESETZ_VORLAGEN = Object.freeze(["wann immer es regnet, dann setze wetter sunny"]);
AnazhRealm.WORLD_RULES = Object.freeze({
    cap: 64,
    budgetPerFrame: 4,
    defaultEverySec: 2,
    minEverySec: 0.5,
    // Phase C — Komposition
    composeRuleProb: 0.35, // Anteil der Nexus-Evolutionen, die eine REGEL sind (statt einer Geste)
    ruleEverySecMin: 1, // komponierte Regeln feuern alle 1–5 s
    ruleEverySecMax: 5,
    ruleTtlMin: 30, // Lebens-Fenster einer Nexus-Regel (30–90 s; Fitness erneuert sie)
    ruleTtlMax: 90,
    mutateSurvivorProb: 0.4, // P(eine neue Nexus-Regel ist ein mutierter Nachkomme eines Überlebenden)
    // Phase C — Fitness (per-Regel, attributierbar: Kosten + Erfolg + Engagement)
    costBudgetMs: 4, // ein Regel-Effekt sollte < ~4 ms kosten (sonst Cost-Penalty)
    renewFitness: 0.5, // ab dieser Fitness wird eine Nexus-Regel am ttl-Ende erneuert
    // Gesetzes-Faden: ein Gesetz, das binnen dieser Frist gefeuert hat, gilt als „feuert gerade"
    // (Live-Puls der Gesetze-Console); > ruleEverySecMax (5) → ein aktives Gesetz pulst durchgehend.
    threadRecentSec: 6,
});
// DAS GESETZ DER WERTE (KI H1, 20.10.): ein Op mit begrenztem Wert nennt ihn HIER — die KI liest ihn im Prompt
// (`_dslVokabular`), `dslEval` weist einen Wert außerhalb benannt ab (`invalid_wert`, die Absage nennt das Gesetz). Bis 20.10.
// verwarfen die Ops ihn still, der Chat sagte „Welt verändert" und nichts geschah (qwen3:4b-instruct am Korpus:
// ["set_time_of_day","night"], ["weather","thunderstorm"]); der Leib und die Schwerkraft klemmten den Wunsch auf den Rand,
// und der Chat meldete den Wunsch („Sprungkraft auf 1.2"). Je Op: [Argument, Prüfung (Wert, Welt), Gesetz in Worten (Welt)].
AnazhRealm.DSL_WERTE = (() => {
    const zahlIn = (v, lo, hi) => v != null && v !== "" && Number(v) >= lo && Number(v) <= hi;
    // das Band des Leibs (`_koerperGesetzBand`) mit dem Wert von jetzt
    const leib = (stat) => [
        0,
        (v, r) => (({ min, max }) => zahlIn(v, min - 1e-6, max + 1e-6))(r._koerperGesetzBand(stat)),
        (r) =>
            (({ min, max }) => `${min.toFixed(2)}–${max.toFixed(2)}, jetzt ${Number(r.state[stat]).toFixed(2)}`)(
                r._koerperGesetzBand(stat)
            ),
    ];
    return Object.freeze({
        weather: [
            0,
            (v) => v === "frei" || Object.hasOwn(AnazhRealm.WEATHER_INTENSITY, v),
            () => [...Object.keys(AnazhRealm.WEATHER_INTENSITY), "frei"].join(" | "),
        ],
        set_time_of_day: [
            0,
            (v) => zahlIn(v, 0, 1),
            () => "0–1 (0 Mitternacht, 0.25 Sonnenaufgang, 0.5 Mittag, 0.75 Sonnenuntergang)",
        ],
        creatures_emotion: [0, (v) => v === "happy" || v === "sad", () => "happy | sad"],
        spawn_creature: [2, (v) => v == null || v === "happy" || v === "sad", () => "emotion: happy | sad"],
        // die zwei Arten der Grammatik-Bäume; jede andere Art (Birke, Tanne …) wächst aus dem Studio-Buch (spawn_studio)
        spawn_tree: [
            2,
            (v) => v == null || v === "eiche" || v === "kiefer",
            () => "kind: eiche | kiefer — jede andere Art: spawn_studio",
        ],
        gravity: [0, (v) => zahlIn(v, -30, 0), (r) => `-30–0 (Erde -9.81, jetzt ${r.state.gravity})`],
        player_jump_power: leib("jumpPower"),
        player_speed: leib("speed"),
    });
})();
AnazhRealm.DSL_WELTAKTE = Object.freeze([
    "spawn_creature",
    "spawn_tree",
    "spawn_studio",
    "spawn_island",
    "spawn_ufo",
    "spawn_village",
    "spawn_temple",
    "spawn_waterfall",
    "spawn_blueprint",
    "spawn_fractal",
    "remove_architecture",
    "apply_op",
    "apply_connection",
    "set_portal",
    "set_visible",
    "voxel_carve",
    "voxel_fill",
    "lava",
    "terrain_steepness",
    "terrain_base_height",
    "gravity",
    "set_time_of_day",
    "set_season",
    "skybox_color",
    "creatures_color",
    "creatures_emotion",
    "creatures_speed_mul",
    "creatures_size_mul",
    "creature_task",
    "creature_task_nearest",
    "creature_task_all",
    "damage_creature",
    "creature_equip_tool",
    "creature_equip_armor",
    "creature_unequip",
    "creature_apply_boost",
    "player_jump_power",
    "player_speed",
    "player_soul",
    "damage",
    "apply_boost",
    "equip_tool",
    "equip_armor",
    "equip_weapon",
    "unequip",
    "add_to_inventory",
    "set_mode",
    "deposit_life",
    "deposit_emotion",
]);

// V17.23 Sky-Harmonie — die maximale Blend-Stärke der DSL/Mood-Himmels-Tönung
// gegen die Tag-Nacht-Farbe (0.6 = die Tönung bis 60 %, der Tag-Nacht-Himmel
// bleibt zu 40 % sichtbar → die Tageszeit überlebt). Browser-justierbar.
AnazhRealm.SKY_TINT_MAX = 0.6;
