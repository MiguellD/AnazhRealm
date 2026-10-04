#!/usr/bin/env node
// ─────────────────────────────────────────────────────────────────────────
// diag-kamera-treue.cjs — DIE KAMERA-TREUE-WAND der Region-Bundles (gate:kamera-treue, 04.10.)
//
// Befund (echte GPU, Mess-Wiese −900/−850, Werkbank, EINE Welt): die Region-RenderBundles trugen die Kamera nicht.
// r184 hält `_currentRenderBundle` ohne Stapel; das erste lichtempfangende Objekt im Hauptbild startet über
// ShadowNode.updateBefore den Schatten-Render, dessen eigene Aufnahme den Zeiger auf null setzt — gemessen 107 von 237
// aufgenommenen Draws verfolgt; der Replay refresht nur Verfolgte, der Rest zeigte die Kamera seiner Aufnahme. Und der
// Replay refresht seine Bürger AUSSERHALB von renderObject: im Schatten-Render gegen den geteilten Override-Stoff, der
// den Zustand des zuletzt direkt gezeichneten Werfers trägt (alphaTest) — die ausgeschnittenen Blätter warfen volle
// Karten (81 % gleiche Pixel, Rauschboden 90 %). Der Chokepoint `_renderScene` (_configureRenderer) stapelt den Zeiger
// und sammelt unter einem overrideMaterial keine Bundles.
//
// Die Wand fährt den ECHTEN Renderer des Spiels (swiftshader, Software-Holz `kienspan`, mit eingeschaltetem
// Schatten) an einer eigenen Bühne: eine BundleGroup trägt einen lichtempfangenden Boden, ausgeschnittene Karten
// (alphaTest, jede ihr eigenes Programm) und Kisten; ein Richtungslicht wirft Schatten. Sie nennt jeden Täter:
//   (a) STAPEL — eine Aufnahme mit Schatten-Render verfolgt jeden aufgenommenen Draw (verfolgt = gezeichnet).
//   (b) OVERRIDE — kein Bundle wird unter einem overrideMaterial gesammelt (der Schatten-Render zeichnet direkt).
//   (c) BILD — Blick Y als Replay einer Aufnahme an Blick X gleicht dem direkten Pfad bei Y (≥ 0,999, Zeit fest), und
//       das auch, wenn der geteilte Schatten-Stoff vor dem Replay einen fremden alphaTest trägt (der Zustand, den der
//       letzte direkte Werfer hinterlässt).
//   LAUF-KONTROLLEN (sonst ist die Wand blind und rot): ohne den Chokepoint klebt der Replay an Blick X, und ein
//   Schatten-Replay mit fremdem Stoff wirft anders (je < 0,98); Blick X und Y sind verschiedene Bilder (< 0,9).
// SELBSTTEST (--selftest, ohne Browser, in `npm run check`): das Urteil über einen grünen Lauf und je einen injizierten
// Täter — jeder fällt rot und wird genannt.
//   node scripts/diag-kamera-treue.cjs [--selftest]   (npm run gate:kamera-treue)
// ─────────────────────────────────────────────────────────────────────────
"use strict";

const BILD_SOLL = 0.999; // der Replay zeichnet wie der direkte Pfad
const BLIND_GRENZE = 0.98; // die Lauf-Kontrollen MÜSSEN darunter liegen
const BLICK_GRENZE = 0.9; // Blick X und Blick Y sind verschiedene Bilder

