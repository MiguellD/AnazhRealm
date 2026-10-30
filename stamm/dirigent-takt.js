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
            // DIE EINGABE je Bild (leib.K5): das Gamepad in die Verb-Tafel, der Blick in die Kamera-Kugel — auch bei offenem Portal,
            // dessen Zurück-Knopf es verlässt (`_eingabeTakt`)
            this._eingabeTakt(delta);
            if (this._portalOverlay) return;
            this.state.spielZeit += delta; // DIE WELT-UHR: nur Takte der Heimat-Welt zählen (das Portal friert sie ein)
            // DIE BILD-UHR (A9, Gesetz #0): die EINE Shader-Zeit der Welt in Sekunden, hier EINMAL je Takt geschrieben — Himmel,
            // Wasser, Wind und Böe, Tor, Regen, Flackern, Chaos-Flimmern und die TSL-`time` (`_loopRender`) lesen nur sie
            this._bildZeit = currentTime;
            this._taktZeit = currentTime; // DIE UHR DES TAKTS (`_taktUhr`) — die Bühne hält die Bild-Uhr, nie sie

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
                // DER SCHIRM einmal je Takt (die EINE Quelle jeder Schirm-Größe, `_schirm`) — und mit ihm die Schwellen der Stufen
                // (das Gesetz des Wechsels, `_stufenSchirm`: sie folgen dem Schirm, nie der Bildrate).
                this._schirmMessen();
                this._stufenSchirm();
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

                    // ### Fauna-Lifecycle (Ökologie K2) ###
                    // je Takt der Spiel-Zeit die Bilanz des Bestands: Geburt unter, Hunger über der Kapazität aus Nahrung × Lebensraum.
                    this.tickFaunaLifecycle();

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
                // das Rumble aus dem Zustand dieses Takts (Fahrt, Treffer), nach der Sim
                if (!ruht) this._rumbleTakt(delta, currentTime);

                // V17.28 — Boden unter dem Boden: fällt der Spieler durch (Struktur-
                // Remesh-Timing, Teleport in ungebauten Chunk, …), fängt ihn das ab.
                this._rescuePlayerFromVoid();
                // DETERMINISMUS-BOGEN P3 — der „weiche Boden" (V18.271) ist entfallen: der
                // Feld-Controller (`_stepCharacter`) erdet den Spieler direkt aus dem Dichtefeld,
                // das überall definiert ist (auch unter ungebauten Chunks) → kein Durchfallen.

                if (!ruht) {
                    // V17.55 W1 — Halten-zum-Abbauen: der Auto-Hieb-Tick (gegated durch die gehaltene Abbau-Aktion der
                    // Verb-Tafel; das kontinuierliche Mahlen in der strikeInterval-Kadenz).
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
                // ### Das Bild des Brands ### (stoffe.K2#2 — Flammen auf der Front, die Fahne des Rauchs)
                this._brandBild(delta);
                // ### Funken ### (halten.K2 — die Späne eines Treffers aus dem Stoff-Paar fliegen und verlöschen)
                this._funkenTakt(delta);

                if (!ruht) {
                    // ### Fähigkeiten ### (rule) — gehalten über die Verb-Tafel: ihre Taste oder ihr Pad-Knopf (`_verbTaste`)
                    Object.keys(this.state.abilities).forEach((ability) => {
                        if (this.state.verbTafel.gehalten[ability]) this.state.abilities[ability](this, this.state);
                    });

                    // ### Speichern ### (V9.44-f → _loopAutoSave)
                    this._loopAutoSave(currentTime);
                }

                // ### Kamera ### (V9.44-f → _loopCamera)
                // V18.355 — PHASE C: VOR der Kamera die Render-Interpolation anwenden (das Auge
                // folgt der glatt interpolierten Spieler-Position, nicht der gestuften Sim-Position).
                this._applyFixedInterpolation();
                // DER RITT IM BILD VOR DER KAMERA (F1): der Wagen steht, wo der Reiter gezeichnet wird, BEVOR die Chase-Cam ihn
                // liest — sie las die Sim-Lage des letzten Schritts (ohne Schritt die gezeichnete des Vor-Bilds) und blickte auf
                // den interpolierten Reiter: Lage und Blick aus zwei Quellen derselben Lage.
                this._tickMountedMovement(delta);
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
                    this._loopRender();
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
            // DER STAND DER WELT je Takt (A9, `_weltSteht`): auf der LÄUFT-IMMER-Seite wie das Laden, das ihn bewegt
            this._weltStandTakt();

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
            // die Leiber jeder annehmbaren Seele bauen ihre Programme im Leerlauf (`_leibVorwaermen`, eigenes try/catch wie oben)
            try {
                this._leibVorwaermen();
            } catch (err) {
                this._loopErrorBoundary(err);
            }
        };
        // Loop-Funktion exponieren, damit Tests (playtest.cjs) einen Frame SYNCHRON treiben können statt
        // auf das headless gedrosselte rAF zu warten; der Loop selbst läuft weiter über setAnimationLoop.
        this._gameLoopTick = loop;
        this.state.renderer.setAnimationLoop(loop);
    }

    // ═══ DAS WORT „DIE WELT STEHT" (A9) ═══
    // Die Welt steht, wenn ihre Regungs-Stempel (`_weltRegt`: Welt · Bau · Boden-Karte) WELT_STEHT_TAKTE Takte unverändert
    // blieben, nichts mehr baut (`_weltOffen`: kein Foundry-Auftrag wartet, fliegt oder liegt unverteilt, kein Chunk ist
    // schmutzig oder im Bau, der Wald plant und pflanzt nicht mehr, keine Karte wartet auf ihren Bake) und jeder geweckte Fege-Takt der Stand-Wache seine Runde
    // zu Ende ging (`_standGeht`; A9 Zweit-Boot an der Mess-Wiese: die Stufen-Wahl tauschte die nahen Bäume noch Karte → Mesh,
    // als die Stempel schon 30 Takte standen — boden-nah 2,418 statt 1,830). So ist „steht" ein FIXPUNKT: ohne Eingabe wirkt
    // danach nichts mehr (gate:stand-takt FIXPUNKT; K-WANDUHR zählte kurz nur die Wirkung — nach einem Dichte-Schritt stand die
    // Welt nach 1 Takt, mitten in der Runde der Stufen-Wahl 256 von 2 304, und wirkte danach noch 4×). Ein atmender Regler weckt
    // die Takte ohne Ende: wer auf das Wort wartet, hält ihn (`__weltStehtNach`; unter Last stand die Welt am Genesis-Ring sonst
    // nie, CI 39439645378 · 39449804810 · 39452595795).
    // Gezählt in Takten des Loops, nie in Wanduhr: ein Bild der stehenden Welt ist dasselbe Bild in jeder Sitzung.
    // Die Bühne wartet vor jedem Schuss darauf, jede Linse, die eine stehende Welt braucht, fragt dieses Wort.
    // `grund` nennt, was die Ruhe zuletzt brach (die Regung, der Fege-Takt beim Namen samt Runde, das Offene) — wer auf das
    // Wort wartet und es nicht bekommt, bricht beim Namen des Täters.
    _weltStandTakt() {
        const W = this._weltStand || (this._weltStand = { welt: -1, bau: -1, karte: -1, ruhe: 0, takte: 0 });
        W.takte++;
        const welt = this._weltRegung | 0,
            bau = this._bauRegung | 0,
            karte = this._karteRegung | 0;
        const geht = this._standGeht();
        const o = this._weltOffen();
        const grund =
            welt !== W.welt
                ? "Welt-Regung"
                : bau !== W.bau
                  ? "Bau-Regung"
                  : karte !== W.karte
                    ? "Karten-Regung"
                    : geht
                      ? `Fege-Takt ${geht}`
                      : o.foundry
                        ? `Foundry offen ${o.foundry}`
                        : o.chunks
                          ? `Chunks offen ${o.chunks}`
                          : o.stau
                            ? "Stau offen"
                            : o.horizont
                              ? `Horizont offen ${o.horizont}`
                              : o.wald
                                ? `Wald offen ${o.wald}`
                                : o.karten
                                  ? `Karten offen ${o.karten}`
                                  : o.felder
                                    ? `Felder offen ${o.felder}`
                                    : o.dorf
                                      ? `Dorf offen ${o.dorf}`
                                      : o.leib
                                        ? "Leib offen"
                                        : o.ankunft
                                          ? `Ankunft gleitet ${o.ankunft}`
                                          : null;
        if (grund) {
            W.welt = welt;
            W.bau = bau;
            W.karte = karte;
            W.grund = grund;
            W.ruhe = 0;
        } else W.ruhe++;
    }
    // Die Fege-Takte mitten in ihrer Runde, beim Namen (`wartet`: auf ein Budget oder ein Asset, sonst gegangen/Runde) — null,
    // wenn jeder schläft.
    _standGeht() {
        let geht = null;
        if (this._standWache)
            for (const [n, t] of this._standWache.takte)
                if (t.leer < t.runde)
                    geht = `${geht ? `${geht}, ` : ""}${n} ${t.offen ? "wartet" : `${t.leer}/${t.runde}`}`;
        return geht;
    }
    // Was die Welt noch baut: Foundry-Aufträge (wartend, im Flug, Antworten vor der Freigabe — auch die gehaltenen: Laub-Körper
    // vor dem Blatt-Atlas, das Buch vor dem Wirt, B3a), Chunks (schmutzig, im Bau) und der Wald (die Plan-Schlange, die
    // Pflanz-Gänge, die wartenden Pflanzungen, K69) und die Karten (die Schlange des Karten-Takts, wartend und backend bis
    // zur Lieferung in den Atlas), die Felder (die Schuld der EINEN Bake-Uhr, `_weltBakeSchuld`), das Dorf (`_dorfOffen`), der Leib des Spielers (`leib`) und die Leiber der Bewohner,
    // deren Feld noch nicht gebacken ist (mit Bild, wer draußen ist — `_kzLeib` vorab, mensch.K2) — jede Linse liest SIE, nie
    // die Marken; wer „nichts offen" fragt, liest JEDES Feld.
    _weltOffen() {
        const f = this._foundry;
        const st = this.state;
        const o =
            this._weltOffenWert ||
            (this._weltOffenWert = {
                foundry: 0,
                chunks: 0,
                wald: 0,
                karten: 0,
                felder: 0,
                leiber: 0,
                dorf: 0,
                leib: 0,
                ankunft: 0,
                stau: 0,
                horizont: 0,
            }); // je Takt, ohne Müll
        o.foundry = f
            ? (f.pending ? f.pending.size : 0) +
              (f.warte ? f.warte.length : 0) +
              (f.nachAtlas ? f.nachAtlas.length : 0) +
              (f.buch ? 1 : 0)
            : 0;
        o.foundry += this._foundryIngestQueue ? this._foundryIngestQueue.length : 0;
        o.chunks =
            (st.dirtyVoxelChunks ? st.dirtyVoxelChunks.size : 0) + (st.voxelMeshPending ? st.voxelMeshPending.size : 0);
        // DER STAU IM FADEN (`_stauFelder`): sein Auftrag baut, bis die Felder ankamen (`_stauAn`) — bis ci-werk-wasser stand die
        // Welt, während er flog, und gate:werk-im-wasser D zählte den Stausee nach dem Reload vor seiner Antwort
        o.stau = this._stauImFlug ? 1 : 0;
        // DER HORIZONT IM FADEN (B2, `_fernRingRefresh`): bis jede bestellte Scheibe und jeder Edit-Auftrag des Fern-Rings
        // eingehängt ist und der Ring ganz steht — bis ci-wackler-zensus stand die Welt, während der Fern-Faden noch rechnete,
        // und die Saum-Wache ging ihre erste Runde nach dem Stand (gate:stand-takt FIXPUNKT · STUFE · GEHEN, CI unter Last)
        const fr = st.fernRing;
        o.horizont = fr
            ? fr.flug +
              (fr.editFlug | 0) +
              fr.einhaengen.length +
              fr.nachEdit.length +
              (fr.cursor < fr.totalVerts ? 1 : 0)
            : 0;
        // DER FLUG IST DER FADEN (heil-horizont): zählt der Ring mehr Bestellungen im Flug, als der Fern-Faden trägt, ist eine
        // verloren — ein Neubestellen neben `_fernRingNeuBestellen` vergaß sie, und der Horizont stünde nie mehr (CI 40594858957:
        // „Horizont offen 1“, erst nach 3 729 Takten beim Deckel); laut am Ereignis, beim Namen
        const faden = fr && this._nebenFaeden ? this._nebenFaeden.get("fern") : null;
        if (fr && fr.flug + (fr.editFlug | 0) > (faden ? faden.pending.size : 0))
            this._bruchMelden(
                "HORIZONT: der Fern-Ring zählt eine Bestellung im Flug, die der Fern-Faden nicht trägt — ein Neubestellen neben `_fernRingNeuBestellen` vergaß sie"
            );
        // die Schlange des Walds, seine Pflanz- und Saat-Wartenden, und die frischen Taten, deren erste Stufe der Nachwuchs
        // noch malt (`_sukzessionNeu`: Narbe, Wiese, Streu und Wald der Asche)
        o.wald =
            (this._sukzessionNeu ? this._sukzessionNeu.length : 0) +
            (this._waldPlanSchlange ? this._waldPlanSchlange.size : 0) +
            (this._waldPflanzWarten ? this._waldPflanzWarten.size : 0) +
            (this._saatOffen ? this._saatOffen.size : 0) +
            (st.pendingVegSpawns ? st.pendingVegSpawns.length : 0);
        o.karten = this._impostorBakeQueue ? this._impostorBakeQueue.length : 0;
        o.felder = this._weltBakeSchuld();
        o.dorf = this._dorfOffen();
        // DER LEIB DES SPIELERS (Lehre 13, Existenz vor Framerate): auf echter GPU gießt der Loop den Avatar erst, wenn seine
        // Vorlagen im Memo liegen (`_deferredAvatarSoul` → `applyPlayerSoul`) — bis dahin ist der Spieler der leere Anker, und
        // die Welt steht nicht (mensch.K1 Radeon: die Probe hielt den Anker, die Stadt lag 735 m vom Spieler)
        o.leib = st._deferredAvatarSoul ? 1 : 0;
        // DIE ANKUNFT GLEITET (`_ankunftsFerne`, B2): bis ihr letztes Bild gezeichnet ist, misst jede Stufen-Wahl weiter, als das
        // Auge steht — die Bilder, die ihr fehlen (tiere.K1: im Schuss der Werkbank stand sie bei 62 von 90, der Mammut 13,9 m
        // vor dem Auge trug die Karte)
        const gleit = st._ankunftGleit;
        o.ankunft = gleit >= 0 && gleit < AnazhRealm.ANKUNFT_GLEIT_BILDER ? AnazhRealm.ANKUNFT_GLEIT_BILDER - gleit : 0;
        o.bau = st.bauSatzRaten ? st.bauSatzRaten.size : 0; // ein Bau-Bereich, der in Raten eintritt, steht noch nicht
        o.leiber = 0;
        if (this._bewohnerSiedlungen && st.renderer && !st.renderer._isHeadlessNull)
            for (const S of this._bewohnerSiedlungen.values())
                for (const b of S.liste || []) if (b.leib && !b.drinnen && !b.leib.userData._kzVersuch) o.leiber++;
        return o;
    }
    _weltSteht() {
        const W = this._weltStand;
        if (!W || W.ruhe < AnazhRealm.WELT_STEHT_TAKTE) return false;
        // live: eine Regung oder ein Auftrag seit dem letzten Takt (der Loop ruht, ein Bild weckte) zählt sofort
        if ((this._weltRegung | 0) !== W.welt || (this._bauRegung | 0) !== W.bau || (this._karteRegung | 0) !== W.karte)
            return false;
        const o = this._weltOffen();
        for (const k in o) if (o[k]) return false; // jedes Feld, ohne Müll je Takt
        // DER SPRUNG DES ANKERS: stand die Kamera einer Sonde (das Auge der Stufen, `_lodAuge` setzt es neu) oder der Spieler seit
        // dem letzten Takt woanders, ginge jeder Fege-Takt, der dort an seinem Anker fegte, im nächsten eine Runde — bis dahin
        // steht die Welt nicht (tiere.K1: der Schuss 43 m quer zum Spieler zeichnete den Mammut 14 m vor dem Auge als Karte)
        this._lodAuge();
        for (const t of this._standWache ? this._standWache.takte.values() : [])
            if (
                t.pos &&
                t.anker &&
                t.takt >= W.takte - 1 &&
                (t.pos.x - t.anker.x) ** 2 + (t.pos.y - t.anker.y) ** 2 + (t.pos.z - t.anker.z) ** 2 > t.rand * t.rand
            )
                return false;
        return !this._standGeht();
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
            (this._gpuLeine = {
                imFlug: 0,
                gerendert: 0,
                ausgesetzt: 0,
                sammelMs: 0,
                versuch: false,
                erledigt: 0,
                erledigtMs: null,
            });
        L.versuch = false;
        if (this._gpuLeineStraff()) {
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
    // Gespannt: GPU_FRAMES_IM_FLUG Arbeiten unterwegs. Jede GPU-Arbeit des Takts fragt dieselbe Zahl — das Bild und die
    // Karte (S2b: die Karte backte neben der Leine; swiftshader, Mess-Wiese, 20 Karten: in 15 s 3 Bilder, 17 Bakes bei
    // gespannter Leine — die Probe des Hauptbilds sah in der CI kein Bild).
    _gpuLeineStraff() {
        const L = this._gpuLeine;
        return !!L && L.imFlug >= AnazhRealm.GPU_FRAMES_IM_FLUG && !!this._gpuLeineQueue();
    }
    _gpuLeineAnlegen() {
        const L = this._gpuLeine;
        if (!L) return;
        L.gerendert++;
        this._gpuLeineBinden(true);
    }
    // Eine abgeschickte GPU-Arbeit an die Leine (das Bild, die Karte): unterwegs, bis die Queue sie abgearbeitet hat. Ein
    // abgearbeitetes BILD zählt mit Zeitpunkt (`erledigt`, `erledigtMs` — der Takt der GPU; `werkbank lauf` liest ihn, statt
    // je Bild eine zweite Abfrage an die Queue zu stellen).
    _gpuLeineBinden(bild) {
        const L = this._gpuLeine;
        const q = this._gpuLeineQueue();
        if (!L || !q) return;
        L.imFlug++;
        const los = () => {
            L.imFlug = Math.max(0, L.imFlug - 1);
        };
        const erledigt = () => {
            los();
            L.erledigt++;
            L.erledigtMs = performance.now();
        };
        try {
            q.onSubmittedWorkDone().then(bild ? erledigt : los, los);
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
                // das Programm trägt den Namen seiner Evolution — die Stimme des Felds nennt ihn als Gesetz der Tat (`_tatWerten`)
                const result = this.dslRun(evolution.program, {
                    source: evolution.source || "nexus",
                    programId: evolution.name,
                });
                // Eine REGEL-Evolution registriert (rule-Op) eine stehende Regel in state.worldRules; ihre Fitness
                // läuft über deren Lebens-Fenster (_worldRuleFitness), NICHT über den 5-s-Gesten-Finalizer →
                // nicht in pendingOutcomes/Gesten-History.
                if (evolution.program[0] === "rule") {
                    this.log(`Nexus-Evolution (Regel) registriert: ${evolution.name}`, "INFO");
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
                    createdAt: evolution.createdAt || this._taktUhr(),
                    fitness: initialFitness,
                };
                this.state.dsl.abilities.push(abilityEntry);
                const historyEntry = {
                    id: evolution.name,
                    program: evolution.program,
                    at: this._taktUhr(),
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
            // was der Nexus tat, sagt die Stimme des Felds mit Ort, Ursache und Gesetz (`_feldStimme`); die generische
            // Pool-Zeile („Ich habe etwas verschoben …") nach jeder Evolution war ihr Zwilling und überschrieb sie
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
    // DER STURZ (halten.K5): das Aufprall-Tempo dieses Schritts (`_sturzTempo`, der Leib-Löser misst es im Fang der Landung)
    // kostet Lebenskraft nach dem Gesetz des Leibs (koerper LEIB.sturz: ½(v² − schadlosMs²) × lebenJeJkg, die Energie je kg
    // über der Schwelle der Beine) — hier, im Schritt des EIGENEN Leibs: der Mitspieler-Geist fährt `_stepCharacter` mit dem
    // lokalen Leben (`_lockstepStepGhost`), sein Aufprall wird vor dem Schritt verworfen. Nie aus einer Fall-Höhe; vorher
    // kostete kein Sturz etwas (2–30 m, 6,2–24,2 m/s, 0 Schaden).
    _loopPhysicsSync(delta, currentTime) {
        const s = this.state;
        const [luft, vy] = [s.isInAir === true, s._fieldVy];
        s._sturzTempo = 0;
        this._stepCharacter(delta, currentTime);
        const G = s._sturzTempo > 0 && AnazhRealm.Gesetz("koerper:LEIB.sturz");
        if (G && s._sturzTempo > G.schadlosMs)
            this.damagePlayer(0.5 * (s._sturzTempo ** 2 - G.schadlosMs ** 2) * G.lebenJeJkg, "sturz");
        // DIE LANDUNG als Ereignis für die Leser des Bilds (der Klang, `_schrittKlangTick` — `_sturzTempo` lebt einen Schritt):
        // Luft → Boden mit dem Fang-Tempo des Lösers, Luft → Wasser mit dem Tempo, mit dem der Leib eintrat
        if (luft && s.isInAir !== true)
            s._aufprall = { tempo: s._sturzTempo || Math.max(0, -vy), n: (s._aufprall ? s._aufprall.n : 0) + 1 };
    }

    // ===== FIXED-TIMESTEP SIM/RENDER-SPLIT (Fiedler „Fix Your Timestep!") =====
    // Die SIM (Charakter-Physik + Bewegung) steppt deterministisch bei FIXED_DT → zwei Maschinen
    // steppen identisch (Lockstep-MP, framerate-unabhängig); der RENDER interpoliert einmal/Frame
    // (alpha). EIN Sim-Schritt = `_loopPhysicsSync` + `_loopPlayerMovement(simTime, FIXED_DT)`
    // (+ Replay-Capture) = reine Funktion (state, input, FIXED_DT); `replayRun` reicht kein dtOverride.

    // Der EINE Sim-Schritt (deterministisch, fixed-dt). Die Bewegung SETZT die Velocity aus der Eingabe dieses Schritts, die
    // Physik integriert sie im SELBEN Schritt (leib.K1: die Ordnung Physik → Bewegung trug die Taste erst einen Schritt später
    // in die Lage — 16,7 ms jeder Anfahrt; die Folge der Schritte ist dieselbe, die Eingabe greift einen Schritt früher).
    _stepFixedSim(simTime, dt) {
        this._verbTafelSammeln(); // die Eingabe dieses Schritts: Tastatur und Pad → die Verb-Tafel (leib.K5)
        // die Gier des gerittenen Werks VOR dem Schritt: das Bild dreht den Wagen zwischen ihr und der neuen (`_tickMountedMovement`)
        if (this._mountedEntry) this._mountedEntry._gierVor = this._mountedEntry._rideYaw;
        this._loopPlayerMovement(simTime, dt);
        this._loopPhysicsSync(dt, simTime);
        // Welle L (Q1): der Ritt schreibt Sitz, Ebene, Gier und Federn IM Sim-Schritt (vor der Interpolation).
        this._rittSchritt(dt);
        // ein im Flug verlassener Gesetz-Wagen fällt auf der Vertikale des Kerns, bis er steht (Gegenprüfung 07.10.)
        if (this._fahrLos && this._fahrLos.size) this._fahrNachlauf(dt);
        this._verkehrSchritt(dt); // die Wagen der Städte mit ihren Fahrern (PFLICHT-OFFEN C)
        // DER GESTOSSENE LEIB und LEIB AN LEIB im Sim-Schritt (0710-5): was einen Körper bewegt, läuft im festen Schritt.
        this._kreaturStossSchritt(dt);
        this._leibKontakte();
        this._freiSchritt(dt); // DER FREIE KÖRPER (physik.K3): Kiste, Fass — fallen, stapeln, gestoßen kippen
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
        // prev = die Sim-Position VOR DEM LETZTEN SCHRITT (Fiedler: das Bild liegt zwischen den zwei jüngsten Zuständen, um den
        // Rest des Akkumulators). DIE SIM LÄUFT VORAUS (leib.K1): sie schreitet, solange die Wanduhr vor ihr liegt, und steht
        // danach bis zu einem Schritt vor ihr — das Bild liegt zwischen prev und cur genau auf der Wanduhr. Vorher stand die Sim
        // bis zu einem Schritt hinter der Wanduhr und das Bild noch einen Schritt dahinter: der eigene Leib zeigte jede Taste
        // 16,7 ms zu spät (Radeon, Mess-Wiese, Taste bis 1 cm im Bild: Ego p95 78,2 ms, Third 72,2 ms). Ein Bild ohne Schritt behält sein Paar und gleitet weiter; ein Teleport beginnt ohne Schweif.
        // F1 (Befund des Schöpfers 17.10.: „Third ruckelt horizontal"): prev war die Lage VOR DEM BILD — mit zwei Schritten
        // lag das Bild um zwei Schritte zurück, ohne Schritt sprang es auf den Zustand; der gezeichnete Wagen lief je Bild
        // 0,56–2,3-mal so weit, wie die Physik ihn trug (Spielgang, Null-Renderer, p95 der Abweichung).
        if (!st._fixedPrevPos) st._fixedPrevPos = mesh.position.clone();
        // den Akkumulator füllen — der Takt ist an der Wurzel gedeckelt (`TAKT_DECKEL_S` in startEternalLoop, kein Spiral-of-Death)
        st._fixedAccumulator = (st._fixedAccumulator || 0) + realDt;
        let simTime = Number.isFinite(st._fixedSimTime) ? st._fixedSimTime : currentTime;
        let steps = 0;
        while (st._fixedAccumulator > 0 && steps < AnazhRealm.FIXED_MAX_STEPS) {
            st._fixedPrevPos.copy(mesh.position);
            this._stepFixedSim(simTime, FIXED_DT);
            st._fixedAccumulator -= FIXED_DT;
            simTime += FIXED_DT;
            steps++;
        }
        // bei hartem Cap den Rest-Akkumulator verwerfen (Zeit fallen lassen statt einholen → kein Spiral)
        if (steps >= AnazhRealm.FIXED_MAX_STEPS && st._fixedAccumulator > 0) st._fixedAccumulator = 0;
        st._fixedSimTime = simTime;
        // der Akkumulator liegt in (−FIXED_DT, 0]: die Wanduhr steht um 1 + Rest/FIXED_DT zwischen prev und cur
        st._fixedAlpha = FIXED_DT > 0 ? 1 + st._fixedAccumulator / FIXED_DT : 1;
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
        const a = Math.max(0, Math.min(1, st._fixedAlpha || 0));
        if (st._fixedPrevPos) mesh.position.lerpVectors(st._fixedPrevPos, st._fixedSimPos, a);
        st._bildAlpha = a; // der Rest dieses Bilds — der Ritt im Bild liest ihn EINMAL (`_tickMountedMovement`)
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
    // Größen, die Bewegung + Feld-Schritt deterministisch treiben: die Leib-Felder der Verb-Tafel (analog),
    // der Blick-Yaw und das Zeit-Delta.
    _replayCaptureFrame(delta) {
        const rec = this.state._replayRec;
        if (!rec) return;
        if (rec.frames.length >= AnazhRealm.REPLAY_MAX_FRAMES) {
            this.state._replayRec = null; // Sicherheits-Cap gegen unbegrenztes Wachstum
            return;
        }
        const T = this.state.verbTafel;
        rec.frames.push({
            dt: delta,
            yaw: this.state.yaw,
            vor: T.vor,
            quer: T.quer,
            sprint: T.sprint,
            sprung: T.sprung,
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
        // Die Bewegungs-/Erdungs-Hilfszustände auf den Start eines frischen Leibs (die Werte des Konstruktors), damit zwei
        // Replays vom selben Start bit-gleich laufen (kein Carry-over): die Bewegung liest sie VOR dem ersten Feld-Schritt
        // (leib.K1) — der Sprung-Puffer des Vor-Replays sprang sonst im ersten Schritt des nächsten.
        const frisch = {
            verbTafel: Object.assign({}, s.verbTafel, { rutsch: false, gehalten: {} }),
            _lastMoveT: 0,
            _fieldWasGrounded: false,
            isInAir: false,
            onSteepSlope: false,
            groundNormalY: 1,
            lastGroundedTime: 0,
            isJumping: false,
            _jumpPressedAt: undefined,
            _spaceWasDown: undefined,
            _cWasDown: false,
            _parkourSlide: null,
            _parkourKletter: 0,
            _wandKontaktAt: null,
            playerUnderwater: false,
            playerEyesUnderwater: false,
            _groundedCache: undefined,
            _groundedCachedAt: undefined,
        };
        const gerettet = {};
        for (const k in frisch) ((gerettet[k] = s[k]), (s[k] = frisch[k]));
        let t = 0;
        for (let i = 0; i < rec.frames.length; i++) {
            const f = rec.frames[i];
            Object.assign(s.verbTafel, { vor: f.vor, quer: f.quer, sprint: !!f.sprint, sprung: !!f.sprung });
            s.yaw = f.yaw;
            t += f.dt;
            // die Ordnung des Sim-Schritts (`_stepFixedSim`): erst die Bewegung (setzt die Intent-Velocity dieses
            // Schritts), dann der Feld-Schritt (integriert sie + Kollision).
            this._loopPlayerMovement(t);
            this._stepCharacter(f.dt, t);
            this._rittSchritt(f.dt);
        }
        const end = this._replaySnapshotState();
        Object.assign(s, gerettet);
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
        this._tickBewohner(delta); // die Bewohner der Siedlungen (Meisterkarte mensch.K1)
        this._tickVerkehr(); // wer einsteigt, heimfährt, aussteigt; der Leib am Steuer (PFLICHT-OFFEN C)
        this._vogelTakt(); // die Vögel des Hör-Kreises (Klang K1: jeder Ruf hat einen Leib)
        this._perfSenseLap("creatures", _ct);
        // DER WETTER-ZUG AUF DER WELT-UHR (wetter.K1, feld.K2#2): je `WETTER_ZUG_SEK` (120 s) der Welt-Uhr (`spielZeit`) EIN Zug
        // — er zieht das Wort, das die Welt sich wünscht (`wetterWunsch` — Nexus, seine Gesetze, die Emotion, die Wesen
        // schreiben nie selbst), sonst das Wort der Front am Ort zur Zeit des Zugs (`_wetterAmOrt`: phyto-core wetterAt über
        // Saat, Ort und Uhr), und geht ab DIESER Zeit 45 s über aus dem Wort, das die Front einen Zug vorher am Ort trug: Wetter
        // und Übergang sind eine Funktion von Saat, Ort und Welt-Uhr — zwei Seiten einer Uhr und ein Reload mitten im Sturm
        // stehen im selben Übergang, und der erste Takt einer Seite (Boot, Reload, Beitritt) zieht den laufenden Zug. Bis
        // feld.K2#2 zählte jede Seite ihre Sitzung (`weatherEffectTime`) und ihre Wanduhr. Steht das Wort des Spielers
        // (`wetterWort`), ruht er; der Halt einer Messung verbraucht seinen Zug (danach steht das Wetter bis zum nächsten); er
        // wartet auf die Bühne.
        const st = this.state;
        const Z = AnazhRealm.WETTER_ZUG_SEK;
        const zug = Math.floor(st.spielZeit / Z);
        if (st.wetterWort || zug === this._wetterZug || !this._buehneSteht()) return;
        this._wetterZug = zug;
        if (this._messHalt()) return;
        const wunsch = st.wetterWunsch;
        st.wetterWunsch = null;
        const pm = st.playerMesh;
        const [x, z] = pm ? [pm.position.x, pm.position.z] : [0, 0];
        const next =
            wunsch && wunsch.wort in AnazhRealm.WEATHER_INTENSITY ? wunsch.wort : this._wetterAmOrt(x, z, zug * Z);
        const von = this._wetterAmOrt(x, z, (zug - 1) * Z);
        if (next !== st.weather)
            this.log(`Das Wetter zieht zu ${next}${wunsch ? ` (Wunsch: ${wunsch.quelle})` : ""}`, "INFO");
        else if (wunsch) this.log(`Das Wetter bleibt ${next} (Wunsch: ${wunsch.quelle})`, "INFO");
        if (next !== st.weather || von !== next) this._setWeather(next, "auto-zug", { von, beginn: zug * Z });
    }

    // DIE EINE REGEL DER WELT-UHR (feld.K2#2): eine Uhr von außen — der Stand beim Laden, der Mitspieler in jedem Ort (`pos.w`) —
    // gilt, wenn sie später ist; die Uhr geht nie zurück. So tragen alle Seiten eines Raums die Uhr der ältesten, ohne dass
    // ein Zustand reist: Wetter, Leben, Brand und Nässe folgen ihr als Funktion.
    _weltUhrNimm(t) {
        if (Number.isFinite(t) && t > this.state.spielZeit) this.state.spielZeit = t;
    }

    // DIE UHR DES TAKTS (s): der Stempel, den der Loop jedem Glied als `currentTime` reicht (`_taktZeit`), vor dem ersten Takt
    // die Wanduhr (dieselbe Achse wie der rAF-Stempel). Wer gegen `currentTime` altert (die Geburt einer Welt-Regel, ein
    // geplanter DSL-Schritt, die Evolution des Nexus), wird auf ihr geboren — bis affekt.K3 auf der Wanduhr: unter einem Takt,
    // der schneller geht als die Wand (der Zeitraffer der Linse), verfiel jede Nexus-Regel im ersten Takt nach der Geburt.
    _taktUhr() {
        return this._taktZeit || performance.now() / 1000;
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
        // DER LADE-TAKT (K60, B-Blick): unter dem Ladeschirm arbeitet jeder Job zuerst am Bild der Ankunft (der Ring baut, was sie sieht,
        // `_tickVoxelChunkStreaming`), und keine Drossel des Spiels greift — auch nicht der 4er-Takt der Deko: bis B-Blick nahm der
        // Strom die Frist, und die Streu im Blick lief in 4 Takten einmal mit 2,5 ms (GTX kalt 5,2 → 7,8 s, p3/n2010/blick/f5.txt).
        const lade = this._ladeTakt();
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
                // im Lade-Takt greift keine Drossel (K60): die Deko trägt JEDEN Takt ihren Boden, nie nur jeden 4.
                else if (lade || this._schedFrameNo % 4 === 0) ms = AnazhRealm.FRAME_SCHED_DEKO_FLOOR_MS;
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
    // Drossel-Takt, Gras 1 Chunk je Frame, die Ring-Rampe bis zum Existenz-Boden, drei Fern-Scheiben im Flug — gate:takt T9)
    // schützen den Takt, den der Spieler sieht. Unter dem Ladeschirm hielten sie die
    // Welt fest: Radeon kalt rissen ALLE Frames das Budget, der Takt-Planer gab der Welt 2 ms je Frame, und jeder Leser
    // des ersten Weltbilds lief mit der Frame-Rate des Boots (4–8 Frames je Sekunde) statt mit der Arbeit. Jetzt trägt
    // jeder Lade-Frame LADE_TAKT_MS Arbeit, und keine Drossel des Spiels greift.
    _ladeTakt() {
        const r = this.state.renderer;
        return !this.state._weltbildDa && !(r && r._isHeadlessNull) && this._ladeschirmSteht();
    }

    // DIE FRIST DES LADE-FRAMES (K60-2): EINE je Aufgabe des Event-Loops — der Frame des Loops ist eine, jede Scheibe im
    // eigenen Takt (per setTimeout; bis K5 die Ort-Wahl, heute im Ort-Faden) eine andere; gestellt beim ersten Leser, gelöscht am Ende
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
    // Budget), Nachwuchs des Laubs, Boden-Strom (Stück und ms, keine eigene Uhr) — gate:takt T9 fährt jeden. `frist` false: ein
    // Stück außer dem Bild der Ankunft (B-Blick, der Ring) — es bekommt nur die Kappe, die Frist gehört dem Bild.
    _kappeOffen(n, kappe, frist = true) {
        return n < kappe || (frist && performance.now() < this._ladeFrist());
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
                name: "morphFolge",
                prio: 1, // Welt-Substanz: die Naht eines Nachbarn, dessen Stufe wechselte (`_tickMorphFolge`), nach dem Strom
                run: (ms) => {
                    this._tickMorphFolge(st._frameChunksBuilt ? 0 : Math.min(ms, AnazhRealm.MORPH_FOLGE_MS));
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
                    // erst die Saat der Chunks (`_tickSaat`, mindestens ein Schritt), dann die Zellen und Pflanzungen des Walds
                    this._tickSaat(_wp + ms, null, false, 1);
                    this._tickWaldPlan(ms - (performance.now() - _wp));
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
                    // Scheiben statt atomar (~54 ms).
                    // Headless: budget=Infinity → One-Shot; im Takt mit Terrain-Bau trägt die Deko nur ihren Boden.
                    // Der Lade-Takt (`_ladeTakt`) gibt der Deko das ganze Budget des Lade-Frames, das Gras baut darin.
                    // Im Lade-Takt ist die Deko ein Leser mit Kappe (K60-2): bis zur EINEN Frist des Lade-Frames, mindestens ihr Boden.
                    const lade = this._ladeTakt();
                    const msDeko =
                        st._frameChunksBuilt && !lade ? Math.min(ms, AnazhRealm.FRAME_SCHED_DEKO_FLOOR_MS) : ms;
                    const _dl = !Number.isFinite(msDeko)
                        ? undefined
                        : lade
                          ? Math.max(this._ladeFrist(), performance.now() + AnazhRealm.FRAME_SCHED_DEKO_FLOOR_MS)
                          : performance.now() + Math.min(msDeko, AnazhRealm.SCATTER_SLICE_MS);
                    const _sct = performance.now();
                    this._tickScatterStreaming(playerPos, _dl);
                    this._tickPendingGrass(lade ? Infinity : 1, lade ? _dl : undefined);
                    this._tickScatterRegrow(this._weltStunde());
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
        // DER KARTEN-TAKT (S2: die Karte backt im Welt-Renderer, `_tickKarteWelt`; lazy beim ersten L2-Bedarf
        // enqueued; headless No-op) läuft hier, ungegatet wie sein eigenes
        // Gesetz („EAGER, netto last-senkend"). Bis 04.10. hing er im Deko-Job (prio 2: nur ohne Chunk-Bau im Frame,
        // unter Last jeden 4. Frame) — beim Boot an der Mess-Wiese standen 60 s lang 10 von 11 Karten ungebacken in der
        // Schlange, und jeder Baum, der seine Karte brauchte, blieb als Kapsel-Klumpen stehen (141 Sätze < 64 m).
        this._tickImpostorBake();
        this._tickScatterLod(auge, 4, 160); // V18.464 — der Fernwald folgt der LIVE-Distanz (baum-D1), vom Auge (K36)
        this._tickFernRing(playerPos); // STUFE 2 (das-feld-zeichnet §2) — der Horizont-Tick (headless-default No-op)
        this._tickWegeKarte(playerPos); // Wege-, Kronen- und Fluss-Karte folgen dem Spieler
        this._wegeRaeumen(); // die neuen Flächen eines Dorfs räumen die Natur, die schon auf ihnen stand (K52)
        this._tickSeason(performance.now()); // JAHRESZEIT: die langsame Jahres-Uhr (Foundry-Phaenologie)
        this._tickRain(); // WETTER: sichtbarer Regen bei rainy/stormy (auf der Bild-Uhr)
        this._tickBrand(); // BRAND: das Feuer auf dem Feld, nur in brennenden Zellen (feld.K3#2)
        this._tickCanopyStreaming();
        this._stauFelder(); // der Stau folgt den Werken (ein Bau kam oder fiel; die Edits rechnen ihn sofort)
        this._tickWorldWaterCA();
        this._tickDirtyVoxelChunks(playerPos);
        // `_frameOverBudget` als FOLGE des leeren Budgets (zusätzliches Signal; der Regler setzt
        // es am Frame-Ende weiter aus frameMs — die volle Vereinheitlichung kommt mit dem Default-an).
        if (B.remainingMs() <= 0 && !this._ladeTakt() && st._nachlauf == null) st._frameOverBudget = true;
    }

    _loopVoxelStreaming() {
        // Der Frame-Budget-Scheduler dirigiert die deferrable Streaming-Arbeit: Streaming heilig [prio 0],
        // Wasser [prio 1], Deko [prio 2]; Terrain zuerst über `_dekoWartet` (nie verhungert). EIN Pfad.
        return this._runFrameScheduler(this.state.playerMesh.position);
    }

    // DAS SPEICHERN IM LEERLAUF (fahrt-takt, Lehre 14): der Takt entscheidet nur, dass ein Stand fällig ist; Schnappschuss,
    // JSON und die Schreiber laufen im nächsten Leerlauf-Fenster des Haupt-Fadens (`requestIdleCallback`, Frist 2 s — das
    // Alter eines Stands bleibt ≤ saveInterval + 2 s), nie im Takt. Bis fahrt-takt trug der Takt beides (Radeon GT-Fahrt
    // 20 m/s: _loopAutoSave 5,8 ms an der Mess-Wiese, 9,2 ms am Genesis-Ring je Takt ab p95).
    _loopAutoSave(currentTime) {
        const st = this.state;
        this._standBesen(); // der Besen des Stands backt im Leerlauf vor (`_standFegen`), ab dem ersten Takt
        const lokal = currentTime - st.lastSaveUpdate >= st.saveInterval;
        const server = !st.isServerSaveInFlight && currentTime - st.lastServerSaveUpdate >= st.serverSaveInterval;
        if (lokal) st.lastSaveUpdate = currentTime;
        if (server) {
            st.lastServerSaveUpdate = currentTime;
            st.isServerSaveInFlight = true;
        }
        if (!lokal && !server) return;
        this._imLeerlauf(() => {
            if (lokal) this.saveState(true);
            if (server)
                this.saveToProjectFolder({ fallbackToDownload: false }).finally(() => {
                    st.isServerSaveInFlight = false;
                });
        }, 2000);
    }

    // DER LEERLAUF DES HAUPT-FADENS (Lehre 14): `f` läuft im nächsten Leerlauf-Fenster (`requestIdleCallback`), spätestens
    // nach `fristMs` — nie im Takt; ohne die API im nächsten Task. Leser: das Speichern (`_loopAutoSave`), die Leck-Probe des
    // Flugschreibers (`_flightRecorderTick`).
    _imLeerlauf(f, fristMs) {
        const ric = globalThis.requestIdleCallback;
        if (typeof ric === "function") ric.call(globalThis, f, { timeout: fristMs });
        else setTimeout(f, 0);
    }

    _loopRender() {
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
        // DIE BILD-UHR AM BILD (A9): jede Shader-Zeit dieses Bilds liest die EINE Uhr `_bildZeit` (Sekunden, der Loop schreibt
        // sie je Takt) — Himmel, Wasser (der Flow-Shader scrollt den Schaum stromab nach `aFlow`), Wind und seine Richtung, die
        // Böe und die TSL-`time` des Vendors (die Knoten-Uhr, die seine Animations-Schleife je Frame weiterzählt: der Atem
        // des Fells). Wer ein Bild zeichnet, zeichnet es zur Bild-Uhr; die Bühne hält nur sie.
        const bildZeit = this._bildZeit;
        if (this.state.skyboxUniforms && this.state.skyboxUniforms.time)
            this.state.skyboxUniforms.time.value = bildZeit;
        if (this.state.hydroSurfaceUniforms && this.state.hydroSurfaceUniforms.time)
            this.state.hydroSurfaceUniforms.time.value = bildZeit;
        // DAS LICHT DER WELT am Bild (`_weltLicht`): Spiegel, Wasser, Feld und Panorama lesen die Lichter dieses Bilds
        this._weltLichtTakt();
        const knotenUhr = this.state.renderer && this.state.renderer._nodes && this.state.renderer._nodes.nodeFrame;
        if (knotenUhr) knotenUhr.time = bildZeit;
        // die Böen-Drift am Bild (`_windWob` auf der Bild-Uhr; die Uhr-Wache liest sie)
        this._weatherWob = this._windWob(bildZeit);
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
        // V8.28 6.G4.b D — Wind. uWindTime läuft kontinuierlich; Stärke und Richtung sind der EINE Wind am Auge (`_windAt`:
        // der Wind-Kanal des Wetter-Felds × die Böen-Drift `_weatherWob` × die Form des Geländes; stormy 1.0·AMP, sunny
        // 0.06·AMP, AMP=0.55), auf der Bild-Uhr wie uWindTime; uBend = Spieler/Ritt/nahe Kreaturen (`_tickGrasBend`).
        if (this.state.windUniforms) {
            this.state.windUniforms.uWindTime.value = bildZeit;
            const auge = (this.state.camera || this.state.playerMesh || { position: { x: 0, z: 0 } }).position;
            const w = this._windAt(auge.x, auge.z, bildZeit);
            this.state.windUniforms.uWindStrength.value = w.staerke * AnazhRealm.WEATHER_WIND_AMP;
            if (this.state.windUniforms.uWindDir) this.state.windUniforms.uWindDir.value.set(w.x, w.z);
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
            // der Versatz des Laubs (A3, `_laubVersatz`) gehört der Folge der zeitlichen Auflösung (ihr `setViewOffset`, A3b);
            // ohne die Auflösung 0
            if (_lu.uLaubVersatz && !this.state.traaNode) _lu.uLaubVersatz.value.set(0, 0, 0);
            if (_lu.uLodRef)
                _lu.uLodRef.value =
                    Number.isFinite(this.state.lodRef) && this.state.lodRef > 0 ? +this.state.lodRef : 14;
            if (_lu.uLodMaskOn) _lu.uLodMaskOn.value = this.state.lodMaskOn === false ? 0 : 1;
            if (_lu.uLodAuge && this.state.camera) _lu.uLodAuge.value.copy(this._lodAuge());
            if (_lu.uLodPerf) _lu.uLodPerf.value = this._ankunftsFerne();
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
            const sunDir = this._sonnenRichtung(); // dieselbe Richtungs-Quelle wie Licht/Skybox
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
        if (!this.state._weltbildDa || this.state._nachlauf != null) this._ankunftsBild();
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
// DIE WELT STEHT (`_weltSteht`, A9): so viele Takte ohne Regung und ohne Offenes (die Rundungs-Probe maß mit 30 die Ruhe)
AnazhRealm.WELT_STEHT_TAKTE = 30;
// Fällt der Spieler trotzdem durch (jede Ursache: Remesh-Timing, Teleport, …),
// fängt ihn dieser Boden: unter dem Voxel-Boden (base−floorDrop ≈ −90 m) → zurück
// an die Oberfläche. Bis V17.28 hatten NUR Kreaturen so eine Rettung (y < −50).
AnazhRealm.PLAYER_VOID_Y = -120;

// Determinismus-Bogen P4 (Stufe 1) — Sicherheits-Cap für die Replay-Aufnahme (Frames).
// 18000 ≈ 5 min bei 60 fps — genug für eine echte Spiel-Sequenz, gedeckelt gegen Runaway.
AnazhRealm.REPLAY_MAX_FRAMES = 18000;
