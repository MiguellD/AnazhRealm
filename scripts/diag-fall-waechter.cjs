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
//       Turm trägt ≥ TURM_M; nach dem Reload steht jeder Edit, die Hülle ohne Loch, der Spieler oben;
//   (Z) DER ZENSUS: je Ort die Überhang-Spalten im Umkreis (Luft ≥ 3 m unter ≥ 2 m Fels, ihr Grund begehbar) — Wagen und
//       an die nächste Wand gestoßener Wolf je Spalte; ROT je Körper beim Namen, Ort und Maß;
//   (T) DER EINGESCHMUGGELTE TÄTER: im selben Lauf liest der Boden des Werks die Oberkante der Säule (der alte Leser) — O1
//       MUSS rot fallen, beim Namen;
//   (Q) DIE QUELLE (AST, acorn): die Körper-Schritte lesen ihren Boden nur über `_koerperBodenUnter` — kein
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
const { statikServer, starteBrowser, warteAufWelt, nullRenderer, ROOT: root } = require("./lib/welt-boot.cjs");
const stammLib = require("./lib/stamm.cjs");
const { WELT_ORTE_INSTALL } = require("./lib/welt-orte.cjs");

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
    dslEffects: [
        ["getTerrainHeightAt"],
        "Platzierung: die Geburt fern am Wunsch-Ort setzt das Tier auf die Oberfläche",
    ],
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

// DIE QUELLEN-WAND (AST): je Körper-Schritt die Rufe eines Dach-Lesers (Täter) und ob er einen Boden-Leser ruft; jeder
// andere Leser der Oberkante, der die Höhe eines Leibs berührt, ist benannt (OBERKANTE_BENANNT) oder ein Täter.
function quellenWand(quelle, benannt = OBERKANTE_BENANNT) {
    const acorn = require("acorn");
    const ast = acorn.parse(quelle, { ecmaVersion: "latest", sourceType: "script", locations: true });
    const befunde = [];
    const gefunden = new Set();
    const benanntGesehen = new Set();
    const lauf = (n, f) => (f(n), stammLib.kinder(n, (c) => lauf(c, f)));
    const name = (m) => (m && m.type === "MemberExpression" && !m.computed && m.property ? m.property.name : null);
    lauf(ast, (n) => {
        if (n.type !== "MethodDefinition" || !n.key) return;
        const methode = n.key.name;
        if (!KOERPER_SCHRITTE.includes(methode)) {
            // ein anderer Leser der Oberkante, der die Höhe eines Leibs berührt
            const dach = [];
            let leib = false;
            lauf(n.value.body, (c) => {
                if (c.type === "CallExpression" && DACH_LESER.has(name(c.callee)))
                    dach.push([name(c.callee), c.loc.start.line]);
                if (c.type === "MemberExpression" && name(c) === "y" && name(c.object) === "position") leib = true;
                if (c.type === "CallExpression" && name(c.callee) === "set" && name(c.callee.object) === "position")
                    leib = true;
            });
            if (!dach.length || !leib || DACH_LESER.has(methode)) return;
            const b = benannt[methode];
            if (b) benanntGesehen.add(methode);
            for (const [nm, zeile] of dach)
                if (!b || !b[0].includes(nm))
                    befunde.push(
                        `UNBENANNT: ${methode} Zeile ${zeile} ruft ${nm} (die Oberkante der Säule) und berührt die Höhe ` +
                            `eines Leibs — Körper-Schritt (_koerperBodenUnter) oder benannte Platzierung?`
                    );
            return;
        }
        gefunden.add(methode);
        lauf(n.value.body, (c) => {
            if (c.type !== "CallExpression" || c.callee.type !== "MemberExpression") return;
            const nm = name(c.callee);
            if (DACH_LESER.has(nm))
                befunde.push(`${methode} Zeile ${c.loc.start.line} ruft ${nm} (die Oberkante der Säule)`);
        });
    });
    for (const m of KOERPER_SCHRITTE) if (!gefunden.has(m)) befunde.push(`${m} fehlt im Stamm (die Wand kennt ihn)`);
    for (const m of Object.keys(benannt))
        if (!benanntGesehen.has(m))
            befunde.push(
                `VERALTET: ${m} ist benannt, liest aber keine Oberkante an einem Leib mehr (die Liste wandert mit)`
            );
    return befunde;
}

