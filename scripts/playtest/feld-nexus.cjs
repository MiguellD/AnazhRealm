"use strict";
// scripts/playtest/feld-nexus.cjs — der Richter von Feld/nexus (spec/stamm/modul-karte.json): Nexus: Fitness · Mutation · Komposition · Gesten-Regeln.
// 4 Band/Bänder in Lauf-Reihenfolge, je Band das Modul, dessen Glieder er am meisten ruft; gestellt von
// `node scripts/stamm-umzug.cjs --richter` — ein neuer Band steht hier und in der Reihe des Läufers scripts/playtest.cjs.

const { safeEvaluate, erreichbar, ohneWurf } = require("../playtest.cjs");

async function checkBandRing2Extended({ page, check, logs, errors, finalState }) {
    void errors;
    void finalState;
    // ### Ring 2 Phase 3 – Chat → DSL ###
    // Parser liefert das richtige AST; processChatCommand routet durch dslRun (state.dsl.lastUserProgram
    // + Welt-Effekt); chatSuggest erkennt einen verschriebenen Befehl per Levenshtein.
    const phase3Results = await safeEvaluate(page, async () => {
        const out = {};

        // 1. Parser-Smoketest
        const parsedWeather = r.parseChatToDsl("Setze Wetter rainy");
        out.parseWeatherOk =
            !!parsedWeather &&
            Array.isArray(parsedWeather.program) &&
            parsedWeather.program[0] === "weather" &&
            parsedWeather.program[1] === "rainy";

        const parsedSpawn = r.parseChatToDsl("Spawne Kreaturen 3");
        out.parseSpawnOk =
            !!parsedSpawn &&
            Array.isArray(parsedSpawn.program) &&
            parsedSpawn.program[0] === "repeat" &&
            parsedSpawn.program[1] === 3 &&
            Array.isArray(parsedSpawn.program[2]) &&
            parsedSpawn.program[2][0] === "spawn_creature";

        out.parseUnknownReturnsNull = r.parseChatToDsl("Tu irgendwas Wildes") === null;

        // 2. End-to-end: processChatCommand routet auf DSL.
        // Chat-Input/Output sicherstellen (Headless-DOM hat sie).
        const weatherBefore = st.weather;
        r.processChatCommand("Setze Wetter rainy");
        out.chatRoutedToDsl =
            Array.isArray(st.dsl.lastUserProgram) &&
            st.dsl.lastUserProgram[0] === "weather" &&
            st.dsl.lastUserProgram[1] === "rainy";
        out.weatherActuallyChanged = st.weather === "rainy";
        // Wetter wieder neutralisieren, damit andere Tests nicht verwirrt werden.
        r.processChatCommand("Setze Wetter sunny");
        out.weatherCleanup = st.weather === "sunny" && weatherBefore !== undefined;

        // 3. Levenshtein-Vorschlag bei Tippfehler
        const suggestion = r.chatSuggest("setze wettr rainy");
        out.suggestionForTypo = suggestion === "setze wetter rainy";

        // 4. Phase 3b: set_visible-Primitiv + Chat-Routing — `toggleTerrain` schaltet den Boden-Satz (Welle B:
        // der ganze Ring ist EIN Objekt, die Chunk-Meshes sind CPU-Körper).
        const voxelChunksBefore = st.voxelChunks ? st.voxelChunks.size : 0;
        const someVoxelVisible = () => {
            const s = st.chunkSaetze ? st.chunkSaetze.get("boden") : null;
            return !!(s && s.mesh && s.mesh.visible && s.mesh.parent === st.scene);
        };
        r.processChatCommand("Boden deaktivieren");
        out.terrainHiddenViaDsl = voxelChunksBefore > 0 && !someVoxelVisible();
        r.processChatCommand("Boden aktivieren");
        out.terrainShownViaDsl = someVoxelVisible();

        // 5. Phase 3b: record_narrative-Primitiv via "Erzähle ..."
        const kbBefore = st.knowledgeBase.filter((k) => k.type === "narrative").length;
        r.processChatCommand("Erzähle Drachen leben hier");
        const narratives = st.knowledgeBase.filter((k) => k.type === "narrative");
        out.narrativeRecorded =
            narratives.length === kbBefore + 1 && narratives[narratives.length - 1].content === "Drachen leben hier";

        // 6. Phase 3b: set_visible mit unbekanntem Target wird abgelehnt
        const beforeLog = st.dsl.lastUserOutcome ? st.dsl.lastUserOutcome.errors : 0;
        const badResult = r.dslRun(["set_visible", "mond", true]);
        out.invalidTargetRejected = badResult.log.some((e) => e.event === "invalid_set_visible_target");
        void beforeLog;

        // 7. Phase 5: "Lerne Fähigkeit" speichert DSL-Programm
        r.processChatCommand("Lerne Fähigkeit blaukreaturen Ändere Farbe von Kreaturen zu blue");
        const learned = st.dsl.abilities.find((a) => a.name === "blaukreaturen");
        out.learnedAbilityIsDsl =
            !!learned &&
            Array.isArray(learned.program) &&
            learned.program[0] === "creatures_color" &&
            learned.program[1] === "blue" &&
            learned.source === "human";

        // 8. Phase 5: "Führe Fähigkeit aus" ruft dslRun und mutiert state.
        // Kreatur ist Group; Color lebt auf Sub-Meshes.
        const someCreature = st.creatures[0];
        const readCreatureColor = (c) => {
            if (!c) return 0;
            if (c.material && c.material.color) return c.material.color.getHex();
            let hex = 0;
            if (typeof c.traverse === "function") {
                c.traverse((n) => {
                    if (!hex && n.isMesh && n.material && n.material.color) hex = n.material.color.getHex();
                });
            }
            return hex;
        };
        const colorBefore = readCreatureColor(someCreature);
        r.processChatCommand("Führe Fähigkeit aus blaukreaturen");
        const colorAfter = readCreatureColor(someCreature);
        // 0x0000ff = blue
        out.abilityExecutedMutatesWorld = colorAfter === 0x0000ff && colorBefore !== colorAfter;

        // 9. Phase 4: Save-Roundtrip — dslAbilities überleben localStorage
        r.saveState();
        const raw = await window.__stand();
        let parsed = null;
        try {
            parsed = JSON.parse(raw);
        } catch (e) {
            void e;
        }
        out.savedDslAbilitiesPresent =
            !!parsed &&
            Array.isArray(parsed.dslAbilities) &&
            parsed.dslAbilities.some((a) => a.name === "blaukreaturen");
        out.savedNoLegacyAbilitiesList = !!parsed && parsed.abilities === undefined;

        // „Der Nexus komponiert" (Gesten) auf Werkstatt-Stand: ✦-Abzeichen, „vor Xs",
        // direkt vergessbar (✕), gekappt + „leeren". Mehrere Nexus-Gesten anlegen + den Renderer prüfen.
        st.dsl.abilities.length = 0;
        for (let i = 0; i < 9; i++)
            st.dsl.abilities.push({
                name: `evo_test_${i}`,
                program: ["weather", "rainy"],
                source: "nexus",
                createdAt: performance.now() / 1000 - i * 2,
                fitness: 0.5,
            });
        st.hofGestenExpanded = false;
        r._statusRefs.abilitiesSignature = "";
        r.renderAbilitiesList();
        const aHost = document.getElementById("status-abilities");
        out.gestenKindBadge = !!aHost.querySelector(".ability-kind");
        out.gestenHasForget = !!aHost.querySelector("button[data-forget-ability]");
        out.gestenWhen = /vor \d+s/.test(aHost.textContent);
        const gestenRows = aHost.querySelectorAll(".ability-row").length;
        out.gestenCapped = gestenRows === 6 && /\+\s*3\s*ältere/.test(aHost.textContent);
        out.gestenClearBtn = !!aHost.querySelector("button[data-clear-abilities]");
        // ✕ vergisst eine Geste wirklich (evo_test_8 ist die NEUESTE → sicher in den gezeigten Top-6).
        const forgetBtn = aHost.querySelector('button[data-forget-ability="evo_test_8"]');
        if (forgetBtn) forgetBtn.click();
        out.gestenForgetWorks = !st.dsl.abilities.some((a) => a.name === "evo_test_8");
        // „leeren" wirft alle Nexus-Gesten
        const clearBtn = aHost.querySelector("button[data-clear-abilities]");
        if (clearBtn) clearBtn.click();
        out.gestenClearWorks = st.dsl.abilities.filter((a) => a.source === "nexus").length === 0;
        st.dsl.abilities.length = 0;
        r._statusRefs.abilitiesSignature = "";
        r.renderAbilitiesList();

        return out;
    });

    if (!phase3Results) {
        check("Phase-3-Snapshot erreichbar", false, "page.evaluate fehlgeschlagen");
    } else {
        check("Chat→DSL: 'Setze Wetter rainy' → ['weather','rainy']", phase3Results.parseWeatherOk);
        check("Chat→DSL: 'Spawne Kreaturen 3' → repeat+spawn_creature", phase3Results.parseSpawnOk);
        // Chat→DSL: unbekannter Befehl liefert null (kein Match)
        check("Chat→DSL: unbekannter Befehl liefert null", phase3Results.parseUnknownReturnsNull);
        check(
            "processChatCommand routet Welt-Befehl auf dslRun",
            phase3Results.chatRoutedToDsl,
            "state.dsl.lastUserProgram gesetzt"
        );
        check("DSL-Pfad mutiert tatsächlich state.weather", phase3Results.weatherActuallyChanged);
        check(
            "chatSuggest schlägt korrigierten Befehl bei Tippfehler vor",
            phase3Results.suggestionForTypo,
            "'setze wettr rainy' → 'setze wetter rainy'"
        );
        check("Phase 3b: 'Boden deaktivieren' via DSL versteckt Terrain", phase3Results.terrainHiddenViaDsl);
        check("Phase 3b: 'Boden aktivieren' via DSL macht Terrain wieder sichtbar", phase3Results.terrainShownViaDsl);
        check("Phase 3b: 'Erzähle ...' schreibt Narrativ in Knowledge-Base", phase3Results.narrativeRecorded);
        check("Phase 3b: set_visible mit ungültigem Target wird abgelehnt", phase3Results.invalidTargetRejected);
        check("Phase 5: 'Lerne Fähigkeit' speichert DSL-Programm in dsl.abilities", phase3Results.learnedAbilityIsDsl);
        check("Phase 5: 'Führe Fähigkeit aus' ruft dslRun und mutiert Welt", phase3Results.abilityExecutedMutatesWorld);
        check("Phase 4: Save persistiert dslAbilities", phase3Results.savedDslAbilitiesPresent);
        check(
            "Phase 4: Save enthält keine Legacy-abilities-Namensliste mehr",
            phase3Results.savedNoLegacyAbilitiesList
        );
        // Gesten: ✦-Abzeichen + 'vor Xs' (einmalige Tat, sichtbar WANN sie wirkte)
        check(
            "Gesten: ✦-Abzeichen + 'vor Xs'",
            phase3Results.gestenKindBadge && phase3Results.gestenWhen
        );
        // Gesten: jede Geste direkt vergessbar (✕) + die Liste hat 'leeren'
        check(
            "Gesten: jede Geste direkt vergessbar + die Liste hat 'leeren'",
            phase3Results.gestenHasForget && phase3Results.gestenClearBtn
        );
        // Gesten: Liste auf 6 gekappt + '+N ältere' (wächst nicht aus dem Bild)
        check(
            "Gesten: Liste auf 6 gekappt + '+N ältere'",
            phase3Results.gestenCapped
        );
        check("Gesten: ✕ vergisst eine Geste wirklich", phase3Results.gestenForgetWorks);
        check("Gesten: 'leeren' verwirft alle Nexus-Gesten", phase3Results.gestenClearWorks);
    }

    // ### Ring 2 Phase 6 – CSP ###
    // die CSP am Verhalten: jede Tür der Stimme geht durch, die Gegenprobe nie (diag-v1-pfad --korpus, WORT); hier: keine Verletzung im Lauf
    const cspViolationLogs = logs.filter((l) => /Content Security Policy directive/i.test(l.text));

    check(
        "Phase 6: keine CSP-Violations während Laufzeit",
        cspViolationLogs.length === 0,
        cspViolationLogs.length ? `${cspViolationLogs.length}× erste: ${cspViolationLogs[0].text.slice(0, 120)}` : ""
    );

    // ### Ring 2 Phase 7 – Fitness-V2 ###
    // (a) Selektion bevorzugt statistisch high-fitness, (b) Mutation behält strukturelle Invarianten,
    // (c) dslCompose mit historyProbability=1 nutzt tatsächlich die History.
    const phase7Results = await safeEvaluate(page, () => {
        const out = {};

        // Seeded RNG für deterministische Tests.
        const makeRng = (seed) => {
            let s = seed >>> 0 || 1;
            return () => {
                s = (s * 1664525 + 1013904223) >>> 0;
                return s / 4294967296;
            };
        };

        // History mit klar getrennten Fitness-Werten.
        const injHist = [
            {
                id: "lowfit",
                program: ["weather", "rainy"],
                outcome: { fpsBefore: 120, fpsAfter: 30 },
                ok: true,
            },
            {
                id: "highfit",
                program: ["weather", "sunny"],
                outcome: { fpsBefore: 120, fpsAfter: 119 },
                ok: true,
            },
        ];
        // (a) Selektion: über 500 Calls sollte highfit deutlich häufiger gewählt werden.
        const rngA = makeRng(42);
        let highCount = 0;
        let lowCount = 0;
        for (let i = 0; i < 500; i++) {
            const p = r.dslSelectByFitness(rngA, { history: injHist });
            if (Array.isArray(p) && p[1] === "sunny") highCount++;
            if (Array.isArray(p) && p[1] === "rainy") lowCount++;
        }
        out.highBeatsLowRatio = highCount / Math.max(1, lowCount);
        out.highBeatsLow = out.highBeatsLowRatio > 2.0;
        out.selectionCoversAll = highCount + lowCount === 500;

        // (b) Mutation behält chain-Wurzel und Array-Struktur
        const rngB = makeRng(7);
        const base = ["chain", ["weather", "sunny"], ["creatures_emotion", "happy"]];
        let chainRootKept = true;
        let allArrays = true;
        for (let i = 0; i < 50; i++) {
            const m = r.dslMutate(base, rngB);
            if (!Array.isArray(m) || m[0] !== "chain") chainRootKept = false;
            if (m.slice(1).some((sub) => !Array.isArray(sub))) allArrays = false;
        }
        out.mutationKeepsChainRoot = chainRootKept;
        out.mutationKeepsArrayChildren = allArrays;

        // (c) dslCompose mit erzwungener History-Quelle
        const rngC = makeRng(99);
        let usedHistory = 0;
        for (let i = 0; i < 30; i++) {
            const comp = r.dslCompose({
                rng: rngC,
                history: injHist,
                historyProbability: 1.0,
            });
            // Ein mutiertes Programm aus injHist hat entweder
            // "weather" als root (Mutation ohne Strukturwechsel)
            // oder durch Atom-Replacement ein anderes Atom.
            if (Array.isArray(comp) && (comp[0] === "weather" || comp.length === 2)) {
                usedHistory++;
            }
        }
        out.composeUsesHistory = usedHistory >= 20; // klar Mehrheit
        out.composeUsesHistoryCount = usedHistory;

        return out;
    });

    if (!phase7Results) {
        check("Phase 7: dslSelectByFitness erreichbar", false, "page.evaluate fehlgeschlagen");
    } else {
        check(
            "Phase 7: Fitness-Selektion bevorzugt high-fitness deutlich",
            phase7Results.highBeatsLow,
            `high/low Ratio=${phase7Results.highBeatsLowRatio.toFixed(2)} (Erwartung > 2.0)`
        );
        // Phase 7: Selektion deckt alle Einträge ab (keine null-Returns)
        check("Phase 7: Selektion deckt alle Einträge ab", phase7Results.selectionCoversAll);
        check("Phase 7: Mutation behält 'chain' als Wurzel bei Chain-Programmen", phase7Results.mutationKeepsChainRoot);
        check("Phase 7: Mutation behält Array-Strukturen bei Sub-Programmen", phase7Results.mutationKeepsArrayChildren);
        check(
            "Phase 7: dslCompose mit historyProbability=1 nutzt History",
            phase7Results.composeUsesHistory,
            `${phase7Results.composeUsesHistoryCount}/30 Calls`
        );
    }

    // ### Schicht 1 — IQ-Schicht (Pfad-Buckets, Multi-Dim-Fitness, Pattern-Memory) ###
    const iqResults = await safeEvaluate(page, () => {
        const out = {};
        // Keyword-Extraktion
        const kws = r.pathExtractKeywords("Ich liebe den Wald und Wasserfälle hier");
        out.keywordsExtracted = Array.isArray(kws) && kws.includes("wald") && kws.includes("wasserfälle");
        out.keywordsFilterStopwords = !kws.includes("der") && !kws.includes("ich");

        // rememberChatKeywords füllt den Window
        st.dsl.recentKeywords.length = 0;
        r.rememberChatKeywords("teste mit drachen und feuer", 1000);
        out.keywordsRemembered = st.dsl.recentKeywords.length >= 2;

        // pruneRecentKeywords entfernt alte
        st.dsl.recentKeywords.push({ keyword: "alt", at: 0 });
        r.pruneRecentKeywords(120);
        out.oldKeywordsPruned = !st.dsl.recentKeywords.some((e) => e.keyword === "alt");

        // Multi-Dim-Fitness: Outcome mit positiver Emotion gibt höhere Fitness
        const f1 = r.computeMultiDimFitness({
            fpsBefore: 120,
            fpsAfter: 120,
            emotionsBefore: { joy: 0.1, awe: 0, hope: 0, peace: 0 },
            emotionsAfter: { joy: 0.5, awe: 0.3, hope: 0.2, peace: 0.1 },
            activityAfter: { moves: 10, chats: 2, jumps: 0 },
        });
        const f2 = r.computeMultiDimFitness({
            fpsBefore: 120,
            fpsAfter: 120,
            emotionsBefore: { joy: 0.5, awe: 0.5, hope: 0.5, peace: 0.5 },
            emotionsAfter: { joy: 0.1, awe: 0.1, hope: 0.1, peace: 0.1 },
            activityAfter: { moves: 0, chats: 0, jumps: 0 },
        });
        out.fitnessRespondsToEmotion = f1 > f2;
        out.fitnessBounded = f1 >= 0 && f1 <= 1 && f2 >= 0 && f2 <= 1;

        // Pattern-Memory: rememberOutcomeAsPattern (high-fitness) speichert
        st.dsl.patternMemory = {};
        st.dsl.recentKeywords = [{ keyword: "drache", at: 100 }];
        r.rememberOutcomeAsPattern({ startedAt: 100 }, ["spawn_creature", ["at_player"], 1, "happy"], 0.8, 110);
        out.patternMemoryWritten =
            Array.isArray(st.dsl.patternMemory["drache"]) && st.dsl.patternMemory["drache"].length === 1;
        // Low-fitness Programme werden NICHT geschrieben
        r.rememberOutcomeAsPattern({ startedAt: 100 }, ["weather", "rainy"], 0.3, 110);
        out.lowFitnessIgnored = st.dsl.patternMemory["drache"].length === 1;

        // dslSelectByPattern findet das Programm
        let foundByPattern = 0;
        for (let i = 0; i < 10; i++) {
            const p = r.dslSelectByPattern(Math.random);
            if (Array.isArray(p) && p[0] === "spawn_creature") foundByPattern++;
        }
        out.patternSelectionWorks = foundByPattern === 10;

        // Pfad-Buckets: samplePathBuckets inkrementiert
        const before = { ...st.player.pathBuckets.height };
        st.player.pathLastSample = -Infinity;
        r.samplePathBuckets(performance.now() / 1000);
        const after = st.player.pathBuckets.height;
        out.bucketsIncrementing =
            (after.low || 0) + (after.mid || 0) + (after.high || 0) >
            (before.low || 0) + (before.mid || 0) + (before.high || 0);

        // dslRun schreibt emotionsBefore + startedAt
        const result = r.dslRun(["weather", "sunny"], { source: "test" });
        out.outcomeHasEmotionSnapshot =
            result.outcome &&
            typeof result.outcome.startedAt === "number" &&
            result.outcome.emotionsBefore &&
            typeof result.outcome.emotionsBefore.joy === "number";

        return out;
    });

    if (erreichbar(check, "Schicht 1: IQ-Snapshot erreichbar", iqResults)) {
        check("Schicht 1: pathExtractKeywords liefert echte Tokens", iqResults.keywordsExtracted);
        check("Schicht 1: Keyword-Filter wirft Stoppwörter raus", iqResults.keywordsFilterStopwords);
        check("Schicht 1: rememberChatKeywords füllt das Fenster", iqResults.keywordsRemembered);
        check("Schicht 1: pruneRecentKeywords räumt alte Einträge ab", iqResults.oldKeywordsPruned);
        check("Schicht 1: Multi-Dim-Fitness reagiert auf Emotion-Delta", iqResults.fitnessRespondsToEmotion);
        check("Schicht 1: Fitness bleibt in [0..1]", iqResults.fitnessBounded);
        check("Schicht 1: Pattern-Memory schreibt high-fitness", iqResults.patternMemoryWritten);
        check("Schicht 1: low-fitness landet nicht im Memory", iqResults.lowFitnessIgnored);
        check("Schicht 1: dslSelectByPattern findet gespeichertes Programm", iqResults.patternSelectionWorks);
        check("Schicht 1: samplePathBuckets erhöht Höhen-Bucket", iqResults.bucketsIncrementing);
        check("Schicht 1: dslRun-Outcome trägt emotionsBefore + startedAt", iqResults.outcomeHasEmotionSnapshot);
    }
}

