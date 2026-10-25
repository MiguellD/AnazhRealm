#!/usr/bin/env node
"use strict";
// messplatz-blick.cjs — was die Messplätze, der Zug und die CI tun, als Text, alle 60 s (Rumpf von messplatz-blick.sh).
// Vier Seiten, Taste 1–4, q beendet (ohne TTY oder mit --einmal alle nacheinander; --kurz ≤ 25 Zeilen für den Koordinator):
// JETZT — Ampel, OMEN (zug/fortschritt.txt + offene Warteschlange), Radeon (zug/fortschritt-radeon.txt, zug.sh punkte schreibt
//         sie), Logs des Koordinators ($TEMP/claude), laufende Runs mit Jobs und Läufer, Zweige mit Push in 6 h, Last.
// KURS  — Punkte- und Wochen-Kurve aus koordination zug/budget.txt, Punkte je %, Brenn-Rate, Züge je Tag (Versions-Stufen auf
//         main), Durchlauf je Zug (fahre-*.log), CI-Takt integ-probe, OMEN-Durchsatz, Qualität Kopf gegen Vorkopf je Gerät.
// PLAN  — zug/plan.txt, laufende/wartende Ketten, offene OMEN-Aufträge, Kandidaten (grün, nicht in main, Push in 48 h).
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

const REPO = "MiguellD/AnazhRealm";
const API = `https://api.github.com/repos/${REPO}`;
const ROH = `https://raw.githubusercontent.com/${REPO}`;
const TOKEN = process.env.TOKEN || "";
const args = process.argv.slice(2);
const KURZ = args.includes("--kurz");
const EINMAL = args.includes("--einmal") || KURZ;
const TAKT_S = Math.max(60, Number(args[args.indexOf("--takt") + 1]) || 60);
const LANGSAM_TAKTE = 5; // KURS und PLAN ändern sich in Minuten: jeder 5. Takt holt sie
const STILL_MIN = 30; // so lange ohne Zeile, während ein Auftrag läuft, heißt der Blick „still"
const LOG_STILL_H = 2; // ein Log ohne EXIT, das so lange nichts schrieb, läuft nicht mehr (ein Zug braucht ~40 min)
const HAENGER_MIN = 30; // FRESSER: so lange still heißt Hänger (Prozess-Ausgabe, Log, Workflow-Protokoll)
const TEMP_CLAUDE = path.join(process.env.TEMP || os.tmpdir(), "claude"); // Logs des Koordinators und das GPU-Schloss
const CLOUD_H = 6;
const CLOUD_AUS = /^(heim-|integ-)|^(koordination|punkte-maschine)$/;
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
// Run-Id:Versuch → rote Jobs [{name, schritt}]; abgeschlossene Runs ändern sich nie, darum auf der Platte (--kurz ist je Aufruf
// ein neuer Prozess: ohne Platte holte jeder Aufruf die roten Jobs von 24 h neu, gemessen 59 s)
const ROTJOBS_DATEI = path.join(os.tmpdir(), "messplatz-blick-rotjobs.json");
const rotJobs = new Map((() => { try { return Object.entries(JSON.parse(fs.readFileSync(ROTJOBS_DATEI, "utf8"))); } catch (_e) { return []; } })());
const rotJobsSichern = () => { try { fs.writeFileSync(ROTJOBS_DATEI, JSON.stringify(Object.fromEntries([...rotJobs].slice(-600)))); } catch (_e) { /* nur ein Zwischenspeicher */ } };
const rotUnterwegs = new Map(); // dieselbe Abfrage aus CI-Takt und Wackler zugleich geht EINMAL hinaus
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

