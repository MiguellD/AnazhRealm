#!/usr/bin/env node
"use strict";
// messplatz-uhr.cjs — Seite 0 „UHR“ des Messplatz-Blicks und die Kopfzeile jeder Seite (Schöpfer 10.11. 13:25: je Gerät eine Uhr, die bei leerer
// Maschine hochzählt und nach 15 min Alarm schlägt, auch wenn ein Job über 15 min in einem Schritt klemmt; wie viele Zweige fertig, aber nicht
// integriert sind und wie viele Punkte sie bringen könnten; die Balance Integration ↔ Machen, Entwickeln ↔ Messen; was sich anstaut und was
// nicht mehr geprüft wird). messplatz-blick.cjs ruft sie (require) und wächst nur um die Einbindung.
// DIE UHR — der Beweis der Arbeit ist FORTSCHRITT, nie Belegung. Je Gerät der jüngste von: dem Abdruck der Wache (w4/wache-stand/<GERÄT>.json,
//   `ab` = seit wann ihr Abdruck gleich blieb; die API fragt die Uhr nie ein zweites Mal), dem Wachsen der Lauf-Ausgabe eines LEBENDEN
//   `punkte.cjs run` (Koordinator 13:58: die Sitzung hält das Schloss über viele Stationen, die Mess-Datei kommt erst am Ende — die Wache sah
//   19 min „Stillstand“, während alle 1–5 min eine Station urteilte), der jüngsten erledigt-Zeile eines offenen Auftrags (die GTX 1050 kann nicht
//   pushen: ihre Lebenszeichen trägt der Koordinator als „<auftrag> Zwischenstand: …“ nach) und dem Push seiner Mess-Datei. Dazu zwei Uhren, die
//   nie ein Unter-Schritt zurücksetzt: der Schritt des laufenden Jobs und die STATION eines Laufs (die jüngste „SITZUNG … vor <station>“ bis zu
//   ihrem Urteil). Die größte zeigt die Uhr: gelb ab 10 min, ALARM ab 15 min (LEERLAUF · STILLSTAND · SCHRITT KLEMMT · STATION KLEMMT ·
//   VERWAIST). „frei heute“ summiert w4/uhr-verlauf.jsonl (je Takt EINE Zeile, überlebt jeden Neustart; eine Lücke über 5 min zählt nie).
// DER STAU — die Abgaben (Kopf-Betreff „Abgabe …“, ≤ 48 h) aus den Köpfen der Zweige, dieselbe Liste, die WARTEND zeigt (wartendVon im Blick),
//   je Zweig CI und GPU-Probe am Kopf (die Logik von w4/ci.sh), gefahren (w4/zug-gefahren.txt), der Grund des Wartens (w4/zug-nie-leer.wartet)
//   und die Kriterien der Abgabe-Nachricht (<domäne>.K<n>#<staffel>, nie aus FUND-Zeilen) gegen stand.json (je[k].punkte, Höchstwert 2).
// VERALTET — Kriterien unter 2 Punkten mit Stationen „seit der Messung geändert“ · „ungemessen“ · „riss“, ihr Soll je Gerät-Klasse nach dem
//   Gesetz der Maschine (punkte.cjs FORMAT): ein Befehl `minuten`, eine Probe ihr Deckel (deckel.json je Karte, sonst probe.sek, sonst 45 s) —
//   Σ minuten der Proben wäre 11× zu groß (815 gegen 71 min am 10.11.); bei 3 Geräten parallel max(radeon, gtx, Σ/3).
// BALANCE (6 h) — Machen = Abgaben (w3/abgabe.log) · Integration = Zweige gelandeter Züge (fahre-Logs) · Messen = Mess-Commits auf
//   punkte-maschine · Punkte = Δ karte (zug/budget.txt); der ENGPASS nach der einfachsten ehrlichen Regel (engpass).
// Aufruf: node messplatz-uhr.cjs --selbsttest — je reine Funktion ein Fall, an dem ihre Mutante ROT wird.
const fs = require("fs");
const os = require("os");
const path = require("path");
const { execFile, execFileSync } = require("child_process");

const TEMP = process.env.TEMP || os.tmpdir();
const TEMP_CLAUDE = path.join(TEMP, "claude");
const W3 = path.join(TEMP_CLAUDE, "w3"), W4 = path.join(TEMP_CLAUDE, "w4");
const PM_PUNKTE = path.join(W3, "pm", "meisterkarte-quelle", "punkte");
const REPO = path.resolve(__dirname, "..", "..", ".."); // der Arbeits-Klon (die Wache holt punkte-maschine je Runde hinein)
const VERLAUF = path.join(W4, "uhr-verlauf.jsonl");
const LAUF_STAND = path.join(W4, "uhr-lauf.json");
const GELB_S = 600, ALARM_S = 900; // das Wort des Schöpfers: nach 15 min Alarm; gelb ab 10
const LUECKE_S = 300; // zwei Verlauf-Zeilen weiter auseinander: der Blick lief nicht — die Zeit dazwischen zählt nie
const WACHE_STILL_S = 600; // die Wache schrieb ihren Stand so lange nicht: ihr Abdruck ist alt
const PULS_BLIND_S = 300; // schloss-puls.cjs pusht spätestens je 120 s: kein Puls seit 5 min heißt BLIND, nie „Frei“
const ZUG_FASST = 4; // zug-nie-leer.sh: „Höchstens 4 Zweige je Zug“
const STAU_ZUEGE = 2, MESSEN_MIN = 120; // der Engpass: mehr fertig als 2 Züge fassen · mehr als 2 h veraltet bei 3 Geräten
const H6 = 6 * 3600;
const GERAETE = [
    { name: "RADEON", titel: "RADEON 890M", sitz: "radeon", l: "lR", j: "jR", v: "vR", mp: "radeon", lauf: "radeon" },
    { name: "OMEN", titel: "OMEN · GTX 1060", sitz: "omen", l: "lO", j: "jO", v: "vO", mp: "omen", lauf: "gtx" },
    { name: "GTX1050", titel: "GTX 1050", sitz: "gtx1050", l: "l3", j: "j3", v: "v3", mp: null, lauf: null },
];
const s8 = (s) => String(s || "").slice(0, 8);
const sek = (d) => (d == null ? null : Math.floor((d instanceof Date ? +d : Number(d)) / 1000));
const hm = (s) => (s == null ? "--:--" : new Date(s * 1000).toTimeString().slice(0, 5));
const p2 = (n) => String(n).padStart(2, "0");
const dauerS = (s) => { const m = Math.max(0, Math.round((s || 0) / 60)); return m < 60 ? `${m} min` : `${Math.floor(m / 60)} h ${p2(m % 60)} min`; };