// Nexus-Augen: dslComposeAtomic LIEST auraAt am Spieler und komponiert resonant zum lokalen Feld
// (docs/das-lebendige-feld.md §2/§3.1). Beweis: feld-resonante Farbwahl (kontrollierte rng →
// deterministisch) + weiter valide DSL.
async function checkBandV1722NexusEyes({ page, check }) {
    const res = await page.evaluate(() => {
        const out = {};
        const lo = () => 0.0; // kontrollierte rng (< jede Achsen-Stärke → resoniert)
        out.magieColor = r.dslComposeFieldColor(lo, { magieleitung: 1, glut: 0, lebendig: 0 }) === "#d4a3ff";
        out.glutColor = r.dslComposeFieldColor(lo, { magieleitung: 0, glut: 1, lebendig: 0 }) === "#ff7a59";
        out.lebendigColor = r.dslComposeFieldColor(lo, { magieleitung: 0, glut: 0, lebendig: 1 }) === "#7bd389";
        const neutral = r.dslComposeFieldColor(lo, { magieleitung: 0, glut: 0, lebendig: 0 });
        out.neutralPalette = typeof neutral === "string" && neutral.startsWith("#") && neutral !== "#d4a3ff";
        const prog = r.dslComposeAtomic(() => 0.5);
        out.composesValid = Array.isArray(prog) && typeof prog[0] === "string";
        return out;
    });
    check("Nexus-Augen: magie-leitender Ort → magisches Lila", res.magieColor);
    check("Nexus-Augen: glühender Ort → warmes Feuer", res.glutColor);
    check("Nexus-Augen: lebendiger Ort → frisches Grün", res.lebendigColor);
    check("Nexus-Augen: neutrales Feld → freie erkundende Palette", res.neutralPalette);
    // Nexus-Augen: komponiert weiter valide DSL (backward-compat)
    check("Nexus-Augen: komponiert weiter valide DSL", res.composesValid);
}

