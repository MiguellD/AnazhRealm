// buche-2.cjs — die Buchung der Meisterkarte 2: aus Richter-Akten werden HEUTE und KERN (Regeln Z1–Z8 in vision/REGELN.md).
//
// Aufruf:  node vision/buche-2.cjs                    liest vision/richter/, schreibt die Karte zurück, baut die Seite
//          node vision/buche-2.cjs --akten DIR --karte DATEI [--trocken]   andere Akten/Karte (Probe); --trocken schreibt nichts
//          node vision/buche-2.cjs --selbsttest        Mutanten gegen die echte Karte im Speicher, schreibt nichts
//          node vision/buche-2.cjs --klassen [--trocken]   das Klassen-Gesetz: schreibt sprossen[].klasse und klasseGrund, dazu
//                                                      vision/vorrat/klasse-offen.json und vision/richter/klassen-unsicher.md
//
// Die Buchung fasst in der Karte NUR an: kriterien[].heute, kriterien[].kern (in Glieder-Leitern dazu heuteSprossen, kernSprossen),
// gruppen[].summe.{heute,kern,kernDazu,anteilHeute,anteilKern} und summe.{…}. Keine Sprosse, kein Soll, keine Klasse, kein Text.
// Der Befehl `--klassen` fasst NUR sprossen[].klasse und sprossen[].klasseGrund an (DAS KLASSEN-GESETZ, unten).
//
// ── DIE AKTE ── vision/richter/<leiter-id>.<sprosse>.json (von Hand) oder <leiter-id>.<sprosse>.<sha8>-<gerät>.json (die Mess-Sitzung,
// vision/richter-akte.cjs: je Gerät und Kopf eine Datei — zwei Geräte schreiben nie in dieselbe). Alle Dateien einer Sprosse werden
// zusammen gelesen; je Gerät und SHA gilt seine jüngste Messung, und jedes Gerät hat seine eigene Folge (DER STAND AUS DEN GERÄTEN, unten).
// Inhalt: EINE Fahrt (Objekt) oder eine Folge von Fahrten (Array). Eine Fahrt:
// {
//   "leiter":  "leben.pflanzen.kraft",          // = Dateiname, sonst Bruch
//   "sprosse": 1,                                // = Dateiname, muss in der Karte stehen, sonst Bruch
//   "sha":     "7f778d44c1…",                    // SHA am Kopf (main), auf dem gefahren wurde (≥ 7 Zeichen)
//   "datum":   "2026-11-14T21:05:00+01:00",      // ISO; ordnet die Fahrten desselben Kopfes (Ratsche Z4; über Köpfe hinweg: KOPF-FOLGE)
//   "soll":    "<wörtlich der Richter der Sprosse aus meisterkarte-2.json>",   // weicht er ab: Bruch
//   "geraete": [                                 // je Gerät eine Messung in DERSELBEN Fahrt
//     { "geraet": "Radeon 890M",
//       "richter": { "wert": <Zahl|Text>, "urteil": "GRÜN" | "ROT" },
//       "preis":   { "stufe": "Ort",   // optional; die Zeile der Preis-Treppe nennt die KARTE (sprosse.klasse, R8) — weicht sie ab: Bruch
//                    "bild_p95_ms": 21.4, "bild_max_ms": 61, "heap_mb": 310, "vram_mb": 104,
//                    "ankunft_kalt_s": 4.2,                       // Lesewert; keine Klasse verlangt ihn (die Ankunft urteilt same.preis.ankunft)
//                    "wachstum_mb_min": 1.1, "ton_aussetzer": 0,   // geprüft, wenn angegeben (das Wachstum nur, wo die Treppe es als Zahl trägt)
//                    "referenz": { "f": 1.08, … },               // die Referenzfahrt derselben Sitzung (DIE LAST AM PREIS, unten)
//                    "urteil": "GRÜN" | "ROT" | "UNGEMESSEN …" } },
//     { "geraet": "GTX 1060", … }
//   ]
// }
// Die Schwellen des Preises liest die Maschine aus preisTreppe der Karte (EINE Quelle) und rechnet das Preis-Urteil selbst nach;
// ein Preis-Urteil, das den eigenen Zahlen widerspricht, bricht laut.
//
// ── DAS URTEIL EINER FAHRT ── (EIN Standardgerät bucht, das zweite ist Nachwache — 18.11., Z7)
//   ROT     : ein Gerät misst den Richter ROT                         → die Sprosse fällt auf 0 (auch der Kern der Brücke, Z4)
//   nichts  : kein Standardgerät (Z7) in der Fahrt                   → hebt nichts, nimmt nichts (Z2, Z7)
//   KERN    : GRÜN an den gemessenen Standardgeräten, aber ein Preis fehlt, ist unvollständig, UNGEMESSEN unter Last oder ROT (R3: fehlende
//             Preis-Zahl ist ROT), oder die Karte nennt für die Sprosse keine klasse („KLASSE FEHLT“, laut im Bericht) → Kern (Z5)
//   PUNKT   : GRÜN und der Preis hält an JEDEM gemessenen Standardgerät → Punkt (Z2)
// ── DER STAND AUS DEN GERÄTEN (18.11.) ── Jedes Gerät hat seine eigene Folge: Ratsche, LAST-FAHRT und KOPF-FOLGE laufen über seine
// Messungen allein (überholt ist eine Messung nur durch eine Messung DESSELBEN Geräts an einem Nachfahren). Der Stand der Sprosse aus
// den jüngsten Urteilen je Gerät: ROT, wenn das jüngste Urteil irgendeines Geräts ROT ist (die Nachwache nimmt, auch gegen GRÜN des
// anderen am selben oder jüngeren Kopf); sonst urteilen die Geräte DESSELBEN Kopfes als EINE Fahrt (das schwächere), über verschiedene
// Köpfe hinweg das beste (PUNKT vor KERN). Bis 18.11. hob ein Gerät nie (Beleg 16.11.: 934 Stations-Paare am selben Kopf, 91,6 % gleiches
// Urteil; 2 781 Messungen ohne Partner am selben Kopf, 75 % der Mess-Arbeit). Der Bericht nennt je Punkt, wer gemessen hat.
// Die Fahrten eines Geräts laufen nach Datum; jede ROT-, KERN- oder PUNKT-Fahrt setzt seinen Stand, „nichts“ lässt ihn (Ratsche Z4) —
// AUSSER der LAST-FAHRT (17.11., der Koordinator: vier Sprossen fielen PUNKT → KERN bei Richter GRÜN an beiden und einem Preis, der nur
// „UNGEMESSEN unter Last“ war): eine KERN-Fahrt, deren Preis an keinem Gerät GEMESSEN ROT ist und an keinem fehlt — jeder Preis, der
// nicht GRÜN ist, heißt „UNGEMESSEN unter Last ×f“ —, nimmt einer PUNKT-Sprosse nichts. Der Punkt hält, der Bericht nennt sie laut
// („Preis am Kopf offen (Last): <kopf> <gerät> ×f“), ihr Kopf zählt für die KOPF-FOLGE als Urteil. Sie HEBT weiter nur bis KERN
// (aus 0 wird KERN, nie PUNKT). Ein gemessen ROTER Preis, eine fehlende oder unvollständige Preis-Zahl (R3), „UNGEMESSEN ohne
// Referenz“ und jedes Richter-ROT nehmen wie bisher. Gesetz: ROT unter Last ist kein Urteil (Referenzfahrt, einseitige Logik) —
// es kann darum auch keinen Punkt nehmen. Unter dem Gesetz der KOPF-FOLGE:
//
// ── DIE KOPF-FOLGE (16.11.) ── Der Stand folgt dem Code, nicht der Uhr. Bis hier setzte eine spätere Messung an ÄLTEREM Code das Urteil
// über neueren (GTX 16.11.: 13:14 am a635bfee Preis ROT, Heap 491 MB → Kern; 14:11 am Vorfahren e4eeee08 Preis GRÜN → hob die Sprosse
// wieder auf PUNKT „am e4eeee08“, an mensch.geist.tag S 1 und mensch.menge.rhythmus S 1). Jetzt:
//   1. Nur Köpfe der main-Linie (Vorfahren von origin/main oder er selbst) setzen den Stand. Eine Fahrt an einem Zweig- oder
//      Kandidaten-Kopf hebt nichts, nimmt nichts und steht laut im Bericht („nicht auf der main-Linie“). Begründung: die Akte trägt
//      per Form den „SHA am Kopf (main)“; ein Zweig ist kein Code, den ein Spieler bekommt, und ohne main gibt es keine Folge, an der
//      „neuer“ messbar wäre (bis 16.11. buchten Zweig-Akten mit — LAGE.md: die Probe-Fehler-Akte am WIP-Kopf c3f23d23).
//   2. Eine Fahrt an einem Kopf, der echter Vorfahre eines Kopfes ist, an dem dieselbe Sprosse schon eine ROT-, KERN- oder PUNKT-Fahrt
//      trägt, setzt nichts („überholt: <kopf> ist Vorfahre von <kopf>“, laut im Bericht).
//   3. Innerhalb eines Kopfes, und zwischen main-Köpfen ohne Vorfahr-Beziehung (zwei gemergte Zweig-Spitzen), bleibt das Datum.
// Die Folge liest git in EINEM Aufruf je Lauf (kopfFolgeAusGit). Ein SHA, den das Repo nicht kennt, bricht laut mit Namen — nie ein
// stiller Rückfall auf das Datum (git fetch origin main hilft).
//
// ── DER EINGANG DER BRÜCKE ── Der Kern von heute (19) stammt aus BRUECKE.md, Tafel „Was die bestehenden Stationen in der neuen
// Karte schon heben“ (alte Stationen an Radeon UND GTX im Bild grün). Er steht unten als BRUECKEN_KERN mit Sprossen-Nummern,
// wird gegen die Zählung der Tafel geprüft (weicht sie ab: Bruch) und ist der Ausgangs-Stand jeder Sprosse vor allen Akten.
//
// ── DIE ZÄHLUNG ──
//   HEUTE (Z3)   Leiter: höchstes n, bis zu dem jede Sprosse 1…n PUNKT ist. Glieder-Leiter: Zahl der PUNKT-Sprossen.
//   KERN  (Z5)   Leiter: Sprossen über HEUTE, die lückenlos weiter mindestens KERN sind (die Seite malt sie als heute+1…heute+kern).
//                Glieder-Leiter: Zahl der KERN-Sprossen. KERN zählt nie, was schon Punkt ist; kernDazu = Σ kern.
//   Anteile (Z1) Kapitel gleich schwer, darin Perspektiven, darin Leitern (heute ÷ Sprossen der Leiter); Prozent auf eine Stelle.
//                Kopplungs-Leitern gehören zur Perspektive ihres ersten Kennungs-Glieds (wie seite-bauen.cjs).
"use strict";
const fs = require("fs");
const path = require("path");
const { execFileSync, spawnSync } = require("child_process");

const KARTE = path.join(__dirname, "meisterkarte-2.json");
const AKTEN = path.join(__dirname, "richter");
const BRUECKE = path.join(__dirname, "BRUECKE.md");
// Z7, Stand 2026: das Standardgerät ist eine Klasse aus zwei Geräten; EINES bucht, das andere ist Nachwache (sein ROT nimmt).
const STANDARD = [
    { name: "Radeon 890M", muster: /890m/i },
    { name: "GTX 1060", muster: /1060/i },
];
// Der Kern der Brücke mit Sprossen (BRUECKE.md, Tafel „Was die bestehenden Stationen … schon heben“). Leitern: 1…n;
// die Glieder-Leiter wetter-welt: Sprosse 1 (Front im Licht, licht.K5) und Sprosse 3 (Nässe, wetter.K2).
const BRUECKEN_KERN = {
    "planet.wasser.kreislauf": [1],
    "leben.pflanzen.jahreslauf": [1],
    "leben.pflanzen.kraft": [1],
    "mensch.sport.koerper": [1],
    "mensch.geist.tag": [1],
    "mensch.stadt.siedlungsnetz": [1],
    "mensch.nahrung.erdbau": [1],
    "mensch.zeit.palimpsest": [1],
    "erleben.spieler.rolle": [1],
    "erleben.sinn.ziele": [1],
    "erleben.klang.raum": [1, 2],
    "erleben.klang.ereignis": [1, 2],
    "erleben.klang.landschaft": [1],
    "same.entfaltung.akte": [1],
    "same.preis.ankunft": [1],
    "planet.kopplung.wetter-welt": [1, 3],
};

const bruch = (msg) => {
    const e = new Error("BUCHE-2 BRUCH: " + msg);
    e.bruch = true;
    throw e;
};
const prozent1 = (x) => Math.round(x * 1000) / 10;

