class AnazhRealm_dirigent_takt {
    // ===== ATLAS · Dirigent/takt — die Spielschleife · Frame-Planer · Fixed-Step · Replay =====
    startEternalLoop() {
        // ### Spiel-Loop ###
        let lastTime = performance.now();
        const loop = (time) => {
            // NaN-WAND am Loop-Eingang: ein argloser Aufruf (`_gameLoopTick()`, jeder Test-Warmup) liefert time
            // undefined → NaN in delta/frameMs vergiftet die frameMs-EWMA für immer (der Regler säße still im
            // Totband). Bewacht von `gate:regler-sim`.
            const t = Number.isFinite(time) ? time : performance.now();
            // DIE WANDUHR UND DER SPIEL-TAKT (K21, Lehre 13): EINE Obergrenze des Takts, HIER an der Wurzel. Eine Pause
            // (versteckter Tab, Debugger, Lade-Stau) ist eine Pause — die Welt läuft danach mit höchstens EINEM Schritt
            // von `TAKT_DECKEL_S` weiter (vorher trug der ungedeckelte Takt jedes laufende Tier um Tempo × Pause: 73 m bis
            // 5 km, `gate:move-under-load` (d)). `delta` (der Spiel-Takt) liest jede Bewegung: Fix-Schritt, Tiere, Ritt,
            // Rauch, Wetter-Zug. Die Wanduhr lesen nur, die sie benannt brauchen: `wandDelta` das Mess-Instrument
            // (Perf-Sinn, HUD, Flugschreiber — der Frame dauerte so lange) und das Foundry-Laden (die Welt lädt mit der
            // Wanduhr); `currentTime` als Zeitstempel (Tageszeit mit eigener Tab-Schlaf-Grenze, Drosseln, Netz-Anker).
            const wandDelta = Math.max(0.001, (t - lastTime) / 1000);
            const delta = Math.min(wandDelta, AnazhRealm.TAKT_DECKEL_S);
            lastTime = t;
            const currentTime = t / 1000;

            // W12 — ist ein Portal offen, friert die Heimat-Welt ein: der
            // Loop kehrt VOR Physik/Ticks/Render um. lastTime wurde gerade
            // gesetzt und bleibt frisch → kein Delta-Sprung beim Verlassen.
            if (this._portalOverlay) return;

            // Error-Boundary des ewigen Loops: ein einziger Throw in einem Frame-Schritt bräche den
            // setAnimationLoop-Callback → die Welt erstarrt. Frame-Fehler werden abgefangen und gedrosselt mit
            // Stack geloggt, die Welt läuft weiter (der Headless-Pump fängt selbst ab — sieht den Freeze nie).
            try {
                // DIE PHASE DES TAKTS (B3, Lehre 13) — EINE Frage am Anfang: zeichnet dieser Takt (`bild`, die GPU-Leine und
                // unter dem Ladeschirm das fällige Lade-Bild, `_ladeBildFaellig`)? Ein Takt, der zeichnet, trägt das ganze
                // Spiel — auch das Lade-Bild: was das Bild zeigt (Licht, Bündel-Sicht, Haltung, Rauch, Membranen) und was
                // zum ersten Mal Stoffe baut oder speichert, läuft vor ihm, unter dem Ladeschirm, nie im ersten gespielten
                // Takt (Prüfung B3-1: Rauch im ersten Bild 0 statt 24 Teilchen, eine Aufgabe von 189–210 ms nach dem Bild).
                // Ein Lade-Takt OHNE Bild (`ruht`) trägt nur, was das erste Weltbild füttert — Foundry und Einhängen, den
                // Leib, Strom und Takt-Planer, den Genesis-Ort, Körper und Kamera, den Bau-Gang — und das Netz, das dem
                // Mitspieler gehört (K60). Radeon kalt am Kopf 210fe8a7 rief jeder der 224–256 Takte unter dem Ladeschirm jedes
                // Spiel-Glied (515–1 007 ms); mit der Phase ruft es jedes Lade-Bild (24 von 210 Takten, 281 ms), das Netz
                // jeder Takt.
                const bild = this._gpuLeineFrei();
                const ruht = !bild && this._ladeTakt();
                // DER SCHIRM einmal je Takt (die EINE Quelle jeder Schirm-Größe, `_schirm`).
                this._schirmMessen();
                // Foundry so FRÜH wie möglich anwerfen: das Studio-iframe lädt ~1–2 s, und `_ensureAssetFoundry`
                // entstünde sonst erst lazy beim ersten Foundry-Baum (`_foundryRewarmColdTrees` liest `_foundry`,
                // erzeugt es nicht). Billig (nur iframe); das Gate (foundry-aus → null, headless-Null → No-op)
                // prüft `_ensureAssetFoundry` selbst.
                if (!this._foundry) this._ensureAssetFoundry(); // ihr Boot-Fehler bricht in ihr selbst laut (K22)

                if (!ruht) {
                    // ### Nexus-Update ### (V9.44-f → _loopNexusUpdate)
                    this._loopNexusUpdate();

                    // ### Grok-Stimme (Ring 1) ###
                    this.grokTick(currentTime);

                    // ### Nexus-DSL Scheduler (Ring 2) ###
                    this.dslTick(currentTime);

                    // ### Welt-Regeln ###
                    // Stehende Bedingung→Effekt-Regeln prüfen + feuern (gebudgetet); nach dslTick, damit eine soeben
                    // geplante Geste vor den Regeln läuft.
                    this._tickWorldRules(currentTime);

                    // ### Player-Emotionen (Ring 3) ###
                    this.updatePlayerEmotions(currentTime);

                    // ### Player-Boosts (Welle 6.D Etappe 2) ###
                    // 1×/s self-throttled — Emotion-Trigger, Resonance-Trigger, Ablauf.
                    this.tickPlayerBoosts(currentTime);

                    // ### Kreatur-Boosts (Welle 6.H Phase 2F.3) ###
                    // 1×/s per-creature self-throttled — säubert abgelaufene Konsumable-Boosts.
                    this.tickCreatureBoosts(currentTime);

                    // ### Vitals-Tick (Wunde·Stamina·Mana — ALTLASTEN-NULL) ###
                    // HP-Regen während aktiver Wandlung + Ablauf-Detection.
                    this.tickPlayerVitals(currentTime);

                    // ### Stats-HUD (Welle 6.X.4 B3) ###
                    // HP/Stamina-Bars über der Hotbar, throttled auf 10 Hz.
                    this.tickStatsHud(currentTime);

                    // ### Tag-Nacht-Zyklus ###
                    // timeOfDay läuft jeden Frame; Lights + Skybox folgen.
                    this.tickDayNight(currentTime);

                    // ### Wetter-Übergang (Welle 6.G3.b) ###
                    // Cross-Fade über 45 s. No-op wenn kein Übergang aktiv.
                    this.tickWeatherTransition(currentTime);

                    // ### Fauna-Lifecycle (Welle 6.G3.c) ###
                    // Alle 10 s: Geburt bei < TARGET, Tod bei > MAX mit Trauer.
                    this.tickFaunaLifecycle(currentTime);

                    // ### Boot-Phase 3 (V18.308) — die deferierte Boot-Arbeit progressiv ###
                    // Spawnt die Initial-Kreaturen NACH der Kontrolle, einen Atem pro Wesen,
                    // nur wenn der Frame Luft hat. No-op, sobald P3 vollendet ist.
                    this._tickBootPhase3(performance.now());

                    // ### Fern-Deko (P0.3 Bühnen-Ordnung) — das Sternfeld NACH der Bühne ###
                    // No-op, wenn nichts deferiert ist (headless baut sofort in createGalaxySkybox).
                    this._tickBootFernDeko();

                    // ### Symphonie (Ring 4): Lofi + Klang-Welt ###
                    this.symphonyTick();

                    // ### Status-Panel (UI V1) ###
                    this.updateStatusPanel(currentTime);

                    // ### Bodenprüfung / Frustum-Culling / UFOs ### (V9.44-f)
                    this._loopGroundCheck(currentTime);
                    this._loopFrustumCulling();
                    this._loopAnimateUfos(currentTime);
                }

                // ### DAS NETZ ### — in JEDEM Takt, auch unter dem Ladeschirm: es gehört dem Mitspieler (K60, gate:mp-sync (d) —
                // Ort, Eingabe-Strom und Ghost-Verbrauch nach der Wanduhr, die 10-s-Räumung stiller Peers).
                // Region-Übergang: 1×/s reicht (niemand überquert eine 345.6 m-Region in einem Frame). Default OFF
                // (regionsActive=false → no-op); ein Übergang ruft _p2pRegionHandoff(oldKey,newKey).
                if (!this._regionTickLast || currentTime - this._regionTickLast >= 1000) {
                    this._regionTickLast = currentTime;
                    const crossing = this._regionTickDetectCrossing();
                    if (crossing && typeof this._p2pRegionHandoff === "function") {
                        this._p2pRegionHandoff(crossing.oldKey, crossing.newKey);
                    }
                }
                // Ring 11 V1 — Multi-User Position-Sync: Broadcast (30 Hz Drosselung intern) + Peer-Mesh-Update + Idle-
                // Purge. No-op wenn p2p.enabled === false oder nicht verbunden.
                this.p2pTick(performance.now());

                // ### Physik-Simulation ###
                // Der AKKUMULATOR dirigiert die Sim (Physik + Bewegung pro FIXED_DT-Häppchen, framerate-unabhängig)
                // — der EINE Pfad; `_loopPhysicsSync` lebt als Sim-Schritt in `_stepFixedSim`,
                // `_loopPlayerMovement` zusätzlich im `replayRun`-Pfad. Der Perf-Sense misst jede schwere Phase.
                let _pt = performance.now();
                this._loopFixedStep(delta, currentTime);
                this._perfSenseLap("physics", _pt);

                // V17.28 — Boden unter dem Boden: fällt der Spieler durch (Struktur-
                // Remesh-Timing, Teleport in ungebauten Chunk, …), fängt ihn das ab.
                this._rescuePlayerFromVoid();
                // DETERMINISMUS-BOGEN P3 — der „weiche Boden" (V18.271) ist entfallen: der
                // Feld-Controller (`_stepCharacter`) erdet den Spieler direkt aus dem Dichtefeld,
                // das überall definiert ist (auch unter ungebauten Chunks) → kein Durchfallen.

                if (!ruht) {
                    // V17.55 W1 — Halten-zum-Abbauen: der Auto-Hieb-Tick (gegated durch breakHeld +
                    // Pointer-Lock; das kontinuierliche Mahlen in der strikeInterval-Kadenz).
                    this._tickHarvest();

                    // 3-Phasen-Schwung-Tick: treibt Windup/Strike/Recover auf der ANZEIGE-Uhr (der Hit-Stop pausiert
                    // sie, die fixe Sim läuft weiter) und fegt in der Strike-Phase die Klingen-Kapsel durch die
                    // Kreaturen (_kampfSweepTick).
                    this._tickKampfSchwung(currentTime);

                    // BOGEN (B3-Inventar N4) — der Pfeil-Tick: dieselbe Anzeige-Uhr wie der
                    // Schwung (die fixe Sim bleibt unberührt); No-op ohne lebende Pfeile.
                    this._tickPfeile(currentTime);

                    // ARENA-GEFÜHL — der Bogen-Auszug (FOV-Zug + Abbruch-Wache);
                    // No-op ohne gespannten Bogen (byte-alt).
                    this._tickBogenZug(currentTime);

                    // ### Spielerbewegung + Sprung ### — V18.355/.358 PHASE C: die Bewegung läuft IM
                    // Akkumulator (`_stepFixedSim` pro FIXED_DT-Schritt, inkl. der Replay-Capture-Ernte)
                    // → hier nichts mehr (der variable Ein-Schritt-Pfad ist abgelöst).

                    // ### Selbstanalyse + Nexus-Evolution-Trigger ### (V9.44-f)
                    this._loopSelfAnalysis(currentTime);

                    // ### Schicht 1 — IQ-Ticks ###
                    // Pfad-Bucket-Sample (alle 2 s), Activity-Sample (jeden Frame), Keyword-Window-Cleanup (60 s),
                    // pending Outcomes finalisieren (5 s nach Programm-Lauf: Emotion/Activity-Delta).
                    this.samplePathBuckets(currentTime);
                    this.samplePlayerActivity(currentTime);
                    this.pruneRecentKeywords(currentTime);
                    this.finalizePendingOutcomes(currentTime);

                    // ### Kreaturen, Wetter, Wachstum ### (V9.44-f → _loopWeatherAndGrowth)
                    this._loopWeatherAndGrowth(delta);
                }

                // ### Unendliches Terrain — Voxel-Streaming ### (V9.44-f)
                _pt = performance.now();
                this._loopVoxelStreaming();
                this._perfSenseLap("streaming", _pt);

                // ### Skybox-Zeit ### (V9.44-f → _loopSkyboxZeit)
                this._loopSkyboxZeit(currentTime);

                if (!ruht) {
                    // ### Portal-Membranen ### (V18.464 — die Passage atmet + Hindurchgehen)
                    this._tickPortalMembranes(currentTime);
                }

                // DAS BILD, DAS JE TAKT EINSCHWINGT, füttert das erste Weltbild wie der Boden: Rauch (RAUCH_GESETZ je Frame,
                // nicht je Zeit) und Haus-Türen (der Flügel schließt je Takt weich aus der gebackenen Offen-Pose) laufen in
                // JEDEM Takt — nur im Lade-Bild stand der Rauch im ersten Bild mit 3 statt 24 Teilchen (B3-n1, Radeon kalt).
                // ### Haus-Türen ### (DORF-ERLEBNIS — die Tür öffnet sich dem Reisenden)
                this._tickHausTueren(currentTime);

                // ### Der Genesis-Ort ### (Ring der Kern-Portale + Portal-Vorschauen, vor jedem Budget)
                this._tickGenesisOrt(currentTime);

                // ### Kamin-Rauch ### (.105 — Quellen + minimale Lab-Partikel)
                this._updateDorfRauch(delta);

                if (!ruht) {
                    // ### Fähigkeiten ###
                    Object.keys(this.state.abilities).forEach((ability) => {
                        if (this.state.keys[ability]) this.state.abilities[ability](this, this.state);
                    });

                    // ### Speichern ### (V9.44-f → _loopAutoSave)
                    this._loopAutoSave(currentTime);
                }

                // ### Kamera ### (V9.44-f → _loopCamera)
                // V18.355 — PHASE C: VOR der Kamera die Render-Interpolation anwenden (das Auge
                // folgt der glatt interpolierten Spieler-Position, nicht der gestuften Sim-Position).
                this._applyFixedInterpolation();
                this._loopCamera(currentTime);

                if (!ruht) {
                    // Ring 5 V2: Soul-Animation. Glieder/Flügel/Schweif werden
                    // jeden Frame über sin/cos relativ zum aktuellen walkPhase
                    // rotiert. Idle-Loop (atmen, hover) läuft auch im Stand.
                    this.animatePlayerSoul(currentTime);
                }

                // Ring 6 V2: Culling-Tick (1 Hz) — baut/disposed Meshes je nach
                // Spieler-Distanz. Daten-Einträge bleiben immer.
                _pt = performance.now();
                this.tickArchitectureCulling();
                this._perfSenseLap("archCulling", _pt);
                if (!ruht) {
                    // Ring 6 V2: Bau-Modus — Phantom-Position nachziehen wenn aktiv.
                    this.tickBuildMode();
                    // Ring 6: Bau-Werke mit Animations-Hook (nur Wasserfälle aktuell).
                    this.tickArchitectures(currentTime);
                    // Welle 10b.3 — Affordance-Welt-Reaktionen: mounted-Movement +
                    // focusing-Hitze-Tick. Magnifying läuft asynchron via Tastendruck.
                    this.tickAffordances(delta);
                }

                // V9.75 (Welle C.4+5) — kein reaktiver Hydro-Tick mehr. Die
                // Welle-A-Maschinerie ist weg; Cell-Feld ist DERIVED (V9.74),
                // Wasser-Reaktion läuft via Voxel-Chunk-Rebuild.

                // ### Rendering ###
                // VOR dem Render: entscheiden, ob die Schatten-Map neu muss (im Stand gecacht). Eine erste Zeichnung baut
                // verteilt und kompiliert asynchron (die Erst-Zeichnung, `_configureRenderer`) — kein Vorwärmen.
                this._kernPflichtWand();
                // DIE GPU-LEINE: sind schon GPU_FRAMES_IM_FLUG Frames unterwegs, schickt dieser Takt nichts an die GPU
                // (Simulation, Eingabe und Streaming laufen weiter) — sonst lief die CPU der GPU davon (`bild`, die Phase
                // des Takts oben).
                if (bild) {
                    _pt = performance.now();
                    this._loopShadowUpdate();
                    this._loopRender(currentTime);
                    this._perfSenseLap("render", _pt);
                    this._gpuLeineAnlegen();
                }
            } catch (err) {
                // Ein Frame-Fehler erstarrt die Welt NICHT mehr (V18.278) — abfangen, loggen, weiter.
                this._loopErrorBoundary(err);
            }

            // Frame-Ende: Perf-Sense falten (EWMA) + PID-Regler treiben; frameMs = wandDelta·1000 (fängt auch den
            // Block-Spike eines Sync-Builds). LÄUFT IMMER, auch nach einem abgefangenen Frame-Fehler.
            // Unter der GPU-Leine zählt der Abstand zwischen GERENDERTEN Frames — der Regler, das HUD und der Flugschreiber
            // sähen sonst den 60-Hz-Takt der Simulation, wo die GPU weniger Bilder schafft.
            // Die Faltung steht unter derselben Fehler-Grenze wie der Frame (V18.278: ein werfender Frame-Schritt —
            // auch updateFps — erstarrt den Loop nicht, er wird gezählt).
            const _fms = this._gpuLeineFrameMs(wandDelta * 1000);
            if (_fms != null) {
                try {
                    this.updateFps(_fms / 1000);
                    this._perfSenseFoldFrame(_fms, _fms / 1000);
                } catch (err) {
                    this._loopErrorBoundary(err);
                }
            }
            // Ingest-Takt ebenfalls auf der LÄUFT-IMMER-Seite: im try-Block hungerte ein persistenter
            // Phasen-Fehler den Drain für immer aus. Sekunden-normalisiert: `wandDelta` (s) treibt eine
            // fps-unabhängige Freigabe-Rate (gedeckelt) — die Welt lädt mit der Wanduhr, nicht der Framerate.
            this._tickFoundryIngest(wandDelta);

            // Deferierter Avatar-Bau: EINMAL bauen, sobald seine zwei Vorlagen aus dem Faden im Memo liegen (`_leibBereit`,
            // K60-2 — bis dahin hielt der Guss im sechsten Frame den Haupt-Faden 2,4 s, und nach dem Buch goss er neu).
            // Eigenes try/catch (darf den Loop nicht reißen); headless setzt `_deferredAvatarSoul` nie (baut synchron).
            if (this.state._deferredAvatarSoul) {
                if (this._leibBereit()) {
                    const soul = this.state._deferredAvatarSoul;
                    this.state._deferredAvatarSoul = null;
                    try {
                        this.applyPlayerSoul(soul);
                    } catch (err) {
                        this._loopErrorBoundary(err);
                    }
                }
            }
        };
        // Loop-Funktion exponieren, damit Tests (playtest.cjs) einen Frame SYNCHRON treiben können statt
        // auf das headless gedrosselte rAF zu warten; der Loop selbst läuft weiter über setAnimationLoop.
        this._gameLoopTick = loop;
        this.state.renderer.setAnimationLoop(loop);
    }

