"use strict";
// scripts/playtest/kreatur-verhalten.cjs — der Richter von Kreatur/verhalten (spec/stamm/modul-karte.json): Aufgaben · Scheu · Jagd · Rudel · Kreatur-Takt.
// 5 Band/Bänder in Lauf-Reihenfolge, je Band das Modul, dessen Glieder er am meisten ruft; gestellt von
// `node scripts/stamm-umzug.cjs --richter` — ein neuer Band steht hier und in der Reihe des Läufers scripts/playtest.cjs.

const { safeEvaluate } = require("../playtest.cjs");

async function checkBandWelle6HCreatures({ page, check, errors, finalState }) {
    void errors;
    void finalState;
    // ### Kreaturen-Aufträge (follow_player / wait / wander) ###
    // Default-Task „wander“ hält das Emotion-Verhalten (Aura stumm); follow_player + wait tragen ein
    // Aura-Sprite (grün/bernstein). Multi-User: Tasks stehen in NON_BROADCASTABLE_OPS.
    const wave6hResults = await safeEvaluate(page, () => {
        if (!r || !st || !st.creatures || st.creatures.length < 3) return null;
        const out = {};
        // Statische Konstanten
        out.hasTasks =
            Array.isArray(AnazhRealm.CREATURE_TASKS) &&
            AnazhRealm.CREATURE_TASKS.length >= 3 &&
            AnazhRealm.CREATURE_TASKS.includes("wander") &&
            AnazhRealm.CREATURE_TASKS.includes("follow_player") &&
            AnazhRealm.CREATURE_TASKS.includes("wait");
        out.hasAuraHueMap =
            AnazhRealm.CREATURE_TASK_AURA_HUE && AnazhRealm.CREATURE_TASK_AURA_HUE.wander === null;

        // Default-Task für initial-gespawnte Kreaturen ist wander
        const c0 = st.creatures[0];
        out.initialTaskWander = r._getCreatureTask(c0).name === "wander";
        out.initialNoAura = !c0.userData.taskAura;

        // assignCreatureTask wechselt + erzeugt Aura für non-wander
        r.assignCreatureTask(c0, "follow_player");
        out.assignFollowOk = r._getCreatureTask(c0).name === "follow_player";
        out.followCreatesAura = !!c0.userData.taskAura;

        // Aura-Hue für follow_player ist grünlich (g > r, g > b)
        const followColor = c0.userData.taskAura.material.color;
        out.followAuraGreenish = followColor.g > followColor.r && followColor.g > followColor.b;

        r.assignCreatureTask(c0, "wait");
        out.waitChangesAuraColor = c0.userData.taskAura.material.color.r > c0.userData.taskAura.material.color.b;

        r.assignCreatureTask(c0, "wander");
        out.wanderRemovesAura = !c0.userData.taskAura;

        // Unknown Task wird abgelehnt
        out.unknownRejected = r.assignCreatureTask(c0, "fictional") === false;

        // tickCreatureTaskDirection
        const c1 = st.creatures[1];
        r.assignCreatureTask(c1, "wait");
        const waitDir = r._tickCreatureTaskDirection(c1, r._getCreatureTask(c1), "happy");
        out.waitGivesZeroDir = waitDir && waitDir.x === 0 && waitDir.z === 0;

        // (das Folgen misst gate:kreatur-takt folgen)
        const p = st.playerMesh.position;
        // wander → null (Caller fällt auf Emotion-Logik)
        r.assignCreatureTask(c1, "wander");
        const wDir = r._tickCreatureTaskDirection(c1, r._getCreatureTask(c1), "happy");
        out.wanderReturnsNull = wDir === null;

        // distance-Arg-Validierung (clamp)
        r.assignCreatureTask(c1, "follow_player", { distance: 1.5 });
        out.distanceArgKept = r._getCreatureTask(c1).args.distance === 1.5;

        // findNearestCreature
        for (let i = 0; i < st.creatures.length; i++) {
            st.creatures[i].position.set(p.x + 100 + i * 5, p.y, p.z + 100 + i * 5);
        }
        st.creatures[2].position.set(p.x + 2, p.y, p.z + 2);
        const nearest = r.findNearestCreature(p);
        out.nearestIsCorrect = nearest === st.creatures[2];

        // assignTaskToNearestCreature
        r.assignCreatureTask(st.creatures[2], "wander");
        const target = r.assignTaskToNearestCreature(p, "follow_player");
        out.assignNearestWorks = target === st.creatures[2] && r._getCreatureTask(target).name === "follow_player";

        // assignTaskToAllCreatures
        const count = r.assignTaskToAllCreatures("wait");
        out.assignAllWorks =
            count === st.creatures.length && st.creatures.every((c) => r._getCreatureTask(c).name === "wait");
        r.assignTaskToAllCreatures("wander");

        // DSL-Ops
        r.dslRun(["creature_task_all", "wander"], { source: "test" });
        out.dslAllWorks = st.creatures.every((c) => r._getCreatureTask(c).name === "wander");

        // NON_BROADCASTABLE_OPS Mitgliedschaft
        const nbs = AnazhRealm.NON_BROADCASTABLE_OPS;
        out.nbCreatureTask = nbs.has("creature_task");
        out.nbCreatureTaskNearest = nbs.has("creature_task_nearest");
        out.nbCreatureTaskAll = nbs.has("creature_task_all");

        // Chat-Patterns
        const warte = r.parseChatToDsl("warte");
        out.chatWarte = warte && warte.program[0] === "creature_task_nearest" && warte.program[1] === "wait";
        const erkunde = r.parseChatToDsl("erkunde");
        out.chatErkunde = erkunde && erkunde.program[0] === "creature_task_nearest" && erkunde.program[1] === "wander";
        const kommHer = r.parseChatToDsl("komm her");
        out.chatKommHer =
            kommHer &&
            kommHer.program[0] === "creature_task_nearest" &&
            kommHer.program[1] === "follow_player" &&
            kommHer.program[2] === 1.5;
        const alle = r.parseChatToDsl("alle folgt mir");
        out.chatAlleFolgt = alle && alle.program[0] === "creature_task_all" && alle.program[1] === "follow_player";
        const alleWarten = r.parseChatToDsl("alle warten");
        out.chatAlleWarten =
            alleWarten && alleWarten.program[0] === "creature_task_all" && alleWarten.program[1] === "wait";

        // describeProgram-Einträge
        const desc1 = r.describeProgram(["creature_task_nearest", "follow_player"]);
        out.descNearest = typeof desc1 === "string" && /folge|nächste|Auftrag/i.test(desc1);
        const desc2 = r.describeProgram(["creature_task_all", "wait"]);
        out.descAll = typeof desc2 === "string" && /alle/i.test(desc2);

        // removeCreature räumt Aura mit
        const cToRemove = st.creatures[st.creatures.length - 1];
        r.assignCreatureTask(cToRemove, "wait");
        const auraToCheck = cToRemove.userData.taskAura;
        out.preRemoveAuraInScene = st.scene.children.includes(auraToCheck);
        r.removeCreature(cToRemove);
        st.creatures.pop(); // sync state mit removeCreature-Pfad
        out.postRemoveAuraGone = !st.scene.children.includes(auraToCheck);

        return out;
    });

    if (wave6hResults && !wave6hResults.error) {
        check("CREATURE_TASKS frozen mit ≥3 Aufträgen", wave6hResults.hasTasks);
        check("CREATURE_TASK_AURA_HUE map (wander=null)", wave6hResults.hasAuraHueMap);
        check(
            "Default-Task initial-gespawnter Kreaturen ist wander",
            wave6hResults.initialTaskWander
        );
        check("Default-Task wander hat KEINE Aura", wave6hResults.initialNoAura);
        check(
            "assignCreatureTask(follow_player) setzt Task + erzeugt Aura",
            wave6hResults.assignFollowOk && wave6hResults.followCreatesAura
        );
        check("Aura für follow_player ist grünlich", wave6hResults.followAuraGreenish);
        check("Wechsel auf wait ändert Aura-Farbe", wave6hResults.waitChangesAuraColor);
        check(
            "Rückkehr zu wander entfernt Aura (Lifecycle-Sauberkeit)",
            wave6hResults.wanderRemovesAura
        );
        check("assignCreatureTask lehnt unbekannten Task ab", wave6hResults.unknownRejected);
        check("wait-Task liefert direction (0,0,0)", wave6hResults.waitGivesZeroDir);
        check(
            "wander-Direction liefert null (Fallback auf Emotion-Logik)",
            wave6hResults.wanderReturnsNull
        );
        check("distance-Arg landet in task.args", wave6hResults.distanceArgKept);
        check("findNearestCreature wählt die nahste", wave6hResults.nearestIsCorrect);
        check("assignTaskToNearestCreature wirkt auf nahste", wave6hResults.assignNearestWorks);
        check("assignTaskToAllCreatures wirkt auf alle", wave6hResults.assignAllWorks);
        check("DSL creature_task_all setzt alle", wave6hResults.dslAllWorks);
        check(
            "creature_task* in NON_BROADCASTABLE_OPS (Multi-User-Safety)",
            wave6hResults.nbCreatureTask && wave6hResults.nbCreatureTaskNearest && wave6hResults.nbCreatureTaskAll
        );
        check("Chat 'warte' → creature_task_nearest wait", wave6hResults.chatWarte);
        check("Chat 'erkunde' → creature_task_nearest wander", wave6hResults.chatErkunde);
        check("Chat 'komm her' → follow_player mit distance=1.5", wave6hResults.chatKommHer);
        check(
            "Chat 'alle folgt mir' → creature_task_all follow_player",
            wave6hResults.chatAlleFolgt
        );
        check("Chat 'alle warten' → creature_task_all wait", wave6hResults.chatAlleWarten);
        check("describeProgram für nearest enthält 'folge'/'nächste'", wave6hResults.descNearest);
        check("describeProgram für all enthält 'alle'", wave6hResults.descAll);
        check(
            "removeCreature räumt Aura aus Scene (kein Memory-Leak)",
            wave6hResults.preRemoveAuraInScene && wave6hResults.postRemoveAuraGone
        );
    }

    // ### Kreaturen-Aufträge: Vision-/UX-/Performance-Schließungen ###
    // Audio-Antwort bei Task-Wechsel, Journal-Eintrag bei Geste, Leerschlag-Feedback, Status-Bar-
    // Zähler, Texture-Cache, describeProgram-Distanz.
    const wave6hV2Results = await safeEvaluate(page, () => {
        if (!r || !st || !st.creatures || st.creatures.length < 3) return null;
        const out = {};

        // === Audio-Antwort bei Task-Wechsel (Vision §1.2) — Welle 5 Klang: die Antwort ist die STIMME des Tiers
        // (`_tierRuf`, klang:UMWELT.tier); jeder Ruf zählt in state.symphony.tierRufe (auch ohne Audiogerät messbar).
        r.initSymphony();
        const sym = st.symphony;
        const symReady = sym && sym.enabled && sym.ctx;
        out.symphonyReady = !!symReady;

        if (symReady) {
            const c = st.creatures[0];
            const rufe = () => sym.tierRufe || 0;
            // Wechsel wander → follow_player → das Tier ruft (genau einmal)
            r.assignCreatureTask(c, "wander", {}, { silent: true });
            let n0 = rufe();
            r.assignCreatureTask(c, "follow_player");
            out.followPings = rufe() - n0 === 1;
            n0 = rufe();
            r.assignCreatureTask(c, "wait");
            out.waitPings = rufe() - n0 === 1;
            // Wechsel zu wander → KEIN Ruf (Lösen der Bindung ist still)
            n0 = rufe();
            r.assignCreatureTask(c, "wander");
            out.wanderIsSilent = rufe() === n0;
        }

        // === Journal-Eintrag bei Beziehungs-Geste (Vision §1.1) ===
        const c1 = st.creatures[1];
        r.assignCreatureTask(c1, "wander", {}, { silent: true });
        const jBefore = (st.worldJournal && st.worldJournal.entries.length) || 0;
        r.assignCreatureTask(c1, "follow_player");
        const jAfter = (st.worldJournal && st.worldJournal.entries.length) || 0;
        out.journalGrows = jAfter > jBefore;
        // Eintrag trägt type=relationship
        const lastEntry = st.worldJournal && st.worldJournal.entries[st.worldJournal.entries.length - 1];
        out.journalTypeIsRelationship = lastEntry && lastEntry.type === "relationship";

        // === silent-Option unterdrückt Audio + Journal ===
        const c2 = st.creatures[2];
        r.assignCreatureTask(c2, "wander", {}, { silent: true });
        const jPre = (st.worldJournal && st.worldJournal.entries.length) || 0;
        const rufPre = (sym && sym.tierRufe) || 0;
        r.assignCreatureTask(c2, "wait", {}, { silent: true });
        const jPost = (st.worldJournal && st.worldJournal.entries.length) || 0;
        out.silentSuppressesJournal = jPost === jPre && ((sym && sym.tierRufe) || 0) === rufPre;

        // === Leerschlag-Feedback (UX + Vision §1.1) ===
        // Alle Kreaturen weit weg, dann Auftrag mit maxDist=60
        const pPos = st.playerMesh ? st.playerMesh.position : { x: 0, y: 0, z: 0 };
        for (const c of st.creatures) c.position.set(pPos.x + 500, pPos.y, pPos.z + 500);
        const chatOutput = document.getElementById("chat-output");
        const chatBefore = chatOutput ? chatOutput.children.length : 0;
        const journalBefore = (st.worldJournal && st.worldJournal.entries.length) || 0;
        const result = r.assignTaskToNearestCreature(pPos, "follow_player", {}, 60);
        const chatAfter = chatOutput ? chatOutput.children.length : 0;
        const journalAfter = (st.worldJournal && st.worldJournal.entries.length) || 0;
        const lastLine = chatOutput && chatOutput.lastChild ? chatOutput.lastChild.textContent : "";
        out.leerschlagReturnsNull = result === null;
        out.leerschlagWritesChat = chatAfter > chatBefore && /Keine Kreatur/.test(lastLine);
        out.leerschlagWritesJournal = journalAfter > journalBefore;
        out.leerschlagJournalTypeReach =
            st.worldJournal.entries[st.worldJournal.entries.length - 1].type === "reach";

        // === Texture-Cache (Performance) ===
        const firstTexture = r._getCreatureTaskAuraTexture();
        const secondTexture = r._getCreatureTaskAuraTexture();
        out.textureCacheReusesInstance = firstTexture === secondTexture;
        // 10 Task-Wechsel sollten dieselbe Map nutzen
        const c3 = st.creatures[0];
        c3.position.set(pPos.x + 1, pPos.y, pPos.z + 1); // wieder nah
        const uniqueMaps = new Set();
        for (let i = 0; i < 10; i++) {
            r.assignCreatureTask(c3, "follow_player", {}, { silent: true });
            if (c3.userData.taskAura && c3.userData.taskAura.material.map) {
                uniqueMaps.add(c3.userData.taskAura.material.map);
            }
            r.assignCreatureTask(c3, "wander", {}, { silent: true });
        }
        out.textureSharedAcross10Cycles = uniqueMaps.size === 1;

        // === Status-Bar Task-Zähler (UX) ===
        out.statusTasksInDom = !!document.getElementById("status-tasks");
        r.assignTaskToAllCreatures("wander");
        r.assignCreatureTask(st.creatures[0], "follow_player", {}, { silent: true });
        r.assignCreatureTask(st.creatures[1], "follow_player", {}, { silent: true });
        r.assignCreatureTask(st.creatures[2], "wait", {}, { silent: true });
        r._renderTaskStatusUI();
        const taskEl = document.getElementById("status-tasks");
        const taskText = taskEl ? taskEl.textContent : "";
        out.statusShowsCounts = /2 folgen/.test(taskText) && /1 warten/.test(taskText);
        // Alle wander → "—"
        r.assignTaskToAllCreatures("wander");
        r._renderTaskStatusUI();
        const taskText2 = taskEl ? taskEl.textContent : "";
        out.statusEmptyDash = taskText2 === "—";

        // === describeProgram zeigt Distanz ===
        const descWithDist = r.describeProgram(["creature_task_nearest", "follow_player", 1.5]);
        const descWithoutDist = r.describeProgram(["creature_task_nearest", "follow_player"]);
        out.descShowsDistance = /1\.5m|Distanz/i.test(descWithDist);
        out.descNoDistanceWhenNotGiven = !/1\.5/.test(descWithoutDist);

        return out;
    });

    if (wave6hV2Results && !wave6hV2Results.error) {
        check("Welle 6.H V2: Symphony initialisierbar im Headless", wave6hV2Results.symphonyReady);
        if (wave6hV2Results.symphonyReady) {
            check(
                "Wechsel zu follow_player — das Tier antwortet mit seiner Stimme (genau ein Ruf)",
                wave6hV2Results.followPings
            );
            check(
                "Wechsel zu wait — das Tier antwortet mit seiner Stimme (genau ein Ruf)",
                wave6hV2Results.waitPings
            );
            check(
                "Wechsel zu wander bleibt STUMM (Disziplin: Lösen tönt nicht)",
                wave6hV2Results.wanderIsSilent
            );
        }
        check("Task-Wechsel schreibt ins Welt-Journal (Vision §1.1)", wave6hV2Results.journalGrows);
        check("Journal-Eintrag trägt type='relationship'", wave6hV2Results.journalTypeIsRelationship);
        check(
            "silent-Option unterdrückt Audio + Journal (Spawn-Defaults bleiben still)",
            wave6hV2Results.silentSuppressesJournal
        );
        check(
            "Leerschlag-Geste schreibt Chat-Output 'Keine Kreatur in der Nähe'",
            wave6hV2Results.leerschlagWritesChat
        );
        check(
            "Leerschlag-Geste schreibt 'reach'-Journal-Eintrag",
            wave6hV2Results.leerschlagWritesJournal && wave6hV2Results.leerschlagJournalTypeReach
        );
        check("assignTaskToNearest returnt null bei Leerschlag", wave6hV2Results.leerschlagReturnsNull);
        check(
            "die Aura-Textur ist gecacht (dieselbe Instanz)",
            wave6hV2Results.textureCacheReusesInstance
        );
        check(
            "10 Task-Wechsel teilen sich EINE Textur (kein Memory-Churn)",
            wave6hV2Results.textureSharedAcross10Cycles
        );
        check("#status-tasks-Item im DOM", wave6hV2Results.statusTasksInDom);
        check("Status-Bar zeigt '2 folgen · 1 warten' nach Setup", wave6hV2Results.statusShowsCounts);
        check("Status-Bar zeigt '—' wenn alle wander", wave6hV2Results.statusEmptyDash);
        check("describeProgram zeigt Distanz wenn gesetzt", wave6hV2Results.descShowsDistance);
        check(
            "describeProgram zeigt keine Distanz wenn nicht gesetzt",
            wave6hV2Results.descNoDistanceWhenNotGiven
        );
    }

    // ### Kreaturen als Hylomorphismus-Compounds ###
    // Multi-Mesh-Groups aus bodyParts × Material (dieselbe Sprache wie Spieler-Seele + Architektur);
    // drei Built-in-Seelen sprite/wesen/geist, Tag-Profil emergent.
    const wave6hP2aResults = await safeEvaluate(page, () => {
        const out = {};
        const souls = AnazhRealm.CREATURE_SOULS;
        out.soulsFrozen = !!souls && Object.isFrozen(souls);
        // ALTLASTEN-NULL: die Seelen-Menge sind die VIER ehrlichen
        // Tiere (Hirsch·Wolf·Fuchs·Bär) — sprite/geist/glutwesen sind gefallen.
        out.threeSouls =
            souls &&
            Object.keys(souls).length === 4 &&
            souls.wesen &&
            souls.wolf &&
            souls.fuchs &&
            souls.baer &&
            !souls.sprite &&
            !souls.geist &&
            !souls.glutwesen;
        out.hasSoulNames =
            Array.isArray(AnazhRealm.CREATURE_SOUL_NAMES) && AnazhRealm.CREATURE_SOUL_NAMES.length === 4;
        out.hasNamePool =
            Array.isArray(AnazhRealm.CREATURE_NAME_POOL) && AnazhRealm.CREATURE_NAME_POOL.length >= 20;
        const wesenPart = souls && souls.wesen && souls.wesen.bodyParts[0];
        out.bodyPartsHaveSchema =
            wesenPart && typeof wesenPart.shape === "string" && typeof wesenPart.material === "string";
        out.spriteAuraY = souls && souls.wolf && souls.wolf.auraY === 0.75;
        out.wesenAuraY = souls && souls.wesen && souls.wesen.auraY === 0.8;
        if (st.creatures.length > 0) {
            const c0 = st.creatures[0];
            out.initialIsGroup = c0 && c0.isGroup === true;
            out.initialHasSoul =
                typeof c0.userData.soul === "string" && AnazhRealm.CREATURE_SOUL_NAMES.includes(c0.userData.soul);
            out.initialHasName = typeof c0.userData.name === "string" && c0.userData.name.length > 0;
            out.initialHasTask = c0.userData.task && c0.userData.task.name === "wander";
            // KONVERGENZ III — die Gestalt ist der Studio-Baum in EINEM Wrap:
            // die Körper-Wahrheit zählt MESHES (traverse), nicht Top-Level-Kinder.
            let c0Meshes = 0;
            c0.traverse((n) => {
                if (n.isMesh) c0Meshes++;
            });
            out.initialHasChildren = c0Meshes >= 2;
        }
        r.clearCreatures();
        const p = st.playerMesh ? st.playerMesh.position : { x: 0, y: 5, z: 0 };
        const sprite = r.spawnCreatureAt(p.x + 1, p.y, p.z + 1, "happy", "wolf");
        const wesen = r.spawnCreatureAt(p.x + 2, p.y, p.z + 2, "happy", "wesen");
        const geist = r.spawnCreatureAt(p.x + 3, p.y, p.z + 3, "happy", "fuchs");
        const tagsWolf = r.computeCreatureCompoundTags(sprite);
        const tagsWesen = r.computeCreatureCompoundTags(wesen);
        // Die Tiere sind BEWUSST tag-identisch (V17.16-Spawn-Wand) — die
        // Diskrimination lebt in der GRÖSSEN-Achse (6.D-Band), nicht in Tags.
        out.spriteMoreMagie = Math.abs((tagsWolf.magieleitung || 0) - (tagsWesen.magieleitung || 0)) < 0.001;
        out.wesenMoreDichte = (tagsWesen.dichte || 0) > 0;
        out.spriteHasResoniert = (tagsWolf.resoniert || 0) > 0;
        out.wesenHasLebendig = (tagsWesen.lebendig || 0) > 0;
        out.geistHasLebendig = (r.computeCreatureCompoundTags(geist).lebendig || 0) > 0;
        // ein unbekannter Seelen-Wunsch ist eine laute Absage (null, geloggt), nie ein still gewürfelter
        // Ersatz (`spawnCreatureAt(…, "hirsch")` ergab einen Bären) — und der Schild einer Seele findet sie.
        const nVorAbsage = st.creatures.length;
        const fb = r.spawnCreatureAt(p.x + 4, p.y, p.z + 4, "happy", "fictional-soul");
        out.unknownSoulAbsage = fb === null && st.creatures.length === nVorAbsage;
        out.soulLabelFindet = r._pickCreatureSoulName(AnazhRealm.CREATURE_SOULS.wesen.label) === "wesen";
        out.spriteAuraOffset = Math.abs(r._creatureAuraOffsetY(sprite) - 0.75) < 0.01;
        out.wesenAuraOffset = Math.abs(r._creatureAuraOffsetY(wesen) - 0.8) < 0.01;
        out.spawnSpriteWorks = sprite && sprite.userData.soul === "wolf";
        out.spawnWesenWorks = wesen && wesen.userData.soul === "wesen";
        out.spawnGeistWorks = geist && geist.userData.soul === "fuchs";
        out.hasCreatureDrawerEl = !!document.querySelector('[data-drawer="kreaturen"]');
        const select = document.getElementById("creature-soul-select");
        out.hasSoulSelect = !!select && select.options.length === 5;
        out.hasCreatureList = !!document.getElementById("creature-list");
        out.spawn1Button = !!document.querySelector('[data-creature-spawn="1"]');
        out.spawn5Button = !!document.querySelector('[data-creature-spawn="5"]');
        r._renderCreatureListUI();
        const list = document.getElementById("creature-list");
        out.listRendersRows = list && list.querySelectorAll(".creature-row").length === st.creatures.length;
        // Hof-A — die Befehle leben INLINE am Wesen (.creature-action-btn[data-task]); die globale
        // „Aufträge"-Knopfreihe ist aufgelöst (Omnibox `k:` + inline tragen sie, kein Duplikat mehr).
        out.hasTaskActions = !!(list && list.querySelector(".creature-actions-inline"));
        out.hasFolgeInline = !!(list && list.querySelector('[data-task="follow_player"]'));
        out.hasWarteInline = !!(list && list.querySelector('[data-task="wait"]'));
        out.hasStreiftInline = !!(list && list.querySelector('[data-task="wander"]'));
        const firstRow = list && list.querySelector(".creature-row");
        out.rowHasNameSoulTask =
            firstRow &&
            firstRow.querySelector(".creature-name") &&
            firstRow.querySelector(".creature-soul") &&
            firstRow.querySelector(".creature-task");
        // Hof-D0 — der EINE Wesen-Lese-Vektor (_creatureProfile), den alle Hof-Leser teilen.
        // KONSUM: er bündelt GEMESSENE Vektoren (tags/stats/specs/task/emotion/wariness/bond/id) UND
        // der Renderer LIEST ihn (der rowTitle trägt jetzt die `moodLabel` aus dem Profil → echter Konsument).
        const prof = r._creatureProfile(sprite);
        out.profileBundlesVectors = !!(
            prof &&
            prof.id && // stabile Identität (netId/name), nicht der Array-Index (§G.6)
            typeof prof.tags === "object" &&
            prof.stats &&
            Number.isFinite(prof.stats.hpMax) &&
            Array.isArray(prof.specs) &&
            (prof.emotion === "happy" || prof.emotion === "sad") && // BINÄR, ehrlich geerdet (§G.2)
            Number.isFinite(prof.wariness) &&
            typeof prof.moodLabel === "string" &&
            prof.moodLabel.length > 0 &&
            typeof prof.section === "string"
        );
        // Der Renderer ist ein ECHTER Konsument: der rowTitle (title-Attr auf .creature-row-main) trägt die moodLabel.
        const firstMain = firstRow && firstRow.querySelector(".creature-row-main");
        const firstRowTitle = (firstMain && firstMain.getAttribute("title")) || "";
        out.rendererConsumesProfile = firstRowTitle.includes("Stimmung") && /froh|trübe/.test(firstRowTitle);
        // Hof-D — die Stimmung als Glyph an jeder Zeile (immer sichtbar).
        out.rowHasMoodGlyph = !!(firstRow && firstRow.querySelector(".creature-mood"));
        // Hof-Bühne — die Zeilen sind der schlanke PICKER: NIE eine Detail-Card inline (sie lebt auf der Bühne).
        out.detailNotInRows = !!(firstRow && !firstRow.querySelector(".creature-detail"));
        // die Spec-Card lebt als GETEILTES Werkstatt-Spec-Sheet (.spec-sheet) unter/neben der Bühne.
        const stageSpec = document.getElementById("hof-stage-spec");
        out.stageSpecPresent = !!stageSpec;
        out.stageShowsOneCard =
            !!stageSpec &&
            stageSpec.querySelectorAll(".spec-sheet").length === 1 &&
            stageSpec.querySelectorAll(".spec-body .spec-bar").length > 0;
        // Werkstatt-DNA: Header (Name) + zwei-Spalten-Body (Natur | Werte) + Footer (Verabschieden).
        out.stageHasTitle = !!(stageSpec && stageSpec.querySelector(".spec-header .spec-name"));
        out.stageHasBody2Col = !!(stageSpec && stageSpec.querySelectorAll(".spec-body .spec-col").length === 2);
        out.stageHasDismiss = !!(stageSpec && stageSpec.querySelector(".spec-footer .spec-dismiss"));
        // Fokus-Toggle: ein Klick auf ein Wesen fokussiert es (genau EINE Zeile .focused) → es tritt auf die Bühne.
        const firstProf = r._creatureProfile(st.creatures[0]);
        r._toggleHofFocus(firstProf.id);
        const listAfter = document.getElementById("creature-list");
        out.focusMarksOneRow =
            !!listAfter &&
            listAfter.querySelectorAll(".creature-row.focused").length === 1 &&
            st.hofFocusId === firstProf.id;
        out.focusUpdatesStage = !!stageSpec && stageSpec.querySelectorAll(".spec-sheet").length === 1;
        r._toggleHofFocus(firstProf.id); // wieder zu → Fokus zurück auf das erste Wesen (kein Leck)
        out.focusToggleClears = st.hofFocusId === null;
        // Hof-E — die zwei Zonen ORCHESTER | PARTITUR + der integrierte Spawn-Fuß.
        out.hasOrchesterZone = !!document.querySelector(".hof-orchester");
        out.hasPartiturZone = !!document.querySelector(".hof-partitur");
        out.partiturHoldsLaws = !!(
            document.querySelector(".hof-partitur #status-worldrules") &&
            document.querySelector(".hof-partitur #status-abilities")
        );
        out.spawnFootInOrchester = !!document.querySelector(".hof-orchester .hof-spawn #creature-soul-select");
        // Hof-F — die Sektions-Leiste (Gruppen-Dirigat).
        const secHost = document.getElementById("hof-sections");
        out.sectionChipsRender = !!(secHost && secHost.querySelectorAll(".hof-section-chip").length >= 1);
        const alleChip = secHost && secHost.querySelector(".hof-section-chip");
        out.firstSectionIsAlle = !!(alleChip && /Alle/.test(alleChip.textContent));
        // Eine ECHTE Sektion (die zweite Chip, nicht „Alle") wählen → Liste filtert + die Befehlsleiste erscheint.
        const realChip = secHost && secHost.querySelectorAll(".hof-section-chip")[1];
        if (realChip) realChip.click();
        const cmdBar = document.getElementById("hof-section-cmd");
        out.sectionSelectShowsCmd = !!(cmdBar && !cmdBar.hidden && cmdBar.querySelector(".creature-action-btn"));
        out.sectionFiltersList = !!(
            st.hofSection &&
            st.hofSection !== "alle" &&
            document.querySelectorAll("#creature-list .creature-row").length <= st.creatures.length
        );
        // Der Sektions-Befehl ruft DENSELBEN Pfad (assignTaskToAllCreatures, gefiltert) — ein echter Konsument.
        const cmdBtn = cmdBar && cmdBar.querySelector(".creature-action-btn");
        const secBefore = st.hofSection;
        if (cmdBtn) cmdBtn.click();
        out.sectionCmdAssignsTask = st.creatures
            .filter((c) => r._creatureProfile(c).section === secBefore)
            .every((c) => r._getCreatureTask(c).name === "follow_player");
        st.hofSection = "alle"; // zurücksetzen — kein Filter-Leck in die Folge-Tests
        r._renderCreatureListUI();
        r.assignCreatureTask(sprite, "follow_player");
        const firstRow2 = list && list.querySelector(".creature-row");
        const taskCell = firstRow2 && firstRow2.querySelector(".creature-task");
        out.taskCellUpdates =
            taskCell && (taskCell.textContent === "folgt" || taskCell.classList.contains("follow_player"));
        out.preDisposeChildren = sprite.children.length >= 2;
        r.removeCreature(sprite);
        st.creatures = st.creatures.filter((c) => c !== sprite);
        out.sceneAfterRemove = !st.scene.children.includes(sprite);
        r.clearCreatures();
        r._renderCreatureListUI();
        // Hof-E/§G.9 — der leere Hof zeigt den einladenden Onboarding-Zustand (kein kahles „—").
        out.emptyShowsOnboarding = !!(list && list.querySelector(".hof-empty"));
        // Cleanup für nachfolgende Tests (Ring 3 V2 peace,
        // UI Run-Button): brauchen Kreaturen-Population.
        r.spawnCreatures(10);
        return out;
    });

    if (wave6hP2aResults && !wave6hP2aResults.error) {
        check("CREATURE_SOULS frozen", wave6hP2aResults.soulsFrozen);
        check("exakt vier Seelen — Hirsch·Wolf·Fuchs·Bär", wave6hP2aResults.threeSouls);
        check("CREATURE_SOUL_NAMES Array", wave6hP2aResults.hasSoulNames);
        check("CREATURE_NAME_POOL ≥ 20 Namen", wave6hP2aResults.hasNamePool);
        check("bodyParts haben shape+material-Schema", wave6hP2aResults.bodyPartsHaveSchema);
        check("wolf.auraY === 0.75", wave6hP2aResults.spriteAuraY);
        check("wesen.auraY === 0.8", wave6hP2aResults.wesenAuraY);
        check("Initial-Kreatur ist THREE.Group", wave6hP2aResults.initialIsGroup);
        check("Initial-Kreatur trägt Soul-Name", wave6hP2aResults.initialHasSoul);
        check("Initial-Kreatur trägt Name aus Pool", wave6hP2aResults.initialHasName);
        check("Initial-Kreatur hat Default-Task wander", wave6hP2aResults.initialHasTask);
        check("Initial-Kreatur-Group hat ≥2 Sub-Meshes", wave6hP2aResults.initialHasChildren);
        check(
            "Tiere tag-identisch (V17.16-Wand; Diskrimination = Größe)",
            wave6hP2aResults.spriteMoreMagie
        );
        check("wesen-Compound trägt dichte > 0", wave6hP2aResults.wesenMoreDichte);
        check("wolf-Compound trägt resoniert > 0", wave6hP2aResults.spriteHasResoniert);
        check("wesen-Compound trägt lebendig > 0", wave6hP2aResults.wesenHasLebendig);
        check("fuchs-Compound trägt lebendig > 0", wave6hP2aResults.geistHasLebendig);
        check(
            "ein unbekannter Seelen-Wunsch ist eine laute Absage (kein Ersatz-Tier)",
            wave6hP2aResults.unknownSoulAbsage
        );
        check("der Schild einer Seele (Hirsch) findet sie", wave6hP2aResults.soulLabelFindet);
        check("_creatureAuraOffsetY(wolf) === 0.75", wave6hP2aResults.spriteAuraOffset);
        check("_creatureAuraOffsetY(wesen) === 0.8", wave6hP2aResults.wesenAuraOffset);
        check(
            "spawnCreatureAt(soulName) setzt korrekte Soul",
            wave6hP2aResults.spawnSpriteWorks && wave6hP2aResults.spawnWesenWorks && wave6hP2aResults.spawnGeistWorks
        );
        check("Kreaturen-Drawer im DOM", wave6hP2aResults.hasCreatureDrawerEl);
        check(
            "Hof-A: inline-Befehle am Wesen (.creature-actions-inline, P16 eine Ebene)",
            wave6hP2aResults.hasTaskActions
        );
        check("Form-Dropdown = Zufällig + die vier Tiere", wave6hP2aResults.hasSoulSelect);
        check("Kreatur-Liste-Container im DOM", wave6hP2aResults.hasCreatureList);
        check(
            "Hof-A: die 3 inline-Tasks am Wesen (Folge/Warte/Streift via data-task)",
            wave6hP2aResults.hasFolgeInline && wave6hP2aResults.hasWarteInline && wave6hP2aResults.hasStreiftInline
        );
        check("Spawn-Buttons +1/+5", wave6hP2aResults.spawn1Button && wave6hP2aResults.spawn5Button);
        check("Liste rendert eine Zeile pro Kreatur", wave6hP2aResults.listRendersRows);
        check(
            "Zeile hat .creature-name + .creature-soul + .creature-task",
            wave6hP2aResults.rowHasNameSoulTask
        );
        check(
            "Hof-D0 §G.1: _creatureProfile bündelt die gemessenen Vektoren (tags/stats/specs/emotion/wariness/mood/id)",
            wave6hP2aResults.profileBundlesVectors
        );
        check(
            "Hof-D0 §G.1/V17.31: der Renderer KONSUMIERT das Profil (rowTitle trägt die moodLabel)",
            wave6hP2aResults.rendererConsumesProfile
        );
        check("Hof-D §D.1: die Stimmung als Glyph an jeder Zeile (.creature-mood)", wave6hP2aResults.rowHasMoodGlyph);
        check(
            "Hof-Bühne: die Zeilen sind der schlanke Picker (keine Detail-Card inline)",
            wave6hP2aResults.detailNotInRows
        );
        check(
            "Hof-Bühne: die Spec-Card des fokussierten Wesens lebt unter der Bühne (#hof-stage-spec, EINE Karte mit Balken)",
            wave6hP2aResults.stageSpecPresent && wave6hP2aResults.stageShowsOneCard
        );
        check(
            "Hof-Bühne: das Wesen-Spec-Sheet trägt den Header (Name) + Zwei-Spalten-Body (Werkstatt-DNA)",
            wave6hP2aResults.stageHasTitle && wave6hP2aResults.stageHasBody2Col
        );
        check(
            "Hof-Bühne: die Spec-Card unter der Bühne trägt den Verabschieden-Akt",
            wave6hP2aResults.stageHasDismiss
        );
        check(
            "Hof-Bühne: Klick markiert GENAU eine Zeile + holt das Wesen auf die Bühne",
            wave6hP2aResults.focusMarksOneRow && wave6hP2aResults.focusUpdatesStage
        );
        check(
            "Hof-Bühne: erneuter Klick löst den Fokus (zurück aufs erste Wesen, kein Leck)",
            wave6hP2aResults.focusToggleClears
        );
        check("Task-Wechsel triggert Liste-Refresh", wave6hP2aResults.taskCellUpdates);
        check("removeCreature entfernt Group aus scene", wave6hP2aResults.sceneAfterRemove);
        check(
            "Hof-E/§G.9: leerer Hof zeigt den Onboarding-Zustand (.hof-empty, kein kahles '—')",
            wave6hP2aResults.emptyShowsOnboarding
        );
        check(
            "Hof-E §D: zwei Zonen — ORCHESTER + PARTITUR existieren",
            wave6hP2aResults.hasOrchesterZone && wave6hP2aResults.hasPartiturZone
        );
        check(
            "Hof-E §D.4: die PARTITUR trägt die Gesetze + den Nexus (worldrules + abilities)",
            wave6hP2aResults.partiturHoldsLaws
        );
        check("Hof-E §D.3: der Spawn-Fuß ist ins ORCHESTER integriert", wave6hP2aResults.spawnFootInOrchester);
        check(
            "Hof-F §D.2: die Sektions-Leiste rendert Chips (Alle zuerst)",
            wave6hP2aResults.sectionChipsRender && wave6hP2aResults.firstSectionIsAlle
        );
        check(
            "Hof-F: eine Sektion wählen filtert die Liste + zeigt die Befehlsleiste",
            wave6hP2aResults.sectionSelectShowsCmd && wave6hP2aResults.sectionFiltersList
        );
        check(
            "Hof-F/§G.4: der Sektions-Befehl ruft DENSELBEN assignTaskToAllCreatures (gefiltert)",
            wave6hP2aResults.sectionCmdAssignsTask
        );
    }

    // ### Kreaturen sammeln + erinnern ###
    // gather-Task mit args.material findet die nächste Architektur mit diesem Material, läuft hin und
    // erntet bei haltDist = 1.5 m (Architektur entfernt, memory geschrieben).
    const wave6hP2bResults = await safeEvaluate(page, () => {
        if (!r || !st || !st.creatures || st.creatures.length < 3) return null;
        const out = {};
        out.tasksHasGather = AnazhRealm.CREATURE_TASKS.includes("gather");
        out.auraHueGather = AnazhRealm.CREATURE_TASK_AURA_HUE.gather === 200;
        out.haltDist = AnazhRealm.CREATURE_GATHER_HALT_DIST;
        out.speed = AnazhRealm.CREATURE_GATHER_SPEED;

        // Memory + FIFO-Cap (Phase 2D.1: jetzt 200 statt 30)
        const c0 = st.creatures[0];
        c0.userData.memory = [];
        for (let i = 0; i < 205; i++) r._creatureRemember(c0, "found", { idx: i });
        out.memCapEnforced = c0.userData.memory.length === 200;
        out.memFifoCorrect = c0.userData.memory[0].content.idx === 5 && c0.userData.memory[29].content.idx === 34;
        out.memHasTimestamp = typeof c0.userData.memory[0].at === "number";

        // _findNearestArchitectureWithMaterial
        const p = st.playerMesh.position;
        const woodTarget = r._findNearestArchitectureWithMaterial(p, "holz");
        out.findsHolz = !!woodTarget;
        if (woodTarget) {
            out.holzPartConfirmed =
                woodTarget.type &&
                st.blueprints[woodTarget.type] &&
                st.blueprints[woodTarget.type].parts.some((part) => part && part.material === "holz");
        }
        out.findsFictionalNull = r._findNearestArchitectureWithMaterial(p, "fictional_xyz") === null;

        // _buildCreatureTaskArgs context-dependent
        out.gatherStringArg = r._buildCreatureTaskArgs("gather", "holz").material === "holz";
        out.followNumberArg = r._buildCreatureTaskArgs("follow_player", 1.5).distance === 1.5;
        out.waitEmptyArg = Object.keys(r._buildCreatureTaskArgs("wait", "x")).length === 0;
        out.gatherWithNumberDrops = !r._buildCreatureTaskArgs("gather", 5).material;

        // Gather-Direction: läuft zum Ziel. UNIT-RICHTER: foundry-ON hinge `_findNearestArchitectureWith-
        // Material` (filtert `_archIsRendered`) am kalten Varianten-Cache des Spawns → Fixturen klassisch/
        // Grammatik unter lokalem Hook; Prüf-Gegenstand ist die Gather-MECHANIK.
        window.__withNoFoundry(() => {
            const target = r.spawnArchitecture("baum_eiche", { x: p.x + 10, y: p.y, z: p.z });
            c0.position.set(p.x, p.y, p.z);
            r.assignCreatureTask(c0, "gather", { material: "holz" }, { silent: true });
            const task = r._getCreatureTask(c0);
            const dir = r._tickCreatureTaskDirection(c0, task, "happy");
            out.gatherDirNonZero = dir && Math.abs(dir.x) + Math.abs(dir.z) > 0;
            // Die Mechanik wählt das NÄCHSTE Holz (der gepflanzte Baum oder ein näherer der Welt) — die Richtung
            // muss zu DEM gewählten Ziel zeigen, nicht zu einer festen Achse (ortsabhängig, flackerte mit der Streu).
            const ziel = task.args._target;
            out.gatherDirTargetsX =
                !!dir &&
                !!ziel &&
                dir.x * (ziel.position.x - c0.position.x) + dir.z * (ziel.position.z - c0.position.z) > 0;
            out.targetCached = !!task.args._target;

            // Gather-Ernte bei haltDist landet in carrying (Bring-Phase folgt), nicht direkt im Inventar.
            // c0 weit weg vom Spieler, damit nicht sofort die Übergabe auslöst.
            const tempArch = r.spawnArchitecture("stein_block", { x: p.x + 50, y: p.y, z: p.z + 50 });
            c0.position.set(p.x + 50.5, p.y, p.z + 50);
            c0.userData.carrying = null;
            st.player.inventory = new Array(27).fill(null);
            r.assignCreatureTask(c0, "gather", { material: "stein" }, { silent: true });
            const archCountBefore = st.architectures.length;
            const t2 = r._getCreatureTask(c0);
            r._tickCreatureTaskDirection(c0, t2, "happy");
            out.archRemovedOnHarvest = st.architectures.length === archCountBefore - 1;
            // P2B.5: jetzt landet die Ernte in carrying, das Inventar wird
            // erst bei Übergabe gefüllt. carrying-State prüfen.
            out.inventoryHasHarvested =
                c0.userData.carrying &&
                c0.userData.carrying.materials &&
                (c0.userData.carrying.materials.stein || 0) > 0;
            out.memoryHasGathered =
                c0.userData.memory &&
                c0.userData.memory.some(
                    (m) => m.type === "gathered" && m.content && m.content.blueprint === "stein_block"
                );
            void target;
            void tempArch;
        });

        // Unknown Material → wander-Fallback (carrying muss leer sein,
        // sonst greift Bring-Phase statt Sucher-Phase).
        c0.userData.carrying = null;
        if (c0.userData.carryingSprite) {
            st.scene.remove(c0.userData.carryingSprite);
            c0.userData.carryingSprite = null;
        }
        r.assignCreatureTask(c0, "wander", {}, { silent: true });
        r.assignCreatureTask(c0, "gather", { material: "fictional_xyz" }, { silent: true });
        const t3 = r._getCreatureTask(c0);
        r._tickCreatureTaskDirection(c0, t3, "happy");
        const tAfter = r._getCreatureTask(c0);
        out.unknownReturnsToWander = tAfter.name === "wander";
        out.memoryHasNoMaterial = c0.userData.memory.some(
            (m) => m.type === "no_material" && m.content && m.content.material === "fictional_xyz"
        );

        // DSL-Op + Chat
        r.assignCreatureTask(st.creatures[1], "wander", {}, { silent: true });
        st.creatures[1].position.set(p.x + 1, p.y, p.z + 1);
        r.dslRun(["creature_task", 1, "gather", "holz"], { source: "test" });
        const dt = r._getCreatureTask(st.creatures[1]);
        out.dslGatherWorks = dt && dt.name === "gather" && dt.args.material === "holz";

        const cases = [
            ["sammle holz", "creature_task_nearest", "gather", "holz"],
            ["bring quarz", "creature_task_nearest", "gather", "quarz"],
            ["alle sammeln eisen", "creature_task_all", "gather", "eisen"],
        ];
        out.chatPatterns = cases.every(([text, op, tn, mat]) => {
            const parsed = r.parseChatToDsl(text);
            return parsed && parsed.program[0] === op && parsed.program[1] === tn && parsed.program[2] === mat;
        });

        // NON_BROADCASTABLE_OPS bleibt
        const set = AnazhRealm.NON_BROADCASTABLE_OPS;
        out.nonBroadcastable =
            set.has("creature_task") && set.has("creature_task_nearest") && set.has("creature_task_all");

        // Status-Bar
        r.assignTaskToAllCreatures("wander");
        r.assignCreatureTask(st.creatures[0], "gather", { material: "holz" }, { silent: true });
        r.assignCreatureTask(st.creatures[1], "gather", { material: "holz" }, { silent: true });
        r.assignCreatureTask(st.creatures[2], "follow_player", {}, { silent: true });
        r._renderTaskStatusUI();
        const stext = document.getElementById("status-tasks").textContent;
        out.statusShowsGather = /2 sammeln/.test(stext);
        out.statusShowsFollow = /1 folgen/.test(stext);

        // describeProgram
        const d1 = r.describeProgram(["creature_task_nearest", "gather", "holz"]);
        out.descShowsMaterial = /Material/.test(d1) && /holz/.test(d1);

        // Liste zeigt 'sammelt holz'
        r._renderCreatureListUI();
        const list = document.getElementById("creature-list");
        const firstTask = list && list.querySelector(".creature-row .creature-task");
        out.listShowsSammelt = firstTask && /sammelt/.test(firstTask.textContent);
        out.listTaskHasGatherClass = firstTask && firstTask.classList.contains("gather");

        // Hof-C: der inline „Auftrag ▾"-Select pro Wesen trägt Sammle (+ Baue) — die globalen
        // Dropdowns sind aufgelöst (sie befahlen der NÄCHSTEN Kreatur; jetzt befiehlt man DEM Wesen).
        const orderSel = list && list.querySelector(".creature-row .creature-order-select");
        out.hasGatherSelect = !!orderSel;
        out.gatherSelectHasMaterials = orderSel
            ? [...orderSel.querySelectorAll("option")].filter((o) => o.value.startsWith("gather:")).length >= 10
            : false;
        out.hasNearestGatherBtn = !!(list && list.querySelector(".creature-row [data-task]"));
        out.hasAllGatherBtn = orderSel
            ? [...orderSel.querySelectorAll("option")].some((o) => o.value.startsWith("build:"))
            : false;

        // Cleanup für nachfolgende Tests
        r.assignTaskToAllCreatures("wander");
        return out;
    });

    if (wave6hP2bResults && !wave6hP2bResults.error) {
        check("CREATURE_TASKS enthält 'gather'", wave6hP2bResults.tasksHasGather);
        check("AURA_HUE.gather === 200 (cyan)", wave6hP2bResults.auraHueGather);
        check(
            "HALT_DIST/SPEED als Konstanten",
            Number.isFinite(wave6hP2bResults.haltDist) && Number.isFinite(wave6hP2bResults.speed)
        );
        check(
            "memory[] FIFO-Cap=200 nach 205 Pushes (P2D.1)",
            wave6hP2bResults.memCapEnforced && wave6hP2bResults.memFifoCorrect
        );
        check("memory-Eintrag hat at-Timestamp", wave6hP2bResults.memHasTimestamp);
        check("_findNearestArchitectureWithMaterial(holz) findet Baum", wave6hP2bResults.findsHolz);
        check("gefundene Architektur trägt material im Part", wave6hP2bResults.holzPartConfirmed);
        check("Unknown Material → null", wave6hP2bResults.findsFictionalNull);
        check(
            "_buildCreatureTaskArgs context-aware (gather→material, follow→distance, wait→leer, gather+number droppt)",
            wave6hP2bResults.gatherStringArg &&
                wave6hP2bResults.followNumberArg &&
                wave6hP2bResults.waitEmptyArg &&
                wave6hP2bResults.gatherWithNumberDrops
        );
        check(
            "gather-Tick Direction zeigt zum Ziel",
            wave6hP2bResults.gatherDirNonZero && wave6hP2bResults.gatherDirTargetsX
        );
        check("Ziel wird in task.args._target gecached", wave6hP2bResults.targetCached);
        check(
            "bei haltDist → Architektur entfernt + Inventar gefüllt + memory 'gathered'",
            wave6hP2bResults.archRemovedOnHarvest &&
                wave6hP2bResults.inventoryHasHarvested &&
                wave6hP2bResults.memoryHasGathered
        );
        check(
            "gather mit unbekanntem Material → Task fällt auf wander",
            wave6hP2bResults.unknownReturnsToWander
        );
        check("'no_material'-Erinnerung gespeichert", wave6hP2bResults.memoryHasNoMaterial);
        check("DSL creature_task(idx, gather, material) wirkt", wave6hP2bResults.dslGatherWorks);
        check(
            "Chat 'sammle/bring/alle sammeln' Patterns routen korrekt",
            wave6hP2bResults.chatPatterns
        );
        check("gather-DSL-Ops bleiben in NON_BROADCASTABLE_OPS", wave6hP2bResults.nonBroadcastable);
        check(
            "Status-Bar zeigt 'N sammeln' bei gather-Tasks",
            wave6hP2bResults.statusShowsGather && wave6hP2bResults.statusShowsFollow
        );
        check("describeProgram zeigt Material", wave6hP2bResults.descShowsMaterial);
        check(
            "Liste zeigt 'sammelt' + .gather-Class",
            wave6hP2bResults.listShowsSammelt && wave6hP2bResults.listTaskHasGatherClass
        );
        check(
            "Hof-C: der inline Auftrag-Select am Wesen traegt >=10 Sammle-Materialien",
            wave6hP2bResults.hasGatherSelect && wave6hP2bResults.gatherSelectHasMaterials
        );
        check(
            "Hof-C: inline Task-Knöpfe am Wesen + Bau-Optionen im Auftrag-Select",
            wave6hP2bResults.hasNearestGatherBtn && wave6hP2bResults.hasAllGatherBtn
        );
    }

    // ### harvestArchitecture + Material-Inventar + Bring-Phase ###
    // EINE Funktion für Spieler-LMB UND Kreatur-gather: Architekturen lösen sich volumen-basiert in eine
    // Material-Map auf; Inventar dual-typed {kind:'material'} | {kind:'blueprint'}; carrying → Spieler.
    const wave6hP2b5Results = await safeEvaluate(page, () => {
        if (!r || !st || !st.creatures || st.creatures.length < 2) return null;
        const out = {};

        const p = st.playerMesh ? st.playerMesh.position : { x: 0, y: 5, z: 0 };

        // Material-Map aus parts × Volumen
        const stoneBlock = r.spawnArchitecture("stein_block", { x: p.x + 30, y: p.y, z: p.z + 30 });
        const h1 = r.harvestArchitecture(stoneBlock, "test");
        out.steinBlockHasStein = h1 && h1.materials && h1.materials.stein >= 10;
        out.steinHasBlueprintName = h1 && h1.blueprint === "stein_block";

        const oak = r.spawnArchitecture("baum_eiche", { x: p.x + 35, y: p.y, z: p.z + 30 });
        const h2 = r.harvestArchitecture(oak, "test");
        out.oakHasHolzAndLaub = h2 && h2.materials && h2.materials.holz > 0 && h2.materials.laub > 0;
        out.oakHasNoStein = h2 && (!h2.materials.stein || h2.materials.stein === 0);

        // Diskrimination: größerer Bauplan = mehr Material
        st.blueprints._test_small = {
            name: "_test_small",
            label: "Small",
            builtIn: false,
            parts: [{ shape: "box", material: "stein", size: { x: 1, y: 1, z: 1 } }],
        };
        st.blueprints._test_big = {
            name: "_test_big",
            label: "Big",
            builtIn: false,
            parts: [{ shape: "box", material: "stein", size: { x: 2, y: 2, z: 2 } }],
        };
        const s = r.spawnArchitecture("_test_small", { x: p.x + 60, y: p.y, z: p.z });
        const b = r.spawnArchitecture("_test_big", { x: p.x + 65, y: p.y, z: p.z });
        const hs = r.harvestArchitecture(s);
        const hb = r.harvestArchitecture(b);
        out.volumeDiscrimination = hb.materials.stein > hs.materials.stein;
        delete st.blueprints._test_small;
        delete st.blueprints._test_big;

        // addMaterialToInventory + Schema
        st.player.inventory = new Array(27).fill(null);
        const ok1 = r.addMaterialToInventory("holz", 5);
        const ok2 = r.addMaterialToInventory("holz", 3);
        const ok3 = r.addMaterialToInventory("stein", 4);
        const okBad = r.addMaterialToInventory("fictional_xyz", 1);
        out.matAddOk = ok1 && ok2 && ok3;
        out.matStacks =
            st.player.inventory[0] &&
            st.player.inventory[0].count === 8 &&
            st.player.inventory[0].kind === "material";
        out.matNewSlot = st.player.inventory[1] && st.player.inventory[1].material === "stein";
        out.matRejectsUnknown = okBad === false;

        // Spieler-LMB nutzt harvestArchitecture (EINE Funktion). Deterministisch: Kamera EXPLIZIT setzen
        // (nicht die variable Render-Loop-Kamera) + Test-Block fern anderer Architekturen, damit der
        // Raycast NUR das Target trifft.
        st.player.inventory = new Array(27).fill(null);
        const tcx = p.x + 6;
        const tcz = p.z + 6;
        const target = r.spawnArchitecture("stein_block", { x: tcx, y: p.y, z: tcz });
        // Target-Mesh DIREKT bauen: das Cull-Budget ist global und erreicht das Target unter kumulativer
        // Last evtl. nicht; der `_pickArchitectureAtCrosshair`-Raycast braucht `entry.mesh`.
        if (target && !r._archIsRendered(target)) r._rebuildArchitectureMesh(target);
        // Welt-Matrizen aktualisieren wie ein Render-Frame: `_pickArchitectureAtCrosshair` liest
        // `mesh.matrixWorld` AS-IS, ein frisch gespawntes Mesh steht bis updateMatrixWorld auf Identität
        // (im Band gibt es keinen Render zwischen Spawn und Pick).
        if (st.scene) st.scene.updateMatrixWorld(true);
        if (st.camera) {
            // Kamera 6 m vor dem Target, leicht erhöht, schaut drauf.
            st.camera.position.set(tcx, p.y + 1.5, tcz - 6);
            st.camera.lookAt(tcx, p.y, tcz);
            st.camera.updateMatrixWorld(true);
        }
        // Abbauen kostet jetzt MÜHE + braucht ein taugliches Werkzeug (kein Instant
        // mehr). Wir rüsten ein hartes Werkzeug aus (stein als harte Substanz) + hieben bis zum
        // Bruch; der Ertrag fließt nur mit tauglichem Werkzeug (die bloße Faust gäbe ~nichts).
        st.player.equipped = st.player.equipped || {};
        st.player.equipped.held = "stein_block";
        st.player.stamina = 1e6; // V17.55 — der Stamina-Gate soll diese Mess-Schleife nicht stören
        // Der Crosshair-Raycast ist unter kumulativer Last fragil (Target budget-verzögert, oder ein Nachbar
        // wird getroffen). Die Vision „Spieler-LMB → Material-Slot“ IST `_strikeArchitecture` (die EINE
        // Funktion, die tryMouseBreak beim Architektur-Treffer ruft) → das Target direkt darüber schlagen.
        const archBeforeLmb = st.architectures.length;
        for (let s = 0; s < 40 && st.architectures.indexOf(target) >= 0; s++) r._strikeArchitecture(target);
        st.player.equipped.held = null;
        out.lmbShrunkArch = st.architectures.length < archBeforeLmb;
        out.lmbFilledInventory = st.player.inventory.some(
            (sl) => sl && sl.kind === "material" && sl.material === "stein" && sl.count >= 1
        );

        // Kreatur-gather: zwei Phasen mit carrying. UNIT-RICHTER: foundry-ON macht einen kalt gespawnten
        // stein_block für `_findNearestArchitectureWithMaterial` (filtert `_archIsRendered`) unauffindbar
        // → deterministische Grammatik-Fixtur unter lokalem Hook.
        st.player.inventory = new Array(27).fill(null);
        window.__withNoFoundry(() => {
            r.spawnArchitecture("stein_block", { x: p.x + 30, y: p.y, z: p.z });
            const c = st.creatures[0];
            c.position.set(p.x + 29.5, p.y, p.z);
            c.userData.carrying = null;
            r.assignCreatureTask(c, "gather", { material: "stein" }, { silent: true });
            r._tickCreatureTaskDirection(c, r._getCreatureTask(c), "happy");
            out.creatureCarryingSet = !!(c.userData.carrying && c.userData.carrying.materials);
            out.inventoryStillEmptyAfterHarvest = st.player.inventory.every((sl) => !sl);
            out.carryingSpriteCreated = !!c.userData.carryingSprite;

            // Kreatur zum Spieler bewegen → Übergabe
            c.position.set(p.x + 1.5, p.y, p.z);
            r._tickCreatureTaskDirection(c, r._getCreatureTask(c), "happy");
            out.carryingClearedAfterDelivery = c.userData.carrying === null;
            out.playerHasMaterialAfterDelivery = st.player.inventory.some(
                (sl) => sl && sl.kind === "material" && sl.material === "stein" && sl.count >= 1
            );
            out.memoryHasDelivered = c.userData.memory && c.userData.memory.some((m) => m.type === "delivered");
        });

        // Inventar-UI rendert Material-Slot mit Klasse
        st.player.inventory = new Array(27).fill(null);
        r.addMaterialToInventory("holz", 7);
        r.renderInventoryUI();
        const slot = document.querySelector('[data-inv-slot="0"]');
        out.uiHasMaterialClass = slot && slot.classList.contains("material-slot");
        const label = slot && slot.querySelector(".slot-label");
        out.uiShowsMaterialName = label && /holz/i.test(label.textContent);

        // Cleanup für nachfolgende Tests
        r.spawnCreatures(10);
        return out;
    });

    if (wave6hP2b5Results && !wave6hP2b5Results.error) {
        check(
            "stein_block-Harvest liefert ≥10 Stein (volumen-basiert)",
            wave6hP2b5Results.steinBlockHasStein
        );
        check("Rückgabe-Objekt trägt blueprint-Namen", wave6hP2b5Results.steinHasBlueprintName);
        check(
            "baum_eiche → holz UND laub (Compound-Diskrimination)",
            wave6hP2b5Results.oakHasHolzAndLaub
        );
        check("baum_eiche enthält KEIN stein (Negativ-Kontrolle)", wave6hP2b5Results.oakHasNoStein);
        check(
            "Diskrimination — 2×2×2-Box liefert mehr als 1×1×1",
            wave6hP2b5Results.volumeDiscrimination
        );
        check("addMaterialToInventory akzeptiert bekanntes Material", wave6hP2b5Results.matAddOk);
        check("Material-Slots stacken (5+3=8), kind='material'", wave6hP2b5Results.matStacks);
        check("Unterschiedliche Materialien in neuen Slots", wave6hP2b5Results.matNewSlot);
        check("addMaterialToInventory lehnt Unknown ab", wave6hP2b5Results.matRejectsUnknown);
        check("Spieler-LMB entfernt Architektur (eine Funktion)", wave6hP2b5Results.lmbShrunkArch);
        check(
            "Spieler-LMB füllt Material-Slots (Vision-Inkonsistenz behoben)",
            wave6hP2b5Results.lmbFilledInventory
        );
        check(
            "Kreatur-Ernte setzt userData.carrying (statt direkt Inventar)",
            wave6hP2b5Results.creatureCarryingSet
        );
        check(
            "Spieler-Inventar bleibt LEER bis Bring-Phase abgeschlossen",
            wave6hP2b5Results.inventoryStillEmptyAfterHarvest
        );
        check("Carrying-Sprite wird beim Harvest erzeugt", wave6hP2b5Results.carryingSpriteCreated);
        check(
            "Bei <2m zum Spieler: carrying wird geclearet",
            wave6hP2b5Results.carryingClearedAfterDelivery
        );
        check(
            "Materialien gehen ins Spieler-Inventar bei Übergabe",
            wave6hP2b5Results.playerHasMaterialAfterDelivery
        );
        check("'delivered'-Memory-Eintrag bei Übergabe", wave6hP2b5Results.memoryHasDelivered);
        check("Material-Slot trägt .material-slot CSS-Klasse", wave6hP2b5Results.uiHasMaterialClass);
        check("Material-Slot-Label zeigt Material-Namen", wave6hP2b5Results.uiShowsMaterialName);
    }

    // ### Material-Konsum beim Bauen (modus-symmetrisch) ###
    // pfad konsumiert, frieden + schöpfer kostenlos (Symmetrie zu damagePlayer/applyOpToPart-Stamina).
    // computeBuildCost ≡ harvestArchitecture (Wertneutralität: eine Box kostet, was harvest liefert).
    const wave6hP2cResults = await safeEvaluate(page, () => {
        if (!r || !st || !st.playerMesh) return null;
        const out = {};

        // Wertneutralität: build-cost ≡ harvest-return.
        const p = st.playerMesh.position;
        const cost = r.computeBuildCost("stein_block");
        const arch = r.spawnArchitecture("stein_block", {
            x: p.x + 120,
            y: p.y,
            z: p.z + 120,
        });
        const harvest = r.harvestArchitecture(arch, "test");
        out.symmetryHarvest = harvest && harvest.materials.stein === cost.stein;
        out.steinBlockOnlyStein = Object.keys(cost).length === 1 && cost.stein > 0;

        // Compound-Diskrimination
        const oakCost = r.computeBuildCost("baum_eiche");
        out.oakHasHolzAndLaub = oakCost.holz > 0 && oakCost.laub > 0;
        out.oakHasNoStein = !oakCost.stein || oakCost.stein === 0;

        // checkBuildCost ok/missing
        const origMode = r.getGameMode();
        r.setGameMode("pfad");
        st.player.inventory = new Array(27).fill(null);
        const c1 = r.checkBuildCost("stein_block");
        out.checkEmptyInventoryRejected = !c1.ok && c1.missing.stein > 0;
        r.addMaterialToInventory("stein", 200);
        const c2 = r.checkBuildCost("stein_block");
        out.checkSufficientOk = c2.ok && Object.keys(c2.missing).length === 0;

        // Atomarer Konsum + Atomarität bei Mangel
        st.player.inventory = new Array(27).fill(null);
        r.addMaterialToInventory("stein", 100);
        const beforeConsume = st.player.inventory[0].count;
        const consumed = r.tryConsumeBuildCost("stein_block");
        const afterConsume = st.player.inventory[0] ? st.player.inventory[0].count : 0;
        out.consumesExactly = consumed.ok && beforeConsume - afterConsume === consumed.cost.stein;

        st.player.inventory = new Array(27).fill(null);
        r.addMaterialToInventory("holz", 100);
        const beforeAtomic = st.player.inventory[0].count;
        const atomicResult = r.tryConsumeBuildCost("baum_eiche");
        const afterAtomic = st.player.inventory[0].count;
        out.atomicAtomicityOnFail = !atomicResult.ok && beforeAtomic === afterAtomic;
        out.atomicReportsMissing = atomicResult.missing && atomicResult.missing.laub > 0;

        // DAS MACH-TOR JE MODUS über den Bau-Weg (schöpfer frei, frieden und pfad zahlen genau einmal, frieden ohne Material
        // lehnt ab und spricht) misst diag-werkstatt-weg L-WERKSTATT mit echten Eingaben; hier bleibt pfad ohne Material.
        // confirmBuild pfad ohne Material → ablehnung (das Phantom steht auf dem Grund: headless zielt kein tickBuildMode, die
        // Absage gilt dem Material, nie dem Standort)
        st.player.inventory = new Array(27).fill(null);
        r._clearBuildMode();
        r.setHotbarSlot(0, "stein_block");
        r.selectHotbarSlot(0);
        window.__setzOrt("stein_block");
        st.buildMode.phantomOnGround = true;
        const archBeforeNoMat = st.architectures.length;
        const builtNoMat = r.confirmBuild();
        out.pfadRejectsWithoutMaterial = builtNoMat === false;
        out.pfadNoArchOnReject = st.architectures.length === archBeforeNoMat;

        // HUD-Reflexion
        r.setGameMode("pfad");
        st.player.inventory = new Array(27).fill(null);
        r.addMaterialToInventory("stein", 30);
        r._clearBuildMode();
        r.setHotbarSlot(0, "stein_block");
        r.selectHotbarSlot(0);
        const hud = document.getElementById("build-mode-hud");
        const hudHtml = hud && hud.innerHTML;
        out.hudShowsCostInPfad = hudHtml && /stein/.test(hudHtml) && /\(30\)/.test(hudHtml);

        r.setGameMode("schöpfer");
        const hudSchoepfer = document.getElementById("build-mode-hud").innerHTML;
        out.hudShowsFreiInSchoepfer = /frei/i.test(hudSchoepfer);

        // S2 — frieden-HUD zeigt jetzt die Material-Kosten (wie pfad), nicht „frei".
        r.setGameMode("frieden");
        const hudFrieden = document.getElementById("build-mode-hud").innerHTML;
        out.hudShowsCostInFrieden = hudFrieden && /stein/.test(hudFrieden) && /\(30\)/.test(hudFrieden);

        // Cleanup: zurück auf frieden + Hotbar-Defaults für nachfolgende Tests.
        // Default-Hotbar (AUSLÖSCHUNGS-WELLE): [stein_block, waterfall, damm, null×6].
        r._clearBuildMode();
        r.setHotbarSlot(0, "stein_block");
        r.setHotbarSlot(1, "waterfall");
        r.setHotbarSlot(2, "damm");
        for (let i = 3; i < 9; i++) r.setHotbarSlot(i, null);
        r.setGameMode(origMode || "frieden");
        return out;
    });

    if (wave6hP2cResults && !wave6hP2cResults.error) {
        check(
            "computeBuildCost ≡ harvestArchitecture (Wertneutralität)",
            wave6hP2cResults.symmetryHarvest
        );
        check("stein_block-Kosten enthalten NUR stein", wave6hP2cResults.steinBlockOnlyStein);
        check("baum_eiche-Kosten enthalten holz UND laub", wave6hP2cResults.oakHasHolzAndLaub);
        check("baum_eiche-Kosten enthalten KEIN stein (Diskrimination)", wave6hP2cResults.oakHasNoStein);
        check(
            "pfad + leeres Inventar → checkBuildCost.ok=false",
            wave6hP2cResults.checkEmptyInventoryRejected
        );
        check(
            "pfad + ausreichend Material → checkBuildCost.ok=true",
            wave6hP2cResults.checkSufficientOk
        );
        check("tryConsumeBuildCost zieht genau die Kosten ab", wave6hP2cResults.consumesExactly);
        check("Atomarität — bei Mangel wird NICHTS abgezogen", wave6hP2cResults.atomicAtomicityOnFail);
        check("missing-Map zeigt fehlendes Sub-Material", wave6hP2cResults.atomicReportsMissing);
        check("pfad ohne Material → confirmBuild lehnt ab", wave6hP2cResults.pfadRejectsWithoutMaterial);
        check("pfad-Ablehnung → keine Architektur entsteht", wave6hP2cResults.pfadNoArchOnReject);
        check("pfad-HUD zeigt Material-Kosten + verfügbare Menge", wave6hP2cResults.hudShowsCostInPfad);
        check("schöpfer-HUD zeigt 'frei'", wave6hP2cResults.hudShowsFreiInSchoepfer);
        check(
            "S2: frieden-HUD zeigt die Material-Kosten (nicht mehr 'frei')",
            wave6hP2cResults.hudShowsCostInFrieden
        );
    }
}

