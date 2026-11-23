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
//       (`_buendelReihe`) @global · Regionen, die losen Opaken jedes Renders (`_configureRenderer` setzt
//       `_zeichenFolge`) Bau · Boden · Fern · Himmel, gleich wer beim Boot zuerst ankam (Objekt-id: der Bau-Satz nach dem
//       Boden, gpu-bank +1,4–1,55 ms); im Bündel L0 zuerst, in der Stufe vorn zuerst, neu nur beim Anker-Wechsel
//   P   DIE PROJEKTION (S3): Σ Zensus der Mess-Wiese (spec/profiband/zensus-wiese.json) × Golden-Dreiecke je Art × Stufe ×
//       Pass ≤ Haushalt der Klasse baum — die Studio-Ausgänge gegen das Band, ohne GPU (Pflicht seit dem Vertrags-Akt);
//       die Zeile nahWiese: Σ Büschel je Gestalt × Stufe × Golden-Dreiecke IHRER Gestalt ≤ Ratsche der Klasse am Ort
//       (haupt) und ≤ Haushalt
//   P-Ferne DIE FERNE DER NAH-WIESE (vegetation.K1) an der echten Klasse: das Gesetz der Ferne (`WIESE_FERN_TAFEL`) — das Büschel
//       unverformt (nur ein Anteil, der Block affin, je Büschel die Ebene des Gesetzes), die Lücke des Strahls bis zur Kappe,
//       die Büschel je Pixel ≤ 2× der Übergabe
//   H9  DAS SOLL DES TURMS (hochhaus-dach-speicher) am Kern des Werk-Fadens: die Fern-Stufen L2 · L3 · L1 eines frischen
//       Klinker-Turms (modern, 22 Geschosse) legen zusammen höchstens die Ecken seiner Stufe 0 an — der Warm-Pfad `sollTon`
//       baut die Stufe 0 je Bau einmal, nie je Auftrag (der Müll von 1,1–1,7 GB je Auftrag brach den Renderer der Metropole)
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
const { selbstTafel, SELBSTTEST, path, fs, stammLib, jsonLesen, ROOT: root, jsonKlon } = require("./lib/welt-boot.cjs");
const DZ = require("./lib/draw-zaehler.cjs");
const BAND = require("./lib/band-urteil.cjs");

// DIE ECHTE KLASSE (scripts/lib/stamm.cjs `ladeKlasse`, im vm wie der Wirt der Wiese) — kein Rumpf-Text, kein Zwilling; der
// Selbsttest lädt einen veränderten Stamm (`monolith`) und fährt dieselben Proben.
let _A = null;
const klasseVon = (monolith) =>
    monolith == null
        ? _A || (_A = stammLib.ladeKlasse(root).AnazhRealm)
        : stammLib.ladeKlasse(root, { monolith }).AnazhRealm;
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

// H4b — DAS HOLZ IST EIN AUSSEN (lod.K1#1, w26-eiche-kante): die Teilung (`_kopfKlasse`, Leser `werkbank bild --klasse`) nennt
// den Teil einer Foundry-Gestalt, dessen Stoff Holz ist (phyto-core `budgetRegler(kind).rinde`: Rinde und Stiel), `<klasse>:holz`
// — nie mit dem Namen ihres Laubs (Spielgang GTX 1050 30e94000: f:eiche:L1 0,3102 mit dem Stamm im Gras, 0,194 ohne). Das Laub
// derselben Gruppe, das Holz der Streu (ihr Satz ist Boden) und ein Stoff ohne Studio-Art behalten ihren Namen.
const HOLZ_TEILE = [
    ["f:eiche|0|1:0", "bark", "f:eiche:L1:holz"],
    ["f:eiche|0|1:1", "foliageTex", "f:eiche:L1"],
    ["f:strauch|2|0:1", "stem", "f:strauch:L0:holz"],
    ["f:tanne|1|0:2", "foliage", "f:tanne:L0"],
    [null, "bark", "streuSatz"],
    ["f:fachwerk_haus|3|1|ov:9f2c:4", "unknown", "f:fachwerk_haus:L1"],
];

function taeterWand(A) {
    const errs = [];
    const S = stammKlasse(A);
    for (const [k, soll] of SCHLUESSEL) {
        const ist = S.instanz(k);
        if (ist !== soll) errs.push(`_instanzKlasse("${k}") = ${ist}, erwartet ${soll}`);
    }
    const scene = { type: "Scene" };
    const welt = weltVon(A, { scene, playerMesh: null });
    for (const [key, art, soll] of HOLZ_TEILE) {
        const o = { type: "Mesh", name: key ? "" : "streuSatz", geometry: { attributes: {} }, parent: scene };
        o.userData = key ? { archInstanceKey: key } : { streuSatz: "streuSatz" };
        o.material = { userData: art ? { foundryKind: art } : {} };
        const ist = A.prototype._kopfKlasse.call(welt, o).join(" ");
        if (ist !== soll + " " + soll)
            errs.push(
                `${/:holz$/.test(soll) ? "Rinde unter Laub-Namen" : "Holz-Teilung"}: ${key || "streuSatz"} (${art || "ohne Art"}) heißt ${ist}, Soll ${soll}`
            );
    }
    return { errs, n: SCHLUESSEL.length + HOLZ_TEILE.length, S };
}

