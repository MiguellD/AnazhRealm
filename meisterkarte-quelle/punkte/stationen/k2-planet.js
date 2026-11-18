// stationen/k2-planet.js — DIE LEITER-RICHTER DES KAPITELS planet der Meisterkarte 2 (26 Leitern, 180 Sprossen; 18.11., Zweig
// richter-planet-leben-zusammenspiel). Je Perspektive EINE Probe in der warmen Welt der Sitzung, je Sprosse eine Station
// karte2.<leiter>#<nr>; der Kern unten ist geteilt mit k2-leben.js und k2-zusammenspiel.js (module.exports.kern).
"use strict";
const fs = require("fs");
const path = require("path");
const { seiteProbe, knapp } = require("./seite.cjs");

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
//   · eine Sprosse mit Auge (Blindpaar, Prüfer-Satz R11) schießt das Bild an der festen Pose, legt es ab und behauptet NIE GRÜN —
//     ihre Zahl trägt die Zeile `auge` mit Pose und Vorbild;
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
            for (const z of JSON.parse(fs.readFileSync(path.join(BASIS, "vision", "richter-tafel.json"), "utf8")).zeilen)
                if (z.richter === "gleich") belegtMap.set(z.leiter + "#" + z.sprosse, "Tafel: " + z.station);
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
    const ZAHL_RE = /[−-]?(?:\d{1,3}(?:[  ]\d{3})+|\d+)(?:,\d+)?(?:\s?·\s?10[⁰¹²³⁴⁵⁶⁷⁸⁹⁻]+)?|10[⁰¹²³⁴⁵⁶⁷⁸⁹⁻]+/g;
    const zahlVon = (t) => {
        const s = String(t).trim();
        const nur = /^10([⁰¹²³⁴⁵⁶⁷⁸⁹⁻]+)$/.exec(s);
        if (nur) return Math.pow(10, Number(nur[1].replace(/./g, (c) => HOCH[c])));
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
        const r = sprosseVon(leiter, nr).richter;
        if (typeof wort !== "string" || !wort || !r.includes(wort)) throw new Error("Soll „" + wort + "“ steht nicht wörtlich im Richter " + leiter + " S" + nr + ": „" + r + "“");
        const z = zahlenIn(wort);
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
        const paar = rel === "band" ? /((?:\d[\d  ]*)(?:,\d+)?)\s?[–-]\s?((?:\d[\d  ]*)(?:,\d+)?)/.exec(wort) : null;
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
    function urteilBauen(leiter, nr, sp) {
        return (j, lauf) => {
            const kopf = "S" + nr + " ";
            const rot = (text, taeter) => ({ gruen: false, zahl: kopf + text + (taeter ? " · Täter: " + taeter : "") });
            const kz = kartenZeuge(lauf && lauf.stdout);
            if (!j || typeof j !== "object" || !j.leitern) return rot("keine Messung: die Probe schrieb kein JSON der Leitern" + (kz ? " (" + kz + ")" : ""));
            if (kz) return rot(kz);
            const L = j.leitern[leiter];
            if (!L) return rot("die Leiter " + leiter + " ist im Lauf nicht gemessen (die Probe endete vor ihr)");
            if (L.warf) return rot("die Messung der Leiter warf nach " + deutsch(L.s) + " s: " + String(L.warf).slice(0, 220), sp.taeter);
            const roh = L.sprossen && L.sprossen[nr];
            if (!roh || typeof roh !== "object") return rot("die Sprosse ist im Lauf nicht gemessen", sp.taeter);
            const werte = roh.werte || {};
            const teile = sp.soll.map((s) => {
                const w = werte[s.key];
                const ok = haelt(s, w);
                return { ok, text: s.key + " " + (typeof w === "number" && Number.isFinite(w) ? deutsch(w) + (s.einheit && s.rel !== "±%" ? " " + s.einheit : "") : "ungemessen") + " gegen Soll " + sollText(s) + (ok ? " ✓" : " ✗") };
            });
            const mess = teile.map((t) => t.text).join(" · ");
            if (sp.auge) {
                const a = roh.auge || {};
                return {
                    gruen: false,
                    zahl: kopf + (mess ? mess + " · " : "") + "auge: Pose " + (a.pose || sp.auge.pose) + " · Vorbild " + sp.auge.vorbild + " · Bild " + (a.bild || "fehlt" + (a.grund ? " (" + String(a.grund).slice(0, 120) + ")" : "")) +
                        " — das Urteil fällt am Gerät im Blindpaar (R11), die Station behauptet kein GRÜN" + (roh.nicht ? " · Umfang nicht erzeugbar: " + roh.nicht : ""),
                };
            }
            if (roh.nicht) return rot("Umfang nicht erzeugbar: " + String(roh.nicht).slice(0, 260) + (mess ? " · " + mess : ""), roh.taeter || sp.taeter);
            const fall = teile.find((t) => !t.ok);
            if (fall) return rot(mess, roh.taeter || sp.taeter);
            let zg;
            try {
                zg = sp.zeuge(roh);
            } catch (e) {
                zg = "der Zeuge warf: " + String((e && e.message) || e).slice(0, 120);
            }
            if (zg) return rot(mess + " · der Zeuge der Welt fehlt: " + zg, roh.taeter || sp.taeter);
            return { gruen: true, zahl: kopf + mess + " · Zeuge: " + String(sp.zeugeText || "die Welt geändert").slice(0, 120) };
        };
    }

    // DIE PROBEN (Selbsttest) einer Sprosse: die Messung im Soll GRÜN (nie an einer Auge-Sprosse), jede Attrappe ROT, dazu die Fälle der Maschine
    const ZEUGE = "[linse-gpu] amd/rdna-3 (Probe)";
    function probenBauen(leiter, nr, sp) {
        const j = (roh) => ({ leitern: { [leiter]: { s: 1, sprossen: { [nr]: roh } } } });
        const p = [];
        p.push({ name: "gemessen im Soll" + (sp.auge ? " (Auge: nie GRÜN)" : ""), j: j(sp.gruen), stdout: ZEUGE, gruen: !sp.auge });
        for (const a of sp.attrappen) p.push({ name: "ATTRAPPE " + a.name, j: j(a.roh), stdout: ZEUGE, gruen: false });
        for (const a of sp.proben || []) p.push({ name: a.name, j: j(a.roh), stdout: ZEUGE, gruen: !!a.gruen && !sp.auge });
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
        M.auge = async (name, pose, o = {}) => {
            const datei = require("path").join(require("path").dirname(H.aus), "auge-" + name + ".png");
            if (M.swift) return { bild: null, pose: JSON.stringify(pose), grund: "swiftshader: kein Schuss ohne Gerät (ungefahren am Gerät)" };
            try {
                const b = await H.ruf("/bild", Object.assign({ w: 1920, h: 1080, wahl: 0, datei }, pose, o));
                return { bild: b.datei || datei, pose: JSON.stringify(pose) };
            } catch (e) {
                return { bild: null, pose: JSON.stringify(pose), grund: String((e && e.message) || e).slice(0, 200) };
            }
        };
        // die Uhr der Leiter: Sekunden seit ihrem Start (die Messung teilt ihren Deckel selbst)
        M.uhr = () => (Date.now() - M.t0) / 1000;
        return M;
    }
    // DER RUMPF DER PROBE: die Leitern nacheinander, jede unter ihrem Deckel; nach jeder Leiter steht das JSON ({AUS}) — eine gerissene
    // Frist behält, was gemessen ist
    async function probeRumpf(H, M, LEITERN) {
        const fs = require("fs");
        await H.frist();
        const aus = { fassung: 1, leitern: {} };
        for (const id of Object.keys(LEITERN)) {
            const L = LEITERN[id];
            M.t0 = Date.now();
            let uhr = null;
            try {
                const r = await Promise.race([
                    L.mess(H, L.U, M),
                    new Promise((_, nein) => (uhr = setTimeout(() => nein(new Error("der Deckel der Leiter " + L.sek + " s")), L.sek * 1000))),
                ]);
                aus.leitern[id] = { s: (Date.now() - M.t0) / 1000, sprossen: (r && r.sprossen) || {} };
            } catch (e) {
                aus.leitern[id] = { s: (Date.now() - M.t0) / 1000, warf: String((e && e.message) || e).split("\n")[0].slice(0, 300) };
            }
            clearTimeout(uhr);
            H.schritt(id);
            fs.writeFileSync(H.aus, JSON.stringify(aus));
        }
        return 0;
    }

    // DIE PERSPEKTIVE: EINE Probe für ihre Leitern, je Sprosse eine Station
    function perspektive(kapitel, pid, def) {
        const ids = Object.keys(def.leitern);
        if (!ids.length) throw new Error("die Perspektive " + kapitel + "." + pid + " trägt keine Leiter");
        const stuecke = [];
        let sek = 10;
        let mutiert = false;
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
        }
        const art = "async (H) => { const M = (" + knapp(probeHilfen) + ")(H); const LEITERN = {" + stuecke.join(",\n") + "}; return (" + knapp(probeRumpf) + ")(H, M, LEITERN); }";
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
                if (!sp.auge && typeof sp.zeuge !== "function") throw new Error(id + " S" + nr + ": zeuge fehlt (die Attrappe fiele nie)");
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
                    urteil: urteilBauen(id, nr, sp),
                    proben: probenBauen(id, nr, sp),
                    pfad: L.pfad,
                    quelle: "KARTE2 " + id + " S" + nr + " = " + s.richter,
                };
                if (nr === 1) st.beide = true;
                // DAS BLATT (vision/richter/fabrik-planet-leben-zusammenspiel.md) liest diese Felder; die Maschine nie
                Object.defineProperty(st, "blatt", { enumerable: false, value: { perspektive: kapitel + "." + pid, auge: sp.auge || null, nicht: sp.nicht || null, leser: sp.leser || null, unklar: sp.unklar || null, ungefahren: L.ungefahren || "ungefahren am Gerät" } });
                stationen.push(st);
            }
        }
        return stationen;
    }

    // DAS KAPITEL: sammelt die Perspektiven, die Datei exportiert `stationen()`
    function kapitel(name) {
        const alle = [];
        return {
            perspektive: (pid, def) => alle.push(...perspektive(name, pid, def)),
            stationen: () => alle.slice(),
        };
    }
    return { kapitel, soll, zahlVon, zahlenIn, sprosseVon, leiterVon, perspektiveVon, belegt, haelt, deutsch, leitern, urteilBauen, probenBauen, knapp };
})();

