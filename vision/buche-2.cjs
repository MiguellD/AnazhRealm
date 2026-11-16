// buche-2.cjs — die Buchung der Meisterkarte 2: aus Richter-Akten werden HEUTE und KERN (Regeln Z1–Z8 in vision/REGELN.md).
//
// Aufruf:  node vision/buche-2.cjs                    liest vision/richter/, schreibt die Karte zurück, baut die Seite
//          node vision/buche-2.cjs --akten DIR --karte DATEI [--trocken]   andere Akten/Karte (Probe); --trocken schreibt nichts
//          node vision/buche-2.cjs --selbsttest        Mutanten gegen die echte Karte im Speicher, schreibt nichts
//
// Die Maschine fasst in der Karte NUR an: kriterien[].heute, kriterien[].kern (in Glieder-Leitern dazu heuteSprossen, kernSprossen),
// gruppen[].summe.{heute,kern,kernDazu,anteilHeute,anteilKern} und summe.{…}. Keine Sprosse, kein Soll, keine Klasse, kein Text.
//
// ── DIE AKTE ── vision/richter/<leiter-id>.<sprosse>.json (von Hand) oder <leiter-id>.<sprosse>.<sha8>-<gerät>.json (die Mess-Sitzung,
// vision/richter-akte.cjs: je Gerät und Kopf eine Datei — zwei Geräte schreiben nie in dieselbe). Alle Dateien einer Sprosse werden
// zusammen gelesen; die Fahrten DESSELBEN SHA vereinen ihre Geräte zu EINER Fahrt (je Gerät die jüngste).
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
//                    "ankunft_kalt_s": 4.2,                       // Pflicht ab Stufe Stadt
//                    "wachstum_mb_min": 1.1, "ton_aussetzer": 0,   // geprüft, wenn angegeben
//                    "referenz": { "f": 1.08, … },               // die Referenzfahrt derselben Sitzung (DIE LAST AM PREIS, unten)
//                    "urteil": "GRÜN" | "ROT" | "UNGEMESSEN …" } },
//     { "geraet": "GTX 1060", … }
//   ]
// }
// Die Schwellen des Preises liest die Maschine aus preisTreppe der Karte (EINE Quelle) und rechnet das Preis-Urteil selbst nach;
// ein Preis-Urteil, das den eigenen Zahlen widerspricht, bricht laut.
//
// ── DAS URTEIL EINER FAHRT ──
//   ROT     : ein Gerät misst den Richter ROT                         → die Sprosse fällt auf 0 (auch der Kern der Brücke, Z4)
//   nichts  : nicht beide Standardgeräte (Z7) mit Richter GRÜN       → hebt nichts, nimmt nichts (Z2, Z7)
//   KERN    : beide GRÜN, aber ein Preis fehlt, ist unvollständig, UNGEMESSEN unter Last oder ROT (R3: fehlende Preis-Zahl ist ROT), oder die Karte nennt
//             für die Sprosse keine klasse („KLASSE FEHLT“, laut im Bericht) → Kern (Z5)
//   PUNKT   : beide GRÜN und der Preis hält an beiden Geräten         → Punkt (Z2)
// Die Fahrten einer Sprosse laufen nach Datum; jede ROT-, KERN- oder PUNKT-Fahrt setzt den Stand, „nichts“ lässt ihn (Ratsche Z4) —
// unter dem Gesetz der KOPF-FOLGE:
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
// Z7, Stand 2026: das Standardgerät ist eine Klasse aus zwei Geräten; jede Buchung braucht beide.
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
        const spErbe = erb("speicher");
        if (spErbe) Object.assign(s, { heap: spErbe.heap, vram: spErbe.vram, wachstum: spErbe.wachstum });
        else {
            const h = /Heap ≤ (\d+(?:,\d+)?) (MB|GB)/.exec(t.speicher),
                v = /VRAM ≤ (\d+) MB/.exec(t.speicher),
                w = /Wachstum ≤ (\d+(?:,\d+)?) MB\/min/.exec(t.speicher);
            if (!h || !v) bruch(`Preis-Treppe ${t.klasse}: Speicher unlesbar`);
            s.heap = zahl(h[1]) * (h[2] === "GB" ? 1024 : 1);
            s.vram = +v[1];
            s.wachstum = w ? zahl(w[1]) : 0; // „kein Wachstum mit dem Weg“
        }
        const a = /≤ (\d+(?:,\d+)?) s/.exec(t.ankunft);
        s.ankunft = a ? zahl(a[1]) : null; // null: keine Schranke in der Sprosse
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
//   Zeit-Zahl > Soll, Referenz f > Band      → „UNGEMESSEN unter Last ×f“ — zählt wie ein fehlender Preis: kein Punkt, kein Kern-Verlust
//   Zeit-Zahl > Soll, keine Referenz         → „UNGEMESSEN ohne Referenz“ — nie ein Urteil ohne Maßstab
const REFERENZ_RUHE_BAND = require(path.join(__dirname, "..", "meisterkarte-quelle", "punkte", "punkte.cjs")).REFERENZ_RUHE_BAND;
if (!(REFERENZ_RUHE_BAND >= 1)) bruch("punkte.cjs exportiert kein REFERENZ_RUHE_BAND — die Last am Preis hätte keinen Maßstab");
const komma = (x, n) => (+x).toFixed(n).replace(".", ",");
function lastVon(R) {
    if (!R || typeof R !== "object") return { ruhig: false, wort: "UNGEMESSEN ohne Referenz" };
    if (R.fehler || !Number.isFinite(R.f)) return { ruhig: false, wort: "UNGEMESSEN ohne Referenz (" + String(R.fehler || "f fehlt").slice(0, 80) + ")" };
    return R.f <= REFERENZ_RUHE_BAND ? { ruhig: true } : { ruhig: false, wort: "UNGEMESSEN unter Last ×" + komma(R.f, 2) };
}
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
    reisst("Heap", gehaltenVon(p, "heap_mb"), s.heap, "MB", 1);
    reisst("VRAM", gehaltenVon(p, "vram_mb"), s.vram, "MB", 1);
    reisst("Wachstum", p.wachstum_mb_min, s.wachstum, "MB/min", 1);
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
    const pflicht = ["bild_p95_ms", "bild_max_ms", "heap_mb", "vram_mb"].concat(s.ankunft != null ? ["ankunft_kalt_s"] : []);
    if (pflicht.some((k) => typeof p[k] !== "number")) return "FEHLT";
    // fest: an fremder Last nie gebunden — urteilen wie gemessen, und zwar das GEHALTENE (`gehaltenVon`)
    let fest = gehaltenVon(p, "heap_mb") <= s.heap && gehaltenVon(p, "vram_mb") <= s.vram && (s.ankunft == null || p.ankunft_kalt_s <= s.ankunft);
    if (typeof p.wachstum_mb_min === "number") fest = fest && p.wachstum_mb_min <= s.wachstum;
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