function urteil(z) {
    const v = [];
    const a = z.aufnahme || {};
    if (!(a.gezeichnet > 0)) v.push("STAPEL: die Bühne nahm kein Bundle auf (die Probe ist blind)");
    else if (a.verfolgt !== a.gezeichnet)
        v.push(
            `STAPEL: die Aufnahme verfolgt ${a.verfolgt} von ${a.gezeichnet} Draws — der Schatten-Render nullte den Zeiger, der Replay refresht die übrigen nie`
        );
    if (!(a.schattenRenders > 0)) v.push("STAPEL: kein Schatten-Render während der Aufnahme (die Probe ist blind)");
    if (a.unterOverride !== 0)
        v.push(`OVERRIDE: ${a.unterOverride} Bundle(s) unter einem overrideMaterial gesammelt — der Replay refresht sie gegen den geteilten Stoff`);
    const b = z.bild || {};
    if (!(b.replay >= BILD_SOLL))
        v.push(`BILD: der Replay zeichnet Blick Y zu ${b.replay} gleich mit dem direkten Pfad (Soll ≥ ${BILD_SOLL}) — ein Bürger klebt an der Kamera seiner Aufnahme`);
    if (!(b.fremd >= BILD_SOLL))
        v.push(`BILD: mit fremdem Schatten-Stoff zeichnet der Replay Y zu ${b.fremd} gleich (Soll ≥ ${BILD_SOLL}) — ein Schatten-Bundle wirft gegen den geteilten Stoff`);
    if (!(b.ohneStapel < BLIND_GRENZE))
        v.push(`BILD: ohne den Chokepoint zeichnet der Replay Y zu ${b.ohneStapel} gleich (Soll < ${BLIND_GRENZE}) — die Stapel-Probe ist blind`);
    if (!(b.schattenBundle < BLIND_GRENZE))
        v.push(`BILD: ein Schatten-Bundle mit fremdem Stoff zeichnet Y zu ${b.schattenBundle} gleich (Soll < ${BLIND_GRENZE}) — die Override-Probe ist blind`);
    if (!(b.xGegenY < BLICK_GRENZE)) v.push(`BILD: Blick X und Blick Y sind zu ${b.xGegenY} gleich (Soll < ${BLICK_GRENZE}) — die Bühne ist blind`);
    return v;
}

function selbsttest() {
    const gruen = {
        aufnahme: { gezeichnet: 13, verfolgt: 13, schattenRenders: 1, unterOverride: 0 },
        bild: { replay: 1, fremd: 1, ohneStapel: 0.62, schattenBundle: 0.91, xGegenY: 0.31 },
    };
    const fehler = [];
    if (urteil(gruen).length) fehler.push("der grüne Lauf fällt rot: " + urteil(gruen).join(" · "));
    const mit = (pfad, wert) => {
        const z = JSON.parse(JSON.stringify(gruen));
        Object.assign(z[pfad], wert);
        return z;
    };
    const faelle = [
        { name: "Zeiger genullt", z: mit("aufnahme", { verfolgt: 1 }), muss: /verfolgt 1 von 13/ },
        { name: "Bundle unter Override", z: mit("aufnahme", { unterOverride: 2 }), muss: /unter einem overrideMaterial/ },
        { name: "Bühne ohne Schatten", z: mit("aufnahme", { schattenRenders: 0 }), muss: /kein Schatten-Render/ },
        { name: "Replay klebt", z: mit("bild", { replay: 0.4 }), muss: /klebt an der Kamera seiner Aufnahme/ },
        { name: "Schatten gegen fremden Stoff", z: mit("bild", { fremd: 0.9 }), muss: /wirft gegen den geteilten Stoff/ },
        { name: "Stapel-Probe blind", z: mit("bild", { ohneStapel: 1 }), muss: /die Stapel-Probe ist blind/ },
        { name: "Override-Probe blind", z: mit("bild", { schattenBundle: 1 }), muss: /die Override-Probe ist blind/ },
        { name: "Bühne blind", z: mit("bild", { xGegenY: 0.99 }), muss: /die Bühne ist blind/ },
    ];
    for (const f of faelle) {
        const v = urteil(f.z);
        if (!v.some((s) => f.muss.test(s))) fehler.push(`${f.name}: die Wand nennt den Täter nicht (${f.muss})`);
        console.log(`  ${v.length ? "✅" : "❌"} Selbsttest „${f.name}" → rot: ${v.join(" · ") || "(nichts)"}`);
    }
    if (fehler.length) {
        console.log("\n❌ SELBSTTEST ROT — die Wand ist vakuös: " + fehler.join(" · "));
        process.exit(1);
    }
    console.log("\n✅ SELBSTTEST GRÜN — jeder injizierte Täter fällt rot und wird beim Namen genannt.");
}

