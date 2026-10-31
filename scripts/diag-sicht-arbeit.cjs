#!/usr/bin/env node
// ─────────────────────────────────────────────────────────────────────────
// diag-sicht-arbeit.cjs — DIE SICHT KOSTET, WAS SICH ÄNDERT (Lehre 25). Die Wand fährt die
// Sicht-Kette an der Mess-Wiese (Null-Renderer; das Hauptbild über `_passSicht`, zwei Stellvertreter-Kaskaden über den
// EINEN Chokepoint `_chunkSatzPass` samt Instanz-Wahl, wie gate:chunk-satz) und zählt mit der Sicht-Linse
// (scripts/lib/sicht-linse.cjs, dieselbe wie `werkbank sicht`) je Frame die Arbeit:
//   (R) RUHE — Kamera, Kaskaden und Welt stehen (nachdem jede Mündung im Bild ihre Horizont-Sperre trägt): ab dem
//       zweiten Frame 0 Prüfungen (`_passTrifft` der Sätze · der Höhlen · der Instanz-Wahl · der Nah-Wiese, `_hoehlenRect`,
//       `_hoehlenLichtLage`, `_instanzBehalten`), 0 Aufrufe von `_hoehlenSicht` / `_hoehlenSichtLicht` /
//       `_chunkSatzAbschnitt`, 0 Index-Bytes, kein Abschnitt neu gelegt — und die Pässe treffen ihren Cache;
//   (B) BEWEGUNG — Drehen (36 × 1°) und Gehen (20 × 1 m): jede neue Lage rechnet neu (eine gehaltene Wahl wäre ein Loch);
//   (T) TREUE — die gehaltene Wahl ist die frisch gerechnete: nach der Ruhe vergisst die Kette jede Lage, ein Frame
//       rechnet alles neu — je Satz × Pass dieselben Zellen in derselben Folge, je Gruppe der Wahl dieselbe Zahl;
//   (S) SCHARF — ein eingeschmuggelter Cache-Bruch (die Lage-Erinnerung fällt je Pass) arbeitet in Ruhe und fällt rot;
//       ein eingeschmuggelter Lege-Bruch (jeder ruhende Abschnitt legt sich je Pass dicht neu, ohne dass eine Wahl es
//       schuldet) zählt als Neulegen OHNE Änderung und steht als `dicht:ohne` beim Namen (die Linse trennt die Arbeit einer
//       Änderung — Licht, Kamera über den Halt, Satz-Inhalt — und ihre geschuldete Folge von der ohne Grund; sie zählt den Gang);
//       ein eingeschmuggelter Stand-Bruch (jeder Satz zählt je Frame seinen Stand, kein Bereich, kein Anker, keine Hülle
//       ändert sich — der Cache-Schlüssel churnt) zählt als Arbeit OHNE Änderung und steht als `stand:ohne` beim Namen;
//       in der eingefrorenen Welt fällt jede Inhalts-Änderung in Ruhe rot;
//   (L) RUHE MIT LAUFENDER SONNE (der Tag steht im Spiel nie): die Tageszeit läuft mit der Tageslänge des Spiels
//       (60 Frames je s), das Licht folgt `_applyDayNightToScene`, die Stellvertreter-Kaskaden stehen entlang des Lichts
//       (dreht es, drehen sie): das Licht hat eine Stufe und dreht nur an ihr, die Kette arbeitet nur, wo eine Stufe fiel
//       (die Stellvertreter tragen keine Box — den Licht-Rand der echten Kaskaden, über den ihre Wahl die Stufen hält, prüft
//       gate:schatten-werfer K8, im echten Loop `werkbank sicht --sonne`);
//   (A) DAS ATMENDE AUGE: die Kamera und mit ihr das Auge jeder Maske (`uLodAuge`) atmen ±1 mm quer, unter dem Halt — die
//       Kette arbeitet nicht, und die Linse nennt es weder Kamera noch Blende; die
//       BLENDE-TREUE: eine Instanz auf der Kante ihres Fensters, der Anker 3 mm jenseits, das Auge 9,5 mm herüber — die Lage
//       hält, und die gehaltene Wahl trägt sie (der Halt als Rand des Fensters); ohne den Rand fehlt sie (scharf);
//   (C) EIN Gesetz der Lage: die Nah-Wiese prüft ihre Kacheln nur bei neuer Generation (`L.gen`, am Ruf von `_passTrifft`);
//       die eigene Kamera-Signatur der Nah-Wiese ist gefallen (gate:altlasten); (P) kein Page-Error — der EINE Sammler (welt-boot) macht den Lauf ROT mit Namen.
// SELBSTTEST (--selftest, ohne Browser, in `npm run check`): ein Befund mit jedem Täter — Arbeit in Ruhe, Bytes in Ruhe,
// kein Treffer, starres Drehen, untreue Wahl, stumpfe Linse, fehlender Leser — MUSS rot fallen und ihn beim
// Namen nennen.
//   node scripts/diag-sicht-arbeit.cjs [--selftest]   (npm run gate:sicht-arbeit)
// ─────────────────────────────────────────────────────────────────────────
"use strict";

const { statikServer, warteAufWelt, taeterFaelle, selbsttestEnde, nullSeite, wandEnde } = require("./lib/welt-boot.cjs");
const SICHT = require("./lib/sicht-linse.cjs");

function urteil(b) {
    // die Wand friert die Welt ein: in KEINEM Ruhe-Frame Arbeit oder ein Byte
    const v = SICHT.sichtUrteil(Object.assign({ streng: true }, b));
    if (!b.sonne) v.push("LEER: keine Phase mit laufender Sonne (kein Richtlicht?) — (L) prüfte nichts");
    if (!b.legeBruch) v.push("LEER: kein Lege-Bruch gemessen — (S) prüfte das Neulegen ohne Änderung nicht");
    if (!b.standBruch) v.push("LEER: kein Stand-Bruch gemessen — (S) prüfte die Satz-Arbeit ohne Ursache nicht");
    // (A) das atmende Auge (die Phase urteilt `sichtUrteil`) und die Blende-Treue an der Kante eines Fensters
    if (!b.augeAn) v.push("LEER: die Maske ist aus (uLodMaskOn) — (A) prüfte das Auge der Blende nicht");
    else if (!b.auge) v.push("LEER: keine Phase mit atmendem Auge gemessen — (A) prüfte nichts");
    const BT = b.blendeTreue;
    if (b.augeAn) {
        if (!BT || !BT.fall)
            v.push("LEER: Blende-Treue ohne Instanz an der Kante eines Fensters — (A) prüfte die gehaltene Wahl nicht");
        else if (!BT.gehalten)
            v.push(
                `BLENDE-TREUE VAKUÖS: die Lage hielt das Auge der Maske über 9,5 mm nicht (unter dem halben Halt) — ${BT.fall}`
            );
        else if (!BT.traegt)
            v.push(`BLENDE-TREUE VAKUÖS: die Maske behält die Instanz an der Kante nicht — ${BT.fall}`);
        else if (BT.loecher > 0)
            v.push(
                `BLENDE-TREUE: ${BT.loecher} Löcher — das Auge der Maske wanderte unter dem Halt, die gehaltene Wahl zeichnet ` +
                    `nicht, was die Maske vom Auge dieses Frames behält: ${BT.namen.join(", ")} (Kante: ${BT.fall})`
            );
        const BO = b.blendeTreueOhneRand;
        if (BT?.fall && BT.gehalten && !(BO && BO.loecher > 0))
            v.push(
                "LINSE STUMPF: ohne den Halt als Rand des Fensters fehlt der gehaltenen Wahl nichts " +
                    `(${BO ? BO.loecher : "?"} Löcher) — die Blende-Treue prüft die Kante nicht`
            );
    }
    const I = b.instanzTreue;
    if (!I || !(I.faelle && I.faelle.length >= 2))
        v.push(
            `LEER: Instanz-Treue ohne beide Fälle (${I?.faelle ? I.faelle.join(", ") : "keine Messung"})` +
                (I?.leichen && I.leichen.length
                    ? ` — ohne Prüfung: ${I.leichen.join(" · ")} (eine leere Gruppe zeichnet in keinem Pass)`
                    : "") +
                " — (I) prüfte nicht alles"
        );
    else if (I.wuerfe > 0 || I.nan > 0 || I.tot > 0 || I.fehlen > 0)
        v.push(
            `INSTANZ: nach einem fremden Schreiber (${I.faelle.join(", ")}) ${I.wuerfe} Würfe, ${I.nan} NaN-Slots, ` +
                `${I.tot} tote Marken, ${I.fehlen} fehlende Werfer — eine Kaskade hielt ihre Wahl: ${I.namen.join(" · ")}`
        );
    else if (!(I.geprueft > 0)) v.push("LEER: Instanz-Treue ohne Werfer im Gesetz");
    const D = b.drehTreue;
    if (!D) v.push("LEER: keine Dreh-Treue gemessen — (D) prüfte nichts");
    else if (!D.gehalten)
        v.push(
            `DREH-TREUE VAKUÖS: die Lage hielt die Drehfolge nicht (Grenze ${D.grenze} rad) — der Fall trat nie ein`
        );
    else if (!(D.geprueft > 0)) v.push("LEER: Dreh-Treue ohne Zelle oder Instanz im Frustum");
    else if (D.loecher > 0)
        v.push(
            `DREH-TREUE: ${D.loecher} Löcher — nach einer Neu-Wahl mitten in der gehaltenen Drehung (Grenze ${D.grenze} rad) ` +
                `zeichnet die gehaltene Wahl nicht, was das echte Frustum trifft: ${D.namen.join(", ")}`
        );
    const c = b.code || {};
    if (c.wieseLiest === "leer") v.push("LEER: die Nah-Wiese trägt keine Kachel mit Büscheln — die Wiesen-Probe ist blind");
    else if (!c.wieseLiest)
        v.push("WIESE: `_nahWieseSicht` prüft ihre Kacheln bei gleicher Lage-Generation neu oder bei neuer nicht (`L.gen`)");
    return v;
}