const K = KERN;
const L = K.kapitel("planet");

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
                sek: 20,
                pfad: PFAD,
                // EIN Messprogramm für alle Sprossen: der Faden an den Referenz-Lagen der Sprossen (U[nr].punkte), der Lagefehler als
                // |Abstand zur Küste| an echten Küstenpunkten; dazu der Schlüssel der Erd-Saat — fehlt er, ist jeder Umfang nicht erzeugbar
                mess: async function (H, U, M) {
                    const frage = async (punkte) =>
                        H.seite(
                            "await r._fadenQuelle(); const P = " + JSON.stringify(punkte) + "; const a = await Promise.all(P.map((p) => r._planetAuftrag({ type: \"planet-ort\", samen: \"erde\", breite: p[0], laenge: p[1], zeitMa: 0 }))); " +
                                "return a.map((x) => [x.land, x.hoeheM, x.kuesteKm, x.version]);"
                        );
                    // der Schlüssel der Erd-Saat (R4): ein Leser im Spiel, der ihn trägt — heute keiner (die Probe fragt die Welt, nicht den Text)
                    const schluessel = await H.seite("const G = r._gelaende && r._gelaende(); return !!(G && G.ort && G.ort.teil && G.ort.teil.erdSchluessel);");
                    const aus = {};
                    for (const nr of Object.keys(U)) {
                        const u = U[nr];
                        const werte = {};
                        let zeuge = { antworten: 0 };
                        if (u.punkte && u.punkte.length) {
                            const a = await frage(u.punkte);
                            const km = a.map((x) => Math.abs(x[2]));
                            const hs = a.map((x) => x[1]);
                            const mittel = hs.reduce((s, x) => s + x, 0) / hs.length;
                            km.sort((x, y) => x - y);
                            werte[u.mass] = u.mass === "lagefehlerP90Km" ? km[Math.min(km.length - 1, Math.ceil(0.9 * km.length) - 1)] : km.reduce((s, x) => s + x, 0) / km.length;
                            zeuge = { antworten: a.length, streuungM: Math.sqrt(hs.reduce((s, x) => s + (x - mittel) * (x - mittel), 0) / hs.length), version: a[0][3], samen: "erde" };
                        }
                        let auge;
                        if (u.auge) auge = await M.auge("erde-s" + nr, u.auge);
                        const nicht = !schluessel ? "keine Erd-Saat mit Schlüssel (R4) — der Planet liest nur den Samen (planet-core planetPlan); " + u.fehlt : u.fehlt || null;
                        aus[nr] = { werte, zeuge, auge, ...(nicht ? { nicht } : {}) };
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
                        taeter: "planet-core.js planetPlan (kein Erd-Schlüssel, R4)",
                        nicht: "keine Erd-Saat mit Schlüssel (R4)",
                        leser: "planet-core.js planetPlan(samen, P) — kein Eingang für den Erd-Schlüssel",
                        gruen: gut({ lagefehlerKm: 3.2 }, 10),
                        attrappen: [{ name: "der Lagefehler als Konstante ohne Antwort des Fadens", roh: { werte: { lagefehlerKm: 3.2 }, zeuge: { antworten: 0 } } }],
                    },
                    2: {
                        u: { mass: "lagefehlerKm", punkte: [], fehlt: "die 100 größten Formen eines Kontinents und die Köppen-Klasse an 1 000 Punkten — kein Leser der Erd-Formen" },
                        soll: [K.soll(ID, 2, "Lagefehler der 100 größten Formen ≤ 50 km", { key: "lagefehlerKm", einheit: "km" }), K.soll(ID, 2, "Köppen-Klasse an 1 000 Punkten richtig ≥ 80 %", { key: "koeppenProzent", zahl: 80, einheit: "%" })],
                        zeuge: zeugeFaden(100),
                        taeter: "planet-core.js planetPlan (kein Erd-Schlüssel, R4)",
                        nicht: "keine Erd-Saat mit Schlüssel (R4)",
                        leser: "planet-core.js planetPlan(samen, P) — kein Eingang für den Erd-Schlüssel",
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
                        leser: "scripts/werkbank.cjs /bild — keine Pose über der Atmosphäre (Orbit)",
                        gruen: gut({ lagefehlerP90Km: 12, panelProzent: 60 }, 20),
                        attrappen: [{ name: "p90 12 km ohne Antwort des Fadens", roh: { werte: { lagefehlerP90Km: 12, panelProzent: 60 }, zeuge: { antworten: 0 } } }],
                    },
                    4: {
                        u: { mass: "lagefehlerP90Km", punkte: [], auge: { ort: "wiese" }, fehlt: "10⁴ benannte Orte — kein Ortsverzeichnis in der Welt" },
                        soll: [K.soll(ID, 4, "Lagefehler p90 ≤ 1 km", { key: "lagefehlerP90Km", einheit: "km" }), K.soll(ID, 4, "Ego-Blindpaar gegen ein Foto des Orts ≤ 70 %", { key: "blindProzent", einheit: "%" })],
                        auge: { pose: "Ego am benannten Ort (heute: die Wiese)", vorbild: "ein Foto des Orts aus dem Ortsverzeichnis (GeoNames), Blindpaar ≤ 70 %" },
                        taeter: "planet-core.js (kein Ortsverzeichnis)",
                        nicht: "kein Ortsverzeichnis der Erde",
                        leser: "planet-core.js — kein Leser benannter Orte (GeoNames)",
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
                        leser: "stamm/siedlung-ort.js — kein Leser realer Stadtpläne (OpenStreetMap)",
                        gruen: gut({ lageKm: 1.1, einwohnerAbw: 18, planAbw: 12 }, 100),
                        attrappen: [{ name: "100 Städte aus einer Liste ohne Welt", roh: { werte: { lageKm: 1.1, einwohnerAbw: 18, planAbw: 12 }, zeuge: { antworten: 0 } } }],
                    },
                    6: {
                        u: { mass: "lagefehlerKm", punkte: [], auge: { ort: "wiese" }, fehlt: "jeder Ort, den ein Mensch Heimat nennt — kein Erd-Schlüssel je km²" },
                        soll: [K.soll(ID, 6, "Tal, Flusslauf und Straßenzug erkannt ≥ 80 %", { key: "erkanntProzent", einheit: "%" }), K.soll(ID, 6, "2AFC Ego-Bild gegen eigenes Foto ≤ 75 %", { key: "afcProzent", einheit: "%" })],
                        auge: { pose: "Ego am Wohnort des Prüfers (heute: die Wiese)", vorbild: "das eigene Foto des Prüfers vom Wohnort (Heimat-Probe, 100 Menschen)" },
                        taeter: "planet-core.js planetPlan (kein Erd-Schlüssel, R4)",
                        nicht: "keine Erd-Saat je km²",
                        leser: "planet-core.js planetPlan(samen, P) — kein Eingang für den Erd-Schlüssel",
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
