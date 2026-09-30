#!/usr/bin/env node
// ─────────────────────────────────────────────────────────────────────────
// diag-webgl-probe.cjs — DIE KEIN-WEBGPU-BOOT-PROBE (gate:webgl-probe, 18.07.)
//
// Der r184-WebGPURenderer fällt ohne Adapter (oder via forceWebGL) STILL auf
// den WebGL2-Backend zurück. Bis heute war diese Geschichte UNBEWIESEN: die
// WGSL-Konsumenten (Feld-Cull-Compute · Fullscreen-Feld-Pass) und die Render-
// Bundles existieren als KLASSEN auch dort weiter — Existenz-Prüfungen sind
// blind (die V18.267-Falle in GPU-Form). Diese Probe erzwingt den Rückfall
// (window.__anazhForceWebGL → der EINE Hook, alle 5 Renderer-Münzstellen)
// und beweist auf echtem (swiftshader-)GL:
//   W1 der Backend IST WebGL (der Hook wirkt; isWebGPURenderer bliebe true)
//   W2 der Rückfall wird EINMAL LAUT benannt (WARN „WebGL2-Rückfall") —
//      fail-soft wäre der Bruch (Schöpfer-Wort 17.07.)
//   W3 die Wände halten: Feld-Cull adoptiert NIE · kein Feld-Pass ·
//      keine Region-RenderBundles (deren API lebt nur im WebGPU-Backend)
//   W4 der Fern-Ring verfeinert auf CPU (cursor wandert — das Gesetz trägt)
//   W5 die Welt LEBT: Loop-Ticks laufen, der Spieler steht auf endlicher
//      Position, ein echter Render in ein RenderTarget liefert SUBSTANZ
//      (distinkte Farben, nicht schwarz) ohne einen einzigen page-error —
//      „Wer kein WebGPU-Backend bekommt, sieht eine Welt, keine Lüge."
//   node scripts/diag-webgl-probe.cjs
// ─────────────────────────────────────────────────────────────────────────
const puppeteer = require("puppeteer");
const http = require("http");
const fs = require("fs");
const path = require("path");

