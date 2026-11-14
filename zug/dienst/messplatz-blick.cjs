#!/usr/bin/env node
"use strict";
// messplatz-blick.cjs — was die Messplätze, der Zug und die CI tun, als Text, alle 60 s (Rumpf von messplatz-blick.sh).
// Fünf Seiten, Taste 0–4, q beendet (ohne TTY oder mit --einmal alle nacheinander; --kurz ≤ 25 Zeilen; --selbsttest prüft Tafel und Uhr):
// UHR   — die Startseite (messplatz-uhr.cjs, 10.11.): je Gerät die Uhr seit dem letzten FORTSCHRITT (gelb 10, ALARM 15 min), frei heute, der STAU
//         fertiger Abgaben mit ihren Punkten, VERALTET, die Zug-Kette, die BALANCE mit dem Engpass; ihre drei Zahlen stehen im Kopf jeder Seite.
// JETZT — Ampel, OMEN (zug/fortschritt.txt + offene Warteschlange), Radeon (zug/fortschritt-radeon.txt, zug.sh punkte schreibt
//         sie), Logs des Koordinators ($TEMP/claude), laufende Runs mit Jobs und Läufer, Zweige mit Push in 6 h, Abgaben 6 h, Last.
// KURS  — EFFIZIENZ (Pflicht · Ertrag ehrlich aus stand.json · Budget je % · Fluss der Züge, kein Gesamt-Wert), Punkte- und
//         Wochen-Kurve aus zug/budget.txt, Züge je Tag (Versions-Stufen auf main), CI-Takt integ-probe, OMEN-Durchsatz, Qualität.
// PLAN  — zug/plan.txt, laufende/wartende Ketten, offene OMEN-Aufträge, WARTEND (jede Abgabe der letzten 48 h, deren Inhalt nicht
//         im Ziel steckt, beim Namen; abgelöst mit Grund), Kandidaten (grün, nicht in main, Push in 48 h, ohne Abgabe).
// FRESSER — die größten Zeit- und Token-Fresser, höchstens 8: Hänger (ps -ef, stille Logs, Schleifen ohne Obergrenze, tote
//         Wartende, stille Workflow-Agenten nach stillstand-wache.cjs), Leerlauf (Geräte frei bei bereiten Kandidaten, Zug-Pausen,
//         Warten auf Unmögliches), OMEN übernimmt nicht, Wackler (derselbe rote Schritt in ≥ 3 Zweigen / 24 h), Token
//         (zug/agenten.txt ohne grünes Ergebnis, Budget-Fenster mit ≥ 3 % und 0 neuen Punkten).
// Ein claude.ai-Artifact kann das nicht: seine CSP lässt fetch nur zu eigenen Dateien (25.10. geprüft), darum das Terminal.
// Kosten: EIN Prozess; die API nur mit If-None-Match (304 zählt nicht gegen das Limit), Dateien nur bei neuem SHA über
// raw.githubusercontent.com/<sha>/… (unveränderlich), KURS und PLAN nur jeden LANGSAM_TAKTE-ten Takt, GPU-3D über EIN typeperf
// je Takt, das ruht, solange die Radeon misst. Eine Taste zeichnet aus dem Stand, ohne Abfrage. Nie auf der OMEN.
const { execFile } = require("child_process");
const fs = require("fs");
const os = require("os");
const path = require("path");
const UHR = require("./messplatz-uhr.cjs");

const REPO = "MiguellD/AnazhRealm";
const API = `https://api.github.com/repos/${REPO}`;
const ROH = `https://raw.githubusercontent.com/${REPO}`;
const TOKEN = process.env.TOKEN || "";
const args = process.argv.slice(2);
const KURZ = args.includes("--kurz");
const SELBSTTEST = args.includes("--selbsttest"), EINMAL = args.includes("--einmal") || KURZ || SELBSTTEST;
const TAKT_S = Math.max(60, Number(args[args.indexOf("--takt") + 1]) || 60);
const LANGSAM_TAKTE = 5; // KURS und PLAN ändern sich in Minuten: jeder 5. Takt holt sie
const STILL_MIN = 30; // so lange ohne Zeile, während ein Auftrag läuft, heißt der Blick „still"
const LOG_STILL_H = 2; // ein Log ohne EXIT, das so lange nichts schrieb, läuft nicht mehr (ein Zug braucht ~40 min)
const HAENGER_MIN = 30; // FRESSER: so lange still heißt Hänger (Prozess-Ausgabe, Log, Workflow-Protokoll)
const TEMP_CLAUDE = path.join(process.env.TEMP || os.tmpdir(), "claude"); // Logs des Koordinators und das GPU-Schloss
const CLOUD_H = 6;
// 09.11.: main, zug-a/-b und probe-* zählten als „Cloud-Zweige“; claude/<name> ist der Arbeits-Zwilling einer Cloud-Sitzung (derselbe SHA wie ihr
// benannter Zweig, check.yml lässt ihn aus) — er stand doppelt unter den Abgaben
const CLOUD_AUS = /^(heim-|integ-|zug-|probe-|claude\/)|^(main|koordination|punkte-maschine)$/;
const KANDIDAT_AUS = /^(heim-|integ-|zug-)|^(main|koordination|punkte-maschine)$/;
const SEITE_MAX = 40;
if (/omen/i.test(os.hostname())) {
    console.log("messplatz-blick: nie auf der OMEN — sie misst Zeit-Stationen (Laptop oder Handy)");
    process.exit(2);
}

// ── Abruf: API mit ETag, Dateien je SHA, GraphQL für die Kandidaten ──────────────────────────────────────────────────
const etags = new Map();
const links = new Map(); // URL → Link-Kopf (activity und commits blättern per Cursor)
const zahl = { neu: 0, gleich: 0, rest: "?", limit: "?" };
async function api(p) {
    const url = p.startsWith("http") ? p : API + p;
    const alt = etags.get(url);
    const r = await fetch(url, {
        headers: {
            Accept: "application/vnd.github+json",
            "User-Agent": "messplatz-blick",
            ...(TOKEN ? { Authorization: "Bearer " + TOKEN } : {}),
            ...(alt ? { "If-None-Match": alt.etag } : {}),
        },
    });
    zahl.rest = r.headers.get("x-ratelimit-remaining") ?? zahl.rest;
    zahl.limit = r.headers.get("x-ratelimit-limit") ?? zahl.limit;
    if (r.status === 304 && alt) return zahl.gleich++, alt.body;
    if (!r.ok) throw new Error(`${p.split("?")[0].replace(API, "")}: HTTP ${r.status}`);
    zahl.neu++;
    const body = await r.json();
    const etag = r.headers.get("etag");
    if (etag) etags.set(url, { etag, body });
    links.set(url, r.headers.get("link") || "");
    return body;
}
const weiterVon = (p) => (/<([^>]+)>;\s*rel="next"/.exec(links.get(p.startsWith("http") ? p : API + p) || "") || [])[1];
async function graphql(query, variables) {
    const r = await fetch("https://api.github.com/graphql", {
        method: "POST",
        headers: { Authorization: "Bearer " + TOKEN, "User-Agent": "messplatz-blick" },
        body: JSON.stringify({ query, variables }),
    });
    if (!r.ok) throw new Error("graphql: HTTP " + r.status);
    const j = await r.json();
    if (j.errors) throw new Error("graphql: " + j.errors[0].message);
    zahl.neu++;
    return j.data;
}
const dateien = new Map();
const titel = new Map(); // Commit-Titel je SHA (unveränderlich: einmal geholt)
// DER SPEICHER auf der Platte (--kurz ist je Aufruf ein neuer Prozess; ohne ihn holte jeder die roten Jobs von 24 h neu, 59 s): rot = Run-Id:Versuch
// → rote Jobs (fertige Runs ändern sich nie), stand = Kurzform je stand.json-Commit, ciZug = CI-Minuten je Zug, ziel = je Abgabe-Kopf „drin“ oder {ziel, vor}
const SPEICHER_DATEI = path.join(os.tmpdir(), "messplatz-blick-speicher.json");
const speicher = (() => { try { return JSON.parse(fs.readFileSync(SPEICHER_DATEI, "utf8")); } catch (_e) { return {}; } })();
for (const k of ["rot", "stand", "ciZug", "ziel"]) speicher[k] = speicher[k] || {};
const rotJobs = new Map(Object.entries(speicher.rot)), rotUnterwegs = new Map(); // dieselbe Abfrage aus CI-Takt und Wackler zugleich geht EINMAL hinaus
const sichern = () => { try { speicher.rot = Object.fromEntries([...rotJobs].slice(-600)); fs.writeFileSync(SPEICHER_DATEI, JSON.stringify(speicher)); } catch (_e) { /* nur ein Zwischenspeicher */ } };
const rotSchritte = async (r) => { // die roten Jobs eines Runs mit ihrem roten Schritt, einmal geholt
    const k = r.id + ":" + r.run_attempt;
    if (rotJobs.has(k)) return rotJobs.get(k);
    if (!rotUnterwegs.has(k)) rotUnterwegs.set(k, api(`/actions/runs/${r.id}/jobs?per_page=100`).then((j) => {
        rotJobs.set(k, j.jobs.filter((x) => x.conclusion === "failure").map((x) => ({ name: x.name, schritt: ((x.steps || []).find((s) => s.conclusion === "failure") || {}).name || "?" })));
        return rotJobs.get(k);
    }).finally(() => rotUnterwegs.delete(k)));
    return rotUnterwegs.get(k);
};
async function datei(sha, pfad) {
    const k = sha + ":" + pfad;
    if (dateien.has(k)) return dateien.get(k);
    const r = await fetch(`${ROH}/${sha}/${pfad}`);
    if (!r.ok && r.status !== 404) throw new Error(`${pfad}@${sha.slice(0, 8)}: HTTP ${r.status}`);
    const t = r.ok ? await r.text() : null;
    dateien.set(k, t);
    return t;
}

