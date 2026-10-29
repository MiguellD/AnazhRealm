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
            ["ruhe.takte.archCull", { summe: 105360, mittel: 3512, max: 3512, mitArbeit: 30 }],
            /RUHE: .*archCull.*tickArchitectureCulling.*105360.*30.*30/,
        ],
        [
            "ein Ausreißer der Saum-Wache in Ruhe",
            ["ruhe.takte.deckWache", { summe: 128, mittel: 4.27, max: 128, mitArbeit: 1 }],
            /RUHE: .*deckWache.*128.*30/,
        ],
        [
            "stumpfe Linse (die Nah-Wiese zählt nichts)",
            ["bruch.takte.nahWiese", { summe: 0, mittel: 0, max: 0, mitArbeit: 0 }],
            /STUMPF: .* für nahWiese keine Arbeit/,
        ],
        [
            "die Wache verschlief einen Wechsel",
            ["bruch.takte.archLod.wirkt=", 3],
            /TREUE: .*archLod.*_tickArchitectureLOD/,
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
            "ein Regler-Schritt weckt den Cull nicht",
            ["wecken.regler.takte.archCull", { summe: 0, mitArbeit: 0 }],
            /WECKEN: ein Regler-Schritt \(der Cull-Radius\) weckt archCull nicht/,
        ],
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
            /TREUE-LÜCKE: .*streuLod.*_tickScatterLod.*960.*1845/,
        ],
        [
            "die Treue nach dem Bau geht 6 Frames (der Saum 768 von 1 728 Punkten)",
            ["wecken.treue.takte.deckWache", { gang: 768 }],
            /TREUE-LÜCKE: .*deckWache.*_fernRingDeckWache.*768.*1728/,
        ],
        [
            "die Treue nach dem Bau nennt die Runde nicht",
            ["wecken.treue.takte.archLod.runde"],
            /LEER: die Treue-Phase nach dem Bau nennt die Runde von archLod nicht/,
        ],
        [
            "der Täter der Streu in der zweiten Rundenhälfte bleibt ungesehen (6 Frames)",
            ["taeter.phase.takte.streuLod", { wirkt: 0, gang: 960 }],
            /TREUE-TÄTER: .*streuLod.*_tickScatterLod.*1734.*1845/,
        ],
        [
            "der Täter des Saums bleibt ungesehen",
            ["taeter.phase.takte.deckWache.wirkt=", 0],
            /TREUE-TÄTER: .*deckWache.*_fernRingDeckWache.*1727.*1728/,
        ],
        [
            "der Täter steht in der ersten Rundenhälfte",
            ["taeter.je.streuLod.stelle=", 400],
            /LEER: .*streuLod.*400.*1845/,
        ],
        [
            "die Stufen-Wahl trägt keinen Täter (ihre Runde braucht mehrere Gänge)",
            ["taeter.je.archLod"],
            /LEER: .*archLod.*_tickArchitectureLOD/,
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
            /TREUE-LÜCKE: .*archLod.*_tickArchitectureLOD/,
        ],
        [
            "ein Wahrnehmungs-Schritt weckt die Streu nicht (der Stempel liest die LOD-Distanzen nicht)",
            ["wecken.wahrnehmung.takte.streuLod", { summe: 0, mitArbeit: 0 }],
            /WECKEN: .*LOD_DISTANCES.*streuLod/,
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
            /ORT: .*2579.*planForestCell.*880/,
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
            /ORT: .*chimneyTipFromParams.*52\.4/,
        ],
        [
            "die Ort-Phase setzt kein Solo-Haus",
            ["ort.kamin.gesetzt=", false],
            /LEER: die Ort-Phase setzte kein Solo-Haus/,
        ],
        [
            "der Satz-Block legt die Ecken eines Hauses frisch an",
            ["ort.satzHaus", { frischKB: 2048 }],
            /ORT: .*2\.0.*MB.*_tickBauSatz.*_bauSatzBlock.*_satzBlock/,
        ],
        [
            "die Ort-Phase bringt kein Haus in den Bau-Satz",
            ["ort.satzHaus", { gruppen: 0, ecken: 0, bloecke: 0, takte: 600 }],
            /LEER: die Ort-Phase brachte kein Haus in den Bau-Satz \(alemannisch, 0 Gruppen, 0 Ecken nach 600 Takten\)/,
        ],
        [
            "der Baum in frischem Wald plant seine Zellen synchron",
            ["ort.wald", { synchron: 169, ms: 271.4, takte: 0, imTakt: 0, maxTaktZellen: 0 }],
            /ORT: .*169.*_ortGestaltSame.*planForestCell.*271\.4/,
        ],
        [
            "die Gestalt des Baums in frischem Wald steht nie",
            ["ort.wald", { gestalt: null, takte: 600 }],
            /ORT: die Gestalt des Baums in frischem Wald steht nach 600 Takten nicht/,
        ],
        [
            "die Schlange des Walds plant am Stück",
            ["ort.wald", { maxTaktMs: 271.4, maxTaktZellen: 169 }],
            /ORT: .*EINEM.*271\.4/,
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
            /ORT: .*_gameLoopTick.*_tickDirtyVoxelChunks.*_rebuildVoxelChunk.*_acquireVoxelChunkBuild.*_buildVoxelChunkData.*154\.6/,
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
            (b) =>
                Object.assign(b.strom.wald, {
                    aussen: 96,
                    ms: 131.2,
                    maxTakt: 41,
                    taeter: "_forestDartSteht › _forestPlantChunk › _populateVoxelChunkVegetation › _finalizeVoxelChunkBuild",
                }),
            /STROM: .*96.*_forestDartSteht.*_forestPlantChunk.*131\.2.*41.*EINEM/,
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
            (b) =>
                Object.assign(b.fuehrung, { steht: false, takte: 400, grund: "Fege-Takt nahWiese wartet, nahStreu wartet" }),
            /FÜHRUNG: .*1044.*400.*nahWiese/,
        ],
        ["keine Führungs-Phase", ["fuehrung"], /LEER: keine Führungs-Phase/],
        ["das Dorf fliegt (die Basis)", ["dorf.placed"], /DORF: die Welt stand nach 41 Takten mit dem Dorf im Flug/],
        ["ein wartender Fege-Takt hält die Welt nicht wach", ["wach=", "steht nach 31 Takten"], /WACH: ein Fege-Takt mit Offenem hält die Welt nicht wach/],
        ["die Welt steht, während die Bake-Uhr abweist (die Basis)", ["schuld", { grund: "Welt-Regung", takte: 1, rest: 8 }], /BAKE-SCHULD: steht nach 1 Takten mit 8 offenen Fits \(40 abgewiesen, Welt-Regung\)/],
        [
            "die Welt steht mitten in der Runde der Stufen-Wahl",
            ["fix.1", { takte: 1, nach: { frames: 150, summe: 2048, takte: { archLod: { summe: 2048, mitArbeit: 8, wirkt: 4 } } } }],
            /FIXPUNKT: .*archLod.*_tickArchitectureLOD.*2048/,
        ],
        ["der Regler-Schritt wirkt nicht", (b) => b.fix.forEach((f) => (f.wirkte = 0)), /LEER: der Regler-Schritt wirkte nicht/],
        ["keine Fixpunkt-Phase", ["fix"], /LEER: keine Fixpunkt-Phase/],
        [
            "der Wuchs prüft in Ruhe je Frame die wartenden Chunks (die Basis)",
            ["simRuhe.sims.wuchs=", simPh(9, 3600).sims.wuchs],
            /RUHE-SIM: .*_tickFoliageGrowth.*32400.*3600.*3600/,
        ],
        [
            "ein Takt, der in Ruhe einmal zählt (der Nachwuchs über die Wanduhr)",
            ["simRuhe.sims.nachwuchs", { summe: 1, mitArbeit: 1 }],
            /RUHE-SIM: .*_tickScatterRegrow.*3600/,
        ],
        ["die Sim-Ruhe geht 20 s", ["simRuhe.spielS=", 20], /LEER: die Sim-Ruhe ging 20 s/],
        ["vor der Sim-Ruhe keine Ernte", ["simRuhe.vorher.ernte=", null], /LEER: vor der Sim-Ruhe fehlt die Tat/],
        ["keine Sim-Ruhe", ["simRuhe"], /LEER: keine Sim-Ruhe/],
        [
            "nach dem Saison-Wort malt die Jahres-Uhr weiter (die Basis)",
            ["simWecken.saison.nachher=", simPh(3, 60)],
            /WECKEN-SIM: .*180.*_x/,
        ],
        ["das Wort Regen weckt den Regen nicht", ["simWecken.regen.wach=", simPh(0, 5)], /STUMPF: das Wort Regen weckt regen/],
        ["kein Chunk wartet auf seinen Wuchs", ["simWecken.wuchs.offen=", 0], /LEER: keine Weck-Probe für wuchs/],
        ["die Ernte wächst nicht nach", ["simWecken.nachwuchs.nachgewachsen=", false], /NACHWUCHS: die Ernte wuchs/],
        [
            "der Blick des Spielers je Bild (die Basis)",
            ["simRuhe", { akt: 46802, aktJe: [["auraAt", 3600]] }],
            /RUHE-TAT: .*46802.*auraAt/,
        ],
        [
            "die Räumung wartet auf die Schwelle (die Basis)",
            ["simWecken.feld.wellen.1", { groesse: 1110, tote: 537 }],
            /FELD-TOTE: nach den Wellen trägt die Karte 0 von 540 · 537 von 1110/,
        ],
        [
            "die Räumung geht jede Zelle durch (die Basis)",
            ["simWecken.feld.welle", { akt: 1680, aktAlle: { "·lifeField": 1670 } }],
            /FELD-BESUCH: .*1680.*2160.*lifeField/,
        ],
        ["kein Brand fängt (die Basis: kein Takt im Stamm)", ["simWecken.brand.start=", false], /LEER: an der Mess-Wiese fing kein Brand/],
        ["der Brand ohne Takt", (b) => b.simWecken.brand.einheiten.fill(0), /STUMPF: der Brand brennt, die Sim-Linse sieht keinen Takt/],
        ["der Brand fegt die Welt", ["simWecken.brand.einheiten.3=", 4000], /BRAND-ZELLEN: Schritt 4 kostete 4000 Einheiten bei 3 brennenden/],
        ["der Brand erlischt im Regen nicht", ["simWecken.brand.brennt=", 7], /BRAND-ERLISCHT: im Regen brennen noch 7/],
        ["die Front kriecht mit dem Wind", ["simWecken.brand.mit=", 0.3], /FRONT-MIT: .* 0.3 m\/s/],
        ["die Front läuft gegen den Wind", ["simWecken.brand.gegen=", 0.3], /FRONT-GEGEN: .* 0.3 m\/s/],
        ["ohne Wind läuft die Front", ["simWecken.brand.ohneWind=", 0.9], /BRAND-BLIND: .* 0.9 m\/s/],
        ["der Brand hinterlässt keine Asche", ["simWecken.brand.lebNach=", 0.62], /BRAND-ASCHE: 4 Aschen, lebendig am Herd 0.62 → 0.62/],
        ["der Brand leuchtet nicht", ["simWecken.brand.licht=", false], /BRAND-LESER: glut am Herd \+1, Leuchtquelle fehlt/],
        ["der Brand schläft nicht", ["simWecken.brand.nachher=", simPh(2, 60, "brand")], /BRAND-RUHE: .* 120 Einheiten/],
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
        ["die Ankunft gleitet, die Welt steht (die Basis)", ["fixWach=", "Gleite"], /stehend — Gleite/],
        ["die Sonde ohne Bestand", ["sonde.vor=", "Rinde baum_tanne"], /SONDE: .* trifft Rinde/],
    ];
    // ein Täter als Tafel [Pfad, Wert]: „Pfad=" setzt den Wert, sonst mischt er sich in den Pfad; ohne Wert fällt der Pfad
    const tat = (t) =>
        typeof t === "function"
            ? t
            : (b) => {
                  const p = t[0].replace(/=$/, "").split(".");
                  const [o, k] = [p.slice(0, -1).reduce((x, q) => x[q], b), p.at(-1)];
                  if (t.length < 2) delete o[k];
                  else if (t[0].endsWith("=")) o[k] = t[1];
                  else Object.assign(o[k], ...t.slice(1));
              };
    taeterFaelle(faelle.map(([n, t, m]) => [n, tat(t), m]), urteil, { fehler, klon });
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