// H7 — DIE ZEICHEN-REIHE (1310-1, T3): `_buendelReihe` über eine Szene, in der eine Region vor @global ankam — danach
// tragen die Bündel-Plätze @global · die Regionen (in Ankunft), jedes andere Kind steht, wo es stand (das Bündel der
// CPU-Wahl "@wahl" fiel mit w25-gpu-wahl: die Gruppen der Wahl hängen lose in der Szene). Die losen
// Opaken in Boot-Ankunft (Himmel, Fern, Boden vor dem Bau, gleiche Tiefe) folgen `_zeichenFolge` als Bau · Boden · Fern ·
// Himmel, der Feld-Pass (renderOrder) zuletzt; `_configureRenderer` setzt sie. Gefahren an der echten Klasse `A`.
function buendelReiheWand(A) {
    const errs = [];
    if (typeof A._zeichenFolge !== "function" || typeof A.prototype._buendelReihe !== "function")
        return {
            errs: ["_zeichenFolge / _buendelReihe fehlen im Stamm — die Zeichen-Reihe hängt an der Ankunft beim Boot"],
            n: 0,
        };
    const R = {
        setSize() {},
        setPixelRatio() {},
        setClearColor() {},
        shadowMap: {},
        setOpaqueSort: (fo) => (R.folge = fo),
    };
    try {
        A.prototype._configureRenderer.call(weltVon(A, {}), R);
    } catch {
        /* was nach der Folge kommt, braucht die Welt */
    }
    if (R.folge !== A._zeichenFolge)
        errs.push(
            "_configureRenderer setzt die Zeichen-Reihe der losen Opaken nicht (setOpaqueSort) — die Objekt-id entscheidet"
        );
    const L = (n, ro, s, id) => ({
        groupOrder: 0,
        renderOrder: ro,
        z: -0.1,
        id,
        object: { name: n, userData: s ? { zeichenSchicht: s } : {} },
    });
    const istL = [
        L("himmel", 0, "himmel", 20),
        L("feld-pass", 9998, null, 51),
        L("fern-ring", 0, "fern", 47),
        L("bodenSatz", 0, "boden", 46),
        L("bauSatz", 0, null, 6361),
    ]
        .sort(A._zeichenFolge)
        .map((x) => x.object.name)
        .join(" · ");
    if (istL !== "bauSatz · bodenSatz · fern-ring · himmel · feld-pass")
        errs.push(
            `die losen Opaken nach der Ankunft Himmel · Feld · Fern · Boden · Bau: ${istL} — Soll bauSatz · bodenSatz · fern-ring · himmel · feld-pass`
        );
    const B = (k) => ({ isBundleGroup: true, name: "regionBundle:" + k, userData: { regionKey: k } });
    const scene = { children: [{ name: "voxelChunk:0,0" }, B("3,4"), { name: "himmel" }, B("@global"), B("s:1,2")] };
    A.prototype._buendelReihe.call(weltVon(A, {}), scene);
    const ist = scene.children.map((c) => (c.userData ? c.userData.regionKey : c.name)).join(" · "),
        soll = "voxelChunk:0,0 · @global · himmel · 3,4 · s:1,2";
    if (ist !== soll) errs.push(`die Reihe der Bündel nach der Ankunft 3,4 · @global · s:1,2: ${ist} — Soll ${soll}`);
    // DIE REIHE IM BÜNDEL (1310-8): die Gruppen eines Bündels nach ihrer Stufe (L0 zuerst, die Atlas-Karte zuletzt), im
    // Gleichstand nach Schlüssel.
    if (typeof A._buendelKinderReihe !== "function")
        return {
            errs: errs.concat([
                "_buendelKinderReihe fehlt im Stamm — die Gruppen eines Bündels zeichnen in der Ankunft",
            ]),
            n: 3,
        };
    const K = (stufe, key) => ({ userData: { buendelStufe: stufe, archInstanceKey: key } });
    const bundle = {
        children: [K(1, "f:a|1|1:0"), K(9, "atlas"), K(0, "f:b|1|0:0"), K(0, "f:a|1|0:2"), K(1, "f:a|1|1:0#S")],
    };
    A._buendelKinderReihe(bundle);
    const istK = bundle.children.map((c) => c.userData.archInstanceKey).join(" · "),
        sollK = "f:a|1|0:2 · f:b|1|0:0 · f:a|1|1:0 · f:a|1|1:0#S · atlas";
    if (istK !== sollK)
        errs.push(`die Reihe im Bündel nach der Ankunft L1 · Karte · L0 · L0 · Zwilling: ${istK} — Soll ${sollK}`);
    // DIE REIHE NACH ABSTAND (1310-9): mit dem Auge zeichnet in der Stufe vorn zuerst (die nächste Instanz der Gruppe); neu
    // gestellt nur beim Anker-Wechsel (das Auge ≥ BUENDEL_ANKER_M weiter), dann nimmt jedes Bündel EINMAL neu auf.
    if (typeof A.prototype._buendelAnkerPruefen !== "function")
        return {
            errs: errs.concat(["_buendelAnkerPruefen fehlt im Stamm — die Reihe kennt kein Auge (vorn nicht zuerst)"]),
            n: 5,
        };
    const I = (stufe, key, ...orte) => {
        const a = new Float32Array(16 * Math.max(1, orte.length));
        orte.forEach((o, i) => ((a[i * 16 + 12] = o[0]), (a[i * 16 + 14] = o[1])));
        return {
            userData: { buendelStufe: stufe, archInstanceKey: key },
            instanceMatrix: { array: a },
            count: orte.length,
        };
    };
    const fernVorn = {
        children: [I(0, "f:a|1|0:0", [40, 0]), I(1, "f:z|1|1:0", [1, 0]), I(0, "f:b|1|0:0", [50, 0], [3, 0])],
    };
    A._buendelKinderReihe(fernVorn, { x: 0, z: 0 });
    const istA = fernVorn.children.map((c) => c.userData.archInstanceKey).join(" · "),
        sollA = "f:b|1|0:0 · f:a|1|0:0 · f:z|1|1:0";
    if (istA !== sollA)
        errs.push(`die Reihe nach Abstand (L0 bei 40 m · L1 bei 1 m · L0 bei 50 m und 3 m): ${istA} — Soll ${sollA}`);
    const M = A.BUENDEL_ANKER_M;
    const B1 = {
        isBundleGroup: true,
        userData: { regionKey: "@global" },
        needsUpdate: false,
        children: [I(0, "f:a|1|0:0", [40, 0]), I(0, "f:b|1|0:0", [3, 0])],
    };
    const welt = weltVon(A, { scene: { children: [B1] } });
    const erst = welt._buendelAnkerPruefen({ x: 0, z: 0 });
    B1.needsUpdate = false;
    const nah = welt._buendelAnkerPruefen({ x: M * 0.6, z: 0 });
    const nahNeu = B1.needsUpdate;
    const weit = welt._buendelAnkerPruefen({ x: M * 1.25, z: 0 });
    if (!(erst === true && nah === false && nahNeu === false && weit === true && B1.needsUpdate === true))
        errs.push(
            `der Anker der Reihe: erster Ruf ${erst}, ${M * 0.6} m ${nah} (Neuaufnahme ${nahNeu}), ${M * 1.25} m ${weit} — Soll true · false (keine) · true (Neuaufnahme)`
        );
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

// H9 DAS SOLL DES TURMS (hochhaus-dach-speicher): der Werk-Faden (foundry-bruecke `build-asset` → fachwerk-core
// `buildInstance`) baut die Fern-Stufen L1 · L2 · L3 eines Turms; ihr Warm-Pfad (`sollTon`) misst die Stufe 0. Bis
// hochhaus-dach-speicher baute JEDE Stufe sie neu — ein Klinker-Turm (modern, 22 Geschosse) 2,8 Mio. Ecken je Auftrag,
// 1,1–1,7 GB Allokation; die Metropole (216 Häuser, Türme bis 23 Geschosse) füllte so den geteilten 4-GB-Käfig der Fäden mit
// Müll, der Renderer fiel (V8 OOM). Die Linse zählt die Ecken, die der Kern anlegt (`setAttribute("position")`): die drei
// Fern-Stufen eines frischen Baus zusammen höchstens so viele wie seine Stufe 0 — die Stufe 0 je Bau EINMAL.
const TURM_SOLL = { id: "modern", ov: { pitchDeg: 52, W: 10.5, D: 11, storeys: 22, brace: "wild", stil: "klinker" } };
// `jeAuftrag` (der Selbsttest): der Kern frisch vor jedem Auftrag (der EINE Lader `studioKern`, `frisch`) — sein Gedächtnis
// lebt dann je Auftrag statt je Faden, der Stand vor hochhaus-dach-speicher
function sollWand(jeAuftrag) {
    const { studioKern } = require("./lib/welt-boot.cjs");
    let FC = studioKern("fachwerk-core.js", "__fachwerkCore", true);
    const BG = THREE.BufferGeometry.prototype,
        setze = BG.setAttribute;
    let ecken = 0;
    BG.setAttribute = function (n, a) {
        if (n === "position" && a) ecken += a.count;
        return setze.call(this, n, a);
    };
    const bau = (samen, l) => {
        const e = ecken;
        if (jeAuftrag) FC = studioKern("fachwerk-core.js", "__fachwerkCore", true);
        FC.buildInstance(TURM_SOLL.id, samen, l, Object.assign({}, TURM_SOLL.ov)).traverse(
            (o) => o.geometry && o.geometry.dispose()
        );
        return ecken - e;
    };
    try {
        const e0 = bau(10, 0);
        const je = [2, 3, 1].map((l) => ({ l, e: bau(11, l) }));
        const summe = je.reduce((s, x) => s + x.e, 0);
        const errs =
            summe > e0
                ? [`H9 sollTon: ${TURM_SOLL.id} ${TURM_SOLL.ov.storeys} Geschosse — L2 · L3 · L1 legen ${summe} Ecken an, ` +
                      `${(summe / e0).toFixed(2)} × die Stufe 0 (${e0}; Soll ≤ 1): die Stufe 0 je Auftrag statt je Bau ` +
                      `(${je.map((x) => `L${x.l} ${x.e}`).join(" · ")})`] // prettier-ignore
                : [];
        return { errs, e0, summe, je };
    } finally {
        BG.setAttribute = setze;
    }
}

// H10 DIE FERNE SIEDLUNG HÄLT KEINEN KOPF (siedlung-heap, „Speicher folgt dem Blick“): fällt eine Siedlung aus dem Blick
// (`_tickBewohner` jenseits nearM × fernFaktor → `_bewohnerFort`), hält ihr Eintrag in `_bewohnerSiedlungen` nichts mehr, was
// aus ihrer Liste abgeleitet ist — keinen Kopf, keinen Leib; kehrt der Spieler zurück, legt der Takt die Liste und mit ihr
// `aktivListe` · `aktiv` · `ruhend` · `raster` · `koepfe` neu aus dem Plan. Bis siedlung-heap hielten die fünf Takt-Felder jede
// ferne Siedlung samt Leib (Radeon, Ziel der Wegenetz-Fahrt: 8 ferne Siedlungen, 434 Köpfe, `aktivListe[].leib.userData`
// 88,3 MB nach GC). Die Linse fährt den echten Abschied der Klasse an einer Siedlung im Takt-Stand und sucht jeden Kopf, der
// von ihrem Eintrag aus noch erreichbar ist, beim Pfad. DIE KLASSE, NICHT DAS FELD (heap-register): der Abschied nullte seine
// Felder einzeln, und `backt` (die Köpfe, an denen gebacken wird) entkam ihm — Radeon, Wegenetz-Fahrt: `_bewohnerSiedlungen.backt[]`
// 28,9 MB nach GC. Darum trägt der Stand hier auch ein Feld, das kein Abschied beim Namen kennt (`zukunft`): nur das Register
// (`BEWOHNER_ERINNERUNG`) räumt es. Und das Gedächtnis bleibt — Plan, Ursprung und Netz-Grund stehen nach dem Abschied.
function fernSiedlungWand(A) {
    const w = weltVon(A, {});
    for (const n of [
        "_verkehrFort",
        "_tonZeileFrei",
        "_kreaturZiegelTod",
        "_disposeSoulGroup",
        "_gangSatzAbschied",
        "_ofenMemoRaeumen",
    ])
        w[n] = () => {}; // die Abschiede der Nachbarn (eigene Organe) // prettier-ignore
    const koepfe = [0, 1, 2].map((i) => ({
        nr: i,
        leib: { userData: { pose: new Float32Array(64) } },
        tonZeilen: null,
    }));
    const liste = koepfe.slice();
    const netzGrund = { knoten: [], kanten: [] };
    const S = { key: "1,1", ox: 900, oz: 900, liste, aktivListe: liste, aktiv: liste.slice(0, 2), ruhend: [koepfe[2]], raster: new Map([["9,9", [koepfe[0]]]]), koepfe: [koepfe[0]], backt: [koepfe[1]], zukunft: { kopf: koepfe[2] }, plan: { slots: [] }, netzGrund, satz: null, gestalten: [], raum: null, verkehr: null }; // prettier-ignore
    // die Arbeits-Puffer des Takts hielten die Köpfe der zuletzt getakteten Siedlung — JEDE Liste, die der Stamm am Reich lazy
    // anlegt (`this._bewohner… || (this._bewohner… = [])`, gelesen aus den Methoden der Klasse, heap-blick-folgt): eine neue, die
    // das Register `BEWOHNER_TAKT_PUFFER` nicht kennt, hält ihren Kopf und steht hier beim Namen
    const puffer = new Set();
    for (const n of Object.getOwnPropertyNames(A.prototype)) {
        const f = Object.getOwnPropertyDescriptor(A.prototype, n).value;
        if (typeof f === "function")
            for (const m of String(f).matchAll(/this\.(_(?:bewohner|verkehr)\w+) \|\| \(this\.\1 = \[\]\)/g)) puffer.add(m[1]);
    }
    for (const [i, n] of [...puffer].entries()) w[n] = [koepfe[i % 3]];
    w._bewohnerNbZahl = { geachtet: [koepfe[2]], naechste: [koepfe[1]] };
    A.prototype._bewohnerFort.call(w, S);
    const kopf = new Set(koepfe);
    const gesehen = new WeakSet();
    const q = [[S, "S"], ...[...puffer, "_bewohnerNbZahl"].map((n) => [w[n], "r." + n])];
    const pfade = [];
    for (let i = 0; i < q.length; i++) {
        const [o, p] = q[i];
        if (kopf.has(o)) {
            pfade.push(p);
            continue;
        }
        const kinder = o instanceof Map ? [...o].map(([k, v]) => [v, `${p}[${k}]`]) : Object.entries(o).map(([k, v]) => [v, Array.isArray(o) ? `${p}[]` : `${p}.${k}`]); // prettier-ignore
        for (const [v, pp] of kinder)
            if (v && typeof v === "object" && !gesehen.has(v)) (gesehen.add(v), q.push([v, pp]));
    }
    const ziel = [...new Set(pfade)];
    const errs = ziel.length ? [`H10 _bewohnerFort: die ferne Siedlung hält ${pfade.length} Köpfe (Soll 0) — ${ziel.join(" · ")}`] : []; // prettier-ignore
    const vergessen = [["key", "1,1"], ["ox", 900], ["oz", 900], ["netzGrund", netzGrund]].filter(([k, v]) => S[k] !== v).map(([k]) => k); // prettier-ignore
    if (!(S.plan && Array.isArray(S.plan.slots))) vergessen.unshift("plan");
    if (vergessen.length)
        errs.push(`H10 _bewohnerFort: die ferne Siedlung vergaß ihr Gedächtnis — ${vergessen.join(" · ")}`);
    if (puffer.size < 8) errs.push(`H10 _bewohnerFort: die Linse fand nur ${puffer.size} Takt-Puffer im Stamm (Soll ≥ 8) — blind`); // prettier-ignore
    return { errs, n: pfade.length, puffer: [...puffer] };
}

// H11 DIE VORLAGE FOLGT DEM BLICK (heap-register 21.11.): die verschmolzene Vorlage eines Bauplans (`_buildArchMeshMerged`,
// `_archMergeCache`) lebt, solange ein Bau aus ihr steht; die Rückgabe des letzten (`_disposeSoulGroup` → `_archMergeLoslassen`)
// nimmt sie mit, der nächste Bau verschmilzt neu. Bis heap-register hielt eine WeakMap je Bauplan die Vorlage, solange der
// Bauplan lebte — und der lebt immer (state.blueprints); das Vorbacken der Geister verschmolz die ganze Bibliothek (Radeon,
// Wegenetz-Fahrt nach dem Richter-Preis: `_archMergeCache[].geom` 15,7 MB). Die Linse fährt zwei Bauten und das Vorbacken
// (bauen, gleich zurückgeben) am echten Stamm und zählt, was die Vorlage nach jeder Rückgabe hält.
function vorlageWand(A) {
    const w = weltVon(A, {});
    const weg = [];
    let merges = 0;
    w._queueDispose = (g) => weg.push(g);
    w._foundryLoslassen = w._ofenVorlageLoesen = () => {};
    w._buildFromBlueprint = () => null;
    // die Geometrie der Probe: genug für den Bau (`new THREE.Mesh(geom.clone(), mat)`), markiert als Vorlage oder Klon
    const geo = (art) => ({ h11: art, morphAttributes: {}, attributes: {}, clone: () => geo("klon") });
    w._mergeBlueprintByMaterial = () => (merges++, { leaves: [{ geom: geo("vorlage"), mat: {}, stoff: null }] });
    const bp = { name: "h11", parts: Array.from({ length: 6 }, () => ({})) };
    const errs = [];
    const haelt = () => (w._archMergeCache && w._archMergeCache.get ? !!w._archMergeCache.get(bp) : false);
    const a = A.prototype._buildArchMeshMerged.call(w, bp);
    const b = A.prototype._buildArchMeshMerged.call(w, bp);
    if (merges !== 1)
        errs.push(
            `H11 _buildArchMeshMerged: zwei stehende Bauten verschmolzen ${merges}× (Soll 1 — die Vorlage teilt)`
        );
    A.prototype._disposeSoulGroup.call(w, a);
    if (!haelt()) errs.push("H11 _disposeSoulGroup: die Vorlage fiel, während ein Bau aus ihr steht");
    A.prototype._disposeSoulGroup.call(w, b);
    if (haelt()) errs.push("H11 _archMergeCache: die Vorlage hält nach dem letzten Bau (Soll: sie fällt mit ihm)");
    // das Vorbacken: ein Geist, gebaut und gleich zurückgegeben (`_tickBlueprintPrebake`)
    A.prototype._disposeSoulGroup.call(w, A.prototype._buildArchMeshMerged.call(w, bp));
    if (haelt())
        errs.push("H11 _tickBlueprintPrebake: das Vorbacken hält die Vorlage (Soll: der Geist gibt sie zurück)");
    const vorlagen = weg.filter((g) => g && g.h11 === "vorlage").length;
    if (vorlagen !== 2) errs.push(`H11 _archMergeLoslassen: ${vorlagen} Vorlagen entsorgt (Soll 2: nach dem letzten Bau und nach dem Geist)`); // prettier-ignore
    return { errs, merges };
}

// H16 DER CACHE HÄLT NICHTS ÜBER SEINE LESER HINAUS (foundry-halten): ein Foundry-Körper, den sein letzter Halter zurückgab
// (`_foundryLoslassen`), fällt im nächsten Takt — nie im selben (ein Umbau gibt zurück und holt gleich wieder) —, und ein
// Leser ohne Senke hält ihn ab seinem letzten Lesen die Wiederkehr einer Hülle (ARCH_LEER_GNADE_MS × ARCH_LEER_MINT_DECKEL;
// mit der Gnade EINER Hülle bestellte das Start-Dorf 43 nur gelesene Körper neu). Bis foundry-halten hielt der Ruhe-Deckel
// jeden Untätigen 60 s über seinen letzten Leser hinaus, bis 64 MB (Radeon, Wiese nach dem Start-Dorf: 63,9 MB ungehalten,
// davon 62,7 MB Häuser, deren Hülle schon zurückgab). Die Linse fährt den echten Takt (`_tickFoundryIngest`) an fünf Körpern
// zu 8 MB: drei gelesen und zurückgegeben (einer im selben Takt wieder gehalten), einer gehalten, einer nur gelesen — und
// danach ein Körper, nach dem nichts mehr gebaut und nichts zurückgegeben wird (der eben gebaute trägt seine Frist selbst ein).
// Die Zeit vergeht über den Takt der Welt: je Schritt das echte delta (`AnazhRealm.FIXED_DT`), die Welt-Uhr bestellt durch ihre
// EINE Tür (`_weltUhrNimm`), dann der Takt des Caches — die Linse schreibt die Uhr nie selbst (die Ein-Schreiber-Wand).
function leserWand(A) {
    const state = { spielZeit: 100, weltTakt: 7 };
    const w = weltVon(A, state);
    const f = (w._foundry = { cache: new Map(), cacheBytes: 0 });
    const koerper = (halter) => ({ _liveRefs: halter, children: [{ geometry: { attributes: { position: { array: new Float32Array(2 << 20) } }, dispose() {} } }] }); // prettier-ignore
    const setze = (k, halter) => A.prototype._foundryCacheSet.call(w, k, koerper(halter));
    const dt = A.FIXED_DT;
    const takt = (s) => {
        for (let n = Math.max(1, Math.round(s / dt)); n > 0; n--) {
            A.prototype._weltUhrNimm.call(w, state.spielZeit + dt);
            state.weltTakt++;
            A.prototype._tickFoundryIngest.call(w, dt);
        }
    };
    const da = (k) => f.cache.has(k);
    const G = (A.ARCH_LEER_GNADE_MS * A.ARCH_LEER_MINT_DECKEL) / 1000;
    const los = ["haus:gotisch|12|0", "haus:schwarzwald|3|1", "haus:alpenchalet|7|0"];
    for (const k of los) setze(k, 1);
    setze("haus:gotisch|12|1", 1);
    setze("baum:eiche|4|2", 0);
    const errs = [];
    // die Senke liest ihre Stufe (`_switchArchitectureLOD`) und gibt sie zurück, als der Spieler geht
    for (const k of los) A.prototype._foundryCacheGet.call(w, k);
    for (const k of los) A.prototype._foundryLoslassen.call(w, f.cache.get(k));
    A.prototype._tickFoundryIngest.call(w, 0);
    if (!los.every(da))
        errs.push("H16 _foundryLoslassen: ein Körper fiel im Takt seiner Rückgabe (Soll: erst im nächsten — ein Umbau gibt zurück und holt gleich wieder)"); // prettier-ignore
    if (da(los[2])) f.cache.get(los[2])._liveRefs++; // der Umbau: im selben Takt wieder gehalten
    takt(dt);
    const ungehalten = los.slice(0, 2).filter(da);
    const mb = ungehalten.length * 8;
    if (ungehalten.length)
        errs.push(`H16 _foundryCacheSet: ungehaltener Foundry-Eintrag nach dem Leser — ${ungehalten.join(" · ")} (${mb} MB) halten den Cache im Takt nach ihrer Rückgabe (Soll: sie fallen — der Cache hält nichts über seine Leser hinaus)`); // prettier-ignore
    if (!da(los[2]) || !da("haus:gotisch|12|1"))
        errs.push("H16 _foundryLoslassen: ein gehaltener Körper fiel aus dem Cache");
    takt(5);
    A.prototype._foundryCacheGet.call(w, "baum:eiche|4|2"); // der Leser ohne Senke liest wieder: seine Gnade beginnt neu
    takt(G - 1);
    if (!da("baum:eiche|4|2"))
        errs.push(`H16 _foundryCacheGet: ein Körper fiel ${G - 1} s nach seinem letzten Lesen, in der Wiederkehr seines Lesers (Soll: er hält ihn ${G} s — sonst bestellt er ihn neu)`); // prettier-ignore
    takt(1.1);
    if (da("baum:eiche|4|2"))
        errs.push(`H16 _foundryCacheGet: ungehaltener Foundry-Eintrag nach dem Leser — baum:eiche|4|2 hält den Cache ${(G + 0.1).toFixed(1)} s nach seinem letzten Lesen (Soll: er fällt nach der Wiederkehr einer Hülle)`); // prettier-ignore
    const n = f.cache.size;
    setze("baum:buche|2|1", 0); // gebaut, nie gehalten, und danach baut keiner mehr und keiner gibt zurück
    takt(G + 0.1);
    if (da("baum:buche|2|1"))
        errs.push(`H16 _foundryCacheSet: ungehaltener Foundry-Eintrag nach dem Leser — baum:buche|2|1 hält den Cache ${(G + 0.1).toFixed(1)} s nach seinem Bau (Soll: der eben gebaute trägt seine Frist ein und fällt nach der Wiederkehr einer Hülle)`); // prettier-ignore
    return { errs, mb, n };
}

// H17 DER FERNE ORT HÄLT KEINEN BAU (heap-loslassen, „der Speicher folgt dem Blick“): ein Ort der Sitzung, dessen Bewohner gingen
// und von dessen Bauten keiner ein eigenes Bild trägt, fällt in sein Gedächtnis (`_ortAbschiedTakt` im Bauer `_tickAutoSettlement`
// — auch wo der Haken des Messorts den Bau anhält): seine Häuser und ihre Ausstattung verlassen `state.architectures`
// (`removeArchitecture` ins Gedächtnis), sein Grund bleibt im Erdbau, die Masse der Stadt an ihrem Los, Zelle, Wege und Taten
// stehen, der Stand speichert nicht, ein fremder Bau bleibt; ein Bau mit Bild hält den Fall an; naht das Auge, hebt der Zug jeden
// Slot aus demselben Plan (`_ortHeben`). Bis heap-loslassen hielt jeder ferne Ort seine Bauten (GTX 1060, genesis → stadt-voll →
// genesis: 2 454 → 3 267 Einträge, Heap nach GC 225,7 → 387,9 MB). Die Linse fährt den echten Takt an einem Ort aus drei Häusern
// (eins der Stadt, mit Masse), einer Laterne und einer Wandlaterne, 1 km vom Auge; `mitBild`: ein Haus trägt seinen Satz.
function ortFallWand(A, mitBild = false) {
    const plan = {
        seed: 4242,
        ort: { x: 1000, z: 0 },
        welt: { x0: -60, x1: 60, z0: -60, z1: 60 },
        slots: [
            { seed: 11, x: 0, z: 0 },
            { seed: 12, x: 20, z: 0 },
            { seed: 13, x: 0, z: 20 },
        ],
        laternen: [
            { x: 10, z: 10 },
            { wand: true, slot: 0, x: 2, z: 0 },
        ],
    };
    const k = "7,0";
    const taten = [{ tat: "abbauen", x: 1040, z: 0, h: 1 }];
    const cells = { [k]: { seed: 4242, x: 1000, z: 0, nH: 3, ort: "ort:4242:1000,0" } };
    const state = { worldMeta: { settlementCells: cells, taten }, architectures: [], stadtFerne: { los: new Map(), von: new Map(), schmutz: new Set(), je: new Map() } }; // prettier-ignore
    const w = weltVon(A, state);
    const auge = { x: 0, z: 0 };
    const zahl = { grund: 0, stand: 0 };
    Object.assign(w, {
        _ortPlaene: new Map([[cells[k].ort, plan]]),
        _stlWegeKeys: new Set([k]),
        _bewohnerSiedlungen: new Map([[k, { key: k, plan, ox: 1000, oz: 0, liste: null }]]),
        _lodAuge: () => auge,
        _schirm: () => ({ pxJeM: 200 }), // ein Haus (100 m²) 500 m Horizont, die Laterne (1 m²) 50 m, das Haus der Stadt 300 m
        _dorfTaktLebt: () => false, // der Haken des Messorts hält den Bau an
        _stadtFerneTakt: () => {},
        _grundrissVon: () => ({ ex: 4, ez: 4, ox: 0, oz: 0 }),
        _grundrissFaellt: () => {},
        _erdbauGrundFaellt: () => zahl.grund++,
        _scheduleEditSave: () => zahl.stand++,
        _erdbauRoh: () => [],
        _werkGesetzAus: () => {},
    });
    for (const n of ["_archZiegelTod", "_cullArchitectureMesh", "_trittFlaecheLoesen", "_blockerAustritt", "_stufeWecken", "_weltRegt", "_kronenStreuWeg"]) w[n] = () => {}; // prettier-ignore
    const same = (i) => A.prototype._ausstattungSame.call(w, plan, "laterne", i);
    const bau = (id, type, seed, x, z, satzA) => ({
        id,
        type,
        seed,
        position: { x, y: 0, z },
        _satzA: satzA,
        _ausGesetz: true,
    });
    const haeuser = plan.slots.map((s) => bau(s.seed, "haus_gotisch", s.seed, 1000 + s.x, s.z, 100));
    const ort = [
        ...haeuser,
        bau(21, "laterne_dorf", same(0), 1010, 10, 1),
        bau(22, "wandlaterne_dorf", same(1), 1002, 0, 1),
    ];
    const fremd = bau(30, "haus_gotisch", 99, 1030, 30, 100);
    state.architectures.push(...ort, fremd);
    if (mitBild) haeuser[1]._ziegelSlot = {};
    // das Haus der Stadt trägt fern seine Masse: sein Los, gebunden beim Eintritt (`_stadtMasseRegt`)
    const masse = { e: { gebunden: [0], anH: [1] }, j: 0 };
    state.stadtFerne.los.set(A._stadtLosKey(1000, 0), masse);
    A.prototype._stadtMasseRegt.call(w, haeuser[0], "ein");
    for (let i = 0; i < 4; i++) {
        A.prototype._tickAutoSettlement.call(w, auge);
        A.prototype._stadtMasseStand.call(w); // der Stand der Massen nach den Wechseln des Takts (`_stadtFerneTakt`)
    }
    const errs = [];
    const stehen = ort.filter((e) => state.architectures.includes(e));
    if (mitBild) {
        if (stehen.length < ort.length)
            errs.push(`H17 _ortFallUrteil: ein Bau mit Bild fiel — ${ort.length - stehen.length} von ${ort.length} Bauten des Orts fielen, während haus_gotisch #12 seinen Satz trug (Soll: der Ort steht, bis keiner ein Bild trägt)`); // prettier-ignore
        return { errs, n: stehen.length };
    }
    if (stehen.length)
        errs.push(`H17 _ortAbschiedTakt: die ferne Siedlung hält ${stehen.length} Bauten (Soll 0) — ${stehen.map((e) => e.type + " #" + e.id).join(" · ")}`); // prettier-ignore
    if (!state.architectures.includes(fremd))
        errs.push("H17 _ortAbschiedTakt: ein fremder Bau fiel mit dem Ort (haus_gotisch #30)");
    if (zahl.grund) errs.push(`H17 removeArchitecture: der Fall ins Gedächtnis nahm den Grund (${zahl.grund}×) — der Zug, der den Ort hebt, fände ihn nicht`); // prettier-ignore
    if (zahl.stand) errs.push(`H17 removeArchitecture: der Fall ins Gedächtnis speicherte den Stand (${zahl.stand}×) — der Bau eines Orts steht nicht in ihm`); // prettier-ignore
    if (!(masse.e.anH[0] === 1 && masse.e.gebunden[0] === 0 && !state.stadtFerne.von.has(haeuser[0])))
        errs.push(`H17 _stadtMasseRegt: die Masse des gefallenen Hauses der Stadt steht nicht frei an ihrem Los (an ${masse.e.anH[0]}, gebunden ${masse.e.gebunden[0]}; Soll an 1, gebunden 0)`); // prettier-ignore
    const vergessen = [!cells[k] && "Zelle", !w._stlWegeKeys.has(k) && "Wege", taten.length !== 1 && "Taten"].filter(
        Boolean
    );
    if (vergessen.length) errs.push(`H17 _ortAbschiedTakt: der Ort vergaß sein Gedächtnis — ${vergessen.join(" · ")}`);
    // das Auge naht (500 m vor dem Ort): der Zug hebt jeden Slot aus demselben Plan
    auge.x = 500;
    A.prototype._ortAbschiedTakt.call(w, auge);
    const q = w._ortWachsHaeuser && w._ortWachsHaeuser.get(k);
    const gehoben = q && q.gehoben && q.plan ? q.plan.slots.length : 0;
    if (gehoben !== plan.slots.length)
        errs.push(`H17 _ortHeben: das nahende Auge hebt ${gehoben} von ${plan.slots.length} Slots des gefallenen Orts (Soll alle, aus demselben Plan)`); // prettier-ignore
    return { errs, n: stehen.length, gehoben };
}

// H13 DER PUFFER GEHÖRT DER GPU(heap-register 2): was nur die GPU schreibt und liest, hält nach dem Hochladen keine CPU-
// Kopie (`_gpuEigen`). Bis heap-register 2 hielt der Sicht-Index (`_sichtZugPuffer`) seine Nullen ein zweites Mal im Heap
// (Radeon, Wegenetz-Fahrt am Richter-Preis: `_sichtTiefeZ.auftraege[]` 13,5 MB). Die Linse fährt den echten Auftrag dreimal
// an einem Zug mit 40 000 Indizes: gelegt (einmal hochgeladen, die Kopie leer, Typ und Zahl stehen), wieder (kein zweites
// Legen), nach dem Fall auf der GPU (`_gpuAbschied`, der Kehraus) — der Index legt sich neu, nie ein Hochladen aus Leere.
function gpuEigenWand(A) {
    const hoch = [];
    const register = new Map();
    const rend = {
        _attributes: {
            update: (a, typ) => {
                if (register.has(a)) return;
                register.set(a, { type: typ === 2 ? "indexAttributes" : "attributes" });
                hoch.push({ name: a.name, n: a.array.length });
            },
            delete: (a) => register.delete(a),
        },
        info: { memoryMap: register },
    };
    const w = weltVon(A, { renderer: rend });
    const puffer = (label) => ({ label });
    const dev = { createBuffer: (d) => puffer(d.label), createBindGroup: () => ({}) };
    const be = { get: (a) => ({ buffer: register.has(a) ? a : null }) };
    const Z = {
        art: "frueh",
        nIdx: 40000,
        n: 100,
        tafelPuffer: puffer("tafel"),
        auftrag: { name: "sicht:auftrag", array: new Uint32Array(8) },
    };
    Object.assign(Z, { geom: { setIndex: (i) => (Z.geom.index = i) }, mesh: {}, zielPuffer: puffer("ziel"), zielKap: 1000, uni: puffer("uni") }); // prettier-ignore
    const G = { leer: puffer("leer"), satzLayout: {} };
    const zug = () => A.prototype._sichtZugPuffer.call(w, Z, Z, dev, rend, be, G, puffer("quelle"));
    const errs = [];
    zug();
    const erst = Z.index;
    const idx = () => hoch.filter((h) => /^sicht:index/.test(h.name));
    if (erst.array.length > 0)
        errs.push(`H13 _sichtZugPuffer: der Sicht-Index hält nach dem Hochladen seine CPU-Kopie (${((erst.array.byteLength / 1048576) || 0).toFixed(2)} MB, Soll 0 — _gpuEigen)`); // prettier-ignore
    if (erst.array.constructor.name !== "Uint32Array" || erst.count < Z.nIdx)
        errs.push(`H13 _gpuEigen: der Sicht-Index verlor Typ oder Zahl (${erst.array.constructor.name}, count ${erst.count}, Soll Uint32Array ≥ ${Z.nIdx})`); // prettier-ignore
    if (idx().length !== 1 || idx()[0].n < Z.nIdx)
        errs.push(`H13 _sichtZugPuffer: ${idx().length}× hochgeladen, zuerst ${idx()[0] ? idx()[0].n : 0} Indizes (Soll 1× mit ≥ ${Z.nIdx})`); // prettier-ignore
    zug();
    if (Z.index !== erst || idx().length !== 1) errs.push("H13 _sichtZugPuffer: der stehende Sicht-Index legte sich neu (Soll: er steht)"); // prettier-ignore
    w._gpuAbschied(erst);
    zug();
    if (erst.array.length === 0 && (Z.index === erst || idx().length !== 2 || idx()[1].n < Z.nIdx))
        errs.push("H13 _gpuAbschied: der gefallene Sicht-Index legte sich nicht neu (Soll: ein frischer, ganz hochgeladen — nie aus der leeren Kopie)"); // prettier-ignore
    if (erst.array.length === 0 && !register.has(Z.index))
        errs.push("H13 _sichtZugPuffer: der Zug zeichnet einen Index ohne GPU-Puffer");
    return { errs, mb: erst.array.byteLength / 1048576, gelegt: idx().length };
}

// H14 DER FLUG FOLGT DEM BLICK (heap-register 2): ein Knoten-Bau in Raten, dessen Objekt im Bau fiel (der Spieler ging),
// verlässt den Flug (`_knotenFlugRaeumen`) — im Kehraus, auch wenn kein neuer Bau einen Flug anlegt. Bis heap-register 2
// räumte erst der 32. Flug (Radeon, `werkbank runde --nur stadt`: `_erstZeichnung.imFlug` 0 → 7,4 → 16,5 MB je Runde). Die
// Linse fährt den echten Kehraus an einem stillen Bild mit drei Bauten: verlassen (KNOTEN_FLUG_BILDER + 1 Bilder ohne Leser,
// fällt), jung (bleibt) und einem, dessen Leser ihn eben weiterging (bleibt).
function flugWand(A) {
    const bild = 5000;
    const imFlug = new Map([
        ["verlassen", { bild: bild - A.KNOTEN_FLUG_BILDER - 1 }],
        ["jung", { bild: bild - 10 }],
        ["eben", { bild }],
    ]);
    const rend = {
        _attributes: { delete() {} },
        _geometries: { attributeCall: new Map() },
        info: { memoryMap: new Map() },
        _nodes: { nodeFrame: { frameId: bild } },
    };
    const w = weltVon(A, { renderer: rend, scene: { traverse() {} } });
    w._erstZeichnung = { imFlug };
    A.prototype._gpuKehraus.call(w, 0, 1e9);
    const errs = [];
    if (imFlug.has("verlassen"))
        errs.push(`H14 _gpuKehraus: der verlassene Knoten-Bau hält den Flug nach ${A.KNOTEN_FLUG_BILDER + 1} Bildern ohne Leser (Soll: er fällt — _knotenFlugRaeumen)`); // prettier-ignore
    if (!imFlug.has("jung") || !imFlug.has("eben"))
        errs.push("H14 _knotenFlugRaeumen: ein Bau mit Leser fiel aus dem Flug");
    return { errs, flug: imFlug.size };
}

// H15 DER SATZ FOLGT DEM BLICK (heap-blick-folgt): ein Bau-Satz, dessen Inhalt in der Frist um mehr als ein Drittel fiel (der
// Spieler verließ das Dorf), schrumpft sofort auf seinen Inhalt — ein Satz, der nur pendelt, wartet die Frist. Bis hier hielt
// der Bau-Satz an der Wiese nach dem Dorf 22,33 MB für 14 490 Ecken, 600 Takte lang (Radeon). Die Linse fährt den echten
// `_chunkSatzVerdichten` an zwei gestellten Sätzen mitten in der Frist: geleert (Kapazität 442 905, Inhalt 14 490, Beginn
// 307 482 — fällt auf Inhalt × luft) und pendelnd (Inhalt 220 000, ein Viertel unter dem Beginn — bleibt bis zum Ende der Frist).
function satzBlickWand(A) {
    const V = A.CHUNK_SATZ_VERDICHTEN;
    const satz = (vInhalt) => ({ reserviert: 0, abschnitte: new Map(), bloecke: new Map(), takt: 1000, ueberSeit: 990, ueberStart: 307482, ueberHoch: 307482, vInhalt, vKap: 442905, iKap: 3072, vEnde: vInhalt, vFrei: [], attr: [], geom: { index: null, attributes: {}, setDrawRange() {} } }); // prettier-ignore
    const w = weltVon(A, {});
    w._chunkSatzGeometrie = (s, v, i) => ([s.vKap, s.iKap] = [v, i]);
    w._gpuAbschied = () => {};
    const [leer, pendelt] = [satz(14490), satz(220000)];
    A.prototype._chunkSatzVerdichten.call(w, leer);
    A.prototype._chunkSatzVerdichten.call(w, pendelt);
    const ziel = Math.max(V.vMin, Math.ceil(14490 * V.luft));
    const errs = [];
    if (leer.vKap !== ziel)
        errs.push(`H15 bauSatz: der geleerte Satz hält seine Kapazität über den Inhalt — ${leer.vKap} Ecken für 14 490, Soll ${ziel} (_chunkSatzVerdichten: die Frist schützt nur den Satz, der füllt oder pendelt)`); // prettier-ignore
    if (pendelt.vKap !== 442905) errs.push(`H15 bauSatz: der pendelnde Satz schrumpfte mitten in der Frist (${pendelt.vKap} Ecken)`); // prettier-ignore
    return { errs, vKap: leer.vKap, ziel };
}

const ZENSUS = path.join(root, "spec", "profiband", "zensus-wiese.json");
const GOLDEN = path.join(root, "spec", "asset-contract", "v1", "golden");
// je Golden die Dreiecke [Bild, Wurf]: der Studio-Index reist als Uint32, ohne Index je drei Vertices (Float32 × 3); der
// Schatten-Teil (S3, teil "schatten") zeichnet nur in den Kaskaden — er ist der Wurf, nicht das Bild
function dreiecke(g) {
    const tw = [0, 0];
    for (const x of g.meshes || [])
        if (x.attrs?.position)
            tw[+(x.teil === "schatten")] += x.index ? x.index.bytes / 12 : x.attrs.position.bytes / 36;
    return tw;
}
function goldenDreiecke(arten) {
    const [haupt, wurf] = [{}, {}];
    for (const f of fs.readdirSync(GOLDEN)) {
        const m = /^(.+)-s(-?\d+)-L([01])-summer\.json$/.exec(f);
        if (!m || !arten.has(m[1])) continue;
        const [t, w] = dreiecke(jsonLesen(path.join(GOLDEN, f)));
        const k = m[1] + "|" + m[3];
        haupt[k] = Math.max(haupt[k] || 0, t);
        if (m[3] === "1") wurf[m[1]] = Math.max(wurf[m[1]] || 0, w);
    }
    return { haupt, wurf };
}
function projektion(zensus, tris) {
    const [jePass, fehlt] = [{}, []];
    let summe = 0;
    for (const z of zensus.zeilen) {
        const t = z.pass === "haupt" ? tris.haupt[z.art + "|" + z.stufe] : tris.wurf[z.art];
        if (!Number.isFinite(t)) fehlt.push(`${z.art} L${z.stufe} ${z.pass}`);
        else [jePass[z.pass], summe] = [(jePass[z.pass] || 0) + z.inst * t, summe + z.inst * t];
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
        errs.push(
            `P: ${zensus.klasse} projiziert ${Math.round(p.summe)} Dreiecke > Haushalt ${k.dreiecke} (${zensus.ort})`
        );
    return { p, errs, soll: k ? k.dreiecke : null };
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
        if (fs.existsSync(f)) out[z.gestalt + "|" + z.stufe] = dreiecke(jsonLesen(f))[0];
    }
    return out;
}
function gestaltWand(haushalt, ratsche, block, ort, tris) {
    const k = haushalt.klassen.find((x) => x.id === block.klasse);
    const rz = ratsche?.klassen ? ratsche.klassen[block.klasse] : null;
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
        const r = rz?.[pass] ? rz[pass].dreiecke : null;
        if (r == null || !Number.isFinite(r))
            errs.push(
                `P: die Ratsche (${ort}) trägt für ${block.klasse} ${pass} keine Dreiecke — kein Soll, keine Zeile`
            );
        else if (d > r) errs.push(`P: ${block.klasse} ${pass} projiziert ${d} Dreiecke > Ratsche ${r} (${ort})`);
    }
    if (k && summe > k.dreiecke)
        errs.push(`P: ${block.klasse} projiziert ${summe} Dreiecke > Haushalt ${k.dreiecke} (${ort})`);
    const soll = rz?.haupt ? rz.haupt.dreiecke : null;
    return { summe, jePass, jeStufe, soll, haushalt: k ? k.dreiecke : null, errs };
}

