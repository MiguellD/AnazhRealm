// DIE RICHTER-FABRIK DES KAPITELS mensch (Meisterkarte 2; vision/PLAN-1712.md §1, Auftrag des Koordinators vom 18.11.): je Leiter
// EINE Probe in der warmen Welt der Sitzung (Deckel ≤ 60 s), die ALLE ihre Sprossen misst — je Sprosse eine Station
// `karte2.<Leiter>#<Sprosse>`; alle Stationen einer Leiter tragen dieselbe Probe (Zwillinge, punkte.cjs gruppiere: EIN Lauf, jede
// Station urteilt ihre Sprosse über dasselbe JSON). Das Soll je Sprosse steht als Zahl aus dem `richter` der Karte (die `quelle`
// trägt ihn wörtlich), der Umfang geht der Probe als Argument zu (SPEC.sprossen[n].umfang); das Urteil liest das ERGEBNIS der Welt,
// nie den Weg, nie den Code-Text. Den Preis (R8) schneidet die Sitzung aus ihrem Strom über dasselbe Fenster (vision/richter-akte.cjs,
// sobald die Tafel die Station mit „gleich“ führt) — die Fabrik misst keinen eigenen.
//
// DAS REGISTER: diese Datei lädt die Perspektiven `k2-mensch-<perspektive>.js` neben ihr (je `module.exports = (F) => [ F.leiter(id,
// def), … ]`) und exportiert ihre Stationen als EINE Liste (punkte.cjs ladeStationen lädt `k2-<kapitel>.js` wie g1…g6). Welche Leiter
// des Kapitels noch ohne Probe steht, nennt `node k2-mensch.js --abdeckung` beim Namen — nie still.
//
// DIE LEITER (F.leiter(id, def)), def:
//   sek       der Deckel der Probe in s (Vorgabe 45, höchstens 60 — „≤ 60 s je Leiter in einer warmen Welt“)
//   mutiert   true, wenn die Probe die Welt ändert (baut, rafft die Zeit, setzt Bewohner) — die Sitzung stellt danach den Grund
//   pfad      die Globs des Spiel-Baums, die die Probe liest und ausführt (R6, die Wand PFAD)
//   messe     async (H, K) => { … } — das EINE Mess-Programm der Leiter (Pfeil oder function, nie eine Methoden-Kurzform: der Text steht
//             im argv der Probe). H ist das Werkzeug der Sitzung (sitzung-seite.js), K das der Fabrik (k2Werkzeug unten)
//   seite     { NAME: async (r, T, arg) => { … } } — Funktionen für die Seite der Welt, in der Probe als H.seite.NAME (an K.welt als Text:
//             `K.welt("return await (" + H.seite.NAME + ")(r, T, " + JSON.stringify(arg) + ");")`); messe sieht nichts aus dem Modul
//   sprossen  { <n>: Sprosse } — jede Sprosse der Leiter steht GENAU EINMAL in sprossen, bestehend oder unklar:
//       { umfang: { soll, wort } | null, masse: [Maß, …], erwartet?: "zahl" | "nicht" | "leser", fehlt?, wo? }
//         Maß: { key, wort, soll, richtung: "≤" | "≥" } · { key, wort, von, bis } (Band) · { key, wort, soll, tol } (±)
//         erwartet/fehlt/wo: was die Probe an der Welt von heute findet (das Blatt zählt es; das Urteil fällt am Lauf)
//       { auge: { pose, vorbild } } — der Blindpaar-Richter: die Probe schießt das Bild an fester Pose, GRÜN nie ohne Geräte-Urteil
//   bestehend { <n>: "<Station>" } — die Sprosse urteilt schon eine Station (Tafel „gleich“ oder karte2.…#n): keine zweite
//   unklar    { <n>: "<Vorschlag in einem Satz>" } — der Richter ist unmessbar oder widersprüchlich: keine Station, das Blatt nennt ihn
//   proben    { <n>: [{ name, j, gruen, zahl? }] } — die Mutanten der Leiter (dazu erzeugt die Fabrik je Sprosse ihre eigenen)
//
// DAS ERGEBNIS je Sprosse (das JSON der Probe an {AUS}: { leiter, adapter, sprossen: { <n>: … } }):
//   zahl   { n, werte: { <key>: Zahl }, beleg?, taeter? } — n der gemessene Umfang. GRÜN nur auf einer Karte (der Adapter der
//          Sitzung), n ≥ Umfang-Soll (ohne Umfang ≥ 1) und jedes Maß im Soll; ROT nennt den Täter: das erste verfehlte Glied, dazu
//          die Täter-Zeile der Probe (taeter: wer im Spiel es verfehlt)
//   nicht  { n, fehlt } — „Umfang nicht erzeugbar: <fehlt>“: ein Urteil (ROT), nie ein Fehler, nie übersprungen
//   leser  { fehlt, wo, n? } — „fehlender Leser: <fehlt> (<datei:zeile>)“: das Spiel trägt nichts, was den Richter erfüllen kann (ROT);
//          die Fabrik schreibt den Haken NICHT — das Blatt (vision/richter/fabrik-mensch.md) führt die Zeile
//   auge   { bild, pose, vorbild, mass? } — das Bild der Sprosse liegt neben der Ausgabe; das Urteil trägt die Zeile `auge` mit Pose
//          und Vorbild und ist nie GRÜN (die Tafel-Zeile „fehlt“: es zählt erst mit dem Urteil am Gerät)
//   fehlt die Sprosse im Lauf oder warf ihre Messung: „S<n>: keine Messung der Sprosse“ — dasselbe Urteil wie über den LEEREN Lauf,
//          also UNGEMESSEN beim Namen (punkte.cjs keinUrteil), nie ein ROT des Spiels
//
// Die Aufrufe: node k2-mensch.js --abdeckung | --zeilen | --selbsttest [--perspektive p]
"use strict";
const fs = require("fs");
const path = require("path");
const { probeBefehl } = require("./sitzung-seite.js");

