#!/usr/bin/env node
// ─────────────────────────────────────────────────────────────────────────
// diag-webgl-probe.cjs — DIE KEIN-WEBGPU-BOOT-PROBE (gate:webgl-probe)
//
// Der r184-WebGPURenderer fällt ohne Adapter (oder via forceWebGL) STILL auf den WebGL2-Backend zurück; die WGSL-Konsumenten
// (der Feld-Pass) und die Render-Bundles existieren als KLASSEN auch dort — Existenz-Prüfungen sind blind (die Falle
// in GPU-Form). Die Probe erzwingt den Rückfall (window.__anazhForceWebGL, der EINE Hook, alle 5 Renderer-Münzstellen) und
// beweist auf echtem GL (die CI swiftshader, lokal die Karte):
//   W1 der Backend IST WebGL (der Hook wirkt; isWebGPURenderer bliebe true)
//   W2 der Rückfall wird EINMAL LAUT benannt (WARN „WebGL2-Rückfall") — fail-soft wäre der Bruch
//   W3 die Wände halten: kein Feld-Pass · keine Geometrie-Arena (laut: `__arenaOhne`) · keine Region-RenderBundles
//   W4 der Fern-Ring verfeinert auf CPU (cursor wandert — das Gesetz trägt)
//   W5 die Welt LEBT: Loop-Ticks laufen, der Spieler steht endlich, der Canvas nach einem echten Frame trägt SUBSTANZ (nicht
//      schwarz) ohne page-error, und jedes Programm, das das Spiel baut, linkt — sonst ROT beim Stoff-Namen mit Info-Log im
//      Fehler-Sammler (r184 nennt es namenlos) — „Wer kein WebGPU-Backend bekommt, sieht eine Welt, keine Lüge."
//   W6 (Karten W3 + S5, ?holz=voll mit Schatten): jeder Stoff trägt je Stufe ≤ min(16, Gerät) Sampler-EINHEITEN, wie
//      GL sie zählt (aktive Sampler × Feldgröße, nie Textur-Objekte), gezählt im GLSL OHNE Link (swiftshader linkt je Programm
//      20–48 s); Selbsttests: ein Stoff mit 17 Karten fällt beim Namen, ein linkender Zensus ist ROT (r184-Drift)
//   node scripts/diag-webgl-probe.cjs
// ─────────────────────────────────────────────────────────────────────────

const { statikServer, starteBrowser, hauptLauf, sleep } = require("./lib/welt-boot.cjs");
const server = statikServer();

