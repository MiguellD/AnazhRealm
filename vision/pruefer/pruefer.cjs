// pruefer.cjs — DER BLIND-PRÜFER der Meisterkarte 2 (R11, vision/REGELN.md; 26.11., Zweig pm-pruefer). Wo ein Richter-Satz ein
// Urteil am Bild verlangt, das früher ein Menschen-Panel sprach, urteilt ein eingefrorenes Modell in frischem Kontext — blind, an
// gemischten Blättern, geeicht an Ankern mit bekannter Wahrheit. Diese Datei ist das Werkzeug UND der Leser der Akte:
//
//   node vision/pruefer/pruefer.cjs blatt   --paare <ordner> --aus <ordner> --zuordnung <ordner> [--saat N]
//        <ordner>/paare.json + Bilder → ein BLINDES Blatt (blatt.json + Bilder unter Zufallsnamen, Metadaten entfernt, Seiten und
//        Reihenfolge per Saat gemischt) und GETRENNT davon die Zuordnung (zuordnung.json: Wahrheit, Herkunft, Hashes). Das Blatt nennt
//        nur den Hash der Zuordnung. Der Prüfer bekommt NUR den Blatt-Ordner.
//   node vision/pruefer/pruefer.cjs eichung --blatt <ordner> --zuordnung <ordner> --antworten <datei> [--aus <ordner>]
//        Anker mit bekannter Wahrheit → Eichungs-Akte: ≥ 200 Anker und Trefferquote ≥ 0,8 heißt „scharf“, sonst „urteilt nicht“.
//        In TEILEN (ein Prüfer-Kontext trägt nicht 200 Bilder): --blatt und --zuordnung tragen teil-01 …, --antworten ist ein Ordner
//        mit teil-01.json … — EIN Modell, jeder Teil ein frischer Kontext, die Anker zählen zusammen; tragen die Teile zwei
//        Herkünfte (Foto gegen Render UND gestufte Störung), trifft der Prüfer in JEDER ≥ 0,8. `blatt --teil 25` legt Teil-Blätter.
//        Die Eich-Blätter je Art baut vision/pruefer/eichblatt.cjs (Anker tragen die Aufgabe der Sprosse, nie ein fremdes Motiv).
//   node vision/pruefer/pruefer.cjs urteil  --blatt <ordner> --zuordnung <ordner> --antworten <datei> --eichung <akte>
//                                           [--akten <ordner>] [--richter <ordner> [--vorlage <datei>]]
//        Antworten → Trefferquote, exaktes Binomial-Intervall, Urteil gegen die WÖRTLICHE Schwelle der Sprosse (zensus.json) →
//        Prüfer-Akte; mit --richter dazu die Fahrt für buche-2 (der Preis kommt aus der Vorlage der Mess-Sitzung, sonst höchstens Kern).
//   node vision/pruefer/pruefer.cjs --selftest     gepflanzte Täter, jeder beim Namen
//
// paare.json: { "sprosse": "leiter#n" | null (Anker), "art": "2afc" | "skala" | "ordnen", "form": "paar" | "klasse" | "folge",
//   "frage": "…", "optionen": [..] (klasse), "bauer": "<Kennung des Kontexts, der Stück und Bilder baute>", "sha": "<Kopf>",
//   "geraet": "Radeon 890M", "herkunft": "fremd" | "stoerung" | "spiel" (woher die Wahrheit stammt),
//   "aufgaben": [ { "bilder": ["a.png", "b.png"], "wahr": 0 | "Etikett" | null, "fang": true } ] }
//   paar    zwei Bilder, `wahr` = Index des Bilds, das die Frage meint („welches ist das Foto?“); Antwort "A" | "B"
//   klasse  ein oder mehrere Bilder, `wahr` = Etikett aus `optionen` (null: die Wahrheit ist das Gemessene — skala); Antwort = Etikett
//   folge   N Bilder in WAHRER Folge; das Blatt mischt sie; Antwort = Buchstaben in der Folge des Prüfers ("CABD")
// antworten.json (schreibt der Prüfer-Lauf): { "blatt": "<zuordnungSha256 aus blatt.json>", "pruefer": { "modell": "<eingefrorene
//   Kennung>", "kontext": "<Kennung des frischen Kontexts>" }, "antworten": [ { "nr": 1, "antwort": "A" } ] }
//
// DIE WÄNDE (jede mit Täter im Selbsttest): falscher Hash (Bild, Blatt, Zuordnung, Eichung) → verweigert · ohne scharfe Eichung
// desselben Modells und derselben Art → verweigert · Bauer = Prüfer → verweigert · Schlagseite (eine Seite, ein Etikett über Zufall,
// p < 0,01) → verweigert · unter 0,8 an den Fang-Aufgaben → verweigert · unter 40 Paaren → verweigert · ungleiche Form eines Paars
// (Format, Pixelmaß) → verweigert („Form-Leck“) · Schwelle nicht im Satz oder Maß nicht getragen → verweigert, nie geraten.
// Wo ein ratender Prüfer GRÜN läse (`stumpf: "gruen"` im Zensus), verlangt das Urteil ≥ 8 Fang-Aufgaben im Blatt und eine Eichung,
// deren Wahrheit aus fremder Herkunft oder gestufter Störung stammt.
// Maß der Profis: 40 Urteile je Sitzung nach 10 Übungen (Isola u. a. 2017, CVPR, „real vs. fake“); zwei Menschen stimmen im 2AFC
// zu 73,9 % überein (Zhang u. a. 2018, CVPR, BAPPS) — die Eichung bei 0,8 liegt über dem Menschen-Paar.
"use strict";
const fs = require("fs");
const path = require("path");
const crypto = require("crypto");

const HIER = __dirname;
const ZENSUS = path.join(HIER, "zensus.json");
const AKTEN = path.join(HIER, "akten");
const EICHUNG = path.join(HIER, "eichung");
const MIN_PAARE = 40, MIN_ANKER = 200, SCHARF = 0.8, MIN_FANG = 8, ALPHA = 0.01;

class Verweigert extends Error {}
const weg = (grund) => { throw new Verweigert(grund); };
const sha256 = (b) => crypto.createHash("sha256").update(b).digest("hex");
const lies = (f) => JSON.parse(fs.readFileSync(f, "utf8"));
// die Prüfsumme einer Akte: sha256 über die Akte ohne dieses Feld, Schlüssel sortiert (eine Hand-Änderung fällt auf)
const kanon = (x) => (Array.isArray(x) ? "[" + x.map(kanon).join(",") + "]" : x && typeof x === "object" ? "{" + Object.keys(x).filter((k) => x[k] !== undefined).sort().map((k) => JSON.stringify(k) + ":" + kanon(x[k])).join(",") + "}" : JSON.stringify(x === undefined ? null : x));
const summe = (akte) => sha256(kanon({ ...akte, pruefsumme: undefined }));
const mitSumme = (akte) => ({ ...akte, pruefsumme: summe(akte) });

// ── Zufall aus der Saat (mulberry32) ──
function zufall(saat) {
    let a = saat >>> 0;
    return () => {
        a = (a + 0x6d2b79f5) >>> 0;
        let t = a;
        t = Math.imul(t ^ (t >>> 15), t | 1);
        t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
        return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
    };
}
const mische = (liste, r) => {
    const a = liste.slice();
    for (let i = a.length - 1; i > 0; i--) {
        const j = Math.floor(r() * (i + 1));
        [a[i], a[j]] = [a[j], a[i]];
    }
    return a;
};

// ── das exakte Binomial ──
const lnFak = (() => { const c = [0]; return (n) => { for (let i = c.length; i <= n; i++) c[i] = c[i - 1] + Math.log(i); return c[n]; }; })();
const pmf = (k, n, p) => (p <= 0 ? (k === 0 ? 1 : 0) : p >= 1 ? (k === n ? 1 : 0) : Math.exp(lnFak(n) - lnFak(k) - lnFak(n - k) + k * Math.log(p) + (n - k) * Math.log(1 - p)));
const cdf = (k, n, p) => { let s = 0; for (let i = 0; i <= k; i++) s += pmf(i, n, p); return Math.min(1, s); };
// zweiseitiger exakter Test: die Summe aller Ausgänge, die höchstens so wahrscheinlich sind wie der beobachtete
function binomP(k, n, p) {
    const p0 = pmf(k, n, p);
    let s = 0;
    for (let i = 0; i <= n; i++) { const q = pmf(i, n, p); if (q <= p0 * (1 + 1e-9)) s += q; }
    return Math.min(1, s);
}
// Clopper-Pearson 95 %
function intervall(k, n) {
    const such = (f, lo, hi) => { for (let i = 0; i < 60; i++) { const m = (lo + hi) / 2; f(m) ? (lo = m) : (hi = m); } return (lo + hi) / 2; };
    const u = k === 0 ? 0 : such((p) => 1 - cdf(k - 1, n, p) < 0.025, 0, 1);
    const o = k === n ? 1 : such((p) => cdf(k, n, p) > 0.025, 0, 1);
    return [Math.round(u * 1e4) / 1e4, Math.round(o * 1e4) / 1e4];
}