async function checkBandWelle6HCreatureLlm({ page, check, errors, finalState }) {
    void errors;
    void finalState;
    // ### Welle 6.H Phase 2E V1 — Kreatur-LLM-Persona ###
    // Der Spieler spricht mit EINER Kreatur; der Persona-Prompt versammelt ihre volle Identität
    // (Body+Specs+Equipped+Boosts+Memory+bornAt+Welt). Kein echter LLM-Call: geprüft: Builder + Routing.
    const wave6hP2eV1Results = await safeEvaluate(page, () => {
        if (!r || !st || !st.playerMesh) return null;
        const out = {};


        // 2. _findCreatureByName findet die Kreatur (case-insensitive)
        const player = st.playerMesh.position;
        // die Kreatur-Liste ISOLIEREN — am vollen
        // maxCreatures-Cap gibt spawnCreatureAt null → .userData wirft → der
        // ganze Block starb STILL (die stummen Nulls). __restore() am Ende.
        const __savedC = st.creatures;
        const __savedE = st.creatureEmotions;
        st.creatures = [];
        st.creatureEmotions = [];
        const __restore = () => {
            for (const __tc of st.creatures.slice()) r.removeCreature(__tc);
            st.creatures = __savedC;
            st.creatureEmotions = __savedE;
        };
        const c = r.spawnCreatureAt(player.x + 500, player.y, player.z + 500, "happy", "wesen");
        c.userData.name = "TestNira";
        out.findExact = r._findCreatureByName("TestNira") === c;
        out.findCaseInsensitive = r._findCreatureByName("testnira") === c;
        out.findUnknown = r._findCreatureByName("FictionalXYZ") === null;

        // 3. _parseCreatureAddress erkennt verschiedene Trennzeichen
        const p1 = r._parseCreatureAddress("TestNira, hallo");
        out.parseComma = p1 && p1.name === "TestNira" && p1.message === "hallo";
        const p2 = r._parseCreatureAddress("TestNira: was hast du gesehen?");
        out.parseColon = p2 && p2.name === "TestNira" && p2.message === "was hast du gesehen?";
        const p3 = r._parseCreatureAddress("setze wetter sunny");
        out.parseRejectsNonAddress = p3 === null; // kein „Name, text"-Pattern
        const p4 = r._parseCreatureAddress("Anna_B-2: hallo");
        out.parseAllowsHyphensUnderscores = p4 && p4.name === "Anna_B-2";

        // 4. _buildCreaturePersonaPrompt enthält alle 4 Stat-Schichten + Welt
        // Vorher: voll-ausgestattete Kreatur (Specs + Equipped + Boost + Memory)
        c.userData.memory = [
            { type: "gathered", content: { material: "holz" }, at: 1 },
            { type: "gathered", content: { material: "holz" }, at: 2 },
            { type: "gathered", content: { material: "holz" }, at: 3 },
            { type: "built", content: { blueprint: "stein_block" }, at: 4 },
        ];
        r.equipCreatureTool(c, "schmiede-hammer");
        r.applyCreatureBoost(c, {
            source: "test:tonic",
            tagDelta: { dichte: 0.3 },
            durationSeconds: 60,
            label: "Test-Tonic",
        });
        const prompt = r._buildCreaturePersonaPrompt(c);
        out.promptIsString = typeof prompt === "string" && prompt.length > 0;
        out.promptHasName = /TestNira/.test(prompt);
        out.promptHasSoulLabel = /Wesen/.test(prompt);
        out.promptHasStats = /HP\s+\d/.test(prompt) && /SPD\s+\d/.test(prompt);
        out.promptHasSpecs = /Sammler/.test(prompt) && /holz/.test(prompt);
        out.promptHasEquipped = /hammer/.test(prompt);
        out.promptHasBoost = /Test-Tonic/.test(prompt);
        out.promptHasMemory = /sammelte holz/.test(prompt) || /baute/.test(prompt);
        out.promptHasWeather = new RegExp(st.weather || "sunny").test(prompt);
        out.promptInstructsJson = /JSON-Objekt/.test(prompt) && /say/.test(prompt) && /program/.test(prompt);
        // V3: Prompt erlaubt jetzt program + nennt
        // Whitelist (Co-Schöpfer-Geist). V1-Test umgekehrt:
        // wir prüfen, dass Whitelist + Anweisung enthalten sind.
        out.promptForbidsProgram = /Welt-Aktion ist erlaubt/.test(prompt) && /Erlaubte Ops/.test(prompt);
        out.promptHasAge = /Sekunden|Minuten|Stunden|Tage/.test(prompt);

        // 5. llmCallCreature ohne LLM-aktiv → error-Object
        const wasEnabled = st.llm && st.llm.enabled;
        if (st.llm) st.llm.enabled = false;

        // 6. maybeAnswerCreature ohne aktive LLM gibt Hinweis-Output
        let chatLines = [];
        const append = (text) => chatLines.push(text);
        // synchron prüfen wir nur das Parse + LLM-Off-Branch
        // (await funktioniert in evaluate via async-IIFE — vereinfacht)
        return Promise.resolve()
            .then(async () => {
                await r.maybeAnswerCreature("TestNira, hallo", append);
                out.llmOffPolite = chatLines.some((l) => /hört dich/.test(l));
                out.llmOffNoCall = !st.llm.inFlight;
                // Unbekannter Name → höfliche Ablehnung
                chatLines.length = 0;
                await r.maybeAnswerCreature("UnbekannterXYZ, hallo", append);
                out.unknownPolite = chatLines.some((l) => /Niemand|hört zu/.test(l));
                if (st.llm) st.llm.enabled = wasEnabled || false;
                return out;
            })
            .catch((e) => ({ error: String(e) }))
            .then((res) => {
                __restore();
                return res;
            });
    });

    if (wave6hP2eV1Results && !wave6hP2eV1Results.error) {
        // Welle 6.H P2E V1: _findCreatureByName exact + case-insensitive + null bei unknown
        check(
            "_findCreatureByName exact + case-insensitive + null bei unknown",
            wave6hP2eV1Results.findExact && wave6hP2eV1Results.findCaseInsensitive && wave6hP2eV1Results.findUnknown
        );
        // Welle 6.H P2E V1: _parseCreatureAddress erkennt 'Name, text' + 'Name: text' + lehnt non-address ab
        check(
            "_parseCreatureAddress erkennt 'Name, text' + 'Name: text' + lehnt non-address ab",
            wave6hP2eV1Results.parseComma &&
                wave6hP2eV1Results.parseColon &&
                wave6hP2eV1Results.parseRejectsNonAddress &&
                wave6hP2eV1Results.parseAllowsHyphensUnderscores
        );
        // Welle 6.H P2E V1: Persona-Prompt enthält Name + Soul-Label + Alter
        check(
            "Persona-Prompt enthält Name + Soul-Label + Alter",
            wave6hP2eV1Results.promptHasName && wave6hP2eV1Results.promptHasSoulLabel && wave6hP2eV1Results.promptHasAge
        );
        // Welle 6.H P2E V1: Persona-Prompt enthält Stats-Schicht (HP/SPD)
        check("Persona-Prompt enthält Stats-Schicht", wave6hP2eV1Results.promptHasStats);
        // Welle 6.H P2E V1: Persona-Prompt enthält Specs-Schicht (Sammler von holz)
        check(
            "Persona-Prompt enthält Specs-Schicht",
            wave6hP2eV1Results.promptHasSpecs
        );
        // Welle 6.H P2E V1: Persona-Prompt enthält Equipped-Schicht (hammer)
        check(
            "Persona-Prompt enthält Equipped-Schicht",
            wave6hP2eV1Results.promptHasEquipped
        );
        // Welle 6.H P2E V1: Persona-Prompt enthält Boost-Schicht (Test-Tonic)
        check("Persona-Prompt enthält Boost-Schicht", wave6hP2eV1Results.promptHasBoost);
        // Welle 6.H P2E V1: Persona-Prompt enthält Memory-Auszug
        check("Persona-Prompt enthält Memory-Auszug", wave6hP2eV1Results.promptHasMemory);
        // Welle 6.H P2E V1: Persona-Prompt enthält Welt-Kontext (Wetter)
        check("Persona-Prompt enthält Welt-Kontext", wave6hP2eV1Results.promptHasWeather);
        // Welle 6.H P2E V1: Persona-Prompt instruiert JSON-Format (say + program)
        check(
            "Persona-Prompt instruiert JSON-Format",
            wave6hP2eV1Results.promptInstructsJson
        );
        // Welle 6.H P2E V3: Persona-Prompt erlaubt program + nennt CREATURE_PROPOSED_OPS-Whitelist
        check(
            "Persona-Prompt erlaubt program + nennt CREATURE_PROPOSED_OPS-Whitelist",
            wave6hP2eV1Results.promptForbidsProgram
        );
        // Welle 6.H P2E V1: maybeAnswerCreature ohne aktive LLM → höflicher Hinweis (kein API-Call)
        check(
            "maybeAnswerCreature ohne aktive LLM → höflicher Hinweis",
            wave6hP2eV1Results.llmOffPolite && wave6hP2eV1Results.llmOffNoCall
        );
        // Welle 6.H P2E V1: maybeAnswerCreature mit unbekanntem Namen → 'Niemand hört zu'
        check(
            "maybeAnswerCreature mit unbekanntem Namen → 'Niemand hört zu'",
            wave6hP2eV1Results.unknownPolite
        );
    } else {
        // STUMM-GRÜN-WAND: auch ein NULL-Ergebnis (geworfene evaluate) ist ROT —
        // vorher übersprang der else-if-Guard die Checks still (die U1-Klasse).
        check(
            `Welle 6.H P2E V1: evaluate-Fehler — ${(wave6hP2eV1Results && wave6hP2eV1Results.error) || "evaluate lieferte null"}`,
            false
        );
    }

    // ### Welle 6.H Phase 2E V1.1 — @-Adressen-Pattern + Soul-Farben ###
    // @Name ist die primäre Kreatur-Adresse (ohne Trenner fiele "Bran wie gehts" an die Welt-KI);
    // Soul-Farben tragen Identität (Sprite=cyan / Wesen=brass / Geist=grün).
    const wave6hP2eV11Results = await safeEvaluate(page, () => {
        if (!r || !st || !st.playerMesh) return null;
        const out = {};

        // 1. @Name text → erkannt als explizite Adresse
        const p1 = r._parseCreatureAddress("@Bran wie gehts");
        out.atPatternMatches = p1 && p1.name === "Bran" && p1.message === "wie gehts" && p1.explicit === true;
        // 2. @Name, text → @ + Komma zusammen erlaubt
        const p2 = r._parseCreatureAddress("@Bran, was hast du gesehen?");
        out.atPatternWithComma = p2 && p2.name === "Bran" && p2.message === "was hast du gesehen?";
        // 3. @Name: text → @ + Doppelpunkt zusammen erlaubt
        const p3 = r._parseCreatureAddress("@Bran: hallo");
        out.atPatternWithColon = p3 && p3.name === "Bran" && p3.message === "hallo";
        // 4. Name, text → bleibt rückwärts-kompatibel, explicit=false
        const p4 = r._parseCreatureAddress("Bran, hallo");
        out.fallbackComma = p4 && p4.name === "Bran" && p4.message === "hallo" && p4.explicit === false;
        // 5. "Bran wie gehts" (ohne Trenner, ohne @) → NICHT geparst
        //    (das war der Bug: Welt-Grok antwortete, wir wollen das nicht)
        const p5 = r._parseCreatureAddress("Bran wie gehts");
        out.noTrennerRejected = p5 === null;
        // 6. "@ " ohne Name → nicht geparst
        const p6 = r._parseCreatureAddress("@ hallo");
        out.atWithoutNameRejected = p6 === null;

        // 7. Liste rendert Soul-Klassen auf creature-name
        const player = st.playerMesh.position;
        // die Kreatur-Liste ISOLIEREN — am vollen
        // maxCreatures-Cap gibt spawnCreatureAt null → .userData wirft → der
        // ganze Block starb STILL (die stummen Nulls). __restore() am Ende.
        const __savedC = st.creatures;
        const __savedE = st.creatureEmotions;
        st.creatures = [];
        st.creatureEmotions = [];
        const __restore = () => {
            for (const __tc of st.creatures.slice()) r.removeCreature(__tc);
            st.creatures = __savedC;
            st.creatureEmotions = __savedE;
        };
        const cSprite = r.spawnCreatureAt(player.x + 600, player.y, player.z + 600, "happy", "fuchs");
        cSprite.userData.name = "TestSpriteV11";
        const cWesen = r.spawnCreatureAt(player.x + 610, player.y, player.z + 610, "happy", "wesen");
        cWesen.userData.name = "TestWesenV11";
        const cGeist = r.spawnCreatureAt(player.x + 620, player.y, player.z + 620, "happy", "baer");
        cGeist.userData.name = "TestGeistV11";
        r._renderCreatureListUI();
        const listEl = document.getElementById("creature-list");
        out.spriteHasSoulClass = !!(listEl && listEl.querySelector(".creature-name.soul-fuchs"));
        out.wesenHasSoulClass = !!(listEl && listEl.querySelector(".creature-name.soul-wesen"));
        out.geistHasSoulClass = !!(listEl && listEl.querySelector(".creature-name.soul-baer"));

        // 8. Chat-Output: llmCallCreature gestubbt (kein API-Call) — prüft, dass die Antwort als Soul-Span
        //    mit den DOM-Soul-Klassen gerendert wird.
        const wasLlmEnabled = st.llm && st.llm.enabled;
        if (st.llm) st.llm.enabled = true;
        const origCall = r.llmCallCreature;
        r.llmCallCreature = async () => ({ say: "Ich höre dich, Schöpfer." });
        const chatOutput = document.getElementById("chat-output");
        const beforeLines = chatOutput ? chatOutput.children.length : 0;
        let chatLines = [];
        return Promise.resolve()
            .then(async () => {
                await r.maybeAnswerCreature("@TestSpriteV11 hallo", (t) => chatLines.push(t));
                const afterLines = chatOutput ? chatOutput.children.length : 0;
                out.chatLineAdded = afterLines > beforeLines;
                // Suche das Span mit chat-creature-name.soul-sprite
                const spans = chatOutput ? chatOutput.querySelectorAll(".chat-creature-name.soul-fuchs") : [];
                out.chatHasSoulSpan = spans.length > 0;
                // Plain-Text-Antwort enthält den Namen
                const lastLine = chatOutput ? chatOutput.lastElementChild : null;
                out.chatLineHasName = lastLine && /TestSpriteV11/.test(lastLine.textContent);
                // Cleanup
                r.llmCallCreature = origCall;
                if (st.llm) st.llm.enabled = wasLlmEnabled || false;
                return out;
            })
            .catch((e) => ({ error: String(e) }))
            .then((res) => {
                __restore();
                return res;
            });
    });

    if (wave6hP2eV11Results && !wave6hP2eV11Results.error) {
        // Welle 6.H P2E V1.1: @Name text → erkannt als explizite Adresse (explicit=true)
        check(
            "@Name text → erkannt als explizite Adresse",
            wave6hP2eV11Results.atPatternMatches
        );
        // Welle 6.H P2E V1.1: @Name, text + @Name: text Varianten unterstützt
        check(
            "@Name, text + @Name: text Varianten unterstützt",
            wave6hP2eV11Results.atPatternWithComma && wave6hP2eV11Results.atPatternWithColon
        );
        // Welle 6.H P2E V1.1: Name, text bleibt rückwärts-kompatibel (explicit=false)
        check(
            "Name, text bleibt rückwärts-kompatibel",
            wave6hP2eV11Results.fallbackComma
        );
        // Welle 6.H P2E V1.1: 'Bran wie gehts' (ohne Trenner) wird NICHT als Adresse missverstanden (Schöpfer-Bug-Fix)
        check(
            "'Bran wie gehts' wird NICHT als Adresse missverstanden",
            wave6hP2eV11Results.noTrennerRejected
        );
        // Welle 6.H P2E V1.1: '@ hallo' ohne Name wird abgelehnt
        check("'@ hallo' ohne Name wird abgelehnt", wave6hP2eV11Results.atWithoutNameRejected);
        // Welle 6.H P2E V1.1: Liste rendert Soul-Klassen .soul-fuchs/.soul-wesen/.soul-baer auf creature-name
        check(
            "Liste rendert Soul-Klassen .soul-fuchs/.soul-wesen/.soul-baer auf creature-name",
            wave6hP2eV11Results.spriteHasSoulClass &&
                wave6hP2eV11Results.wesenHasSoulClass &&
                wave6hP2eV11Results.geistHasSoulClass
        );
        // Welle 6.H P2E V1.1: Chat-Output bei Kreatur-Antwort rendert <span class='chat-creature-name soul-X'>
        check(
            "Chat-Output bei Kreatur-Antwort rendert <span class='chat-creature-name soul-X'>",
            wave6hP2eV11Results.chatLineAdded &&
                wave6hP2eV11Results.chatHasSoulSpan &&
                wave6hP2eV11Results.chatLineHasName
        );
    } else {
        // STUMM-GRÜN-WAND: auch ein NULL-Ergebnis (geworfene evaluate) ist ROT —
        // vorher übersprang der else-if-Guard die Checks still (die U1-Klasse).
        check(
            `Welle 6.H P2E V1.1: evaluate-Fehler — ${(wave6hP2eV11Results && wave6hP2eV11Results.error) || "evaluate lieferte null"}`,
            false
        );
    }

    // ### Welle 6.H Phase 2E V2 — Proaktive Kreatur-Sprache ###
    // Die Kreatur spricht bei Events (Level-Up, Boost, Material-Mangel) aus einem soul-aware, gedrosselten
    // Phrasen-Pool. Hooks: _onCreatureLevelUp · applyCreatureBoost · no_material_found (gather-tick) ·
    // no_inventory_for_build (build-tick).
    const wave6hP2eV2Results = await safeEvaluate(page, () => {
        if (!r || !st || !st.playerMesh) return null;
        const out = {};
        const Class = AnazhRealm;

        // 2. Phrase-Pool
        const pool = Class.CREATURE_PROACTIVE_PHRASES;
        // ALTLASTEN-NULL: sprite/geist-Stimmen sind gefallen — default trägt
        // jede Gattung; wesen (Hirsch) behält seine erdige Stimme.
        out.hasSpriteVariants = !pool.level_up_gather.sprite;
        out.hasWesenVariants = pool.level_up_gather.wesen && pool.level_up_gather.wesen.length >= 2;
        out.hasGeistVariants = !pool.level_up_gather.geist;
        out.hasDefaultFallback = !!pool.level_up_gather.default;

        // 3. Test-Setup: drei Soul-Kreaturen, frische Throttle, Toggle ON
        st.creatureProactiveSpeechEnabled = true;
        st.lastCreatureProactiveSpeech = -Infinity;
        const player = st.playerMesh.position;
        // die Kreatur-Liste ISOLIEREN — am vollen
        // maxCreatures-Cap gibt spawnCreatureAt null → .userData wirft → der
        // ganze Block starb STILL (die stummen Nulls). __restore() am Ende.
        const __savedC = st.creatures;
        const __savedE = st.creatureEmotions;
        st.creatures = [];
        st.creatureEmotions = [];
        const __restore = () => {
            for (const __tc of st.creatures.slice()) r.removeCreature(__tc);
            st.creatures = __savedC;
            st.creatureEmotions = __savedE;
        };
        const cSprite = r.spawnCreatureAt(player.x + 700, player.y, player.z + 700, "happy", "fuchs");
        cSprite.userData.name = "ProacSprite";
        cSprite.userData.lastProactiveSpeech = -Infinity;
        const cWesen = r.spawnCreatureAt(player.x + 710, player.y, player.z + 710, "happy", "wesen");
        cWesen.userData.name = "ProacWesen";
        cWesen.userData.lastProactiveSpeech = -Infinity;
        const cGeist = r.spawnCreatureAt(player.x + 720, player.y, player.z + 720, "happy", "baer");
        cGeist.userData.name = "ProacGeist";
        cGeist.userData.lastProactiveSpeech = -Infinity;

        // 4. Erste Aussage funktioniert
        const chatOutput = document.getElementById("chat-output");
        const before = chatOutput ? chatOutput.children.length : 0;
        const ok1 = r._creatureSpeakProactive(cSprite, "level_up_gather", { material: "holz", level: 2 });
        out.firstSpeechOk = ok1 === true;
        const after1 = chatOutput ? chatOutput.children.length : 0;
        out.chatLineAdded = after1 > before;
        // Soul-Span im DOM rendert mit sprite-Klasse
        const lastLine = chatOutput ? chatOutput.lastElementChild : null;
        out.lineHasSpriteSoul = !!(lastLine && lastLine.querySelector(".chat-creature-name.soul-fuchs"));
        out.lineHasName = lastLine && /ProacSprite/.test(lastLine.textContent);
        out.templateReplaced = lastLine && /holz/.test(lastLine.textContent) && /2/.test(lastLine.textContent);

        // 5. Per-Kreatur-Throttle: SOFORT nochmal sprechen lehnt ab
        const ok2 = r._creatureSpeakProactive(cSprite, "boost_received", { label: "Tonic" });
        out.perCreatureThrottle = ok2 === false;

        // 6. Global-Throttle: andere Kreatur SOFORT nach erster sprechen lehnt auch ab
        const ok3 = r._creatureSpeakProactive(cWesen, "boost_received", { label: "Tonic" });
        out.globalThrottle = ok3 === false;

        // 7. Bei deaktiviertem Toggle → kein Output
        st.creatureProactiveSpeechEnabled = false;
        cGeist.userData.lastProactiveSpeech = -Infinity;
        st.lastCreatureProactiveSpeech = -Infinity;
        const ok4 = r._creatureSpeakProactive(cGeist, "boost_received", { label: "Tonic" });
        out.toggleOffSilent = ok4 === false;

        // 8. Unbekannter Event-Typ lehnt ab
        st.creatureProactiveSpeechEnabled = true;
        cGeist.userData.lastProactiveSpeech = -Infinity;
        st.lastCreatureProactiveSpeech = -Infinity;
        const ok5 = r._creatureSpeakProactive(cGeist, "unknown_event", {});
        out.unknownEventRejected = ok5 === false;

        // 9. ALTLASTEN-NULL: eine Gattung OHNE eigene Stimme (Bär) spricht den
        //    DEFAULT-Pool — der Fallback ist die eine Quelle für alle Tiere.
        cGeist.userData.lastProactiveSpeech = -Infinity;
        st.lastCreatureProactiveSpeech = -Infinity;
        r._creatureSpeakProactive(cGeist, "level_up_gather", { material: "laub", level: 1 });
        const geistLine = chatOutput ? chatOutput.lastElementChild : null;
        const geistText = geistLine ? geistLine.textContent : "";
        out.geistUsedGeistPool = pool.level_up_gather.default.some((tpl) => {
            const filled = tpl.replace(/\$\{(\w+)\}/g, (m, k) => (k === "material" ? "laub" : k === "level" ? "1" : m));
            return geistText.includes(filled);
        });

        // 10. Hook _onCreatureLevelUp triggert proaktive Sprache
        //     (Memory pushen, dann _creatureRemember triggert
        //     _onCreatureLevelUp wenn Threshold erreicht).
        const cLU = r.spawnCreatureAt(player.x + 730, player.y, player.z + 730, "happy", "wesen");
        cLU.userData.name = "LevelUpTest";
        cLU.userData.lastProactiveSpeech = -Infinity;
        st.lastCreatureProactiveSpeech = -Infinity;
        const beforeLU = chatOutput ? chatOutput.children.length : 0;
        // 3 gathered-Memorys → Level 1 trigger
        for (let i = 0; i < 3; i++) {
            r._creatureRemember(cLU, "gathered", { material: "stein" });
        }
        const afterLU = chatOutput ? chatOutput.children.length : 0;
        out.levelUpHookFired = afterLU > beforeLU;

        // 11. Hook applyCreatureBoost triggert (NEUE Quelle)
        const cBoost = r.spawnCreatureAt(player.x + 740, player.y, player.z + 740, "happy", "fuchs");
        cBoost.userData.name = "BoostTest";
        cBoost.userData.lastProactiveSpeech = -Infinity;
        st.lastCreatureProactiveSpeech = -Infinity;
        const beforeB = chatOutput ? chatOutput.children.length : 0;
        r.applyCreatureBoost(cBoost, {
            source: "test:proactive",
            tagDelta: { dichte: 0.3 },
            durationSeconds: 30,
            label: "TestTrank",
        });
        const afterB = chatOutput ? chatOutput.children.length : 0;
        out.boostHookFired = afterB > beforeB;

        // 12. Hook applyCreatureBoost: SELBE Quelle nochmal → NICHT erneut sprechen
        //     (würde sonst bei jeder Boost-Verlängerung loslabern)
        cBoost.userData.lastProactiveSpeech = -Infinity; // throttle reset
        st.lastCreatureProactiveSpeech = -Infinity;
        const beforeB2 = chatOutput ? chatOutput.children.length : 0;
        r.applyCreatureBoost(cBoost, {
            source: "test:proactive", // SELBE source
            tagDelta: { dichte: 0.5 },
            durationSeconds: 30,
            label: "TestTrank",
        });
        const afterB2 = chatOutput ? chatOutput.children.length : 0;
        out.boostRefreshSilent = afterB2 === beforeB2;

        __restore();
        return out;
    });

    if (wave6hP2eV2Results && !wave6hP2eV2Results.error) {
        // Welle 6.H P2E V2 (NULL): wesen-Stimme + default-Fallback (sprite/geist-Stimmen gefallen)
        check(
            "wesen-Stimme + default-Fallback",
            wave6hP2eV2Results.hasSpriteVariants &&
                wave6hP2eV2Results.hasWesenVariants &&
                wave6hP2eV2Results.hasGeistVariants &&
                wave6hP2eV2Results.hasDefaultFallback
        );
        // Welle 6.H P2E V2: Erste Aussage erfolgreich, Chat-Zeile + Soul-Span + Name + Template-Replacement
        check(
            "Erste Aussage erfolgreich, Chat-Zeile + Soul-Span + Name + Template-Replacement",
            wave6hP2eV2Results.firstSpeechOk &&
                wave6hP2eV2Results.chatLineAdded &&
                wave6hP2eV2Results.lineHasSpriteSoul &&
                wave6hP2eV2Results.lineHasName &&
                wave6hP2eV2Results.templateReplaced
        );
        // Welle 6.H P2E V2: Per-Kreatur-Throttle (60s) lehnt sofortige Zweit-Aussage ab
        check(
            "Per-Kreatur-Throttle lehnt sofortige Zweit-Aussage ab",
            wave6hP2eV2Results.perCreatureThrottle
        );
        // Welle 6.H P2E V2: Global-Throttle (8s) lehnt andere Kreatur sofort nach erster Aussage ab
        check(
            "Global-Throttle lehnt andere Kreatur sofort nach erster Aussage ab",
            wave6hP2eV2Results.globalThrottle
        );
        // Welle 6.H P2E V2: Toggle OFF → keine proaktive Sprache (silent drop)
        check(
            "Toggle OFF → keine proaktive Sprache",
            wave6hP2eV2Results.toggleOffSilent
        );
        // Welle 6.H P2E V2: Unbekannter Event-Typ → silent drop
        check("Unbekannter Event-Typ → silent drop", wave6hP2eV2Results.unknownEventRejected);
        // Welle 6.H P2E V2 (NULL): Gattung ohne eigene Stimme spricht den default-Pool
        check(
            "Gattung ohne eigene Stimme spricht den default-Pool",
            wave6hP2eV2Results.geistUsedGeistPool
        );
        // Welle 6.H P2E V2: Hook _onCreatureLevelUp triggert proaktive Sprache
        check(
            "Hook _onCreatureLevelUp triggert proaktive Sprache",
            wave6hP2eV2Results.levelUpHookFired
        );
        // Welle 6.H P2E V2: Hook applyCreatureBoost triggert bei NEUEM Boost
        check("Hook applyCreatureBoost triggert bei NEUEM Boost", wave6hP2eV2Results.boostHookFired);
        // Welle 6.H P2E V2: applyCreatureBoost mit SELBER Quelle (Verlängerung) → KEINE erneute Sprache (kein Flood)
        check(
            "applyCreatureBoost mit SELBER Quelle → KEINE erneute Sprache",
            wave6hP2eV2Results.boostRefreshSilent
        );
    } else {
        // STUMM-GRÜN-WAND: auch ein NULL-Ergebnis (geworfene evaluate) ist ROT —
        // vorher übersprang der else-if-Guard die Checks still (die U1-Klasse).
        check(
            `Welle 6.H P2E V2: evaluate-Fehler — ${(wave6hP2eV2Results && wave6hP2eV2Results.error) || "evaluate lieferte null"}`,
            false
        );
    }

    // ### Welle 6.H Phase 2E V3 — Welt-Aktion-Vorschläge der Kreatur ###
    // Erlaubt: atmosphärisch + Terrain (voxel_carve/voxel_fill; kein modify_terrain); modus-abhängig
    // (schöpfer = auto-execute, pfad/frieden = Inline-Buttons); LLM-Augmentation bei seltenen Events mit
    // eigenem 10-Min-Throttle. Geprüft: Whitelist, Modus-Diskrimination, Memory-Einträge, Sandbox-Defense.
    const wave6hP2eV3Results = await safeEvaluate(page, () => {
        if (!r || !st || !st.playerMesh) return null;
        const out = {};
        const Class = AnazhRealm;

        // 1. Konstanten + Methoden existieren
        out.weatherAllowed = Class.CREATURE_PROPOSED_OPS.has("weather");
        out.voxelCarveAllowed = Class.CREATURE_PROPOSED_OPS.has("voxel_carve");
        out.voxelFillAllowed = Class.CREATURE_PROPOSED_OPS.has("voxel_fill");
        out.spawnBlueprintAllowed = Class.CREATURE_PROPOSED_OPS.has("spawn_blueprint");
        out.chainAllowed = Class.CREATURE_PROPOSED_OPS.has("chain");
        // Forbidden: player_*, define_*, delete_*, set_mode
        out.playerSpeedForbidden = !Class.CREATURE_PROPOSED_OPS.has("player_speed");
        out.defineBlueprintForbidden = !Class.CREATURE_PROPOSED_OPS.has("define_blueprint");
        out.setModeForbidden = !Class.CREATURE_PROPOSED_OPS.has("set_mode");

        // 2. Validator: erlaubtes Programm
        const okWeather = r._isCreatureProposalAllowed(["weather", "rainy"]);
        out.allowsWeather = okWeather.ok === true;
        const okChain = r._isCreatureProposalAllowed(["chain", ["weather", "sunny"], ["skybox_color", "#ffd9a3"]]);
        out.allowsChain = okChain.ok === true;
        const okTerrain = r._isCreatureProposalAllowed(["voxel_carve", 0, 50, 0, 3]);
        out.allowsTerrain = okTerrain.ok === true;

        // 3. Validator: verbotene Programme
        const noPlayerSpeed = r._isCreatureProposalAllowed(["player_speed", 20]);
        out.rejectsPlayerSpeed = noPlayerSpeed.ok === false && noPlayerSpeed.forbiddenOp === "player_speed";
        const noDefine = r._isCreatureProposalAllowed(["define_blueprint", "evil", [{ shape: "box" }]]);
        out.rejectsDefine = noDefine.ok === false && noDefine.forbiddenOp === "define_blueprint";
        // Verbotene Op TIEF im Chain wird auch erkannt
        const nestedBad = r._isCreatureProposalAllowed([
            "chain",
            ["weather", "sunny"],
            ["player_speed", 50], // verboten, tief
        ]);
        out.rejectsNestedForbidden = nestedBad.ok === false && nestedBad.forbiddenOp === "player_speed";

        // 4. Persona-Prompt erlaubt program (V3-Update)
        const player = st.playerMesh.position;
        // die Kreatur-Liste ISOLIEREN — am vollen
        // maxCreatures-Cap gibt spawnCreatureAt null → .userData wirft → der
        // ganze Block starb STILL (die stummen Nulls). __restore() am Ende.
        const __savedC = st.creatures;
        const __savedE = st.creatureEmotions;
        st.creatures = [];
        st.creatureEmotions = [];
        const __restore = () => {
            for (const __tc of st.creatures.slice()) r.removeCreature(__tc);
            st.creatures = __savedC;
            st.creatureEmotions = __savedE;
        };
        const c = r.spawnCreatureAt(player.x + 800, player.y, player.z + 800, "happy", "wesen");
        c.userData.name = "TestProgramKreatur";
        const prompt = r._buildCreaturePersonaPrompt(c);
        out.promptMentionsProgram = /Welt-Aktion ist erlaubt/.test(prompt);
        out.promptListsOps = /Erlaubte Ops/.test(prompt) && /weather/.test(prompt);
        out.promptMentionsModus = /schöpfer-Modus/.test(prompt);

        // 5. Modus-abhängiger Pfad: schöpfer = auto-execute,
        //    pfad = inline-Buttons
        const origMode = r.getGameMode();
        const chatOutput = document.getElementById("chat-output");

        // Test schöpfer-Auto (uhr-wetter): das Wesen handelt VON SELBST — ohne Zusage des Spielers ist es Welt
        // (`_himmelSchreiber`): gegen das stehende Wort des Spielers hält das Wetter (der Hinweis sagt es); ohne Wort
        // wünscht es nur (gate:wetter-wache (G)/(B)).
        r.setGameMode("schöpfer");
        const [__wort0, __zugUhr0] = [st.wetterWort, st.weatherEffectTime];
        st.weatherEffectTime = 0;
        r.dslRun(["weather", "sunny"], { source: "human" });
        const beforeAuto = chatOutput ? chatOutput.children.length : 0;
        r._handleCreatureProposedProgram(c, "TestProgramKreatur", ["weather", "rainy"]);
        out.autoHaeltWort = st.weather === "sunny" && st.wetterWort === "sunny";
        const afterAuto = chatOutput ? chatOutput.children.length : 0;
        out.autoChatLineAdded = afterAuto > beforeAuto;
        out.autoHinweisWort =
            !!chatOutput && /hält dein Wort/.test((chatOutput.lastElementChild || {}).textContent || "");
        [st.wetterWort, st.weatherEffectTime] = [__wort0, __zugUhr0];
        // Memory-Eintrag: auto_executed_action
        const memTypes = (c.userData.memory || []).map((m) => m.type);
        out.memoryHasAutoExecuted = memTypes.includes("auto_executed_action");

        // Test pfad: Buttons werden gerendert (kein automatischer
        // Wetter-Wechsel)
        r.setGameMode("pfad");
        const beforePending = chatOutput ? chatOutput.querySelectorAll(".chat-proposal-pending").length : 0;
        const targetWeather2 = st.weather === "rainy" ? "sunny" : "rainy";
        r._handleCreatureProposedProgram(c, "TestProgramKreatur", ["weather", targetWeather2]);
        out.pfadDoesNotAutoExecute = st.weather !== targetWeather2;
        const afterPending = chatOutput ? chatOutput.querySelectorAll(".chat-proposal-pending").length : 0;
        out.pfadRendersButtons = afterPending > beforePending;
        // Memory: proposed_action vorhanden, aber NICHT yet accepted
        const memTypes2 = (c.userData.memory || []).map((m) => m.type);
        out.memoryHasProposed = memTypes2.includes("proposed_action");

        // 6. Sandbox-Defense: verbotenes Programm wird auch in
        //    schöpfer-Modus blockiert (defense in depth)
        r.setGameMode("schöpfer");
        const memCountBefore = (c.userData.memory || []).length;
        const blockedResult = r._handleCreatureProposedProgram(c, "TestProgramKreatur", ["player_speed", 99]);
        out.forbiddenBlockedEvenInSchöpfer = blockedResult === false;
        const memTypes3 = (c.userData.memory || []).map((m) => m.type);
        out.memoryHasBlocked = memTypes3.includes("proposal_blocked");
        out.memoryGrew = (c.userData.memory || []).length > memCountBefore;

        r.setGameMode(origMode || "frieden");

        // 7. Inline-Buttons: Click führt aus. Wir nehmen den LATEST
        //    accept-Button (Test 5 hat schon einen dagelassen).
        r.setGameMode("pfad");
        const c2 = r.spawnCreatureAt(player.x + 810, player.y, player.z + 810, "happy", "fuchs");
        c2.userData.name = "ClickTestKreatur";
        const targetW3 = st.weather === "rainy" ? "sunny" : "rainy";
        r._renderCreatureProposalButtons(c2, "ClickTestKreatur", ["weather", targetW3]);
        const acceptBtns = chatOutput ? chatOutput.querySelectorAll(".chat-proposal-btn.accept") : [];
        const acceptBtn = acceptBtns[acceptBtns.length - 1] || null;
        out.acceptButtonExists = !!acceptBtn;
        if (acceptBtn) {
            acceptBtn.click();
            out.acceptClickExecutes = st.weather === targetW3;
            const memTypes4 = (c2.userData.memory || []).map((m) => m.type);
            out.memoryHasAccepted = memTypes4.includes("accepted_action");
        }

        // 8. Reject-Button: Memory-Eintrag rejected_action
        const c3 = r.spawnCreatureAt(player.x + 820, player.y, player.z + 820, "happy", "baer");
        c3.userData.name = "RejectTestKreatur";
        r._renderCreatureProposalButtons(c3, "RejectTestKreatur", ["weather", "rainy"]);
        const rejectBtns = chatOutput ? chatOutput.querySelectorAll(".chat-proposal-btn.reject") : [];
        const rejectBtn = rejectBtns[rejectBtns.length - 1] || null;
        out.rejectButtonExists = !!rejectBtn;
        if (rejectBtn) {
            rejectBtn.click();
            const memTypes5 = (c3.userData.memory || []).map((m) => m.type);
            out.memoryHasRejected = memTypes5.includes("rejected_action");
        }

        r.setGameMode(origMode || "frieden");
        __restore();
        return out;
    });

    if (wave6hP2eV3Results && !wave6hP2eV3Results.error) {
        // Welle 6.H P2E V3 + V9.36: Whitelist erlaubt atmosphärische + Voxel-Mod-Ops (weather, voxel_carve, voxel_fill, spawn_blueprint, chain)
        check(
            "Welle 6.H P2E V3 + V9.36: Whitelist erlaubt atmosphärische + Voxel-Mod-Ops",
            wave6hP2eV3Results.weatherAllowed &&
                wave6hP2eV3Results.voxelCarveAllowed &&
                wave6hP2eV3Results.voxelFillAllowed &&
                wave6hP2eV3Results.spawnBlueprintAllowed &&
                wave6hP2eV3Results.chainAllowed
        );
        // Welle 6.H P2E V3: Whitelist verbietet player_speed + define_blueprint + set_mode (Spieler-/Welt-Wissen-Eingriff blockiert)
        check(
            "Whitelist verbietet player_speed + define_blueprint + set_mode",
            wave6hP2eV3Results.playerSpeedForbidden &&
                wave6hP2eV3Results.defineBlueprintForbidden &&
                wave6hP2eV3Results.setModeForbidden
        );
        // Welle 6.H P2E V3 + V9.36: Validator akzeptiert erlaubte Programme (weather, chain, voxel_carve)
        check(
            "Welle 6.H P2E V3 + V9.36: Validator akzeptiert erlaubte Programme",
            wave6hP2eV3Results.allowsWeather && wave6hP2eV3Results.allowsChain && wave6hP2eV3Results.allowsTerrain
        );
        // Welle 6.H P2E V3: Validator lehnt verbotene Ops ab + nennt forbiddenOp
        check(
            "Validator lehnt verbotene Ops ab + nennt forbiddenOp",
            wave6hP2eV3Results.rejectsPlayerSpeed && wave6hP2eV3Results.rejectsDefine
        );
        // Welle 6.H P2E V3: Validator erkennt verbotene Op TIEF im Chain (Defense-Recursion)
        check(
            "Validator erkennt verbotene Op TIEF im Chain",
            wave6hP2eV3Results.rejectsNestedForbidden
        );
        // Welle 6.H P2E V3: Persona-Prompt erlaubt program + nennt Op-Whitelist + erwähnt schöpfer-Modus
        check(
            "Persona-Prompt erlaubt program + nennt Op-Whitelist + erwähnt schöpfer-Modus",
            wave6hP2eV3Results.promptMentionsProgram &&
                wave6hP2eV3Results.promptListsOps &&
                wave6hP2eV3Results.promptMentionsModus
        );
        // Welle 6.H P2E V3: schöpfer-Modus → auto-execute als Welt: gegen das Wort des Spielers hält das Wetter (Hinweis) + chat-Hinweis-Zeile + Memory auto_executed_action
        check(
            "schöpfer-Modus → auto-execute als Welt: gegen das Wort des Spielers hält das Wetter + chat-Hinweis-Zeile + Memory auto_executed_action",
            wave6hP2eV3Results.autoHaeltWort &&
                wave6hP2eV3Results.autoHinweisWort &&
                wave6hP2eV3Results.autoChatLineAdded &&
                wave6hP2eV3Results.memoryHasAutoExecuted,
            `hält ${wave6hP2eV3Results.autoHaeltWort} · Hinweis ${wave6hP2eV3Results.autoHinweisWort}`
        );
        // Welle 6.H P2E V3: pfad-Modus → KEIN auto-execute, statt Buttons gerendert (.chat-proposal-pending)
        check(
            "pfad-Modus → KEIN auto-execute, statt Buttons gerendert",
            wave6hP2eV3Results.pfadDoesNotAutoExecute &&
                wave6hP2eV3Results.pfadRendersButtons &&
                wave6hP2eV3Results.memoryHasProposed
        );
        // Welle 6.H P2E V3: Defense-in-Depth — verbotenes Programm wird AUCH im schöpfer-Modus blockiert + proposal_blocked-Memory
        check(
            "Defense-in-Depth",
            wave6hP2eV3Results.forbiddenBlockedEvenInSchöpfer &&
                wave6hP2eV3Results.memoryHasBlocked &&
                wave6hP2eV3Results.memoryGrew
        );
        // Welle 6.H P2E V3: Accept-Button-Click führt Programm aus + accepted_action-Memory
        check(
            "Accept-Button-Click führt Programm aus + accepted_action-Memory",
            wave6hP2eV3Results.acceptButtonExists &&
                wave6hP2eV3Results.acceptClickExecutes &&
                wave6hP2eV3Results.memoryHasAccepted
        );
        // Welle 6.H P2E V3: Reject-Button-Click → rejected_action-Memory (Spieler-Wille respektiert)
        check(
            "Reject-Button-Click → rejected_action-Memory",
            wave6hP2eV3Results.rejectButtonExists && wave6hP2eV3Results.memoryHasRejected
        );
    } else {
        // STUMM-GRÜN-WAND: auch ein NULL-Ergebnis (geworfene evaluate) ist ROT —
        // vorher übersprang der else-if-Guard die Checks still (die U1-Klasse).
        check(
            `Welle 6.H P2E V3: evaluate-Fehler — ${(wave6hP2eV3Results && wave6hP2eV3Results.error) || "evaluate lieferte null"}`,
            false
        );
    }
}