hauptLauf(async () => {
    await server.lausche(0);
    const browser = await starteBrowser({ art: "webgl", frist: 300000 });
    const page = await browser.newPage();
    await page.evaluateOnNewDocument(() => {
        window.__anazhForceWebGL = true; // der EINE Hook — echter Renderer, erzwungener WebGL2-Backend
    });
    const consoleLines = [];
    page.on("console", (m) => consoleLines.push(m.text()));
    await server.zeige(page, 60000, "index.html?holz=voll");
    await page.evaluate(async () => {
        await window.__weltDa(() => r && r.state && r.state.rendererReady === true); // prettier-ignore
        // W5: ein Programm, das nicht linkt, steht beim Stoff-Namen im Fehler-Sammler — ab dem ersten Frame, den das Spiel zeichnet
        const st = r && r.state, rend = st && st.renderer, be = rend && rend.backend; // prettier-ignore
        if (!be || !be.gl) return;
        window.__linktNicht = [];
        rend.debug.onShaderError = (gl, prog) => {
            const pl = [...rend._pipelines.caches.values()].find((p) => be.get(p).programGPU === prog);
            let wer = `Programm ${pl && pl.fragmentProgram.name}`;
            st.scene.traverse((ob) => (ob.__renderObjekte || []).forEach((ro) => ro.pipeline && ro.pipeline === pl && (wer = `${ro.material.name || ro.material.type + "#" + ro.material.id} (${ob.name || ob.userData.inventar || ob.type})`))); // prettier-ignore
            window.__linktNicht.push(`W5: ${wer} LINKT NICHT — ${String(gl.getProgramInfoLog(prog)).trim()}`);
            console.error(window.__linktNicht.at(-1));
        };
    });
    // Die Welt einige Sekunden LEBEN lassen (der natürliche Loop läuft; swiftshader-GL ist zäh).
    await sleep(6000);
    const out = await page.evaluate(async () => {
        const o = { err: null };
        try {
            const be = st.renderer && st.renderer.backend;
            o.rendererReady = st.rendererReady === true;
            o.backendWebGL = !!(be && be.isWebGPUBackend !== true && be.isWebGLBackend === true);
            o.rendererType = r._flightRecorderDevice().rendererType;
            if (st.renderer) st.renderer.setAnimationLoop(null); // der Loop ruht, die Probe pumpt (Lehre 17): kein Frame linkt dazwischen
            // W5 — der Substanz-Schuss liest, was der Spieler SIEHT: den Canvas nach einem echten Frame (`_loopRender`), Frame für
            // Frame bis Substanz steht (Ereignis-Zeit, ≤ 120 Frames; bis W3 ein Einmal-Render in ein eigenes Ziel, auf der Radeon
            // schwarz). Er kommt ZUERST: ein Pixel-Lesen wartet auf jede GPU-Arbeit davor — hinter 12 gepumpten Takten stand er
            // auf swiftshader bis 160 s, hinter den Frames des ruhenden Loops kostet er seinen eigenen Frame.
            const cam = st.camera, rend = st.renderer; // prettier-ignore
            const c2 = Object.assign(document.createElement("canvas"), { width: 96, height: 64 }).getContext("2d", { willReadFrequently: true }); // prettier-ignore
            for (o.schussFrames = 1; o.schussFrames <= 120; o.schussFrames++) {
                if (rend._nodes && rend._nodes.nodeFrame) rend._nodes.nodeFrame.update();
                r._loopRender();
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
            // W3 — die Wände:
            o.feldPassRuht = !st.feldPass;
            o.bundlesRuhen = !st._regionBundles || st._regionBundles.size === 0;
            o.computeFaehig = r._gpuComputeFaehig(); // MUSS false sein (die Wand-Quelle selbst)
            o.arenaRueckfall = r.constructor.__arenaOhne === "WebGL2" && !(r.constructor.__arenen || new Map()).size;
            // W4 — der Fern-Ring verfeinert auf CPU: der Takt des Rings bestellt beim Fern-Faden und hängt seine Antwort ein, bis die
            // erste Scheibe hängt — das Ereignis, nie die Wanduhr (Lehre 26; bis ci-wackler-zensus 60 Takte ohne Pause nach 6 s
            // Schlaf: unter Last war noch keine Antwort da, cursor 0). Ein Faden, der nie antwortet, steht in der Stall-Akte.
            const pm = st.playerMesh;
            await window.__weltDa(() => (r._tickFernRing(pm.position), (st.fernRing || {}).cursor > 0));
            o.fernRingDa = !!st.fernRing;
            o.fernRingCursor = st.fernRing.cursor; // der Ring steht: auf ihn wartete W4
            // W5 — die Welt lebt: den Loop DETERMINISTISCH pumpen (swiftshader-GL schafft natürliche rAF-Frames nur im
            // Sekundentakt — Wanduhr-Frames wären ein Software-Raster-Artefakt, keine Mechanik-Wahrheit).
            o.tickOk = 0;
            for (let i = 0; i < 12; i++) {
                try {
                    r._gameLoopTick(performance.now());
                    o.tickOk++;
                } catch (_e) {
                    o.tickErr = (_e && _e.message) || String(_e);
                }
                await sleep(50);
            }
            o.frames = st.flightRecorder ? st.flightRecorder.frames : 0;
            o.spielerEndlich = !!pm && [pm.position.x, pm.position.y, pm.position.z].every(Number.isFinite);
            // W6 (Karten W3 + S5): die Sampler-EINHEITEN je Stoff und Stufe, wie GL sie zählt — aktive Sampler-Uniforms
            // × Feldgröße, nie die Textur-Objekte des Stoffs — aus dem GLSL der Stufe, OHNE zu linken: aktiv ist ein
            // Sampler, den die Stufe nach seiner Deklaration liest (den Rest streicht der Treiber; belegt am echten
            // Link der Radeon, GLSL = getActiveUniform je Programm). compileAsync baut je Stoff nur das GLSL, seine
            // Pipeline (eigene Versprechen-Liste, nie E.neu der Welt) baut erst der echte Draw — swiftshader linkt je
            // Programm 20–48 s synchron, der linkende Zensus der ganzen Szene riss die 300-s-Frist; den Link prüft W5,
            // wo das Spiel ihn baut. Auch der verborgene Stoff zählt.
            const gl = be.gl;
            o.grenze = [0, gl.MAX_VERTEX_TEXTURE_IMAGE_UNITS, gl.MAX_TEXTURE_IMAGE_UNITS].map((p) => Math.min(16, p ? gl.getParameter(p) : 0)); // prettier-ignore
            const aktiv = (q) => [...String(q).matchAll(/^\s*uniform\s+(?:\w+\s+)?[iu]?sampler\w*\s+(\w+)\s*(?:\[(\d+)\])?/gm)].filter((d) => String(q).split(new RegExp(`\\b${d[1]}\\b`)).length > 2); // prettier-ignore
            const P = rend._pipelines, link = P.getForRender.bind(P), weltNeu = r._erstZeichnungStand().neu, ohneLink = []; // prettier-ignore
            const zensus = async (wurzel, m = new Map(), verborgen = []) => {
                wurzel.traverse((ob) => ob.visible || verborgen.push(ob));
                verborgen.forEach((ob) => (ob.visible = true));
                P.getForRender = (ro, v) => (Array.isArray(v) && v !== weltNeu ? void ohneLink.push(ro) : link(ro, v));
                await rend.compileAsync(wurzel, cam).finally(() => delete P.getForRender);
                verborgen.forEach((ob) => (ob.visible = false));
                wurzel.traverse((ob) => (ob.__renderObjekte || []).forEach((ro) => {
                    const karten = Object.fromEntries(ro.getBindings().flatMap((g) => g.bindings.filter((x) => x.isSampledTexture).map((x) => [x.name, (x.texture && x.texture.name) || x.name]))); // prettier-ignore
                    for (const [s, q] of [[1, ro.getNodeBuilderState().vertexShader], [2, ro.getNodeBuilderState().fragmentShader]]) {
                        const hier = aktiv(q), n = hier.reduce((a, d) => a + Number(d[2] || 1), 0); // prettier-ignore
                        const k = `${ro.material.name || ro.material.type + "#" + ro.material.id} ${s === 1 ? "vertex" : "fragment"}`; // prettier-ignore
                        if (!(m.has(k) && m.get(k)[1] >= n)) m.set(k, [k, n, s, `${ob.name || ob.userData.inventar || ob.type}: ${hier.map((d) => karten[d[1]] || d[1]).join(", ")}`]); // prettier-ignore
                    }
                })); // prettier-ignore
                return [...m.values()].sort((a, c) => c[1] - a[1]);
            };
            o.zensus = await zensus(st.scene);
            // W6-Selbsttest: ein Stoff mit 17 Karten fällt im Urteil beim Namen (er linkt nie: kein Shader-Fehler, keine Marke)
            const T = THREE, sm = new T.MeshBasicNodeMaterial({ name: "selbsttest:17-karten" });
            sm.colorNode = Array.from({ length: 17 }, () => T.TSL.texture(new T.DataTexture(new Uint8Array(4), 1, 1)).rgb).reduce((a, c) => a.add(c)); // prettier-ignore
            o.selbst = await zensus(new T.Scene().add(Object.assign(new T.Mesh(new T.PlaneGeometry(), sm), { frustumCulled: false }))); // prettier-ignore
            o.ohneLink = ohneLink.length;
            o.linktNicht = window.__linktNicht || ["W5: der Link-Hörer fehlt (kein WebGL-Backend beim Start)"];
        } catch (e) {
            o.err = (e && e.message) || String(e);
        }
        return o;
    });
    await browser.close();
    server.close();

    const lautEcht = consoleLines.some((l) => l.includes("WebGL2-Rückfall"));
    console.log("=== KEIN-WEBGPU-BOOT-PROBE (forceWebGL, echtes GL: swiftshader oder die Karte) ===");
    console.log(`  W1 Backend WebGL: ${out.backendWebGL} · rendererType: ${out.rendererType}`);
    console.log(`  W2 LAUT benannt (WARN WebGL2-Rückfall): ${lautEcht}`);
    console.log(
        `  W3 Wände: feldPassRuht=${out.feldPassRuht} bundlesRuhen=${out.bundlesRuhen} computeFaehig=${out.computeFaehig} arenaRueckfall=${out.arenaRueckfall}`
    );
    console.log(`  W4 Fern-Ring: da=${out.fernRingDa} cursor=${out.fernRingCursor} (CPU-Gesetz wandert)`);
    console.log(
        `  W5 Welt lebt: tickOk=${out.tickOk}/12 frames=${out.frames} spielerEndlich=${out.spielerEndlich} · Substanz farben=${out.farben} nonzero=${out.nonzero} im Frame ${out.schussFrames}${out.tickErr ? " tickErr=" + out.tickErr : ""}`
    );
    const z = out.zensus || [];
    console.log(`  W6 Sampler je Stoff (Grenze vertex ${out.grenze && out.grenze[1]} · fragment ${out.grenze && out.grenze[2]}), ${z.length} Stoff-Stufen, ${out.ohneLink} Zensus-Pipelines ohne Link:`); // prettier-ignore
    for (const [k, n, , wo] of z.slice(0, 6)) console.log(`     ${String(n).padStart(2)} ${k} — ${wo}`);
    if (out.err) console.log(`  Probe-Fehler: ${out.err}`);

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
    if (!out.arenaRueckfall) errs.push("W3: die Geometrie-Arena fiel nicht laut zurück (`__arenaOhne`), oder sie lebt auf WebGL");
    if (!out.fernRingDa || !(out.fernRingCursor > 0))
        errs.push(`W4: der Fern-Ring verfeinert nicht (da=${out.fernRingDa}, cursor=${out.fernRingCursor})`);
    if (out.tickOk !== 12) errs.push(`W5: Loop-Ticks warfen (${out.tickOk}/12${out.tickErr ? ": " + out.tickErr : ""})`);
    if (!(out.frames >= 1)) errs.push(`W5: kein einziger Frame lief (frames=${out.frames})`);
    if (!out.spielerEndlich) errs.push("W5: die Spieler-Position ist nicht endlich");
    if (!(out.farben >= 4 && out.nonzero > 200))
        errs.push(`W5: der Render hat keine SUBSTANZ (farben=${out.farben}, nonzero=${out.nonzero}) — schwarze Welt?`);
    errs.push(...(out.linktNicht || []));
    const w6 = (liste) => liste.filter(([, n, s]) => n > out.grenze[s]).map(([k, n, s, wo]) => `W6: ${k} trägt ${n} Sampler-Einheiten > ${out.grenze[s]} — ${wo}`); // prettier-ignore
    errs.push(...w6(z));
    const selbst = w6(out.selbst || []); // dasselbe Urteil am eigenen Täter: genau er, beim Namen, mit 17
    if (!(z.length > 4 && selbst.length === 1 && selbst[0].startsWith("W6: selbsttest:17-karten fragment trägt 17 "))) errs.push(`W6-Selbsttest: der Stoff mit 17 Karten fällt nicht beim Namen (${selbst.join(" · ") || "kein Urteil"}; ${z.length} Stoffe) — die Linse ist blind`); // prettier-ignore
    else console.log(`  W6-Selbsttest ROT am Täter: ${selbst[0]}`);
    if (!(out.ohneLink > 0)) errs.push("W6: der Zensus linkt (compileAsync fragt seine Pipeline anders als mit eigener Versprechen-Liste — r184-Drift)"); // prettier-ignore

    require("./lib/welt-boot.cjs").wandEnde(errs, "die Kein-WebGPU-Geschichte ist BEWIESEN: der erzwungene WebGL2-Rückfall bootet eine LEBENDE, sichtbare Welt; die WGSL-Konsumenten + Bundles ruhen hinter der EINEN Backend-Wand, der Rückfall ist LAUT benannt, der Fern-Ring trägt auf CPU.");
});
