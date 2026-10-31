#!/usr/bin/env node
// ─────────────────────────────────────────────────────────────────────────
// diag-kollision-bild.cjs — KOLLISION = BILD (Familie koerper-bild): was der Körper anfasst, zeigt das Bild — und was das
// Bild zeigt, trägt (der Blocker-Erzeuger `_populateBlockerAABBs` liest die gezeichnete Gestalt in Welt-Skala).
// Die Wand (Null-Renderer, Foundry an, eine echte Welt): je Werk, das das Studio zeichnet, das BILD = seine Studio-Gestalt (LOD 0,
// die gezeichnete Gestalt, die Instanz-Matrix: Lage, Gier, Welt-Skala × Skala) gegen seine KOLLISION (die Blocker-Boxen, jede
// in ihrem Rahmen — eine gedrehte Box in ihrer obb):
//   (B) BLOCKER OHNE BILD: keine Box ragt seitlich mehr als SEITE_M über das Bild hinaus, oben mehr als max(SEITE_M; OBEN_ANTEIL
//       der Bild-Höhe) — jede Box zählt (das Podest fiel mit dem Erdbau des Orts, K10);
//   (U) BILD OHNE BLOCKER (umgekehrt): ein FESTES Werk (Fels · Haus · Tor · Wagen · Ausstattung) trägt Boxen, ein Baum seinen
//       Stamm (≥ 1 Box); bei Fels, Tor und Wagen (STRENG — ihre Hülle misst die gezeichnete Gestalt: fx.huellen, TOR_HUELLE,
//       exportDrive.huelle) liegt jeder Punkt des Bilds im Körper-Band (0,1–KOERPER_BAND_M über der Basis, wo Spieler, Tier
//       und Wagen anstoßen) höchstens SEITE_M neben einer Box — beim Tor außer der PASSAGE (|x| < rimAx: das Gesetz hält die
//       Öffnung frei, die Flügel öffnen sich vor dem Körper, TUER_GESETZ). Haus und Ausstattung erklärt ihr Gesetzbuch
//       (`__huelle`, die Teile) nicht ganz als fest: ihr Abstand steht als OFFEN mit Zahl und Ort in der Ausgabe, nie im Grün;
//   (K) KOSTEN: kein Blocker-Erzeuger baut eine Studio-Gestalt auf dem Haupt-Thread — jeder `buildInstance` eines Kerns während
//       der Spawns der Exemplare (kaltes Tor-Gedächtnis) ist ein Täter beim Namen (Kern, Rezept);
//   (G) GESTALT: ein Fels wählt für seinen Blocker dieselbe Gestalt, die gezeichnet ist (der Slot des Bilds gegen
//       `_foundryVariantFor` mit der Kern-Zahl `_studioGestaltenKern`);
//   (E) EXEMPLARE: je Klasse eines an der Mess-Wiese gesetzt (Felsturm · Felsbogen · Steinblock · Kiesel · Felsbrocken · Geode ·
//       Formation · GT · jedes der sieben Tore · Haus · Brunnen · Marktstand) — die Zählung prüft jede Klasse, nicht nur, was
//       dort wächst;
//   (T) DER EINGESCHMUGGELTE TÄTER: ein Felsturm bekommt die Spender-Parts (die alte Regel) — (B) MUSS ihn beim Namen nennen;
//   (Q) QUELLE: der Fels-Zweig führt keine Typ-Liste (kein `_var`-Muster), der Parts-Pfad liest die Welt-Skala jedes
//       Studio-Werks (`_studioWeltSkala`; der Hand-Spiegel `STUDIO_WORLD_SCALE` ist gate:altlasten), das Tor liest seine Hülle
//       aus dem Gesetzbuch (`porta:TOR_HUELLE`) und kein Blocker-Erzeuger ruft `buildInstance`;
//   (V) KONTAKT BEIM TEMPO (physik.K2, echter Takt): Fuchs · Wolf · Bär · Riese (GIGANT) im Galopp, der Spieler gehend und im
//       Sprint, der Wagen — das schnellste Spiel-Rezept bei vmax × UEBER_VMAX (Staffel 2; die vmax aus `_vehicleProfile`,
//       gemessen das gefahrene Tempo) — und der Bär, den er stößt, gegen Mauer · Fels · Haus · Baum · Bär, der Fall aus FALL_M —
//       bei 144 · 60 · 30 fps und dem Takt-Deckel: nach jedem Sim-Schritt und jedem Bild Eindringen ≤ EINDRING_M, kein
//       Durchtritt, Spalt ≤ SPALT_M (sonst vakuös); DAS BILD: Wagen und Bär an der Mauer — an jedem Bild, in dem sie anliegen,
//       ihre gezeichneten Ecken (Zeichner-Matrix, Skin) gegen das gezeichnete Mesh der Mauer: Spalt ≤ SPALT_M, Eindringen ≤
//       EINDRING_M; was die Welt nicht trägt, steht OFFEN mit Zahl (die Station physik.K2#2 urteilt), kein Bild ist ROT; das
//       Tempo × 1,2 des Wagens urteilt die Station an der Zeile (vmax und Faktor stehen dort);
//       (T) der Fuchs mit EINEM Schritt je Takt (`LEIB_TEIL` ohne Teil-Schritt) MUSS durch die Mauer;
//   (P) kein Page-Error — der EINE Sammler (welt-boot) macht den Lauf ROT mit Namen.
// `--bild` (physik.K2 Staffel 2, beide Geräte): die Welt zeichnet auf der Karte — das Linsen-Rezept von welt-boot
// (`linsenWebGpuArgs`) nennt seinen Adapter (`[linse-gpu] <Hersteller>/…`), ein Lauf ohne Karte ist ROT (KEINE KARTE); nach dem
// letzten Stoß zeigt EIN Ausgabe-Bild (Lehre 5, Blick-Wahl mit freier Sicht, Lehre 17) Wagen und Bär an der Mauer, je Klasse
// mindestens BILD_PX Pixel (die Klassen-Teilung: dieselbe Pose ohne die Klasse), sonst ROT (NICHT IM BILD);
// KOLLISION_BILD_PNG=<datei> legt das Bild ab. Auf swiftshader (die Cloud) dauert die Ankunft Minuten: die Frist ist 1 h.
// SELBSTTEST (--selftest, ohne Browser, in `npm run check`): ein Befund mit jedem Täter — Blocker ohne Bild, Bild ohne
// Blocker, Baum ohne Stamm, fremde Gestalt, leere Zählung, stumpfer Schmuggel (Fels und Tor), fehlende Klasse, Bau auf dem
// Haupt-Thread, Quelle, Durchtritt, Eindringen, vakuöse und fehlende Tempo-Zeile, stumpfer Tempo-Schmuggel, kein Bild an der
// Mauer, ein Ausgabe-Bild ohne Wagen, ein Bild-Lauf ohne Karte — MUSS rot fallen und ihn beim Namen nennen; der Leib im Bild
// in der Mauer steht OFFEN beim Namen.
//   node scripts/diag-kollision-bild.cjs [--selftest | --bild]   (npm run gate:kollision-bild; Port KOLLISION_BILD_PORT)
// ─────────────────────────────────────────────────────────────────────────
"use strict";