// EINE Fahrt (alle Geräte EINES SHA) → { u: "ROT" | "NICHTS" | "KERN" | "PUNKT", warum }
function fahrtUrteil(f, sprosse, T, wo) {
    fahrtPruefen(f, sprosse, wo);
    const am = "am " + f.sha.slice(0, 8);
    const rot = f.geraete.filter((g) => g.richter.urteil === "ROT");
    if (rot.length) return { u: "ROT", warum: `Richter ROT an ${rot.map((g) => g.geraet).join(" + ")} ${am}` };
    const je = STANDARD.map((S) => f.geraete.find((g) => S.muster.test(String(g.geraet || ""))));
    if (je.some((g) => !g)) // ein Gerät hebt nie (Z7)
        return { u: "NICHTS", warum: `kein Punkt, nur ein Gerät (${f.geraete.map((g) => g.geraet).join(" + ")}) ${am} — es fehlt ${STANDARD.filter((S, i) => !je[i]).map((S) => S.name).join(" + ")}` };
    const preise = je.map((g) => preisUrteil(g.preis, T, `${wo} ${g.geraet}`, sprosse.klasse));
    if (preise.every((p) => p === "GRÜN")) return { u: "PUNKT", warum: `Richter GRÜN und Preis (${sprosse.klasse}) GRÜN an beiden Geräten ${am}` };
    if (preise.includes("OHNE-KLASSE")) return { u: "KERN", warum: `KLASSE FEHLT in der Karte für diese Sprosse — der Preis ist nicht prüfbar, höchstens Kern ${am}` };
    const mitGrund = (g, i) => {
        const grund = preise[i] === "GRÜN" ? "" : preisGrund(g.preis, T, sprosse.klasse);
        return g.geraet + " " + preise[i] + (grund ? " (" + grund + ")" : "");
    };
    return { u: "KERN", warum: `Richter GRÜN an beiden, Preis ${je.map(mitGrund).join(" · ")} ${am} — Kern (Z5)` };
}