// Die Brücke gegen ihre Tafel prüfen: dieselben Leitern, dieselbe Zahl.
function brueckeLesen(text) {
    const ab = text.indexOf("## Was die bestehenden Stationen");
    if (ab < 0) bruch("BRUECKE.md: Tafel „Was die bestehenden Stationen …“ fehlt");
    const tafel = {};
    for (const z of text.slice(ab).split("\n")) {
        const m = /^\| `([^`]+)` \| (\d+) \| (\d+) \|/.exec(z);
        if (m) tafel[m[1]] = +m[3];
        else if (/^## /.test(z) && !z.startsWith("## Was die bestehenden")) break;
    }
    const a = Object.keys(tafel).sort().join(","),
        b = Object.keys(BRUECKEN_KERN).sort().join(",");
    if (a !== b) bruch(`Brücken-Kern weicht von BRUECKE.md ab: Tafel [${a}] ≠ Maschine [${b}]`);
    for (const id of Object.keys(tafel))
        if (tafel[id] !== BRUECKEN_KERN[id].length) bruch(`Brücken-Kern ${id}: Tafel ${tafel[id]} ≠ Maschine ${BRUECKEN_KERN[id].length}`);
    return BRUECKEN_KERN;
}

// Die Preis-Treppe aus der Karte als Schwellen (EINE Quelle; „wie X“ erbt).
function treppeLesen(karte) {
    const T = {};
    const zahl = (s) => +String(s).replace(",", ".");
    for (const t of karte.preisTreppe) {
        const erb = (feld) => {
            const w = /^wie (.+?)(\s+—.*|,.*)?$/.exec(t[feld]);
            if (!w) return null;
            const k = Object.keys(T).find((n) => n === w[1].trim() || n.startsWith(w[1].trim() + " "));
            if (!k) bruch(`Preis-Treppe ${t.klasse}: „${t[feld]}“ erbt von einer Klasse, die nicht davor steht`);
            return T[k];
        };
        const s = {};
        const bildErbe = erb("bild");
        if (bildErbe) Object.assign(s, { p95: bildErbe.p95, max: bildErbe.max });
        else {
            const p = /p95 ≤ (\d+(?:,\d+)?) ms/.exec(t.bild),
                m = /über (\d+) ms/.exec(t.bild);
            if (!p || !m) bruch(`Preis-Treppe ${t.klasse}: Bild unlesbar`);
            Object.assign(s, { p95: zahl(p[1]), max: zahl(m[1]) });
        }
        // DIE STUFUNG IN DER EIGENEN LEITER (EINE Prüfung für Ankunft und Speicher): „keine Schranke in der Sprosse (gestuft in L a–b)“
        // gilt nur, wenn die Leiter L in der Karte steht und ihre Sprossen a–b die Klasse dieser Zeile tragen — sonst zeigt sie ins Leere.
        const stufung = (was, m) => {
            const L = (karte.gruppen || []).flatMap((g) => g.kriterien).find((k) => k.id === m[1]);
            if (!L) bruch(`Preis-Treppe ${t.klasse}: ${was} ist in „${m[1]}“ gestuft, die Leiter steht nicht in der Karte`);
            const von = +m[2],
                bis = +(m[3] || m[2]);
            for (let nr = von; nr <= bis; nr++) {
                const sp = L.sprossen.find((x) => x.nr === nr);
                if (!sp || sp.klasse !== t.klasse) bruch(`Preis-Treppe ${t.klasse}: ${m[1]} S ${nr} trägt die Klasse „${sp ? sp.klasse : "—"}“, nicht „${t.klasse}“ — die Stufung zeigt ins Leere`);
            }
            return { leiter: m[1], von, bis };
        };
        const STUFUNG = "keine Schranke in der Sprosse \\(gestuft in ([\\w.-]+) (\\d+)(?:–(\\d+))?\\)";
        // DER SPEICHER FOLGT DEM BLICK (23.11., Entscheid des Koordinators nach dem Wort des Schöpfers 16.11. „vielleicht verfehlt der
        // heapdeckel von 400mb das ziel?“ und 23.11. „wir jagen nun einen deckel der unnötig uns vom vorankommen hindert, nutzwert nicht
        // vergessen“): Heap und Wachstum sind Schranke KEINER Sprosse — „Heap und Wachstum: keine Schranke in der Sprosse (gestuft in
        // same.preis.speicher a–b)“; das Gesetz (steht nach 60 s, kein Wachstum mit dem Weg, Bahn zurück = Anfang ± 2 %) urteilt die
        // Leiter. Schranke der Sprosse bleibt der VRAM (hängt am Schirm, jede Akte trägt den Posten). Das Wachstum hatte bis hier in
        // 0 von 3 171 Akten-Preisen einen Schreiber — es fällt offen aus der Sprosse, nie als stille Lücke. Bis 23.11. sperrte die
        // absolute Decke (Ort 400 MB) grüne Sprossen an der Reihe in der Sitzung (planet.zeit.archiv#1 280,8 MB als erste Station,
        // über 400 als dritte) und am Rauschen der Linie (mensch.nahrung.flur#1 407,9 → 394,2 MB ohne Heap-Schnitt).
        const spErbe = erb("speicher");
        if (spErbe) {
            if (spErbe.heap === null) bruch(`Preis-Treppe ${t.klasse}: „${t.speicher}“ erbt eine Stufung — die Stufung nennt jede Klasse selbst`);
            Object.assign(s, { heap: spErbe.heap, vram: spErbe.vram, wachstum: spErbe.wachstum });
        } else {
            const h = /Heap ≤ (\d+(?:,\d+)?) (MB|GB)/.exec(t.speicher),
                hs = new RegExp("Heap und Wachstum: " + STUFUNG).exec(t.speicher),
                v = /VRAM ≤ (\d+) MB/.exec(t.speicher),
                w = /Wachstum ≤ (\d+(?:,\d+)?) MB\/min/.exec(t.speicher);
            if (!v) bruch(`Preis-Treppe ${t.klasse}: Speicher unlesbar (kein „VRAM ≤ N MB“)`);
            s.vram = +v[1];
            if (hs) {
                if (h || w) bruch(`Preis-Treppe ${t.klasse}: der Speicher trägt die Stufung UND eine Heap- oder Wachstums-Zahl — zwei Gesetze an einer Stelle`);
                s.heap = null; // keine Schranke in der Sprosse: Heap und Wachstum urteilt ihre eigene Leiter
                s.wachstum = null;
                Object.defineProperty(s, "speicherLeiter", { value: stufung("der Speicher", hs) });
            } else if (h) {
                s.heap = zahl(h[1]) * (h[2] === "GB" ? 1024 : 1);
                s.wachstum = w ? zahl(w[1]) : 0; // „kein Wachstum mit dem Weg“
            } else bruch(`Preis-Treppe ${t.klasse}: Speicher unlesbar („${t.speicher}“) — weder „Heap ≤ N MB“ noch „Heap und Wachstum: keine Schranke in der Sprosse (gestuft in <Leiter> a–b)“`);
        }
        // DIE ANKUNFT HAT EIN HEIM (23.11., Entscheid des Koordinators nach dem Wort des Schöpfers 18.11. — Sprossen vor Kennzahl — und
        // 19.11. „du schneidest wieder dinge wegen diesem verdammten kaltstart?“): jede Klasse trägt „keine Schranke in der Sprosse (gestuft in same.preis.ankunft a–b)“ — der
        // Anspruch fällt nicht, er steht gemessen in der Leiter same.preis.ankunft, deren Sprossen a–b dieselbe Klasse tragen müssen.
        // Bis 23.11. verlangte die Treppe ab Stadt `ankunft_kalt_s` ≤ 5 s in JEDER Sprosse; die Zahl hatte keinen Schreiber, 956 von
        // 1 718 Sprossen endeten bei Richter GRÜN auf „Preis FEHLT“. Ein Text, der weder die Stufung noch „≤ N s“ trägt, bricht laut.
        const st = new RegExp("^" + STUFUNG + "$").exec(t.ankunft);
        const a = /≤ (\d+(?:,\d+)?) s/.exec(t.ankunft);
        if (st) {
            s.ankunft = null; // keine Schranke in der Sprosse: die Ankunft urteilt ihre eigene Leiter
            Object.defineProperty(s, "ankunftLeiter", { value: stufung("die Ankunft", st) });
        } else if (a) s.ankunft = zahl(a[1]);
        else bruch(`Preis-Treppe ${t.klasse}: Ankunft unlesbar („${t.ankunft}“) — weder „≤ N s“ noch „keine Schranke in der Sprosse (gestuft in <Leiter> a–b)“`);
        T[t.klasse] = s;
    }
    // DIE FASSUNG DER TREPPE (15.11.): das Urteil einer Akte gilt unter der Fassung, unter der sie geschrieben wurde (`preis.treppe`).
    // Kein aufzählbares Feld — die Schlüssel von T bleiben die Klassen.
    Object.defineProperty(T, "fassung", { value: karte.preisFassung || null });
    return T;
}

const URTEIL = new Set(["GRÜN", "ROT"]);
// DIE LAST AM PREIS (der Schöpfer 11.11.: nie Ruhe erzwingen — Referenzfahrt + einseitige Logik). Die Zeit-Zahlen des Preises (Bild p95,
// größtes Bild) hängen an fremder Last, Heap und VRAM nie. Die Akte trägt die Referenz DERSELBEN Sitzung (preis.referenz, der Bericht
// von punkte.cjs referenzBericht vor und nach dem Preis-Lauf); das Band der Ruhe ist das der Punkte-Maschine (EINE Quelle):
//   Zeit-Zahl ≤ Soll                         → GRÜN, egal welche Last (Last macht nie schneller)
//   Zeit-Zahl > Soll, Referenz f ≤ Band      → ROT
//   Zeit-Zahl > Soll, Referenz f > Band      → „UNGEMESSEN unter Last ×f“ — kein Punkt, kein Kern-Verlust, kein Punkt-Verlust (LAST-FAHRT)
//   Zeit-Zahl > Soll, keine Referenz         → „UNGEMESSEN ohne Referenz“ — nie ein Urteil ohne Maßstab
const REFERENZ_RUHE_BAND = require(path.join(__dirname, "..", "meisterkarte-quelle", "punkte", "punkte.cjs")).REFERENZ_RUHE_BAND;
if (!(REFERENZ_RUHE_BAND >= 1)) bruch("punkte.cjs exportiert kein REFERENZ_RUHE_BAND — die Last am Preis hätte keinen Maßstab");
const komma = (x, n) => (+x).toFixed(n).replace(".", ",");
//   Zeit-Zahl > Soll, f > Band, das Ruhe-Tor riss (R.anlauf, punkte.cjs ruheTor) → „UNGEMESSEN im Anlauf der eigenen Welt ×f“ — dieselbe
//     Klasse wie die Last (LAST_WORT), nie „unter Last“: die eigene Welt lief noch an, nichts Fremdes (pm-referenz-nach-anlauf)
function lastVon(R) {
    if (!R || typeof R !== "object") return { ruhig: false, wort: "UNGEMESSEN ohne Referenz" };
    if (R.fehler || !Number.isFinite(R.f)) return { ruhig: false, wort: "UNGEMESSEN ohne Referenz (" + String(R.fehler || "f fehlt").slice(0, 80) + ")" };
    if (R.f <= REFERENZ_RUHE_BAND) return { ruhig: true };
    return { ruhig: false, wort: "UNGEMESSEN " + (R.anlauf ? "im Anlauf der eigenen Welt" : "unter Last") + " ×" + komma(R.f, 2) };
}
// DIE KLASSE DER LAST-FAHRT (EINE Quelle für jede Stelle, die sie liest): unter Last oder im Anlauf der eigenen Welt; `lastKurz` lässt
// „unter Last“ fallen und behält den Anlauf beim Namen
const LAST_WORT = /^UNGEMESSEN (unter Last|im Anlauf der eigenen Welt) ×/;
const lastKurz = (p) => p.replace(/^UNGEMESSEN (unter Last )?/, "");
const treppenZeile = (T, n) => Object.keys(T).find((k) => k === n || k.startsWith(n + " ")); // „Megastadt“ = „Megastadt und Kontinent“
// GEHALTEN, nicht Spitze (REGELN.md „Die Zählweise des Speichers“): Heap und VRAM urteilen nach dem erzwungenen Aufräumen
// (`preis.posten`: was die Welt HÄLT); die Spitze des Stroms ist der Lesewert daneben und urteilt nur, wo die Akte kein Aufräumen
// trägt. Bis 15.11. urteilte die Spitze — die Regel sagte a, die Maschine tat b (GTX 1060 an 4ee205bd: Spitze 457,4 MB gegen
// gehalten 411,0 MB).
const gehaltenVon = (p, k) => (p.posten && typeof p.posten[k] === "number" ? p.posten[k] : p[k]);
// WAS am Preis reißt, beim Namen und mit Zahl (der Bericht der Buchung nennt die Wand, nicht nur ihre Farbe)
function preisGrund(p, T, klasse) {
    const s = p && klasse ? T[treppenZeile(T, klasse)] : null;
    if (!s) return "";
    const aus = [];
    const reisst = (name, wert, soll, einheit, n) => typeof wert === "number" && wert > soll && aus.push(`${name} ${komma(wert, n)} > ${soll} ${einheit}`);
    if (s.heap != null) reisst("Heap", gehaltenVon(p, "heap_mb"), s.heap, "MB", 1);
    reisst("VRAM", gehaltenVon(p, "vram_mb"), s.vram, "MB", 1);
    if (s.wachstum != null) reisst("Wachstum", p.wachstum_mb_min, s.wachstum, "MB/min", 1);
    if (s.ankunft != null) reisst("Ankunft", p.ankunft_kalt_s, s.ankunft, "s", 1);
    reisst("p95", p.bild_p95_ms, s.p95, "ms", 2);
    reisst("größtes Bild", p.bild_max_ms, s.max, "ms", 1);
    return aus.join(" · ");
}
// Preis an einem Gerät: "GRÜN" | "ROT" | "FEHLT" | "UNGEMESSEN …" (unvollständig und ungemessen zählen wie fehlend für den Punkt, R3).
function preisUrteil(p, T, wo, klasse) {
    if (!p) return "FEHLT";
    if (!klasse) return "OHNE-KLASSE"; // die Karte nennt die Zeile der Treppe nicht: kein Preis ist prüfbar
    const zeile = (n) => treppenZeile(T, n);
    const s = T[zeile(klasse)];
    if (!s) bruch(`${wo}: die Klasse „${klasse}“ der Karte steht nicht in der Preis-Treppe`);
    if (p.stufe !== undefined && zeile(p.stufe) !== zeile(klasse)) bruch(`${wo}: die Akte misst den Preis der Stufe „${p.stufe}“, die Karte verlangt „${klasse}“`);
    // Pflicht ist nur, was eine Schranke der Sprosse urteilt: Heap nur mit Heap-Zahl in der Treppe, Ankunft nur mit Ankunfts-Zahl
    const pflicht = ["bild_p95_ms", "bild_max_ms", "vram_mb"].concat(s.heap != null ? ["heap_mb"] : [], s.ankunft != null ? ["ankunft_kalt_s"] : []);
    if (pflicht.some((k) => typeof p[k] !== "number")) return "FEHLT";
    // fest: an fremder Last nie gebunden — urteilen wie gemessen, und zwar das GEHALTENE (`gehaltenVon`); Heap und Wachstum nur, wo die
    // Treppe sie als Schranke der Sprosse trägt (gestuft: Lesewert, das Urteil fällt in same.preis.speicher)
    let fest = (s.heap == null || gehaltenVon(p, "heap_mb") <= s.heap) && gehaltenVon(p, "vram_mb") <= s.vram && (s.ankunft == null || p.ankunft_kalt_s <= s.ankunft);
    if (s.wachstum != null && typeof p.wachstum_mb_min === "number") fest = fest && p.wachstum_mb_min <= s.wachstum;
    if (typeof p.ton_aussetzer === "number") fest = fest && p.ton_aussetzer === 0;
    // die Zeit-Zahlen: über dem Soll nur dann ROT, wenn die Referenz derselben Sitzung im Band der Ruhe lag
    const zeitReisst = !(p.bild_p95_ms <= s.p95 && p.bild_max_ms <= s.max);
    const last = zeitReisst ? lastVon(p.referenz) : { ruhig: true };
    const r = !fest ? "ROT" : !zeitReisst ? "GRÜN" : last.ruhig ? "ROT" : last.wort;
    // Das Urteil in der Akte ist ein Bruch-Zeuge nur unter SEINER Fassung der Treppe: die Zahlen sind die Messung, das Urteil ist
    // eine Funktion aus Zahlen und Treppe — eine Akte älterer Fassung (ohne `treppe`) wird an ihren Zahlen neu geurteilt.
    if (p.urteil !== undefined && p.treppe === T.fassung && p.urteil !== r) bruch(`${wo}: Preis-Urteil „${p.urteil}“ widerspricht den eigenen Zahlen (nachgerechnet ${r})`);
    return r;
}

// eine Fahrt prüfen (Form, Soll) — bricht laut
function fahrtPruefen(f, sprosse, wo) {
    if (!f || typeof f !== "object") bruch(`${wo}: keine Fahrt`);
    if (typeof f.sha !== "string" || f.sha.length < 7) bruch(`${wo}: SHA am Kopf fehlt`);
    if (!f.datum || isNaN(Date.parse(f.datum))) bruch(`${wo}: Datum fehlt oder unlesbar`);
    if (f.soll !== sprosse.richter) bruch(`${wo}: das Soll ist nicht der Richter der Karte (wörtlich: „${sprosse.richter}“)`);
    if (!Array.isArray(f.geraete) || !f.geraete.length) bruch(`${wo}: Geräte-Liste fehlt`);
    for (const g of f.geraete) {
        if (!g.richter || !URTEIL.has(g.richter.urteil)) bruch(`${wo}: Gerät ${g.geraet}: Richter-Urteil muss GRÜN oder ROT sein`);
        if (g.richter.wert === undefined) bruch(`${wo}: Gerät ${g.geraet}: Messwert des Richters fehlt`);
    }
}

// EINE Fahrt (die Geräte EINES SHA, in rechne je Gerät eine) → { u: "ROT" | "NICHTS" | "KERN" | "PUNKT", warum }. EIN Standardgerät
// hebt (Z7, 18.11.): geurteilt wird an den Standardgeräten, die gemessen haben; „NICHTS“ heißt nur noch: kein Standardgerät in der Fahrt.
function fahrtUrteil(f, sprosse, T, wo) {
    fahrtPruefen(f, sprosse, wo);
    const am = "am " + f.sha.slice(0, 8);
    const rot = f.geraete.filter((g) => g.richter.urteil === "ROT");
    if (rot.length) return { u: "ROT", warum: `Richter ROT an ${rot.map((g) => g.geraet).join(" + ")} ${am}` };
    // je Standardgerät die letzte Messung der Fahrt (zwei Läufe derselben Klasse sind EIN Gerät)
    const je = STANDARD.map((S) => f.geraete.filter((g) => S.muster.test(String(g.geraet || ""))).pop()).filter(Boolean);
    if (!je.length) return { u: "NICHTS", warum: `kein Standardgerät (${f.geraete.map((g) => g.geraet).join(" + ")}) ${am} — Z7` };
    const an = je.length === STANDARD.length ? "an beiden Geräten" : "an " + je.map((g) => g.geraet).join(" + ");
    const preise = je.map((g) => preisUrteil(g.preis, T, `${wo} ${g.geraet}`, sprosse.klasse));
    if (preise.every((p) => p === "GRÜN")) return { u: "PUNKT", warum: `Richter GRÜN und Preis (${sprosse.klasse}) GRÜN ${an} ${am}` };
    if (preise.includes("OHNE-KLASSE")) return { u: "KERN", warum: `KLASSE FEHLT in der Karte für diese Sprosse — der Preis ist nicht prüfbar, höchstens Kern ${am}` };
    const mitGrund = (g, i) => {
        const grund = preise[i] === "GRÜN" ? "" : preisGrund(g.preis, T, sprosse.klasse);
        return g.geraet + " " + preise[i] + (grund ? " (" + grund + ")" : "");
    };
    // die LAST-FAHRT (Kopf-Kommentar): jeder Preis, der nicht GRÜN ist, ist „UNGEMESSEN unter Last ×f“ — kein gemessenes ROT, keine fehlende Zahl
    const offen = je.map((g, i) => [g, preise[i]]).filter(([, p]) => p !== "GRÜN");
    const last = offen.every(([, p]) => LAST_WORT.test(p)) ? offen.map(([g, p]) => `${g.geraet} ${lastKurz(p)}`).join(" · ") : null;
    return { u: "KERN", warum: `Richter GRÜN ${an}, Preis ${je.map(mitGrund).join(" · ")} ${am} — Kern (Z5)`, last };
}

// die Fahrten einer Sprosse JE GERÄT: je Gerät und SHA EINE Fahrt (die Messungen verschiedener Akten-Dateien vereint, die jüngste), nach Datum
const geraetKlasse = (name) => {
    const S = STANDARD.find((S) => S.muster.test(String(name || "")));
    return S ? S.name : String(name);
};
// DIE LAST-FAHRT AM SELBEN KOPF (Kopf-Kommentar): preisVon(x) urteilt den Preis einer Geräte-Messung; die jüngere Messung eines Geräts
// mit Richter GRÜN und Preis „UNGEMESSEN unter Last“ ersetzt eine ältere desselben Geräts mit Richter GRÜN und Preis GRÜN nicht — sie
// steht laut in `lastGehalten`. Ohne preisVon (Probe) gilt die jüngste.
// JE GERÄT (18.11.): hier fällt „je Gerät die jüngste“ — die Folge eines Geräts ist seine eigene; ob ein Kopf „überholt“ ist, sagt die
// Kopf-Folge DESSELBEN Geräts (rechne). → [{ geraet, fahrten }], je Fahrt genau EIN Gerät.
function fahrtenJeGeraet(liste, preisVon) {
    const jeG = new Map();
    for (const f of liste)
        for (const x of f.geraete || []) {
            const k = geraetKlasse(x.geraet);
            if (!jeG.has(k)) jeG.set(k, []);
            jeG.get(k).push({ ...f, geraete: [x] });
        }
    return [...jeG.entries()].map(([geraet, l]) => ({ geraet, fahrten: fahrtenJeSha(l, preisVon) }));
}
function fahrtenJeSha(liste, preisVon) {
    const je = new Map();
    for (const f of liste) {
        const k = String(f.sha).slice(0, 8);
        if (!je.has(k)) je.set(k, []);
        je.get(k).push(f);
    }
    const gruen = (x) => x.richter && x.richter.urteil === "GRÜN";
    return [...je.values()]
        .map((teile) => {
            teile.sort((a, b) => Date.parse(a.datum) - Date.parse(b.datum));
            const g = new Map(),
                lastGehalten = [];
            for (const t of teile)
                for (const x of t.geraete || []) {
                    const k = geraetKlasse(x.geraet),
                        vor = g.get(k);
                    if (preisVon && vor && gruen(vor) && gruen(x) && preisVon(vor) === "GRÜN") {
                        const p = preisVon(x);
                        if (LAST_WORT.test(p)) {
                            lastGehalten.push(`${x.geraet} ${lastKurz(p)}`);
                            continue;
                        }
                    }
                    g.set(k, x);
                }
            const letzte = teile[teile.length - 1];
            return { ...letzte, sha: teile.map((t) => t.sha).sort((a, b) => b.length - a.length)[0], geraete: [...g.values()], teile, lastGehalten };
        })
        .sort((a, b) => Date.parse(a.datum) - Date.parse(b.datum));
}

// ── DIE KOPF-FOLGE (Kopf-Kommentar) ── EINE Form, zwei Quellen: git (die Buchung) und eine feste Tafel (Selbsttests ohne Repo).
//   voll(sha)     → der volle SHA; unbekannt: Bruch mit Namen
//   aufMain(voll) → steht der Kopf auf der main-Linie (Vorfahr von MAIN_REF oder er selbst)
//   istAhn(a, b)  → a ist ECHTER Vorfahr von b (a ≠ b)
const MAIN_REF = "origin/main";
function kopfFolge(voll, aufMain, ahnenVon) {
    const memo = new Map();
    return {
        voll,
        aufMain,
        istAhn: (a, b) => {
            if (a === b) return false;
            if (!memo.has(b)) memo.set(b, ahnenVon(b));
            return memo.get(b).has(a);
        },
    };
}
// git, EIN Aufruf im Normalfall: `git log` von MAIN_REF und allen Köpfen der Akten, je Commit Zeit und Eltern; die Spitze von MAIN_REF
// trägt die Dekoration.
// DAS HOLEN (16.11., der Koordinator: der Baum des Zug-Dienstes holt main nie — sein origin/main ist oft alt, Zweig-Köpfe anderer
// Geräte fehlen ganz, und die Buchung jedes Zugs stünde an einem fremden Kopf): fehlt ein SHA lokal, ODER steht ein Kopf nicht auf der
// main-Linie, ist aber jünger als ihre Spitze (dann kann die Spitze alt sein), holt der Lauf EINMAL — main und die fehlenden vollen SHA
// in EINEM `git fetch` (GitHub liefert erreichbare Commits per vollem SHA) — und liest neu. Erst was DANACH fehlt, bricht laut, mit
// Namen, Akte und dem Grund, woran das Holen scheiterte; kein Netz ist ein Bruch, nie das Datum. Ein älterer Zweig-Kopf (Ring
// 2e56cc44) holt nie: der Normalfall bleibt ohne Netz.
function kopfFolgeAusGit(shas, wo = {}, repo = path.join(__dirname, "..")) {
    const kurz = [...new Set(shas.map((s) => String(s).toLowerCase()))].filter((s) => /^[0-9a-f]{7,40}$/.test(s));
    const git = (args, o = {}) =>
        spawnSync("git", ["-C", repo, ...args], { encoding: "utf8", maxBuffer: 1 << 28, env: { ...process.env, GIT_TERMINAL_PROMPT: "0" }, timeout: 180000, ...o });
    const lies = () => {
        const r = git(["log", "--format=%H %ct %P%x09%D", "--decorate-refs=refs/remotes/" + MAIN_REF, MAIN_REF, ...kurz, "--"]);
        if (r.error) bruch(`KOPF-FOLGE: git startet nicht (${r.error.message})`);
        if (r.status !== 0) return { fehler: r.stderr };
        const eltern = new Map(),
            zeit = new Map();
        let spitze = null;
        for (const z of r.stdout.split("\n")) {
            if (!z) continue;
            const [kopf, deko] = z.split("\t");
            const [h, t, ...p] = kopf.split(" ").filter(Boolean);
            eltern.set(h, p);
            zeit.set(h, +t);
            if (deko && deko.split(", ").includes(MAIN_REF)) spitze = h;
        }
        if (!spitze) bruch(`KOPF-FOLGE: die Spitze von ${MAIN_REF} steht nicht in der Ausgabe von git log`);
        return { eltern, zeit, spitze };
    };
    const erreichbarIn = (eltern) => (von) => {
        const seen = new Set([von]),
            stapel = [von];
        while (stapel.length) for (const p of eltern.get(stapel.pop()) || []) if (!seen.has(p)) seen.add(p), stapel.push(p);
        return seen;
    };
    // jünger als die main-Spitze und nicht auf ihr: die Spitze kann alt sein
    const spitzeAlt = (g) => {
        const main = erreichbarIn(g.eltern)(g.spitze);
        return [...g.eltern.keys()].some((h) => kurz.some((s) => h.startsWith(s)) && !main.has(h) && g.zeit.get(h) > g.zeit.get(g.spitze));
    };
    let g = lies(),
        holen = "";
    if (g.fehler || spitzeAlt(g)) {
        // welche SHA fehlen (alle, nicht nur der erste, den git log nennt)
        const c = git(["cat-file", "--batch-check"], { input: kurz.map((s) => s + "^{commit}").join("\n") + "\n" });
        const fehlen = c.status === 0 ? kurz.filter((s, i) => / missing$/.test((c.stdout.split("\n")[i] || "").trim())) : kurz;
        const per = fehlen.filter((s) => s.length === 40); // per SHA holbar sind nur volle
        const f = git(["fetch", "-q", "origin", `+refs/heads/main:refs/remotes/${MAIN_REF}`, ...per]);
        holen = f.error || f.status !== 0
            ? `Holen von origin (main${per.length ? " + " + per.length + " SHA" : ""}) scheiterte: ${String((f.error && f.error.message) || f.stderr).trim().split("\n").pop().slice(0, 160)}`
            : `Holen von origin (main${per.length ? " + " + per.length + " SHA" : ""}) gelang, der SHA fehlt danach weiter`;
        g = lies();
    }
    const unbekannt = (s, grund) =>
        bruch(`KOPF-FOLGE: der SHA ${s} ist im Repo unbekannt${wo[s] ? " (Akten: " + wo[s].join(", ") + ")" : ""}${grund ? " — " + grund : ""}${holen ? " — " + holen : ""}; das Datum ersetzt die Kopf-Folge nie`);
    if (g.fehler) {
        const m = /bad revision '([^']+)'|bad object (\S+)|ambiguous argument '([^']+)'|short object ID (\S+) is ambiguous/.exec(g.fehler || "");
        const s = m && (m[1] || m[2] || m[3] || m[4]);
        if (s === MAIN_REF) bruch(`KOPF-FOLGE: ${MAIN_REF} fehlt im Repo ${repo}${holen ? " — " + holen : ""}`);
        if (s) unbekannt(s.toLowerCase(), String(g.fehler).trim().split("\n")[0]);
        bruch(`KOPF-FOLGE: git log scheitert (${String(g.fehler).trim().slice(0, 200)})`);
    }
    const { eltern, spitze } = g;
    const alle = [...eltern.keys()];
    const vollMemo = new Map();
    const voll = (s) => {
        s = String(s).toLowerCase();
        if (!vollMemo.has(s)) {
            const t = alle.filter((h) => h.startsWith(s));
            if (t.length !== 1) unbekannt(s, t.length ? `${t.length} Commits tragen dieses Präfix` : "nicht unter den gelesenen Köpfen");
            vollMemo.set(s, t[0]);
        }
        return vollMemo.get(s);
    };
    const erreichbar = erreichbarIn(eltern);
    const main = erreichbar(spitze);
    return kopfFolge(voll, (h) => main.has(h), erreichbar);
}
// die feste Tafel: { main: [sha…], zweig: [sha…], ahnen: { <nachfahr>: [<ahn>…] } } (von Hand transitiv)
function kopfFolgeFest({ main = [], zweig = [], ahnen = {} } = {}) {
    const bekannt = [...main, ...zweig];
    const voll = (s) => {
        const t = bekannt.filter((h) => h.startsWith(String(s)) || String(s).startsWith(h));
        if (t.length !== 1) bruch(`KOPF-FOLGE: der SHA ${s} ist im Repo unbekannt (feste Tafel); git fetch origin main — das Datum ersetzt die Kopf-Folge nie`);
        return t[0];
    };
    return kopfFolge(voll, (h) => main.includes(h), (b) => new Set((ahnen[b] || []).map(voll)));
}

const RANG = { NULL: 0, KERN: 1, PUNKT: 2 };

// Rechnet die Karte (in place) aus Akten { "<datei ohne .json>": fahrt | [fahrt, …] } und gibt die Zählung zurück; bericht: je
// Sprosse mit Akten ihr Stand und der Grund der letzten Fahrt, die ihn setzte oder ließ.
const AKTEN_NAME = /^(.+)\.(\d+)(?:\.([0-9a-f]{7,40})-([a-z0-9]+))?$/;
function rechne(karte, akten, kern0, kopf) {
    if (!kopf || typeof kopf.istAhn !== "function") bruch("rechne ohne Kopf-Folge (kopfFolgeAusGit | kopfFolgeFest) — das Datum allein urteilt nie über Köpfe hinweg");
    const T = treppeLesen(karte);
    const leitern = new Map();
    for (const g of karte.gruppen) for (const L of g.kriterien) leitern.set(L.id, L);
    for (const id of Object.keys(kern0)) if (!leitern.has(id)) bruch(`Brücken-Kern nennt die Leiter ${id}, die es nicht gibt`);
    // Stand je Sprosse
    const stand = new Map(); // "id#nr" → NULL|KERN|PUNKT
    for (const [id, nrs] of Object.entries(kern0)) for (const nr of nrs) stand.set(id + "#" + nr, "KERN");
    // die Dateien je Sprosse sammeln: <leiter>.<sprosse>.json oder <leiter>.<sprosse>.<sha8>-<gerät>.json
    const jeSprosse = new Map();
    for (const [datei, fahrten] of Object.entries(akten)) {
        const m = AKTEN_NAME.exec(datei);
        if (!m) bruch(`Akte „${datei}“: Name muss <leiter-id>.<sprosse>[.<sha8>-<gerät>] sein`);
        const [, id, nrT] = m,
            nr = +nrT;
        const L = leitern.get(id);
        if (!L) bruch(`Akte ${datei}: die Leiter ${id} steht nicht in der Karte`);
        const sp = L.sprossen.find((s) => s.nr === nr);
        if (!sp) bruch(`Akte ${datei}: die Leiter ${id} hat keine Sprosse ${nr} (1…${L.sprossen.length})`);
        const liste = Array.isArray(fahrten) ? fahrten : [fahrten];
        liste.forEach((f, i) => {
            if (!f || f.leiter !== id || f.sprosse !== nr) bruch(`Akte ${datei}: Inhalt nennt ${f && f.leiter}.${f && f.sprosse}`);
            if (m[3] && !String(f.sha).startsWith(m[3])) bruch(`Akte ${datei}: der Name nennt ${m[3]}, die Fahrt ${f.sha}`);
            fahrtPruefen(f, sp, `Akte ${datei} Fahrt ${i + 1}`);
            kopf.voll(f.sha); // jeder Kopf muss bekannt sein — sonst Bruch mit Namen, auch wo die Sprosse nur EINEN Kopf trägt
        });
        const k = id + "#" + nr;
        if (!jeSprosse.has(k)) jeSprosse.set(k, { id, nr, sp, liste: [] });
        jeSprosse.get(k).liste.push(...liste);
    }
    const bericht = [];
    const std = STANDARD.map((S) => S.name);
    for (const [k, { id, nr, sp, liste }] of [...jeSprosse.entries()].sort()) {
        const start = stand.get(k) || "NULL";
        const notizen = new Map(); // was nicht setzte, laut: Zweig-Köpfe und überholte Köpfe — Text → Geräte (leer: der Text nennt sie selbst)
        const notiz = (t, g) => (notizen.has(t) || notizen.set(t, new Set()), g && notizen.get(t).add(g));
        // JE GERÄT seine Folge (18.11.): Ratsche, LAST-FAHRT und Kopf-Folge laufen über die Messungen EINES Geräts; überholt ist eine
        // Messung nur durch eine Messung DESSELBEN Geräts an einem Nachfahren — die Nachwache des anderen Geräts bleibt stehen, bis es
        // selbst den jüngeren Code misst.
        const jeGeraet = fahrtenJeGeraet(liste, (x) => preisUrteil(x.preis, T, `Sprosse ${id} S ${nr} ${x.geraet}`, sp.klasse)).map(({ geraet, fahrten }) => {
            const d = { geraet, s: start, warum: "", kopf: null, rot: false };
            const setzer = []; // die vollen SHA der Fahrten dieses Geräts, die seinen Stand schon setzten (ROT, KERN, PUNKT)
            fahrten.forEach((f, i) => {
                const r = fahrtUrteil(f, sp, T, `Sprosse ${id} S ${nr} ${geraet} Fahrt ${i + 1}`); // auch die nicht setzende Fahrt bricht laut
                const h = kopf.voll(f.sha),
                    h8 = h.slice(0, 8);
                if (f.lastGehalten.length) notiz(`Preis am Kopf offen (Last): ${h8} ${f.lastGehalten.join(" · ")} — die GRÜNE Preis-Messung desselben Kopfes hält (Z4)`);
                if (!kopf.aufMain(h)) return void notiz(`nicht auf der main-Linie: ${h8} (${r.u}) setzt nichts`, geraet);
                const neuer = setzer.find((g) => kopf.istAhn(h, g));
                if (neuer) return void notiz(`überholt: ${h8} (${r.u}) ist Vorfahre von ${neuer.slice(0, 8)}`, geraet);
                if (r.u === "KERN" && r.last && d.s === "PUNKT") {
                    // die LAST-FAHRT nimmt dem Punkt nichts (Z4: nur ein gemessenes ROT nimmt); ihr Kopf trägt ein Urteil des Richters
                    setzer.push(h);
                    d.kopf = h;
                    return void notiz(`Preis am Kopf offen (Last): ${h8} ${r.last} — Richter GRÜN, der Punkt hält (Z4)`);
                }
                if (r.u === "NICHTS") return void (d.kopf || (d.warum = r.warum));
                setzer.push(h);
                Object.assign(d, { kopf: h, warum: r.warum, rot: r.u === "ROT", s: r.u === "ROT" ? "NULL" : r.u });
            });
            return d;
        });
        // DER STAND DER SPROSSE aus den jüngsten Urteilen je Gerät (REGELN Z2, Z4, Z7): ein Richter-ROT irgendeines Geräts nimmt; sonst
        // urteilen die Geräte DESSELBEN Kopfes als EINE Fahrt (der Preis muss an jedem gemessenen Gerät halten: das schwächere), und über
        // verschiedene Köpfe hinweg gilt das beste Urteil (PUNKT vor KERN). Ohne Urteil eines Geräts bleibt der Ausgangs-Stand.
        const gesetzt = jeGeraet.filter((d) => d.kopf);
        const rot = gesetzt.filter((d) => d.rot);
        let s = start,
            warum = jeGeraet.map((d) => d.warum).filter(Boolean).join(" · "),
            beide = false;
        if (rot.length) {
            s = "NULL";
            warum = rot.map((d) => d.warum).join(" · ");
        } else if (gesetzt.length) {
            const jeKopf = new Map();
            for (const d of gesetzt) jeKopf.set(d.kopf, (jeKopf.get(d.kopf) || []).concat(d));
            const fahrt = [...jeKopf.values()].map((ds) => ({ ds, r: Math.min(...ds.map((d) => RANG[d.s])) }));
            const best = Math.max(...fahrt.map((x) => x.r));
            s = best === 2 ? "PUNKT" : "KERN";
            const sieger = fahrt.filter((x) => x.r === best).flatMap((x) => x.ds);
            if (s === "PUNKT") {
                const wer = sieger.map((d) => d.geraet);
                beide = std.every((n) => wer.includes(n));
                const am = (d) => d.warum.replace(/^.* (am [0-9a-f]{8})$/, "$1");
                warum =
                    `Richter GRÜN und Preis (${sp.klasse}) GRÜN an ` +
                    (beide && new Set(sieger.map(am)).size === 1 ? `beiden Geräten ${am(sieger[0])}` : (beide ? "beiden Geräten: " : "") + sieger.map((d) => `${d.geraet} ${am(d)}`).join(" · ")) +
                    std.filter((n) => !wer.includes(n)).map((n) => {
                        const d = gesetzt.find((x) => x.geraet === n);
                        return d ? ` · Nachwache ${n}: ${d.warum}` : ` · Nachwache offen: ${n}`;
                    }).join("");
            } else warum = sieger.map((d) => d.warum).join(" · ");
        }
        stand.set(k, s);
        const notiz2 = [...notizen].map(([t, g]) => (g.size ? `${t} (${[...g].join(" + ")})` : t));
        bericht.push({ leiter: id, sprosse: nr, stand: s, warum, notiz: notiz2, beide });
    }
    // Leitern zählen
    for (const L of leitern.values()) {
        const st = L.sprossen.map((s) => RANG[stand.get(L.id + "#" + s.nr) || "NULL"]);
        if (L.zaehlung === "glieder") {
            L.heute = st.filter((r) => r === 2).length;
            L.kern = st.filter((r) => r === 1).length;
            // die Nummern (lesart.kern): in Glieder-Leitern zählt jede für sich, die Seite malt genau sie
            L.heuteSprossen = L.sprossen.filter((s, i) => st[i] === 2).map((s) => s.nr);
            L.kernSprossen = L.sprossen.filter((s, i) => st[i] === 1).map((s) => s.nr);
        } else {
            let h = 0;
            while (h < st.length && st[h] === 2) h++;
            let k = h;
            while (k < st.length && st[k] >= 1) k++;
            L.heute = h;
            L.kern = k - h;
        }
    }
    // Summen und gewichtete Anteile (Z1)
    let H = 0,
        K = 0;
    const kapH = [],
        kapK = [];
    for (const g of karte.gruppen) {
        const pH = [],
            pK = [];
        for (const p of g.perspektiven) {
            const Ls = g.kriterien.filter((L) => L.perspektive === p.id || (L.perspektive === "kopplung" && L.id.split(".")[0] === p.id));
            if (!Ls.length) continue;
            pH.push(Ls.reduce((a, L) => a + L.heute / L.sprossen.length, 0) / Ls.length);
            pK.push(Ls.reduce((a, L) => a + L.kern / L.sprossen.length, 0) / Ls.length);
        }
        const gh = pH.reduce((a, b) => a + b, 0) / pH.length,
            gk = pK.reduce((a, b) => a + b, 0) / pK.length;
        kapH.push(gh);
        kapK.push(gk);
        const sh = g.kriterien.reduce((a, L) => a + L.heute, 0),
            sk = g.kriterien.reduce((a, L) => a + L.kern, 0);
        Object.assign(g.summe, { heute: sh, kern: sk, kernDazu: sk, anteilHeute: prozent1(gh), anteilKern: prozent1(gk) });
        H += sh;
        K += sk;
    }
    const mittel = (a) => a.reduce((x, y) => x + y, 0) / a.length;
    // WER GEMESSEN HAT (Z7, 18.11.): von den gebuchten Punkten die an beiden Standardgeräten; der Rest wartet auf die Nachwache (beide + nachwache = heute)
    const zaehlt = (b) => {
        const L = leitern.get(b.leiter);
        return L.zaehlung === "glieder" ? L.heuteSprossen.includes(b.sprosse) : b.sprosse <= L.heute;
    };
    const beide = bericht.filter((b) => b.stand === "PUNKT" && b.beide && zaehlt(b)).length;
    const nachwache = H - beide;
    Object.assign(karte.summe, { heute: H, kern: K, kernDazu: K, anteilHeute: prozent1(mittel(kapH)), anteilKern: prozent1(mittel(kapK)), beide, nachwache });
    return { heute: H, kern: K, beide, nachwache, sprossen: karte.summe.sprossen, anteil: karte.summe.anteilHeute, stand, bericht };
}

// in vision/richter/ liegen nur Akten: die Tafel-Zeilen der Richter-Fabrik (zeilen-<kapitel>.json) stehen seit der Richter-Falte (19.11.)
// in vision/richter-tafel.json — jeder andere Name bricht laut (rechne, AKTEN_NAME)
function aktenLesen(dir) {
    const akten = {};
    if (!fs.existsSync(dir)) return akten;
    for (const n of fs.readdirSync(dir).sort()) {
        if (!n.endsWith(".json")) continue;
        let inhalt;
        try {
            inhalt = JSON.parse(fs.readFileSync(path.join(dir, n), "utf8"));
        } catch (e) {
            bruch(`Akte ${n}: kein JSON (${e.message})`);
        }
        akten[n.slice(0, -5)] = inhalt;
    }
    return akten;
}

// DIE KLASSE AN DER TAFEL (16.11., vorrat3-klasse): die Tafel vision/richter-tafel.json bindet Stationen an Sprossen; trägt eine
// solche Sprosse in der Karte keine `klasse`, kann ihre Akte höchstens Kern heben („KLASSE FEHLT“). Bis 16.11. wurde die Klasse von
// Hand mit der Tafel-Zeile gesetzt und dabei vergessen (zwei gemessene Sprossen fielen daran). Jeder Lauf nennt darum jede solche
// Zeile beim Namen — kein Abbruch: die Buchung bleibt richtig (Kern), nur das Vergessen wird laut. Seit 19.11. schreibt das
// Klassen-Gesetz (unten, `--klassen`) die Klasse jeder Sprosse; ohne Klasse bleiben nur die ersten Sprossen, die keine Regel fasst, mit
// Grund in vision/vorrat/klasse-offen.json — keine Sprosse darüber (sie tragen bis zum Entscheid den Boden ihrer eigenen Lesart).
const TAFEL = path.join(__dirname, "richter-tafel.json");
function tafelOhneKlasse(karte, tafel) {
    const sprosse = new Map();
    for (const g of karte.gruppen) for (const L of g.kriterien) for (const s of L.sprossen) sprosse.set(L.id + "#" + s.nr, s);
    const aus = [];
    for (const z of (tafel && tafel.zeilen) || []) {
        const s = sprosse.get(z.leiter + "#" + z.sprosse);
        if (!s) aus.push(`${z.station} → ${z.leiter} S ${z.sprosse}: die Sprosse steht nicht in der Karte`);
        else if (!s.klasse) aus.push(`${z.station} → ${z.leiter} S ${z.sprosse} (Richter ${z.richter}): KLASSE FEHLT in der Karte — die Akte hebt höchstens Kern`);
    }
    return aus;
}
const tafelZeilen = (aus) => [...aus.map((a) => "  TAFEL OHNE KLASSE: " + a), `TAFEL: ${aus.length} Zeile(n) ohne Klasse der Sprosse`];

const schreibe = (karte) => JSON.stringify(karte, null, 1) + "\n";

// ───────────────────────── DAS KLASSEN-GESETZ (19.11.) ─────────────────────────
// EINE Funktion Umfang → Zeile der Preis-Treppe (R5, R8). Bis 19.11. stand `klasse` von Hand an 234 von 1 718 Sprossen; jede Leiter
// endete darum an ihrer ersten Sprosse ohne Klasse (vision/richter/klassen-luecke.md). Der Befehl `--klassen` schreibt `klasse` und
// daneben `klasseGrund` in jede Sprosse; die Buchung liest weiter NUR das Feld (kein zweiter Rechen-Weg zur Buch-Zeit).
//   1  TREPPE      die Klasse ist die KLEINSTE Zeile, deren Obergrenze den Umfang fasst. Die Obergrenzen liest das Gesetz aus der
//                  Karte (preisTreppe[].umfang, umfangsKlassen): Ort bis 10² Bauten, 10³ Leiber, 1 km, ≤ 1 km² · Stadt bis 10⁵ Bauten,
//                  10⁶ Menschen, 20 km, ~10³ km² (±10 %) · Megastadt und Kontinent darüber. Die Lücke zwischen zwei Zeilen gehört zur
//                  höheren. Planet und Welten trägt nur ein WORT (Planet, Orbit, Welten, Sonnensystem, Galaxie, Kosmos), nie eine Zahl.
//   2  ERBEN       wo der Umfang nicht wächst (Zeit an einem Ort, Vielfalt, Prüfhärte), erbt die Sprosse die Klasse der Sprosse darunter.
//   3  MONOTON     nie unter der Klasse der Sprosse darunter.
//   4  TRÄGER      eine Zahl hebt nur mit Träger (Bauten, Leiber, km, km²): „10³ Welten“ ist Planet und Welten wegen „Welten“,
//                  „10² Generationen“ erbt. Eine bloße Zahl („10⁴“) zählt den Träger der REIHE — das gezählte Nomen der nächsten
//                  Sprosse darunter (R5: jede weitere Sprosse liegt eine Zehnerpotenz desselben Umfangs höher); nennt die Reihe
//                  keinen Träger der Treppe, zählt sie Leiber (Regel 6).
//   5  HAND        von Hand gesetzte Klassen bleiben (`klasseGrund: "hand"`); alles andere rechnet jeder Lauf neu (idempotent).
//   6  IM ZWEIFEL DIE HÖHERE ZEILE (Entscheid des Koordinators 19.11.; bis dahin nahm die unsichere Sprosse die niedrigste sichere
//                  Lesart). Eine zu niedrige Klasse bucht einen Punkt, dessen Preis nie verdient wurde; eine zu hohe kostet nur Arbeit.
//                  Sechs Gründe heben, die Sprosse trägt dann klasseGrund `zweifel:<Grund>`:
//                    Welt-Wechsel      fremde Welt, EIN fremdes Ziel, auch ohne Welt-Wort            → Planet und Welten
//                    Träger unklar     die Zahl zählt LEIBER (Tiere, Glieder, Körper sind Leiber)     → über 10³ Stadt, ab 10⁷ Megastadt
//                    Region ohne Größe die Tafel fasst „10–10² km²“ in der Zeile Stadt               → Stadt (ein Größen-Wort hebt weiter);
//                                      dazu „Gebiet“, „je Ort“ (Orte jeder Größe), der Fluss als Leib („ist ein Fluss“: sein Lauf)
//                    zwei Zeilen       eine Zählung oder ein Ort-Wort neben einem Maß (km, km²)       → die höhere der beiden
//                    Horizont          „Sicht bis zum Horizont“ ist der Wortlaut der Treppe          → Megastadt und Kontinent;
//                                      dazu „Gebirge“ (Luv und Lee liegen über den Horizont)
//                    Planet-Maß        eine Größe erreicht das Erd-Maß der Tafel                      → Planet und Welten
//                  Zwei Gründe heben NICHT und sind kein offener Fall: Himmel und Feld vom Boden aus bleiben (die Sprosse erbt) ·
//                  der Erd-Schlüssel betrifft die Spalte Bytes, nicht den Umfang (die Klasse folgt dem übrigen Umfang, sonst erbt sie).
//                  DAS GANZE (19.11., zweiter Entscheid): beide heben doch, wo der Umfang selbst das Ganze nennt — „die (bewohnte)
//                  Erde“, „jeder Ort der Erde“, „jedes Biom der Erde“, „Erdgeschichte“ (Planet-Maß) · „ein Planet“ über seine ganze
//                  Geschichte („vom … bis zur …“), „Planet und Stern sein“ (das Wort Planet gilt)       → Planet und Welten.
//                  ZWEI REGELN GEGENEINANDER: es gilt die höhere Zeile — „Fernrohr auf den Mond“ ist Himmel vom Boden (Ort) und ein
//                  Ziel auf einer anderen Welt (Welt-Wechsel)                                         → Planet und Welten.
//                  Im Blatt vision/richter/klassen-unsicher.md steht nur, was KEINE Regel fasst; eine solche ERSTE Sprosse bleibt
//                  leer, mit Grund in klasse-offen.json.
//   7  PREIS-POSE  schweigt der Umfang zur Größe (kein Größen-Wort, kein Maß, keine Zählung der Treppe, kein Zweifel), liest das
//                  Gesetz die Preis-Pose mit: „P · Stadt“ ist die Zeile Stadt (`pose:<Wort>`); nennt die Pose zwei Zeilen
//                  („Dorf und Stadt“), gilt die höhere (Regel 6, zwei Zeilen). Eine Zahl, die als Leiber bis 10³ liest, schweigt nicht.
// klasseGrund: `wort:<Wort>` · `zahl:<Größe>` · `pose:<Wort>` · `zweifel:<Grund>` · `geerbt:S<n>` (`geerbt:R5`: erste Sprosse ohne Maß
// ist EIN Ort) · `hand`.
const KLASSE_OFFEN = path.join(__dirname, "vorrat", "klasse-offen.json");
const KLASSEN_BLATT = path.join(AKTEN, "klassen-unsicher.md");
const [ORT, STADT, MEGA, PLANET] = [0, 1, 2, 3];
const B_ = "A-Za-zÄÖÜäöüß";
const ganz = (kern) => new RegExp(`[${B_}-]*(?:${kern})[${B_}-]*`);
const frei = (kern) => new RegExp(`(?<![${B_}])(?:${kern})(?![${B_}])`);
// die Worte der Tafel der Umfangs-Klassen (R5: gleiche Worte heißen überall dieselbe Größe); `himmel`: das Wort kann auch ein Ding am
// Himmel meinen (Regel 6)
// `wechsel`: EIN fremdes Ziel („Heimat + 1 Fremdwelt“, „EINE Nachbargalaxie als Ziel“) — der Umfang kosmisch, die Pose am Ziel ein Ort:
// zwei Lesarten, im Zweifel die höhere (Regel 6, Welt-Wechsel)
const KLASSEN_WORTE = [
    { rang: PLANET, re: frei("Fremdwelt"), wechsel: true },
    { rang: PLANET, re: frei("Nachbargalaxie"), wechsel: true },
    { rang: PLANET, re: new RegExp(`fremde[rn]? Planet[${B_}]*`) },
    { rang: PLANET, re: ganz("[Pp]lanet"), himmel: true },
    { rang: PLANET, re: ganz("Orbit") },
    { rang: PLANET, re: ganz("Sonnensystem") },
    { rang: PLANET, re: ganz("[Gg]alaxie") },
    { rang: PLANET, re: ganz("Kosmos|kosmisch") },
    { rang: PLANET, re: frei("Alls?") },
    { rang: PLANET, re: ganz("Welten") },
    { rang: PLANET, re: new RegExp(`(?:jede[rn]?|fremde[nr]?) Welt(?![${B_}])`) },
    { rang: PLANET, re: ganz("Fremdwelten") },
    { rang: MEGA, re: ganz("Megast[aä]dt") },
    { rang: MEGA, re: ganz("Megaregion|Hyperstadt|Ökumenopolis") },
    { rang: MEGA, re: ganz("Tokio") },
    { rang: MEGA, re: ganz("Kontinent") },
    { rang: MEGA, re: frei("Reich|Jenseits") },
    { rang: STADT, re: ganz("[Ss]t[aä]dt") },
    { rang: STADT, re: ganz("Metropole") },
    { rang: ORT, re: ganz("Dorf") },
    { rang: ORT, re: frei("Weiler") },
    { rang: ORT, re: frei("(?:1|EIN|ein) Ort") },
];
const HOCH_ZIFFERN = "⁰¹²³⁴⁵⁶⁷⁸⁹";
const hochZahl = (s) => {
    let n = "";
    for (const c of s) if (c !== "⁻") n += HOCH_ZIFFERN.indexOf(c);
    return (s.includes("⁻") ? -1 : 1) * +n;
};
const ZAHL_RE = /(\d+(?: \d{3})*(?:,\d+)?)(?:·10([⁰¹²³⁴⁵⁶⁷⁸⁹⁻]+)|([⁰¹²³⁴⁵⁶⁷⁸⁹⁻]+))?[⁺+]?/g;
const ZAHLWORT_RE = new RegExp(`(Tausende|Millionen|Milliarden)(?![${B_}])`, "g");
const ZAHLWORT = { Tausende: 1e3, Millionen: 1e6, Milliarden: 1e9 };
// jede Zahl eines Umfangs: { wert, roh, bis, hoch (als Zehnerpotenz geschrieben), unten (untere Grenze einer Spanne), faktor, vorWort }
function zahlenIn(u) {
    const aus = [];
    let m;
    ZAHL_RE.lastIndex = 0;
    while ((m = ZAHL_RE.exec(u))) {
        const mant = +m[1].replace(/ /g, "").replace(",", ".");
        const wert = m[2] ? mant * 10 ** hochZahl(m[2]) : m[3] ? mant ** hochZahl(m[3]) : mant;
        const vor = u.slice(0, m.index),
            nach = u.slice(ZAHL_RE.lastIndex);
        const pm = new RegExp(`([${B_}_]+)\\s*(?:auf\\s+)?[≥≤~≈±+−]?\\s*$`).exec(vor);
        aus.push({
            wert,
            roh: m[0],
            von: m.index,
            bis: ZAHL_RE.lastIndex,
            hoch: !!(m[2] || m[3]),
            unten: /^\s*(?:[–…]|bis)\s*[+−≥~≈]?\s*\d/.test(nach),
            faktor: vor.trimEnd().endsWith("×") || /^\s?×/.test(nach),
            vorWort: pm ? pm[1] : "",
        });
    }
    ZAHLWORT_RE.lastIndex = 0;
    while ((m = ZAHLWORT_RE.exec(u))) aus.push({ wert: ZAHLWORT[m[1]], roh: m[1], von: m.index, bis: ZAHLWORT_RE.lastIndex, hoch: true, unten: false, faktor: false, vorWort: "" });
    return aus.sort((a, b) => a.von - b.von);
}
const zahlWert = (text, wo) => {
    const z = zahlenIn(String(text))[0];
    if (!z) bruch(`Klassen-Gesetz: keine Zahl in „${text}“ (${wo})`);
    return z.wert;
};
// die Grenzen der Treppe aus der Karte (EINE Quelle) — unlesbar: Bruch
function klassenGesetz(karte) {
    const namen = karte.preisTreppe.map((t) => t.klasse);
    if (namen.join(" | ") !== "Ort | Stadt | Megastadt und Kontinent | Planet und Welten") bruch(`Klassen-Gesetz: die Preis-Treppe trägt andere Zeilen (${namen.join(" | ")})`);
    const [ort, stadt] = karte.preisTreppe;
    const lies = (text, re, wo) => {
        const m = re.exec(text);
        if (!m) bruch(`Klassen-Gesetz: ${wo} unlesbar in „${text}“`);
        return zahlWert(m[1], wo);
    };
    const tafel = (wort) => karte.umfangsKlassen.find((k) => k.wort.includes(wort)) || bruch(`Klassen-Gesetz: die Tafel umfangsKlassen trägt kein Wort „${wort}“`);
    const dekade = (x) => 10 ** Math.floor(Math.log10(x));
    return {
        namen,
        bauten: [lies(ort.umfang, /bis (\S+) Bauten/, "Ort Bauten"), lies(stadt.umfang, /–(\S+) Bauten/, "Stadt Bauten")],
        leiber: [lies(ort.umfang, /(\S+) Leiber/, "Ort Leiber"), lies(stadt.umfang, /–(\S+) Menschen/, "Stadt Menschen")],
        km: [lies(ort.umfang, /Sicht bis (\S+) km/, "Ort Sicht"), lies(stadt.umfang, /Sicht bis (\S+) km/, "Stadt Sicht")],
        // „~10³ km²“ der Metropole: die Tilde gelesen als ±10 % (das Band von R2) — 32 × 32 km ist das Vorbild der Zeile Stadt
        km2: [lies(tafel("Dorf").mass, /≤ (\S+) km²/, "Dorf km²"), lies(tafel("Metropole").mass, /~(\S+) km²/, "Metropole km²") * 1.1],
        // das Erd-Maß: Leiber ab dem Wert der Tafel (darunter trägt sie die Zeile „Jenseits ≥ 4·10⁸“, die Karte schreibt „Hyperstadt … 10⁹
        // Menschen“), Fläche ab seiner Größenordnung (darunter nennt die Tafel keine Fläche: „jeder Meeresboden ~3,6·10⁸ km²“ ist planetar)
        planet: { leiber: lies(tafel("Planet").menschen, /^(\S+)$/, "Planet Menschen"), km2: dekade(lies(tafel("Planet").mass, /^(\S+) km²/, "Planet km²")) },
    };
}
const stufe = (v, [a, b]) => (v <= a ? ORT : v <= b ? STADT : MEGA);
const LEIBER_RE = /(?:^|-)(?:Leiber|Menschen|Bewohner|Personen|Person|Einwohner|Köpfe|Zuschauer|Kämpfer|Spieler|Mitspieler|Sprecher|Zuhörer|Besucher|Gäste|Fahrgäste|Arbeitende|Teilnehmer|Reisende|Fahrer|Bewaffnete|Bevölkerung)n?$/;
const BAUTEN_RE = /(?:[Bb]auten|Gebäude|Häuser|Bauwerke|[Hh]aus)n?$/;
// gezählt, aber ob als Leib: unklar — sie zählen als Leiber (Regel 6, Träger unklar)
const UNKLAR_RE = /(?:^|-)(?:Wesen|Lebewesen|Individuen|Tiere|Nutztiere|Haustiere|Gesichter|Stimmen|Fahrzeuge|Glieder|Nahe|Körper)n?$/;
// ein Größen-Wort hinter der Zahl ist ein Etikett, kein gezähltes Nomen („10⁴ Stadt“, „10⁶ Region“)
const ETIKETT_RE = /^(?:Stadt|Dorf|Weiler|Region|Megastadt|Großstadt|Kleinstadt|Metropole|Megaregion|Kontinent|Planet)$/;
// der Träger steht VOR der Zahl und ist kein Maß der Treppe
const VOR_DING = new Set(["Raffer", "Zeitlupe", "Volumen", "U_eff", "Zoom"]);
const EINHEIT_RE = new RegExp(`^\\s?(km²|km|m²|m³|m|ha)(?![${B_}²³])`);
const OHNE_MASS_RE = new RegExp(
    `^\\s?(?:Jahren?|Jahr|J|a|ka|Ma|Ga|d|h|min|s|Tagen?|Tag|Wochen|Monaten?|Stunden?|Minuten|Spieljahren?|Spieljahr|Spieltagen?|Spielstunden|Spielminuten|Übungsstunden|Generationen|Jahrhunderten?|Jahrtausenden?|Jahrzehnten?|Sitzungen|kg|t|g|mg|bar|K|W|dB|cd|Hz|kB|MB|%|µm|mm|cm|Lj|Geschosse|Etagen|Erdmassen)(?![${B_}])`
);
// eine Fläche ohne Größe: Region, Land, Landschaft, Gebiet („Herrschaftsgebiet“), eine Stichprobe „je Ort“ über Orte jeder Größe und der
// Fluss als Leib („der Spieler ist ein Fluss“: sein Lauf über Minuten) — „Flut …, ein Fluss“ an EINEM Ufer bleibt ein Ort
const REGION_RE = new RegExp(`(?<![${B_}-])(?:Region(?:en)?|Landes|Landschaft|Gebiet(?:e|es|en)?|je Ort|ist ein Fluss)(?![${B_}])|[${B_}]+gebiet(?:e|es|en)?(?![${B_}])`);
// ein Gebirge liegt mit Luv und Lee über den Horizont (Regel 6, Horizont)
const GEBIRGE_RE = new RegExp(`(?<![${B_}])Gebirge(?![${B_}])`);
// DAS GANZE (Regel 6): der Umfang nennt die Erde selbst, nicht einen Ort der Erd-Saat
const GANZE_ERDE_RE = new RegExp(`(?<!unter )(?<![${B_}])[Dd]ie (?:ganze |bewohnte )?Erde(?![${B_}])|(?<![${B_}])[Jj]ede[rs]? [^,;()]*der Erde(?![${B_}])|Erdgeschichte`);
// DAS GANZE (Regel 6): der Planet über seine ganze Geschichte („vom Magma-Ozean … bis zur sterbenden Sonne“) oder als Leib des Spielers
// („Planet und Stern sein“) ist kein Ding am Himmel
const GANZER_PLANET_RE = new RegExp(`vom [^,;]+ bis zu[rm]? |Planet[${B_}]*(?: und [${B_}-]+)? sein(?![${B_}])`);
// die Erde als Vergleich („mehr Disparität als die Erde“, „die größte tägliche Tierwanderung der Erde“) ist kein Umfang
const ERD_VERGLEICH_RE = new RegExp(`als die Erde|(?:größte|höchste|längste|tiefste|älteste)[^,;()]* der Erde`, "g");
// Leiber ohne Zahl („Umstehende einer Szene“, „Paar“): sie heben nichts, nennen aber den Träger der Reihe
// „10⁴ im Protest“, „10⁵ im Stadion“: die bloße Zahl zählt, was an einem Ort versammelt ist
const MENGE_ORT_RE = new RegExp(`^ (?:im|am|in einer|in der|auf dem) [${B_}-]+|^ unterwegs`);
const MENGE_RE =new RegExp(`(?<![${B_}-])(?:Leiber|Menschen|Bewohner|Personen|Einwohner|Zuschauer|Umstehende|Paar)(?![${B_}-])`);
const HORIZONT_RE = /bis zum Horizont|Horizont \d/;
const ERD_RE = new RegExp(`Erd-Saat|Erdgeschichte|(?<!unter )(?<![${B_}])[Dd](?:er|ie) (?:ganze |bewohnte )?Erde(?![${B_}])`);
// ein Welt-Wechsel ohne Welt-Wort; dazu die Welt mit anderem Gesetz („EINE Konstante anders“), die Spanne der Schwere („g 0,3–3“),
// „jenseits der Erde“ und der Mond als Ziel („Kolonie auf Mond“, „Fernrohr auf den Mond“: zwei Regeln gegeneinander, die höhere gilt)
const WELTWECHSEL_RE = new RegExp(
    `[Ff]remd(?!es Gerät)[${B_}-]*(?: [${B_}-]+)?|(?<![${B_}])Mars(?![${B_}])|Asteroid[${B_}-]*|im freien Raum|auf (?:den |dem )?Mond|eines Systems|Gasriese[${B_}-]*|Konstanten? anders|(?<![${B_}])g \\d[\\d,]*–\\d[\\d,]*|jenseits der Erde`
);
// die Leiter der Erd-Saat: ihr benannter Zweifel an der ersten Sprosse ist der Erd-Schlüssel (Spalte Bytes), auch wo Umfang und Preis ihn
// nicht nennen („1 Ort, 1 Ereignis-Typ“ der Leiter same.kopplung.erdsaat)
const ERD_LEITER_RE = /(?:^|[.-])erd(?:e|saat)(?:$|[.-])/;
const HIMMEL_RE = new RegExp(`(?<![${B_}])(?:Stern|Sterne|Sternen|Sonne|Mond|Kompass)(?![${B_}])|Dipol|(?<![${B_}])mag \\d`);
const REISE_RE = /reisbar|ansteuerbar|anfliegbar|Landung|→|Reise|Abstieg/;

// EINE Sprosse lesen: { sicher: { rang, grund } | null, zweifel: { rang, grund: "zweifel:…" } | null (die höhere Lesart, Regel 6),
//   bleibt: [Grund, der nach Regel 6 nicht hebt], erd, fraglich: [{ rang, grund }] (was KEINE Regel fasst), traeger: { art, wort, nr } | null }
// `reihe`: die Träger der Sprossen darunter (für die bloße Zahl, Regel 4) · `erste`: die erste Sprosse der Leiter (R5: EIN Ort, EIN Ding)
function umfangLesen(G, s, reihe = [], erste = false) {
    const u = String(s.umfang || "");
    const sig = [],
        zw = [],
        bleibt = [],
        frag = [];
    const Z = (rang, art, was) => zw.push({ rang, grund: `zweifel:${art}${was ? ` „${was}“` : ""}` });
    let traeger = null,
        bloss = false; // eine bloße Zahl stand schon in diesem Umfang
    let uWort = u; // der Text ohne die Worte EINES fremden Ziels
    for (const W of KLASSEN_WORTE) {
        const m = W.re.exec(uWort);
        if (!m) continue;
        if (W.wechsel) {
            Z(W.rang, "Welt-Wechsel", m[0]);
            uWort = uWort.slice(0, m.index) + " ".repeat(m[0].length) + uWort.slice(m.index + m[0].length);
        } else sig.push({ rang: W.rang, grund: "wort:" + m[0], decke: W.rang === ORT, himmel: !!W.himmel });
    }
    const hatPlanetWort = sig.some((x) => x.rang === PLANET);
    const ausReihe = [...reihe].reverse().find(Boolean) || null;
    const leibInReihe = [...reihe].reverse().find((t) => t && t.art !== "ding") || null;
    const planetMass = (z, text) => z.wert >= G.planet.leiber && !hatPlanetWort && Z(PLANET, "Planet-Maß", text);
    const zaehlung = (art, z, text) => {
        sig.push({ rang: stufe(z.wert, G[art]), grund: "zahl:" + text, decke: true, zahl: true });
        if (art === "leiber") planetMass(z, text);
    };
    // Träger unklar: die Zahl zählt Leiber (Regel 6) — bis 10³ ist das ein Ort und hebt nichts, aber der Umfang hat gesprochen (Regel 7)
    let leiberOrt = false;
    const alsLeiber = (z, text) => (z.wert > G.leiber[0] ? (Z(stufe(z.wert, G.leiber), "Träger unklar", text), planetMass(z, text)) : (leiberOrt = true));
    for (const z of zahlenIn(u)) {
        const nach = u.slice(z.bis);
        let m;
        if ((m = /^ × (\d+) km(?![²/A-Za-z])/.exec(nach))) {
            sig.push({ rang: stufe(z.wert * +m[1], G.km2), grund: `zahl:${z.roh} × ${m[1]} km`, mass: true, zahl: true });
            continue;
        }
        if (z.faktor || z.unten || /^\s?\//.test(nach)) continue; // ein Faktor, die untere Grenze einer Spanne, eine Rate („10⁵/Tag“)
        if ((m = /^-(km|m)-/.exec(nach)) || (m = EINHEIT_RE.exec(nach))) {
            if (nach[m[0].length] === "/") continue; // „km/h“
            const e = m[1],
                text = `${z.roh} ${e}`;
            if (e === "km" || e === "m") sig.push({ rang: stufe(e === "km" ? z.wert : z.wert / 1e3, G.km), grund: "zahl:" + text, mass: true, zahl: true });
            else if (e !== "m³") {
                const km2 = e === "km²" ? z.wert : e === "ha" ? z.wert / 100 : z.wert / 1e6;
                sig.push({ rang: stufe(km2, G.km2), grund: "zahl:" + text, mass: true, zahl: true });
                if (km2 >= G.planet.km2 && !hatPlanetWort) Z(PLANET, "Planet-Maß", text);
            }
            continue;
        }
        if (OHNE_MASS_RE.test(nach)) continue; // Zeit, Masse, Druck: kein Maß der Treppe
        // das gezählte Nomen: Adjektive überspringen („10⁶ lebende Arten“), eine Präposition beendet („10⁴ im Bild“)
        let rest = nach,
            wort = null;
        for (let i = 0; i < 3; i++) {
            const t = new RegExp(`^\\s*-?([${B_}_][${B_}_-]*)`).exec(rest);
            if (!t) break;
            rest = rest.slice(t[0].length);
            if (!/^[a-zäöü]/.test(t[1])) {
                wort = t[1];
                break;
            }
            if (!/e$/.test(t[1])) break;
        }
        if (wort && rest.startsWith("/")) continue; // „10⁶ Menschen/km²“, „10³ Wege/h“
        const text = wort ? `${z.roh} ${wort}` : z.roh;
        // der Träger der Reihe ist das Nomen an der Zahl der Reihe: steht eine bloße Zahl davor („10³ (Stadt, 300 Häuser)“), nennt das
        // spätere Nomen ein Beiwerk, nicht die Reihe
        const merke = (art) => traeger || bloss || (traeger = { art, wort, nr: s.nr });
        if (VOR_DING.has(z.vorWort)) {
            traeger = traeger || { art: "ding", wort: z.vorWort, nr: s.nr };
        } else if (wort && LEIBER_RE.test(wort)) {
            merke("leiber");
            zaehlung("leiber", z, text);
        } else if (wort && BAUTEN_RE.test(wort)) {
            merke("bauten");
            zaehlung("bauten", z, text);
        } else if (wort && UNKLAR_RE.test(wort)) {
            merke("unklar");
            alsLeiber(z, text);
        } else if (wort && !ETIKETT_RE.test(wort) && /[enrsa]$/.test(wort)) {
            merke("ding"); // ein gezähltes Nomen ohne Maß der Treppe („10² Generationen“): hebt nicht
            // der einzige Zweifel ohne Regel: gezählte Sterne nennen weder Boden noch Reise
            if (/^Sternen?$/.test(wort) && z.wert >= 1e6 && !hatPlanetWort) frag.push({ rang: PLANET, grund: `Träger Sterne: „${text}“ — Himmel vom Boden aus oder Reise?` });
        } else if (z.hoch) {
            // die bloße Zahl: der Träger der Reihe (Regel 4) — nennt die Reihe keinen Träger der Treppe (kein Nomen, zwei Träger, Körper,
            // eine Menge an einem Ort, „über 10⁸“), zählt die Zahl Leiber (Regel 6)
            bloss = true;
            const inMenge = /^(?:in|von|mit|zwischen|über|unter)$/.test(z.vorWort);
            if (ausReihe && (ausReihe.art === "leiber" || ausReihe.art === "bauten")) zaehlung(ausReihe.art, z, `${z.roh} (Reihe ${ausReihe.wort} ab S${ausReihe.nr})`);
            else if (!ausReihe || inMenge || ausReihe.art === "unklar" || leibInReihe) alsLeiber(z, z.roh);
            else if (!traeger && (m = MENGE_ORT_RE.exec(nach))) alsLeiber(z, `${z.roh}${m[0]}`);
        }
    }
    const hoechst = (a) => a.reduce((b, x) => (!b || x.rang > b.rang ? x : b), null);
    let sicher = hoechst(sig);
    // zwei Zeilen zugleich: eine Zählung oder ein Ort-Wort deckelt, ein Maß (km, km²) reicht höher — im Zweifel das Maß (Regel 6)
    const decke = hoechst(sig.filter((x) => x.decke)),
        mass = hoechst(sig.filter((x) => x.mass)),
        ohneMass = hoechst(sig.filter((x) => !x.mass));
    if (decke && mass && mass.rang > ohneMass.rang) {
        Z(mass.rang, "zwei Zeilen", `${decke.grund.slice(5)}“ gegen „${mass.grund.slice(5)}`);
        sicher = ohneMass;
    }
    // Himmel und Feld vom Boden aus bleiben Ort: steht „Planet“ neben einem Himmels- oder Feld-Wort und nennt nichts die Reise, hebt das
    // Wort nicht (R5: EIN Ort — „1 Stern, 1 Planet, 1 Mond“, „Kompass auf einem Dipol-Planeten“); über der ersten Sprosse erbt sie (Regel 6).
    // Nennt der Umfang den Planeten als das Ganze (seine ganze Geschichte, der Spieler IST der Planet), gilt das Wort.
    if (sicher && sicher.himmel && HIMMEL_RE.test(u) && !REISE_RE.test(u) && !GANZER_PLANET_RE.test(u) && !sig.some((x) => x.rang === PLANET && !x.himmel)) {
        if (!erste) bleibt.push(`Himmel vom Boden: „${sicher.grund.slice(5)}“ neben „${HIMMEL_RE.exec(u)[0]}“`);
        sicher = hoechst(sig.filter((x) => !x.himmel && !(x.mass && decke && x.rang > ohneMass.rang)));
    }
    if (!traeger && MENGE_RE.test(u)) traeger = { art: "leiber", wort: MENGE_RE.exec(u)[0], nr: s.nr };
    let hoch = sicher ? sicher.rang : -1;
    let m;
    // der Erd-Schlüssel betrifft die Spalte Bytes, nicht den Umfang: er hebt nicht (Regel 6) — außer der Umfang nennt die Erde als das Ganze
    const uErde = u.replace(ERD_VERGLEICH_RE, "");
    const ganz = GANZE_ERDE_RE.exec(uErde);
    const erd = ERD_RE.test(uErde) || /Schlüssel/.test(String(s.preis || ""));
    if (ganz && hoch < PLANET) Z(PLANET, "Planet-Maß", ganz[0]);
    else if (erd) bleibt.push("Erd-Schlüssel (Spalte Bytes)");
    // zwei Regeln gegeneinander (Himmel vom Boden gegen Welt-Wechsel): der Zweifel hebt, die höhere Zeile gilt
    if (hoch < PLANET && (m = WELTWECHSEL_RE.exec(uWort))) Z(PLANET, "Welt-Wechsel", m[0].trim());
    if (hoch < MEGA && HORIZONT_RE.test(u)) Z(MEGA, "Horizont");
    else if (hoch < MEGA && GEBIRGE_RE.test(u)) Z(MEGA, "Horizont", "Gebirge");
    if (hoch < STADT && (m = REGION_RE.exec(u)) && !sig.some((x) => x.zahl)) Z(STADT, "Region ohne Größe", m[0]);
    // PREIS-POSE (Regel 7): der Umfang schweigt zur Größe — die Pose spricht; zwei Zeilen in der Pose: die höhere (Regel 6)
    if (!sig.length && !zw.length && !frag.length && !leiberOrt) {
        const pose = KLASSEN_WORTE.filter((W) => !W.wechsel)
            .map((W) => ({ rang: W.rang, m: W.re.exec(String(s.preis || "")) }))
            .filter((x) => x.m);
        const oben = hoechst(pose),
            unten = pose.find((x) => oben && x.rang < oben.rang);
        if (oben && oben.rang > ORT) {
            if (unten) Z(oben.rang, "zwei Zeilen", `Pose ${unten.m[0]}“ gegen „Pose ${oben.m[0]}`);
            else ((sicher = { rang: oben.rang, grund: "pose:" + oben.m[0] }), (hoch = oben.rang));
        }
    }
    const zweifel = hoechst(zw.filter((x) => x.rang > hoch));
    return { sicher, zweifel, bleibt, erd, fraglich: frag.filter((f) => f.rang > Math.max(hoch, zweifel ? zweifel.rang : -1)), traeger };
}

const istHand = (s) => !!s.klasse && (s.klasseGrund === undefined || s.klasseGrund === "hand");
// die ganze Karte rechnen (schreibt nichts): je Sprosse { klasse | null, grund }, dazu Blatt-Stoff und der Vergleich mit der Hand
function klassenRechnen(karte, offenDatei) {
    const G = klassenGesetz(karte);
    const R = (name) => {
        const r = G.namen.indexOf(name);
        if (r < 0) bruch(`Klassen-Gesetz: die Klasse „${name}“ steht nicht in der Preis-Treppe`);
        return r;
    };
    const offenAlt = new Map(((offenDatei && offenDatei.offen) || []).map((o) => [o.leiter + "#" + o.sprosse, o]));
    // was ein früherer Lauf löste (klasse-offen.json aufgeloest, quelle "gesetz"): der Grund, der offen stand, bleibt dort erhalten —
    // der Lauf rechnet daraus dieselbe Zeile wieder (idempotent), und fällt die Lesart, steht die Sprosse mit ihrem alten Grund wieder offen
    const geloestAlt = new Map(((offenDatei && offenDatei.aufgeloest) || []).filter((a) => a.quelle === "gesetz").map((a) => [a.leiter + "#" + a.sprosse, a]));
    // zweifel: je Grund die Zahl der Sprossen, die die höhere Zeile tragen · bleibt: was nach Regel 6 nicht hob und unter Planet und Welten steht
    const aus = { G, je: new Map(), unsicher: [], offen: [], geloest: [], zweifel: {}, bleibt: [], hand: { gleich: 0, abweichung: [], enthaltung: [] }, monotonie: [], verteilung: {}, reihe: 0 };
    const zweifelArt = (grund) => /^zweifel:(Welt-Wechsel|Träger unklar|Region ohne Größe|zwei Zeilen|Horizont|Planet-Maß)/.exec(grund)[1];
    for (const g of karte.gruppen) {
        const V = (aus.verteilung[g.id] = { leer: 0 });
        for (const n of G.namen) V[n] = 0;
        for (const L of g.kriterien) {
            const reihe = [];
            let unten = null; // { rang, offen: die Kette erbt von einer offenen ersten Sprosse, nr }
            let haengt = null; // der Eintrag der offenen ersten Sprosse, an dem die Kette hängt
            L.sprossen.forEach((s, i) => {
                const k = L.id + "#" + s.nr;
                const lies = umfangLesen(G, s, reihe, i === 0);
                reihe.push(lies.traeger);
                const eigen = lies.sicher,
                    zw = lies.zweifel; // die höhere Lesart (Regel 6), immer über der eigenen
                const eigenRang = eigen ? eigen.rang : ORT;
                let klasse = null,
                    grund = null,
                    rang = null;
                if (istHand(s)) {
                    rang = R(s.klasse);
                    klasse = s.klasse;
                    grund = "hand";
                    // was das Gesetz hier geschrieben hätte
                    const gesetz = i === 0 ? (lies.fraglich.length ? null : zw ? zw.rang : eigenRang) : Math.max(unten ? unten.rang : ORT, zw ? zw.rang : eigenRang);
                    const zeile = { leiter: L.id, sprosse: s.nr, umfang: s.umfang, hand: s.klasse, gesetz: gesetz == null ? null : G.namen[gesetz], grund: gesetz == null ? lies.fraglich.map((f) => f.grund).join(" · ") : zw && zw.rang === gesetz ? zw.grund : eigen && eigen.rang === gesetz ? eigen.grund : i ? "geerbt:S" + L.sprossen[i - 1].nr : "geerbt:R5" };
                    if (gesetz == null) aus.hand.enthaltung.push(zeile);
                    else if (gesetz === rang) aus.hand.gleich++;
                    else aus.hand.abweichung.push(zeile);
                    if (unten && !unten.offen && rang < unten.rang) aus.monotonie.push(`${L.id} S ${s.nr} „${s.klasse}“ (hand) steht unter S ${unten.nr} „${G.namen[unten.rang]}“`);
                    haengt = null;
                    unten = { rang, offen: false, nr: s.nr };
                } else if (i === 0) {
                    const war = geloestAlt.get(k);
                    const alt = offenAlt.get(k) || (war && { leiter: L.id, sprosse: s.nr, umfang: s.umfang, preis: s.preis, richter: s.richter, grund: war.offen });
                    // der benannte Zweifel einer ersten Sprosse (klasse-offen.json) fällt, wo eine Regel spricht: die höhere Lesart
                    // (Regel 6), eine Größe ÜBER Ort (Regel 1) oder der Erd-Schlüssel, der den Umfang nicht betrifft (Regel 6)
                    const erd = lies.erd || ERD_LEITER_RE.test(L.id);
                    const regel = zw ? "zweifel" : eigen && eigen.rang > ORT ? (eigen.grund.startsWith("pose:") ? "pose" : "treppe") : erd ? "erd" : null;
                    if (lies.fraglich.length || (alt && !regel)) {
                        // die erste Sprosse, die keine Regel fasst, bleibt leer (ein Wort nach unten löst den benannten Zweifel nie);
                        // darüber gilt als Boden ihre eigene Lesart
                        haengt = { leiter: L.id, sprosse: s.nr, umfang: s.umfang, preis: s.preis, richter: s.richter, grund: alt ? alt.grund : lies.fraglich.map((f) => f.grund).join(" · "), alt, boden: eigenRang, darueber: [] };
                        aus.offen.push(haengt);
                        unten = { rang: haengt.boden, offen: true, nr: s.nr };
                    } else {
                        rang = zw ? zw.rang : eigenRang;
                        klasse = G.namen[rang];
                        grund = zw ? zw.grund : eigen ? eigen.grund : "geerbt:R5";
                        if (alt) aus.geloest.push({ leiter: L.id, sprosse: s.nr, umfang: s.umfang, klasse, grund, regel, alt: alt.grund });
                        unten = { rang, offen: false, nr: s.nr };
                    }
                } else {
                    const boden = unten ? unten.rang : ORT;
                    // die Sprosse trägt ihre Klasse selbst (sonst erbt sie): die höhere Lesart nur, wo sie über den Boden hebt — steht
                    // der Boden schon so hoch, entscheidet der Zweifel nichts und die Sprosse erbt
                    const hebt = zw && zw.rang > boden;
                    const traegt = hebt || (eigen && eigen.rang >= boden && eigen.rang > ORT);
                    rang = Math.max(boden, zw ? zw.rang : eigenRang);
                    klasse = G.namen[rang];
                    grund = hebt ? zw.grund : traegt ? eigen.grund : "geerbt:S" + L.sprossen[i - 1].nr;
                    if (traegt && / \(Reihe /.test(grund)) aus.reihe++;
                    const frag = lies.fraglich.filter((f) => f.rang > rang);
                    if (frag.length) aus.unsicher.push({ leiter: L.id, sprosse: s.nr, umfang: s.umfang, klasse, lesart: G.namen[Math.max(...frag.map((f) => f.rang))], grund: frag.map((f) => f.grund).join(" · ") });
                    if (haengt && !traegt) haengt.darueber.push(s.nr);
                    else haengt = null;
                    unten = { rang, offen: !!haengt, nr: s.nr };
                }
                if (grund && grund.startsWith("zweifel:")) aus.zweifel[zweifelArt(grund)] = (aus.zweifel[zweifelArt(grund)] || 0) + 1;
                if (klasse && grund !== "hand" && rang < PLANET) for (const b of lies.bleibt) aus.bleibt.push({ leiter: L.id, sprosse: s.nr, umfang: s.umfang, klasse, grund: b });
                aus.je.set(k, { klasse, grund });
                V[klasse || "leer"]++;
            });
        }
    }
    return aus;
}
// die Karte auf den Stand des Gesetzes setzen (in place): → Zahl der geänderten Sprossen
function klassenSetzen(karte, R) {
    let n = 0;
    for (const g of karte.gruppen)
        for (const L of g.kriterien)
            for (const s of L.sprossen) {
                const { klasse, grund } = R.je.get(L.id + "#" + s.nr);
                if ((s.klasse || null) === klasse && (s.klasseGrund || null) === grund) continue;
                n++;
                // Reihenfolge der Felder: klasse und klasseGrund hinter preis (wie die von Hand gesetzten)
                const alt = { ...s };
                for (const f of Object.keys(s)) delete s[f];
                for (const f of Object.keys(alt)) {
                    if (f === "klasse" || f === "klasseGrund") continue;
                    s[f] = alt[f];
                    if (f === "preis" && klasse) Object.assign(s, { klasse, klasseGrund: grund });
                }
                if (klasse && !s.klasse) Object.assign(s, { klasse, klasseGrund: grund });
            }
    return n;
}
// klasse-offen.json auf den Stand des Gesetzes: offen = die leeren ersten Sprossen (ihr Grund bleibt), aufgeloest = die Zeilen von Hand
// + was das Gesetz löste (`quelle: "gesetz"`, je Lauf neu)
function klassenOffenNeu(datei, R, karte) {
    const neu = JSON.parse(JSON.stringify(datei));
    neu.offen = R.offen.map((o) => o.alt || { leiter: o.leiter, sprosse: o.sprosse, umfang: o.umfang, preis: o.preis, richter: o.richter, grund: o.grund });
    const warum = {
        treppe: (x) => `die kleinste Zeile der Treppe, die den Umfang „${x.umfang}“ fasst (Klassen-Gesetz Regel 1)`,
        zweifel: (x) => `im Zweifel die höhere Zeile für den Umfang „${x.umfang}“ (Klassen-Gesetz Regel 6)`,
        pose: (x) => `der Umfang „${x.umfang}“ schweigt zur Größe, die Preis-Pose spricht (Klassen-Gesetz Regel 7)`,
        erd: (x) => `der Erd-Schlüssel betrifft die Spalte Bytes, die Klasse folgt dem übrigen Umfang „${x.umfang}“ (Klassen-Gesetz Regel 6)`,
    };
    neu.aufgeloest = (datei.aufgeloest || []).filter((a) => a.quelle !== "gesetz").concat(
        R.geloest.map((x) => ({ leiter: x.leiter, sprosse: x.sprosse, klasse: x.klasse, quelle: "gesetz", grund: `${x.klasse} — ${x.grund}: ${warum[x.regel](x)}`, offen: x.alt }))
    );
    let erste = 0,
        gesetzt = 0;
    for (const g of karte.gruppen) for (const L of g.kriterien) (erste++, R.je.get(L.id + "#" + L.sprossen[0].nr).klasse && gesetzt++);
    neu.stand = { ...datei.stand, ersteSprossen: erste, gesetzt, offen: neu.offen.length };
    return neu;
}
const zweifelZeile = (R) => Object.entries(R.zweifel).map(([art, n]) => `${art} ${n}`).join(" · ") || "—";
const zweifelSumme = (R) => Object.values(R.zweifel).reduce((a, n) => a + n, 0);
// das Blatt für den Koordinator: was KEINE Regel des Gesetzes fasst — er entscheidet in einem Zug (klasse setzen, klasseGrund "hand")
function klassenBlatt(R) {
    const z = (...a) => "| " + a.map((x) => String(x).replace(/\|/g, "/")).join(" | ") + " |";
    const kurz = (L) => L.replace(/^(planet|leben|mensch|erleben|same)\./, (m) => m);
    const aus = [
        "# Klassen der Karte 2: was keine Regel des Gesetzes fasst",
        "",
        "Erzeugt von `node vision/buche-2.cjs --klassen` (jeder Lauf schreibt das Blatt neu, nie von Hand ändern). Entscheid: `klasse` in",
        "`vision/meisterkarte-2.json` setzen und `klasseGrund` auf `hand` — der nächste Lauf lässt sie stehen und zieht die Sprossen darüber nach.",
        "",
        "Im Zweifel die höhere Zeile (Regel 6): Welt-Wechsel → Planet und Welten · Träger unklar zählt Leiber · Region ohne Größe → Stadt ·",
        "zwei Zeilen → die höhere · Horizont → Megastadt und Kontinent · Planet-Maß → Planet und Welten. Himmel vom Boden und der",
        "Erd-Schlüssel (Spalte Bytes) heben nicht — außer der Umfang nennt selbst das Ganze (die Erde, den Planeten über seine Geschichte).",
        "Stehen zwei Regeln gegeneinander, gilt die höhere Zeile. Schweigt der Umfang zur Größe, spricht die Preis-Pose (Regel 7, `pose:<Wort>`).",
        "Eine gehobene Sprosse trägt `klasseGrund` `zweifel:<Grund>` und steht hier nicht.",
        "",
        `Stand: ${zweifelSumme(R)} Sprossen tragen die höhere Zeile (${zweifelZeile(R)}).`,
        "",
        `## A · Erste Sprossen aus klasse-offen.json, die das Gesetz löst (${R.geloest.length})`,
        "",
        z("Leiter", "Umfang", "Klasse", "Grund"),
        z("---", "---", "---", "---"),
        ...R.geloest.map((x) => z(kurz(x.leiter), x.umfang, x.klasse, x.grund)),
        "",
        `## B · Erste Sprossen, die leer bleiben (${R.offen.length}) — keine Regel fasst sie; darüber gilt bis zum Entscheid ihr Boden`,
        "",
        z("Leiter", "Umfang", "Boden", "erben ihn", "Grund"),
        z("---", "---", "---", "---", "---"),
        ...R.offen.map((x) => z(kurz(x.leiter), x.umfang, R.G.namen[x.boden], x.darueber.length ? "S " + x.darueber.join(", ") : "—", x.grund)),
        "",
        `## C · Sprossen darüber, die keine Regel fasst (${R.unsicher.length}) — gesetzt ist die Lesart ohne den Zweifel, die andere steht daneben`,
        "",
        z("Leiter", "S", "Umfang", "gesetzt", "andere Lesart", "Grund"),
        z("---", "---", "---", "---", "---", "---"),
        ...R.unsicher.map((x) => z(kurz(x.leiter), x.sprosse, x.umfang, x.klasse, x.lesart, x.grund)),
        "",
        `## D · Das Gesetz gegen die Hand (${R.hand.abweichung.length} anders, ${R.hand.enthaltung.length} unsicher, ${R.hand.gleich} gleich) — die Hand bleibt stehen`,
        "",
        z("Leiter", "S", "Umfang", "Hand", "Gesetz", "Grund"),
        z("---", "---", "---", "---", "---", "---"),
        ...R.hand.abweichung.concat(R.hand.enthaltung).map((x) => z(kurz(x.leiter), x.sprosse, x.umfang, x.hand, x.gesetz || "unsicher", x.grund)),
    ];
    return aus.join("\n") + "\n";
}
// DIE WACHE (Gebot 10): Karte, klasse-offen.json und Blatt stehen am Fixpunkt des Gesetzes — sonst der Täter beim Namen.
//   (a) KLASSE UNTER DEM UMFANG   eine Sprosse trägt ein Größen-Wort oder eine Größe oberhalb ihrer gesetzten Klasse
//   (b) MONOTONIE                 eine Sprosse steht unter der Sprosse darunter
//   (c) OHNE KLASSE               eine Sprosse ohne `klasse` und ohne Zeile in klasse-offen.json
//   (d) ZWEIFEL NACH UNTEN        eine Sprosse mit zwei Lesarten, deren Feld die niedrigere trägt (Regel 6: im Zweifel die höhere)
// Leser: jeder Buchungs-Lauf (haupt, laut ohne Abbruch) und `--selbsttest` (ROT).
function klassenWache(karte, offenDatei, blatt) {
    const R = klassenRechnen(karte, offenDatei);
    const G = R.G,
        aus = [];
    const offen = new Set(((offenDatei && offenDatei.offen) || []).map((o) => o.leiter + "#" + o.sprosse));
    for (const g of karte.gruppen)
        for (const L of g.kriterien) {
            let unten = null;
            for (const s of L.sprossen) {
                const k = L.id + "#" + s.nr,
                    wo = `${L.id} S ${s.nr}`;
                const soll = R.je.get(k);
                if (!s.klasse) {
                    if (!offen.has(k)) aus.push(`OHNE KLASSE und ohne Zeile in klasse-offen.json: ${wo} „${s.umfang}“`);
                    else if (soll.klasse) aus.push(`OHNE KLASSE, das Gesetz liest sie: ${wo} „${s.umfang}“ → ${soll.klasse} (${soll.grund})`);
                    continue;
                }
                const rang = G.namen.indexOf(s.klasse);
                if (rang < 0) aus.push(`KLASSE UNBEKANNT: ${wo} trägt „${s.klasse}“, die Preis-Treppe kennt sie nicht`);
                if (offen.has(k)) aus.push(`klasse-offen.json führt ${wo} als offen, die Karte trägt „${s.klasse}“`);
                if (s.klasseGrund === undefined) aus.push(`OHNE klasseGrund: ${wo} „${s.klasse}“ (von Hand gesetzt: klasseGrund "hand")`);
                else if (s.klasseGrund !== "hand" && (s.klasse !== soll.klasse || s.klasseGrund !== soll.grund)) {
                    const eigen = umfangLesen(G, s).sicher; // ohne Reihe: nur was die Sprosse selbst trägt
                    if (soll.klasse && rang < G.namen.indexOf(soll.klasse) && soll.grund.startsWith("zweifel:"))
                        aus.push(`ZWEIFEL NACH UNTEN: ${wo} trägt „${s.klasse}“ (${s.klasseGrund}), der Umfang „${s.umfang}“ hat zwei Lesarten (${soll.grund.slice(8)}) — im Zweifel die höhere: ${soll.klasse}`);
                    else if (soll.klasse && rang < G.namen.indexOf(soll.klasse) && eigen && eigen.rang > rang && eigen.grund.startsWith("pose:"))
                        aus.push(`KLASSE UNTER DER PREIS-POSE: ${wo} gesetzt „${s.klasse}“, der Umfang „${s.umfang}“ schweigt zur Größe, die Preis-Pose „${s.preis}“ trägt ${eigen.grund} → ${soll.klasse}`);
                    else if (soll.klasse && rang < G.namen.indexOf(soll.klasse) && eigen && eigen.rang > rang) aus.push(`KLASSE UNTER DEM UMFANG: ${wo} gesetzt „${s.klasse}“, der Umfang „${s.umfang}“ trägt ${eigen.grund} → ${soll.klasse}`);
                    else aus.push(`KLASSE NICHT AM GESETZ: ${wo} trägt „${s.klasse}“ (${s.klasseGrund}), das Gesetz rechnet ${soll.klasse ? `„${soll.klasse}“ (${soll.grund})` : "keine (unsicher)"}`);
                }
                if (unten && rang < unten.rang) aus.push(`MONOTONIE: ${wo} „${s.klasse}“ steht unter S ${unten.nr} „${G.namen[unten.rang]}“`);
                if (rang >= 0) unten = { rang, nr: s.nr };
            }
        }
    if (blatt !== undefined && blatt !== klassenBlatt(R)) aus.push("BLATT nicht am Stand: vision/richter/klassen-unsicher.md weicht vom Gesetz ab");
    return aus;
}
const klassenWacheLesen = (karte) =>
    klassenWache(karte, JSON.parse(fs.readFileSync(KLASSE_OFFEN, "utf8")), fs.existsSync(KLASSEN_BLATT) ? fs.readFileSync(KLASSEN_BLATT, "utf8") : "");