// ── Schrift: Farben nur für Urteile und gedimmte Zeiten ──────────────────────────────────────────────────────────────
const ANSI = process.stdout.isTTY && !process.env.NO_COLOR && !KURZ; // NO_COLOR, kein TTY oder --kurz: ohne Farbe
const f = (c, s) => (ANSI ? `\x1b[${c}m${s}\x1b[0m` : String(s));
const gruen = (s) => f(32, s), rot = (s) => f(31, s), gelb = (s) => f(33, s), grau = (s) => f(90, s), fett = (s) => f(1, s);
const urteilFarbe = (s) => s.replace(/\bGRÜN\b|\bnicht-langsamer\b/g, gruen).replace(/\bROT\b|\bLANGSAMER\b|\bABBRUCH\b/g, rot);
const urteilWort = (w) => (/^(GRÜN|nicht-langsamer)$/.test(w) ? gruen("✓ " + w) : /^(ROT|LANGSAMER|ABBRUCH)$/.test(w) ? rot("✗ " + w) : gelb(w));
const ampelWert = (x, gut, mittel) => (x == null || !isFinite(x) ? grau : x >= gut ? gruen : x >= mittel ? gelb : rot); // → Färber des Urteils
const sicht = (s) => String(s).replace(/\x1b\[[0-9;]*m/g, "");
const BREITE = 100;
// auf n sichtbare Zeichen kürzen (Farbcodes zählen nicht), … am Schnitt
function kappe(s, n = BREITE) {
    if (sicht(s).length <= n) return s;
    let out = "";
    for (let i = 0, z = 0; i < s.length && z < n - 1; ) {
        const m = /^\x1b\[[0-9;]*m/.exec(s.slice(i, i + 12));
        if (m) { out += m[0]; i += m[0].length; } else { out += s[i++]; z++; }
    }
    return out + "…" + (ANSI ? "\x1b[0m" : "");
}
const spalte = (s, n) => s + " ".repeat(Math.max(0, n - sicht(s).length));
const rechts = (s, n) => " ".repeat(Math.max(0, n - sicht(s).length)) + s;
const linie = (titel) => grau("─── ") + fett(titel) + " " + grau("─".repeat(Math.max(3, BREITE - 5 - sicht(titel).length)));
const balken = (i, n, b = 20) => { const v = Math.max(0, Math.min(b, Math.round((b * i) / Math.max(1, n)))); return KURZ ? `${i}/${n}` : gelb("█".repeat(v)) + grau("░".repeat(b - v)) + ` ${i}/${n}`; };
const mini = (p, b = 5) => { if (p == null) return grau("—"); const v = Math.round((Math.min(100, p) / 100) * b); return (KURZ ? "" : "▮".repeat(v) + grau("▯".repeat(b - v)) + " ") + `${Math.round(p)} %`; };
const pfeil = (a, b) => (a == null || b == null ? " " : a > b + 1e-9 ? "↑" : a < b - 1e-9 ? "↓" : "→");
const zk = (x, d = 1) => (x == null || !isFinite(x) ? "—" : x.toFixed(d).replace(".", ","));
const hhmm = (d) => d.toTimeString().slice(0, 5);
const tag = (d) => `${String(d.getDate()).padStart(2, "0")}.${String(d.getMonth() + 1).padStart(2, "0")}`;
const dauer = (ms) => {
    const m = Math.max(0, Math.round(ms / 60000));
    return m < 60 ? `${m} min` : `${Math.floor(m / 60)} h ${String(m % 60).padStart(2, "0")} min`;
};
const s8 = (s) => String(s || "").slice(0, 8);
const T = { f, gruen, rot, gelb, grau, fett, sicht, spalte, rechts, kappe, linie, BREITE }; // die Farben und Spalten des Blicks für messplatz-uhr.cjs

// ── Lesen: Fortschritt, Warteschlange, Budget, Plan ──────────────────────────────────────────────────────────────────
// eine Fortschritts-Zeile: `<datum> <zeit> <id> <rest>` (Ortszeit des Schreibers; OMEN und Laptop teilen die Zone). Die Sekunden sind
// KANN: die Sitzungs-Zeilen der Geräte tragen `HH:MM` (10.11.: der Blick verlangte `HH:MM:SS`, verlor jede START-Zeile seit dem 10.11. und
// zeigte die GTX 1050 FREI, während sie am Auftrag takt-gc arbeitete)
function zeilenVon(text) {
    return String(text || "").split(/\r?\n/).map((l) => /^(\d{4}-\d\d-\d\d) (\d\d:\d\d(?::\d\d)?) (\S+) (.*)$/.exec(l))
        .filter(Boolean).map((m) => ({ t: new Date(`${m[1]}T${m[2]}`), zeit: m[2], id: m[3], rest: m[4] }));
}
// zug/erledigt.txt in BEIDEN Formen: der Dienst schreibt „<id> …“, die Sweeps einer Geräte-Sitzung „<datum> <zeit> <id> …“ (09.11.: der
// Blick schlüsselte nach dem ersten Wort, also nach dem Datum, und fand seit dem 07.11. keinen Auftrag der OMEN mehr). Eine Zwischenzeile
// („Zwischenstand“, „Scheibe 1/4“) schließt keinen Auftrag. id → der Rest der jüngsten schließenden Zeile
function erledigtVon(text) {
    const je = new Map();
    for (const l of String(text || "").split(/\r?\n/)) {
        if (!l.trim()) continue;
        const m = /^\d{4}-\d\d-\d\d \d\d:\d\d(?::\d\d)? (\S+)\s*(.*)$/.exec(l);
        const [id, rest] = m ? [m[1], m[2]] : [l.split(" ")[0], l.split(" ").slice(1).join(" ")];
        const s = /Scheibe (\d+)\/(\d+)/.exec(rest);
        if (/Zwischen/i.test(rest) || (s && +s[1] < +s[2])) continue;
        je.set(id, rest);
    }
    return je;
}
// DIE AUFTRÄGE AN GERÄTE-SITZUNGEN (09.11.: OMEN und GTX 1050 arbeiten per Remote Control — kein Läufer-Job, keine Stationen-Datei,
// der Blick zeigte beide „frei“, während die OMEN 42 Stationen maß). Der Koordinator schreibt beim Auftrag EINE Zeile nach
// koordination zug/sitzung.txt: `<datum> <zeit> <id> START geraet=<omen|gtx1050|radeon> [sha=<40>] [mess=<gtx|radeon>] [n=<Stationen>] <Text>`.
// Offen ist sie, bis erledigt.txt ihre id schließt (12 h Horizont). Der Fortschritt kommt aus dem Werk selbst, nie aus einem Wort: die
// Mess-Datei messung/<sha8>-<mess>.json auf punkte-maschine (Stationen je + ungemessen, Zeit ihres jüngsten Pushs)
function sitzungenVon(text, erledigtJe, jetzt) {
    const out = [];
    for (const z of zeilenVon(text)) {
        if (!/^START /.test(z.rest) || jetzt - z.t > 12 * 3600e3 || erledigtJe.has(z.id)) continue;
        const kv = Object.fromEntries([...z.rest.matchAll(/(\w+)=(\S+)/g)].map((m) => [m[1], m[2]]));
        const i = out.findIndex((x) => x.id === z.id);
        const e = { id: z.id, t: z.t, geraet: kv.geraet || "?", sha: kv.sha || null, mess: kv.mess || null, n: kv.n ? Number(kv.n) : null, text: z.rest.replace(/^START /, "").replace(/\w+=\S+\s*/g, "").trim() };
        if (i >= 0) out[i] = e; else out.push(e);
    }
    return out;
}
// die Werkstücke der Sitzungen: je Mess-Datei der jüngste Commit (ETag) und ihr Inhalt je Commit (unveränderlich)
const messStand = new Map(); // commit-sha → { gemessen, ungemessen }
async function sitzungFortschritt(s, versuch) {
    if (!s.sha || !s.mess || !TOKEN) return s;
    const pfad = `meisterkarte-quelle/punkte/messung/${s8(s.sha)}-${s.mess}.json`;
    const c = await versuch("Mess-Datei " + s.id, () => api(`/commits?sha=punkte-maschine&path=${pfad}&per_page=1`));
    if (!c || !c.length) return { ...s, datei: null };
    const k = c[0].sha;
    if (!messStand.has(k)) {
        const roh = await versuch("Mess-Inhalt " + s.id, () => fetch(`${ROH}/${k}/${pfad}`).then((r) => (r.ok ? r.json() : null)));
        if (roh) messStand.set(k, { gemessen: Object.keys(roh.je || {}).length, ungemessen: Object.keys(roh.ungemessen || {}).length });
    }
    return { ...s, datei: { t: new Date(c[0].commit.committer.date), ...(messStand.get(k) || {}) } };
}
const sitzungKurz = (s) => `${s.id}${s.datei && s.datei.gemessen != null ? ` ${s.datei.gemessen}${s.n ? "/" + s.n : ""} gemessen` : ""}`;
// die Warteschlange wie der Dienst: offen = nicht erledigt, nicht storniert; prio 1 vor 2 vor 3, sonst Datei-Reihenfolge
function offeneAuftraege(schlange, erledigt) {
    const fertigIds = new Set(erledigtVon(erledigt).keys());
    const storno = new Set();
    const alle = [];
    String(schlange || "").split(/\r?\n/).forEach((l, i) => {
        if (!l.trim() || l.trim().startsWith("#")) return;
        const [id, prio, art, ...kv] = l.trim().split(/\s+/);
        if (prio === "0" && art === "storno") return void storno.add(id);
        alle.push({ id, prio: Number(prio), art, kv: Object.fromEntries(kv.map((x) => x.split("=")).map(([k, ...v]) => [k, v.join("=")])), i });
    });
    const gesehen = new Set();
    return alle.filter((a) => !fertigIds.has(a.id) && !storno.has(a.id) && !gesehen.has(a.id) && gesehen.add(a.id))
        .sort((a, b) => a.prio - b.prio || a.i - b.i);
}
function auftragKurz(a) {
    const k = a.kv;
    if (a.art === "abab") return `A ${s8(k.A)} → B ${s8(k.B)} · ${k.zellen || ""}`;
    if (a.art === "punkte") return `${s8(k.sha)} ${k.geraet || ""}${k.nur ? " nur " + k.nur : ""}`;
    return `${s8(k.sha)}${k.lauf ? " " + k.lauf : ""}`;
}
// zug/budget.txt: `<YYYY-MM-DDTHH:MM> woche=<%> karte=<Pkt>`, beide Werte frei; aufsteigend nach Zeit. `konto=neu` (Wechsel des
// Kontos, 25.10. 20:55: 98 → 0) legt den Stand des alten Kontos darunter: `woche` ist der verbrauchte Anteil SEIT Wochen-Start über
// alle Konten (Kurve und Punkte je % laufen durch), `roh` und `konto` der Stand des laufenden Kontos (die 98-%-Grenze gilt ihm).
function budgetVon(text) {
    const zeilen = String(text || "").split(/\r?\n/).map((l) => /^(\d{4}-\d\d-\d\dT\d\d:\d\d)\s+(.*)$/.exec(l.trim())).filter(Boolean).map((m) => {
        const kv = Object.fromEntries(m[2].split("(")[0].trim().split(/\s+/).map((x) => x.split("="))); // die Notiz in (…) trägt keine Werte
        return { t: new Date(m[1]), roh: kv.woche != null ? Number(kv.woche) : null, karte: kv.karte != null ? Number(kv.karte) : null, neu: kv.konto === "neu", notiz: (/\((.*)\)\s*$/.exec(m[2]) || [])[1] || "" };
    }).sort((a, b) => a.t - b.t);
    let unter = 0, letzte = 0, konto = 1;
    for (const z of zeilen) {
        // ein Abfall des Wochen-Werts IST ein Konto- oder Wochen-Wechsel, auch ohne `konto=neu` (27.10. 23:10: die Marke fehlte, KURS
        // zeigte zwei Tage „98 %“ und eine negative Brenn-Rate)
        if (z.neu || (z.roh != null && z.roh < letzte)) { unter += letzte; letzte = 0; konto++; }
        if (z.roh != null) letzte = z.roh;
        z.konto = konto;
        z.woche = z.roh != null ? z.roh + unter : null;
    }
    return zeilen;
}
// der letzte bekannte Wert zum Zeitpunkt t (Stufen-Funktion); vor dem ersten der erste
function wertAm(b, k, t) {
    let v = null;
    for (const x of b) { if (x[k] == null) continue; if (x.t > t && v != null) break; v = x[k]; if (x.t > t) break; }
    return v;
}
// Brenn-Rate %/h aus den letzten vier Wochen-Werten
function brenn(b) {
    const w = b.filter((x) => x.woche != null).slice(-4);
    if (w.length < 2) return null;
    const h = (w[w.length - 1].t - w[0].t) / 3600e3;
    return h > 0 ? { rate: (w[w.length - 1].woche - w[0].woche) / h, letzte: w[w.length - 1] } : null;
}
const SPARK = "▁▂▃▄▅▆▇█";
function spark(b, k, t0, t1, w, lo, hi) {
    let s = "";
    for (let i = 0; i < w; i++) {
        const t = new Date(+t0 + ((i + 1) / w) * (t1 - t0));
        const v = b.some((x) => x[k] != null && x.t <= t) ? wertAm(b, k, t) : null;
        s += v == null ? " " : SPARK[Math.max(0, Math.min(7, Math.round(((v - lo) / Math.max(1e-9, hi - lo)) * 7)))];
    }
    return s;
}
function achse(t0, t1, w) {
    const a = Array(w).fill(" ");
    const setze = (c, txt) => { if (c < 0 || c + txt.length > w || a.slice(Math.max(0, c - 1), c + txt.length + 1).some((x) => x !== " ")) return; [...txt].forEach((x, j) => (a[c + j] = x)); };
    setze(0, tag(t0));
    for (let d = new Date(t0.getFullYear(), t0.getMonth(), t0.getDate() + 1); d < t1; d = new Date(d.getFullYear(), d.getMonth(), d.getDate() + 1))
        setze(Math.floor(((d - t0) / (t1 - t0)) * w), "|" + tag(d));
    return a.join("");
}
// zug/plan.txt: Spalten durch ≥ 2 Leerzeichen — Zustand · Was · Detail · Wer/Wo · Ziel
const planVon = (text) => String(text || "").split(/\r?\n/).filter((l) => l.trim() && !l.startsWith("#"))
    .map((l) => { const [zustand, was, detail, wer, ziel] = l.trim().split(/\s{2,}/); return { zustand, was: was || "", detail: detail || "", wer: wer || "", ziel: ziel || "" }; });

// ── Last dieses Rechners ─────────────────────────────────────────────────────────────────────────────────────────────
const cpuStand = () => os.cpus().reduce((s, c) => { for (const [k, v] of Object.entries(c.times)) { s.ganz += v; if (k === "idle") s.ruhe += v; } return s; }, { ganz: 0, ruhe: 0 });
let cpuAlt = cpuStand();
function cpuProzent() {
    const neu = cpuStand();
    const d = neu.ganz - cpuAlt.ganz;
    const p = d > 0 ? 100 * (1 - (neu.ruhe - cpuAlt.ruhe) / d) : null;
    cpuAlt = neu;
    return p;
}
// GPU-3D-Last: Summe aller 3D-Engine-Instanzen (je Prozess) aus EINER typeperf-Probe, gedeckelt auf 100
function gpu3d() {
    return new Promise((ok) => execFile("typeperf", ["\\GPU Engine(*engtype_3D)\\Utilization Percentage", "-sc", "1"], { timeout: 8000, windowsHide: true }, (e, out) => {
        const z = String(out || "").split(/\r?\n/).find((l) => /^"\d/.test(l));
        if (e && !z) return ok(null);
        ok(z ? Math.min(100, z.split('","').slice(1).reduce((s, v) => s + (parseFloat(v.replace(/"/g, "")) || 0), 0)) : null);
    }));
}

// DIE WERKBÄNKE DER ARBEITER (31.10., der Schöpfer: „Radeon frei, obwohl Port 4635 darauf arbeitet“): das GPU-Schloss hält nur je
// Lauf (≤ 2 min), die Welten der Arbeiter stehen dazwischen offen und rendern auf der Radeon — jeder Hörer im Band 4400–4689 (4690–4699
// gehört dem echt-Job) beim Port, seit wann, und beim Namen seines Bands aus $TEMP/claude/w3/port-baender.txt („<von>-<bis> <name>“, der
// Koordinator trägt jedes Band beim Brief ein); ein Port ohne Band heißt „?“
function werkbankHoerer() {
    return new Promise((ok) => execFile("powershell", ["-NoProfile", "-Command",
        "Get-NetTCPConnection -State Listen -ErrorAction SilentlyContinue | Where-Object { $_.LocalPort -ge 4400 -and $_.LocalPort -le 4689 } | " +
        "Sort-Object LocalPort -Unique | ForEach-Object { $p = Get-CimInstance Win32_Process -Filter \"ProcessId=$($_.OwningProcess)\" -ErrorAction SilentlyContinue; " +
        "'{0} {1} {2} {3}' -f $_.LocalPort, $_.OwningProcess, $(if ($p) { $p.CreationDate.ToString('HH:mm') } else { '?' }), $(if ($p -and $p.CommandLine -match 'werkbank') { 'werkbank' } else { 'seite' }) }"],
    { timeout: 15000, windowsHide: true }, (e, out) => {
        let baender = [];
        try { baender = fs.readFileSync(path.join(TEMP_CLAUDE, "w3", "port-baender.txt"), "utf8").split(/\r?\n/).map((l) => /^(\d+)-(\d+)\s+(\S+)/.exec(l)).filter(Boolean).map((m) => [+m[1], +m[2], m[3]]); } catch (_e) { /* ohne Bänder heißt jeder Port „?“ */ }
        const name = (p) => (baender.find(([v, b]) => p >= v && p <= b) || [0, 0, "?"])[2];
        ok(String(out || "").split(/\r?\n/).map((l) => l.trim().split(" ")).filter((x) => x.length === 4 && /^\d+$/.test(x[0]))
            .map(([port, pid, seit, art]) => ({ port: +port, pid: +pid, seit, art, name: name(+port) })));
    }));
}

// ── Koordinator: Logs in $TEMP/claude, EXIT= heißt beendet ───────────────────────────────────────────────────────────
const logText = (n, dir = TEMP_CLAUDE) => { const p = path.join(dir, n), st = fs.statSync(p); return { st, t: st.size > 1 << 20 ? "" : fs.readFileSync(p, "utf8") }; };
// je Log { name, t, exit (null = läuft), letzte }; null, wenn der Ordner fehlt (nicht der Laptop)
// LEBT der Zug? Ein Log ohne Urteil „läuft“ nur, solange ein Prozess der Kette seine Id trägt (09.11.: z350 hieß nach seinem Abbruch
// 25 min „läuft“ — die 2-h-Uhr urteilte über die Zeit, nie über den Prozess). null = keine ps-Liste (dann die Uhr wie bisher)
let letztePs = null;
function zugLebt(name, ps = letztePs) {
    if (!ps) return null;
    const id = name.replace(/-.*$/, "").replace(/w$/, "");
    if (!/^z\d+$/.test(id)) return null;
    const re = new RegExp(`(fahre|zug-sammler\\d*|zug-weiter\\d*|zug-schlange\\d*)\\.sh\\b.*(\\s|:)${id}(w|:|\\s|$)`);
    return ps.some((p) => re.test(p.cmd + " "));
}
const ENDE_ZUG = /\] (GELANDET |FAHRT ROT|ABGEBROCHEN)/;
function koordinatorLogs(ps) {
    let namen;
    try { namen = fs.readdirSync(TEMP_CLAUDE).filter((n) => /^(fahre-.*|takt.*)\.log$/.test(n)); } catch (_e) { return null; }
    // ein Zug, der noch SAMMELT (zug-sammler wartet auf die CI seiner Zweige, Statik, Vorzug), hat noch kein fahre-Log: er steht als eigene
    // Zeile oben (09.11.: z350 sammelte 10 min unsichtbar, oben stand der abgebrochene Vorgänger)
    const sammelt = [...new Set((ps || []).map((p) => (/zug-sammler\d*\.sh (z\d+)\b/.exec(p.cmd) || [])[1]).filter(Boolean))]
        .filter((id) => !namen.includes(`fahre-${id}.log`)).map((id) => {
            let z = ""; try { z = fs.readFileSync(path.join(TEMP_CLAUDE, "w3", `kette-${id}.out`), "utf8").trim().split(/\r?\n/).pop() || ""; } catch (_e) { /* noch nichts */ }
            return { name: id, t: new Date(), exit: null, tot: false, still: false, letzte: "sammelt · " + (z.replace(/^\d\d:\d\d\s+/, "") || "wartet auf die CI der Zweige") };
        });
    return sammelt.concat(namen.map((n) => ({ n, ...logText(n) })).sort((a, b) => b.st.mtimeMs - a.st.mtimeMs).slice(0, 4).map(({ n, st, t }) => {
        const ex = [...t.matchAll(/EXIT=(\d+)/g)].pop();
        const letzte = t.split(/\r?\n/).filter((l) => l.trim() && !/^EXIT=/.test(l)).pop() || "";
        // ein Zug-Log endet mit seinem Urteil, nie mit EXIT= (31.10.: z104/z105 hießen nach FAHRT ROT bzw. GELANDET weiter „läuft“);
        // ABGEBROCHEN schreibt der Koordinator, wenn er einen Zug anhält (09.11. z350)
        const urteil = /\] GELANDET /.test(letzte) ? 0 : /\] FAHRT ROT/.test(letzte) ? 1 : /\] ABGEBROCHEN/.test(letzte) ? 2 : null;
        const exit = ex ? Number(ex[1]) : urteil;
        const name = n.replace(/\.log$/, "").replace(/^fahre-/, ""), lebt = exit == null ? zugLebt(name, ps) : null;
        return { name, t: st.mtime, exit, tot: lebt === false, still: exit == null && (lebt === false || (lebt == null && Date.now() - st.mtime > LOG_STILL_H * 3600e3)), letzte: letzte.replace(/^\d\d:\d\d:\d\d\s+/, "") };
    })).slice(0, 4);
}
// je Zug-Log (fahre-*.log): Start („bau gegen“, sonst die erste Uhrzeit), GELANDET, ROT vor der Landung, Dauer in min. Die Logs
// tragen nur Uhrzeiten: der Tag kommt aus dem Datei-Datum, über Mitternacht zählt +24 h; für die Tafel Kandidat, drin-Zweige, Landung, FAHRT ROT
function zugLaeufe(jetzt, dir = TEMP_CLAUDE) {
    let namen;
    try { namen = fs.readdirSync(dir).filter((n) => /^fahre-.*\.log$/.test(n)); } catch (_e) { return null; }
    const sek = (l) => { const m = /^(\d\d):(\d\d):(\d\d) /.exec(l || ""); return m ? +m[1] * 3600 + +m[2] * 60 + +m[3] : null; };
    return namen.map((n) => {
        const { st, t } = logText(n, dir);
        const z = t.split(/\r?\n/);
        const iBau = z.findIndex((l) => /\] bau gegen/.test(l));
        const iStart = iBau >= 0 ? iBau : z.findIndex((l) => sek(l) != null);
        const iLand = z.findIndex((l) => /GELANDET/.test(l));
        const iRot = z.findIndex((l) => /ROT urteil|\] FAHRT ROT|\] ABGEBROCHEN/.test(l)); // 09.11.: das Urteil der Nachwache (zNNNw) heißt „FAHRT ROT (…)“, ohne „urteil“
        const ex = [...t.matchAll(/EXIT=(\d+)/g)].pop();
        const s0 = iStart >= 0 ? sek(z[iStart]) : null;
        // die Uhrzeit einer Zeile am Tag des Datei-Datums (Stunden-Felder, nie Mitternacht + Sekunden: am 25.10. hatte der Tag 25 h)
        const m = st.mtime, amTag = (l) => { const s = sek(l); if (s == null) return null; const d = new Date(m.getFullYear(), m.getMonth(), m.getDate(), Math.floor(s / 3600), Math.floor(s / 60) % 60, s % 60); if (d - m > 60000) d.setDate(d.getDate() - 1); return d; };
        // läuft = weder EXIT noch GELANDET noch FAHRT ROT (ein Zug-Log endet mit seinem Urteil, wie in koordinatorLogs; 08.11.: z323 hieß nach FAHRT
        // ROT 81 min „läuft“) und das Log schrieb in den letzten LOG_STILL_H Stunden (ältere fahre.sh schrieben kein EXIT)
        const lebt = zugLebt(n.replace(/^fahre-|\.log$/g, "")); // der Prozess entscheidet, die Uhr nur ohne ps-Liste
        const laeuft = !ex && iLand < 0 && !/\] (FAHRT ROT|ABGEBROCHEN)/.test(t) && (lebt == null ? jetzt - st.mtime < LOG_STILL_H * 3600e3 : lebt);
        const sEnde = iLand >= 0 ? sek(z[iLand]) : !laeuft ? sek([...z].reverse().find((l) => sek(l) != null)) : null;
        const start = iStart >= 0 ? amTag(z[iStart]) : null;
        const min = s0 == null ? null : sEnde != null ? ((sEnde - s0 + 86400) % 86400) / 60 : (jetzt - start) / 60000;
        const letzte = z.filter((l) => l.trim() && !/^EXIT=/.test(l)).pop() || "";
        return { name: n.replace(/^fahre-|\.log$/g, ""), nr: (/^fahre-z(\d+)/.exec(n) || [])[1], t: st.mtime, start, min, laeuft, letzte, exit: ex ? Number(ex[1]) : null, gelandet: iLand >= 0, rot: iRot >= 0 && (iLand < 0 || iRot < iLand),
            bau: iBau >= 0, kand: (/Kandidat ([0-9a-f]{40})/.exec(t) || [])[1] || null, drin: [...t.matchAll(/^\s*drin (\S+?)@(\w+)/gm)].map((x) => ({ z: x[1], sha: x[2] })),
            land: iLand >= 0 ? amTag(z[iLand]) : null, rotT: amTag([...z].reverse().find((l) => /\] FAHRT ROT/.test(l))) };
    }).sort((a, b) => b.t - a.t);
}

