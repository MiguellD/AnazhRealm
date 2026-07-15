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
//       fällt ehrlich auf "proxy" zurück.
//   (5) RENDERER-BAU-VERTRAG (kommentar-gestrippte Quelltext-Probe): der
//       echte WebGPURenderer-Bau fordert `trackTimestamp: true` an, und der
//       Kick liest `resolveTimestampsAsync` — kein toter Schalter.
//
//   SELBST-TEST (die Linse kann rot): ein künstlich KAPUTTES Quelle-Feld
//   („gpuQuelle: 'kaputt'") MUSS durch dieselbe Prüfung fallen.
//
//   node scripts/diag-gpu-zeit.cjs      (npm run gate:gpu-zeit)
// ─────────────────────────────────────────────────────────────────────────
const puppeteer = require("puppeteer");
const http = require("http");
const fs = require("fs");
const path = require("path");

const root = path.resolve(__dirname, "..");
const PORT = Number(process.env.DIAG_PORT) || 4431;
const mime = {
    ".html": "text/html",
    ".js": "application/javascript",
    ".json": "application/json",
    ".css": "text/css",
    ".woff2": "font/woff2",
    ".png": "image/png",
    ".wasm": "application/wasm",
};
const server = http.createServer((req, res) => {
    let p = req.url.split("?")[0];
    if (p === "/") p = "/index.html";
    const fp = path.join(root, p);
    if (!fp.startsWith(root)) return ((res.statusCode = 403), res.end());
    fs.readFile(fp, (err, data) => {
        if (err) return ((res.statusCode = 404), res.end());
        res.setHeader("Content-Type", mime[path.extname(fp)] || "application/octet-stream");
        res.end(data);
    });
});

const errs = [];
function check(name, ok, detail) {
    console.log(`  ${ok ? "✅" : "❌"} ${name}${detail ? " — " + detail : ""}`);
    if (!ok) errs.push(name);
}

(async () => {
    await new Promise((r) => server.listen(PORT, r));
    const browser = await puppeteer.launch({
        headless: "new",
        protocolTimeout: 300000,
        args: ["--no-sandbox", "--disable-gpu"],
    });
    const page = await browser.newPage();
    page.setDefaultTimeout(280000);
    const pageErrors = [];
    page.on("pageerror", (e) => pageErrors.push((e.stack || e.message || String(e)).split("\n")[0]));
    await page.evaluateOnNewDocument(() => {
        window.__anazhHeadlessNullRenderer = true; // GPU-frei ⇒ der Proxy-Pfad ist die Wahrheit
    });
    let out = null;
    try {
        await page.goto(`http://127.0.0.1:${PORT}/index.html`, { waitUntil: "networkidle0", timeout: 120000 });
        await page.waitForFunction(() => window.anazhRealm && typeof window.anazhRealm._gameLoopTick === "function", {
            timeout: 120000,
        });
        out = await page.evaluate(async () => {
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
                } catch (_e) {
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
            r.state.renderer = {
                backend: { trackTimestamp: true },
                resolveTimestampsAsync: (typ) => {
                    resolveCalls++;
                    res.resolveTyp = typ; // muss "render" sein (THREE.TimestampQuery.RENDER)
                    return Promise.resolve(7.5); // r184: Rückgabe = ms des Render-Passes
                },
            };
            r.state.rendererReady = true;
            r._gpuTsLast = undefined;
            r._gpuTsAtMs = undefined;
            r._gpuTsPending = false;
            r._perfGpuResolveKick(); // fire-and-forget — blockt nie
            res.kickSynchronNichtGelandet = !Number.isFinite(r._gpuTsLast); // der Wert landet ASYNC
            await Promise.resolve(); // eine Microtask = „der nächste Frame"
            res.echtWertGelandet = r._gpuTsLast === 7.5;
            res.resolveCalls = resolveCalls;
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

            // ── (5) Renderer-Bau-Vertrag (Quelltext-Probe — headless baut den echten nie).
            // Kommentar-gestrippt (die __codeOf-Disziplin, lokal definiert — der Kommentar
            // dürfte das Wort tragen, der CODE muss es): der Haupt-Renderer-Bau lebt in
            // `init()` und muss trackTimestamp:true an den WebGPURenderer geben.
            const codeOf = (fn) =>
                String(fn)
                    .replace(/\/\/.*$/gm, "")
                    .replace(/\/\*[\s\S]*?\*\//g, "");
            const bauSrc = codeOf(r.init);
            res.bauFordertTrackTimestamp =
                /new THREE\.WebGPURenderer\(/.test(bauSrc) && /trackTimestamp:\s*true/.test(bauSrc);
            const kickSrc = codeOf(r._perfGpuResolveKick);
            res.kickKonsumiertResolve =
                /resolveTimestampsAsync\("render"\)/.test(kickSrc) && /trackTimestamp/.test(kickSrc);

            // ── SELBST-TEST: ein künstlich kaputtes Quelle-Feld MUSS rot lesen ──
            res.selbstTestKaputtFaellt = quelleGueltig("kaputt") === false;
            // und über die echte Oberfläche: kaputte Quelle in den Sense ⇒ Prüfung rot
            const savedQ = r.state.perfSense.gpuQuelle;
            r.state.perfSense.gpuQuelle = "kaputt";
            res.selbstTestSenseKaputt = quelleGueltig(r.state.perfSense.gpuQuelle) === false;
            r.state.perfSense.gpuQuelle = savedQ;
            return res;
        });
    } catch (e) {
        out = { error: (e && e.message) || String(e) };
    }
    await browser.close();
    server.close();

    console.log("\n===== GPU-ZEIT-WELLE — echtes gpuMs (timestamp-query) statt Subtraktions-Proxy =====\n");
    if (!out || out.error) {
        console.log("FEHLER:", out ? out.error : "?");
        process.exit(1);
    }
    check("(1) kein Wurf headless (trackTimestamp/resolve sind fail-soft)", pageErrors.length === 0, pageErrors[0] || "sauber");
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
        "(4) die Echt-Leitung: Kick blockt nie (Wert landet ASYNC, nicht im Kick-Frame)",
        out.kickSynchronNichtGelandet === true && out.echtWertGelandet === true && out.resolveCalls === 1,
        `resolveCalls=${out.resolveCalls} · gelandet=${out.echtWertGelandet}`
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
    check(
        `(4) abgestandener Messwert (> Stale-Fenster) fällt ehrlich auf "proxy" zurück`,
        out.staleQuelle === "proxy",
        `Quelle=${out.staleQuelle}`
    );
    check(
        "(5) Renderer-Bau fordert trackTimestamp:true an (Quelltext-Probe)",
        out.bauFordertTrackTimestamp === true
    );
    check(
        "(5) der Kick konsumiert die r184-API (resolveTimestampsAsync + backend.trackTimestamp)",
        out.kickKonsumiertResolve === true
    );
    check(
        `SELBST-TEST: künstlich kaputtes Quelle-Feld („kaputt") fällt durch die Prüfung`,
        out.selbstTestKaputtFaellt === true && out.selbstTestSenseKaputt === true
    );

    if (errs.length) {
        console.log(`\n❌ ROT — ${errs.length} Verletzung(en): ${errs.join(" · ")}`);
        process.exit(1);
    }
    console.log(
        "\n✅ GRÜN — die GPU-Zeit ist gemessen statt geglaubt: timestamp-query fail-soft angefordert, " +
            "async gelesen (der Loop blockt nie), gpuMs als eigene perfSense-Phase mit Quelle-Feld " +
            '("echt"|"proxy") in Trace, worst-Frames und Panel; headless bleibt sauber Proxy.'
    );
})();