if (process.argv.includes("--selftest")) {
    console.log("=== KAMERA-TREUE — Selbsttest (ohne Browser) ===");
    selbsttest();
    process.exit(0);
}

const puppeteer = require("puppeteer");
const http = require("http");
const fs = require("fs");
const path = require("path");

const root = path.resolve(__dirname, "..");
const PORT = Number(process.env.KAMERA_TREUE_PORT) || 4472;
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

// DIE BÜHNE (Seiten-Kontext): der echte Renderer des Spiels mit seinen Eingriffen (_configureRenderer), eine eigene
// Szene, Zeit fest. Jeder Schuss ist ein echter Render in ein Ziel (160×120).
function buehne() {
    return (async () => {
        const r = window.anazhRealm,
            st = r.state,
            T = window.THREE,
            TSL = T.TSL;
        const rend = st.renderer;
        if (typeof rend.setAnimationLoop === "function") rend.setAnimationLoop(null);
        const nf = rend._nodes.nodeFrame;
        const zeit = nf.time;
        nf.update = function () {
            this.frameId++;
            this.deltaTime = 0;
            this.time = zeit;
        };
        const schattenAlt = rend.shadowMap.enabled;
        rend.shadowMap.enabled = true;
        const szene = new T.Scene();
        const licht = new T.DirectionalLight(0xffffff, 3);
        licht.position.set(6, 12, 4);
        licht.castShadow = true;
        licht.shadow.mapSize.set(256, 256);
        Object.assign(licht.shadow.camera, { left: -14, right: 14, top: 14, bottom: -14, near: 0.5, far: 50 });
        licht.shadow.camera.updateProjectionMatrix();
        szene.add(licht, licht.target, new T.AmbientLight(0xffffff, 0.35));
        const gruppe = new T.BundleGroup();
        gruppe.name = "kamera-treue:BUEHNE";
        szene.add(gruppe);
        const diaet = (m) => (typeof r._materialObserverDiaet === "function" ? r._materialObserverDiaet(m) : m);
        const boden = new T.Mesh(
            new T.PlaneGeometry(30, 30),
            diaet(
                new T.MeshStandardNodeMaterial({
                    colorNode: TSL.mix(TSL.color(0x2a6a2a), TSL.color(0xc8b080), TSL.positionWorld.x.div(30).add(0.5).clamp()),
                })
            )
        );
        boden.rotation.x = -Math.PI / 2;
        boden.receiveShadow = true;
        boden.frustumCulled = false;
        gruppe.add(boden);
        const farben = [0x2f8f2f, 0x3f7f1f, 0x1f9f4f, 0x4f8f2f, 0x2f6f3f, 0x5f9f1f, 0x1f7f2f, 0x3f9f3f];
        const karten = [];
        for (let i = 0; i < farben.length; i++) {
            // Jede Karte ihr eigenes Programm (eigene Konstante): der Zeiger-Verlust trifft sie einzeln.
            const m = new T.MeshStandardNodeMaterial({ side: T.DoubleSide, alphaTest: 0.5 });
            m.colorNode = TSL.vec4(TSL.color(farben[i]), TSL.step(0.5, TSL.fract(TSL.uv().x.mul(3 + i))));
            const k = new T.Mesh(new T.PlaneGeometry(2.4, 3), diaet(m));
            k.position.set(-8 + i * 2.1, 1.6, -3 + (i % 3) * 2.5);
            k.rotation.y = 0.4 * i;
            k.castShadow = true;
            k.receiveShadow = true;
            k.frustumCulled = false;
            gruppe.add(k);
            karten.push(k);
        }
        // Das LAUB: eine ausgeschnittene Instanz-Gruppe wie die Streu der Welt — eine Instanz-Mutation refresht ihren
        // Schatten-Bürger (Instanz-Wächter der Diät), im Replay gegen den geteilten Schatten-Stoff.
        const laubStoff = new T.MeshStandardNodeMaterial({ side: T.DoubleSide, alphaTest: 0.5 });
        // Weiches Alpha (eine Rampe wie ein Blatt-Rand): alphaTest 0,5 schneidet die Hälfte, 0 fast nichts.
        laubStoff.colorNode = TSL.vec4(TSL.color(0x3a8a2a), TSL.fract(TSL.uv().y.mul(5)));
        // Ein Blätterdach: flach liegende Karten über dem Boden werfen große ausgeschnittene Schatten.
        const laub = new T.InstancedMesh(new T.PlaneGeometry(6, 6), diaet(laubStoff), 6);
        {
            const m4 = new T.Matrix4();
            for (let i = 0; i < 6; i++) {
                m4.makeRotationX(-Math.PI / 2 + 0.25 * (i % 3)).setPosition(-7 + (i % 3) * 7, 3.5, -4 + Math.floor(i / 3) * 7);
                laub.setMatrixAt(i, m4);
            }
            laub.instanceMatrix.needsUpdate = true;
        }
        laub.castShadow = true;
        laub.receiveShadow = true;
        laub.frustumCulled = false;
        gruppe.add(laub);
        for (let i = 0; i < 3; i++) {
            const kiste = new T.Mesh(new T.BoxGeometry(1.5, 1.5 + i, 1.5), diaet(new T.MeshStandardNodeMaterial({ color: 0x8a6a4a + i * 0x101010 })));
            kiste.position.set(4 + i * 2.5, 0.75 + i / 2, 5 - i * 3);
            kiste.castShadow = true;
            kiste.receiveShadow = true;
            kiste.frustumCulled = false;
            gruppe.add(kiste);
        }
        const kam = new T.PerspectiveCamera(60, 4 / 3, 0.1, 100);
        const blick = (vz) => {
            kam.position.set(1, 7, 15 * vz);
            kam.lookAt(0, 0.5, 0);
            kam.updateMatrixWorld(true);
        };
        // Zähler am echten Renderer: aufgenommene/verfolgte Draws der Haupt-Aufnahme, Schatten-Renders währenddessen,
        // Bundles unter einem overrideMaterial; dazu der geteilte Schatten-Stoff (für den fremden Zustand).
        const z = { gezeichnet: 0, verfolgt: 0, schattenRenders: 0, unterOverride: 0 };
        const stoffe = new Set();
        let aufnahmeKontext = null;
        const rbRoh = rend._renderBundle;
        rend._renderBundle = function (bundle, sc, l) {
            if (sc && sc.overrideMaterial) z.unterOverride++;
            const alt = aufnahmeKontext;
            if (!sc.overrideMaterial) aufnahmeKontext = this._currentRenderContext;
            try {
                return rbRoh.call(this, bundle, sc, l);
            } finally {
                aufnahmeKontext = alt;
            }
        };
        const odRoh = rend._renderObjectDirect;
        rend._renderObjectDirect = function (...a) {
            if (aufnahmeKontext && this._currentRenderContext === aufnahmeKontext) {
                z.gezeichnet++;
                if (this._currentRenderBundle) z.verfolgt++;
            }
            return odRoh.apply(this, a);
        };
        // Der Zähler legt sich um eine _renderScene-Bahn: das Spiel (Chokepoint), der Vendor oder nur der Stapel.
        const spielSzene = rend._renderScene;
        const protoSzene = Object.getPrototypeOf(rend)._renderScene;
        const nurStapel = function (sc, c, f) {
            const a = this._currentRenderBundle;
            this._currentRenderBundle = null;
            try {
                return protoSzene.call(this, sc, c, f);
            } finally {
                this._currentRenderBundle = a;
            }
        };
        const zaehlUm = (bahn) =>
            function (sc, c, f) {
                if (sc && sc.overrideMaterial) {
                    if (sc.overrideMaterial.isShadowPassMaterial) stoffe.add(sc.overrideMaterial);
                    if (aufnahmeKontext) z.schattenRenders++;
                }
                return bahn.call(this, sc, c, f);
            };
        rend._renderScene = zaehlUm(spielSzene);
        const W = 160,
            H = 120;
        const rt = new T.RenderTarget(W, H, { depthBuffer: true, samples: 0 });
        const schuss = async () => {
            nf.update();
            rend.setRenderTarget(rt);
            rend.render(szene, kam);
            rend.setRenderTarget(null);
            const px = await rend.readRenderTargetPixelsAsync(rt, 0, 0, W, H);
            const roh = px instanceof Uint8Array ? px : new Uint8Array(px.buffer || px);
            const zeile = W * 4,
                schritt = roh.length > zeile * H ? Math.ceil(zeile / 256) * 256 : zeile;
            const u8 = new Uint8Array(zeile * H);
            for (let y = 0; y < H; y++) u8.set(roh.subarray(y * schritt, y * schritt + zeile), y * zeile);
            return u8;
        };
        const gleich = (a, b) => {
            let g = 0;
            for (let i = 0; i < W * H; i++) {
                const o = i * 4;
                if (Math.abs(a[o] - b[o]) <= 2 && Math.abs(a[o + 1] - b[o + 1]) <= 2 && Math.abs(a[o + 2] - b[o + 2]) <= 2) g++;
            }
            return +(g / (W * H)).toFixed(4);
        };
        // Der fremde Zustand: der geteilte Schatten-Stoff trägt den alphaTest eines vollen Werfers (renderObject setzt
        // alphaTest je Objekt und setzt ihn nie zurück), und das Laub mutiert eine Instanz (sein Schatten-Bürger refresht).
        const fremderStoff = () => {
            for (const s of stoffe) s.alphaTest = 0;
            laub.instanceMatrix.needsUpdate = true;
        };
        // Ein Replay-Schuss: an X aufnehmen (zwei Frames), an Y den Replay zeichnen (vorY: vor dem Y-Frame).
        const replay = async (vorY) => {
            gruppe.isBundleGroup = true;
            gruppe.needsUpdate = true;
            blick(1);
            await schuss();
            await schuss();
            blick(-1);
            if (vorY) vorY();
            return schuss();
        };
        try {
            // Wahrheit: der direkte Pfad (die Gruppe als Gruppe) bei Y und bei X.
            gruppe.isBundleGroup = false;
            blick(-1);
            await schuss();
            const wahrY = await schuss();
            blick(1);
            const wahrX = await schuss();
            // (a)(b) die Aufnahme mit Schatten-Render, gezählt.
            gruppe.isBundleGroup = true;
            gruppe.needsUpdate = true;
            blick(1);
            aufnahmeKontext = null;
            Object.assign(z, { gezeichnet: 0, verfolgt: 0, schattenRenders: 0, unterOverride: 0 });
            await schuss();
            const aufnahme = Object.assign({}, z);
            // (c) der Replay bei Y, dann derselbe mit fremdem Schatten-Stoff.
            const bReplay = await replay(null);
            const bFremd = await replay(fremderStoff);
            // Lauf-Kontrolle 1: ohne den Chokepoint (Vendor-_renderScene, Zähler darüber).
            rend._renderScene = zaehlUm(protoSzene);
            const bOhne = await replay(null);
            // Lauf-Kontrolle 2: nur der Stapel (Bundles auch im Schatten-Render) mit fremdem Schatten-Stoff.
            rend._renderScene = zaehlUm(nurStapel);
            const bSchatten = await replay(fremderStoff);
            return {
                aufnahme,
                stoffe: stoffe.size,
                bild: {
                    replay: gleich(bReplay, wahrY),
                    fremd: gleich(bFremd, wahrY),
                    ohneStapel: gleich(bOhne, wahrY),
                    schattenBundle: gleich(bSchatten, wahrY),
                    xGegenY: gleich(wahrX, wahrY),
                },
            };
        } finally {
            rend._renderBundle = rbRoh;
            rend._renderObjectDirect = odRoh;
            rend._renderScene = spielSzene;
            rend.shadowMap.enabled = schattenAlt;
            if (rt.dispose) rt.dispose();
        }
    })();
}

