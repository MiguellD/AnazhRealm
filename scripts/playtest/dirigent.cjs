"use strict";
// scripts/playtest/dirigent.cjs — der Richter von Dirigent (spec/stamm/modul-karte.json): Konstruktor · state-Baum · Spiel-Modi · Kamera-Modus · Leucht-Takt · Perf-Sinn · der EINE Regler · Holz-Profile · Geräte-Profil · Flug-Schreiber · die Spielschleife · Frame-Planer · Fixed-Step · Replay · init · das erste Weltbild · Ladeschirm · der Boot.
// 19 Band/Bänder in Lauf-Reihenfolge, je Band das Modul, dessen Glieder er am meisten ruft; gestellt von
// `node scripts/stamm-umzug.cjs --richter` — ein neuer Band steht hier und in der Reihe des Läufers scripts/playtest.cjs.

const path = require("path");
const SK = require("../lib/shader-kosten.cjs");
const { safeEvaluate } = require("../playtest.cjs");
const SKRIPTE = path.join(__dirname, "..");

// die Basis-Invarianten direkt nach dem `finalState`-Greifen.
// Welt-/Terrain-/Spieler-Grundprüfungen — verhaltens-identisch zur alten Inline-Form.
function checkInitialState({ check, finalState }) {
    check(
        "Welt initial generiert (terrainEverGenerated=true)",
        finalState.terrainEverGenerated === true,
        `terrainEverGenerated=${finalState.terrainEverGenerated}`
    );
    // Die Eingangs-Welt ist voxel-default: geprüft werden das Flag (worldMeta.voxelTerrain), das aktive
    // Voxel-Terrain und ein gefüllter Chunk-Ring um den Spieler.
    check(
        "Voxel V9.33 Phase 5c.2.b: die Eingangs-Welt ist per Default voxel-basiert (worldMeta.voxelTerrain=true)",
        finalState.voxelTerrainFlag === true,
        `voxelTerrainFlag=${finalState.voxelTerrainFlag}`
    );
    check(
        "Voxel V9.33 Phase 5c.2.b: das Voxel-Terrain ist nach Init aktiv (parallel, hinter dem Flag)",
        finalState.voxelTerrainActive === true,
        `voxelTerrainActive=${finalState.voxelTerrainActive}`
    );
    check(
        // Schwelle 15: headless schwanken 17–21 Chunks im 30-s-Budget, ab 15 steht die Welt sichtbar;
        // die strikte Invariante bleibt voxelTerrainActive.
        "Welt-Terrain ist gefüllt (Voxel-Chunks)",
        finalState.voxelChunksSize >= 15,
        `voxelChunks=${finalState.voxelChunksSize}`
    );
    check(
        "Spieler nicht durch den Boden gefallen",
        typeof finalState.playerY === "number" && finalState.playerY > -50,
        `playerY=${finalState.playerY?.toFixed(2)}`
    );
    check("Kreaturen gespawnt", finalState.creatures >= 5, `creatures=${finalState.creatures}`);
    check(
        "Szenen-Zensus (Band-Linse): jedes Renderable trägt seine Täter-Klasse — kein UNBENANNT",
        finalState.szenenZensus.renderables > 0 && finalState.szenenZensus.unbenannt.length === 0,
        `renderables=${finalState.szenenZensus.renderables} klassen=${finalState.szenenZensus.klassen} ` +
            `unbenannt=[${finalState.szenenZensus.unbenannt.join(" · ")}]`
    );
    check(
        "Fliegende Inseln gespawnt",
        finalState.floatingIslands >= 1,
        `floatingIslands=${finalState.floatingIslands}`
    );
    check(
        "Feld-native Spieler-Velocity (playerVel) vorhanden",
        finalState.hasPlayerBody === true,
        `hasPlayerVel=${finalState.hasPlayerBody}`
    );
}

// Ring 1 Grok-Stimme: firstSpawn (1,5 s nach Erst-Worldgen) ist der einzige Trigger, der headless
// zuverlässig kommt (idle 45 s, rainLong 60 s, jumpBurst ohne Keys, nexus irregulär) → geprüft
// werden seenFirstSpawn + lastSpoke + Dialog-Text + mindestens ein "Grok: ..."-Log.
function checkRing1Grok({ check, finalState, logs }) {
    check(
        "Grok hat Erst-Spawn registriert",
        finalState.grokSeenFirstSpawn === true,
        `seenFirstSpawn=${finalState.grokSeenFirstSpawn}`
    );
    check(
        "Grok hat mindestens einmal gesprochen",
        typeof finalState.grokLastSpoke === "number" && finalState.grokLastSpoke > 0,
        `lastSpoke=${finalState.grokLastSpoke}`
    );
    check(
        "grokRender schreibt einen Satz in die Dialogue-Box",
        finalState.grokRenderProbe === "Prüfsatz für den Dialog.",
        `probe="${(finalState.grokRenderProbe || "").slice(0, 60)}"`
    );
    check(
        "grokRender ignoriert leeren Text — die Stimme wird nicht geblankt",
        finalState.grokRenderEmptyGuard === true
    );
    const grokLogs = logs.filter((l) => /\[INFO\] Grok: /.test(l.text));
    check(
        "Mindestens ein Grok-Log im Buffer",
        grokLogs.length >= 1,
        `grokLogs=${grokLogs.length}${grokLogs.length ? ` erster: "${grokLogs[0].text.slice(0, 80)}"` : ""}`
    );
}

// die generische Präzisions-Leiter ist GEFALLEN: feuerstein/hammer/feile/
// polierscheibe RAUS (die Werkstatt trägt jetzt die Präzision, V17.76/.77). hände bleibt die domain-
// neutrale Baseline; die Op-Klassen-Abdeckung + der Crafting-Pfad bleiben intakt (kein Material verwaist).
async function checkBandV1778LadderCut({ page, check }) {
    const res = await page.evaluate(() => {
        const out = {};
        const tools = st.tools || {};
        out.removedGone = !["feuerstein-knapper", "hammer", "feile", "polierscheibe"].some((n) => tools[n]);
        // nur `hände` ist STARTER (die Basics); die 5 Domain-Werkzeuge bleiben als OP-Bibliothek
        // (Definition da, isStarter:false), aus der die platzierte Werkstatt ihren Prozess zieht.
        out.keptPresent =
            !!tools["hände"] &&
            tools["hände"].isStarter &&
            ["schmiede-hammer", "mörser", "webstuhl-schiffchen", "ritueller-stab", "drehbank-meißel"].every(
                (n) => tools[n] && !tools[n].isStarter
            );
        out.handeNeutral = !!tools["hände"] && tools["hände"].domain === null && tools["hände"].precisionCap === 0.4;
        const classes = new Set(Object.values(tools).map((t) => t.opClass));
        out.allOpClasses = ["subtractive", "plastic", "additive", "phaseChange"].every((c) => classes.has(c));
        // KONSUM — ein Material ist weiter bearbeitbar (hände subtractive auf eisen) → der Crafting-Pfad lebt
        st.blueprints["_cut_test"] = {
            name: "_cut_test",
            parts: [{ shape: "box", material: "eisen", opChain: r._defaultPartOpChain() }],
        };
        const prevMode = r.getGameMode();
        r.setGameMode("schöpfer");
        const ap = r.applyOpToPart("_cut_test", 0, "hände");
        out.stillRefinable = ap.ok === true;
        r.setGameMode(prevMode);
        delete st.blueprints["_cut_test"];
        return out;
    });
    check(
        "Welle 2 Schritt 2: die generische Leiter ist GEFALLEN (feuerstein/hammer/feile/polierscheibe RAUS)",
        res.removedGone
    );
    check(
        "hände (domain-neutrale Baseline, 0.4) ist der EINZIGE Starter; die 5 Domain-Ops bleiben als Werkstatt-Op-Bibliothek (isStarter:false)",
        res.keptPresent && res.handeNeutral
    );
    check(
        "die Op-Klassen-Abdeckung ist intakt (subtractive/plastic/additive/phaseChange je ein behaltenes Tool)",
        res.allOpClasses
    );
    check(
        "KONSUM: ein Material ist weiter bearbeitbar (hände subtractive auf eisen) — der Crafting-Pfad lebt",
        res.stillRefinable
    );
}

// DETERMINISMUS-BOGEN P3 — die V18.271/V18.274-Bänder (`_softFloorWhileChunkLoading` +
// der `_ensurePlayerChunkBVH`-Sync-Gating-Watchdog) sind ENTFERNT: mit der Ammo-BVH
// fällt der Spieler nicht mehr durch einen ungebauten Chunk — das Dichtefeld trägt den
// Boden global (der Feld-Controller `_stepCharacter` löst gegen `_fieldSurfaceBelow`,
// ohne dass ein per-Chunk-Mesh/BVH existieren muss). Es gibt keinen weichen Boden +
// keinen BVH-Watchdog mehr zu prüfen.

// Error-Boundary des ewigen Loops: ein Frame-Throw darf den setAnimationLoop-Callback nicht
// brechen (die Welt erstarrte; der Headless-Pump fing den Throw selbst und sah es nie). Der Loop
// fängt selbst ab (loggt gedrosselt mit Stack, läuft weiter). Geprüft strukturell (try/catch +
// _loopErrorBoundary) UND behavioral (ein werfender Schritt erstarrt den Loop NICHT).
async function checkBandV18278LoopErrorBoundary({ page, check }) {
    const res = await page.evaluate(() => {
        if (!r || typeof r._gameLoopTick !== "function") return { error: "kein _gameLoopTick" };
        const out = {};
        // CONSUM (behavioral): ein werfender Frame-Schritt (updateFps) darf den Loop NICHT
        // mehr brechen — die Boundary fängt ihn, zählt ihn, der Tick kehrt normal zurück.
        const before = st._loopErrorCount || 0;
        let threw = false;
        try {
            r.updateFps = () => {
                throw new Error("V18278-test-throw");
            };
            r._gameLoopTick(performance.now()); // darf NICHT werfen
        } catch {
            threw = true;
        } finally {
            delete r.updateFps; // Prototyp-Methode wiederherstellen
        }
        out.loopSurvivesThrow = !threw;
        out.errorCounted = (st._loopErrorCount || 0) > before;
        return out;
    });
    if (res.error) {
        check("Loop-Error-Boundary (realm)", false, res.error);
        return;
    }
    check(
        "CONSUM: ein werfender Frame-Schritt erstarrt den Loop NICHT (abgefangen, weiter — kein Welt-Freeze)",
        res.loopSurvivesThrow
    );
    check(
        "CONSUM: der abgefangene Fehler wird gezählt (_loopErrorCount steigt, die Wurzel sichtbar)",
        res.errorCounted
    );
}

