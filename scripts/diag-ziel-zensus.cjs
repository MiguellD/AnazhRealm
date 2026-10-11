#!/usr/bin/env node
// ─────────────────────────────────────────────────────────────────────────
// diag-ziel-zensus.cjs — DER ZIEL-ZENSUS ALS WAND (gate:ziel-zensus, 07.10., Auftrag 0710-1 P2 Familie HOST-VRAM)
//
// Befund (OMEN, GTX 1060, V18.534, Mess-Wiese, `werkbank ziele`): von 29 GPU-Texturen des Hosts (108,8 MB) hatten zwei
// keinen Leser — die r8-Farben der Schatten-Kaskaden (kaskade0:farbe, kaskade1:farbe, je 4 MB), geschrieben in k0/k1,
// gelesen von keinem Pass. Jede andere Textur der Post-Kette (Szene, Auflösung, Geschichte, drei Tiefen) hat ihren Leser
// und lebt mit ihren Formgleichen zugleich. Die Wand hält das (scripts/lib/ziel-zensus.cjs):
//   (a) ZENSUS — der echte Frame des Spiels (WebGPU auf swiftshader, Holz `kienspan`), n Frames der Bank-Runde: keine
//       Täter-Klasse fällt (ohne Leser · teilbar · volle Auflösung · Tiefe · Format), jede Textur trägt einen Erzeuger.
//   (b) KARTE OHNE FARBE — eine Schatten-Bühne in der Welt (Richtungslicht, ein r184-Schatten-Knoten durch die Hülle
//       `_kaskadenZiele`, wie jede Kaskade): der Schatten-Pass zeichnet ohne Farb-Anhang (die Farbe der Karte hat keine
//       GPU-Textur), der Schatten fällt (unter der Kiste dunkler als daneben), keine GPU-Validierung meldet sich.
//   (d) VORTIEFE — die Geschichts-Tiefe der zeitlichen Auflösung trägt 16 bit: ein Ziel wie der Knoten es baut durch
//       `_traaVortiefe`, der Kopier-Ruf des Knotens zeichnet den Verlauf einer Ebene hinein, die Farbe der Geschichte bleibt.
//   (c) SELBSTTEST IM FRAME — je Klasse ein eingeschmuggelter Täter nach jedem `_loopRender` (`__zielSchmuggel`): jeder
//       fällt beim Namen rot, nach dem Abbau steht kein Name des Selbsttests mehr im Zensus. Dazu (0910-3 B) ein eigenes
//       64-bit-Ziel, das sich für die Dauer als Szenen-Ziel ausweist (`__zielAusgabe`): AUSGABE-FORMAT nennt es beim Namen.
//   (r) DIE RUNDUNG DES AUSGABE-ZIELS (0910-3 B). Quelle: das Szenen-Bild wird in der Post-Kette genau EINMAL abgetastet, in
//       `bild` mit dem Ausgleich (`.mul(u.ausgabeAusgleich)`), das Uniform liest den Vektor der Sonde, `_ausgabeFormat` ruft
//       die Sonde. Echter Frame: die Sonde lief, ihr Faktor passt zur Rundung des Geräts (gegen null: 1 + 2⁻⁷ · 1/(2 ln 2),
//       Blau 1 + 2⁻⁶ · 1/(2 ln 2); zum nächsten: 1), die Post-Kette liest DENSELBEN Vektor und VERBRAUCHT ihn (×2 hebt das
//       Mittel des Ausgabe-Bilds, zurückgestellt steht es wieder).
// SELBSTTEST (--selftest, ohne Browser, in `npm run check`): das Urteil an gebauten Läufen — sauber grün, je Klasse ein
// Täter beim Namen.
//   node scripts/diag-ziel-zensus.cjs [--selftest]   (npm run gate:ziel-zensus; Port ZIEL_ZENSUS_PORT, Standard 4597)
// ─────────────────────────────────────────────────────────────────────────
"use strict";

const ZZ = require("./lib/ziel-zensus.cjs");

const N_FRAMES = 8;
// Der Schatten der Bühne: das Pixel unter der Kiste ist um mindestens so viel dunkler (Luma, 0–255) als das freie Licht.
const SCHATTEN_MIN = 12;
// Der Ausgleich eines Geräts, das gegen null rundet (`_ausgabeSonde`): im Mittel fehlt je Kanal ein halbes ulp.
const AUSGLEICH_NULL = [1 + 0.721 / 128, 1 + 0.721 / 128, 1 + 0.721 / 64];
// So weit muss der Ausgleich ×2 das Mittel des Ausgabe-Bilds heben (Luma-Stufen), sonst liest die Post-Kette ihn nicht.
const VERBRAUCH_MIN = 3;