    // ═══ DIE GPU-LEINE ═══
    // WebGPU lässt die CPU beliebig viele Frames vorauslaufen: gemessen 04.10. (echte GPU, Radeon 890M, Mess-Wiese,
    // Regler voll) war ein Frame erst 600 ms nach dem CPU-Ende auf der GPU fertig (≈ 10 Frames in der Schlange) —
    // jede Eingabe sah der Spieler 0,6 s später. Die Leine hält höchstens GPU_FRAMES_IM_FLUG Frames unterwegs: ist
    // sie gespannt, rechnet der Takt (Simulation, Eingabe, Streaming), schickt aber nichts an die GPU. Der EINE
    // Zähler lebt an diesem Chokepoint (Frei-Prüfung am Anfang des Takts — seine Phase, B3 —, Anmelden nach den Submits).
    // Headless (kein Device): immer frei, byte-alt.
    _gpuLeineQueue() {
        const r = this.state.renderer;
        return r && !r._isHeadlessNull && r.backend && r.backend.device ? r.backend.device.queue : null;
    }
    _gpuLeineFrei() {
        const L =
            this._gpuLeine ||
            (this._gpuLeine = { imFlug: 0, gerendert: 0, ausgesetzt: 0, sammelMs: 0, versuch: false });
        L.versuch = false;
        if (this._gpuLeineQueue() && L.imFlug >= AnazhRealm.GPU_FRAMES_IM_FLUG) {
            L.ausgesetzt++;
            return false;
        }
        if (!this._ladeBildFaellig(L)) return false;
        L.versuch = true;
        return true;
    }
    // DAS BILD DES LADESCHIRMS (K60-2): unter dem Ladeschirm (`_ladeTakt`) zeigt kein Frame die Welt, und keine Lücke des ersten
    // Weltbilds schließt erst im Bild (`_weltbildLuecken`: Boden, Horizont, Buch, Bauten, Pflanzung, Streu und Karten stehen im
    // Takt und in den Fäden, das Panorama rechnet seine eigene GPU-Arbeit). Ein Lade-Takt schickt sein Bild darum nur, wenn es
    // fällig ist: alle LADE_BILD_MS — die Erst-Zeichnung baut die Knoten der neuen Stoffe und stößt ihre Pipelines an, lange
    // bevor das Bild steht — und sobald am Anfang des Takts keine Lücke mehr fehlt: der Takt trägt dann das ganze Spiel vor
    // dem Bild, nach dem `_ankunftsBild` urteilt (eine Lücke, die erst im Takt schließt, zeichnet der nächste). Radeon kalt
    // zeichnete jeder Lade-Takt (3,3 s Render bis zum Bild, K602/p2.cpuprofile), die Erst-Zeichnung trug davon ~1,6 s.
    _ladeBildFaellig(L) {
        if (!this._ladeTakt()) return true;
        const jetzt = performance.now();
        if (jetzt - (L.ladeBild || -Infinity) >= AnazhRealm.LADE_BILD_MS || this._weltbildLuecken().length === 0) {
            L.ladeBild = jetzt;
            return true;
        }
        L.ladeAus = (L.ladeAus || 0) + 1;
        return false;
    }
    _gpuLeineAnlegen() {
        const L = this._gpuLeine;
        if (!L) return;
        L.gerendert++;
        const q = this._gpuLeineQueue();
        if (!q) return;
        L.imFlug++;
        const los = () => {
            L.imFlug = Math.max(0, L.imFlug - 1);
        };
        try {
            q.onSubmittedWorkDone().then(los, los);
        } catch (_e) {
            los();
        }
    }
    // Der Frame-Takt für Perf-Sinn, HUD und Flugschreiber: der Abstand zwischen GERENDERTEN Frames (null = der Takt
    // hat nicht gerendert) — die SUMME der Takt-Deltas seit dem letzten gerenderten Takt. Rendert jeder Takt, ist
    // das exakt das Takt-Delta; eine Loop-Pause (Portal, inaktiver Tab) zählt nicht als Frame-Zeit (die Wanduhr-
    // Lücke seit dem letzten Render warf `updateFps` das Fenster weg — Playtest W12). Ein Frame-Fehler nach der
    // Frei-Prüfung zählt als Versuch — der Regler atmet weiter.
    _gpuLeineFrameMs(deltaMs) {
        const L = this._gpuLeine;
        if (!L) return deltaMs;
        L.sammelMs += deltaMs;
        if (!L.versuch) return null;
        const ms = L.sammelMs;
        L.sammelMs = 0;
        return ms;
    }