// EIN PID-Regler misst die Last je Subsystem (perfSense) und fährt ALLE Stellgrößen (Arch-Cull,
// Streaming-, Wasser-Iso-Budget) nach gemessener Last — das teuerste gibt zuerst nach, Gravitation
// NIE. `_nexusAdaptiveQuality(fps)` ist nur der fps-Eingang in DENSELBEN Regler.
async function checkBandWellePerfENexusGovernor({ page, check }) {
    const res = await page.evaluate(() => {
        const A = AnazhRealm; // window.AnazhRealm headless undefined (V18.259-Gotcha)
        const out = {};
        out.noGravityPflaster = window.__fehlt(r.selfAwarenessAnalyze, /gravity\s*\*=/);
        // KEIN Parallel-Governor mehr: selfAwarenessAnalyze ruft _nexusAdaptiveQuality NICHT.
        out.noParallelGovernor = window.__fehlt(r.selfAwarenessAnalyze, /_nexusAdaptiveQuality/);

        const snap = {
            sense: st.perfSense,
            radius: st.architectureCullingRadius,
            budget: st.architectureBuildBudgetPerFrame,
            streamMs: st._voxelStreamBudgetMs,
            waterMs: st.atmosphere ? st.atmosphere.waterIsoBudgetMs : undefined,
            gravity: st.gravity,
            reg: st.perfRegulator,
        };
        st.perfRegulator = true;
        st.perfSense = r._perfSenseInit(); // sauberer Start (loadScale=1)
        const gBefore = st.gravity;
        const L = A.PERF_LEVERS;

        // (1) ANHALTENDER FPS-DRUCK → der EINE Regler strafft ALLE Stellgrößen der Qualität (der Rand der Mesh-Zone ist ein
        // Wechsel-Abstand am Schirm, kein Stellglied — Regler-Sim S6).
        for (let i = 0; i < 90; i++) r._nexusAdaptiveQuality(15); // frameMs≈67 >> Soll
        out.tightenedBudget = st.architectureBuildBudgetPerFrame < 4;
        out.tightenedStream = st._voxelStreamBudgetMs < L.streamBudgetMs[1];
        out.budgetFloor = st.architectureBuildBudgetPerFrame >= A.ARCH_QUALITY_BUDGET_MIN;
        out.gravityUntouchedLow = st.gravity === gBefore;

        // (2) FPS-LUFT (frameMs≈7 ≪ growMs) → relax zum MAXIMUM aller Stellgrößen. Viele Ticks: mit dem
        // Atem-Totband braucht der Integral-Term lange, bis loadScale auf 1.0 clampt (Gleichgewicht, err<0).
        for (let i = 0; i < 240; i++) r._nexusAdaptiveQuality(140);
        out.relaxedBudget = st.architectureBuildBudgetPerFrame === A.ARCH_QUALITY_BUDGET_MAX;
        out.relaxedStream = Math.abs(st._voxelStreamBudgetMs - L.streamBudgetMs[1]) < 0.01;
        out.gravityUntouchedHigh = st.gravity === gBefore;

        // (3) SYNERGIE (der Kern der Schöpfer-Forderung „optimal nutzen"): bei
        // streaming-dominanter Last drosselt der EINE Regler das Stream-Budget
        // STÄRKER (näher an min) als das Bau-Budget je Frame — das teuerste zuerst.
        r._nexusPerfActuate({
            loadScale: 0.5,
            phase: { streaming: 20, render: 0, archCulling: 1, waterIso: 1, creatures: 0, physics: 0 },
        });
        const streamPos = (st._voxelStreamBudgetMs - L.streamBudgetMs[0]) / (L.streamBudgetMs[1] - L.streamBudgetMs[0]);
        const budgetPos = (b) =>
            (b - A.ARCH_QUALITY_BUDGET_MIN) / (A.ARCH_QUALITY_BUDGET_MAX - A.ARCH_QUALITY_BUDGET_MIN);
        const archPos = budgetPos(st.architectureBuildBudgetPerFrame);
        out.synergyStreamThrottledMore = streamPos < archPos - 0.1;
        out.synergyStreamPos = +streamPos.toFixed(2);
        out.synergyArchPos = +archPos.toFixed(2);

        // (4) ungültige FPS ändert nichts.
        const rBefore = st.architectureBuildBudgetPerFrame;
        r._nexusAdaptiveQuality(0);
        out.zeroFpsNoChange = st.architectureBuildBudgetPerFrame === rBefore;

        // (5) Kosten-Schätzung liest den Sense (der Produktions-Ökonomie-Keim).
        st.perfSense.perCreatureMs = 0.05;
        out.estimateScales =
            r._estimatePerfCost("creature", 10) > r._estimatePerfCost("creature", 2) &&
            r._estimatePerfCost("creature", 10) === 0.5;

        // (6) die NEUEN AUGEN: perfSense SIEHT die GPU-Render-Last + die per-Subsystem-Spikes. CONSUM: der
        // Fold füllt die Felder, Loop + Overlay lesen sie.
        out.hasRenderFields =
            typeof st.perfSense.renderCalls === "number" &&
            typeof st.perfSense.renderTris === "number" &&
            typeof st.perfSense.renderCallsMax === "number" &&
            !!st.perfSense.phaseMax;
        st._perfFrame = { renderCalls: 1000, renderTris: 500000, streaming: 50 };
        st._perfMarks = {};
        r._perfSenseFoldFrame(50, 0.05);
        out.foldRenderLoad = st.perfSense.renderCalls > 0 && st.perfSense.renderTris > 0;
        out.foldRenderMax = st.perfSense.renderCallsMax >= 1000 && st.perfSense.renderTrisMax >= 500000;
        out.foldPhaseSpike = (st.perfSense.phaseMax.streaming || 0) >= 50;

        // (a) MODERATE Render-Last (Draw-Calls unter dem Responsiv-Schwellwert): die Architektur-Domäne
        // (Schatten/Bau-Durchsatz = die render-verursachenden Hebel) gibt MEHR nach als das Streaming — die Welt
        // lädt weiter, während die Render-Qualität schrumpft.
        r._nexusPerfActuate({
            loadScale: 0.5,
            renderCalls: 600,
            phase: { streaming: 1, render: 0, archCulling: 0.5, waterIso: 1, creatures: 0, physics: 0 },
        });
        const archPosR = budgetPos(st.architectureBuildBudgetPerFrame);
        const streamPosR =
            (st._voxelStreamBudgetMs - L.streamBudgetMs[0]) / (L.streamBudgetMs[1] - L.streamBudgetMs[0]);
        const shadowLoaded = st._shadowMinInterval;
        // unter moderater Render-Last gibt die Architektur-Domäne (Cull/Schatten) MEHR nach.
        out.renderLoadThrottlesArch = archPosR < streamPosR - 0.1;
        // (b) STREAMING IST HEILIG: bei Bau-Rückstau bleibt das Streaming auf MAX, egal wie hoch die
        // Render-Last. Die Draw-Call-Zahl misst die Welt-GRÖSSE, keinen transienten Druck — als Trigger
        // wäre sie dauerhaft an (Lauf-Freeze). Render-Druck drosselt nur die Optik (Schatten/Cull/Laub).
        const pendBSnap = st.voxelMeshPending;
        st.voxelMeshPending = new Set(["0,0,0", "1,0,0"]); // Bau-Rückstau: die Welt lädt
        r._nexusPerfActuate({
            loadScale: 0.5,
            renderCalls: 1100,
            phase: { streaming: 1, render: 0, archCulling: 0.5, waterIso: 1, creatures: 0, physics: 0 },
        });
        const streamPosBound =
            (st._voxelStreamBudgetMs - L.streamBudgetMs[0]) / (L.streamBudgetMs[1] - L.streamBudgetMs[0]);
        st.voxelMeshPending = pendBSnap;
        out.renderLoadProtectsStreaming = Math.abs(st._voxelStreamBudgetMs - L.streamBudgetMs[1]) < 0.01;
        out.renderStreamPosBound = +streamPosBound.toFixed(2);
        // (c) dieselbe loadScale OHNE Render-Last: das Schatten-Intervall ist KÜRZER (= der
        // Render-Load hat es verlängert → der Schatten-Pass läuft seltener unter GPU-Last).
        r._nexusPerfActuate({
            loadScale: 0.5,
            renderCalls: 0,
            phase: { streaming: 1, render: 0, archCulling: 0.5, waterIso: 1, creatures: 0, physics: 0 },
        });
        out.renderLoadLengthensShadow = shadowLoaded > st._shadowMinInterval + 1e-6;
        out.renderArchPos = +archPosR.toFixed(2);
        out.renderStreamPos = +streamPosR.toFixed(2);

        const pendingSnap = st.voxelMeshPending;
        st.voxelMeshPending = new Set(["0,0,0", "1,0,0", "2,0,0", "3,0,0", "4,0,0"]); // Bau-Rückstau (lädt)
        r._nexusPerfActuate({
            loadScale: 0.2, // starke Drosselung
            phase: { streaming: 20, render: 0, archCulling: 1, waterIso: 1, creatures: 0, physics: 0 },
        });
        out.loadingPinsStreamMax = Math.abs(st._voxelStreamBudgetMs - L.streamBudgetMs[1]) < 0.01;
        st.voxelMeshPending = new Set(); // settled (kein Rückstau)
        r._nexusPerfActuate({
            loadScale: 0.2,
            phase: { streaming: 20, render: 0, archCulling: 1, waterIso: 1, creatures: 0, physics: 0 },
        });
        out.settledThrottlesStream = st._voxelStreamBudgetMs < L.streamBudgetMs[1] - 0.01;
        st.voxelMeshPending = pendingSnap;

        // (9) DER ATEM-TOTBAND: im Komfort-Band [growMs, throttleMs] HÄLT der
        // Regler (er frisst den fps-Überschuss NICHT als Last → das System atmet über 60,
        // statt am 59er-Anschlag zu parken). Drei Regime, EIN Regler:
        st.perfSense = r._perfSenseInit();
        st.perfSense.loadScale = 0.5;
        st.perfSense.pidPrevErr = 0;
        st.perfSense.phase = { streaming: 1, render: 0, archCulling: 1, waterIso: 1, creatures: 0, physics: 0 };
        // (a) Frame IM Totband (15 ms ≈ 66 fps) → loadScale HÄLT (kein Wachsen, kein Pendeln).
        for (let i = 0; i < 60; i++) {
            st.perfSense.frameMs = 15;
            r._nexusPerfRegulate(0.016);
        }
        out.deadbandHolds = Math.abs(st.perfSense.loadScale - 0.5) < 0.05;
        out.deadbandLoadScale = +st.perfSense.loadScale.toFixed(3);
        // (b) KLARER Kopfraum (10 ms ≈ 100 fps, unter growMs) → loadScale wächst zum Maximum
        // (die Schönheit füllt die Reserve — langsam, das ist gewollt).
        for (let i = 0; i < 300; i++) {
            st.perfSense.frameMs = 10;
            r._nexusPerfRegulate(0.016);
        }
        out.headroomGrows = st.perfSense.loadScale > 0.9;
        out.headroomLoadScale = +st.perfSense.loadScale.toFixed(3);
        // (c) ÜBER der Decke (25 ms ≈ 40 fps) → loadScale fällt wieder (der fps-Boden schützt).
        for (let i = 0; i < 120; i++) {
            st.perfSense.frameMs = 25;
            r._nexusPerfRegulate(0.016);
        }
        out.ceilingThrottles = st.perfSense.loadScale < 0.5;
        out.ceilingLoadScale = +st.perfSense.loadScale.toFixed(3);
        // der Passagier ist gekehrt: die toten Bang-Bang-Schwellen sind weg.
        out.deadConstantsGone = A.ARCH_QUALITY_FPS_LOW === undefined && A.ARCH_QUALITY_FPS_HIGH === undefined;

        st.perfSense = snap.sense;
        st.architectureCullingRadius = snap.radius;
        st.architectureBuildBudgetPerFrame = snap.budget;
        st._voxelStreamBudgetMs = snap.streamMs;
        if (st.atmosphere && snap.waterMs !== undefined) st.atmosphere.waterIsoBudgetMs = snap.waterMs;
        st.gravity = snap.gravity;
        st.perfRegulator = snap.reg;
        return out;
    });
    if (res.error) {
        check("Perf-Regelkreis-Band (realm)", false, res.error);
        return;
    }
    check("V12.0-perf.e: kein `gravity *= 0.9`-Pflaster in selfAwarenessAnalyze", res.noGravityPflaster);
    check(
        "KEIN Parallel-Governor — selfAwarenessAnalyze ruft _nexusAdaptiveQuality NICHT (EIN Regler)",
        res.noParallelGovernor
    );
    check(
        "FPS-Druck strafft ALLE Stellgrößen der Qualität (Bau-Budget + Stream-Budget)",
        res.tightenedBudget && res.tightenedStream
    );
    check("anhaltender Druck bounded (Budget ≥ 1)", res.budgetFloor);
    check(
        "V12.0-perf.e: Gravitation NIE angetastet (die Wurzel-Heilung)",
        res.gravityUntouchedLow && res.gravityUntouchedHigh
    );
    check("FPS-Luft relaxt ALLE Stellgrößen zum Maximum", res.relaxedBudget && res.relaxedStream);
    check(
        `SYNERGIE — das teuerste Subsystem gibt zuerst nach (streamPos ${res.synergyStreamPos} < archPos ${res.synergyArchPos})`,
        res.synergyStreamThrottledMore
    );
    check("ungültige FPS (0) ändert nichts (headless-Schutz)", res.zeroFpsNoChange);
    check("Kosten-Schätzung skaliert mit n (Produktions-Ökonomie-Keim)", res.estimateScales);
    check(
        "perfSense SIEHT die Render-Last + Spikes (renderCalls/renderTris/renderCallsMax/phaseMax)",
        res.hasRenderFields
    );
    check(
        "CONSUM — der Fold füllt die GPU-Last (calls+tris EWMA) + den abklingenden Max",
        res.foldRenderLoad && res.foldRenderMax
    );
    check(
        "CONSUM — der Fold fängt den Subsystem-Spike (phaseMax neben der wegmittelnden EWMA)",
        res.foldPhaseSpike
    );
    check(
        `unter MODERATER Render-Last drosselt der Regler ARCH/Schatten (archPos ${res.renderArchPos}) MEHR als Streaming (streamPos ${res.renderStreamPos}) — Durchsatz geschützt, die Welt lädt weiter`,
        res.renderLoadThrottlesArch
    );
    check(
        `STREAMING IST HEILIG — hohe Render-Last (1100 Calls) drosselt das Streaming bei Rückstau NICHT (streamPos ${res.renderStreamPosBound} = MAX) — die Bewegung verhungert NIE am Render-Druck (Heilung des V18.276-Lauf-Freeze)`,
        res.renderLoadProtectsStreaming
    );
    check(
        "die Render-Last verlängert das Schatten-Intervall (der 613k-Schatten-Pass läuft seltener unter GPU-Last)",
        res.renderLoadLengthensShadow
    );
    check(
        "bei Bau-Rückstau lädt die Welt mit MAX Streaming-Budget — der PID drosselt NICHT den Bau, der das frameMs erzeugt (kein Pendeln, keine Lade-Hemmung)",
        res.loadingPinsStreamMax
    );
    check(
        "settled (kein Rückstau) drosselt derselbe Druck das Streaming wieder (smooth exploration — der Hebel lebt, wo er sinnvoll ist)",
        res.settledThrottlesStream
    );
    check(
        `im Totband HÄLT der Regler (loadScale ${res.deadbandLoadScale} bleibt ~0.5) — das System atmet über 60, kein 59er-Anschlag`,
        res.deadbandHolds
    );
    check(
        `klarer Kopfraum lässt die Schönheit wachsen (loadScale ${res.headroomLoadScale} → Maximum)`,
        res.headroomGrows
    );
    check(
        `über der Decke schützt der fps-Boden (loadScale ${res.ceilingLoadScale} fällt) — der Regler drosselt`,
        res.ceilingThrottles
    );
    check(
        "die toten Bang-Bang-Schwellen (ARCH_QUALITY_FPS_LOW/HIGH) sind gekehrt — kein Passagier",
        res.deadConstantsGone
    );
}

