#!/usr/bin/env node
// ─────────────────────────────────────────────────────────────────────────
// diag-gpu-zeit.cjs — DIE GPU-ZEIT-LINSE (Rang 1 der Orakel-Synthese).
//
// gpuGapMs war ein Subtraktions-Proxy (frameMs − ΣCPU — enthält vsync/GC,
// lügt unter vsync-Druck). Der vendored three-r184-WebGPURenderer trägt
// timestamp-query; die GPU-ZEIT-WELLE aktiviert es FAIL-SOFT (trackTimestamp
// im Renderer-Bau; der Backend fordert das Feature nur an, wenn der Adapter
// es trägt) und liest `resolveTimestampsAsync("render")` ASYNC — der Loop
// wird NIE geblockt, das Ergebnis landet im nächsten Frame. Diese Linse
// hält den ganzen Bogen headless (Null-Renderer = der Proxy-Pfad) + die
// echte Leitung per API-treuem Fake-Backend:
//
//   (1) KEIN WURF headless: der Boot + die Sim laufen ohne Page-Error —
//       trackTimestamp/resolveTimestampsAsync reißen nichts (fail-soft).
//   (2) QUELLE === "proxy" headless: perfSense führt `phase.gpuMs` (EWMA,
//       eigene Phase — bewusst NICHT in PERF_PHASES, deren cpuSum-Semantik
//       bliebe sonst vergiftet) + `gpuQuelle`, und ohne echte GPU ist die
//       Quelle SAUBER der Proxy.
//   (3) TRACE + PANEL tragen das Feld: worstFrames[].gpuMs/gpuQuelle,
//       steadyState.gpuMsEwma/gpuQuelle, Panel-Grid „GPU (echt|proxy)".
//   (4) DIE ECHT-LEITUNG (API-treu): ein Fake-Renderer mit der exakten
//       r184-Oberfläche (backend.trackTimestamp === true + resolveTimestamps-
//       Async("render") → Promise<ms>) → `_perfGpuResolveKick` konsumiert
//       sie fire-and-forget, der nächste Fold liest Quelle "echt" mit dem
//       gelieferten Wert; ein ABGESTANDENER Messwert (> PERF_GPU_TS_STALE_MS)
//       fällt ehrlich auf "proxy" zurück; ohne das Adapter-Feature
//       (backend.trackTimestamp false) ruft der Kick nichts.
//
//   SELBST-TEST (die Linse kann rot): ein künstlich KAPUTTES Quelle-Feld
//   („gpuQuelle: 'kaputt'") MUSS durch dieselbe Prüfung fallen.
//
//   node scripts/diag-gpu-zeit.cjs      (npm run gate:gpu-zeit)
// ─────────────────────────────────────────────────────────────────────────

// Port über GPU_ZEIT_PORT (parallele Worktrees fahren je eigenen Bereich), Standard 4431.
const { statikServer, befundVon, warteAufWelt, nullSeite, pruefer, wandEnde } = require("./lib/welt-boot.cjs");
const PORT = Number(process.env.GPU_ZEIT_PORT || 4431);
const server = statikServer();

const { errs, check } = pruefer();