    // Die EINE Fehler-Grenze des ewigen Loops: ein Frame-Throw landet hier statt den Loop zu brechen — gezählt
    // (`_loopErrorCount`, undefined-sicheres Laufzeit-Feld, audit:strict-whitelisted) und gemeldet über den EINEN Melder
    // (`_bruchMelden`: jede neue Meldung sofort ERROR mit Stack, dieselbe wieder mit ihrem Zähler), nie verschluckt.
    _loopErrorBoundary(err) {
        const st = this.state;
        st._loopErrorCount = (st._loopErrorCount || 0) + 1;
        const msg = (err && (err.stack || err.message)) || String(err);
        this._bruchMelden(`Loop-Frame-Fehler abgefangen (die Welt läuft weiter): ${msg}`);
    }

    // Substanz-Kosten eines DSL-Programms in WIRK-Einheiten (AST-Walk über die Op-Köpfe): spawn_blueprint
    // zahlt die computeBuildCost-Summe (dieselbe Wahrheit wie der Spieler), Struktur-/Kreatur-Spawns
    // ihre Substanz-Klasse, Welt-Schreiber einen Sockel; Lese-Ops kosten nichts.
    _dslProgramWirkCost(program) {
        let cost = 0;
        const walk = (node) => {
            if (!Array.isArray(node)) return;
            const op = node[0];
            if (typeof op === "string") {
                if (op === "spawn_blueprint" && typeof node[1] === "string") {
                    const c = this.computeBuildCost(node[1]);
                    let units = 0;
                    for (const m in c) units += c[m];
                    cost += Math.max(3, units * 0.5);
                } else if (op === "spawn_village" || op === "spawn_temple") cost += 20;
                else if (op === "spawn_waterfall") cost += 12;
                else if (op === "spawn_island") cost += 10;
                else if (op === "spawn_tree") cost += 6;
                else if (op === "spawn_creature") cost += 8;
                else if (op.startsWith("deposit_")) cost += 2;
                else if (op === "weather" || op === "skybox_color" || op === "set_time_of_day") cost += 3;
            }
            for (const child of node) walk(child);
        };
        walk(program);
        return Math.min(AnazhRealm.NEXUS_WIRK.costCap, cost);
    }

    _loopNexusUpdate() {
        // Der Nexus wirkt erst auf stehender Bühne: kein dslRun/Regel-Registrieren, solange der Boden
        // streamt; die Queue drained danach (nur Reihenfolge, nichts verloren). Headless steht sie sofort.
        if (!this._buehneSteht()) return;
        if (this.state.nexusEvolutionQueue.length > 0) {
            const evolution = this.state.nexusEvolutionQueue.shift();
            if (Array.isArray(evolution.program)) {
                // Wirk-Budget-Tor: eine Tat kostet ∝ Substanz; reicht die Wirk-Kraft nicht, ruht der Nexus (er
                // verdient sie über bewährte Outcomes zurück, s. Finalizer). schöpfer-Modus = frei.
                if (this.state.nexusWirk === undefined) this.state.nexusWirk = AnazhRealm.NEXUS_WIRK.start;
                const mode = typeof this.getGameMode === "function" ? this.getGameMode() : "frieden";
                if (mode !== "schöpfer") {
                    // Kosten atmen invers zur Balance: in einem kippenden Moment kostet jeder Eingriff bis 2× —
                    // dieselbe Richtung wie die gedrosselte Regeneration (EIN Regelkreis).
                    const balanceCostMul = 2 - this._emotionBalanceFactor();
                    const wirkCost =
                        (evolution.program[0] === "rule"
                            ? AnazhRealm.NEXUS_WIRK.ruleRegisterCost
                            : this._dslProgramWirkCost(evolution.program)) * balanceCostMul;
                    if (wirkCost > this.state.nexusWirk) {
                        this.log(
                            `Nexus ruht — Wirk-Kraft erschöpft (${this.state.nexusWirk.toFixed(0)}/${wirkCost} nötig)`,
                            "INFO"
                        );
                        return;
                    }
                    this.state.nexusWirk -= wirkCost;
                }
                const result = this.dslRun(evolution.program, { source: evolution.source || "nexus" });
                // Eine REGEL-Evolution registriert (rule-Op) eine stehende Regel in state.worldRules; ihre Fitness
                // läuft über deren Lebens-Fenster (_worldRuleFitness), NICHT über den 5-s-Gesten-Finalizer →
                // nicht in pendingOutcomes/Gesten-History.
                if (evolution.program[0] === "rule") {
                    this.log(`Nexus-Evolution (Regel) registriert: ${evolution.name}`, "INFO");
                    this.grokSpeak("nexus");
                    return;
                }
                // Schicht 1 — Initiale Fitness aus FPS allein. Endgültiger
                // Wert kommt vom Finalizer 5 s später (Emotion + Activity).
                const fpsDmg = Math.max(0, result.outcome.fpsBefore - result.outcome.fpsAfter);
                const initialFitness = result.ok ? Math.max(0, 1 - fpsDmg / 100) : 0;
                const abilityEntry = {
                    name: evolution.name,
                    program: evolution.program,
                    source: evolution.source || "nexus",
                    createdAt: evolution.createdAt || performance.now() / 1000,
                    fitness: initialFitness,
                };
                this.state.dsl.abilities.push(abilityEntry);
                const historyEntry = {
                    id: evolution.name,
                    program: evolution.program,
                    at: performance.now() / 1000,
                    outcome: result.outcome,
                    ok: result.ok,
                    fitness: initialFitness,
                    finalized: false,
                };
                this.state.dsl.history.push(historyEntry);
                if (this.state.dsl.history.length > this.state.dsl.historyCap) {
                    this.state.dsl.history = this.state.dsl.history.slice(-this.state.dsl.historyCap);
                }
                // Pending einreihen — Finalizer holt 5 s später Emotion/Activity-Delta.
                if (result.ok) {
                    this.state.dsl.pendingOutcomes.push({
                        name: evolution.name,
                        program: evolution.program,
                        outcome: result.outcome,
                        historyRef: historyEntry,
                    });
                }
                this.log(
                    `Nexus-Evolution (DSL) ausgeführt: ${evolution.name}, fitness=${initialFitness.toFixed(2)}`,
                    "INFO"
                );
            } else {
                this.log(`Nexus-Evolution ohne DSL-Programm verworfen: ${evolution.name}`, "WARNING");
            }
            this.grokSpeak("nexus");
        }
    }

    _loopGroundCheck(currentTime) {
        // V9.31 voxel-aware: in einer Voxel-Welt sind groundChunks
        // LEGITIM leer (V9.27 überspringt den Heightfield-Build).
        if (currentTime - this.state.lastGroundCheck >= this.state.groundCheckInterval) {
            this.state.lastGroundCheck = currentTime;
        }
    }

    _loopFrustumCulling() {
        // V8.26 Polish §6.1 — Frustum + Matrix4 als state-Pool statt
        // pro-Frame-Allocation. Vorher: 60 Allocs/s = unnötiger GC-Druck.
        // Jetzt: einmal allokiert, im Render-Loop nur Werte aktualisiert.
        if (!this._frustumCache) {
            this._frustumCache = new THREE.Frustum();
            this._frustumMatrixCache = new THREE.Matrix4();
        }
        this._frustumMatrixCache.multiplyMatrices(
            this.state.camera.projectionMatrix,
            this.state.camera.matrixWorldInverse
        );
        this._frustumCache.setFromProjectionMatrix(this._frustumMatrixCache);
        // Inseln und Mesh-Tiere cullt three JE PASS (Geometrie- bzw. Körper-Kugel gegen Blick und Kaskaden-Box) — ein
        // Frustum-Schreiber hier nahm ihnen den Schatten, sobald sie den Blick verließen (W7).
        // T3 — RENDERBUNDLES: das Region-Culling der gebündelten Gruppen lebt auf der
        // Bundle-Sichtbarkeit (three-Culling friert im Bundle-Replay ein — Sonde
        // diag-render-bundle). Nutzt das frisch gebaute _frustumCache von oben.
        this._archRegionBundleCull();
    }

    _loopAnimateUfos(currentTime) {
        if (this.state.ufos && this.state.playerMesh) {
            const playerPos = this.state.playerMesh.position;
            this.state.ufos.forEach((ufo) => {
                const distance = playerPos.distanceTo(ufo.position);
                if (distance < 50) {
                    ufo.position.y = ufo.userData.baseY + Math.sin(currentTime * ufo.userData.speed) * 2;
                }
            });
        }
    }

    // Steckt der Spieler nach einem fill-Edit im Fels: die nächste offene Luft-Lücke ÜBER ihm finden
    // (Füße + Kopf frei) und ihn hinaufsetzen. Höhlen-sicher per Konstruktion: in einer Höhle sind die
    // Füße in Luft → kein Eingriff (ein „unter getTerrainHeightAt?"-Check teleportierte Höhlen-Spieler
    // auf den Berg). Nur nach fill-Edits in Spieler-Nähe (wenige Dichte-Proben, kein Per-Frame-Pfad);
    // Teleport-Mechanik wie _rescuePlayerFromVoid (Fall unter PLAYER_VOID_Y → zurück an die Oberfläche).
    _rescuePlayerFromEditSolid(ex, ey, ez, radius) {
        const pm = this.state.playerMesh;
        if (!pm) return;
        const px = pm.position.x,
            py = pm.position.y,
            pz = pm.position.z;
        const dx = px - ex,
            dy = py - ey,
            dz = pz - ez;
        if (dx * dx + dy * dy + dz * dz > (radius + 3) * (radius + 3)) return;
        const solidAt = (y) => this._terrainDensityAt(px, y, pz) > 0;
        // Body-Box (halfExtent 0.5): Füße ODER Zentrum im Fels → eingeschlossen.
        if (!solidAt(py - 0.35) && !solidAt(py + 0.35)) return;
        for (let cy = py + 0.6; cy <= py + radius * 2 + 8; cy += 0.6) {
            if (solidAt(cy - 0.3) || solidAt(cy + 1.2)) continue;
            const safeY = cy + 0.25;
            pm.position.set(px, safeY, pz);
            // P3 — feld-nativ: Velocity nullen, vertikalen Feld-Zustand zurück (kein Ammo-Body).
            if (this.state.playerVel) this.state.playerVel.setValue(0, 0, 0);
            this.state._fieldVy = 0;
            this.log(`Aufschütten hob dich auf die neue Oberfläche (y=${safeY.toFixed(1)})`, "INFO");
            return;
        }
    }

    _rescuePlayerFromVoid() {
        const pm = this.state.playerMesh;
        if (!pm || pm.position.y > AnazhRealm.PLAYER_VOID_Y) return;
        const surf = this.getTerrainHeightAt(pm.position.x, pm.position.z);
        const safeY = (Number.isFinite(surf) ? surf : this.state.terrainBaseHeight || 0) + 2.0;
        pm.position.set(pm.position.x, safeY, pm.position.z);
        // P3 — feld-nativ: Velocity nullen, vertikalen Feld-Zustand zurück (kein Ammo-Body).
        if (this.state.playerVel) this.state.playerVel.setValue(0, 0, 0);
        this.state._fieldVy = 0;
        this.log(`Spieler fiel durch die Welt — zurück an die Oberfläche (y=${safeY.toFixed(1)})`, "WARNING");
    }

    // Kein Ammo: der Spieler läuft feld-nativ (`_stepCharacter`), Kreaturen erden aus
    // `_creatureGroundY`, Fahrzeuge aus `_werkBoden` (beide `_koerperBodenUnter`). Dieser Schritt fährt nur den
    // Feld-Controller (Wasser-Auftrieb/Killplane des Spielers leben in `_stepCharacter`).
    _loopPhysicsSync(delta, currentTime) {
        this._stepCharacter(delta, currentTime);
    }

