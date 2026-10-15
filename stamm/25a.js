class AnazhRealm_Z25a {
    // ===== ATLAS §25 · HUD/EINSTELLUNGEN — Statusbar · Slider · Hotbar · Settings-Räume =====
    // Welle 6.X.4 D2 (Audit 17.05.2026) — Drei Schieber: Master-Volume,
    // Umgebungsgeräusche, Render-Ring-Radius. Lädt persistierte Werte
    // aus localStorage. Master + Umgebung wirken live auf den Master-Bus und
    // den Bus der Klang-Welt. Render-Ring greift im nächsten worldgen-Tick.
    slidersInitDOM() {
        if (typeof document === "undefined") return;
        // Persistierte Werte laden
        if (typeof localStorage !== "undefined") {
            try {
                const mv = parseFloat(localStorage.getItem("anazh.audio.masterVol"));
                if (Number.isFinite(mv) && mv >= 0 && mv <= 1) this.state.symphony.masterVolume = mv;
                const pv = parseFloat(localStorage.getItem("anazh.audio.pingVol"));
                if (Number.isFinite(pv) && pv >= 0 && pv <= 1) this.state.symphony.creaturePingVolume = pv;
                // V8.15 — TTS-Stimme-Volume separat persistiert.
                const vv = parseFloat(localStorage.getItem("anazh.audio.voiceVol"));
                if (Number.isFinite(vv) && vv >= 0 && vv <= 1) this.state.symphony.voiceVolume = vv;
                const rr = parseInt(localStorage.getItem("anazh.world.ringRadius"), 10);
                if (Number.isFinite(rr) && rr >= 1 && rr <= 12) this.state.chunkRingRadius = rr;
            } catch {
                /* ignore */
            }
        }
        // Helper: Ring-Radius zu Format-String (1 → "3×3", 2 → "5×5", …)
        const ringText = (r) => `${r * 2 + 1}×${r * 2 + 1}`;
        // Master Slider
        const ms = document.getElementById("slider-master");
        const msv = document.getElementById("slider-master-val");
        if (ms) {
            ms.value = String(Math.round((this.state.symphony.masterVolume || 1) * 100));
            if (msv) msv.textContent = `${ms.value}%`;
            ms.addEventListener("input", () => {
                const v = parseFloat(ms.value) / 100;
                this.state.symphony.masterVolume = v;
                if (msv) msv.textContent = `${ms.value}%`;
                // Live-Update wenn Audio-Graph läuft (EIN Mischpult: UMWELT.masterBasis, Wirt und Lab)
                if (this.state.symphony.masterGain) {
                    this.state.symphony.masterGain.gain.value = AnazhRealm._umweltGesetz().UMWELT.masterBasis * v;
                }
                if (typeof localStorage !== "undefined") {
                    try {
                        localStorage.setItem("anazh.audio.masterVol", String(v));
                    } catch {
                        /* ignore */
                    }
                }
            });
        }
        // Pings Slider
        const ps = document.getElementById("slider-pings");
        const psv = document.getElementById("slider-pings-val");
        if (ps) {
            ps.value = String(Math.round((this.state.symphony.creaturePingVolume || 1) * 100));
            if (psv) psv.textContent = `${ps.value}%`;
            ps.addEventListener("input", () => {
                const v = parseFloat(ps.value) / 100;
                this.state.symphony.creaturePingVolume = v;
                // Der Regler IST der Bus der Klang-Welt (Wind · Wasser · Glut · Regen · Vögel · Tier-Rufe).
                const sym = this.state.symphony;
                if (sym.enabled && sym.ctx && sym.umwelt)
                    sym.umwelt.bus.gain.setTargetAtTime(v, sym.ctx.currentTime, 0.1);
                if (psv) psv.textContent = `${ps.value}%`;
                if (typeof localStorage !== "undefined") {
                    try {
                        localStorage.setItem("anazh.audio.pingVol", String(v));
                    } catch {
                        /* ignore */
                    }
                }
            });
        }
        // V8.15 — Voice (TTS) Slider
        const vs = document.getElementById("slider-voice");
        const vsv = document.getElementById("slider-voice-val");
        if (vs) {
            vs.value = String(Math.round((this.state.symphony.voiceVolume || 1) * 100));
            if (vsv) vsv.textContent = `${vs.value}%`;
            vs.addEventListener("input", () => {
                const v = parseFloat(vs.value) / 100;
                this.state.symphony.voiceVolume = v;
                if (vsv) vsv.textContent = `${vs.value}%`;
                if (typeof localStorage !== "undefined") {
                    try {
                        localStorage.setItem("anazh.audio.voiceVol", String(v));
                    } catch {
                        /* ignore */
                    }
                }
            });
        }
        // Ring-Radius Slider
        const rs = document.getElementById("slider-ring");
        const rsv = document.getElementById("slider-ring-val");
        // Welle 6.X.4 — der Ring-Radius-Slider treibt chunkRingRadius, den
        // Pruning-Radius (`_pruneDistantVoxelChunks` liest ihn direkt).
        const applyRingRadius = (v) => {
            this.state.chunkRingRadius = v;
            if (rsv) rsv.textContent = ringText(v);
        };
        if (rs) {
            rs.value = String(this.state.chunkRingRadius || 4);
            applyRingRadius(parseInt(rs.value, 10));
            rs.addEventListener("input", () => {
                // V8.40 — Regler-Bereich 1–8; Welle E (E2): erweitert auf 1–12
                // (3×3 … 25×25). Die fernen Ringe 9–12 sind dank der LOD-Pyramide
                // (E1) billig (LOD2/LOD3) → Weitsicht bis ~518 m ohne FPS-Einbruch.
                const v = Math.max(1, Math.min(12, parseInt(rs.value, 10)));
                applyRingRadius(v);
                if (typeof localStorage !== "undefined") {
                    try {
                        localStorage.setItem("anazh.world.ringRadius", String(v));
                    } catch {
                        /* ignore */
                    }
                }
            });
        }

        // Wald-Perf-Regler: jeder setzt ein kanonisches State-Feld, das der EINE Perf-Regler
        // (`_nexusPerfActuate`) bzw. der SSE-LOD-Leser (`_lodPerceptionDistance`) liest — kein
        // Parallel-Regler; persistiert via Snapshot. Die Sichtweite ist der Ring-Slider (chunkRingRadius).
        // (1) Ziel-FPS: PID-Sollwert `perfTargetMs = 1000/fps`.
        const fpsS = document.getElementById("slider-fpstarget");
        const fpsSv = document.getElementById("slider-fpstarget-val");
        if (fpsS) {
            const pt0 = Number.isFinite(this.state.perfTargetMs) ? this.state.perfTargetMs : AnazhRealm.PERF_TARGET_MS;
            const fps0 = Math.max(30, Math.min(60, Math.round(1000 / pt0 / 5) * 5));
            fpsS.value = String(fps0);
            if (fpsSv) fpsSv.textContent = `${fps0} fps`;
            fpsS.addEventListener("input", () => {
                const fps = Math.max(30, Math.min(60, parseInt(fpsS.value, 10) || 60));
                this.state.perfTargetMs = Math.round(1000 / fps);
                if (fpsSv) fpsSv.textContent = `${fps} fps`;
            });
        }
        // (2) DIE SZENEN-SKALA (K50): die interne Auflösung der Szene (50..100 %), die zeitliche Auflösung löst auf die
        // Ausgabe auf; der neue Wert legt die Ziele im nächsten Frame neu an (`_loopRender`).
        const skS = document.getElementById("slider-szeneskala");
        const skSv = document.getElementById("slider-szeneskala-val");
        if (skS) {
            const sk0 = this.state.szeneSkala == null ? AnazhRealm.SZENE_SKALA : this.state.szeneSkala;
            const pct0 = Math.round(sk0 * 100);
            skS.value = String(pct0);
            if (skSv) skSv.textContent = `${pct0} %`;
            skS.addEventListener("input", () => {
                const pct = Math.max(50, Math.min(100, parseInt(skS.value, 10) || 75));
                this.state.szeneSkala = pct / 100;
                if (skSv) skSv.textContent = `${pct} %`;
            });
        }
        // (3) LOD-Referenz (Vorlage `_lodU.uLodRef`): die Screen-Space-Error-Bezugshöhe
        // `state.lodRef` (Subsystem A's EINE Quelle), die der SSE-LOD-Leser LIVE liest.
        const lodS = document.getElementById("slider-lodref");
        const lodSv = document.getElementById("slider-lodref-val");
        if (lodS) {
            const lr0 = Number.isFinite(this.state.lodRef) ? this.state.lodRef : 14;
            const lv0 = Math.max(4, Math.min(30, Math.round(lr0)));
            lodS.value = String(lv0);
            if (lodSv) lodSv.textContent = `${lv0} m`;
            lodS.addEventListener("input", () => {
                const v = Math.max(4, Math.min(30, parseInt(lodS.value, 10) || 14));
                this.state.lodRef = v;
                if (lodSv) lodSv.textContent = `${v} m`;
            });
        }
        // (4) V18.389 (P5) — der Perf-Panel-Toggle: schaltet das saubere Standalone-Panel
        // (default an). Setzt `state.perfPanel` (persistiert) + spiegelt die Sichtbarkeit sofort.
        const panelCb = document.getElementById("perf-panel-toggle");
        if (panelCb) {
            panelCb.checked = this.state.perfPanel !== false;
            panelCb.addEventListener("change", () => {
                this.state.perfPanel = !!panelCb.checked;
                const div = this._ensurePerfPanelDiv();
                if (div) div.style.display = this.state.perfPanel ? "block" : "none";
            });
        }
        // V18.472 — der Perf-Export-Button (unter dem Panel-Toggle): lädt den
        // Flugschreiber-Trace (+ Sekunden-Ring) als .json herunter — die Datei,
        // die der Schöpfer im Chat zustellt. EINE Quelle (_flightRecorderBuildTrace).
        const expBtn = document.getElementById("perf-export-btn");
        if (expBtn) {
            expBtn.addEventListener("click", () => {
                const r2 = this._exportPerfTrace();
                const st2 = document.getElementById("perf-export-status");
                if (st2)
                    st2.textContent = r2
                        ? `${r2.name} (${Math.round(r2.bytes / 1024)} kB)`
                        : "noch keine Daten — erst ein paar Sekunden spielen";
            });
        }

        // Welle 6.G3 (V8.24) — Tag-Nacht-Slider + Tageszeit-Slider.
        // Tag-Länge: 1-60 Min. Tageszeit: 0-1000 (skaliert auf 0..1, drei
        // Nachkomma-Stellen-Präzision damit Drag smooth fühlt).
        const dl = document.getElementById("slider-daylength");
        const dlVal = document.getElementById("slider-daylength-val");
        if (dl) {
            // Persistierte Tag-Länge aus localStorage einlesen (Init).
            try {
                if (typeof localStorage !== "undefined") {
                    const stored = localStorage.getItem("anazh.dayLengthMinutes");
                    if (stored) {
                        const v = Math.max(
                            this.constructor.DAY_LENGTH_MIN_MINUTES,
                            Math.min(
                                this.constructor.DAY_LENGTH_MAX_MINUTES,
                                parseInt(stored, 10) || this.constructor.DAY_LENGTH_DEFAULT_MINUTES
                            )
                        );
                        this.state.dayLengthMinutes = v;
                    }
                }
            } catch (e) {
                void e;
            }
            dl.value = String(this.state.dayLengthMinutes || this.constructor.DAY_LENGTH_DEFAULT_MINUTES);
            if (dlVal) dlVal.textContent = `${dl.value} Min`;
            dl.addEventListener("input", () => {
                const v = parseInt(dl.value, 10);
                this.setDayLength(v);
                if (dlVal) dlVal.textContent = `${v} Min`;
            });
        }

        const tod = document.getElementById("slider-timeofday");
        const todVal = document.getElementById("slider-timeofday-val");
        if (tod) {
            // Der Regler zeigt die Welt-Zeit (`_uhrAnzeigen`, im Gang der Uhr) und stellt sie als Hand des Spielers.
            this._tageszeitRegler = { tod, todVal };
            this._uhrAnzeigen(typeof this.state.timeOfDay === "number" ? this.state.timeOfDay : 0.5);
            tod.addEventListener("input", () => {
                this.setTimeOfDay(parseInt(tod.value, 10) / 1000, "regler");
            });
        }

        // V13.9 — Wasser-Cull-Slider (uMinDepth). Range 0..200 → minDepth
        // 0..0.02 (Schritt 0.0001), feinfühlig im dünnen Lineardepth-Bereich.
        const wcS = document.getElementById("slider-watercull");
        const wcVal = document.getElementById("slider-watercull-val");
        if (wcS) {
            const w0 =
                this.state.atmosphere && Number.isFinite(this.state.atmosphere.waterCull)
                    ? this.state.atmosphere.waterCull
                    : 0.0025;
            wcS.value = String(Math.round(w0 * 10000));
            if (wcVal) wcVal.textContent = w0.toFixed(4);
            wcS.addEventListener("input", () => {
                const raw = parseInt(wcS.value, 10) / 10000;
                const v = this.setWaterCull(raw);
                if (wcVal) wcVal.textContent = v.toFixed(4);
            });
        }
        // V18.15 Phase 3 — See-Wellen (uLakeRipple 0..1, Slider ×100).
        const lrS = document.getElementById("slider-lakeripple");
        const lrVal = document.getElementById("slider-lakeripple-val");
        if (lrS) {
            const r0 =
                this.state.atmosphere && Number.isFinite(this.state.atmosphere.waterLakeRipple)
                    ? this.state.atmosphere.waterLakeRipple
                    : 0.2;
            lrS.value = String(Math.round(r0 * 100));
            if (lrVal) lrVal.textContent = r0.toFixed(2);
            lrS.addEventListener("input", () => {
                const v = this.setLakeRipple(parseInt(lrS.value, 10) / 100);
                if (lrVal) lrVal.textContent = v.toFixed(2);
            });
        }
        // V18.14 M1 — Fluss-Schaum-Tiefe (uDepthFoam, m): Schaum nur bis dieser ECHTEN Tiefe.
        const dfS = document.getElementById("slider-waterdepthfoam");
        const dfVal = document.getElementById("slider-waterdepthfoam-val");
        if (dfS) {
            const f0 =
                this.state.atmosphere && Number.isFinite(this.state.atmosphere.waterDepthFoam)
                    ? this.state.atmosphere.waterDepthFoam
                    : 1.2;
            dfS.value = String(Math.round(f0 * 10));
            if (dfVal) dfVal.textContent = f0.toFixed(1) + " m";
            dfS.addEventListener("input", () => {
                const v = this.setWaterDepthFoam(parseInt(dfS.value, 10) / 10);
                if (dfVal) dfVal.textContent = v.toFixed(1) + " m";
            });
        }
        // Kavitäts-AO (0..200 % → aoScale 0..2) + Kanten-Schärfe (0..100 → local-contrast 0..1);
        // Live-Wert im Label.
        const aoS = document.getElementById("slider-cavityao");
        const aoVal = document.getElementById("slider-cavityao-val");
        if (aoS) {
            const a0 =
                this.state.atmosphere && Number.isFinite(this.state.atmosphere.cavityAO)
                    ? this.state.atmosphere.cavityAO
                    : 1.0;
            aoS.value = String(Math.round(a0 * 100));
            if (aoVal) aoVal.textContent = `${Math.round(a0 * 100)} %`;
            aoS.addEventListener("input", () => {
                const pct = parseInt(aoS.value, 10);
                this.setCavityAO(pct / 100);
                if (aoVal) aoVal.textContent = `${pct} %`;
            });
        }
        // Cel-Kontrast (Stufen-Spreizung), Mikro-Struktur (Textur) + Terrain-Nacht-Boden als Live-Regler.
        const mtS = document.getElementById("slider-microtex");
        const mtVal = document.getElementById("slider-microtex-val");
        if (mtS) {
            const m0 =
                this.state.atmosphere && Number.isFinite(this.state.atmosphere.microStrength)
                    ? this.state.atmosphere.microStrength
                    : (AnazhRealm.AERIAL && AnazhRealm.AERIAL.microStrength) || 0.1;
            mtS.value = String(Math.round(m0 * 100));
            if (mtVal) mtVal.textContent = m0.toFixed(2);
            mtS.addEventListener("input", () => {
                const v = parseInt(mtS.value, 10) / 100;
                this.setMicroStrength(v);
                if (mtVal) mtVal.textContent = v.toFixed(2);
            });
        }
        // V18.210 (§1-A2) — der R5-STRUKTUR-BOOST-Slider „Struktur-Tiefe"
        // (Default 1.3, Range 0.5..2.5 via input 50..250, multipliziert das
        // micro-Gewicht für Strukturen — das LEBT, kein V18.65-Knopf-ohne-Loop).
        const stbS = document.getElementById("slider-structureboost");
        const stbVal = document.getElementById("slider-structureboost-val");
        if (stbS) {
            const s0 =
                this.state.atmosphere && Number.isFinite(this.state.atmosphere.r5StructureBoost)
                    ? this.state.atmosphere.r5StructureBoost
                    : (AnazhRealm.R5_STRUCTURE_TEXTURE && AnazhRealm.R5_STRUCTURE_TEXTURE.microBoost) || 1.3;
            stbS.value = String(Math.round(s0 * 100));
            if (stbVal) stbVal.textContent = s0.toFixed(2);
            stbS.addEventListener("input", () => {
                const v = parseInt(stbS.value, 10) / 100;
                this.setStructureBoost(v);
                if (stbVal) stbVal.textContent = v.toFixed(2);
            });
        }
        const nfS = document.getElementById("slider-nightfloor");
        const nfVal = document.getElementById("slider-nightfloor-val");
        if (nfS) {
            const n0 =
                this.state.atmosphere && Number.isFinite(this.state.atmosphere.terrainNightFloor)
                    ? this.state.atmosphere.terrainNightFloor
                    : AnazhRealm.SUBSTANCE_RESPONSE.nightFloor;
            nfS.value = String(Math.round(n0 * 100));
            if (nfVal) nfVal.textContent = n0.toFixed(2);
            nfS.addEventListener("input", () => {
                const v = parseInt(nfS.value, 10) / 100;
                this.setTerrainNightFloor(v);
                if (nfVal) nfVal.textContent = v.toFixed(2);
            });
        }
        // §7.5(a) (V18.164) — das Terrain-Mond-Rim (Basis; der Tag-Nacht-Sync
        // treibt den Live-Wert: nachts Basis, tags 0).
        const mrS = document.getElementById("slider-moonrim");
        const mrVal = document.getElementById("slider-moonrim-val");
        if (mrS) {
            const r0 =
                this.state.atmosphere && Number.isFinite(this.state.atmosphere.moonRim)
                    ? this.state.atmosphere.moonRim
                    : AnazhRealm.SUBSTANCE_RESPONSE.moonRim;
            mrS.value = String(Math.round(r0 * 100));
            if (mrVal) mrVal.textContent = r0.toFixed(2);
            mrS.addEventListener("input", () => {
                const v = parseInt(mrS.value, 10) / 100;
                this.setTerrainMoonRim(v);
                if (mrVal) mrVal.textContent = v.toFixed(2);
            });
        }
        const esS = document.getElementById("slider-edgesharp");
        const esVal = document.getElementById("slider-edgesharp-val");
        if (esS) {
            const e0 =
                this.state.atmosphere && Number.isFinite(this.state.atmosphere.edgeSharp)
                    ? this.state.atmosphere.edgeSharp
                    : 0.5;
            esS.value = String(Math.round(e0 * 100));
            if (esVal) esVal.textContent = e0.toFixed(2);
            esS.addEventListener("input", () => {
                const pct = parseInt(esS.value, 10);
                const v = this.setEdgeSharp(pct / 100);
                if (esVal) esVal.textContent = v.toFixed(2);
            });
        }
        const txS = document.getElementById("slider-surftex");
        const txVal = document.getElementById("slider-surftex-val");
        if (txS) {
            const t0 =
                this.state.atmosphere && Number.isFinite(this.state.atmosphere.triplanar)
                    ? this.state.atmosphere.triplanar
                    : 1.0;
            txS.value = String(Math.round(t0 * 100));
            if (txVal) txVal.textContent = `${Math.round(t0 * 100)} %`;
            txS.addEventListener("input", () => {
                const pct = parseInt(txS.value, 10);
                this.setSurfaceTexture(pct / 100);
                if (txVal) txVal.textContent = `${pct} %`;
            });
        }
        const cvS = document.getElementById("slider-colorvar");
        const cvVal = document.getElementById("slider-colorvar-val");
        if (cvS) {
            const c0 =
                this.state.atmosphere && Number.isFinite(this.state.atmosphere.colorVar)
                    ? this.state.atmosphere.colorVar
                    : 1.0;
            cvS.value = String(Math.round(c0 * 100));
            if (cvVal) cvVal.textContent = `${Math.round(c0 * 100)} %`;
            cvS.addEventListener("input", () => {
                const pct = parseInt(cvS.value, 10);
                this.setColorVariation(pct / 100);
                if (cvVal) cvVal.textContent = `${pct} %`;
            });
        }
        // Schatten-Reichweite (Frustum-Halbbreite 80..400 m; kleiner = schärfere Texel) + Schatten-Bias
        // (der Hebel auf das Gesetz `_schattenBias` ×100, 0..3; 1 = das Gesetz). Das Wandern heilt der Light-Space-Snap; diese
        // Regler feilen die Schärfe.
        const srS = document.getElementById("slider-shadowrange");
        const srVal = document.getElementById("slider-shadowrange-val");
        if (srS) {
            const s0 =
                this.state.atmosphere && Number.isFinite(this.state.atmosphere.shadowRange)
                    ? this.state.atmosphere.shadowRange
                    : 300;
            srS.value = String(Math.round(s0));
            if (srVal) srVal.textContent = `${Math.round(s0)} m`;
            srS.addEventListener("input", () => {
                const v = this.setShadowRange(parseInt(srS.value, 10));
                if (srVal) srVal.textContent = `${Math.round(v)} m`;
            });
        }
        const sbS = document.getElementById("slider-shadowbias");
        const sbVal = document.getElementById("slider-shadowbias-val");
        if (sbS) {
            const b0 =
                this.state.atmosphere && Number.isFinite(this.state.atmosphere.shadowBias)
                    ? this.state.atmosphere.shadowBias
                    : 1.0;
            sbS.value = String(Math.round(b0 * 100));
            if (sbVal) sbVal.textContent = b0.toFixed(2);
            sbS.addEventListener("input", () => {
                const v = this.setShadowBias(parseInt(sbS.value, 10) / 100);
                if (sbVal) sbVal.textContent = v.toFixed(2);
            });
        }
    }

    // Begleiter-Stimme-Auswahl aus den SpeechSynthesis-Stimmen: getVoices() lädt async (erst leer),
    // `voiceschanged` füllt nach. Die aktuelle Wahl bleibt erhalten, auch wenn die Stimme noch fehlt.
    _populateCompanionVoiceSelect() {
        if (typeof document === "undefined" || typeof window === "undefined") return;
        if (!("speechSynthesis" in window)) return;
        const sel = document.getElementById("companion-voice");
        if (!sel) return;
        const voices = window.speechSynthesis.getVoices() || [];
        const current = this.state.grok.companionVoice || "";
        sel.textContent = "";
        const def = document.createElement("option");
        def.value = "";
        def.textContent = "Standard (Browser)";
        sel.appendChild(def);
        for (const v of voices) {
            const opt = document.createElement("option");
            opt.value = v.name;
            opt.textContent = `${v.name} (${v.lang})`;
            sel.appendChild(opt);
        }
        sel.value = current;
    }

    // Lädt persistierte Werte aus localStorage und bindet die Inputs an die
    // state-Felder. Name + Voice werden im LLM-System-Prompt bzw. im
    // `companion-say`-Voice-Sync (W11 P4) referenziert.
    identityInitDOM() {
        if (typeof document === "undefined") return;
        // Begleiter-Name: aus localStorage laden, sonst Default „Grok".
        if (typeof localStorage !== "undefined") {
            try {
                const cn = localStorage.getItem("anazh.companion.name");
                if (cn && cn.trim()) this.state.grok.companionName = cn.trim().slice(0, 32);
                const pn = localStorage.getItem("anazh.player.name");
                if (pn && pn.trim()) this.state.player.name = pn.trim().slice(0, 32);
                const cv = localStorage.getItem("anazh.companion.voice");
                if (cv) this.state.grok.companionVoice = cv.slice(0, 80);
            } catch {
                /* ignore */
            }
        }
        const companionInput = document.getElementById("companion-name-input");
        const playerInput = document.getElementById("player-name-input");
        if (companionInput) {
            companionInput.value = this.state.grok.companionName || "Grok";
            companionInput.addEventListener("input", () => {
                const v = (companionInput.value || "").trim().slice(0, 32) || "Grok";
                this.state.grok.companionName = v;
                if (typeof localStorage !== "undefined") {
                    try {
                        localStorage.setItem("anazh.companion.name", v);
                    } catch {
                        /* ignore */
                    }
                }
            });
        }
        if (playerInput) {
            playerInput.value = this.state.player.name || "Schöpfer";
            playerInput.addEventListener("input", () => {
                const v = (playerInput.value || "").trim().slice(0, 32) || "Schöpfer";
                this.state.player.name = v;
                if (typeof localStorage !== "undefined") {
                    try {
                        localStorage.setItem("anazh.player.name", v);
                    } catch {
                        /* ignore */
                    }
                }
            });
        }
        // W11 Phase 4 — Begleiter-Stimme-Auswahl (SpeechSynthesis-Voice).
        // voiceschanged füllt die Liste nach (getVoices ist async; im
        // Headless bleibt sie leer — nur die Default-Option).
        const voiceSel = document.getElementById("companion-voice");
        if (voiceSel && typeof window !== "undefined" && "speechSynthesis" in window) {
            this._populateCompanionVoiceSelect();
            window.speechSynthesis.addEventListener("voiceschanged", () => this._populateCompanionVoiceSelect());
            voiceSel.addEventListener("change", () => {
                const v = (voiceSel.value || "").slice(0, 80);
                this.state.grok.companionVoice = v;
                if (typeof localStorage !== "undefined") {
                    try {
                        localStorage.setItem("anazh.companion.voice", v);
                    } catch {
                        /* ignore */
                    }
                }
            });
        }
    }

    // Welle 6.X.2 B1 (Audit 17.05.2026) + V8.14 Erweiterung — Logbuch-Toggle.
    //
    // **Zwei Schichten** (V8.14):
    // 1. Section-Visibility (`#console-log-section.hidden`): steuert ob das
    //    Logbuch-Section überhaupt im Konsole-Drawer erscheint. Default
    //    sichtbar, Spieler kann es global in Einstellungen ausblenden.
    // 2. Log-Expanded (`#log.hidden`): innerhalb der Section steuert das
    //    Logbuch selbst (das eigentliche Log-Stream). Default eingeklappt
    //    damit Chat im Fokus bleibt. Click auf Konsole-Label expanded.
    //
    // Beide State-Werte synchronisieren über `localStorage`. Der Einstellungen-
    // Toggle steuert „expanded" (sync mit Konsole-Toggle). Die Section bleibt
    // immer sichtbar — Spieler kann sie im DOM finden und expandieren.
    logbookInitDOM() {
        if (typeof document === "undefined") return;
        let expanded = false;
        if (typeof localStorage !== "undefined") {
            const raw = localStorage.getItem("anazh.logbookVisible");
            if (raw === "1" || raw === "true") expanded = true;
        }
        this.state.logbookVisible = expanded;
        const section = document.getElementById("console-log-section");
        const logEl = document.getElementById("log");
        const cb = document.getElementById("logbook-toggle");
        const inlineBtn = document.getElementById("console-log-toggle");
        // Section bleibt sichtbar; nur das Log selbst togglet (V8.14 Vision).
        if (section) section.hidden = false;
        const applyExpanded = (value) => {
            this.state.logbookVisible = !!value;
            if (logEl) logEl.hidden = !value;
            if (inlineBtn) inlineBtn.setAttribute("aria-expanded", value ? "true" : "false");
            if (cb) cb.checked = !!value;
            if (typeof localStorage !== "undefined") {
                try {
                    localStorage.setItem("anazh.logbookVisible", value ? "1" : "0");
                } catch {
                    /* ignore */
                }
            }
        };
        applyExpanded(expanded);
        if (cb) {
            cb.addEventListener("change", () => applyExpanded(!!cb.checked));
        }
        if (inlineBtn) {
            inlineBtn.addEventListener("click", () => {
                applyExpanded(!this.state.logbookVisible);
            });
        }
    }

    // Keybindings-UI: je Aktion Label, aktuelle Taste, „Ändern"-Button → Rebind-Capture (die nächste
    // Taste oder Maus-Taste bindet); Reset stellt die Defaults her.
    keybindingsInitDOM() {
        if (typeof document === "undefined") return;
        const section = document.getElementById("keybindings-section");
        if (!section) return;
        const list = section.querySelector("#keybindings-list");
        const resetBtn = section.querySelector("#keybindings-reset");
        if (!list) return;
        list.innerHTML = "";
        for (const action of AnazhRealm.KEYBINDING_ACTIONS) {
            const row = document.createElement("div");
            row.className = "keybind-row";
            row.dataset.action = action;
            const label = document.createElement("span");
            label.className = "keybind-label";
            label.textContent = AnazhRealm.KEYBINDING_LABELS[action] || action;
            const btn = document.createElement("button");
            btn.type = "button";
            btn.className = "keybind-rebind";
            btn.dataset.action = action;
            btn.addEventListener("click", () => {
                if (this.state.keybindRebind && this.state.keybindRebind.action === action) {
                    this.cancelKeybindRebind();
                } else {
                    this.beginKeybindRebind(action);
                }
            });
            row.appendChild(label);
            row.appendChild(btn);
            list.appendChild(row);
        }
        if (resetBtn) {
            resetBtn.addEventListener("click", () => {
                this.resetKeybindings();
            });
        }
        this._renderKeybindingsUI();
    }

    // Pretty-Format eines Codes für Anzeige im Button. „KeyF" → „F",
    // „Mouse0" → „Linke Maustaste", „Space" → „Leertaste", etc.
    _formatBindingCode(code) {
        if (!code) return "—";
        if (code === "Mouse0") return "Linke Maustaste";
        if (code === "Mouse1") return "Mittlere Maustaste";
        if (code === "Mouse2") return "Rechte Maustaste";
        if (code === "Space") return "Leertaste";
        if (code === "Tab") return "Tab";
        if (code === "Escape") return "Esc";
        if (code.startsWith("Key")) return code.slice(3);
        if (code.startsWith("Digit")) return code.slice(5);
        if (code.startsWith("Arrow"))
            return "↑↓←→".charAt(["Up", "Down", "Left", "Right"].indexOf(code.slice(5))) || code;
        return code;
    }

    _renderKeybindingsUI() {
        if (typeof document === "undefined" || !this.state.keybindings) return;
        const section = document.getElementById("keybindings-section");
        if (!section) return;
        const rb = this.state.keybindRebind;
        for (const action of AnazhRealm.KEYBINDING_ACTIONS) {
            const btn = section.querySelector(`button.keybind-rebind[data-action="${action}"]`);
            if (!btn) continue;
            if (rb && rb.action === action) {
                btn.textContent = "Drücke Taste…";
                btn.classList.add("rebinding");
            } else {
                btn.textContent = this._formatBindingCode(this.state.keybindings[action]);
                btn.classList.remove("rebinding");
            }
        }
    }

    cameraModeInitDOM() {
        const toggle = document.getElementById("camera-mode-toggle");
        if (!toggle) return;
        const stored = (() => {
            try {
                return localStorage.getItem("anazhRealmCameraMode");
            } catch {
                return null;
            }
        })();
        const initial = stored === "third" ? "third" : "first";
        this.setCameraMode(initial);
        toggle.addEventListener("click", () => {
            this.setCameraMode(this.state.cameraMode === "third" ? "first" : "third");
        });
    }

    playerSoulInitDOM() {
        const select = document.getElementById("player-soul-select");
        if (!select) return;
        this._refreshSoulSelect();
        select.addEventListener("change", () => {
            const v = select.value;
            // V17.74 Welle 1b — ein role:"soul"-Bauplan (noch kein registrierter Soul) → VERKÖRPERN
            // (embodyBlueprint formt ihn, zahlt pfad/frieden); eine Built-in/Custom-Seele → frei tragen.
            const bp = this.state.blueprints && this.state.blueprints[v];
            const isSoulBlueprint =
                bp &&
                bp.role === "soul" &&
                !(this.playerSoulDefs[v] || (this.state.customSouls && this.state.customSouls[v]));
            if (isSoulBlueprint) {
                const result = this.embodyBlueprint(v);
                if (!result.ok) {
                    if (result.reason === "not_enough_material") {
                        const missingStr = Object.entries(result.missing || {})
                            .map(([m, n]) => `${n}× ${m}`)
                            .join(", ");
                        this.log(
                            `Avatar „${bp.label || v}" formen — es fehlt ${missingStr || "Material"} (⚒ Werkstatt).`,
                            "ERROR"
                        );
                    } else {
                        this.log(`Verkörpern fehlgeschlagen: ${result.reason}`, "ERROR");
                    }
                    // V17.75 — der Fehlschlag (z.B. kein Material) → das Select auf die WIRKLICHE Seele
                    // zurücksetzen (sonst zeigt es den Wächter, während der Avatar der alte bleibt — der Bug).
                    select.value = this.state.player.soul;
                } else {
                    this._refreshSoulSelect(); // den neuen customSoul aufnehmen + selektieren
                }
            } else {
                this.applyPlayerSoul(v);
            }
        });
        // Status-Bar mit Default beschriften, falls vorhanden.
        const status = document.getElementById("status-soul");
        if (status) {
            const cur = this._getSoulDef(this.state.player.soul || "human");
            status.textContent = (cur && cur.label) || "—";
        }
        // Equipment-Sektion initial rendern (die Stats zeigt das Spec-Sheet `_ichBuildSpecSheet`).
        if (typeof this.renderPlayerEquipUI === "function") this.renderPlayerEquipUI();
    }

    // Equipment-UI im Ich-Drawer (#player-equip).
    renderPlayerEquipUI() {
        if (typeof document === "undefined") return;
        const container = document.getElementById("player-equip");
        if (!container) return;
        container.innerHTML = "";
        // Nur die Schnell-Trünke (Gebrauch, kein Crafting; leer = unsichtbar): das gehaltene Gerät wechselt
        // über Hotbar/Rezeptbuch (wieldBlueprint), die Rüstung im Slot (_renderInventoryEquip), die
        // Intent-Akte leben in der Werkstatt — kein Parallel-Pfad.
        this._equipAppendConsumablesSection(container);
    }

    // Teilt eigene Baupläne in Rüstung / Waffe / Markier-Kandidat. Kandidat bleibt auch ein schon
    // markierter Bauplan (roleManual) — sonst verschwände er und ließe sich nicht mehr umwidmen.
    _equipPartitionEquipBlueprints() {
        const armorBlueprints = [];
        const weaponBlueprints = [];
        const candidateBlueprints = [];
        for (const name of Object.keys(this.state.blueprints || {})) {
            const bp = this.state.blueprints[name];
            if (!bp) continue;
            // V17.74 Welle 1b — Rüstung wird nach ROLLE gelistet (Built-in-Bibliothek INKLUSIVE) → die
            // GEBRAUCHS-Fläche erkennt eine craftbare Beispiel-Rüstung (ruestung_brustpanzer), nicht nur
            // eigene Baupläne. Andere Built-ins (Strukturen) sind keine Markier-/Tragen-Kandidaten.
            if (bp.role === "armor") armorBlueprints.push(name);
            else if (bp.builtIn) continue;
            else if (bp.role === "weapon") weaponBlueprints.push(name);
            else candidateBlueprints.push(name);
        }
        return { armorBlueprints, weaponBlueprints, candidateBlueprints };
    }

    // Nur die DSL-TABELLEN-Konsumables (kein Bauplan → nicht im Rezeptbuch). Trank-Baupläne
    // (role:consumable) braut + trinkt man im Rezeptbuch (renderRecipeBook, kind=drink) — kein Duplikat.
    _equipAppendConsumablesSection(container) {
        const tableConsumables = Object.keys(this.state.consumables || {});
        if (tableConsumables.length === 0) return;
        const consumableHeader = document.createElement("div");
        consumableHeader.className = "equip-mark-header";
        consumableHeader.textContent = "Schnell-Trünke (Tabelle):";
        container.appendChild(consumableHeader);
        for (const name of tableConsumables) {
            const c = this.state.consumables[name];
            const row = document.createElement("div");
            row.className = "equip-mark-row";
            const label = document.createElement("span");
            label.className = "equip-mark-label";
            label.textContent = `${c.label || name} (${c.durationSeconds} s, Tabelle)`;
            row.appendChild(label);
            const drinkBtn = document.createElement("button");
            drinkBtn.type = "button";
            drinkBtn.textContent = "Trinken";
            drinkBtn.addEventListener("click", () => {
                const result = this.activateConsumable(name);
                if (!result.ok) this.log(`activateConsumable: ${result.reason}`, "ERROR");
            });
            row.appendChild(drinkBtn);
            container.appendChild(row);
        }
    }

    // Welle 6.D Etappe 1.6 — Soul-Select neu befüllen (Built-ins + Custom).
    // Wird sowohl beim Init aufgerufen als auch nach jedem define_soul, damit
    // neue Custom-Seelen ohne Reload im Dropdown erscheinen.
    _refreshSoulSelect() {
        if (typeof document === "undefined") return;
        const select = document.getElementById("player-soul-select");
        if (!select) return;
        const previous = select.value;
        select.innerHTML = "";
        // Die primäre Körper-Sicht ist das STUDIO-BUCH: zuoberst die „Studio-Wesen"-Gruppe (mensch +
        // wolf/fox/bear/deer). Die Alt-Doppel (koerper_*, donorOnly) bleiben als Werte/Aliase funktional
        // (der Tier-Eintrag trägt den koerper_<tier>-Wert, derselbe embody-Pfad), aber ohne eigene Zeile.
        const seen = new Set();
        const addOpt = (parent, value, text, title) => {
            const opt = document.createElement("option");
            opt.value = value;
            opt.textContent = text;
            if (title) opt.title = title;
            parent.appendChild(opt);
            seen.add(value);
            return opt;
        };
        const gStudio = document.createElement("optgroup");
        gStudio.label = "Studio-Wesen";
        // (1) mensch — die gegebene Identität (koerperstudio); die Studio-Übergabe
        // (state.studioUebergabe.koerper) ist SICHTBAR am Eintrag (✦ Studio-Gestalt).
        const ueK = this.state.studioUebergabe && this.state.studioUebergabe.koerper;
        addOpt(
            gStudio,
            "human",
            ueK ? "mensch ✦ Studio-Gestalt" : "mensch",
            "koerperstudio — dein Menschen-Körper" + (ueK ? " (trägt die Live-Übergabe aus dem Studio)" : "")
        );
        // (2) die vier Gattungen des tetrapoda-Buchs, mit ihren Studio-Namen. Verkörpert
        // (bp_koerper_<tier> als customSoul) → freier Wechsel; sonst der embody-Wert
        // (koerper_<tier>) mit Kosten-Marker — derselbe change-Handler wie immer.
        const SM = AnazhRealm.TETRAPODA_SOUL_MAP || {};
        for (const soulKey of Object.keys(SM)) {
            const studioName = SM[soulKey]; // deer · wolf · fox · bear
            const bpName = `koerper_${soulKey}`;
            if (this.state.customSouls && this.state.customSouls[`bp_${bpName}`]) {
                addOpt(
                    gStudio,
                    `bp_${bpName}`,
                    `${studioName} ✦`,
                    `tetrapoda — ${studioName} (verkörpert, freier Wechsel)`
                );
            } else if (this.state.blueprints && this.state.blueprints[bpName]) {
                const opt = addOpt(gStudio, bpName, studioName + " ⚒" + this._makeActCostSuffix(bpName));
                opt.title = this._blueprintCostTooltip(bpName);
            }
        }
        select.appendChild(gStudio);
        for (const key of Object.keys(this.playerSoulDefs)) {
            if (seen.has(key)) continue;
            addOpt(select, key, this.playerSoulDefs[key].label);
        }
        if (this.state.customSouls) {
            for (const key of Object.keys(this.state.customSouls)) {
                if (seen.has(key)) continue;
                addOpt(select, key, this.state.customSouls[key].label + " ✦");
            }
        }
        // Listet auch noch nicht verkörperte role:"soul"-Baupläne (inkl. Built-in-Bibliothek) zum
        // Verkörpern; schon verkörperte (bp_<name> als customSoul) stehen oben — kein Doppel.
        // ⚒ = Bauplan-Avatar. Alt-Doppel (donorOnly) erscheinen hier nicht.
        const blu = this.state.blueprints || {};
        for (const name of Object.keys(blu)) {
            const bp = blu[name];
            if (!bp || bp.role !== "soul" || !Array.isArray(bp.parts) || !bp.parts.length) continue;
            if (seen.has(name) || bp.donorOnly) continue;
            if (this.state.customSouls && this.state.customSouls[`bp_${name}`]) continue; // schon verkörpert
            const opt = addOpt(select, name, (bp.label || name) + " ⚒" + this._makeActCostSuffix(name));
            opt.title = this._blueprintCostTooltip(name);
        }
        const desired = previous || this.state.player.soul || "human";
        // Wenn die zuvor gewählte Option weg ist (z. B. Custom gelöscht),
        // fall back auf die aktuell aktive Seele.
        if ([...select.options].some((o) => o.value === desired)) {
            select.value = desired;
        } else if (this.state.player.soul) {
            select.value = this.state.player.soul;
        }
    }

    // _el — der EINE deklarative DOM-Builder, `_el(tag, attrs, ...children)`:
    // attrs.class→className · text→textContent · html→innerHTML · style→Object.assign(style) ·
    // data→dataset · on→{event:handler} · onClick/onInput/…→addEventListener ·
    // Keys mit „-" oder role→setAttribute · Rest→Property.
    // children: String→TextNode · Element→append · null/false→skip · Array→flach.
    _el(tag, attrs, ...children) {
        const el = document.createElement(tag);
        if (attrs) {
            for (const k in attrs) {
                const v = attrs[k];
                if (v == null) continue;
                if (k === "class") el.className = v;
                else if (k === "text") el.textContent = v;
                else if (k === "html") el.innerHTML = v;
                else if (k === "style") Object.assign(el.style, v);
                else if (k === "data") for (const d in v) el.dataset[d] = v[d];
                else if (k === "on") for (const ev in v) el.addEventListener(ev, v[ev]);
                else if (k.length > 2 && k.startsWith("on") && typeof v === "function")
                    el.addEventListener(k.slice(2).toLowerCase(), v);
                else if (k.includes("-") || k === "role") el.setAttribute(k, v);
                else el[k] = v;
            }
        }
        this._elAppend(el, children);
        return el;
    }

    _elAppend(el, children) {
        for (const c of children) {
            if (c == null || c === false) continue;
            if (Array.isArray(c)) this._elAppend(el, c);
            else el.appendChild(typeof c === "object" ? c : document.createTextNode(String(c)));
        }
    }

    // WebGPU-Gate-Screen: NodeMaterials/TSL rendern nur auf WebGPURenderer; ein WebGL2-Fallback wäre
    // ein voller Parallel-Render-Pfad → KEIN Fallback, sondern eine gestaltete Erklärung. Reines DOM
    // (kein innerHTML → CSP-rein), headless-sicher; feuert nur ohne navigator.gpu.
    _showWebGPUGate() {
        if (typeof document === "undefined" || !document.body) return;
        this._ladeschirmWeg(); // das Tor ist die Antwort — der Ladeschirm läge über ihm
        try {
            if (document.getElementById("webgpu-gate")) return;
            const overlay = document.createElement("div");
            overlay.id = "webgpu-gate";
            overlay.style.cssText =
                "position:fixed;inset:0;z-index:100000;display:flex;align-items:center;justify-content:center;" +
                "background:radial-gradient(circle at 50% 28%,#2a1810,#120804 78%);" +
                "font-family:'Georgia','Times New Roman',serif;color:#f0dcc0;padding:24px;box-sizing:border-box;";
            const card = document.createElement("div");
            card.style.cssText =
                "max-width:560px;width:100%;background:#1d120b;border:1px solid #6b4326;border-radius:14px;" +
                "padding:34px 36px;box-shadow:0 18px 60px rgba(0,0,0,.6);line-height:1.55;";
            const title = document.createElement("h1");
            title.textContent = "AnazhRealm erwacht in WebGPU";
            title.style.cssText = "margin:0 0 6px;font-size:24px;color:#ffd9a8;font-weight:600;letter-spacing:.3px;";
            const lead = document.createElement("p");
            lead.textContent =
                "Diese Welt rendert mit WebGPU — der modernen Grafik-Schnittstelle des Webs. " +
                "Dein Browser meldet sie noch nicht. Das ist kein Fehler in der Welt, nur eine Schwelle.";
            lead.style.cssText = "margin:0 0 16px;font-size:16px;color:#e8d2b4;";
            const how = document.createElement("p");
            how.textContent = "So trittst du ein:";
            how.style.cssText = "margin:0 0 8px;font-size:15px;color:#ffce96;font-weight:600;";
            const list = document.createElement("ul");
            list.style.cssText = "margin:0 0 18px;padding-left:20px;font-size:15px;color:#e2cba8;";
            const rows = [
                "Chrome oder Edge ab Version 113 (oder neuer) öffnen.",
                "Safari 18+ auf macOS/iOS — WebGPU ist standardmäßig dabei.",
                "Firefox: about:config → dom.webgpu.enabled auf true setzen.",
            ];
            for (const t of rows) {
                const li = document.createElement("li");
                li.textContent = t;
                li.style.cssText = "margin:4px 0;";
                list.appendChild(li);
            }
            const link = document.createElement("a");
            link.href = "https://caniuse.com/webgpu";
            link.target = "_blank";
            link.rel = "noopener noreferrer";
            link.textContent = "WebGPU-Browser-Unterstützung ansehen →";
            link.style.cssText =
                "display:inline-block;color:#ff9a52;text-decoration:none;font-size:14px;border-bottom:1px solid #ff9a52;";
            const foot = document.createElement("p");
            foot.textContent =
                "Sobald dein Browser WebGPU spricht, lädst du diese Seite einfach neu — die Welt ist dann da.";
            foot.style.cssText = "margin:18px 0 0;font-size:13px;color:#b89a78;font-style:italic;";
            card.appendChild(title);
            card.appendChild(lead);
            card.appendChild(how);
            card.appendChild(list);
            card.appendChild(link);
            card.appendChild(foot);
            overlay.appendChild(card);
            document.body.appendChild(overlay);
        } catch (_e) {
            /* DOM nicht verfügbar (sehr alte Browser) — der throw in init() trägt die Meldung */
        }
    }

    async init() {
        this.log(`Initialisiere Anazh Realm V${AnazhRealm.VERSION}... Ewigkeit erwacht!`, "INFO");
        // Versions-Anzeige (title + .version) aus `AnazhRealm.VERSION` — EIN Wahrheits-Ort, kein
        // hartkodierter String in index.html.
        const versionLabel = `v${AnazhRealm.VERSION}`;
        if (typeof document !== "undefined") {
            try {
                document.title = `Anazh Realm ${versionLabel} – Das Ultiversum`;
                const versionSpan = document.querySelector(".version");
                if (versionSpan) versionSpan.textContent = versionLabel;
            } catch (e) {
                this.log(`Versions-DOM-Sync-Fehler: ${e.message}`, "WARN");
            }
        }
        // Boot-Eichung: speed/sprintSpeed/jumpPower aus DENSELBEN Kern-Koeffizienten, die
        // recomputePlayerStats später mit den Seelen-Tags füllt — kein zweiter Zahlensatz; die
        // Konstruktor-Werte sind Null-Sentinels (kalter Kern → der Spieler steht sichtbar). try-Wand: der
        // Boot stirbt nie an der Eichung (_kernPflichtWand meldet). hang.maxSlopeY hat keinen State-Seed —
        // seine Leser lesen _bewegungsBlock (fail-closed).
        try {
            const KS = AnazhRealm._bewegungsKoeff("speed");
            const KJ = AnazhRealm._bewegungsKoeff("jumpPower");
            this.state.speed = KS.base + KS.leicht;
            this.state.sprintSpeed = this.state.speed * AnazhRealm._sprintMulGesetz();
            this.state.jumpPower = KJ.base + KJ.leicht;
        } catch (_e) {}
        // Welle 6.C3 — Keybindings VOR allen DOM-Listenern laden. State muss
        // existieren bevor das Settings-Panel rendert (sonst zeigt es leer).
        this.state.keybindings = this._loadKeybindings();
        this.state.keybindRebind = null;
        // Revozierte Schlüssel aus dem globalen localStorage: ein Artefakt mit revoziertem Schlüssel irgendwo
        // in seiner Herkunftskette fällt beim Laden weg. Global, NIE im Welt-Snapshot
        // (SOVEREIGN_STATE.excludedStateKeys); VOR den Welt-Ladern laden, damit sie sieben können.
        this.state.revokedKeys = this._loadRevokedKeys();
        // W14 Phase 2 — signierte Welt-Manifeste aus dem globalen localStorage.
        this.state.signedWorlds = this._loadSignedWorlds();
        // W14 Phase 3 — empfangene (importierte) Welt-Manifeste.
        this.state.customWorlds = this._loadCustomWorlds();
        this.grokInitDOM();
        this.symphonyInitDOM();
        this.initStatusPanel();
        this.playerSoulInitDOM();
        this.cameraModeInitDOM();
        this.gameModeInitDOM();
        // Welle 6.H Phase 2E V2 — proaktive-Sprache-Toggle aufsetzen.
        this.creatureSpeechInitDOM();
        // V8.37 — Einstellungen-Sektionen faltbar machen.
        this._initCollapsibleSettings();
        // Welle 6.X.2 B1 — Logbuch-Sichtbarkeit-Toggle aufsetzen.
        this.logbookInitDOM();
        // Welle 6.X.4 F1 — Begleiter-Name + Avatar-Name laden + binden.
        this.identityInitDOM();
        // W13 Phase 1 — Vibe-Pass-Sektion verkabeln (Render folgt mit
        // _ensureVibePass nach ensureWorldMeta).
        this.vibePassInitDOM();
        // Welle 6.X.4 D2 — Drei Schieber (Master / Pings / Render-Ring).
        this.slidersInitDOM();
        this.keybindingsInitDOM();
        this.inventoryInitDOM();
        this.creatureDrawerInitDOM();
        // W14 Phase 1 — Bibliothek-Drawer rendern (Welt-Registry browsbar).
        this.libraryInitDOM();
        // KI-Übersetzer Phase 1 — die Übersetzer-Sektion verkabeln.
        this.translatorInitDOM();
        // W15 Phase 1 — die Auto-Vendor-Sektion („Welt andocken") verkabeln.
        this.vendorInitDOM();
        // W16 Phase 1 — die „Welt vom Mitspieler holen"-Sektion verkabeln.
        this.meshWorldInitDOM();
        // Ring 6.5 — Hotbar im DOM rendern. Wird hier einmal aufgesetzt;
        // setHotbarSlot löst ein Re-Render aus.
        this._renderHotbarDOM();
        // Ring 6.6 — Werkstatt-Editor initial mit Default-Bauplan rendern.
        this._renderWorkshopDOM();
        this._updateBuildModeHud();
        this.initTopbar();
        this.initConsoleDOM();
        // V8.00 — Resize-Handles für Konsole + alle Drawer (idempotent).
        this.installResizeHandles();
        // Schicht 2 — LLM-Persistenz aus localStorage holen + UI verkabeln.
        this.llmLoadPersisted();
        this.initLlmUI();
        // Ring 11 V1 — P2P-Persistenz aus localStorage + UI-Verkabelung.
        // Auto-Connect erst nach ensureWorldMeta (sonst hätten wir keine
        // worldId als default-Raum).
        this.p2pLoadPersisted();
        this.initP2PUI();
        // Aktive Welt-Identität VOR ensureWorldMeta laden, sonst triggert fresh=true (neue UUID + Genesis)
        // für eine bestehende Welt. Migriert nebenbei einen Legacy-Single-Welt-Save. DIE RETTUNGS-KETTE DES BOOTS
        // (Gegenprüfung Runde 4): erst der IndexedDB-Stand der aktiven Welt (V18.151, Faden #6), dann fragt die Vorlade die
        // EINE Kette (Platz → .bak → IndexedDB), BEVOR ensureWorldMeta eine neue Id vergibt.
        await this._idbPreload();
        this._preloadActiveWorldMeta();
        this.ensureWorldMeta();
        // EINE NEUE WELT NUR, WENN DIE KETTE LEER IST — UND DANN LAUT: was gefunden wurde, warum frisch.
        if (this._bootLeer) {
            const b = this._bootLeer;
            const satz = b.id
                ? `Die Welt ${b.id} ließ sich nicht finden (${b.befund.join(", ")}) — eine neue Welt erwacht.`
                : `Kein gespeicherter Stand (${b.befund.join(", ")}) — eine neue Welt erwacht.`;
            this.log(satz, b.id ? "ERROR" : "INFO");
            this._chatEcho(satz);
        }
        // Die Empfänger-Wand des Erbguts (fail-closed): ein Erbgut, das dieser Build nicht trägt, lässt die Welt nicht
        // erwachen — der Wurf landet auf dem Ladeschirm (`_bootAnazhRealm`), nie fährt sie still als Wildnis.
        this._erbgut();
        // Vibe-Pass laden oder beim ersten Erwachen erzeugen — nach ensureWorldMeta, damit die
        // Genesis-Erinnerung ins Journal der aktiven Welt fließt (die Identität ist welt-unabhängig).
        await this._ensureVibePass();
        // Welle 6.E2 — Intro-Overlay beim ersten Welt-Start. Liest seen.intro
        // aus dem soeben hydrierten worldJournal + localStorage `anazh.ui.skipIntro`.
        this._firstWorldWelcome();
        // Welle 3 F — Welt-Info-Sektion im Welt-Drawer.
        this.initWorldInfoUI();
        // Ring 9 — Welt-Tor Drei-Wahl-Dialog beim Import.
        this.initWeltTorUI();
        // Ring 10 — Welt-Fusion-Dialog.
        this.initWorldFusionUI();
        // Auto-Connect, wenn der Spieler die Verbindung aktiv gelassen hat oder worldMeta.role host/guest
        // ist (welt-intrinsischer Modus); ensureWorldMeta lief schon, die worldId ist Raum-Default.
        // Die Absicht setzt die Tür selbst (initP2PSync); Guests bekamen vom Importer hostInfo.url ins localStorage
        // gespeichert, p2pLoadPersisted oben hat das schon aufgenommen.
        const weltRolle = this.state.worldMeta ? this.state.worldMeta.role : null;
        const weltVerbunden = weltRolle === "host" || weltRolle === "guest";
        if (weltVerbunden) this.state.p2p.role = weltRolle;
        if (this.state.p2p.enabled || weltVerbunden) {
            this.initP2PSync(null);
        }
        try {
            await this.core.initPhysics();
            this.log("Physik erfolgreich initialisiert", "INFO");
        } catch (error) {
            this.log(`Physik fehlgeschlagen: ${error.message} – Ohne Physik fortfahren`, "ERROR");
            this.state.physicsWorld = null;
        }

        try {
            this.initializeNexus();
            this.log("Nexus erfolgreich initialisiert", "INFO");
        } catch (error) {
            this.log(`Nexus-Initialisierung fehlgeschlagen: ${error.message} – Ohne Nexus fortfahren`, "ERROR");
        }

        const canvas = document.getElementById("world-canvas");
        if (!canvas) {
            this.log("Canvas fehlt – Ewigkeit unsichtbar!", "ERROR");
            return;
        }
        canvas.width = window.innerWidth;
        canvas.height = window.innerHeight;

        // ColorManagement an: sRGB-Farben werden intern linear gerechnet. Canvas-Texturen
        // (`_buildVibePassSprite`, `_creatureAuraTextureCache`, `_buildAuraGradient`) sind SRGBColorSpace
        // getaggt; die gradientMap (Toon-LUT) bleibt LinearSRGBColorSpace — Helligkeit, keine Farbe.
        if (typeof THREE !== "undefined" && THREE.ColorManagement) {
            THREE.ColorManagement.enabled = true;
        }
        // WebGPU ist Pflicht: NodeMaterials rendern ausschließlich auf WebGPURenderer (WebGL-Fallback =
        // schwarze Welt). Ohne WebGPU → klare Meldung statt stiller leerer Welt.
        if (typeof navigator === "undefined" || !navigator.gpu) {
            const msg =
                "AnazhRealm braucht WebGPU. Browser bitte aktualisieren " +
                "(Chrome/Edge 113+, Safari 18+, Firefox mit dom.webgpu.enabled).";
            this.log(msg, "ERROR");
            this._showWebGPUGate();
            throw new Error(msg);
        }
        // JEDES-HOLZ-WELLE — die Holz-Wahl VOR dem Renderer-Bau (der Adapter wird
        // billig vorab befragt; Software-Holz → kienspan: kleiner Ring, kein
        // Antialias, Pixel-Cap 1 — volle NÄHE, weniger FERNE).
        const holz = await this._holzWahl();
        this._applyHolzProfil(holz);
        const holzProf = AnazhRealm.HOLZ_PROFILE[holz] || AnazhRealm.HOLZ_PROFILE.voll;
        this.state._traa = holzProf.antialias !== false; // die Post-Kette liest es (_ensurePostProcessing)
        // Opt-in Headless-Null-Renderer (GPU-frei) für Mechanik-Playtest / Server-Sim, sonst der echte
        // WebGPU-Renderer. trackTimestamp anfordern ist sicher: das vendored r184-Backend fordert
        // timestamp-query nur an, wenn der Adapter es trägt, und schaltet es sonst ab (init() wirft nie);
        // dann bleibt perfSense beim Subtraktions-Proxy ("proxy").
        const renderer =
            typeof window !== "undefined" && window.__anazhHeadlessNullRenderer
                ? this._makeHeadlessRenderer(canvas)
                : new THREE.WebGPURenderer({
                      canvas,
                      // KEIN MSAA: die Kantenglättung ist die zeitliche Auflösung (TRAA) am Anfang der Post-Kette
                      // (_ensurePostProcessing; das Holz-Profil schaltet sie). MSAA 4× kostete gemessen ~7 ms GPU
                      // und 267 MB VRAM (04.10., Radeon 890M).
                      antialias: false,
                      trackTimestamp: true,
                      // KEIN-WEBGPU-GESCHICHTE — der EINE forceWebGL-Hook (gate:webgl-probe).
                      forceWebGL: AnazhRealm._forceWebGL(),
                  });
        // ACES-Filmic-Tone-Mapping: die Lichter sind HDR (Sonne 2.4 + Hemi/Ambient) und klemmten ohne
        // Tone-Mapping bei 1.0 (ausgewaschen). Reine Render-Output-Stufe.
        renderer.toneMapping = THREE.ACESFilmicToneMapping;
        renderer.toneMappingExposure = 1.0; // Vorlage phytogenesis Z.1285 (exakt)
        // V10.0-j.b — Stencil-Buffer global deaktivieren. Three.js' Renderer-
        // Default ist `this.stencil = true` → bei JEDEM RenderPass setzt
        // WebGPUBackend stencilLoadOp + stencilStoreOp. Bei Pure-Depth-Format
        // (V10.0-j.a Shadow-RTT) wirft WebGPU dann „stencilLoadOp must not
        // be set if attachment has no stencil aspect" → CommandEncoder
        // invalidiert → Welt schwarz. Wir nutzen Stencil nirgends → kein
        // visueller Verlust. Plus: Main-Canvas-Depth-Buffer wird Pure-Depth
        // (Depth24Plus statt Depth24PlusStencil8) — 4 Bytes/Pixel statt 5.
        renderer.stencil = false;
        this.log("WebGPU-Renderer instantiiert — init() läuft asynchron …", "INFO");
        // Das Backend-Gesetz an der KLASSE, bevor irgendein Backend der Seite (Welt oder Bühne) ein Attribut anlegt oder sein
        // Device holt (`_backendGesetz`: schmaler Index · Index-Wache · GPU-Wache).
        this._backendGesetz(renderer);
        this._configureRenderer(renderer);
        this.state.rendererReady = false;
        // JEDES-HOLZ — der Boot-Wächter: ein still hängendes init() (Software-
        // Vulkan) bekommt nach 25 s eine LAUTE Diagnose statt einer weißen Welt.
        const initWatch = setTimeout(() => {
            if (!this.state.rendererReady) {
                this.log(
                    "WebGPU-Renderer init() antwortet nach 25 s nicht — schwaches/Software-Holz? " +
                        "Versuche ?holz=kienspan (kleiner Ring, kein AA) oder einen anderen Browser.",
                    "ERROR"
                );
                this._ladeschirmStand("die Grafikkarte antwortet seit 25 s nicht — versuche ?holz=kienspan");
            }
        }, 25000);
        renderer
            .init()
            .then(() => {
                clearTimeout(initWatch);
                this.state.rendererReady = true;
                this.log("WebGPU-Renderer init() abgeschlossen — die Welt rendert jetzt auf der GPU.", "INFO");
                // Trägt das Device timestamp-query? `backend.trackTimestamp` ist die EINE Wahrheit (r184 lässt sie
                // nur mit Feature stehen); `_perfGpuResolveKick` liest dieselbe Flagge pro Frame — hier nur einmal
                // laut benennen, kein Spiegel-Feld.
                try {
                    const tt = renderer.backend && renderer.backend.trackTimestamp === true;
                    this.log(
                        tt
                            ? `GPU-Zeit: timestamp-query aktiv — perfSense misst echtes gpuMs (Quelle „echt").`
                            : `GPU-Zeit: timestamp-query fehlt auf diesem Adapter — der Subtraktions-Proxy bleibt (Quelle „proxy").`,
                        "INFO"
                    );
                } catch (_e) {
                    /* fail-soft — die Quelle-Wahrheit lebt in _perfGpuSample */
                }
                // Backend-Rückfall EINMAL laut benennen: der r184-WebGPURenderer fällt ohne Adapter (oder via
                // forceWebGL-Hook) still auf WebGL2 — dann ruht der WGSL-Konsument (der Fullscreen-Feld-Pass;
                // _gpuComputeFaehig-Wand) und die CPU-Gesetze tragen ganz.
                try {
                    if (!(renderer.backend && renderer.backend.isWebGPUBackend === true)) {
                        this.log(
                            "WebGL2-Rückfall aktiv (kein WebGPU-Backend): der Fullscreen-Feld-Pass ruht — " +
                                "die CPU-Gesetze tragen die Welt GANZ; der Fern-Ring verfeinert auf CPU (+ eigenem WebGPU-Device, falls vorhanden).",
                            "WARN"
                        );
                    }
                } catch (_e) {
                    /* fail-soft — die Wand selbst urteilt je Konsument */
                }
                this._renderObjektRegister(renderer);
                // Hitch-Telemetrie (d) Upload-Bytes: JEDER Upload läuft durch device.queue.writeBuffer — ein
                // Laufzeit-Wrap hier zählt alles, die vendor-Datei bleibt byte-alt. Idempotent über __anazhTap;
                // Konsum je Frame in _perfSenseFoldFrame.
                try {
                    const q = renderer.backend && renderer.backend.device && renderer.backend.device.queue;
                    if (q && !q.__anazhTap && typeof q.writeBuffer === "function") {
                        const orig = q.writeBuffer.bind(q);
                        q.writeBuffer = (b, off, data, dOff, size) => {
                            const _sz =
                                size != null ? size * (data.BYTES_PER_ELEMENT || 1) : (data && data.byteLength) || 0;
                            this._uploadBytesAcc = (this._uploadBytesAcc || 0) + _sz;
                            // Die Größen-Klasse nennt die Upload-Population: Uniforms (≤16K) vs Instanz-Matrizen (≤256K) vs
                            // Geometrie/Texturen (≥2M). Session-kumulativ, zwei Adds pro Upload.
                            const _B =
                                this._uploadBuckets ||
                                (this._uploadBuckets = { b16K: [0, 0], b256K: [0, 0], b2M: [0, 0], gross: [0, 0] });
                            const _slot =
                                _sz <= 16384 ? _B.b16K : _sz <= 262144 ? _B.b256K : _sz <= 2097152 ? _B.b2M : _B.gross;
                            _slot[0]++;
                            _slot[1] += _sz;
                            return orig(b, off, data, dOff, size);
                        };
                        q.__anazhTap = true;
                    }
                } catch (_e) {
                    /* fail-soft — ohne Tap bleibt uploadBytes ehrlich 0, nie ein Boot-Wurf */
                }
                // die Absage einer asynchronen Pipeline meldet sich laut (r184 verschluckt sie)
                this._erstAbsageWache(renderer);
                // JEDES-HOLZ — DER DEVICE-LOSS-WÄCHTER: stirbt das GPU-Device
                // (Software-Dawn, Treiber-Reset, TDR), wird es LAUT gemeldet +
                // das Gate gezeigt, statt einer weißen Welt mit 60-fps-Lüge.
                try {
                    const dev = renderer.backend && renderer.backend.device;
                    if (dev && dev.lost && typeof dev.lost.then === "function") {
                        dev.lost.then((info) => {
                            this.state._deviceLost = (info && info.reason) || "unknown";
                            const tieferes =
                                this.state._holzProfil === "kienspan"
                                    ? "Dieses Holz trägt selbst kienspan nicht — die Welt braucht eine echte GPU."
                                    : "Versuche ?holz=kienspan (kleiner Ring, keine Schatten, kein AA).";
                            this.log(
                                `GPU-DEVICE VERLOREN (${this.state._deviceLost}) — die Welt kann nicht weiterrendern. ${tieferes}`,
                                "ERROR"
                            );
                            if (typeof this._showWebGPUGate === "function") this._showWebGPUGate();
                        });
                    }
                } catch (_e) {
                    /* Wächter ist fail-soft — ohne lost-Promise kein Wächter */
                }
            })
            .catch((err) => {
                this._ladeschirmStand(`die Grafikkarte verweigert die Welt: ${err && err.message}`);
                this.log(
                    `WebGPU-Renderer init() scheiterte (${err.message}). ` +
                        "navigator.gpu existiert aber requestAdapter/requestDevice scheitert — " +
                        "Hardware-Adapter nicht verfügbar oder Device-Erschaffung blockiert.",
                    "ERROR"
                );
            });
        this.state.renderer = renderer;
        // Der Null-Renderer zeigt kein Bild, auf das der Ladeschirm warten könnte (sein Loop pumpt nur auf Zuruf):
        // er weicht sofort, die UI der Linsen bleibt klickbar.
        if (renderer._isHeadlessNull) this._weltbildSteht();
        this.log("Renderer initialisiert mit Schattenunterstützung (webgpu)", "INFO");
        this.state.selfAwareness.components.push("renderer");

        const scene = new THREE.Scene();
        this.state.scene = scene;
        this.log("Szene initialisiert", "INFO");
        this.state.selfAwareness.components.push("scene");

        // V6 (Look-Finale, 2a) — die Saison-Tönungs-Uniform in init() erzeugen
        // (TSL ist geladen; das Gras-Material liest sie später lazy). Der State ist
        // in der audit-strict-Whitelist (abgeleitet aus seasonPhase, nicht im Snapshot).
        this._ensureSeasonUniforms();

        // P0.1 (Bühnen-Ordnung) — das zweite „Galaxy-Skybox erstellt"-Log ist WEG: der
        // Builder loggt sich selbst (createGalaxySkybox-Ende) — die Doppel-Zeile im
        // Schöpfer-Log war EIN Bau mit ZWEI Log-Sites (Builder + Call-Site), kein Doppel-Bau.
        this.createGalaxySkybox();

        // Sonne + Mond als emissive Sphere-Meshes; die Position setzt _updateCelestialBodies(angle)
        // (Mond gegenüber). Die Sonne trägt den echten Winkel (`HIMMEL.sonneWinkelGrad`, aus 380 m 1,76 m Radius) —
        // 12 m waren 3,6° (sieben Sonnen breit) und deckten den HDR-Hof der Skybox als graue Scheibe.
        const _H = AnazhRealm.HIMMEL;
        const sunGeo = new THREE.SphereGeometry(
            _H.koerperAbstandM * Math.tan(((_H.sonneWinkelGrad / 2) * Math.PI) / 180),
            16,
            16
        );
        const sunMat = AnazhRealm._himmelImUnendlichen(
            new THREE.MeshBasicNodeMaterial({
                color: 0xffe8b0,
                fog: false,
                transparent: true,
                opacity: 0.95,
            })
        );
        const sunMesh = new THREE.Mesh(sunGeo, sunMat);
        sunMesh.name = "himmel-sonne";
        sunMesh.frustumCulled = false; // immer rendern (Himmelskörper)
        scene.add(sunMesh);
        this.state.sunMesh = sunMesh;
        const moonGeo = new THREE.SphereGeometry(9, 16, 16);
        const moonMat = AnazhRealm._himmelImUnendlichen(
            new THREE.MeshBasicNodeMaterial({
                color: 0xd0d4e0,
                fog: false,
                transparent: true,
                opacity: 0.9,
            })
        );
        const moonMesh = new THREE.Mesh(moonGeo, moonMat);
        moonMesh.name = "himmel-mond";
        moonMesh.frustumCulled = false;
        scene.add(moonMesh);
        this.state.moonMesh = moonMesh;
        this.log("Himmelskörper hinzugefügt (Sonne + Mond)", "INFO");

        const ambientLight = new THREE.AmbientLight(0xffffff, 0.6);
        scene.add(ambientLight);
        const directionalLight = new THREE.DirectionalLight(0xffffff, 1.0);
        directionalLight.position.set(1, 1, 1);
        directionalLight.castShadow = true;
        directionalLight.shadow.mapSize.width = 2048;
        directionalLight.shadow.mapSize.height = 2048;
        directionalLight.shadow.camera.near = 0.5;
        directionalLight.shadow.camera.far = 500;
        // Frustum-Halbbreite aus dem persistierten Schatten-Hebel (Default 170), falls loadState vor der Licht-Erstellung
        // lief; sonst greift setShadowRange in loadState. Den Bias setzt das Gesetz (`_hauptSchattenBias` unten, der Hebel
        // `atmosphere.shadowBias` liest setShadowBias).
        const _atmo = this.state.atmosphere || {};
        const _shRange = Number.isFinite(_atmo.shadowRange) ? Math.max(80, Math.min(400, _atmo.shadowRange)) : 170;
        directionalLight.shadow.camera.left = -_shRange;
        directionalLight.shadow.camera.right = _shRange;
        directionalLight.shadow.camera.top = _shRange;
        directionalLight.shadow.camera.bottom = -_shRange;
        // Shadow-Acne-Schutz: ohne Bias schattet die grobe Map flache, zur Sonne zeigende Flächen selbst
        // (Streifen auf Dächern). normalBias (Sample entlang der Normale) ist der wirksame Acne-Killer,
        // bias nur ein kleiner Tiefen-Nudge; mapSize 2048.
        // Beide aus dem EINEN Gesetz (`_schattenBias`, 0710-12): Texel der Karte = 2 · Reichweite / Kartengröße.
        this._hauptSchattenBias(directionalLight);
        // KRITISCH: nach dem Setzen der Shadow-Camera-Bounds MUSS updateProjectionMatrix() laufen — die
        // OrthographicCamera rechnet sie nur im Konstruktor; sonst ist light.shadow.matrix degeneriert
        // und es fällt nie ein Schatten.
        directionalLight.shadow.camera.updateProjectionMatrix();
        // DIE WURF-EBENE (K72, `_wurfEbene`): die Schatten-Kamera sieht NUR SHADOW_TWIN_LAYER — die Ebene, die `castShadow`
        // jedes Knotens trägt; die Haupt-Kamera (nur Layer 0) sieht sie nie. r184 behält eine Schatten-Maske mit einem Bit
        // jenseits der 0 (`updateShadow`, gate:vendor-anker) und projiziert damit nur Werfer — vorher sah die Kaskade die
        // Welt-Ebene und verwarf 39–72 Nicht-Werfer je Render erst nach Projektion und Sortierung. VOR der CSM-Konstruktion
        // setzen: `light.shadow.clone()` kopiert die Maske in jede Kaskaden-Kamera; der Fallback nutzt dieselbe shadow.camera.
        directionalLight.shadow.camera.layers.set(AnazhRealm.SHADOW_TWIN_LAYER);
        scene.add(directionalLight);
        // Light-Target in den Szenengraph hängen, damit sein matrixWorld pro Frame aktualisiert wird —
        // _applyDayNightToScene setzt es auf den Spieler, das Shadow-Frustum folgt ihm.
        scene.add(directionalLight.target);
        // Schatten-CSM: ZWEI Kaskaden innerhalb der Schatten-Reichweite (maxFar = die EINE Größe aus
        // `_applyEffectiveShadowRange`, 180–306 m) — Kaskade 0 = Band 0 bis zur `DETAIL_CASCADE`-Kante
        // (~108 m), Kaskade 1 = der Rest bis maxFar. Gemessen 02.10.: die Band-1-Kante (367 m) lag jenseits jeder
        // geregelten Reichweite, die dritte Kaskade klemmte auf 0,95 und deckte einen 5-%-Streifen (285–300 m), für
        // den sie alle Werfer ein drittes Mal zeichnete. Die Box jeder Kaskade misst der Host (`_kaskadenPassen`
        // ersetzt das Addon-updateBefore: Frustum-Scheibe im Licht-Raum statt Diagonal-Quadrat), die Werfer wählt
        // jeder Pass selbst (`_passSicht` an scene.onBeforeRender); `fade` weicht den Übergang. Den Bias setzt jede
        // Kaskade bei ihrem Fit aus dem EINEN Gesetz (`_schattenBias` in `_kaskadeFit`, setShadowBias stellt ihn live),
        // die Karten-Größe folgt der Texel-Dichte (`_kaskadenKarten`). Ohne Vendor-Symbol bleibt die EINE Map.
        if (typeof THREE.CSMShadowNode === "function") {
            try {
                const bands = AnazhRealm.DETAIL_CASCADE;
                const span = this._voxelChunkConfig(0).span; // 43.2 m
                const e0 = (bands[0].maxRing + 0.5) * span; // Band-0-Kante ~108 m
                const csm = new THREE.CSMShadowNode(directionalLight, {
                    cascades: 2,
                    maxFar: _shRange * AnazhRealm.SCHATTEN_FERN_FAKTOR, // der Regler fährt es live nach
                    mode: "custom",
                    customSplitsCallback: (cascades, near, far, breaks) => {
                        breaks.push(Math.min(0.85, e0 / far), 1);
                    },
                });
                csm.fade = true;
                csm._init = (builder) => this._kaskadenGeburt(csm, builder);
                // DIE HORIZONT-KARTE (D3) jenseits der Kaskaden: dort gibt die CSM 1 zurück (ihre Kaskaden enden bei maxFar) —
                // ihr EINER Knoten (einmal je Instanz gebaut, der Eingriff in 07.js) trägt die Sicht der Karte für jeden
                // Empfänger (Boden, Ring, Baum, Haus); `receivedShadowNode` eines Stoffs wirkt nur je Kaskade.
                const aufbauEin = csm.setup;
                const welt = this;
                let mitHorizont = null;
                csm.setup = function (builder) {
                    if (mitHorizont === null) mitHorizont = aufbauEin.call(this, builder).mul(welt._horizontSicht());
                    return mitHorizont;
                };
                // Die Lichter stellt der Haupt-Pass VOR jeder Karte (`_passSicht` → `_kaskadenPassen`). Das Addon
                // stellte sie im Knoten-updateBefore — r184 ruft es NACH den Kaskaden-Pässen (gemessen 04.10.: k0 · k1
                // · Fit), jede Karte lief mit der Box des Vor-Frames. Sein zweiter Schreiber fällt mit:
                // `updateFrustums` (Reichweiten-Wechsel, _applyEffectiveShadowRange) schrieb das Diagonal-Quadrat in
                // jede Kaskaden-Kamera — die Box schreibt EINER, der Fit (Brüche und Frusta rechnet updateFrustums
                // weiter).
                csm.updateBefore = () => {};
                csm._updateShadowBounds = () => {};
                directionalLight.shadow.shadowNode = csm;
                this.state.csmNode = csm;
                this.log("Schatten-CSM aktiv (2 Kaskaden: Band 0 · Rest bis zur Schatten-Reichweite)", "INFO");
            } catch (e) {
                throw this._stoffBruch("die Schatten-Kaskaden (CSM)", e);
            }
        }
        // DIE SICHT JE PASS: der Hauptpass liest das Haupt-Urteil der Region-Bundles, jeder Schatten-Pass sein eigenes
        // (r184 ruft die Szenen-Haken vor der Projektion und nach dem Pass, auch im verschachtelten Schatten-Render).
        scene.onBeforeRender = (_r, _s, kamera) => this._passSicht(kamera, false);
        scene.onAfterRender = (_r, _s, kamera) => this._passSicht(kamera, true);
        // KEIN Studio-Füll-Rig in der Welt (V18.503): Fill · Rim · Back ersetzen im Labor den Himmel, den
        // es nicht hat — die Welt hat ihn (die Himmels-Umgebung aus dem SICHTBAREN Himmel). Gemessen 01.10.
        // an einer 50-%-Fläche: mit Rig las die Schattenseite so hell wie die Sonnenseite (208 vs 214),
        // ohne Rig 145 vs 219 — das Verhältnis der Realität (0,16–0,21).
        // Welle 6.G3 — Refs cachen für tickDayNight. Eine Quelle der Wahrheit
        // (Lights+Skybox werden aus state.timeOfDay abgeleitet pro Frame).
        this.state.ambientLight = ambientLight;
        this.state.directionalLight = directionalLight;
        // HemisphereLight: skyColor oben, groundColor unten, gemischt über normal.y → Tiefe ohne dynamische
        // Schatten. Die Werte sind nur Saat; _applyDayNightToScene überschreibt (Sky aus DAY_NIGHT_STOPS,
        // Ground aus worldFieldAt).
        const hemiLight = new THREE.HemisphereLight(0x88a0c8, 0x3a2818, 0.55);
        scene.add(hemiLight);
        this.state.hemiLight = hemiLight;
        // DIE LUFT (`scene.fogNode`): die EINE Luftperspektive für jedes Material; Farbe, Extinktion und Sonne
        // synct _applyDayNightToScene. Ungebautes deckt der Fern-Ring (Loch-Deckel), nie ein Nebel-Kokon.
        this._luftEnsure();
        this.log("Beleuchtung hinzugefügt: Ambient (0.6), Directional (1.0) mit Schatten", "INFO");
        // Welle 6.G3 — initialer Lichtstand aus timeOfDay (Default 0.5 = Mittag).
        // Pro-Frame-Tick übernimmt danach.
        if (typeof this._applyDayNightToScene === "function") {
            this._applyDayNightToScene();
        }

        const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
        this.state.camera = camera;
        this.log("Kamera initialisiert", "INFO");
        this.state.selfAwareness.components.push("camera");

        // Spieler-Mesh = THREE.Group als Anker (Position + Skalierung); applyPlayerSoul füllt ihn — EIN Pfad
        // für initialen Bau und späteren Wechsel.
        const initialGroup = new THREE.Group();
        initialGroup.position.set(0, 20, 0);
        initialGroup.visible = true;
        scene.add(initialGroup);
        this.state.playerMesh = initialGroup;
        const initialSoul =
            this.state.player.soul && this.playerSoulDefs[this.state.player.soul] ? this.state.player.soul : "human";
        // Der Avatar-Bau blockt den Boot nicht: die Skin-Isosurface ist die große synchrone Blockade
        // (~1.9 s bei res 56). Headless baut synchron (das Gate braucht den Avatar sofort); sonst
        // deferiert — bis dahin ist der Spieler die leere Anker-Group (Physik/Kamera/Bewegung laufen).
        // applyPlayerSoul trägt den Physik-Body aufs fertige Mesh über.
        if (this.state.renderer && this.state.renderer._isHeadlessNull) {
            this.applyPlayerSoul(initialSoul);
        } else {
            this.state._deferredAvatarSoul = initialSoul;
        }
        this.log("Spieler erstellt: Position (0, 20, 0), Soul + Schatten aktiviert", "INFO");
        this.state.selfAwareness.components.push("playerMesh");

        // Kein Ammo-Spieler-Body: der Spieler läuft feld-nativ (`_stepCharacter`) — horizontale
        // Intent-Velocity in `state.playerVel` (angelegt in `initPhysics`), Vertikale in `_fieldVy`,
        // Kollision liest das Dichtefeld.
        this.state.playerVel.setValue(0, 0, 0);
        this.state._fieldVy = 0;
        this.state.selfAwareness.components.push("fieldController");

        // Der Zustand der aktiven Welt: dieselbe Rettungs-Kette wie die Vorlade (Platz → .bak → IndexedDB; der IDB-Stand
        // des Boot-Vorlaufs wird hier verbraucht).
        this.loadState();
        this.generateNewWorld();

        // DER LADESCHIRM HÄLT JEDE TASTE (Gegenprüfung Runde 2; Integration V18.536, Gelb 2 der dritten v1-Gegenprüfung): EIN
        // Fänger in der Capture-Phase des Fensters läuft vor jedem anderen Hörer (Spiel, Omnibox Strg+K, Schubladen-Esc,
        // Werkstatt-Tasten, Portal-Weitergabe, Chat-Feld) — solange der Ladeschirm steht, endet jedes Tasten-Ereignis hier.
        // Vorher hielt nur der Spiel-Hörer an: Strg+K öffnete die Omnibox hinter dem Ladeschirm und führte Befehle aus. Die
        // Taste des Browsers (Neuladen, Zoom) bleibt ihm (kein preventDefault).
        for (const art of ["keydown", "keyup"])
            window.addEventListener(
                art,
                (event) => {
                    if (this._ladeschirmSteht()) event.stopImmediatePropagation();
                },
                true
            );
        window.addEventListener("keydown", (event) => {
            // Ist ein Portal offen, ist die Heimat-Welt eingefroren: nur Esc verlässt das Portal, alle anderen
            // Tasten sind gesperrt. Mit Fokus im iframe meldet die Sub-Welt Esc selbst (skeleton.js →
            // {type:"exit"}).
            if (this._portalOverlay) {
                if (event.key === "Escape") {
                    this.exitPortal();
                    event.preventDefault();
                }
                return;
            }
            // Wenn der Fokus in einem Eingabe-Feld liegt (Chat), keine
            // Spiel-Aktionen aus den Tasten lösen — sonst tippt der User
            // "1" und es geht in den Bau-Modus statt in den Chat.
            const target = event.target;
            const inInput =
                target && (target.tagName === "INPUT" || target.tagName === "TEXTAREA" || target.isContentEditable);
            // Inventar offen + Esc → schließen. WASD/Space/Hotbar laufen weiter (nur Maus-Look ist gesperrt,
            // via exitPointerLock beim Öffnen).
            if (this.state.inventoryOpen && event.key === "Escape") {
                this.toggleInventoryOverlay(false);
                event.preventDefault();
                return;
            }
            // Rebind-Capture: die nächste Taste wird gefangen; Escape bricht ab, jeder andere Code bindet via
            // _completeKeybindRebind.
            if (this.state.keybindRebind && !inInput) {
                const code = this._eventToBindingCode(event);
                if (code) {
                    this._completeKeybindRebind(code);
                    event.preventDefault();
                }
                return;
            }
            // keys-Setzung erst NACH dem inInput-Check — sonst läuft der Avatar beim Tippen im Chat.
            if (inInput) return;
            // DAS GESPRÄCH (Leben-Schau 07.10., L3): die Chat-Taste (Enter) öffnet das Feld — vorher öffneten Enter, T und
            // „/" nichts, der Spieler musste Esc drücken und ins Feld klicken. Keine Spiel-Taste fällt dabei an. Liegt der
            // Fokus auf einem bedienbaren Element (`_uiBedienFokus`) oder hat ein Element die Taste schon verbraucht, gehört
            // sie ihm (Gegenprüfung Runde 1: Enter auf einem Knopf öffnete zusätzlich den Chat und nahm ihm den Fokus).
            if (this._actionForBindingCode(event.code) === "chat") {
                if (event.defaultPrevented || this._uiBedienFokus(target)) return;
                if (this._chatOeffnen()) event.preventDefault();
                return;
            }
            this.state.keys[event.key.toLowerCase()] = true;
            // Pfeil-Tasten schreiben die KANONISCHEN Bewegungs-Tasten am EINEN Input-Chokepoint
            // (PFEIL_ALIAS); der Bewegungs-/Lenk-Pfad kennt nur w/a/s/d (kein Doppel-Leser).
            const _pfeil = AnazhRealm.PFEIL_ALIAS[event.key];
            if (_pfeil) this.state.keys[_pfeil] = true;
            // Aktionen über Keybindings (event.code, layout-unabhängig); 1-9 bleiben hardcoded (Slot-Indizes).
            // Escape verlässt den Bau-Modus immer, auch wenn cancelBuild umgebunden ist — nie gefangen.
            const action = this._actionForBindingCode(event.code);
            if (action === "jump") {
                this.handleJump(performance.now() / 1000);
            }
            if (event.key >= "1" && event.key <= "9") {
                this.selectHotbarSlot(parseInt(event.key, 10) - 1);
            } else if (action === "confirmBuild") {
                if (this.confirmBuild()) event.preventDefault();
            } else if (action === "cancelBuild" || event.key === "Escape") {
                if (this.state.buildMode.active) this._clearBuildMode();
                this._updateHotbarHighlight();
            } else if (event.code === AnazhRealm.FAHR_TASTEN.einsteigen.code) {
                // E toggelt Mount/Dismount für moveable-Architekturen, nur außerhalb des Werkstatt-Drawers (dort ist
                // E der Rotate-Modus). Ein Portal in Reichweite schlägt das Reiten (_tryEnterPortalAtPlayer zuerst).
                if (this.state.uiActiveDrawer !== "werkstatt") {
                    if (!this._tryEnterPortalAtPlayer()) this.toggleMountAtPlayer();
                    event.preventDefault();
                }
            } else if (event.code === "KeyZ") {
                // Z halten zoomt durch eine magnifying-Architektur im Blick. Auto-repeat-tolerant: setZoomActive
                // ist idempotent (_zoomActive-Flag).
                if (this.state.uiActiveDrawer !== "werkstatt") {
                    this.setZoomActive(true);
                    event.preventDefault();
                }
            } else if (event.code === "KeyH") {
                // UI-Putz: H blendet das HUD aus/ein — beim Spielen gehört der Bildschirm
                // der Welt (BotW/Genshin-Geste). Topbar/Statusbar/Konsole/Stats/Hotbar
                // verblassen. Nicht im Werkstatt-Drawer (dort ist die volle UI nötig).
                if (this.state.uiActiveDrawer !== "werkstatt") {
                    document.body.classList.toggle("hud-hidden");
                    event.preventDefault();
                }
            } else if (action === "swapHands") {
                // V18.109 — E8: G tauscht Haupt-Hand ↔ Off-Hand (Minecraft-Geste).
                this.swapHands();
                event.preventDefault();
            } else if (action === "cameraToggle") {
                // V8.17 — Camera-Mode toggeln (1st/3rd) jetzt action-basiert.
                this.setCameraMode(this.state.cameraMode === "first" ? "third" : "first");
                event.preventDefault();
            } else if (
                action === "drawerKreaturen" ||
                action === "drawerSpieler" ||
                action === "drawerWerkstatt" ||
                action === "drawerEinstellungen"
            ) {
                // V8.17 — Drawer-Shortcuts action-basiert (rebindable).
                // Im Bau-Modus deaktiviert um nicht mit F/B zu kollidieren.
                // (UI-Putz: drawerWelt entfällt — die Welt ist der Default-Blick.)
                const drawerNames = {
                    drawerKreaturen: "kreaturen",
                    drawerSpieler: "spieler",
                    drawerWerkstatt: "werkstatt",
                    drawerEinstellungen: "einstellungen",
                };
                const drawer = drawerNames[action];
                if (drawer && !this.state.buildMode.active) {
                    this.toggleDrawer(drawer);
                    event.preventDefault();
                }
            }
        });
        window.addEventListener("keyup", (event) => {
            this.state.keys[event.key.toLowerCase()] = false;
            // FAHR-ABSCHLUSS (19.07.) — der Pfeil-Alias löst symmetrisch.
            const _pfeil = AnazhRealm.PFEIL_ALIAS[event.key];
            if (_pfeil) this.state.keys[_pfeil] = false;
            // Welle 10b.3 — Z-Loslassen beendet Zoom.
            if (event.code === "KeyZ") {
                this.setZoomActive(false);
            }
        });
        // DIE TASTEN-WAND (Welle L, Befund V-k4): verliert das Fenster den Fokus (Fensterwechsel), wird die Seite
        // unsichtbar oder fällt der Zeiger-Lock, erreicht das keyup der gehaltenen Taste diese Seite nie — W blieb
        // gedrückt, der Avatar lief 4,63 m in 278 Frames ohne Taste. Jeder dieser Wechsel löst ALLE Tasten.
        window.addEventListener("blur", () => this._alleTastenLos());
        document.addEventListener("visibilitychange", () => {
            if (document.visibilityState === "hidden") this._alleTastenLos();
        });
        this.log("Tastatureingaben initialisiert: WASD, Space, Shift", "INFO");

        // Maus-Listener-Bindung als Methode (initial-Canvas).
        this._attachWorldCanvasInputListeners(canvas);
        // Scrollrad zyklt durch die Hotbar-Slots (deltaY > 0 → nächster, Modulo 9). Listener auf `window`
        // (Capture), nicht auf canvas: ohne Pointer-Lock (Drawer offen) sähe der Canvas das Event nicht.
        // Die Werkstatt-CAD-Canvas stoppt ihr Wheel-Event selbst (stopPropagation) — CAD-Zoom bleibt.
        window.addEventListener(
            "wheel",
            (event) => {
                if (this.state.inventoryOpen) return;
                if (this.state.keybindRebind) return;
                // Toleranter Pfad statt strict isPointerLocked: das Mausrad wirkt, wenn das Event aus dem
                // Welt-Canvas kommt, kein Drawer offen ist (uiActiveDrawer null) und kein Form-Input fokussiert ist.
                const target = event.target;
                const inInput =
                    target && (target.tagName === "INPUT" || target.tagName === "TEXTAREA" || target.isContentEditable);
                if (inInput) return;
                // Wenn ein Drawer offen ist (target im Drawer), Native-Scroll lassen.
                if (target && typeof target.closest === "function" && target.closest(".drawer")) return;
                // CAD-Werkstatt-Canvas hat eigenen Wheel-Handler (Zoom),
                // den nicht überschreiben.
                if (target && typeof target.closest === "function" && target.closest("#workshop-preview-canvas"))
                    return;
                event.preventDefault();
                const bm = this.state.buildMode || {};
                const current = typeof bm.slotIndex === "number" && bm.slotIndex >= 0 ? bm.slotIndex : 0;
                const dir = event.deltaY > 0 ? 1 : -1;
                const next = (current + dir + 9) % 9;
                this.selectHotbarSlot(next);
            },
            { passive: false, capture: true }
        );
        document.addEventListener("pointerlockchange", () => {
            this.state.isPointerLocked = document.pointerLockElement === canvas;
            // V17.55 W1 — verliert der Spieler den Lock (Esc/UI), stoppt das Mahlen und jede gehaltene Taste (V-k4).
            if (!this.state.isPointerLocked) this._alleTastenLos();
            this.log(`Pointer-Lock: ${this.state.isPointerLocked ? "Aktiv" : "Inaktiv"}`, "INFO");
        });
        document.addEventListener("mousemove", (event) => {
            if (this.state.isPointerLocked) {
                this.state.yaw -= event.movementX * this.state.mouseSensitivity;
                this.state.pitch -= event.movementY * this.state.mouseSensitivity;
                this.state.pitch = Math.max(-Math.PI / 2, Math.min(Math.PI / 2, this.state.pitch));
            }
        });
        this.log("Maussteuerung für Kamera initialisiert", "INFO");

        window.addEventListener("resize", () => {
            canvas.width = window.innerWidth;
            canvas.height = window.innerHeight;
            renderer.setSize(window.innerWidth, window.innerHeight);
            camera.aspect = window.innerWidth / window.innerHeight;
            camera.updateProjectionMatrix();
            // B4 (V18.130) — die CSM-Frusta hängen an der Kamera-Projektion
            // (Addon-Vertrag: „call every time you change camera settings").
            if (this.state.csmNode && this.state.csmNode.camera) this.state.csmNode.updateFrustums();
            // setSize legt Szene-Tiefe und Tiefen-Abbild im nächsten Frame neu an; die Leser folgen der neuen Textur über die
            // EINE Refresh-Entscheidung der Diät (Vorher-Textur-Wächter, `_diaetVorTextur`) — wie bei jedem anderen Wechsel
            // der Pixel-Ratio. Kein Neubau hier: der frühere Wasser-Neubau war ein Zwilling des Wächters (0910-3 A).
            this.log("Fenstergröße angepasst", "INFO");
        });

        // Das Feld: Enter sendet und gibt die Welt zurück, Esc gibt sie ohne Senden zurück (L3: nach dem Senden blieb
        // der Fokus im Feld, W tippte ein „w", der Avatar stand).
        const chatInput = document.getElementById("chat-input");
        chatInput.addEventListener("keydown", (event) => {
            if (event.key === "Enter") {
                const satz = chatInput.value.trim();
                if (satz) this.processChatCommand(satz);
                this._chatSchliessen();
                event.preventDefault();
            } else if (event.key === "Escape") {
                this._chatSchliessen();
                event.preventDefault();
            }
        });
        this.log("Chat-Steuerung initialisiert", "INFO");

        const fileInput = document.getElementById("state-file-input");
        if (fileInput) {
            fileInput.addEventListener("change", (event) => {
                const file = event.target.files && event.target.files[0];
                if (file) this.handleStateFile(file);
            });
            this.log("State-Import (Lade Datei) initialisiert", "INFO");
        }

        // Voxel ist permanent ab Init (`state.voxelTerrainActive = true`); die initialen Chunks streamt der
        // Ring im Game-Loop — keine Welt-Init-Geste nötig.

        // W18-D — wohnt der Spieler in einer Fremd-Welt, kehrt der Boot
        // durch das Tor zurück (die Heimat trägt darunter eingefroren).
        this._portalDwellingBootReturn();

        this.core.startEternalLoop();
        this.log("Hauptschleife gestartet – Ultiversum pulsiert!", "INFO");
    }

    // Soul-gebundener Sprung-Steilheits-Check: auf zu steilem Hang (state.onSteepSlope) springt nur ein
    // leichter Körper ab — `0.7 × lebendig − 0.3 × dichte` ≥ 0.4 (Phönix 0.42 kann, Drache 0.35 und
    // Mensch 0.31 nicht). Modi schöpfer + frieden überspringen den Check; nur pfad erlebt die Reibung.
    _canSoulJumpFromSlope() {
        if (!this.state.onSteepSlope) return true;
        const mode = this.getGameMode ? this.getGameMode() : "frieden";
        if (mode !== "pfad") return true;
        const tags = (this.state.player && this.state.player.statTags) || {};
        const lebendig = typeof tags.lebendig === "number" ? tags.lebendig : 0.5;
        const dichte = typeof tags.dichte === "number" ? tags.dichte : 0.5;
        const score = 0.7 * lebendig - 0.3 * dichte;
        return score >= 0.4;
    }

    // Decken-Probe: freie Höhe über dem Body-Top (feld-nativer Raycast → Terrain-Dichtefeld UND
    // Struktur-AABBs); Infinity = freier Himmel. Start knapp über der Body-Box (halfExtent 0.5), damit
    // der Strahl nicht den eigenen Körper trifft.
    _ceilingHeadroom() {
        const pm = this.state.playerMesh;
        if (!pm) return Infinity;
        const sf = this.state.scaleFactor || 1;
        const x = pm.position.x,
            y0 = pm.position.y + 0.55,
            z = pm.position.z;
        const rs = this.setVec(this.state.tmpVec1, x / sf, y0 / sf, z / sf);
        const re = this.setVec(this.state.tmpVec2, x / sf, (y0 + 4.5) / sf, z / sf);
        const hitY = this._runRaycast(rs, re, (cb, hit) => {
            if (!hit) return null;
            return cb.get_m_hitPointWorld().y() * sf;
        });
        return hitY === null ? Infinity : Math.max(0, hitY - y0);
    }

    // DIE EINE DECKEN-KLEMME (für handleJump + _parkourLuftsprung): unter niedriger Decke (< 3.4 m
    // Kopfraum) steigt der Sprung nur so hoch wie Kopffreiheit da ist — v = √(2·g·Steighöhe), Marge
    // 0.35 m; sonst schiebt die Penetrations-Recovery den Body durch dünne Decken.
    // Liefert den geklemmten Impuls oder null (< 1.2 m/s = kein Sprung).
    _sprungDeckenKlemme(jumpV) {
        const headroom = this._ceilingHeadroom();
        if (headroom >= 3.4) return jumpV;
        const g = Math.abs(this.state.gravity || -9.81);
        const v = Math.min(jumpV, Math.sqrt(2 * g * Math.max(0, headroom - 0.35)));
        return v < 1.2 ? null : v;
    }

    handleJump(currentTime) {
        // ### Sprunglogik ###
        // Zweck: Abstrahiert Sprungmechanik für bessere Wartbarkeit
        if (this.state.playerVel) {
            const isGrounded = this.isPlayerGrounded();
            // ZENSUS 17.07. — die Coyote-Toleranz wohnt im koerperstudio-
            // Gesetzbuch (fx.bewegung.sprung, _bewegungsBlock fail-soft byte-gleich).
            const withinCoyoteTime =
                currentTime - this.state.lastGroundedTime <=
                AnazhRealm._bewegungsBlock("sprung", ["coyoteSec", "bufferSec"]).coyoteSec;
            if ((isGrounded || withinCoyoteTime) && !this.state.isJumping) {
                // Welle 6.X.3 C3 — Soul-bound: Drache rutscht, Phönix klettert.
                if (!this._canSoulJumpFromSlope()) return;
                const jumpV = this._sprungDeckenKlemme(this.state.jumpPower);
                if (jumpV === null) return; // keine Kopffreiheit — kein Sprung
                // Feld-nativ: der Sprung-Impuls schreibt die vertikale Velocity in
                // `state.playerVel.y` — `_stepCharacter` übernimmt sie als frischen Sprung
                // (`bvy > _fieldVy`). Die Horizontale bleibt unberührt.
                const velocity = this.state.playerVel;
                this.state.playerVel.setValue(velocity.x(), jumpV, velocity.z());
                this.state.isJumping = true;
                this.state.isInAir = true;
                // Ring 5 V2: keine Material-Tint mehr beim Sprung — der
                // Soul-Group hat kein einzelnes Material, und die Sprung-
                // Animation der Glieder ist die ehrlichere Anzeige.
                if (currentTime - this.state.lastJumpLog >= this.state.jumpLogInterval) {
                    this.log("Spieler springt!", "INFO");
                    this.state.lastJumpLog = currentTime;
                }
            }
        }
    }

    // ═══ PARKOUR — DER LUFT-SPRUNG ═══
    // Auf frischen Space-Druck in der Luft (der Boden-Sprung läuft über handleJump): WANDSPRUNG zuerst
    // (Kapsel-Kontakt jünger als parkour.kontaktFrischeSec → jumpPower·wandsprungMul + Abstoß entlang der
    // Kontakt-Normale; der Kontakt wird VERBRAUCHT), sonst DOPPELSPRUNG (doppelspruenge je Luftphase,
    // die Landung füllt auf). Decken-Klemme via _sprungDeckenKlemme; Gesetze aus _parkourGesetz.
    _parkourLuftsprung() {
        const P = AnazhRealm._parkourGesetz();
        if (!P) return false;
        const s = this.state;
        if (s.playerUnderwater || !s.playerVel) return false;
        if (s.player && s.player.mountedArch !== null && s.player.mountedArch !== undefined) return false;
        const nowS = performance.now() / 1000;
        const jp = Number.isFinite(s.jumpPower) ? s.jumpPower : 8;
        // Das Frische-Fenster wohnt im parkour-Gesetz (gilt auch fürs Klettern); das Feld steht in der
        // Gültigkeits-Wand von _parkourGesetz — kein lokaler Fallback.
        const frisch = P.kontaktFrischeSec;
        const wandFrisch =
            Number.isFinite(s._wandKontaktAt) && nowS - s._wandKontaktAt < frisch && Number.isFinite(s._wandKontaktNx);
        let mul = 0;
        let abX = 0;
        let abZ = 0;
        if (wandFrisch) {
            mul = P.wandsprungMul; // ZWILLINGS-ABSCHIED (19.07.): Wand-gedeckt, kein Ternary-Zwilling
            const ab = Number.isFinite(P.wandAbstoss) ? P.wandAbstoss : 6;
            abX = s._wandKontaktNx * ab;
            abZ = s._wandKontaktNz * ab;
            s._wandKontaktAt = -Infinity; // verbraucht — neue Wand, neuer Sprung
        } else if ((s._airJumps | 0) < (P.doppelspruenge | 0)) {
            mul = P.doppelsprungMul; // ZWILLINGS-ABSCHIED (19.07.): Wand-gedeckt, kein Ternary-Zwilling
            s._airJumps = (s._airJumps | 0) + 1;
        } else {
            return false;
        }
        const jumpV = this._sprungDeckenKlemme(jp * mul);
        if (jumpV === null) return false;
        const v = s.playerVel;
        s.playerVel.setValue(v.x() + abX, jumpV, v.z() + abZ);
        s.isJumping = true;
        s.isInAir = true;
        return true;
    }

    // Vertikale Schwimm-Geschwindigkeit, reine Funktion (testbar): Shift taucht ab, Space hebt, ohne
    // Eingabe trägt der Auftrieb den Körper sanft an seine Wasserlinie. currentVy (m/s), depth = Tiefe unter
    // der Wasserlinie des Körpers (m; negativ = darüber — der Körper sinkt zurück), dive/rise = Tasten-Flags
    // → Ziel-vy.
    _swimVerticalVelocity(currentVy, depth, dive, rise) {
        // SCHWIMM-HEIMAT — die Zahlen wohnen im koerperstudio-Gesetzbuch
        // (fx.bewegung.schwimmen, _schwimmGesetz fail-closed).
        const S = AnazhRealm._schwimmGesetz();
        const d = Math.max(-S.tiefeCap, Math.min(S.tiefeCap, depth));
        if (dive) {
            // Abtauchen: Ziel-Sinkgeschwindigkeit −tauchV m/s, lerp-geglättet —
            // überwindet den Auftrieb, der Spieler sinkt kontrolliert.
            return currentVy + (-S.tauchV - currentVy) * S.lerp;
        }
        if (rise) {
            // Auftauchen: aktiv nach oben schwimmen, Ziel +aufV m/s.
            return currentVy + (S.aufV - currentVy) * S.lerp;
        }
        // Neutral: Auftrieb — tiefer = stärkerer Aufwärts-Drift, gedeckelt.
        return Math.min(S.hubCap, Math.max(-S.hubCap, currentVy * S.hubK) + d * S.tiefeK);
    }

    // Vertikale Geschwindigkeit im lifting-Auftriebs-Feld, reine Funktion; strength 0..1 = nächster
    // lifting-Compound. Ein Fall wird gedämpft (bis 85 % bei voller Stärke), ein sanfter Drift hebt —
    // Aufstieg gedeckelt auf 2.5 m/s; eigene Aufwärts-Bewegung (currentVy > 0) wird nicht gebremst.
    _liftVerticalVelocity(currentVy, strength) {
        const s = Math.max(0, Math.min(1, strength || 0));
        const damped = currentVy < 0 ? currentVy * (1 - 0.85 * s) : currentVy;
        const drift = AnazhRealm.LIFTING_DRIFT_PER_SEC * s;
        return Math.min(2.5, damped + drift);
    }

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
                // DER SCHIRM einmal je Takt (die EINE Quelle jeder Schirm-Größe, `_schirm`).
                this._schirmMessen();
                // Foundry so FRÜH wie möglich anwerfen: das Studio-iframe lädt ~1–2 s, und `_ensureAssetFoundry`
                // entstünde sonst erst lazy beim ersten Foundry-Baum (`_foundryRewarmColdTrees` liest `_foundry`,
                // erzeugt es nicht). Billig (nur iframe); das Gate (foundry-aus → null, headless-Null → No-op)
                // prüft `_ensureAssetFoundry` selbst.
                if (!this._foundry) this._ensureAssetFoundry(); // ihr Boot-Fehler bricht in ihr selbst laut (K22)

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

                // ### Region-Übergangs-Detection ###
                // 1×/s reicht (niemand überquert eine 345.6 m-Region in einem Frame). Default OFF
                // (regionsActive=false → no-op); ein Übergang ruft _p2pRegionHandoff(oldKey,newKey).
                if (!this._regionTickLast || currentTime - this._regionTickLast >= 1000) {
                    this._regionTickLast = currentTime;
                    const crossing = this._regionTickDetectCrossing();
                    if (crossing && typeof this._p2pRegionHandoff === "function") {
                        this._p2pRegionHandoff(crossing.oldKey, crossing.newKey);
                    }
                }

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

                // ### Ring 11 V1 — Multi-User Position-Sync ###
                // Broadcast (30 Hz Drosselung intern) + Peer-Mesh-Update + Idle-
                // Purge. No-op wenn p2p.enabled === false oder nicht verbunden.
                this.p2pTick(performance.now());

                // ### Bodenprüfung / Frustum-Culling / UFOs ### (V9.44-f)
                this._loopGroundCheck(currentTime);
                this._loopFrustumCulling();
                this._loopAnimateUfos(currentTime);

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

                // ### Unendliches Terrain — Voxel-Streaming ### (V9.44-f)
                _pt = performance.now();
                this._loopVoxelStreaming();
                this._perfSenseLap("streaming", _pt);

                // ### Skybox-Zeit ### (V9.44-f → _loopSkyboxZeit)
                this._loopSkyboxZeit(currentTime);

                // ### Portal-Membranen ### (V18.464 — die Passage atmet + Hindurchgehen)
                this._tickPortalMembranes(currentTime);

                // ### Haus-Türen ### (DORF-ERLEBNIS — die Tür öffnet sich dem Reisenden)
                this._tickHausTueren(currentTime);

                // ### Der Genesis-Ort ### (Ring der Kern-Portale + Portal-Vorschauen, vor jedem Budget)
                this._tickGenesisOrt(currentTime);

                // ### Kamin-Rauch ### (.105 — Quellen + minimale Lab-Partikel)
                this._updateDorfRauch(delta);

                // ### Fähigkeiten ###
                Object.keys(this.state.abilities).forEach((ability) => {
                    if (this.state.keys[ability]) this.state.abilities[ability](this, this.state);
                });

                // ### Speichern ### (V9.44-f → _loopAutoSave)
                this._loopAutoSave(currentTime);

                // ### Kamera ### (V9.44-f → _loopCamera)
                // V18.355 — PHASE C: VOR der Kamera die Render-Interpolation anwenden (das Auge
                // folgt der glatt interpolierten Spieler-Position, nicht der gestuften Sim-Position).
                this._applyFixedInterpolation();
                this._loopCamera(currentTime);

                // Ring 5 V2: Soul-Animation. Glieder/Flügel/Schweif werden
                // jeden Frame über sin/cos relativ zum aktuellen walkPhase
                // rotiert. Idle-Loop (atmen, hover) läuft auch im Stand.
                this.animatePlayerSoul(currentTime);

                // Ring 6 V2: Culling-Tick (1 Hz) — baut/disposed Meshes je nach
                // Spieler-Distanz. Daten-Einträge bleiben immer.
                _pt = performance.now();
                this.tickArchitectureCulling();
                this._perfSenseLap("archCulling", _pt);
                // Ring 6 V2: Bau-Modus — Phantom-Position nachziehen wenn aktiv.
                this.tickBuildMode();
                // Ring 6: Bau-Werke mit Animations-Hook (nur Wasserfälle aktuell).
                this.tickArchitectures(currentTime);
                // Welle 10b.3 — Affordance-Welt-Reaktionen: mounted-Movement +
                // focusing-Hitze-Tick. Magnifying läuft asynchron via Tastendruck.
                this.tickAffordances(delta);

                // V9.75 (Welle C.4+5) — kein reaktiver Hydro-Tick mehr. Die
                // Welle-A-Maschinerie ist weg; Cell-Feld ist DERIVED (V9.74),
                // Wasser-Reaktion läuft via Voxel-Chunk-Rebuild.

                // ### Rendering ###
                // VOR dem Render: entscheiden, ob die Schatten-Map neu muss (im Stand gecacht). Eine erste Zeichnung baut
                // verteilt und kompiliert asynchron (die Erst-Zeichnung, `_configureRenderer`) — kein Vorwärmen.
                this._kernPflichtWand();
                // DIE GPU-LEINE: sind schon GPU_FRAMES_IM_FLUG Frames unterwegs, schickt dieser Takt nichts an die GPU
                // (Simulation, Eingabe und Streaming laufen weiter) — sonst lief die CPU der GPU davon (_gpuLeineFrei).
                if (this._gpuLeineFrei()) {
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
    // Zähler lebt an diesem Chokepoint (Frei-Prüfung vor dem Render, Anmelden nach den Submits des Frames).
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
    // bevor das Bild steht — und sobald keine Lücke mehr fehlt: das Bild, nach dem `_ankunftsBild` urteilt. Radeon kalt
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
}
