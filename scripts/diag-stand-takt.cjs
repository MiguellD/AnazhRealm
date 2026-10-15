#!/usr/bin/env node
// ─────────────────────────────────────────────────────────────────────────
// diag-stand-takt.cjs — IM STAND KOSTET DIE WELT NICHTS (Welle K, Lehre 25, Gebot 7). Befund 07.10. (OMEN, GTX 1060,
// Mess-Wiese, Regler voll, der Spieler STEHT): `_loopVoxelStreaming` 3,27 ms je Frame, dazu `tickArchitectureCulling`,
// `_tickArchitectureLOD`, `_lodTreeVisHeight` und noise2D im Selbstzeit-Top — gezählt an der Radeon (eingeschwungen):
// je Frame ~6 060 Einheiten (Ring 83, Stufen-Wahl 1 710, Cull 3 512, Streu 480, Nah-Streu 138, Nah-Wiese 6, Saum 128) und
// 0 Änderungen. Die Wand fährt die Fege-Takte an der Mess-Wiese (Null-Renderer, der Fern-Ring über seinen Haken, die
// Foundry an — der Produktions-Pfad) und zählt mit der Stand-Linse (scripts/lib/stand-linse.cjs, dieselbe wie `werkbank
// stand`) je Frame die Blatt-Rufe jedes Fege-Takts:
//   (R) RUHE — die Welt steht (der Spieler, das Auge, keine Ankunft): 0 Einheiten in jedem Frame der Ruhe;
//   (S) SCHARF + TREUE — derselbe Stand mit gebrochener Wache (`_standRuht` schläft nie, jeder Takt geht wie vor der
//       Welle): jeder Takt arbeitet (die Linse sieht ihn), und KEINER ändert die Welt (die Wache verschlief nichts) — die
//       Phase läuft, bis JEDER Takt eine volle Runde ging (die Runde nennt er `_standRuht`; bis 07.10. 6 Frames: die Streu
//       ging 960 von 1 845 Zellen, der Saum 768 von 1 728 Punkten — für den Rest der Runde war die Treue blind), und die
//       Runde steht während der Phase (wächst sie, blieben Einheiten hinter dem Cursor ungesehen);
//   (X) TÄTER — je Takt, dessen Runde mehrere Gänge braucht (Stufen-Wahl, Streu, Saum), steht in der zweiten Hälfte seiner
//       Runde eine still verstellte Einheit: die Treue-Phase findet jede;
//   (W) WECKEN — ein Baum entsteht im Stand: Cull und Stufen-Wahl gehen, der Baum trägt danach seine Stufe, die Wache
//       schläft wieder (0 Einheiten); ein Regler-Schritt weckt den Cull, ein Wahrnehmungs-Schritt (LOD_DISTANCES, ohne
//       Weckruf geschrieben — der Stempel liest ihn selbst) die Stufen-Wahl und die Streu;
//   (G) GEHEN — W gehalten: Stufen-Wahlen, Cull und Nah-Streu arbeiten, der Spieler kommt voran — und Gehen kostet nur
//       die Änderung: in derselben Spieler-Zelle geht der Ring nicht, ohne neuen Anker des Fern-Rings der Saum nicht;
//   (T) STROM — nach der Ruhe ein Sprung an einen fremden Ort: der Spieler-Chunk steht (Streaming heilig, Lehre 13);
//   (C) CODE — jeder Fege-Takt fragt `_standRuht` und meldet `_standMeldet`; SCHREIBER — jeder Schreiber eines bewachten
//       Zustands (Chunk-Menge, Wasser-Zellen, Bau-Menge, Streu-Regionen und -Zellen, Ernte, Nah-Kacheln) ist auf JEDEM
//       PFAD von seinem Weckruf gedeckt (`schreiberWand`, der Stamm als AST); (P) kein Page-Error.
// SELBSTTEST (--selftest, ohne Browser, in `npm run check`): ein Befund mit jedem Täter — Arbeit in Ruhe, stumpfe Linse,
// ein verschlafener Wechsel, eine halbe oder wachsende Runde, ein ungesehener Täter, ein Bau, der nicht weckt, starres
// Gehen, verhungernder Strom, ein Takt ohne Wache, ein Schreiber ohne Weckruf, Page-Error — MUSS rot fallen und ihn beim
// Namen nennen; dazu die Schreiber-Wand am Stamm selbst (grün), mit einem eingeschmuggelten Schreiber (rot beim Namen),
// die MUTATIONS-PROBE (je einen Weckruf des Stamms streichen: jeder fällt rot) und jede Form eines Schreibers und jeder
// ungedeckte Pfad (rot) neben Anlage, Wecker-Ruf, gedecktem Helfer und Eigner-Takt (grün).
//   node scripts/diag-stand-takt.cjs [--selftest]   (npm run gate:stand-takt; Port STAND_TAKT_PORT)
// ─────────────────────────────────────────────────────────────────────────
"use strict";

const { statikServer, starteBrowser } = require("./lib/welt-boot.cjs");
const STAND = require("./lib/stand-linse.cjs");
const stammLib = require("./lib/stamm.cjs");

