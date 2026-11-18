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
// @@TEILE-ENDE@@

module.exports = LEITERN.flat();
module.exports.geruest = geruest;