const KOORD = path.resolve(__dirname, "..", "..", "..");
const KAPITEL = "mensch";
const KARTE = JSON.parse(fs.readFileSync(path.join(KOORD, "vision", "meisterkarte-2.json"), "utf8"));
const GRUPPE = KARTE.gruppen.find((g) => g.id === KAPITEL);
const LEITER = new Map(GRUPPE.kriterien.map((L) => [L.id, L]));
const SEK_VORGABE = 45;
const SEK_MAX = 60;
const KARTE_PROBE = "[linse-gpu] amd/rdna-3 (Probe)";

// ───────────────────────── DAS WERKZEUG DER FABRIK IN DER PROBE (Text im argv: keine Platzhalter in geschweiften Klammern) ─────────────────────────
function k2Werkzeug(H, SPEC) {
    const K = { H, SPEC, sicht: "ego" };
    const j = (K.j = H.teil = { leiter: SPEC.leiter, adapter: null, sprossen: {} });
    // DER ADAPTER DER SITZUNG: die Welt nennt ihn in ihrem Log (PUNKTE_SITZUNG_LOG) — Zeile der Probe und Feld des JSON
    K.adapter = () => {
        let z = null;
        try {
            const t = H.fs.readFileSync(String(process.env.PUNKTE_SITZUNG_LOG || ""), "utf8");
            z = (/\[linse-gpu\][^\r\n]*/.exec(t) || [null])[0];
        } catch (_e) {}
        j.adapter = z || "[linse-gpu] ungenannt";
        console.log(j.adapter);
        return j.adapter;
    };
    // ein Funktionsrumpf in der Seite der Welt (r = Welt, T = THREE)
    K.welt = (code, ms) => H.evalWelt(code, ms || 30000);
    // DER MESSORT (spec/profiband/haushalt.json `messorte`): der Aufruf im Text heißt `K.messort("<ort>")` — so liest die Sitzung den Ort
    // und stellt VOR dem Deckel um (punkte.cjs probeOrt); die Sicht vorher über K.sicht ("ego" | "third")
    K.messort = async (ort) => {
        const a = await H.wb("/umstellen", { ort, sicht: K.sicht }, 120000);
        if (!a || a.fehler) throw H.messort(new Error("/umstellen " + ort + ": " + ((a && a.fehler) || "ohne Antwort")), "/umstellen");
        H.zeile("am Messort " + ort + " (" + K.sicht + ")");
        return a;
    };
    K.warte = (ms) => H.schlaf(ms);
    // JE SPROSSE EIN SCHRITT: ein Wurf ist keine Messung (die Sprosse bleibt ohne Ergebnis → UNGEMESSEN beim Namen), ein Wurf des
    // Messorts endet die Probe (die Marke MESSORT); an der Frist bleibt die Sprosse ungemessen, nie geraten
    K.schritt = async (n, f) => {
        if (H.rest() < 2) {
            H.zeile("S" + n + " an der Frist ausgelassen (" + H.sek() + " s)");
            return null;
        }
        try {
            return await f();
        } catch (e) {
            if (e && e.messort) throw e;
            const t = String((e && e.message) || e).split("\n")[0].slice(0, 300);
            H.zeile("S" + n + " warf: " + t);
            j.sprossen[n] = { art: "fehler", text: t };
            return null;
        }
    };
    const kurz = (t) => String(t == null ? "" : t).slice(0, 300);
    K.zahl = (n, o) =>
        (j.sprossen[n] = { art: "zahl", n: o.n, werte: o.werte || {}, ...(o.beleg ? { beleg: kurz(o.beleg) } : {}), ...(o.taeter ? { taeter: kurz(o.taeter) } : {}) });
    K.nicht = (n, o) => (j.sprossen[n] = { art: "nicht", n: o.n, fehlt: kurz(o.fehlt) });
    K.leser = (n, o) => (j.sprossen[n] = { art: "leser", fehlt: kurz(o.fehlt), wo: kurz(o.wo), ...(o.n != null ? { n: o.n } : {}) });
    K.auge = (n, o) => (j.sprossen[n] = { art: "auge", bild: o.bild, pose: kurz(o.pose), vorbild: kurz(o.vorbild || (SPEC.sprossen[n] && SPEC.sprossen[n].auge && SPEC.sprossen[n].auge.vorbild)), ...(o.mass ? { mass: kurz(o.mass) } : {}) });
    // DAS BILD EINER AUGEN-SPROSSE: der Ausgabe-Pfad der Spiel-Kamera (werkbank /bild) an fester Pose { px, py, pz, lx, ly, lz },
    // abgelegt neben der Ausgabe der Probe (<AUS>-S<n>.png; die Abnahme der Werkbank legt ein ROT-Bild als -rot.png daneben)
    K.bild = async (n, pose, mehr) => {
        const datei = String(H.AUS).replace(/\.json$/i, "") + "-S" + n + ".png";
        let a = null;
        try {
            a = await H.wb("/bild", Object.assign({ datei, w: 1280, h: 720 }, pose, mehr || {}), 90000);
        } catch (e) {
            a = { fehler: String((e && e.message) || e) };
        }
        const da = [a && a.datei, datei, datei.replace(/\.png$/i, "-rot.png")].find((f) => f && H.fs.existsSync(f));
        if (!da) throw new Error("kein Bild S" + n + ": " + kurz(a && (a.fehler || a.abnahme)));
        return { datei: da, abnahme: kurz(a && (a.abnahme || a.fehler)) };
    };
    K.ende = () => j;
    return K;
}
// der Rumpf jeder Probe: das Werkzeug, der Adapter, das Mess-Programm der Leiter, das JSON
const rumpf = (messe) => "async (H) => {\n    const K = H.seite.K(H, H.seite.SPEC);\n    K.adapter();\n    await (" + messe + ")(H, K);\n    return K.ende();\n}";