// (r) DIE QUELL-WAND DER RUNDUNG (rein, Node): jede Abtastung des Szenen-Bilds trägt den Ausgleich.
function rundungQuelle(src) {
    const b = [];
    const methode = (name) => {
        const i = src.indexOf(`\n    ${name}(`);
        if (i < 0) return null;
        const j = src.indexOf("\n    }\n", i);
        return j < 0 ? null : src.slice(i, j);
    };
    const post = methode("_ensurePostProcessing");
    if (!post) b.push("_ensurePostProcessing fehlt");
    else {
        if (!/const bild = \(uv\) => sceneColor\.sample\(uv\)\.rgb\.mul\(u\.ausgabeAusgleich\)/.test(post))
            b.push("die Abtastung des Szenen-Bilds (`bild`) trägt den Ausgleich nicht (`.mul(u.ausgabeAusgleich)`)");
        const n = (post.match(/sceneColor\.sample\(/g) || []).length;
        if (n !== 1) b.push(`das Szenen-Bild wird ${n}× abgetastet — nur EINMAL in \`bild\`, jede andere Abtastung umgeht den Ausgleich`);
        if (!/ausgabeAusgleich: uniform\(this\.state\._ausgabeAusgleich/.test(post))
            b.push("das Uniform `ausgabeAusgleich` liest nicht den Vektor der Sonde (`state._ausgabeAusgleich`)");
    }
    const fmt = methode("_ausgabeFormat");
    if (!fmt || !/this\._ausgabeSonde\(/.test(fmt)) b.push("`_ausgabeFormat` ruft die Sonde nicht (`_ausgabeSonde`)");
    return b;
}

// Das Urteil der Wand über einen Lauf (rein).
function urteil(z) {
    const v = [];
    if (z.abbruch) v.push(`ABBRUCH: ${z.abbruch}`);
    for (const x of z.zensusRot || []) v.push("ZENSUS: " + x);
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
    const vt = z.vortiefe || {};
    if (!vt.gelaufen) v.push("VORTIEFE: die Probe lief nicht (die Wand ist blind für die 16-bit-Vortiefe)");
    else {
        if (!vt.typ || vt.format !== "depth16unorm") v.push(`VORTIEFE: die Geschichts-Tiefe trägt ${vt.format}, nicht depth16unorm`);
        if (!(vt.oben > vt.mitte && vt.mitte > vt.unten && vt.unten > 0 && vt.oben < 0.9999))
            v.push(`VORTIEFE: die Vortiefe trägt den Verlauf der Ebene nicht (oben ${vt.oben} · Mitte ${vt.mitte} · unten ${vt.unten})`);
        const soll = [0.25, 0.5, 0.75];
        if (!(vt.farbe && vt.farbe.every((x, i) => Math.abs(x - soll[i]) < 0.01)))
            v.push(`VORTIEFE: die Farbe der Geschichte änderte sich (${JSON.stringify(vt.farbe)} statt ${JSON.stringify(soll)})`);
    }
    for (const x of z.rundungQuelle || []) v.push("RUNDUNG (Quelle): " + x);
    const rd = z.rundung || {};
    if (!rd.gelaufen) v.push("RUNDUNG: die Probe lief nicht (die Wand ist blind für den Ausgleich)");
    else if (rd.format === "rg11b10ufloat") {
        if (!rd.rundung) v.push("RUNDUNG: die Sonde lief nicht — das Gerät schreibt 11/11/10, und keiner weiß, wie es rundet");
        else {
            const soll = rd.rundung === "gegen null" ? AUSGLEICH_NULL : [1, 1, 1];
            if (!(rd.faktor && rd.faktor.every((x, i) => Math.abs(x - soll[i]) < 1e-4)))
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
        if (!(Math.abs(rd.zurueck) < 1)) v.push(`RUNDUNG: zurückgestellt bleibt das Bild um ${rd.zurueck} Stufen verschoben`);
    }
    for (const f of z.gpuFehler || []) v.push("GPU: " + f);
    for (const f of z.seitenFehler || []) v.push("SEITE: " + f);
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
        karte: { gelaufen: true, huelle: true, farbeGpu: false, farbAnhaenge: 0, schattenPaesse: 3, dunkler: 60 },
        vortiefe: { gelaufen: true, typ: true, format: "depth16unorm", oben: 0.99, mitte: 0.98, unten: 0.95, farbe: [0.25, 0.5, 0.75] },
        gpuFehler: [],
        seitenFehler: [],
        selbst: [{ muss: "OHNE LESER", ok: true }],
        rest: [],
        rundungQuelle: [],
        rundung: {
            gelaufen: true,
            format: "rg11b10ufloat",
            rundung: "gegen null",
            faktor: AUSGLEICH_NULL.slice(),
            gleich: true,
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
        { name: "Farbe auf der GPU", z: mit((z) => (z.karte.farbeGpu = true)), muss: /trägt eine GPU-Textur/ },
        { name: "Farb-Anhang im Schatten-Pass", z: mit((z) => (z.karte.farbAnhaenge = 1)), muss: /mit 1 Farb-Anhängen/ },
        { name: "Schatten fällt nicht", z: mit((z) => (z.karte.dunkler = 1)), muss: /der Schatten fällt nicht/ },
        { name: "Hülle fehlt", z: mit((z) => (z.karte.huelle = false)), muss: /trägt die Hülle nicht/ },
        { name: "Bühne blind", z: mit((z) => (z.karte = {})), muss: /lief nicht/ },
        { name: "Vortiefe 32 bit", z: mit((z) => (z.vortiefe.format = "depth24plus")), muss: /trägt depth24plus/ },
        { name: "Vortiefe leer", z: mit((z) => Object.assign(z.vortiefe, { oben: 1, mitte: 1, unten: 1 })), muss: /trägt den Verlauf der Ebene nicht/ },
        { name: "Geschichte überschrieben", z: mit((z) => (z.vortiefe.farbe = [0, 0, 0])), muss: /Farbe der Geschichte änderte sich/ },
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
        { name: "Rundungs-Probe blind", z: mit((z) => (z.rundung = {})), muss: /RUNDUNG: die Probe lief nicht/ },
        { name: "Quelle ohne Ausgleich", z: mit((z) => (z.rundungQuelle = ["x"])), muss: /RUNDUNG \(Quelle\): x/ },
    ];
    for (const f of faelle) {
        const v = urteil(f.z);
        const ok = v.some((s) => f.muss.test(s));
        if (!ok) fehler.push(`${f.name}: die Wand nennt den Täter nicht (${f.muss})`);
        console.log(`  ${ok ? "✅" : "❌"} Selbsttest „${f.name}" → ${v.join(" · ") || "(grün)"}`);
    }
    // die Quell-Wand am Stamm: grün; der Ausgleich entfernt, eine zweite Abtastung, die Sonde nicht gerufen → rot
    const stamm = require("fs").readFileSync(require("path").join(__dirname, "..", "anazhRealm.js"), "utf8");
    const q0 = rundungQuelle(stamm);
    if (q0.length) fehler.push("Quell-Wand der Rundung am Stamm rot: " + q0.join(" · "));
    console.log(`  ${q0.length ? "❌" : "✅"} Quell-Wand der Rundung am Stamm → ${q0.join(" · ") || "grün"}`);
    const quellFaelle = [
        { name: "Ausgleich entfernt", src: stamm.replace(".rgb.mul(u.ausgabeAusgleich)", ".rgb"), muss: /trägt den Ausgleich nicht/ },
        {
            name: "zweite Abtastung am Ausgleich vorbei",
            src: stamm.replace("const mitte = bild(screenUV);", "const mitte = bild(screenUV);\nconst roh = sceneColor.sample(screenUV);"),
            muss: /2× abgetastet/,
        },
        { name: "Sonde nicht gerufen", src: stamm.replace("this._ausgabeSonde(dev);", ""), muss: /ruft die Sonde nicht/ },
    ];
    for (const q of quellFaelle) {
        if (q.src === stamm) {
            fehler.push(`${q.name}: die Mutation trifft den Stamm nicht (die Probe ist veraltet)`);
            continue;
        }
        const b = rundungQuelle(q.src);
        const ok = b.some((x) => q.muss.test(x));
        if (!ok) fehler.push(`${q.name}: die Quell-Wand nennt den Täter nicht (${q.muss})`);
        console.log(`  ${ok ? "✅" : "❌"} Selbsttest „${q.name}" → ${b.join(" · ") || "(grün)"}`);
    }
    return fehler;
}

if (process.argv.includes("--selftest")) {
    console.log("=== ZIEL-ZENSUS — Selbsttest (ohne Browser) ===");
    const f = selbsttest();
    if (f.length) {
        console.log("\n❌ SELBSTTEST ROT — die Wand ist vakuös: " + f.join(" · "));
        process.exit(1);
    }
    console.log("\n✅ SELBSTTEST GRÜN — das Urteil nennt jeden gebauten Täter beim Namen, der saubere Lauf bleibt grün.");
    process.exit(0);
}

const puppeteer = require("puppeteer");
const http = require("http");
const fs = require("fs");
const path = require("path");
const { softwareWebGpuArgs } = require("./lib/software-gpu.cjs");
const { vramAbgriff } = require("./lib/vram-abgriff.cjs");
const { FALTE_INSTALL, ZAEHLER_INSTALL } = require("./lib/draw-zaehler.cjs");
const { ZERLEGE_INSTALL } = require("./lib/zerlege-linse.cjs");
const { AUSGABE_INSTALL } = require("./lib/ausgabe-aufnahme.cjs");

const root = path.resolve(__dirname, "..");
const PORT = Number(process.env.ZIEL_ZENSUS_PORT) || 4597;
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
                farbAnhaenge += ((d && d.colorAttachments) || []).filter(Boolean).length;
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
            aus.farbeGpu = !!(map && map.texture && be.has(map.texture) && be.get(map.texture).texture);
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

// DIE VORTIEFE IN 16 BIT (Seite): eine schräge Ebene in ein Ziel mit depth24plus-Tiefe, ein Geschichts-Ziel wie der
// TRAA-Knoten es baut (Farbe rgba16float + DepthTexture) durch `_traaVortiefe`, dessen Farbe bekannt ist; dann der
// Kopier-Ruf des Knotens (`renderer.copyTextureToTexture(Tiefe, Geschichts-Tiefe)`). Gelesen: die Vortiefe (depth16unorm)
// trägt den Verlauf der Ebene (oben fern, unten nah, nie die Leere 1,0), die Farbe der Geschichte ist unberührt.
function vortiefeProbe() {
    return (async () => {
        const r = window.anazhRealm,
            T = window.THREE;
        const rend = r.state.renderer;
        const be = rend.backend;
        const dev = be.device;
        const N = 128;
        const quelle = new T.RenderTarget(N, N, { depthBuffer: true });
        quelle.texture.name = "ziel-zensus:vortiefe-quelle";
        quelle.depthTexture = new T.DepthTexture(N, N);
        const szene = new T.Scene();
        szene.name = "ziel-zensus:vortiefe-buehne";
        const kam = new T.PerspectiveCamera(60, 1, 0.5, 400);
        kam.position.set(0, 4, 6);
        kam.lookAt(0, 0, 0);
        kam.updateMatrixWorld(true);
        const ebene = new T.Mesh(new T.PlaneGeometry(800, 800), new T.MeshBasicNodeMaterial({ color: 0x808080 }));
        ebene.rotation.x = -Math.PI / 2;
        szene.add(ebene);
        const gesch = new T.RenderTarget(N, N, { depthBuffer: false, type: T.HalfFloatType, depthTexture: new T.DepthTexture() });
        gesch.texture.name = "ziel-zensus:vortiefe-geschichte";
        r._traaVortiefe({ _historyRenderTarget: gesch });
        const aus = { gelaufen: false, typ: gesch.depthTexture.type === T.UnsignedShortType };
        const vorFarbe = rend.getClearColor(new T.Color()),
            vorAlpha = rend.getClearAlpha();
        try {
            rend.setRenderTarget(quelle);
            rend.render(szene, kam);
            rend.initRenderTarget(gesch);
            rend.setRenderTarget(gesch);
            rend.setClearColor(new T.Color(0.25, 0.5, 0.75), 1);
            rend.clear(true, false, false);
            rend.setRenderTarget(null);
            rend.copyTextureToTexture(quelle.depthTexture, gesch.depthTexture);
            await dev.queue.onSubmittedWorkDone();
            const lies = async (tex, bpp) => {
                const g = be.get(tex).texture;
                const bpr = Math.ceil((N * bpp) / 256) * 256;
                const buf = dev.createBuffer({ size: bpr * N, usage: GPUBufferUsage.COPY_DST | GPUBufferUsage.MAP_READ });
                const enc = dev.createCommandEncoder();
                enc.copyTextureToBuffer({ texture: g }, { buffer: buf, bytesPerRow: bpr }, [N, N]);
                dev.queue.submit([enc.finish()]);
                await buf.mapAsync(GPUMapMode.READ);
                const kopie = buf.getMappedRange().slice(0);
                buf.unmap();
                buf.destroy();
                return { format: g.format, daten: kopie, bpr };
            };
            const t = await lies(gesch.depthTexture, 2);
            const u16 = new Uint16Array(t.daten);
            const bei = (y) => u16[(y * t.bpr) / 2 + N / 2] / 65535;
            aus.format = t.format;
            aus.oben = +bei(8).toFixed(4);
            aus.mitte = +bei(N / 2).toFixed(4);
            aus.unten = +bei(N - 8).toFixed(4);
            const f = await lies(gesch.texture, 8);
            const h16 = new Float16Array(f.daten);
            aus.farbe = [0, 1, 2].map((c) => +h16[(N / 2) * (f.bpr / 2) + (N / 2) * 4 + c].toFixed(3));
            aus.gelaufen = true;
        } finally {
            rend.setClearColor(vorFarbe, vorAlpha);
            rend.setRenderTarget(null);
            quelle.dispose();
            gesch.dispose();
        }
        return aus;
    })();
}

// (r) DIE RUNDUNG IM ECHTEN FRAME (Seite): was die Sonde fand (`_ausgabeRundung`) und setzte (`_ausgabeAusgleich`), ob das
// Uniform der Post-Kette DENSELBEN Vektor liest, und ob sie ihn verbraucht — das Mittel des Ausgabe-Bilds mit dem Ausgleich,
// mit ×2, zurückgestellt (die Aufnahme rendert die Post-Kette wie das Spiel, `__ausgabeAufnahme`).
function rundungProbe() {
    return (async () => {
        const st = window.anazhRealm.state;
        const A = st._ausgabeAusgleich;
        const U = st.postProcessingUniforms && st.postProcessingUniforms.ausgabeAusgleich;
        const aus = {
            gelaufen: false,
            format: st._ausgabeFormat || null,
            rundung: st._ausgabeRundung || null,
            faktor: A ? A.toArray() : null,
            gleich: !!(A && U && U.value === A),
        };
        if (!A) return Object.assign(aus, { gelaufen: true, verbrauch: 0, zurueck: 0 });
        const mittel = async () => {
            const u8 = (await window.__ausgabeAufnahme(64, 48, 1)).u8;
            let s = 0;
            for (let i = 0; i < u8.length; i += 4) s += 0.2126 * u8[i] + 0.7152 * u8[i + 1] + 0.0722 * u8[i + 2];
            return s / (u8.length / 4);
        };
        const alt = A.clone();
        try {
            const m0 = await mittel();
            A.set(2, 2, 2);
            const m1 = await mittel();
            A.copy(alt);
            const m2 = await mittel();
            aus.mittel = +m0.toFixed(1);
            aus.verbrauch = +(m1 - m0).toFixed(2);
            aus.zurueck = +(m2 - m0).toFixed(2);
        } finally {
            A.copy(alt);
        }
        aus.gelaufen = true;
        return aus;
    })();
}

(async () => {
    console.log("=== ZIEL-ZENSUS — die Wand am echten Frame (WebGPU auf swiftshader) ===");
    await new Promise((r) => server.listen(PORT, "127.0.0.1", r));
    const browser = await puppeteer.launch({ headless: true, protocolTimeout: 900000, args: softwareWebGpuArgs() });
    const page = await browser.newPage();
    await page.setViewport({ width: 320, height: 240 });
    await page.evaluateOnNewDocument(FALTE_INSTALL);
    await page.evaluateOnNewDocument(vramAbgriff);
    const seitenFehler = [];
    page.on("pageerror", (e) => seitenFehler.push((e.stack || e.message || String(e)).split("\n")[0]));
    const T0 = Date.now();
    const log = (z) => console.log(`  [${Math.round((Date.now() - T0) / 1000)} s] ${z}`);
    let out = {};
    try {
        await page.goto(`http://127.0.0.1:${PORT}/index.html?holz=kienspan`, { waitUntil: "domcontentloaded", timeout: 60000 });
        const bereit = await page.evaluate(async () => {
            const t0 = performance.now();
            while (performance.now() - t0 < 300000) {
                const r = window.anazhRealm;
                const st = r && r.state;
                if (st && st.rendererReady && st.renderer && st.renderer.backend && st.postProcessing && st.camera)
                    return { ok: true, ms: Math.round(performance.now() - t0), webgpu: st.renderer.backend.isWebGPUBackend === true };
                await new Promise((res) => setTimeout(res, 100));
            }
            return { ok: false };
        });
        if (!bereit.ok) throw new Error("Renderer und Post-Kette standen nach 300 s nicht");
        if (!bereit.webgpu) throw new Error("kein WebGPU-Backend — der Zensus liest GPU-Befehle, die Wand wäre blind");
        log(`Renderer und Post-Kette bereit nach ${Math.round(bereit.ms / 1000)} s`);
        await page.evaluate(ZAEHLER_INSTALL);
        await page.evaluate(ZERLEGE_INSTALL);
        await page.evaluate(AUSGABE_INSTALL); // die Ruhe der Erst-Zeichnung (`__erstRuhe`), vor jedem Zensus
        await page.evaluate(ZZ.ZIEL_INSTALL);
        await page.evaluate(() => {
            const r = window.anazhRealm;
            r.state.renderer.setAnimationLoop(null);
            window.__gpuFehlerZ = [];
            r.state.renderer.backend.device.addEventListener("uncapturederror", (e) =>
                window.__gpuFehlerZ.push(String((e.error && e.error.message) || e.message || e).slice(0, 240))
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
        if (!s || s.fehler) throw new Error("Schmuggel: " + ((s && s.fehler) || "keine Antwort"));
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
        if (mit.z && mit.z.geraet && mit.z.geraet.rg11b10)
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
        out.rest = u.zeilen.filter((x) => /zensus-selbsttest/.test(x.name)).map((x) => x.name);
        log(
            `Zensus: ${u.zeilen.length} Texturen, ${z.frames} Frames, ${u.rot.length} rot, ${u.hinweis.length} Hinweise; ` +
                `Ruhe der Erst-Zeichnung ${z.erst ? z.erst.warteMs + " ms, offen " + z.erst.offen : "-"}`
        );
        if (process.env.ZIEL_ZENSUS_TABELLE) console.log(ZZ.zielTabelle(u, z));
        // (b) die Karte ohne Farbe
        out.karte = await page.evaluate(karteOhneFarbe);
        log(`Karte ohne Farbe: ${JSON.stringify(out.karte)}`);
        // (d) die Vortiefe in 16 bit
        out.vortiefe = await page.evaluate(vortiefeProbe);
        log(`Vortiefe: ${JSON.stringify(out.vortiefe)}`);
        // (r) die Rundung des Ausgabe-Ziels: Quelle und echter Frame
        out.rundungQuelle = rundungQuelle(fs.readFileSync(path.join(root, "anazhRealm.js"), "utf8"));
        out.rundung = await page.evaluate(rundungProbe);
        log(`Rundung: ${JSON.stringify(out.rundung)}`);
        out.gpuFehler = await page.evaluate(() => window.__gpuFehlerZ.slice(0, 5));
    } catch (e) {
        out.abbruch = (e && e.message) || String(e);
    }
    await browser.close();
    server.close();
    out.seitenFehler = seitenFehler.slice(0, 5);
    const v = urteil(out);
    if (v.length) {
        console.log(`\n❌ ROT — ${v.length} Verletzung(en):`);
        for (const s of v) console.log("   • " + s);
        process.exit(1);
    }
    console.log(
        `\n✅ GRÜN — kein Ziel ohne Leser, keine Klasse fällt; die Schatten-Karte zeichnet ohne Farbe (${out.karte.schattenPaesse} Pässe, ` +
            `0 Farb-Anhänge, Schatten ${out.karte.dunkler} dunkler); die Vortiefe trägt 16 bit (Verlauf ${out.vortiefe.oben} → ${out.vortiefe.unten}, ` +
            `Geschichte unberührt); ${out.selbst.length} eingeschmuggelte Täter beim Namen und restlos fort; die Ausgabe ` +
            `${out.rundung.format} rundet ${out.rundung.rundung || "-"}, der Ausgleich ${JSON.stringify(out.rundung.faktor)} wirkt ` +
            `(×2 hebt das Mittel um ${out.rundung.verbrauch} Stufen).`
    );
})();
