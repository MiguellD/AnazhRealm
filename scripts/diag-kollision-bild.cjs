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
//       der Spawns der Exemplare (kaltes Tor-Gedächtnis) ist ein Täter beim Namen (Kern, Rezept, Werk);
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
//       Sprint, der GT bei vmax und der Bär, den er stößt, gegen Mauer · Fels · Haus · Baum · Bär, der Fall aus FALL_M — bei
//       144 · 60 · 30 fps und dem Takt-Deckel: je Takt Eindringen ≤ EINDRING_M, kein Durchtritt, Spalt ≤ SPALT_M (sonst vakuös);
//       (T) der Fuchs mit EINEM Schritt je Takt (`LEIB_TEIL` ohne Teil-Schritt) MUSS durch die Mauer;
//   (P) kein Page-Error.
// SELBSTTEST (--selftest, ohne Browser, in `npm run check`): ein Befund mit jedem Täter — Blocker ohne Bild, Bild ohne
// Blocker, Baum ohne Stamm, fremde Gestalt, leere Zählung, stumpfer Schmuggel, fehlende Klasse, Bau auf dem Haupt-Thread,
// Quelle, Durchtritt, Eindringen, vakuöse und fehlende Tempo-Zeile, stumpfer Tempo-Schmuggel, Page-Error — MUSS rot fallen und
// ihn beim Namen nennen.
//   node scripts/diag-kollision-bild.cjs [--selftest]   (npm run gate:kollision-bild; Port KOLLISION_BILD_PORT)
// ─────────────────────────────────────────────────────────────────────────
"use strict";

const SEITE_M = 0.3; // die Kapsel des Spielers misst 0,35 m — was weniger daneben steht, fasst kein Körper als Luft an
const OBEN_ANTEIL = 0.02; // oben: 2 % der Bild-Höhe (über einer 40-m-Krone erreicht kein Körper die Spitze)
const KOERPER_BAND_M = 2.5; // Spieler 1,8 m · Bär ~2 m · GT-Dach 1,4 m
const FEST = new Set(["rock", "haus", "gate", "vehicle", "ausstattung"]);
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
// (V) DAS SOLL: Eindringen nach dem Takt ≤ PhysX/Unity `defaultContactOffset`, Spalt ≤ die Bild-Probe von physik.K2
const EINDRING_M = 0.01;
const SPALT_M = 0.05;
const FALL_M = 60;
const HINDERNISSE = ["mauer", "fels", "haus", "baum", "leib"];
const zeilen = (koerper, kad) => koerper.flatMap((k) => HINDERNISSE.flatMap((h) => kad.map((t) => `${k}|${h}|${t}`)));
const TEMPO_ZEILEN = [
    ...zeilen(["fuchs", "wolf", "baer", "riese"], ["144", "60", "30", "deckel"]),
    ...zeilen(["gehen", "sprint", "gt"], ["60", "deckel"]),
    ...["60", "deckel"].flatMap((t) => [`gestossen|mauer|${t}`, `fall|boden|${t}`]),
];

// (V) Das Urteil (rein).
function tempoUrteil(T) {
    if (!T || T.fehler || !Array.isArray(T.zeilen)) return [`LEER: (V) die Tempo-Probe fehlt (${T && T.fehler})`];
    const v = [];
    const je = new Map(T.zeilen.map((z) => [z.koerper + "|" + z.hindernis + "|" + z.kad, z]));
    for (const k of TEMPO_ZEILEN) {
        const z = je.get(k);
        const wer = z && `${z.koerper} ${z.v} m/s @${z.kad} → ${z.wer}`;
        if (!z) v.push(`(V) ZEILE FEHLT: ${k}`);
        else if (z.durch) v.push(`(V) DURCHTRITT: ${wer} — die Mitte ging hindurch (Eindringen ${z.tief} m)`);
        else if (!(z.tief <= EINDRING_M))
            v.push(`(V) EINDRINGEN: ${wer} — ${z.tief} m > ${EINDRING_M} m nach dem Takt`);
        if (z && !(z.spalt <= SPALT_M)) v.push(`(V) VAKUÖS: ${wer} — der Körper erreichte es nie (Spalt ${z.spalt} m)`);
    }
    if (!(T.schmuggel && T.schmuggel.durch))
        v.push(
            `LINSE STUMPF: (V) der Fuchs mit EINEM Schritt je Takt ging nicht durch die Mauer ${JSON.stringify(T.schmuggel)}`
        );
    return v;
}

// Das Urteil über einen Befund: Liste der Verstöße (leer = grün). Rein, im Selbsttest wie im Lauf.
function urteil(b) {
    const v = [];
    if (!b.zensus || !(b.zensus.werke > 0)) v.push("LEER: die Zählung fand kein Werk, das das Studio zeichnet");
    const z = b.zensus || { taeter: [] };
    for (const t of z.taeter || []) {
        if (t.art === "blocker")
            v.push(
                `(B) BLOCKER OHNE BILD: ${t.wer} bei ${t.ort} — eine Box ragt ${t.mass.toFixed(2)} m ${t.wo} über das Bild ` +
                    `(Bild ${t.bild}, Box ${t.box})`
            );
        else if (t.art === "bild")
            v.push(
                `(U) BILD OHNE BLOCKER: ${t.wer} bei ${t.ort} — das Bild steht im Körper-Band ${t.mass.toFixed(2)} m neben jeder ` +
                    `Box (Bild ${t.bild})`
            );
        else if (t.art === "stamm") v.push(`(U) BAUM OHNE STAMM: ${t.wer} bei ${t.ort} trägt keine Box`);
        else if (t.art === "gestalt")
            v.push(
                `(G) FREMDE GESTALT: ${t.wer} bei ${t.ort} — gezeichnet Gestalt ${t.bildG}, der Blocker misst ${t.blockG}`
            );
    }
    for (const k of PFLICHT_EXEMPLARE)
        if (!(b.exemplare && b.exemplare[k] === true))
            v.push(
                `(E) KLASSE FEHLT: das Exemplar ${k} stand nicht in der Zählung (${(b.exemplare || {})[k] || "nicht gesetzt"})`
            );
    if (!b.schmuggel || !b.schmuggel.genannt)
        v.push(
            "LINSE STUMPF: (T) der eingeschmuggelte Täter (ein Felsturm mit den Spender-Parts) wurde nicht beim Namen genannt" +
                (b.schmuggel && b.schmuggel.wer ? ` (${b.schmuggel.wer})` : "")
        );
    if (!b.schmuggelTor || !b.schmuggelTor.genannt)
        v.push(
            "LINSE STUMPF: (T) das Tor ohne seinen ersten Pfosten wurde nicht als Bild ohne Blocker genannt" +
                (b.schmuggelTor && b.schmuggelTor.wer ? ` (${b.schmuggelTor.wer})` : "")
        );
    if (!Array.isArray(b.bauten)) v.push("LEER: (K) die Zählung der Haupt-Thread-Bauten fehlt");
    for (const t of b.bauten || []) v.push(`(K) DER HAUPT-THREAD BAUT: ${t}`);
    const q = b.quelle || {};
    if (!q.torTafel) v.push("(Q) QUELLE: das Tor liest seine Hülle nicht aus dem Gesetzbuch (`porta:TOR_HUELLE`)");
    if (!q.ohneBau) v.push("(Q) QUELLE: ein Blocker-Erzeuger ruft `buildInstance` (die Gestalt am Spawn nachgebaut)");
    if (!q.felsOhneTypListe) v.push("(Q) QUELLE: der Fels-Zweig `_felsBlockerParts` trägt eine Typ-Liste (`_var`)");
    if (!q.partsSkala) v.push("(Q) QUELLE: der Parts-Pfad liest die Welt-Skala nicht (`_studioWeltSkala`)");
    v.push(...tempoUrteil(b.tempo));
    for (const e of b.pageErrors || []) v.push(`PAGE-ERROR: ${e}`);
    return v;
}