// Waldboden 04.10. — die DEKO-KASKADE IST GEFALLEN: die Klein-Vegetation hing an den Chunk-Bändern (mesh · Kreuz-
// Fernfeld · none); die Nah-Streu hängt am Schirm (Kachel-Ring um die Kamera, NAH_STREU), jenseits trägt der Boden.
// Die Kaskade trägt nur noch LOD + KI-Takt; der Loop tickt die Nah-Streu im scatterDeco-Job.
async function checkBandWaldbodenKaskade({ page, check }) {
    const res = await safeEvaluate(page, () => {
        const out = {};
        const bands = AnazhRealm.DETAIL_CASCADE;
        out.kaskadeOhneDeko = bands.every((b) => !("deko" in b) && Number.isFinite(b.aiDiv));
        const NS = AnazhRealm.NAH_STREU;
        out.schirmGebunden =
            !!NS && NS.stufe0 < NS.radius && NS.kachel > 0 && NS.radius <= 40 && NS.kachel % NS.zelle === 0;
        return out;
    });
    if (!res) {
        check("Waldboden-Kaskade: Sonde lief", false, "evaluate warf");
        return;
    }
    check("Waldboden: DETAIL_CASCADE trägt keine Deko-Bänder mehr (Ring + KI-Takt)", res.kaskadeOhneDeko === true);
    check(
        "Waldboden: die Nah-Streu ist schirm-gebunden (Armlänge < Radius ≤ 40 m, Kachel = n · Zelle)",
        res.schirmGebunden === true
    );
}

// Ω5 Perpetuum-Verbot als lebende Invariante: Modus-Wäsche (schöpfer baut gratis → pfad erntet
// Ertrag aus dem Nichts) ist durch freeBorn geschlossen — die Herkunft entscheidet den Ertrag; die
// Marke überlebt den Snapshot (sonst wüsche der Reload sie ab).
async function checkBandTailleOmega5({ page, check }) {
    const res = await safeEvaluate(page, () => {
        const out = {};
        st.blueprints["_o5_werk"] = {
            name: "_o5_werk",
            label: "Ω5-Werk",
            builtIn: false,
            parts: [
                __teil("box", "stein", 0, 0.75, 0, 1.5, 1.5, 1.5, {
                    rotation: { x: 0, y: 0, z: 0 },
                    opChain: [{ tool: "hände", op: "hand_knap", cap: 0.4, at: 0 }],
                }),
            ],
            connections: [],
        };
        const savedMode = r.getGameMode();
        // (1) die WÄSCHE ist zu: schöpfer-geborenes Werk erntet 0 im pfad.
        r.setGameMode("schöpfer");
        const gate = r._makeCostGate("_o5_werk");
        const e1 = r.spawnArchitecture("_o5_werk", { x: 4, y: 2, z: 4 }, { freeBorn: gate.free === true });
        out.gateFree = gate.ok && gate.free === true;
        out.entryMarked = !!e1 && e1.freeBorn === true;
        r.setGameMode("pfad");
        const loot = e1 ? r.harvestArchitecture(e1, "player", 1) : null;
        out.washClosed = !!loot && Object.values(loot.materials || {}).every((n) => n === 0);
        // (2) die Marke überlebt den Snapshot-Zwilling.
        r.setGameMode("schöpfer");
        const e2 = r.spawnArchitecture("_o5_werk", { x: 8, y: 2, z: 8 }, { freeBorn: true });
        const snap = r.buildStateSnapshot();
        const snapped = (snap.architectures || []).find((a) => a.id === e2.id);
        out.persisted = !!(snapped && snapped.freeBorn === true);
        if (e2) r.removeArchitecture(e2);
        // (3) ein NORMAL bezahltes/Worldgen-Werk erntet weiter (keine Über-Heilung).
        const e3 = r.spawnArchitecture("_o5_werk", { x: 12, y: 2, z: 12 }, {});
        const loot3 = e3 ? r.harvestArchitecture(e3, "player", 1) : null;
        out.paidStillYields = !!loot3 && (loot3.materials["stein"] || 0) > 0;
        r.setGameMode(savedMode);
        delete st.blueprints["_o5_werk"];
        return out;
    });
    if (!res) {
        check("Ω5: Perpetuum-Sonde lief", false, "evaluate warf");
        return;
    }
    check(
        "Ω5: die Modus-Wäsche ist ZU (schöpfer-geboren → pfad erntet 0)",
        res.gateFree && res.entryMarked && res.washClosed
    );
    check("Ω5: die Gratis-Geburt überlebt den Snapshot (kein Wäsche-Reload)", res.persisted);
    check("Ω5: ein bezahltes/Welt-Werk erntet weiter (Herkunft entscheidet, keine Über-Heilung)", res.paidStillYields);
}

// STATUSBAR auf ESSENZ: immer sichtbar nur Welt · Wetter · Modus · Zeit; die Werkstatt-Zahlen ruhen
// hinter dem ···-Toggle (persistiert). Kein Verlust: alle Items bleiben im DOM, alle Schreiber
// schreiben.
async function checkBandV18149Statusbar({ page, check }) {
    const res = await safeEvaluate(page, () => {
        const out = {};
        const bar = document.getElementById("statusbar");
        const toggle = document.getElementById("status-dev-toggle");
        out.exists = !!bar && !!toggle;
        if (!bar || !toggle) return out;
        // Essenz unmarkiert sichtbar; Dev-Items markiert (6 Stück).
        const essence = ["status-slug", "status-weather", "status-mode", "status-time"];
        out.essenceClean = essence.every((id) => {
            const el = document.getElementById(id);
            return !!el && !el.closest(".status-item").classList.contains("status-dev");
        });
        out.devMarked = bar.querySelectorAll(".status-item.status-dev").length === 6;
        // Default: Essenz (dev-hidden) + die Dev-Items sind unsichtbar, aber IM DOM.
        const savedClass = bar.classList.contains("dev-hidden");
        const savedStore = localStorage.getItem("anazh.ui.statusDev");
        try {
            bar.classList.add("dev-hidden");
            const fps = document.getElementById("status-fps");
            out.devHiddenHides = !!fps && getComputedStyle(fps.closest(".status-item")).display === "none";
            out.stillInDom = !!fps;
            // Der Toggle flippt + persistiert.
            toggle.click();
            out.toggleShows =
                !bar.classList.contains("dev-hidden") && localStorage.getItem("anazh.ui.statusDev") === "1";
            toggle.click();
            out.toggleHides =
                bar.classList.contains("dev-hidden") && localStorage.getItem("anazh.ui.statusDev") === "0";
        } finally {
            bar.classList.toggle("dev-hidden", savedClass);
            if (savedStore === null) localStorage.removeItem("anazh.ui.statusDev");
            else localStorage.setItem("anazh.ui.statusDev", savedStore);
        }
        return out;
    });
    check(
        "Statusbar: Essenz (Welt·Wetter·Modus·Zeit) + 6 Dev-Items markiert",
        res.essenceClean && res.devMarked
    );
    check("Statusbar: Dev ruht unsichtbar, bleibt aber im DOM (P17)", res.devHiddenHides && res.stillInDom);
    check("Statusbar: der ···-Toggle flippt + persistiert", res.toggleShows && res.toggleHides);
}

// HUD-Regel: auf schmalen Schirmen sitzt der Chat ÜBER der Hotbar-Ebene (Konsole und Hotbar
// kollidierten sonst).
async function checkBandV18163DetailTiefe({ page, check }) {
    const res = await safeEvaluate(page, () => {
        const out = {};
        // die Konsole-über-Hotbar-Regel lebt im CSS (媒-Query — die
        // behaviorale 1366-Probe lebt im diag; hier die Regel-Existenz).
        const css = [...document.styleSheets]
            .map((ss) => {
                try {
                    return [...ss.cssRules].map((rr) => rr.cssText).join("");
                } catch {
                    return "";
                }
            })
            .join("");
        out.hudRegel = /max-width: 1440px/.test(css) && /bottom: 110px/.test(css);
        return out;
    });
    check(
        "HUD: die Konsole weicht der Hotbar auf schmalen Schirmen (GEMESSEN: ab 1366px kollidierten sie — Chat über der Hotbar-Ebene)",
        res.hudRegel
    );
}

// W-A KONSOLE: die Zustands-CSS gewinnt über JEDEN Inline-Schreiber (Drag/Restore) — eine Drag-
// Höhe wird vom Einklappen GEDECKT und kehrt beim Entfalten zurück (drei unterscheidbare Höhen).
// Der Griff ist eine SICHTBARE Ecken-Affordanz (Messing-Winkel) mit Richtungs-Titel.
async function checkBandV18165KonsoleHeil({ page, check }) {
    const res = await safeEvaluate(page, () => {
        const out = {};
        const cons = document.getElementById("console");
        if (!cons) return { fehlt: true };
        const wasCollapsed = cons.classList.contains("collapsed");
        // Drag simulieren: Inline-Höhe KLAR über dem Widget-Deckel (38vh) — genau
        // der R-001-Bruch (die gezogene Höhe hielt die eingeklappte Konsole groß).
        cons.classList.remove("collapsed");
        cons.style.height = "500px";
        cons.style.maxHeight = "none";
        const hOffen = cons.getBoundingClientRect().height;
        cons.classList.add("collapsed");
        const hZu = cons.getBoundingClientRect().height;
        const wZu = cons.getBoundingClientRect().width;
        cons.classList.remove("collapsed");
        const hWieder = cons.getBoundingClientRect().height;
        out.offen = Math.round(hOffen);
        out.zu = Math.round(hZu);
        out.zuBreite = Math.round(wZu);
        out.wieder = Math.round(hWieder);
        // Der Kern: zugeklappt gilt der WIDGET-DECKEL (≤ 38vh, content-getrieben —
        // die Inline-500 ist GEDECKT), entfaltet kehrt die gezogene Höhe zurück.
        const deckel = window.innerHeight * 0.38 + 4;
        out.zustandGewinnt =
            hZu <= deckel && hZu < hOffen - 100 && Math.abs(hWieder - hOffen) < 2 && Math.abs(wZu - 340) < 2;
        // Aufräumen: Inline-Größe zurücknehmen + Ursprungs-Zustand.
        cons.style.height = "";
        cons.style.maxHeight = "";
        cons.classList.toggle("collapsed", wasCollapsed);
        // Der Griff ist sichtbar (Messing-Winkel, kein unsichtbares Feld) + sagt die Richtung.
        const handle = cons.querySelector(".resize-handle");
        if (handle) {
            const cs = getComputedStyle(handle);
            out.griffSichtbar = parseFloat(cs.borderTopWidth) >= 1 && parseFloat(cs.opacity) > 0.2;
            out.griffTitel = /wächst nach oben/.test(handle.getAttribute("title") || "");
        }
        return out;
    });
    check(
        `W-A Konsole: die Zustands-CSS gewinnt über die Drag-Inline-Höhe (offen ${res.offen} → zu ${res.zu}@${res.zuBreite}px → wieder ${res.wieder}) — der R-001-Bruch ist strukturell unmöglich`,
        !res.fehlt && res.zustandGewinnt
    );
    check(
        "W-A Konsole: der Griff ist eine SICHTBARE Affordanz (Messing-Winkel) und benennt die Wachstums-Richtung",
        res.griffSichtbar && res.griffTitel
    );
}

// AAA-Atmosphäre-Wand: AERIAL ist frozen, und KEIN `static get AERIAL()` in der Klasse überdeckt
// das Top-Level `AnazhRealm.AERIAL = …` (Getter ohne Setter: die non-strict-Zuweisung fällt LAUTLOS
// durch, die Antennen läsen alte Werte) — fängt die ganze Getter-Schatten-Klasse.
async function checkBandV18177AAA({ page, check }) {
    const res = await safeEvaluate(page, () => {
        const A = AnazhRealm;
        const out = {};
        // LIVE-Werte (was die Antennen wirklich lesen), NICHT Source-Strings.
        const aer = A.AERIAL || {};
        out.microStrength = aer.microStrength;
        out.aoStrength = aer.aoStrength;
        out.aoCap = aer.aoCap;
        out.frozen = Object.isFrozen(aer);
        // Doppel-Definitions-Wand: kein AKTIVER `static get AERIAL()` in der Klasse — gelesen am lebenden Deskriptor,
        // nie am Klassen-Text (der trüge nach dem Stamm-Schnitt nur den Kern): ein statischer Getter machte AERIAL zum
        // Accessor, und die §26-Zuweisung liefe im sloppy-Skript still ins Leere.
        const dAerial = Object.getOwnPropertyDescriptor(A, "AERIAL") || {};
        out.noGetterShadow = "value" in dAerial && !dAerial.get;
        return out;
    });
    check(
        "AAA: AERIAL ist frozen + ohne static-get-Schatten (Welle 6-Nachhol Sub 3g)",
        res.frozen === true && res.noGetterShadow === true
    );
    check(
        `AAA: microStrength === 0.14 (war 0.1 — GEMESSEN ${res.microStrength})`,
        Math.abs(res.microStrength - 0.14) < 1e-9
    );
    check(
        `AAA: aoStrength === 0.38 (war 0.35 — GEMESSEN ${res.aoStrength})`,
        Math.abs(res.aoStrength - 0.38) < 1e-9
    );
    check(`AAA: aoCap === 0.18 (war 0.16 — GEMESSEN ${res.aoCap})`, Math.abs(res.aoCap - 0.18) < 1e-9);
}