    // ===== FIXED-TIMESTEP SIM/RENDER-SPLIT (Fiedler „Fix Your Timestep!") =====
    // Die SIM (Charakter-Physik + Bewegung) steppt deterministisch bei FIXED_DT → zwei Maschinen
    // steppen identisch (Lockstep-MP, framerate-unabhängig); der RENDER interpoliert einmal/Frame
    // (alpha). EIN Sim-Schritt = `_loopPhysicsSync` + `_loopPlayerMovement(simTime, FIXED_DT)`
    // (+ Replay-Capture) = reine Funktion (state, input, FIXED_DT); `replayRun` reicht kein dtOverride.

    // Der EINE Sim-Schritt (deterministisch, fixed-dt). Physik LIEST die Velocity, die Bewegung
    // SETZT sie (dieselbe Ordnung wie der variable Loop: physics → movement → 1-Frame-Input-Latenz).
    _stepFixedSim(simTime, dt) {
        this._loopPhysicsSync(dt, simTime);
        this._loopPlayerMovement(simTime, dt);
        // Welle L (Q1): der Ritt schreibt Sitz, Ebene, Gier und Federn IM Sim-Schritt (vor der Interpolation).
        this._rittSchritt(dt);
        // ein im Flug verlassener Gesetz-Wagen fällt auf der Vertikale des Kerns, bis er steht (Gegenprüfung 07.10.)
        if (this._fahrLos && this._fahrLos.size) this._fahrNachlauf(dt);
        // DER GESTOSSENE LEIB und LEIB AN LEIB im Sim-Schritt (0710-5): was einen Körper bewegt, läuft im festen Schritt.
        this._kreaturStossSchritt(dt);
        this._leibKontakte();
        if (this.state._replayRec) this._replayCaptureFrame(dt);
        // Lockstep-MP: der Input dieses Fixed-Steps geht gebatcht übers P2P-Mesh; Peers simulieren den
        // Charakter durch DENSELBEN Schritt-Pfad. simTime reist im 1-Hz-Anker mit — der Ghost läuft auf
        // MEINER Sim-Zeitachse (Timestamp-Vergleiche bit-identisch).
        this._lockstepCaptureFrame(simTime);
    }

    // Der AKKUMULATOR (Fiedler): sammelt die echte Frame-Zeit, steppt die Sim in FIXED_DT-Häppchen,
    // geklemmt gegen den Spiral-of-Death (der Takt kommt gedeckelt aus dem Loop, `TAKT_DECKEL_S`, + FIXED_MAX_STEPS hart). Die
    // Sim-Position wird VOR den Schritten wiederhergestellt (der Render setzte mesh evtl. auf die
    // interpolierte) + `_fixedPrevPos` für die Interpolation gemerkt. Gibt die Schritt-Zahl zurück.
    _loopFixedStep(realDt, currentTime) {
        const st = this.state;
        const mesh = st.playerMesh;
        if (!mesh || !st.playerVel) return 0;
        const FIXED_DT = AnazhRealm.FIXED_DT;
        // Authoritative Sim-Position wiederherstellen ODER einen externen Teleport übernehmen: ist mesh
        // genau `_fixedRenderPos` (vom Vorframe-Render), die Sim-Position wiederherstellen; hat externer
        // Code mesh gesetzt (Rescue · Portal · Spawn · Teleport · Test), diese übernehmen — sonst
        // überschriebe der Loop jeden Teleport. Exakt (Vector3.equals), kein Lerp über den Sprung.
        if (st._fixedSimPos) {
            if (st._fixedRenderPos && mesh.position.equals(st._fixedRenderPos)) {
                mesh.position.copy(st._fixedSimPos);
            } else {
                st._fixedSimPos.copy(mesh.position);
                st._fixedPrevPos = null; // Teleport → kein Interpolations-Schweif über den Sprung
            }
        }
        // prev = die Sim-Position VOR diesem Frame (für die Render-Interpolation)
        if (!st._fixedPrevPos) st._fixedPrevPos = mesh.position.clone();
        else st._fixedPrevPos.copy(mesh.position);
        // den Akkumulator füllen — der Takt ist an der Wurzel gedeckelt (`TAKT_DECKEL_S` in startEternalLoop, kein Spiral-of-Death)
        st._fixedAccumulator = (st._fixedAccumulator || 0) + realDt;
        let simTime = Number.isFinite(st._fixedSimTime) ? st._fixedSimTime : currentTime;
        let steps = 0;
        while (st._fixedAccumulator >= FIXED_DT && steps < AnazhRealm.FIXED_MAX_STEPS) {
            this._stepFixedSim(simTime, FIXED_DT);
            st._fixedAccumulator -= FIXED_DT;
            simTime += FIXED_DT;
            steps++;
        }
        // bei hartem Cap den Rest-Akkumulator verwerfen (Zeit fallen lassen statt einholen → kein Spiral)
        if (steps >= AnazhRealm.FIXED_MAX_STEPS && st._fixedAccumulator >= FIXED_DT) st._fixedAccumulator = 0;
        st._fixedSimTime = simTime;
        st._fixedAlpha = FIXED_DT > 0 ? st._fixedAccumulator / FIXED_DT : 0;
        return steps;
    }

    // Die RENDER-Interpolation: zwischen prev (Sim-Position des Vorframes) und cur (jetzt) nach
    // alpha lerpen → die Optik gleitet glatt bei jeder FPS. `_fixedSimPos` wird HIER (nach Rescue/
    // Harvest, die mesh noch bewegt haben könnten) als authoritativ erfasst → der nächste Sim-Schritt
    // stellt sie wieder her. Nur der Spieler-Mesh interpoliert (die statische Welt braucht es nicht).
    _applyFixedInterpolation() {
        const st = this.state;
        const mesh = st.playerMesh;
        if (!mesh) return;
        if (!st._fixedSimPos) st._fixedSimPos = mesh.position.clone();
        else st._fixedSimPos.copy(mesh.position); // die authoritative Sim-Position (post-Rescue) festhalten
        if (st._fixedPrevPos) {
            const a = Math.max(0, Math.min(1, st._fixedAlpha || 0));
            mesh.position.lerpVectors(st._fixedPrevPos, st._fixedSimPos, a);
        }
        // V18.356 — merken, WAS wir mesh setzten → der nächste _loopFixedStep unterscheidet
        // „unangetastet" (Sim wiederherstellen) von „extern teleportiert" (übernehmen).
        if (!st._fixedRenderPos) st._fixedRenderPos = mesh.position.clone();
        else st._fixedRenderPos.copy(mesh.position);
    }

    // ===== DETERMINISTISCHER INPUT-REPLAY =====
    // Die Spieler-Simulation ist eine REINE Funktion (Position × Dichtefeld × Input × dt) — kein
    // Float-Drift, kein Math.random, keine ungemessene Zeit: derselbe Start + dieselbe Input-Folge ⇒
    // bit-identisches Ergebnis. Die bit-Gleichheit zweier Läufe IST der Beweis; Lockstep-MP baut darauf.

    // Hält den Input dieses Frames fest (im Loop nach `_loopPlayerMovement`). Genau die
    // Größen, die Bewegung + Feld-Schritt deterministisch treiben: die WASD/Shift/Space-Tasten,
    // der Blick-Yaw und das Zeit-Delta.
    _replayCaptureFrame(delta) {
        const rec = this.state._replayRec;
        if (!rec) return;
        if (rec.frames.length >= AnazhRealm.REPLAY_MAX_FRAMES) {
            this.state._replayRec = null; // Sicherheits-Cap gegen unbegrenztes Wachstum
            return;
        }
        const k = this.state.keys || {};
        rec.frames.push({
            dt: delta,
            yaw: this.state.yaw,
            w: !!k["w"],
            a: !!k["a"],
            s: !!k["s"],
            d: !!k["d"],
            shift: !!k["shift"],
            space: !!k[" "],
        });
    }

    // Beginnt eine Aufnahme: friert den Start-Zustand ein (Position + die feld-eigene
    // Velocity + `_fieldVy` + Yaw) und öffnet den Frame-Puffer.
    startReplayRecording() {
        const s = this.state,
            pm = s.playerMesh;
        if (!pm || !s.playerVel) return false;
        s._replayRec = {
            start: this._replaySnapshotState(),
            frames: [],
        };
        return true;
    }

    stopReplayRecording() {
        const rec = this.state._replayRec;
        this.state._replayRec = null;
        return rec;
    }

    // Der vollständige deterministische Zustand des Spieler-Schritts.
    _replaySnapshotState() {
        const s = this.state,
            pm = s.playerMesh;
        return {
            x: pm.position.x,
            y: pm.position.y,
            z: pm.position.z,
            vx: s.playerVel.x(),
            vy: s.playerVel.y(),
            vz: s.playerVel.z(),
            fieldVy: s._fieldVy || 0,
            yaw: s.yaw,
        };
    }

    // Spielt eine Aufnahme DETERMINISTISCH ab: setzt den Start zurück und füttert jede
    // Input-Frame durch DENSELBEN Pfad wie der Loop (`_stepCharacter` dann
    // `_loopPlayerMovement`, in der Loop-Reihenfolge). Gibt den End-Zustand zurück.
    // Reiner Replay (keine Welt-Mutation außer dem Spieler) → mehrfach aufrufbar.
    replayRun(rec) {
        if (!rec || !Array.isArray(rec.frames)) return null;
        const s = this.state,
            pm = s.playerMesh;
        if (!pm || !s.playerVel) return null;
        // Start restaurieren.
        pm.position.set(rec.start.x, rec.start.y, rec.start.z);
        s.playerVel.setValue(rec.start.vx, rec.start.vy, rec.start.vz);
        s._fieldVy = rec.start.fieldVy;
        s.yaw = rec.start.yaw;
        // Die Bewegungs-/Erdungs-Hilfszustände auf einen sauberen Start setzen, damit
        // zwei Replays vom selben Start wirklich bit-gleich laufen (kein Carry-over).
        const savedKeys = s.keys;
        const savedLastMove = s._lastMoveT;
        const savedWasGrounded = s._fieldWasGrounded;
        s._fieldWasGrounded = false;
        let t = 0;
        s._lastMoveT = 0;
        for (let i = 0; i < rec.frames.length; i++) {
            const f = rec.frames[i];
            s.keys = { w: f.w, a: f.a, s: f.s, d: f.d, shift: f.shift, " ": f.space };
            s.yaw = f.yaw;
            t += f.dt;
            // Loop-Reihenfolge: erst der Feld-Schritt (integriert die Velocity des
            // Vorframes + Kollision), dann die Bewegung (setzt die neue Intent-Velocity).
            this._stepCharacter(f.dt, t);
            this._loopPlayerMovement(t);
            this._rittSchritt(f.dt);
        }
        const end = this._replaySnapshotState();
        s.keys = savedKeys;
        s._lastMoveT = savedLastMove;
        s._fieldWasGrounded = savedWasGrounded;
        return end;
    }