// ── das Bild: Format, Pixelmaß, ohne Metadaten (kein Dekoder, nur der Behälter) ──
function bildLesen(buf, name) {
    if (buf.length > 8 && buf.readUInt32BE(0) === 0x89504e47) {
        const teile = [buf.subarray(0, 8)];
        let breite = 0, hoehe = 0;
        for (let o = 8; o + 12 <= buf.length; ) {
            const len = buf.readUInt32BE(o), typ = buf.toString("latin1", o + 4, o + 8);
            if (typ === "IHDR") { breite = buf.readUInt32BE(o + 8); hoehe = buf.readUInt32BE(o + 12); }
            // nur was das Bild trägt: kein tEXt/iTXt/zTXt/eXIf/tIME (Herkunft, Programm, Datum wären ein Leck)
            if (["IHDR", "PLTE", "IDAT", "IEND", "tRNS", "gAMA", "sRGB", "cHRM", "iCCP", "sBIT", "bKGD", "pHYs"].includes(typ)) teile.push(buf.subarray(o, o + 12 + len));
            o += 12 + len;
        }
        if (!breite) weg("Bild unlesbar: " + name + " (PNG ohne IHDR)");
        return { format: "png", breite, hoehe, rein: Buffer.concat(teile) };
    }
    if (buf.length > 4 && buf[0] === 0xff && buf[1] === 0xd8) {
        const teile = [buf.subarray(0, 2)];
        let breite = 0, hoehe = 0, o = 2;
        while (o + 4 <= buf.length && buf[o] === 0xff) {
            const m = buf[o + 1];
            if (m === 0xda) { teile.push(buf.subarray(o)); o = buf.length; break; } // ab Start-of-Scan: die Bilddaten bis zum Ende
            const len = buf.readUInt16BE(o + 2);
            if (m >= 0xc0 && m <= 0xcf && ![0xc4, 0xc8, 0xcc].includes(m)) { hoehe = buf.readUInt16BE(o + 5); breite = buf.readUInt16BE(o + 7); }
            // APP1 (EXIF, XMP), APP13 (IPTC), COM und die übrigen APPn fallen; JFIF (APP0), ICC (APP2), Adobe (APP14) tragen die Farbe
            const faellt = m === 0xfe || (m >= 0xe1 && m <= 0xef && m !== 0xe2 && m !== 0xee);
            if (!faellt) teile.push(buf.subarray(o, o + 2 + len));
            o += 2 + len;
        }
        if (!breite) weg("Bild unlesbar: " + name + " (JPEG ohne Rahmen)");
        return { format: "jpeg", breite, hoehe, rein: Buffer.concat(teile) };
    }
    return weg("Format nicht getragen: " + name + " (nur PNG und JPEG — der Behälter muss lesbar sein, sonst reist die Herkunft mit)");
}

// ── der Zensus: Art, Maß und Schwelle einer Sprosse — die EINE Quelle ──
let zensusCache = null;
function sprosseVon(id, zensus) {
    const Z = zensus || zensusCache || (zensusCache = fs.existsSync(ZENSUS) ? lies(ZENSUS) : weg("Zensus fehlt: vision/pruefer/zensus.json — node vision/pruefer/zensus.cjs"));
    return Z.sprossen.find((z) => z.id === id) || null;
}
const urteilVon = (quote, s) => (s.op === "≤" ? quote <= s.wert : s.op === "≥" ? quote >= s.wert : s.op === "band" ? quote >= s.wert[0] && quote <= s.wert[1] : weg("Schwelle unlesbar: " + JSON.stringify(s))) ? "GRÜN" : "ROT";
// was die Quote zählt: Treffer (der Prüfer trifft die Wahrheit), Fehler (er lässt sich täuschen: „Verwechslung ≥“, „als Foto ≥“),
// Ja (skala: der Anteil der ersten Option, „plausibel“)
function zaehltVon(z) {
    if (z.art === "skala") return "ja";
    if (z.art === "2afc" && z.schwelle.op === "≥" && z.stumpf === "gruen") return "fehler";
    return "treffer";
}

// ── BLATT ──
function blattBauen(paareDir, ausDir, zuDir, saat, Pvor) {
    const P = Pvor || lies(path.join(paareDir, "paare.json"));
    if (!["paar", "klasse", "folge"].includes(P.form)) weg("paare.json: form muss paar | klasse | folge sein");
    if (!P.frage || !Array.isArray(P.aufgaben) || !P.aufgaben.length) weg("paare.json: frage und aufgaben fehlen");
    if (!P.bauer) weg("paare.json: bauer fehlt (die Kennung des Kontexts, der Stück und Bilder baute — der Bauer ist nie der Prüfer)");
    if (P.form === "klasse" && !(Array.isArray(P.optionen) && P.optionen.length >= 2)) weg("paare.json: klasse verlangt ≥ 2 optionen");
    if (path.resolve(ausDir) === path.resolve(zuDir) || path.resolve(zuDir).startsWith(path.resolve(ausDir) + path.sep)) weg("die Zuordnung liegt GETRENNT vom Blatt — nie im Blatt-Ordner");
    const r = zufall(saat);
    fs.mkdirSync(ausDir, { recursive: true });
    fs.mkdirSync(zuDir, { recursive: true });
    const B = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";
    const blattAufgaben = [], zu = [];
    mische(P.aufgaben.map((a, i) => ({ a, i })), r).forEach(({ a, i }, k) => {
        const nr = k + 1;
        const roh = a.bilder.map((n) => { const b = fs.readFileSync(path.join(paareDir, n)); return { n, sha: sha256(b), ...bildLesen(b, n) }; });
        if (P.form === "paar") {
            if (roh.length !== 2) weg("Aufgabe " + (i + 1) + ": ein Paar hat zwei Bilder");
            if (roh[0].format !== roh[1].format || roh[0].breite !== roh[1].breite || roh[0].hoehe !== roh[1].hoehe)
                weg("Form-Leck: Aufgabe " + (i + 1) + " — " + roh.map((x) => x.n + " " + x.breite + "×" + x.hoehe + " " + x.format).join(" gegen ") + " (Format und Pixelmaß eines Paars müssen gleich sein, sonst verrät die Form die Herkunft)");
        }
        // die Seiten (paar, folge) per Saat mischen; klasse zeigt ihre Bilder in gegebener Folge
        const folge = P.form === "klasse" ? roh.map((_, j) => j) : mische(roh.map((_, j) => j), r);
        const namen = folge.map((j, pos) => String(nr).padStart(3, "0") + "-" + B[pos] + "." + (roh[j].format === "png" ? "png" : "jpg"));
        folge.forEach((j, pos) => fs.writeFileSync(path.join(ausDir, namen[pos]), roh[j].rein));
        const richtig = a.wahr === null || a.wahr === undefined ? null : P.form === "paar" ? B[folge.indexOf(a.wahr)] : P.form === "folge" ? roh.map((_, j) => B[folge.indexOf(j)]).join("") : String(a.wahr);
        if (P.form === "paar" && ![0, 1].includes(a.wahr)) weg("Aufgabe " + (i + 1) + ": wahr muss 0 oder 1 sein");
        if (P.form === "klasse" && richtig !== null && !P.optionen.includes(richtig)) weg("Aufgabe " + (i + 1) + ": wahr „" + richtig + "“ steht nicht in optionen");
        if (a.fang && richtig === null) weg("Aufgabe " + (i + 1) + ": eine Fang-Aufgabe trägt ihre Wahrheit");
        blattAufgaben.push({ nr, bilder: namen });
        zu.push({ nr, richtig, fang: !!a.fang, quelle: folge.map((j) => roh[j].n), sha256: folge.map((j) => roh[j].sha), blattSha256: folge.map((j) => sha256(roh[j].rein)) });
    });
    const antwort = P.form === "paar" ? 'genau "A" oder "B"' : P.form === "folge" ? "die Buchstaben der Bilder in deiner Folge, z. B. \"CABD\"" : "genau eine der Optionen";
    const kernStoff = { frage: P.frage, form: P.form, optionen: P.form === "klasse" ? P.optionen : undefined, aufgaben: blattAufgaben };
    const zuordnung = mitSumme({ sprosse: P.sprosse || null, anker: !P.sprosse, art: P.art, form: P.form, herkunft: P.herkunft || null, saat, bauer: P.bauer, sha: P.sha || null, geraet: P.geraet || null, frage: P.frage, optionen: kernStoff.optionen, blattKern: sha256(kanon(kernStoff)), aufgaben: zu });
    const zuText = JSON.stringify(zuordnung, null, 1) + "\n";
    fs.writeFileSync(path.join(zuDir, "zuordnung.json"), zuText);
    const blatt = { ...kernStoff, hinweis: "Antworte je Aufgabe mit " + antwort + ". Du siehst nur die Bilder dieses Ordners. Bist du unsicher, entscheide dich trotzdem.", antwortForm: { blatt: sha256(zuText), pruefer: { modell: "<Kennung des Modells>", kontext: "<Kennung dieses Kontexts>" }, antworten: [{ nr: 1, antwort: "…" }] }, zuordnungSha256: sha256(zuText) };
    fs.writeFileSync(path.join(ausDir, "blatt.json"), JSON.stringify(blatt, null, 1) + "\n");
    return { aufgaben: zu.length, fang: zu.filter((x) => x.fang).length, zuordnungSha256: blatt.zuordnungSha256 };
}