async function checkBandWorkshopPolishAndLlm({ page, check, errors, finalState }) {
    void errors;
    void finalState;
    // ### Werkstatt-UX-Polish (Mode-Bar oben + Stats unten + Tool-Palette + Editor-Toggle + Del-Btn) ###
    const v805Results = await safeEvaluate(page, () => {
        const out = {};
        try {
            // Werkstatt-Tab öffnen
            const tab = document.querySelector('#topbar [data-tab="werkstatt"]');
            if (tab) tab.click();

            // Mode-Bar IM Wrapper UND VOR Canvas (DOM-Reihenfolge)
            const wrapper = document.getElementById("workshop-preview-wrapper");
            const modeBar = document.getElementById("workshop-mode-bar");
            const canvas = document.getElementById("workshop-preview-canvas");
            if (wrapper && modeBar && canvas) {
                out.modeBarInWrapper = modeBar.parentElement === wrapper;
                // Mode-Bar steht vor Canvas
                const wrapperChildren = Array.from(wrapper.children);
                const mbIdx = wrapperChildren.indexOf(modeBar);
                const cIdx = wrapperChildren.indexOf(canvas);
                out.modeBarBeforeCanvas = mbIdx >= 0 && cIdx > mbIdx;
            }

            // Stats-Panel im DOM + NACH Canvas (jetzt VOLLBREIT aus dem Preview-Wrapper
            // heraus, als Geschwister unter der ganzen Reihe → Dokument-Reihenfolge prüfen, nicht
            // Wrapper-Kind-Index; der Test wandert mit dem Layout).
            const stats = document.getElementById("workshop-stats-panel");
            out.statsInDom = !!stats;
            if (stats && canvas) {
                out.statsAfterCanvas = !!(canvas.compareDocumentPosition(stats) & Node.DOCUMENT_POSITION_FOLLOWING);
            }

            // Werkzeug-Palette im DOM
            const toolPalette = document.getElementById("workshop-tool-palette");
            out.toolPaletteInDom = !!toolPalette;
            // Wenn Spieler Werkzeuge hat, sind Cards drin
            const playerTools = (st.player && st.player.tools) || [];
            out.toolCardsCount = toolPalette ? toolPalette.querySelectorAll(".workshop-tool-card").length : 0;
            // die Palette enthält die Hand + (in schöpfer/nah) die Werkstatt-Prozess-Karten; mind. eine Karte.
            void playerTools;
            out.toolPaletteHasCards = out.toolCardsCount > 0;

            // der alte einklappbare Detail-Editor (#workshop-editor + Toggle) ist ENTFERNT (die
            // Werkstatt ist 3D-zentrisch); die Editor-Akte Undo/Redo/Löschen wohnen jetzt in der Top-Leiste.
            out.editorRemoved =
                !document.getElementById("workshop-editor") && !document.getElementById("workshop-editor-toggle");
            out.topBarUndoRedo =
                !!document.getElementById("workshop-undo-btn") && !!document.getElementById("workshop-redo-btn");
            out.topBarDeleteBlueprint = !!document.getElementById("workshop-delete-blueprint-btn");

            // Del-Button
            const delBtn = document.getElementById("workshop-delete-selected-part");
            out.delBtnInDom = !!delBtn;
            // Default: disabled (kein Part selektiert)
            if (delBtn) out.delBtnInitiallyDisabled = delBtn.disabled === true;

            // Klone eigenen Bauplan + Part selektieren → Del-Btn enabled
            if (st.blueprints["test_v805"]) r.deleteBlueprint("test_v805");
            r.cloneBlueprint("stein_block", "test_v805");
            r.selectBlueprintForEdit("test_v805");
            r._workshopSetSelection(0);
            out.delBtnEnabledOnSelect = delBtn && delBtn.disabled === false;
            // Del-Btn-Click entfernt Part
            const partsBefore = st.blueprints.test_v805.parts.length;
            if (delBtn) delBtn.click();
            const partsAfter = st.blueprints.test_v805.parts.length;
            out.delBtnRemovesPart = partsAfter === partsBefore - 1;

            // Cleanup
            if (st.blueprints["test_v805"]) r.deleteBlueprint("test_v805");
            r.selectBlueprintForEdit("stein_block");
            r._renderWorkshopDOM();
            // UI-Putz: Welt-Tab aufgelöst — neutraler Reset via closeAllDrawers (Welt = Default-Blick).
            r.closeAllDrawers();
            st.yaw = 0;
            if (st.playerMesh) st.playerMesh.rotation.y = 0;
        } catch (err) {
            out.error = err && err.message;
        }
        return out;
    });

    if (ohneWurf(check, "V8.05", v805Results)) {
        // V8.05: Mode-Bar steht IM Preview-Wrapper + VOR Canvas (Workflow von oben nach unten)
        check(
            "V8.05: Mode-Bar steht IM Preview-Wrapper + VOR Canvas",
            v805Results.modeBarInWrapper && v805Results.modeBarBeforeCanvas
        );
        // V8.05: Stats-Panel im DOM + NACH Canvas (schnelle Sicht auf emergente Werte)
        check(
            "V8.05: Stats-Panel im DOM + NACH Canvas",
            v805Results.statsInDom && v805Results.statsAfterCanvas
        );
        check(
            "V8.05: Werkzeug-Palette im DOM mit Cards für Spieler-Werkzeuge",
            v805Results.toolPaletteInDom && v805Results.toolPaletteHasCards
        );
        // V8.05 (V17.91): der alte Detail-Editor ist entfernt (#workshop-editor + Toggle weg)
        check(
            "V8.05: der alte Detail-Editor ist entfernt",
            v805Results.editorRemoved
        );
        // V8.05 (V17.91): Undo/Redo + Löschen wohnen in der Top-Leiste
        check(
            "V8.05: Undo/Redo + Löschen wohnen in der Top-Leiste",
            v805Results.topBarUndoRedo && v805Results.topBarDeleteBlueprint
        );
        // V8.05: Del-Button im DOM + initial disabled (keine Selection)
        check(
            "V8.05: Del-Button im DOM + initial disabled",
            v805Results.delBtnInDom && v805Results.delBtnInitiallyDisabled
        );
        check(
            "V8.05: Del-Button enabled bei Part-Selection + Click entfernt Part",
            v805Results.delBtnEnabledOnSelect && v805Results.delBtnRemovesPart
        );
    }

    // ### Werkstatt-UX: Klone/Neu in Mode-Bar, Default-Size, Kontrast ###
    const v806Results = await safeEvaluate(page, () => {
        const out = {};
        try {
            const tab = document.querySelector('#topbar [data-tab="werkstatt"]');
            if (tab) tab.click();
            // Klone + Neu-Buttons in Mode-Bar
            const modeBar = document.getElementById("workshop-mode-bar");
            out.cloneBtnInModeBar = !!(modeBar && modeBar.querySelector("#workshop-clone-btn"));
            out.newBtnInModeBar = !!(modeBar && modeBar.querySelector("#workshop-new-btn"));
            out.dividerInModeBar = !!(modeBar && modeBar.querySelector(".workshop-mode-divider"));
            // die Mode-Bar trägt 4 Modi (Move/Rotate/Scale/Connect) + Snap + Zentrieren + Undo +
            // Redo + Klonen + Neu + Löschen. V18.62 Ich-H — + „Körper holen" (Seele→Bauplan-Brücke) = 12.
            const allBtns = modeBar ? modeBar.querySelectorAll("button").length : 0;
            out.sevenButtonsInBar = allBtns === 12; // W-G (V18.177): +„▶ Gelenk-Probe" (V18.110 waren 11)

            // Rechte Spalte ist breiter (≥132px)
            const rightPalette = document.getElementById("workshop-side-palette-right");
            if (rightPalette) {
                const rect = rightPalette.getBoundingClientRect();
                out.rightPaletteWidth = rect.width;
                out.rightPaletteWider = rect.width >= 128;
            }

            // Mode-Bar hat Kontrast-Hintergrund (rgba mit ausreichend Alpha)
            const modeBarStyle = modeBar ? getComputedStyle(modeBar) : null;
            out.modeBarHasBg =
                modeBarStyle &&
                modeBarStyle.backgroundColor !== "rgba(0, 0, 0, 0)" &&
                modeBarStyle.backgroundColor !== "transparent";

            // Stats-Panel hat dunklen Hintergrund (rgba(20,12,4) area)
            const statsPanel = document.getElementById("workshop-stats-panel");
            const statsStyle = statsPanel ? getComputedStyle(statsPanel) : null;
            out.statsHasDarkBg =
                statsStyle &&
                statsStyle.backgroundColor &&
                /rgba?\((\d+),\s*(\d+),\s*(\d+)/.test(statsStyle.backgroundColor);

            // Cleanup
            // UI-Putz: Welt-Tab aufgelöst — neutraler Reset via closeAllDrawers (Welt = Default-Blick).
            r.closeAllDrawers();
            st.yaw = 0;
            if (st.playerMesh) st.playerMesh.rotation.y = 0;
        } catch (err) {
            out.error = err && err.message;
        }
        return out;
    });

    if (ohneWurf(check, "V8.06", v806Results)) {
        // V8.06: Klonen + Neu-Buttons direkt in der Mode-Bar (mit Divider)
        check(
            "V8.06: Klonen + Neu-Buttons direkt in der Mode-Bar",
            v806Results.cloneBtnInModeBar && v806Results.newBtnInModeBar && v806Results.dividerInModeBar
        );
        // V8.06/V17.91/V18.110/W-G: Mode-Bar hat 12 Buttons (4 Modi + Snap + Zentrieren + Undo + Redo + ▶ Gelenk-Probe + Klonen + Neu + Löschen)
        check(
            "V8.06/V17.91/V18.110/W-G: Mode-Bar hat 12 Buttons",
            v806Results.sevenButtonsInBar
        );
        check(
            `V8.06: rechte Palette breiter (≥128px, gemessen: ${v806Results.rightPaletteWidth || 0}px)`,
            v806Results.rightPaletteWider
        );
        // V8.06: Mode-Bar hat Hintergrund-Farbe (Kontrast-Verbesserung)
        check("V8.06: Mode-Bar hat Hintergrund-Farbe", v806Results.modeBarHasBg);
        // V8.06: Stats-Panel hat dunklen Hintergrund (Kontrast-Verbesserung)
        check("V8.06: Stats-Panel hat dunklen Hintergrund", v806Results.statsHasDarkBg);
    }

    // ### Werkstatt-Detail-Polish (Klone/Neu klickbar, Stern-Stats, Default-Größe fix) ###
    const v807Results = await safeEvaluate(page, () => {
        const out = {};
        try {
            const tab = document.querySelector('#topbar [data-tab="werkstatt"]');
            if (tab) tab.click();
            // Klone + Neu sind IMMER enabled — auch bei built-in Bauplan
            r.selectBlueprintForEdit("stein_block"); // built-in
            const cloneBtn = document.getElementById("workshop-clone-btn");
            const newBtn = document.getElementById("workshop-new-btn");
            out.cloneBtnAlwaysEnabled = cloneBtn && cloneBtn.disabled === false;
            out.newBtnAlwaysEnabled = newBtn && newBtn.disabled === false;
            // Mode-Buttons sind disabled bei built-in (kein Edit-Modus)
            const moveBtn = document.querySelector("#workshop-mode-bar [data-workshop-mode='translate']");
            out.modeBtnDisabledOnBuiltIn = moveBtn && moveBtn.disabled === true;
            // Bei eigenem Bauplan: alle wieder enabled
            if (st.blueprints["test_v807"]) r.deleteBlueprint("test_v807");
            r.cloneBlueprint("stein_block", "test_v807");
            r.selectBlueprintForEdit("test_v807");
            out.modeBtnEnabledOnCustom = moveBtn && moveBtn.disabled === false;

            // Spec-Sheet: die Tags sind Daten-Viz-BALKEN (.spec-bar mit .spec-bar-fill.lvl-X),
            // nicht mehr Stern-Chips. Geprüft wird: Balken existieren + tragen eine Stufen-Klasse.
            const statsPanel = document.getElementById("workshop-stats-panel");
            const tagBars = statsPanel ? statsPanel.querySelectorAll(".spec-bar") : [];
            out.tagChipsCount = tagBars.length;
            let anyHasStars = false;
            let anyHasLevelClass = false;
            tagBars.forEach((b) => {
                const fill = b.querySelector(".spec-bar-fill");
                if (fill) anyHasStars = true;
                if (fill && /\blvl-[0-3]\b|\bres(-top)?\b/.test(fill.className)) anyHasLevelClass = true;
            });
            out.tagChipsHaveStars = anyHasStars;
            out.tagChipsHaveLevelClass = anyHasLevelClass;
            // Die Stern-Glyphen leben jetzt im Qualitäts-Rating (.spec-q-stars, 5 Glyphen ★★☆☆☆).
            const qStarsEl = statsPanel ? statsPanel.querySelector(".spec-q-stars") : null;
            const starsContent = qStarsEl ? qStarsEl.textContent : "";
            out.starsAreGlyphs = /[★☆]/.test(starsContent) && starsContent.length === 5;

            // _workshopApplyDefaultSizeOnce RÄUMT Legacy-Inline-Größe + gespeicherte Resize-Größe (der Rahmen
            // kommt rein aus CSS, left:12;right:12) — eine stale Größe muss weg sein.
            localStorage.setItem("anazh.resize.werkstatt", JSON.stringify({ width: 300, height: 300 }));
            const werkstattEl807 = document.querySelector('[data-drawer="werkstatt"]');
            if (werkstattEl807) werkstattEl807.style.width = "300px";
            r._workshopApplyDefaultSizeOnce();
            out.defaultOverridesStale =
                localStorage.getItem("anazh.resize.werkstatt") === null &&
                (!werkstattEl807 || !werkstattEl807.style.width);
            // Idempotenz: zweiter Call wirft nicht + lässt keine Inline-Größe zurück
            r._workshopApplyDefaultSizeOnce();
            out.idempotentAfterApply = !werkstattEl807 || !werkstattEl807.style.width;

            // Cleanup
            if (st.blueprints["test_v807"]) r.deleteBlueprint("test_v807");
            r.selectBlueprintForEdit("stein_block");
            r._renderWorkshopDOM();
            // UI-Putz: Welt-Tab aufgelöst — neutraler Reset via closeAllDrawers (Welt = Default-Blick).
            r.closeAllDrawers();
            st.yaw = 0;
            if (st.playerMesh) st.playerMesh.rotation.y = 0;
        } catch (err) {
            out.error = err && err.message;
        }
        return out;
    });

    if (ohneWurf(check, "V8.07", v807Results)) {
        // V8.07: Klone-Button IMMER enabled (auch bei built-in)
        check("V8.07: Klone-Button IMMER enabled", v807Results.cloneBtnAlwaysEnabled);
        // V8.07: Neu-Button IMMER enabled (auch bei built-in)
        check("V8.07: Neu-Button IMMER enabled", v807Results.newBtnAlwaysEnabled);
        // V8.07: Mode-Buttons (Move/...) disabled bei built-in
        check("V8.07: Mode-Buttons disabled bei built-in", v807Results.modeBtnDisabledOnBuiltIn);
        check("V8.07: Mode-Buttons enabled bei eigenem Bauplan", v807Results.modeBtnEnabledOnCustom);
        check(
            `Spec-Sheet: ${v807Results.tagChipsCount} Profil-/Resonanz-Balken mit Fill + Stufen-Klasse`,
            v807Results.tagChipsHaveStars && v807Results.tagChipsHaveLevelClass
        );
        // Spec-Sheet: Qualitäts-Sterne sind ★/☆ (5 Zeichen)
        check("Spec-Sheet: Qualitäts-Sterne sind ★/☆", v807Results.starsAreGlyphs);
        // _workshopApplyDefaultSizeOnce räumt die stale Resize-Größe + Inline (CSS-Rahmen trägt jetzt)
        check(
            "_workshopApplyDefaultSizeOnce räumt die stale Resize-Größe + Inline",
            v807Results.defaultOverridesStale
        );
        // idempotent — zweiter Apply lässt keine Inline-Größe zurück
        check("idempotent", v807Results.idempotentAfterApply);
    }

    // ### Schicht 2 — Multi-Provider LLM-Sandbox (UI + Parser, kein echter Call) ###
    const llmResults = await safeEvaluate(page, () => {
        const out = {};
        // den Ollama-Weg (Endpunkt, Body, Antwort, Parser) und die Tür jedes Anbieters durch die CSP fährt der KI-Korpus am Verhalten (diag-v1-pfad --korpus)
        const defs = r.llmProviderDefs();

        out.googleHeaderHasApiKey = defs.google.buildHeaders("KEY")["x-goog-api-key"] === "KEY";

        // Body-Format pro Provider
        const sys = "SYS";
        const usr = "USR";
        const anthBody = defs.anthropic.buildBody("m", sys, usr);
        out.anthropicBodyShape = anthBody.system === sys && Array.isArray(anthBody.messages);
        const geminiBody = defs.google.buildBody("m", sys, usr);
        out.geminiBodyShape = !!geminiBody.systemInstruction && Array.isArray(geminiBody.contents);
        const orBody = defs.openrouter.buildBody("m", sys, usr);
        out.openrouterBodyShape =
            Array.isArray(orBody.messages) &&
            orBody.messages[0].role === "system" &&
            orBody.messages[1].role === "user";

        // Response-Parser pro Provider
        out.anthropicExtract = defs.anthropic.extractText({ content: [{ type: "text", text: "hi" }] }) === "hi";
        out.geminiExtract =
            defs.google.extractText({ candidates: [{ content: { parts: [{ text: "hi" }] } }] }) === "hi";
        out.openrouterExtract = defs.openrouter.extractText({ choices: [{ message: { content: "hi" } }] }) === "hi";

        // Parser nutzt Plain-Text-Fallback statt strict-error.
        // Lokale Modelle ignorieren oft den JSON-Vertrag — wir nehmen
        // ihren Plain-Text als `say` damit der Spieler trotzdem etwas sieht.
        const broken = r.llmParseResponse("nicht json");
        out.parserDetectsError = broken.say === "nicht json" && broken.fallbackUsed === "plain-text";

        // Disabled-LLM blockt Call ohne Netzwerk-Versuch
        st.llm.enabled = false;
        return new Promise((resolve) => {
            r.llmCall("test").then((rep) => {
                out.callBlockedWhenDisabled = rep.error === "LLM nicht aktiv";
                resolve(out);
            });
        });
    });

    if (erreichbar(check, "Schicht 2: LLM-Snapshot erreichbar", llmResults)) {
        check("Schicht 2: Gemini-Header trägt x-goog-api-key", llmResults.googleHeaderHasApiKey);
        check("Schicht 2: Anthropic-Body trägt system + messages", llmResults.anthropicBodyShape);
        check("Schicht 2: Gemini-Body trägt systemInstruction + contents", llmResults.geminiBodyShape);
        check("Schicht 2: OpenRouter-Body OpenAI-kompatibel", llmResults.openrouterBodyShape);
        check("Schicht 2: Anthropic-Response extrahiert text-Block", llmResults.anthropicExtract);
        check("Schicht 2: Gemini-Response extrahiert candidates[0].parts", llmResults.geminiExtract);
        check("Schicht 2: OpenRouter-Response extrahiert choices[0].message", llmResults.openrouterExtract);
        // Schicht 2: Parser nutzt Plain-Text-Fallback bei Nicht-JSON (V7.98 — User sieht Antwort statt Error)
        check(
            "Schicht 2: Parser nutzt Plain-Text-Fallback bei Nicht-JSON",
            llmResults.parserDetectsError
        );
        check("Schicht 2: Disabled-LLM blockt Call sauber", llmResults.callBlockedWhenDisabled);
    }

    // ### Welle 6.H V7.94 — Ollama-API-Key (gehosteter Setup) ###
    // Lokales Ollama braucht keinen Key, gehostete Setups einen Bearer-Token: buildHeaders schickt
    // Authorization NUR bei gesetztem Key.
    const ollamaKeyResults = await safeEvaluate(page, () => {
        const out = {};
        const defs = r.llmProviderDefs();
        const ol = defs.ollama;
        // lokal ohne Schlüssel fährt der KI-Korpus den Weg am echten Dienst (diag-v1-pfad --korpus)
        // buildHeaders MIT Key → Bearer-Token
        const headersWithKey = ol.buildHeaders("sk-test-1234", { apiKey: "sk-test-1234" });
        out.bearerWithKey =
            headersWithKey.authorization === "Bearer sk-test-1234" ||
            headersWithKey.Authorization === "Bearer sk-test-1234";

        return out;
    });

    if (ohneWurf(check, "V7.94 Ollama-Key", ollamaKeyResults)) {
        check("V7.94 Ollama-Key: buildHeaders MIT Key → Authorization: Bearer <key>", ollamaKeyResults.bearerWithKey);
    }

    // ### Ollama Cloud-Kompatibilität (Endpoint-Detect + Dual-Format-Parse) ###
    // (1) /api/chat nur anhängen, wenn die URL noch keinen Pfad hat; (2) extractText liest Ollama-native
    // UND OpenAI-kompatibles Format; (3) options.num_predict ist Ollama-spezifisch (OpenAI lehnt ab).
    const v795Results = await safeEvaluate(page, () => {
        const out = {};
        const defs = r.llmProviderDefs();
        const ol = defs.ollama;

        // 2. Endpoint smart-detect — URL mit /api/chat → DIREKT verwendet (kein /api/chat/api/chat)
        out.epRespectsApiPath =
            ol.endpoint("m", "k", {
                endpoint: "https://ollama.com/api/chat",
            }) === "https://ollama.com/api/chat";

        // 3. Endpoint smart-detect — URL mit /v1/chat/completions → DIREKT (OpenAI-kompat)
        out.epRespectsV1Path =
            ol.endpoint("m", "k", {
                endpoint: "https://provider.cloud/v1/chat/completions",
            }) === "https://provider.cloud/v1/chat/completions";

        // 6. extractText — OpenAI-kompat Format
        out.extractsOpenAi =
            ol.extractText({
                choices: [{ message: { content: "OpenAI-Antwort" } }],
            }) === "OpenAI-Antwort";

        // 7. extractText — Ollama-generate-Pfad (älter)
        out.extractsOllamaGenerate = ol.extractText({ response: "Generate-Antwort" }) === "Generate-Antwort";

        // 8. extractText — leerer/null Input → leerer String
        out.extractsEmpty = ol.extractText(null) === "" && ol.extractText({}) === "";

        // 9. buildBody — Ollama-Native (Basis-URL): hat options.num_predict
        // 400→800 für Reasoning-Models (think-Block + Antwort)
        const bodyNative = ol.buildBody("llama3.1", "sys", "user", {
            endpoint: "http://localhost:11434",
        });
        out.bodyNativeHasOptions = bodyNative.options && bodyNative.options.num_predict === 800;
        out.bodyNativeNoMaxTokens = bodyNative.max_tokens === undefined;

        // 10. buildBody — OpenAI-kompat (/v1/): hat max_tokens, KEIN options
        // 400→800
        const bodyOpenAi = ol.buildBody("gpt-oss", "sys", "user", {
            endpoint: "https://provider/v1/chat/completions",
        });
        out.bodyOpenAiHasMaxTokens = bodyOpenAi.max_tokens === 800;
        out.bodyOpenAiNoOptions = bodyOpenAi.options === undefined;

        // 11. buildBody — beide haben model + messages + stream:false
        out.bodyHasCommon =
            bodyNative.model === "llama3.1" &&
            Array.isArray(bodyNative.messages) &&
            bodyNative.stream === false &&
            bodyOpenAi.messages.length === 2;

        return out;
    });

    if (ohneWurf(check, "V7.95 Ollama-Cloud", v795Results)) {
        // V7.95 Ollama-Cloud: Endpoint respektiert volle URL mit /api/chat (kein doppeltes /api/chat/api/chat)
        check(
            "V7.95 Ollama-Cloud: Endpoint respektiert volle URL mit /api/chat",
            v795Results.epRespectsApiPath
        );
        check(
            "V7.95 Ollama-Cloud: Endpoint respektiert OpenAI-kompat-URL mit /v1/chat/completions",
            v795Results.epRespectsV1Path
        );
        // V7.95 Ollama-Cloud: extractText liest OpenAI-kompat Format (json.choices[0].message.content)
        check(
            "V7.95 Ollama-Cloud: extractText liest OpenAI-kompat Format",
            v795Results.extractsOpenAi
        );
        // V7.95 Ollama-Cloud: extractText liest älteres Ollama-generate Format (json.response)
        check(
            "V7.95 Ollama-Cloud: extractText liest älteres Ollama-generate Format",
            v795Results.extractsOllamaGenerate
        );
        // V7.95 Ollama-Cloud: extractText defensive bei null/leeren Input → '' (kein Crash)
        check(
            "V7.95 Ollama-Cloud: extractText defensive bei null/leeren Input → ''",
            v795Results.extractsEmpty
        );
        // V7.95+V7.98 Ollama: buildBody Ollama-Native hat options.num_predict=800 (kein max_tokens)
        check(
            "V7.95+V7.98 Ollama: buildBody Ollama-Native hat options.num_predict=800",
            v795Results.bodyNativeHasOptions && v795Results.bodyNativeNoMaxTokens
        );
        // V7.95+V7.98 Ollama: buildBody OpenAI-kompat hat max_tokens=800 (KEIN options-Feld)
        check(
            "V7.95+V7.98 Ollama: buildBody OpenAI-kompat hat max_tokens=800",
            v795Results.bodyOpenAiHasMaxTokens && v795Results.bodyOpenAiNoOptions
        );
        check(
            "V7.95 Ollama-Cloud: buildBody beide Formate haben model + messages + stream:false",
            v795Results.bodyHasCommon
        );
    }

    // ### Ollama UX-Politur (Auto-Bypass + Free-Text-Modell + 404-Hint) ###
    // Den lokalen Weg (Modell im Fenster, Proxy an, localhost geht vorbei) fährt der KI-Korpus am Verhalten (diag-v1-pfad
    // --korpus); hier die Cloud-URL durch den Proxy und der 404-Hinweis.
    const v797AutoResults = await safeEvaluate(page, async () => {
        if (!r || !st || !st.llm) return null;
        const out = {};

        // (wir stubben fetch um die URL abzufangen und reverten danach)
        const origFetch = window.fetch;
        let capturedUrl = null;
        window.fetch = async (u) => {
            capturedUrl = String(u);
            // Liefere einen leeren-aber-validen Response zurück
            return {
                ok: false,
                status: 404,
                text: async () => '{"error":"stub"}',
                json: async () => ({ error: "stub" }),
            };
        };
        try {
            st.llm.provider = "ollama";
            st.llm.enabled = true;
            Object.assign(st.llm.providerConfig.ollama, { endpoint: "https://ollama.com/api/chat", useProxy: true, model: "llama3.2" });
            st.llm.inFlight = false;
            await r.llmCall("test");
            // Erwartung: fetch-URL ist die proxy-URL bei Cloud + useProxy
            out.proxyUsedForCloud = capturedUrl !== null && /\/proxy\/llm/.test(capturedUrl);
        } finally {
            window.fetch = origFetch;
        }
        return out;
    });

    // 404-Hint-Test
    const v797ErrorResults = await safeEvaluate(page, async () => {
        if (!r || !st || !st.llm) return null;
        const out = {};
        const origFetch = window.fetch;
        window.fetch = async () => ({
            ok: false,
            status: 404,
            text: async () => '{"error":"model \\"foo-not-real\\" not found"}',
            json: async () => ({ error: "stub" }),
        });
        try {
            st.llm.provider = "ollama";
            st.llm.enabled = true;
            const cfg = st.llm.providerConfig.ollama;
            cfg.endpoint = "http://localhost:11434";
            cfg.useProxy = false;
            cfg.model = "foo-not-real";
            st.llm.inFlight = false;
            const reply = await r.llmCall("test");
            out.errorMentionsModel = /Modell.*nicht gefunden/.test(reply.error || "");
            out.errorMentionsOllamaList = /ollama list/.test(reply.error || "");
            out.errorMentionsModelName = /foo-not-real/.test(reply.error || "");
        } finally {
            window.fetch = origFetch;
        }
        return out;
    });

    if (ohneWurf(check, "V7.97 Auto-Bypass", v797AutoResults)) {
        // V7.97 Auto-Bypass: Cloud-URL + useProxy=true → Proxy WIRD GENUTZT (durchgeschleust)
        check(
            "V7.97 Auto-Bypass: Cloud-URL + useProxy=true → Proxy WIRD GENUTZT",
            v797AutoResults.proxyUsedForCloud
        );
    }
    if (ohneWurf(check, "V7.97 Error-Hint", v797ErrorResults)) {
        check(
            "V7.97 Error-Hint: HTTP 404 'model not found' → klarer Hinweis mit Modell-Namen + 'ollama list'",
            v797ErrorResults.errorMentionsModel &&
                v797ErrorResults.errorMentionsOllamaList &&
                v797ErrorResults.errorMentionsModelName
        );
    }

    // ### Parser-Robustheit für lokale Reasoning-Models ###
    // (1) <think>/<thinking>-Blöcke werden gestrippt; (2) ohne JSON-Vertrag greift der Plain-Text-
    // Fallback; (3) num_predict 800 statt 400 — think-Block + Antwort brauchen Raum.
    const v798Results = await safeEvaluate(page, () => {
        const out = {};

        // 1. <think>-Block wird gestrippt, JSON dahinter wird geparst
        const thinkResp = r.llmParseResponse('<think>Lass mich überlegen…</think>{"say":"Hallo Welt","program":null}');
        out.thinkStripped = thinkResp.say === "Hallo Welt" && thinkResp.program === null;

        // 2. <thinking>-Variante wird auch erkannt
        const thinkingResp = r.llmParseResponse('<thinking>foo bar</thinking>\n{"say":"Klar"}');
        out.thinkingStripped = thinkingResp.say === "Klar";

        // 3. Plain-Text ohne JSON → Plain-Text-Fallback
        const plainResp = r.llmParseResponse("Mir geht es gut, danke der Nachfrage.");
        out.plainTextFallback =
            plainResp.say === "Mir geht es gut, danke der Nachfrage." && plainResp.fallbackUsed === "plain-text";

        // 4. <think>-Block + Plain-Text → think gestrippt, Rest als say
        const thinkPlainResp = r.llmParseResponse("<think>denke nach</think>Hallo Schöpfer, ich höre dich.");
        out.thinkPlusPlain = /Hallo Schöpfer/.test(thinkPlainResp.say || "");

        // striktes JSON fährt der KI-Korpus an jeder Antwort (diag-v1-pfad --korpus)
        // 6. Markdown-Fence + JSON → fence wird gestripped
        const fenceResp = r.llmParseResponse('```json\n{"say":"Fenced"}\n```');
        out.fenceStripped = fenceResp.say === "Fenced";

        // 7. Komplett leerer Input → klarer Error mit raw-Hinweis
        const emptyResp = r.llmParseResponse("");
        out.emptyHasError = typeof emptyResp.error === "string" && /raw=0/.test(emptyResp.error);

        // 8. JSON mit leerem say UND text drumherum → Plain-Text-Fallback nimmt drumherum
        const emptyJsonResp = r.llmParseResponse('Vorab-Text {"say":""} Nach-Text');
        out.emptyJsonFallsBackToText =
            emptyJsonResp.say && emptyJsonResp.say.length > 0 && emptyJsonResp.fallbackUsed === "json-empty";

        return out;
    });

    if (ohneWurf(check, "V7.98 Parser", v798Results)) {
        check(
            "V7.98 Parser: <think>...</think>-Block wird gestripped, dahinter liegendes JSON sauber geparst",
            v798Results.thinkStripped
        );
        // V7.98 Parser: <thinking>-Variante wird auch erkannt (case-insensitive)
        check("V7.98 Parser: <thinking>-Variante wird auch erkannt", v798Results.thinkingStripped);
        // V7.98 Parser: Plain-Text ohne JSON → Plain-Text-Fallback (User sieht Antwort statt 'Leere Antwort')
        check(
            "V7.98 Parser: Plain-Text ohne JSON → Plain-Text-Fallback",
            v798Results.plainTextFallback
        );
        check(
            "V7.98 Parser: <think>-Block + Plain-Text danach → think gestrippt, Rest als say genutzt",
            v798Results.thinkPlusPlain
        );
        // V7.98 Parser: Markdown-Fence (```json …```) wird gestripped
        check("V7.98 Parser: Markdown-Fence wird gestripped", v798Results.fenceStripped);
        check("V7.98 Parser: Leerer Input → klarer Error mit 'raw=0'-Hinweis", v798Results.emptyHasError);
        // V7.98 Parser: JSON mit say='' aber Text drumherum → Plain-Text-Fallback (json-empty marker)
        check(
            "V7.98 Parser: JSON mit say='' aber Text drumherum → Plain-Text-Fallback",
            v798Results.emptyJsonFallsBackToText
        );
    }
}

module.exports = {
    checkBandRing2Extended, checkBandV1722NexusEyes, checkBandWelle6HCreatureLlm, checkBandWorkshopPolishAndLlm,
};
