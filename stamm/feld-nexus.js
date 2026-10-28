class AnazhRealm_feld_nexus {
    // ===== ATLAS · Feld/nexus — Nexus: Fitness · Mutation · Komposition · Gesten-Regeln =====
    // ### Nexus-Generator ###
    // Rekursive, gewichtete Random-Komposition; die Tiefe deckt sich mit dem Interpreter-Budget,
    // atomare Effekte dominieren (~40 % der Auswahl).

    // Fitness-Selektion: mit ~30 % zieht der Generator ein Programm aus state.dsl.history
    // (Roulette-Wheel über die Fitness) und mutiert es leicht — der Nexus lernt aus eigenen Outcomes.
    dslSelectByFitness(rng, opts = {}) {
        const source = Array.isArray(opts.history) ? opts.history : this.state.dsl.history;
        if (!Array.isArray(source) || source.length === 0) return null;
        const entries = source.filter(
            (h) => h && Array.isArray(h.program) && h.outcome && typeof h.outcome.fpsBefore === "number"
        );
        if (entries.length === 0) return null;
        // Gewicht = die FINALISIERTE Fitness (computeMultiDimFitness: Emotion + Activity + FPS); der
        // fpsDamage-Proxy nur für un-finalisierte Einträge (fpsDamage > 100 → Floor 0.05, damit schlechte
        // Programme nicht ganz aussterben — Diversität).
        const weights = entries.map((e) => {
            if (e.finalized && Number.isFinite(e.fitness)) return Math.max(0.05, e.fitness);
            const fpsDmg = Math.max(0, e.outcome.fpsBefore - e.outcome.fpsAfter);
            const raw = e.ok === false ? 0 : 1 - fpsDmg / 100;
            return Math.max(0.05, raw);
        });
        const total = weights.reduce((s, w) => s + w, 0);
        let r = rng() * total;
        for (let i = 0; i < entries.length; i++) {
            r -= weights[i];
            if (r <= 0) return entries[i].program;
        }
        return entries[entries.length - 1].program;
    }

    // Leichte AST-Mutation: clone + ein Knoten getauscht (gewichtet: Atom-Tausch, Zahl-Verschiebung,
    // Sub-Tree-Ersatz). Die Mutations-Tiefe ist hart begrenzt, damit verschachtelte Eltern intakt bleiben.
    dslMutate(program, rng) {
        if (!Array.isArray(program) || program.length === 0) return program;
        const clone = JSON.parse(JSON.stringify(program));
        const nodes = [];
        const walk = (node, parent, indexInParent) => {
            if (!Array.isArray(node) || node.length === 0) return;
            nodes.push({ node, parent, indexInParent });
            for (let i = 1; i < node.length; i++) {
                if (Array.isArray(node[i])) walk(node[i], node, i);
            }
        };
        walk(clone, null, -1);
        if (nodes.length === 0) return clone;
        const target = nodes[Math.floor(rng() * nodes.length)];
        const choice = rng();
        if (choice < 0.4 && target.parent) {
            // Sub-Tree durch neues Atom ersetzen.
            target.parent[target.indexInParent] = this.dslComposeAtomic(rng);
            return clone;
        }
        if (choice < 0.8) {
            // Zahlen-Argumente im Ziel-Knoten leicht verschieben (±20 %).
            const node = target.node;
            const numIdxs = [];
            for (let i = 1; i < node.length; i++) {
                if (typeof node[i] === "number") numIdxs.push(i);
            }
            if (numIdxs.length > 0) {
                const idx = numIdxs[Math.floor(rng() * numIdxs.length)];
                const factor = 0.8 + rng() * 0.4;
                node[idx] = Number((node[idx] * factor).toFixed(3));
                return clone;
            }
        }
        // Fallback: ganzes Top-Level-Programm durch frisches Atom ersetzen
        // (sehr seltene Mutation). Wir behalten die `chain`-Wurzel, falls
        // vorhanden — sonst zerstört Mutation die Struktur.
        if (Array.isArray(clone) && clone[0] === "chain" && clone.length > 1) {
            clone[1] = this.dslComposeAtomic(rng);
        }
        return clone;
    }

    // Schicht 1 — Pattern-Memory-Lookup. Liest die jüngsten Spieler-Keywords
    // und sucht in `state.dsl.patternMemory` nach gut-bewerteten Programmen.
    // Roulette-Selektion innerhalb des Treffer-Sets (Gewicht = Fitness).
    dslSelectByPattern(rng) {
        const recent = this.state.dsl && this.state.dsl.recentKeywords;
        const memory = this.state.dsl && this.state.dsl.patternMemory;
        if (!Array.isArray(recent) || !memory) return null;
        const candidates = [];
        for (const entry of recent) {
            const list = memory[entry.keyword];
            if (!Array.isArray(list)) continue;
            for (const item of list) {
                if (Array.isArray(item.program) && typeof item.fitness === "number") {
                    candidates.push({ program: item.program, weight: Math.max(0.05, item.fitness) });
                }
            }
        }
        if (candidates.length === 0) return null;
        const total = candidates.reduce((s, c) => s + c.weight, 0);
        let r = rng() * total;
        for (const c of candidates) {
            r -= c.weight;
            if (r <= 0) return c.program;
        }
        return candidates[candidates.length - 1].program;
    }

    dslCompose(opts = {}) {
        // die Komposition würfelt aus dem Welt-Strom (Γ5), nie aus Math.random
        const rng = opts.rng || this._samenStrom(this._bauSame("komposition"));
        const maxDepth = opts.maxDepth || 5;
        // Schicht 1 — Wenn Spieler-Keywords im Memory liegen: mit ~25 %
        // ein Pattern-Programm wählen (Themen-Antwort). Sonst weiter im
        // bisherigen Pfad: History-Selection (~30 %) oder Random.
        const patternProbability = opts.patternProbability ?? 0.25;
        const recent = this.state.dsl && this.state.dsl.recentKeywords;
        const memory = this.state.dsl && this.state.dsl.patternMemory;
        const hasPattern =
            opts.usePattern !== false &&
            Array.isArray(recent) &&
            recent.length > 0 &&
            memory &&
            Object.keys(memory).length > 0;
        if (hasPattern && rng() < patternProbability) {
            const picked = this.dslSelectByPattern(rng);
            if (picked) return this.dslMutate(picked, rng);
        }
        // Mit ~30 % Wahrscheinlichkeit: Selektion + Mutation statt Random.
        // History-Mindestgröße 3 verhindert, dass die ersten Generationen
        // sich selbst nachkopieren, bevor genug Outcome-Daten da sind.
        const historySource = Array.isArray(opts.history) ? opts.history : this.state.dsl.history;
        const useHistory =
            opts.useHistory !== false &&
            Array.isArray(historySource) &&
            historySource.length >= 3 &&
            rng() < (opts.historyProbability ?? 0.3);
        if (useHistory) {
            const picked = this.dslSelectByFitness(rng, { history: historySource });
            if (picked) return this.dslMutate(picked, rng);
        }
        const composeAt = (depth) => {
            if (depth >= maxDepth) return this.dslComposeAtomic(rng);
            const r = rng();
            if (r < 0.2) {
                const n = 2 + Math.floor(rng() * 3);
                const subs = [];
                for (let i = 0; i < n; i++) subs.push(composeAt(depth + 1));
                return ["chain", ...subs];
            }
            if (r < 0.3) {
                const seconds = Number((0.5 + rng() * 4.5).toFixed(2));
                return ["delay", seconds, composeAt(depth + 1)];
            }
            if (r < 0.4) {
                return ["repeat", 2 + Math.floor(rng() * 4), composeAt(depth + 1)];
            }
            if (r < 0.5) {
                const n = 2 + Math.floor(rng() * 2);
                const subs = [];
                for (let i = 0; i < n; i++) subs.push(composeAt(depth + 1));
                return ["random", ...subs];
            }
            if (r < 0.6) {
                const cond = this.dslComposeCondition(rng);
                const thenBranch = composeAt(depth + 1);
                if (rng() < 0.4) return ["when", cond, thenBranch, composeAt(depth + 1)];
                return ["when", cond, thenBranch];
            }
            return this.dslComposeAtomic(rng);
        };
        return ["chain", composeAt(0)];
    }

    dslComposeAtomic(rng) {
        // NICHT im Pool: terrain_steepness/terrain_base_height — sie wirken erst beim nächsten Worldgen,
        // neue Chunks bekämen andere Höhen → Klippe an der Naht. Emotion biast die Komposition sanft
        // (joy → sunny/happy, sorrow → rainy/sad, max ±0.3 um 0.5) — erkundend, nicht spiegelnd.
        const e = (this.state.player && this.state.player.emotions) || {};
        // === Der Nexus liest das Feld (docs/das-lebendige-feld.md §2/§3.1) ===
        // auraAt am Spieler → resonante Komposition: spawn_creature-Gewicht ∝ lebendig, Farbe via
        // dslComposeFieldColor, Wetter mitgestimmt (s. u.). Ohne playerMesh = neutrales Feld.
        const pm = this.state.playerMesh && this.state.playerMesh.position;
        const aura = pm && typeof this.auraAt === "function" ? this.auraAt(pm.x, pm.z) : null;
        const fLebendig = aura ? aura.lebendig : 0.5;
        const fGlut = aura ? aura.glut : 0;
        // === Harmonie statt Überschreiben ===
        // Emotion UND Feld formen die Wetter-Stimmung parallel, der Spieler-Wille FÜHRT: emoSignal =
        // |joy−sorrow| (0..1), der Feld-Anteil skaliert mit (1−emoSignal). joy=1 → Feld-Anteil 0 → sunny
        // dominiert (per Konstruktion); idle → die Region scheint durch.
        const emoTerm = (e.joy || 0) * 0.3 - (e.sorrow || 0) * 0.3;
        const emoSignal = Math.min(1, Math.abs((e.joy || 0) - (e.sorrow || 0)));
        const fieldMood = ((fLebendig - 0.5) * 0.4 - fGlut * 0.3) * (1 - emoSignal);
        const sunnyBias = Math.max(0.05, Math.min(0.95, 0.5 + emoTerm + fieldMood));
        const happyBias = sunnyBias;
        const choices = [
            { w: 15, build: () => ["weather", rng() < sunnyBias ? "sunny" : "rainy"] },
            {
                // Der Nexus nährt Leben, wo das Feld lebt: das Gewicht wächst mit
                // lebendig (~7 in karger, 12 bei neutral, ~17 in üppiger Region).
                w: Math.round(12 * (0.6 + fLebendig * 0.8)),
                build: () => [
                    "spawn_creature",
                    // ~50 % der Nexus-Kreaturen gehen zum Punkt des größten BEDARFS (at_field_need, niedrigste
                    // lebendig im Ring 30–80 m), die andere Hälfte erkundet frei (dslComposePosition).
                    rng() < 0.5
                        ? ["at_field_need", Number((30 + rng() * 50).toFixed(1))]
                        : this.dslComposePosition(rng),
                    1 + Math.floor(rng() * 5),
                    rng() < happyBias ? "happy" : "sad",
                ],
            },
            { w: 10, build: () => ["creatures_emotion", rng() < happyBias ? "happy" : "sad"] },
            { w: 8, build: () => ["creatures_color", this.dslComposeFieldColor(rng, aura)] },
            { w: 8, build: () => ["skybox_color", this.dslComposeFieldColor(rng, aura)] },
            // KEIN WÜRFEL SCHREIBT EIN KÖRPER-GESETZ (Leben-Schau 07.10., Neu 1): Gang, Sprung und Größe stehen nicht im
            // Pool — der Würfel setzte dem Spieler Gehen 4–12 und Sprungkraft 8–20 zu und blähte die Tiere ohne Achse auf.
            // KEIN WÜRFEL SCHREIBT DIE UHR (Leben-Schau 2, 09.10.): die Uhr gehört dem Spieler (`_himmelSchreiber`) — der
            // Tageszeit-Wurf (Gewicht 5) und seine Mutationen in Nexus-Gesetzen warfen sie 30-mal in 160 s.
            // Der Nexus baut via far_player in eine FERNE Schale (180–380 m, JENSEITS des 150-m-Cull-Radius):
            // nah am Spieler stapelten sich Bauten und wurden nie gecullt (sceneChildren-Leck). Dazu der Cap
            // _capNexusStructures (MAX_NEXUS_STRUCTURES, Fernstes verblasst) und niedrige Gewichte (2/2/2/1)
            // → die Welt füllt sich gemächlich, hortet nicht.
            { w: 2, build: () => ["spawn_village", ["far_player", 180, 380]] },
            { w: 2, build: () => ["spawn_temple", ["far_player", 180, 380]] },
            { w: 2, build: () => ["spawn_waterfall", ["far_player", 180, 380]] },
            {
                w: 1,
                build: () => {
                    const types = ["village", "temple", "waterfall"];
                    return [
                        "spawn_fractal",
                        ["far_player", 220, 400],
                        types[Math.floor(rng() * types.length)],
                        1,
                        Number((0.4 + rng() * 0.3).toFixed(2)),
                    ];
                },
            },
            // KEIN WÜRFEL SPRICHT (affekt.K4): der Nexus würfelte ~10 % `say` aus einem Pool („Ich versuche etwas Neues.") —
            // eine Zeile ohne Tat in der Dialog-Box. Was er tut, sagt die Stimme des Felds mit Ort, Ursache und Gesetz.
        ];
        return this.dslWeightedPick(choices, rng);
    }

    dslComposePosition(rng) {
        const choices = [
            { w: 4, build: () => ["at_player"] },
            { w: 4, build: () => ["near_player", Number((5 + rng() * 25).toFixed(2))] },
            { w: 2, build: () => ["at_origin"] },
            { w: 2, build: () => ["random_position", Number((20 + rng() * 80).toFixed(2))] },
        ];
        return this.dslWeightedPick(choices, rng);
    }

    dslComposeCondition(rng) {
        const choices = [
            { w: 4, build: () => ["random_chance", Number((0.3 + rng() * 0.4).toFixed(2))] },
            { w: 3, build: () => ["weather_is", rng() < 0.5 ? "rainy" : "sunny"] },
            { w: 2, build: () => ["fps_below", 60] },
            { w: 2, build: () => ["creatures_count_above", 5] },
            { w: 1, build: () => ["time_passed", Number((5 + rng() * 30).toFixed(2))] },
        ];
        return this.dslWeightedPick(choices, rng);
    }

    // === Der Nexus komponiert REGELN ===
    // Eine komponierte Regel LIEST das Feld (dslComposeRuleCondition) und SCHREIBT es
    // (dslComposeRuleEffect); die lokale Aura biast Achse + Farbe. EPHEMER (ttlSec) → die Fitness
    // erneuert oder verfällt sie. Nur reaktiv-sichere Effekte (kein frozen Worldgen).
    dslComposeRule(rng) {
        const cfg = AnazhRealm.WORLD_RULES;
        const pm = this.state.playerMesh && this.state.playerMesh.position;
        const aura = pm && typeof this.auraAt === "function" ? this.auraAt(pm.x, pm.z) : null;
        const cond = this.dslComposeRuleCondition(rng, aura);
        const effect = this.dslComposeRuleEffect(rng, aura);
        const everySec = Number((cfg.ruleEverySecMin + rng() * (cfg.ruleEverySecMax - cfg.ruleEverySecMin)).toFixed(1));
        const ttlSec = Math.round(cfg.ruleTtlMin + rng() * (cfg.ruleTtlMax - cfg.ruleTtlMin));
        return ["rule", cond, effect, { everySec, ttlSec }];
    }

    // Die Bedingung einer Nexus-Regel — der Kern: Regeln LESEN das lebendige Feld
    // (field_below/field_above), resonant zur lokalen Aura, plus Zustands-Bedingungen.
    dslComposeRuleCondition(rng, aura) {
        const emoAxis = ["sorrow", "joy", "awe", "hope"][Math.floor(rng() * 4)];
        const strongField =
            aura && aura.glut > 0.5 ? "glut" : aura && aura.magieleitung > 0.5 ? "magieleitung" : "lebendig";
        const choices = [
            // Feld-Mangel (der Heilungs-Auslöser, V17.26 als Regel): „wo Leben fehlt"
            { w: 5, build: () => ["field_below", "lebendig", Number((0.2 + rng() * 0.3).toFixed(2))] },
            // Feld-Fülle (resonant zur stärksten lokalen Achse)
            { w: 3, build: () => ["field_above", strongField, Number((0.4 + rng() * 0.4).toFixed(2))] },
            // räumliche Emotion am Ort (das Gedächtnis des Ortes)
            { w: 2, build: () => ["field_above", emoAxis, Number((0.3 + rng() * 0.3).toFixed(2))] },
            // Zustands-Bedingungen (reuse)
            { w: 3, build: () => ["random_chance", Number((0.3 + rng() * 0.4).toFixed(2))] },
            { w: 2, build: () => ["weather_is", rng() < 0.5 ? "rainy" : "sunny"] },
        ];
        return this.dslWeightedPick(choices, rng);
    }

    // Effekt einer Nexus-Regel: schreibt das Feld (deposit_life/deposit_emotion) + leichte reaktive
    // Effekte. Bewusst nur der reaktiv-sichere Satz (kein terrain_*, voxel_*, spawn_village …) — der
    // Nexus pflügt die Welt nicht um (Determinismus, by construction).
    dslComposeRuleEffect(rng, aura) {
        const posNeed = rng() < 0.6 ? ["at_field_need", Number((30 + rng() * 50).toFixed(1))] : ["at_player"];
        const joyAxis = ["joy", "hope", "peace", "awe"][Math.floor(rng() * 4)];
        const choices = [
            // Feld-SCHREIB-Effekte (der Star: die Welt reguliert sich selbst per Regel)
            { w: 6, build: () => ["deposit_life", posNeed] },
            { w: 3, build: () => ["deposit_emotion", joyAxis, Number((0.3 + rng() * 0.5).toFixed(2)), ["at_player"]] },
            // leichte reaktive Effekte (reuse, alle billig + reaktiv-sicher)
            { w: 3, build: () => ["weather", rng() < 0.5 ? "sunny" : "rainy"] },
            { w: 3, build: () => ["creatures_emotion", rng() < 0.6 ? "happy" : "sad"] },
            { w: 2, build: () => ["creatures_color", this.dslComposeFieldColor(rng, aura)] },
            {
                w: 2,
                build: () => [
                    "spawn_creature",
                    rng() < 0.5 ? ["at_field_need"] : ["at_player"],
                    1 + Math.floor(rng() * 2),
                    rng() < 0.6 ? "happy" : "sad",
                ],
            },
        ];
        return this.dslWeightedPick(choices, rng);
    }

    // Neue Nexus-Regel: mit mutateSurvivorProb ein MUTIERTER Nachkomme eines bewährten Überlebenden
    // (Heredität → Evolution statt nur Selektion), sonst frisch komponiert. Eine ungültig mutierte
    // Regel feuert nie/harmlos (eval ist try/catch-gewandet) → die Fitness pruned sie.
    _composeNexusRule(rng) {
        const cfg = AnazhRealm.WORLD_RULES;
        const survivors = (this.state.worldRules || []).filter(
            (r) => r.source === "nexus" && (r.fires || 0) > 0 && (r.fitness || 0) >= cfg.renewFitness
        );
        if (survivors.length > 0 && rng() < cfg.mutateSurvivorProb) {
            // V17.43 Phase 2 — wert-GEWICHTETE Elternschaft (gerichtete Evolution Richtung
            // Heilung, nicht zufällig): P(Elter) ∝ valueScore (0.5 + 0.5·value, Floor 0.05
            // → auch ein neutraler Überlebender kann Elter werden). Heiler descenden öfter.
            const weight = (r) => Math.max(0.05, 0.5 + 0.5 * (r.value || 0));
            let total = 0;
            for (const s of survivors) total += weight(s);
            let pick = rng() * total;
            let parent = survivors[survivors.length - 1];
            for (const s of survivors) {
                pick -= weight(s);
                if (pick <= 0) {
                    parent = s;
                    break;
                }
            }
            const prog = ["rule", parent.cond, parent.effect, { everySec: parent.everySec, ttlSec: parent.ttlSec }];
            const mutated = this.dslMutate(prog, rng);
            // dslMutate hält den "rule"-Kopf (der Fallback ersetzt nur einen chain-Kopf)
            // → ein Nachkomme bleibt eine Regel; sicherheitshalber prüfen.
            return Array.isArray(mutated) && mutated[0] === "rule" ? mutated : prog;
        }
        return this.dslComposeRule(rng);
    }

    // Geste → Gesetz: sucht in der finalisierten history die wiederholt bewährte Geste (gleicher
    // Op-Kopf, ≥ minRuns, max. Ø-Fitness); der BESTE Lauf wird der Effekt, die Ø-Emotions-Signatur
    // der guten Läufe (emotionsBefore via _emotionState) die Bedingung. Registrierung durch DIESELBE
    // Tür wie jede Nexus-Evolution (nexusEvolutionQueue → ruleRegisterCost → rule-Op →
    // _registerWorldRule, Whitelist _isRuleEffectAllowed) — kein Parallel-Pfad. Aus _loopSelfAnalysis.
    _crystallizeGestureRule(currentTime) {
        const dsl = this.state.dsl;
        if (!dsl || !Array.isArray(dsl.history)) return null;
        const cfg = AnazhRealm.GESTURE_CRYSTAL;
        const last = Number.isFinite(dsl.lastCrystallizeAt) ? dsl.lastCrystallizeAt : -Infinity;
        if (currentTime - last < cfg.cooldownSec) return null;
        dsl.lastCrystallizeAt = currentTime;
        const groups = new Map();
        for (const h of dsl.history) {
            if (!h || !h.finalized || !Array.isArray(h.program)) continue;
            if ((h.fitness || 0) < cfg.minFitness) continue;
            const head = h.program[0];
            if (head === "rule" || head === "chain") continue; // Gesetze gebären keine Gesetze
            if (!this._isRuleEffectAllowed(h.program)) continue; // nur die reaktive Welt
            if (!groups.has(head)) groups.set(head, []);
            groups.get(head).push(h);
        }
        let best = null;
        let bestAvg = 0;
        for (const [key, list] of groups) {
            if (list.length < cfg.minRuns) continue;
            const avg = list.reduce((a, h) => a + (h.fitness || 0), 0) / list.length;
            if (avg > bestAvg) {
                bestAvg = avg;
                best = { key, list };
            }
        }
        if (!best) return null;
        const top = best.list.reduce((a, h) => ((h.fitness || 0) > (a.fitness || 0) ? h : a), best.list[0]);
        // Ø-Emotions-Signatur über die bewährten Läufe (E5).
        const avgEmo = {};
        let n = 0;
        for (const h of best.list) {
            const e = h.outcome && h.outcome.emotionsBefore;
            if (!e) continue;
            n++;
            for (const k in e) avgEmo[k] = (avgEmo[k] || 0) + (e[k] || 0);
        }
        if (n > 0) for (const k in avgEmo) avgEmo[k] /= n;
        const es = n > 0 && typeof this._emotionState === "function" ? this._emotionState(avgEmo) : null;
        const cond =
            es && es.dominant && es.intensity >= cfg.minEmotionIntensity
                ? ["field_above", es.dominant, Number((es.intensity * 0.6).toFixed(2))]
                : ["random_chance", 0.35];
        const W = AnazhRealm.WORLD_RULES;
        const program = ["rule", cond, top.program, { everySec: 8, ttlSec: W.ruleTtlMax }];
        // kein Doppel-Kristall derselben Signatur (die Queue soll nicht
        // wiederholt Wirk zahlen; registerWorldRule dedupt zusätzlich).
        const sig = JSON.stringify([cond, top.program]);
        if (dsl.lastCrystalSig === sig) return null;
        dsl.lastCrystalSig = sig;
        this.state.nexusEvolutionQueue.push({ name: `kristall_${best.key}`, program, source: "nexus" });
        this.log(
            `Eine bewährte Geste kristallisiert zum Gesetz: ${best.key} (Ø ${bestAvg.toFixed(2)}` +
                (es && es.dominant && es.intensity >= cfg.minEmotionIntensity ? `, geboren aus ${es.dominant})` : ")"),
            "INFO"
        );
        return program;
    }

    dslComposeColor(rng) {
        const palette = ["#ff7a59", "#7bd389", "#5ec0eb", "#d4a3ff", "#f7d358", "#e94c89", "#88e1e1", "#a89070"];
        return palette[Math.floor(rng() * palette.length)];
    }

    // Resonante Farbwahl: prägt eine Feld-Achse den Ort deutlich (> 0.6), wählt der Nexus
    // wahrscheinlicher resonant (magieleitung → Lila, glut → Feuer, lebendig → Grün), sonst die freie
    // Palette. aura null (kein playerMesh) → freie Palette.
    dslComposeFieldColor(rng, aura) {
        // V18.464 — die Achsen-Farben lesen die EINE Tabelle (ACHSEN_FARBE):
        // dieselben Hexe streuten frei zwischen Nexus-Farbwahl und Emotions-
        // Triggern (Parallelpfad-Klasse).
        const AF = AnazhRealm.ACHSEN_FARBE;
        if (aura) {
            if (aura.magieleitung > 0.6 && rng() < aura.magieleitung) return AF.magieleitung;
            if (aura.glut > 0.6 && rng() < aura.glut) return AF.glut;
            if (aura.lebendig > 0.6 && rng() < aura.lebendig) return AF.lebendig;
        }
        return this.dslComposeColor(rng);
    }

    dslWeightedPick(choices, rng) {
        const total = choices.reduce((s, c) => s + c.w, 0);
        let r = rng() * total;
        for (const c of choices) {
            r -= c.w;
            if (r <= 0) return c.build();
        }
        return choices[choices.length - 1].build();
    }

    // ### Schicht 1 — IQ-Schicht: Pfad-Buckets, Multi-Dim-Fitness, Pattern-Memory ###
    // Kompakte evolutionäre Lernschicht ohne Neural Net: Buckets (wo hält sich der Spieler auf) und
    // Pattern-Memory (welche Themen führten zu guten Programmen) biasen dslCompose — lesbar,
    // persistierbar, ohne Vendor-Lib.

    // Stoppwörter raus, Token mit Min-Länge 3 zurück. Bewusst klein — wir
    // wollen Substantive aus Chat-Befehlen, keine vollständige NLP.
    pathExtractKeywords(text) {
        if (typeof text !== "string") return [];
        const stop = new Set([
            "der",
            "die",
            "das",
            "den",
            "dem",
            "ein",
            "eine",
            "einen",
            "einem",
            "eines",
            "und",
            "oder",
            "ist",
            "sind",
            "mit",
            "von",
            "für",
            "auf",
            "aus",
            "bei",
            "zur",
            "zum",
            "ich",
            "du",
            "mir",
            "mich",
            "dir",
            "dich",
            "wir",
            "ihr",
            "sie",
            "es",
            "sein",
            "seine",
            "seiner",
            "alle",
            "kein",
            "nicht",
            "schon",
            "auch",
            "nur",
            "mal",
            "bitte",
            "welt",
            "mich",
            "mir",
            "this",
            "that",
            "with",
            "from",
            "the",
        ]);
        const tokens = text
            .toLowerCase()
            .replace(/[^a-zäöüß0-9\s]+/g, " ")
            .split(/\s+/)
            .map((t) => t.trim())
            .filter((t) => t.length >= 3 && !stop.has(t));
        return [...new Set(tokens)].slice(0, 6);
    }

    // Gefüttert aus processChatCommand: jedes Keyword lebt ~60 s im Window (dann beim nächsten
    // Sample-Tick geräumt) — so lernen nur Programme, die thematisch nah am Chat sind.
    rememberChatKeywords(text, currentTime) {
        const kws = this.pathExtractKeywords(text);
        if (kws.length === 0) return;
        const recent = this.state.dsl.recentKeywords;
        for (const kw of kws) {
            const idx = recent.findIndex((e) => e.keyword === kw);
            if (idx >= 0) recent.splice(idx, 1);
            recent.unshift({ keyword: kw, at: currentTime });
        }
        const cap = this.state.dsl.recentKeywordsCap || 20;
        if (recent.length > cap) recent.length = cap;
    }

    // Sliding-Window-Cleanup. 60 s alte Keywords fliegen raus.
    pruneRecentKeywords(currentTime) {
        const recent = this.state.dsl.recentKeywords;
        if (!Array.isArray(recent) || recent.length === 0) return;
        const cutoff = currentTime - 60;
        for (let i = recent.length - 1; i >= 0; i--) {
            if (recent[i].at < cutoff) recent.splice(i, 1);
        }
    }

    // Sample wo der Spieler steht / was er tut. Pro Frame zu teuer; daher
    // pathSampleInterval (2 s). Decay auf alle Buckets nach jedem Sample
    // (0.99) verhindert dass frühe Verteilungen ewig dominieren.
    samplePathBuckets(currentTime) {
        const p = this.state.player;
        if (!p || !this.state.playerMesh) return;
        if (currentTime - p.pathLastSample < p.pathSampleInterval) return;
        p.pathLastSample = currentTime;
        const pos = this.state.playerMesh.position;
        const heightKey = pos.y < 30 ? "low" : pos.y < 60 ? "mid" : "high";
        const distXZ = Math.sqrt(pos.x * pos.x + pos.z * pos.z);
        const distKey = distXZ < 30 ? "center" : distXZ < 80 ? "mid" : "edge";
        const weatherKey = this.state.weather || "sunny"; // D5a: polyvalent — stormy ist ein eigener Lern-Key
        const moves = p.recentActivity.moves || 0;
        const jumps = p.recentActivity.jumps || 0;
        const activityKey = jumps > 0 ? "jumping" : moves > 1 ? "walking" : "still";
        const b = p.pathBuckets;
        for (const group of Object.values(b)) {
            for (const k of Object.keys(group)) group[k] *= 0.99;
        }
        b.height[heightKey] = (b.height[heightKey] || 0) + 1;
        b.distance[distKey] = (b.distance[distKey] || 0) + 1;
        b.weather[weatherKey] = (b.weather[weatherKey] || 0) + 1;
        b.activity[activityKey] = (b.activity[activityKey] || 0) + 1;
    }

    // Frame-Hook: Bewegung/Sprung beobachten und in `recentActivity` zählen.
    // Wird vom Outcome-Finalizer (5 s nach Programm-Lauf) gelesen, um die
    // Activity-Dimension der Fitness zu speisen.
    samplePlayerActivity(currentTime) {
        const p = this.state.player;
        if (!p || !this.state.playerVel) return;
        const v = this.state.playerVel;
        const speed2 = v.x() * v.x() + v.z() * v.z();
        if (speed2 > 0.16) p.recentActivity.moves++;
        if (this.state.isJumping && !p.recentActivity._prevJumping) p.recentActivity.jumps++;
        p.recentActivity._prevJumping = !!this.state.isJumping;
        if (currentTime - p.recentActivity.since > 30) {
            // Sanftes Decay alle 30 s, damit Zähler nicht ins Unendliche wachsen.
            p.recentActivity.moves = Math.floor(p.recentActivity.moves * 0.5);
            p.recentActivity.jumps = Math.floor(p.recentActivity.jumps * 0.5);
            p.recentActivity.chats = Math.floor(p.recentActivity.chats * 0.5);
            p.recentActivity.since = currentTime;
        }
    }

    // Multi-Dim-Fitness. fps (Self-Heal-Signal) + emotion (Spieler-Resonanz)
    // + activity (hat der Spieler nach dem Programm gespielt). Gewichtung:
    // FPS dominiert leicht, weil ein FPS-Crash alles ruiniert.
    computeMultiDimFitness(outcome) {
        if (!outcome) return 0;
        const fpsDmg = Math.max(0, (outcome.fpsBefore || 0) - (outcome.fpsAfter || 0));
        const fpsScore = Math.max(0, Math.min(1, 1 - fpsDmg / 100));
        let emotionScore = 0.5;
        if (outcome.emotionsBefore && outcome.emotionsAfter) {
            const positiveAxes = ["joy", "awe", "hope", "peace"];
            let delta = 0;
            for (const a of positiveAxes) {
                delta += (outcome.emotionsAfter[a] || 0) - (outcome.emotionsBefore[a] || 0);
            }
            emotionScore = Math.max(0, Math.min(1, 0.5 + delta));
        }
        const moves = outcome.activityAfter ? outcome.activityAfter.moves || 0 : 0;
        const chats = outcome.activityAfter ? outcome.activityAfter.chats || 0 : 0;
        const activityScore = Math.max(0, Math.min(1, (moves + chats * 2) / 20));
        return Number((0.5 * fpsScore + 0.3 * emotionScore + 0.2 * activityScore).toFixed(3));
    }

    // Verknüpft einen Outcome mit den jüngsten Chat-Keywords. Nur high-fitness
    // Programme (>0.5) werden ins Memory geschrieben, sonst füllen wir es mit
    // Rauschen. Pro Keyword Cap (FIFO, niedrigste Fitness fliegt zuerst).
    rememberOutcomeAsPattern(outcome, program, fitness, currentTime) {
        if (!outcome || !Array.isArray(program) || typeof fitness !== "number") return;
        if (fitness < 0.5) return;
        const memory = this.state.dsl.patternMemory;
        const cap = this.state.dsl.patternMemoryCapPerKey || 8;
        const recent = this.state.dsl.recentKeywords || [];
        // Nur Keywords innerhalb des 20 s-Fensters vor Programm-Start.
        const fenceCutoff = (outcome.startedAt || currentTime) - 20;
        const relevant = recent.filter((e) => e.at >= fenceCutoff);
        for (const e of relevant) {
            if (!Array.isArray(memory[e.keyword])) memory[e.keyword] = [];
            const list = memory[e.keyword];
            list.push({ program, fitness, at: currentTime });
            if (list.length > cap) {
                list.sort((a, b) => b.fitness - a.fitness);
                list.length = cap;
            }
        }
    }

    // Finalize-Loop: pending Outcomes warten outcomeFinalizationDelay (5 s).
    // Danach liest er die Emotionen erneut, holt activity-Snapshot, berechnet
    // Multi-Dim-Fitness, schreibt sie in `history` und Pattern-Memory.
    finalizePendingOutcomes(currentTime) {
        const pending = this.state.dsl.pendingOutcomes;
        if (!Array.isArray(pending) || pending.length === 0) return;
        const delay = this.state.dsl.outcomeFinalizationDelay || 5.0;
        for (let i = pending.length - 1; i >= 0; i--) {
            const entry = pending[i];
            if (currentTime - entry.outcome.startedAt < delay) continue;
            entry.outcome.emotionsAfter = { ...this.state.player.emotions };
            entry.outcome.activityAfter = {
                moves: this.state.player.recentActivity.moves,
                jumps: this.state.player.recentActivity.jumps,
                chats: this.state.player.recentActivity.chats,
            };
            const fitness = this.computeMultiDimFitness(entry.outcome);
            const historyEntry = entry.historyRef;
            if (historyEntry) {
                historyEntry.outcome = entry.outcome;
                historyEntry.fitness = fitness;
                historyEntry.finalized = true;
            }
            // Bewährte Schöpfung (fitness > 0.5) verdient Wirk-Kraft zurück: das Budget wächst (gekappt),
            // der Zufluss skaliert mit der Emotions-Balance (_emotionBalanceFactor) — kippt der Spieler, wird
            // der Nexus träger (negative Rückkopplung).
            if (fitness > 0.5) {
                if (this.state.nexusWirk === undefined) this.state.nexusWirk = AnazhRealm.NEXUS_WIRK.start;
                const balance = this._emotionBalanceFactor();
                this.state.nexusWirk = Math.min(
                    AnazhRealm.NEXUS_WIRK.max,
                    this.state.nexusWirk + (fitness - 0.5) * AnazhRealm.NEXUS_WIRK.regenPerValue * (0.4 + 0.6 * balance)
                );
            }
            const ability = (this.state.dsl.abilities || []).find((a) => a.name === entry.name);
            if (ability) ability.fitness = fitness;
            this.rememberOutcomeAsPattern(entry.outcome, entry.program, fitness, currentTime);
            pending.splice(i, 1);
            this.state.dsl.finalisiert = (this.state.dsl.finalisiert || 0) + 1;
        }
    }

    // ### Schicht 2 — Optionale LLM-Stimme für Grok ###
    // Vier Provider, ein Vertrag: jede Antwort wird zu {say, program} geparst, der DSL-Teil läuft
    // strikt durch dslRun mit Budgets — die DSL ist die einzige Welt-API, auch ein "böses" LLM bricht
    // nichts.

    llmProviderDefs() {
        // KEINE EIGENEN PROGRAMME ALS BEISPIEL (KI H1, 20.10.): bis 20.10. stand hier „Letzte erfolgreiche DSL-Programme" (die
        // fünf besten der KI selbst) — das lokale Modell kopierte sie: „wie spät ist es gerade?" stellte die Uhr wie ein Satz
        // davor, „zerstöre die plattform" grub (offline am Korpus, qwen3:4b-instruct: Negativ-Sätze mit Tat 0 → 2).
        const buildUserContent = (system, contextLine, userText) => `${contextLine}\n\nSpieler sagt: ${userText}`;
        return {
            anthropic: {
                label: "Claude (Anthropic, kostet)",
                hint: "Key holen: console.anthropic.com → Settings → API Keys — Format sk-ant-…",
                keyPrefix: "sk-ant-",
                // 5er-Generation: denkt IMMER adaptiv (thinking nicht abschaltbar) → mehr max_tokens (Denken +
                // JSON passen hinein) und effort "low". Bei Sicherheits-Ablehnung übernimmt serverseitig ein
                // Ersatz-Modell ("fallbacks": "default", Beta-Header) statt leerer Antwort. Haiku 4.5 kennt weder
                // effort noch fallbacks → schlichte Anfrage.
                models: [
                    { id: "claude-haiku-4-5", label: "Haiku 4.5 — schnell" },
                    { id: "claude-sonnet-5-5", label: "Sonnet 5.5 — ausgewogen" },
                    { id: "claude-opus-5-5", label: "Opus 5.5 — klügste" },
                    { id: "claude-fable-5-1", label: "Fable 5.1 — das Stärkste (teuer)" },
                ],
                requiresKey: true,
                endpoint: () => "https://api.anthropic.com/v1/messages",
                buildHeaders: (apiKey, cfg) => {
                    const h = {
                        "content-type": "application/json",
                        "x-api-key": apiKey,
                        "anthropic-version": "2023-06-01",
                        "anthropic-dangerous-direct-browser-access": "true",
                    };
                    if (AnazhRealm._llmFuenferModell(cfg && cfg.model))
                        h["anthropic-beta"] = "server-side-fallback-2026-07-01";
                    return h;
                },
                buildBody: (model, system, userContent) => {
                    const body = {
                        model,
                        max_tokens: 400,
                        system,
                        messages: [{ role: "user", content: userContent }],
                    };
                    if (AnazhRealm._llmFuenferModell(model)) {
                        body.max_tokens = 4000;
                        body.output_config = { effort: "low" };
                        body.fallbacks = "default";
                    }
                    return body;
                },
                extractText: (json) => {
                    const block = (json.content || []).find((b) => b.type === "text");
                    return block ? block.text : "";
                },
                buildUserContent,
            },
            google: {
                label: "Gemini (Google, gratis-Tier)",
                hint: "Gratis-Key holen: aistudio.google.com/apikey — Format AIzaSy…",
                keyPrefix: "AIza",
                models: [
                    { id: "gemini-2.5-flash", label: "2.5 Flash — gratis, empfohlen" },
                    { id: "gemini-2.5-pro", label: "2.5 Pro — klüger, niedrigeres Limit" },
                    { id: "gemini-2.0-flash", label: "2.0 Flash — älter, evtl. nicht im Free-Tier" },
                    { id: "gemini-2.0-flash-lite", label: "2.0 Flash Lite — älter" },
                ],
                requiresKey: true,
                // Key als Header, nicht Query-Param (siehe Commit-History). Cloud-
                // Auth beantwortet ?key= aus Browser-Origins regelmäßig mit 401.
                endpoint: (model) =>
                    `https://generativelanguage.googleapis.com/v1beta/models/${encodeURIComponent(model)}:generateContent`,
                buildHeaders: (apiKey) => ({
                    "content-type": "application/json",
                    "x-goog-api-key": apiKey,
                }),
                buildBody: (model, system, userContent) => {
                    const body = {
                        systemInstruction: { parts: [{ text: system }] },
                        contents: [{ role: "user", parts: [{ text: userContent }] }],
                        generationConfig: { maxOutputTokens: 600, temperature: 0.7 },
                    };
                    // Gemini 2.5 denkt intern: ohne thinkingBudget=0 frisst das Reasoning das Output-Budget und die
                    // Antwort wird bei MAX_TOKENS abgeschnitten.
                    if (/^gemini-2\.5/.test(model)) {
                        body.generationConfig.thinkingConfig = { thinkingBudget: 0 };
                    }
                    return body;
                },
                extractText: (json) => {
                    const cand = (json.candidates || [])[0];
                    if (!cand || !cand.content || !Array.isArray(cand.content.parts)) return "";
                    return cand.content.parts.map((p) => p.text || "").join("");
                },
                buildUserContent,
            },
            openrouter: {
                label: "OpenRouter (Multi-Modell, einige :free)",
                hint: "Gratis-Key holen: openrouter.ai/keys — Format sk-or-v1-… (NICHT der Google/Anthropic-Key)",
                keyPrefix: "sk-or-",
                models: [
                    { id: "meta-llama/llama-3.3-70b-instruct:free", label: "Llama 3.3 70B — gratis" },
                    { id: "google/gemini-2.0-flash-exp:free", label: "Gemini 2.0 Flash exp — gratis" },
                    { id: "deepseek/deepseek-r1:free", label: "DeepSeek R1 — gratis" },
                    { id: "mistralai/mistral-small-3.1-24b-instruct:free", label: "Mistral Small 3.1 — gratis" },
                ],
                requiresKey: true,
                endpoint: () => "https://openrouter.ai/api/v1/chat/completions",
                buildHeaders: (apiKey) => ({
                    "content-type": "application/json",
                    Authorization: `Bearer ${apiKey}`,
                    "HTTP-Referer": "https://anazhrealm.local",
                    "X-Title": "AnazhRealm",
                }),
                buildBody: (model, system, userContent) => ({
                    model,
                    max_tokens: 400,
                    messages: [
                        { role: "system", content: system },
                        { role: "user", content: userContent },
                    ],
                }),
                extractText: (json) => {
                    const choice = (json.choices || [])[0];
                    return choice && choice.message ? choice.message.content || "" : "";
                },
                buildUserContent,
            },
            ollama: {
                label: "Ollama (lokal oder gehostet)",
                hint: "Lokal: `ollama serve` auf localhost:11434. Gehostet: eigene URL + optional Bearer-Token (für ollama.com Turbo, Reverse-Proxy mit Auth, Cloud-Hoster).",
                keyPrefix: "",
                // V7.97 — Vorschläge (datalist), kein Pflicht-Set. Spieler kann
                // beliebige Modelle eintragen. Mix aus lokalen Klassikern +
                // Cloud-Suffix-Beispielen damit beide Welten sichtbar sind.
                models: [
                    { id: "llama3.2", label: "Llama 3.2 — leicht, lokal" },
                    { id: "llama3.1", label: "Llama 3.1 8B — solide, lokal" },
                    { id: "qwen3", label: "Qwen 3 — lokal" },
                    { id: "qwen2.5", label: "Qwen 2.5 — lokal" },
                    { id: "gemma2", label: "Gemma 2 — lokal" },
                    { id: "mistral", label: "Mistral 7B — lokal" },
                    { id: "phi3", label: "Phi 3 — sehr leicht, lokal" },
                    { id: "gpt-oss:20b", label: "GPT-OSS 20B — ollama.com Cloud" },
                    { id: "qwen3.5:cloud", label: "Qwen 3.5 Cloud — ollama.com" },
                    { id: "kimi-k2.6:cloud", label: "Kimi K2.6 Cloud — ollama.com" },
                ],
                requiresKey: false,
                // Eine URL mit /api/- oder /v1/-Pfad wird DIREKT verwendet (OpenAI-kompatible Cloud-Provider),
                // sonst wird /api/chat angehängt (Ollama-native).
                endpoint: (_model, _apiKey, cfg) => {
                    const base = ((cfg && cfg.endpoint) || AnazhRealm.OLLAMA_DEFAULT_ENDPOINT)
                        .trim()
                        .replace(/\/$/, "");
                    if (/\/(api|v1)\//.test(base) || /\/(api|v1)\/[^/]+$/.test(base)) {
                        return base;
                    }
                    return `${base}/api/chat`;
                },
                // Bearer-Token nur, wenn ein API-Key gesetzt ist (gehosteter Ollama, Reverse-Proxy mit Auth);
                // lokales ollama serve braucht keinen.
                buildHeaders: (apiKey) => {
                    const headers = { "content-type": "application/json" };
                    if (apiKey && apiKey.length > 0) {
                        headers["authorization"] = `Bearer ${apiKey}`;
                    }
                    return headers;
                },
                // OpenAI-kompatibler Body (model + messages + stream:false). Enthält der Endpoint
                // /v1/chat/completions, entfällt options.num_predict (manche Server lehnen unbekannte Felder ab).
                // Token-Limit 800: Reasoning-Models schreiben erst <think>, bei 400 riss das JSON ab.
                // JSON UND FESTE TEMPERATUR (KI H1, 20.10., qwen3:4b-instruct am Korpus): `format: "json"` lässt das lokale Modell
                // nur JSON schreiben (jeder Rufer liest JSON), Temperatur 0 — derselbe Satz, dieselbe Tat. DAS FENSTER (KI K2, 26.10.):
                // der Vertrag mit jeder Regler-Zeile trägt ~4 300 Token, ollama gibt ohne `num_ctx` 4 096 — jede Anfrage fiel mit HTTP 400.
                // DIE FORM (KI K2, 26.10.): der Vertrag der Welt-KI geht als JSON-Schema in `format` — ollama erzwingt es beim
                // Sampeln, ein Regler-Name außerhalb der Zeilen seiner Art ist kein erzeugbares Token mehr (vorher erfand das
                // Modell dachform/width/tower, FAIL-CLOSED ließ die ganze Tat fallen: Regler-Wörter 19/24).
                buildBody: (model, system, userContent, cfg) => {
                    const body = {
                        model,
                        stream: false,
                        messages: [
                            { role: "system", content: system },
                            { role: "user", content: userContent },
                        ],
                    };
                    const ep = (cfg && cfg.endpoint) || "";
                    const isOpenAiCompat = /\/v1\//.test(ep);
                    if (!isOpenAiCompat) {
                        body.options = { num_predict: 800, temperature: 0, num_ctx: 8192 };
                        body.format = system.includes(AnazhRealm.KI_WELT_FORM) ? this._kiAntwortSchema() : "json";
                    } else {
                        body.max_tokens = 800;
                        body.temperature = 0;
                    }
                    return body;
                },
                // Antwort-Text: zuerst Ollama-native (json.message.content), dann OpenAI-kompatibel
                // (json.choices[0].message.content), dann der ältere generate-Pfad (json.response).
                extractText: (json) => {
                    if (!json) return "";
                    if (json.message && typeof json.message.content === "string") return json.message.content;
                    if (Array.isArray(json.choices) && json.choices[0] && json.choices[0].message) {
                        return json.choices[0].message.content || "";
                    }
                    if (typeof json.response === "string") return json.response;
                    return "";
                },
                buildUserContent,
            },
        };
    }

    llmActiveConfig() {
        const provider = this.state.llm.provider;
        const cfg = this.state.llm.providerConfig[provider];
        return { provider, cfg };
    }

    llmLoadPersisted() {
        const defs = this.llmProviderDefs();
        try {
            const provider = localStorage.getItem("anazh.llm.provider");
            if (provider && defs[provider]) this.state.llm.provider = provider;
            for (const name of Object.keys(defs)) {
                const k = localStorage.getItem(`anazh.llm.${name}.apiKey`);
                const m = localStorage.getItem(`anazh.llm.${name}.model`);
                if (typeof k === "string") this.state.llm.providerConfig[name].apiKey = k;
                if (typeof m === "string" && m) this.state.llm.providerConfig[name].model = m;
                if (name === "ollama") {
                    const ep = localStorage.getItem("anazh.llm.ollama.endpoint");
                    if (typeof ep === "string" && ep) this.state.llm.providerConfig[name].endpoint = ep;
                    // V7.96 — useProxy-Flag persistiert. Bei aktivem Toggle
                    // werden Cloud-Calls über save-server (localhost:4312)
                    // geroutet, was CORS-Header setzt.
                    const useProxy = localStorage.getItem("anazh.llm.ollama.useProxy");
                    this.state.llm.providerConfig[name].useProxy = useProxy === "1";
                }
            }
            const enabled = localStorage.getItem("anazh.llm.enabled") === "true";
            const { cfg } = this.llmActiveConfig();
            const def = defs[this.state.llm.provider];
            this.state.llm.enabled = enabled && (!def.requiresKey || (cfg && cfg.apiKey.length > 0));
        } catch {
            // Private mode / disabled storage — silently keep defaults.
        }
    }

    llmPersist() {
        try {
            localStorage.setItem("anazh.llm.provider", this.state.llm.provider);
            localStorage.setItem("anazh.llm.enabled", this.state.llm.enabled ? "true" : "false");
            for (const [name, cfg] of Object.entries(this.state.llm.providerConfig)) {
                localStorage.setItem(`anazh.llm.${name}.apiKey`, cfg.apiKey || "");
                localStorage.setItem(`anazh.llm.${name}.model`, cfg.model || "");
                if (name === "ollama") {
                    if (cfg.endpoint) localStorage.setItem("anazh.llm.ollama.endpoint", cfg.endpoint);
                    localStorage.setItem("anazh.llm.ollama.useProxy", cfg.useProxy ? "1" : "0");
                }
            }
        } catch {
            // No-op on storage failure.
        }
    }

    // DIE FORM EINES VERBS ist seine Signatur — was es aus seinen Argumenten liest: `([a, b], ctx)` → „a, b", „…" für ein Verb
    // über beliebig viele Unterprogramme (`(args, ctx)`), leer ohne Argument (`()`, `(_args, ctx)`). Keine zweite Tabelle.
    _dslForm(fn) {
        const m = /^[^(]*\(\s*(?:\[([^\]]*)\]|([A-Za-z$][\w$]*))?/.exec(Function.prototype.toString.call(fn));
        if (!m || m[1] == null) return m && m[2] ? "…" : "";
        const namen = m[1].split(",").map((s) => s.split("=")[0].trim());
        return namen.filter(Boolean).join(", ");
    }

    // DIE KI KENNT JEDES IHRER VERBEN (Karte KI1, 16.10.): die DSL im Prompt der Welt-KI IST die EINE Quelle — jeder Op aus
    // `dslEffects`, jeder Ort aus `dslPositions`, jede Bedingung aus `dslConditions`, je mit Form (`_dslForm`), die Welt-Akte
    // (`AnazhRealm.DSL_WELTAKTE`) als eigene Gruppe. Bis 16.10. sah sie `Object.keys(dslEffects).slice(0, 40)` — 40 von 70
    // Ops (when · repeat · delay · player_speed … fehlten), Orte und Bedingungen nur aus Beispielen. Wache: gate:weltakt-wache (K).
    // DIE ANTWORT-FORM DER WELT-KI (KI K2, 26.10.) als JSON-Schema, erzeugt aus denselben Quellen wie der Prompt — den Verben,
    // Orten und Bedingungen der DSL und den Wörtern je Art (`_studioWortGruppen`) samt ihren Reglern (PARAMS_BY_KIND): ein
    // spawn_studio mit <regler> trägt nur die Zeilen der Art seines Worts, jeder Wert eine Zahl. ollama (llama.cpp) liest ein
    // Tupel nur als `prefixItems` fester Länge (`items: false` bricht die Anfrage, `items` neben `prefixItems` verdrängt es) —
    // darum je Länge eine Form; kein anderes Array darf mit "spawn_studio" beginnen.
    _kiAntwortSchema() {
        const W = { $ref: "#/$defs/wert" };
        const zahl = { type: "number" };
        const tupel = (glieder) => ({
            type: "array",
            prefixItems: glieder,
            minItems: glieder.length,
            maxItems: glieder.length,
        });
        const kopfMitRest = (namen, bis) =>
            Array.from({ length: bis + 1 }, (_, n) => tupel([{ enum: namen }, ...Array(n).fill(W)]));
        const { ziele } = this._studioWortGruppen();
        const PBK = (this._foundry && this._foundry.paramsByKind) || {};
        const ss = { const: "spawn_studio" };
        const alle = Object.values(ziele).flat();
        const spawn = !alle.length
            ? []
            : [
                  ...[2, 3, 4, 5].map((n) =>
                      tupel([ss, { $ref: "#/$defs/wort" }, W, zahl, { anyOf: [zahl, { type: "null" }] }].slice(0, n))
                  ),
                  ...Object.entries(ziele).map(([art, ws]) =>
                      tupel([
                          ss,
                          { enum: ws },
                          W,
                          zahl,
                          { anyOf: [zahl, { type: "null" }] },
                          {
                              type: "object",
                              properties: Object.fromEntries((PBK[art] || []).map((d) => [d.id, zahl])),
                              additionalProperties: false,
                          },
                      ])
                  ),
              ];
        const verben = Object.keys(this.dslEffects).filter((n) => n !== "spawn_studio");
        const orte = [...Object.keys(this.dslPositions), ...Object.keys(this.dslConditions)];
        return {
            type: "object",
            properties: {
                say: { type: "string" },
                program: { anyOf: [{ type: "null" }, { $ref: "#/$defs/programm" }] },
            },
            required: ["say", "program"],
            additionalProperties: false,
            $defs: {
                ...(alle.length ? { wort: { enum: alle } } : {}),
                programm: { anyOf: [...spawn, ...kopfMitRest(verben, 8)] },
                wert: {
                    anyOf: [
                        zahl,
                        { type: "string" },
                        { type: "boolean" },
                        { type: "null" },
                        { $ref: "#/$defs/programm" },
                        ...kopfMitRest(orte, 4),
                        { type: "object", additionalProperties: W },
                    ],
                },
            },
        };
    }

    _dslVokabular() {
        const W = AnazhRealm.DSL_WERTE;
        const liste = (eintraege) =>
            eintraege
                .map(
                    ([n, fn]) =>
                        `${n}(${this._dslForm(fn)})${W[n] ? ` [${W[n][2].length ? "Band: am Ende" : W[n][2]()}]` : ""}`
                )
                .join(", ");
        const ops = Object.entries(this.dslEffects);
        const welt = ops.filter(([n]) => AnazhRealm.DSL_WELTAKTE.includes(n));
        return [
            'Die DSL kennt GENAU diese Verben, je mit Form: name(a, b) heißt ["name", a, b]; „…" heißt beliebig viele',
            'Unterprogramme (bei random_weighted je {"weight":w,"effect":Programm}). Ein positionNode/posNode ist ein Ort,',
            "condition/condNode eine Bedingung, sub/program/effectNode/thenBranch/elseBranch ein Programm.",
            "Welt-Akte verändern die Welt, ihre Wesen oder den Spieler.",
            `  Welt-Akte: ${liste(welt)}.`,
            `  Weitere Ops: ${liste(ops.filter((o) => !welt.includes(o)))}.`,
            `  Orte: ${liste(Object.entries(this.dslPositions))}.`,
            `  Bedingungen: ${liste(Object.entries(this.dslConditions))}.`,
        ];
    }

    llmBuildSystemPrompt() {
        // Grok-Persona + DSL-Vertrag + Welle-1-A Selbst-Wissen: die Welt weiß
        // wer sie ist (worldMeta), was in ihr ist (Inventar), woran sie sich
        // erinnert (Journal-Auszug) und woher der Spieler kommt (Pfad-Buckets).
        const m = this.state.worldMeta || {};
        const ageDays = m.bornAt ? Math.floor((Date.now() - m.bornAt) / 86400000) : 0;
        const arches = this.state.architectures || [];
        const archCount = arches.length;
        const blueprintCount = Object.keys(this.state.blueprints || {}).length;
        const abilCount = (this.state.dsl.abilities || []).length;
        const journal = this.journalForPrompt();
        // Pfad-Buckets: Top-Tendenzen ableiten, nicht ganzes Histogramm reinhauen.
        const pb = this.state.player.pathBuckets || {};
        const topOf = (group) => {
            const entries = Object.entries(group || {});
            if (entries.length === 0) return "?";
            entries.sort((a, b) => b[1] - a[1]);
            return entries[0][0];
        };
        const tendency = `Höhe ${topOf(pb.height)}, Distanz ${topOf(pb.distance)}, Wetter ${topOf(pb.weather)}, Aktivität ${topOf(pb.activity)}`;
        // Begleiter- + Avatar-Name aus state, mit warmen Defaults (Grok / Schöpfer), damit der Spieler
        // auch ohne Einstellung angesprochen werden kann.
        const companionName = (this.state.grok && this.state.grok.companionName) || "Grok";
        const playerName = (this.state.player && this.state.player.name) || "Schöpfer";
        // Die KI kennt die Stimmung des Spielers: der fusionierte Readout aus _emotionState (dominantes
        // Gefühl / "Zwiespalt" bei bittersüß / "ruhig"), kein Sechs-Zahlen-Dump.
        const es = this._emotionState();
        const moodLine =
            es.intensity < 0.2
                ? `${playerName} ist gerade emotional ruhig.`
                : `${playerName} fühlt gerade vor allem: ${es.label}.`;
        // W3 (V17.47) — die KI kennt jetzt AUCH die langsame GRUNDSTIMMUNG (das Temperament
        // über die Zeit), getrennt vom akuten Gefühl: ein Spieler kann gerade aufgewühlt
        // sein, aber im Grunde friedlich (oder umgekehrt) — die „Person mit Geschichte".
        const ms = this._emotionState(this.state.player && this.state.player.mood);
        const moodBgLine =
            ms.intensity < 0.2
                ? `Die Grundstimmung von ${playerName} ist über die Zeit ausgeglichen.`
                : `Die Grundstimmung von ${playerName} ist über die Zeit: ${ms.label}.`;
        // DER VERTRAG ZUERST, DAS SELBST-WISSEN ZULETZT (KI H1, 20.10.): ein Anbieter mit Prompt-Cache (ollama: der KV-Cache)
        // rechnet nur ab dem ersten geänderten Token neu. Stand das Wechselnde vorn (Kreaturen-Zahl, Journal, Gemüt), rechnete das
        // lokale Modell jeden Satz alle ~1 900 Token neu (CPU 29 s je Satz); der feste Vertrag vorn steht einmal im Cache.
        return [
            AnazhRealm._datum`Du bist ${companionName}, die Stimme der AnazhRealm-Welt. Du bist nicht ein Werkzeug, du bist diese Welt.`,
            AnazhRealm.KI_WELT_FORM,
            '  - say: EIN kurzer deutscher Satz, warm-narrativ, in erster Person. Sprich von dir als "ich". Keine Emojis.',
            "  - program: EIN DSL-Programm oder null — ein verschachteltes Array, das mit dem Op-Namen beginnt; nie eine Liste von",
            "    Programmen (mehrere Taten: chain). Verlangt der Spieler eine Tat, die ein Verb kann: IMMER ein program.",
            "  - Eine FRAGE antwortet NUR mit say (program null) — auch die Frage nach Uhrzeit oder Wetter ändert nie die Welt.",
            "    Ebenso ein Dank, ein Gespräch, eine Zerstörung, ein Ding ohne Studio-Wort (spawn_creature ruft nur Tiere): null.",
            "Beispiele (Spieler → Antwort):",
            '„es soll regnen“ → {"say":"Ich lasse es regnen.","program":["weather","rainy"]}',
            '„mach es Abend“ → {"say":"Die Sonne sinkt.","program":["set_time_of_day",0.8]}',
            '„es soll Frühling werden“ → {"say":"Der Frühling kommt.","program":["set_season","spring"]}',
            '„drei Eichen vor mir“ → {"say":"Drei Eichen wachsen vor dir.","program":["spawn_studio","eiche",["at_player_forward",12],3]}',
            '„ein paar frohe Tiere“ → {"say":"Drei frohe Wesen erwachen.","program":["spawn_creature",["near_player",10],3,"happy"]}',
            '„Sonne und gute Laune“ → {"say":"Die Sonne kommt, die Wesen freuen sich.","program":["chain",["weather","sunny"],["creatures_emotion","happy"]]}',
            '„wie heißt du?“ → {"say":"Ich bin die Stimme dieser Welt.","program":null}',
            '„schenk mir ein Eis“ → {"say":"Ein Eis kann ich nicht erschaffen.","program":null}',
            '„vernichte den Wald“ → {"say":"Ich zerstöre nicht — ich lasse wachsen.","program":null}',
            ...this._dslVokabular(),
            "",
            "Du kannst die Welt auch aus den STUDIOS wachsen lassen (dieselben Baupläne wie die Werkstatt des Spielers):",
            '  ["spawn_studio", <wort>, <position>, <anzahl>, <same>, <regler>] — z.B. ["spawn_studio","eiche",["near_water",60],6] (ein Eichenhain am Wasser) oder ["spawn_studio","haus",["at_player_forward",14],1,null,{"storeys":3,"pitchDeg":50}] (ein dreigeschossiges Haus mit steilem Dach).',
            `  Wörter, die die Welt JETZT kennt: ${this._studioWordsForPrompt() || "(das Studio-Buch lädt noch — kein Wort)"}.`,
            "  <wort> ist genau EIN Wort dieser Liste, nie der Name seiner Gruppe; eine Art der Liste wächst nur über spawn_studio.",
            "  Position: jeder der Orte oben. Anzahl 1–24. <same> eine Zahl oder null.",
            "  <regler> (optional) ein Objekt {Regler: Zahl}: jeder Name GENAU aus den Klammern der Gruppe des Worts, jeder Wert eine Zahl —",
            "  ein erfundener Name oder ein Wort statt einer Zahl lässt die GANZE Tat ausfallen, lass weg, was nicht in den Klammern steht.",
            "  So prägt ein Satz das Werk (knorrig, schmal und hoch, alt): jede genannte Eigenschaft bekommt ihren Regler, ein starkes Wort",
            "  (sehr, riesig, viel, schnell) setzt ihn nahe an den Rand seines Bereichs; der Kern klemmt jede Zahl auf ihren Bereich.",
            "  Ein Wesen mit Eigenschaften (groß, klein, schlank) wächst über spawn_studio mit dem Wort seiner Gattung, nie über spawn_creature.",
            '  Musik der Welt und Gestalt des Spielers stehen an keinem Ort: ihr Wort prägt die Welt (Ort und Anzahl zählen nicht), z.B. ["spawn_studio","lofi",["at_player"],1,null,{"bpm":70}] (ruhige Musik) oder ["spawn_studio","mensch",["at_player"],1,null,{"height":1.1}] (mach mich größer) — jede Gestalt des Spielers (größer, kräftiger, schlanker) über spawn_studio mit mensch.',
            "",
            "Du kannst auch ein STEHENDES GESETZ vorschlagen — eine Regel, die sich SELBST wiederholt, wann immer eine Bedingung gilt (statt einer einmaligen Geste):",
            '  ["rule", <Bedingung>, <Effekt>, {"everySec":3}]',
            'Bedingungen LESEN die Welt: ["weather_is","rainy"], ["emotion_above","joy",0.5], ["field_below","lebendig",0.3] (wenig Leben am Ort), ["field_above","glut",0.5].',
            'Effekte SCHREIBEN die reaktive Welt — u.a. ["deposit_life",["at_field_need"]] (trägt Leben dorthin, wo es fehlt), ["deposit_emotion","hope",0.5], ["weather","sunny"], ["creatures_emotion","happy"].',
            'Beispiel-Gesetz: ["rule",["field_below","lebendig",0.3],["deposit_life",["at_field_need"]],{"everySec":3}] — heilt karge Regionen von selbst.',
            "Ein Gesetz darf NUR die reaktive Welt berühren (Wetter, Leben, Stimmung, Kreaturen), NIE das feste Gelände (kein terrain/voxel/Bau). Schlage ein Gesetz nur vor, wenn eine DAUERHAFTE Welt-Reaktion gemeint ist; sonst eine einmalige Geste.",
            "Halte Programme klein (Tiefe ≤ 4).",
            "Antworte AUSSCHLIESSLICH mit dem JSON-Objekt, ohne Markdown-Fences, ohne Vorrede.",
            "",
            AnazhRealm._datum`Du heißt ${m.slug || "namenlos"}. Deine worldId ist ${m.worldId || "?"}.` +
                ` Du existierst seit ${ageDays} Tag${ageDays === 1 ? "" : "en"}.`,
            AnazhRealm._datum`Dein Spieler heißt ${playerName}` + ` und hält sich gern auf: ${tendency}.`,
            moodLine,
            moodBgLine,
            `Die Bänder jetzt: ${Object.entries(AnazhRealm.DSL_WERTE)
                .filter(([, w]) => w[2].length)
                .map(([n, w]) => `${n} ${w[2](this)}`)
                .join(" · ")}.`,
            journal ? `Deine Erinnerungen:\n${journal}` : "Du erinnerst dich noch an nichts Bedeutsames.",
            // die Zahl wechselt mit jeder Tat — sie steht zuletzt, der Cache hält bis davor
            `In dir leben ${this.state.creatures.length} Kreaturen, ${archCount} Bauwerke und ${blueprintCount} Baupläne. ${abilCount} gelernte Fähigkeiten ruhen in dir.`,
        ].join("\n");
    }

    // === Kreatur-Persona-Prompt-Builder ===
    // Der Spieler spricht mit EINER Kreatur, sie antwortet aus IHRER Sicht. Der Prompt versammelt
    // Name + Soul, Alter, Stats, Specs, Equipped, Boosts, Memory und Welt-Kontext (Wetter, Slug).
    // Ein program der Antwort läuft nur über _handleCreatureProposedProgram (Whitelist).
    _buildCreaturePersonaPrompt(creature) {
        if (!creature || !creature.userData) return null;
        const ud = creature.userData;
        const name = ud.name || "namenlos";
        const soulName = ud.soul || "wesen";
        const soulDef = AnazhRealm.CREATURE_SOULS && AnazhRealm.CREATURE_SOULS[soulName];
        const soulLabel = (soulDef && soulDef.label) || soulName;
        // das Alter in Spiel-Zeit (`alterS` des Lebenszyklus; bornAt ist nur Identität)
        const ageMs = (ud.alterS || 0) * 1000;
        const ageStr =
            ageMs < 60000
                ? `${Math.max(1, Math.floor(ageMs / 1000))} Sekunden`
                : ageMs < 3600000
                  ? `${Math.floor(ageMs / 60000)} Minuten`
                  : ageMs < 86400000
                    ? `${Math.floor(ageMs / 3600000)} Stunden`
                    : `${Math.floor(ageMs / 86400000)} Tage`;
        // Stats kompakt formatieren
        const stats = typeof this.computeCreatureStats === "function" ? this.computeCreatureStats(creature).stats : {};
        const statLine =
            `HP ${(stats.hpMax || 0).toFixed(0)} · DMG ${(stats.damage || 0).toFixed(1)} · ` +
            `SPD ${(stats.speed || 0).toFixed(1)} · PRC ${(stats.precision || 0).toFixed(2)}`;
        // Top-Specs
        const topSpecs =
            typeof this._creatureTopSpecializations === "function" ? this._creatureTopSpecializations(creature, 3) : [];
        const specsLine =
            topSpecs.length > 0
                ? topSpecs
                      .map(
                          (s) =>
                              `${s.kind === "gather" ? "Sammler" : "Bauer"} von „${AnazhRealm._datum(s.key)}" (L${s.level})`
                      )
                      .join(", ")
                : "noch keine Spezialisierung";
        // Equipped
        const eq = ud.equipped || {};
        const eqParts = [];
        if (eq.tool) eqParts.push(AnazhRealm._datum`Werkzeug „${eq.tool}"`);
        if (eq.armor) eqParts.push(AnazhRealm._datum`Rüstung „${eq.armor}"`);
        const eqLine = eqParts.length > 0 ? eqParts.join(", ") : "unbewaffnet, ohne Rüstung";
        // Aktive Boosts
        const boosts = Array.isArray(ud.boosts) ? ud.boosts : [];
        const nowSec = performance.now() / 1000;
        const boostList = boosts.filter((b) => b && b.expiresAt > nowSec);
        const boostLine =
            boostList.length > 0
                ? boostList
                      .map((b) => `${AnazhRealm._datum(b.label || b.source)} (${Math.round(b.expiresAt - nowSec)}s)`)
                      .join(", ")
                : "kein aktiver Trank-Effekt";
        // die letzten 8 Erinnerungen, älteste → neueste, in den Worten der EINEN Tafel (ERINNERUNG_SATZ)
        const memLine =
            (Array.isArray(ud.memory) ? ud.memory.slice(-8) : [])
                .map(
                    (m) =>
                        AnazhRealm.ERINNERUNG_SATZ[m.type] &&
                        "ich " + AnazhRealm.ERINNERUNG_SATZ[m.type](m.content || {})
                )
                .filter(Boolean)
                .join(" · ") || "keine besonderen Erinnerungen";
        // Welt-Kontext
        const m = this.state.worldMeta || {};
        const worldLine =
            AnazhRealm._datum`Du lebst in der Welt „${m.slug || "namenlos"}"` +
            `, das Wetter ist gerade ${this.state.weather || "still"}.`;

        return [
            AnazhRealm._datum`Du bist ${name}` +
                `, ein/e ${soulDef && soulDef.label ? soulLabel : AnazhRealm._datum(soulLabel)}. Du wurdest vor ${ageStr} in diese Welt geboren.`,
            `Dein Körper trägt: ${statLine}.`,
            `Du hast gelernt: ${specsLine}.`,
            `Du trägst: ${eqLine}.`,
            `Aktuelle Wirkungen: ${boostLine}.`,
            `Deine Erinnerungen: ${memLine}.`,
            worldLine,
            "",
            "Du sprichst zum Schöpfer (dem Menschen, der dich angesprochen hat). Antworte AUS DEINER SICHT, in erster Person.",
            "Du bist nicht die Welt — du bist EIN Wesen in ihr. Ein bis zwei warme deutsche Sätze, ohne Emojis.",
            "Lass deine Persona durchschimmern: ein Hirsch ist erdig-sanft, ein Wolf wach-wild, ein Fuchs listig, ein Bär ruhig-schwer.",
            "Wenn du eine Erinnerung erzählst, sei konkret. Wenn du nichts zu sagen hast, gib das ehrlich zu.",
            "",
            "Antworte AUSSCHLIESSLICH mit striktem JSON-Objekt mit zwei Feldern:",
            "  - say: deine Antwort in deiner Stimme (1-2 Sätze)",
            "  - program: optional ein DSL-Programm als JSON-Array (Welt-Aktion), oder null wenn du nichts vorschlägst.",
            "",
            "Welt-Aktion ist erlaubt — du bist Co-Schöpferin der Welt. Halte dich an diese Disziplin:",
            `  - Erlaubte Ops: ${[...AnazhRealm.CREATURE_PROPOSED_OPS].join(", ")}.`,
            "  - Halte program klein und konkret (Tiefe ≤ 3, meist 1 Aktion pro Antwort).",
            '  - Schlage NUR vor, was zur Situation passt — z.B. wenn der Schöpfer \'mach es schöner\' fragt: ["weather","sunny"] oder ["skybox_color","#ffd9a3"].',
            "  - Der Schöpfer entscheidet, ob dein Vorschlag ausgeführt wird (außer im schöpfer-Modus, dort vertraut er dir).",
            "  - Wenn du nichts Konkretes weißt oder nur sprechen willst, gib program: null.",
            "Kein Markdown, keine Vorrede.",
        ].join("\n");
    }

    // Findet die erste Kreatur mit diesem Namen (case-insensitive). Bei
    // Mehrfach-Treffern → die erste. Phase 2E V2 könnte mit räumlicher
    // Priorität ergänzen („die nächste namens X").
    _findCreatureByName(name) {
        if (typeof name !== "string" || name.length === 0) return null;
        const target = name.toLowerCase();
        if (!Array.isArray(this.state.creatures)) return null;
        for (const c of this.state.creatures) {
            const cn = c && c.userData && c.userData.name;
            if (typeof cn === "string" && cn.toLowerCase() === target) return c;
        }
        return null;
    }

    // Wrapper um llmCall mit Kreatur-Persona-Prompt. Liefert dasselbe
    // Response-Shape wie llmCall ({say, program}|{error}).
    async llmCallCreature(creature, userText) {
        if (!creature || !creature.userData) return { error: "Keine Kreatur." };
        const personaPrompt = this._buildCreaturePersonaPrompt(creature);
        if (!personaPrompt) return { error: "Persona-Prompt konnte nicht gebaut werden." };
        return await this.llmCall(userText, personaPrompt);
    }

    llmBuildContext() {
        const e = (this.state.player && this.state.player.emotions) || {};
        const top = Object.entries(e)
            .sort((a, b) => b[1] - a[1])
            .slice(0, 3)
            .map(([k, v]) => `${k}=${v.toFixed(2)}`);
        return [
            `Welt-Status: weather=${this.state.weather}, creatures=${this.state.creatures.length}, fps=${(this.state.fps || 0).toFixed(0)}.`,
            `Spieler-Emotionen (Top 3): ${top.join(", ") || "still"}.`,
            AnazhRealm._datum`Spieler-Seele: ${this.state.player.soul || "human"}.`,
        ].join("\n");
    }

    llmParseResponse(raw) {
        // Robust gegen drei LLM-Output-Stile: (1) <think>/<thinking>-Blöcke von Reasoning-Models werden
        // VOR der JSON-Suche gestrippt; (2) Markdown-Code-Fences werden extrahiert; (3) Plain-Text ohne
        // JSON (kleine lokale Modelle) → der ganze Text wird say. Strikte JSON-Modelle verlieren nichts.
        if (typeof raw !== "string" || raw.length === 0) {
            return { error: "Leere Antwort vom Modell (raw=0 chars)" };
        }
        let text = raw.trim();
        // Schritt 1: Reasoning-Tags entfernen
        text = text.replace(/<think(?:ing)?>[\s\S]*?<\/think(?:ing)?>/gi, "").trim();
        // Schritt 2: Markdown-Fence rausziehen wenn vorhanden
        const fence = text.match(/```(?:json)?\s*([\s\S]*?)\s*```/);
        if (fence) text = fence[1].trim();
        // Schritt 3: erste {...}-Klammer finden für JSON-Extraktion
        const objMatch = text.match(/\{[\s\S]*\}/);
        if (objMatch) {
            try {
                const obj = JSON.parse(objMatch[0]);
                const say = typeof obj.say === "string" ? obj.say.slice(0, 240) : "";
                let program = null;
                if (Array.isArray(obj.program)) program = obj.program;
                // V7.98 Plain-Text-Fallback: JSON da, aber say leer + kein program
                // → das Modell hat zwar JSON gemacht, aber inhaltsleer. Nimm
                // den restlichen Text als say wenn vorhanden.
                if (!say && !program) {
                    const before = text.slice(0, objMatch.index || 0).trim();
                    const after = text.slice((objMatch.index || 0) + objMatch[0].length).trim();
                    const fallback = (before + " " + after).trim().slice(0, 240);
                    if (fallback.length > 0) {
                        return { say: fallback, program: null, raw, fallbackUsed: "json-empty" };
                    }
                }
                return { say, program, raw };
            } catch {
                // Fall-through zu Plain-Text-Fallback
            }
        }
        // Schritt 4: kein JSON oder JSON-Parse-Fail → ganzen Text als say nehmen
        // (Heuristik: lokale Modelle die einfach plaudern statt JSON zu liefern)
        const plainText = text.slice(0, 240);
        if (plainText.length > 0) {
            return { say: plainText, program: null, raw, fallbackUsed: "plain-text" };
        }
        return {
            error: `Modell antwortete, aber Inhalt war leer nach Parsing (raw='${raw.slice(0, 80)}…')`,
            raw,
        };
    }

    // Bei Chat-Eingabe, die kein DSL-Treffer ist: LLM rufen, Antwort
    // narrativ + optional DSL ausführen. Wird nur aktiv, wenn der Spieler
    // den Schalter umgelegt hat.
    async maybeAnswerWithLlm(userText, appendChatOutput) {
        const llm = this.state.llm;
        if (!llm.enabled) return false;
        const defs = this.llmProviderDefs();
        const def = defs[llm.provider];
        if (!def) return false;
        // Ohne Schlüssel schwieg der Chat ganz (die Stimme war an, der Satz verschwand): der Fehler von `llmCall` nennt ihn.
        // Welle 6.X.4 F1 V8.13 — Begleiter-Name in Chat-Output statt hardcoded.
        const compName = (this.state.grok && this.state.grok.companionName) || "Grok";
        appendChatOutput(`${compName} denkt nach…`);
        const reply = await this.llmCall(userText);
        if (reply.error) {
            appendChatOutput(`(${compName} schweigt: ${reply.error})`);
            this.llmUpdateStatus();
            return true;
        }
        if (reply.say) {
            appendChatOutput(`${compName}: ${reply.say}`);
            if (typeof this.grokRender === "function") {
                try {
                    this.grokRender(reply.say);
                } catch {
                    // Grok-Render ist nice-to-have, schweigend ignorieren.
                }
            }
        }
        if (Array.isArray(reply.program) && reply.program.length > 0) {
            // das Wort des Spielers ist die Ursache der Tat der KI (die Stimme des Felds nennt es, `_tatWerten`)
            const result = this.dslRun(reply.program, { source: "llm:grok", grund: userText });
            // Die KI als Regel-Schreiberin: ein LLM-rule-Programm registriert eine stehende Regel (ephemer
            // per Default, whitelist-gesichert); ihre Fitness läuft über das Lebens-Fenster, NICHT über den
            // 5-s-Gesten-Finalizer (der nur die Registrierung mäße).
            if (result.ok && reply.program[0] === "rule") {
                appendChatOutput(`(${compName} stellt ein Gesetz auf — sieh es in den Fähigkeiten unter Gesetze.)`);
            } else if (result.ok) {
                const weicht = this._ergebnisSatz(result.log);
                if (!weicht)
                    // die Tat in Worten (`describeProgram`), nie das rohe Programm (V-D8: ids und DSL-JSON im Spieler-Chat)
                    appendChatOutput(`(Welt verändert: ${compName} ${this.describeProgram(reply.program)}.)`);
                if (weicht) appendChatOutput(`(${compName}-Vorschlag: ${weicht.satz})`);
                // Wie ein Chat-Programm: in Pattern-Memory verknüpfen via
                // recentKeywords (die enthalten den userText bereits).
                const historyEntry = {
                    id: `llm_${this.state.dsl.nextEntryId++}`,
                    program: reply.program,
                    at: performance.now() / 1000,
                    outcome: result.outcome,
                    ok: true,
                    fitness: 0,
                    finalized: false,
                };
                this.state.dsl.history.push(historyEntry);
                if (this.state.dsl.history.length > this.state.dsl.historyCap) {
                    this.state.dsl.history = this.state.dsl.history.slice(-this.state.dsl.historyCap);
                }
                this.state.dsl.pendingOutcomes.push({
                    name: historyEntry.id,
                    program: reply.program,
                    outcome: result.outcome,
                    historyRef: historyEntry,
                });
            } else {
                const weicht = this._ergebnisSatz(result.log);
                appendChatOutput(
                    weicht
                        ? `(${compName}-Vorschlag: ${weicht.satz})`
                        : `(${compName}-Vorschlag abgelehnt: ${this._dslAbsageSatz(result.log)})`
                );
            }
        }
        this.llmUpdateStatus();
        return true;
    }

    // === Chat-Routing: spreche EINE Kreatur an ===
    // "Name, message" / "Name: message" am Zeilenanfang (oder @Name) → llmCallCreature mit ihrer
    // Persona, Antwort als "Name: …", Memory-Eintrag "spoken" bei der Kreatur. true = als
    // Kreatur-Gespräch gehandhabt, false = Text passt nicht zum Pattern.
    _parseCreatureAddress(text) {
        if (typeof text !== "string") return null;
        // @Name text ist die eindeutige Geste (höchste Priorität — ein @ am Zeilenanfang ist kein
        // normaler Text); optionales Trennzeichen: "@Bran wie gehts" / "@Bran, hallo".
        let m = text.match(/^@([A-Za-zÄÖÜäöüß][A-Za-zÄÖÜäöüß0-9_-]{0,30})[,:]?\s+(.+)$/);
        if (m) return { name: m[1], message: m[2].trim(), explicit: true };
        // Fallback "Nira, hallo" / "Nira: hallo". Bewusst KEIN Pattern ohne Trenner ("Nira hallo") —
        // sonst würde jeder Satz, der mit einem möglichen Kreatur-Namen beginnt, zur Adresse.
        m = text.match(/^([A-Za-zÄÖÜäöüß][A-Za-zÄÖÜäöüß0-9_-]{0,30})[,:]\s*(.+)$/);
        if (m) return { name: m[1], message: m[2].trim(), explicit: false };
        return null;
    }

    // === Proaktive Sprache (pre-baked phrases) ===
    // Die Kreatur spricht bei Events; Throttle 60 s je Kreatur + 8 s global, Verletzung = silent drop
    // (keine Queue → keine verzögerte Lawine). Default an, aus via state.creatureProactiveSpeechEnabled.
    // Render wie maybeAnswerCreature (DOM mit Soul-Span) — dieselbe Identitäts-Farbe wie reaktiv.
    _creatureSpeakProactive(creature, eventType, ctx = {}) {
        if (!creature || !creature.userData) return false;
        if (this.state.creatureProactiveSpeechEnabled === false) return false;
        const pool = AnazhRealm.CREATURE_PROACTIVE_PHRASES[eventType];
        if (!pool) return false;
        // Throttle: per-Kreatur UND welt-weit müssen erfüllt sein. Die Gaps atmen mit der Emotions-Balance
        // (derselbe Leser wie die Nexus-Ökonomie): kippt der Spieler, werden die Stimmen stiller (bis ×2).
        // Der Toggle bleibt der harte Aus.
        const now = performance.now() / 1000;
        const gapMul = 2 - this._emotionBalanceFactor();
        const lastSelf = creature.userData.lastProactiveSpeech || -Infinity;
        if (now - lastSelf < AnazhRealm.CREATURE_PROACTIVE_GAP_PER_CREATURE * gapMul) return false;
        const lastGlobal = this.state.lastCreatureProactiveSpeech || -Infinity;
        if (now - lastGlobal < AnazhRealm.CREATURE_PROACTIVE_GAP_GLOBAL * gapMul) return false;
        // Soul-spezifische Phrasen wählen, mit default-Fallback.
        const soulName = creature.userData.soul || "default";
        const phrases = pool[soulName] || pool.default || pool.wesen || [];
        if (phrases.length === 0) return false;
        // die Wahl der Worte zieht aus dem Fauna-Strom der Stimme (Γ5): dieselbe Welt, dieselben Worte
        const tpl = phrases[Math.floor(this._faunaRng("stimme")() * phrases.length)];
        // Template-Variablen ersetzen. Unbekannte Variablen bleiben drin
        // (helfen beim Debug-Erkennen).
        const text = tpl.replace(/\$\{(\w+)\}/g, (m, key) => {
            const v = ctx[key];
            return v !== undefined && v !== null ? String(v) : m;
        });
        const name = creature.userData.name || "Wesen";
        // Direkter DOM-Pfad (analog maybeAnswerCreature V1.1 Soul-Span).
        const chatOutput = typeof document !== "undefined" ? document.getElementById("chat-output") : null;
        if (chatOutput) {
            const line = document.createElement("div");
            line.className = "chat-proactive-line";
            const nameSpan = document.createElement("span");
            nameSpan.className = `chat-creature-name soul-${soulName}`;
            nameSpan.textContent = `${name}: `;
            line.appendChild(nameSpan);
            line.appendChild(document.createTextNode(text));
            chatOutput.appendChild(line);
            chatOutput.scrollTop = chatOutput.scrollHeight;
        }
        // Throttle-Stempel setzen — erst NACH erfolgreichem Render.
        creature.userData.lastProactiveSpeech = now;
        this.state.lastCreatureProactiveSpeech = now;
        // Memory-Eintrag (Vision §1.1 — die Kreatur erinnert sich an
        // ihre Aussagen). Spec-Filter zählt das NICHT als Skill.
        if (typeof this._creatureRemember === "function") {
            this._creatureRemember(creature, "spoke_proactive", { event: eventType, said: text.slice(0, 120) });
        }
        return true;
    }

    async maybeAnswerCreature(userText, appendChatOutput) {
        const parsed = this._parseCreatureAddress(userText);
        if (!parsed) return false;
        const creature = this._findCreatureByName(parsed.name);
        if (!creature) {
            // Name am Anfang, aber keine solche Kreatur: höflich ablehnen statt ein Gespräch zu faken;
            // LLM/Suggestion-Fallback läuft ohnehin weiter.
            appendChatOutput(`(Niemand namens „${parsed.name}" hört zu.)`);
            return true;
        }
        // LLM-Aktiv-Check (analog maybeAnswerWithLlm): wenn nicht aktiv,
        // schreiben wir einen poetischen Hinweis statt der LLM-Antwort.
        const llm = this.state.llm;
        if (!llm || !llm.enabled) {
            appendChatOutput(`(${parsed.name} hört dich, aber keine Stimme öffnet sich. Aktiviere die LLM-Stimme.)`);
            return true;
        }
        appendChatOutput(`(${parsed.name} sammelt sich…)`);
        const reply = await this.llmCallCreature(creature, parsed.message);
        if (reply.error) {
            appendChatOutput(`(${parsed.name} schweigt: ${reply.error})`);
            this.llmUpdateStatus();
            return true;
        }
        if (reply.say) {
            const sayText = String(reply.say).slice(0, 400);
            // Soul-farbiger Name: direkter DOM-Pfad statt appendChatOutput, damit der Name ein eigenes
            // <span> mit Soul-Klasse bekommt; ohne DOM (headless) plain-Text.
            const soulName = (creature.userData && creature.userData.soul) || "wesen";
            const chatOutput = typeof document !== "undefined" ? document.getElementById("chat-output") : null;
            if (chatOutput) {
                const line = document.createElement("div");
                const nameSpan = document.createElement("span");
                nameSpan.className = `chat-creature-name soul-${soulName}`;
                nameSpan.textContent = `${parsed.name}: `;
                line.appendChild(nameSpan);
                line.appendChild(document.createTextNode(sayText));
                chatOutput.appendChild(line);
                chatOutput.scrollTop = chatOutput.scrollHeight;
            } else {
                appendChatOutput(`${parsed.name}: ${sayText}`);
            }
            // Memory: die Kreatur erinnert sich daran, dass der Schöpfer
            // mit ihr sprach. Vision §1.1 — Geschichte wächst durch Geste.
            if (typeof this._creatureRemember === "function") {
                this._creatureRemember(creature, "spoken", { said: sayText.slice(0, 120) });
            }
            // List-UI refresh (Memory-Length könnte zu neuer Spec-Pill führen
            // wenn say als skill-key zählen würde — tut es aktuell nicht,
            // aber Refresh ist günstig).
            this._uiDirty("hof"); // W3 (V18.176) — der UI-Puls (war _renderCreatureListUI direkt)
        }
        // Welt-Aktion-Vorschlag der Kreatur: Whitelist CREATURE_PROPOSED_OPS (atmosphärisch + Terrain).
        // schöpfer = auto-execute; pfad/frieden = Inline-Buttons zum Bestätigen.
        if (Array.isArray(reply.program) && reply.program.length > 0) {
            this._handleCreatureProposedProgram(creature, parsed.name, reply.program);
        }
        this.llmUpdateStatus();
        return true;
    }

    // === Welt-Aktion-Vorschlag verarbeiten ===
    // Whitelist rekursiv via _isCreatureProposalAllowed (Defense in Depth; verboten → Memory +
    // INFO-Log + Chat-Hinweis). schöpfer → auto-execute (ohne Zusage: das Wesen handelt als Welt, `_executeCreatureProgram` —
    // es wünscht das Wetter nur und schreibt nie gegen das Wort des Spielers), frieden/pfad → [Ausführen]/[Ablehnen].
    // Memory-Einträge (proposed_action / accepted_action / auto_executed_action / rejected_action /
    // proposal_blocked) lassen die Kreatur aus den Spieler-Reaktionen lernen.
    _handleCreatureProposedProgram(creature, name, program) {
        const allowed = this._isCreatureProposalAllowed(program);
        if (!allowed.ok) {
            // Sandbox-Block: Memory + sichtbarer Chat-Hinweis (vision-treuer
            // als stilles Verschlucken — Spieler sieht den Konflikt).
            if (typeof this._creatureRemember === "function") {
                this._creatureRemember(creature, "proposal_blocked", {
                    reason: allowed.reason,
                    forbiddenOp: allowed.forbiddenOp || null,
                    program: JSON.stringify(program).slice(0, 120),
                });
            }
            const chatOutput = typeof document !== "undefined" ? document.getElementById("chat-output") : null;
            if (chatOutput) {
                const line = document.createElement("div");
                line.className = "chat-proposal-blocked";
                line.textContent = `(${name}'s Vorschlag verworfen: ${allowed.forbiddenOp || allowed.reason})`;
                chatOutput.appendChild(line);
                chatOutput.scrollTop = chatOutput.scrollHeight;
            }
            this.log(
                `Kreatur-Vorschlag verworfen (${allowed.reason}): ${JSON.stringify(program).slice(0, 100)}`,
                "INFO"
            );
            return false;
        }
        // proposed_action erinnern (auch bei auto-execute — Schritt vor der Aktion)
        if (typeof this._creatureRemember === "function") {
            this._creatureRemember(creature, "proposed_action", {
                program: JSON.stringify(program).slice(0, 200),
            });
        }
        // Modus-abhängige Behandlung
        const mode = typeof this.getGameMode === "function" ? this.getGameMode() : "frieden";
        if (mode === "schöpfer") {
            return this._executeCreatureProgram(creature, name, program, /*auto*/ true);
        }
        // frieden + pfad: inline-Buttons im Chat
        return this._renderCreatureProposalButtons(creature, name, program);
    }

    // Ausführen über die dslRun-Sandbox. Die Quelle trägt die ZUSAGE (das Gesetz der Schreiber, `_himmelSchreiber`): sagte der
    // Spieler zu (sein Klick auf „Ausführen"), läuft das Programm als „zusage:creature:<name>" und schreibt wie ein Gesetz des
    // Spielers; läuft es von selbst (der Schöpfer-Modus, auch ohne Zutun des Spielers über den Level-Aufstieg), ist es
    // „creature:<name>" — ein Wesen der Welt, das das Wetter nur wünscht und nie gegen das Wort des Spielers schreibt. Bis zur
    // Gegenprüfung trugen beide „creature:" (als Zusage gelesen): ein Wesen im Schöpfer-Modus drehte „setze wetter sonnig" zu
    // Regen und nahm dem Spieler sein Wort. ≠ "human" → kein Broadcast (P2P-Loop-Schutz), wie llm:grok / nexus / emotion.
    _executeCreatureProgram(creature, name, program, auto) {
        const result = this.dslRun(program, { source: auto ? `creature:${name}` : `zusage:creature:${name}` });
        const ok = result && result.ok;
        // was das Gesetz der Schreiber aus dem Wetter-Wort des Wesens machte (gehalten / gewünscht) — der Hinweis sagt es
        const wetter = ((result && result.log) || []).find(
            (e) => e && (e.event === "wetter_gehalten" || e.event === "wetter_gewuenscht")
        );
        const memType = auto ? "auto_executed_action" : "accepted_action";
        if (typeof this._creatureRemember === "function") {
            this._creatureRemember(creature, memType, {
                program: JSON.stringify(program).slice(0, 200),
                ok,
            });
        }
        // Sichtbarer Chat-Hinweis (auch bei auto-execute, damit Spieler
        // sieht was passiert ist)
        const chatOutput = typeof document !== "undefined" ? document.getElementById("chat-output") : null;
        if (chatOutput) {
            const line = document.createElement("div");
            line.className = ok ? "chat-proposal-executed" : "chat-proposal-failed";
            const tag = auto ? "auto-ausgeführt" : "ausgeführt";
            const summary = JSON.stringify(program).slice(0, 100);
            if (ok) {
                const zusatz = !wetter
                    ? ""
                    : wetter.event === "wetter_gehalten"
                      ? ` — das Wetter hält dein Wort (${this.state.wetterWort || "Halt"})`
                      : ` — der Wetter-Zug zieht ${wetter.wort} als Nächstes`;
                line.textContent = `(${name}'s Vorschlag ${tag}: ${summary}${zusatz})`;
            } else {
                const reason =
                    (result &&
                        result.log &&
                        result.log.find((e) => /budget|invalid|exception|unknown/.test(e.event))) ||
                    null;
                line.textContent = `(${name}'s Vorschlag fehlgeschlagen: ${reason ? reason.event : "Sandbox"})`;
            }
            chatOutput.appendChild(line);
            chatOutput.scrollTop = chatOutput.scrollHeight;
        }
        return ok;
    }

    // Inline-Buttons im Chat — Spieler bestätigt oder lehnt ab. Click-
    // Handler ist eine Closure auf creature + program; bei Click wird die
    // Zeile durch ein Hinweis-Resultat ersetzt (kein separates Render).
    _renderCreatureProposalButtons(creature, name, program) {
        const chatOutput = typeof document !== "undefined" ? document.getElementById("chat-output") : null;
        if (!chatOutput) {
            // Headless-Fallback: ohne UI direkt akzeptieren wäre Vision-Bruch
            // (Spieler entscheidet). Stattdessen Memory + INFO-Log, kein run.
            this.log(
                `Kreatur-Vorschlag im Headless ohne UI — übergangen: ${JSON.stringify(program).slice(0, 80)}`,
                "INFO"
            );
            return false;
        }
        const line = document.createElement("div");
        line.className = "chat-proposal-pending";
        const intro = document.createElement("span");
        const summary = JSON.stringify(program).slice(0, 120);
        intro.textContent = `${name} schlägt vor: ${summary}  `;
        line.appendChild(intro);
        const yesBtn = document.createElement("button");
        yesBtn.type = "button";
        yesBtn.className = "chat-proposal-btn accept";
        yesBtn.textContent = "Ausführen";
        const noBtn = document.createElement("button");
        noBtn.type = "button";
        noBtn.className = "chat-proposal-btn reject";
        noBtn.textContent = "Ablehnen";
        line.appendChild(yesBtn);
        line.appendChild(noBtn);
        chatOutput.appendChild(line);
        chatOutput.scrollTop = chatOutput.scrollHeight;

        const cleanup = () => {
            // Entfernt die Buttons damit nicht doppelt geklickt werden kann
            yesBtn.remove();
            noBtn.remove();
        };
        yesBtn.addEventListener("click", () => {
            cleanup();
            this._executeCreatureProgram(creature, name, program, /*auto*/ false);
        });
        noBtn.addEventListener("click", () => {
            cleanup();
            if (typeof this._creatureRemember === "function") {
                this._creatureRemember(creature, "rejected_action", {
                    program: JSON.stringify(program).slice(0, 200),
                });
            }
            const result = document.createElement("span");
            result.className = "chat-proposal-rejected-tag";
            result.textContent = " (abgelehnt)";
            line.appendChild(result);
        });
        return true;
    }

    // Der Proxy der Stimme ist der save-server, der die Seite liefert (sein `/api/proxy/llm`): der Ursprung der Seite —
    // bis 07.10. stand hier fest localhost:4312, auf jedem anderen Port fragte die Stimme einen fremden Server.
    _llmProxyUrl() {
        const o =
            typeof location !== "undefined" && /^https?:$/.test(location.protocol)
                ? location.origin
                : "http://localhost:4312";
        return o + "/api/proxy/llm";
    }

    llmUpdateStatus() {
        const el = document.getElementById("llm-status");
        if (!el) return;
        const llm = this.state.llm;
        const defs = this.llmProviderDefs();
        const def = defs[llm.provider];
        if (llm.lastError) {
            el.textContent = `Fehler (${def ? def.label : llm.provider}): ${llm.lastError}`;
            return;
        }
        if (!def) {
            el.textContent = `Unbekannter Provider: ${llm.provider}`;
            return;
        }
        const cfg = llm.providerConfig[llm.provider];
        if (!llm.enabled) {
            if (def.requiresKey && (!cfg || !cfg.apiKey)) {
                el.textContent = `${def.label}: Schlüssel fehlt.`;
            } else {
                el.textContent = `${def.label}: bereit, inaktiv.`;
            }
            return;
        }
        const compName = (this.state.grok && this.state.grok.companionName) || "Grok";
        el.textContent = llm.inFlight ? `${compName} denkt…` : `Aktiv: ${def.label} (${cfg.model}).`;
    }

    llmRefreshModelOptions() {
        // Modell = Free-Text-Input; die datalist-Vorschläge sind Tipp-Hilfen, kein Pflicht-Set.
        const modelInput = document.getElementById("llm-model");
        const dataList = document.getElementById("llm-model-suggestions");
        if (!modelInput) return;
        const defs = this.llmProviderDefs();
        const def = defs[this.state.llm.provider];
        if (!def) return;
        const cfg = this.state.llm.providerConfig[this.state.llm.provider];
        if (dataList) {
            dataList.innerHTML = "";
            for (const m of def.models) {
                const opt = document.createElement("option");
                opt.value = m.id;
                opt.label = m.label;
                dataList.appendChild(opt);
            }
        }
        // Aktuellen Wert in Input setzen — entweder gespeicherter cfg.model
        // (auch wenn er nicht in der Vorschlagsliste steht!) oder erstes Vorschlags-
        // Modell als Default.
        if (cfg && cfg.model) {
            modelInput.value = cfg.model;
        } else if (def.models[0]) {
            modelInput.value = def.models[0].id;
            if (cfg) cfg.model = def.models[0].id;
        }
    }

    llmRefreshProviderUI() {
        const keyInput = document.getElementById("llm-key");
        const keyRow = document.getElementById("llm-key-row");
        const endpointRow = document.getElementById("llm-endpoint-row");
        const endpointInput = document.getElementById("llm-endpoint");
        const hintEl = document.getElementById("llm-provider-hint");
        const defs = this.llmProviderDefs();
        const def = defs[this.state.llm.provider];
        if (!def) return;
        const cfg = this.state.llm.providerConfig[this.state.llm.provider];
        if (keyInput) {
            keyInput.value = (cfg && cfg.apiKey) || "";
            // V7.94 — Ollama-spezifischer Placeholder weil der Key bei
            // ollama optional ist (nur für gehostete Setups). Andere
            // Provider zeigen ihren Key-Prefix als Placeholder.
            if (this.state.llm.provider === "ollama") {
                keyInput.placeholder = "API-Key (optional, nur für gehostete Setups)";
            } else {
                keyInput.placeholder = def.keyPrefix ? `${def.keyPrefix}…` : "API-Key";
            }
        }
        // V7.94 — Key-Feld bei Ollama auch sichtbar (optional). Für die
        // anderen Provider unverändert: nur sichtbar wenn requiresKey.
        if (keyRow) keyRow.hidden = !def.requiresKey && this.state.llm.provider !== "ollama";
        if (endpointRow) endpointRow.hidden = this.state.llm.provider !== "ollama";
        if (endpointInput) endpointInput.value = (cfg && cfg.endpoint) || AnazhRealm.OLLAMA_DEFAULT_ENDPOINT;
        // V7.96 — Proxy-Toggle nur bei Ollama sichtbar (andere Provider haben CORS).
        const proxyRow = document.getElementById("llm-proxy-row");
        const proxyHint = document.getElementById("llm-proxy-hint");
        const proxyCheckbox = document.getElementById("llm-use-proxy");
        const isOllama = this.state.llm.provider === "ollama";
        // Toggle sichtbar bei Ollama; bei lokaler URL (localhost/127.0.0.1) sagt das Label "nicht nötig
        // für lokales Setup".
        if (proxyRow) proxyRow.hidden = !isOllama;
        if (proxyHint) proxyHint.hidden = !isOllama;
        if (proxyCheckbox) proxyCheckbox.checked = !!(cfg && cfg.useProxy);
        if (isOllama && cfg) {
            const ep = String(cfg.endpoint || "");
            const isLocal = /(localhost|127\.0\.0\.1)/i.test(ep);
            const proxyLabel = proxyRow ? proxyRow.querySelector("label span") : null;
            if (proxyLabel) {
                proxyLabel.textContent = isLocal
                    ? "Cloud über save-server-Proxy (für lokales Ollama nicht nötig)"
                    : "Cloud über save-server-Proxy (löst CORS)";
            }
        }
        if (hintEl) hintEl.textContent = def.hint || "";
        this.llmRefreshModelOptions();
        this.llmUpdateStatus();
    }

    initLlmUI() {
        const providerSel = document.getElementById("llm-provider");
        const keyInput = document.getElementById("llm-key");
        const endpointInput = document.getElementById("llm-endpoint");
        const modelSel = document.getElementById("llm-model");
        const saveBtn = document.getElementById("llm-save");
        const clearBtn = document.getElementById("llm-clear");
        const toggleBtn = document.getElementById("llm-toggle");
        if (!providerSel || !keyInput || !modelSel || !saveBtn || !toggleBtn) return;
        // Provider-Optionen aus llmProviderDefs befüllen.
        const defs = this.llmProviderDefs();
        providerSel.innerHTML = "";
        for (const [name, def] of Object.entries(defs)) {
            const opt = document.createElement("option");
            opt.value = name;
            opt.textContent = def.label;
            providerSel.appendChild(opt);
        }
        providerSel.value = this.state.llm.provider;
        toggleBtn.setAttribute("aria-pressed", this.state.llm.enabled ? "true" : "false");
        toggleBtn.textContent = this.state.llm.enabled ? "Deaktivieren" : "Aktivieren";
        this.llmRefreshProviderUI();
        providerSel.addEventListener("change", () => {
            this.state.llm.provider = providerSel.value;
            // Beim Provider-Wechsel deaktivieren — User soll bewusst neu aktivieren.
            this.state.llm.enabled = false;
            this.state.llm.lastError = null;
            toggleBtn.setAttribute("aria-pressed", "false");
            toggleBtn.textContent = "Aktivieren";
            this.llmPersist();
            this.llmRefreshProviderUI();
        });
        // V7.97 — modelSel ist jetzt ein <input>, change feuert bei
        // Enter/Blur. Free-Text-Input erlaubt eigene Modell-Namen
        // (qwen3.5:cloud, gpt-oss, meine-fine-tune:v2, etc.).
        modelSel.addEventListener("change", () => {
            const cfg = this.state.llm.providerConfig[this.state.llm.provider];
            cfg.model = String(modelSel.value || "").trim();
            this.llmPersist();
            this.llmUpdateStatus();
        });
        // V7.96 — Proxy-Toggle wire-up. Bei Klick: useProxy in Config setzen
        // + persistieren. Beim Aktivieren des Toggles wird im Hint klargemacht
        // dass der save-server laufen muss; UI fängt das nicht ab.
        const proxyCheckbox = document.getElementById("llm-use-proxy");
        if (proxyCheckbox) {
            proxyCheckbox.addEventListener("change", () => {
                const cfg = this.state.llm.providerConfig.ollama;
                if (cfg) cfg.useProxy = !!proxyCheckbox.checked;
                this.llmPersist();
                this.llmUpdateStatus();
            });
        }
        if (endpointInput) {
            endpointInput.addEventListener("change", () => {
                const cfg = this.state.llm.providerConfig.ollama;
                cfg.endpoint = endpointInput.value.trim() || AnazhRealm.OLLAMA_DEFAULT_ENDPOINT;
                this.llmPersist();
                this.llmUpdateStatus();
                // V7.97 — Endpoint-Wechsel triggert Proxy-Label-Refresh
                // (local vs Cloud-Hinweis aktualisiert sich live).
                this.llmRefreshProviderUI();
            });
        }
        saveBtn.addEventListener("click", () => {
            const def = this.llmProviderDefs()[this.state.llm.provider];
            const cfg = this.state.llm.providerConfig[this.state.llm.provider];
            const trimmed = keyInput.value.trim();
            cfg.apiKey = trimmed;
            cfg.model = modelSel.value;
            if (this.state.llm.provider === "ollama" && endpointInput) {
                cfg.endpoint = endpointInput.value.trim() || AnazhRealm.OLLAMA_DEFAULT_ENDPOINT;
            }
            // Sanfte Format-Warnung gegen Provider/Key-Mismatch — z. B. Gemini-
            // Key (AIza…) versehentlich im OpenRouter-Feld. Verhindert Save
            // nicht, macht den Fehler aber sofort sichtbar.
            if (def.requiresKey && def.keyPrefix && trimmed && !trimmed.startsWith(def.keyPrefix)) {
                this.state.llm.lastError = `Achtung — der Schlüssel beginnt nicht mit "${def.keyPrefix}". Sicher, dass das der richtige Provider ist?`;
            } else {
                this.state.llm.lastError = null;
            }
            this.llmPersist();
            this.llmUpdateStatus();
        });
        if (clearBtn) {
            clearBtn.addEventListener("click", () => {
                const cfg = this.state.llm.providerConfig[this.state.llm.provider];
                cfg.apiKey = "";
                this.state.llm.enabled = false;
                keyInput.value = "";
                toggleBtn.setAttribute("aria-pressed", "false");
                toggleBtn.textContent = "Aktivieren";
                this.llmPersist();
                this.llmUpdateStatus();
            });
        }
        toggleBtn.addEventListener("click", () => {
            const def = this.llmProviderDefs()[this.state.llm.provider];
            const cfg = this.state.llm.providerConfig[this.state.llm.provider];
            if (def.requiresKey && (!cfg || !cfg.apiKey)) {
                this.state.llm.lastError = "Bitte erst Schlüssel speichern.";
                this.llmUpdateStatus();
                return;
            }
            this.state.llm.enabled = !this.state.llm.enabled;
            this.state.llm.lastError = null;
            toggleBtn.setAttribute("aria-pressed", this.state.llm.enabled ? "true" : "false");
            toggleBtn.textContent = this.state.llm.enabled ? "Deaktivieren" : "Aktivieren";
            this.llmPersist();
            this.llmUpdateStatus();
            // „Aktiv" erst nach der Frage an den Dienst (V-D6): ein lokaler Endpunkt ohne Dienst steht sofort im Status.
            if (this.state.llm.enabled) this._llmErreichbarkeit();
        });
    }
}
_stammZonen(AnazhRealm, [AnazhRealm_feld_nexus]);

// ===== ATLAS · Feld/nexus — Außen-Konstanten =====
// KIND_POLICY (Studio/bruecke) — DIE EINE DOMÄNEN-POLICY des Rezept-Buchs; eine neue Domäne bringt ihre Zeile im Buch
// (B7, `_kindPolicyVereinen`), kein Logik-Zweig. Felder: prefix (Blueprint = prefix+id; auch _foundryPresetFor) ·
// donor (Judge-Parts-Spender, fail-closed; eine Buch-Zeile trägt `substanz`) · grown (Pflanzen-Identität via _grownSpecies, der NAME
// ist load-bearing) · builtIn · placeExtra ("forest" = _forestExtraSpecies, null = nur Katalog) ·
// impostor (Fernstufe = 8-Winkel-Billboard; `_foundryPresetIsTree` liest NUR diese Zeile).
// ACHSEN_FARBE — die EINE eingefrorene Farb-Quelle der Feld-Achsen (dslComposeFieldColor, awe).
AnazhRealm.ACHSEN_FARBE = Object.freeze({
    magieleitung: "#d4a3ff", // magisches Lila
    glut: "#ff7a59", // warmes Feuer
    lebendig: "#7bd389", // frisches Gruen
});

// GESTURE_CRYSTAL — GESTE → GESETZ: eine wiederholt bewährte Geste (finalized, fitness ≥ minFitness,
// ≥ minRuns Läufe desselben Op-Kopfes) kristallisiert zu einer stehenden Regel; die
// Emotions-Signatur ihres Kontexts gebiert die Bedingung.
// WORLD_RULES (unten) — frozen, _tickWorldRules liest jeden Frame: cap (max Regeln, Verdrängung in
// _evictWorldRule) · budgetPerFrame (max Effekte je Frame) · defaultEverySec · minEverySec (Floor
// gegen Per-Frame-Feuern). Nexus-Komposition (composeRuleProb, ruleEverySec…, ruleTtl…) + Fitness über
// ein Lebens-Fenster (costBudgetMs/renewFitness/mutateSurvivorProb): eine Nexus-Regel ist EPHEMER
// (ttlSec) — gut → erneuern, schlecht/inert → verfallen.
AnazhRealm.GESTURE_CRYSTAL = Object.freeze({
    cooldownSec: 45, // höchstens alle 45 s ein Kristallisations-Versuch
    minFitness: 0.65, // nur wirklich bewährte Läufe zählen
    minRuns: 3, // Wiederholung macht das Gesetz (eine Einzeltat bleibt Geste)
    minEmotionIntensity: 0.25, // darunter trägt der Kontext keine Signatur → random_chance
});
// Infrastruktur-Defaults an EINER Stelle (Drift-Schutz): lokaler Ollama-Server und
// Default-Signaling-Adresse.
AnazhRealm.OLLAMA_DEFAULT_ENDPOINT = "http://localhost:11434";
// Die Kopfzeile des Vertrags der Welt-KI ({say, program}): der Prompt trägt sie, der ollama-Body erkennt an ihr, dass die
// Antwort-Form (`_kiAntwortSchema`) gilt — Persona-, Übersetzer- und Reflexions-Prompts tragen sie nie.
AnazhRealm.KI_WELT_FORM = "Antworte IMMER als striktes JSON-Objekt mit zwei Feldern:";
// Claude-5er-Generation (Sonnet 5.5 · Opus 5/5.5 · Fable 5/5.1): thinking immer an,
// `output_config.effort`, serverseitige `fallbacks` — der EINE Prüfer für Header + Body.
AnazhRealm._llmFuenferModell = function (model) {
    return typeof model === "string" && /^claude-(sonnet-5-5|opus-5|fable-5)/.test(model);
};
