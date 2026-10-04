#!/usr/bin/env node
// diag-profiband.cjs — DIE BAND-WAND (W0): EINE Wand statt Diag-Flut, der headless-Teil des Profi-Band-Richters.
// Befund 04.10.: fünf Linsen (Zensus, VRAM, Kosten, Fluss, Takt) zählten je für sich, keine kannte das Band (208 GPU-
// Befehle · 680k Dreiecke · 118 MB an der Mess-Wiese), der Draw-Zähler nannte 229 von 1076 Befehlen „Mesh"/„bundle:
// Mesh" und der VRAM-Abgriff 236 MB Karten „tex:?". Die Band-Linse nennt jeden Befehl, jedes Dreieck und jedes MB beim
// Täter (scripts/lib/draw-zaehler.cjs), urteilt gegen den Haushalt und die Ratsche (spec/profiband/,
// scripts/lib/band-urteil.cjs) — auf der echten GPU `node scripts/werkbank.cjs band`, hier ohne GPU:
//
//   H1  der Haushalt hält das Band: Summe der Klassen <= 208 Befehle und <= 680k Dreiecke, Schema und Regeln gültig
//   H2  die Ratsche trägt jede Haushalt-Klasse × Pass (null = ungemessen, die Integration setzt die Ist-Werte)
//   H3  die Absenz-Liste der Band-Wellen (haushalt.json `absenz`, wächst je Welle): jeder gefallene Täter grep=0 im
//       kommentar-bereinigten Code (die __codeOf-Disziplin) — gate:altlasten liest DIESELBE Liste
//   H4  die Namens-Wand: jede Textur und jedes Bildziel, das der Stamm erzeugt, trägt `.name` = Erzeuger (sonst zählt
//       der VRAM-Abgriff `tex:?`)
//
// --selftest: ein unbenanntes Mesh wird rot · eine injizierte fscatter:geroell:3:0-Instanz bei 200 m wird rot (bei
// 40 m nicht) · eine Klasse über der Ratsche wird rot (auf ihr nicht) · eine Haushalt-Zeile über dem Band wird rot ·
// ein injizierter gefallener Name wird rot (im Kommentar nicht) · eine namenlose Textur wird rot · `tex:?` wird rot ·
// ein Textur-Objekt ohne Namen und ohne benanntes Ziel wird rot (die Tiefe eines benannten Ziels heißt `<ziel>:tiefe`)
// · ein sauberer Zensus bleibt GRÜN (das Urteil ist nicht immer rot).
//
//   node scripts/diag-profiband.cjs [--selftest]          (npm run gate:profiband)
"use strict";
const fs = require("fs");
const path = require("path");
const PK = require("./lib/pack-kanon.cjs");
const DZ = require("./lib/draw-zaehler.cjs");
const BAND = require("./lib/band-urteil.cjs");

const root = path.join(__dirname, "..");

// H3 — die gefallenen Band-Täter: grep=0 im kommentar-bereinigten Code.
function absenzScan(haushalt, quellen) {
    const errs = [];
    let n = 0;
    for (const w of haushalt.absenz.wellen)
        for (const { token } of w.namen) {
            n++;
            for (const [datei, src] of quellen)
                if (PK.stripComments(src).includes(token))
                    errs.push(`${datei}: „${token}" ist zurück (${w.welle.split(" — ")[0]})`);
        }
    return { errs, n };
}