(async () => {
    console.log("=== KAMERA-TREUE — echter Renderer (WebGPU, swiftshader-Adapter, kienspan, Schatten an): Stapel · Override · Bild ===");
    await new Promise((r) => server.listen(PORT, "127.0.0.1", r));
    const browser = await puppeteer.launch({
        headless: true,
        protocolTimeout: 600000,
        // WebGPU über Dawns swiftshader-Adapter (die Bundle-API lebt nur im WebGPU-Backend; der WebGL2-Rückfall liest
        // jede BundleGroup als Gruppe — dort wäre die Wand blind). Gemessen 04.10. (Windows, Chrome for Testing): nur
        // `--use-webgpu-adapter=swiftshader` liefert einen Adapter, die Vulkan-Schalter liefern keinen.
        args: [
            "--no-sandbox",
            "--disable-setuid-sandbox",
            "--enable-unsafe-webgpu",
            "--use-webgpu-adapter=swiftshader",
            "--enable-unsafe-swiftshader",
        ],
    });
    const page = await browser.newPage();
    await page.setViewport({ width: 320, height: 240 });
    const pageErrors = [];
    page.on("pageerror", (e) => pageErrors.push((e.stack || e.message || String(e)).split("\n")[0]));
    const vendorDrift = [];
    page.on("console", (m) => {
        const t = m.text();
        if (/Vendor-Drift/.test(t)) vendorDrift.push(t.slice(0, 200));
    });
    let out = null;
    const T0 = Date.now();
    const log = (z) => console.log(`  [${Math.round((Date.now() - T0) / 1000)} s] ${z}`);
    try {
        await page.goto(`http://127.0.0.1:${PORT}/index.html?holz=kienspan`, {
            waitUntil: "domcontentloaded",
            timeout: 60000,
        });
        // Nur der Renderer muss stehen (die Welt selbst ist nicht die Bühne).
        const bereit = await page.evaluate(async () => {
            const t0 = performance.now();
            while (performance.now() - t0 < 240000) {
                const r = window.anazhRealm;
                if (r && r.state && r.state.rendererReady && r.state.renderer && r.state.renderer.backend) {
                    r.state.renderer.setAnimationLoop(null);
                    const be = r.state.renderer.backend;
                    return {
                        ok: true,
                        ms: Math.round(performance.now() - t0),
                        wahrheit: !!r.state.renderer.__anazhBundleWahrheit,
                        webgpu: be.isWebGPUBackend === true,
                    };
                }
                await new Promise((res) => setTimeout(res, 100));
            }
            return { ok: false };
        });
        if (!bereit.ok) throw new Error("der Renderer stand nach 240 s nicht");
        if (!bereit.webgpu) throw new Error("kein WebGPU-Backend (die Bundle-API fehlt) — die Wand wäre blind");
        log(`Renderer bereit nach ${Math.round(bereit.ms / 1000)} s (Chokepoint ${bereit.wahrheit ? "eingehängt" : "FEHLT"})`);
        out = await page.evaluate(buehne);
        log(
            `Aufnahme: ${out.aufnahme.verfolgt}/${out.aufnahme.gezeichnet} verfolgt · ${out.aufnahme.schattenRenders} Schatten-Render · ` +
                `${out.aufnahme.unterOverride} Bundles unter Override · Bild ${JSON.stringify(out.bild)}`
        );
    } catch (e) {
        out = { error: (e && e.message) || String(e) };
    }
    await browser.close();
    server.close();
    if (!out || out.error) {
        console.log("FEHLER:", out ? out.error : "?");
        process.exit(1);
    }
    const v = urteil(out);
    if (pageErrors.length) v.push(`${pageErrors.length} Seiten-Fehler: ${pageErrors[0]}`);
    for (const d of vendorDrift) v.push(`VENDOR-DRIFT: ${d}`);
    if (v.length) {
        console.log(`\n❌ ROT — ${v.length} Verletzung(en):`);
        for (const s of v) console.log("   • " + s);
        process.exit(1);
    }
    console.log(
        `\n✅ GRÜN — die Aufnahme verfolgt ${out.aufnahme.verfolgt} von ${out.aufnahme.gezeichnet} Draws trotz Schatten-Render, ` +
            `kein Bundle unter dem Override-Stoff; der Replay zeichnet Blick Y wie der direkte Pfad (${out.bild.replay}, mit fremdem ` +
            `Schatten-Stoff ${out.bild.fremd}); ohne den Chokepoint ${out.bild.ohneStapel}, ein Schatten-Bundle ${out.bild.schattenBundle}.`
    );
})();