const urteil = (b) => STAND.standUrteil(b);

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
        schreiber: { befunde: [], schreiber: Object.fromEntries(Object.keys(STAND.BEWACHT).map((f) => [f, ["_x"]])) },
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
            amSpieler: { ort: [-841, -861], gelegt: true, dirty: 9, takte: 42, heil: true, sync: [] },
        },
        code: Object.fromEntries(namen.map((n) => [n, { fragt: true, meldet: true }])),
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
            "ein Takt fragt die Wache nicht",
            (b) => (b.code.streuLod.fragt = false),
            /CODE: _tickScatterLod fragt die Stand-Wache nicht/,
        ],
        [
            "ein Takt meldet seinen Gang nicht",
            (b) => (b.code.nahStreu.meldet = false),
            /CODE: _tickNahStreu meldet seinen Gang nicht/,
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
            "ein Schreiber ohne Weckruf",
            (b) =>
                b.schreiber.befunde.push({
                    methode: "_schmuggel",
                    feld: "architectures",
                    zeile: 7,
                    ruf: "_weltRegt()",
                }),
            /SCHREIBER: _schmuggel schreibt architectures \(Zeile 7\) ohne _weltRegt\(\)/,
        ],
        [
            "die Schreiber-Wand ist stumpf (ein Feld heißt anders)",
            (b) => (b.schreiber.schreiber.scatterRegions = []),
            /STUMPF: die Schreiber-Wand sieht keinen Schreiber von scatterRegions/,
        ],
        [
            "der Erdbau wirft das Dart-Gedächtnis der Welt (bis K69)",
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
            "jeder Abbau speichert die Welt synchron (bis K69)",
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
            "das Haus ohne Kamin baut seinen Kern nach (bis K69)",
            (b) => Object.assign(b.ort.kamin, { bau: 1, ms: 52.4 }),
            /ORT: das Haus ohne Kamin \(alemannisch\) baute seinen Kern 1× nach .*chimneyTipFromParams.*52\.4 ms/,
        ],
        [
            "die Ort-Phase setzt kein Haus ohne Kamin",
            (b) => (b.ort.kamin.gesetzt = false),
            /LEER: die Ort-Phase setzte kein Haus ohne Kamin/,
        ],
        [
            "der Satz-Block legt die Ecken eines Hauses frisch an (bis K69)",
            (b) => Object.assign(b.ort.satzHaus, { frischKB: 2048 }),
            /ORT: das Haus im Satz \(alemannisch, 26800 Ecken in 7 Gruppen\) legte beim Wieder-Eintritt 2\.0 MB frisch an .*_tickBauSatz › _bauSatzBlock › _satzBlock/,
        ],
        [
            "die Ort-Phase bringt kein Haus in den Bau-Satz",
            (b) => Object.assign(b.ort.satzHaus, { gruppen: 0, ecken: 0, bloecke: 0, takte: 600 }),
            /LEER: die Ort-Phase brachte kein Haus in den Bau-Satz \(alemannisch, 0 Gruppen, 0 Ecken nach 600 Takten\)/,
        ],
        [
            "der Baum in frischem Wald plant seine Zellen synchron (bis K69)",
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
            "der Neubau unter dem Spieler baut seinen Chunk synchron (bis K69-2)",
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
            /ORT: der Erdbau unter dem Spieler bei \(-841,-861\) baute 1 Chunk synchron im Haupt-Faden \(`_gameLoopTick › _tickDirtyVoxelChunks › _rebuildVoxelChunk › _acquireVoxelChunkBuild › _buildVoxelChunkData`, der längste 154\.6 ms\)/,
        ],
        [
            "der Boden unter dem Spieler heilt nicht (der Neubau verhungert)",
            (b) => Object.assign(b.ort.amSpieler, { heil: false, takte: 600 }),
            /ORT: der Erdbau unter dem Spieler bei \(-841,-861\) heilt nicht — nach 600 Takten warten noch Chunks/,
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
            "der Pflanz-Gang plant frische Zellen am Stück (bis K69)",
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
    ];
    for (const [name, tat, muss] of faelle) {
        const b = klon();
        tat(b);
        const v = urteil(b);
        const ok = v.some((x) => muss.test(x));
        if (!ok) fehler.push(`${name}: die Wand nennt den Täter nicht (${muss})`);
        console.log(`  ${ok ? "✅" : "❌"} Selbsttest „${name}" → rot: ${v.join(" · ") || "(nichts)"}`);
    }
    schreiberSelbsttest(fehler);
    if (fehler.length) {
        console.log("\n❌ SELBSTTEST ROT — die Wand ist vakuös: " + fehler.join(" · "));
        process.exit(1);
    }
    console.log("\n✅ SELBSTTEST GRÜN — jeder injizierte Täter fällt rot und wird beim Namen genannt.");
}