// P — DIE FERNE DER NAH-WIESE (w10-wiese, w28-wiese-schale, vegetation.K1) an der echten Klasse: das Gesetz der Ferne
// (`_wieseFern`, in Zahlen die Tafel `WIESE_FERN_TAFEL` über dem Fußabdruck-Abstand Q — flach der Abstand —, die Takt und
// Linse lesen; der Stoff `_halmFerne` und die Wahl der GPU rechnen denselben Term). DAS BÜSCHEL WIRD NIE VERFORMT: das Gesetz
// nennt nur den Anteil und die GLEICHFÖRMIGE Größe `skala` (keine Streckung, keine Spreizung, keine Breite — jedes andere
// Glied ist rot); DIE DECKUNG IM BLICK: die Größe steht bis zur Kappe auf 1 (stetig), übersteigt nie `skalaMax`, und solange
// sie darunter liegt, hält Anteil × Größe² die Lücke (was die Kappe an Zahl nimmt, trägt das Büschel in seiner Fläche); der
// Block der Ferne trägt die Matrix des Büschels affin
// (die vierte Zeile 0 0 0 1 — bis w28-wiese-schale trug Element 3 die Grenze der Streckung) und je Büschel SEINE Ebene des
// Gesetzes (w28-pop-treue: `hang` der Kachel, `_wieseHang` — der Bestand schreibt sie in die vierte Zeile der Instanz, das
// Gesetz der Ferne misst an ihr; die Ebene eines anderen Büschels ist rot). DIE LÜCKE DES STRAHLS: Anteil × Q ÷
// radius hält 1 von der Übergabe bis zur Kappe (der Strahl lässt so viel Grund durch wie an der Übergabe); DER SCHIRM: die
// Büschel je Pixel (∝ Anteil × Q³) übersteigen jenseits der Übergabe nie das Doppelte derer am Fußabdruck `fuss` (14 m: bis
// w14-wiese-saum die Übergabe — absolut dieselbe Wand). Bis w28-wiese-schale streckte das Gesetz das Büschel bis 14-fach, und eine
// Schale aus Karten trug ab ~17 m die Deckung (Zacken-Wände im ersten Bild); bis w10-wiese (voll 21, fall 1,5) fiel die Deckung
// ab 21 m, und die Ferne zeichnete bei 180 m 6× so viele Büschel je Pixel wie an der Übergabe.
// DAS TEIL-GITTER (w19-saum-lai): die Ordnung o (`_wieseOrdnung`, der Stoff ruft dieselbe über seiner Wort-Algebra) wählt jeden Anteil a als
// gleichmäßiges Teil-Gitter der Nähe — der Anteil 1/4 auf 8 × 8 Zellen (Schritt 0,72 m) genau EINE Restklasse (gi, gj)
// mod 2. Die PCG allein (bis w19-saum-lai) dünnte zufällig: Klumpen und Lücken, durch die der flache Blick den Boden sah
// (20–40 m LAI 1,67, der Saum 16 %).
function ferneWand(A) {
    const { radius: R, fern: F } = A.NAH_WIESE,
        T = A.WIESE_FERN_TAFEL;
    const G = A.constructor("return globalThis")(); // das Global des vm (die Kerne der Klasse)
    const kappe = Math.sqrt(F.fuss ** 3 / R); // dort trifft die Lücke die Kappe
    let [luecke, schirm] = [1, 0];
    for (let j = R * T.je; j < (F.bis - F.saum) * T.je; j++) {
        const Q = j / T.je;
        if (Q < kappe - 0.5) luecke = Math.min(luecke, (T.anteil[j] * Q) / R);
        schirm = Math.max(schirm, T.anteil[j] * (Q / F.fuss) ** 3);
    }
    // die Gestalt: das Gesetz nennt nur den Anteil und die gleichförmige Größe; der Block der Ferne trägt die Matrix des
    // Büschels affin
    const Z = G.__phytoCore.WIND_ZAHLEN;
    const verformt = Object.keys(A._wieseFern(Z, 30, 30)).filter((k) => k !== "anteil" && k !== "skala");
    // die Deckung im Blick: Größe 1 bis zur Kappe, nie über `skalaMax`, darunter hält Anteil × Größe² die Lücke
    let [vorKappe, gross, deckung] = [1, 0, 1];
    for (let j = R * T.je; j < (F.bis - F.saum) * T.je; j++) {
        const [Q, g] = [j / T.je, A._wieseFern(Z, 0, j / T.je)];
        gross = Math.max(gross, g.skala);
        if (Q < kappe - 0.5) vorKappe = Math.max(vorKappe, g.skala);
        else if (g.skala < F.skalaMax - 1e-6)
            deckung = Math.min(deckung, (g.anteil * g.skala ** 2) / Math.min(1, R / Q));
    }
    const groesse = !(vorKappe <= 1.001 && gross <= F.skalaMax + 1e-6 && deckung >= 0.99);
    let affin = "affin";
    try {
        const w = weltVon(A, { nahWiese: { vorlagen: new Map(), reich: 0.775, fern: { kacheln: new Map() } } });
        const b = { x: 30, y: 1.5, z: 30, s: 1.1, rot: 0.3, vorlage: 0, o: 0.1, f: [1, 1, 1], gx: 0.05, gz: -0.02 };
        // zwei Büschel, das zweite trägt die Vorlage des Blocks: seine Ebene des Gesetzes steht im Block, nie die des ersten
        const hang = new Float32Array([0.5, 0.5, 0.031, -0.017]);
        const B = w._nahWieseFernBlock({ bloecke: [], hang, ...w._nahWieseKachelDaten(2, 2, [{ ...b, vorlage: 1, o: 0.05 }, b], 12) }, 0, { flat: {}, fern: [{ lokal: new G.THREE.Matrix4() }] }); // prettier-ignore
        const M = B.matrizen[0];
        if (M[3] !== 0 || M[7] !== 0 || M[11] !== 0 || M[15] !== 1)
            affin = `vierte Zeile ${[M[3], M[7], M[11], M[15]].join(" ")}`;
        else if (B.hang?.[0] !== hang[2] || B.hang?.[1] !== hang[3])
            affin = `die Ebene des Gesetzes ${[...(B.hang || [])].join(" ")} statt ${hang[2]} ${hang[3]}`;
    } catch (e) {
        affin = e.message;
    }
    // DER RANG DER ZELLE (w27-ankunft-faden): `_ortRang` ist die untere Schranke der Ordnung jedes Punkts seiner Zelle — über ihm
    // verwirft die Ferne die Zelle vor jedem Wurf (`_nahWieseKachelBueschel`); `brueche` zählt, wo nicht
    const [rest, W] = [new Set(), A._wortAlgebra()];
    let brueche = 0;
    for (let k = 0, o, u; k < 64; k++) {
        [o, u] = [
            A._wieseOrdnung((k & 7) * 0.72, (k >> 3) * 0.72),
            W.anteil(A._ortRang(W, (k & 7) * 0.72, (k >> 3) * 0.72, A._wieseSchritt())),
        ];
        if (o < 0.25) rest.add(k & 9);
        brueche += !(u <= o && o < u + 1 / 256);
    }
    const zeile = `Lücke bis ${kappe.toFixed(1)} m ${luecke.toFixed(2)} · Schirm ${schirm.toFixed(2)}× · Gestalt ${verformt.length ? "verformt (" + verformt.join(", ") + ")" : "unverformt"} · Größe ${vorKappe.toFixed(2)} → ${gross.toFixed(2)}× Deckung ${deckung.toFixed(2)} · Block ${affin} · Restklassen ${rest.size} · Rang-Brüche ${brueche}`; // prettier-ignore
    const rot =
        luecke < 0.99 || schirm > 2 || verformt.length || groesse || affin !== "affin" || rest.size > 1 || brueche;
    return { errs: rot ? [`P-Ferne: ${zeile} (Soll 1 · ≤ 2× · unverformt · 1 → ≤ ${F.skalaMax}× Deckung 1 · affin · 1 · 0)`] : [], luecke, schirm, verformt, gross, deckung, affin }; // prettier-ignore
}

