#!/usr/bin/env node
// ─────────────────────────────────────────────────────────────────────────
// diag-fall-waechter.cjs — DER FALL-WÄCHTER (Familie koerper-bild): jeder Körper — Wagen, Ritt, gestoßenes und gehendes
// Tier, Spieler — steht auf dem Boden UNTER ihm (`_koerperBodenUnter`), keiner fällt durch ihn, keiner springt aufs Dach.
// Die Wand (Null-Renderer, echter
// Spiel-Takt `_gameLoopTick`, die Boden-Wahrheit ist das Dichtefeld selbst — der erste Fels unter dem Körper):
//   (O) DIE ORTE DER SCHAU
//       O1 der Wagen im Spaltgrund unter dem Überhang (die nächste Spalte der Welt, in die er passt — welt-orte `hoehle`): aufgesessen, in der Luft wie in der Schau — nach 4 s
//          steht er auf seinem Grund (≤ STEHT_M daneben), er war nie tiefer als FALL_M unter ihm;
//       O2 die Fahrt der Schau: der GT mit 10,6 m/s über die Spaltkante, 20 s — nie
//          tiefer als FALL_M unter seinem Grund, nie unter der Todes-Ebene;
//       O3 die Höhle der Boden-Funktion (die nächste Kammer der Welt mit Wand, welt-orte `hoehle`): ein Wagen auf dem Höhlen-Grund,
//          ein an die nächste Wand gestoßener Wolf, ein in sie laufender Wolf, der Spieler zu Fuß — jeder steht am Ende auf
//          dem Grund, keiner unter ihm, keiner auf dem Dach (die Wand hält den Leib); und ein Wolf, der auf dem Grund
//          STIRBT, in TOD_GIER Blickrichtungen: die tiefste Stelle seiner Haut (je Punkt gegen den Fels unter ihm, absolut)
//          liegt nach dem Kippen nie tiefer als TOD_M im Fels und nie höher als TOD_LIEGT_M über ihm (über einem Stand
//          darüber), sinkt im Kippen nie tiefer, als der Leib stand, schwebt nie über TOD_SCHWEBT_M. Der lebende Stand liegt nie tiefer als TOD_M im
//          Fels (STAND IM FELS), und der in die Wand laufende Wolf steht am Ende nie mit der Stirn höher über seinem Heck, als
//          der Gang-Deckel über die Länge trägt oder als sie beim Anlauf stand, + STIRN_M (KLETTERWAND);
//   (B) DER TURM (bauen.K4): je Klick der rechten Maus (`tryMousePlace`, der Blick senkrecht nach unten) ein Block unter dem
//       Spieler: der Stand steigt je Block ≥ HUB_ANTEIL · r, die Sohlen liegen ≤ SOHLE_M neben dem Mesh (`_bodenSichtAt`), der
//       Turm trägt ≥ TURM_M; vom Klick an zeichnet das Bild den Block unter dem Fuß — in JEDEM Takt, auch im Flug der Rettung
//       (BLIND: unter einem Bein kein gezeichneter Boden oder einer mehr als BLIND_M unter der Krone des Blocks; die Sohle allein
//       misst nur die Takte mit Stand und sah die fehlende Gestalt nur, wenn die Landung vor dem Neubau aus dem Faden kam — CI
//       2 Kerne: „SOHLE 198 m“ in 3 von 4 Läufen, lokal 6 von 6 grün); nach dem Reload steht jeder Edit, die Hülle ohne Loch,
//       der Spieler oben;
//   (B2) DER TURM AUF DACH, FELS UND BRÜCKE (bauen.K4#2): derselbe Turm im Haus der Werkstatt (vom Dachboden durch das Dach),
//       auf der Felsdecke über der nächsten Spalte und auf dem Deck der Brücke des Prüf-Satzes, je in Ego und Third — die
//       Sohlen auf der obersten Fläche (`_bodenSichtAt`); dann der Spieler FERN_M fern: der Fern-Ring trägt die Krone, ein Block
//       auf sie (`voxel_fill`) steht ≤ FERN_S Spielzeit in seinen Lage-Bytes (byte-Diff); nach dem Reload jeder Edit, kein Loch;
//   (Z) DER ZENSUS: je Ort die Überhang-Spalten im Umkreis (Luft ≥ 3 m unter ≥ 2 m Fels, ihr Grund begehbar) — Wagen und
//       an die nächste Wand gestoßener Wolf je Spalte, gerichtet von derselben Wand wie O (`fall`); ROT je Körper beim Namen,
//       Ort und Maß;
//   (T) DER EINGESCHMUGGELTE TÄTER: im selben Lauf liest der Boden des Werks die Oberkante der Säule (der alte Leser) — O1
//       MUSS durch dieselbe Wand (`fall`) rot fallen, beim Namen;
//   (Q) DIE QUELLE (am AST, die Glieder und Rufe des Stamms `stammLib.rufe`): die Körper-Schritte lesen ihren Boden nur über `_koerperBodenUnter` — kein
//       `getTerrainHeightAt` / `_voxelSurfaceY` / `findSurfaceAbove` / `_terrainMacroSurfaceY` in ihnen (dass sie
//       den Boden unter dem Leib lesen, beweist (O) am Verhalten); JEDE andere Methode, die einen dieser Leser ruft UND die Höhe eines Leibs berührt
//       (`.position.y`, `.position.set`), ist als Platzierung/Welt-Leser benannt (OBERKANTE_BENANNT, mit Grund) — sonst
//       ROT beim Namen (UNBENANNT), ein Name ohne Leser ist VERALTET;
//   (P) kein Page-Error — der EINE Sammler (welt-boot) macht den Lauf ROT mit Namen.
// SELBSTTEST (--selftest, ohne Browser, in `npm run check`): ein Befund mit jedem Täter MUSS rot fallen und ihn beim Namen
// nennen; die Quellen-Wand nennt eine eingeschleuste Zeile in einer Kopie des Stamms (und ist am Stamm grün).
//   node scripts/diag-fall-waechter.cjs [--selftest]   (npm run gate:fall-waechter; Port FALL_WAECHTER_PORT)
// ─────────────────────────────────────────────────────────────────────────
"use strict";
const { statikServer, warteAufWelt, ROOT: root, sleep, hauptLauf, pruefer, taeterFaelle, selbsttestEnde, nullSeite, urteilEnde, stammLib, SELBSTTEST } = require("./lib/welt-boot.cjs");
const { WELT_ORTE_INSTALL } = require("./lib/welt-orte.cjs");
const PRUEF_SATZ = require("../spec/pruefsatz/bauen-k3.json"); // die Brücke auf zwei Pfeilern (B2)

const FALL_M = 1.0; // so tief darf ein Körper nie unter dem Fels unter ihm liegen
const STEHT_M = 0.6; // so nah steht ein ruhender Körper an seinem Grund (Rad-Ebene, Nick, Sohle)
const DACH_M = 2.0; // höher über dem Grund steht er nicht — er sprang aufs Dach
// DIE TOD-LAGE gegen die Fels-Wahrheit (die tiefste Stelle der Haut über dem Fels, absolut — ein Stand, der schon im Hang
// steckt, ist nie das Soll des Liegens):
const TOD_M = 0.15; // so tief liegt sie nie im Fels, und im Kippen nie tiefer, als der Leib stand
const TOD_LIEGT_M = 0.25; // so hoch über dem Fels liegt sie höchstens (über einem Stand darüber; das 0,5-m-Raster der Tafel liegt
// auf einem 50°-Hang bis 0,2 m unter dem Fels)
const TOD_SCHWEBT_M = 0.5; // so hoch hebt die Tod-Lage die tiefste Stelle im Kippen nie (die Flanke legt sich auf den Boden)
const TOD_GIER = 8; // so viele Blickrichtungen stirbt der Wolf am Ort (die Lage hängt an der Kipp-Richtung und am Leib darüber)
// IN DER HÖHLE steht ein Tier auf dem Gesetz (die Sicht hat dort keine Karte): so weit liegt seine Wurzel höchstens neben dem
// Fels unter ihr — die Ebene seiner vier Proben über einem gekrümmten Grund (am Wandfuß), nie ein Sicht-Band von 2 m
const HOEHLE_M = 0.25;
// so viel mehr, als der Gang-Deckel über die Länge des Leibs trägt, steht seine Stirn höchstens über seinem Heck (der Halt
// halbiert seinen Schritt viermal, die Linse misst das Dichtefeld in 2-cm-Schritten)
const STIRN_M = 0.1;
// DER TURM (B): Blöcke, ihr Maß, die Höhe über dem Gelände, die Sohle neben dem Mesh, der Hub in r
const [TURM_BLOECKE, TURM_R, TURM_M, SOHLE_M, HUB_ANTEIL] = [20, 3.5, 60, 0.15, 0.8];
// so tief liegt der gezeichnete Boden unter dem Fuß höchstens unter der Krone des Blocks (y + r), ab dem Klick: die Krone des
// Netzes liegt ~0,1 m unter der Säule des Gesetzes, ein Block ohne Gestalt zeigt nichts (null) oder den Grund Meter darunter
const BLIND_M = 1;
// B2: die Unterlagen × Sichten, der Abstand des Spielers zum Turm (jenseits der Chunks, im Fern-Ring) und die Frist des Rings
const [UNTERLAGEN, SICHTEN, FERN_M, FERN_S] = [["Dach", "Fels", "Brücke"], { Ego: "first", Third: "third" }, 320, 1];
// Die Körper-Schritte und die Leser, die nie den Boden eines Körpers liefern dürfen.
const KOERPER_SCHRITTE = [
    "_fahrBoden",
    "_werkBoden",
    "_rittEbene",
    "_rittSchritt",
    "_kreaturStossSchritt",
    "_creatureGroundY",
    "_creatureSlopeProbe",
    "_koerperSchritt",
    "_todHebeTafel",
];
const DACH_LESER = new Set(["getTerrainHeightAt", "_voxelSurfaceY", "findSurfaceAbove", "_terrainMacroSurfaceY"]);
// DIE ANDEREN LESER DER OBERKANTE, die die Höhe eines Leibs berühren: jede Methode, die einen Dach-Leser ruft UND
// `.position.y` liest oder schreibt (oder `.position.set` ruft), ist ein Körper-Schritt (oben, dort ist die Oberkante
// verboten) oder hier BENANNT — mit ihren erlaubten Dach-Lesern und dem Grund. Eine unbenannte ist ROT beim Namen, eine
// benannte, die nicht mehr liest, ist VERALTET (die Liste wandert mit dem Stamm).
const OBERKANTE_BENANNT = {
    _playerDeathRespawn: [["getTerrainHeightAt"], "Platzierung: der Spieler ersteht auf der Oberfläche"],
    _rescuePlayerFromVoid: [["getTerrainHeightAt"], "Platzierung: die Rettung aus der Leere auf die Oberfläche"],
    _stepCharacter: [
        ["findSurfaceAbove"],
        "Platzierung: die Todes-Ebene hebt den Spieler unter der Welt auf die Oberfläche",
    ],
    _creatureWaterContextAt: [["_voxelSurfaceY"], "Ufer-Suche: Land in den Nachbar-Spalten, nie der Boden des Leibs"],
    _bergSchattenVerdeckt: [["_terrainMacroSurfaceY"], "Sicht: die Berg-Verdeckung einer Region (kein Leib)"],
    _bodenUmzug: [
        ["_voxelSurfaceY", "_terrainMacroSurfaceY"],
        "Platzierung: ein Save eines alten Bodens setzt Bauten, Gruben und Spieler auf die Oberfläche des neuen (K16)",
    ],
};