// ── REINE FUNKTIONEN (der Selbsttest urteilt jede) ─────────────────────────────────────────────────────────────────────
// DAS URTEIL DER UHR: l = { zustand, fortschritt (s), wache: { verwaist }, job: { schrittSeit }, station: { seit } }, jetzt in s
function uhrUrteil(l, jetzt) {
    const uhren = [["Fortschritt", l.fortschritt], ["Schritt", l.job && l.job.schrittSeit], ["Station", l.station && l.station.seit], ["Halter", l.halter && l.halter.regt]]
        .filter(([, t]) => t != null).map(([q, t]) => [q, Math.max(0, jetzt - t)]);
    // bei Gleichstand gewinnt die genauere Uhr (Schritt vor Fortschritt, Station vor Schritt, Halter zuletzt): ein klemmender Schritt heißt SCHRITT KLEMMT
    const top = uhren.reduce((a, b) => (b[1] >= a[1] ? b : a), ["Fortschritt", null]);
    const s = top[1];
    let stufe = s == null ? "?" : s >= ALARM_S ? "alarm" : s >= GELB_S ? "gelb" : "ok", grund = null;
    if (l.wache && l.wache.verwaist) { stufe = "alarm"; grund = "VERWAIST"; }
    else if (l.zustand === "BLIND") { stufe = "alarm"; grund = "BLIND"; } // ohne Puls weiß die Uhr nicht, ob das Gerät frei ist — sie sagt es
    else if (stufe === "alarm") grund = top[0] === "Halter" ? "HALTER STILL" : top[0] === "Schritt" ? "SCHRITT KLEMMT" : top[0] === "Station" ? "STATION KLEMMT" : l.zustand === "FREI" ? "LEERLAUF" : "STILLSTAND";
    return { s, quelle: top[0], stufe, grund };
}
// DER PULS DES SCHLOSSES (schloss-puls.cjs je Gerät, Ref refs/puls/<gerät>, 11.11.: die OMEN trug 16 min gate:haus-welt unter gpu-lauf, die Uhr
// zeigte „Frei“ und ALARM): p = puls.json oder null → { zustand BLIND | FREI | BELEGT, alter, halter { wer, art, seit, regt, lebt, cpu }, warten }
function pulsUrteil(p, jetzt) {
    if (!p || p.t == null) return { zustand: "BLIND", alter: null, warten: 0, wartende: [] };
    const alter = Math.max(0, jetzt - p.t);
    if (alter > PULS_BLIND_S) return { zustand: "BLIND", alter, warten: 0, wartende: [] };
    if (p.frei) return { zustand: "FREI", alter, warten: p.warten || 0, wartende: p.wartende || [] };
    const h = p.halter || {};
    return { zustand: "BELEGT", alter, warten: p.warten || 0, wartende: p.wartende || [],
        halter: { wer: h.wer || "?", art: h.art || "LAUF", seit: h.seit ?? null, regt: h.regt ?? h.seit ?? null, lebt: h.lebt !== false, cpu: h.cpu ?? null } };
}
// der Puls in der Lage: ein lebendes Lebenszeichen ist Fortschritt (die Halter-Uhr hält es fest), „Frei“ nur, wenn das Gerät selbst frei meldet
function pulsEin(l, pu) {
    const o = { ...l, puls: pu };
    if (pu.zustand === "BELEGT") {
        o.halter = { ...pu.halter, warten: pu.warten, wartende: pu.wartende };
        if (pu.halter.regt != null) o.fortschritt = Math.max(o.fortschritt ?? pu.halter.regt, pu.halter.regt);
        if (o.zustand === "FREI") o.zustand = "BELEGT";
    } else if (pu.zustand === "BLIND" && o.zustand === "FREI") o.zustand = "BLIND";
    return o;
}
// „belegt: <wer> seit mm:ss · n warten“ — die Zeile des Halters (Seite, kurz, Ampel)
const belegtText = (h, jetzt) => `belegt: ${h.wer.replace(/ \d{4}-\d\d-\d\dT\S+| pid=\d+/g, "")} seit ${zeitText(jetzt - h.seit).text} · ${h.warten || 0} warten${h.lebt ? "" : " · Halter-Prozess tot"}`;
// die Kriterien-Ids einer Abgabe-Nachricht: <domäne>.K<n>#<staffel>, je einmal; eine FUND-Zeile nennt die Arbeit anderer („Kriterium X gegen Y“)
const KRITERIUM = /\b([a-z][a-z0-9]*\.K\d+#\d+)\b/g;
function kriterienAus(nachricht) {
    const ids = new Set();
    for (const z of String(nachricht || "").split(/\r?\n/)) if (!/^\s*FUND\b/.test(z)) for (const m of z.matchAll(KRITERIUM)) ids.add(m[1]);
    return [...ids].sort();
}
// gegen stand.json: „k#s“ ist offen, solange je[k].punkte < s (Höchstwert 2); ein unbekanntes Kriterium zählt nie
function punkteBewertung(ids, je) {
    const o = { plus: 0, offen: [], gebucht: [], unbekannt: [] }, da = new Set();
    for (const id of ids || []) {
        const [k, roh] = id.split("#"), st = Math.min(2, Number(roh)), key = `${k}#${st}`;
        if (da.has(key)) continue;
        da.add(key);
        if (!je || !je[k]) o.unbekannt.push(key);
        else if ((je[k].punkte || 0) < st) { o.offen.push(key); o.plus++; } else o.gebucht.push(key);
    }
    return o;
}
// über alle Zweige: dieselbe Staffel zählt einmal
function punkteSumme(listen, je) {
    const alle = new Set();
    for (const l of listen) for (const k of punkteBewertung(l, je).offen) alle.add(k);
    return alle.size;
}
// DER ENGPASS in EINER Einheit (Minuten): mehr fertige Zweige, als STAU_ZUEGE Züge fassen → INTEGRATION (Züge × Wand p50); veraltete Stationen über
// MESSEN_MIN bei 3 Geräten → MESSEN; der größere zuerst; staut sich nichts → MACHEN
function engpass({ wartend, wandMin, veraltetMin }) {
    const e = [];
    if (wartend > STAU_ZUEGE * ZUG_FASST) { const zuege = Math.ceil(wartend / ZUG_FASST); e.push({ was: "INTEGRATION", min: zuege * (wandMin || 60), zuege }); }
    if (veraltetMin > MESSEN_MIN) e.push({ was: "MESSEN", min: veraltetMin });
    return e.length ? e.sort((a, b) => b.min - a.min) : [{ was: "MACHEN", min: 0 }];
}
// „frei heute“: zeilen [{ t, je: { G: [zustand, alarm] } }] aufsteigend; je Abstand der Zustand der früheren Zeile, geschnitten an [ab, bis]; ein
// Abstand über LUECKE_S zählt nie, auch der letzte bis jetzt nicht
function verlaufSumme(zeilen, g, ab, bis) {
    const o = { frei: 0, steht: 0, gesehen: 0 };
    for (let i = 0; i < zeilen.length; i++) {
        const z = zeilen[i], t1 = i + 1 < zeilen.length ? zeilen[i + 1].t : bis;
        if (t1 - z.t > LUECKE_S || !z.je || !z.je[g]) continue;
        const d = Math.min(t1, bis) - Math.max(z.t, ab);
        if (d <= 0) continue;
        o.gesehen += d;
        if (z.je[g][0] === "FREI") o.frei += d; else if (z.je[g][1]) o.steht += d;
    }
    return o;
}
// bei 3 Geräten parallel: die Radeon misst nur radeon, die OMEN nur gtx, headless verteilt sich — die untere Schranke
const parallelMin = (je) => Math.max(je.radeon || 0, je.gtx || 0, ((je.radeon || 0) + (je.gtx || 0) + (je.headless || 0)) / 3);
// die veralteten Stationen gegen ihr Soll: su = { je: { k: { p, alt: [[id, gerät]] } } }, defs = [[k#s, gerät | [geräte], minuten, probeSek, probe]],
// deckel = deckel.json ({ radeon: { k#s: s }, gtx: … }); eine Probe zählt ihren Deckel, ein Befehl seine minuten
const PROBE_DECKEL_S = 45; // punkte.cjs PROBE_DECKEL_S
function veraltetVon(su, defs, deckel) {
    const soll = new Map();
    for (const [k, g, min, sek, probe] of defs || []) for (const x of [].concat(g)) soll.set(`${k}@${x}`, probe ? (((deckel || {})[x] || {})[k] ?? sek ?? PROBE_DECKEL_S) / 60 : min);
    const o = { kriterien: 0, stationen: 0, ohneSoll: 0, je: { headless: { n: 0, min: 0 }, radeon: { n: 0, min: 0 }, gtx: { n: 0, min: 0 } } };
    for (const v of Object.values((su && su.je) || {})) {
        if (v.p >= 2 || !v.alt.length) continue;
        o.kriterien++;
        for (const [id, g] of new Map(v.alt.map(([id, g]) => [`${id}@${g}`, [id, g]])).values()) {
            const e = o.je[g] || (o.je[g] = { n: 0, min: 0 }), m = soll.get(`${id}@${g}`);
            o.stationen++, e.n++;
            if (m == null) o.ohneSoll++; else e.min += m;
        }
    }
    o.parallel = parallelMin({ headless: o.je.headless.min, radeon: o.je.radeon.min, gtx: o.je.gtx.min });
    return o;
}
// eine Lauf-Ausgabe von punkte.cjs run: Kopf „Punkte-Maschine: N Station(en) … auf <gerät> am <sha>“, je Urteil „  GRÜN|ROT|OFFEN <id> …“, je
// Schritt der Sitzung „  SITZUNG … vor <id>…“ → die Station, an der der Lauf steht, bis ihr Urteil kommt
function laufStand(text) {
    const o = { geraet: null, sha: null, n: null, urteile: 0, fertig: 0, station: null, letzte: null, misst: false };
    const ids = new Set();
    for (const z of String(text || "").split(/\r?\n/)) {
        let m;
        if ((m = /^Punkte-Maschine: (\d+) Station\(en\).*? auf (\w+) am ([0-9a-f]{7,40})/.exec(z))) [o.n, o.geraet, o.sha] = [+m[1], m[2], m[3]];
        else if ((m = /^ {2}(GRÜN|ROT|OFFEN) (\S+)/.exec(z))) { o.urteile++; ids.add(m[2]); o.letzte = { wort: m[1], id: m[2] }; o.misst = true; if (o.station === m[2]) o.station = null; }
        else if ((m = /^ {2}SITZUNG .*? vor (\S+?)(?::|\s|$)/.exec(z))) { o.station = m[1]; o.misst = true; }
    }
    o.fertig = ids.size;
    return o;
}
// das jüngste Lebenszeichen eines Auftrags in zug/erledigt.txt (jede Zeile seiner id: Zwischenstand, Scheibe, Ende) → { t (s), text }
function lebenszeichenVon(text, id) {
    let o = null;
    for (const z of String(text || "").split(/\r?\n/)) {
        const m = /^(\d{4}-\d\d-\d\d) (\d\d:\d\d(?::\d\d)?) (\S+) (.*)$/.exec(z);
        if (!m || m[3] !== id) continue;
        const t = sek(new Date(`${m[1]}T${m[2].length === 5 ? m[2] + ":00" : m[2]}`));
        if (!o || t >= o.t) o = { t, text: m[4] };
    }
    return o;
}
// eine Uhrzeit für die großen Ziffern: unter 100 min „mm:ss“, darüber „hh:mm“
function zeitText(s) {
    if (s == null) return { text: "--:--", einheit: "" };
    s = Math.max(0, Math.round(s));
    if (s < 6000) return { text: `${p2(Math.floor(s / 60))}:${p2(s % 60)}`, einheit: "min:s" };
    const h = Math.min(99, Math.floor(s / 3600));
    return { text: `${p2(h)}:${p2(Math.floor(s / 60) % 60)}`, einheit: "Std:min" };
}
// die großen Ziffern: sieben Segmente aus Halbblöcken, 3 × 3 Zeichen je Ziffer
const ZIFFER = {
    0: ["█▀█", "█ █", "▀▀▀"], 1: ["  █", "  █", "  ▀"], 2: ["▀▀█", "█▀▀", "▀▀▀"], 3: ["▀▀█", "▀▀█", "▀▀▀"], 4: ["█ █", "▀▀█", "  ▀"],
    5: ["█▀▀", "▀▀█", "▀▀▀"], 6: ["█▀▀", "█▀█", "▀▀▀"], 7: ["▀▀█", "  █", "  ▀"], 8: ["█▀█", "█▀█", "▀▀▀"], 9: ["█▀█", "▀▀█", "▀▀▀"],
    ":": ["▄", "▄", " "], "-": ["   ", "▀▀▀", "   "],
};
function gross(text) {
    const z = ["", "", ""];
    for (const c of String(text)) { const g = ZIFFER[c] || ["   ", "   ", "   "]; for (let r = 0; r < 3; r++) z[r] += (z[r] ? " " : "") + g[r]; }
    return z;
}

// ── SAMMLER (lesen nur; die Daten des Blicks kommen herein, die API fragt hier nur der Stau über den Blick) ─────────────────────────
const lies = (p) => { try { return fs.readFileSync(p, "utf8"); } catch (_e) { return null; } };
const msysPfad = (p) => String(p).replace(/^\/tmp\//, TEMP.replace(/\\/g, "/") + "/").replace(/^\/([a-z])\//i, "$1:/");
function wacheLesen(dir = path.join(W4, "wache-stand")) {
    const o = { je: {}, blind: 0, runde: null };
    for (const g of GERAETE) {
        try {
            const p = path.join(dir, g.name + ".json"), st = fs.statSync(p);
            o.je[g.name] = { ...JSON.parse(fs.readFileSync(p, "utf8")), mtime: sek(st.mtimeMs) };
            o.runde = Math.max(o.runde || 0, o.je[g.name].mtime);
        } catch (_e) { /* ohne Datei sagt die Uhr „Wache fehlt“ */ }
    }
    try { o.blind = JSON.parse(fs.readFileSync(path.join(dir, "_blind.json"), "utf8")).n || 0; } catch (_e) { /* nie blind gemeldet */ }
    return o;
}
// DER PUSH DER MESS-DATEI: der Abdruck der Wache trägt m=<hash> (der jüngste Commit auf punkte-maschine an messung/*-<gerät>.json) — seine Zeit und
// sein Betreff, lokal aufgelöst, je hash einmal. Eine Sitzung der OMEN, deren Auftrag erledigt.txt schon schloss, misst sichtbar nur hier
const commits = new Map();
function commitVon(hash) {
    if (!hash) return null;
    if (!commits.has(hash)) {
        let c = null;
        try { const [t, ...b] = execFileSync("git", ["-C", REPO, "log", "-1", "--format=%ct%x09%s", hash], { encoding: "utf8", timeout: 8000, windowsHide: true, stdio: ["ignore", "pipe", "ignore"] }).trim().split("\t"); c = { t: Number(t), betreff: b.join("\t") }; } catch (_e) { /* nicht lokal: die Wache holt ihn mit der nächsten Runde */ }
        if (!c) return null;
        commits.set(hash, c);
    }
    return commits.get(hash);
}
// DIE LÄUFE DES LAPTOPS: je lebendem `punkte.cjs run` (node, mit --geraet) seine Ausgabe — das tee-Ziel neben ihm in der Pipe, die Umleitung im
// Aufruf seiner Ahnen, sonst eine *lauf*.out in w3/w4, geschrieben seit seinem Start, deren Kopf Gerät und SHA des Laufs trägt
function laeufe(ps, jetzt) {
    if (!ps) return [];
    const byPid = new Map(ps.map((p) => [p.pid, p]));
    const ahnen = (p) => { const a = []; for (let x = byPid.get(p.ppid), i = 0; x && i < 4; x = byPid.get(x.ppid), i++) a.push(x); return a; };
    const glob = [];
    for (const d of [W3, W4]) try { for (const n of fs.readdirSync(d)) if (/lauf.*\.out$/.test(n)) glob.push(path.join(d, n)); } catch (_e) { /* kein Ordner */ }
    const out = [], da = new Set();
    for (const p of ps) {
        const m = /punkte\.cjs run --sha ([0-9a-f]{7,40}) --geraet (\w+)/.exec(p.cmd);
        if (!m || /^(bash|timeout|\/usr\/bin\/bash)\b/.test(p.cmd)) continue;
        const a = ahnen(p), ids = new Set([p.ppid, ...a.map((x) => x.pid), ...a.map((x) => x.ppid)].filter((x) => x > 1));
        let datei = null;
        const tee = ps.find((x) => /^tee\b/.test(x.cmd) && ids.has(x.ppid));
        if (tee) datei = msysPfad(tee.cmd.trim().split(/\s+/).pop());
        for (const x of a) { const r = !datei && /punkte\.cjs run[^;|&]*?\s>{1,2}\s*(\S+)/.exec(x.cmd); if (r) datei = msysPfad(r[1]); }
        if (!datei) datei = glob.find((f) => { try { return fs.statSync(f).mtimeMs >= +p.start - 60e3 && (lies(f) || "").startsWith(`Punkte-Maschine: `) && laufStand(lies(f)).sha === m[1]; } catch (_e) { return false; } }) || null;
        if (!datei || da.has(datei)) continue;
        da.add(datei);
        let st = null; try { st = fs.statSync(datei); } catch (_e) { /* noch keine Ausgabe */ }
        const ls = laufStand(st ? lies(datei) : "");
        out.push({ datei, sha: m[1], geraet: m[2], start: sek(p.start), mtime: st ? sek(st.mtimeMs) : null, ...ls, offen: /--offen/.test(p.cmd), nur: (/--nur (\S+)/.exec(p.cmd) || [])[1] || null });
    }
    // DIE STATIONS-UHR: wann wechselte (Zahl der Urteile, Station)? Beobachtet je Takt, auf der Platte gehalten (ein Neustart setzt sie nicht zurück;
    // ohne Vorgänger gilt die Zeit der letzten Zeile)
    let alt = {};
    try { alt = JSON.parse(lies(LAUF_STAND) || "{}"); } catch (_e) { alt = {}; }
    const neu = {};
    for (const l of out) {
        const key = `${l.urteile}|${l.station || ""}`, a = alt[l.datei];
        neu[l.datei] = a && a.key === key ? a : { key, seit: Math.min(jetzt, l.mtime || jetzt) };
        l.stationSeit = l.misst ? neu[l.datei].seit : null;
    }
    try { if (JSON.stringify(neu) !== JSON.stringify(alt)) fs.writeFileSync(LAUF_STAND, JSON.stringify(neu)); } catch (_e) { /* ohne w4 keine Haltung */ }
    return out;
}
// die Lage eines Geräts aus dem Stand des Blicks (S): Job mit Schritt, Messung, Auftrag, Schloss, Welten, Lebenszeichen
function lageVon(S, g, laufe, wache, jetzt = sek(Date.now())) {
    const L = S[g.l] || null, J = S[g.j] || null, mp = g.mp ? S[g.mp] : null, sitz = S.sitzungVon ? S.sitzungVon(g.sitz) : [];
    const o = { name: g.name, titel: g.titel, offline: !!(L && L.status !== "online"), job: null, misst: [], auftrag: [], halter: null, welten: [], wache: wache || null, station: null, lebens: [] };
    const fort = [wache && wache.ab];
    const mess = commitVon((/(?:^| )m=([0-9a-f]{7,40})/.exec((wache && wache.sig) || "") || [])[1]);
    if (mess) fort.push(mess.t);
    if (J) {
        const st = J.job.steps || [], an = st.find((x) => x.status === "in_progress");
        o.job = {
            art: /GPU-Probe/.test(J.run.name) ? "PROBE" : /^(integ-|zug-)/.test(J.run.head_branch) ? "ZUG-JOB" : "JOB",
            name: `${J.run.name.split(" ")[0]}/${J.job.name.replace(/ \(.*$/, "")}`, zweig: J.run.head_branch, sha: J.run.head_sha,
            schritt: an ? an.name : "vor dem ersten Schritt (Start-Hook)", fertig: st.filter((x) => x.status === "completed").length, n: st.length,
            schrittSeit: sek(Date.parse((an && an.started_at) || J.job.started_at)),
        };
        // ein laufender CI-Job IST Arbeit: jeder Schritt-Wechsel ist Fortschritt (10.11. 19:10: Radeon und OMEN fuhren z370 in
        // Schritt 28/41 und 12/41 und standen mit 70:26 im ALARM, weil nur Mess-Pushes zählten). Klemmt der Schritt, schlägt die Schritt-Uhr
        fort.push(o.job.schrittSeit);
    }
    if (mp && !mp.zu) { o.misst.push(`${mp.id.replace(/-(gtx|radeon|headless)$/, "")}${mp.stand ? ` ${mp.stand.i}/${mp.stand.n} ${mp.stand.station}` : ""}`); fort.push(sek(mp.letzte && mp.letzte.t)); }
    for (const l of (laufe || []).filter((x) => g.lauf && x.geraet === g.lauf)) {
        o.misst.push(`punkte ${s8(l.sha)}${l.offen ? " --offen" : l.nur ? ` --nur ${l.nur.split(",").length}` : ""} ${l.misst ? `${l.fertig}${l.n ? "/" + l.n : ""} Stationen` : "wartet auf den Spiel-Baum"}`);
        if (l.misst) { fort.push(l.mtime); if (!o.station || l.stationSeit < o.station.seit) o.station = { seit: l.stationSeit, id: l.station, nach: l.letzte }; }
    }
    if (g.name === "RADEON") {
        if (S.lauer) o.misst.push(`Ruhe-Läufer seit ${hm(sek(S.lauer.start))}`);
        // das Schloss liest die Uhr nie mehr selbst (nur hier, nur für die Radeon): es meldet sich für jedes Gerät gleich im Puls (pulsEin)
        o.welten = [...new Set((S.werkbaenke || []).map((w) => w.name))];
    }
    for (const s of sitz) {
        const lz = lebenszeichenVon(S.erledigtT, s.id);
        (s.mess ? o.misst : o.auftrag).push(`${s.mess ? "Sitzung" : "Auftrag"} ${s.id}${s.datei && s.datei.gemessen != null ? ` ${s.datei.gemessen}${s.n ? "/" + s.n : ""} gemessen` : ""} seit ${hm(sek(s.t))}`);
        if (lz) { o.lebens.push({ id: s.id, ...lz }); fort.push(lz.t); }
        if (s.datei && s.datei.t) fort.push(sek(s.datei.t));
    }
    // eine Mess-Datei, gepusht vor weniger als ALARM_S, ohne andere Arbeit: das Gerät misst (die Sitzung pusht je Station)
    const messJung = mess && jetzt - mess.t < ALARM_S;
    if (mess) o.mess = { t: mess.t, betreff: mess.betreff.replace(/^OMEN GTX: messung |^Messung /, "") };
    o.zustand = o.job ? o.job.art : o.misst.length ? "MISST" : o.auftrag.length ? "AUFTRAG" : messJung ? "MISST" : o.welten.length ? "WERKBANK" : "FREI";
    // das Ende des letzten Jobs ist Fortschritt (10.11. 19:18: nach ihrem echt-Bein von z370 fiel die Radeon auf den Mess-Push von 18:00
    // zurück und stand mit 78:41 im ALARM, Minuten nach getaner Arbeit) — frei bleibt sie danach höchstens 15 min ohne Alarm
    const vz = (S[g.v] || [])[0];
    if (vz && vz.ende) fort.push(sek(vz.ende));
    const f = fort.filter((x) => x != null);
    o.fortschritt = f.length ? Math.max(...f) : null;
    const v = (S[g.v] || [])[0];
    o.zuletzt = v ? { was: `${v.lauf}/${v.name}`.replace(/^GPU-Probe\/probe$/, "GPU-Probe").replace(/^Code-Check\//, ""), zweig: v.zweig, sha: v.sha, wort: v.wort, ende: sek(v.ende) } : null;
    return o;
}
function verlaufLesen(datei, ab) {
    const t = lies(datei);
    if (!t) return [];
    const z = [];
    for (const l of t.split(/\r?\n/)) { if (!l) continue; try { const x = JSON.parse(l); if (x.t >= ab) z.push(x); } catch (_e) { /* eine halbe Zeile beim Schreiben */ } }
    return z.sort((a, b) => a.t - b.t);
}
function verlaufAnhaengen(datei, zeile, jetzt) {
    try {
        fs.appendFileSync(datei, JSON.stringify(zeile) + "\n");
        // je Tag einmal gekürzt: zwei Tage reichen für „frei heute“ über Mitternacht
        if (fs.statSync(datei).size > 1 << 20) fs.writeFileSync(datei, verlaufLesen(datei, jetzt - 2 * 86400).map((x) => JSON.stringify(x)).join("\n") + "\n");
    } catch (_e) { /* ohne w4 kein Verlauf: die Seite sagt „noch kein Verlauf“ */ }
}
// DIE PULSE der Geräte: refs/puls/<gerät> (schloss-puls.cjs) — geholt im Hintergrund höchstens je 30 s (der Takt wartet nie aufs Netz),
// gelesen aus dem Klon. Ein Ref, der fehlt oder nicht lesbar ist, ist null: pulsUrteil sagt BLIND
// EIGENER NAMENSRAUM DES LESERS (14.11.): der Blick holte nach refs/puls/* — dieselben Refs, die jeder andere Abruf im Klon schreibt.
// Zwei Schreiber, ein Ref: „cannot lock ref 'refs/puls/omen': is at … but expected …", der Abruf scheiterte, und alle drei Geräte hießen
// BLIND („refs/puls fehlt"), während ihr Puls je Minute am Remote ankam (Schöpfer 10:08: „einige Dinge aktualisieren nicht"). Der Leser
// holt jetzt nach refs/blick-puls/* (nur er schreibt dort). Scheitert EIN Lesen, gilt der zuletzt gelesene Puls weiter — sein Alter
// macht ihn nach PULS_BLIND_S von selbst BLIND („kein Puls seit …"), nie ein Wettlauf am Ref.
const PULS_REF = "refs/blick-puls", pulsZuletzt = {};
let pulsHolt = null, pulsGeholt = 0;
function pulseLesen(jetzt) {
    const fetchArgs = ["-C", REPO, "fetch", "-q", "--no-tags", "--no-write-fetch-head", "origin", `+refs/puls/*:${PULS_REF}/*`];
    if (!pulsGeholt) { // der erste Takt (und jedes --kurz) wartet einmal auf den Stand — sonst läse er den Puls vom letzten Mal
        pulsGeholt = jetzt;
        try { execFileSync("git", fetchArgs, { timeout: 30000, windowsHide: true, stdio: "ignore" }); } catch (_e) { /* ohne Netz: der alte Stand, sein Alter macht ihn BLIND */ }
    } else if (!pulsHolt && jetzt - pulsGeholt >= 30) {
        pulsGeholt = jetzt;
        pulsHolt = execFile("git", fetchArgs, { timeout: 60000, windowsHide: true }, () => { pulsHolt = null; });
    }
    const je = {};
    for (const g of GERAETE) {
        try { je[g.sitz] = pulsZuletzt[g.sitz] = JSON.parse(execFileSync("git", ["-C", REPO, "cat-file", "blob", `${PULS_REF}/${g.sitz}:puls.json`], { encoding: "utf8", timeout: 8000, windowsHide: true, stdio: ["ignore", "pipe", "ignore"] })); } catch (_e) { je[g.sitz] = pulsZuletzt[g.sitz] || null; }
    }
    return je;
}
// JE TAKT: Lage, Urteil und Verlauf je Gerät (der Blick ruft es am Ende von holen; schreiben = false nur im Selbsttest)
function lagen(S, { jetzt = sek(Date.now()), ps = null, schreiben = true, datei = VERLAUF, pulse = null } = {}) {
    const w = wacheLesen(), laufe = laeufe(ps, jetzt), pu = pulse || pulseLesen(jetzt);
    const geraete = GERAETE.map((g) => { const l = pulsEin(lageVon(S, g, laufe, w.je[g.name], jetzt), pulsUrteil(pu[g.sitz], jetzt)); l.urteil = uhrUrteil(l, jetzt); return l; });
    const zeile = { t: jetzt, je: Object.fromEntries(geraete.map((l) => [l.name, [l.zustand, l.urteil.stufe === "alarm" ? 1 : 0]])) };
    const ab = sek(new Date(new Date(jetzt * 1000).toDateString()));
    const zeilen = verlaufLesen(datei, ab - LUECKE_S);
    if (schreiben) verlaufAnhaengen(datei, zeile, jetzt);
    zeilen.push(zeile);
    for (const l of geraete) l.heute = verlaufSumme(zeilen, l.name, ab, jetzt);
    const wacheLebt = ps ? ps.some((p) => /wache-(k10|filter)\.sh|wache-geraete\.cjs/.test(p.cmd)) : null;
    return { geraete, wache: w, wacheLebt, ab, erste: zeilen.length > 1 ? Math.max(ab, zeilen[0].t) : null, jetzt, laufe };
}

// die Stationen der Punkte-Maschine (Kopie des Koordinators, w3/pm): [k#s, gerät, minuten] — in EINEM Kind-Prozess geladen (die Module laufen
// nie im Blick), je Stand der Dateien einmal
let stationenSpeicher = { key: null, defs: null };
function stationenLesen(dir = PM_PUNKTE) {
    let key;
    try { key = ["g1", "g2", "g3", "g4", "g5", "g6"].map((g) => { try { return fs.statSync(path.join(dir, "stationen", g + ".js")).mtimeMs; } catch (_e) { return 0; } }).join(","); } catch (_e) { key = "?"; }
    if (stationenSpeicher.key === key && stationenSpeicher.defs) return Promise.resolve(stationenSpeicher.defs);
    const code = "const o=[],f=[];for(const g of ['g1','g2','g3','g4','g5','g6']){let m;try{m=require('./stationen/'+g+'.js')}catch(e){f.push(g+': '+String(e.message).split('\\n')[0]);continue}for(const s of m)o.push([s.kriterium+'#'+s.staffel,s.geraet,s.minuten,s.probe?s.probe.sek||null:null,!!s.probe])}process.stdout.write(JSON.stringify({o,f}))";
    return new Promise((ok, nein) => execFile(process.execPath, ["-e", code], { cwd: dir, timeout: 30000, windowsHide: true, maxBuffer: 1 << 24 }, (e, out) => {
        if (e) return nein(new Error("Stationen aus " + dir + ": " + String(e.message).split("\n")[0]));
        let j;
        try { j = JSON.parse(out); } catch (x) { return nein(new Error("Stationen: kein JSON")); }
        if (j.f.length) return nein(new Error("Stationen nicht geladen: " + j.f.join(" · ")));
        stationenSpeicher = { key, defs: j.o };
        ok(j.o);
    }));
}
// stand.json in der Kurzform der Uhr: je Kriterium Punkte und seine veralteten Stationen
const ALT = /seit der Messung geändert|ungemessen|\briss/i;
function standUhr(text) {
    const s = JSON.parse(text), je = {};
    for (const [k, v] of Object.entries(s.je || {})) je[k] = { punkte: v.punkte || 0, p: v.punkte || 0, alt: (v.stationen || []).filter((x) => x.ungemessen || ALT.test(x.grund || "")).map((x) => [x.id, x.geraet]) };
    return { kopf: s.kopf, je };
}
const kurzGrund = (g) => {
    const w = /WACHSTUMS-WAND.*?(\+\d+) Atome bei Spiel (\d+).*?erlaubt die Hälfte \((\d+)\)/.exec(g);
    if (w) return `WACHSTUMS-WAND ${w[1]} Atome (Spiel ${w[2]}, erlaubt ${w[3]})`;
    return String(g).replace(/^bleibt draußen — /, "").replace(/\s*\([^()]*\)/g, "").replace(/\s+/g, " ").trim();
};
function wartetLesen(datei = path.join(W4, "zug-nie-leer.wartet")) {
    const je = new Map(); let t = null;
    try { t = sek(fs.statSync(datei).mtimeMs); } catch (_e) { return { je, t }; }
    for (const z of (lies(datei) || "").split(/\r?\n/)) { const m = /^(\S+?)(?: ([0-9a-f]{7,40}))?: (.*)$/.exec(z.trim()); if (m) je.set(m[1], { sha: m[2] || null, grund: kurzGrund(m[3]) }); }
    return { je, t };
}
function sammelnVon(ps) {
    const o = [];
    for (const p of ps || []) {
        const m = /zug-sammler\d*\.sh (z\d+) \d+ (.+)$/.exec(p.cmd) || /zug-schlange\d*\.sh \S+ (z\d+):(.+)$/.exec(p.cmd);
        if (m && !o.some((z) => z.name === m[1])) o.push({ name: m[1], start: sek(p.start), drin: m[2].trim().split(/\s+/), sammelt: true });
    }
    return o;
}
// je Zweig der Zug, der ihn zuletzt fuhr (w4/zug-nie-leer.log „HH:MM zNNN fährt …: <zweige> · …“) und ob die Kette lebt (ps)
function ketteLesen(ps, datei = path.join(W4, "zug-nie-leer.log")) {
    const je = new Map();
    for (const z of (lies(datei) || "").split(/\r?\n/)) { const m = /^\d\d:\d\d (z\d+) fährt[^:]*: (.*?)(?: · |$)/.exec(z); if (m) for (const b of m[2].split(/\s+/)) if (b) je.set(b, m[1]); }
    // die Kette IST zug-dienst.sh (koordination zug/dienst, seit 10.11. 22:40): EINE Schleife ohne Ende; ihr Puls steht in dienst/zug.puls
    const p = (ps || []).some((x) => /zug-dienst\.sh/.test(x.cmd));
    const hand = (ps || []).map((x) => /(z\d+)-hand\.sh/.exec(x.cmd)).find(Boolean);
    const puls = (lies(path.join(W4, "..", "dienst", "zug.puls")) || "").trim();
    return { je, lebt: ps ? p : null, puls: puls.slice(20, 140), pulsT: puls ? Date.parse(puls.slice(0, 19).replace(" ", "T")) : null, hand: hand ? hand[1] : null };
}

// JE LANGSAMEM TAKT: Stau, Veraltet, Kette, Balance, Engpass. x = { W (wartendVon), SL0 ({sha,t} des jüngsten stand.json), standText(sha), api,
// rotSchritte, speicher, Z (Züge mit Urteil, tafelZahlen), zuege (zugLaeufe), ps, abgaben (w3/abgabe.log), dPunkte, karte, wandMin, jetzt (Date), v }
const standSpeicher = new Map();
async function langsam(x) {
    const jetzt = sek(x.jetzt), U = { t: jetzt };
    const v = x.v || ((_w, fn) => fn());
    // stand.json: die Kurzform je Commit einmal (324 KB)
    if (x.SL0) U.stand = await v("Uhr stand.json", async () => {
        if (!standSpeicher.has(x.SL0.sha)) { standSpeicher.clear(); standSpeicher.set(x.SL0.sha, { ...standUhr(await x.standText(x.SL0.sha)), sha: x.SL0.sha, t: sek(x.SL0.t) }); }
        return standSpeicher.get(x.SL0.sha);
    });
    const je = U.stand ? U.stand.je : null;
    // DER STAU
    if (x.W) U.stau = await v("Uhr Stau", async () => {
        const gef = new Set((lies(path.join(W4, "zug-gefahren.txt")) || "").split(/\r?\n/).map((l) => l.trim()).filter(Boolean));
        const wartet = wartetLesen(), kette = ketteLesen(x.ps);
        // ein laufender Zug, auch in seiner Nachwache (zNNNw trägt keine drin-Zeilen: die Basis zNNN nennt die Zweige)
        const laeuft = (x.zuege || []).filter((z) => z.laeuft).map((z) => (x.zuege || []).find((y) => y.name === "z" + z.nr) || z), sammeln = sammelnVon(x.ps);
        const sieht = new Set((lies(path.join(W4, "zug-nie-leer.refs")) || "").split(/\r?\n/).map((l) => l.split("refs/heads/")[1]).filter(Boolean));
        const welleNr = (z) => { const m = /^w([0-9]+)-/.exec(z); return m ? Number(m[1]) : 0; }, top = Math.max(0, ...x.W.wartend.map((a) => welleNr(a.zweig)));
        const sp = (x.speicher.uhrKrit = x.speicher.uhrKrit || {});
        const liste = [];
        const aelter = x.W.wartend.filter((a) => welleNr(a.zweig) < top - 1);
        for (const a of x.W.wartend.filter((a) => welleNr(a.zweig) >= top - 1)) {
            const sha = a.sha;
            if (!sp[sha]) { const c = await x.api(`/git/commits/${sha}`); sp[sha] = kriterienAus(c.message); }
            const runs = ((await x.api(`/actions/runs?head_sha=${sha}&per_page=20`)).workflow_runs || []).sort((p, q) => new Date(q.created_at) - new Date(p.created_at));
            const lauf = (n) => runs.find((r) => r.name === n) || null;
            const urt = async (r) => {
                if (!r) return { z: "—" };
                if (r.status !== "completed") return { z: "…" };
                if (r.conclusion === "success") return { z: "✓" };
                const rj = r.conclusion === "failure" ? await x.rotSchritte(r) : [];
                return { z: "✗", rot: rj.map((j) => `${j.name} [${j.schritt}]`).join(" · ") || r.conclusion };
            };
            const cc = await urt(lauf("Code-Check")), pr = await urt(lauf("GPU-Probe"));
            const zug = laeuft.find((z) => z.drin.some((d) => d.z === a.zweig && sha.startsWith(d.sha))) || sammeln.find((z) => z.drin.includes(a.zweig));
            const zuletzt = kette.je.get(a.zweig), zZ = zuletzt && (x.Z || []).find((z) => z.name === zuletzt);
            const w = wartet.je.get(a.zweig);
            liste.push({
                ...a, kriterien: sp[sha], punkte: punkteBewertung(sp[sha], je), cc, pr,
                zug: zug ? { wie: "fährt", id: zug.name } : gef.has(`${a.zweig} ${sha}`) ? { wie: "gefahren", id: zuletzt || "?", urteil: zZ && zZ.urteil } : zuletzt ? { wie: "alt", id: zuletzt } : null,
                grund: w && (!w.sha || sha.startsWith(w.sha)) ? w.grund : null, sieht: sieht.has(a.zweig),
            });
        }
        // der Speicher hält nur die Köpfe, die warten (je Kopf einmal geholt, unveränderlich; ein Kopf, der zurückkehrt, wird neu geholt)
        x.speicher.uhrKrit = Object.fromEntries(Object.entries(sp).filter(([k]) => x.W.wartend.some((a) => a.sha === k)));
        const ohnePm = liste.filter((a) => !a.pm);
        return { liste, n: liste.length, nZug: ohnePm.length, nPm: liste.length - ohnePm.length, bisZu: punkteSumme(liste.map((a) => a.kriterien), je), grundT: wartet.t, kette, main: x.W.main,
            wellen: top ? `w${top - 1}/w${top}` : "?", aelter: aelter.map((a) => a.zweig) };
    });
    // VERALTET
    if (U.stand) U.veraltet = await v("Uhr Veraltet", async () => veraltetVon(U.stand, await stationenLesen(), JSON.parse(lies(path.join(PM_PUNKTE, "deckel.json")) || "{}")));
    // DIE KETTE: die Züge der letzten 6 h, der letzte mit Urteil, der laufende
    const Z = (x.Z || []).filter((z) => z.urteil && z.ende), z6 = Z.filter((z) => jetzt - sek(z.ende) <= H6);
    const letzter = [...Z].sort((p, q) => q.ende - p.ende)[0] || null;
    const grundVon = (z) => {
        const l = (x.zuege || []).filter((y) => y.nr === z.nr && y.rotT).sort((p, q) => q.rotT - p.rotT)[0];
        return l ? l.letzte.replace(/^\d\d:\d\d:\d\d\s+/, "").replace(/^\[\w+\] FAHRT ROT (\([^)]*\))?:?\s*/, "").replace(/^urteil: ROT\s*/, "") : "";
    };
    const laeuft = (x.zuege || []).filter((z) => z.laeuft).map((z) => { const b = (x.zuege || []).find((y) => y.name === "z" + z.nr) || z; return { name: z.name, start: sek(z.start || z.t), drin: b.drin.map((d) => d.z) }; })
        .concat(sammelnVon(x.ps).filter((z) => !(x.zuege || []).some((y) => y.name === z.name)).map((z) => ({ ...z, name: z.name + " sammelt" })));
    U.kette = { gruen: z6.filter((z) => z.urteil === "grün").length, rot: z6.filter((z) => z.urteil === "rot").length,
        letzter: letzter && { name: letzter.name, urteil: letzter.urteil, vonHand: !!letzter.vonHand, ende: sek(letzter.ende), grund: letzter.urteil === "rot" ? grundVon(letzter) : "", nachwache: laeuft.some((z) => z.name === letzter.name + "w") },
        laeuft, lebt: U.stau ? U.stau.kette : ketteLesen(x.ps) };
    // DIE BALANCE (6 h)
    const messen = await v("Uhr Mess-Commits", async () => {
        const ab = new Date((jetzt - H6) * 1000); ab.setMinutes(0, 0, 0); // an der vollen Stunde: dieselbe URL, ETag
        const c = await x.api(`/commits?sha=punkte-maschine&path=meisterkarte-quelle/punkte/messung&since=${ab.toISOString().slice(0, 19)}Z&per_page=100`);
        return c.filter((y) => jetzt - sek(new Date(y.commit.committer.date)) <= H6).length;
    });
    const integ = x.gelandet ? x.gelandet.length : null; // „Merge <zweig> in integ-probe“ auf main in 6 h: was in main steckt, zählt — auch von Hand gelandet
    U.balance = { machen: (x.abgaben || []).filter((a) => jetzt - sek(a.t) <= H6).length, integ, messen, punkte: x.dPunkte, karte: x.karte,
        wartend: U.stau ? U.stau.nZug : null, bisZu: U.stau ? U.stau.bisZu : null, veraltetSt: U.veraltet ? U.veraltet.stationen : null };
    U.engpass = U.stau && U.veraltet ? engpass({ wartend: U.stau.nZug, wandMin: x.wandMin, veraltetMin: U.veraltet.parallel }) : null;
    return U;
}

// ── ZEICHNEN (die Farben und Spalten des Blicks kommen als T herein: EINE Farb-Entscheidung) ───────────────────────────────────────
const farbeVon = (T, st) => (st === "alarm" ? T.rot : st === "gelb" ? T.gelb : st === "ok" ? T.gruen : T.grau);
const ALARM_MARKE = (T) => T.f("41;97;1", " ALARM ");
// die Urteile neu zur Uhrzeit (die Uhr zählt zwischen den Takten weiter; der Blick zeichnet die Seite je Sekunde)
const urteileJetzt = (U, jetzt) => U.geraete.map((l) => ({ ...l, urteil: uhrUrteil(l, jetzt) }));
// der Zusatz des Pulses: der Halter beim Namen, oder warum die Uhr blind ist
const pulsText = (l, jetzt) => l.halter ? `: ${belegtText(l.halter, jetzt).replace(/^belegt: /, "")} · regt vor ${zeitText(jetzt - l.halter.regt).text}` : l.zustand === "BLIND" ? `: kein Puls${l.puls && l.puls.alter != null ? ` seit ${zeitText(l.puls.alter).text}` : " (refs/puls fehlt)"}` : "";
function kopf(U, LU, T, jetzt = sek(Date.now())) {
    const g = U ? urteileJetzt(U, jetzt).map((l) => { const z = zeitText(l.urteil.s).text; return `${l.name.replace("GTX1050", "1050")} ${l.urteil.stufe === "alarm" ? T.f("41;97;1", z) : farbeVon(T, l.urteil.stufe)(z)}`; }).join(T.grau(" · ")) : T.grau("?");
    const st = LU && LU.stau, va = LU && LU.veraltet, ep = LU && LU.engpass;
    return `${T.fett("UHR")} ${g} ${T.grau("│")} ${st ? `STAU ${T.fett(st.nZug)}${st.nPm ? T.grau(`+${st.nPm}pm`) : ""} · ≤ ${T.gruen("+" + st.bisZu)} P` : T.grau("STAU ?")} ${T.grau("│")} ${va ? `VERALTET ${T.fett(dauerS(va.parallel * 60).replace(" min", ""))}` : T.grau("VERALTET ?")} ${T.grau("│")} ${ep ? T.fett("→ " + ep[0].was) : ""}`;
}
function kurz(U, LU, jetzt = sek(Date.now())) {
    const g = U ? urteileJetzt(U, jetzt).map((l) => `${l.name} ${zeitText(l.urteil.s).text} ${l.urteil.stufe}${l.urteil.grund ? " " + l.urteil.grund : ""} (${l.zustand}${pulsText(l, jetzt)})`).join(" · ") : "?";
    const st = LU && LU.stau, va = LU && LU.veraltet, ep = LU && LU.engpass;
    return `UHR ${g} | STAU ${st ? `${st.nZug} abgegeben${st.nPm ? ` +${st.nPm} pm` : ""} · bis zu +${st.bisZu} P` : "?"} | VERALTET ${va ? `${va.stationen} St. ≈ ${dauerS(va.parallel * 60)} bei 3 Geräten` : "?"} | ENGPASS ${ep ? ep.map((e) => e.was).join(" > ") : "?"}`;
}
const linieMit = (T, titel, rechts) => T.kappe(T.grau("─── ") + T.fett(titel) + " " + T.grau("─".repeat(Math.max(3, (T.BREITE || 100) - 6 - T.sicht(titel).length - T.sicht(rechts).length))) + " " + rechts);
// ein geteilter Balken: █ das Getane, ░ das Offene
const teil = (T, a, b, w = 20) => { const n = Math.max(0, Math.min(w, Math.round((w * a) / Math.max(1, a + b)))); return T.gelb("█".repeat(n)) + T.grau("░".repeat(w - n)); };
function seite(S, LU, T, jetzt = sek(Date.now())) {
    const U = S.uhr, out = [], B = 33;
    if (!U) return [T.linie("UHR · noch keine Lage")];
    const G = urteileJetzt(U, jetzt), w = U.wache;
    const wAlt = w.runde ? jetzt - w.runde : null;
    const wTxt = w.runde == null ? T.rot("Wache fehlt (w4/wache-stand)") : wAlt > WACHE_STILL_S ? T.rot(`Wache still seit ${dauerS(wAlt)}${U.wacheLebt === false ? " — kein wache-filter.sh" : ""}`) : T.grau(`Wache ${hm(w.runde)}`);
    const g0 = G[0] && G[0].heute ? G[0].heute.gesehen : 0, deckt = g0 >= jetzt - U.ab - 600;
    const vTxt = deckt || !U.erste ? "" : T.grau(` · frei heute ab ${hm(U.erste)}`); // „frei heute“ zählt nur, was der Blick sah (uhr-verlauf.jsonl)
    out.push(linieMit(T, "UHR · seit Fortschritt · gelb ab 10 · ALARM ab 15 min", wTxt + (w.blind ? T.rot(` · BLIND ${w.blind}`) : "") + vTxt));
    const spalten = G.map((l) => {
        const u = l.urteil, fa = farbeVon(T, u.stufe), zt = zeitText(u.s), g = gross(zt.text), h = l.heute;
        const marke = u.stufe === "alarm" ? ALARM_MARKE(T) : u.stufe === "gelb" ? T.gelb("gelb") : u.stufe === "ok" ? T.gruen("ok") : T.grau("?");
        const fuell = u.s == null ? 0 : Math.min(16, Math.round((16 * u.s) / ALARM_S));
        const pz = h.gesehen ? Math.round((100 * h.frei) / h.gesehen) : null;
        return [
            `${T.fett(l.titel)} ${l.zustand === "FREI" ? T.grau("FREI") : T.f("7", ` ${l.zustand} `)}`,
            `${fa(g[0])}  ${T.grau(zt.einheit + " seit")}`,
            `${fa(g[1])}  ${T.grau(u.quelle === "Schritt" ? "im Schritt" : u.quelle === "Station" ? "an Station" : "Fortschritt")}`,
            `${fa(g[2])}  ${marke}`,
            `${fa("█".repeat(fuell))}${T.grau("░".repeat(16 - fuell))} ${T.grau("frei heute")}`,
            h.gesehen ? `${T.fett(dauerS(h.frei))} (${pz} %)${h.steht >= 60 ? T.rot(` steht ${dauerS(h.steht)}`) : ""}` : T.grau("noch kein Verlauf"),
        ];
    });
    for (let r = 0; r < 6; r++) out.push(" " + spalten.map((s) => T.spalte(T.kappe(s[r], B - 1), B)).join(""));
    for (const l of G) {
        const u = l.urteil, teile = [];
        if (l.job) teile.push(`${l.job.art === "JOB" ? l.job.name + " " : ""}${l.job.zweig} ${s8(l.job.sha)} Schritt ${l.job.fertig + 1}/${l.job.n} „${l.job.schritt.split(" (")[0].slice(0, 28)}“ seit ${zeitText(jetzt - l.job.schrittSeit).text}`);
        teile.push(...l.misst, ...l.auftrag);
        if (l.station) teile.push(`${l.station.id ? `an ${l.station.id}` : l.station.nach ? `nach ${l.station.nach.id} ${l.station.nach.wort}` : "Station"} seit ${zeitText(jetzt - l.station.seit).text}`);
        if (l.mess && (l.zustand === "MISST" || jetzt - l.mess.t < 3600) && !l.station) teile.push(`Mess-Datei ${hm(l.mess.t)} ${l.mess.betreff}`);
        for (const z of l.lebens) teile.push(`Lebenszeichen ${z.id} ${hm(z.t)} (vor ${zeitText(jetzt - z.t).text}): ${z.text.replace(/^Zwischenstand:?\s*/, "")}`);
        if (l.zustand === "FREI") teile.unshift("kein Job, keine Messung, kein Auftrag" + (l.zuletzt ? ` · zuletzt ${l.zuletzt.was} ${l.zuletzt.zweig} ${l.zuletzt.wort === "success" ? "✓" : l.zuletzt.wort === "failure" ? "✗" : l.zuletzt.wort} ${hm(l.zuletzt.ende)}` : ""));
        if (l.halter) teile.unshift(`${belegtText(l.halter, jetzt)} · Lebenszeichen vor ${zeitText(jetzt - l.halter.regt).text}${l.halter.cpu != null ? ` (CPU ${Math.round(l.halter.cpu)} s)` : ""}`);
        else if (l.zustand === "BLIND") teile.unshift(T.rot(`BLIND — ${pulsText(l, jetzt).slice(2)}: ob das Gerät frei ist, weiß nur sein schloss-puls (puls-dienst.sh)`));
        else if (l.puls && l.puls.warten) teile.push(`${l.puls.warten} warten am freien Schloss`);
        if (l.welten.length) teile.push(`Welt offen: ${l.welten.join(", ")}`);
        if (l.offline) teile.push(T.rot("Läufer offline"));
        if (l.wache && l.wache.verwaist) teile.push(T.rot(`Schloss verwaist: ${l.wache.verwaist}`));
        // zwei Zeilen höchstens: geteilt vor dem Teil, der nicht mehr passt
        const kopfT = `  ${T.spalte(T.fett(l.name), 8)} ${u.grund ? T.rot(u.grund) + T.grau(" — ") : ""}`, zeilen = [kopfT];
        for (const t of teile) {
            const z = zeilen[zeilen.length - 1], leer = z === kopfT || z.trim() === "", mit = z + (leer ? "" : T.grau(" · ")) + t;
            if (leer || T.sicht(mit).length <= (T.BREITE || 100) || zeilen.length === 2) zeilen[zeilen.length - 1] = mit;
            else zeilen.push(" ".repeat(11) + t);
        }
        out.push(...zeilen.map((z) => T.kappe(z)));
    }
    // DER STAU
    const st = LU && LU.stau;
    if (!st) out.push(T.linie("STAU · nicht gelesen (siehe FEHLER)"));
    else {
        out.push(T.linie(`STAU ${st.wellen} · ${st.nZug} abgegeben${st.nPm ? ` + ${st.nPm} pm` : ""} · bis zu +${st.bisZu} P · Zug fasst ${ZUG_FASST}${st.grundT ? ` · Gründe ${hm(st.grundT)}${st.kette.lebt === false ? ", Kette steht" : ""}` : ""}`));
        const zugT = (a) => !a.zug ? T.grau("—") : a.zug.wie === "fährt" ? T.gelb(`fährt ${a.zug.id}`) : a.zug.wie === "gefahren" ? (a.zug.urteil === "rot" ? T.rot(`✗ ${a.zug.id}`) : T.grau(`${a.zug.id} ?`)) : T.grau(`alt ${a.zug.id}`);
        const zz = (u) => (u.z === "✓" ? T.gruen("✓") : u.z === "✗" ? T.rot("✗") : u.z === "…" ? T.gelb("…") : T.grau("—"));
        const reihe = [...st.liste].sort((p, q) => ((q.zug && q.zug.wie === "fährt") - (p.zug && p.zug.wie === "fährt")) || q.punkte.plus - p.punkte.plus || p.t - q.t);
        const platz = 5, zeige = reihe.length > platz ? reihe.slice(0, platz - 1) : reihe;
        out.push(T.grau(`  ${T.spalte("Zweig", 25)} ${T.rechts("Alter", 5)} CC Pr ${T.spalte("Zug", 10)} ${T.rechts("P", 2)}  Kriterien · warum es wartet`));
        for (const a of zeige) {
            const alter = jetzt - sek(a.t), at = alter < 86400 ? `${Math.floor(alter / 3600)}:${p2(Math.floor(alter / 60) % 60)}` : `${Math.round(alter / 3600)} h`;
            const warum = a.zug && a.zug.wie === "fährt" ? `im Zug ${a.zug.id}` : a.pm ? "landet nach seinem Leser (pm-nach-main)" : a.grund || (a.cc.z === "✗" ? "Code-Check ✗ " + (a.cc.rot || "") : a.cc.z === "…" ? "Code-Check läuft" : a.cc.z === "—" ? "kein Code-Check am Kopf"
                : a.pr.z === "✗" ? "GPU-Probe ✗ " + (a.pr.rot || "") : a.pr.z === "…" ? "GPU-Probe läuft" : a.zug && a.zug.wie === "gefahren" ? (a.zug.urteil === "rot" ? `fiel in ${a.zug.id} — braucht einen neuen Kopf` : `fuhr in ${a.zug.id}, ohne Urteil im Log`)
                : !a.sieht ? "die Kette sieht ihn nicht (zug-nie-leer.refs)" : "bereit, der nächste Zug nimmt ihn");
            const kr = [...a.punkte.offen, ...a.punkte.gebucht.map((k) => k + "✓")].join(" ");
            out.push(T.kappe(`  ${T.spalte(a.zweig, 25)} ${T.rechts(at, 5)} ${zz(a.cc)}  ${zz(a.pr)}  ${T.spalte(zugT(a), 10)} ${T.rechts(a.punkte.plus ? T.gruen("+" + a.punkte.plus) : T.grau("—"), 2)}  ${kr ? T.fett(kr) + T.grau(" · ") : ""}${T.grau(warum)}`));
        }
        const mehr = [reihe.length > zeige.length ? `… ${reihe.length - zeige.length} weitere: ${reihe.slice(zeige.length).map((a) => a.zweig + (a.punkte.plus ? " +" + a.punkte.plus : "")).join(", ")}` : "",
            st.aelter.length ? `dazu ${st.aelter.length} ältere (in WARTEND): ${st.aelter.join(", ")}` : ""].filter(Boolean);
        if (mehr.length) out.push(T.grau(T.kappe("  " + mehr.join(" · "))));
    }
    // VERALTET
    const va = LU && LU.veraltet;
    out.push(va ? T.linie(`VERALTET · ${va.kriterien} Kriterien < 2 P · ${va.stationen} St. geändert/ungemessen/riss · stand ${LU.stand ? `${LU.stand.kopf} ${hm(LU.stand.t)}` : "?"}`) : T.linie("VERALTET · nicht gelesen (siehe FEHLER)"));
    if (va) {
        out.push("  " + ["radeon", "gtx", "headless"].map((g) => `${g} ${T.fett(String(va.je[g].n))} St. ~${dauerS(va.je[g].min * 60).replace(" min", "")}`).join(T.grau("  ·  ")) + (va.ohneSoll ? T.grau(`  · ${va.ohneSoll} ohne Soll`) : "") + T.grau("  (Soll = Deckel je Probe)"));
        out.push(`  bei 3 Geräten parallel ≈ ${T.fett(dauerS(va.parallel * 60))} ${T.grau("(Radeon nur radeon · OMEN nur gtx · headless verteilt)")}`);
    }
    // DIE KETTE
    const k = LU && LU.kette;
    if (k) {
        const pAlt = k.lebt && k.lebt.pulsT ? Math.round((Date.now() - k.lebt.pulsT) / 60e3) : null; // ein Puls, der stillsteht, ist ein Alarm
        const lebt = k.lebt && k.lebt.lebt === true ? (pAlt != null && pAlt > 45 && !/fährt|urteilt|Wiederaufnahme/.test(k.lebt.puls) ? T.rot(`zug-dienst lebt, Puls steht seit ${pAlt} min: ${k.lebt.puls}`) : T.gruen(`zug-dienst lebt · ${k.lebt.puls || "ohne Puls"}`)) : k.lebt && k.lebt.hand ? T.gelb(`${k.lebt.hand} von Hand · zug-dienst steht`) : k.lebt && k.lebt.lebt === false ? T.rot("zug-dienst läuft nicht — bash koordination zug/dienst/start.sh") : T.grau("Kette ?");
        out.push(linieMit(T, `ZUG-KETTE · 6 h ${k.gruen} ✓ · ${k.rot} ✗`, lebt));
        const l = k.letzter;
        const lauf = k.laeuft.length ? `läuft ${k.laeuft.map((z) => `${T.gelb(z.name)} seit ${hm(z.start)} (${z.drin.join(", ")})`).join(", ")}` : T.grau("kein Zug fährt");
        out.push(T.kappe(`  ${lauf} · ${l ? `zuletzt ${T.fett(l.name)} ${l.urteil === "grün" ? T.gruen(l.vonHand ? "✓ in main (von Hand)" : "✓ GELANDET") : T.rot("✗ ROT")} ${hm(l.ende)}${l.nachwache ? T.gelb(" · Nachwache läuft") : ""}${l.grund ? T.grau(" · " + l.grund) : ""}` : T.grau("kein Zug mit Urteil")}`));
    }
    // DIE BALANCE
    const b = LU && LU.balance;
    if (b) {
        out.push(T.linie(`BALANCE · letzte 6 h · █ getan ░ offen${LU.engpass ? ` · ▶ ENGPASS ${LU.engpass[0].was}` : ""}`));
        const mMax = Math.max(1, b.machen, (b.integ || 0) + (b.wartend || 0));
        out.push(`  ${T.spalte("MACHEN", 12)} ${T.gelb("█".repeat(Math.round((20 * b.machen) / mMax)))}${T.grau("░".repeat(20 - Math.round((20 * b.machen) / mMax)))} ${T.rechts(String(b.machen), 3)} Abgaben`);
        out.push(`  ${T.spalte("INTEGRATION", 12)} ${b.integ == null || b.wartend == null ? T.grau("░".repeat(20)) : teil(T, b.integ, b.wartend)} ${T.rechts(b.integ == null ? "?" : String(b.integ), 3)} Zweige in main ${T.grau("│")} ${b.wartend == null ? "?" : b.wartend} abgegeben warten auf den Zug`);
        out.push(`  ${T.spalte("MESSEN", 12)} ${b.messen == null || b.veraltetSt == null ? T.grau("░".repeat(20)) : teil(T, b.messen, b.veraltetSt)} ${T.rechts(b.messen == null ? "?" : String(b.messen), 3)} Mess-Commits ${T.grau("│")} ${b.veraltetSt == null ? "?" : b.veraltetSt} Stationen veraltet`);
        const dp = b.punkte == null ? null : b.punkte;
        out.push(`  ${T.spalte("PUNKTE", 12)} ${teil(T, Math.max(0, dp || 0), b.bisZu || 0)} ${T.rechts(dp == null ? "?" : dp > 0 ? "+" + dp : dp < 0 ? String(dp) : "±0", 3)} gebucht${b.karte != null ? ` (${b.karte})` : ""} ${T.grau("│")} bis zu +${b.bisZu == null ? "?" : b.bisZu} in abgegebenen Zweigen`);
        const e = LU.engpass;
        if (e) {
            const text = (x) => x.was === "INTEGRATION" ? `${b.wartend} abgegeben > ${STAU_ZUEGE * ZUG_FASST} (${STAU_ZUEGE} Züge à ${ZUG_FASST}) ≈ ${x.zuege} Züge · ${dauerS(x.min * 60)}` : x.was === "MESSEN" ? `veraltet ≈ ${dauerS(x.min * 60)} bei 3 Geräten > ${MESSEN_MIN / 60} h` : "nichts staut sich (abgegeben ≤ 2 Züge, veraltet ≤ 2 h) — es fehlen Abgaben";
            out.push(T.kappe(`  ${T.rot("▶")} ENGPASS ${T.fett(e[0].was)} — ${text(e[0])}${e.slice(1).map((x) => T.grau(`  · dann ${x.was} — ${text(x)}`)).join("")}`));
        }
    }
    return out;
}

// ── SELBSTTEST: je reine Funktion die Fälle; jede Mutante (der Fehler, den die Funktion abwehrt) muss mindestens einen Fall ROT machen ─────
function faelle(F) {
    const rot = [], t0 = 1794300000;
    let n = 0;
    const p = (name, ok) => { n++; if (!ok) rot.push(name); };
    // UHR — die Schwellen 10/15 min und die drei Uhren
    const u = (zustand, alt, job, station, verwaist) => F.uhrUrteil({ zustand, fortschritt: t0 - alt, job: job != null ? { schrittSeit: t0 - job } : null, station: station != null ? { seit: t0 - station } : null, wache: { verwaist } }, t0);
    p("U1 9:59 ⇒ ok", u("MISST", 599).stufe === "ok");
    p("U2 10:00 ⇒ gelb", u("MISST", 600).stufe === "gelb");
    p("U3 15:00 ⇒ ALARM STILLSTAND", u("MISST", 900).stufe === "alarm" && u("MISST", 900).grund === "STILLSTAND");
    p("U4 frei 15:00 ⇒ ALARM LEERLAUF", u("FREI", 900).grund === "LEERLAUF");
    p("U5 der Job steht 17 min im Schritt, der Abdruck rückte vor 2 min ⇒ ALARM SCHRITT KLEMMT", u("PROBE", 120, 1020).grund === "SCHRITT KLEMMT" && u("PROBE", 120, 1020).s === 1020);
    p("U6 die Lauf-Ausgabe wächst (30 s), die Station steht 16 min ⇒ ALARM STATION KLEMMT", u("MISST", 30, null, 960).grund === "STATION KLEMMT");
    p("U7 die Lauf-Ausgabe wächst, die Station 4 min ⇒ ok", u("MISST", 30, null, 240).stufe === "ok");
    p("U8 verwaistes Schloss ⇒ ALARM VERWAIST", u("MISST", 10, null, null, "ci-runner 9/1").grund === "VERWAIST");
    // PULS — das Schloss meldet seinen Halter (11.11. 19:33–19:49: die OMEN trug gate:haus-welt unter gpu-lauf, die Uhr zeigte „Frei“ und ALARM)
    const lagePuls = (puls) => { const l = F.pulsEin({ zustand: "FREI", fortschritt: t0 - 1200, job: null, station: null, wache: {} }, F.pulsUrteil(puls, t0)); return { l, u: F.uhrUrteil(l, t0) }; };
    const halterPuls = (regtVor) => ({ t: t0 - 40, frei: false, halter: { wer: "gate:haus-welt 2026-11-11T19:33:49+01:00 pid=4711", art: "TOR", seit: t0 - 960, regt: t0 - regtVor, lebt: true, cpu: 412 }, warten: 1, wartende: ["punkte-gtx"] });
    const k1 = lagePuls(halterPuls(30));
    p("K1 Halter lebt, Lebenszeichen vor 30 s, 20 min ohne Push ⇒ „belegt: gate:haus-welt seit 16:00 · 1 warten“ ok, nie Frei/ALARM", k1.l.zustand === "BELEGT" && k1.u.stufe === "ok" && k1.l.halter && belegtText(k1.l.halter, t0) === "belegt: gate:haus-welt seit 16:00 · 1 warten");
    const k2 = lagePuls(halterPuls(960));
    p("K2 Halter still 16 min ⇒ ALARM HALTER STILL", k2.u.stufe === "alarm" && k2.u.grund === "HALTER STILL");
    p("K3 kein Puls oder 5 min alt ⇒ BLIND, nie Frei", lagePuls(null).l.zustand === "BLIND" && lagePuls(null).u.grund === "BLIND" && lagePuls({ ...halterPuls(30), t: t0 - 301 }).l.zustand === "BLIND");
    const k4 = lagePuls({ t: t0 - 20, frei: true, warten: 0 });
    p("K4 frei gemeldet ⇒ FREI (20 min ohne Arbeit: LEERLAUF)", k4.l.zustand === "FREI" && k4.u.grund === "LEERLAUF");
    // PUNKTE — offen nur, was stand.json noch nicht trägt; FUND-Zeilen nennen nie den Anspruch
    const je = { "mensch.K4": { punkte: 0 }, "lod.K5": { punkte: 1 }, "haar.K1": { punkte: 2 } };
    const msg = "Abgabe w: mensch.K4#1 und lod.K5#2, dazu haar.K1#1 (gehalten), lod.K5#2 noch einmal\nFUND: x.js:1 · Kriterium lod.K5 gegen pipeline.K3#2\nunbekannt.K9#1";
    const ids = F.kriterienAus(msg), b = F.punkteBewertung(ids, je);
    p("P1 Ids aus der Nachricht, nie aus FUND", ids.join() === "haar.K1#1,lod.K5#2,mensch.K4#1,unbekannt.K9#1");
    p("P2 bis zu +2 (mensch.K4#1, lod.K5#2), haar.K1#1 gebucht, unbekannt zählt nie", b.plus === 2 && b.gebucht.join() === "haar.K1#1" && b.unbekannt.join() === "unbekannt.K9#1");
    p("P3 dieselbe Staffel in zwei Zweigen zählt einmal", F.punkteSumme([["mensch.K4#1"], ["mensch.K4#1", "lod.K5#2"]], je) === 2);
    // ENGPASS — die einfachste ehrliche Regel
    p("E1 9 abgegeben > 8 ⇒ INTEGRATION", F.engpass({ wartend: 9, wandMin: 50, veraltetMin: 30 })[0].was === "INTEGRATION");
    p("E2 3 abgegeben, veraltet 130 min ⇒ MESSEN", F.engpass({ wartend: 3, wandMin: 50, veraltetMin: 130 })[0].was === "MESSEN");
    p("E3 nichts staut ⇒ MACHEN", F.engpass({ wartend: 8, wandMin: 50, veraltetMin: 120 })[0].was === "MACHEN");
    p("E4 beide: der größere zuerst (12 abgegeben ≈ 3 Züge × 50 = 150 min < 300 min veraltet ⇒ MESSEN vor INTEGRATION)", F.engpass({ wartend: 12, wandMin: 50, veraltetMin: 300 }).map((e) => e.was).join() === "MESSEN,INTEGRATION");
    // VERLAUF — „frei heute“ nur aus Gesehenem, an Mitternacht geschnitten
    const ab = t0, z = (dt, st, alarm) => ({ t: ab + dt, je: { OMEN: [st, alarm ? 1 : 0] } });
    const Z = [z(-120, "FREI"), ...[0, 60, 120].map((d) => z(d, "FREI")), z(180, "MISST", 1), z(240, "MISST", 1), z(4000, "MISST"), z(4060, "FREI")];
    const v = F.verlaufSumme(Z, "OMEN", ab, ab + 4100);
    p("V1 frei 3 min 40 s, steht 1 min, gesehen 5 min 40 s — die Lücke 3760 s zählt nie, vor Mitternacht nie", v.frei === 220 && v.steht === 60 && v.gesehen === 340);
    // PARALLEL — die Klassen binden die Geräte
    p("Q1 300 min nur radeon ⇒ 300, nie 100", F.parallelMin({ radeon: 300, gtx: 0, headless: 0 }) === 300);
    p("Q2 headless verteilt: 90/90/180 ⇒ 120", F.parallelMin({ radeon: 90, gtx: 90, headless: 180 }) === 120);
    // VERALTET — die Soll-Minuten je Gerät, eine Station mit zwei Geräten zählt je Gerät, ein gebuchtes Kriterium nie
    const su = { je: { "a.K1": { p: 1, alt: [["a.K1#2", "radeon"], ["a.K1#2", "gtx"], ["a.K1#2", "gtx"]] }, "b.K1": { p: 2, alt: [["b.K1#1", "headless"]] }, "c.K1": { p: 0, alt: [["c.K1#1", "headless"]] } } };
    const va = F.veraltetVon(su, [["a.K1#2", ["radeon", "gtx"], 6, 60, true], ["c.K1#1", "headless", 3, null, false]], { radeon: { "a.K1#2": 90 } });
    p("A1 2 Kriterien, 3 Stationen; die Probe zählt ihren Deckel (radeon 90 s aus deckel.json, gtx 60 s probe.sek), der Befehl minuten (headless 3)", va.kriterien === 2 && va.stationen === 3 && va.je.radeon.min === 1.5 && va.je.gtx.min === 1 && va.je.headless.min === 3);
    // LAUF — die Station, an der ein Lauf steht, bis ihr Urteil kommt
    const lt = "Punkte-Maschine: 124 Station(en) in 80 Läufen auf radeon am 6aa7a5a6 · Sitzung\n  GRÜN a.K1#1 · x\n  SITZUNG Grundstellung vor b.K2#2: 1.6 s\n  SITZUNG Ort buehne vor b.K2#2 steht nicht — neu\n";
    const ls = F.laufStand(lt), ls2 = F.laufStand(lt + "  OFFEN b.K2#2 · Deckel\n");
    p("L1 Kopf, 1 Urteil, an b.K2#2; nach ihrem Urteil an keiner", ls.n === 124 && ls.geraet === "radeon" && ls.fertig === 1 && ls.station === "b.K2#2" && ls2.station === null && ls2.fertig === 2);
    // LEBENSZEICHEN — die jüngste Zeile des Auftrags, Zwischenstand zählt
    const lz = F.lebenszeichenVon("2026-11-10 12:35 traa Zwischenstand: eins\n2026-11-10 12:40 traa Zwischenstand: zwei\n2026-11-10 12:50 ander drei\n", "traa");
    p("Z1 jüngstes Lebenszeichen 12:40", lz && lz.text === "Zwischenstand: zwei" && hm(lz.t) === "12:40");
    // SAMMELN — ein Zug, der noch sammelt, fährt (die Zweige stehen im Aufruf von zug-sammler oder zug-schlange)
    const sm = F.sammelnVon([{ cmd: "bash zug-sammler7.sh z367 25 w27-a w27-b", start: new Date(t0 * 1000) }, { cmd: "bash /tmp/claude/w3/zug-schlange6.sh z367w z368:w27-c", start: new Date(t0 * 1000) }, { cmd: "bash zug-weiter3.sh z367", start: new Date(t0 * 1000) }]);
    p("S1 z367 sammelt (w27-a, w27-b), z368 wartet in der Schlange (w27-c)", sm.map((z) => `${z.name}:${z.drin.join("+")}`).join() === "z367:w27-a+w27-b,z368:w27-c");
    rot.n = n;
    return rot;
}
const ECHT = { uhrUrteil, pulsUrteil, pulsEin, kriterienAus, punkteBewertung, punkteSumme, engpass, verlaufSumme, parallelMin, veraltetVon, laufStand, lebenszeichenVon, sammelnVon };
// die Mutanten: je reiner Funktion der Fehler, den sie abwehrt (der alte Leser, die bequeme Abkürzung)
const MUTANTEN = {
    "Uhr: ALARM erst ab 16 min (die Frist der Wache, 960 s)": { uhrUrteil: (l, j) => { const u = uhrUrteil(l, j); return u.s === 900 ? { ...u, stufe: "gelb", grund: null } : u; } },
    "Uhr: belegt = Arbeit (der Job-Schritt zählt nie)": { uhrUrteil: (l, j) => uhrUrteil({ ...l, job: null }, j) },
    "Uhr: die Station zählt nie (die Wache vor dem 10.11. 13:58)": { uhrUrteil: (l, j) => uhrUrteil({ ...l, station: null }, j) },
    "Uhr ohne Halter-Leser (der Puls zählt nie — die Uhr vor dem 11.11.)": { pulsEin: (l) => l },
    "Puls: kein Puls = Frei (fail-soft)": { pulsUrteil: (p, j) => (p ? pulsUrteil(p, j) : { zustand: "FREI", alter: null, warten: 0, wartende: [] }) },
    "Halter: Belegung = Arbeit (das Lebenszeichen ist immer jetzt)": { pulsUrteil: (p, j) => { const o = pulsUrteil(p, j); return o.halter ? { ...o, halter: { ...o.halter, regt: j } } : o; } },
    "Kriterien: auch aus FUND-Zeilen": { kriterienAus: (m) => [...new Set(String(m).match(KRITERIUM) || [])].sort() },
    "Punkte: das Gebuchte zählt mit": { punkteBewertung: (ids, je) => { const o = punkteBewertung(ids, je); return { ...o, plus: o.plus + o.gebucht.length }; } },
    "Punkte: dieselbe Staffel zweier Zweige doppelt": { punkteSumme: (l, je) => l.reduce((n, x) => n + punkteBewertung(x, je).plus, 0) },
    "Engpass: Messen zählt nie": { engpass: (x) => engpass({ ...x, veraltetMin: 0 }) },
    "Verlauf: die Lücke zählt (Blick aus = frei)": { verlaufSumme: (z, g, ab, bis) => { const o = { frei: 0, steht: 0, gesehen: 0 }; for (let i = 0; i < z.length; i++) { const t1 = i + 1 < z.length ? z[i + 1].t : bis, d = Math.min(t1, bis) - Math.max(z[i].t, ab); if (d <= 0) continue; o.gesehen += d; if (z[i].je[g][0] === "FREI") o.frei += d; else if (z[i].je[g][1]) o.steht += d; } return o; } },
    "Verlauf: vor Mitternacht zählt mit": { verlaufSumme: (z, g, ab, bis) => verlaufSumme(z, g, -Infinity, bis) },
    "Parallel: Σ/3 ohne die Klassen": { parallelMin: (je) => ((je.radeon || 0) + (je.gtx || 0) + (je.headless || 0)) / 3 },
    "Veraltet: ein gebuchtes Kriterium zählt mit": { veraltetVon: (su, d, dk) => veraltetVon({ je: Object.fromEntries(Object.entries(su.je).map(([k, v]) => [k, { ...v, p: 0 }])) }, d, dk) },
    "Veraltet: die Probe zählt minuten statt ihres Deckels (11× zu groß)": { veraltetVon: (su, d, dk) => veraltetVon(su, d.map(([k, g, m]) => [k, g, m, null, false]), dk) },
    "Lauf: die Station bleibt nach ihrem Urteil stehen": { laufStand: (t) => { const o = laufStand(t), m = [...String(t).matchAll(/vor (\S+?)(?::|\s|$)/g)].pop(); return { ...o, station: m ? m[1] : null }; } },
    "Sammeln: nur fahre-Logs (14:40: z367 sammelte, die Kette sagte „kein Zug fährt“)": { sammelnVon: () => [] },
    "Lebenszeichen: nur schließende Zeilen (erledigtVon überspringt Zwischenstand)": { lebenszeichenVon: (t, id) => lebenszeichenVon(String(t).split("\n").filter((l) => !/Zwischen/.test(l)).join("\n"), id) },
};
// → { rot: [Namen], faelle: Zahl, je: { Mutante: [die Fälle, an denen sie ROT wird] } }
function pruefe() {
    const echt = faelle(ECHT), o = { rot: echt.map((n) => "Fall " + n), faelle: echt.n, je: {} };
    for (const [name, m] of Object.entries(MUTANTEN)) { o.je[name] = faelle({ ...ECHT, ...m }); if (!o.je[name].length) o.rot.push(`Mutante „${name}“ bleibt grün`); }
    return o;
}
if (require.main === module) {
    if (process.argv.includes("--selbsttest")) {
        const o = pruefe(), mn = Object.keys(MUTANTEN).length, gefangen = Object.values(o.je).filter((x) => x.length).length;
        if (process.argv.includes("-v")) for (const [m, f] of Object.entries(o.je)) console.log(`  Mutante „${m}“ ROT an: ${f.join(" · ") || "—"}`);
        console.log(o.rot.length ? `messplatz-uhr SELBSTTEST ROT ${o.rot.length}: ${o.rot.join(" · ")}` : `messplatz-uhr SELBSTTEST GRÜN: ${o.faelle} Fälle grün, ${gefangen}/${mn} Mutanten ROT (Uhr 10/15 min · Schritt · Station · Puls des Schlosses · Punkte · FUND · Engpass · Verlauf · Mitternacht · parallel · Deckel · Lauf · Lebenszeichen · Sammeln)`);
        process.exitCode = o.rot.length ? 1 : 0;
    } else console.log("Aufruf: node messplatz-uhr.cjs --selbsttest (die Seite zeichnet messplatz-blick.cjs, Taste 0)");
}

module.exports = { lagen, langsam, seite, kopf, kurz, pruefe, uhrUrteil, pulsUrteil, pulsEin, belegtText, kriterienAus, punkteBewertung, punkteSumme, engpass, verlaufSumme, parallelMin, veraltetVon, laufStand, lebenszeichenVon, zeitText, gross, GERAETE, ZUG_FASST };