const SEITE_M = 0.3; // die Kapsel des Spielers misst 0,35 m — was weniger daneben steht, fasst kein Körper als Luft an
const OBEN_ANTEIL = 0.02; // oben: 2 % der Bild-Höhe (über einer 40-m-Krone erreicht kein Körper die Spitze)
const KOERPER_BAND_M = 2.5; // Spieler 1,8 m · Bär ~2 m · GT-Dach 1,4 m
const FEST = ["rock", "haus", "gate", "vehicle", "ausstattung"];
const STRENG = ["rock", "gate", "vehicle"]; // die Hülle misst die gezeichnete Gestalt (fx.huellen · TOR_HUELLE · exportDrive)
const PFLICHT_EXEMPLARE = [
    "felsturm",
    "felsbogen",
    "stein_block",
    "kiesel",
    "felsbrocken",
    "kristall_geode",
    "fels_var8",
    "fahrzeug_gt",
    "tor_drachentor",
    "tor_kathedrale",
    "tor_maschine",
    "tor_geisttor",
    "tor_verkalkt",
    "welt_fachwerk",
    "welt_schmiede",
    "haus_alemannisch",
    "brunnen_dorf",
    "marktstand_dorf",
    "laterne_dorf",
];
// (V) DAS SOLL: Eindringen nach dem Takt ≤ PhysX/Unity `defaultContactOffset`, Spalt ≤ die Bild-Probe von physik.K2 — im
// Bild wie im Körper; der Wagen fährt die vmax des schnellsten Spiel-Rezepts × UEBER_VMAX (physik.K2 Staffel 2: die vmax
// liest die Probe aus dem EINEN Fahrzeug-Profil `_vehicleProfile`, der Faktor ist das Soll der Staffel)
const EINDRING_M = 0.01;
const SPALT_M = 0.05;
const UEBER_VMAX = 1.2;
const FALL_M = 60;
const HINDERNISSE = ["mauer", "fels", "haus", "baum", "leib"];
const TAKTE = ["144", "60", "30", "deckel"];
const zeilen = (koerper, kad) => koerper.flatMap((k) => HINDERNISSE.flatMap((h) => kad.map((t) => `${k}|${h}|${t}`)));
const TEMPO_ZEILEN = [
    ...zeilen(["fuchs", "wolf", "baer", "riese", "wagen"], TAKTE),
    ...zeilen(["gehen", "sprint"], ["60", "deckel"]),
    ...TAKTE.map((t) => `gestossen|mauer|${t}`),
    ...["60", "deckel"].map((t) => `fall|boden|${t}`),
];
// die Paare, deren Körper die gezeichnete Mauer erreicht: ihr BILD urteilt mit, an jedem Bild, in dem der Körper anliegt
// (Kollision = Bild, physik.K2 Staffel 2) — je Paar mindestens eines (der Wagen prallt in EINEM Sim-Schritt ab: im Takt-Deckel
// liegt er in keinem Bild an)
// `--bild`: so viele Pixel zeigt jede Klasse des Stoßes (Wagen, Bär) mindestens im Ausgabe-Bild 640×360
const BILD_PX = 400;
const schluessel = (z) => z.koerper + "|" + z.hindernis + "|" + z.kad;

// (V) Das Urteil (rein).
function tempoUrteil(T) {
    if (!T || T.fehler || !Array.isArray(T.zeilen)) return [`LEER: (V) keine Tempo-Probe (${T && T.fehler})`];
    const v = [];
    const je = new Map(T.zeilen.map((z) => [schluessel(z), z]));
    for (const k of TEMPO_ZEILEN) {
        const z = je.get(k);
        if (!z) {
            v.push(`(V) ZEILE FEHLT: ${k}`);
            continue;
        }
        const [wer, b] = [`${z.koerper} ${z.v} m/s @${z.kad} → ${z.wer}`, z.bild];
        if (z.durch) v.push(`(V) DURCHTRITT: ${wer}`);
        else if (!(z.tief <= EINDRING_M)) v.push(`(V) EINDRINGEN: ${wer} — ${z.tief} m`);
        if (!(z.spalt <= SPALT_M)) v.push(`(V) VAKUÖS: ${wer} (Spalt ${z.spalt} m)`);
        if (b && !(b.spalt <= SPALT_M && b.tief <= EINDRING_M))
            v.push(`OFFEN (V) BILD ≠ KOLLISION: ${wer} — im Bild Spalt ${b.spalt} m, Eindringen ${b.tief} m`);
    }
    for (const p of ["wagen|mauer", "gestossen|mauer"])
        if (!T.zeilen.some((z) => z.bild && schluessel(z).startsWith(p))) v.push(`(V) KEIN BILD: ${p}`);
    // `--bild`: der Lauf nennt seine Karte, und das Ausgabe-Bild des Stoßes zeigt Wagen und Bär
    const [{ px = {}, fehler = "" }, karte] = [T.schuss || {}, T.karte || {}];
    if (T.bild && !karte.vendor) v.push(`(V) KEINE KARTE: [linse-gpu] ${karte.fehlt}`);
    for (const k of T.bild ? ["wagen", "gestossen"] : []) if (!(px[k] >= BILD_PX)) v.push(`(V) NICHT IM BILD: ${k} — ${px[k] | 0} px ${fehler}`);
    if (!(T.schmuggel || {}).durch) v.push("LINSE STUMPF: (V) der Fuchs ohne Teil-Schritt blieb vor der Mauer");
    return v;
}

// (Q) die Absenzen der Quelle, je Zeichen ihr Verstoß
const QUELLE = {
    torTafel: "die Tor-Hülle liest nicht `porta:TOR_HUELLE`",
    ohneBau: "ein Blocker-Erzeuger ruft `buildInstance`",
    felsOhneTypListe: "`_felsBlockerParts` trägt eine Typ-Liste (`_var`)",
    partsSkala: "der Parts-Pfad liest `_studioWeltSkala` nicht",
};
// Das Urteil über einen Befund: Liste der Verstöße (leer = grün; OFFEN steht mit Zahl, nie grün gezählt, die Station von
// physik.K2 Staffel 2 urteilt es). Rein, im Selbsttest wie im Lauf.
function urteil(b) {
    const v = [];
    const z = b.zensus || {};
    if (!(z.werke > 0)) v.push("LEER: kein Studio-Werk gezählt");
    for (const t of z.taeter || []) {
        const wo = `${t.wer} bei ${t.ort} — `;
        if (t.art === "blocker") v.push(`(B) BLOCKER OHNE BILD: ${wo}eine Box ragt ${t.mass.toFixed(2)} m ${t.wo} über das Bild`);
        if (t.art === "bild") v.push(`(U) BILD OHNE BLOCKER: ${wo}das Bild steht ${t.mass.toFixed(2)} m neben jeder Box`);
        if (t.art === "stamm") v.push(`(U) BAUM OHNE STAMM: ${wo}keine Box`);
        if (t.art === "gestalt") v.push(`(G) FREMDE GESTALT: ${wo}Bild ${t.bildG}, Blocker ${t.blockG}`);
    }
    const ex = b.exemplare || {};
    for (const k of PFLICHT_EXEMPLARE) if (ex[k] !== true) v.push(`(E) KLASSE FEHLT: ${k} (nicht gezählt)`);
    for (const k of ["schmuggel", "schmuggelTor"]) if (!(b[k] || {}).genannt) v.push(`LINSE STUMPF: (T) ${k} wurde nicht genannt (${(b[k] || {}).wer})`);
    if (!Array.isArray(b.bauten)) v.push("LEER: (K) keine Bau-Zählung");
    for (const t of b.bauten || []) v.push(`(K) DER HAUPT-THREAD BAUT: ${t}`);
    for (const k in QUELLE) if (!(b.quelle || {})[k]) v.push("(Q) QUELLE: " + QUELLE[k]);
    return v.concat(tempoUrteil(b.tempo));
}

