_loopRender(currentTime) {
        // ### Rendering ###
        // DER SATZ (Welle B): alle Chunk-Ein-/Austritte dieses Frames legen ihren Index JETZT, direkt vor dem
        // Zeichnen — ein frei gewordener und im selben Frame neu vergebener Bereich ist nie ungelegt sichtbar.
        this._tickChunkSatz();
        // Skybox-Position DIREKT vor dem Render kopieren (die Kamera ist hier schon aktualisiert).
        // WAHRNEHMUNGS-SENSE: Winkel- + Translations-Geschwindigkeit des Blicks → `_camMotion01` ∈ [0..1];
        // fast-attack, short-decay (~170 ms). Reine Beobachtung; der Perf-Aktuator liest sie.
        if (this.state.camera) {
            const cam = this.state.camera;
            // currentTime ist SEKUNDEN (loop: t/1000). dtS geklemmt: Boden gegen Div-0, Deckel
            // gegen den Riesen-dt eines Tab-Wechsels/ersten Frames (sonst falscher Peak).
            const dtS = this._camMotionLast ? Math.min(0.1, Math.max(0.001, currentTime - this._camMotionLast)) : 0.016;
            this._camMotionLast = currentTime;
            if (!this._camDirPrev) this._camDirPrev = new THREE.Vector3();
            if (!this._camPosPrev) this._camPosPrev = new THREE.Vector3();
            if (!this._camDirTmp) this._camDirTmp = new THREE.Vector3();
            const dir = cam.getWorldDirection(this._camDirTmp);
            let raw = 0;
            if (this._camMotionInit) {
                const dot = Math.max(-1, Math.min(1, dir.dot(this._camDirPrev)));
                const angVel = Math.acos(dot) / dtS; // rad/s Blick-Winkelgeschwindigkeit
                const posVel = cam.position.distanceTo(this._camPosPrev) / dtS; // m/s
                const angN = Math.min(1, angVel / AnazhRealm.PERF_CAM_ANGVEL_FULL);
                const posN = Math.min(1, posVel / AnazhRealm.PERF_CAM_POSVEL_FULL);
                raw = Math.max(angN, posN);
            }
            this._camMotionInit = true;
            this._camDirPrev.copy(dir);
            this._camPosPrev.copy(cam.position);
            const prev = this.state._camMotion01 != null ? this.state._camMotion01 : 0;
            // Fast-Attack (raw sofort), Short-Decay (Zeitkonstante DECAY_MS in ms → dtS×1000):
            const decay = Math.exp((-dtS * 1000) / AnazhRealm.PERF_CAM_MOTION_DECAY_MS);
            this.state._camMotion01 = raw >= prev ? raw : prev * decay;
        }
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
        if (this.state.lodUniforms) {
            const _lu = this.state.lodUniforms;
            if (_lu.uDitherT && this.state.traaNode) _lu.uDitherT.value = (_lu.uDitherT.value + 0.61803398875) % 1;
            if (_lu.uLodRef)
                _lu.uLodRef.value =
                    Number.isFinite(this.state.lodRef) && this.state.lodRef > 0 ? +this.state.lodRef : 14;
            if (_lu.uLodMaskOn) _lu.uLodMaskOn.value = this.state.lodMaskOn === false ? 0 : 1;
            if (_lu.uLodAuge && this.state.camera) this.state.camera.getWorldPosition(_lu.uLodAuge.value);
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
        // Die Kehraus-Marke vor dem Frame: was dieser Frame zeichnet, trägt einen höheren Zähler.
        const zaehlerVor = this._gpuKehrausMarke();
        // Das Szene-RT bleibt für immer auf Skala 1 — kein Laufzeit-Realloc: die Render-Objekte (auch die mit noch
        // offener Pipeline, die Erst-Zeichnung) hängen am Render-Kontext, jeder RT-Realloc zerstört dessen Depth-View
        // (Fehler-Klasse ohne fps-Gewinn). Die statische KLASSEN-PIXEL-KAPPE (Boot-Set) trägt die Auflösungs-
        // Ökonomie; eine Wahrnehmungs-Auflösung nur realloc-frei (Viewport-Scaling).
        // DIE WEICHE: Post-Kette oder Direktpfad — und mit ihr die Leinwand-Tiefe (`_leinwandTiefe`, der EINE Tiefen-Weg).
        let direkt = !pp || this.state.postProcessingFailed === true;
        if (!direkt) {
            this._leinwandTiefe(false);
            try {
                // V18.113 — renderAsync() ist im PR-#81-Vendor deprecated (Warnung
                // in der Schöpfer-Konsole); render() ist der eine Pfad.
                if (this.state.traaNode) this._traaReprojektion();
                if (typeof pp.render === "function") pp.render();
                else pp.renderAsync();
            } catch (err) {
                this.state.postProcessingFailed = true;
                this.log(`Post-Processing-Render scheiterte (${err && err.message}) — direkter Pfad.`, "INFO");
                direkt = true;
            }
        }
        if (direkt) {
            this._leinwandTiefe(true);
            this.state.renderer.render(this.state.scene, this.state.camera);
        }
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