    _loopSelfAnalysis(currentTime) {
        // ### Selbstanalyse + Nexus-Evolution-Trigger ###
        // `selfAwarenessAnalyze` macht den FPS-/Tunneling-/Boden-Check, `evolveNexus` queued ein
        // DSL-Programm in den `nexusEvolutionQueue` (Zeit-Schwelle 5 s).
        if (currentTime - this.state.lastSelfAnalysis >= 5.0) {
            this.selfAwarenessAnalyze();
            // Wirk-Tropf: langsame Grund-Regeneration gegen permanente Verarmung (die echte Regeneration ist
            // die Wertung); atmet mit der Balance (ruhig → voll, gekippt → 40 %).
            if (this.state.nexusWirk === undefined) this.state.nexusWirk = AnazhRealm.NEXUS_WIRK.start;
            this.state.nexusWirk = Math.min(
                AnazhRealm.NEXUS_WIRK.max,
                this.state.nexusWirk + AnazhRealm.NEXUS_WIRK.idleRegenPer5s * (0.4 + 0.6 * this._emotionBalanceFactor())
            );
            // V18.112 — E4-KRISTALL+E5: am selben Takt prüft der Nexus, ob eine
            // wiederholt bewährte Geste zum GESETZ kristallisiert (cooldown-
            // gegated; läuft durch die Queue → zahlt am Wirk-Tor wie alles).
            if (typeof this._crystallizeGestureRule === "function") this._crystallizeGestureRule(currentTime);
            // E3 (gigant-plan §5 — Mana-Symmetrie): MANA regeneriert am SELBEN
            // 5-s-Takt — schneller, wo der Spieler magie-leitend IST (statTags)
            // ODER auf magie-leitendem Feld steht (auraAt — das Feld speist).
            {
                const p = this.state.player;
                if (p) {
                    const tags = p.statTags || {};
                    const lead = Math.max(0, Math.min(1, tags.magieleitung || 0));
                    let fieldLead = 0;
                    const pm = this.state.playerMesh && this.state.playerMesh.position;
                    if (pm && typeof this.auraAt === "function") {
                        const a = this.auraAt(pm.x, pm.z);
                        fieldLead = Math.max(0, Math.min(1, (a && a.magieleitung) || 0));
                    }
                    p.manaMax = Math.round(40 + 80 * lead);
                    if (typeof p.mana !== "number") p.mana = p.manaMax;
                    p.mana = Math.min(p.manaMax, p.mana + 2 + 6 * (0.4 * lead + 0.6 * fieldLead));
                }
            }
            // Kein Physik-Selbstheil hier: der EINE fps-Regler ist der Perf-Regelkreis — Physik-Resets heilen
            // keinen render-gebundenen fps-Drop.
            this.journalTick(currentTime);
            // Welle 3 F — Welt-Info nur alle 5 s aktualisieren (gleicher
            // Takt wie selfAwareness; DOM-Cost ist gering aber nicht null).
            this.updateWorldInfo();
        }
        // Der Nexus atmet mit der Last: Basis-Intervall 24 s; ist der Frame über Budget (`_frameOverBudget`,
        // derselbe Zeit-Zustand wie Laub-/Ring-Regler), streckt es sich ×2 (gedeckelt) — still, nie tot.
        // Auch die Registrierung wartet auf die Bühne; nexusLastEvolution ist der Boot-Stempel → kein Burst.
        if (this.nexus && this._buehneSteht()) {
            const evoInterval = this.state.nexusEvolutionInterval * (this.state._frameOverBudget ? 2.0 : 1.0);
            if (currentTime - this.state.nexusLastEvolution >= evoInterval) {
                this.evolveNexus(currentTime);
            }
        }
    }

    _loopWeatherAndGrowth(delta) {
        // ### Kreaturen und Wetter ### — das Wachsen der Tiere (updateGrowth, ×1,01 je 5-%-Würfel, V7.66) ist gefallen:
        // die Größe ist die Achse bodySize aus der Identität (Leben-Prüfung R-D2: ×1,05 in Minuten, der Reload setzte
        // zurück).
        const _ct = performance.now();
        this.updateCreatures(delta);
        this._perfSenseLap("creatures", _ct);
        this.state.weatherEffectTime += delta;
        // Kontinuierlicher Böen-Drift (Math.random-frei): deterministische layered-sine-Modulation auf
        // weatherEffectTime (~±18 % um die Wort-Basis). `_weatherWob` ist ein Instanz-Feld (nicht
        // serialisiert); Wetter berührt den Fixed-Step nicht → Sim/Replay unberührt.
        {
            const wt = this.state.weatherEffectTime;
            const gust = Math.sin(wt * 0.19) * 0.6 + Math.sin(wt * 0.47 + 1.3) * 0.3 + Math.sin(wt * 1.13 + 3.7) * 0.1;
            this._weatherWob = 1 + 0.18 * gust; // ~[0.82, 1.18]
        }
        // Auto-Zug: zieht das Wort, das die Welt sich wünscht (`wetterWunsch` — Nexus, seine Gesetze, die Emotion, die
        // Wesen schreiben nie selbst), sonst eines aus dem Vokabular (nie zweimal dasselbe Wort), und geht sanft über die
        // Transition. Takt `WETTER_ZUG_SEK` (120 s): mit der 45-s-Transition STEHT das Wetter ~75 s. Steht das Wort des
        // Spielers (`wetterWort`), ruht der Zug. Wartet auf die Bühne (nur der Wechsel-Tick; weatherEffectTime
        // akkumuliert weiter → danach EIN weicher Zug). Headless sofort.
        if (
            !this.state.wetterWort &&
            this.state.weatherEffectTime >= AnazhRealm.WETTER_ZUG_SEK &&
            this._buehneSteht()
        ) {
            const wunsch = this.state.wetterWunsch;
            this.state.wetterWunsch = null;
            let next;
            if (wunsch && wunsch.wort in AnazhRealm.WEATHER_INTENSITY) next = wunsch.wort;
            else {
                const words = Object.keys(AnazhRealm.WEATHER_INTENSITY).filter((w) => w !== this.state.weather);
                // Deterministische Wort-Wahl (Math.random-frei): Index aus layered sines der Wall-Clock. Das Wort
                // lesen Symphonie/Journal/wet-Frage; der Wechsel ist reine Optik/Klang → Fixed-Step/Replay unberührt.
                const wc = performance.now() / 1000 + this.state.weatherEffectTime;
                const pick = Math.sin(wc * 0.131) + Math.sin(wc * 0.373 + 1.7) + Math.sin(wc * 0.911 + 4.2); // [-3,3]
                let idx = Math.floor(((pick + 3) / 6) * words.length);
                if (idx < 0) idx = 0;
                if (idx >= words.length) idx = words.length - 1;
                next = words[idx];
            }
            if (next !== this.state.weather) {
                this._setWeather(next, "auto-zug");
                this.log(`Das Wetter zieht zu ${next}${wunsch ? ` (Wunsch: ${wunsch.quelle})` : ""}`, "INFO");
            } else this.log(`Das Wetter bleibt ${next} (Wunsch: ${wunsch.quelle})`, "INFO");
            this.state.weatherEffectTime = 0;
        }
    }

    // FRAME-BUDGET-POOL: EINE Quelle für „wie viel ms hat dieser Frame für aufschiebbare Arbeit".
    // Produktion misst die Wall-Clock (`_synthSpent=null`); ein Diag setzt `_synthSpent=0` →
    // synthetisches Kosten-Modell (job.run ruft addSynthetic), hardware-unabhängig prüfbar.
    _makeFrameBudget(totalMs) {
        return {
            totalMs: Number.isFinite(totalMs) ? totalMs : 8,
            _startT: 0,
            _synthSpent: null, // null = echte Wall-Clock; Zahl = synthetisch (Diag)
            startFrame() {
                this._startT = performance.now();
                if (this._synthSpent !== null) this._synthSpent = 0;
            },
            spentMs() {
                return this._synthSpent !== null ? this._synthSpent : performance.now() - this._startT;
            },
            remainingMs() {
                return this.totalMs - this.spentMs();
            },
            addSynthetic(ms) {
                if (this._synthSpent !== null) this._synthSpent += ms;
            },
        };
    }

    // Reiner Prioritäts-Dispatcher (Job-System, single-thread). jobs: [{name, prio, run(ms)}].
    // prio 0 = HEILIG (Streaming): läuft immer ungedrosselt (Infinity); prio > 0 nur solange Budget
    // bleibt, sonst nächster Frame. Setzt KEIN State (der Aufrufer liest budget.remainingMs() für
    // `_frameOverBudget`); gibt die gelaufenen Job-Namen zurück.
    _dispatchFrameJobs(jobs, budget) {
        const ran = [];
        const sorted = jobs.slice().sort((a, b) => (a.prio || 0) - (b.prio || 0));
        // EXISTENZ-BODEN: auf render-gebundener Maschine ist remainingMs dauerhaft ≤ 0 — ohne Boden wüchsen
        // pendingWaterIso/Scatter/Grass monoton (Heap-Leck, Wasser ohne Oberfläche). Welt-SUBSTANZ (prio 1)
        // bekommt JEDEN Frame einen Zeit-Boden, Deko (prio ≥ 2) jeden 4. Frame einen kleinen — die Queues
        // MÜSSEN abfließen, der Regler atmet nur darüber.
        this._schedFrameNo = (this._schedFrameNo || 0) + 1;
        for (const job of sorted) {
            if (!job || typeof job.run !== "function") continue;
            const prio = job.prio || 0;
            const sacred = prio === 0;
            let ms = budget.remainingMs();
            if (!sacred && ms <= 0) {
                if (prio === 1) ms = AnazhRealm.FRAME_SCHED_SUBSTANZ_FLOOR_MS;
                else if (this._schedFrameNo % 4 === 0) ms = AnazhRealm.FRAME_SCHED_DEKO_FLOOR_MS;
                else continue;
            }
            try {
                job.run(sacred ? Infinity : ms);
                ran.push(job.name);
            } catch (e) {
                this._loopErrorBoundary(e);
            }
        }
        return ran;
    }

    // Deferrable-Budget (ms): Frame-Ziel (throttleMs) minus gemessene Pflicht-Kosten (Physik/Render/
    // Culling/Kreaturen aus dem perfSense). Headless → Infinity; Floor `FRAME_SCHED_MIN_MS`.
    _deferrableBudgetMs() {
        const st = this.state;
        if (st.renderer && st.renderer._isHeadlessNull) return Infinity;
        if (this._ladeTakt()) return AnazhRealm.LADE_TAKT_MS;
        const throttleMs = Number.isFinite(st.perfTargetMs) ? st.perfTargetMs : AnazhRealm.PERF_TARGET_MS;
        const sense = st.perfSense;
        if (!sense || !sense.phase) return Math.max(AnazhRealm.FRAME_SCHED_MIN_MS, throttleMs - 8);
        const p = sense.phase;
        const mandatory = (p.physics || 0) + (p.render || 0) + (p.archCulling || 0) + (p.creatures || 0);
        return Math.max(AnazhRealm.FRAME_SCHED_MIN_MS, throttleMs - mandatory);
    }

    // DIE TERRAIN-ZUERST-REGEL (EINE Stelle, Leser: der Deko-Job und `_foundryRewarmColdTrees`): baute dieser Takt
    // Terrain, wartet die Deko — nie länger als bis zum Existenz-Boden des Dispatchers (jeder 4. Takt, wie das leere
    // Budget), dann trägt sie ihren Boden-Anteil. Bis K40 wartete sie, solange der Strom Chunks lieferte: auf dem Radeon
    // baute jeder von 160 Takten nach einem Umzug Terrain, die Nah-Wiese lief 0-mal und 925 Büschel blieben am alten Ort.
    _dekoWartet() {
        if (this._ladeTakt()) return false;
        return !!this.state._frameChunksBuilt && (this._schedFrameNo || 0) % 4 !== 0;
    }

    // DER LADE-TAKT (K60): steht der Ladeschirm (`_ladeschirmSteht`, die DOM-Wahrheit) vor dem ersten Weltbild, zeigt kein
    // Frame die Welt — und keine Taste gehört ihr. Die Drosseln des Spiels (das Frame-Budget des Takt-Planers, die
    // Terrain-zuerst-Regel, `_frameOverBudget` mit seinen Lesern: Platzieren 1 je Takt, Karten 4/s, ein Dorf-Slot je
    // Drossel-Takt, Gras 1 Chunk je Frame) schützen den Takt, den der Spieler sieht. Unter dem Ladeschirm hielten sie die
    // Welt fest: Radeon kalt rissen ALLE Frames das Budget, der Takt-Planer gab der Welt 2 ms je Frame, und jeder Leser
    // des ersten Weltbilds lief mit der Frame-Rate des Boots (4–8 Frames je Sekunde) statt mit der Arbeit. Jetzt trägt
    // jeder Lade-Frame LADE_TAKT_MS Arbeit, und keine Drossel des Spiels greift.
    _ladeTakt() {
        const r = this.state.renderer;
        return !this.state._weltbildDa && !(r && r._isHeadlessNull) && this._ladeschirmSteht();
    }

