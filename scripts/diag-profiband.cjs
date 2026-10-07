#!/usr/bin/env node
// diag-profiband.cjs — DIE BAND-WAND (W0): EINE Wand statt Diag-Flut, der headless-Teil des Profi-Band-Richters.
// Befund 04.10.: fünf Linsen (Zensus, VRAM, Kosten, Fluss, Takt) zählten je für sich, keine kannte das Band (208 GPU-
// Befehle · 680k Dreiecke · 118 MB an der Mess-Wiese), der Draw-Zähler nannte 229 von 1076 Befehlen „Mesh"/„bundle:
// Mesh" und der VRAM-Abgriff 236 MB Karten „tex:?". Die Band-Linse nennt jeden Befehl, jedes Dreieck und jedes MB beim
// Täter — die Täter-Klasse ist die des Stamms (`AnazhRealm#_taeterKlasse`, `_instanzKlasse`, `_taeterName`: dieselbe
// für Draw-Zähler, Flugschreiber, Albedo-Sicht und den Szenen-Zensus des Playtests) — und urteilt gegen den Haushalt
// und die Ratsche (spec/profiband/, scripts/lib/band-urteil.cjs): auf der echten GPU `node scripts/werkbank.cjs band`,
// hier ohne GPU:
//
//   H1  der Haushalt hält das Band: Summe der Klassen <= 208 Befehle und <= 680k Dreiecke, Schema gültig, KEINE
//       Sammelzeile (`rest`), jedes Muster verankert
//   H2  die Ratsche trägt jede Haushalt-Klasse × Pass (null = ungemessen), ihre Toleranz und — wenn gemessen — eine
//       eingeschwungene Messung
//   H3  die Namens-Wand: jede Textur, die der Stamm erzeugt, trägt `.name` = Erzeuger (sonst zählt der VRAM-Abgriff
//       `tex:?`) — auch eine Neu-Zuweisung (`map = new T.DataArrayTexture(…)`), der Name mit Wortgrenze
//   H4  die Täter-Klasse des Stamms: die drei Methoden stehen im Quelltext und klassifizieren die Schlüssel-Formen,
//       die der Stamm heute baut (Studio-Leaf als Schlüssel, Schatten-Zwilling `#S`, ov-Hash, Karte, Streu, Bauplan)
//   H5  jeder Name, den ein Haushalt-Muster wörtlich nennt, vergibt der Stamm noch (ein umbenannter Erzeuger fiele sonst
//       still aus jeder Klasse — sichtbar erst auf der echten GPU als LINSE rot `haushalt`)
//   H6  DIE MESSORTE (S1 W1f, `messorte`): jeder Ort trägt Spieler, Blick, Dorf-Zug, Ort-Takt und seine eigene Ratsche
//       (H2 je Ort); jede Methode, die ein Ort-Takt nennt, trägt der Stamm (ein umbenannter Ring-Bauer liefe still aus
//       jedem Werkbank-Takt, der Ort stünde leer)
//
// Die Absenz der gefallenen Band-Täter (W2 Voxel-Bricks, V18.528) prüft gate:altlasten — die EINE Rückkehr-Wand.
//
// --selftest: ein unbenanntes Mesh wird rot · eine injizierte fscatter:geroell:3:0-Instanz bei 200 m wird rot (bei
// 40 m nicht) · eine Klasse über der Ratsche wird rot (auf ihr und in der Toleranz nicht) · eine Haushalt-Zeile über
// dem Band, eine Sammelzeile, ein unverankertes Muster werden rot · ein benannter Täter ohne Haushalt-Regel wird rot ·
// eine namenlose Textur wird rot, eine benannte Neu-Zuweisung nicht, ein fremder `.name` im Fenster nicht als Name ·
// `tex:?` wird rot · die Schlüssel-Formen des Stamms ergeben ihre Klasse · ein Textur-Objekt ohne Namen und Ziel wird
// rot · die Ratsche zieht nur nach unten · ein Zensus über dem Band ist BAND-rot bei sauberer Linse, ein Zensus im
// Band GRÜN · das Maximum über die Proben · die Täter-Klasse an Szenen-Knoten (Tier, Region, Spieler, Namens-Schwanz) ·
// eine freie Klasse (Weltzustand, mit Gate der Kosten je Einheit) trägt keine Ratsche · die Hülle einer Serie · ein
// Geometrie-Puffer ohne Bild (`buf:verwaist` · `buf:ruhend`) ist ein Leck, ein gezeichneter nicht · ein Messort ohne
// Richtung, mit doppelter id, fremder oder geteilter Ratsche wird rot · dieselbe Klasse ist über der Ratsche ihres Orts rot,
// über der eines anderen nicht · die Tor-Hülle je Tor (Soll-Zeile des Genesis-Rings) · ein toter Ort-Takt wird rot.
//
//   node scripts/diag-profiband.cjs [--selftest]          (npm run gate:profiband)
"use strict";
const fs = require("fs");
const path = require("path");
const PK = require("./lib/pack-kanon.cjs");
const DZ = require("./lib/draw-zaehler.cjs");
const BAND = require("./lib/band-urteil.cjs");

const root = path.join(__dirname, "..");

// Den Rumpf einer Stamm-Methode ab dem ersten `{` nach dem Kopf (Klammer-Zählung auf dem kommentar-freien Code).
function rumpf(code, kopfRe) {
    const m = kopfRe.exec(code);
    if (!m) return null;
    let i = code.indexOf("{", m.index + m[0].length - 1);
    let tiefe = 0;
    const start = i;
    for (; i < code.length; i++) {
        if (code[i] === "{") tiefe++;
        else if (code[i] === "}" && --tiefe === 0) return code.slice(start + 1, i);
    }
    return null;
}