function selbsttest() {
    const ex = Object.fromEntries(PFLICHT_EXEMPLARE.map((k) => [k, true]));
    const gruen = {
        zensus: { werke: 900, taeter: [] },
        exemplare: ex,
        schmuggel: { genannt: true, wer: "felsturm#4" },
        schmuggelTor: { genannt: true, wer: "welt_fachwerk#9" },
        bauten: [],
        quelle: {
            felsOhneTypListe: true,
            partsSkala: true,
            torTafel: true,
            ohneBau: true,
        },
        tempo: {
            zeilen: TEMPO_ZEILEN.map((k) => {
                const [koerper, hindernis, kad] = k.split("|");
                return { koerper, hindernis, kad, v: 5.86, wer: hindernis + "#7", durch: false, tief: 0, spalt: 0 };
            }),
            schmuggel: { durch: true, tief: 0.28, spalt: 0 },
        },
        pageErrors: [],
    };
    const fehler = [];
    const g = urteil(gruen);
    if (g.length) fehler.push("der grüne Befund fällt rot: " + g.join(" · "));
    const klon = () => JSON.parse(JSON.stringify(gruen));
    const Z = (b, k) => b.tempo.zeilen.find((z) => z.koerper + "|" + z.hindernis + "|" + z.kad === k);
    const T = (o) =>
        Object.assign({ wer: "felsturm#174", ort: "-913.7/-900.7", bild: "1.4×0.8×0.9", box: "4.4×16.8×4.4" }, o);
    const faelle = [
        [
            "Felsturm als Eisen-Mast",
            (b) => b.zensus.taeter.push(T({ art: "blocker", mass: 16.46, wo: "oben" })),
            /\(B\) BLOCKER OHNE BILD: felsturm#174 bei -913\.7\/-900\.7 — eine Box ragt 16\.46 m oben/,
        ],
        [
            "Bild ohne Blocker",
            (b) => b.zensus.taeter.push(T({ wer: "haus_alemannisch#9", art: "bild", mass: 1.2 })),
            /\(U\) BILD OHNE BLOCKER: haus_alemannisch#9 .* 1\.20 m neben/,
        ],
        [
            "Baum ohne Stamm",
            (b) => b.zensus.taeter.push(T({ wer: "baum_eiche#3", art: "stamm" })),
            /BAUM OHNE STAMM: baum_eiche#3/,
        ],
        [
            "fremde Gestalt",
            (b) => b.zensus.taeter.push(T({ art: "gestalt", bildG: 3, blockG: 7 })),
            /\(G\) FREMDE GESTALT: felsturm#174 .* gezeichnet Gestalt 3, der Blocker misst 7/,
        ],
        ["leere Zählung", (b) => (b.zensus.werke = 0), /LEER: die Zählung fand kein Werk/],
        ["stumpfer Schmuggel", (b) => (b.schmuggel.genannt = false), /LINSE STUMPF: \(T\)/],
        [
            "stumpfer Tor-Schmuggel",
            (b) => (b.schmuggelTor.genannt = false),
            /LINSE STUMPF: \(T\) das Tor ohne seinen ersten Pfosten .* \(welt_fachwerk#9\)/,
        ],
        ["fehlende Klasse", (b) => delete b.exemplare.felsbogen, /\(E\) KLASSE FEHLT: das Exemplar felsbogen/],
        ["Typ-Liste", (b) => (b.quelle.felsOhneTypListe = false), /\(Q\) QUELLE: der Fels-Zweig .* Typ-Liste/],
        ["Parts ohne Skala", (b) => (b.quelle.partsSkala = false), /\(Q\) QUELLE: der Parts-Pfad liest/],
        [
            "Tor gebaut am Spawn",
            (b) => b.bauten.push("__portaCore.buildInstance(drachentor) am Spawn von tor_drachentor"),
            /\(K\) DER HAUPT-THREAD BAUT: __portaCore\.buildInstance\(drachentor\) am Spawn von tor_drachentor/,
        ],
        ["Bau-Zählung fehlt", (b) => delete b.bauten, /LEER: \(K\) die Zählung der Haupt-Thread-Bauten fehlt/],
        [
            "Tor ohne Tafel",
            (b) => (b.quelle.torTafel = false),
            /\(Q\) QUELLE: das Tor liest seine Hülle nicht aus dem Gesetzbuch/,
        ],
        [
            "Bau im Erzeuger",
            (b) => (b.quelle.ohneBau = false),
            /\(Q\) QUELLE: ein Blocker-Erzeuger ruft `buildInstance`/,
        ],
        [
            "Tor-Bild ohne Box neben der Passage",
            (b) => b.zensus.taeter.push(T({ wer: "tor_ruine#7", art: "bild", mass: 0.62 })),
            /\(U\) BILD OHNE BLOCKER: tor_ruine#7 .* 0\.62 m neben/,
        ],
        [
            "Gang ohne Teil-Schritt",
            (b) => Object.assign(Z(b, "fuchs|mauer|deckel"), { durch: true, tief: 0.28 }),
            /\(V\) DURCHTRITT: fuchs 5\.86 m\/s @deckel → mauer#7/,
        ],
        [
            "Eindringen nach dem Takt",
            (b) => (Z(b, "wolf|haus|deckel").tief = 0.13),
            /\(V\) EINDRINGEN: wolf .*@deckel → haus#7 — 0\.13 m/,
        ],
        ["vakuöse Tempo-Zeile", (b) => (Z(b, "gt|baum|60").spalt = 0.8), /\(V\) VAKUÖS: gt .*baum#7 .*Spalt 0\.8/],
        [
            "fehlende Tempo-Zeile",
            (b) => (b.tempo.zeilen = b.tempo.zeilen.filter((z) => z.koerper !== "riese")),
            /\(V\) ZEILE FEHLT: riese\|mauer\|144/,
        ],
        ["stumpfer Tempo-Schmuggel", (b) => (b.tempo.schmuggel.durch = false), /LINSE STUMPF: \(V\)/],
        ["Tempo-Probe fehlt", (b) => delete b.tempo, /LEER: \(V\) die Tempo-Probe fehlt/],
        ["Page-Error", (b) => b.pageErrors.push("TypeError: x"), /PAGE-ERROR: TypeError: x/],
    ];
    for (const [name, tat, muss] of faelle) {
        const b = klon();
        tat(b);
        const v = urteil(b);
        const ok = v.some((x) => muss.test(x));
        if (!ok) fehler.push(`${name}: die Wand nennt den Täter nicht (${muss})`);
        console.log(`  ${ok ? "✅" : "❌"} Selbsttest „${name}" → rot: ${v.join(" · ") || "(nichts)"}`);
    }
    if (fehler.length) {
        console.log("\n❌ SELBSTTEST ROT — die Wand ist vakuös: " + fehler.join(" · "));
        process.exit(1);
    }
    console.log("\n✅ SELBSTTEST GRÜN — jeder injizierte Täter fällt rot und wird beim Namen genannt.");
}

if (process.argv.includes("--selftest")) {
    console.log("=== KOLLISION = BILD — Selbsttest (ohne Browser) ===");
    selbsttest();
    process.exit(0);
}

const { statikServer, starteBrowser, warteAufWelt, nullRenderer } = require("./lib/welt-boot.cjs");
const { messort } = require("./lib/welt-orte.cjs");

const PORT = Number(process.env.KOLLISION_BILD_PORT) || 4631;
const server = statikServer();

// Die Zählung im Seiten-Kontext: je Studio-Werk im Umkreis das Bild gegen die Kollision.
async function probe(K) {
    const r = window.anazhRealm;
    const st = r.state;
    const pause = (ms) => new Promise((ok) => setTimeout(ok, ms || 0));
    let tMs = performance.now();
    const takt = () => {
        tMs += 1000 / 60;
        r._gameLoopTick(tMs);
    };
    const f = r._ensureAssetFoundry();
    const MW = K.mess; // die Mess-Wiese aus EINER Quelle (spec/profiband/haushalt.json), nie ihre Abschrift
    st.playerMesh.position.set(MW.x, r._voxelSurfaceY(MW.x, MW.z) + 1.8, MW.z);
    // die Welt steht, das Buch ist da (das EINE Einschwingen, welt-boot `__weltStehtNach`; bis D3d 90 s Wanduhr auf das Buch)
    await window.__weltStehtNach(takt);
    const aus = {
        ring: st.voxelChunks.size,
        exemplare: {},
        zensus: { werke: 0, taeter: [], klassen: {} },
        quelle: {},
        schmuggel: null,
    };
    // (K) DIE BAUTEN DES HAUPT-THREADS: jeder Kern mit einer Bau-Funktion wird gezählt, solange die Exemplare entstehen
    // (Spawn und Bau-Takte) — mit kaltem Tor-Gedächtnis, wie bei der Ankunft (der Genesis-Ring) und jedem Restore
    const bauten = [];
    let amSpawn = null;
    const rohBau = [];
    for (const ns of Object.keys(globalThis)) {
        const kern = /^__\w+Core$/.test(ns) ? globalThis[ns] : null;
        if (!kern || typeof kern.buildInstance !== "function") continue;
        const roh = kern.buildInstance;
        rohBau.push([kern, roh]);
        kern.buildInstance = function (id) {
            if (bauten.length < 40)
                bauten.push(`${ns}.buildInstance(${id}) ${amSpawn ? "am Spawn von " + amSpawn : "im Takt"}`);
            return roh.apply(this, arguments);
        };
    }
    r._torGesetzMemo = null;
    // (E) DIE EXEMPLARE: je Klasse eines in einer Reihe 30 m südlich der Mess-Wiese (Abstand 9 m)
    const gesetzt = [];
    try {
        K.exemplare.forEach((typ, i) => {
            const x = MW.x - 50 + i * 9;
            const z = MW.z + 30;
            if (!st.blueprints[typ]) {
                aus.exemplare[typ] = "kein Bauplan";
                return;
            }
            amSpawn = typ;
            const e = r.spawnArchitecture(
                typ,
                { x, y: r.getTerrainHeightAt(x, z) + 0.5, z },
                { silent: true, precise: true, rotationY: 0.6 + i * 0.37 }
            );
            amSpawn = null;
            if (e) gesetzt.push([typ, e]);
            else aus.exemplare[typ] = "Spawn verweigert";
        });
        // die Exemplare bauen (das Studio liefert die Gestalt, das Haus seine Hülle)
        for (let i = 0; i < 900; i++) {
            takt();
            if (i % 4 === 0) await pause(10);
            if (i > 120 && gesetzt.every(([, e]) => e.instanced || e.mesh || e._bauSatz)) break;
        }
        for (let i = 0; i < 240; i++) {
            takt();
            if (i % 4 === 0) await pause(10);
        }
    } finally {
        for (const [kern, roh] of rohBau) kern.buildInstance = roh;
    }
    aus.bauten = bauten;
    aus.offen = [];
    // DAS BILD einer Gestalt (LOD 0 im Vorlagen-Raum), je Art|Gestalt einmal
    const bildCache = new Map();
    const bild = async (pr, g) => {
        const k = pr + "|" + g;
        if (bildCache.has(k)) return bildCache.get(k);
        const meshes = await r._foundryRequest(pr, g, 0, null, 0);
        let pts = null;
        if (meshes && meshes.length) {
            let n = 0;
            for (const m of meshes) {
                const p = m.position;
                const a = p && p.length ? p : p && p.array ? p.array : null;
                if (a) n += a.length;
            }
            pts = new Float32Array(n);
            let o = 0;
            for (const m of meshes) {
                const p = m.position;
                const a = p && p.length ? p : p && p.array ? p.array : null;
                if (a) {
                    pts.set(a, o);
                    o += a.length;
                }
            }
        }
        bildCache.set(k, pts);
        return pts;
    };
    const kindVon = (pr) => {
        const rec = f.recipes && f.recipes[pr];
        if (rec && typeof rec.kind === "string") return rec.kind;
        const ph = globalThis.__terrainCore.PHYTO_PRESETS[pr];
        return ph ? ph.kind : null;
    };
    // eine Box im eigenen Rahmen: (u, w) längs ihrer Achsen, Halb-Maße
    const rahmen = (b) =>
        b.obb
            ? { cx: b.obb.cx, cz: b.obb.cz, c: b.obb.c, s: b.obb.s, hx: b.obb.hx, hz: b.obb.hz }
            : {
                  cx: (b.minX + b.maxX) / 2,
                  cz: (b.minZ + b.maxZ) / 2,
                  c: 1,
                  s: 0,
                  hx: (b.maxX - b.minX) / 2,
                  hz: (b.maxZ - b.minZ) / 2,
              };
    const urteileWerk = async (e, merke) => {
        const pr = r._foundryPresetForEntry(e);
        if (!pr) return null;
        const kind = kindVon(pr);
        let g = null;
        const sl = (e.instSlots || []).find((s) => typeof s.key === "string" && /^f:/.test(s.key));
        if (sl) g = Number(sl.key.split("|")[1]);
        // ohne Körper-Slot (die Karte der L2 trägt „fimp:atlas") die Gestalt, die der Wirt zeichnet: der EINE Leser
        // `_foundryGestaltFor` (die Gestalt des Orts, K20) — der rohe Same wählte ohne Ort, und jede dritte Tanne der Karten-
        // Stufe wurde gegen den Solitär gemessen (40 Fehlbefunde, die Spitze der Bestand-Hülle 0,8–2,2 m über ihm)
        if (!Number.isFinite(g)) g = r._foundryGestaltFor(e, pr);
        if (!Number.isFinite(g)) return null;
        const pts = await bild(pr, g);
        if (!pts || !pts.length) return null;
        const wer = e.type + "#" + e.id;
        const ort = e.position.x.toFixed(1) + "/" + e.position.z.toFixed(1);
        const ws = r._foundryWorldScaleMatrix(pr).elements[0] * (Number.isFinite(e.scale) && e.scale > 0 ? e.scale : 1);
        const ry = Number.isFinite(e.rotationY) ? e.rotationY : 0;
        const c = Math.cos(ry),
            s = Math.sin(ry);
        const basis = e.position.y - 0.5;
        const W = new Float64Array(pts.length);
        let x0 = Infinity,
            x1 = -Infinity,
            y0 = Infinity,
            y1 = -Infinity,
            z0 = Infinity,
            z1 = -Infinity;
        for (let i = 0; i < pts.length; i += 3) {
            const lx = pts[i] * ws,
                ly = pts[i + 1] * ws,
                lz = pts[i + 2] * ws;
            W[i] = e.position.x + lx * c + lz * s;
            W[i + 1] = basis + ly;
            W[i + 2] = e.position.z - lx * s + lz * c;
            if (W[i] < x0) x0 = W[i];
            if (W[i] > x1) x1 = W[i];
            if (W[i + 1] < y0) y0 = W[i + 1];
            if (W[i + 1] > y1) y1 = W[i + 1];
            if (W[i + 2] < z0) z0 = W[i + 2];
            if (W[i + 2] > z1) z1 = W[i + 2];
        }
        const bildTxt = (x1 - x0).toFixed(1) + "×" + (y1 - y0).toFixed(1) + "×" + (z1 - z0).toFixed(1);
        const B = e.blockerAABBs || [];
        const funde = [];
        // (G) die Gestalt des Fels-Blockers gegen die gezeichnete
        if (kind === "rock") {
            const gB = r._foundryVariantFor(e.seed, pr, r.constructor._studioGestaltenKern(pr));
            if (gB !== g) funde.push({ art: "gestalt", wer, ort, bildG: g, blockG: gB });
        }
        if (kind === "tree" && !B.length) funde.push({ art: "stamm", wer, ort });
        // (B) jede Box gegen das Bild in ihrem Rahmen
        let seite = 0,
            oben = 0,
            boxTxt = "";
        for (const b of B) {
            const R = rahmen(b);
            let a0 = Infinity,
                a1 = -Infinity,
                q0 = Infinity,
                q1 = -Infinity;
            for (let i = 0; i < W.length; i += 3) {
                const dx = W[i] - R.cx,
                    dz = W[i + 2] - R.cz;
                const u = dx * R.c - dz * R.s,
                    w = dx * R.s + dz * R.c;
                if (u < a0) a0 = u;
                if (u > a1) a1 = u;
                if (w < q0) q0 = w;
                if (w > q1) q1 = w;
            }
            const sd = Math.max(a0 + R.hx, R.hx - a1, q0 + R.hz, R.hz - q1);
            const od = b.topY - y1;
            if (sd > seite || od > oben)
                boxTxt = (2 * R.hx).toFixed(1) + "×" + (b.topY - b.botY).toFixed(1) + "×" + (2 * R.hz).toFixed(1);
            if (sd > seite) seite = sd;
            if (od > oben) oben = od;
        }
        const obenTol = Math.max(K.SEITE_M, K.OBEN_ANTEIL * (y1 - y0));
        if (seite > K.SEITE_M)
            funde.push({ art: "blocker", wer, ort, mass: seite, wo: "seitlich", bild: bildTxt, box: boxTxt });
        else if (oben > obenTol)
            funde.push({ art: "blocker", wer, ort, mass: oben, wo: "oben", bild: bildTxt, box: boxTxt });
        // (U) das Bild im Körper-Band gegen die Boxen (feste Werke). DIE PASSAGE des Tors (|x| < rimAx im Vorlagen-Raum) ist
        // nach dem Gesetz frei — dort öffnen sich die Flügel vor dem Körper (TUER_GESETZ); gemessen 10.10.: die einzigen
        // Punkte des Tor-Bilds ohne Box lagen dort (x ≈ 0, 0,1–2,0 m, die Fuge der geschlossenen Flügel), 1,27–1,49 m neben
        // dem Pfosten.
        const torG = kind === "gate" ? r._torGesetzFor(e) : null;
        const passage = torG && torG.mu ? torG.mu.rimAx : 0;
        let neben = 0,
            nebenWo = null;
        if (FEST_KIND.has(kind)) {
            if (!B.length) neben = Infinity;
            else
                for (let i = 0; i < W.length; i += 3) {
                    const hy = W[i + 1] - basis;
                    if (hy < 0.1 || hy > K.KOERPER_BAND_M) continue;
                    if (passage > 0 && Math.abs(pts[i]) < passage) continue;
                    let best = Infinity;
                    for (const b of B) {
                        const R = rahmen(b);
                        const dx = W[i] - R.cx,
                            dz = W[i + 2] - R.cz;
                        const u = dx * R.c - dz * R.s,
                            w = dx * R.s + dz * R.c;
                        const d = Math.hypot(
                            Math.max(Math.abs(u) - R.hx, 0),
                            Math.max(Math.abs(w) - R.hz, 0),
                            Math.max(b.botY - W[i + 1], W[i + 1] - b.topY, 0)
                        );
                        if (d < best) best = d;
                        if (best === 0) break;
                    }
                    if (best > neben) {
                        neben = best;
                        nebenWo = [pts[i] * ws, pts[i + 1] * ws, pts[i + 2] * ws];
                    }
                }
            // Fels, Tor und Wagen messen ihre Hülle an der gezeichneten Gestalt: das ganze Bild im Band ist gedeckt (das Tor
            // außer der Passage). Haus und Ausstattung erklärt ihr Gesetzbuch (`__huelle`, die Teile) nicht ganz als fest —
            // ihr Abstand ist OFFEN (Zahl und Ort im Werk-Rahmen), nie grün gezählt
            if (neben === Infinity || (K.STRENG.includes(kind) && neben > K.SEITE_M))
                funde.push({ art: "bild", wer, ort, mass: neben, bild: bildTxt });
            else if (merke && neben > K.SEITE_M) {
                const neu = {
                    typ: e.type,
                    kind,
                    wer,
                    mass: +neben.toFixed(2),
                    wo: nebenWo.map((v) => v.toFixed(1)).join("/"),
                };
                const k = aus.offen.findIndex((x) => x.typ === e.type);
                if (k < 0) aus.offen.push(neu);
                else if (neu.mass > aus.offen[k].mass) aus.offen[k] = neu;
            }
        }
        if (merke) {
            const kl = aus.zensus.klassen[e.type.replace(/_v?\d+$/, "#") + "→" + pr] || {
                n: 0,
                seiteMax: 0,
                obenMax: 0,
                nebenMax: 0,
            };
            kl.n++;
            kl.seiteMax = Math.max(kl.seiteMax, +seite.toFixed(2));
            kl.obenMax = Math.max(kl.obenMax, +oben.toFixed(2));
            if (Number.isFinite(neben)) kl.nebenMax = Math.max(kl.nebenMax, +neben.toFixed(2));
            aus.zensus.klassen[e.type.replace(/_v?\d+$/, "#") + "→" + pr] = kl;
        }
        return funde;
    };
    const FEST_KIND = new Set(K.FEST);
    const P = st.playerMesh.position;
    for (const e of st.architectures.slice()) {
        if (!e || !e.position || Math.hypot(e.position.x - P.x, e.position.z - P.z) > K.R) continue;
        const funde = await urteileWerk(e, true);
        if (funde === null) continue;
        aus.zensus.werke++;
        for (const t of funde) if (aus.zensus.taeter.length < 40) aus.zensus.taeter.push(t);
        const ex = gesetzt.find(([, x]) => x === e);
        if (ex) aus.exemplare[ex[0]] = true;
    }
    for (const [typ, e] of gesetzt)
        if (aus.exemplare[typ] !== true) aus.exemplare[typ] = e.instanced || e.mesh ? "kein Bild" : "nicht gebaut";
    // (T) DER EINGESCHMUGGELTE TÄTER: ein Felsturm mit den Spender-Parts (die alte Regel, Vorlagen-Maß)
    const turm = st.architectures.find((e) => e && e.type === "felsturm" && e.blockerAABBs && e.blockerAABBs.length);
    if (turm) {
        const alt = turm.blockerAABBs;
        const bp = st.blueprints.felsturm;
        const spender = [];
        for (const part of bp.parts) if (r._isPartSolid(part)) spender.push(r._blockerComputePartAABB(turm, part));
        turm.blockerAABBs = spender;
        r._blockerStampReach(turm);
        const funde = (await urteileWerk(turm, false)) || [];
        aus.schmuggel = {
            wer: turm.type + "#" + turm.id,
            genannt: funde.some((t) => t.art === "blocker" && t.wer === turm.type + "#" + turm.id),
            funde: funde.map((t) => t.art + " " + (t.mass ? t.mass.toFixed(2) : "")),
        };
        turm.blockerAABBs = alt;
        r._blockerStampReach(turm);
    }
    // (T) DER ZWEITE TÄTER: ein Tor ohne seinen ersten Pfosten (die Ruine — eine Seite trägt den Schutt) — (U) MUSS ihn außerhalb
    // der Passage beim Namen nennen (die Strenge des Tors ist nicht vakuös)
    const tor = (gesetzt.find(([typ]) => typ === "welt_fachwerk") || [])[1];
    if (tor && tor.blockerAABBs && tor.blockerAABBs.length > 1) {
        const alt = tor.blockerAABBs;
        tor.blockerAABBs = alt.slice(1);
        const funde = (await urteileWerk(tor, false)) || [];
        aus.schmuggelTor = {
            wer: tor.type + "#" + tor.id,
            genannt: funde.some((t) => t.art === "bild" && t.wer === tor.type + "#" + tor.id),
            funde: funde.map((t) => t.art + " " + (t.mass ? t.mass.toFixed(2) : "")),
        };
        tor.blockerAABBs = alt;
    }
    // (Q) DIE QUELLE: der Konsum am Zähl-Spion des Versorgers, während der Erzeuger einmal läuft; die Absenzen kommentarfrei
    const ruft = (lauf, o, k, wer = () => true) => {
        const eigen = Object.prototype.hasOwnProperty.call(o, k),
            f = o[k];
        let n = 0;
        o[k] = function (...a) {
            if (wer(...a)) n++;
            return f.apply(this, a);
        };
        try {
            lauf();
        } finally {
            if (eigen) o[k] = f;
            else delete o[k];
        }
        return n > 0;
    };
    const baum = st.architectures.find(
        (e) => e && r._foundryPresetIsTree(r._foundryPresetForEntry(e)) && Array.isArray(r._baumGestaltTeile(e))
    );
    const drache = (gesetzt.find(([typ]) => typ === "tor_drachentor") || [])[1];
    aus.quelle = {
        felsOhneTypListe: window.__fehlt(r._felsBlockerParts, /_var/),
        partsSkala: !!baum && ruft(() => r._populateBlockerAABBs(baum), r, "_studioWeltSkala"),
        torTafel:
            !!drache &&
            ruft(() => r._torBlockerAABBs(drache), r.constructor, "Gesetz", (pfad) => /^porta:TOR_HUELLE\./.test(pfad)),
        // die Erzeuger und ihre Hilfs-Methoden (der Nachbau lag in einer Hilfs-Methode des Tors) — die Liste beim Namen
        ohneBau: window.__fehlt(
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
    const r = window.anazhRealm;
    const st = r.state;
    const A = r.constructor;
    const { mess: MW, HINDERNISSE } = K;
    const pm = st.playerMesh;
    const hh = (x, z) => r._voxelSurfaceY(x, z); // der Boden, auf dem die Körper gehen (die Oberkante des Felds)
    const STUFE = A.PLAYER_STEP_UP;
    const KAD = { 144: 1000 / 144, 60: 1000 / 60, 30: 1000 / 30, deckel: A.TAKT_DECKEL_S * 1000 };
    let tMs = performance.now();
    const takt = (ms) => r._gameLoopTick((tMs += ms));
    const tasten = (w, sprint) => {
        for (const k of ["w", "a", "s", "d", "shift", " "]) st.keys[k] = false;
        st.keys.w = !!w;
        st.keys.shift = !!sprint;
    };
    const aus = { zeilen: [] };
    // DIE GEOMETRIE, eigen (nie der Löser, den sie richtet): der Rahmen wie `_boxAbstand2`, innen negativ
    const rahmen = (b) =>
        b.obb || {
            cx: (b.minX + b.maxX) / 2,
            cz: (b.minZ + b.maxZ) / 2,
            c: 1,
            s: 0,
            hx: (b.maxX - b.minX) / 2,
            hz: (b.maxZ - b.minZ) / 2,
        };
    const lokal = (R, x, z) => [(x - R.cx) * R.c - (z - R.cz) * R.s, (x - R.cx) * R.s + (z - R.cz) * R.c];
    const zuBox = (R, x, z) => {
        const [u, w] = lokal(R, x, z);
        const [ox, oz] = [Math.abs(u) - R.hx, Math.abs(w) - R.hz];
        return ox > 0 || oz > 0 ? Math.hypot(Math.max(ox, 0), Math.max(oz, 0)) : Math.max(ox, oz);
    };
    const weite = (R, ux, uz) => R.hx * Math.abs(R.c * ux - R.s * uz) + R.hz * Math.abs(R.s * ux + R.c * uz);
    // DIE KÖRPER: das Tier die drei Kreise seines Leibs, der Spieler seine Kapsel (Sim-Lage), der Wagen der Rahmen seiner Hülle
    const leibKreise = (c) => {
        const l = r._kreaturLeib(c, 0, {});
        const p = c.position;
        return { l, kreise: [-1, 0, 1].map((o) => [p.x + l.fx * o * l.halb, p.z + l.fz * o * l.halb, l.radius]) };
    };
    const tierK = (c) => () => {
        const { l, kreise } = leibKreise(c);
        return { mx: c.position.x, mz: c.position.z, y0: c.position.y, y1: c.position.y + l.hoehe, kreise };
    };
    const spielerK = () => {
        const p = st._fixedSimPos || pm.position;
        const F = A.PLAYER_FOOT_OFFSET;
        return { mx: p.x, mz: p.z, y0: p.y - F, y1: p.y + F, kreise: [[p.x, p.z, A.PLAYER_WALL_RADIUS]] };
    };
    const wagenK = (e) => () => {
        const p = st._fixedSimPos || pm.position;
        const h = r._fahrHuelle(e);
        const [s, c] = [Math.sin(e._rideYaw || 0), Math.cos(e._rideYaw || 0)];
        const re = { cx: p.x + s * h.mitte, cz: p.z + c * h.mitte, c, s, hx: h.hw, hz: h.hl, stufe: h.stufe };
        return { mx: re.cx, mz: re.cz, y0: e._fahr.y + h.stufe, y1: e._fahr.y + h.dach, re };
    };
    // DAS EINDRINGEN in eine Box; außer Band −Infinity (die Regeln der Hüllen: die Stufe trägt, der Wagen überrollt Dünneres)
    const inBox = (k, b) => {
        if (k.re ? !(b.topY > k.y0 && b.botY < k.y1) || b.dick < k.re.stufe : !(b.topY > k.y0 + STUFE && b.botY < k.y1))
            return -Infinity;
        const R = rahmen(b);
        if (!k.re) return Math.max(...k.kreise.map(([x, z, rr]) => rr - zuBox(R, x, z)));
        const h = k.re;
        const achsen = [R, h].flatMap((Q) => [[Q.c, -Q.s], [Q.s, Q.c]]);
        return Math.min(...achsen.map(([ux, uz]) => weite(R, ux, uz) + weite(h, ux, uz) - Math.abs((h.cx - R.cx) * ux + (h.cz - R.cz) * uz)));
    };
    // DER DURCHTRITT: die Mitte jenseits der Mitte des Ziels `b`, an einer gedrehten WAND jenseits ihrer Mittel-Ebene
    const werkH = (e, b, wand) => {
        const R = rahmen(b);
        const quer = (x, z) => (([u, w]) => (R.hx < R.hz ? [u, w, R.hz] : [w, u, R.hx]))(lokal(R, x, z));
        const seite = Math.sign(quer(R.cx - 10, R.cz)[0]);
        return {
            wer: e.type + "#" + e.id,
            e,
            x: R.cx,
            tiefe: (k) => Math.max(...e.blockerAABBs.map((bb) => inBox(k, bb))),
            durch: (k) => {
                const [n, l, h] = quer(k.mx, k.mz);
                return wand ? Math.sign(n) !== seite && Math.abs(l) <= h : k.mx > R.cx;
            },
        };
    };
    const leibH = (q) => ({
        wer: "baer#" + q.userData.netId,
        durch: (k) => k.mx > q.position.x,
        tiefe: (k) => {
            const { l, kreise } = leibKreise(q);
            if (!(k.y1 > q.position.y && k.y0 < q.position.y + l.hoehe)) return -Infinity;
            const [a, , b] = kreise;
            let t = -Infinity;
            for (let i = 0; i <= 8; i++) {
                const [x, z] = [a[0] + ((b[0] - a[0]) * i) / 8, a[1] + ((b[1] - a[1]) * i) / 8];
                if (k.re) t = Math.max(t, l.radius - zuBox(k.re, x, z));
                else for (const [kx, kz, rr] of k.kreise) t = Math.max(t, rr + l.radius - Math.hypot(kx - x, kz - z));
            }
            return t;
        },
    });
    // DER LAUF: gemessen nach jedem Bild und nach dem Kontakt jedes Sim-Schritts (`_loopPhysicsSync`)
    const fahre = (kad, sek, paare, je) => {
        const m = paare.map(() => ({ tief: -Infinity, spalt: Infinity, durch: false }));
        const miss = () =>
            paare.forEach(([kf, H], i) => {
                const k = kf();
                const d = H.tiefe(k);
                if (d === -Infinity) return;
                m[i].tief = Math.max(m[i].tief, d);
                m[i].spalt = Math.min(m[i].spalt, Math.max(0, -d));
                if (H.durch(k)) m[i].durch = true;
            });
        r._loopPhysicsSync = function (...a) {
            Object.getPrototypeOf(r)._loopPhysicsSync.apply(this, a);
            miss();
        };
        try {
            for (let t = 0; t < sek; t += KAD[kad] / 1000) {
                if (je) je();
                takt(KAD[kad]);
                miss();
            }
        } finally {
            delete r._loopPhysicsSync;
        }
        return m;
    };
    const zeile = (koerper, hindernis, kad, v, H, m) =>
        aus.zeilen.push({
            koerper,
            hindernis,
            kad,
            v: +v.toFixed(2),
            wer: H.wer,
            durch: m.durch,
            tief: +Math.max(0, m.tief).toFixed(3),
            spalt: Number.isFinite(m.spalt) ? +m.spalt.toFixed(3) : 999,
        });
    // DER GANG: der Läufer fährt den Sprint seiner Gestalt, der stehende Bär 0, jedes andere Tier sein Gesetz
    const roh = A._steuerGesetz;
    const gesetz = roh.call(A);
    const steuer = Object.create(gesetz);
    let renner = null;
    let steher = null;
    steuer.steuerSchritt = (z, wx, wz, dt, L) => {
        if (z === renner || z === steher) z.v = z === renner ? gesetz.sprintTempo(L) : 0;
        else gesetz.steuerSchritt(z, wx, wz, dt, L);
    };
    const tier = (art, gr, x, z, gier) => {
        st.maxCreatures = Math.max(st.maxCreatures, st.creatures.length + 1);
        const c = r.spawnCreatureAt(x, hh(x, z) + 0.5, z, "calm", art, { precise: true, bodySize: gr });
        if (!c) throw new Error(`kein ${art} bei ${x.toFixed(1)}/${z.toFixed(1)}`);
        c.position.set(x, hh(x, z), z);
        c.rotation.y = gier;
        c.userData._steuer = { gier, v: 0 };
        c.userData._stossV = null;
        return c;
    };
    const baer = (x, z) => {
        const b = tier("baer", 1, x, z, 0);
        if (b) steher = b.userData._steuer;
        return b;
    };
    const werke = [];
    const setze = async (typ, x, z, fertig, rotationY) => {
        const e = r.spawnArchitecture(typ, { x, y: hh(x, z) + 0.5, z }, { silent: true, precise: true, rotationY });
        if (!e) return null;
        werke.push(e);
        await window.__gebautNach(e, { fertig: () => !!fertig(e), bau: () => r._populateBlockerAABBs(e) });
        return e;
    };
    // DIE HINDERNISSE je auf ihrer Bahn z: Mauer (EIN Teil, 11° gedreht, Welt-AABB 1,5 m breit) und Haus (Westwand, 34°, `_hausObb`)
    // an der ECHTEN Box, Felsblock, Mammutbaum, der stehende Bär quer; die Bahn-Wache räumt, was dort wächst
    st.blueprints._t_kontakt_mauer = {
        name: "_t_kontakt_mauer",
        parts: [
            { shape: "box", material: "stein", position: { x: 0, y: 1.25, z: 0 }, size: { x: 0.35, y: 2.5, z: 6 } },
        ],
    };
    const BAHN = { mauer: MW.z, fels: MW.z + 8, baum: MW.z - 8, leib: MW.z - 16, haus: MW.z };
    const H = {};
    // je Hindernis sein Ziel (null, solange es nicht steht)
    const westlich = (bs) => bs.reduce((a, b) => (!a || b.minX < a.minX ? b : a), null);
    const ziele = [
        ["mauer", "_t_kontakt_mauer", 14, (e) => (e.blockerAABBs || []).length === 1 && e.blockerAABBs[0], 0.2],
        ["fels", "stein_block", 14, (e) => westlich(e.blockerAABBs || [])],
        ["baum", "baum_mammut", 14, (e) => (e.blockerAABBs || []).find((b) => b.dick >= 0.3 && b.botY < hh(e.position.x, e.position.z) + STUFE)],
        [
            "haus",
            "haus_alemannisch",
            30,
            (e) => e._hausHuelle && westlich(e.blockerAABBs.filter((b) => b.topY - b.botY > 1.5 && rahmen(b).hx < 0.3 && rahmen(b).hz > 1.5)),
            0.6,
        ],
    ];
    try {
        for (const [n, typ, dx, ziel, rot] of ziele) {
            const e = await setze(typ, MW.x + dx, BAHN[n], ziel, rot || 0);
            if (!e || !ziel(e)) throw new Error(`${typ} steht nicht`);
            H[n] = werkH(e, ziel(e), rot > 0);
        }
        for (const [n, z] of Object.entries(BAHN))
            for (const o of st.architectures.slice())
                if (
                    o &&
                    !werke.includes(o) &&
                    r._istNatur(o) &&
                    (o.blockerAABBs || []).some(
                        (b) => b.maxX > MW.x - 12 && b.minX < MW.x + 40 && b.maxZ > z - 2.5 && b.minZ < z + 2.5
                    )
                )
                    r.removeArchitecture(o);
        // der Start: `vor` m Anlauf vor der Stelle, an der die Reichweite `reich` jede Box um 1 m verfehlt (nie in einer geboren)
        const LX = MW.x + 8;
        const start = (n, vor, reich) => {
            if (n === "leib") return [LX - 0.3 - reich - 1 - vor, BAHN.leib];
            const band = H[n].e.blockerAABBs.filter((b) => b.botY < hh(H[n].x, BAHN[n]) + 4);
            let t = 0;
            while (t < 30 && band.some((b) => zuBox(rahmen(b), H[n].x - t, BAHN[n]) < reich + 1)) t += 0.25;
            return [H[n].x - t - vor, BAHN[n]];
        };
        const ziel = (n, steht) => (n === "leib" ? leibH(steht) : H[n]);
        const abseits = ([x, z]) => {
            pm.position.set(x - 3, hh(x - 3, z - 3) + 1.2, z - 3);
            st.playerVel.setValue(0, 0, 0);
            st._fieldVy = 0;
        };
        const lauf = async (n, rufe) => {
            const steht = n === "leib" ? baer(LX, BAHN.leib) : null;
            await rufe(ziel(n, steht));
            if (steht) r.removeCreature(steht);
        };
        const galopp = (name, art, gr, n, kad) =>
            lauf(n, (Hn) => {
                const p = start(n, 2.5, 0.9 * gr);
                abseits(p);
                const c = tier(art, gr, p[0], p[1], Math.PI / 2);
                renner = c.userData._steuer;
                const v = gesetz.sprintTempo(r._kreaturHueftL(c));
                zeile(name, n, kad, v, Hn, fahre(kad, 4 / v + 0.6, [[tierK(c), Hn]])[0]);
                r.removeCreature(c);
            });
        A._steuerGesetz = () => steuer;
        // DIE TIERE im Galopp
        const riese = A._verhaltenGesetz().groessen.slice(-1)[0].max;
        for (const [name, art, gr] of [
            ["fuchs", "fuchs", 1],
            ["wolf", "wolf", 1],
            ["baer", "baer", 1],
            ["riese", "baer", riese],
        ])
            for (const n of HINDERNISSE)
                for (const kad of ["144", "60", "30", "deckel"]) await galopp(name, art, gr, n, kad);
        // (T) der Fuchs im Takt-Deckel mit EINEM Schritt je Takt
        const teil = A.LEIB_TEIL;
        A.LEIB_TEIL = { radius: Infinity, minM: Infinity };
        await galopp("schmuggel", "fuchs", 1, "mauer", "deckel");
        A.LEIB_TEIL = teil;
        aus.schmuggel = aus.zeilen.pop();
        // DER SPIELER gehend und im Sprint (seine Tasten)
        for (const [name, sprint] of [
            ["gehen", false],
            ["sprint", true],
        ])
            for (const n of HINDERNISSE)
                for (const kad of ["60", "deckel"])
                    await lauf(n, (Hn) => {
                        const [x, z] = start(n, 1.5, A.PLAYER_WALL_RADIUS);
                        pm.position.set(x, hh(x, z) + A.PLAYER_FOOT_OFFSET + 0.05, z);
                        st.yaw = Math.PI / 2;
                        tasten(true, sprint);
                        const v = sprint ? st.sprintSpeed : st.speed;
                        zeile(name, n, kad, v, Hn, fahre(kad, 3 / v + 0.8, [[spielerK, Hn]])[0]);
                        tasten(false);
                    });
        // DER FALL: die Sohle nie mehr als eine Stufe unter dem Boden
        const Hb = { wer: "boden", tiefe: (k) => hh(k.kreise[0][0], k.kreise[0][1]) - k.y0 };
        Hb.durch = (k) => Hb.tiefe(k) > STUFE;
        for (const kad of ["60", "deckel"]) {
            const [x, z] = [MW.x - 10, MW.z - 4];
            pm.position.set(x, hh(x, z) + K.FALL_M, z);
            st.playerVel.setValue(0, 0, 0);
            st._fieldVy = 0;
            let vf = 0;
            const [m] = fahre(
                kad,
                Math.sqrt((2 * K.FALL_M) / 9.81) + 1.2,
                [[spielerK, Hb]],
                () => (vf = Math.max(vf, -st._fieldVy))
            );
            zeile("fall", "boden", kad, vf, Hb, m);
        }
        // DER WAGEN bei vmax (W), und der Bär, den er stößt, 2 m vor der Mauer
        for (const n of HINDERNISSE)
            for (const kad of ["60", "deckel"]) {
                const steht = n === "leib" ? baer(H.mauer.x - 2.7, BAHN.mauer) : null;
                const [x, z] = n === "leib" ? [H.mauer.x - 12, BAHN.mauer] : start(n, 3, 2.5);
                pm.position.set(x, hh(x, z) + 1.2, z);
                const e = r.spawnArchitecture(
                    "fahrzeug_gt",
                    { x, y: hh(x, z) + 0.5, z },
                    { silent: true, precise: true, rotationY: 0 }
                );
                await window.__gebautNach(e);
                if (!(r.mountArchitecture(e) || {}).ok) throw new Error("kein Ritt im GT");
                tasten(false);
                for (let i = 0; i < 12; i++) takt(1000 / 60);
                const vmax = r._vehicleProfile(e).vmax;
                e._fahr.vlong = vmax;
                st.playerVel.setValue(vmax, st.playerVel.y(), 0);
                tasten(true, false);
                const Hn = steht ? leibH(steht) : H[n];
                let vs = 0;
                const paare = [[wagenK(e), Hn], ...(steht ? [[tierK(steht), H.mauer]] : [])];
                const [m, mb] = fahre(kad, 12 / vmax + 0.9, paare, () => {
                    const sv = steht && steht.userData._stossV;
                    if (sv) vs = Math.max(vs, Math.hypot(sv.x, sv.z));
                });
                tasten(false);
                zeile("gt", n, kad, vmax, Hn, m);
                if (mb) zeile("gestossen", "mauer", kad, vs, H.mauer, mb);
                r.dismountArchitecture();
                r.removeArchitecture(e);
                if (steht) r.removeCreature(steht);
            }
    } catch (f) {
        aus.fehler = (f && f.message) || String(f);
    } finally {
        A._steuerGesetz = roh;
        tasten(false);
        for (const e of werke) r.removeArchitecture(e);
        delete st.blueprints._t_kontakt_mauer;
    }
    return aus;
}

(async () => {
    console.log("=== KOLLISION = BILD (Leben-Schau 2) — Null-Renderer, Foundry an, Mess-Wiese 150 m + Exemplare ===");
    await new Promise((r) => server.listen(PORT, "127.0.0.1", r));
    const browser = await starteBrowser({ art: "null", frist: 900000 });
    const page = await browser.newPage();
    page.setDefaultTimeout(880000);
    const pageErrors = [];
    page.on("pageerror", (e) => pageErrors.push((e.stack || e.message || String(e)).split("\n")[0]));
    await nullRenderer(page);
    let befund = null;
    try {
        await page.goto(`http://127.0.0.1:${PORT}/index.html`, { waitUntil: "domcontentloaded", timeout: 120000 });
        await warteAufWelt(page, 180000);
        befund = await page.evaluate(probe, {
            mess: messort("wiese"),
            R: 150,
            SEITE_M,
            OBEN_ANTEIL,
            KOERPER_BAND_M,
            FEST: [...FEST],
            STRENG,
            exemplare: PFLICHT_EXEMPLARE,
        });
        befund.tempo = await page.evaluate(tempo, { mess: messort("wiese"), FALL_M, HINDERNISSE });
    } catch (e) {
        befund = { fehler: (e && e.message) || String(e) };
    }
    await browser.close();
    server.close();
    if (!befund || befund.fehler) {
        console.log("❌ LAUF-FEHLER: " + (befund ? befund.fehler : "kein Befund"));
        process.exit(1);
    }
    befund.pageErrors = pageErrors;
    console.log(`  Ring ${befund.ring} Chunks · ${befund.zensus.werke} Studio-Werke gezählt`);
    console.log(
        "  Klasse (Typ→Gestalt)                     n   Blocker ohne Bild seitlich/oben (m)   Bild ohne Blocker (m)"
    );
    for (const [k, kl] of Object.entries(befund.zensus.klassen).sort(
        (a, b) => b[1].seiteMax + b[1].obenMax - a[1].seiteMax - a[1].obenMax
    ))
        console.log(
            `  ${k.padEnd(40)} ${String(kl.n).padStart(4)}   ${kl.seiteMax.toFixed(2).padStart(6)} / ${kl.obenMax.toFixed(2).padEnd(6)}` +
                `                 ${kl.nebenMax.toFixed(2)}`
        );
    console.log(`  Exemplare: ${JSON.stringify(befund.exemplare)}`);
    console.log(`  Schmuggel (T): ${JSON.stringify(befund.schmuggel)} · Tor: ${JSON.stringify(befund.schmuggelTor)}`);
    console.log(`  Bauten des Haupt-Threads (K): ${(befund.bauten || []).length}`);
    console.log(`  Quelle: ${JSON.stringify(befund.quelle)}`);
    // OFFEN (nie grün gezählt): Haus und Ausstattung — Bild im Körper-Band ohne Box, Zahl und Ort im Werk-Rahmen (x/y/z)
    for (const o of befund.offen || [])
        console.log(
            `  OFFEN (U) ${o.kind}: ${o.wer} — das Bild steht ${o.mass.toFixed(2)} m neben jeder Box (bei ${o.wo})`
        );
    const Z = (befund.tempo || {}).zeilen || [];
    console.log(`  (V) Kontakt beim Tempo: ${Z.length}/${TEMPO_ZEILEN.length} Zeilen · Schmuggel ${JSON.stringify(befund.tempo.schmuggel)}`);
    for (const k of new Set(Z.map((z) => z.koerper))) {
        const J = Z.filter((z) => z.koerper === k);
        const max = (f) => Math.max(...J.map(f)).toFixed(3);
        console.log(
            `      ${k.padEnd(10)} ${max((z) => z.v)} m/s · Durchtritt ${J.filter((z) => z.durch).length}/${J.length} · Eindringen max ${max((z) => z.tief)} m · Spalt max ${max((z) => z.spalt)} m`
        );
    }
    const v = urteil(befund);
    if (v.length) {
        console.log("\n❌ KOLLISION = BILD ROT:\n  " + v.join("\n  "));
        process.exit(1);
    }
    console.log(
        "\n✅ KOLLISION = BILD GRÜN — jede Box hat ihr Bild; Fels, Tor (außer der Passage) und Wagen: jedes Bild im Körper-Band " +
            "liegt an einer Box; jedes feste Werk trägt Boxen; kein Blocker baut eine Gestalt auf dem Haupt-Thread; kein Körper " +
            "dringt beim Tempo des Spiels in ein Hindernis" +
            ((befund.offen || []).length ? ` — OFFEN: ${befund.offen.length} Werk(e) mit Bild ohne Box (oben)` : "")
    );
    process.exit(0);
})();