// DIE SCHREIBER-WAND am Stamm (acorn, ohne Browser — sie läuft in `npm run check`): der Stamm ist grün; ein eingeschmuggelter
// Schreiber ohne Weckruf fällt rot beim Namen; DIE MUTATIONS-PROBE streicht je einen Weckruf des Stamms — jeder fällt rot
// (ein grüner Weckruf ist überflüssig oder die Wand blind), die Weckrufe von `_finalizeVoxelChunkBuild` (Geschwister-Zweige)
// und `_scatterRegionWork` (der Hauptpfad von `_scatterRegion`) beim Namen; jede Form eines Schreibers und jeder ungedeckte
// Pfad wird gefunden; Anlage, Wecker-Ruf, gedeckter Helfer, Eigner-Takt und Leser bleiben grün.
function schreiberSelbsttest(fehler) {
    const path = require("path");
    const stamm = stammLib.text(path.join(__dirname, ".."));
    const wand = STAND.schreiberWand(stamm);
    const wv = STAND.schreiberUrteil(wand);
    const zahl = Object.entries(wand.schreiber)
        .map(([f, m]) => `${f} ${m.length}`)
        .join(" · ");
    console.log(
        `  ${wv.length ? "❌" : "✅"} Schreiber-Wand am Stamm (${zahl} Methoden, ${wand.weckrufe} Weckrufe) → ` +
            (wv.join(" · ") || "jeder Pfad weckt")
    );
    if (wv.length) fehler.push("der Stamm: " + wv.join(" · "));
    const anker = stammLib.kopf(stamm, "_bauRegt"); // am Namen (gate:apparat Klinge 3)
    if (anker < 0) fehler.push("der Schmuggel-Anker `_bauRegt` fehlt im Stamm");
    else {
        const schmuggel = "\n    _schmuggelSchreiber(e) {\n        this.state.architectures.push(e);\n    }\n";
        const s = STAND.schreiberWand(stamm.slice(0, anker) + schmuggel + stamm.slice(anker));
        const v = STAND.schreiberUrteil(s);
        const ok =
            v.length === 1 && /SCHREIBER: _schmuggelSchreiber schreibt architectures .* ohne _weltRegt\(\)/.test(v[0]);
        if (!ok) fehler.push("ein eingeschmuggelter Schreiber im Stamm fällt nicht rot beim Namen: " + v.join(" · "));
        console.log(`  ${ok ? "✅" : "❌"} Selbsttest „ein Schreiber ohne Weckruf im Stamm" → rot: ${v.join(" · ")}`);
    }
    // DIE MUTATIONS-PROBE: je einen Weckruf streichen
    const probe = STAND.weckProbe(stamm);
    const gruen = probe.filter((p) => !p.befunde.length);
    for (const p of gruen) fehler.push(`Weckruf ${p.methode} (Zeile ${p.zeile}) gestrichen → die Wand bleibt grün`);
    console.log(
        `  ${gruen.length ? "❌" : "✅"} Mutations-Probe: ${probe.length - gruen.length} von ${probe.length} Weckrufen ` +
            `fallen gestrichen rot` +
            (gruen.length ? " — grün: " + gruen.map((p) => `${p.methode}:${p.zeile}`).join(", ") : "")
    );
    const benannt = [
        ["_finalizeVoxelChunkBuild", "_finalizeVoxelChunkBuild", 2],
        ["_scatterRegionWork", "_scatterRegion", 1],
    ];
    for (const [wo, nennt, soll] of benannt) {
        const ps = probe.filter((p) => p.methode === wo);
        const ok = ps.length === soll && ps.every((p) => p.befunde.some((b) => b.methode === nennt));
        if (!ok)
            fehler.push(`der gestrichene Weckruf in ${wo} nennt ${nennt} nicht (${ps.length} von ${soll} Weckrufen)`);
        for (const p of ps)
            console.log(
                `  ${ok ? "✅" : "❌"} Selbsttest „Weckruf ${wo}:${p.zeile} gestrichen" → rot: ` +
                    p.befunde.map((b) => `${b.methode} schreibt ${b.feld}`).join(", ")
            );
    }
    const formen = [
        "class X {",
        // die Formen eines Schreibers
        "    _alias() { const arches = this.state.architectures; arches.splice(0, 1); }",
        '    _zerlegt() { const { voxelChunks: c } = this.state; c.delete("0,0"); }',
        "    _karte() { return this.state.scatterRegions; }",
        '    _ueberZugriff() { this._karte().set("1,1", {}); }',
        "    _index(e) { const st = this.state; st.architectures[3] = e; }",
        "    _laenge() { this.state.architectures.length = 0; }",
        "    _neu() { this.state.voxelChunks = new Map(); }",
        "    _bodenOhneTrue(k) { this.state.voxelChunks.set(k, {}); this._weltRegt(); }",
        "    _feld(k) { const e = this.state.voxelChunks.get(k); e.waterCells = null; }",
        "    _feldParam(e) { e.waterCells = null; }",
        "    _assignFeld(e, w) { Object.assign(e, { waterCells: w }); }",
        "    _dynamisch(n) { this.state[n] = []; }",
        "    _dynamischAlias(n) { const st = this.state; delete st[n]; }",
        "    _feldWeg(k) { for (const [, e] of this.state.voxelChunks) delete e.waterCells; }",
        "    _ernte() { const h = this.state.scatterHarvested || new Map(); h.clear(); }",
        "    _element(k, i) { this.state.scatterHarvested.get(k).add(i); }",
        "    get _getter() { return this.state.architectures; }",
        "    _ueberGetter(x) { this._getter.push(x); }",
        "    _merk() { this._halt = this.state.voxelChunks; }",
        "    _ueberFeld(k) { this._halt.set(k, {}); }",
        "    _assign(xs) { Object.assign(this.state.architectures, xs); }",
        "    _protoRuf(k) { Map.prototype.set.call(this.state.voxelChunks, k, {}); }",
        "    _reflect(k) { Reflect.apply(Map.prototype.set, this.state.voxelChunks, [k, {}]); }",
        "    _pushApply(xs) { Array.prototype.push.apply(this.state.architectures, xs); }",
        "    _hilfArg(a, x) { a.push(x); }",
        "    _ueberArg(x) { this._hilfArg(this.state.architectures, x); }",
        "    _forOf(k) { for (const m of [this.state.voxelChunks]) m.set(k, {}); }",
        "    _bedingt(x, c) { const a = c ? this.state.architectures : []; a.push(x); }",
        "    _zerlegtZuweisung(s) { ({ architectures: this.state.architectures } = s); }",
        "    _pfeil(x) { const g = () => this.state.architectures; g().push(x); }",
        "    _paramVorgabe(k, { voxelChunks } = this.state) { voxelChunks.set(k, {}); }",
        "    _optional(x) { this.state.architectures?.push(x); }",
        "    _anlageMitBedingung(r) { if (!this.state.voxelChunks || r) this.state.voxelChunks = new Map(); }",
        "    _filterNeu() { this.state.architectures = this.state.architectures.filter((a) => a); }",
        "    _kachelFremd(k) { this.state.nahWiese.kacheln.delete(k); }",
        "    _zustandFremd(k) { const ns = this.state.nahStreu; const x = ns.kacheln.get(k); x.zustand = null; }",
        "    _zelle(region, rec) { region.cells.push(rec); }",
        '    _fremd() { const snap = {}; snap.architectures = []; snap.voxel = new Map(); snap.voxel.set("a", 1); }',
        // die ungedeckten Pfade
        "    _fruehRaus(x, c) { this.state.architectures.push(x); if (c) return; this._weltRegt(); }",
        "    _geschwister(k, c) { if (c) { this.state.voxelChunks.set(k, 1); } else { this._weltRegt(true); } }",
        "    _bedingterWeckruf(k, c) { this.state.scatterRegions.delete(k); if (c) this._weltRegt(); }",
        "    _spaeter(x) { this._weltRegt(); setTimeout(() => this.state.architectures.push(x), 0); }",
        "    _dannRuf(k) { this._weltRegt(true); Promise.resolve().then(() => this.state.voxelChunks.set(k, {})); }",
        "    _schleifeRaus(xs) { for (const x of xs) { this.state.architectures.push(x); if (!x) break; this._weltRegt(); } }",
        "    _hilfUngedeckt(k) { this.state.scatterRegions.delete(k); }",
        "    _ungedeckterRufer(k) { this._hilfUngedeckt(k); }",
        // grün: Anlage, Wecker-Ruf, gedeckter Helfer, Eigner-Takt, Schleifen, Leser, fremde Kacheln und Wasser-Zellen
        "    _anlage() { if (!this.state.voxelChunks) this.state.voxelChunks = new Map(); }",
        "    _anlageOder() { this.state.scatterRegions = this.state.scatterRegions || new Map(); }",
        "    _weckt(e) { this.state.architectures.push(e); this._weltRegt(); }",
        "    _wecktBoden(k) { const m = this.state.voxelChunks; m.delete(k); this._weltRegt(true); }",
        "    _liest() { return this.state.architectures.filter((a) => a.x > 0).length; }",
        "    _wecker(n) { const a = n + 1; this._weltRegt(); return a; }",
        "    _ueberWecker(k) { this.state.scatterRegions.set(k, { cells: [] }); return this._wecker(1); }",
        "    _hilfGedeckt(k) { this.state.scatterRegions.delete(k); }",
        "    _gedeckterRufer(k) { this._weltRegt(); this._hilfGedeckt(k); }",
        '    _tickNahWiese() { this.state.nahWiese.kacheln.clear(); this._hilfEigner("a"); }',
        "    _hilfEigner(k) { this.state.nahWiese.kacheln.delete(k); }",
        "    _schleife(xs) { for (const x of xs) { if (!x) continue; this._weltRegt(); this.state.architectures.push(x); } }",
        "    _nachSchleife(xs) { for (const x of xs) this.state.architectures.push(x); this._weltRegt(); }",
        "    _hoehle(H) { const K = H.kacheln || (H.kacheln = new Map()); K.set(1, 2); }",
        "    _frisch(d) { return { waterCells: d.waterCells, lod: 0 }; }",
        "    _inhalt(k) { const e = this.state.voxelChunks.get(k); e.waterCells[0] = 1; e.waterCells.fill(0); }",
        '    _stateLiteral() { this.state["x"] = 1; }',
        "}",
        'X._statisch = function (st) { st.scatterRegions.delete("a"); };',
        "function _wurf(realm) { realm.worker.onmessage = (e) => { realm.state.voxelChunks.set(e.k, e); }; }",
        "if (typeof window !== 'undefined') window.realm.state.architectures.push({});",
    ].join("\n");
    const s = STAND.schreiberWand(formen);
    const rot = {
        _alias: "architectures",
        _zerlegt: "voxelChunks",
        _ueberZugriff: "scatterRegions",
        _index: "architectures",
        _laenge: "architectures",
        _neu: "voxelChunks",
        _bodenOhneTrue: "voxelChunks",
        _feld: "waterCells",
        _feldWeg: "waterCells",
        _feldParam: "waterCells",
        _assignFeld: "waterCells",
        _dynamisch: "state[…]",
        _dynamischAlias: "state[…]",
        _ernte: "scatterHarvested",
        _element: "scatterHarvested",
        _ueberGetter: "architectures",
        _ueberFeld: "voxelChunks",
        _assign: "architectures",
        _protoRuf: "voxelChunks",
        _reflect: "voxelChunks",
        _pushApply: "architectures",
        _ueberArg: "architectures",
        _forOf: "voxelChunks",
        _bedingt: "architectures",
        _zerlegtZuweisung: "architectures",
        _pfeil: "architectures",
        _paramVorgabe: "voxelChunks",
        _optional: "architectures",
        _anlageMitBedingung: "voxelChunks",
        _filterNeu: "architectures",
        _kachelFremd: "nahWiese.kacheln",
        _zustandFremd: "zustand",
        _zelle: "cells",
        // ein Objekt, das nur so heißt wie ein bewachter Zustand, ist ein Schreiber (die Wand liest Namen, keine Typen —
        // lieber ein benannter Fehlalarm als ein stiller Schreiber)
        _fremd: "architectures",
        _fruehRaus: "architectures",
        _geschwister: "voxelChunks",
        _bedingterWeckruf: "scatterRegions",
        _spaeter: "architectures",
        _dannRuf: "voxelChunks",
        _schleifeRaus: "architectures",
        _hilfUngedeckt: "scatterRegions",
        "X._statisch": "scatterRegions",
        _wurf: "voxelChunks",
        "(Modul)": "architectures",
    };
    const ungesehen = [];
    for (const [m, f] of Object.entries(rot))
        if (!s.befunde.some((b) => b.methode === m && b.feld === f)) ungesehen.push(`${m} (${f})`);
    for (const u of ungesehen) fehler.push(`Schreiber-Form ${u}: die Wand nennt sie nicht`);
    console.log(
        `  ${ungesehen.length ? "❌" : "✅"} Selbsttest Schreiber-Formen und ungedeckte Pfade: ` +
            `${Object.keys(rot).length - ungesehen.length} von ${Object.keys(rot).length} rot beim Namen` +
            (ungesehen.length ? " — UNGESEHEN: " + ungesehen.join(", ") : "")
    );
    const zuviel = s.befunde.filter((b) => !(b.methode in rot));
    if (zuviel.length)
        fehler.push("die Wand schlägt bei Unschuldigen an: " + zuviel.map((b) => `${b.methode}/${b.feld}`).join(", "));
    console.log(
        `  ${zuviel.length ? "❌" : "✅"} Selbsttest: Anlage, Wecker-Ruf, gedeckter Helfer, Eigner-Takt, Schleifen und ` +
            `Leser bleiben grün` +
            (zuviel.length ? " — " + zuviel.map((b) => `${b.methode}/${b.feld} (${b.weil})`).join(", ") : "")
    );
}