// H4 — DIE TÄTER-KLASSE DES STAMMS, aus dem Quelltext (kein Zwilling hier): `klasse(obj, state)` und `instanz(key)`.
function stammKlasse(src) {
    const code = PK.stripComments(src);
    const kl = rumpf(code, /\n {4}_taeterKlasse\(obj\)\s*\{/);
    const nm = rumpf(code, /\n {4}static _taeterName\(x\)\s*\{/);
    const ik = rumpf(code, /\n {4}static _instanzKlasse\(key\)\s*\{/);
    const tg = rumpf(code, /\n {4}_taeterGruppe\(key\)\s*\{/);
    if (!kl || !nm || !ik || !tg) return null;
    const AR = { _taeterName: new Function("x", nm), _instanzKlasse: new Function("key", ik) };
    const fn = new Function("AnazhRealm", "obj", kl);
    const gruppe = new Function("AnazhRealm", "key", tg);
    const klasse = (obj, state) => {
        const self = { state, _taeterGruppe: (key) => gruppe.call(self, AR, key) };
        return fn.call(self, AR, obj);
    };
    return { klasse, instanz: AR._instanzKlasse, name: AR._taeterName };
}

// Die Schlüssel-Formen, die der Stamm baut (`_archInstanceGroupFor` · `_foundryFlattenFor` · `_scatterBuild…`), und ihre
// Klasse — die Prüfung, an der die Klassen-Funktion des Draw-Zählers vor der Integration still brach
// (`f:eiche|0|1:0` → `g:f:eiche|0|1:0:L0`, Baum fiel aus der Band-Summe).
const SCHLUESSEL = [
    ["f:eiche|0|1:0", "f:eiche:L1"],
    ["f:eiche|0|0:2", "f:eiche:L0"],
    ["f:eiche|0|1:0#S", "f:eiche:L1"],
    ["f:fachwerk_haus|3|1|ov:9f2c:4", "f:fachwerk_haus:L1"],
    ["fimp:fimp:eiche|3", "fimp:eiche:L2"],
    ["baum_eiche#fimp:fimp:eiche|3|summer@s:0,0", "fimp:eiche:L2"],
    ["fscatter:geroell:3:0#0@12,-7", "fscatter:geroell:L0"],
    ["fscatter:eiche:2:2#1@s:3,4", "fscatter:eiche:L2"],
    ["grown_busch_v3_lod1#2@4,5", "g:grown_busch:L1"],
    ["kristall_var3#0@p:1,1", "g:kristall:L0"],
    ["markt#5", "g:markt:L0"],
];

function taeterWand(src) {
    const errs = [];
    const S = stammKlasse(src);
    if (!S) return { errs: ["_taeterKlasse / _taeterName / _instanzKlasse nicht im Stamm gefunden"], n: 0 };
    for (const [k, soll] of SCHLUESSEL) {
        const ist = S.instanz(k);
        if (ist !== soll) errs.push(`_instanzKlasse("${k}") = ${ist}, erwartet ${soll}`);
    }
    return { errs, n: SCHLUESSEL.length, S };
}

// H3 — jede Textur-/Bildziel-Erzeugung trägt ihren Erzeuger-Namen in ihrem Statement-Fenster (700 Zeichen): eine
// Deklaration (`const/let/var x =`), ein Feld (`this.a.b =`) oder eine Neu-Zuweisung (`x =`, `obj.map =`); der Name ist
// `<ziel>.name =` mit Wortgrenze vorn (`mat.name =` benennt `t` nicht).
function namensWand(src) {
    const code = PK.stripComments(src);
    const errs = [];
    const erzeugung = /new\s+(?:THREE|T)\.(\w*Texture|\w*RenderTarget)\(|convertToTexture\(/g;
    const zuweisung =
        /(?:(?:const|let|var)\s+([A-Za-z_$][\w$]*)|(?<![\w$.])((?:this\.)?[A-Za-z_$][\w$]*(?:\.[A-Za-z_$][\w$]*)*))\s*=\s*(?:new\s+(?:THREE|T)\.(?:\w*Texture|\w*RenderTarget)\(|convertToTexture\()/g;
    const zugewiesen = new Set();
    let m,
        n = 0;
    while ((m = zuweisung.exec(code))) {
        const v = m[1] || m[2];
        const fenster = code.slice(m.index, m.index + 700);
        const esc = v.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
        const rt = /convertToTexture\(/.test(m[0]);
        const re = new RegExp("(?<![\\w$.])" + esc + (rt ? "\\.renderTarget\\.texture" : "") + "\\.name\\s*=");
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
            errs.push(`Zeile ~${zeile} (bereinigt): ${m[0]} ohne Ziel-Variable — kein Name möglich`);
        }
    return { errs, n };
}

// H5 — jeder Name, den ein Haushalt-Muster wörtlich nennt (`^name$`, `^(a|b)$`), vergibt der Stamm noch: als String-Literal
// im kommentar-freien Code, ganz oder mit Namens-Schwanz (`"voxelChunk:" + key` faltet `_taeterName` zu `voxelChunk`).
// Befund 05.10. (echte GPU, Integration): welle-fernsicht benannte den Zaun-Pool `siedlung-zaun`, die Regel nannte weiter
// `siedlung-wege` — der Täter fiel aus jeder Klasse (Band-LINSE rot `haushalt`), kein Gate ohne GPU sah es.
function namenLeben(haushalt, src) {
    const code = PK.stripComments(src);
    const errs = [];
    let n = 0;
    for (const k of haushalt.klassen)
        for (const r of k.regeln || []) {
            if (!r.muster || !r.muster.startsWith("^") || !r.muster.endsWith("$")) continue;
            const rumpf = r.muster.slice(1, -1);
            const innen = /^\([^()]*\)$/.test(rumpf) ? rumpf.slice(1, -1) : rumpf;
            if (/[()]/.test(innen)) continue; // verschachtelte Gruppen sind Muster über Schlüssel-Formen (H4)
            for (const a of innen.split("|")) {
                if (!/^[A-Za-z0-9_:.-]+$/.test(a)) continue; // ein Regex-Teil (chunk-water-[a-z]+) nennt keinen Namen
                n++;
                const lebt = ['"', "'", "`"].some((q) => code.includes(q + a + q) || code.includes(q + a + ":"));
                if (!lebt) errs.push(`Klasse ${k.id}: das Muster ${r.muster} nennt "${a}" — kein Erzeuger im Stamm`);
            }
        }
    return { errs, n };
}

// H6 — DER ORT-TAKT LEBT (S1 W1f): jede Methode, die ein Messort im Ort-Takt nennt (am Genesis-Ring `_genesisPortalRing`,
// `_portalApproachPrefetch`), trägt der Stamm als Methode — ein umbenannter Bauer liefe in der Werkbank als TypeError still
// aus jedem Takt (der try der Takt-Schleife schluckt ihn), der Ring stünde nie, die Messung mäße einen leeren Ort.
function ortTaktLebt(haushalt, src) {
    const code = PK.stripComments(src);
    const errs = [];
    let n = 0;
    for (const o of haushalt.messorte || [])
        for (const m of o.ortTakt || []) {
            n++;
            const kopf = "\n    " + m + "(";
            if (!code.includes(kopf)) errs.push(`Messort ${o.id}: der Ort-Takt nennt ${m} — keine Methode im Stamm`);
        }
    return { errs, n };
}

function selbsttest() {
    const { haushalt, ratsche } = BAND.ladeSpec();
    const stamm = fs.readFileSync(path.join(root, "anazhRealm.js"), "utf8");
    const S = stammKlasse(stamm);
    const tests = [];
    const t = (name, ok) => tests.push({ name, ok: !!ok });
    // Die Selbsttests urteilen gegen eine UNGEMESSENE Ratsche desselben Schemas mit fester Toleranz — die gemessenen
    // Werte der echten (die Hülle der Serie) dürfen keinen Selbsttest färben.
    const rt = JSON.parse(JSON.stringify(ratsche));
    rt.toleranzPct = 10;
    rt.toleranzAbs = { befehle: 2, dreiecke: 1000, vramMB: 1 };
    rt.gemessen = null;
    rt.gesamt = { befehle: null, dreiecke: null, vramMB: null };
    delete rt.vramMB;
    for (const id of Object.keys(rt.klassen))
        for (const p of Object.keys(rt.klassen[id])) rt.klassen[id][p] = { befehle: null, dreiecke: null };
    const urteil = (klassen, r, vram, gpu) =>
        BAND.bandUrteil({ zensus: { klassen }, vram: vram || null, gpu: gpu || null, haushalt, ratsche: r || rt });
    const hatRot = (u, art) => u.rot.some((x) => x.art === art);
    if (!S) {
        console.log("❌ SELBST-TEST: die Täter-Klasse des Stamms ist nicht zu finden");
        process.exit(1);
    }

    // S1 — ein unbenanntes Mesh: die Täter-Klasse nennt es UNBENANNT:Mesh, das Urteil wird rot.
    const scene = { type: "Scene" };
    const st = { scene, playerMesh: null };
    const nackt = { type: "Mesh", name: "", userData: {}, parent: scene };
    const streu = { type: "Mesh", name: "", userData: { inventar: "streu-klein" }, parent: scene };
    const kl = S.klasse(nackt, st);
    const u1 = urteil([{ klasse: kl, stufe: null, art: null, je: { haupt: 1 }, jeTris: { haupt: 12 } }]);
    t(
        "unbenanntes Mesh → UNBENANNT:Mesh, LINSE rot",
        kl === "UNBENANNT:Mesh" && hatRot(u1, "unbenannt") && u1.linse === "ROT" && S.klasse(streu, st) === "streu-klein"
    );

    // S2 — die injizierte Fern-Geröll-L0-Instanz (der stille L0-Rückfall) bei 200 m: rot; bei 40 m nicht.
    const kg = S.instanz("fscatter:geroell:3:0#0@12,-7");
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

    // S3 — eine Klasse über der Ratsche: rot; auf ihr und in der Toleranz (max(+10 %, +2)) nicht.
    const r3 = JSON.parse(JSON.stringify(rt));
    r3.klassen.boden.haupt.befehle = 5;
    const boden = (c) => ({
        klasse: "bodenSatz",
        stufe: null,
        art: null,
        je: { haupt: c },
        jeTris: { haupt: c * 10 },
    });
    t(
        "Boden haupt 8 Befehle über Ratsche 5 (+2) → rot, 7 nicht, 5 nicht",
        hatRot(urteil([boden(8)], r3), "ratsche") &&
            !hatRot(urteil([boden(7)], r3), "ratsche") &&
            !hatRot(urteil([boden(5)], r3), "ratsche")
    );

    // S4 — eine Haushalt-Zeile über dem Band, eine Sammelzeile, ein unverankertes Muster.
    const h4 = JSON.parse(JSON.stringify(haushalt));
    h4.klassen.find((k) => k.id === "reserve").befehle += 1;
    const h4b = JSON.parse(JSON.stringify(haushalt));
    h4b.klassen.find((k) => k.id === "reserve").rest = true;
    const h4c = JSON.parse(JSON.stringify(haushalt));
    h4c.klassen.find((k) => k.id === "bau").regeln.push({ muster: "^g:(glut|tor)" });
    t(
        "Haushalt +1 Befehl über dem Band, `rest`, Muster ohne Anker → rot; der echte Haushalt nicht",
        BAND.haushaltPruefen(h4).fehler.some((f) => /über dem Band/.test(f)) &&
            BAND.haushaltPruefen(h4b).fehler.some((f) => /Sammelzeile/.test(f)) &&
            BAND.haushaltPruefen(h4c).fehler.some((f) => /ohne Anker/.test(f)) &&
            !BAND.haushaltPruefen(haushalt).fehler.length
    );

    // S5 — ein benannter Täter, den keine Regel nimmt (eine neue Klasse einer Welle): rot `haushalt`, nie still in eine
    // Sammelzeile; `g:torus` fällt nicht unter `g:tor`.
    const u5 = urteil([
        { klasse: "neuerSatz", stufe: null, art: null, je: { haupt: 3 }, jeTris: { haupt: 9 } },
        { klasse: "g:torus:L0", stufe: 0, art: null, je: { haupt: 1 }, jeTris: { haupt: 9 } },
    ]);
    t(
        "neuerSatz und g:torus:L0 ohne Regel → rot `haushalt` (2 Befunde)",
        u5.rot.filter((x) => x.art === "haushalt").length === 2 && u5.linse === "ROT"
    );

    // S6 — die Namens-Wand: eine namenlose Textur (und eine ohne Ziel) wird rot, eine benannte nicht, eine benannte
    // Neu-Zuweisung nicht (welle-w6-karten: `map = new T.DataArrayTexture(…)` + `map.name =`), ein fremder Name
    // (`mat.name =`) benennt `t` nicht.
    const n6a = namensWand("const x = new THREE.DataTexture(d, 1, 1);\nx.needsUpdate = true;\n");
    const n6b = namensWand('const x = new THREE.DataTexture(d, 1, 1);\nx.name = "probe";\n');
    const n6c = namensWand("f(new THREE.CanvasTexture(c));\n");
    const n6d = namensWand('let map;\nmap = new T.DataArrayTexture(d, 4, 4, 2);\nmap.name = "impostor-atlas";\n');
    const n6e = namensWand('const t = new THREE.DataTexture(d, 1, 1);\nmat.name = "stoff";\n');
    const n6f = namensWand('mat.map = new THREE.CanvasTexture(c);\nmat.map.name = "probe";\n');
    t(
        "Namens-Wand: namenlos rot, ohne Ziel rot, benannt grün, Neu-Zuweisung grün, fremder .name rot",
        n6a.errs.length === 1 &&
            n6b.errs.length === 0 &&
            n6c.errs.length === 1 &&
            n6d.errs.length === 0 &&
            n6e.errs.length === 1 &&
            n6f.errs.length === 0
    );

    // S7 — eine Textur ohne Erzeuger im VRAM-Abgriff wird rot.
    const u7 = urteil([], null, { mb: 1, liste: [{ k: "tex:? rgba8unorm 1024x256x1", mb: 1, n: 1 }] });
    const u7b = urteil([], null, {
        mb: 1,
        liste: [{ k: "tex:karte-albedo:eiche|#|summer rgba8unorm-srgb 1024x256x1", mb: 1, n: 1 }],
    });
    t(
        "tex:? → rot, karte-albedo nicht; die EINE Faltung: r184-ausgabe und kaskade0 ganz, bindingBuffer1381_ → bindingBuffer",
        hatRot(u7, "unbenannt") &&
            !u7b.rot.length &&
            u7b.vram.erzeuger[0].erzeuger === "tex:karte-albedo" &&
            DZ.vramFalte("r184-ausgabe") === "r184-ausgabe" &&
            DZ.vramFalte("kaskade0:farbe") === "kaskade0:farbe" &&
            DZ.vramFalte("p2p-namensschild") === "p2p-namensschild" &&
            BAND.erzeugerOf("buf:bindingBuffer1381_object_(vertex)").erzeuger === "bindingBuffer" &&
            BAND.erzeugerOf("tex:karte-albedo:eiche|3|summer rgba8unorm 1x1x1").erzeuger === "karte-albedo"
    );

    // S8 — die Schlüssel-Formen des Stamms (H4) ergeben ihre Klasse.
    const tw = taeterWand(stamm);
    t(`Schlüssel-Formen des Stamms → ${SCHLUESSEL.length} Klassen`, !tw.errs.length);

    // S9 — der Erzeuger einer Textur: ihr Name; ohne Namen ihr Ziel (die Tiefe, die r184 je Ziel anlegt →
    // `<ziel>:tiefe`, das Ausgabe-Ziel des Renderers → `r184-ausgabe`); ein namenloses Objekt ohne benanntes Ziel
    // macht das Urteil rot, ein Zensus ohne solches nicht.
    const traaZiel = { texture: { name: "TRAANode.history" } };
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
            ratsche: rt,
        });
    const spur = { klasse: "DepthTexture", tiefe: true, groesse: [1, 1], ziel: null, mb: 0 };
    t(
        "Textur-Erzeuger: Name · <ziel>:tiefe · r184-ausgabe · namenlos → null, im Urteil rot",
        DZ.texturErzeuger({ name: "karte-albedo:eiche|#" }) === "karte-albedo:eiche|#" &&
            DZ.texturErzeuger({ name: "", isDepthTexture: true, renderTarget: traaZiel }) ===
                "TRAANode.history:tiefe" &&
            DZ.texturErzeuger(ausFarbe) === "r184-ausgabe" &&
            DZ.texturErzeuger({ name: "", isDepthTexture: true, renderTarget: ausZiel }) === "r184-ausgabe:tiefe" &&
            DZ.texturErzeuger(leerFarbe) === null &&
            DZ.texturErzeuger({ name: "", isDepthTexture: true }) === null &&
            hatRot(tz([spur]), "unbenannt") &&
            !tz([]).rot.length
    );

    // S10 — die Ratsche zieht nur nach unten: ein ungemessenes Feld wird gesetzt, ein höheres gesenkt, ein
    // niedrigeres nie gehoben; der Nachzug besteht danach das eigene Schema (eingeschwungen).
    const r10 = JSON.parse(JSON.stringify(rt));
    r10.klassen.boden.haupt.befehle = 10;
    r10.klassen.bau.haupt.befehle = 3;
    const u10 = urteil(
        [
            { klasse: "bodenSatz", stufe: null, art: null, je: { haupt: 7 }, jeTris: { haupt: 7000 } },
            { klasse: "g:tor:L0", stufe: 0, art: null, je: { haupt: 5 }, jeTris: { haupt: 900 } },
        ],
        r10
    );
    const n10 = BAND.ratscheNachziehen(r10, u10, { datum: "selbsttest", eingeschwungen: true });
    const n10b = BAND.ratscheNachziehen(r10, u10, { datum: "selbsttest" });
    t(
        "Ratsche: null gesetzt, 10 → 7 gesenkt, 3 bleibt (5 hebt nie), Schema hält nur eingeschwungen",
        n10.ratsche.klassen.boden.haupt.befehle === 7 &&
            n10.ratsche.klassen.boden.haupt.dreiecke === 7000 &&
            n10.ratsche.klassen.bau.haupt.befehle === 3 &&
            n10.ratsche.klassen.bau.haupt.dreiecke === 900 &&
            n10.ratsche.gesamt.befehle === 12 &&
            n10.ratsche.gemessen.datum === "selbsttest" &&
            !BAND.ratschePruefen(n10.ratsche, haushalt).length &&
            BAND.ratschePruefen(n10b.ratsche, haushalt).some((f) => /eingeschwungen/.test(f))
    );

    // S11 — ein sauberer Zensus im Band ist GRÜN (das Urteil ist nicht immer rot) und jede Klasse findet ihre Zeile;
    // derselbe Zensus mit einem Wald über dem Band ist BAND-rot bei sauberer Linse (das Band färbt nie grün).
    const sauber = [
        {
            klasse: "bodenSatz",
            stufe: null,
            art: null,
            je: { haupt: 4, k0: 4, k1: 4 },
            jeTris: { haupt: 9e4 },
        },
        { klasse: S.instanz("f:eiche|0|0:2"), stufe: 0, art: "tree", je: { haupt: 2 }, jeTris: {}, dMax: 20 },
        { klasse: S.instanz("fimp:fimp:eiche|3"), stufe: 2, art: "tree", je: { haupt: 1 }, jeTris: {} },
        { klasse: S.instanz("tor#0@p:1,1"), stufe: 0, art: null, je: { haupt: 1 }, jeTris: {} },
        { klasse: "himmel", stufe: null, art: null, je: { haupt: 1 }, jeTris: {} },
        { klasse: "TRAA", stufe: null, art: null, je: { ortho: 1 }, jeTris: {} },
    ];
    const u8 = urteil(sauber, null, { mb: 100, liste: [{ k: "tex:output rgba16float 1920x1080x1", mb: 100, n: 1 }] }, {
        gpuJeFrameMs: 12,
    });
    const zeile = (id) => u8.klassen.find((z) => z.id === id);
    const wald = sauber.concat([
        { klasse: "f:tanne:L1", stufe: 1, art: "tree", je: { haupt: 300 }, jeTris: { haupt: 4e6 }, dMax: 30 },
    ]);
    const u8b = urteil(wald, null, null, { gpuJeFrameMs: 30 });
    t(
        "sauberer Zensus im Band → GRÜN, Täter in boden/baum/karten/bau/einzelstuecke, Post-Pass außerhalb; " +
            "ein Wald über dem Band → BAND ROT bei sauberer Linse",
        u8.urteil === "GRUEN" &&
            u8.bandUrteil === "IM BAND" &&
            zeile("boden").ist.befehle === 12 &&
            zeile("baum").taeter[0].klasse === "f:eiche:L0" &&
            zeile("karten").taeter[0].klasse === "fimp:eiche:L2" &&
            zeile("bau").taeter[0].klasse === "g:tor:L0" &&
            zeile("einzelstuecke").taeter[0].klasse === "himmel" &&
            u8.ausserhalb.ortho === 1 &&
            u8b.urteil === "ROT" &&
            u8b.linse === "SAUBER" &&
            u8b.bandUrteil === "UEBER" &&
            u8b.groessen.filter((g) => g.ist > g.soll).length === 3
    );

    // S12 — das Maximum über die Proben: je Klasse × Pass der teuerste Frame, dMax der weiteste.
    const zm = BAND.zensusMax([
        { klassen: [{ klasse: "tier:wolf", je: { haupt: 6, k0: 6 }, jeTris: { haupt: 10, k0: 10 }, dMax: 20 }] },
        {
            klassen: [
                { klasse: "tier:wolf", je: { haupt: 12 }, jeTris: { haupt: 20 }, dMax: 40 },
                { klasse: "himmel", je: { haupt: 1 }, jeTris: { haupt: 2 } },
            ],
        },
    ]);
    const zw = zm.klassen.find((k) => k.klasse === "tier:wolf");
    t(
        "zensusMax: tier:wolf haupt 12 · k0 6 · dMax 40, himmel aus der zweiten Probe",
        zw.je.haupt === 12 && zw.je.k0 === 6 && zw.cmd === 18 && zw.dMax === 40 && zm.klassen.length === 2
    );

    // S13 — die Täter-Klasse an Szenen-Knoten: ein Tier heißt nach seiner Seele, ein Kind einer Region nach seinem
    // Schlüssel (nie nach der Region), ein unbenanntes Kind einer Region nach seinem Namen, der Spieler `spieler`, ein
    // Schlüssel-Schwanz fällt, Ziffern im Namen bleiben.
    const sc = { type: "Scene" };
    const s13 = { scene: sc, playerMesh: null };
    const tierG = { type: "Group", name: "", userData: { _tierBaum: {}, soul: "wolf" }, parent: sc };
    const tierM = { type: "SkinnedMesh", name: "", userData: {}, parent: tierG };
    const region = { type: "BundleGroup", isBundleGroup: true, name: "regionBundle:3,4", userData: { regionKey: "3,4" }, parent: sc };
    const inst = { type: "Mesh", name: "", userData: { archInstanceKey: "fscatter:eiche:2:1#0@3,4" }, parent: region };
    const ohne = { type: "Mesh", name: "", userData: {}, parent: region };
    const spieler = { type: "Group", name: "", userData: {}, parent: sc };
    s13.playerMesh = spieler;
    const kind = { type: "Mesh", name: "", userData: {}, parent: spieler };
    const chunk = { type: "Mesh", name: "voxelChunk:3,-4:lod0", userData: {}, parent: sc };
    const p2p = { type: "Group", name: "p2p-spieler", userData: {}, parent: sc };
    const leerKey = "fscatter:blume:3:0#2@4,5";
    const s13leer = { scene: sc, playerMesh: null, archInstanceGroups: new Map([[leerKey, { liveCount: 0 }]]) };
    const leer = { type: "Mesh", name: "", userData: { archInstanceKey: leerKey }, parent: region };
    t(
        "Täter-Klasse: tier:wolf · fscatter:eiche:L1 · UNBENANNT unter der Region · spieler · voxelChunk · p2p-spieler · " +
            "leer:fscatter:blume:L0 (Gruppe ohne lebende Instanz)",
        S.klasse(tierM, s13) === "tier:wolf" &&
            S.klasse(inst, s13) === "fscatter:eiche:L1" &&
            S.klasse(ohne, s13) === "UNBENANNT:Mesh" &&
            S.klasse(kind, s13) === "spieler" &&
            S.klasse(chunk, s13) === "voxelChunk" &&
            S.klasse(p2p, s13) === "p2p-spieler" &&
            S.klasse(leer, s13leer) === "leer:fscatter:blume:L0" &&
            S.klasse(leer, s13) === "fscatter:blume:L0"
    );

    // S14 — eine FREIE Klasse (Weltzustand: Tiere) trägt keine Ratsche: über jeder Zahl nie rot, die Summen-Ratsche
    // zählt sie nicht, der Nachzug setzt sie nicht; ein Grund ohne Gate und ein Wert an der freien Klasse sind rot.
    const r14 = JSON.parse(JSON.stringify(rt));
    r14.frei = { tier: "Weltzustand — Kosten je Tier hält gate:kreatur-kosten" };
    r14.gesamt.befehle = 4;
    const z14 = [
        { klasse: "bodenSatz", stufe: null, art: null, je: { haupt: 4 }, jeTris: { haupt: 40 } },
        { klasse: "tier:baer", stufe: null, art: null, je: { haupt: 40, k0: 40 }, jeTris: { haupt: 9e4 } },
    ];
    const u14 = urteil(z14, r14);
    const n14 = BAND.ratscheNachziehen(r14, u14, { datum: "selbsttest", eingeschwungen: true });
    const r14b = JSON.parse(JSON.stringify(r14));
    r14b.frei.tier = "Weltzustand";
    const r14c = JSON.parse(JSON.stringify(r14));
    r14c.klassen.tier.haupt.befehle = 11;
    t(
        "freie Klasse tier: 80 Befehle nicht rot, Summe gebunden 4, Nachzug lässt sie null; Grund ohne Gate und Wert rot",
        !hatRot(u14, "ratsche") &&
            u14.summe.gebunden.befehle === 4 &&
            u14.summe.befehle === 84 &&
            n14.ratsche.klassen.tier.haupt.befehle === null &&
            n14.ratsche.klassen.boden.haupt.befehle === 4 &&
            !BAND.ratschePruefen(n14.ratsche, haushalt).length &&
            BAND.ratschePruefen(r14b, haushalt).some((f) => /Gate/.test(f)) &&
            BAND.ratschePruefen(r14c, haushalt).some((f) => /keine Ratschen-Werte/.test(f))
    );

    // S15 — die Hülle einer Serie: je Klasse × Pass das Maximum über die Läufe, der VRAM je Erzeuger und gesamt ebenso
    // (die Ratsche nimmt nie einen Lauf: ein Bau an der Cull-Kante zählt in einem Lauf 42 Befehle, im nächsten 0).
    const hl = BAND.bandHuelle([
        {
            zensus: [{ klasse: "f:griechisch:L2", stufe: 2, art: "haus", je: { haupt: 42 }, jeTris: { haupt: 900 } }],
            vram: { mb: 230, liste: [{ k: "tex:output rgba16float 1920x1080x1", mb: 15.8, n: 1 }] },
        },
        {
            zensus: [{ klasse: "bodenSatz", stufe: null, art: null, je: { haupt: 6 }, jeTris: { haupt: 760 } }],
            vram: { mb: 227, liste: [{ k: "buf:?", mb: 60, n: 1500 }] },
        },
    ]);
    t(
        "bandHuelle: f:griechisch:L2 42 aus Lauf 1, bodenSatz 6 aus Lauf 2, VRAM 230 MB, beide Erzeuger",
        hl.zensus.klassen.find((k) => k.klasse === "f:griechisch:L2").je.haupt === 42 &&
            hl.zensus.klassen.find((k) => k.klasse === "bodenSatz").je.haupt === 6 &&
            hl.vram.mb === 230 &&
            hl.vram.liste.length === 2
    );

    // S16 — H5: ein Muster mit einem Namen, den der Stamm nicht mehr vergibt, wird rot; der echte Haushalt nicht, ein Name
    // mit Namens-Schwanz (`"voxelChunk:" + key`) lebt.
    const h16 = JSON.parse(JSON.stringify(haushalt));
    h16.klassen.find((k) => k.id === "bau").regeln.push({ muster: "^(bau-fundament|siedlung-wege)$" });
    const n16 = namenLeben(h16, stamm);
    t(
        "H5: ein toter Name (siedlung-wege) wird rot, der echte Haushalt nicht, voxelChunk mit Schwanz lebt",
        n16.errs.length === 1 &&
            /siedlung-wege/.test(n16.errs[0]) &&
            namenLeben(haushalt, stamm).errs.length === 0 &&
            namenLeben({ klassen: [{ id: "boden", regeln: [{ muster: "^voxelChunk$" }] }] }, stamm).errs.length === 0
    );

    // S17 — DER SPEICHER OHNE BILD (W6): ein Geometrie-Puffer, den nur r184s Register (`buf:verwaist`) oder nur der Foundry-
    // Cache (`buf:ruhend`) hält, ist ein LECK (LINSE rot, der Täter beim Namen); die gezeichneten (`buf:szene`) und die vom
    // Frame gezeichneten (`buf:bild`) nicht; die Halter-Schlüssel falten zu ihrem Halter, die größten Täter reisen mit.
    const v17 = (liste) => urteil([], null, { mb: 100, liste });
    const u17 = v17([
        { k: "buf:szene:bodenSatz", mb: 21.0, n: 6 },
        { k: "buf:szene:f:eiche:L0", mb: 1.7, n: 30 },
        { k: "buf:szene:spieler", mb: 8.0, n: 48 },
        { k: "buf:bild:vertex", mb: 0.001, n: 2 },
    ]);
    const u17b = v17([
        { k: "buf:szene:bodenSatz", mb: 21.0, n: 6 },
        { k: "buf:verwaist:instanzMatrix", mb: 2.3, n: 1530 },
        { k: "buf:ruhend:eiche|#|#", mb: 1.2, n: 26 },
    ]);
    const lecks = u17b.rot.filter((x) => x.art === "leck");
    const szene = u17.vram.erzeuger.find((e) => e.erzeuger === "buf:szene");
    t(
        "buf:verwaist und buf:ruhend → LINSE rot `leck` mit Täter; buf:szene und buf:bild nicht; die Halter falten, die " +
            "größten Täter reisen mit",
        !hatRot(u17, "leck") &&
            u17.linse === "SAUBER" &&
            lecks.length === 2 &&
            u17b.linse === "ROT" &&
            lecks.some((x) => /buf:verwaist: 2.3 MB in 1530 Puffern.*instanzMatrix/.test(x.text)) &&
            lecks.some((x) => /buf:ruhend.*eiche/.test(x.text)) &&
            BAND.erzeugerOf("buf:szene:f:eiche:L0").erzeuger === "szene" &&
            BAND.erzeugerOf("buf:verwaist:instanzMatrix").erzeuger === "verwaist" &&
            szene &&
            szene.mb === 30.7 &&
            szene.form[0] === "buf:szene:bodenSatz" &&
            szene.form[1] === "buf:szene:spieler"
    );
    // S18 — ein gefallener VRAM-Erzeuger (der Abgriff sieht ihn nicht mehr) zieht seine Ratsche auf 0, ein lebender sinkt.
    const r18 = JSON.parse(JSON.stringify(rt));
    r18.vramMB = { "tex:depthBuffer": 7.9, "buf:szene": 50 };
    const n18 = BAND.ratscheNachziehen(r18, u17, { datum: "selbsttest", eingeschwungen: true });
    // … und `nur: "vram"` (ein Schnitt, der nur den Speicher bewegt) lässt die Klassen-Zeilen und ihre Serie stehen.
    const r18b = JSON.parse(JSON.stringify(r18));
    r18b.klassen.boden.haupt.befehle = 10;
    r18b.gemessen = { datum: "klassen-serie", eingeschwungen: true };
    const u18b = urteil(
        [{ klasse: "bodenSatz", stufe: null, art: null, je: { haupt: 7 }, jeTris: { haupt: 7000 } }],
        r18b,
        { mb: 100, liste: [{ k: "buf:szene:bodenSatz", mb: 21, n: 6 }] }
    );
    const n18b = BAND.ratscheNachziehen(r18b, u18b, { datum: "vram-serie", eingeschwungen: true }, "vram");
    t(
        "Ratsche VRAM: der gefallene tex:depthBuffer 7.9 → 0, buf:szene 50 → 30.7, buf:bild gesetzt; nur vram: Klassen bleiben",
        n18.ratsche.vramMB["tex:depthBuffer"] === 0 &&
            n18.ratsche.vramMB["buf:szene"] === 30.7 &&
            n18.ratsche.vramMB["buf:bild"] === 0 &&
            n18b.ratsche.klassen.boden.haupt.befehle === 10 &&
            n18b.ratsche.vramMB["buf:szene"] === 21 &&
            n18b.ratsche.gemessen.datum === "klassen-serie" &&
            n18b.ratsche.gemessen.vram.datum === "vram-serie" &&
            !BAND.ratschePruefen(n18b.ratsche, haushalt).length &&
            BAND.vramBefunde(u17b).length === 2 &&
            BAND.vramBefunde(u5).length === 0 &&
            BAND.vramBefunde(u7).length === 1
    );
    // S19 — die Geometrie der Tiere ist der freie Erzeuger `buf:tier` (Weltzustand): keine Ratsche, nicht in der gebundenen
    // Summe, der Nachzug setzt ihn nie; die übrige Szene bleibt `buf:szene`.
    const r19 = JSON.parse(JSON.stringify(rt));
    r19.frei = { tier: "Weltzustand — Kosten je Tier hält gate:kreatur-kosten" };
    r19.vramMB = { "buf:tier": 1, "buf:szene": 30 };
    r19.gesamt.vramMB = 31;
    const u19 = urteil([], r19, {
        mb: 40,
        liste: [
            { k: "buf:szene:bodenSatz", mb: 30, n: 6 },
            { k: "buf:szene:tier:baer", mb: 6, n: 60 },
            { k: "buf:szene:tier:fuchs", mb: 4, n: 50 },
        ],
    });
    const n19 = BAND.ratscheNachziehen(r19, u19, { datum: "s19", eingeschwungen: true }, "vram");
    t(
        "buf:szene:tier:* → freier Erzeuger buf:tier (10 MB über seiner Ratsche 1 nie rot), gebunden 30 MB, der Nachzug lässt ihn",
        BAND.erzeugerOf("buf:szene:tier:baer").erzeuger === "tier" &&
            BAND.erzeugerOf("buf:szene:f:eiche:L0").erzeuger === "szene" &&
            !hatRot(u19, "ratsche") &&
            u19.vram.gebunden === 30 &&
            n19.ratsche.vramMB["buf:tier"] === 1 &&
            n19.ratsche.gesamt.vramMB === 30
    );

    // S20 — DIE MESSORTE (S1 W1f): ein Ort ohne Blick-Richtung, mit doppelter id, mit fremder Ratschen-Datei, ohne Dorf-
    // Zug-Wahl, mit einer Ratsche, die schon ein anderer Ort trägt, und eine Soll-Zeile ohne Quelle werden rot; der echte
    // Haushalt nicht. Ohne Wahl gilt die Mess-Wiese, ein unbekannter Ort bricht laut.
    const h20 = (f) => {
        const h = JSON.parse(JSON.stringify(haushalt));
        f(h.messorte);
        return BAND.messortePruefen(h);
    };
    let unbekannt = false;
    try {
        BAND.ortOf(haushalt, "mond");
    } catch (_e) {
        unbekannt = true;
    }
    t(
        "Messorte: Blick auf dem Spieler, doppelte id, fremde Ratsche, dorfZug fehlt, geteilte Ratsche, Soll ohne Quelle " +
            "→ rot; der echte Haushalt nicht; ohne Wahl die Mess-Wiese, ein unbekannter Ort bricht",
        h20((o) => (o[1].blick = o[1].spieler.slice())).some((x) => /keine Richtung/.test(x)) &&
            h20((o) => (o[1].id = o[0].id)).some((x) => /doppelter id/.test(x)) &&
            h20((o) => (o[1].ratsche = "../haushalt.json")).some((x) => /keine Datei ratsche/.test(x)) &&
            h20((o) => delete o[1].dorfZug).some((x) => /dorfZug/.test(x)) &&
            h20((o) => (o[1].ratsche = o[0].ratsche)).some((x) => /schon ein anderer Ort/.test(x)) &&
            h20((o) => delete o[1].soll[0].quelle).some((x) => /Soll-Zeile/.test(x)) &&
            !BAND.messortePruefen(haushalt).length &&
            BAND.ortOf(haushalt).id === "wiese" &&
            unbekannt
    );
    // S21 — die Ratsche gehört dem Ort: dieselbe Klasse über der Genesis-Ratsche ist dort rot, gegen die (ungemessene)
    // Ratsche der Wiese nicht; die Gier des Orts blickt zum Blickpunkt (Wiese +z = 0, Genesis +x = π/2).
    const gen = BAND.ladeSpec("genesis");
    const r21 = JSON.parse(JSON.stringify(rt));
    r21.klassen.bau.haupt.befehle = 20;
    const bauGenesis = [{ klasse: "f:kathedrale:L0", stufe: 0, art: "gate", je: { haupt: 30 }, jeTris: { haupt: 9000 } }];
    const u21 = BAND.bandUrteil({ zensus: { klassen: bauGenesis }, haushalt, ratsche: r21, ort: gen.ort });
    const u21b = BAND.bandUrteil({ zensus: { klassen: bauGenesis }, haushalt, ratsche: rt, ort: BAND.ortOf(haushalt) });
    t(
        "bau 30 Befehle über der Genesis-Ratsche 20 → rot (Ort genesis im Urteil), gegen die ungemessene nicht; Gier wiese 0, genesis π/2",
        hatRot(u21, "ratsche") &&
            u21.ort === "genesis" &&
            !hatRot(u21b, "ratsche") &&
            u21b.ort === "wiese" &&
            BAND.ortGier(BAND.ortOf(haushalt, "wiese")) === 0 &&
            Math.abs(BAND.ortGier(gen.ort) - Math.PI / 2) < 1e-12 &&
            !BAND.ratschePruefen(gen.ratsche, haushalt).length
    );
    // S22 — die Tor-Hülle des Orts (Soll-Zeile): 2 Tore × 26 Stoff-Züge, 368 000 Dreiecke im Hauptbild → 184 000 je Tor
    // (3,07× das Band 60 000); eine Klasse anderer Art oder Stufe zählt nicht.
    const s22 = BAND.ortSoll(gen.ort, {
        klassen: [
            { klasse: "f:drachentor:L0", stufe: 0, art: "gate", je: { haupt: 26 }, jeTris: { haupt: 368000 }, inst: 52 },
            { klasse: "f:drachentor:L1", stufe: 1, art: "gate", je: { haupt: 26 }, jeTris: { haupt: 9e5 }, inst: 26 },
            { klasse: "f:gt:L0", stufe: 0, art: "vehicle", je: { haupt: 12 }, jeTris: { haupt: 3e4 }, inst: 12 },
        ],
    });
    t(
        "Tor-Hülle: f:drachentor:L0 368 000 im Hauptbild bei 2 Toren → 184 000 je Tor (3,07×), L1 und Fahrzeug nicht",
        s22.length === 1 && s22[0].huelle === 184000 && s22[0].exemplare === 2 && s22[0].faktor === 3.07
    );
    // S23 — H6: ein Ort-Takt mit einem Namen, den der Stamm nicht trägt, wird rot; der echte nicht.
    const h23 = JSON.parse(JSON.stringify(haushalt));
    h23.messorte[1].ortTakt = ["_genesisPortalRing", "_genesisRingAlt"];
    const o23 = ortTaktLebt(h23, stamm);
    t(
        "H6: _genesisRingAlt im Ort-Takt → rot, der echte Ort-Takt lebt",
        o23.errs.length === 1 && /_genesisRingAlt/.test(o23.errs[0]) && !ortTaktLebt(haushalt, stamm).errs.length
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
    // H2 je Ort: jede Ratsche trägt das Schema (die Mess-Wiese und jeder weitere Ort).
    const orte = (haushalt.messorte || []).map((o) => ({ o, r: BAND.ladeSpec(o.id).ratsche }));
    for (const { o, r } of orte) for (const f of BAND.ratschePruefen(r, haushalt)) errs.push(`H2 [${o.id}] ${f}`);
    const stamm = fs.readFileSync(path.join(root, "anazhRealm.js"), "utf8");
    const nw = namensWand(stamm);
    for (const f of nw.errs) errs.push("H3 " + f);
    const tw = taeterWand(stamm);
    for (const f of tw.errs) errs.push("H4 " + f);
    const nl = namenLeben(haushalt, stamm);
    for (const f of nl.errs) errs.push("H5 " + f);
    const ot = ortTaktLebt(haushalt, stamm);
    for (const f of ot.errs) errs.push("H6 " + f);
    if (errs.length) {
        console.log("⛔ DIE BAND-WAND:");
        for (const e of errs) console.log("   ❌ " + e);
        process.exit(1);
    }
    const paesse = haushalt.paesse;
    const gemessenAn = (r) => {
        let g = 0,
            f = 0;
        for (const id of Object.keys(r.klassen))
            for (const p of paesse)
                for (const x of ["befehle", "dreiecke"]) {
                    f++;
                    if (r.klassen[id][p][x] != null) g++;
                }
        return { g, f };
    };
    const { g: gemessen, f: felder } = gemessenAn(ratsche);
    const ortZeile = orte
        .map(({ o, r }) => {
            const x = gemessenAn(r);
            return `${o.id} (${o.ratsche}, gemessen ${x.g} von ${x.f})`;
        })
        .join(" · ");
    console.log(
        `✅ DIE BAND-WAND steht — H1 Haushalt ${h.summe.befehle}/${haushalt.band.befehle} Befehle · ` +
            `${h.summe.dreiecke}/${haushalt.band.dreiecke} Dreiecke in ${haushalt.klassen.length} Klassen (keine Sammelzeile) · ` +
            `H2 Ratsche ${haushalt.klassen.length} Klassen × ${paesse.length} Pässe (gemessen ${gemessen} von ${felder}` +
            `${ratsche.gemessen ? ", " + ratsche.gemessen.datum.slice(0, 10) : ""}, Toleranz ${ratsche.toleranzPct} % / ` +
            `+${ratsche.toleranzAbs.befehle} Befehle) · H3 ${nw.n} Textur-Erzeuger benannt · ` +
            `H4 Täter-Klasse des Stamms: ${tw.n} Schlüssel-Formen · H5 ${nl.n} Haushalt-Namen mit Erzeuger im Stamm · ` +
            `Messorte ${ortZeile} · H6 ${ot.n} Ort-Takt-Methoden im Stamm.`
    );
}

main();