// Verdrahtungs-Band — KONSUM, nicht Existenz: A1 _growTreeBlueprintForSpawn (Worldgen-Hook) ·
// A2 setStructureBoost + Live-Uniform r5StructureBoost · A3 der Biss +
// _tickCreatureScentStrike (wild-KI liest scent) · A4 applyOpToPart/applyWorkshopProcessToPart → Mana.
async function checkBandV18210Verdrahtung({ page, check }) {
    const res = await safeEvaluate(page, () => {
        const A = AnazhRealm;
        const out = {};

        // ============== A1: Γ7 WORLDGEN-HOOK ==============
        // (A1a) Helper _growTreeBlueprintForSpawn existiert + ruft Helper
        // (A1b) gen-Default für FRESH ist 9 (KARST + Büsche)
        const newMeta = r._generateFreshWorldMeta("test-v18214");
        out.a1FreshGenIs4 = newMeta && newMeta.genVersion === 9;
        // (A1c) Determinismus: gleiches (species, seed) → gleicher cacheKey
        const k1 = r._growTreeBlueprintForSpawn("baum_eiche", 12345);
        const k2 = r._growTreeBlueprintForSpawn("baum_eiche", 12345);
        out.a1Deterministic = k1 && k1 === k2;
        // (A1d) Cache-Reuse: SELBER cacheKey → SELBES Bauplan-Objekt
        out.a1CacheReuse = k1 && st.blueprints[k1] && st.blueprints[k1] === st.blueprints[k2];
        // (A1e) ALLE N Varianten leben: über 8·N Seeds muss jeder Varianten-Bucket getroffen werden. Fängt
        // degenerierte Buckets (die fnv-1a-LOW-Bits sind mod 8 degeneriert → `_growTreeBlueprintForSpawn`
        // wählt mit den HOHEN Bits `hash >>> 24`).
        const NVar = A.VARIANTS_PER_SPECIES;
        const keys = new Set();
        for (let s = 0; s < 8 * NVar; s++) {
            const k = r._growTreeBlueprintForSpawn("baum_eiche", 50000 + s);
            if (k) keys.add(k);
        }
        out.a1ManyVariants = keys.size >= NVar;
        // (A1f) V17.16-Schutz: cache-Bauplan hat tag-Achsen ≈ baum_eiche
        // die Referenz-Tags kommen aus der frozen SPECIES_TAG_REFERENCE
        // (der statische baum_eiche-Bauplan ist geschnitten).
        const ref = (AnazhRealm.SPECIES_TAG_REFERENCE && AnazhRealm.SPECIES_TAG_REFERENCE.baum_eiche) || null;
        const grownBp = k1 && st.blueprints[k1];
        out.a1TagNeutral = false;
        if (ref && grownBp) {
            const got = r.computeCompoundTags(grownBp);
            let neutral = true;
            // Variations-Wand: deklarierte Spezies-Variation (SPECIES_TAG_VARIATION, Eiche lebendig +0.05) ist
            // erlaubt; Toleranz je Achse = 0.05 + |deklarierte Variation|.
            const V = (AnazhRealm.SPECIES_TAG_VARIATION || {}).baum_eiche || {};
            for (const a of ["lebendig", "dichte", "brennbar", "magieleitung"]) {
                const declared = Math.abs(V[a] || 0);
                const allowed = 0.05 + declared + 1e-9; // float-tolerance
                if (Math.abs((ref[a] || 0) - (got[a] || 0)) > allowed) neutral = false;
            }
            out.a1TagNeutral = neutral;
        }
        // (A1g) Memory-Cap: nach 300 verschiedenen seeds bleibt der Ring
        // ≤ 256 (Audit-Heilung #2: CAP 64→256, Architektur-bewusste
        // Eviction — der bounded Memory-Schutz hält weiter).
        for (let s = 0; s < 300; s++) r._growTreeBlueprintForSpawn("baum_eiche", 90000 + s);
        out.a1RingCap = !r._growTreeRing || r._growTreeRing.length <= 256;
        // ============== A1 Audit-Heilungen ==============
        // (Heilung #1) Snapshot persistiert grownBlueprints
        const snap = r.buildStateSnapshot();
        out.a1SnapshotHasGrown = !!(snap && snap.grownBlueprints && typeof snap.grownBlueprints === "object");
        // (Heilung #2) Eviction respektiert aktive Architekturen
        out.a1EvictionRespectsActive = false;
        // Setze einen test-grown-Bauplan + Architektur, force CAP-Überlauf,
        // prüfe dass der referenzierte Bauplan überlebt.
        const testKey = "grown_baum_eiche_testkey";
        st.blueprints[testKey] = {
            name: testKey,
            label: "Test",
            builtIn: true,
            _isGrown: true,
            _grownSpecies: "baum_eiche",
            instanced: true,
            parts: [__teil("cylinder", "holz", 0, 0, 0, 1, 1, 1)],
        };
        st.architectures = st.architectures || [];
        const sentinelArch = {
            id: "test-arch-v18210",
            type: testKey,
            position: { x: 0, y: 0, z: 0 },
        };
        st.architectures.push(sentinelArch);
        // Saved Ring-State + Init
        const savedRing = r._growTreeRing ? [...r._growTreeRing] : null;
        r._growTreeRing = [testKey];
        // Erzeuge 260+ Dummy-Bauplane, um CAP=256 zu überschreiten
        for (let i = 0; i < 260; i++) {
            const dummyKey = `grown_dummy_${i}`;
            st.blueprints[dummyKey] = {
                name: dummyKey,
                builtIn: true,
                _isGrown: true,
                parts: [],
            };
            r._growTreeRing.push(dummyKey);
        }
        // Trigger Eviction durch einen weiteren Spawn-Versuch
        r._growTreeBlueprintForSpawn("baum_eiche", "trigger-eviction");
        // Der referenzierte testKey muss überleben
        out.a1EvictionRespectsActive = !!st.blueprints[testKey];
        // Cleanup
        st.architectures = st.architectures.filter((a) => a.id !== sentinelArch.id);
        delete st.blueprints[testKey];
        for (let i = 0; i < 260; i++) delete st.blueprints[`grown_dummy_${i}`];
        r._growTreeRing = savedRing;
        // (Heilung #3) SPEZIES-DIVERSITÄT: 6 Arten erzeugen unterschiedliche Geometrie
        const species = ["baum_eiche", "baum_kiefer", "baum_birke", "baum_erle", "baum_buche", "baum_tanne"];
        const sigs = new Set();
        for (const sp of species) {
            const p = r._growTreeBlueprint(sp, "audit-test-seed");
            if (Array.isArray(p)) {
                // Signatur = aggregierter Höhe/Krone-Farbe-Hash (kein vollständiger JSON-Vergleich,
                // weil Position-Jitter durch verschiedenen seedString variiert).
                let maxY = 0,
                    leafColor = 0,
                    leafCount = 0;
                for (const part of p) {
                    if (part.position.y + part.size.y * 0.5 > maxY) maxY = part.position.y + part.size.y * 0.5;
                    if (part.material === "laub" && typeof part.color === "number") {
                        leafColor += part.color;
                        leafCount++;
                    }
                }
                const sig = `${maxY.toFixed(1)}|${(leafColor / Math.max(1, leafCount)).toFixed(0)}|${p.length}`;
                sigs.add(sig);
            }
        }
        out.a1SpeciesDistinct = sigs.size >= 4; // wenigstens 4 unterschiedlich (Eiche/Kiefer/Tanne/Birke sind klar trennbar)

        // ============== A2: R5 LIVE-UNIFORM + SLIDER ==============
        const au = r._ensureAtmoUniforms();
        // (A2c) Setter existiert + setzt Uniform + persistiert
        const before = au.r5StructureBoost.value;
        r.setStructureBoost(2.0);
        out.a2SetterUpdatesUniform = au.r5StructureBoost.value === 2.0;
        out.a2SetterPersists = st.atmosphere.r5StructureBoost === 2.0;
        // Range clamp: 3.0 → 2.5 (cap), 0.1 → 0.5 (floor)
        r.setStructureBoost(5.0);
        out.a2SetterCapsHi = au.r5StructureBoost.value === 2.5;
        r.setStructureBoost(0.1);
        out.a2SetterCapsLo = au.r5StructureBoost.value === 0.5;
        r.setStructureBoost(before); // restore

        // ============== A3: der Biss der KREATUR-KI ==============
        // (die Witterung urteilt gate:kreatur-takt jagdkreis am echten Takt)
        const savedMode = r.getGameMode();
        const savedCreatures = st.creatures;
        try {
            r.setGameMode("pfad");
            // Strike-Range-Test mit ECHTEN Leibern (0710-4: der Biss stößt durch das EINE Impuls-Gesetz und liest die
            // Masse aus der Gestalt — ein körperloser Stub hat keine, der Biss bräche fail-closed): ein Wolf, ein Fuchs
            // in 1,2 m → der Ansprung trifft UND stößt die Beute vom Jäger weg.
            st.creatures = savedCreatures;
            const pmS = st.playerMesh.position;
            const capS = st.maxCreatures;
            st.maxCreatures = Math.max(capS || 0, savedCreatures.length + 2);
            const opt = { precise: true, bodySize: 1 };
            const jaeger = r.spawnCreatureAt(pmS.x + 340, pmS.y, pmS.z - 340, "calm", "wolf", opt);
            const beute = jaeger && r.spawnCreatureAt(pmS.x + 342, pmS.y, pmS.z - 340, "calm", "fuchs", opt);
            st.maxCreatures = capS;
            if (jaeger && beute) {
                const B0 = { x: jaeger.position.x + 1.2, z: jaeger.position.z };
                beute.position.set(B0.x, jaeger.position.y, B0.z);
                beute.userData.hp = 1e6; // der Biss soll stoßen, nicht töten
                beute.userData._stossV = null;
                jaeger.rotation.set(0, Math.PI / 2, 0); // der Beute zugewandt
                jaeger.userData._steuer = null;
                st.creatures = [jaeger, beute];
                jaeger.userData.nextHuntStrikeAt = -Infinity;
                const struck = r._tickCreatureScentStrike(jaeger);
                // DER BISS IST DER ANSPRUNG (Posten 5): der Takt des Spiels läuft (der Kreatur-Takt, dann
                // der feste Sim-Schritt der Leiber), bis das Maul am Leib schnappt (höchstens 1,5 s; die Beute steht still)
                for (let k = 0; struck && k < 90; k++) {
                    const A0 = jaeger.userData._verhaltenAktion;
                    if (!A0 || !A0.biss) break;
                    beute.position.x = B0.x;
                    beute.position.z = B0.z;
                    beute.userData._steuer = null;
                    r.updateCreatures(1 / 60);
                    r._kreaturStossSchritt(1 / 60);
                    r._leibKontakte();
                }
                const sv = beute.userData._stossV;
                out.a3StrikeHits = struck === true && !!sv && sv.x > 0;
                st.creatures = savedCreatures;
            }
            if (jaeger) r.removeCreature(jaeger);
            if (beute) r.removeCreature(beute);
        } catch (e) {
            out.a3Error = String((e && e.message) || e);
        } finally {
            st.creatures = savedCreatures;
            r.setGameMode(savedMode);
        }

        // ============== A4: MANA-KONSUMENT γ ==============
        // (A4d) BEHAVIORAL: phaseChange-Op (ritueller-stab) zieht Mana statt Stamina
        const sm = r.getGameMode();
        // saubere Test-Hygiene: state vorher
        // SCHNAPPEN (Stat-Felder + tools-Liste), nachher EXAKT restaurieren.
        const savedManaA4 = st.player.mana;
        const savedManaMaxA4 = st.player.manaMax;
        const savedStamA4 = st.player.stamina;
        const savedStamMaxA4 = st.player.staminaMax;
        const savedToolsA4 = Array.isArray(st.player.tools) ? [...st.player.tools] : [];
        try {
            r.setGameMode("pfad");
            st.player.manaMax = 100;
            st.player.mana = 50;
            st.player.staminaMax = 100;
            st.player.stamina = 50;
            // Ein eigener Bauplan zum Editieren (kein builtIn)
            const bpName = "test_v18210_bp";
            if (!st.player.tools.includes("ritueller-stab")) {
                st.player.tools.push("ritueller-stab");
            }
            st.blueprints[bpName] = {
                name: bpName,
                label: "Test",
                builtIn: false,
                parts: [
                    {
                        material: "quarz", // phaseChange-kompatibel
                        shape: "sphere",
                        position: { x: 0, y: 0, z: 0 },
                        size: { x: 1, y: 1, z: 1 },
                    },
                ],
            };
            const manaBefore = st.player.mana;
            const stamBefore = st.player.stamina;
            const result = r.applyOpToPart(bpName, 0, "ritueller-stab");
            out.a4ResultOk = result && result.ok === true;
            out.a4ManaWasDrained = st.player.mana < manaBefore;
            out.a4StaminaUntouched = st.player.stamina === stamBefore;
            // Mana zu klein → ablehnen, Mana unverändert (atomar)
            st.player.mana = 1;
            const result2 = r.applyOpToPart(bpName, 0, "ritueller-stab");
            out.a4InsufficientRejected = result2 && result2.ok === false && result2.reason === "not_enough_mana";
            out.a4InsufficientAtomic = st.player.mana === 1;
            // Stamina-Op (hände) zieht Stamina, NICHT Mana
            st.player.mana = 100;
            st.player.stamina = 50;
            const manaBeforeStam = st.player.mana;
            const stamBeforeStam = st.player.stamina;
            r.applyOpToPart(bpName, 0, "hände");
            out.a4HandsZiehtStamina = st.player.stamina < stamBeforeStam;
            out.a4HandsManaUntouched = st.player.mana === manaBeforeStam;
            // Schöpfer-Modus: keine Kosten
            r.setGameMode("schöpfer");
            st.player.mana = 50;
            st.player.stamina = 50;
            const result3 = r.applyOpToPart(bpName, 0, "ritueller-stab");
            out.a4SchoepferOk = result3 && result3.ok === true;
            out.a4SchoepferKostenfrei = st.player.mana === 50 && st.player.stamina === 50;
            // Cleanup
            delete st.blueprints[bpName];
        } catch (e) {
            out.a4Error = String(e && (e.message || e));
        } finally {
            r.setGameMode(sm);
            // exakt restaurieren, damit
            // nachfolgende Bands den Spieler frisch sehen (sonst leaken
            // ritueller-stab im Werkzeug-Inventar + Stat-Drift).
            st.player.mana = savedManaA4;
            st.player.manaMax = savedManaMaxA4;
            st.player.stamina = savedStamA4;
            st.player.staminaMax = savedStamMaxA4;
            st.player.tools = savedToolsA4;
        }

        return out;
    });

    // A1 — Worldgen-Hook
    check("FRESH-Welt genVersion = 9 (KARST + Büsche aktiv; war 8)", res.a1FreshGenIs4 === true);
    check("V18.210-A1c Determinismus: (species, seed) → derselbe cacheKey", res.a1Deterministic === true);
    check("V18.210-A1d Cache-Reuse: SELBE seed → SELBES Bauplan-Object", res.a1CacheReuse === true);
    check("V18.210-A1e 6 seeds → ≥5 unique cache keys", res.a1ManyVariants === true);
    check("V18.210-A1f V17.16-Schutz: tag-Achsen ≈ baum_eiche (4×Δ<0.05)", res.a1TagNeutral === true);
    check(
        "V18.210-A1g Memory-Cap: Ring ≤ 256 nach 300 seeds (V18.210-Audit #2 CAP-Erweiterung)",
        res.a1RingCap === true
    );

    // A2 — R5 Live-Slider
    check("V18.210-A2c2 Setter aktualisiert Uniform live", res.a2SetterUpdatesUniform === true);
    check("V18.210-A2c3 Setter persistiert (atmosphere.r5StructureBoost)", res.a2SetterPersists === true);
    check("V18.210-A2c4 Setter cap-clamp (5.0 → 2.5)", res.a2SetterCapsHi === true);
    check("V18.210-A2c5 Setter floor-clamp (0.1 → 0.5)", res.a2SetterCapsLo === true);

    // A3 — der Biss
    check(
        "V18.210-A3e3 BEHAVIORAL: Beute in 1.5m → der Biss trifft und stößt sie weg (echte Leiber, 0710-4)",
        res.a3StrikeHits === true,
        res.a3Error || ""
    );

    // A1 — Audit-Heilungen (Persistenz + Eviction + Spezies-Diversität)
    check(
        "V18.210-A1-Heil1 Snapshot persistiert grownBlueprints (Audit #1, Reload-Riss strukturell tot)",
        res.a1SnapshotHasGrown === true
    );
    check(
        "V18.210-A1-Heil2 Eviction-Wand: aktiver grown-Bauplan wird NIE evictet (Audit #2)",
        res.a1EvictionRespectsActive === true
    );
    check(
        "V18.210-A1-Heil3 SPEZIES-Diversität: 6 Arten erzeugen UNTERSCHIEDLICHE Geometrie (Audit #3, V18.181-Mischwald ehrt)",
        res.a1SpeciesDistinct === true
    );

    // A4 — Mana-Konsument
    check("V18.210-A4d BEHAVIORAL: ritueller-stab (phaseChange) zieht Mana", res.a4ManaWasDrained === true);
    check("V18.210-A4d2 BEHAVIORAL: ritueller-stab lässt Stamina unberührt", res.a4StaminaUntouched === true);
    check(
        "V18.210-A4d3 BEHAVIORAL: mana<cost → not_enough_mana (atomar, mana unverändert)",
        res.a4InsufficientRejected === true
    );
    check("V18.210-A4d3b BEHAVIORAL: atomarer Reject — Mana unverändert", res.a4InsufficientAtomic === true);
    check("V18.210-A4e BEHAVIORAL: hände (subtractive) zieht weiterhin Stamina", res.a4HandsZiehtStamina === true);
    check("V18.210-A4e2 BEHAVIORAL: hände lässt Mana unberührt", res.a4HandsManaUntouched === true);
    check("V18.210-A4f BEHAVIORAL: schöpfer-Modus kostenfrei", res.a4SchoepferKostenfrei === true);
}