    // DIE FRIST DES LADE-FRAMES (K60-2): EINE je Aufgabe des Event-Loops — der Frame des Loops ist eine, jede Scheibe im
    // eigenen Takt (die Ort-Wahl `_ortPlanWarten` per setTimeout) eine andere; gestellt beim ersten Leser, gelöscht am Ende
    // der Aufgabe (Mikro-Task). LADE_TAKT_MS für alle Leser mit Kappe zusammen (bis G2-n1 gab jeder Ruf „jetzt + 100 ms",
    // fünf Leser streckten den Lade-Frame auf 500 ms). Am Frame-Stempel des Loops las die Ort-Wahl außerhalb des Frames
    // die verbrauchte Frist des letzten und rechnete 3 ms je Scheibe (Radeon kalt Dorf nach Export 0,1–0,5 → 1,6–8,4 s).
    // Außerhalb des Lade-Takts −∞.
    _ladeFrist() {
        if (!this._ladeTakt()) return -Infinity;
        if (this._ladeFristBis == null) {
            this._ladeFristBis = performance.now() + AnazhRealm.LADE_TAKT_MS;
            Promise.resolve().then(() => (this._ladeFristBis = null));
        }
        return this._ladeFristBis;
    }

    // DIE KAPPE JE TAKT (K60-2, die EINE Stelle der Klasse): ein Leser des ersten Weltbilds mit eigener Kappe je Takt (`n`
    // Stück oder ms von `kappe`) darf weiter, solange er unter ihr ist — im Lade-Takt darüber bis zur Frist des Lade-Frames.
    // Die Kappen schützen den Takt, den der Spieler sieht; unter dem Ladeschirm lief der Lade-Frame 3–13-mal je Sekunde, und
    // jede Kappe wurde zur Uhr des Bilds (Radeon kalt: die Ort-Wahl rechnete 305 ms in 3-ms-Scheiben über 10,3 s, der Dorf-
    // Zug hob 15 Häuser zu je 2 über 6 s). Leser: Pflanz-Schlange, Ort-Wahl, Dorf-Zug, Cull-Bau (Platz-Uhr, Versuche,
    // Budget), Nachwuchs des Laubs — gate:takt T9 fährt jeden.
    _kappeOffen(n, kappe) {
        return n < kappe || performance.now() < this._ladeFrist();
    }

    // Deferrable-Job-Registry (die Prioritäts-Ordnung als Daten). Terrain vor Deko: der Stream-Job (prio 0) setzt
    // `_frameChunksBuilt`, der Scatter-Deko-Job (prio 2) fragt `_dekoWartet`.
    _buildDeferrableJobs(playerPos) {
        const st = this.state;
        return [
            {
                name: "stream",
                prio: 0, // HEILIG — Terrain/Bewegung wird NIE vom Render-/Deko-Druck verhungert
                run: () => {
                    st._frameChunksBuilt = !!this._tickVoxelChunkStreaming(playerPos);
                },
            },
            {
                name: "waterIso",
                prio: 1, // Welt-Substanz (kein throttle-bares Deko), aber nach dem Terrain
                run: (ms) => {
                    const base =
                        st.atmosphere && Number.isFinite(st.atmosphere.waterIsoBudgetMs)
                            ? st.atmosphere.waterIsoBudgetMs
                            : 7;
                    // Wasser hält mit dem Terrain Schritt bis an die Ring-Kante: JEDER Rückstau zieht kräftig nach —
                    // sonst bleibt eine mitwandernde Wasser-Front hinter dem Terrain zurück (`waterK < builtK`).
                    // Der Worker trägt die CA-freie ferne See off-thread; die Zeit-Deadline schützt vor dem Freeze,
                    // Restlücken deckt der Fern-Ring (Loch-Deckel, Wasser flach auf dem Spiegel).
                    const backlog = st.pendingWaterIso && st.pendingWaterIso.size > 0;
                    const cap = backlog ? Math.max(base, 22) : base;
                    const dl = Math.min(Number.isFinite(ms) ? ms : Infinity, cap);
                    const _wt = performance.now();
                    this._tickPendingWaterIso(backlog ? 32 : 4, dl);
                    this._perfSenseLap("waterIso", _wt);
                },
            },
            {
                name: "waldPlan",
                prio: 1, // Welt-Substanz: die Gestalt jedes Baums in frischem Wald wartet auf ihre Zellen (K69)
                run: (ms) => {
                    const _wp = performance.now();
                    this._tickWaldPlan(ms);
                    this._perfSenseLap("waldPlan", _wp);
                },
            },
            {
                name: "scatterDeco",
                prio: 2, // reine Optik — wartet, wenn das Terrain diesen Frame baute oder das Budget leer ist
                run: (ms) => {
                    if (this._dekoWartet()) return; // erst der Boden, dann der Wald — nie verhungert
                    // Scatter mit `_perfSenseLap`-Tap (phase.scatter in perfSense + Flugschreiber — neue welt-formende
                    // Last wird attribuiert). Das ms-Budget fließt durch: der Region-Bau läuft in ≤SCATTER_SLICE_MS-
                    // Scheiben statt atomar (~54 ms), damit die Deko den Ring-Kopfraum-Timer nicht resetet.
                    // Headless: budget=Infinity → One-Shot; im Takt mit Terrain-Bau trägt die Deko nur ihren Boden.
                    // Der Lade-Takt (`_ladeTakt`) gibt der Deko das ganze Budget des Lade-Frames, das Gras baut darin.
                    const lade = this._ladeTakt();
                    const msDeko =
                        st._frameChunksBuilt && !lade ? Math.min(ms, AnazhRealm.FRAME_SCHED_DEKO_FLOOR_MS) : ms;
                    const _dl = Number.isFinite(msDeko)
                        ? performance.now() + (lade ? msDeko : Math.min(msDeko, AnazhRealm.SCATTER_SLICE_MS))
                        : undefined;
                    const _sct = performance.now();
                    this._tickScatterStreaming(playerPos, _dl);
                    this._tickPendingGrass(lade ? Infinity : 1, lade ? _dl : undefined);
                    this._tickScatterRegrow(performance.now());
                    this._tickNahWiese(_dl);
                    this._tickNahStreu(_dl);
                    this._perfSenseLap("scatter", _sct);
                    const nowTiles = performance.now();
                    const lastTileCheck = this._lastHydroTileCheck ?? -Infinity;
                    if (nowTiles - lastTileCheck > 1000 && playerPos) {
                        this._lastHydroTileCheck = nowTiles;
                        const ringR = (st.chunkRingRadius || 4) + 0.5;
                        const reach = ringR * this._voxelChunkConfig(0).span + 300;
                        this._ensureHydroTilesAround(playerPos.x, playerPos.z, reach);
                    }
                },
            },
        ];
    }

    // Der EINE Stempel der Wache: wächst, sobald eine ortsfreie Eingabe der Fege-Takte sich ändert.
    _standStempel() {
        const st = this.state;
        const W = this._standWache || (this._standWache = { stempel: 0, v: [], takte: new Map() });
        const v = W.v;
        let i = 0,
            neu = false;
        const setze = (x) => {
            if (!Object.is(v[i], x)) {
                v[i] = x;
                neu = true;
            }
            i++;
        };
        setze(this._weltRegung | 0);
        setze(this._waldPlanRegung | 0); // die Schlange des Walds (K69): ihre Zellen tragen die Gestalt jedes wartenden Baums
        setze(st._foliageDensityScale); // der EINE Regler: Wahrnehmungs-Faktor der Stufen-Wahl und Verdeckungs-Schwelle
        setze(this._ankunftsFerne()); // die Ankunft aus der Ferne (B2): das erste Bild und jedes Bild ihres Gleitens
        setze(st.lodRef);
        setze(st.chunkRingRadius);
        setze(st._activeRingRadius); // der Boot-Ring wächst bis zum Ziel (`_voxelChunkConfig`)
        setze(st.architectureCullingRadius);
        const f = this._foundry;
        setze(f ? f.ankunft | 0 : -1);
        // was die Takte ortsfrei vom Studio lesen, liest der Stempel selbst (kein Schreiber kann den Weckruf vergessen): die
        // Antwort des Studios, das Buch (Rezepte, Vorlagen), die Wahrnehmung (Stufen-Klammer, Budget, Sichtweite) und die
        // LOD-Distanzen, die `_foundryIngestRenderConfig` (oder wer auch immer) in die EINE LOD-Quelle schreibt
        setze(!!(f && f.ready));
        setze(f ? f.recipes : null);
        setze(AnazhRealm._studioRenderConfig);
        const D = AnazhRealm.LOD_DISTANCES;
        setze(D.thresh01);
        setze(D.thresh12);
        setze(D.hysteresis);
        setze(D.fade);
        setze(D.fade0);
        setze(st.waterLevel);
        setze(st.foundryCrossfade === true);
        setze(!!(st.atmosphere && st.atmosphere.treeLOD === false));
        setze(st.useOcclusionDemotion !== false);
        setze(st.voxelTerrainActive === true);
        if (neu) W.stempel++;
        return W.stempel;
    }

    // Der Stempel der BODEN-Takte: der Ring liest Chunk-Menge, Ring-Regler und Spieler-Zelle, der Saum Chunk-Menge,
    // Wasserspiegel und Anker — die Wirkung der anderen Fege-Takte (eine Stufe, ein Bau, eine Kachel) weckt sie nicht. Beim
    // Gehen gehen sie nur, wo die Zelle oder der Anker wechselt oder ein Chunk kommt und geht.
    _standStempelBoden() {
        const st = this.state;
        const W = this._standWache || (this._standWache = { stempel: 0, v: [], takte: new Map() });
        const b = W.boden || (W.boden = { stempel: 0, v: [] });
        const jetzt = [
            this._bodenRegung | 0,
            st.chunkRingRadius,
            st._activeRingRadius,
            st.waterLevel,
            st.voxelTerrainActive === true,
        ];
        if (jetzt.some((x, i) => !Object.is(b.v[i], x))) {
            b.v = jetzt;
            b.stempel++;
        }
        return b.stempel;
    }

    // Ein Bau-Eintrag änderte Stufe oder Gestalt (ein Bau-Takt wirkte, ein Studio-Asset dockte an): die Bau-Takte gehen.
    _bauRegt() {
        this._bauRegung = (this._bauRegung | 0) + 1;
    }

