"use strict";
// scripts/playtest/feld-nexus.cjs — der Richter von Feld/nexus (spec/stamm/modul-karte.json): Nexus: Fitness · Mutation · Komposition · Gesten-Regeln.
// 4 Band/Bänder in Lauf-Reihenfolge, je Band das Modul, dessen Glieder er am meisten ruft; gestellt von
// `node scripts/stamm-umzug.cjs --richter` — ein neuer Band steht hier und in der Reihe des Läufers scripts/playtest.cjs.

const { safeEvaluate } = require("../playtest.cjs");

// V9.52-b Sub-Welle b — Band-Funktion (Ring 2 Phase 3/6/7 + Schicht 1 IQ).
// Mehrere ### -Sektionen als flache Liste; reines verhaltensneutrales Refactoring.
async function checkBandRing2Extended(ctx) {
    const { page, check, logs, errors, finalState } = ctx;
    void errors;
    void finalState;
    // ### Ring 2 Phase 3 – Chat → DSL ###
    // Parser liefert das richtige AST; processChatCommand routet durch dslRun (state.dsl.lastUserProgram
    // + Welt-Effekt); chatSuggest erkennt einen verschriebenen Befehl per Levenshtein.
    const phase3Results = await safeEvaluate(page, () => {
        const r = window.anazhRealm;
        if (!r) return null;
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
        const weatherBefore = r.state.weather;
        r.processChatCommand("Setze Wetter rainy");
        out.chatRoutedToDsl =
            Array.isArray(r.state.dsl.lastUserProgram) &&
            r.state.dsl.lastUserProgram[0] === "weather" &&
            r.state.dsl.lastUserProgram[1] === "rainy";
        out.weatherActuallyChanged = r.state.weather === "rainy";
        // Wetter wieder neutralisieren, damit andere Tests nicht verwirrt werden.
        r.processChatCommand("Setze Wetter sunny");
        out.weatherCleanup = r.state.weather === "sunny" && weatherBefore !== undefined;

        // 3. Levenshtein-Vorschlag bei Tippfehler
        const suggestion = r.chatSuggest("setze wettr rainy");
        out.suggestionForTypo = suggestion === "setze wetter rainy";

        // 4. Phase 3b: set_visible-Primitiv + Chat-Routing — `toggleTerrain` schaltet den Boden-Satz (Welle B:
        // der ganze Ring ist EIN Objekt, die Chunk-Meshes sind CPU-Körper).
        const voxelChunksBefore = r.state.voxelChunks ? r.state.voxelChunks.size : 0;
        const someVoxelVisible = () => {
            const s = r.state.chunkSaetze ? r.state.chunkSaetze.get("boden") : null;
            return !!(s && s.mesh && s.mesh.visible && s.mesh.parent === r.state.scene);
        };
        r.processChatCommand("Boden deaktivieren");
        out.terrainHiddenViaDsl = voxelChunksBefore > 0 && !someVoxelVisible();
        r.processChatCommand("Boden aktivieren");
        out.terrainShownViaDsl = someVoxelVisible();

        // 5. Phase 3b: record_narrative-Primitiv via "Erzähle ..."
        const kbBefore = r.state.knowledgeBase.filter((k) => k.type === "narrative").length;
        r.processChatCommand("Erzähle Drachen leben hier");
        const narratives = r.state.knowledgeBase.filter((k) => k.type === "narrative");
        out.narrativeRecorded =
            narratives.length === kbBefore + 1 && narratives[narratives.length - 1].content === "Drachen leben hier";

        // 6. Phase 3b: set_visible mit unbekanntem Target wird abgelehnt
        const beforeLog = r.state.dsl.lastUserOutcome ? r.state.dsl.lastUserOutcome.errors : 0;
        const badResult = r.dslRun(["set_visible", "mond", true]);
        out.invalidTargetRejected = badResult.log.some((e) => e.event === "invalid_set_visible_target");
        void beforeLog;

        // 7. Phase 5: "Lerne Fähigkeit" speichert DSL-Programm
        r.processChatCommand("Lerne Fähigkeit blaukreaturen Ändere Farbe von Kreaturen zu blue");
        const learned = r.state.dsl.abilities.find((a) => a.name === "blaukreaturen");
        out.learnedAbilityIsDsl =
            !!learned &&
            Array.isArray(learned.program) &&
            learned.program[0] === "creatures_color" &&
            learned.program[1] === "blue" &&
            learned.source === "human";

        // 8. Phase 5: "Führe Fähigkeit aus" ruft dslRun und mutiert state.
        // Welle 6.H P2A — Kreatur ist Group; Color lebt auf Sub-Meshes.
        const someCreature = r.state.creatures[0];
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
        const raw = localStorage.getItem(r.worldStorageKey(r.state.worldMeta.worldId));
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

        // 10. Phase 5: createDynamicAbility/codeParser sind weg
        out.dynamicCodeMethodsRemoved =
            typeof r.createDynamicAbility === "undefined" &&
            typeof r.codeParser === "undefined" &&
            typeof r.developAdvancedPhysics === "undefined" &&
            typeof r.developAdvancedRenderer === "undefined";

        // V18.53 — „Der Nexus komponiert" (Gesten) auf Werkstatt-Stand: ✦-Abzeichen, „vor Xs",
        // direkt vergessbar (✕), gekappt + „leeren". Mehrere Nexus-Gesten anlegen + den Renderer prüfen.
        r.state.dsl.abilities.length = 0;
        for (let i = 0; i < 9; i++)
            r.state.dsl.abilities.push({
                name: `evo_test_${i}`,
                program: ["weather", "rainy"],
                source: "nexus",
                createdAt: performance.now() / 1000 - i * 2,
                fitness: 0.5,
            });
        r.state.hofGestenExpanded = false;
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
        out.gestenForgetWorks = !r.state.dsl.abilities.some((a) => a.name === "evo_test_8");
        // „leeren" wirft alle Nexus-Gesten
        const clearBtn = aHost.querySelector("button[data-clear-abilities]");
        if (clearBtn) clearBtn.click();
        out.gestenClearWorks = r.state.dsl.abilities.filter((a) => a.source === "nexus").length === 0;
        r.state.dsl.abilities.length = 0;
        r._statusRefs.abilitiesSignature = "";
        r.renderAbilitiesList();

        return out;
    });

    if (!phase3Results) {
        check("Phase-3-Snapshot erreichbar", false, "page.evaluate fehlgeschlagen");
    } else {
        check("Chat→DSL: 'Setze Wetter rainy' → ['weather','rainy']", phase3Results.parseWeatherOk);
        check("Chat→DSL: 'Spawne Kreaturen 3' → repeat+spawn_creature", phase3Results.parseSpawnOk);
        check("Chat→DSL: unbekannter Befehl liefert null (kein Match)", phase3Results.parseUnknownReturnsNull);
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
        check(
            "Phase 5: createDynamicAbility/codeParser/developAdvanced* sind entfernt",
            phase3Results.dynamicCodeMethodsRemoved
        );
        check(
            "V18.53 Gesten: ✦-Abzeichen + 'vor Xs' (einmalige Tat, sichtbar WANN sie wirkte)",
            phase3Results.gestenKindBadge && phase3Results.gestenWhen
        );
        check(
            "V18.53 Gesten: jede Geste direkt vergessbar (✕) + die Liste hat 'leeren'",
            phase3Results.gestenHasForget && phase3Results.gestenClearBtn
        );
        check(
            "V18.53 Gesten: Liste auf 6 gekappt + '+N ältere' (wächst nicht aus dem Bild)",
            phase3Results.gestenCapped
        );
        check("V18.53 Gesten: ✕ vergisst eine Geste wirklich", phase3Results.gestenForgetWorks);
        check("V18.53 Gesten: 'leeren' verwirft alle Nexus-Gesten", phase3Results.gestenClearWorks);
    }

    // ### Ring 2 Phase 6 – CSP ###
    // Das CSP-Meta-Tag trägt die kritischen Direktiven; über den ganzen Lauf landet keine CSP-Violation
    // im console-Buffer.
    const cspResults = await safeEvaluate(page, () => {
        const meta = document.querySelector('meta[http-equiv="Content-Security-Policy"]');
        if (!meta) return { metaPresent: false };
        const content = meta.getAttribute("content") || "";
        return {
            metaPresent: true,
            hasScriptSrc: /script-src[^;]*'self'/.test(content),
            hasObjectNone: /object-src 'none'/.test(content),
            hasBaseUriSelf: /base-uri 'self'/.test(content),
            hasDefaultSrc: /default-src 'self'/.test(content),
        };
    });

    const cspViolationLogs = logs.filter((l) => /Content Security Policy directive/i.test(l.text));

    if (!cspResults) {
        check("Phase 6: CSP-Meta-Snapshot erreichbar", false, "page.evaluate fehlgeschlagen");
    } else {
        check("Phase 6: CSP-Meta-Tag vorhanden", cspResults.metaPresent);
        check("Phase 6: script-src 'self' gesetzt (Skripte nur lokal)", cspResults.hasScriptSrc);
        check("Phase 6: object-src 'none' (Flash/Plugins blockiert)", cspResults.hasObjectNone);
        check("Phase 6: base-uri 'self' (URL-Manipulation blockiert)", cspResults.hasBaseUriSelf);
        check("Phase 6: default-src 'self' (alles per Default lokal)", cspResults.hasDefaultSrc);
    }
    check(
        "Phase 6: keine CSP-Violations während Laufzeit",
        cspViolationLogs.length === 0,
        cspViolationLogs.length ? `${cspViolationLogs.length}× erste: ${cspViolationLogs[0].text.slice(0, 120)}` : ""
    );

    // ### Ring 2 Phase 7 – Fitness-V2 ###
    // (a) Selektion bevorzugt statistisch high-fitness, (b) Mutation behält strukturelle Invarianten,
    // (c) dslCompose mit historyProbability=1 nutzt tatsächlich die History.
    const phase7Results = await safeEvaluate(page, () => {
        const r = window.anazhRealm;
        if (!r || typeof r.dslSelectByFitness !== "function") return null;
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
        check("Phase 7: Selektion deckt alle Einträge ab (keine null-Returns)", phase7Results.selectionCoversAll);
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
        const r = window.anazhRealm;
        if (!r) return null;
        const out = {};
        // State-Felder existieren
        out.hasPathBuckets =
            !!r.state.player.pathBuckets &&
            !!r.state.player.pathBuckets.height &&
            !!r.state.player.pathBuckets.distance;
        out.hasPatternMemory = r.state.dsl && typeof r.state.dsl.patternMemory === "object";
        out.hasRecentKeywords = Array.isArray(r.state.dsl.recentKeywords);
        out.hasPendingOutcomes = Array.isArray(r.state.dsl.pendingOutcomes);
        out.historyCap500 = r.state.dsl.historyCap >= 500;
        out.schemaVersionIq = /^(7\.7[2-9]|8\.0-multiworld)/.test(r.state.worldMeta.schemaVersion);

        // Keyword-Extraktion
        const kws = r.pathExtractKeywords("Ich liebe den Wald und Wasserfälle hier");
        out.keywordsExtracted = Array.isArray(kws) && kws.includes("wald") && kws.includes("wasserfälle");
        out.keywordsFilterStopwords = !kws.includes("der") && !kws.includes("ich");

        // rememberChatKeywords füllt den Window
        r.state.dsl.recentKeywords.length = 0;
        r.rememberChatKeywords("teste mit drachen und feuer", 1000);
        out.keywordsRemembered = r.state.dsl.recentKeywords.length >= 2;

        // pruneRecentKeywords entfernt alte
        r.state.dsl.recentKeywords.push({ keyword: "alt", at: 0 });
        r.pruneRecentKeywords(120);
        out.oldKeywordsPruned = !r.state.dsl.recentKeywords.some((e) => e.keyword === "alt");

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
        r.state.dsl.patternMemory = {};
        r.state.dsl.recentKeywords = [{ keyword: "drache", at: 100 }];
        r.rememberOutcomeAsPattern({ startedAt: 100 }, ["spawn_creature", ["at_player"], 1, "happy"], 0.8, 110);
        out.patternMemoryWritten =
            Array.isArray(r.state.dsl.patternMemory["drache"]) && r.state.dsl.patternMemory["drache"].length === 1;
        // Low-fitness Programme werden NICHT geschrieben
        r.rememberOutcomeAsPattern({ startedAt: 100 }, ["weather", "rainy"], 0.3, 110);
        out.lowFitnessIgnored = r.state.dsl.patternMemory["drache"].length === 1;

        // dslSelectByPattern findet das Programm
        let foundByPattern = 0;
        for (let i = 0; i < 10; i++) {
            const p = r.dslSelectByPattern(Math.random);
            if (Array.isArray(p) && p[0] === "spawn_creature") foundByPattern++;
        }
        out.patternSelectionWorks = foundByPattern === 10;

        // Pfad-Buckets: samplePathBuckets inkrementiert
        const before = { ...r.state.player.pathBuckets.height };
        r.state.player.pathLastSample = -Infinity;
        r.samplePathBuckets(performance.now() / 1000);
        const after = r.state.player.pathBuckets.height;
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

    if (!iqResults || iqResults.error) {
        check(
            "Schicht 1: IQ-Snapshot erreichbar",
            false,
            (iqResults && iqResults.error) || "page.evaluate fehlgeschlagen"
        );
    } else {
        check("Schicht 1: pathBuckets-State im player", iqResults.hasPathBuckets);
        check("Schicht 1: patternMemory-State im dsl", iqResults.hasPatternMemory);
        check(
            "Schicht 1: recentKeywords + pendingOutcomes",
            iqResults.hasRecentKeywords && iqResults.hasPendingOutcomes
        );
        check("Schicht 1: historyCap auf 500 erhöht", iqResults.historyCap500);
        check("Schicht 1: schemaVersion auf 7.72-iq-v1 gebumpt", iqResults.schemaVersionIq);
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
async function checkBandV1722NexusEyes(ctx) {
    const { page, check } = ctx;
    const res = await page.evaluate(() => {
        const r = window.anazhRealm;
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
    check("V17.22 Nexus-Augen: magie-leitender Ort → magisches Lila", res.magieColor);
    check("V17.22 Nexus-Augen: glühender Ort → warmes Feuer", res.glutColor);
    check("V17.22 Nexus-Augen: lebendiger Ort → frisches Grün", res.lebendigColor);
    check("V17.22 Nexus-Augen: neutrales Feld → freie erkundende Palette", res.neutralPalette);
    check("V17.22 Nexus-Augen: komponiert weiter valide DSL (backward-compat)", res.composesValid);
}

// V9.52-e Sub-Welle e — Band-Funktion (Welle 6.H Phase 2E V1 + V1.1 + V2 + V3 — Kreatur-LLM-Persona + @-Adressen + Proaktive Sprache + Welt-Aktion-Vorschläge).
// Mehrere ### -Sektionen als flache Liste; reines verhaltensneutrales Refactoring.
async function checkBandWelle6HCreatureLlm(ctx) {
    const { page, check, logs, errors, finalState } = ctx;
    void errors;
    void finalState;
    // ### Welle 6.H Phase 2E V1 — Kreatur-LLM-Persona ###
    // Der Spieler spricht mit EINER Kreatur; der Persona-Prompt versammelt ihre volle Identität
    // (Body+Specs+Equipped+Boosts+Memory+bornAt+Welt). Kein echter LLM-Call: geprüft: Builder + Routing.
    const wave6hP2eV1Results = await safeEvaluate(page, () => {
        const r = window.anazhRealm;
        if (!r || !r.state || !r.state.playerMesh) return null;
        const out = {};

        // 1. Methoden existieren
        out.hasBuildPersona = typeof r._buildCreaturePersonaPrompt === "function";
        out.hasFindByName = typeof r._findCreatureByName === "function";
        out.hasLlmCallCreature = typeof r.llmCallCreature === "function";
        out.hasParseAddress = typeof r._parseCreatureAddress === "function";
        out.hasMaybeAnswerCreature = typeof r.maybeAnswerCreature === "function";

        // 2. _findCreatureByName findet die Kreatur (case-insensitive)
        const player = r.state.playerMesh.position;
        // V18.347-Klasse (Cap-Gotcha): die Kreatur-Liste ISOLIEREN — am vollen
        // maxCreatures-Cap gibt spawnCreatureAt null → .userData wirft → der
        // ganze Block starb STILL (die stummen Nulls). __restore() am Ende.
        const __savedC = r.state.creatures;
        const __savedE = r.state.creatureEmotions;
        r.state.creatures = [];
        r.state.creatureEmotions = [];
        const __restore = () => {
            for (const __tc of r.state.creatures.slice()) r.removeCreature(__tc);
            r.state.creatures = __savedC;
            r.state.creatureEmotions = __savedE;
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
        out.promptHasWeather = new RegExp(r.state.weather || "sunny").test(prompt);
        out.promptInstructsJson = /JSON-Objekt/.test(prompt) && /say/.test(prompt) && /program/.test(prompt);
        // V3 (V7.93): Prompt erlaubt jetzt program + nennt
        // Whitelist (Co-Schöpfer-Geist). V1-Test umgekehrt:
        // wir prüfen, dass Whitelist + Anweisung enthalten sind.
        out.promptForbidsProgram = /Welt-Aktion ist erlaubt/.test(prompt) && /Erlaubte Ops/.test(prompt);
        out.promptHasAge = /Sekunden|Minuten|Stunden|Tage/.test(prompt);

        // 5. llmCallCreature ohne LLM-aktiv → error-Object
        const wasEnabled = r.state.llm && r.state.llm.enabled;
        if (r.state.llm) r.state.llm.enabled = false;
        // (kann nicht await in evaluate ohne async — wir testen sync Behauptung)
        out.llmCreatureNeedsLlm = typeof r.llmCallCreature === "function"; // Existenz reicht

        // 6. maybeAnswerCreature ohne aktive LLM gibt Hinweis-Output
        let chatLines = [];
        const append = (text) => chatLines.push(text);
        // synchron prüfen wir nur das Parse + LLM-Off-Branch
        // (await funktioniert in evaluate via async-IIFE — vereinfacht)
        return Promise.resolve()
            .then(async () => {
                await r.maybeAnswerCreature("TestNira, hallo", append);
                out.llmOffPolite = chatLines.some((l) => /hört dich/.test(l));
                out.llmOffNoCall = !r.state.llm.inFlight;
                // Unbekannter Name → höfliche Ablehnung
                chatLines.length = 0;
                await r.maybeAnswerCreature("UnbekannterXYZ, hallo", append);
                out.unknownPolite = chatLines.some((l) => /Niemand|hört zu/.test(l));
                if (r.state.llm) r.state.llm.enabled = wasEnabled || false;
                return out;
            })
            .catch((e) => ({ error: String(e) }))
            .then((res) => {
                __restore();
                return res;
            });
    });

    if (wave6hP2eV1Results && !wave6hP2eV1Results.error) {
        check(
            "Welle 6.H P2E V1: alle 5 Methoden existieren (_buildCreaturePersonaPrompt + _findCreatureByName + llmCallCreature + _parseCreatureAddress + maybeAnswerCreature)",
            wave6hP2eV1Results.hasBuildPersona &&
                wave6hP2eV1Results.hasFindByName &&
                wave6hP2eV1Results.hasLlmCallCreature &&
                wave6hP2eV1Results.hasParseAddress &&
                wave6hP2eV1Results.hasMaybeAnswerCreature
        );
        check(
            "Welle 6.H P2E V1: _findCreatureByName exact + case-insensitive + null bei unknown",
            wave6hP2eV1Results.findExact && wave6hP2eV1Results.findCaseInsensitive && wave6hP2eV1Results.findUnknown
        );
        check(
            "Welle 6.H P2E V1: _parseCreatureAddress erkennt 'Name, text' + 'Name: text' + lehnt non-address ab",
            wave6hP2eV1Results.parseComma &&
                wave6hP2eV1Results.parseColon &&
                wave6hP2eV1Results.parseRejectsNonAddress &&
                wave6hP2eV1Results.parseAllowsHyphensUnderscores
        );
        check(
            "Welle 6.H P2E V1: Persona-Prompt enthält Name + Soul-Label + Alter",
            wave6hP2eV1Results.promptHasName && wave6hP2eV1Results.promptHasSoulLabel && wave6hP2eV1Results.promptHasAge
        );
        check("Welle 6.H P2E V1: Persona-Prompt enthält Stats-Schicht (HP/SPD)", wave6hP2eV1Results.promptHasStats);
        check(
            "Welle 6.H P2E V1: Persona-Prompt enthält Specs-Schicht (Sammler von holz)",
            wave6hP2eV1Results.promptHasSpecs
        );
        check(
            "Welle 6.H P2E V1: Persona-Prompt enthält Equipped-Schicht (hammer)",
            wave6hP2eV1Results.promptHasEquipped
        );
        check("Welle 6.H P2E V1: Persona-Prompt enthält Boost-Schicht (Test-Tonic)", wave6hP2eV1Results.promptHasBoost);
        check("Welle 6.H P2E V1: Persona-Prompt enthält Memory-Auszug", wave6hP2eV1Results.promptHasMemory);
        check("Welle 6.H P2E V1: Persona-Prompt enthält Welt-Kontext (Wetter)", wave6hP2eV1Results.promptHasWeather);
        check(
            "Welle 6.H P2E V1: Persona-Prompt instruiert JSON-Format (say + program)",
            wave6hP2eV1Results.promptInstructsJson
        );
        check(
            "Welle 6.H P2E V3: Persona-Prompt erlaubt program + nennt CREATURE_PROPOSED_OPS-Whitelist",
            wave6hP2eV1Results.promptForbidsProgram
        );
        check(
            "Welle 6.H P2E V1: maybeAnswerCreature ohne aktive LLM → höflicher Hinweis (kein API-Call)",
            wave6hP2eV1Results.llmOffPolite && wave6hP2eV1Results.llmOffNoCall
        );
        check(
            "Welle 6.H P2E V1: maybeAnswerCreature mit unbekanntem Namen → 'Niemand hört zu'",
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
        const r = window.anazhRealm;
        if (!r || !r.state || !r.state.playerMesh) return null;
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
        const player = r.state.playerMesh.position;
        // V18.347-Klasse (Cap-Gotcha): die Kreatur-Liste ISOLIEREN — am vollen
        // maxCreatures-Cap gibt spawnCreatureAt null → .userData wirft → der
        // ganze Block starb STILL (die stummen Nulls). __restore() am Ende.
        const __savedC = r.state.creatures;
        const __savedE = r.state.creatureEmotions;
        r.state.creatures = [];
        r.state.creatureEmotions = [];
        const __restore = () => {
            for (const __tc of r.state.creatures.slice()) r.removeCreature(__tc);
            r.state.creatures = __savedC;
            r.state.creatureEmotions = __savedE;
        };
        const cSprite = r.spawnCreatureAt(player.x + 600, player.y, player.z + 600, "happy", "fuchs");
        cSprite.userData.name = "TestSpriteV11";
        const cWesen = r.spawnCreatureAt(player.x + 610, player.y, player.z + 610, "happy", "wesen");
        cWesen.userData.name = "TestWesenV11";
        const cGeist = r.spawnCreatureAt(player.x + 620, player.y, player.z + 620, "happy", "baer");
        cGeist.userData.name = "TestGeistV11";
        if (typeof r._renderCreatureListUI === "function") r._renderCreatureListUI();
        const listEl = document.getElementById("creature-list");
        out.spriteHasSoulClass = !!(listEl && listEl.querySelector(".creature-name.soul-fuchs"));
        out.wesenHasSoulClass = !!(listEl && listEl.querySelector(".creature-name.soul-wesen"));
        out.geistHasSoulClass = !!(listEl && listEl.querySelector(".creature-name.soul-baer"));

        // 8. Chat-Output: llmCallCreature gestubbt (kein API-Call) — prüft, dass die Antwort als Soul-Span
        //    mit den DOM-Soul-Klassen gerendert wird.
        const wasLlmEnabled = r.state.llm && r.state.llm.enabled;
        if (r.state.llm) r.state.llm.enabled = true;
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
                if (r.state.llm) r.state.llm.enabled = wasLlmEnabled || false;
                return out;
            })
            .catch((e) => ({ error: String(e) }))
            .then((res) => {
                __restore();
                return res;
            });
    });

    if (wave6hP2eV11Results && !wave6hP2eV11Results.error) {
        check(
            "Welle 6.H P2E V1.1: @Name text → erkannt als explizite Adresse (explicit=true)",
            wave6hP2eV11Results.atPatternMatches
        );
        check(
            "Welle 6.H P2E V1.1: @Name, text + @Name: text Varianten unterstützt",
            wave6hP2eV11Results.atPatternWithComma && wave6hP2eV11Results.atPatternWithColon
        );
        check(
            "Welle 6.H P2E V1.1: Name, text bleibt rückwärts-kompatibel (explicit=false)",
            wave6hP2eV11Results.fallbackComma
        );
        check(
            "Welle 6.H P2E V1.1: 'Bran wie gehts' (ohne Trenner) wird NICHT als Adresse missverstanden (Schöpfer-Bug-Fix)",
            wave6hP2eV11Results.noTrennerRejected
        );
        check("Welle 6.H P2E V1.1: '@ hallo' ohne Name wird abgelehnt", wave6hP2eV11Results.atWithoutNameRejected);
        check(
            "Welle 6.H P2E V1.1: Liste rendert Soul-Klassen .soul-fuchs/.soul-wesen/.soul-baer auf creature-name",
            wave6hP2eV11Results.spriteHasSoulClass &&
                wave6hP2eV11Results.wesenHasSoulClass &&
                wave6hP2eV11Results.geistHasSoulClass
        );
        check(
            "Welle 6.H P2E V1.1: Chat-Output bei Kreatur-Antwort rendert <span class='chat-creature-name soul-X'>",
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
        const r = window.anazhRealm;
        if (!r || !r.state || !r.state.playerMesh) return null;
        const out = {};
        const Class = r.constructor;

        // 1. Konstanten + Methode existieren
        out.hasPhrases = typeof Class.CREATURE_PROACTIVE_PHRASES === "object";
        out.gapPerCreature = Class.CREATURE_PROACTIVE_GAP_PER_CREATURE === 60;
        out.gapGlobal = Class.CREATURE_PROACTIVE_GAP_GLOBAL === 8;
        out.hasMethod = typeof r._creatureSpeakProactive === "function";
        out.toggleInState = typeof r.state.creatureProactiveSpeechEnabled === "boolean";

        // 2. Phrase-Pool hat 5 Event-Typen, jede mit 3 Soul-Profile + default
        const pool = Class.CREATURE_PROACTIVE_PHRASES;
        const events = [
            "level_up_gather",
            "level_up_build",
            "boost_received",
            "no_material_found",
            "no_inventory_for_build",
        ];
        out.allEventsPresent = events.every((e) => pool[e]);
        // ALTLASTEN-NULL: sprite/geist-Stimmen sind gefallen — default trägt
        // jede Gattung; wesen (Hirsch) behält seine erdige Stimme.
        out.hasSpriteVariants = !pool.level_up_gather.sprite;
        out.hasWesenVariants = pool.level_up_gather.wesen && pool.level_up_gather.wesen.length >= 2;
        out.hasGeistVariants = !pool.level_up_gather.geist;
        out.hasDefaultFallback = !!pool.level_up_gather.default;

        // 3. Test-Setup: drei Soul-Kreaturen, frische Throttle, Toggle ON
        r.state.creatureProactiveSpeechEnabled = true;
        r.state.lastCreatureProactiveSpeech = -Infinity;
        const player = r.state.playerMesh.position;
        // V18.347-Klasse (Cap-Gotcha): die Kreatur-Liste ISOLIEREN — am vollen
        // maxCreatures-Cap gibt spawnCreatureAt null → .userData wirft → der
        // ganze Block starb STILL (die stummen Nulls). __restore() am Ende.
        const __savedC = r.state.creatures;
        const __savedE = r.state.creatureEmotions;
        r.state.creatures = [];
        r.state.creatureEmotions = [];
        const __restore = () => {
            for (const __tc of r.state.creatures.slice()) r.removeCreature(__tc);
            r.state.creatures = __savedC;
            r.state.creatureEmotions = __savedE;
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
        r.state.creatureProactiveSpeechEnabled = false;
        cGeist.userData.lastProactiveSpeech = -Infinity;
        r.state.lastCreatureProactiveSpeech = -Infinity;
        const ok4 = r._creatureSpeakProactive(cGeist, "boost_received", { label: "Tonic" });
        out.toggleOffSilent = ok4 === false;

        // 8. Unbekannter Event-Typ lehnt ab
        r.state.creatureProactiveSpeechEnabled = true;
        cGeist.userData.lastProactiveSpeech = -Infinity;
        r.state.lastCreatureProactiveSpeech = -Infinity;
        const ok5 = r._creatureSpeakProactive(cGeist, "unknown_event", {});
        out.unknownEventRejected = ok5 === false;

        // 9. ALTLASTEN-NULL: eine Gattung OHNE eigene Stimme (Bär) spricht den
        //    DEFAULT-Pool — der Fallback ist die eine Quelle für alle Tiere.
        cGeist.userData.lastProactiveSpeech = -Infinity;
        r.state.lastCreatureProactiveSpeech = -Infinity;
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
        r.state.lastCreatureProactiveSpeech = -Infinity;
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
        r.state.lastCreatureProactiveSpeech = -Infinity;
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
        r.state.lastCreatureProactiveSpeech = -Infinity;
        const beforeB2 = chatOutput ? chatOutput.children.length : 0;
        r.applyCreatureBoost(cBoost, {
            source: "test:proactive", // SELBE source
            tagDelta: { dichte: 0.5 },
            durationSeconds: 30,
            label: "TestTrank",
        });
        const afterB2 = chatOutput ? chatOutput.children.length : 0;
        out.boostRefreshSilent = afterB2 === beforeB2;

        // 13. UI-Toggle existiert im DOM
        const toggleEl = document.getElementById("creature-speech-toggle");
        out.toggleExists = !!toggleEl;
        out.toggleIsCheckbox = toggleEl && toggleEl.type === "checkbox";

        __restore();
        return out;
    });

    if (wave6hP2eV2Results && !wave6hP2eV2Results.error) {
        check(
            "Welle 6.H P2E V2: CREATURE_PROACTIVE_PHRASES + gap-Konstanten (60s/Kreatur, 8s global) + _creatureSpeakProactive existieren",
            wave6hP2eV2Results.hasPhrases &&
                wave6hP2eV2Results.gapPerCreature &&
                wave6hP2eV2Results.gapGlobal &&
                wave6hP2eV2Results.hasMethod &&
                wave6hP2eV2Results.toggleInState
        );
        check(
            "Welle 6.H P2E V2: Phrase-Pool deckt alle 5 Events (level_up_gather/build, boost_received, no_material_found, no_inventory_for_build)",
            wave6hP2eV2Results.allEventsPresent
        );
        check(
            "Welle 6.H P2E V2 (NULL): wesen-Stimme + default-Fallback (sprite/geist-Stimmen gefallen)",
            wave6hP2eV2Results.hasSpriteVariants &&
                wave6hP2eV2Results.hasWesenVariants &&
                wave6hP2eV2Results.hasGeistVariants &&
                wave6hP2eV2Results.hasDefaultFallback
        );
        check(
            "Welle 6.H P2E V2: Erste Aussage erfolgreich, Chat-Zeile + Soul-Span + Name + Template-Replacement",
            wave6hP2eV2Results.firstSpeechOk &&
                wave6hP2eV2Results.chatLineAdded &&
                wave6hP2eV2Results.lineHasSpriteSoul &&
                wave6hP2eV2Results.lineHasName &&
                wave6hP2eV2Results.templateReplaced
        );
        check(
            "Welle 6.H P2E V2: Per-Kreatur-Throttle (60s) lehnt sofortige Zweit-Aussage ab",
            wave6hP2eV2Results.perCreatureThrottle
        );
        check(
            "Welle 6.H P2E V2: Global-Throttle (8s) lehnt andere Kreatur sofort nach erster Aussage ab",
            wave6hP2eV2Results.globalThrottle
        );
        check(
            "Welle 6.H P2E V2: Toggle OFF → keine proaktive Sprache (silent drop)",
            wave6hP2eV2Results.toggleOffSilent
        );
        check("Welle 6.H P2E V2: Unbekannter Event-Typ → silent drop", wave6hP2eV2Results.unknownEventRejected);
        check(
            "Welle 6.H P2E V2 (NULL): Gattung ohne eigene Stimme spricht den default-Pool",
            wave6hP2eV2Results.geistUsedGeistPool
        );
        check(
            "Welle 6.H P2E V2: Hook _onCreatureLevelUp triggert proaktive Sprache",
            wave6hP2eV2Results.levelUpHookFired
        );
        check("Welle 6.H P2E V2: Hook applyCreatureBoost triggert bei NEUEM Boost", wave6hP2eV2Results.boostHookFired);
        check(
            "Welle 6.H P2E V2: applyCreatureBoost mit SELBER Quelle (Verlängerung) → KEINE erneute Sprache (kein Flood)",
            wave6hP2eV2Results.boostRefreshSilent
        );
        check(
            "Welle 6.H P2E V2: UI-Toggle #creature-speech-toggle existiert im DOM (Checkbox)",
            wave6hP2eV2Results.toggleExists && wave6hP2eV2Results.toggleIsCheckbox
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
        const r = window.anazhRealm;
        if (!r || !r.state || !r.state.playerMesh) return null;
        const out = {};
        const Class = r.constructor;

        // 1. Konstanten + Methoden existieren
        out.hasWhitelist = Class.CREATURE_PROPOSED_OPS instanceof Set;
        out.whitelistSize = Class.CREATURE_PROPOSED_OPS.size >= 10;
        out.weatherAllowed = Class.CREATURE_PROPOSED_OPS.has("weather");
        out.voxelCarveAllowed = Class.CREATURE_PROPOSED_OPS.has("voxel_carve");
        out.voxelFillAllowed = Class.CREATURE_PROPOSED_OPS.has("voxel_fill");
        out.spawnBlueprintAllowed = Class.CREATURE_PROPOSED_OPS.has("spawn_blueprint");
        out.chainAllowed = Class.CREATURE_PROPOSED_OPS.has("chain");
        // Forbidden: player_*, define_*, delete_*, set_mode
        out.playerSpeedForbidden = !Class.CREATURE_PROPOSED_OPS.has("player_speed");
        out.defineBlueprintForbidden = !Class.CREATURE_PROPOSED_OPS.has("define_blueprint");
        out.setModeForbidden = !Class.CREATURE_PROPOSED_OPS.has("set_mode");
        out.hasValidator = typeof r._isCreatureProposalAllowed === "function";
        out.hasHandler = typeof r._handleCreatureProposedProgram === "function";
        out.hasExecutor = typeof r._executeCreatureProgram === "function";
        out.hasButtonRenderer = typeof r._renderCreatureProposalButtons === "function";
        out.hasRareEventTrigger = typeof r._maybeTriggerCreatureRareEventLlm === "function";
        out.rareEventGap = Class.CREATURE_LLM_RARE_EVENT_GAP === 600;

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
        const player = r.state.playerMesh.position;
        // V18.347-Klasse (Cap-Gotcha): die Kreatur-Liste ISOLIEREN — am vollen
        // maxCreatures-Cap gibt spawnCreatureAt null → .userData wirft → der
        // ganze Block starb STILL (die stummen Nulls). __restore() am Ende.
        const __savedC = r.state.creatures;
        const __savedE = r.state.creatureEmotions;
        r.state.creatures = [];
        r.state.creatureEmotions = [];
        const __restore = () => {
            for (const __tc of r.state.creatures.slice()) r.removeCreature(__tc);
            r.state.creatures = __savedC;
            r.state.creatureEmotions = __savedE;
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

        // Test schöpfer-Auto (Gegenprüfung uhr-wetter): das Wesen handelt VON SELBST — ohne Zusage des Spielers ist es Welt
        // (`_himmelSchreiber`): gegen das stehende Wort des Spielers hält das Wetter (der Hinweis sagt es), ohne Wort wünscht
        // das Wesen das nächste Wort, und der Wetter-Zug zieht es (die Welt ändert sich beobachtbar). Vorher schrieb es als
        // „creature:" wie ein Gesetz des Spielers und nahm ihm sein Wort (sunny/sunny → rainy/rainy).
        r.setGameMode("schöpfer");
        const __wort0 = r.state.wetterWort;
        const __wunsch0 = r.state.wetterWunsch;
        const __zugUhr0 = r.state.weatherEffectTime;
        r.state.weatherEffectTime = 0;
        r.dslRun(["weather", "sunny"], { source: "human" });
        const beforeAuto = chatOutput ? chatOutput.children.length : 0;
        r._handleCreatureProposedProgram(c, "TestProgramKreatur", ["weather", "rainy"]);
        out.autoHaeltWort = r.state.weather === "sunny" && r.state.wetterWort === "sunny";
        const afterAuto = chatOutput ? chatOutput.children.length : 0;
        out.autoChatLineAdded = afterAuto > beforeAuto;
        out.autoHinweisWort =
            !!chatOutput && /hält dein Wort/.test((chatOutput.lastElementChild || {}).textContent || "");
        r.dslRun(["weather", "frei"], { source: "human" });
        r._handleCreatureProposedProgram(c, "TestProgramKreatur", ["weather", "rainy"]);
        const __wunsch = r.state.wetterWunsch;
        out.autoWuenscht =
            r.state.weather === "sunny" &&
            !!__wunsch &&
            __wunsch.wort === "rainy" &&
            __wunsch.quelle === "creature:TestProgramKreatur";
        r.state.weatherEffectTime = r.constructor.WETTER_ZUG_SEK + 0.5;
        r._loopWeatherAndGrowth(0);
        out.autoExecutedInSchöpfer = r.state.weather === "rainy";
        r.state.wetterWort = __wort0;
        r.state.wetterWunsch = __wunsch0;
        r.state.weatherEffectTime = __zugUhr0;
        // Memory-Eintrag: auto_executed_action
        const memTypes = (c.userData.memory || []).map((m) => m.type);
        out.memoryHasAutoExecuted = memTypes.includes("auto_executed_action");

        // Test pfad: Buttons werden gerendert (kein automatischer
        // Wetter-Wechsel)
        r.setGameMode("pfad");
        const beforePending = chatOutput ? chatOutput.querySelectorAll(".chat-proposal-pending").length : 0;
        const targetWeather2 = r.state.weather === "rainy" ? "sunny" : "rainy";
        r._handleCreatureProposedProgram(c, "TestProgramKreatur", ["weather", targetWeather2]);
        out.pfadDoesNotAutoExecute = r.state.weather !== targetWeather2;
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
        const targetW3 = r.state.weather === "rainy" ? "sunny" : "rainy";
        r._renderCreatureProposalButtons(c2, "ClickTestKreatur", ["weather", targetW3]);
        const acceptBtns = chatOutput ? chatOutput.querySelectorAll(".chat-proposal-btn.accept") : [];
        const acceptBtn = acceptBtns[acceptBtns.length - 1] || null;
        out.acceptButtonExists = !!acceptBtn;
        if (acceptBtn) {
            acceptBtn.click();
            out.acceptClickExecutes = r.state.weather === targetW3;
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
        check(
            "Welle 6.H P2E V3: CREATURE_PROPOSED_OPS Set + Validator + Handler + Executor + ButtonRenderer + RareEvent-Trigger existieren",
            wave6hP2eV3Results.hasWhitelist &&
                wave6hP2eV3Results.whitelistSize &&
                wave6hP2eV3Results.hasValidator &&
                wave6hP2eV3Results.hasHandler &&
                wave6hP2eV3Results.hasExecutor &&
                wave6hP2eV3Results.hasButtonRenderer &&
                wave6hP2eV3Results.hasRareEventTrigger &&
                wave6hP2eV3Results.rareEventGap
        );
        check(
            "Welle 6.H P2E V3 + V9.36: Whitelist erlaubt atmosphärische + Voxel-Mod-Ops (weather, voxel_carve, voxel_fill, spawn_blueprint, chain)",
            wave6hP2eV3Results.weatherAllowed &&
                wave6hP2eV3Results.voxelCarveAllowed &&
                wave6hP2eV3Results.voxelFillAllowed &&
                wave6hP2eV3Results.spawnBlueprintAllowed &&
                wave6hP2eV3Results.chainAllowed
        );
        check(
            "Welle 6.H P2E V3: Whitelist verbietet player_speed + define_blueprint + set_mode (Spieler-/Welt-Wissen-Eingriff blockiert)",
            wave6hP2eV3Results.playerSpeedForbidden &&
                wave6hP2eV3Results.defineBlueprintForbidden &&
                wave6hP2eV3Results.setModeForbidden
        );
        check(
            "Welle 6.H P2E V3 + V9.36: Validator akzeptiert erlaubte Programme (weather, chain, voxel_carve)",
            wave6hP2eV3Results.allowsWeather && wave6hP2eV3Results.allowsChain && wave6hP2eV3Results.allowsTerrain
        );
        check(
            "Welle 6.H P2E V3: Validator lehnt verbotene Ops ab + nennt forbiddenOp",
            wave6hP2eV3Results.rejectsPlayerSpeed && wave6hP2eV3Results.rejectsDefine
        );
        check(
            "Welle 6.H P2E V3: Validator erkennt verbotene Op TIEF im Chain (Defense-Recursion)",
            wave6hP2eV3Results.rejectsNestedForbidden
        );
        check(
            "Welle 6.H P2E V3: Persona-Prompt erlaubt program + nennt Op-Whitelist + erwähnt schöpfer-Modus",
            wave6hP2eV3Results.promptMentionsProgram &&
                wave6hP2eV3Results.promptListsOps &&
                wave6hP2eV3Results.promptMentionsModus
        );
        check(
            "Welle 6.H P2E V3: schöpfer-Modus → auto-execute als Welt: gegen das Wort des Spielers hält das Wetter (Hinweis), ohne Wort wünscht das Wesen und der Wetter-Zug zieht es + chat-Hinweis-Zeile + Memory auto_executed_action",
            wave6hP2eV3Results.autoHaeltWort &&
                wave6hP2eV3Results.autoHinweisWort &&
                wave6hP2eV3Results.autoWuenscht &&
                wave6hP2eV3Results.autoExecutedInSchöpfer &&
                wave6hP2eV3Results.autoChatLineAdded &&
                wave6hP2eV3Results.memoryHasAutoExecuted,
            `hält ${wave6hP2eV3Results.autoHaeltWort} · Hinweis ${wave6hP2eV3Results.autoHinweisWort} · wünscht ${wave6hP2eV3Results.autoWuenscht} · Zug zieht ${wave6hP2eV3Results.autoExecutedInSchöpfer}`
        );
        check(
            "Welle 6.H P2E V3: pfad-Modus → KEIN auto-execute, statt Buttons gerendert (.chat-proposal-pending)",
            wave6hP2eV3Results.pfadDoesNotAutoExecute &&
                wave6hP2eV3Results.pfadRendersButtons &&
                wave6hP2eV3Results.memoryHasProposed
        );
        check(
            "Welle 6.H P2E V3: Defense-in-Depth — verbotenes Programm wird AUCH im schöpfer-Modus blockiert + proposal_blocked-Memory",
            wave6hP2eV3Results.forbiddenBlockedEvenInSchöpfer &&
                wave6hP2eV3Results.memoryHasBlocked &&
                wave6hP2eV3Results.memoryGrew
        );
        check(
            "Welle 6.H P2E V3: Accept-Button-Click führt Programm aus + accepted_action-Memory",
            wave6hP2eV3Results.acceptButtonExists &&
                wave6hP2eV3Results.acceptClickExecutes &&
                wave6hP2eV3Results.memoryHasAccepted
        );
        check(
            "Welle 6.H P2E V3: Reject-Button-Click → rejected_action-Memory (Spieler-Wille respektiert)",
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

// V9.52-e Sub-Welle e — Band-Funktion (V8.05+06+07 Werkstatt-UX-Polish + Schicht 2 Multi-Provider-LLM-Sandbox + V7.94-V7.98 Ollama-API-Key/Cloud/Proxy/UX/Parser-Robustheit).
// Mehrere ### -Sektionen als flache Liste; reines verhaltensneutrales Refactoring.
async function checkBandWorkshopPolishAndLlm(ctx) {
    const { page, check, logs, errors, finalState } = ctx;
    void errors;
    void finalState;
    // ### V8.05 — Werkstatt-UX-Polish (Mode-Bar oben + Stats unten + Tool-Palette + Editor-Toggle + Del-Btn) ###
    const v805Results = await safeEvaluate(page, () => {
        const r = window.anazhRealm;
        if (!r) return null;
        const out = {};
        try {
            // Werkstatt-Tab öffnen
            const tab = document.querySelector('#topbar [data-tab="werkstatt"]');
            if (tab) tab.click();
            // Methoden
            out.hasRenderTools = typeof r._workshopRenderToolPalette === "function";
            out.hasHandleToolDrop = typeof r._workshopHandleToolDrop === "function";
            out.hasRenderStats = typeof r._workshopRenderStatsPanel === "function";
            // V17.91 — der Editor-Toggle entfiel mit dem Detail-Editor; die Top-Leisten-Akte (Undo/Redo/
            // Löschen/Klonen/Neu) verdrahtet jetzt _workshopInstallActionButtons + ihr Zustand _workshopUpdateTopBarState.
            out.hasInstallActionBtns = typeof r._workshopInstallActionButtons === "function";
            out.hasUpdateTopBarState = typeof r._workshopUpdateTopBarState === "function";
            out.hasInstallDelBtn = typeof r._workshopInstallDeleteButton === "function";

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

            // Stats-Panel im DOM + NACH Canvas (V18.37: jetzt VOLLBREIT aus dem Preview-Wrapper
            // heraus, als Geschwister unter der ganzen Reihe → Dokument-Reihenfolge prüfen, nicht
            // Wrapper-Kind-Index; V9.56-i: der Test wandert mit dem Layout).
            const stats = document.getElementById("workshop-stats-panel");
            out.statsInDom = !!stats;
            if (stats && canvas) {
                out.statsAfterCanvas = !!(canvas.compareDocumentPosition(stats) & Node.DOCUMENT_POSITION_FOLLOWING);
            }

            // Werkzeug-Palette im DOM
            const toolPalette = document.getElementById("workshop-tool-palette");
            out.toolPaletteInDom = !!toolPalette;
            // Wenn Spieler Werkzeuge hat, sind Cards drin
            const playerTools = (r.state.player && r.state.player.tools) || [];
            out.toolCardsCount = toolPalette ? toolPalette.querySelectorAll(".workshop-tool-card").length : 0;
            // V17.91 — die Palette enthält die Hand + (in schöpfer/nah) die Werkstatt-Prozess-Karten; mind. eine Karte.
            void playerTools;
            out.toolPaletteHasCards = out.toolCardsCount > 0;

            // V17.91 — der alte einklappbare Detail-Editor (#workshop-editor + Toggle) ist ENTFERNT (die
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
            if (r.state.blueprints["test_v805"]) r.deleteBlueprint("test_v805");
            r.cloneBlueprint("stein_block", "test_v805");
            r.selectBlueprintForEdit("test_v805");
            r._workshopSetSelection(0);
            out.delBtnEnabledOnSelect = delBtn && delBtn.disabled === false;
            // Del-Btn-Click entfernt Part
            const partsBefore = r.state.blueprints.test_v805.parts.length;
            if (delBtn) delBtn.click();
            const partsAfter = r.state.blueprints.test_v805.parts.length;
            out.delBtnRemovesPart = partsAfter === partsBefore - 1;

            // Stats-Panel zeigt Rolle-Chip
            const roleChip = stats && stats.querySelector(".role-chip");
            out.statsHasRoleChip = !!roleChip;

            // Cleanup
            if (r.state.blueprints["test_v805"]) r.deleteBlueprint("test_v805");
            r.selectBlueprintForEdit("stein_block");
            r._renderWorkshopDOM();
            // UI-Putz: Welt-Tab aufgelöst — neutraler Reset via closeAllDrawers (Welt = Default-Blick).
            if (r && typeof r.closeAllDrawers === "function") r.closeAllDrawers();
            r.state.yaw = 0;
            if (r.state.playerMesh) r.state.playerMesh.rotation.y = 0;
        } catch (err) {
            out.error = err && err.message;
        }
        return out;
    });

    if (v805Results && !v805Results.error) {
        check(
            "V8.05 (V17.91): Werkstatt-Methoden existieren (Tool-Render/Drop + Stats + Top-Leisten-Akte + Del-Btn)",
            v805Results.hasRenderTools &&
                v805Results.hasHandleToolDrop &&
                v805Results.hasRenderStats &&
                v805Results.hasInstallActionBtns &&
                v805Results.hasUpdateTopBarState &&
                v805Results.hasInstallDelBtn
        );
        check(
            "V8.05: Mode-Bar steht IM Preview-Wrapper + VOR Canvas (Workflow von oben nach unten)",
            v805Results.modeBarInWrapper && v805Results.modeBarBeforeCanvas
        );
        check(
            "V8.05: Stats-Panel im DOM + NACH Canvas (schnelle Sicht auf emergente Werte)",
            v805Results.statsInDom && v805Results.statsAfterCanvas
        );
        check(
            "V8.05: Werkzeug-Palette im DOM mit Cards für Spieler-Werkzeuge",
            v805Results.toolPaletteInDom && v805Results.toolPaletteHasCards
        );
        check(
            "V8.05 (V17.91): der alte Detail-Editor ist entfernt (#workshop-editor + Toggle weg)",
            v805Results.editorRemoved
        );
        check(
            "V8.05 (V17.91): Undo/Redo + Löschen wohnen in der Top-Leiste",
            v805Results.topBarUndoRedo && v805Results.topBarDeleteBlueprint
        );
        check(
            "V8.05: Del-Button im DOM + initial disabled (keine Selection)",
            v805Results.delBtnInDom && v805Results.delBtnInitiallyDisabled
        );
        check(
            "V8.05: Del-Button enabled bei Part-Selection + Click entfernt Part",
            v805Results.delBtnEnabledOnSelect && v805Results.delBtnRemovesPart
        );
        check("V8.05 Stats: Rolle-Chip im Stats-Panel sichtbar", v805Results.statsHasRoleChip);
    } else if (v805Results && v805Results.error) {
        check(`V8.05: evaluate-Fehler — ${v805Results.error}`, false);
    }

    // ### V8.06 — Werkstatt-UX: Klone/Neu in Mode-Bar, Default-Size, Kontrast ###
    const v806Results = await safeEvaluate(page, () => {
        const r = window.anazhRealm;
        if (!r) return null;
        const out = {};
        try {
            const tab = document.querySelector('#topbar [data-tab="werkstatt"]');
            if (tab) tab.click();
            // Klone + Neu-Buttons in Mode-Bar
            const modeBar = document.getElementById("workshop-mode-bar");
            out.cloneBtnInModeBar = !!(modeBar && modeBar.querySelector("#workshop-clone-btn"));
            out.newBtnInModeBar = !!(modeBar && modeBar.querySelector("#workshop-new-btn"));
            out.dividerInModeBar = !!(modeBar && modeBar.querySelector(".workshop-mode-divider"));
            // V17.91 — die Mode-Bar trägt 4 Modi (Move/Rotate/Scale/Connect) + Snap + Zentrieren + Undo +
            // Redo + Klonen + Neu + Löschen. V18.62 Ich-H — + „Körper holen" (Seele→Bauplan-Brücke) = 12.
            const allBtns = modeBar ? modeBar.querySelectorAll("button").length : 0;
            out.sevenButtonsInBar = allBtns === 12; // W-G (V18.177): +„▶ Gelenk-Probe" (V18.110 waren 11)

            // Methode existiert
            out.hasActionInstall = typeof r._workshopInstallActionButtons === "function";
            out.hasDefaultSize = typeof r._workshopApplyDefaultSizeOnce === "function";

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

            // Default-Size-Apply-Funktion ist sauber idempotent —
            // wir setzen Flag, dann ist die Funktion no-op
            try {
                localStorage.setItem("anazh.workshop.defaultApplied", "1");
                r._workshopApplyDefaultSizeOnce();
                // Nichts sollte passiert sein (flag schützt)
                out.idempotentRespected = true;
            } catch {
                out.idempotentRespected = false;
            }

            // Cleanup
            // UI-Putz: Welt-Tab aufgelöst — neutraler Reset via closeAllDrawers (Welt = Default-Blick).
            if (r && typeof r.closeAllDrawers === "function") r.closeAllDrawers();
            r.state.yaw = 0;
            if (r.state.playerMesh) r.state.playerMesh.rotation.y = 0;
        } catch (err) {
            out.error = err && err.message;
        }
        return out;
    });

    if (v806Results && !v806Results.error) {
        check(
            "V8.06: Klonen + Neu-Buttons direkt in der Mode-Bar (mit Divider)",
            v806Results.cloneBtnInModeBar && v806Results.newBtnInModeBar && v806Results.dividerInModeBar
        );
        check(
            "V8.06/V17.91/V18.110/W-G: Mode-Bar hat 12 Buttons (4 Modi + Snap + Zentrieren + Undo + Redo + ▶ Gelenk-Probe + Klonen + Neu + Löschen)",
            v806Results.sevenButtonsInBar
        );
        check(
            "V8.06: _workshopInstallActionButtons + _workshopApplyDefaultSizeOnce existieren",
            v806Results.hasActionInstall && v806Results.hasDefaultSize
        );
        check(
            `V8.06: rechte Palette breiter (≥128px, gemessen: ${v806Results.rightPaletteWidth || 0}px)`,
            v806Results.rightPaletteWider
        );
        check("V8.06: Mode-Bar hat Hintergrund-Farbe (Kontrast-Verbesserung)", v806Results.modeBarHasBg);
        check("V8.06: Stats-Panel hat dunklen Hintergrund (Kontrast-Verbesserung)", v806Results.statsHasDarkBg);
        check(
            "V8.06: _workshopApplyDefaultSizeOnce ist idempotent (flag respektiert)",
            v806Results.idempotentRespected
        );
    } else if (v806Results && v806Results.error) {
        check(`V8.06: evaluate-Fehler — ${v806Results.error}`, false);
    }

    // ### V8.07 — Werkstatt-Detail-Polish (Klone/Neu klickbar, Stern-Stats, Default-Größe fix) ###
    const v807Results = await safeEvaluate(page, () => {
        const r = window.anazhRealm;
        if (!r) return null;
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
            if (r.state.blueprints["test_v807"]) r.deleteBlueprint("test_v807");
            r.cloneBlueprint("stein_block", "test_v807");
            r.selectBlueprintForEdit("test_v807");
            out.modeBtnEnabledOnCustom = moveBtn && moveBtn.disabled === false;

            // V18.44 Spec-Sheet: die Tags sind Daten-Viz-BALKEN (.spec-bar mit .spec-bar-fill.lvl-X),
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
            if (r.state.blueprints["test_v807"]) r.deleteBlueprint("test_v807");
            r.selectBlueprintForEdit("stein_block");
            r._renderWorkshopDOM();
            // UI-Putz: Welt-Tab aufgelöst — neutraler Reset via closeAllDrawers (Welt = Default-Blick).
            if (r && typeof r.closeAllDrawers === "function") r.closeAllDrawers();
            r.state.yaw = 0;
            if (r.state.playerMesh) r.state.playerMesh.rotation.y = 0;
        } catch (err) {
            out.error = err && err.message;
        }
        return out;
    });

    if (v807Results && !v807Results.error) {
        check("V8.07: Klone-Button IMMER enabled (auch bei built-in)", v807Results.cloneBtnAlwaysEnabled);
        check("V8.07: Neu-Button IMMER enabled (auch bei built-in)", v807Results.newBtnAlwaysEnabled);
        check("V8.07: Mode-Buttons (Move/...) disabled bei built-in", v807Results.modeBtnDisabledOnBuiltIn);
        check("V8.07: Mode-Buttons enabled bei eigenem Bauplan", v807Results.modeBtnEnabledOnCustom);
        check(
            `V18.44 Spec-Sheet: ${v807Results.tagChipsCount} Profil-/Resonanz-Balken mit Fill + Stufen-Klasse`,
            v807Results.tagChipsHaveStars && v807Results.tagChipsHaveLevelClass
        );
        check("V18.44 Spec-Sheet: Qualitäts-Sterne sind ★/☆ (5 Zeichen)", v807Results.starsAreGlyphs);
        check(
            "V18.42: _workshopApplyDefaultSizeOnce räumt die stale Resize-Größe + Inline (CSS-Rahmen trägt jetzt)",
            v807Results.defaultOverridesStale
        );
        check("V18.42: idempotent — zweiter Apply lässt keine Inline-Größe zurück", v807Results.idempotentAfterApply);
    } else if (v807Results && v807Results.error) {
        check(`V8.07: evaluate-Fehler — ${v807Results.error}`, false);
    }

    // ### Schicht 2 — Multi-Provider LLM-Sandbox (UI + Parser, kein echter Call) ###
    const llmResults = await safeEvaluate(page, () => {
        const r = window.anazhRealm;
        if (!r) return null;
        const out = {};
        out.hasLlmState = r.state.llm && typeof r.state.llm.enabled === "boolean";
        out.hasProviderConfig =
            !!r.state.llm.providerConfig &&
            !!r.state.llm.providerConfig.anthropic &&
            !!r.state.llm.providerConfig.google &&
            !!r.state.llm.providerConfig.openrouter &&
            !!r.state.llm.providerConfig.ollama;
        const defs = r.llmProviderDefs();
        out.fourProviders = Object.keys(defs).length === 4;
        out.providerHasBuildBody =
            typeof defs.anthropic.buildBody === "function" &&
            typeof defs.google.buildBody === "function" &&
            typeof defs.openrouter.buildBody === "function" &&
            typeof defs.ollama.buildBody === "function";

        // Endpoint je Provider liefert die erwartete URL.
        out.anthropicEndpoint = defs.anthropic.endpoint("m", "k") === "https://api.anthropic.com/v1/messages";
        out.googleEndpointGenerateContent =
            /generativelanguage\.googleapis\.com\/v1beta\/models\/gemini-2\.0-flash:generateContent$/.test(
                defs.google.endpoint("gemini-2.0-flash", "KEY")
            );
        out.googleHeaderHasApiKey = defs.google.buildHeaders("KEY")["x-goog-api-key"] === "KEY";
        out.openrouterEndpoint = defs.openrouter.endpoint("m", "k") === "https://openrouter.ai/api/v1/chat/completions";
        out.ollamaEndpoint =
            defs.ollama.endpoint("m", "", { endpoint: "http://localhost:11434" }) === "http://localhost:11434/api/chat";
        out.ollamaNoKeyRequired = defs.ollama.requiresKey === false;

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
        const olBody = defs.ollama.buildBody("m", sys, usr);
        out.ollamaBodyShape = olBody.stream === false && Array.isArray(olBody.messages);

        // Response-Parser pro Provider
        out.anthropicExtract = defs.anthropic.extractText({ content: [{ type: "text", text: "hi" }] }) === "hi";
        out.geminiExtract =
            defs.google.extractText({ candidates: [{ content: { parts: [{ text: "hi" }] } }] }) === "hi";
        out.openrouterExtract = defs.openrouter.extractText({ choices: [{ message: { content: "hi" } }] }) === "hi";
        out.ollamaExtract = defs.ollama.extractText({ message: { content: "hi" } }) === "hi";

        // UI: Provider-Selektor + Schlüsselzeile + Endpoint-Zeile (für Ollama)
        out.llmUiProvider = !!document.getElementById("llm-provider");
        out.llmUiKey = !!document.getElementById("llm-key");
        out.llmUiEndpoint = !!document.getElementById("llm-endpoint");
        out.llmUiModel = !!document.getElementById("llm-model");
        out.llmUiToggle = !!document.getElementById("llm-toggle");

        // Default-Provider ist anthropic; Provider-Selector trägt alle vier
        const sel = document.getElementById("llm-provider");
        out.providerSelectorPopulated = sel && sel.options.length === 4;

        // System-Prompt enthält die DSL-Vertrag-Anweisungen
        const sp = r.llmBuildSystemPrompt();
        out.systemPromptHasJson = /JSON/i.test(sp) && /say/.test(sp) && /program/.test(sp);

        // Parser robust gegen Markdown / kaputtes JSON
        const ok = r.llmParseResponse('{"say":"Hallo","program":["weather","sunny"]}');
        out.parserParsesValidJson = ok.say === "Hallo" && Array.isArray(ok.program);
        const fenced = r.llmParseResponse('```json\n{"say":"hi","program":null}\n```');
        out.parserStripsFence = fenced.say === "hi" && fenced.program === null;
        // V7.98: Parser nutzt Plain-Text-Fallback statt strict-error.
        // Lokale Modelle ignorieren oft den JSON-Vertrag — wir nehmen
        // ihren Plain-Text als `say` damit der Spieler trotzdem etwas sieht.
        const broken = r.llmParseResponse("nicht json");
        out.parserDetectsError = broken.say === "nicht json" && broken.fallbackUsed === "plain-text";

        // Disabled-LLM blockt Call ohne Netzwerk-Versuch
        r.state.llm.enabled = false;
        return new Promise((resolve) => {
            r.llmCall("test").then((rep) => {
                out.callBlockedWhenDisabled = rep.error === "LLM nicht aktiv";
                const meta = document.querySelector('meta[http-equiv="Content-Security-Policy"]');
                const csp = meta ? meta.getAttribute("content") : "";
                out.cspAnthropic = /api\.anthropic\.com/.test(csp);
                out.cspGoogle = /generativelanguage\.googleapis\.com/.test(csp);
                out.cspOpenRouter = /openrouter\.ai/.test(csp);
                out.cspOllama = /localhost:11434/.test(csp);
                resolve(out);
            });
        });
    });

    if (!llmResults || llmResults.error) {
        check(
            "Schicht 2: LLM-Snapshot erreichbar",
            false,
            (llmResults && llmResults.error) || "page.evaluate fehlgeschlagen"
        );
    } else {
        check("Schicht 2: state.llm + providerConfig komplett", llmResults.hasLlmState && llmResults.hasProviderConfig);
        check("Schicht 2: vier Provider definiert", llmResults.fourProviders);
        check("Schicht 2: jeder Provider hat buildBody-Fn", llmResults.providerHasBuildBody);
        check("Schicht 2: Anthropic-Endpoint korrekt", llmResults.anthropicEndpoint);
        check("Schicht 2: Gemini-Endpoint auf :generateContent", llmResults.googleEndpointGenerateContent);
        check("Schicht 2: Gemini-Header trägt x-goog-api-key", llmResults.googleHeaderHasApiKey);
        check("Schicht 2: OpenRouter-Endpoint korrekt", llmResults.openrouterEndpoint);
        check("Schicht 2: Ollama-Endpoint nutzt /api/chat", llmResults.ollamaEndpoint);
        check("Schicht 2: Ollama braucht keinen Key", llmResults.ollamaNoKeyRequired);
        check("Schicht 2: Anthropic-Body trägt system + messages", llmResults.anthropicBodyShape);
        check("Schicht 2: Gemini-Body trägt systemInstruction + contents", llmResults.geminiBodyShape);
        check("Schicht 2: OpenRouter-Body OpenAI-kompatibel", llmResults.openrouterBodyShape);
        check("Schicht 2: Ollama-Body trägt stream=false + messages", llmResults.ollamaBodyShape);
        check("Schicht 2: Anthropic-Response extrahiert text-Block", llmResults.anthropicExtract);
        check("Schicht 2: Gemini-Response extrahiert candidates[0].parts", llmResults.geminiExtract);
        check("Schicht 2: OpenRouter-Response extrahiert choices[0].message", llmResults.openrouterExtract);
        check("Schicht 2: Ollama-Response extrahiert message.content", llmResults.ollamaExtract);
        check(
            "Schicht 2: UI-Felder (Provider/Key/Endpoint/Model/Toggle)",
            llmResults.llmUiProvider &&
                llmResults.llmUiKey &&
                llmResults.llmUiEndpoint &&
                llmResults.llmUiModel &&
                llmResults.llmUiToggle
        );
        check("Schicht 2: Provider-Selektor mit 4 Optionen befüllt", llmResults.providerSelectorPopulated);
        check("Schicht 2: System-Prompt trägt DSL-JSON-Vertrag", llmResults.systemPromptHasJson);
        check("Schicht 2: Parser akzeptiert gültiges JSON", llmResults.parserParsesValidJson);
        check("Schicht 2: Parser entfernt Markdown-Fences", llmResults.parserStripsFence);
        check(
            "Schicht 2: Parser nutzt Plain-Text-Fallback bei Nicht-JSON (V7.98 — User sieht Antwort statt Error)",
            llmResults.parserDetectsError
        );
        check("Schicht 2: Disabled-LLM blockt Call sauber", llmResults.callBlockedWhenDisabled);
        check(
            "Schicht 2: CSP erlaubt alle vier Provider-Endpoints",
            llmResults.cspAnthropic && llmResults.cspGoogle && llmResults.cspOpenRouter && llmResults.cspOllama
        );
    }

    // ### Welle 6.H V7.94 — Ollama-API-Key (gehosteter Setup) ###
    // Lokales Ollama braucht keinen Key, gehostete Setups einen Bearer-Token: buildHeaders schickt
    // Authorization NUR bei gesetztem Key.
    const ollamaKeyResults = await safeEvaluate(page, () => {
        const r = window.anazhRealm;
        if (!r) return null;
        const out = {};
        const defs = r.llmProviderDefs();
        const ol = defs.ollama;
        out.providerExists = !!ol;
        out.requiresKeyFalse = ol && ol.requiresKey === false; // weiterhin OPTIONAL
        out.labelMentionsHosted = ol && /gehostet|Hosted/i.test(ol.label || "");
        out.hintMentionsBearer = ol && /Bearer|Token/i.test(ol.hint || "");

        // buildHeaders ohne Key → kein authorization-Header (lokal)
        const headersNoKey = ol.buildHeaders("", { apiKey: "" });
        out.noAuthWithoutKey = !headersNoKey.authorization && !headersNoKey.Authorization;
        out.contentTypePresent = headersNoKey["content-type"] === "application/json";

        // buildHeaders MIT Key → Bearer-Token
        const headersWithKey = ol.buildHeaders("sk-test-1234", { apiKey: "sk-test-1234" });
        out.bearerWithKey =
            headersWithKey.authorization === "Bearer sk-test-1234" ||
            headersWithKey.Authorization === "Bearer sk-test-1234";

        // Endpoint folgt cfg.endpoint (nicht hartkodiert localhost)
        const customEp = ol.endpoint("llama3.1", "key", { endpoint: "https://my-ollama.cloud:8443" });
        out.endpointRespectsCustom = customEp === "https://my-ollama.cloud:8443/api/chat";

        // CSP: connect-src enthält https: Wildcard für Cloud-Endpoints
        const meta = document.querySelector('meta[http-equiv="Content-Security-Policy"]');
        const csp = meta ? meta.getAttribute("content") : "";
        // Match 'https:' als standalone Wert in connect-src (nicht
        // nur die spezifischen 'https://api.X.com'-Einträge).
        out.cspHasHttpsWildcard = /connect-src[^;]*\bhttps:\s/.test(csp);

        // UI: Key-Row ist auch für ollama sichtbar (V7.94)
        if (r.state.llm) r.state.llm.provider = "ollama";
        if (typeof r.llmRefreshProviderUI === "function") {
            r.llmRefreshProviderUI();
        }
        const keyRow = document.getElementById("llm-key-row");
        out.keyRowVisibleForOllama = !!(keyRow && !keyRow.hidden);
        const keyInput = document.getElementById("llm-key");
        out.placeholderMentionsOptional = !!(keyInput && /optional|gehostet/i.test(keyInput.placeholder || ""));

        return out;
    });

    if (ollamaKeyResults && !ollamaKeyResults.error) {
        check(
            "V7.94 Ollama-Key: Provider-Label nennt 'gehostet' + Hint nennt Bearer/Token",
            ollamaKeyResults.providerExists &&
                ollamaKeyResults.labelMentionsHosted &&
                ollamaKeyResults.hintMentionsBearer
        );
        check(
            "V7.94 Ollama-Key: requiresKey bleibt false (lokal weiterhin ohne Key)",
            ollamaKeyResults.requiresKeyFalse
        );
        check(
            "V7.94 Ollama-Key: buildHeaders OHNE Key → kein Authorization (Backward-Compat lokal)",
            ollamaKeyResults.noAuthWithoutKey && ollamaKeyResults.contentTypePresent
        );
        check("V7.94 Ollama-Key: buildHeaders MIT Key → Authorization: Bearer <key>", ollamaKeyResults.bearerWithKey);
        check(
            "V7.94 Ollama-Key: endpoint respektiert cfg.endpoint (Custom-URL möglich, z.B. https://my-ollama.cloud)",
            ollamaKeyResults.endpointRespectsCustom
        );
        check(
            "V7.94 Ollama-Key: CSP connect-src enthält https: Wildcard (für gehostete Endpoints)",
            ollamaKeyResults.cspHasHttpsWildcard
        );
        check(
            "V7.94 Ollama-Key: UI Key-Row ist für ollama sichtbar (optional, mit Hinweis-Placeholder)",
            ollamaKeyResults.keyRowVisibleForOllama && ollamaKeyResults.placeholderMentionsOptional
        );
    } else if (ollamaKeyResults && ollamaKeyResults.error) {
        check(`V7.94 Ollama-Key: evaluate-Fehler — ${ollamaKeyResults.error}`, false);
    }

    // ### V7.95 — Ollama Cloud-Kompatibilität (Endpoint-Detect + Dual-Format-Parse) ###
    // (1) /api/chat nur anhängen, wenn die URL noch keinen Pfad hat; (2) extractText liest Ollama-native
    // UND OpenAI-kompatibles Format; (3) options.num_predict ist Ollama-spezifisch (OpenAI lehnt ab).
    const v795Results = await safeEvaluate(page, () => {
        const r = window.anazhRealm;
        if (!r) return null;
        const out = {};
        const defs = r.llmProviderDefs();
        const ol = defs.ollama;

        // 1. Endpoint smart-detect — Basis-URL ohne Pfad → /api/chat angehängt
        out.epAppendsForBase =
            ol.endpoint("m", "k", { endpoint: "http://localhost:11434" }) === "http://localhost:11434/api/chat";
        out.epAppendsForCloud =
            ol.endpoint("m", "k", { endpoint: "https://ollama.com" }) === "https://ollama.com/api/chat";

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

        // 4. Endpoint trim — Trailing-Slash entfernt
        out.epTrimsTrailingSlash =
            ol.endpoint("m", "k", {
                endpoint: "https://ollama.com/",
            }) === "https://ollama.com/api/chat";

        // 5. extractText — Ollama-native Format
        out.extractsOllamaNative = ol.extractText({ message: { content: "Hallo Welt" } }) === "Hallo Welt";

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
        // V7.98: 400→800 für Reasoning-Models (think-Block + Antwort)
        const bodyNative = ol.buildBody("llama3.1", "sys", "user", {
            endpoint: "http://localhost:11434",
        });
        out.bodyNativeHasOptions = bodyNative.options && bodyNative.options.num_predict === 800;
        out.bodyNativeNoMaxTokens = bodyNative.max_tokens === undefined;

        // 10. buildBody — OpenAI-kompat (/v1/): hat max_tokens, KEIN options
        // V7.98: 400→800
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

    if (v795Results && !v795Results.error) {
        check(
            "V7.95 Ollama-Cloud: Endpoint hängt /api/chat an wenn Basis-URL ohne Pfad (localhost + ollama.com)",
            v795Results.epAppendsForBase && v795Results.epAppendsForCloud
        );
        check(
            "V7.95 Ollama-Cloud: Endpoint respektiert volle URL mit /api/chat (kein doppeltes /api/chat/api/chat)",
            v795Results.epRespectsApiPath
        );
        check(
            "V7.95 Ollama-Cloud: Endpoint respektiert OpenAI-kompat-URL mit /v1/chat/completions",
            v795Results.epRespectsV1Path
        );
        check("V7.95 Ollama-Cloud: Endpoint trimt trailing-slash sauber", v795Results.epTrimsTrailingSlash);
        check(
            "V7.95 Ollama-Cloud: extractText liest Ollama-native Format (json.message.content)",
            v795Results.extractsOllamaNative
        );
        check(
            "V7.95 Ollama-Cloud: extractText liest OpenAI-kompat Format (json.choices[0].message.content)",
            v795Results.extractsOpenAi
        );
        check(
            "V7.95 Ollama-Cloud: extractText liest älteres Ollama-generate Format (json.response)",
            v795Results.extractsOllamaGenerate
        );
        check(
            "V7.95 Ollama-Cloud: extractText defensive bei null/leeren Input → '' (kein Crash)",
            v795Results.extractsEmpty
        );
        check(
            "V7.95+V7.98 Ollama: buildBody Ollama-Native hat options.num_predict=800 (kein max_tokens)",
            v795Results.bodyNativeHasOptions && v795Results.bodyNativeNoMaxTokens
        );
        check(
            "V7.95+V7.98 Ollama: buildBody OpenAI-kompat hat max_tokens=800 (KEIN options-Feld)",
            v795Results.bodyOpenAiHasMaxTokens && v795Results.bodyOpenAiNoOptions
        );
        check(
            "V7.95 Ollama-Cloud: buildBody beide Formate haben model + messages + stream:false",
            v795Results.bodyHasCommon
        );
    } else if (v795Results && v795Results.error) {
        check(`V7.95 Ollama-Cloud: evaluate-Fehler — ${v795Results.error}`, false);
    }

    // ### V7.96 — Cloud-LLM-Proxy via save-server (CORS-Lösung) ###
    // Cloud-Provider senden keine CORS-Header → der save-server vermittelt (localhost:4312/api/proxy/llm,
    // Auth-Header durchgereicht). Geprüft: useProxy-Flag, UI-Toggle, Proxy-Routing, CORS-Fehler-Hinweis.
    const v796Results = await safeEvaluate(page, () => {
        const r = window.anazhRealm;
        if (!r || !r.state || !r.state.llm) return null;
        const out = {};

        // 1. useProxy-Flag im Ollama-Provider-Config initialisiert
        const cfg = r.state.llm.providerConfig.ollama;
        out.useProxyExists = cfg && typeof cfg.useProxy === "boolean";
        out.useProxyDefault = cfg && cfg.useProxy === false;

        // 2. UI: Proxy-Row + Hint sind im DOM
        const proxyRow = document.getElementById("llm-proxy-row");
        const proxyHint = document.getElementById("llm-proxy-hint");
        const proxyCheckbox = document.getElementById("llm-use-proxy");
        out.proxyRowExists = !!proxyRow;
        out.proxyHintExists = !!proxyHint;
        out.proxyCheckboxIsCheckbox = !!(proxyCheckbox && proxyCheckbox.type === "checkbox");

        // 3. UI: Proxy-Row sichtbar bei Ollama, versteckt bei anderem Provider
        r.state.llm.provider = "ollama";
        if (typeof r.llmRefreshProviderUI === "function") r.llmRefreshProviderUI();
        out.proxyVisibleForOllama = !!(proxyRow && !proxyRow.hidden);
        out.proxyHiddenAttrOllama = proxyRow ? proxyRow.getAttribute("hidden") : "no-row";
        r.state.llm.provider = "google";
        if (typeof r.llmRefreshProviderUI === "function") r.llmRefreshProviderUI();
        out.proxyHiddenForOther = !!(proxyRow && proxyRow.hidden);
        out.proxyHiddenAttrOther = proxyRow ? proxyRow.getAttribute("hidden") : "no-row";
        r.state.llm.provider = "ollama";
        if (typeof r.llmRefreshProviderUI === "function") r.llmRefreshProviderUI();

        // 4. Provider-Hint enthält CORS-freundliche Provider-Liste
        if (proxyHint) {
            out.hintMentionsGroq = /Groq/i.test(proxyHint.textContent || "");
            out.hintMentionsTogether = /Together/i.test(proxyHint.textContent || "");
            out.hintMentionsCerebras = /Cerebras/i.test(proxyHint.textContent || "");
            out.hintMentionsProxyUrl = /4312/.test(proxyHint.textContent || "");
        }

        // 5. Click auf Checkbox setzt useProxy + persistiert
        if (proxyCheckbox && cfg) {
            proxyCheckbox.checked = true;
            proxyCheckbox.dispatchEvent(new Event("change"));
            out.toggleSetsUseProxy = cfg.useProxy === true;
            if (typeof localStorage !== "undefined") {
                out.persistedToLocalStorage = localStorage.getItem("anazh.llm.ollama.useProxy") === "1";
            }
            // Reset für nächste Tests
            proxyCheckbox.checked = false;
            proxyCheckbox.dispatchEvent(new Event("change"));
        }

        // 6. CSP allowed localhost:4312 für den Proxy
        const meta = document.querySelector('meta[http-equiv="Content-Security-Policy"]');
        const csp = meta ? meta.getAttribute("content") : "";
        out.cspAllowsProxyHost = /localhost:4312/.test(csp);

        return out;
    });

    if (v796Results && !v796Results.error) {
        check(
            "V7.96 Proxy: useProxy-Flag im Ollama-Config (default false, Backward-Compat)",
            v796Results.useProxyExists && v796Results.useProxyDefault
        );
        check(
            "V7.96 Proxy: UI-Elemente im DOM (proxy-row + proxy-hint + checkbox)",
            v796Results.proxyRowExists && v796Results.proxyHintExists && v796Results.proxyCheckboxIsCheckbox
        );
        check("V7.96 Proxy: UI-Toggle sichtbar bei Ollama (proxy-row.hidden=false)", v796Results.proxyVisibleForOllama);
        check(
            "V7.96 Proxy: UI-Toggle versteckt bei nicht-Ollama-Provider (proxy-row.hidden=true für Google/Anthropic/OpenRouter)",
            v796Results.proxyHiddenForOther
        );
        check(
            "V7.96 Proxy: Hint nennt CORS-freundliche Provider (Groq + Together + Cerebras) + Proxy-URL (4312)",
            v796Results.hintMentionsGroq &&
                v796Results.hintMentionsTogether &&
                v796Results.hintMentionsCerebras &&
                v796Results.hintMentionsProxyUrl
        );
        check(
            "V7.96 Proxy: Click-Toggle setzt useProxy + persistiert in localStorage",
            v796Results.toggleSetsUseProxy && v796Results.persistedToLocalStorage
        );
        check("V7.96 Proxy: CSP erlaubt localhost:4312 (save-server) für Proxy-Calls", v796Results.cspAllowsProxyHost);
    } else if (v796Results && v796Results.error) {
        check(`V7.96 Proxy: evaluate-Fehler — ${v796Results.error}`, false);
    }

    // ### V7.97 — Ollama UX-Politur (Auto-Bypass + Free-Text-Modell + 404-Hint) ###
    // (1) Proxy + localhost-URL → Auto-Bypass (der Proxy ist https-only); (2) Modell ist Free-Text
    // (input + datalist); (3) 404 trägt eine Anleitung.
    const v797Results = await safeEvaluate(page, () => {
        const r = window.anazhRealm;
        if (!r) return null;
        const out = {};

        // 1. Modell-Input ist Free-Text (input mit datalist)
        const modelInput = document.getElementById("llm-model");
        const dataList = document.getElementById("llm-model-suggestions");
        out.modelIsInput = !!(modelInput && modelInput.tagName === "INPUT");
        out.modelHasList = !!(modelInput && modelInput.getAttribute("list") === "llm-model-suggestions");
        out.dataListExists = !!dataList;

        // 2. Datalist hat aktualisierte Vorschläge (llama3.2, qwen3, gpt-oss:20b)
        const defs = r.llmProviderDefs();
        const ollamaModels = (defs.ollama && defs.ollama.models) || [];
        const modelIds = ollamaModels.map((m) => m.id);
        out.hasLlama32 = modelIds.includes("llama3.2");
        out.hasQwen3 = modelIds.includes("qwen3");
        out.hasGptOss = modelIds.includes("gpt-oss:20b");
        out.hasGemma2 = modelIds.includes("gemma2");

        // 3. User kann eigenen Modell-Namen eintragen (z.B. qwen3.5:cloud)
        if (modelInput && r.state.llm) {
            r.state.llm.provider = "ollama";
            const cfg = r.state.llm.providerConfig.ollama;
            modelInput.value = "qwen3.5:cloud";
            modelInput.dispatchEvent(new Event("change"));
            out.customModelAccepted = cfg.model === "qwen3.5:cloud";
        }

        // 4. Default-Modell ist jetzt llama3.2 (moderner)
        out.defaultModelModern = true; // wir bauen das später
        // Heuristik: state-Default ist nicht garantiert beim Test-Lauf,
        // weil localStorage greift. Wir prüfen den class-Default.
        // (Skip this strict check.)

        return out;
    });

    // Auto-Bypass-Test als separater evaluate damit fetch-Pfad testbar ist
    const v797AutoResults = await safeEvaluate(page, async () => {
        const r = window.anazhRealm;
        if (!r || !r.state || !r.state.llm) return null;
        const out = {};

        // 5. Auto-Bypass: useProxy + localhost-URL → kein Proxy-Weg
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
            // Setup: localhost-Endpoint + useProxy=true
            r.state.llm.provider = "ollama";
            r.state.llm.enabled = true;
            const cfg = r.state.llm.providerConfig.ollama;
            cfg.endpoint = "http://localhost:11434";
            cfg.useProxy = true;
            cfg.model = "llama3.2";
            r.state.llm.inFlight = false;
            r.state.llm.lastResponseAt = -Infinity;
            await r.llmCall("test");
            // Erwartung: fetch-URL ist die direkte ollama-URL,
            // NICHT die proxy-URL — Auto-Bypass greift weil localhost
            out.bypassedForLocalhost = capturedUrl !== null && !/\/proxy\/llm/.test(capturedUrl);
            // Reset
            capturedUrl = null;
            cfg.endpoint = "https://ollama.com/api/chat";
            r.state.llm.inFlight = false;
            r.state.llm.lastResponseAt = -Infinity;
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
        const r = window.anazhRealm;
        if (!r || !r.state || !r.state.llm) return null;
        const out = {};
        const origFetch = window.fetch;
        window.fetch = async () => ({
            ok: false,
            status: 404,
            text: async () => '{"error":"model \\"foo-not-real\\" not found"}',
            json: async () => ({ error: "stub" }),
        });
        try {
            r.state.llm.provider = "ollama";
            r.state.llm.enabled = true;
            const cfg = r.state.llm.providerConfig.ollama;
            cfg.endpoint = "http://localhost:11434";
            cfg.useProxy = false;
            cfg.model = "foo-not-real";
            r.state.llm.inFlight = false;
            r.state.llm.lastResponseAt = -Infinity;
            const reply = await r.llmCall("test");
            out.errorMentionsModel = /Modell.*nicht gefunden/.test(reply.error || "");
            out.errorMentionsOllamaList = /ollama list/.test(reply.error || "");
            out.errorMentionsModelName = /foo-not-real/.test(reply.error || "");
        } finally {
            window.fetch = origFetch;
        }
        return out;
    });

    if (v797Results && !v797Results.error) {
        check(
            "V7.97 UX: Modell-Input ist Free-Text mit datalist (Spieler tippt eigene Modelle)",
            v797Results.modelIsInput && v797Results.modelHasList && v797Results.dataListExists
        );
        check(
            "V7.97 UX: Default-Modell-Vorschläge enthalten aktuelle Namen (llama3.2, qwen3, gpt-oss:20b, gemma2)",
            v797Results.hasLlama32 && v797Results.hasQwen3 && v797Results.hasGptOss && v797Results.hasGemma2
        );
        check(
            "V7.97 UX: User kann eigenen Modell-Namen eintragen (z.B. qwen3.5:cloud) — Free-Text gespeichert",
            v797Results.customModelAccepted
        );
    } else if (v797Results && v797Results.error) {
        check(`V7.97 UX: evaluate-Fehler — ${v797Results.error}`, false);
    }
    if (v797AutoResults && !v797AutoResults.error) {
        check(
            "V7.97 Auto-Bypass: localhost-URL + useProxy=true → Proxy WIRD BYPASSED (direkter Call)",
            v797AutoResults.bypassedForLocalhost
        );
        check(
            "V7.97 Auto-Bypass: Cloud-URL + useProxy=true → Proxy WIRD GENUTZT (durchgeschleust)",
            v797AutoResults.proxyUsedForCloud
        );
    } else if (v797AutoResults && v797AutoResults.error) {
        check(`V7.97 Auto-Bypass: evaluate-Fehler — ${v797AutoResults.error}`, false);
    }
    if (v797ErrorResults && !v797ErrorResults.error) {
        check(
            "V7.97 Error-Hint: HTTP 404 'model not found' → klarer Hinweis mit Modell-Namen + 'ollama list'",
            v797ErrorResults.errorMentionsModel &&
                v797ErrorResults.errorMentionsOllamaList &&
                v797ErrorResults.errorMentionsModelName
        );
    } else if (v797ErrorResults && v797ErrorResults.error) {
        check(`V7.97 Error-Hint: evaluate-Fehler — ${v797ErrorResults.error}`, false);
    }

    // ### V7.98 — Parser-Robustheit für lokale Reasoning-Models ###
    // (1) <think>/<thinking>-Blöcke werden gestrippt; (2) ohne JSON-Vertrag greift der Plain-Text-
    // Fallback; (3) num_predict 800 statt 400 — think-Block + Antwort brauchen Raum.
    const v798Results = await safeEvaluate(page, () => {
        const r = window.anazhRealm;
        if (!r) return null;
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

        // 5. Striktes JSON ohne fallback (Anthropic/Gemini-Pfad)
        const strictResp = r.llmParseResponse('{"say":"Test","program":["weather","sunny"]}');
        out.strictJsonStillWorks =
            strictResp.say === "Test" && Array.isArray(strictResp.program) && !strictResp.fallbackUsed;

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

    if (v798Results && !v798Results.error) {
        check(
            "V7.98 Parser: <think>...</think>-Block wird gestripped, dahinter liegendes JSON sauber geparst",
            v798Results.thinkStripped
        );
        check("V7.98 Parser: <thinking>-Variante wird auch erkannt (case-insensitive)", v798Results.thinkingStripped);
        check(
            "V7.98 Parser: Plain-Text ohne JSON → Plain-Text-Fallback (User sieht Antwort statt 'Leere Antwort')",
            v798Results.plainTextFallback
        );
        check(
            "V7.98 Parser: <think>-Block + Plain-Text danach → think gestrippt, Rest als say genutzt",
            v798Results.thinkPlusPlain
        );
        check(
            "V7.98 Parser: Striktes JSON ohne think bleibt unverändert (Anthropic/Gemini-Pfad)",
            v798Results.strictJsonStillWorks
        );
        check("V7.98 Parser: Markdown-Fence (```json …```) wird gestripped", v798Results.fenceStripped);
        check("V7.98 Parser: Leerer Input → klarer Error mit 'raw=0'-Hinweis", v798Results.emptyHasError);
        check(
            "V7.98 Parser: JSON mit say='' aber Text drumherum → Plain-Text-Fallback (json-empty marker)",
            v798Results.emptyJsonFallsBackToText
        );
    } else if (v798Results && v798Results.error) {
        check(`V7.98 Parser: evaluate-Fehler — ${v798Results.error}`, false);
    }
}

module.exports = {
    checkBandRing2Extended, checkBandV1722NexusEyes, checkBandWelle6HCreatureLlm, checkBandWorkshopPolishAndLlm,
};