// ── Lesen: Fortschritt, Warteschlange, Budget, Plan ──────────────────────────────────────────────────────────────────
// eine Fortschritts-Zeile: `<datum> <zeit> <id> <rest>` (Ortszeit des Schreibers; OMEN und Laptop teilen die Zone)
function zeilenVon(text) {
    return String(text || "").split(/\r?\n/).map((l) => /^(\d{4}-\d\d-\d\d) (\d\d:\d\d:\d\d) (\S+) (.*)$/.exec(l))
        .filter(Boolean).map((m) => ({ t: new Date(`${m[1]}T${m[2]}`), zeit: m[2], id: m[3], rest: m[4] }));
}
// die Warteschlange wie der Dienst: offen = nicht erledigt, nicht storniert; prio 1 vor 2 vor 3, sonst Datei-Reihenfolge
function offeneAuftraege(schlange, erledigt) {
    const fertigIds = new Set(String(erledigt || "").split(/\r?\n/).map((l) => l.split(" ")[0]).filter(Boolean));
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
// zug/budget.txt: `<YYYY-MM-DDTHH:MM> woche=<%> karte=<Pkt>`, beide Werte frei; aufsteigend nach Zeit
function budgetVon(text) {
    return String(text || "").split(/\r?\n/).map((l) => /^(\d{4}-\d\d-\d\dT\d\d:\d\d)\s+(.*)$/.exec(l.trim())).filter(Boolean).map((m) => {
        const kv = Object.fromEntries(m[2].split(/\s+/).map((x) => x.split("=")));
        return { t: new Date(m[1]), woche: kv.woche != null ? Number(kv.woche) : null, karte: kv.karte != null ? Number(kv.karte) : null };
    }).sort((a, b) => a.t - b.t);
}
// der letzte bekannte Wert zum Zeitpunkt t (Stufen-Funktion); vor dem ersten der erste
function wertAm(b, k, t) {
    let v = null;
    for (const x of b) { if (x[k] == null) continue; if (x.t > t && v != null) break; v = x[k]; if (x.t > t) break; }
    return v;
}
const proProzent = (b, t0, t1) => {
    const [k0, k1, w0, w1] = [wertAm(b, "karte", t0), wertAm(b, "karte", t1), wertAm(b, "woche", t0), wertAm(b, "woche", t1)];
    return [k0, k1, w0, w1].some((v) => v == null) || w1 - w0 <= 0 ? null : (k1 - k0) / (w1 - w0);
};
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

// ── Koordinator: Logs in $TEMP/claude, EXIT= heißt beendet ───────────────────────────────────────────────────────────
const logText = (n) => { const p = path.join(TEMP_CLAUDE, n), st = fs.statSync(p); return { st, t: st.size > 1 << 20 ? "" : fs.readFileSync(p, "utf8") }; };
// je Log { name, t, exit (null = läuft), letzte }; null, wenn der Ordner fehlt (nicht der Laptop)
function koordinatorLogs() {
    let namen;
    try { namen = fs.readdirSync(TEMP_CLAUDE).filter((n) => /^(fahre-.*|takt.*)\.log$/.test(n)); } catch (_e) { return null; }
    return namen.map((n) => ({ n, ...logText(n) })).sort((a, b) => b.st.mtimeMs - a.st.mtimeMs).slice(0, 4).map(({ n, st, t }) => {
        const ex = [...t.matchAll(/EXIT=(\d+)/g)].pop();
        const letzte = t.split(/\r?\n/).filter((l) => l.trim() && !/^EXIT=/.test(l)).pop() || "";
        return { name: n.replace(/\.log$/, "").replace(/^fahre-/, ""), t: st.mtime, exit: ex ? Number(ex[1]) : null, still: !ex && Date.now() - st.mtime > LOG_STILL_H * 3600e3, letzte: letzte.replace(/^\d\d:\d\d:\d\d\s+/, "") };
    });
}
// je Zug-Log (fahre-*.log): Start („bau gegen“, sonst die erste Uhrzeit), GELANDET, ROT vor der Landung, Dauer in min. Die Logs
// tragen nur Uhrzeiten: der Tag kommt aus dem Datei-Datum, über Mitternacht zählt +24 h
function zugLaeufe(jetzt) {
    let namen;
    try { namen = fs.readdirSync(TEMP_CLAUDE).filter((n) => /^fahre-.*\.log$/.test(n)); } catch (_e) { return null; }
    const sek = (l) => { const m = /^(\d\d):(\d\d):(\d\d) /.exec(l || ""); return m ? +m[1] * 3600 + +m[2] * 60 + +m[3] : null; };
    return namen.map((n) => {
        const { st, t } = logText(n);
        const z = t.split(/\r?\n/);
        const iBau = z.findIndex((l) => /\] bau gegen/.test(l));
        const iStart = iBau >= 0 ? iBau : z.findIndex((l) => sek(l) != null);
        const iLand = z.findIndex((l) => /GELANDET/.test(l));
        const iRot = z.findIndex((l) => /ROT urteil/.test(l));
        const ex = [...t.matchAll(/EXIT=(\d+)/g)].pop();
        const s0 = iStart >= 0 ? sek(z[iStart]) : null;
        // läuft = weder EXIT noch GELANDET und das Log schrieb in den letzten LOG_STILL_H Stunden (ältere fahre.sh schrieben kein EXIT)
        const laeuft = !ex && iLand < 0 && jetzt - st.mtime < LOG_STILL_H * 3600e3;
        const sEnde = iLand >= 0 ? sek(z[iLand]) : !laeuft ? sek([...z].reverse().find((l) => sek(l) != null)) : null;
        // die Uhrzeit am Tag des Datei-Datums (Stunden-Felder, nie Mitternacht + Sekunden: am 25.10. hatte der Tag 25 h)
        const m = st.mtime;
        const start = s0 == null ? null : new Date(m.getFullYear(), m.getMonth(), m.getDate(), Math.floor(s0 / 3600), Math.floor(s0 / 60) % 60, s0 % 60);
        if (start && start - m > 60000) start.setDate(start.getDate() - 1);
        const min = s0 == null ? null : sEnde != null ? ((sEnde - s0 + 86400) % 86400) / 60 : (jetzt - start) / 60000;
        const letzte = z.filter((l) => l.trim() && !/^EXIT=/.test(l)).pop() || "";
        return { name: n.replace(/^fahre-|\.log$/g, ""), nr: (/^fahre-z(\d+)/.exec(n) || [])[1], t: st.mtime, start, min, laeuft, letzte, exit: ex ? Number(ex[1]) : null, gelandet: iLand >= 0, rot: iRot >= 0 && (iLand < 0 || iRot < iLand) };
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
    const zu = fertig(letzte.id, letzte);
    const alter = jetzt - letzte.t;
    // Ende ≈ aus der mittleren Stationsdauer seit START (Schloss-Warten und Vorfahrt eingerechnet)
    const eta = !zu && start && stand && stand.i > 0 && stand.n > stand.i ? new Date(+stand.t + ((stand.n - stand.i) * (stand.t - start.t)) / stand.i) : null;
    return { id: letzte.id, letzte, start, stationen, stand, zu, alter, eta, still: !zu && alter > STILL_MIN * 60000 };
}
// Durchsatz eines Messplatzes: Stationen je Stunde und mittlere Dauer über die letzten 12 Stations-Zeilen
function durchsatz(text) {
    const st = zeilenVon(text).map((x) => [x, /^(\S+) (GRÜN|ROT) ([\d.]+) · \d+\/\d+/.exec(x.rest)]).filter(([, m]) => m).slice(-12);
    if (st.length < 3) return null;
    const h = (st[st.length - 1][0].t - st[0][0].t) / 3600e3;
    return { proH: h > 0 ? (st.length - 1) / h : null, mittel: st.reduce((s, [, m]) => s + Number(m[3]), 0) / st.length, n: st.length };
}
const kurzId = (id) => id.replace(/-(gtx|radeon|headless)$/, "");
// die Ampel eines Geräts: rot = offline oder still, gelb = misst oder trägt einen Job, grün = frei
function geraetAmpel(name, mp, l, job, belegt) {
    if (l && l.status !== "online") return `${rot("●")} ${name} offline`;
    if (mp && mp.still) return `${rot("●")} ${name} still ${dauer(mp.alter)}`;
    if (mp && !mp.zu) return `${gelb("●")} ${name} misst ${kurzId(mp.id)}${mp.stand ? ` ${mp.stand.i}/${mp.stand.n}` : ""}${mp.eta ? ` · Ende ≈ ${hhmm(mp.eta)}` : ""}`;
    if (job) return `${gelb("●")} ${name} ${job.job.name.split(" ")[0]}-Job`;
    if (belegt) return `${gelb("●")} ${name} GPU belegt`;
    return `${gruen("●")} ${name} frei`;
}
// der Abschnitt eines Messplatzes: Zustand mit Balken, die letzten vier Stationen in festen Spalten, Läufer nur wenn er etwas trägt
function messplatzZeilen(mp, l, job) {
    const out = [];
    if (!mp) out.push(`  ${grau("noch keine Zeile")}`);
    else if (mp.zu) out.push(`  ${gruen("●")} frei · zuletzt ${mp.id}: ${urteilFarbe(mp.zu)} ${grau(`(${mp.letzte.zeit.slice(0, 5)})`)}`);
    else {
        out.push(`  ${mp.still ? rot("●") : gelb("●")} ${spalte(mp.id, 14)} ${mp.stand ? balken(mp.stand.i, mp.stand.n) : ""}${mp.start ? grau(` · seit ${mp.start.zeit.slice(0, 5)}`) : ""}${mp.eta ? ` · Ende ≈ ${fett(hhmm(mp.eta))}` : ""}`);
        out.push(`  ${grau(`nächste Station seit ${mp.letzte.zeit.slice(0, 5)} (${dauer(mp.alter)})`)}${mp.still ? rot(" — still") : ""}`);
        if (!/^(START|ENDE) |^\S+ \S+ [\d.]+ · \d+\/\d+/.test(mp.letzte.rest)) out.push(`  ${grau(mp.letzte.zeit.slice(0, 5))}  ${gelb(mp.letzte.rest)}`);
        const vier = mp.stationen.slice(-4).reverse();
        const breit = Math.max(0, ...vier.map((s) => sicht(urteilWort(s.wort)).length)); // Urteil-Spalte so breit wie ihr längstes Wort
        for (const s of vier) out.push(`  ${grau(s.zeit)}  ${spalte(s.station, 20)} ${spalte(urteilWort(s.wort), breit)} ${grau(rechts(zk(s.min), 5) + " min")}`);
    }
    if (job) out.push(`  ${gelb("↳")} Läufer ${job.job.runner_name} trägt ${job.run.name}/${job.job.name} ${grau(`(${job.run.head_branch} ${s8(job.run.head_sha)}, seit ${hhmm(new Date(job.job.started_at))})`)}`);
    else if (l && l.status !== "online") out.push(`  ${rot("●")} Läufer ${l.name} ${l.status}`);
    return out;
}

// ── Kandidaten: Zweige mit grünem Kopf, Commits außerhalb von main, Kopf jünger als 48 h ────────────────────────────────
// GraphQL liest Kopf, Datum und Check-Zustand aller Zweige (678 am 25.10., 7 Seiten); verglichen mit main wird nur, wer grün und
// jung ist (der Vergleich in GraphQL kostete je Seite 3 statt 1,8 s), per REST-compare, zwischengespeichert je main- und Kopf-SHA
const vergleich = new Map(); // `${main}:${kopf}` → Commits des Zweigs, die main fehlen
async function kandidaten(jetzt, main) {
    const Q = `query($nach:String){repository(owner:"MiguellD",name:"AnazhRealm"){refs(refPrefix:"refs/heads/",first:100,after:$nach){pageInfo{hasNextPage endCursor} nodes{name target{... on Commit{oid committedDate messageHeadline statusCheckRollup{state}}}}}}}`;
    const alle = [];
    for (let s = 0, nach = null; s < 12; s++) {
        const r = (await graphql(Q, { nach })).repository.refs;
        alle.push(...r.nodes);
        if (!r.pageInfo.hasNextPage) break;
        nach = r.pageInfo.endCursor;
    }
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
// die Git-Bash-Prozesse des Laptops (ps -ef zeigt die volle Befehlszeile); STIME ist eine Uhrzeit (heute) oder „Mon TT“
function psListe() {
    return new Promise((ok) => execFile("ps", ["-ef"], { timeout: 8000, windowsHide: true, maxBuffer: 1 << 22 }, (e, out) => {
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
    const [paket, karte, fort, fortR, schlange, erledigt, budgetT, planT, agentenT] = await Promise.all([
        main && versuch("package.json", () => datei(main, "package.json")),
        D("meisterkarte.json"), D("zug/fortschritt.txt"), D("zug/fortschritt-radeon.txt"), D("zug/warteschlange.txt"), D("zug/erledigt.txt"), D("zug/budget.txt"), D("zug/plan.txt"), D("zug/agenten.txt"),
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
    // Last: die GPU-Probe ruht, solange die Radeon misst (Zeit-Stationen) — Fortschritt ohne ENDE (jünger als 3 h), echt-Job auf
    // radeon-890m oder ein gehaltenes GPU-Schloss (deckt auch Läufe ausserhalb von zug.sh)
    const rLetzte = zeilenVon(fortR).pop();
    const schlossDir = path.join(TEMP_CLAUDE, "gpu-schloss");
    let schloss = null;
    if (fs.existsSync(schlossDir)) try { schloss = fs.readFileSync(path.join(schlossDir, "besitzer.txt"), "utf8").trim() || "?"; } catch (_e) { schloss = "?"; }
    const ruht = rLetzte && !/^(ENDE|ABBRUCH) /.test(rLetzte.rest) && jetzt - rLetzte.t < 3 * 3600e3 ? `Radeon-Lauf ${rLetzte.id}`
        : traeger.get("radeon-890m") ? "echt-Job auf radeon-890m" : schloss ? `GPU-Schloss: ${schloss.slice(0, 40)}` : null;
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
    for (const x of zweige.slice(0, 5))
        x.titel = titel.get(x.sha) || (await versuch("Titel " + s8(x.sha), async () => { const m = (await api(`/git/commits/${x.sha}`)).message.split("\n")[0]; titel.set(x.sha, m); return m; }));
    const aeltester = akt && akt.length ? new Date(akt[akt.length - 1].timestamp) : null;

    let mk = null;
    try { mk = karte && JSON.parse(karte); } catch (_e) { fehler.push("meisterkarte.json: kein JSON"); }
    const erledigtJe = new Map(String(erledigt || "").split(/\r?\n/).filter(Boolean).map((l) => [l.split(" ")[0], l.split(" ").slice(1).join(" ")]));
    const budget = budgetVon(budgetT);
    // KURS und PLAN (≈ 15 s, vor allem die Zweig-Liste) laufen im Hintergrund und zeichnen bei Ankunft neu; nur der erste Blick,
    // --einmal und --kurz warten auf sie
    if ((!L || takt % LANGSAM_TAKTE === 0) && !langsamLaeuft) {
        langsamLaeuft = true;
        const p = holenLangsam(jetzt, main, koord, budget)
            .catch((e) => ({ t: jetzt, fehler: ["abgebrochen: " + e.message] })) // laut, und der nächste langsame Takt versucht es neu
            .then((r) => { L = r; langsamLaeuft = false; if (stand && !EINMAL) zeichne(); });
        if (!L || EINMAL) await p;
    }
    takt++;
    const lauferVon = (n) => (laeufer || []).find((x) => x.name === n);
    const jobsVon = (r) => (jobs.get(r.id) || { jobs: [] }).jobs;
    return {
        jetzt, fehler, main, koord, mk, budget, fort, fortR, schloss, ruht, cpu, gpu, zweige, runs, jobsVon,
        version: paket ? (/"version":\s*"([^"]+)"/.exec(paket) || [])[1] : null,
        omen: messplatz(fort, (id) => erledigtJe.get(id), jetzt),
        radeon: messplatz(fortR, (id, l) => (/^(ENDE|ABBRUCH) /.test(l.rest) ? l.rest.replace(/^ENDE /, "") : null), jetzt),
        lO: lauferVon("omen-gtx1060"), lR: lauferVon("radeon-890m"), jO: traeger.get("omen-gtx1060"), jR: traeger.get("radeon-890m"),
        offen: offeneAuftraege(schlange, erledigt), logs: koordinatorLogs(), plan: planVon(planT), agentenT,
        schlangeIds: new Set(String(schlange || "").split(/\r?\n/).filter((l) => l.trim() && !l.startsWith("#")).map((l) => l.trim().split(/\s+/)[0])),
        erledigtIds: new Set(erledigtJe.keys()),
        luecke: akt && akt.length >= 100 && aeltester > grenze ? aeltester : null,
        rotVon: (r) => jobsVon(r).filter((j) => j.status === "completed" && !["success", "skipped", "neutral"].includes(j.conclusion)).length,
        api: { ...zahl },
    };
}
// KURS und PLAN: Versions-Stufen auf main, Zug-Logs, CI-Takt integ-probe, Qualität je Gerät, Kandidaten
async function holenLangsam(jetzt, main, koord, budget) {
    const R = { t: jetzt, fehler: [] };
    const v = async (was, fn) => { try { return await fn(); } catch (e) { R.fehler.push(`${was}: ${e.message}`); return null; } };
    R.seit = budget.length ? budget[0].t : new Date(+jetzt - 7 * 864e5);
    R.zuege = zugLaeufe(jetzt);
    // unabhängige Stränge zugleich: Kandidaten (die Zweig-Liste trägt die Wandzeit), CI-Takt, Stufen → Qualität, die FRESSER-Quellen
    // (Prozesse des Laptops, wann jede Warteschlangen-Zeile kam, Wackler über die Zweige)
    const pKand = TOKEN && main ? v("Kandidaten", () => kandidaten(jetzt, main)) : null;
    const pPs = psListe();
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
    let commits = [];
    for (let p = `/commits?sha=main&since=${R.seit.toISOString()}&per_page=100`, s = 0; p && s < 6; s++) {
        const c = await v("Commits main", () => api(p));
        if (!c) break;
        commits = commits.concat(c);
        p = weiterVon(p);
    }
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
    [R.ps, R.blame, R.wackler] = await Promise.all([pPs, pBlame, pWackler]);
    rotJobsSichern();
    return R;
}

// ── Zeichnen: Kopf (Ampel + Reiter) auf jeder Seite, darunter die Seite ────────────────────────────────────────────────
const SEITEN = ["JETZT", "KURS", "PLAN", "FRESSER"];
function ampelZeilen(S) {
    const lauf = S.runs.filter((r) => r.status === "in_progress"), warte = S.runs.filter((r) => r.status !== "in_progress");
    const ciRot = S.runs.reduce((s, r) => s + S.rotVon(r), 0);
    const g = S.logs && S.logs[0];
    const a = [
        geraetAmpel("OMEN", S.omen, S.lO, S.jO, false),
        geraetAmpel("RADEON", S.radeon, S.lR, S.jR, S.schloss && !(S.radeon && !S.radeon.zu)),
        `${ciRot ? rot("●") : S.runs.length ? gelb("●") : gruen("●")} CI ${lauf.length} läuft${warte.length ? ` · ${warte.length} wartet` : ""}${ciRot ? rot(` · ✗ ${ciRot} rot`) : ""}`,
        !g ? `${grau("●")} ZUG keine Logs` : g.still ? `${grau("●")} ZUG ${g.name} still` : g.exit == null ? `${gelb("●")} ZUG ${g.name} läuft` : `${g.exit ? rot("●") : gruen("●")} ZUG ${g.name} EXIT=${g.exit}`,
        S.mk ? fett(gelb("★")) + ` ${S.mk.summe}/${S.mk.max}` : "★ ?",
    ];
    const text = a.join("  "); // in EINER Zeile, über der Breite in zwei
    return sicht(text).length <= BREITE ? [text] : [a.slice(0, 2).join("  "), a.slice(2).join("  ")];
}
function reiter(seite) {
    return SEITEN.map((s, i) => (i === seite ? fett(`[${i + 1} ${s}]`) : grau(` ${i + 1} ${s} `))).join(" ") + grau("  · Taste 1–4 · q beendet");
}
function fuss(S) {
    return grau(`Blick ${S.jetzt.toTimeString().slice(0, 8)}${EINMAL ? "" : ` · nächster ${new Date(+S.jetzt + TAKT_S * 1000).toTimeString().slice(0, 8)}`} · KURS/PLAN von ${hhmm(L.t)} · API ${S.api.rest}/${S.api.limit} · ${S.api.neu} neu, ${S.api.gleich}× 304`) + (TOKEN ? "" : rot(" · ohne Token: Jobs, Läufer, Cloud, Kandidaten ausgelassen"));
}

function seiteJetzt(S) {
    const out = [];
    out.push(grau(`main ${s8(S.main)}${S.version ? " · V" + S.version : ""} · Karte gebucht ${S.mk ? `${S.mk.stand} am ${S.mk.kopf}` : "?"} · koordination ${s8(S.koord)}`));
    out.push(`${os.hostname()}  CPU ${mini(S.cpu)} · RAM ${mini((100 * (os.totalmem() - os.freemem())) / os.totalmem())} · GPU ${S.ruht ? gelb("ruht: Messung") + grau(` (${S.ruht})`) : mini(S.gpu)} · ${grau("OMEN-Last nicht gemeldet")}`);
    out.push("", linie("OMEN · GTX 1060"), ...messplatzZeilen(S.omen, S.lO, S.jO));
    for (const a of S.offen.filter((a) => !S.omen || S.omen.zu || a.id !== S.omen.id)) out.push(`  ${grau("danach")}  ${a.prio} ${spalte(a.art, 6)} ${spalte(a.id, 14)} ${grau(auftragKurz(a))}`);
    out.push("", linie("RADEON 890M · Laptop"), ...messplatzZeilen(S.radeon, S.lR, S.jR));
    if (!S.logs || !S.logs.length) out.push("", linie(`ZUG · ${S.logs ? "keine fahre-/takt-Logs" : "Logs nur auf dem Laptop"}`));
    else {
        out.push("", linie("ZUG · Logs des Koordinators"));
        for (const g of S.logs) {
            const z = g.still ? grau("○ still ") : g.exit == null ? gelb("● läuft ") : g.exit ? rot(`✗ EXIT=${g.exit}`) : gruen("✓ EXIT=0");
            out.push(`  ${spalte(z, 9)} ${spalte(g.name, 10)} ${grau(spalte(`${hhmm(g.t)} · vor ${dauer(S.jetzt - g.t)}`, 22))} ${urteilFarbe(g.letzte)}`);
        }
    }
    const lauf = S.runs.filter((r) => r.status === "in_progress"), warte = S.runs.filter((r) => r.status !== "in_progress");
    if (!S.runs.length) out.push("", linie("CI · nichts läuft"));
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
    return out;
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
        K.eff = { woche: proProzent(b, K.t0, j), h12: proProzent(b, new Date(+j - 12 * 3600e3), j), h6: proProzent(b, new Date(+j - 6 * 3600e3), j) };
        K.brenn = brenn(b);
        K.brennVor = vorW.length > 2 ? brenn(b.slice(0, b.lastIndexOf(vorW[vorW.length - 1]))) : null;
        if (K.brenn && K.brenn.rate > 0) K.ziel98 = K.brenn.letzte.woche >= 98 ? "erreicht" : hhmm(new Date(+K.brenn.letzte.t + ((98 - K.brenn.letzte.woche) / K.brenn.rate) * 3600e3));
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
    const gel = zg.filter((z) => z.gelandet && z.min != null).map((z) => z.min).sort((a, b) => a - b);
    K.durchlaufP50 = gel.length ? gel[Math.ceil(gel.length / 2) - 1] : null;
    K.dsO = durchsatz(S.fort);
    K.dsR = durchsatz(S.fortR);
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
    const W = 60;
    if (!K.t0) out.push(linie("KURS · zug/budget.txt fehlt oder ist leer"));
    else {
        out.push(linie(`KURS DER WOCHE · seit ${tag(K.t0)}. ${hhmm(K.t0)}`));
        const kw = K.b.filter((x) => x.karte != null).map((x) => x.karte);
        if (kw.length) out.push(`  Karte  ${spark(K.b, "karte", K.t0, S.jetzt, W, Math.min(...kw), Math.max(...kw))}  ${rechts(String(kw[0]), 3)} → ${rechts(String(K.karte), 3)} Pkt ${pfeil(K.karte, K.karteVor)}`);
        out.push(`  Woche  ${grau(spark(K.b, "woche", K.t0, S.jetzt, W, 0, 100))}  ${rechts("0", 3)} → ${rechts(String(K.woche ?? "—"), 3)} %   ${pfeil(K.woche, K.wocheVor)}`);
        out.push(`         ${grau(achse(K.t0, S.jetzt, W))}`);
        const e = (x) => ampelWert(x, 1, 0.5)(rechts(zk(x, 2), 5));
        out.push(`  Punkte je %    Woche ${e(K.eff.woche)}   12 h ${e(K.eff.h12)}   6 h ${e(K.eff.h6)} ${pfeil(K.eff.h6, K.eff.h12)}   ${grau("Ziel 1,00")}`);
        out.push(`  Brenn-Rate     ${rechts(zk(K.brenn && K.brenn.rate), 5)} %/h ${pfeil(K.brenn && K.brenn.rate, K.brennVor && K.brennVor.rate)}   98 % ≈ ${fett(K.ziel98 || "—")}`);
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
    out.push(`  im ersten Anlauf grün  ${ampelWert(ea.n ? ea.gruen / ea.n : null, 0.8, 0.5)(`${ea.gruen} von ${ea.n}`)} Zug-Nummern · Durchlauf p50 ${K.durchlaufP50 == null ? "—" : Math.round(K.durchlaufP50) + " min"}`);
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
    const k = L.kandidaten;
    if (!k) out.push("", linie(TOKEN ? "KANDIDATEN · nicht gelesen" : "KANDIDATEN · ohne Token ausgelassen"));
    else if (!k.length) out.push("", linie("KANDIDATEN · kein grüner Zweig außerhalb von main (48 h)"));
    else {
        out.push("", linie(`KANDIDATEN · bereit für einen Zug · ${k.length} grün, nicht in main, Kopf ≤ 48 h`));
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
    const st = (mp) => (mp && mp.stand ? ` · zuletzt ${mp.stand.station} ${mp.stand.wort} ${zk(mp.stand.min)} (${mp.stand.zeit})` : "");
    const danach = S.offen.filter((a) => !S.omen || S.omen.zu || a.id !== S.omen.id);
    o.push(`OMEN ${!S.omen ? "keine Zeile" : S.omen.zu ? `frei · zuletzt ${S.omen.id}: ${S.omen.zu}` : `${S.omen.id}${S.omen.stand ? ` ${S.omen.stand.i}/${S.omen.stand.n}` : ""}${S.omen.start ? ` seit ${S.omen.start.zeit.slice(0, 5)}` : ""}${S.omen.eta ? ` · Ende ≈ ${hhmm(S.omen.eta)}` : ""}${st(S.omen)}`}${danach.length ? ` · danach: ${danach.map((a) => a.id).join(", ")}` : ""}`);
    o.push(`RADEON ${!S.radeon ? "keine Zeile" : S.radeon.zu ? `frei · zuletzt ${S.radeon.id}: ${S.radeon.zu}` : `${S.radeon.id} ${S.radeon.stand ? `${S.radeon.stand.i}/${S.radeon.stand.n}` : ""}${st(S.radeon)}`}${S.ruht ? ` · GPU ruht (${S.ruht})` : ""}`);
    if (S.logs) o.push(`ZUG ${S.logs.map((g) => `${g.name} ${g.still ? "still" : g.exit == null ? "läuft" : "EXIT=" + g.exit} (${hhmm(g.t)})`).join(" · ")}`);
    if (S.logs && S.logs[0]) o.push(`  ${S.logs[0].name}: ${S.logs[0].letzte}`);
    o.push(`CI ${S.runs.length ? S.runs.slice(0, 4).map((r) => { const js = S.jobsVon(r); return `${r.head_branch} ${js.filter((j) => j.status === "completed").length}/${js.length}${S.rotVon(r) ? ` rot ${S.rotVon(r)}` : ""}${r.status !== "in_progress" ? " wartet" : ""}`; }).join(" · ") : "nichts läuft"}`);
    if (K.t0) o.push(`KURS Woche ${K.woche ?? "?"} % · Karte ${K.karte ?? "?"} · Pkt/% Woche ${zk(K.eff.woche, 2)} · 12 h ${zk(K.eff.h12, 2)} · 6 h ${zk(K.eff.h6, 2)} · Brenn ${zk(K.brenn && K.brenn.rate)} %/h · 98 % ≈ ${K.ziel98 || "—"}`);
    const c = L.ci || {};
    o.push(`ZÜGE ${K.tage.map((t) => `${t.tag} ${t.n}`).join(" · ") || "keine"} · erster Anlauf grün ${K.ersterAnlauf.gruen}/${K.ersterAnlauf.n} · Durchlauf p50 ${K.durchlaufP50 == null ? "—" : Math.round(K.durchlaufP50) + " min"} · CI integ p50 ${zk(c.p50, 0)}/p95 ${zk(c.p95, 0)} min · rot ${c.rot ?? "?"}/${c.n ?? "?"} (Wackler ${c.wackler ?? "?"})`);
    if (K.dsO) o.push(`OMEN-DURCHSATZ ${zk(K.dsO.proH)} Stationen/h · Mittel ${zk(K.dsO.mittel)} min`);
    for (const q of L.qual || []) { const kz = zaehle(q.k), kp = kippungen(q); o.push(`QUAL ${q.g} ${q.k ? `${kz.g}/${kz.r}` : "ungemessen"}${q.v ? ` gegen ${q.vor}` : ""}${kp && (kp.plus.length || kp.minus.length) ? `: ${[...kp.plus.map((k) => "+" + k), ...kp.minus.map((k) => "-" + k)].slice(0, 6).join(" ")}` : ""}`); }
    for (const p of S.plan.filter((p) => p.zustand !== "offen").slice(0, 5)) o.push(`PLAN ${p.zustand} ${p.was} · ${p.detail}`);
    if (L.kandidaten && L.kandidaten.length) o.push(`BEREIT ${L.kandidaten.slice(0, 5).map((x) => `${x.z}@${s8(x.sha)} +${x.vor}`).join(" · ")}`);
    for (const x of fresser(S).slice(0, 3)) o.push(`FRESSER ${x.rot ? "ROT " : ""}${x.was} · seit ${seitText(x.seit, S.jetzt)} · ${x.kosten} · ${x.tun}`);
    const fe = [...S.fehler, ...L.fehler];
    if (fe.length) o.push(`FEHLER ${fe.join(" · ")}`);
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
    const kopf = ampelZeilen(S);
    const koerper = [seiteJetzt, seiteKurs, seitePlan, seiteFresser];
    let out;
    if (EINMAL || !process.stdout.isTTY) out = [...kopf, ...koerper.flatMap((s, i) => ["", grau(`════ ${i + 1} ${SEITEN[i]} ════`), ...s(S)]), ...fehlerZ, "", fuss(S)];
    else {
        const k = koerper[seite](S);
        const platz = SEITE_MAX - kopf.length - 3 - fehlerZ.length; // eine Seite ≤ SEITE_MAX Zeilen
        out = [...kopf, reiter(seite), ...(k.length > platz ? [...k.slice(0, platz - 1), grau(`  … ${k.length - platz + 1} Zeilen mehr`)] : k), ...fehlerZ, "", fuss(S)];
    }
    // Bild statt Bildlauf: jeder Takt und jede Taste löscht den Schirm und zeichnet neu (nur im Terminal)
    process.stdout.write((process.stdout.isTTY && !EINMAL ? "\x1b[2J\x1b[H" : "") + out.map((z) => kappe(z)).join("\n") + "\n");
}

// Tasten: 1/2/3 wählen die Seite und zeichnen aus dem Stand (keine Abfrage), q oder Strg+C beendet
if (process.stdin.isTTY && process.stdout.isTTY && !EINMAL) {
    process.stdin.setRawMode(true);
    process.stdin.resume();
    process.stdin.on("data", (d) => {
        const k = String(d);
        if (k === "q" || k === "\u0003") { process.stdin.setRawMode(false); process.stdout.write("\n"); process.exit(0); }
        const i = "1234".indexOf(k);
        if (i >= 0 && i !== seite) { seite = i; zeichne(); }
    });
}
(async function schleife() {
    try {
        stand = await holen();
        zeichne();
    } catch (e) {
        console.log(`messplatz-blick FEHLER ${new Date().toTimeString().slice(0, 8)}: ${e.stack || e.message} — nächster Takt in ${TAKT_S} s`);
    }
    if (!EINMAL) setTimeout(schleife, TAKT_S * 1000);
    else if (process.stdin.isTTY) process.stdin.pause();
})();