// ── Messplatz und Ampel ──────────────────────────────────────────────────────────────────────────────────────────────
// ein Messplatz aus seiner Fortschritts-Datei; fertig(id, letzte) → Abschluss-Text oder null (läuft)
function messplatz(text, fertig, jetzt) {
    const z = zeilenVon(text);
    if (!z.length) return null;
    const letzte = z[z.length - 1];
    const meine = z.filter((x) => x.id === letzte.id);
    const start = [...meine].reverse().find((x) => /^START /.test(x.rest));
    const stationen = meine.map((x) => [x, /^(\S+) (\S+) ([\d.]+) · (\d+)\/(\d+)/.exec(x.rest)]).filter(([, m]) => m)
        .map(([x, m]) => ({ t: x.t, zeit: x.zeit.slice(0, 5), station: m[1], wort: m[2], min: Number(m[3]), i: Number(m[4]), n: Number(m[5]) }));
    const stand = stationen[stationen.length - 1];
    const alter = jetzt - letzte.t;
    // eine Zeile älter als 6 h ohne ENDE ist Geschichte, kein laufender Auftrag (08.11.: die OMEN stand 3 Tage „still“ an omen-speicher)
    const zu = fertig(letzte.id, letzte) || (alter > 6 * 3600e3 ? `alt (${letzte.t.toLocaleDateString("de-DE")})` : null);
    // Ende ≈ aus der mittleren Stationsdauer seit START (Schloss-Warten und Vorfahrt eingerechnet)
    const eta = !zu && start && stand && stand.i > 0 && stand.n > stand.i ? new Date(+stand.t + ((stand.n - stand.i) * (stand.t - start.t)) / stand.i) : null;
    return { id: letzte.id, letzte, start, stationen, stand, zu, alter, eta, still: !zu && alter > STILL_MIN * 60000 };
}
// Durchsatz eines Messplatzes: Stationen je Stunde und mittlere Dauer über die letzten 12 Stations-Zeilen; älter als 6 h ist Geschichte
function durchsatz(text, jetzt) {
    const st = zeilenVon(text).map((x) => [x, /^(\S+) (GRÜN|ROT) ([\d.]+) · \d+\/\d+/.exec(x.rest)]).filter(([, m]) => m).slice(-12);
    if (st.length < 3 || jetzt - st[st.length - 1][0].t > 6 * 3600e3) return null;
    const h = (st[st.length - 1][0].t - st[0][0].t) / 3600e3;
    return { proH: h > 0 ? (st.length - 1) / h : null, mittel: st.reduce((s, [, m]) => s + Number(m[3]), 0) / st.length, n: st.length };
}
const kurzId = (id) => id.replace(/-(gtx|radeon|headless)$/, "");
// die Ampel eines Geräts: rot = offline oder still, gelb = misst oder trägt einen Job, grün = frei
function geraetAmpel(name, mp, l, job, belegt, arbeit) {
    if (l && l.status !== "online") return `${rot("●")} ${name} offline`;
    if (mp && mp.still) return `${rot("●")} ${name} still ${dauer(mp.alter)}`;
    if (mp && !mp.zu) return `${gelb("●")} ${name} misst ${kurzId(mp.id)}${mp.stand ? ` ${mp.stand.i}/${mp.stand.n}` : ""}${mp.eta ? ` · Ende ≈ ${hhmm(mp.eta)}` : ""}`;
    if (job) return `${gelb("●")} ${name} ${job.job.name.split(" ")[0]}-Job${arbeit ? ` · ${arbeit}` : ""}`;
    if (arbeit && /^BLIND/.test(arbeit)) return `${rot("●")} ${name} ${arbeit}`; // ohne Puls nie „frei“ (messplatz-uhr pulsUrteil)
    if (arbeit) return `${gelb("●")} ${name} ${arbeit}`;
    if (belegt) return `${gelb("●")} ${name} GPU belegt`;
    return `${gruen("●")} ${name} frei`;
}
// die Arbeit der Arbeiter auf der Radeon neben den Stationen: das GPU-Schloss (Halter, seit) und jede offene Welt beim Namen ihres Bands
function weltenJe(S) {
    const je = new Map();
    for (const w of S.werkbaenke || []) {
        const e = je.get(w.name) || { ports: [], seit: w.seit };
        e.ports.push(w.port);
        if (w.seit < e.seit) e.seit = w.seit;
        je.set(w.name, e);
    }
    return je;
}
function arbeitRadeon(S) {
    const je = weltenJe(S);
    // das Schloss nennt die Uhr (der Puls des Schlosses, uhrHalter) — hier nur die offenen Welten
    return je.size ? `${je.size} ${je.size > 1 ? "Welten" : "Welt"} offen (${[...je.keys()].join(", ")})` : null;
}
function werkbankZeilen(S) {
    const out = [];
    const h = S.uhr && (S.uhr.geraete.find((g) => g.name === "RADEON") || {}).halter; // das Schloss nennt sein Puls (messplatz-uhr), nie ein zweiter Leser
    if (h) out.push(`  ${gelb("●")} GPU-Schloss: ${UHR.belegtText(h, Math.floor(+S.jetzt / 1000))}`);
    for (const [n, e] of weltenJe(S)) out.push(`  ${gelb("●")} Welt offen: ${spalte(n, 14)} ${grau(`:${e.ports.join(" :")} · seit ${e.seit}`)}`);
    if (!out.length) out.push(`  ${grau("keine Welt offen · GPU-Schloss frei")}`);
    return out;
}
// der Abschnitt eines Messplatzes: Zustand mit Balken, die letzten vier Stationen in festen Spalten, Läufer nur wenn er etwas trägt
function messplatzZeilen(mp, l, job, verlauf, lokal) {
    const out = [];
    for (const p of lokal || []) out.push(`  ${gelb("●")} misst ${s8(p.sha)} ${p.geraet} ${grau(`(punkte.cjs run${p.offen ? " --offen" : ""}, seit ${hhmm(p.start)})`)}`);
    if (!mp) out.push(`  ${grau("noch keine Zeile")}`);
    // ein Stand von einem früheren Tag trägt sein Datum (09.11.: „zuletzt 25374f6f-radeon (06:12)“ war der 06.11.)
    else if (mp.zu) out.push(`  ${grau("●")} Stationen-Datei: zuletzt ${mp.id}: ${urteilFarbe(mp.zu)} ${grau(`(${mp.letzte.t.toDateString() === new Date().toDateString() ? "" : tag(mp.letzte.t) + ". "}${mp.letzte.zeit.slice(0, 5)})`)}`);
    else {
        out.push(`  ${mp.still ? rot("●") : gelb("●")} ${spalte(mp.id, 14)} ${mp.stand ? balken(mp.stand.i, mp.stand.n) : ""}${mp.start ? grau(` · seit ${mp.start.zeit.slice(0, 5)}`) : ""}${mp.eta ? ` · Ende ≈ ${fett(hhmm(mp.eta))}` : ""}`);
        out.push(`  ${grau(`nächste Station seit ${mp.letzte.zeit.slice(0, 5)} (${dauer(mp.alter)})`)}${mp.still ? rot(" — still") : ""}`);
        if (!/^(START|ENDE) |^\S+ \S+ [\d.]+ · \d+\/\d+/.test(mp.letzte.rest)) out.push(`  ${grau(mp.letzte.zeit.slice(0, 5))}  ${gelb(mp.letzte.rest)}`);
        const vier = mp.stationen.slice(-4).reverse();
        const breit = Math.max(0, ...vier.map((s) => sicht(urteilWort(s.wort)).length)); // Urteil-Spalte so breit wie ihr längstes Wort
        for (const s of vier) out.push(`  ${grau(s.zeit)}  ${spalte(s.station, 20)} ${spalte(urteilWort(s.wort), breit)} ${grau(rechts(zk(s.min), 5) + " min")}`);
    }
    if (job) out.push(`  ${gelb("↳")} Läufer ${job.job.runner_name} trägt ${job.run.name.split(" ")[0]}/${job.job.name.replace(/ \(.*$/, "")} ${grau(`(${job.run.head_branch} ${s8(job.run.head_sha)}, seit ${hhmm(new Date(job.job.started_at))})`)}`);
    else if (l && l.status !== "online") out.push(`  ${rot("●")} Läufer ${l.name} ${l.status}`);
    // die Aufträge des Läufers aus der API (echt, GPU-Probe, Farm): zuletzt und davor, jüngster oben
    (verlauf || []).slice(0, 4).forEach((v, i) =>
        out.push(`  ${grau(i ? "davor  " : "zuletzt")} ${grau(hhmm(v.ende))}  ${spalte(`${v.lauf}/${v.name}`.replace(/^GPU-Probe\/probe$/, "GPU-Probe").replace(/^Code-Check\//, ""), 18)} ${spalte(`${v.zweig} ${s8(v.sha)}`, 34)} ${urteilFarbe(v.wort === "success" ? "GRÜN" : v.wort === "failure" ? "ROT" : v.wort)} ${grau(rechts(zk((v.ende - v.start) / 60000), 5) + " min")}`));
    return out;
}

// ── Kandidaten: Zweige mit grünem Kopf, Commits außerhalb von main, Kopf jünger als 48 h ────────────────────────────────
// GraphQL liest Kopf, Datum und Check-Zustand aller Zweige (678 am 25.10., 7 Seiten); verglichen mit main wird nur, wer grün und
// jung ist (der Vergleich in GraphQL kostete je Seite 3 statt 1,8 s), per REST-compare, zwischengespeichert je main- und Kopf-SHA
const vergleich = new Map(); // `${main}:${kopf}` → Commits des Zweigs, die main fehlen
// DIE ZWEIGE, EIN Abruf je langsamem Takt: aus ihnen die Kandidaten UND die Abgaben (abgabenAusRefs) für WARTEND und den STAU der Uhr
async function zweigeAlle() {
    const Q = `query($nach:String){repository(owner:"MiguellD",name:"AnazhRealm"){refs(refPrefix:"refs/heads/",first:100,after:$nach){pageInfo{hasNextPage endCursor} nodes{name target{... on Commit{oid committedDate messageHeadline statusCheckRollup{state}}}}}}}`;
    const alle = [];
    for (let s = 0, nach = null; s < 12; s++) {
        const r = (await graphql(Q, { nach })).repository.refs;
        alle.push(...r.nodes);
        if (!r.pageInfo.hasNextPage) break;
        nach = r.pageInfo.endCursor;
    }
    return alle;
}
// DIE ABGABEN AUS DEN KÖPFEN (10.11., Uhr): jeder Zweig, dessen Kopf-Betreff „Abgabe …“ ist, Kopf ≤ 48 h — die EINE Liste für WARTEND und den STAU.
// Bis hier las WARTEND w3/abgabe.log (gespeist aus den Pushes der letzten 6 h, solange der Blick lief): w26-ferne-ton und w26-laub-kante standen als
// „grün ohne Abgabe“ unter KANDIDATEN, ihr Kopf IST eine Abgabe. Ein WIP-Kopf nach der Abgabe wartet nicht (zug-nie-leer nimmt nur Abgabe-Köpfe)
function abgabenAusRefs(alle, jetzt) {
    const je = new Map();
    for (const n of alle || []) {
        const c = n.target;
        if (!c || !c.oid || CLOUD_AUS.test(n.name) || !/^Abgabe /.test(c.messageHeadline || "") || jetzt - new Date(c.committedDate) > 2 * 864e5 || je.has(c.oid)) continue;
        je.set(c.oid, { t: new Date(c.committedDate), zweig: n.name, sha: c.oid, titel: c.messageHeadline.replace(/^Abgabe [^:]+:\s*/, "") });
    }
    return [...je.values()].sort((a, b) => b.t - a.t);
}
async function kandidaten(jetzt, main, alle) {
    const grenze = +jetzt - 48 * 3600e3;
    const je = new Map(); // je Kopf-SHA EIN Zweig: der claude/*-Spiegel tritt hinter den Namen zurück
    for (const n of alle.filter((n) => n.target && n.target.committedDate && new Date(n.target.committedDate) >= grenze && !KANDIDAT_AUS.test(n.name) &&
        n.target.statusCheckRollup && n.target.statusCheckRollup.state === "SUCCESS").sort((a, b) => a.name.startsWith("claude/") - b.name.startsWith("claude/")))
        if (!je.has(n.target.oid)) je.set(n.target.oid, n);
    // compare main...<zweig>: ahead_by = Commits des Zweigs, die main fehlen; Seite 2 zu je 1 Commit trägt keine Datei-Liste
    await Promise.all([...je.values()].map(async (n) => {
        const k = `${main}:${n.target.oid}`;
        if (!vergleich.has(k)) vergleich.set(k, (await api(`/compare/${main}...${n.target.oid}?per_page=1&page=2`)).ahead_by);
    }));
    return [...je.values()].filter((n) => vergleich.get(`${main}:${n.target.oid}`) > 0).sort((a, b) => new Date(b.target.committedDate) - new Date(a.target.committedDate))
        .map((n) => ({ z: n.name, sha: n.target.oid, t: new Date(n.target.committedDate), vor: vergleich.get(`${main}:${n.target.oid}`), titel: n.target.messageHeadline }));
}

// ── Fresser-Quellen ──────────────────────────────────────────────────────────────────────────────────────────────────
// die Git-Bash-Prozesse des Laptops (ps -ef zeigt die volle Befehlszeile); STIME ist eine Uhrzeit (heute) oder „Mon TT“. PLATTFORMFEST
// (07.11. 20:30: aus PowerShell gestartet fand der Blick kein `ps`, der Zug hieß „steht“, während z300 fuhr): das ps.exe der Git-Installation
const PS_EXE = (() => { try { const p = path.resolve(require("child_process").execFileSync("git", ["--exec-path"], { encoding: "utf8", windowsHide: true }).trim(), "../../../usr/bin/ps.exe"); return fs.existsSync(p) ? p : "ps"; } catch (_e) { return "ps"; } })();
function psListe() {
    return new Promise((ok) => execFile(PS_EXE, ["-ef"], { timeout: 8000, windowsHide: true, maxBuffer: 1 << 22 }, (e, out) => {
        if (e && !out) return ok(null);
        const j = new Date();
        ok(String(out).split(/\r?\n/).slice(1).map((l) => /^\s*(\S+)\s+(\d+)\s+(\d+)\s+(\S+)\s+(\d\d:\d\d:\d\d|[A-Z][a-z]{2}\s+\d{1,2})\s+(.*)$/.exec(l)).filter(Boolean).map((m) => {
            let start;
            if (m[5].includes(":")) { const [h, mi, s] = m[5].split(":").map(Number); start = new Date(j.getFullYear(), j.getMonth(), j.getDate(), h, mi, s); if (start > j) start.setDate(start.getDate() - 1); }
            else { start = new Date(`${m[5]} ${j.getFullYear()}`); if (start > j) start.setFullYear(start.getFullYear() - 1); }
            return { pid: Number(m[2]), ppid: Number(m[3]), start, cmd: m[6].trim() };
        }));
    }));
}
// stille Workflow-Agenten: das Kriterium von stillstand-wache.cjs (EINE Quelle) über die Workflows der letzten 24 h
function workflowStill(jetzt) {
    let still;
    try { ({ stillstehende: still } = require("./stillstand-wache.cjs")); } catch (_e) { return null; }
    const wurzel = path.join(os.homedir(), ".claude", "projects");
    const dirs = [];
    try {
        for (const p of fs.readdirSync(wurzel).filter((n) => /AnazhRealm/.test(n)))
            for (const s of fs.readdirSync(path.join(wurzel, p))) {
                const w = path.join(wurzel, p, s, "subagents", "workflows");
                if (!fs.existsSync(w)) continue;
                for (const d of fs.readdirSync(w)) { try { if (jetzt - fs.statSync(path.join(w, d, "journal.jsonl")).mtime < 864e5) dirs.push(path.join(w, d)); } catch (_e) { /* ohne Journal */ } }
            }
    } catch (_e) { return null; }
    return still(dirs, HAENGER_MIN, +jetzt);
}
// wann kam jede Zeile einer koordination-Datei: GraphQL-blame am SHA → [{a, e, t}] (Zeilen 1-basiert)
async function blameVon(sha, pfad) {
    const Q = `query($x:String!,$p:String!){repository(owner:"MiguellD",name:"AnazhRealm"){object(expression:$x){... on Commit{blame(path:$p){ranges{startingLine endingLine commit{committedDate}}}}}}}`;
    const d = await graphql(Q, { x: sha, p: pfad });
    return d.repository.object.blame.ranges.map((r) => ({ a: r.startingLine, e: r.endingLine, t: new Date(r.commit.committedDate) }));
}
// Wackler: derselbe rote Schritt desselben Jobs in ≥ 3 Zweigen binnen 24 h (der Job „kopf“ fällt mit Absicht, wenn ein anderer Lauf
// den Kopf schon trägt — er zählt nicht). Die Run-Liste hängt an der vollen Stunde (stabile URL, ETag), die roten Jobs je Run einmal
async function wacklerSuche(jetzt) {
    const ab = new Date(+jetzt - 864e5);
    ab.setMinutes(0, 0, 0);
    const r = await api(`/actions/runs?status=failure&per_page=100&created=%3E%3D${ab.toISOString().slice(0, 19)}Z`);
    const je = new Map();
    const runs = r.workflow_runs || [];
    await Promise.all(runs.map(rotSchritte));
    for (const run of runs) {
        for (const x of await rotSchritte(run)) {
            if (x.name === "kopf") continue;
            const k = `${x.name.replace(/ (cpu|gpu)$/, "")} · ${x.schritt.replace(/\s*\(.*$/, "")}`; // der Schritt ohne seine Klammer-Erklärung
            if (!je.has(k)) je.set(k, { k, zweige: new Set(), erst: new Date(run.created_at), zuletzt: new Date(run.created_at) });
            const g = je.get(k);
            g.zweige.add(run.head_branch);
            const t = new Date(run.created_at);
            if (t < g.erst) g.erst = t;
            if (t > g.zuletzt) g.zuletzt = t;
        }
    }
    return [...je.values()].filter((g) => g.zweige.size >= 3);
}
// die freien Minuten eines Messplatzes heute, ab seiner ersten Zeile (davor weiß die Datei nichts): Aufträge belegen von ihrer ersten
// bis zur letzten Zeile, der laufende bis jetzt
function leerlauf(text, laeuft, jetzt) {
    const z = zeilenVon(text);
    if (!z.length) return null;
    const ab = new Date(Math.max(+new Date(jetzt.getFullYear(), jetzt.getMonth(), jetzt.getDate()), +z[0].t));
    const je = new Map();
    for (const x of z) { if (!je.has(x.id)) je.set(x.id, { a: x.t, e: x.t }); else je.get(x.id).e = x.t; }
    const iv = [...je.values()];
    if (laeuft) iv[iv.length - 1].e = jetzt;
    let frei = 0, bis = ab;
    for (const x of iv.sort((p, q) => p.a - q.a)) { if (x.e <= bis) continue; if (x.a > bis) frei += x.a - bis; bis = x.e; }
    if (jetzt > bis) frei += jetzt - bis;
    return { frei, ab };
}