// DAS RAUSCH-GESETZ (der Boden-Stoff): Boden-, Substanz- und Mikro-Stoffe lesen EIN Gradienten-Rauschen aus dem
// Rausch-Atlas (`_rauschAtlas`), nie das Hash-Rauschen `mx_noise_float` (je Aufruf 8 Gitter-Hashes, 26 je Boden-Fragment).
// Proben: Absenz im Code der fünf Stoff-Bauer · KONSUM im Knoten-Graph des GEZEICHNETEN Boden-Stoffs (die Shader-Kosten-
// Linse `__stoffGraph`, scripts/lib/shader-kosten.cjs: kein Rausch-Funktions-Knoten, die 70 Ladungen des Atlas im Graph — 7 Raum-
// Werte × 6 + 14 Ebenen × 2 = 70 (material.K2 `ebeneNeigung` 76 → 70; K53: der Fleck des Wiesen-Grunds ging mit ihm ins Gesetz, `_bodenFarbeAt`, 78 → 76;
// K17-3 Runde 2: die acht Halm-Schichten der Wiese stehen wieder ausgeschrieben, ihre Mischung in
// der reinen Funktion `rauschEbene` — als Schleife in `wieseRelief` las eine Layout-Funktion die Bindung des Atlas); die siebte Raum-Probe ist die Welle der Fels-Bänke, `rausch` des Rechenwerks, auf der CPU
// gelaende-core `rauschRaum` —, kein verborgener Fn-Rumpf (der Fels-Term rechnet im Zweig des Stamms, `_zweigTSL`: sein Inhalt
// reist als Argument, der Graph sieht ihn); die Basis f2361bb1 trägt dort 26 mx-Knoten und 0 Ladungen) · das Rechenwerk des
// Fels-Gesetzes rechnet kein Rauschen aus Hash-Zügen (K17 wellte die Bänke mit einem Wert-Rauschen aus acht Ziehungen im
// Fragment: die Ladungen fielen 78 → 72, die Absenz sah es nicht) · die
// Atlas-Bytes sind die MaterialX-Gradienten (lookup3, eigene Portierung hier) und richtig gepackt. Die GPU-Gleichheit (WGSL
// gegen CPU) und das Budget des erzeugten WGSL misst dieselbe Linse am echten Renderer (`werkbank shader --stoff boden
// --rauschprobe`).
async function checkBandRauschGesetz({ page, check }) {
    await page.evaluate(SK.SHADER_INSTALL);
    const res =
        (await safeEvaluate(page, () => {
            const A = AnazhRealm;
            const out = {};
            const stoffe = [
                "_terrainGeologyAlbedo",
                "_substanceCharacter",
                "_wegeBodenFarbe",
                "_applySubstanceResponse",
                "_buildPbrNodeMaterial",
            ];
            out.absenz = stoffe.filter((n) => !window.__fehlt(r[n], /mx_noise_float/));
            // das Rechenwerk des Fels-Gesetzes (gelaende-core): Fein-Term und Schutt-Korn laufen im Fragment — ein Rauschen
            // lesen sie nur über `o.rausch` (EINE Probe im Rausch-Atlas), nie ein Gitter-Rauschen aus Ziehungen (`wert3`)
            // (die Welle rechnet `felsWelle`, K17-3: der Shader liest sie außerhalb der Fels-Funktion und reicht sie hinein)
            const GK = window.__gelaendeCore || {};
            for (const n of ["felsFein", "felsWelle", "schuttKorn"])
                if (!window.__fehlt(GK[n], /wert3|mx_noise/)) out.absenz.push(n + " (Gitter-Rauschen aus Ziehungen)");
            // KONSUM: der Knoten-Graph des Stoffs, den der Boden zeichnet (vor dem Bau — was der Compiler liest)
            out.graph = window.__stoffGraph(st.voxelChunkMaterial);
            out.halm = window.__stoffGraph(r._foundryTreeMaterial("grass", null));
            // DIE ATLAS-BYTES: die MaterialX-Gradienten aus lookup3 (eigene Portierung), gepackt je Komponente × 4 Ecken
            const P = A.RAUSCH_GESETZ.P;
            const d = A._rauschAtlasDaten();
            const mxHash = window.mxLookup3; // die EINE Portierung (scripts/lib/shader-kosten.cjs, SHADER_INSTALL)
            // der Gradient als Wert der mx-Regel an den Einheits-Achsen: g = (grad(h,1,0,0), grad(h,0,1,0), grad(h,0,0,1))
            const mxGrad = (h, x, y, z) => {
                const u = h < 8 ? x : y;
                const v = h < 4 ? y : h === 12 || h === 14 ? x : z;
                return (h & 1 ? -u : u) + (h & 2 ? -v : v);
            };
            const texel = (i, j, c, e) => d[(j * 3 * P + 3 * i + c) * 4 + e];
            let falsch = 0;
            let packung = 0;
            const ebenen = { xy: 0, xz: 0, yz: 0 };
            for (let j = 0; j < P; j++)
                for (let i = 0; i < P; i++) {
                    const h = mxHash(i, j, 0) & 15;
                    const g = [mxGrad(h, 1, 0, 0), mxGrad(h, 0, 1, 0), mxGrad(h, 0, 0, 1)];
                    // unorm: −1 · 0 · +1 = 0 · 127 · 254 (nie snorm — nicht überall Render-Ziel)
                    for (let c = 0; c < 3; c++) if (texel(i, j, c, 0) !== 127 * (g[c] + 1)) falsch++;
                    if (g[2] === 0) ebenen.xy++;
                    else if (g[1] === 0) ebenen.xz++;
                    else ebenen.yz++;
                    // die Ecke (i+1, j) der Zelle i ist die Ecke (i, j) der Zelle i+1; (i, j+1) die (i, j) der Zeile j+1
                    const i1 = (i + 1) % P;
                    const j1 = (j + 1) % P;
                    for (let c = 0; c < 3; c++)
                        if (
                            texel(i, j, c, 1) !== texel(i1, j, c, 0) ||
                            texel(i, j, c, 2) !== texel(i, j1, c, 0) ||
                            texel(i, j, c, 3) !== texel(i1, j1, c, 0)
                        )
                            packung++;
                }
            out.falsch = falsch;
            out.packung = packung;
            // die mx-Verteilung der Gradienten-Ebenen: (x,y) 6/16 · (x,z) 4/16 · (y,z) 6/16
            const n = P * P;
            out.ebenen = [ebenen.xy / n, ebenen.xz / n, ebenen.yz / n].map((v) => +v.toFixed(3));
            out.verteilung =
                Math.abs(ebenen.xy / n - 6 / 16) < 0.02 &&
                Math.abs(ebenen.xz / n - 4 / 16) < 0.02 &&
                Math.abs(ebenen.yz / n - 6 / 16) < 0.02;
            return out;
        })) || {};
    check(
        `RAUSCH-GESETZ (A) Absenz: kein mx_noise_float in den Boden- und Substanz-Stoffen, kein Gitter-Rauschen aus Ziehungen im Rechenwerk des Fels-Gesetzes (${(res.absenz || []).join(", ") || "keiner"})`,
        Array.isArray(res.absenz) && res.absenz.length === 0
    );
    const g = res.graph || {};
    const atlas = (g.texturen && g.texturen["rausch-atlas"]) || 0;
    const namen = Object.entries(g.rauschNamen || {})
        .map(([f, c]) => f + " ×" + c)
        .join(", ");
    check(
        `RAUSCH-GESETZ (B) KONSUM: der gezeichnete Boden-Stoff trägt im Knoten-Graph ${atlas} Atlas-Ladungen (Soll 70), ${g.rauschen} Rausch-Funktionen (Soll 0${namen ? ": " + namen : ""}) und ${g.verborgen} verborgene Fn-Rümpfe (Soll 0; ${g.zweig} Zweige des Stamms) — ${g.knoten} Knoten aus ${(g.slots || []).length} Slots${g.fehler ? " — " + g.fehler : ""}`,
        !g.fehler && g.rauschen === 0 && g.verborgen === 0 && atlas === 70
    );
    check(
        `RAUSCH-GESETZ (C) die Atlas-Bytes sind die MaterialX-Gradienten (${res.falsch} falsch) und richtig gepackt (${res.packung} Brüche)`,
        res.falsch === 0 && res.packung === 0
    );
    check(
        `RAUSCH-GESETZ (D) die Gradienten-Ebenen tragen die mx-Verteilung 6/4/6 von 16 (${(res.ebenen || []).join(" / ")})`,
        res.verteilung === true
    );
    // (E) das Mikro-Detail gilt dem Pixel des Schirms (material.K2, w4-wiese-nah): Boden und Halm lesen `schirmJeSzene`
    const schirm = (x) => ((x && x.uniformen) || {}).schirmJeSzene || 0;
    check(
        `MIKRO AM SCHIRM (E): Boden- und Halm-Stoff lesen den Schirm-Pixel je Szenen-Pixel (${schirm(g)} / ${schirm(res.halm)} Knoten)`,
        schirm(g) > 0 && schirm(res.halm) > 0
    );
}