// P-Fächer — DER FÄCHER DER NAH-WIESE (stufe-ein-auge) an der echten Klasse: die Kacheln der Nähe stehen im Sicht-Kegel des EINEN
// Auges (`_wieseFaecher` → `_nahWieseWunsch`), nie dahinter. Das Auge in 1,7 m über flachem Grund (die Höhe des Gesetzes 0), Blick
// waagrecht nach −z, 75° × 16:9. IM STAND: hinter dem Auge (die ganze Kachel samt Weite ≥ 2 m hinter seiner Ebene) steht keine
// Kachel, im Kegel (Mitte ≤ halbes Bildfeld − 5°, ≤ radius) jede. IN DER DREHUNG (12° in 20 ms, 600°/s): der Saum trägt den
// Kreis — jede Kachel des Rings steht, bevor die Drehung sie ins Bild bringt. Bis stufe-ein-auge stand der Ring: 70 % hinter dem Auge.
function faecherWand(A) {
    const G = A.constructor("return globalThis")();
    const NW = A.NAH_WIESE;
    const cam = new G.THREE.PerspectiveCamera(75, 16 / 9, 0.1, 1000);
    const auge = { x: 3, y: 1.7, z: 3 };
    cam.position.copy(auge);
    cam.lookAt(auge.x, auge.y, auge.z - 10);
    const w = weltVon(A, { camera: cam, nahWiese: { kacheln: new Map(), reich: 0.8 }, lastPlayerVoxelChunk: null });
    w._terrainMacroSurfaceY = () => 0;
    const K = NW.kachel;
    const ring = w._nahWieseWunsch(auge, { voll: true, sicht: null, bau: null, halt: null });
    const F = w._wieseFaecher(auge);
    const faecher = w._nahWieseWunsch(auge, F);
    const da = new Set(faecher.map((k) => k.key));
    const halbH = Math.atan(Math.tan((37.5 * Math.PI) / 180) * (16 / 9));
    let [hinten, kegel, fehlt] = [0, 0, 0];
    for (const k of ring) {
        const z0 = k.tz * K - 1.2; // der Kasten samt Jitter und Weite der Büschel
        const [mx, mz] = [(k.tx + 0.5) * K - auge.x, (k.tz + 0.5) * K - auge.z];
        if (z0 - auge.z >= 2 && da.has(k.key)) hinten++; // der Blick geht nach −z: die Kachel liegt ganz hinter dem Auge
        if (Math.hypot(mx, mz) <= NW.radius && Math.abs(Math.atan2(mx, -mz)) <= halbH - (5 * Math.PI) / 180) {
            kegel++;
            if (!da.has(k.key)) fehlt++;
        }
    }
    // die Drehung: 12° in 20 ms
    const nw = w.state.nahWiese;
    cam.lookAt(auge.x + 10 * Math.sin(0.21), auge.y, auge.z - 10 * Math.cos(0.21));
    nw.faecher.t -= 0.02;
    const F2 = w._wieseFaecher(auge);
    const dreh = w._nahWieseWunsch(auge, F2).length;
    // DIE KOSTEN HÄNGEN AN DER ÄNDERUNG: der echte Takt `_tickNahWiese` je Bild (60 Hz am Stempel des Takts), die Rechnungen
    // des Wunschs (`nahWiese.rechnungen`) je 100 Bilder — im Stand (das Auge steht, der Blick steht) und in einer Drehung von
    // 30°/s (0,5° je Bild). Die Wache ist der Anker des Auges auf STAND_RAND_M (ein Zentimeter-Zittern weckt nichts).
    const takt = (yaw0, gradJeBild, n) => {
        const v = weltVon(A, { camera: cam, scene: {}, nahWiese: { kacheln: new Map(), senken: new Map(), vorlagen: new Map(), reich: 0.8, offen: 0 }, lastPlayerVoxelChunk: null }); // prettier-ignore
        v._terrainMacroSurfaceY = () => 0;
        v._lodAuge = () => auge;
        v._nahWieseBestand = () => {};
        let anker = null;
        v._standRuht = (name, runde, ort) => {
            const p = ort.pos;
            if (anker && (p.x - anker.x) ** 2 + (p.y - anker.y) ** 2 + (p.z - anker.z) ** 2 <= ort.rand ** 2)
                return true;
            anker = { x: p.x, y: p.y, z: p.z };
            return false;
        };
        let start = 0;
        for (let i = 0; i < n + 1; i++) {
            const y = yaw0 + (gradJeBild * i * Math.PI) / 180;
            cam.lookAt(auge.x + 10 * Math.sin(y), auge.y, auge.z - 10 * Math.cos(y));
            cam.updateMatrixWorld();
            v._taktZeit = (i * 1000) / 60;
            v._tickNahWiese();
            if (i === 0) start = v.state.nahWiese.rechnungen | 0; // das erste Bild baut den Fächer
        }
        return Math.round(((v.state.nahWiese.rechnungen - start) * 100) / n);
    };
    const imStand = takt(0, 0, 200);
    const inDrehung = takt(0, 0.5, 200);
    const zeile = `Ring ${ring.length} Kacheln · Fächer ${faecher.length} (${((100 * faecher.length) / ring.length).toFixed(1)} %) · hinter dem Auge ${hinten} · im Kegel ${kegel - fehlt} von ${kegel} · Drehung 600°/s ${dreh} von ${ring.length} · Neuberechnungen je 100 Bilder: Stand ${imStand}, Drehung 30°/s ${inDrehung}`; // prettier-ignore
    const rot = hinten > 0 || fehlt > 0 || !kegel || dreh < ring.length || imStand > 0 || inDrehung > 10;
    return { errs: rot ? [`P-Fächer: ${zeile} (Soll hinter dem Auge 0 · im Kegel alle · Drehung der Kreis · Neuberechnungen im Stand 0, in der Drehung ≤ 10 je 100 Bilder)`] : [], zeile, hinten, fehlt, dreh, ring: ring.length, imStand, inDrehung }; // prettier-ignore
}

