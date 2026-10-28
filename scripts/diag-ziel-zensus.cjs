#!/usr/bin/env node
// ─────────────────────────────────────────────────────────────────────────
// diag-ziel-zensus.cjs — DER ZIEL-ZENSUS ALS WAND (gate:ziel-zensus, Auftrag 0710-1 P2 Familie HOST-VRAM)
//
// Jede GPU-Textur des Hosts hat ihren Leser, die Karte der Kaskade trägt keine Farbe (scripts/lib/ziel-zensus.cjs):
//   (a) ZENSUS — der echte Frame des Spiels (WebGPU auf swiftshader, Holz `kienspan`), n Frames der Bank-Runde: keine
//       Täter-Klasse fällt (ohne Leser · teilbar · volle Auflösung · Tiefe · Format), jede Textur trägt einen Erzeuger. Am Bach
//       der Mess-Wiese (`uferStellen`): ein Leser der Szenen-Tiefe zeichnet im Blick, sie MUSS im Fenster gelesen sein.
//   (b) KARTE OHNE FARBE — eine Schatten-Bühne in der Welt (Richtungslicht, ein r184-Schatten-Knoten durch die Hülle
//       `_kaskadenZiele`, wie jede Kaskade): der Schatten-Pass zeichnet ohne Farb-Anhang (die Farbe der Karte hat keine
//       GPU-Textur), der Schatten fällt (unter der Kiste dunkler als daneben), keine GPU-Validierung meldet sich.
//   (d) fiel mit K50: die Vortiefe der zeitlichen Auflösung lebt im Kanal a ihrer Geschichte (`_zeitAufloesung`), kein
//       eigenes Tiefen-Ziel und kein Kopier-Ruf mehr.
//   (c) SELBSTTEST IM FRAME — je Klasse ein eingeschmuggelter Täter nach jedem `_loopRender` (`__zielSchmuggel`): jeder
//       fällt beim Namen rot, nach dem Abbau steht kein Name des Selbsttests mehr im Zensus. Dazu ein eigenes
//       64-bit-Ziel, das sich für die Dauer als Szenen-Ziel ausweist (`__zielAusgabe`): AUSGABE-FORMAT nennt es beim Namen.
//   (r) DIE RUNDUNG DES AUSGABE-ZIELS. Quelle (Absenz): das Szenen-Bild wird in der Post-Kette höchstens EINMAL
//       abgetastet. Echter Frame: die Sonde lief, ihr Faktor passt zur Rundung des Geräts (gegen null: 1 + 2⁻⁷ · 1/(2 ln 2),
//       Blau 1 + 2⁻⁶ · 1/(2 ln 2); zum nächsten: 1), die Post-Kette liest DENSELBEN Vektor und VERBRAUCHT ihn (×2 hebt das
//       Mittel des Ausgabe-Bilds, zurückgestellt steht es bit-gleich wieder — drei Bilder EINES Frames, W9).
// SELBSTTEST (--selftest, ohne Browser, in `npm run check`): das Urteil an gebauten Läufen — sauber grün, je Klasse ein
// Täter beim Namen.
//   node scripts/diag-ziel-zensus.cjs [--selftest]   (npm run gate:ziel-zensus; Port ZIEL_ZENSUS_PORT, Standard 4597)
// ─────────────────────────────────────────────────────────────────────────
"use strict";

const { statikServer, bildSeite, uferStellen, taeterFaelle, selbsttestEnde, wandEnde } = require("./lib/welt-boot.cjs");
const { ladeSpec } = require("./lib/band-urteil.cjs");
const ZZ = require("./lib/ziel-zensus.cjs");
const stammLib = require("./lib/stamm.cjs");

const N_FRAMES = 8;
// Der Schatten der Bühne: das Pixel unter der Kiste ist um mindestens so viel dunkler (Luma, 0–255) als das freie Licht.
const SCHATTEN_MIN = 12;
// Der Ausgleich eines Geräts, das gegen null rundet (`_ausgabeSonde`): im Mittel fehlt je Kanal ein halbes ulp.
const AUSGLEICH_NULL = [1 + 0.721 / 128, 1 + 0.721 / 128, 1 + 0.721 / 64];
// So weit muss der Ausgleich ×2 das Mittel des Ausgabe-Bilds heben (Luma-Stufen), sonst liest die Post-Kette ihn nicht.
const VERBRAUCH_MIN = 3;

