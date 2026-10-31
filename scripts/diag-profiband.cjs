#!/usr/bin/env node
// diag-profiband.cjs — DIE BAND-WAND (W0): EINE Wand statt Diag-Flut, der headless-Teil des Profi-Band-Richters.
// Die Band-Linse nennt jeden Befehl, jedes Dreieck und jedes MB beim
// Täter — die Täter-Klasse ist die des Stamms (`AnazhRealm#_taeterKlasse`, `_instanzKlasse`, `_taeterName`: dieselbe
// für Draw-Zähler, Flugschreiber, Albedo-Sicht und den Szenen-Zensus des Playtests) — und urteilt gegen den Haushalt
// und die Ratsche (spec/profiband/, scripts/lib/band-urteil.cjs): auf der echten GPU `node scripts/werkbank.cjs band`,
// hier ohne GPU:
//
//   H1  der Haushalt hält das Band: Summe der Klassen <= 208 Befehle und <= 680k Dreiecke, Schema gültig, KEINE
//       Sammelzeile (`rest`), jedes Muster verankert
//   H2  die Ratsche trägt jede Haushalt-Klasse × Pass (null = ungemessen), ihre Toleranz und — wenn gemessen — eine
//       eingeschwungene Messung
//   H2b DIE FRISCHE: jede Ratsche, die der Haushalt fordert (Band-Ort × Gerät × Sicht: Radeon und GTX, Ego und
//       Third-Person), steht gemessen, an höchstens einer Version vor dem Kopf (package.json), an ihrem Ort, Gerät und in ihrer
//       Sicht; ihre Gesamt-Zeile ist höchstens die Summe der Klassen (darüber feuert sie nie); `--messung <boot.json …>`
//       (Boots der Messfolge oder Band-Dateien) richtet jede Ratsche gegen die Messung ihres Orts × Geräts × Sicht: eine
//       Zeile über Messung × (1 + Toleranz) ist zu weit — der Re-Mint (`werkbank ratsche --neu`) heilt H2b
//   H4  die Täter-Klasse des Stamms (die echte Klasse im vm, `stammLib.ladeKlasse`) klassifiziert die Schlüssel-Formen,
//       die der Stamm heute baut (Studio-Leaf als Schlüssel, Schatten-Zwilling `#S`, ov-Hash, Karte, Streu, Bauplan)
//   H7  DIE ZEICHEN-REIHE (1310-1, T3) an der echten Klasse: EIN Gesetz `_zeichenRang` für alles Opake — die Bündel
//       (`_buendelReihe`) @global · Regionen · @wahl, die losen Opaken jedes Renders (`_configureRenderer` setzt
//       `_zeichenFolge`) Bau · Boden · Fern · Himmel, gleich wer beim Boot zuerst ankam (Objekt-id: der Bau-Satz nach dem
//       Boden, gpu-bank +1,4–1,55 ms); im Bündel L0 zuerst, in der Stufe vorn zuerst, neu nur beim Anker-Wechsel
//   P   DIE PROJEKTION (S3): Σ Zensus der Mess-Wiese (spec/profiband/zensus-wiese.json) × Golden-Dreiecke je Art × Stufe ×
//       Pass ≤ Haushalt der Klasse baum — die Studio-Ausgänge gegen das Band, ohne GPU (Pflicht ab dem Vertrags-Akt);
//       die Zeile nahWiese: Σ Büschel je Gestalt × Stufe × Golden-Dreiecke IHRER Gestalt ≤ Ratsche der Klasse am Ort
//       (haupt) und ≤ Haushalt
//
// Die Absenz der gefallenen Band-Täter prüft gate:altlasten — die EINE Rückkehr-Wand.
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
// über der eines anderen nicht · die Tor-Hülle je Tor (Soll-Zeile des Genesis-Rings) · ein toter Ort-Takt wird rot ·
// ein Lauf, der nicht im Zustand seines Orts stand (Dorf-Zug, Aufstellung, Blick, Ort-Takt), wird beim Namen genannt.
// S3 haus: der Satz-Inhalt nennt den Täter im EINEN Befehl eines Satzes (ein gepflanzter Bereich erscheint, ein falscher
// Draw-Umfang als REST; die Ratschen-Zeile „bauSatz k0: f:feuerstelle:L1 29 Zellen = 12 760") · der Wurf je Exemplar
// (Soll-Zeile mit `stufen`, Messort dorf) · das Einschwingen wartet auf den Dorf-Zug (Export, wachsende Siedlung).
//
//   node scripts/diag-profiband.cjs [--selftest] [--messung <boot.json …>]          (npm run gate:profiband)
"use strict";
const { selbsttestEnde } = require("./lib/welt-boot.cjs");
const fs = require("fs");
const path = require("path");
const DZ = require("./lib/draw-zaehler.cjs");
const BAND = require("./lib/band-urteil.cjs");
const stammLib = require("./lib/stamm.cjs");

const root = path.join(__dirname, "..");

// DIE ECHTE KLASSE (scripts/lib/stamm.cjs `ladeKlasse`, im vm wie der Wirt der Wiese) — kein Rumpf-Text, kein Zwilling; der
// Selbsttest lädt einen veränderten Stamm (`monolith`) und fährt dieselben Proben.
let _A = null;
const klasseVon = (monolith) => (monolith == null ? _A || (_A = stammLib.ladeKlasse(root).AnazhRealm) : stammLib.ladeKlasse(root, { monolith }).AnazhRealm);
const weltVon = (A, state) => Object.assign(Object.create(A.prototype), { state });