// TEIL-BLÄTTER: ein Prüfer-Kontext trägt nicht 200 Bilder — die Aufgaben per Saat gemischt in Teile zu `jeTeil`, jeder Teil ein
// eigenes Blatt (teil-01 …) mit eigener, getrennter Zuordnung; die Eichung liest die Teil-Antworten zusammen
const teilName = (i) => "teil-" + String(i + 1).padStart(2, "0");
function teileBauen(paareDir, ausDir, zuDir, saat, jeTeil, ab = 0) {
    const P = lies(path.join(paareDir, "paare.json"));
    const alle = mische(P.aufgaben.slice(), zufall(saat)), r = [];
    for (let i = 0; i * jeTeil < alle.length; i++) r.push({ teil: teilName(ab + i), ...blattBauen(paareDir, path.join(ausDir, teilName(ab + i)), path.join(zuDir, teilName(ab + i)), saat + ab + i + 1, { ...P, aufgaben: alle.slice(i * jeTeil, (i + 1) * jeTeil) }) });
    return r;
}
const teileVon = (dir) => (fs.existsSync(path.join(dir, "blatt.json")) ? null : fs.readdirSync(dir).filter((n) => /^teil-\d+$/.test(n)).sort());

// ── die Kette prüfen und zählen (Eichung wie Urteil) ──
function zaehle(blattDir, zuDir, antwortDatei) {
    const blattRoh = fs.readFileSync(path.join(blattDir, "blatt.json"), "utf8");
    const blatt = JSON.parse(blattRoh);
    const zuRoh = fs.readFileSync(path.join(zuDir, "zuordnung.json"), "utf8");
    const Z = JSON.parse(zuRoh);
    const A = lies(antwortDatei);
    if (sha256(zuRoh) !== blatt.zuordnungSha256) weg("falscher Hash: die Zuordnung ist nicht die des Blatts (" + sha256(zuRoh).slice(0, 12) + " ≠ " + String(blatt.zuordnungSha256).slice(0, 12) + ")");
    if (summe(Z) !== Z.pruefsumme) weg("falscher Hash: die Prüfsumme der Zuordnung stimmt nicht");
    if (A.blatt !== blatt.zuordnungSha256) weg("falscher Hash: die Antworten nennen ein anderes Blatt (" + String(A.blatt).slice(0, 12) + ")");
    if (sha256(kanon({ frage: blatt.frage, form: blatt.form, optionen: blatt.optionen, aufgaben: blatt.aufgaben })) !== Z.blattKern) weg("falscher Hash: Frage oder Aufgaben des Blatts wurden nach dem Mischen geändert");
    for (const a of Z.aufgaben) {
        const b = blatt.aufgaben.find((x) => x.nr === a.nr) || weg("falscher Hash: Aufgabe " + a.nr + " fehlt im Blatt");
        b.bilder.forEach((n, i) => { if (sha256(fs.readFileSync(path.join(blattDir, n))) !== a.blattSha256[i]) weg("falscher Hash: Bild " + n + " ist nicht das gemischte (Aufgabe " + a.nr + ")"); });
    }
    if (!A.pruefer || !A.pruefer.modell || !A.pruefer.kontext) weg("Prüfer ohne Kennung: Modell und Kontext stehen in den Antworten");
    if (A.pruefer.kontext === Z.bauer) weg("Bauer = Prüfer: der Kontext „" + Z.bauer + "“ baute das Stück und kann es nicht prüfen");
    const je = new Map();
    for (const x of A.antworten || []) je.has(x.nr) ? weg("Aufgabe " + x.nr + " ist zweimal beantwortet") : je.set(x.nr, String(x.antwort).trim());
    for (const a of Z.aufgaben) if (!je.has(a.nr)) weg("Aufgabe " + a.nr + " ist unbeantwortet — ein Blatt wird ganz geurteilt");
    const erlaubt = Z.form === "paar" ? ["A", "B"] : Z.form === "klasse" ? Z.optionen : null;
    const zeilen = Z.aufgaben.map((a) => {
        const antwort = je.get(a.nr);
        if (erlaubt && !erlaubt.includes(antwort)) weg("Aufgabe " + a.nr + ": die Antwort „" + antwort + "“ steht nicht zur Wahl (" + erlaubt.join(" | ") + ")");
        return { ...a, antwort, treffer: a.richtig === null ? null : antwort === a.richtig };
    });
    // SCHLAGSEITE: eine Seite (paar) oder ein Etikett (klasse) öfter, als die gemischte Wahrheit es trägt — exakter Test je Wahl
    const schlag = schlagseiteVon(zeilen, erlaubt);
    const fang = zeilen.filter((z) => z.fang);
    return { blatt, Z, A, zeilen, mess: zeilen.filter((z) => !z.fang), fang: { n: fang.length, treffer: fang.filter((z) => z.treffer).length }, schlagseite: schlag };
}

function schlagseiteVon(zeilen, erlaubt) {
    const schlag = [];
    if (erlaubt) {
        const mit = zeilen.filter((z) => z.richtig !== null);
        for (const w of erlaubt) {
            const k = mit.filter((z) => z.antwort === w).length, p0 = mit.filter((z) => z.richtig === w).length / (mit.length || 1);
            const p = mit.length ? binomP(k, mit.length, p0) : 1;
            if (p < ALPHA / erlaubt.length && k / mit.length > p0) schlag.push("„" + w + "“ in " + k + " von " + mit.length + " Antworten, die Wahrheit trägt es in " + Math.round(p0 * mit.length) + " (p = " + p.toExponential(1) + ")");
        }
    }
    return schlag;
}