// Das Urteil über den Turm (B): je Block [Hub, Sohle neben dem Mesh], nach dem Reload `nach`.
function turmUrteil(t) {
    if (!t || t.fehler || !t.nach) return [`LEER: B Turm: ${t ? t.fehler || "kein Reload" : "fehlt"}`];
    const [v, n, f] = [[], t.nach, (x) => Number(x).toFixed(2)];
    if (t.bloecke.length !== TURM_BLOECKE) v.push(`LEER: B Turm: ${t.bloecke.length} Blöcke`);
    t.bloecke.forEach(([hub, sohle], k) => {
        if (!(hub >= HUB_ANTEIL * TURM_R)) v.push(`(B) KEIN HUB: Block ${k + 1} hob ${f(hub)} m`);
        if (!(sohle <= SOHLE_M)) v.push(`(B) SOHLE: Block ${k + 1} ${f(sohle)} m neben dem Mesh`);
    });
    if (!(t.hoehe >= TURM_M)) v.push(`(B) ZU NIEDRIG: ${f(t.hoehe)} m über dem Gelände`);
    if (n.edits !== t.bloecke.length || n.loecher || !(n.sohle <= SOHLE_M) || !(n.hoehe >= t.hoehe - SOHLE_M))
        v.push(`(B) RELOAD: ${n.edits} Edits, ${n.loecher} Löcher, Sohle ${f(n.sohle)} m, Stand ${f(n.hoehe)} m`);
    return v;
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
        // ein Tier steht auf der Sicht (Q4, Lehre 22: der sichtbare Boden ist das Mesh) — sein Leib darf so weit neben dem
        // Gesetz liegen, wie das Stand-Band des Spiels trägt (`band`, STAND_SICHT_BAND); Wagen und Spieler stehen auf dem Gesetz.
        // IN DER HÖHLE (O3) hat die Sicht keine Karte (sie trägt die Oberkante der Säule): dort steht auch das Tier auf dem
        // Gesetz, und sein Band ist HOEHLE_M
        const hoehle = Number.isFinite(p.band) && p.name.startsWith("O3 ");
        const fallM = hoehle ? HOEHLE_M : Number.isFinite(p.band) ? Math.max(FALL_M, p.band) : FALL_M;
        const stehtM = hoehle ? HOEHLE_M : Number.isFinite(p.band) ? Math.max(STEHT_M, p.band) : STEHT_M;
        if (p.tiefsteUnter > fallM)
            v.push(
                `(O) DURCH DEN BODEN: ${p.name} — ${wo} lag ${p.tiefsteUnter.toFixed(2)} m unter dem Fels unter ihm` +
                    ` (am Ende y ${p.yEnde.toFixed(2)}, Grund ${p.grundEnde.toFixed(2)})`
            );
        if (p.todesEbene)
            v.push(`(O) UNENDLICHER FALL: ${p.name} — ${wo} fiel unter die Todes-Ebene (y ${p.yMin.toFixed(1)})`);
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
        const soll = Number.isFinite(p.grundSoll) ? p.grundSoll : p.grundEnde;
        if (p.yEnde - soll > DACH_M)
            v.push(
                `(O) AUF DEM DACH: ${p.name} — ${wo} steht ${(p.yEnde - soll).toFixed(2)} m über dem Grund, auf den er gesetzt war ` +
                    `(y ${p.yEnde.toFixed(2)}, Grund ${soll.toFixed(2)}, Säulen-Oberkante ${p.dach.toFixed(2)})`
            );
    }
    const z = b.zensus || {};
    if (!(z.spalten > 0)) v.push("LEER: (Z) der Zensus fand keine Überhang-Spalte");
    for (const t of z.taeter || []) v.push(`(Z) ${t}`);
    if (!b.schmuggel || !b.schmuggel.rot)
        v.push(
            "LINSE STUMPF: (T) mit dem Dach-Leser im Boden des Werks fiel O1 nicht rot" +
                (b.schmuggel && b.schmuggel.mass ? ` (${b.schmuggel.mass})` : "")
        );
    for (const q of b.quelle || []) v.push(`(Q) DACH-LESER: ${q}`);
    return [...v, ...turmUrteil(b.turm)];
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
        zensus: { spalten: 8, proben: 16, taeter: [] },
        schmuggel: { rot: true, mass: "8,2 m durch den Boden" },
        quelle: [],
        turm: {
            bloecke: Array.from({ length: TURM_BLOECKE }, () => [3.5, 0.03]),
            hoehe: 70,
            nach: { edits: TURM_BLOECKE, loecher: 0, sohle: 0.04, hoehe: 70 },
        },
    };
    const fehler = [];
    const g = urteil(gruen);
    if (g.length) fehler.push("der grüne Befund fällt rot: " + g.join(" · "));
    const klon = () => JSON.parse(JSON.stringify(gruen));
    const faelle = [
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
            (b) => b.zensus.taeter.push("Wagen an -870/-1230 3,1 m durch den Boden"),
            /\(Z\) Wagen an -870\/-1230/,
        ],
        ["stumpfer Schmuggel", (b) => (b.schmuggel.rot = false), /LINSE STUMPF: \(T\)/],
        [
            "Quelle",
            (b) => b.quelle.push("_fahrBoden Zeile 1 ruft getTerrainHeightAt"),
            /\(Q\) DACH-LESER: _fahrBoden Zeile 1/,
        ],
        // der additive Kegel der Stärke 48 (am Vorfahren e3dd2b67: 39,38 m, Hub 3,23 → 1,36 m, die Sohle bis 2,88 m)
        ["der Kegel", (b) => (b.turm.bloecke[19] = [1.36, 2.88]), /KEIN HUB: Block 20 hob 1\.36/],
        ["die Sohle", (b) => (b.turm.bloecke[17][1] = 2.88), /SOHLE: Block 18 2\.88 m neben dem Mesh/],
        ["zu niedrig", (b) => (b.turm.hoehe = 39.38), /ZU NIEDRIG: 39\.38 m/],
        ["ein Block fehlt", (b) => b.turm.bloecke.pop(), /LEER: B Turm: 19 Blöcke/],
        ["ein Loch", (b) => (b.turm.nach.loecher = 3), /RELOAD: 20 Edits, 3 Löcher/],
        ["kein Reload", (b) => delete b.turm.nach, /LEER: B Turm: kein Reload/],
    ];
    {
        // das Gegenstück: ein Tier am steilen Fuß der Höhlenwand steht auf der Ebene seiner Proben, 0,2 m unter dem Fels unter
        // seiner Wurzel (der Grund krümmt sich unter dem Leib) — im Höhlen-Band, grün
        const b = klon();
        Object.assign(b.proben[5], { tiefsteUnter: 0.2, yEnde: 30.2, grundEnde: 30.4 });
        const v = urteil(b);
        console.log(
            `  ${v.length ? "❌" : "✅"} Selbsttest „Tier im Höhlen-Band" bleibt grün: ${v.join(" · ") || "grün"}`
        );
        if (v.length) fehler.push("ein Tier im Höhlen-Band fällt rot: " + v.join(" · "));
    }
    for (const [name, tat, muss] of faelle) {
        const b = klon();
        tat(b);
        const v = urteil(b);
        const ok = v.some((x) => muss.test(x));
        if (!ok) fehler.push(`${name}: die Wand nennt den Täter nicht (${muss})`);
        console.log(`  ${ok ? "✅" : "❌"} Selbsttest „${name}" → rot: ${v.join(" · ") || "(nichts)"}`);
    }
    // die Quellen-Wand am Stamm (grün) und an einer Kopie mit dem alten Leser (rot, beim Namen)
    const stamm = stammLib.text(root);
    const amStamm = quellenWand(stamm);
    console.log(`  ${amStamm.length ? "❌" : "✅"} Quellen-Wand am Stamm: ${amStamm.join(" · ") || "sauber"}`);
    if (amStamm.length) fehler.push("die Quellen-Wand ist am Stamm rot: " + amStamm.join(" · "));
    const kopie = stammLib.ersetze(
        stamm,
        null,
        /(\n {4}_werkBoden\([^)]*\) \{)/,
        "$1\n        if (entry.__schmuggel) return () => this.getTerrainHeightAt(0, 0);"
    );
    const anKopie = quellenWand(kopie);
    const genannt = anKopie.some((x) => /^_werkBoden Zeile \d+ ruft getTerrainHeightAt/.test(x));
    console.log(
        `  ${genannt ? "✅" : "❌"} Quellen-Wand an der Kopie mit dem alten Leser → ${anKopie.join(" · ") || "(nichts)"}`
    );
    if (!genannt) fehler.push("die Quellen-Wand nennt den eingeschleusten Dach-Leser nicht");
    // ein unbenannter neuer Leser der Oberkante an einem Leib, und ein veralteter Name
    {
        const k3 = stammLib.ersetze(stamm, null,
            /(\n {4}\*_todHebeTafel\([^)]*\) \{)/,
            "\n    _schmuggelLeib(c) {\n        c.position.y = this.getTerrainHeightAt(c.position.x, c.position.z);\n    }\n$1"
        );
        const a3 = quellenWand(k3, Object.assign({ _nieGelesen: [["getTerrainHeightAt"], "Test"] }, OBERKANTE_BENANNT));
        const ok =
            a3.some((x) => /^UNBENANNT: _schmuggelLeib Zeile \d+ ruft getTerrainHeightAt/.test(x)) &&
            a3.some((x) => /^VERALTET: _nieGelesen ist benannt/.test(x));
        console.log(
            `  ${ok ? "✅" : "❌"} Quellen-Wand: ein unbenannter Leser am Leib und ein veralteter Name → ${a3.join(" · ") || "(nichts)"}`
        );
        if (!ok)
            fehler.push("die Quellen-Wand nennt einen unbenannten Leser am Leib oder einen veralteten Namen nicht");
    }
    if (fehler.length) {
        console.log("\n❌ SELBSTTEST ROT — die Wand ist vakuös: " + fehler.join(" · "));
        process.exit(1);
    }
    console.log("\n✅ SELBSTTEST GRÜN — jeder injizierte Täter fällt rot und wird beim Namen genannt.");
}