// ── FRESSER: je Erkenner Zeilen {rot, was, seit, kosten, kMin, tun}; rot (kommt nie / ohne Obergrenze) oben, dann nach Kosten.
// kMin vergleicht die Einheiten: Minuten wie sie sind, % × Minuten je % (aus budget.txt), Zweige × Stunden × 60, ein Agent mit
// seinen Minuten
const OBERGRENZE = /\bseq\b|\bfor \(\(|-lt\b|-le\b|-gt\b|-ge\b|\btimeout \d|\bhead -n|\bMAX\b/;
const msysPfad = (p) => p.replace(/^\/([a-z])\//i, "$1:/");
const kurzBefehl = (c) => ((/eval '(.*?)'\s*</.exec(c) || [])[1] || c).replace(/\s+/g, " ").slice(0, 60);
function fresser(S) {
    const F = [];
    const j = S.jetzt;
    const add = (rot, was, seit, kosten, kMin, tun) => F.push({ rot, was, seit, kosten, kMin, tun });
    const ps = (L.ps || []).filter((p) => !/messplatz-blick|\bps -ef\b/.test(p.cmd));
    const alter = (p) => (j - p.start) / 60000;
    // 1 HÄNGER: Schleifen ohne Obergrenze; tail -f auf Logs, die seit HAENGER_MIN still stehen (Monitor-Reste); tote Wartende
    for (const p of ps.filter((p) => alter(p) > HAENGER_MIN && /\b(until|while)\b/.test(p.cmd) && !OBERGRENZE.test(p.cmd)))
        add(true, `Schleife ohne Obergrenze: ${kurzBefehl(p.cmd)}`, p.start, dauer(j - p.start), alter(p), `kill ${p.pid}, Grenze setzen (seq/timeout)`);
    const stilleTails = ps.filter((p) => /^tail\b.*\s-\w*[fF]\b/.test(p.cmd) && alter(p) > HAENGER_MIN &&
        p.cmd.split(/\s+/).filter((t) => t.includes("/")).every((d) => { try { return j - fs.statSync(msysPfad(d)).mtime > HAENGER_MIN * 60000; } catch (_e) { return true; } }));
    if (stilleTails.length) {
        const eltern = new Set(stilleTails.map((p) => p.ppid));
        const pids = ps.filter((p) => eltern.has(p.ppid) && /^(tail|grep)\b/.test(p.cmd)).map((p) => p.pid);
        const aeltester = Math.max(...stilleTails.map(alter)); // Kosten = der älteste: sie laufen nebeneinander, nicht nacheinander
        add(false, `${stilleTails.length} tail-Wächter auf stillen Logs`, new Date(Math.min(...stilleTails.map((p) => +p.start))), dauer(aeltester * 60000), aeltester, `kill ${pids.join(" ")}`);
    }
    if (L.ps) {
        let namen = [];
        try { namen = fs.readdirSync(TEMP_CLAUDE).filter((n) => /^(fahre-.*|takt.*)\.log$/.test(n)); } catch (_e) { /* nur auf dem Laptop */ }
        for (const n of namen) {
            const { st, t } = logText(n);
            const ruhe = j - st.mtime;
            // ein Log, das regulär endete (gepusht, gebucht, gelandet), nur ohne EXIT-Zeile, wartet auf nichts (takt2-nach.log, 25.10.)
            const letzte = t.split(/\r?\n/).filter((l) => l.trim()).pop() || "";
            if (ruhe > 864e5 || ruhe < HAENGER_MIN * 60000 || /EXIT=\d|GELANDET/.test(t) || /\b(gepusht|GEBUCHT)\b|^PUNKTE /.test(letzte)) continue;
            const name = n.replace(/\.log$/, "").replace(/^fahre-/, "");
            if (!L.ps.some((p) => p.cmd.includes(n) || new RegExp(`\\b${name.replace(/[^\w-]/g, "")}\\b`).test(p.cmd)))
                add(true, `toter Wartender ${n}: kein Prozess, kein EXIT`, st.mtime, dauer(ruhe), ruhe / 60000, "Kette neu starten oder Log abschließen");
        }
    }
    for (const s of L.wfStill || []) add(false, `Agent ${s.label} still (${path.basename(s.dir)})`, new Date(+j - s.still * 60000), dauer(s.still * 60000), s.still, "nachsehen oder TaskStop (stillstand-wache)");
    // 2 LEERLAUF: Geräte frei, während Kandidaten bereit liegen; Zug-Pausen; wartende Ketten (rot, wenn ihr Ziel nie kommt)
    const kand = (L.kandidaten || []).length;
    for (const [name, text, mp, tun] of [["OMEN", S.fort, S.omen, "Kandidaten-Kopf einreihen (zug/warteschlange.txt)"], ["RADEON", S.fortR, S.radeon, "zug.sh punkte <kandidat> --geraet radeon"]]) {
        const ll = kand ? leerlauf(text, mp && !mp.zu, j) : null;
        if (ll && ll.frei > HAENGER_MIN * 60000) add(false, `${name} frei, ${kand} Kandidaten bereit`, ll.ab, dauer(ll.frei), ll.frei / 60000, tun);
    }
    const tag0 = new Date(j.getFullYear(), j.getMonth(), j.getDate());
    const heute = (L.zuege || []).filter((z) => z.start && z.start >= tag0).sort((a, b) => a.start - b.start);
    let pause = 0, groesste = null;
    heute.forEach((z, i) => {
        const ende = new Date(+z.start + (z.min || 0) * 60000);
        const naechst = heute[i + 1] ? heute[i + 1].start : z.laeuft ? null : j;
        if (naechst && naechst > ende) { pause += naechst - ende; if (!groesste || naechst - ende > groesste.g) groesste = { g: naechst - ende, nach: z.name, ab: ende }; }
    });
    if (pause > HAENGER_MIN * 60000) add(false, `Zug-Pausen heute (größte nach ${groesste.nach}: ${dauer(groesste.g)})`, groesste.ab, dauer(pause), pause / 60000, `nächsten Zug früher starten${kand ? ` (${kand} Kandidaten)` : ""}`);
    for (const p of ps.filter((p) => /buche\.sh --warte (\S+)/.test(p.cmd))) {
        const id = /buche\.sh --warte (\S+)/.exec(p.cmd)[1];
        const nie = !S.schlangeIds.has(id) && !S.erledigtIds.has(id);
        if (nie || alter(p) > HAENGER_MIN) add(nie, `wartet auf ${id} (buche.sh)`, p.start, dauer(j - p.start), alter(p), nie ? `${id} steht weder in warteschlange noch erledigt: Warter beenden` : "wartet auf die OMEN");
    }
    for (const z of (L.zuege || []).filter((z) => z.laeuft && /warte auf (\S+)/.test(z.letzte))) {
        const vor = /warte auf (\S+)/.exec(z.letzte)[1];
        const vl = (L.zuege || []).find((x) => x.name === vor);
        const nie = !vl || (vl.exit != null && vl.exit !== 0);
        const w = j - z.t;
        if (nie || w > HAENGER_MIN * 60000) add(nie, `${z.name} wartet auf ${vor}`, z.t, dauer(w), w / 60000, nie ? `${vor} ${vl ? `endete mit EXIT=${vl.exit}` : "hat kein Log"}: Kette abbrechen` : "wartet");
    }
    // 3 ÜBERNAHME: die OMEN ist frei, eine offene Zeile hat nach 15 min noch keine Zeile in fortschritt.txt
    if (S.omen && S.omen.zu && L.blame) {
        const gestartet = new Set(zeilenVon(S.fort).map((x) => x.id));
        for (const a of S.offen.filter((a) => !gestartet.has(a.id))) {
            const r = L.blame.find((b) => a.i + 1 >= b.a && a.i + 1 <= b.e);
            if (!r) continue;
            const ab = new Date(Math.max(+r.t, +S.omen.letzte.t));
            if (j - ab > 15 * 60000) add(true, `OMEN hat ${a.id} nicht übernommen`, ab, dauer(j - ab), (j - ab) / 60000, "OMEN-Dienst prüfen (messplatz.sh läuft? Schloss?)");
        }
    }
    // 4 WACKLER: Zweige × Stunden zwischen erstem und letztem Rot (mindestens 1 h)
    for (const g of L.wackler || []) {
        const h = Math.max(1, (g.zuletzt - g.erst) / 3600e3);
        add(false, `❌ ${g.zweige.size} Zweige: ${g.k}`, g.erst, `${g.zweige.size} × ${zk(h)} h`, g.zweige.size * h * 60, `in main heilen (zuletzt ${hhmm(g.zuletzt)}), dann neu fahren`);
    }
    // 5 TOKEN: Agenten ohne grünes Ergebnis (zug/agenten.txt); Budget-Fenster mit ≥ 3 % und 0 neuen Punkten
    for (const a of agentenVon(S.agentenT).filter((a) => !/^(grün|gelandet)$/.test(a.ergebnis)))
        add(false, `Agent ${a.name} (${a.ergebnis}) ohne grünes Ergebnis`, a.t, `${Math.round(a.token / 1000)}k Tok`, a.min, "zu Ende bauen oder fallen lassen");
    const mjp = minutenJeProzent(S.budget);
    const w = S.budget.filter((x) => x.woche != null);
    for (let i = 0; i < w.length - 1; ) {
        let k = i;
        while (k + 1 < w.length && wertAm(S.budget, "karte", w[k + 1].t) <= wertAm(S.budget, "karte", w[i].t)) k++;
        const dw = k > i ? w[k].woche - w[i].woche : 0;
        if (dw >= 3) add(false, `Woche ${w[i].woche} → ${w[k].woche} % ohne neue Punkte`, w[i].t, `${dw} %`, dw * (mjp || 25), "Ursache nennen: Agent ohne Ergebnis? Buchung offen?");
        i = Math.max(i + 1, k);
    }
    return F.sort((a, b) => b.rot - a.rot || b.kMin - a.kMin);
}
// zug/agenten.txt: Zeit · Name · Art · Token · Minuten · Ergebnis · Ziel · Zahl
const agentenVon = (text) => String(text || "").split(/\r?\n/).map((l) => /^(\d{4}-\d\d-\d\dT\d\d:\d\d)\s+(\S+)\s+(\S+)\s+(\d+)\s+(\d+)\s+(\S+)\s*(.*)$/.exec(l.trim())).filter(Boolean)
    .map((m) => ({ t: new Date(m[1]), name: m[2], art: m[3], token: Number(m[4]), min: Number(m[5]), ergebnis: m[6], rest: m[7] }));
// Minuten je % Wochen-Budget aus budget.txt (erste bis letzte Wochen-Zeile)
function minutenJeProzent(b) {
    const w = b.filter((x) => x.woche != null);
    return w.length > 1 && w[w.length - 1].woche > w[0].woche ? (w[w.length - 1].t - w[0].t) / 60000 / (w[w.length - 1].woche - w[0].woche) : null;
}
const seitText = (d, j) => (d.toDateString() === j.toDateString() ? hhmm(d) : `${tag(d)} ${hhmm(d)}`);
function fresserZeilen(S, n = 8) {
    return fresser(S).slice(0, n).map((x) => `  ${x.rot ? rot("●") : gelb("●")} ${spalte(kappe(x.was, 44), 44)} ${grau("·")} ${spalte(grau(seitText(x.seit, S.jetzt)), 11)} ${grau("·")} ${rechts(x.kosten, 12)} ${grau("·")} ${x.tun}`);
}
function seiteFresser(S) {
    const ag = agentenVon(S.agentenT);
    const gruen = ag.filter((a) => /^(grün|gelandet)$/.test(a.ergebnis)).length;
    const summe = ag.reduce((s, a) => s + a.token, 0);
    const z = fresserZeilen(S);
    return [
        linie(z.length ? `FRESSER · ${z.length} größte zuerst · rot = kommt nie oder ohne Obergrenze` : "FRESSER · nichts gefunden"),
        grau(`  Token je grünem Ergebnis ${gruen ? Math.round(summe / gruen / 1000) + "k" : "—"} (${ag.length} Agenten, ${gruen} grün) · ${zk(minutenJeProzent(S.budget), 0)} min je % · Spalten: Was · seit · Kosten · tun`),
        ...z,
    ];
}

// DER VERLAUF JE LÄUFER (08.11.): zuletzt/davor aus den Jobs der API — echt, GPU-Probe und Farm tragen runner_name. Bis hier las der
// Blick nur zug/fortschritt*.txt, die allein `zug.sh punkte` schreibt; seit echt, GPU-Probe und `punkte.cjs run` direkt messen, stand
// die OMEN seit 05.11. und die Radeon seit 06.11. still. Die Jobs eines fertigen Laufs ändern sich nie: EINMAL je Lauf und Versuch geholt.
const fertigeJobs = new Map();
async function verlaufJe(jobs, versuch, jetzt) {
    const r = await versuch("Runs zuletzt", () => api("/actions/runs?per_page=40"));
    const je = new Map();
    for (const run of (r && r.workflow_runs) || []) {
        if (jetzt - new Date(run.created_at) > 12 * 3600e3 || run.conclusion === "skipped") continue;
        const k = `${run.id}:${run.run_attempt}`;
        let js = run.status === "completed" ? fertigeJobs.get(k) : (jobs.get(run.id) || {}).jobs;
        if (!js) {
            js = ((await versuch("Jobs " + run.id, () => api(`/actions/runs/${run.id}/jobs?per_page=100`))) || {}).jobs;
            if (js && run.status === "completed") fertigeJobs.set(k, js);
        }
        for (const j of js || [])
            if (j.runner_name && /omen|radeon|gtx1050/i.test(j.runner_name) && j.status === "completed" && j.completed_at) { // 10.11.: ohne gtx1050 stand v3 immer leer
                if (!je.has(j.runner_name)) je.set(j.runner_name, []);
                je.get(j.runner_name).push({ name: j.name.replace(/ \(.*$/, ""), lauf: run.name.split(" ")[0], zweig: run.head_branch, sha: run.head_sha, wort: j.conclusion, start: new Date(j.started_at), ende: new Date(j.completed_at) });
            }
    }
    for (const l of je.values()) l.sort((a, b) => b.ende - a.ende);
    return je;
}

// ── EFFIZIENZ · ABGABEN · WARTEND (aus w22-blick) ─────────────────────────────────────────────────────────────────────
// DIE EFFIZIENZ-TAFEL (Schöpfer 07.11. 20:40: „ein echter Wert, der mich besser macht, ohne Prioritäten zu verbiegen“), KEIN Gesamt-Wert: PFLICHT ·
// ERTRAG ehrlich · BUDGET · FLUSS. Quellen: zug/budget.txt · stand.json auf punkte-maschine · fahre-z*.log · w3/abgabe.log · integ-probe-Läufe
const STAND = "meisterkarte-quelle/punkte/stand.json";
// LEITPLANKE: eine Stufe K#L zählt nur, wenn eine ihrer Stationen GEMESSEN grün ist (ungemessen ist nie Ertrag); ein Rückfall zieht ab, je Stufe einmal
function standKurz(s, t) {
    const je = Object.values(s.je || {}), rueckfall = [...new Set((s.rueckfall || []).map((r) => String(r).split(/[\s:]/)[0]))];
    const gemessen = je.reduce((n, v) => n + [...Array(v.punkte || 0).keys()].filter((i) => (v.stationen || []).some((st) => String(st.id).endsWith("#" + (i + 1)) && st.gruen === true && !st.ungemessen)).length, 0);
    return { kopf: s.kopf, t, gebucht: je.reduce((n, v) => n + (v.punkte || 0), 0), ehrlich: gemessen - rueckfall.length, rueckfall, pflicht: ((s.pflicht || {}).eintraege || []).filter((e) => e.gesamt > 0).map(({ id, gruen, gesamt }) => ({ id, gruen, gesamt })) };
}
const kontoStart = (b) => (b.find((x) => x.konto === (b[b.length - 1] || {}).konto) || {}).t || null; // die erste Zeile des laufenden Kontos
const p50 = (a) => { const s = a.filter((x) => x != null && isFinite(x)).sort((x, y) => x - y), n = s.length; return n ? (n % 2 ? s[(n - 1) / 2] : (s[n / 2 - 1] + s[n / 2]) / 2) : null; };
// die Zahlen der Tafel, rein (der Selbsttest füttert sie mit einer nachgebauten Welt): St = Kurzformen {jetzt, start, vor24}, zuege aus zugLaeufe
function tafelZahlen({ b, St, zuege, abgaben: A, wartend, ci, jetzt, inMain }) {
    const P0 = St.start && St.start.pflicht, d = (x) => (St.jetzt && x ? St.jetzt.ehrlich - x.ehrlich : null);
    const T = { pflicht: (St.jetzt ? St.jetzt.pflicht : []).map((e) => ({ ...e, d: P0 ? e.gruen - (P0.find((x) => x.id === e.id) || e).gruen : null })) };
    const E = (T.ertrag = St.jetzt ? { ...St.jetzt, d24: d(St.vor24), dKonto: d(St.start) } : null);
    // ein Zug je Nummer: die Basis mit „bau gegen“ und Kandidat; GELANDET in ihr oder einem Neben-Log (w: Wackler-Neulauf) heißt grün, sonst FAHRT ROT rot
    const Z = (zuege || []).filter((z) => z.name === "z" + z.nr && z.bau && z.kand && z.start).map((z) => { const n = zuege.filter((x) => x.nr === z.nr), land = n.map((x) => x.land).filter(Boolean).sort((p, q) => p - q)[0], rt = n.map((x) => x.rotT).filter(Boolean).sort((p, q) => q - p)[0]; const drinMain = !land && inMain && inMain.has(z.kand); return { ...z, urteil: land || drinMain ? "grün" : rt ? "rot" : null, ende: land || rt || (drinMain ? z.t : null), vonHand: drinMain }; }).sort((p, q) => p.start - q.start); // 10.11.: ein Kandidat in main ist gelandet, auch ohne GELANDET im Log (z365 von Hand, wackler-frei)
    const t0 = kontoStart(b), w = b.filter((x) => x.roh != null), wj = w[w.length - 1], t24 = new Date(+jetzt - 864e5), w24 = [...w].reverse().find((x) => x.t <= t24);
    const landungen = Z.filter((z) => t0 && z.urteil === "grün" && z.ende >= t0).length, dw24 = wj && w24 ? wj.woche - w24.woche : null;
    T.budget = { konto: wj ? wj.roh : null, t: wj && wj.t, notiz: wj ? wj.notiz : "", t0, landungen, jeKonto: E && E.dKonto != null && wj && wj.roh > 0 ? E.dKonto / wj.roh : null, je24: E && E.d24 != null && dw24 > 0 ? E.d24 / dw24 : null, jeLandung: landungen && wj ? wj.roh / landungen : null,
        unsicher24: w24 && t24 - w24.t > 6 * 3600e3 ? w24.t : null }; // die 24-h-Basis liegt weit vor dem Fenster: Wochen-Zeilen fehlen
    const z24 = Z.filter((z) => jetzt - z.start <= 864e5 && z.urteil), gel = z24.filter((z) => z.urteil === "grün"), fertig = Z.filter((z) => z.urteil).slice(-5);
    const al = gel.flatMap((z) => z.drin.map((x) => A.filter((a) => a.zweig === x.z && a.t <= z.start).sort((p, q) => q.t - p.t)[0]).filter(Boolean).map((a) => (z.ende - a.t) / 60000)); // Abgabe→Landung
    T.fluss = { gruen: gel.length, rot: z24.length - gel.length, wand: p50(z24.map((z) => (z.ende - z.start) / 60000)), al: p50(al), nAL: al.length, wartend: wartend || [], fertig, ci: p50(fertig.map((z) => ci[z.name])), nCi: fertig.filter((z) => ci[z.name] != null).length };
    T.zuege = Z; // die Züge mit Urteil: die Kette und die Integration der Uhr lesen dieselben
    return T;
}
const vz = (d) => (d == null ? grau(" —") : d > 0 ? gruen(` +${d}`) : d < 0 ? rot(` ${d}`) : grau(" ±0")); const minText = (m) => (m == null ? "—" : dauer(m * 60000));
function tafelZeilen(T, K, S) {
    const E = T.ertrag, B = T.budget, F = T.fluss, n = F.gruen + F.rot, st = E && new Date(E.t);
    return [
        `${spalte("PFLICHT", 8)} ${T.pflicht.length ? T.pflicht.map((e) => `${fett(e.id)} ${e.gruen}/${e.gesamt}${vz(e.d)}`).join(" · ") : grau("stand.json nicht gelesen")}${E ? grau(`   stand.json ${E.kopf} · ${tag(st)}. ${hhmm(st)}`) : ""}`,
        `${spalte("ERTRAG", 8)} ${E ? `gebucht ${E.gebucht}/${S.mk ? S.mk.max : "?"} · ehrlich ${fett(E.ehrlich)}${E.rueckfall.length ? rot(` (−${E.rueckfall.length} Rückfall ${E.rueckfall.slice(0, 3).join(" ")})`) : ""} · Δ ehrlich 24 h${vz(E.d24)} · seit Kontostart${vz(E.dKonto)}` : grau("—")}`,
        `${spalte("BUDGET", 8)} Konto ${B.konto == null ? "—" : `${B.konto} % ${grau(`(${hhmm(B.t)})`)}`} · ehrlich je % Konto ${zk(B.jeKonto, 2)} · 24 h ${B.unsicher24 ? grau(`${zk(B.je24, 2)} (unsicher: Basis ${tag(B.unsicher24)}. ${hhmm(B.unsicher24)})`) : zk(B.je24, 2)} · ${B.jeLandung == null ? "—" : zk(B.jeLandung) + " %"} je Landung (${B.landungen}) · Brenn ${zk(K.brenn && K.brenn.rate)} %/h · 98 % ≈ ${K.ziel98 || "—"}`,
        `${spalte("FLUSS", 8)} Züge 24 h ${gruen(F.gruen + " grün")}/${rot(F.rot + " rot")}${n ? ` (Rot ${Math.round((100 * F.rot) / n)} %)` : ""} · Wand p50 ${minText(F.wand)} · Abgabe→Landung p50 ${minText(F.al)} (${F.nAL}) · wartend ${F.wartend.length} · CI je Zug ${minText(F.ci)} (${F.nCi}/${F.fertig.length})`,
    ];
}
// w3/abgabe.log „HH:MM <ART> <zweig> <sha8> <Betreff>“ (nur die Uhrzeit): der Tag läuft rückwärts ab der Datei-Zeit — springt die Uhrzeit rückwärts
// gelesen nach vorn, war Mitternacht. Nur ABGABE, sieben Tage, jüngste zuerst; null ohne Datei
function abgabenVon(jetzt, datei = path.join(TEMP_CLAUDE, "w3", "abgabe.log")) {
    let tg, text, vor = 24 * 60;
    try { tg = fs.statSync(datei).mtime; text = fs.readFileSync(datei, "utf8"); } catch (_e) { return null; }
    const out = [];
    for (const m of text.split(/\r?\n/).reverse().map((l) => /^(\d\d):(\d\d) (\S+) (\S+) (\w+) (.*)$/.exec(l)).filter(Boolean)) {
        if (+m[1] * 60 + +m[2] > vor + 1) tg = new Date(+tg - 864e5);
        vor = +m[1] * 60 + +m[2];
        const t = new Date(tg.getFullYear(), tg.getMonth(), tg.getDate(), +m[1], +m[2]);
        if (jetzt - t > 7 * 864e5) break;
        if (m[3] === "ABGABE") out.push({ t, zweig: m[4], sha: m[5], titel: m[6].replace(/^Abgabe [^:]+:\s*/, "") });
    }
    return out;
}
// DER BLICK SCHREIBT DIE ABGABEN SELBST (09.11.: w3/abgabe.log speiste nur eine Abgabe-Wache — sie endete am 08.11. 16:36, ABGABEN und WARTEND
// standen 27 h auf 0, während Abgaben kamen). Die Quelle ist der Titel des Zweig-Kopfs („Abgabe <zweig>: …“), je SHA einmal; die Uhrzeit
// ist der Push, nie früher als die jüngste Zeile (abgabenVon liest die Tage rückwärts aus der Folge der Uhrzeiten)
function abgabeSchreiben(zweige, jetzt, datei = path.join(TEMP_CLAUDE, "w3", "abgabe.log")) {
    let text = "";
    try { text = fs.readFileSync(datei, "utf8"); } catch (_e) { /* neu */ }
    const da = new Set([...text.matchAll(/^\d\d:\d\d \S+ \S+ (\w+) /gm)].map((m) => m[1].slice(0, 8)));
    const alt = abgabenVon(jetzt, datei) || [];
    let boden = alt.length ? alt[0].t : new Date(0); // die jüngste Zeile (abgabenVon: jüngste zuerst)
    const neu = zweige.filter((x) => /^Abgabe /.test(x.titel || "") && !da.has(s8(x.sha))).sort((a, b) => a.t - b.t);
    if (!neu.length) return 0;
    // der Tag steht nicht in der Zeile: schrieb zuletzt ein früherer Tag, trägt je fehlendem Tag eine Zeile „23:59 TAG …“ den Wechsel (abgabenVon
    // zählt einen Tag zurück, sobald die Uhrzeit rückwärts gelesen steigt) — sonst läsen sich die Zeilen von gestern als heute
    const zeilen = [];
    try {
        const m = fs.statSync(datei).mtime, tage = Math.round((new Date(jetzt.toDateString()) - new Date(m.toDateString())) / 864e5);
        for (let i = tage; i >= 1; i--) zeilen.push(`23:59 TAG ${new Date(+jetzt - i * 864e5).toISOString().slice(0, 10)} wechsel (abgabeSchreiben)`);
        if (tage > 0) boden = new Date(0);
    } catch (_e) { /* neu */ }
    for (const x of neu) { const t = x.t > boden && x.t.toDateString() === jetzt.toDateString() ? x.t : boden > new Date(0) ? boden : jetzt; boden = t; zeilen.push(`${hhmm(t)} ABGABE ${x.z} ${s8(x.sha)} ${x.titel}`); }
    try { fs.appendFileSync(datei, (text && !text.endsWith("\n") ? "\n" : "") + zeilen.join("\n") + "\n"); } catch (_e) { return 0; }
    return zeilen.length;
}
// WARTEND (Koordinator 08.11.): die jüngste ABGABE je Zweig in 48 h, deren Inhalt nicht im Ziel steckt (origin/main, -pm: origin/punkte-maschine).
// DRIN = `git merge-tree --write-tree <ziel> <kopf>` ergibt glatt den Baum des Ziels (Vorfahr wie gelandeter Inhalt), alle Köpfe in EINEM Prozess
// (ein git-Start kostet hier 0,7 s; cat-file prüft vorher, ein fehlender Kopf bräche --stdin), draußen zählt compare die Commits vor dem Ziel;
// zug/abgeloest.txt („<zweig> <grund>“) wartet nie. „drin“ gilt für immer, „draußen“ je Ziel-SHA (Speicher)
const git = (a, ein) => new Promise((ok) => { const c = execFile("git", a, { cwd: __dirname, timeout: 120000, windowsHide: true, maxBuffer: 1 << 24 }, (e, out) => ok({ e, out: String(out || "") })); c.stdin.end(ein || ""); });
async function wartendVon(A, abgeloestT, jetzt) {
    const r = await git(["rev-parse", "origin/main", "origin/main^{tree}", "origin/punkte-maschine", "origin/punkte-maschine^{tree}"]), [mS, mB, pS, pB] = r.out.trim().split(/\r?\n/);
    if (r.e || !pB) throw new Error("git rev-parse origin/main origin/punkte-maschine: " + (r.e ? r.e.message.split("\n")[0] : "leer"));
    const abg = new Map(String(abgeloestT || "").split(/\r?\n/).map((l) => l.trim()).filter((l) => l && !l.startsWith("#")).map((l) => [l.split(/\s+/)[0], l.replace(/^\S+\s*/, "")]));
    const je = new Map(), W = { wartend: [], abgeloest: [], main: mS, pm: pS, fehler: [] }, alt = speicher.ziel, neu = (speicher.ziel = {});
    for (const a of A) if (jetzt - a.t <= 2 * 864e5 && !je.has(a.zweig)) je.set(a.zweig, { ...a, pm: /-pm$/.test(a.zweig), ziel: /-pm$/.test(a.zweig) ? pS : mS }); // A: jüngste zuerst
    for (const a of je.values()) { const v = alt[a.sha]; if (!abg.has(a.zweig) && (v === true || (v && (v.ziel === a.ziel || v.ohneVorfahr)))) neu[a.sha] = v; }
    const pruef = [...je.values()].filter((a) => !abg.has(a.zweig) && !neu[a.sha]);
    const da = pruef.length ? (await git(["cat-file", "--batch-check"], pruef.map((a) => a.sha).join("\n") + "\n")).out.split(/\r?\n/) : [], ok = pruef.filter((a, i) => / commit /.test(da[i] || ""));
    const mt = ok.length ? await git(["merge-tree", "--write-tree", "--allow-unrelated-histories", "--name-only", "--no-messages", "--stdin"], ok.map((a) => `${a.ziel} ${a.sha}`).join("\n") + "\n") : { out: "" };
    if (mt.e) throw new Error("git merge-tree --stdin: " + mt.e.message.split("\n")[0]);
    ok.forEach((a, i) => { const [glatt, baum] = (mt.out.split("\0\0")[i] || "").split("\0"); if (glatt === "1" && baum === (a.pm ? pB : mB)) neu[a.sha] = true; });
    // 10.11.: compare ohne gemeinsamen Vorfahren antwortet 404 (w25-referenz-atlas) — EIN Vergleich warf die ganze Liste; jetzt wartet der Zweig mit „+?“, laut
    await Promise.all(pruef.filter((a) => !neu[a.sha]).map(async (a) => {
        let vor = null;
        let ohneVorfahr = false;
        if (ok.includes(a)) try { vor = (await api(`/compare/${a.ziel}...${a.sha}?per_page=1&page=2`)).ahead_by; } catch (e) { if (/HTTP 404/.test(e.message)) ohneVorfahr = true; else W.fehler.push(`${a.zweig}: ${e.message}`); }
        neu[a.sha] = { ziel: a.ziel, vor, ...(ohneVorfahr ? { ohneVorfahr } : {}) };
    }));
    for (const a of je.values()) if (abg.has(a.zweig)) W.abgeloest.push({ ...a, grund: abg.get(a.zweig) }); else if (neu[a.sha] !== true) W.wartend.push({ ...a, vor: neu[a.sha].vor });
    for (const l of [W.wartend, W.abgeloest]) l.sort((p, q) => p.t - q.t);
    return W;
}

// ── holen: der schnelle Teil je Takt, KURS und PLAN jeden LANGSAM_TAKTE-ten ────────────────────────────────────────────
let takt = 0;
let L = null;
let langsamLaeuft = false;
async function holen() {
    const jetzt = new Date();
    zahl.neu = zahl.gleich = 0;
    const fehler = [];
    const versuch = async (was, fn) => { try { return await fn(); } catch (e) { fehler.push(`${was}: ${e.message}`); return null; } };

    const [main, koord] = await Promise.all(["main", "koordination"].map((b) => versuch("Ref " + b, async () => (await api(`/git/ref/heads/${b}`)).object.sha)));
    for (const k of dateien.keys()) if (![main, koord].includes(k.split(":")[0])) dateien.delete(k);
    const D = (p) => koord && versuch(p, () => datei(koord, p));
    const [paket, karte, fort, fortR, schlange, erledigt, budgetT, planT, agentenT, abgeloestT, sitzungT, ghStatus] = await Promise.all([
        main && versuch("package.json", () => datei(main, "package.json")),
        D("meisterkarte.json"), D("zug/fortschritt.txt"), D("zug/fortschritt-radeon.txt"), D("zug/warteschlange.txt"), D("zug/erledigt.txt"), D("zug/budget.txt"), D("zug/plan.txt"), D("zug/agenten.txt"), D("zug/abgeloest.txt"),
        Promise.resolve(D("zug/sitzung.txt")).then((x) => x || ""),
        // DER ZUSTAND VON GITHUB ACTIONS (09.11. 19:20: major_outage — jeder Lauf endete „failure“ mit 0 Jobs, der Blick sagte „CI nichts läuft“)
        versuch("githubstatus", () => fetch("https://www.githubstatus.com/api/v2/components.json").then((r) => r.json()).then((j) => ((j.components || []).find((c) => c.name === "Actions") || {}).status || "?")),
    ]);
    const laeufer = TOKEN ? await versuch("Läufer", async () => (await api("/actions/runners?per_page=20")).runners) : null;
    const runs = [];
    for (const st of ["in_progress", "queued", "waiting"]) {
        const r = await versuch("Runs " + st, () => api(`/actions/runs?status=${st}&per_page=30`));
        for (const x of (r && r.workflow_runs) || []) if (!runs.some((y) => y.id === x.id)) runs.push(x);
    }
    const jobs = new Map();
    if (TOKEN) for (const r of runs.slice(0, 10)) jobs.set(r.id, (await versuch("Jobs " + r.id, () => api(`/actions/runs/${r.id}/jobs?per_page=100`))) || { jobs: [] });
    const traeger = new Map(); // Läufer-Name → {run, job} aus runner_name der laufenden Jobs
    for (const r of runs) for (const j of (jobs.get(r.id) || { jobs: [] }).jobs) if (j.status === "in_progress" && j.runner_name) traeger.set(j.runner_name, { run: r, job: j });
    const verlauf = TOKEN ? await verlaufJe(jobs, versuch, jetzt) : new Map();
    // laufende Punkte-Messungen des Laptops (punkte.cjs run direkt, ohne zug.sh — sie schreiben keine Stationen-Datei)
    const ps = await psListe();
    letztePs = ps; // der Zug lebt nur mit seinem Prozess (zugLebt)
    const lokal = (ps || []).map((p) => [p, /punkte\.cjs run --sha ([0-9a-f]{7,40}) --geraet (\w+)/.exec(p.cmd)]).filter(([, m]) => m)
        .map(([p, m]) => ({ sha: m[1], geraet: m[2], offen: /--offen/.test(p.cmd), start: p.start }))
        .filter((x, i, a) => a.findIndex((y) => y.sha === x.sha && y.geraet === x.geraet && y.offen === x.offen) === i); // 10.11.: bash -c, timeout und node trugen denselben Lauf zwei- und dreifach
    // der Ruhe-Läufer der Radeon (w3/zeit-lauer*.sh) wartet auf < 0,5 fremde Kerne: er ist Arbeit, auch bevor er misst
    const lauer = (ps || []).filter((p) => /zeit-lauer\d*\.sh/.test(p.cmd) && !/^bash -c/.test(p.cmd)).slice(0, 1).map((p) => {
        const f = path.join(TEMP_CLAUDE, "w3", (/(zeit-lauer\d*)\.sh/.exec(p.cmd) || [])[1] + ".out");
        let z = ""; try { z = fs.readFileSync(f, "utf8").trim().split(/\r?\n/).pop() || ""; } catch (_e) { /* noch keine Zeile */ }
        return { start: p.start, letzte: z };
    })[0] || null;
    // Last: die GPU-Probe ruht, solange die Radeon misst (Zeit-Stationen) — Fortschritt ohne ENDE (jünger als 3 h), echt-Job auf
    // radeon-890m oder ein gehaltenes GPU-Schloss (deckt auch Läufe ausserhalb von zug.sh)
    const rLetzte = zeilenVon(fortR).pop();
    const schlossDir = path.join(TEMP_CLAUDE, "gpu-schloss");
    let schloss = null, schlossT = null; // der Ordner ist das Schloss (seit = Ordner-Zeit); besitzer.txt in EINER Zeile (ihr ⏎ zerriss die Ampel)
    if (fs.existsSync(schlossDir)) try { schlossT = fs.statSync(schlossDir).mtime; schloss = fs.readFileSync(path.join(schlossDir, "besitzer.txt"), "utf8").trim().replace(/\s+/g, " ") || "?"; } catch (_e) { schloss = schloss || "?"; }
    const ruht = rLetzte && !/^(ENDE|ABBRUCH) /.test(rLetzte.rest) && jetzt - rLetzte.t < 3 * 3600e3 ? `Radeon-Lauf ${rLetzte.id}`
        : traeger.get("radeon-890m") ? "echt-Job auf radeon-890m" : schloss ? `GPU-Schloss: ${schloss.slice(0, 40)}` : null;
    const werkbaenke = KURZ ? [] : await werkbankHoerer();
    const cpu = cpuProzent(); // vor der GPU-Probe: typeperf zählt nicht in die CPU-Last
    const gpu = ruht || KURZ ? null : await gpu3d();
    // Cloud: activity (ETag), je Zweig der jüngste Push der letzten CLOUD_H Stunden, der Titel je SHA einmal; die Pushes von
    // koordination (je Station einer) füllen 100 Einträge in ~5 h: reicht Seite 1 nicht bis zur Grenze, kommt die nächste
    const grenze = +jetzt - CLOUD_H * 3600e3;
    const AKT = "/activity?per_page=100&time_period=day";
    let akt = TOKEN ? await versuch("Aktivität", () => api(AKT)) : null;
    const weiter = weiterVon(AKT);
    if (akt && weiter && new Date(akt[akt.length - 1].timestamp) > grenze) akt = akt.concat((await versuch("Aktivität 2", () => api(weiter))) || []); // neu verketten: der ETag-Speicher hält Seite 1
    const zweige = [];
    for (const a of akt || []) {
        const z = String(a.ref || "").replace(/^refs\/heads\//, "");
        if (!String(a.ref).startsWith("refs/heads/") || a.activity_type === "branch_deletion" || CLOUD_AUS.test(z) || new Date(a.timestamp) < grenze || zweige.some((x) => x.z === z)) continue;
        zweige.push({ z, t: new Date(a.timestamp), sha: a.after });
    }
    // der Titel JEDES Kopfs (je SHA einmal, unveränderlich): aus ihm liest der Blick die Abgaben selbst (abgabeSchreiben)
    for (const x of zweige.slice(0, 80))
        x.titel = titel.get(x.sha) || (await versuch("Titel " + s8(x.sha), async () => { const m = (await api(`/git/commits/${x.sha}`)).message.split("\n")[0]; titel.set(x.sha, m); return m; }));
    abgabeSchreiben(zweige, jetzt);
    const aeltester = akt && akt.length ? new Date(akt[akt.length - 1].timestamp) : null;

    let mk = null;
    try { mk = karte && JSON.parse(karte); } catch (_e) { fehler.push("meisterkarte.json: kein JSON"); }
    const erledigtJe = erledigtVon(erledigt);
    const sitzungen = [];
    for (const s of sitzungenVon(sitzungT, erledigtJe, jetzt)) sitzungen.push(await sitzungFortschritt(s, versuch));
    const budget = budgetVon(budgetT);
    const abgaben = abgabenVon(jetzt);
    // KURS und PLAN (≈ 15 s, vor allem die Zweig-Liste) laufen im Hintergrund und zeichnen bei Ankunft neu; nur der erste Blick,
    // --einmal und --kurz warten auf sie
    if ((!L || takt % LANGSAM_TAKTE === 0) && !langsamLaeuft) {
        langsamLaeuft = true;
        const p = holenLangsam(jetzt, main, koord, budget, abgaben, abgeloestT)
            .catch((e) => ({ t: jetzt, fehler: ["abgebrochen: " + e.message] })) // laut, und der nächste langsame Takt versucht es neu
            .then((r) => { L = r; langsamLaeuft = false; if (stand && !EINMAL) zeichne(); });
        if (!L || EINMAL) await p;
    }
    takt++;
    const lauferVon = (n) => (laeufer || []).find((x) => x.name === n);
    const jobsVon = (r) => (jobs.get(r.id) || { jobs: [] }).jobs;
    const S = {
        jetzt, fehler, main, koord, mk, budget, fort, fortR, schloss, schlossT, ruht, cpu, gpu, zweige, runs, jobsVon, werkbaenke, abgaben, erledigtT: erledigt,
        version: paket ? (/"version":\s*"([^"]+)"/.exec(paket) || [])[1] : null,
        omen: messplatz(fort, (id) => erledigtJe.get(id), jetzt),
        radeon: messplatz(fortR, (id, l) => (/^(ENDE|ABBRUCH) /.test(l.rest) ? l.rest.replace(/^ENDE /, "") : null), jetzt),
        lO: lauferVon("omen-gtx1060"), lR: lauferVon("radeon-890m"), jO: traeger.get("omen-gtx1060"), jR: traeger.get("radeon-890m"),
        vO: verlauf.get("omen-gtx1060") || [], vR: verlauf.get("radeon-890m") || [], lokal,
        // DAS DRITTE GERÄT (09.11.: GTX 1050, i7-950 — der Läufer der Bild-Proben, gpu-probe; Zeit-Gates fahren dort nie)
        l3: lauferVon("gtx1050-desktop"), j3: traeger.get("gtx1050-desktop"), v3: verlauf.get("gtx1050-desktop") || [],
        offen: offeneAuftraege(schlange, erledigt), logs: koordinatorLogs(ps), plan: planVon(planT), agentenT,
        sitzungen, actions: ghStatus, lauer,
        sitzungVon: (g) => sitzungen.filter((s) => s.geraet === g),
        schlangeIds: new Set(String(schlange || "").split(/\r?\n/).filter((l) => l.trim() && !l.startsWith("#")).map((l) => l.trim().split(/\s+/)[0])),
        erledigtIds: new Set(erledigtJe.keys()),
        luecke: akt && akt.length >= 100 && aeltester > grenze ? aeltester : null,
        rotVon: (r) => jobsVon(r).filter((j) => j.status === "completed" && !["success", "skipped", "neutral"].includes(j.conclusion)).length,
        api: { ...zahl },
    };
    // DIE UHR je Takt (Seite 0, Kopf jeder Seite): Lage, Urteil und Verlauf je Gerät; ein Bruch ist laut, nie ein leerer Blick
    try { S.uhr = UHR.lagen(S, { ps }); } catch (e) { fehler.push("Uhr: " + e.message); S.uhr = null; }
    return S;
}
// KURS und PLAN: Versions-Stufen auf main, Zug-Logs, CI-Takt integ-probe, Qualität je Gerät, Kandidaten
async function holenLangsam(jetzt, main, koord, budget, abgaben, abgeloestT) {
    const R = { t: jetzt, fehler: [] };
    const v = async (was, fn) => { try { return await fn(); } catch (e) { R.fehler.push(`${was}: ${e.message}`); return null; } };
    R.seit = budget.length ? budget[0].t : new Date(+jetzt - 7 * 864e5);
    R.zuege = zugLaeufe(jetzt);
    // die Zweige (EIN GraphQL-Abruf) tragen die Kandidaten und die Abgaben für WARTEND und den STAU der Uhr
    const pRefs = TOKEN ? v("Zweige", () => zweigeAlle()) : Promise.resolve(null);
    // die Commits von main seit Wochen-Start (Versions-Stufen, Qualität; die Tafel liest aus ihnen, welcher Kandidat in main steckt, die Uhr die Merges)
    const pCommits = (async () => {
        let c = [];
        for (let p = `/commits?sha=main&since=${R.seit.toISOString()}&per_page=100`, s = 0; p && s < 6; s++) {
            const x = await v("Commits main", () => api(p));
            if (!x) break;
            c = c.concat(x);
            p = weiterVon(p);
        }
        return c;
    })();
    const pPs = psListe();
    // die EFFIZIENZ als eigener Strang: WARTEND, stand.json (ETag) je gebrauchtem Stand (jetzt, Kontostart, vor 24 h), die CI-Minuten fertiger Züge
    // (alle Versuche ihres Code-Check-Laufs auf integ-probe am Kandidaten — der Lauf auf main am selben Kopf ist nicht der Zug), einmal je Zug
    const pTafel = (async () => {
        const alle = await pRefs;
        if (alle) R.W = await v("Wartend", () => wartendVon(abgabenAusRefs(alle, jetzt), abgeloestT, jetzt));
        if (R.W && R.W.fehler.length) R.fehler.push("Wartend (+? beim Zweig): " + R.W.fehler.join(" · "));
        const SL = TOKEN ? ((await v("stand.json", () => api(`/commits?sha=punkte-maschine&path=${STAND}&per_page=30`))) || []).map((c) => ({ sha: c.sha, t: new Date(c.commit.committer.date) })) : [];
        const amT = (t) => t && SL.find((c) => c.t <= t), St = {};
        for (const [k, c] of [["jetzt", SL[0]], ["start", amT(kontoStart(budget))], ["vor24", amT(new Date(+jetzt - 864e5))]].filter(([, c]) => c)) {
            if (!speicher.stand[c.sha]) await v("stand.json " + s8(c.sha), async () => { speicher.stand[c.sha] = standKurz(JSON.parse(await datei(c.sha, STAND)), c.t); });
            St[k] = speicher.stand[c.sha];
        }
        if (SL.length) speicher.stand = Object.fromEntries(SL.filter((c) => speicher.stand[c.sha]).map((c) => [c.sha, speicher.stand[c.sha]]));
        const inMain = new Set((await pCommits).map((c) => c.sha));
        const tz = () => tafelZahlen({ b: budget, St, zuege: R.zuege, abgaben: abgaben || [], wartend: R.W && R.W.wartend, ci: speicher.ciZug, jetzt, inMain });
        for (const z of TOKEN ? tz().fluss.fertig.filter((z) => speicher.ciZug[z.name] == null) : []) await v("CI " + z.name, async () => {
            const rs = ((await api(`/actions/runs?head_sha=${z.kand}&per_page=10`)).workflow_runs || []).filter((r) => r.name === "Code-Check" && r.head_branch === "integ-probe");
            if (!rs.length || rs.some((r) => r.status !== "completed")) return;
            let ms = 0; // erst die ganze Summe in den Speicher: ein Abbruch mitten in den Jobs hinterlässt nichts
            for (const r of rs) for (const j of (await api(`/actions/runs/${r.id}/jobs?filter=all&per_page=100`)).jobs) if (j.started_at && j.completed_at) ms += new Date(j.completed_at) - new Date(j.started_at);
            speicher.ciZug[z.name] = ms / 60000;
        });
        R.tafel = tz();
        R.SL0 = SL[0];
    })();
    // unabhängige Stränge zugleich: Kandidaten (die Zweig-Liste trägt die Wandzeit), CI-Takt, Stufen → Qualität, die FRESSER-Quellen
    // (Prozesse des Laptops, wann jede Warteschlangen-Zeile kam, Wackler über die Zweige)
    const pKand = TOKEN && main ? pRefs.then((alle) => alle && v("Kandidaten", () => kandidaten(jetzt, main, alle))) : null;
    const pBlame = koord && TOKEN ? v("Blame Warteschlange", () => blameVon(koord, "zug/warteschlange.txt")) : null;
    const pWackler = TOKEN ? v("Wackler", () => wacklerSuche(jetzt)) : null;
    // CI-Takt: die letzten 10 abgeschlossenen integ-probe-Runs; ein Rot nur in Gruppe 1 (voll 1/18) heißt Wackler
    const pCi = (async () => {
        const ir = TOKEN ? await v("integ-probe", () => api("/actions/runs?branch=integ-probe&status=completed&per_page=10")) : null;
        const zehn = (ir && ir.workflow_runs) || [];
        const wand = zehn.filter((r) => r.conclusion !== "cancelled").map((r) => (new Date(r.updated_at) - new Date(r.run_started_at)) / 60000).filter((x) => x > 0).sort((a, b) => a - b);
        const q = (p) => (wand.length ? wand[Math.min(wand.length - 1, Math.ceil(p * wand.length) - 1)] : null);
        const rotR = zehn.filter((r) => r.conclusion === "failure");
        await Promise.all(rotR.map((r) => v("Jobs " + r.id, () => rotSchritte(r))));
        const wackler = rotR.filter((r) => { const n = rotJobs.get(r.id + ":" + r.run_attempt) || []; return n.length && n.every((x) => /^voll 1\/18/.test(x.name)); }).length;
        return { n: zehn.length, p50: q(0.5), p95: q(0.95), rot: rotR.length, wackler, neulauf: zehn.filter((r) => r.conclusion === "success" && r.run_attempt > 1).length, abgebrochen: zehn.filter((r) => r.conclusion === "cancelled").length };
    })();
    const pListe = koord && TOKEN ? v("Messungen", () => api(`/contents/meisterkarte-quelle/punkte/messung?ref=${koord}`)) : null;
    const commits = await pCommits;
    R.stufen = commits.filter((c) => /Versions-Stufe/.test(c.commit.message)).map((c) => ({ sha: c.sha, t: new Date(c.commit.committer.date), titel: c.commit.message.split("\n")[0] }));
    // Qualität: Kopf (main) gegen den Vorkopf, je Gerät. Vorkopf = die jüngste ältere Versions-Stufe, deren Messung mindestens
    // die Hälfte der Stationen des Kopfs trägt (ein Einzel-Lauf wie 36c4275a-radeon mit 1 Station ist kein Vergleich), sonst die
    // jüngste mit Messung
    const liste = await pListe;
    const da = new Set((liste || []).map((x) => x.name));
    const lade = async (s, g) => { if (!da.has(`${s}-${g}.json`)) return null; const t = await v(`Messung ${s}-${g}`, () => datei(koord, `meisterkarte-quelle/punkte/messung/${s}-${g}.json`)); try { return t && JSON.parse(t); } catch (_e) { return null; } };
    const kopf = s8(main);
    R.qual = !liste ? [] : await Promise.all(["gtx", "radeon", "headless"].map(async (g) => {
        const k = await lade(kopf, g);
        const n = Object.keys((k && k.je) || {}).length;
        let vor = null, vm = null;
        for (const s of R.stufen.map((x) => s8(x.sha)).filter((s) => s !== kopf && da.has(`${s}-${g}.json`)).slice(0, 4)) {
            const m = await lade(s, g);
            if (!vor) [vor, vm] = [s, m];
            if (m && Object.keys(m.je || {}).length >= n / 2) { [vor, vm] = [s, m]; break; }
        }
        return { g, kopf, vor, k, v: vm };
    }));
    R.ci = await pCi;
    R.kandidaten = await pKand;
    R.wfStill = workflowStill(jetzt);
    [R.ps, R.blame, R.wackler] = await Promise.all([pPs, pBlame, pWackler, pTafel]);
    // DIE UHR (Seite 0): Stau, Veraltet, Kette, Balance aus denselben Quellen — WARTEND, stand.json, Zug-Logs, die Merges auf main, budget.txt
    const kNun = wertAm(budget, "karte", jetzt), k6 = wertAm(budget, "karte", new Date(+jetzt - 6 * 3600e3));
    const gelandet = [...new Set(commits.filter((c) => +jetzt - new Date(c.commit.committer.date) <= 6 * 3600e3).map((c) => (/^Merge (\S+) in integ-probe/.exec(c.commit.message) || [])[1]).filter(Boolean))];
    R.uhr = await v("Uhr", () => UHR.langsam({ W: R.W, SL0: R.SL0, standText: (sha) => datei(sha, STAND), api, rotSchritte, speicher, Z: R.tafel && R.tafel.zuege, zuege: R.zuege, ps: R.ps,
        abgaben: abgaben || [], gelandet, dPunkte: kNun != null && k6 != null ? kNun - k6 : null, karte: kNun, wandMin: R.tafel && R.tafel.fluss.wand, jetzt, v }));
    sichern();
    return R;
}

// ── Zeichnen: Kopf (Ampel + Reiter) auf jeder Seite, darunter die Seite ────────────────────────────────────────────────
const SEITEN = ["UHR", "JETZT", "KURS", "PLAN", "FRESSER"]; // Taste = Index: 0 UHR (die Startseite), 1–4 wie bisher
function ampelZeilen(S) {
    const lauf = S.runs.filter((r) => r.status === "in_progress"), warte = S.runs.filter((r) => r.status !== "in_progress");
    const ciRot = S.runs.reduce((s, r) => s + S.rotVon(r), 0);
    const g = S.logs && S.logs[0];
    // die Arbeit einer Geräte-Sitzung (zug/sitzung.txt) zählt wie ein Job: das Gerät ist nicht frei
    const sitz = (g) => { const s = (S.sitzungVon ? S.sitzungVon(g) : [])[0]; return s ? `Sitzung ${sitzungKurz(s)}` : null; };
    const lauerArbeit = S.lauer ? `Ruhe-Läufer ${/RUHE/.test(S.lauer.letzte) ? "misst" : "wartet"}` : null;
    // 10.11.: die Ampel sagte „OMEN frei“, während ihre Sitzung je Station die Mess-Datei pushte — sie liest jetzt die Lage der Uhr (EINE Wahrheit)
    const uhrMisst = (n) => { const u = S.uhr && S.uhr.geraete.find((g) => g.name === n); return u && u.zustand === "MISST" && !u.job ? (u.mess && !u.misst.length ? `misst (Mess-Datei ${hhmm(new Date(u.mess.t * 1000))})` : "misst") : null; };
    // 11.11.: die Ampel sagte „OMEN frei“, während gate:haus-welt 16 min unter gpu-lauf lief — das Schloss meldet seinen Halter (Puls), sonst BLIND
    const uhrHalter = (n) => { const u = S.uhr && S.uhr.geraete.find((g) => g.name === n); return !u ? null : u.halter ? UHR.belegtText(u.halter, Math.floor(+S.jetzt / 1000)) : u.zustand === "BLIND" ? "BLIND (kein Puls des Schlosses)" : null; };
    const a = [
        geraetAmpel("OMEN", S.omen, S.lO, S.jO, false, [sitz("omen"), uhrHalter("OMEN")].filter(Boolean).join(" · ") || uhrMisst("OMEN")),
        geraetAmpel("RADEON", S.radeon, S.lR, S.jR, false, [arbeitRadeon(S), sitz("radeon"), lauerArbeit, uhrHalter("RADEON")].filter(Boolean).join(" · ") || uhrMisst("RADEON")),
        S.l3 ? geraetAmpel("GTX1050", null, S.l3, S.j3, false, [sitz("gtx1050"), uhrHalter("GTX1050")].filter(Boolean).join(" · ") || uhrMisst("GTX1050")) : `${grau("●")} GTX1050 nicht registriert`,
        S.actions && S.actions !== "operational" ? `${rot("●")} CI ${rot("Actions " + S.actions)}` :
        `${ciRot ? rot("●") : S.runs.length ? gelb("●") : gruen("●")} CI ${lauf.length} läuft${warte.length ? ` · ${warte.length} wartet` : ""}${ciRot ? rot(` · ✗ ${ciRot} rot`) : ""}`,
        !g ? `${grau("●")} ZUG keine Logs` : g.tot ? `${rot("●")} ZUG ${g.name} ohne Prozess` : g.still ? `${grau("●")} ZUG ${g.name} still` : g.exit == null ? `${gelb("●")} ZUG ${g.name} läuft` : g.exit === 2 ? `${grau("●")} ZUG ${g.name} abgebrochen` : `${g.exit ? rot("●") : gruen("●")} ZUG ${g.name} EXIT=${g.exit}`,
        S.mk ? fett(gelb("★")) + ` ${S.mk.summe}/${S.mk.max}` : "★ ?",
    ];
    const text = a.join("  "); // in EINER Zeile, über der Breite in zwei
    return sicht(text).length <= BREITE ? [text] : [a.slice(0, 3).join("  "), a.slice(3).join("  ")];
}
function reiter(seite) {
    return SEITEN.map((s, i) => (i === seite ? fett(`[${i} ${s}]`) : grau(` ${i} ${s} `))).join(" ") + grau("  · Taste 0–4 · q beendet");
}
function fuss(S) {
    return grau(`Blick ${S.jetzt.toTimeString().slice(0, 8)}${EINMAL ? "" : ` · nächster ${new Date(+S.jetzt + TAKT_S * 1000).toTimeString().slice(0, 8)}`} · KURS/PLAN von ${hhmm(L.t)} · API ${S.api.rest}/${S.api.limit} · ${S.api.neu} neu, ${S.api.gleich}× 304`) + (TOKEN ? "" : rot(" · ohne Token: Jobs, Läufer, Cloud, Kandidaten ausgelassen"));
}

const seiteUhr = (S) => UHR.seite(S, L.uhr, T);
function seiteJetzt(S) {
    const out = [];
    out.push(grau(`main ${s8(S.main)}${S.version ? " · V" + S.version : ""} · Karte gebucht ${S.mk ? `${S.mk.stand} am ${S.mk.kopf}` : "?"} · koordination ${s8(S.koord)}`));
    out.push(`${os.hostname()}  CPU ${mini(S.cpu)} · RAM ${mini((100 * (os.totalmem() - os.freemem())) / os.totalmem())} · GPU ${S.ruht ? gelb("ruht: Messung") + grau(` (${S.ruht})`) : mini(S.gpu)} · ${grau("OMEN-Last nicht gemeldet")}`);
    // je Gerät zuerst die Aufträge seiner Sitzung (zug/sitzung.txt) mit dem Stand ihres Werkstücks
    const sitzZeilen = (g) => (S.sitzungVon ? S.sitzungVon(g) : []).map((s) => `  ${gelb("●")} Sitzung ${spalte(s.id, 14)} ${s.datei && s.datei.gemessen != null ? (s.n ? balken(s.datei.gemessen, s.n) : `${s.datei.gemessen} gemessen`) + grau(` · ${s.datei.ungemessen || 0} offen · Mess-Datei ${hhmm(s.datei.t)}`) : grau(s.mess ? "noch keine Mess-Datei" : s.text.slice(0, 60))}${grau(` · seit ${hhmm(s.t)}`)}`);
    out.push("", linie("OMEN · GTX 1060"), ...sitzZeilen("omen"), ...messplatzZeilen(S.omen, S.lO, S.jO, S.vO).filter((z) => !(S.sitzungVon && S.sitzungVon("omen").length && /Stationen-Datei: zuletzt .*alt \(/.test(z))));
    for (const a of S.offen.filter((a) => !S.omen || S.omen.zu || a.id !== S.omen.id)) out.push(`  ${grau("danach")}  ${a.prio} ${spalte(a.art, 6)} ${spalte(a.id, 14)} ${grau(auftragKurz(a))}`);
    const lauerZeile = S.lauer ? [`  ${gelb("●")} Ruhe-Läufer ${grau(`seit ${hhmm(S.lauer.start)}`)} · ${S.lauer.letzte ? S.lauer.letzte.slice(0, 90) : grau("noch keine Zeile")}`] : [];
    out.push("", linie("RADEON 890M · Laptop"), ...sitzZeilen("radeon"), ...lauerZeile, ...messplatzZeilen(S.radeon, S.lR, S.jR, S.vR, S.lokal).map((z) => z.replace(/^(\s*\S+ )frei · zuletzt /, "$1Stationen frei · zuletzt ")), ...werkbankZeilen(S));
    // DAS DRITTE GERÄT: keine Stationen-Datei, nur der Läufer (Job, Verlauf) und die Schlange der Proben, die auf gpu-probe warten
    const probeWarten = S.runs.filter((r) => /GPU-Probe/.test(r.name) && r.status !== "in_progress").length;
    out.push("", linie("DRITTES · GTX 1050 · Bild-Proben"));
    out.push(...sitzZeilen("gtx1050"));
    if (!S.l3) out.push(`  ${grau("Läufer gtx1050-desktop nicht registriert")}`);
    else {
        if (!S.j3 && S.l3.status === "online") out.push(`  ${(S.sitzungVon && S.sitzungVon("gtx1050").length) ? gelb("●") + " Läufer frei" : gruen("●") + " frei"}${probeWarten ? gelb(` · ${probeWarten} Proben warten`) : ""}`);
        else if (S.j3 && probeWarten) out.push(`  ${grau(`${probeWarten} Proben warten`)}`);
        out.push(...messplatzZeilen(null, S.l3, S.j3, S.v3).filter((z) => !/noch keine Zeile/.test(z)));
    }
    if (!S.logs || !S.logs.length) out.push("", linie(`ZUG · ${S.logs ? "keine fahre-/takt-Logs" : "Logs nur auf dem Laptop"}`));
    else {
        out.push("", linie("ZUG · Logs des Koordinators"));
        for (const g of S.logs) {
            const z = g.tot ? rot("○ tot   ") : g.still ? grau("○ still ") : g.exit == null ? gelb("● läuft ") : g.exit === 2 ? grau("○ Abbruch") : g.exit ? rot(`✗ EXIT=${g.exit}`) : gruen("✓ EXIT=0");
            out.push(`  ${spalte(z, 9)} ${spalte(g.name, 10)} ${grau(spalte(`${hhmm(g.t)} · vor ${dauer(S.jetzt - g.t)}`, 22))} ${urteilFarbe(g.letzte)}`);
        }
    }
    const lauf = S.runs.filter((r) => r.status === "in_progress"), warte = S.runs.filter((r) => r.status !== "in_progress");
    if (S.actions && S.actions !== "operational") out.push("", linie(`CI · GitHub Actions ${S.actions}`) + " " + rot("(githubstatus.com — ein Lauf mit 0 Jobs ist dann kein Urteil)"));
    else if (!S.runs.length) out.push("", linie("CI · nichts läuft"));
    else {
        out.push("", linie(`CI · ${lauf.length} läuft · ${warte.length} wartet`));
        for (const r of [...lauf, ...warte].slice(0, 5)) {
            const js = S.jobsVon(r);
            const zu = js.filter((j) => j.status === "completed").length;
            const rotN = S.rotVon(r);
            const gehostet = js.filter((j) => j.status === "in_progress" && !j.labels.includes("self-hosted")).length;
            const z = r.status !== "in_progress" ? grau("○") : rotN ? rot("●") : gelb("●");
            out.push(`  ${z} ${spalte((r.name !== "Code-Check" ? r.name + " " : "") + r.head_branch, 28)} ${grau(s8(r.head_sha))}  ${js.length ? balken(zu, js.length, 12) : r.status}${rotN ? " " + rot(`✗ ${rotN} rot`) : ""}${gehostet ? grau(` · ${gehostet} auf GitHub`) : ""}${grau(` · ${dauer(S.jetzt - new Date(r.run_started_at || r.created_at))}`)}${r.run_attempt > 1 ? grau(` · Versuch ${r.run_attempt}`) : ""}`);
            for (const j of js.filter((j) => j.status !== "completed" && j.labels.includes("self-hosted")))
                out.push(`      ${gelb("↳")} ${j.name} · ${j.status === "in_progress" ? `${j.runner_name} ${grau("seit " + hhmm(new Date(j.started_at)))}` : gelb(`wartet auf Läufer [${j.labels.join(",")}]`)}`);
        }
        if (S.runs.length > 5) out.push(grau(`  … ${S.runs.length - 5} weitere`));
    }
    const lu = S.luecke ? gelb(` · reicht nur bis ${hhmm(S.luecke)}`) : "";
    if (!TOKEN) out.push("", linie("CLOUD · ohne Token ausgelassen"));
    else if (!S.zweige.length) out.push("", linie(`CLOUD · kein Push in ${CLOUD_H} h`) + lu);
    else {
        out.push("", linie(`CLOUD · ${S.zweige.length} Zweige mit Push in ${CLOUD_H} h${S.zweige.length > 5 ? " · die jüngsten 5" : ""}`) + lu);
        for (const x of S.zweige.slice(0, 5)) out.push(`  ${grau(hhmm(x.t))}  ${spalte(x.z, 28)} ${grau(s8(x.sha))}  ${x.titel || ""}`);
    }
    const ab = (S.abgaben || []).filter((a) => S.jetzt - a.t <= CLOUD_H * 3600e3);
    out.push("", linie(S.abgaben ? `ABGABEN · ${ab.length} in ${CLOUD_H} h (Titel der Zweig-Köpfe → w3/abgabe.log)${ab.length > 5 ? " · die jüngsten 5" : ""}` : "ABGABEN · w3/abgabe.log fehlt"));
    return out.concat(ab.slice(0, 5).map((a) => `  ${grau(hhmm(a.t))}  ${spalte(a.zweig, 28)} ${grau(a.sha)}  ${a.titel}`));
}

// Kennzahlen für KURS und --kurz aus Budget und den langsamen Daten
function kurs(S) {
    const b = S.budget, j = S.jetzt;
    const K = { b };
    if (b.length) {
        K.t0 = b[0].t;
        K.karte = wertAm(b, "karte", j);
        K.woche = wertAm(b, "woche", j);
        const vorK = b.filter((x) => x.karte != null), vorW = b.filter((x) => x.woche != null);
        K.karteVor = vorK.length > 1 ? vorK[vorK.length - 2].karte : null;
        K.wocheVor = vorW.length > 1 ? vorW[vorW.length - 2].woche : null;
        K.brenn = brenn(b);
        const roh = vorW.length ? vorW[vorW.length - 1] : null;
        K.konto = roh ? { nr: roh.konto, roh: roh.roh } : null;
        // die 98-%-Grenze gilt dem laufenden Konto (roh), die Brenn-Rate ist über den Wechsel hinweg dieselbe
        if (K.brenn && K.brenn.rate > 0 && roh) K.ziel98 = roh.roh >= 98 ? "erreicht" : hhmm(new Date(+K.brenn.letzte.t + ((98 - roh.roh) / K.brenn.rate) * 3600e3));
    }
    // Züge je Tag: Versions-Stufen auf main seit Wochen-Start, dazu Punkte des Tages je Zug
    const tage = new Map();
    for (const s of [...(L.stufen || [])].reverse()) { const k = tag(s.t); if (!tage.has(k)) tage.set(k, { tag: k, d: new Date(s.t.getFullYear(), s.t.getMonth(), s.t.getDate()), n: 0 }); tage.get(k).n++; }
    K.tage = [...tage.values()].map((t) => {
        const ende = new Date(Math.min(+j, +t.d + 864e5));
        const k0 = wertAm(b, "karte", t.d), k1 = wertAm(b, "karte", ende);
        return { ...t, pkt: k0 != null && k1 != null ? k1 - k0 : null };
    });
    // Zug-Logs: im ersten Anlauf grün = der früheste Log einer Zug-Nummer landete ohne ROT davor
    const zg = (L.zuege || []).filter((z) => z.t >= (L.seit || 0));
    const je = new Map();
    for (const z of [...zg].sort((a, b) => (a.start || a.t) - (b.start || b.t))) if (z.nr && !je.has(z.nr)) je.set(z.nr, z);
    const erste = [...je.values()].filter((z) => !z.laeuft);
    K.ersterAnlauf = { gruen: erste.filter((z) => z.gelandet && !z.rot).length, n: erste.length };
    K.dsO = durchsatz(S.fort, j);
    K.dsR = durchsatz(S.fortR, j);
    return K;
}
// die Kippungen einer Messung gegen die Vor-Messung: + rot→grün, − grün→rot
function kippungen(q) {
    if (!q.k || !q.v) return null;
    const plus = [], minus = [];
    for (const [k, e] of Object.entries(q.k.je || {})) {
        const alt = (q.v.je || {})[k];
        if (!alt || alt.gruen === e.gruen) continue;
        (e.gruen ? plus : minus).push(k);
    }
    return { plus, minus };
}
const zaehle = (m) => { const e = Object.values((m && m.je) || {}); return { g: e.filter((x) => x.gruen).length, r: e.filter((x) => !x.gruen).length }; };

function seiteKurs(S) {
    const out = [];
    const K = kurs(S);
    const W = 60, T = L.tafel; // EFFIZIENZ zuerst: ihr BUDGET trägt ehrlich je % und die Brenn-Rate, „Punkte je %“ aus karte= ist tot (EINE Zahl)
    if (!T) out.push(linie("EFFIZIENZ · nicht gelesen (siehe FEHLER)"), "");
    else out.push(linie(`EFFIZIENZ · Konto seit ${T.budget.t0 ? `${tag(T.budget.t0)}. ${hhmm(T.budget.t0)}` : "?"} · kein Gesamt-Wert`) + (T.budget.notiz ? " " + grau(T.budget.notiz) : ""), ...tafelZeilen(T, K, S).map((z) => "  " + z), "");
    if (!K.t0) out.push(linie("KURS · zug/budget.txt fehlt oder ist leer"));
    else {
        out.push(linie(`KURS DER WOCHE · seit ${tag(K.t0)}. ${hhmm(K.t0)}`));
        const kw = K.b.filter((x) => x.karte != null).map((x) => x.karte);
        if (kw.length) out.push(`  Karte  ${spark(K.b, "karte", K.t0, S.jetzt, W, Math.min(...kw), Math.max(...kw))}  ${rechts(String(kw[0]), 3)} → ${rechts(String(K.karte), 3)} Pkt ${pfeil(K.karte, K.karteVor)}`);
        const wHoch = Math.max(100, ...K.b.filter((x) => x.woche != null).map((x) => x.woche));
        const kontoText = K.konto && K.konto.nr > 1 ? grau(`  (Konto ${K.konto.nr}: ${K.konto.roh} %)`) : "";
        out.push(`  Woche  ${grau(spark(K.b, "woche", K.t0, S.jetzt, W, 0, wHoch))}  ${rechts("0", 3)} → ${rechts(String(K.woche ?? "—"), 3)} %   ${pfeil(K.woche, K.wocheVor)}${kontoText}`);
        out.push(`         ${grau(achse(K.t0, S.jetzt, W))}`);
    }
    out.push("", linie("ZÜGE · Versions-Stufen auf main"));
    const nMax = Math.max(1, ...K.tage.map((t) => t.n));
    for (const t of K.tage) out.push(`  ${t.tag}  ${spalte("█".repeat(Math.round((t.n / nMax) * 12)), 12)}  ${rechts(String(t.n), 2)} Züge  ${rechts(t.pkt == null ? "—" : (t.pkt >= 0 ? "+" : "") + t.pkt, 4)} Pkt  ${rechts(t.pkt == null || !t.n ? "—" : zk(t.pkt / t.n), 5)} je Zug`);
    if (!K.tage.length) out.push(grau("  keine Versions-Stufe seit Wochen-Start"));
    for (const z of (L.zuege || []).slice(0, 5)) {
        const u = z.laeuft ? gelb("● läuft    ") : z.gelandet && !z.rot ? gruen("✓ gelandet ") : z.gelandet ? gelb("✓ nach ROT ") : z.rot || z.exit ? rot("✗ ROT      ") : grau("○ ohne EXIT");
        const min = z.laeuft && z.start ? (S.jetzt - z.start) / 60000 : z.min; // eine laufende Kette zählt bis jetzt
        out.push(`  ${spalte(z.name, 6)} ${grau(z.start ? hhmm(z.start) : "--:--")}  ${u} ${rechts(min == null ? "—" : String(Math.round(min)), 4)} min`);
    }
    const ea = K.ersterAnlauf;
    out.push(`  im ersten Anlauf grün  ${ampelWert(ea.n ? ea.gruen / ea.n : null, 0.8, 0.5)(`${ea.gruen} von ${ea.n}`)} Zug-Nummern`);
    out.push("", linie("TAKT"));
    const c = L.ci;
    out.push(`  ${spalte("CI integ-probe", 14)}  ${c && c.n ? `${c.n}× · Wand p50 ${zk(c.p50, 0)} · p95 ${zk(c.p95, 0)} min · rot ${ampelWert(c.n ? 1 - c.rot / c.n : null, 0.9, 0.7)(`${c.rot}/${c.n}`)} · Wackler ${c.wackler} · Neulauf ✓ ${c.neulauf}${c.abgebrochen ? grau(` · abgebr. ${c.abgebrochen}`) : ""}` : grau("keine Daten")}`);
    for (const [n, d] of [["OMEN", K.dsO], ["RADEON", K.dsR]]) if (d) out.push(`  ${spalte(n, 14)}  ${rechts(zk(d.proH), 5)} Stationen/h · Mittel ${rechts(zk(d.mittel), 5)} min ${grau(`(letzte ${d.n})`)}`);
    out.push("", linie(`QUALITÄT · Kopf ${s8(S.main)} gegen Vorkopf je Gerät`));
    if (!L.qual || !L.qual.length) out.push(grau("  keine Messungen gelesen"));
    for (const q of L.qual || []) {
        const kz = zaehle(q.k), vz = zaehle(q.v), kp = kippungen(q);
        const kopfZ = `  ${spalte(q.g.toUpperCase(), 9)} ${q.k ? `${rechts(String(kz.g), 3)} ${gruen("✓")} ${rechts(String(kz.r), 3)} ${rot("✗")}` : grau("ungemessen ")}  ${q.v ? grau(`gegen ${q.vor}`) + ` ${rechts(String(vz.g), 3)} ✓ ${rechts(String(vz.r), 3)} ✗` : grau("ohne Vorkopf")}  `;
        const namen = kp ? [...kp.plus.map((k) => gruen("+ " + k)), ...kp.minus.map((k) => rot("− " + k))].slice(0, 6) : [];
        // Kippungen mit Namen, so viele die Zeile fasst (höchstens 6), der Rest als Zahl
        const rest = (kp ? kp.plus.length + kp.minus.length : 0);
        let zeile = kopfZ, n = 0;
        for (const x of namen) { if (sicht(zeile + x).length + 6 > BREITE) break; zeile += (n ? grau(" · ") : "") + x; n++; }
        out.push(zeile + (rest > n ? grau(` +${rest - n}`) : ""));
    }
    return out;
}

function seitePlan(S) {
    const out = [];
    const farbeZ = (z) => (z === "läuft" ? gelb("● läuft ") : z === "wartet" ? "◔ wartet" : z === "danach" ? grau("○ danach") : grau("○ offen "));
    const zeile = (z, was, detail, wer, ziel) => [`  ${farbeZ(z)}  ${spalte(fett(was), 18)} ${detail}`, `  ${" ".repeat(10)}${spalte("", 18)} ${grau([wer, ziel && "Ziel " + ziel].filter(Boolean).join(" · "))}`];
    const W = L.W, wann = (t) => grau(`${tag(t)}. ${hhmm(t)}`); // WARTEND zuerst, jeder Zweig beim Namen; ✓ grün = sein Abgabe-Kopf ist Kandidat
    if (!W) out.push(linie("WARTEND · nicht gelesen (w3/abgabe.log, git — siehe FEHLER)"), "");
    else out.push(linie(`WARTEND · ${W.wartend.length} Abgaben (48 h), Inhalt nicht im Ziel · ${W.abgeloest.length} abgelöst · gegen origin/main ${s8(W.main)}, -pm origin/punkte-maschine ${s8(W.pm)}`) + (S.main && S.main !== W.main ? gelb(` · lokal ≠ main ${s8(S.main)}: git fetch`) : ""),
        ...W.wartend.map((a) => `  ${wann(a.t)}  ${spalte(a.zweig, 28)} ${grau(s8(a.sha))} ${rechts(a.vor == null ? "+?" : "+" + a.vor, 4)}${a.pm ? grau(" pm") : ""}${(L.kandidaten || []).some((k) => k.sha.startsWith(a.sha)) ? gruen(" ✓ grün") : ""}  ${a.titel}`),
        ...W.abgeloest.slice(-5).map((a) => `  ${wann(a.t)}  ${spalte(a.zweig, 28)} ${grau("abgelöst: " + a.grund)}`), "");
    out.push(linie("PLAN · zug/plan.txt"));
    if (!S.plan.length) out.push(grau("  zug/plan.txt fehlt oder ist leer"));
    for (const p of S.plan) out.push(...zeile(p.zustand, p.was, p.detail, p.wer, p.ziel));
    // dazu automatisch, was der Plan noch nicht nennt: laufende Ketten, wartende Zweige ($TEMP/claude/<zug>-zweig.txt), OMEN-Schlange
    const genannt = (x) => S.plan.some((p) => p.was === x || p.was.split(/\s+/)[0] === x);
    const auto = [];
    for (const z of (L.zuege || []).filter((z) => z.laeuft && !genannt(z.name))) auto.push(zeile("läuft", z.name, `seit ${z.start ? hhmm(z.start) : "?"} (${Math.round(z.min || 0)} min)`, "fahre.sh", ""));
    let wz = [];
    try { wz = fs.readdirSync(TEMP_CLAUDE).filter((n) => /^z\d+\w*-zweig\.txt$/.test(n)); } catch (_e) { /* nur auf dem Laptop */ }
    for (const n of wz) { const z = n.replace(/-zweig\.txt$/, ""); if (!genannt(z)) auto.push(zeile("wartet", z, fs.readFileSync(path.join(TEMP_CLAUDE, n), "utf8").trim(), "fahre.sh", "")); }
    for (const a of S.offen.filter((a) => !genannt(a.id) && !(S.omen && !S.omen.zu && S.omen.id === a.id))) auto.push(zeile("offen", a.id, auftragKurz(a), `OMEN prio ${a.prio}`, ""));
    if (auto.length) out.push("", linie("DAZU · Ketten, Zweige, OMEN-Schlange"), ...auto.flat());
    const k = L.kandidaten && L.kandidaten.filter((x) => !W || ![...W.wartend, ...W.abgeloest].some((a) => a.zweig === x.z)); // die WARTEND nicht nennt
    if (!k) out.push("", linie(TOKEN ? "KANDIDATEN · nicht gelesen" : "KANDIDATEN · ohne Token ausgelassen"));
    else if (!k.length) out.push("", linie("KANDIDATEN · kein grüner Zweig ohne Abgabe außerhalb von main (48 h)"));
    else {
        out.push("", linie(`KANDIDATEN · ${k.length} grün ohne Abgabe, nicht in main, Kopf ≤ 48 h`));
        for (const x of k.slice(0, 10)) out.push(`  ${gruen("✓ bereit")}  ${spalte(x.z, 28)} ${grau(s8(x.sha))} ${rechts("+" + x.vor, 4)}  ${grau(hhmm(x.t) + " " + tag(x.t))}  ${x.titel}`);
        if (k.length > 10) out.push(grau(`  … ${k.length - 10} weitere`));
    }
    return out;
}

// --kurz: alles Wichtige in ≤ 25 Zeilen, ohne Farbe und Balken (ein Aufruf statt Logs, ls-remote und CI-API je Wecken)
function kurzText(S) {
    const K = kurs(S);
    const o = [];
    o.push(`Blick ${S.jetzt.toTimeString().slice(0, 5)} · main ${s8(S.main)} V${S.version || "?"} · koordination ${s8(S.koord)} · Karte ${S.mk ? `${S.mk.summe}/${S.mk.max}` : "?"}`);
    o.push(ampelZeilen(S).join("  ").replace(/●|★/g, "").replace(/\s{2,}/g, " | ").trim());
    o.push(UHR.kurz(S.uhr, L.uhr)); // die Uhr oben: die 25-Zeilen-Grenze schneidet unten
    const fe = [...S.fehler, ...L.fehler]; // oben: die 25-Zeilen-Grenze schneidet unten
    if (fe.length) o.push(`FEHLER ${fe.join(" · ")}`);
    const st = (mp) => (mp && mp.stand ? ` · zuletzt ${mp.stand.station} ${mp.stand.wort} ${zk(mp.stand.min)} (${mp.stand.zeit})` : "");
    const danach = S.offen.filter((a) => !S.omen || S.omen.zu || a.id !== S.omen.id);
    o.push(`OMEN ${!S.omen ? "keine Zeile" : S.omen.zu ? `frei · zuletzt ${S.omen.id}: ${S.omen.zu}` : `${S.omen.id}${S.omen.stand ? ` ${S.omen.stand.i}/${S.omen.stand.n}` : ""}${S.omen.start ? ` seit ${S.omen.start.zeit.slice(0, 5)}` : ""}${S.omen.eta ? ` · Ende ≈ ${hhmm(S.omen.eta)}` : ""}${st(S.omen)}`}${danach.length ? ` · danach: ${danach.map((a) => a.id).join(", ")}` : ""}`);
    o.push(`RADEON ${!S.radeon ? "keine Zeile" : S.radeon.zu ? `frei · zuletzt ${S.radeon.id}: ${S.radeon.zu}` : `${S.radeon.id} ${S.radeon.stand ? `${S.radeon.stand.i}/${S.radeon.stand.n}` : ""}${st(S.radeon)}`}${S.ruht ? ` · GPU ruht (${S.ruht})` : ""}`);
    for (const [g, v] of [["OMEN", S.vO], ["RADEON", S.vR]]) if (v.length) o.push(`  ${g} Aufträge: ${v.slice(0, 3).map((x) => `${hhmm(x.ende)} ${x.lauf}/${x.name} ${x.zweig} ${x.wort}`).join(" · ")}`);
    for (const p of S.lokal) o.push(`  RADEON misst ${s8(p.sha)} ${p.geraet} (punkte.cjs run${p.offen ? " --offen" : ""}, seit ${hhmm(p.start)})`);
    if (S.logs) o.push(`ZUG ${S.logs.map((g) => `${g.name} ${g.still ? "still" : g.exit == null ? "läuft" : "EXIT=" + g.exit} (${hhmm(g.t)})`).join(" · ")}`);
    if (S.logs && S.logs[0]) o.push(`  ${S.logs[0].name}: ${S.logs[0].letzte}`);
    o.push(`CI ${S.runs.length ? S.runs.slice(0, 4).map((r) => { const js = S.jobsVon(r); return `${r.head_branch} ${js.filter((j) => j.status === "completed").length}/${js.length}${S.rotVon(r) ? ` rot ${S.rotVon(r)}` : ""}${r.status !== "in_progress" ? " wartet" : ""}`; }).join(" · ") : "nichts läuft"}`);
    if (L.tafel) o.push(...tafelZeilen(L.tafel, K, S).map((z) => z.replace(/ {2,}/g, " ")));
    const c = L.ci || {};
    o.push(`ZÜGE ${K.tage.map((t) => `${t.tag} ${t.n}`).join(" · ") || "keine"} · erster Anlauf grün ${K.ersterAnlauf.gruen}/${K.ersterAnlauf.n} · CI integ p50 ${zk(c.p50, 0)}/p95 ${zk(c.p95, 0)} min · rot ${c.rot ?? "?"}/${c.n ?? "?"} (Wackler ${c.wackler ?? "?"})`);
    if (K.dsO) o.push(`OMEN-DURCHSATZ ${zk(K.dsO.proH)} Stationen/h · Mittel ${zk(K.dsO.mittel)} min`);
    if ((L.qual || []).length) o.push("QUAL " + L.qual.map((q) => { const kz = zaehle(q.k), kp = kippungen(q); return `${q.g} ${q.k ? `${kz.g}/${kz.r}` : "ungemessen"}${q.v ? ` gegen ${q.vor}` : ""}${kp && (kp.plus.length || kp.minus.length) ? `: ${[...kp.plus.map((k) => "+" + k), ...kp.minus.map((k) => "-" + k)].slice(0, 4).join(" ")}` : ""}`; }).join(" · "));
    for (const p of S.plan.filter((p) => p.zustand !== "offen").slice(0, 4)) o.push(`PLAN ${p.zustand} ${p.was} · ${p.detail}`);
    const W = L.W, gr = (L.kandidaten || []).filter((x) => !W || ![...W.wartend, ...W.abgeloest].some((a) => a.zweig === x.z));
    if (W) o.push(`WARTEND ${W.wartend.length}: ${W.wartend.map((a) => `${a.zweig} +${a.vor ?? "?"}${a.pm ? " pm" : ""} (${seitText(a.t, S.jetzt)})`).join(" · ") || "keiner"}${W.abgeloest.length ? ` · abgelöst ${W.abgeloest.length}` : ""}${gr.length ? ` · grün ohne Abgabe ${gr.length}: ${gr.slice(0, 3).map((x) => x.z).join(", ")}` : ""}`);
    const ab = (S.abgaben || []).filter((a) => S.jetzt - a.t <= CLOUD_H * 3600e3); if (S.abgaben) o.push(`ABGABEN ${CLOUD_H} h ${ab.length}${ab.length ? ": " + ab.slice(0, 5).map((a) => `${a.zweig} ${hhmm(a.t)}`).join(" · ") : ""}`);
    for (const x of fresser(S).slice(0, 2)) o.push(`FRESSER ${x.rot ? "ROT " : ""}${x.was} · seit ${seitText(x.seit, S.jetzt)} · ${x.kosten} · ${x.tun}`);
    return o.slice(0, 25).join("\n");
}

let stand = null;
let seite = 0;
function zeichne() {
    if (!stand) return;
    const S = stand;
    if (KURZ) return void process.stdout.write(kurzText(S) + "\n");
    const fe = [...S.fehler, ...L.fehler.map((e) => "KURS/PLAN " + e)];
    const fehlerZ = fe.length ? ["", rot("FEHLER (nächster Versuch im nächsten Takt):"), ...fe.map((e) => "  " + rot(e))] : [];
    const kopf = [...ampelZeilen(S), UHR.kopf(S.uhr, L.uhr, T)]; // die drei Zahlen der Uhr auf jeder Seite
    const koerper = [seiteUhr, seiteJetzt, seiteKurs, seitePlan, seiteFresser];
    let out;
    if (EINMAL || !process.stdout.isTTY) out = [...kopf, ...koerper.flatMap((s, i) => ["", grau(`════ ${i} ${SEITEN[i]} ════`), ...s(S)]), ...fehlerZ, "", fuss(S)];
    else {
        const k = koerper[seite](S);
        const platz = SEITE_MAX - kopf.length - 3 - fehlerZ.length; // eine Seite ≤ SEITE_MAX Zeilen
        out = [...kopf, reiter(seite), ...(k.length > platz ? [...k.slice(0, platz - 1), grau(`  … ${k.length - platz + 1} Zeilen mehr`)] : k), ...fehlerZ, "", fuss(S)];
    }
    // Bild statt Bildlauf: im Terminal der zweite Schirm, je Bild Cursor oben links, jede Zeile bis zum Rand und der Rest darunter gelöscht —
    // EIN write, nie \x1b[2J (es schob in Windows Terminal jedes Bild in den Verlauf: die mehrfachen Köpfe, gefunden in w22-blick)
    const tty = process.stdout.isTTY && !EINMAL; process.stdout.write((tty ? "\x1b[H" : "") + out.map((z) => kappe(z) + (tty ? "\x1b[K" : "")).join("\n") + "\n" + (tty ? "\x1b[J" : ""));
}
if (process.stdout.isTTY && !EINMAL) { process.stdout.write("\x1b[?1049h\x1b[H\x1b[J"); process.on("exit", () => process.stdout.write("\x1b[?1049l")); }

// Tasten: 0–4 wählen die Seite und zeichnen aus dem Stand (keine Abfrage), q oder Strg+C beendet
if (process.stdin.isTTY && process.stdout.isTTY && !EINMAL) {
    process.stdin.setRawMode(true);
    process.stdin.resume();
    process.stdin.on("data", (d) => {
        const k = String(d);
        if (k === "q" || k === "\u0003") { process.stdin.setRawMode(false); process.exit(0); }
        const i = "01234".indexOf(k);
        if (i >= 0 && i !== seite) { seite = i; zeichne(); }
    });
}
// DIE UHR ZÄHLT (Seite 0): je Sekunde neu gezeichnet aus dem Stand — keine Abfrage, nur die Urteile zur Uhrzeit
if (process.stdout.isTTY && !EINMAL) setInterval(() => { if (seite === 0 && stand && L) zeichne(); }, 1000);
// SELBSTTEST der Tafel an einer nachgebauten Welt (aus w22-blick): ungemessen nie Ertrag, ein Rückfall zieht je Stufe einmal ab, z2w (Wackler-Neulauf,
// baut neu) macht z2 grün und ist kein eigener Zug, z4 ohne Kandidat zählt nicht, CI-Minuten fehlen ehrlich, die Notiz trägt keine Werte, die Abgaben laufen über Mitternacht zurück
function selbsttest() {
    const d = fs.mkdtempSync(path.join(os.tmpdir(), "blick-selbsttest-")), j = Date.now(), fehler = [], h = 3600e3, hms = (ms) => new Date(j - ms).toTimeString().slice(0, 8);
    const iso = (ms) => { const x = new Date(j - ms); return `${x.getFullYear()}-${String(x.getMonth() + 1).padStart(2, "0")}-${String(x.getDate()).padStart(2, "0")}T${x.toTimeString().slice(0, 5)}`; };
    const log = (n, a, zweig, k, e, urteil) => fs.writeFileSync(path.join(d, `fahre-${n}.log`), [a && `${hms(a)} [${n}] bau gegen main`, zweig && `  drin ${zweig}`, k && `${hms(a - 60e3)} [${n}] Kandidat ${k.repeat(40)} (Werkzeug=0)`, `${hms(e)} [${n}] ${urteil}`].filter(Boolean).join("\n") + "\n");
    log("z1", 3 * h, "w1-a@11111111", "a", 2.5 * h, "GELANDET aaaa → main"), log("z2", 2 * h, "w1-b@22222222", "b", h, "FAHRT ROT urteil: ROT"), log("z2w", h / 2 + 12e4, 0, "b", h / 2, "GELANDET bbbb nach Neulauf");
    log("z3", h / 3, "w1-c@33333333", "c", h / 6, "FAHRT ROT urteil: ROT"), log("z4", h / 4, 0, 0, h / 4 - 1e4, "FAHRT ROT bau: kein Kandidat");
    const b = budgetVon(`${iso(30 * h)} woche=50 karte=100\n${iso(26 * h)} woche=90 karte=100 (Konto 1)\n${iso(5 * h)} woche=0 konto=neu karte=100 (Konto 2)\n${iso(h)} woche=10 karte=102 (Konto 2; woche=99 in der Notiz)\n`);
    const st = (je, rueckfall, a) => standKurz({ kopf: "k", je, rueckfall, pflicht: { eintraege: [{ id: "A", gruen: a, gesamt: 8 }, { id: "F", gruen: 0, gesamt: 0 }] } }, new Date(j));
    const c1 = { "c.K1": { punkte: 1, stationen: [{ id: "c.K1#1", gruen: true }] } }; const S1 = st({ "a.K1": { punkte: 2, stationen: [{ id: "a.K1#1", gruen: true }, { id: "a.K1#2", gruen: true, ungemessen: true }] }, "b.K1": { punkte: 1, stationen: [{ id: "b.K1#1", gruen: true }] }, ...c1 }, ["b.K1#1 gtx: Bild 51 ms", "b.K1#1 radeon: Bild 40 ms"], 2), S0 = st(c1, [], 1);
    const A = [["w1-d", h], ["w1-b", 3.5 * h], ["w1-a", 4 * h]].map(([zweig, ms]) => ({ t: new Date(j - ms), zweig }));
    const T = tafelZahlen({ b, St: { jetzt: S1, start: S0, vor24: S0 }, zuege: zugLaeufe(new Date(j), d), abgaben: A, wartend: [], ci: { z1: 100, z3: 300 }, jetzt: new Date(j) });
    const ist = { gebucht: T.ertrag.gebucht, ehrlich: T.ertrag.ehrlich, d24: T.ertrag.d24, rueck: T.ertrag.rueckfall.join(), pflicht: T.pflicht.map((e) => e.id + e.d).join(), konto: T.budget.konto, jeKonto: T.budget.jeKonto, je24: T.budget.je24,
        jeLandung: T.budget.jeLandung, gruen: T.fluss.gruen, rot: T.fluss.rot, wand: Math.round(T.fluss.wand), al: Math.round(T.fluss.al), ci: T.fluss.ci, nCi: `${T.fluss.nCi}/${T.fluss.fertig.length}` };
    const soll = { gebucht: 4, ehrlich: 2, d24: 1, rueck: "b.K1#1", pflicht: "A1", konto: 10, jeKonto: 0.1, je24: 0.1, jeLandung: 5, gruen: 2, rot: 1, wand: 30, al: 135, ci: 200, nCi: "2/3" }; for (const k of Object.keys(soll)) if (ist[k] !== soll[k]) fehler.push(`${k}: ${ist[k]} statt ${soll[k]}`);
    const ab = path.join(d, "abgabe.log"), um = new Date(2026, 10, 8, 0, 30); fs.writeFileSync(ab, "23:50 ABGABE w1-x aaaa1111 Abgabe w1-x: eins\n00:10 wip w1-y cccc3333 Decke\n00:20 ABGABE w1-y bbbb2222 Abgabe w1-y: zwei\n"), fs.utimesSync(ab, um, um);
    const al = (abgabenVon(new Date(+um + 1800e3), ab) || []).map((a) => `${a.zweig} ${tag(a.t)} ${hhmm(a.t)} ${a.titel}`).join(" · "); if (al !== "w1-y 08.11 00:20 zwei · w1-x 07.11 23:50 eins") fehler.push("Abgaben über Mitternacht: " + al);
    // (09.11.) DIE VERKNÜPFUNGEN DES BLICKS — je Fall die Mutante, die der alte Leser war, ROT beim Namen:
    // (V1) erledigt.txt in der Datums-Form schließt seine id, eine Zwischenzeile nicht (alt: der Schlüssel war das Datum)
    const E = erledigtVon("omen-a GRÜN 1/1\n2026-11-09 20:10 gtx-x Scheibe 1/4: 8 grün\n2026-11-09 20:12 gtx-y Zwischenstand 3 grün\n2026-11-09 21:30 gtx-z 30 grün / 4 rot\n");
    if (!(E.has("omen-a") && E.has("gtx-z") && !E.has("gtx-x") && !E.has("gtx-y") && !E.has("2026-11-09"))) fehler.push("erledigt.txt (V1): " + [...E.keys()].join(","));
    // (V2) ein Zug-Log ohne Urteil läuft nur mit Prozess; die Kette zählt, das Abgebrochene nie (alt: 2-h-Uhr)
    const P = [{ cmd: "bash zug-schlange6.sh z350w z351:w26-stadt-takt-4b" }, { cmd: "bash zug-weiter3.sh z350" }];
    const lebt = [zugLebt("z351", P), zugLebt("z350w", P), zugLebt("z352", P), zugLebt("z35", P), zugLebt("z351", [])].join();
    if (lebt !== "true,true,false,false,false") fehler.push("Zug lebt (V2): " + lebt);
    // (V3) der Blick schreibt Abgaben; schrieb zuletzt ein früherer Tag, liest sich die alte Zeile nicht als heute (alt: kein Schreiber, 27 h blind)
    const ab2 = path.join(d, "abgabe2.log"), gestern = new Date(2026, 10, 8, 16, 40), heute = new Date(2026, 10, 9, 19, 50);
    fs.writeFileSync(ab2, "16:30 ABGABE w1-alt dddd4444 Abgabe w1-alt: gestern\n"), fs.utimesSync(ab2, gestern, gestern);
    const nS = abgabeSchreiben([{ z: "w1-neu", sha: "eeee5555ffff", t: new Date(2026, 10, 9, 19, 38), titel: "Abgabe w1-neu: heute" }, { z: "w1-wip", sha: "1234abcd", t: new Date(2026, 10, 9, 19, 40), titel: "WIP w1-wip" }], heute, ab2);
    fs.utimesSync(ab2, heute, heute); // 10.11.: das Anhängen setzt die Datei-Zeit auf die ECHTE Uhr — der Fall schrieb „heute“ (am 09.11. grün, danach rot)
    const a2 = (abgabenVon(heute, ab2) || []).map((a) => `${a.zweig} ${tag(a.t)} ${hhmm(a.t)}`).join(" · ");
    if (nS !== 2 || a2 !== "w1-neu 09.11 19:38 · w1-alt 08.11 16:30" || abgabeSchreiben([{ z: "w1-neu", sha: "eeee5555ffff", t: heute, titel: "Abgabe w1-neu: heute" }], heute, ab2) !== 0) fehler.push(`Abgaben-Schreiber (V3): ${nS} Zeilen · ${a2}`);
    // (V4, 10.11.) DIE ABGABEN AUS DEN KÖPFEN: ein Kopf „Abgabe …“ ≤ 48 h wartet, auch wenn w3/abgabe.log ihn nie sah (alt: w26-ferne-ton stand als
    // „grün ohne Abgabe“); der claude/-Spiegel, ein WIP-Kopf, ein Kopf über 48 h und heim-* nie
    const refs = [["w26-ferne-ton", "a", "Abgabe w26-ferne-ton: eins", 20 * h], ["claude/w26-ferne-ton", "a", "Abgabe w26-ferne-ton: eins", 20 * h], ["w27-wip", "b", "WIP w27-wip: zwei", h], ["w25-alt", "c", "Abgabe w25-alt: drei", 49 * h], ["heim-z9", "e", "Abgabe heim-z9: vier", h]]
        .map(([name, x, messageHeadline, ms]) => ({ name, target: { oid: x.repeat(40), messageHeadline, committedDate: new Date(j - ms).toISOString() } }));
    const aR = abgabenAusRefs(refs, new Date(j)).map((a) => `${a.zweig} ${a.titel}`).join(" · ");
    if (aR !== "w26-ferne-ton eins") fehler.push("Abgaben aus den Köpfen (V4): " + aR);
    // (V5) DIE UHR (messplatz-uhr.cjs): ihre Fälle grün, jede Mutante ROT
    const pu = UHR.pruefe();
    if (pu.rot.length) fehler.push("Uhr (V5): " + pu.rot.join(" · "));
    fs.rmSync(d, { recursive: true, force: true }); console.log(fehler.length ? "messplatz-blick SELBSTTEST ROT: " + fehler.join(" · ") : `messplatz-blick Selbsttest grün: Tafel (ungemessen nie Ertrag, Rückfall zieht ab, Neulauf grün, ohne Kandidat kein Zug, Notiz ohne Werte), Abgaben über Mitternacht, Abgaben aus den Köpfen, Uhr ${pu.faelle} Fälle / ${Object.keys(pu.je).length} Mutanten ROT`);
    process.exitCode = fehler.length ? 1 : 0;
}
// DER BLICK ÜBERNIMMT NEUEN CODE SELBST (14.11.): das Fenster fuhr seit 13.11. 15:56 den Code jenes Tages — „zug-dienst läuft nicht“,
// während er lebte, drei Geräte BLIND, während ihr Puls ankam; jede Heilung der Nacht war installiert und keiner las sie. Ändert sich
// eine der eigenen Dateien am laufenden Ort (start.sh installiert), endet der Prozess mit Exit 0 — blick-fenster.sh startet ihn in 3 s neu.
const EIGEN = ["messplatz-blick.cjs", "messplatz-uhr.cjs", "rot-text.cjs", "richter-werk.cjs"].map((n) => path.join(__dirname, n));
const eigenStand = () => EIGEN.map((f) => { try { const s = fs.statSync(f); return s.size + ":" + s.mtimeMs; } catch (_e) { return "-"; } }).join("|");
const EIGEN_START = eigenStand();
if (SELBSTTEST) selbsttest();
else (async function schleife() {
    if (!EINMAL && eigenStand() !== EIGEN_START) { console.log(`messplatz-blick: neuer Code installiert (${new Date().toTimeString().slice(0, 8)}) — Neustart`); process.exit(0); }
    try {
        stand = await holen();
        zeichne();
        // DER PULS DES BLICKS (31.10.: der Blick endete um 08:42 und stand 6 h als letztes Bild im Tab, niemand merkte es): jeder Takt
        // schreibt $TEMP/claude/w3/blick.puls, die Wache des Koordinators (w3/wache-w4.cjs) meldet einen Puls älter als 6 min
        if (!EINMAL) try { fs.writeFileSync(path.join(TEMP_CLAUDE, "w3", "blick.puls"), new Date().toISOString()); } catch (_e) { /* ohne w3 kein Puls */ }
    } catch (e) {
        console.log(`messplatz-blick FEHLER ${new Date().toTimeString().slice(0, 8)}: ${e.stack || e.message} — nächster Takt in ${TAKT_S} s`);
    }
    if (!EINMAL) setTimeout(schleife, TAKT_S * 1000);
    else if (process.stdin.isTTY) process.stdin.pause();
})();
