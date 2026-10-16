#!/usr/bin/env node
// ─────────────────────────────────────────────────────────────────────────
// diag-webgl-probe.cjs — DIE KEIN-WEBGPU-BOOT-PROBE (gate:webgl-probe, 18.07.)
//
// Der r184-WebGPURenderer fällt ohne Adapter (oder via forceWebGL) STILL auf
// den WebGL2-Backend zurück. Bis heute war diese Geschichte UNBEWIESEN: die
// WGSL-Konsument (der Fullscreen-Feld-Pass) und die Render-
// Bundles existieren als KLASSEN auch dort weiter — Existenz-Prüfungen sind
// blind (die V18.267-Falle in GPU-Form). Diese Probe erzwingt den Rückfall
// (window.__anazhForceWebGL → der EINE Hook, alle 5 Renderer-Münzstellen)
// und beweist auf echtem (swiftshader-)GL:
//   W1 der Backend IST WebGL (der Hook wirkt; isWebGPURenderer bliebe true)
//   W2 der Rückfall wird EINMAL LAUT benannt (WARN „WebGL2-Rückfall") —
//      fail-soft wäre der Bruch (Schöpfer-Wort 17.07.)
//   W3 die Wände halten: kein Feld-Pass ·
//      keine Region-RenderBundles (deren API lebt nur im WebGPU-Backend)
//   W4 der Fern-Ring verfeinert auf CPU (cursor wandert — das Gesetz trägt)
//   W5 die Welt LEBT: Loop-Ticks laufen, der Spieler steht auf endlicher
//      Position, der Canvas nach einem echten Frame trägt SUBSTANZ
//      (distinkte Farben, nicht schwarz) ohne einen einzigen page-error —
//      „Wer kein WebGPU-Backend bekommt, sieht eine Welt, keine Lüge."
//   W6 (Karte W3, 16.10., ?holz=voll mit Schatten): jedes GELINKTE GL-Programm eines Stoffs trägt je Stufe ≤ min(16, Gerät)
//      aktive Sampler-Einheiten (getActiveUniform, nie Textur-Objekte) und linkt — sonst ROT beim Namen mit Info-Log;
//      Selbsttest: ein Stoff mit 17 Karten zählt 17 (am Gerät mit 16 linkt er nicht: sein Shader-Fehler ist der Selbsttest)
//   node scripts/diag-webgl-probe.cjs
// ─────────────────────────────────────────────────────────────────────────

const { statikServer, starteBrowser, selbsttest } = require("./lib/welt-boot.cjs");
const PORT = Number(process.env.WGLP_PORT || 4671);
const server = statikServer();

