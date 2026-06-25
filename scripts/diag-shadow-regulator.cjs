// Diag — DER SCHATTEN-PASS UNTER DEM EINEN REGLER (V18.352, Schöpfer „tue es endlich, alles, wie es die
// Vision will"). Der Schatten-Pass (ein zweiter Voll-Render) war die FIXE Boden-Last AUSSERHALB des
// Laub-Reglers → eine kämpfende GPU blieb unterm fps-Ziel. Jetzt fährt `effArch` (DIESELBE PID-Quelle)
// die Schatten-Reichweite zwischen Last-Floor und User-Ceiling.
//
// HARDWARE-UNABHÄNGIG (reine Kamera-/Regler-Logik, kein GPU-Render):
//   (1) `_applyEffectiveShadowRange(m)` setzt die Schatten-Kamera-Bounds (±m, CSM maxFar m·1.8) OHNE
//       den User-Ceiling (`atmosphere.shadowRange`) zu überschreiben (der Regler clobbert ihn nicht);
//   (2) `setShadowRange(m)` setzt den Ceiling + wendet an;
//   (3) der Default-Ceiling ist 170 (300→170: der Nebel deckt eh >~150 m);
//   (4) REGLER: heavy load (effArch→0) → Reichweite zum Floor (100) · light (effArch→1) → Ceiling (170).
const puppeteer = require("puppeteer");
const http = require("http");
const fs = require("fs");
const path = require("path");
const PORT = 4414;
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
        const out = { MIN: r.constructor.PERF_SHADOW_RANGE_MIN, MAX: r.constructor.PERF_SHADOW_RANGE_MAX };
        const camRight = () =>
            st.directionalLight && st.directionalLight.shadow && st.directionalLight.shadow.camera
                ? st.directionalLight.shadow.camera.right
                : null;

        // (3) Default-Ceiling.
        out.defaultCeiling = st.atmosphere ? st.atmosphere.shadowRange : null;

        // (1) _applyEffectiveShadowRange: Kamera folgt, Ceiling unberührt.
        const ceilBefore = st.atmosphere.shadowRange;
        r._applyEffectiveShadowRange(120);
        out.applyCam = camRight();
        out.applyCeilingUnchanged = st.atmosphere.shadowRange === ceilBefore;
        out.applyTracked = r._shadowRangeApplied === 120;

        // (2) setShadowRange: Ceiling + Kamera.
        r.setShadowRange(200);
        out.setCeiling = st.atmosphere.shadowRange;
        out.setCam = camRight();
        r.setShadowRange(170); // zurück auf Default-Ceiling

        // (4) REGLER — headless-Kurzschluss kontrolliert umgehen, heavy vs light sense.
        const wasNull = st.renderer && st.renderer._isHeadlessNull;
        if (st.renderer) st.renderer._isHeadlessNull = false;
        const mkSense = (ls, calls, frameMs) => ({
            loadScale: ls,
            phase: { archCulling: 1, render: 1, streaming: 0, waterIso: 0 },
            renderCalls: calls,
            frameMs,
        });
        // heavy: load voll (ls 0), Render-Last dominant → effArch ~0 → Reichweite zum Floor.
        r._shadowRangeApplied = 170;
        r._nexusPerfActuate(mkSense(0.0, 2000, 60));
        out.heavyApplied = r._shadowRangeApplied;
        out.heavyCam = camRight();
        // light: keine Last (ls 1) → effArch ~1 → Reichweite zum Ceiling.
        r._nexusPerfActuate(mkSense(1.0, 0, 8));
        out.lightApplied = r._shadowRangeApplied;
        out.lightCam = camRight();
        if (st.renderer) st.renderer._isHeadlessNull = wasNull;
        return out;
    });

    console.log("\n===== DER SCHATTEN-PASS UNTER DEM EINEN REGLER — MECHANISMUS =====\n");
    if (pageErr) console.log("PAGE-ERROR:", pageErr);
    const o = report;
    console.log(`  PERF_SHADOW_RANGE: MIN ${o.MIN} · MAX(Ceiling) ${o.MAX}`);
    console.log(`  (3) Default-Ceiling atmosphere.shadowRange: ${o.defaultCeiling} (erw 170)`);
    console.log(
        `  (1) _applyEffectiveShadowRange(120): Kamera.right ${o.applyCam} (erw 120) · Ceiling unberührt ${o.applyCeilingUnchanged} · getrackt ${o.applyTracked}`
    );
    console.log(`  (2) setShadowRange(200): Ceiling ${o.setCeiling} (erw 200) · Kamera ${o.setCam} (erw 200)`);
    console.log(
        `  (4) REGLER heavy (effArch→0): Reichweite ${o.heavyApplied != null ? o.heavyApplied.toFixed(1) : "?"} → Floor ${o.MIN} · Kamera ${o.heavyCam != null ? o.heavyCam.toFixed(1) : "?"}`
    );
    console.log(
        `            light (effArch→1): Reichweite ${o.lightApplied != null ? o.lightApplied.toFixed(1) : "?"} → Ceiling 170 · Kamera ${o.lightCam != null ? o.lightCam.toFixed(1) : "?"}`
    );

    const ok =
        !pageErr &&
        o.defaultCeiling === 170 &&
        o.applyCam === 120 &&
        o.applyCeilingUnchanged === true &&
        o.applyTracked === true &&
        o.setCeiling === 200 &&
        o.setCam === 200 &&
        o.heavyApplied != null &&
        o.heavyApplied <= o.MIN + 2 && // heavy → Floor
        o.lightApplied != null &&
        o.lightApplied >= 170 - 2 && // light → Ceiling
        o.heavyApplied < o.lightApplied - 30; // klar getrennt (Regler wirkt)
    console.log(
        `\n  ${ok ? "✅ Die Schatten-Reichweite folgt dem EINEN Regler (heavy→Floor, light→Ceiling), ohne den User-Ceiling zu clobbern; Default 170." : "⚠️ Die Regler-Kopplung weicht ab — prüfen."}\n`
    );
    await browser.close();
    server.close();
    process.exit(ok ? 0 : 1);
})();