async function checkBandV18331ReplayDeterminism({ page, check }) {
    const res = await safeEvaluate(page, () => {
        const s = st;
        const out = {};
        if (!s.playerMesh || !s.playerVel) return out;
        const DT = 1 / 60;
        const mkFrames = (seq) => {
            const fr = [];
            for (const [count, k] of seq)
                for (let i = 0; i < count; i++)
                    fr.push({ dt: DT, yaw: 0, vor: (k.w ? 1 : 0) - (k.s ? 1 : 0), quer: k.d ? -1 : 0, sprint: false, sprung: !!k.space });
            return fr;
        };
        const sy = r.getTerrainHeightAt(0, 0);
        const startY = (Number.isFinite(sy) ? sy : 5) + 2;
        // BÜHNE: die Ankunft der Welt (jeder Erst-Spawn auf 0/0), die Höhe aus dem Gesetz
        s.playerMesh.position.set(0, startY, 0);
        s.playerVel.setValue(0, 0, 0);
        s._fieldVy = 0;
        s.yaw = 0;
        const start = r._replaySnapshotState();
        const framesA = mkFrames([
            [40, { w: true }],
            [1, { w: true, space: true }],
            [40, { w: true }],
            [30, { w: true, d: true }],
            [20, {}],
        ]);
        const framesB = mkFrames([[80, { s: true }]]);
        const recA = { start, frames: framesA };
        const eqBit = (p, q) =>
            p &&
            q &&
            p.x === q.x &&
            p.y === q.y &&
            p.z === q.z &&
            p.vx === q.vx &&
            p.vy === q.vy &&
            p.vz === q.vz &&
            p.fieldVy === q.fieldVy;
        const dist = (p, q) => Math.hypot(p.x - q.x, p.y - q.y, p.z - q.z);
        const a1 = r.replayRun(recA);
        const a2 = r.replayRun(recA);
        const a3 = r.replayRun(recA);
        const b = r.replayRun({ start, frames: framesB });
        out.bitEqual = eqBit(a1, a2) && eqBit(a1, a3); // (A) + (D) repeatable
        out.moved = dist(start, a1); // (B) non-trivial
        out.inputSensitive = !eqBit(a1, b) && dist(a1, b) > 0.5; // (C)
        return out;
    });
    check(
        `P4 (Determinismus-Ernte): zwei+drei Replays derselben Aufnahme sind BIT-IDENTISCH (Determinismus bewiesen)`,
        res.bitEqual === true
    );
    check(
        `P4: der Replay bewegt den Spieler spürbar (${(res.moved || 0).toFixed(2)} m, kein No-op)`,
        (res.moved || 0) > 2.0
    );
    check(
        "P4: ein anderer Input liefert ein anderes Ergebnis (input-sensitiv, kein Fixpunkt)",
        res.inputSensitive === true
    );
}

// Perf-Panel + Perf-Export — eingefaltet aus gate:perf-panel: Schöpfer V18.472 „optimiere das perf-panel … damit ich
// spielen kann, einen screenshot erstellen kann … einen button für den export der daten". (P) das Panel füllt seine Felder
// aus den EINEN Quellen (perfSense · Flugschreiber · Impostor-Zensus), der Kopf trägt die VERSION; (E) der Export liefert
// denselben Flugschreiber-Trace als Datei; SELBST-TEST: ein leerer Flugschreiber liest als „kein Export".
async function checkBandPerfPanel({ page, check }) {
    const out = await safeEvaluate(page, async () => {
        const res = {};
        // ~4 s Sim pumpen, damit Flugschreiber + Sekunden-Ring Substanz tragen (der Ring rollt an echter Wanduhr)
        let t = performance.now();
        for (let i = 0; i < 40; i++) {
            for (let k = 0; k < 12; k++) {
                t += 16.7;
                try {
                    r._gameLoopTick(t);
                } catch {}
            }
            await sleep(110);
        }
        const panelVorher = st.perfPanel;
        st.perfPanel = true;
        r._perfPanelLast = 0;
        r._perfPanelRender();
        const fr = st.flightRecorder;
        res.ringN = fr && fr.secRingN ? fr.secRingN : 0;
        res.head = (document.getElementById("pp-head") || {}).textContent || "";
        res.grid = (document.getElementById("pp-grid") || {}).textContent || "";
        res.buckets = (document.getElementById("pp-buckets") || {}).textContent || "";
        const cv = document.getElementById("pp-ring");
        // Canvas wirklich GEMALT: Pixel über dem Hintergrund
        if (cv && cv.getContext && cv.getContext("2d")) {
            const d = cv.getContext("2d").getImageData(0, 0, cv.width, cv.height).data;
            let hit = 0;
            for (let i = 0; i < d.length; i += 4) if (d[i] > 30 || d[i + 1] > 30 || d[i + 2] > 60) hit++;
            res.canvasPixel = hit;
        }
        // Export (a.click lädt headless nichts herunter — Rückgabe + JSON sind der Beweis)
        const exp = r._exportPerfTrace();
        res.export = exp ? { name: exp.name, bytes: exp.bytes } : null;
        const trace = exp ? r._flightRecorderBuildTrace() : null;
        res.trace = !!(trace && trace.session && trace.session.frames > 0 && "impostorZensus" in trace && trace.version);
        const saved = st.flightRecorder;
        st.flightRecorder = null;
        res.selbstTestKeinTrace = r._exportPerfTrace() === null;
        st.flightRecorder = saved;
        st.perfPanel = panelVorher;
        return res;
    });
    const o = out || {};
    const version = require(path.join(SKRIPTE, "..", "package.json")).version;
    check("Perf-Panel (P) Kopf trägt fps + VERSION (Screenshot-Pflichtfeld)", /fps/.test(o.head) && String(o.head).includes("V" + version), String(o.head).slice(0, 60));
    check(
        "Perf-Panel (P) Grid trägt frame · draw-calls · tris · GPU (echt|proxy) · Impostor, die ms-Verteilung ihre 6 Eimer",
        /frame ø/.test(o.grid) && /draw-calls/.test(o.grid) && /tris/.test(o.grid) && /GPU \((echt|proxy)\)/.test(o.grid) && /Impostor/.test(o.grid) && /ms-Verteilung/.test(o.buckets) && /<17/.test(o.buckets)
    );
    check(`Perf-Panel (P) Sekunden-Ring rollt (${o.ringN}s) + Canvas ist GEMALT (${o.canvasPixel || 0} px)`, o.ringN >= 2 && (o.canvasPixel || 0) > 200);
    check(
        "Perf-Panel (E) der Export liefert die Datei, ihr Trace trägt session/impostorZensus/version",
        !!(o.export && /^anazhRealmPerf-V[\d.]+-.*\.json$/.test(o.export.name) && o.export.bytes > 500 && o.trace),
        o.export ? `${o.export.name} · ${o.export.bytes} B` : "null"
    );
    check("Perf-Panel SELBST-TEST: ohne Flugschreiber kein Export (die Linse feuert)", o.selbstTestKeinTrace === true);
}

// Existenz-Boden des Dispatchers — eingefaltet aus gate:existenz-boden: ein Budget ≤ 0 lässt die Substanz-Queues
// nie monoton wachsen. Lehre 13: Existenz vor Framerate — Substanz (prio 1: waterIso) läuft bei leerem Budget
// JEDEN Frame, Deko (prio ≥ 2) jeden 4.; K40 der Dauer-Strom: baut jeder Takt Terrain, läuft das Deko-Innere trotzdem jeden 4.
async function checkBandExistenzBoden({ page, check }) {
    const out = await safeEvaluate(page, () => {
        const s = st;
        const pos = s.playerMesh.position;
        const res = {};
        const leer = { remainingMs: () => 0 }; // die render-gebundene Maschine des Schöpfers
        const frameNo = r._schedFrameNo;
        // (a) Substanz läuft JEDEN Frame, Deko nur jeden 4.
        const gesehen = { waterIso: 0, deko: 0, laeufe: 0 };
        for (let i = 0; i < 8; i++) {
            const ran = r._dispatchFrameJobs(r._buildDeferrableJobs(pos), leer);
            gesehen.laeufe++;
            if (ran.includes("waterIso")) gesehen.waterIso++;
            if (ran.includes("scatterDeco") || ran.includes("grass")) gesehen.deko++;
        }
        res.gesehen = gesehen;
        // (b) eine GEFÜLLTE Wasser-Queue schrumpft unter leerem Budget
        if (!s.pendingWaterIso) s.pendingWaterIso = new Set();
        for (const key of s.voxelChunks.keys()) {
            s.pendingWaterIso.add(key);
            if (s.pendingWaterIso.size >= 6) break;
        }
        res.queueVor = s.pendingWaterIso.size;
        for (let i = 0; i < 30 && s.pendingWaterIso.size > 0; i++) r._dispatchFrameJobs(r._buildDeferrableJobs(pos), leer);
        res.queueNach = s.pendingWaterIso.size;
        // (c) SELBST-TEST: ein Sonde-Job prio 2 läuft auf einem Nicht-4er-Frame NICHT
        r._schedFrameNo = 1;
        let sondeLief = false;
        r._dispatchFrameJobs([{ name: "sonde", prio: 2, run: () => (sondeLief = true) }], leer);
        res.bodenIstBoden = sondeLief === false;
        // (d) DER DAUER-STROM: gezählt wird das Innere der Deko (der Scatter-Takt), nicht der Job
        let innen = 0;
        const zurueck = leihe(r, { _tickVoxelChunkStreaming: () => 1, _tickScatterStreaming: () => innen++ });
        const voll = { remainingMs: () => 16 };
        try {
            r._schedFrameNo = 0;
            for (let i = 0; i < 8; i++) r._dispatchFrameJobs(r._buildDeferrableJobs(pos), voll);
            res.dauerStromDeko = innen;
            // (e) SELBST-TEST: im Nicht-4er-Takt mit Terrain-Bau wartet das Innere (Terrain zuerst)
            innen = 0;
            r._schedFrameNo = 1;
            r._dispatchFrameJobs(r._buildDeferrableJobs(pos), voll);
            res.terrainZuerst = innen === 0;
        } finally {
            zurueck();
            r._schedFrameNo = frameNo;
        }
        return res;
    });
    const o = out || { gesehen: {} };
    const g = o.gesehen;
    check("Existenz-Boden (a) SUBSTANZ (waterIso) läuft JEDEN Frame trotz Budget 0, DEKO gedrosselt (jeden 4.)", g.laeufe > 0 && g.waterIso === g.laeufe && g.deko > 0 && g.deko <= Math.ceil(g.laeufe / 4) * 2, JSON.stringify(g));
    check(`Existenz-Boden (b) die Wasser-Queue SCHRUMPFT unter leerem Budget (${o.queueVor} → ${o.queueNach})`, o.queueNach < o.queueVor);
    check("Existenz-Boden SELBST-TEST: prio-2 läuft NICHT auf Nicht-4er-Frames (der Boden ist ein Boden)", o.bodenIstBoden === true);
    check("Existenz-Boden (d) DAUER-STROM: baut jeder Takt Terrain, läuft das Deko-Innere trotzdem jeden 4. Takt", o.dauerStromDeko >= 2, `${o.dauerStromDeko} von 8 Takten`);
    check("Existenz-Boden (e) SELBST-TEST: im Nicht-4er-Takt mit Terrain-Bau wartet die Deko (Terrain zuerst)", o.terrainZuerst === true);
}

// Godrays (V8 Kür) — eingefaltet aus gate:godray: der volumetrische Screen-Space-Light-Shaft im EINEN Post-FX-Pass.
// (A) die reine `_godrayFrameGate` remappt Höhe×Wetter (dass der March im Ausgabe-Bild zeichnet, beweist gate:post-kette an
// und aus); (B) der Perf-Hebel als ZAHL: Last → 0, Kopfraum → MAX, headless → MAX.
async function checkBandGodray({ page, check }) {
    const o = await safeEvaluate(page, () => {
        const out = { MAX: AnazhRealm.PERF_GODRAY_MAX };
        // die reine `_godrayFrameGate`: Sonne hoch + klar → hoch; unter Horizont → 0; Sturm → ~0
        out.gateHigh = r._godrayFrameGate(0.9, 1.0);
        out.gateBelow = r._godrayFrameGate(-0.2, 1.0);
        out.gateTief = r._godrayFrameGate(0.03, 1.0);
        out.gateStorm = r._godrayFrameGate(0.9, AnazhRealm.WEATHER_FIELD.stormy.sun);
        // (B) PERF-HEBEL als ZAHL — headless-Kurzschluss kontrolliert umgehen (wie der Schatten-Regler)
        const wasNull = st.renderer && st.renderer._isHeadlessNull;
        const sense = (ls, calls, frameMs) => ({ loadScale: ls, phase: { archCulling: 1, render: 1, streaming: 0, waterIso: 0 }, renderCalls: calls, frameMs });
        try {
            if (st.renderer) st.renderer._isHeadlessNull = true;
            r._nexusPerfActuate(sense(0.0, 2000, 60));
            out.headlessScale = st._godrayScale;
            if (st.renderer) st.renderer._isHeadlessNull = false;
            r._nexusPerfActuate(sense(0.0, 2000, 60)); // heavy → effArch ~0 → Faktor ~0
            out.heavyScale = st._godrayScale;
            r._nexusPerfActuate(sense(1.0, 0, 8)); // light → effArch ~1 → Faktor ~MAX
            out.lightScale = st._godrayScale;
        } finally {
            if (st.renderer) st.renderer._isHeadlessNull = wasNull;
        }
        return out;
    });
    const g = o || {};
    check("Godray (A) `_godrayFrameGate`: Mittag/klar > 0,6 · unter Horizont 0 · 1,7° darüber auf (die Tag-Achse, keine eigene Schwelle) · Sturm < 0,05", g.gateHigh > 0.6 && g.gateBelow === 0 && g.gateTief > 0 && g.gateStorm != null && g.gateStorm < 0.05, `${g.gateHigh} · ${g.gateBelow} · ${g.gateTief} · ${g.gateStorm}`);
    check(
        "Godray (B) der Perf-Hebel: headless → MAX, Last → aus, Kopfraum → MAX, klar getrennt",
        g.headlessScale != null && Math.abs(g.headlessScale - g.MAX) < 1e-6 && g.heavyScale < 0.1 && g.lightScale > g.MAX - 0.05 && g.heavyScale < g.lightScale - 0.4,
        `headless ${g.headlessScale} · heavy ${g.heavyScale} · light ${g.lightScale} (MAX ${g.MAX})`
    );
}