(async () => {
    await new Promise((r) => server.listen(PORT, "127.0.0.1", r));
    const browser = await starteBrowser({ art: "webgl", frist: 300000 });
    const page = await browser.newPage();
    await page.evaluateOnNewDocument(() => {
        window.__anazhForceWebGL = true; // der EINE Hook — echter Renderer, erzwungener WebGL2-Backend
    });
    const pageErrors = [];
    const consoleLines = [];
    page.on("pageerror", (e) => pageErrors.push((e.stack || e.message || String(e)).split("\n")[0]));
    page.on("console", (m) => consoleLines.push(m.text()));
    await page.goto(`http://127.0.0.1:${PORT}/index.html?holz=voll`, { waitUntil: "domcontentloaded", timeout: 60000 });
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
            // Der Substanz-Schuss liest, was der Spieler SIEHT: den Canvas nach einem echten Frame (`_loopRender`), Frame für Frame
            // bis Substanz steht (Ereignis-Zeit, ≤ 120 Frames). Bis W3 ein Einmal-Render in ein eigenes Ziel (neuer Render-Kontext,
            // seine Pipelines baut die Erst-Zeichnung asynchron): auf der Radeon schwarz, standen sie nach 6 s Wanduhr nicht.
            const cam = st.camera, rend = st.renderer; // prettier-ignore
            const c2 = Object.assign(document.createElement("canvas"), { width: 96, height: 64 }).getContext("2d", { willReadFrequently: true }); // prettier-ignore
            for (o.schussFrames = 1; o.schussFrames <= 120; o.schussFrames++) {
                if (rend._nodes && rend._nodes.nodeFrame) rend._nodes.nodeFrame.update();
                r._loopRender(performance.now());
                c2.drawImage(rend.domElement, 0, 0, 96, 64);
                const u8 = c2.getImageData(0, 0, 96, 64).data, set = new Set(); // prettier-ignore
                o.nonzero = 0;
                for (let i = 0; i < u8.length; i += 4) {
                    set.add(((u8[i] >> 4) << 8) | ((u8[i + 1] >> 4) << 4) | (u8[i + 2] >> 4));
                    if (u8[i] + u8[i + 1] + u8[i + 2] > 12) o.nonzero++;
                }
                o.farben = set.size;
                if (o.farben >= 4 && o.nonzero > 200) break;
                await new Promise((res) => requestAnimationFrame(res));
            }
            // W6 (Karte W3): die Sampler-EINHEITEN des GELINKTEN GL-Programms je Stoff und Stufe — was GL zählt (aktive
            // Sampler-Uniforms × Feldgröße, je Stufe, in der sie deklariert sind), nie die Textur-Objekte des Stoffs; ein Programm,
            // das nicht linkt, steht mit seinem Info-Log beim Namen. Auch der verborgene Stoff zählt (der Fern-Ring nach Refresh).
            const gl = be.gl;
            o.grenze = [0, gl.MAX_VERTEX_TEXTURE_IMAGE_UNITS, gl.MAX_TEXTURE_IMAGE_UNITS].map((p) => Math.min(16, p ? gl.getParameter(p) : 0)); // prettier-ignore
            window.__w6Zensus = async (wurzel, m = new Map(), verborgen = []) => {
                wurzel.traverse((ob) => ob.visible || verborgen.push(ob));
                verborgen.forEach((ob) => (ob.visible = true));
                await rend.compileAsync(wurzel, cam);
                verborgen.forEach((ob) => (ob.visible = false));
                wurzel.traverse((ob) => (ob.__renderObjekte || []).forEach((ro) => {
                    const p = ro.pipeline && be.get(ro.pipeline).pipeline; // gesetzt, wenn r184 den Link abgeschlossen hat
                    if (!p) return;
                    const linkt = gl.getProgramParameter(p, gl.LINK_STATUS) === true;
                    const aktiv = linkt ? Array.from({ length: gl.getProgramParameter(p, gl.ACTIVE_UNIFORMS) }, (_, i) => gl.getActiveUniform(p, i)) : []; // prettier-ignore
                    const karten = Object.fromEntries(ro.getBindings().flatMap((g) => g.bindings.filter((x) => x.isSampledTexture).map((x) => [x.name, (x.texture && x.texture.name) || x.name]))); // prettier-ignore
                    for (const [s, q] of [[1, ro.pipeline.vertexProgram.code], [2, ro.pipeline.fragmentProgram.code]]) {
                        const hier = [...String(q).matchAll(/^\s*uniform\s+(?:\w+\s+)?[iu]?sampler\w*\s+(\w+)/gm)].map((x) => x[1]);
                        const n = linkt ? aktiv.filter((u) => hier.includes(u.name.replace(/\[\d+\]$/, ""))).reduce((a, u) => a + u.size, 0) : hier.length; // prettier-ignore
                        const k = `${ro.material.name || ro.material.type + "#" + ro.material.id} ${s === 1 ? "vertex" : "fragment"}`; // prettier-ignore
                        const wo = `${ob.name || ob.userData.inventar || ob.type}: ${linkt ? hier.map((h) => karten[h] || h).join(", ") : "LINKT NICHT — " + String(gl.getProgramInfoLog(p)).trim()}`; // prettier-ignore
                        if (!(m.has(k) && m.get(k)[1] >= n && m.get(k)[4])) m.set(k, [k, n, s, wo, linkt]);
                    }
                })); // prettier-ignore
                return [...m.values()].sort((a, c) => c[1] - a[1]);
            };
            o.zensus = await window.__w6Zensus(st.scene);
        } catch (e) {
            o.err = (e && e.message) || String(e);
        }
        return o;
    });
    // W6-Selbsttest: ein Stoff mit 17 Karten — am Gerät mit 16 Einheiten linkt er nicht (sein Shader-Fehler ist der Selbsttest)
    selbsttest("W6: der Stoff mit 17 Karten");
    out.selbst = await page.evaluate(async () => {
        const T = THREE, sm = new T.MeshBasicNodeMaterial({ name: "selbsttest:17-karten" });
        sm.colorNode = Array.from({ length: 17 }, () => T.TSL.texture(new T.DataTexture(new Uint8Array(4), 1, 1)).rgb).reduce((a, c) => a.add(c)); // prettier-ignore
        return (await window.__w6Zensus(new T.Scene().add(Object.assign(new T.Mesh(new T.PlaneGeometry(), sm), { frustumCulled: false })))).find((z) => z[0] === "selbsttest:17-karten fragment"); // prettier-ignore
    }).catch(() => null);
    await browser.close();
    server.close();

    const lautEcht = consoleLines.some((l) => l.includes("WebGL2-Rückfall"));
    console.log("=== KEIN-WEBGPU-BOOT-PROBE (forceWebGL, echter swiftshader-GL) ===");
    console.log(`  W1 Backend WebGL: ${out.backendWebGL} · rendererType: ${out.rendererType}`);
    console.log(`  W2 LAUT benannt (WARN WebGL2-Rückfall): ${lautEcht}`);
    console.log(
        `  W3 Wände: feldPassRuht=${out.feldPassRuht} bundlesRuhen=${out.bundlesRuhen} computeFaehig=${out.computeFaehig}`
    );
    console.log(`  W4 Fern-Ring: da=${out.fernRingDa} cursor=${out.fernRingCursor} (CPU-Gesetz wandert)`);
    console.log(
        `  W5 Welt lebt: tickOk=${out.tickOk}/12 frames=${out.frames} spielerEndlich=${out.spielerEndlich} · Substanz farben=${out.farben} nonzero=${out.nonzero} im Frame ${out.schussFrames}${out.tickErr ? " tickErr=" + out.tickErr : ""}`
    );
    const z = out.zensus || [];
    console.log(`  W6 Sampler je Stoff (Grenze vertex ${out.grenze && out.grenze[1]} · fragment ${out.grenze && out.grenze[2]}), ${z.length} Stoff-Stufen:`); // prettier-ignore
    for (const [k, n, , wo] of z.slice(0, 6)) console.log(`     ${String(n).padStart(2)} ${k} — ${wo}`);
    if (out.err) console.log(`  Probe-Fehler: ${out.err}`);
    if (pageErrors.length) console.log("  Seiten-Fehler:", pageErrors.slice(0, 5));

    const errs = [];
    if (out.err) errs.push(`Probe brach ab: ${out.err}`);
    if (!out.rendererReady) errs.push("W1: der Renderer wurde nie ready (init hing)");
    if (!out.backendWebGL) errs.push("W1: der Backend ist NICHT WebGL (der forceWebGL-Hook wirkt nicht)");
    if (out.rendererType !== "webgl-fallback")
        errs.push(`W1: rendererType meldet "${out.rendererType}" statt "webgl-fallback" (Telemetrie lügt)`);
    if (!lautEcht) errs.push("W2: der Rückfall wurde NICHT laut benannt (kein WebGL2-Rückfall-WARN)");
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
    for (const [k, n, s, wo, linkt] of z) if (n > out.grenze[s] || !linkt) errs.push(`W6: ${k} ${linkt ? "linkt" : "LINKT NICHT"} mit ${n} Sampler-Einheiten (Gerät ${out.grenze[s]}) — ${wo}`); // prettier-ignore
    if (!(z.length > 4 && out.selbst && out.selbst[1] === 17)) errs.push(`W6-Selbsttest: der Stoff mit 17 Karten zählt ${out.selbst && out.selbst[1]} Einheiten (${z.length} Stoffe) — die Linse ist blind`); // prettier-ignore
    else console.log(`  W6-Selbsttest: der Stoff mit 17 Karten ${out.selbst[4] ? "linkt" : "LINKT NICHT"} mit ${out.selbst[1]} Einheiten — die Linse nennt ihn`); // prettier-ignore
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
