class AnazhRealm_dirigent_regler {
    // ===== ATLAS · Dirigent/regler — Perf-Sinn · der EINE Regler · Holz-Profile · Geräte-Profil · Flug-Schreiber =====
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
    // DER TAKT DES LESERS (K2 Belegung): der Wert gilt PERF_GPU_TS_STALE_MS als frisch — ein Auflösen je Bild schickte je Bild
    // einen Auftrag mehr an die Queue und eine mapAsync-Rückkehr samt Fortsetzung über den Haupt-Faden; es löst höchstens alle
    // PERF_GPU_TS_TAKT_MS (r184 gibt die Summe des LETZTEN Bilds zurück). r184 hält jeden Pass-Stempel für immer (`timestamps`,
    // ein Schlüssel je Pass und Bild: 25 851 Einträge nach 6 729 Bildern, Radeon) — der Regler liest nur die Summe, nach
    // jedem Auflösen fällt die Karte.
    _perfGpuResolveKick() {
        const st = this.state;
        const r = st.renderer;
        if (!r || r._isHeadlessNull || !st.rendererReady || st._deviceLost) return;
        if (this._gpuTsPending) return;
        if (!r.backend || r.backend.trackTimestamp !== true) return;
        if (typeof r.resolveTimestampsAsync !== "function") return;
        const jetzt = performance.now();
        if (jetzt - (this._gpuTsKickMs || -Infinity) < AnazhRealm.PERF_GPU_TS_TAKT_MS) return;
        this._gpuTsKickMs = jetzt;
        this._gpuTsPending = true;
        try {
            r.resolveTimestampsAsync("render").then(
                (v) => {
                    this._gpuTsPending = false;
                    const pool = r.backend.timestampQueryPool && r.backend.timestampQueryPool.render;
                    if (pool && pool.timestamps) pool.timestamps.clear();
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

    // DER RAND AM SCHIRM (lod.K5, Pixelgröße × Haushalt): `laub` die Reichweite der Vegetation (PERF_FOLIAGE_RADIUS_MAX), `bau`
    // die Mesh-Zone der Bauten (ARCH_QUALITY_RADIUS_MAX) — der Haushalt, ganz: sein Pixel-Term bindet an keinem Schirm (ein Körper
    // von 1 m trägt am Rand des Laubs bei 1080 Zeilen 2,9 px, bei 600 noch 1,6 px), ein gestauchter Rand nähme Sichtbares. Kein
    // Regler, keine Bildrate, kein Schirm legt die Existenz um (Lehre 13).
    _randSchirm(art) {
        return art === "laub" ? AnazhRealm.PERF_FOLIAGE_RADIUS_MAX : AnazhRealm.ARCH_QUALITY_RADIUS_MAX;
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
        // Unter dem Ladeschirm zeigt kein Frame die Welt (`_ladeTakt`): kein Frame reißt ein Budget; im Nachlauf des ersten
        // Bilds (`_nachlaufTakt`, B3d) baut die Welt hinter dem Spieler wie unter ihm.
        st._frameOverBudget =
            !this._ladeTakt() &&
            st._nachlauf == null &&
            sense.frameMs > (Number.isFinite(st.perfTargetMs) ? st.perfTargetMs : AnazhRealm.PERF_TARGET_MS);
        // DER RAND AM SCHIRM (lod.K5): Laub- und Architektur-Radius sind Wechsel-Abstände — die Karte des Walds an das Fern-Feld,
        // die Mesh-Zone der Bauten an ihre Fernform — und folgen dem Schirm und dem Haushalt (`_randSchirm`), nie der Bildrate:
        // bis w3v-lod lagen sie bei lerp(MIN, MAX, effArch), der Wald-Rand wanderte unter Last zwischen 70 und 240 m (Pop und
        // Regler zugleich). Der PID regelt die Qualität — Dichte, Bau-Durchsatz, Schatten, Strahlen —, nie den Rand.
        const archZiel = this._randSchirm("bau");
        st.architectureBuildBudgetPerFrame = Math.round(
            lerp(AnazhRealm.ARCH_QUALITY_BUDGET_MIN, AnazhRealm.ARCH_QUALITY_BUDGET_MAX, effArch)
        );
        // Headless (Null-Renderer): der Rand sofort am Schirm, die Dichte voll.
        if (st.renderer && st.renderer._isHeadlessNull) {
            st.foliageRadius = this._randSchirm("laub");
            st.architectureCullingRadius = archZiel;
            st._foliageDensityScale = 1;
        } else {
            // Der Laub-Radius startet klein (PERF_FOLIAGE_RADIUS_MIN) und wächst Chunk für Chunk zum Rand am Schirm.
            let frTarget = this._randSchirm("laub");
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
            // Die Wand der Dichte: sie wächst nur nach PERF_FOLIAGE_GROW_RUHE_S Sim-Sekunden ohne Über-Budget (Sim-Zeit via
            // sense.frameMs, nie Wanduhr — gate:regler-sim bleibt deterministisch); auch echtes gpuMs über der Decke setzt die
            // Ruhe-Uhr zurück (nur Quelle "echt" — der Proxy lügt bei Stalls); sie schrumpft erst ab dem Totband.
            const _gpuVoll =
                sense.gpuQuelle === "echt" &&
                sense.phase &&
                Number.isFinite(sense.phase.gpuMs) &&
                sense.phase.gpuMs > (Number.isFinite(st.perfTargetMs) ? st.perfTargetMs : AnazhRealm.PERF_TARGET_MS);
            if (st._frameOverBudget || _gpuVoll) this._folRuheSec = 0;
            else this._folRuheSec = (this._folRuheSec || 0) + Math.min(0.3, (sense.frameMs || 17) / 1000);
            const _frRuhig = (this._folRuheSec || 0) >= AnazhRealm.PERF_FOLIAGE_GROW_RUHE_S;
            // DIE WAND der Laub-Dichte (die Ränder folgen dem Schirm, sie atmen nicht mehr): wo der Regler mitten in seiner
            // Spanne steht, pendelte sie je Takt um ihr Ziel (+Schritt, −2 Schritte; OMEN, V18.538, Regler frei: Wechsel in 0,52
            // der Frames). Jeder Wechsel weckte über den Stand-Stempel jeden Fege-Takt zu einer vollen Runde über den Bestand
            // (Stufen-Wahl 299 Einheiten je Frame statt 34) und über `uLodPerf` die Lage jedes Passes (die Satz-Wahl und
            // die Höhlen-Sicht rechneten je Pass neu) — CPU-Takt p95 4,8 → 11,7 ms. Das Totband ist derselbe Anteil ihrer
            // Spanne wie SHRINK_TOTBAND über die Spanne des Laub-Radius.
            const wand = (cur, ziel, schritt, totband, darfWachsen) =>
                cur < ziel
                    ? _frRuhig && darfWachsen
                        ? Math.min(ziel, cur + schritt)
                        : cur
                    : ziel < cur - totband
                      ? Math.max(ziel, cur - schritt * 2)
                      : cur;
            const TOT = AnazhRealm.PERF_FOLIAGE_SHRINK_TOTBAND;
            // DER LAUB-RADIUS wächst Schritt für Schritt (PERF_FOLIAGE_GROW_STEP je Takt) zum Rand am Schirm, ohne Ruhe-Wand: sein
            // Ziel ändert sich nur mit dem Schirm und dem gebauten Ring, nie mit der Last — bei 30, 60 und 144 Bildern steht
            // er an derselben Kante. Unter dem Lade-Takt steht er sofort am Ziel (K60-3: das erste Weltbild an seiner ganzen
            // Reichweite, `_weltbildLuecken`); der Architektur-Radius steht immer am Rand.
            st.foliageRadius = this._ladeTakt() || frCur > frTarget ? frTarget : Math.min(frTarget, frCur + step);
            st.architectureCullingRadius = archZiel;
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
        // Die Reichweite liegt auf dem RASTER von 6 m ab der Decke, das Totband (¾ Stufe) hält gegen updateProjectionMatrix-
        // Churn — der Wert ist eine Funktion der Last, nie des Wegs (A9-n2: das Totband hielt den Wert des letzten Sprungs, unter
        // Regler voll stand die Karte je Rampe bei 167,8 oder 168,0 m statt 170, die Kaskaden-Scheiben mit ihr); headless → Ceiling.
        if (!(st.renderer && st.renderer._isHeadlessNull) && typeof this._applyEffectiveShadowRange === "function") {
            const srCeil =
                st.atmosphere && Number.isFinite(st.atmosphere.shadowRange)
                    ? st.atmosphere.shadowRange
                    : AnazhRealm.PERF_SHADOW_RANGE_MAX;
            const srTarget = lerp(AnazhRealm.PERF_SHADOW_RANGE_MIN, srCeil, effArch);
            const srApplied = Number.isFinite(this._shadowRangeApplied) ? this._shadowRangeApplied : srCeil;
            const srStufe = srCeil - 6 * Math.round((srCeil - srTarget) / 6);
            if (srStufe !== srApplied && Math.abs(srTarget - srApplied) > 4.5) this._applyEffectiveShadowRange(srStufe);
        }
        // Godray-Hebel unter dem EINEN Regler (`effArch`): die Licht-Schäfte sind reine Optik und geben
        // zuerst nach — Kopfraum → PERF_GODRAY_MAX, anhaltende Last → 0. `_loopRender` liest `_godrayScale`
        // × Sonnen-Sichtbarkeit. Headless → MAX.
        if (st.renderer && st.renderer._isHeadlessNull) {
            st._godrayScale = AnazhRealm.PERF_GODRAY_MAX;
        } else {
            st._godrayScale = lerp(0, AnazhRealm.PERF_GODRAY_MAX, effArch);
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
            device: this._flightRecorderDevice(),
            memSeries: [], // V18.294 — Leck-Detektor: Heap + Sammlungs-Größen über Zeit
            probeAt: -Infinity, // die letzte Leck-Probe (`_flightRecorderMemProbe`, im Leerlauf)
            probeOffen: false,
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
        // DAS BEDIENUNGS-OHR (spielgang.K3): die Event-Timing-API misst jede Interaktion des Spielers (Eingabe bis zum
        // nächsten gemalten Bild); je Interaktion (interactionId) zählt ihr längstes Ereignis, die INP liest
        // `_bedienungInp`. Fehlt der Entry-Typ, bleibt die INP ungemessen (null), nie 0.
        if (!this._inp && typeof PerfObs === "function") {
            try {
                const je = new Map();
                const obs = new PerfObs((l) => {
                    for (const e of l.getEntries())
                        if (e.interactionId)
                            je.set(e.interactionId, Math.max(je.get(e.interactionId) || 0, e.duration));
                    while (je.size > AnazhRealm.INP_FENSTER) je.delete(je.keys().next().value);
                });
                obs.observe({ type: "event", durationThreshold: 16, buffered: true });
                this._inp = { je, n0: 0 };
            } catch {
                this._inp = null;
            }
        }
        // DER AUSZUG NUR AUF ANFORDERUNG (stadt-takt): der Takt füllt Ring und Stocker-Liste, die Auswertung
        // (`_flightRecorderBuildTrace`: Heap-, Bündel- und Stoff-Zensus über die Szene) läuft, wenn der Spieler die Seite
        // verlässt oder versteckt, und im Download (`perf`) — nie im Spiel. Vorher baute der Takt sie alle 4 s: am Messort
        // stadt 7,7 ms je Takt ab p95 (Radeon echt).
        if (typeof window !== "undefined" && window.addEventListener) {
            const flush = (final) => {
                try {
                    this._flightRecorderSave(final);
                } catch {
                    /* der Flugschreiber darf nie stören */
                }
            };
            window.addEventListener("pagehide", () => flush(true));
            if (typeof document !== "undefined" && document.addEventListener) {
                document.addEventListener("visibilitychange", () => {
                    if (document.visibilityState === "hidden") flush(false);
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
            // DIE LECK-PROBE IM LEERLAUF (Lehre 14, stadt-takt): je FLIGHT_RECORDER_PROBE_MS eine Probe der Sammlungen
            // (`_flightRecorderMemProbe`) — sie läuft, wenn der Haupt-Faden ruht (`_imLeerlauf`, spätestens nach derselben
            // Frist), nie im Takt; die Speicher-Zeile des HUD und der Leck-Detektor lesen ihre Reihe.
            const jetzt = performance.now();
            if (!fr.probeOffen && jetzt - fr.probeAt > AnazhRealm.FLIGHT_RECORDER_PROBE_MS) {
                fr.probeAt = jetzt;
                fr.probeOffen = true;
                this._imLeerlauf(() => {
                    fr.probeOffen = false;
                    this._flightRecorderMemProbe();
                }, AnazhRealm.FLIGHT_RECORDER_PROBE_MS);
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
        // die gedrückten Verben der Tafel (die Achsen, die nicht ruhen, und jede gehaltene Aktion)
        const T = st.verbTafel;
        const activeKeys = ["vor", "quer", "gas", "bremse", "lenken"]
            .filter((k) => T[k] !== 0)
            .concat(Object.keys(T.gehalten).filter((k) => T.gehalten[k] === true))
            .slice(0, 8);
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

    // DIE INP (spielgang.K3) aus dem Bedienungs-Ohr: von n Interaktionen seit `n0` (performance.interactionCount; unter
    // 16 ms meldet der Browser keine) die längste nach Abzug je einer je 50 — der p98 der Web-Vitals. null ohne Ohr.
    _bedienungInp() {
        const I = this._inp;
        if (!I) return null;
        const d = [...I.je.values()].sort((a, b) => b - a);
        const n = Math.max(d.length, (performance.interactionCount || 0) - I.n0);
        return { n, inpMs: +(d[Math.floor(n / 50)] || 16).toFixed(1), maxMs: +(d[0] || 16).toFixed(1) };
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
                // spielgang.K3 — die Antwort der Bedienung (INP p98, das Bedienungs-Ohr)
                bedienung: this._bedienungInp(),
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
                if (a && a.isInterleavedBufferAttribute) a = a.data; // ein verschränkter Puffer zählt einmal, nie je Sicht
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
    // Eine Probe in die Reihe des Leck-Detektors (Heap + Sammlungs-Größen, ~160 s rollend: 40 Proben je
    // FLIGHT_RECORDER_PROBE_MS); false, wenn sie misslingt.
    _flightRecorderMemProbe() {
        const fr = this.state.flightRecorder;
        if (!fr) return false;
        try {
            fr.memSeries.push(this._flightRecorderSampleSizes());
            if (fr.memSeries.length > 40) fr.memSeries.shift();
        } catch {
            return false;
        }
        return true;
    }

    _flightRecorderMemoryReport() {
        const fr = this.state.flightRecorder;
        if (!fr || !this._flightRecorderMemProbe()) return null;
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

    // Sichern (Seite verlassen oder versteckt): als anazhRealmPerf.json POSTen NUR auf dem lokalen save-server (sonst
    // stiller Skip), headless nie. Fire-and-forget; `final` (pagehide) lässt den Request die Seite überleben.
    _flightRecorderSave(final) {
        try {
            const trace = this._flightRecorderBuildTrace();
            if (!trace) return;
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
}
_stammZonen(AnazhRealm, [AnazhRealm_dirigent_regler]);

// ===== ATLAS · Dirigent/regler — Außen-Konstanten =====
// DER HAUSHALT DER RÄNDER (`_randSchirm`): die Mesh-Zone der Bauten (ARCH_QUALITY_RADIUS_MAX) und die Reichweite der Vegetation
// (PERF_FOLIAGE_RADIUS_MAX), an jedem Schirm ganz. Das Build-Budget je Frame pendelt mit dem Regler zwischen MIN und MAX.
AnazhRealm.ARCH_QUALITY_RADIUS_MAX = 150;
AnazhRealm.ARCH_QUALITY_BUDGET_MAX = 6;
AnazhRealm.ARCH_QUALITY_BUDGET_MIN = 1;
AnazhRealm.INP_FENSTER = 2000; // so viele Interaktionen hält das Bedienungs-Ohr (spielgang.K3), die älteste weicht
// Kapazitäts-gewachsene Welt: die Vegetation eines Chunks füllt nur innerhalb `foliageRadius` — der startet klein (kein
// Spawn-Freeze) und wächst mit dem gebauten Ring zum Rand am Schirm (`_randSchirm`), nie mit der Last. RMIN > max. Test-Spawn
// (~65 m).
AnazhRealm.PERF_FOLIAGE_RADIUS_MIN = 70; // Spawn: nur die nächste Vegetation
AnazhRealm.PERF_FOLIAGE_RADIUS_MAX = 240; // die volle Vegetations-Reichweite, der Rand des Laubs
AnazhRealm.PERF_FOLIAGE_GROW_STEP = 2.5; // m pro Aktuator-Tick — sanftes Nach-außen-Wachsen
AnazhRealm.PERF_FOLIAGE_DENSITY_GROW_STEP = 0.012; // pro Aktuator-Tick — sanftes Nach-Verdichten
// Die Wand der Laub-Dichte gegen den Grenzzyklus: Wachsen erst nach so vielen SIM-Sekunden ohne Über-Budget-Frame (kein Jagen
// kurzlebigen Kopfraums); Schrumpfen erst ab diesem Anteil der Spanne (SHRINK_TOTBAND über die Spanne des Laub-Radius).
AnazhRealm.PERF_FOLIAGE_GROW_RUHE_S = 4;
AnazhRealm.PERF_FOLIAGE_SHRINK_TOTBAND = 8;
// Der EINE forceWebGL-Hook: die Boot-Probe (gate:webgl-probe) erzwingt den r184-WebGL2-Rückfall;
// alle fünf Renderer-Münzstellen (Welt · Feed-/Hof-/Ich-Bühne · Workshop-Preview) lesen diesen
// Chokepoint über `_rendererGeraet` → die erzwungene Welt fährt EIN Backend.
AnazhRealm._forceWebGL = function () {
    return typeof window !== "undefined" && window.__anazhForceWebGL === true;
};
// Performance-Regelkreis: die Loop-Phasen, deren Kosten der Nexus pro Frame misst (perfSense.phase).
AnazhRealm.PERF_PHASES = Object.freeze(["streaming", "waterIso", "archCulling", "creatures", "physics", "render"]);
// Die DECKE: über dieser Frame-Zeit drosselt der Regler die Qualität (≈59 fps); der Wachstums-Boden
// liegt PERF_HEADROOM_MS darunter. Schatten-Reichweite: der Regler skaliert das Frustum des zweiten
// Voll-Renders zwischen Last-Floor und User-Ceiling (atmosphere.shadowRange); MIN < fog-far.
AnazhRealm.PERF_SHADOW_RANGE_MIN = 100;
// V8 (Kür) — der GODRAY-Pegel-Ceiling: der Perf-Regler skaliert `_godrayScale` zwischen 0
// (anhaltende Last → Schäfte aus) und diesem Max (Kopfraum → volle Optik). Reine Optik, also
// gibt sie unter Render-Last früh nach; 0.8 ist ein sichtbarer, aber nicht überstrahlender Pegel.
AnazhRealm.PERF_GODRAY_MAX = 0.8;
AnazhRealm.PERF_TARGET_MS = 17;
// V18.281 — DER ATEM-KOPFRAUM: die Schönheit wächst nur, wenn die Frame-Zeit ≥ diesen
// Abstand UNTER der Decke liegt (17 − 4 = 13 ms ≈ 77 fps). Das Totband [13..17 ms] ist die
// Lunge des Systems: dazwischen hält der Regler → fps ruht über 60 statt am 59er-Anschlag.
AnazhRealm.PERF_HEADROOM_MS = 4;
AnazhRealm.PERF_SENSE_ALPHA = 0.12; // EWMA-Gewicht: ruhige, peer-konsistente Wahrnehmung
// GPU-ZEIT-WELLE — wie lange ein per timestamp-query aufgelöster GPU-Messwert als „echt"
// gilt: bleibt die nächste Auflösung länger aus (Headless-Wechsel, Device-Verlust,
// stockende mapAsync-Kette), fällt `_perfGpuSample` ehrlich auf den Proxy zurück.
AnazhRealm.PERF_GPU_TS_STALE_MS = 2000;
AnazhRealm.PERF_GPU_TS_TAKT_MS = 250; // der Takt des Lesers (`_perfGpuResolveKick`): ein Achtel der Frische
// GPU-Last-Proxy: ms-Äquivalent je Draw-Call (~0.011 → 1092 Draw-Calls ≈ 12 ms). Hebt die
// GPU-Render-Last in die Architektur-Domäne des Aktuators, damit der Regler unter Render-Last die
// render-senkenden Hebel (Schatten-Intervall + Cull-Radius) ZUERST drosselt.
AnazhRealm.PERF_RENDER_CALL_MS = 0.011;
// V18.293 — DER FLUGSCHREIBER (Blackbox): wie viele schlimmste Frames pro Sitzung behalten
// (WORST_CAP), wie oft der Leck-Detektor im Leerlauf eine Probe nimmt (PROBE_MS) und ab welcher Frame-Zeit ein Frame
// als „Stocker" gilt (FREEZE_MS ≈ unter 20 fps = spürbar).
AnazhRealm.FLIGHT_RECORDER_WORST_CAP = 12;
AnazhRealm.FLIGHT_RECORDER_FREEZE_MS = 50;
AnazhRealm.FLIGHT_RECORDER_PROBE_MS = 4000;
// PID-Gewichte (velocity-Form auf loadScale). Konservativ: stabil > schnell.
AnazhRealm.PERF_PID = Object.freeze({ p: 0.25, i: 0.5, d: 0 });
// Die Stellgrößen-Bänder [min(=max gedrosselt), max(=volle Qualität)]. Der
// Regler interpoliert je nach loadScale × gemessenem Subsystem-Kosten-Anteil.
AnazhRealm.PERF_LEVERS = Object.freeze({
    streamBudgetMs: [2.5, 5], // _loopVoxelStreaming Frame-Budget
    streamMaxPerFrame: [3, 6], // _loopVoxelStreaming max Chunks/Frame
    waterIsoBudgetMs: [3.5, 8], // _tickPendingWaterIso Zeit-Deadline (V18.261-Lever)
    shadowMinInterval: [1, 5], // _loopShadowUpdate min Frames zwischen Schatten-Renders (V18.264)
});
// HOLZ-LEITER: EIN Daten-Profil je Hardware-Klasse setzt die FERNE-Deckel (Ring · Schatten-Frustum ·
// Fern-Wasser · Pixel-Cap · Antialias); die NÄHE (Voxel-Detail · LOD0 · Substanz) bleibt immer voll.
// Der EINE PID atmet darunter (Profil = Start + Deckel, kein Parallel-Regler). Wahl: ?holz=<name> >
// localStorage anazhHolz > AUTO (Software-Adapter swiftshader/llvmpipe/lavapipe → kienspan).
AnazhRealm.HOLZ_PROFILE = Object.freeze({
    voll: Object.freeze({ ring: 4, shadowRange: 170, farWater: null, pixelCap: 2, antialias: true }),
    nah: Object.freeze({ ring: 3, shadowRange: 110, farWater: false, pixelCap: 1.25, antialias: true }),
    kienspan: Object.freeze({ ring: 2, shadowRange: 0, farWater: false, pixelCap: 1, antialias: false }),
});