// der Befehl: node vision/buche-2.cjs --klassen [--trocken] [--karte DATEI]
function klassenBefehl(argv) {
    const arg = (n, d) => (argv.includes(n) ? argv[argv.indexOf(n) + 1] : d);
    const karteDatei = path.resolve(arg("--karte", KARTE));
    const trocken = argv.includes("--trocken");
    const roh = fs.readFileSync(karteDatei, "utf8");
    const karte = JSON.parse(roh);
    const offenRoh = fs.readFileSync(KLASSE_OFFEN, "utf8");
    const offenDatei = JSON.parse(offenRoh);
    const R = klassenRechnen(karte, offenDatei);
    const H = R.hand,
        hand = H.gleich + H.abweichung.length + H.enthaltung.length;
    const blatt = klassenBlatt(R);
    const leer = [...R.je.values()].filter((x) => !x.klasse).length;
    let vorLeer = 0;
    for (const g of karte.gruppen) for (const L of g.kriterien) for (const s of L.sprossen) if (!s.klasse) vorLeer++;
    console.log(`KLASSEN-GESETZ: ${R.je.size} Sprossen · ohne Klasse ${vorLeer} → ${leer} · aus der Reihe gezählt ${R.reihe} · Blatt ${blatt.split("\n").length - 1} Zeilen (unsicher ${R.unsicher.length})`);
    console.log(`GEGEN DIE HAND: ${H.gleich} von ${hand} gleich (${hand ? ((H.gleich / hand) * 100).toFixed(1).replace(".", ",") : "–"} %) · anders ${H.abweichung.length} · unsicher ${H.enthaltung.length}`);
    for (const x of H.abweichung) console.log(`  ANDERS: ${x.leiter} S ${x.sprosse} „${x.umfang}“ — Hand „${x.hand}“, Gesetz „${x.gesetz}“ (${x.grund})`);
    for (const x of H.enthaltung) console.log(`  UNSICHER: ${x.leiter} S ${x.sprosse} „${x.umfang}“ — Hand „${x.hand}“, das Gesetz ließe sie leer (${x.grund})`);
    console.log(`MONOTONIE: ${R.monotonie.length} Bruch/Brüche`);
    for (const x of R.monotonie) console.log("  " + x);
    console.log(`ZWEIFEL: ${zweifelSumme(R)} Sprossen tragen die höhere Zeile (${zweifelZeile(R)}) · nach Regel nicht gehoben ${R.bleibt.length}`);
    for (const x of R.bleibt) console.log(`  BLEIBT ${x.klasse}: ${x.leiter} S ${x.sprosse} „${x.umfang}“ — ${x.grund}`);
    // die Tafel der Bewegung: Klasse der Datei → Klasse des Gesetzes (am Fixpunkt 0)
    const zug = {};
    for (const g of karte.gruppen)
        for (const L of g.kriterien)
            for (const s of L.sprossen) {
                const neu = R.je.get(L.id + "#" + s.nr).klasse;
                if ((s.klasse || null) !== neu) zug[`${s.klasse || "leer"} → ${neu || "leer"}`] = (zug[`${s.klasse || "leer"} → ${neu || "leer"}`] || 0) + 1;
            }
    console.log(`BEWEGT: ${Object.values(zug).reduce((a, n) => a + n, 0)} Sprosse(n) wechseln die Klasse${Object.keys(zug).length ? " — " + Object.entries(zug).map(([k, n]) => `${k} ${n}`).join(" · ") : ""}`);
    for (const x of R.geloest) console.log(`  GELÖST: ${x.leiter} S ${x.sprosse} „${x.umfang}“ → ${x.klasse} (${x.grund})`);
    for (const x of R.offen) console.log(`  LEER: ${x.leiter} S ${x.sprosse} „${x.umfang}“${x.darueber.length ? " — darüber erben S " + x.darueber.join(", ") : ""}`);
    for (const x of R.unsicher) console.log(`  OHNE REGEL: ${x.leiter} S ${x.sprosse} „${x.umfang}“ — gesetzt ${x.klasse}, andere Lesart ${x.lesart} (${x.grund})`);
    const kopf = ["Kapitel", ...R.G.namen, "leer"];
    console.log("VERTEILUNG: " + kopf.join(" · "));
    const summe = Object.fromEntries(kopf.slice(1).map((n) => [n, 0]));
    for (const [id, V] of Object.entries(R.verteilung)) {
        console.log(`  ${id}: ${kopf.slice(1).map((n) => V[n]).join(" · ")}`);
        for (const n of kopf.slice(1)) summe[n] += V[n];
    }
    console.log(`  Σ: ${kopf.slice(1).map((n) => summe[n]).join(" · ")}`);
    const n = klassenSetzen(karte, R);
    const aus = schreibe(karte),
        offenAus = JSON.stringify(klassenOffenNeu(offenDatei, R, karte), null, 1) + "\n";
    const blattAlt = karteDatei === KARTE && fs.existsSync(KLASSEN_BLATT) ? fs.readFileSync(KLASSEN_BLATT, "utf8") : "";
    const nebenbei = karteDatei === KARTE ? [offenAus !== offenRoh && "klasse-offen.json", blatt !== blattAlt && "klassen-unsicher.md"].filter(Boolean) : [];
    if (!trocken) {
        if (aus !== roh) fs.writeFileSync(karteDatei, aus);
        if (karteDatei === KARTE) {
            if (offenAus !== offenRoh) fs.writeFileSync(KLASSE_OFFEN, offenAus);
            if (blatt !== blattAlt) fs.writeFileSync(KLASSEN_BLATT, blatt);
        }
    }
    console.log(`${trocken ? "TROCKEN (nichts geschrieben)" : "GESCHRIEBEN"}: ${n} Sprosse(n) geändert${nebenbei.length ? " · " + nebenbei.join(" + ") : ""}`);
}