if (process.argv.includes("--selftest")) {
    console.log("=== STAND-TAKT — Selbsttest (ohne Browser) ===");
    selbsttest();
    process.exit(0);
}

const path = require("path");

const root = path.resolve(__dirname, "..");
const PORT = Number(process.env.STAND_TAKT_PORT) || 4528;
const { messort } = require("./lib/welt-orte.cjs");
const MESS = messort("wiese");
const server = statikServer();

(async () => {
    console.log("=== STAND-TAKT (Welle K) — Null-Renderer, Mess-Wiese, die Stand-Linse je Frame ===");
    await new Promise((r) => server.listen(PORT, "127.0.0.1", r));
    const browser = await starteBrowser({ art: "null", frist: 600000 });
    const page = await browser.newPage();
    page.setDefaultTimeout(580000);
    const pageErrors = [];
    page.on("pageerror", (e) => pageErrors.push((e.stack || e.message || String(e)).split("\n")[0]));
    await page.evaluateOnNewDocument(() => {
        window.__anazhHeadlessNullRenderer = true;
        window.__anazhFernRing = true; // der Fern-Ring (die Saum-Wache) läuft auch ohne GPU — sein Haken
        window.__anazhAutoSettlement = false; // kein Start-Dorf: was es baut, hinge an der Bildrate (die Mess-Bühne)
        window.__codeOf = (fnOrSrc) =>
            String(fnOrSrc)
                .replace(/\/\/.*$/gm, "")
                .replace(/\/\*[\s\S]*?\*\//g, "");
    });
    let befund = null;
    try {
        await page.goto(`http://127.0.0.1:${PORT}/index.html`, { waitUntil: "networkidle0", timeout: 120000 });
        await page.waitForFunction(() => window.anazhRealm && typeof window.anazhRealm._gameLoopTick === "function", {
            timeout: 120000,
        });
        await page.evaluate(STAND.STAND_INSTALL);
        befund = await page.evaluate(
            async (MESS, TAKTE) => {
                const r = window.anazhRealm,
                    st = r.state;
                const P = Object.getPrototypeOf(r);
                const pause = (ms) => new Promise((ok) => setTimeout(ok, ms || 0));
                let t = performance.now();
                const takt = () => {
                    t += 1000 / 60;
                    try {
                        r._gameLoopTick(t);
                    } catch (_e) {}
                };
                const foundryOffen = () => {
                    const f = r._foundry;
                    return (f && f.pending ? f.pending.size : 0) + (f && f.warte ? f.warte.length : 0);
                };
                // einschwingen: der Ring steht, kein Worker-Auftrag offen, die Foundry-Schlange leer
                const schwinge = async (max) => {
                    let stabil = 0,
                        last = -1;
                    for (let i = 0; i < (max || 6000); i++) {
                        takt();
                        const sz = st.voxelChunks ? st.voxelChunks.size : 0;
                        if (sz === last) stabil++;
                        else {
                            stabil = 0;
                            last = sz;
                        }
                        const offen = (st.voxelMeshPending && st.voxelMeshPending.size > 0) || foundryOffen() > 0;
                        if (i > 60 && stabil > 80 && !offen) break;
                        if (i % 5 === 0) await pause(10);
                    }
                    return last;
                };
                // Der Regler hält (die Mess-Bühne, wie `werkbank stand --regler voll`): headless folgt der Cull-Radius dem
                // PID Frame für Frame ohne die Grenzzyklus-Wand des Spiels (`_nexusPerfActuate`) — ein atmender Radius ist
                // eine echte Eingabe der Wache (er weckt sie, Phase W prüft es), aber kein Stand.
                st.perfRegulator = false;
                st.playerMesh.position.set(MESS.x, r._voxelSurfaceY(MESS.x, MESS.z) + 1.8, MESS.z);
                const ring = await schwinge();
                const aus = { ring, architekturen: (st.architectures || []).length, code: {} };
                const L = window.__standLinseAn();
                const summe = (f) => Object.keys(TAKTE).reduce((a, n) => a + (f[n] | 0), 0);
                // bis die Wache schläft (höchstens n Takte; ein Takt, der nie schläft, fällt in der Ruhe rot)
                const bisRuhe = async (n) => {
                    let still = 0,
                        i = 0;
                    L.frame();
                    for (; i < n && still < 30; i++) {
                        takt();
                        still = summe(L.frame()) === 0 ? still + 1 : 0;
                        if (i % 10 === 0) await pause(5);
                    }
                    return i;
                };
                const phase = async (n, schritt) => {
                    const fs = [];
                    L.frame();
                    for (let i = 0; i < n; i++) {
                        if (schritt) schritt(i);
                        takt();
                        fs.push(L.frame());
                        if (i % 10 === 0) await pause(5);
                    }
                    return window.__standPhase(fs);
                };
                aus.bisRuhe = await bisRuhe(900);
                // (R) RUHE
                aus.ruhe = await phase(30);
                // Die TREUE-PHASE: die Wache gebrochen (`_standRuht` schläft nie, jeder Takt geht wie vor der Welle), so lange,
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
                        const r = Math.max(1, a[1] | 0);
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
                            if (i % 10 === 0) await pause(5);
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
                            st.useOcclusionDemotion !== false && !(st.renderer && st.renderer._isHeadlessNull);
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
                    if (map && map.size && cur && r._scatterLayerByName) {
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
                    if (fr && fr.zoneVerts && fr.geos && fr.geos[0]) {
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
                // (G) GEHEN: W gehalten, zur Mitte der Spieler-Zelle — der Gang bleibt in seiner Zelle (K55-2: an der Mess-Wiese
                // −278/−1038 lag die Grenze 1,2 m voraus, der Gang trat hinüber, die Chunks wechselten ihre Stufe, und der Saum ging
                // zu Recht — die Linse prüfte nicht, was sie meint; verlässt er sie doch, ist die Phase LEER)
                {
                    // die Zelle, in der sich keine Stufe ändern kann (`_stufenZelle`, K51-3) — derselbe Stempel wie die Strom-Wache.
                    // Ihre Fächer sind je Achse 0,8–7,4 m breit (die Grenzen aus BODEN_STUFEN wie `_stufenZelle`), der Gang läuft
                    // ~6 m: er beginnt in der Ecke des breitesten Fachs seines Chunks und geht diagonal hindurch (~9 m frei). Der
                    // Gang zur Fach-Mitte trat an der Mess-Wiese −278/−1038 aus einem 2-m-Fach (CI 38584912499 voll 9).
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
                // (U) STUFE (K51-5): aus der Ruhe tauscht ein ferner Chunk seine Stufe hin und zurück, wie der Streaming-Takt
                // (`_rebuildVoxelChunk(cx, cz, lod)`, hier synchron) — gezählt je Takt die Einheiten und die Rufe des Walds
                {
                    // DIE RUHE VOR DEM WECHSEL: offener Wuchs ist keine Ruhe. Nach dem Gehen liegen Chunks neu im `foliageRadius`,
                    // deren Vegetation wartet (`pendingFoliageChunks`, der Wuchs-Takt je Wanduhr gedrosselt); füllt sie der Wuchs
                    // oder der Neubau des Ziels (`_populateVoxelChunkVegetation` → `_weltRegt()`) mitten in der Phase, regt sich
                    // die Menge — nicht die Stufe (CI 38609556864: archLod · archCull · streuLod wach, die Boden-Takte nicht).
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
                        if (studio % 5 === 0) await pause(10);
                    }
                    await bisRuhe(900);
                    const ankunft0 = F ? F.ankunft | 0 : 0;
                    const pm = st.playerMesh.position;
                    let ziel = null;
                    const formWartet = (k) =>
                        (st.grassDirtyChunks && st.grassDirtyChunks.has(k)) ||
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
                            populiert: !!(
                                st.voxelPopulatedChunks && st.voxelPopulatedChunks.has(ziel.cx + "," + ziel.cz)
                            ),
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
                // (O) ORT (K69): aus der Ruhe legt ein Ort abseits seinen Erdbau (eine Platte 12 × 12 m, 96 m vor dem Spieler — wie
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
                            O.chunks[n] = { fern: ks.length, gehalten: ks.filter((k) => c && c.has(k)).length };
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
                            if (i % 10 === 0) await pause(5);
                        }
                        O.plan = pfc;
                        O.maxTaktMs = +max.toFixed(1);
                        // DIE RÄUMUNG DES ORTS: ein Dorf räumt beim Nähern die Natur auf seinem Grund (`_naturRaeumen` →
                        // `removeArchitecture`) — gezählt die synchronen Saves der ganzen Welt, die fünf Abbauten tragen
                        const natur = (st.architectures || [])
                            .filter((e) => e && e.position && r._istNatur(e))
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
                    // DAS HAUS OHNE KAMIN (K69): ein Slot des Dorfs, dessen Export „kein Kamin" sagt (`chimney: null`), steht über
                    // die EINE Slot-Quelle (`_spawnSettlementSlot`) — gezählt, wie oft der Wirt das ganze Haus im Kern baut, um
                    // die Spitze zu finden (`chimneyTipFromParams` → `massBau`), und wie lange
                    {
                        const fc = globalThis.__fachwerkCore;
                        const recs = (r._foundry && r._foundry.recipes) || {};
                        const kultur = Object.keys(recs).find((k) => {
                            const pol = r.constructor.KIND_POLICY[recs[k] && recs[k].kind];
                            return pol && pol.prefix === "haus_" && st.blueprints["haus_" + k];
                        });
                        const kx = ox - 40;
                        const kz = oz + 40;
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
                                const slot = { kultur, x: 0, z: 0, y: ky, phi: 0, seed: 4711, chimney: null };
                                const e = r._spawnSettlementSlot(slot, { x: kx, z: kz }, r._foundry);
                                gesetzt = !!e;
                                if (e) r.removeArchitecture(e);
                            }
                        } finally {
                            fc.chimneyTipFromParams = tipRoh;
                        }
                        O.kamin = { kultur: kultur || null, gesetzt, bau: n, ms: +ms.toFixed(1) };
                    }
                    // DER BAUM IN FRISCHEM WALD (K69): ein Hof-Baum des Dorfs (`_naturSetzen`, wie die Ausstattung
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
                                if (memo && memo.has(Math.floor(wx / C) + "," + Math.floor(wz / C))) continue;
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
                                let takte = 0;
                                let maxN = 0;
                                let maxMs = 0;
                                n = 0;
                                while (!Number.isInteger(g) && takte < 600) {
                                    const n0 = n;
                                    const m0 = ms;
                                    takt();
                                    takte++;
                                    if (ms - m0 > maxMs) maxMs = ms - m0;
                                    maxN = Math.max(maxN, n - n0);
                                    g = r._foundryGestaltFor(e, preset);
                                    if (takte % 20 === 0) await pause(5);
                                }
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
                    // DAS HAUS IM SATZ (K69): ein Dorf-Haus tritt in den Bau-Satz seiner Stoffe (`_tickBauSatz › _bauSatzBlock ›
                    // _satzBlock`), dann ein zweites Mal, jede Gruppe markiert wie bei jedem Stufen-Wechsel — gezählt die Bytes,
                    // die der Block dabei FRISCH anlegt. Bis K69 legte jeder Eintritt seine Ecken neu im Heap an (ein Haus der
                    // Stufe 0: 142k Ecken, ~10 MB), die volle Sammlung fiel in den Takt (Null-Gang ins Dorf: 137 ms)
                    {
                        const recs = (r._foundry && r._foundry.recipes) || {};
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
                                    .filter((g) => g && g.satz && (g.liveCount | 0) > 0);
                            const drin = () => {
                                const gs = gruppen();
                                return (
                                    gs.length > 0 &&
                                    gs.every((g) => {
                                        const s = st.chunkSaetze && st.chunkSaetze.get(g.satz);
                                        return (
                                            s &&
                                            s.bloecke.has(g.key) &&
                                            !(st.bauSatzSchmutzig && st.bauSatzSchmutzig.has(g.key))
                                        );
                                    })
                                );
                            };
                            let takte = 0;
                            while (!drin() && takte < 600) {
                                takt();
                                takte++;
                                if (takte % 20 === 0) await pause(5);
                            }
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
                                    for (const g of gs) r._bauSatzMarke(g.key, g.satz);
                                    r._tickBauSatz();
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
                    // DER ERDBAU UNTER DEM SPIELER (K69-2): ein Ort legt seine Platte, wo der Spieler steht (wie der Dorf-Zug
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
                            for (; A.takte < 600; A.takte++) {
                                imTakt = true;
                                try {
                                    takt();
                                } finally {
                                    imTakt = false;
                                }
                                if (!st.dirtyVoxelChunks || st.dirtyVoxelChunks.size === 0) {
                                    A.heil = true;
                                    break;
                                }
                                if (A.takte % 5 === 0) await pause(10);
                            }
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
                    // DER WALD AM FREMDEN ORT (K69): jede frische Wald-Zelle (`planForestCell`) plant die Schlange des Walds
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
                        for (; n < 600; n++) {
                            jetztTakt = 0;
                            takt();
                            W.maxTakt = Math.max(W.maxTakt, jetztTakt);
                            if (st.voxelChunks && st.voxelChunks.has(key)) break;
                            if (n % 5 === 0) await pause(10);
                        }
                        // der Chunk steht — sein Wald und der seiner Nachbarn kommt in den Takten danach
                        for (; nach < 240; nach++) {
                            jetztTakt = 0;
                            takt();
                            W.maxTakt = Math.max(W.maxTakt, jetztTakt);
                            if (nach % 10 === 0) await pause(5);
                        }
                    } finally {
                        core.planForestCell = roh;
                        if (jobEigen) r._tickWaldPlan = jobRoh;
                        else delete r._tickWaldPlan;
                    }
                    W.ms = +W.ms.toFixed(1);
                    aus.strom = {
                        x,
                        z,
                        takte: n,
                        spielerChunk: !!(st.voxelChunks && st.voxelChunks.has(key)),
                        wald: W,
                    };
                }
                L.aus();
                const code = (f) => (typeof f === "function" ? window.__codeOf(f) : "");
                for (const [n, m] of Object.entries(TAKTE)) {
                    const c = code(P[m]);
                    aus.code[n] = {
                        fragt: c.includes(`this._standRuht("${n}"`),
                        meldet: c.includes(`this._standMeldet("${n}"`),
                    };
                }
                aus.wache =
                    st && r._standWache ? [...r._standWache.takte].map(([n, x]) => [n, x.ruht, x.arbeit]) : null;
                return aus;
            },
            MESS,
            STAND.TAKTE
        );
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
    befund.schreiber = STAND.schreiberWand(stammLib.text(root));
    const namen = Object.keys(STAND.TAKTE);
    const zeile = (n, x) =>
        `  ${n.padEnd(8)} ${x.frames} Frames · Σ ${x.summe} Einheiten · ` +
        namen.map((k) => `${k} ${x.takte[k] ? x.takte[k].mittel : "?"}`).join(" · ") +
        (namen.some((k) => x.takte[k] && x.takte[k].wirkt > 0)
            ? " · wirkt " + namen.map((k) => `${k} ${x.takte[k].wirkt}`).join(" ")
            : "");
    console.log(
        `  Ring ${befund.ring} Chunks · ${befund.architekturen} Bauten · die Wache schlief nach ${befund.bisRuhe} Takten`
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
    if (X && X.je) {
        for (const [n, x] of Object.entries(X.je))
            console.log(
                `  Täter ${n}: Stelle ${x.stelle} von ${x.runde} (zweite Hälfte ab ${Math.ceil(x.runde / 2)}) — gefunden ` +
                    `nach ${x.gefundenBei === null ? "NIE" : x.gefundenBei} gegangenen Einheiten`
            );
        rundeZeile("Täter", X.phase);
    }
    const S = befund.schreiber;
    console.log(
        `  Schreiber-Wand: ${Object.entries(S.schreiber)
            .map(([f, m]) => `${f} ${m.length}`)
            .join(" · ")} Methoden, ${S.befunde.length} ohne Weckruf`
    );
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
    if (befund.stufe)
        console.log(
            `  Stufe: ${befund.stufe.wechsel} Wechsel ohne Form-Änderung an ${JSON.stringify(befund.stufe.ziel)} (offener Wuchs vor der Ruhe: ${befund.stufe.wuchs} Chunks, Studio ruhte nach ${befund.stufe.studio} Takten, Ankünfte in der Phase ${befund.stufe.ankunft}) — Regung ${JSON.stringify(befund.stufe.regung)} — Einheiten ${JSON.stringify(befund.stufe.takte)} · Rufe ${JSON.stringify(befund.stufe.rufe)}`
        );
    const O = befund.ort;
    if (O)
        console.log(
            `  Ort: Erdbau bei (${O.ort}) ${O.gelegt ? "gelegt" : "NICHT gelegt"} in ${O.setzMs} ms — Stand des Walds ` +
                `${O.standVor} → ${O.standNach}, ferne Wald-Zellen (über ${O.fern} m) ${O.darts ? O.darts.gehalten + "/" + O.darts.fern : "?"} ` +
                `gehalten, Chunk-Gedächtnisse ${Object.entries(O.chunks || {})
                    .map(([n, c]) => `${n} ${c.gehalten}/${c.fern}`)
                    .join(
                        " · "
                    )}, ferner Chunk ${O.stand ? O.stand.key : "?"} ${O.stand && O.stand.gleich ? "hält seinen Stand" : "SPRINGT"} — ` +
                `die ${O.takte} Takte danach planten ${O.plan} Wald-Zellen, der längste ${O.maxTaktMs} ms — die Räumung: ` +
                (O.raeumung
                    ? `${O.raeumung.abbau} Abbauten, ${O.raeumung.saves} synchrone Saves (Σ ${O.raeumung.saveMs} ms)`
                    : "?") +
                (O.kamin
                    ? ` — das Haus ohne Kamin (${O.kamin.kultur}) ${O.kamin.gesetzt ? "gesetzt" : "NICHT gesetzt"}, ` +
                      `${O.kamin.bau} Kern-Nachbauten (${O.kamin.ms} ms)`
                    : "") +
                (O.wald && O.wald.gesetzt
                    ? ` — der Baum in frischem Wald bei (${O.wald.ort}): ${O.wald.synchron} Zellen synchron ` +
                      `(${O.wald.ms} ms), Gestalt ${O.wald.gestalt} nach ${O.wald.takte} Takten, ${O.wald.imTakt} Zellen im ` +
                      `Takt (der längste ${O.wald.maxTaktMs} ms, ${O.wald.maxTaktZellen} Zellen)`
                    : "") +
                (O.satzHaus && O.satzHaus.gesetzt
                    ? ` — das Haus im Satz (${O.satzHaus.kultur}): ${O.satzHaus.gruppen} Gruppen, ${O.satzHaus.ecken} Ecken ` +
                      `nach ${O.satzHaus.takte} Takten, Wieder-Eintritt ${O.satzHaus.bloecke} Blöcke, ${O.satzHaus.frischKB} KB frisch`
                    : "") +
                (O.amSpieler && O.amSpieler.gelegt
                    ? ` — der Erdbau unter dem Spieler bei (${O.amSpieler.ort}): ${O.amSpieler.dirty} Chunks zum Neubau, ` +
                      `${O.amSpieler.heil ? "heil" : "NICHT heil"} nach ${O.amSpieler.takte} Takten, synchron im Takt ` +
                      `${O.amSpieler.sync.length} Chunks (${O.amSpieler.sync.map((s) => s.ms + " ms").join(", ") || "keiner"})`
                    : "")
        );
    if (befund.strom)
        console.log(
            `  Strom: Sprung an (${befund.strom.x}, ${befund.strom.z}) — Spieler-Chunk ${befund.strom.spielerChunk ? "steht" : "FEHLT"} nach ${befund.strom.takte} Takten` +
                (befund.strom.wald
                    ? ` — frische Wald-Zellen: ${befund.strom.wald.imJob} in der Schlange des Walds, ` +
                      `${befund.strom.wald.aussen} am Stück (${befund.strom.wald.ms} ms, bis ${befund.strom.wald.maxTakt} je Takt` +
                      `${befund.strom.wald.taeter ? ", " + befund.strom.wald.taeter : ""})`
                    : "")
        );
    if (befund.wache) console.log(`  Wache (Takt, geschlafen, Einheiten): ${JSON.stringify(befund.wache)}`);
    const v = urteil(befund);
    if (v.length) {
        console.log("\n❌ STAND-TAKT ROT:\n  " + v.join("\n  "));
        process.exit(1);
    }
    console.log(
        "\n✅ STAND-TAKT GRÜN — im Stand geht kein Fege-Takt, die gebrochene Wache findet nichts Verschlafenes, ein Bau weckt, Gehen und Strom arbeiten."
    );
})();
