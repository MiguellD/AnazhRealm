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
//   node scripts/diag-stand-takt.cjs [--selftest | --tat | --nachwuchs | --brand]   (npm run gate:stand-takt; Port STAND_TAKT_PORT;
//   --tat: (K4), --nachwuchs: (K5), --brand: (K2#2 · K5#2) unten)
// ─────────────────────────────────────────────────────────────────────────
"use strict";

const { statikServer, starteBrowser, warteAufWelt, taeterFaelle, selbsttestEnde, wandEnde, urteilEnde } = require("./lib/welt-boot.cjs");
const STAND = require("./lib/stand-linse.cjs");

// (N) DIE SONDE LIEST DEN BESTAND (satz-pass): nach dem Haupt-Pass nennt die Linie der Strahl-Sonde (scripts/lib/kamera-nah.cjs)
// zum Punkt 2 m unter dem Boden 60 m hinter dem gezeichneten Blick das Gelände, das der Satz-Abschnitt des Passes nicht trägt
const urteil = (b) =>
    STAND.standUrteil(b).concat(
        b.sonde?.vor === "Gelände" ? [] : `SONDE: Abschnitt der vorigen Kamera, trifft ${b.sonde?.vor}`
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
            treue: treuPhase(40),
            regler: phase(12, 10),
            wahrnehmung: phase(30, 4),
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
        wach: "DIE WELT STEHT NICHT nach 61 Takten: Ruhe 0, zuletzt brach sie: Fege-Takt archCull wartet",
        schuld: { abgewiesen: 40, grund: "Felder offen 8", takte: 214, rest: 0 },
        simRuhe: Object.assign(simPh(0, 3600), { vorher: { ernte: {}, leben: 9 } }),
        simWecken: {
            saison: { wach: simPh(3, 5), nachher: simPh(0, 60) },
            regen: { wach: simPh(6, 5), nachher: simPh(0, 60) },
            wuchs: { offen: 2, wach: simPh(9, 5), nachher: simPh(0, 60) },
            nachwuchs: { wach: simPh(2, 1), nachgewachsen: true, nachher: simPh(0, 60) },
            feld: { geschrieben: 2160, wellen: [0, 1, 2, 3].map(() => ({ groesse: 540, tote: 0 })), welle: Object.assign(simPh(0, 1), { akt: 2200 }) },
            brand: {
                start: true,
                ...{ zellen: [1, 1, 2, 3, 2, 1], einheiten: [9, 9, 30, 41, 20, 12], brennt: 0, asche: 4, mit: 0.9, gegen: 0.03, ohneWind: 0.04 },
                ...{ lebVor: 0.62, lebNach: 0.32, glut: 1, licht: true, nachher: simPh(0, 60) },
            },
            // BÜHNE: Befund des Selbsttests, kein gesetzter Ort
            wasser: { ort: [-396, -878], chunks: 9, takte: [1, 1], gehalten: [0, 0], bewegt: [0, 0] },
        },
        fixWach: false,
        sonde: { vor: "Gelände" },
        fix: [
            { takte: 49, wirkte: 7, nach: { frames: 150, summe: 0, takte: { archLod: { summe: 0, mitArbeit: 0, wirkt: 0 } } } },
            { takte: 44, wirkte: 8, nach: { frames: 150, summe: 0, takte: { archLod: { summe: 0, mitArbeit: 0, wirkt: 0 } } } },
        ],
        pageErrors: [],
    };
    const klon = () => JSON.parse(JSON.stringify(gruen));
    const fehler = [];
    const v0 = urteil(klon());
    if (v0.length) fehler.push("der grüne Befund fällt rot: " + v0.join(" · "));
    console.log(`  ${v0.length ? "❌" : "✅"} Selbsttest grün → ${v0.join(" · ") || "grün"}`);
    const faelle = [
        [
            "der Cull-Gang in Ruhe (die Basis)",
            (b) => Object.assign(b.ruhe.takte.archCull, { summe: 105360, mittel: 3512, max: 3512, mitArbeit: 30 }),
            /RUHE: archCull \(tickArchitectureCulling\) arbeitet im Stand — 105360 Einheiten in 30 von 30 Frames/,
        ],
        [
            "ein Ausreißer der Saum-Wache in Ruhe",
            (b) => Object.assign(b.ruhe.takte.deckWache, { summe: 128, mittel: 4.27, max: 128, mitArbeit: 1 }),
            /RUHE: deckWache .* 128 Einheiten in 1 von 30 Frames/,
        ],
        [
            "stumpfe Linse (die Nah-Wiese zählt nichts)",
            (b) => Object.assign(b.bruch.takte.nahWiese, { summe: 0, mittel: 0, max: 0, mitArbeit: 0 }),
            /STUMPF: .* für nahWiese keine Arbeit/,
        ],
        [
            "die Wache verschlief einen Wechsel",
            (b) => (b.bruch.takte.archLod.wirkt = 3),
            /TREUE: archLod \(_tickArchitectureLOD\) änderte mit gebrochener Wache nach der Ruhe die Welt in 3 Gängen/,
        ],
        [
            "ein Bau weckt den Cull nicht",
            (b) => Object.assign(b.wecken.phase.takte.archCull, { summe: 0, mitArbeit: 0 }),
            /WECKEN: ein Bau im Stand weckt archCull nicht/,
        ],
        ["der Bau bleibt ohne Stufe", (b) => (b.wecken.versorgt = false), /WECKEN: der neue Bau trägt/],
        [
            "die Wache verschlief die Stufe des neuen Baums",
            (b) => (b.wecken.treue.takte.archLod.wirkt = 1),
            /TREUE: archLod .* nach dem Bau die Welt in 1 Gängen/,
        ],
        [
            "ein Regler-Schritt weckt den Cull nicht",
            (b) => Object.assign(b.wecken.regler.takte.archCull, { summe: 0, mitArbeit: 0 }),
            /WECKEN: ein Regler-Schritt \(der Cull-Radius\) weckt archCull nicht/,
        ],
        [
            "nach dem Bau schläft die Wache nicht",
            (b) => (b.wecken.nachher = Object.assign(phase(0, 20), { summe: 7020 })),
            /WECKEN: nach dem Bau schläft die Wache nicht wieder \(7020/,
        ],
        [
            "starres Gehen (der Cull hält)",
            (b) => Object.assign(b.gehen.takte.archCull, { summe: 0, mitArbeit: 0 }),
            /STARR: beim Gehen arbeitet archCull nicht/,
        ],
        [
            "der Ring geht beim Gehen in derselben Zelle",
            (b) => Object.assign(b.gehen.takte.strom, { summe: 2490, mitArbeit: 30 }),
            /GEHEN: der Ring geht ohne Zellen-Wechsel \(2490 Einheiten\)/,
        ],
        [
            "der Saum geht beim Gehen ohne neuen Anker",
            (b) => Object.assign(b.gehen.takte.deckWache, { summe: 3840, mitArbeit: 30 }),
            /GEHEN: der Saum geht ohne neuen Anker \(3840 Einheiten\)/,
        ],
        ["der Gang verlässt seine Zelle", (b) => (b.gehen.zelleGleich = false), /LEER: der Gang verließ seine Zelle/],
        ["Gehen ohne Weg", (b) => (b.gehen.weg = 0.2), /BEWEGUNG: beim Gehen kam der Spieler 0.2 m voran/],
        [
            "ein Stufen-Wechsel weckt die Stufen-Wahl",
            (b) => Object.assign(b.stufe, { takte: { archLod: 1638 }, rufe: { _lodTreeVisHeight: 1638 } }),
            /STUFE: 2 Stufen-Wechsel ohne Form-Änderung wecken archLod \(1638 Einheiten\)/,
        ],
        ["die Stufen-Probe ist stumpf", (b) => (b.stufe.wechsel = 0), /STUFE: kein Stufen-Wechsel geschah/],
        [
            "das Streaming verhungert nach der Ruhe",
            (b) => (b.strom.spielerChunk = false),
            /STROM: nach dem Sprung an \(-300, -850\) steht der Spieler-Chunk nach 40 Takten nicht/,
        ],
        [
            "die Treue-Phase geht 6 Frames (die Streu 960 von 1 845 Zellen)",
            (b) => Object.assign(b.bruch.takte.streuLod, { gang: 960 }),
            /TREUE-LÜCKE: streuLod \(_tickScatterLod\) ging nach der Ruhe 960 von 1845 Einheiten/,
        ],
        [
            "die Treue nach dem Bau geht 6 Frames (der Saum 768 von 1 728 Punkten)",
            (b) => Object.assign(b.wecken.treue.takte.deckWache, { gang: 768 }),
            /TREUE-LÜCKE: deckWache \(_fernRingDeckWache\) ging nach dem Bau 768 von 1728 Einheiten/,
        ],
        [
            "die Treue nach dem Bau nennt die Runde nicht",
            (b) => delete b.wecken.treue.takte.archLod.runde,
            /LEER: die Treue-Phase nach dem Bau nennt die Runde von archLod nicht/,
        ],
        [
            "der Täter der Streu in der zweiten Rundenhälfte bleibt ungesehen (6 Frames)",
            (b) => Object.assign(b.taeter.phase.takte.streuLod, { wirkt: 0, gang: 960 }),
            /TREUE-TÄTER: .* von streuLod \(_tickScatterLod\) an Stelle 1734 von 1845 nicht \(gegangen 960\)/,
        ],
        [
            "der Täter des Saums bleibt ungesehen",
            (b) => (b.taeter.phase.takte.deckWache.wirkt = 0),
            /TREUE-TÄTER: .* von deckWache \(_fernRingDeckWache\) an Stelle 1727 von 1728 nicht/,
        ],
        [
            "der Täter steht in der ersten Rundenhälfte",
            (b) => (b.taeter.je.streuLod.stelle = 400),
            /LEER: der Täter von streuLod steht an Stelle 400 von 1845/,
        ],
        [
            "die Stufen-Wahl trägt keinen Täter (ihre Runde braucht mehrere Gänge)",
            (b) => delete b.taeter.je.archLod,
            /LEER: kein Täter für archLod \(_tickArchitectureLOD\) — seine Runde \(1638 Einheiten\) braucht mehrere Gänge/,
        ],
        [
            "der Täter weckt einen fremden Takt",
            (b) => (b.taeter.phase.takte.archCull.wirkt = 2),
            /TREUE: archCull .* mit den Tätern die Welt in 2 Gängen/,
        ],
        ["keine Täter-Probe", (b) => delete b.taeter, /LEER: keine Täter-Probe der Treue/],
        [
            "die Runde der Stufen-Wahl wächst während der Treue-Phase",
            (b) => Object.assign(b.bruch.takte.archLod, { rundeVon: 1638, runde: 1702, gang: 3584 }),
            /TREUE-LÜCKE: archLod \(_tickArchitectureLOD\) änderte nach der Ruhe seine Runde \(1638 → 1702 Einheiten\)/,
        ],
        [
            "ein Wahrnehmungs-Schritt weckt die Streu nicht (der Stempel liest die LOD-Distanzen nicht)",
            (b) => Object.assign(b.wecken.wahrnehmung.takte.streuLod, { summe: 0, mitArbeit: 0 }),
            /WECKEN: ein Wahrnehmungs-Schritt \(LOD_DISTANCES, ohne Weckruf\) weckt streuLod nicht/,
        ],
        [
            "der Erdbau wirft das Dart-Gedächtnis der Welt",
            (b) =>
                Object.assign(b.ort, {
                    standNach: 3,
                    darts: { fern: 812, gehalten: 0 },
                    plan: 2579,
                    maxTaktMs: 880,
                }),
            /ORT: der Erdbau bei \(-182,-1038\) warf das Dart-Gedächtnis der Welt \(Stand des Walds 2 → 3.*2579 Wald-Zellen neu .*planForestCell.*880 ms/,
        ],
        [
            "ferne Wald-Zellen fallen (der Stand bleibt)",
            (b) => (b.ort.darts.gehalten = 700),
            /ORT: der Erdbau bei \(-182,-1038\) warf 112 von 812 fernen Wald-Zellen/,
        ],
        [
            "ein fernes Chunk-Gedächtnis fällt",
            (b) => (b.ort.chunks.basis.gehalten = 0),
            /ORT: der Erdbau bei \(-182,-1038\) warf 6 von 6 fernen Chunk-Gedächtnissen \(basis/,
        ],
        [
            "der Stand eines fernen Chunks springt",
            (b) => Object.assign(b.ort.stand, { nach: "4|0", gleich: false }),
            /ORT: der Erdbau bei \(-182,-1038\) verwarf die Worker-Antworten des fernen Chunks -11,-27 \(Stand 3\|0 → 4\|0\)/,
        ],
        [
            "jeder Abbau speichert die Welt synchron",
            (b) => Object.assign(b.ort.raeumung, { saves: 5, saveMs: 420 }),
            /ORT: der Abbau von 5 Natur-Stücken speicherte die Welt 5× synchron \(`removeArchitecture › saveState`, Σ 420 ms\)/,
        ],
        ["die Ort-Phase räumt nichts", (b) => (b.ort.raeumung.abbau = 0), /LEER: die Ort-Phase räumte keine Natur/],
        [
            "die Ort-Phase sieht keine fernen Zellen",
            (b) => (b.ort.darts.fern = 0),
            /LEER: die Ort-Phase sah keine fernen/,
        ],
        ["die Ort-Phase legt keinen Erdbau", (b) => (b.ort.gelegt = false), /LEER: die Ort-Phase legte keinen Erdbau/],
        [
            "das Solo-Haus baut seinen Kern im Haupt-Faden (bis B3c)",
            (b) => Object.assign(b.ort.kamin, { bau: 1, ms: 52.4 }),
            /ORT: das Solo-Haus \(alemannisch\) baute seinen Kern 1× im Haupt-Faden .*chimneyTipFromParams.*52\.4 ms/,
        ],
        [
            "die Ort-Phase setzt kein Solo-Haus",
            (b) => (b.ort.kamin.gesetzt = false),
            /LEER: die Ort-Phase setzte kein Solo-Haus/,
        ],
        [
            "der Satz-Block legt die Ecken eines Hauses frisch an",
            (b) => Object.assign(b.ort.satzHaus, { frischKB: 2048 }),
            /ORT: das Haus im Satz \(alemannisch, 26800 Ecken in 7 Gruppen\) legte beim Wieder-Eintritt 2\.0 MB frisch an .*_tickBauSatz › _bauSatzBlock › _satzBlock/,
        ],
        [
            "die Ort-Phase bringt kein Haus in den Bau-Satz",
            (b) => Object.assign(b.ort.satzHaus, { gruppen: 0, ecken: 0, bloecke: 0, takte: 600 }),
            /LEER: die Ort-Phase brachte kein Haus in den Bau-Satz \(alemannisch, 0 Gruppen, 0 Ecken nach 600 Takten\)/,
        ],
        [
            "der Baum in frischem Wald plant seine Zellen synchron",
            (b) => Object.assign(b.ort.wald, { synchron: 169, ms: 271.4, takte: 0, imTakt: 0, maxTaktZellen: 0 }),
            /ORT: der Baum in frischem Wald bei \(-182,-618\) plante 169 Wald-Zellen synchron .*_ortGestaltSame.*planForestCell.*271\.4 ms/,
        ],
        [
            "die Gestalt des Baums in frischem Wald steht nie",
            (b) => Object.assign(b.ort.wald, { gestalt: null, takte: 600 }),
            /ORT: die Gestalt des Baums in frischem Wald steht nach 600 Takten nicht/,
        ],
        [
            "die Schlange des Walds plant am Stück",
            (b) => Object.assign(b.ort.wald, { maxTaktMs: 271.4, maxTaktZellen: 169 }),
            /ORT: die Schlange des Walds plante in EINEM Takt 271\.4 ms \(169 Zellen\)/,
        ],
        [
            "die Ort-Phase setzt keinen Baum in frischem Wald",
            (b) => (b.ort.wald.gesetzt = false),
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
            (b) => Object.assign(b.ort.amSpieler, { heil: false, takte: 600 }),
            /ORT: der Erdbau unter dem Spieler bei \(-293,-1071\) heilt nicht — nach 600 Takten warten noch Chunks/,
        ],
        [
            "der Erdbau unter dem Spieler markiert nichts",
            (b) => (b.ort.amSpieler.dirty = 0),
            /LEER: der Erdbau unter dem Spieler markierte keinen Chunk zum Neubau/,
        ],
        [
            "die Ort-Phase legt keinen Erdbau unter dem Spieler",
            (b) => delete b.ort.amSpieler,
            /LEER: die Ort-Phase legte keinen Erdbau unter dem Spieler/,
        ],
        [
            "der Pflanz-Gang plant frische Zellen am Stück",
            (b) =>
                Object.assign(b.strom.wald, {
                    aussen: 96,
                    ms: 131.2,
                    maxTakt: 41,
                    taeter: "_forestDartSteht › _forestPlantChunk › _populateVoxelChunkVegetation › _finalizeVoxelChunkBuild",
                }),
            /STROM: 96 frische Wald-Zellen plante nicht die Schlange des Walds, sondern `_forestDartSteht › _forestPlantChunk.*131\.2 ms, bis 41 in EINEM Takt/,
        ],
        [
            "die Strom-Phase sieht keinen frischen Wald",
            (b) => (b.strom.wald.imJob = 0),
            /LEER: die Strom-Phase sah keinen frischen Wald/,
        ],
        ["keine Ort-Phase", (b) => delete b.ort, /LEER: keine Ort-Phase/],
        ["keine Ruhe", (b) => delete b.ruhe, /LEER: keine Ruhe-Phase/],
        ["keine Bruch-Phase", (b) => delete b.bruch, /LEER: keine Bruch-Phase/],
        ["Page-Error", (b) => b.pageErrors.push("TypeError: x"), /PAGE-ERROR: TypeError: x/],
        [
            "die Streu wartet nach geleerter Schlange des Walds",
            (b) => (b.nachschub.warten = ["-3,-5 wartet auf ihr Asset"]),
            /NACHSCHUB: 1 Streu-Regionen warten, obwohl die Schlange des Walds leer ist/,
        ],
        ["keine Nachschub-Probe", (b) => delete b.nachschub, /LEER: keine Nachschub-Probe/],
        [
            "die Nah-Wiese wartet jenseits des Rings auf Boden, den niemand baut",
            (b) =>
                Object.assign(b.fuehrung, { steht: false, takte: 400, grund: "Fege-Takt nahWiese wartet, nahStreu wartet" }),
            /FÜHRUNG: die Kamera bei \(700, -800\), 1044 m neben dem Spieler — die Welt steht nach 400 Takten nicht: Fege-Takt nahWiese wartet/,
        ],
        ["keine Führungs-Phase", (b) => delete b.fuehrung, /LEER: keine Führungs-Phase/],
        ["das Dorf fliegt (die Basis)", (b) => delete b.dorf.placed, /DORF: die Welt stand nach 41 Takten mit dem Dorf im Flug/],
        ["ein wartender Fege-Takt hält die Welt nicht wach", (b) => (b.wach = "steht nach 31 Takten"), /WACH: ein Fege-Takt mit Offenem hält die Welt nicht wach/],
        ["die Welt steht, während die Bake-Uhr abweist (die Basis)", (b) => Object.assign(b.schuld, { grund: "Welt-Regung", takte: 1, rest: 8 }), /BAKE-SCHULD: steht nach 1 Takten mit 8 offenen Fits \(40 abgewiesen, Welt-Regung\)/],
        [
            "die Welt steht mitten in der Runde der Stufen-Wahl",
            (b) => Object.assign(b.fix[1], { takte: 1, nach: { frames: 150, summe: 2048, takte: { archLod: { summe: 2048, mitArbeit: 8, wirkt: 4 } } } }),
            /FIXPUNKT: die Welt stand nach 1 Takten, danach ging archLod \(_tickArchitectureLOD\) ohne Eingabe noch 2048 Einheiten/,
        ],
        ["der Regler-Schritt wirkt nicht", (b) => b.fix.forEach((f) => (f.wirkte = 0)), /LEER: der Regler-Schritt wirkte nicht/],
        ["keine Fixpunkt-Phase", (b) => delete b.fix, /LEER: keine Fixpunkt-Phase/],
        [
            "der Wuchs prüft in Ruhe je Frame die wartenden Chunks (die Basis)",
            (b) => (b.simRuhe.sims.wuchs = simPh(9, 3600).sims.wuchs),
            /RUHE-SIM: wuchs \(_tickFoliageGrowth\) arbeitet in Ruhe nach einer Tat — 32400 Einheiten in 3600 von 3600 Frames \(60 s; _x 9\)/,
        ],
        [
            "ein Takt, der in Ruhe einmal zählt (der Nachwuchs über die Wanduhr)",
            (b) => Object.assign(b.simRuhe.sims.nachwuchs, { summe: 1, mitArbeit: 1 }),
            /RUHE-SIM: nachwuchs \(_tickScatterRegrow\) arbeitet in Ruhe .* 1 Einheiten in 1 von 3600/,
        ],
        ["die Sim-Ruhe geht 20 s", (b) => (b.simRuhe.spielS = 20), /LEER: die Sim-Ruhe ging 20 s/],
        ["vor der Sim-Ruhe keine Ernte", (b) => (b.simRuhe.vorher.ernte = null), /LEER: vor der Sim-Ruhe fehlt die Tat/],
        ["keine Sim-Ruhe", (b) => delete b.simRuhe, /LEER: keine Sim-Ruhe/],
        [
            "nach dem Saison-Wort malt die Jahres-Uhr weiter (die Basis)",
            (b) => (b.simWecken.saison.nachher = simPh(3, 60)),
            /WECKEN-SIM: nach dem Ereignis schläft saison nicht wieder — 180 Einheiten \(_x 3\)/,
        ],
        ["das Wort Regen weckt den Regen nicht", (b) => (b.simWecken.regen.wach = simPh(0, 5)), /STUMPF: das Wort Regen weckt regen/],
        ["kein Chunk wartet auf seinen Wuchs", (b) => (b.simWecken.wuchs.offen = 0), /LEER: keine Weck-Probe für wuchs/],
        ["die Ernte wächst nicht nach", (b) => (b.simWecken.nachwuchs.nachgewachsen = false), /NACHWUCHS: die Ernte wuchs/],
        [
            "der Blick des Spielers je Bild (die Basis)",
            (b) => Object.assign(b.simRuhe, { akt: 46802, aktJe: [["auraAt", 3600]] }),
            /RUHE-TAT: die Akte .* arbeiten in Ruhe nach einer Tat über ihre Zellen hinaus — 46802 Einheiten für 0 geschriebene \(auraAt 3600\)/,
        ],
        [
            "die Räumung wartet auf die Schwelle (die Basis)",
            (b) => Object.assign(b.simWecken.feld.wellen[1], { groesse: 1110, tote: 537 }),
            /FELD-TOTE: nach den Wellen trägt die Karte 0 von 540 · 537 von 1110/,
        ],
        [
            "die Räumung geht jede Zelle durch (die Basis)",
            (b) => Object.assign(b.simWecken.feld.welle, { akt: 1680, aktAlle: { "·lifeField": 1670 } }),
            /FELD-BESUCH: die Wellen kosteten 1680 Einheiten für 2160 geschriebene Zellen, die Räumung ging über die ganze Karte \(·lifeField 1670\)/,
        ],
        ["kein Brand fängt (die Basis: kein Takt im Stamm)", (b) => (b.simWecken.brand.start = false), /LEER: an der Mess-Wiese fing kein Brand/],
        ["der Brand ohne Takt", (b) => b.simWecken.brand.einheiten.fill(0), /STUMPF: der Brand brennt, die Sim-Linse sieht keinen Takt/],
        ["der Brand fegt die Welt", (b) => (b.simWecken.brand.einheiten[3] = 4000), /BRAND-ZELLEN: Schritt 4 kostete 4000 Einheiten bei 3 brennenden/],
        ["der Brand erlischt im Regen nicht", (b) => (b.simWecken.brand.brennt = 7), /BRAND-ERLISCHT: im Regen brennen noch 7/],
        ["die Front kriecht mit dem Wind", (b) => (b.simWecken.brand.mit = 0.3), /FRONT-MIT: .* 0.3 m\/s/],
        ["die Front läuft gegen den Wind", (b) => (b.simWecken.brand.gegen = 0.3), /FRONT-GEGEN: .* 0.3 m\/s/],
        ["ohne Wind läuft die Front", (b) => (b.simWecken.brand.ohneWind = 0.9), /BRAND-BLIND: .* 0.9 m\/s/],
        ["der Brand hinterlässt keine Asche", (b) => (b.simWecken.brand.lebNach = 0.62), /BRAND-ASCHE: 4 Aschen, lebendig am Herd 0.62 → 0.62/],
        ["der Brand leuchtet nicht", (b) => (b.simWecken.brand.licht = false), /BRAND-LESER: glut am Herd \+1, Leuchtquelle fehlt/],
        ["der Brand schläft nicht", (b) => (b.simWecken.brand.nachher = simPh(2, 60, "brand")), /BRAND-RUHE: .* 120 Einheiten/],
        [
            "der Automat geht am Fixpunkt 4 Takte (die Basis)",
            (b) => Object.assign(b.simWecken.wasser, { takte: [1, 4], gehalten: [0, 9] }),
            /FIXPUNKT-WASSER: am Fluss \(-396,-878\), Wecken 2 ging der Automat 4 Takte, 9 Chunks blieben ohne Bewegung wach/,
        ],
        ["am Fluss kein Chunk", (b) => (b.simWecken.wasser.chunks = 0), /LEER: am Fluss weckt die Werk-Setzung keinen Chunk/],
        ["das Wasser bewegt sich", (b) => (b.simWecken.wasser.bewegt = [0, 3.2]), /LEER: am Fluss .* bewegte der Automat 3.2/],
        [
            "ein Sprung des Auges (40 m, ohne Takt) lässt die Welt stehen (die Basis)",
            (b) => (b.fixWach = "Sprung"),
            /FIXPUNKT: die Welt hieß stehend — Sprung/,
        ],
        ["die Ankunft gleitet, die Welt steht (die Basis)", (b) => (b.fixWach = "Gleite"), /stehend — Gleite/],
        ["die Sonde ohne Bestand", (b) => (b.sonde.vor = "Rinde baum_tanne"), /SONDE: .* trifft Rinde/],
    ];
    taeterFaelle(faelle, urteil, { fehler, klon });
    selbsttestEnde(fehler);
}

// (K4) DIE TAT BLEIBT (feld.K4, `--tat`): an der Mess-Wiese fällt der Spieler mit dem echten Verb (tryMouseBreak) zehn Bäume
// und pflückt dreißig Pflanzen der Nah-Streu; gezählt wird, was die Welt zeichnet (Bäume der Lichtung, Pflanzen und Stümpfe in
// den Blöcken der Nah-Streu, auraAt − frozen an den Stämmen) nach einer Spielstunde, nach Save → Reload → einer Stunde und nach
// 36 Stunden mehr. Urteil: nach der Stunde ≤ 30 % der Bäume, keine Pflanze, je Baum ein Stumpf, das Feld ≥ 0,05 unter frozen.
function tatUrteil(T) {
    const h = T && T.stunde;
    if (!h) return ["LEER: keine Messung nach der Stunde"];
    return [
        T.gefaellt >= 8 && T.gepflueckt >= 25 ? "" : `LEER: ${T.gefaellt} Bäume, ${T.gepflueckt} Pflanzen`,
        h.baeume <= 0.3 * T.baeumeVorher ? "" : `BAUM: ${h.baeume} von ${T.baeumeVorher} stehen`,
        h.pflanzen === 0 ? "" : `ERNTE: ${h.pflanzen} Pflanzen zurück`,
        h.stuempfe >= T.gefaellt ? "" : `STUMPF: ${h.stuempfe} für ${T.gefaellt} Bäume`,
        h.narbe <= -0.05 ? "" : `NARBE: ${h.narbe}`,
    ].filter(Boolean);
}

async function tatSeite(MESS, vorher) {
    await window.__weltDa((x) => x.state.playerMesh && x._foundry && x._foundry.ready);
    const [pm, cam, P] = [st.playerMesh.position, st.camera, Math.hypot];
    let t = performance.now();
    const takt = () => r._gameLoopTick((t += 1000 / 60));
    st.perfRegulator = false;
    const y = (x, z) => r._voxelSurfaceY(x, z);
    const stehen = (p) => (pm.set(p.x, y(p.x, p.z) + 1.8, p.z), window.__weltStehtNach(takt));
    const baum = (a) => /baum/.test(a._lodSpecies || a.type) && r._istNatur(a);
    const ab = (a, p) => P(a.position.x - p.x, a.position.z - p.z);
    const zeichnet = (wahl, s = new Set()) => {
        for (const a of st.nahStreu.senken.values()) for (const [k, b] of a.bloecke) for (const id of b.ids) if (wahl(a, k + "#" + id)) s.add(k + "#" + id);
        return s.size;
    };
    // (K5) der Nachwuchs, s. u.: die Pflanzen der Nah-Streu im Ring (`ernten`: jede gepflückt) mit Feuchte und Licht ihres Orts
    const F0 = r._feuchteAt.bind(r);
    const ring = (ernten, ps = []) => {
        const ns = st.nahStreu;
        for (const [senke, a] of ns.senken)
            for (const [key, b] of a.ernte && a.preset !== "stumpf" ? a.bloecke : [])
                for (const { id, x, z } of ns.kacheln.get(key).items)
                    if (b.ids.includes(id) && (!ernten || r._harvestScatterPick({ senke, key, id })))
                        ps.push({ key, id, w: [key, F0(x, z), r._bodenLichtFeld(x, z, x, z)(x, z), 0] });
        return ps;
    };
    const jahr = async (U, mutante) => {
        await stehen(U);
        const h0 = r._weltStunde();
        if (mutante) r._feuchteAt = () => 0.5;
        const ps = ring(true);
        delete r._feuchteAt;
        const schritt = (dh) => {
            r.setTimeOfDay((st.timeOfDay + dh / 24) % 1, "regler");
            takt();
            for (const p of ps) p.w[3] ||= !r._geerntetIn(p.key).has(p.id) && r._weltStunde() - h0;
        };
        while (ps.some((p) => !p.w[3]) && r._weltStunde() - h0 < 48) schritt(0.05);
        while (r._weltStunde() - h0 < 8760) schritt(11);
        await stehen(U);
        return { jahr: r._weltStunde() - h0, da: zeichnet((a, k) => ps.some((p) => p.key + "#" + p.id === k)), p: ps.map((p) => p.w) };
    };
    if (vorher && vorher.ufer) {
        r._setWeather("sunny", "human"), r.setSeason("sommer");
        for (let d = 20, n = 0; d <= 900 && n < 8; d += 10)
            for (let k = 0; k < 36; k++) {
                const U = { x: MESS.x + d * Math.cos(k * 0.1745), z: MESS.z + d * Math.sin(k * 0.1745) };
                if (Math.abs(F0(U.x, U.z) - 0.5) > 0.1 || !r._landAt(U.x, U.z, 1) || r._canopyLightAt(U.x, U.z) < 0.6) continue;
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
            narbe: +(d.reduce((s, x) => s + x, 0) / Math.max(1, d.length)).toFixed(3),
            taten: (st.worldMeta.taten || []).length,
        };
    };
    const stunden = async (h, T) => {
        for (let n = h; n > 0; n -= 6) {
            r.setTimeOfDay((st.timeOfDay + Math.min(6, n) / 24) % 1, "regler");
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
        const [ns, kand] = [st.nahStreu, []];
        for (const a of ns.senken.values())
            for (const [k, b] of a.ernte && a.preset !== "stumpf" ? a.bloecke : [])
                for (const it of (ns.kacheln.get(k) || { items: [] }).items)
                    if (b.ids.includes(it.id) && P(it.x - mitte.x, it.z - mitte.z) < 12) kand.push({ id: k + "#" + it.id, k, it });
        kand.sort((a, b) => P(a.it.x - mitte.x, a.it.z - mitte.z) - P(b.it.x - mitte.x, b.it.z - mitte.z));
        for (const { id, k, it } of kand) {
            if (T.ernte.length >= 30 || T.ernte.includes(id)) continue;
            const trifft = () => ((q) => q && q.key === k && q.id === it.id)(r._pickScatterAtCrosshair());
            if (klick({ x: it.x, y: it.y + 0.12, z: it.z }, { x: it.x + 1.2, z: it.z + 0.4 }, 1, trifft))
                if (!zeichnet((a, x) => x === id)) T.ernte.push(id);
        }
    }
    Object.assign(T, { gefaellt: T.staemme.length, gepflueckt: T.ernte.length });
    T.stunde = await stunden(1, T);
    r.saveState();
    await sleep(2500); // der Save landet vor dem Reload
    return T;
}

async function tatLauf(page) {
    const T = await page.evaluate(tatSeite, MESS, null);
    await page.reload({ waitUntil: "networkidle0", timeout: 120000 });
    await warteAufWelt(page, 120000);
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
//   Asche, mager); die Mutante (`_feuchteAt` 0 an der Naht) brennt in das nasse Ufer. FELS: der Herd neben der nächsten Zelle aus
//   Stein, die Front erreicht sie und hält.
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
//   und der Leser (Licht, Rauch, Glut am Ohr) je Bild.
// je Probe [Name, gilt, Befund]: die Zeilen, die nicht gelten, beim Namen samt ihrem Befund
const rot = (T) => T.filter((t) => !t[1]).map(([n, , x]) => n + ": " + JSON.stringify(x));
function brandUrteil(b) {
    if (!b || !b.halt || !b.regen || !b.asche || !b.asche.asche || !b.zeit) return ["LEER: " + JSON.stringify(b && Object.keys(b))];
    const [h, m, f, rg, rm, l, lm, a, z] = [b.halt, b.haltM, b.fels, b.regen, b.regenM, b.leser, b.leserM, b.asche, b.zeit];
    return rot([
        ["HALT", h.brannte >= 2 && h.nass >= 1, h],
        ["HALT-BRUCH", h.wasserGebrannt === 0 && h.nassGebrannt === 0, h],
        ["MUTANTE-HALT", m && m.nassGebrannt >= 1 && m.nass === 0, m],
        ["FLUSS", m && m.wasser + h.wasser >= 1 && m.wasserGebrannt === 0, m],
        ["FELS", f && f.erreicht && f.gehalten, f],
        ["REGEN", rg.brannte >= 1 && rg.s <= 60, rg],
        ["MUTANTE-REGEN", rm && rm.s > 60, rm],
        ["LESER", l && l.licht >= 1 && l.rauch >= 1 && l.glutD <= 16 && l.glutF >= 64, l],
        ["MUTANTE-LESER", lm && lm.licht === 0 && lm.rauch === 0 && lm.glutF < 64, lm],
        ["ASCHE", a.asche.Y <= 0.08 && a.asche.a >= 0.99, a.asche],
        ["GRÜNT", a.gras && a.gras.a === 0 && a.gras.Y >= 0.95 * a.vor.Y, a.gras],
        ["MUTANTE-ASCHE", a.mutante.Y > 0.08 && a.mutante.halme >= 0.8 * a.vor.halme, a.mutante],
        ["ZEIT", z.brennend >= 2000 && z.bildMs <= 0.5 && z.verzugS <= 2, z],
    ]);
}

// Die Folge (stoffe.K5#2): auf der Asche kein Halm und kein Kraut, nach der Stufe Gras die Halme (≥ 80 %) vor den Kräutern (≤ 30 %),
// nach der Stufe Busch die Kräuter (≥ 80 %); die Ernte nimmt Nährstoff und Wuchs, Asche und Leichnam geben ihn zurück, die Mutante
// lässt den Wuchs gleich; der Jungwuchs (Stubben → Sämling, der Wald nach dem Busch) ist nicht gebaut — SÄMLING nennt ihn.
function sukzessionUrteil(s) {
    const [a, n] = [s && s.asche, s && s.naehr];
    if (!a || !a.asche || !n || !(a.vor.halme >= 20) || !(a.vor.kraut >= 3)) return ["LEER: " + JSON.stringify(a && a.vor)];
    const [v, g, e] = [a.vor, a.gras, n.ernte];
    return rot([
        ["ASCHE", a.asche.halme <= 0.05 * v.halme && a.asche.kraut === 0, a.asche],
        ["GRAS", g && g.halme >= 0.8 * v.halme && g.kraut <= 0.3 * v.kraut, g],
        ["BUSCH", a.busch && a.busch.kraut >= 0.8 * v.kraut, a.busch],
        ["ERNTE", e.n >= 3 && e.N < e.N0 - 0.04 && e.W < e.W0, e],
        ["RÜCKGABE", n.asche >= 1.2 && n.leichnam >= 1.1, n],
        ["MUTANTE-NÄHRSTOFF", n.mutante.W === n.mutante.W0, n.mutante],
        ["SÄMLING", s.saemling, "kein Jungwuchs aus dem Stubben, der Wald wirft den gewachsenen Baum (treeParams(alter))"],
    ]);
}

async function brandSeite(MESS) {
    await window.__weltDa((x) => x.state.playerMesh && x._foundry && x._foundry.ready);
    const [C, P, pm, L] = [r.constructor, Object.getPrototypeOf(r), st.playerMesh.position, (st.worldMeta.taten ||= [])];
    const [B, cs, n0] = [C.BRAND, C.LIFE_FIELD.cell, L.length];
    let t = performance.now();
    const takt = () => r._gameLoopTick((t += 1000 / 60));
    st.perfRegulator = false;
    const y = (x, z) => r._voxelSurfaceY(x, z);
    const stehen = (p) => (pm.set(p.x, y(p.x, p.z) + 1.8, p.z), window.__weltStehtNach(takt));
    const r3 = (v) => Math.round(v * 1e3) / 1e3;
    // die Mitte einer Zelle [x, z], die Zelle eines Orts als Schlüssel
    const xz = (cx, cz) => [(cx + 0.5) * cs, (cz + 0.5) * cs];
    const zelle = (x, z) => [Math.floor(x / cs), Math.floor(z / cs)];
    const bf = () => (st.brandFeld ||= new Map());
    // die Zellen, die die Front erreichte und die nicht fingen, je Grund; je gezündeter Zelle ihr Bett (Höhe, Erlöschungs-Feuchte):
    // die Asche danach fragt, ob sie nass war
    const [halt, gezuendet] = [new Map(), new Map()];
    const leer = () => {
        bf().clear();
        halt.clear();
        gezuendet.clear();
        L.length = n0;
        r._tatGen = (r._tatGen | 0) + 1;
        for (const s of st.wegeKarte ? st.wegeKarte.stufen : []) if (s.zentriert) r._ascheStufeMalen(s);
    };
    const [uhr, jahr] = [st.weatherEffectTime, st.autoSeason];
    st.weatherEffectTime = -1e9;
    st.autoSeason = false;
    const wort = (w) => {
        st.weatherEffectTime = 0;
        r._setWeather(w, "human");
        st.weatherEffectTime = -1e9;
        st.weatherTransition = null;
    };
    const trocken = () => ((r._naesseTakt = () => (st.naesse = 0)), (st.naesse = 0));
    const brennen = (max) => {
        let i = 0;
        for (; i < max && bf().size; i++) (st.spielZeit = r._brandUhr + B.schrittS), r._tickBrand();
        return i;
    };
    const asche = () => L.slice(n0).filter((a) => a.tat === "brand");
    const nass = (f) => r._brandFeuchte(f.boden) >= f.zeile.brenn.mx;
    const nassBett = (cx, cz, f = r._brandStoff(cx, cz)) => f && nass(f);
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
        const f = z && r._brandBett && r._brandBett.get(k);
        if (f) gezuendet.set(k, { y: f.y, mx: f.zeile.brenn.mx });
        if (!z && !halt.has(k)) halt.set(k, grund(cx, cz));
        return z;
    };
    const nassGebrannt = ([cx, cz]) =>
        ((g) => !!g && r._brandFeuchte(P._feuchteAt.call(r, ...xz(cx, cz), g.y)) >= g.mx)(gezuendet.get(cx + "," + cz));
    const zaehle = (g = {}) => {
        for (const v of halt.values()) g[v.split(":")[0]] = (g[v.split(":")[0]] | 0) + 1;
        const A = asche().map((a) => zelle(a.x, a.z));
        return {
            brannte: A.length,
            wasser: g.wasser | 0,
            nass: g.nass | 0,
            fels: g.fels | 0,
            asche: g.asche | 0,
            mager: g.mager | 0,
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
        // DIE FOLGE: Halme, Kräuter und die Albedo des Boden-Stoffs je Zelle (die Kacheln, die sie berühren; gezählt, was in ihr steht)
        const [NW, NS, BF] = [C.NAH_WIESE, C.NAH_STREU, C.BODEN_FARBE];
        const mix = (u, v, k) => u.map((x, i) => x + (v[i] - x) * k);
        const ss = (e0, e1, x) => ((q) => q * q * (3 - 2 * q))(Math.max(0, Math.min(1, (x - e0) / (e1 - e0))));
        const folge = (cx, cz) => {
            const [x0, z0] = [cx * cs, cz * cs];
            const drin = (p) => p.x >= x0 && p.x < x0 + cs && p.z >= z0 && p.z < z0 + cs;
            // je Kachel der Seite `k` (Nah-Wiese, Nah-Streu), die die Zelle berührt
            const je = (k, f) => {
                for (let tx = Math.floor(x0 / k); tx * k < x0 + cs; tx++) for (let tz = Math.floor(z0 / k); tz * k < z0 + cs; tz++) f(tx, tz);
            };
            let [halme, kraut] = [0, 0];
            je(NW.kachel, (tx, tz) => (halme += (r._nahWieseKachelBueschel(tx, tz) || []).filter(drin).length));
            const arten = r._nahStreuArten();
            je(NS.kachel, (tx, tz) => {
                const k = r._nahStreuKachel(tx, tz, arten);
                kraut += (k ? k.items : []).filter((it) => drin(it) && arten[it.art].ernte === "kraut").length;
            });
            const [x, z] = xz(cx, cz);
            const a = r._ascheAt(x, z);
            const c = mix(mix(r._bodenFarbeAt(x, y(x, z), z, [0, 0, 0]), BF.lit, ss(0.15, 0.85, r._kronenStreuAt(x, z))), BF.asche, a);
            return { halme, kraut, a: r3(a), Y: r3(0.2126 * c[0] + 0.7152 * c[1] + 0.0722 * c[2]) };
        };
        // VOR DEM BRAND: die Folge der Zelle des Herds (die Mess-Wiese); der NÄHRSTOFF an ihrer Nachbarin — der Spieler pflückt jede
        // Pflanze der Nah-Streu in ihr (`_harvestScatterPick`), Nährstoff und Wuchs davor und danach, die Mutante (der Nährstoff steht
        // auf 1) vor und nach derselben Ernte
        const [hx, hz] = zelle(MESS.x, MESS.z);
        const vor = folge(hx, hz);
        const N = (aus.naehr = {});
        const ns = st.nahStreu;
        const E = xz(hx + 1, hz);
        const fest = (fn) => ((r._naehrstoffAt = () => 1), ((v) => (delete r._naehrstoffAt, v))(fn()));
        const [N0, W0, W0m] = [r._naehrstoffAt(...E), r._wuchsAt(...E), fest(() => r._wuchsAt(...E))];
        let gepflueckt = 0;
        for (const [senke, s] of ns ? ns.senken : [])
            for (const [key, b] of s.ernte && s.preset !== "stumpf" ? s.bloecke : [])
                for (const it of (ns.kacheln.get(key) || { items: [] }).items)
                    if (b.ids.includes(it.id) && zelle(it.x, it.z).join(",") === hx + 1 + "," + hz && r._harvestScatterPick({ senke, key, id: it.id }))
                        gepflueckt++;
        N.ernte = { n: gepflueckt, N0: r3(N0), W0: r3(W0), N: r3(r._naehrstoffAt(...E)), W: r3(r._wuchsAt(...E)) };
        N.mutante = { W0: r3(W0m), W: r3(fest(() => r._wuchsAt(...E))) };
        leer();
        // HALT: der Herd windauf des Flusses nächst der Mess-Wiese — längs des Strahls gegen den Wind vom Fluss aus (die Spitze läuft
        // ihn zurück): Wasser, dann nasses Bett, dann ununterbrochen trockenes Bett bis zum Herd (Boden-Feuchte ≤ 0,05, ≥ 2 Zellen
        // hinter dem letzten nassen)
        const d = (q) => Math.hypot(q.x - MESS.x, q.z - MESS.z);
        const punkte = [];
        for (const rv of st.hydrosphere?.rivers || []) for (const q of rv.points) if (!q.inLake && d(q) < 320) punkte.push(q);
        punkte.sort((p, q) => d(p) - d(q));
        let herd = null;
        for (const p of punkte) {
            const w = r._windAt(p.x, p.z, st.spielZeit);
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
            if (j > k && (!herd || j - k > herd.abstand)) herd = { c: xz(strahl[j].cx, strahl[j].cz), fluss: [Math.round(p.x), Math.round(p.z)], nass: k - n + 1, abstand: j - k };
        }
        if (!herd) return { fehler: "kein Strahl Fluss → nasses Bett → trockenes Bett (Herd mit Boden-Feuchte ≤ 0,05) binnen 320 m um die Mess-Wiese" };
        const lauf = () => (r._brandEntfachen(...herd.c), brennen(3600));
        aus.halt = Object.assign({ herd: herd.c.map(Math.round), fluss: herd.fluss, nassZellen: herd.nass, trockenZellen: herd.abstand, schritte: lauf() }, zaehle());
        leer();
        r._feuchteAt = () => 0;
        lauf();
        delete r._feuchteAt;
        aus.haltM = zaehle();
        leer();
        // FELS: die nächste Zelle aus Stein mit einem trockenen Bett daneben
        let fels = null;
        for (let R = 1; R <= 30 && !fels; R++)
            for (let i = -R; i <= R && !fels; i++)
                for (const [cx, cz] of [[hx + i, hz - R], [hx + i, hz + R], [hx - R, hz + i], [hx + R, hz + i]]) {
                    const [x, z] = xz(cx, cz);
                    if (r._kontaktStoffAt(x, z, y(x, z)) !== "stein" || r._nassAt(x, z)) continue;
                    // der Herd windauf der Stein-Zelle (die Spitze der Front läuft auf sie zu), sonst die Nachbarin, die am meisten windauf liegt
                    const w = r._windAt(x, z, st.spielZeit);
                    const n = [[1, 0], [-1, 0], [0, 1], [0, -1], [1, 1], [1, -1], [-1, 1], [-1, -1]]
                        .sort(([a, b], [c, e]) => a * w.x + b * w.z - (c * w.x + e * w.z))
                        .map(([a, b]) => [cx + a, cz + b])
                        .find(([a, b]) => r._brandStoff(a, b) && !nassBett(a, b));
                    if (n) {
                        fels = { stein: [cx, cz], herd: n };
                        break;
                    }
                }
        if (fels) {
            r._brandEntfachen(...xz(...fels.herd));
            brennen(900);
            const k = fels.stein.join(",");
            Object.assign(fels, { erreicht: halt.has(k), grund: halt.get(k) || null, gehalten: !asche().some((a) => zelle(a.x, a.z).join(",") === k) });
        }
        aus.fels = fels;
        leer();
        delete r._brandZuenden;
        // REGEN und LESER am Herd der Mess-Wiese
        const leser = () => {
            r._updateDorfRauch(1 / 60);
            const g = r._glutAmOhr(pm.x, pm.z, () => 0);
            return {
                licht: r._leuchtQuellen(pm.x, pm.y, pm.z, 64).filter((q) => q.quelle === "brand").length,
                rauch: (st.dorfRauch?.quellen || []).filter((q) => q.brand).length,
                glutD: Number.isFinite(g.d) ? r3(g.d) : null,
                glutF: r3(g.flaeche),
            };
        };
        aus.leserM = leser();
        const brennt = () => [...bf().values()].filter((z) => z.t0 !== null);
        const regen = (mutante) => {
            leer(), trocken(), wort("cloudy");
            r._brandEntfachen(MESS.x, MESS.z);
            brennen(30);
            const R = { brannte: brennt().length };
            if (mutante) r._brandFeuchte = (b) => P._brandFeuchte.call(r, b) - B.feuchte.nass * (st.naesse || 0);
            else aus.leser = leser();
            delete r._naesseTakt;
            r._naesseUhr = st.spielZeit;
            wort("rainy");
            for (R.s = 0; R.s < 300 && bf().size; R.s++) (st.spielZeit = r._brandUhr + B.schrittS), takt();
            delete r._brandFeuchte;
            R.naesse = r3(st.naesse);
            wort("cloudy"), trocken();
            return R;
        };
        aus.regenM = regen(true);
        aus.regen = regen(false);
        N.asche = r3(r._naehrstoffAt(MESS.x, MESS.z)); // die Asche des Herds, frisch
        // ASCHE: die Zelle des Herds (verbrannt, im Regen erloschen) auf der Asche, nach der Stufe Gras, nach der Stufe Busch
        const a = asche().find((q) => zelle(q.x, q.z).join(",") === hx + "," + hz);
        const F = (aus.asche = { vor, zelle: [hx, hz], tat: !!a });
        if (a) {
            await stehen(MESS);
            F.asche = folge(hx, hz);
            r._ascheAt = () => 0;
            F.mutante = folge(hx, hz);
            delete r._ascheAt;
            const dauer = r._tatIndex().dauer.get(a);
            const bis = async (s) => {
                for (let n = 0; n < 400 && r._weltStunde() < a.h + s * dauer; n++) {
                    r.setTimeOfDay((st.timeOfDay + Math.min(4, a.h + s * dauer - r._weltStunde() + 1e-3) / 24) % 1, "regler");
                    takt();
                }
                await stehen(MESS);
                return Object.assign(folge(hx, hz), { s: r3(r._sukzession(a).s) });
            };
            F.dauer = r3(dauer);
            F.gras = await bis(0.31);
            F.busch = await bis(0.61);
        }
        // DER LEICHNAM: ein Riss von Spieler-Hand an einer Zelle neben dem Herd
        const [Dx, Dz] = xz(hx - 1, hz - 1);
        st.maxCreatures = st.creatures.length + 1;
        const tier = r.spawnCreatureAt(Dx, y(Dx, Dz), Dz, "calm", "wolf", { precise: true, bodySize: 1 });
        if (tier) r._creatureCombatDeath(tier, "player");
        N.leichnam = r3(r._naehrstoffAt(Dx, Dz));
        // ZEIT: jede Zelle mit Bett im geladenen Ring um die Mess-Wiese fängt (eine Spirale); trägt die Welt dort weniger als
        // 2 000 Zellen Bett (das Bett der Wiese liest die Boden-Karte gebauter Chunks), füllen Abzüge der brennenden Zellen den
        leer(), trocken(), wort("cloudy");
        for (let R = 0; R <= 40; R++)
            for (let i = -R; i <= R; i++)
                for (const c of R ? [[hx + i, hz - R], [hx + i, hz + R], [hx - R, hz + i], [hx + R, hz + i]] : [[hx, hz]]) {
                    r._brandEntfachen(...xz(...c));
                    if (!R) break;
                }
        const echt = brennt();
        for (let k = 0; brennt().length < 2000 && echt.length; k++) {
            const q = echt[k % echt.length];
            const [cx, cz] = [q.cx + 1000 + (k % 64), q.cz + 1000 + Math.floor(k / 64)];
            bf().set(cx + "," + cz, Object.assign({}, q, { cx, cz, von: null, y: null }));
        }
        const zn = brennt().length;
        // 1 200 Bilder zu 1/60 s (20 s Spielzeit): je Bild der Takt (`_tickBrand`, seine geteilte Arbeit) und die Leser; der Verzug
        // ist die Spielzeit, um die der angefangene Schritt hinter der Uhr liegt
        const [ms, lms] = [[], []];
        let verzug = 0;
        for (let i = 0; i < 1200; i++) {
            st.spielZeit += 1 / 60;
            const t0 = performance.now();
            r._tickBrand();
            const t1 = performance.now();
            verzug = Math.max(verzug, st.spielZeit - (r._brandRest ? r._brandRest.t : r._brandUhr));
            r._leuchtQuellen(pm.x, pm.y, pm.z, 64);
            r._updateDorfRauch(1 / 60);
            r._glutAmOhr(pm.x, pm.z, () => 0);
            ms.push(performance.now() - t0);
            lms.push(performance.now() - t1);
        }
        const p95 = (v) => r3(v.sort((p, q) => p - q)[Math.floor(v.length * 0.95)]);
        aus.zeit = { brennend: zn, echt: echt.length, bildMs: p95(ms), leserMs: p95(lms), verzugS: r3(verzug) };
        leer();
        aus.saemling = null; // der Jungwuchs ist nicht gebaut (treeParams(alter))
        return aus;
    } finally {
        for (const k of ["_brandZuenden", "_naesseTakt", "_feuchteAt", "_brandFeuchte", "_ascheAt", "_naehrstoffAt"]) delete r[k];
        st.weatherEffectTime = uhr;
        st.autoSeason = jahr;
    }
}

if (process.argv.includes("--selftest")) {
    console.log("=== STAND-TAKT — Selbsttest (ohne Browser) ===");
    selbsttest();
    // die Tat-, Nachwuchs-, Brand- und Sukzessions-Linse: je Linse ihr grüner Befund und je Täter [Name, Pfad, Wert, …] — der Befund
    // mit den Werten an den Pfaden nennt den Namen zuerst, ein leerer Befund LEER
    const falsch = (U, gruen, T) =>
        [["", gruen], ["LEER", {}], ...T.map(([n, ...pw]) => {
            const b = JSON.parse(JSON.stringify(gruen));
            for (let i = 0; i < pw.length; i += 2) ((p) => (p.slice(0, -1).reduce((x, k) => x[k], b)[p.at(-1)] = pw[i + 1]))(pw[i].split("."));
            return [n, b];
        })]
            .filter(([n, b]) => (U(b).join() + "|").split(":")[0] !== (n || "|"))
            .map(([n]) => n || "GRÜN");
    selbsttestEnde(
        [
            ...falsch(tatUrteil, { gefaellt: 10, gepflueckt: 30, baeumeVorher: 12, stunde: { baeume: 2, pflanzen: 0, stuempfe: 10, narbe: -0.2 } }, [["NARBE", "stunde.narbe", 0], ["STUMPF", "stunde.stuempfe", 0], ["ERNTE", "stunde.pflanzen", 9], ["BAUM", "stunde.baeume", 12], ["LEER", "gefaellt", 3]]),
            ...falsch(nachwuchsUrteil, { echt: { n: 40, da: 40, jahr: 8760, r: 1, offen: 9, rOffen: 1, quote: 2 }, mutante: { rOffen: 0, quote: 1 } }, [["JAHR", "echt.da", 9], ["KORRELATION", "echt.r", 0], ["FEUCHTE", "echt.quote", 1], ["MUTANTE", "mutante.quote", 2]]),
            ...falsch(
                brandUrteil,
                {
                    halt: { brannte: 9, wasser: 0, nass: 3, wasserGebrannt: 0, nassGebrannt: 0 },
                    haltM: { nassGebrannt: 2, nass: 0, wasser: 1, wasserGebrannt: 0 },
                    fels: { erreicht: true, gehalten: true },
                    regen: { brannte: 2, s: 20 },
                    regenM: { s: 300 },
                    leser: { licht: 1, rauch: 1, glutD: 0, glutF: 256 },
                    leserM: { licht: 0, rauch: 0, glutF: 0 },
                    asche: { vor: { Y: 0.11, halme: 40 }, asche: { Y: 0.052, a: 1 }, gras: { a: 0, Y: 0.11 }, mutante: { Y: 0.11, halme: 40 } },
                    zeit: { brennend: 2000, bildMs: 0.3, verzugS: 1.1 },
                },
                [["HALT", "halt.nass", 0], ["HALT-BRUCH", "halt.nassGebrannt", 1], ["MUTANTE-HALT", "haltM.nassGebrannt", 0], ["FLUSS", "halt.wasser", 0, "haltM.wasser", 0], ["FELS", "fels.gehalten", false], ["REGEN", "regen.s", 196], ["MUTANTE-REGEN", "regenM.s", 20], ["LESER", "leser.rauch", 0], ["MUTANTE-LESER", "leserM.licht", 1], ["ASCHE", "asche.asche.Y", 0.11], ["GRÜNT", "asche.gras.a", 0.5], ["MUTANTE-ASCHE", "asche.mutante.Y", 0.05], ["ZEIT", "zeit.bildMs", 2], ["ZEIT", "zeit.verzugS", 9]]
            ),
            ...falsch(
                sukzessionUrteil,
                {
                    asche: { vor: { halme: 40, kraut: 6 }, asche: { halme: 0, kraut: 0 }, gras: { halme: 38, kraut: 1 }, busch: { kraut: 6 } },
                    naehr: { ernte: { n: 5, N0: 1, N: 0.9, W0: 0.8, W: 0.78 }, asche: 1.4, leichnam: 1.2, mutante: { W0: 0.8, W: 0.8 } },
                    saemling: true,
                },
                [["ASCHE", "asche.asche.halme", 30], ["GRAS", "asche.gras.kraut", 6], ["BUSCH", "asche.busch.kraut", 1], ["ERNTE", "naehr.ernte.N", 1], ["RÜCKGABE", "naehr.asche", 1], ["MUTANTE-NÄHRSTOFF", "naehr.mutante.W", 0.7], ["SÄMLING", "saemling", null]]
            ),
        ],
        "die Tat-, Nachwuchs-, Brand- und Sukzessions-Linse nennen jeden Täter."
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

(async () => {
    console.log("=== STAND-TAKT (Welle K) — Null-Renderer, Mess-Wiese, die Stand-Linse je Frame ===");
    await server.lausche(PORT);
    const browser = await starteBrowser({ art: "null", frist: 600000 });
    const page = await browser.newPage();
    page.setDefaultTimeout(580000);
    await page.evaluateOnNewDocument(() => {
        window.__anazhHeadlessNullRenderer = true;
        window.__anazhFernRing = true; // der Fern-Ring (die Saum-Wache) läuft auch ohne GPU — sein Haken
        window.__anazhAutoSettlement = false; // kein Start-Dorf: was es baut, hinge an der Bildrate (die Mess-Bühne)
    });
    let befund = null;
    try {
        await server.zeige(page, 120000, "index.html", "networkidle0");
        await warteAufWelt(page, 120000);
        await page.evaluate(STAND.STAND_INSTALL + require("./lib/kamera-nah.cjs").KAMERA_NAH_INSTALL);
        if (TAT) befund = await tatLauf(page);
        else if (NACHWUCHS) befund = await page.evaluate(tatSeite, MESS, { ufer: true });
        else if (BRANDLAUF) befund = await page.evaluate(brandSeite, MESS);
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
                st.playerMesh.position.set(MESS.x, r._voxelSurfaceY(MESS.x, MESS.z) + 1.8, MESS.z);
                // einschwingen: die Welt steht (A9, das EINE Einschwingen, welt-boot `__weltStehtNach`: Chunks, die Foundry, der Wald
                // samt seinen Pflanz-Gängen — K69: solange er plant, weckt seine Regung die Fege-Takte)
                await window.__weltStehtNach(takt);
                const ring = st.voxelChunks.size;
                const aus = { ring, architekturen: (st.architectures || []).length };
                // (W) WACH: ein kalter Bau, den der Cull meldet (Offenes), hält die Welt wach — beim Namen des Fege-Takts. Den atmenden
                // Regler hält das Einschwingen (welt-boot Selbsttest REGLER).
                const R0 = st.architectureCullingRadius;
                r._foundryRewarmColdTrees = () => 1;
                st.architectureCullingRadius = R0 + 2e-3;
                aus.wach = await window.__weltStehtNach(takt, 60).then((n) => `steht nach ${n} Takten`, (x) => String(x.message).slice(0, 200));
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
                    window.__gebautNach(name, { fertig, max, takt: jeTakt }).catch((f) => {
                        if (!/^DER BAU STEHT NICHT/.test(f.message)) throw f;
                        return max;
                    });
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
                // Die Ankunft gleitet noch (B2, ein Bild von 90): jede Stufen-Wahl misst weiter, als das Auge steht.
                const [K, stand, gleit] = [st.camera.position, r._weltSteht(), st._ankunftGleit];
                st._ankunftGleit = 0;
                aus.fixWach = stand && r._weltSteht() && "Gleite";
                st._ankunftGleit = gleit;
                const h = st.camera.getWorldDirection(K.clone()).multiplyScalar(-60).add(K);
                r._passSicht(st.camera, false);
                r._passSicht(st.camera, true);
                aus.sonde = window.__nahDeckung({ gw: 1, gh: 1, ziel: h.setY(r._voxelSurfaceY(h.x, h.z) - 2) }).ziel;
                K.x += 40;
                aus.fixWach = aus.fixWach || (stand && r._weltSteht() && "Sprung");
                K.x -= 40;
                st.architectureCullingRadius += 1e-3;
                takt();
                aus.fixWach = aus.fixWach || (r._weltSteht() && "Weckruf");
                st.architectureCullingRadius -= 1e-3;
                const LD = r.constructor.LOD_DISTANCES;
                const d12 = LD.thresh12;
                const fixpunkt = async (d) => {
                    const wach = [];
                    LD.thresh12 = d;
                    const f = { takte: await window.__weltStehtNach(() => (takt(), wach.push(L.frame()))) };
                    f.wirkte = Object.values(window.__standPhase(wach).takte).reduce((a, t) => a + t.wirkt, 0);
                    f.nach = await phase(150);
                    return f;
                };
                try {
                    aus.fix = [await fixpunkt(d12 * 0.8), await fixpunkt(d12)];
                } catch (e) {
                    aus.fix = [{ fehler: String(e.message).slice(0, 200) }];
                    LD.thresh12 = d12;
                    await window.__weltStehtNach(takt);
                }
                // Die TREUE-PHASE: die Wache gebrochen (`_standRuht` schläft nie), so lange,
                // bis JEDER Takt eine volle Runde ging — die Runde nennt der Takt selbst (`_standRuht(name, runde, …)`), gegangen
                // ist, was er `_standMeldet` (die Arbeit der Wache). `jeFrame(f, gang)` sieht jeden Frame.
                const ruheRuf = P._standRuht;
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
                    const gang = () => Object.fromEntries(namen.map((n) => [n, arbeit(n) - a0[n]]));
                    P._standRuht = function (...a) {
                        const r = a[1] | 0;
                        if (runden[a[0]] !== undefined && runden[a[0]] !== r && !(a[0] in rundeVon))
                            rundeVon[a[0]] = runden[a[0]];
                        runden[a[0]] = r;
                        ruheRuf.apply(this, a);
                        return false;
                    };
                    const fs = [];
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
                        P._standRuht = ruheRuf;
                    }
                    const ph = window.__standPhase(fs);
                    const g = gang();
                    for (const n of namen)
                        if (ph.takte[n])
                            Object.assign(
                                ph.takte[n],
                                { runde: runden[n], gang: g[n] },
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
                    // die Stufen-Wahl (`_tickArchitectureLOD`: Einträge ab `_archLODCursor`): ein Baum hält still ein Verdeckt-
                    // Urteil, das der Gang ohne Verdeckung (Null-Renderer) oder im Nahbereich zurücknimmt
                    {
                        const archs = st.architectures || [];
                        const n = archs.length;
                        const c0 = Number.isFinite(r._archLODCursor) ? r._archLODCursor : 0;
                        const occlOn =
                            st.useOcclusionDemotion !== false && !st.renderer?._isHeadlessNull;
                        for (let o = n - 1; o >= 0; o--) {
                            const e = archs[(c0 + o) % n];
                            if (!e || !e.instanced || e._occluded || e._bruecke) continue;
                            const treeLike = !!e._lodSpecies && Number.isFinite(e._lodVariantIndex);
                            if (!treeLike && e.instFoundry !== true) continue;
                            if (r._lodTreeVisHeight(e) === null) continue;
                            const dist = Math.hypot(e.position.x - pp.x, e.position.z - pp.z);
                            if (occlOn && dist > r.constructor.OCCLUSION.occDist) continue;
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
                        const SC = r.constructor.SCATTER;
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
                    // die Treue nach dem Bau: die gebrochene Wache findet nichts, was die schlafende verschlief
                    W.treue = await treuePhase();
                    W.stufeRuhe = e ? e._lodLevel : null;
                    await bisRuhe(300);
                    // ein Regler-Schritt (der Cull-Radius 20 m enger) weckt den Cull-Gang, er räumt den Rand
                    const rad = st.architectureCullingRadius;
                    st.architectureCullingRadius = rad - 20;
                    W.regler = await phase(10);
                    st.architectureCullingRadius = rad;
                    await bisRuhe(600);
                    // ein Wahrnehmungs-Schritt (die LOD-Distanz L1→L2, `LOD_DISTANCES.thresh12`, ohne Weckruf geschrieben): der
                    // Stempel liest ihn selbst — Stufen-Wahl und Streu gehen
                    const D = r.constructor.LOD_DISTANCES;
                    const d12 = D.thresh12;
                    D.thresh12 = d12 + 0.5;
                    W.wahrnehmung = await phase(4);
                    D.thresh12 = d12;
                    await bisRuhe(600);
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
                    const B = r.constructor.BODEN_STUFEN;
                    const grenzen = [0, span];
                    for (const s of B.stufen) {
                        if (!(s.bis < Infinity)) continue;
                        for (const t of [s.bis + B.vorlauf, s.bis + B.vorlauf + B.halt]) {
                            grenzen.push(t % span, span - (t % span));
                        }
                    }
                    grenzen.sort((u, v) => u - v);
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
                    st.keys = { w: true };
                    try {
                        aus.gehen = await phase(120);
                    } finally {
                        st.keys = {};
                    }
                    const p1 = st.playerMesh.position;
                    aus.gehen.weg = +Math.hypot(p1.x - p0.x, p1.z - p0.z).toFixed(2);
                    aus.gehen.zelleGleich = zelle(p1) === z0;
                    aus.gehen.ankerGleich = (st.fernRing ? st.fernRing.gen | 0 : -1) === g0;
                }
                // (U) STUFE: aus der Ruhe tauscht ein ferner Chunk seine Stufe hin und zurück, wie der Streaming-Takt
                // (`_rebuildVoxelChunk(cx, cz, lod)`, hier synchron) — gezählt je Takt die Einheiten und die Rufe des Walds
                {
                    // DIE RUHE VOR DEM WECHSEL: offener Wuchs ist keine Ruhe. Nach dem Gehen liegen Chunks neu im `foliageRadius`,
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
                    const ankunft0 = F ? F.ankunft | 0 : 0;
                    const pm = st.playerMesh.position;
                    let ziel = null;
                    const formWartet = (k) =>
                        st.grassDirtyChunks?.has(k) ||
                        (st.dirtyVoxelChunks && st.dirtyVoxelChunks.has(k));
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
                        ziel: ziel && {
                            cx: ziel.cx,
                            cz: ziel.cz,
                            d: Math.round(ziel.d),
                            populiert: !!st.voxelPopulatedChunks?.has(ziel.cx + "," + ziel.cz),
                        },
                        wuchs,
                        studio, // Takte bis die Bestellungen des Studios ruhten
                        ankunft: 0, // Ankünfte des Studios während der Phase
                        regung: [], // wer die Menge regt (nicht die Stufe): die ersten Rufer beim Namen
                    };
                    const regtAlt = P._weltRegt;
                    P._weltRegt = function (boden, stufe) {
                        if (stufe !== true && U.regung.length < 3) {
                            const z = String(new Error().stack || "")
                                .split("\n")
                                .slice(2, 6)
                                .map((l) => (l.match(/at (?:AnazhRealm\.)?([\w$.]+)/) || [])[1])
                                .filter(Boolean)
                                .join(" < ");
                            if (!U.regung.includes(z)) U.regung.push(z);
                        }
                        return regtAlt.call(this, boden, stufe);
                    };
                    const alt = {};
                    for (const m of Object.keys(U.rufe)) {
                        alt[m] = P[m];
                        P[m] = function (...a) {
                            U.rufe[m]++;
                            return alt[m].apply(this, a);
                        };
                    }
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
                        Object.assign(P, alt);
                        P._weltRegt = regtAlt;
                        U.ankunft = (F ? F.ankunft | 0 : 0) - ankunft0;
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
                    const C = r.constructor.FOREST.cell;
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
                    const core = globalThis.__phytoCore;
                    const pfcRoh = core.planForestCell;
                    let pfc = 0;
                    core.planForestCell = function () {
                        pfc++;
                        return pfcRoh.apply(this, arguments);
                    };
                    try {
                        const oy = r._voxelSurfaceY(ox, oz);
                        const t0 = performance.now();
                        O.gelegt = r._erdbauSetzen("gate-stand-takt-ort", [
                            { art: "platte", cx: ox, cz: oz, phi: 0, ex: 6, ez: 6, y: Number.isFinite(oy) ? oy : 0 },
                        ]);
                        O.setzMs = +(performance.now() - t0).toFixed(1);
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
                        O.plan = pfc;
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
                        const saveEigen = Object.prototype.hasOwnProperty.call(r, "saveState");
                        const saveRoh = r.saveState;
                        let saves = 0;
                        let saveMs = 0;
                        r.saveState = function () {
                            const t2 = performance.now();
                            saves++;
                            try {
                                return saveRoh.apply(this, arguments);
                            } finally {
                                saveMs += performance.now() - t2;
                            }
                        };
                        try {
                            let ab = 0;
                            for (const e of natur) if (r.removeArchitecture(e)) ab++;
                            O.raeumung = { abbau: ab, saves, saveMs: +saveMs.toFixed(1) };
                        } finally {
                            if (saveEigen) r.saveState = saveRoh;
                            else delete r.saveState;
                        }
                    } finally {
                        core.planForestCell = pfcRoh;
                    }
                    // DAS SOLO-HAUS (K69, B3c: Vorschau, KI) über die Wurzel — gezählt, wie oft der Wirt das ganze Haus im Kern baut,
                    // um die Kamin-Spitze zu finden (`chimneyTipFromParams` → `massBau`); sie reist mit der Hülle (`__huelle.kamin`)
                    {
                        const fc = globalThis.__fachwerkCore;
                        const recs = r._foundry?.recipes || {};
                        const kultur = Object.keys(recs).find((k) => {
                            const pol = r.constructor.KIND_POLICY[recs[k] && recs[k].kind];
                            return pol && pol.prefix === "haus_" && st.blueprints["haus_" + k];
                        });
                        const [kx, kz] = [ox - 40, oz + 40];
                        const ky = r._voxelSurfaceY(kx, kz);
                        const tipRoh = fc.chimneyTipFromParams;
                        let n = 0;
                        let ms = 0;
                        fc.chimneyTipFromParams = function () {
                            const t3 = performance.now();
                            n++;
                            try {
                                return tipRoh.apply(this, arguments);
                            } finally {
                                ms += performance.now() - t3;
                            }
                        };
                        let gesetzt = false;
                        try {
                            if (kultur && Number.isFinite(ky)) {
                                const ort = { x: kx, y: ky + 0.5, z: kz };
                                const e = r.spawnArchitecture("haus_" + kultur, ort, { silent: true });
                                gesetzt = !!e;
                                if (e) r.removeArchitecture(e);
                            }
                        } finally {
                            fc.chimneyTipFromParams = tipRoh;
                        }
                        O.kamin = { kultur: kultur || null, gesetzt, bau: n, ms: +ms.toFixed(1) };
                    }
                    // DER BAUM IN FRISCHEM WALD: ein Hof-Baum des Dorfs (`_naturSetzen`, wie die Ausstattung
                    // `_spawnSettlementErlebnis`) an einem Ort, dessen Wald nie geplant wurde — gezählt die Wald-Zellen, die
                    // sein Setzen SYNCHRON plant (`planForestCell` im Aufrufer), dann die Takte, bis seine Gestalt steht, und
                    // die längste Plan-Arbeit eines Takts (die Schlange des Walds, `_tickWaldPlan`)
                    {
                        const core = globalThis.__phytoCore;
                        const roh = core.planForestCell;
                        let n = 0;
                        let ms = 0;
                        core.planForestCell = function () {
                            const t4 = performance.now();
                            n++;
                            try {
                                return roh.apply(this, arguments);
                            } finally {
                                ms += performance.now() - t4;
                            }
                        };
                        const Wd = { gesetzt: false };
                        try {
                            const C = r.constructor.FOREST.cell;
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
                                n = 0;
                                ms = 0;
                                const e = r._naturSetzen(
                                    "baum_eiche",
                                    { x: wx, y: wy, z: wz },
                                    { seed: 4711, scale: 0.6, rotationY: 0, silent: true }
                                );
                                if (!e) continue;
                                Object.assign(Wd, { gesetzt: true, ort: [wx, wz], synchron: n, ms: +ms.toFixed(1) });
                                const preset = r._foundryPresetForEntry(e);
                                let g = r._foundryGestaltFor(e, preset);
                                let maxN = 0;
                                let maxMs = 0;
                                n = 0;
                                const takte = await bisDa("die Gestalt im frischen Wald", () => Number.isInteger(g), 600, () => {
                                    const n0 = n;
                                    const m0 = ms;
                                    takt();
                                    if (ms - m0 > maxMs) maxMs = ms - m0;
                                    maxN = Math.max(maxN, n - n0);
                                    g = r._foundryGestaltFor(e, preset);
                                });
                                Object.assign(Wd, {
                                    takte,
                                    gestalt: Number.isInteger(g) ? g : null,
                                    imTakt: n,
                                    maxTaktZellen: maxN,
                                    maxTaktMs: +maxMs.toFixed(1),
                                });
                                r.removeArchitecture(e);
                                break;
                            }
                        } finally {
                            core.planForestCell = roh;
                        }
                        O.wald = Wd;
                    }
                    // DAS HAUS IM SATZ: ein Dorf-Haus tritt in den Bau-Satz seiner Stoffe (`_tickBauSatz › _bauSatzBlock ›
                    // _satzBlock`), verlässt ihn und tritt ein zweites Mal ein (ein stehender Bereich legt nur geänderte Slots) —
                    // gezählt die Bytes, die der Block dabei FRISCH anlegt
                    {
                        const recs = r._foundry?.recipes || {};
                        const kultur = Object.keys(recs).find((k) => {
                            const pol = r.constructor.KIND_POLICY[recs[k] && recs[k].kind];
                            return pol && pol.prefix === "haus_" && st.blueprints["haus_" + k];
                        });
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
                                    .map((s) => st.archInstanceGroups && st.archInstanceGroups.get(s.key))
                                    .filter((g) => g?.satz && (g.liveCount | 0) > 0);
                            const drin = () => {
                                const gs = gruppen();
                                return (
                                    gs.length > 0 &&
                                    gs.every((g) => {
                                        const s = st.chunkSaetze && st.chunkSaetze.get(g.satz);
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
                                const roh = r._satzBlock;
                                let frisch = 0;
                                const zaehl = (Typ) =>
                                    new Proxy(Typ, {
                                        construct(t, a) {
                                            const x = Reflect.construct(t, a);
                                            frisch += x.byteLength;
                                            return x;
                                        },
                                    });
                                r._satzBlock = function () {
                                    SH.bloecke++;
                                    globalThis.Float32Array = zaehl(T.F);
                                    globalThis.Uint32Array = zaehl(T.U);
                                    try {
                                        return roh.apply(this, arguments);
                                    } finally {
                                        globalThis.Float32Array = T.F;
                                        globalThis.Uint32Array = T.U;
                                    }
                                };
                                try {
                                    for (const g of gs) r._chunkSatzAus(g.satz, g.key) && r._bauSatzMarke(g.key, g.satz);
                                    r._tickBauSatz(Infinity);
                                } finally {
                                    delete r._satzBlock;
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
                        const bauEigen = Object.prototype.hasOwnProperty.call(r, "_buildVoxelChunkData");
                        const bauRoh = r._buildVoxelChunkData;
                        let imTakt = false;
                        const kette = () =>
                            new Error().stack
                                .split("\n")
                                .map((s) => (s.match(/at (?:AnazhRealm\.|Object\.|r\.)?(_[\w$]+)/) || [])[1])
                                .filter(Boolean)
                                .slice(1, 5)
                                .reverse()
                                .join(" › ");
                        r._buildVoxelChunkData = function () {
                            const t4 = performance.now();
                            try {
                                return bauRoh.apply(this, arguments);
                            } finally {
                                const ms = performance.now() - t4;
                                if (imTakt) A.sync.push({ ms: +ms.toFixed(1), kette: kette() });
                            }
                        };
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
                            if (bauEigen) r._buildVoxelChunkData = bauRoh;
                            else delete r._buildVoxelChunkData;
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
                    const core = globalThis.__phytoCore;
                    const roh = core.planForestCell;
                    const jobEigen = Object.prototype.hasOwnProperty.call(r, "_tickWaldPlan");
                    const jobRoh = r._tickWaldPlan;
                    const W = { imJob: 0, aussen: 0, ms: 0, taeter: null, maxTakt: 0 };
                    let tiefe = 0;
                    let jetztTakt = 0;
                    r._tickWaldPlan = function () {
                        tiefe++;
                        try {
                            return jobRoh.apply(this, arguments);
                        } finally {
                            tiefe--;
                        }
                    };
                    // der Rechner der Schlange ist der Wald-Faden: seine Lieferungen (`_waldDartsAn`) plante die
                    // Schlange — sie zählen wie ihre Zellen im Job
                    const anEigen = Object.prototype.hasOwnProperty.call(r, "_waldDartsAn");
                    const anRoh = r._waldDartsAn;
                    r._waldDartsAn = function (memo, zellen, res) {
                        if (res && zellen) W.imJob += zellen.length / 2;
                        return anRoh.apply(this, arguments);
                    };
                    core.planForestCell = function () {
                        const t5 = performance.now();
                        try {
                            return roh.apply(this, arguments);
                        } finally {
                            if (tiefe > 0) W.imJob++;
                            else {
                                W.aussen++;
                                jetztTakt++;
                                W.ms += performance.now() - t5;
                                if (!W.taeter)
                                    W.taeter = (new Error().stack || "")
                                        .split("\n")
                                        .map((s) => (s.match(/at (?:[\w$]+\.)?(_[\w$]+)/) || [])[1])
                                        .filter((m) => m && m !== "_forestCellDarts")
                                        .slice(0, 4)
                                        .join(" › ");
                            }
                        }
                    };
                    let n = 0;
                    let nach = 0;
                    try {
                        const gang = () => {
                            jetztTakt = 0;
                            takt();
                            W.maxTakt = Math.max(W.maxTakt, jetztTakt);
                        };
                        n = await bisDa("der Spieler-Chunk am fremden Ort", () => !!st.voxelChunks?.has(key), 600, gang); // prettier-ignore
                        // der Chunk steht — sein Wald und der seiner Nachbarn kommt in den Takten danach (240 ohne Offenes)
                        nach = await bisDa("der Wald am fremden Ort", () => false, 240, gang);
                    } finally {
                        core.planForestCell = roh;
                        if (jobEigen) r._tickWaldPlan = jobRoh;
                        else delete r._tickWaldPlan;
                        if (anEigen) r._waldDartsAn = anRoh;
                        else delete r._waldDartsAn;
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
                aus.wache =
                    st && r._standWache ? [...r._standWache.takte].map(([n, x]) => [n, x.ruht, x.arbeit]) : null;
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
                await window.__weltStehtNach(takt);
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
                r.spawnSettlement({ seed: 7, nH: 12, autonomous: true, verlangt: "nexus" }).then((x) => (D.placed = x && x.placed));
                D.steht = await window.__weltStehtNach(takt).catch((x) => x.message);
                // (RS) DIE SIMS IN RUHE (feld.K3): an der Mess-Wiese 60 s Spielzeit nach einer Tat (eine Ernte der Nah-Streu über
                // den echten Schreiber, ein Leben am Spieler), Wetter und Saison ruhen; danach (WS) je Sim ihr Ereignis
                {
                    const pm = st.playerMesh.position;
                    pm.set(MESS.x, r._voxelSurfaceY(MESS.x, MESS.z) + 1.8, MESS.z);
                    await window.__weltStehtNach(takt);
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
                        const ns = st.nahStreu;
                        for (const s of ns ? ns.senken.values() : [])
                            for (const [key, bl] of s.ernte && !vorher.ernte ? s.bloecke : []) {
                                const pick = { key, senke: s.key, id: bl.ids[0] };
                                const k = ns.kacheln.get(key);
                                if (!bl.n || !k || !k.items.some((it) => it.id === pick.id)) continue;
                                if (r._harvestScatterPick(pick)) vorher.ernte = pick;
                                break;
                            }
                        r._depositLife(pm.x, pm.z);
                        vorher.leben = st.lifeField.size;
                        // das Wort des Spielers über den EINEN Schreiber ohne Übergang (die Bühne), dann Sonne und trocken
                        const wort = (w) => {
                            st.weatherEffectTime = 0;
                            r._setWeather(w, "human");
                            st.weatherEffectTime = -1e9;
                            st.weatherTransition = null;
                        };
                        // die Ruhe ist sonnig und trocken: der erste Zug der Welt-Uhr zog das Wetter der Front (feld.K2#2); das Wort
                        // senkt See und Fluss (wetter.K3: der Regen des Felds ist ein Term des Pegels) — die Neubauten der Chunks am
                        // Wasser kommen, bis die Welt steht (an der Mess-Wiese 12 Chunks, nach 60 Takten warteten noch 3)
                        wort("sunny");
                        r._naesseTakt(1e6);
                        await simPhase(60); // jede Sim geht ihren Gang bis an ihren Fixpunkt
                        await window.__weltStehtNach(takt);
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
                        await window.__weltStehtNach(takt); // die Neubauten am Wasser (wetter.K3) vor der nächsten Weck-Probe
                        W.regen.nachher = await simPhase(60);
                        const fr = st.foliageRadius;
                        W.wuchs = { offen: st.pendingFoliageChunks ? st.pendingFoliageChunks.size : 0 };
                        await weck("wuchs", () => (st.foliageRadius = (fr != null ? fr : r.constructor.PERF_FOLIAGE_RADIUS_MAX) + 1e-3));
                        st.foliageRadius = fr;
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
                        const C = r.constructor.LIFE_FIELD;
                        const lebt = (e) => Math.abs(e.a * Math.exp(-C.decayPerSec * (st.spielZeit - e.t))) >= C.epsilon;
                        const F = (W.feld = { wellen: [], geschrieben: 0 });
                        S.frame();
                        for (let w = 0; w < 4; w++) {
                            st.spielZeit += 3000;
                            for (let i = 0; i < 60; i++) r._depositLife(MESS.x + 4000 + i * 64, MESS.z + 4000 + w * 64);
                            F.geschrieben += 540;
                            const alle = [...st.lifeField.values()];
                            F.wellen.push({ groesse: alle.length, tote: alle.filter((e) => !lebt(e)).length });
                        }
                        F.welle = window.__simPhase([S.frame()], 0);
                        // der Brand (stoffe.K2 · feld.K3#2): an der Mess-Wiese über das Wort bewölkt (Wind 0,3; die Bühne hält die Nässe
                        // trocken wie die W-Kette ihren Vorgänger) gezündet (der Weg des Brennglases), je Bild genau EIN Schritt. Je Sprung
                        // der Front (die Zelle, von der sie kam → der Punkt, an dem sie ankam, brennend oder unterwegs) sein Tempo und sein
                        // Winkel zum Kopf der Quelle: mit dem Wind der Median der Köpfe (je Gras-Quelle ihr schnellster Sprung, ±20° um den
                        // Kopf), gegen den Wind (±30°) der schnellste Sprung; derselbe Herd mit dem Wind aus (`_windAt` ohne m/s) ist die
                        // Mutante, an ihrem noch brennenden Herd glut und Licht. Danach das Wort Regen bis zum Erlöschen; gezählt je Schritt
                        // die Einheiten und die Zellen des Feuers (vor oder nach dem Schritt, die mehr sind: eine Zündung trägt ihre
                        // Ankünfte) und am Herd die Asche
                        const [B, am, n0] = [r.constructor.BRAND, () => r.auraAt(MESS.x, MESS.z), (st.worldMeta.taten ||= []).length];
                        wort("cloudy");
                        r._naesseTakt = () => (st.naesse = 0);
                        const glut0 = am().glut;
                        const lauf = async (n) => {
                            const [Z, H, bf] = [{ zellen: [], einheiten: [], start: !!r._brandEntfachen(MESS.x, MESS.z) }, new Map(), st.brandFeld];
                            S.frame();
                            for (let i = 0; i < n && bf.size; i++) {
                                const vor = bf.size;
                                st.spielZeit = r._brandUhr + B.schrittS;
                                takt();
                                Z.zellen.push(Math.max(vor, bf.size));
                                Z.einheiten.push(S.frame().brand);
                                for (const [k, c] of bf) {
                                    const q = bf.get(c.von);
                                    const [dx, dz] = q && q.t0 !== null ? [c.ex - q.ex, c.ez - q.ez] : [0, 0];
                                    const d = Math.hypot(dx, dz);
                                    if (d > 1) H.set(k, { q: c.von, v: d / (c.an - q.t0), c: (dx * q.kopf[0] + dz * q.kopf[1]) / d, gras: q.stoff === "gras" });
                                }
                                if (i % 20 === 0) await sleep(2);
                            }
                            const [kopf, alle] = [new Map(), [...H.values()]];
                            for (const h of alle) if (!(kopf.get(h.q)?.v >= h.v)) kopf.set(h.q, h);
                            const f = (a, i) => +(a.map((h) => h.v).sort((p, q) => p - q)[i(a.length)] || 0).toFixed(3);
                            const mit = [...kopf.values()].filter((h) => h.c >= 0.94 && h.gras);
                            return Object.assign(Z, { mit: f(mit, (k) => k >> 1), koepfe: mit.length, gegen: f(alle.filter((h) => h.c <= -0.87), (k) => k - 1), alle: f(alle, (k) => k - 1) });
                        };
                        const roh = r._windAt;
                        r._windAt = (...a) => Object.assign(roh.apply(r, a), { ms: 0 });
                        const ohneWind = (await lauf(60)).alle;
                        delete r._windAt;
                        const [glut, licht] = [+(am().glut - glut0).toFixed(3), r._leuchtQuellen(MESS.x, pm.y, MESS.z, 64).some((q) => q.quelle === "brand")];
                        st.brandFeld.clear();
                        st.worldMeta.taten.length = n0;
                        const lebVor = +am().lebendig.toFixed(3);
                        const Z = (W.brand = Object.assign(await lauf(300), { ohneWind, lebVor, glut, licht }));
                        delete r._naesseTakt;
                        r._naesseUhr = st.spielZeit;
                        wort("rainy");
                        for (Z.regenS = 0; Z.regenS < 600 && st.brandFeld.size; Z.regenS++) (st.spielZeit = r._brandUhr + B.schrittS), takt();
                        Object.assign(Z, { brennt: st.brandFeld.size, lebNach: +am().lebendig.toFixed(3), asche: st.worldMeta.taten.length - n0 });
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
                    let p = null;
                    const d = (q) => Math.hypot(q.x - MESS.x, q.z - MESS.z);
                    for (const rv of st.hydrosphere?.rivers || [])
                        for (const q of rv.points) if (!q.inLake && (!p || d(q) < d(p))) p = q;
                    const A = (W.wasser = { ort: p && [Math.round(p.x), Math.round(p.z)], takte: [], gehalten: [], bewegt: [] });
                    const aktiv = () => (st.waterCAActive ? st.waterCAActive.size : 0);
                    if (p) {
                        pm.set(p.x, r._voxelSurfaceY(p.x, p.z) + 1.8, p.z);
                        await window.__weltStehtNach(takt);
                        for (let i = 0; i < 900 && aktiv(); i++) takt();
                        const roh = r._tickWorldWaterCA;
                        let bewegt = 0;
                        r._tickWorldWaterCA = function () {
                            const m = roh.call(this);
                            bewegt = Math.max(bewegt, m);
                            return m;
                        };
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
                        delete r._tickWorldWaterCA;
                    }
                }
                // (K) DIE FÜHRUNG FERN (zuletzt — sie verschiebt die Uhr keiner Phase davor): ein Studio führt die Kamera (`kameraFuehren`, der Makro-Flug des Gelände-Studios; eine Sonde
                // wie werkbank bild) 1 km neben den Spieler — jenseits jedes Rings (12 × 43,2 m). Der Ring bleibt am Spieler; kein
                // Fege-Takt wartet auf Boden, den dort niemand baut: die Welt steht (fege-takt: bis dahin wartete die Nah-Wiese ewig)
                {
                    const p = st.playerMesh.position;
                    const [fx, fz] = [p.x + 1000, p.z + 300];
                    const fy = r._voxelSurfaceY(fx, fz) + 1.7;
                    await window.__weltStehtNach(takt);
                    const F = (aus.fuehrung = { x: Math.round(fx), z: Math.round(fz), abstand: Math.round(Math.hypot(1000, 300)) });
                    r.kameraFuehren((cam) => {
                        cam.position.set(fx, fy, fz);
                        cam.lookAt(fx + 15, fy + 6, fz + 6);
                    });
                    try {
                        F.takte = await window.__weltStehtNach(takt, 400);
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
        befund = { fehler: e?.message || String(e) };
    }
    await browser.close();
    server.close();
    if (!befund || befund.fehler) {
        console.log("❌ LAUF-FEHLER: " + (befund ? befund.fehler : "kein Befund"));
        process.exit(1);
    }
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
        const { asche, naehr, saemling, ...brand } = befund;
        console.log("BRAND " + JSON.stringify(Object.assign(brand, { asche: asche && { vor: asche.vor, asche: asche.asche, gras: asche.gras, mutante: asche.mutante } })));
        console.log("SUKZESSION " + JSON.stringify({ asche, naehr, saemling }));
        console.log(vb.length ? "❌ BRAND ROT — " + vb.join(" | ") : "✅ BRAND GRÜN — die Front hält an Wasser, Fels und nassem Gras, der Regen löscht, die Asche liegt im Boden-Stoff und grünt nach, Licht, Rauch und Knistern lesen den Brand");
        console.log(vs.length ? "❌ SUKZESSION ROT — " + vs.join(" | ") : "✅ SUKZESSION GRÜN — Asche → Gras → Busch, der Nährstoff geht mit der Ernte und kehrt mit Asche und Leichnam zurück");
        urteilEnde(vb.length + vs.length, "❌ BRAND · SUKZESSION ROT", "✅ BRAND · SUKZESSION GRÜN");
    }
    befund.pageErrors = befund.taktFehler || [];
    const namen = Object.keys(STAND.TAKTE);
    const zeile = (n, x) =>
        `  ${n.padEnd(8)} ${x.frames} Frames · Σ ${x.summe} Einheiten · ` +
        namen.map((k) => `${k} ${x.takte[k] ? x.takte[k].mittel : "?"}`).join(" · ") +
        (namen.some((k) => x.takte[k] && x.takte[k].wirkt > 0)
            ? " · wirkt " + namen.map((k) => `${k} ${x.takte[k].wirkt}`).join(" ")
            : "");
    console.log(
        `  Ring ${befund.ring} Chunks · ${befund.architekturen} Bauten · die Wache schlief nach ${befund.bisRuhe} Takten` +
            (befund.nachschub
                ? ` · Nachschub: die Schlange des Walds leer nach ${befund.nachschub.takte} Takten, ${befund.nachschub.warten.length} Streu-Regionen warten`
                : "") +
            (befund.fuehrung
                ? ` · Führung ${befund.fuehrung.abstand} m neben dem Spieler: die Welt ${befund.fuehrung.steht ? "steht" : "steht NICHT"} nach ${befund.fuehrung.takte} Takten`
                : "")
    );
    for (const n of ["ruhe", "bruch", "gehen"]) if (befund[n]) console.log(zeile(n, befund[n]));
    const rundeZeile = (wo, ph) =>
        ph &&
        console.log(
            `  Runde ${wo}: ${ph.frames} Frames · ` +
                namen.map((k) => `${k} ${ph.takte[k] ? ph.takte[k].gang + "/" + ph.takte[k].runde : "?"}`).join(" · ")
        );
    rundeZeile("Bruch", befund.bruch);
    const X = befund.taeter;
    if (X?.je) {
        for (const [n, x] of Object.entries(X.je))
            console.log(
                `  Täter ${n}: Stelle ${x.stelle} von ${x.runde} (zweite Hälfte ab ${Math.ceil(x.runde / 2)}) — gefunden ` +
                    `nach ${x.gefundenBei === null ? "NIE" : x.gefundenBei} gegangenen Einheiten`
            );
        rundeZeile("Täter", X.phase);
    }
    if (befund.gehen) console.log(`  Gehen: ${befund.gehen.weg} m`);
    const W = befund.wecken;
    if (W) {
        console.log(
            `  Wecken: Baum ${W.eintrag ? "steht" : "fehlt"} (Stufe ${W.stufe}, in Ruhe ${W.stufeRuhe}), schläft wieder nach ${W.bisRuhe} Takten`
        );
        if (W.treue) console.log(zeile("treue", W.treue));
        rundeZeile("Treue nach dem Bau", W.treue);
        if (W.phase) console.log(zeile("wecken", W.phase));
        if (W.nachher) console.log(zeile("nachher", W.nachher));
        if (W.regler) console.log(zeile("regler", W.regler));
        if (W.wahrnehmung) console.log(zeile("wahrn.", W.wahrnehmung));
    }
    // Stufe, Ort und Strom: je Befund EINE Zeile, wie die Seite sie maß
    for (const n of ["stufe", "ort", "strom"]) if (befund[n]) console.log(`  ${n}: ${JSON.stringify(befund[n])}`);
    if (befund.wache) console.log(`  Wache (Takt, geschlafen, Einheiten): ${JSON.stringify(befund.wache)}`);
    const simZeile = (ph) =>
        Object.entries(ph.sims)
            .map(([n, t]) => `${n} ${t.summe}${t.summe ? ` (${t.je.map((x) => x.join(" ")).join(", ")})` : ""}`)
            .join(" · ") + ` · Taten ${ph.akt}`;
    if (befund.simRuhe) console.log(`  Sim-Ruhe ${befund.simRuhe.spielS} s: ${simZeile(befund.simRuhe)}`);
    for (const [n, w] of Object.entries(befund.simWecken || {}))
        console.log(
            `  Sim-Wecken ${n}: ` +
                (n === "wasser"
                    ? JSON.stringify(w)
                    : n === "feld"
                      ? `${w.geschrieben} Zellen geschrieben, tote/Zellen nach den Wellen ${w.wellen.map((x) => x.tote + "/" + x.groesse).join(" · ")} — ${simZeile(w.welle)}`
                      : n === "brand"
                        ? JSON.stringify({ ...w, zellen: Math.max(0, ...w.zellen), einheiten: Math.max(0, ...w.einheiten.map((e, i) => +(e / w.zellen[i]).toFixed(1))), nachher: undefined }) +
                          ` — nachher ${simZeile(w.nachher)}`
                        : `wach ${simZeile(w.wach)} — nachher ${simZeile(w.nachher)}`)
        );
    console.log(`  Wach (ein kalter Bau): ${befund.wach} · Dorf ${JSON.stringify(befund.dorf)}`);
    if ("fixWach" in befund) console.log(`  Fixpunkt Gleite · Sprung 40 m · Weckruf 1 mm: ${befund.fixWach || "steht nicht"}`);
    for (const [i, F] of (befund.fix || []).entries())
        console.log(
            `  Fixpunkt ${i ? "L1→L2 zurück" : "L1→L2 × 0,8"}: ${F.fehler || `${F.wirkte} Wirkungen, die Welt steht nach ${F.takte} ` +
                `Takten, danach in ${F.nach.frames} Takten ${F.nach.summe} Einheiten`}`
        );
    const v = urteil(befund);
    wandEnde(
        v,
        "STAND-TAKT — im Stand geht kein Fege-Takt und keine langsame Simulation, die gebrochene Wache findet nichts Verschlafenes, ein Bau und jedes Sim-Ereignis wecken, Gehen und Strom arbeiten."
    );
})();