// ── EICHUNG ──
// in TEILEN: blattDir und zuDir tragen teil-01 …, antwortDatei ist ein Ordner mit teil-01.json … — jeder Teil hält seine eigene
// Hash-Kette, EIN Modell urteilt alle Teile, die Anker zählen zusammen, die Schlagseite misst sich über alle Teile gleicher Wahl
function eichungTeile(blattDir, zuDir, antwortDir, datum, teile) {
    const Rs = teile.map((t) => {
        const af = path.join(antwortDir, t + ".json");
        if (!fs.existsSync(af)) weg("Teil " + t + " ist unbeantwortet (" + af + " fehlt) — eine Eichung wird ganz gefahren");
        try { return { t, ...zaehle(path.join(blattDir, t), path.join(zuDir, t), af) }; } catch (e) { if (e instanceof Verweigert) weg(t + ": " + e.message); throw e; }
    });
    const eins = (f, was) => { const m = [...new Set(Rs.map(f))]; if (m.length !== 1) weg("die Teile tragen nicht EIN " + was + ": " + m.join(" | ")); return m[0]; };
    const art = eins((R) => R.Z.art, "Art"), modell = eins((R) => R.A.pruefer.modell, "Modell"), bauer = eins((R) => R.Z.bauer, "Bauer");
    for (const R of Rs) {
        if (!R.Z.anker) weg(R.t + ": das Blatt ist kein Anker-Blatt");
        if (R.zeilen.some((z) => z.richtig === null)) weg(R.t + ": ein Anker ohne Wahrheit");
        if (!["fremd", "stoerung", "spiel"].includes(R.Z.herkunft)) weg(R.t + ": Anker ohne Herkunft");
    }
    const gruppen = new Map();
    for (const R of Rs) { const k = R.Z.form + "|" + (R.Z.optionen || []).join("|"); if (!gruppen.has(k)) gruppen.set(k, { erlaubt: R.Z.form === "paar" ? ["A", "B"] : R.Z.form === "klasse" ? R.Z.optionen : null, zeilen: [] }); gruppen.get(k).zeilen.push(...R.zeilen); }
    const schlag = [...gruppen.values()].flatMap((g) => schlagseiteVon(g.zeilen, g.erlaubt));
    const n = Rs.reduce((m, R) => m + R.zeilen.length, 0), k = Rs.reduce((m, R) => m + R.zeilen.filter((z) => z.treffer).length, 0);
    // JE HERKUNFT: trägt ein Blatt Anker zweier Herkünfte (Foto gegen Render UND gestufte Störung), so trifft der Prüfer in JEDER
    // ≥ 0,8 — sonst trüge die leichte Hälfte die schwere (175 Störungs-Paare bei 0,95 und 48 Render-Paare bei 0,5 gäben 0,85)
    const jeHerkunft = {};
    for (const R of Rs) { const h = (jeHerkunft[R.Z.herkunft] = jeHerkunft[R.Z.herkunft] || { anker: 0, treffer: 0 }); h.anker += R.zeilen.length; h.treffer += R.zeilen.filter((z) => z.treffer).length; }
    const schwach = Object.entries(jeHerkunft).filter(([, h]) => h.treffer / h.anker < SCHARF).map(([name, h]) => "Herkunft „" + name + "“ " + h.treffer + " von " + h.anker + " = " + (h.treffer / h.anker).toFixed(3) + " < " + SCHARF);
    const scharf = n >= MIN_ANKER && k / n >= SCHARF && !schlag.length && !schwach.length;
    const liste = (f) => [...new Set(Rs.map(f))].join("+");
    return mitSumme({ eichung: true, art, form: liste((R) => R.Z.form), herkunft: liste((R) => R.Z.herkunft), modell, pruefer: { modell, kontext: Rs.map((R) => R.A.pruefer.kontext) }, bauer, frage: [...new Set(Rs.map((R) => R.Z.frage))], anker: n, treffer: k, quote: Math.round((k / n) * 1e4) / 1e4, intervall95: intervall(k, n), schlagseite: schlag, scharf,
        grund: scharf ? "scharf: " + k + " von " + n + " Ankern in " + Rs.length + " Teilen" : n < MIN_ANKER ? "urteilt nicht: " + n + " Anker < " + MIN_ANKER : schlag.length ? "urteilt nicht: Schlagseite — " + schlag[0] : schwach.length ? "urteilt nicht: " + schwach.join(" · ") : "urteilt nicht: " + k + " von " + n + " = " + (k / n).toFixed(3) + " < " + SCHARF,
        jeHerkunft, teile: Rs.map((R) => ({ teil: R.t, form: R.Z.form, herkunft: R.Z.herkunft, anker: R.zeilen.length, treffer: R.zeilen.filter((z) => z.treffer).length, zuordnungSha256: R.blatt.zuordnungSha256 })),
        zuordnungSha256: sha256(Rs.map((R) => R.blatt.zuordnungSha256).join("\n")), datum });
}
function eichung(blattDir, zuDir, antwortDatei, datum) {
    const teile = teileVon(blattDir);
    if (teile) return teile.length ? eichungTeile(blattDir, zuDir, antwortDatei, datum, teile) : weg("kein Blatt: weder blatt.json noch teil-01 … in " + blattDir);
    const R = zaehle(blattDir, zuDir, antwortDatei);
    if (!R.Z.anker) weg("das Blatt ist kein Anker-Blatt (es nennt die Sprosse " + R.Z.sprosse + ")");
    if (R.zeilen.some((z) => z.richtig === null)) weg("ein Anker ohne Wahrheit: jede Aufgabe der Eichung trägt ihre bekannte Antwort");
    if (!["fremd", "stoerung", "spiel"].includes(R.Z.herkunft)) weg("Anker ohne Herkunft: fremd (Foto gegen Render) | stoerung (gestuft) | spiel (Wahrheit aus dem Samen)");
    const n = R.zeilen.length, k = R.zeilen.filter((z) => z.treffer).length;
    const scharf = n >= MIN_ANKER && k / n >= SCHARF && !R.schlagseite.length;
    return mitSumme({ eichung: true, art: R.Z.art, form: R.Z.form, herkunft: R.Z.herkunft, modell: R.A.pruefer.modell, pruefer: R.A.pruefer, bauer: R.Z.bauer, frage: R.Z.frage, anker: n, treffer: k, quote: Math.round((k / n) * 1e4) / 1e4, intervall95: intervall(k, n), schlagseite: R.schlagseite, scharf,
        grund: scharf ? "scharf: " + k + " von " + n + " Ankern" : n < MIN_ANKER ? "urteilt nicht: " + n + " Anker < " + MIN_ANKER : R.schlagseite.length ? "urteilt nicht: Schlagseite — " + R.schlagseite[0] : "urteilt nicht: " + k + " von " + n + " = " + (k / n).toFixed(3) + " < " + SCHARF,
        zuordnungSha256: R.blatt.zuordnungSha256, datum });
}
// eine Eichungs-Akte gegen einen Lauf: scharf, dasselbe Modell, dieselbe Art, die Herkunft trägt die Richtung
function eichungTraegt(E, { modell, art, stumpf }) {
    if (!E || !E.eichung) return "ungeeicht: keine Eichungs-Akte";
    if (summe(E) !== E.pruefsumme) return "falscher Hash: die Prüfsumme der Eichungs-Akte stimmt nicht";
    if (!(E.anker >= MIN_ANKER && E.treffer / E.anker >= SCHARF && E.scharf === true && !(E.schlagseite || []).length)) return "ungeeicht: " + (E.grund || "nicht scharf") + " (scharf heißt ≥ " + MIN_ANKER + " Anker bei ≥ " + SCHARF + ")";
    if (E.modell !== modell) return "ungeeicht: die Eichung gilt dem Modell „" + E.modell + "“, geurteilt hat „" + modell + "“";
    if (E.art !== art) return "ungeeicht: die Eichung gilt der Art „" + E.art + "“, die Sprosse ist „" + art + "“";
    if (stumpf === "gruen" && !String(E.herkunft).split("+").every((h) => ["fremd", "stoerung"].includes(h))) return "ungeeicht: ein ratender Prüfer läse hier GRÜN — die Wahrheit der Anker muss aus fremder Herkunft oder gestufter Störung stammen, nicht aus „" + E.herkunft + "“";
    return null;
}

// ── URTEIL ──
function urteil(blattDir, zuDir, antwortDatei, eichDatei, datum, zensus) {
    const R = zaehle(blattDir, zuDir, antwortDatei);
    if (R.Z.anker) weg("das Blatt ist ein Anker-Blatt — `eichung`, nicht `urteil`");
    const z = sprosseVon(R.Z.sprosse, zensus) || weg("die Sprosse " + R.Z.sprosse + " steht nicht im Zensus der Prüfer-Sprossen");
    if (!["2afc", "skala", "ordnen"].includes(z.art)) weg("Art „" + z.art + "“ trägt der Blind-Prüfer nicht: " + ((z.schwelle && z.schwelle.grund) || ""));
    if (z.art !== R.Z.art) weg("das Blatt nennt die Art „" + R.Z.art + "“, der Zensus die Art „" + z.art + "“");
    if (!z.schwelle.mass) weg("verweigert: " + z.schwelle.grund);
    if (!eichDatei || !fs.existsSync(eichDatei)) weg("ungeeicht: keine Eichungs-Akte — ohne Eichung urteilt der Prüfer nicht (R11)");
    const eichRoh = fs.readFileSync(eichDatei, "utf8");
    const E = JSON.parse(eichRoh);
    const eg = eichungTraegt(E, { modell: R.A.pruefer.modell, art: z.art, stumpf: z.stumpf });
    if (eg) weg(eg);
    if (R.schlagseite.length) weg("Schlagseite: " + R.schlagseite.join(" · ") + " — der Prüfer urteilt nicht");
    if (z.stumpf === "gruen" && R.fang.n < MIN_FANG) weg("Fang-Aufgaben fehlen: " + R.fang.n + " < " + MIN_FANG + " — ein ratender Prüfer läse hier GRÜN, das Blatt braucht gepflanzte Aufgaben mit bekannter Antwort");
    if (R.fang.n && R.fang.treffer / R.fang.n < SCHARF) weg("Fang-Aufgaben verfehlt: " + R.fang.treffer + " von " + R.fang.n + " < " + SCHARF + " — der Prüfer urteilt nicht");
    const n = R.mess.length;
    if (n < MIN_PAARE) weg("zu wenige Paare: " + n + " < " + MIN_PAARE + " (R11)");
    const zaehlt = zaehltVon(z);
    let k, quote, wert;
    if (z.schwelle.mass === "median") {
        const v = R.mess.map((x) => +x.antwort).sort((a, b) => a - b);
        if (v.some((x) => !Number.isFinite(x))) weg("Skala: jede Antwort ist eine Zahl");
        quote = n % 2 ? v[(n - 1) / 2] : (v[n / 2 - 1] + v[n / 2]) / 2;
        wert = "Median " + quote + " über " + n + " Urteile";
    } else {
        if (zaehlt !== "ja" && R.mess.some((x) => x.richtig === null)) weg("eine Mess-Aufgabe ohne Wahrheit: nur die Skala misst ohne sie");
        k = zaehlt === "ja" ? R.mess.filter((x) => x.antwort === R.Z.optionen[0]).length : zaehlt === "fehler" ? R.mess.filter((x) => !x.treffer).length : R.mess.filter((x) => x.treffer).length;
        quote = Math.round((k / n) * 1e4) / 1e4;
    }
    const iv = k === undefined ? null : intervall(k, n);
    const zwei = R.Z.form === "paar";
    const lesart = iv && zwei ? (iv[0] <= 0.5 && iv[1] >= 0.5 ? "ununterscheidbar (50 % liegt im 95-%-Intervall)" : "unterscheidbar (50 % liegt außerhalb des 95-%-Intervalls)") : null;
    const u = urteilVon(quote, z.schwelle);
    if (k !== undefined) wert = (zaehlt === "ja" ? "„" + R.Z.optionen[0] + "“" : zaehlt === "fehler" ? "getäuscht" : "Treffer") + " " + k + " von " + n + " = " + (quote * 100).toFixed(1).replace(".", ",") + " % [" + iv.map((x) => (x * 100).toFixed(1).replace(".", ",")).join("–") + "] gegen „" + z.schwelle.wort + "“" + (lesart ? " · " + lesart : "");
    const [leiter, nr] = R.Z.sprosse.split("#");
    return mitSumme({ pruefer: R.A.pruefer, leiter, sprosse: +nr, teil: z.teil, art: z.art, form: R.Z.form, schwelle: z.schwelle, zaehlt, stumpf: z.stumpf || null, sha: R.Z.sha, geraet: R.Z.geraet, datum, modell: R.A.pruefer.modell, bauer: R.Z.bauer, frage: R.Z.frage,
        paare: n, gezaehlt: k === undefined ? null : k, quote, intervall95: iv, lesart, fang: R.fang, schlagseite: R.schlagseite, eichung: { datei: path.basename(eichDatei), sha256: sha256(eichRoh) }, blatt: { zuordnungSha256: R.blatt.zuordnungSha256, bilder: R.zeilen.flatMap((x) => x.sha256) }, wert, urteil: u });
}