// ───────────────────────── DAS URTEIL JE SPROSSE (läuft in der Punkte-Maschine) ─────────────────────────
const KEIN = (n) => ({ gruen: false, zahl: "S" + n + ": keine Messung der Sprosse" });
const SOFTWARE = /swiftshader|llvmpipe|lavapipe|software|subzero|ungenannt/i;
function adapterVon(j, lauf) {
    const t = (j && typeof j.adapter === "string" ? j.adapter : "") + "\n" + String((lauf && lauf.stdout) || "");
    const ad = (/\[linse-gpu\][^\r\n]*/.exec(t) || [null])[0];
    return { ad: ad || "Adapter ungenannt", hw: !!ad && !SOFTWARE.test(ad) };
}
const zahlText = (w) => (typeof w === "number" && Number.isFinite(w) ? String(+w.toPrecision(5)) : "—");
const istBand = (m) => m.von != null;
const istTol = (m) => m.tol != null;
const haelt = (m, w) =>
    typeof w === "number" && Number.isFinite(w) && (istBand(m) ? w >= m.von && w <= m.bis : istTol(m) ? Math.abs(w - m.soll) <= m.tol : m.richtung === "≥" ? w >= m.soll : w <= m.soll);
const sollText = (m) => (istBand(m) ? m.von + "–" + m.bis : istTol(m) ? m.soll + " ±" + m.tol : m.richtung + " " + m.soll);
const schritt = (x) => (Number.isInteger(x) ? 1 : Math.max(Math.abs(x) * 0.1, 1e-3));
const drinnen = (m) => (istBand(m) ? (m.von + m.bis) / 2 : m.soll);
const jenseits = (m) => (istBand(m) ? m.bis + schritt(m.bis) : istTol(m) ? m.soll + 2 * m.tol + schritt(m.soll) : m.richtung === "≥" ? m.soll - schritt(m.soll) : m.soll + schritt(m.soll));
const esc = (s) => String(s).replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