// Die EINE Szenen-Skala + die Laub-Layer-Trennung — eingefaltet aus gate:foliage-res: bis K50 rechnete der Regler
// einen Laub-Faktor (`_foliageResScale`), den kein Pass las — er fiel. (1) `_szeneSkalaWirk`: mit zeitlicher Auflösung der Wert
// des Spielers, geklemmt auf [SZENE_SKALA_MIN, 1], ohne Wert SZENE_SKALA, ohne TRAA 1; (2) `_markFoliageLayer` und die echten
// Gruppen: Laub trägt FOLIAGE_LAYER + Layer 0, Platziertes nur Layer 0; (3) der Regler trägt die Auflösung nicht; (4) der
// Flugschreiber-Snapshot nennt `szeneSkala`.
async function checkBandSzeneSkala({ page, check }) {
    const o = await safeEvaluate(page, () => {
        const THREE = window.THREE;
        const K = AnazhRealm;
        const LAYER = K.FOLIAGE_LAYER;
        const out = { MIN: K.SZENE_SKALA_MIN, SKALA: K.SZENE_SKALA };
        // (1) die EINE Szenen-Skala
        const traaWar = st._traa;
        const skWar = st.szeneSkala;
        st._traa = true;
        out.skala = [null, 0.3, 1.4, 0.85].map((w) => ((st.szeneSkala = w), r._szeneSkalaWirk()));
        st._traa = false;
        out.skala.push(r._szeneSkalaWirk());
        st._traa = traaWar;
        st.szeneSkala = skWar;
        // (2) _markFoliageLayer + die ECHTEN Gruppen über den realen Erzeugungs-Pfad (`_archInstanceGroupFor`)
        const layersOf = (m) => ((m.layers.mask & 1) !== 0 ? "L0" : "") + ((m.layers.mask & (1 << LAYER)) !== 0 ? "+LAUB" : "");
        const mk = (regionKey, regional) => {
            const m = new THREE.Object3D();
            r._markFoliageLayer(m, regionKey, regional);
            return layersOf(m);
        };
        out.marke = [mk("3,4", true), mk(null, false)];
        try {
            const leaf = { geom: new THREE.BoxGeometry(1, 1, 1), mat: new THREE.MeshBasicMaterial() };
            const gF = r._archInstanceGroupFor("grown_probe_leaf", 0, leaf, "9,9");
            const gP = r._archInstanceGroupFor("p_probe", 0, leaf, null);
            out.gruppe = [gF && gF.mesh ? layersOf(gF.mesh) : null, gP && gP.mesh ? layersOf(gP.mesh) : null];
            for (const g of [gF, gP]) if (g && g.mesh) g.mesh.visible = false;
        } catch (e) {
            out.gruppe = ["ERR " + (e && e.message)];
        }
        // (3) DER REGLER TRÄGT DIE AUFLÖSUNG NICHT — den headless-Kurzschluss kontrolliert umgehen, schwere und leichte Last
        const wasNull = st.renderer && st.renderer._isHeadlessNull;
        const applyWar = r._applyRenderScale;
        const sense = (ls, calls, frameMs) => ({ loadScale: ls, phase: { archCulling: 1, render: 1, streaming: 0, waterIso: 0 }, renderCalls: calls, frameMs });
        try {
            if (st.renderer) st.renderer._isHeadlessNull = false;
            r._applyRenderScale = () => {};
            st.szeneSkala = 0.8;
            for (let i = 0; i < 60; i++) r._nexusPerfActuate(sense(0.0, 2000, 60));
            out.nachLast = st.szeneSkala;
            for (let i = 0; i < 80; i++) r._nexusPerfActuate(sense(1.0, 0, 8));
            out.nachRuhe = st.szeneSkala;
        } finally {
            r._applyRenderScale = applyWar;
            st.szeneSkala = skWar;
            if (st.renderer) st.renderer._isHeadlessNull = wasNull;
        }
        // (4) der Flugschreiber-Snapshot trägt die Szenen-Skala
        const snap = r._flightRecorderSnapshot(16.0, {});
        out.snapshotSkala = snap && snap.ctx ? snap.ctx.szeneSkala : undefined;
        return out;
    });
    const g = o || {};
    check(
        "Szenen-Skala (1) EINE Größe: ohne Wert SZENE_SKALA, 0,3 → MIN, 1,4 → 1, 0,85 bleibt, ohne TRAA 1",
        !!g.skala && g.skala.join("/") === [g.SKALA, g.MIN, 1, 0.85, 1].join("/"),
        g.skala ? g.skala.join("/") : ""
    );
    check("Szenen-Skala (2) Laub trägt FOLIAGE_LAYER + Layer 0, Platziertes nur Layer 0 (Marke und echte Gruppe)", !!g.gruppe && [...g.marke, ...g.gruppe].join("/") === "L0+LAUB/L0/L0+LAUB/L0", [...(g.marke || []), ...(g.gruppe || [])].join("/"));
    check("Szenen-Skala (3) der Regler trägt die Auflösung nicht (Last und Ruhe lassen 0,8 stehen), (4) der Snapshot nennt sie", g.nachLast === 0.8 && g.nachRuhe === 0.8 && typeof g.snapshotSkala === "number", `${g.nachLast} → ${g.nachRuhe} · Snapshot ${g.snapshotSkala}`);
}

