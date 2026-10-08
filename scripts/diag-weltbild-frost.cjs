// diag-weltbild-frost.cjs — DIE FROST-WAND (gate:weltbild-frost, 07.10.). Befund (Leben-Schau v1-Pfad, echte GPU, Radeon
// 890M): nach Werkstatt und Tab stand das Weltbild — drei Bilder gleich, während der Spieler 50 m in den Fluss trieb und die
// Uhr 00:00 → 12:21 lief; die Konsole: „Index range (count 13884, Uint32) does not fit in index buffer size (27768)" und
// „Invalid CommandBuffer renderContext_4/5". Wurzel: r184 schreibt beim Anlegen eines Index die geweitete Form in das GETEILTE
// Attribut zurück (`createAttribute`: `array = new Uint32Array(array)`), und der Draw bindet das Format nach dem Array-Typ.
// Die Hülle des schmalen Index lag nur an der Welt-Instanz; das Backend der Ich-Bühne (Tab) weitete die Mensch-Vorlage
// (`sharedGeom`), das der Hof-Bühne die Tier-Vorlagen — die Welt band uint32 auf 16-bit-Puffern, Dawn verwarf jeden
// Render-Kontext der Welt. Der Schnitt: das Backend-Gesetz an der KLASSE (`_backendGesetz`: schmaler Index · Index-Wache ·
// GPU-Wache).
//
// Je Schritt (Werkstatt mit Eiche · Tab/Ich-Bühne · Hof-Bühne — jede Bühne ein eigenes WebGPU-Backend, das Geometrie mit
// der Welt teilt) prüft die Wand am ECHTEN Renderer (der Null-Renderer ist für jeden Draw blind):
//   I  DER INDEX-ZENSUS: jeder Index-Puffer der Welt-GPU trägt das Format, das der Draw bindet (Bytes des Arrays ≤ Puffer)
//   G  kein WebGPU-Validierungsfehler auf irgendeinem Device (eigener Hörer, unabhängig vom Spiel: `uncapturederror` jedes
//      Device UND die THREE-Konsolenzeile, mit der r184 eine Validierung aus seinem offenen Pipeline-Fehler-Bereich meldet)
//   W  die Wachen des Spiels stehen und schweigen (`_indexWache` · `_gpuWache`)
//   B  DAS BILD FOLGT: zwei Bilder bei gedrehter Kamera unterscheiden sich in ≥ 2 % der 16×16-Blöcke (echt: der präsentierte
//      Canvas; headless: das Rücklese-Bild der Welt-GPU)
// Dann DIE ENTSORGUNG DER BÜHNEN (dieselbe Klasse: geteilte Geometrie und Stoffe über Renderer-Grenzen; `_disposeSoulGroup`
// ist die EINE Regel jeder Gruppe, die Welt-Vorlagen teilt, `_ofenVorlage` sagt, was eine Gruppe besitzt):
//   S1 Ich-Bühne wolf↔human ×3, Hof-Bühne 4 Seelen ×2 (zwei Durchgänge) entsorgen keine Welt-Geometrie, keinen Welt-Stoff
//   S2 die Welt-GPU kompiliert dabei nichts nach — Shader-Module und Pipelines gegen die geschlossene Bühne
//   S3 die Feed-Vorschau (4 Wesen + eine Rezept-Karte) · S4 der Mitspieler-Leib (zweiter Peer-Guss human, Abschied)
//      entsorgen keine Welt-Geometrie, keinen Welt-Stoff
//   S5 der Werkstatt-Ofen, Regler-Zug 20 Werte: kein Einzelstück im Ofen-Memo, Grafikspeicher und Geometrie-Zahl der
//      Werkstatt bleiben beschränkt
// Danach DIE TÄTER (jeder Lauf — die Wand beweist sich selbst):
//   T1 ein Probe-Mesh zeichnet einen Index ≥ seiner Vertex-Zahl → die Index-Wache nennt es („bereich")
//   T2 ein Mensch-Index wird geweitet wie von einem fremden Backend → die Index-Wache nennt ihn („format") beim Pfad, die
//      GPU-Wache des Spiels und der eigene Hörer zählen, und die Bild-Probe sagt BILD STEHT
//
// Zwei Wege, derselbe Prüfer:
//   node scripts/diag-weltbild-frost.cjs          headless (swiftshader, ?holz=kienspan) — CI: der Spiel-Takt ruht (ein
//                                                 Welt-Frame kostet dort Sekunden), die Welt-GPU zeichnet die PROBE-BÜHNE:
//                                                 einen Menschen und ein Tier aus denselben Bauern wie Spieler, Ich- und
//                                                 Hof-Bühne (`_buildHumanGroup`, `_buildCreatureGroup` — geteilte Vorlagen)
//   node scripts/diag-weltbild-frost.cjs --echt   sichtbares Chrome auf der echten GPU: der SPIELPFAD (Ankunft · dritte
//                                                 Person · Werkstatt · Tab · Hof) im laufenden Spiel, das Bild-Paar je Schritt
//   … [--bilder <ordner>]                         legt je Bild-Paar beide Bilder ab
//   Port: WELTBILD_FROST_PORT (Standard 4426). Exit 0 grün · 1 rot · 2 Skript-Fehler.
"use strict";
const puppeteer = require("puppeteer");
const { softwareWebGpuArgs, echteWebGpuArgs } = require("./lib/software-gpu.cjs");
const http = require("http");
const fs = require("fs");
const path = require("path");