    // Dispatcher-Lauf (Verteil-Schicht, KEIN zweiter Regler): die fixen günstigen Ticks (vegSpawns/
    // archLOD/canopy/waterCA/dirtyChunks) laufen immer, die budgetierten durch `_dispatchFrameJobs`.
    // `_frameOverBudget` ist die FOLGE des Schedulers (Budget leer).
    _runFrameScheduler(playerPos) {
        const st = this.state;
        this._ensureFarWaterSheet(); // V18.381 — steady-state No-op (Anker-Hysterese), Rebuild budget-gegated
        const B = st._frameBudget || (st._frameBudget = this._makeFrameBudget());
        B.totalMs = this._deferrableBudgetMs();
        B.startFrame();
        st._frameChunksBuilt = false;
        st._bodenEinbau = null; // der Einbau des Frames (`_finalizeVoxelChunkBuild` → `_tickDirtyVoxelChunks`, K69-2)
        this._dispatchFrameJobs(this._buildDeferrableJobs(playerPos), B);
        // die fixen, NICHT budget-gegateten Ticks (UNGATED Welt-Substanz + billige Ticks)
        this._tickPendingVegSpawns(4);
        const auge = this._lodAuge(); // das EINE Auge der Stufen (Maske und Wahl messen vom selben Ort)
        this._tickArchitectureLOD(5, auge);
        // DER KARTEN-BÄCKER (einer in Flug, Kanal "bake-impostor" zum Studio-Bäcker, die Platte liefert gebackene
        // Karten sofort; lazy beim ersten L2-Bedarf enqueued; headless No-op) läuft hier, ungegatet wie sein eigenes
        // Gesetz („EAGER, netto last-senkend"). Bis 04.10. hing er im Deko-Job (prio 2: nur ohne Chunk-Bau im Frame,
        // unter Last jeden 4. Frame) — beim Boot an der Mess-Wiese standen 60 s lang 10 von 11 Karten ungebacken in der
        // Schlange, und jeder Baum, der seine Karte brauchte, blieb als Kapsel-Klumpen stehen (141 Sätze < 64 m).
        this._tickImpostorBake();
        this._tickTrefferGliederVorbacken(); // die Treffer-Glieder einer kalten Gattung, im Takt der EINEN Bake-Uhr
        this._tickScatterLod(auge, 4, 160); // V18.464 — der Fernwald folgt der LIVE-Distanz (baum-D1), vom Auge (K36)
        this._tickFernRing(playerPos); // STUFE 2 (das-feld-zeichnet §2) — der Horizont-Tick (headless-default No-op)
        this._tickWegeKarte(playerPos); // Wege-, Kronen- und Fluss-Karte folgen dem Spieler
        this._wegeRaeumen(); // die neuen Flächen eines Dorfs räumen die Natur, die schon auf ihnen stand (K52)
        this._tickSeason(performance.now()); // JAHRESZEIT: die langsame Jahres-Uhr (Foundry-Phaenologie)
        this._tickRain(performance.now()); // WETTER: sichtbarer Regen bei rainy/stormy
        this._tickCanopyStreaming();
        this._tickWorldWaterCA();
        this._tickDirtyVoxelChunks(playerPos);
        // `_frameOverBudget` als FOLGE des leeren Budgets (zusätzliches Signal; der Regler setzt
        // es am Frame-Ende weiter aus frameMs — die volle Vereinheitlichung kommt mit dem Default-an).
        if (B.remainingMs() <= 0 && !this._ladeTakt()) st._frameOverBudget = true;
    }

    _loopVoxelStreaming() {
        // Der Frame-Budget-Scheduler dirigiert die deferrable Streaming-Arbeit: Streaming heilig [prio 0],
        // Wasser [prio 1], Deko [prio 2]; Terrain zuerst über `_dekoWartet` (nie verhungert). EIN Pfad.
        return this._runFrameScheduler(this.state.playerMesh.position);
    }

    _loopSkyboxZeit(currentTime) {
        // time-Uniform lebt in state.skyboxUniforms; Existenz-Probe, weil createGalaxySkybox bei
        // Vendor-Bruch früh returnen kann.
        if (this.state.skyboxUniforms && this.state.skyboxUniforms.time) {
            this.state.skyboxUniforms.time.value = currentTime;
        }
    }

    _loopAutoSave(currentTime) {
        // ### Speichern ###
        if (currentTime - this.state.lastSaveUpdate >= this.state.saveInterval) {
            this.saveState();
            this.state.lastSaveUpdate = currentTime;
        }
        if (
            !this.state.isServerSaveInFlight &&
            currentTime - this.state.lastServerSaveUpdate >= this.state.serverSaveInterval
        ) {
            this.state.isServerSaveInFlight = true;
            this.saveToProjectFolder({ fallbackToDownload: false }).finally(() => {
                this.state.isServerSaveInFlight = false;
            });
            this.state.lastServerSaveUpdate = currentTime;
        }
    }

    _loopRender(currentTime) {
        // ### Rendering ###
        // DER BLICK DES BILDS (K59): die Kamera dieses Bilds steht — wen sie sieht, der ruht nicht mehr (`_ruheImBild`
        // weckt ihn und schreibt sein Feld, bevor er gezeichnet wird; Teleport, Portal, Schwenk, die Ausgabe-Aufnahme).
        this._ruheImBild();
        // DER SATZ (Welle B): alle Chunk-Ein-/Austritte dieses Frames legen ihren Index JETZT, direkt vor dem
        // Zeichnen — ein frei gewordener und im selben Frame neu vergebener Bereich ist nie ungelegt sichtbar.
        this._tickChunkSatz();
        // Skybox-Position DIREKT vor dem Render kopieren (die Kamera ist hier schon aktualisiert).
        if (this.state.camera && this.state.skybox) {
            this.state.skybox.position.copy(this.state.camera.position);
        }
        // Stern-Feld folgt der Kamera (sonst wandert man heraus) und dreht sidereal mit der Tageszeit um
        // eine geneigte Achse.
        if (this.state.camera && this.state.starField) {
            this.state.starField.position.copy(this.state.camera.position);
            const tod = this.state.timeOfDay || 0;
            this.state.starField.rotation.set(0.4, tod * Math.PI * 2, 0.15);
        }
        // WELLE J3 — Sonne·Mond SYNCHRON an die Kamera heften (wie das
        // Stern-Feld) → sie stehen fest am Himmel statt um den Welt-Ursprung zu
        // orbiten + neben dem fernen Spieler durchs Terrain zu rasen.
        this._followCelestialBodies();
        // Das geteilte Hydrosphären-Material (Fluss-Ribbons + See-Planes) zentral animieren; der
        // Flow-Shader scrollt den Schaum stromab nach per-Vertex-`aFlow`.
        if (this.state.hydroSurfaceUniforms && this.state.hydroSurfaceUniforms.time) {
            this.state.hydroSurfaceUniforms.time.value = currentTime;
        }
        // `uEmotion` füttern: die Stimmung hebt den Schaum (s. `_ensureHydroSurfaceMaterial`) — positive
        // Gefühle beleben das Wasser, Trauer dämpft.
        if (this.state.hydroSurfaceUniforms && this.state.hydroSurfaceUniforms.emotion) {
            const em = this.state.player && this.state.player.emotions;
            const vital = em
                ? Math.max(
                      0,
                      Math.min(
                          1,
                          (em.joy || 0) * 0.6 + (em.peace || 0) * 0.5 + (em.hope || 0) * 0.3 - (em.sorrow || 0) * 0.5
                      )
                  )
                : 0;
            this.state.hydroSurfaceUniforms.emotion.value = vital;
        }
        // V8.28 6.G4.b D — Wind. uWindTime läuft kontinuierlich,
        // uWindStrength emergiert aus weather (rainy = kräftiger).
        if (this.state.windUniforms) {
            this.state.windUniforms.uWindTime.value = currentTime;
            // Böen-Amplitude = wind-Kanal des Wetter-Felds (stormy 1.0·AMP, sunny 0.06·AMP; AMP=0.55) ×
            // Böen-Drift `_weatherWob` (gesetzt in `_loopWeatherAndGrowth`).
            this.state.windUniforms.uWindStrength.value =
                this._weatherFieldFor(this.state.weather).wind * AnazhRealm.WEATHER_WIND_AMP * (this._weatherWob || 1);
            // Die EINE Wind-Richtungs-Quelle + Interaktions-Sphären ticken mit dem Wind-Uniform: uWindDir =
            // seeded Mäander `_windDirAt` (currentTime in s, dieselbe Uhr wie uWindTime), uBend =
            // Spieler/Ritt/nahe Kreaturen (`_tickGrasBend`, render-rein).
            if (this.state.windUniforms.uWindDir) {
                const _wdir = this._windDirAt(currentTime);
                this.state.windUniforms.uWindDir.value.set(_wdir.x, _wdir.z);
            }
            this._tickGrasBend();
        }
        // uLodRef spiegelt live die EINE Quelle `state.lodRef` (Slider ohne Mesh-Rebuild; dieselbe Zahl
        // liest `_lodPerceptionDistance`), uLodMaskOn den A/B-Toggle. uDitherT rotiert golden-ratio, wo die
        // zeitliche Auflösung in der Kette steht (state.traaNode, _ensurePostProcessing): das zeitliche Mittel ist die
        // glatte Blende (statisch wäre das Mittel das Muster). Ohne TRAA (Holz kienspan) bleibt es statisch —
        // rotierendes Dither ohne zeitliche Auflösung wäre kriechendes Rauschen (Studio-Gesetz phytogenesis FIX v32).
        // die Ankunft aus der Ferne gleitet je gezeichnetem Bild (`_ankunftsFerne`, B2) — vor dem Spiegel nach `uLodPerf`
        if (this.state._ankunftGleit < AnazhRealm.ANKUNFT_GLEIT_BILDER) this.state._ankunftGleit++;
        if (this.state.lodUniforms) {
            const _lu = this.state.lodUniforms;
            if (_lu.uDitherT && this.state.traaNode) _lu.uDitherT.value = (_lu.uDitherT.value + 0.61803398875) % 1;
            // die Kante des Laubs (K68, `_laubSchwelle`): unter der zeitlichen Auflösung dreht ihre Schwelle um 1/g (die
            // Plastik-Zahl, gleichverteilt neben der Goldenen Drehung der Blende), ohne sie steht sie bei 0,5
            if (_lu.uLaubKante) {
                const _k = _lu.uLaubKante.value;
                _k.y = this.state.traaNode ? 1 : 0;
                if (_k.y) _k.x = (_k.x + 0.75487766625) % 1;
            }
            if (_lu.uLodRef)
                _lu.uLodRef.value =
                    Number.isFinite(this.state.lodRef) && this.state.lodRef > 0 ? +this.state.lodRef : 14;
            if (_lu.uLodMaskOn) _lu.uLodMaskOn.value = this.state.lodMaskOn === false ? 0 : 1;
            if (_lu.uLodAuge && this.state.camera) _lu.uLodAuge.value.copy(this._lodAuge());
            if (_lu.uLodPerf) _lu.uLodPerf.value = this._lodPerfMul();
            // W5.4 (Schritt 3) — die Band-Zahlen spiegeln LIVE die EINE Quelle LOD_DISTANCES
            // (der Studio-Ingest mutiert sie → die Foundry-Maske folgt ohne Material-Rebuild).
            const _D = AnazhRealm.LOD_DISTANCES;
            if (_D && _lu.uLodD0) {
                if (Number.isFinite(_D.thresh01)) _lu.uLodD0.value = _D.thresh01;
                if (Number.isFinite(_D.thresh12)) _lu.uLodD1.value = _D.thresh12;
                if (Number.isFinite(_D.fade)) _lu.uLodFade.value = _D.fade;
                if (Number.isFinite(_D.fade0)) _lu.uLodFade0.value = _D.fade0;
            }
        }
        // Godray-Frame-Steuerung: Sonnen-Screen-Position + Pegel; headless fehlt `godrayUniforms` evtl.
        // Die Himmelskörper hängen schon an der Kamera (`_followCelestialBodies`) → `.project(camera)` gibt
        // die NDC-Lage. Pegel = `_godrayScale` (perf) × `_godrayFrameGate` (Wetter/Höhe) × Sichtbarkeit
        // (Sonne vor der Kamera, im Bild, über dem Horizont).
        if (this.state.godrayUniforms && this.state.sunMesh && this.state.camera) {
            const gu = this.state.godrayUniforms;
            const cam = this.state.camera;
            const t = typeof this.state.timeOfDay === "number" ? this.state.timeOfDay : 0.5;
            const angle = this._sonnenWinkel(t);
            const sunDir = this._dayNightSunDirection(angle); // dieselbe Richtungs-Quelle wie Licht/Skybox
            // NDC-Projektion des sichtbaren Sonnen-Meshes → Screen-UV (0..1).
            const proj = (this._godrayProjV || (this._godrayProjV = new THREE.Vector3()))
                .copy(this.state.sunMesh.position)
                .project(cam);
            const uvx = proj.x * 0.5 + 0.5;
            const uvy = proj.y * 0.5 + 0.5;
            gu.sunScreenPos.value.set(uvx, uvy);
            // Sichtbarkeit: (a) VOR der Kamera (robust via Blickrichtung · Sonnen-Richtung, statt
            // der zweideutigen NDC-z hinter der Kamera), (b) im Bild, (c) über dem Horizont.
            const sm = (a, b, x) => {
                const k = Math.max(0, Math.min(1, (x - a) / (b - a)));
                return k * k * (3 - 2 * k);
            };
            const fwd = this._godrayFwd || (this._godrayFwd = new THREE.Vector3());
            cam.getWorldDirection(fwd);
            const off = this.state.sunMesh.userData && this.state.sunMesh.userData.skyOffset;
            const facing = off ? fwd.x * sunDir.x + fwd.y * sunDir.y + fwd.z * sunDir.z : -1; // sunDir ≈ skyOffset-Richtung
            const onScreen =
                sm(-0.2, 0.05, uvx) * (1 - sm(0.95, 1.2, uvx)) * sm(-0.2, 0.05, uvy) * (1 - sm(0.95, 1.2, uvy));
            const sunVisible = sm(0.02, 0.25, facing) * onScreen;
            const weatherSun = this._weatherFieldFor(this.state.weather).sun;
            const gate = this._godrayFrameGate(sunDir.y, weatherSun);
            gu.strength.value = (this.state._godrayScale ?? 1) * gate * sunVisible;
        }
        // WebGPURenderer.init() ist async, der Loop läuft sofort — Render-Frames überspringen, bis
        // rendererReady.
        if (!this.state.rendererReady) return;
        // Nach GPU-Device-Verlust rendert kein Pfad mehr (jeder Versuch wirft createBuffer-Fehler, endlos):
        // EIN Chokepoint. Der Wächter hat Error + Gate schon gezeigt; die Simulation läuft weiter.
        if (this.state._deviceLost) return;
        // V18.268 — perfSense-Render-Tap: EINMAL pro Frame zurücksetzen, dann am Ende
        // die akkumulierte Per-Frame-Last (alle render()-Pässe) lesen (autoReset=false).
        const _rinfo = this.state.renderer.info;
        if (_rinfo && typeof _rinfo.reset === "function") _rinfo.reset();
        // Die Shadow-Map rendert der WebGPU-Renderer nativ (Cache-Steuerung in _loopShadowUpdate).
        // render() ist async: Pipeline-Compile-Fehler werden geloggt (kein WebGL-Hot-Swap — schwarze Welt).
        // Steht die Post-Pipeline, rendert sie die Szene; bei postProcessingFailed direkter
        // renderer.render() — nie ein schwarzer Schirm.
        const pp = this._ensurePostProcessing();
        // DER LICHT-TAKT (K11): die Plätze des Licht-Pools und die Fenster-Glut für dieses Bild (die Kamera steht)
        this._leuchtTakt();
        // das Spiegel-Feld des Wassers folgt dem Auge (D10, ein Worker-Auftrag zur Zeit)
        this._spiegelFeldTakt();
        // Die Kehraus-Marke vor dem Frame: was dieser Frame zeichnet, trägt einen höheren Zähler.
        const zaehlerVor = this._gpuKehrausMarke();
        // DIE SZENEN-SKALA am Szenen-Pass: nie je Last (jeder Ziel-Wechsel unter lebenden Bündeln war die Destroyed-Klasse,
        // realloc-tod 20.07.) — nur ein neuer Wert des Spielers (`state.szeneSkala`, der Regler im Menü), und der legt die
        // Ziele beim nächsten Frame neu an wie ein Fenster-Wechsel (der Vorher-Textur-Wächter der Diät folgt jeder Textur).
        const sp = this.state.scenePass;
        if (sp && sp.getResolutionScale() !== this._szeneSkalaWirk()) sp.setResolutionScale(this._szeneSkalaWirk());
        const ppu = this.state.postProcessingUniforms;
        if (ppu && ppu.nachSchaerfe)
            ppu.nachSchaerfe.value = this.state.traaNode ? AnazhRealm.ZEIT_SCHAERFE * (1 - this._szeneSkalaWirk()) : 0;
        // DIE WEICHE: Post-Kette oder Direktpfad — und mit ihr Leinwand-Tiefe und Rahmen-Ziel (`_leinwandWeg`, der EINE Weg).
        let direkt = !pp || this.state.postProcessingFailed === true;
        if (!direkt) {
            this._leinwandWeg(false);
            try {
                // V18.113 — renderAsync() ist im PR-#81-Vendor deprecated (Warnung
                // in der Schöpfer-Konsole); render() ist der eine Pfad.
                if (this.state.traaNode) this._traaReprojektion();
                // springt das Auge (K68, `_traaR.sprung`), zeigt der Spiegel des letzten Bilds einen anderen Ort: das Wasser
                // liest in DIESEM Bild den Himmel allein, der Pass danach rechnet den neuen (D10)
                const L = this.state.spiegelLeser;
                if (L && this.state._traaR && this.state._traaR.sprung) L.an.value = 0;
                pp.render();
            } catch (err) {
                // r184 baut Post-Kette und Szenen-Pass erst im ersten render() (PostProcessing.render → _update): ein
                // Knoten-Fehler der Kette bricht HIER — laut beim Namen (K22), der Schirm zeichnet danach direkt
                this.state.postProcessingFailed = true;
                direkt = true;
                this._stoffBruch(
                    "die Post-Kette (Render-Lauf: TRAA · Bloom · Grading) — der Schirm zeichnet direkt",
                    err
                );
            }
        }
        if (direkt) {
            this._leinwandWeg(true);
            this.state.renderer.render(this.state.scene, this.state.camera);
        }
        // DER SPIEGEL DES GESETZES (D10): nach dem Bild der Post-Kette, aus ihrer Tiefe — das Wasser des nächsten liest ihn
        if (!direkt) this._spiegelPassZeichne();
        // Das erste fertige Weltbild nimmt den Ladeschirm weg (L2: nie die schwarze Leinwand).
        if (!this.state._weltbildDa) this._ankunftsBild();
        // GPU-Last in den perfSense-Frame-Akku (Draw-Calls + Dreiecke, alle Pässe). Im r184-WebGPU-Info ist
        // `render.calls` ein LEBENSZEIT-Zähler der render()-Aufrufe (reset() löscht ihn nicht) → er
        // vergiftete HUD/Flugschreiber/Regler mit wachsender Phantom-Last. Pro Frame zählt
        // `render.drawCalls`; `.calls` nur als Fallback für alte/fremde Info-Formen.
        if (_rinfo && _rinfo.render) {
            const f = this.state._perfFrame || (this.state._perfFrame = {});
            f.renderCalls = _rinfo.render.drawCalls != null ? _rinfo.render.drawCalls : _rinfo.render.calls || 0;
            f.renderTris = _rinfo.render.triangles || 0;
        }
        // Nach dem Frame: was weder der Graph noch dieser Frame zeichnet, verlässt die GPU (der EINE Kehraus).
        this._gpuKehraus(zaehlerVor, performance.now());
        // pendingDisposals über `device.queue.onSubmittedWorkDone()` leeren — die EINZIGE deterministische
        // API (resolved, wenn die GPU alle bisherigen Submits durch hat); ein Frame-Zähler rät nur.
        if (this.state.pendingDisposals.size > 0) {
            // V10.0-j.g — Set → Array für stable iteration. Set wird nach
            // dem Snapshot geleert (neue Disposes pushen für den nächsten
            // Frame, NICHT in den aktuellen Drain).
            const queue = Array.from(this.state.pendingDisposals);
            this.state.pendingDisposals.clear();
            const backend = this.state.renderer && this.state.renderer.backend;
            const device = backend && backend.device;
            const queueObj = device && device.queue;
            if (queueObj && typeof queueObj.onSubmittedWorkDone === "function") {
                queueObj.onSubmittedWorkDone().then(() => {
                    for (const obj of queue) {
                        try {
                            obj.dispose();
                        } catch (_e) {
                            /* defensive */
                        }
                    }
                });
            } else {
                // Fallback ohne `backend.device.queue` (headless/WebGL2-Backend ohne onSubmittedWorkDone): synchron
                // dispose ist sicher — WebGL hat keine async-submit-Race.
                for (const obj of queue) {
                    try {
                        obj.dispose();
                    } catch (_e) {
                        /* defensive */
                    }
                }
            }
        }
    }
}
_stammZonen(AnazhRealm, [AnazhRealm_dirigent_takt]);