function selbsttest() {
    const { taeterFaelle, selbsttestEnde } = require("./lib/welt-boot.cjs");
    const ja = (L) => Object.fromEntries(L.map((k) => [k, true]));
    const gruen = {
        zensus: { werke: 900, taeter: [] },
        exemplare: ja(PFLICHT_EXEMPLARE),
        schmuggel: { genannt: true, wer: "felsturm#4" },
        schmuggelTor: { genannt: true, wer: "welt_fachwerk#9" },
        bauten: [],
        quelle: ja(Object.keys(QUELLE)),
        tempo: {
            zeilen: TEMPO_ZEILEN.map((k) => {
                const [koerper, hindernis, kad] = k.split("|");
                return { koerper, hindernis, kad, v: 5.86, wer: hindernis + "#7", tief: 0, spalt: 0, bild: { spalt: 0, tief: 0 } };
            }),
            schmuggel: { durch: true },
            bild: true,
            karte: { vendor: "google" },
            schuss: { px: { wagen: 5120, gestossen: 2210 } },
        },
    };
    const fehler = urteil(gruen).map((x) => "grün: " + x);
    const klon = () => JSON.parse(JSON.stringify(gruen));
    const Z = (b, k) => b.tempo.zeilen.find((z) => schluessel(z) === k);
    const Zs = (k, o) => (b) => Object.assign(Z(b, k), o);
    const T = (art, o) => (b) => b.zensus.taeter.push({ wer: "felsturm#174", ort: "-913.7/-900.7", art, ...o });
    taeterFaelle(
        [
            [T("blocker", { mass: 16.46, wo: "oben" }), /BLOCKER OHNE BILD: felsturm#174 .*16.46 m oben/],
            [T("bild", { wer: "haus_alemannisch#9", mass: 1.2 }), /BILD OHNE BLOCKER: haus_alemannisch#9 .* 1.20 m neben/],
            [T("stamm", { wer: "baum_eiche#3" }), /BAUM OHNE STAMM: baum_eiche#3/],
            [T("gestalt", { bildG: 3, blockG: 7 }), /FREMDE GESTALT: felsturm#174 .*Bild 3, Blocker 7/],
            [(b) => (b.zensus.werke = 0), /LEER: kein Studio-Werk/],
            [(b) => (b.schmuggel.genannt = false), /STUMPF: \(T\) schmuggel .*felsturm#4/],
            [(b) => (b.schmuggelTor.genannt = false), /STUMPF: \(T\) schmuggelTor .*welt_fachwerk#9/],
            [(b) => delete b.exemplare.felsbogen, /KLASSE FEHLT: felsbogen/],
            [(b) => b.bauten.push("__portaCore.buildInstance(drachentor)"), /BAUT: __portaCore.buildInstance.drachentor/],
            [(b) => delete b.bauten, /LEER: \(K\)/],
            [(b) => (b.quelle.torTafel = false), /QUELLE: die Tor-Hülle/],
            [Zs("fuchs|mauer|deckel", { durch: true }), /DURCHTRITT: fuchs .*@deckel → mauer#7/],
            [Zs("wolf|haus|deckel", { tief: 0.13 }), /EINDRINGEN: wolf .*@deckel → haus#7 — 0.13 m/],
            [Zs("wagen|baum|60", { spalt: 0.8 }), /VAKUÖS: wagen .*baum#7 .*Spalt 0.8/],
            [Zs("gestossen|mauer|60", { bild: { spalt: 0, tief: 0.12 } }), /BILD ≠ KOLLISION: gestossen .*@60/],
            [(b) => (b.tempo.schuss.px.wagen = 0), /NICHT IM BILD: wagen — 0 px/],
            [(b) => (b.tempo.karte = { fehlt: "kein Adapter" }), /KEINE KARTE: .*kein Adapter/],
            [(b) => TAKTE.forEach((t) => delete Z(b, `wagen|mauer|${t}`).bild), /KEIN BILD: wagen.mauer/],
            [(b) => (b.tempo.zeilen = b.tempo.zeilen.filter((z) => z.koerper !== "riese")), /ZEILE FEHLT: riese.mauer.144/],
            [(b) => (b.tempo.schmuggel.durch = false), /LINSE STUMPF: \(V\)/],
            [(b) => delete b.tempo, /LEER: \(V\)/],
        ].map(([tat, muss]) => [muss.source, tat, muss]),
        urteil,
        { fehler, klon }
    );
    selbsttestEnde(fehler);
}

const { statikServer, warteAufWelt, nullSeite, pngDatei, SELBSTTEST } = require("./lib/welt-boot.cjs");

if (SELBSTTEST) {
    console.log("=== KOLLISION = BILD — Selbsttest (ohne Browser) ===");
    selbsttest();
    process.exit(0);
}

const { messort } = require("./lib/welt-orte.cjs");

const PORT = Number(process.env.KOLLISION_BILD_PORT) || 4631;
// `--bild`: die Welt zeichnet auf der Karte — das Linsen-Rezept von welt-boot (`linsenWebGpuArgs`, die Adapter-Zeile
// `[linse-gpu] <Hersteller>/…`), ohne Null-Renderer, das Beweisbild aus dem Ausgabe-Pfad — physik.K2 Staffel 2 auf beiden Geräten
const BILD = process.argv.includes("--bild");
const { AUSGABE_INSTALL } = require("./lib/ausgabe-aufnahme.cjs");
const bildSeite = async (o) => {
    const browser = await require("./lib/welt-boot.cjs").starteBrowser({ art: BILD ? "linse" : "null", viewport: { width: 640, height: 360 }, ...o });
    return { browser, page: await browser.newPage() };
};
const server = statikServer();
// DIE GEOMETRIE, eigen (nie der Löser, den sie richtet; in der Seite global): eine Box im eigenen Rahmen wie `_boxAbstand2`
// (Mitte, Achsen c/s, Halb-Maße), ein Punkt (u, w) längs ihrer Achsen
const rahmen = (b) =>
    b.obb || { cx: (b.minX + b.maxX) / 2, cz: (b.minZ + b.maxZ) / 2, c: 1, s: 0, hx: (b.maxX - b.minX) / 2, hz: (b.maxZ - b.minZ) / 2 };
const lok = (R, x, z) => [(x - R.cx) * R.c - (z - R.cz) * R.s, (x - R.cx) * R.s + (z - R.cz) * R.c];
// der Abstand aus den Abständen je Achse (außen die Länge, innen der größte, negativ) und der Abstand zur Box im eigenen Rahmen
const aussen = (a) => (Math.max(...a) > 0 ? Math.hypot(...a.map((x) => Math.max(x, 0))) : Math.max(...a));
const zuBox = (R, x, z, [u, w] = lok(R, x, z)) => aussen([Math.abs(u) - R.hx, Math.abs(w) - R.hz]);

// Die Zählung im Seiten-Kontext: je Studio-Werk im Umkreis das Bild gegen die Kollision.
async function probe(K) {
    let tMs = performance.now();
    const takt = () => r._gameLoopTick((tMs += 1000 / 60));
    const f = r._ensureAssetFoundry();
    const MW = K.mess; // die Mess-Wiese aus EINER Quelle (spec/profiband/haushalt.json), nie ihre Abschrift
    st.playerMesh.position.set(MW.x, r._voxelSurfaceY(MW.x, MW.z) + 1.8, MW.z);
    // die Welt steht, das Buch ist da (das EINE Einschwingen, welt-boot `__weltStehtNach`; bis D3d 90 s Wanduhr auf das Buch)
    // — auf der Karte wartet jeder Takt bis 100 ms auf die GPU (die Ankunft zählt gezeichnete Bilder, die Fege-Takte zählen Takte:
    // swiftshader zeichnet ein Bild in Sekunden und baut eine Pipeline in Minuten, die Welt braucht ~1100 Takte)
    const q = K.BILD && st.renderer.backend.device.queue;
    await __weltStehtNach(async () => (takt(), q && (await Promise.race([q.onSubmittedWorkDone(), sleep(100)]))));
    const aus = { exemplare: {}, zensus: { werke: 0, taeter: [], max: [0, 0, 0] }, offen: [] };
    // (K) DIE BAUTEN DES HAUPT-THREADS: jeder Kern mit einer Bau-Funktion wird gezählt, solange die Exemplare entstehen
    // (Spawn und Bau-Takte) — mit kaltem Tor-Gedächtnis, wie bei der Ankunft (der Genesis-Ring) und jedem Restore
    const [bauten, rohBau] = [(aus.bauten = []), []];
    for (const ns of Object.keys(globalThis)) {
        const kern = /^__\w+Core$/.test(ns) && globalThis[ns];
        const roh = kern && kern.buildInstance;
        if (typeof roh !== "function") continue;
        rohBau.push([kern, roh]);
        kern.buildInstance = function (id) {
            if (bauten.length < 40) bauten.push(`${ns}.buildInstance(${id})`);
            return roh.apply(this, arguments);
        };
    }
    r._torGesetzMemo = null;
    // (E) DIE EXEMPLARE: je Klasse eines in einer Reihe 30 m südlich der Mess-Wiese (Abstand 9 m)
    const gesetzt = [];
    try {
        K.exemplare.forEach((typ, i) => {
            const [x, z] = [MW.x - 50 + i * 9, MW.z + 30];
            const e =
                st.blueprints[typ] &&
                r.spawnArchitecture(typ, { x, y: r.getTerrainHeightAt(x, z) + 0.5, z }, { silent: true, precise: true, rotationY: 0.6 + i * 0.37 });
            if (e) gesetzt.push([typ, e]);
        });
        // die Exemplare bauen (das Studio liefert die Gestalt, das Haus seine Hülle), danach 240 Takte
        for (let i = 0, ende = 1140; i < ende; i++) {
            takt();
            if (!(i % 4)) await sleep(10);
            if (i > 120 && ende > i + 241 && gesetzt.every(([, e]) => e.instanced || e.mesh || e._bauSatz)) ende = i + 241;
        }
    } finally {
        for (const [kern, roh] of rohBau) kern.buildInstance = roh;
    }
    // DAS BILD einer Gestalt (LOD 0 im Vorlagen-Raum), je Art|Gestalt einmal
    const bildCache = new Map();
    // — auf der Karte gibt erst der Loop-Takt das Ergebnis frei (`_foundryIngestTakt`, headless sofort): die Zählung taktet, bis es da ist
    const bild = async (pr, g, k = pr + "|" + g) => {
        const p = bildCache.get(k) || r._foundryRequest(pr, g, 0, null, 0).then((L) => (L || []).flatMap(({ position: p }) => Array.from((p && p.length ? p : p && p.array) || [])));
        for (let da = bildCache.set(k, p) && 0; !da; ) da = (await Promise.race([p.then(() => 1), sleep(20)])) || (takt(), 0);
        return p;
    };
    const kindVon = (pr) => {
        const rec = (f.recipes || {})[pr];
        return (rec && rec.kind) || (globalThis.__terrainCore.PHYTO_PRESETS[pr] || {}).kind;
    };
    const urteileWerk = async (e, merke) => {
        const pr = r._foundryPresetForEntry(e);
        if (!pr) return null;
        const kind = kindVon(pr);
        const sl = (e.instSlots || []).find((s) => /^f:/.test(s.key));
        let g = sl && +sl.key.split("|")[1];
        // ohne Körper-Slot (die Karte der L2 trägt „fimp:atlas") die Gestalt, die der Wirt zeichnet: der EINE Leser
        // `_foundryGestaltFor` (die Gestalt des Orts, K20) — der rohe Same wählte ohne Ort, und jede dritte Tanne der Karten-
        // Stufe wurde gegen den Solitär gemessen (40 Fehlbefunde, die Spitze der Bestand-Hülle 0,8–2,2 m über ihm)
        if (!Number.isFinite(g)) g = r._foundryGestaltFor(e, pr);
        const pts = Number.isFinite(g) && (await bild(pr, g));
        if (!pts || !pts.length) return null;
        const [wer, ort] = [e.type + "#" + e.id, e.position.x.toFixed(1) + "/" + e.position.z.toFixed(1)];
        const ws = r._foundryWorldScaleMatrix(pr).elements[0] * (e.scale > 0 ? e.scale : 1);
        // die Instanz-Matrix: Gier, Welt-Skala × Skala, Lage (der Fuß 0,5 m unter der Spawn-Höhe)
        const [basis, W] = [e.position.y - 0.5, Float32Array.from(pts)];
        const M = new THREE.Matrix4().makeRotationY(e.rotationY || 0).scale(new THREE.Vector3(ws, ws, ws));
        new THREE.BufferAttribute(W, 3).applyMatrix4(M.setPosition(e.position.x, basis, e.position.z));
        const { min: lo, max: hi } = new THREE.Box3().setFromArray(W);
        const B = e.blockerAABBs || [];
        const funde = [];
        // (G) die Gestalt des Fels-Blockers gegen die gezeichnete
        const gB = kind === "rock" ? r._foundryVariantFor(e.seed, pr, r.constructor._studioGestaltenKern(pr)) : g;
        if (gB !== g) funde.push({ art: "gestalt", wer, ort, bildG: g, blockG: gB });
        if (kind === "tree" && !B.length) funde.push({ art: "stamm", wer, ort });
        // (B) jede Box gegen das Bild in ihrem Rahmen
        let [seite, oben] = [0, 0];
        for (const b of B) {
            const R = rahmen(b);
            let [a0, a1, q0, q1] = [Infinity, -Infinity, Infinity, -Infinity];
            for (let i = 0; i < W.length; i += 3) {
                const [u, w] = lok(R, W[i], W[i + 2]);
                [a0, a1, q0, q1] = [Math.min(a0, u), Math.max(a1, u), Math.min(q0, w), Math.max(q1, w)];
            }
            const [sd, od] = [Math.max(a0 + R.hx, R.hx - a1, q0 + R.hz, R.hz - q1), b.topY - hi.y];
            [seite, oben] = [Math.max(seite, sd), Math.max(oben, od)];
        }
        const quer = seite > K.SEITE_M ? { mass: seite, wo: "seitlich" } : { mass: oben, wo: "oben" };
        if (seite > K.SEITE_M || oben > Math.max(K.SEITE_M, K.OBEN_ANTEIL * (hi.y - lo.y)))
            funde.push({ art: "blocker", wer, ort, ...quer });
        // (U) das Bild im Körper-Band gegen die Boxen (feste Werke). DIE PASSAGE des Tors (|x| < rimAx im Vorlagen-Raum) ist
        // nach dem Gesetz frei — dort öffnen sich die Flügel vor dem Körper (TUER_GESETZ).
        const passage = kind === "gate" ? ((r._torGesetzFor(e) || {}).mu || {}).rimAx : 0;
        let [neben, nebenWo] = [B.length ? 0 : Infinity, null];
        for (let i = 0; K.FEST.includes(kind) && B.length && i < W.length; i += 3) {
            const hy = W[i + 1] - basis;
            if (hy < 0.1 || hy > K.KOERPER_BAND_M || Math.abs(pts[i]) < passage) continue;
            let best = Infinity;
            for (const b of B) {
                const R = rahmen(b);
                const d = Math.hypot(Math.max(zuBox(R, W[i], W[i + 2]), 0), Math.max(b.botY - W[i + 1], W[i + 1] - b.topY, 0));
                if ((best = Math.min(best, d)) === 0) break;
            }
            if (best > neben) [neben, nebenWo] = [best, [pts[i] * ws, pts[i + 1] * ws, pts[i + 2] * ws]];
        }
        // Fels, Tor und Wagen messen ihre Hülle an der gezeichneten Gestalt: das ganze Bild im Band ist gedeckt (das Tor
        // außer der Passage). Haus und Ausstattung erklärt ihr Gesetzbuch (`__huelle`, die Teile) nicht ganz als fest —
        // ihr Abstand ist OFFEN (Zahl und Ort im Werk-Rahmen), nie grün gezählt
        if (!K.FEST.includes(kind)) neben = 0;
        else if (neben === Infinity || (K.STRENG.includes(kind) && neben > K.SEITE_M)) funde.push({ art: "bild", wer, ort, mass: neben });
        else if (merke && neben > K.SEITE_M) {
            const neu = { typ: e.type, kind, wer, mass: +neben.toFixed(2), wo: nebenWo.map((x) => x.toFixed(1)).join("/") };
            const k = aus.offen.findIndex((x) => x.typ === e.type);
            if (!(neu.mass <= (aus.offen[k] || {}).mass)) aus.offen[k < 0 ? aus.offen.length : k] = neu;
        }
        // die Zahl der Zählung: das Größte über alle Werke — Box ohne Bild seitlich/oben, Bild ohne Box der strengen Werke (m)
        const Z = aus.zensus.max;
        if (merke) [seite, oben, K.STRENG.includes(kind) ? neben : 0].forEach((x, j) => (Z[j] = Math.max(Z[j], x)));
        return funde;
    };
    for (const e of st.architectures.slice()) {
        const funde = e && e.position && Math.hypot(e.position.x - MW.x, e.position.z - MW.z) <= K.R && (await urteileWerk(e, true));
        if (!funde) continue;
        aus.zensus.werke++;
        aus.zensus.taeter.push(...funde.slice(0, 40 - aus.zensus.taeter.length));
        const ex = gesetzt.find(([, x]) => x === e);
        if (ex) aus.exemplare[ex[0]] = true;
    }
    // (T) DIE EINGESCHMUGGELTEN TÄTER — die Boxen des Werks für ein Urteil getauscht: (B) MUSS den Felsturm mit den
    // Spender-Parts (die alte Regel, Vorlagen-Maß) beim Namen nennen, (U) das Tor ohne seinen ersten Pfosten (die Ruine — eine
    // Seite trägt den Schutt) außerhalb der Passage (die Strenge des Tors ist nicht vakuös)
    const schmuggel = async (e, boxen, art) => {
        const [alt, wer] = [e.blockerAABBs, e.type + "#" + e.id];
        e.blockerAABBs = boxen;
        r._blockerStampReach(e);
        const funde = (await urteileWerk(e, false)) || [];
        e.blockerAABBs = alt;
        r._blockerStampReach(e);
        return { wer, genannt: funde.some((t) => t.art === art && t.wer === wer) };
    };
    const turm = st.architectures.find((e) => e && e.type === "felsturm" && (e.blockerAABBs || []).length);
    if (turm) aus.schmuggel = await schmuggel(turm, st.blueprints.felsturm.parts.filter((p) => r._isPartSolid(p)).map((p) => r._blockerComputePartAABB(turm, p)), "blocker");
    const exemplar = (t) => (gesetzt.find(([typ]) => typ === t) || [])[1];
    const tor = exemplar("welt_fachwerk");
    if (tor && (tor.blockerAABBs || []).length > 1) aus.schmuggelTor = await schmuggel(tor, tor.blockerAABBs.slice(1), "bild");
    // (Q) DIE QUELLE: der Konsum am Zähl-Spion des Versorgers, während der Erzeuger einmal läuft; die Absenzen kommentarfrei
    const ruft = (lauf, o, k, wer = () => true) => {
        const f = o[k];
        let n = 0;
        o[k] = function (...a) {
            n += wer(...a) ? 1 : 0;
            return f.apply(this, a);
        };
        try {
            lauf();
        } finally {
            delete o[k];
            if (o[k] !== f) o[k] = f;
        }
        return n > 0;
    };
    const baum = st.architectures.find((e) => e && r._foundryPresetIsTree(r._foundryPresetForEntry(e)) && Array.isArray(r._baumGestaltTeile(e)));
    const drache = exemplar("tor_drachentor");
    aus.quelle = {
        felsOhneTypListe: __fehlt(r._felsBlockerParts, /_var/),
        partsSkala: !!baum && ruft(() => r._populateBlockerAABBs(baum), r, "_studioWeltSkala"),
        torTafel: !!drache && ruft(() => r._torBlockerAABBs(drache), r.constructor, "Gesetz", (pfad) => /^porta:TOR_HUELLE\./.test(pfad)),
        // die Erzeuger und ihre Hilfs-Methoden (der Nachbau lag in einer Hilfs-Methode des Tors) — die Liste beim Namen
        ohneBau: __fehlt(
            [
                "_populateBlockerAABBs",
                "_torBlockerAABBs",
                "_felsBlockerParts",
                "_hausBlockerBoxen",
                "_fahrzeugBlockerParts",
                "_baumGestaltTeile",
                "_blockerComputePartAABB",
                "_blockerStampReach",
                "_studioWeltSkala",
            ].map((n) => r[n]),
            /buildInstance|buildGate/
        ),
    };
    return aus;
}

// (V) DER KONTAKT BEIM TEMPO im Seiten-Kontext: die Hindernisse stehen auf der ebenen Achse der Mess-Wiese, die Bahn längs +x.
async function tempo(K) {
    const [st, A, { mess: MW, HINDERNISSE, TAKTE }] = [r.state, r.constructor, K];
    const pm = st.playerMesh;
    const hh = (x, z) => r._voxelSurfaceY(x, z); // der Boden, auf dem die Körper gehen (die Oberkante des Felds)
    const STUFE = A.PLAYER_STEP_UP;
    const KAD = (kad) => (kad === "deckel" ? A.TAKT_DECKEL_S : 1 / kad) * 1000;
    let tMs = performance.now();
    const takt = (ms) => r._gameLoopTick((tMs += ms));
    const tasten = (w, sprint) => Object.assign(st.keys, { w: !!w, shift: !!sprint });
    const aus = { zeilen: [], bild: K.BILD };
    // DER LEBENSZYKLUS RUHT (Ökologie K1/K2): sein Riss und sein Hungertod nahmen der Probe den stehenden Bären, die Mitte ging
    // durch den Leichnam (heim-z29b: fuchs @60 → baer, 0,34 m) — ein Hindernis, das dennoch fällt, nennt der Lauf
    r.tickFaunaLifecycle = () => {};
    // DIE TROCKENHEIT (wie gate:fahr-leben): der erste Takt der Seite zieht das Wort der Front am Ort zur Welt-Uhr (feld.K2#2),
    // an der Mess-Wiese zur Uhr 0 Regen — die Nässe senkt die Haftung am Rad (`_fahrHaft`), der GT bei vmax blieb 0,051 m vor dem
    // Mammut stehen. Das Wort des Spielers hält Sonne, die Nässe steht trocken; die Nässe am Rad misst gate:fahr-leben W.
    r._setWeather("sunny", "human");
    st.weatherTransition = null;
    r._naesseTakt(1e6);
    const weite = (R, ux, uz) => R.hx * Math.abs(R.c * ux - R.s * uz) + R.hz * Math.abs(R.s * ux + R.c * uz);
    // DAS BILD (physik.K2 Staffel 2): jede gezeichnete Ecke eines Körpers — je Instanz-Slot eines Werks mit der Matrix des
    // Zeichners (`_archInstanceUpdate`), sonst jedes sichtbare Mesh (der Leib mit Skin: `getVertexPosition`) — gegen das Mesh
    // der Wand `W` (die Box seiner Geometrie im eigenen Rahmen): der kleinste Abstand, innen negativ
    const V = new THREE.Vector3();
    const bildAbstand = (o, W) => {
        const teile = (o.instSlots || []).map(({ key, slot }) => {
            const [g, M] = [st.archInstanceGroups.get(key).mesh, new THREE.Matrix4()];
            g.getMatrixAt(slot, M);
            return [g, M.premultiply(g.matrixWorld)];
        });
        if (!o.instSlots) o.updateMatrixWorld(true) || o.traverseVisible((m) => m.isMesh && teile.push([m, m.matrixWorld]));
        const [B, I] = [W.geometry.boundingBox, W.matrixWorld.clone().invert()];
        let d = Infinity;
        for (const [m, M] of teile)
            for (let i = 0; i < m.geometry.attributes.position.count; i++) {
                const p = m.getVertexPosition(i, V).applyMatrix4(M).applyMatrix4(I);
                d = Math.min(d, aussen(["x", "y", "z"].map((k) => Math.max(B.min[k] - p[k], p[k] - B.max[k]))));
            }
        return d;
    };
    // DIE KÖRPER: das Tier die drei Kreise seines Leibs, der Spieler seine Kapsel (Sim-Lage), der Wagen der Rahmen seiner Hülle
    const leibKreise = (c) => {
        const [l, p] = [r._kreaturLeib(c, 0, {}), c.position];
        return { l, p, kreise: [-1, 0, 1].map((o) => [p.x + l.fx * o * l.halb, p.z + l.fz * o * l.halb, l.radius]) };
    };
    const tierK = (c) => () => {
        const { l, p, kreise } = leibKreise(c);
        return { mx: p.x, mz: p.z, y0: p.y, y1: p.y + l.hoehe, kreise };
    };
    // die Sim-Lage: im Sim-Schritt trägt sie der Mesh, nach dem Bild `_fixedSimPos` (der Mesh die gezeichnete) — vorher las
    // der Schritt das `_fixedSimPos` des vorigen Bilds, und bei 2–6 Schritten je Bild sah die Probe keinen Aufprall
    let imSchritt = false;
    const simLage = () => (imSchritt || !st._fixedSimPos ? pm.position : st._fixedSimPos);
    const spielerK = () => {
        const [p, F] = [simLage(), A.PLAYER_FOOT_OFFSET];
        return { mx: p.x, mz: p.z, y0: p.y - F, y1: p.y + F, kreise: [[p.x, p.z, A.PLAYER_WALL_RADIUS]] };
    };
    const wagenK = (e) => () => {
        const [p, h, s, c] = [simLage(), r._fahrHuelle(e), Math.sin(e._rideYaw || 0), Math.cos(e._rideYaw || 0)];
        const re = { cx: p.x + s * h.mitte, cz: p.z + c * h.mitte, c, s, hx: h.hw, hz: h.hl, stufe: h.stufe };
        return { mx: re.cx, mz: re.cz, y0: e._fahr.y + h.stufe, y1: e._fahr.y + h.dach, re };
    };
    // DAS EINDRINGEN in eine Box; außer Band −Infinity (die Regeln der Hüllen: die Stufe trägt, der Wagen überrollt Dünneres)
    const inBox = (k, b, R = rahmen(b), h = k.re) => {
        if (h ? !(b.topY > k.y0 && b.botY < k.y1) || b.dick < h.stufe : !(b.topY > k.y0 + STUFE && b.botY < k.y1)) return -Infinity;
        if (!h) return Math.max(...k.kreise.map(([x, z, rr]) => rr - zuBox(R, x, z)));
        const achsen = [R, h].flatMap((Q) => [[Q.c, -Q.s], [Q.s, Q.c]]);
        return Math.min(...achsen.map(([ux, uz]) => weite(R, ux, uz) + weite(h, ux, uz) - Math.abs((h.cx - R.cx) * ux + (h.cz - R.cz) * uz)));
    };
    // DER DURCHTRITT: die Mitte jenseits der Mitte des Ziels `b`, an einer gedrehten WAND jenseits ihrer Mittel-Ebene
    const werkH = (e, b, wand) => {
        const R = rahmen(b);
        const quer = (x, z) => (([u, w]) => (R.hx < R.hz ? [u, w, R.hz] : [w, u, R.hx]))(lok(R, x, z));
        const seite = Math.sign(quer(R.cx - 10, R.cz)[0]);
        const durch = (k, [n, l, h] = quer(k.mx, k.mz)) => (wand ? Math.sign(n) !== seite && Math.abs(l) <= h : k.mx > R.cx);
        return { wer: e.type + "#" + e.id, e, x: R.cx, durch, tiefe: (k) => Math.max(...e.blockerAABBs.map((bb) => inBox(k, bb))) };
    };
    const leibH = (q) => ({
        wer: "baer#" + q.userData.netId,
        durch: (k) => k.mx > q.position.x,
        tiefe: (k) => {
            const { l, p, kreise: [a, , b] } = leibKreise(q);
            if (!(k.y1 > p.y && k.y0 < p.y + l.hoehe)) return -Infinity;
            let t = -Infinity;
            for (let i = 0; i <= 8; i++) {
                const [x, z] = [a[0] + ((b[0] - a[0]) * i) / 8, a[1] + ((b[1] - a[1]) * i) / 8];
                if (k.re) t = Math.max(t, l.radius - zuBox(k.re, x, z));
                else for (const [kx, kz, rr] of k.kreise) t = Math.max(t, rr + l.radius - Math.hypot(kx - x, kz - z));
            }
            return t;
        },
    });
    // DER LAUF: gemessen nach jedem Bild und nach jedem Sim-Schritt (`_stepFixedSim`: Kontakt, Stoß, Leib an Leib); nach dem Bild auch
    // das gezeichnete Paar `bk` gegen die gezeichnete Wand, wenn der Körper anliegt (Spalt ≤ SPALT_M)
    const fahre = (kad, sek, paare, je) => {
        const m = paare.map(() => ({ tief: -Infinity, spalt: Infinity }));
        const miss = (bild) =>
            paare.forEach(([kf, H, bk], i) => {
                const [k, M] = [kf(), m[i]];
                const d = H.tiefe(k);
                if (d === -Infinity) return;
                [M.tief, M.spalt, M.durch] = [Math.max(M.tief, d), Math.min(M.spalt, Math.max(0, -d)), M.durch || H.durch(k)];
                if (!bild || !bk || d < -K.SPALT_M) return;
                const [b, a] = [bildAbstand(bk, H.bild), (M.bild = M.bild || { spalt: Infinity, tief: 0 })];
                [a.spalt, a.tief] = [Math.min(a.spalt, Math.max(0, b)), Math.max(a.tief, -b)];
            });
        r._stepFixedSim = function (...a) {
            Object.getPrototypeOf(r)._stepFixedSim.apply(this, a);
            imSchritt = true;
            miss();
            imSchritt = false;
        };
        try {
            for (let t = 0; t < sek; t += KAD(kad) / 1000) {
                if (je) je();
                takt(KAD(kad));
                miss(true);
            }
        } finally {
            delete r._stepFixedSim;
        }
        return m;
    };
    const mm = (x) => (x < Infinity ? +Math.max(0, x).toFixed(3) : 999);
    const zeile = (koerper, hindernis, kad, v, H, m, extra) =>
        aus.zeilen.push({
            koerper, hindernis, kad, v: +v.toFixed(2), wer: H.wer, durch: m.durch, tief: mm(m.tief), spalt: mm(m.spalt),
            ...(m.bild && { bild: { spalt: mm(m.bild.spalt), tief: mm(m.bild.tief) } }),
            ...extra,
        });
    // DER GANG: der Läufer fährt den Sprint seiner Gestalt, der stehende Bär 0, jedes andere Tier sein Gesetz
    const [roh, werke, H] = [A._steuerGesetz, [], {}];
    const gesetz = roh.call(A);
    const steuer = Object.create(gesetz);
    let [renner, steher] = [null, null];
    steuer.steuerSchritt = (z, wx, wz, dt, L) => {
        if (z === renner || z === steher) z.v = z === renner ? gesetz.sprintTempo(L) : 0;
        else gesetz.steuerSchritt(z, wx, wz, dt, L);
    };
    const tier = (art, gr, x, z, gier) => {
        st.maxCreatures = Math.max(st.maxCreatures, st.creatures.length + 1);
        const c = r.spawnCreatureAt(x, hh(x, z) + 0.5, z, "calm", art, { precise: true, bodySize: gr });
        if (!c) throw new Error(`kein ${art}`);
        c.position.set(x, hh(x, z), z);
        c.rotation.y = gier;
        Object.assign(c.userData, { _steuer: { gier, v: 0 }, _stossV: null });
        return c;
    };
    const baer = (x, z, b = tier("baer", 1, x, z, 0)) => ((steher = b.userData._steuer), b);
    const setze = (typ, x, z, rotationY) => r.spawnArchitecture(typ, { x, y: hh(x, z) + 0.5, z }, { silent: true, precise: true, rotationY });
    // DIE HINDERNISSE je auf ihrer Bahn z: Mauer (EIN Teil, 11° gedreht, Welt-AABB 1,5 m breit) und Haus (Westwand, 34°, `_hausObb`)
    // an der ECHTEN Box, Felsblock, Mammutbaum, der stehende Bär quer; die Bahn-Wache räumt, was dort wächst
    const teil0 = { shape: "box", material: "stein", position: { x: 0, y: 1.25, z: 0 }, size: { x: 0.35, y: 2.5, z: 6 } };
    st.blueprints._t_kontakt_mauer = { name: "_t_kontakt_mauer", parts: [teil0] };
    const BAHN = { mauer: MW.z, fels: MW.z + 8, baum: MW.z - 8, leib: MW.z - 16, haus: MW.z };
    // je Hindernis sein Ziel (null, solange es nicht steht)
    const westlich = (bs) => bs.reduce((a, b) => (!a || b.minX < a.minX ? b : a), null);
    const ziele = [
        ["mauer", "_t_kontakt_mauer", 14, (e) => (e.blockerAABBs || []).length === 1 && e.blockerAABBs[0], 0.2],
        ["fels", "stein_block", 14, (e) => westlich(e.blockerAABBs || [])],
        ["baum", "baum_mammut", 14, (e) => (e.blockerAABBs || []).find((b) => b.dick >= 0.3 && b.botY < hh(e.position.x, e.position.z) + STUFE)],
        ["haus", "haus_alemannisch", 30, (e) => e._hausHuelle && westlich(e.blockerAABBs.filter((b) => b.topY - b.botY > 1.5 && rahmen(b).hx < 0.3 && rahmen(b).hz > 1.5)), 0.6],
    ];
    try {
        for (const [n, typ, dx, ziel, rot = 0] of ziele) {
            const e = setze(typ, MW.x + dx, BAHN[n], rot);
            if (e) werke.push(e) && (await __gebautNach(e, { fertig: () => !!ziel(e), bau: () => r._populateBlockerAABBs(e) }));
            if (!e || !ziel(e)) throw new Error(`${typ} steht nicht`);
            H[n] = werkH(e, ziel(e), rot > 0);
        }
        H.mauer.e.mesh.updateMatrixWorld(true);
        H.mauer.e.mesh.traverse((m) => m.isMesh && (H.mauer.bild = m) && m.geometry.computeBoundingBox());
        const aufBahn = (b) => b.maxX > MW.x - 12 && b.minX < MW.x + 40 && Object.values(BAHN).some((z) => b.maxZ > z - 2.5 && b.minZ < z + 2.5);
        for (const o of st.architectures.slice()) if (o && !werke.includes(o) && r._istNatur(o) && (o.blockerAABBs || []).some(aufBahn)) r.removeArchitecture(o);
        // der Start: `vor` m Anlauf vor der Stelle, an der die Reichweite `reich` jede Box um 1 m verfehlt (nie in einer geboren)
        const LX = MW.x + 8;
        const start = (n, vor, reich) => {
            if (n === "leib") return [LX - 0.3 - reich - 1 - vor, BAHN.leib];
            const [x, z] = [H[n].x, BAHN[n]];
            const band = H[n].e.blockerAABBs.filter((b) => b.botY < hh(x, z) + 4);
            let t = 0;
            while (t < 30 && band.some((b) => zuBox(rahmen(b), x - t, z) < reich + 1)) t += 0.25;
            return [x - t - vor, z];
        };
        const abseits = (x, z) => {
            pm.position.set(x, hh(x, z) + 1.2, z);
            st.playerVel.setValue(0, 0, 0);
            st._fieldVy = 0;
        };
        const lauf = async (n, rufe) => {
            const steht = n === "leib" && baer(LX, BAHN.leib);
            await rufe(steht ? leibH(steht) : H[n]);
            if (steht && !st.creatures.includes(steht)) throw new Error("der stehende Bär fiel");
            if (steht) r.removeCreature(steht);
        };
        const galopp = (name, art, gr, n, kad) =>
            lauf(n, (Hn) => {
                const [x, z] = start(n, 2.5, 0.9 * gr);
                abseits(x - 3, z - 3);
                const c = tier(art, gr, x, z, Math.PI / 2);
                renner = c.userData._steuer;
                const v = gesetz.sprintTempo(r._kreaturHueftL(c));
                zeile(name, n, kad, v, Hn, fahre(kad, 4 / v + 0.6, [[tierK(c), Hn]])[0]);
                r.removeCreature(c);
            });
        A._steuerGesetz = () => steuer;
        // DIE TIERE im Galopp; der Riese ist der Bär in der größten Gestalt des Gesetzes
        const riese = A._verhaltenGesetz().groessen.slice(-1)[0].max;
        for (const name of ["fuchs", "wolf", "baer", "riese"])
            for (const n of HINDERNISSE) for (const kad of TAKTE) await galopp(name, name === "riese" ? "baer" : name, name === "riese" ? riese : 1, n, kad);
        // (T) der Fuchs im Takt-Deckel mit EINEM Schritt je Takt
        const teil = A.LEIB_TEIL;
        A.LEIB_TEIL = { radius: Infinity, minM: Infinity };
        await galopp("schmuggel", "fuchs", 1, "mauer", "deckel");
        A.LEIB_TEIL = teil;
        aus.schmuggel = aus.zeilen.pop();
        // DER SPIELER gehend und im Sprint (seine Tasten)
        for (const sprint of [false, true])
            for (const n of HINDERNISSE)
                for (const kad of ["60", "deckel"])
                    await lauf(n, (Hn) => {
                        const [[x, z], v] = [start(n, 1.5, A.PLAYER_WALL_RADIUS), sprint ? st.sprintSpeed : st.speed];
                        pm.position.set(x, hh(x, z) + A.PLAYER_FOOT_OFFSET + 0.05, z);
                        st.yaw = Math.PI / 2;
                        tasten(true, sprint);
                        zeile(sprint ? "sprint" : "gehen", n, kad, v, Hn, fahre(kad, 3 / v + 0.8, [[spielerK, Hn]])[0]);
                        tasten(false);
                    });
        // DER FALL: die Sohle nie mehr als eine Stufe unter dem Boden
        const Hb = { wer: "boden", tiefe: (k) => hh(k.kreise[0][0], k.kreise[0][1]) - k.y0, durch: (k) => Hb.tiefe(k) > STUFE };
        for (const kad of ["60", "deckel"]) {
            abseits(MW.x - 10, MW.z - 4);
            pm.position.y += K.FALL_M - 1.2;
            let vf = 0;
            const [m] = fahre(kad, Math.sqrt((2 * K.FALL_M) / 9.81) + 1.2, [[spielerK, Hb]], () => (vf = Math.max(vf, -st._fieldVy)));
            zeile("fall", "boden", kad, vf, Hb, m);
        }
        // DER WAGEN (physik.K2 Staffel 2): das schnellste Rezept des Spiels — jedes Fahrzeug-Buch der Foundry, die vmax aus dem
        // EINEN Fahrzeug-Profil — bei vmax × UEBER_VMAX: das Tempo trägt sein Profil, der Kern deckelt am Profil (`_fahrSatz` →
        // vehicle-core fahrKraefte), gemessen wird das gefahrene; dazu der Bär, den er stößt, 2 m vor der Mauer
        const buch = r._ensureAssetFoundry().recipes;
        const vmaxVon = (type) => r._vehicleProfile({ type }).vmax;
        const rezept = Object.keys(buch)
            .filter((id) => buch[id].kind === "vehicle")
            .map((id) => A.KIND_POLICY.vehicle.prefix + id)
            .reduce((a, b) => (vmaxVon(b) > vmaxVon(a) ? b : a));
        // DAS BEWEISBILD DES STOSSES (`--bild`): nach dem letzten Stoß liegen Wagen und Bär an der Mauer — EIN Schuss aus dem
        // Ausgabe-Pfad (Lehre 5) unter der Bühne, die Blick-Wahl sucht freie Sicht auf den Bären (Lehre 17); je Klasse die Pixel
        // der Klassen-Teilung (`__klassenTeilung`: dieselbe Pose ohne die Klasse, beide ohne Schattenwurf); das Bild als PNG
        const stossBild = async (e, b) => {
            const [W, HO, q, M] = [640, 360, b.position, { satz: "messung" }];
            for (const o of [b, ...(e.instSlots || []).map(({ key }) => st.archInstanceGroups.get(key).mesh)]) o.traverse((m) => (m.castShadow = false));
            __buehne();
            pm.visible = false;
            st.camera.position.set(q.x - 6, hh(q.x - 6, q.z + 4) + 2.5, q.z + 4);
            const schuss = async (opt) => {
                window.__bundlesNeu();
                r._schattenAlleNeu();
                return __ausgabeAufnahme(W, HO, 1, opt);
            };
            try {
                const G = await schuss({ ziel: { x: q.x, y: q.y + 0.8, z: q.z, name: "Bär an der Mauer", ohne: [e.id] }, wahl: 28, erstFristMs: 3e5 });
                b.visible = false;
                const Ob = (await schuss(M)).u8;
                b.visible = true;
                r._cullArchitectureMesh(e);
                const { teil } = __klassenTeilung(G.u8, [(await schuss(M)).u8, Ob], W, HO, 18);
                const px = { wagen: 0, gestossen: 0 };
                for (const t of teil) if (t) px[t > 1 ? "gestossen" : "wagen"]++;
                return { px, zeile: G.abnahme.zeile, png: window.__png(G.u8, W, HO) };
            } catch (f) {
                return { fehler: String(f.message).slice(0, 400) };
            }
        };
        for (const n of HINDERNISSE)
            for (const kad of TAKTE) {
                const steht = n === "leib" && baer(H.mauer.x - 2.7, BAHN.mauer);
                const [x, z] = steht ? [H.mauer.x - 12, BAHN.mauer] : start(n, 3, 2.5);
                pm.position.set(x, hh(x, z) + 1.2, z);
                const e = setze(rezept, x, z, 0);
                await __gebautNach(e);
                if (!(r.mountArchitecture(e) || {}).ok) throw new Error(`kein Ritt im ${rezept}`);
                tasten(false);
                for (let i = 0; i < 12; i++) takt(1000 / 60);
                const P = r._vehicleProfile(e);
                const [vmax, v] = [P.vmax, (P.vmax *= K.UEBER_VMAX)];
                st.playerVel.setValue((e._fahr.vlong = v), st.playerVel.y(), 0);
                tasten(true, false);
                const Hn = steht ? leibH(steht) : H[n];
                let [vs, vw, kontakt] = [0, null];
                const paare = [[wagenK(e), Hn, n === "mauer" && e], ...(steht ? [[tierK(steht), H.mauer, steht]] : [])];
                const [m, mb] = fahre(kad, 12 / v + 2.5, paare, () => {
                    // das gefahrene Tempo nach jedem Takt (der erste Aufruf liegt vor dem ersten)
                    vw = vw === null ? 0 : Math.max(vw, Math.hypot(st.playerVel.x(), st.playerVel.z()));
                    const sv = steht && steht.userData._stossV;
                    if (sv) vs = Math.max(vs, Math.hypot(sv.x, sv.z));
                    // die Lage des Bären beim ersten Anliegen an der Mauer (das Bild des Stoßes zeigt den Kontakt)
                    if (steht && !kontakt && H.mauer.tiefe(tierK(steht)()) > -K.SPALT_M) kontakt = steht.position.clone();
                });
                tasten(false);
                zeile("wagen", n, kad, vw, Hn, m, { vmax: +vmax.toFixed(2), rezept });
                if (mb) zeile("gestossen", "mauer", kad, vs, H.mauer, mb);
                if (K.BILD && kontakt && kad === "deckel") aus.schuss = await stossBild(e, steht, steht.position.copy(kontakt));
                r.dismountArchitecture();
                r.removeArchitecture(e);
                if (steht) r.removeCreature(steht);
            }
    } catch (f) {
        aus.fehler = String((f && f.message) || f);
    } finally {
        A._steuerGesetz = roh;
        delete r.tickFaunaLifecycle;
        tasten(false);
        for (const e of werke) r.removeArchitecture(e);
        delete st.blueprints._t_kontakt_mauer;
    }
    return aus;
}

(async () => {
    console.log(`=== KOLLISION = BILD — ${BILD ? "die Karte zeichnet" : "Null-Renderer"}, Mess-Wiese 150 m ===`);
    await server.lausche(PORT);
    const { browser, page } = await (BILD ? bildSeite : nullSeite)({ frist: BILD ? 36e5 : 9e5 });
    page.setDefaultTimeout(BILD ? 36e5 : 88e4);
    let befund = null;
    try {
        await server.zeige(page, 120000, BILD && require("./lib/software-gpu.cjs").linsenGpu() === "software" ? "index.html?holz=kienspan" : undefined);
        await warteAufWelt(page, 180000);
        // die Welt zeichnet: der Renderer steht, die Aufnahme ist eingebaut, der eigene Loop der Seite ruht (die Probe taktet)
        if (BILD) await page.evaluate(AUSGABE_INSTALL + ";__weltDa((r) => r.state.rendererReady).then((r) => r.state.renderer.setAnimationLoop(null))");
        await page.evaluate(`window.rahmen = ${rahmen}; window.lok = ${lok}; window.aussen = ${aussen}; window.zuBox = ${zuBox};`);
        const K = { mess: messort("wiese"), R: 150, SEITE_M, OBEN_ANTEIL, KOERPER_BAND_M, FEST, STRENG, exemplare: PFLICHT_EXEMPLARE };
        befund = await page.evaluate(probe, Object.assign(K, { FALL_M, HINDERNISSE, TAKTE, UEBER_VMAX, SPALT_M, BILD }));
        befund.tempo = Object.assign(await page.evaluate(tempo, K), { karte: browser.adapter });
    } catch (e) {
        befund = { fehler: String((e && e.message) || e) };
    }
    await browser.close();
    server.close();
    if (befund.fehler) {
        console.log("❌ LAUF-FEHLER: " + befund.fehler);
        process.exit(1);
    }
    const m = befund.zensus.max.map((x) => x.toFixed(2));
    console.log(`  ${befund.zensus.werke} Studio-Werke · Box ohne Bild seitlich/oben ${m[0]}/${m[1]} m · Bild ohne Box ${m[2]} m`);
    // OFFEN (nie grün gezählt): Haus und Ausstattung — Bild im Körper-Band ohne Box, Zahl und Ort im Werk-Rahmen (x/y/z)
    for (const o of befund.offen) console.log(`  OFFEN (U) ${o.kind}: ${o.wer} — ${o.mass} m neben jeder Box (bei ${o.wo})`);
    const { zeilen: Z = [], schmuggel: sm, schuss: S } = befund.tempo;
    console.log(`  (V) Kontakt beim Tempo: ${Z.length}/${TEMPO_ZEILEN.length} Zeilen · Schmuggel ${JSON.stringify(sm)}`);
    for (const k of new Set(Z.map((z) => z.koerper))) {
        const J = Z.filter((z) => z.koerper === k);
        const max = (f, L = J) => Math.max(...L.map(f)).toFixed(3);
        const B = J.filter((z) => z.bild).map((z) => z.bild);
        console.log(
            `      ${k.padEnd(10)} ${max((z) => z.v)} m/s · Durchtritt ${J.filter((z) => z.durch).length}/${J.length} · Eindringen max ${max((z) => z.tief)} m · Spalt max ${max((z) => z.spalt)} m` +
                (B.length ? ` · im Bild Spalt max ${max((b) => b.spalt, B)} m, Eindringen max ${max((b) => b.tief, B)} m` : "") +
                (J[0].rezept ? ` · ${J[0].rezept} vmax ${J[0].vmax} m/s × ${UEBER_VMAX}` : "")
        );
    }
    // das Beweisbild des Stoßes (`--bild`; KOLLISION_BILD_PNG: die Datei, in die es geht)
    if (S && S.png && process.env.KOLLISION_BILD_PNG)
        pngDatei(process.env.KOLLISION_BILD_PNG, S.png);
    if (S) console.log(`  Stoß im Ausgabe-Bild: ${S.fehler || `Wagen ${S.px.wagen} px · Bär ${S.px.gestossen} px in 640×360 · ${S.zeile}`}`);
    const v = urteil(befund).filter((x) => !x.startsWith("OFFEN") || console.log("  " + x));
    if (v.length) {
        console.log("\n❌ KOLLISION = BILD ROT:\n  " + v.join("\n  "));
        process.exit(1);
    }
    // jede Box hat ihr Bild; Fels, Tor (außer der Passage) und Wagen: jedes Bild im Körper-Band liegt an einer Box; jedes feste
    // Werk trägt Boxen; kein Blocker baut eine Gestalt auf dem Haupt-Thread; kein Körper dringt beim Tempo des Spiels ein
    console.log(`\n✅ KOLLISION = BILD GRÜN (OFFEN oben: ${befund.offen.length})`);
    process.exit(0);
})();