// (r) DIE QUELL-WAND DER RUNDUNG (rein, Node, Absenz): keine zweite Abtastung des Szenen-Bilds umgeht den Ausgleich. Dass
// `bild` ihn trägt, das Uniform den Vektor der Sonde liest und die Sonde lief, misst die Rundungs-Probe am Bild. Über den EINEN
// Helfer (stammLib.fehlt: Kommentare fallen, der Täter mit Zeile); `w` wandelt den Stamm (der Vor-Stand des Selbsttests).
function rundungQuelle(w) {
    return stammLib.fehlt("_ensurePostProcessing", /sceneColor\.sample\([\s\S]*sceneColor\.sample\(/, w)
        ? []
        : [`das Szenen-Bild wird mehrfach abgetastet (${stammLib.fehlt.wo}) — nur EINMAL in \`bild\`, jede andere Abtastung umgeht den Ausgleich`];
}

// Das Urteil der Wand über einen Lauf (rein).
function urteil(z) {
    const v = [];
    if (z.abbruch) v.push(`ABBRUCH: ${z.abbruch}`);
    for (const x of z.zensusRot || []) v.push("ZENSUS: " + x);
    if (!z.tiefeGelesen) v.push("ZENSUS: die Szenen-Tiefe trug im Fenster keinen Leser im Blick — die Wand ist blind für sie");
    const k = z.karte || {};
    if (!k.gelaufen) v.push("KARTE: die Schatten-Bühne lief nicht (die Wand ist blind für die Karte ohne Farbe)");
    else {
        if (!k.huelle) v.push("KARTE: der Schatten-Knoten der Bühne trägt die Hülle nicht (die Karte ohne Farbe ist blind)");
        if (k.farbeGpu) v.push("KARTE: die Farbe der Schatten-Karte trägt eine GPU-Textur — sie hat keinen Leser");
        if (!(k.farbAnhaenge === 0)) v.push(`KARTE: der Schatten-Pass zeichnet mit ${k.farbAnhaenge} Farb-Anhängen (Soll 0)`);
        if (!(k.schattenPaesse > 0)) v.push("KARTE: kein Schatten-Pass lief (die Probe ist blind)");
        if (!(k.dunkler >= SCHATTEN_MIN))
            v.push(`KARTE: unter der Kiste ist es nur ${k.dunkler} dunkler als daneben (Soll ≥ ${SCHATTEN_MIN}) — der Schatten fällt nicht`);
    }
    for (const x of z.rundungQuelle || []) v.push("RUNDUNG (Quelle): " + x);
    const rd = z.rundung || {};
    if (!rd.gelaufen) v.push("RUNDUNG: die Probe lief nicht (die Wand ist blind für den Ausgleich)");
    else if (rd.format === "rg11b10ufloat") {
        if (!rd.rundung) v.push("RUNDUNG: die Sonde lief nicht — das Gerät schreibt 11/11/10, und keiner weiß, wie es rundet");
        else {
            const soll = rd.rundung === "gegen null" ? AUSGLEICH_NULL : [1, 1, 1];
            if (!rd.faktor?.every((x, i) => Math.abs(x - soll[i]) < 1e-4))
                v.push(
                    `RUNDUNG: der Ausgleich ${JSON.stringify(rd.faktor)} passt nicht zur Rundung „${rd.rundung}“ ` +
                        `(Soll ${soll.map((x) => x.toFixed(5)).join("/")})`
                );
        }
        if (!rd.gleich) v.push("RUNDUNG: die Post-Kette liest einen anderen Vektor als den, den die Sonde setzt");
        if (!(rd.verbrauch >= VERBRAUCH_MIN))
            v.push(
                `RUNDUNG: der Ausgleich ×2 hebt das Mittel des Ausgabe-Bilds nur um ${rd.verbrauch} Stufen (Soll ≥ ${VERBRAUCH_MIN}) ` +
                    "— die Post-Kette liest ihn nicht"
            );
        if (!rd.einFrame) v.push("RUNDUNG: die drei Bilder liegen nicht in EINEM Frame (der Rückweg misst die Welt statt des Ausgleichs)");
        else if (rd.zurueck !== 0) v.push(`RUNDUNG: zurückgestellt bleibt das Bild um ${rd.zurueck} Stufen verschoben`);
    }
    for (const f of z.gpuFehler || []) v.push("GPU: " + f);
    const s = z.selbst || [];
    if (!s.length) v.push("SELBSTTEST: der Schmuggel lief nicht");
    for (const x of s) if (!x.ok) v.push(`SELBSTTEST: blind für ${x.muss}`);
    if ((z.rest || []).length) v.push(`SELBSTTEST: nach dem Abbau noch im Zensus: ${z.rest.join(", ")}`);
    return v;
}

function selbsttest() {
    const fehler = ZZ.selbsttest().map((s) => "Zensus-Urteil: " + s);
    const gruen = {
        zensusRot: [],
        tiefeGelesen: true,
        karte: { gelaufen: true, huelle: true, farbeGpu: false, farbAnhaenge: 0, schattenPaesse: 3, dunkler: 60 },
        gpuFehler: [],
        selbst: [{ muss: "OHNE LESER", ok: true }],
        rest: [],
        rundungQuelle: [],
        rundung: {
            gelaufen: true,
            format: "rg11b10ufloat",
            rundung: "gegen null",
            faktor: AUSGLEICH_NULL.slice(),
            gleich: true,
            einFrame: true,
            verbrauch: 24,
            zurueck: 0,
        },
    };
    if (urteil(gruen).length) fehler.push("der grüne Lauf fällt rot: " + urteil(gruen).join(" · "));
    const mit = (f) => {
        const z = JSON.parse(JSON.stringify(gruen));
        f(z);
        return z;
    };
    const faelle = [
        { name: "Täter im Zensus", z: mit((z) => (z.zensusRot = ["OHNE LESER: kaskade0:farbe"])), muss: /ZENSUS: OHNE LESER/ },
        { name: "kein Leser der Tiefe im Blick", z: mit((z) => (z.tiefeGelesen = false)), muss: /keinen Leser im Blick/ },
        { name: "Farbe auf der GPU", z: mit((z) => (z.karte.farbeGpu = true)), muss: /trägt eine GPU-Textur/ },
        { name: "Farb-Anhang im Schatten-Pass", z: mit((z) => (z.karte.farbAnhaenge = 1)), muss: /mit 1 Farb-Anhängen/ },
        { name: "Schatten fällt nicht", z: mit((z) => (z.karte.dunkler = 1)), muss: /der Schatten fällt nicht/ },
        { name: "Hülle fehlt", z: mit((z) => (z.karte.huelle = false)), muss: /trägt die Hülle nicht/ },
        { name: "Bühne blind", z: mit((z) => (z.karte = {})), muss: /lief nicht/ },
        { name: "GPU-Validierung", z: mit((z) => (z.gpuFehler = ["Attachment state mismatch"])), muss: /GPU: Attachment/ },
        { name: "Schmuggel blind", z: mit((z) => (z.selbst = [{ muss: "TEILBAR", ok: false }])), muss: /blind für TEILBAR/ },
        { name: "Schmuggel bleibt", z: mit((z) => (z.rest = ["zensus-selbsttest:bloom"])), muss: /noch im Zensus/ },
        { name: "Sonde lief nicht", z: mit((z) => (z.rundung.rundung = null)), muss: /die Sonde lief nicht/ },
        { name: "Ausgleich verloren", z: mit((z) => (z.rundung.faktor = [1, 1, 1])), muss: /passt nicht zur Rundung „gegen null“/ },
        {
            name: "Ausgleich auf einem Gerät, das zum nächsten rundet",
            z: mit((z) => (z.rundung.rundung = "zum nächsten")),
            muss: /passt nicht zur Rundung „zum nächsten“/,
        },
        { name: "anderer Vektor", z: mit((z) => (z.rundung.gleich = false)), muss: /liest einen anderen Vektor/ },
        { name: "Ausgleich nicht verbraucht", z: mit((z) => (z.rundung.verbrauch = 0)), muss: /die Post-Kette liest ihn nicht/ },
        { name: "Rückweg verschoben", z: mit((z) => (z.rundung.zurueck = -1.77)), muss: /um -1.77 Stufen verschoben/ },
        { name: "Rückweg über zwei Frames", z: mit((z) => (z.rundung.einFrame = false)), muss: /nicht in EINEM Frame/ },
        { name: "Rundungs-Probe blind", z: mit((z) => (z.rundung = {})), muss: /RUNDUNG: die Probe lief nicht/ },
        { name: "Quelle ohne Ausgleich", z: mit((z) => (z.rundungQuelle = ["x"])), muss: /RUNDUNG \(Quelle\): x/ },
    ];
    taeterFaelle(faelle, urteil, { fehler });
    // die Quell-Wand am Stamm: grün; eine zweite Abtastung → rot
    const q0 = rundungQuelle();
    if (q0.length) fehler.push("Quell-Wand der Rundung am Stamm rot: " + q0.join(" · "));
    console.log(`  ${q0.length ? "❌" : "✅"} Quell-Wand der Rundung am Stamm → ${q0.join(" · ") || "grün"}`);
    const quellFaelle = [
        {
            name: "zweite Abtastung am Ausgleich vorbei",
            // eine Mutation, die den Stamm nicht trifft, wirft (stammLib.ersetze: vakuös)
            z: (t) => stammLib.ersetze(t, "_ensurePostProcessing", "const roh = bild(screenUV);", "const roh = bild(screenUV);\nconst roh2 = sceneColor.sample(screenUV);"),
            muss: /mehrfach abgetastet/,
        },
    ];
    taeterFaelle(quellFaelle, rundungQuelle, { fehler });
    return fehler;
}

if (process.argv.includes("--selftest")) {
    console.log("=== ZIEL-ZENSUS — Selbsttest (ohne Browser) ===");
    selbsttestEnde(selbsttest(), "das Urteil nennt jeden gebauten Täter beim Namen, der saubere Lauf bleibt grün.");
    process.exit(0);
}

const { vramAbgriff } = require("./lib/vram-abgriff.cjs");
const { FALTE_INSTALL, ZAEHLER_INSTALL } = require("./lib/draw-zaehler.cjs");
const { ZERLEGE_INSTALL } = require("./lib/zerlege-linse.cjs");
const { AUSGABE_INSTALL } = require("./lib/ausgabe-aufnahme.cjs");

const PORT = Number(process.env.ZIEL_ZENSUS_PORT) || 4597;
const server = statikServer();

// DIE SCHATTEN-BÜHNE (Seite): ein Richtungslicht mit einem r184-Schatten-Knoten, der durch die Hülle der Kaskaden geht
// (`_kaskadenZiele`), eine Kiste über einem Boden, eine Kamera von oben. Gezählt: die Farb-Anhänge jedes Passes, der in
// die Schatten-Karte zeichnet, und die GPU-Textur ihrer Farbe; das Bild: Luma unter der Kiste gegen freies Licht.
function karteOhneFarbe() {
    return (async () => {
        const r = window.anazhRealm,
            st = r.state,
            T = window.THREE,
            TSL = T.TSL;
        const rend = st.renderer;
        const be = rend.backend;
        const aus = { gelaufen: false };
        const schattenAlt = rend.shadowMap.enabled;
        rend.shadowMap.enabled = true;
        const szene = new T.Scene();
        szene.name = "ziel-zensus:schatten-buehne";
        const licht = new T.DirectionalLight(0xffffff, 3);
        // schräges Licht (von +x): der Schatten der Kiste fällt links neben sie (Boden x ∈ [−8,5; −6]), sichtbar von oben
        licht.position.set(10, 20, 0);
        licht.castShadow = true;
        licht.shadow.mapSize.set(256, 256);
        Object.assign(licht.shadow.camera, { left: -10, right: 10, top: 10, bottom: -10, near: 0.5, far: 50 });
        licht.shadow.camera.updateProjectionMatrix();
        const sn = TSL.shadow(licht, licht.shadow);
        licht.shadow.shadowNode = sn;
        r._kaskadenZiele({ _shadowNodes: [sn] });
        aus.huelle = Object.prototype.hasOwnProperty.call(sn, "setupRenderTarget");
        szene.add(licht, licht.target, new T.AmbientLight(0xffffff, 0.2));
        const boden = new T.Mesh(new T.PlaneGeometry(20, 20), new T.MeshStandardNodeMaterial({ color: 0xc8c8c8 }));
        boden.rotation.x = -Math.PI / 2;
        boden.receiveShadow = true;
        const kiste = new T.Mesh(new T.BoxGeometry(4, 4, 4), new T.MeshStandardNodeMaterial({ color: 0x806040 }));
        kiste.position.set(-4, 3, 0);
        kiste.castShadow = true;
        szene.add(boden, kiste);
        const kam = new T.OrthographicCamera(-10, 10, 10, -10, 0.1, 100);
        // BÜHNE: eigene Szene der Ziel-Bühne
        kam.position.set(0, 40, 0);
        kam.up.set(0, 0, -1);
        kam.lookAt(0, 0, 0);
        kam.updateMatrixWorld(true);
        const ziel = new T.RenderTarget(64, 64, { depthBuffer: true });
        ziel.texture.name = "ziel-zensus:schatten-bild";
        // die Pässe in die Schatten-Karte: ihre Tiefe ist die Karten-Tiefe (DepthTexture des Schatten-Ziels)
        let schattenPaesse = 0,
            farbAnhaenge = 0;
        const CE = GPUCommandEncoder.prototype;
        const brp = CE.beginRenderPass;
        CE.beginRenderPass = function (d) {
            const ds = d && d.depthStencilAttachment;
            const t = ds && window.__viewTex ? window.__viewTex.get(ds.view) : null;
            if (t && /^kaskade\d+:tiefe/.test(String(t.__vramK || "").replace(/^tex:/, ""))) {
                schattenPaesse++;
                farbAnhaenge += (d?.colorAttachments || []).filter(Boolean).length;
            }
            return brp.call(this, d);
        };
        try {
            for (let i = 0; i < 3; i++) {
                rend.setRenderTarget(ziel);
                rend.render(szene, kam);
            }
            rend.setRenderTarget(null);
            await be.device.queue.onSubmittedWorkDone();
            const px = await rend.readRenderTargetPixelsAsync(ziel, 0, 0, 64, 64);
            const u8 = px instanceof Uint8Array ? px : new Uint8Array(px.buffer || px);
            const zeile = u8.length / 64;
            const lum = (x, y) => {
                const i = y * zeile + x * 4;
                return 0.2126 * u8[i] + 0.7152 * u8[i + 1] + 0.0722 * u8[i + 2];
            };
            // Draufsicht (rechts = +x, Spalte = (x + 10) / 20 · 64, Zeile 32 = z 0): der Schatten bei x = −7,25 (Spalte 9),
            // freies Licht bei x = +6 (Spalte 51)
            const schatten = lum(9, 32),
                frei = lum(51, 32);
            aus.dunkler = +(frei - schatten).toFixed(1);
            aus.luma = [+schatten.toFixed(1), +frei.toFixed(1)];
            const map = licht.shadow.map;
            aus.farbeGpu = !!(map?.texture && be.has(map.texture) && be.get(map.texture).texture);
            aus.schattenPaesse = schattenPaesse;
            aus.farbAnhaenge = farbAnhaenge;
            aus.gelaufen = true;
        } finally {
            CE.beginRenderPass = brp;
            rend.shadowMap.enabled = schattenAlt;
            ziel.dispose();
        }
        return aus;
    })();
}

function rundungProbe() {
    return (async () => {
        const r = window.anazhRealm,
            st = r.state,
            rend = st.renderer,
            A = st._ausgabeAusgleich;
        const U = st.postProcessingUniforms && st.postProcessingUniforms.ausgabeAusgleich;
        const aus = { gelaufen: true, format: st._ausgabeFormat || null, rundung: st._ausgabeRundung || null, faktor: A && A.toArray(), gleich: !!(A && U && U.value === A) };
        if (!A) return Object.assign(aus, { einFrame: true, verbrauch: 0, zurueck: 0 });
        // DREI BILDER EINES FRAMES (W9): vorher, Ausgleich ×2 und zurück zeichnet die Post-Kette über EINEN Szenen-Pass (r184 rendert
        // PassNode und TRAANode einmal je Knoten-Frame; der Block ist synchron, kein rAF schaltet ihn).
        window.__buehne();
        await window.__ausgabeAufnahme(64, 48, 1, { satz: "messung" }); // die Erst-Ruhe und die Geschichte der zeitlichen Auflösung
        const db = rend.getDrawingBufferSize(new window.THREE.Vector2()),
            [W, H] = [Math.round(db.x), Math.round(db.y)];
        const ziele = [1, 2, 1].map((k) => [k, new window.THREE.RenderTarget(W, H, { depthBuffer: true, samples: 0 })]);
        const [alt, vorOut, vorZiel, nf] = [A.clone(), rend.getOutputRenderTarget(), rend.getRenderTarget(), rend._nodes.nodeFrame];
        const m = [];
        try {
            const f0 = (nf.update(), nf.frameId);
            for (const [k, rt] of ziele) {
                A.copy(alt).multiplyScalar(k);
                rend.setOutputRenderTarget(rt);
                r._loopRender(); // zur Bild-Uhr (A9)
            }
            aus.einFrame = nf.frameId === f0;
            for (const [, rt] of ziele) {
                const px = await rend.readRenderTargetPixelsAsync(rt, 0, 0, W, H);
                const u8 = px instanceof Uint8Array ? px : new Uint8Array(px.buffer || px);
                const zeile = u8.length > W * 4 * H ? Math.ceil((W * 4) / 256) * 256 : W * 4; // WebGPU richtet Zeilen auf 256 Byte aus
                let s = 0;
                for (let i = 0, o = 0; i < W * H; i++, o = Math.floor(i / W) * zeile + (i % W) * 4) s += 0.2126 * u8[o] + 0.7152 * u8[o + 1] + 0.0722 * u8[o + 2];
                m.push(s / (W * H));
            }
        } finally {
            A.copy(alt);
            rend.setOutputRenderTarget(vorOut);
            rend.setRenderTarget(vorZiel);
            for (const [, rt] of ziele) rt.dispose();
        }
        return Object.assign(aus, { mittel: +m[0].toFixed(1), verbrauch: +(m[1] - m[0]).toFixed(2), zurueck: +(m[2] - m[0]).toFixed(2) });
    })();
}

(async () => {
    console.log("=== ZIEL-ZENSUS — die Wand am echten Frame (WebGPU auf swiftshader) ===");
    await server.lausche(PORT);
    const { browser, page } = await bildSeite({ art: "linse", frist: 900000 }, 320, 240);
    await page.evaluateOnNewDocument(FALTE_INSTALL);
    await page.evaluateOnNewDocument(vramAbgriff);
    const T0 = Date.now();
    const log = (z) => console.log(`  [${Math.round((Date.now() - T0) / 1000)} s] ${z}`);
    let out = {};
    try {
        await server.zeige(page, 60000, "index.html?holz=kienspan");
        const bereit = await page.evaluate(async () => {
            const t0 = performance.now();
            const r = await window.__weltDa((r) => {
                const st = r.state;
                return !!(st?.rendererReady && st.renderer?.backend && st.postProcessing && st.camera);
            });
            const st = r.state;
            return { ok: true, ms: Math.round(performance.now() - t0), webgpu: st.renderer.backend.isWebGPUBackend === true };
        });
        if (!bereit.webgpu) throw new Error("kein WebGPU-Backend — der Zensus liest GPU-Befehle, die Wand wäre blind");
        log(`Renderer und Post-Kette bereit nach ${Math.round(bereit.ms / 1000)} s`);
        // DER LESER IM BLICK: das Wasser am Bach der Mess-Wiese zeichnet — die Szenen-Tiefe steht mit ihrem Leser im Zensus
        const ufer = await page.evaluate(uferStellen, { messort: ladeSpec("wiese").ort.spieler });
        if (ufer.fehler) throw new Error(ufer.fehler);
        log(`am Ufer ${JSON.stringify(ufer)}`);
        await page.evaluate(ZAEHLER_INSTALL);
        await page.evaluate(ZERLEGE_INSTALL);
        await page.evaluate(AUSGABE_INSTALL); // die Ruhe der Erst-Zeichnung (`__erstRuhe`), vor jedem Zensus
        await page.evaluate(ZZ.ZIEL_INSTALL);
        await page.evaluate(() => {
            const r = window.anazhRealm;
            r.state.renderer.setAnimationLoop(null);
            window.__gpuFehlerZ = [];
            r.state.renderer.backend.device.addEventListener("uncapturederror", (e) =>
                window.__gpuFehlerZ.push(String(e.error?.message || e.message || e).slice(0, 240))
            );
        });
        const zensus = async () => {
            const z = await page.evaluate((k) => window.__zielZensus(k), { n: N_FRAMES });
            if (!z || z.fehler) return { z, u: ZZ.zielUrteil(z, []) };
            const ids = z.ziele
                .filter((x) => !x.leinwand && !x.tiefe && x.kopierbar && /^(r|rg|rgba|bgra)(8|16|32)/.test(x.format))
                .map((x) => x.id);
            const lesen = await page.evaluate((k) => window.__zielLesen(k), { ids });
            return { z, u: ZZ.zielUrteil(z, lesen) };
        };
        // (c) der Schmuggel zuerst: jeder Täter beim Namen, danach restlos fort
        const s = await page.evaluate(() => window.__zielSchmuggel(true));
        if (!s || s.fehler) throw new Error("Schmuggel: " + (s?.fehler || "keine Antwort"));
        let mit;
        try {
            mit = await zensus();
        } finally {
            await page.evaluate(() => window.__zielSchmuggel(false));
        }
        const soll = [
            /OHNE LESER: zensus-selbsttest:ohne-leser/,
            /VOLLE AUFLÖSUNG: zensus-selbsttest:bloom/,
            /TEILBAR: zensus-selbsttest:paar-a und zensus-selbsttest:paar-b/,
            /DOPPELTE TIEFE: zensus-selbsttest:tiefe-kopie .* ist eine Kopie von depth,/,
            /FORMAT: zensus-selbsttest:f32 /,
        ];
        out.selbst = soll.map((m) => ({ muss: m.source, ok: mit.u.rot.some((x) => m.test(x)) }));
        // das ausgewiesene 64-bit-Szenen-Ziel: ROT auf einem Gerät mit rg11b10ufloat-renderable, sonst nennt der Zensus die
        // Adapter-Bedingung beim Namen
        if (mit.z?.geraet?.rg11b10)
            out.selbst.push({
                muss: "AUSGABE-FORMAT: zensus-selbsttest:ausgabe",
                ok: mit.u.rot.some((x) => /AUSGABE-FORMAT: zensus-selbsttest:ausgabe /.test(x)),
            });
        else
            out.selbst.push({
                muss: "ADAPTER … zensus-selbsttest:ausgabe",
                ok: mit.u.hinweis.some((x) => /ADAPTER: .*zensus-selbsttest:ausgabe /.test(x)),
            });
        log(`Schmuggel: ${out.selbst.filter((x) => x.ok).length} von ${out.selbst.length} Tätern beim Namen`);
        // (a) der Zensus des echten Frames
        const { z, u } = await zensus();
        out.zensusRot = u.rot;
        const tiefe = (z.ziele || []).find((x) => x.name === "szene:tiefenabbild");
        out.tiefeGelesen = !!tiefe && tiefe.ereignisse.some((e) => e.art === "R");
        out.rest = u.zeilen.filter((x) => /zensus-selbsttest/.test(x.name)).map((x) => x.name);
        log(
            `Zensus: ${u.zeilen.length} Texturen, ${z.frames} Frames, ${u.rot.length} rot, ${u.hinweis.length} Hinweise; ` +
                `Ruhe der Erst-Zeichnung ${z.erst ? z.erst.warteMs + " ms, offen " + z.erst.offen : "-"}`
        );
        if (process.env.ZIEL_ZENSUS_TABELLE) console.log(ZZ.zielTabelle(u, z));
        // (b) die Karte ohne Farbe
        out.karte = await page.evaluate(karteOhneFarbe);
        log(`Karte ohne Farbe: ${JSON.stringify(out.karte)}`);
        // (r) die Rundung des Ausgabe-Ziels: Quelle und echter Frame
        out.rundungQuelle = rundungQuelle();
        out.rundung = await page.evaluate(rundungProbe);
        log(`Rundung: ${JSON.stringify(out.rundung)}`);
        out.gpuFehler = await page.evaluate(() => window.__gpuFehlerZ.slice(0, 5));
    } catch (e) {
        out.abbruch = e?.message || String(e);
    }
    await browser.close();
    server.close();
    const v = urteil(out);
    wandEnde(
        v,
        `kein Ziel ohne Leser, keine Klasse fällt; die Schatten-Karte zeichnet ohne Farbe (${out.karte.schattenPaesse} Pässe, ` +
            `0 Farb-Anhänge, Schatten ${out.karte.dunkler} dunkler); ` +
            `${out.selbst.length} eingeschmuggelte Täter beim Namen und restlos fort; die Ausgabe ` +
            `${out.rundung.format} rundet ${out.rundung.rundung || "-"}, der Ausgleich ${JSON.stringify(out.rundung.faktor)} wirkt ` +
            `(×2 hebt das Mittel um ${out.rundung.verbrauch} Stufen).`
    );
})();