// H4 — DIE TÄTER-KLASSE DES STAMMS: `klasse(obj, state)` und `instanz(key)` der echten Klasse.
function stammKlasse(A) {
    const klasse = (obj, state) => A.prototype._taeterKlasse.call(weltVon(A, state), obj);
    return { klasse, instanz: (k) => A._instanzKlasse(k), name: (x) => A._taeterName(x) };
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

function taeterWand(A) {
    const errs = [];
    const S = stammKlasse(A);
    for (const [k, soll] of SCHLUESSEL) {
        const ist = S.instanz(k);
        if (ist !== soll) errs.push(`_instanzKlasse("${k}") = ${ist}, erwartet ${soll}`);
    }
    return { errs, n: SCHLUESSEL.length, S };
}

// H7 — DIE ZEICHEN-REIHE (1310-1, T3): `_buendelReihe` über eine Szene, in der @wahl vor einer Region und @global ankam —
// danach tragen die Bündel-Plätze @global · die Regionen (in Ankunft) · @wahl, jedes andere Kind steht, wo es stand. Die losen
// Opaken in Boot-Ankunft (Himmel, Fern, Boden vor dem Bau, gleiche Tiefe) folgen `_zeichenFolge` als Bau · Boden · Fern ·
// Himmel, der Feld-Pass (renderOrder) zuletzt; `_configureRenderer` setzt sie. Gefahren an der echten Klasse `A`.
function buendelReiheWand(A) {
    const errs = [];
    if (typeof A._zeichenFolge !== "function" || typeof A.prototype._buendelReihe !== "function")
        return { errs: ["_zeichenFolge / _buendelReihe fehlen im Stamm — die Zeichen-Reihe hängt an der Ankunft beim Boot"], n: 0 };
    const R = { setSize() {}, setPixelRatio() {}, setClearColor() {}, shadowMap: {}, setOpaqueSort: (fo) => (R.folge = fo) };
    try {
        A.prototype._configureRenderer.call(weltVon(A, {}), R);
    } catch {
        /* was nach der Folge kommt, braucht die Welt */
    }
    if (R.folge !== A._zeichenFolge) errs.push("_configureRenderer setzt die Zeichen-Reihe der losen Opaken nicht (setOpaqueSort) — die Objekt-id entscheidet");
    const L = (n, ro, s, id) => ({ groupOrder: 0, renderOrder: ro, z: -0.1, id, object: { name: n, userData: s ? { zeichenSchicht: s } : {} } });
    const istL = [L("himmel", 0, "himmel", 20), L("feld-pass", 9998, null, 51), L("fern-ring", 0, "fern", 47), L("bodenSatz", 0, "boden", 46), L("bauSatz", 0, null, 6361)].sort(A._zeichenFolge).map((x) => x.object.name).join(" · ");
    if (istL !== "bauSatz · bodenSatz · fern-ring · himmel · feld-pass") errs.push(`die losen Opaken nach der Ankunft Himmel · Feld · Fern · Boden · Bau: ${istL} — Soll bauSatz · bodenSatz · fern-ring · himmel · feld-pass`);
    const B = (k) => ({ isBundleGroup: true, name: "regionBundle:" + k, userData: { regionKey: k } });
    const scene = { children: [{ name: "voxelChunk:0,0" }, B("@wahl"), B("3,4"), { name: "himmel" }, B("@global"), B("s:1,2")] };
    A.prototype._buendelReihe.call(weltVon(A, {}), scene);
    const ist = scene.children.map((c) => (c.userData ? c.userData.regionKey : c.name)).join(" · "), soll = "voxelChunk:0,0 · @global · 3,4 · himmel · s:1,2 · @wahl";
    if (ist !== soll) errs.push(`die Reihe der Bündel nach der Ankunft @wahl · 3,4 · @global · s:1,2: ${ist} — Soll ${soll}`);
    // DIE REIHE IM BÜNDEL (1310-8): die Gruppen eines Bündels nach ihrer Stufe (L0 zuerst, die Atlas-Karte zuletzt), im
    // Gleichstand nach Schlüssel.
    if (typeof A._buendelKinderReihe !== "function") return { errs: errs.concat(["_buendelKinderReihe fehlt im Stamm — die Gruppen eines Bündels zeichnen in der Ankunft"]), n: 3 };
    const K = (stufe, key) => ({ userData: { buendelStufe: stufe, archInstanceKey: key } });
    const bundle = { children: [K(1, "f:a|1|1:0"), K(9, "atlas"), K(0, "f:b|1|0:0"), K(0, "f:a|1|0:2"), K(1, "f:a|1|1:0#S")] };
    A._buendelKinderReihe(bundle);
    const istK = bundle.children.map((c) => c.userData.archInstanceKey).join(" · "), sollK = "f:a|1|0:2 · f:b|1|0:0 · f:a|1|1:0 · f:a|1|1:0#S · atlas";
    if (istK !== sollK) errs.push(`die Reihe im Bündel nach der Ankunft L1 · Karte · L0 · L0 · Zwilling: ${istK} — Soll ${sollK}`);
    // DIE REIHE NACH ABSTAND (1310-9): mit dem Auge zeichnet in der Stufe vorn zuerst (die nächste Instanz der Gruppe); neu
    // gestellt nur beim Anker-Wechsel (das Auge ≥ BUENDEL_ANKER_M weiter), dann nimmt jedes Bündel EINMAL neu auf.
    if (typeof A.prototype._buendelAnkerPruefen !== "function") return { errs: errs.concat(["_buendelAnkerPruefen fehlt im Stamm — die Reihe kennt kein Auge (vorn nicht zuerst)"]), n: 5 };
    const I = (stufe, key, ...orte) => {
        const a = new Float32Array(16 * Math.max(1, orte.length));
        orte.forEach((o, i) => ((a[i * 16 + 12] = o[0]), (a[i * 16 + 14] = o[1])));
        return { userData: { buendelStufe: stufe, archInstanceKey: key }, instanceMatrix: { array: a }, count: orte.length };
    };
    const fernVorn = { children: [I(0, "f:a|1|0:0", [40, 0]), I(1, "f:z|1|1:0", [1, 0]), I(0, "f:b|1|0:0", [50, 0], [3, 0])] };
    A._buendelKinderReihe(fernVorn, { x: 0, z: 0 });
    const istA = fernVorn.children.map((c) => c.userData.archInstanceKey).join(" · "), sollA = "f:b|1|0:0 · f:a|1|0:0 · f:z|1|1:0";
    if (istA !== sollA) errs.push(`die Reihe nach Abstand (L0 bei 40 m · L1 bei 1 m · L0 bei 50 m und 3 m): ${istA} — Soll ${sollA}`);
    const M = A.BUENDEL_ANKER_M;
    const B1 = { isBundleGroup: true, userData: { regionKey: "@wahl" }, needsUpdate: false, children: [I(0, "f:a|1|0:0", [40, 0]), I(0, "f:b|1|0:0", [3, 0])] };
    const welt = weltVon(A, { scene: { children: [B1] } });
    const erst = welt._buendelAnkerPruefen({ x: 0, z: 0 });
    B1.needsUpdate = false;
    const nah = welt._buendelAnkerPruefen({ x: M * 0.6, z: 0 });
    const nahNeu = B1.needsUpdate;
    const weit = welt._buendelAnkerPruefen({ x: M * 1.25, z: 0 });
    if (!(erst === true && nah === false && nahNeu === false && weit === true && B1.needsUpdate === true))
        errs.push(`der Anker der Reihe: erster Ruf ${erst}, ${M * 0.6} m ${nah} (Neuaufnahme ${nahNeu}), ${M * 1.25} m ${weit} — Soll true · false (keine) · true (Neuaufnahme)`);
    return { errs, n: 6 };
}

// P — DIE PROJEKTION (S3 pflanzen, GPU-frei): was die Studio-Ausgänge an der Mess-Wiese kosten, BEVOR eine Welt
// läuft — Σ Instanzen (der Zensus `spec/profiband/zensus-wiese.json`, je Art × Stufe × Pass am gestellten Ort gezählt) ×
// Golden-Dreiecke je Art × Stufe (Hauptbild: die gezeichneten Teile; Kaskade: der Wurf-Teil der L1 — das Maximum über die
// Golden-Samen) ≤ Haushalt der Klasse. Pflicht ab dem Vertrags-Akt (die
// eingefrorene render-config trägt tree[0].lagen); vorher zeigt sie die Zahl.
// H1 DIE WIESE: jeder Messort mit Wiesen-Gesetz (`wiese`) hält es am GESETZ — der Wirt ohne Browser ist die echte Klasse im
// vm (scripts/lib/welt-orte.cjs `wirtAmGesetz`), gemessen von derselben Funktion, die `werkbank umstellen --ort` in der Welt ruft
// (`wieseMessen`): Hang, Wasser, Kronen-Deckung, Waldrand, Blick und Horizont; das Gras der gebauten Boden-Karte urteilt die
// Welt.
let _wirt = null;
function wieseAmGesetz(haushalt) {
    const WO = require("./lib/welt-orte.cjs");
    if (!_wirt) _wirt = WO.wirtAmGesetz(root);
    const aus = { befunde: [], messungen: [] };
    for (const o of haushalt.messorte || []) {
        if (!o.wiese) continue;
        const m = WO.wieseMessen(_wirt, o.spieler[0], o.spieler[1], o.blick, o.wiese);
        aus.messungen.push(Object.assign({ ort: o.id }, m));
        for (const x of WO.wieseUrteil(m, o.wiese)) aus.befunde.push(`${o.id}: ${x}`);
    }
    return aus;
}

const ZENSUS = path.join(root, "spec", "profiband", "zensus-wiese.json");
const GOLDEN = path.join(root, "spec", "asset-contract", "v1", "golden");
function goldenDreiecke(arten) {
    const haupt = {},
        wurf = {};
    for (const f of fs.readdirSync(GOLDEN)) {
        const m = /^(.+)-s(-?\d+)-L([01])-summer\.json$/.exec(f);
        if (!m || !arten.has(m[1])) continue;
        const g = JSON.parse(fs.readFileSync(path.join(GOLDEN, f), "utf8"));
        let t = 0,
            w = 0;
        for (const x of g.meshes || []) {
            if (!x.attrs || !x.attrs.position) continue;
            // der Studio-Index reist als Uint32, ohne Index je drei Vertices (Float32 × 3); der Schatten-Teil (S3, teil
            // "schatten") zeichnet nur in den Kaskaden — er ist der Wurf, nicht das Bild
            const n = x.index ? x.index.bytes / 12 : x.attrs.position.bytes / 36;
            if (x.teil === "schatten") w += n;
            else t += n;
        }
        const k = m[1] + "|" + m[3];
        haupt[k] = Math.max(haupt[k] || 0, t);
        if (m[3] === "1") wurf[m[1]] = Math.max(wurf[m[1]] || 0, w);
    }
    return { haupt, wurf };
}
function projektion(zensus, tris) {
    const jePass = {};
    let summe = 0;
    const fehlt = [];
    for (const z of zensus.zeilen) {
        const t = z.pass === "haupt" ? tris.haupt[z.art + "|" + z.stufe] : tris.wurf[z.art];
        if (!Number.isFinite(t)) {
            fehlt.push(`${z.art} L${z.stufe} ${z.pass}`);
            continue;
        }
        const d = z.inst * t;
        jePass[z.pass] = (jePass[z.pass] || 0) + d;
        summe += d;
    }
    return { summe, jePass, fehlt };
}
function projektionsWand(haushalt, zensus, tris) {
    const k = haushalt.klassen.find((x) => x.id === zensus.klasse);
    const p = projektion(zensus, tris);
    const errs = [];
    if (!k) errs.push(`P: der Zensus nennt die Klasse ${zensus.klasse}, der Haushalt trägt sie nicht`);
    for (const f of p.fehlt) errs.push(`P: ${f} ohne Golden-Dreiecke`);
    if (k && p.summe > k.dreiecke)
        errs.push(`P: ${zensus.klasse} projiziert ${Math.round(p.summe)} Dreiecke > Haushalt ${k.dreiecke} (${zensus.ort})`);
    return { p, errs, soll: k ? k.dreiecke : null };
}
function projektionPflicht() {
    const rc = JSON.parse(fs.readFileSync(path.join(GOLDEN, "render-config.json"), "utf8"));
    const t0 = rc && rc.lod && rc.lod.budget && rc.lod.budget.tree && rc.lod.budget.tree[0];
    return !!(t0 && t0.lagen != null);
}

// P — DIE ZEILE nahWiese (S3 wiese-gestalten × pflanzen): die Nah-Wiese zeichnet genau ihre Gestalten
// (je Vorlage × Stufe × Teil EINE Senke `nahWiese:L<stufe>:<v>:<teil>`), die Golden-Samen des Grases SIND diese Gestalten —
// die Zeile nimmt je Zensus-Zeile die Golden-Dreiecke IHRER Gestalt (das Maximum über die Samen, wie beim Baum, hätte an der
// Mess-Wiese 63 002 statt der gemessenen 54 994 projiziert) und hält Σ Büschel × Dreiecke je Pass gegen die Ratsche der
// Klasse am Ort, darüber den Haushalt. Ein fehlender Ratschen-Wert ist nie 0 (Lehre 17): er wird beim Namen genannt.
function gestaltDreiecke(art, zeilen) {
    const out = {};
    for (const z of zeilen) {
        const f = path.join(GOLDEN, `${art}-s${z.gestalt}-L${z.stufe}-summer.json`);
        if (!fs.existsSync(f)) continue;
        const g = JSON.parse(fs.readFileSync(f, "utf8"));
        let t = 0;
        for (const x of g.meshes || []) {
            if (!x.attrs || !x.attrs.position || x.teil === "schatten") continue;
            t += x.index ? x.index.bytes / 12 : x.attrs.position.bytes / 36;
        }
        out[z.gestalt + "|" + z.stufe] = t;
    }
    return out;
}
function gestaltWand(haushalt, ratsche, block, ort, tris) {
    const k = haushalt.klassen.find((x) => x.id === block.klasse);
    const rz = ratsche && ratsche.klassen ? ratsche.klassen[block.klasse] : null;
    const errs = [];
    const jePass = {};
    const jeStufe = {};
    let summe = 0;
    if (!k) errs.push(`P: die Zeile ${block.klasse} nennt eine Klasse, die der Haushalt nicht trägt`);
    for (const z of block.zeilen) {
        const t = tris[z.gestalt + "|" + z.stufe];
        if (!Number.isFinite(t)) {
            errs.push(`P: ${block.art} Gestalt ${z.gestalt} L${z.stufe} ohne Golden-Dreiecke`);
            continue;
        }
        const d = z.inst * t;
        jePass[z.pass] = (jePass[z.pass] || 0) + d;
        jeStufe["L" + z.stufe] = (jeStufe["L" + z.stufe] || 0) + d;
        summe += d;
    }
    for (const [pass, d] of Object.entries(jePass)) {
        const r = rz && rz[pass] ? rz[pass].dreiecke : null;
        if (r == null || !Number.isFinite(r))
            errs.push(`P: die Ratsche (${ort}) trägt für ${block.klasse} ${pass} keine Dreiecke — kein Soll, keine Zeile`);
        else if (d > r) errs.push(`P: ${block.klasse} ${pass} projiziert ${d} Dreiecke > Ratsche ${r} (${ort})`);
    }
    if (k && summe > k.dreiecke)
        errs.push(`P: ${block.klasse} projiziert ${summe} Dreiecke > Haushalt ${k.dreiecke} (${ort})`);
    const soll = rz && rz.haupt ? rz.haupt.dreiecke : null;
    return { summe, jePass, jeStufe, soll, haushalt: k ? k.dreiecke : null, errs };
}

function selbsttest() {
    const { haushalt, ratsche } = BAND.ladeSpec("wiese", { geraet: "radeon", sicht: "ego" });
    const A = klasseVon();
    const S = stammKlasse(A);
    const tests = [];
    const t = (name, ok) => tests.push({ name, ok: !!ok });
    // Die Selbsttests urteilen gegen eine UNGEMESSENE Ratsche desselben Schemas mit fester Toleranz — die gemessenen
    // Werte der echten (die Hülle der Serie) dürfen keinen Selbsttest färben.
    const rt = JSON.parse(JSON.stringify(ratsche));
    rt.toleranzPct = 10;
    rt.toleranzAbs = { befehle: 2, dreiecke: 1000, vramMB: 1 };
    // gemessen (sonst nennte jedes Urteil die Ratsche „ungemessen", K26), jedes Feld ungemessen (null)
    rt.gemessen = { datum: "selbsttest-basis", eingeschwungen: true };
    rt.gesamt = { befehle: null, dreiecke: null, vramMB: null };
    delete rt.vramMB;
    for (const id of Object.keys(rt.klassen))
        for (const p of Object.keys(rt.klassen[id])) rt.klassen[id][p] = { befehle: null, dreiecke: null };
    const urteil = (klassen, r, vram, gpu) =>
        BAND.bandUrteil({ zensus: { klassen }, vram: vram || null, gpu: gpu || null, haushalt, ratsche: r || rt });
    const hatRot = (u, art) => u.rot.some((x) => x.art === art);

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
    const tw = taeterWand(A);
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
        "Ratsche: null gesetzt, 10 → 7 gesenkt, 3 bleibt (5 hebt nie), die Gesamt-Zeile höchstens die Summe ihrer Zeilen " +
            "(gemessen 12, die Zeilen 7 + 3 → 10; H2b), Schema hält nur eingeschwungen",
        n10.ratsche.klassen.boden.haupt.befehle === 7 &&
            n10.ratsche.klassen.boden.haupt.dreiecke === 7000 &&
            n10.ratsche.klassen.bau.haupt.befehle === 3 &&
            n10.ratsche.klassen.bau.haupt.dreiecke === 900 &&
            n10.ratsche.gesamt.befehle === 10 &&
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
    const u8 = urteil(sauber, null, { mb: 100, liste: [{ k: "tex:output rg11b10ufloat 1440x810x1", mb: 4.4, n: 1 }, { k: "buf:szene:bodenSatz", mb: 95.6, n: 6 }] }, {
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
    // S17c — DAS RAHMEN-ZIEL DES DIREKTPFADS: `tex:r184-ausgabe` im Band ist ein Linsen-Rest (0710-9 B: 23,7 MB in
    // `band --ort genesis` nach `zerlegen`) → LINSE rot `leck` mit Zahl und Grund; ohne VRAM-Abgriff zählen die Textur-Objekte;
    // ein Band ohne Rahmen-Ziel bleibt sauber.
    const u17c = v17([
        { k: "buf:szene:bodenSatz", mb: 21.0, n: 6 },
        { k: "tex:r184-ausgabe rgba16float 1920x1080x1", mb: 15.8, n: 1 },
        { k: "tex:r184-ausgabe:tiefe depth24plus 1920x1080x1", mb: 7.9, n: 1 },
    ]);
    const r17c = BAND.rahmenZielBefunde(null, {
        mb: 30,
        erzeuger: [
            { erzeuger: "TRAANode", mb: 15.8, n: 2 },
            { erzeuger: "r184-ausgabe", mb: 23.7, n: 2 },
        ],
        unbenannt: [],
    });
    t(
        "tex:r184-ausgabe → LINSE rot `leck` (23.7 MB, Rahmen-Ziel des Direktpfads); aus den Textur-Objekten ebenso; ohne es sauber",
        u17c.linse === "ROT" &&
            u17c.rot.some(
                (x) =>
                    x.art === "leck" &&
                    /tex:r184-ausgabe 23\.7 MB in 2 Texturen — Rahmen-Ziel des Direktpfads/.test(x.text)
            ) &&
            BAND.vramBefunde(u17c).length === 1 &&
            r17c.length === 1 &&
            /23\.7 MB/.test(r17c[0].text) &&
            BAND.rahmenZielBefunde({ mb: 21, liste: [{ k: "buf:szene:bodenSatz", mb: 21, n: 6 }] }, null).length ===
                0 &&
            !u17.rot.some((x) => /r184-ausgabe/.test(x.text))
    );
    // S18 — ein gefallener VRAM-Erzeuger (der Abgriff sieht ihn nicht mehr) zieht seine Ratsche auf 0, ein lebender sinkt.
    const r18 = JSON.parse(JSON.stringify(rt));
    r18.vramMB = { "tex:depthBuffer": 7.9, "buf:szene": 50 };
    const n18 = BAND.ratscheNachziehen(r18, u17, { datum: "selbsttest", eingeschwungen: true });
    // S-K50 — DIE RENDER-ZIEL-KLASSE gegen ihren Haushalt: der Kopf 45f1eeae (Genesis third, 1080p, die Ziele der zeitlichen
    // Auflösung in voller Größe, das Szenen-Ziel in der Ausgabe) ist ROT mit jedem Erzeuger beim Namen; die Hochskalierung
    // (Szene 0,75, die Vortiefe im Kanal a der Geschichte) hält den Haushalt; ein Haushalt ohne die Klasse fällt im Schema.
    const rzKopf = [
        { k: "buf:szene:bodenSatz", mb: 37.1, n: 1078 },
        { k: "tex:TRAANode.history rgba16float 1920x1080x1", mb: 15.8, n: 1 },
    ];
    const rzSchatten = [
        { k: "tex:kaskade0:tiefe depth16unorm 2048x2048x1", mb: 8.0, n: 1 },
        { k: "tex:kaskade1:tiefe depth16unorm 2048x2048x1", mb: 8.0, n: 1 },
        { k: "tex:karte-albedo:atlas bc1-rgba-unorm-srgb 128x20", mb: 4.0, n: 1 },
    ];
    const rzVorher = v17([
        ...rzKopf,
        { k: "tex:TRAANode.history:tiefe depth16unorm 1920x1080x1", mb: 4.0, n: 1 },
        { k: "tex:TRAANode.resolve rgba16float 1920x1080x1", mb: 15.8, n: 1 },
        { k: "tex:output rg11b10ufloat 1920x1080x1", mb: 7.9, n: 1 },
        { k: "tex:depth depth24plus 1920x1080x1", mb: 7.9, n: 1 },
        { k: "tex:szene:tiefenabbild r32float 960x1080x1", mb: 4.0, n: 1 },
        ...rzSchatten,
    ]);
    const rzNachher = v17([
        ...rzKopf,
        { k: "tex:TRAANode.resolve rgba16float 1920x1080x1", mb: 15.8, n: 1 },
        { k: "tex:output rg11b10ufloat 1440x810x1", mb: 4.4, n: 1 },
        { k: "tex:depth depth24plus 1440x810x1", mb: 4.4, n: 1 },
        { k: "tex:szene:tiefenabbild r32float 720x810x1", mb: 2.2, n: 1 },
        ...rzSchatten,
    ]);
    const rzOhne = JSON.parse(JSON.stringify(haushalt));
    delete rzOhne.renderZiele;
    const rzRot = rzVorher.rot.find((x) => x.art === "renderziele");
    t(
        "Render-Ziele: der Kopf 45f1eeae (71.4 MB) ROT über dem Haushalt 60 MB, jeder Erzeuger beim Namen, Karten und Puffer nicht; die Hochskalierung (58.6 MB) hält; ohne Haushalt fällt das Schema",
        rzRot &&
            /Render-Ziele 71\.4 MB über ihrem Haushalt 60 MB/.test(rzRot.text) &&
            ["tex:TRAANode.history 19.8", "tex:TRAANode.resolve 15.8", "tex:output 7.9", "tex:depth 7.9", "tex:szene 4", "tex:kaskade0 8", "tex:kaskade1 8"].every((n) => rzRot.text.includes(n)) &&
            !/karte-albedo|buf:szene/.test(rzRot.text) &&
            rzVorher.urteil === "ROT" &&
            !rzNachher.rot.some((x) => x.art === "renderziele") &&
            rzNachher.vram.renderZiele.mb === 58.6 &&
            BAND.haushaltPruefen(rzOhne).fehler.some((f) => /renderZiele braucht/.test(f))
    );
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
    } catch {
        unbekannt = true;
    }
    t(
        "Messorte: Blick auf dem Spieler, doppelte id, ein Ort nennt eine Ratschen-Datei, dorfZug fehlt, Soll ohne Quelle " +
            "→ rot; der echte Haushalt nicht; ohne Wahl die Mess-Wiese, ein unbekannter Ort bricht",
        h20((o) => (o[1].blick = o[1].spieler.slice())).some((x) => /keine Richtung/.test(x)) &&
            h20((o) => (o[1].id = o[0].id)).some((x) => /doppelter id/.test(x)) &&
            h20((o) => (o[1].ratsche = "ratsche-genesis.json")).some((x) => /kein Ort nennt eine Datei/.test(x)) &&
            h20((o) => delete o[1].dorfZug).some((x) => /dorfZug/.test(x)) &&
            h20((o) => delete o[1].soll[0].quelle).some((x) => /Soll-Zeile/.test(x)) &&
            !BAND.messortePruefen(haushalt).length &&
            BAND.ortOf(haushalt).id === "wiese" &&
            unbekannt
    );
    // S21 — die Ratsche gehört dem Ort: dieselbe Klasse über der Genesis-Ratsche ist dort rot, gegen die (ungemessene)
    // Ratsche der Wiese nicht; die Gier des Orts blickt zum Blickpunkt (ein Blick nach −z = π, Genesis −x = −π/2).
    const gen = BAND.ladeSpec("genesis", { geraet: "radeon", sicht: "ego" });
    const r21 = JSON.parse(JSON.stringify(rt));
    r21.klassen.bau.haupt.befehle = 20;
    const bauGenesis = [{ klasse: "f:kathedrale:L0", stufe: 0, art: "gate", je: { haupt: 30 }, jeTris: { haupt: 9000 } }];
    const u21 = BAND.bandUrteil({ zensus: { klassen: bauGenesis }, haushalt, ratsche: r21, ort: gen.ort });
    const u21b = BAND.bandUrteil({ zensus: { klassen: bauGenesis }, haushalt, ratsche: rt, ort: BAND.ortOf(haushalt) });
    t(
        "bau 30 Befehle über der Genesis-Ratsche 20 → rot (Ort genesis im Urteil), gegen die ungemessene nicht; Gier wiese π, genesis −π/2",
        hatRot(u21, "ratsche") &&
            u21.ort === "genesis" &&
            !hatRot(u21b, "ratsche") &&
            u21b.ort === "wiese" &&
            Math.abs(Math.abs(BAND.ortGier({ spieler: [-278, -1038], blick: [-278, -1048] })) - Math.PI) < 1e-12 &&
            Math.abs(BAND.ortGier(gen.ort) + Math.PI / 2) < 1e-12 &&
            !BAND.ratschePruefen(gen.ratsche, haushalt).length
    );
    // S22 — die Tor-Hülle des Orts (Soll-Zeile): 2 Tore an zwei Orten (zwei Gestalten: 2 × 26 Stoff-Züge), 368 000 Dreiecke
    // im Hauptbild → 184 000 je Tor (3,07× das Band 60 000); eine Klasse anderer Art oder Stufe zählt nicht, ein Zensus ohne
    // Exemplar-Zahl (vor S1) trägt keine Soll-Zeile.
    const s22 = BAND.ortSoll(gen.ort, {
        klassen: [
            { klasse: "f:drachentor:L0", stufe: 0, art: "gate", je: { haupt: 52 }, jeTris: { haupt: 368000 }, inst: 52, exemplare: 2 },
            { klasse: "f:drachentor:L1", stufe: 1, art: "gate", je: { haupt: 26 }, jeTris: { haupt: 9e5 }, inst: 26, exemplare: 1 },
            { klasse: "f:gt:L0", stufe: 0, art: "vehicle", je: { haupt: 12 }, jeTris: { haupt: 3e4 }, inst: 12, exemplare: 1 },
            { klasse: "f:ruine:L0", stufe: 0, art: "gate", je: { haupt: 7 }, jeTris: { haupt: 85652 }, inst: 7 },
        ],
    });
    t(
        "Tor-Hülle: f:drachentor:L0 368 000 im Hauptbild bei 2 Toren → 184 000 je Tor (3,07×), L1 und Fahrzeug nicht",
        s22.length === 1 && s22[0].huelle === 184000 && s22[0].exemplare === 2 && s22[0].faktor === 3.07
    );
    // S20b — DIE WIESE: das Wiesen-Gesetz fehlt der Mess-Wiese, eine Schwelle fehlt, der Kranz beginnt im Ring → rot (Schema);
    // am Gesetz ist der gefallene Messort ein Hang (Hang, Horizont, Blick rot), der Ort des Haushalts eine Wiese.
    const w20 = (f) => {
        const h = JSON.parse(JSON.stringify(haushalt));
        f(h.messorte.find((o) => o.id === "wiese"));
        return h;
    };
    const wGefallen = wieseAmGesetz(
        w20((o) => {
            // BÜHNE: der gefallene Messort — die Linse muss ihn ROT nennen
            o.spieler = [-900, -850];
            o.blick = [o.spieler[0], o.spieler[1] + 10];
        })
    ).befunde;
    t(
        "Wiese: ohne Gesetz, ohne hangMax, Kranz im Ring → rot; am Gesetz der gefallene Ort rot (Hang, Horizont), der Haushalt grün",
        BAND.messortePruefen(w20((o) => delete o.wiese)).some((x) => /Wiesen-Gesetz \(wiese\) fehlt/.test(x)) &&
            BAND.messortePruefen(w20((o) => delete o.wiese.hangMax)).some((x) => /wiese ohne Zahl hangMax/.test(x)) &&
            BAND.messortePruefen(w20((o) => (o.wiese.rand = [10, 90]))).some((x) => /beginnt im Ring/.test(x)) &&
            wGefallen.some((x) => /Hang [\d.]+° über/.test(x)) &&
            wGefallen.some((x) => /kein Fernblick/.test(x)) &&
            !wieseAmGesetz(haushalt).befunde.length
    );
    // S23 — ein Anker ohne Methoden-Namen bricht das Schema; der echte Anker ist einer.
    const h23c = JSON.parse(JSON.stringify(haushalt));
    h23c.messorte[1].anker = "36 0";
    t(
        "Messorte: ein Anker ohne Methoden-Namen bricht das Schema, der echte ist _genesisMitte",
        BAND.messortePruefen(h23c).some((x) => /anker ist kein Methoden-Name/.test(x)) && haushalt.messorte[1].anker === "_genesisMitte"
    );

    // S24 — die Orts-Wache: ein Lauf zählt für die Ratsche eines Orts nur, wenn er in dessen Zustand stand (Aufstellung,
    // Dorf-Zug, Ort-Takt, Gier, Sicht). Der gestellte Zustand ist sauber; laufender Dorf-Zug, eine Aufstellung ohne `--ort`, ein
    // anderer Blick, ein fehlender Ort-Takt, eine andere oder keine Sicht und ein Lauf ohne Aufzeichnung werden je einzeln
    // beim Namen genannt.
    const wiese = BAND.ortOf(haushalt, "wiese");
    const gestellt = { ort: "wiese", dorfZug: false, ortTakt: [], gier: BAND.ortGier(wiese), sicht: "ego" };
    const g24 = (o, z) => BAND.ortGestellt(o, Object.assign({}, gestellt, z));
    t(
        "Orts-Wache: gestellt sauber; Dorf-Zug läuft, ohne --ort, Gier −0,88, Genesis ohne Ort-Takt, Third-Person statt Ego, " +
            "ohne Sicht, ohne Aufzeichnung → je rot",
        !BAND.ortGestellt(wiese, gestellt, "ego").length &&
            !BAND.ortGestellt(gen.ort, { ort: "genesis", dorfZug: false, ortTakt: gen.ort.ortTakt, gier: -Math.PI / 2, sicht: "third" }, "third").length &&
            g24(wiese, { sicht: "third" }).length === 0 &&
            /Sicht third, verlangt ego/.test(BAND.ortGestellt(wiese, Object.assign({}, gestellt, { sicht: "third" }), "ego")[0]) &&
            /keine Sicht aufgezeichnet/.test(g24(wiese, { sicht: undefined })[0]) &&
            g24(wiese, { dorfZug: true }).length === 1 &&
            /Dorf-Zug/.test(g24(wiese, { dorfZug: true })[0]) &&
            g24(wiese, { ort: null }).length === 1 &&
            g24(wiese, { gier: -0.88 }).length === 1 &&
            /Gier/.test(g24(wiese, { gier: -0.88 })[0]) &&
            BAND.ortGestellt(gen.ort, { ort: "genesis", dorfZug: false, ortTakt: [], gier: -Math.PI / 2, sicht: "ego" }).length === 1 &&
            BAND.ortGestellt(wiese, undefined).length === 1
    );

    // S25 — die Projektion (P): die Ist-Projektion von V18.536 (Golden-Dreiecke des Zensus `vorher`) liegt über dem
    // Haushalt baum und wird rot; dieselbe Wiese mit dem Soll je Instanz (L0 7 000 · L1 2 300 · Wurf 1 000) bleibt
    // grün; eine Zensus-Zeile ohne Golden-Dreiecke wird beim Namen genannt.
    const zs = JSON.parse(fs.readFileSync(ZENSUS, "utf8"));
    const ist = projektionsWand(haushalt, zs, zs.vorher);
    const sollT = { haupt: {}, wurf: {} };
    for (const z of zs.zeilen) {
        sollT.haupt[z.art + "|0"] = 7000;
        sollT.haupt[z.art + "|1"] = 2300;
        sollT.wurf[z.art] = 1000;
    }
    const soll = projektionsWand(haushalt, zs, sollT);
    const luecke = projektionsWand(haushalt, zs, { haupt: {}, wurf: sollT.wurf });
    t(
        `Projektion: die Ist-Wiese V18.536 (${Math.round(ist.p.summe)} Dreiecke) ist rot, das Soll je Instanz (${Math.round(soll.p.summe)}) grün, eine Zeile ohne Golden-Dreiecke beim Namen`,
        ist.errs.length === 1 &&
            /projiziert/.test(ist.errs[0]) &&
            ist.p.summe > 400000 &&
            soll.errs.length === 0 &&
            luecke.errs.some((x) => /ohne Golden-Dreiecke/.test(x))
    );

    // S26 — DER SATZ-INHALT (S3 haus, 1b): ein Satz zeichnet je Pass EINEN Befehl — die Ratschen-Zeile nennt, wer darin
    // liegt („bauSatz k0: f:feuerstelle:L1 29 Zellen = 12 760"), die Tabelle druckt den Inhalt je Pass.
    const r26 = JSON.parse(JSON.stringify(rt));
    r26.klassen.bau.k0 = { befehle: 1, dreiecke: 4224 };
    const satz26 = {
        klasse: "bauSatz",
        stufe: null,
        art: null,
        je: { haupt: 1, k0: 1 },
        jeTris: { haupt: 18445, k0: 12760 },
        inhalt: {
            k0: [{ klasse: "f:feuerstelle:L1", stufe: 1, art: "ausstattung", zellen: 29, tris: 12760, eintraege: [] }],
        },
    };
    const u26 = urteil([satz26], r26);
    const zeile26 = u26.rot.find((x) => x.art === "ratsche" && /^bau k0/.test(x.text));
    t(
        "Satz-Inhalt: bauSatz k0 über der Ratsche nennt „bauSatz k0: f:feuerstelle:L1 29 Zellen = 12 760\", die Tabelle den Inhalt",
        !!zeile26 &&
            /bauSatz k0: f:feuerstelle:L1 29 Zellen = 12 760/.test(zeile26.text) &&
            /bauSatz k0: f:feuerstelle:L1 29 Zellen = 12 760/.test(BAND.bandTabelle(u26))
    );
    // S26b — der Satz-Inhalt am Satz selbst (draw-zaehler `satzInhalt`, die Seiten-Funktion): ein in k0 gepflanzter Bereich
    // (die Gruppe einer Feuerstelle, 3 Instanzen = 3 Zellen à 440 Dreiecke, ihre Einträge 7/8/9) erscheint mit Klasse,
    // Zellen, Dreiecken und Exemplaren; die Lücke des Laufs steht als `lücke`, ohne Rest; das Hauptbild ohne den Bereich
    // nennt ihn nicht, ein falscher Draw-Umfang erscheint als REST.
    const key26 = "f:feuerstelle|1|1:0";
    const b26 = { key: key26, zellen: [] };
    for (let i = 0; i < 3; i++) b26.zellen.push({ bereich: b26, idx: new Uint32Array(1320) });
    const satz26b = {
        abschnitte: new Map([
            ["k0", { liste: b26.zellen.slice(), n: 3960, ende: 3960 + 30 }],
            ["haupt", { liste: [], n: 0, ende: 0 }],
        ]),
    };
    const ein26 = new Map([[key26, new Map([[0, 7], [1, 8], [2, 9]])]]);
    const i26 = DZ.satzInhalt(satz26b, "k0", (3960 + 30) / 3, S.instanz, ein26);
    const f26 = i26.get("f:feuerstelle:L1");
    t(
        "Satz-Inhalt: ein gepflanzter Bereich erscheint (f:feuerstelle:L1 3 Zellen = 1 320, Einträge 7/8/9, Lücke 10, kein Rest), " +
            "das Hauptbild ohne ihn nicht, ein falscher Draw-Umfang als REST",
        !!f26 &&
            f26.zellen === 3 &&
            f26.tris === 1320 &&
            [...f26.eintraege].join(",") === "7,8,9" &&
            i26.get("lücke").tris === 10 &&
            !i26.has("REST") &&
            DZ.satzInhalt(satz26b, "haupt", 0, S.instanz, ein26).size === 0 &&
            DZ.satzInhalt(satz26b, "k0", 1500, S.instanz, ein26).get("REST").tris === 170
    );
    // S27 — DER WURF JE EXEMPLAR (Soll-Zeile mit `stufen`, Messort dorf): zwei Häuser werfen in k0 ihre L0 (140 000) und
    // eine L1 (15 000) über den Satz-Inhalt → 77 500 je Haus (807×); eine Art daneben zählt nicht; `stufe` UND `stufen`
    // zugleich (oder keins) bricht das Schema. Ein Pass ohne Exemplar trägt keine Zeile.
    const dorf = BAND.ortOf(haushalt, "dorf");
    const satz27 = {
        klasse: "bauSatz",
        stufe: null,
        art: null,
        je: { k0: 1 },
        jeTris: { k0: 155000 + 12760 },
        inhalt: {
            k0: [
                { klasse: "f:alemannisch:L0", stufe: 0, art: "haus", zellen: 6, tris: 140000, eintraege: [11, 12] },
                { klasse: "f:griechisch:L1", stufe: 1, art: "haus", zellen: 3, tris: 15000, eintraege: [12] },
                { klasse: "f:feuerstelle:L1", stufe: 1, art: "ausstattung", zellen: 29, tris: 12760, eintraege: [1, 2] },
            ],
        },
    };
    const s27 = BAND.ortSoll(dorf, { klassen: [satz27] });
    const haus27 = s27.find((x) => x.name === "Haus-Wurf" && /k0/.test(x.klasse));
    const h27 = (f) => {
        const h = JSON.parse(JSON.stringify(haushalt));
        f(h.messorte.find((o) => o.id === "dorf").soll[0]);
        return BAND.messortePruefen(h);
    };
    t(
        "Wurf je Exemplar: Haus-Wurf k0 = 155 000 / 2 Häuser = 77 500 (807×, Täter f:alemannisch:L0), die Feuerstelle nicht im " +
            "Haus-Wurf; stufe + stufen bzw. keins bricht das Schema; ohne k1 keine k1-Zeile",
        !!haus27 &&
            haus27.huelle === 77500 &&
            haus27.exemplare === 2 &&
            haus27.faktor === 807.29 &&
            /f:alemannisch:L0/.test(haus27.taeter) &&
            !s27.some((x) => /k1/.test(x.klasse)) &&
            s27.some((x) => x.name === "Ausstattungs-Wurf" && x.huelle === 6380) &&
            h27((s) => (s.stufe = 0)).some((x) => /Soll-Zeile/.test(x)) &&
            h27((s) => delete s.stufen).some((x) => /Soll-Zeile/.test(x)) &&
            !BAND.messortePruefen(haushalt).length
    );
    // S28 — DAS EINSCHWINGEN WARTET AUF DEN DORF-ZUG (Messort dorf: der Zug läuft): ein Export unterwegs und eine wachsende
    // Siedlung halten die Welt offen, eine ruhige Welt meldet nichts. Und auf den SATZ, DER NOCH SCHRUMPFT (1310-1): ein Satz
    // über seinem Ziel (`ueberSeit` ≥ 0) hält offen, ein ruhender (-1) nicht.
    const welt28 = (z) =>
        Object.assign(
            {
                state: { voxelMeshPending: new Set(), scatterRegions: new Map() },
                _foundry: { warte: [], pending: new Map() },
                _impostorBakeQueue: [],
                _autoSettlementQueue: null,
                _autoSettlementPendingKey: null,
                _streuWartet: () => false,
            },
            z
        );
    const o28 = BAND.einschwingOffen(welt28({ _autoSettlementQueue: { plan: { slots: [1, 2, 3] }, idx: 1 } }));
    t(
        "Einschwingen: eine wachsende Siedlung (1/3), ein Export unterwegs und zwei Lieferungen vor dem Ingest-Takt halten offen, die ruhige Welt nicht",
        o28.dorfWaechst === "1/3" &&
            BAND.einschwingOffen(welt28({ _autoSettlementPendingKey: "-4,-4" })).dorfExport === "-4,-4" &&
            BAND.einschwingOffen(welt28({ _foundryIngestQueue: [1, 2] })).foundryIngest === 2 &&
            Object.keys(BAND.einschwingOffen(welt28({}))).length === 0 &&
            /window\.__einschwingOffen = function einschwingOffen/.test(BAND.EINSCHWING_INSTALL)
    );
    {
        const satzWelt = (ueber) =>
            welt28({
                state: {
                    voxelMeshPending: new Set(),
                    scatterRegions: new Map(),
                    chunkSaetze: new Map([
                        ["boden", { ueberSeit: -1 }],
                        ["bauSatz|x|-", { ueberSeit: ueber }],
                    ]),
                },
            });
        t(
            "Einschwingen: ein Satz über seinem Ziel (ueberSeit ≥ 0) hält offen, ein ruhender nicht",
            BAND.einschwingOffen(satzWelt(12)).satzSchrumpft === 1 &&
                Object.keys(BAND.einschwingOffen(satzWelt(-1))).length === 0
        );
    }
    // S29 — die Zeile nahWiese: der Zensus der Mess-Wiese liegt unter der Ratsche; die doppelte Wiese (jede Zeile mit
    // doppelt so vielen Büscheln) liegt darüber und wird rot — unabhängig von den Golden-Dreiecken (seit K56 trägt kein
    // Same mehr die Last, die das alte Maximum über die Samen über die Ratsche hob); eine Gestalt ohne Golden und eine
    // Ratsche ohne Wert werden beim Namen genannt (ein fehlender Wert ist nie 0).
    const nwB = zs.nahWiese;
    const nwT = gestaltDreiecke(nwB.art, nwB.zeilen);
    const rtW = BAND.ladeSpec(zs.ort, { geraet: zs.geraet, sicht: zs.sicht }).ratsche;
    const nwEcht = gestaltWand(haushalt, rtW, nwB, zs.ort, nwT);
    const nwMax = gestaltWand(
        haushalt,
        rtW,
        Object.assign({}, nwB, { zeilen: nwB.zeilen.map((z) => Object.assign({}, z, { inst: z.inst * 2 })) }),
        zs.ort,
        nwT
    );
    const nwFremd = gestaltWand(
        haushalt,
        rtW,
        Object.assign({}, nwB, { zeilen: nwB.zeilen.concat([{ gestalt: 99, stufe: 1, pass: "haupt", inst: 1 }]) }),
        zs.ort,
        nwT
    );
    const rtLeer = JSON.parse(JSON.stringify(rtW));
    rtLeer.klassen[nwB.klasse].haupt.dreiecke = null;
    const nwOhne = gestaltWand(haushalt, rtLeer, nwB, zs.ort, nwT);
    t(
        `Projektion nahWiese: die Mess-Wiese (${nwEcht.summe} Dreiecke) liegt unter der Ratsche ${nwEcht.soll}, die doppelte Wiese (${nwMax.summe}) wird rot, eine Gestalt ohne Golden und eine Ratsche ohne Wert beim Namen`,
        nwEcht.errs.length === 0 &&
            nwMax.errs.some((x) => /> Ratsche/.test(x)) &&
            nwFremd.errs.some((x) => /Gestalt 99 L1 ohne Golden-Dreiecke/.test(x)) &&
            nwOhne.errs.some((x) => /keine Dreiecke/.test(x))
    );

    // S30 — DIE ZEICHEN-REIHE (H7) an der echten Klasse: der Stamm hält sie; mit @wahl im ersten Rang, ohne die Reihe, ohne
    // die Folge der losen Opaken im Renderer, mit dem Boden vor dem Bau, verkehrt, ohne die Reihe im Bündel, ohne den Abstand
    // und mit einem Anker, der jeden Frame stellt, wird die Wand rot (je der veränderte Stamm als Klasse geladen).
    {
        const st = stammLib.text(root);
        const fall = [
            ["@wahl vorn", "_zeichenRang", 'u.regionKey === "@global" ? 0 : u.regionKey === "@wahl" ? 2 : 1', 'u.regionKey === "@wahl" ? 0 : u.regionKey === "@global" ? 2 : 1', /Reihe der Bündel nach der Ankunft/],
            ["ohne Reihe", null, /(\n {4}_buendelReihe)\(/, "$1Alt(", /hängt an der Ankunft/],
            ["ohne Folge", "_configureRenderer", "else renderer.setOpaqueSort(AnazhRealm._zeichenFolge);", "", /setOpaqueSort/],
            ["Boden vorn", "_zeichenRang", 'return s === "boden" ? 4 :', 'return s === "boden" ? 2 :', /losen Opaken nach der Ankunft/],
            ["verkehrt", "_buendelKinderReihe", "rang(a) - rang(b) ||", "rang(b) - rang(a) ||", /Reihe im Bündel nach der Ankunft/],
            ["ohne Reihe im Bündel", null, /(\n {4}static _buendelKinderReihe)\(/, "$1Alt(", /in der Ankunft/],
            ["ohne Abstand", "_buendelKinderReihe", "(auge ? nah.get(a) - nah.get(b) : 0) ||", "0 ||", /Reihe nach Abstand/],
            ["je Frame", "_buendelAnkerPruefen", "if (a && (pos.x - a.x) * (pos.x - a.x) + (pos.z - a.z) * (pos.z - a.z) <= R * R) return false;", "", /Anker der Reihe/],
        ];
        const still = fall.filter(([, glied, alt, neu, re]) => !buendelReiheWand(klasseVon(stammLib.ersetze(st, glied, alt, neu))).errs.some((x) => re.test(x)));
        t(
            "Zeichen-Reihe: @global · Regionen · @wahl, lose Bau · Boden · Fern · Himmel, im Bündel L0 zuerst und vorn zuerst; " +
                fall.map(([n]) => n).join(", ") +
                " rot" +
                (still.length ? " — still: " + still.map(([n]) => n).join(", ") : ""),
            buendelReiheWand(A).errs.length === 0 && !still.length
        );
    }

    // S31 — H2b DIE FRISCHE an der Gegenprobe 1110-12 (spec/profiband/probe-1110-12.json): die Ratsche der Mess-Wiese,
    // wie sie w2B auf der GTX richtete (ohne Version), ist ROT — ohne Version, mit fremder
    // Messung, mit einer Gesamt-Zeile über der Summe der Klassen und gegen w2B zu weit (baum haupt 385 630 gegen 60 976).
    {
        const probe = JSON.parse(fs.readFileSync(path.join(root, "spec", "profiband", "probe-1110-12.json"), "utf8"));
        const w2B = probe.boots.w2B.schritte.find((x) => x.name === "band").ergebnis.messung;
        const slot = (r, z) => Object.assign({ ort: "wiese", geraet: "gtx", sicht: "ego", datei: "probe", ratsche: r }, z);
        const alt31 = BAND.ratscheFrische({
            haushalt,
            version: "18.543.0",
            ratschen: [slot(probe.ratscheWiese)],
            messungen: [{ quelle: "w2B", ort: "wiese", geraet: "gtx", sicht: "ego", u: w2B }],
        });
        // eine frische Ratsche: die Hülle von w2B selbst, an V18.542 (eine Version vor dem Kopf), am eigenen Platz
        const frisch = BAND.ratscheNachziehen(BAND.ratscheNeu(probe.ratscheWiese), w2B, {
            datum: "selbsttest",
            version: "18.542.0",
            ort: "wiese",
            geraet: "gtx",
            sicht: "ego",
            eingeschwungen: true,
        }).ratsche;
        const fr = (r, v, m) =>
            BAND.ratscheFrische({ haushalt, version: v || "18.543.0", ratschen: [slot(r)], messungen: m || [] });
        const alt2 = JSON.parse(JSON.stringify(frisch));
        alt2.gemessen.version = "18.541.0";
        const fremd = JSON.parse(JSON.stringify(frisch));
        fremd.gemessen.geraet = "radeon";
        const ungemessen = JSON.parse(JSON.stringify(frisch));
        ungemessen.gemessen = null;
        t(
            "H2b: die Ratsche der Mess-Wiese, wie sie 1110-12 richtete, ist ROT — ohne Version, fremde Messung, Gesamt-Zeile " +
                "4 095 487 über 1 295 324, baum haupt 385 630 gegen 60 976 zu weit; die Hülle von w2B an V18.542 grün, an V18.541 " +
                "alt, mit fremdem Gerät, ungemessen und fehlend rot; eine Messung ohne geforderte Ratsche rot",
            alt31.some((x) => /ohne Version — älter als jede Version/.test(x)) &&
                alt31.some((x) => /trägt die Messung \? × Radeon 890M/.test(x)) &&
                alt31.some((x) => /Gesamt-Zeile dreiecke 4095487 liegt über der Summe der Klassen 1295324 — sie feuert nie/.test(x)) &&
                alt31.some((x) => /baum haupt dreiecke: Ratsche 385630 über der Messung 60976 — zu weit \(w2B\)/.test(x)) &&
                fr(frisch, "18.543.0", [{ quelle: "w2B", ort: "wiese", geraet: "gtx", sicht: "ego", u: w2B }]).length === 0 &&
                fr(alt2).some((x) => /gemessen an V18\.541\.0, der Kopf ist V18\.543\.0 — älter als eine Version/.test(x)) &&
                fr(fremd).some((x) => /trägt die Messung wiese × radeon × ego/.test(x)) &&
                fr(ungemessen).some((x) => /ungemessen/.test(x)) &&
                fr(null).some((x) => /fehlt — ungemessen/.test(x)) &&
                fr(frisch, "18.543.0", [{ quelle: "x", ort: "wiese", geraet: "gtx", sicht: "third", u: w2B }]).some((x) =>
                    /keine geforderte Ratsche richtet wiese × gtx × third/.test(x)
                )
        );
        // Der Re-Mint hebt, der Nachzug nie; das Band-Urteil ohne gemessene Ratsche nennt sie `ungemessen`, eine zu weite
        // Ratsche `weit` — beide sperren den Nachzug nicht (die Linse bleibt sauber), der Leser der Messfolge liest sie.
        const r31 = JSON.parse(JSON.stringify(rt));
        r31.gemessen = { datum: "selbsttest", eingeschwungen: true };
        r31.klassen.boden.haupt = { befehle: 7, dreiecke: 70000 };
        const boden9 = [{ klasse: "bodenSatz", stufe: 0, art: null, je: { haupt: 10 }, jeTris: { haupt: 7000 } }];
        const u31 = BAND.bandUrteil({ zensus: { klassen: boden9 }, haushalt, ratsche: r31 });
        const nach31 = BAND.ratscheNachziehen(r31, u31, { datum: "x" }).ratsche;
        const neu31 = BAND.ratscheNachziehen(BAND.ratscheNeu(r31), u31, { datum: "x" }).ratsche;
        const ohne31 = BAND.bandUrteil({ zensus: { klassen: boden9 }, haushalt, ratsche: null, ratscheDatei: "ratsche-wiese-gtx-third.json" });
        t(
            "Re-Mint: boden haupt 7 → 10 Befehle (der Nachzug hält 7), 70 000 → 7 000 Dreiecke; 70 000 gegen 7 000 ist weit, die " +
                "Linse bleibt sauber; ohne Ratsche „ungemessen\" beim Datei-Namen; jede Rot-Zeile trägt ihren Schlüssel",
            nach31.klassen.boden.haupt.befehle === 7 &&
                neu31.klassen.boden.haupt.befehle === 10 &&
                neu31.klassen.boden.haupt.dreiecke === 7000 &&
                neu31.klassen.baum.haupt.befehle === 0 &&
                u31.rot.some((x) => x.art === "weit" && x.schluessel === "weit:boden:haupt:dreiecke") &&
                u31.rot.some((x) => x.art === "ratsche" && x.schluessel === "ratsche:boden:haupt:befehle" && x.ist === 10) &&
                u31.linse === "ROT" &&
                ohne31.rot.some((x) => x.art === "ungemessen" && /ratsche-wiese-gtx-third\.json/.test(x.text)) &&
                ohne31.linse === "SAUBER" &&
                u31.rot.every((x) => typeof x.schluessel === "string")
        );
        // Die Gesamt-Zeile des Mints ist höchstens die Summe ihrer Zeilen: zwei Läufe, je Erzeuger ein anderes Minimum (6,0 + 4,0
        // und 5,9 + 4,1, beide 10,0 MB) — die Hülle der Erzeuger ist 5,9 + 4,0 = 9,9, die Gesamt-Zeile zieht mit.
        const v32 = (a, b) => ({
            klassen: [],
            summe: { gebunden: { befehle: 1, dreiecke: 1 } },
            vram: { gebunden: 10, mb: 10, erzeuger: [{ erzeuger: "buf:szene", mb: a }, { erzeuger: "tex:output", mb: b }] },
        });
        const n32a = BAND.ratscheNachziehen(BAND.ratscheNeu(rt), v32(6, 4), { datum: "x" });
        const n32 = BAND.ratscheNachziehen(n32a.ratsche, v32(5.9, 4.1), { datum: "x" });
        t(
            "Re-Mint: die Gesamt-Zeile vramMB ist höchstens die Summe der Erzeuger (zwei Läufe 6,0 + 4,0 und 5,9 + 4,1 → " +
                "Erzeuger 5,9 + 4,0, Gesamt 10,0 → 9,9, beim Namen)",
            n32a.ratsche.gesamt.vramMB === 10 &&
                n32.ratsche.vramMB["buf:szene"] === 5.9 &&
                n32.ratsche.vramMB["tex:output"] === 4 &&
                n32.ratsche.gesamt.vramMB === 9.9 &&
                n32.aenderungen.some((x) => /gesamt\.vramMB: 10 → 9\.9 \(die Summe ihrer Zeilen/.test(x))
        );
        // Gerät und Sicht: der Adapter-Text der Radeon und der GTX, ein Software-Raster ohne Schlüssel; der Kamera-Modus des
        // Stamms; der alte Haushalt (EIN Gerät) und eine fremde Kamera brechen das Schema.
        const hAlt = JSON.parse(JSON.stringify(haushalt));
        hAlt.geraet = "Radeon 890M";
        const hKam = JSON.parse(JSON.stringify(haushalt));
        hKam.sichten.third.kamera = "drohne";
        t(
            "Gerät × Sicht: amd rdna-3 → radeon, nvidia pascal → gtx, SwiftShader → keins; first → ego, third → third; " +
                "geraet (EIN Gerät) und eine Kamera „drohne\" brechen den Haushalt",
            BAND.geraetSchluessel(haushalt, "amd rdna-3 AMD Radeon 890M Graphics") === "radeon" &&
                BAND.geraetSchluessel(haushalt, "nvidia pascal") === "gtx" &&
                BAND.geraetSchluessel(haushalt, "google swiftshader") === null &&
                BAND.sichtSchluessel(haushalt, "first") === "ego" &&
                BAND.sichtSchluessel(haushalt, "third") === "third" &&
                BAND.haushaltPruefen(hAlt).fehler.some((x) => /geraet \(EIN Gerät für jede Ratsche\) ist abgelöst/.test(x)) &&
                BAND.haushaltPruefen(hKam).fehler.some((x) => /sichten\.third: titel und kamera/.test(x)) &&
                BAND.ratschenAlle(haushalt).length === 12
        );
    }
    // DER GANG (K5, `werkbank puffer --gang`): ein ungedeckelter Cache ist rot beim Pfad, ein gedeckelter nicht
    t("Gang: Heap je Minute und VRAM-Drift urteilen, der Halter steht beim Pfad", DZ.gangSelbsttest().length === 0);

    const rot = tests.filter((x) => !x.ok);
    for (const x of tests) console.log(`${x.ok ? "✅" : "❌"} SELBST-TEST: ${x.name}`);
    selbsttestEnde(rot.map((x) => x.name), `die Band-Wand feuert (${tests.length}/${tests.length})`);
}

function main() {
    if (process.argv.includes("--selftest")) return selbsttest();
    const { haushalt } = BAND.ladeSpec();
    const errs = [];
    const h = BAND.haushaltPruefen(haushalt);
    for (const f of h.fehler) errs.push("H1 " + f);
    const wiese = wieseAmGesetz(haushalt);
    for (const f of wiese.befunde) errs.push("H1 " + f);
    // H2 je Ort × Gerät × Sicht: jede Ratsche trägt das Schema (ein Toggle-Ort mit `bank` trägt keine — H1 prüft sein Schema).
    const ratschen = BAND.ratschenAlle(haushalt);
    for (const e of ratschen.filter((x) => x.ratsche))
        for (const f of BAND.ratschePruefen(e.ratsche, haushalt)) errs.push(`H2 [${e.datei}] ${f}`);
    // H2b DIE FRISCHE: gemessen, höchstens eine Version alt, am eigenen Ort × Gerät × Sicht, die Gesamt-Zeile feuert, und
    // gegen jede gegebene Messung (`--messung`) keine Zeile zu weit.
    const version = JSON.parse(fs.readFileSync(path.join(root, "package.json"), "utf8")).version;
    const messungen = [];
    const mi = process.argv.indexOf("--messung");
    for (const d of mi >= 0 ? process.argv.slice(mi + 1).filter((x) => /\.json$/i.test(x)) : []) {
        const j = JSON.parse(fs.readFileSync(path.resolve(d), "utf8"));
        const e = Array.isArray(j.schritte) ? j.schritte.find((x) => x.name === "band") : null;
        const u = e ? (e.ergebnis && e.ergebnis.messung) || null : j;
        const geraet = u && u.geraet ? u.geraet.schluessel : null;
        if (!u || !u.ort || !geraet || !u.sicht)
            errs.push(`H2b ${path.basename(d)}: keine Band-Messung mit Ort, Gerät und Sicht — sie richtet keine Ratsche`);
        else messungen.push({ quelle: path.basename(d), ort: u.ort, geraet, sicht: u.sicht, u });
    }
    for (const f of BAND.ratscheFrische({ haushalt, version, ratschen, messungen })) errs.push("H2b " + f);
    const A = klasseVon();
    const tw = taeterWand(A);
    for (const f of tw.errs) errs.push("H4 " + f);
    const br = buendelReiheWand(A);
    for (const f of br.errs) errs.push("H7 " + f);
    // P — die Projektion der Studio-Ausgänge an der Mess-Wiese (Pflicht ab dem Vertrags-Akt).
    const zs = JSON.parse(fs.readFileSync(ZENSUS, "utf8"));
    const pw = projektionsWand(haushalt, zs, goldenDreiecke(new Set(zs.zeilen.map((z) => z.art))));
    const pflicht = projektionPflicht();
    if (pflicht) for (const f of pw.errs) errs.push(f);
    console.log(
        `P Projektion ${zs.ort}/${zs.klasse}: ${Math.round(pw.p.summe)} Dreiecke (Haushalt ${pw.soll}; ` +
            Object.entries(pw.p.jePass)
                .map(([p, d]) => `${p} ${Math.round(d)}`)
                .join(" · ") +
            `)` +
            (pflicht ? "" : pw.errs.length ? ` — noch keine Pflicht (render-config ohne tree[0].lagen): ${pw.errs.join("; ")}` : "")
    );
    // Die Zeile nahWiese (Pflicht seit der Integration V18.538: Gras-Zeile und Gestalten der Nah-Wiese stehen im Kern).
    const nwB = zs.nahWiese;
    if (!nwB || !Array.isArray(nwB.zeilen) || !nwB.zeilen.length)
        errs.push(`P: der Zensus ${zs.ort} trägt keine Zeile nahWiese (je Gestalt × Stufe die gelegten Büschel)`);
    else {
        const nw = gestaltWand(
            haushalt,
            BAND.ladeSpec(zs.ort, { geraet: zs.geraet, sicht: zs.sicht }).ratsche,
            nwB,
            `${zs.ort} × ${zs.geraet} × ${zs.sicht}`,
            gestaltDreiecke(nwB.art, nwB.zeilen)
        );
        for (const f of nw.errs) errs.push(f);
        console.log(
            `P Projektion ${zs.ort}/${nwB.klasse}: ${nw.summe} Dreiecke (Ratsche ${nw.soll}, Haushalt ${nw.haushalt}; ` +
                Object.entries(nw.jeStufe)
                    .map(([s, d]) => `${s} ${d}`)
                    .join(" · ") +
                `)`
        );
    }
    if (errs.length) {
        console.log("⛔ DIE BAND-WAND:");
        for (const e of errs) console.log("   ❌ " + e);
        // H2b heilt nur eine Serie der echten GPU je Ort × Gerät × Sicht (vier Boots, Erst- und Zweit-Boot) und ihr Re-Mint
        if (errs.some((e) => /^H2b /.test(e)))
            console.log(
                "   → der Re-Mint je Ort × Gerät × Sicht: 4 × `node scripts/omen-messfolge.cjs --ort <ort> --sicht <sicht> --serie <s> " +
                    "--datei <boot>.json` (Erst- und Zweit-Boot), dann `node scripts/werkbank.cjs ratsche <boot>.json … --neu`"
            );
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
    const ortZeile = ratschen
        .map((e) => {
            const x = gemessenAn(e.ratsche);
            return `${e.ort} × ${e.geraet} × ${e.sicht} (V${e.ratsche.gemessen.version}, gemessen ${x.g} von ${x.f})`;
        })
        .join(" · ");
    console.log(
        `✅ DIE BAND-WAND steht — H1 Haushalt ${h.summe.befehle}/${haushalt.band.befehle} Befehle · ` +
            `${h.summe.dreiecke}/${haushalt.band.dreiecke} Dreiecke in ${haushalt.klassen.length} Klassen (keine Sammelzeile) · ` +
            `H2 Ratsche ${haushalt.klassen.length} Klassen × ${paesse.length} Pässe je Ort × Gerät × Sicht · ` +
            `H2b ${ratschen.length} Ratschen frisch an V${version}${messungen.length ? ` gegen ${messungen.length} Messungen` : ""} · ` +
            `H4 Täter-Klasse des Stamms: ${tw.n} Schlüssel-Formen · ` +
            `Messorte ${ortZeile} · H1 Wiese am Gesetz ${wiese.messungen.map((m) => `${m.ort} ${m.x}/${m.z} Hang ${m.hang}° · Krone ${m.krone} · Kranz ${m.kranz} · Horizont ${m.horizont}°`).join("; ")} · H7 die Zeichen-Reihe (Bündel @global · Regionen · @wahl, lose Bau · Boden · Fern · Himmel) und die Reihe im Bündel (Stufe).`
    );
}

main();
