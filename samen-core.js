// AnazhRealm — samen-core.js: DER SAMEN-BAUM (Welle SAMEN, 19.11.2026).
//
// Die EINE Quelle jedes Zufalls der Welt (studio-vertrag G2.3: alle Zufälligkeit fließt aus dem Samen): der EINE Generator
// mulberry32 (Tommy Ettinger, 32-bit-Zustand, Schritt γ = 0x6d2b79f5), sein Schritt auf einem Zustand, den der Wirt hält, der
// EINE Text-Hash (FNV-1a über die UTF-16-Einheiten) und der Baum `samenBaum(wurzel)`: je benanntem Pfad ein eigener Strom aus
// dem Samen der Welt — eine Ziehung mehr in einem Pfad verschiebt nie einen anderen. Bis hier lebte mulberry32 fünfzehnmal
// (foundry, phyto ×3, porta, klang, fachwerk, schmiede, Himmel, Lofi, Busch, Wiese ×2, Hülle, Klang-Labor) — bit-gleich, aber
// jede Kopie ein Ort, an dem der Strom auseinanderlaufen konnte.
//
// Geladen VOR jedem Kern in jedem Kontext: cores.manifest.json (erste Zeile — Foundry-Faden und Node-Harness folgen), index.html
// (vor phyto-core, der Stamm liest ihn über die Tags), die Fäden des Gesetzes (`FADEN_QUELLE.kerne`), die Klang-Werkstatt, jede
// Labor-Seite unter worlds/, die Node-Lader (`studioKern`, `fadenScope`, `kernKontext`). Ein Kern, der ihn nicht findet, bricht
// beim Laden beim Namen (kein stiller Ersatz-Strom).
//
// GESETZ-KERN (studio-vertrag §9): STUDIO_VERTRAG = 1 und FUNKTION = 1 — keine Rezepte, keine Gestalt, kein Welt-Zustand außer den
// Strömen, die er aus der Saat ableitet. Nur Ganzzahl-Arithmetik (Math.imul, >>>): auf jeder Plattform dieselben Bits.
(function (root) {
    "use strict";

    const VERSION = 1;
    const GAMMA = 0x6d2b79f5; // der Schritt des Zustands (die Weyl-Folge des Generators)

    // DIE MISCHUNG eines vorgerückten Zustands → [0, 1). Ein Zustand als int32 oder uint32 trägt dieselben 32 Bit (der Kern der
    // Kopien hielt beide Formen, das Ergebnis war dasselbe).
    function mische(a) {
        let t = Math.imul(a ^ (a >>> 15), 1 | a);
        t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
        return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
    }

    // DER STROM eines 32-bit-Starts: jede Zahl wird zuerst ToInt32 (die Form der Kanon-Kopie `a |= 0`), dann je Zug γ weiter.
    function mulberry32(a) {
        return function () {
            a |= 0;
            a = (a + GAMMA) | 0;
            return mische(a);
        };
    }

    // DER SCHRITT AUF FREMDEM ZUSTAND: der Wirt hält den Zustand selbst (`halter[feld]`, uint32 — er reist im Stand, etwa die
    // Harmonie der Lofi-Musik `state.symphony.lofi.rngState`); der Schritt rückt ihn vor und gibt den Zug.
    function mulberrySchritt(halter, feld) {
        const a = (halter[feld] = (halter[feld] + GAMMA) >>> 0);
        return mische(a);
    }

    // DER EINE TEXT-HASH: FNV-1a 32 bit über die UTF-16-Einheiten (charCodeAt) → uint32. Dieselbe Zahl wie der Bau-Same
    // (`_bauSame`), der Strom eines Namens (`_streamRng`) und der Same des Walds (`_forestSeedInt`) sie rechneten.
    function samenHash(text) {
        const s = String(text);
        let h = 2166136261;
        for (let i = 0; i < s.length; i++) h = Math.imul(h ^ s.charCodeAt(i), 16777619);
        return h >>> 0;
    }

    // DER STROM JE (SAME, SALZ): die Vor-Mischung (murmur3-Konstanten) trennt die Teilsysteme eines Baus — jedes Salz sein Strom,
    // die Gestalt bleibt über die Stufen deckungsgleich (L1 zieht dieselben Zahlen, baut nur gröber). Der Start 0 wird γ (der Wächter
    // der Kopien). Leser: fachwerk `ausZufall` (die Ausstattung), schmiede `arenaStrom` (die Arena).
    function salzStrom(seed, salz) {
        let h = (Math.imul((seed >>> 0) ^ 0x9e3779b9, 0x85ebca6b) ^ Math.imul(salz | 0, 0xc2b2ae35)) >>> 0;
        h = (h ^ (h >>> 16)) >>> 0 || GAMMA;
        return mulberry32(h);
    }

    // DER STROM EINES SAMENS (das LCG der Welt, [0, 1)): was ein Akt würfelt — Streuung, Drehung, Größe — und der Bestand des
    // Gaus (leben-core `bestand`, über den Wirt `samen`). Hier im Baum, weil Seite UND Faden ihn lesen: der Stamm
    // (`_samenStrom`) reicht ihn durch, der Gau-Faden (voxel-worker) reicht ihn dem Kern. Bis hier stand er im Stamm
    // (stamm/siedlung-ort.js `_samenStrom`), der Faden kannte ihn nicht.
    function samenStrom(same) {
        let s = Number(same) >>> 0 || 1;
        return function () {
            s = (s * 1664525 + 1013904223) >>> 0;
            return s / 4294967296;
        };
    }

    // DIE SAAT EINES PFADS: der Hash von „<wurzel>:<pfad>" — ein Pfad ist ein NAME, nie eine Stelle in einer Zieh-Reihenfolge.
    function samenSaat(wurzel, pfad) {
        return samenHash(String(wurzel) + ":" + String(pfad));
    }

    // DER SAMEN-BAUM einer Wurzel (der Same einer Welt, eines Orts, eines Programms): `samen(pfad)` ist der Strom des Pfads,
    // `samen.saat(pfad)` seine Saat, `samen.zweig(pfad)` der Baum darunter (`zweig("a")("b")` ist `samen("a:b")`).
    function samenBaum(wurzel) {
        const w = String(wurzel);
        const samen = function (pfad) {
            return mulberry32(samenSaat(w, pfad));
        };
        samen.saat = function (pfad) {
            return samenSaat(w, pfad);
        };
        samen.zweig = function (pfad) {
            return samenBaum(w + ":" + String(pfad));
        };
        return samen;
    }

    // DIE SAAT DER EINGANGS-WELT (Welle saat-argument): die Wurzel der Welt, die ohne genannte Saat geboren wird (brandneuer
    // Spieler, ein Save ohne Saat) — hier EINMAL, weil Seite, Faden und Studio sie lesen. Ihr EINER Leser in der Welt ist das Heil
    // (`_weltMetaHeil`, stamm/speicher-welten.js); kein Leser der Saat ersetzt eine fehlende still durch sie.
    const EINGANG = "anazh-realm-seed";

    root.__samenCore = Object.freeze({
        EINGANG: EINGANG,
        mulberry32: mulberry32,
        mulberrySchritt: mulberrySchritt,
        samenHash: samenHash,
        salzStrom: salzStrom,
        samenStrom: samenStrom,
        samenSaat: samenSaat,
        samenBaum: samenBaum,
        VERSION: VERSION,
        STUDIO_VERTRAG: 1, // G4.3 — EINE Versions-Semantik
        FUNKTION: 1, // studio-vertrag §9 — ein Gesetz-Kern: reine Funktionen, keine Rezepte, keine Gestalt
    });
})(typeof self !== "undefined" ? self : globalThis);