// eine Zensus-Zeile der Selbsttests (je Klasse Befehle und Dreiecke des Haupt-Passes)
const zensusZeile = (klasse, haupt, tris, stufe = null, art = null) => ({
    klasse,
    stufe,
    art,
    je: { haupt },
    jeTris: { haupt: tris },
});

function selbsttest() {
    const { haushalt, ratsche } = BAND.ladeSpec("wiese", { geraet: "radeon", sicht: "ego" });
    const A = klasseVon();
    const S = stammKlasse(A);
    const { t, ende } = selbstTafel();
    // Die Selbsttests urteilen gegen eine UNGEMESSENE Ratsche desselben Schemas mit fester Toleranz — die gemessenen
    // Werte der echten (die Hülle der Serie) dürfen keinen Selbsttest färben.
    const rt = jsonKlon(ratsche);
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
    const u1 = urteil([zensusZeile(kl, 1, 12)]);
    t(
        "unbenanntes Mesh → UNBENANNT:Mesh, LINSE rot",
        kl === "UNBENANNT:Mesh" &&
            hatRot(u1, "unbenannt") &&
            u1.linse === "ROT" &&
            S.klasse(streu, st) === "streu-klein"
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
    const r3 = jsonKlon(rt);
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
    const h4 = jsonKlon(haushalt);
    h4.klassen.find((k) => k.id === "reserve").befehle += 1;
    const h4b = jsonKlon(haushalt);
    h4b.klassen.find((k) => k.id === "reserve").rest = true;
    const h4c = jsonKlon(haushalt);
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
    const u5 = urteil([zensusZeile("neuerSatz", 3, 9), zensusZeile("g:torus:L0", 1, 9, 0)]);
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
    // S7b — DER PUFFER OHNE NAMEN (w28-preis-ort): die Mutante „Liste vor Zensus" (werkbank `/puffer` bis dahin) trägt die Szene als
    // `buf:?` (Mess-Wiese 32,4 MB) → rot `unbenannt` beim Namen; nach dem Zensus stehen sie als `buf:szene:<Klasse>`, ein kleiner
    // Puffer ohne Halter unter 0,25 MB bleibt still.
    const u7m = urteil([], null, {
        mb: 40,
        liste: [
            { k: "buf:?", mb: 32.4, n: 330 },
            { k: "buf:szene:arena", mb: 7.6, n: 9 },
        ],
    });
    const u7s = urteil([], null, {
        mb: 40,
        liste: [
            { k: "buf:?", mb: 0.1, n: 3 },
            { k: "buf:szene:arena", mb: 39.9, n: 330 },
        ],
    });
    t(
        "buf:? 32,4 MB (Liste vor Zensus) → rot `unbenannt` beim Namen, im Speicher-Nachzug; buf:? 0,1 MB nicht",
        u7m.rot.some(
            (x) => x.art === "unbenannt" && x.schluessel === "unbenannt:buf:?" && /32\.4 MB in 330 Puffern/.test(x.text)
        ) &&
            BAND.vramBefunde(u7m).some((x) => x.schluessel === "unbenannt:buf:?") &&
            !u7s.rot.some((x) => x.art === "unbenannt")
    );

    // S8 — die Schlüssel-Formen des Stamms (H4) ergeben ihre Klasse; das Holz einer Foundry-Gestalt ist ein Außen (H4b): der Stamm
    // ohne die Holz-Teilung (die Rinde unter dem Namen ihres Laubs), mit Rinde allein (der Stiel trüge den Namen des Laubs) und ohne
    // die Grenze der Gestalt (das Holz der Streu fiele aus dem Boden) ist ROT beim Namen — je der veränderte Stamm als Klasse geladen
    const tw = taeterWand(A);
    const st8 = stammLib.text(root);
    const holz = 'return holz ? [grob + ":holz", grob + ":holz"] : [grob, grob];';
    const still8 = [
        [
            "ohne Holz",
            [["_kopfKlasse", holz, "return [grob, grob];"]],
            /Rinde unter Laub-Namen: f:eiche\|0\|1:0 \(bark\) heißt f:eiche:L1 f:eiche:L1/,
        ],
        [
            "nur Rinde",
            [["_kopfKlasse", "globalThis.__phytoCore.budgetRegler(art).rinde", 'art === "bark"']],
            /Rinde unter Laub-Namen: f:strauch\|2\|0:1 \(stem\)/,
        ],
        [
            "ohne Grenze",
            [["_kopfKlasse", 'grob.startsWith("f:") && ', ""]],
            /Holz-Teilung: streuSatz \(bark\) heißt streuSatz:holz/,
        ],
    ].filter(([, e, re]) => !taeterWand(klasseVon(stammLib.ersetze(st8, e))).errs.some((x) => re.test(x)));
    t(
        `Schlüssel-Formen des Stamms → ${SCHLUESSEL.length} Klassen, ${HOLZ_TEILE.length} Teile der Holz-Teilung; ohne Holz, nur Rinde, ohne Grenze rot` +
            (tw.errs.length ? " — " + tw.errs.join("; ") : "") +
            (still8.length ? " — still: " + still8.map(([n]) => n).join(", ") : ""),
        !tw.errs.length && !still8.length
    );

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
    const r10 = jsonKlon(rt);
    r10.klassen.boden.haupt.befehle = 10;
    r10.klassen.bau.haupt.befehle = 3;
    const u10 = urteil([zensusZeile("bodenSatz", 7, 7000), zensusZeile("g:tor:L0", 5, 900, 0)], r10);
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
    const u8 = urteil(
        sauber,
        null,
        {
            mb: 100,
            liste: [
                { k: "tex:output rg11b10ufloat 1440x810x1", mb: 4.4, n: 1 },
                { k: "buf:szene:bodenSatz", mb: 95.6, n: 6 },
            ],
        },
        {
            gpuJeFrameMs: 12,
        }
    );
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
    // Schlüssel-Schwanz fällt, Ziffern im Namen bleiben. DER LEIB EINES MENSCHEN (die Kopf-Klasse, w4-bewohner-wache): ein
    // Bewohner (der Mensch der Menge, sein Baum der Glieder) heißt `bewohner`, nie `tier:?` (bis hier 14 von 14 Teilen am
    // Start-Dorf), und die Teilung (`_kopfKlasse`, Leser: `werkbank bild --klasse`) nennt seine Strähnen unter dem Kopf-Knoten
    // `bewohner:kopf/hair`, sein Kleid `bewohner:leib/stoff`, die des Spielers `spieler:kopf/hair`; das Tier bleibt ungeteilt.
    const sc = { type: "Scene" };
    const s13 = { scene: sc, playerMesh: null };
    const tierG = { type: "Group", name: "", userData: { _tierBaum: {}, soul: "wolf" }, parent: sc };
    const tierM = { type: "SkinnedMesh", name: "", userData: {}, parent: tierG };
    const region = {
        type: "BundleGroup",
        isBundleGroup: true,
        name: "regionBundle:3,4",
        userData: { regionKey: "3,4" },
        parent: sc,
    };
    const inst = { type: "Mesh", name: "", userData: { archInstanceKey: "fscatter:eiche:2:1#0@3,4" }, parent: region };
    const ohne = { type: "Mesh", name: "", userData: {}, parent: region };
    const spieler = { type: "Group", name: "", userData: {}, parent: sc };
    s13.playerMesh = spieler;
    const chunk = { type: "Mesh", name: "voxelChunk:3,-4:lod0", userData: {}, parent: sc };
    const p2p = { type: "Group", name: "p2p-spieler", userData: {}, parent: sc };
    const leerKey = "fscatter:blume:3:0#2@4,5";
    const s13leer = { scene: sc, playerMesh: null, archInstanceGroups: new Map([[leerKey, { liveCount: 0 }]]) };
    const leer = { type: "Mesh", name: "", userData: { archInstanceKey: leerKey }, parent: region };
    const bew = { name: "bewohner", userData: { _tierBaum: {}, _menge: true }, parent: sc };
    // ein Teil des Leibs L: mit Stoff-Klasse unter dem Kopf-Knoten, ohne sie am Rumpf
    const KK = (L, k) => A.prototype._kopfKlasse.call(weltVon(A, s13), { userData: { __klasse: k }, parent: k ? { name: "head", parent: L } : L, geometry: { attributes: {} } }).join(" "); // prettier-ignore
    t(
        "Täter-Klasse: tier:wolf · fscatter:eiche:L1 · UNBENANNT unter der Region · spieler · voxelChunk · p2p-spieler · " +
            "leer:fscatter:blume:L0 (Gruppe ohne lebende Instanz) · bewohner (Kopf-Klasse)",
        KK(bew, "hair") === "bewohner bewohner:kopf/hair" &&
            KK(bew) === "bewohner bewohner:leib/stoff" &&
            KK(spieler, "hair") === "spieler spieler:kopf/hair" &&
            S.klasse(leer, s13leer) === "leer:fscatter:blume:L0" &&
            [[tierM, "tier:wolf"], [inst, "fscatter:eiche:L1"], [ohne, "UNBENANNT:Mesh"], [chunk, "voxelChunk"], [p2p, "p2p-spieler"], [leer, "fscatter:blume:L0"]].every(([o, k]) => S.klasse(o, s13) === k) // prettier-ignore
    );

    // S14 — eine FREIE Klasse (Weltzustand: Tiere) trägt keine Ratsche: über jeder Zahl nie rot, die Summen-Ratsche
    // zählt sie nicht, der Nachzug setzt sie nicht; ein Grund ohne Gate und ein Wert an der freien Klasse sind rot.
    const r14 = jsonKlon(rt);
    r14.frei = { tier: "Weltzustand — Kosten je Tier hält gate:kreatur-kosten" };
    r14.gesamt.befehle = 4;
    const z14 = [
        zensusZeile("bodenSatz", 4, 40),
        { klasse: "tier:baer", stufe: null, art: null, je: { haupt: 40, k0: 40 }, jeTris: { haupt: 9e4 } },
    ];
    const u14 = urteil(z14, r14);
    const n14 = BAND.ratscheNachziehen(r14, u14, { datum: "selbsttest", eingeschwungen: true });
    const r14b = jsonKlon(r14);
    r14b.frei.tier = "Weltzustand";
    const r14c = jsonKlon(r14);
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
            zensus: [zensusZeile("f:griechisch:L2", 42, 900, 2, "haus")],
            vram: { mb: 230, liste: [{ k: "tex:output rgba16float 1920x1080x1", mb: 15.8, n: 1 }] },
        },
        {
            zensus: [zensusZeile("bodenSatz", 6, 760)],
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
    const r18 = jsonKlon(rt);
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
    const rzOhne = jsonKlon(haushalt);
    delete rzOhne.renderZiele;
    const rzRot = rzVorher.rot.find((x) => x.art === "renderziele");
    t(
        "Render-Ziele: der Kopf 45f1eeae (71.4 MB) ROT über dem Haushalt 60 MB, jeder Erzeuger beim Namen, Karten und Puffer nicht; die Hochskalierung (58.6 MB) hält; ohne Haushalt fällt das Schema",
        rzRot &&
            /Render-Ziele 71\.4 MB über ihrem Haushalt 60 MB/.test(rzRot.text) &&
            [
                "tex:TRAANode.history 19.8",
                "tex:TRAANode.resolve 15.8",
                "tex:output 7.9",
                "tex:depth 7.9",
                "tex:szene 4",
                "tex:kaskade0 8",
                "tex:kaskade1 8",
            ].every((n) => rzRot.text.includes(n)) &&
            !/karte-albedo|buf:szene/.test(rzRot.text) &&
            rzVorher.urteil === "ROT" &&
            !rzNachher.rot.some((x) => x.art === "renderziele") &&
            rzNachher.vram.renderZiele.mb === 58.6 &&
            BAND.haushaltPruefen(rzOhne).fehler.some((f) => /renderZiele braucht/.test(f))
    );
    // … und `nur: "vram"` (ein Schnitt, der nur den Speicher bewegt) lässt die Klassen-Zeilen und ihre Serie stehen.
    const r18b = jsonKlon(r18);
    r18b.klassen.boden.haupt.befehle = 10;
    r18b.gemessen = { datum: "klassen-serie", eingeschwungen: true };
    const u18b = urteil([zensusZeile("bodenSatz", 7, 7000)], r18b, {
        mb: 100,
        liste: [{ k: "buf:szene:bodenSatz", mb: 21, n: 6 }],
    });
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
    const r19 = jsonKlon(rt);
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
        const h = jsonKlon(haushalt);
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
    const r21 = jsonKlon(rt);
    r21.klassen.bau.haupt.befehle = 20;
    const bauGenesis = [zensusZeile("f:kathedrale:L0", 30, 9000, 0, "gate")];
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
            {
                klasse: "f:drachentor:L0",
                stufe: 0,
                art: "gate",
                je: { haupt: 52 },
                jeTris: { haupt: 368000 },
                inst: 52,
                exemplare: 2,
            },
            {
                klasse: "f:drachentor:L1",
                stufe: 1,
                art: "gate",
                je: { haupt: 26 },
                jeTris: { haupt: 9e5 },
                inst: 26,
                exemplare: 1,
            },
            {
                klasse: "f:gt:L0",
                stufe: 0,
                art: "vehicle",
                je: { haupt: 12 },
                jeTris: { haupt: 3e4 },
                inst: 12,
                exemplare: 1,
            },
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
        const h = jsonKlon(haushalt);
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
    const h23c = jsonKlon(haushalt);
    h23c.messorte[1].anker = "36 0";
    t(
        "Messorte: ein Anker ohne Methoden-Namen bricht das Schema, der echte ist _genesisMitte",
        BAND.messortePruefen(h23c).some((x) => /anker ist kein Methoden-Name/.test(x)) &&
            haushalt.messorte[1].anker === "_genesisMitte"
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
            !BAND.ortGestellt(
                gen.ort,
                { ort: "genesis", dorfZug: false, ortTakt: gen.ort.ortTakt, gier: -Math.PI / 2, sicht: "third" },
                "third"
            ).length &&
            g24(wiese, { sicht: "third" }).length === 0 &&
            /Sicht third, verlangt ego/.test(
                BAND.ortGestellt(wiese, Object.assign({}, gestellt, { sicht: "third" }), "ego")[0]
            ) &&
            /keine Sicht aufgezeichnet/.test(g24(wiese, { sicht: undefined })[0]) &&
            g24(wiese, { dorfZug: true }).length === 1 &&
            /Dorf-Zug/.test(g24(wiese, { dorfZug: true })[0]) &&
            g24(wiese, { ort: null }).length === 1 &&
            g24(wiese, { gier: -0.88 }).length === 1 &&
            /Gier/.test(g24(wiese, { gier: -0.88 })[0]) &&
            BAND.ortGestellt(gen.ort, { ort: "genesis", dorfZug: false, ortTakt: [], gier: -Math.PI / 2, sicht: "ego" })
                .length === 1 &&
            BAND.ortGestellt(wiese, undefined).length === 1
    );

    // S25 — die Projektion (P): die Ist-Projektion von V18.536 (Golden-Dreiecke des Zensus `vorher`) liegt über dem
    // Haushalt baum und wird rot; dieselbe Wiese mit dem Soll je Instanz (L0 7 000 · L1 2 300 · Wurf 1 000) bleibt
    // grün; eine Zensus-Zeile ohne Golden-Dreiecke wird beim Namen genannt.
    const zs = jsonLesen(ZENSUS);
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
    const r26 = jsonKlon(rt);
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
        'Satz-Inhalt: bauSatz k0 über der Ratsche nennt „bauSatz k0: f:feuerstelle:L1 29 Zellen = 12 760", die Tabelle den Inhalt',
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
    const ein26 = new Map([
        [
            key26,
            new Map([
                [0, 7],
                [1, 8],
                [2, 9],
            ]),
        ],
    ]);
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
                {
                    klasse: "f:feuerstelle:L1",
                    stufe: 1,
                    art: "ausstattung",
                    zellen: 29,
                    tris: 12760,
                    eintraege: [1, 2],
                },
            ],
        },
    };
    const s27 = BAND.ortSoll(dorf, { klassen: [satz27] });
    const haus27 = s27.find((x) => x.name === "Haus-Wurf" && /k0/.test(x.klasse));
    const h27 = (f) => {
        const h = jsonKlon(haushalt);
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
    // Siedlung halten die Welt offen, eine ruhige Welt meldet nichts; ein Plan, dessen Takt ruht (`_dorfTaktLebt` false: der
    // Messort ohne Dorf-Zug), wächst nie und hält nicht offen — derselbe Plan mit lebendem und mit ruhendem Takt. Und auf den
    // SATZ, DER NOCH SCHRUMPFT (1310-1): ein Satz über seinem Ziel (`ueberSeit` ≥ 0) hält offen, ein ruhender (-1) nicht.
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
    const dorf28 = [true, false].map(
        (lebt) =>
            BAND.einschwingOffen(
                welt28({ _autoSettlementQueue: { plan: { slots: [1, 2, 3] }, idx: 1 }, _dorfTaktLebt: () => lebt })
            ).dorfWaechst
    );
    t(
        "Einschwingen: eine wachsende Siedlung (1/3), ein Export unterwegs und zwei Lieferungen vor dem Ingest-Takt halten offen, derselbe Plan ohne Takt und die ruhige Welt nicht",
        dorf28.join() === "1/3," &&
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
    const rtLeer = jsonKlon(rtW);
    rtLeer.klassen[nwB.klasse].haupt.dreiecke = null;
    const nwOhne = gestaltWand(haushalt, rtLeer, nwB, zs.ort, nwT);
    t(
        `Projektion nahWiese: die Mess-Wiese (${nwEcht.summe} Dreiecke) liegt unter der Ratsche ${nwEcht.soll}, die doppelte Wiese (${nwMax.summe}) wird rot, eine Gestalt ohne Golden und eine Ratsche ohne Wert beim Namen`,
        nwEcht.errs.length === 0 &&
            nwMax.errs.some((x) => /> Ratsche/.test(x)) &&
            nwFremd.errs.some((x) => /Gestalt 99 L1 ohne Golden-Dreiecke/.test(x)) &&
            nwOhne.errs.some((x) => /keine Dreiecke/.test(x))
    );

    // S30 — DIE ZEICHEN-REIHE (H7) an der echten Klasse: der Stamm hält sie; mit @global hinter den Regionen, ohne die Reihe, ohne
    // die Folge der losen Opaken im Renderer, mit dem Boden vor dem Bau, verkehrt, ohne die Reihe im Bündel, ohne den Abstand
    // und mit einem Anker, der jeden Frame stellt, wird die Wand rot (je der veränderte Stamm als Klasse geladen).
    {
        const st = st8;
        const fall = [
            [
                "@global hinten",
                "_zeichenRang",
                'u.regionKey === "@global" ? 0 : 1',
                'u.regionKey === "@global" ? 2 : 1',
                /Reihe der Bündel nach der Ankunft/,
            ],
            ["ohne Reihe", null, /(\n {4}_buendelReihe)\(/, "$1Alt(", /hängt an der Ankunft/],
            [
                "ohne Folge",
                "_configureRenderer",
                "else renderer.setOpaqueSort(AnazhRealm._zeichenFolge);",
                "",
                /setOpaqueSort/,
            ],
            [
                "Boden vorn",
                "_zeichenRang",
                'return s === "boden" ? 4 :',
                'return s === "boden" ? 2 :',
                /losen Opaken nach der Ankunft/,
            ],
            [
                "verkehrt",
                "_buendelKinderReihe",
                "rang(a) - rang(b) ||",
                "rang(b) - rang(a) ||",
                /Reihe im Bündel nach der Ankunft/,
            ],
            ["ohne Reihe im Bündel", null, /(\n {4}static _buendelKinderReihe)\(/, "$1Alt(", /in der Ankunft/],
            [
                "ohne Abstand",
                "_buendelKinderReihe",
                "(auge ? nah.get(a) - nah.get(b) : 0) ||",
                "0 ||",
                /Reihe nach Abstand/,
            ],
            [
                "je Frame",
                "_buendelAnkerPruefen",
                "if (a && (pos.x - a.x) * (pos.x - a.x) + (pos.z - a.z) * (pos.z - a.z) <= R * R) return false;",
                "",
                /Anker der Reihe/,
            ],
        ];
        const still = fall.filter(
            ([, glied, alt, neu, re]) =>
                !buendelReiheWand(klasseVon(stammLib.ersetze(st, glied, alt, neu))).errs.some((x) => re.test(x))
        );
        t(
            "Zeichen-Reihe: @global · Regionen, lose Bau · Boden · Fern · Himmel, im Bündel L0 zuerst und vorn zuerst; " +
                fall.map(([n]) => n).join(", ") +
                " rot" +
                (still.length ? " — still: " + still.map(([n]) => n).join(", ") : ""),
            buendelReiheWand(A).errs.length === 0 && !still.length
        );
        // S31 — DIE FERNE (P-Ferne): das Gesetz hält Lücke, Schirm, Gestalt und Größe; je Glied ein Mutant, der genau seinen Teil
        // rot macht — die halbe Lücke, die Kappe über dem Schirm (2,5×), die Streckung kehrt ins Gesetz zurück, die Größe verliert
        // ihren Höchstwert, die halbe Größe reißt die Deckung, die Grenze reist wieder in der Matrix, der Block trägt die Ebene eines
        // anderen Büschels (der veränderte Stamm als Klasse geladen)
        const stillF = [
            ["Lücke halb", "_wieseFern", "A.k(NW.radius)", "A.k(NW.radius * 0.5)", (r) => r.luecke < 0.99],
            [
                "Kappe 2,5×",
                "_wieseFern",
                "A.min(offen, kappe)",
                "A.min(offen, A.mul(kappe, A.k(2.5)))",
                (r) => r.schirm > 2,
            ],
            ["Streckung", "_wieseFern", "return { anteil:", "return { streck: A.k(14), anteil:", (r) => r.verformt.includes("streck")], // prettier-ignore
            ["Größe ohne Höchstwert", "_wieseFern", "A.min(A.k(F.skalaMax), A.sqrt(", "A.min(A.k(F.skalaMax * 4), A.sqrt(", (r) => r.gross > 2.5], // prettier-ignore
            ["Größe halb", "_wieseFern", "A.mul(offen, A.pow(kappe, A.k(-1)))", "A.mul(A.k(0.5), A.mul(offen, A.pow(kappe, A.k(-1))))", (r) => r.deckung < 0.99], // prettier-ignore
            ["Grenze in der Matrix", "_nahWieseFernBlock", ".elements, n * 16)", ".elements.map((x, e) => (e === 3 ? 2 : x)), n * 16)", (r) => /vierte Zeile 2/.test(r.affin)], // prettier-ignore
            ["Ebene eines anderen Büschels", "_nahWieseFernBlock", "k.hang.subarray(i * 2, i * 2 + 2)", "k.hang.subarray(n * 2, n * 2 + 2)", (r) => /Ebene des Gesetzes 0.5 0.5/.test(r.affin)], // prettier-ignore
        ].filter(([, g, a, b, rot]) => {
            const r = ferneWand(klasseVon(stammLib.ersetze(st, g, a, b)));
            return !(r.errs.length && rot(r));
        });
        t(`Ferne der Wiese: das Gesetz hält, je Glied ein Mutant rot ${ferneWand(A).errs}${stillF.map((m) => " — still " + m[0])}`, !ferneWand(A).errs.length && !stillF.length); // prettier-ignore
        // die Ordnung ohne den Bayer-Rang der Zelle (die PCG allein, bis w19-saum-lai) reißt das Teil-Gitter
        // P-Fächer: der Fächer hält; der RING (jede Kachel im Fächer) macht „hinter dem Auge“ rot, der Saum ohne Dreh-Rate die Drehung
        const fRing = faecherWand(
            klasseVon(stammLib.ersetze(st, "_imFaecher", "if (!E) return true;", "return true;"))
        );
        const fSaum = faecherWand(
            klasseVon(stammLib.ersetze(st, "_wieseFaecher", "F.rate * FA.vorlaufS", "0 * FA.vorlaufS"))
        );
        const fJedes = faecherWand(
            klasseVon(stammLib.ersetze(st, "_wieseFaecher", "if (!F.neu) return F;", "F.neu = true;"))
        );
        t(`Fächer der Wiese: ${faecherWand(A).zeile}; der Ring rot (hinter dem Auge ${fRing.hinten}), der Saum ohne Dreh-Rate rot (Drehung ${fSaum.dreh} von ${fSaum.ring}), „jedes Bild“ rot (Neuberechnungen je 100 Bilder im Stand ${fJedes.imStand})`, !faecherWand(A).errs.length && fRing.hinten > 0 && fSaum.dreh < fSaum.ring && fJedes.errs.length > 0 && fJedes.imStand > 0); // prettier-ignore
        t("Teil-Gitter der Ferne: die PCG allein reißt", ferneWand(klasseVon(stammLib.ersetze(st, "_ortZiehung", "if (!(schritt > 0)) return", "return"))).errs.length); // prettier-ignore
        t("Rang der Zelle: das Wort über dem Rang reißt", ferneWand(klasseVon(stammLib.ersetze(st, "_ortRang", "h = W.shr(h, 8);", "h = W.shr(h, 0);"))).errs.some((e) => /Rang-Brüche [1-9]/.test(e))); // prettier-ignore
    }

    // S31 — H2b DIE FRISCHE an der Gegenprobe 1110-12 (spec/profiband/probe-1110-12.json): die Ratsche der Mess-Wiese,
    // wie sie w2B auf der GTX richtete (ohne Version), ist ROT — ohne Version, mit fremder
    // Messung, mit einer Gesamt-Zeile über der Summe der Klassen und gegen w2B zu weit (baum haupt 385 630 gegen 60 976).
    {
        const probe = jsonLesen("spec/profiband/probe-1110-12.json");
        const w2B = probe.boots.w2B.schritte.find((x) => x.name === "band").ergebnis.messung;
        const slot = (r, z) =>
            Object.assign({ ort: "wiese", geraet: "gtx", sicht: "ego", datei: "probe", ratsche: r }, z);
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
        const alt2 = jsonKlon(frisch);
        alt2.gemessen.version = "18.541.0";
        const fremd = jsonKlon(frisch);
        fremd.gemessen.geraet = "radeon";
        const ungemessen = jsonKlon(frisch);
        ungemessen.gemessen = null;
        t(
            "H2b: die Ratsche der Mess-Wiese, wie sie 1110-12 richtete, ist ROT — ohne Version, fremde Messung, Gesamt-Zeile " +
                "4 095 487 über 1 295 324, baum haupt 385 630 gegen 60 976 zu weit; die Hülle von w2B an V18.542 grün, an V18.541 " +
                "alt, mit fremdem Gerät, ungemessen und fehlend rot; eine Messung ohne geforderte Ratsche rot",
            alt31.some((x) => /ohne Version — älter als jede Version/.test(x)) &&
                alt31.some((x) => /trägt die Messung \? × Radeon 890M/.test(x)) &&
                alt31.some((x) =>
                    /Gesamt-Zeile dreiecke 4095487 liegt über der Summe der Klassen 1295324 — sie feuert nie/.test(x)
                ) &&
                alt31.some((x) =>
                    /baum haupt dreiecke: Ratsche 385630 über der Messung 60976 — zu weit \(w2B\)/.test(x)
                ) &&
                fr(frisch, "18.543.0", [{ quelle: "w2B", ort: "wiese", geraet: "gtx", sicht: "ego", u: w2B }])
                    .length === 0 &&
                fr(alt2).some((x) =>
                    /gemessen an V18\.541\.0, der Kopf ist V18\.543\.0 — älter als eine Version/.test(x)
                ) &&
                fr(fremd).some((x) => /trägt die Messung wiese × radeon × ego/.test(x)) &&
                fr(ungemessen).some((x) => /ungemessen/.test(x)) &&
                fr(null).some((x) => /fehlt — ungemessen/.test(x)) &&
                fr(frisch, "18.543.0", [{ quelle: "x", ort: "wiese", geraet: "gtx", sicht: "third", u: w2B }]).some(
                    (x) => /keine geforderte Ratsche richtet wiese × gtx × third/.test(x)
                )
        );
        // Der Re-Mint hebt, der Nachzug nie; das Band-Urteil ohne gemessene Ratsche nennt sie `ungemessen`, eine zu weite
        // Ratsche `weit` — beide sperren den Nachzug nicht (die Linse bleibt sauber), der Leser der Messfolge liest sie.
        const r31 = jsonKlon(rt);
        r31.gemessen = { datum: "selbsttest", eingeschwungen: true };
        r31.klassen.boden.haupt = { befehle: 7, dreiecke: 70000 };
        const boden9 = [zensusZeile("bodenSatz", 10, 7000, 0)];
        const u31 = BAND.bandUrteil({ zensus: { klassen: boden9 }, haushalt, ratsche: r31 });
        const nach31 = BAND.ratscheNachziehen(r31, u31, { datum: "x" }).ratsche;
        const neu31 = BAND.ratscheNachziehen(BAND.ratscheNeu(r31), u31, { datum: "x" }).ratsche;
        const ohne31 = BAND.bandUrteil({
            zensus: { klassen: boden9 },
            haushalt,
            ratsche: null,
            ratscheDatei: "ratsche-wiese-gtx-third.json",
        });
        t(
            "Re-Mint: boden haupt 7 → 10 Befehle (der Nachzug hält 7), 70 000 → 7 000 Dreiecke; 70 000 gegen 7 000 ist weit, die " +
                'Linse bleibt sauber; ohne Ratsche „ungemessen" beim Datei-Namen; jede Rot-Zeile trägt ihren Schlüssel',
            nach31.klassen.boden.haupt.befehle === 7 &&
                neu31.klassen.boden.haupt.befehle === 10 &&
                neu31.klassen.boden.haupt.dreiecke === 7000 &&
                neu31.klassen.baum.haupt.befehle === 0 &&
                u31.rot.some((x) => x.art === "weit" && x.schluessel === "weit:boden:haupt:dreiecke") &&
                u31.rot.some(
                    (x) => x.art === "ratsche" && x.schluessel === "ratsche:boden:haupt:befehle" && x.ist === 10
                ) &&
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
            vram: {
                gebunden: 10,
                mb: 10,
                erzeuger: [
                    { erzeuger: "buf:szene", mb: a },
                    { erzeuger: "tex:output", mb: b },
                ],
            },
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
        const hAlt = jsonKlon(haushalt);
        hAlt.geraet = "Radeon 890M";
        const hKam = jsonKlon(haushalt);
        hKam.sichten.third.kamera = "drohne";
        t(
            "Gerät × Sicht: amd rdna-3 → radeon, nvidia pascal → gtx, SwiftShader → keins; first → ego, third → third; " +
                'geraet (EIN Gerät) und eine Kamera „drohne" brechen den Haushalt',
            BAND.geraetSchluessel(haushalt, "amd rdna-3 AMD Radeon 890M Graphics") === "radeon" &&
                BAND.geraetSchluessel(haushalt, "nvidia pascal") === "gtx" &&
                BAND.geraetSchluessel(haushalt, "google swiftshader") === null &&
                BAND.sichtSchluessel(haushalt, "first") === "ego" &&
                BAND.sichtSchluessel(haushalt, "third") === "third" &&
                BAND.haushaltPruefen(hAlt).fehler.some((x) =>
                    /geraet \(EIN Gerät für jede Ratsche\) ist abgelöst/.test(x)
                ) &&
                BAND.haushaltPruefen(hKam).fehler.some((x) => /sichten\.third: titel und kamera/.test(x)) &&
                BAND.ratschenAlle(haushalt).length === 12
        );
    }
    // DER GANG (K5, `werkbank puffer --gang`): ein ungedeckelter Cache ist rot beim Pfad, ein gedeckelter nicht
    t("Gang: Heap je Minute und VRAM-Drift urteilen, der Halter steht beim Pfad", DZ.gangSelbsttest().length === 0);
    // DER WEG (Preis des Orts, Schnitt 2): je Naht ein Mutant (Render-Objekt · Saat · Bauer) ist rot beim Pfad, der geräumte Weg nicht
    t("Weg: der Speicher folgt dem Blick — N1 · N2 · N3 rot beim Pfad ihres Halters", DZ.wegSelbsttest().length === 0);
    // DIE RUNDE (`werkbank runde`): ein Zell-Gedächtnis, das je Runde wächst, und eine nie entsorgte Geometrie sind rot beim Namen
    t(
        "Runde: Behälter mit Anlage, Geometrie mit Geburts-Stelle, Zell-Gedächtnis außerhalb des Blicks und unangemeldetes rot beim Namen, die geräumte Runde grün",
        DZ.rundenSelbsttest().length === 0
    );
    // DER JS-HEAP DER RUNDE (`heapBesteller`): ein Leib, der je Runde lebende Bytes bestellt, ist rot beim Besteller und bei der Stelle
    t("Runde: der JS-Heap-Zuwachs steht beim Besteller (Datei:Zeile) und der Stelle, ein voll gelaufener Cache grün, Splitter benannt", DZ.jsHeapSelbsttest().length === 0); // prettier-ignore
    // DER CACHE UND SEINE LESER (H16): die Rückgabe ohne Takt-Marke (der Körper wartet wie ein Leser die Wiederkehr) ist rot
    // beim ungehaltenen Eintrag, die Rückgabe, die im selben Takt fällt, rot beim Umbau, die Gnade EINER Hülle für den Leser
    // ohne Senke (die Neubau-Welle des Start-Dorfs) rot bei seiner Wiederkehr, der Stamm grün
    const l16Marke = leserWand(klasseVon(stammLib.ersetze(st8, "_foundryLoslassen", "src._losTakt = this.state.weltTakt | 0;", ""))); // prettier-ignore
    const l16Frueh = leserWand(klasseVon(stammLib.ersetze(st8, "_foundryOhneLeser", "takt > v._losTakt", "takt >= v._losTakt"))); // prettier-ignore
    const l16Kurz = leserWand(klasseVon(stammLib.ersetze(st8, "_foundryOhneLeser", "(AnazhRealm.ARCH_LEER_GNADE_MS * AnazhRealm.ARCH_LEER_MINT_DECKEL) / 1000", "AnazhRealm.ARCH_LEER_GNADE_MS / 1000"))); // prettier-ignore
    const l16Bau = leserWand(klasseVon(stammLib.ersetze(st8, "_foundryOhneLeser", "v._liveRefs > 0) continue;", "v._liveRefs > 0 || v._ruheSeit === jetzt) continue;"))); // prettier-ignore
    t("Cache und Leser: ohne Takt-Marke rot beim ungehaltenen Eintrag, die Rückgabe im selben Takt rot beim Umbau, die Gnade einer Hülle rot bei der Wiederkehr des Lesers, der eben gebaute ohne Frist rot nach seinem Bau, der Stamm grün", l16Marke.errs.some((e) => /ungehaltener Foundry-Eintrag nach dem Leser/.test(e)) && l16Frueh.errs.some((e) => /fiel im Takt seiner Rückgabe/.test(e)) && l16Kurz.errs.some((e) => /in der Wiederkehr seines Lesers/.test(e)) && l16Bau.errs.some((e) => /nach seinem Bau/.test(e)) && !leserWand(klasseVon()).errs.length); // prettier-ignore
    // DER FERNE ORT (H17): ohne den Fall (der Takt nimmt keinen Bau, oder der Bauer ruft ihn nicht) rot bei den fünf Bauten, der
    // Fall mit dem Grund rot beim Grund, die Masse als Abbau rot bei ihr, der Fall über ein Bild rot beim Bild, ohne Heben rot beim
    // Zug, der Stamm grün
    const o17 = (e, bild) => ortFallWand(klasseVon(stammLib.ersetze(st8, e)), bild).errs.join(" ");
    t("Ferne Ort: ohne Fall rot bei fünf Bauten, Grund, Masse, Bild und Heben rot beim Namen, der Stamm grün", [
        [[["_ortAbschiedTakt", "this.removeArchitecture(F.liste[F.i++], { still: true, gedaechtnis: true });", "F.i++;"]], false, /hält 5 Bauten \(Soll 0\)/],
        [[["_tickAutoSettlement", "this._ortAbschiedTakt(playerPos);", ""]], false, /hält 5 Bauten \(Soll 0\)/],
        [[["removeArchitecture", "if (!gedaechtnis) this._erdbauGrundFaellt(entry);", "this._erdbauGrundFaellt(entry);"]], false, /nahm den Grund \(5×\)/],
        [[["_stadtMasseRegt", 'if (art === "weg" && entry._insGedaechtnis) {', "if (false) {"]], false, /H17 _stadtMasseRegt: .*an 0, gebunden 1/],
        [[["_ortFallUrteil", "bild ? A.fallBandM : h + A.hebM", "h + A.hebM"]], true, /ein Bau mit Bild fiel — 5 von 5/],
        [[["_ortAbschiedTakt", "this._ortHeben(", "void ("]], false, /hebt 0 von 3 Slots/],
    ].every(([e, bild, re]) => re.test(o17(e, bild))) && !ortFallWand(klasseVon()).errs.length && !ortFallWand(klasseVon(), true).errs.length); // prettier-ignore
    // DAS SOLL DES TURMS (H9): der Kern, dessen Gedächtnis je Auftrag lebt (frisch geladen vor jedem Auftrag — der Stand vor
    // hochhaus-dach-speicher), ist rot bei sollTon; der Kern grün
    const sollRot = sollWand(true);
    const sollGruen = sollWand();
    t("Soll des Turms: die Stufe 0 je Auftrag ist rot bei sollTon, je Bau einmal grün", /^H9 sollTon: /.test(sollRot.errs[0] || "") && !sollGruen.errs.length); // prettier-ignore
    // DIE FERNE SIEDLUNG (H10): der Abschied Feld für Feld (der Stand vor heap-register: die fünf Takt-Felder genullt, `backt` und
    // jedes neue Feld stehen) ist rot beim Pfad, das Register ohne Gedächtnis (es räumt auch den Plan) rot beim Namen, der Stamm grün
    const REGISTER = "for (const k of Object.keys(S)) if (!AnazhRealm.BEWOHNER_ERINNERUNG.includes(k)) delete S[k];";
    const fernRot = fernSiedlungWand(klasseVon(stammLib.ersetze(st8, "_bewohnerFort", REGISTER, "[S.aktivListe, S.aktiv, S.ruhend, S.raster, S.koepfe] = [null, null, null, null, null];"))); // prettier-ignore
    const fernLeer = fernSiedlungWand(klasseVon(stammLib.ersetze(st8, "_bewohnerFort", REGISTER, "for (const k of Object.keys(S)) delete S[k];"))); // prettier-ignore
    t("Ferne Siedlung: der Abschied Feld für Feld ist rot bei backt und zukunft, ohne Gedächtnis rot beim Plan, der Stamm grün", /^H10 _bewohnerFort: .*S\.backt\[\].*S\.zukunft\.kopf/.test(fernRot.errs[0] || "") && /vergaß ihr Gedächtnis — plan · key/.test(fernLeer.errs.join(" ")) && !fernSiedlungWand(A).errs.length); // prettier-ignore
    // die Takt-Puffer beim Namen (heap-blick-folgt): der Abschied, der drei beim Namen leert (der Stand vor dem Register), ist rot
    // bei `_bewohnerNah`, `_bewohnerHalter` und `_bewohnerWandKand`
    const PUFFER = "for (const k of AnazhRealm.BEWOHNER_TAKT_PUFFER) if (this[k]) this[k].length = 0;";
    const pufRot = fernSiedlungWand(klasseVon(stammLib.ersetze(st8, "_bewohnerFort", PUFFER, "for (const a of [this._bewohnerKoepfe, this._bewohnerBewegt, this._bewohnerNachbarn]) if (a) a.length = 0;"))); // prettier-ignore
    t("Ferne Siedlung: drei Takt-Puffer beim Namen geleert ist rot bei _bewohnerNah, _bewohnerHalter und _bewohnerWandKand", ["_bewohnerNah", "_bewohnerHalter", "_bewohnerWandKand"].every((n) => (pufRot.errs[0] || "").includes("r." + n + "[]"))); // prettier-ignore
    // … und das Register ohne den Verkehr (der Stand vor der Messung an der Wiese nach der Stadt) ist rot bei `_verkehrKandidaten`
    const pufVk = fernSiedlungWand(klasseVon(stammLib.ersetze(st8, "_bewohnerFort", PUFFER, "for (const k of AnazhRealm.BEWOHNER_TAKT_PUFFER) if (this[k] && !k.startsWith(\"_verkehr\")) this[k].length = 0;"))); // prettier-ignore
    t("Ferne Siedlung: das Register ohne den Verkehr ist rot bei _verkehrKandidaten und _verkehrProben", ["_verkehrKandidaten", "_verkehrProben"].every((n) => (pufVk.errs[0] || "").includes("r." + n + "[]"))); // prettier-ignore
    // DIE VORLAGE (H11): die Vorlage ohne Rückgabe (der Stand vor heap-register: sie hält, solange der Bauplan lebt) ist rot
    // beim Halter, die Rückgabe ohne Zählung (der erste Bau nimmt sie mit) rot beim stehenden Bau, der Stamm grün
    const v11Halt = vorlageWand(klasseVon(stammLib.ersetze(st8, "_archMergeLoslassen", "if (--q.nutzer > 0) return;", "return;"))); // prettier-ignore
    const v11Frueh = vorlageWand(klasseVon(stammLib.ersetze(st8, "_archMergeLoslassen", "if (--q.nutzer > 0) return;", "q.nutzer--;"))); // prettier-ignore
    t("Vorlage: ohne Rückgabe rot bei _archMergeCache und dem Vorbacken, ohne Zählung rot am stehenden Bau, der Stamm grün", v11Halt.errs.some((e) => /H11 _archMergeCache: die Vorlage hält/.test(e)) && v11Halt.errs.some((e) => /H11 _tickBlueprintPrebake/.test(e)) && v11Frueh.errs.some((e) => /fiel, während ein Bau aus ihr steht/.test(e)) && !vorlageWand(A).errs.length); // prettier-ignore
    // DER PUFFER DER GPU (H13): das Hochladen mit Kopie (der Stand vor heap-register 2) ist rot bei der CPU-Kopie, der Fall
    // ohne Marke (der Abschied hebt nur die Version) rot beim Neu-Legen, der Stamm grün
    const g13Kopie = gpuEigenWand(klasseVon(stammLib.ersetze(st8, "_sichtZugPuffer", "AnazhRealm._gpuEigen(rend, Z.index, 2);", "rend._attributes.update(Z.index, 2);"))); // prettier-ignore
    const g13Fall = gpuEigenWand(klasseVon(stammLib.ersetze(st8, "_gpuAbschied", 'attr.__gpuEigen = "gefallen";', ""))); // prettier-ignore
    t("Puffer der GPU: mit Kopie rot beim Sicht-Index, der Fall ohne Marke rot beim Neu-Legen, der Stamm grün", g13Kopie.errs.some((e) => /hält nach dem Hochladen seine CPU-Kopie/.test(e)) && g13Fall.errs.some((e) => /legte sich nicht neu/.test(e)) && !gpuEigenWand(A).errs.length); // prettier-ignore
    // DER FLUG (H14): der Kehraus ohne Räumung (der Stand vor heap-register 2: erst der 32. neue Flug räumte) ist rot beim
    // verlassenen Bau, die Räumung ohne Frist rot beim Bau mit Leser, der Stamm grün
    const f14Alt = flugWand(klasseVon(stammLib.ersetze(st8, "_gpuKehraus", "this._knotenFlugRaeumen(this._erstZeichnung, rend._nodes.nodeFrame.frameId);", ";"))); // prettier-ignore
    const f14Alle = flugWand(klasseVon(stammLib.ersetze(st8, "_knotenFlugRaeumen", "if (bild - x.bild > AnazhRealm.KNOTEN_FLUG_BILDER) E.imFlug.delete(k);", "E.imFlug.delete(k);"))); // prettier-ignore
    // DER SATZ (H15): das Verdichten ohne den geleerten Fall (der Stand vor heap-blick-folgt: jeder Satz wartet die Frist) ist
    // rot beim Bau-Satz, das Verdichten ohne Frist (jeder Satz schrumpft sofort) rot beim pendelnden, der Stamm grün
    const s15Alt = satzBlickWand(klasseVon(stammLib.ersetze(st8, "_chunkSatzVerdichten", "const leert = s.ueberSeit >= 0 && s.vInhalt * V.schwelle < s.ueberStart;", "const leert = false;"))); // prettier-ignore
    const s15Alle = satzBlickWand(klasseVon(stammLib.ersetze(st8, "_chunkSatzVerdichten", "const leert = s.ueberSeit >= 0 && s.vInhalt * V.schwelle < s.ueberStart;", "const leert = s.ueberSeit >= 0;"))); // prettier-ignore
    t("Satz: ohne den geleerten Fall rot beim Bau-Satz, ohne Frist rot beim pendelnden, der Stamm grün", s15Alt.errs.some((e) => /H15 bauSatz: der geleerte Satz hält/.test(e)) && s15Alle.errs.some((e) => /pendelnde Satz schrumpfte/.test(e)) && !satzBlickWand(A).errs.length); // prettier-ignore
    t("Flug: der Kehraus ohne Räumung rot beim verlassenen Bau, die Räumung ohne Frist rot beim Bau mit Leser, der Stamm grün", f14Alt.errs.some((e) => /verlassene Knoten-Bau hält den Flug/.test(e)) && f14Alle.errs.some((e) => /Bau mit Leser fiel/.test(e)) && !flugWand(A).errs.length); // prettier-ignore

    ende("die Band-Wand feuert");
}

function main() {
    if (SELBSTTEST) return selbsttest();
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
    const version = jsonLesen("package.json").version;
    const messungen = [];
    const mi = process.argv.indexOf("--messung");
    for (const d of mi >= 0 ? process.argv.slice(mi + 1).filter((x) => /\.json$/i.test(x)) : []) {
        const j = jsonLesen(path.resolve(d));
        const e = Array.isArray(j.schritte) ? j.schritte.find((x) => x.name === "band") : null;
        const u = e ? e.ergebnis?.messung || null : j;
        const geraet = u?.geraet ? u.geraet.schluessel : null;
        if (!u || !u.ort || !geraet || !u.sicht)
            errs.push(
                `H2b ${path.basename(d)}: keine Band-Messung mit Ort, Gerät und Sicht — sie richtet keine Ratsche`
            );
        else messungen.push({ quelle: path.basename(d), ort: u.ort, geraet, sicht: u.sicht, u });
    }
    for (const f of BAND.ratscheFrische({ haushalt, version, ratschen, messungen })) errs.push("H2b " + f);
    // H8 DER WEG (Preis des Orts, Schnitt 2): eine Posen-Fahrt (`--weg <weg.json>`, je Pose `heapMB`, `halter`) gegen ihre
    // Ratsche (`spec/profiband/weg-<ort>-<gerät>.json`, fällt nur nach unten), den Preis und die Rückkehr
    const wi = process.argv.indexOf("--weg");
    if (wi >= 0) {
        const weg = jsonLesen(path.resolve(process.argv[wi + 1]));
        const ratsche = jsonLesen(path.join(root, "spec", "profiband", weg.ratsche || "weg-wiese-radeon.json"));
        const posen = (weg.posen || weg).map((p) => ({
            pose: p.pose,
            heapMB: p.heapMB != null ? p.heapMB : p.heap_mb,
            halter: p.halter || [],
            min: p.min != null ? p.min : (p.sek || 0) / 60,
        }));
        for (const f of DZ.wegUrteil(posen, ratsche)) errs.push("H8 " + f);
    }
    const sw = sollWand();
    errs.push(...sw.errs);
    console.log(`H9 Soll des Turms ${TURM_SOLL.id}/${TURM_SOLL.ov.storeys}: L2 · L3 · L1 ${sw.summe} Ecken = ${(sw.summe / sw.e0).toFixed(2)} × Stufe 0 (${sw.e0})`); // prettier-ignore
    const A = klasseVon();
    const fs10 = fernSiedlungWand(A);
    errs.push(...fs10.errs);
    console.log(`H10 die ferne Siedlung nach dem Abschied: ${fs10.n} Köpfe erreichbar (Soll 0)`);
    const v11 = vorlageWand(A);
    errs.push(...v11.errs);
    console.log(`H11 die Vorlage des Bauplans: ${v11.merges}× verschmolzen für zwei Bauten und einen Geist, nach dem letzten gefallen (${v11.errs.length ? "ROT" : "grün"})`); // prettier-ignore
    const l16 = leserWand(A);
    errs.push(...l16.errs);
    console.log(`H16 der Foundry-Cache nach dem Leser: ${l16.mb} MB zurückgegebener Körper im Takt danach (Soll 0), ${l16.n} von 5 Körpern bleiben (Soll 2: die gehaltenen) (${l16.errs.length ? "ROT" : "grün"})`); // prettier-ignore
    const o17 = ortFallWand(A);
    const o17b = ortFallWand(A, true);
    errs.push(...o17.errs, ...o17b.errs);
    console.log(`H17 der ferne Ort nach seinem Abschied: ${o17.n} Bauten halten ihn (Soll 0), mit einem Bild im Satz stehen ${o17b.n} von 5 (Soll 5), das nahende Auge hebt ${o17.gehoben} von 3 Slots (${o17.errs.length + o17b.errs.length ? "ROT" : "grün"})`); // prettier-ignore
    const g13 = gpuEigenWand(A);
    errs.push(...g13.errs);
    console.log(`H13 der Sicht-Index der GPU: CPU-Kopie ${g13.mb.toFixed(2)} MB nach dem Hochladen (Soll 0), ${g13.gelegt}× gelegt über Fall und Neu-Legen (${g13.errs.length ? "ROT" : "grün"})`); // prettier-ignore
    const f14 = flugWand(A);
    errs.push(...f14.errs);
    console.log(`H14 der Flug der Knoten-Bauten im Kehraus: ${f14.flug} von 3 bleiben (Soll 2: der verlassene fällt) (${f14.errs.length ? "ROT" : "grün"})`); // prettier-ignore
    const s15 = satzBlickWand(A);
    errs.push(...s15.errs);
    console.log(`H15 der geleerte Bau-Satz mitten in der Frist: ${s15.vKap} Ecken (Soll ${s15.ziel}: er folgt seinem Inhalt) (${s15.errs.length ? "ROT" : "grün"})`); // prettier-ignore
    const tw = taeterWand(A);
    for (const f of tw.errs) errs.push("H4 " + f);
    const br = buendelReiheWand(A);
    for (const f of br.errs) errs.push("H7 " + f);
    // P — die Projektion der Studio-Ausgänge an der Mess-Wiese (Pflicht seit dem Vertrags-Akt: die render-config trägt tree[0].lagen).
    const zs = jsonLesen(ZENSUS);
    const pw = projektionsWand(haushalt, zs, goldenDreiecke(new Set(zs.zeilen.map((z) => z.art))));
    errs.push(...pw.errs);
    console.log(
        `P Projektion ${zs.ort}/${zs.klasse}: ${Math.round(pw.p.summe)} Dreiecke (Haushalt ${pw.soll}; ` +
            Object.entries(pw.p.jePass)
                .map(([p, d]) => `${p} ${Math.round(d)}`)
                .join(" · ") +
            `)`
    );
    // P-Ferne — die Ferne der Nah-Wiese: unverformt, die Lücke des Strahls und der Schirm (vegetation.K1)
    errs.push(...ferneWand(A).errs);
    // P-Fächer — die Nähe der Wiese steht im Kegel des EINEN Auges, nie dahinter (stufe-ein-auge)
    const fw = faecherWand(A);
    errs.push(...fw.errs);
    console.log(`P-Fächer ${fw.zeile}`);
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
        const z = Object.values(r.klassen).flatMap((k) => paesse.flatMap((p) => [k[p].befehle, k[p].dreiecke]));
        return { g: z.filter((v) => v != null).length, f: z.length };
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
            `Messorte ${ortZeile} · H1 Wiese am Gesetz ${wiese.messungen.map((m) => `${m.ort} ${m.x}/${m.z} Hang ${m.hang}° · Krone ${m.krone} · Kranz ${m.kranz} · Horizont ${m.horizont}°`).join("; ")} · H7 die Zeichen-Reihe (Bündel @global · Regionen, lose Bau · Boden · Fern · Himmel) und die Reihe im Bündel (Stufe).`
    );
}

main();