// Beweis dass der drink-Task als
// 6. Task registriert ist, dass die Sprache (Aura+Ping+Chat) ihn trägt,
// und dass _tickCreatureDrink den 3-Phasen-Zyklus durchläuft.
async function checkBandWelleV11D3DrinkTask({ page, check }) {
    const p = await page.evaluate(() => r.parseChatToDsl("trinke"));
    check(
        "Chat-Pattern trinke → creature_task_nearest drink",
        !!p && !!p.program && p.program[0] === "creature_task_nearest" && p.program[1] === "drink"
    );
}

// BEDROHUNG: ein WILDES Wesen (Temperament aus glühender Substanz, kein hostile-Flag) jagt nur im
// pfad, Furcht schlägt Jagd; das Rudel kommt ambient (G4a, gate:kreatur-takt „geburt"). Der Biss
// läuft durchs damagePlayer-Tor → FURCHT bei niedriger HP · TRIUMPH beim Fall eines Jägers.
async function checkBandPhaseEThreat({ page, check }) {
    const res = await safeEvaluate(page, () => {
        const out = {};
        const p = st.player;
        const pm = st.playerMesh.position;
        const savedMode = r.getGameMode();
        const savedHp = p.hp;
        const savedPhoenix = p.respawnGraceUntil;
        const savedMax = st.maxCreatures;
        const savedEmo = {};
        for (const k of Object.keys(p.emotions)) savedEmo[k] = p.emotions[k];
        const savedOrt = { x: pm.x, y: pm.y, z: pm.z };
        const spawned = [];
        try {
            r.setGameMode("pfad");
            p.respawnGraceUntil = -Infinity;
            st.maxCreatures = st.creatures.length + 4;
            // der Spieler steht auf dem Boden: der Biss braucht den Kopf am Leib, auch in der Höhe (Welle LF kampf)
            pm.y = r.getTerrainHeightAt(pm.x, pm.z) + AnazhRealm.PLAYER_FOOT_OFFSET;
            const wolf = r.spawnCreatureAt(pm.x + 2, pm.y, pm.z, "happy", "wolf");
            spawned.push(wolf);
            // W-D/M-F1 — die Spieler-Klemme schiebt frische Spawns auf
            // ≥3 m; dieser Test prüft den BISS, nicht den Spawn-Ort → die Kreatur
            // rückt explizit in die Weite ihres Ansprungs (Welle LF kampf:
            // der Biss ist der Ansprung, 1,2 m reicht jeder Größe), ihm zugewandt.
            if (wolf) {
                wolf.position.set(pm.x + 1.2, pm.y, pm.z);
                wolf.rotation.set(0, -Math.PI / 2, 0);
                wolf.userData._steuer = null;
            }
            // DER BISS IST DER ANSPRUNG (Posten 5): der Ansatz springt an, gebissen wird, wenn der Kopf
            // den Leib berührt — der Kreatur-Takt läuft, bis der Ansprung schnappt oder endet (höchstens 1,5 s). Ein
            // voriger Ansprung landet erst (die Biss-Uhr ruht so lange: kein Biss, den die Probe nicht setzt).
            // (die EINE Frage des Spiels, _kreaturAnsprungOffen: die Landung gehört zum Sprung — K13)
            const bissOffen = (c) => (r._kreaturAnsprungOffen(c) ? c.userData._verhaltenAktion : null);
            // der Takt des Spiels: der Kreatur-Takt, dann der feste Sim-Schritt der Leiber (getragener Stoß, Leib an Leib)
            const takt = () => {
                r.updateCreatures(1 / 60);
                r._kreaturStossSchritt(1 / 60);
                r._leibKontakte();
            };
            const beiss = (c) => {
                const uhr = c.userData.nextHuntStrikeAt;
                c.userData.nextHuntStrikeAt = 1e12; // (endlich: die Biss-Uhr liest nur endliche Zeiten)
                for (let k = 0; bissOffen(c) && k < 90; k++) takt();
                c.userData.nextHuntStrikeAt = uhr;
                const ok = r._tickCreatureHuntStrike(c);
                for (let k = 0; ok && k < 90; k++) {
                    const A0 = bissOffen(c);
                    if (!A0 || !A0.biss) break;
                    takt();
                }
                return ok;
            };
            // (1) die Gattung trägt WILD: gate:kreatur-takt temperament (wolf@1 wild).
            // (2) die Witterung: Furcht schlägt Jagd, eine sanfte Seele jagt nie (die Pirsch auf den Spieler im pfad, keine
            // im Frieden: gate:kreatur-takt rudel).
            out.fearBeatsHunt =
                r._creatureScentHuntDir(wolf, AnazhRealm._verhaltenGesetz().furcht.fleeThreshold) === null;
            const lamm = r.spawnCreatureAt(pm.x + 3.5, pm.y, pm.z + 1, "happy", "wesen");
            spawned.push(lamm);
            out.gentleNoHunt = r._creatureScentHuntDir(lamm, 0) === null;
            // (3) der BISS: HP sinkt durchs damagePlayer-Tor, der Cooldown deckelt, die Rüstung dämpft
            // (_ruestungDaempft, dasselbe Gesetz wie bei den Wesen). Die Probe isoliert die Abwehr (0 vs 3).
            const savedDef = p.stats.defense;
            p.stats.defense = 0;
            p.hp = p.stats.hpMax || 100;
            const hp0 = p.hp;
            const bit = beiss(wolf);
            out.strikeHits = bit === true && p.hp < hp0;
            out.cooldownGates = r._tickCreatureHuntStrike(wolf) === false;
            const dealt1 = hp0 - p.hp;
            wolf.userData.nextHuntStrikeAt = 0;
            p.stats.defense = 3;
            const hp1 = p.hp;
            beiss(wolf);
            const dealt2 = hp1 - p.hp;
            p.stats.defense = savedDef;
            out.armorDampens = dealt2 < dealt1 - 1e-9 && dealt2 >= 1;
            // (4) die FURCHT: niedrige HP + Jagd-Schlag → sorrow steigt. sorrow zuerst auf 0 — der Warmup kann
            // es an die 1.0-Decke getrieben haben, dann wäre kein Anstieg messbar.
            p.hp = (p.stats.hpMax || 100) * 0.2;
            p.emotions.sorrow = 0;
            wolf.userData.nextHuntStrikeAt = 0;
            beiss(wolf);
            out.fearFelt = p.emotions.sorrow > 0;
            // (5) der TRIUMPH aus der Situation (oekologie.K4#2, kein Stempel): der Jäger am Spieler senkt sie
            // (`_spielerUmstellt`), sein Fall von Spieler-Hand hebt sie
            r._spielerJaeger = [wolf];
            const sit = () => r._playerSituationWohl(r.auraAt(pm.x, pm.z));
            const sit0 = sit();
            r.damageCreature(wolf, 9999, { source: "player" });
            spawned[0] = null;
            out.triumphFelt = sit() > sit0;
        } finally {
            for (const c of spawned) {
                if (c) r.removeCreature(c);
            }
            p.hp = savedHp;
            p.respawnGraceUntil = savedPhoenix;
            st.maxCreatures = savedMax;
            for (const k of Object.keys(p.emotions)) p.emotions[k] = savedEmo[k] || 0;
            r.setGameMode(savedMode);
            pm.set(savedOrt.x, savedOrt.y, savedOrt.z);
        }
        return out;
    });
    check("Phase E Bedrohung: Furcht schlägt Jagd + sanfte Seelen jagen nie", res.fearBeatsHunt && res.gentleNoHunt);
    check(
        "Phase E Bedrohung: der Biss trifft durchs damagePlayer-Tor + Cooldown deckelt",
        res.strikeHits && res.cooldownGates
    );
    check("Phase E Bedrohung: die Rüstung dämpft FLACH (die EINE Kreatur-Formel)", res.armorDampens);
    check("Phase E Bedrohung: FURCHT bei niedriger HP + TRIUMPH beim Fall des Jägers", res.fearFelt && res.triumphFelt);
}