const zeile = (z) =>
    `KARTE 2: ${z.heute} von ${z.sprossen} gebucht (${z.anteil.toFixed(1).replace(".", ",")} %), ${z.kern} im Kern · an beiden Geräten ${z.beide} · Nachwache offen ${z.nachwache}`;

// ───────────────────────── Selbsttest ─────────────────────────
function selbsttest() {
    const roh = fs.readFileSync(KARTE, "utf8");
    const kern0 = brueckeLesen(fs.readFileSync(BRUECKE, "utf8"));
    const neu = () => JSON.parse(roh);
    const finde = (k, id) => {
        for (const g of k.gruppen) for (const L of g.kriterien) if (L.id === id) return L;
    };
    const soll = (id, nr) => finde(neu(), id).sprossen.find((s) => s.nr === nr).richter;
    const A = "planet.geologie.platten"; // Leiter ohne Brücken-Kern
    const B = "leben.pflanzen.kraft"; // Leiter mit Brücken-Kern auf Sprosse 1, Klasse Ort in der Karte
    const G = "planet.kopplung.wetter-welt"; // Glieder-Leiter, Brücken-Kern 1 und 3
    const T0Vor = treppeLesen(neu());
    const FASSUNG = T0Vor.fassung;
    const preis = (x = {}) => Object.assign({ stufe: "Ort", bild_p95_ms: 24, bild_max_ms: 70, heap_mb: 300, vram_mb: 100, urteil: "GRÜN", treppe: FASSUNG }, x);
    const fahrt = (id, nr, o = {}) => ({
        leiter: id,
        sprosse: nr,
        sha: o.sha || "7f778d44c1",
        datum: o.datum || "2026-11-14T20:00:00Z",
        soll: o.soll !== undefined ? o.soll : soll(id, nr),
        geraete: (o.geraete || ["Radeon 890M", "GTX 1060"]).map((g) => ({
            geraet: g,
            richter: { wert: 1, urteil: o.rot === g ? "ROT" : "GRÜN" },
            preis: o.ohnePreis === g || o.ohnePreis === true ? undefined : preis(o.preis),
        })),
    });
    // die Köpfe der Probe: 7f778d44 und 0123abcd auf main ohne Vorfahr-Beziehung; NEU (a635bfee) ist Nachfahr von ALT (e4eeee08),
    // ZWEIG (c3f23d23) steht nicht auf main — wie am echten Stand 16.11.
    const ALT = "e4eeee086c",
        NEU = "a635bfee2a",
        ZWEIG = "c3f23d23aa";
    const KOPF = kopfFolgeFest({ main: ["7f778d44c1", "0123abcd99", ALT, NEU], zweig: [ZWEIG], ahnen: { [NEU]: [ALT] } });
    let ok = 0,
        fehl = 0;
    const pruefe = (name, f) => {
        try {
            const r = f();
            if (r === true) {
                ok++;
                console.log("  GRÜN  " + name);
            } else {
                fehl++;
                console.log("  ROT   " + name + " — " + r);
            }
        } catch (e) {
            fehl++;
            console.log("  ROT   " + name + " — " + e.message);
        }
    };
    // die Probe-Leitern A und G tragen im Speicher die Klasse Ort (die Proben messen den Preis der Zeile Ort; die Karte nennt für A
    // seit dem Klassen-Gesetz „Megastadt und Kontinent“) · `klasseWeg`: die Mutante, A ohne Klasse
    const lauf = (akten, o = {}) => {
        const k = neu();
        if (!o.ohneKlasse) for (const id of [A, G]) for (const s of finde(k, id).sprossen) s.klasse = "Ort";
        if (o.klasseWeg) for (const s of finde(k, A).sprossen) delete s.klasse;
        if (o.klasse) finde(k, A).sprossen[0].klasse = o.klasse;
        const z = (o.rechne || rechne)(k, akten, kern0, o.kopf || KOPF);
        return { k, z, L: (id) => finde(k, id) };
    };
    const bricht = (akten, muster, o) => {
        try {
            lauf(akten, o);
            return "brach nicht";
        } catch (e) {
            return e.bruch && muster.test(e.message) ? true : "falscher Bruch: " + e.message;
        }
    };

    // Die Karte im Repo trägt seit der ersten echten Buchung (15.11.) gebuchte Zahlen — byte-gleich ist sie darum nur ohne die Felder
    // der Maschine (Kopf: heute, kern, heuteSprossen, kernSprossen, summe); bis 16.11. verglich die Probe die ganze Datei und stand ROT.
    const ohneMaschine = (t) => JSON.stringify(JSON.parse(t), (key, v) => (["heute", "kern", "heuteSprossen", "kernSprossen", "summe"].includes(key) ? undefined : v));
    pruefe("ohne Akten: nur die Felder der Maschine ändern sich, 0 gebucht, 19 im Kern", () => {
        const { k, z } = lauf({}, { ohneKlasse: true });
        if (ohneMaschine(schreibe(k)) !== ohneMaschine(roh)) return "die Maschine fasste ein fremdes Feld an";
        return z.heute === 0 && z.kern === 19 && k.summe.anteilKern === 0.9 ? true : zeile(z);
    });
    pruefe("volle Akte hebt genau die Sprosse: Kern → Punkt", () => {
        const { L, z } = lauf({ [B + ".1"]: fahrt(B, 1) });
        return L(B).heute === 1 && L(B).kern === 0 && z.heute === 1 && z.kern === 18 ? true : `heute ${L(B).heute} kern ${L(B).kern} Σ ${z.heute}/${z.kern}`;
    });
    pruefe("Mutant Lücke: Sprosse 2 ohne Sprosse 1 zählt nicht", () => {
        const { L, z } = lauf({ [A + ".2"]: fahrt(A, 2) });
        return L(A).heute === 0 && L(A).kern === 0 && z.heute === 0 ? true : `heute ${L(A).heute} kern ${L(A).kern}`;
    });
    pruefe("Glieder: Sprosse 2 zählt für sich", () => {
        const { L } = lauf({ [G + ".2"]: fahrt(G, 2) });
        const g = L(G);
        return g.heute === 1 && g.kern === 2 && g.heuteSprossen.join() === "2" && g.kernSprossen.join() === "1,3" ? true : `heute ${g.heuteSprossen} kern ${g.kernSprossen}`;
    });
    // ── EIN GERÄT BUCHT, DAS ZWEITE IST NACHWACHE (18.11., Z7) ── bis 18.11. hob ein Gerät nie; diese Fälle prüften „hebt nichts“
    const einGeraet = (g) => {
        const { L, z } = lauf({ [A + ".1"]: fahrt(A, 1, { geraete: [g] }) });
        const w = z.bericht[0] && z.bericht[0].warum,
            ander = g === "GTX 1060" ? "Radeon 890M" : "GTX 1060";
        return L(A).heute === 1 && z.heute === 1 && z.kern === 19 && z.beide === 0 && z.nachwache === 1 &&
            w === `Richter GRÜN und Preis (Ort) GRÜN an ${g} am 7f778d44 · Nachwache offen: ${ander}`
            ? true
            : `heute ${L(A).heute} kern ${L(A).kern} beide ${z.beide} nachwache ${z.nachwache} · ${w}`;
    };
    pruefe("EIN GERÄT (a): Radeon allein, Richter GRÜN + Preis GRÜN → PUNKT, „Nachwache offen: GTX 1060“", () => einGeraet("Radeon 890M"));
    pruefe("EIN GERÄT (a): GTX allein, Richter GRÜN + Preis GRÜN → PUNKT, „Nachwache offen: Radeon 890M“", () => einGeraet("GTX 1060"));
    pruefe("EIN GERÄT: zwei Radeon-Läufe sind EIN Gerät — PUNKT mit offener Nachwache, nie „an beiden Geräten“", () => {
        const { L, z } = lauf({ [A + ".1"]: fahrt(A, 1, { geraete: ["Radeon 890M", "Radeon 890M (zweiter Lauf)"] }) });
        return L(A).heute === 1 && z.beide === 0 && /Nachwache offen: GTX 1060/.test(z.bericht[0].warum) ? true : `heute ${L(A).heute} beide ${z.beide} · ${z.bericht[0].warum}`;
    });
    pruefe("EIN GERÄT: beide am selben Kopf → „an beiden Geräten“, beide 1, Nachwache 0", () => {
        const { z } = lauf({ [A + ".1"]: fahrt(A, 1) });
        return z.heute === 1 && z.beide === 1 && z.nachwache === 0 && z.bericht[0].warum === "Richter GRÜN und Preis (Ort) GRÜN an beiden Geräten am 7f778d44" ? true : `beide ${z.beide} · ${z.bericht[0].warum}`;
    });
    // (b) Gerät A GRÜN am älteren Kopf, Gerät B ROT am jüngeren → 0 (die Nachwache nimmt)
    const fallB = () => ({ [A + ".1.e4eeee08-radeon"]: fahrt(A, 1, { sha: ALT, geraete: ["Radeon 890M"], datum: "2026-11-14T10:00:00Z" }),
        [A + ".1.a635bfee-gtx"]: fahrt(A, 1, { sha: NEU, geraete: ["GTX 1060"], rot: "GTX 1060", datum: "2026-11-15T10:00:00Z" }) });
    const pruefeB = (o) => {
        const { L, z } = lauf(fallB(), o);
        return L(A).heute === 0 && L(A).kern === 0 && /^Richter ROT an GTX 1060 am a635bfee$/.test(z.bericht[0].warum) ? true : `heute ${L(A).heute} kern ${L(A).kern} · ${z.bericht[0].warum}`;
    };
    pruefe("NACHWACHE (b): Radeon GRÜN am älteren Kopf, GTX ROT am jüngeren → 0", () => pruefeB());
    pruefe("NACHWACHE: GTX ROT am selben Kopf wie Radeon GRÜN → 0", () => {
        const { L } = lauf({ [A + ".1"]: fahrt(A, 1, { rot: "GTX 1060" }) });
        return L(A).heute === 0 && L(A).kern === 0 ? true : `heute ${L(A).heute} kern ${L(A).kern}`;
    });
    // (c) ENTSCHEID: die Kopf-Folge gilt JE GERÄT, wie für ein Gerät allein — eine Messung ist nur durch eine Messung DESSELBEN Geräts
    // an einem Nachfahren überholt. Das ROT der GTX am Vorfahren steht, bis die GTX selbst den jüngeren Kopf misst (Gesetz 2).
    pruefe("NACHWACHE (c): Radeon GRÜN am jüngeren Kopf, GTX ROT am Vorfahren → 0 (die GTX hat den jüngeren Code nie gemessen)", () => {
        const { L, z } = lauf({ [A + ".1.a635bfee-radeon"]: fahrt(A, 1, { sha: NEU, geraete: ["Radeon 890M"], datum: "2026-11-14T10:00:00Z" }),
            [A + ".1.e4eeee08-gtx"]: fahrt(A, 1, { sha: ALT, geraete: ["GTX 1060"], rot: "GTX 1060", datum: "2026-11-15T10:00:00Z" }) });
        return L(A).heute === 0 && /Richter ROT an GTX 1060 am e4eeee08/.test(z.bericht[0].warum) && !z.bericht[0].notiz.length ? true : `heute ${L(A).heute} · ${z.bericht[0].warum} · ${z.bericht[0].notiz}`;
    });
    pruefe("NACHWACHE (c) Gegenprobe: misst die GTX den jüngeren Kopf GRÜN, ist ihr ROT am Vorfahren überholt → PUNKT an beiden, laut", () => {
        const { L, z } = lauf({ [A + ".1.a635bfee-radeon"]: fahrt(A, 1, { sha: NEU, geraete: ["Radeon 890M"], datum: "2026-11-14T10:00:00Z" }),
            [A + ".1.a635bfee-gtx"]: fahrt(A, 1, { sha: NEU, geraete: ["GTX 1060"], datum: "2026-11-14T11:00:00Z" }),
            [A + ".1.e4eeee08-gtx"]: fahrt(A, 1, { sha: ALT, geraete: ["GTX 1060"], rot: "GTX 1060", datum: "2026-11-15T10:00:00Z" }) });
        return L(A).heute === 1 && z.beide === 1 && z.bericht[0].notiz.join() === "überholt: e4eeee08 (ROT) ist Vorfahre von a635bfee (GTX 1060)" ? true : `heute ${L(A).heute} · ${z.bericht[0].warum} · ${z.bericht[0].notiz}`;
    });
    // (d) ein Gerät GRÜN, Preis UNGEMESSEN unter Last: aus 0 wird KERN, ein Punkt hält (Z4)
    pruefe("EIN GERÄT (d): GTX allein, Preis UNGEMESSEN unter Last → KERN, nie PUNKT", () => {
        const { L, z } = lauf({ [A + ".1"]: fahrt(A, 1, { geraete: ["GTX 1060"], preis: { bild_p95_ms: 58.8, bild_max_ms: 134, referenz: { f: 1.84 }, urteil: "UNGEMESSEN unter Last ×1,84" } }) });
        return L(A).heute === 0 && L(A).kern === 1 && /^Richter GRÜN an GTX 1060, Preis GTX 1060 UNGEMESSEN unter Last ×1,84/.test(z.bericht[0].warum) ? true : `heute ${L(A).heute} kern ${L(A).kern} · ${z.bericht[0].warum}`;
    });
    pruefe("EIN GERÄT (d): GTX PUNKT am Vorfahren, GTX Last-Fahrt am Nachfahren → der Punkt hält, laut", () => {
        const lp = { bild_p95_ms: 58.8, bild_max_ms: 134, referenz: { f: 1.84 }, urteil: "UNGEMESSEN unter Last ×1,84" };
        const { L, z } = lauf({ [A + ".1"]: [fahrt(A, 1, { sha: ALT, geraete: ["GTX 1060"], datum: "2026-11-14T10:00:00Z" }), fahrt(A, 1, { sha: NEU, geraete: ["GTX 1060"], datum: "2026-11-15T10:00:00Z", preis: lp })] });
        return L(A).heute === 1 && /Preis am Kopf offen \(Last\): a635bfee GTX 1060 ×1,84 — Richter GRÜN, der Punkt hält/.test(z.bericht[0].notiz.join()) ? true : `heute ${L(A).heute} · ${z.bericht[0].notiz}`;
    });
    pruefe("KÖPFE: GTX PUNKT am Vorfahren, Radeon KERN (Preis ROT) am Nachfahren → das beste Urteil über Köpfe: PUNKT, Nachwache nennt die Radeon", () => {
        const { L, z } = lauf({ [A + ".1.e4eeee08-gtx"]: fahrt(A, 1, { sha: ALT, geraete: ["GTX 1060"], datum: "2026-11-14T10:00:00Z" }),
            [A + ".1.a635bfee-radeon"]: fahrt(A, 1, { sha: NEU, geraete: ["Radeon 890M"], datum: "2026-11-15T10:00:00Z", preis: { vram_mb: 300, urteil: "ROT" } }) });
        return L(A).heute === 1 && z.beide === 0 && /GTX 1060 am e4eeee08 · Nachwache Radeon 890M: Richter GRÜN an Radeon 890M, Preis Radeon 890M ROT \(VRAM 300,0 > 256 MB\) am a635bfee/.test(z.bericht[0].warum)
            ? true
            : `heute ${L(A).heute} · ${z.bericht[0].warum}`;
    });
    // (e) und (f): Mutanten der QUELLE (im Speicher kompiliert, kein Schalter): die alte Regel und die stumme Nachwache müssen ROT fallen
    const mutante = (alt, neu) => {
        const Mod = require("module");
        const quelle = fs.readFileSync(__filename, "utf8");
        if (!quelle.includes(alt)) throw new Error("die Mutante trifft die Quelle nicht: " + alt);
        const m = new Mod(path.join(__dirname, "buche-2-mutante.cjs"), module);
        m.filename = path.join(__dirname, "buche-2-mutante.cjs");
        m.paths = Mod._nodeModulePaths(__dirname);
        m._compile(quelle.replace(alt, neu), m.filename);
        return m.exports.rechne;
    };
    pruefe("MUTANTE (e) „ein Gerät hebt nie“ (die alte Regel): Fall (a) fällt ROT", () => {
        const r = mutante("if (!je.length) return { u: \"NICHTS\"", "if (je.length < STANDARD.length) return { u: \"NICHTS\"");
        const { L } = lauf({ [A + ".1"]: fahrt(A, 1, { geraete: ["GTX 1060"] }) }, { rechne: r });
        return L(A).heute === 0 ? true : "die Mutante hob trotzdem — der Fall (a) fängt die alte Regel nicht";
    });
    pruefe("MUTANTE (f) „ROT des zweiten Geräts nimmt nicht“: Fall (b) fällt ROT", () => {
        const r = mutante("        if (rot.length) {\n", "        if (rot.length && rot.length === gesetzt.length) {\n");
        return pruefeB({ rechne: r }) === true ? "die Mutante nahm trotzdem — der Fall (b) fängt die stumme Nachwache nicht" : true;
    });
    pruefe("Mutant fehlender Preis: Kern statt Punkt", () => {
        const { L, z } = lauf({ [A + ".1"]: fahrt(A, 1, { ohnePreis: "GTX 1060" }) });
        return L(A).heute === 0 && L(A).kern === 1 && z.heute === 0 && z.kern === 20 ? true : `heute ${L(A).heute} kern ${L(A).kern}`;
    });
    const ruhig = { f: 1.05 },
        unterLast = { f: 1.84 };
    pruefe("Mutant Preis ROT (Bild p95 40 ms, Referenz im Band): Kern statt Punkt", () => {
        const { L, z } = lauf({ [A + ".1"]: fahrt(A, 1, { preis: { bild_p95_ms: 40, referenz: ruhig, urteil: "ROT" } }) });
        return L(A).heute === 0 && L(A).kern === 1 && /Radeon 890M ROT/.test(z.bericht[0].warum) ? true : `heute ${L(A).heute} kern ${L(A).kern} · ${z.bericht[0].warum}`;
    });
    pruefe("LAST: Referenz gerissen + Bild p95 über Soll = UNGEMESSEN beim Namen, Kern bleibt, kein Punkt", () => {
        const { L, z } = lauf({ [B + ".1"]: fahrt(B, 1, { preis: { bild_p95_ms: 58.8, bild_max_ms: 134, referenz: unterLast, urteil: "UNGEMESSEN unter Last ×1,84" } }) });
        return L(B).heute === 0 && L(B).kern === 1 && z.kern === 19 && /UNGEMESSEN unter Last ×1,84/.test(z.bericht[0].warum) ? true : `heute ${L(B).heute} kern ${L(B).kern} · ${z.bericht[0].warum}`;
    });
    pruefe("LAST: Referenz gerissen + größtes Bild über Soll, VRAM über Soll = ROT (VRAM hängt nie an Last)", () =>
        preisUrteil(preis({ bild_max_ms: 134, vram_mb: 271.6, referenz: unterLast, urteil: undefined }), treppeLesen(neu()), "t", "Ort") === "ROT" || "nicht ROT");
    pruefe("LAST: Preis unter Soll = GRÜN, egal welche Last (gerissen, ohne Referenz)", () =>
        preisUrteil(preis({ referenz: { f: 9 } }), treppeLesen(neu()), "t", "Ort") === "GRÜN" && preisUrteil(preis(), treppeLesen(neu()), "t", "Ort") === "GRÜN" || "nicht GRÜN");
    pruefe("LAST: Bild über Soll ohne Referenz (alte Akte) = UNGEMESSEN ohne Referenz, nie ROT", () =>
        /^UNGEMESSEN ohne Referenz/.test(preisUrteil(preis({ bild_p95_ms: 40, urteil: undefined }), treppeLesen(neu()), "t", "Ort")) || "falsch");
    pruefe("LAST: Mutant „UNGEMESSEN“ über ruhiger Referenz behauptet: bricht laut", () =>
        bricht({ [A + ".1"]: fahrt(A, 1, { preis: { bild_p95_ms: 40, referenz: ruhig, urteil: "UNGEMESSEN unter Last ×1,05" } }) }, /widerspricht den eigenen Zahlen/));
    // ── DIE LAST-FAHRT (17.11.): ROT unter Last ist kein Urteil — es nimmt keinen Punkt, es hebt nur bis Kern ──
    const lastPreis = { bild_p95_ms: 58.8, bild_max_ms: 134, referenz: unterLast, urteil: "UNGEMESSEN unter Last ×1,84" };
    // der Punkt am ALT, die spätere Fahrt am Nachfahren NEU (jüngerer Code — sonst vereint fahrtenJeSha beide zu EINER Fahrt)
    const punktDann = (spaet) => ({ [A + ".1"]: [fahrt(A, 1, { sha: ALT, datum: "2026-11-14T10:00:00Z" }), Object.assign(spaet, { sha: NEU, datum: "2026-11-20T10:00:00Z" })] });
    pruefe("LAST-FAHRT: PUNKT + Last-Fahrt → PUNKT hält, laut „Preis am Kopf offen (Last)“ mit Kopf und Faktor", () => {
        const { L, z } = lauf(punktDann(fahrt(A, 1, { preis: lastPreis })));
        const b = z.bericht[0];
        return L(A).heute === 1 && L(A).kern === 0 && b.stand === "PUNKT" &&
            b.notiz.join(" | ") === "Preis am Kopf offen (Last): a635bfee Radeon 890M ×1,84 — Richter GRÜN, der Punkt hält (Z4) | Preis am Kopf offen (Last): a635bfee GTX 1060 ×1,84 — Richter GRÜN, der Punkt hält (Z4)" &&
            /GRÜN an beiden Geräten am e4eeee08/.test(b.warum)
            ? true
            : `heute ${L(A).heute} kern ${L(A).kern} · ${b.warum} · ${b.notiz}`;
    });
    pruefe("LAST-FAHRT: 0 + Last-Fahrt → KERN, nie PUNKT", () => {
        const { L, z } = lauf({ [A + ".1"]: fahrt(A, 1, { preis: lastPreis }) });
        return L(A).heute === 0 && L(A).kern === 1 && !z.bericht[0].notiz.length && /UNGEMESSEN unter Last ×1,84/.test(z.bericht[0].warum) ? true : `heute ${L(A).heute} kern ${L(A).kern} · ${z.bericht[0].notiz}`;
    });
    // DAS RUHE-TOR (pm-referenz-nach-anlauf): dieselbe Zahl, das Tor riss vor „vor“ — der Grund heißt „im Anlauf der eigenen Welt“, die
    // Klasse bleibt die der Last-Fahrt (der Punkt hält beim Namen); der Mutant „Anlauf ist ROT“ nähme ihn
    const anlaufRef = { ...unterLast, anlauf: { wo: "vor", ruhig: false, s: 60, kerne: 4.02, soll: 3 } };
    const anlaufPreis = { ...lastPreis, referenz: anlaufRef, urteil: "UNGEMESSEN im Anlauf der eigenen Welt ×1,84" };
    pruefe("ANLAUF: das Tor riss + Bild über Soll → „UNGEMESSEN im Anlauf der eigenen Welt ×f“, nie „unter Last“", () => {
        const u = preisUrteil(preis({ bild_p95_ms: 58.8, bild_max_ms: 134, referenz: anlaufRef, urteil: undefined }), treppeLesen(neu()), "t", "Ort");
        return u === "UNGEMESSEN im Anlauf der eigenen Welt ×1,84" || u;
    });
    pruefe("ANLAUF-FAHRT: PUNKT + Anlauf-Fahrt → PUNKT hält, laut mit dem Anlauf beim Namen", () => {
        const { L, z } = lauf(punktDann(fahrt(A, 1, { preis: anlaufPreis })));
        const b = z.bericht[0];
        return L(A).heute === 1 && b.stand === "PUNKT" && /Preis am Kopf offen \(Last\): a635bfee Radeon 890M im Anlauf der eigenen Welt ×1,84/.test(b.notiz.join(" | "))
            ? true : `heute ${L(A).heute} · ${b.warum} · ${b.notiz}`;
    });
    pruefe("LAST-FAHRT Mutant: PUNKT + Preis GEMESSEN ROT (Referenz im Band) → KERN", () => {
        const { L } = lauf(punktDann(fahrt(A, 1, { preis: { bild_p95_ms: 40, referenz: ruhig, urteil: "ROT" } })));
        return L(A).heute === 0 && L(A).kern === 1 ? true : `heute ${L(A).heute} kern ${L(A).kern}`;
    });
    pruefe("LAST-FAHRT Mutant: PUNKT + Preis-Zahl fehlt (R3) → KERN", () => {
        const a = lauf(punktDann(fahrt(A, 1, { ohnePreis: "GTX 1060" })));
        const b = lauf(punktDann(fahrt(A, 1, { preis: { vram_mb: undefined, urteil: undefined } })));
        return a.L(A).heute === 0 && a.L(A).kern === 1 && b.L(A).heute === 0 && b.L(A).kern === 1 ? true : `fehlt: heute ${a.L(A).heute} kern ${a.L(A).kern} · unvollständig: heute ${b.L(A).heute} kern ${b.L(A).kern}`;
    });
    pruefe("LAST-FAHRT Mutant: PUNKT + Last an der Radeon, VRAM gemessen ROT an der GTX → KERN (ein Gerät gemessen ROT nimmt)", () => {
        const f = fahrt(A, 1, { preis: lastPreis });
        f.geraete[1].preis = preis({ vram_mb: 300, urteil: "ROT" });
        const { L } = lauf(punktDann(f));
        return L(A).heute === 0 && L(A).kern === 1 ? true : `heute ${L(A).heute} kern ${L(A).kern}`;
    });
    pruefe("LAST-FAHRT Mutant: PUNKT + UNGEMESSEN ohne Referenz → KERN (ohne Maßstab ist auch Last kein Beleg)", () => {
        const { L } = lauf(punktDann(fahrt(A, 1, { preis: { bild_p95_ms: 40, urteil: undefined } })));
        return L(A).heute === 0 && L(A).kern === 1 ? true : `heute ${L(A).heute} kern ${L(A).kern}`;
    });
    pruefe("LAST-FAHRT am selben Kopf: die spätere Last-Messung eines Geräts ersetzt seine GRÜNE Preis-Messung nicht — PUNKT, laut", () => {
        const { L, z } = lauf({
            [A + ".1.7f778d44-radeon"]: [fahrt(A, 1, { geraete: ["Radeon 890M"], datum: "2026-11-14T10:00:00Z" }), fahrt(A, 1, { geraete: ["Radeon 890M"], datum: "2026-11-14T12:00:00Z", preis: lastPreis })],
            [A + ".1.7f778d44-gtx"]: fahrt(A, 1, { geraete: ["GTX 1060"], datum: "2026-11-14T11:00:00Z" }),
        });
        const b = z.bericht[0];
        return L(A).heute === 1 && /Preis am Kopf offen \(Last\): 7f778d44 Radeon 890M ×1,84 — die GRÜNE Preis-Messung desselben Kopfes hält/.test(b.notiz.join()) ? true : `heute ${L(A).heute} kern ${L(A).kern} · ${b.notiz}`;
    });
    pruefe("LAST-FAHRT am selben Kopf Mutant: die spätere Messung mit Preis GEMESSEN ROT ersetzt die GRÜNE — KERN", () => {
        const { L } = lauf({
            [A + ".1.7f778d44-radeon"]: [fahrt(A, 1, { geraete: ["Radeon 890M"], datum: "2026-11-14T10:00:00Z" }), fahrt(A, 1, { geraete: ["Radeon 890M"], datum: "2026-11-14T12:00:00Z", preis: { bild_p95_ms: 40, referenz: ruhig, urteil: "ROT" } })],
            [A + ".1.7f778d44-gtx"]: fahrt(A, 1, { geraete: ["GTX 1060"], datum: "2026-11-14T11:00:00Z" }),
        });
        return L(A).heute === 0 && L(A).kern === 1 ? true : `heute ${L(A).heute} kern ${L(A).kern}`;
    });
    pruefe("LAST-FAHRT Mutant: PUNKT + Last-Fahrt + Richter ROT → 0", () => {
        const { L } = lauf(punktDann(fahrt(A, 1, { preis: lastPreis, rot: "GTX 1060" })));
        return L(A).heute === 0 && L(A).kern === 0 ? true : `heute ${L(A).heute} kern ${L(A).kern}`;
    });
    // DIE ANKUNFT IN IHRER LEITER (23.11.): eine Stadt-Akte mit grünem Bild, Speicher und Bytes und ohne ankunft_kalt_s urteilt GRÜN und
    // bucht; dieselbe mit gehaltenem VRAM 257 MB urteilt ROT (bis zum Speicher-Schnitt 23.11.: Heap 601 MB). Vor dem Schnitt stand hier „Kern statt Punkt“ — der Preis FEHLTE.
    const stadtPreis = (x = {}) => Object.assign(preis({ stufe: "Stadt", heap_mb: 560, vram_mb: 175, urteil: undefined, treppe: undefined }), x);
    // DER SPEICHER IN DER LEITER (23.11.): eine Ort-Akte mit gehaltenem Heap 520 MB und sonst grünem Preis urteilt GRÜN und bucht;
    // dieselbe mit VRAM über der Decke urteilt ROT. Vor dem Schnitt riss sie an „Heap 520,0 > 400 MB“.
    const ortPreis = (x = {}) => Object.assign(preis({ heap_mb: 548, posten: { heap_mb: 520, vram_mb: 140 }, urteil: undefined, treppe: undefined }), x);
    pruefe("SPEICHER IN DER LEITER: Ort-Akte mit gehaltenem Heap 520 MB und sonst grünem Preis urteilt GRÜN und bucht", () => {
        const u = preisUrteil(ortPreis(), T0Vor, "probe", "Ort");
        const { L } = lauf({ [A + ".1"]: fahrt(A, 1, { preis: ortPreis() }) });
        return u === "GRÜN" && L(A).heute === 1 ? true : `Preis ${u} (${preisGrund(ortPreis(), T0Vor, "Ort")}) · heute ${L(A).heute} kern ${L(A).kern}`;
    });
    pruefe("SPEICHER IN DER LEITER Mutant: dieselbe Ort-Akte mit gehaltenem VRAM 257 MB über der Decke urteilt ROT, nur Kern", () => {
        const p = ortPreis({ posten: { heap_mb: 520, vram_mb: 257 } });
        const u = preisUrteil(p, T0Vor, "probe", "Ort");
        const { L } = lauf({ [A + ".1"]: fahrt(A, 1, { preis: p }) });
        return u === "ROT" && L(A).heute === 0 && L(A).kern === 1 ? true : `Preis ${u} · heute ${L(A).heute} kern ${L(A).kern}`;
    });
    pruefe("SPEICHER IN DER LEITER: jede Klasse stuft Heap und Wachstum in same.preis.speicher, der VRAM bleibt Schranke der Sprosse", () => {
        const f = Object.keys(T0Vor).filter((k) => T0Vor[k].heap !== null || T0Vor[k].wachstum !== null || !(T0Vor[k].vram > 0) || !T0Vor[k].speicherLeiter || T0Vor[k].speicherLeiter.leiter !== "same.preis.speicher");
        return f.length ? "Heap-Schranke in der Sprosse: " + f.join(", ") : true;
    });
    pruefe("SPEICHER IN DER LEITER Mutant: eine Stufung, die auf Sprossen fremder Klasse zeigt, bricht laut", () => {
        const k = neu();
        const z = k.preisTreppe.find((t) => t.klasse === "Stadt");
        z.speicher = z.speicher.replace(/same\.preis\.speicher \d+(–\d+)?\)/, "same.preis.speicher 1–2)");
        try {
            treppeLesen(k);
            return "bricht nicht";
        } catch (e) {
            return /same\.preis\.speicher S 1 trägt die Klasse „Ort“, nicht „Stadt“/.test(e.message) || e.message;
        }
    });
    pruefe("SPEICHER IN DER LEITER Mutant: ein Speicher-Text ohne Heap-Zahl und ohne Stufung bricht laut (nie still keine Schranke)", () => {
        const k = neu();
        k.preisTreppe.find((t) => t.klasse === "Megastadt und Kontinent").speicher = "VRAM ≤ 512 MB, sonst nichts";
        try {
            treppeLesen(k);
            return "bricht nicht";
        } catch (e) {
            return /Speicher unlesbar/.test(e.message) || e.message;
        }
    });
    pruefe("ANKUNFT IN DER LEITER: Stadt-Preis ohne ankunft_kalt_s (Bild, Speicher, Bytes grün) urteilt GRÜN und bucht", () => {
        const u = preisUrteil(stadtPreis(), T0Vor, "probe", "Stadt");
        const { L } = lauf({ [A + ".1"]: fahrt(A, 1, { preis: stadtPreis() }) }, { klasse: "Stadt" });
        return u === "GRÜN" && L(A).heute === 1 ? true : `Preis ${u} · heute ${L(A).heute} kern ${L(A).kern}`;
    });
    pruefe("ANKUNFT IN DER LEITER Mutant: dieselbe Stadt-Akte mit gehaltenem VRAM 257 MB urteilt ROT, nur Kern", () => {
        const p = stadtPreis({ posten: { heap_mb: 560, vram_mb: 257 } });
        const u = preisUrteil(p, T0Vor, "probe", "Stadt");
        const { L } = lauf({ [A + ".1"]: fahrt(A, 1, { preis: p }) }, { klasse: "Stadt" });
        return u === "ROT" && L(A).heute === 0 && L(A).kern === 1 ? true : `Preis ${u} · heute ${L(A).heute} kern ${L(A).kern}`;
    });
    pruefe("ANKUNFT IN DER LEITER: jede Klasse stuft in same.preis.ankunft, keine trägt eine Schranke in der Sprosse", () => {
        const f = Object.keys(T0Vor).filter((k) => T0Vor[k].ankunft !== null || !T0Vor[k].ankunftLeiter || T0Vor[k].ankunftLeiter.leiter !== "same.preis.ankunft");
        return f.length ? "Schranke in der Sprosse: " + f.join(", ") : true;
    });
    pruefe("ANKUNFT IN DER LEITER Mutant: eine Stufung, die auf Sprossen fremder Klasse zeigt, bricht laut", () => {
        const k = neu();
        k.preisTreppe.find((t) => t.klasse === "Stadt").ankunft = "keine Schranke in der Sprosse (gestuft in same.preis.ankunft 1–3)";
        try {
            treppeLesen(k);
            return "bricht nicht";
        } catch (e) {
            return /S 1 trägt die Klasse „Ort“, nicht „Stadt“/.test(e.message) || e.message;
        }
    });
    pruefe("ANKUNFT IN DER LEITER Mutant: ein Ankunfts-Text ohne Zahl und ohne Stufung bricht laut (nie still keine Schranke)", () => {
        const k = neu();
        k.preisTreppe.find((t) => t.klasse === "Planet und Welten").ankunft = "kurz";
        try {
            treppeLesen(k);
            return "bricht nicht";
        } catch (e) {
            return /Ankunft unlesbar/.test(e.message) || e.message;
        }
    });
    pruefe("Mutant frisches ROT nimmt den Punkt zurück (Ratsche)", () => {
        const { L, z } = lauf({ [A + ".1"]: [fahrt(A, 1, { datum: "2026-11-20T10:00:00Z", rot: "GTX 1060" }), fahrt(A, 1, { datum: "2026-11-14T10:00:00Z" })] });
        return L(A).heute === 0 && L(A).kern === 0 && z.heute === 0 ? true : `heute ${L(A).heute} kern ${L(A).kern}`;
    });
    pruefe("Ratsche: eine schwache Fahrt nach dem Punkt nimmt nichts", () => {
        const { L } = lauf({ [A + ".1"]: [fahrt(A, 1, { datum: "2026-11-14T10:00:00Z" }), fahrt(A, 1, { datum: "2026-11-20T10:00:00Z", geraete: ["GTX 1060"] })] });
        return L(A).heute === 1 ? true : `heute ${L(A).heute}`;
    });
    pruefe("Mutant frisches ROT nimmt den Brücken-Kern zurück", () => {
        const { L, z } = lauf({ [B + ".1"]: fahrt(B, 1, { rot: "Radeon 890M" }) });
        return L(B).heute === 0 && L(B).kern === 0 && z.kern === 18 ? true : `heute ${L(B).heute} kern ${L(B).kern}`;
    });
    pruefe("Mutant Akte für Sprosse, die es nicht gibt: bricht laut", () => bricht({ [A + ".99"]: fahrt(A, 99, { soll: "x" }) }, /keine Sprosse 99/));
    pruefe("Mutant Akte für Leiter, die es nicht gibt: bricht laut", () => bricht({ "planet.gibt.es-nicht.1": fahrt(A, 1) }, /steht nicht in der Karte/));
    pruefe("Mutant Soll weicht vom Richter der Karte ab: bricht laut", () => bricht({ [A + ".1"]: fahrt(A, 1, { soll: "irgendwas" }) }, /Soll ist nicht der Richter/));
    pruefe("Mutant Preis-Urteil GRÜN über eigenen ROT-Zahlen: bricht laut", () =>
        bricht({ [A + ".1"]: fahrt(A, 1, { preis: { vram_mb: 300 } }) }, /widerspricht den eigenen Zahlen/)
    );
    // ── die Treppe in der Fassung 15.11.: Raster des Schirms, gehaltener Speicher, VRAM am Schirm ──
    const T0 = treppeLesen(neu());
    pruefe("TREPPE: die Karte nennt ihre Fassung, Ort trägt 34 · 101 ms und VRAM 256 MB, keine Heap-Zahl", () =>
        (!!FASSUNG && T0.Ort.p95 === 34 && T0.Ort.max === 101 && T0.Ort.vram === 256 && T0.Ort.heap === null) || JSON.stringify([FASSUNG, T0.Ort]));
    pruefe("RASTER: ein sauberer 30-Bilder-Gang am 120-Hz-Schirm (p95 33,47 ms, Aussetzer 100,4 ms) = GRÜN", () =>
        preisUrteil(preis({ bild_p95_ms: 33.47, bild_max_ms: 100.4, urteil: undefined }), T0, "t", "Ort") === "GRÜN" || "nicht GRÜN");
    pruefe("RASTER Mutant: fünf Takte (p95 41,8 ms) in Ruhe = ROT; ein Bild von 108,4 ms in Ruhe = ROT", () =>
        (preisUrteil(preis({ bild_p95_ms: 41.8, referenz: ruhig, urteil: undefined }), T0, "t", "Ort") === "ROT" &&
            preisUrteil(preis({ bild_max_ms: 108.4, referenz: ruhig, urteil: undefined }), T0, "t", "Ort") === "ROT") || "nicht ROT");
    pruefe("GEHALTEN: VRAM-Spitze 300 MB über dem Soll, gehalten 125 MB darunter = GRÜN (die Spitze ist Lesewert)", () =>
        preisUrteil(preis({ vram_mb: 300, posten: { heap_mb: 258, vram_mb: 125 }, urteil: undefined }), T0, "t", "Ort") === "GRÜN" || "nicht GRÜN");
    pruefe("GEHALTEN Mutant: gehaltener VRAM 257 MB reißt, auch wenn die Akte nichts sonst reißt = ROT", () =>
        preisUrteil(preis({ vram_mb: 200, posten: { heap_mb: 258, vram_mb: 257 }, urteil: undefined }), T0, "t", "Ort") === "ROT" || "nicht ROT");
    pruefe("VRAM AM SCHIRM: 140 MB hält am Ort, 300 MB reißt", () =>
        (preisUrteil(preis({ vram_mb: 140, urteil: undefined }), T0, "t", "Ort") === "GRÜN" && preisUrteil(preis({ vram_mb: 300, urteil: undefined }), T0, "t", "Ort") === "ROT") || "falsch");
    pruefe("FASSUNG: eine Akte älterer Fassung (ohne `treppe`) wird an ihren Zahlen neu geurteilt — ihr altes „ROT“ ist kein Bruch", () => {
        const { L, z } = lauf({ [B + ".1"]: fahrt(B, 1, { preis: { vram_mb: 133, treppe: undefined, urteil: "ROT" } }) });
        return L(B).heute === 1 && z.heute === 1 ? true : `heute ${L(B).heute} · ${z.bericht[0].warum}`;
    });
    pruefe("zwei Geräte-Dateien am selben SHA ergeben EINE Fahrt: Punkt", () => {
        const { L } = lauf({ [B + ".1.7f778d44-radeon"]: fahrt(B, 1, { geraete: ["Radeon 890M"], datum: "2026-11-14T20:00:00Z" }),
            [B + ".1.7f778d44-gtx"]: fahrt(B, 1, { geraete: ["GTX 1060"], datum: "2026-11-14T21:00:00Z" }) });
        return L(B).heute === 1 && L(B).kern === 0 ? true : `heute ${L(B).heute} kern ${L(B).kern}`;
    });
    pruefe("zwei Geräte an verschiedenen SHA (ohne Vorfahr-Beziehung): je Gerät die jüngste, PUNKT an beiden Geräten, beide Köpfe genannt", () => {
        const { L, z } = lauf({ [B + ".1.7f778d44-radeon"]: fahrt(B, 1, { geraete: ["Radeon 890M"] }),
            [B + ".1.0123abcd-gtx"]: fahrt(B, 1, { geraete: ["GTX 1060"], sha: "0123abcd99" }) });
        return L(B).heute === 1 && z.beide === 1 && z.bericht[0].warum === "Richter GRÜN und Preis (Ort) GRÜN an beiden Geräten: Radeon 890M am 7f778d44 · GTX 1060 am 0123abcd"
            ? true
            : `heute ${L(B).heute} kern ${L(B).kern} · ${z.bericht[0].warum}`;
    });
    // ── DIE KOPF-FOLGE: der Fall der GTX 16.11. (13:14 am a635bfee Preis ROT, 14:11 am Vorfahren e4eeee08 Preis GRÜN) ──
    const heapRot = { vram_mb: 300, urteil: "ROT" }; // ein gemessen ROTER Preis (bis 23.11. Heap 491 MB; der Heap ist seither keine Schranke der Sprosse)
    pruefe("KOPF-FOLGE Mutant: ältere Kopf-Fahrt später gemessen hebt nicht — Kern am a635bfee bleibt, laut „überholt“", () => {
        const { L, z } = lauf({ [B + ".1"]: [fahrt(B, 1, { sha: NEU, datum: "2026-11-16T13:14:00+01:00", preis: heapRot }), fahrt(B, 1, { sha: ALT, datum: "2026-11-16T14:11:00+01:00" })] });
        const b = z.bericht[0];
        return L(B).heute === 0 && L(B).kern === 1 && /am a635bfee/.test(b.warum) && b.notiz.join() === "überholt: e4eeee08 (PUNKT) ist Vorfahre von a635bfee (Radeon 890M + GTX 1060)" ? true : `heute ${L(B).heute} kern ${L(B).kern} · ${b.warum} · ${b.notiz}`;
    });
    pruefe("KOPF-FOLGE Mutant: ältere Kopf-Fahrt ROT später gemessen nimmt den Punkt des neueren Kopfes nicht", () => {
        const { L, z } = lauf({ [A + ".1"]: [fahrt(A, 1, { sha: NEU, datum: "2026-11-16T13:14:00+01:00" }), fahrt(A, 1, { sha: ALT, datum: "2026-11-16T14:11:00+01:00", rot: "GTX 1060" })] });
        return L(A).heute === 1 && /überholt: e4eeee08 \(ROT\)/.test(z.bericht[0].notiz.join()) ? true : `heute ${L(A).heute} · ${z.bericht[0].notiz}`;
    });
    pruefe("KOPF-FOLGE: neuerer Kopf später gemessen setzt den Stand (Kern nach Punkt, ROT nach Punkt), ohne Notiz", () => {
        const a = lauf({ [B + ".1"]: [fahrt(B, 1, { sha: ALT, datum: "2026-11-16T13:14:00+01:00" }), fahrt(B, 1, { sha: NEU, datum: "2026-11-16T14:11:00+01:00", preis: heapRot })] });
        const b = lauf({ [A + ".1"]: [fahrt(A, 1, { sha: ALT, datum: "2026-11-16T13:14:00+01:00" }), fahrt(A, 1, { sha: NEU, datum: "2026-11-16T14:11:00+01:00", rot: "Radeon 890M" })] });
        return a.L(B).heute === 0 && a.L(B).kern === 1 && !a.z.bericht[0].notiz.length && b.L(A).heute === 0 && b.L(A).kern === 0 && !b.z.bericht[0].notiz.length
            ? true
            : `Kern-Fall heute ${a.L(B).heute} kern ${a.L(B).kern} · ROT-Fall heute ${b.L(A).heute} kern ${b.L(A).kern}`;
    });
    pruefe("KOPF-FOLGE: Köpfe ohne Vorfahr-Beziehung auf main folgen dem Datum (ROT später nimmt den Punkt)", () => {
        const { L } = lauf({ [A + ".1"]: [fahrt(A, 1, { sha: "0123abcd99", datum: "2026-11-14T10:00:00Z" }), fahrt(A, 1, { sha: "7f778d44c1", datum: "2026-11-15T10:00:00Z", rot: "GTX 1060" })] });
        return L(A).heute === 0 && L(A).kern === 0 ? true : `heute ${L(A).heute} kern ${L(A).kern}`;
    });
    pruefe("KOPF-FOLGE Mutant: ein Zweig-Kopf (nicht auf main) setzt nichts — weder Punkt noch ROT, laut benannt", () => {
        const a = lauf({ [B + ".1"]: fahrt(B, 1, { sha: ZWEIG }) });
        const b = lauf({ [B + ".1"]: fahrt(B, 1, { sha: ZWEIG, rot: "Radeon 890M" }) });
        return a.L(B).heute === 0 && a.L(B).kern === 1 && b.L(B).kern === 1 && /nicht auf der main-Linie: c3f23d23 \(PUNKT\)/.test(a.z.bericht[0].notiz.join())
            ? true
            : `PUNKT-Fall heute ${a.L(B).heute} kern ${a.L(B).kern} · ROT-Fall kern ${b.L(B).kern} · ${a.z.bericht[0].notiz}`;
    });
    pruefe("KOPF-FOLGE Mutant: unbekannter SHA bricht laut mit Namen (feste Tafel)", () => bricht({ [A + ".1"]: fahrt(A, 1, { sha: "deadbeef01" }) }, /SHA deadbeef01 ist im Repo unbekannt/));
    pruefe("KOPF-FOLGE Mutant: rechne ohne Kopf-Folge bricht laut", () => {
        try {
            rechne(neu(), {}, kern0);
            return "brach nicht";
        } catch (e) {
            return e.bruch && /ohne Kopf-Folge/.test(e.message) ? true : e.message;
        }
    });
    // ── DAS HOLEN an einer Fixtur (wie buche.sh selbsttest): ein bare Ursprung, ein Klon, dessen origin/main alt ist ──
    //   c1 ← c3 (main im Ursprung, nach dem Klonen) ← c5 (main später) ; c1 ← c2 (Zweig im Ursprung)
    {
        const os = require("os");
        const t = fs.mkdtempSync(path.join(os.tmpdir(), "buche-2-kopf-"));
        const ursprung = path.join(t, "ursprung.git"),
            klon = path.join(t, "klon");
        const g = (dir, args, o = {}) => {
            const r = spawnSync("git", ["-C", dir, "-c", "core.autocrlf=false", ...args], {
                encoding: "utf8",
                input: o.input,
                env: { ...process.env, GIT_AUTHOR_NAME: "selbsttest", GIT_AUTHOR_EMAIL: "selbsttest@invalid", GIT_COMMITTER_NAME: "selbsttest", GIT_COMMITTER_EMAIL: "selbsttest@invalid",
                    ...(o.zeit ? { GIT_AUTHOR_DATE: o.zeit, GIT_COMMITTER_DATE: o.zeit } : {}) },
            });
            if (r.status !== 0) throw new Error(`Fixtur: git ${args.join(" ")}: ${r.stderr}`);
            return r.stdout.trim();
        };
        let c = {},
            fixtur = "";
        try {
            g(t, ["init", "-q", "--bare", ursprung]);
            const baum = g(ursprung, ["mktree"], { input: "" });
            const commit = (n, eltern, zeit) => g(ursprung, ["commit-tree", baum, ...eltern.flatMap((e) => ["-p", e]), "-m", "c" + n], { zeit });
            c[1] = commit(1, [], "2026-11-16T10:00:00Z");
            g(ursprung, ["update-ref", "refs/heads/main", c[1]]);
            g(t, ["clone", "-q", ursprung, klon]);
            c[2] = commit(2, [c[1]], "2026-11-16T11:00:00Z");
            c[3] = commit(3, [c[1]], "2026-11-16T12:00:00Z");
            g(ursprung, ["update-ref", "refs/heads/zweig", c[2]]);
            g(ursprung, ["update-ref", "refs/heads/main", c[3]]);
        } catch (e) {
            fixtur = e.message;
        }
        pruefe("HOLEN: fehlende Köpfe (Zweig c2, neue main-Spitze c3) werden in EINEM fetch geholt, danach gilt die Folge", () => {
            if (fixtur) return fixtur;
            const K = kopfFolgeAusGit([c[1], c[2], c[3]], {}, klon);
            const [a, z, m] = [K.voll(c[1]), K.voll(c[2]), K.voll(c[3])];
            return K.aufMain(m) && !K.aufMain(z) && K.istAhn(a, m) && K.istAhn(a, z) && !K.istAhn(z, m) ? true : `main ${K.aufMain(m)} zweig ${K.aufMain(z)}`;
        });
        pruefe("HOLEN: ein Kopf liegt lokal, origin/main ist alt und älter als er — der Lauf holt main, der Kopf steht auf main", () => {
            if (fixtur) return fixtur;
            c[5] = commit5();
            function commit5() {
                const baum = g(ursprung, ["rev-parse", c[3] + "^{tree}"]);
                const h = g(ursprung, ["commit-tree", baum, "-p", c[3], "-m", "c5"], { zeit: "2026-11-16T13:00:00Z" });
                g(ursprung, ["update-ref", "refs/heads/probe", h]);
                g(klon, ["fetch", "-q", "origin", "+refs/heads/probe:refs/remotes/origin/probe"]); // lokal da, origin/main noch c3
                g(ursprung, ["update-ref", "refs/heads/main", h]);
                return h;
            }
            const K = kopfFolgeAusGit([c[5], c[2]], {}, klon);
            return K.aufMain(K.voll(c[5])) && !K.aufMain(K.voll(c[2])) ? true : "c5 nicht auf main — die alte Spitze urteilte";
        });
        pruefe("HOLEN scheitert (der SHA steht nirgends im Ursprung): lauter Bruch mit Namen, Akte und Grund, nie das Datum", () => {
            if (fixtur) return fixtur;
            const nie = "0123abcd".repeat(5);
            try {
                kopfFolgeAusGit([c[1], nie], { [nie]: ["x.1.0123abcd-gtx"] }, klon);
                return "brach nicht";
            } catch (e) {
                return e.bruch && new RegExp(`SHA ${nie} ist im Repo unbekannt \\(Akten: x\\.1\\.0123abcd-gtx\\).*Holen von origin \\(main \\+ 1 SHA\\) scheiterte`).test(e.message) ? true : e.message;
            }
        });
        fs.rmSync(t, { recursive: true, force: true });
    }
    pruefe("KOPF-FOLGE git: e4eeee08 ist echter Vorfahre von a635bfee, nicht umgekehrt, beide auf main", () => {
        const K = kopfFolgeAusGit(["e4eeee08", "a635bfee"]);
        const a = K.voll("e4eeee08"),
            n = K.voll("a635bfee");
        return K.istAhn(a, n) && !K.istAhn(n, a) && !K.istAhn(a, a) && K.aufMain(a) && K.aufMain(n) ? true : `ahn ${K.istAhn(a, n)} umgekehrt ${K.istAhn(n, a)}`;
    });
    pruefe("Mutant KLASSE FEHLT in der Karte: höchstens Kern, laut benannt", () => {
        const { L, z } = lauf({ [A + ".1"]: fahrt(A, 1) }, { ohneKlasse: true, klasseWeg: true });
        return L(A).heute === 0 && L(A).kern === 1 && /KLASSE FEHLT/.test(z.bericht[0].warum) ? true : `heute ${L(A).heute} · ${z.bericht[0].warum}`;
    });
    // ── DAS KLASSEN-GESETZ (19.11.): die Lesart, der Fixpunkt, die Mutanten der Wache ──
    {
        const offenDatei = JSON.parse(fs.readFileSync(KLASSE_OFFEN, "utf8"));
        const GK = klassenGesetz(neu());
        const lies = (umfang, erste = false, preis = "P") => umfangLesen(GK, { nr: erste ? 1 : 2, umfang, preis }, [], erste);
        const zeigt = (umfang, klasse, grund) => {
            const r = lies(umfang).sicher;
            const ist = r ? `${GK.namen[r.rang]} (${r.grund})` : "erbt";
            return ist === (klasse ? `${klasse} (${grund})` : "erbt") ? null : `„${umfang}“ → ${ist}`;
        };
        pruefe("KLASSEN-GESETZ Regel 1: die kleinste Zeile, die den Umfang fasst — die Lücke zwischen zwei Zeilen gehört zur höheren", () => {
            const f = [
                zeigt("10² Bauten", "Ort", "zahl:10² Bauten"),
                zeigt("500 Häuser", "Stadt", "zahl:500 Häuser"),
                zeigt("10⁵ Gebäude", "Stadt", "zahl:10⁵ Gebäude"),
                zeigt("10⁶ Bauten", "Megastadt und Kontinent", "zahl:10⁶ Bauten"),
                zeigt("10³ Leiber", "Ort", "zahl:10³ Leiber"),
                zeigt("5 000 Bewohner", "Stadt", "zahl:5 000 Bewohner"),
                zeigt("10⁶ Menschen", "Stadt", "zahl:10⁶ Menschen"),
                zeigt("10⁷ Menschen", "Megastadt und Kontinent", "zahl:10⁷ Menschen"),
                zeigt("Sicht 800 m", "Ort", "zahl:800 m"),
                zeigt("Region 2 km", "Stadt", "zahl:2 km"),
                zeigt("Sicht 20 km", "Stadt", "zahl:20 km"),
                zeigt("25 km", "Megastadt und Kontinent", "zahl:25 km"),
                zeigt("32 × 32 km", "Stadt", "zahl:32 × 32 km"),
                zeigt("Region 10⁴ km²", "Megastadt und Kontinent", "zahl:10⁴ km²"),
                zeigt("ein Dorf", "Ort", "wort:Dorf"),
                zeigt("eine Metropole", "Stadt", "wort:Metropole"),
                zeigt("Megaregion", "Megastadt und Kontinent", "wort:Megaregion"),
                zeigt("Boden bis Orbit", "Planet und Welten", "wort:Orbit"),
            ].filter(Boolean);
            return f.length ? f.join(" · ") : true;
        });
        pruefe("KLASSEN-GESETZ Regel 4: eine Zahl hebt nur mit Träger — „10³ Welten“ ist Planet und Welten wegen „Welten“, „10² Generationen“ erbt", () => {
            const f = [
                zeigt("10³ Welten", "Planet und Welten", "wort:Welten"),
                zeigt("10² Generationen"),
                zeigt("10⁶ Jahre an einem Hang"),
                zeigt("Raffer 10⁵: ein Jahr in 5 min"),
                zeigt("× Uhr × Wetter, Katastrophe"),
                zeigt("10⁴ Arten, 20 Saaten"),
            ].filter(Boolean);
            // die bloße Zahl zählt den Träger der Reihe: mit „Bewohner“ darunter ist 10⁴ sicher die Zeile Stadt, ohne Reihe zählt sie
            // Leiber im Zweifel (Regel 6), in einer Reihe von Dingen („Arten“) hebt sie nicht
            const ohne = umfangLesen(GK, { nr: 3, umfang: "10⁴" }, [null, null]);
            const mit = umfangLesen(GK, { nr: 3, umfang: "10⁴" }, [null, { art: "leiber", wort: "Bewohner", nr: 2 }]);
            const ding = umfangLesen(GK, { nr: 3, umfang: "10⁴" }, [null, { art: "ding", wort: "Arten", nr: 2 }]);
            if (ohne.sicher || !ohne.zweifel || ohne.zweifel.grund !== "zweifel:Träger unklar „10⁴“") f.push("„10⁴“ ohne Reihe: " + JSON.stringify([ohne.sicher, ohne.zweifel]));
            if (ding.sicher || ding.zweifel) f.push("„10⁴“ in der Reihe Arten hob");
            if (!mit.sicher || GK.namen[mit.sicher.rang] !== "Stadt" || mit.sicher.grund !== "zahl:10⁴ (Reihe Bewohner ab S2)") f.push("„10⁴“ in der Reihe Bewohner: " + JSON.stringify(mit.sicher));
            return f.length ? f.join(" · ") : true;
        });
        pruefe("KLASSEN-GESETZ Regel 6: im Zweifel die höhere Zeile — sechs Gründe heben, Himmel vom Boden und der Erd-Schlüssel nicht", () => {
            const f = [];
            // die höhere Lesart: Klasse und klasseGrund beim Wort
            const hebt = (umfang, klasse, grund, erste) => {
                const r = lies(umfang, erste);
                const ist = r.zweifel ? `${GK.namen[r.zweifel.rang]} (${r.zweifel.grund})` : "kein Zweifel";
                if (ist !== `${klasse} (${grund})` || r.fraglich.length) f.push(`„${umfang}“ → ${ist}${r.fraglich.length ? " + ohne Regel" : ""}`);
                return r;
            };
            const P = "Planet und Welten",
                M = "Megastadt und Kontinent";
            if (hebt("Heimat + 1 Fremdwelt", P, "zweifel:Welt-Wechsel „Fremdwelt“", true).sicher) f.push("„1 Fremdwelt“ las ein Welt-Wort als sicher");
            hebt("fremde Ozeane", P, "zweifel:Welt-Wechsel „fremde Ozeane“");
            hebt("EINE Welt, EINE Konstante anders", P, "zweifel:Welt-Wechsel „Konstante anders“", true);
            hebt("g 0,3–3", P, "zweifel:Welt-Wechsel „g 0,3–3“", true);
            hebt("jenseits der Erde", P, "zweifel:Welt-Wechsel „jenseits der Erde“");
            hebt("10⁴ Individuen im Schirm", "Stadt", "zweifel:Träger unklar „10⁴ Individuen“");
            hebt("10⁹: Heuschreckenschwarm", M, "zweifel:Träger unklar „10⁹“");
            hebt("10¹⁰", P, "zweifel:Planet-Maß „10¹⁰“");
            hebt("Flüsse einer Region", "Stadt", "zweifel:Region ohne Größe „Region“", true);
            hebt("Himmel bis zum Horizont, drei Stockwerke", M, "zweifel:Horizont");
            hebt("jeder Meeresboden ~3,6·10⁸ km²", P, "zweifel:Planet-Maß „3,6·10⁸ km²“");
            const zwei = hebt("10³ Häuser, ~50 km", M, "zweifel:zwei Zeilen „10³ Häuser“ gegen „50 km“");
            if (!zwei.sicher || GK.namen[zwei.sicher.rang] !== "Stadt") f.push("zwei Zeilen: die eigene Lesart ist nicht die Zählung");
            // bis 10³ Leiber ist ein Ort: nichts zu heben
            if (lies("10³ Tiere").zweifel) f.push("„10³ Tiere“ hob");
            // Himmel und Feld vom Boden aus: Ort ohne Zweifel, an der ersten Sprosse wie darüber — die Reise hebt
            const stumm = (umfang, erste, preis) => {
                const r = lies(umfang, erste, preis);
                if (r.zweifel || r.fraglich.length) f.push(`„${umfang}“ hebt oder steht ohne Regel`);
                return r;
            };
            if (stumm("1 Stern, 1 Planet, 1 Mond", true).sicher) f.push("erste Sprosse „1 Stern, 1 Planet, 1 Mond“ ist nicht Ort");
            const himmel = stumm("~9 000 Sterne bis mag 6, Planeten wandern");
            if (himmel.sicher || !/^Himmel vom Boden/.test(himmel.bleibt[0] || "")) f.push("„Planeten wandern“ hob oder nennt den Himmel nicht");
            const reise = lies("Planet → Mond (3,8·10⁵ km), Landung");
            if (!reise.sicher || GK.namen[reise.sicher.rang] !== "Planet und Welten") f.push("die Reise „Planet → Mond, Landung“ hob nicht");
            // der Erd-Schlüssel (Spalte Bytes) hebt nicht: die Klasse folgt dem übrigen Umfang
            const erd = stumm("1 Ort, 1 Ereignis-Typ", true, "P · Schlüssel ≤ 10 kB");
            if (!erd.erd || !erd.sicher || erd.sicher.grund !== "wort:1 Ort") f.push("Erd-Schlüssel: „1 Ort“ ist nicht Ort am Wort");
            if (!stumm("Erd-Saat, 10³ Orte").erd) f.push("„Erd-Saat“ nennt den Erd-Schlüssel nicht");
            // DAS GANZE: nennt der Umfang die Erde oder den Planeten selbst, heben beide doch
            hebt("die bewohnte Erde in jedem Jahrhundert seit −3000", P, "zweifel:Planet-Maß „die bewohnte Erde“");
            hebt("jeder Ort der Erde in jedem Jahr, das ein Mensch erinnert", P, "zweifel:Planet-Maß „jeder Ort der Erde“");
            hebt("jedes Biom der Erde (20 Zufallsorte)", P, "zweifel:Planet-Maß „jedes Biom der Erde“");
            hebt("Erdgeschichte 4,5·10⁹ Jahre", P, "zweifel:Planet-Maß „Erdgeschichte“");
            if (lies("mehr Disparität als die Erde").zweifel) f.push("der Vergleich „als die Erde“ hob");
            for (const umfang of ["Planet und Stern sein", "EIN ungeschnittener Raffer vom Magma-Ozean über die Gegenwart bis zur sterbenden Sonne, ein Planet"]) {
                const r = lies(umfang);
                if (!r.sicher || GK.namen[r.sicher.rang] !== P || r.sicher.grund !== "wort:Planet" || r.bleibt.length) f.push(`das Ganze „${umfang.slice(0, 30)}“: ${JSON.stringify(r.sicher)}`);
            }
            // ZWEI REGELN GEGENEINANDER: Himmel vom Boden (Ort) gegen Welt-Wechsel — die höhere Zeile
            hebt("EIN Instrument: Fernrohr auf den Mond der Welt", P, "zweifel:Welt-Wechsel „auf den Mond“", true);
            // Region ohne Größe: Gebiet, „je Ort“, der Fluss als Leib — der Fluss an EINEM Ufer bleibt ein Ort; das Gebirge liegt über den Horizont
            hebt("1 Herrschaftsgebiet", "Stadt", "zweifel:Region ohne Größe „Herrschaftsgebiet“", true);
            hebt("Technikstand je Ort", "Stadt", "zweifel:Region ohne Größe „je Ort“", true);
            hebt("EIN Ding der Welt: der Spieler ist ein Fluss", "Stadt", "zweifel:Region ohne Größe „ist ein Fluss“", true);
            stumm("Flut über Tage, ein Fluss", true);
            hebt("1 Gebirge", M, "zweifel:Horizont „Gebirge“", true);
            // ohne Regel bleibt allein die Zählung von Sternen
            if (!lies("10¹¹ Sterne über 10¹⁰ a").fraglich.length) f.push("„10¹¹ Sterne“ steht nicht ohne Regel");
            return f.length ? f.join(" · ") : true;
        });
        pruefe("KLASSEN-GESETZ Regel 7: schweigt der Umfang zur Größe, spricht die Preis-Pose — zwei Zeilen in der Pose: die höhere", () => {
            const f = [];
            const pose = (umfang, preis, soll) => {
                const r = lies(umfang, true, preis);
                const ist = r.zweifel ? `${GK.namen[r.zweifel.rang]} (${r.zweifel.grund})` : r.sicher ? `${GK.namen[r.sicher.rang]} (${r.sicher.grund})` : "erbt";
                if (ist !== soll) f.push(`„${umfang}“ mit „${preis}“ → ${ist}`);
            };
            pose("1 Ebene, Häuser bis 7 Geschosse", "P · Stadt", "Stadt (pose:Stadt)");
            pose("1 Ware, 1 Weg mit Fahrer", "P · Stadt", "Stadt (pose:Stadt)");
            pose("Kohle und Dampf", "P · Kohlestadt", "Stadt (pose:Kohlestadt)");
            pose("U_eff ≥ 10 (auch aus Liste)", "P · Dorf und Stadt", "Stadt (zweifel:zwei Zeilen „Pose Dorf“ gegen „Pose Stadt“)");
            // die Pose eines Dorfs hebt nichts, die Pose ohne Größen-Wort auch nicht
            pose("1 Sprache: Orts- und Personennamen", "P · Dorf", "erbt");
            pose("1 Ware, 1 Weg mit Fahrer", "P · Fahrt", "erbt");
            // der Umfang spricht: ein Maß, eine Zählung, eine Zahl als Leiber bis 10³ — die Pose schweigt
            pose("Sicht 800 m", "P · Stadt", "Ort (zahl:800 m)");
            pose("10² Bewohner", "P · Stadt", "Ort (zahl:10² Bewohner)");
            pose("10³", "P · Stadt", "erbt");
            pose("10² Nahe tragen Wetter und Arbeit", "P · Test-Stadt bei Regen", "erbt");
            return f.length ? f.join(" · ") : true;
        });
        // der Fixpunkt im Speicher: die Karte, klasse-offen.json und das Blatt, wie `--klassen` sie schreibt
        const fix = () => {
            const k = neu();
            const R = klassenRechnen(k, offenDatei);
            const n = klassenSetzen(k, R);
            return { k, R, n, offen: klassenOffenNeu(offenDatei, R, k), blatt: klassenBlatt(R) };
        };
        const sprosse = (k, id, nr) => finde(k, id).sprossen.find((s) => s.nr === nr);
        pruefe("KLASSEN-GESETZ Fixpunkt: der zweite Lauf ändert 0 Sprossen, klasse-offen.json und das Blatt bleiben byte-gleich, die Wache schweigt", () => {
            const F = fix();
            const R2 = klassenRechnen(F.k, F.offen);
            const n2 = klassenSetzen(F.k, R2);
            const w = klassenWache(F.k, F.offen, F.blatt);
            if (n2 !== 0) return `der zweite Lauf änderte ${n2} Sprosse(n)`;
            if (JSON.stringify(klassenOffenNeu(F.offen, R2, F.k)) !== JSON.stringify(F.offen)) return "klasse-offen.json wandert im zweiten Lauf";
            if (klassenBlatt(R2) !== F.blatt) return "das Blatt wandert im zweiten Lauf";
            return w.length ? `die Wache meldet am Fixpunkt ${w.length}: ${w[0]}` : true;
        });
        pruefe("KLASSEN-GESETZ Soll: Monotonie 0 · ≥ 97 % der Hand gleich · 0 Sprossen leer · ≤ 10 ohne Regel", () => {
            const { R, offen } = fix();
            const hand = R.hand.gleich + R.hand.abweichung.length + R.hand.enthaltung.length;
            const leer = [...R.je.entries()].filter(([, x]) => !x.klasse).map(([k]) => k);
            const zeilen = new Set(offen.offen.map((o) => o.leiter + "#" + o.sprosse));
            if (R.monotonie.length) return `Monotonie: ${R.monotonie[0]}`;
            if (R.hand.gleich / hand < 0.97) return `nur ${R.hand.gleich} von ${hand} der Hand gleich`;
            if (leer.length > 0) return `leer ${leer.length}: ${leer.join(", ")}${leer.some((k) => !zeilen.has(k)) ? " — ohne Zeile in klasse-offen.json: " + leer.filter((k) => !zeilen.has(k)).join(", ") : ""}`;
            if (R.unsicher.length > 10) return `ohne Regel ${R.unsicher.length}: ${R.unsicher.slice(0, 3).map((x) => x.leiter + " S " + x.sprosse).join(", ")}`;
            return true;
        });
        pruefe("KLASSEN-GESETZ Zweifel: jede Sprosse mit klasseGrund „zweifel:“ steht über ihrer eigenen Lesart und über der Sprosse darunter", () => {
            const { k, R } = fix();
            const f = [];
            let n = 0;
            for (const g of k.gruppen)
                for (const L of g.kriterien)
                    L.sprossen.forEach((s, i) => {
                        if (!String(s.klasseGrund).startsWith("zweifel:")) return;
                        n++;
                        const rang = GK.namen.indexOf(s.klasse);
                        const eigen = umfangLesen(GK, s, [], i === 0).sicher;
                        const unten = i ? GK.namen.indexOf(L.sprossen[i - 1].klasse) : -1;
                        if ((eigen && eigen.rang >= rang) || unten >= rang) f.push(`${L.id} S ${s.nr}`);
                    });
            const summe = Object.values(R.zweifel).reduce((a, x) => a + x, 0);
            return f.length ? `nicht gehoben: ${f.slice(0, 3).join(", ")}` : n && n === summe ? true : `Karte ${n} ≠ Zählung ${summe}`;
        });
        pruefe("KLASSEN-GESETZ Hand bleibt: eine von Hand gesetzte Klasse steht nach dem Lauf, die Sprossen darüber ziehen nach", () => {
            const k = neu();
            const id = "mensch.geist.netz"; // „10²“, „10³“, „10⁴“ …: das Gesetz liest Ort bis Sprosse 4
            Object.assign(sprosse(k, id, 3), { klasse: "Stadt", klasseGrund: "hand" });
            klassenSetzen(k, klassenRechnen(k, offenDatei));
            const s = [2, 3, 4].map((nr) => sprosse(k, id, nr));
            return s[0].klasse === "Ort" && s[1].klasse === "Stadt" && s[1].klasseGrund === "hand" && s[2].klasse === "Stadt" && s[2].klasseGrund === "geerbt:S3"
                ? true
                : s.map((x) => `${x.klasse} (${x.klasseGrund})`).join(" · ");
        });
        const mutant = (name, muster, mut) =>
            pruefe(name, () => {
                const F = fix();
                mut(F.k, F);
                const w = klassenWache(F.k, F.offen, F.blatt);
                return w.length === 1 && muster.test(w[0]) ? true : `${w.length} Meldung(en): ${w.slice(0, 2).join(" | ")}`;
            });
        mutant("KLASSEN-WACHE Mutant (a) Klasse unter dem Umfang: „Megastadt“ unter der Klasse Ort ist ROT beim Namen", /^KLASSE UNTER DEM UMFANG: mensch\.stadt\.messlatte S 4 gesetzt „Ort“.*wort:Megastadt → Megastadt und Kontinent$/, (k) => {
            sprosse(k, "mensch.stadt.messlatte", 4).klasse = "Ort";
        });
        mutant("KLASSEN-WACHE Mutant (a) Zahl: „10⁴ Bauten“ unter der Klasse Ort ist ROT beim Namen", /^KLASSE UNTER DEM UMFANG: mensch\.bau\.innen S 4 gesetzt „Ort“.*zahl:10⁴ Bauten → Stadt$/, (k) => {
            sprosse(k, "mensch.bau.innen", 4).klasse = "Ort";
        });
        mutant("KLASSEN-WACHE Mutant (b) Monotonie: eine Sprosse unter der Sprosse darunter ist ROT beim Namen, auch von Hand", /^MONOTONIE: mensch\.bau\.innen S 6 „Ort“ steht unter S 5 „Megastadt und Kontinent“$/, (k, F) => {
            Object.assign(sprosse(k, "mensch.bau.innen", 6), { klasse: "Ort", klasseGrund: "hand" });
            // die Hand ist gesetzt: Blatt und Sprossen darüber folgen ihr, der Bruch der Monotonie bleibt als EINE Meldung
            const R = klassenRechnen(k, F.offen);
            klassenSetzen(k, R);
            F.blatt = klassenBlatt(R);
        });
        mutant("KLASSEN-WACHE Mutant (c) ohne Klasse und ohne Zeile in klasse-offen.json ist ROT beim Namen", /^OHNE KLASSE und ohne Zeile in klasse-offen\.json: mensch\.bau\.innen S 3 /, (k) => {
            const s = sprosse(k, "mensch.bau.innen", 3);
            delete s.klasse;
            delete s.klasseGrund;
        });
        // die alte Regel als Mutante: die Sprosse mit zwei Lesarten („10³ Häuser“ sagt Stadt, „50 km“ sagt Megastadt und Kontinent) trägt
        // die niedrigere — so stand die Karte bis 19.11. an 63 Sprossen
        mutant(
            "KLASSEN-WACHE Mutant (d) Zweifel nach unten: eine Sprosse mit zwei Lesarten, deren Feld die niedrigere trägt, ist ROT beim Namen",
            /^ZWEIFEL NACH UNTEN: mensch\.netz\.gestalt S 2 trägt „Stadt“ \(zahl:10³ Häuser\), der Umfang „10³ Häuser, ~50 km“ hat zwei Lesarten \(zwei Zeilen „10³ Häuser“ gegen „50 km“\) — im Zweifel die höhere: Megastadt und Kontinent$/,
            (k) => {
                Object.assign(sprosse(k, "mensch.netz.gestalt", 2), { klasse: "Stadt", klasseGrund: "zahl:10³ Häuser" });
            }
        );
        mutant("KLASSEN-WACHE Mutant (d) Welt-Wechsel: „fremde Monde“ unter Planet und Welten ist ROT beim Namen", /^ZWEIFEL NACH UNTEN: planet\.wasser\.gezeiten S 7 trägt „Megastadt und Kontinent“ \(geerbt:S6\).*Welt-Wechsel „fremde Monde“.*die höhere: Planet und Welten$/, (k) => {
            Object.assign(sprosse(k, "planet.wasser.gezeiten", 7), { klasse: "Megastadt und Kontinent", klasseGrund: "geerbt:S6" });
        });
        // die Mutanten der Regeln vom zweiten Entscheid (19.11.): je Regel eine der 13 Sprossen, die der Koordinator von Hand setzte — ohne
        // die Hand und auf der alten, niedrigeren Klasse ist sie ROT beim Namen (das Blatt folgt der genommenen Hand)
        const ohneHand = (name, muster, id, nr, klasse, grund) =>
            mutant(name, muster, (k, F) => {
                const s = sprosse(k, id, nr);
                if (s.klasseGrund !== "hand") throw new Error(`${id} S ${nr} steht nicht von Hand`);
                Object.assign(s, { klasse, klasseGrund: grund });
                F.blatt = klassenBlatt(klassenRechnen(k, F.offen));
            });
        ohneHand(
            "KLASSEN-WACHE Mutant Preis-Pose: der Umfang schweigt, die Pose „Stadt“ unter der Klasse Ort ist ROT beim Namen",
            /^KLASSE UNTER DER PREIS-POSE: mensch\.stadt\.vertikal S 1 gesetzt „Ort“.*die Preis-Pose „P · Stadt“ trägt pose:Stadt → Stadt$/,
            "mensch.stadt.vertikal", 1, "Ort", "geerbt:R5"
        );
        ohneHand(
            "KLASSEN-WACHE Mutant Preis-Pose mit zwei Zeilen: „Dorf und Stadt“ unter der Klasse Ort ist ROT beim Namen",
            /^ZWEIFEL NACH UNTEN: mensch\.kultur\.gestalt S 1 trägt „Ort“.*zwei Zeilen „Pose Dorf“ gegen „Pose Stadt“.*die höhere: Stadt$/,
            "mensch.kultur.gestalt", 1, "Ort", "geerbt:R5"
        );
        ohneHand(
            "KLASSEN-WACHE Mutant zwei Regeln gegeneinander: „Fernrohr auf den Mond“ als Himmel vom Boden (Ort) ist ROT beim Namen",
            /^ZWEIFEL NACH UNTEN: erleben\.spieler\.forscher S 1 trägt „Ort“.*Welt-Wechsel „auf den Mond“.*die höhere: Planet und Welten$/,
            "erleben.spieler.forscher", 1, "Ort", "geerbt:R5"
        );
        ohneHand(
            "KLASSEN-WACHE Mutant das Ganze (Erde): „die bewohnte Erde“ als Erd-Schlüssel ohne Hebung ist ROT beim Namen",
            /^ZWEIFEL NACH UNTEN: mensch\.zeit\.erde S 4 trägt „Stadt“.*Planet-Maß „die bewohnte Erde“.*die höhere: Planet und Welten$/,
            "mensch.zeit.erde", 4, "Stadt", "geerbt:S3"
        );
        ohneHand(
            "KLASSEN-WACHE Mutant das Ganze (Planet): „Planet und Stern sein“ als Himmel vom Boden ist ROT beim Namen",
            /^KLASSE UNTER DEM UMFANG: erleben\.spieler\.nichtleib S 5 gesetzt „Stadt“.*wort:Planet → Planet und Welten$/,
            "erleben.spieler.nichtleib", 5, "Stadt", "geerbt:S4"
        );
        ohneHand(
            "KLASSEN-WACHE Mutant Region ohne Größe: „1 Herrschaftsgebiet“ unter der Klasse Ort ist ROT beim Namen",
            /^ZWEIFEL NACH UNTEN: mensch\.macht\.grenze S 1 trägt „Ort“.*Region ohne Größe „Herrschaftsgebiet“.*die höhere: Stadt$/,
            "mensch.macht.grenze", 1, "Ort", "geerbt:R5"
        );
        ohneHand(
            "KLASSEN-WACHE Mutant Horizont: „1 Gebirge“ unter Megastadt und Kontinent ist ROT beim Namen",
            /^ZWEIFEL NACH UNTEN: planet\.kopplung\.land-meer-luft S 1 trägt „Ort“.*Horizont „Gebirge“.*die höhere: Megastadt und Kontinent$/,
            "planet.kopplung.land-meer-luft", 1, "Ort", "geerbt:R5"
        );
        mutant("KLASSEN-WACHE Mutant Blatt: ein Blatt, das dem Gesetz nicht folgt, ist ROT", /^BLATT nicht am Stand/, (k, F) => {
            F.blatt = F.blatt.replace("## C ·", "## C  ·");
        });
        // die Linse an der echten Karte: Karte, klasse-offen.json und Blatt im Repo stehen am Fixpunkt
        pruefe("KLASSEN-WACHE an der Karte im Repo: jede Sprosse trägt ihre Klasse nach dem Gesetz oder eine Zeile in klasse-offen.json", () => {
            const w = klassenWacheLesen(neu());
            return w.length ? `${w.length} Verstoß/Verstöße — ${w.slice(0, 3).join(" | ")}` : true;
        });
    }
    pruefe("TAFEL Mutant: eine Tafel-Zeile auf eine Sprosse ohne Klasse wird beim Namen gemeldet, die mit Klasse nicht, kein Abbruch", () => {
        const k = neu();
        delete finde(k, B).sprossen[0].klasse; // die Mutante: die Klasse vergessen
        const tafel = { zeilen: [{ station: "x.K1#1", leiter: B, sprosse: 1, richter: "gleich" }, { station: "y.K2#1", leiter: "erleben.klang.ereignis", sprosse: 1, richter: "gleich" }] };
        const aus = tafelOhneKlasse(k, tafel);
        return aus.length === 1 && aus[0].startsWith("x.K1#1 → " + B + " S 1") && /KLASSE FEHLT/.test(aus[0]) && tafelOhneKlasse(neu(), tafel).length === 0
            ? true
            : JSON.stringify(aus);
    });
    pruefe("Mutant Akte misst eine andere Stufe als die Klasse der Karte: bricht laut", () =>
        bricht({ [A + ".1"]: fahrt(A, 1, { preis: { stufe: "Stadt", ankunft_kalt_s: 3 } }) }, /die Karte verlangt „Ort“/)
    );
    pruefe("Mutant Dateiname nennt einen anderen SHA als die Fahrt: bricht laut", () =>
        bricht({ [A + ".1.0123abcd-radeon"]: fahrt(A, 1, { geraete: ["Radeon 890M"] }) }, /der Name nennt 0123abcd/)
    );
    pruefe("Mutant Brücke weicht von BRUECKE.md ab: bricht laut", () => {
        try {
            brueckeLesen(fs.readFileSync(BRUECKE, "utf8").replace("| `leben.pflanzen.kraft` | 0 | 1 |", "| `leben.pflanzen.kraft` | 0 | 2 |"));
            return "brach nicht";
        } catch (e) {
            return /leben.pflanzen.kraft: Tafel 2/.test(e.message) ? true : e.message;
        }
    });
    pruefe("ein Nicht-Akten-Name in vision/richter/ bricht laut (die Tafel-Zeilen der Richter-Fabrik stehen in der Tafel, nie dort)", () => {
        const t = fs.mkdtempSync(path.join(require("os").tmpdir(), "buche-2-zeilen-"));
        try {
            fs.writeFileSync(path.join(t, "zeilen-mensch.json"), JSON.stringify({ lesart: "x", zeilen: [] }));
            return bricht(aktenLesen(t), /Akte „zeilen-mensch“: Name muss/);
        } finally {
            fs.rmSync(t, { recursive: true, force: true });
        }
    });
    pruefe("Z1 gewichtet: ein Punkt wiegt 1/Sprossen ÷ Leitern ÷ Perspektiven ÷ Kapitel", () => {
        const { k, z } = lauf({ [A + ".1"]: fahrt(A, 1) });
        // platten: 1/7 Sprossen, geologie 7 Leitern, planet 6 Perspektiven, 7 Kapitel → 1/7/7/6/7 = 0,049 %
        const erwartet = prozent1(1 / finde(k, A).sprossen.length / 7 / 6 / 7);
        return z.heute === 1 && k.summe.anteilHeute === erwartet ? true : `anteil ${k.summe.anteilHeute} ≠ ${erwartet}`;
    });
    console.log(`SELBSTTEST buche-2: ${ok} GRÜN, ${fehl} ROT`);
    process.exit(fehl ? 1 : 0);
}