// die Fahrten einer Sprosse: je SHA EINE Fahrt (die Geräte verschiedener Akten-Dateien vereint, je Gerät die jüngste), nach Datum
const geraetKlasse = (name) => {
    const S = STANDARD.find((S) => S.muster.test(String(name || "")));
    return S ? S.name : String(name);
};
function fahrtenJeSha(liste) {
    const je = new Map();
    for (const f of liste) {
        const k = String(f.sha).slice(0, 8);
        if (!je.has(k)) je.set(k, []);
        je.get(k).push(f);
    }
    return [...je.values()]
        .map((teile) => {
            teile.sort((a, b) => Date.parse(a.datum) - Date.parse(b.datum));
            const g = new Map();
            for (const t of teile) for (const x of t.geraete || []) g.set(geraetKlasse(x.geraet), x);
            const letzte = teile[teile.length - 1];
            return { ...letzte, sha: teile.map((t) => t.sha).sort((a, b) => b.length - a.length)[0], geraete: [...g.values()], teile };
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
// git, EIN Aufruf je Lauf: `git log` von MAIN_REF und allen Köpfen der Akten, je Commit seine Eltern; die Spitze von MAIN_REF trägt die
// Dekoration. Ein unbekannter SHA lässt git laut scheitern („bad revision“) — der Bruch nennt ihn und seine Akten.
function kopfFolgeAusGit(shas, wo = {}, repo = path.join(__dirname, "..")) {
    const kurz = [...new Set(shas.map((s) => String(s).toLowerCase()))].filter((s) => /^[0-9a-f]{7,40}$/.test(s));
    const unbekannt = (s, grund) => bruch(`KOPF-FOLGE: der SHA ${s} ist im Repo unbekannt${wo[s] ? " (Akten: " + wo[s].join(", ") + ")" : ""}${grund ? " — " + grund : ""}; git fetch origin main — das Datum ersetzt die Kopf-Folge nie`);
    const r = spawnSync("git", ["-C", repo, "log", "--format=%H %P%x09%D", "--decorate-refs=refs/remotes/" + MAIN_REF, MAIN_REF, ...kurz, "--"], { encoding: "utf8", maxBuffer: 1 << 28 });
    if (r.error) bruch(`KOPF-FOLGE: git startet nicht (${r.error.message})`);
    if (r.status !== 0) {
        const m = /bad revision '([^']+)'|ambiguous argument '([^']+)'|short object ID (\S+) is ambiguous/.exec(r.stderr || "");
        const s = m && (m[1] || m[2] || m[3]);
        if (s === MAIN_REF) bruch(`KOPF-FOLGE: ${MAIN_REF} fehlt im Repo ${repo}`);
        if (s) unbekannt(s.toLowerCase(), String(r.stderr).trim().split("\n")[0]);
        bruch(`KOPF-FOLGE: git log scheitert (${String(r.stderr).trim().slice(0, 200)})`);
    }
    const eltern = new Map();
    let spitze = null;
    for (const z of r.stdout.split("\n")) {
        if (!z) continue;
        const [kopf, deko] = z.split("\t");
        const [h, ...p] = kopf.split(" ").filter(Boolean);
        eltern.set(h, p);
        if (deko && deko.split(", ").includes(MAIN_REF)) spitze = h;
    }
    if (!spitze) bruch(`KOPF-FOLGE: die Spitze von ${MAIN_REF} steht nicht in der Ausgabe von git log`);
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
    const erreichbar = (von) => {
        const seen = new Set([von]),
            stapel = [von];
        while (stapel.length) for (const p of eltern.get(stapel.pop()) || []) if (!seen.has(p)) seen.add(p), stapel.push(p);
        return seen;
    };
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
    for (const [k, { id, nr, sp, liste }] of [...jeSprosse.entries()].sort()) {
        let s = stand.get(k) || "NULL",
            warum = "";
        const notiz = [], // was nicht setzte, laut: Zweig-Köpfe und überholte Köpfe
            setzer = []; // die vollen SHA der Fahrten, die den Stand dieser Sprosse schon setzten (ROT, KERN, PUNKT)
        fahrtenJeSha(liste).forEach((f, i) => {
            const r = fahrtUrteil(f, sp, T, `Sprosse ${id} S ${nr} Fahrt ${i + 1}`); // auch die nicht setzende Fahrt bricht laut
            const h = kopf.voll(f.sha),
                h8 = h.slice(0, 8);
            if (!kopf.aufMain(h)) return void notiz.push(`nicht auf der main-Linie: ${h8} (${r.u}) setzt nichts`);
            const neuer = setzer.find((g) => kopf.istAhn(h, g));
            if (neuer) return void notiz.push(`überholt: ${h8} (${r.u}) ist Vorfahre von ${neuer.slice(0, 8)}`);
            warum = r.warum;
            if (r.u === "NICHTS") return;
            setzer.push(h);
            s = r.u === "ROT" ? "NULL" : r.u;
        });
        stand.set(k, s);
        bericht.push({ leiter: id, sprosse: nr, stand: s, warum, notiz });
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
    Object.assign(karte.summe, { heute: H, kern: K, kernDazu: K, anteilHeute: prozent1(mittel(kapH)), anteilKern: prozent1(mittel(kapK)) });
    return { heute: H, kern: K, sprossen: karte.summe.sprossen, anteil: karte.summe.anteilHeute, stand, bericht };
}

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

const schreibe = (karte) => JSON.stringify(karte, null, 1) + "\n";
const zeile = (z) => `KARTE 2: ${z.heute} von ${z.sprossen} gebucht (${z.anteil.toFixed(1).replace(".", ",")} %), ${z.kern} im Kern`;

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
    const FASSUNG = treppeLesen(neu()).fassung;
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
    // die Probe-Leitern A und G tragen im Speicher die Klasse Ort (die Karte setzt sie nur für die zehn ersten Richter)
    const lauf = (akten, o = {}) => {
        const k = neu();
        if (!o.ohneKlasse) for (const id of [A, G]) for (const s of finde(k, id).sprossen) s.klasse = s.klasse || "Ort";
        if (o.klasse) finde(k, A).sprossen[0].klasse = o.klasse;
        const z = rechne(k, akten, kern0, o.kopf || KOPF);
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
    pruefe("Mutant ein Gerät: hebt nichts", () => {
        const { L, z } = lauf({ [A + ".1"]: fahrt(A, 1, { geraete: ["Radeon 890M"] }) });
        const w = z.bericht[0] && z.bericht[0].warum;
        return L(A).heute === 0 && L(A).kern === 0 && z.heute === 0 && z.kern === 19 && /kein Punkt, nur ein Gerät .*es fehlt GTX 1060/.test(w) ? true : `heute ${L(A).heute} kern ${L(A).kern} · ${w}`;
    });
    pruefe("Mutant zwei Radeon statt Radeon + GTX: hebt nichts", () => {
        const { L } = lauf({ [A + ".1"]: fahrt(A, 1, { geraete: ["Radeon 890M", "Radeon 890M (zweiter Lauf)"] }) });
        return L(A).heute === 0 && L(A).kern === 0 ? true : `heute ${L(A).heute} kern ${L(A).kern}`;
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
    pruefe("LAST: Referenz gerissen + größtes Bild über Soll, Heap über Soll = ROT (Heap hängt nie an Last)", () =>
        preisUrteil(preis({ bild_max_ms: 134, heap_mb: 427, referenz: unterLast, urteil: undefined }), treppeLesen(neu()), "t", "Ort") === "ROT" || "nicht ROT");
    pruefe("LAST: Preis unter Soll = GRÜN, egal welche Last (gerissen, ohne Referenz)", () =>
        preisUrteil(preis({ referenz: { f: 9 } }), treppeLesen(neu()), "t", "Ort") === "GRÜN" && preisUrteil(preis(), treppeLesen(neu()), "t", "Ort") === "GRÜN" || "nicht GRÜN");
    pruefe("LAST: Bild über Soll ohne Referenz (alte Akte) = UNGEMESSEN ohne Referenz, nie ROT", () =>
        /^UNGEMESSEN ohne Referenz/.test(preisUrteil(preis({ bild_p95_ms: 40, urteil: undefined }), treppeLesen(neu()), "t", "Ort")) || "falsch");
    pruefe("LAST: Mutant „UNGEMESSEN“ über ruhiger Referenz behauptet: bricht laut", () =>
        bricht({ [A + ".1"]: fahrt(A, 1, { preis: { bild_p95_ms: 40, referenz: ruhig, urteil: "UNGEMESSEN unter Last ×1,05" } }) }, /widerspricht den eigenen Zahlen/));
    pruefe("Mutant Stadt-Preis ohne Ankunft: Kern statt Punkt", () => {
        const { L } = lauf({ [A + ".1"]: fahrt(A, 1, { preis: { stufe: "Stadt", urteil: undefined } }) }, { klasse: "Stadt" });
        return L(A).heute === 0 && L(A).kern === 1 ? true : `heute ${L(A).heute} kern ${L(A).kern}`;
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
    pruefe("TREPPE: die Karte nennt ihre Fassung, Ort trägt 34 · 101 ms und VRAM 256 MB", () =>
        (!!FASSUNG && T0.Ort.p95 === 34 && T0.Ort.max === 101 && T0.Ort.vram === 256 && T0.Ort.heap === 400) || JSON.stringify([FASSUNG, T0.Ort]));
    pruefe("RASTER: ein sauberer 30-Bilder-Gang am 120-Hz-Schirm (p95 33,47 ms, Aussetzer 100,4 ms) = GRÜN", () =>
        preisUrteil(preis({ bild_p95_ms: 33.47, bild_max_ms: 100.4, urteil: undefined }), T0, "t", "Ort") === "GRÜN" || "nicht GRÜN");
    pruefe("RASTER Mutant: fünf Takte (p95 41,8 ms) in Ruhe = ROT; ein Bild von 108,4 ms in Ruhe = ROT", () =>
        (preisUrteil(preis({ bild_p95_ms: 41.8, referenz: ruhig, urteil: undefined }), T0, "t", "Ort") === "ROT" &&
            preisUrteil(preis({ bild_max_ms: 108.4, referenz: ruhig, urteil: undefined }), T0, "t", "Ort") === "ROT") || "nicht ROT");
    pruefe("GEHALTEN: Spitze 457 MB über dem Soll, gehalten 258 MB darunter = GRÜN (die Spitze ist Lesewert)", () =>
        preisUrteil(preis({ heap_mb: 457.4, posten: { heap_mb: 258, vram_mb: 125 }, urteil: undefined }), T0, "t", "Ort") === "GRÜN" || "nicht GRÜN");
    pruefe("GEHALTEN Mutant: gehalten 411 MB reißt, auch wenn die Akte nichts sonst reißt = ROT", () =>
        preisUrteil(preis({ heap_mb: 457.4, posten: { heap_mb: 411, vram_mb: 133 }, urteil: undefined }), T0, "t", "Ort") === "ROT" || "nicht ROT");
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
    pruefe("Mutant zwei Geräte an verschiedenen SHA: hebt nichts (Z2)", () => {
        const { L } = lauf({ [B + ".1.7f778d44-radeon"]: fahrt(B, 1, { geraete: ["Radeon 890M"] }),
            [B + ".1.0123abcd-gtx"]: fahrt(B, 1, { geraete: ["GTX 1060"], sha: "0123abcd99" }) });
        return L(B).heute === 0 && L(B).kern === 1 ? true : `heute ${L(B).heute} kern ${L(B).kern}`;
    });
    // ── DIE KOPF-FOLGE: der Fall der GTX 16.11. (13:14 am a635bfee Preis ROT, 14:11 am Vorfahren e4eeee08 Preis GRÜN) ──
    const heapRot = { heap_mb: 491, urteil: "ROT" };
    pruefe("KOPF-FOLGE Mutant: ältere Kopf-Fahrt später gemessen hebt nicht — Kern am a635bfee bleibt, laut „überholt“", () => {
        const { L, z } = lauf({ [B + ".1"]: [fahrt(B, 1, { sha: NEU, datum: "2026-11-16T13:14:00+01:00", preis: heapRot }), fahrt(B, 1, { sha: ALT, datum: "2026-11-16T14:11:00+01:00" })] });
        const b = z.bericht[0];
        return L(B).heute === 0 && L(B).kern === 1 && /am a635bfee/.test(b.warum) && b.notiz.join() === "überholt: e4eeee08 (PUNKT) ist Vorfahre von a635bfee" ? true : `heute ${L(B).heute} kern ${L(B).kern} · ${b.warum} · ${b.notiz}`;
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
    pruefe("KOPF-FOLGE git: unbekannter SHA bricht laut mit Namen und Akte", () => {
        try {
            kopfFolgeAusGit(["0123abcd99"], { "0123abcd99": ["x.1.0123abcd-gtx"] });
            return "brach nicht";
        } catch (e) {
            return e.bruch && /SHA 0123abcd99 ist im Repo unbekannt \(Akten: x\.1\.0123abcd-gtx\)/.test(e.message) ? true : e.message;
        }
    });
    pruefe("KOPF-FOLGE git: e4eeee08 ist echter Vorfahre von a635bfee, nicht umgekehrt, beide auf main", () => {
        const K = kopfFolgeAusGit(["e4eeee08", "a635bfee"]);
        const a = K.voll("e4eeee08"),
            n = K.voll("a635bfee");
        return K.istAhn(a, n) && !K.istAhn(n, a) && !K.istAhn(a, a) && K.aufMain(a) && K.aufMain(n) ? true : `ahn ${K.istAhn(a, n)} umgekehrt ${K.istAhn(n, a)}`;
    });
    pruefe("Mutant KLASSE FEHLT in der Karte: höchstens Kern, laut benannt", () => {
        const { L, z } = lauf({ [A + ".1"]: fahrt(A, 1) }, { ohneKlasse: true });
        return L(A).heute === 0 && L(A).kern === 1 && /KLASSE FEHLT/.test(z.bericht[0].warum) ? true : `heute ${L(A).heute} · ${z.bericht[0].warum}`;
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
    if (!trocken && karteDatei === KARTE) fs.writeFileSync(path.join(__dirname, "karte-2-stand.json"), JSON.stringify({ sprossen: z.sprossen, heute: z.heute, kern: z.kern, anteil: z.anteil }) + "\n");
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
module.exports = { rechne, fahrtUrteil, preisUrteil, treppeLesen, brueckeLesen, lastVon, kopfFolgeAusGit, kopfFolgeFest };