// Die Regler-Simulation mit ehrlichen Zahlen (W1) — eingefaltet aus gate:regler-sim: die ECHTE Kette `_perfSenseFoldFrame`
// → `_nexusPerfRegulate` → `_nexusPerfActuate` über tausende synthetische Frames, der headless-Zweig gelüftet, die zwei
// GPU-Anwender gestubbt, alles gesichert und wiederhergestellt. S1 schwache GPU drosselt und konvergiert (Studio-Regime ohne
// Rebuild-Schleife) · S2 Streaming ist heilig · S3 starke GPU erholt · S4 Session-Zeit-Invarianz · S5 der Geräte-Seed (Klassen,
// Konsum, headless byte-alt) · S6 die Stufe und der Rand am Schirm (lod.K5: Abstände, Grenzen, Wahl, Laub- und Bau-Radius bei
// 30/60/144 fps und Regler ±10 % gleich, die Mutante wandert) · S7 der Ladeschirm misst nichts.
async function checkBandReglerSim({ page, check }) {
    const out = await safeEvaluate(page, async () => {
        const A = window.AnazhRealm || AnazhRealm;
        const o = {};
        const pos = st.playerMesh ? st.playerMesh.position : { x: 0, y: 0, z: 0 };
        // ── SIM-RAHMEN: den headless-Zweig lüften (die ECHTEN Regel-Pfade laufen),
        // die zwei GPU-Anwender stubben (die Stellgrößen-FELDER bleiben die Wahrheit),
        // alles SICHERN+WIEDERHERSTELLEN (die Gate-Hook-Lehre).
        const _origHeadless = st.renderer._isHeadlessNull;
        const _origApplyRS = r._applyRenderScale;
        const _origApplySR = r._applyEffectiveShadowRange;
        let rsApplied = 0,
            srApplied = 0;
        const feed = (frameMs, frame) => {
            st._perfFrame = frame;
            st._perfMarks = {};
            r._perfSenseFoldFrame(frameMs, 0.0167);
        };
        const HONEST = {
            renderCalls: 1100,
            renderTris: 3.1e6,
            render: 2,
            archCulling: 0.6,
            streaming: 1.2,
            waterIso: 0.4,
            creatures: 0.8,
            physics: 0.9,
        };
        const levers = () => ({
            loadScale: st.perfSense.loadScale,
            density: st._foliageDensityScale,
            shadowIv: st._shadowMinInterval,
            foliageR: st.foliageRadius,
            godray: st._godrayScale,
            streamBudget: st._voxelStreamBudgetMs,
        });
        try {
            st.renderer._isHeadlessNull = false; // die echten Regel-Zweige
            r._applyRenderScale = () => rsApplied++;
            r._applyEffectiveShadowRange = () => srApplied++;
            // ── S1: SCHWACHE GPU, steady (30 ms Frames, ehrliche Szene) ──
            for (let i = 0; i < 900; i++) feed(30, Object.assign({}, HONEST));
            const s1a = levers();
            for (let i = 0; i < 400; i++) feed(30, Object.assign({}, HONEST));
            const s1b = levers();
            o.s1Throttled = s1a.density < 0.9 && s1a.loadScale < 0.5;
            o.s1Converged =
                Math.abs(s1b.density - s1a.density) < 0.02 && Math.abs(s1b.loadScale - s1a.loadScale) < 0.02;
            o.s1 = { a: s1a, b: s1b };
            // Studio-Regime: trotz gefallener Dichte KEIN Dispose+Rebuild (die tote Schleife).
            // AUSLÖSCHUNGS-WELLE (Beifang, V9.56-i nachgezogen): `_tickGrassThin` fiel in
            // V18.436 mit dem Tuft-Paket (die Wiese dünnt NIE — Studio-Gesetz); der Streu-
            // Thin ist der EINE verbliebene Hebel — die Probe liest nur noch ihn.
            st._frameOverBudget = false;
            let thinFired = 0;
            for (let i = 0; i < 25; i++) thinFired += r._tickFoliageThin(pos);
            o.s1NoRebuildLoop = thinFired === 0;
            o.s1EffectiveDensityOne = r._effectiveFoliageDensity() === 1;
            // ── S2: STREAMING-BURST (Rückstau) → Stream-Budget MAX (heilig) ──
            // `voxelMeshPending` ist lazy-init (Set) — nach einem Sync-Warmup existiert
            // es ggf. nicht: für die Probe anlegen (wie die Produktion es täte).
            const hadPendSet = !!st.voxelMeshPending;
            if (!st.voxelMeshPending) st.voxelMeshPending = new Set();
            const pend = st.voxelMeshPending;
            const hadPending = pend.size > 0;
            if (!hadPending) pend.add("__sim");
            for (let i = 0; i < 60; i++) feed(30, Object.assign({}, HONEST, { streaming: 20 }));
            const L = A.PERF_LEVERS;
            o.s2StreamSacred = Math.abs(st._voxelStreamBudgetMs - L.streamBudgetMs[1]) < 0.01;
            if (!hadPending) pend.delete("__sim");
            if (!hadPendSet && pend.size === 0) delete st.voxelMeshPending;
            // ── S3: STARKE GPU (7 ms) → alles wächst zurück ──
            for (let i = 0; i < 2200; i++) feed(7, Object.assign({}, HONEST));
            const s3 = levers();
            o.s3Recovered = s3.loadScale > 0.95 && s3.density > 0.95;
            o.s3 = s3;
            // ── S4: SESSION-ZEIT-INVARIANZ im Totband (err=0 → Stellgrößen eingefroren;
            // eine vergiftete/wachsende Metrik drückte sie über die Session weiter) ──
            const tMs = Number.isFinite(st.perfTargetMs) ? st.perfTargetMs : A.PERF_TARGET_MS;
            const gMs = Math.max(1, tMs - A.PERF_HEADROOM_MS);
            const dead = (tMs + gMs) / 2;
            for (let i = 0; i < 300; i++) feed(dead, Object.assign({}, HONEST));
            const s4a = levers();
            for (let i = 0; i < 2400; i++) feed(dead, Object.assign({}, HONEST)); // „9 Minuten später"
            const s4b = levers();
            let s4MaxDrift = 0;
            for (const k of Object.keys(s4a)) {
                const d = Math.abs((s4b[k] || 0) - (s4a[k] || 0));
                if (d > s4MaxDrift) s4MaxDrift = d;
            }
            o.s4MaxDrift = +s4MaxDrift.toFixed(6);
            o.s4Invariant = s4MaxDrift < 0.001;
            o.s4 = { a: s4a, b: s4b };
            o.gpuAppliersDrove = rsApplied > 0; // die Sim fuhr die echten Zweige (nicht vakuös)
            // ── S5: DER GERÄTE-SEED („das Geräte-Profil ist Telemetrie,
            // kein Regler-Seed" fiel) — die EINE Profil-Quelle urteilt Klassen,
            // der Sense-Init KONSUMIERT den Seed, headless bleibt byte-alt. ──
            {
                const defO = (obj, k, v) => Object.defineProperty(obj, k, { get: () => v, configurable: true });
                const undefO = (obj, k) => delete obj[k];
                const fakeAdapter = (info) => {
                    st.renderer.backend = { adapter: { info } };
                };
                const prevBackend = st.renderer.backend;
                const prof = (info, cores, mem, dpr, w, h) => {
                    r._geraeteProfilMemo = null;
                    fakeAdapter(info);
                    defO(navigator, "hardwareConcurrency", cores);
                    defO(navigator, "deviceMemory", mem);
                    defO(window, "devicePixelRatio", dpr);
                    defO(window, "innerWidth", w);
                    defO(window, "innerHeight", h);
                    return r._geraeteProfil();
                };
                const pStark = prof({ vendor: "nvidia", architecture: "ampere" }, 24, 32, 1, 1920, 1080);
                const pSchwach = prof({ vendor: "arm", architecture: "valhall" }, 8, 8, 1, 800, 600);
                const pMittel = prof({ vendor: "intel", architecture: "gen-12lp" }, 12, 16, 2, 1440, 765);
                // DER SCHIRM IST KEIN SEED (gate:schirm-monotonie): bis V18.531 zog ein Pixel-Zuschlag ab
                // 4 MPix 0,1–0,2 ab — ein größerer Schirm startete mit weniger Welt. Dasselbe Gerät auf 4K: derselbe Seed.
                const pMittelGross = prof({ vendor: "intel", architecture: "gen-12lp" }, 12, 16, 2, 3840, 2160);
                o.s5 = { pStark, pSchwach, pMittel, pMittelGross };
                o.s5Klassen =
                    pStark.klasse === "stark" &&
                    pStark.seed === 1 &&
                    pSchwach.klasse === "schwach" &&
                    Math.abs(pSchwach.seed - 0.45) < 1e-9 &&
                    pMittel.klasse === "mittel" &&
                    Math.abs(pMittel.seed - 0.7) < 1e-9 &&
                    pMittelGross.seed === pMittel.seed;
                // KONSUM: ein frischer Sense-Init (non-headless, Mittel-Profil aktiv)
                // startet loadScale AM SEED — nicht bei optimistischer 1.
                r._geraeteProfilMemo = null;
                st.perfSense = null;
                feed(17, Object.assign({}, HONEST));
                o.s5SeedStart = st.perfSense ? st.perfSense.seedStart : null;
                o.s5SeedKonsumiert =
                    st.perfSense &&
                    Math.abs(st.perfSense.seedStart - 0.7) < 1e-9 &&
                    Math.abs(st.perfSense.loadScale - 0.7) < 0.06;
                // HEADLESS BYTE-ALT: derselbe Init unter Null-Renderer ⇒ Seed 1.
                st.renderer._isHeadlessNull = true;
                r._geraeteProfilMemo = null;
                st.perfSense = null;
                feed(17, Object.assign({}, HONEST));
                o.s5HeadlessAlt = st.perfSense && st.perfSense.seedStart === 1;
                st.renderer._isHeadlessNull = false;
                // Stubs zurücknehmen (die Gate-Hook-Lehre: sichern + wiederherstellen).
                undefO(navigator, "hardwareConcurrency");
                undefO(navigator, "deviceMemory");
                undefO(window, "devicePixelRatio");
                undefO(window, "innerWidth");
                undefO(window, "innerHeight");
                st.renderer.backend = prevBackend;
                r._geraeteProfilMemo = null;
                st.perfSense = null; // die finally-Faltung initialisiert headless-ehrlich neu
            }
            // ── S6: DIE STUFE UND DER RAND AM SCHIRM (lod.K5 Staffel 2; vorher der Grenzzyklus-Schnitt: der Radius atmete 58↔130 m und
            // baute dieselben Rand-Zellen im Kreis) — bei 30, 60 und 144 Bildern, gepulstem Kopfraum (7/30 ms) und dem Regler des
            // Spielers ±10 % (perfTargetMs) stehen die Abstände des Gesetzes (`_wechselAbstand`), die Schwellen der Bäume und Karten-
            // Arten, die Grenzen von Haus und Tor (`_archStufenGrenzen`), die Stufen-Wahl, die Wahrnehmungs-Distanz der Maske, der Laub-Radius an
            // der Kante (der Rand am Schirm, gekappt am gebauten Ring) und der Bau-Radius am Schirm (`_randSchirm`) GLEICH, während
            // der Regler wandert (loadScale-Spanne ≥ 0,3). Die Gegenprobe im selben Lauf: das Gesetz mit einem Regler-Term wandert. ──
            {
                const ARTEN = [["tree", 1], ["tree", 2], ["haus", 1], ["haus", 2], ["gate", 1], ["gate", 2], ["ausstattung", 1]];
                const { span } = r._voxelChunkConfig();
                const ring = st._activeRingRadius != null ? st._activeRingRadius : Math.max(1, Math.min(12, st.chunkRingRadius || 4));
                const schirm = () => {
                    r._stufenSchirm();
                    return JSON.stringify({
                        d: ARTEN.map(([k, s]) => r._wechselAbstand(k, s, 1)),
                        t: [A.LOD_DISTANCES.thresh01, A.LOD_DISTANCES.thresh12],
                        g: ["haus_alemannisch", "tor_drachentor"].map((type) => r._archStufenGrenzen({ type })),
                        wahl: [[6, 0, 8], [14, 1, 12], [24, 1, 20], [30, 1, 12], [60, 2, 30]].map((x) => r._chooseLODForDistance(...x)),
                        wahrnehmung: r._lodPerceptionDistance(100, 12),
                        laub: st.foliageRadius === Math.min(r._randSchirm("laub"), (ring + 1) * span),
                        bau: st.architectureCullingRadius === r._randSchirm("bau"),
                    });
                };
                const zielVor = st.perfTargetMs;
                const ziel = Number.isFinite(zielVor) ? zielVor : A.PERF_TARGET_MS;
                const lauf = (ms, n, z = ziel) => {
                    st.perfTargetMs = z;
                    for (let i = 0; i < n; i++) feed(ms, Object.assign({}, HONEST));
                    return { ls: st.perfSense.loadScale, s: schirm() };
                };
                const laeufe = () => {
                    st.perfSense = null;
                    const l = [lauf(1000 / 30, 600), lauf(1000 / 60, 600), lauf(1000 / 144, 1200)];
                    for (let w = 0; w < 6; w++) l.push(lauf(7, 80), lauf(30, 20));
                    l.push(lauf(1000 / 60, 600, ziel * 0.9), lauf(1000 / 60, 600, ziel * 1.1));
                    st.perfTargetMs = zielVor;
                    return l;
                };
                const l = laeufe();
                const gesetz = A._wechselGesetz;
                A._wechselGesetz = (...a) => gesetz(...a) * (0.7 + 0.3 * st.perfSense.loadScale);
                let mut = [];
                try {
                    mut = laeufe();
                } finally {
                    A._wechselGesetz = gesetz;
                }
                const ls = l.map((x) => x.ls);
                const anders = l.find((x) => x.s !== l[0].s);
                const s0 = JSON.parse(l[0].s);
                o.s6Spanne = +(Math.max(...ls) - Math.min(...ls)).toFixed(2);
                o.s6AmSchirm = !anders && s0.laub && s0.bau && o.s6Spanne >= 0.3 && mut.some((x) => x.s !== mut[0].s);
                o.s6 = { laeufe: l.length, loadScale: [Math.min(...ls), Math.max(...ls)].map((x) => +x.toFixed(2)), anders: anders ? anders.s : null, schirm: s0 };
            }
            // ── S7: DER LADESCHIRM MISST NICHTS (K60-3, Prüfung Runde 2: Radeon kalt stand das erste Weltbild am Kopf mit dem
            // Laub-Radius 65 statt 129,6 m — 4 von 25 Chunks bepflanzt, 57 statt 338 Bäume). Unter dem Lade-Takt zeigt kein
            // Frame die Welt: sein Abstand ist die Kadenz des Lade-Bilds (LADE_BILD_MS), seine Last die Erst-Zeichnung. Der
            // PID misst ihn nie (loadScale hält den Seed), und die Reichweite des Weltbilds — Laub- und Architektur-Radius —
            // steht nach zwei Lade-Bildern an ihrem Ziel (dem Rand am Schirm, das Laub gekappt an der Kante des gebauten Rings),
            // nie am Schritt des sichtbaren Takts. ──
            {
                const merk = {
                    lade: r._ladeTakt,
                    ring: st._activeRingRadius,
                    ruhe: r._folRuheSec,
                };
                try {
                    st.perfSense = null;
                    r._folRuheSec = 0; // der Boot: noch keine Ruhe gesammelt
                    r._ladeTakt = () => true;
                    st._activeRingRadius = 2;
                    st.foliageRadius = A.PERF_FOLIAGE_RADIUS_MIN - 5; // der Boot-Stand am Kopf (65 m)
                    st.architectureCullingRadius = 0;
                    const LADE = Object.assign({}, HONEST, { render: 300, streaming: 1, waterIso: 0 });
                    feed(A.LADE_BILD_MS, Object.assign({}, LADE));
                    feed(A.LADE_BILD_MS, Object.assign({}, LADE));
                    const seed = st.perfSense.seedStart;
                    const { span } = r._voxelChunkConfig();
                    const kante = (st._activeRingRadius + 1) * span;
                    const laubZiel = Math.min(r._randSchirm("laub"), kante);
                    const archZiel = r._randSchirm("bau");
                    o.s7 = {
                        seed,
                        loadScale: +st.perfSense.loadScale.toFixed(4),
                        laub: +st.foliageRadius.toFixed(2),
                        laubZiel: +laubZiel.toFixed(2),
                        arch: +st.architectureCullingRadius.toFixed(2),
                        archZiel: +archZiel.toFixed(2),
                    };
                    o.s7LoadHaelt = Math.abs(st.perfSense.loadScale - seed) < 1e-9;
                    o.s7LaubAmZiel = Math.abs(st.foliageRadius - laubZiel) < 1e-6;
                    o.s7ArchAmZiel = Math.abs(st.architectureCullingRadius - archZiel) < 1e-6;
                } finally {
                    r._ladeTakt = merk.lade;
                    st._activeRingRadius = merk.ring;
                    r._folRuheSec = merk.ruhe;
                    st.perfSense = null;
                }
            }
        } finally {
            st.renderer._isHeadlessNull = _origHeadless;
            r._applyRenderScale = _origApplyRS;
            r._applyEffectiveShadowRange = _origApplySR;
            // headless-ehrlichen Zustand wiederherstellen (ein Fold im echten Modus)
            st._perfFrame = {};
            st._perfMarks = {};
            r._perfSenseFoldFrame(8, 0.0167);
        }
        o.restored = st.renderer._isHeadlessNull === _origHeadless && st._foliageDensityScale === 1;
        return o;
    });
    const o = out || {};
    const f2 = (v) => (typeof v === "number" ? +v.toFixed(3) : v);
    const s1 = o.s1 || { a: {}, b: {} };
    check(`Regler-Sim S1 schwache GPU: der Regler DROSSELT und KONVERGIERT, das Studio-Regime baut nie neu (loadScale ${f2(s1.a.loadScale)}, Dichte ${f2(s1.a.density)})`, o.s1Throttled && o.s1Converged && o.s1NoRebuildLoop && o.s1EffectiveDensityOne, JSON.stringify(s1).slice(0, 160));
    check(`Regler-Sim S2/S3: Rückstau → Stream-Budget MAX (V18.282), starke GPU → alles wächst zurück (${o.s3 ? f2(o.s3.loadScale) + "/" + f2(o.s3.density) : "?"})`, o.s2StreamSacred === true && o.s3Recovered === true);
    check(`Regler-Sim S4 Session-Zeit-Invarianz: identischer Input früh vs +2400 Frames ⇒ identische Stellgrößen (maxΔ ${o.s4MaxDrift})`, o.s4Invariant === true);
    check(
        "Regler-Sim S5 Geräte-Seed: stark 1 · schwach 0,45 · mittel 0,7, auf 4K derselbe Seed; der frische Sense-Init startet am Seed, headless byte-alt",
        o.s5Klassen === true && o.s5SeedKonsumiert === true && o.s5HeadlessAlt === true,
        `Seed-Start ${o.s5SeedStart} · headless ${o.s5HeadlessAlt}`
    );
    check(
        "Regler-Sim S6 die Stufe und der Rand am Schirm (lod.K5 Staffel 2): bei 30/60/144 fps, Puls und Regler ±10 % stehen Abstände, Schwellen, Grenzen, Wahl und Ränder gleich, die Mutante wandert",
        o.s6AmSchirm === true,
        `K5#2 Spanne ${o.s6Spanne} · ${JSON.stringify(o.s6)}`
    );
    check("Regler-Sim S7 der Ladeschirm misst nichts: der PID hält den Seed, Laub und Bauten stehen nach zwei Lade-Bildern am Ziel", o.s7LoadHaelt === true && o.s7LaubAmZiel === true && o.s7ArchAmZiel === true, JSON.stringify(o.s7));
    check("Regler-Sim: die Sim fuhr die ECHTEN Nicht-Headless-Zweige und stellte headless-Zustand + Dichte 1 wieder her", o.gpuAppliersDrove === true && o.restored === true);
}

module.exports = {
    checkInitialState, checkRing1Grok, checkBandV1778LadderCut, checkBandV18278LoopErrorBoundary,
    checkBandWellePerfENexusGovernor, checkBandWaldbodenKaskade, checkBandTailleOmega5, checkBandV18149Statusbar,
    checkBandV18163DetailTiefe, checkBandV18165KonsoleHeil, checkBandV18177AAA, checkBandV18210Verdrahtung,
    checkBandRauschGesetz, checkBandV18331ReplayDeterminism, checkBandPerfPanel, checkBandExistenzBoden,
    checkBandGodray, checkBandSzeneSkala, checkBandReglerSim,
};