// ── DER LESER (buche-2 fahrtUrteil): hält die Prüfer-Akte einer Fahrt? → null oder der Grund beim Namen ──
// ref = { akte: "<datei>", sha256 } aus der Fahrt; erwartet = { leiter, sprosse, sha, geraet, urteil }
function akteGueltig(ref, erwartet, o = {}) {
    const dir = o.akten || AKTEN, eichDir = o.eichung || path.join(dir, "..", "eichung");
    if (!ref || !ref.akte || !ref.sha256) return "die Fahrt nennt keine Prüfer-Akte";
    const f = path.join(dir, path.basename(String(ref.akte)));
    if (!fs.existsSync(f)) return "die Prüfer-Akte " + ref.akte + " liegt nicht in " + path.basename(dir);
    const roh = fs.readFileSync(f, "utf8");
    if (sha256(roh) !== ref.sha256) return "falscher Hash: die Prüfer-Akte " + ref.akte + " ist nicht die der Fahrt";
    const a = JSON.parse(roh);
    if (summe(a) !== a.pruefsumme) return "falscher Hash: die Prüfsumme der Prüfer-Akte stimmt nicht";
    if (a.leiter !== erwartet.leiter || a.sprosse !== erwartet.sprosse) return "die Prüfer-Akte gilt " + a.leiter + " S " + a.sprosse;
    if (!a.sha || !(String(erwartet.sha).startsWith(a.sha) || String(a.sha).startsWith(erwartet.sha))) return "die Prüfer-Akte gilt dem Kopf " + String(a.sha).slice(0, 8) + ", die Fahrt dem Kopf " + String(erwartet.sha).slice(0, 8);
    if (a.geraet !== erwartet.geraet) return "die Prüfer-Akte gilt den Bildern von „" + a.geraet + "“, die Fahrt nennt „" + erwartet.geraet + "“";
    let z;
    try { z = sprosseVon(a.leiter + "#" + a.sprosse, o.zensus); } catch (e) { return e.message; }
    if (!z || !z.schwelle || !z.schwelle.mass) return "die Sprosse trägt im Zensus kein Maß, das der Prüfer urteilt";
    if (kanon(z.schwelle) !== kanon(a.schwelle) || z.art !== a.art) return "die Schwelle der Akte ist nicht die der Sprosse (wörtlich „" + z.schwelle.wort + "“)";
    if (!(a.paare >= MIN_PAARE)) return "zu wenige Paare: " + a.paare + " < " + MIN_PAARE;
    if ((a.schlagseite || []).length) return "Schlagseite: " + a.schlagseite[0];
    if (z.stumpf === "gruen" && !(a.fang && a.fang.n >= MIN_FANG)) return "Fang-Aufgaben fehlen (ein ratender Prüfer läse hier GRÜN)";
    if (a.fang && a.fang.n && a.fang.treffer / a.fang.n < SCHARF) return "Fang-Aufgaben verfehlt: " + a.fang.treffer + " von " + a.fang.n;
    if (!a.pruefer || !a.pruefer.kontext || a.pruefer.kontext === a.bauer) return "Bauer = Prüfer (oder Prüfer ohne Kennung)";
    const quote = a.schwelle.mass === "median" ? a.quote : Math.round((a.gezaehlt / a.paare) * 1e4) / 1e4;
    if (quote !== a.quote || zaehltVon(z) !== a.zaehlt) return "die Quote der Akte widerspricht ihren Zahlen";
    const u = urteilVon(quote, z.schwelle);
    if (u !== a.urteil) return "das Urteil der Akte („" + a.urteil + "“) widerspricht ihren Zahlen (nachgerechnet " + u + ")";
    if (a.urteil !== erwartet.urteil) return "die Fahrt sagt " + erwartet.urteil + ", die Prüfer-Akte " + a.urteil;
    const ef = path.join(eichDir, path.basename(String((a.eichung || {}).datei || "")));
    if (!a.eichung || !a.eichung.datei || !fs.existsSync(ef)) return "ungeeicht: die Eichungs-Akte " + ((a.eichung || {}).datei || "(keine)") + " liegt nicht in " + path.basename(eichDir);
    const eRoh = fs.readFileSync(ef, "utf8");
    if (sha256(eRoh) !== a.eichung.sha256) return "falscher Hash: die Eichungs-Akte ist nicht die des Urteils";
    const E = JSON.parse(eRoh);
    const eg = eichungTraegt(E, { modell: a.modell, art: a.art, stumpf: z.stumpf });
    if (eg) return eg;
    if (E.datum && a.datum && Date.parse(E.datum) > Date.parse(a.datum)) return "ungeeicht: die Eichung ist jünger als das Urteil";
    return null;
}
// die Fahrt für buche-2 aus Prüfer-Akte und Preis-Vorlage der Mess-Sitzung (R3: Umfang, Tiefe und Preis in derselben Fahrt)
const GERAET_DATEI = (g) => (/890m/i.test(g) ? "radeon" : /1060/i.test(g) ? "gtx" : String(g).toLowerCase().replace(/[^a-z0-9]/g, ""));
function fahrtAus(akte, akteDatei, akteRoh, soll, vorlage) {
    const g = { geraet: akte.geraet, richter: { wert: akte.wert, urteil: akte.urteil }, pruefer: { akte: akteDatei, sha256: sha256(akteRoh) } };
    if (vorlage) {
        if (vorlage.leiter !== akte.leiter || vorlage.sprosse !== akte.sprosse || vorlage.geraet !== akte.geraet || !String(vorlage.sha).startsWith(String(akte.sha).slice(0, 8))) weg("die Preis-Vorlage gilt " + vorlage.leiter + " S " + vorlage.sprosse + " " + vorlage.geraet + " am " + String(vorlage.sha).slice(0, 8) + " — nicht dieser Fahrt");
        g.preis = vorlage.preis;
    } else Object.assign(g, { preis: null, ohnePreis: "kein Preis: die Vorlage der Mess-Sitzung fehlt (höchstens Kern, R3)" });
    return { leiter: akte.leiter, sprosse: akte.sprosse, sha: akte.sha, datum: akte.datum, soll, geraete: [g] };
}

