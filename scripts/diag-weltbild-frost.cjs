// diag-weltbild-frost.cjs — DIE FROST-WAND (gate:weltbild-frost): jede Bühne (Werkstatt · Ich · Hof · Feed) ist ein eigenes
// WebGPU-Backend, das Geometrie und Stoffe mit der Welt teilt; das Backend-Gesetz (`_backendGesetz`: schmaler Index ·
// Index-Wache · GPU-Wache) gilt an jedem. Die Chronik der Befunde steht in git.
//
// Je Schritt (Werkstatt mit Eiche · Tab/Ich-Bühne · Hof-Bühne) prüft die Wand am ECHTEN Renderer (der Null-Renderer ist blind):
//   I  DER INDEX-ZENSUS: jeder Index-Puffer der Welt-GPU trägt das Format, das der Draw bindet (Bytes des Arrays ≤ Puffer)
//   G  kein WebGPU-Validierungsfehler auf irgendeinem Device (eigener Hörer, unabhängig vom Spiel: `uncapturederror` jedes
//      Device UND die THREE-Konsolenzeile, mit der r184 eine Validierung aus seinem offenen Pipeline-Fehler-Bereich meldet)
//   W  die Wachen des Spiels stehen und schweigen (`_indexWache` · `_gpuWache`)
//   B  DAS BILD FOLGT: zwei Bilder bei gedrehter Kamera unterscheiden sich in ≥ 5 % der 16×16-Blöcke (echt: der präsentierte
//      Canvas; headless: das Rücklese-Bild der Welt-GPU)
// Dann DIE ENTSORGUNG DER BÜHNEN (dieselbe Klasse: geteilte Geometrie und Stoffe über Renderer-Grenzen; `_disposeSoulGroup`
// ist die EINE Regel jeder Gruppe, die Welt-Vorlagen teilt, `_ofenVorlage` sagt, was eine Gruppe besitzt):
//   S1 der Spielerpfad (jede Tetrapoda-Art↔human; der Mitspieler empfängt jede Seele, dann sein Abschied) und die Hof-Bühne
//      entsorgen keine Welt-Geometrie, keinen Welt-Stoff; je Seele tragen Ich-Bühne und Mitspieler (S4) den Leib der Welt
//   S2 keine GPU kompiliert dabei nach (Welt, Ich-, Hof-Bühne je ≤ 2 Module/Pipelines gegen die geschlossene Bühne): der
//      Knoten-Bau einer Seele überlebt die Lösung des Leibs, der ihn eben noch teilte
//   S3 die Feed-Vorschau (4 Wesen + eine Rezept-Karte) entsorgt keine Welt-Geometrie, keinen Welt-Stoff
//   S5 der Werkstatt-Ofen, Regler-Zug 20 Werte: kein Einzelstück im Ofen-Memo, Grafikspeicher und Geometrie-Zahl der
//      Werkstatt, die dispose-Hörer der geteilten Stoffe und der JS-Speicher bleiben beschränkt (kein Welt-Satz verdichtet darin)
//   S6 10 Mitspieler-Erscheinungen und ihr Abschied: das Ofen-Memo hält danach höchstens OFEN_MEMO_RUHEND Vorlagen ohne
//      Leib, der JS-Speicher fällt zurück
//   P2 kein writeBuffer der Seite schief, auch kein Uint16-Index ungerader Länge der Ich-Bühne
// Danach DIE TÄTER (jeder Lauf — die Wand beweist sich selbst):
//   T1 ein Probe-Mesh zeichnet einen Index ≥ seiner Vertex-Zahl → die Index-Wache nennt es („bereich")
//   T2 ein Mensch-Index wird geweitet wie von einem fremden Backend → die Index-Wache nennt ihn („format") beim Pfad, die
//      GPU-Wache des Spiels und der eigene Hörer zählen, und die Bild-Probe sagt BILD STEHT
//   T3 ein writeBuffer von 6 Bytes → WebGPU wirft, die Puffer-Wache nennt Puffer, Länge, Aufrufer
//
// Zwei Wege, derselbe Prüfer:
//   node scripts/diag-weltbild-frost.cjs          headless (swiftshader, ?holz=kienspan) — CI: der Spiel-Takt ruht, die
//                                                 Welt-GPU zeichnet die PROBE-BÜHNE:
//                                                 den Welt-Leib des Spielers (jede Seele des Seelenwechsels)
//   node scripts/diag-weltbild-frost.cjs --echt   sichtbares Chrome auf der echten GPU: der SPIELPFAD (Ankunft · dritte
//                                                 Person · Werkstatt · Tab · Hof) im laufenden Spiel, das Bild-Paar je Schritt
//   … [--bilder <ordner>]                         legt je Bild-Paar beide Bilder ab
//   … [--s5=frames | --s5=halde]                  Selbsttest S5: nur Welt-Frames statt Zügen (GRÜN) · jedes Einzelstück bleibt (ROT)
//   Port: WELTBILD_FROST_PORT (Standard 4426). Exit 0 grün · 1 rot · 2 Skript-Fehler.
"use strict";
const { statikServer, starteBrowser, selbsttest, hauptLauf, sleep, pruefer, wandEnde } = require("./lib/welt-boot.cjs");
const fs = require("fs");
const path = require("path");

const PORT = Number(process.env.WELTBILD_FROST_PORT || 4426);
const ECHT = process.argv.includes("--echt");
const S5_PROBE = (process.argv.find((a) => a.startsWith("--s5=")) || "").slice(5); // Selbsttest der S5-Basis: frames | halde
const BILDER = (() => {
    const i = process.argv.indexOf("--bilder");
    return i >= 0 ? path.resolve(process.argv[i + 1]) : null;
})();
// Anteil bewegter 16×16-Blöcke der Bildmitte, ab dem das Bild der Kamera folgt: eine Drehung bewegt 40–100 %, ein stehendes
// Bild unter der zeitlichen Kantenglättung zittert bis 1,4 % — die Schwelle liegt dazwischen mit Abstand.
const FOLGT_MIN = 0.05;
const server = statikServer();

const { errs: fehler, check } = pruefer();

