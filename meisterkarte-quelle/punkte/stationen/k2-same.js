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
//   auge     — die Sprosse urteilt ein Blindpaar gegen ein echtes Vorbild: die Probe schießt das Bild an fester Pose und legt es ab; das
//              Urteil trägt die Zeile `auge` mit Pose und Vorbild — es zählt nur mit dem Urteil am Gerät (R11), die Station sagt nie GRÜN
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
const { probeBefehl } = require("./sitzung-seite.js");

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
    if (s.art === "auge") {
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
    if (s.art !== "gemessen") return LEER;
    if (S.auge) return { gruen: false, zahl: kopf + "ROT die Sprosse urteilt ein Auge, die Probe nennt nur Zahlen — kein Bild abgelegt" };
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
    const setze = (nr, e) => {
        if (!P.sprossen[nr]) throw new Error("S" + nr + " ist keine Sprosse dieser Station");
        if (j.sprossen[nr]) throw new Error("S" + nr + " zweimal geurteilt");
        j.sprossen[nr] = Object.assign(e, { t: H.sek() });
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
                setze(nr, { art: "auge", bild: (b && b.datei) || datei, werte: (o && o.werte) || null, erzeugt: o && o.erzeugt });
            } catch (e) {
                if (e && e.messort) throw e;
                setze(nr, { art: "auge", bild: null, grund: String((e && e.message) || e).split("\n")[0].slice(0, 160), werte: (o && o.werte) || null, erzeugt: o && o.erzeugt });
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
        const welt = d.welt || def.welt || [];
        if (soll.length && !d.auge && !welt.length) throw new Error(def.leiter + " S" + nr + ": gemessen ohne Welt-Zeugen — die Attrappe fiele nie");
        for (const z of welt) if (!(/^[a-z0-9_]+$/.test(z.wort || "") && Number.isFinite(z.ab) && z.ab > 0 && z.was)) throw new Error(def.leiter + " S" + nr + ": Zeuge " + JSON.stringify(z));
        return {
            leiter: def.leiter,
            nr,
            richter: sp.richter,
            soll: soll.map((z) => ({ wort: z.wort, richtung: z.richtung, wert: z.wert })),
            umfang: d.umfang ? { verlangt: d.umfang.verlangt, einheit: d.umfang.einheit } : null,
            auge: d.auge ? { pose: d.auge.pose, vorbild: d.auge.vorbild } : null,
            welt: soll.length && !d.auge ? welt.map((z) => ({ wort: z.wort, ab: z.ab, was: z.was })) : [],
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
        Object.defineProperty(st, "tafel", { enumerable: false, value: S.auge
            ? { richter: "fehlt", grund: "Blindpaar: die Station legt das Bild an der Pose " + S.auge.pose + " (Vorbild " + S.auge.vorbild + ") und urteilt nie GRÜN — das Urteil fällt am Gerät mit dem Auge" }
            : { richter: "gleich" } });
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
    if (S.auge)
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
    // Besuch offline), Planet und Epoche der Sitzung (`_planetSamen` gelaende-chunks.js:672, `zeitMa` feld-leben.js:1277).
    LEITERN.push(
        leiter({
            leiter: "same.preis.bytes",
            sek: 15,
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
                },
            },
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
                await L.je(7, async () =>
                    L.umfang(7, new Set([w.planet]).size, "die Sitzung hält einen Planeten (Same " + w.planet + ") — kein Sprung zu einem neuen Planeten im Lauf")
                );
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