// ───────────────────────── Selbsttest: gepflanzte Täter, jeder beim Namen ─────────────────────────
function selftest() {
    const os = require("os");
    const X = fs.mkdtempSync(path.join(os.tmpdir(), "pruefer-"));
    let ok = 0, fehl = 0;
    const pruefe = (name, f) => {
        let r;
        try { r = f(); } catch (e) { r = (e instanceof Verweigert ? "verweigert: " : "Wurf: ") + e.message; }
        r === true ? (ok++, console.log("  GRÜN  " + name)) : (fehl++, console.log("  ROT   " + name + " — " + r));
    };
    const verweigert = (muster, f) => { try { f(); return "verweigerte nicht"; } catch (e) { return e instanceof Verweigert && muster.test(e.message) ? true : "falscher Grund: " + e.message; } };
    // ein kleinstes PNG je Farbe (1×1, mit tEXt-Stück als gepflanztem Leck)
    const zlib = require("zlib");
    const crc = (b) => { let c, r = 0xffffffff; for (const x of b) { c = (r ^ x) & 0xff; for (let k = 0; k < 8; k++) c = c & 1 ? 0xedb88320 ^ (c >>> 1) : c >>> 1; r = (r >>> 8) ^ c; } return (r ^ 0xffffffff) >>> 0; };
    const stueck = (typ, d) => { const t = Buffer.concat([Buffer.from(typ, "latin1"), d]); const l = Buffer.alloc(4), c = Buffer.alloc(4); l.writeUInt32BE(d.length); c.writeUInt32BE(crc(t)); return Buffer.concat([l, t, c]); };
    const png = (r, g, b, breite = 1) => { const ih = Buffer.alloc(13); ih.writeUInt32BE(breite, 0); ih.writeUInt32BE(1, 4); ih[8] = 8; ih[9] = 2; const zeile = Buffer.concat([Buffer.from([0]), ...Array.from({ length: breite }, () => Buffer.from([r, g, b]))]);
        return Buffer.concat([Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]), stueck("IHDR", ih), stueck("tEXt", Buffer.from("Software\0Spiel-Kamera")), stueck("IDAT", zlib.deflateSync(zeile)), stueck("IEND", Buffer.alloc(0))]); };
    const ZENSUS_T = { sprossen: [
        { id: "t.tief#1", art: "2afc", teil: "2AFC ≤ 55 %", schwelle: { mass: "anteil", op: "≤", wert: 0.55, wort: "≤ 55 %" }, stumpf: "gruen" },
        { id: "t.hoch#1", art: "ordnen", teil: "erkannt ≥ 80 %", schwelle: { mass: "anteil", op: "≥", wert: 0.8, wort: "≥ 80 %" }, stumpf: "rot" },
        { id: "t.ohne#1", art: "2afc", teil: "Bildvergleich gegen Foto", schwelle: { mass: null, grund: "ohne Schwelle im Satz (R6: die Zahl daneben ist die Schwelle — hier steht keine)" }, stumpf: "rot" },
    ] };
    let lfd = 0;
    // ein Lauf: Paare bauen → Blatt → der Prüfer `denkt(aufgabe, zuordnungsZeile)` → Antworten
    const lauf = (o) => {
        const d = path.join(X, "l" + ++lfd), paare = path.join(d, "paare"), blatt = path.join(d, "blatt"), zu = path.join(d, "zu");
        fs.mkdirSync(paare, { recursive: true });
        const aufgaben = [];
        for (let i = 0; i < o.n; i++) {
            const fang = i < (o.fang || 0);
            const gleich = o.identisch && !fang;
            fs.writeFileSync(path.join(paare, i + "a.png"), png(200, 30, 30)); // „Foto“: rot
            fs.writeFileSync(path.join(paare, i + "b.png"), gleich ? png(200, 30, 30) : png(30, 30, 200, o.leck && i === 3 ? 2 : 1)); // „Render“: blau
            aufgaben.push(o.form === "klasse" ? { bilder: [i % 2 ? i + "a.png" : i + "b.png"], wahr: i % 2 ? "Foto" : "Render" } : { bilder: [i + "a.png", i + "b.png"], wahr: 0, ...(fang ? { fang: true } : {}) });
        }
        fs.writeFileSync(path.join(paare, "paare.json"), JSON.stringify({ sprosse: o.sprosse || null, art: o.art || "2afc", form: o.form || "paar", frage: "Welches Bild ist das Foto?", optionen: o.form === "klasse" ? ["Foto", "Render"] : undefined, bauer: "bauer-kontext-1", sha: "2da17e2e72aa", geraet: "Radeon 890M", herkunft: o.herkunft, aufgaben }));
        const B = blattBauen(paare, blatt, zu, o.saat || 7);
        const Z = lies(path.join(zu, "zuordnung.json"));
        const r = zufall(99);
        const antworten = Z.aufgaben.map((a) => ({ nr: a.nr, antwort: o.denkt(a, r, fs.readFileSync(path.join(blatt, lies(path.join(blatt, "blatt.json")).aufgaben.find((x) => x.nr === a.nr).bilder[0]))) }));
        const af = path.join(d, "antworten.json");
        fs.writeFileSync(af, JSON.stringify({ blatt: o.falschesBlatt ? "0".repeat(64) : B.zuordnungSha256, pruefer: { modell: o.modell || "modell-fest-1", kontext: o.kontext || "pruefer-kontext-9" }, antworten }));
        return { d, blatt, zu, af, B };
    };
    // der SEHENDE Prüfer liest das Bild selbst (rot = Foto), nie die Zuordnung: Seite A ist rot?
    const sieht = (a, r, bildA) => (zlib.inflateSync(bildLesenIdat(bildA))[1] === 200 ? "A" : "B");
    const bildLesenIdat = (buf) => { for (let o = 8; o < buf.length; ) { const len = buf.readUInt32BE(o), typ = buf.toString("latin1", o + 4, o + 8); if (typ === "IDAT") return buf.subarray(o + 8, o + 8 + len); o += 12 + len; } };
    const siehtKlasse = (a, r, bildA) => (zlib.inflateSync(bildLesenIdat(bildA))[1] === 200 ? "Foto" : "Render");
    const raet = (a, r) => (r() < 0.5 ? "A" : "B");
    const eichAkte = (o = {}) => {
        const L = lauf({ n: o.n || 200, form: "klasse", art: o.art || "2afc", herkunft: o.herkunft || "fremd", denkt: o.denkt || siehtKlasse, modell: o.modell });
        const E = eichung(L.blatt, L.zu, L.af, "2026-11-26T10:00:00Z");
        const f = path.join(X, "eichung-" + lfd + ".json");
        fs.writeFileSync(f, JSON.stringify(E, null, 1) + "\n");
        return { E, f };
    };
    const SCHARF_E = eichAkte();
    const U = (L, ef) => urteil(L.blatt, L.zu, L.af, ef === undefined ? SCHARF_E.f : ef, "2026-11-26T11:00:00Z", ZENSUS_T);

    pruefe("Eichung: ein sehender Prüfer trifft 200 von 200 Ankern fremder Herkunft — scharf", () => (SCHARF_E.E.scharf && SCHARF_E.E.treffer === 200 ? true : JSON.stringify(SCHARF_E.E).slice(0, 200)));
    pruefe("Eichung: ein ratender Prüfer bleibt unter 0,8 — „urteilt nicht“", () => { const E = eichAkte({ denkt: (a, r) => (r() < 0.5 ? "Foto" : "Render") }).E; return !E.scharf && /^urteilt nicht: \d+ von 200/.test(E.grund) ? true : E.grund; });
    pruefe("Eichung: 199 Anker sind keine Eichung — „urteilt nicht: 199 Anker < 200“", () => { const E = eichAkte({ n: 199 }).E; return !E.scharf && /199 Anker < 200/.test(E.grund) ? true : E.grund; });
    pruefe("Blatt: Metadaten fallen (tEXt), die Namen verraten nichts, die Zuordnung liegt getrennt", () => {
        const L = lauf({ n: 40, sprosse: "t.hoch#1", art: "ordnen", denkt: sieht });
        const namen = fs.readdirSync(L.blatt);
        if (namen.includes("zuordnung.json")) return "die Zuordnung liegt im Blatt";
        if (!namen.filter((n) => n !== "blatt.json").every((n) => /^\d{3}-[AB]\.png$/.test(n))) return "Namen: " + namen.slice(0, 4).join(", ");
        if (fs.readFileSync(path.join(L.blatt, "001-A.png")).includes("Spiel-Kamera")) return "das tEXt-Stück reist mit";
        return /wahr|richtig|quelle|bauer|sprosse|t\.hoch/.test(fs.readFileSync(path.join(L.blatt, "blatt.json"), "utf8")) ? "das Blatt nennt Wahrheit oder Sprosse" : true;
    });
    pruefe("Urteil GRÜN: ein sehender Prüfer erkennt 40 von 40 gegen „≥ 80 %“ (ordnen)", () => { const a = U(lauf({ n: 40, sprosse: "t.hoch#1", art: "ordnen", denkt: sieht }), eichAkte({ art: "ordnen" }).f); return a.urteil === "GRÜN" && a.gezaehlt === 40 && a.intervall95[0] > 0.9 ? true : a.wert; });
    pruefe("Täter IDENTISCHES PAAR: 200 gleiche Paare → „ununterscheidbar“, GRÜN gegen „≤ 55 %“ nur mit 8 getroffenen Fang-Aufgaben", () => {
        const a = U(lauf({ n: 208, fang: 8, identisch: true, sprosse: "t.tief#1", denkt: (z, r, bild) => (z.fang ? sieht(z, r, bild) : raet(z, r)) }));
        return /^ununterscheidbar/.test(a.lesart) && a.fang.treffer === 8 && a.urteil === (a.quote <= 0.55 ? "GRÜN" : "ROT") && a.intervall95[0] <= 0.5 && a.intervall95[1] >= 0.5 ? true : a.wert + " · Fang " + JSON.stringify(a.fang);
    });
    pruefe("Täter SCHLAGSEITE: der Prüfer sagt immer „A“ — gefasst beim Namen, kein Urteil (die Quote läge bei 50 % und läse GRÜN)", () => verweigert(/^Schlagseite: „A“ in 48 von 48 Antworten/, () => U(lauf({ n: 48, fang: 8, sprosse: "t.tief#1", denkt: () => "A" }))));
    pruefe("Täter FALSCHER HASH (Bild): ein Bild des Blatts nach dem Mischen getauscht — verweigert", () => { const L = lauf({ n: 40, sprosse: "t.hoch#1", art: "ordnen", denkt: sieht }); fs.writeFileSync(path.join(L.blatt, "001-A.png"), png(1, 2, 3)); return verweigert(/^falscher Hash: Bild 001-A\.png/, () => U(L)); });
    pruefe("Täter FALSCHER HASH (Zuordnung): die Wahrheit nach dem Lauf geändert — verweigert", () => { const L = lauf({ n: 40, sprosse: "t.hoch#1", art: "ordnen", denkt: sieht }); const f = path.join(L.zu, "zuordnung.json"); fs.writeFileSync(f, fs.readFileSync(f, "utf8").replace('"richtig": "A"', '"richtig": "B"')); return verweigert(/^falscher Hash: die Zuordnung ist nicht die des Blatts/, () => U(L)); });
    pruefe("Täter FALSCHER HASH (Antworten): die Antworten nennen ein anderes Blatt — verweigert", () => verweigert(/^falscher Hash: die Antworten nennen ein anderes Blatt/, () => U(lauf({ n: 40, sprosse: "t.hoch#1", art: "ordnen", denkt: sieht, falschesBlatt: true }))));
    pruefe("Täter UNGEEICHT (keine Akte): verweigert", () => verweigert(/^ungeeicht: keine Eichungs-Akte/, () => U(lauf({ n: 40, sprosse: "t.hoch#1", art: "ordnen", denkt: sieht }), null)));
    pruefe("Täter UNGEEICHT (ratender Prüfer, Akte „urteilt nicht“): verweigert", () => { const E = eichAkte({ art: "ordnen", denkt: (a, r) => (r() < 0.5 ? "Foto" : "Render") }); return verweigert(/^ungeeicht: urteilt nicht: \d+ von 200/, () => U(lauf({ n: 40, sprosse: "t.hoch#1", art: "ordnen", denkt: sieht }), E.f)); });
    pruefe("Täter UNGEEICHT (anderes Modell): die Eichung von Modell 1 trägt Modell 2 nicht — verweigert", () => verweigert(/^ungeeicht: die Eichung gilt dem Modell „modell-fest-1“, geurteilt hat „modell-fest-2“/, () => U(lauf({ n: 48, fang: 8, sprosse: "t.tief#1", denkt: sieht, modell: "modell-fest-2" }))));
    pruefe("Täter UNGEEICHT (Anker aus dem Spiel, wo ein Ratender GRÜN läse): verweigert", () => { const E = eichAkte({ herkunft: "spiel" }); return verweigert(/^ungeeicht: ein ratender Prüfer läse hier GRÜN/, () => U(lauf({ n: 48, fang: 8, sprosse: "t.tief#1", denkt: sieht }), E.f)); });
    pruefe("Täter UNGEEICHT (Eichungs-Akte von Hand auf „scharf“ gestellt): die Prüfsumme fasst es — verweigert", () => { const E = eichAkte({ art: "ordnen", denkt: (a, r) => (r() < 0.5 ? "Foto" : "Render") }); const e = lies(E.f); e.scharf = true; e.treffer = 200; fs.writeFileSync(E.f, JSON.stringify(e)); return verweigert(/^falscher Hash: die Prüfsumme der Eichungs-Akte/, () => U(lauf({ n: 40, sprosse: "t.hoch#1", art: "ordnen", denkt: sieht }), E.f)); });
    pruefe("Täter BAUER = PRÜFER: derselbe Kontext baute und prüft — verweigert", () => verweigert(/^Bauer = Prüfer: der Kontext „bauer-kontext-1“/, () => U(lauf({ n: 40, sprosse: "t.hoch#1", art: "ordnen", denkt: sieht, kontext: "bauer-kontext-1" }))));
    pruefe("Täter OHNE FANG: ein Blatt ohne Fang-Aufgaben gegen „≤ 55 %“ — verweigert", () => verweigert(/^Fang-Aufgaben fehlen: 0 < 8/, () => U(lauf({ n: 40, sprosse: "t.tief#1", denkt: raet }))));
    pruefe("Täter FANG VERFEHLT: der Prüfer rät auch an den gepflanzten Aufgaben — verweigert", () => verweigert(/^Fang-Aufgaben verfehlt: \d von 8/, () => U(lauf({ n: 208, fang: 8, identisch: true, sprosse: "t.tief#1", denkt: (z, r) => (z.fang ? (z.richtig === "A" ? "B" : r() < 0.6 ? "A" : "B") : raet(z, r)) }))));
    pruefe("Täter ZU WENIGE PAARE: 39 Paare — verweigert", () => verweigert(/^zu wenige Paare: 39 < 40/, () => U(lauf({ n: 39, sprosse: "t.hoch#1", art: "ordnen", denkt: sieht }), eichAkte({ art: "ordnen" }).f)));
    pruefe("Täter FORM-LECK: ein Paar mit ungleichem Pixelmaß — das Blatt entsteht nicht", () => verweigert(/^Form-Leck: Aufgabe 4 — 3a\.png 1×1 png gegen 3b\.png 2×1 png/, () => lauf({ n: 40, sprosse: "t.hoch#1", art: "ordnen", denkt: sieht, leck: true })));
    pruefe("Täter OHNE SCHWELLE: der Satz nennt keine Zahl — verweigert, nie geraten", () => verweigert(/^verweigert: ohne Schwelle im Satz/, () => U(lauf({ n: 40, sprosse: "t.ohne#1", denkt: sieht }))));
    pruefe("Urteil ROT: ein sehender Prüfer trennt 48 von 48 gegen „≤ 55 %“ — unterscheidbar", () => { const a = U(lauf({ n: 48, fang: 8, sprosse: "t.tief#1", denkt: sieht })); return a.urteil === "ROT" && /^unterscheidbar/.test(a.lesart) ? true : a.wert; });
    // der LESER (buche-2): dieselbe Kette aus der Akte auf der Platte
    pruefe("Leser: die Akte eines GRÜNEN Urteils hält; ohne Eichungs-Datei, mit getauschtem Urteil oder fremdem Kopf hält sie nicht", () => {
        const dir = path.join(X, "akten"), ed = path.join(X, "eichung");
        fs.mkdirSync(dir, { recursive: true });
        fs.mkdirSync(ed, { recursive: true });
        const Eo = eichAkte({ art: "ordnen" });
        const a = U(lauf({ n: 40, sprosse: "t.hoch#1", art: "ordnen", denkt: sieht }), Eo.f);
        const roh = JSON.stringify(a, null, 1) + "\n";
        fs.writeFileSync(path.join(dir, "t.hoch.1.json"), roh);
        const ref = { akte: "t.hoch.1.json", sha256: sha256(roh) }, erw = { leiter: "t.hoch", sprosse: 1, sha: "2da17e2e72aa", geraet: "Radeon 890M", urteil: "GRÜN" }, o = { akten: dir, eichung: ed, zensus: ZENSUS_T };
        const ohne = akteGueltig(ref, erw, o);
        if (!/^ungeeicht: die Eichungs-Akte/.test(ohne)) return "ohne Eichungs-Datei: " + ohne;
        fs.copyFileSync(Eo.f, path.join(ed, path.basename(Eo.f)));
        const mit = akteGueltig(ref, erw, o);
        if (mit !== null) return "die gültige Akte hält nicht: " + mit;
        if (!/^die Fahrt sagt ROT/.test(akteGueltig(ref, { ...erw, urteil: "ROT" }, o))) return "getauschtes Urteil";
        if (!/gilt dem Kopf 2da17e2e/.test(akteGueltig(ref, { ...erw, sha: "ffffffffffff" }, o))) return "fremder Kopf";
        const b = { ...a, gezaehlt: 10, quote: 0.25 };
        const rohB = JSON.stringify(b) + "\n";
        fs.writeFileSync(path.join(dir, "t.hoch.1.json"), rohB);
        return /^falscher Hash: die Prüfsumme der Prüfer-Akte/.test(akteGueltig({ akte: "t.hoch.1.json", sha256: sha256(rohB) }, erw, o)) ? true : "die von Hand geänderte Akte hält";
    });
    {
        // TEIL-BLÄTTER: 8 Teile zu 25 Ankern, je Teil ein frischer Prüfer-Kontext desselben Modells
        const teilLauf = (o = {}) => {
            const d = path.join(X, "teile" + ++lfd), paare = path.join(d, "paare");
            fs.mkdirSync(paare, { recursive: true });
            const aufgaben = [];
            for (let i = 0; i < 200; i++) { fs.writeFileSync(path.join(paare, i + ".png"), i % 2 ? png(200, 30, 30) : png(30, 30, 200)); aufgaben.push({ bilder: [i + ".png"], wahr: i % 2 ? "Foto" : "Render" }); }
            fs.writeFileSync(path.join(paare, "paare.json"), JSON.stringify({ sprosse: null, art: "ordnen", form: "klasse", frage: "Foto oder Render?", optionen: ["Foto", "Render"], bauer: "bauer-kontext-1", herkunft: "fremd", aufgaben }));
            const T = teileBauen(paare, path.join(d, "blatt"), path.join(d, "zu"), 5, 25);
            if (o.blindeHaelfte) { // dazu 50 Anker der Herkunft „stoerung“ in zwei Teilen, an denen der Prüfer alles verfehlt
                const p2 = path.join(d, "paare2");
                fs.mkdirSync(p2);
                const a2 = [];
                for (let i = 0; i < 50; i++) { fs.writeFileSync(path.join(p2, i + ".png"), i % 2 ? png(200, 30, 30) : png(30, 30, 200)); a2.push({ bilder: [i + ".png"], wahr: i % 2 ? "Render" : "Foto" }); }
                fs.writeFileSync(path.join(p2, "paare.json"), JSON.stringify({ sprosse: null, art: "ordnen", form: "klasse", frage: "Foto oder Render?", optionen: ["Foto", "Render"], bauer: "bauer-kontext-1", herkunft: "stoerung", aufgaben: a2 }));
                T.push(...teileBauen(p2, path.join(d, "blatt"), path.join(d, "zu"), 6, 25, 8));
            }
            fs.mkdirSync(path.join(d, "antworten"));
            T.forEach((t, i) => {
                if (o.ohne === t.teil) return;
                const b = lies(path.join(d, "blatt", t.teil, "blatt.json"));
                fs.writeFileSync(path.join(d, "antworten", t.teil + ".json"), JSON.stringify({ blatt: b.zuordnungSha256, pruefer: { modell: o.fremdesModell === t.teil ? "modell-fest-2" : "modell-fest-1", kontext: "pruefer-kontext-" + i },
                    antworten: b.aufgaben.map((a) => ({ nr: a.nr, antwort: siehtKlasse(a, null, fs.readFileSync(path.join(d, "blatt", t.teil, a.bilder[0]))) })) }));
            });
            return { d, T, E: () => eichung(path.join(d, "blatt"), path.join(d, "zu"), path.join(d, "antworten"), "2026-11-26T10:00:00Z") };
        };
        pruefe("TEILE: 200 Anker in 8 Teil-Blättern zu 25, je Teil ein eigener Kontext — die Eichung liest sie zusammen und ist scharf", () => { const L = teilLauf(), E = L.E(); return L.T.length === 8 && E.scharf && E.anker === 200 && E.teile.length === 8 && eichungTraegt(E, { modell: "modell-fest-1", art: "ordnen", stumpf: "gruen" }) === null ? true : E.grund; });
        pruefe("Täter TEIL FEHLT: ein Teil ohne Antworten — verweigert beim Namen (eine Eichung wird ganz gefahren)", () => verweigert(/^Teil teil-03 ist unbeantwortet/, () => teilLauf({ ohne: "teil-03" }).E()));
        pruefe("Täter BLINDE HÄLFTE: 200 von 200 an der Herkunft fremd, 0 von 50 an der Störung — zusammen 0,8, aber je Herkunft verfehlt: urteilt nicht", () => { const E = teilLauf({ blindeHaelfte: true }).E(); return E.anker === 250 && E.treffer === 200 && !E.scharf && /^urteilt nicht: Herkunft „stoerung“ 0 von 50/.test(E.grund) ? true : E.grund; });
        pruefe("Täter ZWEI MODELLE: ein Teil von einem anderen Modell geurteilt — verweigert", () => verweigert(/^die Teile tragen nicht EIN Modell: /, () => teilLauf({ fremdesModell: "teil-05" }).E()));
    }
    pruefe("Binomial: 20 von 40 → Intervall 33,8–66,2 % (Clopper-Pearson), 40 von 40 → untere Grenze 91,2 %", () => { const a = intervall(20, 40), b = intervall(40, 40); return Math.abs(a[0] - 0.338) < 0.002 && Math.abs(a[1] - 0.662) < 0.002 && Math.abs(b[0] - 0.9119) < 0.002 ? true : JSON.stringify([a, b]); });
    pruefe("Zensus am Stand: zensus.json steht am Wortlaut von Karte und Tafel", () => { const Zn = require("./zensus.cjs"); return Zn.fest(Zn.rechne()) === Zn.fest(lies(ZENSUS)) ? true : "zensus.json weicht ab — node vision/pruefer/zensus.cjs"; });
    fs.rmSync(X, { recursive: true, force: true });
    console.log("PRÜFER-SELBSTTEST: " + ok + " GRÜN · " + fehl + " ROT");
    return fehl ? 1 : 0;
}