// Der eigene Hörer: jedes GPUDevice der Seite (Welt und Bühnen) meldet jede Validierung hierher — unabhängig davon, ob
// das Spiel eine Wache trägt (an altem Code ist diese Zahl der Befund).
function geraeteHoerer() {
    if (typeof GPUAdapter === "undefined" || window.__frostHoer) return;
    const H = (window.__frostHoer = { devices: 0, n: 0, erste: [], bauOffen: 0, bereiche: 0, verloren: [] });
    // Wer hält eine Meldung zurück? Offene async Pipeline-Bauten und offene Fehler-Bereiche (aller Devices) — die
    // Täter-Probe nennt beide, wenn das Wort einer Validierung ausbleibt.
    const P = GPUDevice.prototype;
    // Was jedes Device kompiliert (am Device-Objekt gezählt): die Seelen-Probe misst so, ob die Welt-GPU neu kompiliert.
    const zaehle = (dev, art, d) => {
        (dev.__frostBau || (dev.__frostBau = { module: 0, pipelines: 0 }))[art]++;
        // die Namen der Pipelines (r184: `renderPipeline_<Stoff>_<id>`) — die Seelen-Probe nennt, WAS neu baut
        if (art === "pipelines") (dev.__frostNamen || (dev.__frostNamen = [])).push((d && d.label) || "?");
    };
    const modul = P.createShaderModule;
    P.createShaderModule = function (d) {
        zaehle(this, "module");
        return modul.call(this, d);
    };
    const pipe = P.createRenderPipeline;
    P.createRenderPipeline = function (d) {
        zaehle(this, "pipelines", d);
        return pipe.call(this, d);
    };
    const bau = P.createRenderPipelineAsync;
    if (bau)
        P.createRenderPipelineAsync = function (d) {
            zaehle(this, "pipelines", d);
            H.bauOffen++;
            const p = bau.call(this, d);
            p.then(
                () => H.bauOffen--,
                () => H.bauOffen--
            );
            return p;
        };
    const auf = P.pushErrorScope,
        zu = P.popErrorScope;
    P.pushErrorScope = function (f) {
        H.bereiche++;
        return auf.call(this, f);
    };
    P.popErrorScope = function () {
        H.bereiche--;
        return zu.call(this);
    };
    // DIE PUFFER-WACHE: WebGPU verlangt Versatz und Länge jedes writeBuffer in 4-Byte-Schritten
    const W = (H.puffer = { schief: [], n: 0 });
    const wb = GPUQueue.prototype.writeBuffer;
    GPUQueue.prototype.writeBuffer = function (buf, off, data, dOff, size) {
        W.n++;
        const bytes = (size ?? (data.length ?? data.byteLength) - (dOff | 0)) * (data.BYTES_PER_ELEMENT || 1);
        if ((off | 0) % 4 || bytes % 4) {
            const ruf = String(new Error().stack)
                .split("\n")
                .slice(2, 6)
                .map((z) => z.trim().replace(/^at |\?v=[^:]*|https?:\/\/[^/]+\//g, ""))
                .join(" < ");
            W.schief.push(`${buf.label} · ${data.constructor.name} · Versatz ${off} · ${bytes} B · ${ruf}`);
        }
        return wb.call(this, buf, off, data, dOff, size);
    };
    const rd = GPUAdapter.prototype.requestDevice;
    GPUAdapter.prototype.requestDevice = async function (d) {
        const dev = await rd.call(this, d);
        const nr = H.devices++;
        dev.lost.then((i) => H.verloren.push(`device ${nr}: ${i.reason} ${String(i.message).slice(0, 120)}`));
        dev.addEventListener("uncapturederror", (ev) => {
            H.n++;
            if (H.erste.length < 6)
                H.erste.push(
                    `device ${nr}: ` +
                        String((ev.error && ev.error.message) || ev.error)
                            .split("\n")[0]
                            .slice(0, 220)
                );
        });
        return dev;
    };
}

// Der Prüf-Raum in der Seite: `wurzel` (was die Welt-GPU zeichnet und der Zensus liest), `zeichne(n)` (n Bilder der Welt-
// GPU), `drehe()` (63° Gier), `leib` (der Welt-Leib, dessen Index der Täter T2 weitet), `leibWechsel()` (zeichnet ihn).
function pruefRaum(echt) {
    const r = window.anazhRealm;
    const T = window.THREE;
    const rend = r.state.renderer;
    const F = (window.__frostWand = { echt });
    // DAS EINE WARTEN AUF EINE BÜHNE (Werkstatt-Vorschau, Ich-, Hof-, Feed-Bühne), bis ihr Renderer `bis(Zeichnungen)` trägt:
    // der Deckel zählt einen Gang nur, wenn ihr Renderer bereit ist und ihr Gerät die eingereichte Arbeit abgegeben hat
    // (swiftshader kompiliert im GPU-Prozess, Compositor und Bühnen-Takt stehen derweil) — die Bühne urteilt in GPU-Ereignissen,
    // nie im Takt der Wanduhr (bis 25.10. zählte er je 50/200 ms, 20/180 s bis ROT); fehlt die Bühne, zählt er und nennt sie
    F.gezeichnet = (s) => (s && s.renderer ? s.renderer.info.render.calls : 0);
    F.buehne = async (name, holen, bis) => {
        let fragt = false;
        const offen = (s = holen()) =>
            !s || !s.rendererReady
                ? !!s
                : fragt || ((fragt = true), s.renderer.backend.device.queue.onSubmittedWorkDone().then(() => (fragt = false)), false);
        for (const weiter = window.__deckel(name, 400, offen); !bis(F.gezeichnet(holen())) && weiter(); )
            await sleep(50);
    };
    r.setCameraMode("third");
    // der Leib von JETZT: der Seelenwechsel (S1, `applyPlayerSoul`) ersetzt den Spieler-Leib, T2 weitet nie den alten
    Object.defineProperty(F, "leib", { get: () => r.state.playerMesh });
    if (echt) {
        F.wurzel = r.state.scene;
        // der Leib steht GANZ im Bild, bevor die Probe weiterwechselt (das Ereignis, nie die Uhr)
        F.leibWechsel = async () => {
            for (let fehlt = 1, weiter = window.__deckel("der Leib im Bild", 100); fehlt && weiter(); ) {
                await F.zeichne(1);
                fehlt = 0;
                r.state.playerMesh.traverseVisible(
                    (o) => (fehlt += o.isMesh && r.state.camera.layers.test(o.layers) && !r._erstZeichnung.gezeichnet.get(o))
                );
            }
        };
        F.zeichne = async (n) => {
            const info = rend.info.render;
            const a = info.calls;
            await sleep(600); // ein Bild steht mindestens 600 ms
            for (const weiter = window.__deckel("ein Bild", 2400); info.calls - a < n && weiter(); ) await sleep(50);
        };
        F.drehe = () => (r.state.yaw += 1.1);
        F.mittag = () => {
            r.state.timeOfDay = 0.5;
            if (r.state.world) r.state.world.timeOfDay = 0.5;
            r.state.pitch = -0.18;
        };
        return { weg: "spielpfad" };
    }
    rend.setAnimationLoop(null);
    const scene = new T.Scene();
    scene.background = new T.Color(0x6688aa);
    scene.add(new T.HemisphereLight(0xffffff, 0x445533, 2.2));
    const sonne = new T.DirectionalLight(0xffffff, 2.0);
    sonne.position.set(3, 6, 4);
    scene.add(sonne);
    const pivot = new T.Group();
    scene.add(pivot);
    // headless steht der Welt-Leib selbst auf der Probe-Bühne: `applyPlayerSoul` legt den neuen in die Welt-Szene,
    // `leibWechsel` holt ihn her
    let traeger = F.leib;
    pivot.add(traeger);
    // ein Ring farbiger Kisten auf dem Drehteller: die Drehung ändert die Bildmitte sichtbar
    for (let i = 0; i < 8; i++) {
        const k = new T.Mesh(
            new T.BoxGeometry(0.35, 0.5 + 0.15 * i, 0.35),
            new T.MeshStandardNodeMaterial({ color: new T.Color().setHSL(i / 8, 0.7, 0.5) })
        );
        const w = (i / 8) * Math.PI * 2;
        k.position.set(Math.cos(w) * 1.1, 0.3, Math.sin(w) * 1.1);
        pivot.add(k);
    }
    // auch der Welt-Leib vor seinem ersten Spawn (`_worldgenInitPlayerPosition` zeigt ihn erst dann)
    const zeigeAlles = (g) =>
        g.traverse((o) => {
            o.visible = true;
            o.frustumCulled = false;
        });
    zeigeAlles(pivot);
    const cam = new T.PerspectiveCamera(45, 16 / 9, 0.05, 100);
    // BÜHNE: eigene Szene des Frost-Bilds
    cam.position.set(0, 1.0, 3.0);
    cam.lookAt(0, 0.7, 0);
    F.wurzel = scene;
    F.leibWechsel = () => {
        pivot.remove(traeger);
        pivot.add((traeger = F.leib));
        zeigeAlles(traeger);
        F.bildSofort();
    };
    F.zeichne = async (n) => {
        for (let i = 0; i < n; i++) F.bildSofort();
        await rend.backend.device.queue.onSubmittedWorkDone();
        await sleep(50);
    };
    // ein Bild ohne auf die GPU zu warten: der Knoten-Bau, die Pipeline und das Render-Objekt entstehen synchron im render()
    // (swiftshader kompiliert synchron); das Warten teilt sich bei offener Bühne den CPU-Raster mit ihr (lokal ~1 s je Bild,
    // der CI-Runner riss damit das 45-min-Limit)
    F.bildSofort = () => {
        scene.updateMatrixWorld(true);
        rend.render(scene, cam);
    };
    // DAS BILD der Probe-Bühne: die Welt-GPU zeichnet in ein Ziel, das Ziel wird zurückgelesen (256 × 144, RGBA8, kein
    // Zeilen-Rand); headless fehlt die WebGPU-Leinwand im Bildschirm-Schuss — ein verworfener Befehlspuffer schreibt nichts.
    const ziel = new T.RenderTarget(256, 144);
    F.bild = async () => {
        scene.updateMatrixWorld(true);
        rend.setRenderTarget(ziel);
        rend.render(scene, cam);
        rend.setRenderTarget(null);
        const px = await rend.readRenderTargetPixelsAsync(ziel, 0, 0, 256, 144);
        return { d: new Uint8Array(px.buffer, px.byteOffset, 256 * 144 * 4), w: 256, h: 144 };
    };
    F.drehe = () => (pivot.rotation.y += 1.1);
    F.mittag = () => {};
    return { weg: "probe-buehne" };
}

hauptLauf(async () => {
    await server.lausche(PORT);
    const browser = await starteBrowser({
        art: ECHT ? "echt" : "linse",
        headless: !ECHT,
        frist: 1800000,
        viewport: ECHT ? { width: 1280, height: 720, deviceScaleFactor: 1 } : { width: 640, height: 360 },
        zusatz: ECHT ? ["--window-size=1300,820"] : [],
    });
    const page = await browser.newPage();
    const t0 = Date.now();
    const zeit = () => `+${Math.round((Date.now() - t0) / 1000)} s`;
    let konsole = 0;
    // Der zweite Weg einer Validierung: r184 fängt sie in seinem offenen Pipeline-Fehler-Bereich und meldet sie als
    // THREE-Konsolenzeile (nie als uncapturederror) — der eigene Hörer zählt auch diese (die Zeilen des Spiels nicht).
    const konsoleGpu = { n: 0, erste: [] };
    page.on("console", (m) => {
        const t = m.text();
        if (!t.startsWith("[AnazhRealm") && /does not fit in|\[Invalid [A-Za-z]+|\n\s*-\s*While /.test(t)) {
            konsoleGpu.n++;
            if (konsoleGpu.erste.length < 3) konsoleGpu.erste.push("konsole: " + t.split("\n")[0].slice(0, 200));
        }
        if (/INDEX-WACHE|GPU-VALIDIERUNG/.test(t) && konsole++ < 10) console.log("  [Spiel] " + t.slice(0, 260));
    });
    await page.evaluateOnNewDocument(geraeteHoerer);
    await server.zeige(page, 120000, `index.html${ECHT ? "" : "?holz=kienspan"}`);
    const boot = await page.evaluate(
        async ({ minChunks, echt }) => {
            for (const weiter = window.__deckel("das erste Weltbild", 1200); weiter(); ) {
                const r = window.anazhRealm;
                const st = r && r.state;
                // echt urteilt B den Canvas: erst mit dem ersten Weltbild (`_weltbildDa`) weicht der Ladeschirm; headless
                // urteilt das Rücklese-Bild der Welt-GPU, kein DOM — dort kostete das Warten 56 s und Gruppe 18 ihren 7-min-Deckel
                if (
                    st &&
                    st.rendererReady &&
                    st.playerMesh &&
                    !st._deferredAvatarSoul &&
                    st.voxelChunks &&
                    st.voxelChunks.size >= minChunks &&
                    (st._leibWarm || !echt)
                )
                    break;
                await sleep(300);
            }
            const r = window.anazhRealm;
            const rend = r && r.state && r.state.renderer;
            return {
                bereit: !!(r && r.state.rendererReady),
                webgpu: !!(rend && rend.backend && rend.backend.isWebGPUBackend === true),
                chunks: r && r.state.voxelChunks ? r.state.voxelChunks.size : -1,
                weltbild: r && r.state._weltbildDa ? `${(r.state._weltbildDa / 1000).toFixed(1)} s` : "fehlt",
                warm: !!(r && r.state._leibWarm),
            };
        },
        { minChunks: ECHT ? 25 : 9, echt: ECHT }
    );
    console.log(
        `=== DIE FROST-WAND (${ECHT ? "echte GPU" : "swiftshader, kienspan"}) — Boot ${zeit()} ${JSON.stringify(boot)} ===`
    );
    if (!boot.bereit || !boot.webgpu || (ECHT && !boot.warm)) {
        check("die Welt steht mit ihrem ersten Weltbild auf einem WebGPU-Backend", false, JSON.stringify(boot));
        await browser.close();
        server.close();
        process.exit(1);
    }
    if (BILDER) fs.mkdirSync(BILDER, { recursive: true });
    const raum = await page.evaluate(pruefRaum, ECHT);
    console.log(`  Prüf-Raum: ${JSON.stringify(raum)}`);

    const zeichne = (n) => page.evaluate((n) => window.__frostWand.zeichne(n), n);
    const clip = await page.evaluate(() => {
        const b = window.anazhRealm.state.renderer.domElement.getBoundingClientRect();
        return { x: b.x + b.width * 0.2, y: b.y + b.height * 0.22, width: b.width * 0.6, height: b.height * 0.5 };
    });
    const schuss = async (datei) => {
        const b64 = await page.screenshot({ clip, encoding: "base64" });
        if (datei) fs.writeFileSync(datei, Buffer.from(b64, "base64"));
        return b64;
    };
    // Der Vergleich zweier Bilder in der Seite: Block-Mittel 16×16 — die zeitliche Kantenglättung zittert über einem
    // stehenden Bild Pixel für Pixel (Laub: 6 % der Pixel), ihr Block-Mittel bleibt (0,1 % der Blöcke); eine Drehung bewegt
    // 70–97 % der Blöcke. Dazu das PNG eines Rücklese-Bilds für `--bilder`.
    await page.evaluate(() => {
        const F = window.__frostWand;
        F.blockAnteil = (A, B) => {
            const K = 16,
                bw = Math.floor(A.w / K),
                bh = Math.floor(A.h / K);
            let anders = 0;
            for (let by = 0; by < bh; by++)
                for (let bx = 0; bx < bw; bx++) {
                    let s = 0;
                    for (let c = 0; c < 3; c++) {
                        let ma = 0,
                            mb = 0;
                        for (let y = 0; y < K; y++)
                            for (let x = 0; x < K; x++) {
                                const i = ((by * K + y) * A.w + bx * K + x) * 4 + c;
                                ma += A.d[i];
                                mb += B.d[i];
                            }
                        s += Math.abs(ma - mb) / (K * K);
                    }
                    if (s > 12) anders++;
                }
            return anders / Math.max(1, bw * bh);
        };
        F.ladePng = async (s) => {
            const bin = atob(s);
            const u8 = new Uint8Array(bin.length);
            for (let i = 0; i < bin.length; i++) u8[i] = bin.charCodeAt(i);
            const bm = await createImageBitmap(new Blob([u8], { type: "image/png" }));
            const c = new OffscreenCanvas(bm.width, bm.height);
            const g = c.getContext("2d");
            g.drawImage(bm, 0, 0);
            return { d: g.getImageData(0, 0, bm.width, bm.height).data, w: bm.width, h: bm.height };
        };
        F.alsPng = async (B) => {
            const c = new OffscreenCanvas(B.w, B.h);
            const px = new Uint8ClampedArray(B.d);
            for (let i = 3; i < px.length; i += 4) px[i] = 255;
            c.getContext("2d").putImageData(new ImageData(px, B.w, B.h), 0, 0);
            const u8 = new Uint8Array(await (await c.convertToBlob({ type: "image/png" })).arrayBuffer());
            let s = "";
            for (let i = 0; i < u8.length; i++) s += String.fromCharCode(u8[i]);
            return btoa(s);
        };
    });
    // B — das Bild-Paar, dazwischen 63° Gier. Echt: der präsentierte Canvas (was der Spieler sieht). Headless: das
    // Rücklese-Bild der Welt-GPU (F.bild — der Linux-Runner setzt die WebGPU-Leinwand nicht in den Bildschirm-Schuss).
    const bildPaar = async (tag) => {
        if (!ECHT) {
            const r = await page.evaluate(async (mitPng) => {
                const F = window.__frostWand;
                const A = await F.bild();
                F.drehe();
                const B = await F.bild();
                return {
                    anteil: F.blockAnteil(A, B),
                    png: mitPng ? [await F.alsPng(A), await F.alsPng(B)] : null,
                };
            }, !!BILDER);
            if (r.png)
                r.png.forEach((s, i) =>
                    fs.writeFileSync(path.join(BILDER, `${tag}-${"ab"[i]}.png`), Buffer.from(s, "base64"))
                );
            return r.anteil;
        }
        await page.evaluate(() => window.__frostWand.mittag());
        await zeichne(8);
        const a = await schuss(BILDER && path.join(BILDER, tag + "-a.png"));
        await page.evaluate(() => window.__frostWand.drehe());
        await zeichne(8);
        const b = await schuss(BILDER && path.join(BILDER, tag + "-b.png"));
        return page.evaluate(
            async (a, b) => {
                const F = window.__frostWand;
                return F.blockAnteil(await F.ladePng(a), await F.ladePng(b));
            },
            a,
            b
        );
    };
    // I + G + W — der Index-Zensus der Welt-GPU, der eigene Hörer, die Wachen des Spiels.
    const lage = async () => {
        const l = await lageSeite();
        l.hoer += konsoleGpu.n;
        l.hoerErste = l.hoerErste.concat(konsoleGpu.erste);
        return l;
    };
    const lageSeite = () =>
        page.evaluate(() => {
            const r = window.anazhRealm;
            const be = r.state.renderer.backend;
            const kaputt = [];
            let n = 0,
                mensch = 0;
            window.__frostWand.wurzel.traverse((o) => {
                const g = o.geometry;
                if (!g || !g.index || !be.data.has(g.index)) return;
                const d = be.data.get(g.index);
                if (!d.buffer) return;
                n++;
                let pfad = [];
                for (let x = o; x && pfad.length < 6; x = x.parent) pfad.unshift(x.name || x.type);
                pfad = pfad.join("/");
                if (/mensch/.test(pfad)) mensch++;
                if (g.index.array.byteLength > d.buffer.size)
                    kaputt.push(
                        `${pfad} (Geometrie ${g.id}: ${g.index.count} × ${g.index.array.constructor.name} auf ${d.buffer.size} B)`
                    );
            });
            const H = window.__frostHoer;
            return {
                n,
                mensch,
                kaputt,
                hoer: H ? H.n : -1,
                hoerErste: H ? H.erste : [],
                bauOffen: H ? H.bauOffen : -1,
                bereiche: H ? H.bereiche : -1,
                verloren: H ? H.verloren : [],
                devices: H ? H.devices : -1,
                indexWache: r._indexWache ? { n: r._indexWache.n, brueche: r._indexWache.brueche.slice(0, 8) } : null,
                gpuWache: r._gpuWache ? { n: r._gpuWache.n } : null,
                wachenDa: typeof r._indexWacheDraw === "function" && typeof r._gpuWacheAn === "function",
            };
        });
    // Ein Schritt: tun, die Welt-GPU zeichnen lassen (die geteilten Gestalten im Bild), dann I · G · W — und B, wo das
    // Bild-Paar läuft (headless: am Anfang und nach der letzten Bühne; echt: je Schritt).
    const schritt = async (tag, tu, mitBild) => {
        const was = tu ? await tu() : null;
        const folgt = mitBild || ECHT ? await bildPaar(tag) : null;
        if (folgt === null) await zeichne(ECHT ? 8 : 2);
        const l = await lage();
        console.log(
            `\n[${tag}] ${zeit()} · ${was ? JSON.stringify(was) + " · " : ""}${folgt === null ? "" : `Bild ${(folgt * 100).toFixed(1)} % der Blöcke bewegt · `}${l.n} Index-Puffer (${l.mensch} Mensch) · Devices ${l.devices}`
        );
        if (folgt !== null)
            check(
                `${tag}: B das Bild folgt der Kamera`,
                folgt >= FOLGT_MIN,
                `${(folgt * 100).toFixed(2)} % der Blöcke (Soll ≥ ${FOLGT_MIN * 100} %)`
            );
        check(
            `${tag}: I jeder Index-Puffer der Welt-GPU trägt das gebundene Format`,
            l.kaputt.length === 0,
            l.kaputt.slice(0, 4).join(" | ")
        );
        check(
            `${tag}: G kein WebGPU-Validierungsfehler`,
            l.hoer === 0,
            l.hoer ? `${l.hoer} Meldungen: ${l.hoerErste.join(" | ")}` : ""
        );
        check(
            `${tag}: W die Wachen des Spiels stehen und schweigen`,
            l.wachenDa && (!l.indexWache || l.indexWache.n === 0) && (!l.gpuWache || l.gpuWache.n === 0),
            l.wachenDa ? JSON.stringify({ index: l.indexWache, gpu: l.gpuWache }) : "_indexWacheDraw/_gpuWacheAn fehlen"
        );
        return l;
    };
    const warteBuehne = (wer) =>
        page.evaluate(async (wer) => {
            const r = window.anazhRealm;
            const holen = () =>
                wer === "ich"
                    ? r.state.ichStage
                    : wer === "hof"
                      ? r.state.hofStage
                      : r.state.workshop && r.state.workshop.preview;
            await window.__frostWand.buehne("die Bühne", holen, (n) => n >= 2);
            const s = holen();
            let meshes = 0;
            if (s && s.scene) s.scene.traverse((o) => o.isMesh && meshes++);
            return { bühne: wer, gezeichnet: window.__frostWand.gezeichnet(s), meshes };
        }, wer);

    if (ECHT) await schritt("ankunft", null, true);
    const start = await schritt(ECHT ? "dritte-person" : "probe-buehne", null, true);
    check(
        "die Welt-GPU zeichnet einen Menschen (Mensch-Indizes auf der Welt-GPU)",
        start.mensch > 0,
        `${start.mensch} Mensch-Index-Puffer`
    );
    await schritt("werkstatt-eiche", async () => {
        const wahl = await page.evaluate(() => {
            const r = window.anazhRealm;
            r.toggleDrawer("werkstatt");
            if (r.state.blueprints && r.state.blueprints.baum_eiche)
                return r.selectBlueprintForEdit("baum_eiche") ? "baum_eiche" : null;
            return null;
        });
        const b = await warteBuehne("werkstatt");
        await page.evaluate(() => window.anazhRealm.closeAllDrawers());
        return { wahl, ...b };
    });
    await schritt("tab-ich-buehne", async () => {
        await page.evaluate(() => window.anazhRealm.toggleInventoryOverlay(true));
        const b = await warteBuehne("ich");
        await page.evaluate(() => window.anazhRealm.toggleInventoryOverlay(false));
        return b;
    });
    await schritt(
        "hof-buehne",
        async () => {
            await page.evaluate(() => window.anazhRealm.toggleDrawer("kreaturen"));
            const b = await warteBuehne("hof");
            await page.evaluate(() => window.anazhRealm.closeAllDrawers());
            return b;
        },
        true
    );

    // S — DIE ENTSORGUNG DER BÜHNEN: Ich-, Hof-, Feed-Bühne, Werkstatt-Ofen und Mitspieler-Leib bauen aus denselben Vorlagen
    // wie die Welt. Die Probe zählt je Phase jede Welt-Geometrie und jeden Welt-Stoff, den ein Wechsel SELBST in die
    // Entsorgungs-Schlange legt (echt streamt die Welt nebenher), und leert die Schlange wie `_loopRender`.
    await page.evaluate((echt) => {
        const r = window.anazhRealm;
        const F = window.__frostWand;
        const dev = r.state.renderer.backend.device;
        const welt = new Map();
        const pfad = (o) => {
            const t = [];
            for (let x = o; x && t.length < 6; x = x.parent) t.unshift(x.name || x.type);
            return t.join("/");
        };
        const sammle = (w) =>
            w.traverse((o) => {
                if (o.geometry && !welt.has(o.geometry)) welt.set(o.geometry, "Geometrie " + pfad(o));
                const ms = Array.isArray(o.material) ? o.material : o.material ? [o.material] : [];
                for (const m of ms) if (!welt.has(m)) welt.set(m, `Stoff ${m.name || m.type} an ${pfad(o)}`);
            });
        sammle(r.state.scene);
        if (F.wurzel !== r.state.scene) sammle(F.wurzel);
        const E = (window.__frostEntsorgung = { phase: null, je: {}, welt: welt.size });
        // echt ruht der Spiel-Takt für die Entsorgungs-Proben (Lehre 17: sonst baut die laufende Welt nebenher neu); die Welt-GPU zeichnet über
        // `_loopRender` (Bild + Kehraus + die Entsorgungs-Schlange), die Bühnen zeichnen in ihrem eigenen Takt weiter.
        if (echt) {
            r.state.renderer.setAnimationLoop(null);
            F.zeichneTakt = F.zeichne;
            F.zeichne = async (n) => {
                for (let i = 0; i < n; i++) {
                    r._loopRender();
                    await dev.queue.onSubmittedWorkDone();
                }
            };
        }
        const roh = r._queueDispose;
        r._queueDispose = function (obj) {
            const p = E.phase && (E.je[E.phase] || (E.je[E.phase] = { alle: 0, namen: [], objekte: new Set() }));
            if (p) {
                p.alle++;
                if (welt.has(obj)) {
                    p.namen.push(welt.get(obj));
                    p.objekte.add(obj);
                }
            }
            return roh.call(this, obj);
        };
        E.im = (phase, tu) => {
            E.phase = phase;
            try {
                return tu();
            } finally {
                E.phase = null;
            }
        };
        E.bericht = (phase) => {
            const p = E.je[phase] || { alle: 0, namen: [], objekte: new Set() };
            const geo = [...p.objekte].filter((o) => o.isBufferGeometry).length;
            return {
                alle: p.alle,
                welt: p.namen.length,
                geometrien: geo,
                stoffe: p.objekte.size - geo,
                namen: [...new Set(p.namen)].slice(0, 4),
            };
        };
        // Das Ende eines Frames wie `_loopRender`: der Kehraus (was kein Objekt des Graphen und kein Bild dieses Frames
        // zeichnet, verlässt die GPU — und mit ihr r184s Speicher-Buchung je Attribut) und die Entsorgungs-Schlange. Echt
        // zeichnet `_loopRender` selbst; die Kehraus-Uhr wird zurückgesetzt, damit er in diesem Frame läuft.
        E.leeren = async () => {
            r.state._gpuKehrausT = 0;
            if (echt) return F.zeichne(8);
            const marke = r._gpuKehrausMarke();
            await F.zeichne(1);
            r._gpuKehraus(marke, performance.now());
            const s = Array.from(r.state.pendingDisposals);
            r.state.pendingDisposals.clear();
            await dev.queue.onSubmittedWorkDone();
            for (const o of s)
                try {
                    o.dispose();
                } catch {
                    /* wie `_loopRender` */
                }
        };
        E.bau = (d) => Object.assign({ module: 0, pipelines: 0 }, d && d.__frostBau);
        E.warte = (holen, c0 = F.gezeichnet(holen())) => F.buehne("ein Bild der Bühne", holen, (n) => n > c0);
    }, ECHT);
    const entsorgtKeineWelt = (tag, b) =>
        check(
            `${tag}: keine Welt-Geometrie, kein Welt-Stoff entsorgt`,
            b.welt === 0,
            `${b.welt} von ${b.alle} Entsorgungen trafen die Welt (${b.geometrien} Geometrien + ${b.stoffe} Stoffe einzeln): ${b.namen.join(" | ")}`
        );

    // S1/S2/S4 — der Seelenwechsel über den Spielerpfad (`applyPlayerSoul` bei offenem Ich: Ich-Bühne UND Welt-Leib, der
    // Mitspieler empfängt ihn) je Art↔human, Hof-Bühne 4 Seelen ×2. Zwei Durchgänge: der erste wärmt, der zweite misst die Neubauten JE DEVICE gegen die geschlossene Bühne.
    const NEUBAU_MAX = 2;
    const ICH_TRI_MIN = 10000; // der Block-Zwilling der Bauplan-Teile trägt 5 388
    const seelen = await page.evaluate(
        async (echt) => {
            const r = window.anazhRealm;
            const F = window.__frostWand;
            const E = window.__frostEntsorgung;
            let tausch = 0;
            const wechsle = async (holen, zeige) => {
                const alt = holen() && holen().pivot;
                E.im("seelen", zeige);
                if (alt && holen().pivot !== alt) tausch++;
                await E.warte(holen);
            };
            // der Leib einer Gruppe gegen den Welt-Leib: sichtbare Meshes (der Peer ist unsichtbar geboren), Geometrien, die er
            // nicht trägt, Dreiecke
            const leiber = {};
            const leib = (pivot) => {
                const welt = new Set(),
                    b = [];
                F.leib.traverse((o) => o.isMesh && welt.add(o.geometry));
                if (pivot) for (const c of pivot.children) c.traverseVisible((o) => o.isMesh && b.push(o.geometry));
                const tri = b.reduce((n, g) => n + (g.index || g.attributes.position).count / 3, 0);
                return { meshe: b.length, fremd: b.filter((g) => !welt.has(g)).length, tri };
            };
            // der Mitspieler empfängt jede Seele, wie `_p2pBroadcastSoul` sie sendet (Name, Bauplan-Teile einer eigenen Seele)
            const peer = { peerId: "frost-peer" };
            const durchgang = async () => {
                r.toggleInventoryOverlay(true);
                for (const s of Object.keys(r.constructor.TETRAPODA_SOUL_MAP).flatMap((a) => [a, "human"])) {
                    await wechsle(
                        () => r.state.ichStage,
                        () => r.applyPlayerSoul(s === "human" ? s : "koerper_" + s)
                    );
                    peer.soulName = r.state.player.soul;
                    peer.bodyParts = (r.state.customSouls[peer.soulName] || {}).bodyParts;
                    E.im("seelen", () => r._p2pApplyPeerSoul(peer));
                    leiber[s] = { ich: leib(r.state.ichStage.pivot), peer: leib(peer.mesh) };
                    await F.leibWechsel();
                }
                r.toggleInventoryOverlay(false);
                r.toggleDrawer("kreaturen");
                for (let k = 0; k < 2; k++)
                    for (const s of ["wolf", "fuchs", "baer", "wesen"])
                        await wechsle(
                            () => r.state.hofStage,
                            () => r._hofStageShow(s)
                        );
                r.closeAllDrawers();
                await E.leeren();
                await F.zeichne(echt ? 8 : 2);
            };
            await durchgang();
            const devs = {
                welt: r.state.renderer.backend.device,
                ich: r.state.ichStage && r.state.ichStage.renderer.backend.device,
                hof: r.state.hofStage && r.state.hofStage.renderer.backend.device,
            };
            const alle = () => Object.fromEntries(Object.entries(devs).map(([k, d]) => [k, E.bau(d)]));
            const messe = async () => {
                const vor = alle();
                await F.zeichne(echt ? 8 : 2);
                const ruhe = alle();
                const n0 = (devs.welt.__frostNamen || []).length;
                await durchgang();
                const nach = alle(),
                    neubau = {},
                    d = (k, g) => nach[k][g] - ruhe[k][g] - (ruhe[k][g] - vor[k][g]);
                for (const k of Object.keys(devs)) neubau[k] = { module: d(k, "module"), pipelines: d(k, "pipelines") };
                return { neubau, neu: (devs.welt.__frostNamen || []).slice(n0, n0 + 6) };
            };
            const { neubau, neu } = await messe();
            const zwillinge = (codes) => codes.length - new Set(codes.map((c) => c.replace(/NodeBuffer_\d+/g, ""))).size;
            const programmZwillinge = [r.state.renderer, r.state.ichStage.renderer, r.state.hofStage.renderer].map((x) =>
                zwillinge([...x._pipelines.programs.vertex.keys()])
            );
            const zwillingSelbst = zwillinge(["NodeBuffer_1", "NodeBuffer_2", "x"]);
            r.state.scene.remove(peer.mesh);
            E.im("seelen", () => r._disposeSoulGroup(peer.mesh)); // der Abschied des Mitspielers
            // der Selbsttest des Urteils: die leere Bühne und der Block-Zwilling aus den Bauplan-Teilen der Wolf-Seele
            const zw = r._buildFromBlueprint({ name: "frost-zwilling", parts: r._getSoulDef("bp_koerper_wolf").bodyParts });
            const selbst = { leer: leib(null), zwilling: leib(zw) };
            r._disposeSoulGroup(zw);
            return {
                ...E.bericht("seelen"),
                programmZwillinge,
                zwillingSelbst,
                leiber,
                selbst,
                tausch,
                neubau,
                neu,
            };
        },
        ECHT
    );
    console.log(`\n[seelenwechsel] ${zeit()} · ${JSON.stringify(seelen).slice(0, 500)}`);
    entsorgtKeineWelt("S1 Seelenwechsel (Ich, Welt-Leib und Mitspieler jede Art↔human, Hof 4 Seelen ×2, zwei Durchgänge)", seelen);
    const leibGut = (u) => u.meshe > 0 && u.fremd === 0 && u.tri >= ICH_TRI_MIN;
    for (const [s, je] of Object.entries(seelen.leiber))
        for (const [wer, u] of [["S1 Ich-Bühne", je.ich], ["S4 Mitspieler", je.peer]])
            check(`${wer} ${s}: der Leib der Welt`, leibGut(u), `${JSON.stringify(u)} (Soll fremd 0, tri ≥ ${ICH_TRI_MIN})`);
    check("S1 Selbsttest: leere Bühne und Block-Zwilling sind ROT", !leibGut(seelen.selbst.leer) && !leibGut(seelen.selbst.zwilling), JSON.stringify(seelen.selbst));
    // nie vakuös: die Bühnen tauschten wirklich ihre Gestalt (dass sie Geometrie trugen, zeigt der Leib je Seele)
    check("S1 die Probe wechselt wirklich (Ich ×8 + Hof ×8 je Durchgang)", seelen.tausch >= 24, `${seelen.tausch} Wechsel`);
    // je Device und gemessenem Durchgang
    for (const [k, n] of Object.entries(seelen.neubau))
        check(
            `S2 ${k === "welt" ? "die Welt-GPU" : k === "ich" ? "die Ich-Bühne" : "die Hof-Bühne"} kompiliert beim Seelenwechsel nicht nach (der Knoten-Bau der Zwischen-Seele bleibt)`,
            n.module <= NEUBAU_MAX && n.pipelines <= NEUBAU_MAX,
            `+${n.module} Module / +${n.pipelines} Pipelines gegen die geschlossene Bühne (Soll ≤ ${NEUBAU_MAX})${k === "welt" && seelen.neu.length ? " — neu: " + seelen.neu.join(", ") : ""}`
        );

    check("S2 je Gestalt EIN Programm (Welt · Ich · Hof: kein Zwilling, den nur NodeBuffer_<id> trennt)", seelen.programmZwillinge.join() === "0,0,0" && seelen.zwillingSelbst === 1, `Zwillinge ${seelen.programmZwillinge} · Selbsttest ${seelen.zwillingSelbst} (Soll 1)`);

    // S3 — die Feed-Vorschau: Wesen-Karten (4 Seelen) und eine Rezept-Karte (Bauplan-Teile, eigene Geometrie), zweimal.
    const feed = await page.evaluate(async () => {
        const r = window.anazhRealm;
        const E = window.__frostEntsorgung;
        const st = r._feedEnsurePreview();
        if (!st) return { fehlt: "keine Feed-Bühne" };
        st.active = true;
        r._feedPreviewStartRAF();
        const bp = r.state.blueprints && r.state.blueprints.baum_eiche;
        const karten = ["wolf", "fuchs", "baer", "wesen"].map((s) => ({
            id: "w:" + s,
            kind: "creature",
            prof: { soul: s },
        }));
        if (bp) karten.push({ id: "r:eiche", kind: "recipe", prof: { bp } });
        let tausch = 0,
            vorgelegt = 0;
        for (let k = 0; k < 2; k++)
            for (const karte of karten) {
                const alt = st.pivot;
                E.im("feed", () => r._feedPreviewShow(karte));
                if (alt && st.pivot !== alt) {
                    tausch++;
                    alt.traverse((o) => o.geometry && vorgelegt++);
                }
                await E.warte(() => r.state.feedPreview);
            }
        st.active = false;
        await E.leeren();
        return { ...E.bericht("feed"), tausch, vorgelegt, karten: karten.length };
    });
    console.log(`\n[feed-vorschau] ${zeit()} · ${JSON.stringify(feed).slice(0, 300)}`);
    entsorgtKeineWelt("S3 Feed-Vorschau (4 Wesen + Rezept, zwei Durchgänge)", feed);
    check(
        "S3 die Probe wechselt wirklich (Feed, mit Geometrie)",
        !feed.fehlt && feed.tausch >= 8 && feed.vorgelegt > 0,
        feed.fehlt || `${feed.tausch} Wechsel, ${feed.vorgelegt} Geometrien vorgelegt`
    );

    // Der JS-Speicher nach erzwungener Sammlung (CDP: HeapProfiler.collectGarbage, Runtime.getHeapUsage) — genau, ohne die
    // Rundung von performance.memory.
    const cdp = await page.target().createCDPSession();
    const heapMB = async () => {
        for (let i = 0; i < 3; i++) {
            await cdp.send("HeapProfiler.collectGarbage");
            await sleep(150);
        }
        const h = await cdp.send("Runtime.getHeapUsage");
        // der JS-Heap UND die Puffer dahinter (Vertex- und Index-Arrays liegen als ArrayBuffer außerhalb des Heaps)
        return +(((h.usedSize || 0) + (h.backingStorageSize || 0) + (h.embedderHeapUsedSize || 0)) / 1048576).toFixed(
            1
        );
    };
    // DAS FENSTER OHNE VERDICHTUNG (S5, S6): ein Welt-Satz schrumpft `ruheTakte` Render-Takte nach dem Beginn seiner Frist
    // (`_chunkSatzVerdichten`), die alte Generation seiner Arrays hält jedes Render-Objekt, das ihn nicht neu zeichnet — fiel
    // das ins Fenster, zählte S5 die Welt mit. Darum ruht die Verdichtung der Welt für das Fenster (wie die Probe
    // `_queueDispose` zählt), danach nennt die Linse jeden Satz, der doch verdichtete.
    const fenster = (auf) =>
        page.evaluate((auf) => {
            const r = window.anazhRealm,
                S = [...(r.state.chunkSaetze || new Map()).values()];
            if (!auf) delete r._chunkSatzVerdichten;
            else
                [window.__frostFenster, r._chunkSatzVerdichten] = [
                    new Map(S.map((s) => [s, s.verdichtet || 0])),
                    () => false,
                ];
            return [...(window.__frostFenster || [])]
                .filter(([s, v]) => (s.verdichtet || 0) !== v)
                .map(([s]) => s.mesh.name);
        }, auf);

    // S5 — der Werkstatt-Ofen, der Regler-Zug: 20 Werte eines Reglers am Wolf. Jeder Wert ist ein Einzelstück (es gehört dem
    // Ofen, nie dem Memo); der Ofen entsorgt das vorige beim Wechsel, mit den Render-Objekten des Werkstatt-Renderers.
    // Grafikspeicher, Geometrie-Zahl, Ofen-Memo, Stoff-Hörer und JS-Speicher bleiben beschränkt.
    const ofenStart = await page.evaluate(async (probe) => {
        const r = window.anazhRealm;
        const E = window.__frostEntsorgung;
        r.toggleDrawer("werkstatt");
        const f = r._foundry;
        const ids = f && f.recipes ? Object.keys(f.recipes).filter((k) => f.recipes[k].kind === "kreatur") : [];
        const id = ids.includes("wolf") ? "wolf" : ids[0];
        if (!id) return { fehlt: "kein Kreatur-Rezept" };
        r.selectStudioRecipeForView(id);
        const ws = r._ensureWorkshopState();
        const holen = () => ws.preview;
        await E.warte(holen);
        const G = window.__tetrapodaCore.GATTUNGEN;
        const recId = (AnazhRealm.TETRAPODA_SOUL_MAP && AnazhRealm.TETRAPODA_SOUL_MAP[id]) || id;
        const basis = G[recId] || G.wolf;
        const dial = Object.keys(basis).find((k) => typeof basis[k] === "number" && basis[k] > 0.2);
        const stoffe = new Set();
        const O = (window.__frostOfen = { id, dial, basis: basis[dial], stoffe });
        O.mess = () => {
            const m = ws.preview && ws.preview.renderer ? ws.preview.renderer.info.memory : {};
            let hoerer = 0;
            for (const s of stoffe) hoerer += s._listeners && s._listeners.dispose ? s._listeners.dispose.length : 0;
            const MB = +(((m.attributesSize || 0) + (m.indexAttributesSize || 0)) / 1048576).toFixed(2);
            return {
                memo: AnazhRealm._tierOfenMemo ? AnazhRealm._tierOfenMemo.size : 0,
                geometrien: m.geometries || 0,
                MB,
                stoffe: stoffe.size,
                hoerer,
            };
        };
        O.zug = async (i) => {
            if (probe === "frames") return E.leeren(); // Selbsttest Lauf F: nur Welt-Frames, kein Regler — GRÜN
            if (probe === "halde") (O.halde || (O.halde = [])).push(ws.preview && ws.preview.currentMesh); // Mutant: jedes Einzelstück bleibt — ROT
            ws.studioOv = ws.studioOv || {};
            ws.studioOv[id] = { [dial]: +(O.basis * (1 + 0.01 * i)).toFixed(4) };
            E.im("ofen", () => r._workshopRebuildPreviewMesh());
            await E.warte(holen);
            if (ws.preview && ws.preview.currentMesh)
                ws.preview.currentMesh.traverse((o) => {
                    if (o.material) [].concat(o.material).forEach((s) => stoffe.add(s));
                });
            await E.leeren();
        };
        for (let i = 0; i <= 2; i++) await O.zug(i);
        return { id, dial, probe, vor: O.mess() };
    }, S5_PROBE);
    let ofen = ofenStart;
    if (!ofen.fehlt) {
        const ruhe = await fenster(true);
        const heapVor = await heapMB();
        const nach = await page.evaluate(async () => {
            const O = window.__frostOfen;
            for (let i = 3; i <= 20; i++) await O.zug(i);
            await window.__frostEntsorgung.leeren();
            return O.mess();
        });
        const heapNach = await heapMB();
        ruhe.push(...(await fenster(false)));
        const bericht = await page.evaluate(() => {
            window.anazhRealm.closeAllDrawers();
            return window.__frostEntsorgung.bericht("ofen");
        });
        ofen = { ...bericht, ...ofenStart, nach, heapVor, heapNach, ruhe };
    }
    console.log(`\n[werkstatt-ofen] ${zeit()} · ${JSON.stringify(ofen).slice(0, 500)}`);
    if (ofen.fehlt) check("S5 Werkstatt-Ofen: ein Kreatur-Rezept trägt den Regler-Zug", false, ofen.fehlt);
    else {
        entsorgtKeineWelt(`S5 Werkstatt-Ofen (Regler-Zug ${ofen.id}.${ofen.dial}, 20 Werte)`, ofen);
        const { vor, nach, ruhe } = ofen;
        check(
            "S5 das Ofen-Memo hält kein Regler-Einzelstück",
            nach.memo === vor.memo,
            `Memo ${vor.memo} → ${nach.memo} über 18 Werte`
        );
        check(
            "S5 Grafikspeicher und Geometrie-Zahl der Werkstatt bleiben beschränkt",
            nach.geometrien <= vor.geometrien && nach.MB <= vor.MB + 0.5,
            `Geometrien ${vor.geometrien} → ${nach.geometrien}, Geometrie-Speicher ${vor.MB} → ${nach.MB} MB über 18 Werte`
        );
        check(
            "S5 die geteilten Stoffe sammeln keine Hörer (die Render-Objekte des Einzelstücks lösen sich)",
            nach.hoerer <= vor.hoerer,
            `${nach.stoffe} Stoffe, dispose-Hörer ${vor.hoerer} → ${nach.hoerer} über 18 Werte`
        );
        check(
            "S5 der JS-Speicher bleibt beschränkt (kein Welt-Satz verdichtet im Fenster)",
            ofen.heapNach - ofen.heapVor <= 10 && !ruhe.length,
            `${ofen.heapVor} → ${ofen.heapNach} MB über 18 Werte (Soll ≤ +10 MB)${ruhe.length ? ", im Fenster verdichtet " + ruhe.join(" · ") : ""}`
        );
    }

    // S6 — die Mitspieler-Erscheinungen: 10 Peers „human" mit je eigener Übergabe (height), jeder ein eigener Ofen-Guss (zwei
    // Vorlagen), dann ihr Abschied. Eine Vorlage ohne lebenden Leib fällt (die Grenze des Ofen-Memos, `_ofenVorlage`) — vorher
    // +2 Einträge und ~9,6 MB JS je Erscheinung, nie freigegeben.
    const peersVor = await page.evaluate(async () => ({
        memo: AnazhRealm._tierOfenMemo ? AnazhRealm._tierOfenMemo.size : 0,
        ruhend: AnazhRealm.OFEN_MEMO_RUHEND || 0,
    }));
    const ruhePeers = await fenster(true);
    const heapPeersVor = await heapMB();
    const peers = await page.evaluate(async (echt) => {
        const r = window.anazhRealm;
        const F = window.__frostWand;
        const E = window.__frostEntsorgung;
        const leiber = [];
        let spitze = 0;
        for (let i = 1; i <= 10; i++) {
            const e = {
                peerId: "frost-erscheinung-" + i,
                soulName: "human",
                uebergabe: { height: +(1 + 0.04 * i).toFixed(3) },
            };
            E.im("peers", () => r._p2pApplyPeerSoul(e));
            if (e.mesh) leiber.push(e.mesh);
            await F.zeichne(echt ? 2 : 1);
            spitze = Math.max(spitze, AnazhRealm._tierOfenMemo.size);
        }
        for (const m of leiber) {
            r.state.scene.remove(m);
            E.im("peers", () => r._disposeSoulGroup(m));
        }
        await E.leeren();
        return { ...E.bericht("peers"), leiber: leiber.length, spitze, memo: AnazhRealm._tierOfenMemo.size };
    }, ECHT);
    const heapPeersNach = await heapMB();
    ruhePeers.push(...(await fenster(false)));
    console.log(
        `\n[mitspieler-erscheinungen] ${zeit()} · ${JSON.stringify({ ...peers, memoVor: peersVor.memo, heapPeersVor, heapPeersNach }).slice(0, 400)}`
    );
    entsorgtKeineWelt("S6 Mitspieler-Erscheinungen (10 Peers human, Abschied)", peers);
    check(
        "S6 die Probe gießt zehn Erscheinungen (jede ihre Vorlagen)",
        peers.leiber === 10 && peers.spitze >= peersVor.memo + 10,
        `${peers.leiber} Leiber, Memo-Spitze ${peers.spitze} (vor ${peersVor.memo})`
    );
    check(
        "S6 das Ofen-Memo ist begrenzt: nach dem Abschied bleiben höchstens OFEN_MEMO_RUHEND Vorlagen ohne Leib",
        peers.memo <= peersVor.memo + peersVor.ruhend,
        `Memo ${peersVor.memo} → Spitze ${peers.spitze} → ${peers.memo} (Grenze +${peersVor.ruhend})`
    );
    check(
        "S6 der JS-Speicher fällt mit dem Abschied zurück",
        heapPeersNach - heapPeersVor <= 20 && !ruhePeers.length,
        `${heapPeersVor} → ${heapPeersNach} MB nach 10 Erscheinungen und Abschied (Soll ≤ +20 MB)${ruhePeers.length ? ", im Fenster verdichtet " + ruhePeers.join(" · ") : ""}`
    );

    await page.evaluate(() => {
        const r = window.anazhRealm;
        const F = window.__frostWand;
        delete r._queueDispose;
        if (F.zeichneTakt) {
            F.zeichne = F.zeichneTakt;
            r.state.renderer.setAnimationLoop(r._gameLoopTick);
        }
    });

    // DER NACHLAUF: eine Validierung, die r184 in einem offenen Pipeline-Fehler-Bereich fängt, meldet sich erst, wenn der
    // async Pipeline-Bau endet — fünf Bilder Zeichnen (je ≥ 600 ms), dann darf kein Wort nachkommen.
    await page.evaluate(async () => {
        for (let i = 0; i < 5; i++) await window.__frostWand.zeichne(1);
    });
    {
        const l = await lage();
        check(
            "Nachlauf: kein verspätetes Wort einer Validierung",
            l.hoer === 0 && (!l.gpuWache || l.gpuWache.n === 0),
            l.hoer ? `${l.hoer} Meldungen: ${l.hoerErste.join(" | ")}` : ""
        );
    }

    // P2 — DER PFAD UND DER ZWANG: ein Index ungerader Länge der Ich-Bühne, neu (wie `_gpuAbschied`), ganz und ab Element 1
    const p2 = await page.evaluate(() => {
        const r = window.anazhRealm,
            T = window.THREE,
            W = window.__frostHoer.puffer,
            st = r.state.ichStage;
        const g = new T.BufferGeometry().setIndex([0, 1, 2, 0, 1]);
        g.index.name = "Ich-Bühne Probe-Index";
        const m = new T.Mesh(g.setAttribute("position", new T.Float32BufferAttribute(new Array(9).fill(0), 3)));
        m.frustumCulled = false;
        st.scene.add(m);
        let bruch = "";
        try {
            for (const k of [0, 1, 2]) {
                if (k > 1) g.index.addUpdateRange(1, 3);
                g.index.needsUpdate = k > 0;
                r._buehneRender(st.renderer, st.scene, st.camera, "Ich-Bühne");
            }
        } catch (e) {
            bruch = e.message;
        }
        st.scene.remove(m);
        g.dispose();
        return [...W.schief, bruch].filter(Boolean).join(" | ") || `${W.n} writeBuffer, keiner schief`;
    });
    check(
        "P2 kein writeBuffer schief: der Pfad und ein Index ungerader Länge der Ich-Bühne",
        /keiner schief$/.test(p2),
        p2
    );

    // DIE TÄTER — die Wand beweist sich an jedem Lauf.
    console.log("\n=== DIE TÄTER (die Wachen und die Bild-Probe beißen) ===");
    const t1 = await page.evaluate(async () => {
        const r = window.anazhRealm;
        const T = window.THREE;
        const F = window.__frostWand;
        const geo = new T.BufferGeometry();
        geo.setAttribute("position", new T.BufferAttribute(new Float32Array([0, 0, 0, 1, 0, 0, 0, 1, 0]), 3));
        geo.setIndex(new T.BufferAttribute(new Uint16Array([0, 1, 3]), 1));
        const m = new T.Mesh(geo, new T.MeshBasicNodeMaterial({ color: 0xff00ff }));
        m.name = "frost-taeter-bereich";
        m.frustumCulled = false;
        if (F.echt) {
            const cam = r.state.camera;
            m.position.copy(new T.Vector3(0, 0, -2).applyQuaternion(cam.quaternion).add(cam.position));
        }
        F.wurzel.add(m);
        await F.zeichne(F.echt ? 8 : 1);
        F.wurzel.remove(m);
        const W = r._indexWache;
        return W ? W.brueche.filter((b) => b.art === "bereich").map((b) => `${b.objekt}: ${b.detail}`) : null;
    });
    check(
        "T1 die Index-Wache nennt den Index über der Vertex-Zahl beim Namen",
        !!t1 && t1.some((s) => /frost-taeter-bereich/.test(s)),
        JSON.stringify(t1)
    );
    // T3 — die Puffer-Wache beißt: 3 × Uint16 (6 Bytes) auf einen eigenen Puffer der Welt-GPU
    const t3 = await page.evaluate(() => {
        const W = window.__frostHoer.puffer,
            dev = window.anazhRealm.state.renderer.backend.device;
        const buf = dev.createBuffer({ label: "frost-taeter-puffer", size: 8, usage: GPUBufferUsage.COPY_DST });
        try {
            dev.queue.writeBuffer(buf, 0, new Uint16Array(3));
        } catch (e) {
            return `${W.schief[W.schief.length - 1]} · geworfen: ${e.message}`;
        } finally {
            buf.destroy();
        }
        return "nicht geworfen";
    });
    check(
        "T3 die Puffer-Wache nennt den schiefen writeBuffer beim Namen, WebGPU wirft",
        /frost-taeter-puffer · Uint16Array · Versatz 0 · 6 B .*geworfen: \S/.test(t3),
        t3
    );
    selbsttest("T2 (der geweitete Mensch-Index)"); // jede Meldung der Seite ab hier ist der Täter der Wand, kein Fehler der Welt
    const t2 = await page.evaluate(() => {
        const r = window.anazhRealm;
        const be = r.state.renderer.backend;
        let ziel = null;
        window.__frostWand.leib.traverse((o) => {
            const g = o.geometry;
            if (ziel || !o.visible || !g || !g.index || !(g.index.array instanceof Uint16Array)) return;
            if (be.data.has(g.index) && be.data.get(g.index).buffer) ziel = o;
        });
        if (!ziel) return null;
        const vor = r._gpuWache ? r._gpuWache.n : 0;
        // genau, was ein fremdes r184-Backend beim Anlegen tut: die geweitete Form zurück in das geteilte Attribut. Das Leib-
        // Bündel (E2) spielt seine schmale Aufnahme ab, bis es neu aufnimmt (Stufe, Sicht, Gerät): der Täter ist diese Aufnahme
        ziel.geometry.index.array = new Uint32Array(ziel.geometry.index.array);
        for (let o = ziel; o; o = o.parent) if (o.isBundleGroup === true) o.needsUpdate = true;
        return { geometrie: ziel.geometry.id, name: ziel.name || ziel.type, vor };
    });
    if (!t2) check("T2 der Mensch trägt einen schmalen Index auf der Welt-GPU", false, "kein Ziel");
    else {
        const steht = await bildPaar("taeter-format");
        // Das Wort der Validierung kommt, wenn sie gemeldet wird: sofort (uncapturederror) oder mit dem Ende des async
        // Pipeline-Baus, der den Fehler-Bereich offen hielt — die Wand zeichnet, solange ein Bau oder Fehler-Bereich offen ist (mindestens 8 Bilder).
        const tWort = Date.now();
        let l = await lage();
        for (let n = 0; (l.hoer === 0 || !l.gpuWache || !(l.gpuWache.n > t2.vor)) && (n++ < 8 || l.bauOffen || l.bereiche); ) {
            await zeichne(1);
            await sleep(250);
            l = await lage();
        }
        console.log(
            `  T2 das Wort der Validierung nach ${Date.now() - tWort} ms (offene Pipeline-Bauten ${l.bauOffen}, offene Fehler-Bereiche ${l.bereiche}, verlorene Devices ${JSON.stringify(l.verloren)})`
        );
        const genannt =
            l.indexWache && l.indexWache.brueche.find((b) => b.art === "format" && b.geometrie === t2.geometrie);
        check(
            "T2 die Index-Wache nennt den geweiteten Index beim Pfad",
            !!genannt,
            genannt ? `${genannt.objekt}: ${genannt.detail}` : JSON.stringify(l.indexWache)
        );
        check(
            "T2 die GPU-Wache des Spiels zählt die Validierung",
            !!l.gpuWache && l.gpuWache.n > t2.vor,
            JSON.stringify(l.gpuWache)
        );
        check(
            "T2 der eigene Hörer hört die Validierung (Device oder r184-Fehler-Bereich)",
            l.hoer > 0,
            `${l.hoer} Meldungen: ${l.hoerErste.slice(0, 2).join(" | ")}`
        );
        check(
            "T2 die Bild-Probe erkennt das stehende Bild",
            steht < FOLGT_MIN,
            `${(steht * 100).toFixed(2)} % der Blöcke bewegt`
        );
    }
    console.log(`\n  Dauer ${zeit()}`);

    await browser.close();
    server.close();
    wandEnde(
        fehler,
        "DIE FROST-WAND steht — durch Werkstatt, Ich- und Hof-Bühne trägt jeder Index-Puffer der Welt-GPU sein Format, kein Device meldet, das Bild folgt der Kamera; die Täter (Index über der Vertex-Zahl, ein fremd geweiteter Mensch-Index) nennen die Wachen beim Namen, und das stehende Bild wird erkannt."
    );
});