function selbsttest() {
    // die drei Maße einer Größe über die Frames (Mittel, Median, Maximum)
    const werte = (mittel, median = mittel, max = mittel) => ({ mittel, median, max });
    const phase = (arbeit, bytes, treffer) => ({
        frames: 10,
        paesse: werte(3),
        arbeit: werte(arbeit),
        arbeitFrames: arbeit > 0 ? 10 : 0,
        arbeitOhne: { frames: arbeit > 0 ? 10 : 0, median: arbeit, max: arbeit },
        aenderungFrames: 0,
        schreibFrames: bytes > 0 ? 10 : 0,
        ohneFrames: bytes > 0 ? 10 : 0,
        ecken: werte(0),
        bytes: werte(bytes),
        bytesOhne: werte(bytes),
        bytesOhneJe: bytes > 0 ? { "boden wahl:lage": bytes * 10 } : {},
        legeOhne: werte(0),
        legeOhneFrames: 0,
        legeOhneJe: {},
        treffer: werte(treffer),
        hoehlenSicht: werte(0),
        hoehlenSichtLicht: werte(0),
        abschnitt: werte(0),
        passTrifft: werte(0),
        instanzBehalten: werte(0),
        werferTrifft: werte(0),
        hinaus: werte(0),
    });
    const sonne = (arbeitFrames, lichtFrames, stufe) =>
        Object.assign(phase(arbeitFrames > 0 ? 300 : 0, 0, 9), {
            frames: 120,
            arbeitFrames,
            lichtFrames,
            sonneRad: 0.026,
            stufe,
            arbeit: werte(arbeitFrames > 0 ? 20 : 0, 0, arbeitFrames > 0 ? 3000 : 0),
        });
    const gruen = {
        sonne: sonne(12, 6, 1 / 255),
        ruhe: phase(0, 0, 9),
        drehen: phase(4000, 0, 0),
        gehen: phase(5000, 0, 0),
        bruch: phase(4000, 0, 0),
        legeBruch: Object.assign(phase(0, 0, 9), {
            legeOhne: werte(2400),
            legeOhneFrames: 10,
            legeOhneJe: { "boden dicht:ohne haupt": 24000 },
        }),
        standBruch: Object.assign(phase(15072, 0, 0), {
            inhaltOhneFrames: 10,
            inhaltOhneJe: { "streuSatz stand:ohne": 50, "boden stand:ohne": 10 },
        }),
        augeAn: true,
        auge: Object.assign(phase(0, 0, 9), { kameraFrames: 0, blendeFrames: 0 }),
        blendeTreue: {
            gehalten: true,
            traegt: true,
            loecher: 0,
            namen: [],
            geprueft: 640,
            fall: "f:eiche|2|1:0 Slot 3 (Stufe 1, Kante 18.400 m)",
        },
        blendeTreueOhneRand: {
            gehalten: true,
            traegt: true,
            loecher: 1,
            namen: ["f:eiche|2|1:0 Slot 3"],
            geprueft: 640,
            fall: "f:eiche|2|1:0 Slot 3 (Stufe 1, Kante 18.400 m)",
        },
        treue: { geprueft: 12, abweichung: [] },
        drehTreue: { grenze: 0.0348, gehalten: true, loecher: 0, namen: [], geprueft: 500 },
        instanzTreue: {
            faelle: ["Freigeben+Belegen g", "Stufen-Wechsel g 1→0"],
            leichen: [],
            wuerfe: 0,
            nan: 0,
            tot: 0,
            fehlen: 0,
            geprueft: 40,
            namen: [],
        },
        code: { wieseLiest: true },
    };
    const klon = () => JSON.parse(JSON.stringify(gruen));
    const fehler = [];
    const v0 = urteil(klon());
    if (v0.length) fehler.push("der grüne Befund fällt rot: " + v0.join(" · "));
    console.log(`  ${v0.length ? "❌" : "✅"} Selbsttest grün → ${v0.join(" · ") || "grün"}`);
    // der echte Loop unter langsamem Takt: das Licht dreht in jedem Frame (die Sonne läuft schneller als eine Stufe je Frame),
    // die Kaskaden mit Box halten ihre Wahl über den Licht-Rand — grün
    const randSonne = (arbeitFrames, lichtRand) =>
        Object.assign(sonne(arbeitFrames, 199, 0.0004), { frames: 199, sonneRad: 0.19, mitBox: true, lichtRand });
    const v1 = urteil(Object.assign(klon(), { sonne: randSonne(40, 32) }));
    if (v1.length) fehler.push("der grüne Befund mit Licht-Rand fällt rot: " + v1.join(" · "));
    console.log(`  ${v1.length ? "❌" : "✅"} Selbsttest grün mit Licht-Rand → ${v1.join(" · ") || "grün"}`);
    // RUHE MIT ÄNDERUNG (K): Arbeit und Bytes in Frames mit gedrehtem Licht sind die Arbeit der Änderung — grün; die
    // Linse nennt sie (die Werkbank fällte die laufende Sonne als „schreibt ohne Änderung"). Ein Satz-Inhalt mit benanntem
    // Grund ist im echten Loop (nicht streng) eine Änderung — in der eingefrorenen Welt der Wand fällt er rot (Fall unten).
    const loopInhalt = Object.assign(klon().ruhe, {
        inhaltFrames: 3,
        inhaltJe: { boden: { frames: 3, aenderung: 3, folge: 0, bereiche: 3, keys: ["+-901,-850"] } },
    });
    const vL = SICHT.sichtUrteil({ ruhe: loopInhalt });
    if (vL.length) fehler.push("der echte Loop mit Inhalts-Änderung fällt rot: " + vL.join(" · "));
    console.log(
        `  ${vL.length ? "❌" : "✅"} Selbsttest echter Loop mit Inhalts-Änderung → ${vL.join(" · ") || "grün"}`
    );
    const mitAenderung = klon();
    Object.assign(mitAenderung.ruhe, {
        arbeit: werte(800, 0, 10000),
        arbeitFrames: 66,
        aenderungFrames: 80,
        bytes: werte(5291, 0, 232320),
        schreibFrames: 69,
    });
    const v2 = urteil(mitAenderung);
    if (v2.length) fehler.push("Ruhe mit Änderung fällt rot: " + v2.join(" · "));
    console.log(`  ${v2.length ? "❌" : "✅"} Selbsttest Ruhe mit Änderung (Licht) → ${v2.join(" · ") || "grün"}`);
    // DIE KLASSE JE BYTE (`sichtBytesKlasse`): der Grund des Schreibers gegen die Änderung im selben Frame — ein Satz-Inhalt
    // zählt nur mit BENANNTEM Grund (`grund`), nie über die Zähler des Spiels (Stand, Verdichten)
    const kl = (f) => SICHT.sichtBytesKlasse(f);
    // ein Frame mit 100 Bytes eines benannten Grunds (ohne Inhalt, wenn der Fall keinen nennt)
    const bytes100 = (grund, mehr) => ({ bytes: 100, bytesGrund: { [grund]: 100 }, inhalt: {}, ...mehr });
    const klassen = [
        [
            "Inhalt änderte sich (ein Bereich kam)",
            bytes100("boden wahl:stand haupt", { inhalt: { boden: { grund: "aenderung", bereiche: 1, stand: 1 } } }),
            "aenderung",
        ],
        ["Stand ohne Inhalt", bytes100("boden wahl:stand haupt"), "ohne"],
        [
            "Stand-Bruch (der Satz zählt nur seinen Stand)",
            bytes100("streuSatz wahl:stand haupt", {
                inhalt: { streuSatz: { stand: 5, verdichtet: 0, bereiche: 0, keys: [] } },
            }),
            "ohne",
        ],
        [
            "Verdichten-Zähler ohne Grund",
            bytes100("bauSatz wahl:neu k0", {
                inhalt: { bauSatz: { stand: 0, verdichtet: 1, bereiche: 0, keys: [] } },
            }),
            "ohne",
        ],
        [
            "Verdichten nach dem Überhang (die neue Wahl danach)",
            bytes100("bauSatz wahl:neu k0", { inhalt: { bauSatz: { grund: "folge", verdichtet: 1 } } }),
            "folge",
        ],
        [
            "Inhalt einer anderen Familie",
            bytes100("boden wahl:neu k0", { inhalt: { wasser: { grund: "aenderung", bereiche: 1 } } }),
            "ohne",
        ],
        ["Licht drehte (Kaskade)", bytes100("boden wahl:lage k0", { licht: 1 }), "aenderung"],
        ["Licht drehte (Hauptbild)", bytes100("boden wahl:lage haupt", { licht: 1 }), "ohne"],
        ["Kamera bewegt (Hauptbild)", bytes100("boden wahl:lage haupt", { kamera: 1 }), "aenderung"],
        ["Lage ohne Licht", bytes100("boden wahl:lage k1", { licht: 0 }), "ohne"],
        [
            "Licht drehte seit dem letzten Pass der Kaskade (sie ruhte im Frame der Drehung)",
            bytes100("boden wahl:lage k1", { licht: 0, lichtJe: { k1: 1 } }),
            "aenderung",
        ],
        [
            "Licht drehte nur für die andere Kaskade",
            bytes100("boden wahl:lage k1", { licht: 0, lichtJe: { k0: 1 } }),
            "ohne",
        ],
        [
            "Licht je Kaskade für das Hauptbild",
            bytes100("boden wahl:lage haupt", { licht: 0, lichtJe: { haupt: 1 } }),
            "ohne",
        ],
        ["Blende des Reglers (Hauptbild)", bytes100("boden wahl:lage haupt", { blende: 1 }), "aenderung"],
        ["Verdichten einer ruhenden Wahl", bytes100("bauSatz dicht k0"), "folge"],
        ["Umlegen", bytes100("boden umlegen haupt"), "folge"],
        ["Verdichten ohne Schuld", bytes100("bauSatz dicht:ohne k0", { licht: 1 }), "ohne"],
        ["Umlegen ohne Wahl", bytes100("boden umlegen:ohne haupt", { kamera: 1 }), "ohne"],
        ["ungesehene Bytes", { bytes: 100, bytesGrund: {}, inhalt: {} }, "ohne"],
    ];
    for (const [name, f, soll] of klassen) {
        const k = kl(f);
        const ok = k[soll] === 100 && ["aenderung", "folge", "ohne"].every((x) => x === soll || k[x] === 0);
        if (!ok) fehler.push(`Klasse „${name}": ${JSON.stringify(k)} statt ${soll}`);
        console.log(`  ${ok ? "✅" : "❌"} Selbsttest Klasse „${name}" → ${soll}`);
    }
    if (!kl({ bytes: 100, bytesGrund: {}, inhalt: {} }).ohneJe["? ungesehen"])
        fehler.push("ungesehene Bytes stehen nicht beim Namen");
    // das Neulegen klassiert dieselbe Regel über `legeGrund` — ohne Schuld ist es der Täter, mit Schuld die Folge, und
    // die Bytes des Frames zählen dort nie als ungesehen
    {
        const lk = (g) => SICHT.sichtBytesKlasse({ bytes: 100, legeGrund: { [g]: 480 }, inhalt: {} }, "legeGrund");
        const lo = lk("bauSatz dicht:ohne k0"),
            lf = lk("bauSatz dicht k0");
        const ok = lo.ohne === 480 && lo.ohneJe["bauSatz dicht:ohne k0"] === 480 && lf.folge === 480 && lf.ohne === 0;
        if (!ok) fehler.push(`Neulegen-Klasse: ${JSON.stringify(lo)} · ${JSON.stringify(lf)}`);
        console.log(`  ${ok ? "✅" : "❌"} Selbsttest Neulegen: ohne Schuld → ohne, mit Schuld → Folge, nie ungesehen`);
    }
    // DIE KAMERA BEWEGT SICH (`sichtKameraBewegt`): das Atmen des Auges im Stand ist keine Bewegung (sonst entschuldigte die
    // Linse jeden Ruhe-Frame), ein Schritt über den Halt und eine Drehung über den halben Dreh-Rand sind es
    const mat = (yawGrad, x, y, z) => {
        const w = (yawGrad * Math.PI) / 180;
        const c = Math.cos(w),
            s = Math.sin(w);
        return [c, 0, -s, 0, 0, 1, 0, 0, s, 0, c, 0, x, y, z, 1];
    };
    const HALT = 0.02,
        DREH = (2 * Math.PI) / 180;
    const proj = (fern) => [1.3, 0, 0, 0, 0, 2.3, 0, 0, 0, 0, -1, -1, 0, 0, -0.2 * fern, 0];
    const M = require("./lib/welt-orte.cjs").messort("wiese"); // die Kamera am Messort (Weltkoordinaten der Mess-Wiese)
    for (const [name, b, soll] of [
        ["Atmen ±4 mm", mat(0, M.x, 64.004, M.z).concat(proj(1)), false],
        ["Schritt 1,5 cm (über dem halben Halt)", mat(0, M.x - 0.015, 64, M.z).concat(proj(1)), true],
        ["Drehung 0,5°", mat(0.5, M.x, 64, M.z).concat(proj(1)), false],
        ["Drehung 1,5°", mat(1.5, M.x, 64, M.z).concat(proj(1)), true],
        ["Projektion (Fern-Ebene)", mat(0, M.x, 64, M.z).concat(proj(1.01)), true],
    ]) {
        const k = SICHT.sichtKameraBewegt(mat(0, M.x, 64, M.z).concat(proj(1)), b, HALT, DREH);
        if (k !== soll) fehler.push(`Kamera „${name}": ${k} statt ${soll}`);
        console.log(`  ${k === soll ? "✅" : "❌"} Selbsttest Kamera „${name}" → ${k ? "bewegt" : "steht"}`);
    }
    // DIE BLENDE BEWEGT SICH (`sichtBlendeBewegt`): das Auge der Maske ist ein Ort der Lage — sein
    // Atmen unter dem halben Halt ist keine Bewegung
    if (typeof SICHT.sichtBlendeBewegt !== "function")
        fehler.push("LINSE: `sichtBlendeBewegt` fehlt — die Blende kennt das Gesetz des Halts nicht");
    else {
        const bl = (ex, ez, werte) => ({ ex, ez, werte: werte || [1, 1, 14, 20, 60, 6, 4] });
        for (const [name, b, soll] of [
            ["Atmen ±1 mm quer", bl(M.x - 0.001, M.z), false],
            ["Atmen 9 mm (unter dem halben Halt)", bl(M.x - 0.009, M.z), false],
            ["Schritt 1,5 cm", bl(M.x - 0.015, M.z), true],
            ["Perf-Streck neu", bl(M.x, M.z, [1, 1.1, 14, 20, 60, 6, 4]), true],
            ["Kante des Blend-Gesetzes neu", bl(M.x, M.z, [1, 1, 14, 22, 60, 6, 4]), true],
            ["Maske aus", bl(M.x, M.z, [0, 1, 14, 20, 60, 6, 4]), true],
        ]) {
            const k = SICHT.sichtBlendeBewegt(bl(M.x, M.z), b, 0.02);
            if (k !== soll) fehler.push(`Blende „${name}": ${k} statt ${soll}`);
            console.log(`  ${k === soll ? "✅" : "❌"} Selbsttest Blende „${name}" → ${k ? "bewegt" : "steht"}`);
        }
    }
    // DIE ARBEIT OHNE ÄNDERUNG je Frame (`sichtArbeitOhne`): Kamera und ein Inhalt mit benanntem Grund erklären alles, das
    // Licht nur die Kaskaden, der Stand eines Satzes allein nichts
    const ao = (f) => SICHT.sichtArbeitOhne(f);
    const jp = { haupt: { pruefung: 7 }, k0: { pruefung: 50 } };
    for (const [name, f, soll] of [
        ["ruhig", { arbeit: 57, jePass: jp, inhalt: {} }, 57],
        ["Licht drehte", { arbeit: 57, jePass: jp, licht: 1, inhalt: {} }, 7],
        [
            "Licht drehte seit dem letzten Pass von k1 (nicht von k0)",
            { arbeit: 87, jePass: Object.assign({ k1: { pruefung: 30 } }, jp), lichtJe: { k1: 1 }, inhalt: {} },
            57,
        ],
        [
            "je Pass zählt die Arbeit der Ruhe-Leser, nicht jede Prüfung (wie `arbeit`)",
            {
                arbeit: 7,
                jePass: {
                    haupt: { pruefung: 7, arbeit: 7 },
                    k0: { pruefung: 23, arbeit: 0 },
                    k1: { pruefung: 5, arbeit: 5 },
                },
                lichtJe: { k1: 1 },
                inhalt: {},
            },
            7,
        ],
        ["Kamera bewegt", { arbeit: 57, jePass: jp, kamera: 1, inhalt: {} }, 0],
        ["Blende neu", { arbeit: 57, jePass: jp, blende: 1, inhalt: {} }, 0],
        [
            "Inhalt änderte sich",
            { arbeit: 57, jePass: jp, inhalt: { bauSatz: { grund: "aenderung", bereiche: 1 } } },
            0,
        ],
        ["Folge (die offene Ordnung lief)", { arbeit: 57, jePass: jp, inhalt: { boden: { grund: "folge" } } }, 0],
        [
            "Stand-Bruch (der Satz zählt nur seinen Stand)",
            { arbeit: 57, jePass: jp, inhalt: { streuSatz: { stand: 5, verdichtet: 0, bereiche: 0, keys: [] } } },
            57,
        ],
    ]) {
        const n = ao(f);
        if (n !== soll) fehler.push(`Arbeit ohne Änderung „${name}": ${n} statt ${soll}`);
        console.log(`  ${n === soll ? "✅" : "❌"} Selbsttest Arbeit ohne Änderung „${name}" → ${n}`);
    }
    // DER INHALT EINES SATZES aus seinen Belegen (`sichtSatzInhalt`): je Bild die Bereiche (Identität und
    // Hülle), der Anker, die offene Ordnung, Geometrie und Überhang — der Stand und der Verdichten-Zähler belegen nichts
    if (typeof SICHT.sichtSatzInhalt !== "function")
        fehler.push("LINSE: `sichtSatzInhalt` fehlt — der Inhalt hat keine Belege");
    else {
        const A = {},
            B = {},
            C = {};
        const H = (y) => Float64Array.from([0, y, 0, 16, y + 2, 16]);
        const bild = (o) =>
            Object.assign(
                {
                    stand: 10,
                    verdichtet: 0,
                    anker: "-57,-54",
                    schmutzig: false,
                    geom: "g1",
                    vKap: 4096,
                    iKap: 9000,
                    ueber: false,
                    bloecke: new Map([
                        ["a", { b: A, h: H(60) }],
                        ["b", { b: B, h: H(62) }],
                    ]),
                },
                o
            );
        const mit = (m) => new Map([...bild({}).bloecke, ...m]);
        const satzFaelle = [
            ["Stand-Bruch (Stand +1, nichts sonst)", bild({}), bild({ stand: 11 }), false, null, { stand: 1 }],
            [
                "ein Bereich kam",
                bild({}),
                bild({ stand: 12, bloecke: mit([["c", { b: C, h: H(61) }]]) }),
                false,
                "aenderung",
                {},
            ],
            [
                "ein Bereich wurde neu gebaut",
                bild({}),
                bild({ stand: 12, bloecke: mit([["b", { b: C, h: H(62) }]]) }),
                false,
                "aenderung",
                {},
            ],
            [
                "ein Bereich ging",
                bild({}),
                bild({ stand: 11, bloecke: new Map([["a", { b: A, h: H(60) }]]) }),
                false,
                "aenderung",
                {},
            ],
            ["der Anker zog um", bild({}), bild({ stand: 11, anker: "-58,-54" }), false, "aenderung", {}],
            [
                "ein Geomorph legt eine neue Hülle",
                bild({}),
                bild({ stand: 11, bloecke: mit([["a", { b: A, h: H(59.5) }]]) }),
                false,
                "aenderung",
                {},
            ],
            [
                "ein Geomorph ohne neue Hülle",
                bild({}),
                bild({ stand: 11, bloecke: mit([["a", { b: A, h: H(60) }]]) }),
                false,
                null,
                { stand: 1 },
            ],
            ["die offene Ordnung läuft", bild({ schmutzig: true }), bild({ stand: 11 }), true, "folge", {}],
            [
                "eine Ordnung ohne offenen Grund",
                bild({ schmutzig: true }),
                bild({ stand: 11 }),
                false,
                null,
                { stand: 1 },
            ],
            [
                "das Verdichten nach dem Überhang",
                bild({ ueber: true }),
                bild({ verdichtet: 1, geom: "g2", vKap: 2048 }),
                false,
                "folge",
                {},
            ],
            [
                "ein Verdichten-Zähler ohne Tausch",
                bild({ ueber: true }),
                bild({ verdichtet: 1 }),
                false,
                null,
                { verdichtet: 1 },
            ],
            [
                "ein Verdichten ohne Überhang",
                bild({}),
                bild({ verdichtet: 1, geom: "g2", vKap: 2048 }),
                false,
                null,
                { verdichtet: 1 },
            ],
        ];
        for (const [name, vor, jetzt, offen, grund, ohne] of satzFaelle) {
            const e = SICHT.sichtSatzInhalt(vor, jetzt, offen);
            const ok =
                e.grund === grund &&
                (e.ohne.stand || 0) === (ohne.stand || 0) &&
                (e.ohne.verdichtet || 0) === (ohne.verdichtet || 0);
            if (!ok) fehler.push(`Satz-Inhalt „${name}": grund ${e.grund}, ohne ${JSON.stringify(e.ohne)}`);
            console.log(
                `  ${ok ? "✅" : "❌"} Selbsttest Satz-Inhalt „${name}" → ${e.grund || "kein Grund"}` +
                    (e.ohne.stand || e.ohne.verdichtet ? ` (ohne Ursache: ${JSON.stringify(e.ohne)})` : "")
            );
        }
        // die Ordnung bleibt offen, solange der Satz schmutzig ist
        const o1 = SICHT.sichtSatzInhalt(
            bild({}),
            bild({ schmutzig: true, bloecke: mit([["c", { b: C, h: H(61) }]]) })
        );
        if (!o1.offen) fehler.push("Satz-Inhalt: ein Eintritt mit offener Ordnung lässt sie nicht offen");
    }
    // DER TÄTER DER GEGENPRÜFUNG, Frame für Frame durch dieselbe Phase und dasselbe Urteil wie im Lauf: in der eingefrorenen
    // Welt zählt jeder Satz je Frame seinen Stand (15 072 Prüfungen je Frame, 5 von 5 Frames, kein Byte) — die Frames tragen,
    // was die Linse sah: die Zähler des Spiels als Inhalt (die Basis-Linse des Zwischenstands entschuldigte damit alles) und
    // den Stand ohne Ursache beim Namen (die geschnittene Linse)
    const fenster = {};
    new Function("window", SICHT.SICHT_INSTALL)(fenster);
    global.window = fenster;
    const churnFrame = () => ({
        paesse: 3,
        nach: 1,
        arbeit: 15072,
        // die Instanz-Wahl der Gruppen steht weiter (nur die Sätze churnen)
        trefferSumme: 61,
        bytes: 0,
        bytesJe: {},
        bytesGrund: {},
        warum: { "streuSatz stand": 5, "bauSatz stand": 2, "boden stand": 2 },
        aufrufe: { _chunkSatzAbschnitt: 16, _hoehlenSicht: 3, _hoehlenSichtLicht: 2 },
        pruefung: { _passTrifft: 12109, _hoehlenRect: 1227 },
        trifft: {},
        treffer: { _instanzWahlSteht: 61 },
        verfehlt: { _satzAbschnittSteht: 10 },
        neu: { "satz streuSatz|haupt": 5, "satz bauSatz|haupt": 2 },
        jePass: { haupt: { pruefung: 13336, ecken: 9816 }, k0: { pruefung: 1736, ecken: 0 } },
        ecken: 9816,
        inhalt: {
            streuSatz: { stand: 5, verdichtet: 0, bereiche: 0, keys: [] },
            bauSatz: { stand: 2, verdichtet: 0, bereiche: 0, keys: [] },
            boden: { stand: 1, verdichtet: 0, bereiche: 0, keys: [] },
        },
        inhaltOhne: { "streuSatz stand:ohne": 5, "bauSatz stand:ohne": 2, "boden stand:ohne": 1 },
        licht: 0,
        kamera: 0,
        blende: 0,
        tag: 0.5,
        stufe: null,
        fehlt: [],
    });
    const churnPhase = () => SICHT.sichtPhase(Array.from({ length: 6 }, churnFrame), 1);
    const faelle = [
        [
            "Stand-Churn ohne Ursache in Ruhe (der Täter der Gegenprüfung)",
            (b) => (b.ruhe = churnPhase()),
            /RUHE: Satz-Arbeit ohne Ursache in 5 von 5 Frames — streuSatz stand:ohne ×25/,
        ],
        [
            "Stand-Churn ohne Ursache: die Arbeit ist Arbeit ohne Änderung",
            (b) => (b.ruhe = churnPhase()),
            /RUHE: die Sicht-Kette arbeitet in Ruhe ohne Änderung \(Median 15072, max 15072 Prüfungen, in 5 von 5 Frames/,
        ],
        [
            "stumpfe Stand-Linse (der Stand-Bruch heißt Änderung)",
            (b) => (b.standBruch = Object.assign(phase(0, 0, 0), { aenderungFrames: 10 })),
            /LINSE STUMPF: ein eingeschmuggelter Stand-Bruch/,
        ],
        [
            "stumpfe Stand-Linse (der Stand-Bruch steht ohne Namen)",
            (b) => (b.standBruch = Object.assign(phase(15072, 0, 0), { inhaltOhneFrames: 0, inhaltOhneJe: {} })),
            /LINSE STUMPF: ein eingeschmuggelter Stand-Bruch/,
        ],
        ["kein Stand-Bruch", (b) => delete b.standBruch, /LEER: kein Stand-Bruch gemessen/],
        [
            "das atmende Auge arbeitet (der Täter der zweiten Gegenprüfung)",
            (b) =>
                (b.auge = Object.assign(phase(14999, 0, 0), {
                    frames: 5,
                    kameraFrames: 0,
                    blendeFrames: 0,
                    arbeitOhne: { frames: 5, median: 14999, max: 14999 },
                    taeter: ["satz streuSatz|haupt ×5", "gruppe f:eiche|2|1:0#S ×2"],
                })),
            /AUGE: das Auge atmet unter dem Halt, doch die Sicht-Kette arbeitet ohne Änderung in 5 von 5 Frames \(Median 14999/,
        ],
        [
            "die Linse nennt das atmende Auge Blende",
            (b) =>
                (b.auge = Object.assign(phase(14999, 0, 0), {
                    frames: 5,
                    kameraFrames: 0,
                    blendeFrames: 5,
                    aenderungFrames: 5,
                    arbeitOhne: { frames: 0, median: 0, max: 0 },
                })),
            /LINSE STUMPF: das atmende Auge \(±1 mm, unter dem Halt\) heißt Bewegung — Kamera in 0, Blende in 5 von 5/,
        ],
        ["kein atmendes Auge", (b) => delete b.auge, /LEER: keine Phase mit atmendem Auge/],
        ["die Maske ist aus", (b) => (b.augeAn = false), /LEER: die Maske ist aus/],
        [
            "Loch an der Kante des Fensters",
            (b) => Object.assign(b.blendeTreue, { loecher: 1, namen: ["f:eiche|2|1:0 Slot 3"] }),
            /BLENDE-TREUE: 1 Löcher — .*f:eiche\|2\|1:0 Slot 3/,
        ],
        [
            "die Lage hält das Auge nicht",
            (b) => (b.blendeTreue.gehalten = false),
            /BLENDE-TREUE VAKUÖS: die Lage hielt/,
        ],
        [
            "die Maske behält die Kante nicht",
            (b) => (b.blendeTreue.traegt = false),
            /BLENDE-TREUE VAKUÖS: die Maske behält/,
        ],
        ["keine Instanz an einer Kante", (b) => (b.blendeTreue.fall = null), /LEER: Blende-Treue ohne Instanz/],
        [
            "ohne Rand fehlt nichts (die Probe ist stumpf)",
            (b) => (b.blendeTreueOhneRand.loecher = 0),
            /LINSE STUMPF: ohne den Halt als Rand des Fensters fehlt der gehaltenen Wahl nichts/,
        ],
        [
            "der Inhalt ändert sich in der eingefrorenen Welt",
            (b) =>
                Object.assign(b.ruhe, {
                    inhaltFrames: 2,
                    inhaltJe: { boden: { frames: 2, aenderung: 2, bereiche: 2, keys: ["+-901,-850", "-899,-850"] } },
                }),
            /RUHE: die Welt ist eingefroren, doch ihr Inhalt änderte sich in 2 von 10 Frames \(boden \+-901,-850/,
        ],
        [
            "Arbeit in Ruhe (die Basis)",
            (b) => (b.ruhe = phase(5200, 0, 0)),
            /RUHE: die Sicht-Kette arbeitet in Ruhe ohne Änderung \(Median 5200/,
        ],
        [
            "ein Ausreißer in Ruhe",
            (b) => (
                (b.ruhe.arbeit.max = 30),
                (b.ruhe.arbeitFrames = 1),
                (b.ruhe.arbeitOhne = { frames: 1, median: 0, max: 30 })
            ),
            /RUHE: die Sicht-Kette arbeitet in Ruhe/,
        ],
        [
            "Bytes in Ruhe",
            (b) =>
                Object.assign(b.ruhe, {
                    bytes: werte(96, 0, 960),
                    schreibFrames: 1,
                    bytesOhne: werte(96, 0, 960),
                    ohneFrames: 1,
                    bytesOhneJe: { "bauSatz dicht?": 960 },
                }),
            /RUHE: 96 Index-Bytes je Frame ohne Änderung .*bauSatz dicht\? 960 B/,
        ],
        [
            "Neulegen in Ruhe (K71: 0 Bytes, der Gang über die Zellen)",
            (b) =>
                Object.assign(b.ruhe, {
                    legeOhne: werte(48, 0, 480),
                    legeOhneFrames: 1,
                    legeOhneJe: { "bauSatz dicht:ohne k0": 480 },
                }),
            /RUHE: 48 Indizes je Frame neu gelegt ohne Änderung .*bauSatz dicht:ohne k0 480/,
        ],
        ["kein Treffer", (b) => (b.ruhe.treffer = werte(0)), /LINSE BLIND: kein Pass traf/],
        ["starres Drehen", (b) => (b.drehen.arbeit = werte(0)), /STARR: beim Drehen/],
        ["starres Gehen", (b) => (b.gehen.arbeit = werte(1, 0, 3)), /STARR: beim Gehen/],
        [
            "untreue Wahl",
            (b) => b.treue.abweichung.push("boden|haupt: 41 statt 43 Zellen"),
            /TREUE: boden\|haupt: 41 statt 43 Zellen/,
        ],
        ["Treue ohne Vergleich", (b) => (b.treue.geprueft = 0), /LEER: Treue ohne Vergleich/],
        ["stumpfe Linse", (b) => (b.bruch = phase(0, 0, 9)), /LINSE STUMPF/],
        [
            "stumpfe Lege-Linse (der Lege-Bruch legt nichts — K71: er lädt 0 Bytes)",
            (b) => (b.legeBruch = phase(0, 0, 9)),
            /LINSE STUMPF: ein eingeschmuggelter Lege-Bruch/,
        ],
        [
            "stumpfe Lege-Linse (der Lege-Bruch steht unter fremdem Grund)",
            (b) =>
                (b.legeBruch = Object.assign(phase(0, 0, 9), {
                    legeOhne: werte(2400),
                    legeOhneFrames: 10,
                    legeOhneJe: { "boden umlegen:ohne haupt": 24000 },
                })),
            /LINSE STUMPF: ein eingeschmuggelter Lege-Bruch/,
        ],
        ["kein Lege-Bruch", (b) => delete b.legeBruch, /LEER: kein Lege-Bruch gemessen/],
        [
            "das Licht dreht je Frame (die Basis)",
            (b) => (b.sonne = sonne(120, 120, null)),
            /SONNE: das Licht hat keine Stufe — es dreht in 120 von 120 Frames/,
        ],
        ["Arbeit zwischen den Stufen", (b) => (b.sonne = sonne(40, 6, 1 / 255)), /Arbeit zwischen den Stufen/],
        ["Stufe ohne Halt", (b) => (b.sonne = sonne(12, 120, 1 / 255)), /SONNE: das Licht dreht in 120 von 120 Frames/],
        ["Kaskaden ohne Licht-Rand", (b) => (b.sonne = randSonne(40, 0)), /SONNE: die Kaskaden wählen ohne Licht-Rand/],
        [
            "Arbeit über den Licht-Rand hinaus",
            (b) => (b.sonne = randSonne(199, 32)),
            /der Licht-Rand \(32 Texel\) erlaubt etwa 61 neue Wahlen/,
        ],
        [
            "Sonne ohne Lauf",
            (b) => (b.sonne.sonneRad = 0),
            /LEER: in der Phase mit laufender Sonne lief die Sonne nicht/,
        ],
        ["keine Sonne", (b) => delete b.sonne, /LEER: keine Phase mit laufender Sonne/],
        ["keine Ruhe", (b) => delete b.ruhe, /LEER: keine Ruhe-Phase/],
        [
            "ein Leser fehlt der Welt (die Linse hüllt ihn nicht)",
            (b) => (b.ruhe.fehlt = ["_hoehlenSichtLicht"]),
            /LINSE BLIND: die Welt trägt die Leser _hoehlenSichtLicht nicht/,
        ],
        [
            "Loch nach der Neu-Wahl in der Drehung",
            (b) => Object.assign(b.drehTreue, { loecher: 7, namen: ["boden Zelle"] }),
            /DREH-TREUE: 7 Löcher/,
        ],
        ["Drehfolge ohne Halt", (b) => (b.drehTreue.gehalten = false), /DREH-TREUE VAKUÖS/],
        ["keine Dreh-Treue", (b) => delete b.drehTreue, /LEER: keine Dreh-Treue/],
        [
            "die zweite Kaskade hält eine tote Marke",
            (b) =>
                Object.assign(b.instanzTreue, {
                    wuerfe: 1,
                    nan: 1,
                    tot: 1,
                    namen: ["Wurf: Cannot set properties of undefined (setting 'slot')"],
                }),
            /INSTANZ: .*1 Würfe, 1 NaN-Slots, 1 tote Marken/,
        ],
        ["ein Werfer fehlt der Kaskade", (b) => (b.instanzTreue.fehlen = 2), /INSTANZ: .*2 fehlende Werfer/],
        [
            "Instanz-Treue ohne den echten Weg",
            (b) => b.instanzTreue.faelle.pop(),
            /LEER: Instanz-Treue ohne beide Fälle/,
        ],
        [
            "der Stufen-Wechsel leert seine Gruppe",
            (b) => {
                b.instanzTreue.faelle.pop();
                b.instanzTreue.leichen.push("Stufen-Wechsel f:weide|1|1:0#S 1→0 leerte die Gruppe");
            },
            /LEER: Instanz-Treue ohne beide Fälle .* — ohne Prüfung: Stufen-Wechsel f:weide\|1\|1:0#S 1→0 leerte die Gruppe/,
        ],
        ["Wiese liest nicht", (b) => (b.code.wieseLiest = false), /WIESE: `_nahWieseSicht` prüft/],
        ["Wiese leer", (b) => (b.code.wieseLiest = "leer"), /LEER: die Nah-Wiese trägt keine Kachel/],
    ];
    taeterFaelle(faelle, urteil, { fehler, klon });
    selbsttestEnde(fehler);
}

if (process.argv.includes("--selftest")) {
    console.log("=== SICHT-ARBEIT — Selbsttest (ohne Browser) ===");
    selbsttest();
    process.exit(0);
}

const { messort } = require("./lib/welt-orte.cjs");
const MESS = messort("wiese");
const server = statikServer();

(async () => {
    console.log("=== SICHT-ARBEIT (Welle C) — Null-Renderer, Mess-Wiese, die Sicht-Linse je Frame ===");
    await server.lausche(0);
    const { browser, page } = await nullSeite({ frist: 600000 });
    page.setDefaultTimeout(580000);
    let befund = null;
    try {
        await server.zeige(page, 120000, "index.html", "networkidle0");
        await warteAufWelt(page, 120000);
        await page.evaluate(SICHT.SICHT_INSTALL);
        befund = await page.evaluate(async (MESS) => {
            const r = window.anazhRealm,
                st = r.state,
                T = window.THREE;
            const P = Object.getPrototypeOf(r);
            const takt = () => {
                try {
                    r._gameLoopTick(performance.now());
                } catch {}
            };
            st.playerMesh.position.set(MESS.x, r._voxelSurfaceY(MESS.x, MESS.z) + 1.8, MESS.z);
            // einschwingen: die Welt steht (das EINE Einschwingen, welt-boot `__weltStehtNach`)
            const takte = await window.__weltStehtNach(takt);
            const ring = st.voxelChunks.size;
            r._tickChunkSatz();
            const aus = { ring, takte, code: {} };
            const cam = st.camera;
            const S = r._kaskadenSchmier();
            const ppos = st.playerMesh.position.clone();
            const boden = r._voxelSurfaceY(MESS.x, MESS.z);
            // Die Stellvertreter-Kaskaden (wie gate:chunk-satz): Ortho-Kameras über dem Blick, k0 ±120 m, k1 ±400 m, die
            // Mitte ein halbes Feld vor dem Auge — sie laufen mit, wenn der Blick dreht oder geht.
            const kaskaden = [new T.OrthographicCamera(-120, 120, 120, -120, 0, 1600)];
            kaskaden.push(new T.OrthographicCamera(-400, 400, 400, -400, 0, 1600));
            const stelle = (yaw, vor) => {
                const ex = ppos.x + Math.sin(yaw) * vor,
                    ez = ppos.z - Math.cos(yaw) * vor;
                cam.position.set(ex, boden + 1.7, ez);
                cam.lookAt(ex + Math.sin(yaw) * 100, boden + 1.7, ez - Math.cos(yaw) * 100);
                cam.updateMatrixWorld(true);
                kaskaden.forEach((c, i) => {
                    const h = c.right * 0.5;
                    const cx = ex + Math.sin(yaw) * h,
                        cz = ez - Math.cos(yaw) * h;
                    c.position.set(cx + 280, boden + 800, cz + 160);
                    c.lookAt(cx, boden, cz);
                    c.updateMatrixWorld(true);
                    c.updateProjectionMatrix();
                    void i;
                });
            };
            // EIN Frame der Sicht: das Hauptbild über `_passSicht`, dann jede Kaskade mit derselben Lage wie in `_passSicht`
            // (Matrix, Frustum, das Gesetz der Lage; die Instanz-Wahl der Schatten-Gruppen, der EINE Satz-Chokepoint und die
            // Werfer der Region-Bündel — K72: auch ihre Wahl rechnet nur bei Änderung, die Linse zählt sie wie jeden Leser).
            const frame = () => {
                r._tickChunkSatz();
                r._passSicht(cam, false);
                const wahl = [];
                for (const g of r._instanzWahlGruppen())
                    if (g.wahl === "haupt" && g.mesh) wahl.push(["haupt", g, g.mesh.count]);
                const bunde = st._regionBundles;
                kaskaden.forEach((c, i) => {
                    S.m.multiplyMatrices(c.projectionMatrix, c.matrixWorldInverse);
                    S.frustum.setFromProjectionMatrix(S.m, c.coordinateSystem);
                    r._passWahlLage(S, c, i);
                    r._instanzWahlPass("schatten", S);
                    for (const g of r._instanzWahlGruppen())
                        if (g.wahl === "schatten" && g.mesh) wahl.push(["k" + i, g, g.mesh.count]);
                    r._chunkSatzPass(c, false, i, S);
                    if (bunde?.size) {
                        r._werferWahlPass(bunde, S);
                        // die Wahl der Werfer: die ruhenden Werfer und die werfenden Bündel (die Treue vergleicht sie)
                        const ruhen = S.ab.map((o) => o.id).sort((x, y) => x - y);
                        const werfen = [...bunde.values()].filter((bg) => bg.visible).map((bg) => bg.id);
                        wahl.push(["k" + i, "werfer", ruhen.join(",") + "|" + werfen.join(",")]);
                    }
                    r._chunkSatzPass(c, true, -1, S);
                    r._passSichtZurueck(S);
                    r._instanzWahlZurueck(S.wahlSchatten);
                });
                r._passSicht(cam, true);
                return wahl;
            };
            const s = st.chunkSaetze.get("boden");
            // bis jede Mündung im Bild ihre Horizont-Sperre trägt (je Pass höchstens HOEHLEN_HORIZONT_PROBEN frische)
            const reif = () => {
                for (let f = 0; f < 400; f++) {
                    frame();
                    const offen = s.hoehle?.offen ? s.hoehle.offen.length : 0;
                    if (offen === 0) break;
                }
            };
            const L = window.__sichtLinseAn();
            const phase = (n, schritt) => {
                const fs = [];
                L.frame();
                for (let i = 0; i < n; i++) {
                    if (schritt) schritt(i);
                    frame();
                    fs.push(L.frame());
                }
                return fs;
            };
            stelle(0, 0);
            reif();
            L.an();
            // (R) RUHE
            const ruhe = phase(12);
            aus.ruhe = window.__sichtPhase(ruhe, 1);
            aus.ruheKalt = ruhe[0];
            // (T) TREUE: die gehaltene Wahl gegen die frisch gerechnete (die Lage-Erinnerung fällt, ein Frame)
            const stand = (wahl) => {
                const m = new Map();
                for (const satz of st.chunkSaetze.values())
                    for (const [k, a] of satz.abschnitte) m.set(satz.art + "|" + k, a.liste.slice());
                for (const [art, g, n] of wahl)
                    m.set("gruppe:" + (typeof g === "string" ? g : g.mesh.name || g.mesh.id) + "|" + art, n);
                return m;
            };
            const halt = stand(frame());
            if (r._passLagen) r._passLagen.clear();
            const frisch = stand(frame());
            const abw = [];
            let geprueft = 0;
            for (const [k, x] of frisch) {
                const y = halt.get(k);
                geprueft++;
                if (Array.isArray(x)) {
                    const gleich = Array.isArray(y) && y.length === x.length && y.every((z, i) => z === x[i]);
                    if (!gleich) abw.push(`${k}: gehalten ${y ? y.length : 0} Zellen, frisch ${x.length}`);
                } else if (y !== x) abw.push(`${k}: gehalten ${y} Instanzen, frisch ${x}`);
            }
            aus.treue = { geprueft, abweichung: abw.slice(0, 8) };
            // (B) DREHEN 36 × 1°, GEHEN 20 × 1 m
            aus.drehen = window.__sichtPhase(
                phase(36, (i) => stelle(((i + 1) * Math.PI) / 180, 0)),
                0
            );
            aus.gehen = window.__sichtPhase(
                phase(20, (i) => stelle(Math.PI / 5, i + 1)),
                0
            );
            // (D) DIE DREH-TREUE: die Lage des Hauptbilds hält über eine kleine Drehung. Wählt ein Leser mitten in ihr neu (ein
            // Satz mit neuem Stand, eine Gruppe mit neuen Slots), urteilt er vom Blick DIESES Frames — dreht die Kamera danach
            // weiter, darf ihr echtes Frustum nichts tragen, was die gehaltene Wahl nicht zeichnet. Die Folge erzwingt den Fall:
            // die Grenze des Halts aus dem Lauf gemessen (H), Anker bei 0, Drehung auf −0,95 H, jeder Satz und jede Gruppe des
            // Hauptbilds wählt dort neu, Weiterdrehen auf +0,95 H. Gezählt: Zellen (ohne Höhlen-Zellen, ihre Wahrheit prüft
            // gate:hoehlen-sicht) und Instanzen, die das Gesetz ohne jeden Rand im Frustum dieses Blicks trifft und die
            // gehaltene Wahl nicht zeichnet.
            {
                const gen = () => (r._passLagen?.get("haupt") ? r._passLagen.get("haupt").gen : -1);
                const neuAnker = () => {
                    stelle(0, 0);
                    if (r._passLagen) r._passLagen.clear();
                    frame();
                    return gen();
                };
                let g0 = neuAnker();
                let grenze = 0;
                for (let k = 1; k <= 400; k++) {
                    stelle(k * 0.0002, 0);
                    frame();
                    if (gen() !== g0) break;
                    grenze = k * 0.0002;
                }
                const D = { grenze: +grenze.toFixed(4), gehalten: false, loecher: 0, namen: [], geprueft: 0 };
                g0 = neuAnker();
                stelle(-0.95 * grenze, 0);
                frame();
                const gX = gen();
                for (const x of st.chunkSaetze.values()) x.stand++;
                for (const g of r._instanzWahlGruppen())
                    if (g.wahl === "haupt" && g.mesh) g.mesh.instanceMatrix.needsUpdate = true;
                frame();
                const gX2 = gen();
                stelle(0.95 * grenze, 0);
                frame();
                D.gehalten = grenze > 0 && gX === g0 && gX2 === g0 && gen() === g0;
                // die Wahrheit: das Gesetz ohne Rand im Frustum dieses Blicks
                S.m.multiplyMatrices(cam.projectionMatrix, cam.matrixWorldInverse);
                S.frustum.setFromProjectionMatrix(S.m, cam.coordinateSystem);
                const Lw = r._passWahlLage(S, cam, -1);
                const rand = [Lw.rand, Lw.dreh, Lw.halt, Lw.licht];
                Lw.rand = Lw.dreh = Lw.halt = Lw.licht = 0;
                Lw.ax = cam.position.x;
                Lw.ay = cam.position.y;
                Lw.az = cam.position.z;
                const loch = (x) => {
                    D.loecher++;
                    if (D.namen.length < 6) D.namen.push(x);
                };
                try {
                    for (const x of st.chunkSaetze.values()) {
                        // der Wurf-Satz (`bauWurf`, S3 haus: nurWurf) zeichnet nur in den Kaskaden — das Hauptbild hat für
                        // ihn kein Gesetz (gate:chunk-satz (l), gate:schatten-werfer W7)
                        if (x.spec.nurWurf === true) continue;
                        const ab = x.abschnitte.get("haupt");
                        const gezeichnet = new Set(ab ? ab.liste : []);
                        for (const b of x.ordnung) {
                            if (!b.huelle || b.huelle.isEmpty() || !r._passTrifftBox(Lw, b.huelle, 0)) continue;
                            for (const z of b.zellen) {
                                if (z.knoten !== undefined || z.huelle.isEmpty() || !r._passTrifftBox(Lw, z.huelle, 0))
                                    continue;
                                D.geprueft++;
                                if (!gezeichnet.has(z)) loch(String(x.art).split("|")[0] + " Zelle");
                            }
                        }
                    }
                    for (const g of r._instanzWahlGruppen()) {
                        const w = g.wahl === "haupt" && g._wahlJe ? g._wahlJe.get("haupt") : null;
                        if (!w || !g.mesh) continue;
                        const gezeichnet = new Set(w.refs);
                        const fenster = Lw.an && r._instanzFensterGilt(g);
                        for (let j = 0; j < (g.liveCount | 0); j++) {
                            if (!r._instanzBehalten(g, j, Lw, fenster)) continue;
                            D.geprueft++;
                            if (!gezeichnet.has(g.slotRef[j])) loch((g.mesh.name || g.key) + " Instanz");
                        }
                    }
                } finally {
                    [Lw.rand, Lw.dreh, Lw.halt, Lw.licht] = rand;
                }
                aus.drehTreue = D;
            }
            // (I) DIE INSTANZ-TREUE DER KASKADEN: beide Kaskaden ordnen dieselbe Schatten-Gruppe. Ein
            // fremder Schreiber, der die Zahl lässt (Freigeben + Belegen; der echte Weg: der Stufen-Wechsel eines Baums,
            // `_switchArchitectureLOD`), muss JEDE Kaskade neu wählen lassen: keine tote Marke (Slot −1), kein Wurf, kein NaN
            // in einem lebenden Slot, und jeder Werfer, den das Gesetz in der Lage einer Kaskade trifft, steht in ihrer Wahl.
            {
                stelle(0, 0);
                reif();
                const I = { faelle: [], leichen: [], wuerfe: 0, nan: 0, tot: 0, fehlen: 0, geprueft: 0, namen: [] };
                const nenne = (x) => {
                    if (I.namen.length < 6) I.namen.push(x);
                };
                r._instanzWahlPass = function (...a) {
                    try {
                        return P._instanzWahlPass.apply(this, a);
                    } catch (e) {
                        I.wuerfe++;
                        nenne("Wurf: " + (e?.message || e));
                    }
                };
                const pruefe = (g, fall) => {
                    const a = g.mesh.instanceMatrix.array;
                    for (let i = 0; i < (g.liveCount | 0) * 16; i++)
                        if (!Number.isFinite(a[i])) {
                            I.nan++;
                            nenne(fall + ": NaN in " + (g.mesh.name || g.key));
                            break;
                        }
                    kaskaden.forEach((c, k) => {
                        S.m.multiplyMatrices(c.projectionMatrix, c.matrixWorldInverse);
                        S.frustum.setFromProjectionMatrix(S.m, c.coordinateSystem);
                        const Lk = r._passWahlLage(S, c, k);
                        const w = g._wahlJe && g._wahlJe.get("k" + k);
                        const gehalten = new Set(w ? w.refs : []);
                        for (const ref of gehalten)
                            if (!(ref.slot >= 0)) {
                                I.tot++;
                                nenne(`${fall}: k${k} hält eine tote Marke`);
                            }
                        const fenster = Lk.an && r._instanzFensterGilt(g);
                        for (let j = 0; j < (g.liveCount | 0); j++) {
                            if (!r._instanzBehalten(g, j, Lk, fenster)) continue;
                            I.geprueft++;
                            if (!gehalten.has(g.slotRef[j])) {
                                I.fehlen++;
                                nenne(`${fall}: k${k} fehlt ein Werfer`);
                            }
                        }
                    });
                };
                const gruppe = (pass) => {
                    for (const x of r._instanzWahlGruppen()) {
                        const w0 = x._wahlJe && x._wahlJe.get("k0"),
                            w1 = x._wahlJe && x._wahlJe.get("k1");
                        if (x.wahl === "schatten" && x.mesh && w0 && w1 && w1.refs.length > 0 && (x.liveCount | 0) >= 2)
                            if (!pass || pass(x, w1)) return [x, w1];
                    }
                    return [null, null];
                };
                try {
                    frame();
                    frame();
                    // Fall 1: Freigeben + Belegen (die Zahl bleibt), k0 rechnet zuerst
                    {
                        const [g, w1] = gruppe(null);
                        if (g) {
                            const R = w1.refs[0];
                            const m = new T.Matrix4();
                            g.mesh.getMatrixAt(R.slot, m);
                            r._archGroupFree(g, R);
                            const R2 = r._archGroupAlloc(g, null);
                            g.mesh.setMatrixAt(R2.slot, m);
                            g.mesh.instanceMatrix.needsUpdate = true;
                            r._instanzWahlZurueck([g]);
                            frame();
                            pruefe(g, "Freigeben+Belegen");
                            I.faelle.push("Freigeben+Belegen " + (g.mesh.name || g.key));
                        }
                    }
                    // Fall 2: der echte Weg — der Stufen-Wechsel eines Baums, dessen Zwilling die k1-Wahl trägt. Die Gruppe muss
                    // den Wechsel ÜBERLEBEN: CI 37612012391 traf `f:weide|1|1:0#S` mit diesem Baum als einzigem Bewohner — der
                    // Wechsel 1→0 leerte sie, der Null-Renderer räumte sie sofort (`_archGroupLeerDispose`), und die Linse
                    // zählte die Marken der letzten Wahl einer Gruppe, die in keinem Pass mehr zeichnet, als „tot" (lokal
                    // traf die Wahl eine Gruppe mit Nachbarn: grün — die Folge der Gruppen ist ihre Münz-Folge). Eine leere
                    // Gruppe prüft die Klasse nicht: die Gefahr ist eine Kaskade, die über einer LEBENDEN Gruppe ihre alte Wahl
                    // hält. Ein Baum mit Nachbarn in seiner Gruppe zuerst; ein Wechsel, der seine Gruppe leert, ist eine
                    // Leiche — er zählt nicht als Fall, wird genannt, und der nächste Baum wechselt.
                    {
                        const kand = [];
                        for (const x of r._instanzWahlGruppen()) {
                            const w1 = x.wahl === "schatten" && x._wahlJe && x._wahlJe.get("k1");
                            if (!w1 || !x._wahlJe.get("k0") || !x.mesh) continue;
                            for (const R of w1.refs) {
                                const e = (st.architectures || []).find(
                                    (en) =>
                                        en && ((en.instSlots || []).includes(R) || (en.instSlotsBand || []).includes(R))
                                );
                                if (e) kand.push([x, R, e, (x.liveCount | 0) >= 2 ? 0 : 1]);
                            }
                        }
                        kand.sort((a, b) => a[3] - b[3]);
                        let gewechselt = false;
                        for (const [g, R, e] of kand) {
                            if (gewechselt || I.leichen.length >= 4) break;
                            if (!(R.slot >= 0) || g.slotRef[R.slot] !== R || !r._instanzWahlGruppen().has(g)) continue;
                            const lod0 = e._lodLevel | 0;
                            const name = g.mesh.name || g.key;
                            let ok = false;
                            for (const ziel of [0, 1, 2])
                                if (ziel !== lod0 && r._switchArchitectureLOD(e, ziel) && R.slot === -1) {
                                    ok = true;
                                    break;
                                }
                            if (!ok) continue;
                            const fall = "Stufen-Wechsel " + name + " " + lod0 + "→" + (e._lodLevel | 0);
                            if (!r._instanzWahlGruppen().has(g) || !((g.liveCount | 0) > 0)) {
                                I.leichen.push(fall + " leerte die Gruppe");
                                continue;
                            }
                            r._instanzWahlZurueck([g]);
                            frame();
                            pruefe(g, "Stufen-Wechsel");
                            I.faelle.push(fall);
                            gewechselt = true;
                        }
                    }
                } finally {
                    delete r._instanzWahlPass;
                }
                aus.instanzTreue = I;
            }
            // (L) RUHE MIT LAUFENDER SONNE: die Tageslänge des Spiels, 60 Frames je s; das Licht folgt `_applyDayNightToScene`,
            // die Stellvertreter-Kaskaden stehen entlang des Lichts (ihre Mitte ein halbes Feld vor dem Auge)
            stelle(0, 0);
            const dl = st.directionalLight;
            if (dl?.target) {
                const tagLang = 60 * 60 * (st.dayLengthMinutes || r.constructor.DAY_LENGTH_DEFAULT_MINUTES);
                st.timeOfDay = 0.42;
                if (st.world) st.world.timeOfDay = 0.42;
                const mitte = kaskaden.map((c) => new T.Vector3(cam.position.x, boden, cam.position.z - c.right * 0.5));
                const lichtStellen = () => {
                    r._applyDayNightToScene();
                    const L0 = new T.Vector3().subVectors(dl.position, dl.target.position).normalize();
                    kaskaden.forEach((c, i) => {
                        c.position.copy(mitte[i]).addScaledVector(L0, 800);
                        c.lookAt(mitte[i]);
                        c.updateMatrixWorld(true);
                    });
                };
                lichtStellen();
                reif();
                aus.sonne = window.__sichtPhase(
                    phase(120, () => {
                        st.timeOfDay += 1 / tagLang;
                        if (st.world) st.world.timeOfDay = st.timeOfDay;
                        lichtStellen();
                    }),
                    1
                );
            }
            // (S) SCHARF: zurück in die Ruhe, dann der eingeschmuggelte Bruch — die Lage-Erinnerung fällt je Pass
            stelle(0, 0);
            reif();
            const orig = P._passWahlLage;
            r._passWahlLage = function (...a) {
                if (this._passLagen) this._passLagen.clear();
                return orig.apply(this, a);
            };
            try {
                aus.bruch = window.__sichtPhase(phase(6), 1);
            } finally {
                delete r._passWahlLage;
            }
            // (S) SCHARF FÜR DAS NEULEGEN: der eingeschmuggelte Lege-Bruch — jeder ruhende Abschnitt verliert je Pass seine
            // Dicht-Marke und legt sich neu, ohne dass eine Wahl es schuldet; die Linse zählt das Neulegen OHNE Änderung und
            // nennt `dicht:ohne` (die Hülle der Linse am Prototyp bleibt der Weg). Bytes legt er seit K71 keine: der
            // vergleichende Schreiber (`_satzSetze`) findet dieselben Indizes am selben Platz.
            stelle(0, 0);
            reif();
            const dichtNach = r.constructor.CHUNK_SATZ_ABSCHNITT.dichtNach;
            r._chunkSatzRuht = function (s, ab, key) {
                ab.dicht = false;
                if (ab.ruhe < dichtNach) ab.ruhe = dichtNach;
                return P._chunkSatzRuht.call(this, s, ab, key);
            };
            try {
                aus.legeBruch = window.__sichtPhase(phase(6), 1);
            } finally {
                delete r._chunkSatzRuht;
            }
            // (S) SCHARF FÜR DEN SATZ-STAND: der eingeschmuggelte Stand-Bruch — jeder Satz zählt je Frame
            // seinen Stand, ohne dass ein Bereich, ein Anker oder eine Hülle sich ändert (der Cache-Schlüssel churnt, jede Wahl
            // rechnet neu); die Linse zählt die Arbeit OHNE Änderung und nennt `stand:ohne`
            stelle(0, 0);
            reif();
            r._tickChunkSatz = function () {
                for (const x of st.chunkSaetze.values()) x.stand++;
                return P._tickChunkSatz.call(this);
            };
            try {
                aus.standBruch = window.__sichtPhase(phase(6), 1);
            } finally {
                delete r._tickChunkSatz;
            }
            // (A) DAS ATMENDE AUGE: die Kamera und mit ihr das Auge jeder Maske (`uLodAuge` — das Spiel
            // legt es je Frame aus der Kamera) atmen ±1 mm quer, unter dem Halt: keine Lage ändert sich, die Kette arbeitet
            // nicht, und die Linse nennt es weder Kamera noch Blende.
            const lu = st.lodUniforms;
            aus.augeAn = !!(lu?.uLodAuge && lu.uLodMaskOn && lu.uLodMaskOn.value > 0.5);
            if (aus.augeAn) {
                const augeVorher = lu.uLodAuge.value.clone();
                const genHaupt = () => (r._passLagen?.get("haupt") ? r._passLagen.get("haupt").gen : -1);
                try {
                    stelle(0, 0);
                    cam.getWorldPosition(lu.uLodAuge.value);
                    reif();
                    aus.auge = window.__sichtPhase(
                        phase(6, (i) => {
                            stelle(0, 0);
                            cam.position.x += (i % 2 ? 1 : -1) * 0.001;
                            cam.updateMatrixWorld(true);
                            cam.getWorldPosition(lu.uLodAuge.value);
                        }),
                        1
                    );
                    // (A) DIE BLENDE-TREUE: hält die Lage über das wandernde Auge der Maske, trägt die gehaltene Wahl jede
                    // Instanz, deren Maske vom Auge DIESES Frames etwas behält — scharf an einer Instanz auf der Kante ihres
                    // Fensters: der Anker liegt 3 mm jenseits (das Gesetz ohne Rand verwirft sie dort), dann wandert das Auge
                    // 9,5 mm herüber (0,95 × der halbe Halt — die Lage hält, die Maske behält sie). Der Rand des Fensters
                    // (`L.halt` in `_instanzFenster`) trägt sie; ohne ihn (`ohneRand`) fehlt sie — die Probe ist scharf.
                    // Die Kamera steht; nur das Auge der Maske wandert.
                    const lageHaupt = () => {
                        S.m.multiplyMatrices(cam.projectionMatrix, cam.matrixWorldInverse);
                        S.frustum.setFromProjectionMatrix(S.m, cam.coordinateSystem);
                        const Lw = r._passWahlLage(S, cam, -1);
                        return Object.assign({}, Lw, {
                            fr: new T.Frustum().copy(S.frustum),
                            halt: 0,
                            rand: 0,
                            dreh: 0,
                            licht: 0,
                            fit: null,
                            ax: cam.position.x,
                            ay: cam.position.y,
                            az: cam.position.z,
                        });
                    };
                    const kante = () => {
                        stelle(0, 0);
                        cam.getWorldPosition(lu.uLodAuge.value);
                        if (r._passLagen) r._passLagen.clear();
                        frame();
                        const L0 = lageHaupt();
                        const ex = lu.uLodAuge.value.x,
                            ez = lu.uLodAuge.value.z;
                        for (const g of r._instanzWahlGruppen()) {
                            if (g.wahl !== "haupt" || !g.mesh || !(g.liveCount > 0) || !r._instanzFensterGilt(g))
                                continue;
                            const a = g.mesh.instanceMatrix.array,
                                mw = g.mesh.matrixWorld.elements;
                            for (let j = 0; j < g.liveCount; j++) {
                                if (!r._instanzBehalten(g, j, L0, false)) continue;
                                const px = a[j * 16 + 12] + mw[12],
                                    pz = a[j * 16 + 14] + mw[14];
                                const l = Math.hypot(ex - px, ez - pz) || 1;
                                const ux = (ex - px) / l,
                                    uz = (ez - pz) / l;
                                const behaelt = (t) =>
                                    r._instanzFenster(
                                        g,
                                        j,
                                        Object.assign({}, L0, { ex: px + ux * t, ez: pz + uz * t })
                                    );
                                const b0 = behaelt(0);
                                if (b0 === behaelt(2000)) continue;
                                let lo = 0,
                                    hi = 2000;
                                for (let k = 0; k < 60; k++) {
                                    const mitte = 0.5 * (lo + hi);
                                    if (behaelt(mitte) === b0) lo = mitte;
                                    else hi = mitte;
                                }
                                // die Seite, auf der die Maske verwirft: jenseits (eine Stufe behält nah) bzw. diesseits (die
                                // Karte behält fern) der Kante
                                const s = b0 ? 1 : -1;
                                const k0 = b0 ? hi : lo;
                                const tA = k0 + s * 0.003,
                                    tJ = k0 + s * (0.003 - 0.0095);
                                if (tA < 0 || tJ < 0 || behaelt(tA) || !behaelt(tJ)) continue;
                                // die Instanz beim Namen ihrer Slot-Marke (die Wahl ordnet die Slots um)
                                return {
                                    g,
                                    ref: g.slotRef[j],
                                    A: [px + ux * tA, pz + uz * tA],
                                    J: [px + ux * tJ, pz + uz * tJ],
                                    name: `${g.mesh.name || g.key} Slot ${j} (Stufe ${g.wahlStufe}, Kante ${k0.toFixed(3)} m)`,
                                };
                            }
                        }
                        return null;
                    };
                    const blendeTreue = (ohneRand) => {
                        const B = { gehalten: false, loecher: 0, namen: [], geprueft: 0, fall: null, traegt: false };
                        const f = kante();
                        if (!f) return B;
                        B.fall = f.name;
                        if (ohneRand)
                            r._instanzFenster = function (g, i, Lx) {
                                const h = Lx.halt;
                                Lx.halt = 0;
                                try {
                                    return P._instanzFenster.call(this, g, i, Lx);
                                } finally {
                                    Lx.halt = h;
                                }
                            };
                        try {
                            lu.uLodAuge.value.x = f.A[0];
                            lu.uLodAuge.value.z = f.A[1];
                            if (r._passLagen) r._passLagen.clear();
                            frame();
                            const g0 = genHaupt();
                            lu.uLodAuge.value.x = f.J[0];
                            lu.uLodAuge.value.z = f.J[1];
                            frame();
                            B.gehalten = g0 > 0 && genHaupt() === g0;
                        } finally {
                            delete r._instanzFenster;
                        }
                        // die Wahrheit: das Gesetz ohne Rand vom Auge DIESES Frames
                        const Lt = Object.assign(lageHaupt(), { ex: f.J[0], ez: f.J[1] });
                        for (const g of r._instanzWahlGruppen()) {
                            const w = g.wahl === "haupt" && g._wahlJe ? g._wahlJe.get("haupt") : null;
                            if (!w || !g.mesh) continue;
                            const gezeichnet = new Set(w.refs);
                            const fenster = Lt.an && r._instanzFensterGilt(g);
                            for (let j = 0; j < (g.liveCount | 0); j++) {
                                if (!r._instanzBehalten(g, j, Lt, fenster)) continue;
                                B.geprueft++;
                                const kantig = g === f.g && g.slotRef[j] === f.ref;
                                if (kantig) B.traegt = true;
                                if (!gezeichnet.has(g.slotRef[j])) {
                                    B.loecher++;
                                    if (B.namen.length < 6)
                                        B.namen.push(
                                            (g.mesh.name || g.key) +
                                                " Slot " +
                                                j +
                                                (kantig ? " (die Instanz an der Kante)" : "")
                                        );
                                }
                            }
                        }
                        return B;
                    };
                    aus.blendeTreue = blendeTreue(false);
                    aus.blendeTreueOhneRand = blendeTreue(true);
                } finally {
                    delete r._instanzFenster;
                    lu.uLodAuge.value.copy(augeVorher);
                    stelle(0, 0);
                    if (r._passLagen) r._passLagen.clear();
                }
            }
            L.aus();
            // DIE WIESE AM RUF: bei gleicher Lage-Generation prüft `_nahWieseSicht` keine Kachel neu (`_passTrifft`), bei neuer jede
            const nw = st.nahWiese;
            if (!nw || !nw.senken.size || [...nw.kacheln.values()].every((k) => !k.bueschel.length)) aus.code.wieseLiest = "leer";
            else {
                const m = new T.Matrix4().multiplyMatrices(cam.projectionMatrix, cam.matrixWorldInverse);
                const Lg = r._passWahlLage({ frustum: new T.Frustum().setFromProjectionMatrix(m, cam.coordinateSystem) }, cam, -1);
                const trifft = (lage) => {
                    const alt = r._passTrifft, eigen = Object.prototype.hasOwnProperty.call(r, "_passTrifft");
                    let n = 0;
                    r._passTrifft = function (...a) { n++; return alt.apply(this, a); };
                    try { r._nahWieseSicht(cam, lage); } finally { if (eigen) r._passTrifft = alt; else delete r._passTrifft; }
                    return n > 0;
                };
                r._nahWieseSicht(cam, Lg);
                aus.code.wieseLiest = !trifft(Lg) && trifft(Object.assign({}, Lg, { gen: Lg.gen + 1 })) && nw.gen === Lg.gen + 1;
            }
            aus.saetze = [...st.chunkSaetze.values()].map((x) => x.art);
            aus.gruppen = r._instanzWahlGruppen().size;
            const H = s.hoehle;
            aus.hoehle = H
                ? {
                      muendungen: H.muendungen.size,
                      tore: [...H.muendungen].reduce((a, kn) => a + kn.tore.length, 0),
                      bereiche: [...s.bloecke.values()].filter((b) => b.hoehle).length,
                      knoten: [...s.bloecke.values()].reduce((a, b) => a + (b.hoehle ? b.hoehle.knoten.length : 0), 0),
                  }
                : null;
            return aus;
        }, MESS);
    } catch (e) {
        befund = { fehler: e?.message || String(e) };
    }
    await browser.close();
    server.close();
    if (!befund || befund.fehler) {
        console.log("❌ LAUF-FEHLER: " + (befund ? befund.fehler : "kein Befund"));
        process.exit(1);
    }
    const zeile = (n, x) =>
        `  ${n.padEnd(7)} ${x.frames} Frames · Pässe ${x.paesse.mittel} · Arbeit Ø ${x.arbeit.mittel} (Median ${x.arbeit.median}, ` +
        `max ${x.arbeit.max}) · Höhlen-Sicht ${x.hoehlenSicht.mittel} + Licht ${x.hoehlenSichtLicht.mittel} · Abschnitte ` +
        `${x.abschnitt.mittel} · Ecken ${x.ecken.mittel} (Schirm ${x.rect.mittel}, Licht ${x.lichtLage.mittel} Boxen) · _passTrifft ${x.passTrifft.mittel} (Werfer ${x.werferTrifft.mittel}) · ` +
        `Instanzen ${x.instanzBehalten.mittel} · Bytes ${x.bytes.mittel} · neu gelegt ohne Änderung ` +
        `${x.legeOhne ? x.legeOhne.mittel : "?"} · Treffer ${x.treffer.mittel}` +
        (x.taeter && x.taeter.length
            ? `
          neu: ${x.taeter.join(", ")}`
            : "");
    console.log(
        `  Ring ${befund.ring} Chunks nach ${befund.takte} Takten · Sätze ${befund.saetze.join(", ")} · Gruppen der Wahl ${befund.gruppen} · Höhle ` +
            JSON.stringify(befund.hoehle)
    );
    const k = befund.ruheKalt;
    if (k)
        console.log(
            `  kalt    der erste Ruhe-Frame: Arbeit ${k.arbeit} · Ecken ${k.ecken} · Bytes ${k.bytes} · Treffer ${k.trefferSumme}`
        );
    for (const n of ["ruhe", "sonne", "drehen", "gehen", "bruch", "legeBruch", "standBruch", "auge"])
        if (befund[n]) console.log(zeile(n, befund[n]));
    if (befund.auge)
        console.log(
            `  Auge (±1 mm, unter dem Halt): Arbeit in ${befund.auge.arbeitFrames} von ${befund.auge.frames} Frames, ` +
                `Kamera ${befund.auge.kameraFrames}, Blende ${befund.auge.blendeFrames}, ohne Änderung ` +
                `${befund.auge.arbeitOhne.frames}`
        );
    for (const [n, x] of [
        ["Blende-Treue", befund.blendeTreue],
        ["Blende-Treue ohne Rand", befund.blendeTreueOhneRand],
    ])
        if (x)
            console.log(
                `  ${n}: ${x.fall || "keine Kante"} · gehalten ${x.gehalten} · getragen ${x.traegt} · ${x.geprueft} geprüft, ` +
                    `${x.loecher} Löcher ${x.namen.join(", ")}`
            );
    for (const n of ["ruhe", "standBruch"])
        if (befund[n])
            console.log(
                `  ${n}: Arbeit ohne Änderung in ${befund[n].arbeitOhne.frames} von ${befund[n].frames} Frames (Median ` +
                    `${befund[n].arbeitOhne.median}), mit Änderung ${befund[n].aenderungFrames}, Inhalt mit Grund ` +
                    `${JSON.stringify(befund[n].inhaltJe)}, ohne Ursache in ${befund[n].inhaltOhneFrames}: ` +
                    JSON.stringify(befund[n].inhaltOhneJe)
            );
    if (befund.sonne)
        console.log(
            `  Sonne: das Licht drehte in ${befund.sonne.lichtFrames} von ${befund.sonne.frames} Frames (${befund.sonne.sonneRad} rad, ` +
                `Stufe ${befund.sonne.stufe} rad), die Kette arbeitete in ${befund.sonne.arbeitFrames}`
        );
    console.log(`  Treue: ${befund.treue.geprueft} Wahlen verglichen, ${befund.treue.abweichung.length} Abweichungen`);
    if (befund.instanzTreue)
        console.log(
            `  Instanz-Treue: ${befund.instanzTreue.faelle.join(", ")} · ${befund.instanzTreue.geprueft} geprüft · ` +
                `${befund.instanzTreue.wuerfe} Würfe, ${befund.instanzTreue.nan} NaN, ${befund.instanzTreue.tot} tote Marken, ` +
                `${befund.instanzTreue.fehlen} fehlen ${befund.instanzTreue.namen.join(" · ")}` +
                (befund.instanzTreue.leichen && befund.instanzTreue.leichen.length
                    ? ` · ohne Prüfung: ${befund.instanzTreue.leichen.join(" · ")}`
                    : "")
        );
    if (befund.drehTreue)
        console.log(
            `  Dreh-Treue: Grenze ${befund.drehTreue.grenze} rad, gehalten ${befund.drehTreue.gehalten}, ` +
                `${befund.drehTreue.geprueft} geprüft, ${befund.drehTreue.loecher} Löcher ${befund.drehTreue.namen.join(", ")}`
        );
    const v = urteil(befund);
    wandEnde(
        v,
        "SICHT-ARBEIT — in Ruhe rechnet kein Pass neu, jede neue Lage rechnet, die gehaltene Wahl ist die frische."
    );
})();