function urteilZahl(n, sp, s, a) {
    const um = sp.umfang;
    const nIst = typeof s.n === "number" ? s.n : NaN;
    const umSoll = um ? um.soll : 1;
    const umOk = Number.isFinite(nIst) && nIst >= umSoll;
    const teile = sp.masse.map((m) => ({ m, w: s.werte ? s.werte[m.key] : undefined }));
    const falsch = teile.find((t) => !haelt(t.m, t.w));
    const gruen = a.hw && umOk && !falsch;
    const taeter = !umOk ? "Umfang " + zahlText(nIst) + " < " + umSoll + (um ? " " + um.wort : "")
        : falsch ? falsch.m.wort + " " + zahlText(falsch.w) + " verfehlt " + sollText(falsch.m)
        : !a.hw ? "der Adapter " + a.ad : null;
    const masse = teile.map((t) => t.m.wort + " " + zahlText(t.w) + " (Soll " + sollText(t.m) + ")").join(" · ");
    return {
        gruen,
        zahl: "S" + n + " " + (gruen ? "GRÜN" : "ROT an " + taeter + (s.taeter ? " — Täter: " + s.taeter : "")) + " · " + masse + " · Umfang " + zahlText(nIst) +
            (um ? " (Soll ≥ " + um.soll + " " + um.wort + ")" : "") + (s.beleg ? " · " + s.beleg : "") + " · " + a.ad,
    };
}
function urteilDer(id, n, sp) {
    return (j, lauf) => {
        if (!j || typeof j !== "object" || j.leiter !== id || !j.sprossen || typeof j.sprossen !== "object") return KEIN(n);
        const s = j.sprossen[n];
        if (!s || typeof s !== "object" || s.art === "fehler") return KEIN(n);
        const a = adapterVon(j, lauf);
        const um = sp.umfang;
        if (s.art === "nicht")
            return { gruen: false, zahl: "S" + n + " ROT: Umfang nicht erzeugbar: " + s.fehlt + " (gemessen " + zahlText(s.n) + (um ? ", Soll " + um.soll + " " + um.wort : "") + ") · " + a.ad };
        if (s.art === "leser")
            return { gruen: false, zahl: "S" + n + " ROT: fehlender Leser: " + s.fehlt + " (" + s.wo + ")" + (s.n != null ? " · gemessen " + zahlText(s.n) : "") + " · " + a.ad };
        if (sp.auge) {
            if (s.art !== "auge") throw new Error("S" + n + ": die Probe meldet „" + s.art + "“, die Sprosse ist ein Augen-Richter");
            if (!s.bild) return KEIN(n);
            return { gruen: false, zahl: "S" + n + " auge: Bild " + path.basename(String(s.bild)) + " an Pose " + s.pose + " gegen Vorbild " + s.vorbild + (s.mass ? " · " + s.mass : "") + " — GRÜN erst mit dem Urteil am Gerät (Blindpaar) · " + a.ad };
        }
        if (s.art !== "zahl") throw new Error("S" + n + ": die Probe meldet „" + s.art + "“, die Sprosse misst Zahlen");
        return urteilZahl(n, sp, s, a);
    };
}