// DIE SEITE DER TAT UND DES BRANDS (`window.__seite()`, wenn die Welt mit der Foundry steht): der Takt des Spiels zu 1/60 s ohne
// Regler, der Boden, das Stehen an einem Ort und je Pflanze der Nah-Streu, die die Ernte nimmt, `f({ senke, key, id }, it)`
async function seite() {
    await window.__weltDa((x) => x.state.playerMesh && x._foundry && x._foundry.ready);
    const pm = st.playerMesh.position;
    let t = performance.now();
    const takt = () => r._gameLoopTick((t += 1000 / 60));
    st.perfRegulator = false;
    const y = (x, z) => r._voxelSurfaceY(x, z);
    const stehen = (p) => (pm.set(p.x, y(p.x, p.z) + 1.8, p.z), window.__weltStehtNach(takt));
    const pflanzen = (f, ns = st.nahStreu) => {
        for (const [senke, a] of ns ? ns.senken : [])
            for (const [key, b] of a.ernte && a.preset !== "stumpf" ? a.bloecke : [])
                for (const it of (ns.kacheln.get(key) || { items: [] }).items) if (b.ids.includes(it.id)) f({ senke, key, id: it.id }, it);
    };
    return { pm, takt, y, stehen, pflanzen };
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
        const kand = [];
        pflanzen(({ key: k }, it) => P(it.x - mitte.x, it.z - mitte.z) < 12 && kand.push({ id: k + "#" + it.id, k, it }));
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
    await page.evaluate(`window.__seite = ${seite};`);
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
//   und der Leser (Licht, Glut am Ohr) je Bild; SCHIRM das Bild des Brands (`_brandBild`, Flammen und Fahne) je Bild ≤ 1 ms.
// je Probe [Name, gilt, Befund]: die Zeilen, die nicht gelten, beim Namen samt ihrem Befund
const rot = (T) => T.filter((t) => !t[1]).map(([n, , x]) => n + ": " + JSON.stringify(x));
function brandUrteil(b) {
    if (!b || !b.halt || !b.regen || !b.asche || !b.asche.asche || !b.zeit || !b.kante) return ["LEER: " + JSON.stringify(b && Object.keys(b))];
    const [h, m, f, rg, rm, l, lm, a, z, k, km] = [b.halt, b.haltM, b.fels, b.regen, b.regenM, b.leser, b.leserM, b.asche, b.zeit, b.kante, b.kanteM];
    return rot([
        ["HALT", h.brannte >= 2 && h.nass >= 1, h],
        ["HALT-BRUCH", h.wasserGebrannt === 0 && h.nassGebrannt === 0, h],
        ["MUTANTE-HALT", m && m.nassGebrannt >= 1 && m.nass === 0, m],
        ["FLUSS", m && m.wasser + h.wasser >= 1 && m.wasserGebrannt === 0, m],
        ["FELS", f && f.erreicht && f.gehalten, f],
        ["REGEN", rg.brannte >= 1 && rg.s <= 60, rg],
        ["MUTANTE-REGEN", rm && rm.s > 60, rm],
        ["LESER", l && l.licht >= 1 && l.rauch >= 1 && l.flammen >= 1 && l.lang >= 0.3 && l.lang <= 8 && l.glutD <= 16 && l.glutF >= 64, l],
        ["MUTANTE-LESER", lm && lm.licht === 0 && lm.rauch === 0 && lm.flammen === 0 && lm.glutF < 64, lm],
        ["DECKUNG", l && l.deckung >= 0.9, l],
        ["MUTANTE-DECKUNG", b.leserD && b.leserD.deckung < 0.6, b.leserD],
        ["KANTE", k.n >= 40 && k.achse <= 0.4 && k.linie >= 0.8, k],
        ["MUTANTE-KANTE", km && km.achse >= 0.7 && km.linie < 0.5, km],
        ["ASCHE", a.asche.a >= 0.99, a.asche],
        ["GRÜNT", a.gras && a.gras.a === 0, a.gras],
        ["MUTANTE-ASCHE", a.mutante.halme >= 0.8 * a.vor.halme, a.mutante],
        ["ZEIT", z.brennend >= 2000 && z.bildMs <= 0.5 && z.verzugS <= 2, z],
        ["SCHIRM", z.schirmMs <= 1, z],
    ]);
}

// Die Folge (stoffe.K5#2): auf der vollen Asche (mindestens 40 % der Zelle) kein Halm und kein Kraut, nach der Stufe Gras die
// Halme (≥ 80 %) vor den Kräutern (≤ 30 %), nach der Stufe Busch die Kräuter (≥ 80 %); die Ernte nimmt Nährstoff und Wuchs, Asche
// und Leichnam geben ihn zurück, die Mutante lässt den Wuchs gleich. Der SÄMLING: am Stubben erst kein Baum, dann der Jungwuchs
// älter je Stufe in seiner Größe (Skala = Alter), nach der Heilung der gewachsene; seine Gestalt trägt weniger Ordnungen und
// Glieder (die Mutante ohne `alter` dieselben). Der WALD: der Brand nimmt jeden Baum seiner Narbe (≥ 3), der Wald kehrt als
// Jungwuchs (≥ 60 %) und nach der Heilung gewachsen (≥ 90 %) zurück.
function sukzessionUrteil(s) {
    const [a, n, S, W] = [s && s.asche, s && s.naehr, s && s.saemling, s && s.wald];
    if (!a || !a.asche || !n || !S || !W || !(a.vor.halme >= 20) || !(a.vor.kraut >= 3)) return ["LEER: " + JSON.stringify(a && a.vor)];
    const [v, g, e, J] = [a.vor, a.gras, n.ernte, S.stufen || []];
    const jung = J.slice(1, -1);
    return rot([
        ["ASCHE", a.asche.voll >= 0.4 && a.asche.halmeVoll <= 0.05 * v.halme * a.asche.voll && a.asche.krautVoll === 0, a.asche],
        ["GRAS", g && g.halme >= 0.8 * v.halme && g.kraut <= 0.3 * v.kraut, g],
        ["BUSCH", a.busch && a.busch.kraut >= 0.8 * v.kraut, a.busch],
        ["ERNTE", e.n >= 3 && e.N < e.N0 - 0.04 && e.W < e.W0, e],
        ["RÜCKGABE", n.asche >= 1.2 && n.leichnam >= 1.1, n],
        ["MUTANTE-NÄHRSTOFF", n.mutante.W === n.mutante.W0, n.mutante],
        [
            "SÄMLING",
            J.length === 5 && J[0].alter === 0 && jung.every((q, i) => q.alter > 0 && q.alter < 1 && Math.abs(q.skala - q.alter) < 0.01 && (!i || q.alter >= jung[i - 1].alter)) && jung.at(-1).alter > jung[0].alter && J[4].alter === 1 && J[4].skala === 1,
            J,
        ],
        ["GESTALT", S.gestalt && S.gestalt[0][0] < S.gestalt[1][0] && S.gestalt[0][1] < S.gestalt[1][1], S.gestalt],
        ["MUTANTE-GESTALT", S.mutante && S.mutante[0][1] === S.mutante[1][1], S.mutante],
        ["WALD", W.vor >= 3 && W.brand === 0 && W.jung >= 0.6 * W.vor && W.heil >= 0.9 * W.vor, W],
    ]);
}

async function brandSeite(MESS) {
    const { pm, takt, y, stehen, pflanzen } = await window.__seite();
    const [C, P, L] = [r.constructor, Object.getPrototypeOf(r), (st.worldMeta.taten ||= [])];
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
    const zaehle = (g = [...halt.values()]) => {
        const A = asche().map((a) => zelle(a.x, a.z));
        return {
            brannte: A.length,
            wasser: g.filter((v) => v === "wasser").length,
            nass: g.filter((v) => v === "nass").length,
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
        const [NW, NS] = [C.NAH_WIESE, C.NAH_STREU];
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
            je(NW.kachel, (tx, tz) => zaehl(r._nahWieseKachelBueschel(tx, tz) || [], "halme"));
            const arten = r._nahStreuArten();
            je(NS.kachel, (tx, tz) => zaehl(((r._nahStreuKachel(tx, tz, arten) || {}).items || []).filter((it) => arten[it.art].ernte === "kraut"), "kraut"));
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
            if (j > k && (!herd || j - k > herd.abstand)) herd = { c: xz(strahl[j].cx, strahl[j].cz), abstand: j - k };
        }
        if (!herd) return { fehler: "kein Strahl Fluss → nasses Bett → trockenes Bett (Herd mit Boden-Feuchte ≤ 0,05) binnen 320 m um die Mess-Wiese" };
        // die Uhr ist Spieler-Wort: der Brand läuft mittags (die Zünd-Wärme liest die Luft des Temperatur-Felds — bis w3v-brand-bild
        // lief die Uhr, so weit das Booten brauchte, und derselbe Herd trug 0 bis 95 Aschen)
        const lauf = () => (r.setTimeOfDay(0.5, "regler"), r._brandEntfachen(...herd.c), brennen(3600));
        aus.halt = Object.assign({ herd: herd.c.map(Math.round) }, (lauf(), zaehle()));
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
        // REGEN und LESER am Herd der Mess-Wiese: Licht, Ohr und das Bild (15 s zu 0,1 s, `_brandBild`: die Fahne steht) — die Flammen der Front,
        // die Fahne und ihre DECKUNG: der dichteste Strahl quer zum Wind durch ihre Ballen 8 m über den Flammen, 1 − Π(1 − Deckung)
        const leser = () => {
            st.brandRauch.teilchen.length = 0;
            for (let i = 0; i < 150; i++) r._brandBild(0.1);
            const [g, T, F, w] = [r._glutAmOhr(pm.x, pm.z, () => 0), st.brandRauch.teilchen, r._brandFlammen, r._windAt(pm.x, pm.z, st.spielZeit)];
            const h = F.reduce((u, f) => u + f.y / F.length, 0) + 8;
            const band = T.filter((p) => Math.abs(p.y - h) < p.s);
            const durch = (c) => band.reduce((d, p) => (Math.hypot((p.x - c.x) * w.x + (p.z - c.z) * w.z, p.y - h) < p.s ? d * (1 - p.a) : d), 1);
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
            leer(), trocken(), wort("cloudy");
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
            for (R.s = 0; R.s < 300 && bf().size; R.s++) (st.spielZeit = r._brandUhr + B.schrittS), takt();
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
        // die Welt-Stunde bis `h` (die Uhr in Schritten ≤ 4 h, je Schritt ein Takt: der Nachwuchs wacht), dann steht die Welt
        const reif = async (h) => {
            for (let n = 0; n < 400 && r._weltStunde() < h; n++)
                r.setTimeOfDay((st.timeOfDay + Math.min(4, h - r._weltStunde() + 1e-3) / 24) % 1, "regler"), takt();
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
        // Austrieb des Stubbens kein Baum, dann sein Jungwuchs (`studioOv.alter` in `alter` × seiner Größe), Stufe um Stufe
        // älter, nach der Heilung der gewachsene; die Gestalt der Jugend liest der gefühlte Baum (das Skelett der Prägung,
        // `skelettDerGestalt`: weniger Ordnungen und Glieder als der gewachsene), die Mutante (treeParams ohne `alter`) wächst ihn
        // als den alten. DER WALD NACH DEM BRAND: der nächste Baum zündet; die Bäume, die danach in der Narbe stünden (Narbe ≥ ½),
        // nimmt der Brand, mit dem Wald der Sukzession kehrt ihr Jungwuchs zurück, nach der letzten Heilung der gewachsene.
        leer(), trocken(), wort("cloudy");
        r._vegSpawnImmediate = true;
        const dart = (p, W = C.FOREST.cell) => r._forestCellDarts(Math.floor(p.x / W), Math.floor(p.z / W), r._forestSeedInt()).some((q) => Math.hypot(q.x - p.x, q.z - p.z) < 0.05);
        const baeume = () => st.architectures.filter((e) => e && e.position && /^baum_/.test(e._lodSpecies || "") && dart(e.position));
        const am = (p) => baeume().find((e) => Math.hypot(e.position.x - p.x, e.position.z - p.z) < 0.05);
        const alter = (p) => ((e) => (e ? (e.studioOv && e.studioOv.alter) || 1 : 0))(am(p));
        const naechster = () => baeume().sort((u, v) => d(u.position) - d(v.position))[0];
        const gestalt = (e, pr = r._foundryPresetForEntry(e), g = r._foundryGestaltFor(e, pr) ?? 1) =>
            [e.studioOv, null].map((ov) => ((k) => [k.P.maxDepth, k.nodes.segs.length])(globalThis.__terrainCore.skelettDerGestalt(pr, g, 0, r._foundryGestaltOv(pr, g, ov))));
        const S = (aus.saemling = { stufen: [] });
        const B0 = naechster();
        if (B0) {
            const [p, s0] = [{ x: B0.position.x, z: B0.position.z }, B0.scale];
            r.harvestArchitecture(B0, "welt");
            const a = L.find((q) => q.tat === "faellen" && Math.hypot(q.x - p.x, q.z - p.z) < 0.05);
            const h = (s) => a.h + s * r._tatIndex().dauer.get(a);
            for (const s of [0.1, 0.35, 0.6, 0.85, 1.02]) {
                await reif(s > 1 ? h(1) + 0.1 : h(s));
                const e = am(p);
                S.stufen.push({ alter: alter(p), skala: e ? r3(e.scale / s0) : 0 });
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
            const orte = baeume().filter((e) => Math.hypot(e.position.x - B1.position.x, e.position.z - B1.position.z) < 96).map((e) => ({ x: e.position.x, z: e.position.z }));
            r._brandEntfachen(B1.position.x, B1.position.z);
            brennen(900), await stehen(MESS);
            const N = orte.filter((o) => ((n) => n && n.m >= 0.5)(r._brandNarbe(o.x, o.z)));
            const T = r._tatIndex();
            const zaehl = (f) => N.filter((o) => f(alter(o))).length;
            Object.assign(W, { vor: N.length, brand: zaehl((v) => v > 0) });
            // der Jungwuchs je Baum, solange seine Zelle im Wald der Sukzession steht: gesehen an sechs Stunden (die Zellen heilen
            // nach ihrem Wuchs verschieden schnell)
            const [Q, jung] = [asche().map((q) => q.h + 0.8 * T.dauer.get(q)).sort((u, v) => u - v), new Set()];
            for (let k = 0; k < 6; k++) {
                await reif(Q[Math.floor(((Q.length - 1) * k) / 5)]);
                N.forEach((o, i) => ((v) => v > 0 && v < 1 && jung.add(i))(alter(o)));
            }
            W.jung = jung.size;
            await reif(Math.max(...asche().map((q) => q.h + T.dauer.get(q))) + 0.1);
            W.heil = zaehl((v) => v === 1);
        }
        r._vegSpawnImmediate = false;
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
        // 1 200 Bilder zu 1/60 s (20 s Spielzeit): je Bild der Takt (`_tickBrand`, seine geteilte Arbeit) und die Leser (Licht,
        // Ohr), dann der SCHIRM (`_brandBild`: Flammen und Fahne im Deckel des Bilds); der Verzug ist die Spielzeit, um die der
        // angefangene Schritt hinter der Uhr liegt
        const [ms, lms, sms] = [[], [], []];
        let verzug = 0;
        for (let i = 0; i < 1200; i++) {
            st.spielZeit += 1 / 60;
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
        const p95 = (v) => r3(v.sort((p, q) => p - q)[Math.floor(v.length * 0.95)]);
        aus.zeit = { brennend: zn, echt: echt.length, bildMs: p95(ms), leserMs: p95(lms), verzugS: r3(verzug), schirmMs: p95(sms) };
        leer();
        return aus;
    } finally {
        for (const k of ["_brandZuenden", "_naesseTakt", "_feuchteAt", "_brandFeuchte", "_ascheAt", "_naehrstoffAt", "_brandRauch", "_brandNarbeFn"]) delete r[k];
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
                    leser: { licht: 1, rauch: 1, flammen: 40, lang: 2.4, deckung: 0.97, glutD: 0, glutF: 256 },
                    leserM: { licht: 0, rauch: 0, flammen: 0, glutF: 0 },
                    leserD: { deckung: 0.3 },
                    kante: { n: 300, achse: 0.2, linie: 3.1 },
                    kanteM: { n: 280, achse: 0.95, linie: 0.3 },
                    asche: { vor: { halme: 40 }, asche: { a: 1 }, gras: { a: 0 }, mutante: { halme: 40 } },
                    zeit: { brennend: 2000, bildMs: 0.3, verzugS: 1.1, schirmMs: 0.6 },
                },
                [["HALT", "halt.nass", 0], ["HALT-BRUCH", "halt.nassGebrannt", 1], ["MUTANTE-HALT", "haltM.nassGebrannt", 0], ["FLUSS", "halt.wasser", 0, "haltM.wasser", 0], ["FELS", "fels.gehalten", false], ["REGEN", "regen.s", 196], ["MUTANTE-REGEN", "regenM.s", 20], ["LESER", "leser.rauch", 0], ["LESER", "leser.flammen", 0], ["MUTANTE-LESER", "leserM.licht", 1], ["DECKUNG", "leser.deckung", 0.5], ["MUTANTE-DECKUNG", "leserD.deckung", 0.95], ["KANTE", "kante.achse", 0.9], ["KANTE", "kante.linie", 0.4], ["MUTANTE-KANTE", "kanteM.achse", 0.2], ["ASCHE", "asche.asche.a", 0.9], ["GRÜNT", "asche.gras.a", 0.5], ["MUTANTE-ASCHE", "asche.mutante.halme", 20], ["ZEIT", "zeit.bildMs", 2], ["ZEIT", "zeit.verzugS", 9], ["SCHIRM", "zeit.schirmMs", 4]]
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
        await page.evaluate(STAND.STAND_INSTALL + require("./lib/kamera-nah.cjs").KAMERA_NAH_INSTALL + `window.__seite = ${seite};`);
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
                const aus = {};
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
                // EINE Hülle um die Methode `k` an `o` (unter ihrem Namen, der Stapel nennt sie): `um(ruf, a)` statt ihres Rufs,
                // `ruf()` ruft sie; `ab()` stellt sie her (eine eigene zurück, sonst fällt sie auf den Prototyp). `gemessen` zählt
                // ihre Rufe (`n`) und ihre Zeit (`ms`), `rufer` nennt die Stamm-Glieder des Stapels.
                const huelle = (o, k, um) => {
                    const [eigen, roh] = [Object.hasOwn(o, k), o[k]];
                    o[k] = { [k](...a) { return um(() => roh.apply(this, a), a); } }[k]; // prettier-ignore
                    return () => (eigen ? (o[k] = roh) : delete o[k]);
                };
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
                    const ab = huelle(P, "_standRuht", (ruf, a) => {
                        const r = a[1] | 0;
                        if (runden[a[0]] !== undefined && runden[a[0]] !== r && !(a[0] in rundeVon))
                            rundeVon[a[0]] = runden[a[0]];
                        runden[a[0]] = r;
                        ruf();
                        return false;
                    });
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
                        ab();
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
                    // die Kultur eines Hauses der Foundry (das Solo-Haus und das Haus im Satz)
                    const recs = r._foundry?.recipes || {};
                    const kultur = Object.keys(recs).find((k) => {
                        const pol = r.constructor.KIND_POLICY[recs[k] && recs[k].kind];
                        return pol && pol.prefix === "haus_" && st.blueprints["haus_" + k];
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
                        (await window.__seite()).pflanzen((q) => vorher.ernte || (r._harvestScatterPick(q) && (vorher.ernte = q)));
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
        const { asche, naehr, saemling, wald, ...brand } = befund;
        console.log("BRAND " + JSON.stringify(Object.assign(brand, { asche: asche && { vor: asche.vor, asche: asche.asche, gras: asche.gras, mutante: asche.mutante } })));
        console.log("SUKZESSION " + JSON.stringify({ asche, naehr, saemling, wald }));
        console.log(vb.length ? "❌ BRAND ROT — " + vb.join(" | ") : "✅ BRAND GRÜN — die Front hält an Wasser, Fels und nassem Gras, der Regen löscht, die Asche liegt im Boden-Stoff und grünt nach, Licht, Rauch und Knistern lesen den Brand");
        console.log(vs.length ? "❌ SUKZESSION ROT — " + vs.join(" | ") : "✅ SUKZESSION GRÜN — Asche → Gras → Busch, der Nährstoff geht mit der Ernte und kehrt mit Asche und Leichnam zurück");
        urteilEnde(vb.length + vs.length, "❌ BRAND · SUKZESSION ROT", "✅ BRAND · SUKZESSION GRÜN");
    }
    befund.pageErrors = befund.taktFehler || [];
    // je Befund EINE Zeile, wie die Seite ihn maß: jede Phase der Linse in Frames, Σ und je Takt Mittel, Gang/Runde und Wirkung;
    // die Sims in ihrer Zeile (Sim-Ruhe, Sim-Wecken — die Stationen feld.K3 und stoffe.K2 lesen sie)
    const namen = Object.keys(STAND.TAKTE);
    const phase = (_, x) =>
        x && x.takte && x.frames
            ? `${x.frames} Frames · Σ ${x.summe} · ` + namen.map((n) => ((t = {}) => `${n} ${t.mittel ?? "?"}${t.runde ? ` ${t.gang}/${t.runde}` : ""}${t.wirkt ? ` wirkt ${t.wirkt}` : ""}`)(x.takte[n])).join(" · ")
            : x;
    const { simRuhe, simWecken, ...rest } = befund;
    for (const [n, x] of Object.entries(rest)) console.log(`  ${n}: ${JSON.stringify(x, phase)}`);
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
                        ? JSON.stringify({ ...w, zellen: Math.max(0, ...w.zellen), einheiten: Math.max(0, ...w.einheiten.map((e, i) => +(e / w.zellen[i]).toFixed(1))), nachher: undefined }) +
                          ` — nachher ${simZeile(w.nachher)}`
                        : `wach ${simZeile(w.wach)} — nachher ${simZeile(w.nachher)}`)
        );
    const v = urteil(befund);
    wandEnde(
        v,
        "STAND-TAKT — im Stand geht kein Fege-Takt und keine langsame Simulation, die gebrochene Wache findet nichts Verschlafenes, ein Bau und jedes Sim-Ereignis wecken, Gehen und Strom arbeiten."
    );
})();