// Die Tiere entstapeln + differenzieren sich — eingefaltet aus gate:tier-separation: am ECHTEN Chokepoint (updateCreatures):
// (A) zwei identische Wesen auf DEMSELBEN Punkt sind nach 200 Ticks > Körperradius getrennt, beschränkt · (B) verschiedene Stats →
// messbar verschiedene Bewegung (speedMul, Leine aus Mut × Größe) · (C) Selbsttest · (D–F, 0710-4) Leib an Leib: keine Durchdringung,
// Impuls nach Masse, der Spieler bekommt seinen Stoß, Lockstep; Selbsttests C2 (ohne Leib-Kontakt) und D (der alte Befund).
async function checkBandTierSeparation({ page, check }) {
    const LEIB_SOLL = { tiefM: -0.05, dvMin: 0.05, verhaeltnis: 0.3, flugFaktor: 3 };
    const leibVerdict = function leibVerdict(L) {
        if (!L || !L.fuchsBaer || !L.baerFuchs) return ["leib keine Probe"];
        const v = [];
        for (const [k, name] of [
            ["fuchsBaer", "Fuchs → Bär"],
            ["baerFuchs", "Bär → Fuchs"],
        ]) {
            const m = L[k];
            if (!(m.minAbstand >= LEIB_SOLL.tiefM))
                v.push(`leib-durchdringung: ${name} — die Leiber stecken ${(-m.minAbstand).toFixed(2)} m ineinander`);
            if (!(m.dvZiel >= LEIB_SOLL.dvMin))
                v.push(`leib-ohne-impuls: ${name} — der Gestoßene bekommt ${(m.dvZiel || 0).toFixed(3)} m/s`);
            else if (!(m.massen > 0) || !(Math.abs(m.dvStoesser / m.dvZiel / m.massen - 1) <= LEIB_SOLL.verhaeltnis))
                v.push(
                    `leib-masse: ${name} — Δv ${m.dvStoesser.toFixed(2)} zu ${m.dvZiel.toFixed(2)} m/s gegen das Massen-Verhältnis ${(m.massen || 0).toFixed(1)}`
                );
        }
        if (!(L.baerFuchs.dvZiel >= LEIB_SOLL.flugFaktor * L.fuchsBaer.dvZiel))
            v.push(
                `leib-umgekehrt: der Fuchs bekommt am Bären ${(L.baerFuchs.dvZiel || 0).toFixed(2)} m/s, der Bär am Fuchs ${(L.fuchsBaer.dvZiel || 0).toFixed(2)} — der Leichte fliegt nicht`
            );
        if (L.spieler) {
            if (!(L.spieler.minAbstand >= LEIB_SOLL.tiefM))
                v.push(`leib-spieler: der Wolf steckt ${(-L.spieler.minAbstand).toFixed(2)} m im Spieler`);
            if (!(L.spieler.dvSpieler >= LEIB_SOLL.dvMin))
                v.push(`leib-spieler: der Spieler bekommt ${(L.spieler.dvSpieler || 0).toFixed(3)} m/s vom Wolf`);
        } else v.push("leib-spieler keine Probe");
        if (L.lockstep !== true) v.push(`leib-lockstep: zwei gleiche Proben enden verschieden (${L.lockstepAbw})`);
        return v;
    };
    const out = await safeEvaluate(page, async () => {
        const s = st,
            A = AnazhRealm;
        const o = { checks: {} };
        const pm = s.playerMesh && s.playerMesh.position;
        if (!pm) return { error: "kein Spieler" };
    
        // Test-Spot: 80–150 m vom Spieler, über Wasser (Determinismus-Fenster, s. Kopf).
        const findSpot = (dist, ang) => {
            for (let i = 0; i < 200; i++) {
                const d = dist + (i % 40);
                const a = ang + Math.floor(i / 40) * 0.4;
                const x = pm.x + Math.cos(a) * d;
                const z = pm.z + Math.sin(a) * d;
                if (r._landAt(x, z)) {
                    const h = r.getTerrainHeightAt(x, z);
                    return { x, y: (Number.isFinite(h) ? h : 0) + 1, z };
                }
            }
            return null;
        };
        const distXZ = (a, b) => Math.hypot(a.position.x - b.x, a.position.z - b.z);
        const gap = (a, b) => Math.hypot(a.position.x - b.position.x, a.position.z - b.position.z);
    
        const saveMax = s.maxCreatures;
        s.maxCreatures = Math.max(saveMax || 0, s.creatures.length + 4);
        const spawn = (spot, soul, bodySize) =>
            r.spawnCreatureAt(spot.x, spot.y, spot.z, "happy", soul, { precise: true, bodySize });
        const cleanup = (list) => list.forEach((c) => c && r.removeCreature(c));
        // der Takt der Probe wie der Loop: der feste Sim-Schritt (der Stoß des Leibs und Leib an Leib, 0710-5), dann
        // der Kreatur-Takt — vor 0710-5 lebte beides in updateCreatures (dort läuft die Probe unverändert)
        const takt = (dt) => {
            r._kreaturStossSchritt(dt);
            r._leibKontakte();
            r.updateCreatures(dt);
        };
        const tick = (n, dt) => {
            for (let k = 0; k < n; k++) takt(dt);
        };
    
        // ── (A) SEPARATION: identisches Paar auf DEMSELBEN Punkt ──
        const spotA = findSpot(100, 0.3);
        if (!spotA) return { error: "kein Land-Spot (A)" };
        const a1 = spawn(spotA, "wesen", 1);
        const a2 = spawn(spotA, "wesen", 1);
        if (!a1 || !a2) return { error: "Spawn (A) fehlgeschlagen" };
        a2.userData.netId = a1.userData.netId; // geklonter Wander-Strom — nur Separation kann trennen
        a2.position.copy(a1.position); // exakte Deckung (spawnCreatureAt precise → schon gleich)
        o.a0 = gap(a1, a2);
        tick(200, 0.05); // 10 s Sim
        o.aGap = gap(a1, a2);
        // SCHLUSS-WELLE 17.07. — die Separations-Zahlen wohnen im tetrapoda-
        // Gesetzbuch (VERHALTEN.separation, _verhaltenGesetz fail-closed).
        o.aBodyRadius = r._kreaturRaum(a1) / A._verhaltenGesetz().separation.raumKugel; // die Körper-Kugel des Leibs (Welle LF)
        o.aPlayerDist = distXZ(a1, pm);
        o.checks.aStacked0 = o.a0 < 1e-6;
        o.checks.aSeparated = o.aGap > o.aBodyRadius;
        o.checks.aBounded = o.aGap < 30; // keine Explosions-Kraft
    
        // ── (C) SELBST-TEST: genullte Separation → das Paar BLEIBT gestapelt ──
        a1.position.set(spotA.x, spotA.y, spotA.z);
        a2.position.copy(a1.position);
        delete a1.userData._wanderSlot;
        delete a2.userData._wanderSlot;
        a1.userData.wanderAnchor = null;
        a2.userData.wanderAnchor = null;
        // genullt: die Separation UND das EINE Paar Leib an Leib `_leibPaar` (es allein trennte das Paar)
        const savedSep = r._applyCreatureSeparation;
        r._applyCreatureSeparation = function () {};
        r._leibPaar = () => false;
        tick(200, 0.05);
        r._applyCreatureSeparation = savedSep; // restaurieren (Gate-Hook-Lehre)
        delete r._leibPaar;
        o.cGap = gap(a1, a2);
        o.checks.cLensFires = o.cGap < 0.2; // gestapelt → die (A)-Bedingung WÜRDE rot lesen
        cleanup([a1, a2]);
    
        // ── (B1) STAT-ACHSE: klein flink vs. Gigant träge (gleiche Soul) ──
        const spotB1a = findSpot(95, 1.8);
        const spotB1b = findSpot(95, -1.8);
        if (!spotB1a || !spotB1b) return { error: "kein Land-Spot (B1)" };
        const bSmall = spawn(spotB1a, "wesen", 0.6);
        const bBig = spawn(spotB1b, "wesen", 2.4);
        if (!bSmall || !bBig) return { error: "Spawn (B1) fehlgeschlagen" };
        o.b1MulSmall = r._creatureMoveCharacter(bSmall).speedMul;
        o.b1MulBig = r._creatureMoveCharacter(bBig).speedMul;
        let pathSmall = 0,
            pathBig = 0,
            px1 = bSmall.position.x,
            pz1 = bSmall.position.z,
            px2 = bBig.position.x,
            pz2 = bBig.position.z;
        for (let k = 0; k < 400; k++) {
            takt(0.05);
            pathSmall += Math.hypot(bSmall.position.x - px1, bSmall.position.z - pz1);
            pathBig += Math.hypot(bBig.position.x - px2, bBig.position.z - pz2);
            px1 = bSmall.position.x;
            pz1 = bSmall.position.z;
            px2 = bBig.position.x;
            pz2 = bBig.position.z;
        }
        o.b1PathSmall = pathSmall;
        o.b1PathBig = pathBig;
        // Das Tempo ist m/s aus dem Gang-Gesetz (Q3): die Tempo-Einheit tempo·√(g·L) wächst mit der Hüft-
        // Höhe — ein Gigant läuft in m/s schneller als ein Kitz. Die Stat-Achse zeigt sich im Weg JE EINHEIT seiner Größe
        // (Froude-gleich): das Kitz flink, der Gigant träge relativ zu seinem Leib.
        const ST = window.__tetrapodaCore;
        o.b1EinheitSmall = ST.tempoEinheit(r._kreaturHueftL(bSmall));
        o.b1EinheitBig = ST.tempoEinheit(r._kreaturHueftL(bBig));
        o.checks.b1MulDiff = o.b1MulSmall > o.b1MulBig * 1.1; // die Stat-Achse trägt ≥ 10 %
        o.checks.b1PathDiff = pathSmall / o.b1EinheitSmall > (pathBig / o.b1EinheitBig) * 1.1; // und sie IST Bewegung
        cleanup([bSmall, bBig]);
    
        // ── (B2) RADIUS-ACHSEN: die Leine liest Mut (fleeMul) × GRÖSSE (bodySize).
        // Die Tiere sind bewusst tag-identisch (Lehre 8) → die behaviorale
        // Radius-Differenz läuft über die sanktionierte GRÖSSEN-Achse (Kitz
        // vs. Gigant derselben Soul); die Mut-Achse (wehrhaft 28 vs. wild
        // ~24.7 Basis) wird als Konsum-Wert am Wolf mitgemessen. ──
        const spotShy = findSpot(90, 2.9);
        const spotBold = findSpot(90, -2.9);
        if (!spotShy || !spotBold) return { error: "kein Land-Spot (B2)" };
        const shy = spawn(spotShy, "wesen", 0.6); // Kitz (scheu) → Leine ~4,8 m
        const bold = spawn(spotBold, "wesen", 2.4); // Gigant → Leine ~67.2 m
        if (!shy || !bold) return { error: "Spawn (B2) fehlgeschlagen" };
        o.b2TempShy = r._creatureTemperament(shy);
        o.b2TempBold = r._creatureTemperament(bold);
        o.b2LeashShy = r._creatureMoveCharacter(shy).leashM;
        o.b2LeashBold = r._creatureMoveCharacter(bold).leashM;
        o.checks.b2LeashDiff = o.b2LeashBold - o.b2LeashShy >= 25;
        // Mut-Achsen-KONSUM: das Temperament der Gattung — der scheue Hirsch (fleeMul 1,7, Mut 0)
        // hält eine kürzere Basis-Leine als der wilde Wolf (0,7) — fleeMul wird gelesen.
        const wolfProbe = spawn(spotShy, "wolf", 1);
        const deerProbe = spawn(spotBold, "wesen", 1);
        o.b2LeashWolf = wolfProbe ? r._creatureMoveCharacter(wolfProbe).leashM : null;
        o.b2LeashDeer = deerProbe ? r._creatureMoveCharacter(deerProbe).leashM : null;
        o.checks.b2MutConsumed =
            Number.isFinite(o.b2LeashWolf) && Number.isFinite(o.b2LeashDeer) && o.b2LeashWolf - o.b2LeashDeer >= 2;
        cleanup([wolfProbe, deerProbe]);
        // der Anker (Geburtsort) initialisiert lazy im KI-Takt des Leibs — gestaffelt am Index der Liste (unter dem Bestand
        // stehen bis zur Kappe Leiber der Welt davor, oekologie.K2#2): höchstens 8 Takte, bis beide ihn tragen
        for (let k = 0; k < 8 && !(shy.userData.wanderAnchor && bold.userData.wanderAnchor); k++) tick(1, 0.05);
        const anchShy = shy.userData.wanderAnchor;
        const anchBold = bold.userData.wanderAnchor;
        if (!anchShy || !anchBold) return { error: "Anker nicht initialisiert" };
        // beide 45 m vom Anker aussetzen (jenseits der Kitz-Leine 4,8, klar
        // innerhalb der Gigant-Leine 67.2) — RADIAL vom Spieler weg, damit die
        // Distanz nie unter das 70-m-Raycast-Fenster fällt (Kopf-Disziplin).
        const outDir = (anch) => {
            const dx = anch.x - pm.x,
                dz = anch.z - pm.z,
                d = Math.hypot(dx, dz) || 1;
            return { x: dx / d, z: dz / d };
        };
        const oS = outDir(anchShy),
            oB = outDir(anchBold);
        shy.position.set(anchShy.x + oS.x * 45, shy.position.y, anchShy.z + oS.z * 45);
        bold.position.set(anchBold.x + oB.x * 45, bold.position.y, anchBold.z + oB.z * 45);
        tick(400, 0.05); // 20 s Sim
        o.b2DistShy = distXZ(shy, anchShy);
        o.b2DistBold = distXZ(bold, anchBold);
        // harte Schranke der Leine: leash × (1 + wanderSpeedMul/anchorPull) ≈ 1.375× ≈ 23.1
        o.checks.b2ShyReturns = o.b2DistShy < 26;
        o.checks.b2BoldRoams = o.b2DistBold > 30 && o.b2DistBold > o.b2DistShy + 4; // frei — keine Leine unter 67 m
        cleanup([shy, bold]);
    
        // ── (D) LEIB AN LEIB, (E) TIER AM SPIELER, (F) LOCKSTEP, (C2) SELBST-TEST ──
        {
            const steuerRoh = A._steuerGesetz;
            const steht = Object.create(steuerRoh.call(A));
            steht.steuerSchritt = (st) => {
                st.v = 0;
            };
            const masse = (c) => r._leibMasse(c);
            const leib = {};
            const achse = (c) => {
                r._kreaturLeib(c, 0, leib);
                return {
                    ax: c.position.x - leib.fx * leib.halb,
                    az: c.position.z - leib.fz * leib.halb,
                    bx: c.position.x + leib.fx * leib.halb,
                    bz: c.position.z + leib.fz * leib.halb,
                    r: leib.radius,
                };
            };
            // der Abstand zweier Strecken in der Ebene (die Linse rechnet ihn selbst)
            const streckeAbstand = (P, Q) => {
                let best = Infinity;
                const N = 24;
                for (let i = 0; i <= N; i++) {
                    const px = P.ax + ((P.bx - P.ax) * i) / N;
                    const pz = P.az + ((P.bz - P.az) * i) / N;
                    const ux = Q.bx - Q.ax;
                    const uz = Q.bz - Q.az;
                    const ll = ux * ux + uz * uz;
                    const t = ll > 1e-12 ? Math.max(0, Math.min(1, ((px - Q.ax) * ux + (pz - Q.az) * uz) / ll)) : 0;
                    best = Math.min(best, Math.hypot(px - (Q.ax + ux * t), pz - (Q.az + uz * t)));
                }
                return best;
            };
            const stellen = (c, x, z) => {
                c.position.set(x, r.getTerrainHeightAt(x, z), z);
                c.rotation.y = Math.PI / 2; // die Achse längs +x
                c.userData._steuer = { gier: Math.PI / 2, v: 0 };
                c.userData._stossV = null;
            };
            const vx = (c) => (c.userData._stossV ? c.userData._stossV.x : 0);
            const leibProbe = (stoesserSeele, zielSeele, v0) => {
                const spot = findSpot(115, 2.6);
                if (!spot) return null;
                // ruhige Tiere (ein frohes hüpft und verlässt die Höhe des Leibs)
                const a = r.spawnCreatureAt(spot.x, spot.y, spot.z, "calm", stoesserSeele, {
                    precise: true,
                    bodySize: 1,
                });
                const b = r.spawnCreatureAt(spot.x, spot.y, spot.z, "calm", zielSeele, {
                    precise: true,
                    bodySize: 1,
                });
                if (!a || !b) return null;
                stellen(a, spot.x, spot.z);
                r._kreaturLeib(a, 0, leib);
                const reichA = leib.halb + leib.radius;
                r._kreaturLeib(b, 0, leib);
                stellen(b, spot.x + reichA + leib.halb + leib.radius + 0.8, spot.z);
                a.userData._stossV = { x: v0, z: 0 };
                const res = { minAbstand: Infinity, dvStoesser: 0, dvZiel: 0, massen: null, kontakt: -1 };
                // die Reibung eines Takts (μ·g·dt, μ des Stoffs unter ihm) nimmt dem gleitenden Stoßer auch im Stoß-Takt Fahrt — sie zählt nicht
                const reib = (r._stoff(r._kontaktStoffAt(spot.x, spot.z, spot.y)).mu * Math.abs(s.gravity)) / 60;
                const mA = masse(a);
                const mB = masse(b);
                res.massen = mA > 0 && mB > 0 ? mB / mA : null;
                A._steuerGesetz = () => steht;
                try {
                    let vaVor = vx(a);
                    for (let k = 0; k < 120; k++) {
                        takt(1 / 60);
                        const PA = achse(a);
                        const PB = achse(b);
                        res.minAbstand = Math.min(res.minAbstand, streckeAbstand(PA, PB) - PA.r - PB.r);
                        if (res.kontakt < 0 && vx(b) > 1e-6) {
                            res.kontakt = k;
                            res.dvZiel = vx(b);
                            res.dvStoesser = vaVor - vx(a) - (vaVor > reib ? reib : 0);
                        }
                        vaVor = vx(a);
                    }
                } finally {
                    A._steuerGesetz = steuerRoh;
                }
                res.lage = [a.position.x, a.position.z, b.position.x, b.position.z];
                cleanup([a, b]);
                return res;
            };
            o.leib = {
                fuchsBaer: leibProbe("fuchs", "baer", 4),
                baerFuchs: leibProbe("baer", "fuchs", 4),
            };
            // (F) LOCKSTEP: dieselbe Probe noch einmal — dieselben Lagen
            const zweit = leibProbe("fuchs", "baer", 4);
            const erst = o.leib.fuchsBaer;
            const abw = erst && zweit ? Math.max(...erst.lage.map((x, i) => Math.abs(x - zweit.lage[i]))) : NaN;
            o.leib.lockstep = abw === 0;
            o.leib.lockstepAbw = abw;
            // (E) TIER AM SPIELER: ein Wolf mit 4 m/s gegen den stehenden Spieler
            {
                const pmM = s.playerMesh;
                // der Spieler steht für die Probe auf dem Boden eines freien Flecks (im Gate steht er auf der Plattform
                // über dem Gelände — ohne gemeinsame Höhe berührt ihn kein Leib); danach zurück
                const pmAlt = pmM.position.clone();
                const spotE = findSpot(120, -2.6);
                if (spotE)
                    pmM.position.set(
                        spotE.x,
                        r.getTerrainHeightAt(spotE.x, spotE.z) + A.PLAYER_FOOT_OFFSET,
                        spotE.z
                    );
                const w0 = { x: pmM.position.x - 2.2, y: pmM.position.y, z: pmM.position.z };
                const w = r.spawnCreatureAt(w0.x, w0.y, w0.z, "calm", "wolf", { precise: true, bodySize: 1 });
                if (w) {
                    stellen(w, w0.x, w0.z);
                    w.userData._stossV = { x: 4, z: 0 };
                    s.playerVel.setValue(0, s.playerVel.y(), 0);
                    const sp = { minAbstand: Infinity, dvSpieler: 0 };
                    A._steuerGesetz = () => steht;
                    try {
                        for (let k = 0; k < 90; k++) {
                            takt(1 / 60);
                            const PW = achse(w);
                            const PS = {
                                ax: pmM.position.x,
                                az: pmM.position.z,
                                bx: pmM.position.x,
                                bz: pmM.position.z,
                                r: A.PLAYER_WALL_RADIUS,
                            };
                            sp.minAbstand = Math.min(sp.minAbstand, streckeAbstand(PW, PS) - PW.r - PS.r);
                            sp.dvSpieler = Math.max(sp.dvSpieler, Math.hypot(s.playerVel.x(), s.playerVel.z()));
                        }
                    } finally {
                        A._steuerGesetz = steuerRoh;
                    }
                    s.playerVel.setValue(0, s.playerVel.y(), 0);
                    cleanup([w]);
                    o.leib.spieler = sp;
                }
                pmM.position.copy(pmAlt);
            }
            // (C2) SELBST-TEST: ohne Leib-Kontakt durchdringt der Fuchs den Bären ohne Impuls
            r._leibKontakte = function () {};
            try {
                o.leibOhne = leibProbe("fuchs", "baer", 4);
            } finally {
                delete r._leibKontakte;
            }
        }
    
        s.maxCreatures = saveMax;
        o.creaturesAfter = s.creatures.length;
        return o;
    });
    if (!out || out.error) return check("Tier-Separation: die Bühne steht", false, out ? out.error : "keine Antwort der Seite");
    const c = out.checks || {};
    const rot = (...k) => k.filter((x) => c[x] !== true).join(" · ");
    const a = rot("aStacked0", "aSeparated", "aBounded", "cLensFires");
    check(`Tier-Separation (A)(C): das deckungsgleiche Paar trennt sich nach 200 Ticks (${out.aGap && out.aGap.toFixed(2)} m > ${out.aBodyRadius} m), beschränkt; der Selbsttest feuert`, !a, a && "ROT: " + a);
    const b = rot("b1MulDiff", "b1PathDiff", "b2LeashDiff", "b2MutConsumed", "b2ShyReturns", "b2BoldRoams");
    check("Tier-Separation (B): Größe und Mut werden KONSUMIERT — verschiedene speedMul und Weg-Längen, verschiedene Leinen, das scheue kehrt heim, das kühne streift", !b, b && "ROT: " + b);
    const L = out.leib || {};
    const lv = leibVerdict(L);
    check("Tier-Separation 0710-4 (D–F) LEIB AN LEIB: keine Durchdringung, Impuls nach Masse, der Spieler bekommt seinen Stoß, Lockstep", lv.length === 0, lv.join(" · "));
    const lvOhne = out.leibOhne ? leibVerdict({ fuchsBaer: out.leibOhne, baerFuchs: L.baerFuchs, spieler: L.spieler, lockstep: true }) : [];
    const lvAlt = leibVerdict({
        fuchsBaer: { minAbstand: -0.9, dvStoesser: 0, dvZiel: 0, massen: 22 },
        baerFuchs: { minAbstand: -0.9, dvStoesser: 0, dvZiel: 0, massen: 0.045 },
        spieler: { minAbstand: -0.6, dvSpieler: 0 },
        lockstep: true,
    });
    const lvGut = leibVerdict({
        fuchsBaer: { minAbstand: 0, dvStoesser: 4.2, dvZiel: 0.19, massen: 22.4 },
        baerFuchs: { minAbstand: 0, dvStoesser: 0.19, dvZiel: 4.2, massen: 0.045 },
        spieler: { minAbstand: 0, dvSpieler: 2.7 },
        lockstep: true,
    });
    check(
        "Tier-Separation SELBSTTEST (C2)(D): ohne Leib-Kontakt nennt die Linse Durchdringung und fehlenden Impuls; der alte Befund wird rot, ein Stoß nach Masse bleibt grün",
        !!out.leibOhne && lvOhne.some((x) => x.startsWith("leib-durchdringung")) && lvOhne.some((x) => x.startsWith("leib-ohne-impuls")) && lvGut.length === 0 && ["leib-durchdringung", "leib-ohne-impuls", "leib-spieler"].every((t) => lvAlt.some((x) => x.startsWith(t))),
        out.leibOhne ? lvOhne.slice(0, 2).join(" · ") : "kein Leib-Kontakt zum Abschalten (_leibKontakte fehlt)"
    );
}