// DIE MUTANTEN JE SPROSSE (punkte.cjs probenUrteil, der Selbsttest): der GRÜN-Fall, die ATTRAPPE (der Wortlaut ohne Welt: Umfang 0 —
// ROT am Umfang), je Maß der Wert jenseits des Solls (ROT an diesem Maß), das fehlende Maß, die Software-Karte, „Umfang nicht
// erzeugbar“, „fehlender Leser“, die Sprosse ohne Messung und die geworfene Messung (beide „keine Messung“, also UNGEMESSEN)
function probenDer(id, n, sp, eigene) {
    const j = (s, ad) => ({ leiter: id, adapter: ad || KARTE_PROBE, sprossen: { [n]: s } });
    const p = [];
    if (sp.auge)
        p.push({ name: "auge: das Bild an der Pose — GRÜN nie ohne das Urteil am Gerät", j: j({ art: "auge", bild: "probe-S" + n + ".png", pose: "Probe", vorbild: sp.auge.vorbild }), gruen: false, zahl: /auge: Bild / });
    else {
        const voll = { art: "zahl", n: sp.umfang ? sp.umfang.soll : 1, werte: Object.fromEntries(sp.masse.map((m) => [m.key, drinnen(m)])) };
        p.push({ name: "GRÜN: jedes Maß im Soll, der Umfang voll, eine Karte", j: j(voll), gruen: true });
        p.push({ name: "ATTRAPPE: der Wortlaut ohne Welt (Umfang 0) — ROT am Umfang", j: j({ ...voll, n: 0 }), gruen: false, zahl: /ROT an Umfang 0 / });
        for (const m of sp.masse)
            p.push({ name: "Soll verfehlt: " + m.wort + " " + jenseits(m), j: j({ ...voll, werte: { ...voll.werte, [m.key]: jenseits(m) } }), gruen: false, zahl: new RegExp("ROT an " + esc(m.wort) + " ") });
        p.push({ name: "das Maß fehlt im Lauf", j: j({ ...voll, werte: {} }), gruen: false, zahl: /ROT an / });
        p.push({ name: "swiftshader", j: j(voll, "[linse-gpu] google/swiftshader"), gruen: false, zahl: /ROT an der Adapter / });
        p.push({ name: "der Adapter ungenannt", j: j(voll, "[linse-gpu] ungenannt"), gruen: false });
    }
    p.push({ name: "Umfang nicht erzeugbar", j: j({ art: "nicht", n: 1, fehlt: "Probe" }), gruen: false, zahl: /Umfang nicht erzeugbar: Probe/ });
    p.push({ name: "fehlender Leser", j: j({ art: "leser", fehlt: "Probe", wo: "stamm/probe.js:1" }), gruen: false, zahl: /fehlender Leser: Probe \(stamm\/probe\.js:1\)/ });
    p.push({ name: "die Sprosse fehlt im Lauf (UNGEMESSEN)", j: { leiter: id, adapter: KARTE_PROBE, sprossen: {} }, gruen: false, zahl: /keine Messung der Sprosse$/ });
    p.push({ name: "die Messung der Sprosse warf (UNGEMESSEN)", j: j({ art: "fehler", text: "Probe" }), gruen: false, zahl: /keine Messung der Sprosse$/ });
    p.push({ name: "das JSON einer fremden Leiter", j: { leiter: id + "-fremd", adapter: KARTE_PROBE, sprossen: { [n]: { art: "zahl", n: 1e9, werte: {} } } }, gruen: false, zahl: /keine Messung der Sprosse$/ });
    return [...p, ...(eigene || [])];
}