const root = path.resolve(__dirname, "..");
const PORT = Number(process.env.WELTBILD_FROST_PORT || 4426);
const ECHT = process.argv.includes("--echt");
const BILDER = (() => {
    const i = process.argv.indexOf("--bilder");
    return i >= 0 ? path.resolve(process.argv[i + 1]) : null;
})();
const FOLGT_MIN = 0.02; // Anteil bewegter 16×16-Blöcke der Bildmitte, ab dem das Bild der Kamera folgt
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

const fehler = [];
function check(name, ok, detail) {
    console.log(`  ${ok ? "✅" : "❌"} ${name}${detail ? " — " + detail : ""}`);
    if (!ok) fehler.push(name);
}

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
// GPU), `drehe()` (63° Gier), `leib` (der Mensch, dessen Index der Täter T2 weitet).
function pruefRaum(echt) {
    const r = window.anazhRealm;
    const T = window.THREE;
    const rend = r.state.renderer;
    const F = (window.__frostWand = { echt });
    r.setCameraMode("third");
    if (echt) {
        F.wurzel = r.state.scene;
        F.leib = r.state.playerMesh;
        F.zeichne = async (n) => {
            const info = rend.info.render;
            const a = info.calls,
                t = performance.now();
            while ((info.calls - a < n || performance.now() - t < 600) && performance.now() - t < 120000)
                await new Promise((res) => setTimeout(res, 50));
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
    const leib = r._buildHumanGroup();
    pivot.add(leib);
    // das Tier der Hof-Bühne: das erste Wesen des Hofs, gebaut wie dort (`_hofRefreshFocus` → `_buildCreatureGroup`)
    let tier = null,
        seele = null;
    const c = (r.state.creatures || [])[0];
    if (c) seele = r._creatureProfile(c).soul;
    if (seele) tier = r._buildCreatureGroup(seele);
    if (tier) {
        tier.position.set(1.3, 0, -0.4);
        pivot.add(tier);
    }
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
    pivot.traverse((o) => {
        if (o.isMesh) {
            o.visible = true;
            o.frustumCulled = false;
        }
    });
    const cam = new T.PerspectiveCamera(45, 16 / 9, 0.05, 100);
    cam.position.set(0, 1.0, 3.0);
    cam.lookAt(0, 0.7, 0);
    F.wurzel = scene;
    F.leib = leib;
    F.zeichne = async (n) => {
        for (let i = 0; i < n; i++) {
            scene.updateMatrixWorld(true);
            rend.render(scene, cam);
        }
        await rend.backend.device.queue.onSubmittedWorkDone();
        await new Promise((res) => setTimeout(res, 50));
    };
    // DAS BILD der Probe-Bühne: die Welt-GPU zeichnet in ein Ziel, das Ziel wird zurückgelesen (256 × 144, RGBA8 — eine Zeile
    // 1 024 B, kein Zeilen-Rand). Der Linux-Runner setzt die WebGPU-Leinwand headless nicht in den Bildschirm-Schuss (CI
    // 07.10.: zwei Schüsse gleich, obwohl die Welt-GPU zeichnete); der Rücklese-Weg zeigt, was der Pass schrieb — ein
    // verworfener Befehlspuffer schreibt nichts, das Ziel behält das letzte Bild.
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
    return { weg: "probe-buehne", tier: tier ? seele : null };
}

(async () => {
    await new Promise((r) => server.listen(PORT, "127.0.0.1", r));
    const browser = await puppeteer.launch({
        headless: !ECHT,
        protocolTimeout: 1800000,
        defaultViewport: ECHT ? { width: 1280, height: 720, deviceScaleFactor: 1 } : { width: 640, height: 360 },
        args: ECHT ? [...echteWebGpuArgs(), "--window-size=1300,820"] : softwareWebGpuArgs(),
    });
    const page = await browser.newPage();
    const t0 = Date.now();
    const zeit = () => `+${Math.round((Date.now() - t0) / 1000)} s`;
    let konsole = 0;
    // Der zweite Weg einer Validierung: r184 fängt sie in seinem offenen Pipeline-Fehler-Bereich und meldet sie als
    // THREE-Konsolenzeile (nie als uncapturederror) — der eigene Hörer zählt auch diese (die Zeilen des Spiels nicht).
    const konsoleGpu = { n: 0, erste: [] };
    page.on("pageerror", (e) => console.log(`  [Seiten-Fehler] ${zeit()}: ${String(e.message || e).split("\n")[0]}`));
    page.on("console", (m) => {
        const t = m.text();
        if (!t.startsWith("[AnazhRealm") && /does not fit in|\[Invalid [A-Za-z]+|\n\s*-\s*While /.test(t)) {
            konsoleGpu.n++;
            if (konsoleGpu.erste.length < 3) konsoleGpu.erste.push("konsole: " + t.split("\n")[0].slice(0, 200));
        }
        if (/INDEX-WACHE|GPU-VALIDIERUNG/.test(t) && konsole++ < 10) console.log("  [Spiel] " + t.slice(0, 260));
    });
    await page.evaluateOnNewDocument(geraeteHoerer);
    await page.goto(`http://127.0.0.1:${PORT}/index.html${ECHT ? "" : "?holz=kienspan"}`, {
        waitUntil: "domcontentloaded",
        timeout: 120000,
    });
    const boot = await page.evaluate(
        async (minChunks) => {
            const dl = performance.now() + 360000;
            while (performance.now() < dl) {
                const r = window.anazhRealm;
                const st = r && r.state;
                if (st && st.rendererReady && st.playerMesh && st.voxelChunks && st.voxelChunks.size >= minChunks)
                    break;
                await new Promise((res) => setTimeout(res, 300));
            }
            const r = window.anazhRealm;
            const rend = r && r.state && r.state.renderer;
            return {
                bereit: !!(r && r.state.rendererReady),
                webgpu: !!(rend && rend.backend && rend.backend.isWebGPUBackend === true),
                chunks: r && r.state.voxelChunks ? r.state.voxelChunks.size : -1,
            };
        },
        ECHT ? 25 : 9
    );
    console.log(
        `=== DIE FROST-WAND (${ECHT ? "echte GPU" : "swiftshader, kienspan"}) — Boot ${zeit()} ${JSON.stringify(boot)} ===`
    );
    if (!boot.bereit || !boot.webgpu) {
        check("die Welt steht auf einem WebGPU-Backend", false, JSON.stringify(boot));
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
            const dl = performance.now() + 180000;
            const holen = () =>
                wer === "ich"
                    ? r.state.ichStage
                    : wer === "hof"
                      ? r.state.hofStage
                      : r.state.workshop && r.state.workshop.preview;
            while (performance.now() < dl) {
                const s = holen();
                if (s && s.renderer && s.renderer.info.render.calls >= 2) break;
                await new Promise((res) => setTimeout(res, 200));
            }
            const s = holen();
            let meshes = 0;
            if (s && s.scene) s.scene.traverse((o) => o.isMesh && meshes++);
            return { bühne: wer, gezeichnet: s && s.renderer ? s.renderer.info.render.calls : 0, meshes };
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

    // S — DIE ENTSORGUNG DER BÜHNEN (Nachbesserung 08.10., dieselbe Klasse „geteilte Geometrie und Stoffe über Renderer-
    // Grenzen"): Ich-, Hof-, Feed-Bühne, Werkstatt-Ofen und Mitspieler-Leib bauen aus denselben Vorlagen wie die Welt und
    // entsorgten beim Wechsel ALLES, was sie trugen — Gegenprüfung: 3 Wechsel wolf↔human legten 12 Geometrien und 8 Stoffe
    // der Welt in die Entsorgung (den Kopf des Spieler-Leibs, die Haut), die Welt kompilierte neu; ein zweiter Peer-Guss
    // „human" dieselben 12 Geometrien; der Ofen hielt jedes Regler-Einzelstück für immer (Werkstatt 2,4 → 50,1 MB nach 20
    // Werten). Die Probe zählt je Phase jede Welt-Geometrie und jeden Welt-Stoff, den ein Wechsel SELBST in die Entsorgungs-
    // Schlange legt (echt streamt die Welt nebenher), und leert die Schlange wie `_loopRender`.
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
        // echt ruht der Spiel-Takt für die Entsorgungs-Proben (Lehre 17: sonst baut die laufende Welt nebenher neu — ein
        // Lauf am 08.10. zählte +4 Module / +5 Pipelines, die kein Wechsel verursachte); die Welt-GPU zeichnet über
        // `_loopRender` (Bild + Kehraus + die Entsorgungs-Schlange), die Bühnen zeichnen in ihrem eigenen Takt weiter.
        if (echt) {
            r.state.renderer.setAnimationLoop(null);
            F.zeichneTakt = F.zeichne;
            F.zeichne = async (n) => {
                for (let i = 0; i < n; i++) {
                    r._loopRender(performance.now());
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
        E.leeren = async () => {
            if (echt) return F.zeichne(8);
            const s = Array.from(r.state.pendingDisposals);
            r.state.pendingDisposals.clear();
            await dev.queue.onSubmittedWorkDone();
            for (const o of s)
                try {
                    o.dispose();
                } catch (_e) {
                    /* wie `_loopRender` */
                }
        };
        E.warte = async (holen) => {
            const s0 = holen();
            const c0 = s0 && s0.renderer ? s0.renderer.info.render.calls : 0;
            const t = performance.now();
            while (performance.now() - t < 20000) {
                const s = holen();
                if (s && s.renderer && s.renderer.info.render.calls > c0) return;
                await new Promise((res) => setTimeout(res, 50));
            }
        };
    }, ECHT);
    const entsorgtKeineWelt = (tag, b) =>
        check(
            `${tag}: keine Welt-Geometrie, kein Welt-Stoff entsorgt`,
            b.welt === 0,
            `${b.welt} von ${b.alle} Entsorgungen trafen die Welt (${b.geometrien} Geometrien + ${b.stoffe} Stoffe einzeln): ${b.namen.join(" | ")}`
        );

    // S1/S2 — der Seelenwechsel in Ich- und Hof-Bühne: zwei Durchgänge (Ich: wolf↔human ×3, Hof: 4 Seelen ×2), der erste
    // wärmt (eine Seele, die die Welt nie zeigte, kompiliert einmal), der zweite misst gegen die geschlossene Bühne.
    const seelen = await page.evaluate(async (echt) => {
        const r = window.anazhRealm;
        const F = window.__frostWand;
        const E = window.__frostEntsorgung;
        const dev = r.state.renderer.backend.device;
        let tausch = 0,
            vorgelegt = 0;
        const wechsle = async (holen, zeige) => {
            const alt = holen() && holen().pivot;
            E.im("seelen", zeige);
            if (alt && holen().pivot !== alt) {
                tausch++;
                alt.traverse((o) => o.geometry && vorgelegt++);
            }
            await E.warte(holen);
        };
        const durchgang = async () => {
            r.toggleInventoryOverlay(true);
            for (let k = 0; k < 3; k++)
                for (const s of ["wolf", "human"])
                    await wechsle(
                        () => r.state.ichStage,
                        () => r._ichStageShow(s)
                    );
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
        const bau = () => Object.assign({ module: 0, pipelines: 0 }, dev.__frostBau);
        await durchgang();
        const vor = bau();
        await F.zeichne(echt ? 8 : 2);
        const ruhe = bau();
        const n0 = (dev.__frostNamen || []).length;
        await durchgang();
        const nach = bau();
        return {
            ...E.bericht("seelen"),
            tausch,
            vorgelegt,
            ruhe: { module: ruhe.module - vor.module, pipelines: ruhe.pipelines - vor.pipelines },
            wechsel: { module: nach.module - ruhe.module, pipelines: nach.pipelines - ruhe.pipelines },
            neu: (dev.__frostNamen || []).slice(n0, n0 + 8),
        };
    }, ECHT);
    console.log(`\n[seelenwechsel] ${zeit()} · ${JSON.stringify(seelen).slice(0, 400)}`);
    entsorgtKeineWelt("S1 Seelenwechsel (Ich wolf↔human ×3, Hof 4 Seelen ×2, zwei Durchgänge)", seelen);
    // nie vakuös: die Bühnen tauschten wirklich ihre Gestalt und legten der Entsorgung Geometrien vor
    check(
        "S1 die Probe wechselt wirklich (Ich ×6 + Hof ×8 je Durchgang, mit Geometrie)",
        seelen.tausch >= 20 && seelen.vorgelegt > 0,
        `${seelen.tausch} Wechsel, ${seelen.vorgelegt} Geometrien vorgelegt`
    );
    check(
        "S2 die Welt-GPU kompiliert beim Seelenwechsel nichts nach (gegen die geschlossene Bühne)",
        seelen.wechsel.module - seelen.ruhe.module <= 0 && seelen.wechsel.pipelines - seelen.ruhe.pipelines <= 0,
        `Wechsel +${seelen.wechsel.module} Module / +${seelen.wechsel.pipelines} Pipelines, geschlossen +${seelen.ruhe.module} / +${seelen.ruhe.pipelines}${seelen.neu.length ? " — neu: " + seelen.neu.join(", ") : ""}`
    );

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

    // S4 — der Mitspieler-Leib: zwei Peer-Güsse „human" nacheinander (der erste geht), dann der Abschied des Peers.
    const peer = await page.evaluate(async (echt) => {
        const r = window.anazhRealm;
        const F = window.__frostWand;
        const E = window.__frostEntsorgung;
        const e = { peerId: "frost-peer", soulName: "human" };
        E.im("peer", () => r._p2pApplyPeerSoul(e));
        const erster = e.mesh;
        let vorgelegt = 0;
        if (erster) erster.traverse((o) => o.geometry && vorgelegt++);
        await F.zeichne(echt ? 4 : 1);
        E.im("peer", () => r._p2pApplyPeerSoul(e));
        const zweiter = e.mesh !== erster && !!erster;
        await F.zeichne(echt ? 4 : 1);
        if (e.mesh) {
            r.state.scene.remove(e.mesh);
            E.im("peer", () => r._disposeSoulGroup(e.mesh));
        }
        await E.leeren();
        return { ...E.bericht("peer"), zweiter, vorgelegt };
    }, ECHT);
    console.log(`\n[mitspieler] ${zeit()} · ${JSON.stringify(peer).slice(0, 300)}`);
    entsorgtKeineWelt("S4 Mitspieler-Leib (zweiter Peer-Guss human, Abschied)", peer);
    check(
        "S4 die Probe gießt den Peer wirklich zweimal (mit Geometrie)",
        peer.zweiter === true && peer.vorgelegt > 0,
        `zweiter Guss: ${peer.zweiter}, ${peer.vorgelegt} Geometrien vorgelegt`
    );

    // S5 — der Werkstatt-Ofen, der Regler-Zug: 20 Werte eines Reglers am Wolf. Jeder Wert ist ein Einzelstück (es gehört dem
    // Ofen, nie dem Memo); der Ofen entsorgt das vorige beim Wechsel. Grafikspeicher und Geometrie-Zahl der Werkstatt und
    // das Ofen-Memo bleiben beschränkt — vorher +2 Memo-Einträge und +2,4 MB je Wert.
    const ofen = await page.evaluate(async () => {
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
        const mess = () => {
            const m = ws.preview && ws.preview.renderer ? ws.preview.renderer.info.memory : {};
            return {
                memo: AnazhRealm._tierOfenMemo ? AnazhRealm._tierOfenMemo.size : 0,
                geometrien: m.geometries || 0,
                MB: +(((m.attributesSize || 0) + (m.indexAttributesSize || 0)) / 1048576).toFixed(2),
            };
        };
        const zug = async (i) => {
            ws.studioOv = ws.studioOv || {};
            ws.studioOv[id] = { [dial]: +(basis[dial] * (1 + 0.01 * i)).toFixed(4) };
            E.im("ofen", () => r._workshopRebuildPreviewMesh());
            await E.warte(holen);
            await E.leeren();
        };
        for (let i = 0; i <= 2; i++) await zug(i);
        const vor = mess();
        for (let i = 3; i <= 20; i++) await zug(i);
        const nach = mess();
        r.closeAllDrawers();
        return { ...E.bericht("ofen"), id, dial, vor, nach };
    });
    console.log(`\n[werkstatt-ofen] ${zeit()} · ${JSON.stringify(ofen).slice(0, 400)}`);
    if (ofen.fehlt) check("S5 Werkstatt-Ofen: ein Kreatur-Rezept trägt den Regler-Zug", false, ofen.fehlt);
    else {
        entsorgtKeineWelt(`S5 Werkstatt-Ofen (Regler-Zug ${ofen.id}.${ofen.dial}, 20 Werte)`, ofen);
        check(
            "S5 das Ofen-Memo hält kein Regler-Einzelstück",
            ofen.nach.memo === ofen.vor.memo,
            `Memo ${ofen.vor.memo} → ${ofen.nach.memo} über 18 Werte`
        );
        check(
            "S5 Grafikspeicher und Geometrie-Zahl der Werkstatt bleiben beschränkt",
            ofen.nach.geometrien <= ofen.vor.geometrien && ofen.nach.MB <= ofen.vor.MB + 0.5,
            `Geometrien ${ofen.vor.geometrien} → ${ofen.nach.geometrien}, Geometrie-Speicher ${ofen.vor.MB} → ${ofen.nach.MB} MB über 18 Werte`
        );
    }
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
    // async Pipeline-Bau endet (CI 07.10., Linux: später als der Schritt) — 3 s Zeichnen, dann darf kein Wort nachkommen.
    await page.evaluate(async () => {
        const t = performance.now();
        while (performance.now() - t < 3000) await window.__frostWand.zeichne(1);
    });
    {
        const l = await lage();
        check(
            "Nachlauf: kein verspätetes Wort einer Validierung",
            l.hoer === 0 && (!l.gpuWache || l.gpuWache.n === 0),
            l.hoer ? `${l.hoer} Meldungen: ${l.hoerErste.join(" | ")}` : ""
        );
    }

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
    const t2 = await page.evaluate(() => {
        const r = window.anazhRealm;
        const be = r.state.renderer.backend;
        let ziel = null;
        window.__frostWand.leib.traverse((o) => {
            const g = o.geometry;
            if (
                ziel ||
                !o.visible ||
                !g ||
                !g.index ||
                !(g.index.array instanceof Uint16Array) ||
                !be.data.has(g.index)
            )
                return;
            if (be.data.get(g.index).buffer) ziel = o;
        });
        if (!ziel) return null;
        const vor = r._gpuWache ? r._gpuWache.n : 0;
        // genau, was ein fremdes r184-Backend beim Anlegen tut: die geweitete Form zurück in das geteilte Attribut
        ziel.geometry.index.array = new Uint32Array(ziel.geometry.index.array);
        return { geometrie: ziel.geometry.id, name: ziel.name || ziel.type, vor };
    });
    if (!t2) check("T2 der Mensch trägt einen schmalen Index auf der Welt-GPU", false, "kein Ziel");
    else {
        const steht = await bildPaar("taeter-format");
        // Das Wort der Validierung kommt, wenn sie gemeldet wird: sofort (uncapturederror) oder mit dem Ende des async
        // Pipeline-Baus, der den Fehler-Bereich offen hielt — die Wand zeichnet weiter und wartet höchstens 30 s.
        const tWort = Date.now();
        let l = await lage();
        while ((l.hoer === 0 || !l.gpuWache || !(l.gpuWache.n > t2.vor)) && Date.now() - tWort < 30000) {
            await zeichne(1);
            await new Promise((res) => setTimeout(res, 250));
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
    if (fehler.length) {
        console.error(`\n❌ DIE FROST-WAND ROT — ${fehler.length} Befund(e): ${fehler.join(" · ")}`);
        process.exit(1);
    }
    console.log(
        "\n✅ DIE FROST-WAND steht — durch Werkstatt, Ich- und Hof-Bühne trägt jeder Index-Puffer der Welt-GPU sein Format, kein Device meldet, das Bild folgt der Kamera; die Täter (Index über der Vertex-Zahl, ein fremd geweiteter Mensch-Index) nennen die Wachen beim Namen, und das stehende Bild wird erkannt."
    );
    process.exit(0);
})().catch((e) => {
    console.error("Frost-Wand-Fehler:", (e && e.stack) || e);
    process.exit(2);
});