function haupt(argv) {
    const arg = (n, d) => (argv.includes(n) ? argv[argv.indexOf(n) + 1] : d);
    const befehl = argv[0];
    if (argv.includes("--selftest") || argv.includes("--selbsttest")) return selftest();
    const jetzt = new Date().toISOString();
    if (befehl === "blatt") {
        if (arg("--teil")) {
            const t = teileBauen(arg("--paare"), arg("--aus"), arg("--zuordnung"), +arg("--saat", "20261126"), +arg("--teil"));
            console.log("BLATT in " + t.length + " Teilen, " + t.reduce((n, x) => n + x.aufgaben, 0) + " Aufgaben — Zuordnung je Teil getrennt in " + arg("--zuordnung"));
            return 0;
        }
        const r = blattBauen(arg("--paare"), arg("--aus"), arg("--zuordnung"), +arg("--saat", "20261126"));
        console.log("BLATT " + r.aufgaben + " Aufgaben (davon Fang " + r.fang + ") · Zuordnung " + r.zuordnungSha256.slice(0, 16) + " — getrennt in " + arg("--zuordnung"));
        return 0;
    }
    if (befehl === "eichung") {
        const E = eichung(arg("--blatt"), arg("--zuordnung"), arg("--antworten"), jetzt);
        const dir = arg("--aus", EICHUNG);
        fs.mkdirSync(dir, { recursive: true });
        const f = path.join(dir, E.art + "." + E.modell.replace(/[^a-z0-9.-]/gi, "-") + "." + E.zuordnungSha256.slice(0, 8) + ".json");
        fs.writeFileSync(f, JSON.stringify(E, null, 1) + "\n");
        console.log("EICHUNG " + E.grund + " (" + E.art + ", Modell " + E.modell + ", Herkunft " + E.herkunft + ", Intervall " + E.intervall95.join("–") + ") → " + f);
        return E.scharf ? 0 : 1;
    }
    if (befehl === "urteil") {
        const a = urteil(arg("--blatt"), arg("--zuordnung"), arg("--antworten"), arg("--eichung"), jetzt);
        const dir = arg("--akten", AKTEN);
        fs.mkdirSync(dir, { recursive: true });
        const name = a.leiter + "." + a.sprosse + "." + String(a.sha).slice(0, 8) + "-" + GERAET_DATEI(a.geraet) + ".json";
        const roh = JSON.stringify(a, null, 1) + "\n";
        fs.writeFileSync(path.join(dir, name), roh);
        console.log("PRÜFER-AKTE " + name + ": " + a.urteil + " — " + a.wert);
        if (arg("--richter")) {
            const karte = lies(path.join(HIER, "..", "meisterkarte-2.json"));
            let soll = null;
            for (const g of karte.gruppen) for (const L of g.kriterien) if (L.id === a.leiter) soll = (L.sprossen.find((s) => s.nr === a.sprosse) || {}).richter;
            if (!soll) weg("die Sprosse " + a.leiter + " S " + a.sprosse + " steht nicht in der Karte");
            const fahrt = fahrtAus(a, name, roh, soll, arg("--vorlage") ? lies(arg("--vorlage")) : null);
            fs.mkdirSync(arg("--richter"), { recursive: true });
            fs.writeFileSync(path.join(arg("--richter"), name), JSON.stringify(fahrt, null, 1) + "\n");
            console.log("FAHRT " + name + " → " + arg("--richter") + (fahrt.geraete[0].preis ? "" : " (ohne Preis: höchstens Kern)"));
        }
        return 0;
    }
    console.log("Aufruf: node vision/pruefer/pruefer.cjs blatt | eichung | urteil | --selftest (Kopf der Datei)");
    return 2;
}
if (require.main === module) {
    try {
        process.exit(haupt(process.argv.slice(2)));
    } catch (e) {
        console.error((e instanceof Verweigert ? "VERWEIGERT: " : "") + e.message);
        process.exit(e instanceof Verweigert ? 3 : 2);
    }
}
module.exports = { akteGueltig, eichungTraegt, blattBauen, teileBauen, eichung, urteil, fahrtAus, intervall, binomP, sprosseVon, sha256, summe, Verweigert, MIN_PAARE, MIN_ANKER, SCHARF };