// ───────────────────────── DIE FABRIK ─────────────────────────
const RICHTUNG = ["≤", "≥"];
function pruefeSprosse(wo, sp) {
    if (sp.auge) {
        if (!sp.auge.pose || !sp.auge.vorbild) throw new Error(wo + ": auge trägt pose und vorbild");
        // ein Augen-Richter, dessen Umfang die Welt von heute nicht trägt: die Probe urteilt „Umfang nicht erzeugbar“ (ROT), nie ein Bild
        if (sp.erwartet != null && !(sp.erwartet === "nicht" && typeof sp.fehlt === "string" && sp.fehlt.length >= 4)) throw new Error(wo + ": auge trägt höchstens erwartet „nicht“ mit fehlt");
        return;
    }
    if (sp.umfang != null && !(Number.isFinite(sp.umfang.soll) && sp.umfang.soll >= 1 && typeof sp.umfang.wort === "string" && sp.umfang.wort))
        throw new Error(wo + ": umfang ist { soll ≥ 1, wort } oder null");
    if (!Array.isArray(sp.masse) || !sp.masse.length) throw new Error(wo + ": masse ist leer (eine Zahl-Sprosse misst mindestens ein Maß)");
    const keys = new Set();
    for (const m of sp.masse) {
        if (!m || typeof m.key !== "string" || !m.key || typeof m.wort !== "string" || !m.wort) throw new Error(wo + ": ein Maß trägt key und wort");
        if (keys.has(m.key)) throw new Error(wo + ": der Schlüssel " + m.key + " doppelt");
        keys.add(m.key);
        const ok = istBand(m) ? Number.isFinite(m.von) && Number.isFinite(m.bis) && m.von <= m.bis
            : istTol(m) ? Number.isFinite(m.soll) && Number.isFinite(m.tol) && m.tol >= 0
            : Number.isFinite(m.soll) && RICHTUNG.includes(m.richtung);
        if (!ok) throw new Error(wo + ": das Maß " + m.key + " ist kein { soll, richtung ≤|≥ } · { von, bis } · { soll, tol }");
    }
    if (sp.erwartet != null && !["zahl", "nicht", "leser"].includes(sp.erwartet)) throw new Error(wo + ": erwartet ist zahl | nicht | leser");
    if (sp.erwartet === "nicht" && !(typeof sp.fehlt === "string" && sp.fehlt.length >= 4)) throw new Error(wo + ": erwartet nicht nennt, was fehlt");
    if (sp.erwartet === "leser" && !(typeof sp.wo === "string" && /^[\w./-]+:\d+$/.test(sp.wo) && typeof sp.fehlt === "string")) throw new Error(wo + ": erwartet leser nennt fehlt und wo (datei:zeile)");
}
const leitern = []; // je Leiter { id, perspektive, def } — die Abdeckung und das Blatt lesen sie
function leiter(id, def) {
    const L = LEITER.get(id);
    if (!L) throw new Error("k2-mensch: die Leiter " + id + " steht nicht im Kapitel " + KAPITEL + " der Karte");
    if (leitern.some((x) => x.id === id)) throw new Error("k2-mensch: die Leiter " + id + " doppelt");
    const sek = def.sek == null ? SEK_VORGABE : def.sek;
    if (!(Number.isInteger(sek) && sek >= 10 && sek <= SEK_MAX)) throw new Error(id + ": sek ist eine ganze Zahl 10…" + SEK_MAX);
    if (typeof def.messe !== "function") throw new Error(id + ": messe ist keine Funktion");
    try {
        new Function("return (" + String(def.messe) + ");"); // parst als Ausdruck (keine Methoden-Kurzform)
    } catch (e) {
        throw new Error(id + ": messe parst nicht als Ausdruck (" + e.message + ") — Pfeil oder function, nie eine Methoden-Kurzform");
    }
    if (/\{(PORT|AUS|BAUM|KOORD|SEK)\}/.test(String(def.messe))) throw new Error(id + ": messe trägt einen Platzhalter des Läufers");
    // DIE SEITEN-FUNKTIONEN der Leiter (H.seite.NAME in der Probe, als Text an K.welt): messe sieht nichts aus dem Modul — nur sie
    const seite = def.seite || {};
    for (const [k, f] of Object.entries(seite)) {
        if (!/^[A-Z][A-Z0-9_]*$/.test(k) || k === "K" || k === "SPEC") throw new Error(id + ": seite." + k + " — Namen in GROSSBUCHSTABEN, nie K oder SPEC");
        if (typeof f !== "function") throw new Error(id + ": seite." + k + " ist keine Funktion");
        try {
            new Function("return (" + String(f) + ");");
        } catch (e) {
            throw new Error(id + ": seite." + k + " parst nicht als Ausdruck (" + e.message + ")");
        }
        if (/\{(PORT|AUS|BAUM|KOORD|SEK)\}/.test(String(f))) throw new Error(id + ": seite." + k + " trägt einen Platzhalter des Läufers");
    }
    if (!Array.isArray(def.pfad) || !def.pfad.length) throw new Error(id + ": pfad leer");
    const sprossen = def.sprossen || {}, bestehend = def.bestehend || {}, unklar = def.unklar || {};
    for (const s of L.sprossen) {
        const wo = id + " S" + s.nr;
        const da = [sprossen[s.nr], bestehend[s.nr], unklar[s.nr]].filter((x) => x != null).length;
        if (da !== 1) throw new Error(wo + ": steht " + da + "× in sprossen | bestehend | unklar (Soll genau 1)");
        if (sprossen[s.nr]) pruefeSprosse(wo, sprossen[s.nr]);
        if (unklar[s.nr] != null && !(typeof unklar[s.nr] === "string" && unklar[s.nr].length >= 12)) throw new Error(wo + ": unklar trägt den Vorschlag in einem Satz");
        if (bestehend[s.nr] != null && !(typeof bestehend[s.nr] === "string" && /#\d+$/.test(bestehend[s.nr]))) throw new Error(wo + ": bestehend nennt die Station (<kriterium>#<staffel>)");
    }
    for (const k of [...Object.keys(sprossen), ...Object.keys(bestehend), ...Object.keys(unklar)])
        if (!L.sprossen.some((s) => String(s.nr) === k)) throw new Error(id + ": die Sprosse " + k + " steht nicht in der Karte");
    const nrn = L.sprossen.map((s) => s.nr).filter((n) => sprossen[n]);
    const SPEC = { leiter: id, sprossen: Object.fromEntries(nrn.map((n) => [n, sprossen[n].auge ? { auge: sprossen[n].auge } : { umfang: sprossen[n].umfang || null, masse: sprossen[n].masse }])) };
    const probe = { ...probeBefehl(rumpf(def.messe), sek, { K: k2Werkzeug, SPEC: JSON.stringify(SPEC), ...seite }), ...(def.mutiert ? { mutiert: true } : {}) };
    leitern.push({ id, def, nrn });
    return nrn.map((n) => ({
        kriterium: "karte2." + id,
        karte2: true,
        staffel: n,
        geraet: ["radeon", "gtx"],
        ...(n === 1 ? { beide: true } : {}),
        probe,
        gpu: true,
        zeit: false,
        minuten: 2,
        urteil: urteilDer(id, n, sprossen[n]),
        proben: probenDer(id, n, sprossen[n], (def.proben || {})[n]),
        pfad: ["scripts/werkbank.cjs", "scripts/lib/welt-boot.cjs", ...def.pfad],
        quelle: "KARTE2 " + id + " S" + n + " = " + L.sprossen.find((s) => s.nr === n).richter,
    }));
}
const F = { leiter, KAPITEL, LEITER };

// ───────────────────────── DAS REGISTER ─────────────────────────
const PERSPEKTIVEN = GRUPPE.perspektiven.map((p) => p.id);
const geladen = [];
const stationen = [];
for (const p of PERSPEKTIVEN) {
    const f = path.join(__dirname, "k2-mensch-" + p + ".js");
    if (!fs.existsSync(f)) continue; // die Lücke nennt --abdeckung beim Namen (je Leiter ohne Probe)
    const m = require(f);
    if (typeof m !== "function") throw new Error("k2-mensch-" + p + ".js exportiert keine Funktion (F) => [ … ]");
    const vor = leitern.length;
    const liste = m(F);
    if (!Array.isArray(liste)) throw new Error("k2-mensch-" + p + ".js gibt keine Liste");
    for (const x of leitern.slice(vor)) if (LEITER.get(x.id).perspektive !== p && x.id.split(".")[1] !== p) throw new Error(x.id + " gehört nicht zur Perspektive " + p);
    for (const x of leitern.slice(vor)) x.perspektive = p;
    stationen.push(...liste.flat());
    geladen.push(p);
}
module.exports = stationen;

// ───────────────────────── ABDECKUNG · TAFEL-ZEILEN · SELBSTTEST ─────────────────────────
const sprosseVon = (x, n) => x.def.sprossen[n];
function abdeckung() {
    const je = [];
    for (const p of PERSPEKTIVEN) {
        const Ls = GRUPPE.kriterien.filter((L) => L.id.split(".")[1] === p);
        const z = { p, leitern: Ls.length, mitProbe: 0, sprossen: 0, station: 0, zahl: 0, nicht: 0, leser: 0, auge: 0, augeNicht: 0, bestehend: 0, unklar: 0, ohne: [] };
        for (const L of Ls) {
            z.sprossen += L.sprossen.length;
            const x = leitern.find((y) => y.id === L.id);
            if (!x) {
                z.ohne.push(L.id);
                continue;
            }
            z.mitProbe++;
            for (const s of L.sprossen) {
                const sp = sprosseVon(x, s.nr);
                if (sp) {
                    z.station++;
                    z[sp.erwartet || (sp.auge ? "auge" : "zahl")]++;
                    if (sp.auge && sp.erwartet) z.augeNicht++;
                } else if ((x.def.bestehend || {})[s.nr]) z.bestehend++;
                else z.unklar++;
            }
        }
        je.push(z);
    }
    return je;
}
function zeilen() {
    const aus = [];
    for (const x of leitern)
        for (const n of x.nrn) {
            const sp = sprosseVon(x, n);
            aus.push(sp.auge
                ? { station: "karte2." + x.id + "#" + n, leiter: x.id, sprosse: n, richter: "fehlt", grund: "auge: die Station schießt das Bild an der Pose „" + sp.auge.pose + "“ gegen das Vorbild „" + sp.auge.vorbild + "“ — es zählt erst mit dem Urteil am Gerät (Blindpaar)" }
                : { station: "karte2." + x.id + "#" + n, leiter: x.id, sprosse: n, richter: "gleich" });
        }
    return aus;
}
function selbsttest(nur) {
    const falsch = [];
    let n = 0;
    for (const st of stationen) {
        const x = leitern.find((y) => "karte2." + y.id === st.kriterium);
        if (nur && x.perspektive !== nur) continue;
        const id = st.kriterium + "#" + st.staffel;
        // der LEERE Lauf (punkte.cjs leerUrteile): ROT, dasselbe Urteil wie die Sprosse ohne Messung
        for (const exit of [0, 1, 2, null]) {
            const u = st.urteil(null, { exit, stdout: "[linse-gpu] nvidia/pascal", stderr: "" });
            if (u.gruen || u.zahl !== KEIN(st.staffel).zahl) falsch.push(id + " leer Exit " + exit + ": " + u.zahl);
        }
        for (const p of st.proben) {
            n++;
            let u;
            try {
                u = st.urteil(p.j || null, { exit: 0, stdout: p.stdout || "", stderr: "" });
            } catch (e) {
                u = { gruen: null, zahl: "Urteil warf: " + e.message };
            }
            if (!u || u.gruen !== p.gruen) falsch.push(id + " " + p.name + ": " + (u && u.gruen ? "GRÜN" : "ROT") + " statt " + (p.gruen ? "GRÜN" : "ROT") + " (" + (u ? u.zahl : "kein Urteil") + ")");
            else if (p.zahl && !p.zahl.test(String(u.zahl))) falsch.push(id + " " + p.name + ": die Zahl nennt nicht " + p.zahl + " (" + String(u.zahl).slice(0, 200) + ")");
        }
        // der argv der Probe parst (wie punkte.cjs BEFEHL TRÄGT: node -e)
        try {
            new Function(st.probe.befehl[2]);
        } catch (e) {
            falsch.push(id + " der argv der Probe parst nicht: " + e.message);
        }
    }
    return { proben: n, falsch };
}
if (require.main === module) {
    const a = process.argv.slice(2);
    const nur = a.includes("--perspektive") ? a[a.indexOf("--perspektive") + 1] : null;
    if (a.includes("--zeilen")) {
        console.log(JSON.stringify(zeilen(), null, 1));
    } else if (a.includes("--selbsttest")) {
        const r = selbsttest(nur);
        for (const f of r.falsch) console.log("  ROT " + f);
        console.log((r.falsch.length ? "ROT" : "GRÜN") + " k2-mensch Selbsttest: " + stationen.filter((st) => !nur || leitern.find((y) => "karte2." + y.id === st.kriterium).perspektive === nur).length + " Stationen, " + r.proben + " Mutanten, " + r.falsch.length + " falsch");
        process.exit(r.falsch.length ? 1 : 0);
    } else {
        const je = abdeckung();
        const sum = (k) => je.reduce((s, z) => s + (Array.isArray(z[k]) ? z[k].length : z[k]), 0);
        for (const z of je)
            console.log(`${z.p.padEnd(11)} Leitern ${z.mitProbe}/${z.leitern} · Sprossen ${z.sprossen}: Station ${z.station} (zahl ${z.zahl} · nicht ${z.nicht}${z.augeNicht ? " (davon Augen-Richter " + z.augeNicht + ")" : ""} · leser ${z.leser} · auge ${z.auge}) · bestehend ${z.bestehend} · unklar ${z.unklar}` + (z.ohne.length ? " · OHNE PROBE: " + z.ohne.join(", ") : ""));
        console.log(`Σ          Leitern ${sum("mitProbe")}/${sum("leitern")} · Sprossen ${sum("sprossen")}: Station ${sum("station")} (zahl ${sum("zahl")} · nicht ${sum("nicht")} (davon Augen-Richter ${sum("augeNicht")}) · leser ${sum("leser")} · auge ${sum("auge")}) · bestehend ${sum("bestehend")} · unklar ${sum("unklar")}`);
        process.exit(sum("ohne") ? 1 : 0);
    }
}
module.exports.abdeckung = abdeckung;
module.exports.zeilen = zeilen;
module.exports.leitern = leitern;
