"use strict";
// scripts/playtest/dirigent.cjs — der Richter von Dirigent (spec/stamm/modul-karte.json): Konstruktor · state-Baum · Spiel-Modi · Kamera-Modus · Leucht-Takt · Perf-Sinn · der EINE Regler · Holz-Profile · Geräte-Profil · Flug-Schreiber · die Spielschleife · Frame-Planer · Fixed-Step · Replay · init · das erste Weltbild · Ladeschirm · der Boot.
// 14 Band/Bänder in Lauf-Reihenfolge, je Band das Modul, dessen Glieder er am meisten ruft; gestellt von
// `node scripts/stamm-umzug.cjs --richter` — ein neuer Band steht hier und in der Reihe des Läufers scripts/playtest.cjs.

const SK = require("../lib/shader-kosten.cjs");
const { safeEvaluate } = require("../playtest.cjs");

// V9.52 Sub-Welle a — die Basis-Invarianten direkt nach dem `finalState`-Greifen.
// Welt-/Terrain-/Spieler-Grundprüfungen — verhaltens-identisch zur alten Inline-Form.
function checkInitialState(ctx) {
    const { check, finalState } = ctx;
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
function checkRing1Grok(ctx) {
    const { check, finalState, logs } = ctx;
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

// V17.78 Welle 2 Schritt 2 — die generische Präzisions-Leiter ist GEFALLEN: feuerstein/hammer/feile/
// polierscheibe RAUS (die Werkstatt trägt jetzt die Präzision, V17.76/.77). hände bleibt die domain-
// neutrale Baseline; die Op-Klassen-Abdeckung + der Crafting-Pfad bleiben intakt (kein Material verwaist).
async function checkBandV1778LadderCut(ctx) {
    const { page, check } = ctx;
    const res = await page.evaluate(() => {
        const r = window.anazhRealm;
        const out = {};
        const tools = r.state.tools || {};
        out.removedGone = !["feuerstein-knapper", "hammer", "feile", "polierscheibe"].some((n) => tools[n]);
        // V17.88 — nur `hände` ist STARTER (die Basics); die 5 Domain-Werkzeuge bleiben als OP-Bibliothek
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
        r.state.blueprints["_cut_test"] = {
            name: "_cut_test",
            parts: [{ shape: "box", material: "eisen", opChain: r._defaultPartOpChain() }],
        };
        const prevMode = r.getGameMode();
        if (typeof r.setGameMode === "function") r.setGameMode("schöpfer");
        const ap = r.applyOpToPart("_cut_test", 0, "hände");
        out.stillRefinable = ap.ok === true;
        if (typeof r.setGameMode === "function") r.setGameMode(prevMode);
        delete r.state.blueprints["_cut_test"];
        return out;
    });
    check(
        "V17.78 Welle 2 Schritt 2: die generische Leiter ist GEFALLEN (feuerstein/hammer/feile/polierscheibe RAUS)",
        res.removedGone
    );
    check(
        "V17.88: hände (domain-neutrale Baseline, 0.4) ist der EINZIGE Starter; die 5 Domain-Ops bleiben als Werkstatt-Op-Bibliothek (isStarter:false)",
        res.keptPresent && res.handeNeutral
    );
    check(
        "V17.78: die Op-Klassen-Abdeckung ist intakt (subtractive/plastic/additive/phaseChange je ein behaltenes Tool)",
        res.allOpClasses
    );
    check(
        "V17.78 KONSUM: ein Material ist weiter bearbeitbar (hände subtractive auf eisen) — der Crafting-Pfad lebt",
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
async function checkBandV18278LoopErrorBoundary(ctx) {
    const { page, check } = ctx;
    const res = await page.evaluate(() => {
        const r = window.anazhRealm;
        if (!r || typeof r._gameLoopTick !== "function") return { error: "kein _gameLoopTick" };
        const src = window.__codeOf(r._gameLoopTick);
        const out = {};
        out.loopHasTry = /try\s*\{/.test(src);
        out.loopCallsBoundary = /_loopErrorBoundary/.test(src);
        out.boundaryExists = typeof r._loopErrorBoundary === "function";
        // CONSUM (behavioral): ein werfender Frame-Schritt (updateFps) darf den Loop NICHT
        // mehr brechen — die Boundary fängt ihn, zählt ihn, der Tick kehrt normal zurück.
        const st = r.state;
        const before = st._loopErrorCount || 0;
        const origFps = r.updateFps;
        let threw = false;
        try {
            r.updateFps = () => {
                throw new Error("V18278-test-throw");
            };
            r._gameLoopTick(performance.now()); // darf NICHT werfen
        } catch (_e) {
            threw = true;
        } finally {
            delete r.updateFps; // Prototyp-Methode wiederherstellen
        }
        out.loopSurvivesThrow = !threw;
        out.errorCounted = (st._loopErrorCount || 0) > before;
        return out;
    });
    if (res.error) {
        check("V18.278: Loop-Error-Boundary (realm)", false, res.error);
        return;
    }
    check(
        "V18.278: der Loop wickelt seinen Body in try/catch + ruft _loopErrorBoundary (Source — der ewige Loop ist jetzt ewig)",
        res.loopHasTry && res.loopCallsBoundary && res.boundaryExists
    );
    check(
        "V18.278 CONSUM: ein werfender Frame-Schritt erstarrt den Loop NICHT (abgefangen, weiter — kein Welt-Freeze)",
        res.loopSurvivesThrow
    );
    check(
        "V18.278 CONSUM: der abgefangene Fehler wird gezählt (_loopErrorCount steigt, die Wurzel sichtbar)",
        res.errorCounted
    );
}

// EIN PID-Regler misst die Last je Subsystem (perfSense) und fährt ALLE Stellgrößen (Arch-Cull,
// Streaming-, Wasser-Iso-Budget) nach gemessener Last — das teuerste gibt zuerst nach, Gravitation
// NIE. `_nexusAdaptiveQuality(fps)` ist nur der fps-Eingang in DENSELBEN Regler.
async function checkBandWellePerfENexusGovernor(ctx) {
    const { page, check } = ctx;
    const res = await page.evaluate(() => {
        const r = window.anazhRealm;
        if (!r || !r.state) return { error: "no realm" };
        const A = r.constructor; // window.AnazhRealm headless undefined (V18.259-Gotcha)
        const out = {};
        out.hasGovernor = typeof r._nexusAdaptiveQuality === "function";
        out.hasRegulate = typeof r._nexusPerfRegulate === "function";
        out.hasActuate = typeof r._nexusPerfActuate === "function";
        out.hasSenseFold = typeof r._perfSenseFoldFrame === "function";
        out.hasEstimate = typeof r._estimatePerfCost === "function";
        if (!out.hasGovernor || !out.hasRegulate || !out.hasActuate) return out;
        const saStr = window.__codeOf(r.selfAwarenessAnalyze);
        out.noGravityPflaster = !/gravity\s*\*=/.test(saStr);
        // KEIN Parallel-Governor mehr: selfAwarenessAnalyze ruft _nexusAdaptiveQuality NICHT.
        out.noParallelGovernor = !/_nexusAdaptiveQuality/.test(saStr);

        const st = r.state;
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

        // (1) ANHALTENDER FPS-DRUCK → der EINE Regler strafft ALLE Stellgrößen.
        for (let i = 0; i < 90; i++) r._nexusAdaptiveQuality(15); // frameMs≈67 >> Soll
        out.tightenedRadius = st.architectureCullingRadius < 130;
        out.tightenedBudget = st.architectureBuildBudgetPerFrame < 4;
        out.tightenedStream = st._voxelStreamBudgetMs < L.streamBudgetMs[1];
        out.radiusFloor =
            st.architectureCullingRadius >= A.ARCH_QUALITY_RADIUS_MIN && st.architectureCullingRadius < 130;
        out.budgetFloor = st.architectureBuildBudgetPerFrame >= A.ARCH_QUALITY_BUDGET_MIN;
        out.gravityUntouchedLow = st.gravity === gBefore;

        // (2) FPS-LUFT (frameMs≈7 ≪ growMs) → relax zum MAXIMUM aller Stellgrößen. Viele Ticks: mit dem
        // Atem-Totband braucht der Integral-Term lange, bis loadScale auf 1.0 clampt (Gleichgewicht, err<0).
        for (let i = 0; i < 240; i++) r._nexusAdaptiveQuality(140);
        out.relaxedRadius = st.architectureCullingRadius === A.ARCH_QUALITY_RADIUS_MAX;
        out.relaxedBudget = st.architectureBuildBudgetPerFrame === A.ARCH_QUALITY_BUDGET_MAX;
        out.relaxedStream = Math.abs(st._voxelStreamBudgetMs - L.streamBudgetMs[1]) < 0.01;
        out.gravityUntouchedHigh = st.gravity === gBefore;

        // (3) SYNERGIE (der Kern der Schöpfer-Forderung „optimal nutzen"): bei
        // streaming-dominanter Last drosselt der EINE Regler das Stream-Budget
        // STÄRKER (näher an min) als den Architektur-Radius — das teuerste zuerst.
        r._nexusPerfActuate({
            loadScale: 0.5,
            phase: { streaming: 20, render: 0, archCulling: 1, waterIso: 1, creatures: 0, physics: 0 },
        });
        const streamPos = (st._voxelStreamBudgetMs - L.streamBudgetMs[0]) / (L.streamBudgetMs[1] - L.streamBudgetMs[0]);
        const radiusPos =
            (st.architectureCullingRadius - A.ARCH_QUALITY_RADIUS_MIN) /
            (A.ARCH_QUALITY_RADIUS_MAX - A.ARCH_QUALITY_RADIUS_MIN);
        out.synergyStreamThrottledMore = streamPos < radiusPos - 0.1;
        out.synergyStreamPos = +streamPos.toFixed(2);
        out.synergyRadiusPos = +radiusPos.toFixed(2);

        // (4) ungültige FPS ändert nichts.
        const rBefore = st.architectureCullingRadius;
        r._nexusAdaptiveQuality(0);
        out.zeroFpsNoChange = st.architectureCullingRadius === rBefore;

        // (5) Kosten-Schätzung liest den Sense (der Produktions-Ökonomie-Keim).
        st.perfSense.perCreatureMs = 0.05;
        out.estimateScales =
            r._estimatePerfCost("creature", 10) > r._estimatePerfCost("creature", 2) &&
            r._estimatePerfCost("creature", 10) === 0.5;

        // (6) V18.268 — die NEUEN AUGEN: perfSense SIEHT die GPU-Render-Last + die
        // per-Subsystem-Spikes (vorher blind: Render gar nicht gemessen, Hitches
        // EWMA-weggemittelt). CONSUM: der Fold füllt die Felder, Loop + Overlay lesen sie.
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
        // (Schatten/Cull = die render-verursachenden Hebel) gibt MEHR nach als das Streaming — die Welt
        // lädt weiter, während die Render-Qualität schrumpft.
        r._nexusPerfActuate({
            loadScale: 0.5,
            renderCalls: 600,
            phase: { streaming: 1, render: 0, archCulling: 0.5, waterIso: 1, creatures: 0, physics: 0 },
        });
        const archPosR =
            (st.architectureCullingRadius - A.ARCH_QUALITY_RADIUS_MIN) /
            (A.ARCH_QUALITY_RADIUS_MAX - A.ARCH_QUALITY_RADIUS_MIN);
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

        // (9) V18.281 — DER ATEM-TOTBAND: im Komfort-Band [growMs, throttleMs] HÄLT der
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
        check("V18.263: Perf-Regelkreis-Band (realm)", false, res.error);
        return;
    }
    check(
        "V18.263: _nexusAdaptiveQuality (fps-Eingang) + _nexusPerfRegulate (PID) + _nexusPerfActuate existieren",
        res.hasGovernor && res.hasRegulate && res.hasActuate
    );
    check("V18.263: Perf-Sense-Fold + Kosten-Schätzung existieren", res.hasSenseFold && res.hasEstimate);
    check("V12.0-perf.e: kein `gravity *= 0.9`-Pflaster in selfAwarenessAnalyze", res.noGravityPflaster);
    check(
        "V18.263: KEIN Parallel-Governor — selfAwarenessAnalyze ruft _nexusAdaptiveQuality NICHT (EIN Regler)",
        res.noParallelGovernor
    );
    check(
        "V18.263: FPS-Druck strafft ALLE Stellgrößen (Radius + Budget + Stream-Budget)",
        res.tightenedRadius && res.tightenedBudget && res.tightenedStream
    );
    check("V18.263: anhaltender Druck bounded (Radius ≥ MIN, Budget ≥ 1)", res.radiusFloor && res.budgetFloor);
    check(
        "V12.0-perf.e: Gravitation NIE angetastet (die Wurzel-Heilung)",
        res.gravityUntouchedLow && res.gravityUntouchedHigh
    );
    check(
        "V18.263: FPS-Luft relaxt ALLE Stellgrößen zum Maximum",
        res.relaxedRadius && res.relaxedBudget && res.relaxedStream
    );
    check(
        `V18.263: SYNERGIE — das teuerste Subsystem gibt zuerst nach (streamPos ${res.synergyStreamPos} < radiusPos ${res.synergyRadiusPos})`,
        res.synergyStreamThrottledMore
    );
    check("V18.263: ungültige FPS (0) ändert nichts (headless-Schutz)", res.zeroFpsNoChange);
    check("V18.263: Kosten-Schätzung skaliert mit n (Produktions-Ökonomie-Keim)", res.estimateScales);
    check(
        "V18.268: perfSense SIEHT die Render-Last + Spikes (renderCalls/renderTris/renderCallsMax/phaseMax)",
        res.hasRenderFields
    );
    check(
        "V18.268: CONSUM — der Fold füllt die GPU-Last (calls+tris EWMA) + den abklingenden Max",
        res.foldRenderLoad && res.foldRenderMax
    );
    check(
        "V18.268: CONSUM — der Fold fängt den Subsystem-Spike (phaseMax neben der wegmittelnden EWMA)",
        res.foldPhaseSpike
    );
    check(
        `V18.269: unter MODERATER Render-Last drosselt der Regler ARCH/Schatten (archPos ${res.renderArchPos}) MEHR als Streaming (streamPos ${res.renderStreamPos}) — Durchsatz geschützt, die Welt lädt weiter`,
        res.renderLoadThrottlesArch
    );
    check(
        `V18.282: STREAMING IST HEILIG — hohe Render-Last (1100 Calls) drosselt das Streaming bei Rückstau NICHT (streamPos ${res.renderStreamPosBound} = MAX) — die Bewegung verhungert NIE am Render-Druck (Heilung des V18.276-Lauf-Freeze)`,
        res.renderLoadProtectsStreaming
    );
    check(
        "V18.269: die Render-Last verlängert das Schatten-Intervall (der 613k-Schatten-Pass läuft seltener unter GPU-Last)",
        res.renderLoadLengthensShadow
    );
    check(
        "V18.270: bei Bau-Rückstau lädt die Welt mit MAX Streaming-Budget — der PID drosselt NICHT den Bau, der das frameMs erzeugt (kein Pendeln, keine Lade-Hemmung)",
        res.loadingPinsStreamMax
    );
    check(
        "V18.270: settled (kein Rückstau) drosselt derselbe Druck das Streaming wieder (smooth exploration — der Hebel lebt, wo er sinnvoll ist)",
        res.settledThrottlesStream
    );
    check(
        `V18.281: im Totband HÄLT der Regler (loadScale ${res.deadbandLoadScale} bleibt ~0.5) — das System atmet über 60, kein 59er-Anschlag`,
        res.deadbandHolds
    );
    check(
        `V18.281: klarer Kopfraum lässt die Schönheit wachsen (loadScale ${res.headroomLoadScale} → Maximum)`,
        res.headroomGrows
    );
    check(
        `V18.281: über der Decke schützt der fps-Boden (loadScale ${res.ceilingLoadScale} fällt) — der Regler drosselt`,
        res.ceilingThrottles
    );
    check(
        "V18.281: die toten Bang-Bang-Schwellen (ARCH_QUALITY_FPS_LOW/HIGH) sind gekehrt — kein Passagier",
        res.deadConstantsGone
    );
}

// Waldboden 04.10. — die DEKO-KASKADE IST GEFALLEN: die Klein-Vegetation hing an den Chunk-Bändern (mesh · Kreuz-
// Fernfeld · none); die Nah-Streu hängt am Schirm (Kachel-Ring um die Kamera, NAH_STREU), jenseits trägt der Boden.
// Die Kaskade trägt nur noch LOD + KI-Takt; der Loop tickt die Nah-Streu im scatterDeco-Job.
async function checkBandWaldbodenKaskade(ctx) {
    const { page, check } = ctx;
    const res = await safeEvaluate(page, () => {
        const r = window.anazhRealm;
        const out = {};
        const bands = r.constructor.DETAIL_CASCADE;
        out.kaskadeOhneDeko = bands.every((b) => !("deko" in b) && !("dekoDichte" in b) && Number.isFinite(b.aiDiv));
        const NS = r.constructor.NAH_STREU;
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
async function checkBandTailleOmega5(ctx) {
    const { page, check } = ctx;
    const res = await safeEvaluate(page, () => {
        const r = window.anazhRealm;
        const out = {};
        r.state.blueprints["_o5_werk"] = {
            name: "_o5_werk",
            label: "Ω5-Werk",
            builtIn: false,
            parts: [
                {
                    shape: "box",
                    material: "stein",
                    position: { x: 0, y: 0.75, z: 0 },
                    size: { x: 1.5, y: 1.5, z: 1.5 },
                    rotation: { x: 0, y: 0, z: 0 },
                    opChain: [{ tool: "hände", op: "hand_knap", cap: 0.4, at: 0 }],
                },
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
        delete r.state.blueprints["_o5_werk"];
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
async function checkBandV18149Statusbar(ctx) {
    const { page, check } = ctx;
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
        "V18.149 Statusbar: Essenz (Welt·Wetter·Modus·Zeit) + 6 Dev-Items markiert",
        res.essenceClean && res.devMarked
    );
    check("V18.149 Statusbar: Dev ruht unsichtbar, bleibt aber im DOM (P17)", res.devHiddenHides && res.stillInDom);
    check("V18.149 Statusbar: der ···-Toggle flippt + persistiert", res.toggleShows && res.toggleHides);
}

// HUD-Regel: auf schmalen Schirmen sitzt der Chat ÜBER der Hotbar-Ebene (Konsole und Hotbar
// kollidierten sonst).
async function checkBandV18163DetailTiefe(ctx) {
    const { page, check } = ctx;
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
        "V18.163 HUD: die Konsole weicht der Hotbar auf schmalen Schirmen (GEMESSEN: ab 1366px kollidierten sie — Chat über der Hotbar-Ebene)",
        res.hudRegel
    );
}

// W-A KONSOLE: die Zustands-CSS gewinnt über JEDEN Inline-Schreiber (Drag/Restore) — eine Drag-
// Höhe wird vom Einklappen GEDECKT und kehrt beim Entfalten zurück (drei unterscheidbare Höhen).
// Der Griff ist eine SICHTBARE Ecken-Affordanz (Messing-Winkel) mit Richtungs-Titel.
async function checkBandV18165KonsoleHeil(ctx) {
    const { page, check } = ctx;
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
async function checkBandV18177AAA(ctx) {
    const { page, check } = ctx;
    const res = await safeEvaluate(page, () => {
        const r = window.anazhRealm;
        const A = r.constructor;
        const out = {};
        // LIVE-Werte (was die Antennen wirklich lesen), NICHT Source-Strings.
        const aer = A.AERIAL || {};
        out.microStrength = aer.microStrength;
        out.heightWeightFort = aer.heightWeight === undefined && aer.heightCap === undefined;
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
        "V18.177 AAA: AERIAL ist frozen + ohne static-get-Schatten (Welle 6-Nachhol Sub 3g)",
        res.frozen === true && res.noGetterShadow === true
    );
    check(
        "V18.530: AERIAL trägt keinen Höhen-Melt mehr (heightWeight/heightCap fort — die Luft ist `LUFT`)",
        res.heightWeightFort === true
    );
    check(
        `V18.177 AAA: microStrength === 0.14 (war 0.1 — GEMESSEN ${res.microStrength})`,
        Math.abs(res.microStrength - 0.14) < 1e-9
    );
    check(
        `V18.177 AAA: aoStrength === 0.38 (war 0.35 — GEMESSEN ${res.aoStrength})`,
        Math.abs(res.aoStrength - 0.38) < 1e-9
    );
    check(`V18.177 AAA: aoCap === 0.18 (war 0.16 — GEMESSEN ${res.aoCap})`, Math.abs(res.aoCap - 0.18) < 1e-9);
}

// Verdrahtungs-Band — KONSUM, nicht Existenz: A1 _growTreeBlueprintForSpawn (Worldgen-Hook) ·
// A2 setStructureBoost + Live-Uniform r5StructureBoost · A3 _creatureScentHuntDir +
// _tickCreatureScentStrike (wild-KI liest scent) · A4 applyOpToPart/applyWorkshopProcessToPart → Mana.
async function checkBandV18210Verdrahtung(ctx) {
    const { page, check } = ctx;
    const res = await safeEvaluate(page, () => {
        const r = window.anazhRealm;
        const A = r.constructor;
        const out = {};

        // ============== A1: Γ7 WORLDGEN-HOOK ==============
        // (A1a) Helper _growTreeBlueprintForSpawn existiert + ruft Helper
        // (A1b) gen-Default für FRESH ist 9 (V18.216 KARST + Büsche)
        const newMeta = r._generateFreshWorldMeta ? r._generateFreshWorldMeta("test-v18214") : null;
        out.a1FreshGenIs4 = newMeta && newMeta.genVersion === 9;
        // (A1c) Determinismus: gleiches (species, seed) → gleicher cacheKey
        const k1 = r._growTreeBlueprintForSpawn("baum_eiche", 12345);
        const k2 = r._growTreeBlueprintForSpawn("baum_eiche", 12345);
        out.a1Deterministic = k1 && k1 === k2;
        // (A1d) Cache-Reuse: SELBER cacheKey → SELBES Bauplan-Objekt
        out.a1CacheReuse = k1 && r.state.blueprints[k1] && r.state.blueprints[k1] === r.state.blueprints[k2];
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
        // V18.257 — die Referenz-Tags kommen aus der frozen SPECIES_TAG_REFERENCE
        // (der statische baum_eiche-Bauplan ist geschnitten).
        const ref =
            (window.anazhRealm.constructor.SPECIES_TAG_REFERENCE &&
                window.anazhRealm.constructor.SPECIES_TAG_REFERENCE.baum_eiche) ||
            null;
        const grownBp = k1 && r.state.blueprints[k1];
        out.a1TagNeutral = false;
        if (ref && grownBp) {
            const got = r.computeCompoundTags(grownBp);
            let neutral = true;
            // Variations-Wand: deklarierte Spezies-Variation (SPECIES_TAG_VARIATION, Eiche lebendig +0.05) ist
            // erlaubt; Toleranz je Achse = 0.05 + |deklarierte Variation|.
            const V = (r.constructor.SPECIES_TAG_VARIATION || {}).baum_eiche || {};
            for (const a of ["lebendig", "dichte", "brennbar", "magieleitung"]) {
                const declared = Math.abs(V[a] || 0);
                const allowed = 0.05 + declared + 1e-9; // float-tolerance
                if (Math.abs((ref[a] || 0) - (got[a] || 0)) > allowed) neutral = false;
            }
            out.a1TagNeutral = neutral;
        }
        // (A1g) Memory-Cap: nach 300 verschiedenen seeds bleibt der Ring
        // ≤ 256 (V18.210 Audit-Heilung #2: CAP 64→256, Architektur-bewusste
        // Eviction — der bounded Memory-Schutz hält weiter).
        for (let s = 0; s < 300; s++) r._growTreeBlueprintForSpawn("baum_eiche", 90000 + s);
        out.a1RingCap = !r._growTreeRing || r._growTreeRing.length <= 256;
        // (A3-Perf Watch-Item #1) — die Scent-sizeFactor-Cache muss PRO SOUL
        // sein (1 Compute je Soul, nicht je Tick × Quelle). Source-Probe +
        // Cache-Verhalten.
        out.a3SizeCacheSrc = /_scentSizeBySoul/.test(window.__codeOf(r._creatureScentHuntDir));
        out.a3SizeCacheReuse = false;
        if (out.a3SizeCacheSrc) {
            // Eine Probe: cache leeren, einmal helper rufen (mit synth predator+prey),
            // Cache-Size 1; nochmal rufen mit der gleichen Soul, Cache-Size bleibt 1.
            if (r._scentSizeBySoul) r._scentSizeBySoul.clear();
            const sm0 = r.getGameMode ? r.getGameMode() : "frieden";
            try {
                if (r.setGameMode) r.setGameMode("pfad");
                // ECHTE Leiber (Welle LF): die Beute ist, wer höchstens jagd.beuteMasse × die Masse des Jägers trägt — die
                // EINE Masse des Leibs (`_leibMasse`) liest die Gestalt; ein körperloser Stub hat keine, das Urteil bräche
                // fail-closed. Der Wolf jagt (wild), der Fuchs (15 kg) ist seine Beute.
                const savedC = r.state.creatures;
                const pmA = r.state.playerMesh.position;
                const capA = r.state.maxCreatures;
                r.state.maxCreatures = Math.max(capA || 0, savedC.length + 2);
                const Pred = r.spawnCreatureAt(pmA.x + 360, pmA.y, pmA.z - 360, "calm", "wolf", {
                    precise: true,
                    bodySize: 1,
                });
                const Prey =
                    Pred &&
                    r.spawnCreatureAt(pmA.x + 370, pmA.y, pmA.z - 360, "calm", "fuchs", {
                        precise: true,
                        bodySize: 1,
                    });
                r.state.maxCreatures = capA;
                if (Pred && Prey) {
                    r.state.creatures = [Pred, Prey];
                    r._creatureScentHuntDir(Pred, 0.0);
                    const after1 = r._scentSizeBySoul ? r._scentSizeBySoul.size : 0;
                    r._creatureScentHuntDir(Pred, 0.0);
                    const after2 = r._scentSizeBySoul ? r._scentSizeBySoul.size : 0;
                    out.a3SizeCacheReuse = after1 === 1 && after2 === 1;
                }
                r.state.creatures = savedC;
                if (Pred) r.removeCreature(Pred);
                if (Prey) r.removeCreature(Prey);
            } finally {
                if (r.setGameMode) r.setGameMode(sm0);
            }
        }

        // ============== A1 Audit-Heilungen ==============
        // (Heilung #1) Snapshot persistiert grownBlueprints
        const snap = r.buildStateSnapshot ? r.buildStateSnapshot() : null;
        out.a1SnapshotHasGrown = !!(snap && snap.grownBlueprints && typeof snap.grownBlueprints === "object");
        // (Heilung #2) Eviction respektiert aktive Architekturen
        out.a1EvictionRespectsActive = false;
        if (typeof r._isGrownBlueprintReferenced === "function") {
            // Setze einen test-grown-Bauplan + Architektur, force CAP-Überlauf,
            // prüfe dass der referenzierte Bauplan überlebt.
            const testKey = "grown_baum_eiche_testkey";
            r.state.blueprints[testKey] = {
                name: testKey,
                label: "Test",
                builtIn: true,
                _isGrown: true,
                _grownSpecies: "baum_eiche",
                instanced: true,
                parts: [
                    { shape: "cylinder", material: "holz", position: { x: 0, y: 0, z: 0 }, size: { x: 1, y: 1, z: 1 } },
                ],
            };
            r.state.architectures = r.state.architectures || [];
            const sentinelArch = {
                id: "test-arch-v18210",
                type: testKey,
                position: { x: 0, y: 0, z: 0 },
            };
            r.state.architectures.push(sentinelArch);
            // Saved Ring-State + Init
            const savedRing = r._growTreeRing ? [...r._growTreeRing] : null;
            r._growTreeRing = [testKey];
            // Erzeuge 260+ Dummy-Bauplane, um CAP=256 zu überschreiten
            for (let i = 0; i < 260; i++) {
                const dummyKey = `grown_dummy_${i}`;
                r.state.blueprints[dummyKey] = {
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
            out.a1EvictionRespectsActive = !!r.state.blueprints[testKey];
            // Cleanup
            r.state.architectures = r.state.architectures.filter((a) => a.id !== sentinelArch.id);
            delete r.state.blueprints[testKey];
            for (let i = 0; i < 260; i++) delete r.state.blueprints[`grown_dummy_${i}`];
            r._growTreeRing = savedRing;
        }
        // (Heilung #3) SPEZIES-DIVERSITÄT: 6 Arten erzeugen unterschiedliche Geometrie
        const species = ["baum_eiche", "baum_kiefer", "baum_birke", "baum_erle", "baum_buche", "baum_tanne"];
        const sigs = new Set();
        for (const sp of species) {
            const p = r._growTreeBlueprint(sp, "audit-test-seed");
            if (Array.isArray(p)) {
                // Signatur = aggregierter Höhe/Krone-Farbe-Hash (kein vollständiger JSON-Vergleich,
                // weil Position-Jitter durch verschiedenen seedString variiert).
                let maxY = 0,
                    totalY = 0,
                    leafColor = 0,
                    leafCount = 0;
                for (const part of p) {
                    if (part.position.y + part.size.y * 0.5 > maxY) maxY = part.position.y + part.size.y * 0.5;
                    totalY += part.size.y;
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
        // (A2b) Live-Uniform existiert in atmoUniforms
        const au = r._ensureAtmoUniforms ? r._ensureAtmoUniforms() : null;
        out.a2UniformExists = !!(au && au.r5StructureBoost);
        // (A2c) Setter existiert + setzt Uniform + persistiert
        out.a2SetterExists = typeof r.setStructureBoost === "function";
        if (out.a2SetterExists) {
            const before = au.r5StructureBoost.value;
            r.setStructureBoost(2.0);
            out.a2SetterUpdatesUniform = au.r5StructureBoost.value === 2.0;
            out.a2SetterPersists = r.state.atmosphere.r5StructureBoost === 2.0;
            // Range clamp: 3.0 → 2.5 (cap), 0.1 → 0.5 (floor)
            r.setStructureBoost(5.0);
            out.a2SetterCapsHi = au.r5StructureBoost.value === 2.5;
            r.setStructureBoost(0.1);
            out.a2SetterCapsLo = au.r5StructureBoost.value === 0.5;
            r.setStructureBoost(before); // restore
        }
        // (A2e) DOM-Slider existiert
        out.a2DomSliderExists = !!document.getElementById("slider-structureboost");

        // ============== A3: _scentAt KREATUR-KI ==============
        // (A3a) Helper existieren
        // (A3b) Konstanten gesetzt
        // (Welle LF: die Witterung wählt die Beute an der Nase — der Proben-Schritt des Gradienten scentProbeM fiel;
        // der Ring der Hetze hetzM und die Pirsch-Sicht sind Jagd-Gesetz)
        out.a3ScentRangeM = A._verhaltenGesetz().jagd.scentRangeM;
        out.a3ScentProbeM = A._verhaltenGesetz().jagd.hetzM;
        out.a3ConstsOk =
            typeof out.a3ScentRangeM === "number" &&
            out.a3ScentRangeM >= 30 &&
            typeof out.a3ScentProbeM === "number" &&
            out.a3ScentProbeM > 0 &&
            A._verhaltenGesetz().jagd.scentProbeM === undefined;
        // (A3e) BEHAVIORAL: ein wild-Wesen mit Beute in 50m kriegt einen Dir
        // zurück (nicht null). Wir setzen ein Test-Setup synthetisch.
        const savedMode = r.getGameMode ? r.getGameMode() : "frieden";
        const savedCreatures = r.state.creatures;
        try {
            if (r.setGameMode) r.setGameMode("pfad");
            // ein wildes Wesen und seine Beute 20 m östlich — ECHTE Leiber (Welle LF: das Beute-Urteil liest die EINE Masse
            // des Leibs aus der Gestalt; der Wolf jagt, der Fuchs ist scheu und seine Beute)
            const pmH = r.state.playerMesh.position;
            const capH = r.state.maxCreatures;
            r.state.maxCreatures = Math.max(capH || 0, savedCreatures.length + 2);
            const optH = { precise: true, bodySize: 1 };
            const predator = r.spawnCreatureAt(pmH.x + 380, pmH.y, pmH.z - 380, "calm", "wolf", optH);
            const prey = predator && r.spawnCreatureAt(pmH.x + 400, pmH.y, pmH.z - 380, "calm", "fuchs", optH);
            r.state.maxCreatures = capH;
            if (predator && prey) {
                prey.position.set(predator.position.x + 20, predator.position.y, predator.position.z);
                r.state.creatures = [predator, prey];
                const dirWithPrey = r._creatureScentHuntDir(predator, 0.0);
                out.a3PredatorHasDir = !!(dirWithPrey && (dirWithPrey.x !== 0 || dirWithPrey.z !== 0));
                // Ohne Beute → null
                r.state.creatures = [predator];
                const dirNoPrey = r._creatureScentHuntDir(predator, 0.0);
                out.a3NoPreyNoDir = dirNoPrey === null;
            }
            r.state.creatures = savedCreatures;
            if (predator) r.removeCreature(predator);
            if (prey) r.removeCreature(prey);
            // Strike-Range-Test mit ECHTEN Leibern (0710-4: der Biss stößt durch das EINE Impuls-Gesetz und liest die
            // Masse aus der Gestalt — ein körperloser Stub hat keine, der Biss bräche fail-closed): ein Wolf, ein Fuchs
            // in 1,2 m → der Ansprung trifft UND stößt die Beute vom Jäger weg.
            r.state.creatures = savedCreatures;
            const pmS = r.state.playerMesh.position;
            const capS = r.state.maxCreatures;
            r.state.maxCreatures = Math.max(capS || 0, savedCreatures.length + 2);
            const opt = { precise: true, bodySize: 1 };
            const jaeger = r.spawnCreatureAt(pmS.x + 340, pmS.y, pmS.z - 340, "calm", "wolf", opt);
            const beute = jaeger && r.spawnCreatureAt(pmS.x + 342, pmS.y, pmS.z - 340, "calm", "fuchs", opt);
            r.state.maxCreatures = capS;
            if (jaeger && beute) {
                const B0 = { x: jaeger.position.x + 1.2, z: jaeger.position.z };
                beute.position.set(B0.x, jaeger.position.y, B0.z);
                beute.userData.hp = 1e6; // der Biss soll stoßen, nicht töten
                beute.userData._stossV = null;
                jaeger.rotation.set(0, Math.PI / 2, 0); // der Beute zugewandt
                jaeger.userData._steuer = null;
                r.state.creatures = [jaeger, beute];
                jaeger.userData.nextHuntStrikeAt = -Infinity;
                const struck = r._tickCreatureScentStrike(jaeger);
                // DER BISS IST DER ANSPRUNG (Welle LF kampf, Posten 5): der Takt des Spiels läuft (der Kreatur-Takt, dann
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
                r.state.creatures = savedCreatures;
            }
            if (jaeger) r.removeCreature(jaeger);
            if (beute) r.removeCreature(beute);
        } catch (e) {
            out.a3Error = String((e && e.message) || e);
        } finally {
            r.state.creatures = savedCreatures;
            if (r.setGameMode) r.setGameMode(savedMode);
        }

        // ============== A4: MANA-KONSUMENT γ ==============
        // (A4a) Konstante existiert
        out.a4ManaCostConst = typeof A.TOOL_OP_MANA_COST === "number" && A.TOOL_OP_MANA_COST > 0;
        // (A4d) BEHAVIORAL: phaseChange-Op (ritueller-stab) zieht Mana statt Stamina
        const sm = r.getGameMode ? r.getGameMode() : "frieden";
        // V18.210 (Audit-Heilung #5) — saubere Test-Hygiene: state vorher
        // SCHNAPPEN (Stat-Felder + tools-Liste), nachher EXAKT restaurieren.
        const savedManaA4 = r.state.player.mana;
        const savedManaMaxA4 = r.state.player.manaMax;
        const savedStamA4 = r.state.player.stamina;
        const savedStamMaxA4 = r.state.player.staminaMax;
        const savedToolsA4 = Array.isArray(r.state.player.tools) ? [...r.state.player.tools] : [];
        try {
            if (r.setGameMode) r.setGameMode("pfad");
            r.state.player.manaMax = 100;
            r.state.player.mana = 50;
            r.state.player.staminaMax = 100;
            r.state.player.stamina = 50;
            // Ein eigener Bauplan zum Editieren (kein builtIn)
            const bpName = "test_v18210_bp";
            if (!r.state.player.tools.includes("ritueller-stab")) {
                r.state.player.tools.push("ritueller-stab");
            }
            r.state.blueprints[bpName] = {
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
            const manaBefore = r.state.player.mana;
            const stamBefore = r.state.player.stamina;
            const result = r.applyOpToPart(bpName, 0, "ritueller-stab");
            out.a4ResultOk = result && result.ok === true;
            out.a4ManaWasDrained = r.state.player.mana < manaBefore;
            out.a4StaminaUntouched = r.state.player.stamina === stamBefore;
            // Mana zu klein → ablehnen, Mana unverändert (atomar)
            r.state.player.mana = 1;
            const result2 = r.applyOpToPart(bpName, 0, "ritueller-stab");
            out.a4InsufficientRejected = result2 && result2.ok === false && result2.reason === "not_enough_mana";
            out.a4InsufficientAtomic = r.state.player.mana === 1;
            // Stamina-Op (hände) zieht Stamina, NICHT Mana
            r.state.player.mana = 100;
            r.state.player.stamina = 50;
            const manaBeforeStam = r.state.player.mana;
            const stamBeforeStam = r.state.player.stamina;
            r.applyOpToPart(bpName, 0, "hände");
            out.a4HandsZiehtStamina = r.state.player.stamina < stamBeforeStam;
            out.a4HandsManaUntouched = r.state.player.mana === manaBeforeStam;
            // Schöpfer-Modus: keine Kosten
            if (r.setGameMode) r.setGameMode("schöpfer");
            r.state.player.mana = 50;
            r.state.player.stamina = 50;
            const result3 = r.applyOpToPart(bpName, 0, "ritueller-stab");
            out.a4SchoepferOk = result3 && result3.ok === true;
            out.a4SchoepferKostenfrei = r.state.player.mana === 50 && r.state.player.stamina === 50;
            // Cleanup
            delete r.state.blueprints[bpName];
        } catch (e) {
            out.a4Error = String(e && (e.message || e));
        } finally {
            if (r.setGameMode) r.setGameMode(sm);
            // V18.210 (Audit-Heilung #5) — exakt restaurieren, damit
            // nachfolgende Bands den Spieler frisch sehen (sonst leaken
            // ritueller-stab im Werkzeug-Inventar + Stat-Drift).
            r.state.player.mana = savedManaA4;
            r.state.player.manaMax = savedManaMaxA4;
            r.state.player.stamina = savedStamA4;
            r.state.player.staminaMax = savedStamMaxA4;
            r.state.player.tools = savedToolsA4;
        }

        return out;
    });

    // A1 — Worldgen-Hook
    check("V18.216 FRESH-Welt genVersion = 9 (KARST + Büsche aktiv; war 8)", res.a1FreshGenIs4 === true);
    check("V18.210-A1c Determinismus: (species, seed) → derselbe cacheKey", res.a1Deterministic === true);
    check("V18.210-A1d Cache-Reuse: SELBE seed → SELBES Bauplan-Object", res.a1CacheReuse === true);
    check("V18.210-A1e 6 seeds → ≥5 unique cache keys", res.a1ManyVariants === true);
    check("V18.210-A1f V17.16-Schutz: tag-Achsen ≈ baum_eiche (4×Δ<0.05)", res.a1TagNeutral === true);
    check(
        "V18.210-A1g Memory-Cap: Ring ≤ 256 nach 300 seeds (V18.210-Audit #2 CAP-Erweiterung)",
        res.a1RingCap === true
    );

    // A2 — R5 Live-Slider
    check("V18.210-A2b Live-Uniform r5StructureBoost in atmoUniforms", res.a2UniformExists === true);
    check("V18.210-A2c setStructureBoost-Setter existiert", res.a2SetterExists === true);
    check("V18.210-A2c2 Setter aktualisiert Uniform live", res.a2SetterUpdatesUniform === true);
    check("V18.210-A2c3 Setter persistiert (atmosphere.r5StructureBoost)", res.a2SetterPersists === true);
    check("V18.210-A2c4 Setter cap-clamp (5.0 → 2.5)", res.a2SetterCapsHi === true);
    check("V18.210-A2c5 Setter floor-clamp (0.1 → 0.5)", res.a2SetterCapsLo === true);
    check("V18.210-A2e DOM-Slider slider-structureboost existiert", res.a2DomSliderExists === true);

    // A3 — Scent KI
    check(
        `V18.210-A3b VERHALTEN.jagd.scentRangeM/hetzM Gesetz, kein Gradienten-Schritt (range=${res.a3ScentRangeM}, hetzM=${res.a3ScentProbeM})`,
        res.a3ConstsOk === true
    );
    check("V18.210-A3e BEHAVIORAL: wild + Beute → direction != null", res.a3PredatorHasDir === true);
    check("V18.210-A3e2 BEHAVIORAL: wild ohne Beute → null", res.a3NoPreyNoDir === true);
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
    check(
        "V18.210-A3-Watch1b sizeFactor-Cache: zweimaliger Aufruf → Cache-Size bleibt 1 (nur 1 Compute pro Soul)",
        res.a3SizeCacheReuse === true
    );

    // A4 — Mana-Konsument
    check("V18.210-A4a TOOL_OP_MANA_COST Konstante existiert", res.a4ManaCostConst === true);
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

// DAS RAUSCH-GESETZ (Welle G, der Boden-Stoff): Boden-, Substanz- und Mikro-Stoffe lesen EIN Gradienten-Rauschen aus dem
// Rausch-Atlas (`_rauschAtlas`), nie das Hash-Rauschen `mx_noise_float` (je Aufruf 8 Gitter-Hashes, 26 je Boden-Fragment).
// Proben: Absenz im Code der fünf Stoff-Bauer · KONSUM im Knoten-Graph des GEZEICHNETEN Boden-Stoffs (die Shader-Kosten-
// Linse `__stoffGraph`, scripts/lib/shader-kosten.cjs: kein Rausch-Funktions-Knoten, die 76 Ladungen des Atlas im Graph — 7 Raum-
// Werte × 6 + 17 Ebenen × 2 = 76 (K53: der Fleck des Wiesen-Grunds ging mit ihm ins Gesetz, `_bodenFarbeAt`, 78 → 76;
// K17-3 Runde 2: die acht Halm-Schichten der Wiese stehen wieder ausgeschrieben, ihre Mischung in
// der reinen Funktion `rauschEbene` — als Schleife in `wieseRelief` las eine Layout-Funktion die Bindung des Atlas); die siebte Raum-Probe ist die Welle der Fels-Bänke, `rausch` des Rechenwerks, auf der CPU
// gelaende-core `rauschRaum` —, kein verborgener Fn-Rumpf (der Fels-Term rechnet im Zweig des Stamms, `_zweigTSL`: sein Inhalt
// reist als Argument, der Graph sieht ihn); die Basis f2361bb1 trägt dort 26 mx-Knoten und 0 Ladungen) · das Rechenwerk des
// Fels-Gesetzes rechnet kein Rauschen aus Hash-Zügen (K17 wellte die Bänke mit einem Wert-Rauschen aus acht Ziehungen im
// Fragment: die Ladungen fielen 78 → 72, die Absenz sah es nicht) · die
// Atlas-Bytes sind die MaterialX-Gradienten (lookup3, eigene Portierung hier) und richtig gepackt. Die GPU-Gleichheit (WGSL
// gegen CPU) und das Budget des erzeugten WGSL misst dieselbe Linse am echten Renderer (`werkbank shader --stoff boden
// --rauschprobe`).
async function checkBandRauschGesetz(ctx) {
    const { page, check } = ctx;
    await page.evaluate(SK.SHADER_INSTALL);
    const res =
        (await safeEvaluate(page, () => {
            const r = window.anazhRealm;
            const A = r.constructor;
            const out = {};
            const stoffe = [
                "_terrainGeologyAlbedo",
                "_substanceCharacter",
                "_wegeBodenFarbe",
                "_applySubstanceResponse",
                "_buildPbrNodeMaterial",
            ];
            out.absenz = stoffe.filter((n) => /mx_noise_float/.test(window.__codeOf(r[n])));
            // das Rechenwerk des Fels-Gesetzes (gelaende-core): Fein-Term und Schutt-Korn laufen im Fragment — ein Rauschen
            // lesen sie nur über `o.rausch` (EINE Probe im Rausch-Atlas), nie ein Gitter-Rauschen aus Ziehungen (`wert3`)
            const GK = window.__gelaendeCore;
            // (die Welle rechnet `felsWelle`, K17-3: der Shader liest sie außerhalb der Fels-Funktion und reicht sie hinein)
            const feinSrc =
                GK && GK.felsFein && GK.felsWelle ? window.__codeOf(GK.felsFein) + window.__codeOf(GK.felsWelle) : "";
            const kornSrc = GK && GK.schuttKorn ? window.__codeOf(GK.schuttKorn) : "";
            if (!feinSrc || !/o\.rausch\(/.test(feinSrc)) out.absenz.push("felsFein ohne o.rausch");
            for (const [n, src] of [
                ["felsFein", feinSrc],
                ["schuttKorn", kornSrc],
            ])
                if (/wert3|mx_noise/.test(src)) out.absenz.push(n + " (Gitter-Rauschen aus Ziehungen)");
            // KONSUM: der Knoten-Graph des Stoffs, den der Boden zeichnet (vor dem Bau — was der Compiler liest)
            out.graph = window.__stoffGraph(r.state.voxelChunkMaterial);
            // DIE ATLAS-BYTES: die MaterialX-Gradienten aus lookup3 (eigene Portierung), gepackt je Komponente × 4 Ecken
            if (typeof A._rauschAtlasDaten !== "function") {
                out.falsch = out.packung = "kein Rausch-Atlas";
                return out;
            }
            const P = A.RAUSCH_GESETZ.P;
            const d = A._rauschAtlasDaten();
            const rot = (x, k) => ((x << k) | (x >>> (32 - k))) >>> 0;
            const mxHash = (x, y, z) => {
                let a = (0xdeadbeef + 12 + 13) >>> 0;
                let b = a;
                let c = a;
                a = (a + x) >>> 0;
                b = (b + y) >>> 0;
                c = (c + z) >>> 0;
                c = ((c ^ b) - rot(b, 14)) >>> 0;
                a = ((a ^ c) - rot(c, 11)) >>> 0;
                b = ((b ^ a) - rot(a, 25)) >>> 0;
                c = ((c ^ b) - rot(b, 16)) >>> 0;
                a = ((a ^ c) - rot(c, 4)) >>> 0;
                b = ((b ^ a) - rot(a, 14)) >>> 0;
                c = ((c ^ b) - rot(b, 24)) >>> 0;
                return c;
            };
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
        `RAUSCH-GESETZ (B) KONSUM: der gezeichnete Boden-Stoff trägt im Knoten-Graph ${atlas} Atlas-Ladungen (Soll 76), ${g.rauschen} Rausch-Funktionen (Soll 0${namen ? ": " + namen : ""}) und ${g.verborgen} verborgene Fn-Rümpfe (Soll 0; ${g.zweig} Zweige des Stamms) — ${g.knoten} Knoten aus ${(g.slots || []).length} Slots${g.fehler ? " — " + g.fehler : ""}`,
        !g.fehler && g.rauschen === 0 && g.verborgen === 0 && atlas === 76
    );
    check(
        `RAUSCH-GESETZ (C) die Atlas-Bytes sind die MaterialX-Gradienten (${res.falsch} falsch) und richtig gepackt (${res.packung} Brüche)`,
        res.falsch === 0 && res.packung === 0
    );
    check(
        `RAUSCH-GESETZ (D) die Gradienten-Ebenen tragen die mx-Verteilung 6/4/6 von 16 (${(res.ebenen || []).join(" / ")})`,
        res.verteilung === true
    );
}

async function checkBandV18331ReplayDeterminism(ctx) {
    const { page, check } = ctx;
    const res = await safeEvaluate(page, () => {
        const r = window.anazhRealm;
        const s = r.state;
        const out = {};
        if (
            typeof r.replayRun !== "function" ||
            typeof r._replaySnapshotState !== "function" ||
            !s.playerMesh ||
            !s.playerVel
        )
            return out;
        const DT = 1 / 60;
        const mkFrames = (seq) => {
            const fr = [];
            for (const [count, k] of seq)
                for (let i = 0; i < count; i++)
                    fr.push({
                        dt: DT,
                        yaw: 0,
                        w: !!k.w,
                        a: !!k.a,
                        s: !!k.s,
                        d: !!k.d,
                        shift: !!k.shift,
                        space: !!k.space,
                    });
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

module.exports = {
    checkInitialState, checkRing1Grok, checkBandV1778LadderCut, checkBandV18278LoopErrorBoundary,
    checkBandWellePerfENexusGovernor, checkBandWaldbodenKaskade, checkBandTailleOmega5, checkBandV18149Statusbar,
    checkBandV18163DetailTiefe, checkBandV18165KonsoleHeil, checkBandV18177AAA, checkBandV18210Verdrahtung,
    checkBandRauschGesetz, checkBandV18331ReplayDeterminism,
};