// Die Kreatur kostet, was man von ihr sieht — eingefaltet aus gate:kreatur-kosten (D3b, Orakel-Synthese Tier-1 #2: „Konsum
// verdrahten, nicht neu bauen"): am ECHTEN Chokepoint (updateCreatures / _p2pUpdatePeer): (A) die Anim-Raten-Leiter nach Distanz
// (voll · 1/2 · 1/4 · jenseits der Grenze gar nicht) · (B) jenseits der Grenze friert der Baum in der Kern-STAND_POSE · (C) die
// gelenkige Grobstufe des Menschen, der EINE Stufen-Schalter, der echte Peer-Tick · (R) Starr-Bindung + Körper-Kugel · (F) Mensch
// und Kopie ruhen · (G) die Ruhe der Leiber (Leser, Erwachen, Nah-Gestalt, Feld, Bild, KI) · (T)(W) · Selbsttests S1–S11.
async function checkBandKreaturKosten({ page, check }) {
    const out = await safeEvaluate(page, async () => {
        const s = st,
            A = AnazhRealm;
        const o = { checks: {} };
        const pm = s.playerMesh && s.playerMesh.position;
        if (!pm) return { error: "kein Spieler" };
        const core = window.__tetrapodaCore;
        if (!core || !Array.isArray(core.STAND_POSE)) return { error: "tetrapoda-Kern kalt (STAND_POSE fehlt)" };
        const SP = core.STAND_POSE;
    
        const saveMax = s.maxCreatures;
        s.maxCreatures = Math.max(saveMax || 0, s.creatures.length + 6);
        const spawnAt = (dx, dz) => {
            const x = pm.x + dx,
                z = pm.z + dz;
            const h = r.getTerrainHeightAt(x, z);
            return r.spawnCreatureAt(x, (Number.isFinite(h) ? h : 0) + 1, z, "happy", "wesen", {
                precise: true,
                bodySize: 1,
            });
        };
        const cleanup = (list) => list.forEach((c) => c && r.removeCreature(c));
        // Gelenk-Abweichung von der Kern-STAND_POSE (Ketten-Ordnung =
        // _animateTierBaum — die EINE Ketten-Wahrheit des Baums).
        const maxDev = (c) => {
            const tb = c.userData && c.userData._tierBaum;
            if (!tb || !tb.teile) return null;
            const T = tb.teile;
            const ketten = [
                [T.legFL, T.flU, T.flL, T.flP],
                [T.legFR, T.frU, T.frL, T.frP],
                [T.legHL, T.hlT, T.hlC, T.hlP],
                [T.legHR, T.hrT, T.hrC, T.hrP],
            ];
            let dev = 0;
            for (let i = 0; i < 4; i++) {
                for (let k = 0; k < 4; k++) {
                    if (!ketten[i][k]) continue;
                    dev = Math.max(dev, Math.abs(ketten[i][k].rotation.x - SP[i][k]));
                }
            }
            return dev;
        };
    
        // ── (A) ANIM-RATEN-LOD: vier Proben, exakt in die Bänder gepinnt ──
        const p0 = spawnAt(30, 0); // Platzhalter-Position; das Pinnen setzt die Wahrheit
        if (!p0) return { error: "Spawn fehlgeschlagen" };
        const fL = p0.scale.x || 1;
        // die Stufen-Grenze aus der Kern-Zeile (`ab` × Größe, S3) — dieselbe, die der Schalter liest
        const fern = window.__tetrapodaCore.PORTAL_RENDER_CONFIG.lod.budget.kreatur[1].ab * fL;
        o.fernDist = fern;
        const dists = { voll: 0.4 * fern, halb: 0.6 * fern, viertel: 0.83 * fern, hinter: 1.25 * fern };
        const winkel = { voll: 0, halb: Math.PI / 2, viertel: Math.PI, hinter: -Math.PI / 2 };
        const probes = { voll: p0 };
        for (const tag of ["halb", "viertel", "hinter"]) {
            probes[tag] = spawnAt(dists[tag], 0);
            if (!probes[tag]) return { error: "Spawn (" + tag + ") fehlgeschlagen" };
        }
        const pin = () => {
            for (const tag of Object.keys(probes)) {
                probes[tag].position.x = pm.x + Math.cos(winkel[tag]) * dists[tag];
                probes[tag].position.z = pm.z + Math.sin(winkel[tag]) * dists[tag];
            }
        };
        for (const tag of Object.keys(probes)) probes[tag].userData._probeTag = tag;
        // nur die Proben im Nah-Kreis: die Tiere der Welt (der Bestand zeichnet bis zur Kappe) nähmen ihnen die Plätze der
        // nahLeiber, und eine Probe im Tier-Satz zeichnet keinen Baum
        const welt = s.creatures.filter((c) => !Object.values(probes).includes(c));
        for (const c of welt) s.creatures.splice(s.creatures.indexOf(c), 1);
        pin();
        const savedACM = r._animateCompoundMotion;
        let counts = { voll: 0, halb: 0, viertel: 0, hinter: 0 };
        r._animateCompoundMotion = function (group) {
            const tag = group && group.userData && group.userData._probeTag;
            if (tag) counts[tag]++;
            return savedACM.apply(this, arguments);
        };
        const N = 100;
        for (let k = 0; k < N; k++) {
            r.updateCreatures(0.02);
            pin();
        }
        o.counts = Object.assign({}, counts);
        o.checks.aVoll = counts.voll === N; // nah = JEDER Frame
        o.checks.aHalb = counts.halb <= N * 0.55 && counts.halb >= N * 0.4; // exakt 1/2 (Stagger-treu)
        o.checks.aViertel = counts.viertel <= N * 0.3 && counts.viertel >= N * 0.15; // exakt 1/4
        o.checks.aHinter = counts.hinter === 0; // jenseits der Grenze: GAR nicht
        o.checks.aFernOrdnung = counts.halb <= counts.voll / 2 + 1 && counts.viertel <= counts.halb / 2 + 1;
        o.hinterEingefroren = probes.hinter.userData._animEingefroren === true;
        o.checks.aEingefroren = o.hinterEingefroren;
    
        // ── (S1) SELBST-TEST Zähl-Linse: Leiter gestubbt (≡ 1) → hinter tickt voll ──
        const savedDiv = r._creatureAnimDiv;
        r._creatureAnimDiv = function () {
            return 1;
        };
        counts = { voll: 0, halb: 0, viertel: 0, hinter: 0 };
        const NS = 20;
        for (let k = 0; k < NS; k++) {
            r.updateCreatures(0.02);
            pin();
        }
        r._creatureAnimDiv = savedDiv; // restaurieren (Gate-Hook-Lehre)
        o.s1Hinter = counts.hinter;
        o.checks.s1LensFires = counts.hinter === NS; // ohne Leiter tickt auch hinter voll
    
        // ── (B) NEUTRALE STANCE: mid-step posieren → jenseits der Grenze einfrieren ──
        const probeS = probes.voll;
        const roles = r._motionRolesForSoul(probeS.userData.soul);
        // Gehen heißt WEG (das Gang-Gesetz): der Schritt-Schwung folgt der Lage-Änderung des Leibs — die
        // Probe läuft 20 Takte mit 1,6 m/s (ein einzelner Ruf ohne Weg steht).
        const schreite = (pr) => {
            const g0 = pr.userData._tierBaum._gang;
            let tS = (g0 ? g0.lastT : 0) + 1 / 30;
            for (let k = 0; k < 20; k++) {
                pr.position.x += 1.6 / 30;
                savedACM.call(r, pr, roles, tS, 1.3 + 0.17 * k, true, null);
                tS += 1 / 30;
            }
        };
        probeS.userData._animFade = 1;
        schreite(probeS); // moving → Schritt-Schwung
        o.devMid = maxDev(probeS);
        o.checks.bMidStepPremise = Number.isFinite(o.devMid) && o.devMid > 0.05; // Prämisse: WAR mid-step
        // jenseits der Grenze pinnen + ticken → der Freeze-Pfad greift
        probeS.userData._animEingefroren = false;
        dists.voll = 1.25 * fern;
        pin();
        for (let k = 0; k < 3; k++) {
            r.updateCreatures(0.02);
            pin();
        }
        o.devFrozen = maxDev(probeS);
        const tsS = probeS.userData._tierBaum.tailSegs || [];
        o.tailDev = tsS.reduce((m, seg) => Math.max(m, Math.abs(seg.rotation.y)), 0);
        o.checks.bNeutralStance = Number.isFinite(o.devFrozen) && o.devFrozen < 0.02; // Stand-Winkel, kein Mid-Step
        o.checks.bTailNeutral = o.tailDev < 0.02;
        o.checks.bFrozen = probeS.userData._animEingefroren === true;
    
        // ── (S2) SELBST-TEST Stance-Linse: Neutral-Stance gestubbt → bleibt mid-step ──
        dists.voll = 0.4 * fern;
        pin();
        r.updateCreatures(0.02); // aufwachen (div 1 → Anim läuft, Flag fällt)
        pin();
        probeS.userData._animFade = 1;
        schreite(probeS); // wieder mid-step
        const devRePose = maxDev(probeS);
        const savedNS = r._tierBaumNeutralStance;
        r._tierBaumNeutralStance = function () {};
        probeS.userData._animEingefroren = false;
        dists.voll = 1.25 * fern;
        pin();
        for (let k = 0; k < 2; k++) {
            r.updateCreatures(0.02);
            pin();
        }
        r._tierBaumNeutralStance = savedNS; // restaurieren (Gate-Hook-Lehre)
        o.devStub = maxDev(probeS);
        o.checks.s2LensFires = Number.isFinite(devRePose) && devRePose > 0.05 && o.devStub > 0.05;
        cleanup([probes.voll, probes.halb, probes.viertel, probes.hinter]);
        s.creatures.push(...welt);
        s.maxCreatures = saveMax;
    
        // ── (C) DIE GELENK-GESTALT DES MENSCHEN: die Grobstufe gebaut + am ECHTEN Peer-Tick über den EINEN Schalter ──
        const g = r._buildHumanGroup();
        const mf = g && g.userData && g.userData._gelenk;
        o.checks.cFernGebaut = !!(mf && mf.nah && mf.fern);
        // die Stufen eines Zustands: nah = die feine sichtbar, die Grobstufe nur in den Kaskaden; fern = umgekehrt
        // (K72: der Wurf ist die Ebene SHADOW_TWIN_LAYER — nah liegt kein Teil der Grobstufe auf Ebene 0, ihre werfenden
        // Teile liegen auf der Wurf-Ebene, und ist sie der Zwilling, wirft mindestens eins)
        const istNah = () =>
            mf.istFern === false &&
            mf.nah.visible === true &&
            mf.meshes.every((m) => !m.layers.isEnabled(0) && m.castShadow === m.layers.isEnabled(A.SHADOW_TWIN_LAYER)) &&
            (!mf.zwilling || mf.meshes.some((m) => m.layers.isEnabled(A.SHADOW_TWIN_LAYER)));
        const istFern = () =>
            mf.istFern === true && mf.nah.visible === false && mf.meshes.every((m) => m.layers.isEnabled(0));
        if (mf && mf.nah && mf.fern) {
            const stat = (node) => {
                let m = 0,
                    v = 0;
                node.traverse((n) => {
                    if ((n.isMesh || n.isSkinnedMesh) && n.geometry) {
                        m++;
                        const p = n.geometry.attributes && n.geometry.attributes.position;
                        if (p) v += p.count;
                    }
                });
                return { m, v };
            };
            o.nahStat = stat(mf.nah);
            o.fernStat = stat(mf.fern);
            o.checks.cVertexDiff = o.fernStat.v > 0 && o.fernStat.v < o.nahStat.v * 0.8; // messbar leichter
            o.checks.cMeshDiff = o.fernStat.m < o.nahStat.m; // weniger Draws
            // der EINE Stufen-Schalter (Grenze `ab` aus der Kern-Zeile)
            r._gelenkStufe(g, mf.abM * mf.abM * 4);
            const t1 = istFern();
            r._gelenkStufe(g, 4);
            const t2 = istNah();
            o.checks.cToggle = t1 && t2;
            // der ECHTE Konsument: _p2pUpdatePeer schaltet am Distanz-Band
            const entry = {
                mesh: g,
                x: pm.x + 80,
                y: pm.y + 1,
                z: pm.z,
                yaw: 0,
                meshKind: "soul",
                soulName: "human",
                walkPhase: 0,
                lastMovedAt: 0,
            };
            r._p2pUpdatePeer(entry, performance.now() / 1000, 0.016);
            o.checks.cPeerFern = istFern();
            entry.x = pm.x + 5;
            r._p2pUpdatePeer(entry, performance.now() / 1000, 0.016);
            o.checks.cPeerNah = istNah();
        }
    
        // ── (R) STARR-BINDUNG + KÖRPER-KUGEL ──
        const T3 = window.THREE;
        const recW = A.TETRAPODA_SOUL_MAP && A.TETRAPODA_SOUL_MAP.wolf;
        const starrZensus = (root) => {
            const z = { meshes: 0, skins: 0, unverschmolzen: 0, ungecullt: 0, ohneKugel: 0, breit: [] };
            const seen = new Set();
            root.traverse((n) => {
                if (!n.isMesh || !n.geometry) return;
                z.meshes++;
                // (T) SCHMAL: ein Index über ≤ 65 535 Vertices trägt 16 bit, ein Haut-Gewicht unorm16
                const gs = n.geometry;
                const nV = gs.attributes.position ? gs.attributes.position.count : 0;
                if (gs.index && nV <= 65535 && gs.index.array.BYTES_PER_ELEMENT !== 2)
                    z.breit.push(`Index ${gs.index.array.constructor.name} über ${nV} Vertices`);
                const sw = gs.attributes.skinWeight;
                if (sw && !(sw.array instanceof Uint16Array && sw.normalized === true))
                    z.breit.push(`Haut-Gewicht ${sw.array.constructor.name}${sw.normalized ? " normiert" : ""}`);
                if (n.isSkinnedMesh) {
                    z.skins++;
                    if (n.frustumCulled === false) z.ungecullt++;
                    if (!n.boundingSphere) z.ohneKugel++;
                    return;
                }
                const g = n.geometry;
                const sig = Object.keys(g.attributes)
                    .sort()
                    .map((k) => k + ":" + g.attributes[k].itemSize)
                    .join(",");
                const key = (n.material && n.material.uuid) + "|" + (n.castShadow ? 1 : 0) + "|" + sig;
                if (seen.has(key)) z.unverschmolzen++;
                else seen.add(key);
            });
            return z;
        };
        const wolfT = recW ? r._ofenKreaturTemplate(recW, null, 0) : null;
        o.rWolf = wolfT ? starrZensus(wolfT.root) : null;
        const gM = r._buildHumanGroup();
        const mfM = gM && gM.userData && gM.userData._gelenk;
        o.rMensch = mfM && mfM.nah ? starrZensus(mfM.nah) : null;
        o.checks.rWolfStarr = !!o.rWolf && o.rWolf.unverschmolzen === 0 && o.rWolf.skins >= 2;
        o.checks.rMenschStarr = !!o.rMensch && o.rMensch.unverschmolzen === 0;
        o.checks.rKugel =
            !!o.rWolf &&
            !!o.rMensch &&
            o.rWolf.ungecullt + o.rWolf.ohneKugel + o.rMensch.ungecullt + o.rMensch.ohneKugel === 0;
        // POSE-PROBE: ein Wolf im Gang — jede sichtbare Hülle bleibt Vertex für Vertex in ihrer Kugel
        let raus = 0,
            geprueft = 0,
            maxUeber = 0;
        // DER ZWILLING TRÄGT DAS SKELETT DER NAHEN (S3): jedes Mesh der Grobstufe ist geskinnt, und seine Knochen SIND die
        // Knochen der L0 (Identität je Name) — EIN Skelett je Gestalt; im Gang bleibt auch er in seiner Kugel.
        const zw = { meshes: 0, geskinnt: 0, knochen: 0, fremd: 0, geprueft: 0 };
        const wp = spawnAt(6, 0);
        if (wp && wp.userData && wp.userData._tierBaum) {
            const v = new T3.Vector3();
            let l1Geo = null;
            wp.traverse((n) => {
                for (const vl of n.__ofenVorlagen || [])
                    if (vl && vl.__ofen && String(vl.__ofen.key).split("|")[1] === "1") {
                        l1Geo = new Set();
                        vl.root.traverse((q) => {
                            if (q.isMesh && q.geometry) l1Geo.add(q.geometry);
                        });
                    }
            });
            const teileL0 = wp.userData._tierBaum.teile || {};
            wp.traverse((n) => {
                if (!n.isMesh || !l1Geo || !l1Geo.has(n.geometry)) return;
                zw.meshes++;
                if (!n.isSkinnedMesh || !n.skeleton) return;
                zw.geskinnt++;
                for (const b of n.skeleton.bones) {
                    zw.knochen++;
                    if (teileL0[b.name] !== b) zw.fremd++;
                }
            });
            for (let k = 0; k < 24; k++) {
                wp.position.x += 1.6 * 0.07; // der Gang folgt dem Weg (1,6 m/s)
                r._animateTierBaum(wp, k * 0.07, k * 0.35, true, null);
                wp.updateMatrixWorld(true);
                wp.traverse((n) => {
                    if (!n.isSkinnedMesh || !n.boundingSphere) return;
                    if (l1Geo && l1Geo.has(n.geometry)) zw.geprueft++;
                    const kugel = n.boundingSphere.clone().applyMatrix4(n.matrixWorld);
                    const pos = n.geometry.attributes.position;
                    for (let i = 0; i < pos.count; i += 3) {
                        n.getVertexPosition(i, v);
                        v.applyMatrix4(n.matrixWorld);
                        const d = v.distanceTo(kugel.center) - kugel.radius;
                        geprueft++;
                        if (d > 0) {
                            raus++;
                            if (d > maxUeber) maxUeber = d;
                        }
                    }
                });
            }
            r.removeCreature(wp);
        }
        o.rPose = { geprueft, raus, maxUeber };
        o.checks.rPoseInKugel = geprueft > 1000 && raus === 0;
        o.rZwilling = zw;
        o.checks.rZwillingKnochen =
            zw.meshes > 0 && zw.geskinnt === zw.meshes && zw.knochen > 0 && zw.fremd === 0 && zw.geprueft > 0;
        // (S3) SELBST-TEST: ohne Starr-Bindung zählt die Linse die unverschmolzenen Teile
        const saveStarr = A._ofenStarrBinden;
        const saveMemo = A._tierOfenMemo;
        A._ofenStarrBinden = function () {};
        A._tierOfenMemo = new Map();
        const wolfRoh = recW ? r._ofenKreaturTemplate(recW, null, 0) : null;
        o.s3Roh = wolfRoh ? starrZensus(wolfRoh.root) : null;
        A._ofenStarrBinden = saveStarr; // restaurieren (Gate-Hook-Lehre)
        A._tierOfenMemo = saveMemo;
        o.checks.s3LensFires = !!o.s3Roh && o.s3Roh.unverschmolzen > 0;
        // (T) SCHMAL (W7): r184 weitet jeden 16-bit-Index auf 32 bit (der Stamm hält ihn schmal, `_backendGesetz`), die Foundry
        // lieferte Uint32-Indizes und float32-Haut-Gewichte — der Spieler trug 8 MB, 1,7 MB davon Breite ohne Gewinn.
        o.checks.tSchmal = !!o.rWolf && !!o.rMensch && o.rWolf.breit.length === 0 && o.rMensch.breit.length === 0;
        // (S4) SELBST-TEST: mit den alten Formen (Index wie geliefert, Gewicht float32) nennt die Linse die Breite
        const saveSchmal = A._indexSchmal;
        const saveGewicht = A._hautGewicht;
        A._indexSchmal = (arr) => arr;
        A._hautGewicht = (arr, is) =>
            new T3.BufferAttribute(arr instanceof Float32Array ? arr : Float32Array.from(arr), is || 4);
        A._tierOfenMemo = new Map();
        const wolfBreit = recW ? r._ofenKreaturTemplate(recW, null, 0) : null;
        o.s4Breit = wolfBreit ? starrZensus(wolfBreit.root).breit : null;
        A._indexSchmal = saveSchmal; // restaurieren (Gate-Hook-Lehre)
        A._hautGewicht = saveGewicht;
        A._tierOfenMemo = saveMemo;
        o.checks.s4LensFires = !!o.s4Breit && o.s4Breit.length > 0;
    
        // ── (W) DER WERFER JE GESTALT (S3, Lehre 19): die Kern-Zeile sagt, welche Stufe wirft (`schatten`) und welcher
        // Teil von ihr (`wurf.seh`). Gezählt wird, was die Kaskaden zeichnen: jedes Mesh der Gestalt mit castShadow, dessen
        // Kette sichtbar ist und dessen Ebenen die Kaskaden-Maske treffen (Layer 0 oder SHADOW_TWIN_LAYER) — nah (10 m ×
        // Größe) und mittel (45 m × Größe) nach dem ECHTEN Tick (updateCreatures, _p2pUpdatePeer). Das Soll des Wurf-Teils
        // rechnet phyto-core `budgetSippen` aus dem Ausgang des Ofens (`_ofenBudget`, Stufe 1, gefiltert nach `wurf.seh`).
        const T3W = T3;
        const PCW = window.__phytoCore;
        const maskeK = new T3W.Layers();
        maskeK.enable(A.SHADOW_TWIN_LAYER);
        const ketteSichtbar = (o, bis) => {
            for (let p = o; p; p = p.parent) {
                if (p.visible === false) return false;
                if (p === bis) return true;
            }
            return true;
        };
        const dreieckeVon = (geo) => (geo.index ? geo.index.count / 3 : geo.attributes.position.count / 3);
        const geoMenge = (root) => {
            const m = new Set();
            root.traverse((n) => {
                if (n.isMesh && n.geometry) m.add(n.geometry);
            });
            return m;
        };
        // die Vorlagen eines Leibs (das Memo meldet sie am Leib an: `_ofenVorlagenBinden`) je Stufe
        const vorlagenVon = (gruppe) => {
            const je = {};
            gruppe.traverse((n) => {
                for (const v of n.__ofenVorlagen || [])
                    if (v && v.__ofen && v.root) je[String(v.__ofen.key).split("|")[1]] = v;
            });
            return je;
        };
        const werferVon = (gruppe, l0, l1) => {
            const w = { tris: 0, draws: 0, l0: 0, l0Tris: 0, l1: 0, fremd: 0 };
            gruppe.traverse((n) => {
                if (!n.isMesh || !n.geometry || n.castShadow !== true || !n.layers.test(maskeK)) return;
                if (!ketteSichtbar(n, gruppe)) return;
                const t = dreieckeVon(n.geometry);
                w.tris += t;
                w.draws++;
                if (l0.has(n.geometry)) {
                    w.l0++;
                    w.l0Tris += t;
                } else if (l1.has(n.geometry)) w.l1++;
                else w.fremd++;
            });
            return w;
        };
        // Das Budget je Gestalt und Pass (Plan §3.5, Soll-Bild): der Zwilling ist der Wurf-Teil der Grobstufe.
        const WURF_SOLL = { kreatur: { draws: 1, tris: 6200 }, koerper: { draws: 5, tris: 38000 } };
        const budgetFang = new Map();
        const saveBudget = r._ofenBudget;
        const saveMemoW = A._tierOfenMemo;
        const saveFrustumW = r.isInFrustum;
        r._ofenBudget = function (core, kind, lod) {
            const aus = saveBudget.apply(this, arguments);
            budgetFang.set(kind + "|" + (lod | 0), aus);
            return aus;
        };
        r.isInFrustum = function () {
            return true; // der Stufen-Schalter läuft nur im Bild — für die Messung immer „im Bild"
        };
        A._tierOfenMemo = new Map(); // ein frischer Guss je Gestalt: der Ausgang des Ofens wird gefangen
        const wurfTeil = (core, kind) => {
            const B = core && core.PORTAL_RENDER_CONFIG && core.PORTAL_RENDER_CONFIG.lod.budget[kind];
            const z1 = B && B[1];
            const seh = z1 && z1.wurf && Array.isArray(z1.wurf.seh) ? z1.wurf.seh : null;
            const aus = budgetFang.get(kind + "|1");
            if (!seh || !aus) return { fehlt: !seh ? "wurf.seh fehlt an der Stufe 1" : "kein Ausgang der Stufe 1" };
            const teil = aus.filter((m) => m && m.position && m.mat && seh.indexOf(m.mat.seh) >= 0);
            return Object.assign({ seh }, PCW.budgetSippen(teil));
        };
        const urteil = (kind, B, stufe, w, soll) => {
            const st = B[stufe] && Number.isInteger(B[stufe].schatten) ? B[stufe].schatten : stufe;
            const zt = B[st] ? B[st].tris : 0;
            return (
                w.draws > 0 &&
                w.l0 === 0 &&
                w.fremd === 0 &&
                w.draws <= WURF_SOLL[kind].draws &&
                w.tris <= WURF_SOLL[kind].tris &&
                w.tris <= zt &&
                !soll.fehlt &&
                w.tris === soll.tris &&
                w.draws <= soll.draws
            );
        };
        // (W) DECKUNG — der Zwilling wirft den Umriss der feinen Stufe (das Spike-Soll, Lehre 18; Gegenprüfung S3: der
        // Wurf-Umriss der Grobstufe lag am Wolf 7 % unter dem der feinen, Lauf und Pfote fehlten). Je Gestalt in der
        // Stand-Pose und drei Gang-Posen (der echte Gang-Chokepoint), je Sonne (seitlich 25° und 45°, schräg 35°, hoch
        // 75°): der Umriss der Werfer, entlang der Sonne auf den Boden projiziert und auf 1 cm gerastert, gegen den
        // Umriss der feinen Stufe, wie sie vor S3 warf (ihre Teile nach dem Wurf-Gesetz des Ofens: alles ausser den
        // Fell-Schalen) — dieselben Knochen, dieselbe Pose (getVertexPosition: die Haut, wie der Renderer sie stellt).
        // Täter = das Gelenk, dessen Fläche der Zwilling nicht deckt.
        const DECKUNG_MIN = 0.94;
        const ZELLE_W = 0.01;
        const vW = new T3W.Vector3();
        const punkte = (meshes) =>
            meshes.map((m) => {
                const g = m.geometry,
                    pos = g.attributes.position,
                    n = pos.count;
                const P = new Float64Array(n * 3);
                for (let i = 0; i < n; i++) {
                    m.getVertexPosition(i, vW);
                    vW.applyMatrix4(m.matrixWorld);
                    P[i * 3] = vW.x;
                    P[i * 3 + 1] = vW.y;
                    P[i * 3 + 2] = vW.z;
                }
                const si = g.attributes.skinIndex,
                    sw = g.attributes.skinWeight;
                const knochen = (i) => {
                    if (!si || !m.skeleton) return m.name || "starr";
                    let b = 0,
                        bw = -1;
                    for (let k = 0; k < 4; k++) {
                        const w = sw.getComponent(i, k);
                        if (w > bw) {
                            bw = w;
                            b = si.getComponent(i, k);
                        }
                    }
                    const bn = m.skeleton.bones[b];
                    return bn ? bn.name : "?";
                };
                return { P, idx: g.index ? g.index.array : null, n, knochen };
            });
        const umriss = (sets, L, y0, box, mitTaeter) => {
            const nx = Math.ceil((box[2] - box[0]) / ZELLE_W),
                nz = Math.ceil((box[3] - box[1]) / ZELLE_W);
            const M = new Uint8Array(nx * nz);
            const G = mitTaeter ? new Array(nx * nz) : null;
            const pr = (P, i) => {
                const t = (P[i * 3 + 1] - y0) / L.y;
                return [(P[i * 3] - L.x * t - box[0]) / ZELLE_W, (P[i * 3 + 2] - L.z * t - box[1]) / ZELLE_W];
            };
            for (const m of sets) {
                const nT = m.idx ? m.idx.length / 3 : m.n / 3;
                for (let t = 0; t < nT; t++) {
                    const i0 = m.idx ? m.idx[t * 3] : t * 3,
                        i1 = m.idx ? m.idx[t * 3 + 1] : t * 3 + 1,
                        i2 = m.idx ? m.idx[t * 3 + 2] : t * 3 + 2;
                    const a = pr(m.P, i0),
                        b = pr(m.P, i1),
                        c = pr(m.P, i2);
                    const d = (b[0] - a[0]) * (c[1] - a[1]) - (b[1] - a[1]) * (c[0] - a[0]);
                    if (Math.abs(d) < 1e-12) continue;
                    const x0 = Math.max(0, Math.floor(Math.min(a[0], b[0], c[0]))),
                        x1 = Math.min(nx - 1, Math.ceil(Math.max(a[0], b[0], c[0]))),
                        z0 = Math.max(0, Math.floor(Math.min(a[1], b[1], c[1]))),
                        z1 = Math.min(nz - 1, Math.ceil(Math.max(a[1], b[1], c[1])));
                    let wer = null;
                    for (let z = z0; z <= z1; z++)
                        for (let x = x0; x <= x1; x++) {
                            const px = x + 0.5,
                                pz = z + 0.5;
                            const w0 = ((b[0] - px) * (c[1] - pz) - (b[1] - pz) * (c[0] - px)) / d,
                                w1 = ((c[0] - px) * (a[1] - pz) - (c[1] - pz) * (a[0] - px)) / d;
                            if (w0 < 0 || w1 < 0 || 1 - w0 - w1 < 0) continue;
                            const id = x + nx * z;
                            M[id] = 1;
                            if (G && !G[id]) G[id] = wer || (wer = m.knochen(i0));
                        }
                }
            }
            return { M, G };
        };
        // je Pose die Punkte beider Sätze, je Sonne der Vergleich; schrumpf: der Selbst-Test zieht den Zwilling zur Mitte
        const deckungJe = (soll, ist, yaw, y0, schrumpf) => {
            const S = punkte(soll),
                I = punkte(ist);
            if (schrumpf) {
                let cx = 0,
                    cy = 0,
                    cz = 0,
                    n = 0;
                for (const m of I)
                    for (let i = 0; i < m.n; i++) {
                        cx += m.P[i * 3];
                        cy += m.P[i * 3 + 1];
                        cz += m.P[i * 3 + 2];
                        n++;
                    }
                for (const m of I)
                    for (let i = 0; i < m.n; i++) {
                        m.P[i * 3] = cx / n + (m.P[i * 3] - cx / n) * schrumpf;
                        m.P[i * 3 + 1] = cy / n + (m.P[i * 3 + 1] - cy / n) * schrumpf;
                        m.P[i * 3 + 2] = cz / n + (m.P[i * 3 + 2] - cz / n) * schrumpf;
                    }
            }
            const fx = Math.sin(yaw),
                fz = Math.cos(yaw),
                sx = Math.cos(yaw),
                sz = -Math.sin(yaw);
            const sonne = (ax, az, grad) => {
                const e = (grad * Math.PI) / 180,
                    l = Math.hypot(ax, az) || 1;
                return new T3W.Vector3((ax / l) * Math.cos(e), Math.sin(e), (az / l) * Math.cos(e));
            };
            const SONNEN = {
                seite25: sonne(sx, sz, 25),
                seite45: sonne(sx, sz, 45),
                schraeg35: sonne(sx + fx, sz + fz, 35),
                hoch75: sonne(sx, sz, 75),
            };
            const out = [];
            for (const [name, L] of Object.entries(SONNEN)) {
                const box = [1e9, 1e9, -1e9, -1e9];
                for (const m of S.concat(I))
                    for (let i = 0; i < m.n; i++) {
                        const t = (m.P[i * 3 + 1] - y0) / L.y;
                        const gx = m.P[i * 3] - L.x * t,
                            gz = m.P[i * 3 + 2] - L.z * t;
                        if (gx < box[0]) box[0] = gx;
                        if (gz < box[1]) box[1] = gz;
                        if (gx > box[2]) box[2] = gx;
                        if (gz > box[3]) box[3] = gz;
                    }
                box[0] -= 0.05;
                box[1] -= 0.05;
                box[2] += 0.05;
                box[3] += 0.05;
                const A = umriss(S, L, y0, box, true),
                    B = umriss(I, L, y0, box, false);
                let ab = 0,
                    ao = 0,
                    bo = 0,
                    nA = 0,
                    nB = 0;
                const taeter = {};
                for (let i = 0; i < A.M.length; i++) {
                    if (A.M[i]) nA++;
                    if (B.M[i]) nB++;
                    if (A.M[i] && B.M[i]) ab++;
                    else if (A.M[i]) {
                        ao++;
                        taeter[A.G[i]] = (taeter[A.G[i]] || 0) + 1;
                    } else if (B.M[i]) bo++;
                }
                const top = Object.entries(taeter).sort((x, y) => y[1] - x[1])[0] || null;
                out.push({
                    sonne: name,
                    iou: ab / Math.max(1, ab + ao + bo),
                    flaeche: nB / Math.max(1, nA) - 1,
                    top,
                });
            }
            return out;
        };
        // die Werfer einer Gestalt (wie werferVon) und die Teile ihrer feinen Stufe nach dem Wurf-Gesetz des Ofens
        const werferMeshes = (gruppe) => {
            const w = [];
            gruppe.traverse((n) => {
                if (
                    n.isMesh &&
                    n.geometry &&
                    n.castShadow === true &&
                    n.layers.test(maskeK) &&
                    ketteSichtbar(n, gruppe)
                )
                    w.push(n);
            });
            return w;
        };
        const feineWerfer = (gruppe, l0) => {
            const w = [];
            gruppe.traverse((n) => {
                const mt = n.material || {};
                if (!n.isMesh || !l0.has(n.geometry) || n.userData.__klasse === "fellSchale") return;
                if (mt.transparent && mt.opacity < 1) return;
                w.push(n);
            });
            return w;
        };
        const deckungUrteil = (je) => {
            let schlecht = null;
            let summe = 0;
            for (const x of je) {
                summe += x.iou;
                if (!schlecht || x.iou < schlecht.iou) schlecht = x;
            }
            return { min: schlecht, mittel: summe / Math.max(1, je.length), n: je.length };
        };
        o.w = [];
        const tcW = window.__tetrapodaCore;
        const kcW = window.__koerperCore;
        const BT = tcW.PORTAL_RENDER_CONFIG.lod.budget.kreatur;
        const BM = kcW.PORTAL_RENDER_CONFIG.lod.budget.koerper;
        const SM = A.TETRAPODA_SOUL_MAP || {};
        for (const art of ["wolf", "fox", "bear", "deer"]) {
            const seele = Object.keys(SM).find((k) => SM[k] === art);
            budgetFang.clear();
            const x0 = pm.x + 10,
                hW = r.getTerrainHeightAt(x0, pm.z);
            const cw = seele
                ? r.spawnCreatureAt(x0, (Number.isFinite(hW) ? hW : 0) + 1, pm.z, "happy", seele, {
                      precise: true,
                      bodySize: 1,
                  })
                : null;
            if (!cw) {
                o.w.push({ name: "tier:" + art, fehler: "Spawn fehlgeschlagen" });
                continue;
            }
            const fLw = cw.scale.x || 1;
            const vl = vorlagenVon(cw);
            const l0 = vl["0"] ? geoMenge(vl["0"].root) : new Set();
            const l1 = vl["1"] ? geoMenge(vl["1"].root) : new Set();
            const tick = (d) => {
                for (let k = 0; k < 3; k++) {
                    cw.position.x = pm.x + d;
                    cw.position.z = pm.z;
                    r.updateCreatures(0.02);
                }
                cw.position.x = pm.x + d;
                cw.position.z = pm.z;
                cw.updateMatrixWorld(true);
            };
            tick(10 * fLw);
            const nah = werferVon(cw, l0, l1);
            // (W) DECKUNG: die Stand-Pose und drei Gang-Posen (der echte Gang-Chokepoint), dieselben Knochen
            const dk = [];
            const messW = (pose, schrumpf) => {
                cw.updateMatrixWorld(true);
                const je = deckungJe(feineWerfer(cw, l0), werferMeshes(cw), cw.rotation.y, 0, schrumpf);
                if (!schrumpf) for (const x of je) dk.push(Object.assign({ pose }, x));
                return je;
            };
            cw.rotation.y = Math.PI / 2; // der Leib blickt auf seinen Weg (+x), nie quer
            r._tierBaumNeutralStance(cw);
            messW("stand");
            for (let k = 0; k < 16; k++) {
                cw.position.x += 0.112; // der Gang folgt dem Weg (1,6 m/s im Takt 0,07 s)
                r._animateTierBaum(cw, k * 0.07, k * 0.35, true, null);
                if (k === 7 || k === 11 || k === 15) messW("gang" + k);
            }
            // (S7) SELBST-TEST: der Zwilling 6 % zur Mitte gezogen — die Deckung fällt unter die Schwelle
            const s7 = art === "wolf" ? deckungUrteil(messW("s7", 0.94)) : null;
            // (S5) SELBST-TEST: der Zwilling gestubbt — die nahe Stufe wirft wieder selbst (der alte Zustand)
            let s5 = null;
            if (art === "wolf") {
                const gesichert = [];
                cw.traverse((n) => {
                    if (n.isMesh && l0.has(n.geometry)) {
                        gesichert.push([n, n.castShadow]);
                        n.castShadow = n.userData.__klasse !== "fellSchale";
                    }
                });
                s5 = werferVon(cw, l0, l1);
                for (const [n, c] of gesichert) n.castShadow = c; // restaurieren (Gate-Hook-Lehre)
            }
            tick(45 * fLw);
            const mittel = werferVon(cw, l0, l1);
            const soll = wurfTeil(tcW, "kreatur");
            o.w.push({
                name: "tier:" + art,
                nah,
                mittel,
                soll,
                schatten1: BT[1] ? BT[1].schatten : null,
                gruen: urteil("kreatur", BT, 0, nah, soll) && urteil("kreatur", BT, 1, mittel, soll),
                nahGruen: urteil("kreatur", BT, 0, nah, soll),
                s5Rot: s5 ? !urteil("kreatur", BT, 0, s5, soll) && s5.l0 > 0 : null,
                s5,
                deckung: deckungUrteil(dk),
                s7,
            });
            r.removeCreature(cw);
        }
        {
            budgetFang.clear();
            const gW = r._buildHumanGroup();
            const vl = gW ? vorlagenVon(gW) : {};
            const l0 = vl["0"] ? geoMenge(vl["0"].root) : new Set();
            const l1 = vl["1"] ? geoMenge(vl["1"].root) : new Set();
            const peer = (d) => {
                const e = {
                    mesh: gW,
                    x: pm.x + d,
                    y: pm.y + 1,
                    z: pm.z,
                    yaw: 0,
                    meshKind: "soul",
                    soulName: "human",
                    walkPhase: 0,
                    lastMovedAt: 0,
                };
                r._p2pUpdatePeer(e, performance.now() / 1000, 0.016);
                gW.updateMatrixWorld(true);
            };
            if (gW) {
                peer(10);
                const nah = werferVon(gW, l0, l1);
                // (W) DECKUNG: die Ruhe des Nah-Peers und drei Gang-Posen am echten Peer-Tick (dieselben Knochen)
                const dkM = [];
                const messM = (pose) => {
                    gW.updateMatrixWorld(true);
                    for (const x of deckungJe(feineWerfer(gW, l0), werferMeshes(gW), gW.rotation.y, 0))
                        dkM.push(Object.assign({ pose }, x));
                };
                messM("stand");
                const eM = {
                    mesh: gW,
                    x: pm.x + 10,
                    y: pm.y + 1,
                    z: pm.z,
                    yaw: 0,
                    meshKind: "soul",
                    soulName: "human",
                    walkPhase: 0,
                    lastMovedAt: 0,
                };
                for (let k = 0; k < 30; k++) {
                    eM.x += 0.1; // 3 m/s im Takt 1/30 s
                    eM.lastMovedAt = performance.now() / 1000;
                    r._p2pUpdatePeer(eM, performance.now() / 1000, 1 / 30);
                    if (k === 9 || k === 19 || k === 29) messM("gang" + k);
                }
                peer(45);
                const mittel = werferVon(gW, l0, l1);
                const soll = wurfTeil(kcW, "koerper");
                o.w.push({
                    name: "mensch",
                    nah,
                    mittel,
                    soll,
                    schatten1: BM[1] ? BM[1].schatten : null,
                    gruen: urteil("koerper", BM, 0, nah, soll) && urteil("koerper", BM, 1, mittel, soll),
                    deckung: deckungUrteil(dkM),
                });
            } else o.w.push({ name: "mensch", fehler: "kein Mensch-Guss" });
        }
        r._ofenBudget = saveBudget; // restaurieren (Gate-Hook-Lehre)
        r.isInFrustum = saveFrustumW;
        A._tierOfenMemo = saveMemoW;
        o.checks.wWerfer = o.w.length === 5 && o.w.every((x) => x.gruen === true);
        o.checks.s5LensFires = o.w.some((x) => x.s5Rot === true);
        o.deckungMin = DECKUNG_MIN;
        o.checks.wDeckung =
            o.w.length === 5 &&
            o.w.every((x) => x.deckung && x.deckung.n >= 16 && x.deckung.min.iou >= DECKUNG_MIN);
        const s7W = o.w.find((x) => x.s7);
        o.s7 = s7W ? s7W.s7 : null;
        o.checks.s7LensFires = !!o.s7 && o.s7.min.iou < DECKUNG_MIN;
        // Absenz (window.__codeOf, Kommentare gestrippt): kein castShadow-Literal am Gelenk-Guss; die Wirts-Distanzen sind keine
        // Konstante mehr (ihre Leser hält gate:altlasten über jede Stamm-Datei, die Gestalt liest `ab`/`hyst` aus ihrer Kern-Zeile).
        o.wLiterale = ["_buildCreatureGroup", "_buildHumanoidRig"].filter((k) => !window.__fehlt(r[k], /castShadow\s*=\s*false/)).length;
        o.checks.wAbsenz = o.wLiterale === 0;
    
        // ── (F) DIE RUHE JENSEITS DER GRENZE (S3): beide Stufen tragen DIESELBEN Knochen — wo der Gang jenseits der Grenze
        // ruht (der Peer-Tick des Menschen, die Sicht-Kopie eines fremden Tiers), stehen sie in der Ruhe-Pose, nie mitten
        // im Schritt (das Standbild der Basis stand in der Ruhe-Pose). Gemessen nach dem ECHTEN Tick: erst nah gehen
        // (Prämisse: mitten im Schritt), dann jenseits der Grenze ein Tick. Mensch gegen die Ruhe-Pose seiner Vorlage
        // (Winkel je Gelenk), Tier gegen die Kern-STAND_POSE (dieselbe Ketten-Wahrheit wie (B)). ──
        const ruheAbw = (nah, vorlage) => {
            const a = { rad: 0, gelenk: null };
            if (!nah || !vorlage || !vorlage.teile) return a;
            nah.traverse((n) => {
                const q = n.name && vorlage.teile[n.name];
                if (!q || !(n.isGroup || n.isBone)) return;
                const w = n.quaternion.angleTo(q.quaternion);
                if (w > a.rad) {
                    a.rad = w;
                    a.gelenk = n.name;
                }
            });
            return a;
        };
        const peerF = (gF, eF, d, gehen) => {
            eF.x = pm.x + d;
            for (let k = 0; k < (gehen ? 30 : 1); k++) {
                if (gehen) {
                    eF.x += 0.1; // 3 m/s im Takt 1/30 s — der Gang folgt dem Weg
                    eF.lastMovedAt = performance.now() / 1000;
                }
                r._p2pUpdatePeer(eF, performance.now() / 1000, 1 / 30);
            }
            gF.updateMatrixWorld(true);
        };
        const menschRuhe = () => {
            const gF = r._buildHumanGroup();
            const mfF = gF && gF.userData && gF.userData._gelenk;
            const vF = gF ? vorlagenVon(gF)["0"] : null;
            if (!mfF || !vF) return null;
            const eF = {
                mesh: gF,
                x: pm.x + 8,
                y: pm.y + 1,
                z: pm.z,
                yaw: 0,
                meshKind: "soul",
                soulName: "human",
                walkPhase: 0,
                lastMovedAt: 0,
            };
            peerF(gF, eF, 8, true);
            const mitte = ruheAbw(mfF.nah, vF);
            peerF(gF, eF, 2.5 * mfF.abM, false);
            const fern = ruheAbw(mfF.nah, vF);
            return { mitte, fern, istFern: mfF.istFern === true };
        };
        o.fMensch = menschRuhe();
        // die Sicht-Kopie eines fremden Wolfs (der Peer-Strom, `_p2pTickRemoteCreatures`)
        const seeleF = Object.keys(SM).find((k) => SM[k] === "wolf");
        const kopieRuhe = () => {
            const mK = seeleF ? r._buildCreatureGroup(seeleF) : null;
            const glK = mK && mK.userData && mK.userData._gelenk;
            if (!glK) return null;
            const remote = s.p2p.remoteCreatures;
            const rcK = { mesh: mK, peerId: "__linseF" };
            remote.set("__linseF|1", rcK);
            const zuK = (d, gehen) => {
                const t0K = performance.now() / 1000;
                if (!gehen) {
                    mK.position.set(pm.x + d, pm.y, pm.z);
                    rcK.tx = pm.x + d;
                    rcK.tz = pm.z;
                    rcK.ty = pm.y;
                    r._p2pTickRemoteCreatures(t0K, 1 / 30);
                    return;
                }
                mK.position.set(pm.x + d, pm.y, pm.z);
                for (let k = 0; k < 30; k++) {
                    rcK.tx = mK.position.x + 0.2; // der Sender läuft voraus — die Kopie zieht nach und geht
                    rcK.tz = pm.z;
                    rcK.ty = pm.y;
                    r._p2pTickRemoteCreatures(t0K + k / 30, 1 / 30);
                }
            };
            zuK(6, true);
            const mitte = maxDev(mK);
            zuK(2.5 * glK.abM, false);
            const fern = maxDev(mK);
            const istFern = glK.istFern === true;
            remote.delete("__linseF|1");
            r._disposeSoulGroup(mK);
            return { mitte, fern, istFern };
        };
        o.fKopie = kopieRuhe();
        o.checks.fMenschPraemisse = !!o.fMensch && o.fMensch.mitte.rad > 0.05;
        o.checks.fMenschRuhe = !!o.fMensch && o.fMensch.istFern && o.fMensch.fern.rad <= 0.01;
        o.checks.fKopiePraemisse = !!o.fKopie && o.fKopie.mitte > 0.05;
        o.checks.fKopieRuhe = !!o.fKopie && o.fKopie.istFern && o.fKopie.fern <= 0.02;
        // (S6) SELBST-TEST: die Ruhe gestubbt — der ferne Mensch friert wieder mitten im Schritt
        const saveRuhe = r._gelenkRuhe;
        r._gelenkRuhe = function () {};
        o.s6 = menschRuhe();
        if (saveRuhe) r._gelenkRuhe = saveRuhe;
        else delete r._gelenkRuhe; // restaurieren (Gate-Hook-Lehre)
        o.checks.s6LensFires = !!o.s6 && o.s6.fern.rad > 0.05;
    
        // ── (G) DER RUHENDE LEIB (K59, Gebot 7): außer Bild, fern, ohne Zustand → grober Takt, kein Matrix-Gang ──
        // Der Null-Renderer backt kein Feld (`_tickKreaturZiegel` schweigt headless): die Probe trägt den Bake-Versuch
        // (`_kzVersuch`) wie ein ferner Leib, dessen Feld steht. Der Frustum kommt wie im Loop aus `_loopFrustumCulling`;
        // der Matrix-Gang ist `scene.updateMatrixWorld()` wie im Render. Gezählt: volle Schritte (`_kreaturHuellenKontakt`
        // je Schritt), die Zeit der Schritte (`_kreaturLaufTakt` trägt das dt), die Gänge in ein angehängtes Kind.
        o.g = (() => {
            const T3 = window.THREE;
            const R = A.KREATUR_RUHE;
            if (!R) return { fehler: "KREATUR_RUHE fehlt" };
            const cam = s.camera;
            const blick = (dx, dz) => {
                cam.position.set(pm.x, pm.y + 2, pm.z);
                cam.lookAt(pm.x + dx, pm.y + 2, pm.z + dz);
                cam.updateMatrixWorld(true);
            };
            const g = { schritte: 0, zeit: 0, gaenge: 0, laeufe: 0 };
            const probe = spawnAt(-120, 0);
            if (!probe) return { fehler: "Spawn fehlgeschlagen" };
            const u = probe.userData;
            u._kzVersuch = true;
            const kind = new T3.Object3D();
            kind.position.set(0, 1, 0);
            const kindGang = kind.updateMatrixWorld;
            kind.updateMatrixWorld = function (f) {
                g.gaenge++;
                return kindGang.call(this, f);
            };
            probe.add(kind);
            const P = Object.getPrototypeOf(r);
            r._kreaturHuellenKontakt = function (c) {
                if (c === probe) g.schritte++;
                return P._kreaturHuellenKontakt.apply(this, arguments);
            };
            r._kreaturLaufTakt = function (c, dt) {
                if (c === probe) (g.zeit += dt), g.laeufe++;
                return P._kreaturLaufTakt.apply(this, arguments);
            };
            const takt = (n, setze) => {
                for (let k = 0; k < n; k++) {
                    if (setze) setze();
                    r._loopFrustumCulling();
                    r.updateCreatures(0.02);
                    s.scene.updateMatrixWorld();
                }
            };
            const nullen = () => {
                g.schritte = 0;
                g.gaenge = 0;
                g.laeufe = 0;
            };
            const kindStimmt = () => {
                const soll = new T3.Matrix4()
                    .compose(probe.position, probe.quaternion, probe.scale)
                    .multiply(kind.matrix);
                let d = 0;
                for (let k = 0; k < 16; k++)
                    d = Math.max(d, Math.abs(soll.elements[k] - kind.matrixWorld.elements[k]));
                return d;
            };
            // der Leser an der ruhenden Probe: ein senkrechter Stab durch ihre JETZIGE Lage (`dz` m neben der des Ruhe-Beginns)
            const leserTrifft = (dz) => {
                const p = probe.position;
                p.z += dz;
                const hit = r._kreaturGliedTreffer(probe, p.x, p.y - 1, p.z, p.x, p.y + 4, p.z, 0.4);
                p.z -= dz;
                return !!hit;
            };
            try {
                // (G1) RUHT: 120 m hinter dem Blick — jeder `takt`-te Takt ein Schritt, die Zeit vollständig, kein Gang ins Kind
                blick(1, 0);
                takt(2);
                nullen();
                const t0 = g.zeit + (u._ruheDt || 0);
                const NG = 40;
                takt(NG);
                g.g1 = {
                    ruht: u._ruht === true,
                    wurzel: Object.prototype.hasOwnProperty.call(probe, "updateMatrixWorld"),
                    schritte: g.schritte,
                    zeitFehler: Math.abs(g.zeit + (u._ruheDt || 0) - t0 - NG * 0.02),
                    gaenge: g.gaenge,
                };
                // (G2) DER LESER zieht nach: der Treffer an der ruhenden Probe liest ihre jetzige Lage
                g.g2 = { trifft: leserTrifft(5) };
                // (S8) SELBST-TEST: der Leser ruft die Wurzel direkt (ohne Chokepoint) → er liest die Lage des letzten
                // Nachziehens (G2, +5 m) und verfehlt die Probe 5 m auf der anderen Seite
                r._leibMatrix = function (c) {
                    c.updateMatrixWorld(true);
                };
                g.s8 = { trifft: leserTrifft(-5) };
                delete r._leibMatrix;
                // (G3) ERWACHT: der Blick wendet sich zur Probe — das Erwachen zieht den ganzen Leib nach, bevor ein
                // Szenen-Gang läuft (das Kind steht an der jetzigen Lage); der erste Schritt trägt die gesammelte Zeit
                blick(-1, 0);
                r._loopFrustumCulling();
                r._tickKreaturRuhe(0.02, pm);
                g.g3 = {
                    wach: u._ruht === false,
                    wurzel: Object.prototype.hasOwnProperty.call(probe, "updateMatrixWorld"),
                    kindFehler: kindStimmt(),
                };
                nullen();
                takt(4);
                g.g3.schritte = g.schritte;
                g.g3.zeitFehler = Math.abs(g.zeit + (u._ruheDt || 0) - t0 - (NG + 4) * 0.02);
                // (S9) SELBST-TEST: das Erwachen ohne Nachziehen → das Kind trägt die Matrix des Ruhe-Beginns
                blick(1, 0);
                takt(3);
                const wachOrig = r._kreaturErwacht;
                r._kreaturErwacht = function (c) {
                    c.userData._ruht = false;
                    delete c.updateMatrixWorld;
                };
                const ruhte9 = u._ruht === true;
                probe.position.z += 5;
                blick(-1, 0);
                r._loopFrustumCulling();
                r._tickKreaturRuhe(0.02, pm);
                g.s9 = { ruhteVorher: ruhte9, wach: u._ruht === false, kindFehler: kindStimmt() };
                if (wachOrig === P._kreaturErwacht) delete r._kreaturErwacht;
                else r._kreaturErwacht = wachOrig;
                probe.position.z -= 5;
                // (G4) NAH: 40 m hinter dem Blick (diesseits der Nah-Gestalt) — jeder Takt ein Schritt
                blick(1, 0);
                const nahX = -Math.min(40, A.ANALOG_NAH_M);
                const pinNah = () => {
                    probe.position.x = pm.x + nahX;
                    probe.position.z = pm.z;
                };
                takt(2, pinNah);
                nullen();
                takt(12, pinNah);
                g.g4 = { schritte: g.schritte, ruht: u._ruht === true };
                // (G5) ZUSTAND: ein Leib im Stoß ruht nie, auch fern hinter dem Blick
                probe.position.x = pm.x - 120;
                u._stossV = { x: 0.1, z: 0 };
                nullen();
                takt(12);
                g.g5 = { schritte: g.schritte, ruht: u._ruht === true };
                delete u._stossV;
                // (G6) WEG: ein Leib, dessen grober Schritt `wegMax` überschritte, geht voll — er ruht nur im Bild, nie im groben Takt
                takt(3);
                const ruhteVorher = u._ruht === true;
                if (u._steuer) u._steuer.v = (1.5 * R.wegMax) / (R.takt * 0.02);
                r._tickKreaturRuhe(0.02, pm);
                g.g6 = { ruhteVorher, grob: u._ruheGrob === true && u._ruht === true };
                // (G7) DER LÄUFER UND DER LIEGENDE GEFALLENE RUHEN IM BILD (w4-takt-z80): ein Fliehender 120 m hinter dem Blick
                // verlässt den Matrix-Gang (kein Gang ins Kind) und geht jeden Takt; ein Gefallener ruht, sobald er liegt (sein
                // Takt sagt es, `_tickLeichname`) — kippt oder versinkt er, ist er wach. Bis w4-takt-z80 ruhten beide nie: die
                // Leichname des Bestand-Risses und die fliehende Herde gingen hinter dem Blick der Mess-Wiese den Matrix-Gang je Frame
                if (u._steuer) u._steuer.v = 0;
                const K = A._arenaGesetz().gefuehl;
                const [y0, q0, iW] = [probe.position.y, probe.quaternion.clone(), s.creatures.indexOf(probe)];
                const flieht = () => {
                    nullen();
                    takt(4, () => ([probe.position.x, probe.position.z, u._motionZustand] = [pm.x - 120, pm.z, "flucht"]));
                    u._motionZustand = null;
                    return [u._ruht === true && !u._ruheGrob, g.gaenge, g.laeufe];
                };
                const liegt = (t, hebe) => {
                    u.dying = { t, hebe, dauer: K.kippDauerSec, nachklang: K.leichnamSec, sinken: K.leichnamSinkSec, dirX: 1, dirZ: 0 }; // prettier-ignore
                    r._tickLeichname(0, pm);
                    r._tickKreaturRuhe(0.02, pm);
                    return u._ruht === true;
                };
                const gefallen = () => {
                    s.leichname.push(...s.creatures.splice(iW, 1));
                    const z = [liegt(0.5), liegt(10, [0, 0]), liegt(K.kippDauerSec + K.leichnamSec - 1, [0, 0])];
                    s.creatures.splice(iW, 0, s.leichname.pop());
                    [u.dying, u._liegt, probe.position.y] = [undefined, undefined, y0];
                    probe.quaternion.copy(q0);
                    return z;
                };
                g.g7 = [flieht(), gefallen()];
                // (S12) SELBST-TEST: das alte Gesetz (es ruht nur der stille Lebende) → der Läufer geht den Matrix-Gang, der Gefallene
                // liegt wach
                r._kreaturRuht = function (c, pp, fr, ra, de, gefallen) {
                    return gefallen || c.userData._motionZustand ? false : P._kreaturRuht.apply(this, arguments);
                };
                g.s12 = [flieht(), gefallen()];
                delete r._kreaturRuht;
                // (G8) DIE NAH-GESTALT ruht nie: ein Leib, dessen Mesh noch die Gestalt trägt (`_kzNah` — er kreuzte eben
                // `aus` nach außen, der Ziegel schaltet erst in seinem Takt), zeichnet und wirft in die Kaskaden (bis
                // 306 m) — ruhte er, stünde sein Werfer, wo die Ruhe begann (Prüfung K59-1: 10 m daneben, 1 Werfer statt 0)
                const nahGestalt = () => {
                    if (u._ruht === true) r._kreaturErwacht(probe);
                    blick(1, 0);
                    let ruhte = 0;
                    u._kzNah = true;
                    takt(8, () => {
                        probe.position.x = pm.x - 120;
                        probe.position.z = pm.z;
                        if (u._ruht === true) ruhte++;
                    });
                    if (u._ruht === true) ruhte++;
                    delete u._kzNah;
                    return ruhte;
                };
                g.g8 = { ruhte: nahGestalt() };
                // (S10) SELBST-TEST: der Besitz des Felds ohne die Nah-Gestalt (die Formel vor der Nachbesserung) → ruht
                r._kzBesitztFeld = function (c) {
                    const v = c && c.userData;
                    return !!(v && (v._kzGlieder || v._kzVersuch));
                };
                g.s10 = { ruhte: nahGestalt() };
                delete r._kzBesitztFeld;
                // (G9) DAS FELD RUHT MIT: ein ruhender Leib zeichnet nirgends — sein Satz geht beim Ruhe-Beginn SOFORT aus
                // (sonst stünde er, wo die Ruhe begann, und käme dieser Ort ins Bild, zeigte er den Leib dort)
                if (u._ruht === true) r._kreaturErwacht(probe);
                const H = { feld: -1, brick: { d: 1 } };
                const feldBuch = [];
                r._weltFeldAktiv = function (h, an, sofort) {
                    if (h === H) return void feldBuch.push({ an: !!an, sofort: !!sofort });
                    return P._weltFeldAktiv.apply(this, arguments);
                };
                u._kzGlieder = [{ handle: H, teil: probe }];
                takt(6, () => {
                    probe.position.x = pm.x - 120;
                    probe.position.z = pm.z;
                });
                const letzt = feldBuch[feldBuch.length - 1];
                g.g9 = { ruht: u._ruht === true, aus: !!letzt && !letzt.an && letzt.sofort, buch: feldBuch.length };
                // (G10) DER BLICK DES BILDS weckt: die Kamera dreht nach dem Kreatur-Takt auf den ruhenden Leib (Teleport,
                // Portal, ein Schwenk über den Rand, die Aufnahme) — der Render-Pfad (`_loopRender`) prüft den Blick DIESES
                // Bilds und weckt ihn, bevor er zeichnet
                const bildProbe = (stumm) => {
                    blick(1, 0);
                    takt(3, () => {
                        probe.position.x = pm.x - 120;
                        probe.position.z = pm.z;
                    });
                    const ruhteVorher = u._ruht === true;
                    let gerufen = 0;
                    const rib = r._ruheImBild;
                    r._ruheImBild = function () {
                        gerufen++;
                        if (!stumm && typeof rib === "function") return rib.apply(this, arguments);
                    };
                    blick(-1, 0);
                    let fehler = null;
                    try {
                        r._loopRender();
                    } catch (e) {
                        fehler = String((e && e.message) || e).slice(0, 120);
                    }
                    delete r._ruheImBild;
                    return { ruhteVorher, ruht: u._ruht === true, gerufen, fehler };
                };
                g.g10 = bildProbe(false);
                // (S11) SELBST-TEST: der Blick des Bilds gestubbt → der Leib ruht im Bild weiter
                g.s11 = bildProbe(true);
                delete r._weltFeldAktiv;
                delete u._kzGlieder;
                // (G11) DIE KI IM GROBEN TAKT: im Band aiDiv 3 (346–432 m) rechnet ein ruhender Leib die KI in jedem Schritt,
                // in dessen Spanne ein KI-Takt fiel — bei Takt 4 in jedem (die Kadenz, nie die Entscheidung)
                if (u._ruht === true) r._kreaturErwacht(probe);
                blick(1, 0);
                // gepinnt: die Lage und das Tempo (ein Wanderer beschleunigt über `wegMax` hinaus und ginge dann voll — (G6))
                const pinFern = () => {
                    probe.position.x = pm.x - 400;
                    probe.position.z = pm.z;
                    if (u._steuer) u._steuer.v = Math.min(u._steuer.v, 1);
                };
                let ki = 0;
                r._tickCreatureTaskDirection = function (c) {
                    if (c === probe) ki++;
                    return P._tickCreatureTaskDirection.apply(this, arguments);
                };
                takt(4, pinFern);
                nullen();
                ki = 0;
                takt(24, pinFern);
                g.g11 = { band: r._detailBand(400 / 43.2).aiDiv, ruht: u._ruht === true, schritte: g.schritte, ki };
                delete r._tickCreatureTaskDirection;
            } finally {
                delete r._kreaturHuellenKontakt;
                delete r._kreaturLaufTakt;
                delete r._kreaturRuht;
                delete r._leibMatrix;
                delete r._kzBesitztFeld;
                delete r._weltFeldAktiv;
                delete r._ruheImBild;
                delete r._tickCreatureTaskDirection;
                delete u._kzGlieder;
                delete u._kzNah;
                if (u._ruht === true) r._kreaturErwacht(probe);
                probe.remove(kind);
                cleanup([probe]);
            }
            return g;
        })();
        {
            const G = o.g || {};
            const R = A.KREATUR_RUHE || {};
            o.checks.gRuht =
                !!G.g1 &&
                G.g1.ruht &&
                G.g1.wurzel &&
                G.g1.schritte >= 40 / R.takt - 1 &&
                G.g1.schritte <= 40 / R.takt + 1 &&
                G.g1.zeitFehler < 1e-9 &&
                G.g1.gaenge === 0;
            o.checks.gLeser = !!G.g2 && G.g2.trifft;
            o.checks.s8LensFires = !!G.s8 && !G.s8.trifft;
            o.checks.gErwacht =
                !!G.g3 &&
                G.g3.wach &&
                !G.g3.wurzel &&
                G.g3.schritte === 4 &&
                G.g3.kindFehler < 1e-6 &&
                G.g3.zeitFehler < 1e-9;
            o.checks.s9LensFires = !!G.s9 && G.s9.ruhteVorher && G.s9.wach && G.s9.kindFehler > 1;
            o.checks.gNah = !!G.g4 && G.g4.schritte === 12 && !G.g4.ruht;
            o.checks.gZustand = !!G.g5 && G.g5.schritte === 12 && !G.g5.ruht;
            o.checks.gWeg = !!G.g6 && G.g6.ruhteVorher && !G.g6.grob;
            const [lauf, fall] = G.g7 || [[], []];
            o.checks.gGefallen = String(lauf) === "true,0,4" && String(fall) === "false,true,false";
            const [lauf0, fall0] = G.s12 || [[], []];
            o.checks.s12LensFires = lauf0[0] === false && lauf0[1] > 0 && fall0[1] === false;
            o.checks.gNahGestalt = !!G.g8 && G.g8.ruhte === 0;
            o.checks.s10LensFires = !!G.s10 && G.s10.ruhte > 0;
            o.checks.gFeldRuht = !!G.g9 && G.g9.ruht && G.g9.aus;
            o.checks.gBildWeckt = !!G.g10 && G.g10.ruhteVorher && !G.g10.ruht && G.g10.gerufen > 0;
            o.checks.s11LensFires = !!G.s11 && G.s11.ruhteVorher && G.s11.ruht && G.s11.gerufen > 0;
            o.checks.gKi =
                !!G.g11 && G.g11.band === 3 && G.g11.ruht && G.g11.schritte >= 5 && G.g11.ki === G.g11.schritte;
        }
    
        o.ruheTakt = A.KREATUR_RUHE && A.KREATUR_RUHE.takt;
        o.creaturesAfter = s.creatures.length;
        return o;
    });
    if (!out || out.error) return check("Kreatur-Kosten: die Bühne steht", false, out ? out.error : "keine Antwort der Seite");
    const c = out.checks || {};
    const gruppe = (titel, keys) => {
        const rot = keys.filter((x) => c[x] !== true);
        check(`Kreatur-Kosten ${titel}`, rot.length === 0, rot.length ? "ROT: " + rot.join(" · ") : "");
    };
    const n = out.counts || {};
    gruppe(`(A) die Anim-Raten-Leiter: nah ${n.voll}/100 · halb ${n.halb} · viertel ${n.viertel} · jenseits ${n.hinter}, monoton, eingefroren`, ["aVoll", "aHalb", "aViertel", "aHinter", "aFernOrdnung", "aEingefroren"]);
    gruppe("(B) jenseits der Grenze die neutrale Stance (Prämisse mid-step, Schwanz ruht, Freeze lief)", ["bMidStepPremise", "bNeutralStance", "bTailNeutral", "bFrozen"]);
    gruppe("(C) die gelenkige Grobstufe des Menschen: Vertex- und Mesh-Differenz, der EINE Schalter, der Peer-Tick nah↔fern", ["cFernGebaut", "cVertexDiff", "cMeshDiff", "cToggle", "cPeerFern", "cPeerNah"]);
    gruppe("(R)(T)(W) Starr-Bindung je Material, Körper-Kugel, Pose in der Kugel, Zwillings-Knochen, schmal, Absenz", ["rWolfStarr", "rMenschStarr", "rKugel", "rPoseInKugel", "rZwillingKnochen", "tSchmal", "wAbsenz"]);
    gruppe("(F) Mensch und Kopie ruhen (je mit Prämisse)", ["fMenschPraemisse", "fMenschRuhe", "fKopiePraemisse", "fKopieRuhe"]);
    // (W) je Gestalt: der Wurf-Teil der Grobstufe hält sein Soll, der Zwilling wirft den Umriss der feinen Stufe (DECKUNG IoU)
    const w = out.w || [];
    const wRot = w.filter((g) => g.fehler || !g.gruen).map((g) => `${g.name}: ${g.fehler || "Wurf über dem Soll der Grobstufe"}`);
    const dRot = w.filter((g) => g.deckung && !(g.deckung.min && g.deckung.n >= 16 && g.deckung.min.iou >= out.deckungMin)).map((g) => `${g.name} IoU ${g.deckung.min ? g.deckung.min.iou.toFixed(3) : "?"}`);
    check(`Kreatur-Kosten (W) je Gestalt wirft die Grobstufe ihr Soll, der Zwilling deckt den Umriss der feinen Stufe (IoU ≥ ${out.deckungMin})`, w.length > 0 && !wRot.length && !dRot.length, [...wRot, ...dRot].join(" · "));
    const G = out.g || {};
    check("Kreatur-Kosten (G) die Probe der ruhenden Leiber lief", !G.fehler, G.fehler || "");
    gruppe("(G) Leiber ruhen fern, der Leser liest die jetzige Lage, sie erwachen nah, im Stoß, im Fall, im Feld, im Bild, für die KI; der Schnelle, der Läufer und der liegende Gefallene ruhen im Bild", ["gRuht", "gLeser", "gErwacht", "gNahGestalt", "gNah", "gZustand", "gWeg", "gGefallen", "gFeldRuht", "gBildWeckt", "gKi"]);
    gruppe("SELBSTTESTS S1–S12 feuern", ["s1LensFires", "s2LensFires", "s3LensFires", "s4LensFires", "s6LensFires", "s8LensFires", "s9LensFires", "s10LensFires", "s11LensFires", "s12LensFires"]);
    if (w[0] && w[0].s5) gruppe("SELBSTTEST S5: der gestubbte Zwilling lässt die nahe Stufe wieder werfen", ["s5LensFires"]);
    if (out.s7) gruppe("SELBSTTEST S7: der zur Mitte gezogene Zwilling verfehlt die Deckung", ["s7LensFires"]);
}

module.exports = {
    checkBandWelle6HCreatures, checkBandWelleV11D3DrinkTask, checkBandPhaseEThreat,
    checkBandTierSeparation, checkBandKreaturKosten,
};