const PORT = Number(process.env.WGLP_PORT || 4671);
const root = path.resolve(__dirname, "..");
const mime = {
    ".html": "text/html",
    ".js": "application/javascript",
    ".wasm": "application/wasm",
    ".json": "application/json",
    ".css": "text/css",
    ".png": "image/png",
    ".woff2": "font/woff2",
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

(async () => {
    await new Promise((r) => server.listen(PORT, "127.0.0.1", r));
    const browser = await puppeteer.launch({
        headless: true,
        protocolTimeout: 300000,
        args: ["--use-angle=swiftshader", "--enable-unsafe-swiftshader", "--no-sandbox", "--disable-setuid-sandbox"],
    });
    const page = await browser.newPage();
    await page.evaluateOnNewDocument(() => {
        window.__anazhForceWebGL = true; // der EINE Hook — echter Renderer, erzwungener WebGL2-Backend
    });
    const pageErrors = [];
    const consoleLines = [];
    page.on("pageerror", (e) => pageErrors.push((e.stack || e.message || String(e)).split("\n")[0]));
    page.on("console", (m) => consoleLines.push(m.text()));
    await page.goto(`http://127.0.0.1:${PORT}/index.html`, { waitUntil: "domcontentloaded", timeout: 60000 });
    await page.evaluate(async () => {
        const dl = performance.now() + 120000;
        while (
            (!window.anazhRealm || !window.anazhRealm.state || window.anazhRealm.state.rendererReady !== true) &&
            performance.now() < dl
        )
            await new Promise((r) => setTimeout(r, 200));
    });
    // Die Welt einige Sekunden LEBEN lassen (der natürliche Loop läuft; swiftshader-GL ist zäh).
    await new Promise((r) => setTimeout(r, 6000));
    const out = await page.evaluate(async () => {
        const r = window.anazhRealm;
        const o = { err: null };
        try {
            const st = r.state;
            const be = st.renderer && st.renderer.backend;
            o.rendererReady = st.rendererReady === true;
            o.backendWebGL = !!(be && be.isWebGPUBackend !== true && be.isWebGLBackend === true);
            o.rendererType = r._flightRecorderDevice().rendererType;
            // W3 — die Wände:
            o.feldCullRuht = !r._feldCull || (r._feldCull.adoptiert === 0 && r._feldCull.gewaender.size === 0);
            o.feldPassRuht = !st.feldPass;
            o.bundlesRuhen = !st._regionBundles || st._regionBundles.size === 0;
            o.computeFaehig = r._gpuComputeFaehig(); // MUSS false sein (die Wand-Quelle selbst)
            // W4 — der Fern-Ring verfeinert auf CPU (den Tick deterministisch pumpen):
            const pm = st.playerMesh;
            for (let i = 0; i < 60 && pm; i++) r._tickFernRing(pm.position);
            o.fernRingDa = !!st.fernRing;
            o.fernRingCursor = st.fernRing ? st.fernRing.cursor : -1;
            // W5 — die Welt lebt: den Loop DETERMINISTISCH pumpen (swiftshader-GL
            // schafft natürliche rAF-Frames nur im Sekundentakt — Wanduhr-Frames
            // wären ein Software-Raster-Artefakt, keine Mechanik-Wahrheit).
            o.tickOk = 0;
            for (let i = 0; i < 12; i++) {
                try {
                    r._gameLoopTick(performance.now());
                    o.tickOk++;
                } catch (_e) {
                    o.tickErr = (_e && _e.message) || String(_e);
                }
                await new Promise((res) => setTimeout(res, 50));
            }
            o.frames = st.flightRecorder ? st.flightRecorder.frames : 0;
            o.spielerEndlich = !!(
                pm &&
                Number.isFinite(pm.position.x) &&
                Number.isFinite(pm.position.y) &&
                Number.isFinite(pm.position.z)
            );
            // Der Substanz-Schuss (die diag-blick-Rezeptur, GAME-Renderer = WebGL-Backend):
            const T = THREE;
            const cam = st.camera;
            if (pm && cam) {
                cam.position.set(pm.position.x, pm.position.y + 1.7, pm.position.z);
                cam.lookAt(pm.position.x + 30, pm.position.y + 4, pm.position.z + 30);
                cam.updateMatrixWorld(true);
            }
            const rend = st.renderer;
            const w = 96,
                h = 64;
            const rt = new T.RenderTarget(w, h);
            const prev = rend.getRenderTarget();
            rend.setRenderTarget(rt);
            await rend.renderAsync(st.scene, cam);
            let px = null;
            if (typeof rend.readRenderTargetPixelsAsync === "function")
                px = await rend.readRenderTargetPixelsAsync(rt, 0, 0, w, h);
            rend.setRenderTarget(prev);
            if (rt.dispose) rt.dispose();
            if (px && px.length) {
                const u8 = px instanceof Uint8Array ? px : new Uint8Array(px.buffer || px);
                const set = new Set();
                let nonzero = 0;
                for (let i = 0; i < u8.length; i += 4) {
                    set.add(((u8[i] >> 4) << 8) | ((u8[i + 1] >> 4) << 4) | (u8[i + 2] >> 4));
                    if (u8[i] + u8[i + 1] + u8[i + 2] > 12) nonzero++;
                }
                o.farben = set.size;
                o.nonzero = nonzero;
            } else {
                o.farben = 0;
                o.nonzero = 0;
            }
        } catch (e) {
            o.err = (e && e.message) || String(e);
        }
        return o;
    });
    await browser.close();
    server.close();

    const lautEcht = consoleLines.some((l) => l.includes("WebGL2-Rückfall"));
    console.log("=== KEIN-WEBGPU-BOOT-PROBE (forceWebGL, echter swiftshader-GL) ===");
    console.log(`  W1 Backend WebGL: ${out.backendWebGL} · rendererType: ${out.rendererType}`);
    console.log(`  W2 LAUT benannt (WARN WebGL2-Rückfall): ${lautEcht}`);
    console.log(
        `  W3 Wände: feldCullRuht=${out.feldCullRuht} feldPassRuht=${out.feldPassRuht} bundlesRuhen=${out.bundlesRuhen} computeFaehig=${out.computeFaehig}`
    );
    console.log(`  W4 Fern-Ring: da=${out.fernRingDa} cursor=${out.fernRingCursor} (CPU-Gesetz wandert)`);
    console.log(
        `  W5 Welt lebt: tickOk=${out.tickOk}/12 frames=${out.frames} spielerEndlich=${out.spielerEndlich} · Substanz farben=${out.farben} nonzero=${out.nonzero}${out.tickErr ? " tickErr=" + out.tickErr : ""}`
    );
    if (out.err) console.log(`  Probe-Fehler: ${out.err}`);
    if (pageErrors.length) console.log("  Seiten-Fehler:", pageErrors.slice(0, 5));

    const errs = [];
    if (out.err) errs.push(`Probe brach ab: ${out.err}`);
    if (!out.rendererReady) errs.push("W1: der Renderer wurde nie ready (init hing)");
    if (!out.backendWebGL) errs.push("W1: der Backend ist NICHT WebGL (der forceWebGL-Hook wirkt nicht)");
    if (out.rendererType !== "webgl-fallback")
        errs.push(`W1: rendererType meldet "${out.rendererType}" statt "webgl-fallback" (Telemetrie lügt)`);
    if (!lautEcht) errs.push("W2: der Rückfall wurde NICHT laut benannt (kein WebGL2-Rückfall-WARN)");
    if (!out.feldCullRuht) errs.push("W3: der Feld-Cull adoptierte auf WebGL (die Wand hält nicht)");
    if (!out.feldPassRuht) errs.push("W3: der Feld-Pass entstand auf WebGL (die Wand hält nicht)");
    if (!out.bundlesRuhen) errs.push("W3: Region-RenderBundles entstanden auf WebGL (Crash-Klasse)");
    if (out.computeFaehig) errs.push("W3: _gpuComputeFaehig meldet true auf WebGL (die Quelle lügt)");
    if (!out.fernRingDa || !(out.fernRingCursor > 0))
        errs.push(`W4: der Fern-Ring verfeinert nicht (da=${out.fernRingDa}, cursor=${out.fernRingCursor})`);
    if (out.tickOk !== 12) errs.push(`W5: Loop-Ticks warfen (${out.tickOk}/12${out.tickErr ? ": " + out.tickErr : ""})`);
    if (!(out.frames >= 1)) errs.push(`W5: kein einziger Frame lief (frames=${out.frames})`);
    if (!out.spielerEndlich) errs.push("W5: die Spieler-Position ist nicht endlich");
    if (!(out.farben >= 4 && out.nonzero > 200))
        errs.push(`W5: der Render hat keine SUBSTANZ (farben=${out.farben}, nonzero=${out.nonzero}) — schwarze Welt?`);
    if (pageErrors.length) errs.push(`${pageErrors.length} Seiten-Fehler auf dem WebGL-Pfad`);

    if (errs.length) {
        console.error("\n❌ ROT:");
        for (const e of errs) console.error("  • " + e);
        process.exit(1);
    }
    console.log(
        "\n✅ GRÜN — die Kein-WebGPU-Geschichte ist BEWIESEN: der erzwungene WebGL2-Rückfall bootet eine LEBENDE, sichtbare Welt; die WGSL-Konsumenten + Bundles ruhen hinter der EINEN Backend-Wand, der Rückfall ist LAUT benannt, der Fern-Ring trägt auf CPU."
    );
    process.exit(0);
})().catch((e) => {
    console.error("WebGL-Probe-Fehler:", (e && e.stack) || e);
    process.exit(2);
});