// H4 — jede Textur-/Bildziel-Erzeugung trägt ihren Erzeuger-Namen in ihrem Statement-Fenster (700 Zeichen).
function namensWand(src) {
    const code = PK.stripComments(src);
    const errs = [];
    const erzeugung = /new\s+(?:THREE|T)\.(\w*Texture|\w*RenderTarget)\(|convertToTexture\(/g;
    const zuweisung =
        /(?:(?:const|let|var)\s+([A-Za-z_$][\w$]*)|(this\.[A-Za-z_$][\w$.]*))\s*=\s*(?:new\s+(?:THREE|T)\.(?:\w*Texture|\w*RenderTarget)\(|convertToTexture\()/g;
    const zugewiesen = new Set();
    let m,
        n = 0;
    while ((m = zuweisung.exec(code))) {
        const v = m[1] || m[2];
        const fenster = code.slice(m.index, m.index + 700);
        const esc = v.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
        const rt = /convertToTexture\(/.test(m[0]);
        const re = new RegExp(esc + (rt ? "\\.renderTarget\\.texture" : "") + "\\.name\\s*=");
        if (!re.test(fenster)) {
            const zeile = code.slice(0, m.index).split("\n").length;
            errs.push(
                `Zeile ~${zeile} (bereinigt): ${m[0].trim()} — kein ${v}${rt ? ".renderTarget.texture" : ""}.name`
            );
        }
        zugewiesen.add(m.index + m[0].search(/new\s|convertToTexture/));
        n++;
    }
    while ((m = erzeugung.exec(code)))
        if (!zugewiesen.has(m.index)) {
            const zeile = code.slice(0, m.index).split("\n").length;
            errs.push(`Zeile ~${zeile} (bereinigt): ${m[0]} ohne Variable — kein Name möglich`);
        }
    return { errs, n };
}

function quellen(haushalt) {
    return haushalt.absenz.dateien.map((f) => [f, fs.readFileSync(path.join(root, f), "utf8")]);
}

function selbsttest() {
    const { haushalt, ratsche } = BAND.ladeSpec();
    const tests = [];
    const t = (name, ok) => tests.push({ name, ok: !!ok });
    const urteil = (klassen, r, vram) =>
        BAND.bandUrteil({ zensus: { klassen }, vram: vram || null, haushalt, ratsche: r || ratsche });
    const hatRot = (u, art) => u.rot.some((x) => x.art === art);

    // S1 — ein unbenanntes Mesh: der Draw-Zähler nennt es UNBENANNT:Mesh, das Urteil wird rot.
    const scene = { type: "Scene" };
    const st = { scene, playerMesh: null };
    const nackt = { type: "Mesh", name: "", userData: {}, parent: scene };
    const streu = { type: "Mesh", name: "", userData: { inventar: "streu-klein" }, parent: scene };
    const kl = DZ.zensusKlasse(nackt, st, DZ.instKlasse);
    const u1 = urteil([{ klasse: kl, stufe: null, art: null, je: { haupt: 1 }, jeTris: { haupt: 12 } }]);
    t(
        "unbenanntes Mesh → UNBENANNT:Mesh, rot",
        kl === "UNBENANNT:Mesh" &&
            hatRot(u1, "unbenannt") &&
            DZ.zensusKlasse(streu, st, DZ.instKlasse) === "streu-klein"
    );

    // S2 — die injizierte Fern-Geröll-L0-Instanz (der stille L0-Rückfall) bei 200 m: rot; bei 40 m nicht.
    const kg = DZ.instKlasse("fscatter:geroell:3:0#0@12,-7");
    const geroell = (d) => ({
        klasse: kg,
        stufe: 0,
        art: "scree",
        je: { haupt: 1, k0: 1, k1: 1 },
        jeTris: { haupt: 1280, k0: 1280, k1: 1280 },
        dMax: d,
    });
    t(
        "fscatter:geroell:3:0 bei 200 m → rot, bei 40 m nicht",
        kg === "fscatter:geroell:L0" &&
            hatRot(urteil([geroell(200)]), "stufe") &&
            !hatRot(urteil([geroell(40)]), "stufe")
    );

    // S3 — eine Klasse über der Ratsche: rot; auf ihr nicht.
    const r3 = JSON.parse(JSON.stringify(ratsche));
    r3.klassen.boden.haupt.befehle = 5;
    const boden = (c) => ({
        klasse: "voxelChunk",
        stufe: null,
        art: null,
        je: { haupt: c },
        jeTris: { haupt: c * 1000 },
    });
    t(
        "Boden haupt 6 Befehle über Ratsche 5 → rot, 5 nicht",
        hatRot(urteil([boden(6)], r3), "ratsche") && !hatRot(urteil([boden(5)], r3), "ratsche")
    );

    // S4 — eine Haushalt-Zeile über dem Band.
    const h4 = JSON.parse(JSON.stringify(haushalt));
    h4.klassen.find((k) => k.id === "reserve").befehle += 1;
    t(
        "Haushalt +1 Befehl über dem Band → rot",
        BAND.haushaltPruefen(h4).fehler.some((f) => /über dem Band/.test(f)) &&
            !BAND.haushaltPruefen(haushalt).fehler.length
    );

    // S5 — ein gefallener Band-Täter kehrt zurück (im Code rot, im Kommentar nicht).
    const tok = haushalt.absenz.wellen[0].namen[0].token;
    const a5 = absenzScan(haushalt, [["injiziert.js", `const x = 1;\nfunction ${tok}() {}\n`]]);
    const b5 = absenzScan(haushalt, [["kommentar.js", `const x = 1;\n// ${tok} fiel in W2\n`]]);
    t(`gefallener Name ${tok} im Code → rot, im Kommentar nicht`, a5.errs.length === 1 && b5.errs.length === 0);

    // S6 — eine namenlose Textur (und eine ohne Variable) wird rot, eine benannte nicht.
    const n6a = namensWand("const x = new THREE.DataTexture(d, 1, 1);\nx.needsUpdate = true;\n");
    const n6b = namensWand('const x = new THREE.DataTexture(d, 1, 1);\nx.name = "probe";\n');
    const n6c = namensWand("mat.map = new THREE.CanvasTexture(c);\n");
    const n6d = namensWand('const tex = convertToTexture(ldr);\ntex.renderTarget.texture.name = "probe";\n');
    t(
        "namenlose Textur → rot, benannte nicht, Bildziel über renderTarget",
        n6a.errs.length === 1 && n6b.errs.length === 0 && n6c.errs.length === 1 && n6d.errs.length === 0
    );

    // S7 — eine Textur ohne Erzeuger im VRAM-Abgriff wird rot.
    const u7 = urteil([], null, { mb: 1, liste: [{ k: "tex:? rgba8unorm 1024x256x1", mb: 1, n: 1 }] });
    const u7b = urteil([], null, {
        mb: 1,
        liste: [{ k: "tex:karte-albedo:eiche|#|summer rgba8unorm-srgb 1024x256x1", mb: 1, n: 1 }],
    });
    t(
        "tex:? → rot, karte-albedo nicht",
        hatRot(u7, "unbenannt") && !u7b.rot.length && u7b.vram.erzeuger[0].erzeuger === "tex:karte-albedo"
    );

    // S9 — der Erzeuger einer Textur: ihr Name; ohne Namen ihr Ziel (die Tiefe, die r184 je Ziel anlegt →
    // `<ziel>:tiefe`, das Ausgabe-Ziel des Renderers → `r184-ausgabe`); ein namenloses Objekt ohne benanntes Ziel
    // macht das Urteil rot, ein Zensus ohne solches nicht.
    const fxaaZiel = { texture: { name: "fxaa-eingang" } };
    const ausZiel = { isPostProcessingRenderTarget: true };
    const ausFarbe = { name: "", renderTarget: ausZiel };
    ausZiel.texture = ausFarbe;
    const leerZiel = {};
    const leerFarbe = { name: "", renderTarget: leerZiel };
    leerZiel.texture = leerFarbe;
    const tz = (unbenannt) =>
        BAND.bandUrteil({
            zensus: { klassen: [] },
            vram: null,
            texturen: { n: 1, mb: 8, erzeuger: [{ erzeuger: "?", mb: 8, n: 1 }], unbenannt },
            haushalt,
            ratsche,
        });
    const spur = { klasse: "DepthTexture", tiefe: true, groesse: [1920, 1080], ziel: null, mb: 7.91 };
    t(
        "Textur-Erzeuger: Name · <ziel>:tiefe · r184-ausgabe · namenlos → null, im Urteil rot",
        DZ.texturErzeuger({ name: "karte-albedo:eiche|#" }) === "karte-albedo:eiche|#" &&
            DZ.texturErzeuger({ name: "", isDepthTexture: true, renderTarget: fxaaZiel }) === "fxaa-eingang:tiefe" &&
            DZ.texturErzeuger(ausFarbe) === "r184-ausgabe" &&
            DZ.texturErzeuger({ name: "", isDepthTexture: true, renderTarget: ausZiel }) === "r184-ausgabe:tiefe" &&
            DZ.texturErzeuger(leerFarbe) === null &&
            DZ.texturErzeuger({ name: "", isDepthTexture: true }) === null &&
            hatRot(tz([spur]), "unbenannt") &&
            !tz([]).rot.length
    );

    // S10 — die Ratsche zieht nur nach unten: ein ungemessenes Feld wird gesetzt, ein höheres gesenkt, ein
    // niedrigeres nie gehoben; der Nachzug besteht danach das eigene Schema.
    const r10 = JSON.parse(JSON.stringify(ratsche));
    r10.klassen.boden.haupt.befehle = 10;
    r10.klassen.tier.haupt.befehle = 3;
    const u10 = urteil([
        { klasse: "voxelChunk", stufe: null, art: null, je: { haupt: 7 }, jeTris: { haupt: 7000 } },
        { klasse: "tier", stufe: null, art: null, je: { haupt: 5 }, jeTris: { haupt: 900 } },
    ]);
    const n10 = BAND.ratscheNachziehen(r10, u10, { datum: "selbsttest" });
    t(
        "Ratsche: null gesetzt, 10 → 7 gesenkt, 3 bleibt (5 hebt nie), Schema hält",
        n10.ratsche.klassen.boden.haupt.befehle === 7 &&
            n10.ratsche.klassen.boden.haupt.dreiecke === 7000 &&
            n10.ratsche.klassen.tier.haupt.befehle === 3 &&
            n10.ratsche.klassen.tier.haupt.dreiecke === 900 &&
            n10.ratsche.gesamt.befehle === 12 &&
            n10.ratsche.gemessen.datum === "selbsttest" &&
            !BAND.ratschePruefen(n10.ratsche, haushalt).length
    );

    // S8 — ein sauberer Zensus bleibt GRÜN und jede Klasse findet ihre Zeile (das Urteil ist nicht immer rot).
    const sauber = [
        { klasse: "voxelChunk", stufe: null, art: null, je: { haupt: 4, k0: 4, k1: 4 }, jeTris: { haupt: 9e4 } },
        {
            klasse: DZ.instKlasse("baum_eiche#f:eiche|3|0|summer:2@p:1,2"),
            stufe: 0,
            art: "tree",
            je: { haupt: 2 },
            jeTris: {},
            dMax: 20,
        },
        {
            klasse: DZ.instKlasse("baum_eiche#fimp:fimp:eiche|3|summer@s:0,0"),
            stufe: 2,
            art: "tree",
            je: { haupt: 1 },
            jeTris: {},
        },
        { klasse: DZ.instKlasse("glut_var3#0@p:1,1"), stufe: 0, art: null, je: { haupt: 1 }, jeTris: {} },
        { klasse: "himmel", stufe: null, art: null, je: { haupt: 1 }, jeTris: {} },
        { klasse: "Render Pipeline", stufe: null, art: null, je: { ortho: 1 }, jeTris: {} },
    ];
    const u8 = urteil(sauber);
    const zeile = (id) => u8.klassen.find((z) => z.id === id);
    t(
        "sauberer Zensus → GRÜN, Täter in boden/baum/karten/bau/einzelstuecke, Post-Pass außerhalb",
        u8.urteil === "GRUEN" &&
            zeile("boden").ist.befehle === 12 &&
            zeile("baum").taeter[0].klasse === "f:eiche:L0" &&
            zeile("karten").taeter[0].klasse === "fimp:eiche:L2" &&
            zeile("bau").taeter[0].klasse === "g:glut:L0" &&
            zeile("einzelstuecke").taeter[0].klasse === "himmel" &&
            u8.ausserhalb.ortho === 1
    );

    const rot = tests.filter((x) => !x.ok);
    for (const x of tests) console.log(`${x.ok ? "✅" : "❌"} SELBST-TEST: ${x.name}`);
    if (rot.length) {
        console.log(`⛔ DIE BAND-WAND ist blind: ${rot.length} von ${tests.length} Selbsttests feuern nicht`);
        process.exit(1);
    }
    console.log(`✅ SELBST-TEST: die Band-Wand feuert (${tests.length}/${tests.length})`);
}

function main() {
    if (process.argv.includes("--selftest")) return selbsttest();
    const { haushalt, ratsche } = BAND.ladeSpec();
    const errs = [];
    const h = BAND.haushaltPruefen(haushalt);
    for (const f of h.fehler) errs.push("H1 " + f);
    for (const f of BAND.ratschePruefen(ratsche, haushalt)) errs.push("H2 " + f);
    const q = quellen(haushalt);
    const a = absenzScan(haushalt, q);
    for (const f of a.errs) errs.push("H3 " + f);
    const nw = namensWand(fs.readFileSync(path.join(root, "anazhRealm.js"), "utf8"));
    for (const f of nw.errs) errs.push("H4 " + f);
    if (errs.length) {
        console.log("⛔ DIE BAND-WAND:");
        for (const e of errs) console.log("   ❌ " + e);
        process.exit(1);
    }
    const paesse = haushalt.messort.paesse;
    let gemessen = 0,
        felder = 0;
    for (const id of Object.keys(ratsche.klassen))
        for (const p of paesse)
            for (const g of ["befehle", "dreiecke"]) {
                felder++;
                if (ratsche.klassen[id][p][g] != null) gemessen++;
            }
    console.log(
        `✅ DIE BAND-WAND steht — H1 Haushalt ${h.summe.befehle}/${haushalt.band.befehle} Befehle · ` +
            `${h.summe.dreiecke}/${haushalt.band.dreiecke} Dreiecke in ${haushalt.klassen.length} Klassen · ` +
            `H2 Ratsche ${haushalt.klassen.length} Klassen × ${paesse.length} Pässe (gemessen ${gemessen} von ${felder}) · ` +
            `H3 Absenz ${a.n} gefallene Band-Täter grep=0 in ${q.length} Dateien · ` +
            `H4 ${nw.n} Textur-/Bildziel-Erzeuger benannt.`
    );
}

main();
