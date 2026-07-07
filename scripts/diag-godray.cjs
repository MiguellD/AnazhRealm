// Diag — GODRAYS (V8 Kür): der volumetrische Screen-Space-Light-Shaft im EINEN Post-FX-Pass.
//
// Zwei hardware-unabhängige Linsen (Null-Renderer, kein GPU-Render — MECHANIK braucht eine
// ZAHL, der LOOK ist Schöpfer-Browser):
//
//   (A) SOURCE-PROBE — die EINE Quelle steht + fließt: `_ensurePostProcessing` baut den Godray-
//       March (gDelta/godrayDensity) + die benannte Quelle `godrayUniforms` (godraySun/
//       godrayStrength) + addiert `godray` in die Bloom-Summe; `_loopRender` setzt `sunScreenPos`
//       via `.project(` + liest `_godrayFrameGate`; `_nexusPerfActuate` fährt `_godrayScale` aus
//       `PERF_GODRAY_MAX`. Die reine `_godrayFrameGate` remappt Höhe×Wetter korrekt.
//
//   (B) PERF-LEVER als ZAHL (Muster diag-shadow-regulator): unter Render-Last (effArch→0) fällt
//       `_godrayScale` gegen 0 (Optik gibt zuerst nach), mit Kopfraum (effArch→1) steht er bei
//       PERF_GODRAY_MAX. Headless-Kurzschluss kontrolliert umgangen (wie beim Schatten-Regler).
const puppeteer = require("puppeteer");
const http = require("http");
const fs = require("fs");
const path = require("path");
const PORT = 4419;
const root = path.resolve(__dirname, "..");
const mime = {
    ".html": "text/html",
    ".js": "application/javascript",
    ".json": "application/json",
    ".css": "text/css",
    ".wasm": "application/wasm",
    ".woff2": "font/woff2",
    ".png": "image/png",
};
const server = http.createServer((req, res) => {
    let p = req.url.split("?")[0];
    if (p === "/") p = "/index.html";
    const fp = path.join(root, p);
    if (!fp.startsWith(root)) {
        res.statusCode = 403;
        return res.end();
    }
    fs.readFile(fp, (err, data) => {
        if (err) {
            res.statusCode = 404;
            return res.end();
        }
        res.setHeader("Content-Type", mime[path.extname(fp)] || "application/octet-stream");
        res.end(data);
    });
});
(async () => {
    await new Promise((r) => server.listen(PORT, r));
    const browser = await puppeteer.launch({
        headless: true,
        protocolTimeout: 120000,
        args: ["--disable-gpu", "--disable-software-rasterizer", "--no-sandbox", "--disable-setuid-sandbox"],
    });
    const page = await browser.newPage();
    let pageErr = null;
    page.on("pageerror", (e) => {
        pageErr = (e.stack || e.message).split("\n")[0];
    });
    await page.evaluateOnNewDocument(() => {
        window.__anazhHeadlessNullRenderer = true;
    });
    await page.goto(`http://127.0.0.1:${PORT}/index.html`, { waitUntil: "domcontentloaded", timeout: 30000 });
    await page.evaluate(async () => {
        const start = performance.now();
        while (performance.now() - start < 40000) {
            const r = window.anazhRealm;
            if (r && typeof r._nexusPerfActuate === "function" && r.state && r.state.directionalLight) break;
            await new Promise((res) => setTimeout(res, 6));
        }
        for (let i = 0; i < 15; i++) {
            try {
                window.anazhRealm._gameLoopTick(performance.now());
            } catch (_e) {
                /* */
            }
            await new Promise((res) => setTimeout(res, 4));
        }
    });

    const report = await page.evaluate(() => {
        const r = window.anazhRealm;
        const st = r.state;
        const out = { MAX: r.constructor.PERF_GODRAY_MAX };

        // (A) SOURCE-PROBE — die etablierte `.toString()`-Linse auf die LIVE-Methoden.
        const epp = r._ensurePostProcessing.toString();
        const lr = r._loopRender.toString();
        const npa = r._nexusPerfActuate.toString();
        out.hasFrameGateMethod = typeof r._godrayFrameGate === "function";
        // die eine Quelle + der March im Post-FX-Pass
        out.ppMarch = /gDelta/.test(epp) && /godrayDensity/.test(epp) && /sceneColor\.sample/.test(epp);
        out.ppUniforms = /godrayUniforms/.test(epp) && /godraySun/.test(epp) && /godrayStrength/.test(epp);
        out.ppAdded = /\.add\(godray\)/.test(epp); // additiv in DIESELBE Bloom-Summe
        // der Frame-Code projiziert die Sonne + liest die eine Quelle + den Gate
        out.lrProject = /godrayUniforms/.test(lr) && /\.project\(/.test(lr) && /sunScreenPos/.test(lr);
        out.lrGate = /_godrayFrameGate/.test(lr);
        // der Perf-Lever im EINEN Aktuator
        out.npaLever = /PERF_GODRAY_MAX/.test(npa) && /_godrayScale/.test(npa);

        // die reine `_godrayFrameGate`: Sonne hoch + klar → hoch; unter Horizont → 0; Sturm → ~0.
        out.gateHigh = r._godrayFrameGate(0.9, 1.0); // Mittag, klar
        out.gateBelow = r._godrayFrameGate(-0.2, 1.0); // Sonne unter Horizont
        out.gateStorm = r._godrayFrameGate(0.9, 0.42); // Sturm (WEATHER_FIELD.stormy.sun)

        // (B) PERF-LEVER als ZAHL — headless-Kurzschluss kontrolliert umgehen (wie Schatten-Regler).
        const wasNull = st.renderer && st.renderer._isHeadlessNull;
        // headless-Pfad zuerst prüfen (Kurzschluss → MAX, gate-treu).
        if (st.renderer) st.renderer._isHeadlessNull = true;
        r._nexusPerfActuate({
            loadScale: 0.0,
            phase: { archCulling: 1, render: 1, streaming: 0, waterIso: 0 },
            renderCalls: 2000,
            frameMs: 60,
        });
        out.headlessScale = st._godrayScale;
        // non-headless: effArch treibt den Faktor.
        if (st.renderer) st.renderer._isHeadlessNull = false;
        const mkSense = (ls, calls, frameMs) => ({
            loadScale: ls,
            phase: { archCulling: 1, render: 1, streaming: 0, waterIso: 0 },
            renderCalls: calls,
            frameMs,
        });
        r._nexusPerfActuate(mkSense(0.0, 2000, 60)); // heavy → effArch ~0 → Faktor ~0
        out.heavyScale = st._godrayScale;
        r._nexusPerfActuate(mkSense(1.0, 0, 8)); // light → effArch ~1 → Faktor ~MAX
        out.lightScale = st._godrayScale;
        if (st.renderer) st.renderer._isHeadlessNull = wasNull;
        return out;
    });

    console.log("\n===== GODRAYS (V8 Kür) — MECHANISMUS =====\n");
    if (pageErr) console.log("PAGE-ERROR:", pageErr);
    const o = report;
    console.log("  (A) SOURCE-PROBE:");
    console.log(`      _godrayFrameGate existiert: ${o.hasFrameGateMethod}`);
    console.log(`      _ensurePostProcessing: March ${o.ppMarch} · Uniforms ${o.ppUniforms} · additiv ${o.ppAdded}`);
    console.log(`      _loopRender: project+Quelle ${o.lrProject} · Gate ${o.lrGate}`);
    console.log(`      _nexusPerfActuate: Lever ${o.npaLever}`);
    console.log(
        `      _godrayFrameGate: Mittag/klar ${o.gateHigh != null ? o.gateHigh.toFixed(3) : "?"} (>0.6) · unter Horizont ${o.gateBelow != null ? o.gateBelow.toFixed(3) : "?"} (=0) · Sturm ${o.gateStorm != null ? o.gateStorm.toFixed(3) : "?"} (~0)`
    );
    console.log("  (B) PERF-LEVER (PERF_GODRAY_MAX " + o.MAX + "):");
    console.log(`      headless → ${o.headlessScale != null ? o.headlessScale.toFixed(3) : "?"} (erw MAX ${o.MAX})`);
    console.log(
        `      heavy (effArch→0) → ${o.heavyScale != null ? o.heavyScale.toFixed(3) : "?"} (→0) · light (effArch→1) → ${o.lightScale != null ? o.lightScale.toFixed(3) : "?"} (→MAX)`
    );

    const ok =
        !pageErr &&
        o.hasFrameGateMethod === true &&
        o.ppMarch === true &&
        o.ppUniforms === true &&
        o.ppAdded === true &&
        o.lrProject === true &&
        o.lrGate === true &&
        o.npaLever === true &&
        o.gateHigh != null &&
        o.gateHigh > 0.6 &&
        o.gateBelow === 0 &&
        o.gateStorm != null &&
        o.gateStorm < 0.05 &&
        o.headlessScale != null &&
        Math.abs(o.headlessScale - o.MAX) < 1e-6 && // headless → MAX (gate-treu)
        o.heavyScale != null &&
        o.heavyScale < 0.1 && // heavy → aus
        o.lightScale != null &&
        o.lightScale > o.MAX - 0.05 && // light → MAX
        o.heavyScale < o.lightScale - 0.4; // klar getrennt (der Regler wirkt)
    console.log(
        `\n  ${ok ? "✅ Der Godray steht als EINE Quelle im einen Post-FX-Pass + folgt dem EINEN Perf-Regler (Last→aus, Kopfraum→voll, headless→MAX)." : "⚠️ Godray-Mechanik/Regler weicht ab — prüfen."}\n`
    );
    await browser.close();
    server.close();
    process.exit(ok ? 0 : 1);
})();