// ===== ATLAS · Dirigent/takt — Außen-Konstanten =====
// SCATTER (unten) — FERN dichter Wald als InstancedMesh-Streu, gegated gegen die gebackenen Felder,
// deterministisch aus pcg2d-Integer-Hash (bit-identisch CPU↔GPU), ohne Architektur-Einträge; NAH
// kristallisiert ein Baum im promoteRadius zu einem echten Bauplan (harvestbar) mit IDENTISCHER
// Geometrie (derselbe `grown_<species>_v<idx>`-Pool) → kein Sprung. Dieselben archInstanceGroups.
// SCATTER_SLICE_MS — Scheiben-Länge des Region-Baus (ms/Frame im scatterDeco-Job): klein genug, dass
// kein Streaming-Frame am Deko-Bau kippt, groß genug für eine warme Region in 1–2 Scheiben.
AnazhRealm.SCATTER_SLICE_MS = 6;
// V18.354 — PHASE B (Frame-Budget-Scheduler): der Boden des Deferrable-Budgets (ms). Selbst wenn
// die Pflicht-Kosten (Physik/Render) das Frame-Ziel fast füllen, bleibt diese Kür-Zeit — das
// Streaming ist eh heilig (prio 0, ungedrosselt), dieser Floor hält die niedrigeren Jobs am Leben.
AnazhRealm.FRAME_SCHED_MIN_MS = 2;
// Existenz-Boden des Dispatchers: Substanz (prio 1: Wasser-Iso · Scatter · Gras) läuft JEDEN Frame
// mit diesem Boden, Deko (prio ≥ 2) jeden 4. Frame mit dem kleinen — sonst wachsen die Queues auf
// render-gebundener Maschine monoton. Existenz vor Framerate.
AnazhRealm.FRAME_SCHED_SUBSTANZ_FLOOR_MS = 4;
AnazhRealm.FRAME_SCHED_DEKO_FLOOR_MS = 2.5;
// Das Budget eines Lade-Frames (ms, `_ladeTakt`): unter dem Ladeschirm trägt jeder Frame so viel aufschiebbare Arbeit
// (Streu, Gras, Wasser), dass der Boot mit der Arbeit läuft, nicht mit der Frame-Rate.
AnazhRealm.LADE_TAKT_MS = 100;
// Der Abstand der Bilder unter dem Ladeschirm (ms, `_ladeBildFaellig`): dazwischen schickt der Lade-Takt nichts an die GPU.
AnazhRealm.LADE_BILD_MS = 500;
AnazhRealm.TAKT_DECKEL_S = 0.1;
AnazhRealm.FIXED_MAX_STEPS = 8;
AnazhRealm.ZEIT_SCHAERFE = 1;
// DIE GPU-LEINE (_gpuLeineFrei): höchstens so viele Frames dürfen zugleich auf der GPU unterwegs sein — mehr ist nur
// Eingabe-Verzug (gemessen 04.10.: 600 ms bei ≈ 10 Frames in der Schlange), nie mehr Durchsatz.
AnazhRealm.GPU_FRAMES_IM_FLUG = 2;
// Fällt der Spieler trotzdem durch (jede Ursache: Remesh-Timing, Teleport, …),
// fängt ihn dieser Boden: unter dem Voxel-Boden (base−floorDrop ≈ −90 m) → zurück
// an die Oberfläche. Bis V17.28 hatten NUR Kreaturen so eine Rettung (y < −50).
AnazhRealm.PLAYER_VOID_Y = -120;

// Determinismus-Bogen P4 (Stufe 1) — Sicherheits-Cap für die Replay-Aufnahme (Frames).
// 18000 ≈ 5 min bei 60 fps — genug für eine echte Spiel-Sequenz, gedeckelt gegen Runaway.
AnazhRealm.REPLAY_MAX_FRAMES = 18000;
