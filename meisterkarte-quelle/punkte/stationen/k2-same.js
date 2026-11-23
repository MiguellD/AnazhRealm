// KARTE 2 · SAME — die Richter-Stationen der Leitern same.* (vision/meisterkarte-2.json) und DAS LEITER-GERÜST, das k2-erleben.js und
// k2-kosmos.js mittragen (`module.exports.geruest`).
//
// DAS GESETZ DER LEITER (Auftrag richter-erleben-same-kosmos, 18.11.): je Leiter EINE Station — EIN Messprogramm über alle Sprossen,
// der Umfang der Sprosse sein Argument, das Soll je Sprosse wörtlich aus der Karte als Zahl. Im Läufer (punkte.cjs) ist das EINE Probe,
// deren Sprossen Zwillinge sind (staffel = die Sprosse, derselbe argv: die Sitzung fährt sie EINMAL, jede Sprosse urteilt denselben
// Lauf). Geurteilt wird am ERGEBNIS in der Welt der Sitzung, nie an Pfad, Code-Text oder Existenz:
//   gemessen — die Werte der Welt gegen das Soll der Karte; dazu der Umfang, den die Welt dabei WIRKLICH trug (erzeugt ≥ verlangt,
//              sonst ROT „gemessen unter dem Umfang“), und die Welt-Zeugen der Leiter (ein Zeuge auf 0: die Attrappe — eine Antwort, die
//              den Wortlaut erfüllt, ohne dass die Welt sich änderte, fällt beim Namen)
//   umfang   — die Welt erzeugt den Umfang der Sprosse nicht: ROT „Umfang nicht erzeugbar: <was fehlt>“ mit der gezählten Zahl (ein
//              Urteil, kein Fehler, kein Überspringen)
//   leser    — die Welt hätte den Umfang, aber kein Leser des Spiels nennt die Zahl: ROT „Leser fehlt: <Haken> (datei:zeile)“
//   auge     — die Probe schießt das Bild an fester Pose und legt es ab. Die Klasse der Sprosse (auge-klasse.cjs, am Wortlaut der Karte)
//              entscheidet, wer urteilt: ZAHL — die Werte gegen das Soll wie `gemessen` (Welt-Zeugen inklusive), das Bild ist Beleg;
//              PANEL (R11) und KORPUS — das Urteil fällt am Gerät mit dem Panel bzw. dem eingefrorenen Korpus, die Station sagt nie GRÜN
// Fehlt das Ergebnis einer Sprosse (die Probe warf, die Frist riss), gleicht ihr Urteil dem über den leeren Lauf: UNGEMESSEN beim Namen
// (punkte.cjs keinUrteil). Der Preis (R8, die Preis-Treppe der Umfangs-Klasse) misst die Station NIE selbst: ihn liest richter-akte.cjs
// im SELBEN Lauf aus dem Strom der Sitzung — die Probe endet an der dichtesten Pose ihrer Leiter (`L.preisPose`, R3), dort fährt der
// Preis-Lauf der Sitzung.
//
// DIE WAND DES WORTLAUTS (beim Laden, laut): jedes Soll nennt den Satz der Karte, aus dem seine Zahl stammt (`wortlaut`, wörtlich in
// richter · preis · tiefe · umfang der Sprosse oder einer genannten Sprosse derselben Leiter), und die Zahl steht in ihm; derselbe Satz
// für den Umfang. Jede Sprosse der Leiter steht in der Station oder in `bestehend` (eine Station der Gruppen g1–g6 trägt sie schon) —
// keine still gestrichen.
"use strict";
const fs = require("fs");
const path = require("path");
const crypto = require("crypto");
const { probeBefehl, SAATEN } = require("./sitzung-seite.js");
const { netzMitschnitt } = require("./g6.js"); // der EINE Netz-Mitschnitt (same.preis.bytes S7 zählt die Sprünge der Saaten mit ihm)
const AUGE = require("./auge-klasse.cjs");

const KARTE2_DATEI = path.join(__dirname, "..", "..", "..", "vision", "meisterkarte-2.json");
let karte2 = null;
const leiterDerKarte = (id) => {
    if (!karte2) karte2 = new Map(JSON.parse(fs.readFileSync(KARTE2_DATEI, "utf8")).gruppen.flatMap((g) => g.kriterien.map((L) => [L.id, L])));
    return karte2.get(id);
};

// DIE ZAHLEN EINES SATZES DER KARTE: „10²“ · „4·10⁸“ · „10⁻³“ · „1 000“ (auch geschütztes oder schmales Leerzeichen) · „0,95“ · „16,7“
const HOCH = "⁰¹²³⁴⁵⁶⁷⁸⁹";
const hoch = (s) => (s[0] === "⁻" ? -1 : 1) * Number([...s.replace(/^⁻/, "")].map((c) => HOCH.indexOf(c)).join(""));
function karteZahlen(text) {
    let t = String(text).replace(/[   ]/g, " ");
    t = t.replace(/(\d+(?:,\d+)?)\s*[·×]\s*10([⁻⁰¹²³⁴⁵⁶⁷⁸⁹]+)/g, (_, a, e) => " " + String(Number(a.replace(",", ".")) * 10 ** hoch(e)) + " ");
    t = t.replace(/10([⁻⁰¹²³⁴⁵⁶⁷⁸⁹]+)/g, (_, e) => " " + String(10 ** hoch(e)) + " ");
    const aus = [];
    for (const m of t.matchAll(/\d{1,3}(?: \d{3})+(?:,\d+)?(?!\d)|\d+(?:[.,]\d+)?(?:e[+-]?\d+)?/g)) aus.push(Number(m[0].replace(/ /g, "").replace(",", ".")));
    // die Zahlwörter der Karte („an beiden Geräten“, „zwei Saaten“)
    for (const m of t.toLowerCase().matchAll(/(?<![a-zäöüß])(beide[nr]?|zwei|drei|vier|fünf|sechs|sieben|acht|neun|zehn|zwölf|hundert|tausend)(?![a-zäöüß])/g))
        aus.push(ZAHLWORT[m[1].replace(/^beide[nr]?$/, "beide")]);
    return aus;
}
const ZAHLWORT = { beide: 2, zwei: 2, drei: 3, vier: 4, fünf: 5, sechs: 6, sieben: 7, acht: 8, neun: 9, zehn: 10, zwölf: 12, hundert: 100, tausend: 1000 };
const gleichZahl = (a, b) => Math.abs(a - b) <= 1e-9 * Math.max(1, Math.abs(a), Math.abs(b));
const eng = (s) => String(s).replace(/\s+/g, " ").trim();

// ─────────────────────────── DAS URTEIL EINER SPROSSE (läuft im Läufer; S = die Sprosse mit Soll, Umfang, Zeugen) ───────────────────────────
// Der Text dieser Funktion steht wörtlich in jedem Urteil (new Function, unten) und als Prüfsumme im argv der Probe: ändert sich das
// Urteil, ändert sich der Abdruck jeder Station.
function sprosseUrteil(S, j, lauf) {
    const kopf = "S" + S.nr + " · ";
    const LEER = { gruen: false, zahl: kopf + "kein Ergebnis der Sprosse im Lauf der Leiter " + S.leiter };
    const s = j && j.sprossen && j.sprossen[S.nr];
    if (!s || typeof s !== "object") return LEER;
    const ad = (j && j.hw) || (/\[linse-gpu\][^\r\n]*/.exec(String((lauf && lauf.stdout) || "")) || [null])[0];
    if (!ad || /swiftshader|llvmpipe|lavapipe|software|subzero|ungenannt/i.test(ad)) return { gruen: false, zahl: kopf + "ROT keine echte GPU (R2): " + (ad || "Adapter ungenannt") };
    const zahl = (x) => (typeof x === "number" && Number.isFinite(x) ? String(+x.toPrecision(6)).replace(".", ",") : "—");
    const um = S.umfang;
    const umText = um ? "verlangt " + zahl(um.verlangt) + " " + um.einheit + ", die Welt erzeugte " + zahl(s.erzeugt) : "";
    if (s.art === "auge" && !S.zahl) {
        if (!S.auge) return { gruen: false, zahl: kopf + "ROT die Probe nennt ein Augen-Urteil, die Sprosse trägt keines (Karte: " + S.leiter + " S" + S.nr + ")" };
        // was die Sprosse neben dem Auge in Zahlen verlangt, steht gemessen daneben — das Urteil fällt trotzdem nur am Gerät
        const mit = S.soll.filter((z) => s.werte && typeof s.werte[z.wort] === "number").map((z) => z.wort + " " + zahl(s.werte[z.wort]) + " (Soll " + z.richtung + " " + zahl(z.wert) + ")");
        return { gruen: false, zahl: kopf + "auge · Pose " + S.auge.pose + " · Vorbild " + S.auge.vorbild + " · Bild " + (s.bild || "keines geschossen" + (s.grund ? " (" + s.grund + ")" : "")) +
            (mit.length ? " · gemessen " + mit.join(" · ") : "") + (um && Number.isFinite(s.erzeugt) ? " · " + umText : "") + " — zählt nur mit dem Urteil am Gerät (R11), die Station sagt nie GRÜN" };
    }
    if (s.art === "umfang") {
        if (!um || !Number.isFinite(s.erzeugt)) return LEER;
        if (s.erzeugt >= um.verlangt) return { gruen: false, zahl: kopf + "ROT die Probe widerspricht sich: Umfang nicht erzeugbar, doch " + umText };
        return { gruen: false, zahl: kopf + "ROT Umfang nicht erzeugbar: " + (s.was || "?") + " (" + umText + ")" };
    }
    if (s.art === "leser") return { gruen: false, zahl: kopf + "ROT Leser fehlt: " + (s.fehlt || "?") + (um && Number.isFinite(s.erzeugt) ? " (" + umText + ")" : "") };
    // ZAHL (auge-klasse.cjs): die Sprosse urteilt an ihren Werten — ob die Probe sie mit Bild (auge) oder ohne (gemessen) ablegt
    if (s.art !== "gemessen" && !(s.art === "auge" && S.zahl)) return LEER;
    if (S.auge && !S.zahl) return { gruen: false, zahl: kopf + "ROT die Sprosse urteilt ein Auge, die Probe nennt nur Zahlen — kein Bild abgelegt" };
    const w = s.werte || {}, welt = s.welt || {};
    const teile = [], rot = [];
    for (const z of S.soll) {
        const x = w[z.wort];
        const ok = typeof x === "number" && Number.isFinite(x) && (z.richtung === "≤" ? x <= z.wert : x >= z.wert);
        teile.push((ok ? "✅ " : "❌ ") + z.wort + " " + zahl(x) + " (Soll " + z.richtung + " " + zahl(z.wert) + ")");
        if (!ok) rot.push(z.wort + " " + zahl(x) + " statt " + z.richtung + " " + zahl(z.wert));
    }
    const umOk = !um || (Number.isFinite(s.erzeugt) && s.erzeugt >= um.verlangt);
    if (um) teile.push((umOk ? "✅" : "❌") + " Umfang " + umText);
    if (!umOk) rot.push("gemessen unter dem Umfang (" + umText + ")");
    const attrappe = S.welt.filter((z) => !(typeof welt[z.wort] === "number" && welt[z.wort] >= z.ab));
    if (attrappe.length) rot.unshift("Attrappe: " + attrappe.map((z) => z.wort + " " + zahl(welt[z.wort]) + " < " + zahl(z.ab) + " (" + z.was + ")").join(" · ") + " — die Welt änderte sich nicht");
    if (S.zahl) teile.push("Bild (Beleg) " + (s.bild || "fehlt" + (s.grund ? " (" + s.grund + ")" : "")));
    const gruen = rot.length === 0;
    return { gruen, zahl: kopf + (gruen ? "GRÜN " : "ROT ") + teile.join(" · ") + (gruen ? "" : " — Täter: " + (s.taeter ? s.taeter + " · " : "") + rot.join(" · ")) };
}
// das Maß einer Zeit-Sprosse (das Gesetz der Fremd-Last, mass.cjs): dieselben Werte, an denen das Urteil fällt
function sprosseMass(S, j) {
    const s = j && j.sprossen && j.sprossen[S.nr];
    const w = (s && s.art === "gemessen" && s.werte) || {};
    return S.soll.map((z) => ({ wort: z.wort, wert: typeof w[z.wort] === "number" ? w[z.wort] : null, soll: z.wert, richtung: z.richtung }));
}

// ─────────────────────────── DER RAHMEN DER PROBE (läuft IN der Probe: node -e im Spiel-Baum, H = sitzung-seite.js) ───────────────────────────
// PLAN: die Sprossen mit Umfang (das Argument) und Soll; lauf(H, P, L): das Messprogramm der Leiter. L gibt ihm die Werkbank der
// Sitzung, die Welt (/eval) und die EINE Form der Ergebnisse — je Sprosse genau eines.
async function leiterRahmen(H, P, lauf) {
    const fs = require("fs");
    const logDatei = process.env.PUNKTE_SITZUNG_LOG;
    const log = logDatei && fs.existsSync(logDatei) ? fs.readFileSync(logDatei, "utf8") : "";
    const hw = (/\[linse-gpu\][^\r\n]*/.exec(log) || [null])[0];
    console.log(hw || "[linse-gpu] ungenannt (kein Log der Sitzung)");
    const j = (H.teil = { leiter: P.leiter, hw, sprossen: {}, fehler: {}, zeilen: [], preisPose: null });
    const D = String(H.AUS).replace(/\.json$/, "") + "-bilder";
    // DER STAND NACH JEDER SPROSSE (punkte.cjs keinUrteil (e)): die Ausgabe trägt jede geurteilte Sprosse ganz, ehe die nächste misst —
    // reißt danach die Frist oder tötet die Leine die Probe, urteilt die Sprosse aus ihr (geschrieben neben der Ausgabe, dann umbenannt:
    // nie ein halbes JSON)
    const stand = () => {
        try {
            fs.writeFileSync(H.AUS + ".stand", JSON.stringify(j));
            fs.renameSync(H.AUS + ".stand", H.AUS);
        } catch (e) {
            H.zeile("Stand: " + String((e && e.message) || e).split("\n")[0]);
        }
    };
    const setze = (nr, e) => {
        if (!P.sprossen[nr]) throw new Error("S" + nr + " ist keine Sprosse dieser Station");
        if (j.sprossen[nr]) throw new Error("S" + nr + " zweimal geurteilt");
        j.sprossen[nr] = Object.assign(e, { t: H.sek() });
        stand();
        H.zeile(P.leiter + " S" + nr + " " + e.art + " " + JSON.stringify(e).slice(0, 220));
    };
    const L = {
        P,
        j,
        D,
        rest: () => H.rest(),
        zeile: (t) => (j.zeilen.push(t), H.zeile(t)),
        wb: async (weg, nutz, s = 60) => {
            const o = await H.wb(weg, nutz, s * 1000);
            if (o && typeof o.fehler === "string") throw H.messort(new Error(weg + ": " + o.fehler.slice(0, 240)), weg);
            return o;
        },
        ev: (code, s = 60) => H.evalWelt(code, s * 1000),
        ort: (ort, sicht, pose) => L.wb("/umstellen", Object.assign({ ort, sicht: sicht || "ego" }, pose ? { pose } : {}), 240),
        // DIE ERGEBNISSE: werte {wort: Zahl} in den Einheiten der Karte · o.erzeugt der Umfang, den die Welt trug · o.welt die Zeugen
        // {wort: Zahl} · o.taeter der nächste Täter beim Namen
        gemessen: (nr, werte, o) => setze(nr, { art: "gemessen", werte, erzeugt: (o || {}).erzeugt, welt: (o || {}).welt || {}, taeter: (o || {}).taeter || null, beleg: (o || {}).beleg || null }),
        umfang: (nr, erzeugt, was) => setze(nr, { art: "umfang", erzeugt, was }),
        leser: (nr, fehlt, erzeugt) => setze(nr, { art: "leser", fehlt, erzeugt }),
        // DAS AUGE: das Bild an fester Pose (Messort, Sicht, Pose der Werkbank; b: Uhr, Wetter, Saison wie `werkbank bild`)
        auge: async (nr, o) => {
            try {
                if (o && o.ort) await L.ort(o.ort, o.sicht, o.pose);
                const kam = await L.ev("r._loopCamera(performance.now()); const c = r.state.camera; return [...c.position.toArray(), ...c.getWorldDirection(new T.Vector3()).multiplyScalar(20).add(c.position).toArray()];");
                const datei = require("path").join(D, P.leiter + "-S" + nr + ".png");
                const b = await L.wb("/bild", Object.assign({ px: kam[0], py: kam[1], pz: kam[2], lx: kam[3], ly: kam[4], lz: kam[5], w: 1280, h: 720, datei }, (o && o.b) || {}), 120);
                setze(nr, { art: "auge", bild: (b && b.datei) || datei, werte: (o && o.werte) || null, erzeugt: o && o.erzeugt, welt: (o && o.welt) || {} });
            } catch (e) {
                if (e && e.messort) throw e;
                setze(nr, { art: "auge", bild: null, grund: String((e && e.message) || e).split("\n")[0].slice(0, 160), werte: (o && o.werte) || null, erzeugt: o && o.erzeugt, welt: (o && o.welt) || {} });
            }
        },
        // DER STROM DER SITZUNG (punkte.cjs stromZapfen · stromLesen — dieselbe Quelle, aus der richter-akte.cjs den Preis liest; kein
        // eigener Bild-Messer): L.zelle(name) nennt die Zelle der folgenden Bilder (null: keine), L.bilder(name) gibt die Bilder dieser
        // Probe in ihr ({ dt, gpu, vram, dreiecke, sicht, … } je Bild), L.p95 wie der Kopf des Stroms (Rang ⌊0,95·n⌋)
        zelle: async (name) => {
            const M = require(process.env.PUNKTE_MASCHINE || "-");
            if (!process.env.PUNKTE_SITZUNG_STROM) throw H.messort(new Error("die Sitzung trägt keinen Strom (PUNKTE_SITZUNG_STROM fehlt)"));
            const z = await M.stromZapfen(Number(process.env.WERKBANK_PORT) || H.W, process.env.PUNKTE_SITZUNG_STROM, process.env.PUNKTE_PROBE, { zelle: name });
            if (!z.ok) throw H.messort(new Error("der Strom zapft nicht: " + z.grund));
        },
        bilder: (name) =>
            require(process.env.PUNKTE_MASCHINE || "-").stromLesen(process.env.PUNKTE_SITZUNG_STROM).bilder.filter((b) => b.probe === process.env.PUNKTE_PROBE && b.zelle === name && b.dt >= 0),
        p95: (a) => {
            const s = a.filter(Number.isFinite).sort((x, y) => x - y);
            return s.length ? s[Math.min(s.length - 1, Math.floor(0.95 * s.length))] : null;
        },
        // DIE DICHTESTE POSE der Leiter (R3): dort endet die Probe, dort fährt der Preis-Lauf der Sitzung
        preisPose: (ort, sicht, pose) => (j.preisPose = { ort, sicht: sicht || "ego", pose: pose || null }),
        // je Sprosse ein eigener Versuch: ein Wurf steht beim Namen in j.fehler, die Sprosse bleibt ohne Ergebnis (UNGEMESSEN), die
        // nächste misst weiter — außer der Wurf trägt den Messort (dann reißt die Probe, punkte.cjs keinUrteil (d))
        je: async (nr, f) => {
            try {
                await f();
            } catch (e) {
                if (e && e.messort) throw e;
                j.fehler[nr] = String((e && e.message) || e).split("\n")[0].slice(0, 240);
                H.zeile(P.leiter + " S" + nr + " warf: " + j.fehler[nr]);
            }
        },
    };
    await lauf(H, P, L);
    if (j.preisPose) {
        try {
            await L.ort(j.preisPose.ort, j.preisPose.sicht, j.preisPose.pose);
            j.preisPose.steht = true;
        } catch (e) {
            j.preisPose.steht = false;
            j.preisPose.grund = String((e && e.message) || e).split("\n")[0].slice(0, 160);
        }
    }
    return j;
}

// ─────────────────────────── DIE LEITER → IHRE STATIONEN ───────────────────────────
// def = { leiter, sek (≤ 60: eine Leiter in warmer Welt), pfad (Globs im Spiel-Baum, die das Programm liest), welt ([{ wort, ab, was }]:
// die Zeugen, dass die Welt sich änderte — je Sprosse überschreibbar), sprossen: { nr: { soll: [{ wort, richtung "≤"|"≥", wert,
// wortlaut, feld?, aus? }], umfang?: { verlangt, einheit, wortlaut, feld?, aus? }, auge?: { pose, vorbild }, welt? } }, bestehend: [nr …]
// (Sprossen, die eine Station in g1–g6 schon trägt), lauf: async function (H, P, L), seite?: { name: Funktion }, mutiert? }
const FELDER = ["richter", "preis", "tiefe", "umfang"];
function wortlautWand(L, nr, x, was) {
    const quelle = L.sprossen.find((s) => s.nr === (x.aus || nr));
    if (!quelle) throw new Error(L.id + " S" + nr + " " + was + ": die Sprosse " + x.aus + " steht nicht in der Leiter");
    const felder = x.feld ? [x.feld] : FELDER;
    const satz = eng(x.wortlaut || "");
    if (satz.length < 2 || !felder.some((f) => eng(quelle[f] || "").includes(satz)))
        throw new Error(L.id + " S" + nr + " " + was + ": der Wortlaut „" + satz + "“ steht nicht in " + felder.join("|") + " von S" + quelle.nr + " der Karte");
    const zahl = was === "Umfang" ? x.verlangt : x.wert;
    if (!(typeof zahl === "number" && Number.isFinite(zahl)) || !karteZahlen(satz).some((z) => gleichZahl(z, zahl)))
        throw new Error(L.id + " S" + nr + " " + was + ": die Zahl " + zahl + " steht nicht im Wortlaut „" + satz + "“ (" + karteZahlen(satz).join(", ") + ")");
}
function leiter(def) {
    const L = leiterDerKarte(def.leiter);
    if (!L) throw new Error("die Leiter " + def.leiter + " steht nicht in vision/meisterkarte-2.json");
    const nrs = Object.keys(def.sprossen || {}).map(Number);
    const bestehend = def.bestehend || [];
    for (const s of L.sprossen)
        if (!nrs.includes(s.nr) && !bestehend.includes(s.nr)) throw new Error(def.leiter + " S" + s.nr + ": weder in der Station noch bestehend — keine Sprosse fällt still");
    for (const nr of [...nrs, ...bestehend]) if (!L.sprossen.some((s) => s.nr === nr)) throw new Error(def.leiter + " S" + nr + ": keine Sprosse der Karte");
    if (!(Number.isInteger(def.sek) && def.sek >= 10 && def.sek <= 60)) throw new Error(def.leiter + ": sek " + def.sek + " (eine Leiter ≤ 60 s in warmer Welt)");
    if (typeof def.lauf !== "function" || !/^async function\b/.test(String(def.lauf))) throw new Error(def.leiter + ": lauf ist keine `async function` (ihr Text steht im argv der Probe)");
    if (!Array.isArray(def.pfad) || !def.pfad.length) throw new Error(def.leiter + ": pfad leer");
    const specs = nrs.map((nr) => {
        const d = def.sprossen[nr];
        const sp = L.sprossen.find((s) => s.nr === nr);
        const soll = d.soll || [];
        if (!d.auge && !soll.length) throw new Error(def.leiter + " S" + nr + ": weder Soll noch Auge");
        for (const z of soll) {
            if (!/^[a-z0-9_]+$/.test(z.wort || "") || !["≤", "≥"].includes(z.richtung)) throw new Error(def.leiter + " S" + nr + ": Soll " + JSON.stringify(z) + " (wort a-z0-9_, richtung ≤|≥)");
            wortlautWand(L, nr, z, "Soll " + z.wort);
        }
        if (d.umfang) {
            if (!(d.umfang.einheit && typeof d.umfang.einheit === "string")) throw new Error(def.leiter + " S" + nr + ": Umfang ohne Einheit");
            wortlautWand(L, nr, d.umfang, "Umfang");
        }
        if (d.auge && !(d.auge.pose && d.auge.vorbild)) throw new Error(def.leiter + " S" + nr + ": auge ohne Pose und Vorbild");
        // ZAHL (auge-klasse.cjs): eine Auge-Sprosse, deren Satz eine Zahl aus dem Spiel ist, urteilt an ihrem Soll — mit Welt-Zeugen wie
        // `gemessen`; ohne Soll bleibt sie „fehlt“ mit dem Grund „ZAHL ohne Soll“
        const zahl = !!d.auge && soll.length > 0 && AUGE.klasse(def.leiter, nr).klasse === "zahl";
        const welt = d.welt || def.welt || [];
        if (soll.length && (!d.auge || zahl) && !welt.length) throw new Error(def.leiter + " S" + nr + ": gemessen ohne Welt-Zeugen — die Attrappe fiele nie");
        for (const z of welt) if (!(/^[a-z0-9_]+$/.test(z.wort || "") && Number.isFinite(z.ab) && z.ab > 0 && z.was)) throw new Error(def.leiter + " S" + nr + ": Zeuge " + JSON.stringify(z));
        return {
            leiter: def.leiter,
            nr,
            richter: sp.richter,
            soll: soll.map((z) => ({ wort: z.wort, richtung: z.richtung, wert: z.wert })),
            umfang: d.umfang ? { verlangt: d.umfang.verlangt, einheit: d.umfang.einheit } : null,
            auge: d.auge ? { pose: d.auge.pose, vorbild: d.auge.vorbild } : null,
            zahl,
            welt: soll.length && (!d.auge || zahl) ? welt.map((z) => ({ wort: z.wort, ab: z.ab, was: z.was })) : [],
        };
    });
    const PLAN = { leiter: def.leiter, sprossen: Object.fromEntries(specs.map((s) => [s.nr, { umfang: s.umfang, soll: s.soll, auge: s.auge }])) };
    const summe = crypto.createHash("sha1").update(String(sprosseUrteil) + String(sprosseMass) + JSON.stringify(specs)).digest("hex").slice(0, 10);
    const fn = "async function leiterProbe(H) { /* richter " + summe + " */ const PLAN = " + JSON.stringify(PLAN) + ";\nreturn (" + leiterRahmen + ")(H, PLAN, " + def.lauf + "); }";
    const PROBE = Object.assign(probeBefehl(fn, def.sek, def.seite || {}), def.mutiert ? { mutiert: true } : {});
    return specs.map((S) => {
        const zeit = S.soll.length > 0 && def.sprossen[S.nr].soll.some((z) => /\bms\b/.test(z.wortlaut));
        const urteil = new Function("j", "lauf", "const S = " + JSON.stringify(S) + ";\nreturn (" + sprosseUrteil + ")(S, j, lauf);");
        const st = {
            kriterium: "karte2." + def.leiter,
            karte2: true,
            staffel: S.nr,
            geraet: ["radeon", "gtx"],
            ...(S.nr === 1 ? { beide: true } : {}),
            probe: PROBE,
            gpu: true,
            zeit,
            minuten: Math.max(0.5, Math.ceil((def.sek / 60) * 10) / 10),
            urteil,
            proben: probenDer(S),
            pfad: def.pfad,
            quelle: "KARTE2 " + def.leiter + " S" + S.nr + " = " + S.richter,
        };
        if (zeit) st.mass = new Function("j", "lauf", "const S = " + JSON.stringify(S) + ";\nreturn (" + sprosseMass + ")(S, j);");
        // DIE TAFEL-ZEILE (der Vertrag aller k2-Register, punkte.cjs k2TafelZeile): „gleich“, oder „fehlt“, wo ein Auge am Gerät urteilt
// — die Klasse der Auge-Sprosse aus auge-klasse.cjs (ZAHL mit Soll „gleich“, PANEL und KORPUS „fehlt“ beim Namen)
        Object.defineProperty(st, "tafel", { enumerable: false, value: S.auge ? AUGE.tafel(S.leiter, S.nr, S.zahl) : { richter: "gleich" } });
        return st;
    });
}

// DER SELBSTTEST JE SPROSSE (punkte.cjs selbsttest, die Wand PROBEN): GRÜN genau am Soll; jedes Soll einen Schritt daneben ROT; der
// Umfang einen Schritt darunter ROT; DIE ATTRAPPE (jedes Soll erfüllt, die Welt-Zeugen auf 0) ROT beim Namen; die Software-GPU ROT;
// „Umfang nicht erzeugbar“ ROT mit dem Wort; das Auge nie GRÜN; das leere Ergebnis ROT
function probenDer(S) {
    const AD = "[linse-gpu] amd/rdna-3.5 Radeon 890M (Probe)";
    const welt = (f) => Object.fromEntries(S.welt.map((z) => [z.wort, f(z)]));
    const werte = (f) => Object.fromEntries(S.soll.map((z) => [z.wort, f(z)]));
    const schritt = (z, raus) => (z.richtung === "≤" ? z.wert + (raus ? 1 : 0) * Math.max(1e-3, Math.abs(z.wert) * 0.01) : z.wert - (raus ? 1 : 0) * Math.max(1e-3, Math.abs(z.wert) * 0.01));
    const um = S.umfang ? S.umfang.verlangt : undefined;
    const ein = (s, ad = AD) => ({ hw: ad, sprossen: { [S.nr]: s } });
    const p = [{ name: "leer: kein Ergebnis der Sprosse", j: { hw: AD, sprossen: {} }, gruen: false, zahl: /kein Ergebnis der Sprosse/ }];
    if (S.auge && !S.zahl)
        return p.concat([
            { name: "auge: das Bild liegt, das Urteil fällt am Gerät", j: ein({ art: "auge", bild: "x/S" + S.nr + ".png", werte: werte((z) => z.wert), erzeugt: um }), gruen: false, zahl: /auge · Pose .* · Vorbild / },
            { name: "auge ohne Bild", j: ein({ art: "auge", bild: null, grund: "bild warf" }), gruen: false, zahl: /keines geschossen/ },
            { name: "statt des Auges nur Zahlen (gemessen, jedes Soll erfüllt)", j: ein({ art: "gemessen", werte: werte((z) => z.wert), erzeugt: um, welt: {} }), gruen: false, zahl: /urteilt ein Auge/ },
            { name: "auge an der Software-GPU", j: ein({ art: "auge", bild: "x.png" }, "[linse-gpu] google/swiftshader (Probe)"), gruen: false, zahl: /keine echte GPU/ },
            ...(um != null ? [{ name: "Umfang nicht erzeugbar (Auge)", j: ein({ art: "umfang", erzeugt: um > 1 ? Math.floor(um / 10) : 0, was: "die Welt hält ihn nicht" }), gruen: false, zahl: /Umfang nicht erzeugbar: / }] : []),
        ]);
    const gut = { art: "gemessen", werte: werte((z) => schritt(z, false)), erzeugt: um, welt: welt((z) => z.ab) };
    p.push({ name: "GRÜN genau am Soll", j: ein(gut), gruen: true });
    for (const z of S.soll) p.push({ name: "das Soll " + z.wort + " reißt um einen Schritt", j: ein({ ...gut, werte: { ...gut.werte, [z.wort]: schritt(z, true) } }), gruen: false, zahl: new RegExp("Täter: .*" + z.wort) });
    if (um != null) {
        p.push({ name: "gemessen unter dem Umfang", j: ein({ ...gut, erzeugt: um > 1 ? Math.floor(um / 2) : 0 }), gruen: false, zahl: /gemessen unter dem Umfang/ });
        p.push({ name: "Umfang nicht erzeugbar", j: ein({ art: "umfang", erzeugt: um > 1 ? Math.floor(um / 10) : 0, was: "die Welt hält ihn nicht" }), gruen: false, zahl: /Umfang nicht erzeugbar: / });
        p.push({ name: "die Probe widerspricht sich (nicht erzeugbar, doch erzeugt)", j: ein({ art: "umfang", erzeugt: um, was: "?" }), gruen: false, zahl: /widerspricht sich/ });
    }
    p.push({ name: "DIE ATTRAPPE: der Wortlaut erfüllt, die Welt unverändert", j: ein({ ...gut, welt: welt(() => 0) }), gruen: false, zahl: /Attrappe: / });
    p.push({ name: "die Software-GPU", j: ein(gut, "[linse-gpu] google/swiftshader (Probe)"), gruen: false, zahl: /keine echte GPU/ });
    p.push({ name: "der Leser fehlt", j: ein({ art: "leser", fehlt: "window.__x (stamm/x.js:1)" }), gruen: false, zahl: /Leser fehlt: / });
    // ZAHL: dieselben Werte mit Bild (auge) urteilen gleich — das Bild ist Beleg, nie Richter; die Attrappe fällt auch mit Bild
    if (S.zahl)
        p.push(
            { name: "ZAHL: gemessen im Soll mit Bild (Beleg)", j: ein({ ...gut, art: "auge", bild: "x/S" + S.nr + ".png" }), gruen: true, zahl: /Bild \(Beleg\) x\// },
            { name: "ZAHL: gemessen im Soll, das Bild warf", j: ein({ ...gut, art: "auge", bild: null, grund: "bild warf" }), gruen: true, zahl: /Bild \(Beleg\) fehlt/ },
            { name: "ZAHL: die Attrappe mit Bild", j: ein({ ...gut, art: "auge", bild: "x.png", welt: welt(() => 0) }), gruen: false, zahl: /Attrappe: / },
        );
    return p;
}

const geruest = { leiter, karteZahlen, leiterDerKarte, sprosseUrteil, leiterRahmen };

// ═══════════════════════════════════════ DIE LEITERN same.* ═══════════════════════════════════════
const LEITERN = [];

// ─────────── same.preis.takt — Bild-Takt über die Gerätespanne (Perspektive preis; das Beispiel des Gerüsts) ───────────
// Der Richter des Preises liest DIESELBE Quelle wie richter-akte.cjs: die Bilder des Loops im Strom der Sitzung, je Zelle beim Namen
// (L.zelle · L.bilder), der Loop läuft über `/lauf` der Werkbank — dessen eigene Zahlen liest die Station nie. Der Umfang ist das
// Argument: die Boots und Sitzungen, die der Lauf trägt (EINER), die Bewohner und Häuser der Stadt-Pose (gezählt in der Welt:
// `_bewohnerSiedlungen` je Siedlung ihre Plätze · `state.architectures`), die Geräteklassen der Sitzung (die EINE Karte des Laufs).
LEITERN.push(
    leiter({
        leiter: "same.preis.takt",
        sek: 60,
        pfad: ["scripts/werkbank.cjs", "scripts/lib/band-urteil.cjs", "spec/profiband/haushalt.json", "stamm/siedlung-bewohner.js", "stamm/siedlung-satz.js", "stamm/dirigent-takt.js"],
        welt: [{ wort: "bilder", ab: 30, was: "Bilder des Loops im Strom der Zelle" }],
        sprossen: {
            1: {
                soll: [{ wort: "frame_p95_ms", richtung: "≤", wert: 33, wortlaut: "p95 ≤ 33 ms stehend an beiden Geräten", feld: "preis" }],
                umfang: { verlangt: 4, einheit: "Boots je Gerät", wortlaut: "4 Boots je Gerät", feld: "richter" },
            },
            2: { soll: [{ wort: "frame_p95_ms_max", richtung: "≤", wert: 33, wortlaut: "p95 ≤ 33 ms stehend an G2 und G3 in jeder Zelle", feld: "preis" }] },
            3: {
                soll: [
                    { wort: "frame_p95_ms_max", richtung: "≤", wert: 33, wortlaut: "p95 ≤ 33 ms in jeder Bewegungszelle", feld: "preis" },
                    { wort: "frames_ueber_100", richtung: "≤", wert: 0, wortlaut: "0 Frames > 100 ms", feld: "preis" },
                ],
                umfang: { verlangt: 4, einheit: "Sitzungen je Gerät", wortlaut: "4 Sitzungen je Gerät", feld: "richter" },
            },
            4: {
                soll: [
                    { wort: "frame_p95_ms", richtung: "≤", wert: 16.7, wortlaut: "≤ 16,7 ms an G2 + G3", feld: "preis" },
                    { wort: "reichweite_pct", richtung: "≥", wert: 50, wortlaut: "Reichweite ≥ 50 %", feld: "preis" },
                ],
                umfang: { verlangt: 1000, einheit: "Bewohner der Stadt", wortlaut: "Stadt mit 10³ Bewohnern", feld: "umfang" },
            },
            5: {
                soll: [{ wort: "reichweite_pct", richtung: "≥", wert: 85, wortlaut: "≥ 85 % gewichtete Reichweite", feld: "preis" }],
                umfang: { verlangt: 10000, einheit: "Häuser der Stadt", wortlaut: "Stadt 10⁴ Häuser", feld: "umfang" },
            },
            6: {
                soll: [
                    { wort: "frame_p95_ms", richtung: "≤", wert: 16.7, wortlaut: "≤ 16,7 ms an ≥ 90 % Reichweite", feld: "preis" },
                    { wort: "reichweite_pct", richtung: "≥", wert: 90, wortlaut: "≤ 16,7 ms an ≥ 90 % Reichweite", feld: "preis" },
                ],
                umfang: { verlangt: 1e7, einheit: "Bewohner wirkend", wortlaut: "Megastadt 10⁷ wirkend", feld: "umfang" },
            },
            7: {
                soll: [{ wort: "geraete_pct", richtung: "≥", wert: 95, wortlaut: "≤ 16,7 ms an ≥ 95 % der Geräte", feld: "preis" }],
                umfang: { verlangt: 20, einheit: "zufällige (Same, Ort, Epoche) je Klasse", wortlaut: "20 zufällige (Same, Ort, Epoche) je Klasse", feld: "richter" },
            },
        },
        lauf: async function taktLauf(H, P, L) {
            // EINE Zelle: der Ort, die Zelle im Strom, der Loop des Spiels `sek` lang, die Bilder dieser Probe in ihr
            const zelle = async (name, ort, sicht, sek) => {
                await L.ort(ort, sicht);
                await L.zelle(name);
                await L.wb("/lauf", { sek, ein: 1 }, sek + 90);
                await L.zelle(null);
                const b = L.bilder(name);
                return { name, n: b.length, p95: L.p95(b.map((x) => x.dt)), ueber100: b.filter((x) => x.dt > 100).length };
            };
            const schlechteste = (zs) => zs.reduce((a, z) => (z.p95 > a.p95 ? z : a), zs[0]);
            // S1 · Wiese, stehend, Ego — EIN Boot: der Lauf ist eine Sitzung
            await L.je(1, async () => {
                const z = await zelle("k2-takt-s1", "wiese", "ego", 6);
                L.gemessen(1, { frame_p95_ms: z.p95 }, { erzeugt: 1, welt: { bilder: z.n }, taeter: "Wiese Ego stehend p95 " + z.p95 + " ms" });
            });
            // S2 · Wiese + Genesis, Ego + Third, stehend — im Wechsel A B A B (Wiese, Genesis, Wiese, Genesis)
            await L.je(2, async () => {
                const zs = [];
                for (const [ort, sicht] of [["wiese", "ego"], ["genesis", "ego"], ["wiese", "third"], ["genesis", "third"]]) zs.push(await zelle("k2-takt-s2-" + ort + "-" + sicht, ort, sicht, 3));
                const w = schlechteste(zs);
                L.gemessen(2, { frame_p95_ms_max: w.p95 }, { welt: { bilder: Math.min(...zs.map((z) => z.n)) }, taeter: w.name + " p95 " + w.p95 + " ms" });
            });
            // S3 · die Bewegungszellen verlangen 4 Sitzungen je Gerät: der Lauf ist EINE
            await L.je(3, async () => L.umfang(3, 1, "4 Sitzungen je Gerät verlangt, der Lauf der Leiter ist eine Sitzung"));
            // S4–S6 · die Stadt der Sitzung: gezählt in der Welt an ihrer dichtesten Pose (dort fährt auch der Preis, R3)
            const stadt = await L.ort("stadt-voll", "third").then(
                () => L.ev("let bew = 0, sied = 0; for (const S of (r._bewohnerSiedlungen || new Map()).values()) { sied++; bew += S.liste ? S.liste.length : (S.plan && S.plan.slots ? S.plan.slots.length : 0); } return { bew, sied, haeuser: (r.state.architectures || []).length };"),
                (e) => ({ fehler: String((e && e.message) || e).split("\n")[0] })
            );
            L.preisPose("stadt-voll", "third");
            L.zeile("Stadt der Sitzung: " + JSON.stringify(stadt));
            const geraeteKlasse = "die Klasse der Karte dieses Laufs — die Leiter verlangt die Reichweite über die Geräteklassen G0–G6 (Z7 kennt zwei Standardgeräte)";
            await L.je(4, async () => {
                if (stadt.fehler) throw new Error("stadt-voll: " + stadt.fehler);
                if (stadt.bew < 1000) return L.umfang(4, stadt.bew, "die Stadt-Pose trägt " + stadt.bew + " Bewohner in " + stadt.sied + " Siedlungen");
                L.leser(4, "Reichweite: kein Leser der Geräteklassen — " + geraeteKlasse, stadt.bew);
            });
            await L.je(5, async () => {
                if (stadt.fehler) throw new Error("stadt-voll: " + stadt.fehler);
                if (stadt.haeuser < 10000) return L.umfang(5, stadt.haeuser, "die Stadt-Pose trägt " + stadt.haeuser + " Häuser");
                L.leser(5, "Reichweite: kein Leser der Geräteklassen — " + geraeteKlasse, stadt.haeuser);
            });
            await L.je(6, async () => {
                if (stadt.fehler) throw new Error("stadt-voll: " + stadt.fehler);
                L.umfang(6, stadt.bew, "die Welt wirkt mit " + stadt.bew + " Bewohnern, keine Megastadt");
            });
            // S7 · 20 (Same, Ort, Epoche) je Klasse: die Sitzung hält EINE Saat
            await L.je(7, async () => {
                const saat = await L.ev("return r.state.worldMeta && r.state.worldMeta.seed;");
                L.umfang(7, 1, "die Sitzung hält eine Saat (" + saat + ") und eine Epoche — kein Wechsel von Same und Epoche im Lauf");
            });
        },
    })
);

// @@TEILE-ANFANG@@
// ═══════════════════════════════════════ Perspektive physik ═══════════════════════════════════════
{
    // ─────────── same.physik.koerper — Starrkörper ───────────
    // An der Stadt-Pose zählt das Programm zuerst die losen Körper der Welt (`_freiImTakt`, der EINE Löser stamm/koerper-frei.js) und
    // das größte Werk unter dem Gesetz der Statik (`_werkGesetzSetzen`-Wand: keine Natur, kein Studio, keine Foundry) — der Umfang von
    // S2–S7. S1 lässt das Fass des Spiels (Bauplan `fass`, frei) aus 4 m im Löser fallen (`_freiSchritt`, FIXED_DT) und misst Ruhe,
    // Zittern und den Spalt seiner Punkte zum GEZEICHNETEN Boden (`_bodenSichtAt`); S2 fährt den GT des Spiels in die 10 nächsten
    // Körper der Welt, sobald sie da sind (Impuls je Stoß-Schritt, Durchdringen `_freiInnen`, Ruhe).
    LEITERN.push(
        leiter({
            leiter: "same.physik.koerper",
            sek: 60,
            mutiert: true,
            pfad: [
                "scripts/werkbank.cjs",
                "stamm/koerper-frei.js",
                "stamm/siedlung-satz.js",
                "stamm/werkstatt-bauen.js",
                "stamm/kreatur-leben.js",
                "stamm/gelaende-boden.js",
                "stamm/gelaende-kollision.js",
                "stamm/koerper-bewegung.js",
                "stamm/bau-teile.js",
                "stamm/bau-vorlagen.js",
                "stamm/koerper-fahrt.js",
                "stamm/kreatur-verhalten.js",
                "stamm/wasser-hydro.js",
            ],
            welt: [{ wort: "fall_m", ab: 1, was: "Fallhöhe des Körpers in der Welt (m)" }],
            sprossen: {
                1: {
                    soll: [
                        { wort: "ruhe_s", richtung: "≤", wert: 2, wortlaut: "Ruhe ≤ 2 s", feld: "richter" },
                        { wort: "zittern_cm", richtung: "≤", wert: 1, wortlaut: "Zittern ≤ 1 cm", feld: "richter" },
                        { wort: "spalt_cm", richtung: "≤", wert: 5, wortlaut: "Spalt zum Boden im Bild ≤ 5 cm", feld: "richter" },
                    ],
                    umfang: { verlangt: 1, einheit: "Körper", wortlaut: "1 Körper", feld: "umfang" },
                },
                2: {
                    soll: [
                        { wort: "durchdringen", richtung: "≤", wert: 0, wortlaut: "0 Durchdringen im Bild", feld: "richter" },
                        { wort: "dv_abw_pct", richtung: "≤", wert: 10, wortlaut: "Δv ±10 % gegen Impulsbilanz", feld: "richter" },
                        { wort: "ruhe_s", richtung: "≤", wert: 3, wortlaut: "Ruhe ≤ 3 s", feld: "richter" },
                    ],
                    umfang: { verlangt: 10, einheit: "lose Körper der Welt binnen 60 m", wortlaut: "Wagen fährt in 10 Kisten", feld: "richter" },
                    welt: [{ wort: "kontakte", ab: 1, was: "Stoß-Schritte der Hülle des Wagens an Körpern" }],
                },
                3: {
                    soll: [
                        { wort: "truemmer", richtung: "≥", wert: 100, wortlaut: "100 Trümmer im Bild", feld: "richter" },
                        { wort: "lage_cm", richtung: "≤", wert: 1, wortlaut: "jede Lage ±1 cm", feld: "richter" },
                    ],
                    umfang: { verlangt: 100, einheit: "Teile des größten Werks unter dem Gesetz", wortlaut: "10²", feld: "umfang" },
                },
                4: {
                    soll: [
                        { wort: "koerper_fliegen", richtung: "≥", wert: 1000, wortlaut: "1 000 Körper fliegen", feld: "richter" },
                        { wort: "durchdringen", richtung: "≤", wert: 0, wortlaut: "0 Durchdringen im Bild", feld: "richter" },
                    ],
                    umfang: { verlangt: 1000, einheit: "lose Körper der Welt binnen 60 m", wortlaut: "10³", feld: "umfang" },
                },
                5: {
                    soll: [
                        { wort: "kipp_pct", richtung: "≥", wert: 95, wortlaut: "im Bild kippen, ≥ 95 %", feld: "richter" },
                        { wort: "fehl_pct", richtung: "≤", wert: 2, wortlaut: "Fehl-Kipper ≤ 2 %", feld: "richter" },
                    ],
                    umfang: { verlangt: 1e5, einheit: "lose Körper der Welt binnen 60 m", wortlaut: "10⁵", feld: "umfang" },
                },
                6: {
                    soll: [{ wort: "lage_cm", richtung: "≤", wert: 1, wortlaut: "1 000 sichtbare Dinge an der gerechneten Lage ±1 cm", feld: "richter" }],
                    umfang: { verlangt: 1e6, einheit: "lose Körper der geladenen Welt", wortlaut: "10⁶ im Blick", feld: "umfang" },
                },
                7: {
                    soll: [{ wort: "ursache_pct", richtung: "≥", wert: 99, wortlaut: "≥ 99 % der Dinge am Ort oder ihre Bewegung einer benannten Ursache zuordenbar", feld: "richter" }],
                    umfang: { verlangt: 1e12, einheit: "lose Körper der geladenen Welt", wortlaut: "≥ 10¹² (jedes lose Ding eines Planeten)", feld: "umfang" },
                },
            },
            lauf: async function koerperLauf(H, P, L) {
                // der offene Grund d0–d1 m um den Spieler: Gesetz und gezeichneter Boden einig (±10 cm), kein Bau binnen `rand`, kein Wasser
                function offen(r, d0, d1, rand) {
                    const s = r.state, A = AnazhRealm, m = s.playerMesh, fuss = m.position.y - A.PLAYER_FOOT_OFFSET, kand = [];
                    for (let k = 0; k < 48; k++) {
                        const d = d0 + ((d1 - d0) * (k >> 3)) / 5, a = (k * Math.PI) / 4 + (k >> 3) * 0.37;
                        const x = m.position.x + d * Math.sin(a), z = m.position.z + d * Math.cos(a);
                        const g = r._koerperBodenUnter(x, fuss + 1, z), b = r._bodenSichtAt(x, z);
                        if (!Number.isFinite(g) || !Number.isFinite(b) || Math.abs(g - b) > 0.1 || Math.abs(g - fuss) > 2 || r._nassAt(x, z)) continue;
                        kand.length = 0;
                        r._blockerNahe(x, z, rand, -Infinity, kand);
                        if (kand.some((e) => (e.blockerAABBs || []).some((bx) => r._boxAbstand2(bx, x, z) <= rand * rand))) continue;
                        return { x, z, g, a };
                    }
                    return null;
                }
                const ev = (f, a, s) => L.ev("const offen = " + offen + ";\nreturn await (" + f + ")(r, " + JSON.stringify(a === undefined ? null : a) + ");", s || 50);
                // DIE ZAHLEN DER WELT, bevor die Probe etwas setzt: lose Körper (nah und geladen), Werke unter dem Gesetz der Statik
                function zaehlen(r, o) {
                    const s = r.state, bp = s.blueprints || {}, p = s.playerMesh.position;
                    let frei = 0, freiNah = 0, werke = 0, gesetz = 0, maxTeile = 0, maxTyp = null;
                    for (const e of s.architectures || []) {
                        const d = Math.hypot(e.position.x - p.x, e.position.z - p.z);
                        if (e._frei) {
                            frei++;
                            if (d <= o.nah) freiNah++;
                            continue;
                        }
                        const b = bp[e.type];
                        if (!b || !Array.isArray(b.parts) || !b.parts.length || d > o.nah) continue;
                        werke++;
                        if (r._istNatur(e) || r._foundryPresetForEntry(e) || typeof b.studioGestalt === "string" || r._foundryNeedsBookForType(e.type)) continue;
                        gesetz++;
                        if (b.parts.length > maxTeile) [maxTeile, maxTyp] = [b.parts.length, e.type];
                    }
                    return { frei, freiNah, werke, gesetz, maxTeile, maxTyp, saat: s.worldMeta && s.worldMeta.seed };
                }
                // S1 · DAS FASS VOM DACH: 4 m über offenem Grund, der Löser im festen Schritt, bis es 1 s schläft (höchstens 15 s)
                async function fassFall(r) {
                    const s = r.state, A = AnazhRealm, F = A.FREI, dt = A.FIXED_DT;
                    const bp = s.blueprints && s.blueprints.fass;
                    if (!s.playerMesh || typeof r._freiSchritt !== "function" || !(bp && bp.frei === true)) return { fehler: "ohne Spieler, Löser (_freiSchritt) oder freien Bauplan fass" };
                    const ort = offen(r, 3, 8, 2);
                    if (!ort) return { fehler: "kein offener Grund 3–8 m um den Spieler (Bau binnen 2 m, Wasser oder Boden-Karte fern vom Gesetz)" };
                    const vor = r._freiImTakt ? r._freiImTakt.size : 0;
                    const e = r.spawnArchitecture("fass", { x: ort.x, y: ort.g + 4.5, z: ort.z }, { precise: true, silent: true, rotationY: 0.3 });
                    const K = e && e._frei;
                    if (!K) {
                        if (e) r.removeArchitecture(e, { still: true });
                        return { fehler: "das Fass trägt keinen freien Körper (_freiKoerperSetzen)" };
                    }
                    const n = r._freiImTakt.size - vor;
                    const tief = () => {
                        let mn = Infinity, j = 1;
                        for (let i = 1; i < K.pw.length; i += 3) if (K.pw[i] < mn) [mn, j] = [K.pw[i], i];
                        return [mn, K.pw[j - 1], K.pw[j + 1]];
                    };
                    try {
                        r._freiLage(K);
                        const y0 = tief()[0];
                        const bahn = [];
                        let t = 0, tLand = null, tSchlaf = null;
                        for (let i = 0; i < 900; i++) {
                            r._freiSchritt(dt);
                            t += dt;
                            bahn.push([t, K.p[0], K.p[1], K.p[2]]);
                            const [mn, lx, lz] = tief();
                            if (tLand === null && mn - r._koerperBodenUnter(lx, mn + 0.5, lz) <= F.spalt) tLand = t;
                            if (K.schlaf && tSchlaf === null) tSchlaf = t;
                            if (tSchlaf !== null && t - tSchlaf >= 1) break;
                        }
                        // das Zittern: der weiteste Abstand der Mitte von ihrer letzten Lage, ab dem Beginn der Ruhe (sonst die letzte Sekunde)
                        const ende = bahn[bahn.length - 1];
                        const ab = tSchlaf !== null ? tSchlaf - F.ruheS : t - 1;
                        let zit = 0;
                        for (const b of bahn) if (b[0] >= ab) zit = Math.max(zit, Math.hypot(b[1] - ende[1], b[2] - ende[2], b[3] - ende[3]));
                        // der Spalt im Bild: je Punkt der Gestalt sein Abstand zum gezeichneten Boden, der nächste zählt (schwebt + / steckt −)
                        let spalt = Infinity, ohne = 0;
                        for (let i = 0; i < K.pw.length; i += 3) {
                            const b = r._bodenSichtAt(K.pw[i], K.pw[i + 2]);
                            if (!Number.isFinite(b)) {
                                ohne++;
                                continue;
                            }
                            spalt = Math.min(spalt, K.pw[i + 1] - b);
                        }
                        const r3 = (v) => (Number.isFinite(v) ? Math.round(v * 1000) / 1000 : null);
                        return {
                            n,
                            ort: [r3(ort.x), r3(ort.z)],
                            fall_m: r3(y0 - tief()[0]),
                            tLand: r3(tLand),
                            tSchlaf: r3(tSchlaf),
                            ruhe_s: tLand !== null && tSchlaf !== null ? r3(tSchlaf - tLand) : null,
                            zittern_cm: r3(100 * zit),
                            spalt_cm: Number.isFinite(spalt) ? r3(100 * Math.abs(spalt)) : null,
                            spaltRoh_cm: Number.isFinite(spalt) ? r3(100 * spalt) : null,
                            ohneKarte: ohne,
                            masse: r3(K.m),
                            stoff: K.stoff,
                        };
                    } finally {
                        r.removeArchitecture(e, { still: true });
                    }
                }
                // S2 · DER WAGEN IN DIE 10 NÄCHSTEN KÖRPER DER WELT (nur, wenn die Welt sie trägt): der GT rollt mit 20 km/h ohne Gas (`_wagenSchritt`
                // mit Hülle, das EINE Impuls-Gesetz), je Schritt der Impuls der Körper längs der Fahrt vor und nach dem Wagen-Schritt gegen den
                // Impuls, den der Wagen verlor; danach Durchdringen (jeder Punkt in einem anderen Körper > 1 cm) und Ruhe nach dem letzten Stoß
                async function wagenStoss(r, o) {
                    const s = r.state, A = AnazhRealm, dt = A.FIXED_DT, p = s.playerMesh.position;
                    const KS = [...(r._freiImTakt || [])]
                        .map((e) => e._frei)
                        .filter(Boolean)
                        .map((K) => [Math.hypot(K.p[0] - p.x, K.p[2] - p.z), K])
                        .filter((x) => x[0] <= o.nah)
                        .sort((a, b) => a[0] - b[0])
                        .slice(0, o.n)
                        .map((x) => x[1]);
                    if (KS.length < o.n) return { fehler: "nur " + KS.length + " lose Körper binnen " + o.nah + " m" };
                    const G0 = A._fahrSchrittGesetz && A._fahrSchrittGesetz(), vc = G0 && G0.vc;
                    if (!vc || typeof r._wagenSchritt !== "function") return { fehler: "ohne Fahr-Kern oder _wagenSchritt" };
                    if (r._ensureAssetFoundry) r._ensureAssetFoundry();
                    for (let i = 0; i < 200 && !(s.blueprints && s.blueprints.fahrzeug_gt); i++) await new Promise((ok) => setTimeout(ok, 100));
                    if (!(s.blueprints && s.blueprints.fahrzeug_gt)) return { fehler: "der GT ist nicht gebaut (Foundry-Rezept gt binnen 20 s)" };
                    const cx = KS.reduce((q, K) => q + K.p[0], 0) / KS.length, cz = KS.reduce((q, K) => q + K.p[2], 0) / KS.length;
                    const kand = [];
                    let best = null;
                    for (let k = 0; k < 8; k++) {
                        const a = (k * Math.PI) / 4;
                        let hart = 0;
                        for (let t = 4; t <= 14; t += 2) {
                            kand.length = 0;
                            r._blockerNahe(cx - t * Math.sin(a), cz - t * Math.cos(a), 1.5, -Infinity, kand);
                            hart += kand.filter((e) => !e._frei).length;
                        }
                        if (!best || hart < best.hart) best = { a, hart };
                    }
                    const a = best.a, x0 = cx - 14 * Math.sin(a), z0 = cz - 14 * Math.cos(a);
                    const e = r.spawnArchitecture("fahrzeug_gt", { x: x0, y: r.getTerrainHeightAt(x0, z0) + 0.5, z: z0 }, { silent: true, precise: true, rotationY: a - Math.PI / 2 });
                    if (!e) return { fehler: "spawnArchitecture fahrzeug_gt gab nichts" };
                    // die Impulsbilanz ohne Wind am Wagen (wie die Bremsweg-Probe g6): der Wind schöbe die Fahrt zwischen zwei Stößen
                    const wind = Object.prototype.hasOwnProperty.call(r, "_fahrWind") ? r._fahrWind : undefined;
                    r._fahrWind = () => ({ x: 0, z: 0 });
                    try {
                        const G = r._fahrSatz(e, r._vehicleProfile(e));
                        if (!G) return { fehler: "der GT trägt keinen Fahr-Satz (_fahrSatz)" };
                        e._rideYaw = a;
                        const fz = (e._fahr = vc.fahrZustand(x0, z0, a - Math.PI / 2));
                        vc.fahrStand(fz, G, r._fahrBoden(e), 0);
                        fz.vlong = 20 / 3.6;
                        const mW = r._fahrMasse(e, G.m);
                        const [ux, uz] = [Math.sin(a), Math.cos(a)];
                        const impuls = () => KS.reduce((q, K) => q + K.m * (K.v[0] * ux + K.v[2] * uz), 0);
                        let dpW = 0, dpK = 0, kontakte = 0, tLetzt = null, tRuhe = null, t = 0;
                        for (let i = 0; i < 600; i++) {
                            const [q0, v0] = [impuls(), fz.vlong];
                            r._wagenSchritt(e, { throttle: 0, brake: 0, hand: false, steer: 0 }, dt, true, true);
                            const [q1, v1] = [impuls(), fz.vlong];
                            if (Math.abs(q1 - q0) > 1e-9) {
                                kontakte++;
                                dpK += q1 - q0;
                                dpW += mW * (v1 - v0);
                                tLetzt = t;
                            }
                            r._freiSchritt(dt);
                            t += dt;
                            if (tLetzt !== null && t - tLetzt > 0.2 && KS.every((K) => K.schlaf)) {
                                tRuhe = t;
                                break;
                            }
                        }
                        let durch = 0;
                        const aus = {};
                        for (const K of KS) r._freiLage(K);
                        for (const K1 of KS)
                            for (const K2 of KS) {
                                if (K1 === K2) continue;
                                let drin = false;
                                for (let i = 0; i < K1.pw.length && !drin; i += 3) drin = r._freiInnen(K2, K1.pw[i], K1.pw[i + 1], K1.pw[i + 2], 0, aus) && aus.tiefe > 0.01;
                                if (drin) durch++;
                            }
                        return {
                            n: KS.length,
                            kontakte,
                            dv_abw_pct: dpW < 0 ? +((100 * Math.abs(dpK + dpW)) / Math.abs(dpW)).toFixed(2) : null,
                            durchdringen: durch,
                            ruhe_s: tRuhe !== null ? +(tRuhe - tLetzt).toFixed(3) : null,
                            mWagen: +mW.toFixed(1),
                            dpWagen: +dpW.toFixed(2),
                            dpKoerper: +dpK.toFixed(2),
                        };
                    } finally {
                        if (wind === undefined) delete r._fahrWind;
                        else r._fahrWind = wind;
                        r.removeArchitecture(e, { still: true });
                    }
                }
                await L.ort("stadt-voll", "third");
                L.preisPose("stadt-voll", "third");
                const z = await ev(zaehlen, { nah: 60 });
                L.zeile("Körper der Welt an der Stadt-Pose: " + JSON.stringify(z));
                await L.je(1, async () => {
                    const f = await ev(fassFall, null, Math.max(5, L.rest() - 20));
                    L.zeile("Fass aus 4 m: " + JSON.stringify(f));
                    if (f.fehler) throw new Error(f.fehler);
                    L.gemessen(
                        1,
                        { ruhe_s: f.ruhe_s, zittern_cm: f.zittern_cm, spalt_cm: f.spalt_cm },
                        { erzeugt: f.n, welt: { fall_m: f.fall_m }, taeter: "Fass (" + f.stoff + ", " + f.masse + " kg) bei " + f.ort.join("/") + ": Aufprall " + f.tLand + " s, Schlaf " + f.tSchlaf + " s, Spalt zum gezeichneten Boden " + f.spaltRoh_cm + " cm" }
                    );
                });
                await L.je(2, async () => {
                    const U = P.sprossen[2].umfang.verlangt;
                    if (z.freiNah < U)
                        return L.umfang(2, z.freiNah, "die Welt trägt " + z.freiNah + " lose Körper binnen 60 m der Stadt-Pose (" + z.frei + " in der geladenen Welt) — die Dinge der Stadt sind keine Körper des Lösers");
                    const w = await ev(wagenStoss, { n: U, nah: 60 }, Math.max(5, L.rest() - 8));
                    L.zeile("Wagen in " + U + " Körper: " + JSON.stringify(w));
                    if (w.fehler) throw new Error(w.fehler);
                    L.gemessen(2, { durchdringen: w.durchdringen, dv_abw_pct: w.dv_abw_pct, ruhe_s: w.ruhe_s }, { erzeugt: w.n, welt: { kontakte: w.kontakte }, taeter: "GT " + w.mWagen + " kg: Δp Wagen " + w.dpWagen + ", Δp Körper " + w.dpKoerper + " kg·m/s" });
                });
                await L.je(3, async () => {
                    const U = P.sprossen[3].umfang.verlangt;
                    if (z.maxTeile < U)
                        return L.umfang(3, z.maxTeile, "das größte Werk unter dem Gesetz der Statik binnen 60 m trägt " + z.maxTeile + " Teile (" + (z.maxTyp || "keines") + "; " + z.gesetz + " von " + z.werke + " Werken unter dem Gesetz) — sein Einsturz gäbe höchstens so viele Trümmer");
                    L.leser(3, "die Lage der Trümmer nach Reload: die Sitzung lädt ohne Welt-Neustart keinen Stand, kein Leser vergleicht den gespeicherten Stand eines Trümmers (`drehung`, `ruht` des Eintrags, stamm/siedlung-satz.js:1442) mit seiner Lage", z.maxTeile);
                });
                await L.je(4, async () => {
                    if (z.freiNah < P.sprossen[4].umfang.verlangt) return L.umfang(4, z.freiNah, "die Gasse der Stadt-Pose trägt " + z.freiNah + " lose Körper binnen 60 m");
                    L.leser(4, "Explosion: kein Gesetz der Druckwelle — das Wort steht nur als Klemme des Gedränges (stamm/kreatur-verhalten.js:525)", z.freiNah);
                });
                await L.je(5, async () => {
                    if (z.freiNah < P.sprossen[5].umfang.verlangt) return L.umfang(5, z.freiNah, "das Viertel der Stadt-Pose trägt " + z.freiNah + " lose Körper binnen 60 m");
                    L.leser(5, "Böe am Körper: der Löser liest kein Wind-Feld, kein Kipp-Moment aus Wind (stamm/koerper-frei.js:421 `_freiSchritt`)", z.freiNah);
                });
                await L.je(6, async () => {
                    if (z.frei < P.sprossen[6].umfang.verlangt) return L.umfang(6, z.frei, "die geladene Welt trägt " + z.frei + " lose Körper");
                    L.leser(6, "Beben: kein Gesetz bewegt den Grund unter den Körpern (stamm/koerper-frei.js:294 `_freiGrund` liest den Grund als ruhende Ebene)", z.frei);
                });
                await L.je(7, async () => L.umfang(7, z.frei, "die geladene Welt trägt " + z.frei + " lose Körper (Saat " + z.saat + ", eine Sitzung, keine Jahrhunderte)"));
            },
        })
    );

    // ─────────── same.physik.tragen — Statik und Bruch ───────────
    // S1: eine Holzsäule realer Schlankheit (0,1 × 3 × 0,1 m, λ 30) unter einer Steinplatte wachsender Dicke — die Schwelle, an der das
    // Urteil des Gesetzes (`_failsUnderLoad`, das `_werkGesetzSetzen` je Werk liest) knickt, gegen Euler π²EI/L² mit E der Zeile und mit
    // E/2 (die Zeile auf der Instanz gespiegelt, danach zurück); je Schwelle zwei Werke in der Welt gesetzt (knickt darüber, steht
    // darunter). S2 nimmt dem größten Werk unter dem Gesetz einen zufälligen Pfosten (sobald die Welt eines mit ≈ 10 Gliedern trägt).
    LEITERN.push(
        leiter({
            leiter: "same.physik.tragen",
            sek: 60,
            mutiert: true,
            pfad: [
                "scripts/werkbank.cjs",
                "stamm/bau-buch.js",
                "stamm/bau-teile.js",
                "stamm/werkstatt-vorschau.js",
                "stamm/siedlung-satz.js",
                "stamm/werkstatt-bauen.js",
                "stamm/koerper-frei.js",
                "stamm/kreatur-leben.js",
                "stamm/gelaende-boden.js",
                "stamm/gelaende-kollision.js",
                "stamm/koerper-bewegung.js",
                "stamm/wasser-hydro.js",
                "schmiede-core.js",
            ],
            welt: [{ wort: "teile_welt", ab: 1, was: "Teile des Werks in der Welt (Rest und Trümmer)" }],
            sprossen: {
                1: {
                    soll: [
                        { wort: "abw_pct", richtung: "≤", wert: 20, wortlaut: "Versagens-Last gegen Euler ±20 %", feld: "richter" },
                        { wort: "abw_halbe_pct", richtung: "≤", wert: 20, wortlaut: "Versagens-Last gegen Euler ±20 %", feld: "richter" },
                    ],
                    umfang: { verlangt: 1, einheit: "Glied", wortlaut: "1 Glied", feld: "umfang" },
                    welt: [
                        { wort: "knick", ab: 2, was: "Säulen der Welt, die über der Schwelle knickten (E und E/2)" },
                        { wort: "steht", ab: 2, was: "Säulen der Welt, die unter der Schwelle standen (E und E/2)" },
                    ],
                },
                2: {
                    soll: [
                        { wort: "treffer_pct", richtung: "≥", wert: 100, wortlaut: "gefallene Teile = Teile ohne Lastpfad (100 %)", feld: "richter" },
                        { wort: "liegen_min", richtung: "≥", wert: 10, wortlaut: "Trümmer liegen 10 min", feld: "richter" },
                    ],
                    umfang: { verlangt: 10, einheit: "Glieder eines Werks unter dem Gesetz", wortlaut: "ein Werk (≈ 10 Glieder)", feld: "umfang" },
                },
                3: {
                    soll: [{ wort: "biege_abw_pct", richtung: "≤", wert: 20, wortlaut: "Durchbiegung ±20 % gegen Balkenformel", feld: "richter" }],
                    umfang: { verlangt: 1000, einheit: "m³ des größten Werks unter dem Gesetz", wortlaut: "ein Haus (10³ m³)", feld: "umfang" },
                },
                4: {
                    soll: [
                        { wort: "stehen_pct", richtung: "≥", wert: 100, wortlaut: "100 % stehen unter Eigenlast", feld: "richter" },
                        { wort: "fallen_halbe_pct", richtung: "≥", wert: 10, wortlaut: "mit E/2 in der Zeile fallen ≥ 10 %", feld: "richter" },
                    ],
                    umfang: { verlangt: 1000, einheit: "Saaten", wortlaut: "N = 1 000 Saaten", feld: "richter" },
                },
                5: {
                    soll: [
                        { wort: "periode_abw_pct", richtung: "≤", wert: 25, wortlaut: "T ≈ H/46 s ±25 %", feld: "richter" },
                        { wort: "kollaps_abw_pct", richtung: "≤", wert: 30, wortlaut: "Kollaps-Zeit gegen reale Einstürze ±30 %", feld: "richter" },
                    ],
                    umfang: { verlangt: 1e5, einheit: "m³ des größten Werks unter dem Gesetz", wortlaut: "ein Hochhaus (10⁵–10⁶ m³, 300 m)", feld: "umfang" },
                },
                6: {
                    soll: [{ wort: "ems_pct", richtung: "≥", wert: 70, wortlaut: "±1 Grad bei ≥ 70 %", feld: "richter" }],
                    umfang: { verlangt: 1e7, einheit: "m³ der Werke unter dem Gesetz", wortlaut: "Stadtteil bis Megastadt (10⁷–10⁹ m³)", feld: "umfang" },
                },
                7: {
                    soll: [
                        { wort: "hoehe_abw_pct", richtung: "≤", wert: 30, wortlaut: "∝ σ/(ρ·g) ±30 %", feld: "richter" },
                        { wort: "jury_pct", richtung: "≥", wert: 80, wortlaut: "Silhouetten der richtigen Schwere zu ≥ 80 %", feld: "richter" },
                    ],
                    umfang: { verlangt: 100, einheit: "Planeten-Saaten", wortlaut: "N = 100 Planeten-Saaten", feld: "richter" },
                },
            },
            lauf: async function tragenLauf(H, P, L) {
                function offen(r, d0, d1, rand) {
                    const s = r.state, A = AnazhRealm, m = s.playerMesh, fuss = m.position.y - A.PLAYER_FOOT_OFFSET, kand = [];
                    for (let k = 0; k < 48; k++) {
                        const d = d0 + ((d1 - d0) * (k >> 3)) / 5, a = (k * Math.PI) / 4 + (k >> 3) * 0.37;
                        const x = m.position.x + d * Math.sin(a), z = m.position.z + d * Math.cos(a);
                        const g = r._koerperBodenUnter(x, fuss + 1, z), b = r._bodenSichtAt(x, z);
                        if (!Number.isFinite(g) || !Number.isFinite(b) || Math.abs(g - b) > 0.1 || Math.abs(g - fuss) > 2 || r._nassAt(x, z)) continue;
                        kand.length = 0;
                        r._blockerNahe(x, z, rand, -Infinity, kand);
                        if (kand.some((e) => (e.blockerAABBs || []).some((bx) => r._boxAbstand2(bx, x, z) <= rand * rand))) continue;
                        return { x, z, g, a };
                    }
                    return null;
                }
                const ev = (f, a, s) => L.ev("const offen = " + offen + ";\nreturn await (" + f + ")(r, " + JSON.stringify(a === undefined ? null : a) + ");", s || 50);
                // die Werke unter dem Gesetz der Statik binnen `nah` (die Wand von `_werkGesetzSetzen`): Zahl, größte Teile-Zahl, Raum (Hülle der Teile × Skala³)
                function zaehlen(r, o) {
                    const s = r.state, bp = s.blueprints || {}, p = s.playerMesh.position;
                    let werke = 0, gesetz = 0, maxTeile = 0, maxTyp = null, maxVol = 0, sumVol = 0, haeuser = 0;
                    for (const e of s.architectures || []) {
                        if (e._frei) continue;
                        const b = bp[e.type];
                        if (!b || !Array.isArray(b.parts) || !b.parts.length || Math.hypot(e.position.x - p.x, e.position.z - p.z) > o.nah) continue;
                        werke++;
                        if (/^haus_/.test(e.type)) haeuser++;
                        if (r._istNatur(e) || r._foundryPresetForEntry(e) || typeof b.studioGestalt === "string" || r._foundryNeedsBookForType(e.type)) continue;
                        gesetz++;
                        let [x0, y0, z0, x1, y1, z1] = [Infinity, Infinity, Infinity, -Infinity, -Infinity, -Infinity];
                        for (const t of b.parts) {
                            const a = r._partWorldAABB(t);
                            if (!a) continue;
                            [x0, y0, z0] = [Math.min(x0, a.min.x), Math.min(y0, a.min.y), Math.min(z0, a.min.z)];
                            [x1, y1, z1] = [Math.max(x1, a.max.x), Math.max(y1, a.max.y), Math.max(z1, a.max.z)];
                        }
                        const sc = Number.isFinite(e.scale) && e.scale > 0 ? e.scale : 1;
                        const v = x1 > x0 && y1 > y0 && z1 > z0 ? (x1 - x0) * (y1 - y0) * (z1 - z0) * sc * sc * sc : 0;
                        sumVol += v;
                        maxVol = Math.max(maxVol, v);
                        if (b.parts.length > maxTeile) [maxTeile, maxTyp] = [b.parts.length, e.type];
                    }
                    return { werke, gesetz, maxTeile, maxTyp, maxVol: Math.round(maxVol * 10) / 10, sumVol: Math.round(sumVol * 10) / 10, haeuser, saat: s.worldMeta && s.worldMeta.seed };
                }
                // S1 · DIE SÄULE: die Schwelle des Gesetzes über die Dicke der Platte (Bisektion, log), je E und E/2, je zwei Werke in der Welt
                async function saeule(r) {
                    const s = r.state, g = Number.isFinite(s.gravity) ? Math.max(0, -s.gravity) : 9.81;
                    const b = 0.1, Lh = 3;
                    const plan = (d) => ({
                        name: "k2_saeule",
                        label: "k2_saeule",
                        builtIn: false,
                        role: "architecture",
                        roleManual: true,
                        connections: [],
                        parts: [
                            { shape: "box", material: "holz", size: { x: b, y: Lh, z: b }, position: { x: 0, y: Lh / 2, z: 0 } },
                            { shape: "box", material: "stein", size: { x: 2, y: d, z: 2 }, position: { x: 0, y: Lh + d / 2, z: 0 } },
                        ],
                    });
                    const last = (bp) => (r._teilMasse(bp.parts[1]) + r._teilMasse(bp.parts[0]) / 2) * g;
                    const ort = offen(r, 4, 10, 3);
                    if (!ort) return { fehler: "kein offener Grund 4–10 m um den Spieler" };
                    const setze = (d) => {
                        s.blueprints.k2_saeule = plan(d);
                        const e = r.spawnArchitecture("k2_saeule", { x: ort.x, y: ort.g, z: ort.z }, { precise: true, silent: true });
                        const knickt = !!(e && e._gesetz && e._gesetz.sturz && e._gesetz.sturz.grund === "knickt");
                        const steht = !!(e && !e._gesetz);
                        if (e) r.removeArchitecture(e, { still: true });
                        return { knickt, steht };
                    };
                    const schwelle = () => {
                        let [lo, hi] = [1e-4, 2.3];
                        if (!r._failsUnderLoad(plan(hi)).buckles) return { F: null, grund: "knickt nicht unter " + Math.round(last(plan(hi))) + " N" };
                        if (r._failsUnderLoad(plan(lo)).buckles) return { F: last(plan(lo)), grund: "knickt schon unter der dünnsten Platte" };
                        for (let i = 0; i < 48; i++) {
                            const mid = Math.sqrt(lo * hi);
                            if (r._failsUnderLoad(plan(mid)).buckles) hi = mid;
                            else lo = mid;
                        }
                        const ueber = setze(hi * 1.02), unter = setze(lo / 1.02);
                        return { F: last(plan(hi)), d: hi, knick: +ueber.knickt, steht: +unter.steht };
                    };
                    const holz = r._stoff("holz");
                    if (!holz || !(holz.E > 0)) return { fehler: "die Zeile holz trägt kein E" };
                    // EULER MIT DER LAGERUNG DER SÄULE (pm-front-f1; GTX 31ea3847 rechnete die Knicklänge = L, β = 1): die Säule steht
                    // eingespannt im Grund, ihr Kopf trägt die Platte, die keinen zweiten Kopf deckt — eingespannt-frei, Knicklänge
                    // β·L mit β = 2 (Euler-Fall 1; dieselbe Lagerung, die das Spiel ihr gibt: `_failsUnderLoad`, stamm/bau-buch.js
                    // „ein Glied ohne Halt oben ist eingespannt-frei (β = 2)“). F_cr = π²·E·I / (β·L)²
                    const BETA = 2;
                    const euler = (E) => (Math.PI * Math.PI * E * (b ** 4 / 12)) / ((BETA * Lh) * (BETA * Lh));
                    const eigen = Object.prototype.hasOwnProperty.call(r, "_stoff") ? r._stoff : null;
                    const basis = r._stoff;
                    let voll, halb;
                    try {
                        voll = schwelle();
                        r._stoff = function (n, f) {
                            const zl = basis.call(this, n, f);
                            return n === "holz" && zl ? Object.assign({}, zl, { E: zl.E / 2 }) : zl;
                        };
                        halb = schwelle();
                    } finally {
                        if (eigen) r._stoff = eigen;
                        else delete r._stoff;
                        delete s.blueprints.k2_saeule;
                    }
                    const abw = (F, Fe) => (Number.isFinite(F) && Fe > 0 ? Math.round((10000 * Math.abs(F - Fe)) / Fe) / 100 : null);
                    return {
                        E: holz.E,
                        lambda: Lh / b,
                        beta: BETA,
                        F_euler: Math.round(euler(holz.E)),
                        F_voll: voll.F && Math.round(voll.F * 10) / 10,
                        F_halb: halb.F && Math.round(halb.F * 10) / 10,
                        abw_pct: abw(voll.F, euler(holz.E)),
                        abw_halbe_pct: abw(halb.F, euler(holz.E / 2)),
                        knick: (voll.knick || 0) + (halb.knick || 0),
                        steht: (voll.steht || 0) + (halb.steht || 0),
                        frueher: voll.F && halb.F ? halb.F < voll.F : null,
                        grund: [voll.grund, halb.grund].filter(Boolean).join(" · ") || null,
                        knickSicherheit: AnazhRealm.PHYSIS && AnazhRealm.PHYSIS.knickSicherheit,
                    };
                }
                // S2 · DER PFOSTEN: ein zufälliger Pfosten des größten Werks unter dem Gesetz fehlt (der Plan ohne ihn, neben dem Spieler gesetzt);
                // die Erwartung aus dem Bau (Berührung der Hüllen ±2 cm bis zum Grund), nie aus dem Lastpfad des Spiels; dann 10 min Löser
                async function pfosten(r, o) {
                    const s = r.state, A = AnazhRealm, dt = A.FIXED_DT, p = s.playerMesh.position;
                    const e0 = (s.architectures || [])
                        .filter((e) => e.type === o.typ && !e._frei)
                        .sort((a, b) => Math.hypot(a.position.x - p.x, a.position.z - p.z) - Math.hypot(b.position.x - p.x, b.position.z - p.z))[0];
                    const bp = e0 && s.blueprints[o.typ];
                    if (!bp) return { fehler: "das Werk " + o.typ + " steht nicht mehr" };
                    const box = bp.parts.map((t) => r._partWorldAABB(t));
                    const pf = box
                        .map((a, i) => [a, i])
                        .filter(([a]) => a && a.min.y <= 0.05 && a.max.y - a.min.y >= 1.2 * Math.min(a.max.x - a.min.x, a.max.z - a.min.z))
                        .map((x) => x[1]);
                    if (!pf.length) return { fehler: "das Werk " + o.typ + " trägt keinen Pfosten auf dem Grund" };
                    const weg = pf[Math.floor(((Date.now() % 9973) / 9973) * pf.length)];
                    const rest = bp.parts.filter((_, i) => i !== weg).map((t) => JSON.parse(JSON.stringify(t)));
                    const rb = rest.map((t) => r._partWorldAABB(t));
                    const nah = (a, b) => a.min.x <= b.max.x + 0.02 && b.min.x <= a.max.x + 0.02 && a.min.y <= b.max.y + 0.02 && b.min.y <= a.max.y + 0.02 && a.min.z <= b.max.z + 0.02 && b.min.z <= a.max.z + 0.02;
                    const getragen = new Set(rb.map((a, i) => (a && a.min.y <= 0.02 ? i : -1)).filter((i) => i >= 0));
                    for (let wuchs = true; wuchs; ) {
                        wuchs = false;
                        for (let i = 0; i < rb.length; i++)
                            if (rb[i] && !getragen.has(i))
                                for (const j of getragen)
                                    if (nah(rb[i], rb[j])) {
                                        getragen.add(i);
                                        wuchs = true;
                                        break;
                                    }
                    }
                    const maß = (t) => [t.size.x, t.size.y, t.size.z].map((v) => Math.round((v || 0) * 100)).sort((a, b) => a - b).join("x") + ":" + t.material;
                    const erwartet = rest.filter((_, i) => !getragen.has(i)).map(maß).sort();
                    const R = Math.max(1, ...box.filter(Boolean).map((a) => Math.max(Math.abs(a.min.x), Math.abs(a.max.x), Math.abs(a.min.z), Math.abs(a.max.z))));
                    const ort = offen(r, R + 4, R + 20, R + 1);
                    if (!ort) return { fehler: "kein offener Grund für ein Werk mit Radius " + R.toFixed(1) + " m" };
                    const plaene = new Set(Object.keys(s.blueprints));
                    const typ = "k2_ohne_pfosten";
                    s.blueprints[typ] = { name: typ, label: typ, builtIn: false, connections: [], role: r._displayRole(bp), roleManual: true, parts: rest };
                    const vor = new Set(s.architectures);
                    try {
                        r.spawnArchitecture(typ, { x: ort.x, y: ort.g, z: ort.z }, { precise: true, silent: true, seed: 11, rotationY: e0.rotationY || 0 });
                        let t = 0, ruhe = null;
                        for (let i = 0; i < 1200 && ruhe === null; i++) {
                            r._tickWerkGesetz(dt);
                            r._freiSchritt(dt);
                            t += dt;
                            if (i >= 2 && s.architectures.filter((a) => !vor.has(a) && a._frei).every((a) => a._frei.schlaf)) ruhe = t;
                        }
                        const neu = s.architectures.filter((a) => !vor.has(a));
                        const tr = neu.filter((a) => a._frei);
                        const gefallen = tr.map((a) => maß(s.blueprints[a.type].parts[0])).sort();
                        const rw = neu.filter((a) => !a._frei);
                        const restTeile = rw.reduce((q, a) => q + ((s.blueprints[a.type] && s.blueprints[a.type].parts.length) || 0), 0);
                        const rest2 = erwartet.slice();
                        let treffer = 0;
                        for (const g of gefallen) {
                            const i = rest2.indexOf(g);
                            if (i >= 0) {
                                treffer++;
                                rest2.splice(i, 1);
                            }
                        }
                        const nenner = Math.max(erwartet.length, gefallen.length);
                        // ZEHN MINUTEN (36 000 Schritte): je 10 s der weiteste Weg eines Trümmers von seiner Ruhe-Lage; die Wanduhr der Probe
                        // deckelt (`o.budgetMs`) — was sie nicht rechnete, zählt nicht als gelegen
                        const lage0 = tr.map((a) => Array.from(a._frei.p));
                        const t0 = performance.now();
                        let liegen = null;
                        for (let i = 1; i <= 36000 && liegen === null; i++) {
                            r._tickWerkGesetz(dt);
                            r._freiSchritt(dt);
                            if (i % 600 !== 0) continue;
                            if (tr.some((a, k) => !a._frei || Math.hypot(a._frei.p[0] - lage0[k][0], a._frei.p[1] - lage0[k][1], a._frei.p[2] - lage0[k][2]) > 0.01)) liegen = (i - 600) / 3600;
                            else if (i === 36000) liegen = 10;
                            else if (performance.now() - t0 > o.budgetMs) liegen = i / 3600;
                        }
                        return {
                            weg,
                            pfosten: pf.length,
                            erwartet: erwartet.length,
                            gefallen: gefallen.length,
                            treffer_pct: nenner ? Math.round((10000 * treffer) / nenner) / 100 : 100,
                            liegen_min: Math.round(liegen * 100) / 100,
                            ruhe_s: ruhe && Math.round(ruhe * 1000) / 1000,
                            teile_welt: restTeile + tr.length,
                            glieder: bp.parts.length,
                        };
                    } finally {
                        for (const a of s.architectures.filter((x) => !vor.has(x))) r.removeArchitecture(a, { still: true });
                        for (const k of Object.keys(s.blueprints)) if (!plaene.has(k)) delete s.blueprints[k];
                    }
                }
                // S1 VOR DER STADT (pm-front-f1, Radeon c445936d: die Probe schwieg 60 s am Umstellen auf stadt-voll und starb ohne Wert
                // der Säule; GTX f68dbf09 riss dort die Frist 87 s): die Säule braucht offenen Grund 4–10 m um den Spieler, keine Stadt —
                // sie misst an der Wiese, ehe der Ort wechselt; S2–S7 zählen die Werke der Stadt
                await L.ort("wiese", "ego");
                await L.je(1, async () => {
                    const f = await ev(saeule, null, Math.max(5, L.rest() - 25));
                    L.zeile("Säule λ 30 gegen Euler (β 2): " + JSON.stringify(f));
                    if (f.fehler) throw new Error(f.fehler);
                    L.gemessen(
                        1,
                        { abw_pct: f.abw_pct, abw_halbe_pct: f.abw_halbe_pct },
                        { erzeugt: 1, welt: { knick: f.knick, steht: f.steht }, taeter: "Holzsäule 0,1 × 3 m: versagt bei " + f.F_voll + " N (E/2: " + f.F_halb + " N), Euler " + f.F_euler + " N (β " + f.beta + ", eingespannt-frei) — stamm/bau-buch.js _failsUnderLoad · schmiede-core.js tragSpannung" + (f.grund ? " · " + f.grund : "") }
                    );
                });
                await L.ort("stadt-voll", "third");
                L.preisPose("stadt-voll", "third");
                const z = await ev(zaehlen, { nah: 120 });
                L.zeile("Werke unter dem Gesetz an der Stadt-Pose (120 m): " + JSON.stringify(z));
                const ohneStatik = z.haeuser + " Häuser binnen 120 m sind Studio-Gestalten ohne Statik (stamm/bau-teile.js:2493)";
                await L.je(2, async () => {
                    if (z.maxTeile < P.sprossen[2].umfang.verlangt)
                        return L.umfang(2, z.maxTeile, "das größte Werk unter dem Gesetz binnen 120 m trägt " + z.maxTeile + " Glieder (" + (z.maxTyp || "keines") + ") — " + ohneStatik);
                    const w = await ev(pfosten, { typ: z.maxTyp, budgetMs: Math.max(1000, (L.rest() - 12) * 1000) }, Math.max(5, L.rest() - 5));
                    L.zeile("Pfosten entfernt: " + JSON.stringify(w));
                    if (w.fehler) throw new Error(w.fehler);
                    L.gemessen(2, { treffer_pct: w.treffer_pct, liegen_min: w.liegen_min }, { erzeugt: w.glieder, welt: { teile_welt: w.teile_welt }, taeter: z.maxTyp + " ohne Pfosten " + w.weg + ": erwartet " + w.erwartet + " fallende Teile, gefallen " + w.gefallen });
                });
                await L.je(3, async () => {
                    if (z.maxVol < P.sprossen[3].umfang.verlangt) return L.umfang(3, z.maxVol, "das größte Werk unter dem Gesetz binnen 120 m misst " + z.maxVol + " m³ — " + ohneStatik);
                    L.leser(3, "Durchbiegung: das Gesetz urteilt nur steht · kippt · knickt · schwebt, kein Leser nennt die Biegelinie eines Balkens unter Last (stamm/bau-teile.js:2488 `_werkGesetzSetzen`)", z.maxVol);
                });
                await L.je(4, async () => L.umfang(4, 1, "die Sitzung hält eine Saat (" + z.saat + "); " + z.gesetz + " von " + z.werke + " Werken binnen 120 m stehen unter dem Gesetz — " + ohneStatik));
                await L.je(5, async () => {
                    if (z.maxVol < P.sprossen[5].umfang.verlangt) return L.umfang(5, z.maxVol, "das größte Werk unter dem Gesetz binnen 120 m misst " + z.maxVol + " m³");
                    L.leser(5, "Schwingung der Turmspitze: kein Gesetz schwingt ein Werk im Wind (stamm/bau-teile.js:2563 `_tickWerkGesetz`)", z.maxVol);
                });
                await L.je(6, async () => {
                    if (z.sumVol < P.sprossen[6].umfang.verlangt) return L.umfang(6, z.sumVol, "die Werke unter dem Gesetz binnen 120 m messen zusammen " + z.sumVol + " m³");
                    L.leser(6, "Beben: kein Gesetz bewegt den Grund unter den Werken (stamm/bau-teile.js:2563 `_tickWerkGesetz`)", z.sumVol);
                });
                await L.je(7, async () => L.umfang(7, 1, "die Sitzung hält eine Planeten-Saat (" + z.saat + ")"));
            },
        })
    );

    // ─────────── same.physik.fluid — Wasser und Gas ───────────
    // S1: an der Mess-Wiese das nächste gezeichnete Wasser (`_wasserBildAt`), 5 m landeinwärts vom Ufer eine Grube mit dem Spaten des Spiels
    // (DSL `voxel_carve` r 3,5, source human — derselbe Op wie der Grabe-Hieb, stamm/kampf.js:2403) bis 1,5 m unter den Pegel, der Loop
    // läuft 6 s (das Zellen-Wasser, `_tickWaterCA`), das Bild der Grube liegt ab (Auge: der Richter nennt keine Zahl). S2–S8: das gezeichnete
    // Wasser binnen 128 m in m³ — der Umfang; wo er steht, fehlt der Leser des Impulses, des Gases, des Orbits.
    // S1 trägt bestehend gelaende.K2#1 (Tafel „gleich“; Richter-Falte 19.11.: eine Zeile, die GRÜN buchen kann, weicht nie einem Auge —
    // die Deklaration des Auges fiel aus `sprossen`). Der Block `L.je(1, …)` im Lauf steht noch, wie die Fabrik ihn lieferte: sein
    // `L.auge(1, …)` wirft „S1 ist keine Sprosse dieser Station“ und steht als j.fehler[1]; die Fabrik nimmt ihn mit Gerät heraus.
    LEITERN.push(
        leiter({
            leiter: "same.physik.fluid",
            sek: 60,
            mutiert: true,
            pfad: ["scripts/werkbank.cjs", "stamm/wasser-zellen.js", "stamm/wasser-hydro.js", "stamm/gelaende-chunks.js", "stamm/feld-dsl.js", "stamm/kampf.js", "stamm/feld-brand.js", "foundry-core.js"],
            welt: [{ wort: "fluid_m3", ab: 1, was: "Fluid der Welt, das die Messung bewegt (m³)" }],
            bestehend: [1],
            sprossen: {
                2: {
                    soll: [{ wort: "front_abw_pct", richtung: "≤", wert: 15, wortlaut: "Front gegen Ritter 2·√(g·h) ±15 %", feld: "richter" }],
                    umfang: { verlangt: 1, einheit: "m³ gezeichnetes Wasser binnen 128 m", wortlaut: "1 m³ (Eimer, Brunnen)", feld: "umfang" },
                },
                3: {
                    soll: [{ wort: "front_abw_pct", richtung: "≤", wert: 15, wortlaut: "Front ±15 %", feld: "richter" }],
                    umfang: { verlangt: 1000, einheit: "m³ gezeichnetes Wasser binnen 128 m", wortlaut: "10³ m³ (Becken, Bach-Stau)", feld: "umfang" },
                },
                4: { soll: [{ wort: "steig_abw_pct", richtung: "≤", wert: 30, wortlaut: "Steighöhe der Fahne gegen Briggs ±30 %", feld: "richter" }] },
                5: {
                    soll: [{ wort: "ankunft_abw_pct", richtung: "≤", wert: 20, wortlaut: "Ankunftszeit in 1 km ±20 % gegen Flachwasser-Rechnung", feld: "richter" }],
                    umfang: { verlangt: 1e6, einheit: "m³ gezeichnetes Wasser binnen 128 m", wortlaut: "10⁶ m³ (Stausee)", feld: "umfang" },
                },
                6: {
                    soll: [
                        { wort: "lava_ms_min", richtung: "≥", wert: 0.1, wortlaut: "im gemessenen Band 0,1–10 m/s", feld: "richter" },
                        { wort: "lava_ms_max", richtung: "≤", wert: 10, wortlaut: "im gemessenen Band 0,1–10 m/s", feld: "richter" },
                    ],
                    umfang: { verlangt: 1e9, einheit: "m³ gezeichnetes Fluid binnen 128 m", wortlaut: "10⁹ m³ (Lavastrom, Tsunami, km)", feld: "umfang" },
                },
                7: { soll: [{ wort: "frame_p95_ms", richtung: "≤", wert: 33, wortlaut: "p95 ≤ 33 ms über den ganzen Flug", feld: "richter" }] },
                8: {
                    soll: [{ wort: "dispersion_abw_pct", richtung: "≤", wert: 15, wortlaut: "Dispersion ω² = g·k im Bild ±15 %", feld: "richter" }],
                    umfang: { verlangt: 100, einheit: "Planeten", wortlaut: "N = 100 Planeten", feld: "richter" },
                },
            },
            lauf: async function fluidLauf(H, P, L) {
                const ev = (f, a, s) => L.ev("return await (" + f + ")(r, " + JSON.stringify(a === undefined ? null : a) + ");", s || 50);
                // das gezeichnete Wasser binnen R (Raster d): Σ (Spiegel − Grund) · d²
                function wasser(r, o) {
                    const p = r.state.playerMesh.position;
                    let vol = 0, punkte = 0, tief = 0;
                    for (let x = -o.R; x <= o.R; x += o.d)
                        for (let z = -o.R; z <= o.R; z += o.d) {
                            const w = r._wasserBildAt(p.x + x, p.z + z);
                            if (!Number.isFinite(w)) continue;
                            const g = r._voxelSurfaceY(p.x + x, p.z + z);
                            if (!Number.isFinite(g) || !(w > g)) continue;
                            vol += (w - g) * o.d * o.d;
                            punkte++;
                            tief = Math.max(tief, w - g);
                        }
                    return { vol: Math.round(vol), punkte, tief: Math.round(tief * 100) / 100, saat: r.state.worldMeta && r.state.worldMeta.seed };
                }
                async function grube(r) {
                    const p = r.state.playerMesh.position;
                    let W = null;
                    for (let d = 4; d <= 120 && !W; d += 4)
                        for (let k = 0; k < 16 && !W; k++) {
                            const a = (k * Math.PI) / 8, x = p.x + d * Math.sin(a), z = p.z + d * Math.cos(a);
                            const w = r._wasserBildAt(x, z), g = r._voxelSurfaceY(x, z);
                            if (Number.isFinite(w) && Number.isFinite(g) && w > g + 0.3) W = { x, z, w, a, d };
                        }
                    if (!W) return { fehler: "kein gezeichnetes Wasser binnen 120 m um den Spieler" };
                    let U = null;
                    for (let t = 0; t <= W.d && !U; t += 0.5) {
                        const x = W.x - t * Math.sin(W.a), z = W.z - t * Math.cos(W.a);
                        const w = r._wasserBildAt(x, z), g = r._voxelSurfaceY(x, z);
                        if (!(Number.isFinite(w) && w > g)) U = { x, z, g };
                    }
                    if (!U) return { fehler: "kein Ufer zwischen Spieler und Wasser" };
                    const G = { x: U.x - 5 * Math.sin(W.a), z: U.z - 5 * Math.cos(W.a) };
                    const g0 = r._voxelSurfaceY(G.x, G.z);
                    if (!(g0 > W.w)) return { fehler: "der Grund am Ort der Grube (" + g0 + ") liegt nicht über dem Pegel (" + W.w + ")" };
                    r.dslRun(["voxel_carve", G.x, Math.min(g0, W.w + 2), G.z, 3.5], { source: "human" });
                    const boden = r._voxelSurfaceY(G.x, G.z);
                    return { x: G.x, z: G.z, a: W.a, grund0: g0, boden, pegel: W.w, unter: Math.round((W.w - boden) * 100) / 100, ufer: [U.x, U.z] };
                }
                function fuellung(r, o) {
                    const w = r._wasserBildAt(o.x, o.z);
                    return { w: Number.isFinite(w) ? w : null, anteil: Number.isFinite(w) && o.pegel > o.boden ? Math.max(0, Math.min(1, (w - o.boden) / (o.pegel - o.boden))) : 0 };
                }
                await L.ort("wiese", "ego");
                L.preisPose("wiese", "ego");
                const v = await ev(wasser, { R: 128, d: 2 });
                L.zeile("gezeichnetes Wasser binnen 128 m: " + JSON.stringify(v));
                await L.je(1, async () => {
                    const g = await ev(grube);
                    L.zeile("Grube: " + JSON.stringify(g));
                    if (g.fehler) throw new Error(g.fehler);
                    if (!(g.unter > 0)) throw new Error("die Grube reicht nicht unter den Pegel (Boden " + g.boden + ", Pegel " + g.pegel + ")");
                    await L.wb("/lauf", { sek: 6, ein: 1 }, 90);
                    const f = await ev(fuellung, g);
                    L.zeile("Füllung nach 6 s: " + JSON.stringify(f));
                    const [sx, sz] = [Math.sin(g.a), Math.cos(g.a)];
                    await L.auge(1, { b: { px: g.x - 6 * sx, py: g.grund0 + 4, pz: g.z - 6 * sz, lx: g.x, ly: g.boden, lz: g.z }, werte: { fuellung_pct: Math.round(f.anteil * 1000) / 10 } });
                });
                await L.je(2, async () => {
                    if (v.vol < P.sprossen[2].umfang.verlangt) return L.umfang(2, v.vol, "binnen 128 m liegt " + v.vol + " m³ gezeichnetes Wasser");
                    L.leser(2, "Front eines Schwalls: das Zellen-Wasser trägt keinen Impuls, kein Leser nennt Front oder Tempo eines Schwalls (stamm/wasser-zellen.js:1641 `_tickWaterCA`)", v.vol);
                });
                await L.je(3, async () => {
                    if (v.vol < P.sprossen[3].umfang.verlangt) return L.umfang(3, v.vol, "binnen 128 m liegt " + v.vol + " m³ gezeichnetes Wasser");
                    L.leser(3, "Dammbruch: das Zellen-Wasser trägt keinen Impuls, kein Körper treibt mit einer Strömung (stamm/wasser-zellen.js:1641 `_tickWaterCA`)", v.vol);
                });
                await L.je(4, async () => L.leser(4, "Gas: kein Feld trägt Gas — der Rauch ist ein Bild ohne Masse, Auftrieb oder Verdünnung (stamm/feld-brand.js:720 `_brandRauch`)"));
                await L.je(5, async () => {
                    if (v.vol < P.sprossen[5].umfang.verlangt) return L.umfang(5, v.vol, "binnen 128 m liegt " + v.vol + " m³ gezeichnetes Wasser (tiefste Stelle " + v.tief + " m)");
                    L.leser(5, "Flutwelle: das Zellen-Wasser trägt keinen Impuls, keine Flachwasser-Welle (stamm/wasser-zellen.js:1641 `_tickWaterCA`)", v.vol);
                });
                await L.je(6, async () => L.umfang(6, v.vol, "binnen 128 m liegt " + v.vol + " m³ gezeichnetes Fluid, Wasser allein — keine Lava"));
                await L.je(7, async () => L.leser(7, "Flug in den Orbit: der Grund ist eine Ebene, nur der Himmel rechnet eine Kugel (foundry-core.js:284) — kein Leser der Fluid-Stufen vom Strand bis in den Orbit"));
                await L.je(8, async () => L.umfang(8, 1, "die Sitzung hält einen Planeten (Saat " + v.saat + ")"));
            },
        })
    );

    // ─────────── same.physik.feuer — Brand und Phase ───────────
    // S1 an der Mess-Wiese: eine trockene Gras-Zelle des Brand-Felds (16 m, `_brandStoff`) fängt im EINEN Fangen (`_brandFangen`, das der Akt
    // der Fackel wirkt: `_fackelZuenden` → `_brandEntfachen` → `_feldAktWirkt`) und wird sofort gelöscht; unter Regen (`__wetterSetzen` rainy, `_naesseTakt`) eine zweite
    // — sie darf nicht fangen; im Winter (`setSeason`) das nächste tragende Eis (`_eisAt`), der Spieler steht im Sim-Schritt darauf. Danach
    // Wetter, Nässe, Saison und Spieler wie vorher. S2–S8: die brennbaren Zellen, Häuser und Flächen der Welt.
    LEITERN.push(
        leiter({
            leiter: "same.physik.feuer",
            sek: 60,
            mutiert: true,
            pfad: [
                "scripts/werkbank.cjs",
                "scripts/lib/ausgabe-aufnahme.cjs",
                "stamm/feld-brand.js",
                "stamm/feld-leben.js",
                "stamm/kampf.js",
                "stamm/bild-himmel.js",
                "stamm/wasser-hydro.js",
                "stamm/kreatur-leben.js",
                "stamm/dirigent-takt.js",
                "stamm/bau-vorlagen.js",
                "stamm/gelaende-boden.js",
            ],
            welt: [{ wort: "feld_neu", ab: 1, was: "Zellen, die das Brand-Feld beim Entfachen trug" }],
            sprossen: {
                1: {
                    soll: [
                        { wort: "zuendet_trocken", richtung: "≥", wert: 1, wortlaut: "1 Zelle", feld: "umfang" },
                        { wort: "haelt_nass", richtung: "≥", wert: 1, wortlaut: "1 Zelle", feld: "umfang" },
                        { wort: "eis_y_cm", richtung: "≤", wert: 5, wortlaut: "y am Spiegel ±5 cm", feld: "richter" },
                    ],
                    umfang: { verlangt: 1, einheit: "Zelle", wortlaut: "1 Zelle", feld: "umfang" },
                },
                2: {
                    soll: [
                        { wort: "halt_pct", richtung: "≥", wert: 100, wortlaut: "Halt in 100 % der Proben", feld: "richter" },
                        { wort: "frame_p95_ms", richtung: "≤", wert: 33, wortlaut: "Bild-p95 ≤ 33 ms während 2 000 Zellen brennen", feld: "richter" },
                    ],
                    umfang: { verlangt: 2000, einheit: "brennbare Zellen der Wiese (10⁴ m²)", wortlaut: "eine Wiese (10⁴ m², 2 000 Zellen)", feld: "umfang" },
                },
                3: {
                    soll: [{ wort: "temp_abw_pct", richtung: "≤", wert: 20, wortlaut: "Raum-Temperatur gegen ISO 834 ±20 %", feld: "richter" }],
                    umfang: { verlangt: 1000, einheit: "m³ des größten Hauses der geladenen Welt", wortlaut: "ein Haus innen (10³ m³)", feld: "umfang" },
                },
                4: {
                    soll: [{ wort: "sprung_m", richtung: "≥", wert: 20, wortlaut: "die einen 20-m-Fluss überspringen", feld: "richter" }],
                    umfang: { verlangt: 1, einheit: "km² Laub-Bett im km² um den Spieler", wortlaut: "1 km² Wald", feld: "umfang" },
                },
                5: {
                    soll: [{ wort: "verhaeltnis", richtung: "≥", wert: 5, wortlaut: "verbrannter Anteil ≥ 5:1", feld: "richter" }],
                    umfang: { verlangt: 1000, einheit: "Häuser der geladenen Welt", wortlaut: "ein Viertel (10³ Gebäude, 10⁵ m²)", feld: "umfang" },
                },
                6: {
                    soll: [{ wort: "wind_faktor", richtung: "≥", wert: 2, wortlaut: "Wind am Brandrand ≥ 2× Umgebung", feld: "richter" }],
                    umfang: { verlangt: 1e6, einheit: "Häuser der geladenen Welt", wortlaut: "eine Stadt (10⁶ Gebäude, 10⁷ m²)", feld: "umfang" },
                },
                7: {
                    soll: [{ wort: "flaeche_abw_pct", richtung: "≤", wert: 30, wortlaut: "Brandfläche gegen FARSITE derselben Lage ±30 %", feld: "richter" }],
                    umfang: { verlangt: 1e9, einheit: "m² Gelände in den Chunks der Sitzung", wortlaut: "Landschaft bis Kontinent (10⁹–10¹² m²)", feld: "umfang" },
                },
                8: {
                    soll: [{ wort: "phase_pct", richtung: "≥", wert: 95, wortlaut: "stimmt mit Phasendiagramm ≥ 95 %", feld: "richter" }],
                    umfang: { verlangt: 100, einheit: "Planeten-Saaten", wortlaut: "N = 100 Planeten-Saaten", feld: "richter" },
                },
            },
            lauf: async function feuerLauf(H, P, L) {
                const ev = (f, a, s) => L.ev("return await (" + f + ")(r, " + JSON.stringify(a === undefined ? null : a) + ");", s || 50);
                // S1 · FACKEL AN TROCKENES / NASSES GRAS, EIS TRÄGT
                async function brandEis(r) {
                    const s = r.state, A = AnazhRealm, cs = A.LIFE_FIELD.cell, m = s.playerMesh, p = m.position;
                    if (typeof window.__wetterSetzen !== "function") return { fehler: "window.__wetterSetzen fehlt in der Seite (scripts/lib/ausgabe-aufnahme.cjs:1880)" };
                    const wort0 = s.weather, naesse0 = s.naesse;
                    const saison0 = { season: s.season, phase: s.seasonPhase, anker: r._saisonAnker, auto: s.autoSeason };
                    const bf = s.brandFeld || (s.brandFeld = new Map());
                    // das Feld vor der Probe (die Ankunft einer Nachbarin eines alten Brands schreibt `_brandZuenden` um): danach wie vorher
                    const schnapp = () => new Map([...bf].map(([k, v]) => [k, Object.assign({}, v)]));
                    const loesche = (vorher) => {
                        for (const k of [...bf.keys()]) if (!vorher.has(k)) bf.delete(k);
                        for (const [k, v] of vorher) Object.assign(bf.get(k), v);
                        if (!bf.size) [r._brandBett, r._brandRest] = [null, null];
                    };
                    // der Akt der Fackel (`_brandEntfachen` → `_feldAkt` → `_feldAktWirkt`) wirkt das EINE Fangen `_brandFangen`; die Probe
                    // ruft es selbst — ein Akt in der Reihe des Felds (`_feldFolgeSteht` falsch) brennte die Wiese nach der Probe ab
                    const fange = (c, k) => r._brandFangen((c + 0.5) * cs, (k + 0.5) * cs, null);
                    const wetter = (w) => {
                        if (window.__wetterSetzen(w) !== w) throw new Error("das Wetter gilt nicht: " + w);
                        r._naesseTakt(1e6);
                    };
                    const aus = {};
                    const vor = m.position.clone();
                    try {
                        wetter("sunny");
                        // die Gras-Zellen um den Spieler (zwei Ringe), die trocken ein Tempo tragen
                        const gras = [];
                        const [c0, k0] = [Math.floor(p.x / cs), Math.floor(p.z / cs)];
                        for (let dx = -2; dx <= 2; dx++)
                            for (let dz = -2; dz <= 2; dz++) {
                                const f = r._brandStoff(c0 + dx, k0 + dz);
                                if (f && f.zeile && f.zeile.name === "gras" && !bf.has(c0 + dx + "," + (k0 + dz))) gras.push([c0 + dx, k0 + dz, Math.abs(dx) + Math.abs(dz)]);
                            }
                        gras.sort((a, b) => a[2] - b[2]);
                        aus.grasZellen = gras.length;
                        if (gras.length < 2) return Object.assign(aus, { fehler: "nur " + gras.length + " Gras-Zellen des Brand-Felds binnen 2 Ringen" });
                        const vorher = schnapp();
                        const z1 = fange(gras[0][0], gras[0][1]);
                        aus.feld_neu = bf.size - vorher.size;
                        aus.zuendet_trocken = z1 && z1.t0 !== null && z1.R > 0 ? 1 : 0;
                        aus.trockenR = z1 ? Math.round(z1.R * 1000) / 1000 : null;
                        loesche(vorher);
                        wetter("rainy");
                        aus.naesse = s.naesse;
                        const vorher2 = schnapp();
                        const z2 = fange(gras[1][0], gras[1][1]);
                        aus.haelt_nass = z2 ? 0 : 1;
                        loesche(vorher2);
                        wetter(wort0 || "sunny");
                        // das Eis im Winter: der nächste tragende Spiegel binnen 150 m, der Spieler im Sim-Schritt darauf (höchstens 3 s)
                        if (!r.setSeason("winter")) return Object.assign(aus, { fehler: "setSeason winter gilt nicht" });
                        let E = null;
                        for (let d = 0; d <= 150 && !E; d += 6)
                            for (let k = 0; k < Math.max(1, Math.round(d / 3)) && !E; k++) {
                                const a = (2 * Math.PI * k) / Math.max(1, Math.round(d / 3)), x = p.x + d * Math.sin(a), z = p.z + d * Math.cos(a);
                                const y = r._eisAt(x, z, NaN, Infinity);
                                if (y !== null && Number.isFinite(y)) E = { x, z, y };
                            }
                        if (!E) return Object.assign(aus, { eis_y_cm: null, eisGrund: "kein tragendes Eis binnen 150 m im Winter" });
                        const fuss = A.PLAYER_FOOT_OFFSET, dt = A.FIXED_DT;
                        // der Leib 1 m über dem Eis, der Sim-Schritt trägt ihn (das Muster der Gang-Probe g5: Lage, Fall, Interpolation)
                        m.position.set(E.x, E.y + 1 + fuss, E.z);
                        s.playerVel.setValue(0, 0, 0);
                        s._fieldVy = 0;
                        if (s._fixedSimPos) s._fixedSimPos.copy(m.position);
                        let t = Number.isFinite(s._fixedSimTime) ? s._fixedSimTime : 0, still = 0, y0 = m.position.y;
                        for (let i = 0; i < 180 && still < 20; i++) {
                            r._stepFixedSim((t += dt), dt);
                            still = Math.abs(m.position.y - y0) < 1e-4 ? still + 1 : 0;
                            y0 = m.position.y;
                        }
                        aus.eis = [Math.round(E.x * 10) / 10, Math.round(E.z * 10) / 10, Math.round(E.y * 1000) / 1000];
                        aus.fuss = Math.round((m.position.y - fuss) * 1000) / 1000;
                        aus.eis_y_cm = Math.round(100 * Math.abs(m.position.y - fuss - E.y) * 100) / 100;
                        return aus;
                    } finally {
                        m.position.copy(vor);
                        if (s.playerVel) s.playerVel.setValue(0, 0, 0);
                        s._fieldVy = 0;
                        if (s._fixedSimPos) s._fixedSimPos.copy(vor);
                        [s.season, s.seasonPhase, r._saisonAnker, s.autoSeason] = [saison0.season, saison0.phase, saison0.anker, saison0.auto];
                        if (s.weather !== wort0 && wort0) window.__wetterSetzen(wort0);
                        s.naesse = naesse0;
                    }
                }
                // die Zahlen der Welt für S2–S8
                function zaehlen(r) {
                    const s = r.state, A = AnazhRealm, cs = A.LIFE_FIELD.cell, p = s.playerMesh.position, bp = s.blueprints || {};
                    // die Wiese 10⁴ m² (100 × 100 m um den Spieler): ihre brennbaren Zellen
                    const [c0, k0] = [Math.floor((p.x - 50) / cs), Math.floor((p.z - 50) / cs)], [c1, k1] = [Math.floor((p.x + 50) / cs), Math.floor((p.z + 50) / cs)];
                    let wiese = 0;
                    for (let c = c0; c <= c1; c++) for (let k = k0; k <= k1; k++) if (r._brandStoff(c, k)) wiese++;
                    // der km² um den Spieler: Anteil der Zellen mit Laub-Bett (jede 4. Zelle, 64 m)
                    let laub = 0, n = 0;
                    for (let x = -500; x < 500; x += 64)
                        for (let z = -500; z < 500; z += 64) {
                            const f = r._brandStoff(Math.floor((p.x + x) / cs), Math.floor((p.z + z) / cs));
                            n++;
                            if (f && f.zeile && f.zeile.name === "laub") laub++;
                        }
                    let haeuser = 0, maxHaus = 0;
                    for (const e of s.architectures || []) {
                        if (!/^haus_/.test(e.type)) continue;
                        haeuser++;
                        const b = bp[e.type];
                        if (!b || !Array.isArray(b.parts)) continue;
                        let [x0, y0, z0, x1, y1, z1] = [Infinity, Infinity, Infinity, -Infinity, -Infinity, -Infinity];
                        for (const t of b.parts) {
                            const a = r._partWorldAABB(t);
                            if (!a) continue;
                            [x0, y0, z0] = [Math.min(x0, a.min.x), Math.min(y0, a.min.y), Math.min(z0, a.min.z)];
                            [x1, y1, z1] = [Math.max(x1, a.max.x), Math.max(y1, a.max.y), Math.max(z1, a.max.z)];
                        }
                        const sc = Number.isFinite(e.scale) && e.scale > 0 ? e.scale : 1;
                        if (x1 > x0) maxHaus = Math.max(maxHaus, (x1 - x0) * (y1 - y0) * (z1 - z0) * sc * sc * sc);
                    }
                    const span = r._voxelChunkConfig(0).span;
                    const chunks = s.voxelChunks ? s.voxelChunks.size : 0;
                    return { zelle: cs, wiese, laubKm2: n ? Math.round((1000 * laub) / n) / 1000 : 0, haeuser, maxHaus: Math.round(maxHaus), flaeche: Math.round(chunks * span * span), chunks, saat: s.worldMeta && s.worldMeta.seed };
                }
                await L.ort("wiese", "ego");
                L.preisPose("wiese", "ego");
                await L.je(1, async () => {
                    const f = await ev(brandEis, null, Math.max(5, L.rest() - 15));
                    L.zeile("Fackel trocken / nass, Eis: " + JSON.stringify(f));
                    if (f.fehler) throw new Error(f.fehler);
                    L.gemessen(
                        1,
                        { zuendet_trocken: f.zuendet_trocken, haelt_nass: f.haelt_nass, eis_y_cm: f.eis_y_cm },
                        { erzeugt: f.zuendet_trocken, welt: { feld_neu: f.feld_neu }, taeter: (f.eisGrund ? f.eisGrund : "Fuß " + f.fuss + " m auf dem Eis " + JSON.stringify(f.eis)) + " · trocken R " + f.trockenR + " m/s · Nässe im Regen " + f.naesse }
                    );
                });
                const z = await ev(zaehlen, null, 50);
                L.zeile("Brand-Feld und Häuser der Welt: " + JSON.stringify(z));
                const nurVegetation = "das Brand-Feld brennt nur Betten der Zeilen gras und laub (stamm/feld-brand.js:214 `_brandStoff`)";
                await L.je(2, async () => {
                    if (z.wiese < P.sprossen[2].umfang.verlangt) return L.umfang(2, z.wiese, "die Wiese 100 × 100 m trägt " + z.wiese + " brennbare Zellen zu " + z.zelle + " m (AnazhRealm.LIFE_FIELD.cell, stamm/feld-leben.js:3078)");
                    L.leser(2, "Halt und Front je Probe: kein Leser nennt die Front-Proben eines Brands (stamm/feld-brand.js:374 `_brandZuenden`)", z.wiese);
                });
                await L.je(3, async () => {
                    if (z.maxHaus < P.sprossen[3].umfang.verlangt) return L.umfang(3, z.maxHaus, "das größte Haus der geladenen Welt misst " + z.maxHaus + " m³ (" + z.haeuser + " Häuser)");
                    L.leser(3, "Raumbrand: kein Gesetz brennt einen Raum, keine Raum-Temperatur — " + nurVegetation, z.maxHaus);
                });
                await L.je(4, async () => {
                    if (z.laubKm2 < P.sprossen[4].umfang.verlangt) return L.umfang(4, z.laubKm2, "der km² um den Spieler trägt " + z.laubKm2 + " km² Laub-Bett (Stichprobe je 64 m)");
                    L.leser(4, "Funkenflug: die Front geht nur an die Nachbar-Zellen (stamm/feld-brand.js:374 `_brandZuenden`, BRAND.nachbarn), kein Funke springt einen Fluss", z.laubKm2);
                });
                await L.je(5, async () => {
                    if (z.haeuser < P.sprossen[5].umfang.verlangt) return L.umfang(5, z.haeuser, "die geladene Welt trägt " + z.haeuser + " Häuser");
                    L.leser(5, "Holz- gegen Steinstadt: kein Haus brennt — " + nurVegetation, z.haeuser);
                });
                await L.je(6, async () => L.umfang(6, z.haeuser, "die geladene Welt trägt " + z.haeuser + " Häuser"));
                await L.je(7, async () => L.umfang(7, z.flaeche, "die Sitzung hält " + z.chunks + " Chunks Gelände (" + z.flaeche + " m²)"));
                await L.je(8, async () => L.umfang(8, 1, "die Sitzung hält eine Planeten-Saat (" + z.saat + ")"));
            },
        })
    );

    // ─────────── same.physik.verformung — Seil, Tuch, Knautschen, Spur ───────────
    // S1 trägt die Station g5/g6 (bestehend). S2–S7: die Welt zählt, was sich verformen könnte (Fahnen, Brücken, Wagen, Schüttgut als
    // freier Körper); jeder Leser, der die verlangte Zahl nennen müsste, fehlt beim Namen — plastische Verformung kennt die Welt nicht.
    LEITERN.push(
        leiter({
            leiter: "same.physik.verformung",
            sek: 30,
            pfad: ["scripts/werkbank.cjs", "stamm/koerper-fahrt.js", "stamm/koerper-frei.js", "stamm/siedlung-wege.js", "stamm/bau-buch.js", "stamm/wasser-hydro.js"],
            bestehend: [1],
            welt: [{ wort: "verformt", ab: 1, was: "Dinge der Welt, deren Form die Messung bleibend ändert" }],
            sprossen: {
                2: {
                    soll: [
                        { wort: "korrelation", richtung: "≥", wert: 0.6, wortlaut: "Phasen-Korrelation r ≥ 0,6", feld: "richter" },
                        { wort: "durchhang_abw_pct", richtung: "≤", wert: 20, wortlaut: "Durchhang unter 90 kg ±20 %", feld: "richter" },
                    ],
                },
                3: { soll: [{ wort: "knautsch_abw_pct", richtung: "≤", wert: 25, wortlaut: "Knautschtiefe gegen Crashtest ±25 %", feld: "richter" }] },
                4: {
                    soll: [
                        { wort: "spur_abw_pct", richtung: "≤", wert: 30, wortlaut: "Reifenspur-Tiefe in nassem Lehm ±30 % gegen Bodenmechanik", feld: "richter" },
                        { wort: "sichtbar_min", richtung: "≥", wert: 10, wortlaut: "sichtbar nach 10 min", feld: "richter" },
                    ],
                },
                5: {
                    soll: [
                        { wort: "winkel_min", richtung: "≥", wert: 30, wortlaut: "Schüttwinkel trockener Sand 30–35° im Bild", feld: "richter" },
                        { wort: "winkel_max", richtung: "≤", wert: 35, wortlaut: "Schüttwinkel trockener Sand 30–35° im Bild", feld: "richter" },
                    ],
                    umfang: { verlangt: 1000, einheit: "m³ Schüttgut als freier Körper", wortlaut: "10³ m³ Schüttgut in Bewegung", feld: "umfang" },
                },
                6: { soll: [{ wort: "stoffe", richtung: "≥", wert: 7, wortlaut: "bei 7 von 7 Stoffen", feld: "richter" }] },
                7: {
                    soll: [
                        { wort: "tempo_min", richtung: "≥", wert: 10, wortlaut: "Gletscher-Tempo im Band 10–1 000 m/Jahr", feld: "richter" },
                        { wort: "tempo_max", richtung: "≤", wert: 1000, wortlaut: "Gletscher-Tempo im Band 10–1 000 m/Jahr", feld: "richter" },
                    ],
                },
            },
            lauf: async function verformungLauf(H, P, L) {
                function zaehlen(r) {
                    const s = r.state, bp = s.blueprints || {};
                    const plaene = Object.keys(bp);
                    let wagen = 0, schuett = 0;
                    for (const e of s.architectures || []) {
                        if (/^fahrzeug_/.test(e.type)) wagen++;
                        const K = e._frei;
                        if (K && /^(erde|sand|kies|schnee)$/.test(K.stoff || "")) schuett += K.m / Math.max(1, r._stoffRho(K.stoff));
                    }
                    return {
                        fahnen: plaene.filter((n) => /fahne|flagge|banner|tuch/i.test(n)).length,
                        bruecken: (s.architectures || []).filter((e) => /bruecke|brücke/i.test(e.type)).length,
                        wagen,
                        schuett: Math.round(schuett * 1000) / 1000,
                        tuchLoeser: typeof r._tuchTakt === "function",
                    };
                }
                const z = await L.ev("return (" + zaehlen + ")(r);", 30);
                L.zeile("was sich in der Welt verformen könnte: " + JSON.stringify(z));
                L.preisPose("wiese", "ego");
                await L.je(2, async () => L.leser(2, "Fahne im EINEN Wind und Durchhang: der Tuch-Löser trägt nur das Tuch am Leib (stamm/koerper-fahrt.js:160 `_tuchTakt`), die Welt hält " + z.fahnen + " Pläne mit Tuch und " + z.bruecken + " Brücken, kein Leser einer Phase oder eines Durchhangs"));
                await L.je(3, async () => L.leser(3, "Knautschen: der Stoß ändert nur das Tempo des Wagens, keine bleibende Form (stamm/koerper-fahrt.js:1575 `_wagenSchritt`) — " + z.wagen + " Wagen in der Welt"));
                await L.je(4, async () => L.leser(4, "Spur im Boden: der Tritt der Leiber mindert nur Büschel, kein Rad und kein Fuß drückt den Boden ein (stamm/siedlung-wege.js:1638 `_trittDerLeiber`)"));
                await L.je(5, async () => L.umfang(5, z.schuett, "die Welt trägt " + z.schuett + " m³ Schüttgut (Erde, Sand, Kies, Schnee) als freien Körper — das Feld ist starr"));
                await L.je(6, async () => L.leser(6, "bleibende Verformung: die Streckgrenze der Zeile urteilt nur Knick und Druck (stamm/bau-buch.js:1869 `_failsUnderLoad`), keine bleibende Form im Bild"));
                await L.je(7, async () => L.leser(7, "Gletscher: das Eis ist eine Phase des Spiegels ohne Fluss (stamm/wasser-hydro.js:703 `_eisAt`)"));
            },
        })
    );

    // ─────────── same.physik.reaktion — Chemie ───────────
    // Die Welt zählt ihre Reaktionen: die Zeilen der Stoff-Tafel mit Brenn-Spalte (die einzige Reaktion, Rothermel). S1 misst die Masse
    // des Brands an der Mess-Wiese (`masseProbe`: Holz → Asche + Rauch, und der Rauch im Bild proportional zum verzehrten Holz über vier
    // Herde aus 1 · 3 · 9 · 25 Zellen). DER MESSORT DER LEITER IST DIE MESS-WIESE, genannt aus der EINEN Quelle der Orte (`messort` von
    // welt-orte: die Sitzung liest ihn aus dem Text der Probe und stellt ihn VOR dem Deckel, punkte.cjs `probeOrt`; `L.ort` hält ihn im
    // Deckel fest) — das Bild des Brands trägt Flamme und Rauch nur bis `BRAND.bild.weiteM` um das Auge der Stufen. Bis 23.11. nannte
    // die Leiter keinen Ort und maß, wo die Probe davor das Auge ließ (Radeon f0a89f7e: 1 093 m vom Herd — Rauch 0 kg, masse_abw_pct
    // 94,45; an der GTX 1050 mit dem Auge am Startplatz nachgestellt: dieselben Zahlen); ein fernes Auge nennt `masseProbe` seither als
    // Messort (kein Urteil). S2 misst die Druckwelle (`druckProbe`: drei Ladungen verschiedener Energie, je Ladung der Radius, bis zu dem
    // Scheiben brechen, gegen ∛W); Korrosion je Ort, Schmelze fehlen beim Namen; S5 fährt die Saaten der Sitzung (H.seite.SAATEN, der EINE Wechsel
    // am Ort) und zählt je Saat die Stoff-Tafel und die Siedlungen; die Planeten (S6) zählt die Sitzung.
    LEITERN.push(
        leiter({
            leiter: "same.physik.reaktion",
            sek: 60,
            pfad: ["scripts/werkbank.cjs", "stamm/feld-brand.js", "stamm/stoff-material.js", "stamm/bau-buch.js", "stamm/bau-vorlagen.js", "stamm/bild-himmel.js", "stamm/siedlung-satz.js", "schmiede-core.js", "scripts/lib/welt-orte.cjs", "spec/profiband/haushalt.json"],
            welt: [{ wort: "umgesetzt_kg", ab: 0.1, was: "Masse, die die Reaktion in der Welt umsetzt (kg)" }],
            sprossen: {
                1: {
                    // BEIDE HÄLFTEN DES SATZES sind gerichtet: die Masse (Asche + Rauch gegen das Holz) und „Rauchmenge sichtbar
                    // proportional" (die optische Fläche der Fahne je kg verzehrtes Holz über vier Herde, größte Abweichung vom Mittel).
                    // LESART DER STATION, beim Namen: die Karte nennt EINE Zahl (±10 %), sie steht bei der Masse — für „proportional"
                    // nennt sie keine eigene; die Station legt dieselbe Zahl an beide Hälften (darum trägt das zweite Wort den ganzen Satz
                    // als Wortlaut). Gemessen wird an den gezeichneten Ballen (τ·A aus Deckung und Größe), nicht an Pixeln
                    soll: [
                        { wort: "masse_abw_pct", richtung: "≤", wert: 10, wortlaut: "Asche + Rauch-Masse = Holz ±10 %", feld: "richter" },
                        { wort: "rauch_prop_abw_pct", richtung: "≤", wert: 10, wortlaut: "Asche + Rauch-Masse = Holz ±10 %, Rauchmenge sichtbar proportional", feld: "richter" },
                    ],
                    umfang: { verlangt: 1, einheit: "Reaktion (Stoff-Zeile mit Brenn-Spalte)", wortlaut: "1 Reaktion", feld: "umfang" },
                },
                2: {
                    soll: [{ wort: "radius_abw_pct", richtung: "≤", wert: 25, wortlaut: "Schadensradius ∝ W^(1/3) ±25 % bei drei Ladungen", feld: "richter" }],
                    umfang: { verlangt: 3, einheit: "Ladungen verschiedener Energie", wortlaut: "bei drei Ladungen", feld: "richter" },
                    welt: [{ wort: "gebrochen", ab: 3, was: "Scheiben, die die Wellen der Ladungen in der Welt brachen" }],
                },
                3: { soll: [{ wort: "rost_abw_pct", richtung: "≤", wert: 30, wortlaut: "Rost-Verhältnis ±30 % gegen Korrosions-Raten", feld: "richter" }] },
                4: { soll: [{ wort: "schwelle_c", richtung: "≥", wert: 1085, wortlaut: "Ofen unter 1 085 °C gibt kein Kupfer", feld: "richter" }] },
                5: {
                    soll: [{ wort: "konsistenz_pct", richtung: "≥", wert: 95, wortlaut: "konsistent mit Lagerstätten und Ofentemperatur ≥ 95 %", feld: "richter" }],
                    umfang: { verlangt: 100, einheit: "Saaten", wortlaut: "N = 100 Saaten", feld: "richter" },
                },
                6: {
                    soll: [{ wort: "verstoesse", richtung: "≤", wert: 0, wortlaut: "0 Verstöße", feld: "richter" }],
                    umfang: { verlangt: 100, einheit: "Planeten", wortlaut: "N = 100 Planeten", feld: "richter" },
                },
            },
            seite: { SAATEN },
            lauf: async function reaktionLauf(H, P, L) {
                function zaehlen(r) {
                    const s = r.state, SG = globalThis.__schmiedeCore && globalThis.__schmiedeCore.STOFF_GESETZ;
                    const zeilen = SG && SG.ZEILEN ? Object.keys(SG.ZEILEN) : [];
                    // nur Zeilen, die die Welt trägt (ein fehlender Name meldete in `_stoff` einen Bruch)
                    const M = s.materials || {};
                    const brenn = zeilen.filter((n) => {
                        const z = M[n] && r._stoff(n);
                        return !!(z && z.brenn);
                    });
                    const erz = zeilen.filter((n) => /erz|kupfer|zinn/i.test(n));
                    return { zeilen: zeilen.length, brenn, erz, wetter: s.weather, nassTage: s.worldMeta && s.worldMeta.nassTage, saat: s.worldMeta && s.worldMeta.seed };
                }
                // DIE MASSE BLEIBT, DER RAUCH IST PROPORTIONAL (front-brand, stamm/feld-brand.js `_brandMasse` · `_brandStrom` · `_brandRauch`)
                async function masseProbe(r, ort) {
                    const st = r.state, C = AnazhRealm, B = C.BRAND, cs = C.LIFE_FIELD.cell, P = Object.getPrototypeOf(r);
                    // same.physik.reaktion#1 — „Asche + Rauch-Masse = Holz ±10 %, Rauchmenge sichtbar proportional": die Probe der Station an der Mess-Wiese
                    // (Sommer, sonnig, Mittag, trocken). HOLZ: die Station misst das Bett selbst (Last der Zeile × lebendig × Bett-Anteil × Zell-Fläche).
                    // ASCHE: der Herd brennt allein aus, seine Tat `brand` trägt sie. RAUCH: der Herd brennt 10 s, dann 6 s im Takt von 100 ms — die Masse
                    // der geborenen Ballen (samt dem, was die Zellen für ihren nächsten halten) gegen das Holz, das die Front im Fenster verzehrte (die
                    // Ankunft ihrer Ellipse auf einem Gitter über dem Brand), auf das ganze Holz gehoben. PROPORTIONAL: vier Herde verschiedener Masse
                    // (1 · 3 · 9 · 25 Zellen, jede in ihrer Mitte gezündet, nur sie fangen) — je Herd die optische Fläche, mit der das Bild seine geborenen
                    // Ballen zeichnet (τ·A aus Deckung und Größe jedes Ballens), je kg Holz, das seine Fronten im Fenster verzehrten: die größte
                    // Abweichung vom Mittel der vier, und die Folge der Herde nach Holz muss die nach optischer Fläche sein. Kein Wert kommt aus dem
                    // Buch des Gesetzes.
                    const r3 = (v) => Math.round(v * 1e3) / 1e3;
                    r.setSeason("sommer");
                    if (window.__wetterSetzen("sunny") !== "sunny") throw new Error("Wetter gilt nicht");
                    r._naesseTakt(1e6);
                    r.setTimeOfDay(0.5, "regler");
                    const [hx, hz] = [-248, -1064];
                    const [cx, cz] = [Math.floor(hx / cs), Math.floor(hz / cs)];
                    let f = null;
                    for (let i = 0; i < 20; i++) {
                        r._brandBett = null;
                        f = r._brandStoff(cx, cz, st.spielZeit);
                        if (f && f.anteil >= 0.99) break;
                        await new Promise((ok) => setTimeout(ok, 1000));
                    }
                    if (!f) return { fehler: "an der Mess-Wiese liegt kein Bett (lebendig " + r3(r.auraAt(hx, hz, 0, st.spielZeit).lebendig) + ", nass " + !!r._nassAt(hx, hz) + ", Saison " + st.season + ")" };
                    const S_T = B.mineral.gesamt;
                    const holzVon = (q) => {
                        const g = r._brandStoff(q.cx, q.cz, st.spielZeit);
                        return g ? g.zeile.brenn.last * Math.min(1, g.leb) * g.anteil * cs * cs : NaN;
                    };
                    const holz = f.zeile.brenn.last * Math.min(1, f.leb) * f.anteil * cs * cs;
                    // die Zellen der vier Herde: der Herd und die nächsten Zellen mit Bett (Ringe um ihn, bis 25 stehen)
                    const bette = [[cx, cz]];
                    for (let d = 1; d <= 6 && bette.length < 25; d++)
                        for (let i = -d; i <= d && bette.length < 25; i++)
                            for (let j = -d; j <= d && bette.length < 25; j++)
                                if (Math.max(Math.abs(i), Math.abs(j)) === d && r._brandStoff(cx + i, cz + j, st.spielZeit)) bette.push([cx + i, cz + j]);
                    // DAS AUGE DER PROBE (die Wand am Messort): das Bild des Brands gibt Flamme und Rauch nur Zellen bis `BRAND.bild.weiteM` um das
                    // Auge der Stufen (stamm/feld-brand.js `_brandBild` über `_lodAuge`) — steht es ferner, zeichnet die Welt keinen Ballen, und
                    // die Sprosse fiele an ihrem Messort statt an der Welt (Radeon f0a89f7e: das Auge 1 093 m vom Herd, Rauch 0 kg, masse_abw_pct
                    // 94,45). Dann urteilt die Probe NICHT: sie nennt den Messort beim Namen.
                    const auge = r._lodAuge();
                    const augeM = auge ? Math.hypot(auge.x - ort[0], auge.z - ort[1]) : Infinity;
                    const fernM = auge ? Math.max(...bette.map(([x, z]) => Math.hypot((x + 0.5) * cs - auge.x, (z + 0.5) * cs - auge.z))) + cs * Math.SQRT1_2 : Infinity;
                    if (!(fernM <= B.bild.weiteM))
                        return { messort: "das Auge der Probe steht " + (auge ? Math.round(augeM) + " m vom Messort wiese (" + ort.join(" / ") + "), die fernste Zelle der Herde " + Math.round(fernM) + " m von ihm" : "nirgends (`_lodAuge`)") + " — das Bild des Brands trägt Flamme und Rauch bis " + B.bild.weiteM + " m um das Auge (stamm/feld-brand.js `_brandBild`)" };
                    const taten = st.worldMeta.taten || (st.worldMeta.taten = []);
                    const n0 = taten.length;
                    const leer = () => {
                        if (r._brandRest) r._brandArbeit(Infinity);
                        st.brandFeld.clear();
                        taten.length = n0;
                        r._tatGen = (r._tatGen | 0) + 1;
                        (st.wegeKarte ? st.wegeKarte.stufen : []).forEach((s) => s.zentriert && r._ascheStufeMalen(s));
                    };
                    // nur die Zellen der Wahl fangen: was die Front über ihren Rand trägt, gehört nicht zum Herd
                    const nur = (wahl, fn) => {
                        const darf = new Set(wahl.map(([x, z]) => x + "," + z));
                        r._brandZuenden = function (x, z, ...a) {
                            if (darf.has(x + "," + z)) return P._brandZuenden.call(this, x, z, ...a);
                            st.brandFeld.delete(x + "," + z);
                            return null;
                        };
                        // die Probe schreitet ihre eigene Uhr (je Herd 16 s): die Stunde, die die nahen Regionen danach nachholen, steht dem Entfachen
                        // nicht voran (`_feldFolgeSteht`, wie gate:stand-takt) — sonst tritt der Akt des nächsten Herds in die Reihe der Folge und
                        // fängt erst, wenn die Welt ihre Takte nachgeholt hat (gemessen: Herd 2 und 3 mit 0 brennenden Zellen)
                        r._feldFolgeSteht = () => true;
                        try {
                            return fn();
                        } finally {
                            delete r._brandZuenden;
                            delete r._feldFolgeSteht;
                            leer();
                        }
                    };
                    // ASCHE: der Herd allein, EIN Schritt des Gesetzes an sein Ende
                    const A = nur([[cx, cz]], () => {
                        r._brandEntfachen(hx, hz);
                        const b = st.brandFeld.get(cx + "," + cz);
                        if (!b || b.t0 === null) return { fehler: "der Herd fing nicht" };
                        const dauer = b.ende - b.t0;
                        r._brandSchritt(b.ende + B.schrittS);
                        r._brandArbeit(Infinity);
                        const tat = taten.slice(n0).find((a) => a.tat === "brand" && Math.floor(a.x / cs) === cx && Math.floor(a.z / cs) === cz);
                        return { asche: tat && Number.isFinite(tat.kg) ? tat.kg : null, dauer };
                    });
                    if (A.fehler) return A;
                    const asche = A.asche;
                    // DIE FAHNE EINES HERDS: 10 s Brand, dann 6 s im Takt von 100 ms
                    const zeit = (b, x, z) => (Math.hypot(x - b.ex, z - b.ez) - b.ecc * ((x - b.ex) * b.kopf[0] + (z - b.ez) * b.kopf[1])) / (b.R * (1 - b.ecc));
                    const verzehrtKg = (q, t1, t2, N = 384) => {
                        const bett = r._brandBettFn(q.bett, q.cx, q.cz);
                        let m2 = 0;
                        for (let i = 0; i < 4096; i++) m2 += bett ? bett((q.cx + ((i % 64) + 0.5) / 64) * cs, (q.cz + (Math.floor(i / 64) + 0.5) / 64) * cs) : 1;
                        m2 *= (cs * cs) / 4096;
                        const reich = Math.max(0, t2 - q.t0) * q.R;
                        const [xa, xb, za, zb] = [Math.max(q.cx * cs, q.ex - reich), Math.min((q.cx + 1) * cs, q.ex + reich), Math.max(q.cz * cs, q.ez - reich), Math.min((q.cz + 1) * cs, q.ez + reich)];
                        if (!(xb > xa && zb > za && m2 > 0)) return 0;
                        let u = 0;
                        for (let i = 0; i < N; i++)
                            for (let j = 0; j < N; j++) {
                                const [x, z] = [xa + ((i + 0.5) / N) * (xb - xa), za + ((j + 0.5) / N) * (zb - za)];
                                const an = q.t0 + zeit(q, x, z);
                                if (an > t1 && an <= t2) u += bett ? bett(x, z) : 1;
                            }
                        return (holzVon(q) * u * (xb - xa) * (zb - za)) / (N * N) / m2;
                    };
                    const [W, R] = [C.RAUCH_BILD, B.bild.rauch];
                    const optisch = (p) => (-Math.log(1 - Math.min(W.deckMax, p.a)) * Math.PI * (R.size * p.s) ** 2) / (W.profil + 1);
                    const takt = (dt) => (r._weltUhrNimm(st.spielZeit + dt), r._tickBrand(), r._brandArbeit(Infinity));
                    const fahne = (wahl) =>
                        nur(wahl, () => {
                            r._brandBett = null;
                            for (const [x, z] of wahl) r._brandEntfachen((x + 0.5) * cs, (z + 0.5) * cs);
                            const gefangen = wahl.filter(([x, z]) => ((q) => q && q.t0 !== null)(st.brandFeld.get(x + "," + z))).length;
                            for (let i = 0; i < 10; i++) takt(B.schrittS);
                            const T = st.brandRauch.teilchen;
                            const schuld = () => [...st.brandFeld.values()].reduce((s, q) => s + (q.rauchKg || 0), 0) * (1 - S_T);
                            takt(0.1);
                            r._brandBild(0.1);
                            T.length = st.brandRauch.n = 0;
                            const [t1, gesehen, geboren, h1] = [st.spielZeit, new Set(), [], schuld()];
                            for (let i = 0; i < 60; i++) {
                                takt(0.1);
                                r._brandBild(0.1);
                                for (const p of T) if (!gesehen.has(p)) (gesehen.add(p), geboren.push({ m: p.m, o: optisch(p) }));
                            }
                            const Z = [...st.brandFeld.values()].filter((q) => q.t0 !== null);
                            const haelt = schuld() - h1;
                            const verzehrt = Z.reduce((s, q) => s + verzehrtKg(q, t1, st.spielZeit), 0);
                            const masse = geboren.reduce((s, g) => s + g.m, 0) + haelt;
                            return { soll: wahl.length, gefangen, zellen: Z.length, ballen: geboren.length, holz: verzehrt, strom: verzehrt * (1 - S_T), masse, haelt, optisch: geboren.reduce((s, g) => s + g.o, 0) };
                        });
                    if (bette.length < 25) return { fehler: "um den Herd tragen nur " + bette.length + " Zellen ein Bett (verlangt 25 für die vier Herde)" };
                    const H = [1, 3, 9, 25].map((n) => fahne(bette.slice(0, n)));
                    const lahm = H.find((h) => h.gefangen < h.soll);
                    if (lahm) return { fehler: "der Herd aus " + lahm.soll + " Zellen fing nur in " + lahm.gefangen + " (jede trägt ein Bett: `_brandStoff`)" };
                    const F = H[0];
                    const rauch = Number.isFinite(F.masse) && F.strom > 0 ? holz * (1 - S_T) * (F.masse / F.strom) : null;
                    // PROPORTIONAL: optische Fläche je kg verzehrtes Holz, je Herd — die größte Abweichung vom Mittel; die Folge nach Holz = die nach Fläche
                    const q = H.map((h) => (h.holz > 0 && Number.isFinite(h.optisch) ? h.optisch / h.holz : NaN));
                    const mittel = q.reduce((s, v) => s + v, 0) / q.length;
                    const rang = H.every((h, i) => !i || (h.holz > H[i - 1].holz * 1.5 && h.optisch > H[i - 1].optisch));
                    const prop = rang && mittel > 0 ? r3(Math.max(...q.map((v) => (100 * Math.abs(v - mittel)) / mittel))) : null;
                    return {
                        holz: r3(holz),
                        augeM: Math.round(augeM),
                        bett: { stoff: f.zeile.name, leb: r3(f.leb), anteil: f.anteil },
                        asche,
                        rauch: rauch === null ? null : r3(rauch),
                        masse_abw_pct: asche === null || rauch === null ? null : r3((100 * Math.abs(asche + rauch - holz)) / holz),
                        umgesetzt_kg: asche === null || rauch === null ? null : r3(asche + rauch),
                        rauch_prop_abw_pct: prop,
                        rang,
                        dauerS: r3(A.dauer),
                        herde: H.map((h, i) => ({ zellen: h.zellen, ballen: h.ballen, holz: r3(h.holz), masse: Number.isFinite(h.masse) ? r3(h.masse) : null, strom: r3(h.strom), optisch: r3(h.optisch), jeKg: r3(q[i]) })),
                    };
                }
                // DIE DRUCKWELLE NACH DER LADUNG (front-druckwelle, stamm/feld-brand.js `_ladungJ` · `_druckWelle` · `_druckWerk`; schmiede `plattenLast`)
                async function druckProbe(r) {
                    const st = r.state, C = AnazhRealm;
                    // same.physik.reaktion#2 — „Schadensradius ∝ W^(1/3) ±25 % bei drei Ladungen": die Probe der Station an der Mess-Wiese, gemessen IN DER
                    // WELT. DREI LADUNGEN verschiedener Energie: dasselbe Werk der Welt (`donnerfass`, stamm/bau-vorlagen.js) in drei Maßen — die Ladung
                    // trägt Volumen × Maß³ × ρ × q aus der Zeile ihres Stoffs (stamm/feld-brand.js `_ladungJ`); W liest die Probe an der Welle, die die
                    // Welt schrieb. JE LADUNG eine Leiter von Probe-Scheiben (das Fenster von gate:stand-takt (D): Quarz 0,5 × 0,5 m × 4 mm auf einem
                    // Holz-Bock, der Welle zugewandt) — GROB über 3 … 70 m im Verhältnis Q, dann dieselbe Ladung noch einmal mit NF Scheiben FEIN zwischen
                    // der fernsten gebrochenen und der nächsten stehenden (grob allein stünde der Radius auf ±5 %, das Urteil der drei auf ±4 Punkte).
                    // Der Funke fällt am Fass (`_brandEntfachen`: der Weg des Brennglases), die Ladung setzt um, die Welle trifft jede Scheibe zu IHRER
                    // Ankunft (`_tickDruck` an der Uhr der Welt). DER SCHADENSRADIUS einer Ladung: der Abstand, bis zu dem Scheiben brachen — das
                    // geometrische Mittel der fernsten gebrochenen und der nächsten stehenden (Abstand im Raum von der Welle zur Mitte der Scheibe);
                    // liegen die beiden weiter als einen groben Schritt auseinander, trägt die Ladung keinen Radius. GEGEN W^(1/3): R ÷ ∛W je Ladung, die
                    // größte Abweichung vom Mittel der drei; dazu der Exponent der Welt (Steigung ln R über ln W). Kein Radius kommt aus dem Buch des
                    // Gesetzes. Die Probe räumt hinter sich auf (Bauten, Scherben, Bauplan, das Feuer des Funkens, Tat und Tagebuch), der Spieler steht wieder.
                    const r3 = (v) => Math.round(v * 1e3) / 1e3;
                    const t0 = performance.now();
                    const [O, MASSE, D0, Q, N, NF] = [{ x: -248, z: -1064 }, [0.4, 0.63, 1], 3, 1.1, 34, 12];
                    const [plaeneVor, bautenVor] = [new Set(Object.keys(st.blueprints)), new Set(st.architectures)];
                    const taten = st.worldMeta.taten || (st.worldMeta.taten = []);
                    const tagebuch = st.worldJournal && Array.isArray(st.worldJournal.entries) ? st.worldJournal.entries : null;
                    const [tatenVor, tagebuchVor] = [taten.length, tagebuch ? tagebuch.length : 0];
                    const pm = st.playerMesh.position;
                    const heim = [pm.x, pm.y, pm.z];
                    const NAME = "_k2_scheibe";
                    const setz = (typ, x, z, mehr) => r.spawnArchitecture(typ, { x, y: r._voxelSurfaceY(x, z) + 0.5, z }, { precise: true, silent: true, ...mehr });
                    const raeumen = () => {
                        for (const e of st.architectures.filter((e) => !bautenVor.has(e))) r.removeArchitecture(e, { still: true });
                        if (r._brandRest) r._brandArbeit(Infinity);
                        if (st.brandFeld) st.brandFeld.clear();
                        r._brandRest = null;
                        if (taten.length > tatenVor) (taten.length = tatenVor), (r._tatGen = (r._tatGen | 0) + 1);
                        if (tagebuch && st.worldJournal.entries === tagebuch && tagebuch.length > tagebuchVor) tagebuch.length = tagebuchVor;
                    };
                    // EINE LADUNG vor ihren Scheiben (Abstände in der Ebene, je Scheibe ein eigener Strahl-Winkel `winkel(k)`): zünden, die Welle zu Ende
                    // schreiten, je Scheibe ihr Abstand im Raum und ob sie brach → { energieJ, S } oder { fehler }
                    const feuer = (i, mass, stufe, abstaende, winkel) => {
                        try {
                            const fass = setz("donnerfass", O.x, O.z, { seed: 7990 + i, ruht: true, scale: mass });
                            if (!fass) return { fehler: "das Donnerfass im Maß " + mass + " steht nicht (stamm/siedlung-satz.js `spawnArchitecture`)" };
                            const scheiben = [];
                            for (const [k, d] of abstaende.entries()) {
                                const [x, z] = [O.x + d * Math.cos(winkel(k)), O.z + d * Math.sin(winkel(k))];
                                const e = setz(NAME, x, z, { seed: 7100 + 1000 * stufe + 100 * i + k, rotationY: Math.atan2(O.x - x, O.z - z) });
                                if (!e) return { fehler: "die Probe-Scheibe in " + r3(d) + " m steht nicht (stamm/siedlung-satz.js `spawnArchitecture`)" };
                                scheiben.push({ e, d });
                            }
                            const wellenVor = new Set(r._druckWellen || []);
                            r._brandEntfachen(O.x, O.z);
                            const wand = performance.now();
                            for (let n = 0; r._druckFristen && r._druckFristen.length && n < 4000 && performance.now() - wand < 6000; n++) {
                                r._weltUhrNimm(st.spielZeit + 0.02);
                                r._tickDruck();
                            }
                            const w = (r._druckWellen || []).find((x) => !wellenVor.has(x));
                            if (!w) return { fehler: "keine Welle: die Ladung im Maß " + mass + " setzte nicht um (stamm/feld-brand.js `_ladungUmsatz`)" };
                            if (r._druckFristen && r._druckFristen.length) return { fehler: "die Welle der Ladung im Maß " + mass + " kam in 6 s nicht zu Ende (" + r._druckFristen.length + " Fristen offen)" };
                            return { energieJ: w.energieJ, S: scheiben.map(({ e, d }) => ({ d, R: Math.hypot(e.position.x - w.x, e.position.y - 0.5 + 0.37 - w.y, e.position.z - w.z), gebrochen: !st.architectures.includes(e) })) };
                        } finally {
                            raeumen();
                        }
                    };
                    const rand = (S) => {
                        const [innen, aussen] = [S.filter((s) => s.gebrochen).sort((a, b) => b.R - a.R)[0], S.filter((s) => !s.gebrochen).sort((a, b) => a.R - b.R)[0]];
                        return [innen || null, aussen || null];
                    };
                    const ladungen = [];
                    r._feldFolgeSteht = () => true; // die Probe schreitet ihre eigene Uhr: der Funke fällt jetzt (wie `masseProbe`)
                    try {
                        st.blueprints[NAME] = C._etikett({
                            name: NAME,
                            builtIn: false,
                            vomGesetz: true,
                            parts: [
                                { shape: "box", material: "holz", size: { x: 0.7, y: 0.12, z: 0.35 }, position: { x: 0, y: 0.06, z: 0 } },
                                { shape: "box", material: "quarz", size: { x: 0.5, y: 0.5, z: 0.004 }, position: { x: 0, y: 0.37, z: 0 } },
                            ],
                        });
                        for (const [i, mass] of MASSE.entries()) {
                            const grob = feuer(i, mass, 0, Array.from({ length: N }, (_, k) => D0 * Q ** k), (k) => 0.35 + (k % 4) * (Math.PI / 2));
                            if (grob.fehler) {
                                ladungen.push({ mass, fehler: grob.fehler });
                                continue;
                            }
                            let S = grob.S;
                            let [innen, aussen] = rand(S);
                            if (innen && aussen && innen.d < aussen.d) {
                                const fein = feuer(i, mass, 1, Array.from({ length: NF }, (_, k) => innen.d * (aussen.d / innen.d) ** ((k + 1) / (NF + 1))), (k) => 0.35 + (k * 2 * Math.PI) / NF);
                                if (fein.fehler || Math.abs(fein.energieJ - grob.energieJ) > 1e-9 * grob.energieJ) {
                                    ladungen.push({ mass, fehler: fein.fehler || "dieselbe Ladung trug zwei Energien (" + r3(grob.energieJ / 1e6) + " · " + r3(fein.energieJ / 1e6) + " MJ)" });
                                    continue;
                                }
                                S = S.concat(fein.S);
                                [innen, aussen] = rand(S);
                            }
                            // der Rand ist scharf, wenn die fernste gebrochene und die nächste stehende höchstens einen groben Schritt auseinander liegen
                            const scharf = innen && aussen && Math.abs(Math.log(aussen.R / innen.R)) <= Math.log(Q);
                            const radius = scharf ? Math.sqrt(innen.R * aussen.R) : null;
                            ladungen.push({
                                mass,
                                energieMJ: r3(grob.energieJ / 1e6),
                                scheiben: S.length,
                                gebrochen: S.filter((s) => s.gebrochen).length,
                                innenM: innen ? r3(innen.R) : null,
                                aussenM: aussen ? r3(aussen.R) : null,
                                radiusM: radius === null ? null : r3(radius),
                                jeW3: radius === null ? null : radius / Math.cbrt(grob.energieJ),
                            });
                        }
                    } finally {
                        delete r._feldFolgeSteht;
                        raeumen();
                        for (const k of Object.keys(st.blueprints)) if (!plaeneVor.has(k)) delete st.blueprints[k];
                        pm.set(heim[0], heim[1], heim[2]);
                        if (st.playerVel && st.playerVel.setValue) st.playerVel.setValue(0, 0, 0);
                    }
                    // drei Ladungen VERSCHIEDENER Energie mit einem scharfen Rand: nur sie richten
                    const gut = ladungen.filter((l) => l.radiusM > 0).filter((l, i, a) => a.findIndex((m) => m.energieMJ === l.energieMJ) === i);
                    const k = gut.map((l) => l.jeW3);
                    const mittel = k.reduce((s, v) => s + v, 0) / (k.length || 1);
                    // der Exponent der Welt: die Steigung von ln R über ln W (kleinste Quadrate über die Ladungen)
                    const [lx, ly] = [gut.map((l) => Math.log(l.energieMJ)), gut.map((l) => Math.log(l.radiusM))];
                    const [mx, my] = [lx.reduce((s, v) => s + v, 0) / (lx.length || 1), ly.reduce((s, v) => s + v, 0) / (ly.length || 1)];
                    const sxx = lx.reduce((s, v) => s + (v - mx) * (v - mx), 0);
                    return {
                        ladungen: ladungen.map((l) => ({ ...l, jeW3: typeof l.jeW3 === "number" ? Math.round(l.jeW3 * 1e5) / 1e5 : null })),
                        gemessen: gut.length,
                        radius_abw_pct: gut.length >= MASSE.length ? r3(Math.max(...k.map((v) => (100 * Math.abs(v - mittel)) / mittel))) : null,
                        hoch: sxx > 0 ? r3(lx.reduce((s, v, i) => s + (v - mx) * (ly[i] - my), 0) / sxx) : null,
                        gebrochen: ladungen.reduce((s, l) => s + (l.gebrochen | 0), 0),
                        bautenRest: st.architectures.filter((e) => !bautenVor.has(e)).length,
                        ms: Math.round(performance.now() - t0),
                    };
                }
                const z = await L.ev("return (" + zaehlen + ")(r);", 30);
                L.zeile("Reaktionen der Stoff-Tafel: " + JSON.stringify(z));
                // DER MESSORT DER LEITER aus der EINEN Quelle der Orte (welt-orte → spec/profiband/haushalt.json): die Sitzung liest ihn aus
                // diesem Text und stellt ihn vor dem Deckel (punkte.cjs `probeOrt`), `L.ort` hält ihn im Deckel fest (warm ~3 s) — S1 liest
                // das Bild des Brands, das nur um das Auge der Stufen lebt; die Probe endet an derselben Stelle (Preis-Pose)
                const M = require(H.path.resolve("scripts/lib/welt-orte.cjs")).messort("wiese");
                await L.ort(M.id, "ego");
                L.preisPose(M.id, "ego");
                await L.je(1, async () => {
                    if (z.brenn.length < P.sprossen[1].umfang.verlangt) return L.umfang(1, z.brenn.length, "keine Zeile der Stoff-Tafel trägt eine Brenn-Spalte");
                    const m = await L.ev("return await (" + masseProbe + ")(r, " + JSON.stringify([M.x, M.z]) + ");", 120);
                    L.zeile("Masse der Reaktion: " + JSON.stringify(m));
                    if (m.messort) throw H.messort(new Error("same.physik.reaktion S1: " + m.messort));
                    if (m.fehler) return L.umfang(1, 0, m.fehler);
                    if (m.masse_abw_pct === null)
                        return L.leser(1, "Masse von Asche und Rauch: " + (m.asche === null ? "die Tat `brand` trägt keine Asche in kg (stamm/feld-brand.js `_brandArbeit`)" : "die Ballen der Fahne tragen keine Masse (stamm/feld-brand.js `_brandRauch`)") + " — " + z.brenn.join(", ") + " brennen", z.brenn.length);
                    const herde = m.herde.map((h) => h.zellen + " Zellen: " + h.holz + " kg Holz → " + h.optisch + " m² optisch (" + h.jeKg + " m²/kg)").join(" · ");
                    L.gemessen(1, { masse_abw_pct: m.masse_abw_pct, rauch_prop_abw_pct: m.rauch_prop_abw_pct }, { erzeugt: 1, welt: { umgesetzt_kg: m.umgesetzt_kg }, taeter: "MASSE: Holz " + m.holz + " kg (" + m.bett.stoff + ", Mess-Wiese) → Asche " + m.asche + " kg + Rauch " + m.rauch + " kg · PROPORTIONAL: " + herde + (m.rang ? "" : " — die Folge der Herde nach Holz ist nicht die nach optischer Fläche") });
                });
                await L.je(2, async () => {
                    const v = P.sprossen[2].umfang.verlangt;
                    const d = await L.ev("return await (" + druckProbe + ")(r);", 60);
                    L.zeile("Druckwelle der Ladungen: " + JSON.stringify(d));
                    if (d.fehler) return L.umfang(2, d.gemessen, d.fehler);
                    const je = d.ladungen
                        .map((l) => (l.fehler ? "Maß " + l.mass + ": " + l.fehler : l.energieMJ + " MJ: " + l.gebrochen + " von " + l.scheiben + " Scheiben brachen, die fernste in " + l.innenM + " m, die nächste stehende in " + l.aussenM + " m" + (l.radiusM ? " → R " + l.radiusM + " m (R ÷ ∛W " + l.jeW3 + ")" : " — kein Radius zwischen zwei Scheiben")))
                        .join(" · ");
                    if (d.gemessen < v) return L.umfang(2, d.gemessen, "nur " + d.gemessen + " von " + v + " Ladungen verschiedener Energie tragen einen Schadensradius (" + je + ")");
                    L.gemessen(2, { radius_abw_pct: d.radius_abw_pct }, { erzeugt: d.gemessen, welt: { gebrochen: d.gebrochen }, taeter: "SCHADENSRADIUS gegen ∛W (die Welt: R ∝ W^" + d.hoch + "): " + je });
                });
                await L.je(3, async () => L.leser(3, "Rost je Ort: die Nässe-Dosis des Alters ist EIN Zähler der Welt (stamm/bild-himmel.js:3060 `_naesseTakt`, worldMeta.nassTage " + z.nassTage + ") — kein Leser der Nässe am See gegen die Wüste"));
                await L.je(4, async () => L.leser(4, "Verhüttung: kein Ofen-Gesetz liest eine erreichte Temperatur, die Stoff-Tafel trägt " + z.erz.length + " Erz-Zeilen von " + z.zeilen + " (stamm/bau-vorlagen.js:1619)"));
                await L.je(6, async () => L.umfang(6, 1, "die Sitzung hält einen Planeten (" + z.saat + ")"));
                // S5 DIE SAATEN (H.seite.SAATEN, sitzung-seite.js): je Saat der Satz „neue welt saat <s>“, die Welt wechselt am Ort; je Saat
                // die Stoff-Tafel (Zeilen, Erz-Zeilen) und die Siedlungen der Welt. Zuletzt; 20 s bleiben dem Gang zur Preis-Pose (R3).
                await L.je(5, async () => {
                    const v = P.sprossen[5].umfang.verlangt;
                    const arg = { stamm: P.leiter + "-s5", n: v, bis: Date.now() + Math.max(0, (L.rest() - 20) * 1000) };
                    const s = await L.ev("return await (" + H.seite.SAATEN + ")(r, T, " + JSON.stringify(arg) + ", (r) => { const z = (" + zaehlen + ")(r); return [z.zeilen, z.erz.length, Object.keys((r.state.worldMeta || {}).settlementCells || {}).length]; });", Math.max(5, L.rest() - 2));
                    if (s.fehler) throw new Error(s.fehler);
                    L.zeile("reaktion S5 Saaten " + JSON.stringify(s));
                    const zeit = "je Saat " + (s.msJe.join(" · ") || "—") + " ms, Heimweg " + s.heimweg.ms + " ms (zurück " + s.heimweg.zurueck + ", Versatz " + s.heimweg.versatz + " m)";
                    const je = "Stoff-Zeilen/Erz-Zeilen/Siedlungen je Saat " + ([...new Set(s.je.map((x) => x.z.join("/")))].join(" · ") || "—");
                    if (s.je.length < v) return L.umfang(5, s.je.length, "die Welt wechselte am Ort in " + s.je.length + " von " + v + " Saaten (" + je + "; " + zeit + "; Ende: " + s.grund + ")");
                    L.leser(5, "Werkstoff-Inventar je Siedlung: keine Siedlung trägt Werkstoffe aus Lagerstätte und Ofen — die Stoff-Tafel ist EINE für jede Saat (stamm/bau-vorlagen.js:1619), kein Ofen-Gesetz liest eine erreichte Temperatur — in " + v + " Saaten (" + je + "; " + zeit + ")", s.je.length);
                });
            },
        })
    );

    // ─────────── same.physik.flug — Ballistik ───────────
    // S1 an der Mess-Wiese: ein Steinwürfel 0,1 m und eine Feder (Federn-Platte 0,25 × 0,003 × 0,05 m) als freie Körper des Lösers, je aus
    // 1,5 m mit 10 m/s unter 45° geworfen (`_freiSchritt`, FIXED_DT) — die Weite bis zum Grund gegen die Rechnung mit Luftwiderstand
    // (ρ Luft 1,2 kg/m³, c_w Würfel 1,05, Platte quer 1,17, Masse aus dem Löser). Der Löser kennt keine Luft: die Feder fliegt wie der Stein.
    LEITERN.push(
        leiter({
            leiter: "same.physik.flug",
            sek: 40,
            mutiert: true,
            pfad: ["scripts/werkbank.cjs", "stamm/koerper-frei.js", "stamm/siedlung-satz.js", "stamm/werkstatt-bauen.js", "stamm/kreatur-leben.js", "stamm/gelaende-boden.js", "stamm/gelaende-kollision.js", "stamm/koerper-bewegung.js", "stamm/wasser-hydro.js", "stamm/stoff-material.js"],
            welt: [{ wort: "weg_m", ab: 1, was: "Flugweite des Steins in der Welt (m)" }],
            sprossen: {
                1: {
                    soll: [
                        { wort: "stein_abw_pct", richtung: "≤", wert: 10, wortlaut: "Wurfweiten gegen Rechnung ±10 %", feld: "richter" },
                        { wort: "feder_abw_pct", richtung: "≤", wert: 10, wortlaut: "Wurfweiten gegen Rechnung ±10 %", feld: "richter" },
                    ],
                    umfang: { verlangt: 1, einheit: "Wurf", wortlaut: "1 Wurf", feld: "umfang" },
                },
                2: {
                    soll: [
                        { wort: "ablenkung_abw_pct", richtung: "≤", wert: 25, wortlaut: "Ablenkung im Band realer Messungen ±25 %", feld: "richter" },
                        { wort: "abprall_abw_pct", richtung: "≤", wert: 10, wortlaut: "Abprall Rasen/Beton nach Stoßzahl ±10 %", feld: "richter" },
                    ],
                },
                3: { soll: [{ wort: "tauch_abw_pct", richtung: "≤", wert: 5, wortlaut: "Tauchtiefe = Dichteverhältnis ±5 %", feld: "richter" }] },
                4: { soll: [{ wort: "fahrt_abw_pct", richtung: "≤", wert: 15, wortlaut: "Mindestfahrt gegen √(2mg/(ρ·S·C_L)) ±15 %", feld: "richter" }] },
                5: { auge: { pose: "stadt-voll third · Straßenschlucht im Lee, ein Blatt Papier im Wind", vorbild: "Video eines Blatts Papier, das im Lee einer Straßenschlucht umdreht (Blindpaar)" } },
                6: {
                    soll: [{ wort: "weite_abw_pct", richtung: "≤", wert: 10, wortlaut: "Wurfweite ∝ 1/g ±10 %", feld: "richter" }],
                    umfang: { verlangt: 100, einheit: "Planeten", wortlaut: "N = 100 Planeten", feld: "richter" },
                },
            },
            lauf: async function flugLauf(H, P, L) {
                const ev = (f, a, s) => L.ev("return await (" + f + ")(r, " + JSON.stringify(a === undefined ? null : a) + ");", s || 50);
                async function wurf(r) {
                    const s = r.state, A = AnazhRealm, F = A.FREI, dt = A.FIXED_DT, m = s.playerMesh, g = Number.isFinite(s.gravity) ? -s.gravity : 9.81;
                    const fuss = m.position.y - A.PLAYER_FOOT_OFFSET, kand = [];
                    // die Bahn: 2–18 m vom Spieler in der ebensten freien von acht Richtungen (±0,4 m, kein Bau binnen 1,5 m, kein Wasser)
                    let bahn = null;
                    for (let k = 0; k < 8 && !bahn; k++) {
                        const a = (k * Math.PI) / 4, [ux, uz] = [Math.sin(a), Math.cos(a)];
                        const x0 = m.position.x + 2 * ux, z0 = m.position.z + 2 * uz, g0 = r._koerperBodenUnter(x0, fuss + 1, z0);
                        if (!Number.isFinite(g0)) continue;
                        let gut = true;
                        for (let t = 0; t <= 16 && gut; t += 1) {
                            const x = x0 + t * ux, z = z0 + t * uz, gt = r._koerperBodenUnter(x, g0 + 1, z);
                            kand.length = 0;
                            r._blockerNahe(x, z, 1.5, -Infinity, kand);
                            gut = Number.isFinite(gt) && Math.abs(gt - g0) <= 0.4 && !r._nassAt(x, z) && !kand.some((e) => (e.blockerAABBs || []).some((b) => r._boxAbstand2(b, x, z) <= 2.25));
                        }
                        if (gut) bahn = { x0, z0, g0, ux, uz };
                    }
                    if (!bahn) return { fehler: "keine ebene freie Bahn von 16 m um den Spieler" };
                    if (!(s.materials && s.materials.stein && s.materials.federn)) return { fehler: "die Welt trägt die Zeile stein oder federn nicht (state.materials)" };
                    const plaene = {
                        k2_wurf_stein: { name: "k2_wurf_stein", label: "k2_wurf_stein", frei: true, builtIn: false, parts: [{ shape: "box", material: "stein", size: { x: 0.1, y: 0.1, z: 0.1 }, position: { x: 0, y: 0.05, z: 0 } }] },
                        k2_wurf_feder: { name: "k2_wurf_feder", label: "k2_wurf_feder", frei: true, builtIn: false, parts: [{ shape: "box", material: "federn", size: { x: 0.25, y: 0.003, z: 0.05 }, position: { x: 0, y: 0.0015, z: 0 } }] },
                    };
                    const RHO = 1.2, v0 = 10, h0 = 1.5, c45 = Math.SQRT1_2;
                    // die Rechnung: m dv/dt = −m g ŷ − ½ ρ c_w A |v| v, bis die Unterkante den Grund erreicht (RK-frei, dt 1 ms)
                    const rechnung = (mk, cw, fl, hy) => {
                        let [x, y, vx, vy] = [0, h0 + bahn.g0, v0 * c45, v0 * c45];
                        for (let i = 0; i < 20000; i++) {
                            const v = Math.hypot(vx, vy), k = (0.5 * RHO * cw * fl * v) / mk;
                            [vx, vy] = [vx - k * vx * 0.001, vy - (g + k * vy) * 0.001];
                            [x, y] = [x + vx * 0.001, y + vy * 0.001];
                            const gr = r._koerperBodenUnter(bahn.x0 + x * bahn.ux, y, bahn.z0 + x * bahn.uz);
                            if (vy < 0 && y - hy <= (Number.isFinite(gr) ? gr : bahn.g0)) return x;
                        }
                        return null;
                    };
                    const werfe = (typ) => {
                        s.blueprints[typ] = plaene[typ];
                        const e = r.spawnArchitecture(typ, { x: bahn.x0, y: bahn.g0 + 3, z: bahn.z0 }, { precise: true, silent: true });
                        const K = e && e._frei;
                        if (!K) {
                            if (e) r.removeArchitecture(e, { still: true });
                            return { fehler: typ + " trägt keinen freien Körper" };
                        }
                        try {
                            K.p[0] = bahn.x0;
                            K.p[1] = bahn.g0 + h0;
                            K.p[2] = bahn.z0;
                            K.v[0] = v0 * c45 * bahn.ux;
                            K.v[1] = v0 * c45;
                            K.v[2] = v0 * c45 * bahn.uz;
                            K.w[0] = K.w[1] = K.w[2] = 0;
                            r._freiWecken(K);
                            K.grund = null;
                            r._freiLage(K);
                            let t = 0, weite = null;
                            for (let i = 0; i < 480 && weite === null; i++) {
                                r._freiSchritt(dt);
                                t += dt;
                                let mn = Infinity, mx = 0, mz = 0;
                                for (let j = 1; j < K.pw.length; j += 3) if (K.pw[j] < mn) [mn, mx, mz] = [K.pw[j], K.pw[j - 1], K.pw[j + 1]];
                                if (t > 0.1 && K.v[1] <= 0 && mn - r._koerperBodenUnter(mx, mn + 0.5, mz) <= F.spalt) weite = (K.p[0] - bahn.x0) * bahn.ux + (K.p[2] - bahn.z0) * bahn.uz;
                            }
                            return { weite, t: Math.round(t * 1000) / 1000, m: K.m, hy: K.hy };
                        } finally {
                            r.removeArchitecture(e, { still: true });
                            delete s.blueprints[typ];
                        }
                    };
                    const st = werfe("k2_wurf_stein"), fe = werfe("k2_wurf_feder");
                    if (st.fehler || fe.fehler) return { fehler: st.fehler || fe.fehler };
                    const rs = rechnung(st.m, 1.05, 0.01, st.hy), rf = rechnung(fe.m, 1.17, 0.0125, fe.hy);
                    const abw = (a, b) => (Number.isFinite(a) && b > 0 ? Math.round((10000 * Math.abs(a - b)) / b) / 100 : null);
                    const r3 = (v) => (Number.isFinite(v) ? Math.round(v * 1000) / 1000 : null);
                    return {
                        stein: { weite: r3(st.weite), rechnung: r3(rs), t: st.t, m: r3(st.m) },
                        feder: { weite: r3(fe.weite), rechnung: r3(rf), t: fe.t, m: r3(fe.m) },
                        stein_abw_pct: abw(st.weite, rs),
                        feder_abw_pct: abw(fe.weite, rf),
                        wuerfe: (Number.isFinite(st.weite) ? 1 : 0) + (Number.isFinite(fe.weite) ? 1 : 0),
                    };
                }
                await L.ort("wiese", "ego");
                L.preisPose("wiese", "ego");
                await L.je(1, async () => {
                    const w = await ev(wurf, null, Math.max(5, L.rest() - 6));
                    L.zeile("Stein und Feder, 10 m/s unter 45°: " + JSON.stringify(w));
                    if (w.fehler) throw new Error(w.fehler);
                    L.gemessen(1, { stein_abw_pct: w.stein_abw_pct, feder_abw_pct: w.feder_abw_pct }, { erzeugt: w.wuerfe, welt: { weg_m: w.stein.weite }, taeter: "Feder " + w.feder.weite + " m gegen Rechnung " + w.feder.rechnung + " m, Stein " + w.stein.weite + " m gegen " + w.stein.rechnung + " m — der Löser kennt keine Luft (stamm/koerper-frei.js:421 `_freiSchritt`)" });
                });
                const ohneLuft = "der Löser trägt nur Schwere, Kontakt und Reibung (stamm/koerper-frei.js:421 `_freiSchritt`)";
                await L.je(2, async () => L.leser(2, "Drall: keine Magnus-Kraft am Körper — " + ohneLuft));
                await L.je(3, async () => L.leser(3, "Auftrieb am freien Körper: der Löser liest kein Wasser — " + ohneLuft));
                await L.je(4, async () => L.leser(4, "Auftrieb am Flügel: kein Gesetz des Auftriebs — " + ohneLuft));
                await L.je(5, async () => L.leser(5, "Wind am Körper: der Löser liest das EINE Wind-Feld nicht (stamm/stoff-material.js:233 `_windAt`) — " + ohneLuft));
                const saat = await L.ev("return r.state.worldMeta && r.state.worldMeta.seed;", 20);
                await L.je(6, async () => L.umfang(6, 1, "die Sitzung hält einen Planeten (Saat " + saat + ")"));
            },
        })
    );

    // ─────────── same.physik.stoffe — die Stoff-Tafel ───────────
    // S1 (Auge): zehn graue Würfel 0,2 m aus zehn Zeilen der Tafel fallen an der Mess-Wiese aus 2 m (freie Körper des Lösers), das Bild liegt
    // ab, wenn sie liegen; die Jury urteilt am Gerät. S2–S6: die Zeilen der Tafel (`STOFF_GESETZ.ZEILEN`) und die Stoffe der Welt
    // (`state.materials`) gezählt gegen 10² … 10⁶.
    LEITERN.push(
        leiter({
            leiter: "same.physik.stoffe",
            sek: 40,
            mutiert: true,
            pfad: ["scripts/werkbank.cjs", "schmiede-core.js", "stamm/bau-buch.js", "stamm/bau-vorlagen.js", "stamm/koerper-frei.js", "stamm/siedlung-satz.js", "stamm/werkstatt-bauen.js", "stamm/gelaende-boden.js"],
            welt: [{ wort: "stoffe_welt", ab: 1, was: "Stoffe, die die Messung in der Welt liest" }],
            sprossen: {
                1: {
                    soll: [{ wort: "jury_pct", richtung: "≥", wert: 70, wortlaut: "benennt den Stoff ≥ 70 %", feld: "richter" }],
                    umfang: { verlangt: 10, einheit: "Stoffe", wortlaut: "10 Stoffe", feld: "umfang" },
                    auge: { pose: "wiese ego · zehn graue Würfel 0,2 m (stein holz eisen bronze stahl quarz leder knochen blech eis) aus 2 m gefallen, 5 m vor dem Spieler", vorbild: "Film und Ton realer grauer Gegenstände derselben Stoffe beim Fallen, Brechen, Brennen (Blind-Jury)" },
                },
                2: {
                    soll: [{ wort: "abw_pct", richtung: "≤", wert: 10, wortlaut: "Stichprobe 50 Zeilen ±10 % gegen Ingenieurs-Tafeln", feld: "richter" }],
                    umfang: { verlangt: 100, einheit: "Zeilen der Stoff-Tafel", wortlaut: "10²", feld: "umfang" },
                },
                3: {
                    soll: [{ wort: "abw_pct", richtung: "≤", wert: 15, wortlaut: "Verhalten gegen Handbuch ±15 %", feld: "richter" }],
                    umfang: { verlangt: 1000, einheit: "Stoffe der Welt", wortlaut: "10³ Werkstoffe einer Zivilisation, je Epoche", feld: "umfang" },
                },
                4: {
                    soll: [{ wort: "reihe_pct", richtung: "≥", wert: 90, wortlaut: "Reihenfolge von Dichte und Schmelzpunkt stimmt ≥ 90 %", feld: "richter" }],
                    umfang: { verlangt: 1e4, einheit: "Stoffe der Welt", wortlaut: "10⁴ Stoffe einer Welt", feld: "umfang" },
                },
                5: {
                    soll: [{ wort: "reihe_pct", richtung: "≥", wert: 90, wortlaut: "Reihenfolge ≥ 90 %", feld: "richter" }],
                    umfang: { verlangt: 1e5, einheit: "Stoffe der Welt", wortlaut: "10⁵ über Welten", feld: "umfang" },
                },
                6: {
                    soll: [{ wort: "denkbar_pct", richtung: "≥", wert: 70, wortlaut: "für physikalisch denkbar ≥ 70 %", feld: "richter" }],
                    umfang: { verlangt: 1e6, einheit: "Stoffe der Welt", wortlaut: "10⁶+ fremde Stoffe", feld: "umfang" },
                },
            },
            lauf: async function stoffeLauf(H, P, L) {
                function zaehlen(r) {
                    const SG = globalThis.__schmiedeCore && globalThis.__schmiedeCore.STOFF_GESETZ;
                    return { zeilen: SG && SG.ZEILEN ? Object.keys(SG.ZEILEN).length : 0, stoffe: Object.keys(r.state.materials || {}).length };
                }
                // zehn graue Würfel, je eine Zeile, in einer Reihe quer zum Blick 5 m vor dem Spieler aus 2 m fallen gelassen (2 s Löser)
                async function wuerfel(r, o) {
                    const s = r.state, A = AnazhRealm, dt = A.FIXED_DT, m = s.playerMesh, cam = s.camera;
                    const d = cam.getWorldDirection(new T.Vector3());
                    const [ux, uz] = [d.x / (Math.hypot(d.x, d.z) || 1), d.z / (Math.hypot(d.x, d.z) || 1)];
                    const fuss = m.position.y - A.PLAYER_FOOT_OFFSET;
                    const plaene = new Set(Object.keys(s.blueprints));
                    const gesetzt = [];
                    // die zehn Stoffe: die gewünschten, die die Welt als Zeile trägt (`state.materials`), aufgefüllt aus der Tafel
                    const M = s.materials || {}, SG = globalThis.__schmiedeCore.STOFF_GESETZ;
                    const stoffe = o.stoffe.filter((n) => M[n]);
                    for (const n of Object.keys(SG.ZEILEN)) if (stoffe.length < o.stoffe.length && M[n] && !stoffe.includes(n)) stoffe.push(n);
                    for (let i = 0; i < stoffe.length; i++) {
                        const typ = "k2_grau_" + stoffe[i];
                        s.blueprints[typ] = { name: typ, label: typ, frei: true, builtIn: false, parts: [{ shape: "box", material: stoffe[i], color: 0x808080, size: { x: 0.2, y: 0.2, z: 0.2 }, position: { x: 0, y: 0.1, z: 0 } }] };
                        const q = (i - (stoffe.length - 1) / 2) * 0.5;
                        const x = m.position.x + 5 * ux - q * uz, z = m.position.z + 5 * uz + q * ux;
                        const g = r._koerperBodenUnter(x, fuss + 1, z);
                        const e = r.spawnArchitecture(typ, { x, y: (Number.isFinite(g) ? g : fuss) + 2.5, z }, { precise: true, silent: true });
                        if (e && e._frei) gesetzt.push(e);
                        else if (e) r.removeArchitecture(e, { still: true });
                    }
                    for (let i = 0; i < 120; i++) r._freiSchritt(dt);
                    const liegen = gesetzt.filter((e) => e._frei.schlaf).length;
                    // die Würfel bleiben für das Bild; danach räumt `weg` sie nach ihrer Kennung
                    const mitte = [m.position.x + 5 * ux, fuss + 0.1, m.position.z + 5 * uz];
                    const neu = Object.keys(s.blueprints).filter((k) => !plaene.has(k));
                    return { n: gesetzt.length, stoffe: gesetzt.map((e) => e._frei.stoff), liegen, mitte, kamera: [m.position.x - 1 * ux, fuss + 1.7, m.position.z - 1 * uz], ids: gesetzt.map((e) => e.id), plaene: neu };
                }
                function weg(r, o) {
                    const s = r.state, ids = new Set(o.ids);
                    const E = (s.architectures || []).filter((e) => ids.has(e.id));
                    for (const e of E) r.removeArchitecture(e, { still: true });
                    for (const k of o.plaene) if (/^k2_grau_/.test(k)) delete s.blueprints[k];
                    return E.length;
                }
                await L.ort("wiese", "ego");
                L.preisPose("wiese", "ego");
                const z = await L.ev("return (" + zaehlen + ")(r);", 30);
                L.zeile("Stoff-Tafel und Stoffe der Welt: " + JSON.stringify(z));
                await L.je(1, async () => {
                    if (z.zeilen < P.sprossen[1].umfang.verlangt) return L.umfang(1, z.zeilen, "die Stoff-Tafel trägt " + z.zeilen + " Zeilen");
                    const stoffe = ["stein", "holz", "eisen", "bronze", "stahl", "quarz", "leder", "knochen", "blech", "eis"];
                    const w = await L.ev("return await (" + wuerfel + ")(r, " + JSON.stringify({ stoffe }) + ");", 40);
                    L.zeile("zehn graue Würfel: " + JSON.stringify(w));
                    try {
                        await L.auge(1, { b: { px: w.kamera[0], py: w.kamera[1], pz: w.kamera[2], lx: w.mitte[0], ly: w.mitte[1], lz: w.mitte[2] }, erzeugt: w.n });
                    } finally {
                        await L.ev("return (" + weg + ")(r, " + JSON.stringify({ ids: w.ids, plaene: w.plaene }) + ");", 30);
                    }
                });
                await L.je(2, async () => L.umfang(2, z.zeilen, "die Stoff-Tafel trägt " + z.zeilen + " Zeilen (schmiede-core STOFF_GESETZ.ZEILEN)"));
                await L.je(3, async () => L.umfang(3, z.stoffe, "die Welt kennt " + z.stoffe + " Stoffe (state.materials), keiner entsteht aus einer Reaktion"));
                await L.je(4, async () => L.umfang(4, z.stoffe, "die Welt kennt " + z.stoffe + " Stoffe (state.materials)"));
                await L.je(5, async () => L.umfang(5, z.stoffe, "die Welt kennt " + z.stoffe + " Stoffe (state.materials), ein Planet"));
                await L.je(6, async () => L.umfang(6, z.stoffe, "die Welt kennt " + z.stoffe + " Stoffe (state.materials), ein Planet"));
            },
        })
    );
}

// ═══════════════════════════════════════ Perspektive entfaltung ═══════════════════════════════════════
{
    // ─────────── same.entfaltung.gleichheit — Gleichheit über Geräte und Peers ───────────
    // Jede Sprosse vergleicht ZWEI Geräte oder ZWEI Peers an derselben Koordinate; die Probe fährt an EINEM Gerät in EINER Sitzung.
    // Gezählt in der Welt: Peers der Leitung (`state.p2p.peers`, dirigent-kern.js:541), die Saat (`worldMeta.seed`), der Planet
    // (`_planetSamen`, gelaende-chunks.js:672) und die Epoche des Orts (`_gelaende().ort.teil.zeitMa`, die Reise feld-leben.js:1277).
    // S1/S2/S4: die Welt trägt den Umfang, kein Leser vergleicht die Geräte (leser); S3/S5–S8: Umfang nicht erzeugt (gezählt).
    LEITERN.push(
        leiter({
            leiter: "same.entfaltung.gleichheit",
            sek: 20,
            pfad: ["scripts/werkbank.cjs", "stamm/dirigent-kern.js", "stamm/netz-p2p.js", "stamm/gelaende-chunks.js", "stamm/gelaende-boden.js", "stamm/feld-leben.js"],
            welt: [{ wort: "posen", ab: 1, was: "Posen, an denen beide Geräte die Welt lasen" }],
            sprossen: {
                1: { soll: [{ wort: "horizont_px", richtung: "≤", wert: 2, wortlaut: "Horizont-Linie ≤ 2 px Abweichung", feld: "richter" }] },
                2: { soll: [{ wort: "klassen_diff_pct", richtung: "≤", wert: 1, wortlaut: "Klassen-Masken-Diff ≤ 1 %", feld: "richter" }] },
                3: {
                    soll: [{ wort: "personen_m", richtung: "≤", wert: 0.5, wortlaut: "Personen ≤ 0,5 m nach 10 min", feld: "tiefe" }],
                    umfang: { verlangt: 2, einheit: "Geräte in EINER Sitzung", wortlaut: "zwei Geräte in EINER Sitzung", feld: "richter" },
                },
                4: {
                    soll: [{ wort: "posen_pct", richtung: "≥", wert: 99, wortlaut: "Klassen-Diff ≤ 1 % an ≥ 99 % der Posen", feld: "richter" }],
                    umfang: { verlangt: 100, einheit: "zufällige Posen", wortlaut: "100 zufällige Posen", feld: "umfang" },
                },
                5: {
                    soll: [{ wort: "posen_pct", richtung: "≥", wert: 99, wortlaut: "Klassen-Diff ≤ 1 % an ≥ 99 % der Posen", feld: "richter", aus: 4 }],
                    umfang: { verlangt: 100, einheit: "Saaten", wortlaut: "100 Saaten × 10 Posen", feld: "umfang" },
                },
                6: {
                    soll: [{ wort: "stichproben_pct", richtung: "≥", wert: 99, wortlaut: "Klassen-Diff ≤ 1 % an ≥ 99 % der Stichproben", feld: "richter" }],
                    umfang: { verlangt: 2, einheit: "Peers", wortlaut: "zwei Geräte, zwei Peers", feld: "tiefe" },
                },
                7: {
                    soll: [
                        { wort: "diff_pct", richtung: "≤", wert: 1, wortlaut: "Diff ≤ 1 % je Epoche", feld: "richter" },
                        { wort: "rueckreise_diff_pct", richtung: "≤", wert: 0, wortlaut: "Zeitreise hin und zurück: Diff = 0", feld: "richter" },
                    ],
                    umfang: { verlangt: 10, einheit: "Epochen an einem Ort", wortlaut: "ein Ort in 10 Epochen", feld: "umfang" },
                },
                8: {
                    soll: [{ wort: "stichproben_pct", richtung: "≥", wert: 99.9, wortlaut: "Diff ≤ 1 % an ≥ 99,9 %", feld: "richter" }],
                    umfang: { verlangt: 1e11, einheit: "Systeme", wortlaut: "Galaxie: 10¹¹ Systeme", feld: "umfang" },
                },
            },
            lauf: async function gleichheitLauf(H, P, L) {
                const w = await L.ev(
                    "const p = r.state.p2p, m = r.state.worldMeta || {}, teil = r._gelaende().ort.teil;" +
                        " return { peers: p && p.peers ? p.peers.size : 0, saat: m.seed, planet: r._planetSamen(), zeitMa: teil && Number.isFinite(teil.zeitMa) ? teil.zeitMa : 0, version: r.constructor.VERSION };"
                );
                L.zeile("die Sitzung: " + JSON.stringify(w));
                const geraete = 1 + w.peers;
                const akte = "vision/buche-2.cjs:261 (je Standardgerät der Sprosse: der Fingerabdruck des Geräts an fester Pose neben dem des anderen, desselben Kopfs)";
                await L.je(1, async () =>
                    L.leser(1, "Horizont-Linie G2 ↔ G3 an gleicher Pose: die Probe fährt an einem Gerät, kein Leser legt die Linie je Gerät in die Akte und vergleicht sie über Radeon ↔ GTX — Haken " + akte)
                );
                await L.je(2, async () =>
                    L.leser(2, "Klassen-Masken-Diff A ↔ B und Radeon ↔ GTX: die Sitzung trägt " + geraete + " Spieler an einem Gerät (Peers " + w.peers + "), kein Leser vergleicht die Klassen-Maske zweier Spieler oder Geräte an derselben Pose — Haken " + akte)
                );
                await L.je(3, async () => {
                    if (geraete >= 2) return L.leser(3, "Masken + Positionen zweier Geräte in EINER Sitzung: " + geraete + " Geräte, kein Leser vergleicht ihre Personen-Lagen — Haken " + akte, geraete);
                    L.umfang(3, geraete, "die Sitzung trägt ein Gerät ohne Peer (state.p2p.peers " + w.peers + ") — kein zweites Gerät in derselben Sitzung");
                });
                await L.je(4, async () =>
                    L.leser(4, "Klassen-Diff an 100 zufälligen Posen über Radeon ↔ GTX: kein Leser vergleicht die Klassen-Maske je Pose über die Geräte — Haken " + akte)
                );
                await L.je(5, async () => L.umfang(5, new Set([String(w.saat)]).size, "die Sitzung trägt eine Saat (" + w.saat + ") — die Leiter teilt EINE Welt, kein Wechsel der Saat im Lauf"));
                await L.je(6, async () => {
                    if (geraete >= 2) return L.leser(6, "Klassen-Diff zweier Peers an 1 000 Koordinaten: kein Leser vergleicht die Klassen-Maske der Peers — Haken " + akte, geraete);
                    L.umfang(6, geraete, "die Sitzung trägt einen Peer (state.p2p.peers " + w.peers + ") — kein zweiter Peer");
                });
                await L.je(7, async () =>
                    L.umfang(7, new Set([w.zeitMa]).size, "die Welt der Sitzung steht in einer Epoche (zeitMa " + w.zeitMa + "): die Epoche wechselt nur der Satz reise als eigene Welt (stamm/feld-leben.js:1277), nie der Ort in der Welt der Sitzung")
                );
                await L.je(8, async () => L.umfang(8, new Set([String(w.planet)]).size, "die Welt trägt einen Planeten (Samen " + w.planet + ") — kein System, keine Galaxie"));
                L.preisPose("wiese", "ego");
            },
        })
    );

    // ─────────── same.entfaltung.schirm — Schirm statt Sack ───────────
    // An der dichtesten Pose der Sitzung (stadt-voll, Third; dort fährt der Preis, R3) zählt die Probe in der Welt: Bauten (ohne
    // Natur, `_istNatur` vegetation-baum.js:2068) im Frustum der Spiel-Kamera, bis 30 km und überhaupt, Menschen der Siedlungen
    // (`_bewohnerSiedlungen` siedlung-bewohner.js:277) gesamt und im Bild. Erreicht ein Umfang die Sprosse, schießt sie das Bild
    // für das Blindurteil (S2–S6 auge); sonst urteilt `L.umfang`. S1 trägt g6.js (pbProbe).
    LEITERN.push(
        leiter({
            leiter: "same.entfaltung.schirm",
            sek: 50,
            pfad: ["scripts/werkbank.cjs", "spec/profiband/haushalt.json", "stamm/siedlung-bewohner.js", "stamm/siedlung-satz.js", "stamm/vegetation-baum.js", "stamm/koerper-bewegung.js"],
            welt: [{ wort: "bilder", ab: 30, was: "Bilder des Loops im Strom der Zelle" }],
            bestehend: [1],
            sprossen: {
                2: {
                    soll: [{ wort: "p95_verhaeltnis", richtung: "≤", wert: 1.1, wortlaut: "p95(×10) ÷ p95(×1) ≤ 1,10", feld: "richter" }],
                    umfang: { verlangt: 1000, einheit: "Häuser im Blick", wortlaut: "10³ Häuser im Blick", feld: "umfang" },
                    auge: { pose: "stadt-voll Third, Mittag · Sonne · Sommer (Bühne der Werkbank)", vorbild: "Fotos echter Altstädte im Blindtest (≥ 50 % der Häuser plausibel)" },
                },
                3: {
                    soll: [{ wort: "steigung_pct", richtung: "≤", wert: 10, wortlaut: "Steigung ≤ 10 %", feld: "preis" }],
                    umfang: { verlangt: 10000, einheit: "Gebäude im Bild", wortlaut: "10⁴ Gebäude und 10⁴ Menschen im Bild", feld: "umfang" },
                    auge: { pose: "stadt-voll Third, Mittag (Bühne der Werkbank)", vorbild: "Foto einer Großstadt-Kreuzung (Dichte-Histogramm)" },
                },
                4: {
                    soll: [{ wort: "p95_verhaeltnis", richtung: "≤", wert: 1.1, wortlaut: "p95 Skyline ÷ p95 leere Ebene ≤ 1,10", feld: "richter" }],
                    umfang: { verlangt: 1e5, einheit: "Gebäude bis 30 km", wortlaut: "Skyline mit 10⁵ Gebäuden bis 30 km", feld: "umfang" },
                    auge: { pose: "stadt-voll Third, Nacht und Mittag (Bühne der Werkbank)", vorbild: "Skyline-Fotos Hongkong, Manhattan, Shanghai (Blindtest ≥ 40 % Foto)" },
                },
                5: {
                    soll: [{ wort: "kosten_sprung_pct", richtung: "≤", wert: 10, wortlaut: "Abstieg ohne Kosten-Sprung > 10 %", feld: "preis" }],
                    umfang: { verlangt: 1e7, einheit: "Gebäude", wortlaut: "Tokio-Maß: 10⁷ Gebäude", feld: "umfang" },
                    auge: { pose: "Luftbild aus 1 km über der Stadt und auf der Straße", vorbild: "Luftbild Tokio (Blindtest ≥ 40 % Foto)" },
                },
                6: {
                    soll: [{ wort: "steigung_pct", richtung: "≤", wert: 10, wortlaut: "Steigung 10⁷ → 10⁹ Menschen ≤ 10 %", feld: "preis" }],
                    umfang: { verlangt: 1e9, einheit: "Menschen", wortlaut: "10⁹ Menschen über 1 000 km", feld: "umfang" },
                    auge: { pose: "aus Fenster, Ebene und 5 km Höhe der Hyperstadt", vorbild: "Fotos realer Megastädte im Blindtest (≥ 40 %)" },
                },
                7: {
                    soll: [{ wort: "p95_verhaeltnis", richtung: "≤", wert: 1.1, wortlaut: "Kosten-Kurve p95 über neun Größenordnungen bei fester Pose ≤ 1,10", feld: "richter" }],
                    umfang: { verlangt: 1e10, einheit: "Menschen je Welt", wortlaut: "10¹⁰ Menschen je Welt", feld: "umfang" },
                },
            },
            lauf: async function schirmLauf(H, P, L) {
                await L.ort("stadt-voll", "third");
                L.preisPose("stadt-voll", "third");
                const z = await L.ev(
                    "r._loopCamera(performance.now()); const c = r.state.camera; c.updateMatrixWorld();" +
                        " const F = new T.Frustum().setFromProjectionMatrix(new T.Matrix4().multiplyMatrices(c.projectionMatrix, c.matrixWorldInverse));" +
                        " const pm = r.state.playerMesh.position, v = new T.Vector3(); let blick = 0, bis30 = 0, alle = 0;" +
                        " for (const a of r.state.architectures || []) { if (!a || !a.position || r._istNatur(a)) continue; alle++;" +
                        " if (Math.hypot(a.position.x - pm.x, a.position.z - pm.z) <= 30000) bis30++; v.set(a.position.x, a.position.y + 2, a.position.z); if (F.containsPoint(v)) blick++; }" +
                        " let menschen = 0, imBild = 0, sied = 0; for (const S of (r._bewohnerSiedlungen || new Map()).values()) { sied++;" +
                        " menschen += S.liste ? S.liste.length : S.plan && S.plan.slots ? S.plan.slots.length : 0;" +
                        " for (const b of S.liste || []) if (b.leib && F.containsPoint(b.leib.position)) imBild++; }" +
                        " return { blick, bis30, alle, menschen, imBild, sied, ort: [Math.round(pm.x), Math.round(pm.z)] };"
                );
                L.zeile("stadt-voll Third: " + JSON.stringify(z));
                const pose = "die Stadt-Pose (stadt-voll Third, " + z.ort.join("/") + ")";
                const je = async (nr, erzeugt, was) => {
                    if (erzeugt < P.sprossen[nr].umfang.verlangt) return L.umfang(nr, erzeugt, was);
                    if (P.sprossen[nr].auge) return L.auge(nr, { erzeugt });
                    L.leser(nr, "Kosten-Kurve p95 über neun Größenordnungen bei fester Pose: kein Leser stellt den Weltinhalt an fester Pose in Stufen", erzeugt);
                };
                await L.je(2, () => je(2, z.blick, pose + " trägt " + z.blick + " Häuser im Blick (von " + z.alle + " Bauten der Welt)"));
                await L.je(3, () => je(3, z.blick, pose + " trägt " + z.blick + " Gebäude und " + z.imBild + " Menschen im Bild"));
                await L.je(4, () => je(4, z.bis30, "die Welt trägt " + z.bis30 + " Gebäude bis 30 km um " + pose));
                await L.je(5, () => je(5, z.alle, "die Welt trägt " + z.alle + " Gebäude (ohne Natur) — keine Stadt im Tokio-Maß"));
                await L.je(6, () => je(6, z.menschen, "die Welt trägt " + z.menschen + " Menschen in " + z.sied + " Siedlungen"));
                await L.je(7, () => je(7, z.menschen, "die Welt trägt " + z.menschen + " Menschen in " + z.sied + " Siedlungen — die Kosten-Kurve fände keine neun Größenordnungen"));
            },
        })
    );

    // ─────────── same.entfaltung.reise — Reise ohne Bruch ───────────
    // Der Anteil ganzer Bilder (Lücke ≤ 2 % gegen dieselbe Pose in Ruhe) je Bild der Bahn hat keinen Leser: der Strom der Sitzung trägt
    // Takt und Kosten, keine Lücke (S1–S3 leser, sobald das Tempo des Gesetzes reicht). Gezählt: das schnellste Fahrzeug des Gesetzes
    // (vehicle-core `exportDrive` je Art, wie `_bedarfSprung` studio-bruecke.js:1938), der Planet (planet-core `planetPlan` am Samen der
    // Welt, Körper der Erde wie voxel-worker.js:1159) und ob der Boden nach 2πR an denselben Ort zurückkehrt (die Höhe dort und hier).
    LEITERN.push(
        leiter({
            leiter: "same.entfaltung.reise",
            sek: 25,
            pfad: ["scripts/werkbank.cjs", "vehicle-core.js", "stamm/studio-bruecke.js", "planet-core.js", "voxel-worker.js", "stamm/gelaende-chunks.js", "stamm/gelaende-boden.js"],
            welt: [{ wort: "bilder", ab: 30, was: "Bilder des Loops im Strom der Bahn" }],
            sprossen: {
                1: { soll: [{ wort: "ganz_pct", richtung: "≥", wert: 98, wortlaut: "Anteil ganzer Bilder ≥ 98 %", feld: "richter" }] },
                2: {
                    soll: [{ wort: "ganz_pct", richtung: "≥", wert: 90, wortlaut: "≥ 90 % der Bilder ganz", feld: "tiefe" }],
                    umfang: { verlangt: 30, einheit: "km/h Fahrt", wortlaut: "Fahrt 30 km/h", feld: "umfang" },
                },
                3: {
                    soll: [
                        { wort: "ganz_pct", richtung: "≥", wert: 98, wortlaut: "≥ 98 % ganz, kein Aufploppen in 50 m, Zittern ≤ 0,5 px", feld: "tiefe" },
                        { wort: "zittern_px", richtung: "≤", wert: 0.5, wortlaut: "≥ 98 % ganz, kein Aufploppen in 50 m, Zittern ≤ 0,5 px", feld: "tiefe" },
                    ],
                    umfang: { verlangt: 120, einheit: "km/h Fahrt", wortlaut: "Fahrt 120 km/h", feld: "umfang" },
                },
                4: {
                    soll: [{ wort: "luecken_pct", richtung: "≤", wert: 0.1, wortlaut: "Lücken-Bilder ≤ 0,1 %", feld: "richter" }],
                    umfang: { verlangt: 1000, einheit: "km/h Flug", wortlaut: "Flug 1 000 km/h", feld: "umfang" },
                },
                5: {
                    soll: [{ wort: "horizont_abw_pct", richtung: "≤", wert: 5, wortlaut: "Horizont-Distanz ±5 % gegen die Geometrie", feld: "richter" }],
                    umfang: { verlangt: 40000, einheit: "km, nach denen die Reise sich schließt", wortlaut: "40 000 km: einmal um den Planeten", feld: "umfang" },
                },
                6: {
                    soll: [{ wort: "ganz_pct", richtung: "≥", wert: 98, wortlaut: "≥ 98 % ganz, kein Aufploppen in 50 m, Zittern ≤ 0,5 px", feld: "tiefe", aus: 3 }],
                    umfang: { verlangt: 3.8e5, einheit: "km Planet → Mond", wortlaut: "Planet → Mond (3,8·10⁵ km)", feld: "umfang" },
                },
                7: {
                    soll: [{ wort: "ganz_pct", richtung: "≥", wert: 98, wortlaut: "≥ 98 % ganz, kein Aufploppen in 50 m, Zittern ≤ 0,5 px", feld: "tiefe", aus: 3 }],
                    umfang: { verlangt: 1e10, einheit: "km im Sonnensystem", wortlaut: "ein Sonnensystem, 10¹⁰ km", feld: "umfang" },
                },
                8: {
                    soll: [{ wort: "ohne_bruch_pct", richtung: "≥", wert: 100, wortlaut: "100 zufällige Ziele: 100 % ohne Bruch", feld: "richter" }],
                    umfang: { verlangt: 100, einheit: "zufällige Ziele mit Landeort", wortlaut: "100 zufällige Ziele", feld: "richter" },
                },
            },
            lauf: async function reiseLauf(H, P, L) {
                const v = await L.ev(
                    "const VC = globalThis.__vehicleCore; let v = 0, wer = null;" +
                        " for (const id of Object.keys(VC.PRESETS)) if (VC.PRESETS[id] && VC.PRESETS[id].kind === 'vehicle') { const x = VC.exportDrive(VC.presetPatch(id)).vmax; if (x > v) [v, wer] = [x, id]; }" +
                        " const pm = r.state.playerMesh.position; return { kmh: v * 3.6, wer, samen: r._planetSamen(), x: pm.x, z: pm.z };"
                );
                const PC = require(require("path").resolve("planet-core.js"));
                const R = PC.planetPlan(String(v.samen), PC.PLANET_ERDE).R;
                const U = 2 * Math.PI * R;
                // DER BODEN NACH 2πR: dieselbe Stelle des Planeten, trüge die Welt eine Kugel — fünf Höhen hier und 2πR östlich
                const zu = await L.ev(
                    "const U = " + U * 1000 + ", x = " + v.x + ", z = " + v.z + "; let max = 0;" +
                        " for (let k = 0; k < 5; k++) max = Math.max(max, Math.abs(r._terrainMacroSurfaceY(x, z + 37 * k, true) - r._terrainMacroSurfaceY(x + U, z + 37 * k, true)));" +
                        " return { dh: max };"
                );
                const kmh = Math.round(v.kmh);
                L.zeile("Gesetz: schnellstes Fahrzeug " + v.wer + " " + kmh + " km/h · Planet R " + R + " km, 2πR " + Math.round(U) + " km, Höhen-Abstand dort ↔ hier " + zu.dh.toFixed(2) + " m");
                const luecke = "Anteil ganzer Bilder je Bild der Bahn (Lücke ≤ 2 % gegen dieselbe Pose in Ruhe): kein Leser — der Strom der Sitzung trägt Takt und Kosten, keine Lücke; Haken: die Bahn von /lauf (scripts/lib/zerlege-linse.cjs:488) mit dem Maß lueckeKacheln (scripts/diag-boot-stage.cjs:117) je Bild";
                await L.je(1, async () => L.leser(1, luecke));
                await L.je(2, async () => (kmh >= 30 ? L.leser(2, luecke + " (Fahrt " + v.wer + ")", kmh) : L.umfang(2, kmh, "das schnellste Fahrzeug des Gesetzes (" + v.wer + ") fährt " + kmh + " km/h")));
                await L.je(3, async () => (kmh >= 120 ? L.leser(3, luecke + " (Fahrt " + v.wer + "), dazu Zittern und Aufploppen je Bild", kmh) : L.umfang(3, kmh, "das schnellste Fahrzeug des Gesetzes (" + v.wer + ") fährt " + kmh + " km/h")));
                await L.je(4, async () =>
                    kmh >= 1000 ? L.leser(4, luecke, kmh) : L.umfang(4, kmh, "kein Flug-Gesetz: das schnellste Fahrzeug des Gesetzes (" + v.wer + ", vehicle-core exportDrive) fährt " + kmh + " km/h")
                );
                await L.je(5, async () => {
                    if (zu.dh < 0.01) return L.leser(5, "Horizont-Distanz aus 1,7 m: kein Leser nennt die Entfernung der Horizont-Linie gegen die Geometrie des Planeten", Math.round(U));
                    L.umfang(5, 0, "die Reise schließt sich nie: 2πR = " + Math.round(U) + " km östlich trägt der Boden eine andere Höhe (Δ " + zu.dh.toFixed(1) + " m) — Spiel-(x, z) ist eine Ebene, planetFlaeche (planet-core.js:2256) hat keinen Leser im Spiel");
                });
                const koerper = new Set([String(v.samen)]).size;
                await L.je(6, async () => L.umfang(6, 0, "kein Mond mit Landeort: die Welt trägt " + koerper + " Himmelskörper (den Planeten des Samens " + v.samen + ")"));
                await L.je(7, async () => L.umfang(7, 0, "kein zweiter Planet: die Welt trägt " + koerper + " Himmelskörper — keine Bahn, kein Flug zwischen Planeten"));
                await L.je(8, async () => L.umfang(8, koerper, "die Welt trägt " + koerper + " Landeort-Körper (Samen " + v.samen + ") — keine Sterne als Ziele"));
                L.preisPose("wiese", "ego");
            },
        })
    );

    // ─────────── same.entfaltung.abwesenheit — Rechnung ohne Zuschauer ───────────
    // S1 misst am Messort stadt (die Test-Stadt „dorf 7 120“): der Tag mit Zuschauer (24 Spielstunden im Takt der Leute, 0,1 s je
    // Schritt, die Uhr des Gesetzes DAY_LENGTH_DEFAULT_MINUTES), je 6 h die Lage jedes Bewohners; dann je Prüf-Stunde T: der Spieler geht
    // fort (die Leiber gehen, `_bewohnerFort` jenseits nearM × fernFaktor), die Uhr springt von T − 6 h auf T, er kommt zurück (die Ankunft
    // `_bewohnerAnkunft`) — Lage gegen den Zuschauer ≤ 1 m. S2–S7 zählen Wesen, Planeten und Epochen der Welt (Umfang).
    LEITERN.push(
        leiter({
            leiter: "same.entfaltung.abwesenheit",
            sek: 60,
            mutiert: true,
            pfad: [
                "scripts/werkbank.cjs",
                "spec/profiband/haushalt.json",
                "stamm/siedlung-bewohner.js",
                "stamm/siedlung-ort.js",
                "stamm/bild-himmel.js",
                "stamm/dirigent-takt.js",
                "stamm/studio-bruecke.js",
                "stamm/daten.js",
                "stamm/vegetation-baum.js",
                "stamm/gelaende-chunks.js",
                "scripts/lib/ausgabe-aufnahme.cjs",
            ],
            welt: [
                { wort: "weg_m", ab: 1, was: "Meter, die die Bewohner im Tag mit Zuschauer gingen" },
                { wort: "leiber_fort", ab: 1, was: "Leiber, die mit dem fortgehenden Spieler gingen (die Abwesenheit)" },
            ],
            sprossen: {
                1: {
                    soll: [{ wort: "lage_max_m", richtung: "≤", wert: 1, wortlaut: "Lage jedes Bewohners gegen den Lauf mit Zuschauer ≤ 1 m", feld: "richter" }],
                    umfang: { verlangt: 118, einheit: "Bewohner der Test-Stadt", wortlaut: "118 Bewohner einer Test-Stadt", feld: "umfang" },
                },
                2: {
                    soll: [
                        { wort: "statistik_pct", richtung: "≤", wert: 5, wortlaut: "Klassen-Statistik Rückkehr ↔ Zuschauer-Lauf ≤ 5 %", feld: "richter" },
                        { wort: "widersprueche", richtung: "≤", wert: 0, wortlaut: "Widerspruchs-Zähler = 0", feld: "richter" },
                    ],
                    umfang: { verlangt: 1e4, einheit: "Wesen (Menschen, Tiere, Wuchs)", wortlaut: "10⁴ Wesen (Menschen, Tiere, Wuchs)", feld: "umfang" },
                },
                3: {
                    soll: [{ wort: "stichproben", richtung: "≥", wert: 100, wortlaut: "wie 2 an 100 Stichproben", feld: "richter" }],
                    umfang: { verlangt: 1e6, einheit: "Menschen einer Metropole", wortlaut: "10⁶: eine Metropole", feld: "umfang" },
                },
                4: {
                    soll: [
                        { wort: "statistik_pct", richtung: "≤", wert: 10, wortlaut: "Statistik ≤ 10 % gegen Stichproben-Lauf mit Zuschauer", feld: "richter" },
                        { wort: "widersprueche", richtung: "≤", wert: 0, wortlaut: "Widersprüche = 0", feld: "richter" },
                    ],
                    umfang: { verlangt: 1e8, einheit: "Menschen eines Kontinents", wortlaut: "10⁸: ein Kontinent, 100 Jahre", feld: "umfang" },
                },
                5: {
                    soll: [
                        { wort: "zipf_exponent", richtung: "≥", wert: 0.8, wortlaut: "Stadtgrößen folgen Zipf (Exponent 0,8–1,2)", feld: "richter" },
                        { wort: "zipf_exponent_max", richtung: "≤", wert: 1.2, wortlaut: "Stadtgrößen folgen Zipf (Exponent 0,8–1,2)", feld: "richter" },
                        { wort: "orte_veraendert_pct", richtung: "≥", wert: 50, wortlaut: "≥ 50 % der Orte zeigen im Bildpaar eine benennbare Veränderung", feld: "richter" },
                    ],
                    umfang: { verlangt: 1e10, einheit: "Menschen eines Planeten", wortlaut: "10¹⁰: ein Planet, Jahrhunderte", feld: "umfang" },
                },
                6: {
                    soll: [{ wort: "diff_pct", richtung: "≤", wert: 1, wortlaut: "Zeitsprung hin und zurück: Bild gleich (Diff ≤ 1 %)", feld: "richter" }],
                    umfang: { verlangt: 1e6, einheit: "Jahre Zeitsprung", wortlaut: "Äonen: 10⁶–10⁹ Jahre", feld: "umfang" },
                },
                7: {
                    soll: [
                        { wort: "widersprueche", richtung: "≤", wert: 0, wortlaut: "Widersprüche = 0, Statistik ≤ 10 %", feld: "richter" },
                        { wort: "statistik_pct", richtung: "≤", wert: 10, wortlaut: "Widersprüche = 0, Statistik ≤ 10 %", feld: "richter" },
                    ],
                    umfang: { verlangt: 1000, einheit: "Besuche an zufälligen (Welt, Ort, Zeit)", wortlaut: "1 000 Besuche an zufälligen (Welt, Ort, Zeit)", feld: "richter" },
                },
            },
            seite: {
                // DER TAG MIT ZUSCHAUER UND DIE WIEDERKEHR (in der Seite, r = die Welt): die Helfer wie kreatur-proben (`leute`,
                // `leuteTakt` scripts/lib/kreatur-proben.cjs:2451) und die Wiederkehr wie kreatur-mensch (scripts/lib/kreatur-mensch.cjs:776)
                abwesenheitTag: async function abwesenheitTag(r, T, o) {
                    const s = r.state, A = r.constructor, pm = s.playerMesh.position;
                    const t0 = performance.now(), zeit = () => performance.now() - t0;
                    const sleep = (ms) => new Promise((f) => setTimeout(f, ms));
                    const leute = (dt) => (r._bewohnerWerkTakt(Infinity), r._tickBewohner(dt));
                    const leuteTakt = () => {
                        for (let n = Infinity, still = 0, m; still < 5 && (m = (leute(0), r._weltOffen().leute)); n = m) still = m < n ? 0 : still + 1;
                    };
                    const B = r._bewohnerSiedlungen || new Map();
                    // die Test-Stadt: die Siedlung am Anker der Gründung des Messorts (haushalt.json stadt.gruendung.anker)
                    let key = null, dS = Infinity;
                    for (const [k, X] of B) {
                        const d = Math.hypot(X.ox - o.anker[0], X.oz - o.anker[1]);
                        if (d < dS) [key, dS] = [k, d];
                    }
                    if (key === null || dS > 60) throw new Error("keine Siedlung der Bewohner am Anker " + o.anker.join("/") + " (nächste " + Math.round(dS) + " m)");
                    const Sx = () => (B.get(key) || {}).liste || [];
                    const alleDa = () => Sx().length > 0 && Sx().every((b) => b.leib && !b.ankunft);
                    const wer = (b) => b.rolle + "/" + b.beruf + " #" + b.heim + ":" + b.same;
                    const lagen = () => new Map(Sx().filter((b) => b.leib).map((b) => [wer(b), b.leib.position.clone()]));
                    const warteDa = async (wo) => {
                        while (!alleDa()) {
                            if (zeit() > o.deckelMs)
                                throw new Error(wo + ": " + Sx().filter((b) => b.leib && !b.ankunft).length + " von " + Sx().length + " Bewohnern angekommen nach " + Math.round(zeit() / 1000) + " s");
                            r._tickFoundryIngest();
                            leuteTakt();
                            await sleep(16);
                        }
                    };
                    const P0 = pm.clone(), tag0 = s.timeOfDay, dl0 = s.dayLengthMinutes;
                    const offen = window.__offen || (window.__offen = new Set()), offenNeu = !offen.has("bewohner");
                    // DIE TEST-STADT ALLEIN: die übrigen Siedlungen (stadt-voll liegt 175 m daneben) ruhen im Lauf — Zuschauer und
                    // Abwesenheit rechnen dieselben 118, die Ordnung der Liste kehrt danach zurück
                    const ordnung = [...B];
                    for (const [k] of ordnung) if (k !== key) B.delete(k);
                    offen.add("bewohner");
                    s.dayLengthMinutes = A.DAY_LENGTH_DEFAULT_MINUTES;
                    try {
                        const tagS = A.DAY_LENGTH_DEFAULT_MINUTES * 60, DT = 0.1, takte = Math.round((0.1 / 24) * tagS * 10);
                        for (const h of [o.beginnH + 12, o.beginnH]) (r._uhrSetzen((h % 24) / 24, "regler"), leute(0));
                        await warteDa("die Ankunft vor dem Tag");
                        const n0 = Sx().length, blieb = [];
                        let weg = 0, vor = lagen();
                        for (let i = 1; i <= 240; i++) {
                            for (let k = 0; k < takte; k++) (r._uhrSetzen((s.timeOfDay + DT / tagS) % 1, "uhr"), leute(DT));
                            if (i % 10) continue;
                            const jetzt = lagen();
                            for (const [id, p] of jetzt) if (vor.has(id)) weg += p.distanceTo(vor.get(id));
                            vor = jetzt;
                            if (i % o.jeZehntel === 0) blieb.push([s.timeOfDay * 24, jetzt]);
                            if (zeit() > o.deckelMs) throw new Error("der Tag mit Zuschauer riss nach " + i / 10 + " von 24 Spielstunden in " + Math.round(zeit() / 1000) + " s");
                            await sleep(0);
                        }
                        // FORT: jenseits nearM × fernFaktor vom Ursprung der Siedlung (der Leser `_tickBewohner` misst dort, siedlung-bewohner.js:1588)
                        const S0 = B.get(key), fern = A.AUTO_SETTLEMENT.nearM * A.BEWOHNER.fernFaktor + 80;
                        const [dx, dz] = [P0.x - S0.ox, P0.z - S0.oz], l = Math.hypot(dx, dz);
                        const [ux, uz] = l > 1 ? [dx / l, dz / l] : [1, 0];
                        let n = 0, maxM = 0, fehlt = 0, fort = Infinity, schlecht = "";
                        for (const [stunde, sah] of blieb) {
                            pm.x = S0.ox + ux * fern;
                            pm.z = S0.oz + uz * fern;
                            r._uhrSetzen((((stunde - o.fortH) % 24) + 24) % 24 / 24, "regler");
                            leute(0);
                            fort = Math.min(fort, n0 - Sx().filter((b) => b.leib).length);
                            r._uhrSetzen((stunde % 24) / 24, "regler");
                            pm.copy(P0);
                            await warteDa("die Wiederkehr um " + stunde.toFixed(1) + " Uhr");
                            const kam = lagen();
                            for (const [id, p] of sah) {
                                const q = kam.get(id);
                                if (!q) {
                                    fehlt++;
                                    schlecht = schlecht || id + " fehlt um " + stunde.toFixed(1) + " Uhr";
                                    continue;
                                }
                                const d = q.distanceTo(p);
                                n++;
                                if (d > maxM) [maxM, schlecht] = [d, id + " um " + stunde.toFixed(1) + " Uhr " + d.toFixed(2) + " m neben dem Zuschauer"];
                            }
                        }
                        return { n0, n, maxM, fehlt, fort: Number.isFinite(fort) ? fort : 0, weg: Math.round(weg), pruef: blieb.length, ms: Math.round(zeit()), schlecht, key: String(key) };
                    } finally {
                        pm.copy(P0);
                        B.clear();
                        for (const [k, X] of ordnung) B.set(k, X);
                        r._uhrSetzen(tag0, "regler");
                        s.dayLengthMinutes = dl0;
                        if (offenNeu) offen.delete("bewohner");
                    }
                },
            },
            lauf: async function abwesenheitLauf(H, P, L) {
                // ZUERST DER UMFANG (billig, ohne Ortswechsel): Wesen, Saat, Epoche der Welt der Sitzung
                const w = await L.ev(
                    "let menschen = 0, sied = 0; for (const S of (r._bewohnerSiedlungen || new Map()).values()) { sied++; menschen += S.liste ? S.liste.length : S.plan && S.plan.slots ? S.plan.slots.length : 0; }" +
                        " let wuchs = 0; for (const a of r.state.architectures || []) if (a && r._istNatur(a)) wuchs++;" +
                        " const teil = r._gelaende().ort.teil; return { menschen, sied, tiere: (r.state.creatures || []).length, wuchs, saat: r.state.worldMeta && r.state.worldMeta.seed, planet: r._planetSamen(), zeitMa: teil && Number.isFinite(teil.zeitMa) ? teil.zeitMa : 0 };"
                );
                L.zeile("die Welt der Sitzung: " + JSON.stringify(w));
                const wesen = w.menschen + w.tiere + w.wuchs;
                await L.je(2, async () =>
                    wesen >= 1e4
                        ? L.leser(2, "Klassen-Statistik Rückkehr ↔ Zuschauer für Tiere und Wuchs: kein Leser zählt Tiere und Wuchs nach der Abwesenheit gegen den Zuschauer-Lauf — Haken neben der Wiederkehr der Menschen (scripts/lib/kreatur-mensch.cjs:776)", wesen)
                        : L.umfang(2, wesen, "die Welt trägt " + w.menschen + " Menschen, " + w.tiere + " Tiere, " + w.wuchs + " Gewächse")
                );
                await L.je(3, async () => L.umfang(3, w.menschen, "die Welt trägt " + w.menschen + " Menschen in " + w.sied + " Siedlungen — keine Metropole"));
                await L.je(4, async () => L.umfang(4, w.menschen, "die Welt trägt " + w.menschen + " Menschen — kein Kontinent, kein Lauf über 100 Jahre"));
                await L.je(5, async () => L.umfang(5, w.menschen, "die Welt trägt " + w.menschen + " Menschen auf einem Planeten (Samen " + w.planet + ") — keine Stadtgrößen über Jahrhunderte"));
                await L.je(6, async () =>
                    L.umfang(6, 0, "die Welt der Sitzung springt nie in der Epoche: sie steht in zeitMa " + w.zeitMa + " (eine Epoche), der Satz reise wechselt die Welt (stamm/feld-leben.js:1277) — 0 Jahre Zeitsprung")
                );
                await L.je(7, async () => L.umfang(7, new Set([String(w.saat)]).size, "die Sitzung trägt eine Welt (Saat " + w.saat + ") — Besuche an zufälligen Welten verlangen Welten, die Leiter teilt EINE"));
                // S1 · der Tag in der Test-Stadt (der Messort stadt gründet „dorf 7 120“ am Anker der Spec)
                await L.je(1, async () => {
                    await L.ort("stadt", "ego");
                    L.preisPose("stadt", "ego");
                    const rest = H.rest();
                    if (rest < 15) throw new Error("die Frist trägt den Tag nicht mehr: " + Math.round(rest) + " s Rest nach dem Ort");
                    const M = require(require("path").resolve("spec/profiband/haushalt.json")).messorte;
                    const anker = (Array.isArray(M) ? M.find((x) => x.id === "stadt") : M.stadt).gruendung.anker;
                    const o = { deckelMs: Math.round((rest - 8) * 1000), beginnH: 12.5, fortH: 6, jeZehntel: 60, anker };
                    const e = await L.ev("return await (" + H.seite.abwesenheitTag + ")(r, T, " + JSON.stringify(o) + ");", Math.max(10, rest - 3));
                    L.zeile("Abwesenheit: " + JSON.stringify(e));
                    L.gemessen(1, { lage_max_m: e.fehlt ? 1e9 : +e.maxM.toFixed(3) }, {
                        erzeugt: e.n0,
                        welt: { weg_m: e.weg, leiber_fort: e.fort },
                        taeter: (e.fehlt ? e.fehlt + " Lagen fehlen nach der Wiederkehr · " : "") + (e.schlecht || "keiner") + " (" + e.pruef + " Prüf-Stunden, je 6 h fort, " + e.n + " Lagen)",
                        beleg: { siedlung: e.key, ms: e.ms },
                    });
                });
            },
        })
    );

    // ─────────── same.entfaltung.vielfalt — Jede Saat eine eigene Welt ───────────
    // S1–S3 urteilt ein Panel (der richtige von 10 Orten aus einem Zufallsbild): die Probe schießt das Bild an fester Pose (dorf Ego,
    // dorf Third, wiese Ego) und legt es ab (auge). S4–S7 verlangen 10–10⁴ Welten aus eigenen Saaten: die Sitzung trägt EINE Welt
    // (gezählt: die Saaten der Sitzung, `worldMeta.seed`) — Umfang nicht erzeugt.
    LEITERN.push(
        leiter({
            leiter: "same.entfaltung.vielfalt",
            sek: 60,
            pfad: ["scripts/werkbank.cjs", "spec/profiband/haushalt.json", "stamm/dirigent-kern.js", "stamm/gelaende-chunks.js"],
            sprossen: {
                1: {
                    umfang: { verlangt: 10, einheit: "Orte einer Welt", wortlaut: "10 Orte EINER Welt", feld: "umfang" },
                    auge: { pose: "dorf Ego, Mittag · Sonne · Sommer (Bühne der Werkbank) — einer der 10 Orte", vorbild: "Panel: der richtige von 10 Orten aus einem Zufallsbild (≥ 80 %), Gegenlauf Ursache getauscht" },
                },
                2: {
                    umfang: { verlangt: 100, einheit: "Orte", wortlaut: "10² Orte", feld: "umfang" },
                    auge: { pose: "dorf Third, Mittag (Bühne der Werkbank) — ein Stadtteil von 10²", vorbild: "Panel: der richtige von 10 Zufalls-Orten aus 10² (≥ 80 %), Unterschied in ≥ 3 Domänen benannt" },
                },
                3: {
                    umfang: { verlangt: 1000, einheit: "Orte in 10 Regionen", wortlaut: "10³ Orte, 10 Regionen einer Welt", feld: "umfang" },
                    auge: { pose: "wiese Ego, Mittag (Bühne der Werkbank) — eine Region von 10", vorbild: "Panel: die Region aus einem Bild (≥ 80 %), Übergangs-Bilder zwischen die Nachbarn" },
                },
                4: {
                    umfang: { verlangt: 10, einheit: "Welten aus eigenen Saaten", wortlaut: "10 Welten aus 10 Saaten", feld: "umfang" },
                    auge: { pose: "je Welt ein Bodenbild am Spawn", vorbild: "Panel: die richtige von 10 Saaten aus einem Zufallsbild (≥ 90 %)" },
                },
                5: {
                    umfang: { verlangt: 100, einheit: "Welten", wortlaut: "10² Welten", feld: "umfang" },
                    auge: { pose: "je Welt ein Bodenbild am Spawn", vorbild: "Panel: die richtige von 10 Zufalls-Welten aus 10² (≥ 90 %)" },
                },
                6: {
                    umfang: { verlangt: 1000, einheit: "Welten", wortlaut: "10³ Welten", feld: "umfang" },
                    auge: { pose: "je Welt ein Bodenbild, die Erd-nahen neben Fotos", vorbild: "2AFC gegen Fotos der Erde und ihrer Epochen (≤ 70 %)" },
                },
                7: {
                    umfang: { verlangt: 1e4, einheit: "Welten", wortlaut: "10⁴ Welten", feld: "umfang" },
                    auge: { pose: "je Welt ein Bodenbild am Spawn", vorbild: "Panel: die richtige von 10 Zufalls-Saaten aus 10⁴ (≥ 95 %), Fremdwelt-Probe" },
                },
            },
            lauf: async function vielfaltLauf(H, P, L) {
                const w = await L.ev("return { saat: r.state.worldMeta && r.state.worldMeta.seed, planet: r._planetSamen() };");
                const welten = new Set([String(w.saat)]).size;
                const was = "die Sitzung trägt " + welten + " Welt (Saat " + w.saat + ") — ein Welt-Sprung wechselt die Welt, die Leiter teilt EINE Welt der Sitzung";
                for (const nr of [4, 5, 6, 7]) await L.je(nr, async () => L.umfang(nr, welten, was));
                await L.je(1, () => L.auge(1, { ort: "dorf", sicht: "ego" }));
                await L.je(2, () => L.auge(2, { ort: "dorf", sicht: "third" }));
                await L.je(3, () => L.auge(3, { ort: "wiese", sicht: "ego" }));
                L.preisPose("dorf", "ego");
            },
        })
    );

    // ─────────── same.entfaltung.akte — Die Tat bleibt ───────────
    // S1 trägt bestehend speicher.K4#2 (Tafel „gleich“, gebuchte Akten; Richter-Falte 19.11.: der Zwilling dieser Probe — Bildpaar
    // vor ↔ nach Reload — fiel). S2–S8 zählen Taten, Peers, Saaten, Versionen.
    LEITERN.push(
        leiter({
            leiter: "same.entfaltung.akte",
            sek: 60,
            pfad: [
                "scripts/werkbank.cjs",
                "spec/profiband/haushalt.json",
                "scripts/lib/welt-boot.cjs",
                "scripts/lib/ausgabe-aufnahme.cjs",
                "stamm/vegetation-baum.js",
                "stamm/siedlung-satz.js",
                "stamm/netz-p2p.js",
                "stamm/gelaende-chunks.js",
                "stamm/gelaende-boden.js",
                "stamm/dienst.js",
                "stamm/dirigent-kern.js",
                "stamm/siedlung-bewohner.js",
            ],
            welt: [
                { wort: "taten_gesetzt", ab: 100, was: "Taten, die der Spieler in diesem Lauf setzte (Bauten + Edits der Welt)" },
                { wort: "neue_seite", ab: 1, was: "die Seite lud neu (performance.timeOrigin vor ↔ nach)" },
            ],
            bestehend: [1],
            sprossen: {
                2: {
                    soll: [
                        { wort: "diff_pct", richtung: "≤", wert: 1, wortlaut: "Bildpaar ≤ 1 %", feld: "richter" },
                        { wort: "median_b_je_tat", richtung: "≤", wert: 100, wortlaut: "Median ≤ 100 B je Tat", feld: "richter" },
                        { wort: "stand_kb", richtung: "≤", wert: 100, wortlaut: "Stand ≤ 100 kB", feld: "tiefe" },
                    ],
                    umfang: { verlangt: 1000, einheit: "Edits eines Spielers", wortlaut: "10³ Edits eines Spielers", feld: "umfang" },
                },
                3: {
                    soll: [
                        { wort: "diff_pct", richtung: "≤", wert: 1, wortlaut: "Bild zweier Gäste ≤ 1 % Diff", feld: "richter" },
                        { wort: "alte_staende_pct", richtung: "≥", wert: 100, wortlaut: "Anteil ladender alter Stände = 100 %", feld: "richter" },
                    ],
                    umfang: { verlangt: 2, einheit: "Peers", wortlaut: "10⁴ Edits, 2 Peers", feld: "umfang" },
                },
                4: {
                    soll: [{ wort: "sichtbar_pct", richtung: "≥", wert: 100, wortlaut: "Stichprobe 1 000 Taten sichtbar 100 %", feld: "richter" }],
                    umfang: { verlangt: 1000, einheit: "Spieler", wortlaut: "10⁶ Taten von 10³ Spielern", feld: "umfang" },
                },
                5: {
                    soll: [
                        { wort: "erkennung_pct", richtung: "≥", wert: 95, wortlaut: "Welt-Erkennung (Richter von vielfalt Sprosse 7) ≥ 95 %", feld: "richter" },
                        { wort: "lage_pct", richtung: "≥", wert: 100, wortlaut: "Taten-Lage 100 %", feld: "richter" },
                    ],
                    umfang: { verlangt: 100, einheit: "Saaten", wortlaut: "100 Saaten", feld: "richter" },
                },
                6: {
                    soll: [{ wort: "ankunft_mb", richtung: "≤", wert: 1, wortlaut: "≤ 1 MB je Ankunft", feld: "preis" }],
                    umfang: { verlangt: 1e7, einheit: "KI-Bewohner", wortlaut: "10⁷ KI-Bewohner", feld: "umfang" },
                },
                7: {
                    soll: [{ wort: "laden_pct", richtung: "≥", wert: 100, wortlaut: "100 % laden und zeigen ihr Alter", feld: "richter" }],
                    umfang: { verlangt: 50, einheit: "Gesetzes-Versionen", wortlaut: "≥ 50 Versionen", feld: "umfang" },
                },
                8: {
                    soll: [
                        { wort: "sichtbar_pct", richtung: "≥", wert: 100, wortlaut: "10 000 zufällige Taten: sichtbar 100 %, Ankunft ≤ 1 s", feld: "richter" },
                        { wort: "ankunft_s", richtung: "≤", wert: 1, wortlaut: "10 000 zufällige Taten: sichtbar 100 %, Ankunft ≤ 1 s", feld: "richter" },
                    ],
                    umfang: { verlangt: 10000, einheit: "zufällige Taten", wortlaut: "10 000 zufällige Taten", feld: "richter" },
                },
            },
            lauf: async function akteLauf(H, P, L) {
                // ZUERST DER UMFANG (billig): Taten des Spielers in der Sitzung, Peers, Saat, Version, KI-Bewohner
                const w = await L.ev(
                    "const st = r.state, m = st.worldMeta || {}; let werk = 0; for (const a of st.architectures || []) if (a && typeof a.id === 'string') werk++;" +
                        " let menschen = 0; for (const S of (r._bewohnerSiedlungen || new Map()).values()) menschen += S.liste ? S.liste.length : S.plan && S.plan.slots ? S.plan.slots.length : 0;" +
                        " return { edits: (m.voxelEdits || []).length, werk, peers: st.p2p && st.p2p.peers ? st.p2p.peers.size : 0, saat: m.seed, version: r.constructor.VERSION, menschen };"
                );
                L.zeile("die Sitzung: " + JSON.stringify(w));
                const taten = w.edits + w.werk, spieler = 1 + w.peers;
                await L.je(2, async () =>
                    taten >= 1000
                        ? L.leser(2, "Median je Tat und Ankunft mit ↔ ohne Taten: kein Leser nennt die Bytes je Tat im Stand (Haken: der Stand je Tat neben `__stand`, scripts/lib/welt-boot.cjs:446)", taten)
                        : L.umfang(2, taten, "die Sitzung trägt " + taten + " Taten des Spielers (" + w.edits + " Edits, " + w.werk + " Werke) — 10³ Edits und die Ankunft ohne sie (ein zweiter Neustart) trägt die Minute der Leiter nicht")
                );
                await L.je(3, async () =>
                    spieler >= 2 ? L.leser(3, "Bild zweier Gäste: kein Leser legt das Bild je Peer an derselben Pose nebeneinander", spieler) : L.umfang(3, spieler, "die Sitzung trägt einen Peer (state.p2p.peers " + w.peers + ")")
                );
                await L.je(4, async () => L.umfang(4, spieler, "die Sitzung trägt " + spieler + " Spieler — keine Stadt mit 10³ Spielern"));
                await L.je(5, async () => L.umfang(5, new Set([String(w.saat)]).size, "die Sitzung trägt eine Saat (" + w.saat + ") und eine Gesetzes-Version (" + w.version + ") — kein Schritt N → N+1"));
                await L.je(6, async () => L.umfang(6, w.menschen, "die Welt trägt " + w.menschen + " KI-Bewohner auf einem Planeten"));
                await L.je(7, async () => L.umfang(7, new Set([String(w.version)]).size, "die Sitzung lädt eine Gesetzes-Version (" + w.version + ") — kein Korpus der Stände über Versionen"));
                await L.je(8, async () => L.umfang(8, taten, "die Sitzung trägt " + taten + " Taten an einem Planeten — keine Galaxie"));
            },
        })
    );
}

// ═══════════════════════════════════════ Perspektive massstab ═══════════════════════════════════════
{
    // ─────────── same.massstab.spanne — Spanne der Größenordnungen ───────────
    // S1–S4 verlangen 20 Saaten: EINE Fahrt über die Saaten der Sitzung (H.seite.SAATEN, der EINE Wechsel am Ort), je Saat die Kamera der
    // Welt — dann nennt jede Sprosse ihren Leser (Steigflug, nahe Ebene, Krümmung, Orbit). S5–S9 verlangen eine Sicht bis 10¹³ … 10²⁶ m:
    // gezählt wird die Reichweite der Welt-Kamera (`state.camera.far`, gesetzt in stamm/dirigent-ankunft.js:468) — was hinter ihr liegt,
    // zeichnet die Welt nicht.
    LEITERN.push(
        leiter({
            leiter: "same.massstab.spanne",
            sek: 50,
            pfad: ["scripts/werkbank.cjs", "stamm/dirigent-ankunft.js", "foundry-core.js"],
            welt: [{ wort: "auge_m", ab: 1, was: "Höhe, die das Auge in der Welt flog (m)" }],
            sprossen: {
                1: {
                    soll: [{ wort: "steig_s", richtung: "≤", wert: 30, wortlaut: "700 m Auge in 30 s", feld: "richter" }],
                    umfang: { verlangt: 20, einheit: "Saaten", wortlaut: "N = 20 Saaten", feld: "richter" },
                },
                2: {
                    soll: [{ wort: "nah_cm", richtung: "≤", wert: 1, wortlaut: "Spanne 1 cm → 1 km", feld: "richter" }],
                    umfang: { verlangt: 20, einheit: "Saaten", wortlaut: "N = 20 Saaten", feld: "richter", aus: 1 },
                },
                3: {
                    soll: [{ wort: "horizont_abw_pct", richtung: "≤", wert: 10, wortlaut: "Horizont-Absenkung aus 10 km gegen √(2h/R) ±10 %", feld: "richter" }],
                    umfang: { verlangt: 20, einheit: "Saaten", wortlaut: "N = 20 Saaten", feld: "richter", aus: 1 },
                },
                4: {
                    soll: [{ wort: "saaten", richtung: "≥", wert: 20, wortlaut: "Flug Boden → Orbit → Boden auf der anderen Seite, N = 20 Saaten", feld: "richter" }],
                    umfang: { verlangt: 20, einheit: "Saaten", wortlaut: "N = 20 Saaten", feld: "richter" },
                },
                5: {
                    soll: [{ wort: "bahn_abw_pct", richtung: "≤", wert: 1, wortlaut: "Bahnabstand ±1 %", feld: "richter" }],
                    umfang: { verlangt: 1e13, einheit: "m Sicht der Welt-Kamera", wortlaut: "13: bis Sonnensystem (10¹³ m)", feld: "umfang" },
                },
                6: {
                    soll: [{ wort: "sterne", richtung: "≥", wert: 10, wortlaut: "Flug zu 10 zufälligen Nachbarsternen", feld: "richter" }],
                    umfang: { verlangt: 1e17, einheit: "m Sicht der Welt-Kamera", wortlaut: "17: bis Nachbarsterne (10¹⁷ m)", feld: "umfang" },
                },
                7: {
                    soll: [{ wort: "fluss_abw_pct", richtung: "≤", wert: 5, wortlaut: "Gesamtfluss ±5 %", feld: "richter" }],
                    umfang: { verlangt: 1e21, einheit: "m Sicht der Welt-Kamera", wortlaut: "21: bis Galaxie (10²¹ m)", feld: "umfang" },
                },
                8: {
                    soll: [
                        { wort: "pop_pct", richtung: "≤", wert: 0.1, wortlaut: "Pop ≤ 0,1 %", feld: "richter" },
                        { wort: "flug_s", richtung: "≤", wert: 120, wortlaut: "in ≤ 120 s", feld: "richter" },
                    ],
                    umfang: { verlangt: 1e21, einheit: "m Sicht der Welt-Kamera", wortlaut: "26: 10 µm bis 10²¹ m", feld: "umfang" },
                },
                9: {
                    soll: [{ wort: "galaxien", richtung: "≥", wert: 10, wortlaut: "Flug zu 10 Zufallsgalaxien", feld: "richter" }],
                    umfang: { verlangt: 1e26, einheit: "m Sicht der Welt-Kamera", wortlaut: "31: 10 µm bis 10²⁶ m", feld: "umfang" },
                },
            },
            seite: { SAATEN },
            lauf: async function spanneLauf(H, P, L) {
                const ort0 = Date.now();
                await L.ort("wiese", "ego");
                const ortMs = Date.now() - ort0;
                const z = await L.ev("const c = r.state.camera; return { far: c.far, near: c.near, fov: c.fov, saat: r.state.worldMeta && r.state.worldMeta.seed };", 20);
                L.zeile("Kamera und Saat der Sitzung: " + JSON.stringify(z));
                L.preisPose("wiese", "ego");
                const sicht = "die Welt-Kamera reicht " + z.far + " m (state.camera.far, stamm/dirigent-ankunft.js:468) — was dahinter liegt, zeichnet die Welt nicht";
                for (const nr of [5, 6, 7, 8, 9]) await L.je(nr, async () => L.umfang(nr, z.far, sicht));
                // S1–S4 DIE SAATEN (H.seite.SAATEN, sitzung-seite.js): EINE Fahrt für die vier Sprossen (ihr Umfang ist derselbe, N = 20
                // Saaten) — je Saat der Satz „neue welt saat <s>“, die Welt wechselt am Ort; je Saat die Kamera der Welt (nahe und ferne
                // Ebene) und die Höhe des Auges über dem Gesetz. Die Schleife läuft zuletzt und lässt den Heimweg samt dem doppelten ersten
                // Gang zur Wiese in der Frist (dort fährt der Preis, R3). Trägt die Welt alle Saaten, nennt jede Sprosse ihren Leser.
                const v = P.sprossen[1].umfang.verlangt;
                const arg = { stamm: P.leiter + "-s1", n: v, bis: Date.now() + Math.max(0, (L.rest() - 3 - (2 * ortMs) / 1000) * 1000) };
                const kamera = function (r) {
                    const c = r.state.camera;
                    return { near: c.near, far: c.far, auge: +(c.position.y - r.getTerrainHeightAt(c.position.x, c.position.z)).toFixed(2) };
                };
                let s = null, wurf = null;
                try {
                    s = await L.ev("return await (" + H.seite.SAATEN + ")(r, T, " + JSON.stringify(arg) + ", " + kamera + ");", Math.max(5, L.rest() - 2));
                    if (s.fehler) throw new Error(s.fehler);
                    L.zeile("spanne S1–S4 Saaten " + JSON.stringify(s));
                } catch (e) {
                    if (e && e.messort) throw e;
                    wurf = e;
                }
                if (wurf) {
                    for (const nr of [1, 2, 3, 4]) await L.je(nr, async () => { throw wurf; });
                    return;
                }
                const zeit = "je Saat " + (s.msJe.join(" · ") || "—") + " ms, Heimweg " + s.heimweg.ms + " ms (zurück " + s.heimweg.zurueck + ", Versatz " + s.heimweg.versatz + " m)";
                const nahJe = [...new Set(s.je.map((x) => x.z.near))].join("/") || "—";
                const augeJe = s.je.map((x) => x.z.auge).join("/") || "—";
                const in20 = "in " + s.je.length + " Saaten (nahe Ebene je Saat " + nahJe + " m, Auge über dem Grund " + augeJe + " m; " + zeit + ")";
                const flug = "kein Verb hebt das Auge vom Leib — die Kamera folgt ihm (`_loopCamera`, stamm/koerper-bewegung.js:1759), kein Steigflug zählt die Bruch-Bedingungen je Höhe";
                // der Bildwinkel des Schusses (1280 × 720) aus dem senkrechten der Welt-Kamera — derselbe wie same.massstab.nahe
                const hfov = 2 * Math.atan(Math.tan((z.fov * Math.PI) / 360) * (1280 / 720));
                const cm = 0.01 / (2 * Math.tan(hfov / 2));
                const nahe = Math.max(...s.je.map((x) => x.z.near));
                const urteil = {
                    1: () => L.leser(1, "Steigflug 0,5 → 700 m in 30 s: " + flug + " — " + in20, s.je.length),
                    2: () =>
                        L.leser(2, nahe > cm ? "die Welt-Kamera schneidet unter " + nahe + " m ab (state.camera.near, stamm/dirigent-ankunft.js:468): 1 cm Bildbreite verlangt " + cm.toExponential(2) + " m Abstand — " + in20 : "Spanne 1 cm → 1 km: " + flug + " — " + in20, s.je.length),
                    3: () => L.leser(3, "Horizont-Absenkung aus 10 km: die Welt ist eben — das Fern-Gelände trägt keine Krümmung (FERN_RING, stamm/gelaende-fern.js:460), kein Auge steigt auf 10 km — " + in20, s.je.length),
                    4: () => L.leser(4, "Flug Boden → Orbit → Boden: kein Orbit — das Gelände ist eben (FERN_RING, stamm/gelaende-fern.js:460), der Planet hat keine andere Seite — " + in20, s.je.length),
                };
                for (const nr of [1, 2, 3, 4])
                    await L.je(nr, async () => (s.je.length < v ? L.umfang(nr, s.je.length, "die Welt wechselte am Ort in " + s.je.length + " von " + v + " Saaten (" + zeit + "; Ende: " + s.grund + ")") : urteil[nr]()));
            },
        })
    );

    // ─────────── same.massstab.nahe — der Blick nah an den Boden ───────────
    // An der Mess-Wiese schießt das Auge den Boden vor den Füßen mit der Bildbreite der Sprosse (2 m, 50 cm, 10 cm, 1 cm, 10 µm): die
    // Kamera steht im Abstand d = Breite / (2·tan(hfov/2)) unter 60° auf dem Grund. Liegt d unter der nahen Ebene der Welt-Kamera
    // (`state.camera.near`), schneidet die Welt ab — dann fehlt der Leser beim Namen. S5 zählt das Korn; S6 fährt die Planeten-Saaten
    // (H.seite.SAATEN, der EINE Wechsel am Ort) zuletzt und liest je Saat die nahe Ebene.
    LEITERN.push(
        leiter({
            leiter: "same.massstab.nahe",
            sek: 60,
            pfad: ["scripts/werkbank.cjs", "stamm/dirigent-ankunft.js", "stamm/bau-vorlagen.js", "stamm/gelaende-boden.js", "stamm/kreatur-leben.js"],
            welt: [{ wort: "orte", ab: 1, was: "Orte, an denen die Probe den Boden im Bild las" }],
            sprossen: {
                1: {
                    soll: [
                        { wort: "energie_pct", richtung: "≥", wert: 50, wortlaut: "≥ 50 % der Referenz", feld: "richter" },
                        { wort: "orte_pct", richtung: "≥", wert: 80, wortlaut: "in ≥ 80 %", feld: "richter" },
                    ],
                    umfang: { verlangt: 100, einheit: "Orte", wortlaut: "N = 100 Orte", feld: "umfang" },
                    auge: { pose: "wiese ego · Bildbreite 2 m auf dem Grund 1,5 m vor dem Spieler, Kamera unter 60° von der Seite", vorbild: "Foto der Bodenklasse Wiese aus 2 m (Spektrum, Energie über 1/20 der Bildbreite)" },
                },
                2: {
                    soll: [
                        { wort: "energie_pct", richtung: "≥", wert: 50, wortlaut: "≥ 50 % der Referenz", feld: "richter", aus: 1 },
                        { wort: "orte_pct", richtung: "≥", wert: 80, wortlaut: "in ≥ 80 %", feld: "richter", aus: 1 },
                    ],
                    umfang: { verlangt: 100, einheit: "Orte", wortlaut: "N = 100 Orte", feld: "umfang", aus: 1 },
                    auge: { pose: "wiese ego · Bildbreite 50 cm auf dem Grund 1,5 m vor dem Spieler, Kamera unter 60°", vorbild: "Foto der Bodenklasse Wiese aus 50 cm (Gram-Statistik)" },
                },
                3: {
                    soll: [
                        { wort: "energie_pct", richtung: "≥", wert: 50, wortlaut: "≥ 50 % der Referenz", feld: "richter", aus: 1 },
                        { wort: "orte_pct", richtung: "≥", wert: 80, wortlaut: "in ≥ 80 %", feld: "richter", aus: 1 },
                    ],
                    auge: { pose: "wiese ego · Bildbreite 10 cm auf dem Grund 1,5 m vor dem Spieler, Kamera unter 60°", vorbild: "Makrofoto 10 cm der Bodenklasse Wiese" },
                },
                4: {
                    soll: [{ wort: "fluss_fehler_pct", richtung: "≤", wert: 20, wortlaut: "Fehler ≤ 20 %", feld: "richter" }],
                    auge: { pose: "wiese ego · Bildbreite 1 cm auf dem Grund, zwei Bilder mit 1 cm Kamera-Versatz", vorbild: "Makro-Stereopaar derselben Bodenklasse (Tiefe aus optischem Fluss)" },
                },
                5: { soll: [{ wort: "wentworth_pct", richtung: "≥", wert: 90, wortlaut: "Wentworth-Klasse richtig an ≥ 90 % von 100 Uferorten", feld: "richter" }] },
                6: {
                    soll: [{ wort: "plausibel_pct", richtung: "≥", wert: 90, wortlaut: "plausibel ≥ 90 %", feld: "richter" }],
                    umfang: { verlangt: 10, einheit: "Planeten-Saaten", wortlaut: "10 Planeten-Saaten", feld: "richter" },
                },
                7: {
                    soll: [{ wort: "plausibel_pct", richtung: "≥", wert: 80, wortlaut: "plausibel ≥ 80 %", feld: "richter" }],
                    auge: { pose: "wiese ego · Bildbreite 10 µm auf dem Grund", vorbild: "Lichtmikroskopie derselben Bodenklasse (Zelle, Pollenwand, Milbe)" },
                },
            },
            seite: { SAATEN },
            lauf: async function naheLauf(H, P, L) {
                // die Kamera und der Grund 1,5 m vor dem Spieler (Blick waagrecht), die Seite rechts davon
                function grund(r) {
                    const s = r.state, A = AnazhRealm, m = s.playerMesh, c = s.camera;
                    const d = c.getWorldDirection(new T.Vector3());
                    const l = Math.hypot(d.x, d.z) || 1, [ux, uz] = [d.x / l, d.z / l];
                    const fuss = m.position.y - A.PLAYER_FOOT_OFFSET;
                    const gx = m.position.x + 1.5 * ux, gz = m.position.z + 1.5 * uz;
                    const g = r._koerperBodenUnter(gx, fuss + 1, gz);
                    return { near: c.near, fov: c.fov, gx, gz, gy: Number.isFinite(g) ? g : fuss, ux, uz, saat: s.worldMeta && s.worldMeta.seed };
                }
                const ort0 = Date.now();
                await L.ort("wiese", "ego");
                const ortMs = Date.now() - ort0;
                L.preisPose("wiese", "ego");
                const g = await L.ev("return (" + grund + ")(r);", 30);
                L.zeile("Grund vor dem Spieler und nahe Ebene: " + JSON.stringify(g));
                // der Bildwinkel des Schusses (1280 × 720) aus dem senkrechten der Welt-Kamera
                const hfov = 2 * Math.atan(Math.tan((g.fov * Math.PI) / 360) * (1280 / 720));
                const abstand = (breite) => breite / (2 * Math.tan(hfov / 2));
                const nahe = (nr, breite, name) => {
                    const d = abstand(breite);
                    if (d >= g.near) return false;
                    L.leser(nr, "die Welt-Kamera schneidet unter " + g.near + " m ab (state.camera.near, stamm/dirigent-ankunft.js:468): " + name + " Bildbreite verlangt " + d.toExponential(2) + " m Abstand");
                    return true;
                };
                const schuss = async (nr, breite, mit) => {
                    const d = abstand(breite);
                    const [rx, rz] = [g.uz, -g.ux];
                    const b = { px: g.gx + rx * d * 0.5, py: g.gy + d * 0.866, pz: g.gz + rz * d * 0.5, lx: g.gx, ly: g.gy, lz: g.gz };
                    await L.auge(nr, Object.assign({ b, werte: { abstand_m: +d.toFixed(4) } }, mit || {}));
                };
                await L.je(1, async () => nahe(1, 2, "2 m") || (await schuss(1, 2, { erzeugt: 1 })));
                await L.je(2, async () => nahe(2, 0.5, "50 cm") || (await schuss(2, 0.5, { erzeugt: 1 })));
                await L.je(3, async () => nahe(3, 0.1, "10 cm") || (await schuss(3, 0.1)));
                await L.je(4, async () => nahe(4, 0.01, "1 cm") || (await schuss(4, 0.01)));
                await L.je(5, async () => L.leser(5, "Korngröße am Ufer: die Körnung ist EINE Zahl je Stoff (die Krume 2 mm, Tafel SI stamm/bau-vorlagen.js:1619), kein Leser sortiert Korn nach dem Fluss"));
                await L.je(7, async () => nahe(7, 1e-5, "10 µm") || (await schuss(7, 1e-5)));
                // S6 DIE SAATEN (H.seite.SAATEN, sitzung-seite.js): je Planeten-Saat der Satz „neue welt saat <s>“, die Welt wechselt am Ort;
                // je Saat die nahe Ebene der Welt-Kamera — der Makro-Vergleich verlangt 0,1 mm Bildbreite. Zuletzt, der Heimweg samt dem
                // doppelten ersten Gang zur Wiese bleibt in der Frist (dort fährt der Preis, R3).
                await L.je(6, async () => {
                    const v = P.sprossen[6].umfang.verlangt;
                    const arg = { stamm: P.leiter + "-s6", n: v, bis: Date.now() + Math.max(0, (L.rest() - 3 - (2 * ortMs) / 1000) * 1000) };
                    const s = await L.ev("return await (" + H.seite.SAATEN + ")(r, T, " + JSON.stringify(arg) + ", (r) => r.state.camera.near);", Math.max(5, L.rest() - 2));
                    if (s.fehler) throw new Error(s.fehler);
                    L.zeile("nahe S6 Saaten " + JSON.stringify(s));
                    const zeit = "je Saat " + (s.msJe.join(" · ") || "—") + " ms, Heimweg " + s.heimweg.ms + " ms (zurück " + s.heimweg.zurueck + ", Versatz " + s.heimweg.versatz + " m)";
                    if (s.je.length < v) return L.umfang(6, s.je.length, "die Welt wechselte am Ort in " + s.je.length + " von " + v + " Planeten-Saaten (" + zeit + "; Ende: " + s.grund + ")");
                    const near = Math.max(...s.je.map((x) => x.z)), d = abstand(1e-4);
                    const je = "in " + v + " Planeten-Saaten (nahe Ebene je Saat " + ([...new Set(s.je.map((x) => x.z))].join("/") || "—") + " m; " + zeit + ")";
                    L.leser(6, d < near ? "Makrofoto 0,1 mm: die Welt-Kamera schneidet unter " + near + " m ab (state.camera.near, stamm/dirigent-ankunft.js:468): 0,1 mm Bildbreite verlangt " + d.toExponential(2) + " m Abstand — " + je : "Bildvergleich gegen ein Makrofoto: kein Leser der Plausibilität je Ort — " + je, s.je.length);
                });
            },
        })
    );

    // ─────────── same.massstab.sprung — Teleport bis „ganz“ ───────────
    // S1/S2: EIN Sprung 1 km in die erste trockene von acht Richtungen (die Lage wie die Werkbank sie setzt: `_voxelSurfaceY` + 1,8 m),
    // dann der Loop des Spiels in Scheiben (`/lauf`) im Strom der Zelle, bis die Welt steht (`_weltSteht() && !_bepflanzungWartet()`, das
    // Wort von `__weltStehtNach`); t(ganz) ist die Wanduhr der Seite vom Sprung bis zum ersten Stehen (die Pausen zwischen den Scheiben
    // zählen mit — nie weicher als die Karte). Bleibt Zeit, ein Sprung 10–30 km für S3/S8; danach zurück an den Start.
    LEITERN.push(
        leiter({
            leiter: "same.massstab.sprung",
            sek: 60,
            mutiert: true,
            pfad: ["scripts/werkbank.cjs", "scripts/lib/welt-boot.cjs", "stamm/dirigent-takt.js", "stamm/vegetation-baum.js", "stamm/gelaende-chunks.js", "stamm/wasser-hydro.js", "foundry-core.js"],
            welt: [
                { wort: "bilder", ab: 30, was: "Bilder des Loops im Strom der Zelle nach dem Sprung" },
                { wort: "weg_m", ab: 900, was: "Weg des Spielers beim Sprung (m)" },
            ],
            sprossen: {
                1: {
                    soll: [
                        { wort: "ganz_s", richtung: "≤", wert: 30, wortlaut: "ganz ≤ 30 s", feld: "preis" },
                        { wort: "frame_p95_ms", richtung: "≤", wert: 33, wortlaut: "p95 ≤ 33 ms an beiden Geräten", feld: "preis" },
                    ],
                    umfang: { verlangt: 1, einheit: "km Teleport", wortlaut: "Teleport 1 km", feld: "umfang" },
                },
                2: {
                    soll: [
                        { wort: "ganz_s", richtung: "≤", wert: 5, wortlaut: "ganz ≤ 5 s", feld: "preis" },
                        { wort: "frame_p95_ms", richtung: "≤", wert: 33, wortlaut: "p95 ≤ 33 ms an beiden Geräten", feld: "preis", aus: 1 },
                    ],
                    umfang: { verlangt: 1, einheit: "km Teleport", wortlaut: "Teleport 1 km", feld: "umfang" },
                },
                3: {
                    soll: [
                        { wort: "ganz_p95_s", richtung: "≤", wert: 2, wortlaut: "ganz ≤ 2 s", feld: "preis" },
                        { wort: "frame_p95_ms", richtung: "≤", wert: 33, wortlaut: "p95 ≤ 33 ms an beiden Geräten", feld: "preis", aus: 1 },
                    ],
                    umfang: { verlangt: 20, einheit: "Sprünge 10–100 km", wortlaut: "N = 20 Sprünge", feld: "richter" },
                    welt: [
                        { wort: "bilder", ab: 30, was: "Bilder des Loops im Strom der Zelle nach dem Sprung" },
                        { wort: "weg_km", ab: 9, was: "Weg des Spielers beim fernen Sprung (km)" },
                    ],
                },
                4: {
                    soll: [{ wort: "ganz_p95_s", richtung: "≤", wert: 2, wortlaut: "ganz ≤ 2 s", feld: "preis" }],
                    umfang: { verlangt: 1e8, einheit: "Orte à 100 m eines Planeten", wortlaut: "(10⁸ Orte à 100 m)", feld: "umfang" },
                },
                5: {
                    soll: [{ wort: "ganz_s", richtung: "≤", wert: 3, wortlaut: "ganz ≤ 3 s", feld: "preis" }],
                    umfang: { verlangt: 10, einheit: "Epochen", wortlaut: "10 Epochen × 10 Orte", feld: "richter" },
                },
                6: {
                    soll: [{ wort: "ganz_s", richtung: "≤", wert: 2, wortlaut: "ganz ≤ 2 s", feld: "preis" }],
                    umfang: { verlangt: 20, einheit: "Planeten", wortlaut: "20 zufällige Planeten", feld: "richter" },
                },
                7: {
                    soll: [{ wort: "ganz_s", richtung: "≤", wert: 2, wortlaut: "ganz ≤ 2 s", feld: "preis" }],
                    umfang: { verlangt: 20, einheit: "Sterne", wortlaut: "N = 20 zufällige Sterne", feld: "richter" },
                },
                8: {
                    soll: [
                        { wort: "ganz_p95_s", richtung: "≤", wert: 1, wortlaut: "p95 ≤ 1 s bis ganz", feld: "richter" },
                        { wort: "frame_p95_ms", richtung: "≤", wert: 33, wortlaut: "danach Frame p95 ≤ 33 ms", feld: "richter" },
                    ],
                    umfang: { verlangt: 100, einheit: "Zufalls-Sprünge", wortlaut: "N = 100 Zufalls-Sprünge", feld: "richter" },
                },
            },
            lauf: async function sprungLauf(H, P, L) {
                // die Lage, die erste trockene Richtung im Abstand `km` (das Wasser-Gesetz `_nassAt` trägt auch ungeladene Ferne)
                function ziel(r, o) {
                    const p = r.state.playerMesh.position;
                    for (let k = 0; k < 8; k++) {
                        const a = o.a0 + (k * Math.PI) / 4, x = p.x + o.km * 1000 * Math.sin(a), z = p.z + o.km * 1000 * Math.cos(a);
                        if (!r._nassAt(x, z)) return { x, z, a, von: [p.x, p.z], km: Math.round(Math.hypot(x - p.x, z - p.z)) / 1000 };
                    }
                    return null;
                }
                // DER SPRUNG: die Lage wie die Werkbank sie setzt (`_voxelSurfaceY` + 1,8), ohne Fahrt; die Wache der Seite (`setInterval`,
                // 50 ms) nennt das erste Stehen der Welt in der Wanduhr der Seite
                function springe(r, o) {
                    const s = r.state, m = s.playerMesh;
                    const v = r._voxelSurfaceY(o.x, o.z), y = Number.isFinite(v) ? v : r.getTerrainHeightAt(o.x, o.z);
                    // die Wache hängt am Spiel-Objekt, nie am Stand (`state` reist im Speichern)
                    if (r.__k2Sprung) clearInterval(r.__k2Sprung.id);
                    const W = (r.__k2Sprung = { t0: performance.now(), ganz: null, von: [m.position.x, m.position.z] });
                    m.position.set(o.x, y + 1.8, o.z);
                    if (s.playerVel && s.playerVel.setValue) s.playerVel.setValue(0, 0, 0);
                    s._fieldVy = 0;
                    if (s._fixedSimPos) s._fixedSimPos.copy(m.position);
                    W.id = setInterval(() => {
                        if (W.ganz === null && r._weltSteht() && !r._bepflanzungWartet()) W.ganz = performance.now() - W.t0;
                    }, 50);
                    return { y };
                }
                function wache(r, o) {
                    const s = r.state, W = r.__k2Sprung, m = s.playerMesh;
                    if (!W) return null;
                    const aus = { ganz_s: W.ganz === null ? null : Math.round(W.ganz) / 1000, wand_s: Math.round(performance.now() - W.t0) / 1000, weg_m: Math.round(Math.hypot(m.position.x - W.von[0], m.position.z - W.von[1])) };
                    if (o && o.ende) {
                        clearInterval(W.id);
                        delete r.__k2Sprung;
                    }
                    if (aus.ganz_s === null) aus.offen = JSON.stringify(r._weltOffen()).slice(0, 200);
                    return aus;
                }
                const ev = (f, a, s) => L.ev("return (" + f + ")(r, " + JSON.stringify(a === undefined ? null : a) + ");", s || 20);
                // ein Sprung im Strom der Zelle: Scheiben von `scheibe` s Loop, bis die Welt steht (+ 2 s danach) oder `bis` s Loop
                const sprung = async (zelle, zz, scheibe, bis, reserve) => {
                    await L.zelle(zelle);
                    await ev(springe, zz);
                    let lauf = 0, w = null;
                    try {
                        while (lauf < bis && L.rest() > reserve + scheibe + 3) {
                            await L.wb("/lauf", { sek: scheibe, ein: 0 }, scheibe + 60);
                            lauf += scheibe;
                            w = await ev(wache);
                            if (w && w.ganz_s !== null) {
                                if (w.wand_s - w.ganz_s < 2) {
                                    await L.wb("/lauf", { sek: 2, ein: 0 }, 62);
                                    lauf += 2;
                                }
                                break;
                            }
                        }
                    } finally {
                        w = Object.assign(w || {}, await ev(wache, { ende: true }));
                        await L.zelle(null);
                    }
                    const b = L.bilder(zelle);
                    return Object.assign(w, { lauf, bilder: b.length, p95: L.p95(b.map((x) => x.dt)) });
                };
                const RESERVE = 22; // der Rückweg an den Start und die Preis-Pose (die Frist der Probe riss sonst: UNGEMESSEN)
                await L.ort("wiese", "ego");
                L.preisPose("wiese", "ego");
                const meta = await L.ev("return { saat: r.state.worldMeta && r.state.worldMeta.seed, tag: r.state.worldMeta && r.state.worldMeta.tag };", 20);
                const z1 = await ev(ziel, { km: 1, a0: 0 });
                L.zeile("Sprung 1 km: " + JSON.stringify(z1));
                const spruenge = [];
                let s1 = null;
                if (z1) {
                    s1 = await sprung("sprung-1km", z1, 6, 30, RESERVE);
                    L.zeile("Ankunft 1 km: " + JSON.stringify(s1));
                    spruenge.push(s1);
                }
                const tat1 = s1 ? "1 km: ganz " + s1.ganz_s + " s (Wanduhr " + s1.wand_s + " s, Loop " + s1.lauf + " s), " + s1.bilder + " Bilder" + (s1.offen ? " · offen " + s1.offen : "") : "kein trockenes Ziel 1 km um den Spieler";
                await L.je(1, async () => {
                    if (!s1) throw new Error(tat1);
                    L.gemessen(1, { ganz_s: s1.ganz_s, frame_p95_ms: s1.p95 }, { erzeugt: z1.km, welt: { bilder: s1.bilder, weg_m: s1.weg_m }, taeter: tat1 });
                });
                await L.je(2, async () => {
                    if (!s1) throw new Error(tat1);
                    L.gemessen(2, { ganz_s: s1.ganz_s, frame_p95_ms: s1.p95 }, { erzeugt: z1.km, welt: { bilder: s1.bilder, weg_m: s1.weg_m }, taeter: tat1 });
                });
                // S3: ein Sprung 10–30 km, wenn die Frist ihn und den Rückweg trägt
                let s3 = null;
                if (L.rest() > RESERVE + 16) {
                    const km = 10 + Math.round((Date.now() % 997) / 50);
                    const z3 = await ev(ziel, { km, a0: 1.1 });
                    if (z3) {
                        s3 = await sprung("sprung-fern", z3, 4, 8, RESERVE);
                        s3.km = km;
                        L.zeile("Ankunft " + km + " km: " + JSON.stringify(s3));
                        spruenge.push(s3);
                    }
                }
                // zurück an den Start (die Preis-Pose stellt danach den Messort)
                if (z1) {
                    const heim = await sprung("sprung-heim", { x: z1.von[0], z: z1.von[1] }, 4, 12, 7);
                    L.zeile("zurück am Start: " + JSON.stringify(heim));
                }
                await L.je(3, async () => {
                    if (!s3) return L.umfang(3, 0, "die Leiter trug nach dem 1-km-Sprung keinen Sprung 10–100 km in ihrer Frist (" + Math.round(L.rest()) + " s Rest)");
                    L.gemessen(3, { ganz_p95_s: s3.ganz_s, frame_p95_ms: s3.p95 }, { erzeugt: 1, welt: { bilder: s3.bilder, weg_m: s3.weg_m, weg_km: s3.weg_m / 1000 }, taeter: s3.km + " km: ganz " + s3.ganz_s + " s (Wanduhr " + s3.wand_s + " s)" + (s3.offen ? " · offen " + s3.offen : "") });
                });
                await L.je(4, async () => L.umfang(4, spruenge.length, "die Probe sprang " + spruenge.length + "-mal binnen 30 km; der Grund ist eine Ebene ohne Planeten-Koordinate (foundry-core.js:284 rechnet die Kugel nur für den Himmel)"));
                await L.je(5, async () => L.umfang(5, 1, "die Sitzung hält eine Epoche (Tag " + meta.tag + " der Welt " + meta.saat + "), kein Sprung in eine andere Zeit"));
                await L.je(6, async () => L.umfang(6, 1, "die Sitzung hält einen Planeten (" + meta.saat + ")"));
                await L.je(7, async () => L.umfang(7, 1, "die Sitzung hält einen Stern (" + meta.saat + ")"));
                await L.je(8, async () => L.umfang(8, spruenge.length, "die Probe sprang " + spruenge.length + "-mal in ihrer Frist (sek 60)"));
            },
        })
    );

    // ─────────── same.massstab.physik — Physik über den Maßstab ───────────
    // S1 trägt die Station g6 (bestehend). Gezählt: die Spanne der Größen der Werke an der Mess-Wiese (die Hülle der Teile × Skala, die
    // größte Kante) in Größenordnungen — der Umfang von S2 und S6; Tropfen, Bahn und Gezeiten fehlen dem Löser beim Namen.
    LEITERN.push(
        leiter({
            leiter: "same.massstab.physik",
            sek: 30,
            pfad: ["scripts/werkbank.cjs", "stamm/bau-buch.js", "stamm/koerper-frei.js", "stamm/wasser-zellen.js", "stamm/wasser-hydro.js"],
            bestehend: [1],
            welt: [{ wort: "koerper", ab: 1, was: "Körper der Welt, die die Messung bewegt" }],
            sprossen: {
                2: {
                    soll: [{ wort: "endtempo_abw_pct", richtung: "≤", wert: 20, wortlaut: "Endgeschwindigkeit eines 5-mm-Körpers ±20 % gegen ~6 m/s", feld: "richter" }],
                    umfang: { verlangt: 3, einheit: "Größenordnungen der Werke an der Pose", wortlaut: "3 (Ameise bis Haus)", feld: "umfang" },
                },
                3: { soll: [{ wort: "bond_abw_pct", richtung: "≤", wert: 15, wortlaut: "Tropfenform gegen Bond-Zahl ±15 %", feld: "richter" }] },
                4: { soll: [{ wort: "kepler_abw_pct", richtung: "≤", wert: 1, wortlaut: "Umlaufzeit gegen Kepler ±1 %", feld: "richter" }] },
                5: {
                    soll: [
                        { wort: "tide_abw_pct", richtung: "≤", wert: 5, wortlaut: "Tidenhub-Periode ±5 %", feld: "richter" },
                        { wort: "abplattung_abw_pct", richtung: "≤", wert: 10, wortlaut: "Abplattung ±10 %", feld: "richter" },
                    ],
                },
                6: {
                    soll: [{ wort: "band_pct", richtung: "≥", wert: 90, wortlaut: "im Band der dimensionslosen Gesetze ≥ 90 %", feld: "richter" }],
                    umfang: { verlangt: 12, einheit: "Größenordnungen der Werke an der Pose", wortlaut: "über 12 Größenordnungen", feld: "richter" },
                },
            },
            lauf: async function massPhysikLauf(H, P, L) {
                // die Größen der Werke binnen 120 m: die größte Kante der Hülle ihrer Teile × Skala
                function groessen(r) {
                    const s = r.state, bp = s.blueprints || {}, p = s.playerMesh.position;
                    let mn = Infinity, mx = 0, n = 0, mnTyp = null, mxTyp = null;
                    for (const e of s.architectures || []) {
                        const b = bp[e.type];
                        if (!b || !Array.isArray(b.parts) || !b.parts.length || Math.hypot(e.position.x - p.x, e.position.z - p.z) > 120) continue;
                        let [x0, y0, z0, x1, y1, z1] = [Infinity, Infinity, Infinity, -Infinity, -Infinity, -Infinity];
                        for (const t of b.parts) {
                            const a = r._partWorldAABB(t);
                            if (!a) continue;
                            [x0, y0, z0] = [Math.min(x0, a.min.x), Math.min(y0, a.min.y), Math.min(z0, a.min.z)];
                            [x1, y1, z1] = [Math.max(x1, a.max.x), Math.max(y1, a.max.y), Math.max(z1, a.max.z)];
                        }
                        const sc = Number.isFinite(e.scale) && e.scale > 0 ? e.scale : 1;
                        const g = Math.max(x1 - x0, y1 - y0, z1 - z0) * sc;
                        if (!(g > 0)) continue;
                        n++;
                        if (g < mn) [mn, mnTyp] = [g, e.type];
                        if (g > mx) [mx, mxTyp] = [g, e.type];
                    }
                    return { n, min_m: n ? +mn.toPrecision(3) : null, max_m: n ? +mx.toPrecision(3) : null, mnTyp, mxTyp, ordnungen: n ? Math.round(100 * Math.log10(mx / mn)) / 100 : 0 };
                }
                await L.ort("wiese", "ego");
                L.preisPose("wiese", "ego");
                const g = await L.ev("return (" + groessen + ")(r);", 30);
                L.zeile("Größen der Werke binnen 120 m: " + JSON.stringify(g));
                const spanne = g.n + " Werke binnen 120 m spannen " + g.ordnungen + " Größenordnungen (" + g.min_m + " m " + g.mnTyp + " bis " + g.max_m + " m " + g.mxTyp + ")";
                await L.je(2, async () => {
                    if (g.ordnungen < P.sprossen[2].umfang.verlangt) return L.umfang(2, g.ordnungen, spanne);
                    L.leser(2, "Endgeschwindigkeit: der Löser kennt keinen Luftwiderstand, ein 5-mm-Körper fällt ohne Grenze (stamm/koerper-frei.js:421 `_freiSchritt`) — " + spanne, g.ordnungen);
                });
                await L.je(3, async () => L.leser(3, "Tropfenform: das Zellen-Wasser trägt keine Oberflächenspannung, kein Leser nennt die Form eines Tropfens (stamm/wasser-zellen.js:1641 `_tickWaterCA`)"));
                await L.je(4, async () => L.leser(4, "Umlauf: der Löser kennt nur die Schwere der Ebene, keine Zentralkraft eines Körpers (stamm/koerper-frei.js:421 `_freiSchritt`)"));
                await L.je(5, async () => L.leser(5, "Gezeiten und Abplattung: der Spiegel ist eine Funktion des Orts ohne Zeit (stamm/wasser-hydro.js:57 `_waterLevelAt`), der Planet trägt keine Drehung"));
                await L.je(6, async () => L.umfang(6, g.ordnungen, spanne));
            },
        })
    );
}

// ═══════════════════════════════════════ Perspektive gedaechtnis ═══════════════════════════════════════
{
    // ─────────── same.gedaechtnis.alter — Alter des Gebauten ───────────
    // S1/S2 an der vollen Stadt: die Albedo der gebauten Werke binnen 60 m (Lehre 19: Ecken-Farbe × Stoff-Farbe × Instanz-Farbe des
    // Bau-Satzes, der Host-Baupläne `g:` und der Bau-Teile mit `userData.stoff`) je LAGE der Fläche — oben, nord (−z), Wetterseite (gegen den Zug der Fronten,
    // `_alterWind`, dieselbe Richtung, die der Kern `_alterLage` liest) —, zweimal vorher (das Rauschen), dann springt die Welt-Uhr der
    // Prozesse um 30 Tage über den Weg, den das Spiel für eine spätere Uhr hat (`_weltUhrNimm`: Stand und Mitspieler; das Alter liest
    // `_weltTag`, nie die Uhr des Spielers — `setTimeOfDay` altert seit w28-lava-nachlauf nichts), der Loop des Spiels legt die gealterten
    // Ecken (`_tickWerkAlter`), und die Albedo wird neu gelesen. S2: weiter bis 1 Jahr, das Bild an der Pose. S3–S8 zählen die Welt.
    LEITERN.push(
        leiter({
            leiter: "same.gedaechtnis.alter",
            sek: 60,
            mutiert: true,
            pfad: ["scripts/werkbank.cjs", "stamm/siedlung-satz.js", "stamm/siedlung-bauten.js", "stamm/bau-teile.js", "stamm/dirigent-takt.js", "stamm/dirigent-regler.js", "stamm/feld-leben.js", "stamm/bau-buch.js", "stamm/siedlung-ort.js"],
            welt: [
                { wort: "tage", ab: 30, was: "Tage, die die Welt-Uhr der Prozesse im Lauf sprang" },
                { wort: "werke", ab: 1, was: "Werke binnen 60 m mit alterndem Stoff" },
            ],
            sprossen: {
                1: {
                    soll: [
                        { wort: "albedo_delta", richtung: "≥", wert: 0.02, wortlaut: "Δ Albedo ≥ 0,02", feld: "richter" },
                        { wort: "seiten_delta", richtung: "≥", wert: 0.02, wortlaut: "Δ Albedo ≥ 0,02, Nord- und Wetterseite verschieden", feld: "richter" },
                    ],
                    umfang: { verlangt: 3, einheit: "alternde Stoffe in einem Werk", wortlaut: "1 Werk, 3 Stoffe", feld: "umfang" },
                },
                2: {
                    auge: {
                        pose: "stadt-voll third · die Werke am Markt nach einem Sprung der Welt-Uhr der Prozesse um 1 Jahr (365 d)",
                        vorbild: "Fotos derselben Stoffe nach einem Jahr: Holz vergraut, Eisen rostet nur im Regen, Moos nord, Flechte oben, Algen im Regenlauf (Soll-Farbe je Schicht)",
                    },
                },
                3: {
                    soll: [{ wort: "gleich_alt_pct", richtung: "≥", wert: 60, wortlaut: "≥ 60 % schätzen gleich alt", feld: "richter" }],
                    umfang: { verlangt: 1e4, einheit: "Werke der Welt", wortlaut: "(10⁴ Werke)", feld: "umfang" },
                },
                4: {
                    soll: [{ wort: "faktor", richtung: "≤", wert: 2, wortlaut: "Fehler ≤ Faktor 2", feld: "richter" }],
                    umfang: { verlangt: 1e5, einheit: "Werke der Welt", wortlaut: "(10⁵ Werke)", feld: "umfang" },
                },
                5: {
                    soll: [{ wort: "stehend_pct", richtung: "≥", wert: 80, wortlaut: "im Ingenieurs-Band ≥ 80 %", feld: "richter" }],
                    umfang: { verlangt: 50, einheit: "Stoff-Saaten", wortlaut: "N = 50 Stoff-Saaten", feld: "richter" },
                },
                6: {
                    soll: [
                        { wort: "verwechslung_pct", richtung: "≥", wert: 50, wortlaut: "≥ 50 % Verwechslung", feld: "richter" },
                        { wort: "klima_pct", richtung: "≥", wert: 70, wortlaut: "Panel ordnet Klimazone ≥ 70 %", feld: "richter" },
                        { wort: "laden_s", richtung: "≤", wert: 5, wortlaut: "Ruinenstadt lädt ≤ 5 s", feld: "richter" },
                    ],
                    umfang: { verlangt: 1e6, einheit: "Werke der Welt", wortlaut: "(10⁶–10⁷ Werke)", feld: "umfang" },
                },
                7: { soll: [{ wort: "gefunden_pct", richtung: "≥", wert: 60, wortlaut: "Panel findet ≥ 60 % der verschwundenen Siedlungen", feld: "richter" }] },
                8: {
                    soll: [{ wort: "typ_pct", richtung: "≥", wert: 70, wortlaut: "Panel liest den Planeten-Typ aus der Ruine ≥ 70 %", feld: "richter" }],
                    umfang: { verlangt: 50, einheit: "Planeten", wortlaut: "N = 50 Planeten", feld: "richter" },
                },
            },
            lauf: async function alterLauf(H, P, L) {
                const ev = (f, a, s) => L.ev("return await (" + f + ")(r, " + JSON.stringify(a === undefined ? null : a) + ");", s || 30);
                // die Werke binnen R: je Werk die alternden Stoffe seiner Teile (die Zeile der Stoff-Tafel mit Schichten `alter`)
                function werkStoffe(r, o) {
                    const s = r.state, P = s.playerMesh.position, M = s.materials || {}, bp = s.blueprints || {}, wm = s.worldMeta || {};
                    const memo = new Map();
                    const altert = (n) => {
                        if (!memo.has(n)) {
                            const z = M[n] ? r._stoff(n) : null;
                            memo.set(n, !!(z && Array.isArray(z.alter) && z.alter.length));
                        }
                        return memo.get(n);
                    };
                    let werke = 0, max = 0, typ = null;
                    for (const e of s.architectures || []) {
                        if (!e || !e.position || Math.hypot(e.position.x - P.x, e.position.z - P.z) > o.R) continue;
                        const b = bp[e.type];
                        if (!b || !Array.isArray(b.parts)) continue;
                        const set = new Set();
                        for (const t of b.parts) if (t && typeof t.material === "string" && altert(t.material)) set.add(t.material);
                        if (set.size) werke++;
                        if (set.size > max) [max, typ] = [set.size, e.type + " (" + [...set].join(", ") + ")"];
                    }
                    // die Studio-Werke im Bau-Satz: je Rezept die Arten seiner alternden Gruppen — der Name, als den das Spiel die Gruppe
                    // altert (`_satzAlter(g).stoff`: die Tafel des Gesetzes des Alters je Art des Gefüges), nie eine eigene Zuordnung
                    const jeRezept = new Map();
                    for (const g of (s.archInstanceGroups || new Map()).values()) {
                        if (!g || !g.satz || !(g.liveCount > 0) || !g.mesh || !g.mesh.instanceMatrix) continue;
                        const im = g.mesh.instanceMatrix.array;
                        const al = Math.hypot(im[12] - P.x, im[14] - P.z) > o.R ? null : r._satzAlter(g);
                        if (!al) continue;
                        if (typeof al.stoff !== "string" || !al.stoff) throw new Error("same.gedaechtnis.alter: _satzAlter(g) nennt die Art nicht (" + String(g.key) + ")");
                        const pre = /^f:([^|]+)\|/.exec(String(g.key));
                        if (!pre) continue;
                        if (!jeRezept.has(pre[1])) jeRezept.set(pre[1], new Set());
                        jeRezept.get(pre[1]).add(al.stoff);
                    }
                    for (const [k, set] of jeRezept) if (set.size > max) [max, typ] = [set.size, k + " (" + [...set].join(", ") + ")"];
                    werke += jeRezept.size;
                    const teil = r._gelaende().ort.teil;
                    return {
                        werke, max, typ, alle: (s.architectures || []).length, siedlungen: Object.keys(wm.settlementCells || {}).length,
                        saat: wm.seed, planet: r._planetSamen(), zeitMa: teil && Number.isFinite(teil.zeitMa) ? teil.zeitMa : 0,
                        tag: r._weltTag(), wind: r._alterWind(),
                    };
                }
                // die Albedo der gebauten Werke binnen R je Klasse und Lage (die Vertex-Farbe × Stoff-Farbe × Instanz-Farbe, Lehre 19)
                function lies(r, o) {
                    const s = r.state, P = s.playerMesh.position;
                    const w0 = r._alterWind(), wl = Math.hypot(w0.x, w0.z) || 1, gx = w0.x / wl, gz = w0.z / wl;
                    const aus = {};
                    const c = new T.Color(), n = new T.Vector3(), p = new T.Vector3(), nm = new T.Matrix3(), im = new T.Matrix4(), wm = new T.Matrix4();
                    const sammle = (kl, lage, rgb) => {
                        const e = aus[kl] || (aus[kl] = {});
                        const q = e[lage] || (e[lage] = [0, 0, 0, 0]);
                        q[0] += rgb[0];
                        q[1] += rgb[1];
                        q[2] += rgb[2];
                        q[3]++;
                    };
                    s.scene.traverse((m) => {
                        if (!m.isMesh || !m.visible || !m.geometry || !m.geometry.attributes.normal) return;
                        // nur Gebautes: der Bau-Satz (Häuser, Ausstattung, Tore in Welt-Lage, `userData.bauSatz`), die Host-Baupläne `g:` und
                        // die Bau-Teile mit Stoff — nie Boden, Streu oder Baum (deren Bild ändert der Sprung über Saison und Nachwuchs)
                        const u = m.userData || {};
                        const kl = u.bauSatz ? "satz:" + (m.name || u.bauSatz) : u.stoff ? "stoff:" + u.stoff : r._taeterKlasse(m);
                        if (!(u.bauSatz || u.stoff || /^g:/.test(kl))) return;
                        const g = m.geometry, pos = g.attributes.position, nor = g.attributes.normal, col = g.attributes.color;
                        const mc = m.material && !Array.isArray(m.material) && m.material.color ? m.material.color : c.setRGB(1, 1, 1);
                        const inst = m.isInstancedMesh ? Math.min(m.count, 64) : 1;
                        for (let i = 0; i < inst; i++) {
                            if (m.isInstancedMesh) m.getMatrixAt(i, im), wm.multiplyMatrices(m.matrixWorld, im);
                            else wm.copy(m.matrixWorld);
                            if (m.isInstancedMesh && Math.hypot(wm.elements[12] - P.x, wm.elements[14] - P.z) > o.R) continue;
                            nm.getNormalMatrix(wm);
                            const ic = m.isInstancedMesh && m.instanceColor ? [m.instanceColor.getX(i), m.instanceColor.getY(i), m.instanceColor.getZ(i)] : [1, 1, 1];
                            const schritt = m.isInstancedMesh ? Math.max(1, Math.floor(pos.count / 400)) : Math.max(1, Math.floor(pos.count / 200000));
                            for (let v = 0; v < pos.count; v += schritt) {
                                if (!m.isInstancedMesh && (p.fromBufferAttribute(pos, v).applyMatrix4(wm), Math.hypot(p.x - P.x, p.z - P.z) > o.R)) continue;
                                n.fromBufferAttribute(nor, v).applyMatrix3(nm).normalize();
                                const lagen = [];
                                if (n.y > 0.7) lagen.push("oben");
                                else if (Math.abs(n.y) < 0.3) {
                                    if (n.z < -0.5) lagen.push("nord");
                                    if (-(n.x * gx + n.z * gz) > 0.5) lagen.push("wetter");
                                }
                                if (!lagen.length) continue;
                                const vc = col ? [col.getX(v), col.getY(v), col.getZ(v)] : [1, 1, 1];
                                const rgb = [vc[0] * mc.r * ic[0], vc[1] * mc.g * ic[1], vc[2] * mc.b * ic[2]];
                                for (const l of lagen) sammle(kl, l, rgb);
                            }
                        }
                    });
                    for (const e of Object.values(aus)) for (const [l, q] of Object.entries(e)) e[l] = q[3] ? [q[0] / q[3], q[1] / q[3], q[2] / q[3], q[3]] : null;
                    return { je: aus, tag: r._weltTag() };
                }
                // DER SPRUNG der Welt-Uhr der Prozesse um `tage` (+ 1 s: nie weicher als die Karte) über den Weg des Spiels für eine spätere Uhr
                function sprung(r, o) {
                    const s = r.state, t0 = r._weltTag();
                    r._weltUhrNimm(s.spielZeit + o.tage * r._kalender().tagS + 1);
                    return { vor: t0, nach: r._weltTag() };
                }
                function offen(r) {
                    return {
                        gelaufen: r._werkAlterTag === Math.floor(r._weltTag()),
                        werke: r._werkAltertOffen ? r._werkAltertOffen.size : 0,
                        satz: r._satzAltertOffen ? r._satzAltertOffen.length : 0,
                    };
                }
                // der Loop des Spiels legt die gealterten Ecken: Scheiben von 1 s, bis der Tag gelaufen ist und nichts mehr wartet
                const altern = async (bis) => {
                    let o = null, n = 0;
                    while (n < bis) {
                        await L.wb("/lauf", { sek: 1, ein: 0 }, 61);
                        n++;
                        o = await ev(offen);
                        if (o.gelaufen && !o.werke && !o.satz) break;
                    }
                    return Object.assign(o || {}, { lauf_s: n });
                };
                const d = (a, b) => (a && b ? Math.max(Math.abs(b[0] - a[0]), Math.abs(b[1] - a[1]), Math.abs(b[2] - a[2])) : null);
                const r4 = (v) => (Number.isFinite(v) ? Math.round(v * 1e4) / 1e4 : null);
                // je Klasse: Δ je Lage (≥ 20 Ecken) über dem Rauschen der Klasse; die Seiten: |Δ nord − Δ wetter|
                const vergleich = (vor, zwei, nach) => {
                    let albedo = null, seiten = null, wo = null, wos = null;
                    for (const kl of Object.keys(vor.je)) {
                        const a = vor.je[kl], b = nach.je[kl], z = zwei.je[kl] || {};
                        if (!b) continue;
                        const rausch = Math.max(0, ...Object.keys(a).map((l) => d(a[l], z[l]) || 0));
                        const D = {};
                        for (const l of ["oben", "nord", "wetter"]) if (a[l] && b[l] && a[l][3] >= 20) D[l] = d(a[l], b[l]);
                        for (const l of Object.keys(D)) if (albedo === null || D[l] - rausch > albedo) [albedo, wo] = [D[l] - rausch, kl + " " + l + " Δ " + r4(D[l]) + " (Rauschen " + r4(rausch) + ")"];
                        if ("nord" in D && "wetter" in D) {
                            const sd = Math.abs(D.nord - D.wetter);
                            if (seiten === null || sd > seiten) [seiten, wos] = [sd, kl + " nord Δ " + r4(D.nord) + " · wetter Δ " + r4(D.wetter)];
                        }
                    }
                    return { albedo: r4(albedo), seiten: r4(seiten), wo, wos, klassen: Object.keys(vor.je).length };
                };
                await L.ort("stadt-voll", "third");
                L.preisPose("stadt-voll", "third");
                const w = await ev(werkStoffe, { R: 60 });
                L.zeile("Werke und Welt der Sitzung: " + JSON.stringify(w));
                // S3–S8: die Welt zählt
                const formOhne = "das Alter färbt nur Ecken (stamm/siedlung-satz.js:913 `_werkAlterFaerbe`), kein Gesetz ändert die Gestalt eines Werks";
                await L.je(3, async () => {
                    if (w.alle < P.sprossen[3].umfang.verlangt) return L.umfang(3, w.alle, "die Welt trägt " + w.alle + " Werke");
                    L.leser(3, "Gebrauch und wachsender Schaden: kein Leser der Nutzung (Schwelle, Ruß, Rostfahne), die Stufe des Alters sättigt (1 − e^−t, stamm/siedlung-satz.js:825 `_werkAlterStufe`)", w.alle);
                });
                await L.je(4, async () => {
                    if (w.alle < P.sprossen[4].umfang.verlangt) return L.umfang(4, w.alle, "die Welt trägt " + w.alle + " Werke");
                    L.leser(4, "Dach, Fenster, Schutt: " + formOhne, w.alle);
                });
                await L.je(5, async () => L.umfang(5, 1, "die Sitzung hält eine Saat (" + w.saat + ") und damit eine Stoff-Tafel; dahinter fehlt der Bruch am Alter (stamm/siedlung-satz.js:800 `_werkAlterOv` treibt nur den Regler `verwitterung`)"));
                await L.je(6, async () => {
                    if (w.alle < P.sprossen[6].umfang.verlangt) return L.umfang(6, w.alle, "die Welt trägt " + w.alle + " Werke");
                    L.leser(6, "Ruinenfeld: " + formOhne, w.alle);
                });
                await L.je(7, async () => L.leser(7, "verschwundene Siedlung: eine Siedlung wird einmal in ihre Zelle geschrieben und vergeht nie (stamm/siedlung-ort.js:2020 `settlementCells`) — die Welt trägt " + w.siedlungen + " Siedlungen"));
                await L.je(8, async () => L.umfang(8, 1, "die Sitzung hält einen Planeten (Samen " + w.planet + "), keine fremde Umwelt"));
                // S1: vorher zweimal, 30 Tage, nachher
                let nach30 = null, s30 = null, a30 = null, vor = null;
                await L.je(1, async () => {
                    if (L.rest() < 26) throw new Error("die Frist trägt die 30 Tage nicht mehr: " + Math.round(L.rest()) + " s Rest nach dem Ort");
                    vor = await ev(lies, { R: 60 });
                    const zwei = await ev(lies, { R: 60 });
                    s30 = await ev(sprung, { tage: 30 });
                    a30 = await altern(6);
                    nach30 = await ev(lies, { R: 60 });
                    const v = vergleich(vor, zwei, nach30);
                    L.zeile("Alter 30 d: Sprung " + JSON.stringify(s30) + " · Loop " + JSON.stringify(a30) + " · " + JSON.stringify(v));
                    const tage = r4(s30.nach - s30.vor);
                    L.gemessen(1, { albedo_delta: v.albedo, seiten_delta: v.seiten }, {
                        erzeugt: w.max,
                        welt: { tage, werke: w.werke },
                        taeter: "größtes Δ " + (v.wo || "keines") + " · Seiten " + (v.wos || "keine Klasse mit Nord- und Wetterseite") + " · " + v.klassen + " Klassen · reichstes Werk " + (w.typ || "keines") + (a30.gelaufen && !a30.werke && !a30.satz ? "" : " · nach " + a30.lauf_s + " s Loop warteten " + a30.werke + " Werke, " + a30.satz + " Sätze"),
                    });
                });
                // S2: weiter bis 1 Jahr, das Bild an der Pose (die Zahlen daneben)
                await L.je(2, async () => {
                    if (!s30) throw new Error("der 30-Tage-Sprung (S1) lief nicht");
                    if (L.rest() < 24) throw new Error("die Frist trägt das Jahr nicht mehr: " + Math.round(L.rest()) + " s Rest");
                    const s365 = await ev(sprung, { tage: 335 });
                    const a365 = await altern(4);
                    const nach365 = await ev(lies, { R: 60 });
                    const v = vergleich(vor, vor, nach365);
                    L.zeile("Alter 1 a: Sprung " + JSON.stringify(s365) + " · Loop " + JSON.stringify(a365) + " · " + JSON.stringify(v));
                    await L.auge(2, { werte: { albedo_delta_1a: v.albedo, seiten_delta_1a: v.seiten, tage: r4(s365.nach - s30.vor) } });
                });
            },
        })
    );

    // ─────────── same.gedaechtnis.pfad — Spur des Gangs ───────────
    // S1 trägt die Station g1 (bestehend). S2 an der vollen Stadt: die Zellen des Trampelpfads (`worldMeta.tritt`, die Stufe der Zelle heute
    // > 0: `_trittStufe`, der Pfad, den der Boden zeigt und Wiese und Streu lesen) binnen 400 m der Siedlung, und je Zelle, ob sie auf einer
    // Kürzesten-Weg-Linie zwischen den Zielen eines Bewohners liegt (die Gerade zwischen Tür, Werk, Mahl, Abend, Platz — `b.orte`), binnen
    // der Halbbreite der Spur + Zelle + `BEWOHNER.spurM`. Die Spieltage sind die Welt-Uhr der Prozesse seit dem Anfang der Welt.
    LEITERN.push(
        leiter({
            leiter: "same.gedaechtnis.pfad",
            sek: 30,
            pfad: ["scripts/werkbank.cjs", "stamm/siedlung-wege.js", "stamm/siedlung-bewohner.js", "stamm/siedlung-ort.js", "stamm/feld-leben.js"],
            bestehend: [1],
            welt: [{ wort: "pfad_zellen", ab: 1, was: "Zellen, die die Leiber der Welt zum Pfad traten" }],
            sprossen: {
                2: {
                    soll: [
                        { wort: "pfad_pct", richtung: "≥", wert: 70, wortlaut: "Pfad-Pixel auf Kürzesten-Weg-Linien zwischen Zielen ≥ 70 %", feld: "richter" },
                        { wort: "leiber", richtung: "≥", wert: 100, wortlaut: "~10² Leiber eines Dorfs", feld: "umfang" },
                    ],
                    umfang: { verlangt: 30, einheit: "Spieltage Gang der Leiber", wortlaut: "nach 30 Spieltagen", feld: "richter" },
                },
                3: {
                    auge: { pose: "stadt-voll · Luftbild über dem Platz", vorbild: "Luftbilder echter Parks: Netzform, Knotengrad, Abkürzungs-Anteil" },
                    umfang: { verlangt: 1e4, einheit: "Leiber und Fahrzeuge der Stadt", wortlaut: "10⁴ Leiber und Fahrzeuge", feld: "umfang" },
                },
                4: {
                    soll: [
                        { wort: "hohlweg_min_m", richtung: "≥", wert: 0.5, wortlaut: "Hohlweg-Tiefe nach 100 a im Band 0,5–3 m", feld: "richter" },
                        { wort: "hohlweg_max_m", richtung: "≤", wert: 3, wortlaut: "Hohlweg-Tiefe nach 100 a im Band 0,5–3 m", feld: "richter" },
                    ],
                    umfang: { verlangt: 1e6, einheit: "Leiber der Welt", wortlaut: "10⁶ Leiber", feld: "umfang" },
                },
                5: {
                    soll: [{ wort: "ueberdeckung_pct", richtung: "≥", wert: 60, wortlaut: "Überdeckung ≥ 60 %", feld: "richter" }],
                    umfang: { verlangt: 30, einheit: "Saaten", wortlaut: "N = 30 Saaten", feld: "richter" },
                },
                6: {
                    soll: [{ wort: "erkannt_pct", richtung: "≥", wert: 70, wortlaut: "Panel erkennt Fernrouten in ≥ 70 % der Saaten", feld: "richter" }],
                    umfang: { verlangt: 1e9, einheit: "Leiber der Welt", wortlaut: "10⁹–10¹⁰ Leiber", feld: "umfang" },
                },
            },
            lauf: async function pfadLauf(H, P, L) {
                function pfade(r, o) {
                    const s = r.state, A = AnazhRealm, TR = A.TRITT, p = s.playerMesh.position, wm = s.worldMeta || {};
                    let S = null, dS = Infinity, leiberAlle = 0;
                    const zahl = (X) => (X.liste ? X.liste.length : X.plan && X.plan.slots ? X.plan.slots.length : 0);
                    for (const X of (r._bewohnerSiedlungen || new Map()).values()) {
                        leiberAlle += zahl(X);
                        const dd = Math.hypot(X.ox - p.x, X.oz - p.z);
                        if (dd < dS) [S, dS] = [X, dd];
                    }
                    // die Kürzesten-Weg-Linien: je Bewohner die Geraden zwischen seinen Zielen
                    const seg = new Map();
                    for (const b of (S && S.liste) || []) {
                        const q = b && b.orte;
                        if (!q) continue;
                        const pts = ["tuer", "werk", "mahl", "abend", "platz"].map((k) => q[k]).filter((t) => t && Number.isFinite(t.x) && Number.isFinite(t.z));
                        for (let i = 0; i < pts.length; i++)
                            for (let j = i + 1; j < pts.length; j++) {
                                const [a, e] = [pts[i], pts[j]];
                                if (a.x === e.x && a.z === e.z) continue;
                                seg.set([a.x, a.z, e.x, e.z].map((v) => v.toFixed(1)).join(","), [a.x, a.z, e.x, e.z]);
                            }
                    }
                    const linien = [...seg.values()];
                    const nah = TR.halbM + TR.zelleM + A.BEWOHNER.spurM;
                    const ab = (x, z, l) => {
                        const [ax, az, bx, bz] = l, vx = bx - ax, vz = bz - az, L2 = vx * vx + vz * vz;
                        const t = L2 > 0 ? Math.max(0, Math.min(1, ((x - ax) * vx + (z - az) * vz) / L2)) : 0;
                        return Math.hypot(x - ax - t * vx, z - az - t * vz);
                    };
                    const [cx, cz] = S ? [S.ox, S.oz] : [p.x, p.z];
                    const jetzt = r._trittJetzt(), F = wm.tritt || {};
                    let zellen = 0, auf = 0;
                    for (const key in F) {
                        const [n, t] = F[key];
                        if (!(A._trittStufe(n * Math.exp(-(jetzt - t) / TR.erholTage)) > 0)) continue;
                        const [i, j] = key.split(",").map(Number);
                        const x = (i + 0.5) * TR.zelleM, z = (j + 0.5) * TR.zelleM;
                        if (Math.hypot(x - cx, z - cz) > o.R) continue;
                        zellen++;
                        for (const l of linien)
                            if (ab(x, z, l) <= nah) {
                                auf++;
                                break;
                            }
                    }
                    const wagen = (s.architectures || []).filter((e) => e && /^fahrzeug_/.test(e.type)).length;
                    return {
                        siedlung: S && S.key, abstand: Math.round(dS), leiber: S ? zahl(S) : 0, leiberAlle, wagen, linien: linien.length, nah,
                        zellen, auf, pct: zellen ? Math.round((1000 * auf) / zellen) / 10 : null, tage: Math.round((100 * (s.spielZeit || 0)) / r._kalender().tagS) / 100, saat: wm.seed,
                    };
                }
                await L.ort("stadt-voll", "third");
                L.preisPose("stadt-voll", "third");
                const z = await L.ev("return (" + pfade + ")(r, { R: 400 });", 30);
                L.zeile("Trampelpfad der Stadt: " + JSON.stringify(z));
                await L.je(2, async () =>
                    L.gemessen(2, { pfad_pct: z.pct, leiber: z.leiber }, {
                        erzeugt: z.tage,
                        welt: { pfad_zellen: z.zellen },
                        taeter: z.auf + " von " + z.zellen + " Pfad-Zellen binnen 400 m der Siedlung " + z.siedlung + " auf " + z.linien + " Geraden zwischen den Zielen ihrer " + z.leiber + " Bewohner (± " + z.nah + " m) · Welt-Uhr " + z.tage + " Spieltage",
                    })
                );
                const alle = z.leiberAlle + z.wagen;
                await L.je(3, async () => {
                    if (alle < P.sprossen[3].umfang.verlangt) return L.umfang(3, alle, "die Welt trägt " + z.leiberAlle + " Bewohner und " + z.wagen + " Wagen");
                    L.leser(3, "Spurrillen und Wildwechsel: der Tritt zählt Leiber, kein Rad (stamm/siedlung-wege.js:1638 `_trittDerLeiber`)", alle);
                });
                await L.je(4, async () => {
                    if (z.leiberAlle < P.sprossen[4].umfang.verlangt) return L.umfang(4, z.leiberAlle, "die Welt trägt " + z.leiberAlle + " Bewohner");
                    L.leser(4, "Hohlweg und Belag: der Tritt malt Erde in die Wege-Karte, er senkt keinen Grund und legt keinen Kies (stamm/siedlung-wege.js:1655 `_tritt`)", z.leiberAlle);
                });
                await L.je(5, async () => L.umfang(5, 1, "die Sitzung hält eine Saat (" + z.saat + "); dahinter liest das Wegenetz keinen Tritt (stamm/siedlung-ort.js:3231 `_wegeNetzGrund`)"));
                await L.je(6, async () => L.umfang(6, z.leiberAlle, "die Welt trägt " + z.leiberAlle + " Bewohner auf einem Planeten (Saat " + z.saat + ")"));
            },
        })
    );

    // ─────────── same.gedaechtnis.schicht — Kulturschichten ───────────
    // S1 an der Mess-Wiese: der Spieler gräbt eine Grube 4 m vor sich (die DSL-Op des Spiels `voxel_carve`, r 1,5 m, Mitte 1 m unter dem
    // Grund), die Wand neben ihr wird von oben bis zur Sohle in 10-cm-Schritten nach ihrem Stoff gefragt (`_terrainMaterialAt` mit Tiefe —
    // „die Farbe, die der Spieler sieht, bleibt das Material, das er bekommt“), dann füllt er sie wieder (`voxel_fill`). S2–S5 zählen; S6
    // fährt die Planeten (H.seite.SAATEN, der EINE Wechsel am Ort) zuletzt und liest je Saat die Säule am Spawn.
    LEITERN.push(
        leiter({
            leiter: "same.gedaechtnis.schicht",
            sek: 50,
            mutiert: true,
            pfad: ["scripts/werkbank.cjs", "stamm/feld-dsl.js", "stamm/vegetation-wiese.js", "stamm/gelaende-boden.js", "stamm/siedlung-ort.js", "stamm/feld-leben.js"],
            welt: [{ wort: "tiefe_m", ab: 1, was: "Tiefe der gegrabenen Grube (m)" }],
            sprossen: {
                1: {
                    soll: [{ wort: "schichten", richtung: "≥", wert: 3, wortlaut: "≥ 3 unterscheidbare Schichten im Bild", feld: "richter" }],
                    umfang: { verlangt: 1, einheit: "Grube", wortlaut: "1 Grube an einem Ort", feld: "umfang" },
                },
                2: {
                    soll: [
                        { wort: "rate_min", richtung: "≥", wert: 0.5, wortlaut: "Schichtdicke / Siedlungsdauer im Band 0,5–2 cm/a", feld: "richter" },
                        { wort: "rate_max", richtung: "≤", wert: 2, wortlaut: "Schichtdicke / Siedlungsdauer im Band 0,5–2 cm/a", feld: "richter" },
                    ],
                },
                3: {
                    soll: [
                        { wort: "tell_min_m", richtung: "≥", wert: 10, wortlaut: "Tells wachsen 10–20 m", feld: "tiefe" },
                        { wort: "tell_max_m", richtung: "≤", wert: 20, wortlaut: "Tells wachsen 10–20 m", feld: "tiefe" },
                    ],
                    umfang: { verlangt: 20, einheit: "Siedlungen der Welt", wortlaut: "N = 20", feld: "richter" },
                },
                4: {
                    soll: [
                        { wort: "mauer_pct", richtung: "≥", wert: 90, wortlaut: "Mauer-Linien ≥ 90 %", feld: "richter" },
                        { wort: "reihenfolge_pct", richtung: "≥", wert: 95, wortlaut: "Reihenfolge an ≥ 95 % von 100 Orten", feld: "richter" },
                    ],
                    umfang: { verlangt: 10, einheit: "Epochen übereinander", wortlaut: "10+ Epochen", feld: "umfang" },
                },
                5: { soll: [{ wort: "plausibel_pct", richtung: "≥", wert: 90, wortlaut: "plausible Abfolgen ≥ 90 %", feld: "richter" }] },
                6: {
                    soll: [{ wort: "horizont_pct", richtung: "≥", wert: 70, wortlaut: "Panel erkennt den Horizont ≥ 70 %", feld: "richter" }],
                    umfang: { verlangt: 20, einheit: "Planeten", wortlaut: "auf N = 20 Planeten", feld: "richter" },
                },
            },
            seite: { SAATEN },
            lauf: async function schichtLauf(H, P, L) {
                const ev = (f, a, s) => L.ev("return await (" + f + ")(r, " + JSON.stringify(a === undefined ? null : a) + ");", s || 30);
                function grube(r) {
                    const s = r.state, p = s.playerMesh.position, dv = s.camera.getWorldDirection(new T.Vector3());
                    const l = Math.hypot(dv.x, dv.z) || 1, [ux, uz] = [dv.x / l, dv.z / l];
                    const x = p.x + 4 * ux, z = p.z + 4 * uz, g0 = r._voxelSurfaceY(x, z);
                    if (!Number.isFinite(g0)) return { fehler: "kein Grund 4 m vor dem Spieler" };
                    const R = 1.5, cy = g0 - 1;
                    r.dslRun(["voxel_carve", x, cy, z, R], { source: "human" });
                    const boden = r._voxelSurfaceY(x, z);
                    // die Wand: die Säule 1,6 m neben der Mitte, quer zum Blick, von ihrem Grund bis zur Tiefe der Sohle
                    const wx = x - 1.6 * uz, wz = z + 1.6 * ux, gw = r._voxelSurfaceY(wx, wz);
                    const tief = Math.max(0.2, g0 - boden);
                    const folge = [];
                    for (let t = 0.05; t <= tief; t += 0.1) {
                        const m = r._terrainMaterialAt(wx, wz, gw - t);
                        if (!folge.length || folge[folge.length - 1][0] !== m) folge.push([m, Math.round(t * 100) / 100]);
                    }
                    return { x, z, cy, R, g0, boden, tiefe: Math.round((g0 - boden) * 100) / 100, wand: [wx, wz], folge };
                }
                function zaehle(r) {
                    const teil = r._gelaende().ort.teil, wm = r.state.worldMeta || {};
                    return {
                        siedlungen: Object.keys(wm.settlementCells || {}).length, zeitMa: teil && Number.isFinite(teil.zeitMa) ? teil.zeitMa : 0, planet: r._planetSamen(),
                        steinAb: AnazhRealm.STRATA_STEIN_DEPTH,
                    };
                }
                function zu(r, o) {
                    r.dslRun(["voxel_fill", o.x, o.cy, o.z, o.R], { source: "human" });
                    return { boden: r._voxelSurfaceY(o.x, o.z) };
                }
                const ort0 = Date.now();
                await L.ort("wiese", "ego");
                const ortMs = Date.now() - ort0;
                L.preisPose("wiese", "ego");
                const w = await ev(zaehle);
                L.zeile("Welt der Sitzung: " + JSON.stringify(w));
                const g = await ev(grube);
                L.zeile("Grube: " + JSON.stringify(g));
                await L.je(1, async () => {
                    if (g.fehler) throw new Error(g.fehler);
                    L.gemessen(1, { schichten: g.folge.length }, {
                        erzeugt: g.tiefe >= 1 ? 1 : 0,
                        welt: { tiefe_m: g.tiefe },
                        taeter: "die Wand der Grube (" + g.tiefe + " m) trägt " + g.folge.map((f) => f[0] + " ab " + f[1] + " m").join(" · ") + " — das Material wechselt erst " + w.steinAb + " m unter dem Grund zu Stein (stamm/vegetation-wiese.js:2362 `_terrainMaterialAt`)",
                    });
                });
                if (!g.fehler) {
                    await L.wb("/lauf", { sek: 1, ein: 0 }, 61);
                    L.zeile("Grube gefüllt: " + JSON.stringify(await ev(zu, g)));
                }
                const saeule = "das Material der Säule ist EINE Achse des Felds bis " + w.steinAb + " m Tiefe (stamm/vegetation-wiese.js:2362 `_terrainMaterialAt`)";
                await L.je(2, async () => L.leser(2, "Siedlungshügel: kein Gesetz legt Boden nach Siedlungsdauer ab — " + saeule));
                await L.je(3, async () => {
                    if (w.siedlungen < P.sprossen[3].umfang.verlangt) return L.umfang(3, w.siedlungen, "die Welt trägt " + w.siedlungen + " Siedlungen");
                    L.leser(3, "Tell: eine Siedlung wird einmal in ihre Zelle geschrieben, kein Hügel wächst unter ihr (stamm/siedlung-ort.js:2020)", w.siedlungen);
                });
                await L.je(4, async () => L.umfang(4, 1, "die Welt der Sitzung steht in einer Epoche (zeitMa " + w.zeitMa + "): die Epoche wechselt nur der Satz reise als eigene Welt (stamm/feld-leben.js:1277)"));
                await L.je(5, async () => L.leser(5, "Gräber, Horte, Wracks, Tunnel: kein Fund liegt im Boden — " + saeule));
                // S6 DIE SAATEN (H.seite.SAATEN, sitzung-seite.js): je Saat der Satz „neue welt saat <s>“, die Welt wechselt am Ort; je Saat
                // ihr Planet (`_planetSamen`) und die Säule am Spawn, von oben bis 2 m unter die Stein-Grenze in 25-cm-Schritten nach ihrem
                // Stoff gefragt (dasselbe `_terrainMaterialAt` wie S1, ohne zu graben). Zuletzt; der Heimweg samt dem doppelten ersten Gang
                // zur Wiese bleibt in der Frist (dort fährt der Preis, R3).
                await L.je(6, async () => {
                    const v = P.sprossen[6].umfang.verlangt;
                    const arg = { stamm: P.leiter + "-s6", n: v, bis: Date.now() + Math.max(0, (L.rest() - 3 - (2 * ortMs) / 1000) * 1000) };
                    const saeuleJe = function (r) {
                        const p = r.state.playerMesh.position, vy = r._voxelSurfaceY(p.x, p.z), g = Number.isFinite(vy) ? vy : r.getTerrainHeightAt(p.x, p.z);
                        const folge = [];
                        for (let t = 0.05; t <= AnazhRealm.STRATA_STEIN_DEPTH + 2; t += 0.25) {
                            const m = r._terrainMaterialAt(p.x, p.z, g - t);
                            if (!folge.length || folge[folge.length - 1][0] !== m) folge.push([m, Math.round(t * 100) / 100]);
                        }
                        return { planet: r._planetSamen(), folge: folge.map((f) => f[0] + "@" + f[1]).join(">") };
                    };
                    const s = await L.ev("return await (" + H.seite.SAATEN + ")(r, T, " + JSON.stringify(arg) + ", " + saeuleJe + ");", Math.max(5, L.rest() - 2));
                    if (s.fehler) throw new Error(s.fehler);
                    L.zeile("schicht S6 Saaten " + JSON.stringify(s));
                    const planeten = new Set(s.je.map((x) => x.z.planet)).size;
                    const zeit = "je Saat " + (s.msJe.join(" · ") || "—") + " ms, Heimweg " + s.heimweg.ms + " ms (zurück " + s.heimweg.zurueck + ", Versatz " + s.heimweg.versatz + " m)";
                    const folgen = "die Säule am Spawn je Saat " + ([...new Set(s.je.map((x) => x.z.folge))].join(" | ") || "—");
                    if (planeten < v) return L.umfang(6, planeten, "die Welt wechselte am Ort in " + s.je.length + " von " + v + " Saaten, " + planeten + " Planeten (" + zeit + "; Ende: " + s.grund + ")");
                    L.leser(6, "Bohrkern-Bild, Panel: kein Horizont im Kern — " + saeule + "; " + folgen + " auf " + planeten + " Planeten (" + zeit + ")", planeten);
                });
            },
        })
    );
}

// ═══════════════════════════════════════ Perspektive preis ═══════════════════════════════════════
{
    // ─────────── same.preis.ankunft — Ankunft ───────────
    // Das Argument ist die Stadt der Sitzung, gezählt an ihrer dichtesten Pose (stadt-voll, Third): Häuser (`state.architectures` ohne
    // Natur, vegetation-baum.js:2068 `_istNatur`) und Bewohner (`_bewohnerSiedlungen`, siedlung-bewohner.js:277). S1/S2 trägt ANKUNFT_VIER
    // (g6.js:3510/3538). Ab S3 verlangt jede Sprosse t(Kontrolle) kalt AN EINEM ORT: der Kalt-Boot mit leerer Platte trägt keine
    // Ankunfts-Pose und die Leiter-Minute bootet nie neu — wo der Umfang steht, urteilt der fehlende Leser, sonst der Umfang.
    LEITERN.push(
        leiter({
            leiter: "same.preis.ankunft",
            sek: 40,
            pfad: ["scripts/werkbank.cjs", "spec/profiband/haushalt.json", "stamm/siedlung-bewohner.js", "stamm/vegetation-baum.js", "stamm/gelaende-chunks.js", "stamm/speicher-laden.js"],
            welt: [{ wort: "haeuser", ab: 1, was: "Häuser der Stadt-Pose, in der Welt gezählt" }],
            bestehend: [1, 2],
            sprossen: {
                3: {
                    soll: [
                        { wort: "kalt_s", richtung: "≤", wert: 10, wortlaut: "≤ 10 s kalt", feld: "preis" },
                        { wort: "warm_s", richtung: "≤", wert: 3, wortlaut: "warm ≤ 3 s", feld: "preis" },
                    ],
                    umfang: { verlangt: 100, einheit: "Häuser des Dorfs", wortlaut: "Dorf (10² Häuser)", feld: "umfang", aus: 2 },
                },
                4: {
                    soll: [
                        { wort: "kalt_s", richtung: "≤", wert: 5, wortlaut: "≤ 5 s kalt an beiden Geräten", feld: "preis" },
                        { wort: "warm_s", richtung: "≤", wert: 1.5, wortlaut: "warm ≤ 1,5 s", feld: "preis" },
                    ],
                    umfang: { verlangt: 1000, einheit: "Häuser und Bewohner der Stadt (das kleinere)", wortlaut: "Stadt (10³ Häuser, 10³ Bewohner)", feld: "umfang" },
                },
                5: {
                    soll: [{ wort: "kalt_s", richtung: "≤", wert: 5, wortlaut: "≤ 5 s kalt an G1–G6 über 4G (9 Mbit/s)", feld: "preis" }],
                    umfang: { verlangt: 10000, einheit: "Häuser der Stadt", wortlaut: "Stadt (10⁴ Häuser)", feld: "umfang" },
                },
                6: {
                    soll: [
                        { wort: "kalt_s", richtung: "≤", wert: 2, wortlaut: "≤ 2 s kalt an G1–G7 über 4G", feld: "preis" },
                        { wort: "warm_s", richtung: "≤", wert: 0.5, wortlaut: "warm ≤ 0,5 s", feld: "preis" },
                    ],
                    umfang: { verlangt: 1e7, einheit: "Bewohner wirkend", wortlaut: "Megastadt (10⁷ Bewohner wirkend)", feld: "umfang" },
                },
                7: {
                    soll: [{ wort: "kalt_s", richtung: "≤", wert: 1, wortlaut: "≤ 1 s kalt an G1–G7 über 3G (1,6 Mbit/s)", feld: "preis" }],
                    umfang: { verlangt: 4e8, einheit: "Menschen der Stadt", wortlaut: "Stadt jenseits Tokio (≥ 4·10⁸)", feld: "umfang" },
                },
                8: {
                    soll: [{ wort: "kalt_s", richtung: "≤", wert: 1, wortlaut: "≤ 1 s kalt auf G0–G7 über 3G", feld: "preis" }],
                    umfang: { verlangt: 20, einheit: "zufällige (Same, Planet, Epoche)", wortlaut: "20 zufällige (Same, Planet, Epoche)", feld: "richter" },
                },
            },
            lauf: async function ankunftLauf(H, P, L) {
                const U = (nr) => P.sprossen[nr].umfang.verlangt;
                let w;
                try {
                    await L.ort("stadt-voll", "third");
                    w = await L.ev(
                        "const st = r.state; let haeuser = 0; for (const a of st.architectures || []) if (a && a.position && !r._istNatur(a)) haeuser++;" +
                            " let bew = 0, sied = 0; for (const S of (r._bewohnerSiedlungen || new Map()).values()) { sied++; bew += S.liste ? S.liste.length : S.plan && S.plan.slots ? S.plan.slots.length : 0; }" +
                            " const teil = r._gelaende().ort.teil; return { haeuser, bew, sied, saat: st.worldMeta && st.worldMeta.seed, planet: r._planetSamen(), zeitMa: teil && Number.isFinite(teil.zeitMa) ? teil.zeitMa : 0 };"
                    );
                } catch (e) {
                    if (e && e.messort) throw e;
                    w = { fehler: String((e && e.message) || e).split("\n")[0] };
                }
                L.preisPose("stadt-voll", "third");
                L.zeile("Stadt der Sitzung: " + JSON.stringify(w));
                const stadt = () => {
                    if (w.fehler) throw new Error("stadt-voll: " + w.fehler);
                    return w;
                };
                const KALT =
                    "t(Kontrolle) kalt und warm an einem Ort der Welt: der Kalt-Boot mit leerer Platte trägt keine Ankunfts-Pose (stamm/speicher-laden.js:296 `_loadStateRestorePlayerPosition` liest sie nur aus dem gesicherten Stand), die Kalt-Probe der Sitzung ANKUNFT_VIER bootet am Spawn (g6.js:1419), die Leiter-Minute bootet nie neu";
                const zahl = (s) => s.haeuser + " Häuser, " + s.bew + " Bewohner in " + s.sied + " Siedlungen";
                await L.je(3, async () => {
                    const s = stadt();
                    if (s.haeuser < U(3)) return L.umfang(3, s.haeuser, "die Welt der Sitzung trägt " + zahl(s));
                    L.leser(3, KALT + " — dazu die Drehung um 180° 2 s nach der Kontrolle", s.haeuser);
                });
                await L.je(4, async () => {
                    const s = stadt(), n = Math.min(s.haeuser, s.bew);
                    if (n < U(4)) return L.umfang(4, n, "die Stadt-Pose trägt " + zahl(s));
                    L.leser(4, KALT + " — in vier Richtungen", n);
                });
                await L.je(5, async () => {
                    const s = stadt();
                    if (s.haeuser < U(5)) return L.umfang(5, s.haeuser, "die Stadt-Pose trägt " + zahl(s));
                    L.leser(5, KALT + " — dazu das gedrosselte Netz (4G) je Geräteklasse", s.haeuser);
                });
                await L.je(6, async () => {
                    const s = stadt();
                    if (s.bew < U(6)) return L.umfang(6, s.bew, "die Welt wirkt mit " + zahl(s) + " — keine Megastadt");
                    L.leser(6, KALT + " — Horizont 10 km gegen 5 min Ruhe", s.bew);
                });
                await L.je(7, async () => {
                    const s = stadt();
                    if (s.bew < U(7)) return L.umfang(7, s.bew, "die größte Stadt der Sitzung trägt " + zahl(s));
                    L.leser(7, KALT + " — 20 zufällige (Same, Ort) über 3G", s.bew);
                });
                await L.je(8, async () => {
                    const s = stadt();
                    L.umfang(8, new Set([String(s.saat) + "|" + s.planet + "|" + s.zeitMa]).size, "die Sitzung hält eine Saat (" + s.saat + "), einen Planeten und eine Epoche (zeitMa " + s.zeitMa + ") — kein Wechsel von Same, Planet und Epoche im Lauf");
                });
            },
        })
    );

    // ─────────── same.preis.bytes — Null Download ───────────
    // Der Zähler der Bytes ist der Netz-Mitschnitt der Kalt-Boots (netzMitschnitt g6.js:1268 in ANKUNFT_VIER, S1 bestehend g6.js:3573) —
    // kein eigener Zähler hier. Die Leiter-Minute bootet nie kalt; gezählt in der Welt: die Service-Worker der Herkunft (der zweite
    // Besuch offline), Planet und Epoche der Sitzung (`_planetSamen` gelaende-chunks.js:672, `zeitMa` feld-leben.js:1277). S7 springt
    // über die Saaten der Sitzung (H.seite.SAATEN, der EINE Wechsel am Ort) zu neuen Planeten, derselbe Mitschnitt zählt jedes Byte.
    LEITERN.push(
        leiter({
            leiter: "same.preis.bytes",
            sek: 45,
            pfad: ["scripts/werkbank.cjs", "save-server.js", "index.html", "stamm/gelaende-chunks.js", "stamm/feld-leben.js", "stamm/speicher-laden.js"],
            welt: [{ wort: "anfragen", ab: 1, was: "Anfragen im Netz-Mitschnitt" }],
            bestehend: [1],
            sprossen: {
                2: { soll: [{ wort: "roh_mb", richtung: "≤", wert: 20, wortlaut: "≤ 20 MB roh", feld: "preis" }] },
                3: { soll: [{ wort: "draht_mb_bis_kontrolle", richtung: "≤", wert: 5, wortlaut: "≤ 5 MB komprimiert bis zur Kontrolle", feld: "preis" }] },
                4: {
                    soll: [
                        { wort: "draht_mb", richtung: "≤", wert: 5, wortlaut: "≤ 5 MB komprimiert", feld: "preis" },
                        { wort: "zweit_b", richtung: "≤", wert: 0, wortlaut: "zweiter Besuch 0 B", feld: "preis" },
                        { wort: "diff_pct", richtung: "≤", wert: 1, wortlaut: "offline gleiches Bild (Diff ≤ 1 %)", feld: "tiefe" },
                    ],
                },
                5: { soll: [{ wort: "bis_kontrolle_mb", richtung: "≤", wert: 3, wortlaut: "≤ 3 MB bis zur Kontrolle", feld: "preis" }] },
                6: {
                    soll: [
                        { wort: "code_mb", richtung: "≤", wert: 50, wortlaut: "Gesamtcode ≤ 50 MB komprimiert", feld: "preis" },
                        { wort: "bis_kontrolle_mb", richtung: "≤", wert: 1, wortlaut: "≤ 1 MB bis zur Kontrolle", feld: "preis" },
                    ],
                    umfang: { verlangt: 20, einheit: "Zufallsorte mit Netz-Mitschnitt", wortlaut: "Netz-Mitschnitt an 20 Zufallsorten", feld: "richter" },
                },
                7: {
                    soll: [{ wort: "bytes_je_sprung", richtung: "≤", wert: 0, wortlaut: "Netz-Bytes je Sprung = 0", feld: "richter" }],
                    umfang: { verlangt: 20, einheit: "neue Planeten", wortlaut: "20 neue Planeten", feld: "richter" },
                    welt: [{ wort: "spruenge", ab: 1, was: "Sprünge der Welt zu neuen Planeten im Netz-Mitschnitt" }],
                },
            },
            seite: { SAATEN, netz: netzMitschnitt },
            lauf: async function bytesLauf(H, P, L) {
                const w = await L.ev(
                    "let sw = -1; if (navigator.serviceWorker && navigator.serviceWorker.getRegistrations) sw = (await navigator.serviceWorker.getRegistrations()).length;" +
                        " const teil = r._gelaende().ort.teil; return { sw, planet: r._planetSamen(), saat: r.state.worldMeta && r.state.worldMeta.seed, zeitMa: teil && Number.isFinite(teil.zeitMa) ? teil.zeitMa : 0 };"
                );
                L.zeile("Welt der Sitzung: " + JSON.stringify(w));
                await L.je(2, async () =>
                    L.leser(2, "der Netz-Mitschnitt des ersten Studio-Besuchs: der Zähler netzMitschnitt (g6.js:1268) hängt nur an den Kalt-Boots der ANKUNFT_VIER (g6.js:1419) — kein Mitschnitt öffnet die zweite Seite eines Studios (worlds/) im Kalt-Boot")
                );
                await L.je(3, async () =>
                    L.leser(3, "der Draht bis zur Kontrolle am Dorf: netzMitschnitt zählt bis zur Kontrolle nur roh (bisK = Σ dataReceived, g6.js:1327), und der Kalt-Boot landet am Spawn, nie am Dorf (stamm/speicher-laden.js:296)")
                );
                await L.je(4, async () =>
                    L.leser(
                        4,
                        w.sw >= 1
                            ? "der zweite Besuch im Flugmodus: die Herkunft trägt " + w.sw + " Service-Worker, kein Mitschnitt fährt einen Besuch offline (netzMitschnitt g6.js:1268)"
                            : "offline nach dem Erstbesuch: die Herkunft trägt " + (w.sw < 0 ? "kein navigator.serviceWorker" : "0 Service-Worker") + " — kein Worker hält das Spiel ohne Netz (index.html:9970 lädt die Module nur über das Netz des save-servers), der zweite Besuch im Flugmodus lädt nicht"
                    )
                );
                await L.je(5, async () =>
                    L.leser(5, "an der Megastadt: die Leiter nennt keine Zahl ihres Umfangs, und kein Mitschnitt bis zur Kontrolle steht an einem Ort der Welt (bisK nur am Kalt-Boot am Spawn, g6.js:1327)")
                );
                await L.je(6, async () =>
                    L.umfang(6, 0, "kein Kalt-Boot an einem Zufallsort: die Leiter-Minute bootet nie neu, die Kalt-Boots der Sitzung (ANKUNFT_VIER) landen am Spawn; die Welt hält eine Epoche (zeitMa " + w.zeitMa + ")")
                );
                // S7 DIE SAATEN (H.seite.SAATEN, sitzung-seite.js): je Saat der Satz „neue welt saat <s>“, die Welt springt am Ort zu einem
                // neuen Planeten (`_planetSamen` je Saat); der Netz-Mitschnitt (H.seite.netz = netzMitschnitt, g6.js) hängt vor dem ersten
                // Sprung an Seite und Fäden und zählt bis das Netz nach dem Heimweg ruht. Je Sprung = Σ roh ÷ (Sprünge + Heimweg).
                await L.je(7, async () => {
                    const v = P.sprossen[7].umfang.verlangt;
                    const { page } = await H.verbinde();
                    const netz = await H.seite.netz(page);
                    const arg = { stamm: P.leiter + "-s7", n: v, bis: Date.now() + Math.max(0, (L.rest() - 14) * 1000) };
                    let s = null, m = null;
                    try {
                        s = await L.ev("return await (" + H.seite.SAATEN + ")(r, T, " + JSON.stringify(arg) + ", (r) => r._planetSamen());", Math.max(5, L.rest() - 10));
                    } finally {
                        await netz.ruhe(H, 5000);
                        m = await netz.schluss();
                    }
                    if (s.fehler) throw new Error(s.fehler);
                    L.zeile("bytes S7 Saaten " + JSON.stringify(s) + " · Netz " + JSON.stringify(m));
                    if (m.fehler.length) throw new Error("der Netz-Mitschnitt hängt nicht an: " + m.fehler.join(" · "));
                    const planeten = new Set(s.je.map((x) => x.z).filter((p) => p !== w.planet)).size;
                    const spruenge = s.je.length + (s.heimweg.zurueck ? 1 : 0);
                    const zeit = "je Saat " + (s.msJe.join(" · ") || "—") + " ms, Heimweg " + s.heimweg.ms + " ms (zurück " + s.heimweg.zurueck + ")" + (s.grund ? "; Ende: " + s.grund : "");
                    L.gemessen(7, { bytes_je_sprung: spruenge ? Math.round(m.roh / spruenge) : NaN }, {
                        erzeugt: planeten,
                        welt: { spruenge },
                        taeter: "Σ roh " + m.roh + " B, Draht " + m.draht + " B in " + m.n + " Anfragen über " + spruenge + " Sprünge (" + planeten + " neue Planeten, " + m.ziele + " Ziele, Netz ruht " + m.ruht + "; größte " + JSON.stringify(m.groesste) + "; " + zeit + ")",
                    });
                });
            },
        })
    );

    // ─────────── same.preis.eingabe — Jedes Verb über jede Eingabe ───────────
    // S1 misst Eingabe → Pixel über die Latenz-Linse des Spiels (`/latenz`, haenger-linse.cjs latenzAn: die Taste per CDP, die Zeit bis
    // zum bewegten Bild) an den fünf Verben gehen · wechsel · springen · einsteigen · hieb (Ego, Wiese), der Zeiger über die Attrappe der
    // Proben (g5 praesenzSeite). Die Eingabe-Arten zählt die Seite selbst: Hörer an Fenster, Dokument und Leinwand (CDP
    // DOMDebugger.getEventListeners), das Pad (`_eingabeTakt` koerper-bewegung.js:2386, PAD_BELEGUNG), XR am Renderer.
    LEITERN.push(
        leiter({
            leiter: "same.preis.eingabe",
            sek: 60,
            mutiert: true,
            pfad: ["scripts/werkbank.cjs", "scripts/lib/haenger-linse.cjs", "spec/profiband/haushalt.json", "stamm/werkstatt-bauen.js", "stamm/koerper-bewegung.js", "stamm/dirigent-ankunft.js"],
            welt: [{ wort: "proben", ab: 5, was: "gemessene Proben der Latenz-Linse (Taste → bewegtes Bild)" }],
            sprossen: {
                1: {
                    soll: [
                        { wort: "eingabe_pixel_p95_ms", richtung: "≤", wert: 100, wortlaut: "Eingabe bis Pixel ≤ 100 ms", feld: "preis" },
                        { wort: "verben_pct", richtung: "≥", wert: 100, wortlaut: "100 % der v1-Verben", feld: "tiefe", aus: 3 },
                    ],
                },
                2: { soll: [{ wort: "inp_ms", richtung: "≤", wert: 200, wortlaut: "INP ≤ 200 ms an G2 + G3", feld: "preis" }] },
                3: {
                    soll: [
                        { wort: "verben_pct", richtung: "≥", wert: 100, wortlaut: "100 % der v1-Verben", feld: "tiefe" },
                        { wort: "treffer_pct", richtung: "≥", wert: 98, wortlaut: "Treffer der Finger-Ziele ≥ 98 %", feld: "tiefe" },
                        { wort: "inp_ms", richtung: "≤", wert: 100, wortlaut: "INP ≤ 100 ms an G4", feld: "preis" },
                    ],
                },
                4: {
                    soll: [
                        { wort: "verben_pct", richtung: "≥", wert: 100, wortlaut: "100 % der v1-Verben", feld: "tiefe" },
                        { wort: "wort_wirkung_s", richtung: "≤", wert: 1, wortlaut: "Wort bis Wirkung ≤ 1 s", feld: "preis" },
                    ],
                },
                5: {
                    soll: [
                        { wort: "photon_ms", richtung: "≤", wert: 20, wortlaut: "Bewegung bis Photon ≤ 20 ms", feld: "preis" },
                        { wort: "bild_ms", richtung: "≤", wert: 11.1, wortlaut: "≤ 11,1 ms je Bild", feld: "preis" },
                    ],
                },
                6: {
                    soll: [{ wort: "erreicht_pct", richtung: "≥", wert: 95, wortlaut: "20 zufällige Studio-Verben × 5 Eingaben ≥ 95 %", feld: "tiefe" }],
                    umfang: { verlangt: 5, einheit: "Eingabe-Arten mit Hörer", wortlaut: "20 zufällige Studio-Verben × 5 Eingaben", feld: "tiefe" },
                },
                7: {
                    soll: [
                        { wort: "handarbeit_zeilen", richtung: "≤", wert: 0, wortlaut: "0 Zeilen Hand-Arbeit je Verb", feld: "preis" },
                        { wort: "erreicht_pct", richtung: "≥", wert: 95, wortlaut: "20 per Satz erzeugte Verben × 5 Eingaben ≥ 95 %", feld: "richter" },
                    ],
                    umfang: { verlangt: 5, einheit: "Eingabe-Arten mit Hörer", wortlaut: "über alle 5 Eingaben", feld: "tiefe" },
                },
            },
            lauf: async function eingabeLauf(H, P, L) {
                // die Hörer der Seite (CDP, nie ein eigener Browser): je Ereignis-Art ihre Zahl an Fenster, Dokument und Leinwand
                // (scheitert der Anschluss, urteilen die Sprossen, die an den Hörern hängen, UNGEMESSEN beim Namen — die übrigen weiter)
                let hoerer = {}, hoererFehlt = null;
                try {
                    const { page } = await H.verbinde();
                    const c = await page.target().createCDPSession();
                    try {
                        for (const expr of ["window", "document", "window.anazhRealm.state.renderer.domElement"]) {
                            const { result } = await c.send("Runtime.evaluate", { expression: expr });
                            if (!result || !result.objectId) throw new Error("kein Objekt " + expr + " in der Seite");
                            const { listeners } = await c.send("DOMDebugger.getEventListeners", { objectId: result.objectId });
                            for (const l of listeners || []) hoerer[l.type] = (hoerer[l.type] || 0) + 1;
                        }
                    } finally {
                        await c.detach().catch(() => {});
                    }
                } catch (e) {
                    hoerer = null;
                    hoererFehlt = "die Hörer der Seite ungezählt: " + String((e && e.message) || e).split("\n")[0].slice(0, 160);
                }
                const H0 = () => {
                    if (!hoerer) throw new Error(hoererFehlt);
                    return hoerer;
                };
                const w = await L.ev(
                    "const st = r.state, K = r.constructor, D = K.DEFAULT_KEYBINDINGS, kb = st.keybindings || D, pad = st.padBelegung || K.PAD_BELEGUNG || {};" +
                        " const V1 = ['vor', 'cameraToggle', 'jump', 'einsteigen', 'break', 'place', 'drawerWerkstatt', 'chat'];" +
                        " const hat = (a) => { const c = kb[a] != null ? kb[a] : D[a]; return Array.isArray(c) ? c.length > 0 : !!c; };" +
                        " const aktionen = K.KEYBINDING_ACTIONS || Object.keys(D);" +
                        " return { v1: V1.length, v1Taste: V1.filter(hat).length, aktionen: aktionen.length, padAktionen: aktionen.filter((a) => pad[a]).length," +
                        " padTakt: typeof r._eingabeTakt === 'function', xr: !!(st.renderer && st.renderer.xr && st.renderer.xr.enabled), navXr: !!navigator.xr };"
                );
                const ho = hoerer || {};
                const finger = (ho.touchstart || 0) + (ho.touchend || 0) + (ho.touchmove || 0);
                const arten = {
                    tastatur: (ho.keydown || 0) > 0 && (ho.mousedown || 0) > 0 ? 1 : 0,
                    pad: w.padTakt && w.padAktionen > 0 ? 1 : 0,
                    finger: finger > 0 ? 1 : 0,
                    stimme: 0,
                    haende: w.xr ? 1 : 0,
                };
                const n = Object.values(arten).reduce((s, x) => s + x, 0);
                L.zeile("Eingabe der Seite: Hörer " + (hoerer ? JSON.stringify(hoerer) : hoererFehlt) + " · " + JSON.stringify(w) + " · Arten " + JSON.stringify(arten));
                await L.je(2, async () =>
                    L.leser(2, "INP über das Gamepad: die Latenz-Linse hört nur keydown · keyup · mousedown (scripts/lib/haenger-linse.cjs:1225), die Knopf-Kante des Pads in `_eingabeTakt` (stamm/koerper-bewegung.js:2386) trägt keine Uhr der Eingabe; die Belegung trägt " + w.padAktionen + " von " + w.aktionen + " Aktionen am Pad")
                );
                await L.je(3, async () =>
                    L.leser(
                        3,
                        H0() && finger > 0
                            ? "Finger: " + finger + " touch-Hörer an der Seite, die Latenz-Linse kennt keinen Finger (scripts/lib/haenger-linse.cjs:1225)"
                            : "Finger: 0 touch-Hörer an Fenster, Dokument und Leinwand — kein Verb hört den Finger (pointerdown stempelt nur die Zeit, stamm/dirigent-ankunft.js:500; die Verben hören keydown und mousedown, stamm/dirigent-ankunft.js:515 · 1426)"
                    )
                );
                await L.je(4, async () =>
                    L.leser(4, "Stimme: kein Hörer der Sprache im Spiel — die Stimme spricht nur aus (speechSynthesis, stamm/netz-p2p.js:2558), der Satz geht getippt über den Chat (stamm/dirigent-ankunft.js:642)")
                );
                await L.je(5, async () =>
                    L.leser(5, "Hände im Raum: der Renderer trägt xr.enabled " + w.xr + " (navigator.xr " + (w.navXr ? "da" : "fehlt") + ") — keine immersive Sitzung, kein Greifen der Hände (der Renderer ohne XR stamm/dirigent-ankunft.js:296)")
                );
                await L.je(6, async () => {
                    H0();
                    if (n < P.sprossen[6].umfang.verlangt) return L.umfang(6, n, "die Seite hört " + n + " von 5 Eingabe-Arten " + JSON.stringify(arten));
                    L.leser(6, "20 zufällige Studio-Verben: kein Läufer zieht Studio-Verben und fährt sie über jede Eingabe-Art", n);
                });
                await L.je(7, async () => {
                    H0();
                    if (n < P.sprossen[7].umfang.verlangt) return L.umfang(7, n, "die Seite hört " + n + " von 5 Eingabe-Arten " + JSON.stringify(arten) + " — ein per Satz erschaffenes Verb erreicht höchstens sie");
                    L.leser(7, "20 per Satz erzeugte Verben: der Satz (spawn_studio) braucht den LLM-Lauf mit Schlüssel (Drehbuch-Schritt 18)", n);
                });
                // S1 zuletzt (das Teure): die Wiese, der Zeiger über die Attrappe, die Linse, der Zeiger zurück
                await L.je(1, async () => {
                    await L.ort("wiese", "ego");
                    L.preisPose("wiese", "ego");
                    if (H.rest() < 20) throw new Error("die Frist trägt die Latenz nicht mehr: " + Math.round(H.rest()) + " s Rest nach dem Ort");
                    await L.ev(
                        "if (!window.__zeigerDerProbe) { const stand = (window.__zeigerDerProbe = { el: null, rpl: HTMLCanvasElement.prototype.requestPointerLock });" +
                            " const melde = () => document.dispatchEvent(new Event('pointerlockchange'));" +
                            " Object.defineProperty(document, 'pointerLockElement', { configurable: true, get: () => stand.el });" +
                            " HTMLCanvasElement.prototype.requestPointerLock = function () { stand.el = this; return Promise.resolve().then(melde); };" +
                            " document.exitPointerLock = () => ((stand.el = null), melde()); } return 1;"
                    );
                    let l;
                    try {
                        l = await L.wb("/latenz", { proben: 4, sichten: "ego", verben: "gehen,wechsel,springen,einsteigen,hieb" }, Math.max(10, H.rest() - 4));
                    } finally {
                        await L.ev(
                            "const z = window.__zeigerDerProbe; if (z && z.rpl) { if (document.pointerLockElement) document.exitPointerLock(); HTMLCanvasElement.prototype.requestPointerLock = z.rpl;" +
                                " delete document.exitPointerLock; delete document.pointerLockElement; delete window.__zeigerDerProbe; } return 1;"
                        ).catch(() => {});
                    }
                    const reihen = Object.entries((l && l.reihen) || {});
                    const proben = reihen.reduce((s, [, e]) => s + (e.n || 0), 0);
                    const p95 = reihen.map(([k, e]) => [k, e.fehlt > 0 || !Number.isFinite(e.p95) ? Infinity : e.p95, e]);
                    const schlecht = p95.reduce((a, x) => (!a || x[1] > a[1] ? x : a), null);
                    const erreicht = reihen.filter(([, e]) => e.n > 0).length;
                    const pct = Math.min((100 * w.v1Taste) / w.v1, reihen.length ? (100 * erreicht) / 5 : 0);
                    L.gemessen(
                        1,
                        { eingabe_pixel_p95_ms: schlecht && Number.isFinite(schlecht[1]) ? schlecht[1] : null, verben_pct: +pct.toFixed(1) },
                        {
                            welt: { proben },
                            taeter: schlecht
                                ? "ego/" + schlecht[0].split("/").pop() + " p95 " + schlecht[2].p95 + " ms (fehlt " + schlecht[2].fehlt + ", Täter-Stufen eingabe " + schlecht[2].eingabe + " · hörer " + schlecht[2].hoerer + " · kette " + schlecht[2].kette + " · kurve " + schlecht[2].kurve + " ms) · v1-Aktionen mit Taste " + w.v1Taste + " von " + w.v1 + " · Verben bewegt " + erreicht + " von 5"
                                : "die Linse nannte keine Reihe",
                            beleg: { reihen: Object.fromEntries(reihen.map(([k, e]) => [k, { n: e.n, fehlt: e.fehlt, p50: e.p50, p95: e.p95, max: e.max }])), bildMs: l && l.bildMs, rot: l && l.rot },
                        }
                    );
                });
            },
        })
    );

    // ─────────── same.preis.zugang — Zugang mit fehlendem Sinn ───────────
    // Gezählt in der Welt: die Wahl der Farbsicht (FARBSICHT.arten bild-kosten.js:3043, `state.zugang` dirigent-kern.js:796), die
    // Untertitel-Tafel (UNTERTITEL werkstatt-hud.js:3160, `state.untertitel` dirigent-kern.js:793), die Belegung (DEFAULT_KEYBINDINGS
    // werkstatt-bauen.js:3615). Das ΔE unter Machado am Ausgabe-Bild misst nur die headless-Station spielgang.K4#2 (g5.js:3518) — in der
    // Sitzung fehlt der Leser; die übrigen Sinn-Profile trägt die Welt nicht.
    LEITERN.push(
        leiter({
            leiter: "same.preis.zugang",
            sek: 15,
            pfad: ["stamm/dirigent-kern.js", "stamm/bild-kosten.js", "stamm/werkstatt-hud.js", "stamm/werkstatt-bauen.js", "scripts/diag-klang-zensus.cjs", "scripts/diag-v1-pfad.cjs"],
            welt: [{ wort: "grenzen", ab: 2, was: "Klassen-Grenzen im Ausgabe-Bild" }],
            bestehend: [1],
            sprossen: {
                2: {
                    soll: [
                        { wort: "delta_e_min", richtung: "≥", wert: 10, wortlaut: "Klassen-Grenzen ΔE ≥ 10 unter Deuteranopie", feld: "tiefe" },
                        { wort: "kosten_ms", richtung: "≤", wert: 0.1, wortlaut: "≤ 0,1 ms je Bild", feld: "preis" },
                    ],
                },
                3: { soll: [{ wort: "bild_kosten_ms", richtung: "≤", wert: 0, wortlaut: "0 Bild-Kosten", feld: "preis" }] },
                4: {
                    soll: [
                        { wort: "kosten_ms", richtung: "≤", wert: 1, wortlaut: "≤ 1 ms je Bild", feld: "preis" },
                        { wort: "zeit_min", richtung: "≤", wert: 5, wortlaut: "Anteil Schritte in ≤ 5 min", feld: "richter" },
                    ],
                },
                5: {
                    soll: [
                        { wort: "beschreibung_s", richtung: "≤", wert: 1, wortlaut: "Beschreibung ≤ 1 s", feld: "preis" },
                        { wort: "abtastung_s", richtung: "≤", wert: 3, wortlaut: "Abtastung ≤ 3 s je Verb", feld: "preis" },
                    ],
                },
                6: {
                    soll: [{ wort: "stimmt_pct", richtung: "≥", wert: 90, wortlaut: "20 zufällige Stadt-Aufgaben je Sinn-Profil ≥ 90 %", feld: "richter" }],
                    umfang: { verlangt: 20, einheit: "Stadt-Aufgaben je Sinn-Profil", wortlaut: "20 zufällige Stadt-Aufgaben je Sinn-Profil", feld: "richter" },
                },
                7: {
                    soll: [{ wort: "geschafft_pct", richtung: "≥", wert: 95, wortlaut: "Anteil geschafft ≥ 95 % je Sinn-Profil in Kanal-Läufen", feld: "richter" }],
                    umfang: { verlangt: 5, einheit: "Sinn-Profile der Welt", wortlaut: "20 Aufgaben × 5 Sinn-Profile", feld: "tiefe" },
                },
            },
            lauf: async function zugangLauf(H, P, L) {
                const w = await L.ev(
                    "const st = r.state, K = r.constructor, arten = K.FARBSICHT && K.FARBSICHT.arten ? [...K.FARBSICHT.arten] : [], U = K.UNTERTITEL || {};" +
                        " let zeilen = 0; for (const t of Object.values(U)) if (t && typeof t === 'object') zeilen += Object.keys(t).length;" +
                        " const kb = st.keybindings || K.DEFAULT_KEYBINDINGS || {}, tasten = new Set(); for (const c of Object.values(kb)) for (const x of Array.isArray(c) ? c : c ? [c] : []) tasten.add(x);" +
                        " return { arten, zeilen, untertitel: st.untertitel === true, zugang: st.zugang ? Object.keys(st.zugang) : null, tasten: tasten.size, aktionen: Object.keys(kb).length };"
                );
                L.zeile("Zugang der Welt: " + JSON.stringify(w));
                const z = w.zugang || [];
                const profile = {
                    taub: w.zeilen > 0 ? 1 : 0,
                    farbschwach: w.arten.includes("deuteranopie") ? 1 : 0,
                    motorisch: z.some((k) => /hand|assist|motor/i.test(k)) ? 1 : 0,
                    sehschwach: z.some((k) => /sehschaerfe|lupe|kontrast|textgroesse/i.test(k)) ? 1 : 0,
                    blind: z.some((k) => /ansage|blind|vorlese|beschreib/i.test(k)) ? 1 : 0,
                };
                const n = Object.values(profile).reduce((s, x) => s + x, 0);
                await L.je(2, async () =>
                    L.leser(2, "ΔE unter Machado-Deuteranopie am Ausgabe-Bild und die Klang-Zeilen in der Sitzung an echter GPU: die Messung lebt nur in der headless-Station spielgang.K4#2 (zugangFarbe g5.js:3518; die Klang-Zeilen scripts/diag-klang-zensus.cjs:359 mit eigenem Boot) — die Welt trägt die Wahl (" + w.arten.join(" · ") + ") und " + w.zeilen + " Zeilen der Untertitel-Tafel")
                );
                await L.je(3, async () =>
                    L.leser(3, "Ein-Hand: die Belegung trägt " + w.tasten + " Tasten für " + w.aktionen + " Aktionen (stamm/werkstatt-bauen.js:3615), die Zugangs-Wahl (" + z.join(" · ") + ", stamm/dirigent-kern.js:796) kennt kein Ein-Hand-Profil und keine Hilfe des Ziels; kein Läufer des v1-Pfads mit halbierter Tastenmenge (scripts/diag-v1-pfad.cjs:1 headless)")
                );
                await L.je(4, async () =>
                    L.leser(4, "sehschwach 20/200: kein Lauf am unscharfen Ausgabe-Bild — die Unschärfe der Wahl ist die der Bewegung (state.zugang.unschaerfe, stamm/dirigent-kern.js:796), kein Filter der Sehschärfe, kein v1-Pfad-Läufer am Bild (scripts/diag-v1-pfad.cjs:1)")
                );
                await L.je(5, async () =>
                    L.leser(5, "blind und Ein-Schalter: keine Ansage der Welt aus dem Gesetz (speechSynthesis spricht nur Antworten des Chats, stamm/werkstatt-hud.js:73), keine Abtastung der Verben per Schalter")
                );
                await L.je(6, async () => L.umfang(6, 0, "kein Läufer zieht Stadt-Aufgaben je Sinn-Profil — 0 Aufgaben in der Sitzung"));
                await L.je(7, async () => L.umfang(7, n, "die Welt trägt " + n + " von 5 Sinn-Profilen " + JSON.stringify(profile)));
            },
        })
    );

    // ─────────── same.preis.ausdauer — Die Sitzung hält ───────────
    // S1 urteilt der Dauer-Lauf der Sitzung (profiband.K5, g6.js:4159). Ab S2 ist der Umfang selbst die Dauer am Stück (5 min · 20 min ·
    // 60 min · 4 h) bzw. 100 Sprünge — die Leiter-Minute trägt sie nie: gezählt werden die Minuten, die der Lauf am Stück hält, und die
    // Planeten und Epochen der Welt (`_planetSamen` gelaende-chunks.js:672, `zeitMa` feld-leben.js:1277).
    LEITERN.push(
        leiter({
            leiter: "same.preis.ausdauer",
            sek: 15,
            pfad: ["scripts/werkbank.cjs", "stamm/gelaende-chunks.js", "stamm/feld-leben.js"],
            welt: [{ wort: "bilder", ab: 30, was: "Bilder des Spielgangs im Strom" }],
            bestehend: [1],
            sprossen: {
                2: {
                    soll: [{ wort: "heap_drift_mb_min", richtung: "≤", wert: 5, wortlaut: "Heap-Drift ≤ 5 MB/min", feld: "tiefe" }],
                    umfang: { verlangt: 5, einheit: "min Spielgang am Stück", wortlaut: "5 min, Weg ≥ 1 km", feld: "umfang" },
                },
                3: {
                    soll: [{ wort: "vram_drift_mb", richtung: "≤", wert: 2, wortlaut: "VRAM-Drift ≤ 2 MB", feld: "tiefe" }],
                    umfang: { verlangt: 20, einheit: "min Spielgang am Stück", wortlaut: "20 min, Weg ≥ 5 km, Tor, Nacht", feld: "umfang" },
                },
                4: {
                    soll: [
                        { wort: "drossel_pct", richtung: "≤", wert: 20, wortlaut: "Handy G4 ohne Drosselung > 20 %", feld: "preis" },
                        { wort: "akku_pct_h", richtung: "≤", wert: 25, wortlaut: "Akku ≤ 25 %/h", feld: "preis" },
                    ],
                    umfang: { verlangt: 60, einheit: "min Spielgang am Stück", wortlaut: "60 min", feld: "umfang" },
                },
                5: {
                    soll: [{ wort: "akku_pct_h", richtung: "≤", wert: 20, wortlaut: "Akku ≤ 20 %/h", feld: "preis" }],
                    umfang: { verlangt: 4, einheit: "h Spielgang am Stück", wortlaut: "4 h: Megastadt, Fahrt, Sprünge", feld: "umfang" },
                },
                6: {
                    soll: [{ wort: "rueck_pct", richtung: "≤", wert: 2, wortlaut: "Speicher kehrt nach jedem Sprung zurück (≤ 2 %)", feld: "tiefe" }],
                    umfang: { verlangt: 100, einheit: "Sprünge zwischen Planeten und Epochen", wortlaut: "Spielgang mit 100 Sprüngen", feld: "richter" },
                },
            },
            lauf: async function ausdauerLauf(H, P, L) {
                const w = await L.ev("const teil = r._gelaende().ort.teil; return { planet: r._planetSamen(), zeitMa: teil && Number.isFinite(teil.zeitMa) ? teil.zeitMa : 0 };");
                const min = Math.max(0, +(H.rest() / 60).toFixed(2));
                const dauer = (nr, verlangt, einheit) =>
                    L.je(nr, async () =>
                        L.umfang(nr, einheit === "h" ? +(min / 60).toFixed(4) : min, verlangt + " " + einheit + " am Stück verlangt, die Leiter-Minute hält höchstens " + min + " min — der Spielgang am Stück ist der Dauer-Lauf der Sitzung (profiband.K5, g6.js:4159)")
                    );
                await dauer(2, 5, "min");
                await dauer(3, 20, "min");
                await dauer(4, 60, "min");
                await dauer(5, 4, "h");
                await L.je(6, async () =>
                    L.umfang(6, new Set([w.planet]).size - 1, "die Welt hält einen Planeten (Same " + w.planet + ") und eine Epoche (zeitMa " + w.zeitMa + ") — kein Sprung zwischen Planeten oder Epochen in der Sitzung")
                );
            },
        })
    );

    // ─────────── same.preis.speicher — Speicher, Wärme, Akku ───────────
    // Der Preis aus DERSELBEN Quelle wie richter-akte.cjs: je Messort (Wiese, Dorf) ein kurzer Spielgang der Bahn (`/lauf` wandern bahn) in
    // einer Zelle des Stroms (Bilder, Weg, Heap je Block), danach die Posten nach erzwungenem GC (`/puffer`, wie punkte.cjs preisPosten).
    // Der Richter verlangt die Kurve über 5 min: gemessen unter dem Umfang. Die übrigen Sprossen zählen die Welt der Sitzung (Bauten
    // ohne Natur, Menschen der Siedlungen, Planet und Epoche) gegen ihren Umfang.
    LEITERN.push(
        leiter({
            leiter: "same.preis.speicher",
            sek: 60,
            pfad: ["scripts/werkbank.cjs", "scripts/lib/zerlege-linse.cjs", "spec/profiband/haushalt.json", "stamm/siedlung-bewohner.js", "stamm/vegetation-baum.js", "stamm/gelaende-chunks.js"],
            welt: [
                { wort: "orte", ab: 2, was: "Messorte mit Posten nach GC (Wiese und Dorf)" },
                { wort: "bilder", ab: 30, was: "Bilder des Spielgangs im Strom je Ort" },
                { wort: "weg_m", ab: 5, was: "Weg des Leibs im Strom je Ort" },
            ],
            sprossen: {
                1: {
                    soll: [
                        { wort: "heap_mb", richtung: "≤", wert: 400, wortlaut: "Heap ≤ 400 MB", feld: "preis" },
                        { wort: "vram_mb", richtung: "≤", wert: 118, wortlaut: "VRAM ≤ 118 MB an beiden Geräten", feld: "preis" },
                    ],
                    umfang: { verlangt: 5, einheit: "min Spielgang mit Kurve", wortlaut: "Heap- und VRAM-Kurve über 5 min Spielgang", feld: "richter" },
                },
                2: {
                    soll: [
                        { wort: "steigung_mb_min", richtung: "≤", wert: 5, wortlaut: "Steigung ≤ 5 MB/min", feld: "preis" },
                        { wort: "vram_drift_mb", richtung: "≤", wert: 2, wortlaut: "VRAM-Drift ≤ 2 MB", feld: "preis" },
                    ],
                    umfang: { verlangt: 20, einheit: "min Weg im Dorf", wortlaut: "Dorf, 20 min Weg", feld: "umfang" },
                },
                3: {
                    soll: [
                        { wort: "heap_mb", richtung: "≤", wert: 600, wortlaut: "Heap ≤ 600 MB", feld: "preis" },
                        { wort: "vram_mb", richtung: "≤", wert: 256, wortlaut: "VRAM ≤ 256 MB", feld: "preis" },
                        { wort: "rueck_pct", richtung: "≤", wert: 2, wortlaut: "Speicher am Ende = Anfang ±2 %", feld: "richter" },
                    ],
                    umfang: { verlangt: 1000, einheit: "Bauten der Stadt", wortlaut: "Stadt, 10³–10⁴ Bauten", feld: "umfang" },
                },
                4: {
                    soll: [
                        { wort: "heap_gb", richtung: "≤", wert: 1, wortlaut: "Heap ≤ 1 GB", feld: "preis" },
                        { wort: "vram_mb", richtung: "≤", wert: 512, wortlaut: "VRAM ≤ 512 MB", feld: "preis" },
                        { wort: "drossel_pct", richtung: "≤", wert: 10, wortlaut: "Laptop ohne Drosselung > 10 % in 60 min", feld: "preis" },
                    ],
                    umfang: { verlangt: 1e7, einheit: "Menschen wirkend", wortlaut: "Megastadt, 10⁷ Menschen wirkend", feld: "umfang" },
                },
                5: {
                    soll: [
                        { wort: "rueck_pct", richtung: "≤", wert: 2, wortlaut: "≤ Ausgang + 2 %", feld: "richter" },
                        { wort: "akku_pct_h", richtung: "≤", wert: 25, wortlaut: "Akku am Laptop ≤ 25 %/h", feld: "preis" },
                    ],
                    umfang: { verlangt: 100, einheit: "Sprünge Orbit ↔ Boden", wortlaut: "Planet: Orbit ↔ Boden, 100 Sprünge", feld: "umfang" },
                },
                6: {
                    soll: [
                        { wort: "heap_gb", richtung: "≤", wert: 1, wortlaut: "Heap ≤ 1 GB ohne Tab-Tod in 60 min am Handy", feld: "preis" },
                        { wort: "akku_pct_h", richtung: "≤", wert: 20, wortlaut: "Akku ≤ 20 %/h", feld: "preis" },
                    ],
                    umfang: { verlangt: 20, einheit: "Welten", wortlaut: "60 min am realen Handy über 20 Welten", feld: "richter" },
                },
            },
            lauf: async function speicherLauf(H, P, L) {
                const U = (nr) => P.sprossen[nr].umfang.verlangt;
                // die Welt der Sitzung gezählt (billig, ohne Ortswechsel): alle Bauten ohne Natur, die Menschen jeder gemeldeten Siedlung
                const w = await L.ev(
                    "const st = r.state; let bauten = 0; for (const a of st.architectures || []) if (a && a.position && !r._istNatur(a)) bauten++;" +
                        " let menschen = 0, sied = 0; for (const S of (r._bewohnerSiedlungen || new Map()).values()) { sied++; menschen += S.liste ? S.liste.length : S.plan && S.plan.slots ? S.plan.slots.length : 0; }" +
                        " const teil = r._gelaende().ort.teil; return { bauten, menschen, sied, planet: r._planetSamen(), zeitMa: teil && Number.isFinite(teil.zeitMa) ? teil.zeitMa : 0 };"
                );
                L.zeile("Welt der Sitzung: " + JSON.stringify(w));
                await L.je(3, async () => {
                    if (w.bauten < U(3)) return L.umfang(3, w.bauten, "die Welt der Sitzung trägt " + w.bauten + " Bauten in " + w.sied + " Siedlungen (die größte Stadt des Gesetzes am Messort stadt-voll, „dorf 7 300“)");
                    L.leser(3, "die Bahn durch die Stadt und zurück mit den Posten an Anfang und Ende: die Bahn der Werkbank geht nur die Kette des Messorts (scripts/lib/zerlege-linse.cjs:479)", w.bauten);
                });
                await L.je(4, async () => {
                    if (w.menschen < U(4)) return L.umfang(4, w.menschen, "die Welt wirkt mit " + w.menschen + " Menschen in " + w.sied + " Siedlungen — keine Megastadt");
                    L.leser(4, "60 min Megastadt mit Speicher-Kurve: kein Lauf der Sitzung trägt 60 min", w.menschen);
                });
                await L.je(5, async () => L.umfang(5, 0, "kein Orbit: der Boden ist eine Ebene (planetFlaeche planet-core.js:2256 ohne Leser im Stamm), kein Sprung Orbit ↔ Boden"));
                await L.je(6, async () => L.umfang(6, new Set([w.planet + "|" + w.zeitMa]).size, "die Sitzung hält eine Welt (Same " + w.planet + ", zeitMa " + w.zeitMa + ")"));
                // S1 · je Messort: der Spielgang der Bahn in einer Zelle des Stroms, dann die Posten nach GC (/puffer)
                const orte = [];
                await L.je(1, async () => {
                    L.preisPose("dorf", "ego");
                    for (const ort of ["wiese", "dorf"]) {
                        if (H.rest() < 16) throw new Error("die Frist trägt den Ort " + ort + " nicht mehr: " + Math.round(H.rest()) + " s Rest");
                        await L.ort(ort, "ego");
                        const zelle = "k2-speicher-" + ort;
                        await L.zelle(zelle);
                        await L.wb("/lauf", { sek: 3, ein: 1, wandern: "bahn" }, 60);
                        await L.zelle(null);
                        const b = L.bilder(zelle);
                        let weg = 0;
                        for (let i = 1; i < b.length; i++) weg += Math.hypot(b[i].x - b[i - 1].x, b[i].z - b[i - 1].z);
                        const p = await L.wb("/puffer", { top: 200 }, 60);
                        orte.push({
                            ort,
                            n: b.length,
                            weg: +weg.toFixed(1),
                            min: b.length > 1 ? (b[b.length - 1].wand - b[0].wand) / 60000 : 0,
                            heap: p && Number.isFinite(p.heapMB) ? p.heapMB : null,
                            vram: p && p.vram && Number.isFinite(p.vram.mb) ? p.vram.mb : null,
                            heapStrom: b.length ? [b[0].heap, b[b.length - 1].heap] : null,
                            vramStrom: b.length ? [b[0].vram, b[b.length - 1].vram] : null,
                        });
                    }
                    const da = orte.filter((o) => Number.isFinite(o.heap) && Number.isFinite(o.vram));
                    const top = (k) => da.reduce((a, o) => (!a || o[k] > a[k] ? o : a), null);
                    const [h, v] = [top("heap"), top("vram")];
                    L.gemessen(
                        1,
                        { heap_mb: h ? h.heap : null, vram_mb: v ? v.vram : null },
                        {
                            erzeugt: +orte.reduce((s, o) => s + o.min, 0).toFixed(3),
                            welt: { orte: da.length, bilder: Math.min(...orte.map((o) => o.n)), weg_m: Math.min(...orte.map((o) => o.weg)) },
                            taeter: (h ? "Heap " + h.heap + " MB an " + h.ort : "Heap ohne Posten") + " · " + (v ? "VRAM " + v.vram + " MB an " + v.ort : "VRAM ohne Posten") + " (nach GC) — die Kurve über 5 min trägt der Dauer-Lauf, die Leiter ging " + orte.reduce((s, o) => s + o.min, 0).toFixed(2) + " min",
                            beleg: orte,
                        }
                    );
                });
                await L.je(2, async () => {
                    const d = orte.find((o) => o.ort === "dorf");
                    L.umfang(2, d ? +d.min.toFixed(3) : 0, "20 min Weg im Dorf verlangt: die Leiter ging " + (d ? d.min.toFixed(2) + " min, " + d.weg + " m" : "nicht im Dorf") + " — der Weg am Stück ist der Dauer-Lauf der Sitzung (profiband.K5, g6.js:4159)");
                });
            },
        })
    );
}
// @@TEILE-ENDE@@

module.exports = LEITERN.flat();
module.exports.geruest = geruest;