(async () => {
    await server.lausche(PORT);
    const { browser, page } = await nullSeite({ frist: 300000 }); // GPU-frei ⇒ der Proxy-Pfad ist die Wahrheit
    page.setDefaultTimeout(280000);
    const out = await befundVon(async () => {
        await server.zeige(page, 120000, "index.html", "networkidle0");
        await warteAufWelt(page, 120000);
        const out = await page.evaluate(async () => {
            const r = window.anazhRealm;
            const res = {};
            // dieselbe Quelle-Prüfung für Echt-Lauf UND Selbst-Test (EINE Linse):
            const quelleGueltig = (q) => q === "echt" || q === "proxy";

            // ── ~2 s Sim pumpen (die ECHTE Pipe: Fold → gpu-Sample → Flugschreiber) ──
            let t = performance.now();
            for (let i = 0; i < 120; i++) {
                t += 16.7;
                try {
                    r._gameLoopTick(t);
                } catch {
                    /* die Loop-Fehler-Grenze fängt selbst; die Linse zählt Page-Errors */
                }
            }
            const s = r.state.perfSense;
            res.senseGpuMs = s && s.phase ? s.phase.gpuMs : null;
            res.senseGpuMax = s && s.phaseMax ? s.phaseMax.gpuMs : null;
            res.senseQuelle = s ? s.gpuQuelle : null;
            res.senseQuelleGueltig = s ? quelleGueltig(s.gpuQuelle) : false;
            // PERF_PHASES bleibt die CPU-Liste — gpuMs darf ihre cpuSum-Semantik nie vergiften:
            res.gpuNichtInPerfPhases = !r.constructor.PERF_PHASES.includes("gpuMs");

            // ── (3a) ein Stocker-Frame durch den ECHTEN Chokepoint (Fold → Snapshot) ──
            r.state._perfFrame = { streaming: 5, render: 1 };
            r._perfSenseFoldFrame(300, 0.3);
            const fr = r.state.flightRecorder;
            const w0 = fr && fr.worst && fr.worst[0];
            res.worst = w0
                ? { frameMs: w0.frameMs, gpuMs: w0.gpuMs, gpuQuelle: w0.gpuQuelle, gpuGapMs: w0.gpuGapMs }
                : null;
            res.worstQuelleGueltig = !!(w0 && quelleGueltig(w0.gpuQuelle) && Number.isFinite(w0.gpuMs));

            // ── (3b) der Trace (steadyState) trägt das Feld ──
            const trace = r._flightRecorderBuildTrace();
            res.steady = trace && trace.steadyState ? trace.steadyState : null;
            res.steadyOk = !!(
                res.steady &&
                Number.isFinite(res.steady.gpuMsEwma) &&
                quelleGueltig(res.steady.gpuQuelle)
            );
            res.steadyQuelle = res.steady ? res.steady.gpuQuelle : null;

            // ── (3c) das Panel-Grid trägt „GPU (echt|proxy)" ──
            r.state.perfPanel = true;
            r._perfPanelLast = 0;
            r._perfPanelRender();
            res.grid = (document.getElementById("pp-grid") || {}).textContent || "";

            // ── (4) DIE ECHT-LEITUNG: exakte r184-Oberfläche als Fake, fire-and-forget ──
            const savedRenderer = r.state.renderer;
            const savedReady = r.state.rendererReady;
            let resolveCalls = 0;
            const stempel = new Map([["r:0:0:f0", 1]]); // r184 hält jeden Pass-Stempel — nach dem Auflösen fällt die Karte
            r.state.renderer = {
                backend: { trackTimestamp: true, timestampQueryPool: { render: { timestamps: stempel } } },
                resolveTimestampsAsync: (typ) => {
                    resolveCalls++;
                    res.resolveTyp = typ; // muss "render" sein (THREE.TimestampQuery.RENDER)
                    return Promise.resolve(7.5); // r184: Rückgabe = ms des Render-Passes
                },
            };
            r.state.rendererReady = true;
            // das Tor: ohne das Adapter-Feature (backend.trackTimestamp) ruft der Kick nichts und landet nichts
            r.state.renderer.backend.trackTimestamp = false;
            r._gpuTsLast = undefined;
            r._gpuTsPending = false;
            r._perfGpuResolveKick();
            await Promise.resolve();
            res.torOhneFeature = resolveCalls === 0 && r._gpuTsLast === undefined;
            r.state.renderer.backend.trackTimestamp = true;
            r._gpuTsLast = undefined;
            r._gpuTsAtMs = r._gpuTsKickMs = undefined;
            r._gpuTsPending = false;
            r._perfGpuResolveKick(); // fire-and-forget — blockt nie
            res.kickSynchronNichtGelandet = !Number.isFinite(r._gpuTsLast); // der Wert landet ASYNC
            await Promise.resolve(); // eine Microtask = „der nächste Frame"
            res.echtWertGelandet = r._gpuTsLast === 7.5;
            r._perfGpuResolveKick(); // der nächste Bild-Kick im Takt des Lesers (PERF_GPU_TS_TAKT_MS) ruft nichts
            await Promise.resolve();
            res.resolveCalls = resolveCalls;
            res.karteGefallen = stempel.size === 0;
            // der Fake verlässt die Welt VOR den Folds (der gelandete Messwert genügt —
            // genau die EINE Quelle-Wahrheit: "echt" gibt es nur aus einer echten Landung):
            r.state.renderer = savedRenderer;
            r.state.rendererReady = savedReady;
            // der nächste Fold liest jetzt Quelle "echt" mit dem gelieferten Wert:
            r.state._perfFrame = { streaming: 2 };
            r._perfSenseFoldFrame(16.7, 0.0167);
            res.echtQuelle = r.state.perfSense.gpuQuelle;
            res.echtSample = r.state.perfSense.phase.gpuMs;
            // Panel folgt derselben Quelle:
            r._perfPanelLast = 0;
            r._perfPanelRender();
            res.gridEcht = (document.getElementById("pp-grid") || {}).textContent || "";
            // ABGESTANDEN (> PERF_GPU_TS_STALE_MS) ⇒ ehrlich zurück auf "proxy":
            r._gpuTsAtMs = performance.now() - (r.constructor.PERF_GPU_TS_STALE_MS + 1000);
            r.state._perfFrame = { streaming: 2 };
            r._perfSenseFoldFrame(16.7, 0.0167);
            res.staleQuelle = r.state.perfSense.gpuQuelle;
            // aufräumen (kein Messwert-Rest für nachfolgende Proben):
            r._gpuTsLast = undefined;
            r._gpuTsAtMs = undefined;
            r._gpuTsPending = false;

            // ── SELBST-TEST: ein künstlich kaputtes Quelle-Feld MUSS rot lesen ──
            res.selbstTestKaputtFaellt = quelleGueltig("kaputt") === false;
            // und über die echte Oberfläche: kaputte Quelle in den Sense ⇒ Prüfung rot
            const savedQ = r.state.perfSense.gpuQuelle;
            r.state.perfSense.gpuQuelle = "kaputt";
            res.selbstTestSenseKaputt = quelleGueltig(r.state.perfSense.gpuQuelle) === false;
            r.state.perfSense.gpuQuelle = savedQ;
            return res;
        });
        return out;
    }, browser, server, { kopf: "\n===== GPU-ZEIT-WELLE — echtes gpuMs (timestamp-query) statt Subtraktions-Proxy =====\n" });
    check(
        `(2) perfSense führt gpuMs als eigene Phase (EWMA ${out.senseGpuMs != null ? (+out.senseGpuMs).toFixed(2) : "—"} ms · max ${out.senseGpuMax != null ? (+out.senseGpuMax).toFixed(1) : "—"})`,
        Number.isFinite(out.senseGpuMs) && Number.isFinite(out.senseGpuMax)
    );
    check(`(2) Quelle-Feld headless === "proxy"`, out.senseQuelle === "proxy", `gpuQuelle=${out.senseQuelle}`);
    check(
        "(2) gpuMs ist BEWUSST NICHT in PERF_PHASES (cpuSum-Semantik bleibt rein)",
        out.gpuNichtInPerfPhases === true
    );
    check(
        "(3) worst-Frame-Snapshot trägt gpuMs + gpuQuelle (durch den echten Fold-Chokepoint)",
        out.worstQuelleGueltig === true,
        out.worst ? `frame ${out.worst.frameMs} ms · gpu ${out.worst.gpuMs} [${out.worst.gpuQuelle}] · gap ${out.worst.gpuGapMs}` : "kein worst-Frame"
    );
    check(
        "(3) steadyState trägt gpuMsEwma + gpuQuelle (der Schöpfer-Trace zeigt die Quelle)",
        out.steadyOk === true && out.steadyQuelle === "proxy",
        out.steady ? `gpuMsEwma ${out.steady.gpuMsEwma} · Quelle ${out.steady.gpuQuelle}` : "kein steadyState"
    );
    check(
        `(3) Panel-Grid trägt „GPU (proxy)" headless`,
        /GPU \(proxy\)/.test(out.grid),
        (out.grid || "").replace(/\s+/g, " ").slice(0, 90)
    );
    check(
        "(4) die Echt-Leitung: Kick blockt nie (Wert landet ASYNC), der nächste Kick im Takt des Lesers ruft nichts, die Stempel-Karte fällt",
        out.kickSynchronNichtGelandet && out.echtWertGelandet && out.resolveCalls === 1 && out.karteGefallen,
        `resolveCalls=${out.resolveCalls} · gelandet=${out.echtWertGelandet} · Karte gefallen=${out.karteGefallen}`
    );
    check(
        `(4) resolveTimestampsAsync wird mit "render" gerufen (THREE.TimestampQuery.RENDER)`,
        out.resolveTyp === "render",
        `typ=${out.resolveTyp}`
    );
    check(
        `(4) der nächste Fold liest Quelle "echt" mit dem gelieferten Wert`,
        out.echtQuelle === "echt" && Number.isFinite(out.echtSample),
        `Quelle=${out.echtQuelle} · sample=${out.echtSample != null ? (+out.echtSample).toFixed(2) : "—"}`
    );
    check(`(4) Panel folgt: „GPU (echt)" im Grid`, /GPU \(echt\)/.test(out.gridEcht));
    check("(4) ohne das Adapter-Feature (backend.trackTimestamp) ruft der Kick nichts", out.torOhneFeature === true);
    check(
        `(4) abgestandener Messwert (> Stale-Fenster) fällt ehrlich auf "proxy" zurück`,
        out.staleQuelle === "proxy",
        `Quelle=${out.staleQuelle}`
    );
    check(
        `SELBST-TEST: künstlich kaputtes Quelle-Feld („kaputt") fällt durch die Prüfung`,
        out.selbstTestKaputtFaellt === true && out.selbstTestSenseKaputt === true
    );

    wandEnde(
        errs,
        "die GPU-Zeit ist gemessen statt geglaubt: timestamp-query fail-soft angefordert, " +
            "async gelesen (der Loop blockt nie), gpuMs als eigene perfSense-Phase mit Quelle-Feld " +
            '("echt"|"proxy") in Trace, worst-Frames und Panel; headless bleibt sauber Proxy.'
    );
})();
