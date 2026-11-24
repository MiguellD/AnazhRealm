#!/usr/bin/env node
// ─────────────────────────────────────────────────────────────────────────
// diag-stand-takt.cjs — IM STAND KOSTET DIE WELT NICHTS (Lehre 25, Gebot 7).
// Die Wand fährt die Fege-Takte an der Mess-Wiese (Null-Renderer, der Fern-Ring über seinen Haken, die
// Foundry an — der Produktions-Pfad) und zählt mit der Stand-Linse (scripts/lib/stand-linse.cjs, dieselbe wie `werkbank
// stand`) je Frame die Blatt-Rufe jedes Fege-Takts:
//   (R) RUHE — die Welt steht (der Spieler, das Auge, keine Ankunft): 0 Einheiten in jedem Frame der Ruhe;
//   (S) SCHARF + TREUE — derselbe Stand mit gebrochener Wache (`_standRuht` schläft nie):
//       jeder Takt arbeitet (die Linse sieht ihn), und KEINER ändert die Welt (die Wache verschlief nichts) — die
//       Phase läuft, bis JEDER Takt eine volle Runde ging (die Runde nennt er `_standRuht`), und die Runde steht während der Phase (wächst sie, blieben Einheiten hinter dem Cursor ungesehen);
//   (X) TÄTER — je Takt, dessen Runde mehrere Gänge braucht (Stufen-Wahl, Streu, Saum), steht in der zweiten Hälfte seiner
//       Runde eine still verstellte Einheit: die Treue-Phase findet jede;
//   (W) WECKEN — ein Baum entsteht im Stand: Cull und Stufen-Wahl gehen, der Baum trägt danach seine Stufe, die Wache
//       schläft wieder (0 Einheiten); ein Regler-Schritt weckt den Cull, ein Wahrnehmungs-Schritt (LOD_DISTANCES, ohne
//       Weckruf geschrieben — der Stempel liest ihn selbst) die Stufen-Wahl und die Streu;
//   (G) GEHEN — W gehalten: Stufen-Wahlen, Cull und Nah-Streu arbeiten, der Spieler kommt voran — und Gehen kostet nur
//       die Änderung: in derselben Spieler-Zelle geht der Ring nicht, ohne neuen Anker des Fern-Rings der Saum nicht;
//   (T) STROM — nach der Ruhe ein Sprung an einen fremden Ort: der Spieler-Chunk steht (Streaming heilig, Lehre 13);
//   (B) BAKE-SCHULD — solange die Bake-Uhr Fits abweist, steht die Welt nicht, und ihr Grund nennt die Felder;
//   (D) DORF — die Welt steht erst nach dem letzten Haus eines Dorf-Akts (`spawnSettlement`); der Nexus ruht;
//   (P) kein Page-Error. Dass jeder Takt die Wache fragt und seinen Gang meldet, beweisen (S) und (X) am Verhalten (ein
//       Takt ohne Frage nennt keine Runde, einer ohne Meldung geht 0); keine Probe liest Quelltext.
// SELBSTTEST (--selftest, ohne Browser, in `npm run check`): ein Befund mit jedem Täter — Arbeit in Ruhe, stumpfe Linse,
// ein verschlafener Wechsel, eine halbe oder wachsende Runde, ein ungesehener Täter, ein Bau, der nicht weckt, starres
// Gehen, verhungernder Strom, eine Sim, die in Ruhe zählt oder nach ihrem Ereignis nicht schläft, ein Automat, der am
// Fixpunkt wach bleibt, Page-Error — MUSS rot fallen und ihn beim Namen nennen.
//   node scripts/diag-stand-takt.cjs [--selftest | --tat | --nachwuchs | --brand | --narbe]   (npm run gate:stand-takt; Port STAND_TAKT_PORT;
//   --tat: (K4), --nachwuchs: (K5), --brand: (K2#2 · K5#2), --narbe: (N1–N7, w28-brand-bild · -saum · -zunge · -nacht; N8, front-brand; L1–L5, w28-lava-zuendet) unten; --narbe: ROT Exit 1, Absturz Exit 2)
// ─────────────────────────────────────────────────────────────────────────
"use strict";

const { statikServer, nullWelt, warteAufWelt, taeterFaelle, selbsttestEnde, wandEnde, urteilEnde, SELBSTTEST, jsonKlon, fehlerText, seiteZu, mass, alsSelbsttest } = require("./lib/welt-boot.cjs");
const STAND = require("./lib/stand-linse.cjs");

// (N) DIE SONDE LIEST DEN BESTAND (satz-pass): nach dem Haupt-Pass blickt die Kamera ohne Pass zum Punkt 2 m unter dem Boden 60 m
// hinter dem gezeichneten Blick, und der Strahl der Nah-Deckung (scripts/lib/kamera-nah.cjs, die Blick-Wahl fragt so vor jedem Bild)
// nennt das Gelände, das der Satz-Abschnitt des Passes nicht trägt. Bis w18-abnahme-sicht fragte die Linie zum Ziel — das Ziel
// urteilt seitdem die Tiefe des Bilds
// (WN) DAS WASSERNETZ AM BACH STEHT: nach dem Stand wechselt in den Takten der Wache kein Netz (sonst der Chunk und die Ecke beim
// Namen), und der Pendel des Pegels (die Mutante) wechselt es
const N = (b) => b.netz || {};
// (V) DER VORBACKER AM VOLLEN WELT-MARCH (march-warter): das schweigende Feld eines Hauses mit Mesh fällt an der Reserve der
// Feld-Liste — das Haus fragt selbst nach Platz (sein Gang geht), die Welt steht, während es wartet (es hält keinen Fege-Takt
// wach), Platz über der Reserve weckt es (es bäckt), und unter der Mutante „nie geweckt“ (der Platz-Takt schweigt) bäckt es nicht
const vorbackerUrteil = (V) =>
    !V
        ? ["LEER: keine Vorbacker-Phase (der volle Welt-March)"]
        : !(V.satz > 0 && V.fiel > 0)
          ? [
                `LEER: kein schweigendes Feld fiel am vollen Welt-March (das Haus trug Mesh und Satz: ${V.satz | 0}, sein Feld ` +
                    `fiel: ${V.fiel | 0}, frei ${V.frei} bei Reserve ${V.reserve}; die Welt davor: ${V.stehtVor})`,
            ]
          : [].concat(
                V.fragteSelbst > 0
                    ? []
                    : `NIE GEFRAGT: das schweigende Feld eines Hauses mit Mesh fiel an der Reserve des Welt-March (Reserve ` +
                          `${V.reserve}), und das Haus fragte in ${V.fragtTakte} Takten nicht nach Platz — kein Warter steht am ` +
                          "Platz, freier Platz weckt keinen (`_archZiegelWeicht`)",
                !(V.n > 0 && V.fragten > 0 && V.wartet)
                    ? `LEER: kein Vorbacker wartet am vollen Welt-March (${V.n | 0} Haus mit Mesh ohne Satz, ${V.fragten | 0} ` +
                          `Fragen nach Platz über der Reserve, frei ${V.frei} bei Reserve ${V.reserve})`
                    : [].concat(
                          typeof V.steht === "number"
                              ? []
                              : `VORBACKER HÄLT WACH: ein Haus mit Mesh wartet an der Reserve des Welt-March (frei ${V.frei}, ` +
                                    `Reserve ${V.reserve}) auf Platz — ${V.steht}`,
                          V.gebacken > 0
                              ? []
                              : `NIE GEWECKT: Platz über der Reserve (frei ${V.freiNach}, Reserve ${V.reserve}) weckte den ` +
                                    `Vorbacker in ${V.takte} Takten nicht — er bäckt nie (\`_weltPlatzTakt\`, die Zusage weckt den Takt)`,
                          V.mutante > 0 ? "BLIND: unter der Mutante „nie geweckt“ (der Platz-Takt schweigt) bäckt der Vorbacker" : []
                      )
            );
const urteil = (b) =>
    STAND.standUrteil(b).concat(
        vorbackerUrteil(b.vorbacker),
        b.sonde?.vor === "Gelände" ? [] : `SONDE: Abschnitt der vorigen Kamera, trifft ${b.sonde?.vor}`,
        !N(b).ort ? "LEER: keine Netz-Wache am Bach" : [],
        N(b).wechsel ? `WASSERNETZ OHNE FIXPUNKT: ${N(b).wechsel} Wechsel nach dem Stand, zuletzt ${N(b).wo}` : [],
        N(b).ort && !(N(b).mutante > 0) ? "BLIND: der Pendel des Pegels wechselt kein Netz" : []
    );

function selbsttest() {
    const namen = Object.keys(STAND.TAKTE);
    const phase = (je, frames = 10, wirkt = 0) => ({
        frames,
        summe: je * namen.length * frames,
        takte: Object.fromEntries(
            namen.map((n) => [n, { summe: je * frames, mittel: je, max: je, mitArbeit: je > 0 ? frames : 0, wirkt }])
        ),
    });
    // eine Treue-Phase wie an der Mess-Wiese (14 Frames): jeder Takt ging seine volle Runde ([`runde` laut `_standRuht`,
    // gegangen]) — Stufen-Wahl, Streu und Saum über mehrere Gänge, die anderen in einem
    const RUNDE = {
        strom: [1, 14],
        archLod: [1638, 3584],
        archCull: [1, 14],
        streuLod: [1845, 2240],
        nahStreu: [1, 14],
        nahWiese: [1, 14],
        deckWache: [1728, 1792],
    };
    // eine Sim-Phase: `je` Einheiten je Frame (nur die Sim `nur`, sonst jede), ihr Täter `_x`
    const simPh = (je, frames, nur) => ({
        frames,
        spielS: 60,
        akt: 0,
        sims: Object.fromEntries(
            Object.keys(STAND.SIMS).map((n) => [n, { summe: !nur || nur === n ? je * frames : 0, mitArbeit: frames, je: [["_x", je]] }])
        ),
    });
    const treuPhase = (je) => {
        const ph = phase(je, 14);
        for (const n of namen) Object.assign(ph.takte[n], { runde: RUNDE[n][0], gang: RUNDE[n][1] });
        return ph;
    };
    const gruen = {
        ruhe: phase(0, 30),
        bruch: treuPhase(40),
        taeter: (() => {
            const je = {
                archLod: { stelle: 1600, runde: 1638 },
                streuLod: { stelle: 1734, runde: 1845 },
                deckWache: { stelle: 1727, runde: 1728 },
            };
            const X = { je, phase: treuPhase(40) };
            for (const n in je) X.phase.takte[n].wirkt = 1;
            return X;
        })(),
        gehen: (() => {
            const g = Object.assign(phase(30, 40), { weg: 6.2, zelleGleich: true, ankerGleich: true });
            Object.assign(g.takte.strom, { summe: 0, mittel: 0, max: 0, mitArbeit: 0 });
            Object.assign(g.takte.deckWache, { summe: 0, mittel: 0, max: 0, mitArbeit: 0 });
            return g;
        })(),
        wecken: {
            eintrag: true,
            versorgt: true,
            phase: phase(25, 30),
            nachher: phase(0, 20),
            treue: (() => {
                const t = treuPhase(40);
                t.takte.nahStreu.geweckt = 2; // die Weck-Probe: ihre Kachel ging die heile Wache selbst
                return t;
            })(),
            weckProbe: { frame: 1, kacheln: 1 },
            regler: phase(12, 10),
            wahrnehmung: phase(30, 4),
            schirm: Object.assign(phase(30, 4), { stehtSofort: false, zeilen: [360, 480] }),
            zusage: Object.assign(phase(3, 4), { vor: 0, wach: true }),
        },
        // BÜHNE: Befund des Selbsttests, kein gesetzter Ort
        strom: {
            spielerChunk: true,
            x: -300,
            z: -850,
            takte: 40,
            wald: { imJob: 412, aussen: 0, ms: 0, taeter: null, maxTakt: 0 },
        },
        stufe: { wechsel: 2, takte: { nahStreu: 1, nahWiese: 1 }, rufe: {} },
        // BÜHNE: Befund des Selbsttests, kein gesetzter Ort
        ort: {
            ort: [-182, -1038],
            fern: 240,
            takte: 60,
            gelegt: true,
            setzMs: 4,
            standVor: 2,
            standNach: 2,
            darts: { fern: 812, gehalten: 812 },
            chunks: {
                basis: { fern: 6, gehalten: 6 },
                dichte: { fern: 0, gehalten: 0 },
                mesh: { fern: 2, gehalten: 2 },
            },
            stand: { key: "-11,-27", vor: "3|0", nach: "3|0", gleich: true },
            plan: 140,
            maxTaktMs: 21,
            raeumung: { abbau: 5, saves: 0, saveMs: 0 },
            kamin: { kultur: "alemannisch", gesetzt: true, bau: 0, ms: 0 },
            satzHaus: {
                kultur: "alemannisch",
                gesetzt: true,
                takte: 3,
                gruppen: 7,
                ecken: 26800,
                bloecke: 7,
                frischKB: 0,
            },
            wald: {
                gesetzt: true,
                // BÜHNE: Befund des Selbsttests, kein gesetzter Ort
                ort: [-182, -618],
                synchron: 0,
                ms: 0,
                takte: 64,
                gestalt: 2,
                imTakt: 169,
                maxTaktZellen: 3,
                maxTaktMs: 4.1,
            },
            // BÜHNE: Befund des Selbsttests, kein gesetzter Ort
            amSpieler: { ort: [-293, -1071], gelegt: true, dirty: 9, takte: 42, heil: true, sync: [] },
        },
        nachschub: { takte: 31, schlange: 0, foundry: 0, warten: [] },
        // BÜHNE: Befund des Selbsttests, kein gesetzter Ort
        fuehrung: { x: 700, z: -800, abstand: 1044, steht: true, takte: 23, grund: null },
        dorf: { steht: 41, placed: 12 },
        vorbacker: { satz: 1, stehtVor: 80, fiel: 1, fragtTakte: 0, fragteSelbst: 1, n: 1, fragten: 1, wartet: true, reserve: 128, frei: 128, steht: 30, freiNach: 192, mutante: 0, takte: 2, gebacken: 1 }, // prettier-ignore
        wach: "DIE WELT STEHT NICHT nach 61 Takten: Ruhe 0, zuletzt brach sie: Fege-Takt archCull wartet",
        schuld: { abgewiesen: 40, grund: "Felder offen 8", takte: 214, rest: 0 },
        simRuhe: Object.assign(simPh(0, 3600), { vorher: { ernte: {}, leben: 9 } }),
        simWecken: {
            saison: { wach: simPh(3, 5), nachher: simPh(0, 60) },
            regen: { wach: simPh(6, 5), nachher: simPh(0, 60) },
            wuchs: { offen: 2, wach: simPh(9, 5), nachher: simPh(0, 60) },
            nachwuchs: { wach: simPh(2, 1), nachgewachsen: true, nachher: simPh(0, 60) },
            feld: { geschrieben: 2160, wellen: [0, 1, 2, 3].map(() => ({ groesse: 540, tote: 0 })), welle: Object.assign(simPh(0, 1), { akt: 2200 }), ueber: 0 }, // prettier-ignore
            brand: {
                start: true,
                // sechs Schritte eines Felds von 9–16 Zellen (die Mess-Wiese, Radeon 890M): der Gang je Schritt; in Schritt 3 EINE
                // Ankunft der Front mit neu gemessenem Bett (fünf grobe Punkte, alle Gras), in Schritt 4 zwei
                ...{ zellen: [9, 9, 12, 16, 16, 12], gang: [27, 90, 46, 50, 113, 36], zuendung: [0, 0, 395, 763, 0, 0] },
                // in Schritt 4 fällt die Wiese über EINER Zelle (±½ Zelle, 1 024 m²): 98 Kacheln der Streu, 24 der Wiese stehen darin
                ...{ kachel: [0, 0, 0, 122, 0, 0], kachelSoll: [0, 0, 0, 122, 0, 0], ringe: [0, 0, 0, 1, 0, 0], ringM2: [0, 0, 0, 1024, 0, 0], rufeK: [[], [], [], [["_nahStreuKachelFaellt", 98], ["_nahWieseKachelFaellt", 24]], [], []] },
                ...{ ankuenfte: [0, 0, 1, 2, 0, 0], betten: [0, 0, 1, 2, 0, 0], punkte: [0, 0, 5, 10, 0, 0], kahl: [0, 0, 0, 0, 0, 0], masken: [0, 0, 0, 0, 0, 0] },
                ...{ lesungen: [0, 0, 5, 10, 0, 0], brennt: 0, asche: 4, mit: 0.9, gegen: 0.03, ohneWind: 0.04, schritte: 6, bilder: 6 },
                // die Herde auf dem gesetzten Bett (Gras, Last 0,092, im gesetzten Wind): das Vorrücken trägt R, die drei Starts der
                // Diagonale dieselben Zahlen, das grobe Gitter (nur Diagonalen) verliert die Hälfte; der Herd des Spiels verzehrte 17
                // fremde Betten von 21 (sein Bett ungesetzt)
                ...((b) => {
                    const h = (winkel, vor, R, mehr) => ({ zellen: 44, koepfe: 9, mit: 0.58, alle: 0.63, vor, R, winkel, schritte: 300, bilder: 300, bett: { ...b }, ...mehr });
                    const wahr = { achse: h(0.8, 0.62, 0.64), schraeg: h(23.5, 0.6, 0.63), diagonal: h(44.1, 0.6, 0.63), wieder: h(44.1, 0.6, 0.63), langsam: h(44.1, 0.6, 0.63, { bilder: 371 }), grob: h(44.1, 0.3, 0.63) };
                    return { wahr, fenster: { spiel: wahr.diagonal, langsam: wahr.langsam }, uhrRueck: [], bett: { ...b, zellen: 21, abweichend: 17, erste: "Last 0.061" } };
                })({ stoff: "gras", w: 0.092, boden: 0.1, naesse: 0, zellen: 51, abweichend: 0, erste: null }),
                ...{ lebVor: 0.62, lebNach: 0.32, ovVor: 0, ovNach: 0, glut: 1, licht: true, nachher: simPh(0, 60) },
            },
            // die Druckwelle der Probe (die Mess-Wiese, GTX 1050, Null-Renderer, die Welt frisch): ein Fass mit 60,6 MJ, die
            // Bruch-Grenze des Gesetzes 29,98 m — vier Fenster brechen (das in 12 m mit zwei Scheiben), zwei stehen; nach dem
            // Bruch-Gesetz der Scheibe (druckwelle-bild) fallen die drei nahen in 4 × 4 Scherben je Scheibe (Kanten 66 bis 184 mm),
            // das in 24 m in 2 × 3 (85 bis 250 mm); der Vorrat der Welle bis auf fünf verbraucht: 9 Scherben, dann das Kreuz
            druck: ((E) => ({
                start: true,
                frist: 2.465,
                ereignisse: E.map((e) => ({ teile: 0, scherben: 0, ...e, leser: [["_x", e.einheiten]] })),
                einheiten: E.reduce((s, e) => s + e.einheiten, 0),
                rest: 0,
                grenze: 29.982,
                scheiben: [[8.031, 5.557, 1, 16], [12.037, 3.234, 2, 32], [16.045, 2.177, 1, 16], [24.064, 1.296, 1, 6], [36.097, 0.811, 1, 0], [48.142, 0.593, 1, 0]].map(([R, last, n, scherben]) => ({ R, gebrochen: scherben > 0, last, kreuz: 4 * n, scherben, ...(scherben ? ((k) => ({ soll: scherben, kanteSoll: k.slice(), kante: k.slice() }))(scherben === 6 ? [0.085, 0.25] : [0.066, 0.184]) : {}) })), // prettier-ignore
                ...{ scherben: 70, zaehler: 70, vorrat: { rest: 5, scherben: [9, 4] }, wach: 0, schlafS: 2.167, verzug: 0.032 },
                staub: { randM: 43.173, kornMm: 0.111, ostM: 8, narbeM2: 2300, sollG: 1200, echt: { ballen: 9, lebend: 9 }, gesaet: 384, ballen: 384, max: 384, grob: 150, masseG: 1190, aussen: 0, jenseits: 0, lebenS: 13.9, bilder: 700, ballenMax: 384, satzMax: 384, luftMaxG: 1150, satzMaxG: 1150, ohneSatz: 0, nebenG: 0.01, steigt: 0, endeS: 12.2, danach: { satz: 0, uhr: null } },
                bildLage: Object.fromEntries([["geburt", 70], ["neubau", 16], ["stand", 1]].map(([k, n]) => [k, { n, schief: 0, grad: 0, mm: 0 }])), // prettier-ignore
                kiste: { R: 6, dv: 1.542, soll: 1.542, wegM: 0.202 },
                spieler: { R: 16, dv: 1.005 },
                ohr: { dp: 18281.248, dauer: 0.008 },
                mutante: { raeumt: 4, bruch: [3254, 6318, 3516, 1832], bild: { geburt: [70, 92.148], neubau: [16, 172.125], stand: [1, 57.296] }, staub: { aussen: 180, masseG: 2400, sollG: 1200 } },
                nachher: simPh(0, 60),
            }))([
                { art: "welle", einheiten: 2245, blick: 71, netz: 4136 },
                { art: "umsatz", einheiten: 37 },
                { art: "frei", R: 6, einheiten: 11 },
                { art: "werk", R: 8.013, einheiten: 3183, teile: 2, scherben: 16 },
                { art: "werk", R: 12.008, einheiten: 6091, teile: 3, scherben: 32 },
                { art: "leib", R: 16, einheiten: 12 },
                { art: "ohr", R: 16, einheiten: 2 },
                { art: "werk", R: 16.006, einheiten: 3328, teile: 2, scherben: 16 },
                { art: "werk", R: 24.004, einheiten: 1597, teile: 2, scherben: 6 },
                { art: "werk", R: 36.003, einheiten: 6, teile: 2 },
                { art: "werk", R: 48.002, einheiten: 6, teile: 2 },
                { art: "ende", einheiten: 3 },
                { art: "staub", einheiten: 180, zellen: 64, ballen: 9 },
            ]),
            // BÜHNE: Befund des Selbsttests, kein gesetzter Ort
            wasser: { ort: [-396, -878], chunks: 9, takte: [1, 1], gehalten: [0, 0], bewegt: [0, 0] },
        },
        fixWach: false,
        sonde: { vor: "Gelände" },
        // BÜHNE: Befund des Selbsttests, kein gesetzter Ort
        netz: { ort: [-396, -878], takte: 600, wechsel: 0, mutante: 25 },
        fix: [
            { takte: 49, wirkte: 7, nach: { frames: 150, summe: 0, takte: { archLod: { summe: 0, mitArbeit: 0, wirkt: 0 } } } },
            { takte: 44, wirkte: 8, nach: { frames: 150, summe: 0, takte: { archLod: { summe: 0, mitArbeit: 0, wirkt: 0 } } } },
        ],
        pageErrors: [],
    };
    const fehler = [];
    const faelle = [
        [
            "der Cull-Gang in Ruhe (die Basis)",
            ["ruhe.takte.archCull", { summe: 105360, mittel: 3512, max: 3512, mitArbeit: 30 }],
            /RUHE: archCull \(tickArchitectureCulling\) arbeitet im Stand — 105360 Einheiten in 30 von 30 Frames/,
        ],
        [
            "ein Ausreißer der Saum-Wache in Ruhe",
            ["ruhe.takte.deckWache", { summe: 128, mittel: 4.27, max: 128, mitArbeit: 1 }],
            /RUHE: deckWache .* 128 Einheiten in 1 von 30 Frames/,
        ],
        [
            "stumpfe Linse (die Nah-Wiese zählt nichts)",
            ["bruch.takte.nahWiese", { summe: 0, mittel: 0, max: 0, mitArbeit: 0 }],
            /STUMPF: .* für nahWiese keine Arbeit/,
        ],
        [
            "die Wache verschlief einen Wechsel",
            ["bruch.takte.archLod.wirkt=", 3],
            /TREUE: archLod \(_tickArchitectureLOD\) änderte mit gebrochener Wache nach der Ruhe die Welt in 3 Gängen/,
        ],
        [
            "ein Bau weckt den Cull nicht",
            ["wecken.phase.takte.archCull", { summe: 0, mitArbeit: 0 }],
            /WECKEN: ein Bau im Stand weckt archCull nicht/,
        ],
        ["der Bau bleibt ohne Stufe", ["wecken.versorgt=", false], /WECKEN: der neue Bau trägt/],
        [
            "die Wache verschlief die Stufe des neuen Baums",
            ["wecken.treue.takte.archLod.wirkt=", 1],
            /TREUE: archLod .* nach dem Bau die Welt in 1 Gängen/,
        ],
        [
            "der Weckruf der Treue zeigt keinen geweckten Gang",
            ["wecken.treue.takte.nahStreu.geweckt=", 0],
            /STUMPF: der Weckruf in der Treue-Phase \(1 Kacheln neu\) zeigt keinen geweckten Gang der Nah-Streu/,
        ],
        ["die Weck-Probe weckt keine Kachel", ["wecken.weckProbe.kacheln=", 0], /LEER: die Weck-Probe der Treue weckte keine Kachel/],
        [
            "ein Regler-Schritt weckt den Cull nicht",
            ["wecken.regler.takte.archCull", { summe: 0, mitArbeit: 0 }],
            /WECKEN: ein Regler-Schritt \(der Cull-Radius\) weckt archCull nicht/,
        ],
        [
            "die Zusage eines Schläfers weckt den Cull nicht",
            ["wecken.zusage.takte.archCull", { summe: 0, mitArbeit: 0 }],
            /WECKEN: die Zusage eines Schläfers weckt archCull nicht/,
        ],
        ["die Zusage holt den Schläfer nicht in die Wache", ["wecken.zusage.wach=", false], /WECKEN: die Zusage holt den Schläfer nicht/],
        ["vor der Zusage ruht der Cull nicht", ["wecken.zusage.vor=", 12], /LEER: vor der Zusage des Schläfers ruhte archCull nicht \(12/],
        [
            "nach dem Bau schläft die Wache nicht",
            ["wecken.nachher=", Object.assign(phase(0, 20), { summe: 7020 })],
            /WECKEN: nach dem Bau schläft die Wache nicht wieder \(7020/,
        ],
        [
            "starres Gehen (der Cull hält)",
            ["gehen.takte.archCull", { summe: 0, mitArbeit: 0 }],
            /STARR: beim Gehen arbeitet archCull nicht/,
        ],
        [
            "der Ring geht beim Gehen in derselben Zelle",
            ["gehen.takte.strom", { summe: 2490, mitArbeit: 30 }],
            /GEHEN: der Ring geht ohne Zellen-Wechsel \(2490 Einheiten\)/,
        ],
        [
            "der Saum geht beim Gehen ohne neuen Anker",
            ["gehen.takte.deckWache", { summe: 3840, mitArbeit: 30 }],
            /GEHEN: der Saum geht ohne neuen Anker \(3840 Einheiten\)/,
        ],
        ["der Gang verlässt seine Zelle", ["gehen.zelleGleich=", false], /LEER: der Gang verließ seine Zelle/],
        ["Gehen ohne Weg", ["gehen.weg=", 0.2], /BEWEGUNG: beim Gehen kam der Spieler 0.2 m voran/],
        [
            "ein Stufen-Wechsel weckt die Stufen-Wahl",
            ["stufe", { takte: { archLod: 1638 }, rufe: { _lodTreeVisHeight: 1638 } }],
            /STUFE: 2 Stufen-Wechsel ohne Form-Änderung wecken archLod \(1638 Einheiten\)/,
        ],
        ["die Stufen-Probe ist stumpf", ["stufe.wechsel=", 0], /STUFE: kein Stufen-Wechsel geschah/],
        [
            "das Streaming verhungert nach der Ruhe",
            ["strom.spielerChunk=", false],
            /STROM: nach dem Sprung an \(-300, -850\) steht der Spieler-Chunk nach 40 Takten nicht/,
        ],
        [
            "die Treue-Phase geht 6 Frames (die Streu 960 von 1 845 Zellen)",
            ["bruch.takte.streuLod", { gang: 960 }],
            /TREUE-LÜCKE: streuLod \(_tickScatterLod\) ging nach der Ruhe 960 von 1845 Einheiten/,
        ],
        [
            "die Treue nach dem Bau geht 6 Frames (der Saum 768 von 1 728 Punkten)",
            ["wecken.treue.takte.deckWache", { gang: 768 }],
            /TREUE-LÜCKE: deckWache \(_fernRingDeckWache\) ging nach dem Bau 768 von 1728 Einheiten/,
        ],
        [
            "die Treue nach dem Bau nennt die Runde nicht",
            ["wecken.treue.takte.archLod.runde"],
            /LEER: die Treue-Phase nach dem Bau nennt die Runde von archLod nicht/,
        ],
        [
            "der Täter der Streu in der zweiten Rundenhälfte bleibt ungesehen (6 Frames)",
            ["taeter.phase.takte.streuLod", { wirkt: 0, gang: 960 }],
            /TREUE-TÄTER: .* von streuLod \(_tickScatterLod\) an Stelle 1734 von 1845 nicht \(gegangen 960\)/,
        ],
        [
            "der Täter des Saums bleibt ungesehen",
            ["taeter.phase.takte.deckWache.wirkt=", 0],
            /TREUE-TÄTER: .* von deckWache \(_fernRingDeckWache\) an Stelle 1727 von 1728 nicht/,
        ],
        [
            "der Täter steht in der ersten Rundenhälfte",
            ["taeter.je.streuLod.stelle=", 400],
            /LEER: der Täter von streuLod steht an Stelle 400 von 1845/,
        ],
        [
            "die Stufen-Wahl trägt keinen Täter (ihre Runde braucht mehrere Gänge)",
            ["taeter.je.archLod"],
            /LEER: kein Täter für archLod \(_tickArchitectureLOD\) — seine Runde \(1638 Einheiten\) braucht mehrere Gänge/,
        ],
        [
            "der Täter weckt einen fremden Takt",
            ["taeter.phase.takte.archCull.wirkt=", 2],
            /TREUE: archCull .* mit den Tätern die Welt in 2 Gängen/,
        ],
        ["keine Täter-Probe", ["taeter"], /LEER: keine Täter-Probe der Treue/],
        [
            "die Runde der Stufen-Wahl wächst während der Treue-Phase",
            ["bruch.takte.archLod", { rundeVon: 1638, runde: 1702, gang: 3584 }],
            /TREUE-LÜCKE: archLod \(_tickArchitectureLOD\) änderte nach der Ruhe seine Runde \(1638 → 1702 Einheiten\)/,
        ],
        [
            // z154: der Schritt der Schneegrenze bestellte den Ring in der Täter-Phase neu, der Saum ruhte 165 Frames, der neue
            // Ring überschrieb den Saum-Täter
            "der Ring wird in der Täter-Phase neu bestellt",
            ["taeter.phase.takte.deckWache", { wirkt: 0, ortWechsel: "0 → 1048576" }],
            [/TREUE-TÄTER: .* von deckWache .* nicht/, /TREUE-EINGABE: deckWache .* seinen Ort \(0 → 1048576\)/],
        ],
        [
            "ein Wahrnehmungs-Schritt weckt die Streu nicht (der Stempel liest die LOD-Distanzen nicht)",
            ["wecken.wahrnehmung.takte.streuLod", { summe: 0, mitArbeit: 0 }],
            /WECKEN: ein Wahrnehmungs-Schritt \(LOD_DISTANCES, ohne Weckruf\) weckt streuLod nicht/,
        ],
        [
            "nach einem Schirm-Schritt steht die Welt ohne einen Takt (`_weltSteht` liest die Zeilen nicht — main)",
            ["wecken.schirm", { stehtSofort: true }],
            /WECKEN: nach einem Schirm-Schritt \(360 → 480 Zeilen\) steht die Welt ohne einen Takt/,
        ],
        [
            "ein Schirm-Schritt weckt die Stufen-Wahl nicht (der Stempel liest die Zeilen des Schirms nicht)",
            ["wecken.schirm.takte.archLod", { summe: 0, mitArbeit: 0 }],
            /WECKEN: ein Schirm-Schritt \(der Zeichenpuffer wechselt seine Zeilen, ohne Weckruf\) weckt archLod nicht/,
        ],
        [
            "der Schirm-Schritt wechselt keine Zeile (die Probe ist leer)",
            ["wecken.schirm.zeilen", [360, 360]],
            /LEER: der Schirm-Schritt wechselte keine Zeile/,
        ],
        [
            "der Erdbau wirft das Dart-Gedächtnis der Welt",
            ["ort", {
                    standNach: 3,
                    darts: { fern: 812, gehalten: 0 },
                    plan: 2579,
                    maxTaktMs: 880,
                }],
            /ORT: der Erdbau bei \(-182,-1038\) warf das Dart-Gedächtnis der Welt \(Stand des Walds 2 → 3.*2579 Wald-Zellen neu .*planForestCell.*880 ms/,
        ],
        [
            "ferne Wald-Zellen fallen (der Stand bleibt)",
            ["ort.darts.gehalten=", 700],
            /ORT: der Erdbau bei \(-182,-1038\) warf 112 von 812 fernen Wald-Zellen/,
        ],
        [
            "ein fernes Chunk-Gedächtnis fällt",
            ["ort.chunks.basis.gehalten=", 0],
            /ORT: der Erdbau bei \(-182,-1038\) warf 6 von 6 fernen Chunk-Gedächtnissen \(basis/,
        ],
        [
            "der Stand eines fernen Chunks springt",
            ["ort.stand", { nach: "4|0", gleich: false }],
            /ORT: der Erdbau bei \(-182,-1038\) verwarf die Worker-Antworten des fernen Chunks -11,-27 \(Stand 3\|0 → 4\|0\)/,
        ],
        [
            "jeder Abbau speichert die Welt synchron",
            ["ort.raeumung", { saves: 5, saveMs: 420 }],
            /ORT: der Abbau von 5 Natur-Stücken speicherte die Welt 5× synchron \(`removeArchitecture › saveState`, Σ 420 ms\)/,
        ],
        ["die Ort-Phase räumt nichts", ["ort.raeumung.abbau=", 0], /LEER: die Ort-Phase räumte keine Natur/],
        [
            "die Ort-Phase sieht keine fernen Zellen",
            ["ort.darts.fern=", 0],
            /LEER: die Ort-Phase sah keine fernen/,
        ],
        ["die Ort-Phase legt keinen Erdbau", ["ort.gelegt=", false], /LEER: die Ort-Phase legte keinen Erdbau/],
        [
            "das Solo-Haus baut seinen Kern im Haupt-Faden (bis B3c)",
            ["ort.kamin", { bau: 1, ms: 52.4 }],
            /ORT: das Solo-Haus \(alemannisch\) baute seinen Kern 1× im Haupt-Faden .*chimneyTipFromParams.*52\.4 ms/,
        ],
        [
            "die Ort-Phase setzt kein Solo-Haus",
            ["ort.kamin.gesetzt=", false],
            /LEER: die Ort-Phase setzte kein Solo-Haus/,
        ],
        [
            "der Satz-Block legt die Ecken eines Hauses frisch an",
            ["ort.satzHaus", { frischKB: 2048 }],
            /ORT: das Haus im Satz \(alemannisch, 26800 Ecken in 7 Gruppen\) legte beim Wieder-Eintritt 2\.0 MB frisch an .*_tickBauSatz › _bauSatzBlock › _satzBlock/,
        ],
        [
            "die Ort-Phase bringt kein Haus in den Bau-Satz",
            ["ort.satzHaus", { gruppen: 0, ecken: 0, bloecke: 0, takte: 600 }],
            /LEER: die Ort-Phase brachte kein Haus in den Bau-Satz \(alemannisch, 0 Gruppen, 0 Ecken nach 600 Takten\)/,
        ],
        [
            "der Baum in frischem Wald plant seine Zellen synchron",
            ["ort.wald", { synchron: 169, ms: 271.4, takte: 0, imTakt: 0, maxTaktZellen: 0 }],
            /ORT: der Baum in frischem Wald bei \(-182,-618\) plante 169 Wald-Zellen synchron .*_ortGestaltSame.*planForestCell.*271\.4 ms/,
        ],
        [
            "die Gestalt des Baums in frischem Wald steht nie",
            ["ort.wald", { gestalt: null, takte: 600 }],
            /ORT: die Gestalt des Baums in frischem Wald steht nach 600 Takten nicht/,
        ],
        [
            "die Schlange des Walds plant am Stück",
            ["ort.wald", { maxTaktMs: 271.4, maxTaktZellen: 169 }],
            /ORT: die Schlange des Walds plante in EINEM Takt 271\.4 ms \(169 Zellen\)/,
        ],
        [
            "die Ort-Phase setzt keinen Baum in frischem Wald",
            ["ort.wald.gesetzt=", false],
            /LEER: die Ort-Phase setzte keinen Baum in frischem Wald/,
        ],
        [
            "der Neubau unter dem Spieler baut seinen Chunk synchron",
            (b) =>
                b.ort.amSpieler.sync.push(
                    {
                        ms: 3.1,
                        kette: "_gameLoopTick › _tickDirtyVoxelChunks › _rebuildVoxelChunk › _acquireVoxelChunkBuild",
                    },
                    {
                        ms: 154.6,
                        kette: "_gameLoopTick › _tickDirtyVoxelChunks › _rebuildVoxelChunk › _acquireVoxelChunkBuild",
                    }
                ),
            /ORT: der Erdbau unter dem Spieler bei \(-293,-1071\) baute 1 Chunk synchron im Haupt-Faden \(`_gameLoopTick › _tickDirtyVoxelChunks › _rebuildVoxelChunk › _acquireVoxelChunkBuild › _buildVoxelChunkData`, der längste 154\.6 ms\)/,
        ],
        [
            "der Boden unter dem Spieler heilt nicht (der Neubau verhungert)",
            ["ort.amSpieler", { heil: false, takte: 600 }],
            /ORT: der Erdbau unter dem Spieler bei \(-293,-1071\) heilt nicht — nach 600 Takten warten noch Chunks/,
        ],
        [
            "der Erdbau unter dem Spieler markiert nichts",
            ["ort.amSpieler.dirty=", 0],
            /LEER: der Erdbau unter dem Spieler markierte keinen Chunk zum Neubau/,
        ],
        [
            "die Ort-Phase legt keinen Erdbau unter dem Spieler",
            ["ort.amSpieler"],
            /LEER: die Ort-Phase legte keinen Erdbau unter dem Spieler/,
        ],
        [
            "der Pflanz-Gang plant frische Zellen am Stück",
            ["strom.wald", {
                    aussen: 96,
                    ms: 131.2,
                    maxTakt: 41,
                    taeter: "_forestCellDarts › _forestPlantChunk › _populateVoxelChunkVegetation › _finalizeVoxelChunkBuild",
                }],
            /STROM: 96 frische Wald-Zellen plante nicht die Schlange des Walds, sondern `_forestCellDarts › _forestPlantChunk.*131\.2 ms, bis 41 in EINEM Takt/,
        ],
        [
            "die Strom-Phase sieht keinen frischen Wald",
            ["strom.wald.imJob=", 0],
            /LEER: die Strom-Phase sah keinen frischen Wald/,
        ],
        ["keine Ort-Phase", ["ort"], /LEER: keine Ort-Phase/],
        ["keine Ruhe", ["ruhe"], /LEER: keine Ruhe-Phase/],
        ["keine Bruch-Phase", ["bruch"], /LEER: keine Bruch-Phase/],
        ["Page-Error", (b) => b.pageErrors.push("TypeError: x"), /PAGE-ERROR: TypeError: x/],
        [
            "die Streu wartet nach geleerter Schlange des Walds",
            ["nachschub.warten=", ["-3,-5 wartet auf ihr Asset"]],
            /NACHSCHUB: 1 Streu-Regionen warten, obwohl die Schlange des Walds leer ist/,
        ],
        ["keine Nachschub-Probe", ["nachschub"], /LEER: keine Nachschub-Probe/],
        [
            "die Nah-Wiese wartet jenseits des Rings auf Boden, den niemand baut",
            ["fuehrung", { steht: false, takte: 400, grund: "Fege-Takt nahWiese wartet, nahStreu wartet" }],
            /FÜHRUNG: die Kamera bei \(700, -800\), 1044 m neben dem Spieler — die Welt steht nach 400 Takten nicht: Fege-Takt nahWiese wartet/,
        ],
        ["keine Führungs-Phase", ["fuehrung"], /LEER: keine Führungs-Phase/],
        ["das Dorf fliegt (die Basis)", ["dorf.placed"], /DORF: die Welt stand nach 41 Takten mit dem Dorf im Flug/],
        [
            "der Vorbacker am vollen Welt-March hält die Welt wach",
            ["vorbacker.steht=", "DIE WELT STEHT NICHT nach 121 Takten: Ruhe 0, zuletzt brach sie: Fege-Takt archCull wartet"],
            /VORBACKER HÄLT WACH: ein Haus mit Mesh wartet an der Reserve des Welt-March \(frei 128, Reserve 128\) auf Platz — DIE WELT STEHT NICHT nach 121 Takten: Ruhe 0, zuletzt brach sie: Fege-Takt archCull wartet/,
        ],
        [
            "der Platz-Takt weckt den Vorbacker nie",
            ["vorbacker", { gebacken: 0, takte: 600 }],
            /NIE GEWECKT: Platz über der Reserve \(frei 192, Reserve 128\) weckte den Vorbacker in 600 Takten nicht — er bäckt nie/,
        ],
        ["die Mutante „nie geweckt“ bäckt doch", ["vorbacker", { mutante: 1 }], /BLIND: unter der Mutante „nie geweckt“ \(der Platz-Takt schweigt\) bäckt der Vorbacker/],
        [
            "das schweigende Feld fällt, das Haus fragt nie nach Platz",
            ["vorbacker", { fragteSelbst: 0, fragtTakte: 120 }],
            /NIE GEFRAGT: das schweigende Feld eines Hauses mit Mesh fiel an der Reserve des Welt-March \(Reserve 128\), und das Haus fragte in 120 Takten nicht nach Platz/,
        ],
        ["kein Vorbacker wartet am vollen Welt-March", ["vorbacker", { fragten: 0 }], /LEER: kein Vorbacker wartet am vollen Welt-March \(1 Haus mit Mesh ohne Satz, 0 Fragen/],
        ["kein schweigendes Feld fällt am vollen Welt-March", ["vorbacker", { fiel: 0 }], /LEER: kein schweigendes Feld fiel am vollen Welt-March \(das Haus trug Mesh und Satz: 1, sein Feld fiel: 0/],
        ["keine Vorbacker-Phase", ["vorbacker"], /LEER: keine Vorbacker-Phase/],
        ["ein wartender Fege-Takt hält die Welt nicht wach", ["wach=", "steht nach 31 Takten"], /WACH: ein Fege-Takt mit Offenem hält die Welt nicht wach/],
        ["die Welt steht, während die Bake-Uhr abweist (die Basis)", ["schuld", { grund: "Welt-Regung", takte: 1, rest: 8 }], /BAKE-SCHULD: steht nach 1 Takten mit 8 offenen Fits \(40 abgewiesen, Welt-Regung\)/],
        [
            "die Welt steht mitten in der Runde der Stufen-Wahl",
            ["fix.1", { takte: 1, nach: { frames: 150, summe: 2048, takte: { archLod: { summe: 2048, mitArbeit: 8, wirkt: 4 } } } }],
            /FIXPUNKT: die Welt stand nach 1 Takten, danach ging archLod \(_tickArchitectureLOD\) ohne Eingabe noch 2048 Einheiten/,
        ],
        ["der Regler-Schritt wirkt nicht", (b) => b.fix.forEach((f) => (f.wirkte = 0)), /LEER: der Regler-Schritt wirkte nicht/],
        ["keine Fixpunkt-Phase", ["fix"], /LEER: keine Fixpunkt-Phase/],
        [
            "der Wuchs prüft in Ruhe je Frame die wartenden Chunks (die Basis)",
            ["simRuhe.sims.wuchs=", simPh(9, 3600).sims.wuchs],
            /RUHE-SIM: wuchs \(_tickFoliageGrowth\) arbeitet in Ruhe nach einer Tat — 32400 Einheiten in 3600 von 3600 Frames \(60 s; _x 9\)/,
        ],
        [
            "ein Takt, der in Ruhe einmal zählt (der Nachwuchs über die Wanduhr)",
            ["simRuhe.sims.nachwuchs", { summe: 1, mitArbeit: 1 }],
            /RUHE-SIM: nachwuchs \(_tickScatterRegrow\) arbeitet in Ruhe .* 1 Einheiten in 1 von 3600/,
        ],
        ["die Sim-Ruhe geht 20 s", ["simRuhe.spielS=", 20], /LEER: die Sim-Ruhe ging 20 s/],
        ["vor der Sim-Ruhe keine Ernte", ["simRuhe.vorher.ernte=", null], /LEER: vor der Sim-Ruhe fehlt die Tat/],
        ["keine Sim-Ruhe", ["simRuhe"], /LEER: keine Sim-Ruhe/],
        [
            "nach dem Saison-Wort malt die Jahres-Uhr weiter (die Basis)",
            ["simWecken.saison.nachher=", simPh(3, 60)],
            /WECKEN-SIM: nach dem Ereignis schläft saison nicht wieder — 180 Einheiten \(_x 3\)/,
        ],
        ["das Wort Regen weckt den Regen nicht", ["simWecken.regen.wach=", simPh(0, 5)], /STUMPF: das Wort Regen weckt regen/],
        ["kein Chunk wartet auf seinen Wuchs", ["simWecken.wuchs.offen=", 0], /LEER: keine Weck-Probe für wuchs/],
        ["die Ernte wächst nicht nach", ["simWecken.nachwuchs.nachgewachsen=", false], /NACHWUCHS: die Ernte wuchs/],
        [
            "der Blick des Spielers je Bild (die Basis)",
            ["simRuhe", { akt: 46802, aktJe: [["auraAt", 3600]] }],
            /RUHE-TAT: die Akte .* arbeiten in Ruhe nach einer Tat über ihre Zellen hinaus — 46802 Einheiten für 0 geschriebene \(auraAt 3600\)/,
        ],
        [
            "die Räumung wartet auf die Schwelle (die Basis)",
            ["simWecken.feld.wellen.1", { groesse: 1110, tote: 537 }],
            /FELD-TOTE: nach den Wellen trägt die Karte 0 von 540 · 537 von 1110/,
        ],
        [
            "die Räumung geht jede Zelle durch (die Basis)",
            ["simWecken.feld.welle", { akt: 1680, aktAlle: { "·lifeField": 1670 } }],
            /FELD-BESUCH: die Wellen kosteten 1680 Einheiten für 2160 geschriebene Zellen, die Räumung ging über die ganze Karte oder ihr Rad \(·lifeField 1670\)/,
        ],
        [
            "die Räumung geht jeden Eimer des Rads durch (bis w3u-nachfolge)",
            ["simWecken.feld.welle", { akt: 2211, aktAlle: { _feldTod: 2160, "·lifeField.tod": 51 } }],
            /FELD-BESUCH: die Wellen kosteten 2211 Einheiten für 2160 geschriebene Zellen, die Räumung ging über die ganze Karte oder ihr Rad \(·lifeField.tod 51\)/,
        ],
        ["die Tat legt je Zelle neu an (eb875cf4)", ["simWecken.feld.ueber=", 916], /HALDE: 916 Plätze über/],
        ["kein Brand fängt (die Basis: kein Takt im Stamm)", ["simWecken.brand.start=", false], /LEER: an der Mess-Wiese fing kein Brand/],
        ["der Brand ohne Takt", (b) => b.simWecken.brand.gang.fill(0), /STUMPF: der Brand brennt, die Sim-Linse sieht keinen Takt/],
        ["die Front erreicht keine Zelle", (b) => ["ankuenfte", "betten", "punkte", "zuendung"].forEach((k) => b.simWecken.brand[k].fill(0)), /LEER: im Brand erreichte die Front keine Zelle/],
        ["die Marke der Zündung ist blind", (b) => b.simWecken.brand.zuendung.fill(0), /STUMPF: die Front erreichte 3 Zellen, die Sim-Linse sieht keine Zündung/],
        // DER GANG: was der Takt außerhalb der Zündung tut, je Zelle des Felds
        ["der Brand fegt die Welt", ["simWecken.brand.gang.3=", 4000], /BRAND-GANG: Schritt 4 kostete 4000 Einheiten Gang bei 16 Zellen des Felds/],
        // DER FALL DER KACHELN (linse-brand-schritte 4): CI c8e95d38 und Radeon wortgleich — Schritt 4 168 Einheiten bei 9 Zellen,
        // davon 122 Kacheln über EINER Zelle: der Gang trägt 46 (≤ 144), die Kacheln ihr eigenes Soll
        ["der Fall der Wiese über einer Zelle in einem kleinen Feld (CI c8e95d38)", (b) => Object.assign(b.simWecken.brand, { zellen: [9, 9, 12, 9, 16, 12], gang: [27, 90, 46, 46, 113, 36] }), null],
        ["der Gang trägt die Kacheln ungetrennt (der Täter von c8e95d38)", (b) => Object.assign(b.simWecken.brand, { zellen: [9, 9, 12, 9, 16, 12], gang: [27, 90, 46, 168, 113, 36], kachel: [0, 0, 0, 0, 0, 0] }), /BRAND-GANG: Schritt 4 kostete 168 Einheiten Gang bei 9 Zellen des Felds \(Soll ≤ 16 je Zelle\)/],
        ["jede Kachel fällt zweimal",["simWecken.brand.kachel.3=", 244], /KACHEL-FALL: Schritt 4 ließ 244 Kacheln fallen — Soll ≤ 122 \(je Kachel im Rechteck der Asche eine\), 1 Neubau von 1024 m² .* seine Leser: _nahStreuKachelFaellt 98, _nahWieseKachelFaellt 24/],
        ["zwei Zellen fallen im selben Bild (der gebündelte Neubau)", (b) => Object.assign(b.simWecken.brand, { ringe: [0, 0, 0, 2, 0, 0], kachel: [0, 0, 0, 244, 0, 0], kachelSoll: [0, 0, 0, 244, 0, 0] }), /KACHEL-FALL: Schritt 4 ließ 244 Kacheln fallen — Soll ≤ 244 .*2 Neubauten/],
        ["der Neubau fällt über ±1 Zelle", ["simWecken.brand.ringM2.3=", 4096], /KACHEL-FALL: .*1 Neubau von 4096 m² \(Soll ≤ 1 je Bild, ≤ 1024 m²/],
        ["die Kacheln fallen ohne Asche", (b) => Object.assign(b.simWecken.brand, { ringe: [0, 0, 0, 0, 0, 0], kachelSoll: [0, 0, 0, 0, 0, 0], ringM2: [0, 0, 0, 0, 0, 0] }), /KACHEL-FALL: Schritt 4 ließ 122 Kacheln fallen — Soll ≤ 0/],
        ["die Kachel-Probe des Brands lief nicht", ["simWecken.brand.kachel"], /LEER: die Kachel-Probe des Brands/],
        ["der Gang misst das Bett jeder Zelle je Schritt neu (16 Zellen × fünf Punkte)",["simWecken.brand.gang.4=", 113 + 16 * 254], /BRAND-GANG: Schritt 5 kostete 4177 Einheiten Gang bei 16 Zellen/],
        // DIE ZÜNDUNG: ihr Soll kommt aus dem, was die Welt neu maß — eine Zündung, die ihr Bett zweimal liest, hebt es nicht
        ["die Zündung liest ihr Bett zweimal", ["simWecken.brand.zuendung.2=", 395 + 254], /BRAND-ZÜNDUNG: Schritt 3 kostete 649 Einheiten Zündung für 1 Ankünfte und 1 neu gemessene Betten \(5 Bett-Punkte/],
        // die Zündung marschiert für Höhe und Gefälle dreimal durch ihre Säule (der Stand von 8e2d76d1, GPU-Probe 44943679460 und
        // zwei Läufe an der GTX 1050: zwei Zündungen in einem Schritt mit 16 Zellen 1 099 Einheiten, davon 50 Gang)
        ["zwei Zündungen lesen ihre Säule je dreimal (8e2d76d1)", ["simWecken.brand.zuendung.3=", 1049], /BRAND-ZÜNDUNG: Schritt 4 kostete 1049 Einheiten Zündung für 2 Ankünfte und 2 neu gemessene Betten/],
        // drei Zündungen in EINEM Schritt sind kein Täter: die Radeon-Probe am Stempel w28-front-brand cc19e47a (1 206 Einheiten bei
        // 16 Zellen, 50 davon Gang) fiel am alten Soll (64 je brennender Zelle) — die Arbeit wächst mit den Zündungen, nicht den Zellen
        ["drei Zündungen in einem Schritt (die Radeon-Probe cc19e47a)", (b) => Object.entries({ zuendung: 1156, ankuenfte: 3, betten: 3, punkte: 15, lesungen: 15 }).forEach(([k, w]) => (b.simWecken.brand[k][3] = w)), null],
        ["eine Bett-Maske entschuldigt die Welt nicht", (b) => Object.entries({ zuendung: 9000, ankuenfte: 1, betten: 1, punkte: 69, kahl: 19, masken: 1, lesungen: 69 }).forEach(([k, w]) => (b.simWecken.brand[k][3] = w)), /BRAND-ZÜNDUNG: Schritt 4 kostete 9000 Einheiten Zündung .*69 Bett-Punkte, davon bis 19 kahl, 1 Masken/],
        ["der Brand erlischt im Regen nicht", ["simWecken.brand.brennt=", 7], /BRAND-ERLISCHT: im Regen brennen noch 7/],
        // die Front auf dem gesetzten Bett (linse-brand-schritte 2): das Vorrücken des Kopfs kriecht, das Gitter verliert das
        // Gesetz, das grobe Gitter hält (die Linse blind), das Bett ist nicht gesetzt, die drei Starts würfeln (lokal derselbe Herd
        // zur Uhr 40 000: 0,31 · 1,03 · 0,458 m/s), die Uhr ging rückwärts; der Median am Herd des Spiels ist ein Lesewert
        ["die Front kriecht mit dem Wind", ["simWecken.brand.wahr.achse", { vor: 0.3, R: 0.31 }], /FRONT-MIT: achse \(Kopf 0.8° zum Gitter\): Vorrücken 0.3 m\/s bei R 0.31 m\/s \(Soll 0,5–2\)/],
        ["der Median der Köpfe am Herd des Spiels ist ein Lesewert", ["simWecken.brand.mit=", 0.3], null],
        ["das Gitter verliert das Gesetz (32–48 % von R)", ["simWecken.brand.wahr.schraeg.vor=", 0.27], /FRONT-TREUE: schraeg \(Kopf 23.5° zum Gitter\): Vorrücken 0.27 m\/s bei R 0.63 m\/s — 0.429 von R/],
        ["das Gitter nur der Diagonalen verliert an der Achse 11,5 % (lokal 0,928 bei R 1,048)", ["simWecken.brand.wahr.grob", { vor: 0.928, R: 1.048 }], null],
        ["das grobe Gitter hält die Treue",["simWecken.brand.wahr.grob.vor=", 0.6], /BLIND: das grobe Gitter \(nur Diagonalen\)/],
        ["der Herd verzehrt das Bett der Welt", ["simWecken.brand.wahr.achse.bett", { abweichend: 17, erste: "Last 0.061" }], /FENSTER-BETT: achse zündete auf gras .* 17 von 51 Zellen verzehrten ein anderes Bett \(zuerst Last 0.061\)/],
        ["der Herd zündet im nassen Bett", ["simWecken.brand.wahr.diagonal.bett.naesse=", 0.4], /FENSTER-BETT: diagonal zündete auf gras \(Last 0.092, Boden 0.1, Nässe 0.4\)/],
        ["drei Starts an derselben Uhr würfeln", ["simWecken.brand.wahr.wieder", { mit: 1.03, vor: 0.95 }], /FENSTER-BETT: drei Starts an derselben Uhr des Winds tragen mit 0.58 · 1.03 · 0.58, vor 0.6 · 0.95 · 0.6/],
        ["ein Herd stellt die Uhr zurück", ["simWecken.brand.uhrRueck=", [[40300, 40000]]], /FENSTER-BETT: die Welt-Uhr stand vor dem Herd schon später \(40300 s statt 40000 s\)/],
        ["das Bett des Spiels ist das des Herds", ["simWecken.brand.bett.abweichend=", 0], /BLIND: der Herd des Spiels/],
        ["die Herde auf dem gesetzten Bett liefen nicht", ["simWecken.brand.wahr"], /LEER: die Herde auf dem gesetzten Bett/],
        // das Fenster hängt am Läufer (bis linse-brand-schritte, lokal am Radeon-Laptop): der zweite Herd begann zu einer späteren
        // Welt-Uhr, 0,35 m/s mit 8 Köpfen ↔ 0,29 mit 9; am langsamsten Läufer gingen dieselben Bilder weniger Schritte
        ["der Herd beginnt zur Uhr des Läufers", ["simWecken.brand.fenster", { spiel: { zellen: 42, koepfe: 8, mit: 0.35, alle: 0.978, schritte: 300, bilder: 300 }, langsam: { zellen: 47, koepfe: 9, mit: 0.29, alle: 0.982, schritte: 300, bilder: 300 } }], /FENSTER-UHR: derselbe Herd trägt mit dem Budget des Spiels 42 Zellen, 8 Köpfe \(Median 0.35 m\/s\), alle 0.978 m\/s in 300 Schritten und 300 Bildern, am langsamsten Läufer 47 Zellen, 9 Köpfe \(Median 0.29 m\/s\)/],
        ["das Fenster zählt Bilder, nie Schritte des Brands", ["simWecken.brand.fenster.langsam", { schritte: 212, bilder: 300 }], /FENSTER-UHR: .* am langsamsten Läufer 44 Zellen, 9 Köpfe \(Median 0.58 m\/s\), alle 0.63 m\/s in 212 Schritten und 300 Bildern/],
        ["der Median am langsamsten Läufer liegt 0,03 m/s daneben", ["simWecken.brand.fenster.langsam.mit=", 0.335], /FENSTER-UHR: .* \(Median 0.335 m\/s\)/],
        ["das Fenster erreicht seine Schritte nicht", ["simWecken.brand.deckel=", 15000], /FENSTER-DECKEL: das Fenster mit dem Wind erreichte nach 15000 Bildern/],
        ["die Probe des Fensters lief nicht", ["simWecken.brand.fenster"], /LEER: die Probe des Fensters/],
        ["die Front läuft gegen den Wind",["simWecken.brand.gegen=", 0.3], /FRONT-GEGEN: .* 0.3 m\/s/],
        ["ohne Wind läuft die Front", ["simWecken.brand.ohneWind=", 0.9], /BRAND-BLIND: .* 0.9 m\/s/],
        ["der Brand hinterlässt keine Asche", ["simWecken.brand.lebNach=", 0.62], /BRAND-ASCHE: 4 Aschen, lebendig am Herd 0.62 → 0.62/],
        ["das Overlay fällt, die Asche nicht (der Fraß am Herd ist keine Asche)", ["simWecken.brand", { ovNach: -0.3 }], /BRAND-ASCHE: .*Leben-Overlay 0 → -0.3, die Asche senkt 0,/],
        // die Gegen-Probe (Vorprüfung 00520c2e, CI): das Overlay stieg um 0,275, die Asche senkte 0,3 — grün
        ["das Overlay steigt, während die Asche senkt (CI 00520c2e)", ["simWecken.brand", { lebVor: 0.75, lebNach: 0.725, ovVor: -0.089, ovNach: 0.186 }], null],
        ["der Brand leuchtet nicht", ["simWecken.brand.licht=", false], /BRAND-LESER: glut am Herd \+1, Leuchtquelle fehlt/],
        ["der Brand schläft nicht", ["simWecken.brand.nachher=", simPh(2, 60, "brand")], /BRAND-RUHE: .* 120 Einheiten/],
        // DIE DRUCKWELLE (same.physik.reaktion#2): die Probe trägt, was sie misst — sonst LEER
        ["kein Funke fängt neben der Ladung", ["simWecken.druck.start=", false], /LEER: an der Mess-Wiese fing der Funke neben der Ladung nicht/],
        ["die Front gibt der Ladung keine Frist (sie steht in einer anderen Zelle)", ["simWecken.druck.frist=", null], /LEER: die Front des Funkens gab der Ladung keine Frist/],
        ["die Frist der Ladung fällt ohne Welle", (b) => b.simWecken.druck.ereignisse.shift(), /LEER: die Frist der Ladung fiel, keine Welle/],
        ["die Marke druck ist blind", (b) => (b.simWecken.druck.ereignisse.forEach((e) => (e.einheiten = 0)), (b.simWecken.druck.einheiten = 0)), /STUMPF: die Ladung setzte um, die Sim-Linse sieht keinen Takt der Welle/],
        // je Ereignis an seinem Soll
        ["der Umsatz der Ladung fegt die Welt", ["simWecken.druck.ereignisse.1", { einheiten: 900 }], /DRUCK-SOLL: der Umsatz der Ladung kostete 900 Einheiten \(Soll ≤ 50: 50\)/],
        // der Schreiber ruft je Eintrag des Netzes im Radius ein Glied (4 136 Einträge, davon 71 Bauten): die Natur kostet nichts
        ["der Schreiber fragt die Welt je Eintrag des Netzes", ["simWecken.druck.ereignisse.0", { einheiten: 2245 + 4136 }], /DRUCK-SOLL: der Schreiber der Welle kostete 6381 Einheiten \(Soll ≤ 2920: 80 \+ 40 je Bau im Radius \(71\)\)/],
        ["der Schreiber an einem Ort mit 200 Bauten: sein Soll wächst mit dem Blick", ["simWecken.druck.ereignisse.0", { einheiten: 60 + 31 * 200, blick: 200 }], null],
        ["ein gestoßener Körper fegt die Welt", ["simWecken.druck.ereignisse.2", { einheiten: 300 }], /DRUCK-SOLL: die Frist eines Gestoßenen \(frei\) in 6 m kostete 300 Einheiten \(Soll ≤ 16: 16\)/],
        ["ein stehendes Werk kostet wie ein Bruch", ["simWecken.druck.ereignisse.9", { einheiten: 1041 }], /DRUCK-SOLL: die Frist eines stehenden Werks in 36.003 m kostete 1041 Einheiten \(Soll ≤ 8: 4 je Teil \(2\)\)/],
        ["ein Bruch fragt die Welt", ["simWecken.druck.ereignisse.3", { einheiten: 6000 }], /DRUCK-SOLL: die Frist eines brechenden Werks in 8.013 m kostete 6000 Einheiten \(Soll ≤ 4058: 4 je Teil \(2\) \+ 370 \+ 230 je Scherbe \(16\)\)/],
        ["zweiunddreißig Scherben tragen ihr eigenes Soll (das Doppel-Fenster am Rand)", ["simWecken.druck.ereignisse.4", { einheiten: 7700 }], null],
        // im ersten Lauf (GTX 1050, 52 brechende Werke) schrieb jedes Werk seinen Satz: 52 Sätze statt einem
        ["das Ende schreibt je Werk einen Satz", ["simWecken.druck.ereignisse.11", { einheiten: 12 }], /DRUCK-SOLL: das Ende der Welle kostete 12 Einheiten \(Soll ≤ 5: 5\)/],
        ["der Takt arbeitet außerhalb seiner Ereignisse", ["simWecken.druck.rest=", 40], /DRUCK-TAKT: der Takt der Welle arbeitete 40 Einheiten außerhalb jedes Ereignisses/],
        // DAS ERBE DES GRUNDS: die Mutante des Laufs (der Rest räumt den Grund seines Werks ein zweites Mal — in Einheiten 3 183 →
        // 3 254, unter dem Soll; ihr Maß ist die Räumung selbst) und der Stand vor dem freien Körper ohne Grundriss (der Rest und
        // jede Scherbe räumten bei ihrer Geburt)
        ["der Rest räumt den Grund seines Werks ein zweites Mal", ["simWecken.druck.ereignisse.3", { einheiten: 3254, raeumt: 1 }], /DRUCK-ERBE: die Frist eines brechenden Werks in 8.013 m räumte die Natur seines Grunds \(`_naturRaeumen` 1× in der Welle\)/],
        ["jede Scherbe räumt bei ihrer Geburt die Natur", (b) => [3, 7, 8].forEach((k) => (b.simWecken.druck.ereignisse[k].raeumt = 5)), /DRUCK-ERBE: die Frist eines brechenden Werks in 8.013 m .*`_naturRaeumen` 15× in der Welle/],
        ["die Mutante des Laufs bleibt ungesehen", ["simWecken.druck.mutante", { raeumt: 0 }], /BLIND: die Mutante der Welle .* blieb ungesehen — `_naturRaeumen` unter der Marke `druck`: 0/],
        ["die Mutante des Bilds bleibt an der Scherbe ungesehen", ["simWecken.druck.mutante.bild", { geburt: [0, 0] }], /BLIND: die Mutante des Bilds \(der Bau des Bilds zeigt die Pose des Gesetzes nicht\) blieb ungesehen — schiefe Bilder bei der Geburt der Scherbe 0, nach dem Neubau 16, an der Kiste des Stands 1/],
        ["die Mutante des Bilds bleibt an der Kiste ungesehen", ["simWecken.druck.mutante.bild", { stand: [0, 0] }], /BLIND: die Mutante des Bilds .* an der Kiste des Stands 0/],
        ["die Mutante maß das Bild nicht", ["simWecken.druck.mutante", { bild: null }], /BLIND: die Mutante des Bilds .* blieb ungesehen — kein Maß/],
        ["die Mutante lief nicht", ["simWecken.druck.mutante"],/BLIND: die Mutante der Welle .*: kein Lauf/],
        // das Gesetz am Bild der Welt
        ["die Scheibe jenseits der Grenze bricht", ["simWecken.druck.scheiben.4", { gebrochen: true }], /DRUCK-BRUCH: die Scheibe in 36.097 m brach — die Grenze des Gesetzes .* liegt bei 29.982 m/],
        ["die Scheibe diesseits der Grenze steht", ["simWecken.druck.scheiben.3", { gebrochen: false }], /DRUCK-BRUCH: die Scheibe in 24.064 m steht — die Grenze des Gesetzes/],
        ["keine Scheibe jenseits der Grenze", (b) => (b.simWecken.druck.scheiben.length = 4), /LEER: die Probe trägt keine Scheibe diesseits UND jenseits der Bruch-Grenze des Gesetzes \(29.982 m/],
        // DAS BILD DES BRUCHS: der Stand bis druckwelle-bild an der Probe gemessen — jede Scheibe fiel in vier gleiche Stücke
        // (Kanten 250 mm), die in 8 m wie die an ihrer Grenze; dazu der Leser, der nur die Zahl des Gesetzes nimmt und gleich
        // weit schneidet (4 × 4 Stücke zu 125 mm)
        ["jede Scheibe fällt in vier gleiche Stücke (der Stand vor dem Bruch-Gesetz)", ["simWecken.druck.scheiben.0", { scherben: 4, kante: [0.25, 0.25] }], /DRUCK-BRUCH-BILD: das Fenster in 8.031 m \(last 5.557\) fiel in 4 Scherben — sein Bruch-Gesetz verlangt 16/],
        ["der Leser schneidet gleich weit", ["simWecken.druck.scheiben.0", { kante: [0.125, 0.125] }], /DRUCK-BRUCH-BILD: die 16 Scherben des Fensters in 8.031 m tragen Kanten von 0.125 bis 0.125 m — die Schnitte seines Gesetzes liegen, wo die Energie liegt: 0.066 bis 0.184 m/],
        ["das Doppel-Fenster bricht nur eine seiner Scheiben fein", ["simWecken.druck.scheiben.1", { scherben: 20 }], /DRUCK-BRUCH-BILD: das Fenster in 12.037 m \(last 3.234\) fiel in 20 Scherben — sein Bruch-Gesetz verlangt 32/],
        ["die Scherben einer Scheibe tragen keine Kante", ["simWecken.druck.scheiben.3", { kante: undefined }], /DRUCK-BRUCH-BILD: die 6 Scherben des Fensters in 24.064 m tragen Kanten von \? m/],
        ["keine Scheibe der Probe bricht feiner als ihr Kreuz", (b) => b.simWecken.druck.scheiben.forEach((s) => s.gebrochen && Object.assign(s, { scherben: s.kreuz, soll: s.kreuz, kante: [0.25, 0.25], kanteSoll: [0.25, 0.25] })), /LEER: keine Scheibe der Probe bricht feiner als ihr Kreuz \(Scherben je Fenster nach dem Gesetz: 4 · 8 · 4 · 4\)/],
        ["das Bild der Scherbe steht bei der Geburt in der Ruhe-Lage ihres Plans (der Stand vor druckwelle-bild)", ["simWecken.druck.bildLage.geburt", { schief: 70, grad: 92.148 }], /DRUCK-BILD-LAGE: bei der Geburt einer Scherbe steht das Bild 92.148° und 0 mm neben der Lage, die der Löser hält \(70 von 70 Bildern mehr als 1° daneben/],
        ["der Neubau des Bilds im Schlaf verliert die Lage", ["simWecken.druck.bildLage.neubau", { schief: 16, grad: 172.125 }], /DRUCK-BILD-LAGE: nach dem Neubau des Bilds einer schlafenden Scherbe .* steht das Bild 172.125° und 0 mm neben .* \(16 von 16 Bildern/],
        ["die Kiste des Stands steht in der Ruhe-Lage ihres Plans", ["simWecken.druck.bildLage.stand", { schief: 1, grad: 57.296 }], /DRUCK-BILD-LAGE: bei der Geburt einer Kiste, wie der Stand sie legt .* steht das Bild 57.296° und 0 mm neben .* \(1 von 1 Bildern/],
        ["das Bild liegt neben dem Körper", ["simWecken.druck.bildLage.geburt", { mm: 12 }], /DRUCK-BILD-LAGE: bei der Geburt einer Scherbe steht das Bild 0° und 12 mm neben/],
        ["die Probe misst die Lage ohne Zahl", ["simWecken.druck.bildLage.geburt", { grad: null }], /DRUCK-BILD-LAGE: bei der Geburt einer Scherbe steht das Bild null° und 0 mm neben/],
        ["die Probe misst kein Bild", ["simWecken.druck.bildLage"], /LEER: die Probe maß die Lage im Bild nicht \(bei der Geburt einer Scherbe: kein Bild\)/],
        ["kein Bild wird im Schlaf neu gebaut", ["simWecken.druck.bildLage.neubau", { n: 0 }], /LEER: die Probe maß die Lage im Bild nicht \(nach dem Neubau des Bilds einer schlafenden Scherbe .*: kein Bild\)/],
        ["die Kiste des Stands trägt kein Bild", ["simWecken.druck.bildLage.stand"], /LEER: die Probe maß die Lage im Bild nicht \(bei der Geburt einer Kiste, wie der Stand sie legt .*: kein Bild\)/],
        // DER STAUB DER WELLE (druckwelle-bild (b)): das Ereignis an seinem Soll, die Saat am Gesetz, das Bild an seiner Masse
        ["der Staub fragt die Welt je Texel der Asche-Karte", ["simWecken.druck.ereignisse.12", { einheiten: 4100 }], /DRUCK-SOLL: der Staub der Welle kostete 4100 Einheiten \(Soll ≤ 331: 40 \+ 3 je Zelle im Radius \(64\) \+ 11 je Ballen \(9\)\)/],
        ["der Ballen fragt seine Höhe am Säulen-Marsch des Gesetzes statt am gezeichneten Boden", ["simWecken.druck.ereignisse.12", { einheiten: 16902, zellen: 81, ballen: 384 }], /DRUCK-SOLL: der Staub der Welle kostete 16902 Einheiten \(Soll ≤ 4507: 40 \+ 3 je Zelle im Radius \(81\) \+ 11 je Ballen \(384\)\)/],
        ["der Staub einer großen Narbe trägt sein eigenes Soll", ["simWecken.druck.ereignisse.12", { einheiten: 4058, zellen: 81, ballen: 384 }], null],
        ["die Welle ruft ihren Staub nicht", (b) => b.simWecken.druck.ereignisse.pop(), /LEER: die Welle der Probe rief ihren Staub nicht \(`_druckWelle` → `_druckStaub`\)/],
        ["die Probe misst den Staub nicht", ["simWecken.druck.staub=", null], /LEER: die Probe maß den Staub der Welle nicht/],
        ["die gestellte Narbe liegt außerhalb des Radius", ["simWecken.druck.staub", { sollG: 0, narbeM2: 0 }], /LEER: die Probe maß den Staub der Welle nicht .*kein Soll aus dem Gesetz/],
        ["die Welle hebt keinen Staub", ["simWecken.druck.staub", { ballen: 0, masseG: 0 }], /DRUCK-STAUB: die Welle hob keinen Staub aus der Narbe — das Gesetz hebt 1200 g aus 2300 m² Asche im Radius 43.173 m .*säte 0 Ballen/],
        // der Stand mit dem Deckel der nächsten Ballen: von 726 Punkten der halben Scheibe blieben die 384 nächsten, die Ferne fehlte
        ["über dem Deckel fehlt die Ferne (die nächsten 384 von 726)", ["simWecken.druck.staub", { masseG: 720, grob: 0 }], /DRUCK-STAUB-MASSE: die Welle säte 720 g Staub in 384 Ballen \(0 davon gröbere Flecken\) — das Gesetz hebt 1200 g .*±5 %/],
        ["die Saat trägt keine Masse-Zahl", ["simWecken.druck.staub", { masseG: NaN }], /DRUCK-STAUB: die Welle hob keinen Staub/],
        ["Staub steht, wo nichts brannte", ["simWecken.druck.staub", { aussen: 180 }], /DRUCK-STAUB-RAND: 180 Ballen stehen, wo nichts brannte .*, 0 jenseits des Radius 43.173 m/],
        ["Staub steht jenseits des Radius, in dem der Überdruck die Asche löst", ["simWecken.druck.staub", { jenseits: 12 }], /DRUCK-STAUB-RAND: 0 Ballen stehen, wo nichts brannte .*, 12 jenseits des Radius/],
        ["die Saat sprengt den Deckel", ["simWecken.druck.staub", { ballen: 726 }], /DRUCK-STAUB-DECKEL: die Welle säte 726 Ballen \(Deckel 384/],
        ["kein Bild im Takt der Welt", ["simWecken.druck.staub", { bilder: undefined }], /LEER: die Probe maß das Bild des Staubs nicht/],
        ["der Satz zeichnet keinen Ballen", ["simWecken.druck.staub", { satzMax: 0, ohneSatz: 700 }], /DRUCK-STAUB-BILD: der Satz des Staubs trägt seine Ballen nicht — in 700 von 700 Bildern/],
        ["die Deckung des Ballens hängt nicht an seiner Masse", ["simWecken.druck.staub", { satzMaxG: 4300, nebenG: 3150 }], /DRUCK-STAUB-BILD: der gezeichnete Satz trägt zum Höchststand 4300 g Staub \(gesät 1190 g, Soll 85–100 %\) und liegt bis 3150 g neben/],
        ["das Bild trägt zum Höchststand die Hälfte der Saat", ["simWecken.druck.staub", { satzMaxG: 600 }], /DRUCK-STAUB-BILD: der gezeichnete Satz trägt zum Höchststand 600 g Staub/],
        ["der Puffer des Satzes trägt keine Zahl", ["simWecken.druck.staub", { nebenG: null }], /DRUCK-STAUB-BILD: der gezeichnete Satz .* liegt bis null g neben/],
        ["der Staub wächst im Stehen", ["simWecken.druck.staub", { steigt: 40 }], /DRUCK-STAUB-BILD: nach der letzten Geburt wuchs der Staub in der Luft in 40 Bildern/],
        ["der Staub steht ewig", ["simWecken.druck.staub", { endeS: null }], /DRUCK-STAUB-ENDE: der Staub steht noch — das Sink-Tempo seines Korns leert die höchste Wolke in 13.9 s/],
        ["der Staub steht länger, als sein Korn sinkt", ["simWecken.druck.staub", { endeS: 25 }], /DRUCK-STAUB-ENDE: der Staub stand 25 s/],
        ["nach dem letzten Ballen arbeitet das Bild", ["simWecken.druck.staub", { danach: { satz: 3, uhr: 812.4 } }], /DRUCK-STAUB-RUHE: nach dem letzten Ballen ruht das Bild des Staubs nicht — im Satz 3 Ballen, seine Uhr 812.4/],
        ["die Mutante des Staubs bleibt ungesehen", ["simWecken.druck.mutante.staub", { aussen: 0 }], /BLIND: die Mutante des Staubs \(die Narbe gilt überall als Asche\) blieb ungesehen — Ballen westlich der gestellten Narbe 0, gesät 2400 g gegen 1200 g/],
        ["die Mutante maß den Staub nicht", ["simWecken.druck.mutante", { staub: null }], /BLIND: die Mutante des Staubs .* blieb ungesehen — kein Maß/],
        ["der Zähler der Welle rechnet an der Welt vorbei", ["simWecken.druck.zaehler=", 20],/DRUCK-ZAHL: die Welle zählte 20 Scherben, in der Welt liegen 70/],
        ["die Welle zählt ihre Scherben nicht", ["simWecken.druck.zaehler=", null], /DRUCK-ZAHL: die Welle zählte null Scherben, in der Welt liegen 70/],
        // der Vorrat: ohne ihn fielen beide Scheiben der Hand-Welle in 4 × 4
        ["der Vorrat hält die Welle nicht", ["simWecken.druck.vorrat", { scherben: [16, 16] }], /DRUCK-VORRAT: unter einer Welle, deren Vorrat bis auf 5 verbraucht ist, fielen zwei Scheiben in 16 und 16 Scherben/],
        ["der Vorrat nimmt der Platte ihr Kreuz", ["simWecken.druck.vorrat", { scherben: [9, 0] }], /DRUCK-VORRAT: .* fielen zwei Scheiben in 9 und 0 Scherben/],
        ["die Probe misst den Vorrat nicht", ["simWecken.druck.vorrat"], /LEER: die Probe maß den Vorrat der Welle nicht/],
        ["die Kiste trägt den halben Stoß", ["simWecken.druck.kiste", { dv: 0.771 }], /DRUCK-STOSS: die Kiste in 6 m trägt 0.771 m\/s \(das Gesetz: Impuls × Schattenfläche ÷ Masse = 1.542 m\/s/],
        ["der Löser nimmt den Stoß der Kiste nicht", ["simWecken.druck.kiste", { wegM: 0 }], /DRUCK-STOSS: die Kiste in 6 m trägt 1.542 m\/s und liegt danach 0 m weiter — der Löser nahm den Stoß nicht/],
        ["die Probe ohne Kiste", ["simWecken.druck.kiste"], /LEER: die Probe trägt keine freie Kiste im Radius der Welle/],
        ["der Spieler trägt keinen Stoß", ["simWecken.druck.spieler", { dv: 0 }], /DRUCK-LEIB: der Spieler in 16 m trägt keinen Stoß der Welle/],
        ["das Ohr hört die Welle nicht", ["simWecken.druck.ohr"], /DRUCK-OHR: das Ohr hörte die Welle nicht/],
        // ein Fass vor 78 Probe-Fenstern (GTX 1050, 52 brechende Werke unter dem Bild-Budget von 4 ms): der letzte Bruch 2,628 s
        // hinter seiner Ankunft
        ["das Bild-Budget hält den letzten Bruch 2,6 s zurück", ["simWecken.druck.verzug=", 2.628], /DRUCK-VERZUG: die letzte Frist fiel 2.628 s nach ihrer Ankunft \(Soll ≤ 0.35 s\)/],
        ["kein Verzug gemessen", ["simWecken.druck.verzug=", null], /DRUCK-VERZUG: die letzte Frist fiel null s/],
        // der erste Lauf an 52 Werken: 53 von 208 Scherben lagen nach der Welle wach (sie hielten einander, `_freiVier`)
        ["die Scherben schlafen nicht ein", ["simWecken.druck", { wach: 5, schlafS: null }], /DRUCK-SCHLAF: die letzte der 70 Scherben schlief nie \(5 liegen nach 10 s wach\) \(Soll ≤ 3 s\)/],
        ["die letzte Scherbe schläft nach 6 s", ["simWecken.druck.schlafS=", 6], /DRUCK-SCHLAF: die letzte der 70 Scherben schlief nach 6 s \(Soll ≤ 3 s\)/],
        ["die Welle der Probe bricht keine Scheibe", ["simWecken.druck.scherben=", 0], /LEER: die Welle der Probe brach keine Scheibe/],
        ["die Welle schläft nicht", ["simWecken.druck.nachher=", simPh(2, 60, "druck")], /DRUCK-RUHE: nach der Welle arbeitet ihr Takt — 120 Einheiten/],
        [
            "der Automat geht am Fixpunkt 4 Takte (die Basis)",
            ["simWecken.wasser", { takte: [1, 4], gehalten: [0, 9] }],
            /FIXPUNKT-WASSER: am Fluss \(-396,-878\), Wecken 2 ging der Automat 4 Takte, 9 Chunks blieben ohne Bewegung wach/,
        ],
        ["am Fluss kein Chunk", ["simWecken.wasser.chunks=", 0], /LEER: am Fluss weckt die Werk-Setzung keinen Chunk/],
        ["das Wasser bewegt sich", ["simWecken.wasser.bewegt=", [0, 3.2]], /LEER: am Fluss .* bewegte der Automat 3.2/],
        [
            "ein Sprung des Auges (40 m, ohne Takt) lässt die Welt stehen (die Basis)",
            ["fixWach=", "Sprung"],
            /FIXPUNKT: die Welt hieß stehend — Sprung/,
        ],
        ["die Sonde ohne Bestand", ["sonde.vor=", "Rinde baum_tanne"], /SONDE: .* trifft Rinde/],
        // main a7a9d7bf: der Pegel steigt nach der Geburt in Stufen von 1 cm
        ["Pegel-Stufen", ["netz", { wechsel: 37, wo: "Chunk -11,-22, Ecke (-462.5, -907.4)" }], /WASSERNETZ OHNE FIXPUNKT: 37 .* Chunk -11,-22, Ecke/],
        ["Pendel ungesehen", ["netz.mutante=", 0], /BLIND: der Pendel/],
        ["keine Netz-Wache", ["netz"], /LEER: keine Netz-Wache/],
    ];
    taeterFaelle(faelle, urteil, { fehler, gruen });
    selbsttestEnde(fehler);
}

// (K4) DIE TAT BLEIBT (feld.K4, `--tat`): an der Mess-Wiese fällt der Spieler mit dem echten Verb (tryMouseBreak) zehn Bäume
// und pflückt dreißig Pflanzen der Nah-Streu; gezählt wird, was die Welt zeichnet (Bäume der Lichtung, Pflanzen und Stümpfe in
// den Blöcken der Nah-Streu, auraAt − frozen an den Stämmen) nach einer Spielstunde, nach Save → Reload → einer Stunde und nach
// 36 Stunden mehr. Urteil: nach der Stunde ≤ 30 % der Bäume, keine Pflanze, je Baum ein Stumpf, das Feld ≥ 0,05 unter frozen.
function tatUrteil(T) {
    const h = T?.stunde;
    if (!h) return ["LEER: keine Messung nach der Stunde"];
    return [
        T.gefaellt >= 8 && T.gepflueckt >= 25 ? "" : `LEER: ${T.gefaellt} Bäume, ${T.gepflueckt} Pflanzen`,
        h.baeume <= 0.3 * T.baeumeVorher ? "" : `BAUM: ${h.baeume} von ${T.baeumeVorher} stehen`,
        h.pflanzen === 0 ? "" : `ERNTE: ${h.pflanzen} Pflanzen zurück`,
        h.stuempfe >= T.gefaellt ? "" : `STUMPF: ${h.stuempfe} für ${T.gefaellt} Bäume`,
        h.narbe <= -0.05 ? "" : `NARBE: ${h.narbe}`,
    ].filter(Boolean);
}

// DIE SEITE DER TAT UND DES BRANDS (`window.__seite()`, wenn die Welt mit der Foundry steht): der Takt des Spiels zu 1/60 s ohne
// Regler, der Boden, das Stehen an einem Ort und je Pflanze der Nah-Streu, die die Ernte nimmt, `f({ senke, key, id }, it)`
async function seite() {
    await __weltDa((x) => x.state.playerMesh && x._foundry?.ready);
    const pm = st.playerMesh.position;
    let t = performance.now();
    const takt = () => r._gameLoopTick((t += 1000 / 60));
    st.perfRegulator = false;
    const y = (x, z) => r._voxelSurfaceY(x, z);
    const stehen = (p) => (pm.set(p.x, y(p.x, p.z) + 1.8, p.z), __weltStehtNach(takt));
    // das Wort des Spielers über den EINEN Schreiber ohne Übergang (die Bühne)
    const wort = (w) => ((st.weatherEffectTime = 0), r._setWeather(w, "human"), (st.weatherEffectTime = -1e9), window.__uebergangFaellt(r));
    // die Punkte der Flüsse (ohne See) binnen R um M, der nächste zuerst
    const fluss = (M, R = Infinity, d = (q) => Math.hypot(q.x - M.x, q.z - M.z)) =>
        (st.hydrosphere?.rivers || []).flatMap((rv) => rv.points.filter((q) => !q.inLake && d(q) < R)).sort((p, q) => d(p) - d(q));
    const pflanzen = (f, ns = st.nahStreu) => {
        for (const [senke, a] of ns ? ns.senken : [])
            for (const [key, b] of a.ernte && a.preset !== "stumpf" ? a.bloecke : [])
                for (const it of (ns.kacheln.get(key) || { items: [] }).items) if (b.ids.includes(it.id)) f({ senke, key, id: it.id }, it);
    };
    return { pm, takt, y, stehen, pflanzen, wort, fluss };
}

async function tatSeite(MESS, vorher) {
    const { pm, takt, y, stehen, pflanzen } = await window.__seite();
    const [cam, P] = [st.camera, Math.hypot];
    const baum = (a) => /baum/.test(a._lodSpecies || a.type) && r._istNatur(a);
    const ab = (a, p) => P(a.position.x - p.x, a.position.z - p.z);
    const zeichnet = (wahl, s = new Set()) => {
        for (const a of st.nahStreu.senken.values()) for (const [k, b] of a.bloecke) for (const id of b.ids) if (wahl(a, k + "#" + id)) s.add(k + "#" + id);
        return s.size;
    };
    // (K5) der Nachwuchs, s. u.: die Pflanzen der Nah-Streu im Ring (`ernten`: jede gepflückt) mit Feuchte und Licht ihres Orts
    const F0 = r._feuchteAt.bind(r);
    const ring = (ernten, ps = []) => (
        pflanzen((q, { x, z }) => (!ernten || r._harvestScatterPick(q)) && ps.push({ key: q.key, id: q.id, w: [q.key, F0(x, z), r._bodenLichtFeld(x, z, x, z)(x, z), 0] })), ps
    ); // prettier-ignore
    const jahr = async (U, mutante) => {
        await stehen(U);
        const h0 = r._weltStunde();
        if (mutante) r._feuchteAt = () => 0.5;
        const ps = ring(true);
        delete r._feuchteAt;
        const schritt = (dh) => {
            r._weltUhrNimm(st.spielZeit + ((dh) * r._kalender().tagS) / 24);
            takt();
            for (const p of ps) p.w[3] ||= !r._geerntetIn(p.key).has(p.id) && r._weltStunde() - h0;
        };
        while (ps.some((p) => !p.w[3]) && r._weltStunde() - h0 < 48) schritt(0.05);
        while (r._weltStunde() - h0 < 8760) schritt(11);
        await stehen(U);
        return { jahr: r._weltStunde() - h0, da: zeichnet((a, k) => ps.some((p) => p.key + "#" + p.id === k)), p: ps.map((p) => p.w) };
    };
    if (vorher?.ufer) {
        r._setWeather("sunny", "human"), r.setSeason("sommer");
        for (let d = 20, n = 0; d <= 900 && n < 8; d += 10)
            for (let k = 0; k < 36; k++) {
                const U = { x: MESS.x + d * Math.cos(k * 0.1745), z: MESS.z + d * Math.sin(k * 0.1745) };
                if (Math.abs(F0(U.x, U.z) - 0.5) > 0.1 || !r._landAt(U.x, U.z, 1) || r._bodenLichtFeld(U.x, U.z, U.x, U.z)(U.x, U.z) < 0.6) continue;
                n++, await stehen(U);
                const o = ring(false).filter((q) => q.w[2] >= 0.995);
                if (o.filter((q) => q.w[1] >= 0.6).length >= 6 && o.filter((q) => q.w[1] <= 0.2).length >= 6)
                    return { ufer: U, echt: await jahr(U, false), mutante: await jahr(U, true) };
                d += 50; // ein Versuch je 60 m Abstand
                break;
            }
        return { fehler: "kein offenes Ufer mit nassen und trockenen Pflanzen binnen 900 m" };
    }
    const mess = (T) => {
        const d = T.staemme.map((p) => r.auraAt(p.x, p.z).lebendig - r.worldFieldAt(p.x, p.z).lebendig);
        return {
            baeume: st.architectures.filter((a) => baum(a) && ab(a, T.mitte) <= T.R).length,
            pflanzen: zeichnet((a, id) => T.ernte.includes(id)),
            stuempfe: zeichnet((a, id) => a.preset === "stumpf" && id.includes("#tat|")),
            narbe: +(d.reduce(addiere, 0) / Math.max(1, d.length)).toFixed(3),
            taten: (st.worldMeta.taten || []).length,
        };
    };
    const stunden = async (h, T) => {
        for (let n = h; n > 0; n -= 6) {
            r._weltUhrNimm(st.spielZeit + ((Math.min(6, n)) * r._kalender().tagS) / 24);
            for (let i = 0; i < 30; i++) takt();
        }
        await stehen(T.mitte);
        return mess(T);
    };
    // das Fadenkreuz auf das Ziel; geklickt wird, wenn der Pick des Spiels es trifft
    const klick = (ziel, von, hoch, trifft) => {
        const g = (takt(), y(von.x, von.z));
        pm.set(von.x, g + 1.8, von.z);
        cam.position.set(von.x, g + hoch, von.z);
        cam.lookAt(ziel.x, ziel.y, ziel.z);
        cam.updateMatrixWorld(true);
        return trifft() && (r.tryMouseBreak(), true);
    };
    if (vorher) {
        await stehen(vorher.mitte);
        const aus = { reload: mess(vorher) };
        aus.reloadStunde = await stunden(1, vorher);
        aus.heilung = await stunden(36, vorher);
        return aus;
    }
    await stehen(MESS);
    const B = st.architectures.filter(baum);
    const kern = B.sort((a, b) => ab(a, MESS) - ab(b, MESS))[0].position;
    const ziel = B.sort((a, b) => ab(a, kern) - ab(b, kern)).slice(0, 10);
    const mitte = { x: 0, z: 0 };
    for (const a of ziel) (mitte.x += a.position.x / ziel.length), (mitte.z += a.position.z / ziel.length);
    const T = { mitte, R: Math.max(...ziel.map((a) => ab(a, mitte))) + 1, staemme: [], ernte: [], klicks: 0 };
    await stehen(mitte);
    T.baeumeVorher = st.architectures.filter((a) => baum(a) && ab(a, mitte) <= T.R).length;
    r.setGameMode("frieden");
    for (const a of ziel) {
        const p = { x: a.position.x, y: y(a.position.x, a.position.z) + 1, z: a.position.z };
        for (let i = 0; i < 64 && st.architectures.includes(a); i++) {
            const von = { x: p.x + 2.2 * Math.cos(i * 0.785), z: p.z + 2.2 * Math.sin(i * 0.785) };
            if (klick(p, von, 1.6, () => r._pickArchitectureAtCrosshair()?.entry === a)) T.klicks++;
        }
        if (!st.architectures.includes(a)) T.staemme.push({ x: p.x, z: p.z });
    }
    for (let runde = 0; runde < 4 && T.ernte.length < 30; runde++) {
        await stehen(mitte);
        const kand = [];
        pflanzen(({ key: k }, it) => P(it.x - mitte.x, it.z - mitte.z) < 12 && kand.push({ id: k + "#" + it.id, k, it }));
        kand.sort((a, b) => P(a.it.x - mitte.x, a.it.z - mitte.z) - P(b.it.x - mitte.x, b.it.z - mitte.z));
        for (const { id, k, it } of kand) {
            if (T.ernte.length >= 30 || T.ernte.includes(id)) continue;
            const trifft = () => ((q) => q?.key === k && q.id === it.id)(r._pickScatterAtCrosshair());
            if (klick({ x: it.x, y: it.y + 0.12, z: it.z }, { x: it.x + 1.2, z: it.z + 0.4 }, 1, trifft))
                if (!zeichnet((a, x) => x === id)) T.ernte.push(id);
        }
    }
    Object.assign(T, { gefaellt: T.staemme.length, gepflueckt: T.ernte.length });
    T.stunde = await stunden(1, T);
    r.saveState();
    await r._speicherStill(); // der Stand ist fest vor dem Reload (die Schranke des Speicher-Fadens — bis abdruck-am-takt 2,5 s nach der Wanduhr)
    return T;
}

// DIE BÜHNE JEDER SEITE (nach jedem Laden): die Seite der Tat und des Brands und der Ring im Wort des Reglers voll
// (HOLZ_PROFILE.voll, der Ring des Profi-Bands E) — der Null-Renderer trägt das Holz kienspan (Ring 2, ±108 m), seit die Wahl
// des Geräts jede Welt deckelt (speicher-laden `_applyHolzProfil`): der Fluss nächst der Mess-Wiese lag 204 m fern (jenseits
// des Rings trägt keine Zelle ein Bett, die Wiese liest den gebauten Boden), die Ort-Phase fand keinen fernen Chunk
const BUEHNE = `window.__seite = ${seite}; st.chunkRingRadius = AnazhRealm.HOLZ_PROFILE.voll.ring;`;
async function tatLauf(page) {
    const T = await page.evaluate(tatSeite, MESS, null);
    await page.reload({ waitUntil: "networkidle0", timeout: 120000 });
    await warteAufWelt(page, 120000);
    await page.evaluate(BUEHNE);
    return Object.assign(T, await page.evaluate(tatSeite, MESS, T));
}

// (K5) DER NACHWUCHS (stoffe.K5, `--nachwuchs`, die Seite der Tat mit `vorher.ufer`): am offenen Ufer nächst der Mess-Wiese
// (aus der Welt: der erste Ort mit Feuchte um ½, dessen Ring je ≥ 6 Pflanzen in vollem Licht im Nassen und im Trockenen trägt
// — heute −348/−662, 390 m nördlich, vom nassen Ufer bis ins Trockene, im Licht und unter Kronen) pflückt der Spieler mit dem
// Verb der Ernte (`_harvestScatterPick`) jede Pflanze; die Uhr springt als Spieler-Wort ein Spieljahr (`setTimeOfDay` „regler":
// 0,05 h, bis jede zurück ist, dann 11 h), je Pflanze zählt die Stunde, ab der ihre Kachel sie wieder trägt (`_geerntetIn`), am
// Ende, ob die Senken sie zeichnen. Danach dasselbe mit der Mutante: die Feuchte gleich an ihrer Naht (`_feuchteAt` ½). Feuchte
// und Licht liest die Linse am Gesetz (`_feuchteAt` des Prototyps, `_bodenLichtFeld`). Urteil je 4-m-Kachel (Tempo =
// 1/Stunde): r(Tempo, Feuchte × Licht) ≥ 0,5 über alle; im Offenen (Licht ≥ 0,995, wo das Kronendach schweigt) r ≥ 0,5 und die
// nassen (F ≥ 0,6) ≥ 1,15 × so schnell wie die trockenen (F ≤ 0,2) — die Mutante zieht dort r unter 0,2 und sie unter 1,05.
function nachwuchsMass({ p, jahr, da }) {
    const m = (a, f) => a.reduce((s, x) => s + f(x), 0) / a.length;
    const kor = (Z, a = m(Z, (z) => z.fl), b = m(Z, (z) => z.t)) => {
        const [ab, aa, bb] = [(z) => (z.fl - a) * (z.t - b), (z) => (z.fl - a) ** 2, (z) => (z.t - b) ** 2].map((f) => m(Z, f));
        return aa * bb > 1e-12 ? +(ab / Math.sqrt(aa * bb)).toFixed(3) : 0;
    };
    const je = {};
    for (const [k, F, L, h] of p) (je[k] = je[k] || []).push({ F, L, fl: F * L, t: h && 1 / h });
    const Z = Object.values(je).map((a) => ({ fl: m(a, (q) => q.fl), t: m(a, (q) => q.t), F: m(a, (q) => q.F), L: Math.min(...a.map((q) => q.L)) }));
    const O = Z.filter((z) => z.L >= 0.995);
    const tempo = (f) => m(O.filter(f), (z) => z.t);
    return { n: p.length, da, jahr: Math.round(jahr), r: kor(Z), offen: O.length, rOffen: kor(O), quote: +(tempo((z) => z.F >= 0.6) / tempo((z) => z.F <= 0.2)).toFixed(3) };
}

function nachwuchsUrteil({ echt: e, mutante: m } = {}) {
    if (!(e && m && e.n >= 30 && e.offen >= 6)) return ["LEER: " + JSON.stringify(e)];
    return [
        e.jahr >= 8760 && e.da === e.n ? "" : `JAHR: nach ${e.jahr} h ${e.da} von ${e.n} gezeichnet`,
        e.r >= 0.5 && e.rOffen >= 0.5 ? "" : `KORRELATION: r ${e.r}, offen ${e.rOffen}`,
        e.quote >= 1.15 ? "" : `FEUCHTE: nass ${e.quote} × trocken`,
        m.rOffen < 0.2 && m.quote < 1.05 ? "" : `MUTANTE: bei gleicher Feuchte offen r ${m.rOffen}, nass ${m.quote} × trocken`,
    ].filter(Boolean);
}

// (K2#2 · K5#2) DER BRAND AM ORT UND SEINE FOLGE (stoffe.K2#2 · stoffe.K5#2, `--brand`, Null-Renderer, Spielzeit-Schritte des Takts
// `_tickBrand`): an der Mess-Wiese im Wort bewölkt (Wind 0,3; die Bühne hält die Nässe trocken, bis das Wort Regen sie freigibt).
//   HALT — der Herd liegt windauf des Flusses nächst der Mess-Wiese (der erste trockene Ort mit Bett 48–160 m gegen den Wind): je
//   Zelle, die die Front erreichte und die nicht fing, ihr Grund (Wasser `_nassAt`, nasses Bett `_brandFeuchte` über `mx`, Fels,
//   Asche, mager); die Mutante (`_feuchteAt` 0 an der Naht) brennt in das nasse Ufer. FELS: die Zellen aus Stein, die dieselbe
//   Front erreichte und die nicht fingen (bis w3v-brand-bild ein eigener Herd neben der nächsten Stein-Zelle). Der Brand läuft
//   mittags (die Uhr ist Spieler-Wort).
//   REGEN — der Herd an der Mess-Wiese brennt 30 s, dann fällt das Wort Regen (die Nässe läuft im Takt): Sekunden bis zum Erlöschen;
//   die Mutante (der Regen trägt kein freies Wasser auf die Faser) brennt weiter. LESER im Brand am Herd: Leuchtquellen, Rauch-
//   Quellen (`_updateDorfRauch`) und die Glut am Ohr (`_glutAmOhr`) aus `brandFeld`.
//   ASCHE — die verbrannte Zelle des Herds: die Albedo des Boden-Stoffs an ihrer Mitte (die Vertex-Farbe `_bodenFarbeAt` unter
//   Laubstreu und Asche der Boden-Decke, Y linear) und ihre Halme (`_nahWieseKachelBueschel`) und Kräuter (`_nahStreuKachel`)
//   vor dem Brand, auf der Asche, nach der Stufe Gras (Rest 0,31) und nach der Stufe Busch (0,61); die Mutante liest keine Asche.
//   NÄHRSTOFF — an einer Zelle nächst der Mess-Wiese pflückt der Spieler jede Pflanze (`_harvestScatterPick`), die Asche des Herds
//   und ein Riss von Spieler-Hand (`_creatureCombatDeath`): der Nährstoff `_naehrstoffAt` und der Wuchs `_wuchsAt` je Zelle; die
//   Mutante (der Nährstoff steht auf 1) lässt den Wuchs gleich.
//   ZEIT — 2 km fern der Mess-Wiese fängt jede Zelle mit Bett einer Spirale, bis 2 000 brennen: je Schritt die Wanduhr des Takts
//   und der Leser (Licht, Glut am Ohr) je Bild; SCHIRM das Bild des Brands (`_brandBild`, Flammen und Fahne) je Bild ≤ 1 ms.
// je Probe [Name, gilt, Befund]: die Zeilen, die nicht gelten, beim Namen samt ihrem Befund
const rot = (T) => T.filter((t) => !t[1]).map(([n, , x]) => n + ": " + JSON.stringify(x));
function brandUrteil(b) {
    if (!b || !b.halt || !b.regen || !b.asche || !b.asche.asche || !b.zeit || !b.kante) return ["LEER: " + JSON.stringify(b && Object.keys(b))];
    const [h, m, rg, rm, l, lm, a, z, k, km] = [b.halt, b.haltM, b.regen, b.regenM, b.leser, b.leserM, b.asche, b.zeit, b.kante, b.kanteM];
    return rot([
        ["HALT", h.brannte >= 2 && h.nass >= 1, h],
        ["HALT-BRUCH", h.wasserGebrannt === 0 && h.nassGebrannt === 0, h],
        ["MUTANTE-HALT", m?.nassGebrannt >= 1 && m.nass === 0, m],
        ["FLUSS", m?.wasser + h.wasser >= 1 && m.wasserGebrannt === 0, m],
        ["FELS", h.fels >= 1, h],
        ["REGEN", rg.brannte >= 1 && rg.s <= 60, rg],
        ["MUTANTE-REGEN", rm?.s > 60, rm],
        ["LESER", l?.licht >= 1 && l.rauch >= 1 && l.flammen >= 1 && l.lang >= 0.3 && l.lang <= 8 && l.glutD <= 16 && l.glutF >= 64, l],
        ["MUTANTE-LESER", lm?.licht === 0 && lm.rauch === 0 && lm.flammen === 0 && lm.glutF < 64, lm],
        ["DECKUNG", l?.deckung >= 0.9, l],
        ["MUTANTE-DECKUNG", b.leserD?.deckung < 0.6, b.leserD],
        ["KANTE", k.n >= 40 && k.achse <= 0.4 && k.linie >= 0.8, k],
        ["MUTANTE-KANTE", km?.achse >= 0.7 && km.linie < 0.5, km],
        ["ASCHE", a.asche.a >= 0.99, a.asche],
        ["GRÜNT", a.gras?.a === 0, a.gras],
        ["MUTANTE-ASCHE", a.mutante.halme >= 0.8 * a.vor.halme, a.mutante],
        // ZEIT (w28-tor-bruch): die Wanduhr je Bild und der Verzug melden am Lande-Tor (`mass`); 2 000 brennende Zellen bleiben BRUCH
        ["ZEIT", z.brennend >= 2000 && mass("ZEIT", z.bildMs <= 0.5 && z.verzugS <= 2, `Brand-Bild ${z.bildMs} ms · Verzug ${z.verzugS} s`), z],
        ["SCHIRM", mass("ZEIT", z.schirmMs <= 1, `Brand-Schirm ${z.schirmMs} ms`), z],
    ]);
}

// Die Folge (stoffe.K5#2): auf der vollen Asche (mindestens 40 % der Zelle) kein Halm und kein Kraut, nach der Stufe Gras die
// Halme (≥ 80 %) vor den Kräutern (≤ 30 %), nach der Stufe Busch die Kräuter (≥ 80 %); die Ernte nimmt Nährstoff und Wuchs, Asche
// und Leichnam geben ihn zurück, die Mutante lässt den Wuchs gleich. Der SÄMLING: am Stubben erst kein Baum, dann der Jungwuchs
// älter je Stufe in seiner Größe (Skala = Alter im Maß seiner Kohorte: die Größe des Gefällten, gekappt auf `SUKZESSION.kappe` —
// der Stubben der Mess-Wiese trug 1,135, ohne die Kappe stünde er bei 1,135 × Alter), nach der Heilung der gewachsene; seine Gestalt trägt weniger Ordnungen und
// Glieder (die Mutante ohne `alter` dieselben). Der WALD: der Brand nimmt jeden Baum seiner Narbe (≥ 3), der Wald kehrt als
// Jungwuchs (≥ 60 %) und nach der Heilung gewachsen (≥ 90 %) zurück.
function sukzessionUrteil(s) {
    const [a, n, S, W] = [s?.asche, s?.naehr, s?.saemling, s?.wald];
    if (!a || !a.asche || !n || !S || !W || !(a.vor.halme >= 20) || !(a.vor.kraut >= 3)) return ["LEER: " + JSON.stringify(a?.vor)];
    const [v, g, e, J] = [a.vor, a.gras, n.ernte, S.stufen || []];
    const jung = J.slice(1, -1);
    const waechst = jung.every((q, i) => q.alter > 0 && q.alter < 1 && Math.abs(q.skala - q.alter) < 0.01 && (!i || q.alter >= jung[i - 1].alter));
    return rot([
        ["ASCHE", a.asche.voll >= 0.4 && a.asche.halmeVoll <= 0.05 * v.halme * a.asche.voll && a.asche.krautVoll === 0, a.asche],
        ["GRAS", g?.halme >= 0.8 * v.halme && g.kraut <= 0.3 * v.kraut, g],
        ["BUSCH", a.busch?.kraut >= 0.8 * v.kraut, a.busch],
        ["ERNTE", e.n >= 3 && e.N < e.N0 - 0.04 && e.W < e.W0, e],
        ["RÜCKGABE", n.asche >= 1.2 && n.leichnam >= 1.1, n],
        ["MUTANTE-NÄHRSTOFF", n.mutante.W === n.mutante.W0, n.mutante],
        ["SÄMLING", J.length === 5 && J[0].alter === 0 && waechst && jung.at(-1).alter > jung[0].alter && J[4].alter === 1 && J[4].skala === 1, J],
        ["GESTALT", S.gestalt && S.gestalt[0][0] < S.gestalt[1][0] && S.gestalt[0][1] < S.gestalt[1][1], S.gestalt],
        ["MUTANTE-GESTALT", S.mutante && S.mutante[0][1] === S.mutante[1][1], S.mutante],
        ["WALD", W.vor >= 3 && W.brand === 0 && W.jung >= 0.6 * W.vor && W.heil >= 0.9 * W.vor, W],
    ]);
}

async function brandSeite(MESS) {
    const { pm, takt, y, stehen, pflanzen, wort, fluss } = await window.__seite();
    const [C, P, L] = [AnazhRealm, Object.getPrototypeOf(r), (st.worldMeta.taten ||= [])];
    const [B, cs, n0] = [C.BRAND, C.LIFE_FIELD.cell, L.length];
    const r3 = (v) => Math.round(v * 1e3) / 1e3;
    // die Mitte einer Zelle [x, z], die Zelle eines Orts als Schlüssel
    const xz = (cx, cz) => [(cx + 0.5) * cs, (cz + 0.5) * cs];
    const zelle = (x, z) => [Math.floor(x / cs), Math.floor(z / cs)];
    const bf = () => (st.brandFeld ||= new Map());
    // die Zellen, die die Front erreichte und die nicht fingen, je Grund; je gezündeter Zelle ihr Bett (Höhe, Erlöschungs-Feuchte):
    // die Asche danach fragt, ob sie nass war
    const [halt, gezuendet] = [new Map(), new Map()];
    const malen = () => (st.wegeKarte ? st.wegeKarte.stufen : []).forEach((s) => s.zentriert && r._ascheStufeMalen(s));
    const leer = () => {
        const A = asche();
        bf().clear();
        halt.clear();
        gezuendet.clear();
        L.length = n0;
        r._tatGen = (r._tatGen | 0) + 1;
        malen();
        for (const a of A) r._waldNachwuchs(a.x - cs, a.z - cs, a.x + cs, a.z + cs); // der Wald der Narbe steht wieder
    };
    const [uhr, jahr] = [st.weatherEffectTime, st.autoSeason];
    st.weatherEffectTime = -1e9;
    st.autoSeason = false;
    const trocken = () => ((r._naesseTakt = () => (st.naesse = 0)), (st.naesse = 0));
    const neu = () => (leer(), trocken(), wort("cloudy"));
    // DIE PROBE FÜHRT DIE UHR VON HAND und schreitet den Brand selbst (`brennen`, `_tickBrand`) — einen Takt des Bestands rechnet
    // sie nie: keiner steht aus, der Akt des Entfachens ist am Eingang an der Reihe (`_feldFolgeSteht`, w28-mp-boden: im Spiel
    // tritt er hinter die Takte, die die nahen Regionen nach einem Sprung der Uhr noch nachholen)
    r._feldFolgeSteht = () => true;
    // je Schritt der Welt-Uhr bis `max` s (nie je Ruf: ein Rest über dem Budget schreitet nicht), `tick` der Takt des Brands oder des Spiels
    const brennen = (max, tick = () => r._tickBrand(), u = r._brandUhr) => {
        while (r._brandUhr - u < max - 1e-9 && r._brandLebt()) r._weltUhrNimm(r._brandUhr + B.schrittS), tick();
        return Math.round(r._brandUhr - u);
    };
    const asche = () => L.slice(n0).filter((a) => a.tat === "brand");
    const nass = (f) => r._brandFeuchte(f.boden) >= f.zeile.brenn.mx;
    // der Grund liest das Bett, wie die Front es antraf (`_brandStoff` des Brands), sonst, warum die Zelle keines trägt
    const grund = (cx, cz) => {
        const [x, z] = xz(cx, cz);
        if ((r._tatIndex().je.get(cx + "," + cz) || []).some((a) => a.tat === "brand")) return "asche";
        const f = r._brandStoff(cx, cz);
        if (f) return nass(f) ? "nass" : "anderes";
        if (r._nassAt(x, z)) return "wasser";
        if (!(r.auraAt(x, z).lebendig >= B.minStoff)) return "mager";
        return "fels:" + (r._stoff(r._kontaktStoffAt(x, z, y(x, z)))?.name || "?");
    };
    r._brandZuenden = function (cx, cz, ...a) {
        const z = P._brandZuenden.call(this, cx, cz, ...a);
        const k = cx + "," + cz;
        const f = z && r._brandBett?.get(k);
        if (f) gezuendet.set(k, { y: f.y, mx: f.zeile.brenn.mx });
        if (!z && !halt.has(k)) halt.set(k, grund(cx, cz));
        return z;
    };
    const nassGebrannt = ([cx, cz]) =>
        ((g) => !!g && r._brandFeuchte(P._feuchteAt.call(r, ...xz(cx, cz), g.y)) >= g.mx)(gezuendet.get(cx + "," + cz));
    const zaehle = (g = (v) => [...halt.values()].filter((w) => w === v).length) => {
        const A = asche().map((a) => zelle(a.x, a.z));
        return {
            brannte: A.length,
            wasser: g("wasser"),
            nass: g("nass"),
            fels: g("fels:stein"),
            wasserGebrannt: A.filter((c) => r._nassAt(...xz(...c))).length,
            nassGebrannt: A.filter(nassGebrannt).length,
        };
    };
    const aus = {};
    try {
        r.setSeason("sommer");
        wort("cloudy");
        trocken();
        await stehen(MESS);
        // DIE FOLGE: Halme und Kräuter je Zelle (die Kacheln, die sie berühren; gezählt, was in ihr steht) und die Asche an ihrer
        // Mitte, die Boden-Stoff und Wiese lesen (`_ascheAt`; bis w3v-brand-bild rechnete die Probe die Albedo des Stoffs in JS nach —
        // ein Zwilling, der nur `_ascheAt` und die Palette las)
        const folge = (cx, cz) => {
            const [x0, z0] = [cx * cs, cz * cs];
            const drin = (p) => p.x >= x0 && p.x < x0 + cs && p.z >= z0 && p.z < z0 + cs;
            // je Kachel der Seite `k` (Nah-Wiese, Nah-Streu), die die Zelle berührt
            const je = (k, f) => {
                for (let tx = Math.floor(x0 / k); tx * k < x0 + cs; tx++) for (let tz = Math.floor(z0 / k); tz * k < z0 + cs; tz++) f(tx, tz);
            };
            // je Pflanze, ob sie in der Zelle steht und ob auf voller Asche (`voll`: der Anteil der Zelle mit Asche ≥ 0,99, je m²)
            const voll = (p) => r._ascheAt(p.x, p.z) >= 0.99;
            const n = { halme: 0, kraut: 0, halmeVoll: 0, krautVoll: 0, voll: 0 };
            const zaehl = (L, k) => L.filter(drin).forEach((p) => ((n[k] += 1), (n[k + "Voll"] += voll(p))));
            je(C.NAH_WIESE.kachel, (tx, tz) => zaehl(r._nahWieseKachelBueschel(tx, tz) || [], "halme"));
            const arten = r._nahStreuArten();
            je(C.NAH_STREU.kachel, (tx, tz) => zaehl(((r._nahStreuKachel(tx, tz, arten) || {}).items || []).filter((it) => arten[it.art].ernte === "kraut"), "kraut"));
            for (let i = 0; i < cs * cs; i++) n.voll += voll({ x: x0 + (i % cs) + 0.5, z: z0 + Math.floor(i / cs) + 0.5 }) / (cs * cs);
            return Object.assign(n, { voll: r3(n.voll), a: r3(r._ascheAt(...xz(cx, cz))) });
        };
        // VOR DEM BRAND: die Folge der Zelle des Herds (die Mess-Wiese); der NÄHRSTOFF an ihrer Nachbarin — der Spieler pflückt jede
        // Pflanze der Nah-Streu in ihr (`_harvestScatterPick`), Nährstoff und Wuchs davor und danach, die Mutante (der Nährstoff steht
        // auf 1) vor und nach derselben Ernte
        const [hx, hz] = zelle(MESS.x, MESS.z);
        const vor = folge(hx, hz);
        const N = (aus.naehr = {});
        const E = xz(hx + 1, hz);
        const fest = (fn) => ((r._naehrstoffAt = () => 1), ((v) => (delete r._naehrstoffAt, v))(fn()));
        const [N0, W0, W0m] = [r._naehrstoffAt(...E), r._wuchsAt(...E), fest(() => r._wuchsAt(...E))];
        let gepflueckt = 0;
        pflanzen((q, it) => zelle(it.x, it.z).join(",") === hx + 1 + "," + hz && r._harvestScatterPick(q) && gepflueckt++);
        N.ernte = { n: gepflueckt, N0: r3(N0), W0: r3(W0), N: r3(r._naehrstoffAt(...E)), W: r3(r._wuchsAt(...E)) };
        N.mutante = { W0: r3(W0m), W: r3(fest(() => r._wuchsAt(...E))) };
        leer();
        // HALT: der Herd windauf des Flusses nächst der Mess-Wiese — längs des Strahls gegen den Wind vom Fluss aus (die Spitze läuft
        // ihn zurück): Wasser, dann nasses Bett, dann ununterbrochen trockenes Bett bis zum Herd (Boden-Feuchte ≤ 0,05, ≥ 2 Zellen
        // hinter dem letzten nassen). Die Uhr ist Spieler-Wort: ab der Welt-Uhr 600 s (`_weltUhrNimm`, der Stand beim Laden) wartet er je
        // 10 s auf den ersten Wind (±41°, `windRichtung`), der ihm einen Herd gibt, und zündet mittags (bis w12-brand-halt: zur Boot-Uhr)
        const [ab, d] = [(p, q) => Math.hypot(p.x - q.x, p.z - q.z), (q) => ab(q, MESS)];
        let [herd, uhr, boot] = [null, 590, r3(st.spielZeit)];
        while (!herd && boot < 600 && (uhr += 10) < 1300) for (const p of fluss(MESS, 320)) {
            const w = r._windAt(p.x, p.z, uhr);
            const [seen, strahl] = [new Set(), []];
            for (let D = 0; D <= 400; D += 8) {
                const [cx, cz] = zelle(p.x - w.x * D, p.z - w.z * D);
                if (seen.has(cx + "," + cz)) continue;
                seen.add(cx + "," + cz);
                const f = r._brandStoff(cx, cz);
                const art = f ? (nass(f) ? "nass" : f.zeile.name === "gras" ? "trocken" : "laub") : r._nassAt(...xz(cx, cz)) ? "wasser" : "kein";
                strahl.push({ cx, cz, art, boden: f ? f.boden : null });
            }
            // das Wasser, dann das nasse Bett, dann trockenes Bett ohne Lücke bis zum Herd — der längste trockene Lauf gewinnt
            const n = strahl.findIndex((q) => q.art === "nass");
            if (n < 1 || strahl[n - 1].art !== "wasser") continue;
            let k = n;
            while (k + 1 < strahl.length && strahl[k + 1].art === "nass") k++;
            let j = k;
            while (j + 1 < strahl.length && strahl[j + 1].art === "trocken") j++;
            while (j > k && !(strahl[j].boden <= 0.05)) j--;
            if (j > k && (!herd || j - k > herd.abstand)) herd = { c: xz(strahl[j].cx, strahl[j].cz), abstand: j - k };
        }
        if (!herd) return { fehler: `kein Wind ab 600 s (gebootet bis ${boot} s) gibt binnen 700 s einen Strahl Fluss → nasses Bett → trockenes Bett (Herd mit Boden-Feuchte ≤ 0,05) binnen 320 m um die Mess-Wiese (Ring ${st._activeRingRadius})` }; // prettier-ignore
        const lauf = () => (r._weltUhrNimm(uhr), r.setTimeOfDay(0.5, "regler"), r._brandEntfachen(...herd.c), brennen(3600));
        aus.halt = Object.assign({ herd: herd.c.map(Math.round), uhr: [boot, uhr] }, (lauf(), zaehle()));
        leer();
        r._feuchteAt = () => 0;
        lauf();
        delete r._feuchteAt;
        aus.haltM = zaehle();
        leer();
        delete r._brandZuenden;
        // REGEN und LESER am Herd der Mess-Wiese: Licht, Ohr und das Bild (15 s zu 0,1 s, `_brandBild`: die Fahne steht) — die Flammen der Front,
        // die Fahne und ihre DECKUNG: der dichteste Strahl quer zum Wind durch ihre Ballen 8 m über den Flammen, 1 − Π(1 − Deckung)^g,
        // g = (1 − ρ²)^profil die Dicke, die das Rauch-Bild im Abstand ρ (je Radius) zeichnet (RAUCH_BILD, Beer-Lambert); die Bild-Uhr (A9)
        // läuft ab 0 wie nach dem Laden eines Stands, fern der Welt-Uhr: zog die Fahne zu ihr (bis w13-brand-wind), fiel die Deckung
        const leser = () => {
            st.brandRauch.teilchen.length = st.brandRauch.n = 0; // der Same der Fahne zählt ab der Bühne, nie ab den Takten davor
            for (let i = 0; i < 150; i++) (r._bildZeit = 0.1 * i), r._brandBild(0.1);
            const [g, T, F, w] = [r._glutAmOhr(pm.x, pm.z, () => 0), st.brandRauch.teilchen, r._brandFlammen, r._windAt(pm.x, pm.z, st.spielZeit)];
            const h = F.reduce((u, f) => u + f.y / F.length, 0) + 8;
            const band = T.filter((p) => Math.abs(p.y - h) < p.s);
            const durch = (c) => band.reduce((d, p) => d * (1 - p.a) ** Math.max(0, 1 - (Math.hypot((p.x - c.x) * w.x + (p.z - c.z) * w.z, p.y - h) / p.s) ** 2) ** C.RAUCH_BILD.profil, 1);
            return {
                licht: r._leuchtQuellen(pm.x, pm.y, pm.z, 64).filter((q) => q.quelle === "brand").length,
                rauch: T.length,
                flammen: F.length,
                lang: r3(Math.max(0, ...F.map((f) => f.lang))),
                deckung: r3(1 - Math.min(1, ...band.map(durch))),
                glutD: Number.isFinite(g.d) ? r3(g.d) : null,
                glutF: r3(g.flaeche),
            };
        };
        aus.leserM = leser();
        const brennt = () => [...bf().values()].filter((z) => z.t0 !== null);
        const regen = (mutante) => {
            neu();
            r._brandEntfachen(MESS.x, MESS.z);
            brennen(30);
            const R = { brannte: brennt().length };
            // die Mutante der Fahne: Fäden ohne Körper (der Ballen ein Siebtel so weit, halb so dicht)
            r._brandRauch = (dt, q) => (P._brandRauch.call(r, dt, q), st.brandRauch.teilchen.forEach((p) => ((p.s /= 7), (p.a /= 2))));
            if (mutante) aus.leserD = leser();
            delete r._brandRauch;
            if (mutante) r._brandFeuchte = (b) => P._brandFeuchte.call(r, b) - B.feuchte.nass * (st.naesse || 0);
            else aus.leser = leser();
            delete r._naesseTakt;
            r._naesseUhr = st.spielZeit;
            wort("rainy");
            R.s = brennen(300, takt);
            delete r._brandFeuchte;
            wort("cloudy"), trocken();
            return R;
        };
        aus.regenM = regen(true);
        aus.regen = regen(false);
        // DIE KANTE DER NARBE (stoffe.K2#2): über den Zellen der Aschen ±1 je 0,5 m die Asche, die Boden-Stoff und Wiese lesen
        // (`_ascheAt`); an jedem Ort ihres Saums (0,15 … 0,85) die Richtung ihres Gefälles (Anteil binnen ±10° der Achsen) und der
        // Abstand zur nächsten Linie des 16-m-Rasters — eine Kante längs des Rasters steht in den Achsen und auf der Linie; die
        // Mutante malt die Narbe als das Quadrat ihrer Zelle
        const kante = () => {
            const [A, K, f, a, H] = [asche().map((a) => zelle(a.x, a.z)), { n: 0, achse: 0, linie: 0 }, (v) => cs / 2 - Math.abs((((v % cs) + cs) % cs) - cs / 2), (x, z) => r._ascheAt(x, z), Math.PI / 2]; // prettier-ignore
            const [X, Z] = [0, 1].map((i) => [Math.min(...A.map((c) => c[i])) - 1, Math.max(...A.map((c) => c[i])) + 2].map((v) => v * cs));
            for (let x = X[0]; x < X[1]; x += 0.5)
                for (let z = Z[0]; z < Z[1]; z += 0.5) {
                    if (!(Math.abs(a(x, z) - 0.5) < 0.35)) continue;
                    const q = Math.abs(Math.atan2(a(x, z + 0.5) - a(x, z - 0.5), a(x + 0.5, z) - a(x - 0.5, z))) % H;
                    K.n++, (K.achse += Math.min(q, H - q) < H / 9), (K.linie += Math.min(f(x), f(z)));
                }
            return { n: K.n, achse: r3(K.achse / K.n), linie: r3(K.linie / K.n) };
        };
        await stehen(MESS); // die Narbe malt der Nachwuchs (die Schlange der frischen Taten)
        aus.kante = kante();
        r._brandNarbeFn = (Z) => (x, z) => ((c) => c && Object.assign({ m: 1 }, c))(Z(...zelle(x, z)));
        malen(), (aus.kanteM = kante()), delete r._brandNarbeFn, malen();
        N.asche = r3(r._naehrstoffAt(MESS.x, MESS.z)); // die Asche des Herds, frisch
        // die Welt-Stunde bis `h` (die Welt-Uhr `_weltUhrNimm` in Schritten ≤ 4 h — die Uhr des Spielers bewegt keinen Prozess, je Schritt ein Takt: der Nachwuchs wacht), dann steht die Welt
        const reif = async (h) => {
            for (let n = 0; n < 400 && r._weltStunde() < h; n++)
                r._weltUhrNimm(st.spielZeit + ((Math.min(4, h - r._weltStunde() + 1e-3)) * r._kalender().tagS) / 24), takt();
            await stehen(MESS);
        };
        // ASCHE: die Zelle des Herds (verbrannt, im Regen erloschen) auf der Asche, nach der Stufe Gras, nach der Stufe Busch
        const a = asche().find((q) => zelle(q.x, q.z).join(",") === hx + "," + hz);
        const F = (aus.asche = { vor });
        if (a) {
            await stehen(MESS);
            F.asche = folge(hx, hz);
            r._ascheAt = () => 0;
            F.mutante = folge(hx, hz);
            delete r._ascheAt;
            const dauer = r._tatIndex().dauer.get(a);
            const bis = async (s) => (await reif(a.h + s * dauer), Object.assign(folge(hx, hz), { s: r3(r._sukzession(a).s) }));
            F.gras = await bis(0.31);
            F.busch = await bis(0.61);
        }
        // DER LEICHNAM: ein Riss von Spieler-Hand an einer Zelle neben dem Herd
        const [Dx, Dz] = xz(hx - 1, hz - 1);
        st.maxCreatures = st.creatures.length + 1;
        const tier = r.spawnCreatureAt(Dx, y(Dx, Dz), Dz, "calm", "wolf", { precise: true, bodySize: 1 });
        if (tier) r._creatureCombatDeath(tier, "player");
        N.leichnam = r3(r._naehrstoffAt(Dx, Dz));
        // DER SÄMLING (stoffe.K5#2): der nächste Baum des Walds fällt (`harvestArchitecture`) — an seinem Ort steht bis zum
        // Austrieb des Stubbens kein Baum, dann sein Jungwuchs (`studioOv.alter` in `alter` × seiner Größe, gekappt auf `SUKZESSION.kappe`), Stufe um Stufe
        // älter, nach der Heilung der gewachsene; die Gestalt der Jugend liest der gefühlte Baum (das Skelett der Prägung,
        // `skelettDerGestalt`: weniger Ordnungen und Glieder als der gewachsene), die Mutante (treeParams ohne `alter`) wächst ihn
        // als den alten. DER WALD NACH DEM BRAND: der nächste Baum zündet mittags; die Bäume, die danach in der Narbe stünden (Narbe ≥ ½),
        // nimmt der Brand, mit dem Wald der Sukzession kehrt ihr Jungwuchs zurück, nach der letzten Heilung der gewachsene.
        neu();
        r._vegSpawnImmediate = true;
        const dart = (p, W = C.FOREST.cell) => r._forestCellDarts(Math.floor(p.x / W), Math.floor(p.z / W), r._forestSeedInt()).some((q) => ab(q, p) < 0.05);
        const baeume = () => st.architectures.filter((e) => e?.position && /^baum_/.test(e._lodSpecies || "") && dart(e.position));
        const am = (p) => baeume().find((e) => ab(e.position, p) < 0.05);
        const alter = (p) => ((e) => (e ? e.studioOv?.alter || 1 : 0))(am(p));
        const naechster = () => baeume().sort((u, v) => d(u.position) - d(v.position))[0];
        const gestalt = (e, pr = r._foundryPresetForEntry(e), g = r._foundryGestaltFor(e, pr) ?? 1) =>
            [e.studioOv, null].map((ov) => ((k) => [k.P.maxDepth, k.nodes.segs.length])(globalThis.__terrainCore.skelettDerGestalt(pr, g, 0, r._foundryGestaltOv(ov))));
        const S = (aus.saemling = { stufen: [] });
        const B0 = naechster();
        if (B0) {
            const [p, s0] = [{ x: B0.position.x, z: B0.position.z }, B0.scale];
            r.harvestArchitecture(B0, "welt");
            const a = L.find((q) => q.tat === "faellen" && ab(q, p) < 0.05);
            const h = (s) => a.h + s * r._tatIndex().dauer.get(a);
            for (const s of [0.1, 0.35, 0.6, 0.85, 1.02]) {
                await reif(s > 1 ? h(1) + 0.1 : h(s));
                const e = am(p);
                S.stufen.push({ alter: alter(p), skala: e ? r3(e.scale / Math.min(s0, e.studioOv ? C.SUKZESSION.kappe : s0)) : 0 });
                if (!e || !e.studioOv || S.gestalt) continue;
                const PC = globalThis.__phytoCore;
                const tp = PC.treeParams;
                S.gestalt = gestalt(e);
                PC.treeParams = (dl, sd, sf, art, w) => tp(dl, sd, sf, art, w);
                S.mutante = gestalt(e);
                PC.treeParams = tp;
            }
        }
        leer(), trocken();
        const B1 = naechster();
        const W = (aus.wald = {});
        if (B1) {
            const orte = baeume().filter((e) => ab(e.position, B1.position) < 96).map((e) => ({ x: e.position.x, z: e.position.z }));
            r.setTimeOfDay(0.5, "regler"), r._brandEntfachen(B1.position.x, B1.position.z);
            brennen(900), await stehen(MESS);
            const N = orte.filter((o) => ((n) => n?.m >= 0.5)(r._brandNarbe(o.x, o.z)));
            const T = r._tatIndex();
            const zaehl = (f) => N.filter((o) => f(alter(o))).length;
            Object.assign(W, { vor: N.length, brand: zaehl((v) => v > 0) });
            // der Jungwuchs je Baum, solange seine Zelle im Wald der Sukzession steht: gesehen an sechs Stunden (die Zellen heilen
            // nach ihrem Wuchs verschieden schnell)
            const [Q, jung] = [asche().map((q) => q.h + 0.8 * T.dauer.get(q)).sort(aufsteigend), new Set()];
            for (let k = 0; k < 6; k++) {
                await reif(Q[Math.floor(((Q.length - 1) * k) / 5)]);
                N.forEach((o, i) => ((v) => v > 0 && v < 1 && jung.add(i))(alter(o)));
            }
            W.jung = jung.size;
            await reif(Math.max(...asche().map((q) => q.h + T.dauer.get(q))) + 0.1);
            W.heil = zaehl((v) => v === 1);
        }
        r._vegSpawnImmediate = false;
        // ZEIT: jede Zelle mit Bett im geladenen Ring um die Mess-Wiese fängt (das Quadrat ±40 Zellen, der Brand fängt je Zelle
        // unabhängig von der Reihe); trägt die Welt dort weniger als 2 000 Zellen Bett (das Bett der Wiese liest die Boden-Karte
        // gebauter Chunks), füllen Abzüge der brennenden Zellen den Rest bis 2 000
        neu();
        for (let i = -40; i <= 40; i++) for (let j = -40; j <= 40; j++) r._brandEntfachen(...xz(hx + i, hz + j));
        const echt = brennt();
        for (let k = 0; brennt().length < 2000 && echt.length; k++) {
            const q = echt[k % echt.length];
            const [cx, cz] = [q.cx + 1000 + (k % 64), q.cz + 1000 + Math.floor(k / 64)];
            bf().set(cx + "," + cz, Object.assign({}, q, { cx, cz, von: null, y: null }));
        }
        const zn = brennt().length;
        // 1 200 Bilder zu 1/60 s (20 s Spielzeit): je Bild der Takt (`_tickBrand`, seine geteilte Arbeit) und die Leser (Licht,
        // Ohr), dann der SCHIRM (`_brandBild`: Flammen und Fahne im Deckel des Bilds); der Verzug ist die Spielzeit, um die der
        // angefangene Schritt hinter der Uhr liegt
        const [ms, lms, sms] = [[], [], []];
        let verzug = 0;
        for (let i = 0; i < 1200; i++) {
            r._weltUhrNimm(st.spielZeit + (1 / 60));
            const t0 = performance.now();
            r._tickBrand();
            const t1 = performance.now();
            verzug = Math.max(verzug, st.spielZeit - (r._brandRest ? r._brandRest.t : r._brandUhr));
            r._leuchtQuellen(pm.x, pm.y, pm.z, 64);
            r._glutAmOhr(pm.x, pm.z, () => 0);
            const t2 = performance.now();
            r._brandBild(1 / 60);
            ms.push(t2 - t0), lms.push(t2 - t1), sms.push(performance.now() - t2);
        }
        const p95 = (v) => r3(rang(v.sort(aufsteigend), 0.95));
        aus.zeit = { brennend: zn, echt: echt.length, bildMs: p95(ms), leserMs: p95(lms), verzugS: r3(verzug), schirmMs: p95(sms) };
        leer();
        return aus;
    } finally {
        for (const k of ["_brandZuenden", "_naesseTakt", "_feuchteAt", "_brandFeuchte", "_ascheAt", "_naehrstoffAt", "_brandRauch", "_brandNarbeFn", "_vegSpawnImmediate", "_feldFolgeSteht"]) delete r[k];
        st.weatherEffectTime = uhr;
        st.autoSeason = jahr;
    }
}

// (N1–N4) DIE NARBE FOLGT DER FRONT (w28-brand-bild, `--narbe`, Null-Renderer, Mess-Wiese, mittags, trockenes Bett: `_feuchteAt` 0
// für den Lauf): der Herd fängt AM ORT der Mess-Wiese (`_brandEntfachen`), die Probe schreitet den Takt des Brands (`_tickBrand`)
// je `schrittS`, höchstens 20 s und nur, solange die Herd-Zelle brennt und ein Ort in ihr vor jeder Front liegt.
//   N1 — die Narbe, die der Maler liest (`_brandNarbe` über `_brandZellen`, m × asche wie `_ascheFlaeche`): am Zünd-Punkt (die
//   Flamme stand dort ihre Verweilzeit) > 0,5; am Ort DERSELBEN Zelle, den noch keine Front der vier Zellen um ihn erreichte (die
//   Ankunft aus R, ecc, kopf, ex, ez jeder brennenden Zelle selbst gerechnet; um die Zell-Mitte, wo die Narbe die Herd-Zelle liest), 0. Die Mutanten: die Front konstant 0 (die Narbe
//   wartet auf die ausgebrannte Zelle) und die brennende Zelle ohne Front (ihr Quadrat fällt auf einmal).
//   N2 — `ende − t0` der Herd-Zelle ≥ die späteste Ankunft ihrer Ellipse an den vier Ecken; die Mutante stutzt `ende` auf den
//   Durchlauf des Kopfs (quer/R + tr, der Stand bis w28-brand-bild).
//   N3 — nach EINEM Bild (`_brandBild`) steht jede Leuchtquelle des Brands, die das Licht liest (`_leuchtQuellen`), ≤ 0,6 m (xz)
//   von einer Flamme ihrer Zelle (`_brandFlammen`); die Mutante stellt den Ort zurück über die Zell-Mitte (`_brandOrt`).
//   N4 — der Stoff des Chunk-Bodens, frisch gebaut über seinen Bauer (`_getVoxelChunkMaterial`, mit Wege-Karte), ruft
//   `STOFF_GESETZ.zeile("asche")` ≥ 1-mal (gezählt am Kern der Seite, kein Quelltext); die Mutante nimmt dem Boden-Stoff die
//   Asche-Decke (`_wegeBodenFarbe` ohne `aus.asche`) und liest 0.
//   N5 (w28-brand-saum) — die Front ist ein geschlossener Saum: in demselben Bild stehen die Flammen der Herd-Zelle längs ihrer
//   Front im Median ihrer Paare ≤ `NARBE_SAUM` × die volle Breite ihrer Zungen auseinander (2 × `BRAND.bild.breite` × Länge ×
//   rMax der Zunge `FLAMME.zunge`, wie `_brandFlammenZeichnen`; die Länge die ruhende nach Byram 0,0775·I^0,46 aus `f.I`, nicht
//   die pulsende `f.lang`; ≥ 8 Paare). Gemessen 1,187 (0,427 m bei 0,36 m); die Mutante (`abstandMinM` 0,5 m, die Tafel zur
//   Laufzeit ersetzt) 1,6 (1,123 m bei 0,702 m): die kleinen Zungen der Flanken stehen als einzelne Punkte.
//   N6 (w28-brand-zunge) — die Zungen pulsen: in demselben Bild streut die Länge der Flammen der Herd-Zelle je ihrer Byram-Länge
//   (q = `f.lang` ÷ 0,0775·I^0,46) mit σ ≥ `NARBE_PULS` (≥ 8 Flammen). Gemessen σ 0,246 bei der Bild-Uhr 0 (q 0,652 … 1,35; der
//   Ort-Term des Takts trägt allein), 0,259 nach 1,3 s; erwartet puls/√2 = 0,247. Die Mutante (`BRAND.bild.puls` 0) σ 0: die
//   Front steht als Band gleicher Höhe.
//   N7 (w28-brand-nacht) — das Schein-Maß: NACHTS (Uhr 0) trägt jede Leuchtquelle des Brands (`_leuchtQuellen`) AN der Flamme
//   die Bestrahlung `_leuchtStaerke` × (1 + k²)/k² (k = ihr Kern `L.kernM`) in Welt-Einheiten — licht-eine-skala P8: die Stärke
//   ist cd ÷ `EINHEIT_LX` × Masse ohne π, das Soll AN der Fläche π × die Leuchtdichte der Flamme (fachwerk `FEUER_LEUCHTDICHTE`)
//   ÷ `EINHEIT_LX` (`soll`); das Maximum über die Quellen und acht Bild-Uhren liegt in [`NARBE_SCHEIN_MIN`, `NARBE_SCHEIN_MAX`]
//   × `soll`, und keine trägt einen Zeitplan (`L.zeit`). Die Mutante (`_flammenLicht` → das Herdfeuer × `BRAND.licht`, der
//   Stand bis w28-brand-nacht): seine Lichtstärke `cd` des Herdfeuers trägt den Brand aus dem Band (bis licht-eine-skala hob
//   ihn der Zeitplan der Nacht darüber, heute steht er darunter). N7-UHR: am Mittag trägt derselbe Brand denselben
//   Schein (± 2 %); die Mutante „am Bild-Ton“ (Masse ÷ Belichtung, der widerlegte Stand 63c7e567: am Tag färbte der Brand Gras
//   und Rauch orange) lässt Tag und Nacht auseinanderfallen.
// so weit dürfen Nachbarn stehen, je volle Breite der Zunge: das Rauschen weitet ihren Radius bis × `weit` (2), der Saum schließt
// also schon im Mittel dieses Hubs; 1,4 liegt zwischen den beiden gemessenen Ständen
//   N8 (front-brand, same.physik.reaktion#1) — die Masse bleibt: die brennende Zelle trägt das Holz ihres Betts (`kg`), das Buch
//   `_brandMasse` schließt (Asche + Rauch = Verbranntes, ausgebrannt = Holz), die Tat `brand` trägt die Asche, die Ballen der
//   Fahne tragen den Rauch-Strom ihrer Front und decken nach ihrer Masse (`masseUrteil`, die Bänder `NARBE_MASSE`).
const NARBE_SAUM = 1.4;
// so weit streut die Länge der Zungen mindestens je Byram-Länge: gut die Hälfte der Streuung eines vollen Sinus mit `puls` 0,35
const NARBE_PULS = 0.15;
// das Band des Scheins je Soll (`soll` = π × Leuchtdichte der Fläche ÷ EINHEIT_LX, die Bestrahlung AN der Fläche): das Soll ×
// Flackern (± 0,18) × Glut liegt darin — dieselben Verhältnisse wie das Band [3, 10,5] um den alten `schein` 7,5 (0,4 … 1,4);
// der Herdfeuer-Punkt (Lichtstärke `cd` 10,2 × `BRAND.licht`) trägt ein Tausendstel davon
const [NARBE_SCHEIN_MIN, NARBE_SCHEIN_MAX] = [0.4, 1.4];
const scheinBand = (x) => [NARBE_SCHEIN_MIN * x.soll, NARBE_SCHEIN_MAX * x.soll].map((v) => +v.toFixed(3));
const ausserBand = (x) => !!x && x.soll > 0 && (x.max > NARBE_SCHEIN_MAX * x.soll || x.max < NARBE_SCHEIN_MIN * x.soll);
// (N8) DAS URTEIL DER MASSE (front-brand, same.physik.reaktion#1 „Asche + Rauch-Masse = Holz ±10 %, Rauchmenge sichtbar
// proportional"). Die Bänder: `holz` die Masse der Zelle und die Asche der Tat gegen die Rechnung der Linse, `bilanz` Asche +
// Rauch gegen Holz im Buch des Gesetzes, `front` das Buch zur halben Brenndauer gegen den verzehrten Anteil der Linse, `strom`
// die Fahne (Masse, optische Masse, Erhalt, Verhältnis voll ÷ halb). Gemessen am Stand vor front-brand (main 9502aa0e): die Zelle
// trägt keine Masse, das Gesetz kein Buch, die Tat keine Asche, die Ballen keine Masse — ihre optische Masse je kg Rauch-Strom
// steht bei voller Last × NARBE_MASSE_TAETER.proportional der halben, und im Steigen wächst sie × NARBE_MASSE_TAETER.erhalt.
// N8-BILD — die Masse der Fahne hängt nie am Bild: dieselbe Fahne mit dem Auge 100 m ab (`fern`: die Front in wenigen Winkeln),
// bei einem Bild von 250 ms (`lahm`) und in den ersten 3 s (`jung`: schwacher Strom, die Zelle tritt erst ins Bild) trägt die
// Masse ihres Stroms im Band `strom`. Am Stand 44d954be2 zählte `_brandBild` den Strom in den Winkeln, mit denen es die Front
// für das Auge abtastet, und `_brandRauch` gab ihn im Takt des Bilds weiter (fern 0,884 von 1,135 kg, lahm 0,435 von 1,134 kg).
const NARBE_MASSE = { holz: 0.01, bilanz: 0.001, front: 0.03, strom: 0.1 };
const nahBei = (x, soll, tol) => Number.isFinite(x) && Number.isFinite(soll) && Math.abs(x - soll) <= tol * Math.abs(soll);
function masseUrteil(b) {
    const m = b?.n8;
    if (!m) return ["N8-LEER: kein Befund der Masse"];
    const [T, v, h, e, mi] = [NARBE_MASSE, m.fahne?.voll, m.fahne?.halb, m.buch?.ende, m.buch?.mitte];
    const je = (x, name) =>
        !x
            ? []
            : [
                  nahBei(x.masse, x.strom, T.strom) ? "" : `N8-RAUCH: die Ballen tragen die Rauch-Masse ihres Stroms nicht (${name}): Σ m ${x.masse} kg über ${x.ballen} Ballen ↔ Strom ${x.strom} kg in 3 s (Holz × Δverzehrt × (1 − Mineral), verlangt ± ${T.strom * 100} %; stamm/feld-brand.js \`_brandRauch\`)`,
                  nahBei(x.optisch, x.soll, T.strom) ? "" : `N8-DECKUNG: die Deckung der Ballen folgt ihrer Masse nicht (${name}): optische Masse τ·A ${x.optisch} m² ↔ km × Partikel-Masse ${x.soll} m² (BRAND.partikel, verlangt ± ${T.strom * 100} %)`,
                  nahBei(x.erhalt, 1, T.strom) ? "" : `N8-ERHALT: der steigende Ballen erfindet oder verliert Rauch (${name}): seine optische Masse τ·A × ${x.erhalt} nach 3 s (${x.lebt} Ballen; verlangt 1 ± ${T.strom})`,
              ];
    const verh = v && h && h.optisch > 0 && h.strom > 0 && v.strom > 0 ? Math.round((v.optisch / v.strom / (h.optisch / h.strom)) * 1e3) / 1e3 : null;
    return [
        m.soll > 0 && m.ausgebrannt && v?.ballen >= 10 && v.strom > 0 && v.lebt >= 5 && h?.ballen >= 5 && h.strom > 0 && h.strom < v.strom ? "" : `N8-LEER: keine Messung der Masse: Holz ${m.soll} kg, der Herd ${m.ausgebrannt ? "brannte aus" : "brannte nicht aus"}, Fahne voll ${JSON.stringify(v)}, halb ${JSON.stringify(h)}`,
        nahBei(m.kg, m.soll, T.holz) ? "" : `N8-HOLZ: die brennende Zelle trägt die Masse ihres Betts nicht: ${m.kg} kg ↔ ${m.soll} kg (Last der Zeile × lebendig × Bett-Fläche; stamm/feld-brand.js \`_brandZuenden\`)`,
        e && mi && nahBei(e.holz, m.soll, T.holz) && nahBei(e.asche + e.rauch, e.holz, T.bilanz) && nahBei(e.asche, m.mineral * e.holz, T.holz) && nahBei(mi.brannte, m.mitteSoll, T.front) && nahBei(mi.asche + mi.rauch, mi.brannte, T.bilanz)
            ? ""
            : `N8-BILANZ: Asche + Rauch ≠ Holz: ${e ? `ausgebrannt Holz ${e.holz} kg → Asche ${e.asche} + Rauch ${e.rauch} (Mineral ${m.mineral}, Holz der Linse ${m.soll}); zur halben Brenndauer verbrannt ${mi?.brannte} kg ↔ ${m.mitteSoll} kg der Front` : "das Gesetz trägt kein Buch der Masse (\`_brandMasse\`)"}`,
        nahBei(m.tat, m.mineral * m.soll, T.holz) ? "" : `N8-ASCHE: die Tat \`brand\` der ausgebrannten Zelle trägt ihre Asche nicht: kg ${m.tat} ↔ ${Math.round(m.mineral * m.soll * 1e3) / 1e3} kg (Mineral ${m.mineral} × Holz ${m.soll} kg)`,
        ...je(v, "volle Last"),
        ...je(h, "halbe Last"),
        ...[["fern", "das Auge 100 m ab"], ["lahm", "das Bild in 250 ms"], ["jung", "die ersten 3 s"]].map(([k, was]) => ((x) => (x && x.strom > 0 && nahBei(x.masse, x.strom, T.strom) ? "" : `N8-BILD: die Masse der Fahne hängt am Bild (${was}): Σ m ${x?.masse} kg (${x?.ballen} Ballen, davon gehalten ${x?.haelt} kg) ↔ Strom der Front ${x?.strom} kg in 3 s (verlangt ± ${T.strom * 100} %; stamm/feld-brand.js \`_brandStrom\` · \`_brandRauch\`)`))(m.fahne?.[k])), // prettier-ignore
        nahBei(verh, 1, T.strom) ? "" : `N8-PROPORTIONAL: die Rauchmenge im Bild folgt der Masse nicht: optische Masse je kg Rauch-Strom bei voller Last × ${verh} der halben (voll ${v?.optisch} m² ÷ ${v?.strom} kg, halb ${h?.optisch} m² ÷ ${h?.strom} kg; verlangt 1 ± ${T.strom})`,
        m.mutante && !nahBei(m.mutante.erhalt, 1, T.strom) && !nahBei(m.mutante.optisch, m.mutante.soll, T.strom) ? "" : `MUTANTE-N8: mit der Deckung ohne Masse (a0 × b0 ÷ s) liest die Linse Erhalt × ${m.mutante?.erhalt} und τ·A ${m.mutante?.optisch} ↔ ${m.mutante?.soll} m² — sie misst die Masse der Ballen nicht`,
    ].filter(Boolean);
}
// (N9) DAS URTEIL DER ZÜNDUNG (front-brand, gate:stand-takt BRAND-ZÜNDUNG): eine Zündung liest, was sich ändert. SÄULE — unter
// `_brandStoff` einer Gras-Zelle marschiert `_voxelSurfaceY` genau EINMAL (die Höhe des Betts; das Gefälle liest die 2D-Höhe
// `_terrainMacroSurfaceY`). WIESE — der Neubau in den ersten zwölf Schritten des Brands lässt weniger Streu-Kacheln fallen
// als der über der ganzen Zelle ±½. Die Mutante ist der Stand 8e2d76d1 (GPU-Probe 44943679460: zwei Zündungen in einem Schritt
// mit 16 Zellen 1 099 Einheiten, Soll 1 024): das Gefälle aus zwei weiteren Märschen, der Neubau über der Zelle ±½.
function zuendungUrteil(b) {
    const n = b?.n9;
    if (!n) return ["N9-LEER: kein Befund der Zündung"];
    const [e, m] = [n.echt || {}, n.mutante || {}];
    return [
        e.bett > 0 && e.maersche >= 1 && e.wiese > 0 && m.wiese > 0 ? "" : `N9-LEER: keine Messung der Zündung: Bett-Anteil ${e.bett}, ${e.maersche} Märsche, ${e.neubauten} Neubauten der Wiese in zwölf Schritten mit ${e.wiese} Streu-Kacheln je Neubau (ganze Zelle ±½: ${m.neubauten} mit ${m.wiese})`,
        e.maersche === 1 ? "" : `N9-SÄULE: die Zündung marschiert ${e.maersche}-mal durch ihre Säule (\`_voxelSurfaceY\` unter \`_brandStoff\`, Soll 1: die Höhe des Betts — das Gefälle liest die 2D-Höhe \`_terrainMacroSurfaceY\`) — stamm/feld-brand.js _brandStoff`,
        e.wiese < m.wiese ? "" : `N9-WIESE: ein Neubau der Wiese fällt in den ersten zwölf Schritten des Brands über ${e.wiese} Streu-Kacheln — so viele wie über der ganzen Zelle ±½ (${m.wiese}); er gehört dem Rechteck der geänderten Viertel (\`wieseNeu\`) — stamm/feld-brand.js _brandMalen`,
        // FELD — der Stoff des Felds (`_terrainMaterialAt` mit Höhe: jeder kahle Bett-Punkt, das Graben, das Rad) marschiert EINMAL:
        // der Höhen-Term der Feuchte und die Strata lesen dieselbe Oberfläche. Die Mutante ist der Stand bis front-brand (die
        // Feuchte marschiert selbst: an der Mess-Wiese eine Bett-Maske mit 14 kahlen Punkten 29 Märsche und 3 654 Einheiten der
        // Zündung, mit EINEM Marsch 15 und 3 080)
        e.feld === 1 ? "" : `N9-FELD: der Stoff des Felds marschiert ${e.feld}-mal durch seine Säule (\`_voxelSurfaceY\` unter \`_terrainMaterialAt\` mit Höhe, Soll 1: die Feuchte und die Strata lesen dieselbe Oberfläche) — stamm/vegetation-wiese.js _terrainMaterialAt`,
        m.feld >= 2 ? "" : `MUTANTE-N9: mit der Feuchte, die selbst marschiert, zählt die Linse ${m.feld} Märsche des Felds — sie ist blind für die Säule des Stoff-Lesers`,
        m.maersche >= 3 ? "" : `MUTANTE-N9: mit dem Gefälle aus zwei weiteren Märschen zählt die Linse ${m.maersche} Märsche — sie ist blind für die Säule`,
    ].filter(Boolean);
}
function narbeUrteil(b) {
    const [a, e, l, s, n, z, h] = [b?.n1, b?.n2, b?.n3, b?.n4, b?.n5, b?.n6, b?.n7];
    if (!a || !e || !l || !s || !n || !z || !h || !b.l1 || !b.l2 || !b.l3 || !b.l4 || !b.l5) return ["LEER: " + JSON.stringify(b && Object.keys(b))];
    const [mw, mq] = [a.mutanteWartet, a.mutanteQuadrat];
    return [
        a.brennt && a.s >= a.tr && a.fernAn > a.s ? "" : `N1-LEER: die Herd-Zelle ${a.brennt ? "brennt" : "brennt nicht mehr"} nach ${a.s} s (Verweilzeit ${a.tr} s), der ferne Ort fängt nach ${a.fernAn} s`,
        a.zuend > 0.5 ? "" : `N1-WARTET: die Narbe wartet auf die ausgebrannte Zelle: brennende Zelle trägt ${a.zuend} am verzehrten Ort (Zünd-Punkt nach ${a.s} s Brand, Verweilzeit ${a.tr} s; verlangt > 0,5)`,
        a.fern === 0 ? "" : `N1-QUADRAT: Zell-Quadrat: Asche vor der Front — Narbe ${a.fern} bei (${a.fernOrt}), die Front kommt dort erst nach ${a.fernAn} s (Uhr des Brands ${a.s} s)`,
        mw?.zuend <= 0.5 ? "" : `MUTANTE-N1-WARTET: mit der Front konstant 0 trägt der Zünd-Punkt ${mw?.zuend} — die Linse liest die Front nicht`,
        mq?.fern > 0 ? "" : `MUTANTE-N1-QUADRAT: ohne Front (das Quadrat der Zelle) trägt der ferne Ort ${mq?.fern} — die Linse sieht keine Asche vor der Front`,
        e.dauer >= e.ecken ? "" : `N2-ENDE: die Zelle fällt mit dem Kopf: sie brennt ${e.dauer} s, ihre Front deckt sie erst nach ${e.ecken} s (die späteste Ecke; der Kopf ist nach ${e.kopf} s durch)`,
        e.mutante?.dauer < e.mutante?.ecken ? "" : `MUTANTE-N2: auf den Kopf gestutzt brennt die Zelle ${e.mutante?.dauer} s bei ${e.mutante?.ecken} s bis zur spätesten Ecke — an diesem Ort deckt der Kopf die Zelle`,
        l.gemessen >= 1 ? "" : `N3-LEER: kein Licht einer Zelle mit Flammen (${l.lichter} Leuchtquellen des Brands, ${l.flammen} Flammen im Bild)`,
        l.max <= 0.6 ? "" : `N3-LICHT: Licht ${l.mitte ? "über der Zell-Mitte" : "abseits der Flammen"}, ${l.max} m neben der nächsten Flamme (${l.gemessen} Zellen mit Flammen; verlangt ≤ 0,6 m)`,
        l.mutante?.max > 0.6 ? "" : `MUTANTE-N3: über der Zell-Mitte steht das Licht ${l.mutante?.max} m neben der nächsten Flamme — die Linse sieht die Mitte nicht`,
        s.gebaut ? "" : `N4-LEER: der Bauer des Chunk-Bodens (_getVoxelChunkMaterial) baute keinen frischen Stoff`,
        s.abrufe >= 1 ? "" : `N4-ZEILE: der Boden liest die Asche-Zeile nicht: ${s.abrufe} Abrufe zeile("asche") beim Bau des Chunk-Boden-Stoffs (Rauheit der Zeile ${s.rauheit})`,
        s.mutante === 0 ? "" : `MUTANTE-N4: ohne Asche-Decke zählt die Linse ${s.mutante} Abrufe zeile("asche") — sie zählt einen anderen Leser`,
        n.paare >= 8 && n.mass > 0 ? "" : `N5-LEER: keine Messung des Saums: ${n.paare} Paare benachbarter Flammen in der Herd-Zelle (${n.flammen} Flammen; verlangt ≥ 8)`,
        !(n.mass > NARBE_SAUM) ? "" : `N5-SAUM: die Front steht als einzelne Punkte: Flammen-Abstand ${n.abstand} m > Zungen-Breite ${n.breite} m × ${NARBE_SAUM} (Verhältnis ${n.mass} im Median von ${n.paare} Paaren, BRAND.bild.abstandMinM ${n.minM} m)`,
        n.mutante?.paare >= 8 && n.mutante?.mass > NARBE_SAUM ? "" : `MUTANTE-N5: mit abstandMinM 0,5 m liest die Linse Flammen-Abstand ${n.mutante?.abstand} m bei Zungen-Breite ${n.mutante?.breite} m (Verhältnis ${n.mutante?.mass}, ${n.mutante?.paare} Paare) — sie sieht die Lücken nicht`,
        z.flammen >= 8 && (z.sigma > 0 || z.sigma === 0) ? "" : `N6-LEER: keine Messung des Pulses: ${z.flammen} Flammen in der Herd-Zelle (σ ${z.sigma}; verlangt ≥ 8)`,
        !(z.sigma < NARBE_PULS) ? "" : `N6-BAND: die Front steht als Band gleicher Höhe: σ ${z.sigma} < ${NARBE_PULS} (Länge je Byram-Länge ${z.min} … ${z.max} über ${z.flammen} Flammen, BRAND.bild.puls ${z.puls})`,
        z.mutante?.flammen >= 8 && z.mutante?.sigma < NARBE_PULS ? "" : `MUTANTE-N6: ohne Puls liest die Linse σ ${z.mutante?.sigma} über ${z.mutante?.flammen} Flammen — sie misst nicht den Puls`,
        h.quellen >= 1 && h.max > 0 && h.herd > 1 && h.soll > 0 ? "" : `N7-LEER: keine Messung des Scheins: ${h.quellen} Leuchtquellen des Brands (Schein ${h.max}, Soll ${h.soll}), der Zeitplan des Herdfeuers steht bei ${h.herd} (verlangt > 1: die Nacht)`,
        !(h.max > NARBE_SCHEIN_MAX * h.soll) && h.zeit === 0 ? "" : `N7-SCHEIN: der Brand leuchtet über seiner Leuchtdichte oder mit Zeitplan: Schein ${h.max} > ${scheinBand(h)[1]} (${NARBE_SCHEIN_MAX} × Soll ${h.soll} = π × FEUER_LEUCHTDICHTE ÷ EINHEIT_LX) oder Zeitplan an ${h.zeit} von ${h.quellen} Quellen (nachts, Zeitplan des Herdfeuers × ${h.herd}, Kern ${h.kern} m, Belichtung ${h.belichtung}) — stamm/dirigent-kern.js _flammenLicht · _leuchtStaerke`,
        !(h.max < NARBE_SCHEIN_MIN * h.soll) ? "" : `N7-DUNKEL: der Brand leuchtet nicht als Flamme: Schein ${h.max} < ${scheinBand(h)[0]} (${NARBE_SCHEIN_MIN} × Soll ${h.soll}; ${h.quellen} Quellen, Kern ${h.kern} m, Belichtung ${h.belichtung}) — stamm/dirigent-kern.js _flammenLicht · _leuchtStaerke`,
        Math.abs(h.tag - h.max) <= 0.02 * h.max ? "" : `N7-UHR: das Licht des Brands hängt an der Stunde oder der Belichtung: Schein am Mittag ${h.tag} ↔ nachts ${h.max} (verlangt gleich ± 2 %)`,
        Math.abs(h.mutanteTon?.tag - h.mutanteTon?.nacht) > 0.2 * h.mutanteTon?.nacht ? "" : `MUTANTE-N7-TON: mit der Masse ÷ Belichtung liest die Linse am Mittag ${h.mutanteTon?.tag} ↔ nachts ${h.mutanteTon?.nacht} — sie sieht das Licht am Bild-Ton nicht`,
        h.mutante?.quellen >= 1 && ausserBand({ max: h.mutante.max, soll: h.soll }) && h.mutante?.zeit >= 1 ? "" : `MUTANTE-N7: als Herdfeuer-Punkt × BRAND.licht (Lichtstärke cd des Herdfeuers, mit Zeitplan) liest die Linse Schein ${h.mutante?.max} im Band ${scheinBand(h)} (Zeitplan an ${h.mutante?.zeit} von ${h.mutante?.quellen} Quellen) — sie sieht den Herdfeuer-Punkt nicht`,
        ...masseUrteil(b),
        ...zuendungUrteil(b),
        ...lavaUrteil(b),
    ].filter(Boolean);
}

// (L1–L5) DAS URTEIL DER LAVA-LINSE (w28-lava-zuendet, `lavaSeite` im Lauf `--narbe`). Gemessen am Kopf 163a65de ↔ Mutante
// (Mess-Wiese, Null-Renderer; acht Nachbarinnen mit Bett, sechs Gras tZuend 533 K, zwei Laub 523 K; Decke 1 650 K, τ 13 957 s):
//   L1 — brennende Nachbarinnen nach EINEM Takt 8 von 8 Betten ↔ `_lavaZuendet` leer 0; die Decke 513 K (10 K unter dem Laub)
//   0, 543 K (10 K über dem Gras, Glut 0) 8: die Schwelle ist `tZuend` der Zeile, nicht das Glühen.
//   L2 — ROT am Kopf: je Kanten-Nachbarin 9 Eintritte, aber ALLE 1,99 m in der Zelle der Lava (der Boden der Suche), die Decke
//   dort bis 1: `_lavaTakt` zündet, bevor er die Decke malt (in den ersten 5 s keine Flamme in einer der vier Nachbarinnen). Malt
//   die Seite die Decke vor dem Zünden (nachgestellt, nicht Teil der Linse): Decke 0 an jedem, Lage −1,99 … 3,51 m, an 7 von 9
//   einen halben Meter einwärts Decke, Front nach 60 s längs jeder Kante 16 m (in der Nachbarin 5,75 gegen den Wind, sonst
//   15,5 … 16) ↔ `_brandFangen` ohne `ein`: 0 Eintritte, 1,75 … 9,25 m.
//   L3 — DAS BETT IST FLÄCHE, DIE LAST BLEIBT GANZ (w28-lava-nachlauf; bis dahin gab w28-lava-zuendet den Anteil als Last ins
//   Gesetz und die Linse verlangte es): die Probe-Zelle brennt voll und mit Stein auf ihrer rechten Hälfte bis zur Asche —
//   H·w und leb gleich, keine Flamme und keine Asche auf dem Stein ↔ leb × Anteil · ohne Maske (`_brandBettFn` leer).
//   L4 — 32 Punkte im dünnen Rand (Decke 0,043 … 0,962): Grund 0 ↔ die Decke dünnt nur: 0,038 … 0,957, 32 von 32 über 0.
//   L5 — nachts (Zeitplan des Herdfeuers × 45) EINE Quelle, Schein 6,777 … 7,918, Kern 8 m, kein Zeitplan, auf `a.y` ↔ das alte
//   Datum: 444 … 519, Kern 0,76 m, Zeitplan, 1 m darüber.
// so weit reicht die Front nach 60 s mindestens längs der Kante (m): die neun Eintritte decken die Kante der Zelle (15,96 m),
// der EINE Punkt trägt in 60 s seine Ellipse — das Band liegt zwischen den beiden gemessenen Ständen
const LAVA_RAND_M = 12;
// je Achtel der Kante ein Eintritt (`_lavaZuendet`)
const LAVA_EIN = 9;
function lavaUrteil(b) {
    const [z, k, s, h, q, u] = [b.l1, b.l2, b.l3, b.l4, b.l5, b.l6 || {}];
    const [ur, us] = [u.regler || {}, u.sprung || {}];
    const [km, qm, sv, sh] = [k.mutante, q.mutante, s.voll || {}, s.halb || {}];
    return [
        z.betten >= 1 && z.kalt?.tK < z.tZuend?.[0] && z.lau?.tK > z.tZuend?.[1] ? "" : `L1-LEER: keine Messung der Zündung: ${z.betten} Nachbarinnen der Decke tragen ein Bett, das sie zündet (Decke ${z.tK} K, tZuend ${z.tZuend}); die kalte Decke steht bei ${z.kalt?.tK} K, die laue bei ${z.lau?.tK} K`,
        z.brennend === z.betten ? "" : `L1-ZÜNDUNG: das Gras steht grün am Rand der heißen Decke: nach Guss und EINEM Takt (_lavaTakt) brennen ${z.brennend} von ${z.betten} Nachbarinnen mit Bett (Decke ${z.tK} K, tZuend ${z.tZuend} K) — stamm/siedlung-wege.js _lavaZuendet (aus _lavaTakt), der Akt „brand“ über _feldAkt`,
        z.kalt?.brennend === 0 ? "" : `L1-KALT: die Decke unter der Zünd-Temperatur zündet: ${z.kalt?.brennend} Nachbarinnen brennen bei ${z.kalt?.tK} K (tZuend ${z.tZuend} K) — stamm/siedlung-wege.js _lavaZuendet liest tZuend der Bett-Zeile nicht`,
        z.lau?.brennend === z.betten ? "" : `L1-LAU: die Decke über der Zünd-Temperatur zündet nicht: ${z.lau?.brennend} von ${z.betten} Nachbarinnen brennen bei ${z.lau?.tK} K (tZuend ${z.tZuend} K, Glut ${z.lau?.glut}) — stamm/siedlung-wege.js _lavaZuendet: die Schwelle ist nicht tZuend der Bett-Zeile`,
        z.mutante === 0 ? "" : `MUTANTE-L1: mit _lavaZuendet leer zählt die Linse ${z.mutante} brennende Nachbarinnen — sie zählt einen anderen Zünder`,
        k.kanten >= 1 && k.uhr >= 60 ? "" : `L2-LEER: keine Messung des Rands: ${k.kanten} Kanten-Nachbarinnen der Decke brennen, die Uhr des Brands lief ${k.uhr} s (verlangt 60)`,
        k.ein === LAVA_EIN ? "" : `L2-EIN: die Kanten-Nachbarin fängt an EINEM Punkt: ${k.ein} Eintritte (verlangt ${LAVA_EIN}) — stamm/siedlung-wege.js _lavaZuendet (akt.ein) oder stamm/feld-leben.js _feldAktWirkt → _brandFangen → _brandZuenden reichen „ein“ nicht durch`,
        k.decke === 0 ? "" : `L2-DECKE: die Eintritte liegen AUF der Decke: _lavaDeckeAt bis ${k.decke} an einem Eintritt (verlangt 0: dort endet die Decke), ihre Lage zur Kante ${k.tief} m${k.tief?.[1] < 0 ? " — alle am Boden der Suche, 2 m in der Zelle der Lava: _lavaZuendet las die Decke, bevor _lavaTakt sie malte (stamm/siedlung-wege.js _lavaTakt: zünden vor _deckeMalen)" : " — stamm/siedlung-wege.js _lavaZuendet (die Suche nach dem Ende der Decke)"}`,
        k.ein !== LAVA_EIN || k.amRand >= 5 ? "" : `L2-ABSEITS: die Eintritte liegen nicht am Rand der Decke: an ${k.amRand} von ${k.ein} trägt der Ort einen halben Meter einwärts Decke (verlangt ≥ 5; Lage zur Kante ${k.tief} m) — stamm/siedlung-wege.js _lavaZuendet`,
        k.spanne >= LAVA_RAND_M ? "" : `L2-SPANNE: der Rand zündet nicht auf seiner Länge: nach ${k.uhr} s reicht die Front längs der Kante ${k.spanne} m (verlangt ≥ ${LAVA_RAND_M} m; in der Nachbarin je Kante ${k.sicht}) — stamm/feld-leben.js _brandWeg (das Minimum über „ein“), Leser _brandFront`,
        km?.kanten >= 1 && km.einMax === 0 && km.spanneMax < LAVA_RAND_M ? "" : `MUTANTE-L2: ohne Eintritte (_brandFangen verwirft „ein“) liest die Linse ${km?.einMax} Eintritte und ${km?.spanneMax} m Front längs der Kante — sie sieht den EINEN Punkt nicht`,
        sv?.iw > 0 && sv.narbe?.[1] >= 0.5 && sh?.faengt && sh.gras >= 4 && sh.anteil >= 0.2 && sh.anteil <= 0.5 ? "" : `L3-LEER: keine Messung des Betts: die Probe-Zelle (${s.ort}) trägt ohne Eingriff H·w ${sv?.iw} und Asche ${sv?.narbe?.[1]} am Ort der Stein-Hälfte, mit Stein rechts der Mitte Anteil ${sh?.anteil}, gefangen ${sh?.faengt}, ${sh?.gras} Flammen auf dem Gras (verlangt ≥ 4)`,
        Math.abs(sh.iw - sh.iwSoll) <= 0.001 * sh.iwSoll && sh.leb === sh.aura ? "" : `L3-LAST: der Anteil des Betts geht als LAST ins Gesetz: mit Stein auf der halben Zelle H·w ${sh.iw} kJ/m² und leb ${sh.leb} statt ${sh.iwSoll} und ${sh.aura} des vollen Betts (Anteil ${sh.anteil}) — die Flamme auf dem Gras brennt kleiner; stamm/feld-brand.js _brandStoff (leb bleibt ganz)`,
        sh.stein === 0 ? "" : `L3-FLAMME: Flammen stehen auf dem Stein: ${sh.stein} Flammen-Lagen mehr als 1 m in der Stein-Hälfte der Zelle (${sh.gras} auf dem Gras) — stamm/feld-brand.js _brandBild liest das Bett nicht (_brandBettFn)`,
        sh.narbe?.[1] === 0 && sh.narbe[0] >= 0.5 ? "" : `L3-NARBE: die Asche liegt nicht auf dem Bett: nach dem Ausbrennen Asche ${sh.narbe?.[0]} auf dem Gras (verlangt ≥ 0,5) und ${sh.narbe?.[1]} auf dem Stein (verlangt 0) — stamm/feld-brand.js _brandFront · _brandZelle (die Maske der Tat)`,
        s.mutanteLast?.iw < 0.9 * s.mutanteLast?.iwSoll ? "" : `MUTANTE-L3-LAST: mit leb × Anteil (der Stand von w28-lava-zuendet) liest die Linse H·w ${s.mutanteLast?.iw} bei ${s.mutanteLast?.iwSoll} des vollen Betts — sie sieht die Last nicht`,
        s.mutanteFlaeche?.stein > 0 && s.mutanteFlaeche.narbe?.[1] >= 0.5 ? "" : `MUTANTE-L3-FLAECHE: ohne die Maske (_brandBettFn leer) zählt die Linse ${s.mutanteFlaeche?.stein} Flammen auf dem Stein und Asche ${s.mutanteFlaeche?.narbe?.[1]} dort — sie sieht den Stein nicht`,
        h.punkte >= 8 && h.aussen > 0 ? "" : `L4-LEER: keine Messung des Halms: ${h.punkte} Punkte im dünnen Rand der Decke (verlangt ≥ 8), der Grund der Wiese jenseits der Decke ${h.aussen}`,
        h.max === 0 ? "" : `L4-HALM: Büschel stehen im glühenden Rand: _wieseGrund bis ${h.max} an ${h.punkte} Punkten mit Decke ${h.decke} (verlangt 0) — stamm/vegetation-wiese.js _wieseGrund (die Decke dünnt nur)`,
        h.mutante?.max > 0 ? "" : `MUTANTE-L4: mit Gewicht × (1 − Decke) liest die Linse Grund ${h.mutante?.max} im Rand — sie sieht den Halm auf der Decke nicht`,
        q.quellen >= 1 && q.max > 0 && q.herd > 1 && q.glut > 0 && q.soll > 0 ? "" : `L5-LEER: keine Messung des Lichts: ${q.quellen} Leuchtquellen „lava“ (Schein ${q.max}, Glut ${q.glut}, Soll ${q.soll}), der Zeitplan des Herdfeuers steht bei ${q.herd} (verlangt > 1: die Nacht)`,
        !(q.max > NARBE_SCHEIN_MAX * q.soll) && q.zeit === 0 ? "" : `L5-SCHEIN: die Lava leuchtet über der Leuchtdichte ihrer Glut oder mit Zeitplan: Schein ${q.max} > ${scheinBand(q)[1]} (${NARBE_SCHEIN_MAX} × Soll ${q.soll} = π × glutLeuchtdichte(Ausbruch) ÷ EINHEIT_LX) oder Zeitplan an ${q.zeit} von ${q.quellen} Quellen (nachts, Kern ${q.kern} m) — stamm/dirigent-kern.js _leuchtQuellen (die Lava: _flammenLicht)`,
        !(q.max < NARBE_SCHEIN_MIN * q.soll) ? "" : `L5-DUNKEL: die Lava leuchtet nicht als Glut-Fläche: Schein ${q.max} < ${scheinBand(q)[0]} (${NARBE_SCHEIN_MIN} × Soll ${q.soll}; Glut ${q.glut}, Kern ${q.kern} m) — stamm/dirigent-kern.js _leuchtQuellen (die Lava)`,
        q.kern === q.kernSoll ? "" : `L5-KERN: das Licht der Lava trägt nicht die Fläche ihrer Zelle: Kern ${q.kern} m (verlangt ${q.kernSoll} m, die halbe Zelle) — stamm/dirigent-kern.js _leuchtQuellen (_flammenLicht(Zelle/2))`,
        q.hoch === 0 ? "" : `L5-HÖHE: das Licht der Lava steht ${q.hoch} m neben der Höhe ihrer Decke (verlangt a.y) — stamm/dirigent-kern.js _leuchtQuellen (die Lava)`,
        !!qm && ausserBand({ max: qm.max, soll: q.soll }) && qm.zeit >= 1 && qm.hoch > 0 && qm.kern !== q.kernSoll ? "" : `MUTANTE-L5: mit dem alten Datum (Herdfeuer × BRAND.licht, 1 m über der Mitte) liest die Linse Schein ${qm?.max} im Band ${scheinBand(q)}, Zeitplan an ${qm?.zeit}, Höhe ${qm?.hoch} m, Kern ${qm?.kern} m — sie sieht den Herdfeuer-Punkt nicht`,
        us.tempVor > 100 && us.s >= 60 ? "" : `L6-LEER: keine Messung der Uhr: die Decke steht vor dem Sprung bei ${us.tempVor} °C, der Sprung der Welt-Uhr ${us.s} s`,
        ur.dStunde === 0 && Math.abs(ur.dTemp) <= 1 && ur.dUhr === 0 && ur.dAschen === 0 ? "" : `L6-SICHT: die Uhr des Spielers bewegt einen Prozess: der Regler 10 → 14 Uhr stellt die Welt-Stunde um ${ur.dStunde} h, die Decke der Lava um ${ur.dTemp} K, die Welt-Uhr um ${ur.dUhr} s, ${ur.dAschen} Aschen (verlangt je 0; die Decke ± 1 K: sie steht in der Luft der Stunde) — stamm/feld-leben.js _weltTag liest den Tag der Sicht (worldMeta.tag + timeOfDay) oder stamm/bild-himmel.js _uhrSetzen hebt spielZeit`,
        Math.abs(us.dStunde - us.s / 150) <= 0.01 && us.tempNach < us.tempVor - 1 && us.dBrandUhr >= us.s - 1 && us.aschen >= 1 ? "" : `L6-SPRUNG: der Sprung der Welt-Uhr altert die Welt nicht: nach _weltUhrNimm(+${us.s} s) Welt-Stunde +${us.dStunde} h (verlangt ${us.s / 150}), Decke ${us.tempVor} → ${us.tempNach} °C (verlangt kälter), Uhr des Brands +${us.dBrandUhr} s, ${us.aschen} Aschen (verlangt ≥ 1) — stamm/feld-leben.js _weltTag · _lavaZustand, stamm/feld-brand.js _tickBrand`,
        us.leer === 0 ? "" : `L6-SCHLEIFE: der Brand holt den Sprung Takt um Takt: ${us.leer} von ${us.schritte} Schritten für ${us.s} s fallen im Sprung auf kein Ereignis (verlangt 0: jeder Schritt erreicht eine Ankunft oder das Ziel; ${us.zuend} Zündungen) — stamm/feld-brand.js _tickBrand (BRAND.sprungS, _brandNach)`,
        u.mutanteSicht?.regler?.dStunde >= 3.9 ? "" : `MUTANTE-L6-SICHT: mit dem Tag der Sicht in _weltTag liest die Linse nach dem Regler 10 → 14 Uhr ${u.mutanteSicht?.regler?.dStunde} h — sie sieht den Zwilling nicht`,
        u.mutanteSchleife?.sprung?.leer >= us.s / 2 ? "" : `MUTANTE-L6-SCHLEIFE: mit dem Schritt je schrittS zählt die Linse ${u.mutanteSchleife?.sprung?.leer} leere von ${u.mutanteSchleife?.sprung?.schritte} Schritten für ${us.s} s — sie sieht die Schleife nicht`,
    ];
}

async function narbeSeite(MESS) {
    const { pm, stehen, wort } = await window.__seite();
    const [C, P, L] = [AnazhRealm, Object.getPrototypeOf(r), (st.worldMeta.taten ||= [])];
    const [B, cs, n0] = [C.BRAND, C.LIFE_FIELD.cell, L.length];
    const r3 = (v) => Math.round(v * 1e3) / 1e3;
    const zelle = (x, z) => [Math.floor(x / cs), Math.floor(z / cs)];
    const bf = () => (st.brandFeld ||= new Map());
    const [hx, hz] = zelle(MESS.x, MESS.z);
    // die Ankunft der Ellipse einer brennenden Zelle an (x, z) in Sekunden nach ihrem Eintritt — aus ihren eigenen Feldern
    const zeit = (b, x, z) => (Math.hypot(x - b.ex, z - b.ez) - b.ecc * ((x - b.ex) * b.kopf[0] + (z - b.ez) * b.kopf[1])) / (b.R * (1 - b.ecc));
    const ecken = (b) => [0, 1].flatMap((i) => [0, 1].map((j) => [(b.cx + i) * cs, (b.cz + j) * cs]));
    const kopfS = (b) => Math.max(...ecken(b).map(([x, z]) => (x - b.ex) * b.kopf[0] + (z - b.ez) * b.kopf[1])) / b.R + b.tr;
    const dauer = (b) => ({ dauer: r3(b.ende - b.t0), ecken: r3(Math.max(...ecken(b).map(([x, z]) => zeit(b, x, z)))), kopf: r3(kopfS(b)), R: r3(b.R), ecc: r3(b.ecc) });
    const leer = () => {
        if (r._brandRest) r._brandArbeit(Infinity);
        bf().clear();
        L.length = n0;
        r._tatGen = (r._tatGen | 0) + 1;
        (st.wegeKarte ? st.wegeKarte.stufen : []).forEach((s) => s.zentriert && r._ascheStufeMalen(s));
    };
    const zuenden = () => (leer(), r._brandEntfachen(MESS.x, MESS.z), ((b) => (b && b.t0 !== null ? b : null))(bf().get(hx + "," + hz)));
    // EIN Schritt der Uhr des Brands samt seiner ganzen Arbeit (jede fällige Zelle fängt zu ihrer Ankunft)
    const schritt = () => {
        const u = r._brandUhr;
        for (let i = 0; i < 4000 && r._brandUhr === u && r._brandLebt(); i++) r._weltUhrNimm(u + B.schrittS), r._tickBrand();
        r._brandArbeit(Infinity);
        return r._brandUhr > u;
    };
    // die vier Zellen, deren Mitten die Narbe an (x, z) mischt (`_brandNarbeFn`); die früheste Front einer brennenden unter ihnen
    // an (x, z) als Uhr des Brands — NaN, wo eine der vier schon Asche trägt (dort liegt Asche zu Recht)
    const vier = (x, z, i = Math.floor(x / cs - 0.5), j = Math.floor(z / cs - 0.5)) => [[i, j], [i + 1, j], [i, j + 1], [i + 1, j + 1]];
    const ankunft = (x, z) =>
        vier(x, z).reduce((t, [cx, cz]) => {
            if (r._brandZelle(cx, cz)) return NaN;
            const q = bf().get(cx + "," + cz);
            return q && q.t0 !== null ? Math.min(t, q.t0 + zeit(q, x, z)) : t;
        }, Infinity);
    // der Ort der Herd-Zelle (je Meter), den die Fronten zuletzt erreichen → [Ankunft, x, z] — nur, wo die Narbe zu ≥ 0,9 die
    // Herd-Zelle liest (ihr Gewicht in `_brandNarbeFn`, um ihre Mitte): an der Ecke wiegt sie 0,35, dort trüge auch das Quadrat
    // der Zelle 0 (gemessen bei −287/−1055) und die Linse wäre blind für die Asche vor der Front
    const S = (t) => t * t * (3 - 2 * t);
    const gew = (v, h, f = v / cs - h) => (f >= 0.5 ? 1 - S(f - 0.5) : S(f + 0.5));
    const fernster = () => {
        let best = [-Infinity, 0, 0];
        for (let i = 1; i < cs; i++)
            for (let j = 1; j < cs; j++) {
                const [x, z] = [hx * cs + i, hz * cs + j];
                if (gew(x, hx) * gew(z, hz) < 0.9) continue;
                const t = ankunft(x, z);
                if (t > best[0]) best = [t, x, z];
            }
        return best;
    };
    const m = (n) => (n ? r3(n.m * n.asche) : 0);
    const [uhr, jahr] = [st.weatherEffectTime, st.autoSeason];
    const aus = {};
    try {
        st.weatherEffectTime = -1e9;
        st.autoSeason = false;
        r.setSeason("sommer");
        wort("cloudy");
        r._naesseTakt = () => (st.naesse = 0);
        st.naesse = 0;
        await stehen(MESS);
        r._feldFolgeSteht = () => true;
        r._feuchteAt = () => 0;
        r.setTimeOfDay(0.5, "regler");
        const b = zuenden();
        if (!b) return { fehler: `an der Mess-Wiese (${MESS.x}, ${MESS.z}) fing mit trockenem Bett kein Brand` };
        // N2: die Dauer der Herd-Zelle, wie sie fing
        const N2 = (aus.n2 = dauer(b));
        // N1: schreiten, solange die Herd-Zelle brennt und ihr fernster Ort ≥ 1 s vor jeder Front liegt
        while (r._brandUhr + B.schrittS - b.t0 <= 20 + 1e-9 && r._brandUhr + B.schrittS < b.ende && fernster()[0] > r._brandUhr + 2 * B.schrittS) if (!schritt()) break;
        const [fernAn, fx, fz] = fernster();
        const lesen = () => ({ zuend: m(r._brandNarbe(b.ex, b.ez)), fern: m(r._brandNarbe(fx, fz)) });
        const N1 = (aus.n1 = Object.assign(lesen(), {
            s: r3(r._brandUhr - b.t0),
            tr: r3(b.tr),
            brennt: b.t0 !== null && bf().get(hx + "," + hz) === b && !r._brandZelle(hx, hz),
            brennend: [...bf().values()].filter((q) => q.t0 !== null).length,
            fernOrt: [r3(fx), r3(fz)],
            fernAn: r3(fernAn - b.t0),
        }));
        r._brandFront = () => ({ asche: 1, busch: 0, wald: 0, front: () => 0 });
        N1.mutanteWartet = lesen();
        r._brandFront = () => ({ asche: 1, busch: 0, wald: 0 });
        N1.mutanteQuadrat = lesen();
        delete r._brandFront;
        // N3: EIN Bild des Brands, dann die Leuchtquellen, die das Licht liest, gegen die Flammen ihrer Zelle
        const bild = () => {
            r._bildZeit = 0;
            r._brandBild(0.1);
            const F = r._brandFlammen || [];
            const Q = r._leuchtQuellen(pm.x, pm.y, pm.z, 64).filter((q) => q.quelle === "brand");
            const R = { lichter: Q.length, flammen: F.length, gemessen: 0, max: 0, mitte: false };
            for (const q of Q) {
                const [cx, cz] = zelle(q.x, q.z);
                const d = Math.min(...F.filter((f) => Math.floor(f.x / cs) === cx && Math.floor(f.z / cs) === cz).map((f) => Math.hypot(f.x - q.x, f.z - q.z)));
                if (!Number.isFinite(d)) continue; // eine Zelle ohne Flamme im Bild (ihre Front verließ sie, der Deckel des Bilds)
                R.gemessen++;
                if (d >= R.max) [R.max, R.mitte] = [r3(d), Math.hypot(q.x - (cx + 0.5) * cs, q.z - (cz + 0.5) * cs) < 1e-6];
            }
            return R;
        };
        const N3 = (aus.n3 = bild());
        r._brandBild = function (dt) {
            P._brandBild.call(this, dt);
            for (const q of bf().glueht || []) (q.ort = null), this._brandOrt(q);
        };
        N3.mutante = bild();
        delete r._brandBild;
        bild();
        // N5: die Flammen der Herd-Zelle in demselben Bild, in ihrer Reihenfolge längs der Front: je Paar von Nachbarn ihr Abstand (xz)
        // und die volle Breite ihrer Zungen, gerechnet wie `_brandFlammenZeichnen` (2 × `breite` × Länge × rMax der Zunge des
        // Fachwerks, die Länge das Mittel des Paars); das Paar am Median des Verhältnisses trägt das Urteil
        const byram = (f) => 0.0775 * Math.pow(f.I, 0.46);
        const saum = () => {
            const Bb = C.BRAND.bild;
            const F = (r._brandFlammen || []).filter((f) => Math.floor(f.x / cs) === hx && Math.floor(f.z / cs) === hz);
            const rMax = Math.max(...globalThis.__fachwerkCore.FLAMME.zunge.map((p) => p[0]));
            const paare = F.slice(1).map((g, i) => [Math.hypot(g.x - F[i].x, g.z - F[i].z), Bb.breite * (byram(F[i]) + byram(g)) * rMax]);
            const [d, w] = rang(paare.sort((u, v) => u[0] / u[1] - v[0] / v[1]), 0.5) || [NaN, NaN];
            return { flammen: F.length, paare: paare.length, abstand: r3(d), breite: r3(w), mass: r3(d / w), weit: r3(1 + 1.25 * Bb.flamme.rausch[2]), minM: Bb.abstandMinM };
        };
        const N5 = (aus.n5 = saum());
        // die Mutante: die Tafel des Bilds mit dem Mindest-Abstand 0,5 m (der Stand bis w28-brand-saum)
        C.BRAND = Object.freeze({ ...B, bild: Object.freeze({ ...B.bild, abstandMinM: 0.5 }) });
        try {
            bild();
            N5.mutante = saum();
        } finally {
            C.BRAND = B;
        }
        bild();
        // N6: dieselben Flammen der Herd-Zelle, je Flamme ihre Länge im Bild je Byram-Länge ihrer Intensität (q = `f.lang` ÷
        // 0,0775·I^0,46); die Streuung von q über die Front. `uhr`: dieselbe Streuung 1,3 s Bild-Uhr später (nur gemeldet)
        const pulsen = () => {
            const q = (r._brandFlammen || []).filter((f) => Math.floor(f.x / cs) === hx && Math.floor(f.z / cs) === hz).map((f) => f.lang / byram(f));
            const mi = q.reduce((a, v) => a + v, 0) / Math.max(1, q.length);
            return { flammen: q.length, sigma: r3(Math.sqrt(q.reduce((a, v) => a + (v - mi) * (v - mi), 0) / Math.max(1, q.length))), min: r3(Math.min(...q)), max: r3(Math.max(...q)), puls: C.BRAND.bild.puls };
        };
        const N6 = (aus.n6 = pulsen());
        r._bildZeit = 1.3;
        r._brandBild(0.1);
        N6.uhr = pulsen().sigma;
        // die Mutante: die Tafel des Bilds ohne Puls (jede Zunge steht auf ihrer Byram-Länge)
        C.BRAND = Object.freeze({ ...B, bild: Object.freeze({ ...B.bild, puls: 0 }) });
        try {
            bild();
            N6.mutante = pulsen();
        } finally {
            C.BRAND = B;
        }
        bild();
        // N7: derselbe Brand NACHTS (die Uhr als Spieler-Wort auf 0 — `setTimeOfDay` wendet den Tag samt Belichtung an). Je
        // Leuchtquelle des Brands, frisch gelesen (`_leuchtQuellen`, nicht die Wahl des Pools) und über acht Bild-Uhren des
        // Flackerns: ihre Bestrahlung AN der Flamme; das Maximum trägt das Urteil. `herd`: der Zeitplan des
        // Herdfeuers zu dieser Uhr (die Nacht steht), `zeit`: die Quellen des Brands, die einen Zeitplan tragen
        // (licht-eine-skala P8: `_leuchtStaerke` trägt cd ÷ EINHEIT_LX × Masse, ohne π; das Soll AN der Fläche ist π × die
        // Leuchtdichte der Flamme ÷ EINHEIT_LX — fachwerk `FEUER_LEUCHTDICHTE`, die Einheit der EINEN Skala `__weltLicht`)
        const LGf = globalThis.__fachwerkCore.LICHT_GESETZ.feuer;
        const scheinSoll = (Math.PI * globalThis.__fachwerkCore.FEUER_LEUCHTDICHTE) / __weltLicht.EINHEIT_LX;
        const schein = () => {
            const bel = (st.renderer && st.renderer.toneMappingExposure) || 1;
            const Q = r._leuchtQuellen(pm.x, pm.y, pm.z, 64).filter((q) => q.quelle === "brand");
            const mass = (q, t, k = q.L.kernM) => (r._leuchtStaerke(q, t) * (1 + k * k)) / (k * k);
            const W = Q.flatMap((q) => [0, 0.37, 0.9, 1.3, 2.1, 3.3, 4.7, 6.1].map((t) => mass(q, t)));
            return { quellen: Q.length, max: r3(Math.max(0, ...W)), min: r3(Math.min(...W)), kern: r3(Math.max(0, ...Q.map((q) => q.L.kernM))), zeit: Q.filter((q) => q.L.zeit != null).length, herd: r3(r._lichtZeitplan(LGf.zeit)), belichtung: r3(bel), soll: r3(scheinSoll) };
        };
        const tagSchein = schein().max; // derselbe Brand am Mittag (die Uhr der Sitzung): das Licht der Flamme hängt nicht an der Stunde
        r.setTimeOfDay(0, "regler");
        const N7 = (aus.n7 = schein());
        N7.tag = tagSchein;
        // die Mutante „am Bild-Ton": die Masse ÷ Belichtung (der widerlegte Stand 63c7e567) — Tag und Nacht fallen auseinander
        const F0 = P._flammenLicht;
        const amTon = () => {
            r._flammenLicht = function (...a) {
                const F = F0.apply(this, a);
                return { L: F.L, masse: F.masse / ((st.renderer && st.renderer.toneMappingExposure) || 1) };
            };
            return schein().max;
        };
        try {
            N7.mutanteTon = { nacht: amTon(), tag: (r.setTimeOfDay(0.5, "regler"), amTon()) };
        } finally {
            delete r._flammenLicht;
            r.setTimeOfDay(0, "regler");
        }
        // die Mutante: der Brand als Herdfeuer-Punkt × `BRAND.licht` mit dem Datum des Feuers (Lichtstärke `cd`, Zeitplan; der
        // Stand bis w28-brand-nacht) — er steht außerhalb des Bands
        r._flammenLicht = () => ({ L: LGf, masse: C.BRAND.licht });
        try {
            N7.mutante = schein();
        } finally {
            delete r._flammenLicht;
            r.setTimeOfDay(0.5, "regler");
        }
        // N2, die Mutante: derselbe Herd, `ende` auf den Durchlauf des Kopfs gestutzt
        r._brandZuenden = function (...a) {
            const z = P._brandZuenden.apply(this, a);
            if (z) z.ende = z.t0 + kopfS(z);
            return z;
        };
        const bm = zuenden();
        delete r._brandZuenden;
        N2.mutante = bm ? dauer(bm) : null;
        leer();
        // N8 (front-brand · same.physik.reaktion#1) DIE MASSE BLEIBT — derselbe Herd, mit seinem Bett und mit halber Last (die Seite
        // reicht `leb` × ½ aus `_brandStoff`). DIE RECHNUNG DER LINSE: das Holz einer Zelle ist die Last ihrer Zeile × lebendig ×
        // Bett-Anteil × Zell-Fläche; verzehrt ist der Anteil ihres Betts, den ihre Front erreichte (die Ankunft der Ellipse an 256²
        // Punkten, gewichtet mit der Maske des Betts); der Strom des Rauchs zwischen zwei Uhren ist Holz × Δverzehrt × (1 − Mineral).
        // DIE FAHNE IN ECHTZEIT: 30 Bilder zu 0,1 s Welt-Uhr — die Summe der Masse `m` der dabei geborenen Ballen gegen diesen Strom,
        // ihre optische Masse τ·A (τ = −ln(1 − Deckung), A = π·r²/(profil + 1): das Maß, in dem `_rauchStoff` Deckung und Radius
        // liest) gegen `BRAND.partikel` km × Partikel-Masse, und 30 Bilder später dieselben Ballen: ihre optische Masse bleibt.
        const S_T = B.mineral.gesamt;
        const holzMerk = new Map();
        const holzSoll = (q) => {
            const k = q.cx + "," + q.cz;
            if (!holzMerk.has(k)) {
                const f = r._brandStoff(q.cx, q.cz, st.spielZeit);
                holzMerk.set(k, f ? f.zeile.brenn.last * Math.min(1, f.leb) * f.anteil * cs * cs : NaN);
            }
            return holzMerk.get(k);
        };
        const verzehrt = (q, t, N = 256) => {
            const bett = r._brandBettFn(q.bett, q.cx, q.cz);
            let [u, n] = [0, 0];
            for (let i = 0; i < N; i++)
                for (let j = 0; j < N; j++) {
                    const [x, z] = [(q.cx + (i + 0.5) / N) * cs, (q.cz + (j + 0.5) / N) * cs];
                    const w = bett ? bett(x, z) : 1;
                    n += w;
                    if (q.t0 + zeit(q, x, z) <= t) u += w;
                }
            return n > 0 ? u / n : 0;
        };
        const [W8, R8, P8] = [C.RAUCH_BILD, B.bild.rauch, B.partikel];
        const optisch = (p) => (-Math.log(1 - Math.min(W8.deckMax, p.a)) * Math.PI * (R8.size * p.s) ** 2) / (W8.profil + 1);
        // das Holz, das die Front der Zelle zwischen t1 und t2 verzehrte (kg): ihr Bett auf einem Gitter von N² Punkten ÜBER DEM BRAND
        // (das Quadrat um den Eintritt, so weit der Kopf lief — der junge Brand misst Dezimeter), gewogen mit der Maske des Betts
        const bettM2 = new Map();
        const verzehrtKg = (q, t1, t2, N = 384) => {
            const bett = r._brandBettFn(q.bett, q.cx, q.cz);
            const k = q.cx + "," + q.cz;
            if (!bettM2.has(k)) {
                let n = 0;
                for (let i = 0; i < 64 * 64; i++) n += bett ? bett((q.cx + ((i % 64) + 0.5) / 64) * cs, (q.cz + (Math.floor(i / 64) + 0.5) / 64) * cs) : 1;
                bettM2.set(k, (n / 4096) * cs * cs);
            }
            const reich = Math.max(0, t2 - q.t0) * q.R;
            const [xa, xb, za, zb] = [Math.max(q.cx * cs, q.ex - reich), Math.min((q.cx + 1) * cs, q.ex + reich), Math.max(q.cz * cs, q.ez - reich), Math.min((q.cz + 1) * cs, q.ez + reich)];
            if (!(xb > xa && zb > za)) return 0;
            let u = 0;
            for (let i = 0; i < N; i++)
                for (let j = 0; j < N; j++) {
                    const [x, z] = [xa + ((i + 0.5) / N) * (xb - xa), za + ((j + 0.5) / N) * (zb - za)];
                    const an = q.t0 + zeit(q, x, z);
                    if (an > t1 && an <= t2) u += bett ? bett(x, z) : 1;
                }
            return (holzSoll(q) * u * (xb - xa) * (zb - za)) / (N * N) / bettM2.get(k);
        };
        // DIE FAHNE im Fenster von 3 s: `dt` der Takt des Bilds, `fernM` der Abstand des Auges vom Herd (die Winkel-Zahl der Front
        // fällt mit ihm), `vor` die Schritte des Brands vor dem Fenster. `haelt` das Holz, das die Zellen am Ende für ihren nächsten
        // Ballen halten (`rauchKg`, abzüglich des Stands am Anfang) — die Masse der Fahne ist geborene + gehaltene
        const fahne = ({ dt = 0.1, fernM = 0, vor = 10 } = {}) => {
            for (let i = 0; i < vor; i++) schritt();
            const T = st.brandRauch.teilchen;
            const auge = st.camera ? st.camera.position : st.playerMesh.position;
            const merk = auge.clone();
            if (fernM) auge.set((hx + 0.5) * cs + fernM, auge.y, (hz + 0.5) * cs);
            const schuld = () => [...bf().values()].reduce((s, q) => s + (q.rauchKg || 0), 0) * (1 - S_T);
            // das Fenster beginnt mit einem ersten Bild: von ihm an zählt die Zelle ihr Holz an der Uhr der Welt (wie im Spiel, wo das
            // Bild den Brand von seinem Zünden an begleitet)
            const eins = () => (r._weltUhrNimm(st.spielZeit + dt), r._tickBrand(), r._brandArbeit(Infinity), (r._bildZeit = (r._bildZeit || 0) + dt), r._brandBild(dt));
            eins();
            T.length = st.brandRauch.n = 0;
            const [t1, gesehen, geboren, h1] = [st.spielZeit, new Set(), [], schuld()];
            const bilder = (n, zaehlen) => {
                for (let i = 0; i < n; i++) {
                    r._weltUhrNimm(st.spielZeit + dt);
                    r._tickBrand();
                    r._brandArbeit(Infinity);
                    r._bildZeit = (r._bildZeit || 0) + dt;
                    r._brandBild(dt);
                    if (zaehlen) for (const p of T) if (!gesehen.has(p)) (gesehen.add(p), geboren.push({ p, m: p.m, o: optisch(p) }));
                }
            };
            bilder(Math.round(3 / dt), true);
            const [Z, t2, haelt] = [[...bf().values()].filter((q) => q.t0 !== null), st.spielZeit, schuld() - h1];
            const strom = Z.reduce((s, q) => s + verzehrtKg(q, t1, t2) * (1 - S_T), 0);
            bilder(Math.round(3 / dt), false);
            auge.copy(merk);
            const lebt = geboren.filter((g) => T.includes(g.p));
            const sum = (G, f) => G.reduce((s, g) => s + f(g), 0);
            const masse = sum(geboren, (g) => g.m) + haelt;
            return {
                haelt: r3(haelt),
                zellen: Z.length,
                ballen: geboren.length,
                strom: r3(strom),
                masse: Number.isFinite(masse) ? r3(masse) : null,
                optisch: r3(sum(geboren, (g) => g.o)),
                soll: P8 ? r3((P8.km * P8.jeKg * strom) / (1 - S_T)) : null,
                lebt: lebt.length,
                erhalt: lebt.length ? r3(sum(lebt, (g) => optisch(g.p)) / sum(lebt, (g) => g.o)) : null,
            };
        };
        const b8 = zuenden();
        if (!b8) return { fehler: "N8: an der Mess-Wiese fing kein Brand" };
        const holz8 = holzSoll(b8);
        const buch8 = (t) => ((m) => ({ holz: r3(m.holz), brannte: r3(m.brannte), asche: r3(m.asche), rauch: r3(m.rauch) }))(r._brandMasse(b8, t));
        const tm8 = (b8.t0 + b8.ende) / 2;
        const N8 = (aus.n8 = {
            soll: r3(holz8),
            mineral: S_T,
            kg: Number.isFinite(b8.kg) ? r3(b8.kg) : null,
            buch: typeof r._brandMasse === "function" ? { mitte: buch8(tm8), ende: buch8(b8.ende) } : null,
            mitteSoll: r3(holz8 * verzehrt(b8, tm8)),
            fahne: { voll: fahne() },
        });
        // der Herd brennt ALLEIN aus (seine Nachbarinnen fangen nicht — die Asche einer Zelle hängt nicht an ihnen): EIN Schritt des
        // Gesetzes an sein Ende (`_brandSchritt`, die Uhr der Welt bleibt), seine Tat `brand` trägt die Asche
        r._brandZuenden = function (cx, cz, ...a) {
            if (cx === hx && cz === hz) return P._brandZuenden.call(this, cx, cz, ...a);
            bf().delete(cx + "," + cz);
            return null;
        };
        let tat8 = null;
        try {
            const ba = zuenden();
            if (ba) (r._brandSchritt(ba.ende + B.schrittS), r._brandArbeit(Infinity));
            tat8 = L.slice(n0).find((a) => a.tat === "brand" && Math.floor(a.x / cs) === hx && Math.floor(a.z / cs) === hz);
        } finally {
            delete r._brandZuenden;
        }
        N8.ausgebrannt = !!tat8;
        N8.tat = tat8 && Number.isFinite(tat8.kg) ? tat8.kg : null;
        // derselbe Herd mit halber Last
        r._brandStoff = function (...a) {
            const f = P._brandStoff.apply(this, a);
            return f ? { ...f, leb: f.leb * 0.5 } : f;
        };
        try {
            holzMerk.clear();
            N8.fahne.halb = zuenden() ? fahne() : null;
        } finally {
            delete r._brandStoff;
        }
        // die Mutante: die Deckung des Ballens ohne seine Masse (der Stand bis front-brand: `a0` × b0 ÷ s)
        r._brandRauch = function (dt, q, w) {
            P._brandRauch.call(this, dt, q, w);
            for (const p of st.brandRauch.teilchen) p.a = (0.5 * p.b0) / p.s;
        };
        try {
            holzMerk.clear();
            N8.mutante = zuenden() ? fahne() : null;
        } finally {
            delete r._brandRauch;
        }
        leer();
        // N4: der Bauer des Chunk-Bodens baut seinen Stoff frisch; der Kern der Seite zählt die Abrufe der Asche-Zeile
        const bauen = () => {
            const [K, alt] = [globalThis.__schmiedeCore, st.voxelChunkMaterial];
            const SG = K.STOFF_GESETZ;
            let [n, neu] = [0, null];
            const zaehler = Object.create(SG, { zeile: { value: (name) => ((n += name === "asche"), SG.zeile(name)) } });
            globalThis.__schmiedeCore = Object.create(K, { STOFF_GESETZ: { value: zaehler } });
            try {
                if (globalThis.__schmiedeCore.STOFF_GESETZ !== zaehler) throw new Error("der Kern der Seite nimmt den Zähler nicht");
                st.voxelChunkMaterial = null;
                neu = r._getVoxelChunkMaterial();
            } finally {
                globalThis.__schmiedeCore = K;
                st.voxelChunkMaterial = alt;
                if (neu && neu !== alt && neu.dispose) neu.dispose();
            }
            return { abrufe: n, gebaut: !!neu && neu !== alt };
        };
        const N4 = (aus.n4 = bauen());
        try {
            N4.rauheit = globalThis.__schmiedeCore.STOFF_GESETZ.zeile("asche").rauheit;
        } catch (e) {
            N4.rauheit = "keine Zeile";
        }
        r._wegeBodenFarbe = function (T, vc, a) {
            const v = P._wegeBodenFarbe.call(this, T, vc, a);
            if (a) delete a.asche;
            return v;
        };
        N4.mutante = bauen().abrufe;
        delete r._wegeBodenFarbe;
        // N8, die Fahne hängt nie am Bild: das Auge 100 m ab · das Bild in 250 ms · die ersten 3 s des Brands
        holzMerk.clear();
        N8.fahne.fern = zuenden() ? fahne({ fernM: 100 }) : null;
        N8.fahne.lahm = zuenden() ? fahne({ dt: 0.25 }) : null;
        N8.fahne.jung = zuenden() ? fahne({ vor: 0 }) : null;
        // N9 (front-brand, BRAND-ZÜNDUNG) DIE ZÜNDUNG LIEST, WAS SICH ÄNDERT — gezählt an der Seite: die Märsche durch die Säule
        // (`_voxelSurfaceY`) unter EINEM frischen `_brandStoff` der Herd-Zelle, und die Streu-Kacheln, die der Neubau der Wiese
        // in den ersten zwölf Schritten des Brands fallen lässt. Die Mutante ist der Stand 8e2d76d1: das Gefälle aus zwei
        // weiteren Märschen (Zell-Mitte + ½ Zelle je Achse), der Neubau über der Zelle ±½.
        const gezaehlt = (name, fn) => {
            const [eigen, alt] = [Object.prototype.hasOwnProperty.call(r, name), r[name]];
            let n = 0;
            r[name] = function (...a) {
                n++;
                return alt.apply(this, a);
            };
            try {
                fn();
            } finally {
                if (eigen) r[name] = alt;
                else delete r[name];
            }
            return n;
        };
        const zuendung = () => {
            leer();
            r._brandBett = null;
            let f = null;
            const maersche = gezaehlt("_voxelSurfaceY", () => (f = r._brandStoff(hx, hz, st.spielZeit)));
            leer();
            // der Neubau über die ersten zwölf Schritte des Brands (die Asche wächst mit der Front, je Zelle fällt er höchstens alle
            // `BRAND.wieseS`): je Schritt die Streu-Kacheln, die er fallen lässt; das Maß sind die Kacheln JE Neubau (die zweite
            // Zündung brennt auf der Asche der ersten und baut seltener — die Summe trüge die Zahl der Neubauten mit)
            const je = [];
            r._brandEntfachen(MESS.x, MESS.z);
            for (let i = 0; i < 12; i++) je.push(gezaehlt("_nahStreuKachelFaellt", schritt));
            const bau = je.filter(Boolean);
            const wiese = bau.length ? Math.round((10 * bau.reduce((a, b) => a + b, 0)) / bau.length) / 10 : 0;
            return { bett: f ? f.anteil : 0, maersche, wiese, neubauten: bau.length, je };
        };
        const N9 = (aus.n9 = { echt: zuendung() });
        // FELD: die Märsche unter EINEM `_terrainMaterialAt` mit Höhe an der Mess-Wiese — gezählt mit der Feuchte der WELT (die
        // Bühne der Narbe hält sie sonst auf 0); die Mutante: die Feuchte ohne gereichte Oberfläche, sie marschiert selbst
        const feldY = r._voxelSurfaceY(MESS.x, MESS.z);
        const feldMarsch = (feuchte) => {
            const buehne = r._feuchteAt;
            if (feuchte) r._feuchteAt = feuchte;
            else delete r._feuchteAt;
            try {
                return gezaehlt("_voxelSurfaceY", () => r._terrainMaterialAt(MESS.x, MESS.z, feldY));
            } finally {
                r._feuchteAt = buehne;
            }
        };
        N9.echt.feld = feldMarsch(null);
        r._brandStoff = function (cx, cz, ...a) {
            const neu = !(this._brandBett && this._brandBett.has(cx + "," + cz));
            const f = P._brandStoff.call(this, cx, cz, ...a);
            if (neu && f) (this._voxelSurfaceY(f.x + cs / 2, f.z), this._voxelSurfaceY(f.x, f.z + cs / 2));
            return f;
        };
        r._nahRingNeuIn = function (x0, z0, x1, z1) {
            const [cx, cz] = zelle((x0 + x1) / 2, (z0 + z1) / 2);
            return P._nahRingNeuIn.call(this, (cx - 0.5) * cs, (cz - 0.5) * cs, (cx + 1.5) * cs, (cz + 1.5) * cs);
        };
        try {
            N9.mutante = zuendung();
        } finally {
            delete r._brandStoff;
            delete r._nahRingNeuIn;
        }
        N9.mutante.feld = feldMarsch(function (x, z) {
            return P._feuchteAt.call(this, x, z);
        });
        leer();
        return aus;
    } finally {
        for (const k of ["_naesseTakt", "_feuchteAt", "_feldFolgeSteht", "_brandFront", "_brandBild", "_brandZuenden", "_wegeBodenFarbe", "_flammenLicht", "_brandStoff", "_brandRauch"]) delete r[k];
        leer();
        st.weatherEffectTime = uhr;
        st.autoSeason = jahr;
    }
}

// (L1–L5) DIE LAVA ZÜNDET IHREN RAND (w28-lava-zuendet, im Lauf `--narbe` NACH N1–N7 auf derselben Seite: Null-Renderer, Mess-Wiese,
// Sommer, trockenes Bett). Der Guss ist der Schreib-Akt des Spiels (`_lavaGiessen` auf die Mitte der Mess-Zelle), danach EIN Takt
// der Lava (`_lavaTakt`, wie `_tickWegeKarte` ihn ruft) — kein zweiter Takt, keine Hilfe der Probe. Jede Probe räumt hinter sich
// auf (`leer`: die Taten der Probe fallen, das Brand-Feld leert, Asche- und Lava-Decke der Kronen-Karte malen neu).
async function lavaSeite(MESS) {
    const { stehen, wort } = await window.__seite();
    const [C, P, L] = [AnazhRealm, Object.getPrototypeOf(r), (st.worldMeta.taten ||= [])];
    const [B, cs, n0] = [C.BRAND, C.LIFE_FIELD.cell, L.length];
    const r3 = (v) => Math.round(v * 1e3) / 1e3;
    const bf = () => (st.brandFeld ||= new Map());
    const [hx, hz] = [Math.floor(MESS.x / cs), Math.floor(MESS.z / cs)];
    const [mx, mz] = [(hx + 0.5) * cs, (hz + 0.5) * cs];
    const NB = [-1, 0, 1].flatMap((dz) => [-1, 0, 1].map((dx) => [dx, dz])).filter(([dx, dz]) => dx || dz);
    const KANTEN = NB.filter(([dx, dz]) => !dx !== !dz);
    const brennt = (dx, dz) => ((q) => (q && q.t0 !== null ? q : null))(bf().get(hx + dx + "," + (hz + dz)));
    const leer = () => {
        if (r._brandRest) r._brandArbeit(Infinity);
        bf().clear();
        L.length = n0;
        r._tatGen = (r._tatGen | 0) + 1;
        r._brandBett = null;
        for (const s of st.wegeKarte ? st.wegeKarte.stufen : []) if (s.zentriert) r._ascheStufeMalen(s), r._lavaStufeMalen(s);
        r._lavaTaktT = -Infinity;
    };
    // EIN Guss auf die Mitte der Mess-Zelle, `alterS` Sekunden alt (ihre Welt-Stunde `h` zurückgestellt), und EIN Takt der Lava
    const giessen = (alterS = 0) => {
        leer();
        const a = r._lavaGiessen(mx, mz);
        a.h -= alterS / 3600;
        r._lavaTaktT = -Infinity;
        r._lavaTakt(performance.now());
        return a;
    };
    // EIN Schritt der Uhr des Brands samt seiner ganzen Arbeit (wie N1)
    const schritt = () => {
        const u = r._brandUhr;
        for (let i = 0; i < 4000 && r._brandUhr === u && r._brandLebt(); i++) r._weltUhrNimm(u + B.schrittS), r._tickBrand();
        r._brandArbeit(Infinity);
        return r._brandUhr > u;
    };
    const [uhr, jahr] = [st.weatherEffectTime, st.autoSeason];
    const aus = {};
    try {
        st.weatherEffectTime = -1e9;
        st.autoSeason = false;
        r.setSeason("sommer");
        wort("cloudy");
        r._naesseTakt = () => (st.naesse = 0);
        st.naesse = 0;
        await stehen(MESS);
        r._feldFolgeSteht = () => true;
        r._feuchteAt = () => 0;
        r.setTimeOfDay(0.5, "regler");
        leer();
        if (!st.wegeKarte || !st.wegeKarte.stufen.some((s) => s.zentriert)) return { fehler: "die Wege-Karte der Seite steht nicht (keine zentrierte Stufe): die Decke der Lava hat keinen Ort" };

        // L3 — DAS BETT IST FLÄCHE (vor jedem Guss): die erste Nachbarin der Mess-Zelle mit Bett; `voll`: ihr Brand ohne Eingriff,
        // `halb`: mit Stein rechts ihrer Mitte (`_kontaktStoffAt` für x > Mitte ersetzt — auch die Nachbarinnen dort tragen kein Bett).
        const pi = NB.findIndex(([dx, dz]) => r._brandStoff(hx + dx, hz + dz));
        if (pi < 0) return { fehler: `keine Nachbarin der Mess-Zelle (${hx}, ${hz}) trägt ein Bett` };
        const [pcx, pcz] = [hx + NB[pi][0], hz + NB[pi][1]];
        const [px, pz] = [(pcx + 0.5) * cs, (pcz + 0.5) * cs];
        // EIN Brand der Probe-Zelle bis zu ihrer Asche: sie fängt ein Viertel links ihrer Mitte (auf dem Gras), je Schritt der Uhr
        // EIN Bild — `gras`/`stein`: Flammen-Lagen der Zelle mehr als 1 m links/rechts ihrer Mitte, `iw` ihr H·w, `narbe`: die
        // Asche (`_brandNarbe`: m × asche) ein Viertel links und rechts der Mitte nach dem Ausbrennen (aus ihrer Tat)
        const brand = () => {
            leer();
            // `aura`/`iwSoll`: das Leben der Zelle und ihr H·w aus der Zeile des Betts, in DIESEM Brand gelesen (jeder Brand hebt
            // „lebendig“ — über zwei Brände hinweg verglichen meldete die Probe sich selbst)
            const aura = r.auraAt(px, pz).lebendig;
            const f = r._brandStoff(pcx, pcz);
            const o = { leb: f ? r3(f.leb) : null, aura: r3(aura), iwSoll: f ? r3((f.zeile.brenn.heiz / 1000) * f.zeile.brenn.last * Math.min(1, aura)) : null, anteil: f ? r3(f.anteil) : null, faengt: !!(f && r._brandFangen(px - cs / 4, pz)), gras: 0, stein: 0 };
            const z = bf().get(pcx + "," + pcz);
            if (!o.faengt || !z) return o;
            [o.iw, o.R] = [r3(z.iw), r3(z.R)];
            for (o.s = 0; o.s < 900 && bf().get(pcx + "," + pcz) === z && schritt(); o.s++) {
                r._brandBild(0);
                for (const q of (r._brandFlammen || []).filter((q) => Math.floor(q.x / cs) === pcx && Math.floor(q.z / cs) === pcz))
                    q.x > px + 1 ? o.stein++ : q.x < px - 1 ? o.gras++ : 0;
            }
            r._brandArbeit(Infinity);
            const nar = (x) => ((n) => (n ? r3(n.m * n.asche) : 0))(r._brandNarbe(x, pz));
            o.narbe = [nar(px - cs / 4), nar(px + cs / 4)];
            return o;
        };
        const L3 = (aus.l3 = { ort: [px, pz], voll: brand() });
        r._kontaktStoffAt = function (x, z, y) {
            return x > px ? "stein" : P._kontaktStoffAt.call(this, x, z, y);
        };
        L3.halb = brand();
        // die Mutanten: der Anteil geht als Last ins Gesetz (der Stand von w28-lava-zuendet) · keine Maske (Flamme und Asche auf
        // der ganzen Zelle)
        r._brandStoff = function (cx, cz) {
            const f = P._brandStoff.call(this, cx, cz);
            return f && f.anteil < 1 && !f.mutiert ? Object.assign(f, { leb: f.leb * f.anteil, mutiert: true }) : f;
        };
        L3.mutanteLast = brand();
        delete r._brandStoff;
        r._brandBettFn = () => null;
        L3.mutanteFlaeche = brand();
        delete r._brandBettFn;
        delete r._kontaktStoffAt;
        leer();

        // L1 — DIE ZÜNDUNG: nach Guss und EINEM Takt brennen von den acht Nachbarinnen genau die mit Bett, deren Zeile unter der
        // Decke zündet (`tZuend` < Temperatur der Decke). `kalt`/`lau`: dieselbe Decke 10 K unter der kleinsten / über der größten
        // Zünd-Temperatur ihrer Betten (das Alter aus dem Gang des Kerns: τ · ln((T₀ − T_Luft)/(T − T_Luft)), `_lavaZustand` liest nach).
        const a = giessen();
        const Z = r._lavaZustand(a);
        const [tK, tu] = [Z.temperatur + 273.15, r._temperaturAt(a.y, 0) + 273.15];
        const zaehlen = () => NB.filter(([dx, dz]) => brennt(dx, dz)).length;
        const betten = NB.map(([dx, dz]) => r._brandStoff(hx + dx, hz + dz)).filter(Boolean);
        const zuend = betten.map((f) => f.zeile.tZuend);
        const L1 = (aus.l1 = { brennend: zaehlen(), betten: betten.filter((f) => tK > f.zeile.tZuend).length, tK: r3(tK), tZuend: [Math.min(...zuend), Math.max(...zuend)], tau: r3(Z.tau) });

        // L4 — KEIN HALM AUF DER DECKE: gleich nach dem Takt (die Decke ist gemalt, keine Front lief), je Viertelmeter auf den vier
        // Achsen aus der Mitte der Decke: wo 0 < `_lavaDeckeAt` < 1 (ihr dünner Rand), ist `_wieseGrund` (gruen 1) 0. `aussen`: der
        // kleinste Grund 2 m jenseits ihres Endes je Achse (dort steht Wiese — die Probe ist nicht blind).
        const [rand, draussen] = [[], []];
        for (const [dx, dz] of KANTEN) {
            let ende = false;
            for (let d = 0; d <= 1.5 * cs; d += 0.25) {
                const [x, z] = [mx + dx * d, mz + dz * d];
                const dk = r._lavaDeckeAt(x, z);
                if (dk > 0 && dk < 1) rand.push([x, z, dk]);
                if (dk === 0 && d > cs / 4 && !ende) (ende = true), draussen.push([x + dx * 2, z + dz * 2]);
            }
        }
        const grund = (Q) => Q.map(([x, z]) => r._wieseGrund(x, z, r._voxelSurfaceY(x, z), 1));
        const L4 = (aus.l4 = { punkte: rand.length, max: r3(Math.max(-1, ...grund(rand))), decke: [r3(Math.min(...rand.map((q) => q[2]))), r3(Math.max(...rand.map((q) => q[2])))], aussen: draussen.length === 4 ? r3(Math.min(...grund(draussen))) : 0, asche: r3(Math.max(0, ...rand.map(([x, z]) => r._ascheAt(x, z)))) });
        // die Mutante: die Decke dünnt nur (Gewicht × (1 − Decke), der Stand bis w28-lava-zuendet)
        r._wieseGrund = function (x, z, y, g) {
            const dk = P._lavaDeckeAt.call(this, x, z);
            this._lavaDeckeAt = () => 0;
            try {
                return P._wieseGrund.call(this, x, z, y, g) * (1 - dk);
            } finally {
                delete this._lavaDeckeAt;
            }
        };
        L4.mutante = ((h) => ({ max: r3(Math.max(-1, ...h)), ueber0: h.filter((v) => v > 0).length }))(grund(rand));
        delete r._wieseGrund;

        // L2 — DER RAND ZÜNDET AUF SEINER LÄNGE: je Kanten-Nachbarin, die brennt, ihre Eintritte (`ein`): ihre Zahl, die Decke AN
        // jedem (`decke`, das Maximum: 0 = jeder liegt, wo die Decke endet), wie viele einen halben Meter einwärts Decke tragen
        // (`amRand`), ihre Lage zur gemeinsamen Kante (`tief`, m nach außen). Dann 60 s Uhr des Brands: `spanne` = wie weit die
        // Front (`_brandFront(b).front` > 0) längs der Kante reicht, im Streifen von 2 m einwärts bis 4 m auswärts der Kante (dort
        // sucht `_lavaZuendet` das Ende der Decke), das Minimum über die Kanten-Nachbarinnen. Nur gemeldet: `sicht` (dieselbe
        // Spanne nur IN der Nachbarin, je Kante) und `flammen` (ihre Flammen im Bild `_brandBild`, je Kante).
        const kante = (dx, dz) => [(hx + (dx > 0 ? 1 : 0)) * cs, (hz + (dz > 0 ? 1 : 0)) * cs];
        const spanne = (dx, dz, von, bis) => {
            const [b, [kx, kz]] = [brennt(dx, dz), kante(dx, dz)];
            if (!b) return 0;
            const front = r._brandFront(b).front;
            let [lo, hi] = [Infinity, -Infinity];
            for (let o = von; o <= bis; o += 0.25)
                for (let s = 0.125; s < cs; s += 0.25) if (front(dx ? kx + dx * o : hx * cs + s, dz ? kz + dz * o : hz * cs + s) > 0) [lo, hi] = [Math.min(lo, s), Math.max(hi, s)];
            return hi >= lo ? hi - lo + 0.25 : 0;
        };
        const randLauf = () => {
            const K = KANTEN.filter(([dx, dz]) => brennt(dx, dz));
            const E = K.map(([dx, dz]) => {
                const [e, [kx, kz]] = [brennt(dx, dz).ein || [], kante(dx, dz)];
                const P2 = [...Array(e.length / 2)].map((_, i) => [e[2 * i], e[2 * i + 1]]);
                return { n: P2.length, decke: Math.max(0, ...P2.map(([x, z]) => r._lavaDeckeAt(x, z))), amRand: P2.filter(([x, z]) => r._lavaDeckeAt(x - dx * 0.5, z - dz * 0.5) > 0).length, tief: P2.map(([x, z]) => (dx ? (x - kx) * dx : (z - kz) * dz)) };
            });
            // je Schritt gelesen, das Maximum über den Lauf: eine Nachbarin, die vor den 60 s ausbrennt, verlässt das Feld — am
            // Ende gelesen trug sie Spanne 0 (die Röte der Probe an w28-lava-nachlauf, als das volle Bett schneller ausbrannte)
            const [u0, sp, si] = [r._brandUhr, K.map(() => 0), K.map(() => 0)];
            const lesen = () => K.forEach(([dx, dz], i) => ((sp[i] = Math.max(sp[i], spanne(dx, dz, -cs / 8 - 0.25, cs / 4 + 0.25))), (si[i] = Math.max(si[i], spanne(dx, dz, 0.25, cs - 0.25)))));
            lesen();
            while (K.length && r._brandUhr - u0 < 60 - 1e-9) {
                if (!schritt()) break;
                lesen();
            }
            r._bildZeit = 0;
            r._brandBild(0.1);
            const fl = ([dx, dz]) => (r._brandFlammen || []).filter((f) => Math.floor(f.x / cs) === hx + dx && Math.floor(f.z / cs) === hz + dz).length;
            const tief = E.flatMap((e) => e.tief);
            return { kanten: K.length, ein: Math.min(...E.map((e) => e.n)), einMax: Math.max(0, ...E.map((e) => e.n)), decke: r3(Math.max(0, ...E.map((e) => e.decke))), amRand: Math.min(...E.map((e) => e.amRand)), tief: tief.length ? [r3(Math.min(...tief)), r3(Math.max(...tief))] : null, uhr: r3(r._brandUhr - u0), spanne: Math.min(...sp), spanneMax: Math.max(0, ...sp), sicht: si, flammen: K.map(fl) };
        };
        const L2 = (aus.l2 = randLauf());
        // die Mutante: `_brandFangen` verwirft die Eintritte (die Nachbarin fängt an dem EINEN Punkt ex/ez)
        r._brandFangen = function (x, z) {
            return P._brandFangen.call(this, x, z);
        };
        giessen();
        L2.mutante = randLauf();
        delete r._brandFangen;

        // L1, die Mutante (`_lavaZuendet` leer: der Takt malt, nichts fängt) und die Gegenproben kalt und lau
        r._lavaZuendet = () => 0;
        giessen();
        L1.mutante = zaehlen();
        delete r._lavaZuendet;
        const alter = (TK) => Z.tau * Math.log((tK - tu) / (TK - tu));
        const gegen = (TK, g = giessen(alter(TK))) => ({ brennend: zaehlen(), tK: r3(r._lavaZustand(g).temperatur + 273.15), glut: r3(r._lavaZustand(g).glut) });
        L1.kalt = gegen(L1.tZuend[0] - 10);
        L1.lau = gegen(L1.tZuend[1] + 10);

        // L5 — DAS LICHT DER LAVA: NACHTS gegossen (die Uhr zuerst: das Alter der Decke hängt an der Welt-Stunde), die Quelle
        // `lava`, die das Licht liest (`_leuchtQuellen` um die Decke): ihr Schein AN der Decke im Maß von N7 (`_leuchtStaerke` ×
        // (1 + k²)/k², das Maximum über acht Bild-Uhren), ihr Kern, ihr Zeitplan, ihre Höhe über `a.y`; das Soll π × die
        // Leuchtdichte des schwarzen Körpers am Ausbruch (fachwerk `glutLeuchtdichte`, `_lavaSpanne()[1]`) ÷ EINHEIT_LX × Glut
        const LGf = globalThis.__fachwerkCore.LICHT_GESETZ.feuer;
        r.setTimeOfDay(0, "regler");
        const an = giessen();
        const lavaSoll = (Math.PI * globalThis.__fachwerkCore.glutLeuchtdichte(r._lavaSpanne()[1])) / __weltLicht.EINHEIT_LX;
        const schein = () => {
            const Q = r._leuchtQuellen(an.x, an.y + 1.8, an.z, 64).filter((q) => q.quelle === "lava");
            const mass = (q, t, kk = q.L.kernM) => (r._leuchtStaerke(q, t) * (1 + kk * kk)) / (kk * kk);
            const W = Q.flatMap((q) => [0, 0.37, 0.9, 1.3, 2.1, 3.3, 4.7, 6.1].map((t) => mass(q, t)));
            const glut = r._lavaZustand(an).glut;
            return { quellen: Q.length, max: r3(Math.max(0, ...W)), min: r3(Math.min(...W)), kern: r3(Math.max(0, ...Q.map((q) => q.L.kernM))), kernSoll: cs / 2, zeit: Q.filter((q) => q.L.zeit != null).length, hoch: r3(Math.max(-99, ...Q.map((q) => Math.abs(q.y - an.y)))), herd: r3(r._lichtZeitplan(LGf.zeit)), glut: r3(glut), soll: r3(lavaSoll * glut) };
        };
        const L5 = (aus.l5 = schein());
        // die Mutante: das alte Datum der Lava (der Herdfeuer-Punkt × `BRAND.licht` × Glut mit Zeitplan, 1 m über ihrer Mitte)
        r._leuchtQuellen = function (...arg) {
            return P._leuchtQuellen.apply(this, arg).map((q) => (q.quelle === "lava" ? Object.assign(q, { L: LGf, masse: C.BRAND.licht * this._lavaZustand(q.id).glut, y: q.y + 1 }) : q));
        };
        L5.mutante = schein();
        delete r._leuchtQuellen;
        // L6 — DIE UHR DES SPIELERS IST SICHT, DER SPRUNG DER WELT-UHR IST GESCHLOSSEN: Guss und 30 s Brand; `regler`: die Uhr des
        // Spielers 10 → 14 Uhr (und zurück) — Welt-Stunde, Temperatur der Decke, Welt-Uhr und Aschen um 0. `sprung`: die Welt-Uhr
        // `s` Sekunden vor (`_weltUhrNimm`, wie der geladene Stand und der Mitspieler), der Takt des Brands, bis er steht — die
        // Welt-Stunde um s ÷ 150, die Decke kälter, die Uhr des Brands um s, in `schritte` Schritten (`_brandSchritt`) bei `zuend` Zündungen (`_brandZuenden`).
        const UHR_S = 600;
        const uhrLauf = () => {
            r.setTimeOfDay(10 / 24, "regler");
            const g = giessen();
            for (let i = 0; i < 30; i++) schritt();
            const stand = () => ({ h: r._weltStunde(), T: r._lavaZustand(g).temperatur, z: st.spielZeit, u: r._brandUhr, a: L.length - n0 });
            const s0 = stand();
            r.setTimeOfDay(14 / 24, "regler"), r._tickBrand();
            const s1 = stand();
            r.setTimeOfDay(10 / 24, "regler"), r._tickBrand();
            let [n, takte, zuend, leer] = [0, 0, 0, 0];
            r._brandZuenden = function (...a) {
                zuend++;
                return P._brandZuenden.apply(this, a);
            };
            const lauf = r._tickBrand;
            // `leer`: die Schritte IM SPRUNG (die Welt-Uhr lag mehr als `sprungS` vor), die auf kein Ereignis fallen — keine wartende
            // Zelle, deren Ankunft der Schritt erreicht, und nicht das Ziel. Bis hier verglich die Linse alle Schritte mit den
            // Zündungen (≤ Zündungen + 2): ein kleiner Brand (die Herde äst die Mess-Wiese, 59 statt 119 Zündungen) trug dort die
            // Ankünfte, die die Feuchte löscht, und den Schwanz unter `sprungS` (Schritt um Schritt, wie jedes Bild) als „Schleife“.
            let vor = r._brandUhr;
            r._brandSchritt = function (t, ...a) {
                n++;
                const rueck = st.spielZeit - vor;
                vor = t;
                if (rueck > B.sprungS + 1e-9 && st.spielZeit - t >= B.schrittS - 1e-9 && ![...bf().values()].some((z) => z.t0 === null && z.an <= t + 1e-9)) leer++;
                return P._brandSchritt.call(this, t, ...a);
            };
            const s2 = stand();
            vor = r._brandUhr;
            r._weltUhrNimm(st.spielZeit + UHR_S);
            for (; takte < 50000 && r._brandLebt() && (st.spielZeit - r._brandUhr >= B.schrittS - 1e-9 || r._brandRest); takte++) lauf.call(r);
            delete r._brandSchritt;
            delete r._brandZuenden;
            const s3 = stand();
            return { regler: { dStunde: r3(s1.h - s0.h), dTemp: r3(s1.T - s0.T), dUhr: r3(s1.z - s0.z), dAschen: s1.a - s0.a }, sprung: { s: UHR_S, dStunde: r3(s3.h - s2.h), tempVor: r3(s2.T), tempNach: r3(s3.T), dBrandUhr: r3(s3.u - s2.u), schritte: n, leer, zuend, takte, aschen: s3.a - s2.a, brennt: [...bf().values()].filter((q) => q.t0 !== null).length } };
        };
        const L6 = (aus.l6 = uhrLauf());
        // die Mutanten: der Tag der Sicht in `_weltTag` (der Stand bis w28-lava-nachlauf) · der Schritt je `schrittS` (ebenso)
        r._weltTag = function () {
            const w = this.state.worldMeta;
            return ((w && w.tag) || 0) + (this.state.timeOfDay || 0);
        };
        L6.mutanteSicht = uhrLauf();
        delete r._weltTag;
        r._tickBrand = function () {
            const f = this.state.brandFeld;
            const frist = performance.now() + B.budgetMs;
            while (f && this._brandArbeit(frist) && f.size && this.state.spielZeit - this._brandUhr >= B.schrittS - 1e-9) this._brandSchritt((this._brandUhr += B.schrittS));
        };
        L6.mutanteSchleife = uhrLauf();
        delete r._tickBrand;
        return aus;
    } finally {
        for (const k of ["_weltTag", "_tickBrand", "_brandSchritt", "_brandZuenden", "_naesseTakt", "_feuchteAt", "_feldFolgeSteht", "_kontaktStoffAt", "_lavaZuendet", "_brandFangen", "_wieseGrund", "_lavaDeckeAt", "_leuchtQuellen"]) delete r[k];
        r.setTimeOfDay(0.5, "regler");
        leer();
        st.weatherEffectTime = uhr;
        st.autoSeason = jahr;
    }
}

if (SELBSTTEST) {
    console.log("=== STAND-TAKT — Selbsttest (ohne Browser) ===");
    selbsttest();
    // die Tat-, Nachwuchs-, Brand- und Sukzessions-Linse: je Linse ihr grüner Befund und je Täter [Name, Pfad, Wert, …] — der Befund
    // mit den Werten an den Pfaden nennt den Namen zuerst, ein leerer Befund LEER
    const falsch = (U, gruen, T) =>
        [["", gruen], ["LEER", {}], ...T.map(([n, ...pw]) => {
            const b = jsonKlon(gruen);
            for (let i = 0; i < pw.length; i += 2) ((p) => (p.slice(0, -1).reduce((x, k) => x[k], b)[p.at(-1)] = pw[i + 1]))(pw[i].split("."));
            return [n, b];
        })]
            .filter(([n, b]) => (alsSelbsttest(() => U(b)).join() + "|").split(":")[0] !== (n || "|"))
            .map(([n]) => n || "GRÜN");
    selbsttestEnde(
        [
            ...falsch(tatUrteil, { gefaellt: 10, gepflueckt: 30, baeumeVorher: 12, stunde: { baeume: 2, pflanzen: 0, stuempfe: 10, narbe: -0.2 } }, [["NARBE", "stunde.narbe", 0], ["STUMPF", "stunde.stuempfe", 0], ["ERNTE", "stunde.pflanzen", 9], ["BAUM", "stunde.baeume", 12], ["LEER", "gefaellt", 3]]),
            ...falsch(nachwuchsUrteil, { echt: { n: 40, da: 40, jahr: 8760, r: 1, offen: 9, rOffen: 1, quote: 2 }, mutante: { rOffen: 0, quote: 1 } }, [["JAHR", "echt.da", 9], ["KORRELATION", "echt.r", 0], ["FEUCHTE", "echt.quote", 1], ["MUTANTE", "mutante.quote", 2]]),
            ...falsch(
                brandUrteil,
                {
                    halt: { brannte: 9, wasser: 0, nass: 3, fels: 4, wasserGebrannt: 0, nassGebrannt: 0 },
                    haltM: { nassGebrannt: 2, nass: 0, wasser: 1, wasserGebrannt: 0 },
                    regen: { brannte: 2, s: 20 },
                    regenM: { s: 300 },
                    leser: { licht: 1, rauch: 1, flammen: 40, lang: 2.4, deckung: 0.97, glutD: 0, glutF: 256 },
                    leserM: { licht: 0, rauch: 0, flammen: 0, glutF: 0 },
                    leserD: { deckung: 0.3 },
                    kante: { n: 300, achse: 0.2, linie: 3.1 },
                    kanteM: { n: 280, achse: 0.95, linie: 0.3 },
                    asche: { vor: { halme: 40 }, asche: { a: 1 }, gras: { a: 0 }, mutante: { halme: 40 } },
                    zeit: { brennend: 2000, bildMs: 0.3, verzugS: 1.1, schirmMs: 0.6 },
                },
                [["HALT", "halt.nass", 0], ["HALT-BRUCH", "halt.nassGebrannt", 1], ["MUTANTE-HALT", "haltM.nassGebrannt", 0], ["FLUSS", "halt.wasser", 0, "haltM.wasser", 0], ["FELS", "halt.fels", 0], ["REGEN", "regen.s", 196], ["MUTANTE-REGEN", "regenM.s", 20], ["LESER", "leser.rauch", 0], ["LESER", "leser.flammen", 0], ["MUTANTE-LESER", "leserM.licht", 1], ["DECKUNG", "leser.deckung", 0.5], ["MUTANTE-DECKUNG", "leserD.deckung", 0.95], ["KANTE", "kante.achse", 0.9], ["KANTE", "kante.linie", 0.4], ["MUTANTE-KANTE", "kanteM.achse", 0.2], ["ASCHE", "asche.asche.a", 0.9], ["GRÜNT", "asche.gras.a", 0.5], ["MUTANTE-ASCHE", "asche.mutante.halme", 20], ["ZEIT", "zeit.bildMs", 2], ["ZEIT", "zeit.verzugS", 9], ["SCHIRM", "zeit.schirmMs", 4]]
            ),
            ...falsch(
                sukzessionUrteil,
                {
                    asche: { vor: { halme: 40, kraut: 6 }, asche: { voll: 0.8, halmeVoll: 0, krautVoll: 0 }, gras: { halme: 38, kraut: 1 }, busch: { kraut: 6 } },
                    naehr: { ernte: { n: 5, N0: 1, N: 0.9, W0: 0.8, W: 0.78 }, asche: 1.4, leichnam: 1.2, mutante: { W0: 0.8, W: 0.8 } },
                    saemling: {
                        stufen: [0, 0.06, 0.18, 0.4, 1].map((v) => ({ alter: v, skala: v })),
                        gestalt: [[4, 600], [8, 2100]],
                        mutante: [[8, 2100], [8, 2100]],
                    },
                    wald: { vor: 6, brand: 0, jung: 5, heil: 6 },
                },
                [["ASCHE", "asche.asche.halmeVoll", 30], ["GRAS", "asche.gras.kraut", 6], ["BUSCH", "asche.busch.kraut", 1], ["ERNTE", "naehr.ernte.N", 1], ["RÜCKGABE", "naehr.asche", 1], ["MUTANTE-NÄHRSTOFF", "naehr.mutante.W", 0.7], ["SÄMLING", "saemling.stufen.0.alter", 0.5], ["SÄMLING", "saemling.stufen.2.skala", 1], ["GESTALT", "saemling.gestalt.0.0", 8], ["MUTANTE-GESTALT", "saemling.mutante.0.1", 600], ["WALD", "wald.brand", 2]]
            ),
            // die Narbe-Linse (`--narbe`): der grüne Befund der Mess-Wiese und je Fall sein Täter — die Zahlen der Täter sind die
            // des Stands vor w28-brand-bild (die brennende Zelle trägt 0, das Ende am Kopf, das Licht über der Mitte, kein Abruf)
            ...falsch(
                narbeUrteil,
                {
                    n1: { zuend: 1, fern: 0, s: 20, tr: 6.6, brennt: true, brennend: 4, fernOrt: "fern", fernAn: 41.2, mutanteWartet: { zuend: 0, fern: 0 }, mutanteQuadrat: { zuend: 1, fern: 0.9 } },
                    n2: { dauer: 52.4, ecken: 45.8, kopf: 31.5, mutante: { dauer: 31.5, ecken: 45.8, kopf: 31.5 } },
                    n3: { lichter: 4, flammen: 60, gemessen: 4, max: 0, mitte: false, mutante: { lichter: 4, flammen: 60, gemessen: 4, max: 5.3, mitte: true } },
                    n4: { abrufe: 1, gebaut: true, rauheit: 0.96, mutante: 0 },
                    n5: { flammen: 27, paare: 26, abstand: 0.427, breite: 0.36, mass: 1.187, weit: 2, minM: 0.2, mutante: { flammen: 22, paare: 21, abstand: 1.123, breite: 0.702, mass: 1.6, weit: 2, minM: 0.5 } },
                    n6: { flammen: 27, sigma: 0.246, min: 0.652, max: 1.35, puls: 0.35, uhr: 0.259, mutante: { flammen: 27, sigma: 0, min: 1, max: 1, puls: 0 } },
                    n7: { quellen: 4, max: 3.2, min: 2.3, tag: 3.2, mutanteTon: { nacht: 2.1, tag: 6.3 }, kern: 2, zeit: 0, herd: 45, belichtung: 1.5, soll: 2.929, mutante: { quellen: 4, max: 0.012, min: 0.008, kern: 0.76, zeit: 4, herd: 45, belichtung: 1.5, soll: 2.929 } },
                    // die Masse (N8): die Zahlen der Mess-Wiese am Kopf front-brand, die Mutante mit der Deckung ohne Masse
                    n8: { soll: 33.349, mineral: 0.0555, kg: 33.349, buch: { mitte: { holz: 33.349, brannte: 23.318, asche: 1.294, rauch: 22.024 }, ende: { holz: 33.349, brannte: 33.349, asche: 1.851, rauch: 31.498 } }, mitteSoll: 23.3, fahne: { voll: { haelt: 0, zellen: 2, ballen: 54, strom: 1.146, masse: 1.152, optisch: 88.045, soll: 87.578, lebt: 47, erhalt: 1 }, halb: { haelt: 0.007, zellen: 1, ballen: 32, strom: 0.195, masse: 0.196, optisch: 14.45, soll: 14.895, lebt: 25, erhalt: 1 }, fern: { haelt: 0, zellen: 2, ballen: 65, strom: 1.148, masse: 1.151, optisch: 87.968, soll: 87.735, lebt: 61, erhalt: 1 }, lahm: { haelt: 0, zellen: 2, ballen: 28, strom: 1.162, masse: 1.194, optisch: 91.258, soll: 88.813, lebt: 28, erhalt: 1 }, jung: { haelt: 0, zellen: 1, ballen: 9, strom: 0.298, masse: 0.302, optisch: 23.082, soll: 22.793, lebt: 9, erhalt: 1 } }, ausgebrannt: true, tat: 1.851, mutante: { haelt: 0, zellen: 2, ballen: 61, strom: 1.149, masse: 1.157, optisch: 130.799, soll: 87.834, lebt: 43, erhalt: 1.548 } },
                    // die Zündung (N9): die Zahlen der Mess-Wiese, die Mutante im Stand 8e2d76d1
                    n9: { echt: { bett: 1, maersche: 1, wiese: 36, neubauten: 4, feld: 1 }, mutante: { bett: 1, maersche: 3, wiese: 60.3, neubauten: 3, feld: 2 } },
                    // die Lava-Linse (L1–L5): die Zahlen der Mess-Wiese; `l2` im Stand, in dem die Decke vor dem Zünden gemalt ist
                    l1: { brennend: 8, betten: 8, tK: 1650, tZuend: [523, 533], tau: 13956.667, mutante: 0, kalt: { brennend: 0, tK: 513, glut: 0 }, lau: { brennend: 8, tK: 543, glut: 0 } },
                    l2: { kanten: 4, ein: 9, einMax: 9, decke: 0, amRand: 7, tief: [-1.99, 3.51], uhr: 60, spanne: 16, spanneMax: 16, sicht: [5.75, 15.5, 16, 15.5], flammen: [24, 41, 18, 151], mutante: { kanten: 4, ein: 0, einMax: 0, decke: 0, amRand: 0, tief: null, uhr: 60, spanne: 1.75, spanneMax: 9.25, sicht: [4.75, 9.25, 9.25, 1.75], flammen: [19, 22, 19, 16] } },
                    l3: { ort: "probe", voll: { leb: 0.802, aura: 0.802, iwSoll: 4200, anteil: 1, faengt: true, gras: 400, stein: 380, iw: 4200, R: 0.076, s: 250, narbe: [1, 1] }, halb: { leb: 0.802, aura: 0.802, iwSoll: 4200, anteil: 0.5, faengt: true, gras: 400, stein: 0, iw: 4200, R: 0.076, s: 250, narbe: [1, 0] }, mutanteLast: { leb: 0.401, aura: 0.802, iwSoll: 4200, anteil: 0.5, faengt: true, gras: 300, stein: 0, iw: 2100, R: 0.04, s: 400, narbe: [1, 0] }, mutanteFlaeche: { leb: 0.802, aura: 0.802, iwSoll: 4200, anteil: 0.5, faengt: true, gras: 400, stein: 380, iw: 4200, R: 0.076, s: 250, narbe: [1, 1] } },
                    l4: { punkte: 32, max: 0, decke: [0.043, 0.962], aussen: 1, asche: 0, mutante: { max: 0.957, ueber0: 32 } },
                    l5: { quellen: 1, max: 7.4, min: 5.6, kern: 8, kernSoll: 8, zeit: 0, hoch: 0, herd: 45, glut: 1, soll: 6.495, mutante: { quellen: 1, max: 0.03, min: 0.02, kern: 0.76, kernSoll: 8, zeit: 1, hoch: 1, herd: 45, glut: 1, soll: 6.495 } },
                    l6: { regler: { dStunde: 0, dTemp: 0, dUhr: 0, dAschen: 0 }, sprung: { s: 600, dStunde: 4, tempVor: 1377, tempNach: 900, dBrandUhr: 600, schritte: 30, leer: 0, zuend: 110, takte: 40, aschen: 35 }, mutanteSicht: { regler: { dStunde: 4, dTemp: -400, dUhr: 0, dAschen: 0 } }, mutanteSchleife: { sprung: { schritte: 600, leer: 500 } } },
                },
                [["N1-LEER", "n1.brennt", false], ["N1-LEER", "n1.s", 3], ["N1-LEER", "n1.fernAn", 12], ["N1-WARTET", "n1.zuend", 0], ["N1-QUADRAT", "n1.fern", 0.9], ["MUTANTE-N1-WARTET", "n1.mutanteWartet.zuend", 1], ["MUTANTE-N1-QUADRAT", "n1.mutanteQuadrat.fern", 0], ["N2-ENDE", "n2.dauer", 31.5], ["MUTANTE-N2", "n2.mutante.dauer", 52.4], ["MUTANTE-N2", "n2.mutante", null], ["N3-LEER", "n3.gemessen", 0], ["N3-LICHT", "n3.max", 5.3, "n3.mitte", true], ["MUTANTE-N3", "n3.mutante.max", 0], ["N4-LEER", "n4.gebaut", false], ["N4-ZEILE", "n4.abrufe", 0], ["MUTANTE-N4", "n4.mutante", 1], ["N5-LEER", "n5.paare", 2], ["N5-LEER", "n5.mass", null], ["N5-SAUM", "n5.mass", 1.6, "n5.abstand", 1.123, "n5.breite", 0.702], ["MUTANTE-N5", "n5.mutante.mass", 1.187], ["MUTANTE-N5", "n5.mutante.paare", 2], ["MUTANTE-N5", "n5.mutante", null], ["N6-LEER", "n6.flammen", 3], ["N6-LEER", "n6.sigma", null], ["N6-BAND", "n6.sigma", 0, "n6.min", 1, "n6.max", 1], ["MUTANTE-N6", "n6.mutante.sigma", 0.246], ["MUTANTE-N6", "n6.mutante.flammen", 3], ["MUTANTE-N6", "n6.mutante", null], ["N7-UHR", "n7.tag", 16], ["MUTANTE-N7-TON", "n7.mutanteTon.tag", 2.2], ["N7-LEER", "n7.quellen", 0], ["N7-LEER", "n7.herd", 1], ["N7-SCHEIN", "n7.max", 460], ["N7-SCHEIN", "n7.zeit", 4], ["N7-DUNKEL", "n7.max", 1], ["MUTANTE-N7", "n7.mutante.max", 3.2], ["MUTANTE-N7", "n7.mutante.zeit", 0], ["MUTANTE-N7", "n7.mutante", null],
                    // die Täter der Masse (N8): der Stand von main 9502aa0e — die Zelle ohne Masse, das Gesetz ohne Buch, die Tat ohne
                    // Asche, die Ballen ohne Masse (optische Masse 219,31 m² bei 1,223 kg Strom; im Steigen × 1,575, halbe Last × 1,704)
                    ["N8-LEER", "n8.fahne.voll.ballen", 0], ["N8-LEER", "n8.ausgebrannt", false], ["N8-LEER", "n8.fahne.halb", null], ["N8-HOLZ", "n8.kg", null], ["N8-HOLZ", "n8.kg", 66.7], ["N8-BILANZ", "n8.buch", null], ["N8-BILANZ", "n8.buch.ende.rauch", 33.349], ["N8-BILANZ", "n8.buch.mitte.brannte", 33.349], ["N8-ASCHE", "n8.tat", null], ["N8-ASCHE", "n8.tat", 0],
                    ["N8-RAUCH", "n8.fahne.voll.masse", null], ["N8-DECKUNG", "n8.fahne.voll.optisch", 219.31], ["N8-ERHALT", "n8.fahne.voll.erhalt", 1.575], ["N8-RAUCH", "n8.fahne.halb.masse", null], ["N8-DECKUNG", "n8.fahne.halb.optisch", 27.067], ["N8-ERHALT", "n8.fahne.halb.erhalt", 1.704], ["N8-PROPORTIONAL", "n8.fahne.voll.optisch", 94.5, "n8.fahne.halb.optisch", 13.6], ["MUTANTE-N8", "n8.mutante.erhalt", 1], ["MUTANTE-N8", "n8.mutante", null],
                    // die Fahne am Bild (der Stand von 44d954be2: der Strom in den Winkeln des Bilds, die Masse im Takt des Bilds): das Auge
                    // 100 m ab trug 0,884 von 1,135 kg, das Bild in 250 ms 0,435 von 1,134 kg
                    ["N8-BILD", "n8.fahne.fern.masse", 0.884], ["N8-BILD", "n8.fahne.lahm.masse", 0.435], ["N8-BILD", "n8.fahne.fern", null], ["N8-BILD", "n8.fahne.jung", null],
                    // die Täter der Zündung (N9): der Stand 8e2d76d1 — drei Märsche je Zündung, der Neubau über der Zelle ±½
                    ["N9-LEER", "n9", null], ["N9-LEER", "n9.echt.wiese", 0], ["N9-LEER", "n9.echt.bett", 0], ["N9-SÄULE", "n9.echt.maersche", 3], ["N9-WIESE", "n9.echt.wiese", 100], ["MUTANTE-N9", "n9.mutante.maersche", 1],
                    // der Stoff des Felds marschiert zweimal (der Stand bis front-brand); die Linse, die das nicht zählt
                    ["N9-FELD", "n9.echt.feld", 2], ["N9-FELD", "n9.echt.feld", undefined], ["MUTANTE-N9", "n9.mutante.feld", 1],
                    // die Täter der Lava-Linse: je Fall der Stand vor w28-lava-zuendet (L2-DECKE: der Kopf 163a65de — alle Eintritte 2 m in der Zelle der Lava)
                    ["LEER", "l3", null], ["L1-LEER", "l1.betten", 0, "l1.brennend", 0], ["L1-LEER", "l1.kalt.tK", 600], ["L1-LEER", "l1.lau", null], ["L1-ZÜNDUNG", "l1.brennend", 0], ["L1-ZÜNDUNG", "l1.brennend", 5], ["L1-KALT", "l1.kalt.brennend", 8], ["L1-LAU", "l1.lau.brennend", 0], ["MUTANTE-L1", "l1.mutante", 8], ["L2-LEER", "l2.kanten", 0], ["L2-LEER", "l2.uhr", 12], ["L2-EIN", "l2.ein", 0], ["L2-DECKE", "l2.decke", 1, "l2.tief", [-1.99, -1.99]], ["L2-DECKE", "l2.decke", 0.3], ["L2-ABSEITS", "l2.amRand", 0], ["L2-SPANNE", "l2.spanne", 9.25], ["MUTANTE-L2", "l2.mutante.einMax", 9], ["MUTANTE-L2", "l2.mutante.spanneMax", 16], ["MUTANTE-L2", "l2.mutante", null], ["L3-LEER", "l3.voll", null], ["L3-LEER", "l3.voll.narbe", [1, 0]], ["L3-LEER", "l3.halb.faengt", false], ["L3-LEER", "l3.halb.gras", 2], ["L3-LEER", "l3.halb.anteil", 1], ["L3-LAST", "l3.halb.iw", 2100, "l3.halb.leb", 0.401], ["L3-LAST", "l3.halb.leb", 0.401], ["L3-FLAMME", "l3.halb.stein", 25], ["L3-NARBE", "l3.halb.narbe", [1, 0.946]], ["L3-NARBE", "l3.halb.narbe", [0, 0]], ["MUTANTE-L3-LAST", "l3.mutanteLast.iw", 4200], ["MUTANTE-L3-LAST", "l3.mutanteLast", null], ["MUTANTE-L3-FLAECHE", "l3.mutanteFlaeche.stein", 0], ["MUTANTE-L3-FLAECHE", "l3.mutanteFlaeche.narbe", [1, 0]], ["MUTANTE-L3-FLAECHE", "l3.mutanteFlaeche", null], ["L4-LEER", "l4.punkte", 0], ["L4-LEER", "l4.aussen", 0], ["L4-HALM", "l4.max", 0.957], ["MUTANTE-L4", "l4.mutante.max", 0], ["MUTANTE-L4", "l4.mutante", null], ["L5-LEER", "l5.quellen", 0], ["L5-LEER", "l5.herd", 1], ["L5-SCHEIN", "l5.max", 519.05], ["L5-SCHEIN", "l5.zeit", 1], ["L5-DUNKEL", "l5.max", 1], ["L5-KERN", "l5.kern", 0.76], ["L5-HÖHE", "l5.hoch", 1], ["MUTANTE-L5", "l5.mutante.max", 6.5], ["MUTANTE-L5", "l5.mutante.zeit", 0], ["MUTANTE-L5", "l5.mutante.hoch", 0], ["MUTANTE-L5", "l5.mutante", null],
                    ["L6-LEER", "l6.sprung.tempVor", 20], ["L6-SICHT", "l6.regler.dStunde", 4], ["L6-SICHT", "l6.regler.dTemp", -400], ["L6-SICHT", "l6.regler.dUhr", 600], ["L6-SPRUNG", "l6.sprung.dStunde", 0], ["L6-SPRUNG", "l6.sprung.tempNach", 1377], ["L6-SPRUNG", "l6.sprung.dBrandUhr", 0], ["L6-SCHLEIFE", "l6.sprung.leer", 1], ["MUTANTE-L6-SICHT", "l6.mutanteSicht.regler.dStunde", 0], ["MUTANTE-L6-SICHT", "l6.mutanteSicht", null], ["MUTANTE-L6-SCHLEIFE", "l6.mutanteSchleife.sprung.leer", 0],
                ]
            ),
        ],
        "die Tat-, Nachwuchs-, Brand-, Sukzessions-, Narbe- und Lava-Linse nennen jeden Täter."
    );
    process.exit(0);
}

const PORT = Number(process.env.STAND_TAKT_PORT) || 4528;
const { messort } = require("./lib/welt-orte.cjs");
const MESS = messort("wiese");
const server = statikServer();
const TAT = process.argv.includes("--tat");
const NACHWUCHS = process.argv.includes("--nachwuchs");
const BRANDLAUF = process.argv.includes("--brand");
const NARBE = process.argv.includes("--narbe");
// `--narbe` (Lehre 9): ROT ist Exit 1, jeder Absturz — der Boot, die Seite, ein Wurf im Urteil — ist Exit 2, nie ein stilles Grün
const absturz = (e) => (console.error("❌ NARBE ABSTURZ (Exit 2) — " + (e && e.stack ? e.stack : e)), process.exit(2));
if (NARBE) process.on("unhandledRejection", absturz).on("uncaughtException", absturz);

(async () => {
    console.log("=== STAND-TAKT (Welle K) — Null-Renderer, Mess-Wiese, die Stand-Linse je Frame ===");
    // der Fern-Ring (die Saum-Wache) läuft auch ohne GPU — sein Haken; kein Start-Dorf (was es baut, hinge an der Bildrate): die
    // Ankunft trägt ihren Dorf-Zug (`server.zeige`, haushalt genesis)
    const { browser, page } = await nullWelt(server, { port: PORT, frist: 600000, vor: () => (window.__anazhFernRing = true) }, 120000, "index.html", "networkidle0"); // prettier-ignore
    page.setDefaultTimeout(580000);
    let befund = null;
    try {
        await warteAufWelt(page, 120000);
        await page.evaluate(STAND.STAND_INSTALL + require("./lib/kamera-nah.cjs").KAMERA_NAH_INSTALL + BUEHNE);
        if (TAT) befund = await tatLauf(page);
        else if (NACHWUCHS) befund = await page.evaluate(tatSeite, MESS, { ufer: true });
        else if (BRANDLAUF) befund = await page.evaluate(brandSeite, MESS);
        else if (NARBE) {
            // die Lava-Linse (L1–L5) auf derselben Seite NACH der Narbe: ihr Befund steht, bevor der erste Guss fällt
            befund = await page.evaluate(narbeSeite, MESS);
            if (befund && !befund.fehler) Object.assign(befund, await page.evaluate(lavaSeite, MESS));
        }
        else befund = await page.evaluate(
            async (MESS, TAKTE) => {
                const P = Object.getPrototypeOf(r);
                let t = performance.now();
                const takt = () => {
                    t += 1000 / 60;
                    // ein Takt, der wirft, ist ein Befund (PAGE-ERROR im Urteil), nie still
                    try {
                        r._gameLoopTick(t);
                    } catch (e) {
                        const tf = window.__standTaktFehler || (window.__standTaktFehler = []);
                        if (tf.length < 5) tf.push("Takt: " + String(e?.stack || e).split("\n")[0]);
                    }
                };
                // Der Regler hält (die Mess-Bühne, wie `werkbank stand --regler voll`): headless folgt der Cull-Radius dem
                // PID Frame für Frame ohne die Grenzzyklus-Wand des Spiels (`_nexusPerfActuate`) — ein atmender Radius ist
                // eine echte Eingabe der Wache (er weckt sie, Phase W prüft es), aber kein Stand.
                st.perfRegulator = false;
                // Das Jahr hält (wie die Sim-Ruhe unten): die Jahres-Uhr ist eine Eingabe — sie treibt die Schneegrenze, und ihr
                // Schritt um 2 m (`_schneeTakt`) bestellt den Fern-Ring neu (`_fernRingNeuBestellen`: der Saum ruht, bis der Faden
                // ihn ganz neu legte). Er fällt zu fester Spielzeit nach der Bühne (Sommer-Mitte 0,375 → 0,3807, ~820 Takte, dann
                // alle ~1 850), in welche Phase, hängt an den Takten der Fäden: z154 (CI 41387513274, beide Versuche) traf er die
                // Täter-Phase, der neue Ring überschrieb den verstellten Saum-Punkt, ehe die Wache ihn ging (TREUE-TÄTER deckWache,
                // 216/248 statt 51 Frames). Ihr Wecken prüft die Sim-Phase (WS saison, das Wort).
                st.autoSeason = false;
                st.playerMesh.position.set(MESS.x, r._voxelSurfaceY(MESS.x, MESS.z) + 1.8, MESS.z);
                // einschwingen: die Welt steht (A9, das EINE Einschwingen, welt-boot `__weltStehtNach`: Chunks, die Foundry, der Wald
                // samt seinen Pflanz-Gängen — K69: solange er plant, weckt seine Regung die Fege-Takte)
                await __weltStehtNach(takt);
                // (WN) DAS WASSERNETZ AM BACH STEHT (wetter.K3): je Takt das Netz jedes Chunks binnen 96 m um den Bach nächst der
                // Mess-Wiese (`_wasserNetz`, das Wasser, das Körper und Nah-Wiese lesen) — nach dem Stand 600 Takte ohne Wechsel;
                // die Mutante: der Pegel pendelt je Sekunde der Welt-Uhr (sein Takt, `_pegelUhr`) zwischen Ruhe und Krone
                const Wn = { takte: 600, wechsel: 0 };
                for (const B of (await window.__seite()).fluss(MESS).slice(0, 1)) {
                    Wn.ort = [Math.round(B.x), Math.round(B.z)];
                    const [vor, K, span] = [new Map(), globalThis.__gelaendeCore, r._voxelChunkConfig(0).span];
                    for (let cz = Math.floor((B.z - 96) / span); cz * span < B.z + 96; cz++)
                        for (let cx = Math.floor((B.x - 96) / span); cx * span < B.x + 96; cx++) vor.set([cx, cz], r._wasserNetz(cx, cz));
                    const gang = async (n) => {
                        for (let i = 0; i < n; i++, takt(), i % 5 || (await sleep(10)))
                            for (const [c, o] of vor) {
                                const neu = r._wasserNetz(...c);
                                if (neu === o) continue;
                                const e = neu && o ? neu.pos.findIndex((v, k) => v !== o.pos[k]) : -1;
                                Wn.wechsel++;
                                Wn.wo = `Chunk ${c}` + (e < 0 ? "" : `, Ecke (${neu.pos[e - (e % 3)].toFixed(1)}, ${neu.pos[e - (e % 3) + 2].toFixed(1)})`); // prettier-ignore
                                vor.set(c, neu);
                            }
                    };
                    await gang(600);
                    const [w0, wo, hoch] = [Wn.wechsel, Wn.wo, K.pegelTafel(r._gelaende(), r._pegelStand.schmelze, { q: new Float64Array(K.LAUF.n).fill(1) })]; // prettier-ignore
                    const zurueck = leihe(r, { _pegelTafel: () => (Math.floor(st.spielZeit) % 2 ? hoch : null) });
                    await gang(300).finally(() => (zurueck(), r._pegelTakt()));
                    [Wn.mutante, Wn.wechsel, Wn.wo] = [Wn.wechsel - w0, w0, wo];
                    await __weltStehtNach(takt);
                }
                const ring = st.voxelChunks.size;
                const aus = { ring, architekturen: (st.architectures || []).length, netz: Wn };
                // (W) WACH: ein kalter Bau, den der Cull meldet (Offenes), hält die Welt wach — beim Namen des Fege-Takts. Den atmenden
                // Regler hält das Einschwingen (welt-boot Selbsttest REGLER).
                const R0 = st.architectureCullingRadius;
                r._foundryRewarmColdTrees = () => 1;
                st.architectureCullingRadius = R0 + 2e-3;
                aus.wach = await __weltStehtNach(takt, 60).then((n) => `steht nach ${n} Takten`, (x) => String(x.message).slice(0, 200));
                delete r._foundryRewarmColdTrees;
                st.architectureCullingRadius = R0;
                const L = window.__standLinseAn();
                const summe = (f) => Object.keys(TAKTE).reduce((a, n) => a + (f[n] | 0), 0);
                // DAS WARTEN DER LINSE ist das EINE Warten auf einen Bau (welt-boot `__gebautNach`, Lehre 26): Takt um Takt (`jeTakt`),
                // bis `fertig()` steht — der Deckel `max` zählt nur Takte, in denen die Welt nichts offen hat; voll endet er still (das
                // Urteil danach nennt, was nicht stand), ein Offenes ohne Bau-Ereignis wirft beim Namen. Bis ci-wackler-zensus zählte jedes
                // Fenster jeden Takt: unter Last (2 Kerne, 3 Läufe) kamen die Antworten der Fäden und die Arbeit der ms-Budgets nach dem
                // Fenster (ORT, STROM, NACHSCHUB, Satz-Haus), und die Phase nach `bisRuhe` begann in einer wachen Welt (GEHEN, TREUE)
                const bisDa = (name, fertig, max, jeTakt = takt) =>
                    __gebautNach(name, { fertig, max, takt: jeTakt }).catch((f) => {
                        if (!/^DER BAU STEHT NICHT/.test(f.message)) throw f;
                        return max;
                    });
                // die Hülle um die Methode `k` an `o` über die EINE Leihe der Seite (`leihe`, unter ihrem Namen — der Stapel nennt sie):
                // `um(ruf, a)` statt ihres Rufs, `ruf()` ruft sie; zurück gibt die Leihe. `gemessen` zählt ihre Rufe (`n`) und ihre
                // Zeit (`ms`), `rufer` nennt die Stamm-Glieder des Stapels.
                const huelle = (o, k, um, roh = o[k]) => leihe(o, { [k](...a) { return um(() => roh.apply(this, a), a); } }); // prettier-ignore
                const gemessen = (o, k, Z = { n: 0, ms: 0 }) => {
                    Z.ab = huelle(o, k, (ruf) => {
                        const t0 = performance.now();
                        Z.n++;
                        try {
                            return ruf();
                        } finally {
                            Z.ms += performance.now() - t0;
                        }
                    });
                    return Z;
                };
                const rufer = (re = /at (?:[\w$]+\.)?(_[\w$]+)/) => String(new Error().stack).split("\n").map((s) => (s.match(re) || [])[1]).filter(Boolean); // prettier-ignore
                // bis die Wache schläft und die Welt nichts offen hat (ein Takt, der nie schläft, fällt in der Ruhe rot)
                const bisRuhe = async (n) => {
                    let still = 0;
                    L.frame();
                    const offen = () => Object.values(r._weltOffen()).some(Boolean);
                    return bisDa("die Ruhe der Wache", () => still >= 30 && !offen(), n, () => {
                        takt();
                        still = summe(L.frame()) === 0 ? still + 1 : 0;
                    });
                };
                const phase = async (n, schritt) => {
                    const fs = [];
                    L.frame();
                    for (let i = 0; i < n; i++) {
                        if (schritt) schritt(i);
                        takt();
                        fs.push(L.frame());
                        if (i % 10 === 0) await sleep(5);
                    }
                    return window.__standPhase(fs);
                };
                aus.bisRuhe = await bisRuhe(900);
                // (R) RUHE
                aus.ruhe = await phase(30);
                // (F) FIXPUNKT: die Welt steht erst, wenn jeder geweckte Fege-Takt seine Runde zu Ende ging. Ein Weckruf ohne Wirkung
                // (1 mm): nach einem Takt stehen Stufen-Wahl und Streu mitten in der Runde. L1→L2 × 0,8 und zurück: nach dem Stand
                // gehen 150 Takte ohne Eingabe keinen Fege-Takt mehr.
                // Ein Sprung des Auges (die Kamera einer Sonde, 40 m) ohne Takt: die Stufen-Wahl ginge im nächsten eine Runde.
                const [K, stand] = [st.camera.position, r._weltSteht()];
                const h = st.camera.getWorldDirection(K.clone()).multiplyScalar(-60).add(K);
                r._passSicht(st.camera, false);
                r._passSicht(st.camera, true);
                const q = st.camera.quaternion.clone();
                st.camera.lookAt(h.setY(r._voxelSurfaceY(h.x, h.z) - 2));
                aus.sonde = { vor: Object.keys(window.__nahDeckung({ radien: { Gelände: 60 }, gw: 1, gh: 1, neu: true }).taeter)[0] };
                st.camera.quaternion.copy(q);
                K.x += 40;
                aus.fixWach = aus.fixWach || (stand && r._weltSteht() && "Sprung");
                K.x -= 40;
                st.architectureCullingRadius += 1e-3;
                takt();
                aus.fixWach = aus.fixWach || (r._weltSteht() && "Weckruf");
                st.architectureCullingRadius -= 1e-3;
                const LD = AnazhRealm.LOD_DISTANCES;
                const d12 = LD.thresh12;
                const fixpunkt = async (d) => {
                    const wach = [];
                    LD.thresh12 = d;
                    const f = { takte: await __weltStehtNach(() => (takt(), wach.push(L.frame()))) };
                    f.wirkte = Object.values(window.__standPhase(wach).takte).reduce((a, t) => a + t.wirkt, 0);
                    f.nach = await phase(150);
                    return f;
                };
                try {
                    aus.fix = [await fixpunkt(d12 * 0.8), await fixpunkt(d12)];
                } catch (e) {
                    aus.fix = [{ fehler: String(e.message).slice(0, 200) }];
                    LD.thresh12 = d12;
                    await __weltStehtNach(takt);
                }
                // Die TREUE-PHASE: die Wache gebrochen (`_standRuht` schläft nie), so lange,
                // bis JEDER Takt eine volle Runde ging — die Runde nennt der Takt selbst (`_standRuht(name, runde, …)`), gegangen
                // ist, was er `_standMeldet` (die Arbeit der Wache). `jeFrame(f, gang)` sieht jeden Frame.
                const treuePhase = async (jeFrame) => {
                    const W = r._standWache;
                    const namen = Object.keys(TAKTE);
                    const arbeit = (n) => {
                        const x = W && W.takte.get(n);
                        return x ? x.arbeit : 0;
                    };
                    const a0 = Object.fromEntries(namen.map((n) => [n, arbeit(n)]));
                    const runden = {};
                    const rundeVon = {}; // die erste Runde, wenn sie sich während der Phase änderte
                    const orte = {};
                    const wechsel = {}; // der erste Wechsel des Orts (ein Wert: Zelle, Anker-Generation) während der Phase
                    const gang = () => Object.fromEntries(namen.map((n) => [n, arbeit(n) - a0[n]]));
                    const ab = huelle(P, "_standRuht", (ruf, a) => {
                        const r = a[1] | 0;
                        if (runden[a[0]] !== undefined && runden[a[0]] !== r && !(a[0] in rundeVon))
                            rundeVon[a[0]] = runden[a[0]];
                        runden[a[0]] = r;
                        if (typeof a[2] !== "object") {
                            if (orte[a[0]] !== undefined && orte[a[0]] !== a[2])
                                wechsel[a[0]] = wechsel[a[0]] || `${orte[a[0]]} → ${a[2]}`;
                            orte[a[0]] = a[2];
                        }
                        // das Urteil der HEILEN Wache je Takt (sie geht weiter, nur ihre Antwort fällt): nur ein Gang, den sie
                        // schlafen ließe, zählt als verschlafen (`wirkt`, stand-linse); ging sie ihn selbst, ist er `geweckt`
                        window.__standWacheUrteil[a[0]] = ruf();
                        return false;
                    });
                    const fs = [];
                    window.__standWacheUrteil = {};
                    L.frame();
                    try {
                        // der Wächter gegen ein Hängen ist kein Maß: das Maß ist die Runde (eine offene Runde fällt rot)
                        for (let i = 0; i < 3000; i++) {
                            takt();
                            const f = L.frame();
                            fs.push(f);
                            const g = gang();
                            if (jeFrame) jeFrame(f, g);
                            if (namen.every((n) => runden[n] !== undefined && g[n] >= runden[n])) break;
                            if (i % 10 === 0) await sleep(5);
                        }
                    } finally {
                        ab();
                        delete window.__standWacheUrteil;
                    }
                    const ph = window.__standPhase(fs);
                    const g = gang();
                    for (const n of namen)
                        if (ph.takte[n])
                            Object.assign(
                                ph.takte[n],
                                { runde: runden[n], gang: g[n], ortWechsel: wechsel[n] },
                                n in rundeVon ? { rundeVon: rundeVon[n] } : {}
                            );
                    return ph;
                };
                // (S) SCHARF + TREUE: jeder Takt geht, keiner wirkt
                aus.bruch = await treuePhase();
                await bisRuhe(300);
                // (X) DIE TÄTER: jeder Takt, dessen Runde mehrere Gänge braucht (Stufen-Wahl, Streu, Saum), bekommt in der zweiten
                // Hälfte seiner Runde eine still verstellte Einheit (eine Änderung ohne Weckruf — was ein Schreiber ohne
                // `_weltRegt` anrichtete); die schlafende Wache sieht sie nie, die Treue-Phase muss jede finden. Je Takt die
                // letzte Einheit in seiner Gang-Ordnung (ab dem Cursor), deren Gang sie gewiss zurückholt.
                aus.taeter = await (async () => {
                    const je = {};
                    const pp = st.playerMesh.position;
                    // die Stufen-Wahl (`_tickArchitectureLOD`: die WACHEN Einträge in der Reihe ihrer Wache, `_stufenWache` — die
                    // schlafenden holt der Weg oder ein Weckruf, nie der Gang): ein Baum hält still ein Verdeckt-Urteil, das der
                    // Gang ohne Verdeckung (Null-Renderer) oder im Nahbereich zurücknimmt
                    {
                        const archs = r._stufenWacheStand ? [...r._stufenWacheStand.wach] : [];
                        const n = archs.length;
                        const occlOn =
                            st.useOcclusionDemotion !== false && !st.renderer?._isHeadlessNull;
                        for (let o = n - 1; o >= 0; o--) {
                            const e = archs[o];
                            if (!e || !e.instanced || e._occluded || e._bruecke) continue;
                            const treeLike = !!e._lodSpecies && Number.isFinite(e._lodVariantIndex);
                            if (!treeLike && e.instFoundry !== true) continue;
                            if (r._lodTreeVisHeight(e) === null) continue;
                            const dist = Math.hypot(e.position.x - pp.x, e.position.z - pp.z);
                            if (occlOn && dist > AnazhRealm.OCCLUSION.occDist) continue;
                            e._occluded = true; // still verstellt: kein Weckruf
                            je.archLod = { stelle: o, runde: n };
                            break;
                        }
                    }
                    // die Streu (`_tickScatterLod`: ab dem Cursor Region für Region, jede Zelle eine Einheit): eine Zelle vergisst
                    // ihre Stufe; Stufe geladen, im Radius, die Distanz-Wahl ohne Gedächtnis trifft dieselbe Stufe, keine
                    // region-privaten Slots — ihr Gang quittiert oder materialisiert sie auf derselben Stufe
                    const map = st.scatterRegions;
                    const cur = r._scatterLodCursor;
                    let zelle = null;
                    if (map?.size && cur && r._scatterLayerByName) {
                        const keys = (r._scatterLodKeys = Array.from(map.keys()));
                        r._scatterLodKeysN = map.size;
                        const k0 = cur.k >= keys.length ? 0 : cur.k;
                        const ordnung = [];
                        for (let h = 0; h <= keys.length; h++) {
                            const reg = map.get(keys[(k0 + h) % keys.length]);
                            const cells = reg && Array.isArray(reg.cells) ? reg.cells : [];
                            const von = h === 0 ? cur.c : 0;
                            const bis = h === keys.length ? Math.min(cur.c, cells.length) : cells.length;
                            for (let c = von; c < bis; c++) ordnung.push(cells[c]);
                        }
                        const SC = AnazhRealm.SCATTER;
                        for (let i = ordnung.length - 1; i >= 0; i--) {
                            const cell = ordnung[i];
                            if (!cell || !cell.bpName || !cell.slots || !cell.slots.length) continue;
                            if (!Number.isFinite(cell.lod)) continue;
                            if (cell.slots.some((s) => s && typeof s.key === "string" && /@(?!s:)/.test(s.key)))
                                continue;
                            const layer = r._scatterLayerByName.get(cell.layer);
                            if (!layer) continue;
                            const dist = Math.hypot(cell.x - pp.x, cell.z - pp.z);
                            if (dist > SC.outerM + 96) continue;
                            const tf = r._scatterCellTransform(
                                cell.cellX,
                                cell.cellZ,
                                cell.cellM,
                                layer.scaleBase,
                                layer.scaleVar
                            );
                            const visH = r._scatterSichtHoehe(
                                layer,
                                cell.species,
                                cell.cellX,
                                cell.cellZ,
                                cell.variantIndex,
                                tf.scale
                            );
                            if (visH === null || r._chooseLODForDistance(dist, undefined, visH) !== cell.lod) continue;
                            zelle = { cell, vorher: cell.lod };
                            cell.lod = null; // still verstellt: kein Weckruf
                            je.streuLod = { stelle: i, runde: ordnung.length };
                            break;
                        }
                    }
                    // der Saum (`_fernRingDeckWache`: Punkte ab `deckCursor`): der letzte Punkt der Runde steht still 1,5 m zu hoch
                    const fr = st.fernRing;
                    if (fr?.zoneVerts && fr.geos?.[0]) {
                        const o = fr.zoneVerts - 1;
                        const p = r._fernRingPunkt(fr, ((fr.deckCursor || 0) + o) % fr.zoneVerts);
                        const pos = fr.geos[0].attributes.position;
                        pos.setY(p.li, pos.getY(p.li) + 1.5); // still verstellt: kein Weckruf
                        je.deckWache = { stelle: o, runde: fr.zoneVerts };
                    }
                    const phase = await treuePhase((f, g) => {
                        for (const n in je)
                            if (je[n].gefundenBei === undefined && f.wirkt && f.wirkt[n] > 0) je[n].gefundenBei = g[n];
                    });
                    for (const n in je) if (je[n].gefundenBei === undefined) je[n].gefundenBei = null;
                    if (zelle && !Number.isFinite(zelle.cell.lod)) zelle.cell.lod = zelle.vorher;
                    return { je, phase };
                })();
                await bisRuhe(300);
                // (W) WECKEN: ein Baum entsteht im Stand
                {
                    const pm = st.playerMesh.position;
                    const x = pm.x + 14,
                        z = pm.z + 9;
                    const e = r.spawnArchitecture("baum_eiche", { x, y: r._voxelSurfaceY(x, z), z }, { rotationY: 0 });
                    const W = { eintrag: !!e };
                    W.phase = await phase(30);
                    W.versorgt = !!e && (Number.isFinite(e._lodLevel) || !!e.mesh || !!e._ziegelSlot);
                    W.stufe = e ? e._lodLevel : null;
                    W.bisRuhe = await bisRuhe(600);
                    W.nachher = await phase(20);
                    // die Treue nach dem Bau: die gebrochene Wache findet nichts, was die schlafende verschlief — und ein
                    // WECKRUF in der Phase (die Probe: nach dem ersten Gang der Nah-Streu wächst die Kachel des Spielers neu, wie eine
                    // Antwort des Gaus, deren Fraß-Stufe springt, `_nahStreuNeuIn`) ist ein geweckter Gang, nie ein verschlafener
                    W.weckProbe = { kacheln: 0 };
                    W.treue = await treuePhase((f, g) => {
                        if (W.weckProbe.frame !== undefined || !(g.nahStreu > 0)) return;
                        const K = AnazhRealm.NAH_STREU.kachel;
                        const [kx, kz] = [Math.floor(pm.x / K) * K, Math.floor(pm.z / K) * K];
                        W.weckProbe = { frame: g.nahStreu, kacheln: r._nahStreuNeuIn(kx, kz, kx + K, kz + K) };
                    });
                    await bisRuhe(300);
                    // ein Regler-Schritt (der Cull-Radius 20 m enger) weckt den Cull-Gang, er räumt den Rand
                    const rad = st.architectureCullingRadius;
                    st.architectureCullingRadius = rad - 20;
                    W.regler = await phase(10);
                    st.architectureCullingRadius = rad;
                    await bisRuhe(600);
                    // ein Wahrnehmungs-Schritt (die LOD-Distanz L1→L2, `LOD_DISTANCES.thresh12`, ohne Weckruf geschrieben): der
                    // Stempel liest ihn selbst — Stufen-Wahl und Streu gehen
                    const D = AnazhRealm.LOD_DISTANCES;
                    const d12 = D.thresh12;
                    D.thresh12 = d12 + 0.5;
                    W.wahrnehmung = await phase(4);
                    D.thresh12 = d12;
                    await bisRuhe(600);
                    // ein Schirm-Schritt (w28-probe-schirm: der Zeichenpuffer wechselt seine Zeilen, wie der resize-Handler — `setSize`,
                    // `_schirmMessen`, `_stufenSchirm`; ohne Weckruf): jede Grenze des Stufen-Gesetzes liest die Zeilen — die Welt steht
                    // nicht, bevor ein Takt am neuen Schirm ging (`stehtSofort`), der Stempel liest sie selbst, Stufen-Wahl und Streu gehen
                    const leinwand = st.renderer.domElement;
                    const [lw, lh] = [leinwand.width, leinwand.height];
                    const schirmAuf = (h) => (st.renderer.setSize(lw, h), r._schirmMessen(), r._stufenSchirm());
                    schirmAuf(lh + 120);
                    const stehtSofort = r._weltSteht();
                    W.schirm = Object.assign(await phase(4), { stehtSofort, zeilen: [lh, r._schirm().hoehe] });
                    schirmAuf(lh);
                    await bisRuhe(600);
                    // die Zusage eines Schläfers (b-ankunft): der Baum schläft auf seiner Zusage (`_schlafen`) und verlässt die Wache
                    // wie im Gang des Culls (`K.schlaefer`), der Takt ruht; kommt sie, holt sie ihn zurück (`_cullWecken`) — der Cull geht
                    if (e) {
                        const K = r._cullWache();
                        let kam;
                        const zusage = new Promise((ja) => (kam = ja));
                        r._schlafen(e, [zusage], r._bereitStand(r._lodAuge(), true), (x) => r._cullWecken(x));
                        e._cullEimer = undefined;
                        K.wach.delete(e);
                        K.schlaefer.add(e);
                        const vor = await phase(4);
                        kam();
                        await sleep(5);
                        const wach = K.wach.has(e);
                        W.zusage = Object.assign(await phase(4), { vor: vor.takte.archCull ? vor.takte.archCull.summe : null, wach });
                        await bisRuhe(600);
                    }
                    aus.wecken = W;
                }
                // (G) GEHEN: W gehalten, zur Mitte der Spieler-Zelle — der Gang bleibt in seiner Zelle (verlässt er sie doch, ist
                // die Phase LEER)
                {
                    // die Zelle, in der sich keine Stufe ändern kann (`_stufenZelle`, K51-3) — derselbe Stempel wie die Strom-Wache.
                    // Ihre Fächer sind je Achse 0,8–7,4 m breit (die Grenzen aus BODEN_STUFEN wie `_stufenZelle`), der Gang läuft
                    // ~6 m: er beginnt in der Ecke des breitesten Fachs seines Chunks und geht diagonal hindurch (~9 m frei).
                    const zelle = (p) => r._stufenZelle(p.x, p.z);
                    const span = r._voxelChunkConfig(0).span;
                    const B = AnazhRealm.BODEN_STUFEN;
                    const grenzen = [0, span];
                    for (const s of B.stufen) {
                        if (!(s.bis < Infinity)) continue;
                        for (const t of [s.bis + B.vorlauf, s.bis + B.vorlauf + B.halt]) {
                            grenzen.push(t % span, span - (t % span));
                        }
                    }
                    grenzen.sort(aufsteigend);
                    let fach = [0, 0];
                    for (let i = 1; i < grenzen.length; i++)
                        if (grenzen[i] - grenzen[i - 1] > fach[1] - fach[0]) fach = [grenzen[i - 1], grenzen[i]];
                    const q = st.playerMesh.position;
                    const cx = Math.floor(q.x / span) * span,
                        cz = Math.floor(q.z / span) * span;
                    const sx = cx + fach[0] + 0.4,
                        sz = cz + fach[0] + 0.4;
                    st.playerMesh.position.set(sx, r._voxelSurfaceY(sx, sz) + 1.8, sz);
                    if (st.playerVel) st.playerVel.setValue(0, 0, 0);
                    await bisRuhe(600);
                    const p0 = st.playerMesh.position.clone();
                    st.yaw = Math.atan2(cx + fach[1] - 0.4 - p0.x, cz + fach[1] - 0.4 - p0.z);
                    const z0 = zelle(p0);
                    const g0 = st.fernRing ? st.fernRing.gen | 0 : -1;
                    st.verbTafel.gehalten = { vor: true };
                    try {
                        aus.gehen = await phase(120);
                    } finally {
                        st.verbTafel.gehalten = {};
                    }
                    const p1 = st.playerMesh.position;
                    aus.gehen.weg = +Math.hypot(p1.x - p0.x, p1.z - p0.z).toFixed(2);
                    aus.gehen.zelleGleich = zelle(p1) === z0;
                    aus.gehen.ankerGleich = (st.fernRing ? st.fernRing.gen | 0 : -1) === g0;
                }
                // (U) STUFE: aus der Ruhe tauscht ein ferner Chunk seine Stufe hin und zurück, wie der Streaming-Takt
                // (`_rebuildVoxelChunk(cx, cz, lod)`, hier synchron) — gezählt je Takt die Einheiten und die Rufe des Walds
                {
                    // DIE RUHE VOR DEM WECHSEL: offener Wuchs ist keine Ruhe. Nach dem Gehen liegen Chunks neu im Laub-Rand (`_laubRand`),
                    // deren Vegetation wartet (`pendingFoliageChunks`, der Wuchs-Takt je Wanduhr gedrosselt); füllt sie der Wuchs
                    // oder der Neubau des Ziels (`_populateVoxelChunkVegetation` → `_weltRegt()`) mitten in der Phase, regt sich
                    // die Menge — nicht die Stufe.
                    // Der offene Wuchs im Radius fällt darum VOR der Ruhe, synchron; das Ziel trägt keine wartende Form.
                    let wuchs = 0;
                    if (st.pendingFoliageChunks)
                        for (const k of [...st.pendingFoliageChunks]) {
                            const [cx, cz] = k.split(",").map(Number);
                            if (!r._foliageChunkInRadius(cx, cz)) continue;
                            st.pendingFoliageChunks.delete(k);
                            r._populateVoxelChunkVegetation(cx, cz, { immediate: true });
                            wuchs++;
                        }
                    // ebenso das Studio: eine Ankunft (`_foundry.ankunft`, Buch, Antwort) liest der Stempel aller Takte — die Phase
                    // beginnt erst, wenn keine Bestellung mehr wartet oder fliegt (`warte`, `pending`)
                    const F = r._foundry;
                    const studioRuht = () =>
                        !F || ((!F.warte || F.warte.length === 0) && (!F.pending || F.pending.size === 0));
                    let studio = 0;
                    for (; studio < 900 && !studioRuht(); studio++) {
                        takt();
                        if (studio % 5 === 0) await sleep(10);
                    }
                    await bisRuhe(900);
                    const pm = st.playerMesh.position;
                    let ziel = null;
                    const formWartet = (k) =>
                        st.grassDirtyChunks?.has(k) ||
                        st.dirtyVoxelChunks?.has(k);
                    for (const [k, e] of st.voxelChunks) {
                        if (!e || e.empty || !e.mesh || e.lod !== 2 || formWartet(k)) continue;
                        const [cx, cz] = k.split(",").map(Number);
                        if (!ziel || Math.abs(cx * 43.2 - pm.x) + Math.abs(cz * 43.2 - pm.z) < ziel.d)
                            ziel = { cx, cz, d: Math.abs(cx * 43.2 - pm.x) + Math.abs(cz * 43.2 - pm.z) };
                    }
                    const U = {
                        wechsel: 0,
                        takte: {},
                        rufe: { _lodTreeVisHeight: 0, _forestStehtFrei: 0, _forestCellDarts: 0 },
                        wuchs,
                    };
                    const ab = Object.keys(U.rufe).map((m) => huelle(P, m, (ruf) => (U.rufe[m]++, ruf())));
                    try {
                        if (ziel)
                            for (const lod of [1, 2]) {
                                r._rebuildVoxelChunk(ziel.cx, ziel.cz, lod, { forceSync: true });
                                const e = st.voxelChunks.get(ziel.cx + "," + ziel.cz);
                                if (e && e.lod === lod) U.wechsel++;
                                const ph = await phase(20);
                                for (const n of Object.keys(TAKTE))
                                    U.takte[n] = (U.takte[n] | 0) + (ph.takte[n] ? ph.takte[n].summe : 0);
                            }
                    } finally {
                        ab.forEach((f) => f());
                    }
                    aus.stufe = U;
                }
                // (O) ORT: aus der Ruhe legt ein Ort abseits seinen Erdbau (eine Platte 12 × 12 m, 96 m vor dem Spieler — wie
                // der Dorf-Zug das nächste Dorf legt, während der Spieler ins erste geht). Es fällt nur, was er ändern kann: gezählt
                // die Gedächtnisse FERN von ihm (über `fern` m) vorher und nachher — der Stand des Walds (`_forestDartStand`, an ihm
                // hängt die Gestalt jedes Orts), die Wald-Zellen (dieselben Objekte im Dart-Gedächtnis), die Chunk-Gedächtnisse
                // (Basis-Dichte, Dichte, Mesh) und der Stand eines fernen Chunks (`_voxelStand`, der Filter der Worker-Antworten) —,
                // dazu in den Takten danach die neu geplanten Wald-Zellen (`planForestCell`) und der längste Takt: der Name des Risses.
                {
                    await bisRuhe(900);
                    const pm = st.playerMesh.position;
                    const ox = Math.round(pm.x + 96);
                    const oz = Math.round(pm.z);
                    const FERN = 240;
                    const C = AnazhRealm.FOREST.cell;
                    const span = r._voxelChunkConfig(0).span;
                    const weit = (k, kante) => {
                        const [a, b] = k.split(",").map(Number);
                        return Math.hypot((a + 0.5) * kante - ox, (b + 0.5) * kante - oz) > FERN;
                    };
                    const seedInt = r._forestSeedInt();
                    const O = { ort: [ox, oz], fern: FERN, takte: 60, standVor: r._forestDartStand(seedInt) };
                    const memo0 = r._forestDartMemo;
                    const darts0 = memo0 ? [...memo0.entries()].filter(([k]) => weit(k, C)) : [];
                    const caches = {
                        basis: st.voxelBaseDensityCache,
                        dichte: st.voxelDensityCache,
                        mesh: st.voxelMeshCache,
                    };
                    const caches0 = {};
                    for (const [n, c] of Object.entries(caches))
                        caches0[n] = c ? [...c.keys()].filter((k) => weit(k, span)) : [];
                    let standKey = null;
                    for (const k of st.voxelChunks.keys())
                        if (weit(k, span)) {
                            standKey = k;
                            break;
                        }
                    const standOf = (k) => r._voxelStand(...k.split(",").map(Number));
                    O.stand = { key: standKey, vor: standKey ? standOf(standKey) : null };
                    const pfc = gemessen(globalThis.__phytoCore, "planForestCell");
                    try {
                        const oy = r._voxelSurfaceY(ox, oz);
                        O.gelegt = r._erdbauSetzen("gate-stand-takt-ort", [
                            { art: "platte", cx: ox, cz: oz, phi: 0, ex: 6, ez: 6, y: Number.isFinite(oy) ? oy : 0 },
                        ]);
                        O.standNach = r._forestDartStand(seedInt);
                        const memo1 = r._forestDartMemo;
                        O.darts = {
                            fern: darts0.length,
                            gehalten: darts0.filter(([k, d]) => memo1 && memo1.get(k) === d).length,
                        };
                        O.chunks = {};
                        for (const [n, ks] of Object.entries(caches0)) {
                            const c =
                                st[
                                    {
                                        basis: "voxelBaseDensityCache",
                                        dichte: "voxelDensityCache",
                                        mesh: "voxelMeshCache",
                                    }[n]
                                ];
                            O.chunks[n] = { fern: ks.length, gehalten: ks.filter((k) => c?.has(k)).length };
                        }
                        if (standKey) {
                            O.stand.nach = standOf(standKey);
                            O.stand.gleich = O.stand.nach === O.stand.vor;
                        }
                        let max = 0;
                        for (let i = 0; i < O.takte; i++) {
                            const t1 = performance.now();
                            takt();
                            max = Math.max(max, performance.now() - t1);
                            if (i % 10 === 0) await sleep(5);
                        }
                        O.plan = pfc.n;
                        O.maxTaktMs = +max.toFixed(1);
                        // DIE RÄUMUNG DES ORTS: ein Dorf räumt beim Nähern die Natur auf seinem Grund (`_naturRaeumen` →
                        // `removeArchitecture`) — gezählt die synchronen Saves der ganzen Welt, die fünf Abbauten tragen
                        const natur = (st.architectures || [])
                            .filter((e) => e?.position && r._istNatur(e))
                            .sort(
                                (a, b) =>
                                    Math.hypot(a.position.x - ox, a.position.z - oz) -
                                    Math.hypot(b.position.x - ox, b.position.z - oz)
                            )
                            .slice(0, 5);
                        const sv = gemessen(r, "saveState");
                        try {
                            let ab = 0;
                            for (const e of natur) if (r.removeArchitecture(e)) ab++;
                            O.raeumung = { abbau: ab, saves: sv.n, saveMs: +sv.ms.toFixed(1) };
                        } finally {
                            sv.ab();
                        }
                    } finally {
                        pfc.ab();
                    }
                    // die Kultur eines Hauses im Buch (Solo-Haus und Haus im Satz, w4-z140-rueckfall: EINE Suche)
                    const recs = r._foundry?.recipes || {};
                    const kultur = Object.keys(recs).find((k) => {
                        const pol = AnazhRealm.KIND_POLICY[recs[k] && recs[k].kind];
                        return pol?.prefix === "haus_" && st.blueprints["haus_" + k];
                    });
                    // DAS SOLO-HAUS (K69, B3c: Vorschau, KI) über die Wurzel — gezählt, wie oft der Wirt das ganze Haus im Kern baut,
                    // um die Kamin-Spitze zu finden (`chimneyTipFromParams` → `massBau`); sie reist mit der Hülle (`__huelle.kamin`)
                    {
                        const [kx, kz] = [ox - 40, oz + 40];
                        const ky = r._voxelSurfaceY(kx, kz);
                        const tip = gemessen(globalThis.__fachwerkCore, "chimneyTipFromParams");
                        let gesetzt = false;
                        try {
                            if (kultur && Number.isFinite(ky)) {
                                const ort = { x: kx, y: ky + 0.5, z: kz };
                                const e = r.spawnArchitecture("haus_" + kultur, ort, { silent: true });
                                gesetzt = !!e;
                                if (e) r.removeArchitecture(e);
                            }
                        } finally {
                            tip.ab();
                        }
                        O.kamin = { kultur: kultur || null, gesetzt, bau: tip.n, ms: +tip.ms.toFixed(1) };
                    }
                    // DER BAUM IN FRISCHEM WALD: ein Hof-Baum des Dorfs (`_naturSetzen`, wie die Ausstattung
                    // `_spawnSettlementErlebnis`) an einem Ort, dessen Wald nie geplant wurde — gezählt die Wald-Zellen, die
                    // sein Setzen SYNCHRON plant (`planForestCell` im Aufrufer), dann die Takte, bis seine Gestalt steht, und
                    // die längste Plan-Arbeit eines Takts (die Schlange des Walds, `_tickWaldPlan`)
                    {
                        const pf = gemessen(globalThis.__phytoCore, "planForestCell");
                        const Wd = { gesetzt: false };
                        try {
                            const C = AnazhRealm.FOREST.cell;
                            for (const [dx, dz] of [
                                [0, 420],
                                [420, 0],
                                [0, -420],
                                [-420, 0],
                                [300, 300],
                                [-300, 300],
                            ]) {
                                const wx = ox + dx;
                                const wz = oz + dz;
                                const memo = r._forestDartMemo;
                                if (memo?.has(Math.floor(wx / C) + "," + Math.floor(wz / C))) continue;
                                if (!r._landAt(wx, wz, 0.2)) continue;
                                const wy = r.getTerrainHeightAt(wx, wz);
                                if (!Number.isFinite(wy)) continue;
                                pf.n = pf.ms = 0;
                                const e = r._naturSetzen(
                                    "baum_eiche",
                                    { x: wx, y: wy, z: wz },
                                    { seed: 4711, scale: 0.6, rotationY: 0, silent: true }
                                );
                                if (!e) continue;
                                Object.assign(Wd, { gesetzt: true, ort: [wx, wz], synchron: pf.n, ms: +pf.ms.toFixed(1) });
                                const preset = r._foundryPresetForEntry(e);
                                let g = r._foundryGestaltFor(e, preset);
                                let [maxN, maxMs] = [0, 0];
                                pf.n = 0;
                                const takte = await bisDa("die Gestalt im frischen Wald", () => Number.isInteger(g), 600, () => {
                                    const [n0, m0] = [pf.n, pf.ms];
                                    takt();
                                    [maxN, maxMs] = [Math.max(maxN, pf.n - n0), Math.max(maxMs, pf.ms - m0)];
                                    g = r._foundryGestaltFor(e, preset);
                                });
                                Object.assign(Wd, {
                                    takte,
                                    gestalt: Number.isInteger(g) ? g : null,
                                    imTakt: pf.n,
                                    maxTaktZellen: maxN,
                                    maxTaktMs: +maxMs.toFixed(1),
                                });
                                r.removeArchitecture(e);
                                break;
                            }
                        } finally {
                            pf.ab();
                        }
                        O.wald = Wd;
                    }
                    // DAS HAUS IM SATZ: ein Dorf-Haus tritt in den Bau-Satz seiner Stoffe (`_tickBauSatz › _bauSatzBlock ›
                    // _satzBlock`), verlässt ihn und tritt ein zweites Mal ein (ein stehender Bereich legt nur geänderte Slots) —
                    // gezählt die Bytes, die der Block dabei FRISCH anlegt
                    {
                        const hx = ox + 40;
                        const hz = oz - 40;
                        const hy = r._voxelSurfaceY(hx, hz);
                        const SH = { kultur: kultur || null, gesetzt: false };
                        const e =
                            kultur && Number.isFinite(hy)
                                ? r._spawnSettlementSlot(
                                      { kultur, x: 0, z: 0, y: hy, phi: 0, seed: 4712, chimney: null },
                                      { x: hx, z: hz },
                                      r._foundry
                                  )
                                : null;
                        if (e) {
                            SH.gesetzt = true;
                            const gruppen = () =>
                                (e.instSlots || [])
                                    .map((s) => st.archInstanceGroups?.get(s.key))
                                    .filter((g) => g?.satz && (g.liveCount | 0) > 0);
                            const drin = () => {
                                const gs = gruppen();
                                return (
                                    gs.length > 0 &&
                                    gs.every((g) => {
                                        const s = st.chunkSaetze?.get(g.satz);
                                        return (
                                            s?.bloecke.has(g.key) &&
                                            !st.bauSatzSchmutzig?.has(g.key)
                                        );
                                    })
                                );
                            };
                            const takte = await bisDa("das Haus im Bau-Satz", drin, 600);
                            const gs = gruppen();
                            Object.assign(SH, {
                                takte,
                                gruppen: gs.length,
                                ecken: gs.reduce((a, g) => a + g.geom.attributes.position.count * (g.liveCount | 0), 0),
                                bloecke: 0,
                            });
                            if (drin()) {
                                const T = { F: globalThis.Float32Array, U: globalThis.Uint32Array };
                                let frisch = 0;
                                const zaehl = (Typ) =>
                                    new Proxy(Typ, {
                                        construct(t, a) {
                                            const x = Reflect.construct(t, a);
                                            frisch += x.byteLength;
                                            return x;
                                        },
                                    });
                                const ab = huelle(r, "_satzBlock", (ruf) => {
                                    SH.bloecke++;
                                    globalThis.Float32Array = zaehl(T.F);
                                    globalThis.Uint32Array = zaehl(T.U);
                                    try {
                                        return ruf();
                                    } finally {
                                        globalThis.Float32Array = T.F;
                                        globalThis.Uint32Array = T.U;
                                    }
                                });
                                try {
                                    for (const g of gs) r._chunkSatzAus(g.satz, g.key) && r._bauSatzMarke(g.key, g.satz);
                                    r._tickBauSatz(Infinity);
                                } finally {
                                    ab();
                                    globalThis.Float32Array = T.F;
                                    globalThis.Uint32Array = T.U;
                                }
                                SH.frischKB = Math.round(frisch / 1024);
                            }
                            r.removeArchitecture(e);
                        }
                        O.satzHaus = SH;
                    }
                    // DER ERDBAU UNTER DEM SPIELER: ein Ort legt seine Platte, wo der Spieler steht (wie der Dorf-Zug
                    // das Dorf um ihn legt) — die Chunks seines Umkreises werden neu gebaut. Gezählt jeder Chunk-Bau, der in
                    // einem Takt SYNCHRON im Haupt-Faden läuft (`_buildVoxelChunkData`, der Bau ohne Worker), mit der Kette
                    // seiner Rufer und seiner Zeit, und die Takte, bis kein Chunk mehr auf seinen Neubau wartet (der Boden heilt).
                    {
                        await bisRuhe(900);
                        const pm = st.playerMesh.position;
                        const sx = Math.round(pm.x);
                        const sz = Math.round(pm.z);
                        const sy = r._voxelSurfaceY(sx, sz);
                        const A = { ort: [sx, sz], gelegt: false, dirty: 0, takte: 0, heil: false, sync: [] };
                        let imTakt = false;
                        const ab = huelle(r, "_buildVoxelChunkData", (ruf) => {
                            const t4 = performance.now();
                            try {
                                return ruf();
                            } finally {
                                const ms = performance.now() - t4;
                                if (imTakt) A.sync.push({ ms: +ms.toFixed(1), kette: rufer(/at (?:AnazhRealm\.|Object\.|r\.)?(_[\w$]+)/).slice(1, 5).reverse().join(" › ") }); // prettier-ignore
                            }
                        });
                        try {
                            A.gelegt = r._erdbauSetzen("gate-stand-takt-am-spieler", [
                                {
                                    art: "platte",
                                    cx: sx,
                                    cz: sz,
                                    phi: 0,
                                    ex: 6,
                                    ez: 6,
                                    y: Number.isFinite(sy) ? sy : 0,
                                },
                            ]);
                            A.dirty = st.dirtyVoxelChunks ? st.dirtyVoxelChunks.size : 0;
                            A.takte = await bisDa("der Erdbau unter dem Spieler", () => (A.heil = !(st.dirtyVoxelChunks || []).size), 600, () => { // prettier-ignore
                                imTakt = true;
                                try {
                                    takt();
                                } finally {
                                    imTakt = false;
                                }
                            });
                        } finally {
                            ab();
                        }
                        O.amSpieler = A;
                    }
                    aus.ort = O;
                }
                // (T) STROM: erst Ruhe, dann der Sprung an einen fremden Ort — der Spieler-Chunk muss kommen
                {
                    await bisRuhe(900);
                    const x = MESS.x + 600,
                        z = MESS.z;
                    st.playerMesh.position.set(x, r._voxelSurfaceY(x, z) + 1.8, z);
                    const span = r._voxelChunkConfig(0).span;
                    const key = `${Math.floor(x / span)},${Math.floor(z / span)}`;
                    // DER WALD AM FREMDEN ORT: jede frische Wald-Zelle (`planForestCell`) plant die Schlange des Walds
                    // (`_tickWaldPlan`) — gezählt, was ein anderer Aufrufer am Stück plant, mit dem Namen des ersten
                    const W = { imJob: 0, aussen: 0, ms: 0, taeter: null, maxTakt: 0 };
                    let [tiefe, jetztTakt] = [0, 0];
                    const ab = [
                        huelle(r, "_tickWaldPlan", (ruf) => {
                            tiefe++;
                            try {
                                return ruf();
                            } finally {
                                tiefe--;
                            }
                        }),
                        // der Rechner der Schlange ist der Wald-Faden: seine Lieferungen (`_waldDartsAn`) plante die
                        // Schlange — sie zählen wie ihre Zellen im Job
                        huelle(r, "_waldDartsAn", (ruf, [, zellen, res]) => ((W.imJob += res && zellen ? zellen.length / 2 : 0), ruf())),
                        huelle(globalThis.__phytoCore, "planForestCell", (ruf) => {
                            const t5 = performance.now();
                            try {
                                return ruf();
                            } finally {
                                if (tiefe > 0) W.imJob++;
                                else {
                                    W.aussen++;
                                    jetztTakt++;
                                    W.ms += performance.now() - t5;
                                    W.taeter ||= rufer().filter((m) => m !== "_forestCellDarts").slice(0, 4).join(" › ");
                                }
                            }
                        }),
                    ];
                    let n = 0;
                    try {
                        const gang = () => {
                            jetztTakt = 0;
                            takt();
                            W.maxTakt = Math.max(W.maxTakt, jetztTakt);
                        };
                        n = await bisDa("der Spieler-Chunk am fremden Ort", () => !!st.voxelChunks?.has(key), 600, gang); // prettier-ignore
                        // der Chunk steht — sein Wald und der seiner Nachbarn kommt in den Takten danach (240 ohne Offenes)
                        await bisDa("der Wald am fremden Ort", () => false, 240, gang);
                    } finally {
                        ab.forEach((f) => f());
                    }
                    W.ms = +W.ms.toFixed(1);
                    aus.strom = {
                        x,
                        z,
                        takte: n,
                        spielerChunk: !!st.voxelChunks?.has(key),
                        wald: W,
                    };
                }
                L.aus();
                // (N) DER NACHSCHUB DES WALDS: wartet die Gestalt einer Streu-Zelle auf den Plan des Walds, schiebt
                // sich ihre Region auf — steht der Plan ihrer Kästen und steht kein Asset aus, baut sie neu.
                {
                    const p = st.playerMesh.position;
                    const o = () => r._weltOffen(); // was die Welt noch baut (A9): die Schlange des Walds und die Foundry
                    const i = await bisDa("der Nachschub des Walds", () => o().wald + o().foundry === 0 && r._streuWartet(p) === 0, 2000); // prettier-ignore
                    const warten = [];
                    r._streuWartet(p, warten);
                    aus.nachschub = { takte: i, schlange: o().wald, foundry: o().foundry, warten };
                }
                // (B) BAKE-SCHULD: 24 Fits fragen je Takt — solange die Bake-Uhr abweist, steht die Welt nicht
                await __weltStehtNach(takt);
                const schuld = new Set(Array.from({ length: 24 }, (_, i) => i));
                const B = (aus.schuld = { abgewiesen: 0 });
                B.takte = await window
                    .__weltStehtNach(() => {
                        for (const i of schuld) r._weltBakeErlaubt(i) ? schuld.delete(i) : B.abgewiesen++;
                        takt();
                        if (schuld.size) B.grund = r._weltStand.grund;
                    }, 60)
                    .catch((x) => x.message);
                B.rest = schuld.size;
                const D = (aus.dorf = {});
                r.spawnSettlement({ seed: 7, nH: 12, autonomous: true, verlangt: "nexus" }).then((x) => (D.placed = x?.placed));
                D.steht = await __weltStehtNach(takt).catch((x) => x.message);
                // (V) DER VORBACKER AM VOLLEN WELT-MARCH (march-warter): ein Haus, dessen Mesh zeichnet, bäckt seinen Satz nur vor —
                // sinkt die Feld-Liste unter ihre Reserve, fällt sein schweigendes Feld (`_weltLeibTakt` › `_weltStillWeicht`). Es
                // FRAGT SELBST nach Platz (der fallende Satz weckt den Gang, `_archZiegelWeicht`), wartet auf Platz ÜBER der Reserve
                // (`_archZiegelFern` › `_weltPlatzWarten(true)`) und schläft auf dieser Zusage. Die Welt STEHT dabei (er schuldet dem
                // Bild nichts: kein Fege-Takt wartet für ihn), und Platz über der Reserve WECKT ihn (`_weltPlatzTakt`, die Zusage
                // weckt den Takt): er bäckt. Das Haus tritt ein und trägt Mesh und Satz, dann nimmt der echte Nehmer
                // (`_weltKapselSpawn`) die Liste bis ein Feld unter die Reserve, der echte Geber (`_weltFeldFrei`) gibt sie zurück.
                // Die Null-Wand fällt nur für die Satz-Schlange DIESES Hauses (Lehre 16: der Null-Renderer trägt keinen Satz —
                // Feld-Liste und Kapseln sind CPU-Daten, der Pass steht unter dem Haken des Fern-Rings); die Wiese und das Dorf
                // bleiben hinter ihr. Die Linse richtet die MELDUNG des Gangs (wer zählt als offen, wer weckt), nie das Bild des
                // Satzes: das richtet die Werkbank am echten Renderer (stadt-voll, 20 Uhr, 804,9 / 62,8 / 402,8 — die Zahlen am
                // Schnitt, `tickArchitectureCulling`). Die Mutante „nie geweckt“: der Platz-Takt schweigt — kein Vorbacker bäckt,
                // obwohl Platz über der Reserve frei ist.
                {
                    const V = (aus.vorbacker = { n: 0, fragten: 0 });
                    const [WM, wm, T3] = [AnazhRealm.WELT_MARCH, r._weltMarchEnsure(), window.THREE];
                    const recs = r._foundry?.recipes || {};
                    const kultur = Object.keys(recs).find(
                        (k) => AnazhRealm.KIND_POLICY[recs[k] && recs[k].kind]?.prefix === "haus_" && st.blueprints["haus_" + k]
                    );
                    const p = st.playerMesh.position;
                    const [hx, hz] = [p.x + 30, p.z + 18];
                    const [ab, halter] = [[], []];
                    const wand = (an) => (st.renderer._isHeadlessNull = an);
                    const langsam = async () => (takt(), await sleep(12)); // Platz- und Leib-Takt gehen an der Wanduhr (`platzMs`)
                    let e = null;
                    try {
                        if (kultur && wm) {
                            ab.push(huelle(r, "_weltPlatzWarten", (ruf, a) => (a[0] === true && V.fragten++, ruf())));
                            // die Wand fällt für EIN Haus: der Gang liest sie EINMAL (`ohneFeld`) — jeder andere Eintrag antwortet in
                            // ihm wie hinter ihr (er trägt für den Gang „kein Satz“, seine Satz-Fragen bleiben an der Wand), Bau,
                            // Räumung und Rewarm stehen hinter ihr
                            const fremd = (x) => x !== e;
                            ab.push(huelle(r, "tickArchitectureCulling", (ruf) => {
                                const ohne = r._cullWache().liste.filter((x) => fremd(x) && !x._ziegelSlot && !x._ziegelGebacken);
                                for (const x of ohne) x._ziegelGebacken = true;
                                wand(false);
                                try { return ruf(); } finally { wand(true); for (const x of ohne) delete x._ziegelGebacken; }
                            })); // prettier-ignore
                            ab.push(huelle(r, "_archZiegelFern", (ruf, a) => (fremd(a[0]) ? false : ruf())));
                            ab.push(huelle(r, "_archSatzFern", (ruf, a) => (fremd(a[0]) ? 0 : ruf())));
                            for (const k of ["_standStempel", "_rebuildArchitectureMesh", "_cullArchitectureMesh", "_foundryRewarmColdTrees", "_capNexusStructures"])
                                ab.push(huelle(r, k, (ruf) => { const war = st.renderer._isHeadlessNull; wand(true); try { return ruf(); } finally { wand(war); } })); // prettier-ignore
                            e = r.spawnArchitecture("haus_" + kultur, { x: hx, y: r._voxelSurfaceY(hx, hz) + 0.5, z: hz }, { silent: true });
                        }
                        if (e) {
                            await bisDa("das Haus trägt Mesh und Satz", () => r._archIsRendered(e) && !!e._ziegelSlot, 900, langsam);
                            V.satz = r._archIsRendered(e) && e._ziegelSlot ? 1 : 0;
                            V.stehtVor = await __weltStehtNach(takt).catch((x) => String(x.message).slice(0, 160));
                            // die Liste sinkt ein Feld unter ihre Reserve: der Leib-Takt lässt das schweigende Feld des Hauses fallen
                            const box = () => [{ box: true, c: new T3.Vector3(0, 1, 0), h: new T3.Vector3(1, 1, 1) }];
                            const M = new T3.Matrix4().makeTranslation(p.x, -900, p.z);
                            while (wm.freiFelder.length > WM.reserve - 1) {
                                const h = r._weltKapselSpawn("stand-takt:voll", M, box);
                                if (!h) break;
                                halter.push(h);
                            }
                            await bisDa("das schweigende Feld fällt", () => !e._ziegelSlot, 300, langsam);
                            V.fiel = e._ziegelSlot ? 0 : 1;
                            // das Haus fragt SELBST (sein fallender Satz weckt den Gang); fragt es nicht, regt die Linse die Welt
                            // (ein fremdes Ereignis), damit die übrigen Urteile messen
                            const wartet = () => r._archIsRendered(e) && !e._ziegelSlot && !!wm.platz && V.fragten > 0;
                            V.fragtTakte = await bisDa("der Vorbacker fragt nach Platz", wartet, 120, langsam);
                            V.fragteSelbst = wartet() ? 1 : 0;
                            if (!wartet()) {
                                r._weltRegt();
                                await bisDa("der Vorbacker fragt nach Platz (die Welt regt sich)", wartet, 120, langsam);
                            }
                            V.n = r._archIsRendered(e) && !e._ziegelSlot ? 1 : 0;
                            [V.reserve, V.frei, V.wartet] = [WM.reserve, wm.freiFelder.length, !!(wm.platz && !wm.platz.echt)];
                            V.steht = await __weltStehtNach(takt, 120).catch((x) => String(x.message).slice(0, 200));
                            // die Mutante „nie geweckt“: Platz über der Reserve, der Platz-Takt schweigt
                            const stumm = leihe(r, { _weltPlatzTakt() {} });
                            for (const h of halter.splice(0, 64)) r._weltFeldFrei(h);
                            V.freiNach = wm.freiFelder.length;
                            for (let i = 0; i < 50; i++) await langsam();
                            stumm();
                            V.mutante = e._ziegelSlot ? 1 : 0;
                            // der Platz-Takt der Welt weckt: der Vorbacker fragt und bäckt
                            V.takte = await bisDa("der Vorbacker bäckt", () => !!e._ziegelSlot, 600, langsam);
                            V.gebacken = e._ziegelSlot ? 1 : 0;
                        }
                    } finally {
                        ab.forEach((f) => f());
                        wand(true);
                        for (const h of halter) r._weltFeldFrei(h);
                        if (e) r.removeArchitecture(e);
                    }
                    await __weltStehtNach(takt);
                }
                // (RS) DIE SIMS IN RUHE (feld.K3): an der Mess-Wiese 60 s Spielzeit nach einer Tat (eine Ernte der Nah-Streu über
                // den echten Schreiber, ein Leben am Spieler), Wetter und Saison ruhen; danach (WS) je Sim ihr Ereignis
                {
                    const pm = st.playerMesh.position;
                    pm.set(MESS.x, r._voxelSurfaceY(MESS.x, MESS.z) + 1.8, MESS.z);
                    await __weltStehtNach(takt);
                    const [uhr, jahr] = [st.weatherEffectTime, st.autoSeason];
                    st.weatherEffectTime = -1e9;
                    st.autoSeason = false;
                    const S = window.__simLinseAn();
                    const simPhase = async (n, schritt) => {
                        const fs = [];
                        const z0 = st.spielZeit;
                        S.frame();
                        for (let i = 0; i < n; i++) {
                            if (schritt) schritt(i);
                            takt();
                            fs.push(S.frame());
                            if (i % 20 === 0) await sleep(2);
                        }
                        return window.__simPhase(fs, st.spielZeit - z0);
                    };
                    const W = (aus.simWecken = {});
                    try {
                        const vorher = { ernte: null };
                        (await window.__seite()).pflanzen((q) => vorher.ernte || (r._harvestScatterPick(q) && (vorher.ernte = q)));
                        r._depositLife(pm.x, pm.z);
                        vorher.leben = st.lifeField.size;
                        // das Wort des Spielers (die Seite), dann Sonne und trocken
                        const { wort } = await window.__seite();
                        // die Ruhe ist sonnig und trocken: der erste Zug der Welt-Uhr zog das Wetter der Front (feld.K2#2); das Wort
                        // senkt See und Fluss (wetter.K3: der Regen des Felds ist ein Term des Pegels) — die Neubauten der Chunks am
                        // Wasser kommen, bis die Welt steht (an der Mess-Wiese 12 Chunks, nach 60 Takten warteten noch 3)
                        wort("sunny");
                        r._naesseTakt(1e6);
                        await simPhase(60); // jede Sim geht ihren Gang bis an ihren Fixpunkt
                        await __weltStehtNach(takt);
                        aus.simRuhe = Object.assign(await simPhase(3600), { vorher });
                        const weck = async (n, ereignis) => {
                            ereignis();
                            W[n] = Object.assign(W[n] || {}, { wach: await simPhase(5), nachher: await simPhase(60) });
                        };
                        await weck("saison", () => r.setSeason("herbst"));
                        r.setSeason("sommer");
                        wort("rainy");
                        W.regen = { wach: await simPhase(5) };
                        wort("sunny");
                        r._naesseTakt(1e6);
                        await simPhase(5);
                        await __weltStehtNach(takt); // die Neubauten am Wasser (wetter.K3) vor der nächsten Weck-Probe
                        W.regen.nachher = await simPhase(60);
                        // der Laub-Rand rückt (das Gesetz `_laubRand` wächst mit dem gebauten Ring): der Ring tut seinen Schritt am EINEN
                        // Schreiber (`_ringWaechst`) — von einer Stufe unter dem Ziel zurück an das Ziel, im selben Zug (kein Bild sieht die
                        // Lücke); sein Ereignis weckt den Wuchs, und der schläft wieder, ohne das Gesetz je Bild zu fragen
                        W.wuchs = { offen: st.pendingFoliageChunks ? st.pendingFoliageChunks.size : 0 };
                        await weck("wuchs", () => {
                            const ring = st._activeRingRadius;
                            st._activeRingRadius = ring - 1;
                            r._ringWaechst();
                            W.wuchs.ring = [ring, st._activeRingRadius];
                            st._activeRingRadius = ring;
                        });
                        // die Ernte ist fällig: ihr Takt zur Zeit ihres Nachwachsens
                        S.frame();
                        r._tickScatterRegrow(Infinity);
                        const E = vorher.ernte;
                        W.nachwuchs = {
                            wach: window.__simPhase([S.frame()], 0),
                            nachgewachsen: !!E && !r._geerntetIn(E.key).has(E.id),
                            nachher: await simPhase(60),
                        };
                        // das Feld (feld.K3#2): vier Wellen zu 60 Taten fern, vor jeder vergehen 3 000 s Spielzeit (die vorige ist tot)
                        const C = AnazhRealm.LIFE_FIELD;
                        const lebt = (e) => Math.abs(e.a * Math.exp(-C.decayPerSec * (st.spielZeit - e.t))) >= C.epsilon;
                        const F = (W.feld = { wellen: [], geschrieben: 0 });
                        S.frame();
                        for (let w = 0; w < 4; w++) {
                            r._weltUhrNimm(st.spielZeit + 3000);
                            for (let i = 0; i < 60; i++) r._depositLife(MESS.x + 4000 + i * 64, MESS.z + 4000 + w * 64);
                            F.geschrieben += 540;
                            const alle = [...st.lifeField.values()];
                            F.wellen.push({ groesse: alle.length, tote: alle.filter((e) => !lebt(e)).length });
                        }
                        F.welle = window.__simPhase([S.frame()], 0);
                        // die Halde der Leben-Stufen (feld.K5): derselbe Fraß 100-mal an EINEM Ort (der Zeitraffer der Kaskade, je Tier und
                        // Takt) — die Halde (`_lebenWecker`) trägt jede Zelle des Stands (`_lebenStand`) höchstens einmal, kein Platz darüber
                        for (let i = 0; i < 100; i++) r._depositLife(MESS.x + 4000, MESS.z + 4400, -0.01);
                        F.ueber = r._lebenWecker.length - r._lebenStand.size;
                        // der Brand (stoffe.K2 · feld.K3#2): an der Mess-Wiese über das Wort bewölkt (Wind 0,3; die Bühne hält die Nässe
                        // trocken wie die W-Kette ihren Vorgänger) gezündet (der Weg des Brennglases), das Fenster in Schritten des Brands (`brandGehen`). Je Sprung
                        // der Front (die Zelle, von der sie kam → der Punkt, an dem sie ankam, brennend oder unterwegs) sein Tempo und sein
                        // Winkel zum Kopf der Quelle: mit dem Wind der Median der Köpfe (je Gras-Quelle ihr schnellster Sprung, ±20° um den
                        // Kopf), gegen den Wind (±30°) der schnellste Sprung; derselbe Herd mit dem Wind aus (`_windAt` ohne m/s) ist die
                        // Mutante, an ihrem noch brennenden Herd glut und Licht. Danach das Wort Regen bis zum Erlöschen; gezählt je Bild
                        // die Einheiten und die Zellen des Feuers (vor oder nach dem Bild, die mehr sind: eine Zündung trägt ihre
                        // Ankünfte) und am Herd die Asche
                        const [B, am, n0] = [AnazhRealm.BRAND, () => r.auraAt(MESS.x, MESS.z), (st.worldMeta.taten ||= []).length];
                        wort("cloudy");
                        r._naesseTakt = () => (st.naesse = 0);
                        const glut0 = am().glut;
                        // die Probe stellte die Uhr von Hand vier Wellen vor (12 000 s) und schreitet je Bild ihre eigene Uhr: die Stunde,
                        // die die nahen Regionen danach nachholen, steht dem Entfachen nicht voran (`_feldFolgeSteht`, wie in `brandSeite`)
                        r._feldFolgeSteht = () => true;
                        // (D) DIE DRUCKWELLE (same.physik.reaktion#2): in der Zelle westlich des Herds ein Donnerfass der Welt, westlich
                        // davon sechs Probe-Fenster (Holz-Bock + Scheibe 0,5 × 0,5 m × 4 mm aus der Zeile quarz, der Welle zugewandt) in
                        // 8 · 12 · 16 · 24 · 36 · 48 m, nördlich eine Kiste in 6 m; der Spieler steht am Herd (16 m). Der Funke fällt in der
                        // Zelle des Fasses NEBEN ihm (der Weg des Brennglases): die Front trägt die Frist der Ladung (`_ladungZuenden`), die
                        // Uhr rückt an sie, der Takt des Spiels läuft — die Ladung setzt um, die Welle trifft jeden Körper zu seiner Ankunft.
                        // Je EREIGNIS (Umsatz, Welle, Frist, Ende) der Stand der Rolle `druck` davor und danach (`S.stand`, Mitleser an der
                        // Instanz, kein Stamm-Ruf im Mitleser) und seine Leser; dazu, was das Gesetz am Bild der Welt verlangt: die Scheiben
                        // diesseits seiner Bruch-Grenze (schmiede `plattenLast` = 1, hier gerechnet) brechen, die jenseits stehen; die Kiste
                        // trägt Impuls × Schattenfläche ÷ Masse; der Spieler wird gestoßen, das Ohr hört den Knall; die Scherben schlafen ein.
                        // Die Probe räumt hinter sich auf (ihre Bauten, Pläne, das Feuer des Funkens), der Brand danach beginnt im leeren Feld.
                        // DAS BILD DES BRUCHS (druckwelle-bild): je gebrochenem Fenster die Scherben, die in der Welt liegen (die freien
                        // Körper, die seine Frist gebar), und ihre kleinste und größte Kante — gegen das Bruch-Gesetz seiner Scheibe an
                        // ihrem Ort (schmiede `plattenBruch` unter `DRUCK.scherbenAchse`: nah das feine Gitter, die Mitte fein, der Rand
                        // grob; zur Grenze hin das Kreuz); das Doppel-Fenster in 12 m trägt zwei Scheiben auf einem Bock. Der Zähler der
                        // Welle (`welle.scherben`) steht gegen die Welt. DER VORRAT am echten Rumpf: die zwei stehenden Fenster (36 · 48 m)
                        // unter einer Welle von Hand mit dreißigfacher Energie, ihr Vorrat (`DRUCK.scherbenFein`) bis auf fünf verbraucht —
                        // das erste trägt sein Kreuz und höchstens den Rest, das zweite sein Kreuz.
                        // `mutante` (in JEDEM Lauf die zweite Probe): der Rest eines Einsturzes räumt den Grund seines Werks ein zweites Mal
                        // (der Stand vor dem geerbten Grund, `_grundrissRaeumen` ohne `gehalten`) — die Linse zählt ihre Natur-Räumungen
                        // unter der Marke (`raeumt`), an ihr fällt DRUCK-ERBE; sieht sie keine, ist die Linse BLIND.
                        const druckProbe = async (mutante) => {
                            const t0 = performance.now();
                            const [SG, cs, DR] = [globalThis.__schmiedeCore.STOFF_GESETZ, AnazhRealm.LIFE_FIELD.cell, AnazhRealm.DRUCK];
                            const O = { x: MESS.x - cs, z: MESS.z };
                            const r3 = (v) => +(+v).toFixed(3);
                            const [plaeneVor, bautenVor] = [new Set(Object.keys(st.blueprints)), new Set(st.architectures)];
                            const setz = (typ, x, z, mehr) => r.spawnArchitecture(typ, { x, y: r._voxelSurfaceY(x, z) + 0.5, z }, { precise: true, silent: true, ...mehr });
                            const scheibe = (x) => ({ shape: "box", material: "quarz", size: { x: 0.5, y: 0.5, z: 0.004 }, position: { x, y: 0.37, z: 0 } });
                            const bock = (b) => ({ shape: "box", material: "holz", size: { x: b, y: 0.12, z: 0.35 }, position: { x: 0, y: 0.06, z: 0 } });
                            for (const [name, parts] of [["_druck_fenster", [bock(0.7), scheibe(0)]], ["_druck_doppel", [bock(1.3), scheibe(-0.3), scheibe(0.3)]]]) // prettier-ignore
                                st.blueprints[name] = AnazhRealm._etikett({ name, builtIn: false, vomGesetz: true, parts });
                            const fass = setz("donnerfass", O.x, O.z, { seed: 7999, ruht: true });
                            const kiste = setz("kiste", O.x, O.z + 6, { seed: 7906, ruht: true });
                            const fenster = [8, 12, 16, 24, 36, 48].map((d, k) => {
                                const [x, z] = [O.x - d, O.z + (k % 2 ? 0.45 : -0.45)];
                                return setz(d === 12 ? "_druck_doppel" : "_druck_fenster", x, z, { seed: 7000 + k, rotationY: Math.atan2(O.x - x, O.z - z) });
                            });
                            const D = { start: false, frist: null, ereignisse: [], einheiten: 0, rest: 0, scheiben: [], scherben: 0, zaehler: null, vorrat: null, staub: null, bildLage: null, wach: 0, schlafS: null, verzug: null };
                            if (fass && kiste && kiste._frei && fenster.every(Boolean)) {
                                const [energieJ, luft] = [r._ladungJ(fass), r._druckLuft()];
                                // der Blick des Schreibers: die Bauten im Radius der Welle — jeder Eintrag des Platz-Netzes, der weder Natur
                                // noch freier Körper ist (ohne das Fass: es geht vor ihr); `netz`: alle Einträge, die er durchgeht
                                const imRadius = r._blockerUmPlatz(O.x, O.z, SG.druckRadius(energieJ, luft), []);
                                const blick = imRadius.filter((e) => e !== fass && e.position && !e._frei && !r._istNatur(e)).length;
                                const taten0 = st.worldMeta.taten.length;
                                const E = D.ereignisse;
                                const wellen = [];
                                let [inWelle, inStaub] = [0, 0];
                                // die freien Körper der Probe außer der Kiste: die Scherben in der Welt; `geburt`: je Werk die, die seine Frist gebar
                                const freie = () => st.architectures.filter((e) => e._frei && !bautenVor.has(e) && e !== kiste);
                                const geburt = new Map();
                                // DIE LAGE IM BILD (druckwelle-bild): das Bild eines freien Körpers (sein Mesh: Drehung, und wo es seinen
                                // Schwerpunkt zeichnet) gegen die Lage, die der Löser hält (`_frei.q`, `_frei.p`) — hier gerechnet, ohne Ruf
                                // in den Stamm (ein Ruf zählte im Takt der Welle mit). Drei Augenblicke: `geburt` jede Scherbe, vor dem ersten
                                // Schritt des Lösers; `neubau` das Bild schlafender Scherben neu gebaut (was der Cull-Takt tut, wenn der Spieler
                                // geht und wiederkommt); `stand` eine Kiste, wie der Stand sie legt (gedreht, schlafend: die zweite Art der
                                // Group). Je Augenblick: `n` gemessene Bilder, `schief` mehr als 1° daneben, `grad` und `mm` der schlimmsten.
                                const BL = (D.bildLage = Object.fromEntries(["geburt", "neubau", "stand"].map((k) => [k, { n: 0, schief: 0, grad: 0, mm: 0 }])));
                                const bildLage = (wann, x) => {
                                    const [K, m, L] = [x._frei, x.mesh, BL[wann]];
                                    if (!K || !m) return;
                                    const [q, um] = [m.quaternion, x._gesetz.pose.um];
                                    const grad = (2 * Math.acos(Math.min(1, Math.abs(K.q[0] * q.w + K.q[1] * q.x + K.q[2] * q.y + K.q[3] * q.z))) * 180) / Math.PI;
                                    const c = new THREE.Vector3(um.x, um.y, um.z).multiplyScalar(K.s).applyQuaternion(q).add(m.position);
                                    L.n++;
                                    if (grad > 1) L.schief++;
                                    L.grad = Math.max(L.grad, r3(grad));
                                    L.mm = Math.max(L.mm, r3(Math.hypot(c.x - K.p[0], c.y - K.p[1], c.z - K.p[2]) * 1000));
                                };
                                // EIN Ereignis messen: der Stand der Rolle und ihre Leser davor und danach
                                const mess = (e, ruf) => {
                                    const [a0, l0] = [S.stand("druck"), S.leser("druck")];
                                    const aus = ruf();
                                    const l1 = S.leser("druck");
                                    e.einheiten = S.stand("druck") - a0;
                                    e.d = Object.fromEntries(Object.entries(l1).map(([m, n]) => [m, n - (l0[m] | 0)]));
                                    E.push(e);
                                    return aus;
                                };
                                r._ladungUmsatz = function (f) {
                                    const [e, w0, k0] = [{ art: "umsatz" }, inWelle, E.length];
                                    mess(e, () => P._ladungUmsatz.call(this, f));
                                    e.einheiten -= inWelle - w0; // ohne ihre Welle (sie misst sich selbst — ihre Einheiten, ihre Leser)
                                    for (const w of E.slice(k0, -1)) for (const m in w.d) e.d[m] -= w.d[m];
                                };
                                r._druckWelle = function (...a) {
                                    const e = { art: "welle", blick, netz: imRadius.length - 1 };
                                    const [s0, k0] = [inStaub, E.length];
                                    const w = mess(e, () => P._druckWelle.apply(this, a));
                                    e.einheiten -= inStaub - s0; // ohne ihren Staub (er misst sich selbst — seine Einheiten, seine Leser)
                                    for (const x of E.slice(k0, -1)) for (const m in x.d) e.d[m] -= x.d[m];
                                    inWelle += e.einheiten + inStaub - s0;
                                    if (w) wellen.push(w), Object.assign(e, { radius: r3(w.radius), treffer: w.treffer, energieMJ: r3(w.energieJ / 1e6) });
                                    return w;
                                };
                                // DER STAUB DER WELLE als eigenes Ereignis (`_druckStaub`, unter dem Schreiber gerufen): `zellen` die Zellen
                                // des Lands, die er nach einer Narbe fragt (das Quadrat um den Radius, in dem ihr Überdruck die Asche löst,
                                // samt dem Saum der Nachbarinnen — hier gerechnet), `ballen` die Saat, die er legt
                                r._druckStaub = function (w) {
                                    const rand = SG.druckRadius(w.energieJ, w.luft, SG.zeile("asche").sigB);
                                    const breit = (v) => Math.floor((v + rand) / cs) - Math.floor((v - rand) / cs) + 3;
                                    const e = { art: "staub", zellen: rand > 0 ? breit(w.x) * breit(w.z) : 0 };
                                    e.ballen = mess(e, () => P._druckStaub.call(this, w));
                                    inStaub += e.einheiten;
                                    return e.ballen;
                                };
                                r._druckTrifft = function (f) {
                                    const plan = f.art === "werk" && f.q ? (f.q._gesetz && f.q._gesetz.plan) || st.blueprints[f.q.type] : null;
                                    const p = f.q ? (f.q._frei ? { x: f.q._frei.p[0], z: f.q._frei.p[2] } : f.q.position) : st.playerMesh.position;
                                    const e = { art: f.art, R: r3(Math.hypot(p.x - f.welle.x, p.z - f.welle.z)), teile: plan && plan.parts ? plan.parts.length : 0 };
                                    const vor = new Set(freie());
                                    mess(e, () => P._druckTrifft.call(this, f));
                                    const neu = freie().filter((x) => !vor.has(x));
                                    e.scherben = neu.length;
                                    for (const x of neu) bildLage("geburt", x);
                                    if (f.q && neu.length) geburt.set(f.q, neu);
                                };
                                r._druckEnde = function (w) {
                                    mess({ art: "ende" }, () => P._druckEnde.call(this, w));
                                };
                                const stoss = new Map();
                                r._druckStoss = function (q, ...a) {
                                    const dv = P._druckStoss.call(this, q, ...a);
                                    stoss.set(q, dv);
                                    return dv;
                                };
                                r._substanzKlang = function (art, tags, ...a) {
                                    if (art === "knall") D.ohr = { dp: r3(tags.dp), dauer: r3(tags.dauer) };
                                    return P._substanzKlang.call(this, art, tags, ...a);
                                };
                                if (mutante) r._grundrissRaeumen = (haus) => P._grundrissRaeumen.call(r, haus);
                                // die zweite Mutante desselben Laufs: der Bau des Bilds zeigt die Pose des Gesetzes nicht (der Stand vor
                                // druckwelle-bild) — `_werkPoseZeigen` schweigt, solange `_rebuildArchitectureMesh` baut
                                if (mutante)
                                    r._rebuildArchitectureMesh = function (e) {
                                        this._werkPoseZeigen = () => {};
                                        try {
                                            return P._rebuildArchitectureMesh.call(this, e);
                                        } finally {
                                            delete this._werkPoseZeigen;
                                        }
                                    };
                                const eigen = ["_ladungUmsatz", "_druckWelle", "_druckStaub", "_druckTrifft", "_druckEnde", "_druckStoss", "_substanzKlang", "_grundrissRaeumen", "_rebuildArchitectureMesh", "_brandZellen", "_brandNarbeFn"];
                                const [kiste0, kisteR] = [kiste._frei.p.slice(), Array.from(kiste._frei.R)];
                                const wachN = () => st.architectures.filter((e) => e._frei && !e._frei.schlaf && !bautenVor.has(e)).length;
                                const loesche = () => (st.brandFeld && (r._brandRest = st.brandFeld.clear()), (st.worldMeta.taten.length = taten0)); // das Feuer des Funkens: von Hand, ohne Asche
                                try {
                                    // der Funke fällt 2,4 m vor dem Fass GEGEN den Kopf der Front (ihr Bett und ihr Tempo aus dem Gesetz des Brands):
                                    // die Spitze läuft auf die Ladung zu, ihre Frist ist die Laufzeit der Front
                                    const bett = r._brandStoff(Math.floor(O.x / cs), Math.floor(O.z / cs), st.spielZeit);
                                    const T = bett && r._brandTempo(bett, st.spielZeit);
                                    const [kx, kz] = T ? [T.px, T.pz] : [1, 0];
                                    D.start = !!r._brandEntfachen(O.x - 2.4 * kx, O.z - 2.4 * kz);
                                    D.frist = fass._ladungFrist != null ? r3(fass._ladungFrist - st.spielZeit) : null;
                                    if (D.frist > 0) {
                                        D.uhr = { sim: +(+st._fixedSimTime).toFixed(3), spiel: +st.spielZeit.toFixed(3), wind: [0, 1, 2, 3, 4, 6].map((s) => +r._windAt(O.x - 10, O.z, st._fixedSimTime + s).ms.toFixed(2)) };
                                        r._weltUhrNimm(fass._ladungFrist - 0.02);
                                        S.frame();
                                        const bild = () => (takt(), (D.einheiten += S.frame().druck));
                                        for (let i = 0; i < 600 && (!wellen.length || (r._druckFristen && r._druckFristen.length)); i++) bild();
                                        const w = wellen[0];
                                        if (w) {
                                            const tW = st.spielZeit;
                                            // die Bruch-Grenze des Gesetzes für die Scheibe der Probe (σ = σ_B: `plattenLast` = 1), hier gerechnet
                                            const quarz = r._stoff("quarz");
                                            const last = (R) => ((x) => SG.plattenLast(quarz, 0.5, 0.5, 0.004, x.dp, x.dauer))(SG.druckwelle(energieJ, R, luft));
                                            let [lo, hi] = [0.5, 400];
                                            for (let i = 0; i < 60; i++) ((m) => (last(m) >= 1 ? (lo = m) : (hi = m)))(Math.sqrt(lo * hi));
                                            D.grenze = r3(Math.sqrt(lo * hi));
                                            // je Fenster: was das Bruch-Gesetz seiner Scheibe am Ort verlangt (`soll` Scherben, ihre kleinste und
                                            // größte Kante; `kreuz`: vier je Scheibe) und was in der Welt liegt (die freien Körper seiner Frist)
                                            D.scheiben = fenster.map((e) => {
                                                const R = Math.hypot(e.position.x - w.x, e.position.y - 0.5 + 0.37 - w.y, e.position.z - w.z);
                                                const [n, neu] = [e.type === "_druck_doppel" ? 2 : 1, geburt.get(e) || []];
                                                const s = { R: r3(R), gebrochen: !st.architectures.includes(e), last: r3(last(R)), kreuz: 4 * n, scherben: neu.length };
                                                const B = SG.plattenBruch(0.5, 0.5, 0.004, last(R), DR.scherbenAchse);
                                                if (B) {
                                                    const breit = [B.lang, B.kurz].flatMap((u) => u.slice(1).map((x, k) => (x - u[k]) * 0.5));
                                                    Object.assign(s, { soll: n * (B.lang.length - 1) * (B.kurz.length - 1), kanteSoll: [r3(Math.min(...breit)), r3(Math.max(...breit))] });
                                                }
                                                if (neu.length) {
                                                    const halb = neu.map((x) => Array.from(x._frei.halb).sort((a, b) => b - a));
                                                    s.kante = [r3(2 * Math.min(...halb.map((h) => h[1]))), r3(2 * Math.max(...halb.map((h) => h[0])))];
                                                }
                                                return s;
                                            });
                                            loesche();
                                            // die Scherben schlafen ein: der Takt läuft, bis keine mehr wach liegt (höchstens 10 s Spielzeit)
                                            D.scherben = freie().length;
                                            D.zaehler = w.scherben;
                                            const __W = (D.wecker = {});
                                            const __o = r._freiWecken;
                                            r._freiWecken = function (K) {
                                                const z = (new Error().stack.split("\n")[2] || "").trim().replace(/^at /, "").replace(/\(?https?:\/\/[^/]+\//, "").replace(/\?v=[\d.]+/, "").slice(0, 60);
                                                const k = `${K.schlaf ? "S" : "w"} ${z} @${(st.spielZeit - tW).toFixed(0)}s`;
                                                __W[k] = (__W[k] || 0) + 1;
                                                return __o.call(this, K);
                                            };
                                            D.spaet = [];
                                            let __i = 0;
                                            while (st.spielZeit - tW < 10 && wachN() > 0) {
                                                bild();
                                                const dt = st.spielZeit - tW;
                                                if (dt > 0.8 && ++__i % 15 === 0 && D.spaet.length < 30)
                                                    D.spaet.push(((von) => [
                                                        +dt.toFixed(2),
                                                        wachN(),
                                                        Object.entries(st.architectures.filter((e) => e._frei && !e._frei.schlaf).reduce((z, e) => ((z[String(e.type).replace(/_[0-9a-f]{6,}$/, "") + (bautenVor.has(e) ? "*" : "")] = (z[String(e.type).replace(/_[0-9a-f]{6,}$/, "") + (bautenVor.has(e) ? "*" : "")] || 0) + 1), z), {})).map((x) => x.join(":")).join(" "),
                                                        ...st.architectures
                                                            .filter((e) => e._frei && !e._frei.schlaf && !bautenVor.has(e))
                                                            .slice(0, 3)
                                                            .map((e) => `${e.type} v${(+e._frei.tempo || 0).toFixed(3)} vy${e._frei.v[1].toFixed(2)} r${(+e._frei.ruhe || 0).toFixed(2)} @${e.position.x.toFixed(2)},${e.position.y.toFixed(2)},${e.position.z.toFixed(2)} N[${e._frei.nachbarn.filter((x) => !x.schlaf && !(x.ruhe >= 0.3)).map((x) => `${(von.get(x) || {}).type || "?"} v${(+x.tempo || 0).toFixed(3)} r${(+x.ruhe || 0).toFixed(2)}${bautenVor.has(von.get(x)) ? "*" : ""}`).join("; ")}]`),
                                                    ])(new Map(st.architectures.filter((e) => e._frei).map((e) => [e._frei, e]))));
                                            }
                                            delete r._freiWecken;
                                            D.wach = wachN();
                                            D.schlafS = D.wach ? null : r3(st.spielZeit - tW);
                                            // das Bild schlafender Scherben neu gebaut, wie der Cull-Takt es baut (höchstens 16: die Probe bleibt kurz)
                                            for (const x of freie().filter((x) => x._frei.schlaf && x.mesh).slice(0, 16)) {
                                                r._cullArchitectureMesh(x);
                                                r._rebuildArchitectureMesh(x);
                                                bildLage("neubau", x);
                                            }
                                            // die zweite Art der Group: eine Kiste, wie der Stand sie legt — 57° um ihre Längsachse gedreht, schlafend
                                            // (kein Schritt des Lösers zeigt sie je, bis etwas sie weckt)
                                            const lieg = setz("kiste", O.x + 4, O.z + 10, { seed: 7907, ruht: true, drehung: [Math.cos(0.5), Math.sin(0.5), 0, 0] });
                                            if (lieg) bildLage("stand", lieg), r.removeArchitecture(lieg, { still: true });
                                            D.verzug = r3(w.verzug);
                                            const K = kiste._frei;
                                            const [dx, dz] = [kiste0[0] - w.x, kiste0[2] - w.z];
                                            const d = Math.hypot(dx, dz);
                                            const x = SG.druckwelle(energieJ, Math.hypot(d, kiste0[1] - w.y), luft);
                                            // die Schattenfläche der Kiste quer zur Welle, in ihrer Lage vor dem Stoß: Σ Fläche × |Achse · n|
                                            const a = (k) => Math.abs(dx * kisteR[k] + dz * kisteR[6 + k]) / d;
                                            const A = 4 * (K.hy * K.hz * a(0) + K.hx * K.hz * a(1) + K.hx * K.hy * a(2));
                                            D.kiste = { R: r3(d), dv: r3(stoss.get(kiste) || 0), soll: r3((x.impuls * A) / K.m), wegM: r3(Math.hypot(K.p[0] - kiste0[0], K.p[2] - kiste0[2])) };
                                            D.spieler = { R: r3(Math.hypot(MESS.x - w.x, MESS.z - w.z)), dv: r3(stoss.get(st.playerMesh) || 0) };
                                            // der Vorrat am echten Rumpf (`_druckWerk`): die Welle von Hand, ihr Vorrat bis auf `rest` verbraucht
                                            const rest = 5;
                                            const hand = { ...w, energieJ: w.energieJ * 30, scherben: 0, fein: DR.scherbenFein - rest, werke: 0, teile: 0 };
                                            const bricht = (e) => {
                                                const vor = new Set(freie());
                                                P._druckWerk.call(r, e, hand);
                                                return freie().filter((x) => !vor.has(x)).length;
                                            };
                                            D.vorrat = { rest, scherben: fenster.slice(4).map(bricht) };
                                            // DER STAUB IM ECHTEN TAKT (druckwelle-bild (b): `_druckStaub` sät, `_druckBild` zeichnet): eine ZWEITE
                                            // Welle am Ort des Fasses durch den EINEN Schreiber (`_druckWelle`, ohne Ladung: kein Satz im Journal; ihre
                                            // Fristen fallen im Takt, jedes Ereignis an seinem Soll — der Staub mit seinen Ballen) über einer
                                            // GESTELLTEN Narbe — jede Zelle östlich der Zelle des Fasses ist
                                            // verbrannt (Asche voll), westlich brannte nie etwas. Gestellt ist der EINGANG (der Speicher der Narbe,
                                            // `_brandZellen`), keine Tat geschrieben; die Narbe rechnet ihre Quelle (`_brandNarbeFn`). Das Soll
                                            // rechnet die Probe aus dem Gesetz, auf dem feinen Raster ½ m: je Fläche die Last, die die Welle an
                                            // ihrem Abstand hebt (schmiede `staubLast`, das Korn aus den Zeilen gras und asche) × die Decke der
                                            // Narbe — ihre Summe ist die Masse, die aufsteigt. Gemessen: die Saat (`druckStaub.saat`: Ballen, Masse,
                                            // Ballen westlich der Narbe und jenseits des Radius, in dem der Überdruck die Asche löst), dann das
                                            // BILD im Takt der Welt — je Bild der Staub in der Luft nach dem Stand der Ballen (Masse × der Anteil
                                            // ihrer Säule, der noch steht) gegen den Staub, den der gezeichnete Satz trägt (sein Puffer `aRauch`:
                                            // Σ −ln(1 − a) · π r² ÷ (profil + 1) ÷ km), bis kein Ballen mehr steht.
                                            // `mutante`: die Narbe gilt überall als Asche (der Stand „Staub, wo die Welle hinkommt“) — nur die Saat.
                                            {
                                                const [A, halm, SB, g, cO] = [SG.zeile("asche"), r._stoff("gras"), st.druckStaub, DR.staub.rasterM, Math.floor(O.x / cs)];
                                                const [rand, korn] = [SG.druckRadius(w.energieJ, luft, A.sigB), halm.koernung * Math.cbrt((AnazhRealm.BRAND.mineral.gesamt * halm.rho) / A.rho)];
                                                const [vorratKg, km, ost] = [halm.brenn.last * AnazhRealm.BRAND.mineral.gesamt, 3 / (A.rho * korn), (cO + 1) * cs];
                                                const brannte = { asche: 1, busch: 0, wald: 0 };
                                                const zelleH = (cx) => (cx > cO ? brannte : null);
                                                const narbeH = P._brandNarbeFn.call(r, zelleH);
                                                const f = 0.5;
                                                let [soll, flaeche] = [0, 0];
                                                for (let z = O.z - rand + f / 2; z < O.z + rand; z += f)
                                                    for (let x = Math.max(O.x - rand, ost - cs) + f / 2; x < O.x + rand; x += f) {
                                                        const d = Math.hypot(x - O.x, z - O.z);
                                                        const na = d <= rand ? narbeH(x, z) : null;
                                                        const decke = na ? na.m * na.asche : 0;
                                                        const s = decke > 0 ? SG.staubLast(SG.druckwelle(w.energieJ, d, luft), A, korn, luft) : null;
                                                        if (s) (soll += Math.min(s.last, vorratKg) * decke * f * f), (flaeche += decke * f * f);
                                                    }
                                                // der Staub der echten Welle (am Feuer des Funkens): gezählt, dann von Hand geräumt
                                                const echt = { ballen: w.staub, lebend: SB.saat.length + SB.teilchen.length };
                                                [SB.saat.length, SB.teilchen.length, SB.uhr] = [0, 0, null];
                                                r._brandZellen = () => zelleH;
                                                if (mutante) r._brandNarbeFn = () => () => ({ m: 1, asche: 1, busch: 0, wald: 0 });
                                                let gesaet = null;
                                                try {
                                                    const w2 = r._druckWelle({ x: w.x, y: w.y, z: w.z }, w.energieJ, st.spielZeit, null);
                                                    gesaet = w2 ? w2.staub : null;
                                                } finally {
                                                    delete r._brandZellen;
                                                    delete r._brandNarbeFn;
                                                }
                                                const saat = SB.saat.slice();
                                                const X = (D.staub = {
                                                    ...{ randM: r3(rand), kornMm: r3(korn * 1000), ostM: r3(ost - O.x), narbeM2: r3(flaeche), sollG: r3(soll * 1000), echt },
                                                    ...{ gesaet, ballen: saat.length, max: DR.staub.max, grob: saat.filter((q) => q.fl > g * g * 1.5).length },
                                                    masseG: r3(saat.reduce((s, q) => s + q.m, 0) * 1000),
                                                    aussen: saat.filter((q) => q.x < ost - 4).length,
                                                    jenseits: saat.filter((q) => Math.hypot(q.x - O.x, q.z - O.z) > rand + 0.5).length,
                                                });
                                                if (!mutante && saat.length) {
                                                    const [lebenS, tS, profil] = [Math.max(...saat.map((q) => (2 * q.b) / q.sink)), st.spielZeit, AnazhRealm.RAUCH_BILD.profil];
                                                    const luftKg = () => SB.teilchen.reduce((s, p) => s + p.m * Math.max(0, 1 - (p.sink * p.alt) / (2 * p.b)), 0);
                                                    const satzKg = () => {
                                                        const Z = st.druckStaubSatz;
                                                        if (!Z || !Z.mesh) return null;
                                                        let m = 0;
                                                        for (let k = 0, d = Z.daten.array; k < Z.mesh.count; k++) m += (-Math.log(1 - d[3 * k]) * Math.PI * d[3 * k + 1] ** 2) / (profil + 1) / km;
                                                        return m;
                                                    };
                                                    Object.assign(X, { lebenS: r3(lebenS), bilder: 0, ballenMax: 0, satzMax: 0, luftMaxG: 0, satzMaxG: 0, ohneSatz: 0, nebenG: 0, steigt: 0 });
                                                    let zuletzt = Infinity;
                                                    while (st.spielZeit - tS < lebenS + 2 && (SB.saat.length || SB.teilchen.length)) {
                                                        bild();
                                                        const [n, Z, luftG, sG] = [SB.teilchen.length, st.druckStaubSatz, luftKg() * 1000, satzKg()];
                                                        const imSatz = Z && Z.mesh ? Z.mesh.count : 0;
                                                        X.bilder++;
                                                        [X.ballenMax, X.satzMax, X.luftMaxG] = [Math.max(X.ballenMax, n), Math.max(X.satzMax, imSatz), Math.max(X.luftMaxG, luftG)];
                                                        if (imSatz !== n) X.ohneSatz++;
                                                        else if (n) (X.satzMaxG = Math.max(X.satzMaxG, sG * 1000)), (X.nebenG = Math.max(X.nebenG, Math.abs(sG * 1000 - luftG)));
                                                        if (!SB.saat.length) {
                                                            if (luftG > zuletzt + 1e-9) X.steigt++; // nach der letzten Geburt wächst der Staub in der Luft nie
                                                            zuletzt = luftG;
                                                        }
                                                    }
                                                    X.endeS = SB.saat.length || SB.teilchen.length ? null : r3(st.spielZeit - tS);
                                                    for (const k of ["luftMaxG", "satzMaxG", "nebenG"]) X[k] = r3(X[k]);
                                                    bild();
                                                    bild(); // danach ruht das Bild: kein Ballen im Satz, die Uhr des Staubs steht
                                                    X.danach = { satz: st.druckStaubSatz && st.druckStaubSatz.mesh ? st.druckStaubSatz.mesh.count : null, uhr: SB.uhr };
                                                }
                                                [SB.saat.length, SB.teilchen.length, SB.uhr] = [0, 0, null];
                                            }
                                            S.frame(); // die Einheiten dieser Probe gehören keinem Bild des Takts
                                        }
                                        D.rest = D.einheiten - E.reduce((s, e) => s + e.einheiten, 0);
                                    }
                                } finally {
                                    for (const k of eigen) delete r[k];
                                    // je Ereignis seine acht größten Leser und sein Erbe-Maß: die Rufe der Natur-Räumung unter der Marke
                                    for (const e of E) {
                                        if (e.d._naturRaeumen > 0) e.raeumt = e.d._naturRaeumen;
                                        e.leser = Object.entries(e.d).filter((x) => x[1] > 0).sort((a, b) => b[1] - a[1]).slice(0, 8);
                                        delete e.d;
                                    }
                                }
                                loesche();
                            }
                            for (const e of st.architectures.filter((e) => !bautenVor.has(e))) r.removeArchitecture(e, { still: true });
                            for (const k of Object.keys(st.blueprints)) if (!plaeneVor.has(k)) delete st.blueprints[k];
                            pm.set(MESS.x, r._voxelSurfaceY(MESS.x, MESS.z) + 1.8, MESS.z);
                            st.playerVel.setValue(0, 0, 0);
                            await __weltStehtNach(takt); // die Kacheln unter den Bauten der Probe wachsen nach, der Spieler steht wieder
                            D.nachher = await simPhase(60);
                            D.ms = Math.round(performance.now() - t0);
                            return D;
                        };
                        W.druck = await druckProbe(false);
                        // die Mutante jedes Laufs: ihre Natur-Räumungen unter der Marke, die Einheiten ihrer Brüche, ihre Dauer
                        const DM = await druckProbe(true);
                        W.druck.mutante = {
                            raeumt: DM.ereignisse.reduce((s, e) => s + (e.raeumt | 0), 0),
                            bruch: DM.ereignisse.filter((e) => e.art === "werk" && e.scherben > 0).map((e) => e.einheiten),
                            // je Augenblick der Lage im Bild [schief, Grad]: der Bau ohne die Pose des Gesetzes
                            bild: DM.bildLage ? Object.fromEntries(Object.entries(DM.bildLage).map(([k, L]) => [k, [L.schief, L.grad]])) : null,
                            // der Staub unter der Narbe, die überall als Asche gilt: Ballen westlich der gestellten Narbe, seine Masse gegen das Soll
                            staub: DM.staub ? { aussen: DM.staub.aussen, masseG: DM.staub.masseG, sollG: DM.staub.sollG } : null,
                            ms: DM.ms,
                            schlafS: DM.schlafS, wach: DM.wach, spaet: DM.spaet, wecker: DM.wecker, uhr: DM.uhr,
                        };
                        // DAS FENSTER ZÄHLT SCHRITTE DES BRANDS, nie Bilder (linse-brand-schritte): die Uhr der Welt geht erst einen
                        // Schritt weiter, wenn der vorige ganz ist (`_brandRest` leer) — ein langsamer Läufer geht denselben Schritt in
                        // mehr Bildern, nie weniger Schritte, und jedes Bild ohne Rest zeigt den ganzen Schritt (`jeBild(vor, ganz)`).
                        // Nach dem letzten Schritt geht sein Rest zu Ende, ohne dass die Uhr weiter geht. Bis hier zählte das Fenster
                        // Bilder: dasselbe Gesetz trug auf swiftshader weniger Schritte, und FRONT-MIT schwankte 1,029 ↔ 0,335 m/s. Der
                        // Deckel der Bilder (50 je Schritt) endet LAUT (`deckel`, FENSTER-DECKEL), nie still
                        const brandGehen = async (n, solange, jeBild) => {
                            const [u0, G] = [r._brandUhr, { schritte: 0, bilder: 0 }];
                            const bild = () => {
                                const vor = st.brandFeld ? st.brandFeld.size : 0;
                                takt();
                                G.bilder++;
                                G.schritte = Math.round((r._brandUhr - u0) / B.schrittS);
                                jeBild(vor, !r._brandRest);
                            };
                            while (G.schritte < n && solange()) {
                                if (G.bilder >= 50 * n) return Object.assign(G, { deckel: G.bilder });
                                if (!r._brandRest) r._weltUhrNimm(r._brandUhr + B.schrittS);
                                bild();
                                if (G.bilder % 20 === 0) await sleep(2);
                            }
                            for (let k = 0; r._brandRest && k < 50 * n; k++) bild();
                            return r._brandRest ? Object.assign(G, { deckel: G.bilder }) : G;
                        };
                        const lauf = async (n) => {
                            const h0 = r._brandEntfachen(MESS.x, MESS.z);
                            const [Z, H, bf, I] = [{ zellen: [], einheiten: [], gang: [], zuendung: [], ankuenfte: [], betten: [], masken: [], punkte: [], kahl: [], lesungen: [], rufe: [], rufeZ: [], kachel: [], kachelSoll: [], ringe: [], ringM2: [], rufeK: [], start: !!h0 }, new Map(), st.brandFeld, new Map()];
                            // DER FALL DER KACHELN AN SEINEM MASS (linse-brand-schritte 4): die Asche malt je Bild EIN Viertel EINER
                            // glühenden Zelle (`_brandMalen`), und je Zelle höchstens alle `BRAND.wieseS` fällt die Nah-Wiese und Nah-Streu
                            // über dem Rechteck ihrer geänderten Viertel (`_nahRingNeuIn`, ±½ Zelle) — je Kachel im Rechteck EIN Ruf des
                            // Fall-Lesers. Das ist Arbeit am Schirm, nie am Feld: sie wächst mit dem Rechteck, nicht mit den Zellen des
                            // Brands (CI c8e95d38: 98 + 24 Kacheln bei 9 Zellen). Die Probe zählt je Bild die Neubauten, ihre Fläche und
                            // die Kacheln, die in ihren Rechtecken stehen (vor dem Fall gezählt, an den Karten vorbei: keine Einheit)
                            const [P0, KF] = [Object.getPrototypeOf(r), { malen: false, ringe: 0, m2: 0, kacheln: 0 }];
                            const stehen = (map, K, x0, z0, x1, z1) => {
                                let n = 0;
                                if (map)
                                    for (const key of Map.prototype.keys.call(map)) {
                                        const [tx, tz] = key.split(",").map(Number);
                                        if (!((tx + 1) * K < x0 || tx * K > x1 || (tz + 1) * K < z0 || tz * K > z1)) n++;
                                    }
                                return n;
                            };
                            r._brandMalen = function (...a) {
                                KF.malen = true;
                                try {
                                    return P0._brandMalen.apply(this, a);
                                } finally {
                                    KF.malen = false;
                                }
                            };
                            r._nahRingNeuIn = function (x0, z0, x1, z1) {
                                const [nw, ns] = [st.nahWiese, st.nahStreu];
                                const soll = stehen(nw && nw.kacheln, AnazhRealm.NAH_WIESE.kachel, x0, z0, x1, z1) + stehen(ns && ns.kacheln, AnazhRealm.NAH_STREU.kachel, x0, z0, x1, z1);
                                const n = P0._nahRingNeuIn.call(this, x0, z0, x1, z1);
                                if (KF.malen && n > 0) (KF.ringe++, (KF.m2 = Math.max(KF.m2, (x1 - x0) * (z1 - z0))), (KF.kacheln += soll));
                                return n;
                            };
                            // das Gemessene, das der Herd schon trägt: sein Bett maß die Tat `_brandEntfachen` (die Linse zählt sie als Tat)
                            const gesehen = new Set((r._brandBett || new Map()).keys());
                            const haeufigste = (je, n) => Object.entries(je).sort((a, b) => b[1] - a[1]).slice(0, n);
                            // das Gitter des Betts aus dem Gesetz der Welt: die groben Punkte je Bett, die feinen je Maske
                            const [GROB, FEIN] = [B.bettGrob.length, B.bettGitter ** 2];
                            // DIE SPRÜNGE DER FRONT, gelesen nur an ganzen Schritten (ein Bild mit Rest zeigt einen halben, den der schnelle
                            // Läufer nie sieht): je Zelle, deren Quelle brennt, ihr Tempo und ihr Winkel zum Kopf der Quelle
                            const spruenge = () => {
                                for (const [k, c] of bf) {
                                    const q = bf.get(c.von);
                                    const [dx, dz] = q && q.t0 !== null ? [c.ex - q.ex, c.ez - q.ez] : [0, 0];
                                    const d = Math.hypot(dx, dz);
                                    if (d > 1) H.set(k, { q: c.von, v: d / (c.an - q.t0), c: (dx * q.kopf[0] + dz * q.kopf[1]) / d, gras: q.stoff === "gras" });
                                    // jede gefangene Zelle mit dem Punkt und der Zeit, zu der die Front sie erreichte (das Vorrücken)
                                    if (c.t0 !== null && !I.has(k)) I.set(k, { ex: c.ex, ez: c.ez, an: c.t0, stoff: c.stoff, w: c.w, boden: c.boden, gx: c.gx, gz: c.gz });
                                }
                            };
                            S.frame();
                            const G = await brandGehen(n, () => bf.size, (vor, ganz) => {                                Z.zellen.push(Math.max(vor, bf.size));
                                // DER GANG UND DIE ZÜNDUNG, JE AN IHRER EINHEIT (front-brand): der Gang der Zellen (`brand`: alles unter
                                // `_tickBrand` außerhalb der Zündung) und die Zündung (`zuendung`: alles unter `_brandZuenden`) je Bild
                                // getrennt, je mit ihren häufigsten Lesern (die Linse nennt den Täter beim Namen); `einheiten` ihre Summe
                                const bild = S.frame();
                                // der Gang ohne den Fall der Kacheln (sein eigenes Maß: `kachel` gegen die Kacheln der Rechtecke)
                                const kf = (bild.je.brand._nahStreuKachelFaellt | 0) + (bild.je.brand._nahWieseKachelFaellt | 0);
                                Z.gang.push(bild.brand - kf);
                                Z.kachel.push(kf);
                                Z.kachelSoll.push(KF.kacheln);
                                Z.ringe.push(KF.ringe);
                                Z.ringM2.push(KF.m2);
                                Object.assign(KF, { ringe: 0, m2: 0, kacheln: 0 });
                                Z.zuendung.push(bild.zuendung);
                                Z.einheiten.push(bild.brand + bild.zuendung);
                                const [jeK, jeG] = [{}, {}];
                                for (const [m, c] of Object.entries(bild.je.brand)) (/^_nah(Streu|Wiese)KachelFaellt$/.test(m) ? jeK : jeG)[m] = c;
                                Z.rufe.push(haeufigste(jeG, 6));
                                Z.rufeK.push(haeufigste(jeK, 2));
                                Z.rufeZ.push(haeufigste(bild.je.zuendung, 12));
                                // DIE ARBEIT DER ZÜNDUNG AUS DER ÄNDERUNG DER WELT, nie aus der Zahl ihrer Lese-Rufe (ein Soll aus den Rufen
                                // wüchse mit dem Täter): die Ankünfte der Front (je fällige Zelle EIN Ruf von `_brandZuenden`), die Betten, die
                                // die Welt in diesem Schritt NEU maß (die neuen Einträge des Gemessenen `_brandBett`), ihre Bett-Punkte nach
                                // dem Gesetz (`bettGrob` je Bett, dazu `bettGitter`² je Maske: ein Bett mit Kante, Brennstoff UND Kahles) und
                                // unter den Punkten die KAHLEN (kein Brennstoff: sie fragen das Feld unter der Boden-Karte, EIN Marsch durch
                                // ihre Säule) — die der Maske gezählt, die groben einer Maske und eines Orts ohne Bett als Obergrenze.
                                // `lesungen` (die Rufe des EINEN Stoff-Lesers unter der Zündung) trägt nur die Zeile des Täters, nie das Soll
                                Z.ankuenfte.push(bild.je.brand._brandZuenden | 0);
                                Z.lesungen.push(bild.je.zuendung._kontaktStoffAt | 0);
                                let [betten, masken, punkte, kahl] = [0, 0, 0, 0];
                                for (const [k, f] of r._brandBett || [])
                                    if (!gesehen.has(k)) {
                                        gesehen.add(k);
                                        betten++;
                                        punkte += GROB;
                                        if (!f) kahl += GROB;
                                        else if (f.bett) (masken++, (punkte += FEIN), (kahl += GROB + f.bett.length - f.bett.reduce((a, b) => a + b, 0)));
                                    }
                                Z.betten.push(betten);
                                Z.masken.push(masken);
                                Z.punkte.push(punkte);
                                Z.kahl.push(kahl);
                                if (ganz) spruenge();
                            }).finally(() => (delete r._brandMalen, delete r._nahRingNeuIn));
                            const [kopf, alle] = [new Map(), [...H.values()]];
                            for (const h of alle) if (!(kopf.get(h.q)?.v >= h.v)) kopf.set(h.q, h);
                            const f = (a, i) => +(a.map((h) => h.v).sort(aufsteigend)[i(a.length)] || 0).toFixed(3);
                            const mit = [...kopf.values()].filter((h) => h.c >= 0.94 && h.gras);
                            Object.assign(Z, G);
                            // DAS VORRÜCKEN DES KOPFS (linse-brand-schritte 2): die vorderste gefangene Zelle längs des Kopfs des Herds
                            // (`kopf` der Zünd-Zelle, `_brandTempo`), ihr Weg vom Herd durch die Zeit, zu der die Front sie erreichte —
                            // wie schnell die Front beim Spieler ankommt; dazu R des Herds (die Erwartung) und der Winkel des Kopfs zum
                            // Gitter der Zellen (0° längs einer Achse, 45° diagonal)
                            if (h0 && h0.kopf) {
                                const [kx, kz] = h0.kopf;
                                let [p, t] = [0, 0];
                                for (const c of I.values()) {
                                    const q = (c.ex - h0.ex) * kx + (c.ez - h0.ez) * kz;
                                    if (q > p) [p, t] = [q, c.an - h0.t0];
                                }
                                const w = (((Math.atan2(kz, kx) * 180) / Math.PI) % 90 + 90) % 90;
                                Object.assign(Z, { vor: t > 0 ? +(p / t).toFixed(3) : 0, vorM: +p.toFixed(1), R: +h0.R.toFixed(3), winkel: +Math.min(w, 90 - w).toFixed(1) });
                                // DAS BETT, WIE DIE FRONT ES VERZEHRTE (FENSTER-BETT): je gefangene Zelle Stoff, Last (`w`: Last × lebendig),
                                // Boden-Feuchte und Gefälle, wie `_brandZuenden` sie aus `_brandStoff` las — gegen die des Herds
                                const fern = (c) =>
                                    c.stoff !== h0.stoff ? `Stoff ${c.stoff}` : Math.abs(c.w - h0.w) > 1e-9 ? `Last ${+c.w.toFixed(4)}` : c.boden !== h0.boden ? `Boden ${+(+c.boden).toFixed(3)}` : c.gx !== h0.gx || c.gz !== h0.gz ? "Gefälle" : null;
                                const ab = [...I.values()].map(fern).filter(Boolean);
                                Z.bett = { stoff: h0.stoff, w: +h0.w.toFixed(4), boden: +(+h0.boden).toFixed(3), naesse: st.naesse, zellen: I.size, abweichend: ab.length, erste: ab[0] || null };
                            }
                            return Object.assign(Z, { mit: f(mit, (k) => k >> 1), koepfe: mit.length, gegen: f(alle.filter((h) => h.c <= -0.87), (k) => k - 1), alle: f(alle, (k) => k - 1) });
                        };
                        // JEDER HERD BEGINNT ZU SEINER WELT-UHR, NIE RÜCKWÄRTS (linse-brand-schritte): das Tempo der Front liest Wind und
                        // Luft zur Uhr des Brands (`_brandTempo` → `_windAt(t)`, `_temperaturAt`), und die Uhr, zu der die Probe hier ankam,
                        // trug die Bilder der Phasen davor (`bisDa`, an der Wanduhr des Läufers: lokal 12 235 s). Jeder Herd stellt die Uhr
                        // darum VORWÄRTS auf seine feste Uhr (`_weltUhrNeu`; steht die Welt schon später, bleibt sie und `uhrRueck` nennt
                        // es) und die Stunde auf Mittag (`setTimeOfDay`: die Luft der Zünd-Wärme). Bis hier kehrten drei Herde zur selben
                        // Uhr 40 000 zurück: Overlay, Fraß des Gaus und Narbe tragen Stempel der Welt-Uhr, und derselbe Herd trug
                        // 0,31 · 1,03 · 0,458 m/s. `gesetz` tauscht das Gesetz des Brands für diesen einen Lauf (im `finally` zurück, kein
                        // Flag im Spiel), `wind` „aus" (ohne m/s) oder die Uhr des GESETZTEN Winds (`_windAt` am Herd zu dieser Uhr, überall
                        // und jederzeit derselbe), `bett` das GESETZTE BETT (s. u.), `vor` misst nach dem Stellen der Uhr, vor dem Zünden
                        const [B0, uhrRueck] = [AnazhRealm.BRAND, []];
                        const herd = async (n, uhr, { gesetz = {}, wind, bett = false, vor = () => {} } = {}) => {
                            if (st.spielZeit > uhr) uhrRueck.push([+st.spielZeit.toFixed(1), uhr]);
                            r._weltUhrNeu(Math.max(uhr, st.spielZeit));
                            r.setTimeOfDay(0.5, "regler");
                            vor();
                            if (wind === "aus") r._windAt = (...a) => Object.assign(P._windAt.apply(r, a), { ms: 0 });
                            // der gesetzte Wind GANZ: `_brandTempo` teilt die Stärke durch die Böen-Drift zur Uhr des Brands
                            // (`_windWob(t)`) — trägt der Wind sie zur Uhr des Winds, teilt die Drift auch dort (lokal streute R sonst
                            // an derselben Uhr des Winds 0,935 · 0,871 · 0,875)
                            else if (wind != null) {
                                r._windAt = (x, z, t, aus) => P._windAt.call(r, MESS.x, MESS.z, wind, aus);
                                r._windWob = () => P._windWob.call(r, wind);
                            }
                            // DAS GESETZTE BETT (FENSTER-BETT): der EINE Schreiber des Betts im Brand ist `_brandStoff` (stamm/feld-brand.js,
                            // das Gemessene `_brandBett`) — lebendig selbst hat drei Schreiber, die erst im Leser `auraAt` zusammenlaufen
                            // (das Overlay `_depositLife`, die Narbe der Taten, der Fraß aus dem Faden des Gaus). Der Herd misst sein Bett
                            // wie das Spiel (Stoff, Boden-Feuchte, Gefälle, Maske), lebendig ist das der Saat (`worldFieldAt`: kein Overlay,
                            // keine Narbe, kein Gau), und JEDE Zelle trägt dieses Bett an ihrem Ort — auch wo die Welt keins trägt (Fels,
                            // Bach: `loecher`, gezählt; an der Achse hielt der schmale Kopf, R 1,5 m/s, an ihnen und lief 0,46 von R), nur
                            // die Asche des eigenen Brands nie; die Nässe hält die Bühne bei 0
                            let loecher = 0;
                            if (bett) {
                                let F0 = null;
                                const cs = AnazhRealm.LIFE_FIELD.cell;
                                r._brandStoff = function (cx, cz, u) {
                                    const f = P._brandStoff.call(this, cx, cz, u);
                                    if (!f && (this._tatIndex().je.get(cx + "," + cz) || []).some((a) => a.tat === "brand")) return null;
                                    const [x, z] = [(cx + 0.5) * cs, (cz + 0.5) * cs];
                                    if (!F0) F0 = f && Object.assign({}, f, { leb: this.worldFieldAt(x, z).lebendig });
                                    if (!F0) return null;
                                    if (!f) loecher++;
                                    return Object.assign({}, F0, { x, z, y: f ? f.y : this._voxelSurfaceY(x, z) });
                                };
                            }
                            AnazhRealm.BRAND = Object.freeze({ ...B0, ...gesetz });
                            try {
                                const L = await lauf(n);
                                if (L.bett) L.bett.loecher = loecher;
                                return L;
                            } finally {
                                AnazhRealm.BRAND = B0;
                                delete r._windAt;
                                delete r._windWob;
                                delete r._brandStoff;
                            }
                        };
                        // von Hand gelöscht: auch sein Rest (ein Herd schreibt keine Asche in den nächsten)
                        const loeschen = () => ((r._brandRest = st.brandFeld.clear()), (st.worldMeta.taten.length = n0));
                        const ohneWind = (await herd(60, 36900, { wind: "aus" })).alle;
                        const [glut, licht] = [+(am().glut - glut0).toFixed(3), r._leuchtQuellen(MESS.x, pm.y, MESS.z, 64).some((q) => q.quelle === "brand")];
                        loeschen();
                        // DIE WAHRHEIT DER FRONT (FRONT-TREUE · FRONT-MIT · FENSTER-BETT · FENSTER-UHR): derselbe Herd auf dem gesetzten
                        // Bett im gesetzten Wind zu drei Uhren des Winds, an denen sein Kopf längs einer Achse, schräg und diagonal zum
                        // Gitter der Zellen steht (`_windDirAt`, der Mäander der Saat: 41 150 · 40 766 · 40 713) — das Vorrücken des Kopfs
                        // ist R des Gesetzes; der diagonale noch zweimal: wieder (dieselbe Uhr des Winds, eine spätere der Welt) und am
                        // langsamsten Läufer (leeres Budget, EIN Stück je Bild) — drei Starts, dieselben Zahlen; dazu die Mutante des
                        // groben Gitters (nur die vier diagonalen Nachbarn: längs der Achse zackt die Front), an der FRONT-TREUE fallen
                        // muss — vier Nachbarn längs der Achsen bissen nicht (eine Gerade durchs Gitter kreuzt Kanten, nie Ecken)
                        const VIER = B0.nachbarn.slice(4);
                        const wahr = {};
                        for (const [name, uhr, wind, gesetz] of [
                            ["achse", 37100, 41150],
                            ["schraeg", 37500, 40766],
                            ["diagonal", 37900, 40713],
                            ["wieder", 38300, 40713],
                            ["langsam", 38700, 40713, { budgetMs: 0, mindestJeBild: 1 }],
                            ["grob", 39100, 41150, { nachbarn: VIER }],
                        ]) {
                            const L = await herd(300, uhr, { wind, bett: true, gesetz });
                            wahr[name] = { windUhr: wind, zellen: st.brandFeld.size, koepfe: L.koepfe, mit: L.mit, alle: L.alle, vor: L.vor, R: L.R, winkel: L.winkel, schritte: L.schritte, bilder: L.bilder, deckel: L.deckel, bett: L.bett };
                            loeschen();
                        }
                        // DER HERD DES SPIELS (die Kosten des Brands, Asche, Regen): sein Bett und sein Wind, wie die Welt sie trägt — seine
                        // Abweichung vom Bett des Herds ist die Mutante von FENSTER-BETT (ein ungesetztes Bett muss sie sehen)
                        const ovAm = () => +r._lifeOverlayAt(MESS.x, MESS.z).toFixed(3);
                        let [lebVor, ovVor] = [];
                        const Z = (W.brand = await herd(300, 40000, { vor: () => ([lebVor, ovVor] = [+am().lebendig.toFixed(3), ovAm()]) }));
                        Object.assign(Z, { ohneWind, wahr, uhrRueck, fenster: { spiel: wahr.diagonal, langsam: wahr.langsam }, lebVor, ovVor, glut, licht });
                        delete r._feldFolgeSteht;
                        delete r._naesseTakt;
                        r._naesseUhr = st.spielZeit;
                        wort("rainy");
                        // der Regen bis zum Erlöschen: höchstens 600 Schritte des Brands (nie Bilder), sein Deckel laut
                        const R = await brandGehen(600, () => r._brandLebt(), () => {});
                        Object.assign(Z, { regenS: R.schritte, regenDeckel: R.deckel });
                        Object.assign(Z, { brennt: st.brandFeld.size, lebNach: +am().lebendig.toFixed(3), ovNach: ovAm(), asche: st.worldMeta.taten.length - n0 });
                        wort("sunny");
                        r._naesseTakt(1e6);
                        Z.nachher = await simPhase(60);
                    } finally {
                        S.aus();
                        st.weatherEffectTime = uhr;
                        st.autoSeason = jahr;
                    }
                    // (WS) DER AUTOMAT AM FIXPUNKT: am Fluss nächst der Mess-Wiese zweimal eine Werk-Setzung, die kein Wasser
                    // verdrängt (`_invalidateWaterCapsAround`) — je Wecken seine Takte, die Chunks danach wach, die Bewegung
                    const p = (await window.__seite()).fluss(MESS)[0];
                    const A = (W.wasser = { ort: p && [Math.round(p.x), Math.round(p.z)], takte: [], gehalten: [], bewegt: [] });
                    const aktiv = () => (st.waterCAActive ? st.waterCAActive.size : 0);
                    if (p) {
                        pm.set(p.x, r._voxelSurfaceY(p.x, p.z) + 1.8, p.z);
                        await __weltStehtNach(takt);
                        for (let i = 0; i < 900 && aktiv(); i++) takt();
                        let bewegt = 0;
                        const ab = huelle(r, "_tickWorldWaterCA", (ruf) => ((m) => ((bewegt = Math.max(bewegt, m)), m))(ruf()));
                        for (let w = 0; w < 2; w++) {
                            r._invalidateWaterCapsAround(p.x, p.z, 2);
                            A.chunks = Math.max(A.chunks | 0, aktiv());
                            bewegt = 0;
                            let t = 0;
                            for (; t < 120 && aktiv(); t++) {
                                takt();
                                if (t === 0) A.gehalten.push(aktiv());
                            }
                            A.takte.push(t);
                            A.bewegt.push(+bewegt.toFixed(3));
                        }
                        ab();
                    }
                }
                // (K) DIE FÜHRUNG FERN (zuletzt — sie verschiebt die Uhr keiner Phase davor): ein Studio führt die Kamera (`kameraFuehren`, der Makro-Flug des Gelände-Studios; eine Sonde
                // wie werkbank bild) 1 km neben den Spieler — jenseits jedes Rings (12 × 43,2 m). Der Ring bleibt am Spieler; kein
                // Fege-Takt wartet auf Boden, den dort niemand baut: die Welt steht (fege-takt: bis dahin wartete die Nah-Wiese ewig)
                {
                    const p = st.playerMesh.position;
                    const [fx, fz] = [p.x + 1000, p.z + 300];
                    const fy = r._voxelSurfaceY(fx, fz) + 1.7;
                    await __weltStehtNach(takt);
                    const F = (aus.fuehrung = { x: Math.round(fx), z: Math.round(fz), abstand: Math.round(Math.hypot(1000, 300)) });
                    r.kameraFuehren((cam) => {
                        cam.position.set(fx, fy, fz);
                        cam.lookAt(fx + 15, fy + 6, fz + 6);
                    });
                    try {
                        F.takte = await __weltStehtNach(takt, 400);
                        F.steht = true;
                    } catch (e) {
                        F.steht = false;
                        F.takte = (String(e.message).match(/nach (\d+) Takten/) || [])[1] | 0;
                        F.grund = r._weltStand ? r._weltStand.grund : String(e.message).slice(0, 160);
                    } finally {
                        r.kameraFuehren(null);
                    }
                }
                aus.taktFehler = window.__standTaktFehler || [];
                return aus;
            },
            MESS,
            STAND.TAKTE
        );
    } catch (e) {
        befund = { fehler: fehlerText(e) };
    }
    if (NARBE) {
        await browser.close();
        server.close();
        if (!befund || befund.fehler) absturz(befund ? befund.fehler : "kein Befund");
        console.log("NARBE " + JSON.stringify(befund));
        const v = narbeUrteil(befund);
        urteilEnde(v.length, `❌ NARBE ROT — ${v.join(" | ")}`, "✅ NARBE GRÜN — die Narbe folgt der Front, die Zelle brennt, bis ihre Front sie deckt, das Licht steht bei den Flammen, der Boden liest die Asche-Zeile, die Front ist ein geschlossener Saum, die Zungen pulsen, der Brand leuchtet nachts als Flammen-Fläche, Asche und Rauch tragen die Masse des Holzes; die Lava zündet die Betten um sie auf der Länge ihres Rands, kein Halm steht auf ihrer Decke, sie leuchtet als Flammen-Fläche; die Uhr des Spielers bewegt keinen Prozess, der Sprung der Welt-Uhr ist geschlossen");
    }
    await seiteZu(browser, server, befund, null, "fehler");
    if (TAT || NACHWUCHS) {
        const { staemme, ernte, ...zeile } = TAT ? befund : { ufer: befund.ufer, echt: nachwuchsMass(befund.echt), mutante: nachwuchsMass(befund.mutante) };
        const [name, v] = TAT ? ["TAT", tatUrteil(zeile)] : ["NACHWUCHS", nachwuchsUrteil(zeile)];
        console.log(name + " " + JSON.stringify(zeile));
        urteilEnde(v.length, `❌ ${name} ROT — ${v.join(" | ")}`, `✅ ${name} GRÜN — ` + (TAT ? "die Spur hält bis zum Reload" : "der Nachwuchs folgt Feuchte × Licht"));
    }
    if (BRANDLAUF) {
        // je Staffel EINE Zeile und ihr Urteil (stoffe.K2#2 BRAND, stoffe.K5#2 SUKZESSION), das Ende trägt beide
        const vb = brandUrteil(befund);
        const vs = sukzessionUrteil(befund);
        const { asche, naehr, saemling, wald, ...brand } = befund;
        console.log("BRAND " + JSON.stringify(Object.assign(brand, { asche: asche && { vor: asche.vor, asche: asche.asche, gras: asche.gras, mutante: asche.mutante } })));
        console.log("SUKZESSION " + JSON.stringify({ asche, naehr, saemling, wald }));
        console.log(vb.length ? "❌ BRAND ROT — " + vb.join(" | ") : "✅ BRAND GRÜN — die Front hält an Wasser, Fels und nassem Gras, der Regen löscht, die Asche liegt im Boden-Stoff und grünt nach, Licht, Rauch und Knistern lesen den Brand");
        console.log(vs.length ? "❌ SUKZESSION ROT — " + vs.join(" | ") : "✅ SUKZESSION GRÜN — Asche → Gras → Busch → Wald, der Stubben treibt den Sämling, der Nährstoff geht mit der Ernte und kehrt mit Asche und Leichnam zurück");
        urteilEnde(vb.length + vs.length, "❌ BRAND · SUKZESSION ROT", "✅ BRAND · SUKZESSION GRÜN");
    }
    befund.pageErrors = befund.taktFehler || [];
    // je Befund EINE Zeile, wie die Seite ihn maß: jede Phase der Linse in Frames, Σ und je Takt Mittel, Gang/Runde und Wirkung;
    // die Sims in ihrer Zeile (Sim-Ruhe, Sim-Wecken — die Stationen feld.K3 und stoffe.K2 lesen sie)
    const namen = Object.keys(STAND.TAKTE);
    const phase = (_, x) =>
        x?.takte && x.frames
            ? `${x.frames} Frames · Σ ${x.summe} · ` + namen.map((n) => ((t = {}) => `${n} ${t.mittel ?? "?"}${t.runde ? ` ${t.gang}/${t.runde}` : ""}${t.wirkt ? ` wirkt ${t.wirkt}` : ""}${t.geweckt ? ` geweckt ${t.geweckt}` : ""}`)(x.takte[n])).join(" · ")
            : x;
    const { simRuhe, simWecken, ...rest } = befund;
    for (const [n, x] of Object.entries(rest)) console.log(`  ${n}: ${JSON.stringify(x, phase)}`);
    // die Druckwelle in ihrer Zeile: je Ereignis [Klasse, R m, Einheiten, Teile, Scherben] (der Schreiber: Einheiten, seine Bauten
    // im Radius, die Einträge des Netzes dort; eine Natur-Räumung steht dabei), je Klasse das Ereignis am nächsten an seinem Soll
    // mit seinen Lesern (`amSoll`), dazu Bruch-Grenze, Scheiben, Kiste, Spieler, Ohr, Verzug, Schlaf und die Mutante des Laufs
    const druckZeile = (w) =>
        JSON.stringify({
            ...w,
            ereignisse: (w.ereignisse || []).map((e) =>
                e.art === "welle"
                    ? ["welle", e.einheiten, `${e.blick} Bauten`, `${e.netz} im Netz`]
                    : e.art === "staub"
                      ? ["staub", e.einheiten, `${e.zellen} Zellen`, `${e.ballen} Ballen`]
                      : [e.art === "werk" ? (e.scherben > 0 ? "bruch" : "steht") : e.art, e.R, e.einheiten, e.teile, e.scherben, e.raeumt ? `räumt ${e.raeumt}` : undefined].filter((x) => x !== undefined)
            ),
            nachher: undefined,
            amSoll: STAND.druckAmSoll(w),
        }) + (w.nachher ? ` — nachher ${simZeile(w.nachher)}` : "");
    const simZeile = (ph) =>
        Object.entries(ph.sims)
            .map(([n, t]) => `${n} ${t.summe}${t.summe ? ` (${t.je.map((x) => x.join(" ")).join(", ")})` : ""}`)
            .join(" · ") + ` · Taten ${ph.akt}`;
    if (simRuhe) console.log(`  Sim-Ruhe ${simRuhe.spielS} s: ${simZeile(simRuhe)}`);
    for (const [n, w] of Object.entries(simWecken || {}))
        console.log(
            `  Sim-Wecken ${n}: ` +
                (n === "wasser"
                    ? JSON.stringify(w)
                    : n === "feld"
                      ? `${w.geschrieben} Zellen geschrieben, tote/Zellen nach den Wellen ${w.wellen.map((x) => x.tote + "/" + x.groesse).join(" · ")} — ${simZeile(w.welle)}`
                      : n === "brand"
                        ? // `zellen` · `einheiten` (Gang + Zündung je Zelle des Felds, der teuerste Schritt) lesen die Stationen feld.K3 und
                          // stoffe.K2; dazu der Gang je Zelle, die teuerste Zündung, was die Welt neu maß, und je Gesetz der Anteil am Soll
                          JSON.stringify({
                              ...w,
                              zellen: Math.max(0, ...w.zellen),
                              einheiten: Math.max(0, ...w.einheiten.map((e, i) => +(e / w.zellen[i]).toFixed(1))),
                              gang: Math.max(0, ...w.gang.map((e, i) => +(e / w.zellen[i]).toFixed(1))),
                              zuendung: Math.max(0, ...w.zuendung),
                              ...{ kachel: Math.max(0, ...(w.kachel || [])), kachelSoll: Math.max(0, ...(w.kachelSoll || [])), ringe: Math.max(0, ...(w.ringe || [])), ringM2: Math.max(0, ...(w.ringM2 || [])) },
                              ...Object.fromEntries(["ankuenfte", "betten", "masken", "punkte", "kahl"].map((k) => [k, w[k].reduce((a, b) => a + b, 0)])),
                              ...{ lesungen: undefined, rufe: undefined, rufeZ: undefined, rufeK: undefined, nachher: undefined },
                              amSoll: STAND.brandAmSoll(w),
                          }) + ` — nachher ${simZeile(w.nachher)}`
                        : n === "druck"
                          ? druckZeile(w) + "\nSONDE-WECKER " + JSON.stringify(w.wecker) + "\nSONDE-SPAET " + JSON.stringify(w.spaet) + "\nSONDE-UHR " + JSON.stringify(w.uhr) + "\nSONDE-MUTANTE " + JSON.stringify({ schlafS: w.mutante.schlafS, wach: w.mutante.wach, ms: w.mutante.ms, uhr: w.mutante.uhr, wecker: w.mutante.wecker, spaet: w.mutante.spaet })
                          : `wach ${simZeile(w.wach)} — nachher ${simZeile(w.nachher)}`)
        );
    const v = urteil(befund);
    wandEnde(
        v,
        "STAND-TAKT — im Stand geht kein Fege-Takt und keine langsame Simulation, die gebrochene Wache findet nichts Verschlafenes, ein Bau und jedes Sim-Ereignis wecken, Gehen und Strom arbeiten."
    );
})();
