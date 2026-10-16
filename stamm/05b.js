class AnazhRealm_Z05b {
    // ===== ATLAS §05b · UI-GRUNDIERUNG — Block Dirigent =====
    // FPS als gleitender 1-s-Durchschnitt: ein Einzel-Frame ist vsync-gekoppelt (exakt 1/Refreshrate),
    // zeigt nur 120/60/40/30… und flackert. Kein Pro-Frame-Log (Konsolen-Flut).
    updateFps(delta) {
        if (!(delta > 0) || delta > 0.5) {
            // Erster Frame / Tab war inaktiv → Fenster verwerfen, sauber neu.
            this.state._fpsFrames = 0;
            this.state._fpsElapsed = 0;
            return;
        }
        this.state._fpsFrames += 1;
        this.state._fpsElapsed += delta;
        if (this.state._fpsElapsed >= 1.0) {
            const fps = Math.round(this.state._fpsFrames / this.state._fpsElapsed);
            this.state.fps = fps;
            this.state._fpsFrames = 0;
            this.state._fpsElapsed = 0;
            const fpsDiv = typeof document !== "undefined" ? document.getElementById("fps") : null;
            if (fpsDiv) fpsDiv.innerText = `FPS: ${fps}`;
            // Leise Konsole: die Zahl lebt im HUD (#fps) + perf-Overlay; geloggt wird nur ein ECHTER Einbruch
            // (> 30 % unter die laufende Referenz, gedrosselt via Referenz-Reset).
            const ref = this._fpsLogRef || fps;
            if (fps < ref * 0.7 && fps < 45) {
                this.log(`FPS-Einbruch: ${fps} (zuvor ~${Math.round(ref)})`, "WARN");
            }
            // EWMA-Referenz (träge, Instanz-Feld wie _editSaveTimer — nicht serialisiert).
            this._fpsLogRef = ref * 0.9 + fps * 0.1;
        }
    }

    // ===== DER PERFORMANCE-REGELKREIS (der Nexus WERTET seine Last) ===
    // EIN Feld (perfSense: ms/Frame je Subsystem), EINE Wertung (δ = Ist − Soll Frame-Zeit), EIN PID,
    // der das TEUERSTE Subsystem zuerst nachgeben lässt: Architektur (Cull-Radius/Build-Budget),
    // Streaming (Stream-Budget/MaxPerFrame), Wasser-Iso-Budget. `_nexusAdaptiveQuality(fps)` speist nur
    // DENSELBEN Regler. SENSE (immer an): `_perfSenseLap` je Loop-Phase, `_perfMark` für Sub-Signale.
    _perfSenseLap(label, since) {
        const now = performance.now();
        const s = this.state._perfFrame || (this.state._perfFrame = {});
        s[label] = (s[label] || 0) + (now - since);
        return now;
    }

    _perfMark(field, ms) {
        const f = this.state._perfMarks || (this.state._perfMarks = {});
        f[field] = (f[field] || 0) + 1;
        if (ms != null) {
            f[field + "Ms"] = (f[field + "Ms"] || 0) + ms;
            if (ms > (f[field + "Max"] || 0)) f[field + "Max"] = ms;
        }
    }

    _perfSenseInit() {
        const phase = {};
        const phaseMax = {};
        for (const k of AnazhRealm.PERF_PHASES) {
            phase[k] = 0;
            phaseMax[k] = 0;
        }
        return {
            phase, // EWMA ms/Frame je Subsystem — „was wieviel Leistung zieht"
            // V18.268 — der SPIKE neben dem Mittel: abklingender Max je Subsystem. Die
            // EWMA (α=0.12) glättet einen 157-ms-Einmal-Spike auf ~9 ms WEG → das System
            // war blind für Hitches. phaseMax fängt den Worst-Case (die echte Stocker-Quelle).
            phaseMax,
            // V18.268 — die GPU-RENDER-LAST (vorher gar nicht gemessen — der dominante
            // „kann mich nicht umsehen"-Posten). Draw-Calls + Dreiecke/Frame, EWMA + Max.
            renderCalls: 0,
            renderTris: 0,
            renderCallsMax: 0,
            renderTrisMax: 0,
            frameMs: AnazhRealm.PERF_TARGET_MS,
            frameMaxMs: AnazhRealm.PERF_TARGET_MS,
            // PRO-EINHEIT-KOSTEN (der Keim der Produktions-Ökonomie):
            perCreatureMs: 0,
            perChunkBuildMs: 0,
            // Streaming-Gesundheits-Sub-Signale (gemessen, nicht geraten):
            syncBuildN: 0,
            syncBuildMs: 0,
            workerMeshN: 0,
            bvhMs: 0,
            // Regler-Start = der GERÄTE-SEED (_geraeteReglerSeed): ein Prior aus der EINEN Profil-Quelle
            // (_geraeteProfil — Klasse × Pixel-Fläche), nie ein Urteil; der PID korrigiert ab Frame 1.
            // Headless: Seed 1.
            loadScale: this._geraeteReglerSeed(), // 1 = volle Qualität, 0 = max gedrosselt
            seedStart: this._geraeteReglerSeed(), // Telemetrie: was der Seed entschied (Flugschreiber)
            pidPrevErr: 0,
        };
    }

    // FOLD am Frame-Ende: Pro-Frame-Akkus per EWMA in den geglätteten Sense falten, dann den Regler
    // treiben. frameMs = echte Frame-Zeit (delta·1000) — fängt die Block-Spikes eines Sync-Builds.
    _perfSenseFoldFrame(frameMs, dtSec) {
        const st = this.state;
        let sense = st.perfSense;
        if (!sense) sense = st.perfSense = this._perfSenseInit();
        // W1 — DIE EWMA-NaN-WAND (zweite Hälfte der Loop-Eingangs-Wand): ein einziger
        // nicht-finiter frameMs würde die EWMA dauerhaft vergiften (ewma(NaN,·)=NaN →
        // der Regler für immer im Totband). Kein Aufrufer kann das Gedächtnis brechen.
        if (!Number.isFinite(frameMs)) frameMs = Number.isFinite(sense.frameMs) ? sense.frameMs : 16.7;
        const f = st._perfFrame || {};
        const m = st._perfMarks || {};
        const A = AnazhRealm.PERF_SENSE_ALPHA;
        const ewma = (prev, x) => prev + A * (x - prev);
        // "streaming" wrappt _loopVoxelStreaming (inkl. dem genesteten waterIso) →
        // für DISJUNKTE Phasen das Wasser abziehen (sonst doppelt gezählt im Aktuator).
        const streamingExcl = Math.max(0, (f.streaming || 0) - (f.waterIso || 0));
        if (!sense.phaseMax) sense.phaseMax = {};
        for (const k of AnazhRealm.PERF_PHASES) {
            const v = k === "streaming" ? streamingExcl : f[k] || 0;
            sense.phase[k] = ewma(sense.phase[k] || 0, v);
            // V18.268 — der Spike neben dem Mittel (abklingender Max): die EWMA glättet
            // einen Hitch weg, phaseMax behält ihn ~1 s sichtbar (0.92/Frame-Abkling).
            sense.phaseMax[k] = Math.max(v, (sense.phaseMax[k] || 0) * 0.92);
        }
        // V18.268 — die GPU-Render-Last (Draw-Calls + Dreiecke), EWMA + abklingender Max.
        sense.renderCalls = ewma(sense.renderCalls || 0, f.renderCalls || 0);
        sense.renderTris = ewma(sense.renderTris || 0, f.renderTris || 0);
        sense.renderCallsMax = Math.max(f.renderCalls || 0, (sense.renderCallsMax || 0) * 0.92);
        sense.renderTrisMax = Math.max(f.renderTris || 0, (sense.renderTrisMax || 0) * 0.92);
        sense.frameMs = ewma(sense.frameMs, frameMs);
        sense.frameMaxMs = Math.max(frameMs, sense.frameMaxMs * 0.92); // abklingende Spitze
        const nCre = st.creatures ? st.creatures.length : 0;
        sense.perCreatureMs = ewma(sense.perCreatureMs, nCre > 0 ? (f.creatures || 0) / nCre : 0);
        // ein gebauter Chunk je Frame kostet ~syncBuildMs (sync) ODER ~bvhMs (worker+BVH)
        sense.syncBuildN = ewma(sense.syncBuildN, m.syncBuild || 0);
        sense.syncBuildMs = ewma(sense.syncBuildMs, m.syncBuildMs || 0);
        sense.workerMeshN = ewma(sense.workerMeshN, m.workerMesh || 0);
        sense.bvhMs = ewma(sense.bvhMs, m.bvhMs || 0);
        sense.perChunkBuildMs = ewma(sense.perChunkBuildMs, (m.syncBuildMs || 0) + (m.bvhMs || 0));
        // `gpuMs` lebt im selben phase/phaseMax-Objekt (EWMA + abklingender Max), aber BEWUSST NICHT in
        // PERF_PHASES — die trägt CPU-Semantik (cpuSum, CPU-Verdikt, Spike-Suche), GPU-Zeit vergiftete sie.
        // Quelle: echter timestamp-query (`_perfGpuSample` → "echt", 1 Frame Latenz) oder der Proxy
        // frameMs − ΣCPU ("proxy", enthält vsync/GC). Rohwerte reisen als f-Passagiere in den Flugschreiber.
        const gpu = this._perfGpuSample(frameMs, f);
        f.gpuMs = gpu.ms;
        f.gpuQuelle = gpu.quelle;
        sense.phase.gpuMs = ewma(sense.phase.gpuMs || 0, gpu.ms);
        sense.phaseMax.gpuMs = Math.max(gpu.ms, (sense.phaseMax.gpuMs || 0) * 0.92);
        sense.gpuQuelle = gpu.quelle;
        this._perfGpuResolveKick(); // fire-and-forget — das Ergebnis landet im NÄCHSTEN Frame
        // Pipeline-Compiles: Frame-Delta von renderer._pipelines.caches.size (vendor r184, reine Lesung).
        // dispose() leert caches → Schrumpfen zählt nie negativ; ohne die Map (Null-Renderer/WebGL) → 0.
        // Reist als f-Passagier (wie f.gpuMs).
        let nPipes = 0;
        try {
            const p = st.renderer && st.renderer._pipelines;
            if (p && p.caches && typeof p.caches.size === "number") nPipes = p.caches.size;
        } catch {
            nPipes = 0; // fremde Renderer-Formen — der Zähler bleibt ehrlich 0
        }
        f.pipelinesNeu = Math.max(0, nPipes - (Number.isFinite(this._pipeLast) ? this._pipeLast : nPipes));
        this._pipeLast = nPipes;
        sense.pipesTotal = nPipes;
        // HITCH-TELEMETRIE (das-feld-zeichnet §5.1) — (d) UPLOAD-BYTES: den Laufzeit-
        // Tap-Akku (queue.writeBuffer, Anbau an der rendererReady-Naht) je Frame
        // konsumieren + nullen; EWMA für Panel/steadyState (uploadKBProS).
        f.uploadBytes = this._uploadBytesAcc || 0;
        this._uploadBytesAcc = 0;
        sense.uploadBytesEwma = ewma(sense.uploadBytesEwma || 0, f.uploadBytes);
        // V18.293 — DER FLUGSCHREIBER: die ROHEN Frame-Werte (f/m) fangen, BEVOR sie
        // zurückgesetzt werden. Bulletproof gekapselt — diese Fold-Funktion läuft
        // außerhalb der Loop-Fehler-Grenze (V18.278), ein Wurf hier bräche den Loop.
        this._flightRecorderTick(frameMs, dtSec, f);
        st._perfFrame = {};
        st._perfMarks = {};
        this._nexusPerfRegulate(dtSec); // die RÜCKKOPPLUNG
        if (st.perfOverlay) this._perfSenseRender(); // der Debug-Dump (Entwickler, `perf`-Chatbefehl)
        this._perfPanelRender(); // V18.389 — das saubere Standalone-Panel (default sichtbar)
    }

    // Echte GPU-Zeit statt Proxy: frameMs − ΣCPU enthält vsync/GC/Compositor und lügt unter vsync-Druck.
    // Der vendored r184-WebGPURenderer fordert timestamp-query nur an, wenn adapter.features es trägt
    // (sonst trackTimestamp aus, der Proxy bleibt Quelle). `renderer.resolveTimestampsAsync("render")`
    // (ms) löst ASYNC über mapAsync — der Loop blockt nie, das Ergebnis landet 1 Frame später.
    // "echt" nur, wenn eine Auflösung gelandet UND frisch ist (< PERF_GPU_TS_STALE_MS), sonst "proxy".
    _perfGpuSample(frameMs, f) {
        const nowMs = typeof performance !== "undefined" && performance.now ? performance.now() : Date.now();
        if (
            Number.isFinite(this._gpuTsLast) &&
            Number.isFinite(this._gpuTsAtMs) &&
            nowMs - this._gpuTsAtMs < AnazhRealm.PERF_GPU_TS_STALE_MS
        ) {
            return { ms: this._gpuTsLast, quelle: "echt" };
        }
        // der heutige Proxy (dieselbe Rechnung wie gpuGapMs im Flugschreiber-Snapshot)
        let cpuSum = 0;
        for (const k of AnazhRealm.PERF_PHASES) cpuSum += f[k] || 0;
        return { ms: Math.max(0, frameMs - cpuSum), quelle: "proxy" };
    }

    // Async-Leser (fire-and-forget): EIN Resolve in Flug (Guard `_gpuTsPending`), Ergebnis in
    // `_gpuTsLast`/`_gpuTsAtMs` (Instanz-Felder, nie serialisiert). `backend.trackTimestamp` ist die
    // EINE Wahrheit; jeder Wurf wird geschluckt — der Pfad läuft außerhalb der Loop-Fehler-Grenze.
    _perfGpuResolveKick() {
        const st = this.state;
        const r = st.renderer;
        if (!r || r._isHeadlessNull || !st.rendererReady || st._deviceLost) return;
        if (this._gpuTsPending) return;
        if (!r.backend || r.backend.trackTimestamp !== true) return;
        if (typeof r.resolveTimestampsAsync !== "function") return;
        this._gpuTsPending = true;
        try {
            r.resolveTimestampsAsync("render").then(
                (v) => {
                    this._gpuTsPending = false;
                    if (Number.isFinite(v) && v >= 0) {
                        this._gpuTsLast = v;
                        this._gpuTsAtMs =
                            typeof performance !== "undefined" && performance.now ? performance.now() : Date.now();
                    }
                },
                () => {
                    this._gpuTsPending = false; // Reject fail-soft — der Proxy bleibt die Quelle
                }
            );
        } catch (_e) {
            this._gpuTsPending = false; // synchroner Wurf fail-soft (fremde/alte Renderer-Formen)
        }
    }

    // PID-Regler: δ = Ist − Soll (Frame-Zeit), Velocity-Form auf `loadScale` ∈ [0..1] — loadScale
    // trägt das Integral-Gedächtnis (glatt), die Sättigung [0,1] ist das Anti-Windup.
    // err>0 (zu teuer) → loadScale fällt → drosseln; err<0 (Luft) → loadScale steigt → relax.
    _nexusPerfRegulate(dtSec) {
        const st = this.state;
        const sense = st.perfSense;
        if (!sense || st.perfRegulator === false) return;
        const dt = Math.max(0.004, Math.min(0.1, dtSec || 0.016));
        // Totband: EIN Sollwert für Wachsen UND Drosseln parkt den Fixpunkt exakt am Anschlag (≈59 fps).
        // Darum zwei Schwellen, EIN Regler: drosseln erst über der Decke (`throttleMs`, ≈59 fps), wachsen
        // nur unter `growMs` = Decke − PERF_HEADROOM_MS (≈77 fps); dazwischen err=0 → halten.
        const throttleMs = Number.isFinite(st.perfTargetMs) ? st.perfTargetMs : AnazhRealm.PERF_TARGET_MS;
        const growMs = Math.max(1, throttleMs - AnazhRealm.PERF_HEADROOM_MS);
        let err; // skaleninvariant; 0 im Totband
        // DER LADESCHIRM MISST NICHTS (K60-3): unter dem Lade-Takt zeigt kein Frame die Welt — sein Abstand ist die Kadenz des
        // Lade-Bilds (LADE_BILD_MS), seine Last die Erst-Zeichnung, nie die Last des Spiels. Das Integral hält, der Seed trägt das
        // erste Weltbild; gemessen wird ab dem ersten Frame, der die Welt zeigt. Prüfung K60-3 Runde 2 (Radeon kalt): der PID
        // trieb loadScale an 500-ms-Lade-Bildern auf 0 (gate:regler-sim S7: 0 statt Seed 0,7).
        if (this._ladeTakt()) err = 0;
        else if (sense.frameMs > throttleMs)
            err = (sense.frameMs - throttleMs) / throttleMs; // zu langsam → drosseln (loadScale ↓)
        else if (sense.frameMs < growMs)
            err = (sense.frameMs - growMs) / growMs; // Kopfraum → wachsen (loadScale ↑)
        else err = 0; // Totband → halten
        const K = AnazhRealm.PERF_PID;
        // velocity-PID: Δu = Kp·Δe + Ki·e·dt + Kd·(e−2e'+e'')/dt → loadScale −= Δu
        const dErr = err - sense.pidPrevErr;
        const du = K.p * dErr + K.i * err * dt + K.d * (dErr / dt) * 0; // D klein gehalten (Rauschen)
        sense.pidPrevErr = err;
        sense.loadScale = Math.max(0, Math.min(1, sense.loadScale - du));
        this._nexusPerfActuate(sense);
    }

    // AKTUIEREN — die EINE Stelle für ALLE Qualitäts-Stellgrößen: loadScale × Kosten-Anteil je
    // Subsystem. Das TEUERSTE regelbare Subsystem (Architektur/Streaming/Wasser, aus dem gemessenen
    // Sense) gibt ZUERST nach. loadScale=1 → alle Stellgrößen auf Maximum.
    _nexusPerfActuate(sense) {
        const st = this.state;
        const ls = sense.loadScale;
        const p = sense.phase;
        // Die drei regelbaren Domänen + ihre gemessene Last. Die GPU-Render-Last (`sense.renderCalls` ×
        // PERF_RENDER_CALL_MS) zählt zur Architektur (Cull-Radius + Schatten-Intervall skalieren sie):
        // `p.render` ist nur CPU-Zeit — ohne den Draw-Call-Proxy drosselte der Regler das Streaming,
        // während der Schatten-Pass ungebremst lief.
        const renderLoadMs = (sense.renderCalls || 0) * AnazhRealm.PERF_RENDER_CALL_MS;
        const cArch = (p.archCulling || 0) + (p.render || 0) + renderLoadMs;
        const cStream = p.streaming || 0;
        const cWater = p.waterIso || 0;
        const tot = cArch + cStream + cWater + 1e-6;
        const maxShare = Math.max(cArch, cStream, cWater) / tot;
        // eff(c): 1 = unangetastet, ls = voll gedrosselt. Das teuerste Subsystem
        // (share == maxShare) trägt (1−ls) VOLL; billigere nur anteilig.
        const eff = (c) => {
            if (maxShare < 1e-6) return ls; // keine Last-Info → uniform drosseln
            const rel = c / tot / maxShare; // ∈ [0..1], 1 = das teuerste
            return Math.max(0, Math.min(1, 1 - (1 - ls) * rel));
        };
        const cl = (v) => Math.max(0, Math.min(1, v));
        const lerp = (a, b, t) => a + (b - a) * cl(t);
        const L = AnazhRealm.PERF_LEVERS;
        const effArch = eff(cArch),
            effStream = eff(cStream),
            effWater = eff(cWater);
        // Frame über Budget = gemessene Frame-ZEIT über dem Drossel-Sollwert (nie ein Draw-Call-Proxy,
        // der Welt-Größe mit Render-Druck verwechselt). Steuert NUR sichtbare Deko-Arbeit (Laub-Wachstum/
        // Dichte/Dünnen); das Streaming (= Bewegung) bleibt unangetastet.
        // Unter dem Ladeschirm zeigt kein Frame die Welt (`_ladeTakt`): kein Frame reißt ein Budget.
        st._frameOverBudget =
            !this._ladeTakt() &&
            sense.frameMs > (Number.isFinite(st.perfTargetMs) ? st.perfTargetMs : AnazhRealm.PERF_TARGET_MS);
        // Architektur (vormals der Bang-Bang-Governor — jetzt EINE Quelle): das Ziel; der Radius selbst geht
        // durch dieselbe Grenzzyklus-Wand wie das Laub (unten).
        const archZiel = lerp(AnazhRealm.ARCH_QUALITY_RADIUS_MIN, AnazhRealm.ARCH_QUALITY_RADIUS_MAX, effArch);
        st.architectureBuildBudgetPerFrame = Math.round(
            lerp(AnazhRealm.ARCH_QUALITY_BUDGET_MIN, AnazhRealm.ARCH_QUALITY_BUDGET_MAX, effArch)
        );
        // Kapazitäts-gewachsene Welt: `foliageRadius` startet KLEIN und rampt zum perf-geregelten Ziel
        // (`effArch`, dieselbe loadScale-PID-Quelle); steigt die Last, sinkt das Ziel, der Radius schrumpft.
        // Headless (Null-Renderer) → sofort MAX, damit das Gate die volle Welt sieht.
        if (st.renderer && st.renderer._isHeadlessNull) {
            st.foliageRadius = AnazhRealm.PERF_FOLIAGE_RADIUS_MAX;
            st.architectureCullingRadius = archZiel;
            st._foliageDensityScale = 1;
        } else {
            // Der Radius wächst Chunk für Chunk nach Kapazität (die Dichte lebt PRO Chunk);
            // nie den Sicht-Radius erzwingen.
            let frTarget = lerp(AnazhRealm.PERF_FOLIAGE_RADIUS_MIN, AnazhRealm.PERF_FOLIAGE_RADIUS_MAX, effArch);
            // Die Vegetation wächst MIT dem Boden, nie voraus: das Ziel auf die gebaute Ring-Kante kappen
            // (`_activeRingRadius`) — sonst rast der Radius in leeren Boot-Frames auf MAX und bepflanzt
            // einen fernen Billboard-Ring vor dem Terrain.
            const { span: _frSpan } = this._voxelChunkConfig();
            const _ringR =
                st._activeRingRadius != null
                    ? st._activeRingRadius
                    : Math.max(1, Math.min(12, st.chunkRingRadius || 4));
            const _ringReach = (_ringR + 1) * _frSpan; // die Außenkante des gebauten Rings in Metern
            frTarget = Math.min(frTarget, _ringReach);
            const frCur = st.foliageRadius != null ? st.foliageRadius : AnazhRealm.PERF_FOLIAGE_RADIUS_MIN;
            const step = AnazhRealm.PERF_FOLIAGE_GROW_STEP;
            // Grenzzyklus-Wand: ein atmender Radius baut dieselben Rand-Zellen immer neu (Worker-Flut).
            // (1) WACHSEN nur nach PERF_FOLIAGE_GROW_RUHE_S Sim-Sekunden ohne Über-Budget (Sim-Zeit via
            // sense.frameMs, nie Wanduhr — gate:regler-sim bleibt deterministisch); auch echtes gpuMs über
            // der Decke setzt die Ruhe-Uhr zurück (nur Quelle "echt" — der Proxy lügt bei Stalls).
            // (2) SCHRUMPFEN erst ab dem Totband (PERF_FOLIAGE_SHRINK_TOTBAND) — kleine Dips flattern nicht.
            const _gpuVoll =
                sense.gpuQuelle === "echt" &&
                sense.phase &&
                Number.isFinite(sense.phase.gpuMs) &&
                sense.phase.gpuMs > (Number.isFinite(st.perfTargetMs) ? st.perfTargetMs : AnazhRealm.PERF_TARGET_MS);
            if (st._frameOverBudget || _gpuVoll) this._folRuheSec = 0;
            else this._folRuheSec = (this._folRuheSec || 0) + Math.min(0.3, (sense.frameMs || 17) / 1000);
            const _frRuhig = (this._folRuheSec || 0) >= AnazhRealm.PERF_FOLIAGE_GROW_RUHE_S;
            // DIE EINE Wand für JEDE Stellgröße, die ein Fege-Takt liest: die beiden Cull-Radien (Laub + Architektur) und
            // die Laub-Dichte. Ohne sie folgte der Architektur-Radius dem PID Frame für Frame (gemessen 04.10., echte GPU,
            // Mess-Wiese: 100↔150 m, 30 Wechsel in 94 Frames): Bauten am Rand wurden gecullt und vom Foundry-Rewarm sofort
            // neu gebaut, je Runde nahmen die großen Region-Bundles in allen drei Pässen neu auf — die CPU trieb den Regler,
            // der Regler den Radius. Die Dichte lief bis 0910-7 ohne sie: wo der Regler mitten in seiner Spanne steht,
            // pendelte sie je Takt um ihr Ziel (+Schritt, −2 Schritte; OMEN, V18.538, Regler frei: Wechsel in 0,52 der
            // Frames). Jeder Wechsel weckte über den Stand-Stempel jeden Fege-Takt zu einer vollen Runde über den Bestand
            // (Stufen-Wahl 299 Einheiten je Frame statt 34) und über `uLodPerf` die Lage jedes Passes (die Satz-Wahl und
            // die Höhlen-Sicht rechneten je Pass neu) — CPU-Takt p95 4,8 → 11,7 ms. Das Totband ist für jede Größe derselbe
            // Anteil ihrer Spanne (SHRINK_TOTBAND über die Spanne des Laub-Radius).
            const wand = (cur, ziel, schritt, totband, darfWachsen) =>
                cur < ziel
                    ? _frRuhig && darfWachsen
                        ? Math.min(ziel, cur + schritt)
                        : cur
                    : ziel < cur - totband
                      ? Math.max(ziel, cur - schritt * 2)
                      : cur;
            const TOT = AnazhRealm.PERF_FOLIAGE_SHRINK_TOTBAND;
            // DIE REICHWEITE DES ERSTEN WELTBILDS (K60-3): die Wand schützt den Takt, den der Spieler sieht — unter dem Lade-Takt
            // sieht keiner den Radius atmen, und sie hielt das Weltbild klein. Laub- und Architektur-Radius stehen dort an ihrem
            // Ziel (das Laub an der Kante des gebauten Rings), `_weltbildLuecken` urteilt an der ganzen Reichweite. Prüfung K60-3
            // Runde 2 (Radeon kalt): das Bild stand mit 65 statt 129,6 m Laub, 4 von 25 Chunks bepflanzt, 57 statt 338 Bäume —
            // der Radius wuchs nur in ruhigen Takten, und unter dem Ladeschirm (ein Bild je LADE_BILD_MS) kam keiner.
            const reichweite = (cur, ziel) => (this._ladeTakt() ? ziel : wand(cur, ziel, step, TOT, true));
            st.foliageRadius = reichweite(frCur, frTarget);
            st.architectureCullingRadius = reichweite(
                Number.isFinite(st.architectureCullingRadius) ? st.architectureCullingRadius : archZiel,
                archZiel
            );
            // Kapazitäts-gewachsene Dichte: `_foliageDensityScale` skaliert die Instanz-Zahl je Zelle (die Last-Dichte der
            // Nah-Streu, `_nahStreuKachel`) → unter Last weniger Dreiecke. Kaltstart-Wand: das Laub ist ~90 % der GPU-Last,
            // die leere Start-Welt hat aber Luft — wüchse die Dichte da, buken die ersten Chunks DICHT (Freeze). Solange die
            // Welt STREAMT (Rückstau), wächst sie nicht: Start-Chunks backen an PERF_FOLIAGE_DENSITY_MIN.
            const fdMin = AnazhRealm.PERF_FOLIAGE_DENSITY_MIN;
            const fdCur = st._foliageDensityScale != null ? st._foliageDensityScale : fdMin;
            const streamBusy = !!(st.voxelMeshPending && st.voxelMeshPending.size > 0);
            st._foliageDensityScale = wand(
                fdCur,
                lerp(fdMin, 1, effArch),
                AnazhRealm.PERF_FOLIAGE_DENSITY_GROW_STEP,
                (TOT / (AnazhRealm.PERF_FOLIAGE_RADIUS_MAX - AnazhRealm.PERF_FOLIAGE_RADIUS_MIN)) * (1 - fdMin),
                !streamBusy
            );
        }
        // DIE AUFLÖSUNG IST KEIN STELLGLIED DES REGLERS (K50): die Szene rendert in der EINEN Szenen-Skala (`_szeneSkalaWirk`,
        // der Spieler setzt sie), die zeitliche Auflösung löst auf die Ausgabe auf — ein Ziel-Wechsel je Last war die
        // Destroyed-Klasse (realloc-tod 20.07.). Der Regler trägt die Pixel-Kappe der Geräte-Klasse (`_applyRenderScale`).
        if (!(st.renderer && st.renderer._isHeadlessNull)) this._applyRenderScale();
        // Der Schatten-Pass (ein zweiter Voll-Render) unter dem EINEN Regler: `effArch` skaliert die
        // Schatten-Reichweite zwischen Last-Floor und User-Ceiling (`atmosphere.shadowRange`) — unter Last
        // schrumpft das Frustum (weniger Caster, schärfere Nah-Schatten); jenseits ~150 m deckt der Nebel.
        // Dead-Band 6 m gegen updateProjectionMatrix-Churn; headless → Ceiling.
        if (!(st.renderer && st.renderer._isHeadlessNull) && typeof this._applyEffectiveShadowRange === "function") {
            const srCeil =
                st.atmosphere && Number.isFinite(st.atmosphere.shadowRange)
                    ? st.atmosphere.shadowRange
                    : AnazhRealm.PERF_SHADOW_RANGE_MAX;
            const srTarget = lerp(AnazhRealm.PERF_SHADOW_RANGE_MIN, srCeil, effArch);
            const srApplied = Number.isFinite(this._shadowRangeApplied) ? this._shadowRangeApplied : srCeil;
            if (Math.abs(srTarget - srApplied) > 6) this._applyEffectiveShadowRange(srTarget);
        }
        // Godray-Hebel unter dem EINEN Regler (`effArch`): die Licht-Schäfte sind reine Optik und geben
        // zuerst nach — Kopfraum → PERF_GODRAY_MAX, anhaltende Last → 0. `_loopRender` liest `_godrayScale`
        // × Sonnen-Sichtbarkeit. Headless → MAX.
        if (st.renderer && st.renderer._isHeadlessNull) {
            st._godrayScale = AnazhRealm.PERF_GODRAY_MAX;
        } else {
            st._godrayScale = lerp(0, AnazhRealm.PERF_GODRAY_MAX, effArch);
        }
        // Lade-Rhythmus-Ring: der Ziel-Ring (chunkRingRadius) wird beim Boot durch `_activeRingRadius`
        // gedeckelt und wächst nur, wenn der aktuelle Ring VOLL steht, kein Bau-Rückstau, Kopfraum (effArch,
        // derselbe PID) und ein kurzer Atem verging — die Welt wächst so schnell, wie die Last sie trägt.
        // Headless → sofort TARGET. Nebel + Laub folgen.
        const ringTarget = Math.max(1, Math.min(12, st.chunkRingRadius || 4));
        if (st.renderer && st.renderer._isHeadlessNull) {
            st._activeRingRadius = ringTarget;
        } else {
            if (st._activeRingRadius == null) st._activeRingRadius = Math.min(ringTarget, AnazhRealm.RING_RAMP_START);
            // Existenz-Boden: bis RING_EXIST_FLOOR wächst der Ring OHNE Kopfraum-Gate — auf Holz, dessen Frame
            // ab Bild 1 über dem Totband liegt, entstünde die Welt sonst nie. Geordnet bleibt es (settled, kein
            // Rückstau, Wiese, Atem); darunter schrumpft nichts, der PID atmet nur darüber.
            const ringFloor = Math.min(ringTarget, AnazhRealm.RING_EXIST_FLOOR);
            // Der Ring atmet in beide Richtungen: bei ANHALTENDER Überlast schrumpft er (nur monoton wachsen
            // overshootet und klemmt fest). Geprunt wird NUR die äußerste Schale (`_pruneDistantVoxelChunks`
            // mit +1-Hysterese), NIE der Boden unter dem Spieler. EIN Aktuator, kein Parallel-Regler.
            const built = this._builtRingRadius();
            const ringSettled = built !== null && built >= st._activeRingRadius;
            const noBacklog = !st.voxelMeshPending || st.voxelMeshPending.size === 0;
            // Der Ring wächst erst, wenn die Wiese des aktuellen Rings steht (Terrain eilt dem Gras nicht
            // voraus). `pendingGrass` hält nur nahe gebaute Chunks mit nachziehendem Gras — drainiert jeden
            // Frame, kein Deadlock.
            const grassCaughtUp = !st.pendingGrass || st.pendingGrass.size === 0;
            const now = performance.now();
            const breathed = !st._ringRampLast || now - st._ringRampLast > AnazhRealm.RING_RAMP_SETTLE_MS;
            // Wachsen verlangt KLAREN Kopfraum (frameMs < growMs ≈ 77 fps, die Totband-Schwelle des PID),
            // nicht bloß „unter der Decke" — sonst wächst er bis an den Anschlag und overshootet.
            const throttleMs = Number.isFinite(st.perfTargetMs) ? st.perfTargetMs : AnazhRealm.PERF_TARGET_MS;
            const growMs = Math.max(1, throttleMs - AnazhRealm.PERF_HEADROOM_MS);
            const hasHeadroom = sense.frameMs < growMs;
            // Wachsen braucht ANHALTENDEN Kopfraum (Wachs-Hysterese, größer als die Schrumpf-Hysterese →
            // Bias zur stabilen kleineren Welt); ein leichter Boot-Frame allein ratscht sonst hoch. Der Timer
            // startet bei frameMs < growMs und resetet nur bei ECHTER Überlast (> throttleMs); ein Frame im
            // Totband HÄLT ihn (sonst stallte periodischer Chunk-Bau das Wachsen für immer).
            if (hasHeadroom) {
                if (!st._ringHeadroomSince) st._ringHeadroomSince = now;
            } else if (sense.frameMs > throttleMs) {
                st._ringHeadroomSince = 0;
            }
            // Boot-Fenster der Ring-Ramp: die volle Wachs-Hysterese je Schritt wäre ein hardware-unabhängiger
            // Zeit-Boden (≥7 s bis zum Ziel-Ring). Solange der Ziel-Ring nie stand und RING_BOOT_WINDOW_MS
            // offen ist, gilt der kurze Sustain (RING_RAMP_SETTLE_MS); gewachsen wird trotzdem nie unter Last.
            // Das Fenster schließt beim Erst-Erreichen, beim ersten Schrumpf oder am Zeit-Deckel.
            if (!st._ringBootWindowUntil) st._ringBootWindowUntil = now + AnazhRealm.RING_BOOT_WINDOW_MS;
            const _bootWindow = st._ringBootWindowUntil > 1 && now < st._ringBootWindowUntil;
            const _growSustainMs = _bootWindow ? AnazhRealm.RING_RAMP_SETTLE_MS : AnazhRealm.RING_GROW_SUSTAIN_MS;
            const sustainedHeadroom = st._ringHeadroomSince && now - st._ringHeadroomSince > _growSustainMs;
            // Schrumpf-Hysterese: der Frame muss ANHALTEND über Budget sein (nicht ein einzelner
            // Bau-/Carve-Spike < 200 ms) → ein Sustain-Timer. So schrumpft die Welt nur bei
            // echter Dauerlast, nicht bei einem transienten Hitch (kein Pendeln gegen das Wachsen).
            if (st._frameOverBudget) {
                if (!st._ringOverBudgetSince) st._ringOverBudgetSince = now;
            } else {
                st._ringOverBudgetSince = 0;
            }
            const sustainedOver =
                st._ringOverBudgetSince && now - st._ringOverBudgetSince > AnazhRealm.RING_SHRINK_SUSTAIN_MS;
            if (st._activeRingRadius > ringTarget) {
                st._activeRingRadius = ringTarget; // Target gesenkt (User-Slider)? sofort folgen
            } else if (
                st._activeRingRadius < ringTarget &&
                ringSettled &&
                noBacklog &&
                grassCaughtUp &&
                (st._activeRingRadius < ringFloor || sustainedHeadroom) &&
                breathed
            ) {
                st._ringRampLast = now;
                st._ringHeadroomSince = 0; // der nächste Wachs-Schritt verlangt einen frischen Sustain
                st._activeRingRadius++;
                if (st._activeRingRadius >= ringTarget) st._ringBootWindowUntil = 1; // Erst-Erreichen schließt das Fenster
            } else if (st._activeRingRadius > ringFloor && sustainedOver && breathed) {
                // anhaltend über Budget → die äußerste Schale zurückgeben (Fern-Prune, sicher)
                st._ringRampLast = now;
                st._ringOverBudgetSince = 0; // der nächste Schrumpf wartet einen frischen Sustain
                st._activeRingRadius--;
                st._ringBootWindowUntil = 1; // der erste Schrumpf schließt das Boot-Fenster (W4.4)
            }
        }
        // Streaming ist RÜCKSTAU-getrieben, nicht fps-getrieben: bei Bau-Rückstau MAX Budget — sonst
        // drosselte der PID genau den Bau, der das hohe frameMs erzeugt (er pendelt, das Laden stockt).
        // Die Qualität (Cull/Schatten/Wasser) regelt der PID weiter; der per-Frame-Zeit-Deckel schützt vor
        // Einzel-Spikes, bremst aber nicht den Durchsatz.
        const streamBacklog = st.voxelMeshPending ? st.voxelMeshPending.size : 0;
        // Streaming ist heilig: die Bewegung lebt vom Terrain-Laden, es wird NIE vom Render-Druck
        // gedrosselt. Rückstau → volles Budget, sonst der eigene gemessene Last-Anteil. Nie an die
        // Draw-Call-ZAHL koppeln — sie misst die Welt-Größe (konstant hoch), nicht transienten Druck.
        const streamEff = streamBacklog > 0 ? 1 : effStream;
        st._voxelStreamBudgetMs = lerp(L.streamBudgetMs[0], L.streamBudgetMs[1], streamEff);
        st._voxelStreamMaxPerFrame = Math.round(lerp(L.streamMaxPerFrame[0], L.streamMaxPerFrame[1], streamEff));
        // Wasser:
        if (!st.atmosphere) st.atmosphere = {};
        st.atmosphere.waterIsoBudgetMs = lerp(L.waterIsoBudgetMs[0], L.waterIsoBudgetMs[1], effWater);
        // Schatten-Update-Intervall (V18.264): der Schatten-Pass ist ein zweiter
        // Voll-Render → unter Render-/Architektur-Last seltener neu rendern (auch bei
        // Bewegung). render zählt zur Architektur-Domäne → effArch trägt es.
        st._shadowMinInterval = lerp(L.shadowMinInterval[1], L.shadowMinInterval[0], effArch);
    }

    // Produktions-Kosten-Schätzung: was das Erzeugen von n Einheiten an Frame-Zeit kostet (ms/Frame
    // aus dem gemessenen Sense) — der Nexus entscheidet VOR dem Spawn/Bau.
    _estimatePerfCost(kind, n = 1) {
        const sense = this.state.perfSense;
        if (!sense) return 0;
        const per =
            kind === "creature"
                ? sense.perCreatureMs
                : kind === "chunk"
                  ? sense.perChunkBuildMs
                  : kind === "frame"
                    ? sense.frameMs
                    : 0;
        return Math.max(0, per) * Math.max(0, n);
    }

    // DIE GERÄTE-GRENZEN (G1): was JEDER WebGPURenderer der Seite vom Gerät verlangt (Welt · Feed-/Hof-/Ich-Bühne · Workshop-
    // Preview) — der EINE forceWebGL-Hook und je Stufe die Grenzen des EINEN Adapters der Holz-Wahl (`GERAET_GRENZEN`). Ohne
    // `requiredLimits` gibt WebGPU dem Gerät die Standard-Grenzen (16 Texturen · 16 Sampler · 8 Speicher-Puffer je Stufe), auch
    // wenn der Adapter 48 Texturen trägt: der Boden-Stoff des Fern-Rings (17) sagte ab. Die Bühnen entstehen nach dem Boot und
    // lesen den Adapter synchron; ein Renderer vor der Holz-Wahl bricht laut (jede Münzstelle meldet ihren Fehlschlag als ERROR).
    _rendererGeraet() {
        if (this._adapter === undefined)
            throw new Error("GERÄTE-GRENZEN: ein Renderer vor der Adapter-Frage der Holz-Wahl (`_holzWahl` beim Boot)");
        const a = this._adapter;
        const requiredLimits = {};
        if (a)
            for (const k of AnazhRealm.GERAET_GRENZEN)
                if (Number.isFinite(a.limits[k])) requiredLimits[k] = a.limits[k];
        return { forceWebGL: AnazhRealm._forceWebGL(), requiredLimits };
    }

    // Holz-Wahl: URL ?holz= schlägt localStorage schlägt AUTO (Adapter-Info: Software-Renderer →
    // kienspan). Läuft VOR dem Renderer-Bau (init) — der Adapter wird billig vorab befragt.
    // Gibt den Profil-Namen zurück, nie null.
    async _holzWahl() {
        const P = AnazhRealm.HOLZ_PROFILE;
        // DIE EINE ADAPTER-FRAGE (F1): die Holz-Wahl und die Grenzen des Geräts (`_rendererGeraet`, G1) lesen DENSELBEN Adapter,
        // gefragt, wie r184 ihn für das Gerät fragt (`featureLevel: "compatibility"`, WebGPUBackend.init) — eine andere Frage
        // könnte einen Adapter mit anderen Grenzen liefern, und `requestDevice` scheiterte an der geforderten Grenze. Bis F1
        // fragten Holz-Wahl, Renderer-Bau und r184 dreimal. Antwortet keiner binnen 4 s, ist er null — und das ist LAUT (G1): die
        // Grenzen des Geräts (`_rendererGeraet`) fielen sonst still auf den Standard (16 Texturen je Stufe), der Fern-Ring fehlte.
        this._adapter = null;
        try {
            if (typeof navigator !== "undefined" && navigator.gpu && !AnazhRealm._forceWebGL()) {
                const FRIST = Symbol("frist");
                const a = await Promise.race([
                    navigator.gpu.requestAdapter({ featureLevel: "compatibility" }),
                    new Promise((res) => setTimeout(() => res(FRIST), 4000)),
                ]);
                if (a === FRIST)
                    this._bruchMelden(
                        "GERÄTE-GRENZEN: der Adapter antwortet nicht binnen 4 s — das Gerät fährt die Standard-Grenzen " +
                            "(16 Texturen je Stufe), ein Stoff darüber sagt ab (PIPELINE-ABSAGE)"
                    );
                else this._adapter = a;
            }
        } catch (e) {
            this._bruchMelden(`GERÄTE-GRENZEN: der Adapter ließ sich nicht befragen (${(e && e.message) || e})`);
        }
        try {
            const url = typeof location !== "undefined" ? new URLSearchParams(location.search).get("holz") : null;
            if (url && P[url]) {
                this.state._holzExplizit = true; // GPU-WAL 20.07.: explizite Wahl schlägt die Klassen-dpr-Kappe
                return url;
            }
        } catch (_e) {
            /* location kann in Workern fehlen */
        }
        try {
            const stored = typeof localStorage !== "undefined" ? localStorage.getItem("anazhHolz") : null;
            if (stored && P[stored]) {
                this.state._holzExplizit = true;
                return stored;
            }
        } catch (_e) {
            /* Privacy-Modus */
        }
        // Gefragt wird das Gerät, das WIRKLICH zeichnet (K67): der WebGPU-Adapter, wenn die Welt ihn bekommt — sonst der
        // WebGL2-Rückfall (r184 fällt ohne Adapter und unter dem forceWebGL-Hook auf GL), dessen Renderer-String. Vorher
        // fragte die Wahl nur den Adapter: auf dem Rückfall antwortete keiner, und eine Software-GL (swiftshader) fuhr
        // „voll" — der GPU-Prozess rasterte auf der CPU unter 200–400 % Last, und ein synchroner Programm-Bau wartete
        // 60–170 s auf ihn (gate:webgl-probe riss in 14 von 192 Läufen, die Stall-Akte der Boot-Lib nannte es).
        let sig = null;
        try {
            const a = this._adapter;
            if (a) {
                const info = a.info || {};
                sig = `${info.vendor || ""} ${info.architecture || ""} ${info.description || ""}`;
            }
            if (sig === null && typeof document !== "undefined") {
                const gl = document.createElement("canvas").getContext("webgl2");
                if (gl) {
                    const ext = gl.getExtension("WEBGL_debug_renderer_info");
                    sig = String(gl.getParameter(ext ? ext.UNMASKED_RENDERER_WEBGL : gl.RENDERER));
                    const los = gl.getExtension("WEBGL_lose_context");
                    if (los) los.loseContext();
                }
            }
        } catch (e) {
            this.log(
                `HOLZ-WAHL: das zeichnende Gerät ließ sich nicht befragen (${(e && e.message) || e}) — „voll"`,
                "WARN"
            );
        }
        if (sig !== null && /swiftshader|llvmpipe|lavapipe|software|cpu/.test(sig.toLowerCase())) return "kienspan";
        return "voll";
    }

    // Das gewählte Profil auf den State legen (Start+Deckel; der PID atmet darunter).
    _applyHolzProfil(name) {
        const prof = AnazhRealm.HOLZ_PROFILE[name] || AnazhRealm.HOLZ_PROFILE.voll;
        this.state._holzProfil = name;
        this.state._holzPixelCap = prof.pixelCap;
        this.state.chunkRingRadius = Math.min(this.state.chunkRingRadius || 4, prof.ring);
        if (!this.state.atmosphere) this.state.atmosphere = {};
        if (Number.isFinite(prof.shadowRange)) {
            this.state.atmosphere.shadowRange = Math.min(this.state.atmosphere.shadowRange || 170, prof.shadowRange);
        }
        if (prof.farWater === false) this.state.atmosphere.farWater = false;
        this.log(
            `HOLZ-PROFIL „${name}": Ring ≤${prof.ring} · Schatten ≤${prof.shadowRange} m · ` +
                `Fern-Wasser ${prof.farWater === false ? "aus" : "Standard"} · Pixel-Cap ${prof.pixelCap} ` +
                `(überschreibbar: ?holz=voll|nah|kienspan — die Nähe bleibt immer voll)`,
            "INFO"
        );
    }

    _applyRenderScale() {
        const st = this.state;
        const renderer = st.renderer;
        if (!renderer || renderer._isHeadlessNull || typeof renderer.setPixelRatio !== "function") return;
        const dprRaw = typeof window !== "undefined" && window.devicePixelRatio ? window.devicePixelRatio : 1;
        // Die Pixel-Kappe an die GPU (setPixelRatio) mit Dead-Band `_renderScaleApplied` —
        // setPixelRatio realloziert die Framebuffer, nie pro Frame. DPR-Kappe: Profil (kienspan 1) +
        // GERÄTE-KLASSE (konstant je Sitzung → feuert einmal beim Boot, kein Laufzeit-Flackern);
        // eine EXPLIZITE Holz-Wahl (?holz=/localStorage) schlägt die Klassen-Kappe.
        let klasseCap = 2;
        if (!st._holzExplizit) {
            const gp = typeof this._geraeteProfil === "function" ? this._geraeteProfil() : null;
            if (gp && gp.klasse === "schwach") klasseCap = 1.25;
            else if (gp && gp.klasse === "mittel") klasseCap = 1.5;
        }
        const dpr = Math.min(dprRaw, this.state._holzPixelCap || 2, klasseCap);
        const target = dpr;
        if (st._renderScaleApplied != null && Math.abs(target - st._renderScaleApplied) < 0.001) return;
        st._renderScaleApplied = target;
        try {
            renderer.setPixelRatio(target);
        } catch {
            /* setPixelRatio kann bei manchen Backends throwen — der Regler bleibt am Leben */
        }
    }

    // OBSERVABILITÄT (kein Regler, nur ein Fenster IN den Sense): der Schöpfer
    // SIEHT, was das System misst + wie der Regelkreis steht. `perf` im Chat.
    _ensurePerfOverlayDiv() {
        if (typeof document === "undefined" || !document.body) return null;
        let div = document.getElementById("perf-overlay");
        if (!div) {
            div = document.createElement("div");
            div.id = "perf-overlay";
            div.style.cssText =
                "position:fixed;top:52px;left:8px;z-index:9999;background:rgba(0,0,0,0.74);" +
                "color:#cfe6ff;font:11px/1.5 monospace;padding:7px 10px;border-radius:6px;" +
                "pointer-events:none;white-space:pre;border:1px solid rgba(120,200,255,0.28)";
            document.body.appendChild(div);
        }
        return div;
    }

    _togglePerfOverlay() {
        this.state.perfOverlay = !this.state.perfOverlay;
        const div = this._ensurePerfOverlayDiv();
        if (div) div.style.display = this.state.perfOverlay ? "block" : "none";
        this.log(
            this.state.perfOverlay
                ? "Perf-Sense AN (oben links) — der Nexus zeigt, was er misst: pro-Subsystem ms, der Regelkreis (loadScale/δ), die Stellgrößen."
                : "Perf-Sense AUS.",
            "INFO"
        );
        return this.state.perfOverlay;
    }

    _perfSenseRender() {
        if (!this.state.perfOverlay) return;
        const now = performance.now();
        if (this._perfRenderLast && now - this._perfRenderLast < 400) return;
        this._perfRenderLast = now;
        const div = this._ensurePerfOverlayDiv();
        if (!div) return;
        const s = this.state.perfSense;
        if (!s) return;
        const p = s.phase;
        const targetMs = Number.isFinite(this.state.perfTargetMs) ? this.state.perfTargetMs : AnazhRealm.PERF_TARGET_MS;
        const ph = (k) => (p[k] || 0).toFixed(1).padStart(5);
        const fm = s.frameMaxMs;
        const fmCol = fm > 33 ? "#ff6b6b" : fm > 22 ? "#ffd166" : "#8fe98f";
        const lsCol = s.loadScale < 0.6 ? "#ff6b6b" : s.loadScale < 0.9 ? "#ffd166" : "#8fe98f";
        // V18.268 — die neuen Augen: die GPU-Render-Last + der schlimmste Subsystem-Spike.
        const rc = s.renderCalls || 0;
        const rcCol = rc > 1000 ? "#ff6b6b" : rc > 600 ? "#ffd166" : "#8fe98f";
        const pm = s.phaseMax || {};
        let spikeK = "—",
            spikeV = 0;
        for (const k of AnazhRealm.PERF_PHASES)
            if ((pm[k] || 0) > spikeV) {
                spikeV = pm[k];
                spikeK = k;
            }
        const spCol = spikeV > 33 ? "#ff6b6b" : spikeV > 16 ? "#ffd166" : "#8fe98f";
        const vc = this.state.voxelChunks ? this.state.voxelChunks.size : 0;
        const arch = this.state.architectures ? this.state.architectures.length : 0;
        let coll = 0;
        if (this.state.architectures) for (const e of this.state.architectures) if (e && e.collision) coll++;
        const wq = this.state.voxelMeshPending ? this.state.voxelMeshPending.size : 0;
        // Erweiterter Readout: fps · Szenen-Skala% · dc · tris + die Spieler-Position.
        const fps = s.frameMs > 0 ? Math.round(1000 / s.frameMs) : 0;
        const fpsCol = fps < 30 ? "#ff6b6b" : fps < 55 ? "#ffd166" : "#8fe98f";
        const szenePct = Math.round(this._szeneSkalaWirk() * 100);
        const trisK = Math.round((s.renderTris || 0) / 1000);
        const pmesh = this.state.playerMesh && this.state.playerMesh.position;
        const posStr = pmesh ? `${pmesh.x.toFixed(0)}, ${pmesh.y.toFixed(0)}, ${pmesh.z.toFixed(0)}` : "—";
        div.innerHTML =
            `PERF-SENSE (der Nexus misst seine Last)\n` +
            `HUD  <span style="color:${fpsCol}">${fps}</span> fps · Szene ${szenePct}% · ${rc.toFixed(0)}dc · ${trisK}k▲\n` +
            `POS  ${posStr}  (x,y,z)\n` +
            `frame  ø ${s.frameMs.toFixed(1)}  max <span style="color:${fmCol}">${fm.toFixed(0)}</span> / soll ${targetMs} ms\n` +
            `stream ${ph("streaming")}  water ${ph("waterIso")}  arch ${ph("archCulling")}\n` +
            `creat  ${ph("creatures")}  phys  ${ph("physics")}  rend ${ph("render")} ms\n` +
            `GPU    ${ph("gpuMs")} ms (${s.gpuQuelle === "echt" ? "echt: timestamp-query" : "proxy: frame−ΣCPU"})\n` +
            `RLOAD  <span style="color:${rcCol}">${rc.toFixed(0)}</span> draw-calls · ${(s.renderTris / 1e6).toFixed(2)}M tris  (max ${(s.renderCallsMax || 0).toFixed(0)} / ${((s.renderTrisMax || 0) / 1e6).toFixed(2)}M)\n` +
            `SPIKE  schlimmster ${spikeK} <span style="color:${spCol}">${spikeV.toFixed(0)}</span> ms · frame-max ${fm.toFixed(0)} ms\n` +
            `REGEL  loadScale <span style="color:${lsCol}">${(s.loadScale * 100).toFixed(0)}%</span>  δ ${(s.frameMs - targetMs).toFixed(1)} ms\n` +
            `stellgr  streamBudget ${(this.state._voxelStreamBudgetMs || 0).toFixed(1)} ms  waterBudget ${((this.state.atmosphere && this.state.atmosphere.waterIsoBudgetMs) || 0).toFixed(1)} ms\n` +
            `chunk SYNC ${s.syncBuildN.toFixed(2)}/f (${s.syncBuildMs.toFixed(0)} ms)  worker ${s.workerMeshN.toFixed(2)}/f  q${wq}\n` +
            `kosten/kreatur ${s.perCreatureMs.toFixed(3)} ms · chunks ${vc} arch ${arch} coll ${coll}`;
        // V18.293 — die Blackbox-Zeile: der schlimmste erfasste Frame + seine GPU-Lücke
        // (frameMs − CPU-Phasen ≈ Present/GPU — die Zeit, für die der ganze Freeze-Bogen blind war).
        const fr = this.state.flightRecorder;
        if (fr && fr.worst && fr.worst.length) {
            const w = fr.worst[0];
            const wCol = w.frameMs > 100 ? "#ff6b6b" : w.frameMs > 50 ? "#ffd166" : "#8fe98f";
            div.innerHTML +=
                `\nBLACKBOX schlimmster <span style="color:${wCol}">${w.frameMs}</span> ms` +
                ` (GPU-Lücke ${w.gpuGapMs} · CPU ${w.cpuSumMs}) · ${fr.frames}F → anazhRealmPerf.json`;
        }
    }

    // Standalone-Perf-Panel (top-right, default sichtbar, EINE Zeile): liest DIESELBE `perfSense`-Quelle
    // wie der Regler (frameMs/renderCalls/renderTris + die Szenen-Skala `_szeneSkalaWirk`), kein
    // eigener Zähler. Der Debug-Overlay (`_perfSenseRender`, hinter `perfOverlay`) bleibt Dev-Werkzeug.
    _ensurePerfPanelDiv() {
        if (typeof document === "undefined" || !document.body) return null;
        let div = document.getElementById("perf-panel");
        if (!div) {
            div = document.createElement("div");
            div.id = "perf-panel";
            // V18.472 — SCREENSHOT-FIRST (Schöpfer: „damit du durch das Panel im Screenshot
            // alles sauber auswerten kannst"): opakerer Grund, größere Mono-Schrift, feste
            // Breite — jedes Feld muss ein JPEG/Downscale überleben.
            div.style.cssText =
                "position:fixed;top:10px;right:12px;z-index:50;width:392px;" +
                "font:700 13px/1.45 ui-monospace,SFMono-Regular,Menlo,monospace;" +
                "color:#e8f2ff;background:rgba(5,11,19,0.92);padding:10px 12px;border-radius:10px;" +
                "pointer-events:none;user-select:none;border:1px solid rgba(120,200,255,0.35)";
            div.innerHTML =
                '<div id="pp-head"></div>' +
                '<canvas id="pp-ring" width="368" height="64" style="display:block;margin:6px 0;border:1px solid rgba(120,200,255,0.25);border-radius:4px"></canvas>' +
                '<div id="pp-grid" style="display:grid;grid-template-columns:1fr 1fr;gap:0 12px"></div>' +
                '<div id="pp-buckets" style="margin-top:4px"></div>' +
                '<div id="pp-worst" style="margin-top:4px;color:#ffb3b3"></div>' +
                '<div style="margin-top:4px;color:#9fb8d0;font-weight:600">Export: Einstellungen → Leistung → „Perf-Daten exportieren"</div>';
            document.body.appendChild(div);
        }
        return div;
    }

    _togglePerfPanel() {
        this.state.perfPanel = !this.state.perfPanel;
        const div = this._ensurePerfPanelDiv();
        if (div) div.style.display = this.state.perfPanel ? "block" : "none";
        return this.state.perfPanel;
    }

    _perfPanelRender() {
        if (this.state.perfPanel === false) return;
        const div = this._ensurePerfPanelDiv();
        if (!div) return;
        // gedrosselt (alle Quellen sind schon geführt: perfSense-EWMA · Flugschreiber · Zensus).
        const now = typeof performance !== "undefined" ? performance.now() : Date.now();
        if (this._perfPanelLast && now - this._perfPanelLast < 500) return;
        this._perfPanelLast = now;
        const s = this.state.perfSense;
        const fr = this.state.flightRecorder;
        const head = document.getElementById("pp-head");
        if (!s || !head) {
            if (head) head.textContent = "— fps";
            return;
        }
        // ── Kopf: Version (der Screenshot MUSS sie tragen) + die große fps-Zahl ──
        const fps = s.frameMs > 0 ? Math.round(1000 / s.frameMs) : 0;
        const fpsCol = fps < 30 ? "#ff8a8a" : fps < 55 ? "#ffd166" : "#8fe98f";
        const pm = this.state.playerMesh && this.state.playerMesh.position;
        head.innerHTML =
            `<span style="font-size:22px;color:${fpsCol}">${fps}</span><span style="color:#9fb8d0"> fps</span>` +
            `<span style="float:right;color:#9fb8d0;font-weight:600">V${AnazhRealm.VERSION}` +
            (pm ? ` · ${pm.x.toFixed(0)},${pm.y.toFixed(0)},${pm.z.toFixed(0)}` : "") +
            "</span>";
        // ── Sekunden-Ring (max-Frame je Sekunde, ~3 min): Stocker als Balken ──
        const cv = document.getElementById("pp-ring");
        if (cv && fr && fr.secRing && cv.getContext) {
            const ctx = cv.getContext("2d");
            if (ctx) {
                const W = cv.width,
                    H = cv.height,
                    CAP = 250;
                ctx.fillStyle = "rgba(5,11,19,1)";
                ctx.fillRect(0, 0, W, H);
                const N = fr.secRing.length;
                const n = fr.secRingN | 0;
                const bw = W / N;
                for (let i = 0; i < n; i++) {
                    // ältester zuerst: Ring rückwärts ab secRingI
                    const v = fr.secRing[(fr.secRingI - n + i + N) % N];
                    if (!(v > 0)) continue;
                    const h = Math.min(1, v / CAP) * (H - 2);
                    ctx.fillStyle = v < 17 ? "#4caf50" : v < 33 ? "#8fe98f" : v < 100 ? "#ffd166" : "#ff6b6b";
                    ctx.fillRect(i * bw, H - 1 - h, Math.max(1, bw - 0.5), h);
                }
                // Führungslinien 17/33/100 ms + Beschriftung (Screenshot-lesbar)
                ctx.fillStyle = "rgba(160,200,255,0.45)";
                for (const g of [17, 33, 100]) {
                    const gy = H - 1 - Math.min(1, g / CAP) * (H - 2);
                    ctx.fillRect(0, gy, W, 1);
                    ctx.fillText(g + "ms", W - 34, gy - 2);
                }
                ctx.fillStyle = "#9fb8d0";
                ctx.fillText("max-Frame je Sekunde → " + n + "s", 4, 10);
            }
        }
        // ── Kern-Zahlen (2 Spalten, Label gedimmt / Wert hell) ──
        const grid = document.getElementById("pp-grid");
        if (grid) {
            const row = (l, v, col) =>
                `<div><span style="color:#9fb8d0;font-weight:600">${l} </span><span style="color:${col || "#e8f2ff"}">${v}</span></div>`;
            const ms = fr && fr.memSeries && fr.memSeries.length ? fr.memSeries[fr.memSeries.length - 1] : null;
            const heap = ms && Number.isFinite(ms.heapMB) ? ms.heapMB.toFixed(0) + " MB" : "—";
            const z = typeof this._impostorCensus === "function" ? this._impostorCensus() : null;
            const szene = Math.round(this._szeneSkalaWirk() * 100);
            // GPU-ZEIT-WELLE — das Grid trägt die WAHRE GPU-Zeit (EWMA) + das Quelle-Feld:
            // "echt" = timestamp-query, "proxy" = frameMs−ΣCPU (der Screenshot zeigt IMMER,
            // welcher Messung er glaubt). Rot über der Frame-Decke (PERF_TARGET_MS).
            const gpuMs = s.phase && Number.isFinite(s.phase.gpuMs) ? s.phase.gpuMs : null;
            const gpuQ = s.gpuQuelle === "echt" ? "echt" : "proxy";
            // HITCH-TELEMETRIE (das-feld-zeichnet §5.1) — die vier Hitch-Zellen:
            // LongTask-ms der letzten Sekunde · Major-GC-Zähler · neue Pipelines/s ·
            // Upload-Rate (Frame-EWMA × fps → MB/s). Dieselben Quellen wie der Trace.
            const ltSec = fr && fr._ltSec ? fr._ltSec : null;
            const upMBs = ((s.uploadBytesEwma || 0) * (s.frameMs > 0 ? 1000 / s.frameMs : 0)) / 1048576;
            grid.innerHTML =
                row("frame ø", (+s.frameMs).toFixed(1) + " ms") +
                row(
                    "frame max",
                    fr ? fr.maxFrameMs.toFixed(0) + " ms" : "—",
                    fr && fr.maxFrameMs > 100 ? "#ff8a8a" : undefined
                ) +
                row("draw-calls", Math.round(s.renderCalls || 0)) +
                row("tris", Math.round((s.renderTris || 0) / 1000) + "k") +
                row("heap", heap) +
                row(
                    "GPU (" + gpuQ + ")",
                    gpuMs != null ? gpuMs.toFixed(1) + " ms" : "—",
                    gpuMs != null && gpuMs > AnazhRealm.PERF_TARGET_MS ? "#ff8a8a" : undefined
                ) +
                row("Szene", szene + "%") +
                row(
                    "Impostor",
                    z ? `${z.gebacken}✓ ${z.wartend}○ ${z.gescheitert}✗` : "—",
                    z && z.gescheitert > 0 ? "#ff8a8a" : "#8fe98f"
                ) +
                row("LT/s", ltSec ? ltSec.ms.toFixed(0) + " ms" : "—", ltSec && ltSec.ms > 50 ? "#ff8a8a" : undefined) +
                row("GC", fr ? String(fr.gcN || 0) : "—") +
                row("Pipes+", (s.pipesNeuProS || 0).toFixed(1) + "/s") +
                row("Up MB/s", upMBs.toFixed(2), upMBs > 8 ? "#ffd166" : undefined);
        }
        // ── Verteilung (die 6 Flugschreiber-Eimer als Prozent-Zeile) ──
        const bk = document.getElementById("pp-buckets");
        if (bk && fr && fr.frames > 0) {
            const L = ["<17", "17-33", "33-50", "50-100", "100-200", ">200"];
            const C = ["#4caf50", "#8fe98f", "#ffd166", "#ffab5e", "#ff8a8a", "#ff5252"];
            bk.innerHTML =
                '<span style="color:#9fb8d0;font-weight:600">ms-Verteilung </span>' +
                fr.buckets
                    .map(
                        (c2, i) => `<span style="color:${C[i]}">${L[i]}:${((c2 / fr.frames) * 100).toFixed(0)}%</span>`
                    )
                    .join(" ");
        }
        // ── die schlimmsten 3 Frames (mit Top-CPU-Phase — die Attribution im Bild) ──
        const wd = document.getElementById("pp-worst");
        if (wd && fr && fr.worst && fr.worst.length) {
            wd.innerHTML = fr.worst
                .slice(0, 3)
                .map((w) => {
                    let top = "";
                    try {
                        const e = Object.entries(w.cpu || {}).sort((a, c) => c[1] - a[1])[0];
                        if (e && e[1] > 0.5) top = ` ${e[0]}:${e[1].toFixed(0)}ms`;
                    } catch {
                        /* Anzeige-only */
                    }
                    // GPU-ZEIT-WELLE — echtes gpuMs, wenn der Snapshot es trägt (alte
                    // Snapshots ohne das Feld fallen auf den gpuGapMs-Proxy zurück).
                    const g = Number.isFinite(w.gpuMs) ? w.gpuMs : w.gpuGapMs;
                    const gq = w.gpuQuelle === "echt" ? "echt" : "proxy";
                    return `⚠ ${w.frameMs}ms (GPU ${g} [${gq}] · CPU ${w.cpuSumMs}${top} · ${w.drawCalls}dc)`;
                })
                .join("<br>");
        }
    }

    // V18.472 — DER PERF-EXPORT (Schöpfer: „ein File, das ich im Chat zustellen kann"):
    // derselbe Flugschreiber-Trace, der an den save-server POSTet, als Download —
    // plus der Sekunden-Ring (der Verlaufs-Kontext des Panels). EINE Quelle, zwei Rohre.
    _exportPerfTrace() {
        try {
            const trace = this._flightRecorderBuildTrace();
            if (!trace) return null;
            const fr = this.state.flightRecorder;
            if (fr && fr.secRing && fr.secRingN > 0) {
                const N = fr.secRing.length,
                    n = fr.secRingN | 0,
                    out = new Array(n);
                for (let i = 0; i < n; i++) out[i] = +fr.secRing[(fr.secRingI - n + i + N) % N].toFixed(1);
                trace.sekundenRingMaxMs = out; // ältester → jüngster
            }
            // HITCH-TELEMETRIE (das-feld-zeichnet §5.1) — (b) der Heap-Delta-Ring reist
            // analog (DIESELBEN Indizes wie secRing — kein Zähler-Zwilling): MB je Sekunde,
            // scharfe Negativ-Zacken sind die Major-GCs (gcN zählt sie in memory.gcN).
            if (fr && fr.gcRing && fr.secRingN > 0) {
                const N2 = fr.gcRing.length,
                    n2 = Math.min(fr.secRingN | 0, N2),
                    out2 = new Array(n2);
                for (let i = 0; i < n2; i++) out2[i] = +fr.gcRing[(fr.secRingI - n2 + i + N2) % N2].toFixed(2);
                trace.sekundenRingHeapDeltaMB = out2; // ältester → jüngster
            }
            // Stillstand-Müll: Median des Heap-Wachstums über Sekunden, in denen der Spieler STAND und kein
            // Major-GC fiel (reiner Loop-Müll, Ziel ≈ 0). Nur mit echtem Speicher-Signal (sonst ein falsches
            // 0.00 auf Firefox/Safari) und ohne Stall-Slots (ein >1-s-Frame faltet mehrere Sekunden in einen).
            if (fr && fr.gcRing && fr.stillRing && fr.secRingN > 0 && Number.isFinite(fr._heapLast)) {
                const N3 = fr.gcRing.length,
                    n3 = Math.min(fr.secRingN | 0, N3);
                const still = [];
                for (let i = 0; i < n3; i++) {
                    const idx = (fr.secRingI - n3 + i + N3) % N3;
                    const d = fr.gcRing[idx];
                    if (fr.stillRing[idx] === 1 && d > -8 && fr.secRing[idx] < 1000) still.push(d);
                }
                if (still.length >= 5) {
                    still.sort((a, b) => a - b);
                    trace.stillstandMuellMBProS = +still[Math.floor(still.length / 2)].toFixed(2);
                    trace.stillstandSekunden = still.length;
                }
            }
            trace.exportiertAm = new Date().toISOString();
            const name =
                "anazhRealmPerf-V" + AnazhRealm.VERSION + "-" + trace.exportiertAm.replace(/[:.]/g, "-") + ".json";
            const json = JSON.stringify(trace, null, 1);
            if (typeof document !== "undefined" && typeof Blob !== "undefined" && typeof URL !== "undefined") {
                const a = document.createElement("a");
                a.href = URL.createObjectURL(new Blob([json], { type: "application/json" }));
                a.download = name;
                a.click();
                setTimeout(() => URL.revokeObjectURL(a.href), 5000);
            }
            return { name, bytes: json.length };
        } catch (_e) {
            return null;
        }
    }

    // DER FLUGSCHREIBER: hält die N schlimmsten Frames der Sitzung mit vollem Kontext und reicht sie
    // als anazhRealmPerf.json an den save-server (dasselbe Rohr wie der State-Save) — headless und
    // swiftshader sehen die echte GPU-Last nie. Kein Regler, keine Verhaltensänderung. Schlüsselwert je
    // Frame ist die LÜCKE frameMs − Σ(CPU-Phasen) ≈ GPU/Present-Zeit.
    _flightRecorderInit() {
        const now = typeof performance !== "undefined" && performance.now ? performance.now() : Date.now();
        const fr = {
            startedAt: now,
            frames: 0,
            sumFrameMs: 0,
            maxFrameMs: 0,
            // grobe Frame-Zeit-Verteilung: <17 / 17-33 / 33-50 / 50-100 / 100-200 / >200 ms
            buckets: [0, 0, 0, 0, 0, 0],
            overBudget: 0,
            worst: [], // die schlimmsten N Frames (absteigend), mit vollem Kontext
            lastSaveAt: -Infinity,
            device: this._flightRecorderDevice(),
            memSeries: [], // V18.294 — Leck-Detektor: Heap + Sammlungs-Größen über Zeit
            _leakAnnounced: false,
            _announced: false,
            // HITCH-TELEMETRIE (das-feld-zeichnet §5.1) — die vier Hitch-Summen der
            // Sitzung (kumulativ, ab 0 — die Linse liest sie IMMER numerisch):
            ltN: 0, // (a) LongTasks gesamt (Anzahl)
            ltMs: 0, // (a) LongTasks gesamt (ms)
            ltMaxMs: 0, // (a) längste LongTask der Sitzung (ms)
            gcN: 0, // (b) scharfe Heap-Abfälle < −8 MiB je Sekunde ≈ Major-GC
            pipesN: 0, // (c) neue Pipeline-Compiles gesamt (caches.size-Wachstum)
            upBytes: 0, // (d) Upload-Bytes gesamt (queue.writeBuffer-Tap)
        };
        // LongTask-Ohr: ein EINMALIGER PerformanceObserver akkumuliert Blocker >50 ms in this._ltAcc (nie
        // serialisiert); buffered:true fängt den Boot; fehlt der Entry-Typ (Firefox/Safari/Node) → still.
        // Zugriff über window (die Globals-Liste der Lint-Config bleibt unberührt).
        const PerfObs = typeof window !== "undefined" ? window.PerformanceObserver : undefined;
        if (!this._ltObs && typeof PerfObs === "function") {
            try {
                this._ltAcc = { n: 0, ms: 0, max: 0 };
                this._ltObs = new PerfObs((l) => {
                    for (const e of l.getEntries()) {
                        this._ltAcc.n++;
                        this._ltAcc.ms += e.duration;
                        if (e.duration > this._ltAcc.max) this._ltAcc.max = e.duration;
                    }
                });
                this._ltObs.observe({ type: "longtask", buffered: true });
            } catch {
                this._ltObs = null; // fail-soft — ohne Ohr bleiben ltN/ltMs ehrlich 0
            }
        }
        // EINMAL: beim Verlassen/Verstecken der Seite einen letzten Auszug sichern
        // (sonst geht die Sitzung verloren, bevor der periodische Save feuert).
        if (typeof window !== "undefined" && window.addEventListener) {
            const flush = () => {
                try {
                    this._flightRecorderSave(true);
                } catch {
                    /* der Flugschreiber darf nie stören */
                }
            };
            window.addEventListener("pagehide", flush);
            if (typeof document !== "undefined" && document.addEventListener) {
                document.addEventListener("visibilitychange", () => {
                    if (document.visibilityState === "hidden") flush();
                });
            }
        }
        return fr;
    }

    // ═══ DAS GERÄTE-PROFIL — EINE QUELLE (Telemetrie UND Regler-Seed) ═══
    // Liest cores/deviceMemory/dpr + GPU-Adapter-Info und urteilt eine grobe Klasse
    // (schwach/mittel/stark) + den loadScale-Prior — nie ein Urteil, der PID bleibt Richter; ein
    // schwaches Gerät zahlt so nicht den Überlast-Einbruch des optimistischen Kaltstarts.
    // Memoisiert erst, wenn die Adapter-Info da ist (Renderer-Init async).
    _geraeteProfil() {
        if (this._geraeteProfilMemo) return this._geraeteProfilMemo;
        const nav = typeof navigator !== "undefined" ? navigator : {};
        const win = typeof window !== "undefined" ? window : {};
        const r = this.state.renderer;
        const cores = nav.hardwareConcurrency || 0;
        const memGb = nav.deviceMemory || 0;
        const dpr = win.devicePixelRatio || 1;
        let gpu = "";
        try {
            const info = r && r.backend && r.backend.adapter && r.backend.adapter.info;
            if (info) gpu = [info.vendor, info.architecture, info.description].filter(Boolean).join(" ").trim();
        } catch {
            /* Adapter-Info nicht freigelegt — kein Beinbruch */
        }
        const g = gpu.toLowerCase();
        // Grobe, EHRLICHE Marker (Chrome legt vendor/architecture frei, z.B.
        // "nvidia ampere" · "intel gen-12lp" · "apple metal-3" · "arm valhall"):
        const software = /swiftshader|software|llvmpipe|basic render/.test(g);
        const mobil = /\b(arm|mali|qualcomm|adreno|imgtec|powervr|valhall)\b/.test(g);
        const diskret = /nvidia|geforce|rtx|gtx|ampere|ada|turing|rdna|navi/.test(g) && !software;
        const apple = /\bapple\b/.test(g);
        let klasse = "mittel";
        if (software || mobil || (memGb > 0 && memGb <= 4) || (cores > 0 && cores <= 4)) klasse = "schwach";
        else if ((diskret || apple) && (memGb === 0 || memGb >= 8) && cores >= 8) klasse = "stark";
        // Der Seed ist die Klasse allein. Bis V18.531 zog ein Pixel-Zuschlag ab 4 MPix 0,1–0,2 ab — ein Schirm-Gesetz
        // VERKEHRT herum (ein größerer Schirm startete mit weniger Welt) und an `_schirm` vorbei (innerWidth·dpr). Die
        // Fill-Last des Schirms trägt die Klassen-Pixel-Kappe (`_applyRenderScale`), danach der PID.
        const seed = klasse === "stark" ? 1 : klasse === "schwach" ? 0.45 : 0.7;
        const profil = { klasse, seed, cores, memGb, dpr, gpu };
        if (gpu) this._geraeteProfilMemo = profil; // erst mit Adapter-Wahrheit einfrieren
        return profil;
    }
    // Der EINE Regler-Seed-Leser (nur der Sense-Init ruft ihn): headless/Null-
    // Renderer bleibt BYTE-ALT (loadScale 1 — Gates sehen die volle Welt).
    _geraeteReglerSeed() {
        const r = this.state.renderer;
        if (!r || r._isHeadlessNull) return 1;
        const p = this._geraeteProfil();
        return Number.isFinite(p.seed) ? p.seed : 1;
    }

    // Geräte-Profil, einmal beim Init erfasst: liest die EINE Profil-Quelle (_geraeteProfil) und trägt
    // Klasse + Seed als Telemetrie mit — der Trace zeigt, was der Seed entschieden hat.
    _flightRecorderDevice() {
        const nav = typeof navigator !== "undefined" ? navigator : {};
        const r = this.state.renderer;
        const profil = this._geraeteProfil();
        const schirm = this._schirm();
        const dev = {
            version: AnazhRealm.VERSION,
            userAgent: nav.userAgent || "?",
            cores: profil.cores,
            deviceMemoryGb: profil.memGb,
            // der Zeichenpuffer des EINEN Schirm-Maßstabs (Bildpunkte, die gerendert werden)
            screen: schirm.breite + "x" + schirm.hoehe,
            dpr: profil.dpr,
            // KEIN-WEBGPU-GESCHICHTE: das BACKEND ist die Wahrheit (isWebGPURenderer
            // bleibt true, auch wenn r184 still auf WebGL2 zurückfiel).
            rendererType: r
                ? r._isHeadlessNull
                    ? "headless-null"
                    : r.backend && r.backend.isWebGPUBackend === true
                      ? "webgpu"
                      : r.isWebGPURenderer
                        ? "webgl-fallback"
                        : "other"
                : "none",
            webgpu: typeof nav.gpu !== "undefined",
            foliageRadius: [AnazhRealm.PERF_FOLIAGE_RADIUS_MIN, AnazhRealm.PERF_FOLIAGE_RADIUS_MAX],
            klasse: profil.klasse,
            reglerSeed: profil.seed,
            seedKonsumiert: this.state.perfSense ? this.state.perfSense.seedStart : undefined,
        };
        if (profil.gpu) dev.gpu = profil.gpu;
        return dev;
    }

    // Pro Frame (am Ende von _perfSenseFoldFrame, mit den ROHEN f/m vor dem Reset).
    // Bulletproof gekapselt: ein Wurf hier dürfte NIE den Loop brechen (die Ironie
    // eines Mess-Freeze) — der Aufruf-Ort liegt außerhalb der Loop-Fehler-Grenze.
    _flightRecorderTick(frameMs, dtSec, f) {
        try {
            const st = this.state;
            let fr = st.flightRecorder;
            if (!fr) fr = st.flightRecorder = this._flightRecorderInit();
            fr.frames++;
            fr.sumFrameMs += frameMs;
            if (frameMs > fr.maxFrameMs) fr.maxFrameMs = frameMs;
            const b =
                frameMs < 17 ? 0 : frameMs < 33 ? 1 : frameMs < 50 ? 2 : frameMs < 100 ? 3 : frameMs < 200 ? 4 : 5;
            fr.buckets[b]++;
            // V18.472 — DER SEKUNDEN-RING (die EINE Verlaufs-Quelle für Panel + Export):
            // je Sekunde der SCHLIMMSTE Frame (max, nicht Mittel — Stocker sind das Signal).
            // 180 Slots ≈ 3 Minuten Spiel; Ring-Schreiben ist ein Array-Write, nie ein Zähler-Zwilling.
            {
                const nowR = typeof performance !== "undefined" && performance.now ? performance.now() : Date.now();
                if (!fr.secRing) {
                    fr.secRing = new Float32Array(180);
                    fr.secRingI = 0;
                    fr.secRingN = 0;
                    fr._secStart = nowR;
                    fr._secMax = 0;
                }
                // HITCH-TELEMETRIE (das-feld-zeichnet §5.1) — (b) der Heap-Delta-Ring:
                // EXAKT dieselben Indizes wie secRing (secRingI/secRingN) — nie ein
                // Zähler-Zwilling; ein Slot = Heap-Delta-MB der Sekunde.
                if (!fr.gcRing) fr.gcRing = new Float32Array(180);
                if (frameMs > fr._secMax) fr._secMax = frameMs;
                // HITCH-TELEMETRIE — (c)+(d) kumulative Summen der f-Passagiere aus dem Fold.
                if (f && f.pipelinesNeu > 0) {
                    fr.pipesN += f.pipelinesNeu;
                    fr._pipesSec = (fr._pipesSec || 0) + f.pipelinesNeu;
                }
                if (f && f.uploadBytes > 0) fr.upBytes += f.uploadBytes;
                if (nowR - fr._secStart >= 1000) {
                    // HITCH-TELEMETRIE (das-feld-zeichnet §5.1) — die Sekunden-Grenze ist
                    // DIE Falte der Hitch-Zähler (EIN Takt, dieselben Ring-Indizes):
                    // (a) LongTasks der Sekunde aus dem Observer-Akku lesen + nullen.
                    const lt = this._ltAcc;
                    if (lt) {
                        fr._ltSec = { n: lt.n, ms: lt.ms, max: lt.max };
                        fr.ltN += lt.n;
                        fr.ltMs += lt.ms;
                        if (lt.max > fr.ltMaxMs) fr.ltMaxMs = lt.max;
                        lt.n = 0;
                        lt.ms = 0;
                        lt.max = 0;
                    }
                    // (b) Heap-Delta der Sekunde (Chrome performance.memory, sonst 0):
                    // scharfes NEGATIV < −8 MiB ≈ Major-GC (der Sprung nach unten).
                    let heapDeltaMB = 0;
                    const mem = typeof performance !== "undefined" && performance.memory;
                    if (mem) {
                        const h = mem.usedJSHeapSize;
                        if (Number.isFinite(fr._heapLast)) heapDeltaMB = (h - fr._heapLast) / 1048576;
                        fr._heapLast = h;
                        if (heapDeltaMB < -8) fr.gcN++;
                    }
                    fr.gcRing[fr.secRingI] = heapDeltaMB;
                    // (c) Pipeline-Compiles der Sekunde → EWMA (steadyState.pipelines.neuProS).
                    const sns = st.perfSense;
                    if (sns) {
                        const A = AnazhRealm.PERF_SENSE_ALPHA;
                        sns.pipesNeuProS =
                            (sns.pipesNeuProS || 0) + A * ((fr._pipesSec || 0) - (sns.pipesNeuProS || 0));
                    }
                    fr._pipesSec = 0;
                    // Je Sekunde merken, ob WIRKLICH Stillstand war: Spieler < 0.5 m bewegt UND kein Ingest
                    // freigegeben UND keine Gruppe gemünzt — sonst zählte Streaming (die Ruhe-Wand wächst den Radius
                    // gerade im Stand) als Loop-Müll. Gleiche Ring-Indizes, kein Zwilling.
                    if (!fr.stillRing) fr.stillRing = new Uint8Array(180);
                    {
                        const pm = st.playerMesh && st.playerMesh.position;
                        let still = 0;
                        if (pm) {
                            if (fr._stillPos) {
                                const dxS = pm.x - fr._stillPos.x,
                                    dzS = pm.z - fr._stillPos.z;
                                still = dxS * dxS + dzS * dzS < 0.25 ? 1 : 0;
                                fr._stillPos.x = pm.x;
                                fr._stillPos.z = pm.z;
                            } else fr._stillPos = { x: pm.x, z: pm.z };
                        }
                        const ingestJetzt = this._foundryIngestFrei || 0;
                        const mintsJetzt = this._archGruppenMints || 0;
                        if (ingestJetzt !== (fr._stillIngest || 0) || mintsJetzt !== (fr._stillMints || 0)) still = 0;
                        fr._stillIngest = ingestJetzt;
                        fr._stillMints = mintsJetzt;
                        fr.stillRing[fr.secRingI] = still;
                    }
                    fr.secRing[fr.secRingI] = fr._secMax;
                    fr.secRingI = (fr.secRingI + 1) % fr.secRing.length;
                    if (fr.secRingN < fr.secRing.length) fr.secRingN++;
                    fr._secStart = nowR;
                    fr._secMax = 0;
                }
            }
            const targetMs = Number.isFinite(st.perfTargetMs) ? st.perfTargetMs : AnazhRealm.PERF_TARGET_MS;
            if (frameMs > targetMs) fr.overBudget++;
            // einen STOCKER fangen (über der spürbaren Schwelle) + nur die schlimmsten N halten
            const FREEZE = AnazhRealm.FLIGHT_RECORDER_FREEZE_MS;
            const cap = AnazhRealm.FLIGHT_RECORDER_WORST_CAP;
            const smallest = fr.worst.length ? fr.worst[fr.worst.length - 1].frameMs : 0;
            if (frameMs > FREEZE && (fr.worst.length < cap || frameMs > smallest)) {
                fr.worst.push(this._flightRecorderSnapshot(frameMs, f));
                fr.worst.sort((a, c) => c.frameMs - a.frameMs);
                if (fr.worst.length > cap) fr.worst.length = cap;
            }
            // periodisch sichern (gedrosselt) — fire-and-forget
            const now = typeof performance !== "undefined" && performance.now ? performance.now() : Date.now();
            if (now - fr.lastSaveAt > AnazhRealm.FLIGHT_RECORDER_SAVE_INTERVAL_MS) {
                fr.lastSaveAt = now;
                this._flightRecorderSave(false);
            }
        } catch {
            /* der Flugschreiber darf NIE den Loop stören */
        }
    }

    // Die Momentaufnahme eines schlimmen Frames: die ROHEN CPU-Phasen DIESES Frames
    // (nicht die EWMA), die LÜCKE (≈ GPU/Present) und der Welt-Kontext, in dem es stockte.
    _flightRecorderSnapshot(frameMs, f) {
        const st = this.state;
        f = f || {};
        const cpu = {};
        let cpuSum = 0;
        for (const k of AnazhRealm.PERF_PHASES) {
            const v = +(f[k] || 0);
            cpu[k] = +v.toFixed(2);
            cpuSum += v;
        }
        const calls = Math.round(f.renderCalls || 0);
        const tris = Math.round(f.renderTris || 0);
        const gap = Math.max(0, frameMs - cpuSum); // frameMs − CPU ≈ GPU/Present — die unsichtbare Zeit
        const pm = st.playerMesh;
        const pos =
            pm && pm.position
                ? { x: +pm.position.x.toFixed(1), y: +pm.position.y.toFixed(1), z: +pm.position.z.toFixed(1) }
                : null;
        let activeKeys = [];
        try {
            if (st.keys)
                activeKeys = Object.keys(st.keys)
                    .filter((k) => st.keys[k] === true)
                    .slice(0, 8);
        } catch {
            /* keys nicht lesbar */
        }
        return {
            frameMs: +frameMs.toFixed(1),
            cpuSumMs: +cpuSum.toFixed(1),
            gpuGapMs: +gap.toFixed(1),
            // gpuMs: der timestamp-query-Messwert ("echt", 1 Frame Latenz) oder der Proxy (= gpuGapMs).
            // gpuGapMs bleibt daneben — die Differenz echt↔Proxy ist selbst Diagnose (vsync/GC-Anteil).
            gpuMs: Number.isFinite(f.gpuMs) ? +(+f.gpuMs).toFixed(1) : +gap.toFixed(1),
            gpuQuelle: f.gpuQuelle === "echt" ? "echt" : "proxy",
            // Hitch-Passagiere dieses Stockers: LongTasks der Nachbarschaft (laufender Akku + letzte volle
            // Sekunde — der Observer hat 1 Frame Latenz, der exakte Frame ist nie fangbar), neue
            // Pipeline-Compiles + Upload-KB des Frames (f-Passagiere aus dem Fold).
            longTasks: (() => {
                const a = this._ltAcc || { n: 0, ms: 0, max: 0 };
                const sec = (st.flightRecorder && st.flightRecorder._ltSec) || { n: 0, ms: 0, max: 0 };
                return { n: a.n + sec.n, ms: +(a.ms + sec.ms).toFixed(1), max: +Math.max(a.max, sec.max).toFixed(1) };
            })(),
            pipelinesNeu: Math.round(f.pipelinesNeu || 0),
            uploadKB: +((f.uploadBytes || 0) / 1024).toFixed(1),
            cpu,
            drawCalls: calls,
            triangles: tris,
            ctx: {
                foliageRadius: st.foliageRadius != null ? Math.round(+st.foliageRadius) : null,
                foliageDensity: st._foliageDensityScale != null ? +(+st._foliageDensityScale).toFixed(2) : null,
                szeneSkala: +this._szeneSkalaWirk().toFixed(2),
                creatures: st.creatures ? st.creatures.length : 0,
                chunks: st.voxelChunks ? st.voxelChunks.size : 0,
                chunkQueue: st.voxelMeshPending ? st.voxelMeshPending.size : 0,
                architectures: st.architectures ? st.architectures.length : 0,
                timeOfDay: typeof st.timeOfDay === "number" ? +st.timeOfDay.toFixed(2) : null,
                pos,
                activeKeys,
            },
            // V18.473 — DIE TRI-ATTRIBUTION (Schöpfer-Trace: Spikes bis 26M Dreiecke,
            // niemand wusste WO): nur auf Freeze-Frames (selten, worst-Cap) die Top-5
            // Szenen-Teilbäume nach Dreiecken — die nächste Datei NENNT den Wal.
            triZensus: this._flightRecorderTriCensus(),
            atFrame: (st.flightRecorder && st.flightRecorder.frames) || 0,
        };
    }

    // DIE TÄTER-KLASSE (Band-Linse, integriert 04.10.): der EINE Name, unter dem jede Kosten-Linse ein gezeichnetes
    // Objekt bucht — Draw- und Puffer-Zensus der Werkbank (scripts/lib/draw-zaehler.cjs), der Flugschreiber
    // (Dreiecks-Wale · Heap · Bundle-Deckung), die Albedo-Sicht und der Szenen-Zensus des Playtests. Drei Klassifizierer
    // (Flugschreiber, Albedo-Sicht, Draw-Zähler) nannten dieselben Objekte verschieden.
    //   - eine Instanz-Gruppe (`archInstanceKey`) →
    //     `AnazhRealm._instanzKlasse`, gleich ob sie in einem Region-Bundle hängt oder direkt in der Szene; eine Gruppe
    //     ohne lebende Instanz heißt `leer:<klasse>` — die leere Hülle in der Gnadenfrist des Leer-Chokepoints
    //     (`_archGroupLeerDispose`); sie zeichnet nie (count 0, unsichtbar — `_archGroupFree`), zeichnet sie doch, ist
    //     sie ein toter Draw und die Band-Linse nennt ihn (Haushalt 0, `gate:freie-slots`);
    //   - ein Tier `tier:<seele>`, der Spieler `spieler`;
    //   - sonst der Name des obersten Szenen-Knotens, dann des gezeichneten Objekts (`_taeterName`); unter einer Region
    //     ist der Täter ihr Kind, nie die Region (im Schatten-Pass zeichnen die Kinder direkt);
    //   - ohne jeden Namen `UNBENANNT:<type>` — ein Linsen-Fehler, den der Erzeuger heilt, indem er sein Objekt benennt.
    _taeterKlasse(obj) {
        const u0 = obj.userData || {};
        if (u0.archInstanceKey) return this._taeterGruppe(u0.archInstanceKey);
        const scene = this.state.scene;
        let top = obj;
        while (top.parent && top.parent !== scene) top = top.parent;
        const u = top.userData || {};
        if (u._tierBaum) return "tier:" + (u.soul || "?");
        if (top === this.state.playerMesh) return "spieler";
        let traeger = top;
        if (top.isBundleGroup === true || u.regionKey !== undefined) {
            traeger = obj;
            while (traeger.parent && traeger.parent !== top) traeger = traeger.parent;
            const k = traeger.userData && traeger.userData.archInstanceKey;
            if (k) return this._taeterGruppe(k);
        }
        return AnazhRealm._taeterName(traeger) || AnazhRealm._taeterName(obj) || "UNBENANNT:" + obj.type;
    }
    _taeterGruppe(key) {
        const g = this.state.archInstanceGroups && this.state.archInstanceGroups.get(key);
        const kl = AnazhRealm._instanzKlasse(key);
        return g && (g.liveCount || 0) === 0 ? "leer:" + kl : kl;
    }

    // Der Name eines Knotens: `name` || Inventar-Stempel || Wasser-Art; ein Schlüssel-Schwanz hinter einem Trenner
    // fällt (`voxelChunk:3,-4:lod0` → `voxelChunk`, `nahWiese:L1:0:2` → `nahWiese:L1`), Ziffern IM Namen bleiben
    // (`p2p-spieler`, `r184-ausgabe`).
    static _taeterName(x) {
        const u = x.userData || {};
        const s = x.name || u.inventar || u.hydroKind || "";
        return s ? String(s).replace(/[-_:#,@|][-\d].*$/, "") || null : null;
    }

    // Ein Instanz-Schlüssel → `<familie>:<preset>:L<stufe>`. Die Schlüssel (`_archInstanceGroupFor`): `<name>#<leaf>`
    // mit `@<region>` für regionale Gruppen; trägt das Leaf eine Studio-Identität, IST es der Schlüssel (der platzierte
    // Bau keyt nach Geometrie): `f:<preset>|<gestalt>|<lod>[|ov:<hash>]:<teil>[#S]` (`#S` = der L1-Schatten-Zwilling
    // eines L0-Baums, er zeichnet als L1) · `fimp:fimp:<preset>|<gestalt>…` (die Karte). Die Familien:
    // `f:<preset>:L<lod>` (Foundry, gesetzt) · `fimp:<preset>:L2` · `fscatter:<preset>:L<lod>` (Streu `fscatter:<preset>:
    // <gestalt>:<lod>`, die Gestalt gefaltet) · `g:<bauplan>:L<n>` (Host-Bauplan, `_lodN`/`_vN` gefaltet). Eine
    // unlesbare Stufe heißt `L?` — kein Stufen-Urteil, die Band-Linse ordnet sie keiner Stufen-Klasse zu.
    static _instanzKlasse(key) {
        const s = String(key);
        const at = s.indexOf("@");
        const body = at >= 0 ? s.slice(0, at) : s;
        const studio = /^(f|fimp):/.test(body);
        const h = studio ? -1 : body.indexOf("#");
        const name = studio ? "" : h >= 0 ? body.slice(0, h) : body;
        const leaf = studio ? body : h >= 0 ? body.slice(h + 1) : "";
        if (name.startsWith("fscatter:")) {
            const t = name.split(":");
            return "fscatter:" + t[1] + ":L" + (/^\d$/.test(t[3] || "") ? t[3] : "?");
        }
        if (leaf.startsWith("fimp:")) return "fimp:" + leaf.replace(/^(fimp:)+/, "").split("|")[0] + ":L2";
        if (leaf.startsWith("f:")) {
            const t = leaf.slice(2).split("|");
            const l = /^\d/.exec(t[2] || "");
            return "f:" + t[0] + ":L" + (l ? l[0] : "?");
        }
        const m = /^(.*?)(?:_lod(\d))?$/.exec(name);
        return "g:" + m[1].replace(/_(v|var)\d+$/, "") + ":L" + (m[2] || "0");
    }

    // Die Top-5 Täter-Klassen nach Dreiecks-Last (instanz-gewichtet: InstancedMesh zählt Geometrie-Dreiecke × count,
    // je sichtbarem Objekt). Läuft NUR im Freeze-Snapshot — ein Walk über die Szene ist dort vernachlässigbar gegen den
    // >250-ms-Frame selbst.
    _flightRecorderTriCensus() {
        try {
            const sc = this.state.scene;
            if (!sc || !sc.children) return null;
            const je = new Map();
            sc.traverse((o) => {
                const g = o.geometry;
                if (!g || o.visible === false) return;
                const idx = g.index
                    ? g.index.count
                    : g.attributes && g.attributes.position
                      ? g.attributes.position.count
                      : 0;
                let t = idx / 3;
                if (o.isInstancedMesh && Number.isFinite(o.count)) t *= o.count;
                if (!t) return;
                const k = this._taeterKlasse(o);
                je.set(k, (je.get(k) || 0) + t);
            });
            const out = [];
            for (const [name, tris] of je)
                if (tris >= 10000) out.push({ name: name.slice(0, 48), trisK: Math.round(tris / 1000) });
            out.sort((a, b) => b.trisK - a.trisK);
            return out.slice(0, 5);
        } catch {
            return null; // der Flugschreiber darf NIE stören
        }
    }

    // Eine kleine, EHRLICHE Selbst-Diagnose des schlimmsten Frames: GPU-gebunden
    // (die LÜCKE dominiert → Render/Draw-Calls) oder CPU-gebunden (eine Phase
    // dominiert)? Genau die Attribution, die der 33-Wellen-Bogen nie hatte.
    _flightRecorderVerdict() {
        const fr = this.state.flightRecorder;
        if (!fr || !fr.worst.length) return "noch kein Stocker erfasst (die Welt lief flüssig).";
        const w = fr.worst[0];
        // GPU-ZEIT-WELLE — das Verdikt urteilt auf der EHRLICHSTEN verfügbaren Zahl:
        // dem timestamp-query-Messwert ("echt"), sonst dem Subtraktions-Proxy (alte
        // Traces ohne gpuMs/gpuQuelle fallen automatisch auf gpuGapMs zurück).
        const wGpu = w.gpuQuelle === "echt" && Number.isFinite(w.gpuMs) ? w.gpuMs : w.gpuGapMs;
        const wQuelle = w.gpuQuelle === "echt" ? "echt gemessen" : "Proxy frameMs−ΣCPU";
        // Proxy-Lügen-Wand: der Subtraktions-Proxy liest Hauptthread-Stalls außerhalb der Loop-Phasen
        // (Worker-Reply-Ingest) als „GPU". Deckt der LongTask-Akku den Großteil der Lücke, urteilt das
        // Verdikt HAUPTTHREAD (nur im Proxy-Zweig — echtes gpuMs bleibt Wahrheit).
        const wLt = w.longTasks && Number.isFinite(w.longTasks.ms) ? w.longTasks.ms : 0;
        if (w.gpuQuelle !== "echt" && wGpu > w.cpuSumMs && wLt > 0.6 * w.gpuGapMs) {
            return (
                `schlimmster Frame ${w.frameMs} ms ist HAUPTTHREAD-BLOCKIERT (ausserhalb der Loop-Phasen): ` +
                `LongTasks ${wLt} ms (max ${w.longTasks.max} ms) decken die ${w.gpuGapMs}-ms-Lücke — ` +
                `Verdacht Worker-Reply-Ingest/Compile, NICHT die GPU (Proxy ohne timestamp-query).`
            );
        }
        if (wGpu > w.cpuSumMs) {
            return (
                `schlimmster Frame ${w.frameMs} ms ist GPU/Render-GEBUNDEN: ${wGpu} ms GPU (${wQuelle}) ` +
                `vs nur ${w.cpuSumMs} ms CPU — bei ${w.drawCalls} draw-calls / ${(w.triangles / 1e6).toFixed(1)}M Dreiecken. ` +
                `Der Hebel ist die RENDER-Last (Culling/Draw-Calls), nicht die CPU.`
            );
        }
        let topK = "?",
            topV = 0;
        for (const k of AnazhRealm.PERF_PHASES)
            if ((w.cpu[k] || 0) > topV) {
                topV = w.cpu[k];
                topK = k;
            }
        return (
            `schlimmster Frame ${w.frameMs} ms ist CPU-GEBUNDEN: Phase „${topK}" ${topV} ms ` +
            `(GPU nur ${wGpu} ms, ${wQuelle}). Der Hebel sitzt in „${topK}".`
        );
    }

    // Die Spur zusammenbauen: Geräte-Profil + Sitzungs-Statistik + die schlimmsten
    // Frames + der eingeschwungene Sense + das Verdikt. Klein + menschen-lesbar.
    _flightRecorderBuildTrace() {
        const st = this.state;
        const fr = st.flightRecorder;
        if (!fr) return null;
        const s = st.perfSense;
        const now = typeof performance !== "undefined" && performance.now ? performance.now() : Date.now();
        const dur = Math.max(0.001, (now - fr.startedAt) / 1000);
        const avgFrameMs = fr.frames ? fr.sumFrameMs / fr.frames : 0;
        const phaseMs = {};
        if (s && s.phase) for (const k of AnazhRealm.PERF_PHASES) phaseMs[k] = +(+(s.phase[k] || 0)).toFixed(2);
        // V18.294 — DER LECK-DETEKTOR: einen Mess-Punkt nehmen (Heap + jede große
        // Sammlung) und das Wachstum über das Fenster lesen. Die Speicher-Anzeige
        // sagt „es leckt" — DAS sagt WAS. Genau die Attribution, die wir brauchen.
        const memReport = this._flightRecorderMemoryReport();
        // HITCH-TELEMETRIE (das-feld-zeichnet §5.1) — (b) gcN (scharfe Heap-Abfälle
        // < −8 MiB je Sekunde ≈ Major-GC) reist neben heapGrowthMBPerSec. Additiv —
        // kein bestehendes memory-Feld bewegt sich.
        if (memReport) memReport.gcN = fr.gcN || 0;
        return {
            kind: "anazh-flight-recorder",
            version: AnazhRealm.VERSION,
            savedAt: new Date().toISOString(),
            verdict: this._flightRecorderVerdict(),
            leakVerdict: memReport ? memReport.verdict : "noch zu wenig Mess-Punkte für ein Leck-Urteil.",
            memory: memReport,
            device: fr.device,
            session: {
                seconds: +dur.toFixed(1),
                frames: fr.frames,
                avgFps: +(fr.frames / dur).toFixed(1),
                avgFrameMs: +avgFrameMs.toFixed(1),
                maxFrameMs: +fr.maxFrameMs.toFixed(1),
                overBudgetPct: fr.frames ? +((fr.overBudget / fr.frames) * 100).toFixed(1) : 0,
                distribution: {
                    "<17ms (>59fps)": fr.buckets[0],
                    "17-33ms (30-59fps)": fr.buckets[1],
                    "33-50ms (20-30fps)": fr.buckets[2],
                    "50-100ms (10-20fps)": fr.buckets[3],
                    "100-200ms (5-10fps)": fr.buckets[4],
                    ">200ms (<5fps)": fr.buckets[5],
                },
                // HITCH-TELEMETRIE (das-feld-zeichnet §5.1) — (a) die LongTasks der
                // Sitzung: Blocker >50 ms (Anzahl · Summe · längste), vom Observer-Ohr.
                longTasks: {
                    n: fr.ltN || 0,
                    ms: +(fr.ltMs || 0).toFixed(0),
                    maxMs: +(fr.ltMaxMs || 0).toFixed(1),
                },
            },
            steadyState: s
                ? {
                      frameMsEwma: +(+s.frameMs).toFixed(1),
                      frameMaxMs: +(+s.frameMaxMs).toFixed(1),
                      drawCalls: Math.round(s.renderCalls || 0),
                      drawCallsMax: Math.round(s.renderCallsMax || 0),
                      triangles: Math.round(s.renderTris || 0),
                      loadScalePct: Math.round((s.loadScale || 0) * 100),
                      phaseMsEwma: phaseMs,
                      // GPU-ZEIT-WELLE — die eingeschwungene WAHRE GPU-Zeit + ihre Quelle:
                      // "echt" = timestamp-query (der Schöpfer-Trace trägt künftig die
                      // gemessene GPU-Zeit), "proxy" = frameMs−ΣCPU (headless / Feature fehlt).
                      gpuMsEwma: s.phase && Number.isFinite(s.phase.gpuMs) ? +(+s.phase.gpuMs).toFixed(1) : null,
                      gpuMaxMs:
                          s.phaseMax && Number.isFinite(s.phaseMax.gpuMs) ? +(+s.phaseMax.gpuMs).toFixed(1) : null,
                      gpuQuelle: s.gpuQuelle === "echt" ? "echt" : "proxy",
                      // HITCH-TELEMETRIE (das-feld-zeichnet §5.1) — (c) Pipeline-Stand
                      // (total = caches.size, neuProS = Sekunden-EWMA) + (d) Upload-Rate
                      // (Frame-EWMA × fps → KB/s). Additiv — kein Feld bewegt sich.
                      pipelines: {
                          total: Math.round(s.pipesTotal || 0),
                          neuProS: +(+(s.pipesNeuProS || 0)).toFixed(2),
                          // DIE ERST-ZEICHNUNG (Welle K, `_configureRenderer`): Knoten-Bauten im Pass (Zahl ·
                          // Summe ms), auf den nächsten Aufruf verschobene Erst-Zeichnungen, asynchrone und noch
                          // offene Pipelines der Welt-Szene — beweist KONSUM des EINEN Orts im Trace.
                          erstBauN: this._erstZeichnung ? this._erstZeichnung.bauN : 0,
                          erstBauMs: this._erstZeichnung ? Math.round(this._erstZeichnung.bauMs) : 0,
                          erstVerschoben: this._erstZeichnung ? this._erstZeichnung.verschoben : 0,
                          erstPipeAsync: this._erstZeichnung ? this._erstZeichnung.pipeAsync : 0,
                          erstPipeOffen: this._erstZeichnung ? this._erstZeichnung.offen.size : 0,
                          erstPipeAbsagen: this._erstZeichnung ? this._erstZeichnung.absagenN : 0,
                          erstNeubauN: this._erstZeichnung ? this._erstZeichnung.neubauN : 0,
                      },
                      uploadKBProS: +(
                          ((s.uploadBytesEwma || 0) * (s.frameMs > 0 ? 1000 / s.frameMs : 0)) /
                          1024
                      ).toFixed(1),
                      // (18.07.) die GRÖSSEN-KLASSEN der Uploads (Session-kumulativ aus dem
                      // EINEN writeBuffer-Tap): WER die 38–53 MB/s trägt — viele kleine
                      // Uniforms oder wenige grosse Geometrie-/Textur-Schübe.
                      uploadKlassen: (() => {
                          const B = this._uploadBuckets;
                          if (!B) return null;
                          const f = (x) => ({ n: x[0], mb: +(x[1] / 1048576).toFixed(1) });
                          return { bis16K: f(B.b16K), bis256K: f(B.b256K), bis2M: f(B.b2M), ueber2M: f(B.gross) };
                      })(),
                      // TRACE-BLINDSTELLEN-HEILUNG (18.07., Schöpfer-Trace 2.8 fps):
                      // (a) ALLE Stellgrößen des EINEN Reglers — der Trace zeigte nur
                      // loadScalePct 0 und ließ raten, wo renderScale/Schatten standen;
                      stellgroessen: {
                          foliageRadius: st.foliageRadius != null ? Math.round(+st.foliageRadius) : null,
                          foliageDensity:
                              st._foliageDensityScale != null ? +(+st._foliageDensityScale).toFixed(2) : null,
                          szeneSkala: +this._szeneSkalaWirk().toFixed(2),
                          archRadius:
                              st.architectureCullingRadius != null ? Math.round(+st.architectureCullingRadius) : null,
                          streamBudgetMs:
                              st._voxelStreamBudgetMs != null ? +(+st._voxelStreamBudgetMs).toFixed(1) : null,
                      },
                      // (b) die GRUPPEN-KLASSEN: „archInstanceGroups 0→660" nannte das
                      // Leck, aber nie die KLASSE (fscatter/fimp/@s:/p:/global) — jetzt
                      // zählt der Export die Schlüssel-Präfixe und NENNT den Wächst.
                      gruppenKlassen: this._flightRecorderGruppenKlassen(),
                      // (c) der CHURN-ZENSUS (18.07., zweiter Trace: +366 Gruppen bei
                      // stehendem Spieler): Mints/Tode + die Top-Wiederkehrer-Schlüssel —
                      // die Familie, die im Kreis stirbt und wiederaufersteht, beim Namen.
                      gruppenChurn: this._archGruppenChurnZensus(),
                      // WELLE 5 — der BERG-SCHATTEN im Trace: Tests gesamt + verdeckte
                      // Region-Frames (die Verdeckungs-Ersparnis wird messbar).
                      bergCull: {
                          tests: this._bergCullTests || 0,
                          verdecktFrames: this._bergCullVerdeckt || 0,
                      },
                      // DER EINE WELT-MARCH im Trace: wie viele Einträge leben (belegt), wie viel Listen-Raum
                      // bleibt, wie viele Analog-Sätze und Gesetz-Plätze — die Kapazitäts-Wahrheit.
                      weltMarch: this.state.weltMarch
                          ? {
                                belegt: this.state.weltMarch.belegt, // Feld-EINTRÄGE (Instanzen)
                                // die Stellvertreter des March-Draws (Obergrenze × Plätze je Gesetz-Block)
                                stellvertreter: this.state.weltMarch.obergrenze * AnazhRealm.WELT_MARCH.gesetzBlock,
                                // ANALOG E — Kapsel-Dedup in den Flugschreiber (nicht nur Live-Konsole)
                                kapseln: this.state.weltMarch.kapselCache ? this.state.weltMarch.kapselCache.size : 0,
                                felderFrei: this.state.weltMarch.freiFelder.length,
                                // DAS VERTEILUNGS-GESETZ (C): Klein-Streu-Blöcke + Plätze
                                gesetzBloecke: this.state.weltMarch.gesetzBloecke || 0,
                                gesetzPlaetze: this.state.weltMarch.gesetzPlaetze || 0,
                            }
                          : null,
                      // V18.491.90 — letzte Chat-Metrologie-Stempel (Ring, Slice −8) im Export
                      eMetrologieStamps: (this._eMetrologieStamps || []).slice(-8),
                      // (d) DER INGEST-TAKT (sechste Welle): freigegeben gesamt + Stau-
                      // Spitze — der Beweis, dass Konversions-Bursts nie mehr bündeln.
                      ingestTakt: {
                          frei: this._foundryIngestFrei || 0,
                          stau: this._foundryIngestQueue ? this._foundryIngestQueue.length : 0,
                          stauMax: this._foundryIngestMaxQ || 0,
                      },
                      // (e) Bundle-Deckung: Anteil sichtbarer Render-Objekte in Region-RenderBundles — die
                      // Nicht-Bundle-Population IST die per-Draw-Uniform-Bahn.
                      bundleDeckung: this._flightRecorderBundleDeckung(),
                      // (f) DER LIVE-SET-ZENSUS (zehnte Welle — GC-Wal): GC-Pausen
                      // skalieren mit dem LIVE-SET (3-GB-Heap des sechsten Traces),
                      // nicht mit der Rate — der Trace kannte nur Zähler, nie BYTES.
                      heapZensus: this._flightRecorderHeapZensus(),
                  }
                : null,
            worstFrames: fr.worst,
            // V18.469 — der Fern-Regime-Beweis vom echten Holz: gescheitert > 0 heißt „die Fernstufe serviert
            // Geometrie statt der Studio-Karte" (W6: Zellen · gebacken · von der Platte · Atlas-MB).
            impostorZensus: this._impostorCensus(),
            // Material-Zensus: LEBENDE Materialien je Familie (unique nach uuid, zum Export-Zeitpunkt) —
            // eine absurd wachsende Familie IST der Pipeline-Münzer.
            materialZensus: this._flightRecorderMaterialFamilien(),
        };
    }

    _flightRecorderMaterialFamilien() {
        try {
            const sc = this.state.scene;
            if (!sc) return null;
            const seen = new Set();
            const fam = new Map();
            sc.traverse((o) => {
                const mats = o.material ? (Array.isArray(o.material) ? o.material : [o.material]) : null;
                if (!mats) return;
                for (const m of mats) {
                    if (!m || !m.uuid || seen.has(m.uuid)) continue;
                    seen.add(m.uuid);
                    const u = m.userData || {};
                    const f = u.sharedFoliage
                        ? "sharedFoliage"
                        : u.impostorBillboard
                          ? "impostorBillboard"
                          : m.name || m.type || "?";
                    fam.set(f, (fam.get(f) || 0) + 1);
                }
            });
            const top = Array.from(fam.entries())
                .sort((a, b) => b[1] - a[1])
                .slice(0, 8)
                .map(([name, n]) => ({ name: String(name).slice(0, 40), n }));
            return { unique: seen.size, top };
        } catch {
            return null; // der Flugschreiber darf NIE stören
        }
    }

    // Live-Set-Zensus: CPU-seitig gehaltene TypedArray-Bytes der Szene (Attribute + Index +
    // Instanz-Puffer, dedupliziert über Objekt-Identität) je Familie, plus große Halter außerhalb
    // (Foundry-Cache · Impostor-Atlanten · entlassene Böden). Reine Lese-Linse, nur am Export-Zeitpunkt.
    _flightRecorderHeapZensus() {
        try {
            const sc = this.state.scene;
            if (!sc) return null;
            const gesehen = new Set();
            const fam = new Map();
            let gesamt = 0;
            const zaehle = (a, name) => {
                if (!a || !a.array || gesehen.has(a)) return;
                gesehen.add(a);
                const b = a.array.byteLength || 0;
                gesamt += b;
                fam.set(name, (fam.get(name) || 0) + b);
            };
            sc.traverse((o) => {
                const g = o.geometry;
                if (!g) return;
                const nm = this._taeterKlasse(o);
                if (g.attributes) for (const k in g.attributes) zaehle(g.attributes[k], nm);
                zaehle(g.index, nm);
                if (o.isInstancedMesh === true) {
                    zaehle(o.instanceMatrix, nm);
                    if (o.instanceColor) zaehle(o.instanceColor, nm);
                }
            });
            const top = Array.from(fam.entries())
                .sort((a, b) => b[1] - a[1])
                .slice(0, 10)
                .map(([k, v]) => ({ familie: String(k).slice(0, 48), mb: +(v / 1048576).toFixed(1) }));
            return {
                szeneMB: +(gesamt / 1048576).toFixed(1),
                top,
                halter: (() => {
                    const f = this._foundry;
                    // DER SATZ (Welle B) — die Linse NENNT die Pool-Puffer: Bereiche, Kapazität, Wachstum je Art, je Pass
                    // die Indizes seines Abschnitts und die Index-Bytes je „Verursacher>Abschnitt" (kumulativ).
                    const saetze = {};
                    if (this.state.chunkSaetze)
                        for (const [art, s] of this.state.chunkSaetze) {
                            const abschnitte = {};
                            const luecken = {};
                            for (const [k, a] of s.abschnitte) {
                                abschnitte[k] = a.n;
                                luecken[k] = a.ende - a.n;
                            }
                            saetze[art] = {
                                bereiche: s.bloecke.size,
                                vEnde: s.vEnde,
                                vKap: s.vKap,
                                index: s.iSumme,
                                abschnitte,
                                luecken,
                                iEnde: s.iEnde,
                                iKap: s.iKap,
                                wachse: s.wachse,
                                schreiben: { ...s.schreiben },
                            };
                        }
                    return {
                        foundryCacheN: f && f.cache ? f.cache.size : 0,
                        foundryCacheMB:
                            f && Number.isFinite(f.cacheBytes) ? +(f.cacheBytes / 1048576).toFixed(1) : null,
                        chunkSaetze: saetze,
                    };
                })(),
            };
        } catch {
            return null; // der Flugschreiber darf NIE stören
        }
    }

    // Bundle-Deckung: der per-Draw-Uniform-Sturm skaliert mit den Render-Objekten AUSSERHALB der
    // Region-RenderBundles. Zählt sichtbare Renderables in/außerhalb, nennt die Top-Draußen-Familien.
    _flightRecorderBundleDeckung() {
        try {
            const sc = this.state.scene;
            if (!sc) return null;
            let drin = 0,
                draussen = 0;
            const fam = new Map();
            const walk = (o, imBundle) => {
                const inB = imBundle || o.isBundleGroup === true;
                if ((o.isMesh || o.isPoints || o.isLine) && o.visible !== false) {
                    if (inB) drin++;
                    else {
                        draussen++;
                        const kurz = this._taeterKlasse(o).slice(0, 32);
                        fam.set(kurz, (fam.get(kurz) || 0) + 1);
                    }
                }
                if (o.children) for (const c of o.children) walk(c, inB);
            };
            walk(sc, false);
            const top = Array.from(fam.entries())
                .sort((a, b) => b[1] - a[1])
                .slice(0, 8)
                .map(([name, n]) => ({ name, n }));
            const gesamt = drin + draussen;
            return { drin, draussen, deckungPct: gesamt ? Math.round((drin / gesamt) * 100) : 0, topDraussen: top };
        } catch {
            return null; // der Flugschreiber darf NIE stören
        }
    }

    // TRACE-BLINDSTELLEN-HEILUNG (18.07.) — die KLASSEN der archInstanceGroups:
    // der Leck-Verdikt nannte „0→660", aber nie WER wächst. Zählt die Schlüssel
    // nach den etablierten Präfix-Klassen (Export-Zeitpunkt, ein Map-Walk).
    _flightRecorderGruppenKlassen() {
        try {
            const m = this.state.archInstanceGroups;
            if (!m || !m.size) return null;
            const k = { fscatter: 0, fimp: 0, foundry: 0, superRegion: 0, streuRegion: 0, global: 0 };
            for (const key of m.keys()) {
                if (typeof key !== "string") continue;
                if (key.startsWith("fscatter:")) k.fscatter++;
                else if (/(^|#)fimp:/.test(key)) k.fimp++;
                else if (/(^|#)f:/.test(key)) k.foundry++;
                if (key.includes("@s:")) k.superRegion++;
                else if (key.includes("@")) k.streuRegion++;
                else k.global++;
            }
            return k;
        } catch {
            return null; // der Flugschreiber darf NIE stören
        }
    }

    // V18.294 — einen Speicher-Mess-Punkt nehmen: Heap (Chrome `performance.memory`)
    // + die Größe jeder großen Sammlung, die lecken KÖNNTE. Reine Lesungen
    // (.size/.length) — vernachlässigbar billig.
    _flightRecorderSampleSizes() {
        const st = this.state;
        const mem = typeof performance !== "undefined" && performance.memory ? performance.memory : null;
        const sz = (x) => (x && typeof x.size === "number" ? x.size : x && typeof x.length === "number" ? x.length : 0);
        return {
            t: (typeof performance !== "undefined" && performance.now ? performance.now() : Date.now()) / 1000,
            heapMB: mem ? +(mem.usedJSHeapSize / 1048576).toFixed(1) : null,
            sizes: {
                sceneChildren: st.scene && st.scene.children ? st.scene.children.length : 0,
                voxelChunks: sz(st.voxelChunks),
                pendingDisposals: sz(st.pendingDisposals),
                voxelMeshCache: sz(st.voxelMeshCache),
                architectures: sz(st.architectures),
                creatures: sz(st.creatures),
                abilities: st.dsl ? sz(st.dsl.abilities) : 0,
                dslHistory: st.dsl ? sz(st.dsl.history) : 0,
                worldRules: sz(st.worldRules),
                rigidBodies: sz(st.rigidBodies),
                pendingWaterIso: sz(st.pendingWaterIso),
                nahStreu: st.nahStreu ? st.nahStreu.kacheln.size : 0,
                pendingGrass: sz(st.pendingGrass),
                pendingFoliage: sz(st.pendingFoliageChunks),
                floatingIslands: sz(st.floatingIslands),
                ufos: sz(st.ufos),
                archInstanceGroups: sz(st.archInstanceGroups),
                scatterRegions: sz(st.scatterRegions),
                logBuffer: sz(st.logBuffer),
            },
        };
    }

    // Leckt `sceneChildren`: gruppiert scene.children nach stabilem Etikett (userData.sourceOp/kind,
    // sonst Konstruktor + Geometrie) und nennt die häufigsten. Billig (~Hunderte Kinder, alle paar s).
    _flightRecorderSceneBreakdown() {
        const sc = this.state.scene && this.state.scene.children;
        if (!sc || !sc.length) return null;
        const counts = {};
        for (const o of sc) {
            if (!o) continue;
            const ud = o.userData || {};
            let label;
            if (ud.archInstanceKey)
                label = "archInstanceGroup"; // pro (Art,Variante,LOD) — Familie
            else label = ud.sourceOp || ud.kind || ud.scatterKind || null;
            if (!label) {
                label = (o.constructor && o.constructor.name) || o.type || "Object3D";
                if (o.isSprite) label = "Sprite";
                else if (o.isInstancedMesh) label += "[instanced]";
                else if (o.isMesh && o.geometry) label += ":" + (o.geometry.type || "geom");
            }
            counts[label] = (counts[label] || 0) + 1;
        }
        return Object.entries(counts)
            .sort((a, b) => b[1] - a[1])
            .slice(0, 8)
            .map(([k, v]) => `${k}×${v}`);
    }

    // Mess-Punkt in die Reihe (Fenster ~160 s), Wachstum lesen: Heap-Rate (MB/s) + die am stärksten
    // wachsende Sammlung — die Attribution des Lecks.
    _flightRecorderMemoryReport() {
        const fr = this.state.flightRecorder;
        if (!fr) return null;
        try {
            fr.memSeries.push(this._flightRecorderSampleSizes());
            if (fr.memSeries.length > 40) fr.memSeries.shift(); // ~160 s rollend (40 × 4 s)
        } catch {
            return null;
        }
        const series = fr.memSeries;
        if (series.length < 2) return null;
        const a = series[0],
            b = series[series.length - 1];
        const dt = Math.max(0.001, b.t - a.t);
        const heapRate = a.heapMB != null && b.heapMB != null ? +((b.heapMB - a.heapMB) / dt).toFixed(2) : null;
        const growth = {};
        let topK = null,
            topV = 0;
        for (const k of Object.keys(b.sizes)) {
            const d = (b.sizes[k] || 0) - (a.sizes[k] || 0);
            growth[k] = d;
            if (d > topV) {
                topV = d;
                topK = k;
            }
        }
        const topGrower = topK
            ? `${topK} ${a.sizes[topK]}→${b.sizes[topK]} (+${topV} über ${Math.round(dt)}s)`
            : "keine Sammlung wächst";
        // V18.295 — wächst die SZENE, NENNE die Objekt-Art (der eigentliche Schuldige).
        const sceneBreakdown = topK === "sceneChildren" ? this._flightRecorderSceneBreakdown() : null;
        const breakdownStr = sceneBreakdown ? ` → Szene-Inhalt: ${sceneBreakdown.join(", ")}` : "";
        let verdict;
        if (heapRate != null && heapRate > 0.3) {
            verdict = `LECK: Heap +${heapRate} MB/s über ${Math.round(dt)}s — der größte Wächst: ${topGrower}${breakdownStr}.`;
        } else if (heapRate != null) {
            verdict = `Heap stabil (+${heapRate} MB/s über ${Math.round(dt)}s). Größter Wächst: ${topGrower}${breakdownStr}.`;
        } else {
            verdict = `kein Heap-Messwert (performance.memory fehlt). Größter Wächst: ${topGrower}${breakdownStr}.`;
        }
        // Einmal laut melden, sobald ein klares Leck steht. Ramp-Gate: während die Welt zum Ziel-Ring
        // RAMPT (Boot/Welt-Wechsel), ist Wachstum normal — erst am Ziel wird gemeldet; ein echtes Leck
        // wächst weiter, ein Boot-Transient verstummt.
        const _ramping =
            this.state._activeRingRadius != null &&
            this.state._activeRingRadius < Math.max(1, Math.min(12, this.state.chunkRingRadius || 4));
        if (!fr._leakAnnounced && !_ramping && ((heapRate != null && heapRate > 0.5) || topV > 200)) {
            fr._leakAnnounced = true;
            this.log(`Flugschreiber LECK-VERDACHT — ${verdict}`, "INFO");
        }
        return {
            heapMB: b.heapMB,
            heapGrowthMBPerSec: heapRate,
            windowSec: +dt.toFixed(0),
            verdict,
            topGrower,
            sceneBreakdown,
            sizesNow: b.sizes,
            growthOverWindow: growth,
        };
    }

    // Sichern: immer auf window.__anazhPerf; als anazhRealmPerf.json POSTen NUR auf dem lokalen
    // save-server (sonst stiller Skip), headless nie. Fire-and-forget.
    _flightRecorderSave(final) {
        try {
            const trace = this._flightRecorderBuildTrace();
            if (!trace) return;
            if (typeof window !== "undefined") window.__anazhPerf = trace;
            const r = this.state.renderer;
            if (r && r._isHeadlessNull) return; // Gate sauber halten — kein File im headless-Lauf
            if (typeof fetch === "undefined" || !this.isSaveServerHost || !this.isSaveServerHost()) return;
            fetch("http://localhost:4312/api/perf-trace", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ trace }),
                keepalive: !!final, // beim pagehide den Request überleben lassen
            })
                .then(() => {
                    const fr = this.state.flightRecorder;
                    if (fr && !fr._announced) {
                        fr._announced = true;
                        this.log(
                            "Flugschreiber aktiv — die echte Frame-Last fließt nach anazhRealmPerf.json (öffne `perf` für das Live-Fenster).",
                            "INFO"
                        );
                    }
                })
                .catch(() => {});
        } catch {
            /* der Flugschreiber darf NIE stören */
        }
    }

    // ### Physik ###
    // Keine Bullet-Welt: die Kollision ist feld-nativ (`_stepCharacter`, `_fieldRaycast`,
    // `_stepCharacterStructures`). Es bleibt der Skalar-Vektor-Pool (Plain-JS mit derselben
    // `.x()/.y()/.z()/.setValue()`-Schnittstelle für `setVec` + Raycast); Velocity in `state.playerVel`.
    initPhysics() {
        this.state.physicsWorld = null;
        this.state.tmpTransform = null;
        this.state.tmpVec1 = this._makeFieldVec();
        this.state.tmpVec2 = this._makeFieldVec();
        this.state.playerVel = this._makeFieldVec();
        this.log("Feld-Physik (Determinismus-Controller) — keine Ammo-Welt, Kollision aus dem Dichtefeld.");
    }

    // Plain-JS-Skalar-Vektor mit der schmalen Schnittstelle, die der Hot-Path nutzt
    // (`setValue` + die `.x()/.y()/.z()`-Akzessoren — der Raycast-Ursprung + der
    // Velocity-Speicher lesen so). KEIN Ammo, kein WASM-Heap.
    _makeFieldVec(x = 0, y = 0, z = 0) {
        return {
            _x: x,
            _y: y,
            _z: z,
            setValue(a, b, c) {
                this._x = a;
                this._y = b;
                this._z = c;
                return this;
            },
            x() {
                return this._x;
            },
            y() {
                return this._y;
            },
            z() {
                return this._z;
            },
        };
    }

    setVec(v, x, y, z) {
        // Schreibt Werte in den wiederverwendbaren Skalar-Vektor (Feld-Pool), statt
        // einen neuen zu allokieren — der Vektor darf überschrieben werden, sobald die
        // Aufrufkette zurückkehrt.
        v.setValue(x, y, z);
        return v;
    }

    // DER HIMMEL STEHT IM UNENDLICHEN (K16, echte GPU 11.10.): Kuppel (500 m), Sterne (480 m), Sonne und Mond (380 m) folgen
    // der Kamera in endlichem Abstand — mit Tiefentest überschrieb die Kuppel jeden Fern-Ring-Vertex jenseits 500 m (aus 300 m
    // Höhe lag die Welt unter einem „Meer“ aus Horizont-Blau). Der EINE Knoten setzt ihr Clip-z auf w: Tiefe 1,0, sie zeichnen
    // nur, wo die Welt (Mesh, Ring, Feld, Panorama) nichts zeichnete — in jeder Reihenfolge (`gate:himmel-tag` 7 UNENDLICH).
    static _himmelImUnendlichen(mat) {
        if (!AnazhRealm._unendlichKnoten) {
            const T = THREE.TSL;
            const p = T.modelViewProjection;
            AnazhRealm._unendlichKnoten = T.vec4(p.xy, p.w, p.w);
        }
        mat.vertexNode = AnazhRealm._unendlichKnoten;
        return mat;
    }

    // ### Skybox ###
    createGalaxySkybox() {
        // Skybox als MeshBasicNodeMaterial (TSL): die Himmels-Sicht der EINEN Atmosphäre + horizont-genordete Wolken.
        // vDir = normalize(positionLocal) hält den Sample-Punkt in Welt-Richtung, egal wo der Spieler steht.
        // Live-Uniforms in `state.skyboxUniforms` (`.value`-Setter): _dayNightApplySkybox (cloudCover; die Tönung über
        // himmelTint, den Träger des Tints), _loopSkyboxZeit (time pro Frame).
        const TSL = THREE.TSL;
        // Idempotent am Chokepoint: ein zweiter Bau ERSETZT den ersten statt eine zweite Kuppel zu
        // stapeln (kein Doppel-Heap).
        if (this.state.skybox) {
            if (this.state.scene) this.state.scene.remove(this.state.skybox);
            if (this.state.skybox.geometry) this.state.skybox.geometry.dispose();
            if (this.state.skybox.material) this.state.skybox.material.dispose();
            this.state.skybox = null;
        }
        const {
            uniform,
            vec2,
            vec3,
            float,
            positionLocal,
            normalize,
            dot,
            floor,
            fract,
            mix,
            smoothstep,
            clamp,
            max,
            Fn,
        } = TSL;
        // DER HIMMEL IST DIE ATMOSPHÄRE (D3): die Kuppel liest die Himmels-Sicht der EINEN Atmosphäre (`_atmoLutBau`,
        // Hillaire) — Rayleigh-Blau, Mie-Hof um die Sonne, Dämmerung und Mondnacht aus dem Medium; bis D3 eine Nebel-Kuppel
        // (Indigo-Noise × Tint-Farbe, Horizont-Dunst, drei Halo-Schichten), getunt statt gerechnet. Die Scheibe der Sonne
        // trägt ihr Körper (`sunMesh`), den Hof die Mie-Phase der Tafel.
        const A = this._atmoLutBau();
        // Zwei Live-Uniforms (uniform-Knoten, .value-mutable): die Zeit (Drift der Wolken) und die Deckung des Wetters.
        const uTime = uniform(0.0);
        const uCloudCover = uniform(0.3);
        // V17.2 — Sonnen-Richtung für den Wolken-Glanz zur Sonne hin. EINE Quelle: derselbe sunDir, der DirectionalLight +
        // das Gras-Gegenlicht speist (`_dayNightApplyDirectionalLight`-Sync).
        const uSunDir = uniform(new THREE.Vector3(0.4, 0.8, 0.3).normalize());
        // W9 — der Farbton der Sonne fürs Wolken-Gesetz (der Durchlass der EINEN Atmosphäre, `_atmoSonne`; Schreiber:
        // _dayNightApplyDirectionalLight).
        const uSunCol = uniform(new THREE.Color(1, 0.95, 0.85));
        // vDir = normalize(positionLocal) — stabile Welt-Achse, V8.26-Bug-Schutz.
        const vDir = normalize(positionLocal);

        // Das Wolken-Feld folgt HIMMEL_GESETZ (foundry-core — dieselben Zahlen injiziert das Studio in sein
        // GLSL): Himmelsebenen-Projektion sp=dir.xz/(dir.y+projY), zwei fbm-Abtastungen (h21/vn verbatim),
        // Deckungs-smoothstep aus uCloudCover, Horizont-Ausklang, Farbton uSunCol (_atmoSonne).
        // max(y,hor0) klemmt den Nenner unter dem Horizont (TSL brancht nicht wie das Studio) — sonst NaN.
        // Fail-closed: das Gesetz lebt NUR in foundry-core (__terrainCore); unlesbar → Bruch, der schreit.
        const HG =
            AnazhRealm.Gesetz("terrain:HIMMEL_GESETZ", null) || AnazhRealm._kernPflichtBruch("terrain:HIMMEL_GESETZ");
        const h21 = Fn(([q]) => {
            const p = fract(q.mul(vec2(123.34, 345.45)));
            const p2 = p.add(dot(p, p.add(34.345)));
            return fract(p2.x.mul(p2.y));
        });
        const vn2 = Fn(([q]) => {
            const i = floor(q);
            const f0 = fract(q);
            const f = f0.mul(f0).mul(float(3.0).sub(f0.mul(2.0)));
            return mix(
                mix(h21(i), h21(i.add(vec2(1.0, 0.0))), f.x),
                mix(h21(i.add(vec2(0.0, 1.0))), h21(i.add(vec2(1.0, 1.0))), f.x),
                f.y
            );
        });
        const fbm2 = Fn(([q]) => {
            let s = float(0.0);
            let p = q;
            let a = 0.5;
            for (let o = 0; o < HG.fbm.okt; o++) {
                s = s.add(vn2(p).mul(a));
                p = p.mul(HG.fbm.lac).add(HG.fbm.off);
                a *= 0.5;
            }
            return s;
        });
        const sp = vDir.xz.div(max(vDir.y, float(HG.hor[0])).add(HG.projY));
        const dr = vec2(uTime.mul(HG.drift[0]), uTime.mul(HG.drift[1]));
        const nA = fbm2(sp.mul(HG.s1).add(dr));
        const nB = fbm2(sp.mul(HG.s2).sub(dr.mul(HG.drift2)));
        const cov = uCloudCover;
        const dens = smoothstep(
            float(HG.dens[0]).sub(cov.mul(HG.dens[1])),
            float(HG.dens[2]).sub(cov.mul(HG.dens[3])),
            nA.mul(HG.mixN[0]).add(nB.mul(HG.mixN[1]))
        ).mul(smoothstep(float(HG.hor[0]), float(HG.hor[1]), vDir.y));
        const saW = clamp(dot(vDir, normalize(uSunDir)).mul(0.5).add(0.5), float(0.0), float(1.0));
        const litW = mix(
            vec3(HG.litGrau[0], HG.litGrau[1], HG.litGrau[2]),
            uSunCol.mul(HG.litSonne[0]).add(HG.litSonne[1]),
            saW.mul(HG.litSa)
        );
        const edgeW = smoothstep(float(0.0), float(HG.edge[0]), nB).mul(HG.edge[1]).add(HG.edge[2]);
        const cloudAmt = clamp(dens.mul(edgeW).mul(HG.deck), float(0.0), float(1.0));
        // Wolken-Farbe = Studio-Gesetz: grau → sonnenbeschienen (litW), bedeckt → dunkler (HG.bedeckt).
        const cloudColor = mix(litW, vec3(HG.bedeckt[0], HG.bedeckt[1], HG.bedeckt[2]), cov.mul(HG.bedecktK));
        // DAS LICHT DER WOLKE aus den Tafeln: Sonne und Mond durch die Atmosphäre bis zur Wolken-Ebene (2 km über dem Auge)
        // auf ihre Oberseite, dazu der Himmel von oben (der Zenit der Himmels-Sicht, E/π) — Lambert. So ist die Mittags-Wolke
        // weiß über dem Blau und die Nacht-Wolke dunkler als die 18-%-Karte im Mondlicht.
        const U = A.U;
        const rW = U.hKm.add(A.RG + 2);
        const lichtWolke = A.durchlass(rW, U.sonne.y)
            .mul(max(U.sonne.y, 0))
            .add(U.mondE.mul(A.durchlass(rW, U.mond.y)).mul(max(U.mond.y, 0)))
            .mul(U.licht.div(Math.PI))
            .add(A.himmelFarbe(vec3(0, 1, 0)));
        const wolkeHell = dot(lichtWolke, vec3(0.2126, 0.7152, 0.0722));
        const finalColor = mix(A.himmelFarbe(vDir), cloudColor.mul(wolkeHell), cloudAmt);

        const skyboxGeometry = new THREE.SphereGeometry(500, 32, 32);
        const skyboxMaterial = new THREE.MeshBasicNodeMaterial();
        skyboxMaterial.colorNode = finalColor;
        skyboxMaterial.side = THREE.BackSide;
        skyboxMaterial.depthWrite = false;
        AnazhRealm._himmelImUnendlichen(skyboxMaterial);

        // Live-Uniforms speichern — DSL/dayNight/loop schreiben hier hinein
        // statt in das alte `material.uniforms.X.value` (das gibt's bei
        // NodeMaterial nicht mehr; uniform-Knoten haben .value direkt).
        this.state.skyboxUniforms = {
            time: uTime,
            // der TRÄGER der Tönung (kein Knoten der Kuppel): der Tint des Tag-Nacht-Stops mit Wetter, Feld, Gefühl und
            // DSL-Tönung — die Kuppel liest sein Verhältnis zum blanken Stop (`atmoLut.U.toenung`, D3)
            himmelTint: { value: new THREE.Color(1, 1, 1) },
            cloudCover: uCloudCover,
            sunDir: uSunDir,
            sunCol: uSunCol,
        };

        const skybox = new THREE.Mesh(skyboxGeometry, skyboxMaterial);
        skybox.name = "himmel";
        skybox.userData.zeichenSchicht = "himmel"; // nach allem Opaken: nur Himmel-Pixel zahlen (`_zeichenRang`, T3)
        // V10.0-j — Skybox wirft keine Schatten (BackSide-Hülle um die Welt).
        skybox.castShadow = false;
        skybox.receiveShadow = false;
        this.state.scene.add(skybox);
        this.state.skybox = skybox;
        this.log("Galaxy-Skybox erstellt (V10.0-f-1 TSL)");

        // Das Sternfeld (mit den Wandelsternen) ist Fern-Deko: es baut NACH der Bühne (`_tickBootFernDeko`), der
        // Himmel selbst bleibt Boot. Headless baut sofort (die Playtest-Bänder sehen die volle Szene). Alle
        // Konsumenten (_dayNightApplyStarField · Kamera-Pin) sind null-sicher (starField/starFieldUniforms).
        if (this.state.renderer && this.state.renderer._isHeadlessNull) {
            // V8.28 6.G4.b A — echtes Stern-Feld als THREE.Points
            this._buildStarField();
        } else {
            this._fernDekoDeferred = true; // Instanz-Feld (this._x — nicht serialisiert)
        }
        // V8.28 6.G4.b D — Welt-Wasser (Wave-Plane in Senken)
        this._buildWaterPlane();
        // Die Ferne tragen Fern-Ring + Feld-Pass (die Luft dunstet sie, V18.530) — keine eigene Fern-Kulisse
        // (Canopy-Shell) auf dem Boot-Pfad.
    }

    // Deferierter Fern-Deko-Bau: das Sternfeld (mit den Wandelsternen) erscheint EINMAL, sobald die Bühne steht —
    // synchron im Boot stähle er dem Boden-Streaming den Frame. No-op ohne `_fernDekoDeferred`
    // (headless baut sofort in createGalaxySkybox).
    _tickBootFernDeko() {
        if (!this._fernDekoDeferred) return;
        if (!this._buehneSteht()) return;
        this._fernDekoDeferred = false;
        try {
            this._buildStarField();
        } catch (err) {
            // Fern-Deko reißt den ewigen Loop nie — laut beim Namen (K22), nie tödlich
            this._stoffBruch("die Fern-Deko (Sterne)", err);
        }
    }

    // Sterne als diskrete Billboards statt Shader-Noise: Noise hat keinen Pixel-Footprint und aliast bei
    // Kamera-Rotation (Blinken); diskrete Quads rastert die GPU mit echtem Anti-Aliasing.
    // ~2800 Sterne deterministisch aus worldMeta.seed; Größe + Hue je Stern (O/B bläulich ↔ K/M gelblich);
    // Sidereal-Rotation mit timeOfDay um eine geneigte Achse, Position folgt der Kamera; AdditiveBlending.
    // DIE SICHTBARKEIT IST PHYSIK (V18.530): jeder Punkt trägt seine scheinbare Helligkeit als Größenklasse
    // (`aMag`), die Dämmerung setzt die Grenzgröße (`_himmelGrenzgroesse`) — mittags ist NICHTS sichtbar,
    // in der Dämmerung erscheint zuerst der Abendstern, dann die hellen Sterne, in tiefer Nacht alle.
    // DIE WANDELSTERNE (`HIMMEL.wandelsterne`) sind die hellsten Punkte desselben Feldes — keine Kugeln.
    // Befund 04.10. (Blick-Tour 7-birke): drei Math.random-Kugeln (10–30 m auf 400 m = 3–8° — 6–16 Monde
    // breit, Zufallsfarbe, unbeleuchtet) standen am Mittagshimmel; die pinke war die sichtbare.
    _buildStarField() {
        if (!this.state.scene || typeof THREE === "undefined") return;
        const WANDEL = AnazhRealm.HIMMEL.wandelsterne;
        const FIX_COUNT = 2800;
        const STAR_COUNT = FIX_COUNT + WANDEL.length;
        const RADIUS = 480; // knapp innerhalb der Skybox-Sphere (500)
        // Deterministischer RNG aus dem Welt-Seed — alle Mitspieler sehen
        // denselben Himmel (Vision: eine Welt, ein Sternbild).
        const seedStr = (this.state.worldMeta && this.state.worldMeta.seed) || "anazh-realm-seed";
        let seedNum = 0;
        for (let i = 0; i < seedStr.length; i++) {
            seedNum = (seedNum * 31 + seedStr.charCodeAt(i)) >>> 0;
        }
        const rng = () => {
            // Mulberry32 — deterministisch, schnell, gute Verteilung
            seedNum = (seedNum + 0x6d2b79f5) >>> 0;
            let t = seedNum;
            t = Math.imul(t ^ (t >>> 15), t | 1);
            t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
            return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
        };
        const positions = new Float32Array(STAR_COUNT * 3);
        const colors = new Float32Array(STAR_COUNT * 3);
        const sizes = new Float32Array(STAR_COUNT);
        const mags = new Float32Array(STAR_COUNT);
        const warm = new THREE.Color(1.0, 0.92, 0.75); // K/M-Sterne (gelblich)
        const cool = new THREE.Color(0.78, 0.86, 1.0); // O/B-Sterne (bläulich)
        const tmpCol = new THREE.Color();
        for (let i = 0; i < STAR_COUNT; i++) {
            const w = i >= FIX_COUNT ? WANDEL[i - FIX_COUNT] : null;
            // Gleichmaessige Verteilung auf der Kugel (kein Pol-Cluster)
            const u = rng();
            const v = rng();
            const theta = 2 * Math.PI * u;
            const phi = Math.acos(2 * v - 1);
            positions[i * 3] = RADIUS * Math.sin(phi) * Math.cos(theta);
            positions[i * 3 + 1] = RADIUS * Math.cos(phi);
            positions[i * 3 + 2] = RADIUS * Math.sin(phi) * Math.sin(theta);
            // Hue: mix warm/cool. Helligkeit korreliert leicht mit Groesse.
            const hue = rng();
            tmpCol.copy(cool).lerp(warm, hue);
            // Mindestgröße 3 px: kleinere Punkte flackern beim langsamen Drehen (Sub-Pixel an/aus).
            // Kleine Sterne werden DIMMER statt kleiner — die Helligkeit trägt die Variation.
            const sizeRoll = rng();
            const size = 3.0 + Math.pow(sizeRoll, 2) * 3.5; // 3..6.5 px, AA-sicher
            sizes[i] = size;
            // Helligkeit traegt die Stern-Variation (statt der Groesse):
            // pow³-biased → die meisten Sterne dim, wenige hell.
            const bright = 0.32 + Math.pow(sizeRoll, 3) * 0.68;
            colors[i * 3] = tmpCol.r * bright;
            colors[i * 3 + 1] = tmpCol.g * bright;
            colors[i * 3 + 2] = tmpCol.b * bright;
            // Die Größenklasse aus demselben Wurf: die meisten Sterne lichtschwach (6), wenige hell (bis −1).
            mags[i] =
                AnazhRealm.HIMMEL.sternMagSchwach - (AnazhRealm.HIMMEL.sternMagSchwach + 1) * Math.pow(sizeRoll, 3);
            if (w) {
                // Ein Wandelstern: dieselbe Kugel-Verteilung, eigene Farbe, eigene Helligkeit, ein Hauch größer.
                sizes[i] = w.groesse;
                colors[i * 3] = w.farbe[0];
                colors[i * 3 + 1] = w.farbe[1];
                colors[i * 3 + 2] = w.farbe[2];
                mags[i] = w.mag;
            }
        }
        // Jeder Stern ist ein 4-Vertex-Quad in einer InstancedMesh: die Quad-uv ist per TSL
        // `attribute("uv", "vec2")` WGSL-konform lesbar → Soft-Falloff smoothstep(0.5..0.08).
        // Quad-Normal zeigt zum Sphären-Zentrum (die Kamera — starField.position folgt ihr).
        // worldSize ≈ aSize × 1.0: bei RADIUS=480, FOV 70° und 720p ist 1 Welt-Einheit ≈ 1 px — kein
        // pixelRatio-Uniform, DPR wirkt über die Render-Auflösung.
        const TSL = THREE.TSL;
        const { uniform, attribute, vec2, vec4, float, length, smoothstep } = TSL;

        const uOpacity = uniform(0.5);
        // Die Grenzgröße des Himmels (`_himmelGrenzgroesse`): ein Punkt leuchtet, wenn er heller ist als sie
        // (weich über ±0,5 Größenklassen).
        const uGrenze = uniform(-10);

        const planeGeo = new THREE.PlaneGeometry(1, 1);

        const starMat = new THREE.MeshBasicNodeMaterial();
        // Soft-Falloff vom Quad-Center: smoothstep(0.5, 0.08, dist) ist die
        // ursprüngliche V8.29-Formel — Quad-uv 0..1 mit Center bei (0.5, 0.5).
        const uv = attribute("uv", "vec2");
        const d = length(uv.sub(vec2(float(0.5), float(0.5))));
        const falloff = smoothstep(float(0.5), float(0.08), d);
        // Per-Instance Color via Three.js' automatisches `instanceColor`-
        // Attribute (gesetzt via mesh.setColorAt(i, color), gebunden im
        // Shader via attribute("instanceColor", "vec3")).
        const instColor = attribute("instanceColor", "vec3");
        const sichtbar = uGrenze.sub(attribute("aMag", "float")).add(0.5).clamp(0.0, 1.0);
        starMat.colorNode = vec4(instColor, falloff.mul(uOpacity).mul(sichtbar));

        // Material-Properties: identisch zur V10.0-f-2-PointsMaterial-Variante.
        starMat.transparent = true;
        starMat.depthWrite = false;
        starMat.depthTest = true;
        starMat.blending = THREE.AdditiveBlending;
        starMat.alphaTest = 0.01;
        // DoubleSide: Quad-Normale zeigt zum Sphere-Center; falls die Mesh-
        // Rotation in _loopRender (V8.28 sidereal) sie kippt, bleibt das
        // Quad sichtbar.
        starMat.side = THREE.DoubleSide;
        // EIN Befehl (Welle 6): ein durchscheinender DoubleSide-Stoff zeichnet in r184 zwei Durchgänge (Rück-, dann
        // Vorderseite) — jedes Quad zeigt der Kamera genau eine Seite, die additive Mischung vertauscht: ein Durchgang
        // ist dasselbe Bild.
        starMat.forceSinglePass = true;
        AnazhRealm._himmelImUnendlichen(starMat);

        // Der hellste Punkt des Himmels (kleinste Größenklasse): liegt die Grenzgröße mehr als ½ Klasse darüber, ist
        // kein Punkt sichtbar und das Feld zeichnet nicht (_dayNightApplyStarField).
        let hellste = Infinity;
        for (let i = 0; i < STAR_COUNT; i++) if (mags[i] < hellste) hellste = mags[i];
        this.state.starFieldUniforms = {
            opacity: uOpacity,
            grenze: uGrenze,
            hellste,
        };

        const starField = AnazhRealm._instanzMesh(planeGeo, starMat, STAR_COUNT);
        starField.name = "himmel-sterne";
        // Per-Instance-Matrix: Translation auf die Sphäre + Rotation (Normal zum Zentrum) + Scale
        // (worldSize). Einmal beim Build; die siderale Rotation läuft über starField.rotation.
        const tmpPos = new THREE.Vector3();
        const tmpQuat = new THREE.Quaternion();
        const tmpScale = new THREE.Vector3();
        const tmpMatrix = new THREE.Matrix4();
        const fromVec = new THREE.Vector3(0, 0, 1);
        const toVec = new THREE.Vector3();
        for (let i = 0; i < STAR_COUNT; i++) {
            tmpPos.set(positions[i * 3], positions[i * 3 + 1], positions[i * 3 + 2]);
            toVec.copy(tmpPos).negate().normalize();
            tmpQuat.setFromUnitVectors(fromVec, toVec);
            const worldSize = sizes[i] * 1.0; // siehe Berechnung im Kommentar oben
            tmpScale.set(worldSize, worldSize, 1);
            tmpMatrix.compose(tmpPos, tmpQuat, tmpScale);
            starField.setMatrixAt(i, tmpMatrix);
            tmpCol.setRGB(colors[i * 3], colors[i * 3 + 1], colors[i * 3 + 2]);
            starField.setColorAt(i, tmpCol);
        }
        starField.instanceMatrix.needsUpdate = true;
        if (starField.instanceColor) starField.instanceColor.needsUpdate = true;
        // instanceColor auch auf die Geometry binden: setColorAt setzt nur `mesh.instanceColor`, aber TSL
        // `attribute("instanceColor", "vec3")` sucht in `geometry.attributes` — ohne diese Brücke emittiert
        // es vec3(0) → schwarze Sterne.
        if (starField.instanceColor) {
            planeGeo.setAttribute("instanceColor", starField.instanceColor);
        }
        planeGeo.setAttribute("aMag", new THREE.InstancedBufferAttribute(mags, 1));
        starField.frustumCulled = false;
        // Sterne werfen und empfangen keine Schatten (unendlich ferne Billboards).
        starField.castShadow = false;
        starField.receiveShadow = false;
        this.state.scene.add(starField);
        this.state.starField = starField;
        this.log(
            `Stern-Feld erstellt — ${STAR_COUNT} InstancedMesh-Billboards (V10.0-i.a, WGSL-konformer Soft-Falloff)`
        );
    }

    // Setzt nur den Meeresspiegel state.waterLevel (falls ungesetzt). Das sichtbare Wasser baut jeder
    // Voxel-Chunk selbst (Iso-Surface aus den Wasser-Cells, s. unten).
    _buildWaterPlane() {
        if (!this.state.scene || typeof THREE === "undefined") return;
        // Der Meeresspiegel ist ABSOLUT (`terrainBaseHeight − GRUND.meerUnterBasis` des Kerns): bis zur Welle L lief davor eine 13×13-Stichprobe
        // `_voxelSurfaceY` (169 Dichte-Säulen beim Boot), die nur sortiert und dann verworfen wurde (W-kD11).
        if (typeof this.state.waterLevel !== "number")
            this.state.waterLevel =
                (this.state.terrainBaseHeight || 0) - globalThis.__gelaendeCore.GRUND.meerUnterBasis;
        // Das Wasser ist ein Cell-Zustand im Voxel-Feld; jeder Voxel-Chunk baut sein Iso-Surface-Mesh aus
        // den Cells (`_buildVoxelChunkWaterIsoSurface`) — EIN Wasser-Mesh, eine Geometrie-Quelle.
        this.log(`Welt-Wasser — Meeresspiegel y=${this.state.waterLevel.toFixed(1)} (Iso-Cells, V9.75)`);
    }

    // ═══ CANOPY CHUNK-STREAMING ═══
    // Je 512-m-Region ein Mini-Canopy-Mesh im 3×3-Ring um den Spieler (~1.5 km²), ferne Regionen
    // disponiert. Hinter dem Flag `atmosphere.canopyStreaming` (Default false).

    _canopyChunkConfig() {
        return {
            regionM: 512, // Welt-Meter pro Canopy-Chunk-Kante
            gridSize: 48, // 48 Vertices pro Seite → ~11 m/Vertex
            ringRadius: 1, // 3×3-Ring (1 = ±1 in beide Achsen)
            disposeRadius: 3, // ferne Chunks ab Distanz > 3 disposen
        };
    }

    _canopyChunkKey(regX, regZ) {
        return `${regX | 0},${regZ | 0}`;
    }

    _ensureCanopyChunkMap() {
        if (!this.state.canopyChunks || !(this.state.canopyChunks instanceof Map)) {
            this.state.canopyChunks = new Map();
        }
        return this.state.canopyChunks;
    }

    // Eine Canopy-Region bauen (lebendig × clump → coverage → lift, begrenzt auf die Region-AABB).
    // Idempotent: liefert das gecachte Mesh; dirty=true → Rebuild (Welt-Wechsel/Feld-Edit).
    _canopyEnsureChunk(regX, regZ) {
        if (typeof THREE === "undefined" || !this.state.scene) return null;
        const map = this._ensureCanopyChunkMap();
        const key = this._canopyChunkKey(regX, regZ);
        const existing = map.get(key);
        if (existing && !existing.userData._dirty) return existing;
        // Eventuelle alte Disposition (rebuild-Pfad)
        if (existing) this._canopyDisposeChunkByKey(key);
        const C = this._canopyChunkConfig();
        const SIZE = C.gridSize;
        const REGION = C.regionM;
        const N = SIZE - 1;
        const geom = new THREE.PlaneGeometry(REGION, REGION, N, N);
        geom.rotateX(-Math.PI / 2);
        const positions = geom.attributes.position;
        const colors = new Float32Array(positions.count * 3);
        const cx = (regX + 0.5) * REGION;
        const cz = (regZ + 0.5) * REGION;
        let liveCount = 0;
        for (let i = 0; i < positions.count; i++) {
            // Plane-Vertex-Koords sind region-relativ; in Welt-Koords schieben.
            const localX = positions.getX(i);
            const localZ = positions.getZ(i);
            const wx = cx + localX;
            const wz = cz + localZ;
            const terrainY = typeof this._voxelSurfaceY === "function" ? this._voxelSurfaceY(wx, wz) : 0;
            let coverage = 0;
            if (typeof this.worldFieldAt === "function") {
                const f = this.worldFieldAt(wx, wz);
                coverage = f ? Math.max(0, Math.min(1, f.lebendig)) : 0;
                if (typeof this._clumpAt === "function") {
                    const clump = Math.max(0, Math.min(1, 0.5 + 0.5 * this._clumpAt(wx, wz, 0.006)));
                    coverage = coverage * (0.4 + 0.6 * clump);
                }
            }
            const lift = coverage > 0.18 ? coverage * 7 + 11 : 0;
            let bump = 0;
            if (this._growTreeNoise) {
                bump = this._growTreeNoise.noise2D(wx * 0.05, wz * 0.05) * 0.8;
            }
            positions.setY(i, terrainY + lift + bump);
            // Vertex-Position auf Welt-Koord setzen (so kann der Mesh am
            // Welt-Ursprung sitzen, ohne dass eine pro-Chunk-Position-Set
            // den Frustum-Cull bricht).
            positions.setX(i, wx);
            positions.setZ(i, wz);
            colors[i * 3 + 0] = 0.16 + coverage * 0.08;
            colors[i * 3 + 1] = 0.32 + coverage * 0.18;
            colors[i * 3 + 2] = 0.13 + coverage * 0.08;
            if (coverage > 0.22) liveCount++;
        }
        positions.needsUpdate = true;
        geom.setAttribute("color", new THREE.BufferAttribute(colors, 3));
        geom.computeVertexNormals();
        // Material: das bestehende _buildToonNodeMaterial, kein Distance-Dither
        // pro Chunk (der Streaming-Ring übernimmt die Distanz-Klemme implizit).
        const mat = this._buildToonNodeMaterial({
            color: 0xffffff,
            vertexColors: true,
            transparent: true,
            opacity: 0.85,
            side: THREE.DoubleSide,
        });
        const mesh = new THREE.Mesh(geom, mat);
        mesh.frustumCulled = true;
        mesh.castShadow = false;
        mesh.receiveShadow = true;
        mesh.renderOrder = 2;
        mesh.name = "kronendach";
        mesh.userData.kind = "canopyChunk";
        mesh.userData.regX = regX;
        mesh.userData.regZ = regZ;
        mesh.userData.liveCoverageVertices = liveCount;
        mesh.userData._dirty = false;
        this.state.scene.add(mesh);
        map.set(key, mesh);
        return mesh;
    }

    _canopyDisposeChunkByKey(key) {
        const map = this.state.canopyChunks;
        if (!map) return false;
        const mesh = map.get(key);
        if (!mesh) return false;
        if (this.state.scene) this.state.scene.remove(mesh);
        if (mesh.geometry) mesh.geometry.dispose();
        if (mesh.material && typeof mesh.material.dispose === "function") mesh.material.dispose();
        map.delete(key);
        return true;
    }

    _canopyDisposeAllChunks() {
        if (!this.state.canopyChunks) return;
        for (const key of Array.from(this.state.canopyChunks.keys())) {
            this._canopyDisposeChunkByKey(key);
        }
    }

    // V18.222 — der Streaming-Tick. Walkt das 3×3-Fenster um den Spieler,
    // baut fehlende, disponiert ferne. Bounded: höchstens 1 Build pro Frame
    // (Plan-konform „max 1 Region/Frame" wie der Voxel-Tick).
    _tickCanopyStreaming() {
        const atmo = this.state.atmosphere;
        if (!atmo || atmo.canopyStreaming !== true) return 0;
        const pm = this.state.playerMesh && this.state.playerMesh.position;
        if (!pm) return 0;
        const C = this._canopyChunkConfig();
        const playerRegX = Math.floor(pm.x / C.regionM);
        const playerRegZ = Math.floor(pm.z / C.regionM);
        const map = this._ensureCanopyChunkMap();
        let built = 0;
        // 3×3 (oder N×N) Ring um den Spieler: fehlende bauen.
        for (let dx = -C.ringRadius; dx <= C.ringRadius && built < 1; dx++) {
            for (let dz = -C.ringRadius; dz <= C.ringRadius && built < 1; dz++) {
                const key = this._canopyChunkKey(playerRegX + dx, playerRegZ + dz);
                if (!map.has(key)) {
                    this._canopyEnsureChunk(playerRegX + dx, playerRegZ + dz);
                    built++;
                }
            }
        }
        // Ferne Chunks disposen (außerhalb disposeRadius)
        let disposed = 0;
        const disposeR = C.disposeRadius;
        for (const key of Array.from(map.keys())) {
            const mesh = map.get(key);
            if (!mesh || !mesh.userData) continue;
            const dx = mesh.userData.regX - playerRegX;
            const dz = mesh.userData.regZ - playerRegZ;
            if (Math.abs(dx) > disposeR || Math.abs(dz) > disposeR) {
                this._canopyDisposeChunkByKey(key);
                disposed++;
            }
        }
        return built + disposed;
    }

    // Geteiltes Gras-Material für InstancedMesh (tausende Halme, EIN Draw-Call). Der Wind liest die
    // WELT-Position aus der instanceMatrix → Nachbarhalme wiegen phasenversetzt (Wind-Wellen);
    // Geometrie auf der Wurzel zentriert → die Wurzel bleibt fix, die Spitze wiegt.
    _grassInstanceMat() {
        if (typeof THREE === "undefined") return null;
        if (this.state._grassMat) return this.state._grassMat;
        const TSL = THREE.TSL;
        // Natives MeshStandardNodeMaterial (rau, nicht-metallisch): die WebGPU-Lighting-Pipeline rechnet Licht +
        // Schatten selbst und liest den EINEN Himmel (scene.environment) diffus — r184-Lambert las ihn nie, der
        // Halm im Schatten trug nur sein Gegenlicht-Leuchten. Wind-Displacement als TSL-positionNode.
        const { uniform, vec3, float, max, positionLocal, positionWorld } = TSL;
        const wu = this._windUniformsEnsure();
        // Die Höhen-Referenz des Farb-Gradients ist ein UNIFORM (GRASS_BLADE_H; die
        // Studio-Halm-Geometrie, die eine eigene Höhe mitbrachte, fiel mit dem Halm-Mesh).
        if (!wu.uBladeH) wu.uBladeH = uniform(AnazhRealm.GRASS_BLADE_H);
        // UNIFORM-HEIMAT: der geteilte Wind-Satz reist als EIN renderGroup-Buffer.
        this._uniformHeimatTeilen(wu);
        const mat = new THREE.MeshStandardNodeMaterial({
            color: 0x5fa743,
            side: THREE.DoubleSide,
            roughness: 1,
            metalness: 0,
        });

        // Wind-positionNode aus der EINEN Quelle `_windSwayOffset`; das Gras liest volle Amplitude
        // (ampX 1.5, kein windScale). Die Höhengewichtung steckt in der Geometrie
        // (geo.translate(0, 0.425, 0) zentriert auf die Wurzel). KEIN onBeforeCompile.
        const sway = this._windSwayOffset(TSL, { ampX: 1.5 });
        mat.positionNode = positionLocal.add(sway);

        // Gras-Albedo-Variation (render-only): (a) Spitzen-Gradient (Wurzel dunkler/kühler → Spitze
        // heller) + (b) per-Clump-Noise über die Welt-Position (~1,6 m Wellenlänge). `colorNode` ist auf
        // lit NodeMaterial die DIFFUSE Albedo — Licht, Wind, Tag-Nacht bleiben aktiv. Kein
        // attribute()-Lookup (sonst Schwärze-Klasse), kein Geometrie-Eingriff. try/catch → flach-grün.
        {
            {
                const hfN = TSL.clamp(positionLocal.y.div(wu.uBladeH), float(0.0), float(1.0));
                // Die Wurzel liest das geteilte MEADOW_GREEN (= der Wiesen-Boden-Tint) → der Halm wächst ohne
                // Farb-Bruch aus dem Boden; die Spitze bleibt sattes Grün, nicht gelb.
                const _mg = AnazhRealm.MEADOW_GREEN;
                const baseCol = vec3(_mg[0], _mg[1], _mg[2]);
                // Spitze = der Sommer-Grasakzent des Studios (GRAS_SPITZE, dieselbe Spitze wie die Boden-Wiese).
                const _sp = AnazhRealm.GRAS_SPITZE;
                const tipCol = vec3(_sp[0], _sp[1], _sp[2]);
                let albedo = TSL.mix(baseCol, tipCol, hfN);
                const bn = TSL.mx_noise_float(positionWorld.mul(float(0.8)));
                albedo = albedo.mul(float(1.0).add(bn.mul(float(0.18))));
                albedo = albedo.add(vec3(0.1, 0.05, -0.05).mul(max(bn, float(0.0))));
                // Boden-Bezug: die Streu setzt `instanceColor` je Halm aus lebendig+feuchte (Multiplikator ~1).
                // Three.js multipliziert colorNode selbst mit `instanceColor` (setupDiffuseColor) — nie zusätzlich
                // `attribute("instanceColor")` lesen (Doppel-Multiply; die geteilte Geometrie trägt es nicht).
                // Gegenlicht-Translucency: wrap = pow(max(dot(viewDir, -sunDir), 0), k) → Halme leuchten nur im
                // Gegenlicht golden-grün, höhen-gewichtet, rein additiv.
                {
                    const viewDir = TSL.normalize(positionWorld.sub(TSL.cameraPosition));
                    const sunBack = TSL.normalize(wu.uSunDir).mul(float(-1.0));
                    const wrap = TSL.pow(max(TSL.dot(viewDir, sunBack), float(0.0)), float(3.0));
                    const glow = vec3(0.45, 0.5, 0.2).mul(wrap).mul(hfN).mul(float(0.9));
                    albedo = albedo.add(glow);
                }
                // Rispen-Spitzen (aSeed=1) tragen den strohigen Samenkopf-Ton (seedTan 0xc8b27a, sRGB→linear).
                // aSeed lebt auf der GETEILTEN Tuff-Geometrie (Halm 0, Granne 1) → das Attribut ist immer da.
                {
                    const aSeed = TSL.attribute("aSeed", "float");
                    albedo = TSL.mix(albedo, vec3(0.46, 0.38, 0.18), aSeed);
                }
                // Die Wiese folgt der Saison: Albedo × die EINE Saison-Tönung `uSeasonMul` (aus seasonPhase in
                // `_tickSeason`); Licht/Wind/Translucency bleiben aktiv.
                albedo = albedo.mul(this._ensureSeasonUniforms().uSeasonMul);
                mat.colorNode = TSL.vec4(albedo, float(1.0));
            }
        }

        // Das Gras dockt ans Frequenzband: dieselben Band-Uniforms über den EINEN Empfänger (kein
        // Material-Merge) → Füll-Licht + Aerial-Haze. Albedo = mittlere Wiesen-Farbe als Konstante (reicht
        // fürs 0.06-Füll-Licht; kein attribute()-Lookup).
        {
            this._ensureAtmoUniforms();
            const _SRg = AnazhRealm.SUBSTANCE_RESPONSE;
            this._applySubstanceResponse(mat, _SRg.defaults.gras, {
                // V18.386 — PHYTO-KLEID: die mittlere Wiesen-Farbe fürs Band-Füll-Licht folgt dem
                // Vorlagen-Gras (Mittel aus Wurzel-Boden-Ton und Sommer-Akzent-Spitze, sRGB→linear).
                albedoNode: TSL.vec3(0.108, 0.225, 0.031),
            });
        }

        // OBSERVER-DIÄT (Pflicht-Paar mit der Uniform-Heimat oben): der Gras-
        // Graph hängt nur an geteilten Wind-Uniforms + Attributen — equals()-Bahn.
        this._materialObserverDiaet(mat);
        this._leuchtStoff(mat, null); // das Leuchtquellen-Gesetz (K11): der Halm am Feuer trägt sein Licht
        this.state._grassMat = mat;
        return mat;
    }

    // DIE KANONISCHE WIND-SWAY-GRÖSSE — jeder Wind-Leser LIEST sie;
    // Charakter als Parameter: `ampX` (Gras 1.5), `windScale` (Wipfel-Dämpfen, fehlt → 1).
    // phase = uWindTime·1.7 + dot(worldXZ, uWindDir)·0.35; hf = max(positionLocal.y, 0);
    // gust = sin(uWindTime·omega − dot(worldXZ, uWindDir)·k)·amp + mitte — die wandernde Böe, Zahlen aus WIND_BOE (das Ohr
    // liest dieselben, `_windBoeAt`).
    // uBend-Sphären biegen Halme radial weg (min(hf,1)). Render-rein; gibt den vec3-Versatz zurück.
    _windSwayOffset(TSL, opts = {}) {
        const wu = this._windUniformsEnsure();
        this._ensureWindCoupling(TSL);
        const { vec3, float, sin, cos, max } = TSL;
        const naht = this._weltNaht(TSL);
        const positionWorld = naht.lage;
        const ampX = typeof opts.ampX === "number" ? opts.ampX : 1.5;
        const wd = wu.uWindDir || null;
        const dotWW = wd ? positionWorld.x.mul(wd.x).add(positionWorld.z.mul(wd.y)) : null;
        const phase = wu.uWindTime
            .mul(float(1.7))
            .add(
                dotWW ? dotWW.mul(float(0.35)) : positionWorld.x.mul(float(0.28)).add(positionWorld.z.mul(float(0.21)))
            );
        // Höhen-Gewicht = Höhe über der Wurzel. r184 setzt den positionNode VOR die Instanzierung: Phase, Böe und Biegung
        // lesen die Welt-Lage des Vertex aus der EINEN Naht (`_weltNaht`), der Versatz (Welt-Meter, Welt-Richtung) geht
        // über sie in die Vorlage zurück (K20-N1; bis dahin sah jeder Halm die Vorlage — die Wiese wiegte im Gleichtakt,
        // jede Instanz in ihrer eigenen Drehung, die Biegung des Spielers maß gegen die Vorlage). Ein Satz (Welt-Lage,
        // keine Instanz — die Nah-Streu) liest dieselbe Naht (die Einheit). Die Geometrie-Position (`positionGeometry`,
        // Wurzel bei y = 0) trägt die Halm-Höhe; `opts.hoehe` reicht eine eigene Höhe in Metern.
        const hf = max(opts.hoehe || TSL.positionGeometry.y, float(0.0));
        // Die Böe liest WIND_BOE — dieselben Zahlen hört das Ohr (`_windBoeAt`).
        const B = AnazhRealm.WIND_BOE;
        const gust = sin(
            wu.uWindTime
                .mul(float(B.omega))
                .sub(
                    dotWW
                        ? dotWW.mul(float(B.k))
                        : positionWorld.x.mul(float(0.03)).add(positionWorld.z.mul(float(0.024)))
                )
        )
            .mul(float(B.amp))
            .add(float(B.mitte));
        let windEff = wu.uWindStrength.mul(gust);
        if (typeof opts.windScale === "number") windEff = windEff.mul(float(opts.windScale));
        let offX = sin(phase).mul(windEff).mul(hf).mul(float(ampX));
        let offZ = cos(phase.mul(float(0.7)))
            .mul(windEff)
            .mul(hf);
        // uBend: vec4 xyz+Radius (Radius 0 = Slot aus); Halme biegen radial weg, quadratisch auslaufend.
        // NaN-Wand: dist trägt +1e-4 unter der Wurzel; tote Slots liegen bei y=−1e6 mit Radius 0 →
        // max(w, 0.05) hält den Nenner endlich, der Falloff wird exakt 0.
        const uB = wu.uBend;
        const sqrtN = TSL.sqrt;
        const minN = TSL.min;
        if (uB && uB.length && sqrtN && minN) {
            let bendX = float(0.0);
            let bendZ = float(0.0);
            for (let i = 0; i < uB.length; i++) {
                const b = uB[i];
                const dx = positionWorld.x.sub(b.x);
                const dy = positionWorld.y.sub(b.y);
                const dz = positionWorld.z.sub(b.z);
                const dist = sqrtN(dx.mul(dx).add(dy.mul(dy)).add(dz.mul(dz)).add(float(1e-4)));
                const fall = max(float(0.0), float(1.0).sub(dist.div(max(b.w, float(0.05)))));
                const soft = fall.mul(fall);
                bendX = bendX.add(dx.div(dist).mul(soft));
                bendZ = bendZ.add(dz.div(dist).mul(soft));
            }
            const hfB = minN(hf, float(1.0)); // Interaktion wirkt bodennah (Halm/Busch), nicht am Wipfel
            offX = offX.add(bendX.mul(hfB).mul(float(0.4)));
            offZ = offZ.add(bendZ.mul(hfB).mul(float(0.4)));
        }
        return naht.vorlage(vec3(offX, float(0.0), offZ));
    }

    // CPU-Seite der EINEN Wind-Richtung: θ(t) = θ0(seed) + 0.5·sin(t·0.009 + φ1) + 0.22·sin(t·0.0257
    // + φ2) (±~41° Mäander um die Seed-Grundrichtung). Seed per FNV-1a über worldSeed+"-wind-dir"
    // (eigener Stream, Γ5). Reine Funktion (seed, t) → Peers/Replays sehen denselben Wind.
    // Liefert {x, z} (Einheitsvektor in XZ).
    _windDirAt(tSec) {
        const seedStr = ((this.state.worldMeta && this.state.worldMeta.seed) || "anazh-realm-seed") + "-wind-dir";
        let h = 2166136261 >>> 0;
        for (let i = 0; i < seedStr.length; i++) h = ((h ^ seedStr.charCodeAt(i)) * 16777619) >>> 0;
        const base = (h / 4294967296) * Math.PI * 2;
        const p1 = (((h >>> 5) & 1023) / 1023) * Math.PI * 2;
        const p2 = (((h >>> 15) & 1023) / 1023) * Math.PI * 2;
        const t = Number.isFinite(tSec) ? tSec : 0;
        const theta = base + 0.5 * Math.sin(t * 0.009 + p1) + 0.22 * Math.sin(t * 0.0257 + p2);
        return { x: Math.sin(theta), z: Math.cos(theta) };
    }

    // Geteilte Kopplungs-Uniforms auf dem EINEN windUniforms-Slot: `uWindDir` (vec2; Leser: Gras/Streu
    // via `_windSwayOffset`, Baum-Laub `_applyVegetationResponse`, Impostor) und `uBend`
    // (GRAS_BEND_SLOTS × vec4). Idempotent; ohne TSL.uniform (Skalar-Mock in gate:kopplung) bleibt ein
    // gesetztes wu stehen. `_loopRender` speist beide pro Frame (`_windDirAt`, `_tickGrasBend`).
    _ensureWindCoupling(TSL) {
        const wu = this._windUniformsEnsure();
        if (!wu.uWindDir) {
            const d0 = this._windDirAt(0);
            wu.uWindDir = TSL.uniform(new THREE.Vector2(d0.x, d0.z));
        }
        if (!wu.uBend) {
            wu.uBend = [];
            for (let i = 0; i < AnazhRealm.GRAS_BEND_SLOTS; i++) {
                wu.uBend.push(TSL.uniform(new THREE.Vector4(0, -1e6, 0, 0)));
            }
        }
        // UNIFORM-HEIMAT: auch die späten Kopplungs-Uniforms (uWindDir/uBend)
        // reisen geteilt — der Satz bleibt EIN renderGroup-Buffer (idempotent).
        this._uniformHeimatTeilen(wu);
        return wu;
    }

    // Füllt die uBend-Slots pro Frame: Spieler · gerittenes Gefährt · die ≤4 nächsten Kreaturen in
    // GRAS_BEND_CREATURE_DIST. Render-rein; O(Kreaturen) ohne Alloc (persistente Arrays,
    // Insertion-Auswahl statt Sort).
    _tickGrasBend() {
        const wu = this.state.windUniforms;
        if (!wu || !wu.uBend) return;
        const B = wu.uBend;
        let slot = 0;
        const pm = this.state.playerMesh;
        if (pm && slot < B.length) B[slot++].value.set(pm.position.x, pm.position.y - 0.4, pm.position.z, 1.3);
        const me = this._mountedEntry;
        if (me && me.position && slot < B.length) {
            B[slot++].value.set(
                me.position.x,
                me.position.y,
                me.position.z,
                Math.max(1.6, (me._rideHalfLen || 1) + 0.6)
            );
        }
        // jeder Leib im Bild biegt das Gras: die Wesen und die Gefallenen (ein Leichnam liegt im Gras, nie das Gras in ihm)
        const crs = this.state.creatures;
        const LG = this.state.leichname;
        const nLeib = crs.length + LG.length;
        if (nLeib && pm) {
            const selD = this._bendSelD || (this._bendSelD = [Infinity, Infinity, Infinity, Infinity]);
            const selI = this._bendSelI || (this._bendSelI = [-1, -1, -1, -1]);
            selD[0] = selD[1] = selD[2] = selD[3] = Infinity;
            selI[0] = selI[1] = selI[2] = selI[3] = -1;
            for (let i = 0; i < nLeib; i++) {
                const c = i < crs.length ? crs[i] : LG[i - crs.length];
                if (!c || !c.position) continue;
                const dx = c.position.x - pm.position.x;
                const dz = c.position.z - pm.position.z;
                const d2 = dx * dx + dz * dz;
                if (d2 > AnazhRealm.GRAS_BEND_CREATURE_DIST_SQ) continue;
                for (let k = 0; k < 4; k++) {
                    if (d2 < selD[k]) {
                        for (let m = 3; m > k; m--) {
                            selD[m] = selD[m - 1];
                            selI[m] = selI[m - 1];
                        }
                        selD[k] = d2;
                        selI[k] = i;
                        break;
                    }
                }
            }
            for (let k = 0; k < 4 && slot < B.length; k++) {
                if (selI[k] < 0) break;
                const c = selI[k] < crs.length ? crs[selI[k]] : LG[selI[k] - crs.length];
                const r = 0.8 + 0.5 * ((c.scale && c.scale.x) || 1);
                B[slot++].value.set(c.position.x, c.position.y - 0.4, c.position.z, r);
            }
        }
        while (slot < B.length) B[slot++].value.set(0, -1e6, 0, 0);
    }

    // Schmal-Wrapper auf _applyDayNightToScene: Skybox-Tint = Tag-Nacht-Tint × Wetter-Tint, pro Frame
    // aus state.timeOfDay + state.weather. Wetterwechsel laufen über requestWeatherTransition
    // (Cross-Fade).
    updateSkyboxWeather() {
        if (typeof this._applyDayNightToScene === "function") {
            this._applyDayNightToScene();
        }
    }

    // ═══ DIE SKY-ENV-MAP ═══
    // Ohne `scene.environment` rendern PBR-Metalle SCHWARZ (sie holen ihre Farbe aus der Reflexion). DIE UMGEBUNG IST DER
    // HIMMEL DER EINEN ATMOSPHÄRE (D3): der Wandel-Pass legt die Himmels-Sicht (Azimut absolut, mit Boden) als Equirekt
    // 128×64 ab, PMREM filtert sie — azimut-abhängig (zur Sonne heller als von ihr weg), in derselben E0 wie das Richtlicht.
    // Bis D3 malte die CPU einen azimut-konstanten Verlauf aus Tint-Farben (128×64 sRGB): Licht-Verhältnis 4,2 statt 5,1.
    // Grober Takt: neu nur, wenn die Sonne sich um mehr als ein halbes Grad drehte, Tönung oder E0 sich änderten, höchstens
    // je `SKY_ENV_REGEN_MIN_MS` (der Sprung der Uhr geht an der Drossel vorbei); die Bestrahlung liest die CPU zurück
    // (`_himmelUmgebungLesen` → `_himmelsIrradianz`).
    _ensureSkyEnvironment(force, sprung) {
        const st = this.state;
        if (typeof THREE === "undefined" || !st.scene || !st.renderer) return false;
        if (!st.rendererReady) return false; // das Env-Sampling braucht den initialisierten Renderer
        const A = this._atmoLutBau();
        const U = A.U;
        const t = U.toenung.value;
        const neu = {
            sx: U.sonne.value.x,
            sy: U.sonne.value.y,
            sz: U.sonne.value.z,
            my: U.mond.value.y,
            t: t.x + t.y + t.z,
            e: U.licht.value,
            m: A.mediumBeta,
            h: U.hKm.value,
        };
        const last = st._skyEnvLast;
        const nowMs = typeof performance !== "undefined" && performance.now ? performance.now() : Date.now();
        const gleich =
            !!last &&
            last.sx * neu.sx + last.sy * neu.sy + last.sz * neu.sz > Math.cos((0.5 * Math.PI) / 180) &&
            Math.abs(last.my - neu.my) < 0.01 &&
            Math.abs(last.t - neu.t) < 0.02 * Math.max(1, neu.t) &&
            Math.abs(last.e - neu.e) < 0.02 * Math.max(1e-3, neu.e) &&
            last.m === neu.m &&
            Math.abs(last.h - neu.h) < 0.05;
        if (
            !force &&
            last &&
            (gleich || (!sprung && nowMs - (st._skyEnvLastRegenMs || -Infinity) < AnazhRealm.SKY_ENV_REGEN_MIN_MS))
        )
            return true;
        try {
            // Null-Renderer (headless): kein Pass, kein PMREM — die Equirekt-Tafel ist die Umgebung (ungezeichnet).
            if (st.renderer._isHeadlessNull) {
                st.scene.environment = A.rtEq.texture;
                st._skyEnvLast = neu;
                st._skyEnvLastRegenMs = nowMs;
                return true;
            }
            if (!A.tafelnFrisch) return false; // die Himmels-Sicht steht noch nicht (der erste Takt der Atmosphäre)
            this._atmoZeichne(A.qEq, A.rtEq);
            // PMREM per `fromEquirectangular` (WebGPU-tauglich, anders als `fromScene`) in das BESTEHENDE Target (zweites
            // Argument): stabile Texture-Identität, scene.environment nur beim Erst-Aufruf gesetzt (kein Recompile-Kaskade).
            if (!st._skyPmrem) st._skyPmrem = new THREE.PMREMGenerator(st.renderer);
            const rt = st._skyPmrem.fromEquirectangular(A.rtEq.texture, st._skyEnvRT || null);
            st._skyEnvRT = rt;
            if (st.scene.environment !== rt.texture) st.scene.environment = rt.texture;
            st._skyEnvLast = neu;
            st._skyEnvLastRegenMs = nowMs;
            this._himmelUmgebungLesen();
            return true;
        } catch (err) {
            this.log(
                `Ω-OPSIS §7 Sky-Env-Map fehlgeschlagen (${err && err.message}) — environment bleibt null`,
                "ERROR"
            );
            st._skyEnvFailed = true;
            return false;
        }
    }

    // DIE UMGEBUNG ZURÜCK AUF DIE CPU (je Neuzeichnung, asynchron): die Equirekt-Tafel als lineare Leuchtdichte je Texel
    // (`_skyEnvData`, Float32 rgba, Zeile 0 = Nadir wie three sie sampelt) — der Leser `_himmelsIrradianz` (Belichtung,
    // Feld-Pass, Wasser). Eine spätere Lesung überholt eine frühere (wer auf die frühere wartet, wartet auf sie). DIE LESUNG DIESER MALUNG ist ein Versprechen
    // (`state._skyEnvLesung`, true sobald sie liegt): wer nach einem Sprung der Uhr die Bestrahlung der neuen Stunde braucht,
    // wartet auf sie — die CPU sieht den Himmel EINE Lesung nach der Malung, nie davor. Ein echter Renderer ohne Rücklesung
    // bricht laut (bis zur Nachbesserung kehrte die Lesung still zurück, und jeder Leser sah keinen Himmel).
    _himmelUmgebungLesen() {
        const st = this.state;
        const A = st.atmoLut;
        const r = st.renderer;
        if (typeof r.readRenderTargetPixelsAsync !== "function")
            throw new Error(
                "Die Umgebung: der Renderer liest kein Ziel zurück (readRenderTargetPixelsAsync fehlt, Vendor)"
            );
        const W = A.rtEq.width,
            H = A.rtEq.height;
        const nr = (st._skyEnvLeseNr = (st._skyEnvLeseNr || 0) + 1);
        st._skyEnvLesung = r.readRenderTargetPixelsAsync(A.rtEq, 0, 0, W, H).then(
            (px) => {
                if (nr !== st._skyEnvLeseNr) return st._skyEnvLesung; // überholt: das Versprechen der neueren Lesung
                const d = st._skyEnvData || (st._skyEnvData = new Float32Array(W * H * 4));
                const schritt = Math.floor(px.length / H); // die Zeilen liegen ausgerichtet (bytesPerRow)
                const halb = px instanceof Uint16Array;
                for (let y = 0; y < H; y++)
                    for (let x = 0; x < W * 4; x++) {
                        const v = px[y * schritt + x];
                        d[y * W * 4 + x] = halb ? AnazhRealm._halbZuFloat(v) : v;
                    }
                st._skyEnvVersion = (st._skyEnvVersion || 0) + 1;
                return true;
            },
            (e) => {
                // nie still: die Bestrahlung trägt die vorige Lesung weiter, der Bruch steht beim EINEN Melder (D3-N2)
                this._bruchMelden(
                    `STOFF: die Umgebung kam nicht zurück — die Bestrahlung trägt die vorige Lesung (${e && e.message})`
                );
                return false;
            }
        );
        return st._skyEnvLesung;
    }

    // DER HIMMEL DER STUNDE AUF DER CPU (ein Versprechen): die Umgebung frisch aus den Quellen, die jetzt gelten, und ihre
    // Lesung abgewartet — true, sobald `_himmelsIrradianz` sie trägt. Der Null-Renderer malt keinen Himmel (die Tafeln leben
    // auf der GPU, Lehre 16): dort false, und wer den Himmel messen will, misst mit dem echten Renderer.
    _himmelFrisch() {
        const st = this.state;
        if (!st.renderer || st.renderer._isHeadlessNull) return Promise.resolve(false);
        if (!this._ensureSkyEnvironment(true) || !st._skyEnvLesung) return Promise.resolve(false);
        return st._skyEnvLesung;
    }

    // Halb-Float (IEEE 754 binary16) → Zahl.
    static _halbZuFloat(h) {
        const s = h & 0x8000 ? -1 : 1;
        const e = (h & 0x7c00) >> 10;
        const f = h & 0x03ff;
        if (e === 0) return s * Math.pow(2, -14) * (f / 1024);
        if (e === 31) return f ? NaN : s * Infinity;
        return s * Math.pow(2, e - 15) * (1 + f / 1024);
    }

    // DIE HIMMELS-UMGEBUNG als Textur: die Equirekt-Tafel der EINEN Atmosphäre (128×64, linear, Halb-Float) — EIN Objekt,
    // gezeichnet von `_ensureSkyEnvironment`, gelesen von PMREM (die IBL jedes PBR-Stoffs) UND vom Wasser (der Spiegel des
    // Himmels, roh — es ist glatt). Dasselbe Ziel bleibt über jede Neuzeichnung → kein Texture-Identitäts-Wechsel.
    _himmelUmgebungTex() {
        return this._atmoLutBau().rtEq.texture;
    }
}
