// Messung ohne Eingriff — WER TRÄGT EINE LANGE AUFGABE? (Fund 9610f42d: in 6 von 59 Zweit-Boots eines frischen Profils hielt EINE
// Aufgabe den Haupt-Faden 3,3–3,5 s; 22 Boots mit dem vollen Ruf-Profil FREI_INIT fingen sie nie.) Billig genug für JEDEN Lauf:
//  (1) die Abschnitte des Takts und der Ankunft beim Namen — eine feste Liste von Gliedern, jeder Ruf ≥ 150 ms als
//      [Name, ab ms, Dauer ms, Tiefe] in `extra.abschnitt.ruf` (bis zum ersten Weltbild + 2 s);
//  (2) das Urteil des Browsers selbst — jeder lange Bild-Rahmen ≥ 1 s (`long-animation-frame`): Dauer, davon blockiert, Stil und
//      Layout, je Skript Aufrufer · Funktion · Datei · Dauer · Pause · erzwungenes Layout (`extra.abschnitt.rahmen`). Trägt der
//      Rahmen 3 s und seine Skripte nicht, ist es kein Rahmen des Spiels (Layout, Schrift von der Platte, Fremd-Last);
//  (3) jeder Bruch über den EINEN Melder mit seiner Zeit (`extra.abschnitt.bruch`: ein Guss im Haupt-Faden nennt sich dort selbst).
// Leser: abschnitt-lesen.cjs.
if (P) {
    const X = (window.__sondeExtra = window.__sondeExtra || {});
    const A = (X.abschnitt = { ruf: [], rahmen: [], bruch: [], fehlt: [], fehler: "" });
    const GLIEDER = [
        "loadState", "generateNewWorld", "_foundryWirtSteht", "_foundryIngestBook", "_genesisPlanAn",
        "tickDayNight", "_applyDayNightToScene", "_atmoTakt", "_ensureSkyEnvironment", "_einmalRender",
        "_loopVoxelStreaming", "_runFrameScheduler", "_dispatchFrameJobs", "_ensureFarWaterSheet", "_tickFernRing", "_tickWegeKarte",
        "_loopAutoSave", "_applyFixedInterpolation", "_tickMountedMovement", "_loopCamera", "animatePlayerSoul",
        "tickArchitectureCulling", "tickBuildMode", "tickArchitectures", "tickAffordances", "_spiegelFeldTakt", "_haarFederTakt", "_seilTakt",
        "_kernPflichtWand", "_loopShadowUpdate", "_loopRender", "_gpuLeineAnlegen", "updateFps", "_perfSenseFoldFrame",
        "_tickFoundryIngest", "_weltStandTakt", "_leibBereit", "applyPlayerSoul", "_leibDerSeele", "_buildHumanoidRig", "_gelenkGestalt",
        "_ofenMenschTemplate", "_ofenAssembleAsset", "_applyEgoSicht", "_refreshHeldMesh", "recomputePlayerStats", "_vorbauBedienung",
        "_loopPhysicsSync", "_stepCharacter", "_tickBootPhase3", "_hotbarNachBuch", "_ladeschirmStand", "_uiPuls",
    ];
    let tiefe = 0;
    const offen = (r) => !(r.state && r.state._weltbildDa) || performance.now() - r.state._weltbildDa < 2000;
    for (const name of GLIEDER) {
        const f0 = P[name];
        if (typeof f0 !== "function") {
            A.fehlt.push(name);
            continue;
        }
        P[name] = function (...a) {
            const t = performance.now();
            tiefe++;
            try {
                return f0.apply(this, a);
            } finally {
                tiefe--;
                const dt = performance.now() - t;
                if (dt >= 150 && A.ruf.length < 300 && offen(this)) A.ruf.push([name, Math.round(t), Math.round(dt), tiefe]);
            }
        };
    }
    const B0 = P._bruchMelden;
    if (typeof B0 === "function")
        P._bruchMelden = function (...a) {
            if (A.bruch.length < 60) A.bruch.push([Math.round(performance.now()), String(a[0]).slice(0, 260)]);
            return B0.apply(this, a);
        };
    try {
        new PerformanceObserver((liste) => {
            for (const e of liste.getEntries()) {
                if (e.duration < 1000 || A.rahmen.length >= 40) continue;
                A.rahmen.push({
                    ab: Math.round(e.startTime),
                    ms: Math.round(e.duration),
                    blockiert: Math.round(e.blockingDuration || 0),
                    bildAb: Math.round(e.renderStart || 0),
                    stilAb: Math.round(e.styleAndLayoutStart || 0),
                    skripte: (e.scripts || []).map((s) => ({
                        rufer: String(s.invoker || "").slice(0, 80),
                        art: s.invokerType,
                        fn: s.sourceFunctionName || "",
                        datei: String(s.sourceURL || "").split("/").pop().split("?")[0],
                        ab: Math.round(s.startTime),
                        ms: Math.round(s.duration),
                        pause: Math.round(s.pauseDuration || 0),
                        layout: Math.round(s.forcedStyleAndLayoutDuration || 0),
                    })),
                });
            }
        }).observe({ type: "long-animation-frame", buffered: true });
    } catch (err) {
        A.fehler = "kein long-animation-frame: " + String(err.message);
    }
}