if (process.argv.includes("--selftest")) {
    console.log("=== FALL-WÄCHTER — Selbsttest (ohne Browser) ===");
    selbsttest();
    process.exit(0);
}

const PORT = Number(process.env.FALL_WAECHTER_PORT) || 4633;
const server = statikServer();

// Die Proben im Seiten-Kontext.
async function probe(K) {
    const r = window.anazhRealm;
    const st = r.state;
    const A = r.constructor;
    let tMs = performance.now();
    const takt = () => {
        tMs += 1000 / 60;
        r._gameLoopTick(tMs);
    };
    const f = r._ensureAssetFoundry();
    await window.__weltDa(() => (f && f.ready && f.recipes && f.recipes.gt && st.blueprints.fahrzeug_gt));
    // DIE SOHLE (B): je Bein der Knöchel nach der Fuß-IK minus `soleH` — der größere Abstand zum gebauten Mesh
    const sohle = () => {
        const [u, v] = [st.playerMesh.userData, new window.THREE.Vector3()];
        const d = (b) => (b.ankle.getWorldPosition(v), v.y - u._gaitIK.soleH - (r._bodenSichtAt(v.x, v.z) ?? -99));
        return Math.max(Math.abs(d(u.rig.legL)), Math.abs(d(u.rig.legR)));
    };
    if (K.nach) {
        // B nach dem Reload: die Füll-Edits des Turms, ihre Hülle (0,5 m innen Fels, 0,6 m außen Luft), Sohle und Stand
        await window.__weltStehtNach(takt);
        for (let i = 0; i < 120; i++) takt();
        const t = K.nach;
        const edits = st.worldMeta.voxelEdits.filter((e) => e.mode === "fill" && Math.hypot(e.x - t.x, e.z - t.z) < e.r);
        let loecher = 0;
        for (const e of edits)
            for (let y = Math.max(e.y, t.y0 + 2); y < e.y + e.r - 1; y++)
                for (let a = 0; a < 16; a++) {
                    const q = a < 8 ? e.r - 0.5 : e.r + 0.6;
                    const d = r._terrainDensityAt(e.x + Math.cos(a * 0.785) * q, y, e.z + Math.sin(a * 0.785) * q);
                    if (d > 0 !== a < 8) loecher++;
                }
        return { edits: edits.length, loecher, sohle: sohle(), hoehe: st.playerMesh.position.y - t.y0 };
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
    const einschwingen = async (x, z, y) => {
        st.playerMesh.position.set(x, Number.isFinite(y) ? y : r._voxelSurfaceY(x, z) + 1.8, z);
        if (st.playerVel) st.playerVel.setValue(0, 0, 0);
        st._fieldVy = 0;
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
    // Ein Wagen auf dem Grund bei (x, z): gesetzt auf die Höhe `y` (der Grund der Probe), aufgesessen.
    const wagen = async (x, z, y, gier) => {
        absteigen();
        st.playerMesh.position.set(x, y + 1.2, z);
        st.playerVel.setValue(0, 0, 0);
        st._fieldVy = 0;
        const e = r.spawnArchitecture(
            "fahrzeug_gt",
            { x, y: y + 0.5, z },
            { silent: true, precise: true, rotationY: gier - Math.PI / 2 }
        );
        if (!e) return null;
        await window.__gebautNach(e, { takt });
        const mr = r.mountArchitecture(e);
        if (!mr || !mr.ok) {
            r.removeArchitecture(e);
            return null;
        }
        tasten(false);
        return e;
    };
    const weg = (e) => {
        absteigen();
        if (e) r.removeArchitecture(e);
    };
    // Die Spur eines Wagens: je Frame die Lage gegen den Fels unter ihm.
    // der Grund unter (x, z), gemessen ab der Höhe, auf die die Probe den Körper setzte (+1,5 m) — unabhängig davon, wo er endet
    const grundAb = (x, z, ySoll) => {
        if (!Number.isFinite(ySoll)) return NaN;
        const g = grundUnter(x, ySoll + 1.5, z);
        return Number.isFinite(g) ? g : ySoll;
    };
    const wagenSpur = (e, n, onFrame, ySoll) => {
        const m = { tiefsteUnter: -Infinity, yMin: Infinity, todesEbene: false };
        for (let i = 0; i < n; i++) {
            if (onFrame) onFrame(i);
            takt();
            const fz = e._fahr;
            if (!fz || !Number.isFinite(fz.y)) continue;
            const g = grundAm(e.position.x, fz.y + 0.6, e.position.z);
            const unter = g === Infinity ? 99 : Number.isFinite(g) ? g - fz.y : 99;
            if (unter > m.tiefsteUnter) m.tiefsteUnter = unter;
            if (fz.y < m.yMin) m.yMin = fz.y;
            if (fz.y < todesEbene) {
                m.todesEbene = true;
                break;
            }
        }
        const fz = e._fahr;
        m.yEnde = fz ? fz.y : NaN;
        const gE = grundAm(e.position.x, m.yEnde + 0.6, e.position.z);
        m.grundEnde = Number.isFinite(gE) ? gE : m.yEnde - 99;
        m.dach = dachAn(e.position.x, e.position.z);
        m.grundSoll = grundAb(e.position.x, e.position.z, ySoll);
        m.luft = !!(fz && fz.luft);
        m.ruhe = !m.luft;
        return m;
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
    const frei = (o) => (st.architectures || []).every((e) => !e.position || Math.hypot(e.position.x - o.x, e.position.z - o.z) > 12);
    const T0 = window.__weltOrte("eben", { r: 6, spanne: 1, anzahl: 12, rMax: 300, abstand: 30 }).filter(frei).pop();
    const turm = { ...T0, bloecke: [], fehler: T0 ? undefined : "keine ebene Stelle ohne Bau" };
    if (T0) {
        await einschwingen(T0.x, T0.z);
        raeumen(T0.x, T0.z, 30);
        r.equipHeld(null);
        [st.cameraMode, st.pitch, turm.y0] = ["third", -Math.PI / 2, st.playerMesh.position.y];
        for (let i = 0; i < 3; i++) takt();
        while (turm.bloecke.length < K.turmBloecke) {
            [st.player.stamina, st.isPointerLocked] = [st.player.maxStamina, true];
            const [vor, cv] = [st.playerMesh.position.y, document.getElementById("world-canvas")];
            for (const art of ["mousedown", "mouseup"]) cv.dispatchEvent(new MouseEvent(art, { button: 2, bubbles: true }));
            let s = 0;
            for (let i = 0; i < 120; i++) {
                takt();
                if (i % 10 === 9) await new Promise((ok) => setTimeout(ok));
                if (st._fieldWasGrounded === true || i === 119) s = Math.max(s, sohle());
            }
            turm.bloecke.push([st.playerMesh.position.y - vor, s]);
        }
        turm.hoehe = st.playerMesh.position.y - turm.y0;
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
        await einschwingen(O1s.x, O1s.z);
        raeumen(O1s.x, O1s.z, 30);
        const grund = grundUnter(O1s.x, O1s.grund + 1, O1s.z);
        if (!Number.isFinite(grund) || dachAn(O1s.x, O1s.z) - grund < 8)
            return {
                name,
                fehler: `kein Überhang an ${ort(O1s.x, O1s.z)} (Grund ${grund}, Oberkante ${dachAn(O1s.x, O1s.z)})`,
            };
        const e = await wagen(O1s.x, O1s.z, grund, Math.PI / 2);
        if (!e) return { name, fehler: "der GT ließ sich nicht setzen/aufsitzen" };
        for (let i = 0; i < 3; i++) takt();
        const fz = e._fahr;
        if (fz) {
            // die Lage der Schau: im Grund, in der Luft (Rückrollen von der Gegenwand)
            fz.y = grund + 1.4;
            fz.vy = 0;
            fz.luft = true;
            fz.yBoden = NaN;
        }
        const m = wagenSpur(e, 240, null, grund);
        const aus = Object.assign(
            { name, koerper: "Wagen " + e.type + "#" + e.id, ort: ort(e.position.x, e.position.z) },
            m
        );
        weg(e);
        return aus;
    };
    proben.push(await o1("O1 Wagen unter dem Überhang"));
    // ── (T) DER EINGESCHMUGGELTE TÄTER: der Boden des Werks liest die Oberkante der Säule (der alte Leser)
    {
        const P = Object.getPrototypeOf(r);
        r._werkBoden = function () {
            return (x, z) => this.getTerrainHeightAt(x, z);
        };
        let t;
        try {
            t = await o1("T Schmuggel");
        } finally {
            delete r._werkBoden;
        }
        if (r._werkBoden !== P._werkBoden) throw new Error("der Schmuggel blieb im Stamm");
        window.__fallSchmuggel = t;
    }
    // ── O2 DIE SCHAU-FAHRT über die Spaltkante
    {
        const name = "O2 Schau-Fahrt über die Spaltkante";
        // der Start liegt 11,4 m vor der Spalte aus O1 (aus der Welt, `spaltenUm`), die Fahrt quert ihre Kante längs +x
        const S = o1s() ? { x: O1s.x - 11.4, z: O1s.z + 1.1 } : null;
        const grund = S ? grundUnter(S.x, r._voxelSurfaceY(S.x, S.z) + 1, S.z) : NaN;
        const e = S ? await wagen(S.x, S.z, grund, Math.PI / 2) : null;
        if (!S) proben.push({ name, fehler: "keine Spalte in der Welt (O1) — die Kante fehlt" });
        else if (!e) proben.push({ name, fehler: "der GT ließ sich nicht setzen/aufsitzen" });
        else {
            raeumen(O1s.x, O1s.z, 40);
            for (let i = 0; i < 12; i++) takt();
            st.playerVel.setValue(10.6, 0, 0);
            if (e._fahr) e._fahr.vlong = 10.6;
            const m = wagenSpur(e, 1200, (i) => tasten(i < 240));
            tasten(false);
            proben.push(
                Object.assign(
                    { name, koerper: "Wagen " + e.type + "#" + e.id, ort: ort(e.position.x, e.position.z) },
                    m,
                    { ruhe: false }
                )
            );
            weg(e);
        }
    }
    // ── O3 DIE HÖHLE der Boden-Funktion
    // die Höhle: die nächste Spalte mit ≥ 4 m Fels über ≥ 3 m Luft, in die der Leib passt (aus der Welt) — der Wagen in der nächsten Kammer (`hk`, die Spalte aus O1), der Wolf und der Spieler an
    // der nächsten Stelle mit der Wand im Umkreis von 2,5 m (`hs`)
    const hs = spalten({ fels: 4, luft: 3, R: WOLF_R, wand: true })[0] || null;
    const hk = o1s();
    const H = hs ? { x: hs.x, z: hs.z } : null;
    const hoehleGrund = hs ? hs.grund : NaN;
    const hoehleOk = !!hs;
    {
        const name = "O3 Wagen in der Höhle";
        if (hk) {
            await einschwingen(hk.x, hk.z);
            raeumen(hk.x, hk.z, 40);
        }
        if (!hk || !hoehleOk)
            proben.push({
                name,
                fehler: `keine Höhle in der Welt (keine Spalte mit 4 m Fels über 3 m Luft, in die der ${hk ? "Wolf mit Wand" : "Wagen"} passt)`,
            });
        else {
            const e = await wagen(hk.x, hk.z, hk.grund, 0);
            if (!e) proben.push({ name, fehler: "der GT ließ sich nicht setzen/aufsitzen" });
            else {
                const m = wagenSpur(e, 120, null, hk.grund);
                proben.push(
                    Object.assign(
                        { name, koerper: "Wagen " + e.type + "#" + e.id, ort: ort(e.position.x, e.position.z) },
                        m
                    )
                );
                weg(e);
                await einschwingen(H.x, H.z);
                raeumen(H.x, H.z, 40);
                // DER SPIELER AM ORT DES RUFS: die Wolf-Proben rufen ihre Tiere neben ihn (`spawnCreatureAt`) — er steht, wo der
                // Wagen stand.
                st.playerMesh.position.set(H.x, hoehleGrund + A.PLAYER_FOOT_OFFSET + 0.05, H.z);
                st.playerVel.setValue(0, 0, 0);
                st._fieldVy = 0;
            }
        }
    }
    // Ein Wolf an der Wand: er steht (sein Steuer-Schritt hält ihn), dann gleitet er gestoßen 1,5 s auf die nächste
    // Wand zu (6 m/s — die Reibung zehrt 0,6·g, er trüge 3 m weit; ohne Wand 3 m/s in +x) — oder er LÄUFT 2,5 s mit 2
    // m/s in sie hinein (`art` „lauf"). Die Wand hält ihn.
    const steuerRoh = A._steuerGesetz;
    const kappe = st.maxCreatures;
    // DIE STIRN eines Leibs: wie hoch der Boden eine halbe Länge voraus (längs `gier`) über dem eine halbe
    // Länge hinter der Wurzel liegt (das Dichtefeld, 2-cm-Schritte, je Punkt von der Höhe des Grunds aus)
    const stirnAn = (w, gier) => {
        const g0 = grundAm(w.position.x, w.position.y + 0.6, w.position.z);
        if (!Number.isFinite(g0)) return NaN;
        const hl = r._kreaturHalbLaenge(w);
        const bodenAn = (s) => {
            const px = w.position.x + Math.sin(gier) * hl * s,
                pz = w.position.z + Math.cos(gier) * hl * s;
            let h = g0;
            if (r._fieldSolid(px, h, pz)) while (h < g0 + 3 && r._fieldSolid(px, h, pz)) h += 0.02;
            else while (h > g0 - 3 && !r._fieldSolid(px, h, pz)) h -= 0.02;
            return h;
        };
        return bodenAn(1) - bodenAn(-1);
    };
    const wolfStoss = async (x, z, y, art, wand) => {
        const rx = wand ? wand.dx : 1,
            rz = wand ? wand.dz : 0;
        const lauf = art === "lauf";
        const steuer = { lauf: false };
        const steht = Object.create(steuerRoh.call(A));
        steht.steuerSchritt = (sw) => {
            if (steuer.lauf) {
                sw.gier = Math.atan2(rx, rz);
                sw.v = 2;
            } else sw.v = 0;
        };
        A._steuerGesetz = () => steht;
        st.maxCreatures = st.creatures.length + 2;
        try {
            const w = r.spawnCreatureAt(x, y, z, "calm", "wolf", { precise: true, bodySize: 1 });
            if (!w) return null;
            for (let i = 0; i < 20; i++) takt();
            const v0 = wand ? 6 : 3;
            const stirnStart = lauf ? stirnAn(w, Math.atan2(rx, rz)) : NaN;
            if (lauf) steuer.lauf = true;
            else w.userData._stossV = { x: rx * v0, z: rz * v0 };
            let tiefsteUnter = -Infinity,
                yMin = Infinity;
            for (let i = 0; i < (lauf ? 150 : 90); i++) {
                takt();
                const g = grundAm(w.position.x, w.position.y + 0.6, w.position.z);
                const unter = g === Infinity ? 99 : Number.isFinite(g) ? g - w.position.y : 99;
                if (unter > tiefsteUnter) tiefsteUnter = unter;
                if (w.position.y < yMin) yMin = w.position.y;
            }
            const gE = grundAm(w.position.x, w.position.y + 0.6, w.position.z);
            // DIE STIRN des laufenden Leibs am Ende und beim Anlauf — gegen den Hub, den der Gang-Deckel über die Länge
            // trägt; höher, als er beim Anlauf schon stand, steht er auf einer Kletterwand, die er hinaufstieg
            const stirn = lauf
                ? {
                      hoch: stirnAn(w, w.rotation.y || 0),
                      start: stirnStart,
                      hl: r._kreaturHalbLaenge(w),
                      deckel: 2 * r._kreaturHalbLaenge(w) * Math.tan(A.GANG_DECKEL_RAD),
                  }
                : null;
            const out = {
                stirn,
                koerper:
                    "Tier wolf#" +
                    (w.userData.id != null ? w.userData.id : w.id) +
                    (wand ? ` (${lauf ? "läuft" : "gestoßen"} an die Wand ${wand.d.toFixed(1)} m)` : ""),
                ort: ort(w.position.x, w.position.z),
                tiefsteUnter,
                yMin,
                todesEbene: yMin < todesEbene,
                yEnde: w.position.y,
                grundEnde: Number.isFinite(gE) ? gE : w.position.y - 99,
                dach: dachAn(w.position.x, w.position.z),
                grundSoll: grundAb(w.position.x, w.position.z, y),
                ruhe: true,
                band: A.STAND_SICHT_BAND,
            };
            r.removeCreature(w);
            return out;
        } finally {
            A._steuerGesetz = steuerRoh;
            st.maxCreatures = kappe;
        }
    };
    {
        const name = "O3 Wolf in der Höhle";
        if (!hoehleOk) proben.push({ name, fehler: "keine Höhle" });
        else {
            const m = await wolfStoss(H.x, H.z, hoehleGrund, undefined, hs.wand);
            proben.push(m ? Object.assign({ name }, m) : { name, fehler: "der Wolf ließ sich nicht rufen" });
        }
    }
    {
        const name = "O3 Wolf läuft in die Wand";
        if (!hoehleOk) proben.push({ name, fehler: "keine Höhle" });
        else {
            const m = await wolfStoss(H.x, H.z, hoehleGrund, "lauf", hs.wand);
            proben.push(m ? Object.assign({ name }, m) : { name, fehler: "der Wolf ließ sich nicht rufen" });
        }
    }
    // DER TOD IN DER HÖHLE: der Wolf steht auf dem Höhlen-Grund, stirbt und kippt — die Tod-Lage
    // (`_todHebeTafel`) hebt seine Wurzel je Kipp-Winkel so, dass die tiefste Stelle der Haut auf dem Boden bleibt. Die
    // Wahrheit der Linse: je Punkt der Haut (höchstens 400) der Abstand zum Fels unter ihm im Dichtefeld (im Fels: negativ,
    // die Tiefe darin).
    const hautAbstand = (c) => {
        c.updateMatrixWorld(true);
        const T = window.THREE || globalThis.THREE;
        const v = new T.Vector3();
        const haut = [];
        c.traverseVisible((o) => {
            if (o.isMesh && !o.isInstancedMesh && o.geometry && o.geometry.attributes.position) haut.push(o);
        });
        let n = 0;
        for (const o of haut) n += o.geometry.attributes.position.count;
        if (!n) return null;
        const schritt = Math.max(1, Math.ceil(n / 400));
        let min = Infinity;
        for (const o of haut) {
            const pa = o.geometry.attributes.position;
            for (let i = 0; i < pa.count; i += schritt) {
                o.getVertexPosition(i, v);
                v.applyMatrix4(o.matrixWorld);
                let a;
                if (r._fieldSolid(v.x, v.y, v.z)) {
                    let yy = v.y;
                    while (yy < v.y + 3 && r._fieldSolid(v.x, yy, v.z)) yy += 0.02;
                    a = v.y - yy;
                } else {
                    let yy = v.y;
                    while (yy > v.y - 3 && !r._fieldSolid(v.x, yy, v.z)) yy -= 0.02;
                    a = v.y - yy;
                }
                if (a < min) min = a;
            }
        }
        return Number.isFinite(min) ? min : null;
    };
    const wolfTod = async (x, z, y, gier) => {
        const steht = Object.create(steuerRoh.call(A));
        steht.steuerSchritt = (sw) => {
            sw.v = 0;
        };
        A._steuerGesetz = () => steht;
        st.maxCreatures = st.creatures.length + 2;
        try {
            const w = r.spawnCreatureAt(x, y, z, "calm", "wolf", { precise: true, bodySize: 1 });
            if (!w) return null;
            w.rotation.y = gier;
            w.userData._steuer = { gier, v: 0 };
            for (let i = 0; i < 30; i++) takt();
            const stehtM = hautAbstand(w);
            r.damageCreature(w, 1e6, {});
            const dy = w.userData.dying;
            if (!dy) {
                r.removeCreature(w);
                return { fehler: "der Wolf stirbt nicht" };
            }
            // der Gefallene verlässt die Liste der Wesen im Moment des Todes und liegt in state.leichname (Welle LF kampf)
            const dabei = () => st.creatures.includes(w) || (st.leichname || []).includes(w);
            let kippMin = Infinity,
                kippMax = -Infinity,
                liegtM = null,
                tiefsteUnter = -Infinity,
                yMin = Infinity;
            for (let i = 0; i < 600 && dabei(); i++) {
                takt();
                if (!dabei()) break;
                const g = grundAm(w.position.x, w.position.y + 0.6, w.position.z);
                const unter = g === Infinity ? 99 : Number.isFinite(g) ? g - w.position.y : 99;
                if (unter > tiefsteUnter) tiefsteUnter = unter;
                if (w.position.y < yMin) yMin = w.position.y;
                const fertig = dy.fall >= dy.dauer;
                if (i % 3 === 2 || fertig) {
                    const a = hautAbstand(w);
                    if (a !== null) {
                        kippMin = Math.min(kippMin, a);
                        kippMax = Math.max(kippMax, a);
                    }
                    if (fertig) {
                        liegtM = a;
                        break;
                    }
                }
            }
            const out = {
                koerper:
                    "Tier wolf#" +
                    (w.userData.id != null ? w.userData.id : w.id) +
                    ` (stirbt, Gier ${Math.round((gier * 180) / Math.PI)}°)`,
                ort: ort(w.position.x, w.position.z),
                tiefsteUnter,
                yMin,
                todesEbene: yMin < todesEbene,
                yEnde: w.position.y,
                grundEnde: grundAm(w.position.x, w.position.y + 0.6, w.position.z),
                dach: dachAn(w.position.x, w.position.z),
                grundSoll: grundAb(w.position.x, w.position.z, y),
                ruhe: false,
                band: A.STAND_SICHT_BAND,
                tod: {
                    stehtM,
                    liegtM,
                    kippMin: Number.isFinite(kippMin) ? kippMin : null,
                    kippMax: Number.isFinite(kippMax) ? kippMax : null,
                },
            };
            if (dabei()) r.removeCreature(w); // ein Wesen oder ein Gefallener (state.leichname)
            return out;
        } finally {
            A._steuerGesetz = steuerRoh;
            st.maxCreatures = kappe;
        }
    };
    // je Blickrichtung ein Tod am Ort der Höhle (die Kipp-Richtung folgt dem Hang, der Leib darüber der Gier)
    for (let k = 0; k < K.todGier; k++) {
        const name = "O3 Wolf stirbt in der Höhle";
        if (!hoehleOk) {
            proben.push({ name, fehler: "keine Höhle" });
            break;
        }
        const m = await wolfTod(H.x, H.z, hoehleGrund, (k / K.todGier) * Math.PI * 2);
        proben.push(
            m && !m.fehler
                ? Object.assign({ name }, m)
                : { name, fehler: (m && m.fehler) || "der Wolf ließ sich nicht rufen" }
        );
    }
    {
        const name = "O3 Spieler in der Höhle";
        if (!hoehleOk) proben.push({ name, fehler: "keine Höhle" });
        else {
            absteigen();
            const pm = st.playerMesh.position;
            pm.set(H.x, hoehleGrund + A.PLAYER_FOOT_OFFSET + 0.05, H.z);
            st.playerVel.setValue(0, 0, 0);
            st._fieldVy = 0;
            st.yaw = Math.PI; // nach −z, in die Halle
            let tiefsteUnter = -Infinity,
                yMin = Infinity;
            for (let i = 0; i < 180; i++) {
                tasten(i < 150);
                takt();
                const fuss = pm.y - A.PLAYER_FOOT_OFFSET;
                const g = grundAm(pm.x, fuss + 0.6, pm.z);
                const unter = g === Infinity ? 99 : Number.isFinite(g) ? g - fuss : 99;
                if (unter > tiefsteUnter) tiefsteUnter = unter;
                if (fuss < yMin) yMin = fuss;
            }
            tasten(false);
            const fuss = pm.y - A.PLAYER_FOOT_OFFSET;
            const gE = grundAm(pm.x, fuss + 0.6, pm.z);
            proben.push({
                name,
                koerper: "Spieler",
                ort: ort(pm.x, pm.z),
                tiefsteUnter,
                yMin,
                todesEbene: yMin < todesEbene,
                yEnde: fuss,
                grundEnde: Number.isFinite(gE) ? gE : fuss - 99,
                dach: dachAn(pm.x, pm.z),
                grundSoll: grundAb(pm.x, pm.z, hoehleGrund),
                ruhe: true,
            });
        }
    }
    // ── (Z) DER ZENSUS: Überhang-Spalten um die Spalte aus O1 und die Höhle aus O3 (Luft ≥ 3 m unter ≥ 2 m Fels, der Grund
    // ≥ 1 m Fels, der Wagen passt), je Ort bis 60 m
    const zensus = { spalten: 0, proben: 0, taeter: [], orte: [] };
    for (const z0 of [o1s(), hs].filter(Boolean)) {
        const [cx, cz] = [z0.x, z0.z];
        await einschwingen(cx, cz);
        raeumen(cx, cz, 60);
        const sp = spalten({ mitte: [cx, cz], rMax: 60, anzahl: K.spaltenJeOrt, fels: 2, luft: 3, R: KAMMER_R });
        zensus.spalten += sp.length;
        for (const s of sp) {
            zensus.orte.push(
                ort(s.x, s.z) + " (Grund " + s.grund.toFixed(1) + ", Oberkante " + s.dach.toFixed(1) + ")"
            );
            const e = await wagen(s.x, s.z, s.grund, 0);
            if (e) {
                const m = wagenSpur(e, 90, null, s.grund);
                zensus.proben++;
                const wo = `Wagen ${e.type}#${e.id} an ${ort(e.position.x, e.position.z)}`;
                if (m.tiefsteUnter > K.FALL_M || m.todesEbene)
                    zensus.taeter.push(
                        `${wo}: ${m.tiefsteUnter.toFixed(2)} m durch den Boden (y ${m.yEnde.toFixed(2)}, Grund ${m.grundEnde.toFixed(2)})`
                    );
                else if (m.yEnde - m.grundSoll > K.DACH_M)
                    zensus.taeter.push(
                        `${wo}: ${(m.yEnde - m.grundSoll).toFixed(2)} m über seinem Grund — aufs Dach (Oberkante ${m.dach.toFixed(1)})`
                    );
                weg(e);
            }
            const t = await wolfStoss(s.x, s.z, s.grund, undefined, s.wand);
            if (t) {
                zensus.proben++;
                const wo = `${t.koerper} an ${t.ort}`;
                if (t.tiefsteUnter > Math.max(K.FALL_M, t.band || 0) || t.todesEbene)
                    zensus.taeter.push(`${wo}: ${t.tiefsteUnter.toFixed(2)} m durch den Boden`);
                else if (t.yEnde - t.grundSoll > K.DACH_M)
                    zensus.taeter.push(
                        `${wo}: ${(t.yEnde - t.grundSoll).toFixed(2)} m über seinem Grund — aufs Dach (Oberkante ${t.dach.toFixed(1)})`
                    );
            }
        }
    }
    // B: zurück auf den Turm, der Save
    if (T0) {
        absteigen();
        await einschwingen(T0.x, T0.z);
        r.saveState();
    }
    const t = window.__fallSchmuggel;
    const schmuggel = t
        ? {
              rot: !!(
                  t.fehler === undefined &&
                  (t.tiefsteUnter > K.FALL_M || t.todesEbene || t.yEnde - t.grundEnde > K.DACH_M)
              ),
              mass:
                  t.fehler ||
                  `${(t.tiefsteUnter || 0).toFixed(2)} m unter dem Grund, am Ende y ${(t.yEnde || 0).toFixed(2)}`,
          }
        : null;
    return { proben, zensus, schmuggel, turm };
}

(async () => {
    console.log("=== DER FALL-WÄCHTER (Leben-Schau 2) — Null-Renderer, echter Spiel-Takt, Spaltgrund + Höhle ===");
    await new Promise((r) => server.listen(PORT, "127.0.0.1", r));
    const browser = await starteBrowser({ art: "null", frist: 900000 });
    const page = await browser.newPage();
    page.setDefaultTimeout(880000);
    await nullRenderer(page);
    await page.evaluateOnNewDocument(WELT_ORTE_INSTALL); // die Orte aus der Welt (`__weltOrte`, scripts/lib/welt-orte.cjs)
    let befund;
    try {
        await page.goto(`http://127.0.0.1:${PORT}/index.html`, { waitUntil: "domcontentloaded", timeout: 120000 });
        await warteAufWelt(page, 180000);
        befund = await page.evaluate(probe, {
            FALL_M,
            DACH_M,
            spaltenJeOrt: 6,
            todGier: TOD_GIER,
            turmBloecke: TURM_BLOECKE,
        });
        if (!befund.turm.fehler) {
            await new Promise((ok) => setTimeout(ok, 1500)); // der IDB-Put des Saves landet
            await page.reload({ waitUntil: "domcontentloaded", timeout: 120000 });
            await warteAufWelt(page, 180000);
            befund.turm.nach = await page.evaluate(probe, { nach: befund.turm });
        }
    } catch (e) {
        befund = { fehler: (e && e.message) || String(e) };
    }
    await browser.close();
    server.close();
    if (!befund || befund.fehler) {
        console.log("❌ LAUF-FEHLER: " + (befund ? befund.fehler : "kein Befund"));
        process.exit(1);
    }
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
    // DER LEBENDE STAND am Wandfuß (urteil: STAND IM FELS): je Blickrichtung die tiefste Stelle der Haut über dem Fels
    const stand = befund.proben.filter((p) => p.tod && Number.isFinite(p.tod.stehtM)).map((p) => p.tod.stehtM);
    if (stand.length)
        console.log(
            `  Lebender Stand am Wandfuß: ${stand.filter((s) => s < -TOD_M).length} von ${stand.length} Wölfen tiefer als ` +
                `${TOD_M} m im Fels, Haut ${Math.min(...stand).toFixed(2)} … ${Math.max(...stand).toFixed(2)} m über dem Fels`
        );
    console.log(
        `  Zensus: ${befund.zensus.spalten} Überhang-Spalten, ${befund.zensus.proben} Proben, ${befund.zensus.taeter.length} Täter`
    );
    for (const o of befund.zensus.orte) console.log(`    · ${o}`);
    console.log(`  Schmuggel (T): ${JSON.stringify(befund.schmuggel)}`);
    // DIE ZAHL DES TURMS (die Station bauen.K4 liest sie)
    const [T, hub] = [befund.turm, befund.turm.bloecke.map((b) => b[0])];
    const zahl = { hub: [Math.min(...hub), Math.max(...hub)], sohle: Math.max(...T.bloecke.map((b) => b[1])) };
    console.log("  B-ZAHL " + JSON.stringify({ ...T, bloecke: hub.length, ...zahl, befunde: turmUrteil(T) }));
    console.log(
        `  Quelle: ${befund.quelle.length ? befund.quelle.join(" · ") : "die Körper-Schritte lesen den Boden unter dem Körper"}`
    );
    const v = urteil(befund);
    if (v.length) {
        console.log("\n❌ FALL-WÄCHTER ROT:\n  " + v.join("\n  "));
        process.exit(1);
    }
    console.log(
        "\n✅ FALL-WÄCHTER GRÜN — jeder Körper steht auf dem Boden unter ihm: keiner fällt durch, keiner springt aufs Dach."
    );
    process.exit(0);
})();
