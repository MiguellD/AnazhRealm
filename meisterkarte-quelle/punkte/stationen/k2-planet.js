// stationen/k2-planet.js — DIE LEITER-RICHTER DES KAPITELS planet der Meisterkarte 2 (26 Leitern, 180 Sprossen; 18.11., Zweig
// richter-planet-leben-zusammenspiel). Je Perspektive EINE Probe in der warmen Welt der Sitzung, je Sprosse eine Station
// karte2.<leiter>#<nr>; der Kern unten ist geteilt mit k2-leben.js und k2-zusammenspiel.js (module.exports.kern).
"use strict";
const fs = require("fs");
const path = require("path");
const { seiteProbe, knapp } = require("./seite.cjs");
// DIE KLASSE DER AUGE-SPROSSE (ZAHL · PANEL · KORPUS am Wortlaut der Karte, R11) — EIN Ort für alle k2-Register
const AUGE = require("./auge-klasse.cjs");
// DER FÄCHER (M4: der Richter ist selbst eine Adresse, stationen/faecher.js) — eine Leiter mit `faecher: true` findet ihn in ihrer
// Probe als `FAECHER(ev, f)`; die Probe einer Perspektive ohne ihn bleibt Byte für Byte, wie sie war (ihr Abdruck misst nichts neu)
const { FAECHER } = require("./faecher.js");

// ════════════════════════════════════════════════════════════════════════════════════════════════════════════════════════════════
// DER KERN DER LEITER-RICHTER (Meisterkarte 2, 18.11., Zweig richter-planet-leben-zusammenspiel) — geteilt mit k2-leben.js und
// k2-zusammenspiel.js über `require("./k2-planet.js").kern`. Kein zweiter Läufer, kein neues Register: die Probe ist `seiteProbe`
// (stationen/seite.cjs) in der EINEN warmen Welt der Sitzung, das Urteil ist `urteil(j, lauf)` je Station, der Preis (R8) fällt in
// derselben Fahrt aus dem Strom (vision/richter-akte.cjs über die Tafel-Zeile „gleich“), der Selbsttest sind die `proben`.
//
// DAS GESETZ DER LEITER-STATION:
//   · je PERSPEKTIVE EINE Probe (ein Lauf, eine Welt): ihre Leitern messen nacheinander, jede unter ihrem Deckel ≤ 60 s;
//   · je SPROSSE eine Station `karte2.<leiter>#<nr>` — Zwillinge derselben Probe (punkte.cjs gruppiere: derselbe befehl fährt EINMAL);
//     ihr Urteil liest die Messung ihrer Sprosse aus dem JSON der Probe ({AUS});
//   · das Messprogramm ist EINS je Leiter, `mess(H, U, M)`, der Umfang jeder Sprosse ist sein Argument (U[nr]);
//   · das Soll steht WÖRTLICH im Richter der Karte (`K.soll` wirft beim Laden, wenn das Wort oder seine Zahl dort nicht steht);
//   · GRÜN nur, wenn jedes Soll hält UND der Zeuge der Welt spricht (`zeuge(roh)`: die Welt hat sich beobachtbar geändert, die Zahl
//     kommt aus N Proben der Welt — die Attrappe, die den Wortlaut erfüllt, ohne die Welt zu ändern, fällt dort);
//   · ein Umfang, den das Spiel heute nicht erzeugt, urteilt ROT „Umfang nicht erzeugbar: <was fehlt>“ (die Probe meldet `nicht`);
//   · eine Sprosse mit Auge schießt das Bild an der festen Pose und legt es ab; ihre Klasse steht am Wortlaut der Karte in
//     stationen/auge-klasse.cjs: ZAHL — die Station urteilt an Soll und Zeuge, das Bild ist Beleg; PANEL (Prüfer-Satz R11) und
//     KORPUS (ein Band realer Daten fehlt im Repo) — sie behauptet NIE GRÜN, ihre Zahl trägt die Zeile `auge` mit Pose und Vorbild;
//   · eine Sprosse, die eine Station der Karte 2 oder eine Zeile der Tafel schon trägt, bekommt KEINEN Zwilling (Gebot 4).
// ════════════════════════════════════════════════════════════════════════════════════════════════════════════════════════════════
const KERN = (() => {
    const BASIS = path.join(__dirname, "..", "..", "..");
    const KARTE = JSON.parse(fs.readFileSync(path.join(BASIS, "vision", "meisterkarte-2.json"), "utf8"));
    const leitern = new Map();
    for (const g of KARTE.gruppen) for (const L of g.kriterien) leitern.set(L.id, { kapitel: g.id, L, sprossen: new Map(L.sprossen.map((s) => [s.nr, s])) });
    const leiterVon = (id) => {
        const x = leitern.get(id);
        if (!x) throw new Error("die Leiter " + id + " steht nicht in vision/meisterkarte-2.json");
        return x;
    };
    const sprosseVon = (id, nr) => {
        const s = leiterVon(id).sprossen.get(nr);
        if (!s) throw new Error("die Sprosse " + id + " S" + nr + " steht nicht in vision/meisterkarte-2.json");
        return s;
    };
    // die Perspektive einer Leiter: im Kapitel zusammenspiel der Kopf ihrer id (planet · leben · mensch · erleben · same), sonst ihr Feld
    const perspektiveVon = (id) => {
        const x = leiterVon(id);
        return x.kapitel === "zusammenspiel" ? id.split(".")[0] : x.L.perspektive;
    };

    // DIE BELEGTEN SPROSSEN: eine Station der Karte 2 in g1 … g6 oder eine Zeile „gleich“ der Tafel trägt sie schon
    let belegtMap = null;
    const belegt = () => {
        if (belegtMap) return belegtMap;
        belegtMap = new Map();
        try {
            // die Zeile einer Leiter-Station (`karte2.<leiter>#<nr>`) belegt nie: sie ist die Zeile DIESER Station (Richter-Falte 19.11.);
            // trägt ein anderes Register dieselbe Station, fällt der Schlüssel doppelt in pruefeStationen
            for (const z of JSON.parse(fs.readFileSync(path.join(BASIS, "vision", "richter-tafel.json"), "utf8")).zeilen)
                if (z.richter === "gleich" && z.station !== "karte2." + z.leiter + "#" + z.sprosse) belegtMap.set(z.leiter + "#" + z.sprosse, "Tafel: " + z.station);
        } catch (_e) {
            /* ein Baum ohne Tafel: nur die Stationen */
        }
        for (const g of ["g1", "g2", "g3", "g4", "g5", "g6"]) {
            const f = path.join(__dirname, g + ".js");
            if (!fs.existsSync(f)) continue;
            for (const st of require(f))
                if (st && st.karte2 === true && /^karte2\./.test(st.kriterium || "")) belegtMap.set(st.kriterium.slice(7) + "#" + st.staffel, "Station " + g + ".js " + st.kriterium + "#" + st.staffel);
        }
        return belegtMap;
    };

    // DIE ZAHL DER KARTE: „80“ · „0,05“ · „2 000“ · „10⁵“ · „3,9·10⁵“ · „−4“ → Number
    const HOCH = { "⁰": "0", "¹": "1", "²": "2", "³": "3", "⁴": "4", "⁵": "5", "⁶": "6", "⁷": "7", "⁸": "8", "⁹": "9", "⁻": "-" };
    // die reine Zehnerpotenz ZUERST (19.11., Fund zusammenspiel-leben: „10⁶“ las die Alternative `\d+` als 10 — sie steht links und
    // greift an derselben Stelle zuerst)
    const ZAHL_RE = /[−-]?10[⁰¹²³⁴⁵⁶⁷⁸⁹⁻]+|[−-]?(?:\d{1,3}(?:[  ]\d{3})+|\d+)(?:,\d+)?(?:\s?·\s?10[⁰¹²³⁴⁵⁶⁷⁸⁹⁻]+)?/g;
    const zahlVon = (t) => {
        const s = String(t).trim();
        const nur = /^([−-]?)10([⁰¹²³⁴⁵⁶⁷⁸⁹⁻]+)$/.exec(s);
        if (nur) return (nur[1] ? -1 : 1) * Math.pow(10, Number(nur[2].replace(/./g, (c) => HOCH[c])));
        const m = /^([−-]?)((?:\d{1,3}(?:[  ]\d{3})+|\d+)(?:,\d+)?)(?:\s?·\s?10([⁰¹²³⁴⁵⁶⁷⁸⁹⁻]+))?$/.exec(s);
        if (!m) return NaN;
        const v = Number(m[2].replace(/[  ]/g, "").replace(",", "."));
        const e = m[3] ? Math.pow(10, Number(m[3].replace(/./g, (c) => HOCH[c]))) : 1;
        return (m[1] ? -1 : 1) * v * e;
    };
    const zahlenIn = (t) => (String(t).match(ZAHL_RE) || []).map(zahlVon).filter(Number.isFinite);
    const deutsch = (x) => (typeof x !== "number" || !Number.isFinite(x) ? String(x) : Math.abs(x) >= 1e5 ? x.toExponential(2).replace(".", ",") : String(Math.round(x * 1000) / 1000).replace(".", ","));

    // DAS SOLL EINER SPROSSE, wörtlich aus der Karte: `wort` muss im Richter stehen; rel ≥ ≤ > < = band ± ±% — die Zahl(en) aus dem Wort
    // (o.zahl/o.bis müssen unter den Zahlen des Worts stehen); ± misst gegen o.ref (die Erd-Referenz mit o.refQuelle beim Namen)
    function soll(leiter, nr, wort, o = {}) {
        const sp = sprosseVon(leiter, nr), r = sp.richter;
        if (typeof wort !== "string" || !wort || !r.includes(wort)) throw new Error("Soll „" + wort + "“ steht nicht wörtlich im Richter " + leiter + " S" + nr + ": „" + r + "“");
        const z = zahlenIn(wort);
        // DIE ZAHL AUS EINEM ANDEREN FELD DER SPROSSE ODER EINER BENANNTEN QUELLE (19.11.: fünf Teile bauten je ein eigenes `sollFrei` —
        // EIN Weg im Kern): o.quelleFeld + o.quelleWort — die Zahl steht wörtlich im Feld (umfang, tiefe …) der Sprosse; o.refQuelle allein
        // nur, wenn das Wort KEINE Zahl trägt (sonst gilt die Zahl des Worts) — nie eine Zahl ohne Herkunft
        if (o.quelleFeld || (o.refQuelle && !z.length && !o.rel?.startsWith("±"))) {
            const wer = "Soll „" + wort + "“ " + leiter + " S" + nr;
            let quelle = o.refQuelle;
            if (o.quelleFeld) {
                const t = String(sp[o.quelleFeld] == null ? "" : sp[o.quelleFeld]);
                if (!o.quelleWort || !t.includes(o.quelleWort)) throw new Error(wer + ": „" + o.quelleWort + "“ steht nicht in " + o.quelleFeld + " der Sprosse („" + t + "“)");
                const zq = zahlenIn(o.quelleWort);
                for (const v of [o.zahl, o.bis]) if (v !== undefined && !zq.some((x) => Math.abs(x - v) <= 1e-9 * Math.max(1, Math.abs(v)))) throw new Error(wer + ": " + v + " steht nicht in „" + o.quelleWort + "“ (" + zq.join(", ") + ")");
                quelle = o.quelleFeld + " der Sprosse: „" + o.quelleWort + "“" + (o.refQuelle ? " · " + o.refQuelle : "");
            } else if (!(typeof o.refQuelle === "string" && o.refQuelle.length >= 12)) throw new Error(wer + ": ohne Zahl im Wort verlangt das Soll refQuelle (≥ 12 Zeichen) oder quelleFeld + quelleWort");
            if (!Number.isFinite(o.zahl) || !["≥", "≤", ">", "<", "=", "band", "±"].includes(o.rel) || (o.rel === "band" && !Number.isFinite(o.bis)) || (o.rel === "±" && !Number.isFinite(o.ref)))
                throw new Error(wer + ": rel (≥ ≤ > < = band ±) und zahl (band: bis, ±: ref) verlangt");
            return { wort, key: o.key || wort, rel: o.rel, a: o.zahl, b: o.bis, ref: o.ref, refQuelle: quelle, einheit: o.einheit || "", faktor: o.faktor };
        }
        let rel = o.rel;
        if (!rel) {
            if (/±/.test(wort)) rel = /%/.test(wort) ? "±%" : "±";
            else if (/≥|mindestens|ab /.test(wort)) rel = "≥";
            else if (/≤|höchstens|bis /.test(wort)) rel = "≤";
            else if (/>/.test(wort)) rel = ">";
            else if (/</.test(wort)) rel = "<";
            else if (/\d\s?[–-]\s?\d/.test(wort)) rel = "band";
            else rel = "=";
        }
        // die Zahl des Solls steht HINTER seinem Zeichen („p90 ≤ 20 km“: 20, nicht 90; „Panel-2AFC ≤ 70 %“: 70), das Band ist das Paar um „–“
        const zeichen = { "≥": /≥|mindestens|ab /, "≤": /≤|höchstens|bis /, ">": />/, "<": /</, "±": /±/, "±%": /±/ }[rel];
        const hinter = zeichen && wort.search(zeichen) >= 0 ? zahlenIn(wort.slice(wort.search(zeichen)))[0] : undefined;
        const paar = rel === "band" ? /((?:\d[\d  ]*)(?:,\d+)?(?:\s?·\s?10)?[⁰¹²³⁴⁵⁶⁷⁸⁹⁻]*)\s?[–-]\s?((?:\d[\d  ]*)(?:,\d+)?(?:\s?·\s?10)?[⁰¹²³⁴⁵⁶⁷⁸⁹⁻]*)/.exec(wort) : null;
        const a = o.zahl != null ? o.zahl : paar ? zahlVon(paar[1].trim()) : hinter !== undefined ? hinter : z[0];
        const b = rel === "band" ? (o.bis != null ? o.bis : paar ? zahlVon(paar[2].trim()) : z[1]) : undefined;
        for (const [n, v] of [["zahl", a], ["bis", b]])
            if (v !== undefined && !z.some((x) => Math.abs(x - v) <= 1e-9 * Math.max(1, Math.abs(v))))
                throw new Error("Soll „" + wort + "“ " + leiter + " S" + nr + ": " + n + " " + v + " steht nicht unter den Zahlen des Worts (" + z.join(", ") + ")");
        if (!Number.isFinite(a) || (rel === "band" && !Number.isFinite(b))) throw new Error("Soll „" + wort + "“ " + leiter + " S" + nr + ": keine Zahl im Wort");
        if ((rel === "±" || rel === "±%") && !(Number.isFinite(o.ref) && typeof o.refQuelle === "string" && o.refQuelle.length >= 4))
            throw new Error("Soll „" + wort + "“ " + leiter + " S" + nr + ": ± verlangt ref (Zahl) und refQuelle (die Erd-Referenz beim Namen)");
        if (!["≥", "≤", ">", "<", "=", "band", "±", "±%"].includes(rel)) throw new Error("Soll „" + wort + "“: rel " + rel + " unbekannt");
        return { wort, key: o.key || wort, rel, a, b, ref: o.ref, refQuelle: o.refQuelle, einheit: o.einheit || "", faktor: o.faktor };
    }
    const haelt = (s, w) => {
        if (typeof w !== "number" || !Number.isFinite(w)) return false;
        const e = 1e-9 * Math.max(1, Math.abs(s.a));
        switch (s.rel) {
            case "≥": return w >= s.a - e;
            case "≤": return w <= s.a + e;
            case ">": return w > s.a;
            case "<": return w < s.a;
            case "=": return Math.abs(w - s.a) <= e;
            case "band": return w >= s.a - e && w <= s.b + e;
            case "±": return Math.abs(w - s.ref) <= s.a + e;
            case "±%": return Math.abs(w - s.ref) <= (s.a / 100) * Math.abs(s.ref) + e;
        }
        return false;
    };
    const sollText = (s) => (s.rel === "band" ? deutsch(s.a) + "–" + deutsch(s.b) : s.rel === "±" || s.rel === "±%" ? deutsch(s.ref) + " ± " + deutsch(s.a) + (s.rel === "±%" ? " %" : "") : s.rel + " " + deutsch(s.a)) + (s.einheit && s.rel !== "±%" ? " " + s.einheit : "");

    // DER ZEUGE DER KARTE im stdout (die Sitzung schreibt `[linse-gpu] <backend>/<adapter>`): ohne ihn oder auf swiftshader kein Gerät
    const kartenZeuge = (stdout) => {
        const m = /^\[linse-gpu\] (.+)$/m.exec(String(stdout || ""));
        if (!m) return "kein Zeuge der Karte im Lauf ([linse-gpu] fehlt)";
        if (/swiftshader|llvmpipe|software/i.test(m[1])) return "die Karte ist " + m[1].trim() + " — kein Gerät, kein Urteil über das Bild";
        return null;
    };

    // DAS URTEIL EINER SPROSSE über den Lauf der Perspektive
    // `zahl`: die Auge-Sprosse ist ZAHL (auge-klasse.cjs) — sie urteilt wie jede Zahl-Sprosse, das Bild steht als Beleg daneben
    function urteilBauen(leiter, nr, sp, zahl) {
        const richtetAuge = !!sp.auge && !zahl;
        const beleg = (roh) => {
            if (!sp.auge) return "";
            const a = roh.auge || {};
            return " · Bild (Beleg) " + (a.bild || "fehlt" + (a.grund ? " (" + String(a.grund).slice(0, 80) + ")" : ""));
        };
        return (j, lauf) => {
            const kopf = "S" + nr + " ";
            const rot = (text, taeter) => ({ gruen: false, zahl: kopf + text + (taeter ? " · Täter: " + taeter : "") });
            const kz = kartenZeuge(lauf && lauf.stdout);
            if (!j || typeof j !== "object" || !j.leitern) return rot("keine Messung: die Probe schrieb kein JSON der Leitern" + (kz ? " (" + kz + ")" : ""));
            if (kz) return rot(kz);
            const L = j.leitern[leiter];
            if (!L) return rot("die Leiter " + leiter + " ist im Lauf nicht gemessen (die Probe endete vor ihr)");
            // DER DECKEL DER LEITER IST KEIN URTEIL (pm-front-f1, 21.11.; GTX 31ea3847: 13 Sprossen der Front standen ROT „die Messung der
            // Leiter warf nach 25 s: der Deckel der Leiter 25 s“, ohne dass ein Wert gelesen war). Die Sprosse ist die Einheit des Ergebnisses
            // (punkte.cjs keinUrteil (e)): was die Leiter vor dem Deckel in `M.teil` schrieb, urteilt wie jede Messung, der Deckel steht
            // daneben; die Sprosse ohne Wert ist UNGEMESSEN beim Namen (`ohneUrteil`, keinUrteil (f)), nie ROT. Ein anderer Wurf der
            // Leiter (die Welt warf, der Code der Leiter warf) bleibt ROT mit seinem Text.
            const roh0 = L.sprossen && L.sprossen[nr];
            const deckelL = L.warf && (L.deckel === true || /^der Deckel der Leiter \d+ s$/.test(String(L.warf)));
            if (L.warf && !(roh0 && typeof roh0 === "object")) {
                if (deckelL) {
                    const grund = "der Deckel der Leiter riss nach " + deutsch(L.s) + " s vor dem Wert der Sprosse";
                    return { gruen: false, zahl: kopf + grund + " · " + String(L.warf).slice(0, 120), ohneUrteil: grund };
                }
                return rot("die Messung der Leiter warf nach " + deutsch(L.s) + " s: " + String(L.warf).slice(0, 220), sp.taeter);
            }
            const vorDeckel = L.warf ? " · gemessen vor dem Wurf der Leiter nach " + deutsch(L.s) + " s: " + String(L.warf).slice(0, 120) : "";
            const roh = roh0;
            const mit = (u) => (vorDeckel ? { ...u, zahl: u.zahl + vorDeckel } : u);
            if (!roh || typeof roh !== "object") return rot("die Sprosse ist im Lauf nicht gemessen", sp.taeter);
            // DER KURZE RAFFER (rafferStellen): eine Takt-Schleife der Leiter endete am Budget vor ihrem Soll — UNGEMESSEN mit Zahl
            if (Array.isArray(L.raffer) && L.raffer.length && !roh.nicht) {
                const grund = "der Raffer trug " + L.raffer.map((z) => z.name + " " + z.n + " von " + z.soll + " Takten in " + deutsch(z.s) + " s").join(", ") + " — am Budget der Leiter (die Leiter lief " + deutsch(L.s) + " s)";
                return { gruen: false, zahl: kopf + grund, ohneUrteil: grund };
            }
            const werte = roh.werte || {};
            // DIE HALBE SPROSSE UNTER DEM DECKEL (pm-front-f1): jede Leiter schreibt ihr Ergebnis in M.teil (`const aus = M.teil`), der Deckel
            // kann eine Sprosse treffen, deren Wert noch nicht stand — fehlt unter dem Deckel ein Wert ihres Solls, ist sie UNGEMESSEN beim
            // Namen des Werts, nie ROT „ungemessen ✗“ (ohne Deckel bleibt ein fehlender Wert ROT: die Leiter lief durch und las ihn nicht)
            if (L.warf && deckelL) {
                const offen = sp.soll.filter((s) => werte[s.key] == null || (typeof werte[s.key] === "number" && !Number.isFinite(werte[s.key]))).map((s) => s.key);
                if (offen.length) {
                    const grund = "der Deckel der Leiter riss nach " + deutsch(L.s) + " s, ehe " + offen.join(", ") + " der Sprosse stand";
                    return { gruen: false, zahl: kopf + grund + " · " + String(L.warf).slice(0, 120), ohneUrteil: grund };
                }
            }
            const teile = sp.soll.map((s) => {
                const w = werte[s.key];
                const ok = haelt(s, w);
                return { ok, text: s.key + " " + (typeof w === "number" && Number.isFinite(w) ? deutsch(w) + (s.einheit && s.rel !== "±%" ? " " + s.einheit : "") : "ungemessen") + " gegen Soll " + sollText(s) + (ok ? " ✓" : " ✗") };
            });
            const mess = teile.map((t) => t.text).join(" · ");
            if (richtetAuge) {
                const a = roh.auge || {};
                const k = AUGE.klasse(leiter, nr);
                return mit({
                    gruen: false,
                    zahl: kopf + (mess ? mess + " · " : "") + "auge: Pose " + (a.pose || sp.auge.pose) + " · Vorbild " + sp.auge.vorbild + " · Bild " + (a.bild || "fehlt" + (a.grund ? " (" + String(a.grund).slice(0, 120) + ")" : "")) +
                        (k.klasse === "panel" ? " — R11 Panel („" + k.wort + "“): das Urteil fällt im Panel, die Station behauptet kein GRÜN" : " — Korpus fehlt (" + k.wort + "): die Station behauptet kein GRÜN") +
                        (roh.nicht ? " · Umfang nicht erzeugbar: " + roh.nicht : ""),
                });
            }
            if (roh.nicht) return mit(rot("Umfang nicht erzeugbar: " + String(roh.nicht).slice(0, 260) + (mess ? " · " + mess : "") + beleg(roh), roh.taeter || sp.taeter));
            const fall = teile.find((t) => !t.ok);
            if (fall) return mit(rot(mess + beleg(roh), roh.taeter || sp.taeter));
            let zg;
            try {
                zg = sp.zeuge(roh);
            } catch (e) {
                zg = "der Zeuge warf: " + String((e && e.message) || e).slice(0, 120);
            }
            if (zg) return mit(rot(mess + " · der Zeuge der Welt fehlt: " + zg + beleg(roh), roh.taeter || sp.taeter));
            return mit({ gruen: true, zahl: kopf + mess + " · Zeuge: " + String(sp.zeugeText || "die Welt geändert").slice(0, 120) + beleg(roh) });
        };
    }

    // DIE PROBEN (Selbsttest) einer Sprosse: die Messung im Soll GRÜN (nie an einer PANEL- oder KORPUS-Sprosse; an einer ZAHL-Sprosse
    // mit Auge auch ohne Bild — das Bild ist Beleg), jede Attrappe ROT, dazu die Fälle der Maschine
    const ZEUGE = "[linse-gpu] amd/rdna-3 (Probe)";
    function probenBauen(leiter, nr, sp, zahl) {
        const j = (roh) => ({ leitern: { [leiter]: { s: 1, sprossen: { [nr]: roh } } } });
        const nie = !!sp.auge && !zahl;
        const p = [];
        p.push({ name: "gemessen im Soll" + (nie ? " (Auge: nie GRÜN)" : sp.auge ? " (ZAHL: das Bild ist Beleg)" : ""), j: j(sp.gruen), stdout: ZEUGE, gruen: !nie });
        for (const a of sp.attrappen) p.push({ name: "ATTRAPPE " + a.name, j: j(a.roh), stdout: ZEUGE, gruen: false });
        for (const a of sp.proben || []) p.push({ name: a.name, j: j(a.roh), stdout: ZEUGE, gruen: !!a.gruen && !nie });
        // die ZAHL-Sprosse: jedes Soll einen Schritt daneben ist ROT (die Station urteilt den ganzen Satz, nie einen Teil)
        if (sp.auge && zahl)
            for (const s of sp.soll) {
                const w = sp.gruen.werte || {};
                const raus = s.rel === "≥" || s.rel === ">" ? s.a - 1 - Math.abs(s.a) : s.rel === "≤" || s.rel === "<" ? s.a + 1 + Math.abs(s.a) : s.rel === "band" ? s.b + 1 + Math.abs(s.b) : s.rel === "=" ? s.a + 1 + Math.abs(s.a) : s.rel === "±" ? s.ref + 2 * s.a + 1 : s.rel === "±%" ? s.ref + Math.abs(s.ref) * (s.a / 50) + 1 : null;
                if (raus !== null) p.push({ name: "ZAHL: das Soll " + s.key + " reißt", j: j({ ...sp.gruen, werte: { ...w, [s.key]: raus } }), stdout: ZEUGE, gruen: false });
            }
        p.push({ name: "Umfang nicht erzeugbar", j: j({ ...sp.gruen, nicht: "die Probe" }), stdout: ZEUGE, gruen: false });
        p.push({ name: "swiftshader", j: j(sp.gruen), stdout: "[linse-gpu] google/swiftshader", gruen: false });
        p.push({ name: "die Leiter warf", j: { leitern: { [leiter]: { s: 3, warf: "Error: Probe" } } }, stdout: ZEUGE, gruen: false });
        p.push({ name: "die Sprosse ungemessen", j: { leitern: { [leiter]: { s: 1, sprossen: {} } } }, stdout: ZEUGE, gruen: false });
        return p;
    }

    // DIE HILFEN DER PROBE (M; in die Art geschrieben, läuft in node neben der Welt): nicht · auge · uhr
    function probeHilfen(H) {
        const M = {};
        // DIE KARTE DER SITZUNG (der Zeuge im Log der Werkbank): auf swiftshader schießt die Probe kein Bild — /bild braucht dort
        // > 120 s je Schuss, und das Urteil über eine Software-Karte ist ohnehin ROT; die Zahl-Messungen laufen
        const log = process.env.PUNKTE_SITZUNG_LOG && require("fs").existsSync(process.env.PUNKTE_SITZUNG_LOG) ? require("fs").readFileSync(process.env.PUNKTE_SITZUNG_LOG, "utf8") : "";
        M.swift = /^\[linse-gpu\] .*(swiftshader|llvmpipe)/im.test(log);
        // „Umfang nicht erzeugbar: <was fehlt>“ — die Sprosse urteilt ROT mit dem Grund; werte bleiben, was gemessen wurde
        M.nicht = (was, werte) => ({ nicht: String(was), werte: werte || {} });
        // DAS BILD DER AUGE-SPROSSE an der festen Pose: /bild der Werkbank (die Kamera der Pose, 1920 × 1080), Rückgabe { bild, pose } — ein ROT der
        // Seite steht als grund, nie als Wurf
        // DIE POSE OHNE KAMERA (21.11.): `{ ort: "wiese" }` (57 Rufe) trägt kein px … lz — /bild der Werkbank liest `ort` nur als Inhalt
        // des Messorts, die Kamera stand auf NaN, und das Bild war schwarz (31ea3847-gtx: 31 Auge-Bilder „bild.schwarz 1 · Ziel
        // Blickziel nicht im Bild“, pose kamera [null,null,null]). Ohne px schießt das Auge an der Kamera des Spiels, wo der Spieler steht
        // (wie `--bewegung` in werkbank.cjs /bild); der Ort bleibt das Inhalts-Urteil der Abnahme
        M.auge = async (name, pose, o = {}) => {
            const datei = require("path").join(require("path").dirname(H.aus), "auge-" + name + ".png");
            if (M.swift) return { bild: null, pose: JSON.stringify(pose), grund: "swiftshader: kein Schuss ohne Gerät (ungefahren am Gerät)" };
            try {
                let p = pose || {};
                if (!Number.isFinite(Number(p.px))) {
                    const k = await H.seite("r._loopCamera(performance.now()); const c = r.state.camera; return [...c.position.toArray(), ...c.getWorldDirection(new T.Vector3()).multiplyScalar(20).add(c.position).toArray()];");
                    if (!Array.isArray(k) || k.length !== 6 || !k.every(Number.isFinite)) throw new Error("die Kamera des Spiels ist nicht lesbar: " + JSON.stringify(k).slice(0, 80));
                    p = Object.assign({}, p, { px: k[0], py: k[1], pz: k[2], lx: k[3], ly: k[4], lz: k[5] });
                }
                const b = await H.ruf("/bild", Object.assign({ w: 1920, h: 1080, wahl: 0, datei }, p, o));
                return { bild: b.datei || datei, pose: JSON.stringify(p) };
            } catch (e) {
                return { bild: null, pose: JSON.stringify(pose), grund: String((e && e.message) || e).slice(0, 200) };
            }
        };
        // die Uhr der Leiter: Sekunden seit ihrem Start (die Messung teilt ihren Deckel selbst)
        M.uhr = () => (Date.now() - M.t0) / 1000;
        // DIE PROBE DER KREATUR-LINSE AN DER SEITE (erbe-geburt): dieselbe Seiten-Funktion wie gate:kreatur-takt (scripts/lib/
        // kreatur-proben.cjs KREATUR_PROBEN_SRC, die Bühnen von scripts/diag-kreatur-leben.cjs) über `/eval` am Baum des SHA → je Probe
        // ihr Ergebnis (wirft die Bühne, trägt es `fehler`). EIN Lauf je Probe und Sitzung: die Leitern einer Perspektive teilen M und
        // dasselbe Versprechen (leben.evolution: ER fährt erbe, MU muster, ZV liest beide) — bis erbe-geburt zählten sie im eigenen
        // Zeitraffer der Station (FAUNA_MAX_AGE_MS: 0 Takte, Eltern ohne die Kennung der Mutter, Hirsch und Wolf ohne den Gau)
        M.kreaturProbe = async (proben) => {
            const memo = M.kreaturMemo || (M.kreaturMemo = {});
            const fehlt = proben.filter((p) => !memo[p]);
            if (fehlt.length) {
                const pfad = require("path");
                const { KREATUR_PROBEN_SRC } = require(pfad.resolve("scripts/lib/kreatur-proben.cjs"));
                const { CODE_OF_SEITE } = require(pfad.resolve("scripts/lib/welt-boot.cjs"));
                const lauf = H.seite("if (!window.__fehlt) { " + CODE_OF_SEITE + " } return await (" + KREATUR_PROBEN_SRC + ")(r, T, " + JSON.stringify({ proben: fehlt }) + ");");
                for (const p of fehlt)
                    memo[p] = lauf.then((aus) => (aus && aus[p]) || { fehler: "die Probe " + p + " antwortete nicht" }, (e) => ({ fehler: String((e && e.message) || e).slice(0, 300) }));
            }
            const l = await Promise.all(proben.map((p) => memo[p]));
            return Object.fromEntries(proben.map((p, i) => [p, l[i]]));
        };
        // DAS DORF DER PROBE für die Leiter (`dorf: true`): was der Rumpf vor den Leitern gründete — sein Fehler wirft die Leiter mit
        // dem Grund, nie still ohne Bewohner
        M.dorfDa = () => {
            if (!M.dorf) throw new Error("das Dorf der Probe: keine Leiter der Perspektive trägt dorf: true");
            if (M.dorf.fehler) throw new Error("das Dorf der Probe: " + M.dorf.fehler);
            return M.dorf;
        };
        return M;
    }

    // DAS DORF DER PROBE (19.11.). Die Sitzung nimmt ihren Grund nach der Zeile „anfang“ und spielt ihn nach jeder mutierenden Probe
    // zurück (`punkte.cjs` grundNehmen/grundSpielen, worldMeta mit Orten und Siedlungen): an der Wiese lebt also kein Dorf, das eine
    // andere Probe gründete — headless maß Welt 1 nach dem Grund 0 Orte und 0 Städte. Eine Leiter, die Bewohner liest, trägt
    // `dorf: true`; die Probe gründet dann VOR ihren Leitern EINMAL das Dorf über den Akt des Spiels (`spawnSettlement`,
    // stamm/siedlung-ort.js: dieselbe Foundry, derselbe Erdbau, dasselbe Gedächtnis `settlementCells` „d:<same>@x,z“ wie jedes Dorf
    // der Welt), wartet, bis es lebt (≥ 8 Bewohner), und gilt als `mutiert` — die Sitzung spielt danach den Grund zurück. Lebt ≤ 230 m
    // schon ein Dorf, nimmt die Probe dieses. Die Seite trägt seinen Schlüssel in `window.__dorfDerProbe`, die Leiter liest `M.dorfDa()`.
    const DORF_S = 60;
    const DORF_A = { same: 7, nH: 8 };
    async function dorfSeite(r, a) {
        const st = r.state, pm = st.playerMesh.position;
        const nah = () => [...(r._bewohnerSiedlungen || new Map()).values()].filter((q) => q && q.plan && Math.hypot(q.ox - pm.x, q.oz - pm.z) < 230).sort((p, q) => Math.hypot(p.ox - pm.x, p.oz - pm.z) - Math.hypot(q.ox - pm.x, q.oz - pm.z));
        const lebt = () => nah().find((q) => q.liste && q.lebt && q.liste.length >= 8);
        const t0 = performance.now();
        let D = lebt(), gebaut = false;
        if (!D && !nah().length) {
            let ort = null;
            for (const R of [100, 130, 160]) for (let k = 0; k < 16 && !ort; k++) { const w = (k / 16) * 2 * Math.PI, x = pm.x + Math.cos(w) * R, z = pm.z + Math.sin(w) * R; if (r._landAt(x, z, 0.2) && !(r._nassAt && r._nassAt(x, z))) ort = { x, z }; }
            if (!ort) return { fehler: "kein Land 100–160 m um den Spieler für das Dorf der Probe" };
            const res = await r.spawnSettlement({ seed: a.same, nH: a.nH, position: { x: ort.x, y: 0, z: ort.z } });
            if (!res) return { fehler: "der Akt spawnSettlement gründete nichts (Foundry kalt, Reich einer Stadt oder keine Ort-Wahl; das Log der Welt nennt den Grund)" };
            gebaut = true;
        }
        if (!D) {
            try { await window.__gebautNach("das Dorf der Probe", { fertig: () => !!lebt(), max: 400 }); } catch (e) { return { fehler: "das Dorf lebt nicht: " + String((e && e.message) || e).slice(0, 160) }; }
            D = lebt();
        }
        if (!D) return { fehler: "kein lebendes Dorf ≤ 230 m um den Spieler" };
        window.__dorfDerProbe = D.key;
        const y = r.getTerrainHeightAt(D.ox, D.oz);
        return { key: D.key, n: D.liste.length, ms: Math.round(performance.now() - t0), gebaut, region: D.plan.region, jahr: D.plan.jahr, seed: D.plan.seed, ab: Math.round(Math.hypot(D.ox - pm.x, D.oz - pm.z)), pose: { px: D.ox, py: y + 9, pz: D.oz + 32, lx: D.ox, ly: y + 1.5, lz: D.oz } };
    }
    // DER RUMPF DER PROBE: die Leitern nacheinander, jede unter ihrem Deckel; nach jeder Leiter steht das JSON ({AUS}) — eine gerissene
    // Frist behält, was gemessen ist
    async function probeRumpf(H, M, LEITERN, DORF) {
        const fs = require("fs");
        await H.frist();
        const aus = { fassung: 1, leitern: {} };
        if (DORF) {
            const t0 = Date.now();
            let uhr = null;
            try {
                M.dorf = await Promise.race([
                    H.seite("return await (" + DORF.code + ")(r, " + JSON.stringify(DORF.a) + ");"),
                    new Promise((_, nein) => (uhr = setTimeout(() => nein(new Error("der Deckel des Dorfs " + DORF.sek + " s")), DORF.sek * 1000))),
                ]);
            } catch (e) {
                M.dorf = { fehler: String((e && e.message) || e).split("\n")[0].slice(0, 300) };
            }
            clearTimeout(uhr);
            if (!M.dorf || typeof M.dorf !== "object") M.dorf = { fehler: "die Seite gab kein Dorf" };
            aus.dorf = Object.assign({ s: (Date.now() - t0) / 1000 }, M.dorf);
            H.schritt("dorf");
            fs.writeFileSync(H.aus, JSON.stringify(aus));
        }
        // DIE SPROSSE IST DIE EINHEIT (pm-front-f1): eine Leiter legt jedes fertige Ergebnis in `M.teil[nr]`, sobald es steht; reißt ihr
        // Deckel, bleibt es gemessen (`deckel: true` daneben) — die Sprosse ohne Wert ist UNGEMESSEN (urteilBauen), nie ROT
        for (const id of Object.keys(LEITERN)) {
            const L = LEITERN[id];
            M.t0 = Date.now();
            M.teil = {};
            let uhr = null, deckel = false;
            await rafferStellen(H, L.sek);
            try {
                const r = await Promise.race([
                    L.mess(H, L.U, M),
                    new Promise((_, nein) => (uhr = setTimeout(() => ((deckel = true), nein(new Error("der Deckel der Leiter " + L.sek + " s"))), L.sek * 1000))),
                ]);
                aus.leitern[id] = { s: (Date.now() - M.t0) / 1000, sprossen: (r && r.sprossen) || {} };
            } catch (e) {
                aus.leitern[id] = Object.assign({ s: (Date.now() - M.t0) / 1000, warf: String((e && e.message) || e).split("\n")[0].slice(0, 300) }, deckel ? { deckel: true } : {}, { sprossen: Object.assign({}, M.teil) });
            }
            clearTimeout(uhr);
            const kurz = await rafferKurz(H);
            if (kurz.length) aus.leitern[id].raffer = kurz;
            H.schritt(id);
            fs.writeFileSync(H.aus, JSON.stringify(aus));
        }
        return 0;
        // DER RAFFER AM BUDGET SEINER PROBE (pm-stationen-kalender 22.11.; Radeon 161ff792: die Leiter leben.oeko.dynamik stand 271 s
        // still — ihr Raffer zählte das Jahr in Welt-Uhr-Sekunden, unter dem angehaltenen Tag der Bühne (10¹² min) 4·10¹² Takte). JEDE
        // Takt-Schleife einer Leiter fährt über `window.__raffer(soll, schritt, name)`: sie endet am Soll oder am Budget der Leiter
        // (ihr Deckel weniger 15 s für das, was nach dem Raffen kommt — Auge, Urteil) und meldet { n, soll, s }. Wer sein Soll nicht
        // schafft, steht in `__rafferKurz`; eine Folge von Läufen fragt `__rafferRest()` (ms bis zum Budget), ehe sie den nächsten
        // beginnt; die Leiter trägt die Liste (`raffer`), und jede ihrer Sprossen ohne „Umfang nicht erzeugbar“ ist UNGEMESSEN mit Zahl
        // („n von m Takten in s“, urteilBauen) — nie still, nie hängend, nie ROT an einem Rest. (Im Rumpf: er reist als Text in die Probe.)
        async function rafferStellen(H, sek) {
            const ms = Math.max(3, (Number(sek) || 10) - 15) * 1000;
            await H.seite(
                "window.__rafferEnde = performance.now() + " + ms + "; window.__rafferKurz = []; " +
                "window.__raffer = (soll, schritt, name) => { const t0 = performance.now(); let n = 0; " +
                "for (; n < soll && performance.now() < window.__rafferEnde; n++) schritt(n); " +
                "const z = { name: String(name || 'raffer'), n, soll, s: Math.round(performance.now() - t0) / 1000 }; " +
                "if (n < soll) window.__rafferKurz.push(z); return z; }; " +
                "window.__rafferRest = () => window.__rafferEnde - performance.now(); return 1;"
            );
        }
        // die Seite, die nach der Leiter nicht mehr antwortet, steht als kurzer Raffer beim Grund (nie still)
        async function rafferKurz(H) {
            try {
                const k = await H.seite("const k = window.__rafferKurz || []; window.__rafferKurz = []; return k;");
                return Array.isArray(k) ? k : [];
            } catch (e) {
                return [{ name: "die Seite antwortete nicht: " + String((e && e.message) || e).slice(0, 120), n: 0, soll: 1, s: 0 }];
            }
        }
    }

    // DIE PERSPEKTIVE: EINE Probe für ihre Leitern, je Sprosse eine Station
    function perspektive(kapitel, pid, def) {
        const ids = Object.keys(def.leitern);
        if (!ids.length) throw new Error("die Perspektive " + kapitel + "." + pid + " trägt keine Leiter");
        const stuecke = [];
        let sek = 10;
        let mutiert = false;
        let dorf = false;
        let faecher = false;
        for (const id of ids) {
            const x = leiterVon(id);
            if (x.kapitel !== kapitel) throw new Error(id + " gehört zum Kapitel " + x.kapitel + ", nicht " + kapitel);
            if (perspektiveVon(id) !== pid) throw new Error(id + " gehört zur Perspektive " + perspektiveVon(id) + ", nicht " + pid);
            const L = def.leitern[id];
            if (!(Number.isInteger(L.sek) && L.sek >= 1 && L.sek <= 60)) throw new Error(id + ": sek " + L.sek + " — eine Leiter misst in ≤ 60 s");
            if (typeof L.mess !== "function") throw new Error(id + ": mess ist keine Funktion");
            const U = {};
            for (const [nr] of x.sprossen) if (L.sprossen[nr]) U[nr] = L.sprossen[nr].u || {};
            stuecke.push(JSON.stringify(id) + ": { sek: " + L.sek + ", U: " + JSON.stringify(U) + ", mess: " + knapp(L.mess) + " }");
            sek += L.sek;
            mutiert = mutiert || !!L.mutiert;
            dorf = dorf || !!L.dorf;
            faecher = faecher || !!L.faecher;
        }
        // das Dorf der Probe: sein Deckel zählt zur Probe, und die Gründung mutiert die Welt (die Sitzung spielt danach den Grund zurück)
        if (dorf) {
            sek += DORF_S;
            mutiert = true;
        }
        const DORF = dorf ? "{ code: " + JSON.stringify(knapp(dorfSeite)) + ", a: " + JSON.stringify(DORF_A) + ", sek: " + DORF_S + " }" : "null";
        const art = "async (H) => { " + (faecher ? "const FAECHER = " + knapp(FAECHER) + "; " : "") + "const M = (" + knapp(probeHilfen) + ")(H); const LEITERN = {" + stuecke.join(",\n") + "}; return (" + knapp(probeRumpf) + ")(H, M, LEITERN, " + DORF + "); }";
        const probe = seiteProbe(sek, art, mutiert ? { mutiert: true } : {});
        const stationen = [];
        const B = belegt();
        for (const id of ids) {
            const x = leiterVon(id);
            const L = def.leitern[id];
            for (const [nr, s] of x.sprossen) {
                const sp = L.sprossen[nr];
                if (B.has(id + "#" + nr)) {
                    if (sp) throw new Error(id + " S" + nr + " trägt schon " + B.get(id + "#" + nr) + " — kein Zwilling (Gebot 4)");
                    continue;
                }
                if (!sp) throw new Error(id + " S" + nr + ": keine Sprosse in der Station (jede Sprosse der Leiter urteilt)");
                if (!Array.isArray(sp.soll) || !sp.soll.length) throw new Error(id + " S" + nr + ": soll leer");
                // die Klasse der Auge-Sprosse am Wortlaut (auge-klasse.cjs; wirft, wenn sie dort fehlt): eine ZAHL-Sprosse urteilt wie
                // jede Zahl-Sprosse und braucht ihren Zeugen
                const zahl = !!sp.auge && AUGE.klasse(id, nr).klasse === "zahl";
                if ((!sp.auge || zahl) && typeof sp.zeuge !== "function") throw new Error(id + " S" + nr + ": zeuge fehlt (die Attrappe fiele nie)" + (zahl ? " — die Sprosse ist ZAHL (auge-klasse.cjs), ihr Bild ist nur Beleg" : ""));
                if (sp.auge && !(sp.auge.pose && sp.auge.vorbild)) throw new Error(id + " S" + nr + ": auge verlangt pose und vorbild");
                if (!sp.gruen || !Array.isArray(sp.attrappen) || !sp.attrappen.length) throw new Error(id + " S" + nr + ": gruen und attrappen (Selbsttest) fehlen");
                if (typeof sp.taeter !== "string" || sp.taeter.length < 4) throw new Error(id + " S" + nr + ": taeter fehlt (wer beim ROT beim Namen steht)");
                const st = {
                    kriterium: "karte2." + id,
                    karte2: true,
                    staffel: nr,
                    geraet: ["radeon", "gtx"],
                    probe,
                    gpu: true,
                    zeit: false,
                    minuten: Math.max(1, Math.ceil(sek / 60)),
                    urteil: urteilBauen(id, nr, sp, zahl),
                    proben: probenBauen(id, nr, sp, zahl),
                    pfad: L.pfad,
                    quelle: "KARTE2 " + id + " S" + nr + " = " + s.richter,
                };
                if (nr === 1) st.beide = true;
                // DAS BLATT (vision/richter/fabrik-planet-leben-zusammenspiel.md) liest diese Felder; die Maschine nie
                Object.defineProperty(st, "blatt", { enumerable: false, value: { perspektive: kapitel + "." + pid, auge: sp.auge || null, nicht: sp.nicht || null, leser: sp.leser || null, unklar: sp.unklar || null, ungefahren: L.ungefahren || "ungefahren am Gerät" } });
                // DIE TAFEL-ZEILE (der Vertrag aller k2-Register, punkte.cjs k2TafelZeile): „gleich“ — die Station urteilt die Sprosse ganz
                // (auch die ZAHL-Sprosse mit Bild als Beleg); „fehlt“ — PANEL (R11) oder KORPUS, Grund aus auge-klasse.cjs
                Object.defineProperty(st, "tafel", { enumerable: false, value: sp.auge ? AUGE.tafel(id, nr, true) : { richter: "gleich" } });
                stationen.push(st);
            }
        }
        return stationen;
    }

    // DER DECKEL DER LEITER IM SELBSTTEST (pm-front-f1): je Station zwei Proben aus ihrer ersten („gemessen im Soll“) — ohne Wert der
    // Sprosse UNGEMESSEN beim Namen (`ohneUrteil`, nie ROT „warf“); mit Wert aus `M.teil` urteilt die Sprosse wie gemessen, der Deckel daneben
    function mitDeckelProben(st, def) {
        const leiter = st.kriterium.slice(7), nr = st.staffel, p0 = st.proben[0];
        const roh = p0.j.leitern[leiter].sprossen[nr];
        const j = (sprossen) => ({ leitern: { [leiter]: { s: 25, warf: "der Deckel der Leiter 25 s", deckel: true, sprossen } } });
        const sp = def && def.leitern && def.leitern[leiter] && def.leitern[leiter].sprossen && def.leitern[leiter].sprossen[nr];
        const w0 = (roh && roh.werte) || {};
        // trägt schon die erste Probe nicht jeden Wert ihres Solls, ist sie unter dem Deckel die halbe Sprosse (unten)
        const halb = !!(sp && Array.isArray(sp.soll) && sp.soll.some((s) => w0[s.key] == null || (typeof w0[s.key] === "number" && !Number.isFinite(w0[s.key]))));
        st.proben = st.proben.concat([
            { name: "der Deckel der Leiter riss vor dem Wert", j: j({}), stdout: p0.stdout, gruen: false, zahl: /der Deckel der Leiter riss nach 25 s vor dem Wert der Sprosse/ },
            halb
                ? { name: "gemessen vor dem Deckel der Leiter, ohne jeden Wert des Solls", j: j({ [nr]: roh }), stdout: p0.stdout, gruen: false, zahl: /der Deckel der Leiter riss nach 25 s, ehe .+ der Sprosse stand/ }
                : { name: "gemessen vor dem Deckel der Leiter", j: j({ [nr]: roh }), stdout: p0.stdout, gruen: p0.gruen, zahl: /gemessen vor dem Wurf der Leiter nach 25 s/ },
        ]);
        // die halbe Sprosse: der Deckel traf sie, ehe ihre Werte standen (M.teil trägt das Objekt ohne Werte) — UNGEMESSEN beim Namen des Werts
        if (sp && Array.isArray(sp.soll) && sp.soll.length && roh && typeof roh === "object")
            st.proben.push({ name: "der Deckel der Leiter traf die halbe Sprosse", j: j({ [nr]: { ...roh, werte: {} } }), stdout: p0.stdout, gruen: false,
                zahl: /der Deckel der Leiter riss nach 25 s, ehe .+ der Sprosse stand/ });
        return st;
    }

    // DAS KAPITEL: sammelt die Perspektiven, die Datei exportiert `stationen()`. EINE Perspektive darf aus mehreren Teilen kommen
    // (19.11., zusammenspiel.same: neun Leitern, gebaut von mehreren Händen): jedes Teil ruft L.perspektive(pid, { leitern }), das
    // Kapitel sammelt die Leitern je pid und baut daraus EINE Probe (eine Welt, eine Gruppen-Zeile) — zwei Teile mit derselben Leiter werfen
    function kapitel(name) {
        const defs = new Map();
        return {
            perspektive: (pid, def) => {
                const d = defs.get(pid) || { leitern: {} };
                for (const id of Object.keys((def && def.leitern) || {})) {
                    if (d.leitern[id]) throw new Error(id + ": zwei Teile der Perspektive " + name + "." + pid + " bauen dieselbe Leiter (Gebot 4)");
                    d.leitern[id] = def.leitern[id];
                }
                defs.set(pid, d);
            },
            stationen: () => [...defs].flatMap(([pid, d]) => perspektive(name, pid, d).map((st) => mitDeckelProben(st, d))),
        };
    }
    return { kapitel, soll, zahlVon, zahlenIn, sprosseVon, leiterVon, perspektiveVon, belegt, haelt, deutsch, leitern, urteilBauen, probenBauen, knapp, probeRumpf };
})();

const K = KERN;
const L = K.kapitel("planet");

// ── DIE PERSPEKTIVE planet.geologie (7 Leitern, 48 Sprossen; belegt: keine) ──────────────────────────────────────────────────────────
// Die Leser des Spiels: der PLANET-FADEN (`r._planetAuftrag` planet-ort, stamm/gelaende-chunks.js:643 → voxel-worker.js:1175
// planetOrtAuftrag → planet-core planetScheibe/planetOrt/planetPunkt): je Lage, Samen und Zeit { land, hoeheM, kuesteKm, delta.wildnis }
// — die Wildnis-Regler, die der Boden liest (`ks` = 3 + 12 · Konvergenz am aktiven Rand, `hoehe` = 0,6 + Orogen-Stärke, `rauhLambda`
// = das Alter des Orogens), immer als Differenz zum Anker der Saat; die Station liest sie als Rang und gegen das Minimum der Saat
// (der Meeresgrund ohne Rand trägt Konvergenz 0, Orogen 0), nie als Formel. Der Faden trägt KEINE Platten-ID, keine Rand-Art, keinen
// Vulkan, kein Beben, keinen Körper (jeder Samen rechnet auf PLANET_ERDE, voxel-worker.js:1159) — was daran hängt, urteilt
// „Umfang nicht erzeugbar“, festgestellt an der Antwort der Welt (ihre Schlüssel, ein Körper-Argument ohne Wirkung).
// Am Ort des Spielers: die Höhe (`_terrainMacroSurfaceY`, `_voxelSurfaceY`), das Feld der Dichte (`_fieldDensityAt`: Höhle, Mündung),
// der Fels-Stoff des Kerns (gelaende-core FELS: das Einfallen der Bänke), die Lava (`_lavaZustand` an einer Tat der Welt-Zeit),
// die Temperatur unter dem Boden (`_temperaturAt`), die Stoff-Tafel (`state.materials`), die Tiefe der Welt (`_voxelChunkConfig`).
// Die Saat-Statistik (R2) fragt erde-01 … erde-100 über DENSELBEN Faden, solange der Deckel der Leiter trägt; die Zahl der Saaten
// ist ein Soll des Richters (die Station urteilt ROT, wenn der Deckel weniger trägt). R = 6 371 km ist der Körper PLANET_ERDE des
// Fadens (planet-core.js:263) — die Geometrie der Messung, keine Zahl der Welt.
L.perspektive("geologie", (() => {
    const PL = "planet.geologie.platten";
    const VU = "planet.geologie.vulkan";
    const GE = "planet.geologie.gebirge";
    const UW = "planet.geologie.unterwelt";
    const LA = "planet.geologie.lagerstaette";
    const IN = "planet.geologie.inneres";
    const EI = "planet.geologie.einschlag";
    const PFAD_PLANET = ["planet-core.js", "voxel-worker.js", "stamm/gelaende-chunks.js", "gelaende-core.js", "scripts/werkbank.cjs"];
    const PFAD_ORT = ["gelaende-core.js", "stamm/gelaende-*.js", "stamm/feld-leben.js", "stamm/bild-himmel.js", "stamm/bau-buch.js", "planet-core.js", "voxel-worker.js", "scripts/werkbank.cjs"];

    // DER ZEUGE DER WELT: jede genannte Zahl in `roh.zeuge` hält ihr Mindestmaß (Antworten der Welt, Saaten, Streuung) — die Attrappe,
    // die nur den Wortlaut der werte trägt, fällt hier; `wahr` nennt Felder, die die Welt bejahen muss
    const zMin = (spec, wahr) => (roh) => {
        const z = (roh && roh.zeuge) || {};
        if (z.fehler) return "die Messung warf: " + z.fehler;
        for (const [k, min] of Object.entries(spec)) if (!(typeof z[k] === "number" && z[k] >= min)) return "die Welt antwortete nicht: " + k + " " + (z[k] === undefined ? "fehlt" : z[k]) + " (Soll ≥ " + min + ")";
        for (const k of wahr || []) if (z[k] !== true) return "die Welt bejahte " + k + " nicht";
        return null;
    };
    const gut = (werte, zeuge) => ({ werte, zeuge });
    const leer = (werte) => ({ werte, zeuge: {} });
    // DER RICHTER OHNE ZAHL (unterwelt S1 „im Band“, lagerstaette S2, S4): K.soll kann ihn nicht fassen — das Soll steht wörtlich,
    // sein Vergleich „gegen“ die Referenz hält NIE (kein GRÜN ohne Schwelle; das Blatt nennt es `unklar`), die Sprosse trägt ein Auge
    const ohneZahl = (id, nr, wort, key) => {
        const r = K.sprosseVon(id, nr).richter;
        if (!r.includes(wort)) throw new Error("Soll „" + wort + "“ steht nicht wörtlich im Richter " + id + " S" + nr);
        if (K.zahlenIn(wort).length) throw new Error(id + " S" + nr + ": „" + wort + "“ trägt eine Zahl — das Soll gehört K.soll");
        return { wort, key, rel: "gegen", a: "die Referenz (der Richter nennt keine Schwelle)", einheit: "" };
    };
    // die Erd-Referenzen der Station (das Vorbild, nie eine Formel der Welt)
    const MOND_R = 1737.4;
    const senkung = (h) => (Math.acos(MOND_R / (MOND_R + h)) * 180) / Math.PI;
    const HON_S = Math.pow(1 / 0.0779, 2) * 3600; // Hon et al. 1994: Kruste H = 0,0779 · √t (m, h) — die 1-m-Decke durch-erstarrt
    const T_ZAHL = "[Erde: Hypsometrie nach Kossinna (1933) in Sverdrup et al. (1942)]";

    // ════════════════════════════════════════ PLATTEN ════════════════════════════════════════
    const platten = {
        sek: 60,
        pfad: PFAD_PLANET,
        ungefahren: "die Bilder (Schummerung, Orbit, Fach-Panel, Ursachen-Probe aus dem Orbitbild) und die Bilddifferenz benachbarter Zeiten (S5) schießt die Probe nur am Gerät; die Saat-Zahl hängt am Tempo des Planet-Fadens (headless ~2 ms je Lage)",
        mess: async function (H, U, M) {
            const R = 6371;
            const r3 = (x) => (Number.isFinite(x) ? Math.round(x * 1000) / 1000 : null);
            const med = (a) => {
                const b = a.filter(Number.isFinite).sort((x, y) => x - y);
                const n = b.length;
                return n ? (n % 2 ? b[(n - 1) / 2] : (b[n / 2 - 1] + b[n / 2]) / 2) : NaN;
            };
            const quant = (a, q) => {
                const b = a.filter(Number.isFinite).sort((x, y) => x - y);
                return b.length ? b[Math.min(b.length - 1, Math.max(0, Math.ceil(q * b.length) - 1))] : NaN;
            };
            const sd = (a) => {
                if (!a.length) return 0;
                const m = a.reduce((s, x) => s + x, 0) / a.length;
                return Math.sqrt(a.reduce((s, x) => s + (x - m) * (x - m), 0) / a.length);
            };
            const vek = (p) => {
                const b = (p[0] * Math.PI) / 180, l = (p[1] * Math.PI) / 180;
                return [Math.cos(b) * Math.cos(l), Math.sin(b), Math.cos(b) * Math.sin(l)];
            };
            const km = (p, q) => {
                const a = vek(p), b = vek(q);
                return R * Math.acos(Math.max(-1, Math.min(1, a[0] * b[0] + a[1] * b[1] + a[2] * b[2])));
            };
            const fib = (N) => {
                const P = [];
                for (let i = 0; i < N; i++) P.push([(Math.asin(1 - (2 * (i + 0.5)) / N) * 180) / Math.PI, ((i * 137.50776405) % 360) - 180]);
                return P;
            };
            const saat = (i) => "erde-" + String(i + 1).padStart(2, "0");
            const auge = async (name, pose, bis) =>
                Promise.race([
                    M.auge(name, pose),
                    new Promise((f) => setTimeout(() => f({ bild: null, pose: JSON.stringify(pose), grund: "kein Bild im Deckel der Leiter" }), Math.max(500, (bis - M.uhr()) * 1000))),
                ]);
            const frage = (L, zeit) =>
                H.seite("await r._fadenQuelle(); const L = " + JSON.stringify(L) + "; const a = await Promise.all(L.map((q) => r._planetAuftrag({ type: \"planet-ort\", samen: q[0], breite: Math.max(-89.99, Math.min(89.99, q[1])), laenge: ((q[2] + 540) % 360) - 180, zeitMa: " + zeit + " }))); " +
                    "return a.map((x) => [Math.round(x.hoeheM), Math.round(x.kuesteKm), x.version]);");
            const modus = (a) => {
                const z = new Map();
                let b = NaN, n = 0;
                for (const x of a) {
                    const c = (z.get(x) || 0) + 1;
                    z.set(x, c);
                    if (c > n) {
                        n = c;
                        b = x;
                    }
                }
                return b;
            };
            const aus = M.teil || {};
            const A = U[2];
            // ── A: die Stichprobe je Saat (S2, S4, S9; Grundlage von S1, S5): A.punkte Fibonacci-Lagen zur Zeit 0 — gezogen von der Leiter
            // gebirge DERSELBEN Probe über denselben Faden (window.__geoStich); was ihr Deckel nicht trug, zieht diese Leiter bis A.bis nach
            const c0 = await H.seite("const c = window.__geoStich; return c && c.N === " + A.punkte + " ? c.je : null;");
            const je = c0 || {};
            const ausCache = Object.keys(je).length;
            const P0 = fib(A.punkte);
            for (let i = 0; i < A.saaten && M.uhr() < A.bis; i += A.block) {
                const S = [];
                for (let j = i; j < Math.min(A.saaten, i + A.block); j++) if (!je[saat(j)]) S.push(saat(j));
                if (!S.length) continue;
                const a = await H.seite(
                    "await r._fadenQuelle(); const N = " + A.punkte + ", S = " + JSON.stringify(S) + ", aus = {}; " +
                        "for (const s of S) { const P = []; for (let i = 0; i < N; i++) P.push([Math.asin(1 - (2 * (i + 0.5)) / N) * 180 / Math.PI, ((i * 137.50776405) % 360) - 180]); " +
                        "const a = await Promise.all(P.map((p) => r._planetAuftrag({ type: \"planet-ort\", samen: s, breite: p[0], laenge: p[1], zeitMa: 0 }))); " +
                        "aus[s] = { v: a[0].version, h: a.map((x) => Math.round(x.hoeheM)), k: a.map((x) => Math.round(x.kuesteKm)), ks: a.map((x) => Math.round(x.delta.wildnis.ks * 1000) / 1000), " +
                        "ho: a.map((x) => Math.round(x.delta.wildnis.hoehe * 1000) / 1000), rl: a.map((x) => Math.round(x.delta.wildnis.rauhLambda)), loch: a.filter((x) => !Number.isFinite(x.hoeheM) || !Number.isFinite(x.kuesteKm)).length }; } " +
                        "const c = window.__geoStich || (window.__geoStich = { N, je: {} }); if (c.N === N) Object.assign(c.je, aus); c.t = Date.now(); return aus;"
                );
                for (const s of S) if (a && a[s]) je[s] = a[s];
            }
            const reihe = [];
            let antworten = 0;
            for (let i = 0; i < A.saaten; i++)
                if (je[saat(i)]) {
                    reihe.push(saat(i));
                    antworten += je[saat(i)].h.length;
                }
            const version = reihe.length ? je[reihe[0]].v : null;
            // die Hypsometrie je Saat: zwei Gipfel (Land −0,5 … 1 km, Ozean −5,5 … −3,5 km, Fächer 0,5 km, Tal < ⅓ des kleineren Gipfels —
            // die Definition von scripts/diag-planet.cjs hypsBimodal) und der KS-Abstand zur Erd-Hypsometrie an 13 Stufen
            const bimodal = (hs) => {
                const lo = -11, n = 30, f = new Array(n).fill(0);
                for (const h of hs) {
                    const i = Math.floor((h - lo) / 0.5);
                    if (i >= 0 && i < n) f[i]++;
                }
                const mitte = (i) => lo + 0.5 * i + 0.25;
                let Lg = -1, Og = -1;
                for (let i = 0; i < n; i++) {
                    const m = mitte(i);
                    if (m >= -0.5 && m <= 1.0 && (Lg < 0 || f[i] > f[Lg])) Lg = i;
                    if (m >= -5.5 && m <= -3.5 && (Og < 0 || f[i] > f[Og])) Og = i;
                }
                const lokal = (i) => (i === 0 || f[i] >= f[i - 1]) && (i === n - 1 || f[i] >= f[i + 1]);
                let tal = Infinity;
                for (let i = Og + 1; i < Lg; i++) tal = Math.min(tal, f[i]);
                const abstand = mitte(Lg) - mitte(Og);
                return { ok: lokal(Lg) && lokal(Og) && tal < Math.min(f[Lg], f[Og]) / 3 && abstand >= 3 && abstand <= 6, abstand };
            };
            const KANTEN = [-7, -6, -5, -4, -3, -2, -1, 0, 1, 2, 3, 4, 5];
            const ERDE = [0.1, 1.3, 17.7, 40.9, 54.8, 59.2, 62.2, 70.7, 91.5, 96.0, 98.2, 99.3, 99.7].map((x) => x / 99.8);
            const ksVon = (hs) => Math.max(...KANTEN.map((e, i) => Math.abs(hs.filter((h) => h < e).length / hs.length - ERDE[i])));
            const bi = [], ab = [], ksL = [], loecher = [];
            let gipfel = 0, gipfelKonv = 0, gipfelOro = 0, alleH = [];
            for (const s of reihe) {
                const x = je[s];
                const hs = x.h.filter(Number.isFinite).map((h) => h / 1000);
                const b = bimodal(hs);
                bi.push(b.ok ? 1 : 0);
                ab.push(b.abstand);
                ksL.push(ksVon(hs));
                loecher.push(x.loch);
                // der Regler fern jedes Rands und Orogens ist der häufigste Wert der Saat (ks: Konvergenz 0; hoehe: Orogen 0) — die
                // Differenz zum Anker fällt so heraus: Konvergenz = (ks − Modus)/12, Orogen-Stärke = hoehe − Modus
                const mk = modus(x.ks), mh = modus(x.ho);
                x.h.forEach((h, i) => {
                    if (!(h > 2000)) return;
                    gipfel++;
                    if ((x.ks[i] - mk) / 12 >= 0.1) gipfelKonv++;
                    if ((x.ks[i] - mk) / 12 >= 0.1 || x.ho[i] - mh >= 0.3) gipfelOro++;
                });
                alleH = alleH.concat(x.h.slice(0, 20));
            }
            const nS = reihe.length;
            const streuungM = sd(alleH.filter(Number.isFinite));
            aus[2] = {
                werte: { saaten: nS, bimodalProzent: r3(nS ? (100 * bi.reduce((a, b) => a + b, 0)) / nS : NaN), abstandKm: r3(med(ab)) },
                zeuge: { saaten: nS, antworten, streuungM: r3(streuungM), version, punkteJeSaat: A.punkte, bis: r3(M.uhr()) },
            };
            aus[4] = {
                werte: { saaten: nS, ksP80: r3(quant(ksL, 0.8)), gipfelKonvProzent: r3(gipfel ? (100 * gipfelOro) / gipfel : NaN) },
                zeuge: { saaten: nS, antworten, gipfel, streuungM: r3(streuungM), ksMedian: r3(med(ksL)), gipfelAktivProzent: r3(gipfel ? (100 * gipfelKonv) / gipfel : NaN), ausCache, version },
                nicht: "das Rücken-Netz: der Faden trägt keine Rand-Art je Lage (die Antwort trägt " + (reihe.length ? "h, kueste, delta" : "nichts") + ", nie rand/platte — voxel-worker.js:1175 planetOrtAuftrag)",
            };
            // ── B (S1): die Gebirgsfläche > 2 km als Komponenten, verfolgt über den Faden — von jedem Stichpunkt > 2 km (der höchste zuerst)
            // wächst eine Flut auf einem Gitter der Kante B.kante (gnomonisch um den Startpunkt: Großkreise sind Geraden) durch jede
            // Zelle > 2 km, bis die Komponente geschlossen ist (kein Fenster, das einen Gürtel abschneidet); ihre Achsen aus den Momenten
            // (+ Kante²/12), Komponenten < B.minZellen fallen wie in der Linse (diag-planet: < 5·10⁴ km²) aus der Fläche
            const B = U[1];
            const rad = Math.PI / 180;
            const rahmen = (p) => {
                const b = p[0] * rad, l = p[1] * rad;
                return { c: [Math.cos(b) * Math.cos(l), Math.sin(b), Math.cos(b) * Math.sin(l)], e: [-Math.sin(l), 0, Math.cos(l)], n: [-Math.sin(b) * Math.cos(l), Math.cos(b), -Math.sin(b) * Math.sin(l)] };
            };
            const lage = (F, i, j) => {
                const x = (i * B.kante) / R, y = (j * B.kante) / R;
                const v = [F.c[0] + x * F.e[0] + y * F.n[0], F.c[1] + x * F.e[1] + y * F.n[1], F.c[2] + x * F.e[2] + y * F.n[2]];
                const l = Math.hypot(v[0], v[1], v[2]);
                return [Math.asin(v[1] / l) / rad, Math.atan2(v[2], v[0]) / rad];
            };
            const nachbarn = (K, i, j) => {
                for (const [di, dj] of [[1, 0], [-1, 0], [0, 1], [0, -1]]) {
                    const q = i + di + "," + (j + dj);
                    if (K.zell.has(q)) continue;
                    if (Math.abs(i + di) > B.rand || Math.abs(j + dj) > B.rand || K.gefragt + K.offen.length >= B.deckel) {
                        K.voll = true;
                        continue;
                    }
                    K.zell.set(q, 1);
                    K.offen.push([i + di, j + dj]);
                }
            };
            const formen = [];
            let bAntw = 0, klein = 0, gedeckelt = 0, abgebrochen = 0;
            const zust = reihe.slice(0, B.saaten).map((s) => {
                const x = je[s];
                const starts = x.h.map((h, i) => [h, i]).filter((q) => q[0] > 2000).sort((p, q) => q[0] - p[0]).map((q) => P0[q[1]]);
                return { s, starts, berg: [], gefragt: 0, komp: null };
            });
            const naechste = (Z) => {
                while (Z.starts.length && Z.gefragt < B.jeSaat) {
                    const p = Z.starts.shift();
                    if (Z.berg.some((q) => km(p, q) < 0.8 * B.kante)) continue;
                    const K = { F: rahmen(p), zell: new Map([["0,0", 1]]), offen: [], berg: [[0, 0, p]], gefragt: 0, voll: false };
                    nachbarn(K, 0, 0);
                    return K;
                }
                return null;
            };
            const schliessen = (Z, K) => {
                for (const b of K.berg) Z.berg.push(b[2]);
                if (K.berg.length < B.minZellen) {
                    klein++;
                    return;
                }
                const xs = K.berg.map((q) => q[0] * B.kante), ys = K.berg.map((q) => q[1] * B.kante), n = K.berg.length;
                const mx = xs.reduce((u, v) => u + v, 0) / n, my = ys.reduce((u, v) => u + v, 0) / n;
                let sxx = (B.kante * B.kante) / 12, syy = sxx, sxy = 0;
                for (let q = 0; q < n; q++) {
                    sxx += ((xs[q] - mx) * (xs[q] - mx)) / n;
                    syy += ((ys[q] - my) * (ys[q] - my)) / n;
                    sxy += ((xs[q] - mx) * (ys[q] - my)) / n;
                }
                const t = (sxx + syy) / 2, d = Math.sqrt(((sxx - syy) / 2) * ((sxx - syy) / 2) + sxy * sxy);
                if (K.voll) gedeckelt++;
                formen.push({ s: Z.s, n, achse: Math.sqrt((t + d) / Math.max(1e-9, t - d)), laengeKm: Math.sqrt(12 * (t + d)) });
            };
            for (const Z of zust) Z.komp = naechste(Z);
            while (M.uhr() < B.bis) {
                const L = [], wer = [];
                for (const Z of zust) {
                    const K = Z.komp;
                    if (!K) continue;
                    for (const [i, j] of K.offen.splice(0)) {
                        const p = lage(K.F, i, j);
                        L.push([Z.s, p[0], p[1]]);
                        wer.push([Z, K, i, j, p]);
                    }
                }
                if (!L.length) break;
                const a = await frage(L, 0);
                bAntw += a.length;
                a.forEach((y, q) => {
                    const [Z, K, i, j, p] = wer[q];
                    K.gefragt++;
                    Z.gefragt++;
                    if (y[0] > 2000) {
                        K.berg.push([i, j, p]);
                        nachbarn(K, i, j);
                    }
                });
                for (const Z of zust)
                    if (Z.komp && !Z.komp.offen.length) {
                        schliessen(Z, Z.komp);
                        Z.komp = naechste(Z);
                    }
            }
            for (const Z of zust) if (Z.komp) abgebrochen++;
            const flaeche = formen.reduce((u, f) => u + f.n, 0);
            const gewichtet = [];
            for (const f of formen) for (let q = 0; q < f.n; q++) gewichtet.push(f.achse);
            gewichtet.sort((x, y) => x - y);
            const jeSaat = zust.map((Z) => {
                const F = formen.filter((f) => f.s === Z.s), g = F.reduce((u, f) => u + f.n, 0);
                return g ? F.filter((f) => f.achse >= 4).reduce((u, f) => u + f.n, 0) / g : NaN;
            });
            const bSaaten = zust.filter((Z) => !Z.komp).length;
            const auge1 = { pose: { px: 0, py: 1800, pz: 2600, lx: 0, ly: 0, lz: -2600 } };
            aus[1] = {
                werte: { saaten: bSaaten, guertelProzent: r3(flaeche ? (100 * formen.filter((f) => f.achse >= 4).reduce((u, f) => u + f.n, 0)) / flaeche : NaN), achseP30: r3(quant(gewichtet, 0.3)) },
                zeuge: {
                    saaten: bSaaten,
                    antworten: bAntw,
                    bergZellen: flaeche,
                    komponenten: formen.length,
                    klein,
                    gedeckelt,
                    abgebrochen,
                    kanteKm: B.kante,
                    jeSaatMedianProzent: r3(100 * med(jeSaat)),
                    laengsteKm: r3(formen.reduce((u, f) => Math.max(u, f.laengeKm), 0)),
                    achseMedian: r3(quant(gewichtet, 0.5)),
                },
            };
            // ── C (S5): die Küste zur Zeit −1 Ma an den Küsten-Lagen der Stichprobe: |Δ Küstenabstand| je Ma = der Versatz der Küste (km/Ma = mm/a)
            const C = U[5];
            const raten = [];
            let cAntw = 0, cPunkte = 0;
            for (let i = 0; i < reihe.length && M.uhr() < C.bis; i += C.block) {
                const S = reihe.slice(i, i + C.block);
                const L = [], wer = [];
                for (const s of S) {
                    const x = je[s];
                    const idx = [];
                    x.k.forEach((k, j) => {
                        if (Math.abs(k) >= C.vonKm && Math.abs(k) <= C.bisKm) idx.push(j);
                    });
                    const nimm = idx.filter((_, j) => j % Math.max(1, Math.floor(idx.length / C.jeSaat)) === 0).slice(0, C.jeSaat);
                    for (const j of nimm) {
                        L.push([s, P0[j][0], P0[j][1]]);
                        wer.push([s, x.k[j]]);
                    }
                }
                if (!L.length) continue;
                const a = await frage(L, -C.dtMa);
                cAntw += a.length;
                for (const s of S) {
                    const d = [];
                    a.forEach((y, j) => {
                        if (wer[j][0] === s && Number.isFinite(y[1])) d.push(Math.abs(y[1] - wer[j][1]) / C.dtMa / 10);
                    });
                    cPunkte += d.length;
                    if (d.length >= 3) raten.push(med(d));
                }
            }
            aus[5] = {
                werte: { saaten: raten.length, plattenMinCmA: r3(raten.length ? Math.min(...raten) : NaN), plattenMaxCmA: r3(raten.length ? Math.max(...raten) : NaN), plattenMedianCmA: r3(med(raten)) },
                zeuge: { saaten: raten.length, antworten: cAntw, punkte: cPunkte, streuungCmA: r3(sd(raten)), dtMa: C.dtMa, mass: "Versatz der Küste je Ma am Faden (der Faden trägt keine Plattenrate)" },
            };
            // ── D (S6): je Saat die Land-Lagen (Fibonacci, gleiche Fläche) zu D.zeiten im letzten Ga. Zwei benachbarte Land-Lagen hängen
            // zusammen, wenn ihre Land-Scheiben (Radius = der Küstenabstand, den der Faden nennt) sich decken — sonst geht die Probe den
            // Großkreis von u nach v: je Schritt fragt sie die Lage D.schrittKm hinter dem schon gedeckten Stück; Meer trennt, Land deckt
            // bis zu seiner eigenen Scheibe weiter (Auflösung D.schrittKm, höchstens D.schritte Fragen, sonst getrennt). Der größte Teil
            // gegen das ganze Land; ein Superkontinent ist eine Phase mit ≥ 70 %
            const D = U[6];
            const P6 = fib(D.punkte);
            const abstand6 = Math.sqrt((4 * Math.PI * R * R) / D.punkte);
            const paare6 = [];
            for (let u = 0; u < P6.length; u++)
                for (let v = u + 1; v < P6.length; v++) {
                    const d = km(P6[u], P6[v]);
                    if (d < D.nachbar * abstand6) paare6.push([u, v, d]);
                }
            const auf = (p, q, d, sKm) => {
                const a = vek(p), b = vek(q), w = d / R, t = sKm / R, sw = Math.sin(w) || 1e-9;
                const f = Math.sin(w - t) / sw, g = Math.sin(t) / sw;
                const v = [f * a[0] + g * b[0], f * a[1] + g * b[1], f * a[2] + g * b[2]];
                const l = Math.hypot(v[0], v[1], v[2]);
                return [Math.asin(v[1] / l) / rad, Math.atan2(v[2], v[0]) / rad];
            };
            const superS = [], anteile = [], zahlen = [];
            let dAntw = 0, gegangen = 0, offenGeblieben = 0, zeitenGemessen = 0;
            for (let i = 0; i < reihe.length && M.uhr() < D.bis; i++) {
                const s = reihe[i];
                let maxA = 0, runs = 0, vorher = false, voll = true;
                for (const t of D.zeiten) {
                    if (M.uhr() >= D.bis) {
                        voll = false;
                        break;
                    }
                    const a = await frage(P6.map((p) => [s, p[0], p[1]]), t);
                    dAntw += a.length;
                    const rad6 = a.map((y) => (y[0] > 0 ? Math.max(0, y[1]) : -1));
                    const par = P6.map((_, j) => j);
                    const wurzel = (j) => (par[j] === j ? j : (par[j] = wurzel(par[j])));
                    const eins = (u, v) => {
                        par[wurzel(u)] = wurzel(v);
                    };
                    let gang = [];
                    for (const [u, v, d] of paare6) {
                        if (rad6[u] < 0 || rad6[v] < 0) continue;
                        if (d < rad6[u] + rad6[v]) eins(u, v);
                        else gang.push({ u, v, d, s: rad6[u] });
                    }
                    for (let r = 0; r < D.schritte && gang.length; r++) {
                        gang = gang.filter((w) => wurzel(w.u) !== wurzel(w.v));
                        if (!gang.length) break;
                        const q = gang.map((w) => Math.min(w.d, w.s + D.schrittKm));
                        const b = await frage(gang.map((w, j) => [s, ...auf(P6[w.u], P6[w.v], w.d, q[j])]), t);
                        dAntw += b.length;
                        gegangen += b.length;
                        const weiter = [];
                        gang.forEach((w, j) => {
                            const y = b[j];
                            if (!(y[0] > 0)) return;
                            const neu = q[j] + Math.max(0, y[1]);
                            if (neu >= w.d - rad6[w.v]) eins(w.u, w.v);
                            else weiter.push({ u: w.u, v: w.v, d: w.d, s: neu });
                        });
                        gang = weiter;
                    }
                    offenGeblieben += gang.filter((w) => wurzel(w.u) !== wurzel(w.v)).length;
                    const zahl = {};
                    let landN = 0;
                    for (let u = 0; u < P6.length; u++)
                        if (rad6[u] >= 0) {
                            landN++;
                            zahl[wurzel(u)] = (zahl[wurzel(u)] || 0) + 1;
                        }
                    const anteil = landN ? Math.max(...Object.values(zahl)) / landN : 0;
                    zeitenGemessen++;
                    maxA = Math.max(maxA, anteil);
                    const ist = anteil >= 0.7;
                    if (ist && !vorher) runs++;
                    vorher = ist;
                }
                if (!voll) break;
                superS.push(runs >= 1 ? 1 : 0);
                anteile.push(100 * maxA);
                zahlen.push(runs);
            }
            aus[6] = {
                werte: { saaten: superS.length, superProzent: r3(superS.length ? (100 * superS.reduce((a, b) => a + b, 0)) / superS.length : NaN), anteilP20: r3(quant(anteile, 0.2)), superJeGaP20: r3(quant(zahlen, 0.2)) },
                zeuge: { saaten: superS.length, antworten: dAntw, zeiten: D.zeiten.length, zeitenGemessen, punkte: D.punkte, gegangen, offenGeblieben, anteilMedian: r3(med(anteile)), streuungProzent: r3(sd(anteile)) },
            };
            // ── E: was der Faden trägt — der Körper (ein Mond-Argument), die älteste Zeit, der Erd-Schlüssel (S3, S7, S8, S9)
            const e = await H.seite(
                "await r._fadenQuelle(); const a = await r._planetAuftrag({ type: \"planet-ort\", samen: \"erde-01\", breite: 10, laenge: 20, zeitMa: 0 }); " +
                    "const b = await r._planetAuftrag({ type: \"planet-ort\", samen: \"erde-01\", breite: 10, laenge: 20, zeitMa: 0, koerper: \"mond\", radiusKm: 1737.4, masseErden: 0.0123 }); " +
                    "const c = await r._planetAuftrag({ type: \"planet-ort\", samen: \"erde-01\", breite: 10, laenge: 20, zeitMa: -3990 }); " +
                    "const G = r._gelaende && r._gelaende(); return { dh: b.hoeheM - a.hoeheM, h: a.hoeheM, hAlt: c.hoeheM, schluessel: !!(G && G.ort && G.ort.teil && G.ort.teil.erdSchluessel), schl: Object.keys(a).sort().join(\",\"), delta: Object.keys(a.delta).sort().join(\",\") };"
            );
            const koerper = Math.abs(e.dh) > 0;
            const bild = await auge("geologie-platten", auge1.pose, U[1].augeBis);
            aus[1].auge = bild;
            aus[3] = {
                werte: {},
                zeuge: { antworten: 2, dhMond: r3(e.dh), schluessel: e.schl },
                auge: bild,
                ...(koerper ? {} : { nicht: "kein Körper von Mondgröße: der Faden liest keinen Körper — ein Mond-Argument (R 1 737,4 km) ändert die Höhe um " + r3(e.dh) + " m (jeder Samen rechnet auf PLANET_ERDE, voxel-worker.js:1159); keine Orbit-Pose" }),
            };
            aus[7] = {
                werte: {},
                zeuge: { antworten: 1, schluessel: e.schluessel },
                auge: bild,
                ...(e.schluessel ? {} : { nicht: "keine Erd-Saat mit Schlüssel (R4): planetPlan liest nur den Samen (planet-core.js:307), die Welt trägt keinen erdSchluessel" }),
            };
            aus[8] = {
                werte: {},
                zeuge: { antworten: 1, hAltM: r3(e.hAlt) },
                auge: bild,
                nicht: "der Faden rechnet die Zeit in [−4 000; +1 000] Ma unter EINEM Regime (planet-core.js:328 K10: Regime ≠ „platten“ bricht) — kein Magma-Ozean bei −4 500 Ma, kein Deckel → Platten; die älteste Antwort (−3 990 Ma) trägt " + r3(e.hAlt) + " m",
            };
            aus[9] = {
                werte: { nahtLochSaaten: loecher.filter((x) => x > 0).length },
                zeuge: { antworten: antworten + 2, saaten: nS, dhMond: r3(e.dh) },
                auge: bild,
                ...(koerper ? {} : { nicht: "keine Saat von 0,01 bis 10 Erdmassen: der Faden liest keinen Körper (ein Mond-Argument ändert die Höhe um " + r3(e.dh) + " m; voxel-worker.js:1159 PLANET_ERDE)" }),
            };
            return { sprossen: aus };
        },
        sprossen: {
            1: {
                u: { saaten: 30, kante: 80, rand: 50, deckel: 350, jeSaat: 450, minZellen: 8, bis: 24, augeBis: 58 },
                soll: [
                    K.soll(PL, 1, "30 Saaten", { key: "saaten", rel: "≥" }),
                    K.soll(PL, 1, "Gebirgsfläche > 2 km liegt in Gürteln mit Achsen ≥ 4:1", { key: "achseP30" }),
                    K.soll(PL, 1, "in ≥ 70 %", { key: "guertelProzent", einheit: "%" }),
                ],
                zeuge: zMin({ antworten: 3000, bergZellen: 30, komponenten: 5 }),
                auge: { pose: "Überflug 1 800 m über dem Spawn, Blick nach Norden (die Schummerung der Region)", vorbild: "Schummerung einer realen Gebirgsregion 10⁴ km² (Copernicus DEM), Blindpaar R11" },
                taeter: "planet-core.js planetPunktR (Orogen-Schablone der Ränder) über den Faden voxel-worker.js planetOrtAuftrag",
                unklar: "„in ≥ 70 %“ gelesen wie die Linse diag-planet (guertel.lang): der Anteil der Gebirgsfläche > 2 km, der in Komponenten mit Achsen ≥ 4:1 liegt (Gitter 80 km, Komponenten ≥ 8 Zellen), über die Saaten gepoolt; eine Hochfläche über 350 Zellen (≈ 2,2 Mio km²) geht mit ihrer verfolgten Teilform ein (Zeuge gedeckelt)",
                gruen: gut({ saaten: 30, achseP30: 4.6, guertelProzent: 78 }, { antworten: 5070, bergZellen: 900, komponenten: 60 }),
                attrappen: [
                    { name: "der Gürtel-Anteil als Zahl ohne Fenster des Fadens", roh: leer({ saaten: 30, achseP30: 4.6, guertelProzent: 78 }) },
                    { name: "ein einziger Gipfel statt einer Fläche", roh: gut({ saaten: 30, achseP30: 4.6, guertelProzent: 78 }, { antworten: 5070, bergZellen: 1, komponenten: 1 }) },
                ],
            },
            2: {
                u: { saaten: 100, punkte: 240, block: 4, bis: 8 },
                soll: [
                    K.soll(PL, 2, "100 Saaten", { key: "saaten", rel: "≥" }),
                    K.soll(PL, 2, "zwei Gipfeln im Abstand 3–6 km", { key: "abstandKm", einheit: "km" }),
                    K.soll(PL, 2, "in ≥ 90 %", { key: "bimodalProzent", einheit: "%" }),
                ],
                zeuge: (roh) => {
                    const z = (roh && roh.zeuge) || {};
                    const f = zMin({ antworten: 10000, streuungM: 1 })(roh);
                    if (f) return f;
                    return z.version ? null : "keine Fassung des Planet-Kerns in der Antwort";
                },
                taeter: "planet-core.js planetPunktR (Krusten-Profil, GDH1-Tiefe) über den Faden voxel-worker.js planetOrtAuftrag",
                gruen: gut({ saaten: 100, abstandKm: 4.5, bimodalProzent: 94 }, { antworten: 24000, streuungM: 2600, version: "planet-h2-4" }),
                attrappen: [
                    { name: "94 % aus der Tafel der Linse (diag-planet), kein Faden", roh: leer({ saaten: 100, abstandKm: 4.5, bimodalProzent: 94 }) },
                    { name: "eine konstante Höhe je Lage", roh: gut({ saaten: 100, abstandKm: 4.5, bimodalProzent: 94 }, { antworten: 24000, streuungM: 0, version: "planet-h2-4" }) },
                ],
            },
            3: {
                u: {},
                soll: [
                    K.soll(PL, 3, "= acos(R/(R+h)) ±0,1° bei 1, 10, 100 km", { key: "senkung1kmGrad", ref: senkung(1), refQuelle: "Mond: R = 1 737,4 km (IAU), acos(R/(R+h)) bei h = 1 km", einheit: "°" }),
                    K.soll(PL, 3, "= acos(R/(R+h)) ±0,1° bei 1, 10, 100 km", { key: "senkung10kmGrad", ref: senkung(10), refQuelle: "Mond: R = 1 737,4 km (IAU), acos(R/(R+h)) bei h = 10 km", einheit: "°" }),
                    K.soll(PL, 3, "= acos(R/(R+h)) ±0,1° bei 1, 10, 100 km", { key: "senkung100kmGrad", ref: senkung(100), refQuelle: "Mond: R = 1 737,4 km (IAU), acos(R/(R+h)) bei h = 100 km", einheit: "°" }),
                ],
                zeuge: zMin({ antworten: 2 }),
                auge: { pose: "Orbit 100 km über der Kugel (heute nicht erzeugbar; geschossen im Überflug 1 800 m über dem Spawn)", vorbild: "Relief-Globus des Monds (LRO LOLA), Blindpaar R11" },
                taeter: "voxel-worker.js planetPlanVon (PLANET_ERDE für jeden Samen)",
                nicht: "kein Körper von Mondgröße, keine Orbit-Pose",
                leser: "voxel-worker.js:1159 PLANET_ERDE — planetPlanVon(samen) rechnet jeden Samen auf PLANET_ERDE, die Nachricht planet-ort trägt keinen Körper; scripts/werkbank.cjs /bild kennt keine Orbit-Pose",
                gruen: gut({ senkung1kmGrad: 1.94, senkung10kmGrad: 6.13, senkung100kmGrad: 18.99 }, { antworten: 3 }),
                attrappen: [{ name: "die Senkung aus der Formel, kein Bild", roh: leer({ senkung1kmGrad: 1.94, senkung10kmGrad: 6.13, senkung100kmGrad: 18.99 }) }],
            },
            4: {
                u: {},
                soll: [
                    K.soll(PL, 4, "100 erdähnliche Saaten", { key: "saaten", rel: "≥" }),
                    K.soll(PL, 4, "KS ≤ 0,1 gegen Erd-Hypsometrie", { key: "ksP80" }),
                    K.soll(PL, 4, "geschlossenes Rücken-Netz in ≥ 80 %", { key: "rueckenProzent", einheit: "%" }),
                    K.soll(PL, 4, "Gipfel > 2 km an Konvergenz ≥ 90 %", { key: "gipfelKonvProzent", einheit: "%" }),
                ],
                zeuge: zMin({ antworten: 10000, gipfel: 100, streuungM: 1 }),
                taeter: "planet-core.js planetPunktR (Rand-Schablone, Orogen) über den Faden voxel-worker.js planetOrtAuftrag",
                nicht: "kein Rücken-Netz am Faden",
                leser: "voxel-worker.js:1175 planetOrtAuftrag — gibt rand (Art, Abstand, Rate) und platte von planetOrt nicht weiter: kein Leser des Rücken-Netzes",
                unklar: "„KS ≤ 0,1 … in ≥ 80 %“ gelesen als p80 der KS-Abstände über die Saaten ≤ 0,1 (gegen die Kossinna-Hypsometrie an 13 Stufen " + T_ZAHL + "); „an Konvergenz“ wie die Linse diag-planet (hoch25Rand): am konvergenten Rand (Regler ks: Konvergenz ≥ 0,1) oder auf einem Orogen, lebend oder Naht (Regler hoehe: Orogen-Stärke ≥ 0,3); nur der lebende Rand steht als gipfelAktivProzent im Zeugen",
                gruen: gut({ saaten: 100, ksP80: 0.08, rueckenProzent: 85, gipfelKonvProzent: 92 }, { antworten: 24000, gipfel: 600, streuungM: 2600 }),
                attrappen: [{ name: "die Hypsometrie der Erde abgeschrieben, kein Faden", roh: leer({ saaten: 100, ksP80: 0.08, rueckenProzent: 85, gipfelKonvProzent: 92 }) }],
            },
            5: {
                u: { block: 10, jeSaat: 12, vonKm: 30, bisKm: 800, dtMa: 1, bis: 28 },
                soll: [
                    K.soll(PL, 5, "an 100 Saaten", { key: "saaten", rel: "≥" }),
                    K.soll(PL, 5, "Plattengeschwindigkeit 1–15 cm/a", { key: "plattenMinCmA", einheit: "cm/a" }),
                    K.soll(PL, 5, "Plattengeschwindigkeit 1–15 cm/a", { key: "plattenMaxCmA", einheit: "cm/a" }),
                ],
                zeuge: zMin({ antworten: 300, punkte: 300, streuungCmA: 0.001 }),
                taeter: "planet-core.js planetScheibe (Euler-Pole, Tempo-Kurve K5) über den Faden voxel-worker.js planetOrtAuftrag",
                unklar: "der Faden trägt keine Plattenrate (rand.rateCmA fällt in voxel-worker.js:1175): die Station misst sie als Versatz der Küste je Ma (|Δ Küstenabstand| an 12 Küsten-Lagen je Saat, Median) — die Normal-Komponente der Drift; die Bilddifferenz benachbarter Zeiten misst nur das Gerät",
                gruen: gut({ saaten: 100, plattenMinCmA: 1.2, plattenMaxCmA: 9.5 }, { antworten: 1200, punkte: 1200, streuungCmA: 1.4 }),
                attrappen: [
                    { name: "die Drift-Zahl der Linse (diag-planet drift.cm_a), kein Faden", roh: leer({ saaten: 100, plattenMinCmA: 1.2, plattenMaxCmA: 9.5 }) },
                    { name: "eine stehende Welt (jede Saat dieselbe Rate)", roh: gut({ saaten: 100, plattenMinCmA: 3, plattenMaxCmA: 3 }, { antworten: 1200, punkte: 1200, streuungCmA: 0 }) },
                ],
            },
            6: {
                u: { punkte: 120, nachbar: 1.6, schrittKm: 100, schritte: 8, zeiten: [0, -167, -333, -500, -667, -833], bis: 54 },
                soll: [
                    K.soll(PL, 6, "100 Saaten", { key: "saaten", rel: "≥" }),
                    K.soll(PL, 6, "≥ 1 Superkontinent", { key: "superJeGaP20" }),
                    K.soll(PL, 6, "(≥ 70 % des Landes zusammenhängend)", { key: "anteilP20", einheit: "%" }),
                    K.soll(PL, 6, "je Ga in ≥ 80 %", { key: "superProzent", einheit: "%" }),
                ],
                zeuge: zMin({ antworten: 600, zeiten: 6, streuungProzent: 0.001 }),
                taeter: "planet-core.js planetPlan (Schlüsselbilder verstreut · versammelt · gelöst) über den Faden voxel-worker.js planetOrtAuftrag",
                leser: "voxel-worker.js:367 msg.type — der Faden kennt nur planet-anker und planet-ort: keine Land-Maske einer Zeit (planetKarte, planet-core.js:1819) — die Probe fragt 120 Lagen × 6 Zeiten je Saat und geht die Lücken über den Faden ab (~1,1 ms je Lage): der Deckel von 60 s trägt keine 100 Saaten",
                gruen: gut({ saaten: 100, superJeGaP20: 1, anteilP20: 74, superProzent: 86 }, { antworten: 120000, zeiten: 6, streuungProzent: 9 }),
                attrappen: [{ name: "der Zyklus aus dem Plan behauptet (diag-planet superkontinent), kein Faden", roh: leer({ saaten: 100, superJeGaP20: 1, anteilP20: 74, superProzent: 86 }) }],
            },
            7: {
                u: {},
                soll: [K.soll(PL, 7, "Flächen-Deckung IoU ≥ 0,6", { key: "iou" }), K.soll(PL, 7, "in ≥ 8 von 10", { key: "panelVon10" })],
                zeuge: zMin({ antworten: 10 }, ["schluessel"]),
                auge: { pose: "Orbit über der Erd-Saat an 10 Stichzeiten (heute nicht erzeugbar; geschossen im Überflug 1 800 m über dem Spawn)", vorbild: "PALEOMAP-Paläokarten (Scotese) zu Rodinia, Pannotia, Pangäa und heute, Fach-Panel R11" },
                taeter: "planet-core.js planetPlan (kein Erd-Schlüssel, R4)",
                nicht: "keine Erd-Saat mit Schlüssel (R4)",
                leser: "planet-core.js:307 planetPlan(samen, koerperIn) liest keinen Erd-Schlüssel (R4)",
                gruen: gut({ iou: 0.66, panelVon10: 9 }, { antworten: 10, schluessel: true }),
                attrappen: [{ name: "die PALEOMAP-Lage abgeschrieben, kein Schlüssel", roh: leer({ iou: 0.66, panelVon10: 9 }) }],
            },
            8: {
                u: {},
                soll: [K.soll(PL, 8, "Rang ≥ 0,7", { key: "rang" }), K.soll(PL, 8, "≥ 50 % der Saatenpaare", { key: "paarProzent", einheit: "%" })],
                zeuge: zMin({ antworten: 1000 }),
                auge: { pose: "Orbitbild je Saat (heute nicht erzeugbar; geschossen im Überflug 1 800 m über dem Spawn)", vorbild: "Ursachen-Probe R10: ein eingefrorener Leser sagt Wärmefluss und Alter aus dem Orbitbild voraus" },
                taeter: "planet-core.js planetPlan (EIN Regime „platten“, Zeit ab −4 000 Ma)",
                nicht: "kein Magma-Ozean, kein Regime-Wechsel",
                leser: "planet-core.js:328 koerper.regime — K10: Regime ≠ „platten“ bricht, planet-core.js:678 zeitMa vor dem ersten Schlüsselbild (−4 000 Ma) bricht; kein Leser eines Deckel-Regimes oder des Hadaikums",
                gruen: gut({ rang: 0.74, paarProzent: 58 }, { antworten: 1000 }),
                attrappen: [{ name: "der Rang ohne 1 000 Saaten", roh: leer({ rang: 0.74, paarProzent: 58 }) }],
            },
            9: {
                u: {},
                soll: [K.soll(PL, 9, "Rang ≥ 0,7", { key: "rang" }), K.soll(PL, 9, "0 Saaten mit Naht oder Loch", { key: "nahtLochSaaten" })],
                zeuge: zMin({ antworten: 1000, saaten: 1000 }),
                auge: { pose: "Orbitbild je Saat (heute nicht erzeugbar; geschossen im Überflug 1 800 m über dem Spawn)", vorbild: "Ursachen-Probe R10 über Erd-, Deckel-, Venus-, Io- und Eiswelten" },
                taeter: "voxel-worker.js planetPlanVon (PLANET_ERDE für jeden Samen)",
                nicht: "kein Körper außer der Erde",
                leser: "voxel-worker.js:1159 PLANET_ERDE — planetPlanVon(samen) rechnet jeden Samen auf PLANET_ERDE: keine Masse, keine Wärme, kein Wasser je Saat",
                gruen: gut({ rang: 0.75, nahtLochSaaten: 0 }, { antworten: 100000, saaten: 1000 }),
                attrappen: [{ name: "0 Löcher behauptet, keine Saat gefragt", roh: leer({ rang: 0.75, nahtLochSaaten: 0 }) }],
            },
        },
    };

    // ════════════════════════════════════════ VULKAN ════════════════════════════════════════
    const vulkan = {
        sek: 14,
        faecher: true,
        pfad: PFAD_ORT,
        ungefahren: "das Glutbild und die Blindpaare (Glut, Clip, Oberfläche, Ursachen-Probe) schießt die Probe nur am Gerät",
        mess: async function (H, U, M) {
            const r3 = (x) => (Number.isFinite(x) ? Math.round(x * 1000) / 1000 : null);
            // S1 ÜBER DEN FÄCHER (stationen/faecher.js): die Zeit ist die Adresse — je Alter der Tat (log, U[1].jeDekade Stufen je
            // Dekade, 1 s bis 10^8 s) × Wasser (0 an der Luft, 1 im Meer) EIN Ruf des Zustands, den das Feld liest
            // (stamm/feld-leben.js:2532 `_lavaZustand` → gelaende-core.js:1835 `lava`, Leser des Felds stamm/feld-leben.js `_lavaGiessen`);
            // die Kruste ist das erste Alter, an dem die Decke erstarrt — die Auflösung ist die Stufe (10^(1/jeDekade))
            const LAVA_AN = async (r, T, a, mit) => {
                const sy = r._voxelSurfaceY(0, 0), s = Math.pow(10, a.zeit / mit.jeDekade), stundeS = r.constructor.WELT_GESETZ_ERDE.kalender.stundeS;
                const z = r._lavaZustand({ h: r._weltStunde() - s / stundeS, y: sy, wasser: a.ort });
                return { s: z.alterS, wasser: a.ort, temperatur: z.temperatur, glut: z.glut, erstarrt: !!z.erstarrt, dampf: z.dampf, tau: z.tau };
            };
            const RF = await FAECHER((c) => H.seite(c), {
                gesetz: { fn: LAVA_AN, export: "stamm/feld-leben.js:2532 _lavaZustand (gelaende-core.js:1835 lava)", leser: "stamm/feld-leben.js:2460 _lavaGiessen (die Tat des Felds)" },
                adressen: { orte: [0, 1], zeiten: Array.from({ length: 8 * U[1].jeDekade + 1 }, (_, j) => j) },
                mit: { jeDekade: U[1].jeDekade },
                ms: U[1].ms,
                masse: {
                    tK: { wie: "min", feld: "s", nur: (a, w) => a.ort === 0 && w.erstarrt },
                    tG: { wie: "min", feld: "s", nur: (a, w) => a.ort === 0 && !(w.glut > 0) },
                    tKw: { wie: "min", feld: "s", nur: (a, w) => a.ort === 1 && w.erstarrt },
                    tMax: { wie: "max", feld: "temperatur", nur: (a) => a.ort === 0 },
                    tMin: { wie: "min", feld: "temperatur", nur: (a) => a.ort === 0 },
                    glutAnfang: { wie: "erste", feld: "glut", nur: (a) => a.ort === 0 && a.zeit === 0 },
                    glutEnde: { wie: "erste", feld: "glut", nur: (a) => a.ort === 0 && a.zeit === 8 * U[1].jeDekade },
                    dampf: { wie: "erste", feld: "dampf", nur: (a) => a.ort === 1 && a.zeit === 0 },
                    tau: { wie: "erste", feld: "tau", nur: (a) => a.ort === 0 && a.zeit === 0 },
                    t0: { wie: "erste", feld: "temperatur", nur: (a) => a.ort === 0 && a.zeit === 0 },
                },
                schlecht: { feld: "glut", richtung: "max" },
                pose: () => "Ego am Spawn, Blick auf die Decke der jüngsten Tat",
                ungemessen: ["das Glutbild gegen Lava-Fotos (2AFC, am Gerät)"],
            });
            const W1 = RF.werte;
            const v = await H.seite(
                "await r._fadenQuelle(); const o = await r._planetAuftrag({ type: \"planet-ort\", samen: r._planetSamen(), breite: 10, laenge: 20, zeitMa: 0 }); " +
                    "const namen = new Set(); for (let p = r; p && p !== Object.prototype; p = Object.getPrototypeOf(p)) for (const n of Object.getOwnPropertyNames(p)) namen.add(n); " +
                    "const N = [...namen]; return { antworten: 2, ortSchl: Object.keys(o).sort().join(\",\"), deltaSchl: Object.keys(o.delta).sort().join(\",\"), " +
                    "vulkanLeser: N.filter((n) => /vulkan|volcan|magma|ausbruch|eruption|roehre/i.test(n)), lavaLeser: N.filter((n) => /^_lava/.test(n)), fliesst: N.filter((n) => /^_lava(Strom|Fluss|Front|Fliess)/i.test(n)) };"
            );
            v.tK = W1.tK;
            v.tG = W1.tG;
            v.tKw = W1.tKw;
            v.dampf = W1.dampf;
            v.tau = W1.tau;
            v.t0 = W1.t0;
            v.antworten = RF.gemessen + v.antworten;
            const glut = [W1.glutAnfang, W1.glutEnde];
            const spanne = Number.isFinite(W1.tMax) && Number.isFinite(W1.tMin) ? W1.tMax - W1.tMin : null;
            const vulkanAmFaden = /vulkan/.test(v.ortSchl + "," + v.deltaSchl);
            const bild = await Promise.race([
                M.auge("geologie-vulkan", { px: 0, py: 95, pz: 12, lx: 0, ly: 88, lz: 0 }),
                new Promise((f) => setTimeout(() => f({ bild: null, grund: "kein Bild im Deckel der Leiter" }), Math.max(500, (U[1].augeBis - M.uhr()) * 1000))),
            ]);
            const kein = "der Planet-Faden trägt keinen Vulkan (Antwort: " + v.ortSchl + " · delta " + v.deltaSchl + "), die Welt keinen Leser eines Ausbruchs (" + (v.vulkanLeser.join(", ") || "0 Methoden") + ")";
            return {
                sprossen: {
                    1: {
                        werte: { tKrusteS: r3(v.tK), tGlutAusS: r3(v.tG) },
                        zeuge: { antworten: v.antworten, spanneK: r3(spanne), glutAnfang: glut[0], glutEnde: glut[glut.length - 1], tKrusteWasserS: r3(v.tKw), dampf: v.dampf, tauS: r3(v.tau), t0C: r3(v.t0), adressen: RF.adressen, gerissen: RF.gerissen, akte: RF.akte.slice(0, 600) },
                        auge: bild,
                    },
                    2: { werte: {}, zeuge: { antworten: v.antworten, lavaLeser: v.lavaLeser.length }, auge: bild, nicht: "die Lava fließt nicht: eine Tat deckt EINE Zelle des Felds (stamm/feld-leben.js:2460 _lavaGiessen), kein Strom, keine Front" + (v.fliesst.length ? " (" + v.fliesst.join(", ") + ")" : "") },
                    3: { werte: {}, zeuge: { antworten: 1 }, ...(vulkanAmFaden ? {} : { nicht: kein + "; keine Zähigkeit je Saat" }) },
                    4: { werte: {}, zeuge: { antworten: 1 }, auge: bild, nicht: "kein Ausbruch als Ereignis: " + kein },
                    5: { werte: {}, zeuge: { antworten: 1 }, ...(vulkanAmFaden ? {} : { nicht: kein }) },
                    6: { werte: {}, zeuge: { antworten: 1 }, ...(vulkanAmFaden ? {} : { nicht: kein + "; keine Ausbruchsstärke (VEI)" }) },
                    7: { werte: {}, zeuge: { antworten: 1 }, auge: bild, nicht: kein + "; kein Körper außer PLANET_ERDE (voxel-worker.js:1159)" },
                },
            };
        },
        sprossen: {
            1: {
                u: { augeBis: 13, jeDekade: 20, ms: 4000 },
                soll: [
                    K.soll(VU, 1, "nach der Abkühlkurve gemessener Laven ±30 %", { key: "tKrusteS", ref: HON_S, refQuelle: "Erde: Hon et al. 1994 (Kīlauea-Pāhoehoe), Kruste H = 0,0779·√t (m, h) — die 1-m-Decke durch-erstarrt nach 165 h", einheit: "s" }),
                    K.soll(VU, 1, "2AFC ≤ 85 %", { key: "afcProzent", einheit: "%" }),
                ],
                zeuge: zMin({ antworten: 20, spanneK: 100 }),
                auge: { pose: "Ego am Spawn, Blick auf den Boden (am Gerät: eine Lava-Tat an ihrer Zelle)", vorbild: "Lava-Fotos (Kīlauea, USGS HVO), 2AFC ≤ 85 %, Prüfer-Satz R11" },
                taeter: "gelaende-core.js lava (LAVA: Newton-Gang τ = ρ·c·d/α, Decke 1 m) über stamm/feld-leben.js _lavaZustand",
                gruen: gut({ tKrusteS: 580000, tGlutAusS: 900000, afcProzent: 70 }, { antworten: 170, spanneK: 1200 }),
                attrappen: [{ name: "die Abkühlzeit aus dem Paper, keine Lava der Welt", roh: leer({ tKrusteS: 580000, tGlutAusS: 900000, afcProzent: 70 }) }],
            },
            2: {
                u: {},
                soll: [K.soll(VU, 2, "0,01–10 km/h", { key: "frontKmh", einheit: "km/h" })],
                zeuge: zMin({ antworten: 2 }),
                auge: { pose: "Ego am Hang, ein Strom 1 km (heute nicht erzeugbar)", vorbild: "Ausbruchsfilm eines Lavastroms (USGS HVO), Blindpaar R11" },
                taeter: "stamm/feld-leben.js _lavaGiessen (die Decke einer Zelle)",
                nicht: "die Lava fließt nicht",
                leser: "stamm/feld-leben.js:2460 _lavaGiessen schreibt EINE Zellen-Tat: kein Leser eines Stroms (Front, Hang, Zähigkeit)",
                gruen: gut({ frontKmh: 0.8 }, { antworten: 40 }),
                attrappen: [{ name: "die Frontgeschwindigkeit gesetzt", roh: leer({ frontKmh: 0.8 }) }],
            },
            3: {
                u: {},
                soll: [
                    K.soll(VU, 3, "30 Saaten", { key: "saaten", rel: "≥" }),
                    K.soll(VU, 3, "Schild 2–10°", { key: "schildGrad", einheit: "°" }),
                    K.soll(VU, 3, "Strato 25–35°", { key: "stratoGrad", einheit: "°" }),
                    K.soll(VU, 3, "in ≥ 90 %", { key: "folgtProzent", einheit: "%" }),
                    K.soll(VU, 3, "Profil gegen reales Gegenstück ≤ 15 %", { key: "profilAbwProzent", einheit: "%" }),
                ],
                zeuge: zMin({ antworten: 30 }),
                taeter: "planet-core.js planetVulkane (Kegel ohne Zähigkeit) — der Faden trägt sie nicht",
                nicht: "kein Vulkan am Faden, keine Zähigkeit",
                leser: "voxel-worker.js:1175 planetOrtAuftrag — gibt vulkan (Art, Abstand, Alter, Förderung) nicht weiter; planet-core.js:1676 planetVulkane hat keine Nachricht im Faden",
                gruen: gut({ saaten: 30, schildGrad: 5, stratoGrad: 30, folgtProzent: 93, profilAbwProzent: 11 }, { antworten: 300 }),
                attrappen: [{ name: "die Neigungen aus dem Lehrbuch", roh: leer({ saaten: 30, schildGrad: 5, stratoGrad: 30, folgtProzent: 93, profilAbwProzent: 11 }) }],
            },
            4: {
                u: {},
                soll: [K.soll(VU, 4, "Röhre ≥ 500 m begehbar", { key: "roehreM", einheit: "m" })],
                zeuge: zMin({ antworten: 2 }),
                auge: { pose: "Ego auf dem neuen Land nach dem Ausbruch (heute nicht erzeugbar)", vorbild: "Fotos von Pāhoehoe und ʻAʻā (USGS HVO), Blindpaar R11" },
                taeter: "stamm/feld-leben.js _lavaGiessen (kein Ausbruch, keine Röhre)",
                nicht: "kein Ausbruch, keine Röhre",
                leser: "stamm/feld-leben.js:2460 _lavaGiessen deckt eine Zelle; kein Leser, der Land anwachsen lässt oder eine Röhre gräbt",
                gruen: gut({ roehreM: 640 }, { antworten: 20 }),
                attrappen: [{ name: "eine gegrabene Röhre ohne Ausbruch", roh: leer({ roehreM: 640 }) }],
            },
            5: {
                u: {},
                soll: [
                    K.soll(VU, 5, "30 Saaten", { key: "saaten", rel: "≥" }),
                    K.soll(VU, 5, "≥ 90 % der Vulkane an Rändern oder Hotspots", { key: "randProzent", einheit: "%" }),
                    K.soll(VU, 5, "Alter längs der Kette Rang ≥ 0,8", { key: "kettenRang" }),
                ],
                zeuge: zMin({ antworten: 30 }),
                taeter: "planet-core.js planetVulkane — der Faden trägt sie nicht",
                nicht: "kein Vulkan am Faden",
                leser: "voxel-worker.js:367 msg.type — der Faden kennt nur planet-anker und planet-ort; planetVulkane (planet-core.js:1676) hat keinen Leser im Spiel",
                gruen: gut({ saaten: 30, randProzent: 94, kettenRang: 0.86 }, { antworten: 3000 }),
                attrappen: [{ name: "die Ketten-Statistik der Linse (diag-planet vulkan.kette), kein Faden", roh: leer({ saaten: 30, randProzent: 94, kettenRang: 0.86 }) }],
            },
            6: {
                u: {},
                soll: [
                    K.soll(VU, 6, "500–3 000 aktive Vulkane", { key: "aktive" }),
                    K.soll(VU, 6, "zehnmal seltener ±50 %", { key: "veiFaktor", ref: 10, refQuelle: "Erde: Smithsonian GVP — je VEI-Stufe ~10× seltener (Newhall & Self 1982)" }),
                ],
                zeuge: zMin({ antworten: 30 }),
                taeter: "planet-core.js planetVulkane (keine Ausbruchsstärke) — der Faden trägt sie nicht",
                nicht: "kein Vulkan am Faden, keine VEI",
                leser: "voxel-worker.js:367 msg.type — kein Auftrag planetVulkane im Faden; planet-core.js:1676 trägt keine Ausbruchsstärke",
                gruen: gut({ aktive: 1400, veiFaktor: 9 }, { antworten: 1400 }),
                attrappen: [{ name: "die Zahl der Linse (diag-planet vulkan.zahl), kein Faden", roh: leer({ aktive: 1400, veiFaktor: 9 }) }],
            },
            7: {
                u: {},
                soll: [K.soll(VU, 7, "Wärmefluss aus der Vulkanlandschaft Rang ≥ 0,7", { key: "waermeRang" }), K.soll(VU, 7, "höchster Vulkan gegen 1/Schwere Rang ≥ 0,7", { key: "schwereRang" })],
                zeuge: zMin({ antworten: 1000 }),
                auge: { pose: "Orbitbild der Vulkanlandschaft je Saat (heute nicht erzeugbar)", vorbild: "Ursachen-Probe R10 (Io, Venus, Mars: Sondenfotos)" },
                taeter: "voxel-worker.js planetPlanVon (PLANET_ERDE) und planetOrtAuftrag (kein Vulkan)",
                nicht: "kein Vulkan am Faden, kein Körper außer der Erde",
                leser: "voxel-worker.js:1159 PLANET_ERDE — planetPlanVon rechnet jeden Samen auf PLANET_ERDE (keine Schwere je Saat)",
                gruen: gut({ waermeRang: 0.75, schwereRang: 0.8 }, { antworten: 1000 }),
                attrappen: [{ name: "der Rang ohne Saaten", roh: leer({ waermeRang: 0.75, schwereRang: 0.8 }) }],
            },
        },
    };

    // ════════════════════════════════════════ GEBIRGE ════════════════════════════════════════
    const gebirge = {
        sek: 48,
        faecher: true,
        pfad: PFAD_ORT,
        ungefahren: "die Blindpaare (Felswand, Feldfoto) schießt die Probe nur am Gerät",
        mess: async function (H, U, M) {
            const r3 = (x) => (Number.isFinite(x) ? Math.round(x * 1000) / 1000 : null);
            const med = (a) => {
                const b = a.filter(Number.isFinite).sort((x, y) => x - y);
                const n = b.length;
                return n ? (n % 2 ? b[(n - 1) / 2] : (b[n / 2 - 1] + b[n / 2]) / 2) : NaN;
            };
            const rang = (v) => {
                const idx = v.map((x, i) => [x, i]).sort((p, q) => p[0] - q[0]);
                const r = new Array(v.length);
                for (let k = 0; k < idx.length; ) {
                    let m = k;
                    while (m + 1 < idx.length && idx[m + 1][0] === idx[k][0]) m++;
                    for (let q = k; q <= m; q++) r[idx[q][1]] = (k + m) / 2;
                    k = m + 1;
                }
                return r;
            };
            const spear = (a, b) => {
                const ra = rang(a), rb = rang(b), n = a.length;
                const ma = ra.reduce((s, x) => s + x, 0) / n, mb = rb.reduce((s, x) => s + x, 0) / n;
                let sab = 0, saa = 0, sbb = 0;
                for (let i = 0; i < n; i++) {
                    sab += (ra[i] - ma) * (rb[i] - mb);
                    saa += (ra[i] - ma) * (ra[i] - ma);
                    sbb += (rb[i] - mb) * (rb[i] - mb);
                }
                return saa > 0 && sbb > 0 ? sab / Math.sqrt(saa * sbb) : NaN;
            };
            const modus = (a) => {
                const z = new Map();
                let b = NaN, n = 0;
                for (const x of a) {
                    const c = (z.get(x) || 0) + 1;
                    z.set(x, c);
                    if (c > n) {
                        n = c;
                        b = x;
                    }
                }
                return b;
            };
            const aus = M.teil || {};
            // ── DIE STICHPROBE DER PROBE (S6; dieselbe liest die Leiter platten für S1, S2, S4, S5, S9): je Saat erde-01 … S6.punkte
            // Fibonacci-Lagen zur Zeit 0 über den Planet-Faden, abgelegt in window.__geoStich (die Probe räumt es am Ende)
            const S6 = U[6];
            const st = {};
            for (let i = 0; i < S6.saaten && M.uhr() < S6.bis; i += S6.block) {
                const S = [];
                for (let j = i; j < Math.min(S6.saaten, i + S6.block); j++) S.push("erde-" + String(j + 1).padStart(2, "0"));
                const a = await H.seite(
                    "await r._fadenQuelle(); const N = " + S6.punkte + ", S = " + JSON.stringify(S) + ", aus = {}; " +
                        "for (const s of S) { const P = []; for (let i = 0; i < N; i++) P.push([Math.asin(1 - (2 * (i + 0.5)) / N) * 180 / Math.PI, ((i * 137.50776405) % 360) - 180]); " +
                        "const a = await Promise.all(P.map((p) => r._planetAuftrag({ type: \"planet-ort\", samen: s, breite: p[0], laenge: p[1], zeitMa: 0 }))); " +
                        "aus[s] = { v: a[0].version, h: a.map((x) => Math.round(x.hoeheM)), k: a.map((x) => Math.round(x.kuesteKm)), ks: a.map((x) => Math.round(x.delta.wildnis.ks * 1000) / 1000), " +
                        "ho: a.map((x) => Math.round(x.delta.wildnis.hoehe * 1000) / 1000), rl: a.map((x) => Math.round(x.delta.wildnis.rauhLambda)), loch: a.filter((x) => !Number.isFinite(x.hoeheM) || !Number.isFinite(x.kuesteKm)).length }; } " +
                        "const c = window.__geoStich || (window.__geoStich = { N, je: {} }); if (c.N === N) Object.assign(c.je, aus); c.t = Date.now(); return Object.keys(aus).length;"
                );
                if (a) for (const s of S) st[s] = true;
            }
            const stich = await H.seite("const c = window.__geoStich; return c && c.N === " + S6.punkte + " ? c.je : {};");
            // ── S1 ÜBER DEN FÄCHER (stationen/faecher.js): N Lagen der Fibonacci-Kugel des Planeten der Welt; je Lage fragt der Faden
            // planet-ort (voxel-worker.js:1446 planetOrtAuftrag) nach der Zone (Kollision: Orogen aktiv · Kraton: alt, ohne Orogen) und die
            // Reise-Welt dort nach dem Einfallen ihrer Wände (je Wand-Spalte, Hang ≥ 40°) — beides muss eine Funktion der Adresse sein;
            // fehlt eine, nennt die Adresse sie (`fehlt`), die Wände der Heimat stehen daneben als Zeuge
            const FELS_AN = async (r, T, a, mit) => {
                const K = globalThis.__gelaendeCore, RAD = Math.PI / 180, k = a.ort + 1;
                const breite = (Math.asin(((k * 0.6180339887) % 1) * 2 - 1) * 180) / Math.PI, laenge = ((k * 137.508) % 360) - 180;
                await r._fadenQuelle();
                const o = await r._planetAuftrag({ type: "planet-ort", samen: r._planetSamen(), breite, laenge, zeitMa: 0 });
                if (!o || !o.land) return { meer: true };
                const zone = Number.isFinite(o.orogenAktiv) ? (o.orogenAktiv ? "kollision" : Number.isFinite(o.orogenAlterMa) && o.orogenAlterMa > 1000 ? "kraton" : "sonst") : null;
                const einfallAn = typeof K.felsEinfall === "function" ? K.felsEinfall : null;
                if (zone == null || !einfallAn)
                    return { fehlt: (zone == null ? "voxel-worker.js:1446 planetOrtAuftrag gibt die Zone nicht weiter (planet-core.js:1860 trägt orogenStaerke/orogenAktiv/orogenAlterMa, die Antwort nur " + Object.keys(o).sort().join(",") + ")" : "") + (zone == null && !einfallAn ? "; " : "") + (!einfallAn ? "gelaende-core.js:3351 FELS.einfall ist EINE Konstante (" + K.FELS.einfall + " rad), keine Funktion des Orts (gelaende-core.js:3417 FELS_TE liest sie)" : "") };
                const heim = r.constructor._weltGesetz(r.state.worldMeta).gelaende;
                const ort = { samen: o.samen, version: o.version, breite: o.breite, laenge: o.laenge, zeitMa: o.zeitMa, delta: o.delta };
                const O = K.ortGesetz(ort), eg = K.erbgutNormal(K.ortErbgut(K.erbgutNormal(heim == null ? undefined : heim), o.delta.wildnis));
                const wl = K.GRUND.basis - O.meerUnterBasisM;
                const L = K.lageAus({ seed: r._reiseSaat(ort, heim), baseHeight: K.GRUND.basis, waterLevel: wl, ort, erbgut: { terme: eg, wildnis: eg[0] && eg[0].art === "wildnis" ? 1 : 0 }, regionSize: K.GRUND.kachel }, SimplexNoise);
                let waende = 0, verformt = 0;
                for (let z = -mit.halb; z < mit.halb; z += 5)
                    for (let x = -mit.halb; x < mit.halb; x += 5) {
                        const h0 = K.hoehe(L, x, z, true);
                        if (h0 < wl + 1) continue;
                        if (Math.atan(Math.hypot(K.hoehe(L, x + 1.8, z, true) - h0, K.hoehe(L, x, z + 1.8, true) - h0) / 1.8) / RAD < 40) continue;
                        waende++;
                        if (einfallAn(L, x, z) / RAD >= 10) verformt++;
                    }
                return { zone, waende, verformt, breite: Math.round(breite * 10) / 10, laenge: Math.round(laenge * 10) / 10 };
            };
            const RF = await FAECHER((c) => H.seite(c), {
                gesetz: { fn: FELS_AN, export: "voxel-worker.js:1446 planetOrtAuftrag (die Zone) · gelaende-core.js:3351 FELS (das Einfallen)", leser: "gelaende-core.js:3417 FELS_TE (die Bänke im Fels-Stoff)" },
                adressen: { orte: Array.from({ length: U[1].orte }, (_, j) => j) },
                mit: { halb: U[1].halb },
                ms: U[1].ms,
                masse: {
                    kollision: { wie: (v, aus) => { const w = aus.reduce((s, x) => s + x.w.waende, 0); return w ? (100 * aus.reduce((s, x) => s + x.w.verformt, 0)) / w : null; }, feld: "zone", nur: (a, w) => w.zone === "kollision" },
                    kraton: { wie: (v, aus) => { const w = aus.reduce((s, x) => s + x.w.waende, 0); return w ? (100 * aus.reduce((s, x) => s + x.w.verformt, 0)) / w : null; }, feld: "zone", nur: (a, w) => w.zone === "kraton" },
                    waende: { wie: "summe", feld: "waende" },
                    zonen: { wie: "verschieden", feld: "zone", nur: (a, w) => w.zone === "kollision" || w.zone === "kraton" },
                },
                schlecht: { feld: "waende", richtung: "max" },
                pose: (a, w) => "Ego vor der Wand der Lage " + w.breite + "°/" + w.laenge + "° (" + w.zone + ")",
                ungemessen: ["die Felswand im Bild gegen Feldfotos (Blindpaar, am Gerät)"],
            });
            // ── die Felswände der Heimat (Hang ≥ 40° der Welt-Höhe, 1 km²) und das Einfallen ihrer Bänke, wie der Fels-Stoff es liest — der Zeuge
            const w = await H.seite(
                "const G = globalThis.__gelaendeCore; const hoch = (x, z) => r._terrainMacroSurfaceY(x, z); const wl = r.state.waterLevel; let n = 0, wand = 0; const ein = [];" +
                    "for (let z = -500; z < 500; z += 5) for (let x = -500; x < 500; x += 5) { const h0 = hoch(x, z); n++; if (h0 < wl + 1) continue; const t = Math.hypot(hoch(x + 1.8, z) - h0, hoch(x, z + 1.8) - h0) / 1.8; " +
                    "if (Math.atan(t) * 180 / Math.PI >= 40) { wand++; if (ein.length < 400) ein.push(G.FELS.einfall * 180 / Math.PI); } } " +
                    "return { n, wand, ein, streichenGrad: G.FELS.streichen * 180 / Math.PI };"
            );
            const verformt = w.ein.filter((x) => x >= 10).length;
            const einMittel = w.ein.length ? w.ein.reduce((s, x) => s + x, 0) / w.ein.length : NaN;
            const einStreu = w.ein.length ? Math.sqrt(w.ein.reduce((s, x) => s + (x - einMittel) * (x - einMittel), 0) / w.ein.length) : 0;
            const bild = await Promise.race([
                M.auge("geologie-gebirge", { px: 0, py: 140, pz: 260, lx: 0, ly: 95, lz: 0 }),
                new Promise((f) => setTimeout(() => f({ bild: null, grund: "kein Bild im Deckel der Leiter" }), Math.max(500, (U[1].augeBis - M.uhr()) * 1000))),
            ]);
            aus[1] = {
                werte: { verformtProzent: r3(RF.werte.kollision), kratonProzent: r3(RF.werte.kraton) },
                zeuge: { antworten: w.n + RF.adressen, waende: w.wand + (RF.werte.waende || 0), zonen: RF.werte.zonen || 0, einfallGrad: r3(einMittel), einfallStreuGrad: r3(einStreu), streichenGrad: r3(w.streichenGrad), adressen: RF.adressen, ohneFaehigkeit: RF.fehltAn.length },
                auge: bild,
            };
            if (RF.fehlt) aus[1].taeter = "Leser fehlt: " + RF.fehlt + " · " + RF.akte;
            else aus[1].zeuge.akte = RF.akte.slice(0, 600);
            // ── S2: das Orogen der Heimat — der höchste Punkt des Planeten der Welt (r._planetSamen) und sein Fenster 13 × 13 zu 40 km
            const o = await H.seite(
                "await r._fadenQuelle(); const s = r._planetSamen(); const N = " + U[2].punkte + "; const P = []; for (let i = 0; i < N; i++) P.push([Math.asin(1 - (2 * (i + 0.5)) / N) * 180 / Math.PI, ((i * 137.50776405) % 360) - 180]); " +
                    "const a = await Promise.all(P.map((p) => r._planetAuftrag({ type: \"planet-ort\", samen: s, breite: p[0], laenge: p[1], zeitMa: 0 }))); let b = 0; a.forEach((x, i) => { if (x.hoeheM > a[b].hoeheM) b = i; }); " +
                    "const [la, lo] = P[b]; const F = []; for (let j = -6; j <= 6; j++) for (let i = -6; i <= 6; i++) F.push([Math.max(-89.9, Math.min(89.9, la + 40 * j / 111.195)), ((lo + 40 * i / (111.195 * Math.max(0.05, Math.cos(la * Math.PI / 180))) + 540) % 360) - 180]); " +
                    "const f = await Promise.all(F.map((p) => r._planetAuftrag({ type: \"planet-ort\", samen: s, breite: p[0], laenge: p[1], zeitMa: 0 }))); const hs = f.map((x) => x.hoeheM); " +
                    "return { samen: s, n: a.length + f.length, mitte: [la, lo], hMax: Math.max(...hs), hMin: Math.min(...hs), ueber1: hs.filter((h) => h > 1000).length };"
            );
            const abw = Math.min(Math.abs(o.hMax - 4808) / 4808, Math.abs(o.hMax - 8849) / 8849) * 100;
            aus[2] = {
                werte: { profilAbwProzent: r3(abw), kammM: r3(o.hMax) },
                zeuge: { antworten: o.n, ueber1km: o.ueber1, spanneM: r3(o.hMax - o.hMin), samen: o.samen },
            };
            // ── S3, S4, S5: das Beben — was die Welt davon trägt
            const b = await H.seite(
                "const namen = new Set(); for (let p = r; p && p !== Object.prototype; p = Object.getPrototypeOf(p)) for (const n of Object.getOwnPropertyNames(p)) namen.add(n); " +
                    "return [...namen].filter((n) => /beben|quake|seism|verwerf|erschuetter|erschütter|epizent/i.test(n));"
            );
            const kein = "kein Beben in der Welt: " + (b.length ? b.join(", ") : "0 Leser eines Bebens, einer Verwerfung oder eines Versatzes") + " — Stand 0 (keine Verwerfung im Gelände-Kern, kein Herd am Faden)";
            aus[3] = { werte: {}, zeuge: { antworten: 1, leser: b.length }, nicht: kein };
            aus[4] = { werte: {}, zeuge: { antworten: 1, leser: b.length }, auge: bild, nicht: kein };
            aus[5] = { werte: {}, zeuge: { antworten: 1, leser: b.length }, nicht: kein + "; der Faden trägt keinen Plattenrand je Lage" };
            // ── S6: Alter gegen Höhe über die Orogene der Stichprobe. Fern jedes Orogens trägt rauhLambda seinen Grundwert, hoehe und ks
            // ihren Wert ohne Orogen und Rand: der häufigste Wert der Saat — die Differenz zum Anker fällt so heraus (Orogen-Stärke = hoehe −
            // Modus; λ − Modus ist über die Saaten vergleichbar). Orogen = Orogen-Stärke ≥ 0,3, dort liest der Boden das Alter als
            // rauhLambda; EIN Orogen = EIN Alter-Wert der Saat (die Stichpunkte einer Naht teilen ihr Alter), seine Höhe = sein höchster Punkt
            const alter = [], hoehe = [], alterNaht = [], hoeheNaht = [];
            let saaten = 0, antworten = 0, punkte = 0;
            for (let j = 0; j < S6.saaten; j++) {
                const x = stich["erde-" + String(j + 1).padStart(2, "0")];
                if (!x) continue;
                saaten++;
                antworten += x.h.length;
                const mh = modus(x.ho), mr = modus(x.rl), mk = modus(x.ks);
                const gruppe = new Map();
                x.h.forEach((h, i) => {
                    if (!(h > 0) || x.ho[i] - mh < 0.3 || !Number.isFinite(x.rl[i])) return;
                    punkte++;
                    const lam = x.rl[i] - mr;
                    const g = gruppe.get(lam) || { h: -Infinity, aktiv: false };
                    g.h = Math.max(g.h, h);
                    g.aktiv = g.aktiv || (x.ks[i] - mk) / 12 >= 0.1;
                    gruppe.set(lam, g);
                });
                for (const [lam, g] of gruppe) {
                    alter.push(lam);
                    hoehe.push(g.h);
                    if (!g.aktiv) {
                        alterNaht.push(lam);
                        hoeheNaht.push(g.h);
                    }
                }
            }
            const rho = alter.length >= 3 ? spear(alter, hoehe) : NaN;
            const rhoNaht = alterNaht.length >= 3 ? spear(alterNaht, hoeheNaht) : NaN;
            aus[6] = {
                werte: { saaten, rangAlterHoehe: r3(-rho) },
                zeuge: { antworten, orogene: alter.length, punkte, streuungAlter: r3(alter.length ? Math.max(...alter) - Math.min(...alter) : 0), rho: r3(rho), nahtOrogene: alterNaht.length, rangNaht: r3(-rhoNaht), bis: r3(M.uhr()) },
            };
            // ── S7: der Körper — ein Mond-Argument am Faden
            const k = await H.seite(
                "await r._fadenQuelle(); const a = await r._planetAuftrag({ type: \"planet-ort\", samen: \"erde-02\", breite: -20, laenge: 60, zeitMa: 0 }); " +
                    "const b = await r._planetAuftrag({ type: \"planet-ort\", samen: \"erde-02\", breite: -20, laenge: 60, zeitMa: 0, koerper: \"mars\", schwere: 3.71 }); return b.hoeheM - a.hoeheM;"
            );
            aus[7] = { werte: {}, zeuge: { antworten: 2, dhKoerper: r3(k) }, ...(Math.abs(k) > 0 ? {} : { nicht: "keine Schwere je Saat: ein Körper-Argument (Mars, 3,71 m/s²) ändert die Höhe um " + r3(k) + " m — jeder Samen rechnet auf PLANET_ERDE (voxel-worker.js:1159)" }) };
            return { sprossen: aus };
        },
        sprossen: {
            1: {
                u: { augeBis: 46, orte: 24, halb: 100, ms: 6000 },
                soll: [K.soll(GE, 1, "in Kollisionszonen ≥ 80 % der Wände verformt", { key: "verformtProzent", einheit: "%" }), K.soll(GE, 1, "im alten Kraton ≤ 20 %", { key: "kratonProzent", einheit: "%" })],
                zeuge: zMin({ antworten: 1000, waende: 20, zonen: 2, einfallStreuGrad: 0.5 }),
                auge: { pose: "Ego 45 m über dem Spawn vor der nächsten Felswand, Blick auf sie", vorbild: "Fotos von Felswänden in Faltengebirgen und Kratonen (Feldfotos je Gestein), Blindpaar R11" },
                taeter: "gelaende-core.js FELS (einfall/streichen: EIN Einfallen der Bänke)",
                leser: "gelaende-core.js:3351 FELS.einfall/streichen sind Konstanten (0,07 rad), gelesen von gelaende-core.js:3417 FELS_TE — kein Leser setzt das Einfallen aus der Geschichte des Orts; voxel-worker.js:1446 planetOrtAuftrag gibt die Zone (planet-core.js:1860 orogenAktiv/orogenAlterMa) nicht weiter",
                gruen: gut({ verformtProzent: 85, kratonProzent: 12 }, { antworten: 40000, waende: 300, zonen: 2, einfallStreuGrad: 18 }),
                attrappen: [
                    { name: "die Wände als verformt gezählt, keine Wand gefragt", roh: leer({ verformtProzent: 85, kratonProzent: 12 }) },
                    { name: "EIN Einfallen für jede Wand", roh: gut({ verformtProzent: 85, kratonProzent: 12 }, { antworten: 40000, waende: 300, einfallStreuGrad: 0 }) },
                ],
            },
            2: {
                u: { punkte: 300 },
                soll: [K.soll(GE, 2, "Hypsometrie des Orogens gegen Alpen-/Himalaya-Profil ≤ 20 %", { key: "profilAbwProzent", einheit: "%" })],
                zeuge: zMin({ antworten: 400, ueber1km: 3, spanneM: 500 }),
                taeter: "planet-core.js planetPunktR (Orogen-Höhe hGeb, Band ≥ 32 km) über den Faden voxel-worker.js planetOrtAuftrag",
                unklar: "das Alpen-/Himalaya-Profil ist kein eingefrorener Korpus: die Station misst die Kammhöhe des höchsten Orogens der Heimat-Saat (Fenster 520 km) gegen Mont Blanc 4 808 m und Everest 8 849 m (Copernicus DEM) — Vorschlag: das Querprofil beider, gemittelt über 500 km Streichen, als Korpus einfrieren",
                gruen: gut({ profilAbwProzent: 12, kammM: 5300 }, { antworten: 469, ueber1km: 40, spanneM: 4000 }),
                attrappen: [{ name: "die Kammhöhe der Alpen eingesetzt", roh: leer({ profilAbwProzent: 12, kammM: 5300 }) }],
            },
            3: {
                u: {},
                soll: [K.soll(GE, 3, "b-Wert 0,8–1,2", { key: "bWert" }), K.soll(GE, 3, "≥ 90 % der Epizentren an Verwerfungen", { key: "epiProzent", einheit: "%" })],
                zeuge: zMin({ antworten: 100 }),
                taeter: "gelaende-core.js (keine Verwerfung, kein Beben)",
                nicht: "kein Beben",
                leser: "stamm/gelaende-boden.js:756 _gelaende — die Gelände-Lage trägt keine Verwerfung und kein Beben-Ereignis (kein Leser einer Magnitude, Boden und Häuser bewegen sich nie)",
                gruen: gut({ bWert: 1.0, epiProzent: 93 }, { antworten: 500 }),
                attrappen: [{ name: "der Katalog der USGS abgeschrieben", roh: leer({ bWert: 1.0, epiProzent: 93 }) }],
            },
            4: {
                u: {},
                soll: [K.soll(GE, 4, "Geländestufe 1–5 m", { key: "stufeM", einheit: "m" })],
                zeuge: zMin({ antworten: 2 }),
                auge: { pose: "Ego an der Bruchstufe nach M7 (heute nicht erzeugbar)", vorbild: "Feldfotos von Bruchstufen (Landers 1992, Kaikōura 2016), Blindpaar R11" },
                taeter: "gelaende-core.js (kein Versatz, keine Rutschung)",
                nicht: "kein Bruch, kein Versatz",
                leser: "stamm/gelaende-boden.js:756 _gelaende — kein Leser schreibt einen Versatz nach einem Beben in die Höhe (der Erdbau kennt nur Taten des Spielers)",
                gruen: gut({ stufeM: 2.5 }, { antworten: 10 }),
                attrappen: [{ name: "eine gegrabene Stufe ohne Beben", roh: leer({ stufeM: 2.5 }) }],
            },
            5: {
                u: {},
                soll: [K.soll(GE, 5, "Epizentren eines Spieljahrs ≥ 85 % an Plattenrändern", { key: "randProzent", einheit: "%" })],
                zeuge: zMin({ antworten: 1000 }),
                taeter: "voxel-worker.js planetOrtAuftrag (kein Rand, kein Beben am Faden)",
                nicht: "kein Beben, kein Plattenrand am Faden",
                leser: "voxel-worker.js:1175 planetOrtAuftrag — gibt rand nicht weiter; kein Leser eines Bebens im Spieljahr",
                gruen: gut({ randProzent: 90 }, { antworten: 10000 }),
                attrappen: [{ name: "Epizentren aus dem ISC-Katalog", roh: leer({ randProzent: 90 }) }],
            },
            6: {
                u: { saaten: 100, punkte: 240, block: 4, bis: 31 },
                soll: [K.soll(GE, 6, "50 Saaten", { key: "saaten", rel: "≥" }), K.soll(GE, 6, "Alter erklärt Höhe, Rang ≥ 0,7", { key: "rangAlterHoehe" })],
                zeuge: zMin({ antworten: 5000, orogene: 30, streuungAlter: 1 }),
                taeter: "planet-core.js punktKern (Orogen-Gedächtnis H0·(1 − e^(−a/20))·e^(−a/120), K4) über den Faden voxel-worker.js planetOrtAuftrag",
                unklar: "„Alter erklärt Höhe, Rang ≥ 0,7“ gelesen als −Spearman(Alter, Höhe) ≥ 0,7 über die Orogene der Saaten (älter ist niedriger; je Orogen sein höchster Stichpunkt); das Alter ist der Regler rauhLambda, den der Boden liest — er trägt planet-core orogenAlterMa, am lebenden Rand die Zeit seit Beginn des Rands (planet-core.js:1291), an der Naht die Zeit seit der Naht; nur die Nähte stehen als rangNaht im Zeugen",
                gruen: gut({ saaten: 50, rangAlterHoehe: 0.74 }, { antworten: 12000, orogene: 300, streuungAlter: 5000 }),
                attrappen: [
                    { name: "der Rang aus dem Gesetz K4 gerechnet, kein Faden", roh: leer({ saaten: 50, rangAlterHoehe: 0.74 }) },
                    { name: "alle Orogene gleich alt", roh: gut({ saaten: 50, rangAlterHoehe: 0.74 }, { antworten: 12000, orogene: 300, streuungAlter: 0 }) },
                ],
            },
            7: {
                u: {},
                soll: [K.soll(GE, 7, "1 000 Saaten", { key: "saaten", rel: "≥" }), K.soll(GE, 7, "höchster Gipfel gegen 1/Schwere Rang ≥ 0,7", { key: "schwereRang" })],
                zeuge: zMin({ antworten: 1000 }),
                taeter: "voxel-worker.js planetPlanVon (PLANET_ERDE für jeden Samen)",
                nicht: "keine Schwere je Saat",
                leser: "voxel-worker.js:1159 PLANET_ERDE — planetPlanVon(samen) rechnet jeden Samen auf PLANET_ERDE (g 9,81)",
                gruen: gut({ saaten: 1000, schwereRang: 0.8 }, { antworten: 100000 }),
                attrappen: [{ name: "der Rang aus Weisskopf 1975 abgeschrieben", roh: leer({ saaten: 1000, schwereRang: 0.8 }) }],
            },
        },
    };

    // ════════════════════════════════════════ UNTERWELT ════════════════════════════════════════
    const unterwelt = {
        sek: 28,
        faecher: true,
        pfad: ["gelaende-core.js", "stamm/gelaende-*.js", "stamm/bild-sicht.js", "stamm/bau-buch.js", "scripts/werkbank.cjs"],
        ungefahren: "der Mund im Bild, das Karstfeld und die Halle (Blindpaare) schießt die Probe nur am Gerät",
        mess: async function (H, U, M) {
            const r3 = (x) => (Number.isFinite(x) ? Math.round(x * 1000) / 1000 : null);
            const u = U[1];
            // S1 ÜBER DEN FÄCHER (stationen/faecher.js): die Heimat und Reise-Welten an Land-Lagen des Planeten (planet-ort → `_reiseSaat` →
            // gelaende-core lageAus, wie NAPF_AN), je Welt ein Gitter von Kacheln um den Ursprung; je Kachel die Spalten im Raster 3,6 m:
            // steil (≥ 30°) → der Mund-Sucher an der Dichte, die das Spiel meshet — die Heimat über ihren Leser (stamm/gelaende-chunks.js:2208
            // `_fieldDensityAt`, mit Edits), eine Reise-Welt über den Export (gelaende-core.js:7303 `dichte`, ohne Edits: sie ist frisch)
            const MUND_AN = async (r, T, a, mit) => {
                const K = globalThis.__gelaendeCore;
                const C = window.__mundLagen || (window.__mundLagen = {});
                if (!(a.saat in C)) {
                    if (a.saat === "heim") C[a.saat] = { heim: true, L: r._gelaende(), wl: r.state.waterLevel, saat: r._gelaende().seed };
                    else {
                        await r._fadenQuelle();
                        const k = a.saat, breite = (Math.asin(((k * 0.6180339887) % 1) * 2 - 1) * 180) / Math.PI, laenge = ((k * 137.508) % 360) - 180;
                        const o = await r._planetAuftrag({ type: "planet-ort", samen: r._planetSamen(), breite, laenge, zeitMa: 0 });
                        if (!o || !o.land) C[a.saat] = null;
                        else {
                            const heim = r.constructor._weltGesetz(r.state.worldMeta).gelaende;
                            const ort = { samen: o.samen, version: o.version, breite: o.breite, laenge: o.laenge, zeitMa: o.zeitMa, delta: o.delta };
                            const O = K.ortGesetz(ort), eg = K.erbgutNormal(K.ortErbgut(K.erbgutNormal(heim == null ? undefined : heim), o.delta.wildnis));
                            const saat = r._reiseSaat(ort, heim), wl = K.GRUND.basis - O.meerUnterBasisM;
                            C[a.saat] = { saat, wl, L: K.lageAus({ seed: saat, baseHeight: K.GRUND.basis, waterLevel: wl, ort, erbgut: { terme: eg, wildnis: eg[0] && eg[0].art === "wildnis" ? 1 : 0 }, regionSize: K.GRUND.kachel }, SimplexNoise) };
                        }
                    }
                }
                const W = C[a.saat];
                if (!W) return { meer: true };
                const G0 = r._voxelChunkConfig(0), gy0 = (W.L.baseHeight || 0) - G0.floorDrop, st = G0.step;
                const fest = W.heim ? (x, y, z) => r._fieldDensityAt(x, y, z) > 0 : (x, y, z) => K.dichte(W.L, x, y, z) > 0;
                const oben = W.heim ? (X, Z) => r._voxelSurfaceY(X, Z) : (X, Z) => {
                    let y = Math.ceil((K.hoehe(W.L, X, Z, true) + 4 - gy0) / st) * st + gy0;
                    for (let i = 0; i < 40 && !fest(X, y, Z); i++) y -= st;
                    return y;
                };
                const hoch = W.heim ? (x, z) => r._terrainMacroSurfaceY(x, z) : (x, z) => K.hoehe(W.L, x, z, true);
                const gitter = (v) => Math.round(v / st) * st;
                const himmel = (x, y, z) => { for (let h = y + st; h < y + 60; h += st) if (fest(x, h, z)) return false; return true; };
                const mundAn = (X0, Z0) => {
                    const X = gitter(X0), Z = gitter(Z0), S = oben(X, Z);
                    if (S == null) return null;
                    for (let j = Math.floor((S - 4 - gy0) / st); gy0 + j * st > S - 40; j--) {
                        const y = gy0 + j * st;
                        if (fest(X, y, Z)) continue;
                        for (const [dx, dz] of [[1, 0], [-1, 0], [0, 1], [0, -1]]) {
                            const ax = X + dx * 2 * st, az = Z + dz * 2 * st;
                            if (fest(ax, y, az) || !himmel(ax, y, az)) continue;
                            let L = 0;
                            while (L < 30 && !fest(X - dx * L, y, Z - dz * L)) L += st;
                            if (L >= 12) return { x: X, y, z: Z, tief: L };
                            break;
                        }
                    }
                    return null;
                };
                const n = mit.kacheln, x0 = ((a.ort % n) - n / 2) * mit.kachelM, z0 = (Math.floor(a.ort / n) - n / 2) * mit.kachelM;
                const muender = [];
                let spalten = 0, kand = 0;
                for (let z = z0; z < z0 + mit.kachelM; z += 3.6)
                    for (let x = x0; x < x0 + mit.kachelM; x += 3.6) {
                        const h0 = hoch(x, z);
                        spalten++;
                        if (h0 < W.wl + 1) continue;
                        const g = (Math.atan(Math.hypot(hoch(x + 1.8, z) - h0, hoch(x, z + 1.8) - h0) / 1.8) * 180) / Math.PI;
                        if (g < 30) continue;
                        kand++;
                        const mm = mundAn(x, z);
                        if (mm && !muender.some((q) => Math.hypot(q.x - mm.x, q.z - mm.z) < 25)) muender.push({ x: mm.x, z: mm.z, tief: mm.tief, hangGrad: Math.round(g * 10) / 10 });
                    }
                return { saat: W.saat, km2: (mit.kachelM * mit.kachelM) / 1e6, spalten, kand, muender, n: muender.length };
            };
            const RF = await FAECHER((c) => H.seite(c), {
                gesetz: { fn: MUND_AN, export: "gelaende-core.js:7303 dichte (die Heimat über stamm/gelaende-chunks.js:2208 _fieldDensityAt)", leser: "stamm/gelaende-chunks.js:2208 _fieldDensityAt (der Boden meshet sie; voxel-worker dichte)" },
                adressen: { saaten: Array.from({ length: u.saaten }, (_, i) => i + 1), orte: Array.from({ length: u.kacheln * u.kacheln }, (_, j) => j), dazu: Array.from({ length: u.kacheln * u.kacheln }, (_, j) => ({ saat: "heim", ort: j, zeit: null })) },
                mit: { kacheln: u.kacheln, kachelM: u.kachelM },
                ms: u.ms,
                masse: {
                    saaten: { wie: "verschieden", feld: "saat", nur: (a, w) => w.spalten > 0 },
                    km2: { wie: "summe", feld: "km2", nur: (a, w) => w.spalten > 0 },
                    spalten: { wie: "summe", feld: "spalten" },
                    kand: { wie: "summe", feld: "kand" },
                    n: { wie: "summe", feld: "n" },
                    fels: { wie: (v) => v.reduce((s, m) => s + m.filter((q) => q.hangGrad >= 40).length, 0), feld: "muender", nur: (a, w) => Array.isArray(w.muender) },
                    hang: { wie: (v) => [].concat(...v).map((q) => q.hangGrad).slice(0, 20), feld: "muender", nur: (a, w) => Array.isArray(w.muender) },
                },
                schlecht: { feld: "n", richtung: "max" },
                pose: (a, w) => "Ego vor der Mündung " + (w.muender[0] ? w.muender[0].x + "/" + w.muender[0].z : "—") + " der Welt " + w.saat + ", Blick in den Mund",
                ungemessen: ["der Mund im Bild gegen Feldfotos (Korpus, am Gerät)"],
            });
            const m0 = await H.seite(
                "const st = r.state, G0 = r._voxelChunkConfig(0); const mats = Object.keys(st.materials || {}); return { seed: r._gelaende().seed, boden: G0.floorDrop, " +
                    "gestein: mats.filter((n) => /^(stein|fels|kalk|karbonat|dolomit|gips|salz|basalt|granit|marmor|eis)$/.test(n)), loeslich: mats.filter((n) => /^(kalk|karbonat|dolomit|gips|salz)/.test(n)) };"
            );
            const W1 = RF.werte;
            const m = Object.assign(m0, { km2: W1.km2 || 0, n: W1.n || 0, kand: W1.kand || 0, spalten: W1.spalten || 0, fels: W1.fels || 0, hang: W1.hang || [], ms: RF.ms, saaten: W1.saaten || 0, akte: RF.akte.slice(0, 600) });
            const bild = await Promise.race([
                M.auge("geologie-unterwelt", { px: 0, py: 120, pz: 160, lx: 0, ly: 95, lz: 0 }),
                new Promise((f) => setTimeout(() => f({ bild: null, grund: "kein Bild im Deckel der Leiter" }), Math.max(500, (u.augeBis - M.uhr()) * 1000))),
            ]);
            const gestein = m.gestein.join(", ") || "keins";
            const karst = "kein lösliches Gestein: die Stoff-Tafel trägt an Gestein " + gestein + " (" + (m.loeslich.length ? m.loeslich.join(", ") : "kein Karbonat, kein Gips, kein Salz") + "); die Höhle ist EIN Rausch-Feld (Wurm, Kaverne, Halle) im Band Basis − 28 m bis Boden − 16 m";
            return {
                sprossen: {
                    1: {
                        werte: { saaten: m.saaten, mundFelsProzent: r3(m.n ? (100 * m.fels) / m.n : NaN), muendungenJeKm2: r3(m.km2 > 0 ? m.n / m.km2 : NaN) },
                        zeuge: { antworten: m.spalten, kandidaten: m.kand, muendungen: m.n, km2: r3(m.km2), ms: m.ms, saat: m.seed, hangGrad: m.hang.slice(0, 20), adressen: RF.adressen, gerissen: RF.gerissen, akte: m.akte },
                        auge: bild,
                    },
                    2: { werte: { karbonatProzent: 0 }, zeuge: { antworten: m.spalten, loeslich: m.loeslich.length }, auge: bild, ...(m.loeslich.length ? {} : { nicht: karst }) },
                    3: { werte: {}, zeuge: { antworten: m.spalten }, nicht: "kein Höhlensystem: " + karst.slice(karst.indexOf("die Höhle")) + " — kein Fluss, kein Siphon, keine Einsturzdoline" },
                    4: { werte: {}, zeuge: { antworten: m.spalten }, ...(m.loeslich.length ? {} : { nicht: karst + "; keine Lavaröhre, Gletscher-, Brandungs- oder Gipshöhle" }) },
                    5: { werte: {}, zeuge: { antworten: m.spalten }, auge: bild, nicht: "kein System ≥ 100 km: " + karst.slice(karst.indexOf("die Höhle")) },
                    6: { werte: {}, zeuge: { antworten: m.spalten }, nicht: karst + "; kein Körper außer PLANET_ERDE (voxel-worker.js:1159)" },
                },
            };
        },
        sprossen: {
            1: {
                u: { saaten: 3, kacheln: 4, kachelM: 125, ms: 14000, augeBis: 26 },
                soll: [
                    K.soll(UW, 1, "an 3 Saaten", { key: "saaten", rel: "≥", zahl: 3 }),
                    ohneZahl(UW, 1, "Mündungen je km²", "muendungenJeKm2"),
                    K.soll(UW, 1, "Mund im Bild an ≥ 90 % im Fels", { key: "mundFelsProzent", einheit: "%" }),
                ],
                zeuge: zMin({ antworten: 10000, muendungen: 1 }),
                auge: { pose: "Ego vor der nächsten Mündung am Spawn (1 km²), Blick in den Mund", vorbild: "Fotos natürlicher Höhlen-Mündungen im Fels (Feldfotos je Form), Prüfer-Satz R11" },
                taeter: "gelaende-core.js dichteSpalte/dichteBasis (Höhlen-Feld, HOEHLEN_MUND) über stamm/gelaende-chunks.js _fieldDensityAt",
                leser: "stamm/gelaende-chunks.js:2208 _fieldDensityAt (die Heimat) und gelaende-core.js:7303 dichte (die Reise-Welten an Land-Lagen, gelaende-core.js:6069 lageAus) — der Fächer fragt Heimat + 3 Saaten",
                unklar: "„Mündungen je km² … im Band“ nennt kein Band — Vorschlag: 1–20 Mündungen je km² (Mittelgebirge, die Karte K16 setzt ≥ 1); und die drei Saaten als drei Welten der Fahrt, „im Fels“ als Flanke ≥ 40° (K16: die Mündungs-Wand ist Fels)",
                gruen: gut({ saaten: 3, mundFelsProzent: 95, muendungenJeKm2: 5 }, { antworten: 77000, muendungen: 5 }),
                attrappen: [{ name: "5 · 1 · 14 je km² aus dem Kopf des Kerns abgeschrieben", roh: leer({ saaten: 3, mundFelsProzent: 95, muendungenJeKm2: 5 }) }],
            },
            2: {
                u: {},
                soll: [
                    K.soll(UW, 2, "≥ 90 % der Höhlen in Karbonat", { key: "karbonatProzent", einheit: "%" }),
                    K.soll(UW, 2, "≥ 80 % entwässern zu einer Quelle", { key: "quelleProzent", einheit: "%" }),
                    K.soll(UW, 2, "Dolinen- gegen Höhlendichte r ≥ 0,7", { key: "dolinenR" }),
                ],
                zeuge: zMin({ antworten: 1000, loeslich: 1 }),
                auge: { pose: "Überflug über ein Karstfeld (heute nicht erzeugbar; geschossen über dem Spawn)", vorbild: "Karstfeld-Fotos (Dinarischer Karst, Feldfotos je Form), Blindpaar R11" },
                taeter: "gelaende-core.js dichteBasis (Höhle ohne Gestein) und die Stoff-Tafel (kein Karbonat)",
                nicht: "kein lösliches Gestein",
                leser: "gelaende-core.js:7207 dichteBasis schneidet die Höhle aus Rausch, ohne Gestein und Lösung; stamm/bau-buch.js:1554 _stoff kennt kein Karbonat",
                gruen: gut({ karbonatProzent: 94, quelleProzent: 85, dolinenR: 0.75 }, { antworten: 5000, loeslich: 2 }),
                attrappen: [{ name: "die Karst-Statistik ohne Karbonat in der Welt", roh: gut({ karbonatProzent: 94, quelleProzent: 85, dolinenR: 0.75 }, { antworten: 5000, loeslich: 0 }) }],
            },
            3: {
                u: {},
                soll: [K.soll(UW, 3, "10 km am Stück begehbar", { key: "systemKm", rel: "≥", zahl: 10, einheit: "km" })],
                zeuge: zMin({ antworten: 1000 }),
                taeter: "gelaende-core.js dichteBasis (Höhle als Rausch-Feld im Band Basis − 28 m)",
                nicht: "kein Höhlensystem",
                leser: "gelaende-core.js:7207 dichteBasis kennt kein Netz eines Systems (Gang, Fluss, Siphon); die Höhle endet 28 m unter der Basis",
                unklar: "„Höhlenplan-Statistik (Verzweigung, Querschnitt) im Band realer Systeme“ nennt kein Band — Vorschlag: Verzweigungsgrad und Querschnitt im 10–90-%-Band der Höhlenkataster (Mammoth, Hölloch)",
                gruen: gut({ systemKm: 12 }, { antworten: 5000 }),
                attrappen: [{ name: "die Länge eines Systems behauptet", roh: leer({ systemKm: 12 }) }],
            },
            4: {
                u: {},
                soll: [K.soll(UW, 4, "1 000 Zufallshöhlen aus 30 Saaten", { key: "hoehlen", rel: "≥", zahl: 1000 }), K.soll(UW, 4, "Typ passt zu Gestein und Lösungsmittel in ≥ 90 %", { key: "typProzent", einheit: "%" })],
                zeuge: zMin({ antworten: 1000, saaten: 30 }),
                taeter: "gelaende-core.js dichteBasis (ein Höhlen-Typ für jedes Gestein)",
                nicht: "kein Höhlen-Typ je Gestein",
                leser: "gelaende-core.js:7207 dichteBasis liest kein Gestein und kein Lösungsmittel",
                gruen: gut({ hoehlen: 1000, typProzent: 92 }, { antworten: 30000, saaten: 30 }),
                attrappen: [{ name: "die Typen aus einer Tabelle", roh: leer({ hoehlen: 1000, typProzent: 92 }) }],
            },
            5: {
                u: {},
                soll: [K.soll(UW, 5, "längstes System ≥ 100 km", { key: "laengsteKm", einheit: "km" }), K.soll(UW, 5, "in ≥ 20 % der Karstsaaten", { key: "karstProzent", einheit: "%" })],
                zeuge: zMin({ antworten: 1000 }),
                auge: { pose: "Ego in einer Halle 10⁷ m³ (heute nicht erzeugbar; geschossen über dem Spawn)", vorbild: "Fotos von Son Doong und Mammoth Cave, Blindpaar R11" },
                taeter: "gelaende-core.js dichteBasis (Halle bis 72 m Schnitt im Band Basis − 28 m)",
                nicht: "kein System ≥ 100 km",
                leser: "gelaende-core.js:7207 dichteBasis — die Halle ist ein Rausch-Term (hall · 72) unter der Hülle: kein System, keine Halle mit Wald und Wolke",
                gruen: gut({ laengsteKm: 140, karstProzent: 25 }, { antworten: 5000 }),
                attrappen: [{ name: "Mammoth Cave als Zahl", roh: leer({ laengsteKm: 140, karstProzent: 25 }) }],
            },
            6: {
                u: {},
                soll: [K.soll(UW, 6, "Röhrenweite gegen 1/Schwere Rang ≥ 0,7", { key: "roehrenRang" }), K.soll(UW, 6, "Höhlentyp folgt Gestein in ≥ 80 %", { key: "typProzent", einheit: "%" })],
                zeuge: zMin({ antworten: 1000 }),
                taeter: "voxel-worker.js planetPlanVon (PLANET_ERDE) und gelaende-core.js dichteBasis",
                nicht: "keine Welt außer der Erde, kein Höhlen-Typ",
                leser: "voxel-worker.js:1159 PLANET_ERDE — planetPlanVon rechnet jeden Samen auf PLANET_ERDE; gelaende-core.js:7207 dichteBasis liest keine Schwere",
                gruen: gut({ roehrenRang: 0.8, typProzent: 85 }, { antworten: 10000 }),
                attrappen: [{ name: "der Rang ohne Welten", roh: leer({ roehrenRang: 0.8, typProzent: 85 }) }],
            },
        },
    };

    // ════════════════════════════════════════ LAGERSTÄTTE ════════════════════════════════════════
    const lagerstaette = {
        sek: 12,
        faecher: true,
        pfad: ["gelaende-core.js", "foundry-core.js", "stamm/bau-buch.js", "stamm/gelaende-*.js", "scripts/werkbank.cjs"],
        ungefahren: "die Jury, die geologische Karte, der Abbau und die Mineral-Stufe (Blindpaare) urteilen nur am Gerät",
        mess: async function (H, U, M) {
            // S1 ÜBER DEN FÄCHER (stationen/faecher.js): N Lagen der Fibonacci-Kugel; je Lage die Geschichte des Orts am Faden (planet-ort:
            // Zone, Alter, Vulkan) und die Genese des Gesteins, die die Welt dort trägt — „passt“ heißt magmatisch an Vulkan/Rand,
            // metamorph im Orogen, sedimentär sonst; fehlt eine Funktion der Adresse, nennt die Adresse sie (`fehlt`)
            const GENESE_AN = async (r, T, a, mit) => {
                const K = globalThis.__gelaendeCore, k = a.ort + 1;
                const breite = (Math.asin(((k * 0.6180339887) % 1) * 2 - 1) * 180) / Math.PI, laenge = ((k * 137.508) % 360) - 180;
                await r._fadenQuelle();
                const o = await r._planetAuftrag({ type: "planet-ort", samen: r._planetSamen(), breite, laenge, zeitMa: 0 });
                if (!o || !o.land) return { meer: true };
                const gesch = Number.isFinite(o.orogenAktiv) && Number.isFinite(o.vulkanAbstandKm) ? (o.vulkanAbstandKm < 50 ? "magmatisch" : o.orogenAktiv ? "metamorph" : "sedimentaer") : null;
                const genese = typeof K.felsGenese === "function" ? K.felsGenese : null;
                if (gesch == null || !genese)
                    return { fehlt: (gesch == null ? "voxel-worker.js:1446 planetOrtAuftrag gibt die Geschichte nicht weiter (planet-core.js:1860 trägt orogenAktiv/vulkanAbstandKm, die Antwort nur " + Object.keys(o).sort().join(",") + ")" : "") + (gesch == null && !genese ? "; " : "") + (!genese ? "gelaende-core.js:3351 FELS ist EIN Fels-Stoff je Welt, keine Genese je Ort (foundry-core.js:5242 rockPhenotype wählt nur die Sorte eines Brockens)" : "") };
                const g = genese(o, breite, laenge);
                return { gesch, genese: g, passt: g === gesch ? 1 : 0 };
            };
            const RF = await FAECHER((c) => H.seite(c), {
                gesetz: { fn: GENESE_AN, export: "voxel-worker.js:1446 planetOrtAuftrag (die Geschichte) · gelaende-core.js:3351 FELS (das Gestein)", leser: "gelaende-core.js:3417 FELS_TE (die Bänke im Fels-Stoff)" },
                adressen: { orte: Array.from({ length: U[1].orte }, (_, j) => j) },
                ms: U[1].ms,
                masse: { passt: { wie: "mittel", feld: "passt" }, genesen: { wie: "verschieden", feld: "genese" }, orte: { wie: "anzahl", feld: "gesch" } },
                ungemessen: ["die Jury der drei Genesen im Bild (Panel R11, am Gerät)"],
            });
            const g = await H.seite(
                "const mats = r.state.materials || {}; const N = Object.keys(mats); const namen = new Set(); for (let p = r; p && p !== Object.prototype; p = Object.getPrototypeOf(p)) for (const n of Object.getOwnPropertyNames(p)) namen.add(n); " +
                    "const L = [...namen]; const G = globalThis.__gelaendeCore; const hoch = (x, z) => r._terrainMacroSurfaceY(x, z); let n = 0, fels = 0; " +
                    "for (let z = -1000; z < 1000; z += 20) for (let x = -1000; x < 1000; x += 20) { const h0 = hoch(x, z); n++; const t = Math.hypot(hoch(x + 1.8, z) - h0, hoch(x, z + 1.8) - h0) / 1.8; if (Math.atan(t) * 180 / Math.PI >= 40) fels++; } " +
                    "return { stoffe: N.length, gestein: N.filter((k) => /^(stein|fels|kalk|granit|basalt|marmor|schiefer|sandstein|gneis|tuff|obsidian)$/.test(k)), erz: N.filter((k) => /^(erz|kohle|salz|kupfer|gold|zinn|silber|eisen|quarz|mineral|kristall)/.test(k)), " +
                    "leser: L.filter((k) => /lagerst|prospekt|bohrung|bohrloch|abbau|bergbau|kohle|mineral|kristall|genese/i.test(k) || /^_erz|Erz(?![a-zäöü])/.test(k)), spalten: n, fels, felsFarbe: typeof G.felsFarbe === \"function\" };"
            );
            const bild = await Promise.race([
                M.auge("geologie-lagerstaette", { px: 0, py: 140, pz: 260, lx: 0, ly: 95, lz: 0 }),
                new Promise((f) => setTimeout(() => f({ bild: null, grund: "kein Bild im Deckel der Leiter" }), Math.max(500, (U[1].augeBis - M.uhr()) * 1000))),
            ]);
            const gestein = g.gestein.join(", ") || "keins";
            const erz = g.erz.join(", ") || "keins";
            const kein = "die Stoff-Tafel trägt " + g.stoffe + " Stoffe, Gestein: " + gestein + ", Roh-Stoffe: " + erz + " (Bau-Stoffe ohne Fundort); " + (g.leser.length ? "Leser: " + g.leser.slice(0, 6).join(", ") : "0 Leser einer Lagerstätte, einer Bohrung, eines Abbaus oder eines Funds");
            return {
                sprossen: {
                    1: {
                        werte: { genesen: RF.werte.genesen || 0, passtProzent: Number.isFinite(RF.werte.passt) ? Math.round(1000 * RF.werte.passt) / 10 : null },
                        zeuge: { antworten: g.spalten + RF.adressen, felsSpalten: g.fels, genesen: RF.werte.genesen || 0, adressen: RF.adressen, ohneFaehigkeit: RF.fehltAn.length },
                        auge: bild,
                        ...(RF.fehlt ? { taeter: "Leser fehlt: " + RF.fehlt + " · " + RF.akte } : {}),
                    },
                    2: { werte: {}, zeuge: { antworten: g.spalten }, auge: bild, nicht: "keine geologische Karte: EIN Gestein je Ort, kein Leser bindet es an Tektonik und Alter" },
                    3: { werte: {}, zeuge: { antworten: g.spalten }, nicht: "keine Lagerstätte: " + kein },
                    4: { werte: {}, zeuge: { antworten: g.spalten }, auge: bild, nicht: "keine Kohle, keine Senkung: " + kein },
                    5: { werte: {}, zeuge: { antworten: g.spalten }, auge: bild, nicht: "kein Fund mit Kristallsystem: quarz und eisen sind Bau-Stoffe der Tafel (Tags Härte, Dichte, Transparenz), kein Mineral mit System, Habitus und Fundort; " + kein },
                    6: { werte: {}, zeuge: { antworten: g.spalten }, nicht: "keine fremde Chemie: " + kein + "; kein Körper außer PLANET_ERDE (voxel-worker.js:1159)" },
                },
            };
        },
        sprossen: {
            1: {
                u: { augeBis: 11, orte: 30, ms: 3000 },
                soll: [K.soll(LA, 1, "Jury trennt drei Genesen ≥ 80 %", { key: "juryProzent", einheit: "%" }), K.soll(LA, 1, "Genese passt zur Geschichte des Orts ≥ 85 %", { key: "passtProzent", einheit: "%" })],
                zeuge: zMin({ antworten: 1000, genesen: 3 }),
                auge: { pose: "Ego 45 m über dem Spawn vor der nächsten Felswand", vorbild: "Feldfotos magmatischer, sedimentärer und metamorpher Wände (Jury, Prüfer-Satz R11)" },
                taeter: "gelaende-core.js FELS (EIN Fels-Stoff) und foundry-core.js rockPhenotype (Genese nur am Brocken)",
                leser: "foundry-core.js:5242 rockPhenotype — wählt die Sorte eines Brockens; kein Leser bindet die Genese an Ort oder Alter (gelaende-core.js:3351 FELS); voxel-worker.js:1446 planetOrtAuftrag gibt die Geschichte (planet-core.js:1860) nicht weiter",
                gruen: gut({ juryProzent: 84, passtProzent: 88, genesen: 3 }, { antworten: 10000, genesen: 3 }),
                attrappen: [{ name: "drei Genesen benannt, eine Wand", roh: gut({ juryProzent: 84, passtProzent: 88, genesen: 3 }, { antworten: 10000, genesen: 1 }) }],
            },
            2: {
                u: {},
                soll: [ohneZahl(LA, 2, "Blindpaar geologische Karte gegen reale", "blindpaar")],
                zeuge: zMin({ antworten: 1000 }),
                auge: { pose: "Karte der Region 10⁴ km² (heute nicht erzeugbar; geschossen über dem Spawn)", vorbild: "geologische Karte einer realen Region (BGR GÜK 250), Blindpaar R11" },
                taeter: "gelaende-core.js FELS (EIN Gestein)",
                nicht: "keine geologische Karte",
                leser: "gelaende-core.js:3350 einfall — EIN Fels-Stoff je Welt: kein Leser einer geologischen Einheit je Ort",
                unklar: "der Richter nennt keine Schwelle — Vorschlag: 2AFC ≤ 70 % über 40 Paare (Prüfer-Satz R11)",
                gruen: gut({ blindpaar: 60 }, { antworten: 5000 }),
                attrappen: [{ name: "die reale Karte gezeigt", roh: leer({ blindpaar: 60 }) }],
            },
            3: {
                u: {},
                soll: [K.soll(LA, 3, "Prospektor-Probe an 30 Saaten", { key: "saaten", rel: "≥", zahl: 30 }), K.soll(LA, 3, "Fundquote nach Zeichen ≥ 5× blindes Bohren", { key: "fundFaktor" })],
                zeuge: zMin({ antworten: 1000, saaten: 30 }),
                taeter: "die Stoff-Tafel (kein Rohstoff mit Herkunft) — kein Leser einer Lagerstätte",
                nicht: "keine Lagerstätte",
                leser: "stamm/bau-buch.js:1554 _stoff liest die Tafel der Bau-Stoffe: keine Lagerstätte, kein Erz am Ort",
                gruen: gut({ saaten: 30, fundFaktor: 6 }, { antworten: 3000, saaten: 30 }),
                attrappen: [{ name: "die Fundquote gesetzt", roh: leer({ saaten: 30, fundFaktor: 6 }) }],
            },
            4: {
                u: {},
                // ZAHL (auge-klasse.cjs): „sichtbar und bleibend“ und „messbar“ sind Schwellen des Worts selbst — die Grube steht nach dem
                // Reload (1), die Senkung über dem Flöz ist > 0 m; das Bild ist Beleg
                soll: [
                    K.soll(LA, 4, "Abbau sichtbar und nach Reload bleibend", { key: "abbau", rel: "=", zahl: 1, refQuelle: "das Wort selbst: „nach Reload bleibend“ — 1 = die gegrabene Grube steht nach dem Reload an derselben Stelle" }),
                    K.soll(LA, 4, "Senkung über Kohle messbar", { key: "senkung", rel: ">", zahl: 0, refQuelle: "das Wort selbst: „messbar“ — die Senkung über dem abgebauten Flöz ist > 0 m", einheit: "m" }),
                ],
                zeuge: zMin({ antworten: 1000 }),
                auge: { pose: "Ego an der Grube nach Abbau und Reload (heute: keine Lagerstätte)", vorbild: "Fotos von Gruben, Halden und Bergsenkungen (Ruhrgebiet), Prüfer-Satz R11" },
                taeter: "die Stoff-Tafel (keine Kohle) — kein Leser einer Senkung",
                nicht: "keine Kohle, keine Senkung",
                leser: "stamm/bau-buch.js:1554 _stoff — keine Kohle in der Stoff-Tafel; kein Leser einer Bergsenkung über einem Abbau",
                gruen: gut({ abbau: 1, senkung: 0.8 }, { antworten: 5000 }),
                attrappen: [{ name: "eine gegrabene Grube ohne Kohle", roh: leer({ abbau: 1, senkung: 0.8 }) }],
            },
            5: {
                u: {},
                soll: [K.soll(LA, 5, "100 Zufallsfunde", { key: "funde", rel: "≥" }), K.soll(LA, 5, "Jury nennt das Kristallsystem blind ≥ 80 %", { key: "juryProzent", einheit: "%" })],
                zeuge: zMin({ antworten: 1000, funde: 100 }),
                auge: { pose: "die Fundstufe in der Hand (heute nicht erzeugbar)", vorbild: "Mineralfotos (mindat.org), Jury blind, Prüfer-Satz R11" },
                taeter: "die Stoff-Tafel (kein Mineral) — kein Leser von Kristallsystem und Chemie",
                nicht: "kein Fund mit Kristallsystem",
                leser: "stamm/bau-buch.js:1554 _stoff — die Stoff-Tafel trägt quarz und eisen als Bau-Stoffe (Tags Härte, Dichte, Transparenz), ohne Kristallsystem, Habitus und Fundort",
                gruen: gut({ funde: 100, juryProzent: 84 }, { antworten: 1000, funde: 100 }),
                attrappen: [{ name: "Fotos aus mindat statt Funde der Welt", roh: leer({ funde: 100, juryProzent: 84 }) }],
            },
            6: {
                u: {},
                soll: [K.soll(LA, 6, "Prospektor-Probe an 1 000 Saaten ≥ 3× blindes Bohren", { key: "fundFaktor" })],
                zeuge: zMin({ antworten: 1000, saaten: 1000 }),
                taeter: "voxel-worker.js planetPlanVon (PLANET_ERDE) — keine Chemie je Saat",
                nicht: "keine fremde Chemie",
                leser: "voxel-worker.js:1159 PLANET_ERDE — planetPlanVon rechnet jeden Samen auf PLANET_ERDE: keine Element-Verteilung je Saat",
                gruen: gut({ fundFaktor: 4 }, { antworten: 30000, saaten: 1000 }),
                attrappen: [{ name: "der Faktor ohne Saaten", roh: leer({ fundFaktor: 4 }) }],
            },
        },
    };

    // ════════════════════════════════════════ INNERES ════════════════════════════════════════
    const inneres = {
        sek: 16,
        faecher: true,
        pfad: ["stamm/bild-himmel.js", "gelaende-core.js", "stamm/gelaende-*.js", "planet-core.js", "voxel-worker.js", "scripts/werkbank.cjs"],
        ungefahren: "die Ursachen-Probe (Bild) urteilt nur am Gerät; der Kompass im Bild am schlechtesten Ort ebenso",
        mess: async function (H, U, M) {
            const r3 = (x) => (Number.isFinite(x) ? Math.round(x * 1000) / 1000 : null);
            // S1 ÜBER DEN FÄCHER (stationen/faecher.js): N Orte der Fibonacci-Kugel des Planeten, je Ort der Faden planet-ort
            // (voxel-worker.js:1446 planetOrtAuftrag — derselbe Auftrag, den die Reise bestellt, stamm `_planetAuftrag`) und der Stamm
            // als Leser eines Kompasses; trägt der Ort ein Feld (Inklination oder Vektor Nord/Ost/Unten), urteilt die Inklination gegen den
            // Dipol tan I = 2 tan λm (λm die magnetische Breite gegen den Pol des Felds, ohne Pol die geographische)
            const MAGNET_AN = async (r, T, a, mit) => {
                const RAD = Math.PI / 180, k = a.ort + 1;
                const breite = (Math.asin(((k * 0.6180339887) % 1) * 2 - 1) * 180) / Math.PI, laenge = ((k * 137.508) % 360) - 180;
                await r._fadenQuelle();
                const o = await r._planetAuftrag({ type: "planet-ort", samen: r._planetSamen(), breite, laenge, zeitMa: 0 });
                const spur = [];
                const such = (x, p, t) => {
                    if (x && typeof x === "object" && t < 4) for (const q of Object.keys(x)) (/magnet|inklin|deklin|dipol/i.test(q) && spur.push(p + q), such(x[q], p + q + ".", t + 1));
                };
                such(o, "", 0);
                const namen = new Set();
                for (let p = r; p && p !== Object.prototype; p = Object.getPrototypeOf(p)) for (const n of Object.getOwnPropertyNames(p)) if (/magnet|kompass|compass|deklin|inklin|dipol/i.test(n)) namen.add(n);
                const B = (o && (o.magnet || o.feld)) || null;
                const I = B && Number.isFinite(B.inklinationGrad) ? B.inklinationGrad : B && Array.isArray(B.nordOstUnten) ? Math.atan2(B.nordOstUnten[2], Math.hypot(B.nordOstUnten[0], B.nordOstUnten[1])) / RAD : null;
                if (I == null)
                    return { fehlt: "planet-core.js:264 PLANET_ERDE ohne Dipol (kein Feld, kein Pol, keine Stärke); voxel-worker.js:1446 planetOrtAuftrag antwortet mit " + Object.keys(o || {}).sort().join(",") + (spur.length ? " (Spur " + spur.join(",") + " ohne Inklination)" : "") + "; im Stamm " + (namen.size ? [...namen].join(",") : "kein Leser eines Kompasses") };
                const lm = Number.isFinite(B.polBreite) && Number.isFinite(B.polLaenge) ? Math.asin(Math.sin(breite * RAD) * Math.sin(B.polBreite * RAD) + Math.cos(breite * RAD) * Math.cos(B.polBreite * RAD) * Math.cos((laenge - B.polLaenge) * RAD)) : breite * RAD;
                const dip = Math.atan(2 * Math.tan(lm)) / RAD;
                return { breite: Math.round(breite * 10) / 10, laenge: Math.round(laenge * 10) / 10, I, dip, abw: Math.abs(I - dip), dekl: Number.isFinite(B.deklinationGrad) ? Math.round(B.deklinationGrad * 10) / 10 : null };
            };
            const RF = await FAECHER((c) => H.seite(c), {
                gesetz: { fn: MAGNET_AN, export: "voxel-worker.js:1446 planetOrtAuftrag (planet-core.js:264 PLANET_ERDE)", leser: "stamm _planetAuftrag (die Reise) — ein Kompass liest das Feld nirgends" },
                adressen: { orte: Array.from({ length: U[1].orte }, (_, j) => j) },
                ms: U[1].ms,
                masse: { orte: { wie: "anzahl", feld: "I" }, abw: { wie: "max", feld: "abw" }, dekl: { wie: "verschieden", feld: "dekl" } },
                schlecht: { feld: "abw", richtung: "max" },
                pose: (a, w) => "Kompass in der Hand am Ort " + w.breite + "°/" + w.laenge + "°, Nadel und Neigung im Bild",
                ungemessen: ["der Kompass im Bild (am Gerät)"],
            });
            const s1 = {
                werte: { inklinationAbwGrad: r3(RF.werte.abw), orte: RF.gemessen },
                zeuge: { adressen: RF.adressen, orte: RF.gemessen, deklinationen: RF.werte.dekl || 0, ohneFeld: RF.fehltAn.length, ms: RF.ms },
            };
            if (RF.fehlt) s1.taeter = "Leser fehlt: " + RF.fehlt + " · " + RF.akte;
            else s1.zeuge.akte = RF.akte.slice(0, 600);
            const i = await H.seite(
                "const sy = r._voxelSurfaceY(0, 0); const T = [0, 10, 28, 50, 100].map((d) => [d, r._temperaturAt(sy - d, 0)]); const G0 = r._voxelChunkConfig(0); const boden = (r.state.terrainBaseHeight || 0) - G0.floorDrop; " +
                    "const namen = new Set(); for (let p = r; p && p !== Object.prototype; p = Object.getPrototypeOf(p)) for (const n of Object.getOwnPropertyNames(p)) namen.add(n); const L = [...namen]; " +
                    "await r._fadenQuelle(); const o = await r._planetAuftrag({ type: \"planet-ort\", samen: r._planetSamen(), breite: 10, laenge: 20, zeitMa: 0 }); " +
                    "return { T, sy, boden, magnet: L.filter((n) => /magnet|kompass|compass|deklin|inklin|dipol/i.test(n)), geysir: L.filter((n) => /geysir|geyser|fumarol|raucher|heissQuelle|thermalQuelle/i.test(n)), " +
                    "schnitt: L.filter((n) => /planetSchnitt|querschnitt|mantel|erdkern/i.test(n)), ort: Object.keys(o).sort().join(\",\") };"
            );
            const g = (i.T[4][1] - i.T[0][1]) / 0.1;
            const tiefe = i.sy - i.boden;
            const kein = (was, liste) => was + ": " + (liste.length ? liste.join(", ") : "0 Leser in der Welt") + " — der Faden antwortet mit " + i.ort;
            const bild = await Promise.race([
                M.auge("geologie-inneres", { px: 0, py: 1800, pz: 2600, lx: 0, ly: 0, lz: -2600 }),
                new Promise((f) => setTimeout(() => f({ bild: null, grund: "kein Bild im Deckel der Leiter" }), Math.max(500, (U[6].augeBis - M.uhr()) * 1000))),
            ]);
            return {
                sprossen: {
                    1: s1,
                    2: { werte: {}, zeuge: { antworten: 2 }, nicht: kein("keine Feldgeschichte im Gestein", i.magnet) },
                    3: { werte: {}, zeuge: { antworten: 2, geysirLeser: i.geysir.length }, nicht: kein("kein Geysir, keine Wärme-Anomalie", i.geysir) },
                    4: {
                        werte: { gradientKjeKm: r3(g), stollenKm: r3(tiefe / 1000) },
                        zeuge: { antworten: i.T.length, tiefeM: r3(tiefe), tOben: r3(i.T[0][1]), t100m: r3(i.T[4][1]) },
                        nicht: "kein Stollen von 10 km: die Welt endet " + r3(tiefe) + " m unter dem Boden am Spawn (ihr Boden liegt bei y = " + i.boden + " m: Basis − floorDrop); die Temperatur unter dem Boden ist die Höhen-Rampe der Luft (" + r3(g) + " K je km nach unten), kein Wärmefluss",
                    },
                    5: { werte: {}, zeuge: { antworten: 2, schnittLeser: i.schnitt.length }, nicht: kein("kein Schnitt durch den Planeten, keine Schalen", i.schnitt) },
                    6: { werte: {}, zeuge: { antworten: 2 }, auge: bild, nicht: kein("kein Feld, kein Kern", i.magnet) + "; kein Körper außer PLANET_ERDE (voxel-worker.js:1159)" },
                },
            };
        },
        sprossen: {
            1: {
                u: { orte: 20, ms: 8000 },
                soll: [K.soll(IN, 1, "Inklination ≤ 5° gegen Dipol an 20 Orten", { key: "inklinationAbwGrad", einheit: "°" }), K.soll(IN, 1, "an 20 Orten", { key: "orte", rel: "≥", zahl: 20 })],
                // der Zeuge: der Fächer fragte 20 Orte, und die Deklination ändert sich mit dem Ort (der zweite Satz der Sprosse)
                zeuge: zMin({ adressen: 20, orte: 20, deklinationen: 2 }),
                taeter: "Leser fehlt: planet-core.js:264 PLANET_ERDE ohne Dipol; voxel-worker.js:1446 planetOrtAuftrag ohne Feld; kein Kompass im Stamm",
                leser: "voxel-worker.js:1446 planetOrtAuftrag antwortet mit Höhe, Küste und Delta (Klima, Meer, Wetter, Wuchs, Eis, Wildnis) — kein Feld; planet-core.js:264 PLANET_ERDE trägt kein Feld (Dipol, Pol, Stärke); kein Leser eines Kompasses mit Deklination und Inklination",
                gruen: gut({ inklinationAbwGrad: 2, orte: 20 }, { adressen: 20, orte: 20, deklinationen: 20 }),
                attrappen: [
                    { name: "die Dipol-Formel statt der Welt", roh: leer({ inklinationAbwGrad: 2, orte: 20 }) },
                    { name: "EIN Ort trägt das Maß", roh: gut({ inklinationAbwGrad: 2, orte: 1 }, { adressen: 20, orte: 1, deklinationen: 1 }) },
                    { name: "der Pol auf der Drehachse: die Deklination ist überall 0", roh: gut({ inklinationAbwGrad: 2, orte: 20 }, { adressen: 20, orte: 20, deklinationen: 1 }) },
                ],
                proben: [
                    { name: "der Planet ohne Feld: 20 Orte ohne Fähigkeit (ROT beim Leser)", roh: { werte: { inklinationAbwGrad: null, orte: 0 }, zeuge: { adressen: 20, orte: 0, deklinationen: 0, ohneFeld: 20 }, taeter: "Leser fehlt: kein Feld" } },
                    { name: "das Feld 12° neben dem Dipol", roh: gut({ inklinationAbwGrad: 12, orte: 20 }, { adressen: 20, orte: 20, deklinationen: 20 }) },
                ],
            },
            2: {
                u: {},
                soll: [K.soll(IN, 2, "Streifen spiegelsymmetrisch in ≥ 90 % der Saaten", { key: "symProzent", einheit: "%" })],
                zeuge: zMin({ antworten: 100 }),
                taeter: "planet-core.js (kein Feld, keine Umpolung)",
                nicht: "keine Umpolung",
                leser: "planet-core.js:1218 punktKern trägt das Ozean-Alter, aber keine Feldgeschichte (Polarität) je Alter; der Faden gibt das Alter nicht weiter (voxel-worker.js:1175)",
                gruen: gut({ symProzent: 93 }, { antworten: 3000 }),
                attrappen: [{ name: "die Streifen aus dem Alter gemalt", roh: leer({ symProzent: 93 }) }],
            },
            3: {
                u: {},
                soll: [K.soll(IN, 3, "≥ 95 % der Geysire über Anomalien", { key: "geysirProzent", einheit: "%" })],
                zeuge: zMin({ antworten: 100, geysirLeser: 1 }),
                taeter: "kein Wärmefluss in Welt und Planet",
                nicht: "kein Geysir",
                leser: "gelaende-core.js:1344 temperaturAus liest Luft, Saison und Wetter, keinen Wärmefluss aus der Tiefe; kein Leser eines Geysirs",
                gruen: gut({ geysirProzent: 97 }, { antworten: 100, geysirLeser: 1 }),
                attrappen: [{ name: "Geysire auf Anomalien gesetzt", roh: leer({ geysirProzent: 97 }) }],
            },
            4: {
                u: {},
                soll: [
                    K.soll(IN, 4, "Bohrloch-Temperatur folgt dem Gradienten ±20 %", { key: "gradientKjeKm", ref: 27.5, refQuelle: "Erde: geothermischer Gradient 25–30 K/km (die Tiefe der Sprosse; Mitte 27,5 K/km)", einheit: "K/km" }),
                    K.soll(IN, 4, "Stollen 10 km ohne Naht", { key: "stollenKm", rel: "≥", zahl: 10, einheit: "km" }),
                ],
                zeuge: zMin({ antworten: 5, tiefeM: 10000 }),
                taeter: "stamm/bild-himmel.js _temperaturAt (die Luft-Rampe unter dem Boden) und der Boden der Welt (floorDrop)",
                nicht: "kein Stollen von 10 km, kein Wärmefluss",
                leser: "stamm/bild-himmel.js:2874 _temperaturAt rechnet unter dem Boden die Höhen-Rampe der Luft weiter, kein geothermischer Gradient; stamm/gelaende-boden.js:1078 floorDrop: die Welt endet bei Basis − floorDrop",
                gruen: gut({ gradientKjeKm: 28, stollenKm: 10.5 }, { antworten: 5, tiefeM: 10500 }),
                attrappen: [{ name: "der Gradient der Erde eingesetzt, keine Tiefe", roh: gut({ gradientKjeKm: 28, stollenKm: 10.5 }, { antworten: 5, tiefeM: 135 }) }],
            },
            5: {
                u: {},
                soll: [
                    K.soll(IN, 5, "Kern-Mantel-Grenze bei 0,5–0,6 Radius", { key: "kmgRadius" }),
                    K.soll(IN, 5, "Flug durch den Schnitt ohne Bild > 100 ms", { key: "bildMsMax", rel: "≤", zahl: 100, einheit: "ms" }),
                ],
                zeuge: zMin({ antworten: 100, schnittLeser: 1 }),
                taeter: "planet-core.js (Kruste und Platten, kein Inneres)",
                nicht: "kein Schnitt, keine Schalen",
                leser: "planet-core.js:263 PLANET_ERDE trägt radiusKm, g und Wasser, keine Schalen (Kern, Mantel, Dichte); kein Leser eines Schnitts",
                gruen: gut({ kmgRadius: 0.55, bildMsMax: 40 }, { antworten: 1000, schnittLeser: 1 }),
                attrappen: [{ name: "das PREM-Modell als Zahl", roh: leer({ kmgRadius: 0.55, bildMsMax: 40 }) }],
            },
            6: {
                u: { augeBis: 7 },
                soll: [K.soll(IN, 6, "erstarrter Kern → kein Feld in ≥ 95 %", { key: "keinFeldProzent", einheit: "%" }), K.soll(IN, 6, "Ursachen-Probe an 1 000 Saaten", { key: "saaten", rel: "≥", zahl: 1000 })],
                zeuge: zMin({ antworten: 1000 }),
                auge: { pose: "Orbitbild je Saat (heute nicht erzeugbar; geschossen im Überflug 1 800 m über dem Spawn)", vorbild: "Ursachen-Probe R10: Feldstärke aus Kern und Rotation (Sondenmessungen Merkur, Mars, Ganymed)" },
                taeter: "voxel-worker.js planetPlanVon (PLANET_ERDE, kein Kern)",
                nicht: "kein Feld, kein Kern, keine fremde Welt",
                leser: "voxel-worker.js:1159 PLANET_ERDE — planetPlanVon rechnet jeden Samen auf PLANET_ERDE (planet-core.js:263 PLANET_ERDE ohne Kern und Rotation des Felds)",
                gruen: gut({ keinFeldProzent: 97, saaten: 1000 }, { antworten: 1000 }),
                attrappen: [{ name: "die Regel ohne Welten", roh: leer({ keinFeldProzent: 97, saaten: 1000 }) }],
            },
        },
    };

    // ════════════════════════════════════════ EINSCHLAG ════════════════════════════════════════
    const einschlag = {
        sek: 24,
        faecher: true,
        pfad: ["planet-core.js", "voxel-worker.js", "gelaende-core.js", "stamm/gelaende-*.js", "scripts/werkbank.cjs"],
        ungefahren: "das Blindpaar gegen das Kraterfoto urteilt nur am Gerät; der Napf im Bild an der schlechtesten Adresse ebenso",
        mess: async function (H, U, M) {
            const r3 = (x) => (Number.isFinite(x) ? Math.round(x * 1000) / 1000 : null);
            const med = (v) => {
                const b = v.filter(Number.isFinite).sort((x, y) => x - y);
                return b.length ? (b.length % 2 ? b[(b.length - 1) / 2] : (b[b.length / 2 - 1] + b[b.length / 2]) / 2) : null;
            };
            // S1 ÜBER DEN FÄCHER (stationen/faecher.js): die Reise-Welten an den Land-Lagen des Planeten (der Weg der Geburt: der Faden
            // planet-ort, stamm/gelaende-boden.js:1649 `_reiseSaat` → gelaende-core lageAus) und die Heimat, je Welt ein Gitter von Orten;
            // je Adresse die Höhe, die der Wirt liest (gelaende-core.js:2821 `hoehe`, Leser stamm/gelaende-boden.js:810
            // `_terrainMacroSurfaceY`): vom Ort bergab bis zur Senke, dort das Ringprofil in 16 Richtungen — ein Napf ist eine Senke,
            // deren Ring auf jedem Radius über ihr UND über dem Außenring liegt (der Rand); Tiefe/Durchmesser und das Profil gegen die
            // Parabel des einfachen Kraters (Pike 1977) urteilen nur an Näpfen
            const NAPF_AN = async (r, T, a, mit) => {
                const K = globalThis.__gelaendeCore;
                const C = window.__napfLagen || (window.__napfLagen = {});
                if (!(a.saat in C)) {
                    if (a.saat === "heim") C[a.saat] = { L: r._gelaende(), wl: r.state.waterLevel, saat: r._gelaende().seed };
                    else {
                        await r._fadenQuelle();
                        const k = a.saat, breite = (Math.asin(((k * 0.6180339887) % 1) * 2 - 1) * 180) / Math.PI, laenge = ((k * 137.508) % 360) - 180;
                        const o = await r._planetAuftrag({ type: "planet-ort", samen: r._planetSamen(), breite, laenge, zeitMa: 0 });
                        if (!o || !o.land) C[a.saat] = null;
                        else {
                            const heim = r.constructor._weltGesetz(r.state.worldMeta).gelaende;
                            const ort = { samen: o.samen, version: o.version, breite: o.breite, laenge: o.laenge, zeitMa: o.zeitMa, delta: o.delta };
                            const O = K.ortGesetz(ort), eg = K.erbgutNormal(K.ortErbgut(K.erbgutNormal(heim == null ? undefined : heim), o.delta.wildnis));
                            const saat = r._reiseSaat(ort, heim), wl = K.GRUND.basis - O.meerUnterBasisM;
                            C[a.saat] = { saat, wl, L: K.lageAus({ seed: saat, baseHeight: K.GRUND.basis, waterLevel: wl, ort, erbgut: { terme: eg, wildnis: eg[0] && eg[0].art === "wildnis" ? 1 : 0 }, regionSize: K.GRUND.kachel }, SimplexNoise) };
                        }
                    }
                }
                const W = C[a.saat];
                if (!W) return { meer: true };
                let rufe = 0;
                const h = (x, z) => (rufe++, K.hoehe(W.L, x, z, true));
                const n = mit.gitter, x0 = ((a.ort % n) - (n - 1) / 2) * mit.abstandM, z0 = (Math.floor(a.ort / n) - (n - 1) / 2) * mit.abstandM;
                let x = x0, z = z0, h0 = h(x, z);
                for (let i = 0; i < mit.schritte; i++) {
                    let b = null;
                    for (let q = 0; q < 8; q++) {
                        const w = (q * Math.PI) / 4, hx = h(x + mit.schrittM * Math.cos(w), z + mit.schrittM * Math.sin(w));
                        if (hx < h0 && (!b || hx < b[2])) b = [x + mit.schrittM * Math.cos(w), z + mit.schrittM * Math.sin(w), hx];
                    }
                    if (!b) break;
                    [x, z, h0] = b;
                }
                let best = null;
                for (const R of mit.radien) {
                    const ring = [], aussen = [], prof = [[], [], []];
                    for (let q = 0; q < 16; q++) {
                        const w = (q * Math.PI) / 8, c = Math.cos(w), s = Math.sin(w);
                        ring.push(h(x + R * c, z + R * s));
                        aussen.push(h(x + 1.6 * R * c, z + 1.6 * R * s));
                        [0.25, 0.5, 0.75].forEach((f, j) => prof[j].push(h(x + f * R * c, z + f * R * s)));
                    }
                    const d = ring.reduce((u, v) => u + v, 0) / 16 - h0;
                    const rand = ring.every((v, q) => v > h0 && v > aussen[q]);
                    const dD = d / (2 * R);
                    if (rand && dD >= mit.dDmin && (!best || dD > best.dD)) {
                        const abw = [0.25, 0.5, 0.75].map((f, j) => Math.abs((prof[j].reduce((u, v) => u + v, 0) / 16 - h0) / d - f * f));
                        best = { R, dD, profilAbw: (100 * abw.reduce((u, v) => u + v, 0)) / 3 };
                    }
                }
                return { saat: W.saat, senke: true, napf: !!best, dD: best ? best.dD : null, profilAbw: best ? best.profilAbw : null, radiusM: best ? best.R : null, x: Math.round(x), z: Math.round(z), hM: Math.round(h0 * 10) / 10, unterWasser: h0 < W.wl, rufe };
            };
            const RF = await FAECHER((c) => H.seite(c), {
                gesetz: { fn: NAPF_AN, export: "gelaende-core.js:2821 hoehe (Reise-Welt aus gelaende-core.js:6069 lageAus)", leser: "stamm/gelaende-boden.js:810 _terrainMacroSurfaceY" },
                adressen: { saaten: Array.from({ length: U[1].saaten }, (_, i) => i + 1), orte: Array.from({ length: U[1].gitter * U[1].gitter }, (_, j) => j), dazu: Array.from({ length: U[1].gitter * U[1].gitter }, (_, j) => ({ saat: "heim", ort: j, zeit: null })) },
                mit: { gitter: U[1].gitter, abstandM: U[1].abstandM, schrittM: U[1].schrittM, schritte: U[1].schritte, radien: U[1].radien, dDmin: U[1].dDmin },
                ms: U[1].ms,
                masse: {
                    senken: { wie: "anzahl", nur: (a, w) => !!w.senke },
                    naepfe: { wie: "anzahl", nur: (a, w) => !!w.napf },
                    welten: { wie: "verschieden", feld: "saat", nur: (a, w) => !!w.senke },
                    rufe: { wie: "summe", feld: "rufe" },
                    dD: { wie: (v) => med(v), feld: "dD", nur: (a, w) => !!w.napf },
                    profil: { wie: (v) => med(v), feld: "profilAbw", nur: (a, w) => !!w.napf },
                },
                schlecht: { feld: "hM", richtung: "min" },
                pose: (a, w) => "Ego am Rand der tiefsten Senke der Reise-Welt " + w.saat + " bei " + w.x + "/" + w.z + " (" + w.hM + " m), Blick in sie",
                ungemessen: ["der Napf im Bild gegen das Kraterfoto (am Gerät)"],
            });
            const W1 = RF.werte;
            const s1 = {
                werte: { tiefeDurchmesser: r3(W1.dD), profilAbwProzent: r3(W1.profil) },
                zeuge: { antworten: W1.rufe || 0, senken: W1.senken || 0, naepfe: W1.naepfe || 0, welten: W1.welten || 0, adressen: RF.adressen, gerissen: RF.gerissen, ms: RF.ms },
            };
            if (!W1.naepfe) s1.taeter = "planet-core.js:1389 punktKern und gelaende-core.js:2821 hoehe tragen keinen Krater-Term: " + (W1.senken || 0) + " Senken in " + (W1.welten || 0) + " Welten, bergab gesucht, " + (W1.naepfe || 0) + " Näpfe mit Rand (Tiefe/Durchmesser ≥ " + U[1].dDmin + ") · " + RF.akte;
            else s1.zeuge.akte = RF.akte.slice(0, 600);
            const e = await H.seite(
                "const namen = new Set(); for (let p = r; p && p !== Object.prototype; p = Object.getPrototypeOf(p)) for (const n of Object.getOwnPropertyNames(p)) namen.add(n); const L = [...namen]; " +
                    "await r._fadenQuelle(); const o = await r._planetAuftrag({ type: \"planet-ort\", samen: r._planetSamen(), breite: 10, laenge: 20, zeitMa: 0 }); " +
                    "const G = globalThis.__gelaendeCore; return { leser: L.filter((n) => /krater|crater|einschlag|impakt|impact|meteor|asteroid|bolid/i.test(n)), kern: Object.keys(G).filter((n) => /krater|crater|einschlag|impakt/i.test(n)), ort: Object.keys(o).sort().join(\",\"), delta: Object.keys(o.delta.wildnis).sort().join(\",\") };"
            );
            const bild = await Promise.race([
                M.auge("geologie-einschlag", { px: 0, py: 1800, pz: 2600, lx: 0, ly: 0, lz: -2600 }),
                new Promise((f) => setTimeout(() => f({ bild: null, grund: "kein Bild im Deckel der Leiter" }), Math.max(500, (U[2].augeBis - M.uhr()) * 1000))),
            ]);
            const kein = "kein Krater: " + (e.leser.length || e.kern.length ? "Leser " + e.leser.concat(e.kern).join(", ") : "0 Leser eines Einschlags in Welt und Gelände-Kern") + "; der Faden antwortet mit " + e.ort + " (wildnis " + e.delta + ") — die „Krater“ im Code sind Grab-Taten des Spielers";
            const je = {};
            for (const nr of [2, 3, 4, 5, 6, 7]) je[nr] = { werte: {}, zeuge: { antworten: 2, leser: e.leser.length + e.kern.length }, nicht: kein };
            je[1] = s1;
            je[2].auge = bild;
            return { sprossen: je };
        },
        sprossen: {
            1: {
                u: { saaten: 24, gitter: 4, abstandM: 6000, schrittM: 80, schritte: 60, radien: [40, 80, 160, 320, 640, 1280], dDmin: 0.02, ms: 16000 },
                soll: [
                    K.soll(EI, 1, "einfache Krater Tiefe/Durchmesser 1:5 ±20 %", { key: "tiefeDurchmesser", ref: 0.2, refQuelle: "Mond und Erde: einfache Krater d/D ≈ 1:5 (Pike 1977; Melosh 1989)" }),
                    K.soll(EI, 1, "Profil gegen reale Krater ≤ 15 %", { key: "profilAbwProzent", einheit: "%" }),
                ],
                // der Zeuge: der Fächer hat die Höhe gefragt (Rufe), an Senken mehrerer Welten, und ≥ 5 Näpfe tragen das Maß
                zeuge: zMin({ antworten: 1000, senken: 20, welten: 3, naepfe: 5 }),
                taeter: "planet-core.js:1389 punktKern und gelaende-core.js:2821 hoehe (kein Krater-Term)",
                leser: "stamm/gelaende-boden.js:810 _terrainMacroSurfaceY liest gelaende-core.js:2821 hoehe; planet-core.js:1389 punktKern summiert Boden, Profil, Mantel, Schablone, Trapp, Orogen, Kegel — keinen Krater",
                unklar: "„Profil gegen reale Krater“ gelesen als die mittlere Abweichung des normierten Ringprofils (r/R = ¼, ½, ¾) von der Parabel des einfachen Kraters (Pike 1977) — ein Korpus realer Profile (LOLA, Barringer) ist nicht eingefroren",
                gruen: gut({ tiefeDurchmesser: 0.19, profilAbwProzent: 9 }, { antworten: 40000, senken: 300, welten: 12, naepfe: 40 }),
                attrappen: [
                    { name: "die Napf-Form gegraben, kein Einschlag", roh: leer({ tiefeDurchmesser: 0.19, profilAbwProzent: 9 }) },
                    { name: "EIN Napf trägt das Maß", roh: gut({ tiefeDurchmesser: 0.19, profilAbwProzent: 9 }, { antworten: 40000, senken: 300, welten: 12, naepfe: 1 }) },
                    { name: "der Fächer las nur die Heimat", roh: gut({ tiefeDurchmesser: 0.19, profilAbwProzent: 9 }, { antworten: 40000, senken: 16, welten: 1, naepfe: 6 }) },
                ],
                proben: [{ name: "die Welt ohne Krater: 0 Näpfe, das Maß ungemessen (ROT beim Täter)", roh: { werte: { tiefeDurchmesser: null, profilAbwProzent: null }, zeuge: { antworten: 9000, senken: 380, welten: 11, naepfe: 0 }, taeter: "kein Krater-Term" } }],
            },
            2: {
                u: { augeBis: 5 },
                soll: [K.soll(EI, 2, "Krater-Durchmesser gegen Energie nach Pi-Skalierung ±30 %", { key: "durchmesserVerh", ref: 1, refQuelle: "Pi-Skalierung nach Holsapple & Schmidt (1987): gemessener ÷ vorhergesagter Durchmesser = 1" })],
                zeuge: zMin({ antworten: 10, leser: 1 }),
                auge: { pose: "Ego am Kraterrand nach dem Einschlag (heute nicht erzeugbar; geschossen im Überflug über dem Spawn)", vorbild: "Kraterfotos (Meteor Crater, Barringer), Blindpaar R11" },
                taeter: "kein Einschlag als Ereignis in der Welt",
                nicht: "kein Einschlag als Ereignis",
                leser: "stamm/feld-leben.js:2626 _tatSchreiben kennt Taten des Spielers (Lava, Brand, Grab), kein Einschlag mit Energie",
                gruen: gut({ durchmesserVerh: 1.1 }, { antworten: 20, leser: 1 }),
                attrappen: [{ name: "der Durchmesser aus der Formel", roh: leer({ durchmesserVerh: 1.1 }) }],
            },
            3: {
                u: {},
                soll: [K.soll(EI, 3, "N(> D) ∝ D^−2 ±0,5", { key: "exponent", ref: -2, refQuelle: "Mond: kumulative Kratergrößen-Verteilung N(>D) ∝ D^−2 (Neukum 1983; Hartmann 2005)" })],
                zeuge: zMin({ antworten: 100, leser: 1 }),
                taeter: "planet-core.js punktKern (kein Kraterfeld)",
                nicht: "kein Kraterfeld",
                leser: "planet-core.js:1218 punktKern — kein Krater-Term, keine Größen-Häufigkeit",
                gruen: gut({ exponent: -2.1 }, { antworten: 500, leser: 1 }),
                attrappen: [{ name: "der Exponent gesetzt", roh: leer({ exponent: -2.1 }) }],
            },
            4: {
                u: {},
                soll: [K.soll(EI, 4, "Rate je Größe gegen die Einschlags-Statistik der Erde ±Faktor 2", { key: "faktor", rel: "≤", zahl: 2 })],
                zeuge: zMin({ antworten: 1000, leser: 1 }),
                taeter: "planet-core.js planetPlan (keine Kleinkörper)",
                nicht: "keine Einschlagsrate",
                leser: "planet-core.js:307 planetPlan trägt keine Kleinkörper der Saat und keine Rate je Größe",
                gruen: gut({ faktor: 1.5 }, { antworten: 1000, leser: 1 }),
                attrappen: [{ name: "die Rate nach Bland & Artemieva abgeschrieben", roh: leer({ faktor: 1.5 }) }],
            },
            5: {
                u: {},
                soll: [K.soll(EI, 5, "1 000 Saaten", { key: "saaten", rel: "≥" }), K.soll(EI, 5, "Rang ≥ 0,7", { key: "rang" })],
                zeuge: zMin({ antworten: 1000, leser: 1 }),
                taeter: "planet-core.js punktKern (kein Krater, nichts zu löschen)",
                nicht: "keine Krater, die Erosion und Tektonik löschen",
                leser: "planet-core.js:1218 punktKern — kein Krater-Term, den Wetter und Tektonik tilgen könnten",
                gruen: gut({ saaten: 1000, rang: 0.75 }, { antworten: 100000, leser: 1 }),
                attrappen: [{ name: "der Rang ohne Saaten", roh: leer({ saaten: 1000, rang: 0.75 }) }],
            },
            6: {
                u: {},
                soll: [K.soll(EI, 6, "Kraterdichte im Bild gegen das wahre Alter der Fläche ±Faktor 2", { key: "faktor", rel: "≤", zahl: 2 }), K.soll(EI, 6, "Rang ≥ 0,8", { key: "rang" })],
                zeuge: zMin({ antworten: 1000, leser: 1 }),
                taeter: "planet-core.js punktKern (keine Kraterdichte)",
                nicht: "keine Kraterchronologie",
                leser: "planet-core.js:1218 punktKern — die Oberfläche trägt ein Alter (Ozean-Boden, Orogen), aber keine Kraterdichte daraus",
                gruen: gut({ faktor: 1.6, rang: 0.85 }, { antworten: 1000, leser: 1 }),
                attrappen: [{ name: "die Dichte aus dem Alter gerechnet", roh: leer({ faktor: 1.6, rang: 0.85 }) }],
            },
            7: {
                u: {},
                soll: [K.soll(EI, 7, "1 000 Welten", { key: "welten", rel: "≥" }), K.soll(EI, 7, "Rang ≥ 0,8", { key: "rang" })],
                zeuge: zMin({ antworten: 1000, leser: 1 }),
                taeter: "voxel-worker.js planetPlanVon (PLANET_ERDE, keine Atmosphäre und Kleinkörper je Saat)",
                nicht: "keine Welt außer der Erde, kein Krater",
                leser: "voxel-worker.js:1159 PLANET_ERDE — planetPlanVon rechnet jeden Samen auf PLANET_ERDE",
                gruen: gut({ welten: 1000, rang: 0.85 }, { antworten: 100000, leser: 1 }),
                attrappen: [{ name: "der Rang ohne Welten", roh: leer({ welten: 1000, rang: 0.85 }) }],
            },
        },
    };

    // gebirge fährt zuerst: ihre Stichprobe (100 Saaten über den Faden) tragen auch die Sprossen der Leiter platten
    return { leitern: { [GE]: gebirge, [PL]: platten, [VU]: vulkan, [UW]: unterwelt, [LA]: lagerstaette, [IN]: inneres, [EI]: einschlag } };
})());

// ── DIE PERSPEKTIVE planet.relief (4 Leitern, 28 Sprossen; grossform S1 trägt die Station g1.js LAEUFE_SITZUNG) ──────────────────
// Die Leser des Spiels: das Gelände-Gesetz (`globalThis.__gelaendeCore`: hoehe · flussLaeufe · flussBreite · maeanderZahl ·
// schichtOrt · schichtMessung · felsLage), die Welt am Ort (`r._voxelSurfaceY` · `_terrainMaterialAt` · `_feuchteAt` · `_bodenKlasseAt` ·
// `_nassAt` · die Hydro-Kacheln), und der Planet-Faden (`r._planetAuftrag` planet-ort, stamm/gelaende-chunks.js:643 → voxel-worker.js
// planetOrtAuftrag:1175) — derselbe Weg wie die Reise (stamm/feld-leben.js:1286). DIE SAATEN: je Lage des Planeten (Land) die Welt der
// Reise, wie die Geburt sie baut (stamm/netz-portal.js:681 `_reiseSaat` → gelaende-core ortSaatWahl: die erste Ort-Saat mit Grund, ihr
// Erbgut `ortErbgut` der Heimat + Δ, `lageAus` am Grund `GRUND`) — die Station ruft den Kern, rechnet nie seine Formel nach.
L.perspektive("relief", (() => {
    const GF = "planet.relief.grossform";
    const FS = "planet.relief.formschatz";
    const BO = "planet.relief.boden";
    const WA = "planet.relief.wandel";
    const PFAD = ["gelaende-core.js", "planet-core.js", "voxel-worker.js", "stamm/gelaende-*.js", "stamm/wasser-*.js", "stamm/netz-portal.js", "stamm/feld-leben.js", "stamm/vegetation-wiese.js", "stamm/kreatur-leben.js", "scripts/werkbank.cjs"];
    // DER ZEUGE DER WELT: jede genannte Zahl in `roh.zeuge` hält ihr Mindestmaß (Antworten der Welt, Streuung, vor ≠ nach) — eine
    // Attrappe, die nur den Wortlaut der werte trägt, fällt hier
    const zMin = (spec) => (roh) => {
        const z = (roh && roh.zeuge) || {};
        for (const [k, min] of Object.entries(spec)) if (!(typeof z[k] === "number" && z[k] >= min)) return "die Welt antwortete nicht: " + k + " " + (z[k] === undefined ? "fehlt" : z[k]) + " (Soll ≥ " + min + ")";
        return null;
    };
    const gut = (werte, zeuge) => ({ werte, zeuge });
    const leer = (werte) => ({ werte, zeuge: {} });
    // DER RICHTER OHNE ZAHL: K.soll fasst ihn nicht — das Wort steht wörtlich, der Vergleich „gegen“ hält nie (kein GRÜN ohne Schwelle)
    const ohneZahl = (id, nr, wort, key) => {
        const r = K.sprosseVon(id, nr).richter;
        if (!r.includes(wort)) throw new Error("Soll „" + wort + "“ steht nicht wörtlich im Richter " + id + " S" + nr);
        return { wort, key, rel: "gegen", a: "die Referenz (der Richter nennt keine Schwelle)", einheit: "" };
    };

    // ════════════════════════════════════════ GROSSFORM (S2–S7; S1 trägt g1.js LAEUFE_SITZUNG) ════════════════════════════════════════
    const grossform = {
        sek: 50,
        pfad: PFAD,
        ungefahren: "die Bilder (Luftbild 2 km, Orbit) schießt die Probe nur am Gerät; die Fernsicht 10/30 km des Preises misst die Maschine",
        mess: async function (H, U, M) {
            const KOPF = `
const K = globalThis.__gelaendeCore;
const samen = r._planetSamen();
await r._fadenQuelle();
const heim = r.constructor._weltGesetz(r.state.worldMeta).gelaende;
const R3 = (v) => (Number.isFinite(v) ? Math.round(v * 1000) / 1000 : null);
const ortVon = (o) => ({ samen: o.samen, version: o.version, breite: o.breite, laenge: o.laenge, zeitMa: o.zeitMa, delta: o.delta });
const lage = (o) => { const ort = ortVon(o); const O = K.ortGesetz(ort); const eg = K.erbgutNormal(K.ortErbgut(K.erbgutNormal(heim == null ? undefined : heim), o.delta.wildnis)); const saat = K.ortSaatWahl(ort, eg, SimplexNoise).saat; return { saat, O, L: K.lageAus({ seed: saat, baseHeight: K.GRUND.basis, waterLevel: K.GRUND.basis - O.meerUnterBasisM, ort, erbgut: { terme: eg, wildnis: eg[0] && eg[0].art === "wildnis" ? 1 : 0 }, regionSize: K.GRUND.kachel }, SimplexNoise) }; };
const lagePunkt = (k) => [Math.round((Math.asin(((k * 0.6180339887) % 1) * 2 - 1) * 180) / Math.PI * 100) / 100, Math.round((((k * 137.508) % 360) - 180) * 100) / 100];
const landOrte = async (n, zeitMa, sam) => { const aus = []; for (let k0 = 0; aus.length < n && k0 < 40 * n; k0 += 24) { const a = await Promise.all(Array.from({ length: 24 }, (_, i) => { const p = lagePunkt(k0 + i); return r._planetAuftrag({ type: "planet-ort", samen: sam || samen, breite: p[0], laenge: p[1], zeitMa: zeitMa || 0 }); })); for (const o of a) if (o.land && aus.length < n) aus.push(o); } return aus; };
const kenn = (L, w) => {
const lf = K.flussLaeufe(L, -w, -w, w, w, 100);
const key = (x, z) => Math.round(x) + "," + Math.round(z);
const ab = new Map(), k0 = [], px = [], py = [];
for (const l of lf) { let cum = 0; for (let i = 0; i < l.glieder.length; i++) { const g = l.glieder[i], b = g.bahn; cum += b && b.length ? b[b.length - 1].s : Math.hypot(g.bx - g.ax, g.bz - g.az); const nA = i + 1 < l.glieder.length ? l.glieder[i + 1].A : 0; if (l.quelle && nA > 0) { px.push(Math.log(nA)); py.push(Math.log(cum)); } ab.set(key(g.ax, g.az), [key(g.bx, g.bz), g.bx, g.bz, l.ende === "muendung" && i === l.glieder.length - 1]); if (l.k === 0) k0.push([key(g.ax, g.az), g.ax, g.az]); } }
let hack = null;
if (px.length > 5) { const mx = px.reduce((s, v) => s + v, 0) / px.length, my = py.reduce((s, v) => s + v, 0) / py.length; let sxy = 0, sxx = 0; for (let i = 0; i < px.length; i++) { sxy += (px[i] - mx) * (py[i] - my); sxx += (px[i] - mx) * (px[i] - mx); } hack = sxx > 0 ? sxy / sxx : null; }
const unten = new Map();
for (const [k, v] of ab) { let d = v[0]; if (!ab.has(d) && v[3] && k0.length) { let best = null, bd = Infinity; for (const q of k0) { const e = Math.hypot(q[1] - v[1], q[2] - v[2]); if (e < bd) { bd = e; best = q[0]; } } d = best; } unten.set(k, ab.has(d) && d !== k ? d : null); }
const oben = new Map();
for (const [k, d] of unten) if (d) { if (!oben.has(d)) oben.set(d, []); oben.get(d).push(k); }
const ord = new Map();
const ordnung = (k) => { if (ord.has(k)) return ord.get(k); ord.set(k, 1); const o = oben.get(k) || []; let m = 0, c = 0; for (const u of o) { const x = ordnung(u); if (x > m) { m = x; c = 1; } else if (x === m) c++; } const w2 = o.length ? (c >= 2 ? m + 1 : m) : 1; ord.set(k, w2); return w2; };
for (const k of unten.keys()) ordnung(k);
const N = [];
for (const [k, d] of unten) { const o = ord.get(k); if (!d || ord.get(d) !== o) N[o] = (N[o] || 0) + 1; }
const rb = [];
for (let o = 1; o + 1 < N.length; o++) if (N[o] && N[o + 1]) rb.push(N[o] / N[o + 1]);
return { laeufe: lf.length, hack, bif: rb.length ? Math.exp(rb.reduce((s, v) => s + Math.log(v), 0) / rb.length) : null, ordnungen: N.length - 1, paare: px.length, lf };
};
`;
            const R3 = (v) => (Number.isFinite(v) ? Math.round(v * 1000) / 1000 : null);
            const mittel = (a) => (a.length ? a.reduce((s, x) => s + x, 0) / a.length : NaN);
            const streu = (a) => (a.length > 1 ? Math.sqrt(mittel(a.map((x) => (x - mittel(a)) ** 2))) : 0);
            const med = (a) => (a.length ? a.slice().sort((p, q) => p - q)[a.length >> 1] : NaN);
            const ziel = Object.keys(U);
            const aus = M.teil || {};
            // DIE SAATEN DES NETZES (S2 20 Lagen, 10 × 10 km; S5 10 Lagen, 30 × 30 km) und DER HANG (S3 50 Lagen, 100 × 100 km, 9 Felder
            // je 5 × 5 Punkte im 30-m-Raster): alles aus dem Gelände-Gesetz der Reise-Welt am Ort
            const w = await H.seite(KOPF + `
const t0 = performance.now();
const aus = { sicht: R3(r.state.camera && r.state.camera.far) };
const orte = await landOrte(50, 0);
aus.orte = orte.length;
aus.s2 = [];
for (const o of orte.slice(0, 20)) { const x = lage(o); const k = kenn(x.L, 5000); aus.s2.push([R3(k.hack), R3(k.bif), k.laeufe, k.ordnungen, k.paare]); }
aus.s2Ms = Math.round(performance.now() - t0);
aus.s5 = [];
for (const o of orte.slice(20, 30)) { const x = lage(o); const lf = K.flussLaeufe(x.L, -15000, -15000, 15000, 15000, 400); let see = 0, meer = 0, gross = 0, n = 0; for (const l of lf) { if (l.k !== 0 || !(l.ende === "see" || l.ende === "meer")) continue; const A = l.glieder[l.glieder.length - 1].A; n++; if (l.ende === "see") see += A; else meer += A; if (A > gross) gross = A; } aus.s5.push([n, R3(see / 1e6), R3(meer / 1e6), R3(gross / 1e6), lf.length]); }
aus.s5Ms = Math.round(performance.now() - t0);
aus.s3 = [];
for (const o of orte) {
const x = lage(o), L = x.L, hang = [], hs = [];
for (const cx of [-50000, 0, 50000]) for (const cz of [-50000, 0, 50000]) { const g = []; for (let j = 0; j < 5; j++) for (let i = 0; i < 5; i++) g.push(K.hoehe(L, cx + 30 * i, cz + 30 * j, true)); for (const v of g) if (v > L.waterLevel) hs.push(v); for (let j = 1; j < 4; j++) for (let i = 1; i < 4; i++) { const k = i + 5 * j; if (!(g[k] > L.waterLevel)) continue; hang.push((Math.atan(Math.hypot((g[k + 1] - g[k - 1]) / 60, (g[k + 5] - g[k - 5]) / 60)) * 180) / Math.PI); } }
hang.sort((a, b) => a - b);
const mn = hs.length ? Math.min(...hs) : 0, mx = hs.length ? Math.max(...hs) : 0, mi = hs.reduce((s, v) => s + v, 0) / (hs.length || 1);
aus.s3.push([hang.length, R3(hang[hang.length >> 1]), R3(hang[Math.floor(hang.length * 0.9)]), mx > mn ? R3((mi - mn) / (mx - mn)) : null, R3(x.O.klimaHeute.sommer), R3(x.O.klimaHeute.spendeMm)]);
if (performance.now() - t0 > 30000) break;
}
aus.s3Ms = Math.round(performance.now() - t0);
return aus;
`);
            // DIE KÜSTE (S4) über 10⁵ km² (2,84° × 2,84°, 64 × 64 Antworten des Planet-Fadens, Boxen 1–16) an der ersten Lage am Meer; DIE SEEN in den
            // Hydro-Kacheln der Heimat um den Spawn (Art 2, Komponenten); DIE FORM DES PLANETEN (S6) im Raster 18 × 36 (hoeheM); DER KÖRPER (S7)
            const k = await H.seite(KOPF + `
const t0 = performance.now();
const aus = {};
let kp = null;
for (let k = 0; !kp && k < 600; k++) { const p = lagePunkt(k); if (Math.abs(p[0]) > 60) continue; const o = await r._planetAuftrag({ type: "planet-ort", samen, breite: p[0], laenge: p[1], zeitMa: 0 }); if (Math.abs(o.kuesteKm) < 25) kp = o; }
if (kp) {
const n = 64, dB = 2.84 / n, dL = dB / Math.max(0.2, Math.cos((kp.breite * Math.PI) / 180));
const P = []; for (let j = 0; j < n; j++) for (let i = 0; i < n; i++) P.push(r._planetAuftrag({ type: "planet-ort", samen, breite: R3(kp.breite + (j - n / 2) * dB), laenge: R3(kp.laenge + (i - n / 2) * dL), zeitMa: 0 }));
const G = (await Promise.all(P)).map((x) => (x.land ? 1 : 0));
const kz = [];
for (let j = 0; j < n; j++) for (let i = 0; i < n; i++) { if (!G[i + n * j]) continue; if ([[1, 0], [-1, 0], [0, 1], [0, -1]].some(([a, b]) => i + a >= 0 && j + b >= 0 && i + a < n && j + b < n && !G[i + a + n * (j + b)])) kz.push([i, j]); }
aus.kueste = { lage: [kp.breite, kp.laenge, R3(kp.kuesteKm)], land: G.reduce((s, v) => s + v, 0), zellen: n * n, kz: kz.length, boxen: [1, 2, 4, 8, 16].map((s) => new Set(kz.map(([i, j]) => Math.floor(i / s) + "," + Math.floor(j / s))).size) };
}
aus.kuesteMs = Math.round(performance.now() - t0);
const warte = async (x, z) => { let n = 0; while (r._ensureHydroTilesAround(x, z, 32) && n < 60) { await new Promise((f) => setTimeout(f, 50)); n++; } return n; };
for (const [x, z] of [[0, 0], [-3000, -3000], [3000, -3000], [-3000, 3000], [3000, 3000]]) { if (performance.now() - t0 > 12000) break; await warte(x, z); }
const seen = []; let wf = 0, kacheln = 0;
for (const t of r.state.hydroTiles.values()) {
kacheln++; wf += (t.waterfalls || []).length;
const wk = t.water && t.water.waterKind; if (!wk) continue;
const d = t.dim, vis = new Uint8Array(d * d);
for (let c = 0; c < d * d; c++) { if (wk[c] !== 2 || vis[c]) continue; let n = 0; const st = [c]; vis[c] = 1; while (st.length) { const q = st.pop(); n++; const i = q % d, j = (q / d) | 0; for (const [a, b] of [[1, 0], [-1, 0], [0, 1], [0, -1]]) { const ii = i + a, jj = j + b; if (ii < 0 || jj < 0 || ii >= d || jj >= d) continue; const qq = ii + d * jj; if (!vis[qq] && wk[qq] === 2) { vis[qq] = 1; st.push(qq); } } } seen.push(n * t.cell * t.cell); }
}
aus.seen = { kacheln, flaechenM2: seen.sort((a, b) => b - a), wasserfaelle: wf };
aus.seenMs = Math.round(performance.now() - t0);
const nb = 18, nl = 36, Hg = [];
const Q = []; for (let j = 0; j < nb; j++) for (let i = 0; i < nl; i++) Q.push(r._planetAuftrag({ type: "planet-ort", samen, breite: -85 + j * 10, laenge: -175 + i * 10, zeitMa: 0 }));
for (const o of await Promise.all(Q)) Hg.push(o.hoeheM);
const T = [["FL","FL","FL","FS","FS","VL","VL","VL","PT"],["FL","FL","FS","FS","FS","VL","VL","VL"],["FL","SH","SL","SL","HL","HL","VL"],["SH","SH","SL","SL","SL","HL"],["SH","SH","SP","SL","SL"],["RI","RI","SP","SP"],["RI","RI","RI"],["RI","RI"],["PK"]];
const geo = {}; let zell = 0;
for (let j = 1; j < nb - 1; j++) for (let i = 0; i < nl; i++) { const h = Hg[i + nl * j]; if (!(h > 0)) continue; let lo = 0, hi = 0; for (let b = -1; b <= 1; b++) for (let a = -1; a <= 1; a++) { if (!a && !b) continue; const v = Hg[((i + a + nl) % nl) + nl * (j + b)]; if (v > h + 100) hi++; else if (v < h - 100) lo++; } const c = (T[lo] || [])[hi] || "SL"; geo[c] = (geo[c] || 0) + 1; zell++; }
aus.geo = { zellen: zell, klassen: geo, hoeheStreuM: R3(Math.sqrt(Hg.reduce((s, v) => s + v * v, 0) / Hg.length - (Hg.reduce((s, v) => s + v, 0) / Hg.length) ** 2)) };
const a1 = await r._planetAuftrag({ type: "planet-ort", samen, breite: 30, laenge: 30, zeitMa: 0 });
const a2 = await r._planetAuftrag({ type: "planet-ort", samen, breite: 30, laenge: 30, zeitMa: 0, koerper: { g: 3.71, radiusKm: 3390 } });
const ohne = (x) => JSON.stringify(Object.assign({}, x, { requestId: 0 }));
aus.koerper = { gleich: ohne(a1) === ohne(a2), hoeheM: [R3(a1.hoeheM), R3(a2.hoeheM)] };
aus.ms = Math.round(performance.now() - t0);
return aus;
`);
            // S2: Hack h ∈ [0,5; 0,6] und Bifurkation Rb ∈ [3; 5] im Netz der Saat
            const s2 = (w.s2 || []).filter((x) => x[0] !== null);
            const beide = s2.filter((x) => x[0] >= 0.5 && x[0] <= 0.6 && x[1] >= 3 && x[1] <= 5).length;
            aus[2] = {
                werte: { anteilProzent: s2.length ? R3((100 * beide) / (w.s2 || []).length) : null, hackMedian: R3(med(s2.map((x) => x[0]))), bifMedian: R3(med(s2.filter((x) => x[1] !== null).map((x) => x[1]))), saaten: (w.s2 || []).length, sichtM: w.sicht },
                zeuge: { saaten: (w.s2 || []).length, laeufe: (w.s2 || []).reduce((s, x) => s + x[2], 0), streuung: R3(streu(s2.map((x) => x[0]))), je: w.s2, ms: w.s2Ms },
            };
            // S3: die Hangverteilung je Saat (gemessen); der Wasserstein-Abstand braucht die Erd-Tafel gleichen Klimas (keine in Karte und Welt)
            const s3 = (w.s3 || []).filter((x) => x[0] > 0);
            aus[3] = {
                werte: { saaten: s3.length, hangMedianGrad: R3(med(s3.map((x) => x[1]))), hangP90Grad: R3(med(s3.map((x) => x[2]))), hypsometrieMittel: R3(mittel(s3.filter((x) => x[3] !== null).map((x) => x[3]))) },
                zeuge: { saaten: s3.length, streuung: R3(streu(s3.map((x) => x[1]))), erdTafel: 0, je: (w.s3 || []).slice(0, 12), ms: w.s3Ms },
            };
            // S4: Box-Counting der Küste (log N gegen log s) und die Seen der Heimat (kumulativ, Steigung)
            const kb = k.kueste && k.kueste.boxen;
            let D = null;
            if (kb && kb.every((x) => x > 0)) {
                const xs = [1, 2, 4, 8, 16].map(Math.log), ys = kb.map(Math.log), mx = mittel(xs), my = mittel(ys);
                D = -xs.reduce((s, x, i) => s + (x - mx) * (ys[i] - my), 0) / xs.reduce((s, x) => s + (x - mx) ** 2, 0);
            }
            const sf = (k.seen && k.seen.flaechenM2) || [];
            let c = null;
            if (sf.length >= 10) {
                const xs = sf.map((a) => Math.log(a)), ys = sf.map((_, i) => Math.log(i + 1)), mx = mittel(xs), my = mittel(ys);
                c = -xs.reduce((s, x, i) => s + (x - mx) * (ys[i] - my), 0) / xs.reduce((s, x) => s + (x - mx) ** 2, 0);
            }
            aus[4] = {
                werte: Object.assign({ kuestenZellen: k.kueste ? k.kueste.kz : 0, seen: sf.length }, D !== null ? { kuesteD: R3(D) } : {}, c !== null ? { seenSteigung: R3(c) } : {}),
                zeuge: { kuestenZellen: k.kueste ? k.kueste.kz : 0, skalen: kb ? kb.filter((x) => x > 0).length : 0, seen: sf.length, kueste: k.kueste || null, ms: k.kuesteMs },
                ...(sf.length < 10 ? { nicht: "Seen je Größenklasse: die Hydro-Kacheln der Heimat (" + ((k.seen && k.seen.kacheln) || 0) + " Kacheln um den Spawn) tragen " + sf.length + " Seen — kein Potenzgesetz aus weniger als 10; über 10⁵ km² rechnet die Welt keine Hydrosphäre (stamm/wasser-hydro.js, Kacheln zu 2 048 m nur um den Spieler)" } : {}),
            };
            // S5: endorheische Fläche und größter Strom im 30-km-Fenster je Saat; der Kontinent ist nicht erzeugbar
            const s5 = (w.s5 || []).filter((x) => x[1] + x[2] > 0);
            const endo = s5.map((x) => (100 * x[1]) / (x[1] + x[2]));
            const strom = s5.map((x) => (100 * x[3]) / (x[1] + x[2]));
            const pose5 = { px: 0, py: 2100, pz: -1800, lx: 0, ly: 0, lz: 1200 };
            aus[5] = {
                werte: { saaten: s5.length, endorheischProzent: R3(med(endo)), groessterStromProzent: R3(med(strom)) },
                zeuge: { saaten: s5.length, je: w.s5 },
                auge: await M.auge("relief-grossform-s5", pose5),
                nicht: "Kontinent 10⁶–10⁷ km² nicht erzeugbar: das Netz der Reise-Welt reicht ein Fenster (gemessen 30 × 30 km je Saat), der Planet-Faden trägt kein Abflussnetz (voxel-worker.js:1175 planetOrtAuftrag: land, hoeheM, kuesteKm, Δ)",
            };
            // S6: Geomorphon-Klassen auf dem Raster des Planeten (10°), keine Erd-Tafel; Orbit-Pose fehlt
            const gk = (k.geo && k.geo.klassen) || {};
            aus[6] = {
                werte: { geomorphonKlassen: Object.keys(gk).length, geomorphonZellen: (k.geo && k.geo.zellen) || 0, hoeheStreuM: k.geo && k.geo.hoeheStreuM },
                zeuge: { zellen: (k.geo && k.geo.zellen) || 0, klassen: gk },
                auge: await M.auge("relief-grossform-s6", { ort: "wiese" }),
                nicht: "Planet 5·10⁸ km² mit 100 Saaten nicht erzeugbar: der Planet-Faden antwortet je Punkt (kein Geomorphon-Raster, voxel-worker.js:1175), die Werkbank kennt keine Orbit-Pose (scripts/werkbank.cjs:2110 /bild); das Raster 18 × 36 trägt " + Object.keys(gk).length + " der 10 Klassen",
            };
            // S7: der Körper (Schwere, Radius) im Auftrag des Fadens — gleich ohne und mit: kein Leser der Konstanten
            aus[7] = {
                werte: { welten: k.koerper && k.koerper.gleich ? 0 : 1 },
                zeuge: { welten: k.koerper && k.koerper.gleich ? 0 : 1, koerper: k.koerper },
                nicht: "100 Welten beliebiger Konstanten nicht erzeugbar: der Faden liest den Körper nicht (voxel-worker.js:1176 planetPlanVon(msg.samen) — die Antwort mit Schwere 3,71 und Radius 3 390 km ist byte-gleich der ohne: " + !!(k.koerper && k.koerper.gleich) + ")",
            };
            for (const nr of ziel) aus[nr] = aus[nr] || M.nicht("ungemessen");
            const o = {};
            for (const nr of ziel) o[nr] = aus[nr];
            return { sprossen: o };
        },
        sprossen: {
            2: {
                u: { saaten: 20, fensterKm: 10 },
                soll: [K.soll(GF, 2, "≥ 80 % der Saaten", { key: "anteilProzent", einheit: "%" })],
                zeuge: zMin({ saaten: 20, laeufe: 100, streuung: 1e-6 }),
                zeugeText: "20 Saaten, ihr Netz im 10-km-Fenster gezählt, Hack streut über die Saaten",
                taeter: "gelaende-core.js flussLaeufe (das Netz der Reise-Welt: Hack-Exponent und Bifurkation)",
                gruen: gut({ anteilProzent: 85, hackMedian: 0.56, bifMedian: 4.1, saaten: 20 }, { saaten: 20, laeufe: 11000, streuung: 0.03 }),
                attrappen: [
                    { name: "Hack 0,57 aus Rigon 1996 abgeschrieben (kein Netz gezählt)", roh: leer({ anteilProzent: 100, hackMedian: 0.57, bifMedian: 4 }) },
                    { name: "EINE Saat zwanzigmal (keine Streuung)", roh: gut({ anteilProzent: 100, hackMedian: 0.55, bifMedian: 4 }, { saaten: 20, laeufe: 11000, streuung: 0 }) },
                ],
            },
            3: {
                u: { saaten: 50, fensterKm: 100 },
                soll: [K.soll(GF, 3, "Wasserstein-Abstand der Hangverteilung ≤ 3°", { key: "wassersteinP80Grad", einheit: "°" }), K.soll(GF, 3, "in ≥ 80 %", { key: "anteilProzent", einheit: "%" })],
                zeuge: zMin({ saaten: 50, streuung: 1e-6, erdTafel: 1 }),
                zeugeText: "50 Saaten, ihre Hangverteilung gegen die Erd-Tafel gleichen Klimas",
                taeter: "die Erd-Tafel der Hangverteilung je Klima fehlt (Karte und Welt) · gelaende-core.js hoehe",
                unklar: "die Erd-Referenz „Erd-DEM gleichen Klimas“ steht nicht als Zahl in der Karte — Vorschlag: Hang-Quantile 10/50/90 % und Hypsometrie-Integral je Köppen-Hauptklasse aus SRTM-30 m als Tafel; bis dahin misst die Station die Verteilung und urteilt ROT",
                gruen: gut({ wassersteinP80Grad: 2.4, anteilProzent: 84, saaten: 50 }, { saaten: 50, streuung: 1.2, erdTafel: 1 }),
                attrappen: [
                    { name: "der Abstand ohne Erd-Tafel (gegen sich selbst gerechnet: 0°)", roh: gut({ wassersteinP80Grad: 0, anteilProzent: 100, saaten: 50 }, { saaten: 50, streuung: 1.2, erdTafel: 0 }) },
                    { name: "50 Saaten ohne Antwort der Welt", roh: leer({ wassersteinP80Grad: 2, anteilProzent: 90 }) },
                ],
            },
            4: {
                u: { flaecheKm2: 1e5, raster: 32 },
                soll: [
                    K.soll(GF, 4, "Box-Counting D ±0,05 gegen Erd-Küsten", { key: "kuesteD", ref: 1.25, refQuelle: "Erde: Westküste Großbritanniens D = 1,25 (Richardson 1961, Mandelbrot 1967)" }),
                    K.soll(GF, 4, "Seen je Größenklasse Steigung ±20 %", { key: "seenSteigung", ref: 1, refQuelle: "Erde: kumulative Seen-Größenverteilung N(>A) ∝ A^−c, c ≈ 1 (Downing et al. 2006; Verpoorter et al. 2014)" }),
                ],
                zeuge: zMin({ kuestenZellen: 50, skalen: 4, seen: 10 }),
                zeugeText: "die Küste über 10⁵ km² gezählt (vier Skalen), ≥ 10 Seen der Welt",
                taeter: "planet-core.js planetPunkt (die Küste) · stamm/wasser-hydro.js (Seen nur in den Kacheln um den Spieler)",
                nicht: "Seen über 10⁵ km² nicht erzeugbar (die Hydrosphäre rechnet nur Kacheln um den Spieler)",
                leser: "stamm/gelaende-boden.js:607 _ensureHydroTilesAround — die Hydro-Kacheln (2 048 m) entstehen nur um den Spieler; kein Leser zählt Seen über 10⁵ km²",
                gruen: gut({ kuesteD: 1.23, seenSteigung: 1.05, kuestenZellen: 180, seen: 40 }, { kuestenZellen: 180, skalen: 4, seen: 40 }),
                attrappen: [
                    { name: "D = 1,25 aus Mandelbrot eingesetzt (keine Küste gezählt)", roh: leer({ kuesteD: 1.25, seenSteigung: 1 }) },
                    { name: "die Küste einer Skala (keine Steigung)", roh: gut({ kuesteD: 1.25, seenSteigung: 1 }, { kuestenZellen: 180, skalen: 1, seen: 40 }) },
                ],
            },
            5: {
                u: { saaten: 10, fensterKm: 30 },
                soll: [
                    K.soll(GF, 5, "Fehlerquote ≥ 35 %", { key: "fehlerProzent", einheit: "%" }),
                    K.soll(GF, 5, "endorheische Fläche 10–25 %", { key: "endorheischProzent", einheit: "%" }),
                    K.soll(GF, 5, "größter Strom ≥ 10 % des Abflusses", { key: "groessterStromProzent", einheit: "%" }),
                    K.soll(GF, 5, "10 Saaten", { key: "saaten", rel: "≥" }),
                ],
                auge: { pose: "Luftbild 2,1 km über dem Spawn, Blick nach Norden schräg nach unten", vorbild: "Satellitenbild eines Kontinents gleichen Klimas (Blindpaar, Prüfer-Satz R11)" },
                taeter: "gelaende-core.js flussLaeufe (Fenster statt Kontinent) · voxel-worker.js planetOrtAuftrag (kein Abflussnetz)",
                nicht: "Kontinent 10⁶–10⁷ km² nicht erzeugbar",
                leser: "voxel-worker.js:1175 planetOrtAuftrag — der Faden antwortet je Punkt (land, hoeheM, kuesteKm), kein Abflussnetz über den Kontinent",
                gruen: gut({ fehlerProzent: 40, endorheischProzent: 18, groessterStromProzent: 22, saaten: 10 }, { saaten: 10 }),
                attrappen: [{ name: "das Blindpaar ohne Bild", roh: leer({ fehlerProzent: 40, endorheischProzent: 18, groessterStromProzent: 22, saaten: 10 }) }],
            },
            6: {
                u: { raster: [18, 36] },
                soll: [
                    K.soll(GF, 6, "Geomorphon-Histogramm ±20 % der Erde", { key: "geomorphonJeErde", ref: 1, refQuelle: "Erde: globale Geomorphon-Anteile der 10 Klassen (Jasiewicz & Stepinski 2013, SRTM)" }),
                    K.soll(GF, 6, "Orbit-Blindpaar Fehlerquote ≥ 35 %", { key: "fehlerProzent", einheit: "%" }),
                ],
                auge: { pose: "Orbit über dem Planeten (heute nicht erzeugbar; geschossen an der Wiese)", vorbild: "Orbit-Mosaik der Erde (Blue Marble), Blindpaar R11" },
                taeter: "voxel-worker.js planetOrtAuftrag (kein Raster des Planeten) · scripts/werkbank.cjs /bild (keine Orbit-Pose)",
                nicht: "Planet 5·10⁸ km², keine Geomorphon-Klassen, keine Orbit-Pose",
                leser: "scripts/werkbank.cjs:2110 — /bild kennt keine Pose über der Atmosphäre (Orbit); gelaende-core.js trägt keinen Geomorphon-Klassierer",
                gruen: gut({ geomorphonJeErde: 1.1, fehlerProzent: 38 }, { zellen: 500 }),
                attrappen: [{ name: "das Histogramm der Erde eingesetzt", roh: leer({ geomorphonJeErde: 1, fehlerProzent: 40 }) }],
            },
            7: {
                u: { koerper: { g: 3.71, radiusKm: 3390 } },
                soll: [K.soll(GF, 7, "≥ 80 % der Welten", { key: "anteilProzent", einheit: "%" })],
                zeuge: zMin({ welten: 100 }),
                zeugeText: "100 Welten mit eigenen Konstanten gefahren",
                taeter: "voxel-worker.js planetOrtAuftrag (liest den Körper nicht)",
                nicht: "der Faden liest keine Konstanten",
                leser: "voxel-worker.js:1176 — planetPlanVon(msg.samen) liest nur den Samen; `koerper` (Schwere, Radius) des Auftrags fällt",
                unklar: "„aus ihren Konstanten vorhergesagte Bänder“ nennt kein Band — Vorschlag: Relief-Spanne ∝ 1/g (Weisskopf 1975) ±30 %, Hack 0,5–0,6 unabhängig von g",
                gruen: gut({ anteilProzent: 84 }, { welten: 100 }),
                attrappen: [{ name: "84 % ohne eine Welt", roh: leer({ anteilProzent: 84 }) }],
            },
        },
    };

    // ════════════════════════════════════════ FORMSCHATZ (S1–S8) ════════════════════════════════════════
    const formschatz = {
        sek: 50,
        faecher: true,
        pfad: PFAD,
        ungefahren: "die Ego-Bilder der Blind-Klassifikation (S1, S2, S3, S5, S7) schießt die Probe nur am Gerät",
        mess: async function (H, U, M) {
            const R3 = (v) => (Number.isFinite(v) ? Math.round(v * 1000) / 1000 : null);
            const med = (a) => (a.length ? a.slice().sort((p, q) => p - q)[a.length >> 1] : NaN);
            const ziel = Object.keys(U);
            // JE SAAT (50 Lagen des Planeten, Reise-Welt): der Querschnitt des größten Laufs (Exponent b von h − h₀ ∝ d^b: V ~1, Trog ~2;
            // die Aue als Boden ≤ 1 m über der Sohle), die Schichtstufe (`schichtOrt`), die Mäander (`maeanderZahl`), die Talseen (Lauf-Ende
            // „see“), die Breite der Läufe (`flussBreite` über A); dazu die Wasserfälle der Hydro-Kacheln und der Ort der Schichtstufe der Heimat
            const w = await H.seite(`
const K = globalThis.__gelaendeCore;
const samen = r._planetSamen();
await r._fadenQuelle();
const heim = r.constructor._weltGesetz(r.state.worldMeta).gelaende;
const R3 = (v) => (Number.isFinite(v) ? Math.round(v * 1000) / 1000 : null);
const ortVon = (o) => ({ samen: o.samen, version: o.version, breite: o.breite, laenge: o.laenge, zeitMa: o.zeitMa, delta: o.delta });
const lage = (o) => { const ort = ortVon(o); const O = K.ortGesetz(ort); const eg = K.erbgutNormal(K.ortErbgut(K.erbgutNormal(heim == null ? undefined : heim), o.delta.wildnis)); const saat = K.ortSaatWahl(ort, eg, SimplexNoise).saat; return { saat, O, L: K.lageAus({ seed: saat, baseHeight: K.GRUND.basis, waterLevel: K.GRUND.basis - O.meerUnterBasisM, ort, erbgut: { terme: eg, wildnis: eg[0] && eg[0].art === "wildnis" ? 1 : 0 }, regionSize: K.GRUND.kachel }, SimplexNoise) }; };
const lagePunkt = (k) => [Math.round((Math.asin(((k * 0.6180339887) % 1) * 2 - 1) * 180) / Math.PI * 100) / 100, Math.round((((k * 137.508) % 360) - 180) * 100) / 100];
const t0 = performance.now();
const orte = [];
for (let k0 = 0; orte.length < 50 && k0 < 2000; k0 += 24) { const a = await Promise.all(Array.from({ length: 24 }, (_, i) => { const p = lagePunkt(k0 + i); return r._planetAuftrag({ type: "planet-ort", samen, breite: p[0], laenge: p[1], zeitMa: 0 }); })); for (const o of a) if (o.land && orte.length < 50) orte.push(o); }
const je = [], breiten = [];
let mae = null;
for (const o of orte) {
if (performance.now() - t0 > 20000) break;
const x = lage(o), L = x.L;
const lf = K.flussLaeufe(L, -2000, -2000, 2000, 2000, 50);
let best = null; for (const l of lf) if (l.k === 0 && (!best || l.glieder.length > best.glieder.length)) best = l;
let b = null, aue = null;
if (best) {
const g = best.glieder[best.glieder.length >> 1], q = g.bahn[g.bahn.length >> 1];
const nx = -q.fz, nz = q.fx, h0 = K.hoehe(L, q.x, q.z, true);
const ds = [20, 40, 80, 160, 320], px = [], py = [];
for (const d of ds) { const h = (K.hoehe(L, q.x + nx * d, q.z + nz * d, true) + K.hoehe(L, q.x - nx * d, q.z - nz * d, true)) / 2 - h0; if (h > 0.5) { px.push(Math.log(d)); py.push(Math.log(h)); } }
if (px.length >= 3) { const mx = px.reduce((s, v) => s + v, 0) / px.length, my = py.reduce((s, v) => s + v, 0) / py.length; let sxy = 0, sxx = 0; for (let i = 0; i < px.length; i++) { sxy += (px[i] - mx) * (py[i] - my); sxx += (px[i] - mx) ** 2; } b = sxx > 0 ? sxy / sxx : null; }
for (let d = 2; d <= 400 && aue === null; d += 2) { const h = Math.min(K.hoehe(L, q.x + nx * d, q.z + nz * d, true), K.hoehe(L, q.x - nx * d, q.z - nz * d, true)) - h0; if (h > 1) aue = 2 * d; }
}
const so = K.schichtOrt(L, -8000, -8000, 8000, 8000);
const mz = K.maeanderZahl(lf);
if (!mae && mz && mz.glieder) mae = mz;
for (const l of lf) for (const g of l.glieder) breiten.push(K.flussBreite(g.A));
je.push([R3(b), aue, so ? 1 : 0, mz ? mz.glieder : 0, mz ? mz.sinuositaet : null, lf.filter((l) => l.ende === "see").length, R3(x.O.klimaHeute.sommer), R3(x.O.klimaHeute.spendeMm), lf.length]);
}
let wf = 0, kacheln = 0; for (const t of r.state.hydroTiles.values()) { kacheln++; wf += (t.waterfalls || []).length; }
const L0 = r._gelaende();
const so0 = K.schichtOrt(L0, -8000, -8000, 8000, 8000);
const lf0 = K.flussLaeufe(L0, -1500, -1500, 1500, 1500, 20);
let fl = null; for (const l of lf0) for (const g of l.glieder) for (const q of g.bahn) if (!fl && r._nassAt(q.x, q.z)) fl = [q.x, q.z];
breiten.sort((a, b) => a - b);
const pose = (p, d) => { if (!p) return null; const y = r._voxelSurfaceY(p[0], p[1]); return y === null ? null : { px: R3(p[0] + d), py: R3(y + 1.7), pz: R3(p[1] + d), lx: R3(p[0]), ly: R3(y), lz: R3(p[1]) }; };
return { orte: orte.length, punkte: orte.slice(0, 20).map((o) => [o.breite, o.laenge]), je, mae, wasserfaelle: wf, kacheln, breiteMin: R3(breiten[0]), breiteMax: R3(breiten[breiten.length - 1]), glieder: breiten.length, poseSchicht: pose(so0 ? [so0.x, so0.z] : null, 150), poseFluss: pose(fl, 8), ms: Math.round(performance.now() - t0) };
`);
            const je = w.je || [];
            const s20 = je.slice(0, 20);
            const hat = (f) => je.some(f);
            // DIE KLASSEN DER WELT (gefunden in den Saaten): V-Tal b < 1,5 · Trog b ≥ 1,5 · Aue ≥ 20 m · Schichtstufe · Mäander (Sinuosität ≥ 1,5) ·
            // Talsee · Wasserfall (Hydro-Kacheln); kein Gesetz trägt Prall/Gleithang, Schwemmfächer, Terrasse, Delta, Lagune, Strand, Kliff (Küste),
            // Kar, Moräne, Barchan, Badlands
            const klassen = { vtal: hat((x) => x[0] !== null && x[0] < 1.5), trog: hat((x) => x[0] !== null && x[0] >= 1.5), aue: hat((x) => x[1] !== null && x[1] >= 20), schichtstufe: hat((x) => x[2] === 1), maeander: hat((x) => x[4] !== null && x[4] >= 1.5), talsee: hat((x) => x[5] > 0), wasserfall: (w.wasserfaelle || 0) > 0 };
            const gefunden = Object.keys(klassen).filter((k) => klassen[k]);
            const drei = ["vtal", "trog", "aue", "schichtstufe"].filter((k) => klassen[k]);
            const aus = M.teil || {};
            const zeugeS = { saaten: je.length, klassen: gefunden.length, streuung: R3(Math.sqrt(je.filter((x) => x[0] !== null).reduce((s, x, i, a) => s + (x[0] - a.reduce((t, y) => t + y[0], 0) / a.length) ** 2, 0) / Math.max(1, je.filter((x) => x[0] !== null).length))) };
            // S1 DER QUERSCHNITT AM FÄCHER (M4): je Adresse (Saat × Stelle 1/4 · 1/2 · 3/4 am größten Lauf) das Profil-Gesetz der Reise-Welt
            // (gelaende-core `hoehe` über `flussLaeufe`: Exponent b von h − h₀ ∝ d^b — V < 1,5 ≤ Trog —, die Aue als Boden ≤ 1 m über der
            // Sohle, die Schichtstufe `schichtOrt` der Saat) — die Lage aus planet-ort → lageAus wie die Reise sie baut; die Klasse je Bild
            // spricht das Panel (R11), der Fächer liefert die Klassen, die das Gesetz an den 20 Saaten erzeugt, und ihre Posen
            const u1 = U[1];
            if (u1) {
                const PROFIL_AN = async (r, T, a, mit) => {
                    const K = globalThis.__gelaendeCore, memo = mit.memo || (mit.memo = {}), R3 = (v) => (Number.isFinite(v) ? Math.round(v * 1000) / 1000 : undefined);
                    let S = memo[a.saat];
                    if (!S) {
                        await r._fadenQuelle();
                        const p = mit.punkte[a.saat], heim = r.constructor._weltGesetz(r.state.worldMeta).gelaende;
                        const o = await r._planetAuftrag({ type: "planet-ort", samen: r._planetSamen(), breite: p[0], laenge: p[1], zeitMa: 0 });
                        const ort = { samen: o.samen, version: o.version, breite: o.breite, laenge: o.laenge, zeitMa: o.zeitMa, delta: o.delta };
                        const O = K.ortGesetz(ort), eg = K.erbgutNormal(K.ortErbgut(K.erbgutNormal(heim == null ? undefined : heim), o.delta.wildnis));
                        const saat = K.ortSaatWahl(ort, eg, SimplexNoise).saat;
                        const L = K.lageAus({ seed: saat, baseHeight: K.GRUND.basis, waterLevel: K.GRUND.basis - O.meerUnterBasisM, ort, erbgut: { terme: eg, wildnis: eg[0] && eg[0].art === "wildnis" ? 1 : 0 }, regionSize: K.GRUND.kachel }, SimplexNoise);
                        const lf = K.flussLaeufe(L, -2000, -2000, 2000, 2000, 50);
                        let best = null;
                        for (const l of lf) if (l.k === 0 && (!best || l.glieder.length > best.glieder.length)) best = l;
                        S = memo[a.saat] = { L, best, schicht: K.schichtOrt(L, -8000, -8000, 8000, 8000) ? 1 : 0, saat };
                    }
                    if (!S.best) return { welt: S.saat, schicht: S.schicht, lauf: 0 };
                    const L = S.L, gl = S.best.glieder, g = gl[Math.min(gl.length - 1, Math.floor(gl.length * a.ort))], q = g.bahn[g.bahn.length >> 1];
                    const nx = -q.fz, nz = q.fx, h0 = K.hoehe(L, q.x, q.z, true), px = [], py = [];
                    for (const d of mit.abstaende) { const h = (K.hoehe(L, q.x + nx * d, q.z + nz * d, true) + K.hoehe(L, q.x - nx * d, q.z - nz * d, true)) / 2 - h0; if (h > 0.5) { px.push(Math.log(d)); py.push(Math.log(h)); } }
                    let b;
                    if (px.length >= 3) { const mx = px.reduce((s, v) => s + v, 0) / px.length, my = py.reduce((s, v) => s + v, 0) / py.length; let sxy = 0, sxx = 0; for (let i = 0; i < px.length; i++) { sxy += (px[i] - mx) * (py[i] - my); sxx += (px[i] - mx) ** 2; } if (sxx > 0) b = sxy / sxx; }
                    let aue;
                    for (let d = 2; d <= 400 && aue === undefined; d += 2) { const h = Math.min(K.hoehe(L, q.x + nx * d, q.z + nz * d, true), K.hoehe(L, q.x - nx * d, q.z - nz * d, true)) - h0; if (h > 1) aue = 2 * d; }
                    return { welt: S.saat, lauf: 1, schicht: S.schicht, b: R3(b), grenze: b === undefined ? undefined : R3(Math.abs(b - 1.5)), klasse: b === undefined ? undefined : b < 1.5 ? "vtal" : "trog", aue, x: R3(q.x), z: R3(q.z), y: R3(h0) };
                };
                const zahl = (aus, f) => aus.filter((x) => f(x.w)).length;
                const RP = await FAECHER((c) => H.seite(c), {
                    gesetz: { fn: PROFIL_AN, export: "gelaende-core.js:1953 flussLaeufe · gelaende-core.js:2821 hoehe (das Profil-Gesetz V/Trog, die Aue) · gelaende-core.js:2058 schichtOrt · gelaende-core.js:6069 lageAus", leser: "stamm/feld-leben.js:1298 _planetAuftrag planet-ort → lageAus (die Reise baut diese Lage; der Boden meshet ihre Höhe)" },
                    adressen: { saaten: (w.punkte || []).slice(0, Number(u1.saaten) || 20).map((_, i) => i), orte: [0.25, 0.5, 0.75] },
                    // die Flanke bis 1,28 km: eine Aue breiter als 2 × 320 m ließe das Tal unter 320 m flach (am Mock 11 von 60 Profilen)
                    mit: { punkte: w.punkte || [], abstaende: [20, 40, 80, 160, 320, 640, 1280] },
                    ms: Number(u1.ms) || 15000,
                    masse: {
                        saaten: { wie: "verschieden", feld: "a.saat" },
                        profile: { wie: "anzahl", feld: "b" },
                        vtal: { wie: (v, aus) => zahl(aus, (x) => x.klasse === "vtal"), feld: "klasse" },
                        trog: { wie: (v, aus) => zahl(aus, (x) => x.klasse === "trog"), feld: "klasse" },
                        aue: { wie: (v, aus) => zahl(aus, (x) => x.aue >= 20), feld: "aue" },
                        schichtSaaten: { wie: "verschieden", feld: "a.saat", nur: (a, w) => w.schicht === 1 },
                        talExponentMedian: { wie: (v) => { const z = v.filter(Number.isFinite).sort((p, q) => p - q); return z.length ? z[z.length >> 1] : null; }, feld: "b" },
                        streuung: { wie: (v) => { const z = v.filter(Number.isFinite), m = z.reduce((s, x) => s + x, 0) / Math.max(1, z.length); return z.length > 1 ? Math.sqrt(z.reduce((s, x) => s + (x - m) ** 2, 0) / z.length) : 0; }, feld: "b" },
                    },
                    schlecht: { feld: "grenze", richtung: "min" },
                    pose: (a, w) => "Ego 8 m über der Sohle am Querschnitt " + w.x + "/" + w.z + " der Saat " + a.saat + " (b " + w.b + ", Aue " + w.aue + " m), Blick talauf — das Bild, dessen Klasse am nächsten an der Grenze V/Trog liegt",
                    ungemessen: ["die Blind-Klassifikation der Ego-Bilder an 20 Saaten (Panel R11, am Gerät)"],
                });
                const W1 = RP.werte;
                const drei = (W1.vtal > 0 || W1.trog > 0 ? 1 : 0) + (W1.aue > 0 ? 1 : 0) + (W1.schichtSaaten > 0 ? 1 : 0);
                aus[1] = {
                    werte: Object.assign({ saaten: W1.saaten, klassenDerDrei: drei, schichtstufeSaaten: W1.schichtSaaten }, W1.talExponentMedian != null ? { talExponentMedian: R3(W1.talExponentMedian) } : {}),
                    zeuge: { saaten: W1.saaten, profile: W1.profile, klassen: drei, vtal: W1.vtal, trog: W1.trog, aue: W1.aue, schichtSaaten: W1.schichtSaaten, streuung: R3(W1.streuung), gerissen: RP.gerissen, akte: RP.akte },
                    auge: await M.auge("relief-formschatz-s1", w.poseSchicht || { ort: "wiese" }),
                    taeter: (RP.fehler.length && !RP.gemessen ? "Leser fehlt: " + RP.fehler[0].fehler + " · " : "") + "das Profil-Gesetz erzeugt an " + W1.saaten + " Saaten " + W1.vtal + " V-Täler, " + W1.trog + " Tröge, " + W1.aue + " Auen, " + W1.schichtSaaten + " Schichtstufen (b im Median " + R3(W1.talExponentMedian) + ") — die Klasse je Bild spricht das Panel · " + RP.akte,
                };
            }
            aus[2] = {
                werte: { klassen: gefunden.length, wasserfaelle: w.wasserfaelle || 0, maeanderSinuositaet: w.mae ? w.mae.sinuositaet : null, talseen: je.reduce((s, x) => s + x[5], 0) },
                zeuge: Object.assign({ gefunden, mae: w.mae }, zeugeS),
                auge: await M.auge("relief-formschatz-s2", w.poseFluss || { ort: "wiese" }),
                nicht: "10 Klassen nicht erzeugbar: die Welt trägt " + gefunden.length + " (" + gefunden.join(", ") + ") — kein Gesetz für Prall-/Gleithang, Schwemmfächer, Terrasse (gelaende-core.js Profil-Gesetze V/Trog, Aue, Schicht, kinematischer Mäander)",
            };
            aus[3] = { werte: { klassenDerAcht: 0, saaten: je.length }, zeuge: Object.assign({ gefunden }, zeugeS), auge: await M.auge("relief-formschatz-s3", { ort: "wiese" }), nicht: "30 Klassen aus 4 Agenzien nicht erzeugbar: kein Delta, keine Lagune, kein Strand, kein Kliff der Küste, kein Kar, keine Moräne, kein Barchan, keine Badlands — kein Agens Welle, Gezeit, Eis oder Wind formt das Relief" };
            aus[4] = { werte: { klassenProzent: gefunden.length, saaten: je.length }, zeuge: Object.assign({ gefunden }, zeugeS), nicht: "~100 Klassen aus 7 Agenzien nicht erzeugbar: die Welt trägt " + gefunden.length + " Formen; kein Fjord (kein Eis), kein Atoll (keine sinkende Insel), keine Mangrove (kein Leser Form × Leben)" };
            const kalt = je.filter((x) => x[0] !== null && x[6] !== null);
            const rang = (a) => { const s = a.map((v, i) => [v, i]).sort((p, q) => p[0] - q[0]); const r = new Array(a.length); s.forEach((p, k) => (r[p[1]] = k)); return r; };
            let rk = null;
            if (kalt.length >= 5) { const ra = rang(kalt.map((x) => x[0])), rb = rang(kalt.map((x) => -x[6])), n = ra.length; rk = 1 - (6 * ra.reduce((s, v, i) => s + (v - rb[i]) ** 2, 0)) / (n * (n * n - 1)); }
            aus[5] = { werte: { saaten: kalt.length, talExponentKaelteRang: R3(rk) }, zeuge: Object.assign({}, zeugeS), auge: await M.auge("relief-formschatz-s5", w.poseSchicht || { ort: "wiese" }), nicht: "kein Klima-Tausch derselben Saat: die Ort-Saat trägt Lage und Zeit (gelaende-core.js:5802 ortSaat), kein Leser setzt arid/humid/glazial an dieselbe Saat; die Erd-Referenz der Klassen je Klima fehlt" };
            const ord = w.breiteMin > 0 && w.breiteMax > 0 ? Math.log10(w.breiteMax / w.breiteMin) : null;
            aus[6] = { werte: Object.assign({ glieder: w.glieder || 0 }, ord !== null ? { groessenordnungen: R3(ord), breiteMinM: w.breiteMin, breiteMaxM: w.breiteMax } : {}), zeuge: { glieder: w.glieder || 0, klassen: 1, streuung: ord || 0 }, nicht: "je Klasse über 4 Größenordnungen nicht erzeugbar: nur der Fluss trägt ein Breiten-Gesetz (gelaende-core.js:749 flussBreite), keine Düne, kein Delta, kein Rippel" };
            aus[7] = { werte: { saaten: je.length, talseen: je.reduce((s, x) => s + x[5], 0) }, zeuge: zeugeS, auge: await M.auge("relief-formschatz-s7", w.poseFluss || { ort: "wiese" }), nicht: "Planet mit ~10⁸ Seen, ~10⁶ Flüssen, jede begehbar, nicht erzeugbar: Form aus Platte, Gezeit und Meeresspiegel — kein Leser verbindet das Relief der Reise-Welt mit Platte und Gezeit (gelaende-core.js:5808 ortSaatWahl liest nur Lage und Δ)" };
            aus[8] = { werte: { breiteVerh: 1 }, zeuge: { breiteGeaendert: 0 }, nicht: "kein Konstanten-Tausch: die Kanalbreite liest nur das Einzugsgebiet (gelaende-core.js:749 flussBreite(A)), keine Schwere, keine Viskosität; der Faden liest den Körper nicht (voxel-worker.js:1176)" };
            const o = {};
            for (const nr of ziel) o[nr] = aus[nr] || M.nicht("ungemessen");
            return { sprossen: o };
        },
        sprossen: {
            1: {
                u: { klassen: 3, saaten: 20, ms: 15000 },
                soll: [K.soll(FS, 1, "Blind-Klassifikation von Ego-Bildern an 20 Saaten ≥ 80 %", { key: "richtigProzent", einheit: "%" }), K.soll(FS, 1, "20 Saaten", { key: "saaten", rel: "≥" })],
                auge: { pose: "Ego 150 m vor der Schichtstufe der Heimat (gelaende-core schichtOrt), Blick auf die Treppe", vorbild: "Fotos von V-Tal, Trogtal, Aue, Schichtstufe (Blind-Klassifikation, Prüfer-Satz R11)" },
                zeuge: (roh) => {
                    const m = zMin({ saaten: 20, profile: 30 })(roh);
                    if (m) return m;
                    const z = roh.zeuge;
                    return z.klassen >= 3 ? null : "das Gesetz erzeugt nur " + z.klassen + " der drei Klassen (V/Trog " + (z.vtal + z.trog) + ", Aue " + z.aue + ", Schichtstufe " + z.schichtSaaten + ") — das Panel hätte nichts zu unterscheiden";
                },
                zeugeText: "der Fächer: 20 Saaten × 3 Querschnitte am Profil-Gesetz, ≥ 30 Profile gemessen, die drei Klassen (V/Trog, Aue, Schichtstufe) erzeugt",
                taeter: "gelaende-core.js Profil-Gesetze (V/Trog, Aue, Schichtstufe)",
                leser: "stamm/feld-leben.js:1298 _planetAuftrag planet-ort → gelaende-core lageAus: die Reise-Welt der Saat, ihr Querschnitt aus gelaende-core hoehe am Lauf flussLaeufe",
                gruen: gut({ richtigProzent: 84, saaten: 20 }, { saaten: 20, profile: 60, klassen: 3, vtal: 30, trog: 20, aue: 25, schichtSaaten: 8 }),
                attrappen: [
                    { name: "die Klassifikation ohne Bild", roh: leer({ richtigProzent: 84, saaten: 20 }) },
                    { name: "EINE Saat (kein Fächer)", roh: gut({ richtigProzent: 84, saaten: 20 }, { saaten: 1, profile: 3, klassen: 3, vtal: 2, trog: 1, aue: 1, schichtSaaten: 1 }) },
                    { name: "der Fächer ohne Aue und Stufe (nur V-Täler — das Panel hätte nichts zu unterscheiden)", roh: gut({ richtigProzent: 84, saaten: 20 }, { saaten: 20, profile: 60, klassen: 1, vtal: 60, trog: 0, aue: 0, schichtSaaten: 0 }) },
                ],
            },
            2: {
                u: { klassen: 10 },
                soll: [
                    K.soll(FS, 2, "Blind-Klassifikation ≥ 80 % je Klasse", { key: "richtigJeKlasseProzent", einheit: "%" }),
                    K.soll(FS, 2, "plausible Ufer-Bilder an 50 Zufallsorten ≥ 70 %", { key: "uferProzent", einheit: "%" }),
                    K.soll(FS, 2, "50 Zufallsorten", { key: "orte", rel: "≥" }),
                ],
                auge: { pose: "Ego 8 m neben dem ersten nassen Lauf am Spawn", vorbild: "Fotos der 10 Klassen und Ufer-Fotos (Prüfer-Satz R11)" },
                taeter: "gelaende-core.js (kein Gesetz für Schwemmfächer, Terrasse, Prallhang)",
                nicht: "10 Klassen (Schwemmfächer, Terrasse, Prall-/Gleithang fehlen)",
                leser: "gelaende-core.js:1953 flussLaeufe — das Netz trägt Mäander, Aue und Talsee, kein Leser legt Schwemmfächer, Terrasse oder Prall-/Gleithang",
                gruen: gut({ richtigJeKlasseProzent: 82, uferProzent: 74, orte: 50 }, {}),
                attrappen: [{ name: "die Klassifikation ohne Bild", roh: leer({ richtigJeKlasseProzent: 82, uferProzent: 74, orte: 50 }) }],
            },
            3: {
                u: { klassen: 30 },
                soll: [K.soll(FS, 3, "200 Orte", { key: "orte", rel: "≥" }), K.soll(FS, 3, "20 Saaten", { key: "saaten", rel: "≥" }), K.soll(FS, 3, "≥ 70 %", { key: "trefferProzent", einheit: "%" })],
                auge: { pose: "Ego an der Wiese (die Formen der Küste und des Eises fehlen)", vorbild: "200 Fotos aus 20 Erd-Landschaften, Klasse aus Wellenenergie, Tidenhub, Sediment, Gefälle (R11)" },
                taeter: "gelaende-core.js (kein Agens Welle, Gezeit, Eis, Wind)",
                nicht: "Delta, Lagune, Strand, Kliff, Kar, Moräne, Barchan, Badlands fehlen",
                leser: "gelaende-core.js:2819 hoehe — das Relief kennt kein Agens Welle, Gezeit, Eis oder Wind (keine Prozessgröße am Ort)",
                gruen: gut({ orte: 200, saaten: 20, trefferProzent: 74 }, {}),
                attrappen: [{ name: "die Treffer ohne Bild", roh: leer({ orte: 200, saaten: 20, trefferProzent: 74 }) }],
            },
            4: {
                u: { klassen: 100 },
                soll: [
                    K.soll(FS, 4, "in 100 Saaten tauchen ≥ 80 % der Klassen ungefragt auf", { key: "klassenProzent", einheit: "%" }),
                    K.soll(FS, 4, "Fehlplatzierung < 5 %", { key: "fehlProzent", einheit: "%" }),
                    K.soll(FS, 4, "1 000 Fundorten", { key: "fundorte", rel: "≥" }),
                    K.soll(FS, 4, "100 Saaten", { key: "saaten", rel: "≥" }),
                ],
                zeuge: zMin({ saaten: 100, klassen: 80, fundorte: 1000 }),
                zeugeText: "100 Saaten, ≥ 80 der Klassen gefunden, 1 000 Fundorte geprüft",
                taeter: "gelaende-core.js (7 Formen statt ~100)",
                nicht: "~100 Klassen aus 7 Agenzien",
                leser: "gelaende-core.js:5808 ortSaatWahl — die Reise-Welt liest Lage und Δ, kein Agens (Eis, Platte, Leben) setzt eine Form",
                gruen: gut({ klassenProzent: 84, fehlProzent: 3, fundorte: 1000, saaten: 100 }, { saaten: 100, klassen: 84, fundorte: 1000 }),
                attrappen: [{ name: "die Taxonomie als Liste ohne Saat", roh: leer({ klassenProzent: 100, fehlProzent: 0, fundorte: 1000, saaten: 100 }) }],
            },
            5: {
                u: { saaten: 50 },
                soll: [K.soll(FS, 5, "Rang ≥ 0,8", { key: "rang" }), K.soll(FS, 5, "Fehler ≥ 35 %", { key: "fehlerProzent", einheit: "%" })],
                auge: { pose: "Ego vor der Schichtstufe der Heimat", vorbild: "Fotos derselben Landform in arid, humid, glazial (Foto-Blindpaar R11)" },
                taeter: "gelaende-core.js ortSaat (die Saat trägt Lage und Zeit, kein Klima-Tausch)",
                nicht: "kein Klima-Tausch derselben Saat",
                leser: "gelaende-core.js:5802 ortSaat — die Saat ist <Samen>@<Breite>_<Länge>_<Zeit>; kein Leser setzt ein anderes Klima an dieselbe Saat",
                gruen: gut({ rang: 0.84, fehlerProzent: 38 }, {}),
                attrappen: [{ name: "der Rang ohne Bild", roh: leer({ rang: 0.84, fehlerProzent: 38 }) }],
            },
            6: {
                u: {},
                soll: [K.soll(FS, 6, "4 Größenordnungen", { key: "groessenordnungen", rel: "≥" })],
                zeuge: zMin({ glieder: 100, klassen: 2, streuung: 1e-6 }),
                zeugeText: "je Klasse (≥ 2) über 4 Größenordnungen gemessen",
                taeter: "gelaende-core.js flussBreite (das einzige Breiten-Gesetz)",
                nicht: "nur der Fluss trägt ein Längen-Breiten-Gesetz",
                leser: "gelaende-core.js:749 flussBreite(A) — das einzige Breiten-Gesetz; Düne, Delta, Rippel tragen keins",
                gruen: gut({ groessenordnungen: 4.2, glieder: 4000 }, { glieder: 4000, klassen: 3, streuung: 4.2 }),
                attrappen: [{ name: "4 Größenordnungen EINER Klasse (der Fluss allein)", roh: gut({ groessenordnungen: 4.2, glieder: 4000 }, { glieder: 4000, klassen: 1, streuung: 4.2 }) }],
            },
            7: {
                u: {},
                soll: [K.soll(FS, 7, "≥ 80 % im Blindtest gegen Fotos als echt bewertet", { key: "echtProzent", einheit: "%" }), K.soll(FS, 7, "1 000 zufällige Gewässer- und Landform-Posen", { key: "posen", rel: "≥" }), K.soll(FS, 7, "100 Saaten", { key: "saaten", rel: "≥" })],
                auge: { pose: "Ego am ersten nassen Lauf am Spawn", vorbild: "Fotos von Gewässern und Landformen (Blindtest R11, 1 000 Posen aus 100 Saaten)" },
                taeter: "gelaende-core.js ortSaatWahl (das Relief ohne Platte und Gezeit)",
                nicht: "Planet mit ~10⁸ Seen, ~10⁶ Flüssen nicht erzeugbar",
                gruen: gut({ echtProzent: 82, posen: 1000, saaten: 100 }, {}),
                attrappen: [{ name: "der Blindtest ohne Bild", roh: leer({ echtProzent: 82, posen: 1000, saaten: 100 }) }],
            },
            8: {
                u: { g: [9.81, 3.71] },
                soll: [K.soll(FS, 8, "Kanalbreite skaliert mit Schwere und Viskosität ±25 %", { key: "breiteJeSoll", ref: 1, refQuelle: "Erde: hydraulische Geometrie B ∝ Q^0,4·g^−0,2 (Parker et al. 2007) — die Breite unter der Schwere der Welt gegen die vorhergesagte" })],
                zeuge: zMin({ breiteGeaendert: 1 }),
                zeugeText: "der Tausch der Schwere änderte die Kanalbreite der Welt",
                taeter: "gelaende-core.js flussBreite (liest nur A)",
                nicht: "keine Schwere, keine Viskosität im Breiten-Gesetz",
                leser: "gelaende-core.js:749 flussBreite(A) — kein g, keine Viskosität; voxel-worker.js:1176 liest den Körper nicht",
                gruen: gut({ breiteJeSoll: 1.08 }, { breiteGeaendert: 1 }),
                attrappen: [{ name: "die Breite unverändert (Verhältnis 1 liegt zufällig im Band)", roh: gut({ breiteJeSoll: 0.83 }, { breiteGeaendert: 0 }) }],
            },
        },
    };

    // ════════════════════════════════════════ BODEN (S1–S6) ════════════════════════════════════════
    const boden = {
        sek: 40,
        faecher: true,
        pfad: PFAD,
        ungefahren: "die Bilder (Ego-Blindpaar, Anschnitt, Regolith) schießt die Probe nur am Gerät",
        mess: async function (H, U, M) {
            const R3 = (v) => (Number.isFinite(v) ? Math.round(v * 1000) / 1000 : null);
            const ziel = Object.keys(U);
            // DER BODEN DER HEIMAT: 30 Zufallsposen (Hang aus `hoehe`, Schutt des Schicht-Gesetzes, Feuchte `_feuchteAt`, Klasse `_bodenKlasseAt`);
            // 20 Läufe (der Stoff der Sohle stromab); 50 Säulen (der Stoff nach Tiefe `_terrainMaterialAt`: Lagen und ihre Mächtigkeit an Kuppe
            // und Unterhang); 100 Orte (die Bodenklassen)
            const w = await H.seite(`
const K = globalThis.__gelaendeCore, L = r._gelaende();
const R3 = (v) => (Number.isFinite(v) ? Math.round(v * 1000) / 1000 : null);
let s = 12345; const zf = () => ((s = (s * 16807) % 2147483647) / 2147483647);
const t0 = performance.now();
const hang = (x, z) => (Math.atan(Math.hypot((K.hoehe(L, x + 2, z, true) - K.hoehe(L, x - 2, z, true)) / 4, (K.hoehe(L, x, z + 2, true) - K.hoehe(L, x, z - 2, true)) / 4)) * 180) / Math.PI;
const posen = [];
for (let p = 0; p < 30; p++) { const x0 = (zf() - 0.5) * 3000, z0 = (zf() - 0.5) * 3000; for (let i = 0; i < 9; i++) { const x = x0 + (i % 3) * 10, z = z0 + Math.floor(i / 3) * 10; const a = {}; K.hoehe(L, x, z, true, a); posen.push([R3(hang(x, z)), R3(a.schutt || 0), R3(r._feuchteAt(x, z)), r._bodenKlasseAt(x, z)]); } }
const lf = K.flussLaeufe(L, -3000, -3000, 3000, 3000, 50).filter((l) => l.k === 0).sort((a, b) => b.glieder.length - a.glieder.length).slice(0, 20);
const laeufe = lf.map((l) => { const b = l.glieder.flatMap((g) => g.bahn); const st = []; for (let i = 0; i < b.length; i += Math.max(1, Math.floor(b.length / 8))) { const y = r._voxelSurfaceY(b[i].x, b[i].z); st.push(y === null ? null : r._terrainMaterialAt(b[i].x, b[i].z, y - 0.2)); } return st; });
const tiefen = [0.2, 0.5, 1, 2, 4, 8, 11, 13, 16, 20];
const saeule = (x, z) => { const y = r._voxelSurfaceY(x, z); if (y === null) return null; const m = tiefen.map((d) => r._terrainMaterialAt(x, z, y - d)); let dick = null; for (let i = 1; i < m.length && dick === null; i++) if (m[i] !== m[0]) dick = tiefen[i]; return { y, m, dick, lagen: new Set(m).size }; };
const paare = [];
for (let p = 0; p < 50; p++) { const x0 = (zf() - 0.5) * 3000, z0 = (zf() - 0.5) * 3000; const c = []; for (let i = 0; i < 9; i++) { const x = x0 + ((i % 3) - 1) * 100, z = z0 + (Math.floor(i / 3) - 1) * 100; const q = saeule(x, z); if (q) c.push(q); } if (c.length < 2) continue; c.sort((a, b) => b.y - a.y); paare.push([R3(c[0].y), c[0].dick, R3(c[c.length - 1].y), c[c.length - 1].dick, c[0].lagen, c[0].m.join("|")]); }
const klassen = {}; for (let p = 0; p < 100; p++) { const k = r._bodenKlasseAt((zf() - 0.5) * 6000, (zf() - 0.5) * 6000); klassen[k] = (klassen[k] || 0) + 1; }
return { posen, laeufe, paare, klassen, strata: r.constructor.STRATA_STEIN_DEPTH, ms: Math.round(performance.now() - t0) };
`);
            const P = w.posen || [];
            const steil = P.filter((x) => x[0] >= 30), flach = P.filter((x) => x[0] < 10);
            const anteil = (a, f) => (a.length ? R3((100 * a.filter(f).length) / a.length) : null);
            const pa = w.paare || [];
            const mitDick = pa.filter((x) => x[1] !== null && x[3] !== null);
            const stoffe = new Set((w.laeufe || []).flat().filter(Boolean));
            const aus = M.teil || {};
            // S1 DER BODEN AM FÄCHER (M4): je Adresse (30 Zufallsposen × 3×3 Punkte à 10 m der Heimat) das Gesetz, das der Boden am Punkt
            // zeichnet — gelaende-core `felsStoffPunkt` über der Säulen-Farbe `_bodenFarbeAt` mit dem Grundton `FELS_STOFF` und der Feuchte
            // des Wirts `_feuchteAt`, genau wie der Stamm sie ruft (`_bodenGruenAt`): das Gewicht von Fels und Schutt am Hang, der
            // Schutthang des Schicht-Gesetzes (`hoehe(…, aus).schutt`), die Spur des Mooses (dieselbe Farbe ohne Feuchte daneben), die
            // Klasse des Lebensraums (`_bodenKlasseAt`)
            const u1 = U[1];
            if (u1) {
                const BODEN_AN = async (r, T, a, mit) => {
                    const K = globalThis.__gelaendeCore, L = r._gelaende(), FS = r.constructor.FELS_STOFF, R3 = (v) => Math.round(v * 1000) / 1000;
                    const x = a.ort[0], z = a.ort[1];
                    const gx = (K.hoehe(L, x + 2, z, true) - K.hoehe(L, x - 2, z, true)) / 4, gz = (K.hoehe(L, x, z + 2, true) - K.hoehe(L, x, z - 2, true)) / 4;
                    const t = Math.hypot(gx, gz), ny = 1 / Math.sqrt(1 + t * t), hang = (Math.atan(t) * 180) / Math.PI;
                    const q = {}, y = K.hoehe(L, x, z, true, q);
                    const fe = r._feuchteAt(x, z, y);
                    const c0 = [0, 0, 0];
                    r._bodenFarbeAt(x, y, z, c0);
                    const c1 = c0.slice(), c2 = c0.slice();
                    const w = K.felsStoffPunkt(L, FS.basis, FS.netz, x, y, z, ny, c1, (px, pz, py) => r._feuchteAt(px, pz, py));
                    K.felsStoffPunkt(L, FS.basis, FS.netz, x, y, z, ny, c2, () => 0);
                    const moos = Math.hypot(c1[0] - c2[0], c1[1] - c2[1], c1[2] - c2[2]) / Math.max(1e-6, Math.max(...c2)) > 0.02 ? 1 : 0;
                    const steil = hang >= 30 ? 1 : 0;
                    return { pose: a.ort[2], hang: R3(hang), steil, flach: hang < 10 ? 1 : 0, schutt: R3(q.schutt > 0 ? q.schutt : 0), stoff: R3(w), feucht: R3(fe), moos, klasse: r._bodenKlasseAt(x, z), steilOhneStoff: steil && !(w > 0.5) ? 1 : 0, y: R3(y) };
                };
                let sz = 12345;
                const zf = () => (sz = (sz * 16807) % 2147483647) / 2147483647;
                const ORTE = [];
                for (let p = 0; p < (Number(u1.posen) || 30); p++) { const x0 = (zf() - 0.5) * 3000, z0 = (zf() - 0.5) * 3000; for (let i = 0; i < 9; i++) ORTE.push([Math.round(x0 + (i % 3) * 10), Math.round(z0 + Math.floor(i / 3) * 10), p]); }
                const pct = (aus, wo, f) => { const a = aus.filter((x) => wo(x.w)); return a.length ? Math.round((1000 * a.filter((x) => f(x.w)).length) / a.length) / 10 : null; };
                const RB = await FAECHER((c) => H.seite(c), {
                    gesetz: { fn: BODEN_AN, export: "gelaende-core.js:5501 felsStoffPunkt (Fels und Schutt am Hang, Flechte, Moos — felsFarbe) · gelaende-core.js:2821 hoehe (der Schutthang) · stamm/gelaende-boden.js:1619 _feuchteAt · stamm/kreatur-leben.js:1707 _bodenKlasseAt", leser: "stamm/gelaende-boden.js:2753 _bodenGruenAt (die Farbe des Bodens am Punkt: _bodenFarbeAt + felsStoffPunkt mit _feuchteAt — das Auge, der Kontakt, der Wurf der Wiese)" },
                    adressen: { saaten: ["heim"], orte: ORTE },
                    ms: Number(u1.ms) || 10000,
                    masse: {
                        posen: { wie: (v, aus) => new Set(aus.map((x) => x.w.pose)).size, feld: "pose" },
                        punkte: { wie: "anzahl", feld: "hang" },
                        steilePunkte: { wie: "summe", feld: "steil" },
                        flachePunkte: { wie: "summe", feld: "flach" },
                        schuttSteilProzent: { wie: (v, aus) => pct(aus, (w) => w.steil === 1, (w) => w.schutt > 0.5), feld: "schutt" },
                        schuttFlachProzent: { wie: (v, aus) => pct(aus, (w) => w.flach === 1, (w) => w.schutt > 0.5), feld: "schutt" },
                        stoffSteilProzent: { wie: (v, aus) => pct(aus, (w) => w.steil === 1, (w) => w.stoff > 0.5), feld: "stoff" },
                        feuchtProzent: { wie: (v, aus) => pct(aus, () => true, (w) => w.feucht > 0.5), feld: "feucht" },
                        moosFeuchtProzent: { wie: (v, aus) => pct(aus, (w) => w.feucht > 0.5 && w.stoff > 0, (w) => w.moos === 1), feld: "moos" },
                        moosTrockenProzent: { wie: (v, aus) => pct(aus, (w) => !(w.feucht > 0.5) && w.stoff > 0, (w) => w.moos === 1), feld: "moos" },
                        klassen: { wie: "verschieden", feld: "klasse" },
                    },
                    schlecht: { feld: "steilOhneStoff", richtung: "max" },
                    pose: (a, w) => "Ego an der Pose " + w.pose + " (" + a.ort[0] + "/" + a.ort[1] + "), Blick auf den Hang " + w.hang + "° (Stoff " + w.stoff + ", Schutt " + w.schutt + ", Feuchte " + w.feucht + ")",
                    ungemessen: ["das Blindpaar Ego-Bild gegen Foto gleichen Hangs und Klimas (2AFC, Panel R11, am Gerät)", "der Foto-Korpus der Erd-Anteile (Schutt am Steilen, Moos im Feuchten) als Zahl"],
                });
                const W1 = RB.werte;
                const nz = (o) => { const r0 = {}; for (const k of Object.keys(o)) if (o[k] != null) r0[k] = o[k]; return r0; };
                const zz = (v) => (v == null ? "—" : v);
                aus[1] = {
                    werte: nz({ posen: W1.posen, schuttSteilProzent: W1.schuttSteilProzent, schuttFlachProzent: W1.schuttFlachProzent, stoffSteilProzent: W1.stoffSteilProzent, feuchtProzent: W1.feuchtProzent, moosFeuchtProzent: W1.moosFeuchtProzent, moosTrockenProzent: W1.moosTrockenProzent, steilePunkte: W1.steilePunkte }),
                    zeuge: { posen: W1.posen, punkte: W1.punkte, steilePunkte: W1.steilePunkte, flachePunkte: W1.flachePunkte, klassen: W1.klassen, gerissen: RB.gerissen, akte: RB.akte },
                    auge: await M.auge("relief-boden-s1", { ort: "wiese" }),
                    taeter: (RB.fehler.length && !RB.gemessen ? "Leser fehlt: " + RB.fehler[0].fehler + " · " : "") + "kein Foto-Korpus der Erde als Zahl: die Welt zeichnet Fels/Schutt an " + zz(W1.stoffSteilProzent) + " % der " + W1.steilePunkte + " Punkte ≥ 30° (Schutthang " + zz(W1.schuttSteilProzent) + " %; der Fels beginnt erst an der Steile 0,42 ≈ 55°, stamm/daten.js:646 TERRAIN_GEOLOGY.rockLo), Moos an " + zz(W1.moosFeuchtProzent) + " % der feuchten Felsen (" + zz(W1.moosTrockenProzent) + " % der trockenen) — die Anteile gleichen Hangs und Klimas der Erde stehen nirgends (unklar), das Blindpaar nur am Gerät · " + RB.akte,
                };
            }
            aus[2] = { werte: { laeufe: (w.laeufe || []).length, stoffeDerSohle: stoffe.size }, zeuge: { laeufe: (w.laeufe || []).length, stoffe: [...stoffe] }, nicht: "keine Korngröße in der Welt: der Boden kennt Stoffe (" + [...stoffe].join(", ") + "), kein Korn nach Herkunft (stamm/vegetation-wiese.js:2362 _terrainMaterialAt)" };
            aus[3] = {
                werte: { orte: pa.length, kuppeDuennerProzent: mitDick.length ? R3((100 * mitDick.filter((x) => x[1] < x[3]).length) / mitDick.length) : null, lagenMax: pa.length ? Math.max(...pa.map((x) => x[4])) : null, maechtigkeitM: mitDick.length ? mitDick[0][1] : null },
                zeuge: { orte: pa.length, saeulen: pa.slice(0, 6), strata: w.strata },
                nicht: "keine Horizonte O/A/B/C: die Säule trägt den Stoff der Oberfläche bis " + w.strata + " m und darunter Stein, überall gleich mächtig (stamm/vegetation-wiese.js:2362 _terrainMaterialAt, STRATA_STEIN_DEPTH)",
            };
            aus[4] = { werte: { orte: 100, bodenklassen: Object.keys(w.klassen || {}).length }, zeuge: { klassen: w.klassen }, auge: await M.auge("relief-boden-s4", { ort: "wiese" }), nicht: "keine Referenz-Bodengruppen: die Welt kennt " + Object.keys(w.klassen || {}).length + " Bodenklasse(n) (" + Object.keys(w.klassen || {}).join(", ") + ") des Lebensraum-Gesetzes, keine WRB-Gruppe, kein Anschnitt-Bild" };
            aus[5] = { werte: { stoffe: stoffe.size }, zeuge: { stoffe: [...stoffe] }, auge: await M.auge("relief-boden-s5", { ort: "wiese" }), nicht: "keine 32 Referenz-Bodengruppen, keine Munsell-Farbe je Horizont: die Erdbodenfarbe ist Rausch-Fleck (stamm/gelaende-boden.js:2536 _bodenFarbeAt)" };
            aus[6] = { werte: { begrabeneBoeden: 0, lagenMax: pa.length ? Math.max(...pa.map((x) => x[4])) : null }, zeuge: { strata: w.strata }, auge: await M.auge("relief-boden-s6", { ort: "wiese" }), nicht: "keine begrabenen Böden, kein Löss, kein Regolith: die Säule kennt keine Zeit (zwei Stoffe nach Tiefe), keine fremde Welt trägt einen eigenen Boden" };
            const o = {};
            for (const nr of ziel) o[nr] = aus[nr] || M.nicht("ungemessen");
            return { sprossen: o };
        },
        sprossen: {
            1: {
                u: { posen: 30 },
                soll: [
                    K.soll(BO, 1, "2AFC ≤ 85 %", { key: "afcProzent", einheit: "%" }),
                    K.soll(BO, 1, "Anteile ±20 %", { key: "anteilJeKorpus", ref: 1, refQuelle: "Erde: Foto-Korpus gleichen Hangs und Klimas — Anteil Schutt am Steilen und Moos im Feuchten (die Welt gegen den Korpus)" }),
                    K.soll(BO, 1, "30 Zufallsposen", { key: "posen", rel: "≥" }),
                ],
                auge: { pose: "Ego an der Wiese, Blick auf den nächsten Hang", vorbild: "Foto gleichen Hangs und Klimas (2AFC, Prüfer-Satz R11)" },
                zeuge: (roh) => {
                    const m = zMin({ posen: 30, punkte: 200, steilePunkte: 1, flachePunkte: 1 })(roh);
                    if (m) return m;
                    const z = roh.zeuge;
                    return z.gerissen > 0 ? "der Fächer riss an " + z.gerissen + " Adressen" : null;
                },
                zeugeText: "der Fächer: 30 Zufallsposen × 9 Punkte am Gesetz des Bodens (felsStoffPunkt mit der Feuchte des Wirts), steile und flache Punkte darunter, keine Adresse gerissen",
                taeter: "gelaende-core.js:5501 felsStoffPunkt (Schutt, Flechte, Moos) · stamm/gelaende-boden.js:2617 _bodenFarbeAt",
                leser: "stamm/gelaende-boden.js:2753 _bodenGruenAt — die Farbe des Bodens am Punkt (_bodenFarbeAt + gelaende-core felsStoffPunkt mit _feuchteAt), die das Auge, der Kontakt und der Wurf der Wiese lesen",
                unklar: "der Foto-Korpus „Anteile ±20 %“ steht nicht als Zahl in der Karte — Vorschlag: Schutt-Anteil je Hangklasse (≥ 30°, < 10°) und Moos-Anteil je Feuchte-Klasse aus einem benannten Korpus",
                gruen: gut({ afcProzent: 80, anteilJeKorpus: 1.1, posen: 30 }, { posen: 30, punkte: 270, steilePunkte: 20, flachePunkte: 120, gerissen: 0 }),
                attrappen: [
                    { name: "das Blindpaar ohne Bild", roh: leer({ afcProzent: 80, anteilJeKorpus: 1, posen: 30 }) },
                    { name: "EINE Pose (kein Fächer)", roh: gut({ afcProzent: 80, anteilJeKorpus: 1.1, posen: 30 }, { posen: 1, punkte: 9, steilePunkte: 1, flachePunkte: 1, gerissen: 0 }) },
                    { name: "der Fächer ohne Hang (kein steiler Punkt — der Schutt wird nie gefragt)", roh: gut({ afcProzent: 80, anteilJeKorpus: 1.1, posen: 30 }, { posen: 30, punkte: 270, steilePunkte: 0, flachePunkte: 270, gerissen: 0 }) },
                ],
            },
            2: {
                u: { laeufe: 20 },
                soll: [K.soll(BO, 2, "Rang ≥ 0,7", { key: "rang" }), K.soll(BO, 2, "20 Läufen", { key: "laeufe", rel: "≥" })],
                zeuge: zMin({ laeufe: 20, kornStufen: 2 }),
                zeugeText: "20 Läufe, das Korn der Sohle in ≥ 2 Stufen gezählt",
                taeter: "stamm/vegetation-wiese.js _terrainMaterialAt (kein Korn)",
                nicht: "keine Korngröße",
                leser: "stamm/vegetation-wiese.js:2362 _terrainMaterialAt — der Boden nennt einen Stoff (erde, stein, glut, quarz), keine Korngröße nach Herkunft",
                gruen: gut({ rang: 0.78, laeufe: 20 }, { laeufe: 20, kornStufen: 4 }),
                attrappen: [{ name: "der Rang ohne Korn in der Welt", roh: gut({ rang: 0.78, laeufe: 20 }, { laeufe: 20, kornStufen: 0 }) }],
            },
            3: {
                u: { orte: 50, tiefenM: [0.2, 0.5, 1, 2, 4, 8, 11, 13, 16, 20] },
                soll: [K.soll(BO, 3, "Kuppe dünner als Unterhang in ≥ 90 %", { key: "kuppeDuennerProzent", einheit: "%" }), K.soll(BO, 3, "50 Zufallsorten", { key: "orte", rel: "≥" })],
                zeuge: zMin({ orte: 50, horizonte: 3 }),
                zeugeText: "50 Säulen gegraben, ≥ 3 Horizonte je Säule",
                taeter: "stamm/vegetation-wiese.js _terrainMaterialAt (zwei Stoffe nach Tiefe)",
                nicht: "keine Horizonte, Mächtigkeit überall gleich",
                leser: "stamm/vegetation-wiese.js:2362 _terrainMaterialAt — STRATA_STEIN_DEPTH 12 m überall (stamm/vegetation-wiese.js:3198), keine Bodenproduktion − Abtrag",
                gruen: gut({ kuppeDuennerProzent: 92, orte: 50 }, { orte: 50, horizonte: 4 }),
                attrappen: [{ name: "92 % ohne Horizont", roh: gut({ kuppeDuennerProzent: 92, orte: 50 }, { orte: 50, horizonte: 1 }) }],
            },
            4: {
                u: { orte: 100 },
                soll: [K.soll(BO, 4, "Anteile je Klima gegen SoilGrids ±25 %", { key: "anteilJeSoilGrids", ref: 1, refQuelle: "Erde: SoilGrids 250 m (Hengl et al. 2017), WRB-Referenzgruppen je Klima" }), K.soll(BO, 4, "100 Zufallsorten", { key: "orte", rel: "≥" })],
                auge: { pose: "Anschnitt an der Wiese (heute: die Oberfläche, kein Graben)", vorbild: "WRB-Referenzprofile (Blind-Klassierung R11)" },
                taeter: "stamm/kreatur-leben.js _bodenKlasseAt (Lebensraum-Klassen, keine Bodengruppe)",
                nicht: "keine Referenz-Bodengruppen",
                leser: "stamm/kreatur-leben.js:1703 _bodenKlasseAt — die Klasse des Lebensraums (Abstand zum Wasser, Hang, Wald), keine WRB-Gruppe aus Klima × Gestein",
                gruen: gut({ anteilJeSoilGrids: 1.1, orte: 100 }, {}),
                attrappen: [{ name: "SoilGrids eingesetzt ohne Graben", roh: leer({ anteilJeSoilGrids: 1, orte: 100 }) }],
            },
            5: {
                u: {},
                soll: [K.soll(BO, 5, "ΔE ≤ 10", { key: "deltaE" }), K.soll(BO, 5, "Blind-Fehler ≥ 35 %", { key: "fehlerProzent", einheit: "%" })],
                auge: { pose: "Anschnitt an der Wiese (heute: die Oberfläche)", vorbild: "Referenzprofil-Fotos der 32 WRB-Gruppen (Munsell), Blindpaar R11" },
                taeter: "stamm/gelaende-boden.js _bodenFarbeAt (Rausch-Fleck)",
                nicht: "keine Bodengruppen, keine Munsell-Farbe",
                leser: "stamm/gelaende-boden.js:2536 _bodenFarbeAt — die Farbe aus dem Welt-Feld, keine Farbe je Horizont und Gruppe",
                gruen: gut({ deltaE: 7, fehlerProzent: 38 }, {}),
                attrappen: [{ name: "ΔE ohne Anschnitt", roh: leer({ deltaE: 5, fehlerProzent: 40 }) }],
            },
            6: {
                u: {},
                soll: [K.soll(BO, 6, "≥ 90 % der Stichproben", { key: "folgeProzent", einheit: "%" }), K.soll(BO, 6, "Fehler ≥ 35 %", { key: "fehlerProzent", einheit: "%" })],
                auge: { pose: "Anschnitt an der Wiese (heute: die Oberfläche)", vorbild: "Mond-/Mars-Fotos des Regoliths (Blindpaar R11)" },
                taeter: "stamm/vegetation-wiese.js _terrainMaterialAt (keine Zeit in der Säule)",
                nicht: "keine Paläoböden, kein Regolith",
                leser: "stamm/vegetation-wiese.js:2362 _terrainMaterialAt — die Säule liest keine Epoche; der Faden trägt keinen Boden je Epoche (voxel-worker.js:1175)",
                gruen: gut({ folgeProzent: 92, fehlerProzent: 38 }, {}),
                attrappen: [{ name: "die Folge ohne Anschnitt", roh: leer({ folgeProzent: 95, fehlerProzent: 40 }) }],
            },
        },
    };

    // ════════════════════════════════════════ WANDEL (S1–S7) ════════════════════════════════════════
    const wandel = {
        sek: 55,
        faecher: true,
        pfad: PFAD,
        mutiert: true,
        ungefahren: "die Bildpaare vorher/nachher und die Fremdwelt-Probe schießt die Probe nur am Gerät",
        mess: async function (H, U, M) {
            const R3 = (v) => (Number.isFinite(v) ? Math.round(v * 1000) / 1000 : null);
            const med = (a) => (a.length ? a.slice().sort((p, q) => p - q)[a.length >> 1] : NaN);
            const mittelW = (x) => x.reduce((s, v) => s + v, 0) / x.length;
            const ziel = Object.keys(U);
            // DIE WELT IN SPIELZEIT (S1, S2): die Sohle an 40 nassen Punkten der Läufe am Spawn und ein Hektar am Lauf vor und nach 10 min
            // Spielzeit (Pegel nachgezogen), dann 10 Läufe unter Regen und Sturm (`__wetterSetzen`) über 10–50 min; danach Uhr und Wetter zurück
            const zeit = await H.seite(`
const K = globalThis.__gelaendeCore, L = r._gelaende(), st = r.state;
const R3 = (v) => (Number.isFinite(v) ? Math.round(v * 1000) / 1000 : null);
const lf = K.flussLaeufe(L, -1500, -1500, 1500, 1500, 20);
const P = [];
for (const l of lf) for (const g of l.glieder) for (let i = 0; i < g.bahn.length && P.length < 40; i += 7) { const q = g.bahn[i]; if (r._nassAt(q.x, q.z)) P.push([q.x, q.z]); }
const c = P[0] || [0, 0];
const ha = []; for (let j = 0; j < 10; j++) for (let i = 0; i < 10; i++) ha.push([c[0] - 45 + 10 * i, c[1] - 45 + 10 * j]);
const mess = () => P.concat(ha).map(([x, z]) => r._voxelSurfaceY(x, z));
const alt = [st.spielZeit, st.weather];
const reihe = [];
let fehler = null;
try {
const v0 = mess();
st.spielZeit = alt[0] + 600; if (typeof r._pegelTakt === "function") r._pegelTakt();
reihe.push(["10min", 0, 10, mess()]);
for (let i = 0; i < 10; i++) { const w = i < 5 ? "rainy" : "stormy", min = 10 * ((i % 5) + 1); if (window.__wetterSetzen(w) !== w) throw new Error("das Wetter gilt nicht: " + w); st.spielZeit = alt[0] + 600 + min * 60; if (typeof r._pegelTakt === "function") r._pegelTakt(); reihe.push([w, (w === "stormy" ? 2 : 1) * min, min, mess()]); }
const d = reihe.map(([n, menge, min, v]) => [n, menge, min, R3(v.reduce((s, y, i) => s + (y !== null && v0[i] !== null ? Math.abs(y - v0[i]) : 0), 0)), v.filter((y, i) => y !== null && v0[i] !== null && Math.abs(y - v0[i]) > 0.05).length]);
return { punkte: P.length, hektar: ha.length, d, v0: v0.slice(0, 5).map(R3), wetter: alt[1] };
} catch (e) { fehler = String(e && e.message || e); return { fehler }; }
finally { st.spielZeit = alt[0]; if (typeof r._pegelTakt === "function") r._pegelTakt(); window.__wetterSetzen(alt[1]); }
`);
            // DIE ZEIT DES PLANETEN (S3, S4, S5, S6): dieselbe Lage zu zwei Zeiten (heute und +100 a / +1 000 a), der Lauf der Saat an beiden;
            // die Küste über 10³ a; die Kaltzeit −21 ka; 100 Orte × 10 Epochen (0 … −900 Ma) mit Hack und Bifurkation im 4-km-Fenster
            const pl = await H.seite(`
const K = globalThis.__gelaendeCore;
const samen = r._planetSamen();
await r._fadenQuelle();
const heim = r.constructor._weltGesetz(r.state.worldMeta).gelaende;
const R3 = (v) => (Number.isFinite(v) ? Math.round(v * 1000) / 1000 : null);
const ortVon = (o) => ({ samen: o.samen, version: o.version, breite: o.breite, laenge: o.laenge, zeitMa: o.zeitMa, delta: o.delta });
const lage = (o) => { const ort = ortVon(o); const O = K.ortGesetz(ort); const eg = K.erbgutNormal(K.ortErbgut(K.erbgutNormal(heim == null ? undefined : heim), o.delta.wildnis)); const saat = K.ortSaatWahl(ort, eg, SimplexNoise).saat; return { saat, O, L: K.lageAus({ seed: saat, baseHeight: K.GRUND.basis, waterLevel: K.GRUND.basis - O.meerUnterBasisM, ort, erbgut: { terme: eg, wildnis: eg[0] && eg[0].art === "wildnis" ? 1 : 0 }, regionSize: K.GRUND.kachel }, SimplexNoise) }; };
const lagePunkt = (k) => [Math.round((Math.asin(((k * 0.6180339887) % 1) * 2 - 1) * 180) / Math.PI * 100) / 100, Math.round((((k * 137.508) % 360) - 180) * 100) / 100];
const ort = (p, z) => r._planetAuftrag({ type: "planet-ort", samen, breite: p[0], laenge: p[1], zeitMa: z });
const kenn = (L, w) => {
const lf = K.flussLaeufe(L, -w, -w, w, w, 100);
const key = (x, z) => Math.round(x) + "," + Math.round(z);
const ab = new Map(), k0 = [], px = [], py = [];
for (const l of lf) { let cum = 0; for (let i = 0; i < l.glieder.length; i++) { const g = l.glieder[i], b = g.bahn; cum += b && b.length ? b[b.length - 1].s : Math.hypot(g.bx - g.ax, g.bz - g.az); const nA = i + 1 < l.glieder.length ? l.glieder[i + 1].A : 0; if (l.quelle && nA > 0) { px.push(Math.log(nA)); py.push(Math.log(cum)); } ab.set(key(g.ax, g.az), [key(g.bx, g.bz), g.bx, g.bz, l.ende === "muendung" && i === l.glieder.length - 1]); if (l.k === 0) k0.push([key(g.ax, g.az), g.ax, g.az]); } }
let hack = null;
if (px.length > 5) { const mx = px.reduce((s, v) => s + v, 0) / px.length, my = py.reduce((s, v) => s + v, 0) / py.length; let sxy = 0, sxx = 0; for (let i = 0; i < px.length; i++) { sxy += (px[i] - mx) * (py[i] - my); sxx += (px[i] - mx) * (px[i] - mx); } hack = sxx > 0 ? sxy / sxx : null; }
const unten = new Map();
for (const [k, v] of ab) { let d = v[0]; if (!ab.has(d) && v[3] && k0.length) { let best = null, bd = Infinity; for (const q of k0) { const e = Math.hypot(q[1] - v[1], q[2] - v[2]); if (e < bd) { bd = e; best = q[0]; } } d = best; } unten.set(k, ab.has(d) && d !== k ? d : null); }
const oben = new Map();
for (const [k, d] of unten) if (d) { if (!oben.has(d)) oben.set(d, []); oben.get(d).push(k); }
const ord = new Map();
const ordnung = (k) => { if (ord.has(k)) return ord.get(k); ord.set(k, 1); const o = oben.get(k) || []; let m = 0, c = 0; for (const u of o) { const x = ordnung(u); if (x > m) { m = x; c = 1; } else if (x === m) c++; } const w2 = o.length ? (c >= 2 ? m + 1 : m) : 1; ord.set(k, w2); return w2; };
for (const k of unten.keys()) ordnung(k);
const N = [];
for (const [k, d] of unten) { const o = ord.get(k); if (!d || ord.get(d) !== o) N[o] = (N[o] || 0) + 1; }
const rb = [];
for (let o = 1; o + 1 < N.length; o++) if (N[o] && N[o + 1]) rb.push(N[o] / N[o + 1]);
return { hack, bif: rb.length ? Math.exp(rb.reduce((s, v) => s + Math.log(v), 0) / rb.length) : null, lf };
};
const t0 = performance.now();
const aus = {};
const land = [];
for (let k = 0; land.length < 3 && k < 200; k++) { const p = lagePunkt(k); const a = await ort(p, 0); const b = await ort(p, -0.0001); if (a.land && b.land) land.push([p, a, b]); }
aus.mae = land.map(([p, a, b]) => {
const A = lage(a), B = lage(b);
const ka = kenn(A.L, 2000).lf.filter((l) => l.k === 0), kb = kenn(B.L, 2000).lf.filter((l) => l.k === 0);
const pa = ka.flatMap((l) => l.glieder.flatMap((g) => g.bahn)).filter((q, i) => i % 5 === 0), pb = kb.flatMap((l) => l.glieder.flatMap((g) => g.bahn));
const d = pa.slice(0, 200).map((q) => Math.min(...pb.map((u) => Math.hypot(u.x - q.x, u.z - q.z))));
d.sort((x, y) => x - y);
const brei = ka.length ? K.flussBreite(ka[0].glieder[0].A) : null;
let hk = 0, ha = 0, hb = 0, kk = 0, aa = 0, bb = 0, n = 0;
for (let i = 0; i < 100; i++) { const x = (i % 10) * 300 - 1500, z = Math.floor(i / 10) * 300 - 1500; const u = K.hoehe(A.L, x, z, true), v = K.hoehe(B.L, x, z, true); ha += u; hb += v; kk += u * v; aa += u * u; bb += v * v; n++; }
const ma = ha / n, mb = hb / n, korr = (kk / n - ma * mb) / Math.sqrt(Math.max(1e-9, (aa / n - ma * ma) * (bb / n - mb * mb)));
return { lage: p, saaten: [A.saat, B.saat], versatzMedianM: R3(d[d.length >> 1]), breiteM: R3(brei), hoeheKorr: R3(korr), punkte: d.length };
});
const kp = []; for (let k = 0; kp.length < 20 && k < 800; k++) { const p = lagePunkt(k); const a = await ort(p, 0); if (Math.abs(a.kuesteKm) < 30) kp.push([p, a.kuesteKm]); }
const kq = await Promise.all(kp.map(([p]) => ort(p, -0.001)));
aus.kueste = kp.map(([p, km], i) => R3(Math.abs(kq[i].kuesteKm - km) * 1000));
const kalt = []; for (let k = 0; kalt.length < 10 && k < 600; k++) { const p = lagePunkt(k); if (Math.abs(p[0]) < 40) continue; const a = await ort(p, 0); if (!a.land) continue; const x = lage(a); if (x.O.klimaHeute.sommer < 12) kalt.push([p, a, x]); }
const lgm = await Promise.all(kalt.map(([p]) => ort(p, -0.021)));
const quer = (L) => { const lf = K.flussLaeufe(L, -2000, -2000, 2000, 2000, 50); let best = null; for (const l of lf) if (l.k === 0 && (!best || l.glieder.length > best.glieder.length)) best = l; if (!best) return [null, null]; const g = best.glieder[best.glieder.length >> 1], q = g.bahn[g.bahn.length >> 1]; const nx = -q.fz, nz = q.fx, h0 = K.hoehe(L, q.x, q.z, true); const px = [], py = []; for (const d of [20, 40, 80, 160, 320]) { const h = (K.hoehe(L, q.x + nx * d, q.z + nz * d, true) + K.hoehe(L, q.x - nx * d, q.z - nz * d, true)) / 2 - h0; if (h > 0.5) { px.push(Math.log(d)); py.push(Math.log(h)); } } if (px.length < 3) return [null, R3(h0)]; const mx = px.reduce((s, v) => s + v, 0) / px.length, my = py.reduce((s, v) => s + v, 0) / py.length; let sxy = 0, sxx = 0; for (let i = 0; i < px.length; i++) { sxy += (px[i] - mx) * (py[i] - my); sxx += (px[i] - mx) ** 2; } return [sxx > 0 ? R3(sxy / sxx) : null, R3(h0)]; };
aus.eis = kalt.map(([p, a, x], i) => { const y = lage(lgm[i]); return [R3(x.O.klimaHeute.sommer), R3(y.O.klimaHeute.sommer), R3(K.SCHNEE.start + x.O.schneeBandM), R3(K.SCHNEE.start + y.O.schneeBandM), R3(a.delta.meer.waterLevelM), R3(lgm[i].delta.meer.waterLevelM), x.saat === y.saat].concat(quer(x.L)); });
const warm = []; for (let k = 0; warm.length < 10 && k < 600; k++) { const p = lagePunkt(k); if (Math.abs(p[0]) > 35) continue; const a = await ort(p, 0); if (!a.land) continue; const x = lage(a); if (x.O.klimaHeute.sommer > 18) warm.push(quer(x.L)); }
aus.warm = warm;
aus.eisMs = Math.round(performance.now() - t0);
const epochen = [0, -100, -200, -300, -400, -500, -600, -700, -800, -900];
const pk = Array.from({ length: 100 }, (_, k) => lagePunkt(k));
const ep = [];
for (const z of epochen) {
if (performance.now() - t0 > 33000) break;
const a = await Promise.all(pk.map((p) => ort(p, z)));
let n = 0, inB = 0, land2 = 0; const hs = [];
for (const o of a) { hs.push(o.hoeheM); if (!o.land) continue; land2++; if (performance.now() - t0 > 36000) continue; const k = kenn(lage(o).L, 2000); n++; if (k.hack !== null && k.hack >= 0.5 && k.hack <= 0.6 && k.bif !== null && k.bif >= 3 && k.bif <= 5) inB++; }
ep.push([z, a.length, land2, n, inB, R3(hs.reduce((s, v) => s + v, 0) / hs.length)]);
}
aus.epochen = ep;
aus.hoehen = pk.slice(0, 5).map((p, i) => ep.length);
aus.ms = Math.round(performance.now() - t0);
return aus;
`);
            const aus = M.teil || {};
            // je Lauf [Wetter, Regenmenge (Regen 1 · Sturm 2 je min), Minuten, Σ|Δ| m, geänderte Zellen > 5 cm]
            const dz = (zeit && zeit.d) || [];
            // S1 DER GRABEN AM FÄCHER (M4): je Adresse (Graben × Zeit) ein Graben des Spielers über das Verb (`carveVoxel`, dasselbe,
            // das die Hand und die DSL rufen) neben einem nassen Punkt der Läufe am Spawn, 1,5 m oder 3 m landeinwärts; das Wasser
            // fließt hinein (der Automat, `_nassAt` an der Sohle), dann die Uhr der Welt 1 · 3 · 10 min vor (`spielZeit`, `_pegelTakt`)
            // und der Boden im Raster 9 × 9 m um den Graben (`_voxelSurfaceY`, das Feld mit den Edits): Abtrag und Ablagerung gegen
            // den Boden gleich nach dem Graben. Der Graben bleibt (mutiert: die Grundstellung räumt nach der Probe)
            const u1 = U[1];
            if (u1) {
                const GRABEN_AN = async (r, T, a, mit) => {
                    const G = globalThis.__gelaendeCore, st = r.state;
                    const memo = mit.memo || (mit.memo = { graeben: {} });
                    if (!memo.punkte) {
                        const lf = G.flussLaeufe(r._gelaende(), -1500, -1500, 1500, 1500, 20);
                        const P = [];
                        for (const l of lf) for (const g of l.glieder) for (let i = 0; i < g.bahn.length && P.length < mit.punkte; i += 13) { const q = g.bahn[i]; if (r._nassAt(q.x, q.z)) P.push([q.x, q.z, -q.fz, q.fx]); }
                        memo.punkte = P;
                    }
                    const k = a.ort[0], ab = a.ort[1], p = memo.punkte[k];
                    if (!p) return { fehlt: "kein nasser Punkt " + k + " an den Läufen um den Spawn (gelaende-core flussLaeufe × _nassAt)" };
                    const key = k + ":" + ab;
                    let g = memo.graeben[key];
                    if (!g) {
                        const s = r._nassAt(p[0] + p[2] * (ab + 2), p[1] + p[3] * (ab + 2)) ? -1 : 1;
                        const cx = p[0] + s * p[2] * ab, cz = p[1] + s * p[3] * ab, y = r._voxelSurfaceY(cx, cz);
                        if (y === null) return { fehlt: "kein Boden am Graben " + key };
                        const raster = [];
                        for (let j = -4; j <= 4; j++) for (let i = -4; i <= 4; i++) raster.push([cx + i, cz + j]);
                        const vor = raster.map(([x, z]) => r._voxelSurfaceY(x, z));
                        if (!r.carveVoxel(cx, y, cz, mit.radius)) return { fehlt: "carveVoxel nahm den Graben " + key + " nicht" };
                        await new Promise((f) => setTimeout(f, mit.wartMs));
                        const y0 = raster.map(([x, z]) => r._voxelSurfaceY(x, z));
                        let grab = 0;
                        for (let i = 0; i < raster.length; i++) if (vor[i] !== null && y0[i] !== null && vor[i] > y0[i]) grab += vor[i] - y0[i];
                        g = memo.graeben[key] = { raster, y0, grab: Math.round(grab * 1000) / 1000, nass: r._nassAt(cx, cz) ? 1 : 0, sohle: Math.round(r._voxelSurfaceY(cx, cz) * 1000) / 1000, pos: [Math.round(cx * 10) / 10, Math.round(cz * 10) / 10] };
                    }
                    const alt = st.spielZeit;
                    let yt;
                    try {
                        st.spielZeit = alt + a.zeit * 60;
                        if (typeof r._pegelTakt === "function") r._pegelTakt();
                        yt = g.raster.map(([x, z]) => r._voxelSurfaceY(x, z));
                    } finally {
                        st.spielZeit = alt;
                        if (typeof r._pegelTakt === "function") r._pegelTakt();
                    }
                    let abtrag = 0, auf = 0;
                    for (let i = 0; i < yt.length; i++) if (yt[i] !== null && g.y0[i] !== null) { const d = yt[i] - g.y0[i]; if (d < 0) abtrag -= d; else auf += d; }
                    return { graben: key, zeit: a.zeit, abtrag: Math.round(abtrag * 1000) / 1000, ablagerung: Math.round(auf * 1000) / 1000, grab: g.grab, nass: g.nass, sohle: g.sohle, pos: g.pos };
                };
                const ORTE1 = [];
                for (let k = 0; k < (Number(u1.graeben) || 8) / 2; k++) for (const ab of [1.5, 3]) ORTE1.push([k, ab]);
                const ZEIT1 = u1.zeiten || [1, 3, 10], letzte = ZEIT1[ZEIT1.length - 1];
                const RG = await FAECHER((c) => H.seite(c), {
                    gesetz: { fn: GRABEN_AN, export: "stamm/gelaende-chunks.js:3102 carveVoxel → :3021 _addVoxelEdit (der einzige Schreiber von worldMeta.voxelEdits) · stamm/wasser-hydro.js:915 _nassAt", leser: "stamm/feld-dsl.js:1000 carveVoxel (das Verb graben) · stamm/gelaende-chunks.js:2142 _voxelSurfaceY (der Boden mit den Edits)" },
                    adressen: { orte: ORTE1, zeiten: ZEIT1 },
                    mit: { punkte: ORTE1.length / 2, radius: 2, wartMs: Number(u1.wartMs) || 600 },
                    ms: Number(u1.ms) || 9000,
                    masse: {
                        adressen: { wie: "anzahl", feld: "zeit" },
                        graeben: { wie: "verschieden", feld: "graben" },
                        zeiten: { wie: "verschieden", feld: "a.zeit" },
                        grabM3: { wie: "summe", feld: "grab", nur: (a, w) => a.zeit === ZEIT1[0] },
                        geflutet: { wie: "summe", feld: "nass", nur: (a, w) => a.zeit === ZEIT1[0] },
                        abtragM3: { wie: "summe", feld: "abtrag", nur: (a, w) => a.zeit === letzte },
                        ablagerungM3: { wie: "summe", feld: "ablagerung", nur: (a, w) => a.zeit === letzte },
                        minuten: { wie: "min", feld: "a.zeit", nur: (a, w) => w.abtrag > 0.05 },
                    },
                    schlecht: { feld: "abtrag", richtung: "min" },
                    pose: (a, w) => "Third 6 m über dem Graben " + w.graben + " bei " + JSON.stringify(w.pos) + " (Sohle " + w.sohle + " m, " + (w.nass ? "geflutet" : "trocken") + "), " + a.zeit + " min nach dem Graben, Blick auf Sohle und Fuß",
                    ungemessen: ["das Bildpaar vorher/nachher am Graben (am Gerät)"],
                });
                const W1 = RG.werte, bilanz = W1.abtragM3 > 0 ? W1.ablagerungM3 / W1.abtragM3 : null;
                aus[1] = {
                    werte: Object.assign({ abtragM3: R3(W1.abtragM3), ablagerungM3: R3(W1.ablagerungM3) }, bilanz !== null ? { ablagerungJeAbtrag: R3(bilanz) } : {}, W1.minuten != null ? { minuten: W1.minuten } : {}),
                    zeuge: { adressen: W1.adressen, graeben: W1.graeben, zeiten: W1.zeiten, grabM3: R3(W1.grabM3), geflutet: W1.geflutet, abtragM3: W1.abtragM3, gerissen: RG.gerissen, akte: RG.akte },
                    taeter: (RG.fehler.length && !RG.gemessen ? "Leser fehlt: " + RG.fehler[0].fehler + " · " : "") + "das Wasser gräbt nicht: worldMeta.voxelEdits schreibt nur stamm/gelaende-chunks.js:3021 _addVoxelEdit aus dem Verb (stamm/feld-dsl.js:1000), der Automat des Wassers füllt den Graben (" + W1.geflutet + " von " + W1.graeben + " geflutet) und trägt kein Sediment — " + R3(W1.abtragM3) + " m Abtrag nach " + letzte + " min an " + W1.graeben + " Gräben (gelaende-core trägt kein Abtrag-Gesetz, keine Exner-Bilanz) · " + RG.akte,
                };
            }
            // S2: 10 Läufe unter wachsender Regenmenge (Regen und Sturm je 10–50 min); Rinnen = geänderte Zellen; Rang (Spearman) Menge ↔ Rinnen
            const rain = dz.filter((x) => x[0] === "rainy" || x[0] === "stormy");
            const rangV = (a) => { const s = a.map((v, i) => [v, i]).sort((p, q) => p[0] - q[0]); const rr = new Array(a.length); let k = 0; while (k < s.length) { let e = k; while (e + 1 < s.length && s[e + 1][0] === s[k][0]) e++; for (let m = k; m <= e; m++) rr[s[m][1]] = (k + e) / 2; k = e + 1; } return rr; };
            const rinnen = rain.map((x) => x[4] || 0), menge = rain.map((x) => x[1]);
            let rangS = null;
            if (rain.length >= 3 && new Set(rinnen).size > 1) {
                const ra = rangV(menge), rb = rangV(rinnen), ma = mittelW(ra), mb = mittelW(rb);
                let a2 = 0, b2 = 0, c2 = 0;
                ra.forEach((v, i) => ((a2 += (v - ma) * (rb[i] - mb)), (b2 += (v - ma) ** 2), (c2 += (rb[i] - mb) ** 2)));
                rangS = a2 / Math.sqrt(b2 * c2);
            }
            aus[2] = {
                werte: Object.assign({ laeufe: rain.length, rinnenSumme: rinnen.reduce((s, v) => s + v, 0) }, rangS !== null ? { rang: R3(rangS) } : {}),
                zeuge: { laeufe: rain.length, rinnenAenderung: rain.reduce((s, x) => s + (x[3] || 0), 0), je: rain },
                nicht: "kein Starkregen formt das Relief: " + rain.length + " Läufe unter Regen und Sturm (10–50 min) ändern Sohle und Hektar um " + R3(rain.reduce((s, x) => s + (x[3] || 0), 0)) + " m, " + rinnen.reduce((s, v) => s + v, 0) + " Zellen > 5 cm (keine Rinne, kein Schwemmkegel, kein Hangrutsch); das Wetter ist ein Wort (window.__wetterSetzen), keine Regenmenge",
            };
            const mae = (pl && pl.mae) || [];
            const rate = mae.filter((x) => x.breiteM > 0 && Number.isFinite(x.versatzMedianM)).map((x) => (100 * x.versatzMedianM) / x.breiteM / 100);
            aus[3] = {
                werte: Object.assign({ lagen: mae.length }, rate.length ? { migrationProzentJeJahr: R3(med(rate)) } : {}, { hoeheKorr: R3(med(mae.map((x) => x.hoeheKorr))) }),
                zeuge: { lagen: mae.length, je: mae },
                auge: await M.auge("relief-wandel-s3", { ort: "wiese" }),
                nicht: "der Mäander wandert nicht: 100 a später ist die Saat eine andere (gelaende-core.js:5802 ortSaat trägt die Zeit) — der Lauf springt um " + R3(med(mae.map((x) => x.versatzMedianM))) + " m, das Gelände korreliert " + R3(med(mae.map((x) => x.hoeheKorr))) + "; keine Abschnürung, kein Auenlehm; die Reise kennt nur ganze Ma (stamm/feld-leben.js:1272)",
            };
            const ku = (pl && pl.kueste) || [];
            aus[4] = { werte: { kuesten: ku.length, kuesteVerlagerungM: R3(med(ku)) }, zeuge: { kuesten: ku.length, je: ku }, nicht: "kein Delta, keine Düne: kein Leser legt Sediment an der Mündung ab oder treibt Sand (gelaende-core.js); die Küste der Zeit ist die des Planeten (Verlagerung über 10³ a " + R3(med(ku)) + " m)" };
            // S5: je kalter Ort [Sommer heute, Sommer −21 ka, Schneegrenze heute, Schneegrenze −21 ka, Meer, Meer −21 ka, dieselbe Saat, b, Sohle];
            // der Trog (Querschnitt-Exponent b ≥ 1,5) zählt als glaziale Form nur, wenn er an kalten Orten um ≥ 20 Punkte häufiger ist als an warmen
            const eis = (pl && pl.eis) || [], warm = (pl && pl.warm) || [];
            const mitB = (a, i) => a.filter((x) => x[i] !== null && x[i] !== undefined);
            const trogK = mitB(eis, 7), trogW = mitB(warm, 0);
            const antK = trogK.length ? trogK.filter((x) => x[7] >= 1.5).length / trogK.length : null, antW = trogW.length ? trogW.filter((x) => x[0] >= 1.5).length / trogW.length : null;
            const glazial = antK !== null && antW !== null && antK - antW >= 0.2 ? 1 : 0;
            const troege = trogK.filter((x) => x[7] >= 1.5 && x[8] !== null);
            aus[5] = {
                werte: Object.assign({ glazialKlassen: glazial, fjordeNieVereist: 0, kalteOrte: eis.length, trogKaltProzent: antK !== null ? R3(100 * antK) : null, trogWarmProzent: antW !== null ? R3(100 * antW) : null, lgmMeerM: eis.length ? eis[0][5] : null, lgmKuehlungGrad: eis.length ? R3(med(eis.map((x) => x[1] - x[0]))) : null }, glazial && troege.length ? { oberhalbProzent: R3((100 * troege.filter((x) => x[8] >= x[3]).length) / troege.length) } : {}),
                zeuge: { kalteOrte: eis.length, glazialeFormen: glazial, warmeOrte: warm.length, je: eis, warm },
                nicht: "kein Eiszeit-Zyklus formt das Relief: −21 ka ist eine andere Saat (" + (eis.length && eis[0][6] === false ? "andere Saat" : "gleich") + "), das Meer liegt " + (eis.length ? eis[0][5] : "?") + " m; der Trog (b ≥ 1,5) steht an " + (antK !== null ? R3(100 * antK) : "?") + " % der kalten (b messbar an " + trogK.length + " von " + eis.length + ") und " + (antW !== null ? R3(100 * antW) : "?") + " % der warmen Orte (" + trogW.length + " von " + warm.length + ") — er folgt dem Profil-Gesetz, nicht dem Eis; kein Fjord, Kar, keine Moräne, kein Findling, kein Löss (gelaende-core.js:5802 ortSaat; planet-core.js:1883 planetKlimaGlobal ohne Bahn-Zyklen)",
            };
            const ep = (pl && pl.epochen) || [];
            const nL = ep.reduce((s, x) => s + x[3], 0), inB = ep.reduce((s, x) => s + x[4], 0);
            aus[6] = {
                werte: { orte: ep.length ? ep[0][1] : 0, epochen: ep.length, lagen: nL, inBaendernProzent: nL ? R3((100 * inB) / nL) : null },
                zeuge: { lagen: nL, epochen: ep.length, hoeheStreuM: R3(Math.sqrt(ep.reduce((s, x) => s + x[5] * x[5], 0) / Math.max(1, ep.length) - (ep.reduce((s, x) => s + x[5], 0) / Math.max(1, ep.length)) ** 2)), je: ep },
            };
            aus[7] = { werte: { welten: 1 }, zeuge: {}, auge: await M.auge("relief-wandel-s7", { ort: "wiese" }), nicht: "keine Abtragsgeschichte je Welt: jede Epoche würfelt die Saat neu (gelaende-core.js:5802 ortSaat), der Faden liest keine Konstanten (voxel-worker.js:1176) — 100 Welten × 10 Epochen tragen kein Agens und kein Alter im Relief" };
            const o = {};
            for (const nr of ziel) o[nr] = aus[nr] || M.nicht("ungemessen");
            return { sprossen: o };
        },
        sprossen: {
            1: {
                u: { graeben: 8, zeiten: [1, 3, 10], wartMs: 600, ms: 9000 },
                soll: [
                    K.soll(WA, 1, "Abtrag = Ablagerung ±10 %", { key: "ablagerungJeAbtrag", ref: 1, refQuelle: "Erde: Massenerhaltung des Sediments (Exner-Gleichung) — Ablagerung je Abtrag = 1" }),
                    K.soll(WA, 1, "≤ 10 min Spielzeit", { key: "minuten", einheit: "min" }),
                ],
                zeuge: (roh) => {
                    const z = (roh && roh.zeuge) || {};
                    const m = zMin({ graeben: 6, zeiten: 3, grabM3: 1, geflutet: 1 })(roh);
                    if (m) return m;
                    return z.abtragM3 > 0 ? null : "die Sohle blieb gleich (Abtrag " + z.abtragM3 + " m an " + z.graeben + " Gräben) — die Welt grub nicht";
                },
                zeugeText: "der Fächer: ≥ 6 Gräben des Spielers über das Verb, ≥ 1 vom Wasser geflutet, an 3 Zeiten — und das Wasser trug Boden ab",
                taeter: "stamm/gelaende-chunks.js:3021 _addVoxelEdit (der einzige Schreiber der Edits: das Verb, nie das Wasser)",
                leser: "stamm/gelaende-chunks.js:2142 _voxelSurfaceY — der Boden liest Gesetz + Edits; kein Schreiber trägt Abtrag und Ablagerung des Wassers (gelaende-core ohne Sediment-Gesetz)",
                gruen: gut({ ablagerungJeAbtrag: 0.95, minuten: 8 }, { graeben: 8, zeiten: 3, grabM3: 30, geflutet: 5, abtragM3: 2.4 }),
                attrappen: [
                    { name: "die Bilanz 1 ohne Abtrag (0 = 0)", roh: gut({ ablagerungJeAbtrag: 1, minuten: 10 }, { graeben: 8, zeiten: 3, grabM3: 30, geflutet: 5, abtragM3: 0 }) },
                    { name: "EIN Graben (die Bilanz einer Stelle)", roh: gut({ ablagerungJeAbtrag: 0.95, minuten: 8 }, { graeben: 1, zeiten: 3, grabM3: 4, geflutet: 1, abtragM3: 0.4 }) },
                    { name: "der trockene Graben (kein Wasser floss hinein)", roh: gut({ ablagerungJeAbtrag: 0.95, minuten: 8 }, { graeben: 8, zeiten: 3, grabM3: 30, geflutet: 0, abtragM3: 2.4 }) },
                    { name: "Abtrag ohne Ablagerung (das Sediment verschwindet)", roh: gut({ ablagerungJeAbtrag: 0.3, minuten: 8 }, { graeben: 8, zeiten: 3, grabM3: 30, geflutet: 5, abtragM3: 2.4 }) },
                    { name: "der Graben steht (der Fächer am Verb: kein Abtrag nach 10 min)", roh: gut({ abtragM3: 0, ablagerungM3: 0 }, { graeben: 8, zeiten: 3, grabM3: 30, geflutet: 5, abtragM3: 0 }) },
                ],
            },
            2: {
                u: { wetter: ["rainy", "stormy"], minuten: [10, 20, 30, 40, 50] },
                soll: [K.soll(WA, 2, "Rang ≥ 0,8", { key: "rang" }), K.soll(WA, 2, "10 Läufen", { key: "laeufe", rel: "≥" })],
                zeuge: zMin({ laeufe: 10, rinnenAenderung: 1e-6 }),
                zeugeText: "10 Läufe unter wachsendem Regen, neue Rinnen gezählt",
                taeter: "gelaende-core.js hoehe (kein Regen im Relief)",
                nicht: "kein Starkregen formt das Relief",
                leser: "stamm/gelaende-chunks.js:2144 _voxelSurfaceY — das Relief liest keinen Regen; das Wetter trägt keine Regenmenge",
                gruen: gut({ rang: 0.86, laeufe: 10 }, { laeufe: 10, rinnenAenderung: 12 }),
                attrappen: [{ name: "der Rang ohne neue Rinne", roh: gut({ rang: 0.9, laeufe: 10 }, { laeufe: 10, rinnenAenderung: 0 }) }],
            },
            3: {
                u: { jahre: 100 },
                soll: [K.soll(WA, 3, "Migrationsrate 1–5 % Breite/Jahr", { key: "migrationProzentJeJahr", einheit: "%/a" })],
                auge: { pose: "Ego an der Wiese (der Lauf im Zeitraffer)", vorbild: "Landsat-Zeitreihe eines Mäanders (Bildfolge, R11)" },
                taeter: "gelaende-core.js ortSaat (die Zeit würfelt die Saat neu)",
                nicht: "der Mäander wandert nicht (die Saat springt)",
                leser: "gelaende-core.js:5802 ortSaat — die Zeit ist Teil der Saat: dieselbe Lage 100 a später ist ein neues Gelände, kein Leser führt den Lauf fort",
                gruen: gut({ migrationProzentJeJahr: 2.4 }, { lagen: 3 }),
                attrappen: [{ name: "die Rate ohne Bildfolge", roh: leer({ migrationProzentJeJahr: 2.4 }) }],
            },
            4: {
                u: { jahre: 1000 },
                soll: [
                    K.soll(WA, 4, "Delta-Wachstum gegen Sedimentfracht ±30 %", { key: "deltaJeFracht", ref: 1, refQuelle: "Erde: Delta-Fläche wächst mit der Sedimentfracht (Syvitski & Saito 2007)" }),
                    K.soll(WA, 4, "Barchan 10–30 m/a", { key: "barchanMJeA", einheit: "m/a" }),
                ],
                zeuge: zMin({ deltas: 1, duenen: 1 }),
                zeugeText: "ein Delta wuchs, eine Düne wanderte",
                taeter: "gelaende-core.js (kein Sediment an der Mündung, kein Sand im Wind)",
                nicht: "kein Delta, keine Düne",
                leser: "gelaende-core.js:1953 flussLaeufe — der Lauf endet im Meer ohne Ablagerung; kein Leser treibt Sand",
                gruen: gut({ deltaJeFracht: 1.1, barchanMJeA: 18 }, { deltas: 1, duenen: 1 }),
                attrappen: [{ name: "Barchan 18 m/a aus der Literatur", roh: leer({ deltaJeFracht: 1, barchanMJeA: 18 }) }],
            },
            5: {
                u: { zeitMa: -0.021 },
                soll: [
                    K.soll(WA, 5, "≥ 8 glaziale Formklassen", { key: "glazialKlassen" }),
                    K.soll(WA, 5, "≥ 90 % oberhalb der Kaltzeit-Schneegrenze", { key: "oberhalbProzent", einheit: "%" }),
                    K.soll(WA, 5, "≥ 80 % der Fjorde unter ehemaligem Eis", { key: "fjordeUnterEisProzent", einheit: "%" }),
                    K.soll(WA, 5, "0 in nie vereisten Breiten", { key: "fjordeNieVereist", rel: "=" }),
                ],
                zeuge: zMin({ kalteOrte: 10, glazialeFormen: 8 }),
                zeugeText: "10 kalte Orte, ≥ 8 glaziale Formklassen nach dem Zyklus gezählt",
                taeter: "planet-core.js planetKlimaGlobal (keine Bahn-Zyklen) · gelaende-core.js ortSaat (kein Eis im Relief)",
                nicht: "kein Eiszeit-Zyklus im Relief",
                leser: "gelaende-core.js:5802 ortSaat — die Kaltzeit ist eine neue Saat, kein Leser schleift Trog, Fjord, Kar aus dem Eis der Zeit",
                gruen: gut({ glazialKlassen: 9, oberhalbProzent: 93, fjordeUnterEisProzent: 86, fjordeNieVereist: 0 }, { kalteOrte: 10, glazialeFormen: 9 }),
                attrappen: [{ name: "0 Fjorde in nie vereisten Breiten (weil es keine gibt)", roh: gut({ glazialKlassen: 9, oberhalbProzent: 93, fjordeUnterEisProzent: 86, fjordeNieVereist: 0 }, { kalteOrte: 10, glazialeFormen: 0 }) }],
            },
            6: {
                u: { orte: 100, epochen: [0, -100, -200, -300, -400, -500, -600, -700, -800, -900], fensterKm: 4 },
                soll: [
                    K.soll(WA, 6, "100 Orte", { key: "orte", rel: "≥" }),
                    K.soll(WA, 6, "10 Epochen", { key: "epochen", rel: "≥" }),
                    K.soll(WA, 6, "100 Orte × 10 Epochen: Relief-Kennzahlen in den Bändern von planet.relief.grossform", { key: "inBaendernProzent", zahl: 100, rel: "≥", einheit: "%" }),
                ],
                zeuge: zMin({ lagen: 300, epochen: 10, hoeheStreuM: 1e-6 }),
                zeugeText: "100 Orte in 10 Epochen gefahren, das Land jeder Epoche gemessen, das Relief wandelt sich",
                taeter: "gelaende-core.js flussLaeufe (Hack/Bifurkation der Reise-Welt je Epoche)",
                gruen: gut({ orte: 100, epochen: 10, lagen: 380, inBaendernProzent: 100 }, { lagen: 380, epochen: 10, hoeheStreuM: 120 }),
                attrappen: [{ name: "die Bänder an EINER Epoche (das Relief wandelt sich nicht)", roh: gut({ orte: 100, epochen: 10, lagen: 38, inBaendernProzent: 100 }, { lagen: 38, epochen: 1, hoeheStreuM: 0 }) }],
            },
            7: {
                u: {},
                soll: [K.soll(WA, 7, "Rang ≥ 0,7", { key: "rang" }), K.soll(WA, 7, "100 Welten", { key: "welten", rel: "≥" })],
                auge: { pose: "Ego an der Wiese (heute keine fremde Welt)", vorbild: "Fremdwelt-Probe R10: Agens und Alter aus dem Bild gelesen" },
                taeter: "gelaende-core.js ortSaat · voxel-worker.js planetOrtAuftrag (keine Abtragsgeschichte, keine Konstanten)",
                nicht: "keine Abtragsgeschichte je Welt",
                leser: "voxel-worker.js:1176 — planetPlanVon(msg.samen) liest keine Konstanten; gelaende-core.js:5802 ortSaat würfelt jede Epoche neu",
                gruen: gut({ rang: 0.75, welten: 100 }, {}),
                attrappen: [{ name: "der Rang ohne Bild", roh: leer({ rang: 0.75, welten: 100 }) }],
            },
        },
    };

    return { leitern: { [GF]: grossform, [FS]: formschatz, [BO]: boden, [WA]: wandel } };
})());

// ── DIE PERSPEKTIVE planet.wasser (6 Leitern, 39 Sprossen; kreislauf S1 und stroemung S1 tragen schon Station und Tafel) ─────────
// Die Leser des Spiels: das Wasser am Ort (`_koerperWasser` · `_nassAt` · `_hydroRiverAt` · `_waterFlowAt`, stamm/wasser-hydro.js), der
// Pegel (`_pegelTakt`), das Eis (`_eisLinien` · `_eisAt`), der Schnee (`_schneeTafel` · `_schneeVersatz`, gelaende-core schneeTrittAm),
// die Temperatur (gelaende-core temperaturAus über `_temperaturFeld`), der Wind (`_windAt`), das Medium der Kamera unter Wasser
// (`_applyDayNightToScene` → `luft.U` · `_luftSichtM`), Sonne und Mond (`__weltLicht`), der Planet-Faden (`r._planetAuftrag`).
// DAS MEER DER WELT: die Heimat (Samen anazh-realm-seed) liegt 289 km von der Küste ihres Planeten (planet-anker), ihr Gelände trägt aber
// eine Bucht ~10,6 km nördlich des Spawns (Wasser-Art Meer, bis ~20 m tief) — jede Leiter, die Meer braucht, sucht sie an der Welt
// (Strahlen vom Spawn, `_ensureHydroTilesAround`), nie an einer eingetragenen Zahl. Der See der Soll-Tafel (1816/−6168, bis 3,4 m) trägt
// Eis und Grube. Die Messungen setzen Saison, Welt-Uhr, Wetter und Kamera nur in EINER Auswertung der Seite und stellen sie zurück.
L.perspektive("wasser", (() => {
    const PFAD = ["stamm/wasser-*.js", "stamm/bild-himmel.js", "stamm/bild-sicht.js", "stamm/stoff-material.js", "stamm/gelaende-*.js", "gelaende-core.js", "foundry-core.js", "welt-licht.js", "planet-core.js", "voxel-worker.js", "scripts/werkbank.cjs", "scripts/lib/ausgabe-aufnahme.cjs"];
    // DER ZEUGE DER WELT: jede genannte Zahl in `roh.zeuge` muss ihr Mindestmaß halten (Antworten der Welt, Streuung, vor ≠ nach) —
    // eine Attrappe, die nur den Wortlaut der werte trägt, fällt hier
    const zMin = (spec) => (roh) => {
        const z = (roh && roh.zeuge) || {};
        for (const [k, min] of Object.entries(spec)) if (!(typeof z[k] === "number" && z[k] >= min)) return "die Welt antwortete nicht: " + k + " " + (z[k] === undefined ? "fehlt" : z[k]) + " (Soll ≥ " + min + ")";
        return null;
    };
    const gut = (werte, zeuge) => ({ werte, zeuge });
    const leer = (werte) => ({ werte, zeuge: {} });

    // ════════════════════════════════════════ SEEGANG ════════════════════════════════════════
    const SEE = "planet.wasser.seegang";
    const seegang = {
        sek: 60,
        pfad: PFAD,
        mutiert: true,
        ungefahren: "die Bilder (spiegelTreue an 12 Posen, Weißkappe im Bild, Auge Beaufort und Küste) schießt die Probe nur am Gerät (/bild an der Bucht)",
        mess: async function (H, U, M) {
            const MEER = `
const L = r._gelaende(), G = globalThis.__gelaendeCore;
const R = (v) => (Number.isFinite(v) ? Math.round(v * 1000) / 1000 : null);
const warte = async (x, z) => { let n = 0; while (r._ensureHydroTilesAround(x, z, 32) && n < 200) { await new Promise((f) => setTimeout(f, 50)); n++; } return n; };
const tiefe = (x, z) => { const kw = r._koerperWasser(x, z, -Infinity), g = r._voxelSurfaceY(x, z); return kw > -Infinity && g !== null && Number.isFinite(g) && kw > g ? kw - g : 0; };
let m = window.__pwMeer;
if (!m) {
m = { gefunden: false };
let p = null;
for (let d = 500; d <= 20000 && !p; d += 250) for (let a = 0; a < 32 && !p; a++) { const x = d * Math.cos((a * Math.PI) / 16), z = d * Math.sin((a * Math.PI) / 16); if (G.hoehe(L, x, z, false) < L.waterLevel - 2) p = [x, z]; }
if (p) {
for (const [a, b] of [[0, 0], [-1500, -1500], [1500, -1500], [-1500, 1500], [1500, 1500]]) await warte(p[0] + a, p[1] + b);
const N = 61, T = new Float64Array(N * N);
for (let i = 0; i < N; i++) for (let j = 0; j < N; j++) T[i + N * j] = tiefe(p[0] + 50 * (i - 30), p[1] + 50 * (j - 30));
let best = [0, p[0], p[1]], zellen = 0;
const kueste = [], innen = [];
for (let i = 0; i < N; i++) for (let j = 0; j < N; j++) {
const t = T[i + N * j];
if (!(t > 0)) continue;
const x = p[0] + 50 * (i - 30), z = p[1] + 50 * (j - 30);
zellen++;
if (t > best[0]) best = [t, x, z];
const rand = [[1, 0], [-1, 0], [0, 1], [0, -1]].some(([a, b]) => i + a < 0 || j + b < 0 || i + a >= N || j + b >= N || !(T[i + a + N * (j + b)] > 0));
if (rand) kueste.push([x, z]); else innen.push([x, z, R(t)]);
}
const B = [best[1], best[2]], d0 = Math.hypot(B[0], B[1]), ux = -B[0] / d0, uz = -B[1] / d0;
let s = null;
for (let k = 1; k < 800 && !s; k++) { const x = B[0] + ux * 10 * k, z = B[1] + uz * 10 * k; if (!(tiefe(x, z) > 0) && r._voxelSurfaceY(x, z) > L.waterLevel) s = [x + ux * 6, z + uz * 6]; }
let art = null;
for (const t of (r.state.hydroTiles || new Map()).values()) { const sz = t.dim * t.cell; if (t.water && B[0] >= t.originX && B[1] >= t.originZ && B[0] < t.originX + sz && B[1] < t.originZ + sz) art = t.water.waterKind[Math.floor((B[0] - t.originX) / t.cell) + Math.floor((B[1] - t.originZ) / t.cell) * t.dim]; }
const sy = s ? r._voxelSurfaceY(s[0], s[1]) : null;
const jede = (A, n) => A.filter((q, i) => i % Math.max(1, Math.floor(A.length / n)) === 0).slice(0, n);
m = { gefunden: true, p, B, tiefeMax: R(best[0]), spiegel: R(r._koerperWasser(B[0], B[1], -Infinity)), flaecheKm2: R((zellen * 2500) / 1e6), kuesteN: kueste.length, kuesteKm: R(kueste.length * 0.05), kueste: jede(kueste, 120), innen: jede(innen, 100), art, abstandKm: R(d0 / 1000), ufer: s ? [R(s[0]), R(sy + 1.7), R(s[1]), R(B[0]), R(L.waterLevel), R(B[1])] : null, richtung: [R(ux), R(uz)] };
}
window.__pwMeer = m;
}
`;
            const meer = await H.seite(MEER + "return m;");
            const R = (v) => (Number.isFinite(v) ? Math.round(v * 1000) / 1000 : null);
            const aus = M.teil || {};
            const ziel = Object.keys(U);
            if (!meer || !meer.gefunden) {
                for (const nr of ziel) aus[nr] = M.nicht("kein Meer im Gelände der Welt bis 20 km vom Spawn (gelaende-core hoehe unter dem Spiegel)");
                return { sprossen: aus };
            }
            // DIE WELT AM MEER: der Wind je Wort des Wetters (`_windAt` an der tiefsten Stelle der Bucht, 600 s Wind-Uhr), der Hub der
            // Welle (`_wasserHubM`, die Decke im Sturm), die Sicht der Kamera, die Neigung der Strände (das Gelände 20 m landwärts)
            const welt = await H.seite(MEER + `
const [bx, bz] = m.B;
const alt = r.state.weather;
const wind = {};
try {
for (const w of ["sunny", "cloudy", "foggy", "rainy", "stormy"]) {
if (window.__wetterSetzen(w) !== w) throw new Error("das Wetter der Probe gilt nicht: " + w + " (es gilt " + r.state.weather + ")");
const v = [];
for (let t = 0; t < 600; t += 3) v.push(r._windAt(bx, bz, t).ms);
wind[w] = [R(v.reduce((s, x) => s + x, 0) / v.length), R(Math.min(...v)), R(Math.max(...v))];
}
} finally { window.__wetterSetzen(alt); }
const [ux, uz] = m.richtung;
const neigung = m.kueste.map(([x, z]) => { const a = r._voxelSurfaceY(x, z), b = r._voxelSurfaceY(x + ux * 20, z + uz * 20); return a !== null && b !== null ? Math.abs(b - a) / 20 : null; }).filter((v) => v !== null);
return { wind, hubMaxM: R(r.constructor._wasserHubM()), sichtM: R(r.state.camera.far), neigung: neigung.map(R), wetterNach: r.state.weather };
`);
            // DIE BILDER AM GERÄT (auf swiftshader schießt die Probe nicht): 12 Posen an der Bucht (4 Uhren × 3 Wetter, die Bühne der
            // Werkbank setzt Uhr und Wetter je Schuss), die Klasse des gezeichneten Wassers mit ihren Maßen (spiegelTreue, weiss)
            const bilder = [];
            const pose = meer.ufer ? { px: meer.ufer[0], py: meer.ufer[1], pz: meer.ufer[2], lx: meer.ufer[3], ly: meer.ufer[4], lz: meer.ufer[5] } : null;
            let stand0 = null;
            if (!M.swift && pose) {
                stand0 = await H.seite("const p = r.state.playerMesh.position; return [p.x, p.z, r.state.weather];");
                const pfad = require("path");
                for (const wetter of ["sunny", "cloudy", "rainy"])
                    for (const uhr of [0.3, 0.45, 0.6, 0.75]) {
                        if (M.uhr() > 38) break;
                        try {
                            const datei = pfad.join(pfad.dirname(H.aus), "wasser-see-" + wetter + "-" + uhr + ".png");
                            const b = await H.ruf("/bild", Object.assign({ w: 1920, h: 1080, wahl: 0, uhr, wetter, datei, klasse: "^(wasserSatz|farWater|chunk-water-[a-z]+)$" }, pose));
                            const kl = Object.values((b.klasse && b.klasse.klassen) || {}).sort((x, y) => (y.pixel || 0) - (x.pixel || 0))[0] || {};
                            bilder.push({ wetter, uhr, spiegelTreue: kl.spiegelTreue, weiss: kl.weiss, pixel: kl.pixel || 0, datei: b.datei || datei });
                        } catch (e) {
                            bilder.push({ wetter, uhr, fehler: String((e && e.message) || e).slice(0, 160) });
                        }
                    }
            }
            const auge3 = pose ? await M.auge("wasser-seegang-s3", pose, { wetter: "stormy" }) : undefined;
            const auge7 = pose ? await M.auge("wasser-seegang-s7", pose, { uhr: 0.7 }) : undefined;
            if (stand0 && M.uhr() < 50) {
                await H.ruf("/umstellen", { x: stand0[0], z: stand0[1] }).catch(() => null);
                await H.seite("window.__wetterSetzen(" + JSON.stringify(stand0[2]) + "); return 1;").catch(() => null);
            }
            const st = bilder.filter((b) => Number.isFinite(b.spiegelTreue));
            const mittel = (a) => (a.length ? a.reduce((s, x) => s + x, 0) / a.length : NaN);
            const streu = (a) => (a.length > 1 ? Math.sqrt(mittel(a.map((x) => (x - mittel(a)) ** 2))) : 0);
            const W = welt.wind || {};
            const worte = Object.keys(W);
            // ein Wind U gilt als setzbar, wenn ein Wort des Wetters ihn im Mittel auf ±15 % trägt
            const traegt = (u) => worte.find((w) => Math.abs(W[w][0] - u) <= 0.15 * u) || null;
            const sturmMax = W.stormy ? W.stormy[2] : NaN;
            const beaufort = (v) => [0.3, 1.6, 3.4, 5.5, 8.0, 10.8, 13.9, 17.2, 20.8, 24.5, 28.5, 32.7].filter((g) => v >= g).length;
            const ort = "die Bucht " + meer.abstandKm + " km vom Spawn (" + meer.flaecheKm2 + " km², bis " + meer.tiefeMax + " m)";
            const je = {};
            // S1 die spiegelTreue an 12 Posen (Uhr × Wetter)
            je[1] = {
                werte: Object.assign({ wasserFlaecheKm2: meer.flaecheKm2 }, st.length ? { spiegelTreue: R(Math.min(...st.map((b) => b.spiegelTreue))), posen: st.length } : {}),
                zeuge: { bilder: st.length, wetter: new Set(st.map((b) => b.wetter)).size, streuung: R(streu(st.map((b) => b.spiegelTreue))), je: bilder.map((b) => [b.wetter, b.uhr, R(b.spiegelTreue), b.fehler || null]) },
                ...(M.swift ? { grund: "swiftshader: kein Bild — die spiegelTreue misst das Gerät" } : {}),
            };
            // S2 die Weißkappe bei 5/10/20 m/s: der Wind am Wasser je Wort; das Bild (weiss der Klasse) nur bei dem Wort, das U trägt
            const ziele = (U[2] && U[2].winde) || [5, 10, 20];
            const kappe = {};
            const wk = {};
            for (const u of ziele) {
                const w = traegt(u);
                wk["wind" + u + "Ms"] = w ? W[w][0] : null;
                const b = w ? bilder.filter((x) => x.wetter === w && Number.isFinite(x.weiss)) : [];
                if (b.length) kappe["kappe" + u] = R(100 * mittel(b.map((x) => x.weiss)));
            }
            const fehltWind = ziele.filter((u) => !traegt(u));
            const kb = bilder.filter((x) => Number.isFinite(x.weiss));
            je[2] = {
                werte: Object.assign({ windSturmMs: W.stormy ? W.stormy[0] : null, windWolkeMs: W.cloudy ? W.cloudy[0] : null }, kappe),
                zeuge: { bilder: Object.keys(kappe).length, windTreffer: ziele.length - fehltWind.length, streuung: R(streu(kb.map((x) => x.weiss))), wind: W },
                ...(fehltWind.length ? { nicht: "Wind " + fehltWind.join(" und ") + " m/s am Wasser nicht stetig setzbar: die Worte des Wetters tragen im Mittel " + worte.map((w) => w + " " + W[w][0]).join(" · ") + " m/s (stamm/stoff-material.js:233 _windAt)" } : {}),
            };
            // S3 Blindtest Beaufort 0–12 (Auge); die Welt: die Beaufort-Stufe des Sturms und ob die offene See trägt
            je[3] = {
                werte: { beaufortMax: beaufort(sturmMax), sturmMaxMs: R(sturmMax), meerFlaecheKm2: meer.flaecheKm2 },
                zeuge: { wind: W },
                auge: auge3,
                ...(beaufort(sturmMax) < 12 ? { nicht: "Beaufort 12 nicht erzeugbar: der Sturm am Wasser erreicht höchstens " + R(sturmMax) + " m/s (Beaufort " + beaufort(sturmMax) + "); der Seegang liest keinen Fetch (stamm/bild-sicht.js:1337 oceanSwell: Rauschen × Wind-Zeile); " + ort } : {}),
            };
            // S4 Brandung: die Strände der Bucht (Neigung des Geländes), keine Brechlinie in der Welt
            const ng = (welt.neigung || []).filter((v) => v <= 0.1);
            je[4] = {
                werte: { straende: ng.length, kuesteKm: meer.kuesteKm, neigungMittel: R(mittel(welt.neigung || [])) },
                zeuge: { straende: ng.length, brecher: 0 },
                nicht: "keine Brandung: kein Leser bricht die Welle an der Tiefe — die Dünung des Wasser-Stoffs kennt nur die Tiefe als Blende (stamm/bild-sicht.js:1393 oceanSwell × aWave), das Ufer schäumt als Saum (WASSER_GESETZ.schaum.ufer); " + ort,
            };
            // S5 Dünung eines fernen Sturms, Kelvin-Keil
            je[5] = {
                werte: { sichtM: welt.sichtM, meerFlaecheKm2: meer.flaecheKm2 },
                zeuge: { duenung: 0, kielwasser: 0 },
                nicht: "kein Ozean bis 50 km (" + ort + "), kein Sturm in 500 km setzbar, keine Ausbreitung der Dünung (Rauschen mit fester Drift, stamm/bild-sicht.js:1337), kein Kielwasser (kein Kelvin-Keil hinter Boot oder Körper)",
            };
            // S6 Orkan, Kaventsmann, Tsunami: die Decke des Hubs
            je[6] = {
                werte: { hubMaxM: welt.hubMaxM, sturmMaxMs: R(sturmMax) },
                zeuge: { stundenHs: 0, tsunami: 0 },
                nicht: "Wellen ≥ 25 m nicht erzeugbar: der Hub der Welle ist höchstens " + welt.hubMaxM + " m (stamm/gelaende-fern.js:2679 _wasserHubM); kein Kaventsmann (keine Statistik der Wellenhöhe), kein Tsunami",
            };
            // S7 der ganze Planet (Auge): eine Bucht statt jeder Küste
            je[7] = {
                werte: { kuestePunkte: meer.kuesteN },
                zeuge: { kuesten: 1 },
                auge: auge7,
                nicht: "kein Ozean-Feld über die Küsten: die Dünung ist Rauschen je Ort (stamm/bild-sicht.js:1337), die Welt trägt EINE Bucht (" + ort + "), 10 Saaten nur als Zahl im Planet-Faden",
            };
            // S8 fremde Meere
            je[8] = {
                werte: { hubMaxM: welt.hubMaxM },
                zeuge: { meere: 0 },
                nicht: "kein fremdes Meer: die Welt kennt die Stoff-Zeile Wasser allein (kein Methan-See, kein Lava-Meer), die Dünung trägt kein Wellenlänge-Periode-Paar (stamm/bild-sicht.js:1337 oceanSwell)",
            };
            for (const nr of ziel) aus[nr] = je[nr] || M.nicht("ungemessen");
            return { sprossen: aus };
        },
        sprossen: {
            1: {
                u: { posen: 12, uhr: [0.3, 0.45, 0.6, 0.75], wetter: ["sunny", "cloudy", "rainy"] },
                soll: [K.soll(SEE, 1, "spiegelTreue ≥ 0,6", { key: "spiegelTreue" }), K.soll(SEE, 1, "12 Posen", { key: "posen", rel: "≥" })],
                zeuge: zMin({ bilder: 12, wetter: 3, streuung: 1e-6 }),
                zeugeText: "12 Bilder in 3 Wettern, die spiegelTreue streut",
                taeter: "stamm/wasser-hydro.js _wasserBlick (der Spiegel-Pass) an der Bucht",
                gruen: gut({ spiegelTreue: 0.66, posen: 12 }, { bilder: 12, wetter: 3, streuung: 0.05 }),
                attrappen: [
                    { name: "die spiegelTreue der Soll-Tafel (0,83 an EINER Pose) für alle 12", roh: gut({ spiegelTreue: 0.83, posen: 12 }, { bilder: 1, wetter: 1, streuung: 0 }) },
                    { name: "12 Posen ohne Bild (swiftshader)", roh: leer({ spiegelTreue: 0.7, posen: 12 }) },
                ],
            },
            2: {
                u: { winde: [5, 10, 20] },
                soll: [
                    K.soll(SEE, 2, "gegen Monahan ±30 %", { key: "kappe5", ref: 0.0929, refQuelle: "Erde: Monahan & O'Muircheartaigh 1980, W = 3,84·10⁻⁶·U^3,41 — bei 5 m/s 0,093 %", einheit: "%" }),
                    K.soll(SEE, 2, "gegen Monahan ±30 %", { key: "kappe10", ref: 0.987, refQuelle: "Erde: Monahan & O'Muircheartaigh 1980 — bei 10 m/s 0,99 %", einheit: "%" }),
                    K.soll(SEE, 2, "gegen Monahan ±30 %", { key: "kappe20", ref: 10.48, refQuelle: "Erde: Monahan & O'Muircheartaigh 1980 — bei 20 m/s 10,5 %", einheit: "%" }),
                ],
                zeuge: zMin({ bilder: 3, windTreffer: 3, streuung: 1e-6 }),
                zeugeText: "drei Bilder bei drei gesetzten Winden, das Weiß streut mit dem Wind",
                taeter: "stamm/stoff-material.js _windAt (das Wetter trägt 10 und 20 m/s nicht)",
                gruen: gut({ kappe5: 0.1, kappe10: 1.1, kappe20: 9.5 }, { bilder: 3, windTreffer: 3, streuung: 0.04 }),
                attrappen: [
                    { name: "Monahan aus dem Gesetz abgeschrieben (kein Bild, kein Wind)", roh: leer({ kappe5: 0.0929, kappe10: 0.987, kappe20: 10.48 }) },
                    { name: "drei Zahlen aus EINEM Bild bei Wolke (der Wind 10 und 20 nie gesetzt)", roh: gut({ kappe5: 0.1, kappe10: 1.1, kappe20: 9.5 }, { bilder: 3, windTreffer: 1, streuung: 0.04 }) },
                ],
                nicht: "Wind 10 und 20 m/s am Wasser nicht stetig setzbar",
                leser: "stamm/stoff-material.js:233 _windAt — der Wind folgt nur dem Wort des Wetters (Mittel 1 · 2,4 · 5 · 5,9 · 16,8 m/s), kein Leser setzt ihn in m/s",
            },
            3: {
                u: { wetter: "stormy" },
                soll: [K.soll(SEE, 3, "≥ 70 % richtig zugeordnet", { key: "richtigProzent", einheit: "%" }), K.soll(SEE, 3, "10 Bilder je Beaufort-Stufe", { key: "bilderJeStufe", rel: "≥" })],
                auge: { pose: "Ego am Ufer der Bucht (~10,6 km nördlich des Spawns), Blick über die tiefste Stelle, Sturm", vorbild: "10 Fotos je Beaufort-Stufe 0–12 der offenen See (WMO-Bildtafel), Prüfer-Satz R11" },
                taeter: "stamm/bild-sicht.js oceanSwell (Seegang ohne Fetch) · stamm/stoff-material.js _windAt",
                nicht: "Beaufort 12 nicht erzeugbar (Sturm höchstens ~28 m/s)",
                gruen: gut({ richtigProzent: 74, bilderJeStufe: 10 }, {}),
                attrappen: [{ name: "der Blindtest ohne Bild", roh: leer({ richtigProzent: 74, bilderJeStufe: 10 }) }],
            },
            4: {
                u: {},
                soll: [
                    K.soll(SEE, 4, "Brechlinie bei Tiefe 1,3·H ±20 %", { key: "brechTiefeJeH", ref: 1.28, refQuelle: "Erde: McCowan 1894, die Welle bricht bei H/h = 0,78 (h = 1,28·H)" }),
                    K.soll(SEE, 4, "Brechertyp gegen Iribarren-Zahl ≥ 80 %", { key: "brechertypProzent", einheit: "%" }),
                    K.soll(SEE, 4, "20 Stränden", { key: "straende", rel: "≥" }),
                ],
                zeuge: zMin({ straende: 20, brecher: 20 }),
                zeugeText: "an 20 Stränden der Welt eine Brechlinie gemessen",
                taeter: "stamm/bild-sicht.js oceanSwell (keine Brandung)",
                nicht: "keine Brandung (kein Leser bricht die Welle an der Tiefe)",
                leser: "stamm/bild-sicht.js:1393 — die Dünung kennt die Tiefe nur als Blende aWave, kein Brechen nach H/h und Strandneigung",
                gruen: gut({ brechTiefeJeH: 1.3, brechertypProzent: 85, straende: 20 }, { straende: 20, brecher: 20 }),
                attrappen: [{ name: "die Brechlinie aus McCowan eingesetzt (keine Welle bricht)", roh: gut({ brechTiefeJeH: 1.28, brechertypProzent: 85, straende: 24 }, { straende: 24, brecher: 0 }) }],
            },
            5: {
                u: {},
                soll: [
                    K.soll(SEE, 5, "Sturm 500 km weg gesetzt", { key: "sturmKm", rel: "≥" }),
                    K.soll(SEE, 5, "Ankunft der Dünung ±15 % der Gruppenlaufzeit", { key: "ankunftJeLaufzeit", ref: 1, refQuelle: "Erde: Gruppengeschwindigkeit der Tiefwasser-Dünung c_g = g·T/(4π) (Snodgrass et al. 1966)" }),
                    K.soll(SEE, 5, "Kelvin-Winkel 19,5° ±2°", { key: "kelvinGrad", ref: 19.47, refQuelle: "Erde: Kelvin 1887, der Halbwinkel des Kielwassers arcsin(1/3) = 19,47°", einheit: "°" }),
                ],
                zeuge: zMin({ duenung: 1, kielwasser: 1 }),
                zeugeText: "die Dünung kam an, ein Kielwasser stand im Bild",
                taeter: "stamm/bild-sicht.js oceanSwell (keine Ausbreitung)",
                nicht: "kein Ozean bis 50 km, keine Ausbreitung, kein Kelvin-Keil",
                leser: "stamm/bild-sicht.js:1337 oceanSwell — Rauschen mit fester Drift; kein Leser trägt die Dünung eines fernen Sturms oder das Kielwasser",
                gruen: gut({ sturmKm: 500, ankunftJeLaufzeit: 1.05, kelvinGrad: 19.8 }, { duenung: 1, kielwasser: 1 }),
                attrappen: [{ name: "Kelvin 19,47° als Zahl ohne Kielwasser", roh: leer({ sturmKm: 500, ankunftJeLaufzeit: 1, kelvinGrad: 19.47 }) }],
            },
            6: {
                u: {},
                soll: [
                    K.soll(SEE, 6, "H > 2·Hs in 1 h gegen Rayleigh ±50 %", { key: "kaventsJeRayleigh", ref: 1, refQuelle: "Erde: Rayleigh-Verteilung der Wellenhöhe (Longuet-Higgins 1952), P(H > 2·Hs) = e⁻⁸" }),
                    K.soll(SEE, 6, "Tsunami-Laufzeit über 1 000 km ±10 %", { key: "tsunamiJeLaufzeit", ref: 1, refQuelle: "Erde: Flachwasserwelle c = √(g·h) (Lagrange; Tsunami 2004 im Indischen Ozean)" }),
                ],
                zeuge: zMin({ stundenHs: 1, tsunami: 1 }),
                zeugeText: "eine Stunde Seegang gezählt, ein Tsunami lief",
                taeter: "stamm/gelaende-fern.js _wasserHubM (Hub ≤ 4,4 m)",
                nicht: "Wellen ≥ 25 m, Kaventsmann, Tsunami nicht erzeugbar",
                leser: "stamm/gelaende-fern.js:2679 _wasserHubM — die Decke des Hubs; kein Leser zählt Wellenhöhen oder trägt einen Tsunami",
                gruen: gut({ kaventsJeRayleigh: 1.2, tsunamiJeLaufzeit: 0.97 }, { stundenHs: 1, tsunami: 1 }),
                attrappen: [{ name: "Rayleigh als Formel ohne gezählte Welle", roh: leer({ kaventsJeRayleigh: 1, tsunamiJeLaufzeit: 1 }) }],
            },
            7: {
                u: { uhr: 0.7 },
                soll: [
                    K.soll(SEE, 7, "≥ 80 % im Blindtest nicht sicher von Fotos unterschieden", { key: "blindProzent", einheit: "%" }),
                    K.soll(SEE, 7, "Kreuzkorrelation ≥ 0,7", { key: "kreuzKorr" }),
                    K.soll(SEE, 7, "100 Küstenposen", { key: "posen", rel: "≥" }),
                    K.soll(SEE, 7, "10 Saaten", { key: "saaten", rel: "≥" }),
                ],
                auge: { pose: "Ego am Ufer der Bucht (~10,6 km nördlich des Spawns), Abend", vorbild: "Küstenfotos zu Uhr und Wetter (Prüfer-Satz R11), 100 Posen aus 10 Saaten" },
                taeter: "stamm/bild-sicht.js oceanSwell (kein Ozean-Feld)",
                nicht: "kein Ozean-Feld über die Küsten, EINE Bucht",
                gruen: gut({ blindProzent: 82, kreuzKorr: 0.74, posen: 100, saaten: 10 }, {}),
                attrappen: [{ name: "die Kreuzkorrelation ohne Schiff", roh: leer({ blindProzent: 82, kreuzKorr: 0.74, posen: 100, saaten: 10 }) }],
            },
            8: {
                u: {},
                soll: [K.soll(SEE, 8, "Wellenlänge-Periode-Paar gegen die Dispersionsrelation mit deren g und ρ ±10 %", { key: "dispersionJeSoll", ref: 1, refQuelle: "Erde: Tiefwasser-Dispersion ω² = g·k (Airy 1841), im fremden Meer mit dessen g und ρ" })],
                zeuge: zMin({ meere: 1 }),
                zeugeText: "ein fremdes Meer stand, seine Welle gemessen",
                taeter: "stamm/bild-sicht.js oceanSwell (keine Dispersion) · foundry-core.js WASSER_GESETZ (nur Wasser)",
                nicht: "kein fremdes Meer, keine Dispersion",
                leser: "stamm/bild-sicht.js:1337 oceanSwell — keine Dispersionsrelation; kein Stoff eines fremden Meers im Wasser-Gesetz",
                gruen: gut({ dispersionJeSoll: 1.04 }, { meere: 1 }),
                attrappen: [{ name: "ω² = g·k als Formel ohne Meer", roh: leer({ dispersionJeSoll: 1 }) }],
            },
        },
    };

    // ════════════════════════════════════════ GEZEITEN ════════════════════════════════════════
    const GZ = "planet.wasser.gezeiten";
    const gezeiten = {
        sek: 45,
        faecher: true,
        pfad: PFAD,
        mutiert: true,
        ungefahren: "die Bilder (Watt im Bild, Doppelmond) schießt die Probe nur am Gerät",
        mess: async function (H, U, M) {
            const MEER = `
const L = r._gelaende(), G = globalThis.__gelaendeCore;
const R = (v) => (Number.isFinite(v) ? Math.round(v * 1000) / 1000 : null);
const warte = async (x, z) => { let n = 0; while (r._ensureHydroTilesAround(x, z, 32) && n < 200) { await new Promise((f) => setTimeout(f, 50)); n++; } return n; };
const tiefe = (x, z) => { const kw = r._koerperWasser(x, z, -Infinity), g = r._voxelSurfaceY(x, z); return kw > -Infinity && g !== null && Number.isFinite(g) && kw > g ? kw - g : 0; };
let m = window.__pwMeer;
if (!m) {
m = { gefunden: false };
let p = null;
for (let d = 500; d <= 20000 && !p; d += 250) for (let a = 0; a < 32 && !p; a++) { const x = d * Math.cos((a * Math.PI) / 16), z = d * Math.sin((a * Math.PI) / 16); if (G.hoehe(L, x, z, false) < L.waterLevel - 2) p = [x, z]; }
if (p) {
for (const [a, b] of [[0, 0], [-1500, -1500], [1500, -1500], [-1500, 1500], [1500, 1500]]) await warte(p[0] + a, p[1] + b);
const N = 61, T = new Float64Array(N * N);
for (let i = 0; i < N; i++) for (let j = 0; j < N; j++) T[i + N * j] = tiefe(p[0] + 50 * (i - 30), p[1] + 50 * (j - 30));
let best = [0, p[0], p[1]], zellen = 0;
const kueste = [], innen = [];
for (let i = 0; i < N; i++) for (let j = 0; j < N; j++) {
const t = T[i + N * j];
if (!(t > 0)) continue;
const x = p[0] + 50 * (i - 30), z = p[1] + 50 * (j - 30);
zellen++;
if (t > best[0]) best = [t, x, z];
const rand = [[1, 0], [-1, 0], [0, 1], [0, -1]].some(([a, b]) => i + a < 0 || j + b < 0 || i + a >= N || j + b >= N || !(T[i + a + N * (j + b)] > 0));
if (rand) kueste.push([x, z]); else innen.push([x, z, R(t)]);
}
const B = [best[1], best[2]], d0 = Math.hypot(B[0], B[1]), ux = -B[0] / d0, uz = -B[1] / d0;
let s = null;
for (let k = 1; k < 800 && !s; k++) { const x = B[0] + ux * 10 * k, z = B[1] + uz * 10 * k; if (!(tiefe(x, z) > 0) && r._voxelSurfaceY(x, z) > L.waterLevel) s = [x + ux * 6, z + uz * 6]; }
let art = null;
for (const t of (r.state.hydroTiles || new Map()).values()) { const sz = t.dim * t.cell; if (t.water && B[0] >= t.originX && B[1] >= t.originZ && B[0] < t.originX + sz && B[1] < t.originZ + sz) art = t.water.waterKind[Math.floor((B[0] - t.originX) / t.cell) + Math.floor((B[1] - t.originZ) / t.cell) * t.dim]; }
const sy = s ? r._voxelSurfaceY(s[0], s[1]) : null;
const jede = (A, n) => A.filter((q, i) => i % Math.max(1, Math.floor(A.length / n)) === 0).slice(0, n);
m = { gefunden: true, p, B, tiefeMax: R(best[0]), spiegel: R(r._koerperWasser(B[0], B[1], -Infinity)), flaecheKm2: R((zellen * 2500) / 1e6), kuesteN: kueste.length, kuesteKm: R(kueste.length * 0.05), kueste: jede(kueste, 120), innen: jede(innen, 100), art, abstandKm: R(d0 / 1000), ufer: s ? [R(s[0]), R(sy + 1.7), R(s[1]), R(B[0]), R(L.waterLevel), R(B[1])] : null, richtung: [R(ux), R(uz)] };
}
window.__pwMeer = m;
}
`;
            const R = (v) => (Number.isFinite(v) ? Math.round(v * 1000) / 1000 : null);
            const ziel = Object.keys(U);
            const aus = M.teil || {};
            // S1 DIE GEZEIT AM FÄCHER (M4): je Adresse (Saat × Stunde der Welt-Uhr) der Spiegel des Meers 200 m vor der Küste und das
            // Watt quer über sie (11 Punkte von 200 m Land bis 200 m See) — die Heimat liest der Leser des Spiels unter der gestellten
            // Uhr (`spielZeit` + `_pegelTakt` → `_koerperWasser`, `_nassAt`), jede andere Saat das Gesetz an ihrer Lage (planet-ort →
            // gelaende-core lageAus → wasserSpiegel, die Lage ohne Uhr: der Export nimmt keine Zeit). Die Periode aus den steigenden
            // Durchgängen durchs Mittel je Saat, ihr Median über die Küsten mit Hub
            const u1 = U[1];
            if (u1) {
                const GEZEIT_AN = async (r, T, a, mit) => {
                    const G = globalThis.__gelaendeCore, st = r.state, k = String(a.saat);
                    const memo = mit.memo || (mit.memo = {});
                    let M0 = memo[k];
                    if (!M0) {
                        let L, wl;
                        if (a.saat === "heim") {
                            L = r._gelaende();
                            wl = st.waterLevel;
                        } else {
                            await r._fadenQuelle();
                            const breite = ((a.saat * 0.6180339887) % 1) * 140 - 70, laenge = ((a.saat * 137.508) % 360) - 180;
                            const o = await r._planetAuftrag({ type: "planet-ort", samen: r._planetSamen(), breite, laenge, zeitMa: 0 });
                            const heim = r.constructor._weltGesetz(st.worldMeta).gelaende;
                            const ort = { samen: o.samen, version: o.version, breite: o.breite, laenge: o.laenge, zeitMa: o.zeitMa, delta: o.delta };
                            const O = G.ortGesetz(ort), eg = G.erbgutNormal(G.ortErbgut(G.erbgutNormal(heim == null ? undefined : heim), o.delta.wildnis));
                            wl = G.GRUND.basis - O.meerUnterBasisM;
                            L = G.lageAus({ seed: r._reiseSaat(ort, heim), baseHeight: G.GRUND.basis, waterLevel: wl, ort, erbgut: { terme: eg, wildnis: eg[0] && eg[0].art === "wildnis" ? 1 : 0 }, regionSize: G.GRUND.kachel }, SimplexNoise);
                        }
                        const nassIn = (x, z) => G.hoehe(L, x, z, false) < wl;
                        const n0 = nassIn(0, 0);
                        let quer = null;
                        for (let d = 250; d <= mit.bisM && !quer; d += 250)
                            for (let i = 0; i < 16 && !quer; i++) {
                                const c = Math.cos((i * Math.PI) / 8), s = Math.sin((i * Math.PI) / 8);
                                if (nassIn(d * c, d * s) === n0) continue;
                                let e = d - 250;
                                while (e < d && nassIn(e * c, e * s) === n0) e += 10;
                                quer = [];
                                for (let t = 0; t <= 10; t++) { const q = n0 ? e - (t - 5) * 40 : e + (t - 5) * 40; quer.push([q * c, q * s, G.hoehe(L, q * c, q * s, false)]); }
                            }
                        M0 = memo[k] = { L, wl, quer };
                        if (quer && a.saat === "heim") for (const [x, z] of [quer[0], quer[10]]) { let n = 0; while (r._ensureHydroTilesAround(x, z, 32) && n < 100) { await new Promise((f) => setTimeout(f, 50)); n++; } }
                    }
                    if (!M0.quer) return { saat: k, kueste: false };
                    const [sx, sz] = M0.quer[10];
                    if (a.saat !== "heim") {
                        const spiegel = G.wasserSpiegel(M0.L, sx, sz);
                        return { saat: k, zeit: a.zeit, spiegel: Math.round(spiegel * 1000) / 1000, nass: M0.quer.filter(([x, z, h]) => G.wasserSpiegel(M0.L, x, z) > h).length, uhr: 0, wl: M0.wl };
                    }
                    const alt = st.spielZeit, stundeS = r._kalender().normS / 24;
                    try {
                        st.spielZeit = alt + a.zeit * stundeS;
                        r._pegelTakt();
                        const spiegel = r._koerperWasser(sx, sz, -Infinity);
                        return { saat: k, zeit: a.zeit, spiegel: Math.round(spiegel * 1000) / 1000, nass: M0.quer.filter(([x, z]) => r._nassAt(x, z)).length, uhr: 1, wl: M0.wl };
                    } finally {
                        st.spielZeit = alt;
                        r._pegelTakt();
                    }
                };
                const jeSaat = (l) => { const g = {}; for (const x of l) (g[x.a.saat] = g[x.a.saat] || []).push(x); return Object.values(g).map((s) => s.sort((p, q) => p.a.zeit - q.a.zeit)); };
                const hubVon = (s) => Math.max(...s.map((x) => x.w.spiegel)) - Math.min(...s.map((x) => x.w.spiegel));
                const periodeVon = (s) => {
                    const v = s.map((x) => x.w.spiegel), m = v.reduce((p, y) => p + y, 0) / v.length, auf = [];
                    for (let i = 1; i < v.length; i++) if (v[i - 1] < m && v[i] >= m) auf.push(s[i - 1].a.zeit + ((m - v[i - 1]) / (v[i] - v[i - 1])) * (s[i].a.zeit - s[i - 1].a.zeit));
                    return auf.length > 1 ? (auf[auf.length - 1] - auf[0]) / (auf.length - 1) : null;
                };
                const med = (v) => { const b = v.filter(Number.isFinite).sort((p, q) => p - q); return b.length ? b[Math.floor(b.length / 2)] : null; };
                const stunden = Array.from({ length: Number(u1.stunden) || 25 }, (_, h) => h);
                const RF = await FAECHER((c) => H.seite(c), {
                    gesetz: { fn: GEZEIT_AN, export: "gelaende-core.js:7767 wasserSpiegel(L, x, z) über den Meeres-Spiegel gelaende-core.js:5884 waterLevel = GRUND.basis − meerUnterBasisM", leser: "stamm/wasser-hydro.js:681 _koerperWasser (der Spiegel am Körper) · stamm/wasser-hydro.js:325 _pegelTakt unter der Welt-Uhr" },
                    adressen: { saaten: Array.from({ length: Number(u1.saaten) || 12 }, (_, i) => i + 1), zeiten: stunden, dazu: stunden.map((h) => ({ saat: "heim", ort: null, zeit: h })) },
                    mit: { bisM: Number(u1.bisM) || 20000 },
                    ms: Number(u1.ms) || 12000,
                    masse: {
                        adressen: { wie: "anzahl", feld: "spiegel" },
                        kuesten: { wie: "verschieden", feld: "a.saat", nur: (a, w) => w.spiegel != null },
                        stunden: { wie: "verschieden", feld: "a.zeit", nur: (a, w) => w.spiegel != null },
                        uhr: { wie: "summe", feld: "uhr", nur: (a, w) => w.spiegel != null },
                        hubM: { wie: (v, l) => (l.length ? Math.max(...jeSaat(l).map(hubVon)) : null), feld: "spiegel", nur: (a, w) => w.spiegel != null },
                        periodeH: { wie: (v, l) => med(jeSaat(l).filter((s) => hubVon(s) >= 0.01).map(periodeVon)), feld: "spiegel", nur: (a, w) => w.spiegel != null },
                        benetztDiff: { wie: (v, l) => (l.length ? Math.max(...jeSaat(l).map((s) => Math.max(...s.map((x) => x.w.nass)) - Math.min(...s.map((x) => x.w.nass)))) : null), feld: "nass", nur: (a, w) => w.spiegel != null },
                    },
                    schlecht: { feld: "nass", richtung: "min" },
                    pose: (a, w) => "Ego am Ufer " + (a.saat === "heim" ? "der Heimat" : "der Saat " + a.saat) + " zur Stunde " + a.zeit + " der Welt-Uhr, Blick quer übers Watt (" + w.nass + " von 11 Punkten nass, Spiegel " + w.spiegel + " m)",
                    ungemessen: ["das Bild des trockenfallenden Watts (die Welt zeichnet den Spiegel, den der Leser trägt — am Gerät)"],
                });
                const W1 = RF.werte;
                aus[1] = {
                    werte: { periodeH: W1.periodeH == null ? null : R(W1.periodeH), hubM: W1.hubM == null ? null : R(W1.hubM), benetztDiff: W1.benetztDiff },
                    zeuge: { adressen: W1.adressen, kuesten: W1.kuesten, stunden: W1.stunden, uhr: W1.uhr, hubM: W1.hubM == null ? null : R(W1.hubM), benetztDiff: W1.benetztDiff, gerissen: RF.gerissen, akte: RF.akte },
                    taeter: (RF.fehler.length && !RF.gemessen ? "Leser fehlt: " + RF.fehler[0].fehler + " · " : "") + "gelaende-core.js:5884 waterLevel = GRUND.basis − meerUnterBasisM (eine Konstante je Lage) und gelaende-core.js:7767 wasserSpiegel(L, x, z) ohne Zeit — kein Leser hebt den Spiegel mit Mond und Uhr: Hub " + (W1.hubM == null ? "—" : R(W1.hubM)) + " m über " + W1.kuesten + " Küsten × " + W1.stunden + " Stunden (" + W1.uhr + " unter der Uhr der Heimat), Watt " + W1.benetztDiff + " Punkte · " + RF.akte,
                };
            }
            // DER SPIEGEL ÜBER 25 STUNDEN der Welt-Uhr (`spielZeit`, der Pegel nachgezogen) an 20 Punkten der Küste (S3; S1 trägt der Fächer
            // oben), der Mond gegen die Sonne an 31 Tagen (`__weltLicht`), der Spiegel im Sturm gegen die Flaute
            const w = await H.seite(MEER + `
if (!m.gefunden) return { meer: false };
const st = r.state, tagS = r.constructor.DAY_LENGTH_DEFAULT_MINUTES * 60;
const [bx, bz] = m.B;
const kq = m.kueste.slice(0, 20);
const alt = [st.spielZeit, st.seasonPhase, st.regenStempel && st.regenStempel.slice()];
const mond = [], kuesteHub = kq.map(() => [Infinity, -Infinity]);
let windstau = null;
try {
for (let k = 0; k <= 25; k++) {
st.spielZeit = alt[0] + (k * tagS) / 24;
r._pegelTakt();
kq.forEach(([x, z], i) => { const v = r._koerperWasser(x, z, -Infinity); kuesteHub[i][0] = Math.min(kuesteHub[i][0], v); kuesteHub[i][1] = Math.max(kuesteHub[i][1], v); });
}
for (let d = 0; d <= 30; d++) {
st.seasonPhase = (alt[1] + d / 365) % 1;
const wi = r._sonnenWinkel(0.5);
const a = __weltLicht.sonnenRichtung(wi), b = __weltLicht.mondRichtung(wi);
mond.push(R((Math.acos(Math.max(-1, Math.min(1, a[0] * b[0] + a[1] * b[1] + a[2] * b[2]))) * 180) / Math.PI));
}
} finally {
st.spielZeit = alt[0]; st.seasonPhase = alt[1]; st.regenStempel = alt[2]; r._pegelTakt();
}
const wAlt = st.weather;
try {
if (window.__wetterSetzen("sunny") !== "sunny") throw new Error("das Wetter der Probe gilt nicht: sunny");
r._pegelTakt();
const flaute = r._koerperWasser(bx, bz, -Infinity);
if (window.__wetterSetzen("stormy") !== "stormy") throw new Error("das Wetter der Probe gilt nicht: stormy");
r._pegelTakt();
windstau = [R(flaute), R(r._koerperWasser(bx, bz, -Infinity)), R(r._windAt(bx, bz, 0).ms)];
} finally { window.__wetterSetzen(wAlt); r._pegelTakt(); }
return { meer: true, mond, windstau, kuesteHub: kuesteHub.map(([a, b]) => R(b - a)), flaecheKm2: m.flaecheKm2, abstandKm: m.abstandKm, ufer: m.ufer };
`);
            if (!w.meer) {
                for (const nr of ziel) if (nr !== "1") aus[nr] = M.nicht("kein Meer im Gelände der Welt bis 20 km vom Spawn");
                return { sprossen: aus };
            }
            // DER PLANET-FADEN: die Saaten antworten mit ihrem Anker (trägt einer einen Mond?), die Erde zu −3 Ga
            const faden = await H.seite(`
await r._fadenQuelle();
const saaten = ["anazh-realm-seed", "erde", "mond-a", "mond-b", "mond-c"];
const anker = await Promise.all(saaten.map((samen) => r._planetAuftrag({ type: "planet-anker", samen })));
const e = anker[1], RAD = 180 / Math.PI;
const zeiten = [0, -3000];
const ort = await Promise.all(zeiten.map((zeitMa) => r._planetAuftrag({ type: "planet-ort", samen: "erde", breite: e.breite * RAD, laenge: e.laenge * RAD, zeitMa }).then((o) => [zeitMa, o.delta.meer.waterLevelM, o.version]).catch((x) => [zeitMa, null, String(x && x.message)])));
return { anker: anker.map((a) => ({ samen: a.samen, felder: Object.keys(a), mond: "mond" in a || "mondMasse" in a })), ort };
`);
            const mond = w.mond.filter(Number.isFinite);
            const spanne = mond.length ? Math.max(...mond) - Math.min(...mond) : NaN;
            const monde = faden.anker.filter((a) => a.mond).length;
            const ort = "die Bucht " + w.abstandKm + " km vom Spawn (" + w.flaecheKm2 + " km²)";
            const je = {};
            if (aus[1]) je[1] = aus[1];
            je[2] = {
                werte: { tage: mond.length, mondWinkelSpanne: R(spanne), mondWinkel: mond[0] },
                zeuge: { tage: mond.length, phasenSpanne: R(spanne) },
                ...(spanne < 1 ? { nicht: "kein Mondlauf: der Mond steht der Sonne an " + mond.length + " Tagen gegenüber (Winkel " + mond[0] + "°, Spanne " + R(spanne) + "°; stamm/bild-himmel.js:1150 moonDir = −sunDir) — keine Spring- und Nipptide" } : {}),
            };
            je[3] = {
                werte: { kuesten: 1, saaten: 1, buchtenJe1e4: 0, kuesteHubMax: R(Math.max(...w.kuesteHub)) },
                zeuge: { hubKuesten: w.kuesteHub.filter((h) => h > 0.01).length },
                nicht: "kein Tidenhub an " + w.kuesteHub.length + " Küstenpunkten (höchstens " + R(Math.max(...w.kuesteHub)) + " m), keine Resonanz der Bucht, EINE Küste der Heimat statt 20 aus 5 Saaten",
            };
            const stau = w.windstau ? w.windstau[1] - w.windstau[0] : NaN;
            je[4] = {
                werte: { windstauM: R(stau), sturmMs: w.windstau ? w.windstau[2] : null },
                zeuge: { windstauM: R(stau) },
                ...(!(stau > 0.01) ? { nicht: "kein Windstau: der Spiegel an " + ort + " steht im Sturm (" + (w.windstau && w.windstau[2]) + " m/s) wie in der Flaute (Δ " + R(stau) + " m) — der Meeresspiegel ist eine Konstante (gelaende-core.js:5884)" } : {}),
            };
            je[5] = {
                werte: { konfigurationen: monde, saatenGefragt: faden.anker.length },
                zeuge: { monde },
                ...(monde < 5 ? { nicht: "keine Saat mit Mond: " + faden.anker.length + " Anker des Planet-Fadens tragen " + monde + " Monde (Felder " + faden.anker[0].felder.join(", ") + "; planet-core.js:312 planetPlan ohne Mond)" } : {}),
            };
            const o3 = faden.ort.find((x) => x[0] === -3000);
            je[6] = {
                werte: Object.assign({ meerDeltaM: o3 ? R(o3[1]) : null }, o3 && Number.isFinite(o3[1]) ? { zeitGa: -3 } : {}),
                zeuge: { hubZeiten: 0, faden: faden.ort.filter((x) => Number.isFinite(x[1])).length },
                nicht: "kein Mondabstand in der Zeit (planet-core.js:312 ohne Mond), kein Tidenhub an der Spiel-Küste; keine Erd-Saat mit Schlüssel (R4)",
            };
            je[7] = {
                werte: {},
                zeuge: {},
                auge: await M.auge("wasser-gezeiten-s7", { ort: "wiese" }, { uhr: 0.95 }),
                nicht: "kein Doppelmond, kein Eismond (planet-core.js:312 planetPlan: kein Mond je Saat)",
            };
            for (const nr of ziel) aus[nr] = je[nr] || M.nicht("ungemessen");
            return { sprossen: aus };
        },
        sprossen: {
            1: {
                u: { saaten: 12, stunden: 25, bisM: 20000, ms: 12000 },
                soll: [K.soll(GZ, 1, "Periode ±2 %", { key: "periodeH", ref: 12.42, refQuelle: "Erde: halbtägige Mondgezeit M2, 12 h 25 min (12,42 h)", einheit: "h" })],
                zeuge: zMin({ adressen: 200, kuesten: 5, stunden: 25, uhr: 25, hubM: 0.05, benetztDiff: 1 }),
                zeugeText: "der Fächer: ≥ 200 Adressen an ≥ 5 Küsten über 25 Stunden (die Heimat unter ihrer Uhr), der Spiegel stieg und fiel, das Watt fiel trocken",
                taeter: "gelaende-core.js:5884 waterLevel (eine Konstante je Lage) · gelaende-core.js:7767 wasserSpiegel ohne Zeit",
                nicht: "keine Gezeit (der Meeresspiegel ist eine Konstante)",
                leser: "stamm/wasser-hydro.js:681 _koerperWasser über gelaende-core.js:7767 wasserSpiegel — waterLevel = GRUND.basis − meerUnterBasisM (gelaende-core.js:5884); kein Leser hebt den Spiegel mit Mond und Uhr",
                gruen: gut({ periodeH: 12.5, hubM: 1.2, benetztDiff: 9 }, { adressen: 325, kuesten: 13, stunden: 25, uhr: 25, hubM: 1.2, benetztDiff: 9 }),
                attrappen: [
                    { name: "die Periode 12,42 h eingetragen, der Spiegel steht", roh: gut({ periodeH: 12.42, hubM: 0 }, { adressen: 325, kuesten: 13, stunden: 25, uhr: 25, hubM: 0, benetztDiff: 0 }) },
                    { name: "die Gezeit EINER Küste", roh: gut({ periodeH: 12.5, hubM: 1.2 }, { adressen: 25, kuesten: 1, stunden: 25, uhr: 25, hubM: 1.2, benetztDiff: 9 }) },
                    { name: "die Saaten ohne die Uhr der Heimat", roh: gut({ periodeH: 12.5, hubM: 1.2 }, { adressen: 300, kuesten: 12, stunden: 25, uhr: 0, hubM: 1.2, benetztDiff: 9 }) },
                    { name: "der stehende Spiegel (der Fächer am Export: kein Hub, keine Periode)", roh: gut({ periodeH: null, hubM: 0, benetztDiff: 0 }, { adressen: 325, kuesten: 13, stunden: 25, uhr: 25, hubM: 0, benetztDiff: 0 }) },
                ],
            },
            2: {
                u: { tage: 30 },
                soll: [
                    K.soll(GZ, 2, "Spring-Nipp-Takt 14,8 d ±2 %", { key: "springNippTage", ref: 14.77, refQuelle: "Erde: halber synodischer Monat 29,53 d / 2 = 14,77 d", einheit: "d" }),
                    K.soll(GZ, 2, "Pegel über 30 Tage", { key: "tage", rel: "≥", einheit: "d" }),
                ],
                zeuge: zMin({ tage: 30, phasenSpanne: 90 }),
                zeugeText: "der Mond lief durch seine Phasen, der Pegel folgte",
                taeter: "stamm/bild-himmel.js _applyDayNightToScene (moonDir = −sunDir: ewiger Vollmond)",
                nicht: "kein Mondlauf (ewiger Vollmond)",
                leser: "welt-licht.js:720 mondRichtung — der Mond steht der Sonne stets gegenüber, kein synodischer Monat",
                gruen: gut({ springNippTage: 14.7, tage: 30 }, { tage: 31, phasenSpanne: 180 }),
                attrappen: [{ name: "14,77 d als Zahl, der Mond steht still", roh: gut({ springNippTage: 14.77, tage: 31 }, { tage: 31, phasenSpanne: 0 }) }],
            },
            3: {
                u: {},
                soll: [
                    K.soll(GZ, 3, "Hub gegen Resonanz-Vorhersage ±30 %", { key: "hubJeResonanz", ref: 1, refQuelle: "Erde: Viertelwellen-Resonanz einer Bucht L = √(g·h)·T/4 (Bay of Fundy, Garrett 1972)" }),
                    K.soll(GZ, 3, "≥ 1 Bucht > 8 m je 10⁴ km² Küste", { key: "buchtenJe1e4" }),
                    K.soll(GZ, 3, "20 Küsten", { key: "kuesten", rel: "≥" }),
                    K.soll(GZ, 3, "5 Saaten", { key: "saaten", rel: "≥" }),
                ],
                zeuge: zMin({ hubKuesten: 20 }),
                zeugeText: "an 20 Küsten ein Hub gemessen",
                taeter: "gelaende-core.js waterLevel (kein Tidenhub)",
                nicht: "kein Tidenhub, EINE Küste",
                leser: "gelaende-core.js:5884 — kein Hub des Spiegels je Küste, keine Resonanz aus Schelf und Bucht",
                gruen: gut({ hubJeResonanz: 1.1, buchtenJe1e4: 1.4, kuesten: 20, saaten: 5 }, { hubKuesten: 20 }),
                attrappen: [{ name: "die Resonanz eingesetzt, kein Hub an der Küste", roh: gut({ hubJeResonanz: 1, buchtenJe1e4: 1, kuesten: 20, saaten: 5 }, { hubKuesten: 0 }) }],
            },
            4: {
                u: { wetter: ["sunny", "stormy"] },
                soll: [
                    K.soll(GZ, 4, "Windstau gegen ∝ U²·Fetch/h ±30 %", { key: "windstauJeSoll", ref: 1, refQuelle: "Erde: Windstau Δh ∝ τ·F/(ρ·g·h) mit τ ∝ U² (Nordsee-Sturmflut 1962)" }),
                    K.soll(GZ, 4, "überflutete Fläche deckt die Tiefenkarte ≥ 90 %", { key: "deckungProzent", einheit: "%" }),
                ],
                zeuge: zMin({ windstauM: 0.05 }),
                zeugeText: "der Sturm hob den Spiegel gegen die Flaute",
                taeter: "gelaende-core.js waterLevel (der Wind hebt das Meer nicht)",
                nicht: "kein Windstau",
                leser: "gelaende-core.js:5884 — der Spiegel des Meers liest keinen Wind (stamm/stoff-material.js _windAt)",
                gruen: gut({ windstauJeSoll: 1.1, deckungProzent: 93 }, { windstauM: 1.8 }),
                attrappen: [{ name: "der Windstau als Formel, der Spiegel bleibt", roh: gut({ windstauJeSoll: 1, deckungProzent: 95 }, { windstauM: 0 }) }],
            },
            5: {
                u: { saaten: ["anazh-realm-seed", "erde", "mond-a", "mond-b", "mond-c"] },
                soll: [
                    K.soll(GZ, 5, "Hub ∝ M/r³ zwischen Saaten ±10 %", { key: "hubJeMr3", ref: 1, refQuelle: "Erde: Gezeitenkraft ∝ M/r³ (Newton 1687), Mond 2,2-fach der Sonne" }),
                    K.soll(GZ, 5, "5 Konfigurationen", { key: "konfigurationen", rel: "≥" }),
                ],
                zeuge: zMin({ monde: 5 }),
                zeugeText: "fünf Saaten mit gemessenem Mond",
                taeter: "planet-core.js planetPlan (kein Mond im Körper)",
                nicht: "keine Saat mit Mond",
                leser: "planet-core.js:312 planetPlan — der Körper trägt keine Mondmasse und keinen Mondabstand",
                gruen: gut({ hubJeMr3: 1.04, konfigurationen: 5 }, { monde: 5 }),
                attrappen: [{ name: "M/r³ gerechnet ohne Mond der Saat", roh: gut({ hubJeMr3: 1, konfigurationen: 5 }, { monde: 0 }) }],
            },
            6: {
                u: { zeitMa: -3000 },
                soll: [
                    K.soll(GZ, 6, "Erd-Saat bei −3 Ga", { key: "zeitGa", rel: "=", zahl: -3, einheit: "Ga" }),
                    K.soll(GZ, 6, "wie M/r³ ±20 %", { key: "hubJeMr3", ref: 1, refQuelle: "Erde: Mondabstand vor 3 Ga ~ 0,9 des heutigen (Gezeiten-Rhythmite, Williams 2000), Hub ∝ M/r³" }),
                ],
                zeuge: zMin({ hubZeiten: 2 }),
                zeugeText: "der Tidenhub an der Spiel-Küste zu zwei Zeiten gemessen",
                taeter: "planet-core.js planetPlan (kein Mond) · gelaende-core.js waterLevel",
                nicht: "kein Mondabstand, kein Tidenhub, keine Erd-Saat",
                leser: "planet-core.js:312 planetPlan — kein Mond; voxel-worker.js:1201 planetOrtAuftrag nennt nur den Meeresspiegel der Zeit",
                gruen: gut({ zeitGa: -3, hubJeMr3: 1.1 }, { hubZeiten: 2 }),
                attrappen: [{ name: "die Zeit gesetzt, der Hub nie gemessen", roh: gut({ zeitGa: -3, hubJeMr3: 1 }, { hubZeiten: 0, faden: 2 }) }],
            },
            7: {
                u: {},
                soll: [K.soll(GZ, 7, "Rang ≥ 0,7", { key: "rang" })],
                auge: { pose: "der Himmel über der Wiese bei Nacht (heute: ein Vollmond, kein Doppelmond)", vorbild: "Bild der Gezeit eines Doppelmond-Planeten, Prüfer-Satz R11 (Fremdwelt-Probe R10)" },
                taeter: "planet-core.js planetPlan (kein Mond)",
                nicht: "kein Doppelmond, kein Eismond",
                leser: "planet-core.js:312 planetPlan — kein Mond, keine Gezeitenheizung",
                // ZAHL (auge-klasse.cjs): die Station urteilt die Zahl, das Bild ist Beleg
                zeuge: zMin({ eismonde: 5 }),
                zeugeText: "der Rang über ≥ 5 Eismonde mit Wärmefluss und Exzentrizität",
                gruen: gut({ rang: 0.75 }, { eismonde: 10 }),
                attrappen: [{ name: "der Rang ohne Mond", roh: leer({ rang: 0.75 }) }],
            },
        },
    };

    // ════════════════════════════════════════ STRÖMUNG ════════════════════════════════════════
    const SR = "planet.wasser.stroemung";
    const stroemung = {
        sek: 25,
        pfad: PFAD,
        ungefahren: "der optische Fluss zweier Bilder (Sprosse 2) — die Werkbank misst keine Bewegung im Bild",
        mess: async function (H, U, M) {
            const MEER = `
const L = r._gelaende(), G = globalThis.__gelaendeCore;
const R = (v) => (Number.isFinite(v) ? Math.round(v * 1000) / 1000 : null);
const warte = async (x, z) => { let n = 0; while (r._ensureHydroTilesAround(x, z, 32) && n < 200) { await new Promise((f) => setTimeout(f, 50)); n++; } return n; };
const tiefe = (x, z) => { const kw = r._koerperWasser(x, z, -Infinity), g = r._voxelSurfaceY(x, z); return kw > -Infinity && g !== null && Number.isFinite(g) && kw > g ? kw - g : 0; };
let m = window.__pwMeer;
if (!m) {
m = { gefunden: false };
let p = null;
for (let d = 500; d <= 20000 && !p; d += 250) for (let a = 0; a < 32 && !p; a++) { const x = d * Math.cos((a * Math.PI) / 16), z = d * Math.sin((a * Math.PI) / 16); if (G.hoehe(L, x, z, false) < L.waterLevel - 2) p = [x, z]; }
if (p) {
for (const [a, b] of [[0, 0], [-1500, -1500], [1500, -1500], [-1500, 1500], [1500, 1500]]) await warte(p[0] + a, p[1] + b);
const N = 61, T = new Float64Array(N * N);
for (let i = 0; i < N; i++) for (let j = 0; j < N; j++) T[i + N * j] = tiefe(p[0] + 50 * (i - 30), p[1] + 50 * (j - 30));
let best = [0, p[0], p[1]], zellen = 0;
const kueste = [], innen = [];
for (let i = 0; i < N; i++) for (let j = 0; j < N; j++) {
const t = T[i + N * j];
if (!(t > 0)) continue;
const x = p[0] + 50 * (i - 30), z = p[1] + 50 * (j - 30);
zellen++;
if (t > best[0]) best = [t, x, z];
const rand = [[1, 0], [-1, 0], [0, 1], [0, -1]].some(([a, b]) => i + a < 0 || j + b < 0 || i + a >= N || j + b >= N || !(T[i + a + N * (j + b)] > 0));
if (rand) kueste.push([x, z]); else innen.push([x, z, R(t)]);
}
const B = [best[1], best[2]], d0 = Math.hypot(B[0], B[1]), ux = -B[0] / d0, uz = -B[1] / d0;
let s = null;
for (let k = 1; k < 800 && !s; k++) { const x = B[0] + ux * 10 * k, z = B[1] + uz * 10 * k; if (!(tiefe(x, z) > 0) && r._voxelSurfaceY(x, z) > L.waterLevel) s = [x + ux * 6, z + uz * 6]; }
let art = null;
for (const t of (r.state.hydroTiles || new Map()).values()) { const sz = t.dim * t.cell; if (t.water && B[0] >= t.originX && B[1] >= t.originZ && B[0] < t.originX + sz && B[1] < t.originZ + sz) art = t.water.waterKind[Math.floor((B[0] - t.originX) / t.cell) + Math.floor((B[1] - t.originZ) / t.cell) * t.dim]; }
const sy = s ? r._voxelSurfaceY(s[0], s[1]) : null;
const jede = (A, n) => A.filter((q, i) => i % Math.max(1, Math.floor(A.length / n)) === 0).slice(0, n);
m = { gefunden: true, p, B, tiefeMax: R(best[0]), spiegel: R(r._koerperWasser(B[0], B[1], -Infinity)), flaecheKm2: R((zellen * 2500) / 1e6), kuesteN: kueste.length, kuesteKm: R(kueste.length * 0.05), kueste: jede(kueste, 120), innen: jede(innen, 100), art, abstandKm: R(d0 / 1000), ufer: s ? [R(s[0]), R(sy + 1.7), R(s[1]), R(B[0]), R(L.waterLevel), R(B[1])] : null, richtung: [R(ux), R(uz)] };
}
window.__pwMeer = m;
}
`;
            const R = (v) => (Number.isFinite(v) ? Math.round(v * 1000) / 1000 : null);
            const ziel = Object.keys(U);
            const aus = M.teil || {};
            // DIE FLÜSSE DER HEIMAT: 12 Posen auf den Läufen des Gesetzes (`flussLaeufe` ±1 km, ≥ 150 m auseinander, im Kanal), je Pose die
            // Strömung der Welt (`_waterFlowAt`) gegen die Richtung des Laufs; DAS MEER: die Strömung an seinen Punkten (Küste und innen)
            const w = await H.seite(MEER + `
await warte(0, 0);
const lf = G.flussLaeufe(L, -1000, -1000, 1000, 1000, 16);
const posen = [];
for (const l of lf) for (const g of l.glieder) {
const b = g.bahn || [];
for (let i = 1; i + 1 < b.length && posen.length < 12; i += 3) {
const q = b[i];
if (posen.some((p) => Math.hypot(p[0] - q.x, p[1] - q.z) < 150)) continue;
const rv = r._hydroRiverAt(q.x, q.z), f = r._waterFlowAt(q.x, q.z);
if (!rv || !(rv.centerness > 0.9) || !f) continue;
const tx = b[i + 1].x - b[i - 1].x, tz = b[i + 1].z - b[i - 1].z, tl = Math.hypot(tx, tz), fl = Math.hypot(f.x, f.z);
const c = (tx * f.x + tz * f.z) / (tl * fl), s = (tx * f.z - tz * f.x) / (tl * fl);
posen.push([R(q.x), R(q.z), R(fl), R((Math.atan2(s, c) * 180) / Math.PI), R(rv.breite)]);
}
}
const meerPunkte = m.gefunden ? m.kueste.concat(m.innen.map((q) => [q[0], q[1]])) : [];
const strom = meerPunkte.map(([x, z]) => r._waterFlowAt(x, z)).filter(Boolean).length;
return { posen, laeufe: lf.length, meer: m.gefunden, meerPunkte: meerPunkte.length, kuestePunkte: m.gefunden ? m.kueste.length : 0, innenPunkte: m.gefunden ? m.innen.length : 0, strom, kuesteKm: m.kuesteKm, flaecheKm2: m.flaecheKm2, abstandKm: m.abstandKm };
`);
            const P = w.posen || [];
            const abw = P.map((p) => Math.abs(p[3]));
            const ort = w.meer ? "die Bucht " + w.abstandKm + " km vom Spawn (" + w.flaecheKm2 + " km²)" : "kein Meer bis 20 km";
            const ohneStrom = "kein Strom im Meer: an " + w.meerPunkte + " Punkten von " + ort + " schweigt die Strömung (stamm/wasser-hydro.js:356 _waterFlowAt liest nur den Fluss)";
            const je = {};
            je[2] = {
                werte: { flussPosen: P.length, flussRichtungAbwMax: R(abw.length ? Math.max(...abw) : NaN), flussMs: R(P.length ? P.reduce((s, p) => s + p[2], 0) / P.length : NaN) },
                zeuge: { bildPaare: 0, flussPosen: P.length, je: P },
                grund: "kein optischer Fluss: die Werkbank misst zwei Bilder nie gegeneinander (scripts/werkbank.cjs /bild: Pixel, Spiegel, Farbe)",
            };
            je[3] = {
                werte: { ripJe500m: w.meer ? 0 : null, kuesteKm: w.kuesteKm, meerStrom: w.strom },
                zeuge: { meerStrom: w.strom, kuestePunkte: w.kuestePunkte },
                ...(w.strom === 0 ? { nicht: ohneStrom + "; kein Brandungsrückstrom, kein Küstenlängsstrom" } : {}),
            };
            const bewegt = w.strom;
            je[4] = {
                werte: { treibkoerper: w.meerPunkte, wirbelProzent: w.meerPunkte ? R((100 * bewegt) / w.meerPunkte) : null },
                zeuge: { bewegt },
                ...(bewegt === 0 ? { nicht: "kein Ozeanbecken 10³ km: " + ohneStrom } : {}),
            };
            je[5] = {
                werte: { landetProzent: w.meerPunkte ? 0 : null, treibkoerper: w.meerPunkte },
                zeuge: { bewegt },
                ...(bewegt === 0 ? { nicht: "kein Becken 10⁴ km und keine Drift: " + ohneStrom } : {}),
            };
            je[6] = {
                werte: { meerStrom: w.strom },
                zeuge: { umwaelzung: 0 },
                nicht: "keine Umwälzung: das Meer trägt weder Salz noch Wärme als Strömung (" + ohneStrom + ")",
            };
            je[7] = {
                werte: {},
                zeuge: { welten: 0 },
                nicht: "keine Wirbel je Halbkugel: die Strömung des Planeten reist nicht aus dem Faden (voxel-worker.js:1202 planetOrtAuftrag ohne Wind und Zellen), fremde Ozeane trägt die Welt nicht",
            };
            for (const nr of ziel) aus[nr] = je[nr] || M.nicht("ungemessen");
            return { sprossen: aus };
        },
        sprossen: {
            2: {
                u: { posen: 12, abstandS: 0.5 },
                soll: [
                    K.soll(SR, 2, "längs/quer ≥ 1,5", { key: "laengsQuer" }),
                    K.soll(SR, 2, "Richtung ±20°", { key: "richtungAbwGrad", ref: 0, refQuelle: "Erde: das Wasser fließt längs des Laufs (Abweichung 0°)", einheit: "°" }),
                    K.soll(SR, 2, "12 Posen", { key: "bildPosen", rel: "≥" }),
                ],
                zeuge: zMin({ bildPaare: 12, flussPosen: 12 }),
                zeugeText: "12 Bildpaare am Fluss, der Fluss im Bild",
                taeter: "scripts/werkbank.cjs /bild (kein optischer Fluss)",
                leser: "scripts/werkbank.cjs:2110 /bild — kein Maß der Bewegung zweier Bilder 0,5 s auseinander (die Teilung misst Pixel, Spiegel, Farbe)",
                gruen: gut({ laengsQuer: 2.1, richtungAbwGrad: 8, bildPosen: 12 }, { bildPaare: 12, flussPosen: 12 }),
                attrappen: [{ name: "die Richtung aus _waterFlowAt statt aus dem Bild", roh: gut({ laengsQuer: 99, richtungAbwGrad: 0, bildPosen: 12 }, { bildPaare: 0, flussPosen: 12 }) }],
            },
            3: {
                u: {},
                soll: [
                    K.soll(SR, 3, "Rip-Ströme ≥ 1 je 500 m brandender Küste", { key: "ripJe500m" }),
                    K.soll(SR, 3, "Treibrichtung gegen Welleneinfall ±20°", { key: "treibAbwGrad", ref: 0, refQuelle: "Erde: Küstenlängsstrom längs der Komponente des Welleneinfalls (Longuet-Higgins 1970)", einheit: "°" }),
                ],
                zeuge: zMin({ meerStrom: 1, kuestePunkte: 20 }),
                zeugeText: "die Küste trägt Strom",
                taeter: "stamm/wasser-hydro.js _waterFlowAt (nur der Fluss)",
                nicht: "kein Strom im Meer",
                leser: "stamm/wasser-hydro.js:356 _waterFlowAt — die Strömung liest nur den Fluss (`_hydroRiverAt`), nie das Meer",
                gruen: gut({ ripJe500m: 1.4, treibAbwGrad: 12 }, { meerStrom: 30, kuestePunkte: 120 }),
                attrappen: [{ name: "Rip-Ströme gezählt an einer Küste ohne Strom", roh: gut({ ripJe500m: 1.4, treibAbwGrad: 12 }, { meerStrom: 0, kuestePunkte: 120 }) }],
            },
            4: {
                u: { treibkoerper: 100 },
                soll: [
                    K.soll(SR, 4, "≥ 70 % folgen dem Wirbel", { key: "wirbelProzent", einheit: "%" }),
                    K.soll(SR, 4, "Westrand ≥ 3× schneller als Ostrand", { key: "westJeOst" }),
                    K.soll(SR, 4, "100 Treibkörper", { key: "treibkoerper", rel: "≥" }),
                ],
                zeuge: zMin({ bewegt: 70 }),
                zeugeText: "die Treibkörper bewegten sich",
                taeter: "stamm/wasser-hydro.js _waterFlowAt (kein Ozeanwirbel)",
                nicht: "kein Ozeanbecken, kein Strom im Meer",
                leser: "stamm/wasser-hydro.js:356 _waterFlowAt — kein Wirbel, keine Westrand-Verstärkung",
                gruen: gut({ wirbelProzent: 76, westJeOst: 4.2, treibkoerper: 100 }, { bewegt: 100 }),
                attrappen: [{ name: "100 Punkte, keiner treibt", roh: gut({ wirbelProzent: 76, westJeOst: 4.2, treibkoerper: 100 }, { bewegt: 0 }) }],
            },
            5: {
                u: { jahre: 3 },
                soll: [
                    K.soll(SR, 5, "≥ 70 % des Treibguts landet an den Küsten", { key: "landetProzent", einheit: "%" }),
                    K.soll(SR, 5, "3 Spieljahre", { key: "spieljahre", rel: "≥" }),
                ],
                zeuge: zMin({ bewegt: 70 }),
                zeugeText: "das Treibgut kreuzte das Becken",
                taeter: "stamm/wasser-hydro.js _waterFlowAt (kein Strom im Meer)",
                nicht: "kein Becken 10⁴ km, keine Drift",
                leser: "stamm/wasser-hydro.js:356 _waterFlowAt — keine Drift über Becken",
                gruen: gut({ landetProzent: 74, spieljahre: 3 }, { bewegt: 100 }),
                attrappen: [{ name: "die Landung vorhergesagt, nichts trieb", roh: gut({ landetProzent: 74, spieljahre: 3 }, { bewegt: 0 }) }],
            },
            6: {
                u: {},
                soll: [K.soll(SR, 6, "Umwälzung −50 %", { key: "umwaelzungProzent", rel: "≤", einheit: "%" })],
                zeuge: zMin({ umwaelzung: 2 }),
                zeugeText: "die Umwälzung vor und nach dem Puls gemessen",
                taeter: "stamm/wasser-hydro.js (keine Umwälzung)",
                nicht: "keine Umwälzung",
                leser: "planet-core.js:2290 planetOrt — kein Leser von Salz, Dichte und Umwälzung des Meers",
                gruen: gut({ umwaelzungProzent: -55 }, { umwaelzung: 2 }),
                attrappen: [{ name: "−50 % als Zahl ohne Puls", roh: leer({ umwaelzungProzent: -55 }) }],
            },
            7: {
                u: { welten: 5 },
                soll: [
                    K.soll(SR, 7, "Wirbelzahl je Halbkugel folgt der Rotationsrate ±1", { key: "wirbelAbw", ref: 0, refQuelle: "Erde: zwei Subtropen-Wirbel je Halbkugel bei 24 h Tag (Stommel 1948, Munk 1950), Abweichung 0" }),
                    K.soll(SR, 7, "5 Welten", { key: "welten", rel: "≥" }),
                ],
                zeuge: zMin({ welten: 5 }),
                zeugeText: "fünf Welten mit gezählten Wirbeln",
                taeter: "voxel-worker.js planetOrtAuftrag (keine Strömung im Faden)",
                nicht: "keine Wirbel, keine fremden Ozeane",
                leser: "voxel-worker.js:1202 planetOrtAuftrag — Wind und Zell-Zahl der Zirkulation reisen nicht aus dem Faden; kein Ozean-Wirbel im Planet-Kern",
                gruen: gut({ wirbelAbw: 0, welten: 5 }, { welten: 5 }),
                attrappen: [{ name: "die Wirbelzahl aus Held-Hou gerechnet, keine Welt", roh: leer({ wirbelAbw: 0, welten: 5 }) }],
            },
        },
    };

    // ════════════════════════════════════════ EIS ════════════════════════════════════════
    const EI = "planet.wasser.eis";
    const eis = {
        sek: 50,
        faecher: true,
        pfad: PFAD,
        mutiert: true,
        ungefahren: "die Bilder (Scholle im Blindpaar, Eismond) schießt die Probe nur am Gerät",
        mess: async function (H, U, M) {
            const MEER = `
const L = r._gelaende(), G = globalThis.__gelaendeCore;
const R = (v) => (Number.isFinite(v) ? Math.round(v * 1000) / 1000 : null);
const warte = async (x, z) => { let n = 0; while (r._ensureHydroTilesAround(x, z, 32) && n < 200) { await new Promise((f) => setTimeout(f, 50)); n++; } return n; };
const tiefe = (x, z) => { const kw = r._koerperWasser(x, z, -Infinity), g = r._voxelSurfaceY(x, z); return kw > -Infinity && g !== null && Number.isFinite(g) && kw > g ? kw - g : 0; };
let m = window.__pwMeer;
if (!m) {
m = { gefunden: false };
let p = null;
for (let d = 500; d <= 20000 && !p; d += 250) for (let a = 0; a < 32 && !p; a++) { const x = d * Math.cos((a * Math.PI) / 16), z = d * Math.sin((a * Math.PI) / 16); if (G.hoehe(L, x, z, false) < L.waterLevel - 2) p = [x, z]; }
if (p) {
for (const [a, b] of [[0, 0], [-1500, -1500], [1500, -1500], [-1500, 1500], [1500, 1500]]) await warte(p[0] + a, p[1] + b);
const N = 61, T = new Float64Array(N * N);
for (let i = 0; i < N; i++) for (let j = 0; j < N; j++) T[i + N * j] = tiefe(p[0] + 50 * (i - 30), p[1] + 50 * (j - 30));
let best = [0, p[0], p[1]], zellen = 0;
const kueste = [], innen = [];
for (let i = 0; i < N; i++) for (let j = 0; j < N; j++) {
const t = T[i + N * j];
if (!(t > 0)) continue;
const x = p[0] + 50 * (i - 30), z = p[1] + 50 * (j - 30);
zellen++;
if (t > best[0]) best = [t, x, z];
const rand = [[1, 0], [-1, 0], [0, 1], [0, -1]].some(([a, b]) => i + a < 0 || j + b < 0 || i + a >= N || j + b >= N || !(T[i + a + N * (j + b)] > 0));
if (rand) kueste.push([x, z]); else innen.push([x, z, R(t)]);
}
const B = [best[1], best[2]], d0 = Math.hypot(B[0], B[1]), ux = -B[0] / d0, uz = -B[1] / d0;
let s = null;
for (let k = 1; k < 800 && !s; k++) { const x = B[0] + ux * 10 * k, z = B[1] + uz * 10 * k; if (!(tiefe(x, z) > 0) && r._voxelSurfaceY(x, z) > L.waterLevel) s = [x + ux * 6, z + uz * 6]; }
let art = null;
for (const t of (r.state.hydroTiles || new Map()).values()) { const sz = t.dim * t.cell; if (t.water && B[0] >= t.originX && B[1] >= t.originZ && B[0] < t.originX + sz && B[1] < t.originZ + sz) art = t.water.waterKind[Math.floor((B[0] - t.originX) / t.cell) + Math.floor((B[1] - t.originZ) / t.cell) * t.dim]; }
const sy = s ? r._voxelSurfaceY(s[0], s[1]) : null;
const jede = (A, n) => A.filter((q, i) => i % Math.max(1, Math.floor(A.length / n)) === 0).slice(0, n);
m = { gefunden: true, p, B, tiefeMax: R(best[0]), spiegel: R(r._koerperWasser(B[0], B[1], -Infinity)), flaecheKm2: R((zellen * 2500) / 1e6), kuesteN: kueste.length, kuesteKm: R(kueste.length * 0.05), kueste: jede(kueste, 120), innen: jede(innen, 100), art, abstandKm: R(d0 / 1000), ufer: s ? [R(s[0]), R(sy + 1.7), R(s[1]), R(B[0]), R(L.waterLevel), R(B[1])] : null, richtung: [R(ux), R(uz)] };
}
window.__pwMeer = m;
}
`;
            const R = (v) => (Number.isFinite(v) ? Math.round(v * 1000) / 1000 : null);
            const ziel = Object.keys(U);
            const aus = M.teil || {};
            // S2 DAS EIS DES SEES AM FÄCHER (M4): je Adresse (Saat × Säule [Tiefe m, Höhe über dem Meer m]) das Jahr des Gesetzes —
            // je Tag die Luft über dem Spiegel (temperaturAus über temperaturFeld, das Tagesmittel aus vier Stunden, ohne Wetter wie
            // das Gesetz des Eises) und ob das Eis trägt (gelaende-core eisDicke ≥ EIS.traegt, derselbe Ruf wie `_eisLinien`); die
            // Heimat am Feld des Spiels (`_temperaturFeld`, `_wasserStoff`), der See der Soll-Tafel über den Leser des Spielers
            // (`_eisAt` je Tag der Saison), jede andere Saat an ihrer Lage (planet-ort → lageAus). Das Einsetzen: die Frostgrad-Summe
            // stündlich ab dem ersten Eis (Dicke > 1 mm) bis zum ersten tragenden, wie die Feldregel sie zählt (ab der ersten Decke);
            // daneben `fddLuft` ab dem ersten Frosttag der Luft (die Abkühlung der Säule dazu) — gezählt nur, wo das Jahr friert UND taut
            const u2 = U[2];
            if (u2) {
                const EIS_AN = async (r, T, a, mit) => {
                    const G = globalThis.__gelaendeCore, st = r.state, nT = G.TEMPERATUR.jahrTage, stoff = r._wasserStoff();
                    const memo = mit.memo || (mit.memo = {});
                    let L, wl, feld;
                    if (a.saat === "heim") {
                        L = r._gelaende();
                        wl = Number.isFinite(L.waterLevel) ? L.waterLevel : (L.baseHeight || 0) - G.GRUND.meerUnterBasis;
                        feld = (y, tr) => r._temperaturFeld(y, tr);
                    } else {
                        let M0 = memo[String(a.saat)];
                        if (!M0) {
                            await r._fadenQuelle();
                            const breite = (a.saat % 2 ? 1 : -1) * (35 + 35 * ((a.saat * 0.6180339887) % 1)), laenge = ((a.saat * 137.508) % 360) - 180;
                            const o = await r._planetAuftrag({ type: "planet-ort", samen: r._planetSamen(), breite, laenge, zeitMa: 0 });
                            const heim = r.constructor._weltGesetz(st.worldMeta).gelaende;
                            const ort = { samen: o.samen, version: o.version, breite: o.breite, laenge: o.laenge, zeitMa: o.zeitMa, delta: o.delta };
                            const O = G.ortGesetz(ort), eg = G.erbgutNormal(G.ortErbgut(G.erbgutNormal(heim == null ? undefined : heim), o.delta.wildnis));
                            const w0 = G.GRUND.basis - O.meerUnterBasisM;
                            M0 = memo[String(a.saat)] = { wl: w0, L: G.lageAus({ seed: r._reiseSaat(ort, heim), baseHeight: G.GRUND.basis, waterLevel: w0, ort, erbgut: { terme: eg, wildnis: eg[0] && eg[0].art === "wildnis" ? 1 : 0 }, regionSize: G.GRUND.kachel }, SimplexNoise) };
                        }
                        L = M0.L;
                        wl = M0.wl;
                        feld = (y, tr) => G.temperaturFeld(L, y, tr);
                    }
                    const luft = (y, s) => { const F = feld(y, 0); let t = 0; for (let h = 0; h < 4; h++) t += G.temperaturAus(F, s, 0.125 + h / 4, null) / 4; return t; };
                    // `dicke(s)` die Dicke des Gesetzes an der Säule, `traegtBei(s)` der Leser, der trägt (der See der Soll-Tafel: `_eisAt`
                    // des Spielers in der Saison s; die Säule: die Dicke ≥ EIS.traegt)
                    const Tt = [], E = [];
                    let dicke, traegtBei, ende = () => {};
                    if (a.ort === "see") {
                        const S = mit.see;
                        let n = 0;
                        while (r._ensureHydroTilesAround(S[0], S[1], 32) && n < 100) { await new Promise((f) => setTimeout(f, 50)); n++; }
                        const spiegel = r._koerperWasser(S[0], S[1], -Infinity), alt = st.seasonPhase;
                        if (!Number.isFinite(spiegel)) return { saat: "heim", ort: "see", kein: 1 };
                        const tiefeSee = spiegel - r._voxelSurfaceY(S[0], S[1]);
                        dicke = (s) => G.eisDicke(L, spiegel, s, tiefeSee, (tr) => feld(spiegel, tr), stoff);
                        traegtBei = (s) => { st.seasonPhase = s; return r._eisAt(S[0], S[1]) !== null; };
                        ende = () => { st.seasonPhase = alt; r._eisLinien(); };
                        try {
                            for (let d = 0; d < nT; d++) { Tt.push(luft(spiegel, d / nT)); E.push(traegtBei(d / nT) ? 1 : 0); }
                        } catch (e) { ende(); throw e; }
                    } else {
                        const tiefe = a.ort[0], y = wl + a.ort[1];
                        dicke = (s) => G.eisDicke(L, y, s, tiefe, (tr) => feld(y, tr), stoff);
                        traegtBei = (s) => dicke(s) >= G.EIS.traegt;
                        for (let d = 0; d < nT; d++) { Tt.push(luft(y, d / nT)); E.push(traegtBei(d / nT) ? 1 : 0); }
                    }
                    const traegt = E.reduce((p, v) => p + v, 0), warm = Tt.indexOf(Math.max(...Tt));
                    let start = -1, on = -1, fddLuft = 0, auf = -1;
                    for (let k = 1; k < nT; k++) {
                        const d = (warm + k) % nT;
                        if (start < 0 && Tt[d] < 0) start = k;
                        if (start >= 0 && on < 0) { fddLuft += Math.max(0, -Tt[d]); if (E[d]) on = k; }
                        if (on >= 0 && auf < 0 && !E[d]) auf = k;
                    }
                    // offenes Wasser: ein Tag ohne Eis (Dicke ≤ 1 mm) — die Säule, deren Eis den Sommer überdauert, setzt nie ein
                    let offen = false;
                    for (let d = 0; d < nT && !offen; d++) offen = dicke(d / nT) <= 0.001;
                    const jz = traegt > 0 && traegt < nT && on >= 0 && offen ? 1 : 0;
                    // DAS EINSETZEN NACH DER FELDREGEL (sie zählt die Frostgrad-Summe ab der ersten dünnen Decke, nie ab dem ersten
                    // Frosttag der Luft — bis dahin kühlt die Säule ab): stündlich vom ersten Frosttag bis zum tragenden die erste Stunde mit
                    // Eis (Dicke > 1 mm), ab ihr die Summe der Stunden bis zur ersten tragenden
                    let fdd = null, stunden = null;
                    if (jz) {
                        const nH = 24 * nT, h0 = 24 * (warm + start);
                        let hAn = -1, q = 0, frei = false;
                        try {
                            for (let h = h0; h <= 24 * (warm + on + 1); h++) {
                                const s = (h % nH) / nH;
                                if (hAn < 0) { const dd = dicke(s); if (dd <= 0.001) frei = true; else if (frei) hAn = h; }
                                if (hAn < 0) continue;
                                if (traegtBei(s)) { fdd = q; stunden = h - hAn; break; }
                                q += Math.max(0, -Tt[Math.floor(h / 24) % nT]) / 24;
                            }
                        } finally {
                            ende();
                        }
                    } else ende();
                    const ein = jz && fdd !== null ? 1 : 0;
                    return { saat: String(a.saat), tage: nT, frost: Tt.filter((t) => t < 0).length, traegt, bricht: E.filter((e, d) => !e && Tt[d] > 0).length, jz, ewig: traegt === nT || !offen ? 1 : 0, fdd: ein ? Math.round(fdd * 1000) / 1000 : null, fddLuft: ein ? Math.round(fddLuft * 10) / 10 : null, stunden, abw: ein ? Math.round((Math.abs(fdd - mit.ref) / mit.ref) * 1000) / 1000 : null, einsetzen: ein ? (warm + on) % nT : null, tau: ein && auf >= 0 ? (warm + auf) % nT : null, tminC: Math.round(Math.min(...Tt) * 10) / 10 };
                };
                const ORTE = [[1, 5], [1, 25], [3.4, 10], [3.4, 50], [4.5, 25], [4.5, 100], [10, 50], [10, 150]];
                const med = (v) => { const b = v.filter(Number.isFinite).sort((p, q) => p - q); return b.length ? (b.length % 2 ? b[(b.length - 1) / 2] : (b[b.length / 2 - 1] + b[b.length / 2]) / 2) : null; };
                const sd = (v) => { const m = v.length ? v.reduce((p, q) => p + q, 0) / v.length : 0; return v.length > 1 ? Math.sqrt(v.reduce((p, q) => p + (q - m) ** 2, 0) / v.length) : 0; };
                const jz = (a, w) => w.jz === 1;
                const RF = await FAECHER((c) => H.seite(c), {
                    gesetz: { fn: EIS_AN, export: "gelaende-core.js:1409 eisDicke ≥ EIS.traegt (gelaende-core.js:1389) über gelaende-core temperaturFeld", leser: "stamm/bild-himmel.js:3263 _eisLinien (der Ruf :3289, die tragende Linie je Säule) → stamm/wasser-hydro.js:749 _eisAt (der Spieler auf dem See)" },
                    adressen: { saaten: Array.from({ length: Number(u2.saaten) || 12 }, (_, i) => i + 1), orte: ORTE, dazu: ORTE.map((o) => ({ saat: "heim", ort: o, zeit: null })).concat([{ saat: "heim", ort: "see", zeit: null }]) },
                    mit: { ref: 15.7, see: u2.see || [1816, -6168] },
                    ms: Number(u2.ms) || 12000,
                    masse: {
                        adressen: { wie: "anzahl", feld: "tage" },
                        tage: { wie: "max", feld: "tage" },
                        saaten: { wie: "verschieden", feld: "a.saat", nur: jz },
                        jahreszeitlich: { wie: "summe", feld: "jz" },
                        ewig: { wie: "summe", feld: "ewig" },
                        fddEinsetzen: { wie: med, feld: "fdd", nur: jz },
                        fddMin: { wie: "min", feld: "fdd", nur: jz },
                        fddMax: { wie: "max", feld: "fdd", nur: jz },
                        fddLuft: { wie: med, feld: "fddLuft", nur: jz },
                        streu: { wie: sd, feld: "fdd", nur: jz },
                        imBand: { wie: "anzahl", feld: "abw", nur: (a, w) => jz(a, w) && w.abw <= 0.2 },
                        traegtTage: { wie: "summe", feld: "traegt", nur: jz },
                        brichtTage: { wie: "summe", feld: "bricht", nur: jz },
                        see: { wie: "anzahl", feld: "fdd", nur: (a, w) => a.ort === "see" && jz(a, w) },
                    },
                    schlecht: { feld: "abw", richtung: "max" },
                    pose: (a, w) => "Ego auf dem See " + (a.ort === "see" ? "der Soll-Tafel (1816/−6168)" : "der Säule " + a.ort[0] + " m, " + a.ort[1] + " m über dem Meer") + " unter der Saat " + a.saat + " am Tag " + w.einsetzen + " des Einsetzens (" + w.fdd + " K·d), Blick aufs Eis",
                    ungemessen: ["das Bild des Spielers, der bei Frost auf dem See geht und bei Tauwetter einbricht (am Gerät)"],
                });
                const W2 = RF.werte;
                aus[2] = {
                    werte: Object.assign({ jahreszeitlich: W2.jahreszeitlich, ewig: W2.ewig, imBand: W2.imBand }, W2.fddEinsetzen != null ? { fddEinsetzen: R(W2.fddEinsetzen), fddMin: W2.fddMin, fddMax: W2.fddMax } : {}),
                    zeuge: { adressen: W2.adressen, tage: W2.tage, saaten: W2.saaten, fddLuft: W2.fddLuft, jahreszeitlich: W2.jahreszeitlich, traegtTage: W2.traegtTage, brichtTage: W2.brichtTage, see: W2.see, streu: R(W2.streu), gerissen: RF.gerissen, akte: RF.akte },
                    taeter: (RF.fehler.length && !RF.gemessen ? "Leser fehlt: " + RF.fehler[0].fehler + " · " : "") + "gelaende-core.js:1409 eisDicke trägt (EIS.traegt 0,05 m, gelaende-core.js:1389) nach " + (W2.fddEinsetzen == null ? "—" : R(W2.fddEinsetzen)) + " K·d (Median über " + W2.jahreszeitlich + " frierende und tauende Säulen, " + W2.fddMin + "–" + W2.fddMax + ", " + W2.imBand + " im Band ±20 %), " + W2.ewig + " Säulen frieren ganzjährig · " + RF.akte,
                };
            }
            // DER SCHNEE: an 10 Posen (Ring 600 m um den Spawn) × 4 Jahreszeiten die tiefste Höhe, an der die Decke trägt (`_schneeTafel`,
            // `_schneeVersatz` der Saison, gelaende-core schneeTrittAm), gegen die Nullgrad-Höhe des Tagesmittels (temperaturAus über
            // `_temperaturFeld`, vier Stunden); der Tritt des Fußes am Gelände der Pose
            const schnee = await H.seite(`
const st = r.state, L = r._gelaende(), G = globalThis.__gelaendeCore, R = (v) => (Number.isFinite(v) ? Math.round(v * 1000) / 1000 : null);
const posen = []; for (let k = 0; k < 10; k++) posen.push([600 * Math.cos(k * 0.6283), 600 * Math.sin(k * 0.6283)]);
const alt = st.seasonPhase, wf = r._weatherFieldFor();
const unten = L.waterLevel - 1000, oben = L.waterLevel + 4000;
const je = [];
try {
for (const ph of [0.125, 0.375, 0.625, 0.875]) {
st.seasonPhase = ph;
const T = r._schneeTafel(), v = r._schneeVersatz();
const mittelT = (y) => { const F = r._temperaturFeld(y, 0); let s = 0; for (let h = 0; h < 4; h++) s += G.temperaturAus(F, ph, (h + 0.5) / 4, wf) / 4; return s; };
let n0 = null; for (let y = unten; y <= oben; y += 5) if (mittelT(y) <= 0) { n0 = y; break; }
const linien = posen.map(([x, z]) => { if (!T) return null; for (let y = unten; y <= oben; y += 5) if (G.schneeTrittAm(L, T, x, y, z, v) > 0) return y; return null; });
const fuss = posen.map(([x, z]) => { const g = r._voxelSurfaceY(x, z); return T && g !== null ? R(G.schneeTrittAm(L, T, x, g, z, v)) : 0; });
je.push({ ph, null0: n0, linien, fuss });
}
} finally { st.seasonPhase = alt; }
return { je, unten, oben };
`);
            // DER SEE DER SOLL-TAFEL (1816/−6168, S2 trägt der Fächer oben): Spiegel und Tiefe; DAS MEER FRIERT: an 40 Punkten der Bucht
            // je Woche (`_eisAt`, die Linien `_eisLinien` der Saison)
            const jahr = await H.seite(MEER + `
const st = r.state, S = [1816, -6168];
await warte(S[0], S[1]);
const spiegel = r._koerperWasser(S[0], S[1], -Infinity), boden = r._voxelSurfaceY(S[0], S[1]);
const alt = st.seasonPhase;
const wochen = [];
const mp = m.gefunden ? m.innen.slice(0, 40) : [];
try {
for (let d = 0; d < 365; d++) {
st.seasonPhase = d / 365;
if (d % 7 === 0 && mp.length) wochen.push(mp.filter(([x, z]) => r._eisAt(x, z) !== null).length / mp.length);
}
} finally { st.seasonPhase = alt; r._eisLinien(); }
return { spiegel: R(spiegel), tiefe: R(spiegel - boden), art: r._wasserArtAt(S[0], S[1]), wochen: wochen.map(R), meerPunkte: mp.length, meerKm2: m.gefunden ? m.flaecheKm2 : null, ufer: m.gefunden ? m.ufer : null };
`);
            // DER GIPFEL DER HEIMAT (±3 km): seine Höhe und ob der Schnee dort den Sommer überdauert (Firn — der Anfang eines Gletschers)
            const gipfel = await H.seite(`
const st = r.state, L = r._gelaende(), G = globalThis.__gelaendeCore, R = (v) => (Number.isFinite(v) ? Math.round(v * 1000) / 1000 : null);
let g = [-Infinity, 0, 0];
for (let x = -3000; x <= 3000; x += 100) for (let z = -3000; z <= 3000; z += 100) { const h = G.hoehe(L, x, z, false); if (h > g[0]) g = [h, x, z]; }
const alt = st.seasonPhase;
let sommer = 0;
try { st.seasonPhase = 0.375; const T = r._schneeTafel(); sommer = T ? G.schneeTrittAm(L, T, g[1], g[0], g[2], r._schneeVersatz()) : 0; } finally { st.seasonPhase = alt; }
return { gipfelM: R(g[0]), ort: [g[1], g[2]], sommerTritt: R(sommer) };
`);
            // DER PLANET-FADEN: der Meeresspiegel der Heimat in der Zeit (das Eis des Kerns bindet Meer), die Äquator-Wärme von 10 Saaten zu −2,9 Ga
            const faden = await H.seite(`
await r._fadenQuelle();
const RAD = 180 / Math.PI, R = (v) => (Number.isFinite(v) ? Math.round(v * 1000) / 1000 : null);
const samen = r.state.worldMeta && r.state.worldMeta.seed || "anazh-realm-seed";
const a = await r._planetAuftrag({ type: "planet-anker", samen });
const zeiten = [0, -100, -300, -600];
const meer = await Promise.all(zeiten.map((zeitMa) => r._planetAuftrag({ type: "planet-ort", samen, breite: a.breite * RAD, laenge: a.laenge * RAD, zeitMa }).then((o) => [zeitMa, R(o.delta.meer.waterLevelM)]).catch(() => [zeitMa, null])));
const saaten = []; for (let i = 0; i < 10; i++) saaten.push("schneeball-" + i);
const kalt = await Promise.all(saaten.map((s) => Promise.all([0, -2900].map((zeitMa) => r._planetAuftrag({ type: "planet-ort", samen: s, breite: 0, laenge: 0, zeitMa }).then((o) => o.delta.klima.sommer).catch(() => null))).then(([j, f]) => (Number.isFinite(j) && Number.isFinite(f) ? R(f - j) : null))));
return { meer, kalt, felder: Object.keys(a) };
`);
            const je = {};
            // S1
            const kombi = [];
            for (const s of schnee.je) s.linien.forEach((l) => { if (l !== null && s.null0 !== null) kombi.push(Math.abs(l - s.null0)); });
            const mittelLinie = schnee.je.map((s) => { const v = s.linien.filter((x) => x !== null); return v.length ? v.reduce((a, b) => a + b, 0) / v.length : NaN; }).filter(Number.isFinite);
            const winter = schnee.je.find((s) => s.ph === 0.875), sommer = schnee.je.find((s) => s.ph === 0.375);
            const fussW = winter ? Math.max(...winter.fuss) : 0, fussS = sommer ? Math.max(...sommer.fuss) : 0;
            const jz = schnee.je.filter((s) => s.null0 !== null && s.linien.some((l) => l !== null)).length;
            je[1] = {
                werte: Object.assign({ fussCm: R(100 * fussW), posen: Math.min(...schnee.je.map((s) => s.linien.filter((l) => l !== null).length)), jahreszeiten: jz }, kombi.length ? { abwM: R(Math.max(...kombi)) } : {}),
                zeuge: { messungen: kombi.length, spanneM: R(mittelLinie.length ? Math.max(...mittelLinie) - Math.min(...mittelLinie) : 0), gegenlauf: fussW >= 0.05 && fussS < 0.005 ? 1 : 0, je: schnee.je.map((s) => [s.ph, s.null0, Math.min(...s.linien.filter((l) => l !== null)), Math.max(...s.linien.filter((l) => l !== null))]) },
            };
            if (aus[2]) je[2] = aus[2];
            // S3 Meereis: Anteil der Bucht, den das Eis trägt, je Woche
            const wo = jahr.wochen;
            const wMax = wo.length ? Math.max(...wo) : NaN, wMin = wo.length ? Math.min(...wo) : NaN;
            je[3] = {
                werte: Object.assign({ eisAnteilWinter: R(wMax), eisAnteilSommer: R(wMin), meerKm2: jahr.meerKm2 }, wMin > 0 ? { winterJeSommer: R(wMax / wMin) } : {}),
                zeuge: { wochen: wo.length, meerPunkte: jahr.meerPunkte },
                auge: await M.auge("wasser-eis-s3", jahr.ufer ? { px: jahr.ufer[0], py: jahr.ufer[1], pz: jahr.ufer[2], lx: jahr.ufer[3], ly: jahr.ufer[4], lz: jahr.ufer[5] } : { ort: "wiese" }, { saison: "winter" }),
                nicht: "Meereis 10⁶ km² nicht erzeugbar: das Meer der Welt ist eine Bucht von " + jahr.meerKm2 + " km² (Eis im Winter " + R(100 * wMax) + " %, im Sommer " + R(100 * wMin) + " % ihrer Punkte); keine Scholle, keine Rinne",
            };
            je[4] = {
                werte: { gipfelM: gipfel.gipfelM, firnSommerM: gipfel.sommerTritt },
                zeuge: { gletscher: 0 },
                nicht: "kein Gletscher: kein Leser lässt Eis fließen (gelaende-core.js:1409 eisDicke ist stehendes See-Eis, die Schnee-Decke trägt nur Tritt); der Gipfel der Heimat " + gipfel.gipfelM + " m trägt im Sommer " + gipfel.sommerTritt + " m Schnee",
            };
            je[5] = {
                werte: {},
                zeuge: { kalbungen: 0 },
                nicht: "kein Schelfeis, kein Eisberg: kein Leser kalbt oder treibt Eis (stamm/wasser-hydro.js _eisAt trägt nur stehendes Eis)",
            };
            const ms = faden.meer.map((x) => x[1]).filter(Number.isFinite);
            je[6] = {
                werte: { meerSpanneM: R(ms.length ? Math.max(...ms) - Math.min(...ms) : NaN) },
                zeuge: { eisVolumen: 0, zeiten: ms.length },
                nicht: "kein Eisschild in der Welt: das Eis bindet Meer nur als Zahl im Planet-Kern (planet-core.js:1611 eisKm), der Faden nennt kein Eis-Volumen (voxel-worker.js:1201, Felder " + faden.felder.join(", ") + ")",
            };
            const kalt = faden.kalt.filter(Number.isFinite);
            je[7] = {
                werte: { saatenGefragt: kalt.length, aequatorDeltaK: R(kalt.length ? kalt.reduce((a, b) => a + b, 0) / kalt.length : NaN) },
                zeuge: { saaten: kalt.length },
                auge: await M.auge("wasser-eis-s7", { ort: "wiese" }, { saison: "winter" }),
                nicht: "keine Albedo-Kippe im Bild: die Eis-Linie der Energiebilanz (planet-core.js:1919 eisBreite) reist nicht aus dem Faden, kein Eismond (planet-core.js:312)",
            };
            for (const nr of ziel) aus[nr] = je[nr] || M.nicht("ungemessen");
            return { sprossen: aus };
        },
        sprossen: {
            1: {
                u: { posen: 10, jahreszeiten: [0.125, 0.375, 0.625, 0.875] },
                soll: [
                    K.soll(EI, 1, "Schneegrenze gegen Nullgrad-Höhe ±150 m", { key: "abwM", ref: 0, refQuelle: "Erde: die Schneegrenze folgt der Nullgrad-Höhe (Ohmura, Kasser & Funk 1992), Abweichung 0", einheit: "m" }),
                    K.soll(EI, 1, "10 Posen", { key: "posen", rel: "≥" }),
                    K.soll(EI, 1, "4 Jahreszeiten", { key: "jahreszeiten", rel: "≥" }),
                    K.soll(EI, 1, "Fuß sinkt ≥ 5 cm", { key: "fussCm", einheit: "cm" }),
                ],
                zeuge: zMin({ messungen: 40, spanneM: 10, gegenlauf: 1 }),
                zeugeText: "40 Linien der Welt, die Grenze wandert mit der Saison, der Fuß sinkt im Winter und nie im Sommer",
                taeter: "gelaende-core.js schneeTrittAm / schneeVersatz (die Decke der Saison)",
                gruen: gut({ abwM: 75, posen: 10, jahreszeiten: 4, fussCm: 21 }, { messungen: 40, spanneM: 140, gegenlauf: 1 }),
                attrappen: [
                    { name: "die Schneegrenze AN der Nullgrad-Höhe eingetragen (eine Linie, keine Saison)", roh: gut({ abwM: 0, posen: 10, jahreszeiten: 4, fussCm: 21 }, { messungen: 40, spanneM: 0, gegenlauf: 1 }) },
                    { name: "der Fuß sinkt auch im Sommer (eine Konstante)", roh: gut({ abwM: 60, posen: 10, jahreszeiten: 4, fussCm: 21 }, { messungen: 40, spanneM: 140, gegenlauf: 0 }) },
                ],
            },
            2: {
                u: { saaten: 12, see: [1816, -6168], ms: 12000 },
                soll: [K.soll(EI, 2, "Einsetzen gegen Frostgrad-Summe ±20 %", { key: "fddEinsetzen", ref: 15.7, refQuelle: "Erde: Gold 1971 (80 kg, P = A·h², A = 3,5 kg/cm²) trägt auf 4,8 cm; die Feldregel — ist die erste dünne Decke da, wächst das Eis 1 Zoll je 15 °F·d = 2,54 cm je 8,33 K·d — gibt 4,8 / 2,54 · 8,33 = 15,7 K·d ab der ersten Decke (das Band 12,6 … 18,9). Das einfache Stefan α·√FDD ist nur die obere Schranke für dickes Eis (Ashton 1989, Thin ice growth: der Übergang Eis → Luft lässt dünnes Eis linear wachsen). Bis spiegel-eis stand hier 13,7 = (10/2,7)², gezählt ab dem ersten Frosttag der Luft — die 10 cm ohne Quelle, die Abkühlung der Säule mitgezählt", einheit: "K·d" })],
                zeuge: zMin({ tage: 365, jahreszeitlich: 10, saaten: 3, traegtTage: 1, brichtTage: 1 }),
                zeugeText: "der Fächer: ≥ 10 Säulen aus ≥ 3 Saaten, die frieren und tauen — der See trägt im Frost und bricht im Tauwetter",
                taeter: "gelaende-core.js:1409 eisDicke (EIS.traegt, gelaende-core.js:1389) · stamm/wasser-hydro.js:749 _eisAt",
                leser: "stamm/bild-himmel.js:3263 _eisLinien ruft (:3289) gelaende-core.js:1409 eisDicke je Säule, stamm/wasser-hydro.js:749 _eisAt trägt den Spieler über der Linie voll",
                gruen: gut({ fddEinsetzen: 15.2 }, { tage: 365, jahreszeitlich: 40, saaten: 8, traegtTage: 4000, brichtTage: 6000 }),
                attrappen: [
                    { name: "die Frostgrad-Summe der Feldregel eingesetzt, der See trägt nie", roh: gut({ fddEinsetzen: 15.7 }, { tage: 365, jahreszeitlich: 40, saaten: 8, traegtTage: 0, brichtTage: 365 }) },
                    { name: "EINE Säule der Heimat", roh: gut({ fddEinsetzen: 15.7 }, { tage: 365, jahreszeitlich: 1, saaten: 1, traegtTage: 130, brichtTage: 200 }) },
                    { name: "das einfache Stefan ohne Übergang (α·√FDD, α = 2,7 cm/√(K·d)): der See trägt nach (5/2,7)² = 3,43 K·d", roh: gut({ fddEinsetzen: 3.43 }, { tage: 365, jahreszeitlich: 40, saaten: 8, traegtTage: 4000, brichtTage: 6000 }) },
                    { name: "die ganzjährige Kälte als Einsetzen gezählt (die Säule 10 m · 800 m über dem Meer am Export: 70,6 K·d)", roh: gut({ fddEinsetzen: 70.6 }, { tage: 365, jahreszeitlich: 40, saaten: 8, traegtTage: 4000, brichtTage: 6000 }) },
                ],
            },
            3: {
                u: { wochen: 53, punkte: 40 },
                soll: [K.soll(EI, 3, "Verhältnis Winter/Sommer gegen Arktis ±30 %", { key: "winterJeSommer", ref: 2.5, refQuelle: "Erde: Arktis März 15,6 / September 6,3 Mio km² (NSIDC 1981–2010) = 2,5" })],
                auge: { pose: "Ego am Ufer der Bucht im Winter, Blick über die tiefste Stelle", vorbild: "Foto einer Scholle im Packeis (Blindpaar, Prüfer-Satz R11)" },
                taeter: "gelaende-core.js eisDicke (Meer-Eis der Bucht) — kein Meer von 10⁶ km²",
                nicht: "Meereis 10⁶ km² nicht erzeugbar (eine Bucht)",
                gruen: gut({ winterJeSommer: 2.6 }, {}),
                attrappen: [{ name: "das Verhältnis der Arktis eingetragen", roh: leer({ winterJeSommer: 2.5 }) }],
            },
            4: {
                u: {},
                soll: [
                    K.soll(EI, 4, "Fließgeschwindigkeit 10–200 m/a", { key: "fliessMa", einheit: "m/a" }),
                    K.soll(EI, 4, "Spalten quer zur Zugspannung ±20°", { key: "spaltenAbwGrad", ref: 0, refQuelle: "Erde: Querspalten senkrecht zur größten Zugspannung (Nye 1952), Abweichung 0", einheit: "°" }),
                ],
                zeuge: zMin({ gletscher: 1 }),
                zeugeText: "ein Gletscher floss",
                taeter: "gelaende-core.js (kein Gletscher)",
                nicht: "kein Gletscher",
                leser: "gelaende-core.js:1409 eisDicke — stehendes Eis; kein Leser von Eis-Fluss, Spalten, Gletschertor",
                gruen: gut({ fliessMa: 60, spaltenAbwGrad: 8 }, { gletscher: 1 }),
                attrappen: [{ name: "60 m/a eingetragen ohne Gletscher", roh: leer({ fliessMa: 60, spaltenAbwGrad: 8 }) }],
            },
            5: {
                u: {},
                soll: [K.soll(EI, 5, "Eisberg treibt ≥ 100 km", { key: "treibKm", einheit: "km" }), K.soll(EI, 5, "1 Spieljahr", { key: "spieljahre", rel: "≥" })],
                zeuge: zMin({ kalbungen: 1 }),
                zeugeText: "ein Eisberg kalbte und trieb",
                taeter: "stamm/wasser-hydro.js _eisAt (kein Eisberg)",
                nicht: "kein Schelfeis, kein Eisberg",
                leser: "stamm/wasser-hydro.js:703 _eisAt — stehendes Eis; kein Leser kalbt oder treibt",
                gruen: gut({ treibKm: 140, spieljahre: 1 }, { kalbungen: 1 }),
                attrappen: [{ name: "140 km ohne Eisberg", roh: leer({ treibKm: 140, spieljahre: 1 }) }],
            },
            6: {
                u: { zeitenMa: [0, -100, -300, -600] },
                soll: [K.soll(EI, 6, "ΔV_Eis / A_Ozean = Δh ±5 %", { key: "eisJeSpiegel", ref: 1, refQuelle: "Erde: Meeresspiegel-Äquivalent des Eises = V·ρ_Eis/ρ_Wasser / A_Ozean (Letztes Glaziales Maximum −120 m)" })],
                zeuge: zMin({ eisVolumen: 2 }),
                zeugeText: "das Eis-Volumen zu zwei Zeiten in der Welt gemessen",
                taeter: "voxel-worker.js planetOrtAuftrag (kein Eis-Volumen im Faden)",
                nicht: "kein Eisschild in der Welt",
                leser: "voxel-worker.js:1201 planetOrtAuftrag — nennt den Meeresspiegel der Zeit, nie das Eis (planet-core.js:1611 eisKm)",
                gruen: gut({ eisJeSpiegel: 1.02 }, { eisVolumen: 2 }),
                attrappen: [{ name: "die Bilanz aus dem Kern-Text, kein Eis in der Welt", roh: gut({ eisJeSpiegel: 1 }, { eisVolumen: 0, zeiten: 4 }) }],
            },
            7: {
                u: { saaten: 10, zeitMa: -2900 },
                soll: [K.soll(EI, 7, "10 Saaten", { key: "saaten", rel: "≥" })],
                auge: { pose: "die Wiese im Winter (kein Schneeball-Planet, kein Eismond in der Welt)", vorbild: "Sondenfoto eines Eismonds (Europa, Galileo) im Blindpaar, Prüfer-Satz R11" },
                taeter: "planet-core.js planetKlimaGlobal (die Eis-Linie reist nicht aus dem Faden)",
                nicht: "keine Albedo-Kippe in der Welt, kein Eismond",
                leser: "planet-core.js:1919 eisBreite — die Eis-Linie der Energiebilanz reist nicht aus dem Faden (voxel-worker.js:1201)",
                gruen: gut({ saaten: 10 }, {}),
                attrappen: [{ name: "10 Saaten ohne Lauf", roh: leer({ saaten: 10 }) }],
            },
        },
    };

    // ════════════════════════════════════════ KREISLAUF ════════════════════════════════════════
    const KR = "planet.wasser.kreislauf";
    const kreislauf = {
        sek: 45,
        faecher: true,
        pfad: PFAD,
        mutiert: true,
        ungefahren: "das Bild der braunen Wiese (Sprosse 3) schießt die Probe nur am Gerät",
        mess: async function (H, U, M) {
            const R = (v) => (Number.isFinite(v) ? Math.round(v * 1000) / 1000 : null);
            const ziel = Object.keys(U);
            const aus = M.teil || {};
            // S2 DIE GRUBE AM FÄCHER (M4): je Adresse (Saat × Richtung × Abstand vom Ufer 8–160 m) eine Grube neben dem größten See der
            // Lage, ihr Boden 1 m unter seinem Spiegel — wie hoch füllt das Gesetz sie (gelaende-core atlasSpiegel über dem Boden der
            // Grube, der Spiegel, den die Zellen des Wassers lesen)? Die Heimat am See der Soll-Tafel über den Leser des Spiels
            // (`_atlasWaterLevelAt`), jede andere Saat an ihrer Lage (planet-ort → lageAus) mit der Hydrosphäre, die der Faden rechnet
            // (gelaende-core hydrosphaere mit dem Gesetz des Stamms `HYDROSPHERE`, der Boden die Makro-Höhe)
            const u2 = U[2];
            if (u2) {
                const GRUBE_AN = async (r, T, a, mit) => {
                    const G = globalThis.__gelaendeCore, st = r.state, k = String(a.saat);
                    const memo = mit.memo || (mit.memo = {});
                    let M0 = memo[k];
                    if (!M0) {
                        if (a.saat === "heim") {
                            const S = mit.see;
                            let nw = 0;
                            while (r._ensureHydroTilesAround(S[0], S[1], 32) && nw < 200) { await new Promise((f) => setTimeout(f, 50)); nw++; }
                            const sp = r._koerperWasser(S[0], S[1], -Infinity);
                            const nass = (x, z) => r._nassAt(x, z);
                            M0 = { heim: true, c: S, sp, ufer: [0, 1, 2, 3].map((q) => { const ux = Math.cos((q * Math.PI) / 2 + 0.3), uz = Math.sin((q * Math.PI) / 2 + 0.3); let e = 0; while (e < 400 && nass(S[0] + ux * e, S[1] + uz * e)) e += 4; return e; }) };
                        } else {
                            await r._fadenQuelle();
                            const breite = ((a.saat * 0.6180339887) % 1) * 120 - 60, laenge = ((a.saat * 137.508) % 360) - 180;
                            const o = await r._planetAuftrag({ type: "planet-ort", samen: r._planetSamen(), breite, laenge, zeitMa: 0 });
                            const heim = r.constructor._weltGesetz(st.worldMeta).gelaende;
                            const ort = { samen: o.samen, version: o.version, breite: o.breite, laenge: o.laenge, zeitMa: o.zeitMa, delta: o.delta };
                            const O = G.ortGesetz(ort), eg = G.erbgutNormal(G.ortErbgut(G.erbgutNormal(heim == null ? undefined : heim), o.delta.wildnis));
                            const wl = G.GRUND.basis - O.meerUnterBasisM;
                            const L = G.lageAus({ seed: r._reiseSaat(ort, heim), baseHeight: G.GRUND.basis, waterLevel: wl, ort, erbgut: { terme: eg, wildnis: eg[0] && eg[0].art === "wildnis" ? 1 : 0 }, regionSize: G.GRUND.kachel }, SimplexNoise);
                            const HY = r.constructor.HYDROSPHERE;
                            L.hydroGesetz = HY;
                            const h = (L.hydrosphere = G.hydrosphaere(L, HY, (x, z) => G.hoehe(L, x, z, false), null));
                            let best = null;
                            for (const lk of h.lakes || []) if (lk.cells && lk.cells.length >= HY.minLakeCells && (!best || lk.cells.length > best.cells.length)) best = lk;
                            if (!best) M0 = { kein: 1 };
                            else {
                                let sx = 0, sz = 0;
                                for (const i of best.cells) { sx += h.originX + ((i % h.dim) + 0.5) * h.cell; sz += h.originZ + (Math.floor(i / h.dim) + 0.5) * h.cell; }
                                const c = [sx / best.cells.length, sz / best.cells.length], sp = G.atlasSpiegel(L, c[0], c[1], -1e9);
                                const nass = (x, z) => G.atlasSpiegel(L, x, z, -1e9) >= sp - 0.01 && G.hoehe(L, x, z, false) < sp;
                                M0 = { L, c, sp, ufer: [0, 1, 2, 3].map((q) => { const ux = Math.cos((q * Math.PI) / 2 + 0.3), uz = Math.sin((q * Math.PI) / 2 + 0.3); let e = 0; while (e < 2000 && nass(c[0] + ux * e, c[1] + uz * e)) e += 4; return e; }) };
                            }
                        }
                        memo[k] = M0;
                    }
                    if (M0.kein || !Number.isFinite(M0.sp)) return { saat: k, kein: 1 };
                    const q = a.ort[0], d = a.ort[1], ux = Math.cos((q * Math.PI) / 2 + 0.3), uz = Math.sin((q * Math.PI) / 2 + 0.3);
                    const x = M0.c[0] + ux * (M0.ufer[q] + d), z = M0.c[1] + uz * (M0.ufer[q] + d);
                    const g = M0.heim ? r._voxelSurfaceY(x, z) : G.hoehe(M0.L, x, z, false);
                    if (g === null || !(g > M0.sp)) return { saat: k, unter: 1 };
                    const boden = M0.sp - 1, f = M0.heim ? r._atlasWaterLevelAt(x, z, boden) : G.atlasSpiegel(M0.L, x, z, boden);
                    const voll = Number.isFinite(f) && f > boden ? f : boden;
                    return { saat: k, d, abw: Math.round(Math.abs(M0.sp - voll) * 1000) / 1000, gefuellt: Number.isFinite(f) && f > boden + 0.01 ? 1 : 0, bis: Math.abs(M0.sp - voll) <= 0.1 ? 1 : 0, fern: d >= mit.rand ? 1 : 0, spiegel: Math.round(M0.sp * 1000) / 1000 };
                };
                const ORTE = [];
                for (const q of [0, 1, 2, 3]) for (const d of [8, 24, 40, 80, 160]) ORTE.push([q, d]);
                const grube = (a, w) => w.abw != null;
                const RF = await FAECHER((c) => H.seite(c), {
                    gesetz: { fn: GRUBE_AN, export: "gelaende-core.js:7799 atlasSpiegel (Körper, Rand 3×3 der Zellen, Stau, Fluss) über der Hydrosphäre gelaende-core.js:6107 hydrosphaere", leser: "stamm/wasser-hydro.js:67 _atlasWaterLevelAt (der Spiegel, den die Zellen des Wassers lesen)" },
                    adressen: { saaten: Array.from({ length: Number(u2.saaten) || 8 }, (_, i) => i + 1), orte: ORTE, dazu: ORTE.map((o) => ({ saat: "heim", ort: o, zeit: null })) },
                    mit: { see: u2.see || [1816, -6168], rand: 80 },
                    ms: Number(u2.ms) || 15000,
                    masse: {
                        gruben: { wie: "anzahl", feld: "abw" },
                        seen: { wie: "verschieden", feld: "a.saat", nur: grube },
                        gefuellt: { wie: "summe", feld: "gefuellt", nur: grube },
                        fernGruben: { wie: "summe", feld: "fern", nur: grube },
                        fernGefuellt: { wie: "summe", feld: "gefuellt", nur: (a, w) => grube(a, w) && w.fern === 1 },
                        fernBis: { wie: "summe", feld: "bis", nur: (a, w) => grube(a, w) && w.fern === 1 },
                        grubeAbwM: { wie: "max", feld: "abw", nur: grube },
                        imBand: { wie: "anzahl", feld: "abw", nur: (a, w) => grube(a, w) && w.abw <= 0.1 },
                        randMaxM: { wie: "max", feld: "d", nur: (a, w) => grube(a, w) && w.gefuellt === 1 },
                    },
                    schlecht: { feld: "abw", richtung: "max" },
                    pose: (a, w) => "Ego am Rand einer Grube " + w.d + " m vom Ufer des Sees " + (a.saat === "heim" ? "der Soll-Tafel" : "der Saat " + a.saat) + " (Boden 1 m unter dem Spiegel " + w.spiegel + " m), Blick hinein",
                    ungemessen: ["das Bild der vollgelaufenen Grube an der Bohrung (am Gerät)"],
                });
                const W2 = RF.werte;
                aus[2] = {
                    werte: Object.assign({ gruben: W2.gruben, gefuellt: W2.gefuellt, fernBis: W2.fernBis, imBand: W2.imBand }, W2.grubeAbwM != null ? { grubeAbwM: R(W2.grubeAbwM) } : {}),
                    zeuge: { gruben: W2.gruben, seen: W2.seen, gefuellt: W2.gefuellt, fernGruben: W2.fernGruben, fernGefuellt: W2.fernGefuellt, fernBis: W2.fernBis, randMaxM: W2.randMaxM, gerissen: RF.gerissen, akte: RF.akte },
                    taeter: (RF.fehler.length && !RF.gemessen ? "Leser fehlt: " + RF.fehler[0].fehler + " · " : "") + "gelaende-core.js:7799 atlasSpiegel füllt eine Grube nur am Rand 3×3 der Zellen eines Körpers, aus einem Fluss oder Stau (" + W2.fernBis + " von " + W2.fernGruben + " Gruben ab 80 m bis zum Spiegel des Sees ±0,1 m, " + W2.fernGefuellt + " überhaupt benetzt) — kein Grundwasser-Spiegel, also keine Quelle am Spiegel-Austritt (die Quelle eines Laufs ist ein Knoten ohne Oberlieger, gelaende-core.js:1953 flussLaeufe) · " + RF.akte,
                };
            }
            // DIE DÜRRE AM BACH DER MESS-WIESE (derselbe Bach wie kreislauf S1): 60 Spieltage ohne Regen-Stempel auf der Welt-Uhr, der Pegel
            // nachgezogen (`_pegelTakt`) — die Tiefe des Bachs vor und nach, die Welt-Uhr und die Stempel danach zurück
            const duerre = await H.seite(`
const st = r.state, R = (v) => (Number.isFinite(v) ? Math.round(v * 1000) / 1000 : null);
const P = [-258.4, -1132.8];
let nw = 0; while (r._ensureHydroTilesAround(P[0], P[1], 32) && nw < 200) { await new Promise((f) => setTimeout(f, 50)); nw++; }
const tagS = r.constructor.DAY_LENGTH_DEFAULT_MINUTES * 60;
const alt = [st.spielZeit, st.regenStempel && st.regenStempel.slice()];
const lies = () => { const f = r._hydroRiverAt(P[0], P[1]); return f ? [R(f.surfaceY), R(f.depth), R(f.breite)] : null; };
let vor, nach, mitRegen;
try {
r._pegelTakt();
vor = lies();
st.regenStempel = [];
st.spielZeit = alt[0] + 60 * tagS;
r._pegelTakt();
nach = lies();
st.spielZeit = alt[0]; st.regenStempel = alt[1] && alt[1].slice();
r._pegelTakt();
mitRegen = lies();
} finally {
st.spielZeit = alt[0]; st.regenStempel = alt[1]; r._pegelTakt();
}
return { vor, nach, mitRegen, tagS };
`);
            // DER REGEN UND DAS MEER IM PLANET-FADEN: 48 Lagen um den Anker der Heimat (±10° Breite, ±15° Länge), je Land-Lage der
            // Abstand zur Küste (`kuesteKm`) und der Regen (`delta.wetter.regenQuote`, monoton im Niederschlag)
            const faden = await H.seite(`
await r._fadenQuelle();
const RAD = 180 / Math.PI;
const samen = r.state.worldMeta && r.state.worldMeta.seed || "anazh-realm-seed";
const a = await r._planetAuftrag({ type: "planet-anker", samen });
const L0 = [a.breite * RAD, a.laenge * RAD], P = [];
for (let i = 0; i < 8; i++) for (let j = 0; j < 6; j++) P.push([L0[0] - 10 + (20 * j) / 5, L0[1] - 15 + (30 * i) / 7]);
const o = await Promise.all(P.map((p) => r._planetAuftrag({ type: "planet-ort", samen, breite: p[0], laenge: p[1], zeitMa: 0 })));
return o.map((x) => [x.land, x.kuesteKm, x.delta.wetter.regenQuote, x.version]);
`);
            const je = {};
            if (aus[2]) je[2] = aus[2];
            // S3
            const d0 = duerre.vor && duerre.vor[1], d1 = duerre.nach && duerre.nach[1];
            const verloren = d0 > 0 && Number.isFinite(d1) ? 100 * (1 - d1 / d0) : NaN;
            je[3] = {
                werte: Object.assign({ tageOhneRegen: 60, bachTiefeVorM: R(d0), bachTiefeNachM: R(d1), bachHubM: duerre.vor && duerre.nach ? R(duerre.nach[0] - duerre.vor[0]) : null }, Number.isFinite(verloren) ? { querschnittVerlorenProzent: R(verloren) } : {}),
                zeuge: { vor: duerre.vor, nach: duerre.nach, mitRegen: duerre.mitRegen },
                auge: await M.auge("wasser-kreislauf-s3", { ort: "wiese" }),
                nicht: "die Wiese bräunt nicht: kein Leser trägt 60 Tage Dürre in ihre Farbe (foundry-core.js:3085 wiesenTint liest die Feuchte des Orts, kein Gedächtnis der Bodenfeuchte)",
            };
            // S4: Spearman-Rang (Abstand zur Küste ↔ Regen) über die Land-Lagen
            const land = faden.filter((x) => x[0] && Number.isFinite(x[1]) && Number.isFinite(x[2]));
            const rang = (v) => { const o = v.map((x, i) => [x, i]).sort((p, q) => p[0] - q[0]); const r2 = new Array(v.length); for (let i = 0; i < o.length; ) { let j = i; while (j + 1 < o.length && o[j + 1][0] === o[i][0]) j++; for (let k = i; k <= j; k++) r2[o[k][1]] = (i + j) / 2; i = j + 1; } return r2; };
            const pear = (x, y) => { const mx = x.reduce((s, v) => s + v, 0) / x.length, my = y.reduce((s, v) => s + v, 0) / y.length; let a = 0, b = 0, c = 0; for (let i = 0; i < x.length; i++) { a += (x[i] - mx) * (y[i] - my); b += (x[i] - mx) ** 2; c += (y[i] - my) ** 2; } return b > 0 && c > 0 ? a / Math.sqrt(b * c) : NaN; };
            const km = land.map((x) => x[1]), rq = land.map((x) => x[2]);
            const rho = land.length >= 3 ? pear(rang(km), rang(rq)) : NaN;
            const sd = (v) => { const m = v.reduce((s, x) => s + x, 0) / Math.max(1, v.length); return Math.sqrt(v.reduce((s, x) => s + (x - m) ** 2, 0) / Math.max(1, v.length)); };
            je[4] = {
                werte: Object.assign({ landLagen: land.length }, Number.isFinite(rho) ? { rang: R(-rho) } : {}),
                zeuge: { antworten: faden.length, land: land.length, streuungKm: R(sd(km)), streuungRegen: R(sd(rq)), fassung: faden.some((x) => x[3]) ? 1 : 0 },
                nicht: "kein markiertes Meerwasser: der Regen der Welt ist ein Stempel des Wetters (stamm/wasser-hydro.js:127 _regenStempel), kein Leser trägt Wasser vom Meer in den Regen des Binnenlands",
            };
            je[5] = {
                werte: {},
                zeuge: { markiert: 0 },
                nicht: "keine Verweilzeit je Speicher: kein Leser markiert Wasser in Atmosphäre und Ozean (stamm/wasser-hydro.js:127 _regenStempel, der Pegel faltet nur den Regen des Orts)",
            };
            je[6] = {
                werte: {},
                zeuge: { welten: 0 },
                nicht: "kein fremder Kreislauf: die Welt kennt die Stoff-Zeile Wasser allein (kein Methan-Kreislauf, keine Phasen nach fremdem Druck)",
            };
            for (const nr of ziel) aus[nr] = je[nr] || M.nicht("ungemessen");
            return { sprossen: aus };
        },
        sprossen: {
            2: {
                u: { saaten: 8, see: [1816, -6168], ms: 15000 },
                soll: [
                    K.soll(KR, 2, "Grube unter dem Spiegel füllt sich bis zu ihm ±0,1 m", { key: "grubeAbwM", ref: 0, refQuelle: "Erde: eine Grube unter dem Grundwasser-Spiegel füllt sich bis zu ihm (Darcy 1856), Abweichung 0", einheit: "m" }),
                    K.soll(KR, 2, "Quellen ≥ 90 % an Spiegel-Austritten", { key: "quellenProzent", einheit: "%" }),
                ],
                zeuge: zMin({ gruben: 40, seen: 3, fernBis: 1 }),
                zeugeText: "der Fächer: ≥ 40 Gruben an ≥ 3 Seen, und das Grundwasser füllt mindestens eine jenseits des Rands (≥ 80 m vom Ufer) bis zum Spiegel des Sees",
                taeter: "gelaende-core.js:7799 atlasSpiegel (kein Grundwasser jenseits des Rands 3×3)",
                nicht: "kein Grundwasser-Spiegel, keine Entnahme",
                leser: "stamm/wasser-hydro.js:67 _atlasWaterLevelAt über gelaende-core.js:7799 atlasSpiegel — füllt nur den Rand 3×3 eines Körpers; kein Aquifer als Volumen, kein Brunnen",
                gruen: gut({ grubeAbwM: 0.06, quellenProzent: 92 }, { gruben: 60, seen: 4, fernBis: 22 }),
                attrappen: [
                    { name: "die Gruben am Rand des Sees (die füllt der See, nicht das Grundwasser)", roh: gut({ grubeAbwM: 0, quellenProzent: 92 }, { gruben: 24, seen: 3, fernBis: 0 }) },
                    { name: "EIN See der Heimat", roh: gut({ grubeAbwM: 0.06, quellenProzent: 92 }, { gruben: 20, seen: 1, fernBis: 10 }) },
                    { name: "die trockene Grube (der Fächer am Export: ab 80 m 0 von 22 gefüllt, Abweichung 1 m)", roh: gut({ grubeAbwM: 1 }, { gruben: 58, seen: 3, fernBis: 0 }) },
                    { name: "die Grube am Fluss (benetzt vom Lauf, nicht vom Grundwasser des Sees)", roh: gut({ grubeAbwM: 0.06, quellenProzent: 92 }, { gruben: 60, seen: 4, fernGefuellt: 11, fernBis: 0 }) },
                ],
            },
            3: {
                u: { bach: [-258.4, -1132.8], tage: 60 },
                soll: [K.soll(KR, 3, "Fluss ≥ 50 % Querschnitt verloren", { key: "querschnittVerlorenProzent", einheit: "%" }), K.soll(KR, 3, "nach 60 Tagen ohne Regen", { key: "tageOhneRegen", rel: "≥", einheit: "d" })],
                auge: { pose: "die Mess-Wiese (Werkbank /bild am Ort wiese), nach 60 Tagen ohne Regen", vorbild: "Dürrefoto einer Frischwiese im Hochsommer (Blindpaar, Prüfer-Satz R11)" },
                taeter: "stamm/wasser-hydro.js _pegelTafel (Dürre) · foundry-core.js wiesenTint (keine Dürre in der Farbe)",
                nicht: "die Wiese bräunt nicht",
                leser: "foundry-core.js:3085 wiesenTint — die Farbe der Wiese liest kein Gedächtnis der Bodenfeuchte",
                gruen: gut({ querschnittVerlorenProzent: 58, tageOhneRegen: 60 }, {}),
                attrappen: [{ name: "58 % ohne Lauf der Uhr", roh: leer({ querschnittVerlorenProzent: 58, tageOhneRegen: 60 }) }],
            },
            4: {
                u: { lagen: 48 },
                soll: [K.soll(KR, 4, "Rang ≥ 0,7", { key: "rang" })],
                zeuge: zMin({ antworten: 30, land: 10, streuungKm: 1, streuungRegen: 1e-6, fassung: 1 }),
                zeugeText: "N Antworten des Planet-Fadens, Abstand und Regen streuen",
                taeter: "planet-core.js planetKlima (Feuchte über dem Land) · stamm/wasser-hydro.js _regenStempel (kein markiertes Wasser)",
                nicht: "kein markiertes Meerwasser",
                leser: "stamm/wasser-hydro.js:127 _regenStempel — der Regen ist ein Wort des Wetters, kein Wasser aus dem Meer",
                gruen: gut({ rang: 0.74 }, { antworten: 48, land: 30, streuungKm: 180, streuungRegen: 0.08, fassung: 1 }),
                attrappen: [{ name: "der Rang als Zahl ohne Antwort des Fadens", roh: leer({ rang: 0.74 }) }],
            },
            5: {
                u: {},
                soll: [K.soll(KR, 5, "markierte Wassermenge folgt der Verweilzeit (Atmosphäre ~9 d, Ozean ~10³ a) ±30 %", { key: "verweilJeErde", ref: 1, refQuelle: "Erde: Verweilzeit Atmosphäre ~9 d, Ozean ~3 000 a (Trenberth 2007; Oki & Kanae 2006)" })],
                zeuge: zMin({ markiert: 1 }),
                zeugeText: "markiertes Wasser in der Welt verfolgt",
                taeter: "stamm/wasser-hydro.js _regenStempel (kein Speicher des Planeten)",
                nicht: "keine Verweilzeit je Speicher",
                leser: "stamm/wasser-hydro.js:127 _regenStempel — kein markiertes Wasser, keine Speicher Atmosphäre/Ozean",
                gruen: gut({ verweilJeErde: 1.1 }, { markiert: 1 }),
                attrappen: [{ name: "9 d als Zahl ohne Wasser", roh: leer({ verweilJeErde: 1 }) }],
            },
            6: {
                u: {},
                soll: [K.soll(KR, 6, "je Welt Bilanz geschlossen ±1 %", { key: "bilanzAbwProzent", rel: "±", ref: 0, refQuelle: "Erde: geschlossene Wasserbilanz Verdunstung = Niederschlag (Trenberth 2007), Abweichung 0", einheit: "%" })],
                zeuge: zMin({ welten: 1 }),
                zeugeText: "eine fremde Welt mit ihrem Kreislauf",
                taeter: "foundry-core.js / schmiede STOFF_GESETZ (nur Wasser im Kreislauf)",
                nicht: "kein fremder Kreislauf",
                leser: "schmiede-core.js:2860 STOFF_GESETZ — der Kreislauf kennt nur die Stoff-Zeile wasser",
                gruen: gut({ bilanzAbwProzent: 0.4 }, { welten: 1 }),
                attrappen: [{ name: "die Bilanz geschlossen behauptet", roh: leer({ bilanzAbwProzent: 0 }) }],
            },
        },
    };

    // ════════════════════════════════════════ TIEFSEE ════════════════════════════════════════
    const TS = "planet.wasser.tiefsee";
    const tiefsee = {
        sek: 30,
        pfad: PFAD,
        mutiert: true,
        ungefahren: "die Farbe des Lichts unter Wasser (auf swiftshader trägt die Himmels-Irradianz NaN) und die Bilder (Taucherfoto, Meeresboden) misst nur das Gerät",
        mess: async function (H, U, M) {
            const MEER = `
const L = r._gelaende(), G = globalThis.__gelaendeCore;
const R = (v) => (Number.isFinite(v) ? Math.round(v * 1000) / 1000 : null);
const warte = async (x, z) => { let n = 0; while (r._ensureHydroTilesAround(x, z, 32) && n < 200) { await new Promise((f) => setTimeout(f, 50)); n++; } return n; };
const tiefe = (x, z) => { const kw = r._koerperWasser(x, z, -Infinity), g = r._voxelSurfaceY(x, z); return kw > -Infinity && g !== null && Number.isFinite(g) && kw > g ? kw - g : 0; };
let m = window.__pwMeer;
if (!m) {
m = { gefunden: false };
let p = null;
for (let d = 500; d <= 20000 && !p; d += 250) for (let a = 0; a < 32 && !p; a++) { const x = d * Math.cos((a * Math.PI) / 16), z = d * Math.sin((a * Math.PI) / 16); if (G.hoehe(L, x, z, false) < L.waterLevel - 2) p = [x, z]; }
if (p) {
for (const [a, b] of [[0, 0], [-1500, -1500], [1500, -1500], [-1500, 1500], [1500, 1500]]) await warte(p[0] + a, p[1] + b);
const N = 61, T = new Float64Array(N * N);
for (let i = 0; i < N; i++) for (let j = 0; j < N; j++) T[i + N * j] = tiefe(p[0] + 50 * (i - 30), p[1] + 50 * (j - 30));
let best = [0, p[0], p[1]], zellen = 0;
const kueste = [], innen = [];
for (let i = 0; i < N; i++) for (let j = 0; j < N; j++) {
const t = T[i + N * j];
if (!(t > 0)) continue;
const x = p[0] + 50 * (i - 30), z = p[1] + 50 * (j - 30);
zellen++;
if (t > best[0]) best = [t, x, z];
const rand = [[1, 0], [-1, 0], [0, 1], [0, -1]].some(([a, b]) => i + a < 0 || j + b < 0 || i + a >= N || j + b >= N || !(T[i + a + N * (j + b)] > 0));
if (rand) kueste.push([x, z]); else innen.push([x, z, R(t)]);
}
const B = [best[1], best[2]], d0 = Math.hypot(B[0], B[1]), ux = -B[0] / d0, uz = -B[1] / d0;
let s = null;
for (let k = 1; k < 800 && !s; k++) { const x = B[0] + ux * 10 * k, z = B[1] + uz * 10 * k; if (!(tiefe(x, z) > 0) && r._voxelSurfaceY(x, z) > L.waterLevel) s = [x + ux * 6, z + uz * 6]; }
let art = null;
for (const t of (r.state.hydroTiles || new Map()).values()) { const sz = t.dim * t.cell; if (t.water && B[0] >= t.originX && B[1] >= t.originZ && B[0] < t.originX + sz && B[1] < t.originZ + sz) art = t.water.waterKind[Math.floor((B[0] - t.originX) / t.cell) + Math.floor((B[1] - t.originZ) / t.cell) * t.dim]; }
const sy = s ? r._voxelSurfaceY(s[0], s[1]) : null;
const jede = (A, n) => A.filter((q, i) => i % Math.max(1, Math.floor(A.length / n)) === 0).slice(0, n);
m = { gefunden: true, p, B, tiefeMax: R(best[0]), spiegel: R(r._koerperWasser(B[0], B[1], -Infinity)), flaecheKm2: R((zellen * 2500) / 1e6), kuesteN: kueste.length, kuesteKm: R(kueste.length * 0.05), kueste: jede(kueste, 120), innen: jede(innen, 100), art, abstandKm: R(d0 / 1000), ufer: s ? [R(s[0]), R(sy + 1.7), R(s[1]), R(B[0]), R(L.waterLevel), R(B[1])] : null, richtung: [R(ux), R(uz)] };
}
window.__pwMeer = m;
}
`;
            const R = (v) => (Number.isFinite(v) ? Math.round(v * 1000) / 1000 : null);
            const ziel = Object.keys(U);
            const aus = M.teil || {};
            // DAS MEDIUM DER KAMERA UNTER WASSER: die Kamera an der tiefsten Stelle der Bucht 0,1 m · 5 m · (Grund − 0,3 m) unter dem
            // Spiegel, der Tag der Welt angewandt (`_applyDayNightToScene` — derselbe Leser, der jedes Bild färbt): die Farbe des Lichts
            // (`luft.U.farbe`), der Abfall je Kanal, die Sicht (`_luftSichtM`); danach steht die Kamera, wo sie stand
            const w = await H.seite(MEER + `
if (!m.gefunden) return { meer: false };
const st = r.state, cam = st.camera, alt = cam.position.clone();
const [bx, bz] = m.B;
const sp = r._koerperWasser(bx, bz, -Infinity), grund = r._voxelSurfaceY(bx, bz);
const je = [];
try {
for (const t of [0.1, 5, Math.max(0.2, sp - grund - 0.3)]) {
cam.position.set(bx, sp - t, bz);
cam.updateMatrixWorld();
r._applyDayNightToScene();
const U = st.luft && st.luft.U;
je.push({ t: R(t), unter: st.kameraUnterWasser === true, farbe: U ? U.farbe.value.toArray().map(R) : null, abfall: U ? U.abfall.value.toArray().map(R) : null, beta: U ? R(U.beta.value) : null, sichtM: R(r._luftSichtM(sp - t)), art: r._wasserArtAt(bx, bz) });
}
} finally {
cam.position.copy(alt);
cam.updateMatrixWorld();
r._applyDayNightToScene();
}
const loecher = m.innen.filter(([x, z]) => { const g = r._voxelSurfaceY(x, z); return g === null || !Number.isFinite(g); }).length;
return { meer: true, je, tiefeMax: m.tiefeMax, spiegel: R(sp), grund: R(grund), flaecheKm2: m.flaecheKm2, abstandKm: m.abstandKm, innen: m.innen.length, loecher, B: m.B, nachher: st.kameraUnterWasser === true };
`);
            // DER PLANET-FADEN: ein Profil von 101 Lagen über 1° Breite im tiefen Ozean der Heimat-Saat (der Start: entlang der Breite des
            // Ankers die erste Lage unter −2 500 m)
            const faden = await H.seite(`
await r._fadenQuelle();
const RAD = 180 / Math.PI;
const samen = r.state.worldMeta && r.state.worldMeta.seed || "anazh-realm-seed";
const a = await r._planetAuftrag({ type: "planet-anker", samen });
const b0 = a.breite * RAD, l0 = a.laenge * RAD;
let start = null;
for (let k = 1; k <= 90 && !start; k += 6) {
const reihe = await Promise.all([0, 1, 2, 3, 4, 5].map((j) => r._planetAuftrag({ type: "planet-ort", samen, breite: b0, laenge: l0 + (k + j) * 2, zeitMa: 0 })));
const t = reihe.find((o) => !o.land && o.hoeheM < -2500);
if (t) start = [t.breite, t.laenge];
}
if (!start) return { profil: [] };
const P = []; for (let i = 0; i <= 100; i++) P.push([Math.max(-89, Math.min(89, start[0] - 0.5 + i / 100)), start[1]]);
const o = await Promise.all(P.map((p) => r._planetAuftrag({ type: "planet-ort", samen, breite: p[0], laenge: p[1], zeitMa: 0 })));
return { start, profil: o.map((x) => [x.land, x.hoeheM]), version: o[0] && o[0].version };
`);
            const ort = w.meer ? "die Bucht " + w.abstandKm + " km vom Spawn (" + w.flaecheKm2 + " km², bis " + w.tiefeMax + " m)" : "kein Meer bis 20 km";
            const je = {};
            const J = w.je || [];
            const a = J[0], b = J[1], c = J[2];
            const endlich = (x) => x && Array.isArray(x.farbe) && x.farbe.every(Number.isFinite) && x.farbe[0] > 0;
            je[1] = {
                werte: Object.assign(
                    { kdRot: a && a.abfall ? a.abfall[0] : null },
                    b && Number.isFinite(b.sichtM) ? { sichtM: b.sichtM } : {},
                    endlich(a) && endlich(b) ? { rotProzent5m: R((100 * b.farbe[0]) / a.farbe[0]) } : {}
                ),
                zeuge: { unter: J.filter((x) => x.unter).length, farbe: [a, b].filter(endlich).length, je: J },
                ...(!w.meer ? { nicht: "kein Wasser von 5 m Tiefe: " + ort } : {}),
            };
            const auge2 = w.meer ? await M.auge("wasser-tiefsee-s2", { px: w.B[0], py: w.spiegel - 2, pz: w.B[1], lx: w.B[0] + 20, ly: w.spiegel - 4, lz: w.B[1] }) : undefined;
            je[2] = {
                werte: { tiefeMaxM: w.tiefeMax },
                zeuge: {},
                auge: auge2,
                nicht: "keine Sandrippel: kein Leser legt Rippel nach dem Wellen-Orbital in den Boden; das Küstenmeer der Welt reicht bis " + w.tiefeMax + " m (" + ort + ")",
            };
            je[3] = {
                werte: Object.assign({ tiefeMaxM: w.tiefeMax }, endlich(a) && endlich(c) ? { lichtrestGrundProzent: R((100 * c.farbe[1]) / a.farbe[1]) } : {}),
                zeuge: { tiefeM: w.tiefeMax },
                nicht: "kein Schelf bis 200 m: das tiefste Wasser der Welt ist " + w.tiefeMax + " m (" + ort + "); keine Sprungschicht (kein Temperaturprofil des Wassers)",
            };
            const pr = (faden.profil || []).filter((x) => !x[0]).map((x) => x[1]);
            const sd = (v) => { const m = v.reduce((s, x) => s + x, 0) / Math.max(1, v.length); return Math.sqrt(v.reduce((s, x) => s + (x - m) ** 2, 0) / Math.max(1, v.length)); };
            je[4] = {
                werte: Object.assign({ profilLagen: pr.length }, pr.length ? { profilTiefeM: R(-pr.reduce((s, x) => s + x, 0) / pr.length) } : {}),
                zeuge: { antworten: pr.length, streuungM: R(sd(pr)) },
                nicht: "die Tiefsee lebt nur als Zahl im Planet-Faden: die Welt baut kein Meer tiefer als " + w.tiefeMax + " m, der Spieler taucht nie zur Sohle; keine Schlote (der Faden nennt keinen Spreizungsrücken, voxel-worker.js:1202)",
            };
            const auge5 = w.meer ? await M.auge("wasser-tiefsee-s5", { px: w.B[0], py: w.grund + 3, pz: w.B[1], lx: w.B[0] + 6, ly: w.grund, lz: w.B[1] + 2 }) : undefined;
            je[5] = {
                werte: { loecher: w.loecher, bodenPosen: w.innen },
                zeuge: { bodenPosen: w.innen },
                auge: auge5,
                nicht: "jeder Meeresboden nicht erzeugbar: die Welt trägt EINE Bucht (" + ort + "), andere Saaten nur im Planet-Faden",
            };
            je[6] = {
                werte: {},
                zeuge: { welten: 0 },
                nicht: "kein fremder Ozean: das Wasser-Gesetz trägt nur Wasser (foundry-core.js WASSER_GESETZ.koerper see · fluss · bach), kein Eis-Ozean, kein Methan, kein Hochdruck",
            };
            for (const nr of ziel) aus[nr] = je[nr] || M.nicht("ungemessen");
            return { sprossen: aus };
        },
        sprossen: {
            1: {
                u: { tiefen: [0.1, 5] },
                soll: [
                    K.soll(TS, 1, "Rot-Anteil fällt bis 5 m auf ≤ 30 %", { key: "rotProzent5m", rel: "≤", zahl: 30, einheit: "%" }),
                    K.soll(TS, 1, "Sicht gegen Secchi-Referenz ±30 %", { key: "sichtM", ref: 8, refQuelle: "Erde: klarer See, Secchi-Tiefe ~8 m (Kirk 2011; Davies-Colley 1988)", einheit: "m" }),
                ],
                zeuge: zMin({ unter: 2, farbe: 2 }),
                zeugeText: "die Kamera stand in 0,1 und 5 m unter dem Spiegel, das Licht der Welt in beiden",
                taeter: "stamm/bild-himmel.js _dayNightApplyHemiUndLuft (das Medium unter Wasser) · foundry-core.js WASSER_GESETZ.koerper",
                unklar: "die Sicht (waagrecht, −ln(Kontrast)/c) und die Secchi-Tiefe (senkrecht, ~1,7/Kd) sind zwei Größen — der Richter sollte die waagrechte Sicht gegen 4,8/c der Erd-Wasserart nennen",
                gruen: gut({ rotProzent5m: 11, sichtM: 9.2 }, { unter: 3, farbe: 2 }),
                attrappen: [{ name: "Beer-Lambert mit kd aus dem Gesetz gerechnet (keine Kamera unter Wasser)", roh: gut({ rotProzent5m: 10.5, sichtM: 8 }, { unter: 0, farbe: 0 }) }],
            },
            2: {
                u: {},
                soll: [
                    K.soll(TS, 2, "Blindtest 50 Posen gegen Taucherfotos ≥ 60 %", { key: "blindProzent", einheit: "%" }),
                    K.soll(TS, 2, "Rippel-Abstand gegen Wellen-Orbital ±30 %", { key: "rippelJeOrbital", ref: 1, refQuelle: "Erde: Orbital-Rippel λ ≈ 0,65 · Orbital-Durchmesser (Clifton & Dingler 1984)" }),
                    K.soll(TS, 2, "50 Posen", { key: "posen", rel: "≥" }),
                ],
                auge: { pose: "unter dem Spiegel der Bucht, 2 m tief, Blick waagrecht", vorbild: "Taucherfotos im Küstenmeer 0–40 m (Prüfer-Satz R11)" },
                taeter: "gelaende-core.js (kein Rippel im Boden)",
                nicht: "keine Sandrippel",
                leser: "gelaende-core.js:566 grossform — kein Leser formt den Boden nach dem Wellen-Orbital",
                gruen: gut({ blindProzent: 64, rippelJeOrbital: 1.1, posen: 50 }, {}),
                attrappen: [{ name: "der Blindtest ohne Bild", roh: leer({ blindProzent: 64, rippelJeOrbital: 1.1, posen: 50 }) }],
            },
            3: {
                u: { tiefe: 200 },
                soll: [K.soll(TS, 3, "Lichtrest bei 200 m ≤ 1 %", { key: "lichtrest200Prozent", einheit: "%" })],
                zeuge: zMin({ tiefeM: 200 }),
                zeugeText: "die Kamera stand in 200 m Tiefe",
                taeter: "gelaende-core.js (kein Schelf bis 200 m) · foundry-core.js WASSER_GESETZ.koerper (keine Temperatur im Wasser)",
                nicht: "kein Schelf bis 200 m, keine Sprungschicht",
                leser: "gelaende-core.js:405 OFFSET_KNOTEN — die Großform sinkt höchstens 48 m unter die Basis (kein Schelf bis 200 m); kein Temperaturprofil im Wasser",
                gruen: gut({ lichtrest200Prozent: 0.4 }, { tiefeM: 200 }),
                attrappen: [{ name: "der Lichtrest aus kd hochgerechnet (die Kamera nie in 200 m)", roh: gut({ lichtrest200Prozent: 0 }, { tiefeM: 19.9 }) }],
            },
            4: {
                u: { profil: 101 },
                soll: [K.soll(TS, 4, "Tiefen-Hypsometrie eines 100-km-Profils gegen Erde ±20 %", { key: "profilTiefeM", ref: 3682, refQuelle: "Erde: mittlere Ozeantiefe 3 682 m (Charette & Smith 2010)", einheit: "m" })],
                zeuge: zMin({ antworten: 50, streuungM: 1 }),
                zeugeText: "N Antworten des Planet-Fadens im Ozean, die Tiefe streut",
                taeter: "gelaende-core.js (die Welt baut kein tiefes Meer) · voxel-worker.js planetOrtAuftrag (keine Schlote)",
                nicht: "die Tiefsee nur als Zahl im Faden",
                leser: "voxel-worker.js:1202 planetOrtAuftrag — der Rand der Platte (Spreizung) reist nicht aus dem Faden; gelaende-core baut am Ort kein Meer unter ~20 m",
                unklar: "die Hypsometrie als Mittel-Tiefe des Profils gegen das Erd-Mittel 3 682 m gelesen; der Faden nennt den Radius nicht, das Profil ist 1° Breite (100 km nur bei Erd-Radius)",
                gruen: gut({ profilTiefeM: 3900 }, { antworten: 101, streuungM: 240 }),
                attrappen: [{ name: "3 682 m als Zahl ohne Faden", roh: leer({ profilTiefeM: 3682 }) }],
            },
            5: {
                u: { posen: 100 },
                soll: [
                    K.soll(TS, 5, "Blindtest gegen Tiefsee-Fotos ≥ 60 %", { key: "blindProzent", einheit: "%" }),
                    K.soll(TS, 5, "0 Löcher", { key: "loecher", rel: "≤", zahl: 0 }),
                    K.soll(TS, 5, "500 Bodenposen", { key: "bodenPosen", rel: "≥" }),
                    K.soll(TS, 5, "50 Saaten", { key: "saaten", rel: "≥" }),
                ],
                auge: { pose: "3 m über dem Grund der tiefsten Stelle der Bucht, Blick schräg auf den Boden", vorbild: "Tiefsee-Fotos des Meeresbodens (Prüfer-Satz R11), 500 Posen aus 50 Saaten" },
                taeter: "gelaende-core.js (EINE Bucht statt jedes Meeresbodens)",
                nicht: "jeder Meeresboden nicht erzeugbar",
                gruen: gut({ blindProzent: 64, loecher: 0, bodenPosen: 500, saaten: 50 }, {}),
                attrappen: [{ name: "der Blindtest ohne Bild", roh: leer({ blindProzent: 64, loecher: 0, bodenPosen: 500, saaten: 50 }) }],
            },
            6: {
                u: {},
                soll: [K.soll(TS, 6, "Licht, Druck und Phasen gegen deren Stoff ±20 %", { key: "stoffJeSoll", ref: 1, refQuelle: "Erde: Licht, Druck (ρ·g·h) und Phase des Wassers nach seiner Stoff-Zeile; der fremde Ozean nach seinem Stoff" })],
                zeuge: zMin({ welten: 1 }),
                zeugeText: "ein fremder Ozean stand",
                taeter: "foundry-core.js WASSER_GESETZ.koerper (nur Wasser)",
                nicht: "kein fremder Ozean",
                leser: "foundry-core.js:179 WASSER_GESETZ.koerper — die Körper see · fluss · bach, kein Stoff eines fremden Ozeans",
                gruen: gut({ stoffJeSoll: 1.05 }, { welten: 1 }),
                attrappen: [{ name: "±20 % als Zahl ohne Ozean", roh: leer({ stoffJeSoll: 1 }) }],
            },
        },
    };

    return { leitern: { [SEE]: seegang, [GZ]: gezeiten, [SR]: stroemung, [EI]: eis, [KR]: kreislauf, [TS]: tiefsee } };
})());

// ── DIE PERSPEKTIVE planet.wetter (6 Leitern, 38 Sprossen; lagen S1 trägt die Tafel wetter.K1#2, klimazonen S1 die Station SCHNEE_JAHR) ──
// Die Leser des Spiels: das Wetter am Ort (`r._wetterAmOrt`, stamm/bild-himmel.js:2843 → phyto-core `wetterAt`: drei Sinus-Wellen längs
// der Grundrichtung der Saat, der Zug WETTER_ZUG_SEK 120 s), der Wind (`_windDirAt` · `_windAt`, stamm/stoff-material.js:214/233), die
// Luft (`_luftSichtM` · `_luftBeta`), die Wolken-Schicht (`skyboxUniforms.zug`, `_wolkenKarte` — der Wurf, welt-licht.js:864
// WOLKEN_SCHICHT), die Temperatur (gelaende-core `temperaturAus` über `_temperaturFeld`), Schnee und Eis (`schnee`, `_eisLinien`), der
// Pegel (`_pegelGilt`), die Sonne (`_sonnenRichtung`, `_atmoSonne`), die Welten des Ultiversums (`ULTIVERSUM`), und der Planet-Faden
// (`r._planetAuftrag` planet-ort/planet-anker → delta.klima, delta.wetter, gelesen über gelaende-core `ortGesetz` wie die Reise).
// Statistik über Saaten: das Wetter über `_wetterAmOrt` mit der Saat der Welt (worldMeta.seed, in EINER synchronen Auswertung gesetzt
// und zurückgestellt), das Klima über den Faden mit den Samen „wetter-s<k>“ (planetPlan liest nur den Samen). Das Wetter setzt die
// Probe NUR über `window.__wetterSetzen(wort)` und stellt es zurück; Saison, Uhr und Sonnen-Merk setzt sie nur synchron und stellt sie
// in derselben Auswertung zurück.
L.perspektive("wetter", (() => {
    const PFAD = [
        "stamm/bild-himmel.js",
        "stamm/stoff-material.js",
        "stamm/dirigent-takt.js",
        "stamm/wasser-hydro.js",
        "stamm/daten.js",
        "stamm/gelaende-chunks.js",
        "phyto-core.js",
        "gelaende-core.js",
        "planet-core.js",
        "voxel-worker.js",
        "welt-licht.js",
        "foundry-core.js",
        "scripts/werkbank.cjs",
        "scripts/lib/ausgabe-aufnahme.cjs",
    ];
    // DER ZEUGE DER WELT: jede genannte Zahl in `roh.zeuge` hält ihr Mindestmaß (Antworten der Welt, Streuung, Ereignisse) — die
    // Attrappe, die nur den Wortlaut der werte trägt, fällt hier
    const zMin = (spec) => (roh) => {
        const z = (roh && roh.zeuge) || {};
        for (const [k, min] of Object.entries(spec))
            if (!(typeof z[k] === "number" && Number.isFinite(z[k]) && z[k] >= min)) return "die Welt antwortete nicht: " + k + " " + (z[k] === undefined ? "fehlt" : z[k]) + " (Soll ≥ " + min + ")";
        return null;
    };
    // die Streuung muss echt sein (> 0), nicht nur ≥ 0
    const zMinStreu = (spec, streu) => (roh) => {
        const f = zMin(spec)(roh);
        if (f) return f;
        const z = roh.zeuge || {};
        for (const k of streu) if (!(typeof z[k] === "number" && z[k] > 0)) return "keine Streuung in " + k + " (" + z[k] + ") — eine Konstante, nicht die Welt";
        return null;
    };
    const leer = (werte) => ({ werte, zeuge: {} });
    // DER RICHTER OHNE ZAHL (fremde-atmosphaeren S1 „Himmelsfarbe Mittag/Abend gegen Foto“): K.soll kann ihn nicht fassen (keine Zahl
    // im Wort) — das Soll steht wörtlich, sein Vergleich „gegen“ die Referenz hält nie; die Sprosse urteilt über den Prüfer-Satz (Auge)
    const ohneZahl = (id, nr, wort, key, einheit) => {
        const r = K.sprosseVon(id, nr).richter;
        if (!r.includes(wort)) throw new Error("Soll „" + wort + "“ steht nicht wörtlich im Richter " + id + " S" + nr);
        if (K.zahlenIn(r).length) throw new Error(id + " S" + nr + ": der Richter trägt eine Zahl — das Soll gehört K.soll");
        return { wort, key, rel: "gegen", a: "die Referenz (der Richter nennt keine Schwelle)", einheit: einheit || "" };
    };

    // ════════════════════════════════════════ LAGEN ════════════════════════════════════════
    const LA = "planet.wetter.lagen";
    const lagen = {
        sek: 32,
        faecher: true,
        pfad: PFAD,
        mutiert: true,
        ungefahren: "die Draufsicht (S3) und das Bild unter der Superzelle (S6) schießt die Probe nur am Gerät (M.auge); headless misst sie das Wetter, den Wind und den Faden",
        mess: async function (H, U, M) {
            const R = (v) => (Number.isFinite(v) ? Math.round(v * 1000) / 1000 : null);
            const u2 = U[2] || {}, u4 = U[4] || {}, u5 = U[5] || {}, u7 = U[7] || {};
            // S2 ÜBER DEN FÄCHER (stationen/faecher.js): je Saat (Adresse) die Folge der Worte am Ort (0, 0) im Takt des Zugs — der Leser
            // des Spiels `_wetterAmOrt` (stamm/bild-himmel.js:3032 → phyto-core.js:4804 wetterAt) unter der Saat der Adresse, der Wind
            // `_windDirAt` (stamm/stoff-material.js:349 → phyto-core windRichtung) um den ersten Regenbeginn und der Druck, den die Welt
            // dort trägt (ein Leser `_luftdruckAt`/`_druckAm` oder ein Feld `druck` der Zeile von wetterAt); die Saat der Welt kehrt je
            // Adresse zurück (finally)
            const FRONT_AN = async (r, T, a, mit) => {
                const st = r.state, wm = st.worldMeta, A = r.constructor, Z = A.WETTER_ZUG_SEK, s0 = wm.seed, P = globalThis.__phytoCore;
                const FELD = A.WEATHER_FIELD, nass = (w) => r._weatherIsWet(w), grau = (w) => FELD[w].grey, tagS = A.DAY_LENGTH_DEFAULT_MINUTES * 60;
                const peil = (d) => { let b = (Math.atan2(d.x, -d.z) * 180) / Math.PI; return b < 0 ? b + 360 : b; };
                const druckAn = typeof r._luftdruckAt === "function" ? (t) => r._luftdruckAt(0, 0, t) : typeof r._druckAm === "function" ? (t) => r._druckAm(0, 0, t) : null;
                try {
                    wm.seed = "wetter-s" + a.saat;
                    const W = [], worte = new Set(), spell = [];
                    for (let i = 0; i < mit.takte; i++) { const w = r._wetterAmOrt(0, 0, i * Z); W.push(w); worte.add(w); }
                    for (let i0 = 0; i0 < W.length; ) if (nass(W[i0])) { let e = i0; while (e < W.length && nass(W[e])) e++; spell.push(((e - i0) * Z) / tagS); i0 = e; } else i0++;
                    let on = -1;
                    for (let i = 6; i < mit.takte - 10; i++) if (nass(W[i]) && !nass(W[i - 1])) { on = i; break; }
                    if (on < 0) return { saat: a.saat, passage: null, spell, worte: [...worte] };
                    const vor = W.slice(on - 5, on);
                    let ende = on;
                    while (ende < W.length && nass(W[ende])) ende++;
                    const schauer = W.slice(ende, ende + 5).some(nass);
                    const anstieg = grau(vor[4]) >= FELD.cloudy.grey - 1e-9 && vor.slice(0, 4).some((w) => grau(w) < grau(vor[4]));
                    let d = peil(r._windDirAt((on + 3) * Z)) - peil(r._windDirAt((on - 3) * Z));
                    while (d > 180) d -= 360;
                    while (d < -180) d += 360;
                    const zeile = P.wetterAt(A._saatVon(wm), 0, 0, (on - 3) * Z, r._gelaende().ort.wetter), zeile1 = P.wetterAt(A._saatVon(wm), 0, 0, on * Z, r._gelaende().ort.wetter);
                    const p0 = druckAn ? druckAn((on - 3) * Z) : Number.isFinite(zeile.druck) ? zeile.druck : null;
                    const p1 = druckAn ? druckAn(on * Z) : Number.isFinite(zeile1.druck) ? zeile1.druck : null;
                    return { saat: a.saat, passage: { on, vor: vor.join(","), anstieg, schauer, dreh: Math.round(d * 10) / 10, druckFall: p0 != null && p1 != null ? p0 - p1 : null, zeileSchluessel: Object.keys(zeile).join(",") }, spell, worte: [...worte] };
                } finally {
                    wm.seed = s0;
                }
            };
            const streu0 = (x) => { const m = x.length ? x.reduce((s, v) => s + v, 0) / x.length : 0; return x.length > 1 ? Math.sqrt(x.reduce((s, v) => s + (v - m) ** 2, 0) / x.length) : 0; };
            const RF = await FAECHER((c) => H.seite(c), {
                gesetz: { fn: FRONT_AN, export: "phyto-core.js:4804 wetterAt (die Zeile zeile/front/feuchte) · phyto-core windRichtung", leser: "stamm/bild-himmel.js:3032 _wetterAmOrt · stamm/stoff-material.js:349 _windDirAt" },
                adressen: { saaten: Array.from({ length: Number(u2.saaten) || 50 }, (_, i) => i) },
                mit: { takte: 400 },
                ms: Number(u2.ms) || 8000,
                masse: {
                    saaten: { wie: "anzahl", feld: "saat" },
                    passagen: { wie: "anzahl", feld: "passage", nur: (a, w) => !!w.passage },
                    stimmt: { wie: (v) => v.filter((p) => p.anstieg && p.schauer && p.dreh >= 15 && p.druckFall != null && p.druckFall > 0).length, feld: "passage", nur: (a, w) => !!w.passage },
                    abfolge: { wie: (v) => v.filter((p) => p.anstieg && p.schauer).length, feld: "passage", nur: (a, w) => !!w.passage },
                    drehung: { wie: (v) => v.filter((p) => p.dreh >= 15).length, feld: "passage", nur: (a, w) => !!w.passage },
                    druck: { wie: (v) => v.filter((p) => p.druckFall != null).length, feld: "passage", nur: (a, w) => !!w.passage },
                    streuDreh: { wie: (v) => streu0(v.map((p) => p.dreh)), feld: "passage", nur: (a, w) => !!w.passage },
                    streuBeginn: { wie: (v) => streu0(v.map((p) => p.on)), feld: "passage", nur: (a, w) => !!w.passage },
                    worte: { wie: (v) => new Set([].concat(...v)).size, feld: "worte" },
                    spell: { wie: (v) => [].concat(...v), feld: "spell" },
                    zeile: { wie: "erste", feld: "passage.zeileSchluessel" },
                    je: { wie: (v) => v.slice(0, 8), feld: "passage", nur: (a, w) => !!w.passage },
                },
                schlecht: { feld: "passage.dreh", richtung: "min" },
                pose: (a, w) => "Ego an der Mess-Wiese unter der Saat wetter-s" + a.saat + " zum Regenbeginn (Takt " + w.passage.on + "), Blick in die Zugrichtung",
                ungemessen: ["die Wolkengattung im Bild (Cirrus → Nimbostratus) — die Welt spricht Worte, keine Gattung"],
            });
            // DAS WETTER DER SAATEN (S5, S7): je Saat die Folge der Worte am Ort (0, 0) im Takt des Zugs; die Saat der Welt steht in EINER
            // synchronen Auswertung und kehrt zurück
            const welt = await H.seite(`
const st = r.state, wm = st.worldMeta, A = r.constructor, Z = A.WETTER_ZUG_SEK, s0 = wm.seed;
const FELD = A.WEATHER_FIELD, nass = (w) => r._weatherIsWet(w), grau = (w) => FELD[w].grey;
const jahrS = r._kalender().jahrK, tagS = A.DAY_LENGTH_DEFAULT_MINUTES * 60, P = globalThis.__phytoCore;
const peil = (d) => { let b = Math.atan2(d.x, -d.z) * 180 / Math.PI; return b < 0 ? b + 360 : b; };
const dreh = (a, b) => { let d = peil(b) - peil(a); while (d > 180) d -= 360; while (d < -180) d += 360; return d; };
const out = { Z, jahrS, tagS, passagen: [], spellTage: [], sturmJahr: [], nassAnteil: [], wortZahl: 0 };
const worte = new Set();
try {
for (let k = 0; k < 0; k++) {
wm.seed = "wetter-s" + k;
const W = [];
for (let i = 0; i < 400; i++) { const w = r._wetterAmOrt(0, 0, i * Z); W.push(w); worte.add(w); }
let i0 = 0;
while (i0 < W.length) { if (nass(W[i0])) { let e = i0; while (e < W.length && nass(W[e])) e++; out.spellTage.push(((e - i0) * Z) / tagS); i0 = e; } else i0++; }
let on = -1;
for (let i = 6; i < 390; i++) if (nass(W[i]) && !nass(W[i - 1])) { on = i; break; }
if (on < 0) { out.passagen.push(null); continue; }
const vor = W.slice(on - 5, on);
let ende = on;
while (ende < W.length && nass(W[ende])) ende++;
const schauer = W.slice(ende, ende + 5).some(nass);
const anstieg = grau(vor[4]) >= FELD.cloudy.grey - 1e-9 && vor.slice(0, 4).some((w) => grau(w) < grau(vor[4]));
const d0 = r._windDirAt((on - 3) * Z), d1 = r._windDirAt((on + 3) * Z);
out.passagen.push({ on, vor: vor.join(","), anstieg, schauer, dreh: Math.round(dreh(d0, d1) * 10) / 10 });
}
for (let k = 0; k < ${Number(u5.saaten) || 100}; k++) {
wm.seed = "wetter-s" + k;
let n = 0, vor = null;
const schritte = Math.round((10 * jahrS) / Z);
for (let i = 0; i < schritte; i++) { const w = r._wetterAmOrt(0, 0, i * Z); if (w === "stormy" && vor !== "stormy") n++; vor = w; }
out.sturmJahr.push(n / 10);
}
for (let k = 0; k < ${Number(u7.saaten) || 1000}; k++) {
wm.seed = "wetter-s" + k;
let n = 0;
for (let i = 0; i < 60; i++) if (nass(r._wetterAmOrt(0, 0, i * 7 * Z))) n++;
out.nassAnteil.push(n / 60);
}
} finally { wm.seed = s0; }
out.saatZurueck = wm.seed === s0;
out.wortZahl = worte.size;
const blitz = [];
r.state.scene.traverse((o) => { if (/blitz|lightning|donner|thunder/i.test(o.name || "")) blitz.push(o.name); });
out.blitz = blitz.length;
out.sturmMs = FELD.stormy.wind * P.WIND_FELD.sturmMS;
out.zugMs = P.WIND_FELD.front.zugMS;
out.far = r.state.camera.far;
return out;
`);
            // DER PLANET: die Bedeckung je Breite über den Faden (das Ort-Gesetz `ortGesetz(o).wetter` ist die Verteilung, die das Wetter am
            // Ort einer Reise liest — `wetterAt` mit `_gelaende().ort.wetter`); der Wind der Heimat (`_windDirAt`, 500 Proben)
            const planet = await H.seite(`
await r._fadenQuelle();
const G = globalThis.__gelaendeCore, P = globalThis.__phytoCore, A = r.constructor, st = r.state, Z = A.WETTER_ZUG_SEK;
const samen = r._planetSamen(), seed = st.worldMeta.seed, WW = A._weltGesetz(st.worldMeta).wetter;
const anker = await r._planetAuftrag({ type: "planet-anker", samen });
const breiten = ${JSON.stringify(u4.breiten || [-85, -75, -65, -55, -45, -35, -25, -15, -5, 5, 15, 25, 35, 45, 55, 65, 75, 85])};
const laengen = [0, 45, 90, 135, 180, 225, 270, 315];
const fr = [];
for (const b of breiten) for (const l of laengen) fr.push(r._planetAuftrag({ type: "planet-ort", samen, breite: b, laenge: l - 180, zeitMa: 0 }));
const a = await Promise.all(fr);
const deck = [];
let antworten = 0, abgelehnt = 0;
for (let i = 0; i < breiten.length; i++) {
let n = 0, d = 0;
for (let j = 0; j < laengen.length; j++) {
const o = a[i * laengen.length + j];
antworten++;
let O = null;
try { O = G.ortGesetz(o); } catch (e) { abgelehnt++; continue; }
for (let k = 0; k < 40; k++) { const z = P.wetterAt(seed, 0, 0, k * 3 * Z, O.wetter).zeile; const w = WW[z]; n++; if (w === "cloudy" || w === "rainy" || w === "stormy") d++; }
}
deck.push(d / n);
}
const phi = anker.breite * 180 / Math.PI;
const ziel = Math.abs(phi) < 30 || Math.abs(phi) > 60 ? 270 : 90;
let treffer = 0;
const N = ${Number(u4.proben) || 500};
for (let k = 0; k < N; k++) { const d = r._windDirAt(k * 61); let b = Math.atan2(d.x, -d.z) * 180 / Math.PI; if (b < 0) b += 360; let x = Math.abs(b - ziel); if (x > 180) x = 360 - x; if (x <= 30) treffer++; }
return { breiten, deck, antworten, abgelehnt, phi, ziel, treffer, N, version: a[0].version };
`);
            const mittel = (x) => (x.length ? x.reduce((s, v) => s + v, 0) / x.length : NaN);
            const streu = (x) => (x.length > 1 ? Math.sqrt(mittel(x.map((v) => (v - mittel(x)) ** 2))) : 0);
            const pearson = (x, y) => {
                const mx = mittel(x), my = mittel(y);
                let a = 0, b = 0, c = 0;
                for (let i = 0; i < x.length; i++) (a += (x[i] - mx) * (y[i] - my)), (b += (x[i] - mx) ** 2), (c += (y[i] - my) ** 2);
                return b > 0 && c > 0 ? a / Math.sqrt(b * c) : NaN;
            };
            const aus = M.teil || {};
            // S2 die Frontpassage: Abfolge (die Bedeckung steigt aus dünner Decke zur Decke bewölkt, nach dem Regen ein Schauer) und
            // Winddrehung (rechtsdrehend ≥ 15° über ±3 Takte, Nordhalbkugel); einen Druck trägt die Welt nicht
            const F2 = RF.werte, np = F2.passagen || 0;
            welt.spellTage = F2.spell || [];
            aus[2] = {
                werte: { passagen: np, stimmtProzent: np ? R((100 * F2.stimmt) / np) : null, abfolgeProzent: np ? R((100 * F2.abfolge) / np) : null, drehungProzent: np ? R((100 * F2.drehung) / np) : null },
                zeuge: { saaten: F2.saaten || 0, passagen: np, druck: F2.druck || 0, streuDreh: R(F2.streuDreh), streuBeginn: R(F2.streuBeginn), worte: F2.worte || 0, je: F2.je || [], adressen: RF.adressen, gerissen: RF.gerissen },
            };
            if (np && !F2.druck) aus[2].taeter = "Leser fehlt: phyto-core.js:4804 wetterAt gibt " + (F2.zeile || "zeile,front,feuchte") + " — kein Druck; kein Leser _luftdruckAt im Stamm: der Druckfall der Frontpassage ist an " + np + " Passagen ungemessen · " + RF.akte;
            else aus[2].zeuge.akte = RF.akte.slice(0, 600);
            // S3 das Tief mit Lebenslauf: die Dauer der nassen Strecken am Ort (Spieltage), das Bild von oben nur am Gerät
            aus[3] = {
                werte: { lebenslaufTage: R(mittel(welt.spellTage)), lebenslaufMaxTage: R(Math.max(0, ...welt.spellTage)), kameraFernM: welt.far },
                zeuge: { strecken: welt.spellTage.length, streu: R(streu(welt.spellTage)) },
                auge: await M.auge("wetter-lagen-s3", { px: 0, py: 900, pz: 0, lx: 0, ly: 0, lz: 40 }),
                nicht: "keine Draufsicht 400 km (die Kamera reicht " + welt.far + " m) und kein Tief mit Lebenslauf: eine nasse Strecke dauert im Mittel " + R(mittel(welt.spellTage)) + " Spieltage, das Feld wandert starr (phyto-core.js:4423 wetterAt)",
            };
            // S4 das Breitenprofil der Bedeckung (Faden) gegen die Erde; der Wind der Heimat gegen die Zone ihrer Breite
            const ISCCP = { "-85": 0.55, "-75": 0.62, "-65": 0.84, "-55": 0.85, "-45": 0.79, "-35": 0.66, "-25": 0.56, "-15": 0.56, "-5": 0.62, "5": 0.66, "15": 0.56, "25": 0.48, "35": 0.55, "45": 0.66, "55": 0.73, "65": 0.72, "75": 0.67, "85": 0.62 };
            const erde = planet.breiten.map((b) => ISCCP[String(b)]);
            aus[4] = {
                werte: { bedeckungR: streu(planet.deck) < 1e-9 ? 0 : R(pearson(planet.deck, erde)), zonalHeimatProzent: R((100 * planet.treffer) / planet.N), passatProben: planet.N },
                zeuge: { antworten: planet.antworten, abgelehnt: planet.abgelehnt, streuDeckung: R(streu(planet.deck)), proben: planet.N, deckung: planet.deck.map(R), heimatBreite: R(planet.phi), zielPeilung: planet.ziel, version: planet.version },
                nicht: "der Wind des Planeten erreicht die Welt nicht: der Faden trägt nur regenQuote und sturmQuote (voxel-worker.js:1202), die Richtung des Passats (planet-core.js:2336 windX/windZ) liest kein Leser — gemessen ist nur die Zone der Heimat (" + R(planet.phi) + "°)",
            };
            // S5 Wirbelstürme: die Welt trägt keinen Wirbel — gezählt sind die Sturm-Einsätze am Ort je Spieljahr über 100 Saaten
            aus[5] = {
                werte: { saaten: welt.sturmJahr.length, sturmEinsaetzeJeJahr: R(mittel(welt.sturmJahr)) },
                zeuge: { saaten: welt.sturmJahr.length, streu: R(streu(welt.sturmJahr)) },
                nicht: "kein Wirbelsturm, keine Bahn: das Wetter kennt keinen Wirbel (phyto-core.js:4423 wetterAt — drei Sinus-Wellen), es gibt nichts gegen IBTrACS zu zählen",
            };
            // S6 Superzelle, Blitz, Donner: die Szene trägt keinen Blitz; das Bild unter dem Sturm nur am Gerät
            aus[6] = {
                werte: { blitzObjekte: welt.blitz, sturmMs: R(welt.sturmMs) },
                zeuge: { szene: 1 },
                auge: await M.auge("wetter-lagen-s6", { ort: "wiese" }, { wetter: "stormy" }),
                nicht: "kein Blitz und kein Donner in der Welt (0 Objekte der Szene, keine Stimme des Donners), keine Superzelle — der Sturm ist ein Wort (WEATHER_FIELD.stormy)",
            };
            // S7 1 000 Saaten: der Regen-Anteil je Saat (60 Takte am Ort); Druck und Wind je Saat trägt die Welt nicht, ERA5 nicht im Korpus
            aus[7] = {
                werte: { saaten: welt.nassAnteil.length, nassMittel: R(mittel(welt.nassAnteil)), nassStreu: R(streu(welt.nassAnteil)) },
                zeuge: { saaten: welt.nassAnteil.length, streu: R(streu(welt.nassAnteil)), saatZurueck: welt.saatZurueck ? 1 : 0 },
                nicht: "kein Druckfeld und kein Niederschlags-Betrag je Saat (die Welt spricht Worte, phyto-core.js:4423 wetterAt) — ein KS-Test gegen ERA5 hat keine Größe der Welt",
            };
            return { sprossen: aus };
        },
        sprossen: {
            2: {
                u: { saaten: 50, ms: 8000 },
                soll: [K.soll(LA, 2, "Winddrehung stimmt ≥ 80 %", { key: "stimmtProzent", einheit: "%" }), K.soll(LA, 2, "50 Frontpassagen aus 50 Saaten", { key: "passagen", rel: "≥", zahl: 50 })],
                // der Zeuge: 50 Saaten gefragt, an jeder Passage ein Druck (der Druckfall gehört zum Satz der Sprosse), Abfolge und Beginn streuen
                zeuge: zMinStreu({ saaten: 50, passagen: 50, druck: 50, worte: 3 }, ["streuDreh", "streuBeginn"]),
                taeter: "phyto-core.js wetterAt (drei Sinus-Wellen, kein Druck, keine Gattung)",
                leser: "stamm/bild-himmel.js:3032 _wetterAmOrt und stamm/stoff-material.js:349 _windDirAt lesen phyto-core.js:4804 wetterAt / windRichtung — die Zeile trägt zeile/front/feuchte, keinen Druck und keine Gattung",
                unklar: "„stimmt“ gelesen als: die Decke steigt aus dünner zur bewölkten (die Gattung Cirrus → Nimbostratus trägt die Welt nicht als Wort), nach dem Regen ein Schauer, der Druck fällt über die letzten 3 Takte vor dem Regen und der Wind dreht ≥ 15° rechts",
                gruen: { werte: { passagen: 50, stimmtProzent: 84 }, zeuge: { saaten: 50, passagen: 50, druck: 50, streuDreh: 22, streuBeginn: 9, worte: 5 } },
                attrappen: [
                    { name: "84 % ohne eine Antwort der Welt", roh: leer({ passagen: 50, stimmtProzent: 84 }) },
                    { name: "dieselbe Passage 50-mal (keine Streuung)", roh: { werte: { passagen: 50, stimmtProzent: 84 }, zeuge: { saaten: 50, passagen: 50, druck: 50, streuDreh: 0, streuBeginn: 0, worte: 5 } } },
                    { name: "die Drehung ohne Druck gezählt", roh: { werte: { passagen: 50, stimmtProzent: 84 }, zeuge: { saaten: 50, passagen: 50, druck: 0, streuDreh: 22, streuBeginn: 9, worte: 5 } } },
                ],
                proben: [{ name: "die Welt ohne Druck: 0 % stimmen (ROT beim Leser)", roh: { werte: { passagen: 50, stimmtProzent: 0, abfolgeProzent: 60, drehungProzent: 40 }, zeuge: { saaten: 50, passagen: 50, druck: 0, streuDreh: 22, streuBeginn: 9, worte: 5 }, taeter: "Leser fehlt: kein Druck" } }],
            },
            3: {
                u: { draufsichten: 20 },
                soll: [K.soll(LA, 3, "Trefferquote ≤ 60 %", { key: "trefferProzent", einheit: "%" }), K.soll(LA, 3, "Blindtest 20 Draufsichten", { key: "draufsichten", rel: "≥", zahl: 20 })],
                auge: { pose: "Draufsicht 900 m über dem Spawn (die Kamera reicht wenige km — camera.far; 400 km nicht erzeugbar)", vorbild: "Satellitenbilder eines Tiefs (EUMETSAT/GOES), Blindtest 20 Draufsichten ≤ 60 %" },
                taeter: "phyto-core.js wetterAt (kein Tief, das entsteht und vergeht)",
                nicht: "keine Draufsicht 400 km, kein Tief mit Lebenslauf",
                leser: "scripts/werkbank.cjs:2110 /bild — keine Pose 400 km über dem Boden (camera.far wenige km); phyto-core.js:4423 wetterAt kennt kein Tief",
                gruen: { werte: { trefferProzent: 55, draufsichten: 20 }, zeuge: { strecken: 40, streu: 0.3 } },
                attrappen: [{ name: "Trefferquote ohne Bild", roh: leer({ trefferProzent: 55, draufsichten: 20 }) }],
            },
            4: {
                u: { breiten: [-85, -75, -65, -55, -45, -35, -25, -15, -5, 5, 15, 25, 35, 45, 55, 65, 75, 85], proben: 500, referenz: "ISCCP D2, zonales Jahresmittel der Bedeckung (Rossow & Schiffer 1999), gerundet je 10°" },
                soll: [
                    K.soll(LA, 4, "Breitenprofil der Bedeckung r ≥ 0,7", { key: "bedeckungR" }),
                    K.soll(LA, 4, "Passatrichtung ±30° in ≥ 70 % von 500 Proben", { key: "passatProzent", rel: "≥", zahl: 70, einheit: "%" }),
                    K.soll(LA, 4, "Passatrichtung ±30° in ≥ 70 % von 500 Proben", { key: "passatProben", rel: "≥", zahl: 500 }),
                ],
                zeuge: zMinStreu({ antworten: 100, proben: 500 }, ["streuDeckung"]),
                taeter: "voxel-worker.js planetOrtAuftrag (der Wind des Planeten fällt am Faden)",
                nicht: "der Passat des Planeten erreicht die Welt nicht",
                leser: "voxel-worker.js:1202 — planetOrtAuftrag gibt delta.wetter nur regenQuote/sturmQuote weiter, nicht windX/windZ (planet-core.js:2336)",
                gruen: { werte: { bedeckungR: 0.78, passatProzent: 74, passatProben: 500 }, zeuge: { antworten: 144, streuDeckung: 0.1, proben: 500 } },
                attrappen: [
                    { name: "r 0,78 aus einer Tabelle", roh: leer({ bedeckungR: 0.78, passatProzent: 74, passatProben: 500 }) },
                    { name: "dieselbe Bedeckung an jeder Breite", roh: { werte: { bedeckungR: 0.78, passatProzent: 74, passatProben: 500 }, zeuge: { antworten: 144, streuDeckung: 0, proben: 500 } } },
                ],
            },
            5: {
                u: { saaten: 100, jahre: 10 },
                soll: [
                    K.soll(LA, 5, "Wirbelsturm-Zahl und -Bahnen gegen IBTrACS ±30 %", { key: "wirbelsturmZahl", ref: 86, refQuelle: "IBTrACS 1991–2020: ≈ 86 benannte tropische Wirbelstürme je Jahr auf der Erde (Knapp et al. 2010)" }),
                    K.soll(LA, 5, "100 Erd-Saaten", { key: "saaten", rel: "≥", zahl: 100 }),
                ],
                zeuge: zMinStreu({ saaten: 100 }, ["streu"]),
                taeter: "phyto-core.js wetterAt (kein Wirbel)",
                nicht: "kein Wirbelsturm",
                leser: "phyto-core.js:4423 — wetterAt trägt keinen Wirbel, keine Bahn, kein Auge",
                gruen: { werte: { wirbelsturmZahl: 80, saaten: 100 }, zeuge: { saaten: 100, streu: 0.4 } },
                attrappen: [{ name: "80 Wirbel aus der Liste", roh: leer({ wirbelsturmZahl: 80, saaten: 100 }) }],
            },
            6: {
                u: {},
                soll: [
                    K.soll(LA, 6, "Blindtest gegen Sturmfotos ≤ 60 %", { key: "blindProzent", einheit: "%" }),
                    K.soll(LA, 6, "Donner-Lag = Abstand/343 m/s ±10 %", { key: "donnerLagVerh", ref: 1, refQuelle: "Schall in Luft 343 m/s bei 20 °C: Lag ÷ (Abstand/343 m/s) = 1" }),
                ],
                auge: { pose: "Ego an der Mess-Wiese im Sturm (die Bühne setzt stormy)", vorbild: "Sturmfotos einer Superzelle (NSSL-Archiv), Blindtest ≤ 60 %" },
                taeter: "die Welt trägt keinen Blitz (stamm/*: kein Leser)",
                nicht: "kein Blitz, kein Donner, keine Superzelle",
                leser: "stamm/bild-himmel.js:978 — der Regen ist das einzige Teilchen des Sturms; kein Leser zündet Blitz oder Donner",
                gruen: { werte: { blindProzent: 58, donnerLagVerh: 1.02 }, zeuge: { szene: 1 } },
                attrappen: [{ name: "Donner aus der Formel ohne Blitz", roh: leer({ blindProzent: 58, donnerLagVerh: 1 }) }],
            },
            7: {
                u: { saaten: 1000 },
                soll: [K.soll(LA, 7, "ununterscheidbar von ERA5 in ≥ 90 %", { key: "ksProzent", einheit: "%" }), K.soll(LA, 7, "1 000 Saaten", { key: "saaten", rel: "≥", zahl: 1000 })],
                zeuge: zMinStreu({ saaten: 1000, saatZurueck: 1 }, ["streu"]),
                taeter: "phyto-core.js wetterAt (kein Druck, kein Betrag)",
                nicht: "kein Druckfeld, kein Niederschlags-Betrag",
                leser: "phyto-core.js:4423 — wetterAt kennt keinen Druck und keinen Betrag in mm; ERA5 steht nicht im Korpus",
                gruen: { werte: { ksProzent: 92, saaten: 1000 }, zeuge: { saaten: 1000, streu: 0.08, saatZurueck: 1 } },
                attrappen: [{ name: "KS 92 % ohne Saat", roh: leer({ ksProzent: 92, saaten: 1000 }) }],
            },
        },
    };

    // ════════════════════════════════════════ WOLKEN ════════════════════════════════════════
    const WO = "planet.wetter.wolken";
    const wolken = {
        sek: 26,
        faecher: true,
        pfad: PFAD,
        mutiert: true,
        ungefahren: "der Wurf der Wolke (Karte `_wolkenKarte`) malt nur mit Schatten-Licht (`_lichtWirft`), headless nie — die Zuggeschwindigkeit der Schatten misst die Probe am Gerät aus zwei Lesungen der Karte; die Bilder (2AFC, Blindtest, Gattung) schießt M.auge am Gerät",
        mess: async function (H, U, M) {
            const R = (v) => (Number.isFinite(v) ? Math.round(v * 1000) / 1000 : null);
            const u3 = U[3] || {};
            // DIE LUFT UND DIE SCHICHT: der Zug der Wolke (Uniform `zug`, Einheiten der Schicht je Sekunde) in m/s, die Sicht je Wort
            // (`_luftSichtM` unter dem Wort, über `__wetterSetzen` und zurück), die Temperatur am Boden je Saison und Höhe, die
            // Erscheinungen der Szene
            const welt = await H.seite(`
const st = r.state, A = r.constructor, u = st.skyboxUniforms, HG = A.Gesetz("terrain:HIMMEL_GESETZ", null), W = A.WOLKEN_SCHICHT;
const G = globalThis.__gelaendeCore, FELD = A.WEATHER_FIELD, wl = Number.isFinite(st.waterLevel) ? st.waterLevel : 0;
const z0 = u && u.zug ? [u.zug.value.x, u.zug.value.y] : null;
const out = { hoeheM: W.hoeheM, schichten: typeof W.hoeheM === "number" ? 1 : 0, far: st.camera.far, projY: HG.projY };
out.wolkeZugMs = z0 ? Math.hypot(z0[0], z0[1]) * (1 + HG.projY) * W.hoeheM : null;
out.lichtWirft = typeof r._lichtWirft === "function" ? !!r._lichtWirft() : false;
const K = st.wolkenKarte;
out.karteMal = K ? K.malZahl : 0;
const Kk = -Math.log(A.LUFT.kontrast);
const sicht = {};
for (const w of Object.keys(FELD)) sicht[w] = Kk / r._luftBeta(FELD[w]);
out.sichtJetzt = r._luftSichtM(st.camera.position.y);
out.sicht = sicht;
out.betaRegen = r._luftBeta(FELD.rainy);
const T = [];
for (const ph of [0.125, 0.375, 0.625, 0.875]) for (const dy of [0, 25, 50, 100, 200]) T.push(G.temperaturAus(r._temperaturFeld(wl + dy), ph, 0.5, FELD.rainy));
out.T = T;
const RG = A.Gesetz("terrain:REGEN_GESETZ", null);
out.regenArten = Object.keys(RG).filter((k) => /schnee|snow|phase|graupel|hagel/i.test(k)).length;
const ersch = [];
st.scene.traverse((o) => { if (/regenbogen|rainbow|halo|blitz|lightning|staub|dust|nebelbank/i.test(o.name || "")) ersch.push(o.name); });
out.erscheinungen = ersch.length;
out.worte = Object.keys(FELD);
out.ursachen = { regenbogen: FELD.rainy.rain > 0 && FELD.rainy.sun > 0.3 ? 1 : 0, blitz: FELD.stormy.rain >= 1 ? 1 : 0, nebel: FELD.foggy.fog >= 1 ? 1 : 0 };
out.zeigt = { regenbogen: 0, blitz: 0, nebel: FELD.foggy.fog > FELD.sunny.fog && sicht.foggy < sicht.sunny ? 1 : 0 };
out.uhrDerBild = u ? u.time.value : null;
return out;
`);
            // DER WURF AM GERÄT: zwei Lesungen der Karte (der Regen trägt die Deckung, die Karte ist ganz Wolke-gewogen), 3 s Bild-Uhr
            // auseinander, die Verschiebung des Musters (Korrelation ±8 Texel je Achse) in Metern je Sekunde
            let schatten = { grund: "headless: kein Schatten-Licht, die Karte malt nicht (`_lichtWirft` falsch)" };
            if (welt.lichtWirft && !M.swift) {
                schatten = await H.seite(`
const st = r.state, A = r.constructor, W = A.WOLKEN_SCHICHT, rend = st.renderer, alt = st.weather;
const lies = async () => { const K = r._wolkenKarte(); const d = await rend.readRenderTargetPixelsAsync(K.rt, 0, 0, W.karte, W.karte); return { d: Array.from(d.filter((_, i) => i % (d.length / (W.karte * W.karte)) === 0)), t: K.zeit, mitte: K.mitte ? K.mitte.slice() : null }; };
const ruhe = (ms) => new Promise((f) => setTimeout(f, ms));
try {
if (window.__wetterSetzen("rainy") !== "rainy") throw new Error("rainy gilt nicht");
await ruhe(600);
const a = await lies();
await ruhe(3000);
const b = await lies();
const n = W.karte, m = 192, o = (n - m) / 2;
let best = [-1e9, 0, 0];
for (let dx = -8; dx <= 8; dx++) for (let dz = -8; dz <= 8; dz++) {
let s = 0, sa = 0, sb = 0, saa = 0, sbb = 0, k = 0;
for (let j = o; j < o + m; j += 2) for (let i = o; i < o + m; i += 2) { const x = a.d[j * n + i], y = b.d[(j + dz) * n + i + dx]; s += x * y; sa += x; sb += y; saa += x * x; sbb += y * y; k++; }
const c = (s - (sa * sb) / k) / Math.sqrt(Math.max(1e-9, (saa - (sa * sa) / k) * (sbb - (sb * sb) / k)));
if (c > best[0]) best = [c, dx, dz];
}
const verschub = a.mitte && b.mitte ? [(b.mitte[0] - a.mitte[0]) / W.zelleM, (b.mitte[1] - a.mitte[1]) / W.zelleM] : [0, 0];
const px = Math.hypot(best[1] + verschub[0], best[2] + verschub[1]);
return { korrelation: best[0], texel: px, dt: b.t - a.t, ms: b.t > a.t ? (px * W.zelleM) / (b.t - a.t) : null, streu: Math.max(...a.d) - Math.min(...a.d) };
} finally { window.__wetterSetzen(alt); }
`).catch((e) => ({ grund: String((e && e.message) || e).slice(0, 200) }));
            }
            const aus = M.teil || {};
            const zug = welt.wolkeZugMs;
            const sch = Number.isFinite(schatten.ms) ? schatten.ms : null;
            // S1 DER ZUG AM FÄCHER (M4): je Adresse (Saat × Zeit der Welt-Uhr) der Zug der Schicht, wie der Himmel ihn setzt
            // (stamm/bild-himmel.js:1964: phyto-core windGrund der Saat × WIND_FELD.front.zugMS über die Projektion der Schicht), und
            // der Wind am Boden zur selben Zeit (`_windDirAt`) — Betrag und Richtung des Zugs gegen den Wind der Lage
            const u1 = U[1] || {};
            const ZUG_AN = async (r, T, a, mit) => {
                const st = r.state, wm = st.worldMeta, A = r.constructor, s0 = wm.seed, P = globalThis.__phytoCore, W = A.WOLKEN_SCHICHT, HG = A.Gesetz("terrain:HIMMEL_GESETZ", null);
                const peil = (d) => { let b = (Math.atan2(d.x, -d.z) * 180) / Math.PI; return b < 0 ? b + 360 : b; };
                try {
                    if (a.saat != null) wm.seed = "wetter-s" + a.saat;
                    const g = P.windGrund(A._saatJe(r)), k = -P.WIND_FELD.front.zugMS / ((1 + HG.projY) * W.hoeheM);
                    const t = a.zeit * mit.schrittS, zx = g.x * k, zz = g.z * k;
                    const ms = Math.hypot(zx, zz) * (1 + HG.projY) * W.hoeheM;
                    let d = peil({ x: -zx, z: -zz }) - peil(r._windDirAt(t));
                    while (d > 180) d -= 360;
                    while (d < -180) d += 360;
                    return { saat: a.saat, zeit: a.zeit, ms: Math.round(ms * 1000) / 1000, gegenWindGrad: Math.round(Math.abs(d) * 10) / 10 };
                } finally {
                    wm.seed = s0;
                }
            };
            const streu0 = (x) => { const m = x.length ? x.reduce((s, v) => s + v, 0) / x.length : 0; return x.length > 1 ? Math.sqrt(x.reduce((s, v) => s + (v - m) ** 2, 0) / x.length) : 0; };
            const RF = await FAECHER((c) => H.seite(c), {
                gesetz: { fn: ZUG_AN, export: "phyto-core.js:4698 WIND_FELD.front.zugMS · phyto-core windGrund · stamm/stoff-material.js:349 _windDirAt", leser: "stamm/bild-himmel.js:1964 (der Zug der Schicht, Uniform zug)" },
                adressen: { saaten: Array.from({ length: Number(u1.saaten) || 20 }, (_, i) => i), zeiten: Array.from({ length: Number(u1.zeiten) || 20 }, (_, i) => i), dazu: [{ saat: null, ort: null, zeit: 0 }] },
                mit: { schrittS: Number(u1.schrittS) || 1777 },
                ms: Number(u1.ms) || 4000,
                masse: {
                    adressen: { wie: "anzahl", feld: "ms" },
                    saaten: { wie: "verschieden", feld: "a.saat" },
                    zugMinMs: { wie: "min", feld: "ms" },
                    zugMaxMs: { wie: "max", feld: "ms" },
                    streuZug: { wie: (v) => streu0(v), feld: "ms" },
                    gegenWindGrad: { wie: "mittel", feld: "gegenWindGrad" },
                },
                schlecht: { feld: "gegenWindGrad", richtung: "max" },
                pose: (a, w) => "Ego an der Mess-Wiese, bewölkt, Saat " + (a.saat == null ? "der Welt" : "wetter-s" + a.saat) + ", Zug " + w.ms + " m/s " + w.gegenWindGrad + "° gegen den Wind am Boden",
                ungemessen: ["der Zug des Wurfs (die Karte `_wolkenKarte` malt nur mit Schatten-Licht, `_lichtWirft` — am Gerät)", "das 2AFC gegen den Zeitraffer-Film (Panel)"],
            });
            // S1 die Schicht: Zug der Wolke (Uniform, am Fächer) und des Wurfs (Karte, am Gerät), Versatz; das 2AFC am Gerät
            aus[1] = {
                werte: Object.assign({ wolkeZugMs: R(zug), schichtHoeheM: welt.hoeheM }, sch !== null ? { schattenZugMs: R(sch), versatzProzent: R((100 * Math.abs(sch - zug)) / zug) } : {}),
                zeuge: { karteMal: welt.karteMal, korrelation: R(schatten.korrelation), dt: R(schatten.dt), grund: schatten.grund || null, adressen: RF.werte.adressen, saaten: RF.werte.saaten, zugMinMs: R(RF.werte.zugMinMs), zugMaxMs: R(RF.werte.zugMaxMs), streuZug: R(RF.werte.streuZug), gegenWindGrad: R(RF.werte.gegenWindGrad), akte: RF.akte },
                auge: await M.auge("wetter-wolken-s1", { ort: "wiese" }, { wetter: "cloudy" }),
                taeter: "phyto-core.js:4698 WIND_FELD.front.zugMS — der Zug " + R(RF.werte.zugMinMs) + "–" + R(RF.werte.zugMaxMs) + " m/s an " + RF.gemessen + " Adressen (Streuung " + R(RF.werte.streuZug) + "): eine Konstante, kein Wind der Lage · " + RF.akte,
            };
            // S2 drei Stockwerke: die Welt trägt EINE Schicht
            aus[2] = {
                werte: { schichten: welt.schichten, schichtHoeheM: welt.hoeheM },
                zeuge: { schichten: welt.schichten },
                auge: await M.auge("wetter-wolken-s2", { ort: "wiese" }, { wetter: "cloudy" }),
                nicht: "EINE Wolkenschicht in " + welt.hoeheM + " m (welt-licht.js:864 WOLKEN_SCHICHT), keine drei Stockwerke, keine Gattung",
            };
            // S3 Gattung und Tagesgang: die Bedeckung je Stunde über 20 Saaten × 200 Momente (10 Spieltage), die Stunde des Gipfels
            const tag = await H.seite(`
const st = r.state, wm = st.worldMeta, A = r.constructor, s0 = wm.seed, FELD = A.WEATHER_FIELD, tagS = A.DAY_LENGTH_DEFAULT_MINUTES * 60;
const gipfel = [];
let momente = 0;
try {
for (let k = 0; k < ${Number(u3.saaten) || 20}; k++) {
wm.seed = "wetter-s" + k;
const h = new Array(24).fill(0), n = new Array(24).fill(0);
for (let j = 0; j < ${Number(u3.momente) || 200}; j++) { const t = (j * 10 * tagS) / ${Number(u3.momente) || 200} + k * 37; const s = Math.floor(24 * ((t % tagS) / tagS)); h[s] += FELD[r._wetterAmOrt(0, 0, t)].grey; n[s]++; momente++; }
let b = 0;
for (let s = 1; s < 24; s++) if (n[s] && h[s] / n[s] > h[b] / Math.max(1, n[b])) b = s;
gipfel.push(b);
}
} finally { wm.seed = s0; }
return { gipfel, momente, saatZurueck: wm.seed === s0 };
`);
            const imFenster = tag.gipfel.filter((s) => s >= 14 && s <= 17).length;
            const mittel = (x) => (x.length ? x.reduce((s, v) => s + v, 0) / x.length : NaN);
            const streu = (x) => (x.length > 1 ? Math.sqrt(mittel(x.map((v) => (v - mittel(x)) ** 2))) : 0);
            aus[3] = {
                werte: { cumulusGipfelProzent: R((100 * imFenster) / tag.gipfel.length), momente: R(tag.momente / tag.gipfel.length), saaten: tag.gipfel.length },
                zeuge: { saaten: tag.gipfel.length, streuGipfel: R(streu(tag.gipfel)), saatZurueck: tag.saatZurueck ? 1 : 0 },
                nicht: "keine Gattung: die Wolke folgt keiner Feuchte, Hebung oder Stabilität — die Kuppel liest nur die Deckung des Worts (stamm/bild-himmel.js:1765 cloudCover), das Wort hängt nicht an der Uhr (phyto-core.js:4423 wetterAt)",
            };
            // S4 die Phase des Niederschlags gegen das Temperatur-Profil (4 Saisons × 5 Höhen unter Regen); der Vorhang auf 5 km
            const warm = welt.T.filter((t) => t > 0).length;
            const phaseWelt = welt.regenArten > 0 ? "mehrere" : "regen";
            aus[4] = {
                werte: { phaseProzent: R((100 * (phaseWelt === "regen" ? warm : welt.T.length)) / welt.T.length), kontrast5km: welt.far < 5000 ? 0 : R(Math.exp(-welt.betaRegen * 5000)), sichtRegenM: R(welt.sicht.rainy) },
                zeuge: { proben: welt.T.length, streuT: R(streu(welt.T)), unterNull: welt.T.length - warm, kameraFernM: welt.far },
            };
            // S5 die Luft: Sicht im Nebel gegen die Nebel-Definition der Erde, die Erscheinungen und ihre Ursachen
            const ursN = Object.values(welt.ursachen).reduce((s, v) => s + v, 0);
            const zeigtN = Object.keys(welt.ursachen).filter((k) => welt.ursachen[k] && welt.zeigt[k]).length;
            const sichten = Object.values(welt.sicht);
            aus[5] = {
                werte: { sichtNebelM: R(welt.sicht.foggy), ohneUrsache: 0, ursachenProzent: ursN ? R((100 * zeigtN) / ursN) : null, sichtMaxM: R(Math.max(...sichten)), sichtMinM: R(Math.min(...sichten)) },
                zeuge: { worte: sichten.length, streuSicht: R(streu(sichten)), sichtJetztM: R(welt.sichtJetzt), erscheinungen: welt.erscheinungen, ursachen: welt.ursachen },
                nicht: "Sicht 10 m – 200 km nicht erzeugbar: die Luft trägt höchstens " + R(Math.max(...sichten)) + " m (LUFT.sichtKlarM), gezeichnet wird bis " + welt.far + " m (camera.far); kein Regenbogen, kein Blitz, kein Staub in der Szene",
            };
            // S6 durchfliegbar: die Schicht ist eine Kuppel über dem Auge, kein Volumen
            aus[6] = {
                werte: { schichtHoeheM: welt.hoeheM, kameraFernM: welt.far },
                zeuge: { schichten: welt.schichten },
                nicht: "keine durchfliegbare Wolke: die Schicht ist eine Projektion über dem Auge (welt-licht.js wolkenFeld, projY " + welt.projY + "), die Kamera reicht " + welt.far + " m, kein Orbit",
            };
            // S7 10⁶ Wolken: eine Schicht, das Bild am Gerät
            aus[7] = {
                werte: { schichten: welt.schichten },
                zeuge: { schichten: welt.schichten },
                auge: await M.auge("wetter-wolken-s7", { ort: "wiese" }, { wetter: "cloudy", uhr: 0.6 }),
                nicht: "keine einzelnen Wolken: EIN Feld in EINER Schicht (welt-licht.js:864 WOLKEN_SCHICHT)",
            };
            return { sprossen: aus };
        },
        sprossen: {
            1: {
                u: { lesungenS: 3, karteTexel: 192, saaten: 20, zeiten: 20, schrittS: 1777, ms: 4000 },
                soll: [
                    K.soll(WO, 1, "2AFC ≤ 85 %", { key: "afcProzent", einheit: "%" }),
                    K.soll(WO, 1, "im Band realer Wolkenzüge (2–20 m/s)", { key: "schattenZugMs", einheit: "m/s" }),
                    K.soll(WO, 1, "Versatz ≤ 5 %", { key: "versatzProzent", einheit: "%" }),
                ],
                auge: { pose: "Ego an der Mess-Wiese, bewölkt, Zeitraffer der Schicht (Werkbank /bild am Ort)", vorbild: "Zeitraffer-Film realer Schichtwolken (Stratocumulus), 2AFC ≤ 85 %" },
                taeter: "phyto-core.js:4698 WIND_FELD.front.zugMS (eine Konstante) · stamm/bild-himmel.js _wolkenKarte",
                leser: "stamm/bild-himmel.js:1964 — der Zug der Schicht ist windGrund der Saat × WIND_FELD.front.zugMS, an jeder Adresse derselbe Betrag",
                gruen: { werte: { afcProzent: 80, schattenZugMs: 11, versatzProzent: 0.5 }, zeuge: { karteMal: 40, korrelation: 0.9, dt: 3 } },
                attrappen: [{ name: "der Zug aus der Konstante zugMS", roh: leer({ afcProzent: 80, schattenZugMs: 11, versatzProzent: 0 }) }],
            },
            2: {
                u: {},
                soll: [K.soll(WO, 2, "Blindtest 20 Himmelsbilder gegen Foto ≤ 70 %", { key: "blindProzent", einheit: "%" }), K.soll(WO, 2, "Gattung vom Bildmodell erkannt ≥ 80 %", { key: "gattungProzent", einheit: "%" })],
                auge: { pose: "Ego an der Mess-Wiese, Blick 30° über den Horizont, bewölkt", vorbild: "Himmelsfotos mit drei Stockwerken (WMO-Wolkenatlas), Blindtest ≤ 70 %, Gattung ≥ 80 %" },
                taeter: "welt-licht.js WOLKEN_SCHICHT (eine Schicht)",
                nicht: "eine Schicht, keine Stockwerke",
                leser: "welt-licht.js:864 — WOLKEN_SCHICHT trägt EINE Höhe (800 m); kein Leser zeichnet Cirrus oder Altostratus",
                gruen: { werte: { blindProzent: 65, gattungProzent: 85 }, zeuge: { schichten: 3 } },
                attrappen: [{ name: "Gattung erkannt ohne Bild", roh: leer({ blindProzent: 65, gattungProzent: 85 }) }],
            },
            3: {
                u: { saaten: 20, momente: 200, tag: "Spieltag = DAY_LENGTH_DEFAULT_MINUTES·60 s der Welt-Uhr, Stunde = 1/24" },
                soll: [
                    K.soll(WO, 3, "sichtbare Gattung = verlangte ≥ 80 %", { key: "gattungProzent", einheit: "%" }),
                    K.soll(WO, 3, "Cumulus-Gipfel 14–17 Uhr in ≥ 80 %", { key: "cumulusGipfelProzent", rel: "≥", zahl: 80, einheit: "%" }),
                    K.soll(WO, 3, "200 Momente × 20 Saaten", { key: "momente", rel: "≥", zahl: 200 }),
                    K.soll(WO, 3, "200 Momente × 20 Saaten", { key: "saaten", rel: "≥", zahl: 20 }),
                ],
                zeuge: zMinStreu({ saaten: 20, saatZurueck: 1 }, ["streuGipfel"]),
                taeter: "phyto-core.js wetterAt (keine Gattung, kein Tagesgang)",
                nicht: "keine Wolkengattung",
                leser: "stamm/bild-himmel.js:1765 — die Kuppel liest nur cloudCover des Worts; kein Leser von Feuchte, Hebung, Stabilität",
                gruen: { werte: { gattungProzent: 82, cumulusGipfelProzent: 85, momente: 200, saaten: 20 }, zeuge: { saaten: 20, streuGipfel: 1.2, saatZurueck: 1 } },
                attrappen: [{ name: "Gipfel 15 Uhr aus der Erwartung", roh: leer({ gattungProzent: 82, cumulusGipfelProzent: 85, momente: 200, saaten: 20 }) }],
            },
            4: {
                u: { saisons: [0.125, 0.375, 0.625, 0.875], hoehenM: [0, 25, 50, 100, 200] },
                soll: [K.soll(WO, 4, "Phase am Boden passt zum Profil ≥ 90 %", { key: "phaseProzent", einheit: "%" }), K.soll(WO, 4, "Regenvorhang auf 5 km Kontrast ≥ 0,1", { key: "kontrast5km" })],
                zeuge: zMinStreu({ proben: 20 }, ["streuT"]),
                taeter: "foundry-core.js REGEN_GESETZ (nur Regen, keine Phase) · stamm/bild-himmel.js Regen",
                leser: "foundry-core.js:197 — REGEN_GESETZ kennt keine Phase (Schnee, Graupel): unter 0 °C fällt Regen",
                gruen: { werte: { phaseProzent: 95, kontrast5km: 0.15 }, zeuge: { proben: 20, streuT: 6, unterNull: 6, kameraFernM: 8000 } },
                attrappen: [{ name: "Phase 95 % ohne Temperatur", roh: leer({ phaseProzent: 95, kontrast5km: 0.15 }) }],
            },
            5: {
                u: {},
                soll: [
                    K.soll(WO, 5, "Sichtweite gegen Feuchte und Aerosol ±30 %", { key: "sichtNebelM", ref: 1000, refQuelle: "WMO: Nebel heißt Sicht < 1 km (WMO-Nr. 8, Teil I Kap. 9) — das Wort foggy gegen 1 000 m" }),
                    K.soll(WO, 5, "0 Erscheinungen ohne Ursache", { key: "ohneUrsache", rel: "≤", zahl: 0 }),
                    K.soll(WO, 5, "≥ 80 % der Ursachen zeigen ihre", { key: "ursachenProzent", einheit: "%" }),
                ],
                zeuge: zMinStreu({ worte: 5 }, ["streuSicht"]),
                taeter: "stamm/bild-sicht.js _luftSichtM (Sicht ≤ 22 km) · keine Erscheinungen",
                nicht: "Sicht 200 km, Regenbogen, Blitz, Staub",
                leser: "welt-licht.js:961 — die Luft trägt Dunst und Hof der Sonne, keinen Regenbogen, kein Halo der Eiswolke, keinen Blitz; die Kamera zeichnet wenige km (camera.far)",
                gruen: { werte: { sichtNebelM: 900, ohneUrsache: 0, ursachenProzent: 85 }, zeuge: { worte: 5, streuSicht: 6000 } },
                attrappen: [{ name: "Sicht 900 m aus der Tabelle", roh: leer({ sichtNebelM: 900, ohneUrsache: 0, ursachenProzent: 85 }) }],
            },
            6: {
                u: {},
                soll: [K.soll(WO, 6, "Positionsfehler ≤ 1 % der Höhe", { key: "positionsFehlerProzent", einheit: "%" }), K.soll(WO, 6, "kein Sprung > 5 % Luma", { key: "lumaSprungProzent", rel: "≤", zahl: 5, einheit: "%" })],
                zeuge: zMin({ schichten: 1 }),
                taeter: "welt-licht.js wolkenFeld (Kuppel, kein Volumen)",
                nicht: "keine durchfliegbare Wolke, kein Orbit",
                leser: "welt-licht.js:864 — WOLKEN_SCHICHT ist eine Projektion über dem Auge; scripts/werkbank.cjs /bild kennt keine Pose über der Wolke hinaus bis zum Orbit (camera.far wenige km)",
                gruen: { werte: { positionsFehlerProzent: 0.6, lumaSprungProzent: 3 }, zeuge: { schichten: 1 } },
                attrappen: [{ name: "Zoom ohne Flug", roh: leer({ positionsFehlerProzent: 0.6, lumaSprungProzent: 3 }) }],
            },
            7: {
                u: {},
                soll: [K.soll(WO, 7, "100 Himmelsbilder gegen Fotos: Trefferquote ≤ 60 %", { key: "trefferProzent", einheit: "%" })],
                auge: { pose: "Ego an der Mess-Wiese, bewölkt, Uhr 0,6", vorbild: "100 Himmelsfotos (WMO-Wolkenatlas, alle Gattungen), Trefferquote ≤ 60 %" },
                taeter: "welt-licht.js WOLKEN_SCHICHT (ein Feld)",
                nicht: "keine 10⁶ einzelnen Wolken",
                leser: "welt-licht.js:864 — EIN Wolkenfeld, keine Wolke als Ding",
                gruen: { werte: { trefferProzent: 55 }, zeuge: { schichten: 1 } },
                attrappen: [{ name: "Trefferquote ohne Bild", roh: leer({ trefferProzent: 55 }) }],
            },
        },
    };

    // ════════════════════════════════════════ KLIMAZONEN ════════════════════════════════════════
    const KZ = "planet.wetter.klimazonen";
    const klimazonen = {
        sek: 52,
        faecher: true,
        pfad: PFAD,
        mutiert: true,
        ungefahren: "die Bilder (Baum- und Schneegrenze im Bild, Bildpaar Juli/Januar, Orbitbild) schießt M.auge am Gerät; headless misst die Probe das Gesetz der Grenzen und den Faden",
        mess: async function (H, U, M) {
            const R = (v) => (Number.isFinite(v) ? Math.round(v * 1000) / 1000 : null);
            const u3 = U[3] || {}, u5 = U[5] || {};
            // DIE HEIMAT: Schnee- und Baumgrenze (gelaende-core `schnee` zur Saison der Welt, die Waldgrenze bei Schnee-Anteil 0,1 —
            // phyto-core forestWaldgrenze), die höchste Höhe binnen 6 km, die Jahreszeit (Sonne, Laub, Eis) Sommer gegen Winter
            const heim = await H.seite(`
const st = r.state, A = r.constructor, G = globalThis.__gelaendeCore, L = r._gelaende(), wl = Number.isFinite(st.waterLevel) ? st.waterLevel : 0;
const pm = (st.playerMesh || st.camera).position;
const linie = (v, thr) => { let lo = wl - 50, hi = wl + 4000; if (G.schnee(L, hi, pm.x, pm.z, v) < thr) return null; for (let i = 0; i < 40; i++) { const m = (lo + hi) / 2; if (G.schnee(L, m, pm.x, pm.z, v) >= thr) hi = m; else lo = m; } return hi - wl; };
const out = { schnee: linie(r._schneeGilt(), 0.5), baum: linie(0, 0.1), far: st.camera.far };
let hoch = -1e9;
for (let dx = -6000; dx <= 6000; dx += 300) for (let dz = -6000; dz <= 6000; dz += 300) { const y = r._terrainMacroSurfaceY(pm.x + dx, pm.z + dz); if (y > hoch) hoch = y; }
out.hoechsterM = hoch - wl;
const ph0 = st.seasonPhase, tod0 = st.timeOfDay, s0 = st._sonne ? Object.assign({}, st._sonne) : null;
const je = {};
try {
for (const [n, ph] of [["sommer", 0.375], ["winter", 0.875]]) {
st.seasonPhase = ph;
let maxY = -1, hell = 0;
for (let i = 0; i < 96; i++) { st.timeOfDay = i / 96; const y = r._sonnenRichtung().y; if (y > maxY) maxY = y; if (y > 0) hell++; }
je[n] = { sonneGrad: Math.asin(Math.max(-1, Math.min(1, maxY))) * 180 / Math.PI, tagStunden: hell / 4, laub: r._saisonPraesenz(ph, {}).x, eisAb: r._eisLinien().traegtAb };
}
} finally { st.seasonPhase = ph0; st.timeOfDay = tod0; if (s0) Object.assign(st._sonne, s0); r._eisLinien(); }
out.je = je;
out.zurueck = st.seasonPhase === ph0 && st.timeOfDay === tod0;
return out;
`);
            // DER FADEN: 30 Orte um den Anker der Heimat (Jahresamplitude gegen Küstenabstand), dann die Saaten (Köppen-Gruppen nach
            // Temperatur, Widersprüche, Wuchs je Breite) — Saat für Saat, bis die Uhr der Leiter das Budget schließt
            const faden = await H.seite(`
await r._fadenQuelle();
const G = globalThis.__gelaendeCore, t0 = performance.now();
const samen = r._planetSamen();
const abgelehnt = [];
let abgelehntN = 0;
const kl = (o) => { try { return G.ortGesetz(o).klimaHeute; } catch (e) { abgelehntN++; if (abgelehnt.length < 3) abgelehnt.push([o.samen, Math.round(o.breite), Math.round(o.laenge), String(o.delta && o.delta.klima && o.delta.klima.spendeVerh), String((e && e.message) || e).slice(0, 90)]); return null; } };
const anker = await r._planetAuftrag({ type: "planet-anker", samen });
const aB = anker.breite * 180 / Math.PI, aL = anker.laenge * 180 / Math.PI;
const orte = [];
for (let i = 1; i <= 120; i++) { const q = Math.sqrt(i / 120); orte.push([aB + 14 * q * Math.sin(i * 2.399), aL + 20 * q * Math.cos(i * 2.399)]); }
const a3 = await Promise.all(orte.map(([b, l]) => r._planetAuftrag({ type: "planet-ort", samen, breite: Math.max(-89, Math.min(89, b)), laenge: ((l + 540) % 360) - 180, zeitMa: 0 })));
const land3 = a3.filter((o) => o.land).map((o) => { const k = kl(o); return k ? [o.kuesteKm, k.sommer - k.winter, o.breite] : null; }).filter(Boolean).slice(0, ${Number(u3.orte) || 30});
const pk = [];
const NP = ${Number(u5.orte) || 20};
for (let i = 0; i < NP; i++) { const y = 1 - (2 * (i + 0.5)) / NP; pk.push([Math.asin(y) * 180 / Math.PI, (i * 137.508) % 360]); }
const saaten = [];
const budget = ${Number(u5.budgetMs) || 22000};
for (let k = 0; k < ${Number(u5.saaten) || 100}; k++) {
if (performance.now() - t0 > budget) break;
const s = "wetter-s" + k;
const a = await Promise.all(pk.map(([b, l]) => r._planetAuftrag({ type: "planet-ort", samen: s, breite: b, laenge: ((l + k * 17) % 360) - 180, zeitMa: 0 })));
saaten.push(a.map((o) => { if (!o.land) return [0, o.breite]; const kh = kl(o); if (!kh) return [2, o.breite]; return [1, o.breite, kh.sommer, kh.winter, kh.tagAmp, kh.spendeMm, o.delta.wuchs.decke]; }));
}
return { land3, anker: [aB, aL], saaten, ms: performance.now() - t0, version: a3[0].version, abgelehnt, abgelehntN };
`);
            const mittel = (x) => (x.length ? x.reduce((s, v) => s + v, 0) / x.length : NaN);
            const streu = (x) => (x.length > 1 ? Math.sqrt(mittel(x.map((v) => (v - mittel(x)) ** 2))) : 0);
            const rang = (x) => {
                const i = x.map((v, k) => [v, k]).sort((p, q) => p[0] - q[0]);
                const r = new Array(x.length);
                for (let k = 0; k < i.length; ) {
                    let e = k;
                    while (e + 1 < i.length && i[e + 1][0] === i[k][0]) e++;
                    for (let j = k; j <= e; j++) r[i[j][1]] = (k + e) / 2;
                    k = e + 1;
                }
                return r;
            };
            const spearman = (x, y) => {
                const a = rang(x), b = rang(y), ma = mittel(a), mb = mittel(b);
                let s = 0, sa = 0, sb = 0;
                for (let k = 0; k < a.length; k++) (s += (a[k] - ma) * (b[k] - mb)), (sa += (a[k] - ma) ** 2), (sb += (b[k] - mb) ** 2);
                return sa > 0 && sb > 0 ? s / Math.sqrt(sa * sb) : NaN;
            };
            const aus = M.teil || {};
            // S2 ÜBER DEN FÄCHER (stationen/faecher.js): Schnee- und Baumgrenze sind ein Gesetz der Höhe (gelaende-core `schnee`, Leser
            // stamm `_schneeGilt` und der Boden) — die Adresse ist die Welt im Band der Erd-Referenz (43–46°): die Heimat, wenn ihr Anker
            // dort liegt, und Reise-Welten an Land-Lagen des Bands (planet-ort → `_reiseSaat` → lageAus); je Adresse die Höhe über dem
            // Meer, an der der Schnee-Anteil 0,5 (Schnee, Saison der Welt) bzw. 0,1 (Wald, ohne Schnee) erreicht — die Grenze steht als
            // Funktion, auch wo kein Grund so hoch reicht
            const GRENZE_AN = async (r, T, a, mit) => {
                const G = globalThis.__gelaendeCore;
                await r._fadenQuelle();
                let L, wl, breite, x = 0, z = 0, saat;
                if (a.saat === "heim") {
                    const an = await r._planetAuftrag({ type: "planet-anker", samen: r._planetSamen() });
                    breite = (an.breite * 180) / Math.PI;
                    if (breite < mit.von || breite > mit.bis) return { ausserBand: true, breite };
                    L = r._gelaende();
                    wl = r.state.waterLevel;
                    const pm = (r.state.playerMesh || r.state.camera).position;
                    x = pm.x;
                    z = pm.z;
                    saat = L.seed;
                } else {
                    breite = mit.von + (((a.saat * 0.6180339887) % 1) * (mit.bis - mit.von));
                    const laenge = ((a.saat * 137.508) % 360) - 180;
                    const o = await r._planetAuftrag({ type: "planet-ort", samen: r._planetSamen(), breite, laenge, zeitMa: 0 });
                    if (!o || !o.land) return { meer: true, breite };
                    const heim = r.constructor._weltGesetz(r.state.worldMeta).gelaende;
                    const ort = { samen: o.samen, version: o.version, breite: o.breite, laenge: o.laenge, zeitMa: o.zeitMa, delta: o.delta };
                    const O = G.ortGesetz(ort), eg = G.erbgutNormal(G.ortErbgut(G.erbgutNormal(heim == null ? undefined : heim), o.delta.wildnis));
                    saat = r._reiseSaat(ort, heim);
                    wl = G.GRUND.basis - O.meerUnterBasisM;
                    L = G.lageAus({ seed: saat, baseHeight: G.GRUND.basis, waterLevel: wl, ort, erbgut: { terme: eg, wildnis: eg[0] && eg[0].art === "wildnis" ? 1 : 0 }, regionSize: G.GRUND.kachel }, SimplexNoise);
                }
                const linie = (v, thr) => {
                    let lo = wl - 50, hi = wl + mit.bisM;
                    if (G.schnee(L, hi, x, z, v) < thr) return null;
                    for (let i = 0; i < 40; i++) { const m = (lo + hi) / 2; if (G.schnee(L, m, x, z, v) >= thr) hi = m; else lo = m; }
                    return hi - wl;
                };
                return { saat, breite: Math.round(breite * 100) / 100, schnee: linie(r._schneeGilt(), 0.5), baum: linie(0, 0.1) };
            };
            const med2 = (v) => { const b = v.filter(Number.isFinite).sort((p, q) => p - q); return b.length ? (b.length % 2 ? b[(b.length - 1) / 2] : (b[b.length / 2 - 1] + b[b.length / 2]) / 2) : null; };
            const u2 = U[2] || {};
            const RF = await FAECHER((c) => H.seite(c), {
                gesetz: { fn: GRENZE_AN, export: "gelaende-core.js schnee (die Kühlung gelaende-core.js:5918 kuehlungKJeM) an der Lage der Welt", leser: "stamm _schneeGilt und der Boden (stamm/gelaende-boden.js:833 _gelaende)" },
                adressen: { saaten: Array.from({ length: Number(u2.saaten) || 16 }, (_, i) => i + 1), dazu: [{ saat: "heim", ort: null, zeit: null }] },
                mit: { von: 43, bis: 46, bisM: 6000 },
                ms: Number(u2.ms) || 6000,
                masse: {
                    schnee: { wie: med2, feld: "schnee", nur: (a, w) => w.schnee != null },
                    baum: { wie: med2, feld: "baum", nur: (a, w) => w.baum != null },
                    grenzen: { wie: "anzahl", feld: "saat", nur: (a, w) => w.schnee != null && w.baum != null },
                    welten: { wie: "verschieden", feld: "saat", nur: (a, w) => w.schnee != null },
                    bMin: { wie: "min", feld: "breite", nur: (a, w) => w.schnee != null },
                    bMax: { wie: "max", feld: "breite", nur: (a, w) => w.schnee != null },
                },
                schlecht: { feld: "schnee", richtung: "min" },
                pose: (a, w) => "Ego in der Welt " + w.saat + " (" + w.breite + "°), Blick zum höchsten Grund, Mittag",
                ungemessen: ["die Grenzen im Bild gegen das Foto eines Gebirges gleicher Breite (Beleg, am Gerät)"],
            });
            aus[2] = {
                werte: { schneegrenzeM: R(RF.werte.schnee), baumgrenzeM: R(RF.werte.baum), hoechsterM: R(heim.hoechsterM) },
                zeuge: { grenzen: RF.werte.grenzen || 0, welten: RF.werte.welten || 0, breiteMin: R(RF.werte.bMin), breiteMax: R(RF.werte.bMax), abstandM: R(Math.abs((RF.werte.schnee || 0) - (RF.werte.baum || 0))), breiteAnkerGrad: R(faden.anker[0]), adressen: RF.adressen, gerissen: RF.gerissen },
                auge: await M.auge("wetter-klima-s2", { ort: "wiese" }, { uhr: 0.5 }),
                taeter: "gelaende-core.js:5918 kuehlungKJeM (die Höhe gestaucht: 18 K ÷ 162,5 m = 0,11 K/m, Erde 0,0065 K/m) · " + RF.akte,
            };
            // S3 Kontinentalität: Spearman der Jahresamplitude gegen den Küstenabstand an 30 Land-Orten um den Anker
            const l3 = faden.land3;
            aus[3] = {
                werte: { rang: R(spearman(l3.map((x) => x[0]), l3.map((x) => x[1]))), orte: l3.length },
                zeuge: { orte: l3.length, streuAmplitude: R(streu(l3.map((x) => x[1]))), streuKuesteKm: R(streu(l3.map((x) => x[0]))), anker: faden.anker.map(R), version: faden.version },
            };
            // S4 die Jahreszeit der Heimat: Tageslänge, Sonnenhöhe, Laub, Eis Sommer gegen Winter (Nordhalbkugel, Breite des Ankers)
            const S = heim.je.sommer, Wn = heim.je.winter;
            const richtig = [S.tagStunden > Wn.tagStunden, S.sonneGrad > Wn.sonneGrad, S.laub > Wn.laub, Wn.eisAb < S.eisAb];
            aus[4] = {
                werte: { breitenRichtig: richtig.every(Boolean) ? 1 : 0, richtungenRichtig: richtig.filter(Boolean).length, tagSommerH: R(S.tagStunden), tagWinterH: R(Wn.tagStunden), sonneSommerGrad: R(S.sonneGrad), sonneWinterGrad: R(Wn.sonneGrad) },
                zeuge: { je: heim.je, zurueck: heim.zurueck ? 1 : 0 },
                auge: await M.auge("wetter-klima-s4", { ort: "wiese" }, { uhr: 0.5 }),
                nicht: "die Sonnenbahn kennt weder Jahr noch Breite (welt-licht.js:711 sonnenRichtung — Tageslänge und Mittagshöhe gleich im Juli und Januar), und die Welt steht an EINER Breite (die Reise an andere Breiten trägt die Sonne nicht)",
            };
            // S5 Köppen: die Gruppe E (wärmster Monat < 10 °C, Peel 2007) aus den Temperaturen der Spieldaten über die Saaten; die Klasse
            // selbst trägt der Faden nicht
            const landOrte = [].concat(...faden.saaten.map((s) => s.filter((x) => x[0] === 1)));
            const alleOrte = [].concat(...faden.saaten);
            const fE = landOrte.length ? (100 * landOrte.filter((x) => x[2] < 10).length) / landOrte.length : NaN;
            const fA = landOrte.length ? (100 * landOrte.filter((x) => x[3] >= 18).length) / landOrte.length : NaN;
            aus[5] = {
                werte: { flaecheE: R(fE), flaecheA: R(fA), saaten: faden.saaten.length, landOrte: landOrte.length },
                zeuge: { saaten: faden.saaten.length, landOrte: landOrte.length, streuSommer: R(streu(landOrte.map((x) => x[2]))), ms: R(faden.ms), abgelehnt: faden.abgelehntN, abgelehntJe: faden.abgelehnt },
                nicht: "der Faden trägt keine Köppen-Klasse (voxel-worker.js:1175 planetOrtAuftrag gibt planet-core o.biom nicht weiter) und keinen Niederschlag (spendeMm ist der Abfluss) — die Gruppe B ist nicht bestimmbar, die Klasse aus Spieldaten hat keinen Leser",
            };
            // S6 das Orbitbild: kein Orbit; gemessen der Wuchs je Breite (die Farbe des Landes folgt ihm)
            const decke = landOrte.map((x) => x[6]).filter(Number.isFinite);
            aus[6] = {
                werte: { deckeMittel: R(mittel(decke)), deckeStreu: R(streu(decke)) },
                zeuge: { landOrte: landOrte.length, streuDecke: R(streu(decke)) },
                auge: await M.auge("wetter-klima-s6", { ort: "wiese" }, { uhr: 0.5 }),
                nicht: "kein Orbitbild: die Werkbank kennt keine Pose über der Atmosphäre (scripts/werkbank.cjs /bild, camera.far " + heim.far + " m)",
            };
            // S7 kein sichtbarer Widerspruch: Winter wärmer als Sommer, Wald auf Eis, Temperaturen jenseits der Physik
            const wid = landOrte.filter((x) => x[3] > x[2] + 0.01 || (x[2] < 0 && x[6] > 0.3) || x[2] > 50 || x[3] < -90 || x[4] < 0);
            aus[7] = {
                werte: { ohneWiderspruchProzent: landOrte.length ? R(100 - (100 * wid.length) / landOrte.length) : null, saaten: faden.saaten.length, orte: alleOrte.length && faden.saaten.length ? R(alleOrte.length / faden.saaten.length) : 0 },
                zeuge: { landOrte: landOrte.length, widerspruch: wid.length, beispiel: wid.slice(0, 3), abgelehnt: faden.abgelehntN },
                auge: await M.auge("wetter-klima-s7", { ort: "wiese" }, { uhr: 0.4 }),
            };
            return { sprossen: aus };
        },
        sprossen: {
            2: {
                u: { referenzBreite: "das Band der Erd-Referenz 43–46° (Heimat, wenn ihr Anker dort liegt, und 16 Reise-Welten an Land-Lagen des Bands)", saaten: 16, ms: 6000 },
                soll: [
                    K.soll(KZ, 2, "Baum- und Schneegrenze im Bild auf Erd-Höhe ihrer Breite ±20 %", { key: "schneegrenzeM", ref: 2900, refQuelle: "Erde 43–46° N: Schneegrenze ≈ 2 900 m (Gleichgewichtslinie der Alpen, Ohmura, Kasser & Funk 1992)", einheit: "m" }),
                    K.soll(KZ, 2, "Baum- und Schneegrenze im Bild auf Erd-Höhe ihrer Breite ±20 %", { key: "baumgrenzeM", ref: 2100, refQuelle: "Erde 43–46° N: Baumgrenze ≈ 2 100 m (Körner & Paulsen 2004, J. Biogeogr.)", einheit: "m" }),
                ],
                auge: { pose: "Ego an der Mess-Wiese, Blick zum höchsten Grund, Mittag", vorbild: "Foto eines Gebirges gleicher Breite (Pyrenäen/Alpen) mit Baum- und Schneegrenze" },
                taeter: "gelaende-core.js TEMPERATUR (Höhe gestaucht, 0,11 K/m)",
                leser: "gelaende-core.js:5918 kuehlungKJeM — die Kühlung 18 K ÷ 162,5 m = 0,11 K/m (Erde 0,0065 K/m): Schnee- und Baumgrenze liegen bei ~150 m statt 2 000–3 000 m; der Fächer liest gelaende-core schnee an der Lage jeder Welt im Band",
                // ZAHL (auge-klasse.cjs): die Station urteilt die Zahl, das Bild ist Beleg
                // DIE QUELLE DER ERD-REFERENZ IN DER STATION (pm-front-f1): ref 2 900 / 2 100 m gilt nur für 43–46° N (Alpen, die refQuelle) —
                // der Zeuge trägt die Breite des Ankers, den der Faden der Welt nennt (planet-anker); steht er außerhalb des Bands (andere
                // Messungen sahen −45,5°), vergliche die Sprosse gegen eine Erd-Höhe ohne Quelle für ihre Breite
                // der Zeuge: ≥ 8 Adressen mit beiden Grenzen in ≥ 4 Welten, jede gemessene Welt im Band der Erd-Referenz (43–46° N)
                zeuge: (roh) => {
                    const f = zMin({ grenzen: 8, welten: 4 })(roh);
                    if (f) return f;
                    const a = roh.zeuge.breiteMin, b = roh.zeuge.breiteMax;
                    if (!(typeof a === "number" && Number.isFinite(a) && typeof b === "number" && Number.isFinite(b))) return "die Breiten der Adressen fehlen — die Erd-Referenz 43–46° N hat keinen Ort";
                    if (a < 43 || b > 46) return "gemessen auf " + a + "°–" + b + "° — die Erd-Referenz (Alpen, Ohmura 1992 · Körner & Paulsen 2004) gilt für 43–46° N, für diese Breite trägt die Station keine Quelle";
                    return null;
                },
                zeugeText: "Schnee- und Baumgrenze an ≥ 8 Adressen in ≥ 4 Welten des Bands 43–46° N",
                gruen: { werte: { schneegrenzeM: 2800, baumgrenzeM: 2000 }, zeuge: { grenzen: 14, welten: 13, breiteMin: 43.1, breiteMax: 45.9, abstandM: 800 } },
                attrappen: [
                    { name: "die Grenzen aus der Erd-Tabelle", roh: leer({ schneegrenzeM: 2800, baumgrenzeM: 2000 }) },
                    { name: "Erd-Höhe an der Südhalbkugel (−45,5°)", roh: { werte: { schneegrenzeM: 2800, baumgrenzeM: 2000 }, zeuge: { grenzen: 14, welten: 13, breiteMin: -46, breiteMax: -45, abstandM: 800 } } },
                    { name: "EINE Welt trägt die Grenzen", roh: { werte: { schneegrenzeM: 2800, baumgrenzeM: 2000 }, zeuge: { grenzen: 14, welten: 1, breiteMin: 43.4, breiteMax: 43.4, abstandM: 800 } } },
                ],
                proben: [{ name: "die gestauchte Höhe: Schnee 150 m gegen 2 900 m (ROT beim Täter)", roh: { werte: { schneegrenzeM: 150, baumgrenzeM: 120 }, zeuge: { grenzen: 14, welten: 13, breiteMin: 43.1, breiteMax: 45.9, abstandM: 30 }, taeter: "gelaende-core.js:5918 kuehlungKJeM" } }],
            },
            3: {
                u: { orte: 30, radiusGrad: [14, 20] },
                soll: [K.soll(KZ, 3, "Jahresamplitude gegen Meeresabstand Rang ≥ 0,7 an 30 Orten", { key: "rang" }), K.soll(KZ, 3, "Jahresamplitude gegen Meeresabstand Rang ≥ 0,7 an 30 Orten", { key: "orte", rel: "≥", zahl: 30 })],
                zeuge: zMinStreu({ orte: 30 }, ["streuAmplitude", "streuKuesteKm"]),
                taeter: "planet-core.js planetKlimaR (Kontinentalität) über voxel-worker.js planetOrtAuftrag",
                gruen: { werte: { rang: 0.78, orte: 30 }, zeuge: { orte: 30, streuAmplitude: 6.5, streuKuesteKm: 420 } },
                attrappen: [
                    { name: "Rang 0,78 ohne Faden", roh: leer({ rang: 0.78, orte: 30 }) },
                    { name: "30-mal derselbe Ort", roh: { werte: { rang: 0.78, orte: 30 }, zeuge: { orte: 30, streuAmplitude: 0, streuKuesteKm: 0 } } },
                ],
            },
            4: {
                u: { sommer: 0.375, winter: 0.875 },
                soll: [K.soll(KZ, 4, "Bildpaar Juli/Januar an 3 Breiten", { key: "breitenRichtig", rel: "≥", zahl: 3 })],
                auge: { pose: "Ego an der Mess-Wiese Mittag, Bildpaar Sommer/Winter (die Bühne setzt die Saison)", vorbild: "Fotopaare Juli/Januar an 3 Breiten (Tromsø, München, Darwin)" },
                taeter: "welt-licht.js sonnenRichtung (keine Bahn aus Jahr × Breite)",
                nicht: "keine Sonnenbahn aus Jahr und Breite, eine Breite",
                leser: "welt-licht.js:711 — sonnenRichtung(winkel) liest weder Saison noch Breite (die Bahn nach Meeus Kap. 13 steht OFFEN)",
                // ZAHL (auge-klasse.cjs): die Station urteilt die Zahl, das Bild ist Beleg
                zeuge: zMin({ zurueck: 1 }),
                zeugeText: "Juli und Januar gesetzt und zurück",
                gruen: { werte: { breitenRichtig: 3 }, zeuge: { zurueck: 1 } },
                attrappen: [{ name: "3 Breiten behauptet", roh: leer({ breitenRichtig: 3 }) }],
            },
            5: {
                u: { saaten: 100, orte: 20, budgetMs: 22000, gruppe: "E: wärmster Monat < 10 °C (Peel, Finlayson & McMahon 2007)" },
                soll: [
                    K.soll(KZ, 5, "Klasse aus Spieldaten = Klasse aus Lage ≥ 80 %", { key: "klasseProzent", einheit: "%" }),
                    K.soll(KZ, 5, "Flächenanteile über 100 Saaten ±50 % der Erde", { key: "flaecheE", ref: 12.8, refQuelle: "Peel, Finlayson & McMahon 2007: Gruppe E 12,8 % der Landfläche der Erde" }),
                    K.soll(KZ, 5, "Flächenanteile über 100 Saaten ±50 % der Erde", { key: "saaten", rel: "≥", zahl: 100 }),
                    K.soll(KZ, 5, "50 Zufallsorte", { key: "zufallsorte", rel: "≥", zahl: 50 }),
                ],
                zeuge: zMinStreu({ saaten: 30, landOrte: 100 }, ["streuSommer"]),
                taeter: "voxel-worker.js planetOrtAuftrag (die Köppen-Klasse fällt am Faden)",
                nicht: "keine Köppen-Klasse und kein Niederschlag im Faden",
                leser: "voxel-worker.js:1175 — planetOrtAuftrag gibt o.biom.koeppen (planet-core.js:2338) und den Niederschlag nicht weiter; kein Leser der Klasse im Spiel",
                gruen: { werte: { klasseProzent: 84, flaecheE: 14, saaten: 100, zufallsorte: 50 }, zeuge: { saaten: 100, landOrte: 600, streuSommer: 9 } },
                attrappen: [{ name: "Köppen 84 % aus einer Tabelle", roh: leer({ klasseProzent: 84, flaecheE: 14, saaten: 100, zufallsorte: 50 }) }],
            },
            6: {
                u: {},
                soll: [K.soll(KZ, 6, "Farbverteilung je Breite r ≥ 0,7 gegen Blue-Marble-Mosaik", { key: "farbeR" })],
                auge: { pose: "Orbit über dem Planeten (heute nicht erzeugbar; geschossen an der Mess-Wiese)", vorbild: "Blue-Marble-Mosaik (NASA 2004), Farbe je Breite" },
                taeter: "scripts/werkbank.cjs /bild (keine Orbit-Pose)",
                nicht: "kein Orbitbild",
                leser: "scripts/werkbank.cjs:2110 /bild — keine Pose über der Atmosphäre (camera.far wenige km)",
                gruen: { werte: { farbeR: 0.75 }, zeuge: { landOrte: 600, streuDecke: 0.3 } },
                attrappen: [{ name: "r 0,75 ohne Bild", roh: leer({ farbeR: 0.75 }) }],
            },
            7: {
                u: { saaten: 100, orte: 20 },
                soll: [
                    K.soll(KZ, 7, "1 000 Saaten × 50 Orte: kein sichtbarer Widerspruch in ≥ 95 %", { key: "ohneWiderspruchProzent", einheit: "%" }),
                    K.soll(KZ, 7, "1 000 Saaten × 50 Orte: kein sichtbarer Widerspruch in ≥ 95 %", { key: "saaten", rel: "≥", zahl: 1000 }),
                    K.soll(KZ, 7, "1 000 Saaten × 50 Orte: kein sichtbarer Widerspruch in ≥ 95 %", { key: "orte", rel: "≥", zahl: 50 }),
                ],
                auge: { pose: "Ego an der Mess-Wiese (die Reise an 50 Orte je Saat steht am Gerät aus)", vorbild: "Prüfer-Satz R11: Widerspruch ja/nein an Bildern der Orte" },
                taeter: "planet-core.js planetKlimaR über voxel-worker.js planetOrtAuftrag",
                gruen: { werte: { ohneWiderspruchProzent: 97, saaten: 1000, orte: 50 }, zeuge: { landOrte: 20000, widerspruch: 300 } },
                attrappen: [{ name: "97 % ohne Faden", roh: leer({ ohneWiderspruchProzent: 97, saaten: 1000, orte: 50 }) }],
            },
        },
    };

    // ════════════════════════════════════════ EXTREME ════════════════════════════════════════
    const EX = "planet.wetter.extreme";
    const extreme = {
        sek: 36,
        faecher: true,
        pfad: PFAD,
        mutiert: true,
        ungefahren: "die Bildpaare (Flut, Sandsturm, Megastadt) schießt M.auge am Gerät; p95 headless ist die Zeit des Software-Renderers, nicht des Geräts",
        mess: async function (H, U, M) {
            const R = (v) => (Number.isFinite(v) ? Math.round(v * 1000) / 1000 : null);
            const u3 = U[3] || {}, u4 = U[4] || {};
            // DAS WETTER DER HEIMAT ÜBER JAHRE: die Folge am Ort im Takt des Zugs; der Regen je Takt (Kanal rain × 10 mm je Stunde der
            // Welt-Uhr, gelaende-core PEGEL: „der Regen der Stärke 1 mit 10 mm je Stunde“), die Strecken der Sonne, die Temperatur
            // der Worte (gelaende-core temperaturAus mit dem Feld des Worts), der Pegel, die Sicht im Sturm, die Telekonnektion
            const welt = await H.seite(`
const st = r.state, wm = st.worldMeta, A = r.constructor, Z = A.WETTER_ZUG_SEK, G = globalThis.__gelaendeCore, P = globalThis.__phytoCore;
const FELD = A.WEATHER_FIELD, tagS = r._kalender().normS, stundeS = tagS / 24, jahrS = r._kalender().jahrK, s0 = wm.seed;
const wl = Number.isFinite(st.waterLevel) ? st.waterLevel : 0;
const mmJeTakt = (w) => FELD[w].rain * 10 * (Z / stundeS);
const jahre = ${Number(u3.jahre) || 100}, jeJahr = Math.max(1, Math.round(jahrS / Z));
const W = [];
for (let i = 0; i < jahre * jeJahr; i++) W.push(r._wetterAmOrt(0, 0, i * Z));
const jahrMax = [];
let lauf = 0, maxAll = 0;
for (let y = 0; y < jahre; y++) { let m = 0; for (let i = y * jeJahr; i < (y + 1) * jeJahr; i++) { const mm = mmJeTakt(W[i]); lauf = mm > 0 ? lauf + mm : 0; if (lauf > m) m = lauf; } jahrMax.push(m); if (m > maxAll) maxAll = m; }
const sonnig = [];
for (let i = 0; i < W.length; ) { if (W[i] === "sunny") { let e = i; while (e < W.length && W[e] === "sunny") e++; sonnig.push(((e - i) * Z) / tagS); i = e; } else i++; }
const Tw = {};
for (const w of Object.keys(FELD)) Tw[w] = G.temperaturAus(r._temperaturFeld(wl), 0.375, 0.6, FELD[w]);
const freq = {};
for (const w of W) freq[w] = (freq[w] || 0) + 1;
let tMittel = 0;
for (const w of Object.keys(freq)) tMittel += (Tw[w] * freq[w]) / W.length;
const tele = [];
try {
for (let k = 0; k < ${Number(u4.saaten) || 100}; k++) {
wm.seed = "wetter-s" + k;
const g = P.windGrund(wm.seed), qx = -g.z, qz = g.x, D = 5000000;
const a = [], b = [];
for (let y = 0; y < 30; y++) { let na = 0, nb = 0; for (let i = 0; i < jeJahr; i++) { const t = (y * jeJahr + i) * Z; if (r._weatherIsWet(r._wetterAmOrt(0, 0, t))) na++; if (r._weatherIsWet(r._wetterAmOrt(D * qx, D * qz, t))) nb++; } a.push(na / jeJahr); b.push(nb / jeJahr); }
tele.push([a, b]);
}
} finally { wm.seed = s0; }
const sichtSturm = -Math.log(A.LUFT.kontrast) / r._luftBeta(FELD.stormy);
return { jahrMax, maxAll, sonnig, Tw, tMittel, tele, sichtSturm, saatZurueck: wm.seed === s0, jeJahr, stundeS, worte: Object.keys(freq).length };
`);
            // die Bild-Zeit über 2,5 s im Wetter der Welt (requestAnimationFrame) — headless die Zeit des Software-Renderers
            const takt = await H.seite(`
const d = [];
await new Promise((fertig) => { let v = performance.now(); const t0 = v; const f = (n) => { d.push(n - v); v = n; if (n - t0 < 2500) requestAnimationFrame(f); else fertig(); }; requestAnimationFrame(f); setTimeout(fertig, 4000); });
d.sort((a, b) => a - b);
return { n: d.length, p95: d.length ? d[Math.min(d.length - 1, Math.floor(0.95 * d.length))] : null };
`).catch((e) => ({ n: 0, grund: String((e && e.message) || e).slice(0, 160) }));
            const mittel = (x) => (x.length ? x.reduce((s, v) => s + v, 0) / x.length : NaN);
            const streu = (x) => (x.length > 1 ? Math.sqrt(mittel(x.map((v) => (v - mittel(x)) ** 2))) : 0);
            const pearson = (x, y) => {
                const mx = mittel(x), my = mittel(y);
                let a = 0, b = 0, c = 0;
                for (let i = 0; i < x.length; i++) (a += (x[i] - mx) * (y[i] - my)), (b += (x[i] - mx) ** 2), (c += (y[i] - my) ** 2);
                return b > 0 && c > 0 ? a / Math.sqrt(b * c) : 0;
            };
            const aus = M.teil || {};
            // S1 DIE FLUT AM FÄCHER (M4): je Adresse (Saat × Jahr der Welt-Uhr) die stärkste nasse Strecke des Jahrs am Ort (Kanal
            // rain × 10 mm je Stunde) und der Pegel, den das Gesetz danach trägt — die Stempel des Regens (je Takt des Zugs der Knoten
            // [t, rain], ab dem Fenster des Grunds vor der Strecke) durch gelaende-core pegelLauf → pegelTafel → pegelHub, den Leser
            // des Spiegels jedes Flusses und Sees, über die Lag-Klassen und die Höhen ohne Schmelze, je Stunde nach der Strecke. Die
            // Höhe über der Aue ist der Hub über der Krone des Betts (die Aue liegt an der Krone)
            const u1 = U[1] || {};
            const FLUT_AN = async (r, T, a, mit) => {
                const st = r.state, wm = st.worldMeta, A = r.constructor, Z = A.WETTER_ZUG_SEK, s0 = wm.seed, k0 = r._regenKlima, G = globalThis.__gelaendeCore;
                const FELD = A.WEATHER_FIELD, kal = r._kalender(), tagS = kal.normS, stundeS = tagS / 24, jeJahr = Math.max(1, Math.round(kal.jahrK / Z));
                const L = r._gelaende(), nT = G.TEMPERATUR.jahrTage, tag = Math.floor(st.seasonPhase * nT) / nT;
                const sch = G.pegelSchmelze(L, tag, (y, tr) => r._temperaturFeld(y, tr));
                try {
                    if (a.saat != null) wm.seed = "wetter-s" + a.saat;
                    const memo = mit.memo || (mit.memo = {});
                    let M0 = memo[String(a.saat)];
                    if (!M0) {
                        r._regenKlima = null;
                        M0 = memo[String(a.saat)] = { mittel: r._regenMittel(), W: [] };
                    }
                    const mittel = M0.mittel, i0 = (a.zeit || 0) * jeJahr, ab = Math.max(0, i0 - Math.ceil((G.LAUF.fenster * tagS) / Z));
                    while (M0.W.length < i0 + jeJahr) M0.W.push(r._wetterAmOrt(0, 0, M0.W.length * Z));
                    const W = M0.W.slice(ab, i0 + jeJahr);
                    let best = null, lauf = 0, von = 0;
                    for (let i = i0 - ab; i < W.length; i++) {
                        const mm = FELD[W[i]].rain * mit.mmJeStunde * (Z / stundeS);
                        if (mm > 0) { if (lauf === 0) von = i; lauf += mm; if (!best || lauf > best.mm) best = { mm: lauf, von, bis: i }; } else lauf = 0;
                    }
                    if (!best) return { saat: a.saat, jahr: a.zeit, mm: 0, hub: null, krone: null, ueber: null };
                    const S = [];
                    for (let i = 0; i <= Math.min(W.length - 1, best.bis + 1); i++) S.push((ab + i) * Z, FELD[W[i]].rain);
                    // die Höhe ohne Schmelze (dort trägt nur der Regen den Hub; jede solche Zeile hebt sich gleich), sonst die unterste
                    const ende = (ab + best.bis + 1) * Z, iy = Math.max(0, Array.prototype.findIndex.call(sch.a, (v) => v === 0)), y = sch.y0 + iy * G.PEGEL.dy;
                    let hub = null, krone = null, nach = null;
                    for (const h of mit.stunden) {
                        const tafel = G.pegelTafel(L, sch, G.pegelLauf(L, S, ende + h * stundeS, tagS, mittel, null));
                        if (!tafel) continue;
                        krone = tafel.krone;
                        for (let j = 0; j < G.LAUF.n; j++) { const v = G.pegelHub({ pegel: tafel }, y, j); if (hub == null || v > hub) { hub = v; nach = h; } }
                    }
                    return { saat: a.saat, jahr: a.zeit, mm: Math.round(best.mm * 10) / 10, takte: best.bis - best.von + 1, hub, krone, ueber: hub != null && krone != null ? Math.round((hub - krone) * 1000) / 1000 : null, nach, mittel, schmelze: sch.a[iy] > 0 ? 1 : 0 };
                } finally {
                    wm.seed = s0;
                    r._regenKlima = k0;
                }
            };
            const streu0 = (x) => { const m = x.length ? x.reduce((s, v) => s + v, 0) / x.length : 0; return x.length > 1 ? Math.sqrt(x.reduce((s, v) => s + (v - m) ** 2, 0) / x.length) : 0; };
            const stark = Number(u1.starkMm) || 100;
            const RF = await FAECHER((c) => H.seite(c), {
                gesetz: { fn: FLUT_AN, export: "gelaende-core.js:1658 pegelLauf → pegelTafel → gelaende-core.js:1796 pegelHub (der Hub gelaende-core.js:1627 pegelHubVon)", leser: "stamm/wasser-hydro.js:313 (der Spiegel liest K.pegelHub) · stamm/wasser-hydro.js:117 _pegelGilt" },
                adressen: { saaten: Array.from({ length: Number(u1.saaten) || 20 }, (_, i) => i), zeiten: Array.from({ length: Number(u1.jahre) || 30 }, (_, i) => i), dazu: [{ saat: null, ort: null, zeit: 0 }] },
                mit: { mmJeStunde: Number(u1.mmJeStunde) || 10, stunden: [0, 1, 2, 4, 8, 16, 32, 64] },
                ms: Number(u1.ms) || 14000,
                masse: {
                    adressen: { wie: "anzahl", feld: "mm" },
                    saaten: { wie: "verschieden", feld: "a.saat" },
                    regenMaxMm: { wie: "max", feld: "mm" },
                    stark: { wie: "anzahl", feld: "mm", nur: (a, w) => w.mm >= stark },
                    ueberAueM: { wie: "max", feld: "ueber", nur: (a, w) => w.mm >= stark && w.ueber != null },
                    bordvoll: { wie: "anzahl", feld: "ueber", nur: (a, w) => w.ueber != null && w.ueber >= -0.005 },
                    hubMaxM: { wie: "max", feld: "hub" },
                    kroneM: { wie: "erste", feld: "krone" },
                    streuMm: { wie: (v) => streu0(v), feld: "mm" },
                    schmelze: { wie: "summe", feld: "schmelze" },
                },
                schlecht: { feld: "mm", richtung: "max" },
                pose: (a, w) => "Ego am Fluss der Mess-Wiese unter der Saat " + (a.saat == null ? "der Welt" : "wetter-s" + a.saat) + ", Jahr " + a.zeit + ", " + w.nach + " h nach " + w.mm + " mm Regen (" + w.takte + " Takte), Blick über die Aue",
                ungemessen: ["das Bild der Aue unter Wasser (die Welt zeichnet den Spiegel, den pegelHub trägt — über der Krone nie)"],
            });
            aus[1] = {
                werte: { regenMaxMm: R(RF.werte.regenMaxMm), ueberAueM: RF.werte.ueberAueM == null ? null : R(RF.werte.ueberAueM), kroneM: R(RF.werte.kroneM) },
                zeuge: { adressen: RF.werte.adressen, saaten: RF.werte.saaten, stark: RF.werte.stark, bordvoll: RF.werte.bordvoll, streu: R(RF.werte.streuMm), hubMaxM: R(RF.werte.hubMaxM), gerissen: RF.gerissen, akte: RF.akte },
                auge: await M.auge("wetter-extreme-s1", { ort: "wiese" }, { wetter: "stormy" }),
                taeter: (RF.fehler.length && !RF.gemessen ? "Leser fehlt: " + RF.fehler[0].fehler + " · " : "") + "gelaende-core.js:1627 pegelHubVon deckelt den Hub an der Krone (Math.min(krone, h)), " + RF.werte.bordvoll + " von " + RF.gemessen + " Adressen bordvoll, " + RF.werte.stark + " mit ≥ " + stark + " mm — die Aue trägt den Überschuss „nicht gerechnet“ (gelaende-core.js:1569) · " + RF.akte,
            };
            // S2 die Hitzewelle: die längste Strecke klarer Worte (Spieltage) und der Überschuss der Temperatur des klaren Worts über
            // das Mittel der Worte (Sommer, Nachmittag)
            aus[2] = {
                werte: { dauerTage: R(Math.max(0, ...welt.sonnig)), amplitudeK: R(welt.Tw.sunny - welt.tMittel) },
                zeuge: { strecken: welt.sonnig.length, streuDauer: R(streu(welt.sonnig)), streuT: R(streu(Object.values(welt.Tw))), worte: welt.worte },
            };
            // S3 die Wiederkehr: Gumbel über die Jahresmaxima des Strecken-Regens (Momente), x100 ÷ x2 gegen die Erd-Erwartung
            const jm = welt.jahrMax;
            const m = mittel(jm), sd = streu(jm), beta = (sd * Math.sqrt(6)) / Math.PI, mu = m - 0.5772 * beta;
            const xT = (T) => mu + beta * -Math.log(-Math.log(1 - 1 / T));
            const ERW = Number(u3.erwartungMm) || 100;
            const q = xT(100) > 0 ? xT(100) / ERW : NaN;
            aus[3] = {
                werte: { faktor: Number.isFinite(q) && q > 0 ? R(Math.max(q, 1 / q)) : null, x100Mm: R(xT(100)), x2Mm: R(xT(2)), jahre: jm.length },
                zeuge: { jahre: jm.length, streu: R(sd), saatZurueck: welt.saatZurueck ? 1 : 0 },
            };
            // S4 die Telekonnektion: Regen-Anteil je Jahr an A und 5 000 km quer zum Zug, Median |r| über 100 Saaten
            const rs = welt.tele.map(([a, b]) => Math.abs(pearson(a, b))).sort((x, y) => x - y);
            aus[4] = {
                werte: { rBetrag: R(rs[Math.floor(rs.length / 2)]), saaten: rs.length },
                zeuge: { saaten: rs.length, streu: R(streu(rs)) },
                nicht: "kein Ozean-Index (warmes Meer hier → Dürre dort): das Wetter kennt kein Meer und keine Temperatur der See (phyto-core.js:4423 wetterAt)",
            };
            // S5 der Sandsturm: kein Wort der Welt; die Sicht im Sturm
            aus[5] = {
                werte: { sichtSturmM: R(welt.sichtSturm) },
                zeuge: { worte: welt.worte },
                auge: await M.auge("wetter-extreme-s5", { ort: "wiese" }, { wetter: "stormy" }),
                nicht: "kein Sandsturm, kein Blizzard, kein Wirbelsturm-Landfall: die Wetter-Tafel trägt 5 Worte (stamm/daten.js:112 WEATHER_FIELD), die Sicht im Sturm " + R(welt.sichtSturm) + " m",
            };
            // S6 die Katastrophe in der Megastadt: kein Hurrikan; die Bild-Zeit headless
            aus[6] = {
                werte: Object.assign({}, Number.isFinite(takt.p95) ? { p95Ms: R(takt.p95) } : {}),
                zeuge: { bilder: takt.n || 0, grund: takt.grund || null },
                auge: await M.auge("wetter-extreme-s6", { ort: "wiese" }, { wetter: "stormy" }),
                nicht: "kein Hurrikan und kein Sandsturm, keine Megastadt mit 10⁵ Dingen im Sturm (die Wetter-Tafel trägt 5 Worte)",
            };
            return { sprossen: aus };
        },
        sprossen: {
            1: {
                u: { saaten: 20, jahre: 30, starkMm: 100, mmJeStunde: 10, ms: 14000 },
                soll: [
                    K.soll(EX, 1, "nach 100 mm Starkregen", { key: "regenMaxMm", rel: "≥", zahl: 100, einheit: "mm" }),
                    // die zweite Hälfte des Satzes: das Wasser steht über der Aue — gemessen an den Adressen mit ≥ 100 mm (keine: ungemessen, ROT)
                    K.soll(EX, 1, "Überflutung ≥ Aue", { key: "ueberAueM", rel: ">", zahl: 0, refQuelle: "der Richter: „Überflutung ≥ Aue“ — der Spiegel steht über der Aue (Höhe über ihr > 0 m)", einheit: "m" }),
                ],
                auge: { pose: "Ego an der Mess-Wiese, Bildpaar vor/nach dem Starkregen (die Bühne setzt stormy)", vorbild: "Bildpaar eines Hochwassers über die Aue (Pegelfotos, z. B. Elbe 2002)" },
                taeter: "gelaende-core.js:1627 pegelHubVon (an der Krone gedeckelt)",
                leser: "stamm/wasser-hydro.js:313 — der Spiegel liest K.pegelHub; gelaende-core.js:1627 pegelHubVon deckelt den Hub an der Krone, die Aue trägt den Überschuss „nicht gerechnet“ (gelaende-core.js:1569)",
                unklar: "„Überflutung ≥ Aue“ ohne Ort und Lauf — Vorschlag: der höchste Hub über die Lag-Klassen am Spiegel ohne Schmelze über der Krone des Betts (die Aue liegt an der Krone), ≥ 100 mm in einer nassen Strecke",
                // ZAHL (auge-klasse.cjs): die Station urteilt die Zahl, das Bild ist Beleg
                zeuge: zMinStreu({ adressen: 100, saaten: 10 }, ["streu"]),
                zeugeText: "der Fächer: ≥ 100 Adressen aus ≥ 10 Saaten, der Regen der Strecken streut",
                gruen: { werte: { regenMaxMm: 120, ueberAueM: 0.4, kroneM: 0.2 }, zeuge: { adressen: 601, saaten: 21, stark: 40, bordvoll: 300, streu: 18, hubMaxM: 0.6 } },
                attrappen: [
                    { name: "120 mm behauptet", roh: leer({ regenMaxMm: 120, ueberAueM: 0.4 }) },
                    { name: "eine Saat, ein Jahr", roh: { werte: { regenMaxMm: 120, ueberAueM: 0.4 }, zeuge: { adressen: 1, saaten: 1, streu: 0 } } },
                    { name: "100 gleiche Strecken", roh: { werte: { regenMaxMm: 120, ueberAueM: 0.4 }, zeuge: { adressen: 601, saaten: 21, streu: 0 } } },
                ],
                proben: [
                    // die Welt heute: das Gesetz füllt das Bett bis zur Krone und nie darüber (node am Export: 104 · 208 · 480 mm → Hub 0,2 m = Krone)
                    { name: "bordvoll an der Krone", gruen: false, roh: { werte: { regenMaxMm: 128, ueberAueM: 0, kroneM: 0.2 }, zeuge: { adressen: 601, saaten: 21, stark: 12, bordvoll: 601, streu: 18, hubMaxM: 0.2 } } },
                    // die trockene Welt (die Pose der schlechten Saat): kein Starkregen — ueberAueM ungemessen
                    { name: "die trockene Welt", gruen: false, roh: { werte: { regenMaxMm: 0, ueberAueM: null, kroneM: 0.2 }, zeuge: { adressen: 601, saaten: 21, stark: 0, bordvoll: 0, streu: 0, hubMaxM: -0.6 } } },
                ],
            },
            2: {
                u: { jahre: 100, saison: "Sommer 0,375, Uhr 0,6" },
                soll: [
                    K.soll(EX, 2, "Dauer und Amplitude gegen Erd-Statistik gleichen Klimas ±50 %", { key: "dauerTage", ref: 6, refQuelle: "Erde, gemäßigt: Hitzewelle ≥ 6 Tage (ETCCDI WSDI, Zhang et al. 2011)", einheit: "d" }),
                    K.soll(EX, 2, "Dauer und Amplitude gegen Erd-Statistik gleichen Klimas ±50 %", { key: "amplitudeK", ref: 5, refQuelle: "Erde, gemäßigt: Hitzewelle ≥ 5 K über dem Normal (Frich et al. 2002, HWDI)", einheit: "K" }),
                ],
                zeuge: zMinStreu({ strecken: 10, worte: 3 }, ["streuDauer", "streuT"]),
                taeter: "phyto-core.js wetterAt (keine Blockierlage)",
                leser: "phyto-core.js:4423 — wetterAt kennt keine Blockierlage: die längste klare Strecke ist ein Bruchteil eines Tages",
                gruen: { werte: { dauerTage: 7, amplitudeK: 5.5 }, zeuge: { strecken: 40, streuDauer: 2, streuT: 3, worte: 5 } },
                attrappen: [
                    { name: "Welle aus der Statistik ohne Welt", roh: leer({ dauerTage: 7, amplitudeK: 5.5 }) },
                    { name: "eine einzige Strecke", roh: { werte: { dauerTage: 7, amplitudeK: 5.5 }, zeuge: { strecken: 1, streuDauer: 0, streuT: 3, worte: 5 } } },
                ],
            },
            3: {
                u: { jahre: 100, erwartungMm: 100, verfahren: "Gumbel (Momente) über die Jahresmaxima des Regens einer nassen Strecke (mm, 10 mm je Stunde der Stärke 1); Erd-Erwartung 100 mm (KOSTRA-DWD 2020, D = 24 h, T = 100 a, Flachland)" },
                soll: [K.soll(EX, 3, "100-a-Wert innerhalb Faktor 2 der Erd-Erwartung", { key: "faktor", rel: "≤", zahl: 2 })],
                zeuge: zMinStreu({ jahre: 100, saatZurueck: 1 }, ["streu"]),
                zeugeText: "die Jahresmaxima der Welt streuen (Gumbel über 100 Spieljahre)",
                taeter: "phyto-core.js wetterAt (periodisch, keine Extreme)",
                leser: "phyto-core.js:4423 — drei Sinus-Wellen: die Jahresmaxima wiederholen sich, eine Jahrhundertflut entsteht nicht",
                gruen: { werte: { faktor: 1.3 }, zeuge: { jahre: 100, streu: 9, saatZurueck: 1 } },
                attrappen: [
                    { name: "Faktor 1,2 ohne Jahre", roh: leer({ faktor: 1.2 }) },
                    { name: "100 gleiche Jahre (Faktor des entarteten Gumbel)", roh: { werte: { faktor: 2 }, zeuge: { jahre: 100, streu: 0, saatZurueck: 1 } } },
                ],
                unklar: "Erd-Erwartung ohne Dauerstufe und Klimazone — Vorschlag: 24-h-Summe, T = 100 a, gleiche Klimazone (KOSTRA-DWD 2020: ~100 mm im Flachland)",
            },
            4: {
                u: { saaten: 100, jahre: 30, abstandKm: 5000 },
                soll: [K.soll(EX, 4, "Index ↔ Regen 5 000 km entfernt |r| ≥ 0,3 über 100 Saaten", { key: "rBetrag" }), K.soll(EX, 4, "Index ↔ Regen 5 000 km entfernt |r| ≥ 0,3 über 100 Saaten", { key: "saaten", rel: "≥", zahl: 100 })],
                zeuge: zMinStreu({ saaten: 100 }, ["streu"]),
                taeter: "phyto-core.js wetterAt (kein Meer, kein Index)",
                nicht: "kein Ozean-Index",
                leser: "phyto-core.js:4423 — wetterAt liest keine Temperatur der See; kein Index der Welt",
                gruen: { werte: { rBetrag: 0.35, saaten: 100 }, zeuge: { saaten: 100, streu: 0.1 } },
                attrappen: [{ name: "r 0,35 aus einer Reanalyse", roh: leer({ rBetrag: 0.35, saaten: 100 }) }],
            },
            5: {
                u: {},
                soll: [K.soll(EX, 5, "Sicht im Sandsturm < 100 m", { key: "sichtSandsturmM", einheit: "m" }), K.soll(EX, 5, "Blindtest gegen Sturmfotos ≤ 60 %", { key: "blindProzent", einheit: "%" })],
                auge: { pose: "Ego an der Mess-Wiese im Sturm (der Sandsturm ist kein Wort der Welt)", vorbild: "Fotos eines Haboob/Blizzard (NOAA), Blindtest ≤ 60 %" },
                taeter: "stamm/daten.js WEATHER_FIELD (5 Worte)",
                nicht: "kein Sandsturm, kein Blizzard",
                leser: "stamm/daten.js:112 — WEATHER_FIELD trägt sunny/cloudy/foggy/rainy/stormy, keinen Staub und keinen Schneesturm",
                gruen: { werte: { sichtSandsturmM: 60, blindProzent: 55 }, zeuge: { worte: 6 } },
                attrappen: [{ name: "Sicht 60 m behauptet", roh: leer({ sichtSandsturmM: 60, blindProzent: 55 }) }],
            },
            6: {
                u: { dauerS: 2.5 },
                soll: [K.soll(EX, 6, "p95 ≤ 33 ms über die Durchfahrt", { key: "p95Ms", einheit: "ms" }), K.soll(EX, 6, "Blindtest ≤ 60 %", { key: "blindProzent", einheit: "%" })],
                auge: { pose: "Ego an der Mess-Wiese im Sturm (keine Megastadt, kein Hurrikan)", vorbild: "Fotos eines Hurrikan-Landfalls in einer Großstadt, Blindtest ≤ 60 %" },
                taeter: "stamm/daten.js WEATHER_FIELD (kein Hurrikan)",
                nicht: "kein Hurrikan, keine Megastadt im Sturm",
                leser: "stamm/daten.js:112 — WEATHER_FIELD trägt keinen Hurrikan, keinen Sandsturm",
                gruen: { werte: { p95Ms: 25, blindProzent: 55 }, zeuge: { bilder: 150 } },
                attrappen: [{ name: "p95 25 ms ohne Bild", roh: leer({ p95Ms: 25, blindProzent: 55 }) }],
            },
        },
    };

    // ════════════════════════════════════════ VORHERSAGE ════════════════════════════════════════
    const VH = "planet.wetter.vorhersage";
    const vorhersage = {
        sek: 32,
        faecher: true,
        pfad: PFAD,
        mutiert: true,
        ungefahren: "das Bildmodell, das NUR den Himmel sieht (S2), urteilt am Gerät über die Bilder von M.auge; headless misst die Probe die Folge der Welt",
        mess: async function (H, U, M) {
            const R = (v) => (Number.isFinite(v) ? Math.round(v * 1000) / 1000 : null);
            const u3 = U[3] || {}, u6 = U[6] || {};
            // DIE FOLGE DER HEIMAT (Saat der Welt): das Wort am Ort zu jeder Zeit der Welt-Uhr (`_wetterAmOrt`), der Wind `_windDirAt`;
            // die Stunde ist 1/24 des Spieltags (DAY_LENGTH_DEFAULT_MINUTES), der Tag ebenso
            const welt = await H.seite(`
const st = r.state, wm = st.worldMeta, A = r.constructor, Z = A.WETTER_ZUG_SEK, P = globalThis.__phytoCore, FELD = A.WEATHER_FIELD;
const tagS = A.DAY_LENGTH_DEFAULT_MINUTES * 60, h = tagS / 24, s0 = wm.seed;
const nass = (w) => r._weatherIsWet(w), deck = (w) => FELD[w].grey;
const out = { tagS, h };
const beginne = [];
for (let t = 30; beginne.length < 100 && t < 3000 * tagS; t += 30) {
if (!nass(r._wetterAmOrt(0, 0, t)) || nass(r._wetterAmOrt(0, 0, t - 30))) continue;
const d = r._windDirAt(t - h), D = P.WIND_FELD.front.zugMS * h;
const luv = deck(r._wetterAmOrt(-d.x * D, -d.z * D, t - h)), hier = deck(r._wetterAmOrt(0, 0, t - h)), kurz = deck(r._wetterAmOrt(0, 0, t - 30)), jetzt = deck(r._wetterAmOrt(0, 0, t));
beginne.push([t, luv, hier, kurz, jetzt]);
t += 10 * h;
}
out.beginne = beginne;
const schritt = Z, tage = ${Number(u3.lernTage) || 60}, nLern = Math.round((tage * tagS) / schritt);
const obs = [];
for (let i = 0; i < nLern + Math.round((40 * tagS) / schritt); i++) obs.push(r._wetterAmOrt(0, 0, i * schritt));
out.obs = obs;
out.grau = Object.fromEntries(Object.keys(FELD).map((w) => [w, FELD[w].grey]));
out.nassW = Object.keys(FELD).filter(nass);
out.nLern = nLern;
out.schritt = schritt;
const zwilling = [];
for (let k = 0; k < 100; k++) { const t0 = 5000 + k * 3331; const z = []; for (const L of [1, 2, 4, 7, 10, 14]) z.push([nass(r._wetterAmOrt(0, 0, t0 + L * tagS)) ? 1 : 0, nass(r._wetterAmOrt(1, 0, t0 + L * tagS)) ? 1 : 0]); zwilling.push(z); }
out.zwilling = zwilling;
const g = P.windGrund(s0);
const A0 = [], B0 = [];
for (let t = 0; t < 4000; t += 5) { A0.push(nass(r._wetterAmOrt(0, 0, t)) ? 1 : 0); B0.push(nass(r._wetterAmOrt(3000 * g.x, 3000 * g.z, t)) ? 1 : 0); }
let best = [-1, 0];
for (let k = 0; k < 400; k++) { let s = 0; for (let i = 0; i + k < A0.length; i++) if (A0[i] === B0[i + k]) s++; s /= A0.length - k; if (s > best[0]) best = [s, k]; }
out.lagS = best[1] * 5;
out.lagGleich = best[0];
const welten = [];
try {
for (let k = 0; k < ${Number(u6.welten) || 10}; k++) {
wm.seed = "wetter-s" + k;
const sk = [];
for (const L of [1, 7, 14, 30, 60]) { let a = 0, n = 0, f = 0; for (let j = 0; j < 60; j++) { const t0 = 2000 + j * 1777; const o = nass(r._wetterAmOrt(0, 0, t0 + L * tagS)) ? 1 : 0, p = nass(r._wetterAmOrt(1, 0, t0 + L * tagS)) ? 1 : 0; a += (p - o) * (p - o); f += o; n++; } const c = f / n; sk.push([L, a / n, c * (1 - c)]); }
welten.push(sk);
}
} finally { wm.seed = s0; }
out.welten = welten;
out.saatZurueck = wm.seed === s0;
return out;
`);
            const mittel = (x) => (x.length ? x.reduce((s, v) => s + v, 0) / x.length : NaN);
            const streu = (x) => (x.length > 1 ? Math.sqrt(mittel(x.map((v) => (v - mittel(x)) ** 2))) : 0);
            const aus = M.teil || {};
            // S1 Regen kommt aus der Windrichtung: die Bedeckung im Luv (Zug × 1 h gegen den Wind) eine Stunde vor dem Beginn höher als
            // am Ort, und sie stieg am Ort binnen der Stunde
            const B = welt.beginne;
            const ok = B.filter(([, luv, hier, kurz, jetzt]) => luv > hier && Math.max(kurz, jetzt) > hier).length;
            aus[1] = {
                werte: { beginne: B.length, windrichtungProzent: B.length ? R((100 * ok) / B.length) : null },
                zeuge: { beginne: B.length, streuLuv: R(streu(B.map((x) => x[1]))), streuZeit: R(streu(B.map((x) => x[0]))) },
            };
            // S2 der Himmel als Zeichen: Regen in 12 h aus „bedeckt jetzt“ gegen die Persistenz (Brier-Skill) — das Bildmodell am Gerät
            // am FÄCHER (M4): je Saat 500 Momente der Folge am Ort (`_wetterAmOrt`), das Zeichen „bedeckt jetzt“ gegen die Persistenz
            // „nass jetzt“ für den Regen in 12 h; der Skill ist 1 − ΣBrier(Zeichen) ÷ ΣBrier(Persistenz) über den Fächer
            const u2 = U[2] || {};
            const ZEICHEN_AN = async (r, T, a, mit) => {
                const st = r.state, wm = st.worldMeta, A = r.constructor, s0 = wm.seed, FELD = A.WEATHER_FIELD, h = (A.DAY_LENGTH_DEFAULT_MINUTES * 60) / 24;
                try {
                    if (a.saat != null) wm.seed = "wetter-s" + a.saat;
                    let bz = 0, bp = 0, n = 0, nass12 = 0, bedeckt = 0;
                    for (let k = 0; k < mit.momente; k++) {
                        const t = 1000 + k * 97, w = r._wetterAmOrt(0, 0, t);
                        const z = FELD[w].grey >= FELD.cloudy.grey - 1e-9 ? 1 : 0, p = r._weatherIsWet(w) ? 1 : 0, o = r._weatherIsWet(r._wetterAmOrt(0, 0, t + mit.vorlaufH * h)) ? 1 : 0;
                        bz += (z - o) ** 2;
                        bp += (p - o) ** 2;
                        nass12 += o;
                        bedeckt += z;
                        n++;
                    }
                    return { saat: a.saat, n, bs: [bz / n, bp / n], nass12: nass12 / n, bedeckt: bedeckt / n };
                } finally {
                    wm.seed = s0;
                }
            };
            const RZ = await FAECHER((c) => H.seite(c), {
                gesetz: { fn: ZEICHEN_AN, export: "phyto-core.js:4804 wetterAt (das Wort am Ort) · stamm/daten.js WEATHER_FIELD (grey)", leser: "stamm/bild-himmel.js:3032 _wetterAmOrt" },
                adressen: { saaten: Array.from({ length: Number(u2.saaten) || 20 }, (_, i) => i), dazu: [{ saat: null, ort: null, zeit: null, heim: 1 }] },
                mit: { momente: Number(u2.momente) || 500, vorlaufH: Number(u2.vorlaufH) || 12 },
                ms: Number(u2.ms) || 5000,
                masse: {
                    saaten: { wie: "anzahl", feld: "n" },
                    momente: { wie: "summe", feld: "n" },
                    skillHimmel: { wie: (v) => { const z = v.reduce((s, b) => s + b[0], 0), p = v.reduce((s, b) => s + b[1], 0); return p > 0 ? 1 - z / p : null; }, feld: "bs" },
                    skillHeim: { wie: (v) => (v.length && v[0][1] > 0 ? 1 - v[0][0] / v[0][1] : null), feld: "bs", nur: "heim" },
                    nass12: { wie: "mittel", feld: "nass12" },
                    bedeckt: { wie: "mittel", feld: "bedeckt" },
                },
                schlecht: { feld: "bs.0", richtung: "max" },
                pose: (a) => "Ego an der Mess-Wiese, Blick in den Himmel unter der Saat " + (a.saat == null ? "der Welt" : "wetter-s" + a.saat),
                ungemessen: ["das eingefrorene Bildmodell, das NUR den Himmel sieht (Korpus) — die Probe liest das Wort, nicht das Bild"],
            });
            aus[2] = {
                werte: { skillHimmel: R(RZ.werte.skillHimmel) },
                zeuge: { momente: RZ.werte.momente, saaten: RZ.werte.saaten, skillHeim: R(RZ.werte.skillHeim), nass12: R(RZ.werte.nass12), bedeckt: R(RZ.werte.bedeckt), akte: RZ.akte },
                auge: await M.auge("wetter-vorhersage-s2", { ort: "wiese" }, { wetter: "cloudy" }),
                taeter: "phyto-core.js:4804 wetterAt — „bedeckt jetzt“ sagt den Regen in 12 h mit Skill " + R(RZ.werte.skillHimmel) + " über der Persistenz (" + RZ.gemessen + " Saaten, " + RZ.werte.momente + " Momente): kein Vorlauf der Front · " + RZ.akte,
            };
            // S3 die Vorhersage aus Beobachtung: Analog-Verfahren über die gelernte Folge (60 Spieltage), 100 Vorhersagen 3 Tage voraus,
            // Brier-Skill gegen die Klimatologie der Lern-Zeit
            const obs = welt.obs.map((w) => welt.grau[w]), nassO = welt.obs.map((w) => (welt.nassW.includes(w) ? 1 : 0)), nL = welt.nLern, lead = Math.round((3 * welt.tagS) / welt.schritt), fen = 8;
            const klima = mittel(nassO.slice(0, nL));
            let bsA = 0, bsK = 0, nV = 0;
            for (let v = 0; v < 100; v++) {
                const t = nL + v * Math.max(1, Math.floor((obs.length - nL - lead - 1) / 100));
                if (t + lead >= obs.length) break;
                let bestJ = -1, bestD = Infinity;
                for (let j = fen; j + lead < nL; j++) {
                    let d = 0;
                    for (let i = 0; i < fen; i++) d += Math.abs(obs[t - i] - obs[j - i]);
                    if (d < bestD) (bestD = d), (bestJ = j);
                }
                const o = nassO[t + lead], p = nassO[bestJ + lead];
                bsA += (p - o) ** 2;
                bsK += (klima - o) ** 2;
                nV++;
            }
            aus[3] = {
                werte: { skill3: bsK > 0 ? R(1 - bsA / bsK) : null, vorhersagen: nV },
                zeuge: { vorhersagen: nV, klima: R(klima), streuObs: R(streu(obs)) },
            };
            // S4 die winzige Störung: der Zwilling 1 m daneben als Vorhersage, Skill bei 1 und 14 Tagen
            const Zw = welt.zwilling, leads = [1, 2, 4, 7, 10, 14];
            const skillL = (i) => {
                const o = Zw.map((z) => z[i][0]), p = Zw.map((z) => z[i][1]);
                const c = mittel(o), bsz = mittel(o.map((x, k) => (p[k] - x) ** 2)), bsc = c * (1 - c);
                return bsc > 0 ? 1 - bsz / bsc : NaN;
            };
            const sk = leads.map((_, i) => skillL(i));
            aus[4] = {
                werte: { skill14: R(sk[5]), skill1: R(sk[0]) },
                zeuge: { vorhersagen: Zw.length, faellt: Number.isFinite(sk[0]) && Number.isFinite(sk[5]) ? R(sk[0] - sk[5]) : null, je: sk.map(R), klima14: R(mittel(Zw.map((z) => z[5][0]))) },
            };
            // S5 die Sturmbahn: kein Sturm als Ding; gemessen der Zug der Front aus dem Lag zweier Orte 3 km längs der Grundrichtung
            aus[5] = {
                werte: { frontZugMs: welt.lagS > 0 ? R(3000 / welt.lagS) : null, lagGleich: R(welt.lagGleich) },
                zeuge: { lagS: welt.lagS },
                nicht: "keine Sturmbahn und kein Orbitbild: das Wetter wandert als starres Feld (phyto-core.js:4423 wetterAt), ein Sturm ist kein Ding mit Bahn",
            };
            // S6 die Grenze der Vorhersage in 10 Welten: der Zwilling 1 m daneben, die Tage bis Skill ≤ 0,05 (sonst > 60)
            const grenzen = welt.welten.map((s) => {
                const x = s.find(([, bsz, bsc]) => bsc > 0 && 1 - bsz / bsc <= 0.05);
                return x ? x[0] : 61;
            });
            aus[6] = {
                werte: { grenzeTage: R(mittel(grenzen)), welten: grenzen.length },
                zeuge: { welten: grenzen.length, saatZurueck: welt.saatZurueck ? 1 : 0, grenzen },
                nicht: "kein Chaos und keine Dynamik je Welt: das Wetter ist eine feste Funktion von Saat, Ort und Zeit (phyto-core.js:4423 wetterAt), und jede Saat trägt den Körper der Erde (voxel-worker.js:1159 planetPlanVon: P.PLANET_ERDE) — Rotation und Wärmegefälle ändern sich nie",
            };
            return { sprossen: aus };
        },
        sprossen: {
            1: {
                u: { beginne: 100, stunde: "1/24 Spieltag", luvKm: "zugMS × 1 h" },
                soll: [K.soll(VH, 1, "Bedeckung stieg in den 60 min davor aus der Windrichtung in ≥ 70 %", { key: "windrichtungProzent", einheit: "%" }), K.soll(VH, 1, "100 Regenbeginne", { key: "beginne", rel: "≥", zahl: 100 })],
                zeuge: zMinStreu({ beginne: 100 }, ["streuLuv", "streuZeit"]),
                taeter: "phyto-core.js wetterAt · windRichtung (die Front zieht längs windGrund, der Wind am Ort dreht unabhängig)",
                leser: "stamm/stoff-material.js:214 — _windDirAt (phyto-core windRichtung) ist nicht der Zug der Front (phyto-core windGrund)",
                gruen: { werte: { beginne: 100, windrichtungProzent: 76 }, zeuge: { beginne: 100, streuLuv: 0.2, streuZeit: 9000 } },
                attrappen: [
                    { name: "76 % ohne Regenbeginn", roh: leer({ beginne: 100, windrichtungProzent: 76 }) },
                    { name: "derselbe Beginn 100-mal", roh: { werte: { beginne: 100, windrichtungProzent: 76 }, zeuge: { beginne: 100, streuLuv: 0, streuZeit: 0 } } },
                ],
            },
            2: {
                u: { vorlaufH: 12, saaten: 20, momente: 500, ms: 5000 },
                soll: [K.soll(VH, 2, "Regen in 12 h mit Skill ≥ 0,3 über Persistenz", { key: "skillHimmel" })],
                auge: { pose: "Ego an der Mess-Wiese, Blick in den Himmel (bewölkt)", vorbild: "Bildmodell, das NUR den Himmel sieht (Himmelsfotos mit Regen 12 h später), Skill ≥ 0,3" },
                taeter: "phyto-core.js:4804 wetterAt (kein Vorlauf der Front)",
                leser: "stamm/bild-himmel.js:3032 _wetterAmOrt — das Wort am Ort; das Zeichen „bedeckt“ ist das grey des Worts (stamm/daten.js WEATHER_FIELD)",
                gruen: { werte: { skillHimmel: 0.35 }, zeuge: { momente: 10500, saaten: 21 } },
                attrappen: [{ name: "Skill ohne Himmel", roh: leer({ skillHimmel: 0.35 }) }],
            },
            3: {
                u: { lernTage: 60, vorlaufTage: 3, fenster: 8, verfahren: "Analog-Vorhersage über die beobachtete Bedeckung am Ort" },
                soll: [K.soll(VH, 3, "Skill ≥ 0,2 über Klimatologie bei 3 Tagen", { key: "skill3" })],
                zeuge: zMinStreu({ vorhersagen: 90 }, ["streuObs", "klima"]),
                taeter: "phyto-core.js wetterAt",
                gruen: { werte: { skill3: 0.3 }, zeuge: { vorhersagen: 100, klima: 0.3, streuObs: 0.3 } },
                attrappen: [{ name: "Skill 0,3 aus der Literatur", roh: leer({ skill3: 0.3 }) }],
            },
            4: {
                u: { stoerungM: 1, tage: [1, 2, 4, 7, 10, 14] },
                soll: [K.soll(VH, 4, "Skill fällt bis 14 Tage auf ≈ 0", { key: "skill14", rel: "≤", zahl: 0 })],
                zeuge: (roh) => {
                    const f = zMin({ vorhersagen: 100 })(roh);
                    if (f) return f;
                    const z = roh.zeuge || {};
                    if (!(typeof z.faellt === "number" && z.faellt > 0.2)) return "der Skill fällt nicht (1 Tag → 14 Tage: " + z.faellt + ") — keine Vorhersage, die erst trug";
                    return null;
                },
                zeugeText: "der Skill trug am ersten Tag und fiel bis 14 Tage",
                taeter: "phyto-core.js wetterAt (deterministisch, kein Chaos)",
                leser: "phyto-core.js:4423 — wetterAt ist eine Funktion von Saat, Ort und Zeit: eine Störung wächst nie",
                unklar: "„≈ 0“ ohne Toleranz (die Station verlangt ≤ 0) — Vorschlag: |Skill| ≤ 0,1 bei 14 Tagen",
                gruen: { werte: { skill14: -0.02, skill1: 0.8 }, zeuge: { vorhersagen: 100, faellt: 0.82 } },
                attrappen: [
                    { name: "Skill 0 ohne Zwilling", roh: leer({ skill14: -0.02, skill1: 0.8 }) },
                    { name: "ein Skill, der nie trug", roh: { werte: { skill14: 0, skill1: 0 }, zeuge: { vorhersagen: 100, faellt: 0 } } },
                ],
            },
            5: {
                u: { abstandM: 3000 },
                soll: [K.soll(VH, 5, "Bahn-Vorhersage 48 h aus dem Orbitbild: Fehler ≤ 300 km", { key: "bahnFehlerKm", einheit: "km" })],
                zeuge: zMin({ lagS: 1 }),
                taeter: "phyto-core.js wetterAt (kein Sturm als Ding)",
                nicht: "keine Sturmbahn, kein Orbitbild",
                leser: "phyto-core.js:4423 — wetterAt trägt keinen Sturm mit Bahn; scripts/werkbank.cjs /bild keine Orbit-Pose",
                gruen: { werte: { bahnFehlerKm: 200 }, zeuge: { lagS: 270 } },
                attrappen: [{ name: "Bahn ohne Sturm", roh: leer({ bahnFehlerKm: 200 }) }],
            },
            6: {
                u: { welten: 10, tage: [1, 7, 14, 30, 60] },
                soll: [K.soll(VH, 6, "Zeit bis Skill ≈ 0 gegen Fehlerwachstum aus Rotation und Wärmegefälle ±50 %", { key: "grenzeTage", ref: 15, refQuelle: "Erde: Vorhersagegrenze ≈ 15 Tage (Zhang et al. 2019, J. Atmos. Sci. 76)", einheit: "d" })],
                zeuge: zMin({ welten: 10, saatZurueck: 1 }),
                taeter: "voxel-worker.js planetPlanVon (immer PLANET_ERDE) · phyto-core.js wetterAt",
                nicht: "kein Chaos, keine Dynamik je Welt",
                leser: "voxel-worker.js:1159 — planetPlanVon baut jede Saat mit P.PLANET_ERDE; phyto-core.js:4423 wetterAt liest weder Rotation noch Wärmegefälle",
                gruen: { werte: { grenzeTage: 14 }, zeuge: { welten: 10, saatZurueck: 1 } },
                attrappen: [{ name: "14 Tage aus der Literatur", roh: leer({ grenzeTage: 14 }) }],
            },
        },
    };

    // ════════════════════════════════════════ FREMDE ATMOSPHÄREN ════════════════════════════════════════
    const FA = "planet.wetter.fremde-atmosphaeren";
    const fremde = {
        sek: 20,
        faecher: true,
        pfad: PFAD,
        ungefahren: "die Himmelsbilder (Mittag/Abend, Mars, Gasriese, Landeplatz) schießt M.auge am Gerät; headless misst die Probe die Sonne durch die Atmosphäre (`_atmoSonne`, die Rechnung der Welt mit dem Gesetz der Ferne) und den Faden",
        mess: async function (H, U, M) {
            const R = (v) => (Number.isFinite(v) ? Math.round(v * 1000) / 1000 : null);
            const u4 = U[4] || {}, u7 = U[7] || {};
            // DIE ATMOSPHÄRE: der Durchlass zur Sonne (Mittag, Abend) über die Rechnung der Welt (`_atmoRechnung().sonne` mit dem Gesetz
            // dieser Welt und mit dem Himmel der Ferne, ULTIVERSUM.ferne), die Welten des Ultiversums, der Zug der Wolke
            const welt = await H.seite(`
const st = r.state, A = r.constructor, Rr = r._atmoRechnung(), G0 = r._atmoGesetz(), W = A.WOLKEN_SCHICHT, HG = A.Gesetz("terrain:HIMMEL_GESETZ", null);
const hue = (c) => { const r0 = c.r, g = c.g, b = c.b, mx = Math.max(r0, g, b), mn = Math.min(r0, g, b), d = mx - mn; if (d <= 1e-9) return null; let h = mx === r0 ? ((g - b) / d) % 6 : mx === g ? (b - r0) / d + 2 : (r0 - g) / d + 4; h *= 60; return h < 0 ? h + 360 : h; };
const sonne = (G, e) => { const Mm = Rr.medium(G, Rr.betaKlar(G), A.ATMO_BODEN); const s = Rr.sonne(G, Mm, 0.001, e, A.ATMO_LUT.schritte.durchlass, [0, 0, 0]); return { r: s.col.r, g: s.col.g, b: s.col.b, lum: s.lum }; };
const welten = Object.keys(A.ULTIVERSUM);
const Gf = Object.assign({}, G0, { rayleighTiefe: A.ULTIVERSUM.ferne.himmel.rayleighTiefe.slice() });
const je = {};
for (const [n, G] of [["erde", G0], ["ferne", Gf]]) je[n] = { mittag: sonne(G, 0.9), abend: sonne(G, 0.05) };
for (const n of Object.keys(je)) for (const z of ["mittag", "abend"]) je[n][z].hue = hue(je[n][z]);
const u = st.skyboxUniforms;
const zug = u && u.zug ? Math.hypot(u.zug.value.x, u.zug.value.y) * (1 + HG.projY) * W.hoeheM : null;
const tiefen = welten.map((w) => (A.ULTIVERSUM[w].himmel && A.ULTIVERSUM[w].himmel.rayleighTiefe) || null);
const gas = Object.keys(G0).filter((k) => /gas|druck|stern|mol|masse|flucht|rotation/i.test(k));
return { welten, je, zug, tiefen, gas, rayleigh: G0.rayleighTiefe };
`);
            // DER FADEN: die Bänder des Regens je Breite über dem Meer (Heimat-Samen, Nordhalbkugel) und der Widerspruch über 10 Saaten
            const faden = await H.seite(`
await r._fadenQuelle();
const G = globalThis.__gelaendeCore, samen = r._planetSamen();
const breiten = [];
for (let b = 1; b <= 89; b += 4) breiten.push(b);
const laengen = [-160, -120, -80, -40, 0, 40, 80, 120, 160];
const a = await Promise.all([].concat(...breiten.map((b) => laengen.map((l) => r._planetAuftrag({ type: "planet-ort", samen, breite: b, laenge: l, zeitMa: 0 })))));
let abgelehnt = 0;
const rq = (o) => { try { return G.ortGesetz(o).wetter.regenQuote; } catch (e) { abgelehnt++; return null; } };
const prof = breiten.map((b, i) => { const m = a.slice(i * laengen.length, (i + 1) * laengen.length).filter((o) => !o.land).map(rq).filter((v) => v !== null); return m.length ? m.reduce((s, v) => s + v, 0) / m.length : null; });
const wid = [];
for (let k = 0; k < ${Number(u7.saaten) || 10}; k++) {
const s = "wetter-s" + k;
const b = await Promise.all(Array.from({ length: ${Number(u7.orte) || 20} }, (_, i) => r._planetAuftrag({ type: "planet-ort", samen: s, breite: Math.asin(1 - (2 * (i + 0.5)) / ${Number(u7.orte) || 20}) * 180 / Math.PI, laenge: ((i * 137.508 + k * 29) % 360) - 180, zeitMa: 0 })));
for (const o of b) { if (!o.land) continue; let kh = null; try { kh = G.ortGesetz(o).klimaHeute; } catch (e) { abgelehnt++; continue; } wid.push(kh.winter > kh.sommer + 0.01 || kh.sommer > 50 || kh.winter < -90 ? 1 : 0); }
}
return { breiten, prof, meerOrte: a.filter((o) => !o.land).length, wid, version: a[0].version, abgelehnt };
`);
            const mittel = (x) => (x.length ? x.reduce((s, v) => s + v, 0) / x.length : NaN);
            const streu = (x) => (x.length > 1 ? Math.sqrt(mittel(x.map((v) => (v - mittel(x)) ** 2))) : 0);
            // die Bänder: Gipfel des Regen-Profils je Halbkugel (geglättet über 3 Breiten, Gipfel ≥ 0,02 über beiden Tälern daneben)
            const p = faden.prof.map((v, i, a) => {
                const s = [a[i - 1], v, a[i + 1]].filter((x) => x !== null && x !== undefined);
                return s.length ? mittel(s) : null;
            });
            let baender = 0;
            for (let i = 0; i < p.length; i++) {
                if (p[i] === null) continue;
                const links = p.slice(0, i).filter((x) => x !== null), rechts = p.slice(i + 1).filter((x) => x !== null);
                const lMin = links.length ? Math.min(...links.slice(-5)) : -Infinity, rMin = rechts.length ? Math.min(...rechts.slice(0, 5)) : -Infinity;
                const lNah = links.length ? links[links.length - 1] : -Infinity, rNah = rechts.length ? rechts[0] : -Infinity;
                if (p[i] >= lNah && p[i] >= rNah && p[i] - Math.max(lMin, rMin) >= 0.02) baender++;
            }
            const aus = M.teil || {};
            const E = welt.je.erde, F = welt.je.ferne;
            // S1 DIE SONNE AM FÄCHER (M4): je Adresse (Welt des Ultiversums × Höhe der Sonne, e = sin) der Durchlass zur Sonne durch die
            // Atmosphäre dieser Welt (foundry-core ATMO_RECHNUNG.sonne mit ihrer Rayleigh-Tiefe, dieselbe Rechnung wie `_atmoSonne`),
            // sein Farbton und seine Helligkeit; die Himmelsfarbe selbst rechnet nur die GPU (welt-licht.js:1084 himmelSicht, TSL)
            const u1 = U[1] || {};
            const SONNE_AN = async (r, T, a, mit) => {
                const A = r.constructor, Rr = r._atmoRechnung(), G0 = r._atmoGesetz(), U0 = A.ULTIVERSUM[a.ort];
                const G = U0 && U0.himmel && U0.himmel.rayleighTiefe ? Object.assign({}, G0, { rayleighTiefe: U0.himmel.rayleighTiefe.slice() }) : G0;
                const Mm = Rr.medium(G, Rr.betaKlar(G), A.ATMO_BODEN);
                const s = Rr.sonne(G, Mm, 0.001, a.zeit, A.ATMO_LUT.schritte.durchlass, [0, 0, 0]);
                const c = s.col, mx = Math.max(c.r, c.g, c.b), mn = Math.min(c.r, c.g, c.b), d = mx - mn;
                let hue = null;
                if (d > 1e-9) { hue = mx === c.r ? ((c.g - c.b) / d) % 6 : mx === c.g ? (c.b - c.r) / d + 2 : (c.r - c.g) / d + 4; hue *= 60; if (hue < 0) hue += 360; }
                return { welt: a.ort, e: a.zeit, hue: hue == null ? null : Math.round(hue * 100) / 100, lum: s.lum, eigen: G === G0 ? 0 : 1 };
            };
            const RS = await FAECHER((c) => H.seite(c), {
                gesetz: { fn: SONNE_AN, export: "foundry-core.js:385 ATMO_RECHNUNG.sonne (durchlass) mit dem ATMO_GESETZ der Welt", leser: "stamm/bild-himmel.js:1629 _atmoSonne (das Richtlicht und die Tafeln)" },
                adressen: { orte: welt.welten, zeiten: u1.hoehen || [0.02, 0.05, 0.1, 0.2, 0.3, 0.5, 0.7, 0.9, 1] },
                ms: Number(u1.ms) || 3000,
                masse: {
                    adressen: { wie: "anzahl", feld: "e" },
                    welten: { wie: "verschieden", feld: "welt" },
                    eigeneHimmel: { wie: "verschieden", feld: "welt", nur: (a, w) => w.eigen === 1 },
                    sonneHueMittag: { wie: "erste", feld: "hue", nur: (a, w) => w.welt === "erde" && w.e === 0.9 },
                    sonneHueAbend: { wie: "erste", feld: "hue", nur: (a, w) => w.welt === "erde" && w.e === 0.05 },
                    sonneLumAbend: { wie: "erste", feld: "lum", nur: (a, w) => w.welt === "erde" && w.e === 0.05 },
                    hueSpanne: { wie: (v) => (v.length ? Math.max(...v) - Math.min(...v) : null), feld: "hue", nur: (a, w) => w.welt === "erde" && w.hue != null },
                },
                schlecht: { feld: "lum", richtung: "min" },
                pose: (a) => "Ego an der Mess-Wiese, Welt " + a.ort + ", Sonne bei sin(h) = " + a.zeit,
                ungemessen: ["die Himmelsfarbe (Zenit, Horizont) — welt-licht.js:1084 himmelSicht ist ein TSL-Knoten, kein Leser auf der CPU; das Bild am Gerät gegen das Foto (Panel)"],
            });
            // S1 die Erde: der Farbton der Sonne Mittag/Abend durch die Atmosphäre der Welt (am Fächer); die Himmelsfarbe im Bild am Gerät
            aus[1] = {
                werte: { sonneHueMittag: R(RS.werte.sonneHueMittag), sonneHueAbend: R(RS.werte.sonneHueAbend), sonneLumAbend: R(RS.werte.sonneLumAbend) },
                zeuge: { welten: RS.werte.welten, adressen: RS.werte.adressen, eigeneHimmel: RS.werte.eigeneHimmel, hueSpanne: R(RS.werte.hueSpanne), akte: RS.akte },
                auge: await M.auge("wetter-fremde-s1", { ort: "wiese" }, { uhr: 0.5 }),
                taeter: "Leser fehlt: welt-licht.js:1084 himmelSicht — die Himmelsfarbe rechnet nur die GPU (TSL), headless kein Wert himmelHue; die Sonne am Fächer " + RS.werte.adressen + " Adressen in " + RS.werte.welten + " Welten · " + RS.akte,
            };
            // S2 Mars: der Himmel der Ferne ist gesetzt (Rayleigh-Tiefe), nicht aus Gas, Druck, Stern gefolgert
            aus[2] = {
                werte: { hueMarsAbend: R(F.abend.hue), hueFerneMittag: R(F.mittag.hue), welten: welt.welten.length },
                zeuge: { welten: welt.welten.length, streuHue: R(Math.abs((F.abend.hue || 0) - (E.abend.hue || 0))) },
                nicht: "der Himmel folgt nicht aus Gas, Druck und Stern: die Atmosphäre trägt " + (welt.gas.length ? welt.gas.join(", ") : "keinen dieser Parameter") + " (foundry-core.js:290 ATMO_GESETZ), die Ferne setzt nur die Rayleigh-Tiefe " + JSON.stringify(welt.tiefen[1]) + " (stamm/daten.js:89) — keine Mars- und keine Titan-Parameter",
            };
            // S3 was eine Welt hält: kein Leser der Fluchtgeschwindigkeit
            aus[3] = {
                werte: { welten: welt.welten.length },
                zeuge: { welten: welt.welten.length },
                nicht: "keine Atmosphäre aus Fluchtgeschwindigkeit und Einstrahlung: das Ultiversum trägt " + welt.welten.length + " gesetzte Welten (stamm/daten.js:89), jeder Planet des Fadens den Körper der Erde (voxel-worker.js:1159 P.PLANET_ERDE)",
            };
            // S4 Zirkulation aus Rotation: die Bänder bei ×1 aus dem Faden; ×0,1 und ×5 nicht setzbar
            aus[4] = {
                werte: { baenderX1: baender },
                zeuge: { meerOrte: faden.meerOrte, streuProfil: R(streu(faden.prof.filter((x) => x !== null))), profil: faden.prof.map(R), version: faden.version },
                auge: await M.auge("wetter-fremde-s4", { ort: "wiese" }, { uhr: 0.5 }),
                nicht: "die Rotation ist nicht setzbar: jede Saat trägt den Körper der Erde (voxel-worker.js:1159 planetPlanVon: P.PLANET_ERDE) — ×0,1 und ×5 erzeugt die Welt nicht, und kein Orbitbild",
            };
            // S5 Venus: keine Superrotation, der Boden dreht nicht
            aus[5] = {
                werte: { wolkeZugMs: R(welt.zug) },
                zeuge: { welten: welt.welten.length },
                nicht: "keine gebundene und keine dichte Welt, keine Drehung des Bodens: die Wolke zieht mit " + R(welt.zug) + " m/s längs der Saat (stamm/bild-himmel.js:1765), Venus-Parameter setzt kein Leser",
            };
            // S6 Gasriesen: kein Gasriese in der Welt
            aus[6] = {
                werte: { welten: welt.welten.length },
                zeuge: { welten: welt.welten.length },
                auge: await M.auge("wetter-fremde-s6", { ort: "wiese" }, { uhr: 0.5 }),
                nicht: "kein Gasriese: jeder Planet ist ein Gesteinskörper der Erde (voxel-worker.js:1159), kein Abstieg in eine Hülle",
            };
            // S7 10⁶ Planeten: der Widerspruch über 10 Saaten × 20 Orte; die Wolke vom Orbit am Landeplatz nicht erzeugbar
            const w = faden.wid;
            aus[7] = {
                werte: { ohneWiderspruchProzent: w.length ? R(100 - (100 * w.reduce((s, v) => s + v, 0)) / w.length) : null, planeten: Number(u7.saaten) || 10 },
                zeuge: { landOrte: w.length, abgelehnt: faden.abgelehnt },
                auge: await M.auge("wetter-fremde-s7", { ort: "wiese" }, { uhr: 0.5 }),
                nicht: "keine Reise durch ein Sonnensystem, kein Orbit: das Wetter am Landeplatz hängt an Saat und Ort der Welt (stamm/bild-himmel.js:2843 _wetterAmOrt), nicht an der Wolke, die man vom Orbit sähe",
            };
            return { sprossen: aus };
        },
        sprossen: {
            1: {
                u: { hoehen: [0.02, 0.05, 0.1, 0.2, 0.3, 0.5, 0.7, 0.9, 1], ms: 3000 },
                soll: [ohneZahl(FA, 1, "Himmelsfarbe Mittag/Abend gegen Foto", "himmelHue", "°")],
                auge: { pose: "Ego an der Mess-Wiese, Mittag und Abend (die Bühne setzt die Uhr)", vorbild: "Himmelsfotos Mittag/Abend (klarer Tag, gemäßigte Breite)" },
                taeter: "Leser fehlt: welt-licht.js:1084 himmelSicht (die Himmelsfarbe nur auf der GPU) · foundry-core.js ATMO_GESETZ",
                leser: "stamm/bild-himmel.js:1629 _atmoSonne (die Sonne, am Fächer) · welt-licht.js:1084 himmelSicht (der Himmel, TSL — kein CPU-Leser)",
                unklar: "der Richter nennt keine Schwelle — Vorschlag: Farbton des Zenits mittags 205–225°, Abend am Horizont ±10° gegen das Foto",
                gruen: { werte: { himmelHue: 215 }, zeuge: { welten: 2 } },
                attrappen: [{ name: "Farbton ohne Bild", roh: leer({ himmelHue: 215 }) }],
            },
            2: {
                u: { welt: "ferne (ULTIVERSUM)" },
                soll: [K.soll(FA, 2, "Farbton ±10°", { key: "hueMarsAbend", ref: 210, refQuelle: "Mars: blaue Dämmerung um die Sonne, Farbton ≈ 210° (Curiosity Mastcam, Sol 956, NASA/JPL 2015)", einheit: "°" })],
                zeuge: zMinStreu({ welten: 2 }, ["streuHue"]),
                taeter: "foundry-core.js ATMO_GESETZ (kein Gas, kein Druck, kein Stern) · stamm/daten.js ULTIVERSUM.ferne",
                nicht: "kein Himmel aus Gas, Druck und Stern",
                leser: "foundry-core.js:290 — ATMO_GESETZ trägt Rayleigh-Tiefe und Mie, kein Gas, keinen Druck, keinen Stern; stamm/daten.js:89 ULTIVERSUM.ferne setzt die Rayleigh-Tiefe",
                gruen: { werte: { hueMarsAbend: 212 }, zeuge: { welten: 2, streuHue: 150 } },
                attrappen: [{ name: "Farbton 212° aus dem Foto", roh: leer({ hueMarsAbend: 212 }) }],
            },
            3: {
                u: { welten: 1000 },
                soll: [K.soll(FA, 3, "richtig eingeordnet ≥ 90 %", { key: "eingeordnetProzent", einheit: "%" }), K.soll(FA, 3, "1 000 Welten", { key: "welten", rel: "≥", zahl: 1000 })],
                zeuge: zMin({ welten: 1000 }),
                taeter: "voxel-worker.js planetPlanVon (immer PLANET_ERDE)",
                nicht: "keine Atmosphäre aus Fluchtgeschwindigkeit",
                leser: "voxel-worker.js:1159 — planetPlanVon(samen) setzt P.PLANET_ERDE; kein Leser der Fluchtgeschwindigkeit und Einstrahlung je Welt",
                gruen: { werte: { eingeordnetProzent: 93, welten: 1000 }, zeuge: { welten: 1000 } },
                attrappen: [{ name: "93 % aus dem Exoplaneten-Archiv", roh: leer({ eingeordnetProzent: 93, welten: 1000 }) }],
            },
            4: {
                u: { breitenGrad: [1, 89, 4], laengen: 9 },
                soll: [
                    K.soll(FA, 4, "Bänder je Halbkugel 1 / 3 / ≥ 4", { key: "baenderX1", rel: "=", zahl: 3 }),
                    K.soll(FA, 4, "Bänder je Halbkugel 1 / 3 / ≥ 4", { key: "baenderX01", rel: "=", zahl: 1 }),
                    K.soll(FA, 4, "Bänder je Halbkugel 1 / 3 / ≥ 4", { key: "baenderX5", rel: "≥", zahl: 4 }),
                ],
                auge: { pose: "Orbit (nicht erzeugbar; geschossen an der Mess-Wiese)", vorbild: "Orbitbilder bei Rotation ×0,1 / ×1 / ×5 (Bänder je Halbkugel 1 / 3 / ≥ 4)" },
                taeter: "voxel-worker.js planetPlanVon (immer PLANET_ERDE)",
                nicht: "Rotation nicht setzbar, kein Orbitbild",
                leser: "voxel-worker.js:1159 — planetPlanVon setzt P.PLANET_ERDE: die Rotation (planet-core planetKlimaGlobal zellen) ist nie anders als die der Erde",
                // ZAHL (auge-klasse.cjs): die Station urteilt die Zahl, das Bild ist Beleg
                zeuge: zMinStreu({ meerOrte: 100 }, ["streuProfil"]),
                zeugeText: "das Wind-Profil über ≥ 100 Meer-Orten des Fadens",
                gruen: { werte: { baenderX1: 3, baenderX01: 1, baenderX5: 4 }, zeuge: { meerOrte: 100, streuProfil: 0.1 } },
                attrappen: [{ name: "Bänder aus der Theorie", roh: leer({ baenderX1: 3, baenderX01: 1, baenderX5: 4 }) }],
            },
            5: {
                u: {},
                soll: [K.soll(FA, 5, "Wolkendecke umläuft ≈ 60× schneller als der Boden", { key: "superrotation", rel: "=", zahl: 60 })],
                zeuge: zMin({ welten: 2 }),
                taeter: "voxel-worker.js planetPlanVon (kein Venus-Körper) · stamm/bild-himmel.js zug",
                nicht: "keine Venus-Parameter, kein drehender Boden",
                leser: "voxel-worker.js:1159 — kein Körper außer der Erde; stamm/bild-himmel.js:1765 — die Wolke zieht mit zugMS, nie relativ zu einer Drehung",
                unklar: "„≈ 60×“ ohne Toleranz (die Station verlangt = 60) — Vorschlag: 60× ±20 %",
                gruen: { werte: { superrotation: 60 }, zeuge: { welten: 2 } },
                attrappen: [{ name: "60× aus der Literatur", roh: leer({ superrotation: 60 }) }],
            },
            6: {
                u: {},
                soll: [
                    K.soll(FA, 6, "Bänderzahl nach Rhines-Skala ±30 %", { key: "baenderGas", ref: 6, refQuelle: "Jupiter: ≈ 6 prograde Strahlströme je Halbkugel (Porco et al. 2003, Cassini)" }),
                    K.soll(FA, 6, "Wirbel lebt ≥ 100 Spieljahre", { key: "wirbelJahre", einheit: "a" }),
                    K.soll(FA, 6, "Blindtest gegen Juno/Cassini ≤ 70 %", { key: "blindProzent", einheit: "%" }),
                ],
                auge: { pose: "Abstieg in einen Gasriesen (nicht erzeugbar; geschossen an der Mess-Wiese)", vorbild: "Juno/Cassini-Bilder von Jupiter und Saturn, Blindtest ≤ 70 %" },
                taeter: "voxel-worker.js planetPlanVon (kein Gasriese)",
                nicht: "kein Gasriese",
                leser: "voxel-worker.js:1159 — jeder Planet ist der Gesteinskörper der Erde",
                gruen: { werte: { baenderGas: 6, wirbelJahre: 150, blindProzent: 60 }, zeuge: { welten: 2 } },
                attrappen: [{ name: "Jupiter behauptet", roh: leer({ baenderGas: 6, wirbelJahre: 150, blindProzent: 60 }) }],
            },
            7: {
                u: { saaten: 10, orte: 20 },
                soll: [
                    K.soll(FA, 7, "1 000 Planeten × 20 Orte ohne sichtbaren Widerspruch ≥ 95 %", { key: "ohneWiderspruchProzent", einheit: "%" }),
                    K.soll(FA, 7, "1 000 Planeten × 20 Orte ohne sichtbaren Widerspruch ≥ 95 %", { key: "planeten", rel: "≥", zahl: 1000 }),
                    K.soll(FA, 7, "sah (≤ 1 %)", { key: "wolkeVersatzProzent", einheit: "%" }),
                ],
                auge: { pose: "Landeplatz an der Mess-Wiese (die Reise durch ein Sonnensystem steht aus)", vorbild: "Prüfer-Satz R11: Widerspruch ja/nein; die Wolke vom Orbit über dem Landeplatz" },
                taeter: "stamm/bild-himmel.js _wetterAmOrt (das Wetter hängt nicht am Planeten)",
                nicht: "keine Reise, kein Orbit",
                leser: "stamm/bild-himmel.js:2843 — _wetterAmOrt liest Saat und Ort der Welt, nicht Breite und Länge des Planeten",
                gruen: { werte: { ohneWiderspruchProzent: 97, planeten: 1000, wolkeVersatzProzent: 0.5 }, zeuge: { landOrte: 6000 } },
                attrappen: [{ name: "97 % ohne Faden", roh: leer({ ohneWiderspruchProzent: 97, planeten: 1000, wolkeVersatzProzent: 0.5 }) }],
            },
        },
    };

    return {
        leitern: {
            [LA]: lagen,
            [WO]: wolken,
            [KZ]: klimazonen,
            [EX]: extreme,
            [VH]: vorhersage,
            [FA]: fremde,
        },
    };
})());

// ── DIE PERSPEKTIVE planet.zeit (2 Leitern, 17 Sprossen) ──────────────────────────────────────────────────────────────────────────
// Der Leser des Spiels ist der Planet-Faden (`r._planetAuftrag` planet-ort, stamm/gelaende-chunks.js:643 → voxel-worker.js
// planetOrtAuftrag:1175 → planet-core planetScheibe/planetOrt): je Lage und Zeit { land, hoeheM, kuesteKm, Δ klima/meer/wildnis } —
// derselbe Weg wie die Reise (stamm/feld-leben.js:1286, `zeitMa` ist die Zeit); das Klima am Ort ist die Tafel `ortGesetz` (wie die
// Reise es dem Spieler sagt: Sommer, Winter, Schneegrenze, Meer). DAS GLOBALE MASS: das Mittel über Fibonacci-Punkte gleicher Fläche
// (die Welt antwortet je Punkt — der Faden gibt das globale Klima `planetKlimaGlobal` nicht heraus). Eis = Anteil der Punkte, deren
// Sommer unter 0 °C bleibt. DAS ARCHIV: das Schicht-Gesetz (gelaende-core `schichtOrt` · `schichtMessung` · `felsLage`) und der Stoff
// nach Tiefe (`_terrainMaterialAt`) — die Station misst, was die Wand der Welt trägt.
L.perspektive("zeit", (() => {
    const KG = "planet.zeit.klimageschichte";
    const AR = "planet.zeit.archiv";
    const PFAD = ["planet-core.js", "voxel-worker.js", "gelaende-core.js", "stamm/gelaende-*.js", "stamm/feld-leben.js", "stamm/netz-portal.js", "stamm/vegetation-wiese.js", "welt-licht.js", "scripts/werkbank.cjs"];
    const zMin = (spec) => (roh) => {
        const z = (roh && roh.zeuge) || {};
        for (const [k, min] of Object.entries(spec)) if (!(typeof z[k] === "number" && z[k] >= min)) return "die Welt antwortete nicht: " + k + " " + (z[k] === undefined ? "fehlt" : z[k]) + " (Soll ≥ " + min + ")";
        return null;
    };
    const gut = (werte, zeuge) => ({ werte, zeuge });
    const leer = (werte) => ({ werte, zeuge: {} });
    // DER RICHTER OHNE ZAHL (archiv S2): K.soll fasst ihn nicht — das Wort steht wörtlich, der Vergleich „gegen“ hält nie
    const ohneZahl = (id, nr, wort, key) => {
        const r = K.sprosseVon(id, nr).richter;
        if (!r.includes(wort)) throw new Error("Soll „" + wort + "“ steht nicht wörtlich im Richter " + id + " S" + nr);
        if (K.zahlenIn(r).length) throw new Error(id + " S" + nr + ": der Richter trägt eine Zahl — das Soll gehört K.soll");
        return { wort, key, rel: "gegen", a: "die Referenz (der Richter nennt keine Schwelle)", einheit: "" };
    };

    // ════════════════════════════════════════ KLIMAGESCHICHTE (S1–S9) ════════════════════════════════════════
    const klima = {
        sek: 55,
        faecher: true,
        pfad: PFAD,
        ungefahren: "die Bilder (Halte +250 Ma / +1 Ga / +5 Ga, Schneeball, Eisrand) schießt die Probe nur am Gerät; der Sprung ≤ 5 s des Preises misst die Maschine",
        mess: async function (H, U, M) {
            const KOPF = `
const K = globalThis.__gelaendeCore;
const samen = r._planetSamen();
await r._fadenQuelle();
const R3 = (v) => (Number.isFinite(v) ? Math.round(v * 1000) / 1000 : null);
const fib = (n) => Array.from({ length: n }, (_, i) => [Math.round((Math.asin(1 - (2 * (i + 0.5)) / n) * 18000) / Math.PI) / 100, Math.round((((i * 137.508) % 360) - 180) * 100) / 100]);
const lagePunkt = (k) => [Math.round((Math.asin(((k * 0.6180339887) % 1) * 2 - 1) * 180) / Math.PI * 100) / 100, Math.round((((k * 137.508) % 360) - 180) * 100) / 100];
const ortVon = (o) => ({ samen: o.samen, version: o.version, breite: o.breite, laenge: o.laenge, zeitMa: o.zeitMa, delta: o.delta });
const ort = (p, z, sam) => r._planetAuftrag({ type: "planet-ort", samen: sam || samen, breite: p[0], laenge: p[1], zeitMa: z });
const glob = async (z, P, sam) => { const a = await Promise.all(P.map((p) => ort(p, z, sam))); let t = 0, eis = 0, land = 0, sb = 0, nl = 0; for (const o of a) { const O = K.ortGesetz(ortVon(o)); t += (O.klimaHeute.sommer + O.klimaHeute.winter) / 2; if (O.klimaHeute.sommer < 0) eis++; if (o.land) { land++; sb += K.SCHNEE.start + O.schneeBandM; nl++; } } return { z, t: t / a.length, eis: eis / a.length, land: land / a.length, meer: a[0].delta.meer.waterLevelM, schnee: nl ? sb / nl : null, a }; };
const kurz = (g) => [g.z, R3(g.t), R3(g.eis), R3(g.land), R3(g.meer), R3(g.schnee)];
`;
            const R3 = (v) => (Number.isFinite(v) ? Math.round(v * 1000) / 1000 : null);
            const ziel = Object.keys(U);
            // A: HEUTE gegen −21 ka (48 Punkte; +100 a misst der Fächer S1); 3 Ma in 10-ka-Schritten an 6 Punkten
            // hoher Breite (Eis-Stellvertreter, Meer); 540 Ma in 10-Ma-Schritten (24 Punkte); die Kreide (−90 Ma) und Pangäa (−250 Ma) an 200 Punkten
            const a = await H.seite(KOPF + `
const t0 = performance.now();
const F48 = fib(48), F24 = fib(24), F200 = fib(200);
const aus = {};
const g0 = await glob(0, F48), g21 = await glob(-0.021, F48);
aus.heute = kurz(g0); aus.lgm = kurz(g21);
const P6 = [[60, 0], [-60, 90], [70, 180], [-70, -90], [50, 45], [-50, -135]];
aus.s3 = [];
for (let i = 0; i <= 300; i++) aus.s3.push(kurz(await glob(-i * 0.01, P6)));
aus.s3Ms = Math.round(performance.now() - t0);
aus.s5 = [];
for (let i = 0; i <= 54; i++) aus.s5.push(kurz(await glob(-i * 10, F24)));
const flut = async (z) => { const a = await Promise.all(F200.map((p) => ort(p, z))); let kont = 0, nass = 0, innen = 0, arid = 0; for (const o of a) { if (o.kuesteKm > 0) { kont++; if (!o.land) nass++; } if (o.land && o.kuesteKm > 1000) { innen++; if (K.ortGesetz(ortVon(o)).klimaHeute.spendeMm < 250) arid++; } } return [z, kont, nass, innen, arid]; };
aus.flut = [await flut(0), await flut(-90), await flut(-250)];
aus.ms = Math.round(performance.now() - t0);
return aus;
`);
            // B: 4 Ga bis +1,06 Ga in 50-Ma-Schritten (12 Punkte), vier weitere Saaten über 4 Ga (100 Ma, 8 Punkte); der Superkontinent: das Land
            // im Raster 12 × 24 zu +150 … +350 Ma (größte zusammenhängende Fläche)
            const b = await H.seite(KOPF + `
const t0 = performance.now();
const F12 = fib(12), F8 = fib(8);
const aus = { welt: [] };
let ende = null;
for (let z = -4000; z <= 1100; z += 50) { try { aus.welt.push(kurz(await glob(z, F12))); } catch (e) { ende = String(e && e.message || e).slice(0, 160); break; } }
aus.ende = ende;
aus.saaten = [];
for (const s of ["k2-zeit-1", "k2-zeit-2", "k2-zeit-3", "k2-zeit-4"]) { if (performance.now() - t0 > 30000) break; const reihe = []; for (let z = -4000; z <= 0; z += 100) reihe.push(kurz(await glob(z, F8, s))); aus.saaten.push([s, reihe]); }
aus.super = [];
for (const z of [150, 200, 250, 300, 350]) {
const nb = 12, nl = 24, P = [];
for (let j = 0; j < nb; j++) for (let i = 0; i < nl; i++) P.push([-82.5 + j * 15, -172.5 + i * 15]);
const a = await Promise.all(P.map((p) => ort(p, z)));
const G = a.map((o) => (o.land ? 1 : 0)), vis = new Uint8Array(G.length);
let gross = 0;
for (let c = 0; c < G.length; c++) { if (!G[c] || vis[c]) continue; let n = 0; const st = [c]; vis[c] = 1; while (st.length) { const q = st.pop(); n++; const i = q % nl, j = (q / nl) | 0; for (let b2 = -1; b2 <= 1; b2++) for (let a2 = -1; a2 <= 1; a2++) { const jj = j + b2; if (jj < 0 || jj >= nb) continue; const qq = ((i + a2 + nl) % nl) + nl * jj; if (G[qq] && !vis[qq]) { vis[qq] = 1; st.push(qq); } } } if (n > gross) gross = n; }
const land = G.reduce((s, v) => s + v, 0);
aus.super.push([z, land, gross, land ? R3(gross / land) : null]);
}
aus.ms = Math.round(performance.now() - t0);
return aus;
`);
            const aus = M.teil || {};
            const mittel = (x) => (x.length ? x.reduce((s, v) => s + v, 0) / x.length : NaN);
            const t0 = a.heute[1];
            // S1 +100 a AM FÄCHER (M4): je Adresse (Punkt × Zeit heute / +100 a) der Ort des Planeten aus dem Faden (planet-ort, der Weg der
            // Reise) und seine Tafel (gelaende-core `ortGesetz`: Sommer, Winter, Schneegrenze; das Meer im Δ) — 48 Fibonacci-Punkte
            // gleicher Fläche (Wärme, Schneegrenze am Land) und 20 Küstenpunkte (die Küste nach Bruun: Rückzug = Δh / Neigung)
            const u1 = U[1];
            if (u1) {
                const KLIMA_AN = async (r, T, a, mit) => {
                    const K = globalThis.__gelaendeCore, memo = mit.memo || (mit.memo = {});
                    if (!memo.samen) {
                        await r._fadenQuelle();
                        memo.samen = r._planetSamen();
                    }
                    const ort = (p, z) => r._planetAuftrag({ type: "planet-ort", samen: memo.samen, breite: p[0], laenge: p[1], zeitMa: z });
                    const R3 = (v) => (Number.isFinite(v) ? Math.round(v * 1000) / 1000 : null);
                    let p;
                    if (typeof a.saat === "number") {
                        const i = a.saat - 1;
                        p = [Math.round((Math.asin(1 - (2 * (i + 0.5)) / mit.n) * 18000) / Math.PI) / 100, Math.round((((i * 137.508) % 360) - 180) * 100) / 100];
                    } else {
                        if (!memo.kp) {
                            memo.kp = [];
                            const lagePunkt = (k) => [Math.round((Math.asin(((k * 0.6180339887) % 1) * 2 - 1) * 180) / Math.PI * 100) / 100, Math.round((((k * 137.508) % 360) - 180) * 100) / 100];
                            for (let k0 = 0; memo.kp.length < mit.kuesten && k0 < 800; k0 += 24) {
                                const P = Array.from({ length: 24 }, (_, i) => lagePunkt(k0 + i));
                                const A = await Promise.all(P.map((q) => ort(q, 0)));
                                A.forEach((o, i) => { if (memo.kp.length < mit.kuesten && Math.abs(o.kuesteKm) < 30 && Math.abs(o.kuesteKm) > 0.5) memo.kp.push(P[i]); });
                            }
                        }
                        p = memo.kp[Number(String(a.saat).slice(1))];
                        if (!p) return { fehlt: "kein Küstenpunkt " + a.saat + " unter 800 Lagen (planet-ort kuesteKm)" };
                    }
                    const o = await ort(p, a.zeit);
                    const O = K.ortGesetz({ samen: o.samen, version: o.version, breite: o.breite, laenge: o.laenge, zeitMa: o.zeitMa, delta: o.delta });
                    return { art: typeof a.saat === "number" ? "glob" : "kueste", p, t: R3((O.klimaHeute.sommer + O.klimaHeute.winter) / 2), schnee: o.land ? R3(K.SCHNEE.start + O.schneeBandM) : undefined, meer: R3(o.delta.meer.waterLevelM), kueste: R3(o.kuesteKm), hoehe: R3(o.hoeheM), land: o.land ? 1 : 0 };
                };
                const Z1 = [0, (Number(u1.jahre) || 100) / 1e6], NK = Number(u1.kuesten) || 20;
                const paare = (aus) => {
                    const m = new Map();
                    for (const x of aus) { const k = String(x.a.saat); if (!m.has(k)) m.set(k, []); m.get(k)[x.a.zeit === Z1[0] ? 0 : 1] = x.w; }
                    return [...m.values()].filter((q) => q[0] && q[1]);
                };
                const mittelVon = (x) => (x.length ? x.reduce((s, v) => s + v, 0) / x.length : null);
                const glob = (a, w) => w.art === "glob", kue = (a, w) => w.art === "kueste";
                const bruunVon = (q) => { const ist = Math.abs(q[1].kueste - q[0].kueste) * 1000, dh = Math.abs(q[1].meer - q[0].meer), neig = Math.abs(q[0].hoehe) / Math.max(1, Math.abs(q[0].kueste) * 1000); return { ist, r: dh > 0 && neig > 0 ? ist / (dh / neig) : null }; };
                const RK = await FAECHER((c) => H.seite(c), {
                    gesetz: { fn: KLIMA_AN, export: "voxel-worker.js:1446 planetOrtAuftrag → planet-core.js:2092 planetKlimaGlobal · gelaende-core.js:5911 ortGesetz (Sommer, Winter, schneeBandM)", leser: "stamm/feld-leben.js:1298 _planetAuftrag planet-ort (die Reise: Ort und Zeit der Welt)" },
                    adressen: { saaten: Number(u1.punkte) || 48, zeiten: Z1, dazu: Z1.flatMap((z) => Array.from({ length: NK }, (_, i) => ({ saat: "k" + i, ort: null, zeit: z }))) },
                    mit: { n: Number(u1.punkte) || 48, kuesten: NK },
                    ms: Number(u1.ms) || 12000,
                    masse: {
                        punkte: { wie: "verschieden", feld: "a.saat", nur: glob },
                        kuestenPunkte: { wie: "verschieden", feld: "a.saat", nur: kue },
                        dT100aGrad: { wie: (v, aus) => mittelVon(paare(aus).map((q) => q[1].t - q[0].t)), nur: glob },
                        schneegrenzeDeltaM: { wie: (v, aus) => mittelVon(paare(aus).filter((q) => q[0].schnee != null && q[1].schnee != null).map((q) => q[1].schnee - q[0].schnee)), nur: glob },
                        meerDeltaM: { wie: (v, aus) => mittelVon(paare(aus).map((q) => q[1].meer - q[0].meer)), nur: glob },
                        kuesteJeSoll: { wie: (v, aus) => mittelVon(paare(aus).map(bruunVon).filter((x) => x.r !== null).map((x) => x.r)), nur: kue },
                        kuesteAenderung: { wie: (v, aus) => mittelVon(paare(aus).map((q) => bruunVon(q).ist)), nur: kue },
                    },
                    schlecht: { feld: "schnee", richtung: "min" },
                    pose: (a, w) => "Ego an der Schneegrenze des Punkts " + JSON.stringify(w.p) + " (" + w.schnee + " m) zur Zeit +" + Math.round(a.zeit * 1e6) + " a, Blick hangauf",
                    ungemessen: ["das Bildpaar der Schneegrenze heute / +100 a (am Gerät)", "der Sprung ≤ 5 s des Preises (die Maschine)"],
                });
                const W1 = RK.werte;
                aus[1] = {
                    werte: Object.assign({ dT100aGrad: R3(W1.dT100aGrad), schneegrenzeDeltaM: R3(W1.schneegrenzeDeltaM), meerDeltaM: R3(W1.meerDeltaM), kuestenPunkte: W1.kuestenPunkte }, W1.kuesteJeSoll != null ? { kuesteJeSoll: R3(W1.kuesteJeSoll) } : {}),
                    zeuge: { punkte: W1.punkte, kuestenPunkte: W1.kuestenPunkte, schneeAenderung: W1.schneegrenzeDeltaM != null ? Math.abs(W1.schneegrenzeDeltaM) : 0, kuesteAenderung: R3(W1.kuesteAenderung), gerissen: RK.gerissen, akte: RK.akte },
                    taeter: (RK.fehler.length && !RK.gemessen ? "Leser fehlt: " + RK.fehler[0].fehler + " · " : "") + "keine Treibhaus-Drift in 100 a: die Welt erwärmt sich um " + R3(W1.dT100aGrad) + " °C, die Schneegrenze wandert " + R3(W1.schneegrenzeDeltaM) + " m, die Küste " + R3(W1.kuesteAenderung) + " m (planet-core.js:2092 planetKlimaGlobal: Sternfluss und Walker-Thermostat über Ma, kein CO₂-Antrieb in Jahren) · " + RK.akte,
                };
            }
            // S2: −21 ka — Meer, Kühlung, Landbrücke (das Land der 48 Punkte)
            const [, tL, eL, lL, mL] = a.lgm, [, , e0, l0] = a.heute;
            aus[2] = {
                werte: { meerM: mL, globalDT: R3(tL - t0), landDeltaProzent: R3(100 * (lL - l0)), eisDeltaProzent: R3(100 * (eL - e0)) },
                zeuge: { punkte: 48, aenderung: Math.abs(mL) + Math.abs(tL - t0) },
                nicht: "keine Erd-Saat (R4) und keine Eiszeit: −21 ka liegt das Meer " + mL + " m, die Welt " + R3(tL - t0) + " °C anders (planet-core.js:1618 planetMeer: lineare 10-Ma-Fächer, keine Bahn-Zyklen); Eisrand und Landbrücke folgen aus keiner Kaltzeit",
            };
            // S3: das Spektrum über 3 Ma (301 Werte, 10 ka): die stärksten Gipfel 20–70 ka und 70–200 ka (signifikant: Leistung ≥ 5 × Median)
            const s3 = a.s3 || [];
            const spek = (y) => {
                const n = y.length, xm = (n - 1) / 2, ym = mittel(y);
                let sxy = 0, sxx = 0;
                y.forEach((v, i) => ((sxy += (i - xm) * (v - ym)), (sxx += (i - xm) ** 2)));
                const d = y.map((v, i) => v - ym - (sxx ? (sxy / sxx) * (i - xm) : 0));
                const P = [];
                for (let per = 20; per <= 1000; per += 1) {
                    const f = 10 / per;
                    let re = 0, im = 0;
                    d.forEach((v, i) => ((re += v * Math.cos(2 * Math.PI * f * i)), (im += v * Math.sin(2 * Math.PI * f * i))));
                    P.push([per, re * re + im * im]);
                }
                const med = P.map((x) => x[1]).sort((p, q) => p - q)[P.length >> 1];
                const gipfel = (lo, hi) => { const b2 = P.filter((x) => x[0] >= lo && x[0] <= hi).sort((p, q) => q[1] - p[1])[0]; return b2 && med > 0 && b2[1] >= 5 * med ? b2[0] : null; };
                return { g41: gipfel(20, 70), g100: gipfel(70, 200), rest: R3(Math.sqrt(mittel(d.map((v) => v * v)))), d };
            };
            // Eis-Stellvertreter: die Kälte an 6 Punkten hoher Breite (−T); r über die trendbereinigten Reihen (die Zyklen, nicht der Trend)
            const eisReihe = s3.map((x) => -x[1]), meerReihe = s3.map((x) => x[4]);
            const sp = spek(eisReihe), spM = spek(meerReihe);
            const kor = (x, y) => { const mx = mittel(x), my = mittel(y); let a2 = 0, b2 = 0, c2 = 0; x.forEach((v, i) => ((a2 += (v - mx) * (y[i] - my)), (b2 += (v - mx) ** 2), (c2 += (y[i] - my) ** 2))); return b2 > 1e-9 && c2 > 1e-9 ? a2 / Math.sqrt(b2 * c2) : null; };
            const rZyklus = s3.length > 2 ? kor(sp.d, spM.d) : null;
            aus[3] = {
                werte: Object.assign({ spanneMa: R3(s3.length ? -s3[s3.length - 1][0] : 0), werteN: s3.length }, sp.g41 !== null ? { gipfel41Ka: sp.g41 } : {}, sp.g100 !== null ? { gipfel100Ka: sp.g100 } : {}, rZyklus !== null ? { rEisMeer: R3(rZyklus) } : {}),
                zeuge: { werte: s3.length, restEisGrad: sp.rest, restMeerM: spM.rest, gipfel: (sp.g41 !== null) + (sp.g100 !== null), ms: a.s3Ms },
                nicht: "kein Glazialtakt: über 3 Ma schwankt die Welt um " + sp.rest + " °C (ohne Trend), das Meer um " + spM.rest + " m — der Planet kennt keine Bahn-Zyklen (planet-core.js:1883 planetKlimaGlobal: Neigung fest, kein Milanković), das Meer ist linear in 10-Ma-Fächern (planet-core.js:1618 planetMeer)",
            };
            // S4: das Becken — kein Leser einer Wasserbilanz; gemessen die Spanne des Meeres über 540 Ma
            const s5 = a.s5 || [];
            aus[4] = {
                werte: { meerMaxM: R3(Math.max(...s5.map((x) => x[4]))), meerMinM: R3(Math.min(...s5.map((x) => x[4]))) },
                zeuge: { becken: 0, epochen: s5.length },
                nicht: "kein Becken mit Wasserbilanz: der See der Reise-Welt ist ein Senken-Knoten des Netzes (gelaende-core.js:1922 benannteSeen) ohne Verdunstung und Zufluss-Bilanz, kein Salz; das Meer des Planeten steigt und fällt (" + R3(Math.min(...s5.map((x) => x[4]))) + " … " + R3(Math.max(...s5.map((x) => x[4]))) + " m über 540 Ma), aber kein Becken trocknet aus",
            };
            // S5: 540 Ma gegen die Scotese-Kurve (die Anomalie gegen heute), die Kreide flutet den Kontinent, Pangäa trocken
            const sc = (U[5] && U[5].scotese) || [];
            const scAt = (z) => { for (let i = 0; i + 1 < sc.length; i++) if (z <= sc[i][0] && z >= sc[i + 1][0]) { const u = (sc[i][0] - z) / (sc[i][0] - sc[i + 1][0]); return sc[i][1] + u * (sc[i + 1][1] - sc[i][1]); } return null; };
            const abw = s5.map((x) => { const s = scAt(x[0]); return s === null ? null : Math.abs(x[1] - t0 - (s - sc[0][1])); }).filter((v) => v !== null);
            const fl = a.flut || [];
            const kreide = fl[1] && fl[1][1] ? (100 * fl[1][2]) / fl[1][1] : null;
            aus[5] = {
                werte: Object.assign({ spanneMa: R3(s5.length ? -s5[s5.length - 1][0] : 0), scoteseAbwGrad: R3(Math.max(...abw)), tSpanneGrad: R3(Math.max(...s5.map((x) => x[1])) - Math.min(...s5.map((x) => x[1]))) }, kreide !== null ? { kreideFlutProzent: R3(kreide) } : {}, fl[2] && fl[2][3] ? { pangaeaWuesteProzent: R3((100 * fl[2][4]) / fl[2][3]) } : {}),
                zeuge: { epochen: s5.length, punkte: 24, flut: fl },
                nicht: "keine Erd-Saat (R4): der Samen der Welt ist nicht die Erde (planet-core.js:307 planetPlan liest keinen Erd-Schlüssel) — die Station misst seine Kurve gegen die Scotese-Anomalie",
            };
            // S6: der Schneeball — die Eisfläche über 4 Ga an der Welt und an vier weiteren Saaten
            const welt = b.welt || [];
            const reihen = [["welt", welt.filter((x) => x[0] <= 0)]].concat((b.saaten || []).map(([s, r]) => [s, r]));
            const epi = reihen.map(([s, r]) => { const max = Math.max(...r.map((x) => x[2])); const i = r.findIndex((x) => x[2] >= 0.9); const endet = i >= 0 && r.slice(i + 1).some((x) => x[2] < 0.9); return [s, R3(max), i >= 0, endet]; });
            const eisMax = Math.max(...epi.map((x) => x[1]));
            aus[6] = {
                werte: { eisMaxProzent: R3(100 * eisMax), saatenProzent: R3((100 * epi.filter((x) => x[2] && x[3]).length) / Math.max(1, epi.length)), saaten: epi.length },
                zeuge: { saaten: epi.length, episoden: epi.filter((x) => x[2]).length, je: epi },
                nicht: "kein Schneeball: über 4 Ga bleibt die Eisfläche der " + epi.length + " Saaten ≤ " + R3(100 * eisMax) + " % (planet-core.js:1883 planetKlimaGlobal: der Walker-Thermostat gleicht den jungen Stern aus, die Eis-Albedo des Energiebilanz-Modells kippt bei diesem Fluss nie in den Schneeball, und kein Leser bricht ein Eis wieder auf)",
            };
            // S7: flüssiges Wasser über 4 Ga, der Verlust des Ozeans; die Leuchtkraft gibt der Faden nicht heraus
            const vor = welt.filter((x) => x[0] <= 0);
            const wasser = vor.filter((x) => x[3] < 1 && x[2] < 1).length;
            const nach = welt.filter((x) => x[0] > 0);
            const verlust = nach.find((x) => x[3] >= 1);
            aus[7] = {
                werte: Object.assign({ wasserZeitProzent: R3((100 * wasser) / Math.max(1, vor.length)), tVor4GaGrad: vor.length ? vor[0][1] : null, letzteZeitMa: welt.length ? welt[welt.length - 1][0] : null }, verlust ? { ozeanVerlustGa: R3(verlust[0] / 1000) } : {}),
                zeuge: { epochen: vor.length, leuchtkraft: 0 },
                nicht: "die Leuchtkraft des Sterns gibt der Faden nicht heraus (planet-core.js:1889 planetKlimaGlobal rechnet sie nach Gough, voxel-worker.js:1175 antwortet nur je Ort), die Zeit endet bei +" + (welt.length ? welt[welt.length - 1][0] : "?") + " Ma (planet-core.js:678 Schlüsselbilder: " + String(b.ende || "").slice(0, 80) + "), kein Himmel des Archaikums, keine Erd-Saat",
            };
            // S8: der Superkontinent (das größte zusammenhängende Land), die Ozeanfläche bis zum Ende der Zeit, die Sonne
            const su = b.super || [];
            const best = su.slice().sort((p, q) => (q[3] || 0) - (p[3] || 0))[0];
            aus[8] = {
                werte: Object.assign({}, best ? { landZusammenProzent: R3(100 * best[3]), superMa: best[0] } : {}, { ozeanAmEndeProzent: welt.length ? R3(100 * (1 - welt[welt.length - 1][3])) : null }),
                zeuge: { zeiten: su.length, je: su, sonne: 0 },
                nicht: "Ozeanfläche → 0 und die Sonne bei +5 Ga nicht erzeugbar: die Zeit des Planeten endet bei +1,06 Ga (planet-core.js:678), die Sonnenscheibe hat keine Größe je Epoche (welt-licht.js:711 sonnenRichtung: nur die Richtung)",
            };
            // S9: heute → Eiszeit → heute: keine Moräne; Fremdwelt-Probe am Gerät
            aus[9] = { werte: {}, zeuge: {}, auge: await M.auge("zeit-klima-s9", { ort: "wiese" }), nicht: "keine Moräne, kein Eisrand der Eiszeit im Gelände: die Kaltzeit ist eine neue Ort-Saat (gelaende-core.js:5802 ortSaat), das Eis legt nichts ab; 1 000 Planeten tragen keine eigenen Konstanten (voxel-worker.js:1176)" };
            const o = {};
            for (const nr of ziel) o[nr] = aus[nr] || M.nicht("ungemessen");
            return { sprossen: o };
        },
        sprossen: {
            1: {
                u: { jahre: 100, punkte: 48, kuesten: 20, ms: 12000 },
                soll: [
                    K.soll(KG, 1, "+100 a bei +2 °C", { key: "dT100aGrad", rel: "≥", zahl: 2, einheit: "°C" }),
                    K.soll(KG, 1, "Schneegrenze +300 m ±30 %", { key: "schneegrenzeDeltaM", ref: 300, refQuelle: "Erde: Gradient 6,5 K/km — +2 °C heben die Schneegrenze um ~300 m (IPCC AR5 WG1, Kap. 4)", einheit: "m" }),
                    K.soll(KG, 1, "Küste wandert um Δh/Strandneigung ±25 %", { key: "kuesteJeSoll", ref: 1, refQuelle: "Erde: Bruun-Regel, Rückzug = Δh / Strandneigung (Bruun 1962)" }),
                ],
                zeuge: zMin({ punkte: 48, kuestenPunkte: 10, schneeAenderung: 1e-6, kuesteAenderung: 1e-6 }),
                zeugeText: "der Fächer: 48 Punkte, ≥ 10 Küsten je heute und +100 a, Schneegrenze und Küste wanderten",
                taeter: "planet-core.js:2092 planetKlimaGlobal (keine Drift in Jahren)",
                leser: "stamm/feld-leben.js:1298 — die Reise fragt den Ort zu seiner Zeit; planet-core.js:2092 planetKlimaGlobal trägt keinen CO₂-Antrieb in Jahren",
                gruen: gut({ dT100aGrad: 2.1, schneegrenzeDeltaM: 310, kuesteJeSoll: 1.1 }, { punkte: 48, kuestenPunkte: 20, schneeAenderung: 310, kuesteAenderung: 140 }),
                attrappen: [
                    { name: "die Schneegrenze aus dem Gradienten gerechnet (keine Welt)", roh: leer({ dT100aGrad: 2, schneegrenzeDeltaM: 300, kuesteJeSoll: 1 }) },
                    { name: "die Welt blieb stehen (Bruun 1 aus 0/0)", roh: gut({ dT100aGrad: 2, schneegrenzeDeltaM: 300, kuesteJeSoll: 1 }, { punkte: 48, kuestenPunkte: 20, schneeAenderung: 0, kuesteAenderung: 0 }) },
                    { name: "die Drift EINES Punkts (kein Fächer)", roh: gut({ dT100aGrad: 2.1, schneegrenzeDeltaM: 310, kuesteJeSoll: 1.1 }, { punkte: 1, kuestenPunkte: 1, schneeAenderung: 310, kuesteAenderung: 140 }) },
                    { name: "der Fächer am Export: 0 °C in 100 a, die Schneegrenze steht", roh: gut({ dT100aGrad: 0, schneegrenzeDeltaM: 0, meerDeltaM: 0, kuestenPunkte: 20 }, { punkte: 48, kuestenPunkte: 20, schneeAenderung: 0, kuesteAenderung: 0 }) },
                ],
            },
            2: {
                u: { zeitMa: -0.021 },
                soll: [
                    K.soll(KG, 2, "Meer −120 ±10 m", { key: "meerM", ref: -120, refQuelle: "Erde: Meeresspiegel des letzten glazialen Maximums −120 m (Clark et al. 2009; Lambeck et al. 2014)", einheit: "m" }),
                    K.soll(KG, 2, "global −6 ±2 °C", { key: "globalDT", ref: -6, refQuelle: "Erde: globale Kühlung des LGM −6 °C (Tierney et al. 2020)", einheit: "°C" }),
                ],
                zeuge: zMin({ punkte: 48, aenderung: 1 }),
                zeugeText: "48 Punkte zur Kaltzeit, Meer und Wärme änderten sich",
                taeter: "planet-core.js planetMeer (keine Eiszeit) · planetPlan (keine Erd-Saat, R4)",
                nicht: "keine Erd-Saat, keine Eiszeit −21 ka",
                leser: "planet-core.js:307 planetPlan — kein Erd-Schlüssel (R4); planet-core.js:1618 planetMeer interpoliert 10-Ma-Fächer, kein Glazial",
                gruen: gut({ meerM: -118, globalDT: -5.6 }, { punkte: 48, aenderung: 124 }),
                attrappen: [{ name: "die LGM-Zahlen eingesetzt", roh: leer({ meerM: -120, globalDT: -6 }) }],
            },
            3: {
                u: { spanneMa: 3, schrittKa: 10 },
                soll: [
                    K.soll(KG, 3, "Gipfel bei 41 ±5", { key: "gipfel41Ka", ref: 41, refQuelle: "Erde: Obliquität 41 ka im Stapel LR04 (Lisiecki & Raymo 2005)", einheit: "ka" }),
                    K.soll(KG, 3, "100 ±15 ka", { key: "gipfel100Ka", ref: 100, refQuelle: "Erde: Exzentrizität ~100 ka im Stapel LR04 (Lisiecki & Raymo 2005)", einheit: "ka" }),
                    K.soll(KG, 3, "r ≤ −0,8", { key: "rEisMeer" }),
                    K.soll(KG, 3, "über 3 Ma", { key: "spanneMa", rel: "≥", einheit: "Ma" }),
                ],
                zeuge: zMin({ werte: 300, gipfel: 2 }),
                zeugeText: "301 Werte über 3 Ma, zwei Gipfel über dem Rauschen",
                taeter: "planet-core.js planetKlimaGlobal (keine Bahn-Zyklen) · planetMeer (lineare Fächer)",
                nicht: "kein Glazialtakt",
                leser: "planet-core.js:1883 planetKlimaGlobal — Neigung fest, kein Milanković-Antrieb; planet-core.js:1618 planetMeer linear zwischen 10-Ma-Fächern",
                gruen: gut({ gipfel41Ka: 42, gipfel100Ka: 98, rEisMeer: -0.86, spanneMa: 3 }, { werte: 301, gipfel: 2 }),
                attrappen: [{ name: "r = −1 aus zwei Geraden (kein Gipfel)", roh: gut({ gipfel41Ka: 41, gipfel100Ka: 100, rEisMeer: -1, spanneMa: 3 }, { werte: 301, gipfel: 0 }) }],
            },
            4: {
                u: {},
                soll: [K.soll(KG, 4, "V/(E−P) ±30 %", { key: "trockenJeSoll", ref: 1, refQuelle: "Erde: Austrocknungszeit eines Beckens t = V/(E−P) (Messinische Salinitätskrise, Hsü 1972)" })],
                zeuge: zMin({ becken: 1 }),
                zeugeText: "ein Becken fiel trocken",
                taeter: "gelaende-core.js benannteSeen (Senken ohne Bilanz)",
                nicht: "kein Becken mit Wasserbilanz",
                leser: "gelaende-core.js:1922 benannteSeen — der See ist ein Senken-Knoten; kein Leser rechnet Verdunstung gegen Zufluss, kein Salz",
                gruen: gut({ trockenJeSoll: 1.1 }, { becken: 1 }),
                attrappen: [{ name: "die Austrocknungszeit als Formel", roh: leer({ trockenJeSoll: 1 }) }],
            },
            5: {
                // die Scotese-Kurve (mittlere Erdtemperatur, °C, gerundet; Scotese et al. 2021): die Station misst die Anomalie gegen heute
                u: { spanneMa: 540, scotese: [[0, 14.5], [-35, 20], [-50, 27], [-66, 22], [-90, 27], [-145, 21], [-200, 22], [-252, 30], [-300, 13], [-360, 18], [-400, 23], [-445, 14], [-470, 22], [-540, 24]] },
                soll: [
                    K.soll(KG, 5, "Mitteltemperatur im Band der Scotese-Kurve ±3 °C", { key: "scoteseAbwGrad", ref: 0, refQuelle: "Erde: Scotese et al. 2021, mittlere Erdtemperatur des Phanerozoikums — die größte Abweichung der Anomalie gegen heute", einheit: "°C" }),
                    K.soll(KG, 5, "Kreide-Hochstand flutet 20–40 % des Kontinents", { key: "kreideFlutProzent", einheit: "%" }),
                    K.soll(KG, 5, "über 540 Ma", { key: "spanneMa", rel: "≥", einheit: "Ma" }),
                ],
                zeuge: zMin({ epochen: 55, punkte: 24 }),
                zeugeText: "55 Epochen an 24 Punkten",
                taeter: "planet-core.js planetPlan (keine Erd-Saat, R4)",
                nicht: "keine Erd-Saat (R4)",
                leser: "planet-core.js:307 planetPlan — liest keinen Erd-Schlüssel; der Samen der Welt ist ein fremder Planet",
                gruen: gut({ scoteseAbwGrad: 2.4, kreideFlutProzent: 28, spanneMa: 540 }, { epochen: 55, punkte: 24 }),
                attrappen: [{ name: "die Scotese-Kurve eingesetzt", roh: leer({ scoteseAbwGrad: 0, kreideFlutProzent: 30, spanneMa: 540 }) }],
            },
            6: {
                u: { saaten: ["welt", "k2-zeit-1", "k2-zeit-2", "k2-zeit-3", "k2-zeit-4"] },
                soll: [K.soll(KG, 6, "Schneeball ≥ 90 % Eisfläche", { key: "eisMaxProzent", einheit: "%" }), K.soll(KG, 6, "in ≥ 30 % der fähigen Saaten", { key: "saatenProzent", einheit: "%" })],
                zeuge: zMin({ saaten: 5, episoden: 1 }),
                zeugeText: "5 Saaten über 4 Ga, eine Episode trat ein und endete",
                taeter: "planet-core.js planetKlimaGlobal (Walker-Thermostat, kein Umschlag)",
                nicht: "kein Schneeball",
                leser: "planet-core.js:1883 planetKlimaGlobal — das Eis folgt dem Gleichgewicht des Sternflusses, kein Umschlag in den Schneeball und kein Ausstieg",
                gruen: gut({ eisMaxProzent: 94, saatenProzent: 40 }, { saaten: 5, episoden: 2 }),
                attrappen: [{ name: "der Schneeball als Behauptung", roh: leer({ eisMaxProzent: 95, saatenProzent: 40 }) }],
            },
            7: {
                u: { spanneGa: 4 },
                soll: [
                    K.soll(KG, 7, "flüssiges Wasser ≥ 90 % der Zeit seit 4 Ga", { key: "wasserZeitProzent", einheit: "%" }),
                    K.soll(KG, 7, "70–100 % Leuchtkraft", { key: "leuchtkraftProzent", einheit: "%" }),
                    K.soll(KG, 7, "Ozeanverlust zwischen +0,5 und +2 Ga", { key: "ozeanVerlustGa", rel: "band", zahl: 0.5, bis: 2, einheit: "Ga" }),
                ],
                zeuge: zMin({ epochen: 80, leuchtkraft: 1 }),
                zeugeText: "80 Epochen, die Leuchtkraft des Sterns aus der Welt",
                taeter: "voxel-worker.js planetOrtAuftrag (gibt das globale Klima nicht heraus) · planet-core.js Schlüsselbilder bis +1,06 Ga",
                nicht: "keine Leuchtkraft aus der Welt, die Zeit endet bei +1,06 Ga",
                leser: "voxel-worker.js:1175 planetOrtAuftrag — antwortet je Ort, nie mit planetKlimaGlobal (sternFluss, tMittelC, eisBreite); planet-core.js:678 die Schlüsselbilder enden bei +1 061 Ma",
                gruen: gut({ wasserZeitProzent: 96, leuchtkraftProzent: 75, ozeanVerlustGa: 1.1 }, { epochen: 80, leuchtkraft: 1 }),
                attrappen: [{ name: "die Leuchtkraft nach Gough eingesetzt", roh: leer({ wasserZeitProzent: 96, leuchtkraftProzent: 72, ozeanVerlustGa: 1 }) }],
            },
            8: {
                u: { zeitenMa: [150, 200, 250, 300, 350], raster: [12, 24] },
                soll: [
                    K.soll(KG, 8, "Land zu ≥ 70 % zusammenhängend", { key: "landZusammenProzent", einheit: "%" }),
                    K.soll(KG, 8, "+250 Ma (±100 Ma)", { key: "superMa", ref: 250, refQuelle: "Erde: der nächste Superkontinent in ~250 Ma (Pangaea Proxima, Scotese)", einheit: "Ma" }),
                    K.soll(KG, 8, "Ozeanfläche → 0 zwischen +0,5 und +2 Ga", { key: "ozeanNullGa", rel: "band", zahl: 0.5, bis: 2, einheit: "Ga" }),
                    K.soll(KG, 8, "Sonnenscheibe bei +5 Ga ≥ 100× Fläche", { key: "sonneFaktor" }),
                ],
                zeuge: zMin({ zeiten: 5, sonne: 1 }),
                zeugeText: "fünf Zeiten des Superkontinents gezählt, die Sonne wuchs",
                taeter: "planet-core.js Schlüsselbilder (Ende +1,06 Ga) · welt-licht.js (keine Größe der Sonne je Epoche)",
                nicht: "Ozeanverlust und Roter Riese nicht erzeugbar",
                leser: "planet-core.js:678 — die Zeit endet bei +1 061 Ma; welt-licht.js:711 sonnenRichtung kennt keine Scheibengröße je Epoche",
                gruen: gut({ landZusammenProzent: 76, superMa: 240, ozeanNullGa: 1.2, sonneFaktor: 120 }, { zeiten: 5, sonne: 1 }),
                attrappen: [{ name: "die Halte als Zahlen ohne Bild der Sonne", roh: gut({ landZusammenProzent: 76, superMa: 250, ozeanNullGa: 1, sonneFaktor: 100 }, { zeiten: 5, sonne: 0 }) }],
            },
            9: {
                u: {},
                soll: [K.soll(KG, 9, "Lagefehler ≤ 5 %", { key: "moraeneLagefehlerProzent", einheit: "%" }), K.soll(KG, 9, "100 Saaten", { key: "saaten", rel: "≥" }), K.soll(KG, 9, "1 000 Planeten", { key: "planeten", rel: "≥" })],
                auge: { pose: "Ego an der Wiese (heute keine Moräne, kein fremder Planet)", vorbild: "Fremdwelt-Probe R10 an Eisrand, Meeresspiegel und Klimazonen" },
                taeter: "gelaende-core.js ortSaat (die Kaltzeit ist eine neue Saat, das Eis legt nichts ab)",
                nicht: "keine Moräne am Eisrand",
                leser: "gelaende-core.js:5802 ortSaat — die Kaltzeit würfelt das Gelände neu; kein Leser legt am Eisrand der Zeit eine Moräne",
                gruen: gut({ moraeneLagefehlerProzent: 3, saaten: 100, planeten: 1000 }, {}),
                attrappen: [{ name: "die Moräne ohne Bild", roh: leer({ moraeneLagefehlerProzent: 3, saaten: 100, planeten: 1000 }) }],
            },
        },
    };

    // ════════════════════════════════════════ ARCHIV (S1–S8) ════════════════════════════════════════
    const archiv = {
        sek: 32,
        faecher: true,
        pfad: PFAD,
        ungefahren: "die Bilder (Kliff und Schutthang, Wand aus 2 km, Ego-Bilder der Jury) schießt die Probe nur am Gerät",
        mess: async function (H, U, M) {
            const R3 = (v) => (Number.isFinite(v) ? Math.round(v * 1000) / 1000 : null);
            const ziel = Object.keys(U);
            // DIE WAND DER WELT: die Schichtstufe an Tafelland-Saaten (die Reise-Welt am Ort, `schichtOrt`): der Hang im 2-m-Raster (61 × 61) um
            // die Treppe (Kliff ≥ 45°, Schutthang 30–40°), die Bänder des Schicht-Gesetzes; die Lagen im Fels (`felsLage`) in 3 m, eine Grenze über
            // 100 m verfolgt, 1 000 Säulen à 30 m (Lücken: ein Sprung der Paket-Folge); 20 Orte × 10 Zeiten (Milieu Land/Meer) gegen den Stoff der Tiefe
            const w = await H.seite(`
const K = globalThis.__gelaendeCore;
const samen = r._planetSamen();
await r._fadenQuelle();
const heim = r.constructor._weltGesetz(r.state.worldMeta).gelaende;
const R3 = (v) => (Number.isFinite(v) ? Math.round(v * 1000) / 1000 : null);
const ortVon = (o) => ({ samen: o.samen, version: o.version, breite: o.breite, laenge: o.laenge, zeitMa: o.zeitMa, delta: o.delta });
const lage = (o) => { const ort = ortVon(o); const O = K.ortGesetz(ort); const eg = K.erbgutNormal(K.ortErbgut(K.erbgutNormal(heim == null ? undefined : heim), o.delta.wildnis)); const saat = K.ortSaatWahl(ort, eg, SimplexNoise).saat; return { saat, O, L: K.lageAus({ seed: saat, baseHeight: K.GRUND.basis, waterLevel: K.GRUND.basis - O.meerUnterBasisM, ort, erbgut: { terme: eg, wildnis: eg[0] && eg[0].art === "wildnis" ? 1 : 0 }, regionSize: K.GRUND.kachel }, SimplexNoise) }; };
const lagePunkt = (k) => [Math.round((Math.asin(((k * 0.6180339887) % 1) * 2 - 1) * 180) / Math.PI * 100) / 100, Math.round((((k * 137.508) % 360) - 180) * 100) / 100];
const t0 = performance.now();
const wand = (L, so) => { const n = 61, g = []; for (let j = 0; j < n; j++) for (let i = 0; i < n; i++) g.push(K.hoehe(L, so.x - 60 + 2 * i, so.z - 60 + 2 * j, true)); const kl = [], sch = []; let mn = Infinity, mx = -Infinity; for (let j = 1; j < n - 1; j++) for (let i = 1; i < n - 1; i++) { const k = i + n * j; const a = (Math.atan(Math.hypot((g[k + 1] - g[k - 1]) / 4, (g[k + n] - g[k - n]) / 4)) * 180) / Math.PI; if (a >= 45) kl.push(a); if (a >= 30 && a <= 40) sch.push(a); if (g[k] < mn) mn = g[k]; if (g[k] > mx) mx = g[k]; } kl.sort((p, q) => p - q); return [kl.length, R3(kl[kl.length >> 1]), R3(kl[Math.floor(kl.length * 0.9)]), sch.length, R3(mx - mn)]; };
const tafel = [];
const L0 = r._gelaende(), so0 = K.schichtOrt(L0, -8000, -8000, 8000, 8000);
if (so0) tafel.push(["heim", so0.x, so0.z].concat(wand(L0, so0), [K.schichtMessung(L0).baender, null]));
for (let k = 0; tafel.length < 6 && k < 400 && performance.now() - t0 < 12000; k++) { const p = lagePunkt(k); const o = await r._planetAuftrag({ type: "planet-ort", samen, breite: p[0], laenge: p[1], zeitMa: 0 }); if (!o.land) continue; const x = lage(o); const so = K.schichtOrt(x.L, -8000, -8000, 8000, 8000); if (!so) continue; tafel.push([x.saat, so.x, so.z].concat(wand(x.L, so), [K.schichtMessung(x.L).baender, p])); }
const x0 = so0 ? so0.x : 0, z0 = so0 ? so0.z : 0, y0 = K.hoehe(L0, x0, z0, true);
const lg = new Set(); for (let d = 0; d <= 3; d += 0.05) { const q = {}; K.felsLage(x0, y0 - d, z0, 0, q); lg.add(q.paket + "/" + q.bank); }
let s = 4242; const zf = () => ((s = (s * 16807) % 2147483647) / 2147483647);
const verfolge = (xs, ys, zs, rx, rz) => { const q0 = {}; K.felsLage(xs, ys, zs, 0, q0); let yb = ys - q0.unten, weit = 0, sp = 0; for (let st = 1; st <= 100; st++) { const q = {}; K.felsLage(xs + rx * st, yb, zs + rz * st, 0, q); const c = Math.abs(q.unten) <= Math.abs(q.oben) ? yb - q.unten : yb + q.oben; const j = Math.abs(c - yb); if (j > sp) sp = j; if (j > 0.3) break; weit = st; yb = c; } return [weit, R3(sp)]; };
const grenzen = [];
for (let n = 0; n < 10; n++) { const x = n === 0 ? x0 : x0 + (zf() - 0.5) * 4000, z = n === 0 ? z0 : z0 + (zf() - 0.5) * 4000, w = zf() * 2 * Math.PI; grenzen.push(verfolge(x, K.hoehe(L0, x, z, true) - 1 - zf() * 4, z, Math.cos(w), Math.sin(w))); }
const weiten = grenzen.map((g) => g[0]).sort((p, q) => p - q);
const stetig = weiten[weiten.length >> 1], stetigVoll = grenzen.filter((g) => g[0] >= 100).length, sprung = Math.max(...grenzen.map((g) => g[1]));
let luecken = 0, saeulen = 0;
for (let n = 0; n < 1000; n++) { const x = (zf() - 0.5) * 20000, z = (zf() - 0.5) * 20000, y = K.hoehe(L0, x, z, true); let pv = null; for (let d = 0; d <= 30; d += 0.25) { const q = {}; K.felsLage(x, y - d, z, 0, q); if (pv !== null && Math.abs(q.paket - pv) > 1) luecken++; pv = q.paket; } saeulen++; }
const mil = [];
for (let k = 0; mil.length < 20 && k < 200; k++) { const p = lagePunkt(k); const a = await Promise.all([0, -10, -20, -30, -40, -50, -60, -70, -80, -90].map((z) => r._planetAuftrag({ type: "planet-ort", samen, breite: p[0], laenge: p[1], zeitMa: z }))); if (!a[0].land) continue; mil.push(a.map((o) => (o.land ? (K.ortGesetz(ortVon(o)).klimaHeute.spendeMm < 250 ? "wueste" : "land") : "meer"))); }
const gestein = new Set(); for (let n = 0; n < 40; n++) { const x = (zf() - 0.5) * 2000, z = (zf() - 0.5) * 2000; const y = r._voxelSurfaceY(x, z); if (y === null) continue; for (const d of [15, 30, 60, 120]) gestein.add(r._terrainMaterialAt(x, z, y - d)); }
return { tafel, heimY: R3(y0), lagen3m: lg.size, stetigM: stetig, stetigVoll, grenzen, sprungM: R3(sprung), luecken, saeulen, milieu: mil, gestein: [...gestein], ms: Math.round(performance.now() - t0) };
`);
            // die Tafelland-Saaten mit Kliff im Raster (tf); die Mediane laufen über ALLE Tafelland-Saaten — eine Treppe ohne Kliff zählt 0°
            const alle = w.tafel || [];
            const tf = alle.filter((x) => x[3] > 0);
            const med = (a) => (a.length ? a.slice().sort((p, q) => p - q)[a.length >> 1] : NaN);
            const h0 = w.heimY || 100, k0 = alle[0] && alle[0][0] === "heim" ? alle[0] : null;
            const pose = (ab) => (k0 ? { px: k0[1] + ab, py: h0 + 20, pz: k0[2], lx: k0[1], ly: h0, lz: k0[2] } : { ort: "wiese" });
            const mil = w.milieu || [];
            const wechsel = mil.reduce((s, r) => s + r.slice(1).filter((m, i) => m !== r[i]).length, 0);
            const arten = new Set(mil.flat());
            const aus = M.teil || {};
            aus[1] = {
                werte: Object.assign({ tafelSaaten: alle.length, mitKliff: tf.length }, alle.length ? { kliffGrad: R3(med(alle.map((x) => x[4] || 0))), kliffP90Grad: R3(med(alle.map((x) => x[5] || 0))), schuttZellen: tf.reduce((s, x) => s + x[6], 0) } : {}),
                zeuge: { tafelSaaten: tf.length, kliffZellen: tf.reduce((s, x) => s + x[3], 0), schuttZellen: tf.reduce((s, x) => s + x[6], 0), je: alle.map((x) => x.slice(0, 8)) },
            };
            // S2 DIE WAND AM FÄCHER (M4): je Adresse (Wand × Tiefe 0–45 m) die Lage der Säule an der Schichtstufe der Saat (gelaende-core
            // `felsLage`: Paket, Bank, Mächtigkeit) und ihre Farbe aus dem Gesetz, das der Boden der Welt zeichnet (`felsFarbe` mit dem
            // Grundton der Welt `FELS_STOFF.basis` und der Kante des Nah-Netzes, wie `felsStoff` im Faden und im Stamm sie ruft) — die
            // Heimat und die Tafelland-Saaten des Planeten (planet-ort → lageAus, die Saaten der Wand-Suche oben)
            const u2 = U[2];
            if (u2) {
                const WAND_AN = async (r, T, a, mit) => {
                    const K = globalThis.__gelaendeCore, memo = mit.memo || (mit.memo = {});
                    const W = mit.waende[a.saat];
                    let L = memo[a.saat];
                    if (!L) {
                        if (!W.p) L = r._gelaende();
                        else {
                            await r._fadenQuelle();
                            const o = await r._planetAuftrag({ type: "planet-ort", samen: r._planetSamen(), breite: W.p[0], laenge: W.p[1], zeitMa: 0 });
                            const heim = r.constructor._weltGesetz(r.state.worldMeta).gelaende;
                            const ort = { samen: o.samen, version: o.version, breite: o.breite, laenge: o.laenge, zeitMa: o.zeitMa, delta: o.delta };
                            const O = K.ortGesetz(ort), eg = K.erbgutNormal(K.ortErbgut(K.erbgutNormal(heim == null ? undefined : heim), o.delta.wildnis));
                            const saat = K.ortSaatWahl(ort, eg, SimplexNoise).saat;
                            L = K.lageAus({ seed: saat, baseHeight: K.GRUND.basis, waterLevel: K.GRUND.basis - O.meerUnterBasisM, ort, erbgut: { terme: eg, wildnis: eg[0] && eg[0].art === "wildnis" ? 1 : 0 }, regionSize: K.GRUND.kachel }, SimplexNoise);
                        }
                        memo[a.saat] = L;
                    }
                    const FS = r.constructor.FELS_STOFF, R4 = (v) => Math.round(v * 10000) / 10000;
                    const y = K.hoehe(L, W.x, W.z, true) - a.ort, q = {};
                    K.felsLage(W.x, y, W.z, 0, q);
                    const c = K.felsFarbe(FS.basis, W.x, y, W.z, 1, 0, 0, 0, 1, 0, FS.netz.fuss, [0, 0, 0]);
                    return { d: a.ort, lage: q.paket + "/" + q.bank, dicke: R4(q.dicke), Y: R4(0.2126 * c[0] + 0.7152 * c[1] + 0.0722 * c[2]), rgb: c.map(R4), basis: FS.basis.basis.map(R4).join(",") };
                };
                const TIEFEN = [];
                for (let d = 0; d <= (Number(u2.tiefenM) || 45); d += Number(u2.schrittM) || 1.5) TIEFEN.push(Math.round(d * 100) / 100);
                const jeWand = (aus) => { const m = new Map(); for (const x of aus) { if (!m.has(x.a.saat)) m.set(x.a.saat, []); m.get(x.a.saat).push(x.w); } return [...m.values()].map((l) => l.sort((p, q) => p.d - q.d)); };
                const medianVon = (x) => (x.length ? x.slice().sort((p, q) => p - q)[x.length >> 1] : null);
                const RW = await FAECHER((c) => H.seite(c), {
                    gesetz: { fn: WAND_AN, export: "gelaende-core.js:3855 felsFarbe (Paket, Bank, Korn, Flechte, Moos — kein Milieu) · gelaende-core.js:3607 felsLageO", leser: "voxel-worker.js:4178 felsStoff (der Boden des Fadens) · stamm/gelaende-boden.js:2572 _felsStoff mit EINEM Grundton (stamm/gelaende-boden.js:3142 FELS_STOFF.basis)" },
                    adressen: { saaten: alle.map((_, i) => i), orte: TIEFEN },
                    mit: { waende: alle.map((x) => ({ p: x[9] || null, x: x[1], z: x[2] })) },
                    ms: Number(u2.ms) || 6000,
                    masse: {
                        waende: { wie: "verschieden", feld: "a.saat" },
                        tiefen: { wie: "verschieden", feld: "a.ort" },
                        lagen: { wie: (v, aus) => jeWand(aus).reduce((n, l) => n + new Set(l.map((w) => w.lage)).size, 0), feld: "lage" },
                        baenderJe10m: { wie: (v, aus) => medianVon(jeWand(aus).filter((l) => l.length > 1).map((l) => { const mx = Math.max(...l.map((w) => w.Y)) || 1; let n = 0; for (let i = 1; i < l.length; i++) if (Math.abs(l[i].Y - l[i - 1].Y) / mx > 0.05) n++; return (10 * n) / Math.max(1e-9, l[l.length - 1].d - l[0].d); })), feld: "Y" },
                        grundtoene: { wie: "verschieden", feld: "basis" },
                        streuY: { wie: (v) => { const z = v.filter(Number.isFinite), m = z.reduce((s, x) => s + x, 0) / Math.max(1, z.length); return z.length > 1 ? Math.sqrt(z.reduce((s, x) => s + (x - m) ** 2, 0) / z.length) : null; }, feld: "Y" },
                    },
                    schlecht: { feld: "Y", richtung: "max" },
                    pose: (a, w) => "Ego 150 m vor der Wand " + (alle[a.saat] ? alle[a.saat][0] : a.saat) + ", Blick auf die Lage " + w.lage + " in " + w.d + " m Tiefe unter der Kante (Y " + w.Y + ")",
                    ungemessen: ["der Bildvergleich gegen die Fotos des Colorado-Plateaus (Farbbänder, Rhythmus) — Panel R11, am Gerät"],
                });
                const W2 = RW.werte;
                aus[2] = {
                    werte: Object.assign({ lagen3m: w.lagen3m, waende: W2.waende, lagen: W2.lagen, grundtoene: W2.grundtoene }, W2.baenderJe10m != null ? { baenderJe10m: R3(W2.baenderJe10m) } : {}, W2.streuY != null ? { streuY: R3(W2.streuY) } : {}),
                    zeuge: { gestein: w.gestein, waende: W2.waende, tiefen: W2.tiefen, lagen: W2.lagen, grundtoene: W2.grundtoene, gerissen: RW.gerissen, akte: RW.akte },
                    auge: await M.auge("zeit-archiv-s2", pose(150)),
                    taeter: (RW.fehler.length && !RW.gemessen ? "Leser fehlt: " + RW.fehler[0].fehler + " · " : "") + "gelaende-core.js:3855 felsFarbe färbt Paket und Bank aus EINEM Grundton je Welt (" + W2.grundtoene + " an " + W2.waende + " Wänden, stamm/gelaende-boden.js:3142 FELS_STOFF.basis) — " + R3(W2.baenderJe10m) + " Farbbänder je 10 m, kein Milieu färbt die Lage · " + RW.akte,
                    nicht: "keine Gesteinsart je Lage: die Bänke des Fels-Gesetzes tragen Paket und Bank (" + W2.lagen + " Lagen an " + W2.waende + " Wänden), keinen Stoff aus dem Ablagerungsmilieu (gelaende-core.js:3607 felsLageO, gelaende-core.js:3855 felsFarbe ohne Milieu); in der Tiefe liegt " + (w.gestein || []).join(", "),
                };
            }
            aus[3] = {
                werte: { lagen3m: w.lagen3m, stetigM: w.stetigM, grenzenVoll: w.stetigVoll },
                zeuge: { episoden: 0, lagen: w.lagen3m, sprungM: w.sprungM, grenzen: w.grenzen },
                nicht: "die Lagen sind keine Ablagerungs-Episoden: die bereiste Geschichte schreibt nichts in den Fels (gelaende-core.js:3605 felsLageO: Bänke aus Rausch und Neigung, ohne Alter) — " + w.lagen3m + " Lagen in 3 m, die Grenzen im Median stetig über " + w.stetigM + " m (" + w.stetigVoll + " von 10 über 100 m)",
            };
            aus[4] = { werte: { saeulen: w.saeulen, luecken: w.luecken }, zeuge: { saeulen: w.saeulen, luecken: w.luecken, phasen: 0 }, nicht: "keine Diskordanz, keine Faltung, keine Verwerfung: " + w.saeulen + " Säulen à 30 m tragen " + w.luecken + " Lücken — die Pakete folgen lückenlos (gelaende-core.js:3605 felsLageO), keine Hebungs- oder Abtragsphase der Geschichte schreibt sich ein" };
            aus[5] = { werte: { orte: mil.length, milieuWechsel: wechsel, milieuArten: arten.size, gesteinsArten: (w.gestein || []).length }, zeuge: { orte: mil.length, wechsel, gestein: w.gestein }, nicht: "das Gestein kennt kein Milieu: die Zeitreise trägt " + arten.size + " Milieus (" + [...arten].join(", ") + ", " + wechsel + " Wechsel an " + mil.length + " Orten über 90 Ma), die Bohrung findet " + (w.gestein || []).join(", ") + " — kein mariner Kalk, kein Evaporit, keine Kohle (stamm/vegetation-wiese.js:2362 _terrainMaterialAt)" };
            aus[6] = { werte: Object.assign({ wandHoeheM: tf.length ? Math.max(...tf.map((x) => x[7])) : null }, k0 ? { abstandM: 2 } : {}), zeuge: { tafelSaaten: tf.length }, auge: await M.auge("zeit-archiv-s6", pose(2000)), nicht: "keine Kilometer-Wand: die höchste Wand der Tafelland-Saaten misst " + (tf.length ? Math.max(...tf.map((x) => x[7])) : "?") + " m im 120-m-Fenster (gelaende-core.js:397 Schicht-Gesetz, schichtDicke ≤ 60 m), keine Milieu-Lagen" };
            aus[7] = { werte: { bilder: 0, tafelSaaten: tf.length }, zeuge: {}, auge: await M.auge("zeit-archiv-s7", { ort: "wiese" }), nicht: "Agens, Abfolge und Alter nicht lesbar: Wand und Landform tragen keine Geschichte (gelaende-core.js:5802 ortSaat würfelt jede Epoche neu)" };
            aus[8] = { werte: { welten: 1, aufschluesse: tf.length }, zeuge: { welten: 1 }, nicht: "kein Gesteinsgedächtnis: die Säule trägt keine Epoche (gelaende-core.js:3605 felsLageO), die Welten tragen keine eigenen Konstanten (voxel-worker.js:1176)" };
            const o = {};
            for (const nr of ziel) o[nr] = aus[nr] || M.nicht("ungemessen");
            return { sprossen: o };
        },
        sprossen: {
            1: {
                u: { fensterM: 120, rasterM: 2 },
                soll: [K.soll(AR, 1, "Kliff 60–85°", { key: "kliffGrad", einheit: "°" })],
                zeuge: zMin({ tafelSaaten: 3, kliffZellen: 50, schuttZellen: 50 }),
                zeugeText: "≥ 3 Tafelland-Saaten mit Kliff und Schutthang im Raster",
                taeter: "gelaende-core.js Schicht-Gesetz (T5: Pediment → Schutthang → Kliff)",
                gruen: gut({ kliffGrad: 71, tafelSaaten: 6 }, { tafelSaaten: 6, kliffZellen: 400, schuttZellen: 600 }),
                attrappen: [
                    { name: "74° aus dem Regler kliffWinkel abgelesen (kein Raster)", roh: leer({ kliffGrad: 74 }) },
                    { name: "ein Kliff ohne Schutthang", roh: gut({ kliffGrad: 71, tafelSaaten: 6 }, { tafelSaaten: 6, kliffZellen: 400, schuttZellen: 0 }) },
                ],
            },
            2: {
                u: { tiefenM: 45, schrittM: 1.5, ms: 6000 },
                soll: [ohneZahl(AR, 2, "Bildvergleich gegen Fotos des Colorado-Plateaus (Farbbänder, Rhythmus)", "bildvergleich")],
                auge: { pose: "Ego 150 m vor der Schichtstufe der Heimat", vorbild: "Fotos des Colorado-Plateaus (Farbbänder, Rhythmus), Prüfer-Satz R11" },
                taeter: "gelaende-core.js:3855 felsFarbe (Bänke ohne Gesteinsart, EIN Grundton je Welt)",
                nicht: "keine Gesteinsart je Lage",
                leser: "voxel-worker.js:4178 felsStoff — die Farbe der Lage aus Paket und Bank (gelaende-core.js:3607 felsLageO) über EINEM Grundton (stamm/gelaende-boden.js:3142 FELS_STOFF.basis); kein Ablagerungsmilieu, kein Korn je Lage",
                unklar: "der Richter nennt keine Zahl — Vorschlag: „Farbbänder je 10 m ≥ 3, Rhythmus-Periode ±30 % des Fotos, Blindpaar Fehler ≥ 35 %“",
                gruen: gut({ bildvergleich: 1 }, {}),
                attrappen: [{ name: "der Vergleich ohne Bild", roh: leer({ bildvergleich: 1 }) }],
            },
            3: {
                u: { tiefeM: 3, strecke: 100 },
                soll: [
                    K.soll(AR, 3, "Grabung 3 m: Lagen = Ablagerungs-Episoden der bereisten Geschichte ±10 %", { key: "lagenJeEpisoden", ref: 1, refQuelle: "Erde: die Lage als Ablagerungs-Episode (Steno 1669, Warven-Zählung De Geer 1912)" }),
                    K.soll(AR, 3, "Grenzen stetig über ≥ 100 m", { key: "stetigM", einheit: "m" }),
                ],
                zeuge: zMin({ episoden: 1, lagen: 1 }),
                zeugeText: "die bereiste Geschichte trug Episoden, die Grabung zählte Lagen",
                taeter: "gelaende-core.js felsLageO (Lagen ohne Alter)",
                nicht: "die Lagen tragen keine Episoden der Geschichte",
                leser: "gelaende-core.js:3605 felsLageO — die Bank liest Rausch und Neigung, kein Leser schreibt die bereiste Geschichte (Zeit, Milieu) in den Fels",
                gruen: gut({ lagenJeEpisoden: 1.05, stetigM: 100 }, { episoden: 6, lagen: 6 }),
                attrappen: [{ name: "Lagen gezählt, keine Episode (1 aus 0/0)", roh: gut({ lagenJeEpisoden: 1, stetigM: 100 }, { episoden: 0, lagen: 4 }) }],
            },
            4: {
                u: { saeulen: 1000, tiefeM: 30 },
                soll: [K.soll(AR, 4, "1 000 Zufallssäulen", { key: "saeulen", rel: "≥" }), K.soll(AR, 4, "jede Lücke = eine Hebungs- oder Abtragsphase der Geschichte (100 %)", { key: "lueckenTrefferProzent", rel: "≥", zahl: 100, einheit: "%" })],
                zeuge: zMin({ saeulen: 1000, luecken: 1, phasen: 1 }),
                zeugeText: "1 000 Säulen, Lücken gefunden, jede einer Phase zugeordnet",
                taeter: "gelaende-core.js felsLageO (lückenlose Pakete)",
                nicht: "keine Diskordanz, Faltung, Verwerfung",
                leser: "gelaende-core.js:3605 felsLageO — die Pakete folgen lückenlos; kein Leser frisst eine Lücke aus Hebung oder Abtrag der Geschichte",
                gruen: gut({ saeulen: 1000, lueckenTrefferProzent: 100 }, { saeulen: 1000, luecken: 140, phasen: 12 }),
                attrappen: [{ name: "100 % von 0 Lücken", roh: gut({ saeulen: 1000, lueckenTrefferProzent: 100 }, { saeulen: 1000, luecken: 0, phasen: 0 }) }],
            },
            5: {
                u: { orte: 20, zeitenMa: [0, -10, -20, -30, -40, -50, -60, -70, -80, -90] },
                soll: [K.soll(AR, 5, "Bohrung → Gestein der Lage jenes Alters stimmt ≥ 95 %", { key: "trefferProzent", einheit: "%" })],
                zeuge: zMin({ orte: 20, wechsel: 1 }),
                zeugeText: "20 Orte, das Milieu wechselte über die Zeit",
                taeter: "stamm/vegetation-wiese.js _terrainMaterialAt (Stein ohne Milieu)",
                nicht: "das Gestein kennt kein Milieu",
                leser: "stamm/vegetation-wiese.js:2362 _terrainMaterialAt — unter 12 m „stein“ (oder Eisen-Ader), kein Kalk, Evaporit, Kohle nach dem Milieu der Zeit",
                gruen: gut({ trefferProzent: 96 }, { orte: 20, wechsel: 40 }),
                attrappen: [{ name: "96 % ohne Bohrung", roh: leer({ trefferProzent: 96 }) }],
            },
            6: {
                u: { abstandM: 2000 },
                soll: [K.soll(AR, 6, "Spiel-Wand aus 2 km", { key: "abstandM", rel: "≥", zahl: 2, einheit: "km" }), K.soll(AR, 6, "Fachleute ordnen ≥ 80 % der Lagen dem richtigen Milieu zu", { key: "milieuProzent", einheit: "%" })],
                auge: { pose: "Ego 2 km vor der Schichtstufe der Heimat (die Welt trägt keine Kilometer-Wand)", vorbild: "Grand-Canyon-Fotos aus 2 km (Fachleute, R11)" },
                taeter: "gelaende-core.js Schicht-Gesetz (Wände ≤ Schichtdicke × Lagen, kein Milieu)",
                nicht: "keine Kilometer-Wand mit Milieu-Lagen",
                leser: "gelaende-core.js:2058 schichtOrt — die Treppe der Tafelländer trägt Pakete ohne Milieu; kein Canyon von 1 km",
                gruen: gut({ abstandM: 2, milieuProzent: 84 }, {}),
                attrappen: [{ name: "die Fachleute ohne Bild", roh: leer({ abstandM: 2, milieuProzent: 84 }) }],
            },
            7: {
                u: { orte: 50 },
                soll: [
                    K.soll(AR, 7, "Fachjury bestimmt aus 50 Ego-Bildern das Agens ≥ 70 %", { key: "agensProzent", einheit: "%" }),
                    K.soll(AR, 7, "die Abfolge ≥ 60 %", { key: "abfolgeProzent", einheit: "%" }),
                    K.soll(AR, 7, "das Alter Rang ≥ 0,6", { key: "alterRang" }),
                ],
                auge: { pose: "Ego an 50 Orten (heute: die Wiese)", vorbild: "Fachjury, Prüfer-Satz R11 (Zufall 25 %)" },
                taeter: "gelaende-core.js ortSaat (keine Geschichte in Wand und Form)",
                nicht: "Agens, Abfolge, Alter nicht in Wand und Form",
                leser: "gelaende-core.js:5802 ortSaat — die Epoche würfelt das Gelände neu, kein Agens schreibt sich in die Form",
                gruen: gut({ agensProzent: 74, abfolgeProzent: 64, alterRang: 0.66 }, {}),
                attrappen: [{ name: "die Jury ohne Bild", roh: leer({ agensProzent: 74, abfolgeProzent: 64, alterRang: 0.66 }) }],
            },
            8: {
                u: { welten: 100, aufschluesse: 5 },
                soll: [K.soll(AR, 8, "100 Welten", { key: "welten", rel: "≥" }), K.soll(AR, 8, "aus 5 Aufschlüssen", { key: "aufschluesse", rel: "≥" }), K.soll(AR, 8, "≥ 80 % getroffen", { key: "trefferProzent", einheit: "%" })],
                zeuge: zMin({ welten: 100 }),
                zeugeText: "100 Welten, ihre Geschichte aus 5 Aufschlüssen gelesen",
                taeter: "gelaende-core.js felsLageO (kein Gesteinsgedächtnis)",
                nicht: "kein Gesteinsgedächtnis über 4,5 Ga",
                leser: "gelaende-core.js:3605 felsLageO — die Säule trägt keine Epoche; voxel-worker.js:1176 liest keine Konstanten der Welten",
                gruen: gut({ welten: 100, aufschluesse: 5, trefferProzent: 84 }, { welten: 100 }),
                attrappen: [{ name: "84 % ohne Welt", roh: leer({ welten: 100, aufschluesse: 5, trefferProzent: 84 }) }],
            },
        },
    };

    return { leitern: { [KG]: klima, [AR]: archiv } };
})());

// ── DIE PERSPEKTIVE planet.erde (1 Leiter, 6 Sprossen): die echte Erde ──────────────────────────────────────────────────────────
// Der Leser des Spiels ist der Planet-Faden (`r._planetAuftrag`, stamm/gelaende-chunks.js:643 → voxel-worker.js planetOrtAuftrag:1175 →
// planet-core planetOrt/planetPunkt): je Lage { land, hoeheM, kuesteKm } — derselbe Weg, den die Reise des Spiels ruft. Die Erd-Referenz
// (Küstenpunkte aus dem Höhenmodell, gerundet auf ~1 km) ist das Vorbild der Station, nie eine Formel der Welt. Eine Erd-Saat mit
// Schlüssel (R4) gibt es nicht: planetPlan liest nur den Samen (planet-core.js) — jede Sprosse misst darum am Samen „erde“, was die
// Welt heute dort trägt, und urteilt ROT „Umfang nicht erzeugbar“, solange der Schlüssel fehlt.
L.perspektive("erde", (() => {
    const ID = "planet.erde.gestalt";
    const PFAD = ["planet-core.js", "voxel-worker.js", "stamm/gelaende-chunks.js", "stamm/feld-leben.js", "gelaende-core.js", "scripts/werkbank.cjs"];
    // der Zeuge der Welt: die Zahl kommt aus N Antworten des Planet-Fadens zu verschiedenen Lagen (eine Konstante trüge keine Streuung)
    const zeugeFaden = (min) => (roh) => {
        const z = roh.zeuge || {};
        if (!(z.antworten >= min)) return "nur " + (z.antworten || 0) + " Antworten des Planet-Fadens (Soll ≥ " + min + ")";
        if (!(z.streuungM > 0)) return "die Antworten tragen keine Streuung der Höhe (eine Konstante, nicht die Welt)";
        if (!z.version) return "keine Fassung des Planet-Kerns in der Antwort";
        return null;
    };
    const gut = (werte, n) => ({ werte, zeuge: { antworten: n, streuungM: 412, version: "planet-h2-4", samen: "erde" } });
    return {
        leitern: {
            [ID]: {
                sek: 30,
                faecher: true,
                pfad: PFAD,
                // EIN Messprogramm für alle Sprossen: der Fächer (M4) an den Referenz-Lagen der Sprossen (U[nr].punkte) — je Adresse der
                // Planet-Faden am Samen „erde“ (planet-ort → planetPunkt: Land, Höhe, Abstand zur Küste), der Lagefehler als |Abstand zur
                // Küste| an echten Küstenpunkten; dazu der Schlüssel der Erd-Saat — fehlt er, ist jeder Umfang nicht erzeugbar
                mess: async function (H, U, M) {
                    const KUESTE_AN = async (r, T, a) => {
                        await r._fadenQuelle();
                        const o = await r._planetAuftrag({ type: "planet-ort", samen: a.saat, breite: a.ort[0], laenge: a.ort[1], zeitMa: 0 });
                        return { land: o.land ? 1 : 0, hoeheM: o.hoeheM, km: Math.round(Math.abs(o.kuesteKm) * 1000) / 1000, version: o.version };
                    };
                    const akten = [];
                    const frage = async (punkte, nr) => {
                        const RE = await FAECHER((c) => H.seite(c), {
                            gesetz: { fn: KUESTE_AN, export: "voxel-worker.js:1446 planetOrtAuftrag → planet-core.js:1880 planetPunkt (kont: der Abstand zur Küste) · planet-core.js:312 planetPlan(samen) ohne Erd-Schlüssel", leser: "stamm/feld-leben.js:1298 _planetAuftrag planet-ort (die Reise: der Ort der Welt auf dem Planeten)" },
                            adressen: { saaten: ["erde"], orte: punkte },
                            ms: 8000,
                            masse: {
                                antworten: { wie: "anzahl", feld: "km" },
                                land: { wie: "summe", feld: "land" },
                                lagefehlerKm: { wie: "mittel", feld: "km" },
                                lagefehlerP90Km: { wie: (v) => { const k = v.filter(Number.isFinite).sort((x, y) => x - y); return k.length ? k[Math.min(k.length - 1, Math.ceil(0.9 * k.length) - 1)] : null; }, feld: "km" },
                                streuungM: { wie: (v) => { const z = v.filter(Number.isFinite), m = z.reduce((t, x) => t + x, 0) / Math.max(1, z.length); return z.length ? Math.sqrt(z.reduce((t, x) => t + (x - m) ** 2, 0) / z.length) : 0; }, feld: "hoeheM" },
                                version: { wie: "erste", feld: "version" },
                            },
                            schlecht: { feld: "km", richtung: "max" },
                            pose: (a, w) => "Ego an der Küste " + a.ort[0] + "/" + a.ort[1] + " der Erde — die Welt am Samen „erde“ trägt dort " + (w.land ? "Land " + Math.round(w.hoeheM) + " m" : "Meer") + ", " + w.km + " km von ihrer Küste",
                            ungemessen: ["S" + nr + ": das Panel am Ort (am Gerät)"],
                        });
                        akten.push(RE.akte);
                        return RE;
                    };
                    // der Schlüssel der Erd-Saat (R4): ein Leser im Spiel, der ihn trägt — heute keiner (die Probe fragt die Welt, nicht den Text)
                    const schluessel = await H.seite("const G = r._gelaende && r._gelaende(); return !!(G && G.ort && G.ort.teil && G.ort.teil.erdSchluessel);");
                    const aus = M.teil || {};
                    for (const nr of Object.keys(U)) {
                        const u = U[nr];
                        const werte = {};
                        let zeuge = { antworten: 0 };
                        if (u.punkte && u.punkte.length) {
                            const RE = await frage(u.punkte, nr), W = RE.werte;
                            if (W[u.mass] != null) werte[u.mass] = Math.round(W[u.mass] * 1000) / 1000;
                            zeuge = { antworten: W.antworten || 0, land: W.land, streuungM: W.streuungM, version: W.version, samen: "erde", gerissen: RE.gerissen, akte: RE.akte };
                        }
                        let auge;
                        if (u.auge) auge = await M.auge("erde-s" + nr, u.auge);
                        const nicht = !schluessel ? "keine Erd-Saat mit Schlüssel (R4) — der Planet liest nur den Samen (planet-core planetPlan); " + u.fehlt : u.fehlt || null;
                        aus[nr] = { werte, zeuge, auge, ...(nicht ? { nicht } : {}), ...(zeuge.akte ? { taeter: "planet-core.js:312 planetPlan liest keinen Erd-Schlüssel (R4): am Samen „erde“ liegt die Welt " + (u.mass === "lagefehlerP90Km" ? "im p90 " : "im Mittel ") + werte[u.mass] + " km neben der Küste der Erde (" + u.mass + ", " + zeuge.antworten + " Küstenpunkte, " + zeuge.land + " davon Land) · " + zeuge.akte } : {}) };
                    }
                    return { sprossen: aus };
                },
                sprossen: {
                    1: {
                        u: {
                            mass: "lagefehlerKm",
                            // der Golf von Neapel mit dem Vesuv: Küstenpunkte (Breite, Länge in Grad)
                            punkte: [[40.836, 14.248], [40.822, 14.12], [40.628, 14.375], [40.75, 14.45], [40.7, 14.48], [40.78, 14.09], [40.66, 14.43], [40.81, 14.33], [40.78, 14.37], [40.57, 14.32]],
                            auge: { ort: "wiese" },
                            fehlt: "die Region am Ort der Erde (Golf, Hauptgipfel, Hauptfluss) — kein Leser setzt eine Region der Erde in die Welt",
                        },
                        soll: [K.soll(ID, 1, "mittlerer Lagefehler ≤ 5 km", { key: "lagefehlerKm", einheit: "km" })],
                        auge: { pose: "Ego an 3 Posen der Region (Werkbank /bild am Ort)", vorbild: "Ortskundige wählen die Region aus 10 Kandidaten (≥ 70 %)" },
                        zeuge: zeugeFaden(10),
                        zeugeText: "der Fächer: 10 Küstenpunkte des Golfs von Neapel am Planet-Faden (Samen „erde“), die Höhen streuen, die Fassung des Kerns steht",
                        taeter: "planet-core.js planetPlan (kein Erd-Schlüssel, R4)",
                        nicht: "keine Erd-Saat mit Schlüssel (R4)",
                        leser: "planet-core.js:312 — planetPlan(samen, koerperIn) liest keinen Erd-Schlüssel (R4); der Abstand zur Küste aus planet-core.js:1880 planetPunkt über voxel-worker.js:1446 planetOrtAuftrag, gelesen in stamm/feld-leben.js:1298",
                        gruen: gut({ lagefehlerKm: 3.2 }, 10),
                        attrappen: [
                            { name: "der Lagefehler als Konstante ohne Antwort des Fadens", roh: { werte: { lagefehlerKm: 3.2 }, zeuge: { antworten: 0 } } },
                            { name: "EIN Küstenpunkt (kein Fächer)", roh: { werte: { lagefehlerKm: 3.2 }, zeuge: { antworten: 1, streuungM: 0, version: "planet-h2-4", samen: "erde" } } },
                            { name: "zehn Antworten ohne Streuung (eine Konstante)", roh: { werte: { lagefehlerKm: 3.2 }, zeuge: { antworten: 10, streuungM: 0, version: "planet-h2-4", samen: "erde" } } },
                        ],
                    },
                    2: {
                        u: { mass: "lagefehlerKm", punkte: [], fehlt: "die 100 größten Formen eines Kontinents und die Köppen-Klasse an 1 000 Punkten — kein Leser der Erd-Formen" },
                        soll: [K.soll(ID, 2, "Lagefehler der 100 größten Formen ≤ 50 km", { key: "lagefehlerKm", einheit: "km" }), K.soll(ID, 2, "Köppen-Klasse an 1 000 Punkten richtig ≥ 80 %", { key: "koeppenProzent", zahl: 80, einheit: "%" })],
                        zeuge: zeugeFaden(100),
                        taeter: "planet-core.js planetPlan (kein Erd-Schlüssel, R4)",
                        nicht: "keine Erd-Saat mit Schlüssel (R4)",
                        leser: "planet-core.js:307 — planetPlan(samen, koerperIn) liest keinen Erd-Schlüssel (R4)",
                        gruen: gut({ lagefehlerKm: 31, koeppenProzent: 84 }, 1100),
                        attrappen: [{ name: "Köppen 84 % aus einer Tabelle (keine Antwort des Fadens)", roh: { werte: { lagefehlerKm: 31, koeppenProzent: 84 }, zeuge: { antworten: 0 } } }],
                    },
                    3: {
                        u: {
                            mass: "lagefehlerP90Km",
                            // Küstenpunkte der Welt: Lissabon, Kapstadt, Sydney, Rio, Mumbai, Halifax, Valparaíso, Dakar, Perth, Tokio-Bucht, Anchorage,
                            // Reykjavík, Mombasa, Lima, Honolulu, Murmansk, Auckland, Karachi, Chennai, Ushuaia
                            punkte: [[38.7, -9.42], [-34.36, 18.47], [-33.86, 151.21], [-22.97, -43.18], [18.94, 72.82], [44.65, -63.57], [-33.03, -71.63], [14.69, -17.45], [-31.95, 115.75], [35.45, 139.65], [61.22, -149.9], [64.15, -21.95], [-4.06, 39.67], [-12.06, -77.15], [21.3, -157.86], [68.97, 33.08], [-36.84, 174.77], [24.84, 66.98], [13.08, 80.29], [-54.81, -68.31]],
                            auge: { ort: "wiese" },
                            fehlt: "die Pose Orbit bis Boden — die Werkbank kennt keine Orbit-Pose",
                        },
                        soll: [K.soll(ID, 3, "Küstenlinie p90 ≤ 20 km", { key: "lagefehlerP90Km", einheit: "km" }), K.soll(ID, 3, "Panel-2AFC ≤ 70 %", { key: "panelProzent", einheit: "%" })],
                        auge: { pose: "Orbit über der Erde (heute nicht erzeugbar; geschossen am Boden der Wiese)", vorbild: "Satellitenmosaik der Erde, Panel-2AFC ≤ 70 %" },
                        taeter: "planet-core.js planetPlan (kein Erd-Schlüssel, R4)",
                        nicht: "keine Erd-Saat, keine Orbit-Pose",
                        leser: "scripts/werkbank.cjs:2110 — /bild kennt keine Pose über der Atmosphäre (Orbit)",
                        gruen: gut({ lagefehlerP90Km: 12, panelProzent: 60 }, 20),
                        attrappen: [{ name: "p90 12 km ohne Antwort des Fadens", roh: { werte: { lagefehlerP90Km: 12, panelProzent: 60 }, zeuge: { antworten: 0 } } }],
                    },
                    4: {
                        u: { mass: "lagefehlerP90Km", punkte: [], auge: { ort: "wiese" }, fehlt: "10⁴ benannte Orte — kein Ortsverzeichnis in der Welt" },
                        soll: [K.soll(ID, 4, "Lagefehler p90 ≤ 1 km", { key: "lagefehlerP90Km", einheit: "km" }), K.soll(ID, 4, "Ego-Blindpaar gegen ein Foto des Orts ≤ 70 %", { key: "blindProzent", einheit: "%" })],
                        auge: { pose: "Ego am benannten Ort (heute: die Wiese)", vorbild: "ein Foto des Orts aus dem Ortsverzeichnis (GeoNames), Blindpaar ≤ 70 %" },
                        taeter: "planet-core.js (kein Ortsverzeichnis)",
                        nicht: "kein Ortsverzeichnis der Erde",
                        leser: "planet-core.js:2290 — planetOrt kennt keine benannten Orte (Ortsverzeichnis GeoNames)",
                        gruen: gut({ lagefehlerP90Km: 0.6, blindProzent: 64 }, 1000),
                        attrappen: [{ name: "p90 0,6 km ohne Antwort", roh: { werte: { lagefehlerP90Km: 0.6, blindProzent: 64 }, zeuge: { antworten: 0 } } }],
                    },
                    5: {
                        u: { mass: "lageKm", punkte: [], fehlt: "10⁴ Städte am Ort der Erde — die Siedlung liest kein Verzeichnis realer Städte" },
                        soll: [
                            K.soll(ID, 5, "Lage ≤ 2 km", { key: "lageKm", einheit: "km" }),
                            K.soll(ID, 5, "Einwohner ±30 %", { key: "einwohnerAbw", rel: "≤", zahl: 30, einheit: "%" }),
                            K.soll(ID, 5, "Orientierungs-Entropie und Blockgröße ±20 %", { key: "planAbw", rel: "≤", zahl: 20, einheit: "%" }),
                        ],
                        zeuge: zeugeFaden(100),
                        taeter: "stamm/siedlung-ort.js (keine realen Städte)",
                        nicht: "keine Städte der Erde",
                        leser: "stamm/siedlung-ort.js:58 — _ortPlanSetzen liest keinen realen Stadtplan (OpenStreetMap)",
                        gruen: gut({ lageKm: 1.1, einwohnerAbw: 18, planAbw: 12 }, 100),
                        attrappen: [{ name: "100 Städte aus einer Liste ohne Welt", roh: { werte: { lageKm: 1.1, einwohnerAbw: 18, planAbw: 12 }, zeuge: { antworten: 0 } } }],
                    },
                    6: {
                        u: { mass: "lagefehlerKm", punkte: [], auge: { ort: "wiese" }, fehlt: "jeder Ort, den ein Mensch Heimat nennt — kein Erd-Schlüssel je km²" },
                        soll: [K.soll(ID, 6, "Tal, Flusslauf und Straßenzug erkannt ≥ 80 %", { key: "erkanntProzent", einheit: "%" }), K.soll(ID, 6, "2AFC Ego-Bild gegen eigenes Foto ≤ 75 %", { key: "afcProzent", einheit: "%" })],
                        auge: { pose: "Ego am Wohnort des Prüfers (heute: die Wiese)", vorbild: "das eigene Foto des Prüfers vom Wohnort (Heimat-Probe, 100 Menschen)" },
                        taeter: "planet-core.js planetPlan (kein Erd-Schlüssel, R4)",
                        nicht: "keine Erd-Saat je km²",
                        leser: "planet-core.js:307 — planetPlan(samen, koerperIn) liest keinen Erd-Schlüssel (R4)",
                        gruen: gut({ erkanntProzent: 85, afcProzent: 70 }, 100),
                        attrappen: [{ name: "die Heimat-Probe ohne Bild", roh: { werte: { erkanntProzent: 85, afcProzent: 70 }, zeuge: { antworten: 0 } } }],
                    },
                },
            },
        },
    };
})());

module.exports = L.stationen();
module.exports.kern = KERN;