// DIE QUELLEN-WAND (am AST: die Glieder und Rufe des Stamms, `stammLib.rufe`): je Körper-Schritt die Rufe eines Dach-Lesers
// (Täter); jeder andere Leser der Oberkante, der die Höhe eines Leibs berührt (`.position.y`, `.position.set(`), ist benannt
// (OBERKANTE_BENANNT) oder ein Täter.
function quellenWand(quelle, benannt = OBERKANTE_BENANNT) {
    const [befunde, je, gl, leib] = [
        [],
        new Map(),
        new Map(stammLib.glieder(quelle).map((g) => [g.name, g])),
        new Set(),
    ];
    for (const c of stammLib.rufe(quelle))
        if (DACH_LESER.has(c.name) && !DACH_LESER.has(c.glied) && gl.has(c.glied))
            je.set(c.glied, [
                ...(je.get(c.glied) || []),
                [
                    c.name,
                    `${c.glied} Zeile ${stammLib.zeileVon(quelle, c.start)} ruft ${c.name} (die Oberkante der Säule)`,
                ],
            ]);
    for (const m of KOERPER_SCHRITTE) if (!gl.has(m)) befunde.push(`${m} fehlt im Stamm (die Wand kennt ihn)`);
    for (const [m, dach] of je) {
        const [g, b] = [gl.get(m), benannt[m] || [[]]];
        if (KOERPER_SCHRITTE.includes(m)) befunde.push(...dach.map((d) => d[1]));
        else if (/\.position\.(?:y\b|set\()/.test(stammLib.ohneKommentare(quelle.slice(g.start, g.ende))))
            for (const [nm, t] of leib.add(m) && dach)
                if (!b[0].includes(nm))
                    befunde.push(
                        `UNBENANNT: ${t} und berührt die Höhe eines Leibs — Körper-Schritt (_koerperBodenUnter) oder benannte Platzierung?`
                    );
    }
    for (const m of Object.keys(benannt))
        if (!leib.has(m))
            befunde.push(
                `VERALTET: ${m} ist benannt, liest aber keine Oberkante an einem Leib mehr (die Liste wandert mit)`
            );
    return befunde;
}

// Das Urteil über einen Turm (B, B2 `wo`): je Block [Hub, Sohle neben dem Mesh], nach dem Reload `nach`; in B2 der Ring `ring`
// (die Krone im Ring vor dem Block, die Takte, bis seine Lage-Bytes den Block auf der Krone zeigen) — der Stand nach dem Reload
// gilt dem Turm des Saves (B).
function turmUrteil(t, wo = "B") {
    const B = wo === "B";
    if (!t || t.fehler || !t.nach) return [`LEER: ${wo} Turm: ${t ? t.fehler || "kein Reload" : "fehlt"}`];
    const [v, n, f, g] = [[], t.nach, (x) => Number(x).toFixed(2), t.ring || {}];
    if (t.bloecke.length !== TURM_BLOECKE) v.push(`LEER: ${wo} Turm: ${t.bloecke.length} Blöcke`);
    t.bloecke.forEach(([hub, sohle, blind], k) => {
        if (!(hub >= HUB_ANTEIL * TURM_R)) v.push(`(${wo}) KEIN HUB: Block ${k + 1} hob ${f(hub)} m`);
        if (!(sohle <= SOHLE_M)) v.push(`(${wo}) SOHLE: Block ${k + 1} ${f(sohle)} m neben dem Mesh`);
        if (blind !== 0) v.push(`(${wo}) BLIND: Block ${k + 1} — ${blind} Takte ohne Boden im Bild`);
    });
    if (!(t.hoehe >= TURM_M)) v.push(`(${wo}) ZU NIEDRIG: ${f(t.hoehe)} m über ${B ? "dem Gelände" : "der Unterlage"}`);
    if (n.edits !== t.bloecke.length + !B || n.loecher || (B && !(n.sohle <= SOHLE_M && n.hoehe >= t.hoehe - SOHLE_M)))
        v.push(
            `(${wo}) RELOAD: ${n.edits} Edits, ${n.loecher} Löcher` +
                (B ? `, Sohle ${f(n.sohle)} m, Stand ${f(n.hoehe)} m` : "")
        );
    if (!B && !(g.vor >= g.krone - SOHLE_M))
        v.push(`(${wo}) FERN-RING OHNE TURM: ${f(g.vor)} m an der Krone ${f(g.krone)} m`);
    if (!B && !(g.takte / 60 <= FERN_S))
        v.push(`(${wo}) FERN-RING ` + (g.takte ? `ZU SPÄT: ${f(g.takte / 60)} s` : "OHNE EDIT nach 120 Takten"));
    return v;
}
const turm2Urteil = (liste) =>
    UNTERLAGEN.flatMap((u) =>
        Object.keys(SICHTEN).flatMap((s) =>
            turmUrteil(
                (liste || []).find((t) => t.wo === u + " " + s),
                `B2 ${u} ${s}`
            )
        )
    );

// DER FALL eines Leibs (O, Z, T): tiefer als `fallM` unter dem Fels unter ihm (ein Tier steht auf der Sicht — Q4, Lehre 22: der
// sichtbare Boden ist das Mesh —, sein Leib darf so weit neben dem Gesetz liegen, wie das Stand-Band des Spiels trägt, `band`
// STAND_SICHT_BAND; Wagen und Spieler stehen auf dem Gesetz), unter der Todes-Ebene, höher als DACH_M über dem Grund, auf den er
// gesetzt war (das Dach).
function fall(p, fallM = Math.max(FALL_M, p.band || 0)) {
    const [wo, soll] = [
        `${p.name} — ${p.koerper} bei ${p.ort}`,
        Number.isFinite(p.grundSoll) ? p.grundSoll : p.grundEnde,
    ];
    return [
        p.tiefsteUnter > fallM &&
            `(O) DURCH DEN BODEN: ${wo} lag ${p.tiefsteUnter.toFixed(2)} m unter dem Fels unter ihm (am Ende y ${p.yEnde.toFixed(2)}, Grund ${p.grundEnde.toFixed(2)})`,
        p.todesEbene && `(O) UNENDLICHER FALL: ${wo} fiel unter die Todes-Ebene (y ${p.yMin.toFixed(1)})`,
        p.yEnde - soll > DACH_M &&
            `(O) AUF DEM DACH: ${wo} steht ${(p.yEnde - soll).toFixed(2)} m über dem Grund, auf den er gesetzt war (y ${p.yEnde.toFixed(2)}, Grund ${soll.toFixed(2)}, Säulen-Oberkante ${p.dach.toFixed(2)})`,
    ].filter(Boolean);
}

// Das Urteil über einen Befund: Liste der Verstöße (leer = grün). Rein, im Selbsttest wie im Lauf.
function urteil(b) {
    const v = [];
    const proben = b.proben || [];
    for (const name of [
        "O1 Wagen unter dem Überhang",
        "O2 Schau-Fahrt über die Spaltkante",
        "O3 Wagen in der Höhle",
        "O3 Wolf in der Höhle",
        "O3 Spieler in der Höhle",
        "O3 Wolf läuft in die Wand",
        "O3 Wolf stirbt in der Höhle",
    ])
        if (!proben.some((p) => p.name === name)) v.push(`LEER: die Probe „${name}" fehlt`);
    for (const p of proben) {
        if (p.fehler) {
            v.push(`LEER: ${p.name}: ${p.fehler}`);
            continue;
        }
        const wo = `${p.koerper} bei ${p.ort}`;
        // IN DER HÖHLE (O3) hat die Sicht keine Karte (sie trägt die Oberkante der Säule): dort steht auch das Tier auf dem
        // Gesetz, und sein Band ist HOEHLE_M
        const hoehle = Number.isFinite(p.band) && p.name.startsWith("O3 ");
        const stehtM = hoehle ? HOEHLE_M : Math.max(STEHT_M, p.band || 0);
        v.push(...fall(p, hoehle ? HOEHLE_M : undefined));
        if (
            p.ruhe &&
            !(Math.abs(p.yEnde - p.grundEnde) <= stehtM) &&
            !(p.yEnde - (Number.isFinite(p.grundSoll) ? p.grundSoll : p.grundEnde) > DACH_M)
        )
            v.push(
                `(O) STEHT NICHT: ${p.name} — ${wo} ruht ${(p.yEnde - p.grundEnde).toFixed(2)} m über seinem Grund ` +
                    `(y ${p.yEnde.toFixed(2)}, Grund ${p.grundEnde.toFixed(2)})`
            );
        // DIE KLETTERWAND: der laufende Leib hält, wo seine Stirn die Wand erreicht — sie steht nie höher über
        // seinem Heck, als der Gang-Deckel über die Länge des Leibs trägt (`_kreaturKletterwand`), oder als sie beim Anlauf
        // schon stand (ein Leib, den der Ruf oder ein Stoß in eine steile Mulde setzte, läuft nur nicht hinauf)
        if (p.name === "O3 Wolf läuft in die Wand") {
            const s = p.stirn;
            if (!s || !Number.isFinite(s.hoch) || !Number.isFinite(s.start) || !Number.isFinite(s.deckel))
                v.push(`LEER: ${p.name} — keine Stirn gemessen`);
            else if (s.hoch > Math.max(s.deckel, s.start) + STIRN_M)
                v.push(
                    `(O) KLETTERWAND: ${p.name} — ${wo} steht mit der Stirn ${s.hoch.toFixed(2)} m über seinem Heck ` +
                        `(beim Anlauf ${s.start.toFixed(2)} m; je ${s.hl.toFixed(2)} m vor und hinter der Wurzel; der ` +
                        `Gang-Deckel trägt ${s.deckel.toFixed(2)} m)`
                );
        }
        if (p.tod) {
            const t = p.tod;
            if (t.stehtM === null || t.liegtM === null || t.kippMin === null)
                v.push(`LEER: ${p.name} — keine Haut gemessen (Stand ${t.stehtM}, Lage ${t.liegtM})`);
            else {
                // DER LEBENDE STAND: am Fuß der Höhlenwand steht der Wolf vor dem Tod nie mit der Haut im Fels — die
                // Pfoten lesen den Boden unter sich, nie die Höhe des Leibs
                if (t.stehtM < -TOD_M)
                    v.push(
                        `(O) STAND IM FELS: ${p.name} — ${wo} steht lebend mit der Haut ${(-t.stehtM).toFixed(2)} m im Fels ` +
                            `(höchstens ${TOD_M} m)`
                    );
                const oben = Math.max(t.stehtM, 0);
                if (t.liegtM < -TOD_M)
                    v.push(
                        `(O) TOD-LAGE: ${p.name} — ${wo} liegt ${(-t.liegtM).toFixed(2)} m im Fels ` +
                            `(Stand ${t.stehtM.toFixed(2)} m über dem Fels)`
                    );
                else if (t.liegtM > oben + TOD_LIEGT_M)
                    v.push(
                        `(O) TOD-LAGE: ${p.name} — ${wo} liegt ${t.liegtM.toFixed(2)} m über dem Fels ` +
                            `(Stand ${t.stehtM.toFixed(2)} m) — er schwebt`
                    );
                if (t.kippMin < Math.min(t.stehtM, 0) - TOD_M)
                    v.push(
                        `(O) TOD-LAGE: ${p.name} — ${wo} sinkt im Kippen ${(-t.kippMin).toFixed(2)} m in den Fels ` +
                            `(Stand ${t.stehtM.toFixed(2)} m)`
                    );
                if (t.kippMax > oben + TOD_SCHWEBT_M)
                    v.push(`(O) TOD-LAGE: ${p.name} — ${wo} schwebt im Kippen ${t.kippMax.toFixed(2)} m über dem Fels`);
            }
        }
    }
    // (Z) der Zensus: dieselbe Wand je Wagen und Wolf in den Überhang-Spalten; (T) der Schmuggel fällt durch sie
    const [z, t] = [b.zensus || {}, b.schmuggel || { fehler: "kein Lauf" }];
    if (!(z.spalten > 0)) v.push("LEER: (Z) der Zensus fand keine Überhang-Spalte");
    for (const p of z.proben || []) v.push(...fall(p).map((x) => "(Z) " + x));
    if (t.fehler || !fall(t).length)
        v.push(
            `LINSE STUMPF: (T) mit dem Dach-Leser im Boden des Werks fiel O1 nicht rot (${t.fehler || `${t.tiefsteUnter} m unter dem Grund, am Ende y ${t.yEnde}`})`
        );
    for (const q of b.quelle || []) v.push(`(Q) DACH-LESER: ${q}`);
    return [...v, ...turmUrteil(b.turm), ...turm2Urteil(b.turm2)];
}

function selbsttest() {
    const probe = (name, koerper, o) =>
        Object.assign(
            {
                name,
                koerper,
                ort: "-900.6/-976.1",
                tiefsteUnter: 0.1,
                yEnde: 16.1,
                grundEnde: 16.0,
                dach: 29.6,
                ruhe: true,
                yMin: 15,
            },
            o || {}
        );
    const gruen = {
        proben: [
            probe("O1 Wagen unter dem Überhang", "Wagen fahrzeug_gt#9"),
            probe("O2 Schau-Fahrt über die Spaltkante", "Wagen fahrzeug_gt#10", { ruhe: false }),
            probe("O3 Wagen in der Höhle", "Wagen fahrzeug_gt#11"),
            probe("O3 Wolf in der Höhle", "Tier wolf#3", { band: 2 }),
            probe("O3 Spieler in der Höhle", "Spieler"),
            probe("O3 Wolf läuft in die Wand", "Tier wolf#4 (läuft an die Wand 0.4 m)", {
                band: 2,
                stirn: { hoch: 0.68, start: 0.66, hl: 0.26, deckel: 0.35 },
            }),
            probe("O3 Wolf stirbt in der Höhle", "Tier wolf#5 (stirbt)", {
                band: 2,
                ruhe: false,
                tod: { stehtM: 0.02, liegtM: 0.04, kippMin: 0.01, kippMax: 0.08 },
            }),
        ],
        zensus: { spalten: 8, proben: [probe("Zensus", "Tier wolf#6", { band: 2 })] },
        schmuggel: probe("T Schmuggel", "Wagen fahrzeug_gt#9", { tiefsteUnter: 8.2 }),
        quelle: [],
        turm: {
            bloecke: Array.from({ length: TURM_BLOECKE }, () => [3.5, 0.03, 0]),
            hoehe: 70,
            nach: { edits: TURM_BLOECKE, loecher: 0, sohle: 0.04, hoehe: 70 },
        },
        turm2: UNTERLAGEN.flatMap((u) =>
            Object.keys(SICHTEN).map((s) => ({
                wo: u + " " + s,
                bloecke: Array.from({ length: TURM_BLOECKE }, () => [3.5, 0.01, 0]),
                hoehe: 70,
                nach: { edits: TURM_BLOECKE + 1, loecher: 0 },
                ring: { krone: 160.38, vor: 160.38, takte: 2 },
            }))
        ),
    };
    const { errs, check } = pruefer();
    const klon = () => JSON.parse(JSON.stringify(gruen));
    // je Fall der Täter, den die Wand beim Namen nennt (`muss`); ohne `muss` bleibt der Befund grün
    const faelle = [
        ["der grüne Befund", () => {}],
        // das Gegenstück: ein Tier am steilen Fuß der Höhlenwand steht auf der Ebene seiner Proben, 0,2 m unter dem Fels unter
        // seiner Wurzel (der Grund krümmt sich unter dem Leib) — im Höhlen-Band, grün
        ["Tier im Höhlen-Band", (b) => Object.assign(b.proben[5], { tiefsteUnter: 0.2, yEnde: 30.2, grundEnde: 30.4 })],
        [
            "der Wagen der Schau fällt durch den Spaltgrund",
            (b) => Object.assign(b.proben[0], { tiefsteUnter: 6444, yEnde: -6428, todesEbene: true, yMin: -6428 }),
            /\(O\) DURCH DEN BODEN: O1 Wagen unter dem Überhang — Wagen fahrzeug_gt#9 bei -900\.6\/-976\.1 lag 6444\.00 m unter/,
        ],
        [
            "unendlicher Fall",
            (b) => Object.assign(b.proben[1], { todesEbene: true, yMin: -900 }),
            /UNENDLICHER FALL: O2/,
        ],
        [
            "der Wolf auf dem Dach",
            (b) => Object.assign(b.proben[3], { yEnde: 48.6, grundEnde: 30.0, dach: 48.6 }),
            /\(O\) AUF DEM DACH: O3 Wolf in der Höhle — Tier wolf#3 .* 18\.60 m über dem Grund/,
        ],
        [
            "der Wagen schwebt",
            (b) => Object.assign(b.proben[2], { yEnde: 31.5, grundEnde: 30.0 }),
            /\(O\) STEHT NICHT: O3 Wagen in der Höhle — .* ruht 1\.50 m/,
        ],
        ["fehlende Probe", (b) => b.proben.splice(4, 1), /LEER: die Probe „O3 Spieler in der Höhle" fehlt/],
        [
            "der Wolf läuft durch die Wand aufs Dach",
            (b) => Object.assign(b.proben[5], { yEnde: 42.28, grundEnde: 42.28, dach: 42.33, grundSoll: 30.4 }),
            /\(O\) AUF DEM DACH: O3 Wolf läuft in die Wand — Tier wolf#4 \(läuft an die Wand 0\.4 m\) .* 11\.88 m über dem Grund/,
        ],
        [
            "ein Tier tiefer als sein Sicht-Band",
            (b) => Object.assign(b.proben[5], { tiefsteUnter: 2.5, yEnde: 29.8, grundEnde: 32.3 }),
            /\(O\) DURCH DEN BODEN: O3 Wolf läuft in die Wand — .* lag 2\.50 m unter dem Fels/,
        ],
        [
            "das Sicht-Band trägt in der Höhle nicht",
            (b) => Object.assign(b.proben[5], { tiefsteUnter: 0.55, yEnde: 29.85, grundEnde: 30.4 }),
            /\(O\) DURCH DEN BODEN: O3 Wolf läuft in die Wand — .* lag 0\.55 m unter dem Fels/,
        ],
        [
            "der laufende Wolf steigt die Höhlenwand hinauf",
            (b) => Object.assign(b.proben[5].stirn, { hoch: 1.4 }),
            /\(O\) KLETTERWAND: O3 Wolf läuft in die Wand — Tier wolf#4 .* Stirn 1\.40 m über seinem Heck/,
        ],
        [
            "der laufende Wolf ohne Stirn",
            (b) => (b.proben[5].stirn = null),
            /LEER: O3 Wolf läuft in die Wand — keine Stirn gemessen/,
        ],
        [
            "der lebende Wolf steht am Wandfuß im Fels",
            (b) => Object.assign(b.proben[6].tod, { stehtM: -0.46 }),
            /\(O\) STAND IM FELS: O3 Wolf stirbt in der Höhle — Tier wolf#5 .* Haut 0\.46 m im Fels/,
        ],
        [
            "der tote Wolf liegt im Grund",
            (b) => Object.assign(b.proben[6].tod, { liegtM: -0.38, kippMin: -0.38 }),
            /\(O\) TOD-LAGE: O3 Wolf stirbt in der Höhle — Tier wolf#5 \(stirbt\) .* liegt 0\.38 m im Fels/,
        ],
        [
            "der tote Wolf liegt über dem Boden",
            (b) => Object.assign(b.proben[6].tod, { liegtM: 0.62 }),
            /\(O\) TOD-LAGE: O3 Wolf stirbt in der Höhle — .* liegt 0\.62 m über dem Fels .* er schwebt/,
        ],
        [
            "der Stand im Hang ist kein Soll: er sinkt kippend tiefer",
            (b) => Object.assign(b.proben[6].tod, { stehtM: -0.68, liegtM: -0.1, kippMin: -0.92 }),
            /\(O\) TOD-LAGE: O3 Wolf stirbt in der Höhle — .* sinkt im Kippen 0\.92 m in den Fels/,
        ],
        [
            "der tote Wolf schwebt im Kippen",
            (b) => Object.assign(b.proben[6].tod, { kippMax: 0.9 }),
            /\(O\) TOD-LAGE: O3 Wolf stirbt in der Höhle — .* schwebt im Kippen 0\.90 m/,
        ],
        [
            "Tod ohne Haut",
            (b) => (b.proben[6].tod.liegtM = null),
            /LEER: O3 Wolf stirbt in der Höhle — keine Haut gemessen/,
        ],
        ["leerer Zensus", (b) => (b.zensus.spalten = 0), /LEER: \(Z\) der Zensus fand keine/],
        [
            "Zensus-Täter",
            (b) => (b.zensus.proben[0].tiefsteUnter = 3.1),
            /\(Z\) \(O\) DURCH DEN BODEN: Zensus — Tier wolf#6 bei -900\.6\/-976\.1 lag 3\.10 m/,
        ],
        ["stumpfer Schmuggel", (b) => (b.schmuggel.tiefsteUnter = 0.1), /LINSE STUMPF: \(T\)/],
        [
            "Quelle",
            (b) => b.quelle.push("_fahrBoden Zeile 1 ruft getTerrainHeightAt"),
            /\(Q\) DACH-LESER: _fahrBoden Zeile 1/,
        ],
        // der additive Kegel der Stärke 48 (am Vorfahren e3dd2b67: 39,38 m, Hub 3,23 → 1,36 m, die Sohle bis 2,88 m)
        ["der Kegel", (b) => (b.turm.bloecke[19] = [1.36, 2.88, 0]), /KEIN HUB: Block 20 hob 1\.36/],
        ["die Sohle", (b) => (b.turm.bloecke[17][1] = 2.88), /SOHLE: Block 18 2\.88 m neben dem Mesh/],
        ["zu niedrig", (b) => (b.turm.hoehe = 39.38), /ZU NIEDRIG: 39\.38 m/],
        ["ein Block fehlt", (b) => b.turm.bloecke.pop(), /LEER: B Turm: 19 Blöcke/],
        ["ein Loch", (b) => (b.turm.nach.loecher = 3), /RELOAD: 20 Edits, 3 Löcher/],
        ["kein Reload", (b) => delete b.turm.nach, /LEER: B Turm: kein Reload/],
        // B2 — der Fuß in der Luft: am Vorfahren schnitt der Grund des Hauses den Turm über dem Dach (Sohle 193,85 m); an e9ebd232
        // trug der erste Block auf dem Dachboden keine Gestalt (keine Ecke des Netzes in seiner Säule, das Haus schnitt den Boden
        // darunter): 11–12 Takte kein gezeichneter Boden unter dem Fuß in jedem Lauf, die Sohle sah es nur gedrosselt (198 m)
        ["Block ohne Gestalt", (b) => (b.turm2[1].bloecke[0][2] = 11), /\(B2 Dach Third\) BLIND: Block 1 — 11 Takte/],
        // der Ring ohne den Turm (am Vorfahren: 89,62 m an der Krone 160,38 m) und ohne den Edit
        ["Ring ohne Turm", (b) => (b.turm2[2].ring.vor = 89.62), /\(B2 Fels Ego\) FERN-RING OHNE TURM: 89\.62/],
        ["Ring ohne Edit", (b) => delete b.turm2[3].ring.takte, /\(B2 Fels Third\) FERN-RING OHNE EDIT/],
        ["Ring zu spät", (b) => (b.turm2[5].ring.takte = 90), /\(B2 Brücke Third\) FERN-RING ZU SPÄT: 1\.50 s/],
    ];
    taeterFaelle(faelle, urteil, { fehler: errs, klon });
    // die Quellen-Wand am Stamm (grün), an einer Kopie mit dem alten Leser im Körper-Schritt, einem unbenannten Leser der
    // Oberkante an einem Leib und einem veralteten Namen (rot, je beim Namen)
    const stamm = stammLib.text(root);
    const amStamm = quellenWand(stamm);
    check("Quellen-Wand am Stamm sauber", !amStamm.length, amStamm.join(" · "));
    const kopie = stammLib.ersetze(
        stammLib.ersetze(
            stamm,
            null,
            /(\n {4}_werkBoden\([^)]*\) \{)/,
            "$1\n        if (entry.__schmuggel) return () => this.getTerrainHeightAt(0, 0);"
        ),
        null,
        /(\n {4}\*_todHebeTafel\([^)]*\) \{)/,
        "\n    _schmuggelLeib(c) {\n        c.position.y = this.getTerrainHeightAt(c.position.x, c.position.z);\n    }\n$1"
    );
    const an = quellenWand(kopie, { _nieGelesen: [["getTerrainHeightAt"], "Test"], ...OBERKANTE_BENANNT }).join(" · ");
    for (const muss of [
        /_werkBoden Zeile \d+ ruft getTerrainHeightAt/,
        /UNBENANNT: _schmuggelLeib Zeile \d+ ruft getTerrainHeightAt/,
        /VERALTET: _nieGelesen ist benannt/,
    ])
        check(`Quellen-Wand an der Kopie → ${muss}`, muss.test(an), an);
    selbsttestEnde(errs);
}

if (SELBSTTEST) {
    console.log("=== FALL-WÄCHTER — Selbsttest (ohne Browser) ===");
    selbsttest();
    process.exit(0);
}

const PORT = Number(process.env.FALL_WAECHTER_PORT) || 4633;
const server = statikServer();

// Die Proben im Seiten-Kontext.
async function probe(K) {
    const A = r.constructor;
    let [tMs, tN] = [performance.now(), 0];
    // DER ATEM (ek-schleife): je 10 Takte gibt der Takt den Haupt-Faden frei (`await takt()`), wie das Spiel je Bild —
    // Leerlauf (die Tod-Lage), Faden-Antworten und der Puls der Stall-Akte laufen dazwischen. Ohne ihn rechnete O3 (acht
    // Tode in der Höhle) 9,0 s am Stück, unter der Last der Station 25,8 s — die Akte nannte den Takt darin
    // (`editKarte`), der längste Spiel-Takt hielt 325 ms.
    const takt = async () => {
        tMs += 1000 / 60;
        r._gameLoopTick(tMs);
        if (++tN % 10 === 0) await sleep();
    };
    const f = r._ensureAssetFoundry();
    await window.__weltDa(() => f && f.ready && f.recipes && f.recipes.gt && st.blueprints.fahrzeug_gt);
    // DIE SOHLE (B): je Bein der Knöchel nach der Fuß-IK minus `soleH` — der größere Abstand zum gebauten Mesh
    const sohle = () => {
        const [u, v] = [st.playerMesh.userData, new window.THREE.Vector3()];
        const d = (b) => (b.ankle.getWorldPosition(v), v.y - u._gaitIK.soleH - (r._bodenSichtAt(v.x, v.z) ?? -99));
        return Math.max(Math.abs(d(u.rig.legL)), Math.abs(d(u.rig.legR)));
    };
    if (K.nach) {
        // B nach dem Reload: die Füll-Edits des Turms, ihre Hülle (0,5 m innen Fels, 0,6 m außen Luft), Sohle und Stand
        await window.__weltStehtNach(takt);
        for (let i = 0; i < 120; i++) await takt();
        const huelle = (t) => {
            const edits = st.worldMeta.voxelEdits.filter(
                (e) => e.mode === "fill" && Math.hypot(e.x - t.x, e.z - t.z) < e.r
            );
            // je Säule innen Fels, außen Luft — außer in einer anderen Säule des Turms (der Treffer wandert um Zentimeter)
            const drin = (x, y, z) => edits.some((f) => Math.hypot(x - f.x, z - f.z) < f.r && Math.abs(y - f.y) < f.r);
            let loecher = 0;
            for (const e of edits)
                for (let y = Math.max(e.y, t.y0 + 2); y < e.y + e.r - 1; y++)
                    for (let a = 0; a < 16; a++) {
                        const q = a < 8 ? e.r - 0.5 : e.r + 0.6;
                        const [x, z] = [e.x + Math.cos(a * 0.785) * q, e.z + Math.sin(a * 0.785) * q];
                        if (r._terrainDensityAt(x, y, z) > 0 !== (a < 8 || drin(x, y, z))) loecher++;
                    }
            return { edits: edits.length, loecher };
        };
        const t = K.nach;
        return {
            ...huelle(t),
            sohle: sohle(),
            hoehe: st.playerMesh.position.y - t.y0,
            turm2: K.nach2.map((u) => (u.fehler ? null : huelle(u))),
        };
    }
    const todesEbene = (st.terrainBaseHeight || 0) - 88;
    // DIE BODEN-WAHRHEIT: das Dichtefeld selbst — der erste Fels unter einem Punkt (0,05-m-Schritte), unabhängig von jedem
    // Leser des Spiels. Startet der Punkt im Fels, ist der Körper darin: Grund = +Infinity (er liegt unter ihm).
    const grundUnter = (x, y, z) => {
        if (r._fieldSolid(x, y, z)) return Infinity;
        for (let yy = y; yy > y - 60; yy -= 0.05) if (r._fieldSolid(x, yy, z)) return yy;
        return -Infinity;
    };
    // DIE LAGE DES KÖRPERS: wie `grundUnter`, aber steckt der Punkt im Fels, ist sein Grund die Fels-Grenze ÜBER ihm — die
    // Tiefe, in der der Körper steckt, als Zahl (ein Leib 0,3 m im Fuß einer Wand ist kein Sturz durch den Boden); ohne
    // Grenze in 60 m +Infinity (99 m). Der Soll-Grund (`grundAb`) bleibt beim Fels UNTER dem Punkt.
    const grundAm = (x, y, z) => {
        if (!r._fieldSolid(x, y, z)) return grundUnter(x, y, z);
        for (let yy = y; yy < y + 60; yy += 0.05) if (!r._fieldSolid(x, yy, z)) return yy;
        return Infinity;
    };
    const dachAn = (x, z) => r._voxelSurfaceY(x, z);
    // DER SPIELER RUHT bei (x, y, z): Lage, Tempo und der senkrechte Zustand des Felds — je Probe EIN Setzen
    const setze = (x, y, z) => (st.playerMesh.position.set(x, y, z), st.playerVel.setValue(0, 0, 0), (st._fieldVy = 0));
    const einschwingen = async (x, z, y) => {
        setze(x, Number.isFinite(y) ? y : r._voxelSurfaceY(x, z) + 1.8, z);
        await window.__weltStehtNach(takt); // die Welt steht (das EINE Einschwingen, welt-boot)
    };
    const tasten = (w) => {
        for (const k of ["w", "a", "s", "d", "shift", " "]) st.keys[k] = false;
        st.keys.w = !!w;
    };
    const absteigen = () => {
        if (st.player && st.player.mountedArch != null) r.dismountArchitecture();
    };
    const raeumen = (x, z, rad) => {
        for (const cr of (st.creatures || []).slice())
            if (cr && cr.position && Math.hypot(cr.position.x - x, cr.position.z - z) < rad) r.removeCreature(cr);
    };
    // AM ORT einer Probe: der Spieler eingeschwungen, die Tiere im Umkreis R geräumt
    const amOrt = async (o, R) => (await einschwingen(o.x, o.z), raeumen(o.x, o.z, R));
    // der Grund unter (x, z), gemessen ab der Höhe, auf die die Probe den Körper setzte (+1,5 m) — unabhängig davon, wo er endet
    const grundAb = (x, z, ySoll) => {
        if (!Number.isFinite(ySoll)) return NaN;
        const g = grundUnter(x, ySoll + 1.5, z);
        return Number.isFinite(g) ? g : ySoll;
    };
    // DIE SPUR EINES LEIBS: je Takt `schritt(x, y, z)` (seine Lage y gegen den Fels unter ihm), am Ende `ende(x, y, z, ySoll)` —
    // die tiefste Lage unter dem Grund, y min, die Todes-Ebene, Ende, Grund, Oberkante und der Soll-Grund
    const spur = () => {
        const m = { tiefsteUnter: -Infinity, yMin: Infinity };
        m.schritt = (x, y, z) => {
            const g = grundAm(x, y + 0.6, z);
            m.tiefsteUnter = Math.max(m.tiefsteUnter, g === Infinity ? 99 : Number.isFinite(g) ? g - y : 99);
            m.yMin = Math.min(m.yMin, y);
        };
        m.ende = (x, y, z, ySoll) => {
            const gE = grundAm(x, y + 0.6, z);
            return {
                tiefsteUnter: m.tiefsteUnter,
                yMin: m.yMin,
                todesEbene: m.yMin < todesEbene,
                yEnde: y,
                grundEnde: Number.isFinite(gE) ? gE : y - 99,
                dach: dachAn(x, z),
                grundSoll: grundAb(x, z, ySoll),
            };
        };
        return m;
    };
    // DIE FAHRT: ein Wagen auf dem Grund y bei (x, z) gesetzt (Gier `gier`), aufgesessen; `vor(e)` vor der Fahrt (liefert den
    // Tasten-Schritt je Takt), n Takte seine Spur gegen den Fels unter ihm (bis unter die Todes-Ebene), dann weg
    const fahrt = async (x, z, y, gier, n, vor, ySoll = y) => {
        absteigen();
        setze(x, y + 1.2, z);
        const e = r.spawnArchitecture(
            "fahrzeug_gt",
            { x, y: y + 0.5, z },
            { silent: true, precise: true, rotationY: gier - Math.PI / 2 }
        );
        if (e) await window.__gebautNach(e, { takt });
        if (!e || !(r.mountArchitecture(e) || {}).ok) {
            if (e) r.removeArchitecture(e);
            return { fehler: "der GT ließ sich nicht setzen/aufsitzen" };
        }
        tasten(false);
        const [s, jeTakt] = [spur(), (vor && vor(e)) || (() => {})];
        for (let i = 0; i < n && !(e._fahr && e._fahr.y < todesEbene); i++) {
            jeTakt(i);
            await takt();
            if (e._fahr && Number.isFinite(e._fahr.y)) s.schritt(e.position.x, e._fahr.y, e.position.z);
        }
        tasten(false);
        const [fz, koerper] = [e._fahr || {}, `Wagen ${e.type}#${e.id}`];
        const aus = {
            koerper,
            ort: ort(e.position.x, e.position.z),
            ...s.ende(e.position.x, e._fahr ? fz.y : NaN, e.position.z, ySoll),
            ruhe: !fz.luft,
        };
        absteigen();
        r.removeArchitecture(e);
        return aus;
    };
    const proben = [];
    const ort = (x, z) => x.toFixed(1) + "/" + z.toFixed(1);
    // DIE SPALTEN AUS DER WELT: das Gesetz der Spalte, in der ein Leib steht, lebt in scripts/lib/welt-orte.cjs
    // (`hoehle`): von der Oberkante abwärts Fels ≥ `fels`, dann Luft ≥ `luft`, dann ein Grund aus Fels; im Umkreis R
    // ein GRUND (der Fels im Abstand d höchstens d/3 über oder unter dem der Spalte); dazu die Wand der Höhle binnen 2,5 m (`wand`:
    // die Wahrheit des Dichtefelds, je Richtung der erste Abstand, an dem der Fels vom Fuß + einer Stufe bis 2,1 m
    // darüber reicht). R: der Wagen KAMMER_R (die halbe Diagonale des GT, 1,66 m), der Wolf WOLF_R (seine Länge). Die
    // Suche geht in Ringen alle 2 m um die Mitte der Welt.
    const KAMMER_R = 1.8,
        WOLF_R = 0.9;
    const spalten = (opts) => window.__weltOrte("hoehle", Object.assign({ schritt: 2, rMax: 600 }, opts));
    // ── B DER TURM: die fernste ebene Stelle ohne Bau (fern der Spalten von O1–O3); je Block der Klick, 120 Takte
    const frei = (o, natur) =>
        (st.architectures || []).every(
            (e) => !e.position || (natur && r._istNatur(e)) || Math.hypot(e.position.x - o.x, e.position.z - o.z) > 12
        );
    const T0 = window.__weltOrte("eben", { r: 6, spanne: 1, anzahl: 12, rMax: 300, abstand: 30 }).filter(frei).pop();
    const turm = { ...T0, bloecke: [], fehler: T0 ? undefined : "keine ebene Stelle ohne Bau" };
    // DER TURM auf der Unterlage, auf der der Spieler steht, in der Sicht `sicht` (B, B2)
    const turmBauen = async (turm, sicht) => {
        const pm = st.playerMesh.position;
        raeumen(pm.x, pm.z, 30);
        r.equipHeld(null);
        [st.cameraMode, st.pitch, turm.y0, turm.x, turm.z] = [sicht, -Math.PI / 2, pm.y, pm.x, pm.z];
        for (let i = 0; i < 3; i++) takt();
        while (turm.bloecke.length < K.turmBloecke) {
            [st.player.stamina, st.isPointerLocked] = [st.player.maxStamina, true];
            const [vor, cv] = [pm.y, document.getElementById("world-canvas")];
            for (const art of ["mousedown", "mouseup"])
                cv.dispatchEvent(new MouseEvent(art, { button: 2, bubbles: true }));
            // DER BLICK UNTER DEN FUSS (BLIND): je Takt, auch im Flug, der gezeichnete Boden an der Säule des Leibs gegen die Krone
            // des Blocks des Klicks (der letzte Edit) — keiner oder mehr als BLIND_M darunter: das Bild zeigt den Block nicht
            const ed = st.worldMeta.voxelEdits.at(-1);
            let [s, b] = [0, 0];
            for (let i = 0; i < 120; i++) {
                await takt();
                if (st._fieldWasGrounded === true || i === 119) s = Math.max(s, sohle());
                b += !((r._bodenSichtAt(pm.x, pm.z) ?? -Infinity) >= ed.y + ed.r - K.blindM);
            }
            turm.bloecke.push([pm.y - vor, s, b]);
        }
        turm.hoehe = pm.y - turm.y0;
    };
    if (T0) {
        await einschwingen(T0.x, T0.z);
        await turmBauen(turm, "third");
    }
    // ── O1 DER WAGEN UNTER DEM ÜBERHANG
    // Der Ort ist die nächste Spalte, in die der Wagen passt, mit ≥ 4 m Fels über ≥ 3 m Luft (welt-orte `hoehle`) — gelesen
    // aus der Welt, nie ein Literal.
    let O1s;
    const o1s = () => {
        if (O1s === undefined) O1s = spalten({ fels: 4, luft: 3, R: KAMMER_R })[0] || null;
        return O1s;
    };
    const o1 = async (name) => {
        if (!o1s()) return { name, fehler: "kein Überhang in der Welt (keine Spalte, in die der Wagen passt)" };
        await amOrt(O1s, 30);
        const grund = grundUnter(O1s.x, O1s.grund + 1, O1s.z);
        if (!Number.isFinite(grund) || dachAn(O1s.x, O1s.z) - grund < 8)
            return {
                name,
                fehler: `kein Überhang an ${ort(O1s.x, O1s.z)} (Grund ${grund}, Oberkante ${dachAn(O1s.x, O1s.z)})`,
            };
        // die Lage der Schau: im Grund, in der Luft (Rückrollen von der Gegenwand)
        const schau = (e) => {
            for (let i = 0; i < 3; i++) takt();
            if (e._fahr) Object.assign(e._fahr, { y: grund + 1.4, vy: 0, luft: true, yBoden: NaN });
        };
        return { name, ...(await fahrt(O1s.x, O1s.z, grund, Math.PI / 2, 240, schau)) };
    };
    proben.push(await o1("O1 Wagen unter dem Überhang"));
    // ── (T) DER EINGESCHMUGGELTE TÄTER: der Boden des Werks liest die Oberkante der Säule (der alte Leser)
    r._werkBoden = function () {
        return (x, z) => this.getTerrainHeightAt(x, z);
    };
    const schmuggel = await o1("T Schmuggel").finally(() => delete r._werkBoden);
    if (r._werkBoden !== Object.getPrototypeOf(r)._werkBoden) throw new Error("der Schmuggel blieb im Stamm");
    // ── O2 DIE SCHAU-FAHRT über die Spaltkante: der Start liegt 11,4 m vor der Spalte aus O1 (aus der Welt), die Fahrt quert ihre
    // Kante längs +x
    {
        const S = o1s() ? { x: O1s.x - 11.4, z: O1s.z + 1.1 } : null;
        const los = (e) => {
            raeumen(O1s.x, O1s.z, 40);
            for (let i = 0; i < 12; i++) takt();
            st.playerVel.setValue(10.6, 0, 0);
            if (e._fahr) e._fahr.vlong = 10.6;
            return (i) => tasten(i < 240);
        };
        const m = S
            ? await fahrt(S.x, S.z, grundUnter(S.x, r._voxelSurfaceY(S.x, S.z) + 1, S.z), Math.PI / 2, 1200, los, NaN)
            : { fehler: "keine Spalte in der Welt (O1) — die Kante fehlt" };
        proben.push({ name: "O2 Schau-Fahrt über die Spaltkante", ...m, ruhe: false });
    }
    // ── O3 DIE HÖHLE der Boden-Funktion
    // die Höhle: die nächste Spalte mit ≥ 4 m Fels über ≥ 3 m Luft, in die der Leib passt (aus der Welt) — der Wagen in der nächsten Kammer (`hk`, die Spalte aus O1), der Wolf und der Spieler an
    // der nächsten Stelle mit der Wand im Umkreis von 2,5 m (`hs`)
    const hs = spalten({ fels: 4, luft: 3, R: WOLF_R, wand: true })[0] || null;
    const hk = o1s();
    const hoehleGrund = hs ? hs.grund : NaN;
    {
        const name = "O3 Wagen in der Höhle";
        if (hk) {
            await amOrt(hk, 40);
        }
        const m =
            hk && hs
                ? await fahrt(hk.x, hk.z, hk.grund, 0, 120)
                : {
                      fehler: `keine Höhle in der Welt (keine Spalte mit 4 m Fels über 3 m Luft, in die der ${hk ? "Wolf mit Wand" : "Wagen"} passt)`,
                  };
        proben.push({ name, ...m });
        if (!m.fehler) {
            await amOrt(hs, 40);
            // DER SPIELER AM ORT DES RUFS: die Wolf-Proben rufen ihre Tiere neben ihn (`spawnCreatureAt`) — er steht, wo der
            // Wagen stand.
            setze(hs.x, hoehleGrund + A.PLAYER_FOOT_OFFSET + 0.05, hs.z);
        }
    }
    // DIE KANTE DES FELS an (x, z) ab der Höhe y: im Fels aufwärts, sonst abwärts, in 2-cm-Schritten, höchstens 3 m
    const kante = (x, y, z) => {
        let h = y;
        if (r._fieldSolid(x, h, z)) while (h < y + 3 && r._fieldSolid(x, h, z)) h += 0.02;
        else while (h > y - 3 && !r._fieldSolid(x, h, z)) h -= 0.02;
        return h;
    };
    // DIE STIRN eines Leibs: wie hoch der Boden eine halbe Länge voraus (längs `gier`) über dem eine halbe Länge hinter der
    // Wurzel liegt (das Dichtefeld, je Punkt von der Höhe des Grunds aus)
    const stirnAn = (w, gier) => {
        const [g0, hl] = [grundAm(w.position.x, w.position.y + 0.6, w.position.z), r._kreaturHalbLaenge(w)];
        const an = (s) => kante(w.position.x + Math.sin(gier) * hl * s, g0, w.position.z + Math.cos(gier) * hl * s);
        return Number.isFinite(g0) ? an(1) - an(-1) : NaN;
    };
    // DIE HAUT eines Leibs: je Punkt der Haut (höchstens 400) der Abstand zum Fels unter ihm im Dichtefeld (im Fels: negativ,
    // die Tiefe darin) — der kleinste
    const hautAbstand = (c) => {
        c.updateMatrixWorld(true);
        const [v, haut] = [new window.THREE.Vector3(), []];
        c.traverseVisible(
            (o) => o.isMesh && !o.isInstancedMesh && o.geometry && o.geometry.attributes.position && haut.push(o)
        );
        const n = haut.reduce((n, o) => n + o.geometry.attributes.position.count, 0);
        let min = Infinity;
        for (const o of haut)
            for (let i = 0; i < o.geometry.attributes.position.count; i += Math.ceil(n / 400)) {
                o.getVertexPosition(i, v).applyMatrix4(o.matrixWorld);
                min = Math.min(min, v.y - kante(v.x, v.y, v.z));
            }
        return Number.isFinite(min) ? min : null;
    };
    // EIN WOLF bei (x, y, z) unter dem Steuer-Schritt `schritt`: `leben(w, s)` fährt ihn auf der Spur `s` und liefert, was die
    // Probe über die Spur hinaus trägt (`zu` am Namen des Leibs); danach geht er (ein Wesen oder ein Gefallener, state.leichname)
    const steuerRoh = A._steuerGesetz;
    const kappe = st.maxCreatures;
    const wolf = async (x, z, y, schritt, leben) => {
        const steht = Object.create(steuerRoh.call(A));
        steht.steuerSchritt = schritt;
        [A._steuerGesetz, st.maxCreatures] = [() => steht, st.creatures.length + 2];
        try {
            const w = r.spawnCreatureAt(x, y, z, "calm", "wolf", { precise: true, bodySize: 1 });
            if (!w) return { fehler: "der Wolf ließ sich nicht rufen" };
            const [s, p] = [spur(), w.position];
            const { zu = "", ...mehr } = await leben(w, s);
            const out = {
                koerper: `Tier wolf#${w.userData.id ?? w.id}${zu}`,
                ort: ort(p.x, p.z),
                ...s.ende(p.x, p.y, p.z, y),
                band: A.STAND_SICHT_BAND,
                ...mehr,
            };
            if (st.creatures.includes(w) || (st.leichname || []).includes(w)) r.removeCreature(w);
            return out;
        } finally {
            [A._steuerGesetz, st.maxCreatures] = [steuerRoh, kappe];
        }
    };
    // Ein Wolf an der Wand: er steht (sein Steuer-Schritt hält ihn), dann gleitet er gestoßen 1,5 s auf die nächste
    // Wand zu (6 m/s — die Reibung zehrt 0,6·g, er trüge 3 m weit; ohne Wand 3 m/s in +x) — oder er LÄUFT 2,5 s mit 2
    // m/s in sie hinein (`art` „lauf"). Die Wand hält ihn.
    const wolfStoss = (x, z, y, art, wand) => {
        const [rx, rz, lauf, steuer] = [wand ? wand.dx : 1, wand ? wand.dz : 0, art === "lauf", { lauf: false }];
        const schritt = (sw) => (steuer.lauf ? ([sw.gier, sw.v] = [Math.atan2(rx, rz), 2]) : (sw.v = 0));
        return wolf(x, z, y, schritt, async (w, s) => {
            for (let i = 0; i < 20; i++) await takt();
            const [v0, stirnStart] = [wand ? 6 : 3, lauf ? stirnAn(w, Math.atan2(rx, rz)) : NaN];
            if (lauf) steuer.lauf = true;
            else w.userData._stossV = { x: rx * v0, z: rz * v0 };
            for (let i = 0; i < (lauf ? 150 : 90); i++) {
                await takt();
                s.schritt(w.position.x, w.position.y, w.position.z);
            }
            // DIE STIRN des laufenden Leibs am Ende und beim Anlauf — gegen den Hub, den der Gang-Deckel über die Länge
            // trägt; höher, als er beim Anlauf schon stand, steht er auf einer Kletterwand, die er hinaufstieg
            const hl = r._kreaturHalbLaenge(w);
            const stirn = {
                hoch: stirnAn(w, w.rotation.y || 0),
                start: stirnStart,
                hl,
                deckel: 2 * hl * Math.tan(A.GANG_DECKEL_RAD),
            };
            return {
                zu: wand ? ` (${lauf ? "läuft" : "gestoßen"} an die Wand ${wand.d.toFixed(1)} m)` : "",
                ruhe: true,
                stirn: lauf ? stirn : null,
            };
        });
    };
    // DER TOD IN DER HÖHLE: der Wolf steht auf dem Höhlen-Grund, stirbt und kippt — die Tod-Lage (`_todHebeTafel`) hebt seine
    // Wurzel je Kipp-Winkel so, dass die tiefste Stelle der Haut auf dem Boden bleibt (`hautAbstand`)
    const wolfTod = (x, z, y, gier) =>
        wolf(
            x,
            z,
            y,
            (sw) => (sw.v = 0),
            async (w, s) => {
                w.rotation.y = gier;
                w.userData._steuer = { gier, v: 0 };
                for (let i = 0; i < 30; i++) await takt();
                const stehtM = hautAbstand(w);
                r.damageCreature(w, 1e6, {});
                const dy = w.userData.dying;
                if (!dy) return { fehler: "der Wolf stirbt nicht" };
                // der Gefallene verlässt die Liste der Wesen im Moment des Todes und liegt in state.leichname (Welle LF kampf)
                const dabei = () => st.creatures.includes(w) || (st.leichname || []).includes(w);
                let [kippMin, kippMax, liegtM] = [Infinity, -Infinity, null];
                for (let i = 0; i < 600 && dabei(); i++) {
                    await takt();
                    if (!dabei()) break;
                    s.schritt(w.position.x, w.position.y, w.position.z);
                    const fertig = dy.fall >= dy.dauer;
                    const a = i % 3 === 2 || fertig ? hautAbstand(w) : null;
                    if (a !== null) [kippMin, kippMax] = [Math.min(kippMin, a), Math.max(kippMax, a)];
                    if (fertig) {
                        liegtM = a;
                        break;
                    }
                }
                const e = (k) => (Number.isFinite(k) ? k : null);
                return {
                    zu: ` (stirbt, Gier ${Math.round((gier * 180) / Math.PI)}°)`,
                    ruhe: false,
                    tod: { stehtM, liegtM, kippMin: e(kippMin), kippMax: e(kippMax) },
                };
            }
        );
    // EINE PROBE IN DER HÖHLE: ohne Höhle LEER, sonst ihr Leib (`m()`)
    const inHoehle = async (name, m) => (proben.push({ name, ...(hs ? await m() : { fehler: "keine Höhle" }) }), hs);
    await inHoehle("O3 Wolf in der Höhle", () => wolfStoss(hs.x, hs.z, hoehleGrund, undefined, hs.wand));
    await inHoehle("O3 Wolf läuft in die Wand", () => wolfStoss(hs.x, hs.z, hoehleGrund, "lauf", hs.wand));
    // je Blickrichtung ein Tod am Ort der Höhle (die Kipp-Richtung folgt dem Hang, der Leib darüber der Gier)
    for (let k = 0; k < K.todGier; k++)
        if (
            !(await inHoehle("O3 Wolf stirbt in der Höhle", () =>
                wolfTod(hs.x, hs.z, hoehleGrund, (k / K.todGier) * Math.PI * 2)
            ))
        )
            break;
    await inHoehle("O3 Spieler in der Höhle", async () => {
        absteigen();
        const pm = st.playerMesh.position;
        setze(hs.x, hoehleGrund + A.PLAYER_FOOT_OFFSET + 0.05, hs.z);
        st.yaw = Math.PI; // nach −z, in die Halle
        const s = spur();
        for (let i = 0; i < 180; i++) {
            tasten(i < 150);
            await takt();
            s.schritt(pm.x, pm.y - A.PLAYER_FOOT_OFFSET, pm.z);
        }
        tasten(false);
        return {
            koerper: "Spieler",
            ort: ort(pm.x, pm.z),
            ...s.ende(pm.x, pm.y - A.PLAYER_FOOT_OFFSET, pm.z, hoehleGrund),
            ruhe: true,
        };
    });
    // ── (Z) DER ZENSUS: Überhang-Spalten um die Spalte aus O1 und die Höhle aus O3 (Luft ≥ 3 m unter ≥ 2 m Fels, der Grund
    // ≥ 1 m Fels, der Wagen passt), je Ort bis 60 m — je Spalte ein Wagen und ein gestoßener Wolf (die Wand des Urteils)
    const zensus = { spalten: 0, proben: [], orte: [] };
    for (const z0 of [o1s(), hs].filter(Boolean)) {
        await amOrt(z0, 60);
        const sp = spalten({ mitte: [z0.x, z0.z], rMax: 60, anzahl: K.spaltenJeOrt, fels: 2, luft: 3, R: KAMMER_R });
        zensus.spalten += sp.length;
        for (const s of sp) {
            zensus.orte.push(`${ort(s.x, s.z)} (Grund ${s.grund.toFixed(1)}, Oberkante ${s.dach.toFixed(1)})`);
            for (const p of [
                await fahrt(s.x, s.z, s.grund, 0, 90),
                await wolfStoss(s.x, s.z, s.grund, undefined, s.wand),
            ])
                if (!p.fehler) zensus.proben.push({ name: "Zensus", ...p });
        }
    }
    // ── B2 DER TURM AUF DACH, FELS UND BRÜCKE: je Unterlage zwei Stellen (Ego, Third), fern von jedem Turm und Bau
    const turm2 = [];
    const eben = window.__weltOrte("eben", { r: 8, spanne: 1.5, anzahl: 60, rMax: 600, abstand: 30 });
    const felsen = spalten({ fels: 4, luft: 3, R: KAMMER_R, abstand: 60, anzahl: 12 });
    // fern von jedem Turm, kein Bau binnen 12 m; die Natur räumt der Turm wie jeder Bau (`_naturRaeumen`)
    const fern = (o) => frei(o, true) && [turm, ...turm2].every((t) => !(Math.hypot(t.x - o.x, t.z - o.z) < 60));
    // die Brücke des Prüf-Satzes, Teil für Teil gefügt wie in der Werkstatt
    const bruecke = "__turm_bruecke";
    r.createBlueprint(bruecke, "Brücke");
    for (const [x, y, z, a, b, c] of K.bruecke)
        r.addPartToBlueprint(bruecke, {
            shape: "box",
            material: "stein",
            position: { x, y, z },
            size: { x: a, y: b, z: c },
        });
    // die Unterlage an der Stelle o: das Haus der Werkstatt (der Spieler fällt von über dem First auf den obersten Boden), die
    // Felsdecke über der Spalte, das Deck der Brücke
    for (const u of K.unterlagen)
        for (const [s, sicht] of Object.entries(K.sichten)) {
            const [liste, bau] = { Dach: [eben, "haus_alemannisch"], Fels: [felsen, null], Brücke: [eben, bruecke] }[u];
            const o = liste.find(fern);
            const t = {
                ...o,
                wo: u + " " + s,
                bloecke: [],
                fehler: o ? undefined : `keine Stelle für ${u} (${liste.length} Kandidaten)`,
            };
            turm2.push(t);
            if (!o) continue;
            absteigen();
            r._naturRaeumen(o.x, o.z, 12, false);
            let oben;
            if (bau) {
                await einschwingen(o.x + 20, o.z);
                const e = r.spawnArchitecture(
                    bau,
                    { x: o.x, y: r._voxelSurfaceY(o.x, o.z), z: o.z },
                    { silent: true, precise: true }
                );
                if (!e) {
                    t.fehler = `${bau} ließ sich nicht setzen`;
                    continue;
                }
                await window.__gebautNach(e, { takt });
                oben = Math.max(...e.blockerAABBs.map((b) => b.topY)) + 3;
            }
            await einschwingen(o.x, o.z, oben);
            await turmBauen(t, sicht);
            // DER FERN-RING: der Spieler FERN_M vom Turm, weg von der Mitte; die Welt steht, der Ring hängt ganz
            const l = Math.hypot(t.x, t.z) || 1;
            await einschwingen(t.x + (t.x / l) * K.fernM, t.z + (t.z / l) * K.fernM);
            const fr = () => st.fernRing || {};
            const fertig = () => fr().ready && fr().cursor >= fr().totalVerts && !fr().flug && !fr().einhaengen.length;
            await window.__gebautNach("der Fern-Ring", { takt, fertig, max: 900, offen: false });
            // die Ecken um die Mitte des Turms (zwei Maschen), die Lage-Bytes aller Schalen
            const F = fr();
            const ecken = Array.from({ length: F.totalVerts }, (_, g) => r._fernRingPunkt(F, g)).filter(
                (p) => Math.hypot(p.x - t.x, p.z - t.z) < 2 * p.fuss.hr
            );
            const ringY = () => Math.max(...ecken.map((p) => F.geos[p.s].attributes.position.getY(p.li)));
            const lage = () => F.geos.map((g) => new Uint8Array(g.attributes.position.array.buffer.slice(0)));
            const [ring, vor] = [{ krone: r._voxelSurfaceY(t.x, t.z), vor: ringY() }, lage()];
            // ein Block auf die Krone über das Verb des Spiels (der Mensch am Turm, die KI, ein Mitspieler: `voxel_fill`)
            const kopf = st.worldMeta.voxelEdits[st.worldMeta.voxelEdits.length - 1];
            r.dslRun(["voxel_fill", kopf.x, ring.krone, kopf.z, K.turmR], { source: "human" });
            const krone2 = r._voxelSurfaceY(t.x, t.z);
            for (let i = 1; i <= 120 && !ring.takte; i++) {
                takt();
                await sleep();
                const bytes = lage().reduce((n, b, s) => n + b.filter((x, k) => x !== vor[s][k]).length, 0);
                if (bytes && ringY() >= krone2 - K.sohleM) Object.assign(ring, { takte: i, bytes });
            }
            t.ring = { ...ring, krone2, nach: ringY() };
        }
    // B: zurück auf den Turm, der Save
    if (T0) {
        absteigen();
        await einschwingen(T0.x, T0.z);
        r.saveState();
    }
    return { proben, zensus, schmuggel, turm, turm2 };
}

hauptLauf(async () => {
    console.log("=== DER FALL-WÄCHTER (Leben-Schau 2) — Null-Renderer, echter Spiel-Takt, Spaltgrund + Höhle ===");
    await server.lausche(PORT);
    const { browser, page } = await nullSeite({ frist: 900000 });
    page.setDefaultTimeout(880000);
    await page.evaluateOnNewDocument(WELT_ORTE_INSTALL); // die Orte aus der Welt (`__weltOrte`, scripts/lib/welt-orte.cjs)
    await page.evaluateOnNewDocument("window.__anazhFernRing = true"); // B2: der Fern-Ring lebt auch ohne Renderer
    await server.zeige(page, 120000);
    await warteAufWelt(page, 180000);
    const befund = await page.evaluate(probe, {
        spaltenJeOrt: 6,
        todGier: TOD_GIER,
        turmBloecke: TURM_BLOECKE,
        turmR: TURM_R,
        sohleM: SOHLE_M,
        blindM: BLIND_M,
        sichten: SICHTEN,
        unterlagen: UNTERLAGEN,
        fernM: FERN_M,
        bruecke: PRUEF_SATZ.stabil["Brücke auf zwei Pfeilern"],
    });
    if (!befund.turm.fehler) {
        await sleep(1500); // der IDB-Put des Saves landet
        await page.reload({ waitUntil: "domcontentloaded", timeout: 120000 });
        await warteAufWelt(page, 180000);
        const nach = await page.evaluate(probe, { nach: befund.turm, nach2: befund.turm2 });
        befund.turm.nach = nach;
        befund.turm2.forEach((t, k) => nach.turm2[k] && (t.nach = nach.turm2[k]));
    }
    await browser.close();
    server.close();
    befund.quelle = quellenWand(stammLib.text(root));
    const fx = (v) => (Number.isFinite(v) ? v.toFixed(3) : String(v));
    for (const p of befund.proben)
        console.log(
            p.fehler
                ? `  ${p.name}: ${p.fehler}`
                : `  ${p.name.padEnd(36)} ${p.koerper} bei ${p.ort}: am Ende y ${p.yEnde.toFixed(2)} · Grund ${p.grundEnde.toFixed(2)} · ` +
                      `Oberkante ${p.dach.toFixed(2)} · tiefste Lage unter dem Grund ${p.tiefsteUnter.toFixed(2)} m · y min ${p.yMin.toFixed(2)}` +
                      (p.tod
                          ? ` · Tod: Haut über dem Fels im Stand ${fx(p.tod.stehtM)} m, liegend ${fx(p.tod.liegtM)} m, im Kippen ` +
                            `${fx(p.tod.kippMin)} … ${fx(p.tod.kippMax)} m`
                          : "") +
                      (p.stirn
                          ? ` · Stirn ${fx(p.stirn.hoch)} m über dem Heck (Anlauf ${fx(p.stirn.start)} m, je ${fx(p.stirn.hl)} m, ` +
                            `Deckel ${fx(p.stirn.deckel)} m)`
                          : "")
        );
    console.log(`  Zensus: ${befund.zensus.spalten} Überhang-Spalten, ${befund.zensus.proben.length} Proben`);
    for (const o of befund.zensus.orte) console.log(`    · ${o}`);
    console.log(`  Schmuggel (T): ${befund.schmuggel.fehler || fall(befund.schmuggel).join(" · ") || "stumpf"}`);
    // DIE ZAHL DES TURMS (die Station bauen.K4 liest sie)
    const [T, hub] = [befund.turm, befund.turm.bloecke.map((b) => b[0])];
    const zahl = { hub: [Math.min(...hub), Math.max(...hub)], sohle: Math.max(...T.bloecke.map((b) => b[1])) };
    console.log("  B-ZAHL " + JSON.stringify({ ...T, bloecke: hub.length, ...zahl, befunde: turmUrteil(T) }));
    // DIE ZAHL DES TURMS AUF DACH, FELS UND BRÜCKE (die Station bauen.K4#2 liest sie)
    console.log("  B2-ZAHL " + JSON.stringify({ tuerme: befund.turm2, befunde: turm2Urteil(befund.turm2) }));
    console.log(
        `  Quelle: ${befund.quelle.length ? befund.quelle.join(" · ") : "die Körper-Schritte lesen den Boden unter dem Körper"}`
    );
    const v = urteil(befund);
    urteilEnde(v.length, "\n❌ FALL-WÄCHTER ROT:\n  " + v.join("\n  "), "\n✅ FALL-WÄCHTER GRÜN — jeder Körper steht auf dem Boden unter ihm: keiner fällt durch, keiner springt aufs Dach.");
});