// ───────────────────────── Haupt ─────────────────────────
function haupt(argv) {
    if (argv.includes("--selbsttest")) return selbsttest();
    if (argv.includes("--klassen")) return klassenBefehl(argv);
    const arg = (n, d) => (argv.includes(n) ? argv[argv.indexOf(n) + 1] : d);
    const karteDatei = path.resolve(arg("--karte", KARTE));
    const aktenDir = path.resolve(arg("--akten", AKTEN));
    const trocken = argv.includes("--trocken");
    const roh = fs.readFileSync(karteDatei, "utf8");
    const karte = JSON.parse(roh);
    const kern0 = brueckeLesen(fs.readFileSync(BRUECKE, "utf8"));
    const akten = aktenLesen(aktenDir);
    const wo = {}; // SHA → Akten, die ihn tragen (für den Bruch beim Namen)
    for (const [datei, inhalt] of Object.entries(akten))
        for (const f of [].concat(inhalt)) if (f && typeof f.sha === "string") (wo[f.sha.toLowerCase()] = wo[f.sha.toLowerCase()] || []).push(datei);
    const z = rechne(karte, akten, kern0, kopfFolgeAusGit(Object.keys(wo), wo));
    const aus = schreibe(karte);
    if (!trocken && aus !== roh) fs.writeFileSync(karteDatei, aus);
    if (!trocken && karteDatei === KARTE) execFileSync(process.execPath, [path.join(__dirname, "seite-bauen.cjs")], { stdio: "ignore" });
    // DER STAND ALS KLEINE DATEI (15.11.: die Karte 2 ist der Zähler; der Messplatz-Blick liest je Takt diese drei Zahlen statt der
    // 700-KB-Karte). Ohne Uhrzeit: die Datei ändert sich nur, wenn sich die Zahl ändert. Leser: zug/dienst/messplatz-blick.cjs (Stern).
    if (!trocken && karteDatei === KARTE) fs.writeFileSync(path.join(__dirname, "karte-2-stand.json"), JSON.stringify({ sprossen: z.sprossen, heute: z.heute, kern: z.kern, anteil: z.anteil, beide: z.beide, nachwache: z.nachwache }) + "\n");
    if (trocken || karteDatei !== KARTE) {
        const vor = JSON.parse(roh);
        const alt = new Map();
        for (const g of vor.gruppen) for (const L of g.kriterien) alt.set(L.id, [L.heute, L.kern]);
        for (const g of karte.gruppen)
            for (const L of g.kriterien) {
                const [h, k] = alt.get(L.id);
                if (h !== L.heute || k !== L.kern) console.log(`  ${L.id}: heute ${h} → ${L.heute} · kern ${k} → ${L.kern}`);
            }
    }
    for (const b of z.bericht) console.log(`  ${b.leiter} S ${b.sprosse}: ${b.stand === "NULL" ? "0" : b.stand} — ${b.warum}${b.notiz.map((n) => " · " + n).join("")}`);
    for (const t of tafelZeilen(tafelOhneKlasse(karte, JSON.parse(fs.readFileSync(TAFEL, "utf8"))))) console.log(t);
    // die Wache des Klassen-Gesetzes je Buchungs-Lauf: laut beim Namen, kein Abbruch (die Buchung liest nur das Feld und bleibt richtig)
    if (karteDatei === KARTE) {
        const w = klassenWacheLesen(karte);
        for (const x of w.slice(0, 20)) console.log("  KLASSEN-GESETZ: " + x);
        console.log(`KLASSEN: ${w.length} Verstoß/Verstöße gegen das Klassen-Gesetz${w.length > 20 ? " (die ersten 20 beim Namen)" : ""}${w.length ? " — node vision/buche-2.cjs --klassen" : ""}`);
    }
    console.log(zeile(z));
}

if (require.main === module) {
    try {
        haupt(process.argv.slice(2));
    } catch (e) {
        console.error(e.message);
        process.exit(2);
    }
}
module.exports = { rechne, fahrtUrteil, preisUrteil, treppeLesen, brueckeLesen, lastVon, kopfFolgeAusGit, kopfFolgeFest, tafelOhneKlasse, klassenGesetz, umfangLesen, klassenRechnen, klassenWache };
