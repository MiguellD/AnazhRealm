#!/usr/bin/env node
"use strict";
// messplatz-blick.cjs — EIN Blick auf das, was JETZT läuft: OMEN (GTX 1060) · RADEON (Laptop) · GITHUB · ZUG · ★ gebucht.
// Start (EIN Befehl, das Token holt er selbst aus `git credential fill`):
//     node C:\Users\micha\AnazhRealm-profiband\artifacts\profiband\werkzeug\messplatz-blick.cjs          (q beendet)
//     … messplatz-blick.cjs --einmal   eine Runde als Text (ohne TTY oder mit --einmal/--kurz), Exit 0
// NUR LESEN: keine Schlösser, keine GPU, keine Schreibzugriffe ausser dem eigenen Puls (w3/blick.puls). Lokale Quellen alle 10 s,
// GitHub alle 60 s mit ETag (304 zählt nicht) unter einem Eimer von 60 gezählten Abrufen je Stunde.
// LIVE-QUELLEN (07.11., Kontowechsel: die alten zug/fortschritt*.txt, warteschlange.txt, plan.txt, agenten.txt stehen seit Tagen still —
// der Blick zeigte „still 44 h“ und eine Radeon-Messung vom Vortag als jetzt; sie fallen):
//   GitHub-API   actions/runners (omen-gtx1060, radeon-890m: online/belegt), laufende Läufe, Jobs des Zug-Laufs und des Laufs, der einen
//                eigenen Läufer belegt; Commit-Listen von punkte-maschine (Mess-Commits je Gerät) und zug/erledigt.txt (Zeit je OMEN-Zeile)
//                nur, wenn sich der Kopf bewegte
//   git          ls-remote main · koordination · punkte-maschine · integ-probe (kein API-Kontingent); Datei-Inhalte über
//                raw.githubusercontent.com/<sha>/… (unveränderlich, kein Kontingent)
//   lokal        GPU-Schloss %TEMP%/claude/gpu-schloss, Baum-Sperren <Klon>/.claude/worktrees/punkte-*.sperre, Prozesse (ps -ef der
//                Git-Bash; node.exe über EINE dauernde PowerShell, die mit dem Blick endet), Zug-Logs %TEMP%/claude/fahre-z*.log,
//                zug-sammler-z*.log, w3/kette-z*.out, Radeon-Messungen w3/mess-z*.out, Cloud-Abgaben w3/abgabe.log
// JEDE Zeile trägt ihr Alter; was älter ist als sein Takt, steht grau als „alt seit …“.
const { execFile, execFileSync, spawn } = require("child_process");
const fs = require("fs");
const os = require("os");
const path = require("path");

const REPO = "MiguellD/AnazhRealm";
const API = `https://api.github.com/repos/${REPO}`;
const ROH = `https://raw.githubusercontent.com/${REPO}`;
const GIT_URL = `https://github.com/${REPO}.git`;
const args = process.argv.slice(2);
const EINMAL = args.includes("--einmal") || args.includes("--kurz") || args.includes("--text");
const TTY = process.stdout.isTTY && !EINMAL;
const ANSI = TTY && !process.env.NO_COLOR;
const LOKAL_S = 10, API_S = 60;
const ABGABE_H = 6;
const TEMP_CLAUDE = path.join(process.env.TEMP || os.tmpdir(), "claude");
const W3 = path.join(TEMP_CLAUDE, "w3");
const LAEUFER = { omen: "omen-gtx1060", radeon: "radeon-890m" };
if (/omen/i.test(os.hostname())) {
    console.log("messplatz-blick: nie auf der OMEN — sie misst Zeit-Stationen");
    process.exit(2);
}
const GIT_ENV = { ...process.env, GIT_TERMINAL_PROMPT: "0", GCM_INTERACTIVE: "never" };
// der Haupt-Klon (Baum-Sperren der Punkte-Maschine): das gemeinsame .git über dem Ordner dieses Werkzeugs, wie spielRepo() in punkte.cjs
const KLON = (() => {
    try {
        const c = execFileSync("git", ["rev-parse", "--path-format=absolute", "--git-common-dir"], { cwd: __dirname, encoding: "utf8", windowsHide: true, env: GIT_ENV }).trim().split(/\r?\n/).pop();
        return path.dirname(path.resolve(__dirname, c));
    } catch (_e) { return path.resolve(__dirname, "../../.."); }
})();
// das Token aus der Anmeldung des Rechners (git credential), nie aus der Sitzung eines Kontos; TOKEN/GH_TOKEN nur als Rückfall
const TOKEN = (() => {
    try {
        const out = execFileSync("git", ["credential", "fill"], { input: "protocol=https\nhost=github.com\n\n", encoding: "utf8", timeout: 15000, windowsHide: true, env: GIT_ENV });
        const t = (/^password=(.+)$/m.exec(out) || [])[1];
        if (t) return t.trim();
    } catch (_e) { /* Rückfall unten */ }
    return process.env.GH_TOKEN || process.env.TOKEN || "";
})();

// ── Schrift ──────────────────────────────────────────────────────────────────────────────────────────────────────────
const f = (c, s) => (ANSI ? `\x1b[${c}m${s}\x1b[0m` : String(s));
const gruen = (s) => f(32, s), rot = (s) => f(31, s), gelb = (s) => f(33, s), grau = (s) => f(90, s), fett = (s) => f(1, s);
const sicht = (s) => String(s).replace(/\x1b\[[0-9;]*m/g, "");
const spalte = (s, n) => s + " ".repeat(Math.max(0, n - sicht(s).length));
function kappe(s, n) {
    if (sicht(s).length <= n) return s;
    let out = "";
    for (let i = 0, z = 0; i < s.length && z < n - 1; ) {
        const m = /^\x1b\[[0-9;]*m/.exec(s.slice(i, i + 12));
        if (m) { out += m[0]; i += m[0].length; } else { out += s[i++]; z++; }
    }
    return out + "…" + (ANSI ? "\x1b[0m" : "");
}
const s8 = (s) => String(s || "").slice(0, 8);
const hhmm = (d) => (d ? new Date(d).toTimeString().slice(0, 5) : "--:--");
const dauer = (ms) => {
    const s = Math.max(0, Math.round(ms / 1000));
    if (s < 90) return `${s} s`;
    const m = Math.round(s / 60);
    if (m < 60) return `${m} min`;
    if (m < 48 * 60) return `${Math.floor(m / 60)} h ${String(m % 60).padStart(2, "0")}`;
    return `${Math.round(m / 1440)} T`;
};
// das Alter einer Zeile: „vor 3 min“; älter als ihr Takt grau „alt seit 14:02 (3 h 10)“
const alter = (t, taktMs) => {
    if (!t) return grau("ohne Zeit");
    const a = Date.now() - +new Date(t);
    return a > taktMs ? grau(`alt seit ${hhmm(t)} (${dauer(a)})`) : grau(`vor ${dauer(a)}`);
};
const urteil = (s) => String(s).replace(/\bGRÜN\b|\bGELANDET\b|\bsuccess\b/g, (w) => gruen(w)).replace(/\bROT\b|\bFAHRT ROT\b|\bfailure\b|\bNICHT GEPUSHT\b/g, (w) => rot(w)).replace(/\bUNGEMESSEN\b/g, (w) => gelb(w));

// ── Abruf: GitHub-API mit ETag unter dem Eimer, Rohdateien je SHA, git ls-remote ────────────────────────────────────────
// DER EIMER: höchstens DECKEL gezählte Abrufe je Stunde (ein 304 erstattet), je Runde zuerst das Wichtige (Läufer, Zug-Jobs)
const DECKEL = TOKEN ? 60 : 30;
const EIMER_MAX = EINMAL ? 14 : 8; // die erste Runde braucht 7 (Läufer, Läufe, wartende, Zug-Jobs, drei Commit-Listen)
let eimer = EIMER_MAX, eimerT = Date.now();
const gezaehlt = []; // Zeitpunkte der gezählten Abrufe (200) der letzten Stunde
const runde = { n: 0, neu: 0, gleich: 0, aus: 0 };
const kontingent = { rest: "?", limit: "?" };
const etags = new Map();
function eimerNimm() {
    const j = Date.now();
    eimer = Math.min(EIMER_MAX, eimer + ((j - eimerT) / 3600e3) * DECKEL);
    eimerT = j;
    if (eimer < 1) return false;
    eimer -= 1;
    return true;
}
async function api(p) {
    if (!eimerNimm()) { runde.aus++; throw new Error("Eimer leer (Deckel " + DECKEL + "/h)"); }
    const url = API + p;
    const alt = etags.get(url);
    const r = await fetch(url, {
        headers: { Accept: "application/vnd.github+json", "User-Agent": "messplatz-blick", ...(TOKEN ? { Authorization: "Bearer " + TOKEN } : {}), ...(alt ? { "If-None-Match": alt.etag } : {}) },
        signal: AbortSignal.timeout(20000),
    });
    runde.n++;
    kontingent.rest = r.headers.get("x-ratelimit-remaining") ?? kontingent.rest;
    kontingent.limit = r.headers.get("x-ratelimit-limit") ?? kontingent.limit;
    if (r.status === 304 && alt) { runde.gleich++; eimer = Math.min(EIMER_MAX, eimer + 1); return alt.body; }
    runde.neu++;
    gezaehlt.push(Date.now());
    if (!r.ok) throw new Error(`${p.split("?")[0]}: HTTP ${r.status}`);
    const body = await r.json();
    const etag = r.headers.get("etag");
    if (etag) etags.set(url, { etag, body });
    return body;
}
const roh = new Map(); // `${sha}:${pfad}` → Text (unveränderlich)
async function rohDatei(sha, pfad) {
    const k = sha + ":" + pfad;
    if (roh.has(k)) return roh.get(k);
    const r = await fetch(`${ROH}/${sha}/${pfad}`, { signal: AbortSignal.timeout(20000) });
    if (!r.ok && r.status !== 404) throw new Error(`${pfad}@${s8(sha)}: HTTP ${r.status}`);
    const t = r.ok ? await r.text() : null;
    roh.set(k, t);
    return t;
}
const lauf = (cmd, a, ms = 15000) => new Promise((ok) => execFile(cmd, a, { timeout: ms, windowsHide: true, maxBuffer: 1 << 22, env: GIT_ENV }, (e, out) => ok({ e, out: String(out || "") })));

// ── Stand: je Quelle Daten + Zeit des letzten Erfolgs + Fehler ─────────────────────────────────────────────────────────
const Q = {}; // name → { t, d, fehler }
const setze = (n, d) => (Q[n] = { t: Date.now(), d, fehler: null });
const fehlt = (n, e) => (Q[n] = { ...(Q[n] || {}), fehler: String(e.message || e).slice(0, 80) });
const daten = (n) => (Q[n] || {}).d;
const versuch = async (n, fn) => { try { setze(n, await fn()); } catch (e) { fehlt(n, e); } };

// ── lokal (alle 10 s) ────────────────────────────────────────────────────────────────────────────────────────────────
// die Git-Bash-Prozesse (ps -ef trägt die volle Befehlszeile): Zug-Schlange, Sammler, fahre, zug-weiter, mess-kandidat, bildpaar, gpu-lauf
async function psListe() {
    const { e, out } = await lauf("ps", ["-ef"], 8000);
    if (e && !out) throw new Error("ps -ef: " + e.message);
    const j = new Date();
    return out.split(/\r?\n/).slice(1).map((l) => /^\s*(\S+)\s+(\d+)\s+(\d+)\s+(\S+)\s+(\d\d:\d\d:\d\d|[A-Z][a-z]{2}\s+\d{1,2})\s+(.*)$/.exec(l)).filter(Boolean).map((m) => {
        let start;
        if (m[5].includes(":")) { const [h, mi, s] = m[5].split(":").map(Number); start = new Date(j.getFullYear(), j.getMonth(), j.getDate(), h, mi, s); if (start > j) start.setDate(start.getDate() - 1); }
        else start = new Date(`${m[5]} ${j.getFullYear()}`);
        return { pid: +m[2], ppid: +m[3], start, cmd: m[6].trim() };
    });
}
// node.exe mit Befehlszeile: EINE PowerShell für die Lebenszeit des Blicks (eine CIM-Abfrage je 10 s statt eines PowerShell-Starts je
// Takt); sie prüft je Runde, ob der Blick noch lebt, und endet mit ihm
let psKind = null, nodeListe = null, nodeT = 0;
function nodeWaechter() {
    const ps = `$p=${process.pid}; while ($true) { if (-not (Get-Process -Id $p -ErrorAction SilentlyContinue)) { exit }; ` +
        `$l = @(Get-CimInstance Win32_Process -Filter "Name='node.exe'" | ForEach-Object { [pscustomobject]@{ pid = $_.ProcessId; t = $_.CreationDate.ToString('o'); c = [string]$_.CommandLine } }); ` +
        `'@@' + (ConvertTo-Json -Compress -Depth 2 -InputObject $l); Start-Sleep -Seconds ${LOKAL_S} }`;
    psKind = spawn("powershell", ["-NoProfile", "-NonInteractive", "-Command", ps], { windowsHide: true, stdio: ["ignore", "pipe", "ignore"] });
    let rest = "";
    psKind.stdout.on("data", (b) => {
        rest += String(b);
        for (let i; (i = rest.indexOf("\n")) >= 0; rest = rest.slice(i + 1)) {
            const z = rest.slice(0, i).trim();
            if (!z.startsWith("@@")) continue;
            try { const x = JSON.parse(z.slice(2) || "[]"); nodeListe = (Array.isArray(x) ? x : [x]).filter((p) => p && p.c && !/messplatz-blick/.test(p.c)); nodeT = Date.now(); } catch (_e) { /* halbe Zeile */ }
        }
    });
    psKind.on("exit", () => { psKind = null; });
}
const beendeKind = () => { if (psKind) try { psKind.kill(); } catch (_e) { /* schon fort */ } };
process.on("exit", beendeKind);

const lies = (p, max = 1 << 20) => { try { const st = fs.statSync(p); if (st.size <= max) return { t: st.mtime, text: fs.readFileSync(p, "utf8") }; const fd = fs.openSync(p, "r"), b = Buffer.alloc(max); fs.readSync(fd, b, 0, max, st.size - max); fs.closeSync(fd); return { t: st.mtime, text: b.toString("utf8") }; } catch (_e) { return null; } };
const zeilen = (t) => String(t || "").split(/\r?\n/).filter((l) => l.trim());
// eine Uhrzeit HH:MM[:SS] einer Log-Zeile am Tag der Datei (über Mitternacht: einen Tag zurück)
function amTag(hms, mtime) {
    const [h, m, s] = hms.split(":").map(Number);
    const d = new Date(mtime.getFullYear(), mtime.getMonth(), mtime.getDate(), h, m, s || 0);
    if (d - mtime > 120000) d.setDate(d.getDate() - 1);
    return d;
}
function lokal() {
    const L = { t: Date.now() };
    // GPU-Schloss: der Ordner ist das Schloss, besitzer.txt der Halter, seit = Ordner-Zeit
    const sd = path.join(TEMP_CLAUDE, "gpu-schloss");
    try { const st = fs.statSync(sd); L.schloss = { wer: (lies(path.join(sd, "besitzer.txt")) || { text: "?" }).text.trim().split(/\s+/)[0] || "?", seit: st.mtime }; } catch (_e) { L.schloss = null; }
    // Baum-Sperren der Punkte-Maschine: <Klon>/.claude/worktrees/punkte-<gerät>.sperre/pid; eine tote pid ist verwaist
    L.sperren = [];
    try {
        for (const n of fs.readdirSync(path.join(KLON, ".claude", "worktrees")).filter((n) => /^punkte-.*\.sperre$/.test(n))) {
            const d = path.join(KLON, ".claude", "worktrees", n), pid = Number(((lies(path.join(d, "pid")) || {}).text || "0").trim());
            let lebt = false;
            try { process.kill(pid, 0); lebt = true; } catch (e) { lebt = e.code === "EPERM"; }
            L.sperren.push({ geraet: n.replace(/^punkte-|\.sperre$/g, ""), pid, lebt, seit: fs.statSync(d).mtime });
        }
    } catch (_e) { /* ohne Ordner keine Sperre */ }
    // die Radeon-Messungen der Züge (mess-kandidat*.sh → w3/mess-z<N>.out): die jüngsten zwei
    L.mess = [];
    try {
        for (const n of fs.readdirSync(W3).filter((n) => /^mess-z\d+\w*\.out$/.test(n)).map((n) => ({ n, t: fs.statSync(path.join(W3, n)).mtime })).sort((a, b) => b.t - a.t).slice(0, 2)) {
            const r = lies(path.join(W3, n.n));
            const z = zeilen(r.text);
            const kopf = z.map((l) => /^(\d\d:\d\d:\d\d) \[(\S+)\] Kandidat ([0-9a-f]{40}) — messe (\S+)/.exec(l)).filter(Boolean).pop();
            const ende = z.map((l) => /^(\d\d:\d\d:\d\d) \[\S+\] MESSUNG FERTIG GESCHRIEBEN (\w+)/.exec(l)).filter(Boolean).pop();
            const st = z.map((l) => /^\s+(GRÜN|ROT|OFFEN)\s+(\S+)/.exec(l)).filter(Boolean);
            L.mess.push({ zug: kopf ? kopf[2] : n.n.replace(/^mess-|\.out$/g, ""), sha: kopf ? kopf[3] : null, plan: kopf ? kopf[4].split(",").length : null, start: kopf ? amTag(kopf[1], r.t) : null,
                ende: ende ? amTag(ende[1], r.t) : null, gruen: st.filter((x) => x[1] === "GRÜN").map((x) => x[2]), rot: st.filter((x) => x[1] === "ROT").map((x) => x[2]), offen: st.filter((x) => x[1] === "OFFEN").map((x) => x[2]),
                pushFehler: z.some((l) => /^error: cannot pull|^error: failed to push|! \[rejected\]/.test(l)), t: r.t });
        }
    } catch (_e) { /* ohne w3 keine Messung */ }
    // Cloud-Abgaben: w3/abgabe.log „HH:MM ABGABE <zweig> <sha8> <Betreff>“ der letzten ABGABE_H Stunden; der Tag läuft rückwärts ab der
    // Datei-Zeit (springt die Uhrzeit rückwärts gelesen nach vorn, war Mitternacht)
    const ab = lies(path.join(W3, "abgabe.log"), 96 << 10);
    L.abgaben = [];
    L.abgabeT = ab ? ab.t : null;
    if (ab) {
        let tag = new Date(ab.t), vor = 24 * 60;
        for (const l of zeilen(ab.text).reverse()) {
            const m = /^(\d\d):(\d\d) (\S+) (\S+) (\w+) (.*)$/.exec(l);
            if (!m) continue;
            const min = +m[1] * 60 + +m[2];
            if (min > vor + 1) tag = new Date(+tag - 864e5);
            vor = min;
            const t = new Date(tag.getFullYear(), tag.getMonth(), tag.getDate(), +m[1], +m[2]);
            if (Date.now() - t > ABGABE_H * 3600e3) break;
            if (m[3] === "ABGABE") L.abgaben.push({ t, zweig: m[4], sha: m[5], titel: m[6].replace(/^Abgabe [^:]+:\s*/, "") });
        }
    }
    return L;
}

// DER ZUG aus Prozessen und Logs: zug-schlange <vor> "<id>:<zweig> …" …, zug-sammler <id> <min> <zweig>…, fahre.sh <id> <zweig@sha>…,
// zug-weiter <id>. Ein Zug ist ZU, wenn sein fahre-Log ein Urteil trägt oder kette-<id>.out „<id> EXIT=“; er LÄUFT, solange sein Sammler,
// sein fahre oder (nach FAHRT ROT) sein zug-weiter lebt; sonst WARTET er in seiner Schlange.
function zugLog(id, D) {
    const f1 = lies(path.join(D.tc, `fahre-${id}.log`));
    const urt = f1 && zeilen(f1.text).filter((l) => new RegExp(`\\[${id}\\] (GELANDET|FAHRT ROT)`).test(l)).pop();
    return { f1, urteil: urt || null };
}
const kurzSha = (s) => String(s).replace(/\b([0-9a-f]{8})[0-9a-f]{32}\b/g, "$1").replace(/\s+/g, " ").trim();
const letzteZeile = (r) => (r ? kurzSha((zeilen(r.text).pop() || "").replace(/^\d\d:\d\d(:\d\d)? (\[\S+\] )?/, "")) : "");
function zug(ps, D = { tc: TEMP_CLAUDE, w3: W3 }) {
    const Z = { laeuft: [], wartet: [], t: Date.now() };
    const zweigeVon = (a) => a.map((x) => x.replace(/@[0-9a-f]+$/, "").replace(/^!/, ""));
    const eintrag = (id, zweige) => {
        const sam = ps.find((p) => new RegExp(`zug-sammler\\d*\\.sh ${id} `).test(p.cmd));
        const fah = ps.find((p) => new RegExp(`fahre\\.sh ${id} `).test(p.cmd));
        const wei = ps.find((p) => new RegExp(`zug-weiter\\.sh ${id}$`).test(p.cmd));
        const { f1, urteil } = zugLog(id, D);
        const kette = lies(path.join(D.w3, `kette-${id}.out`));
        const zu = !!urteil || (kette && new RegExp(`^${id} EXIT=`, "m").test(kette.text));
        const fw = lies(path.join(D.tc, `fahre-${id}w.log`));
        let phase = null, seit = null, pt = null;
        if (fah && !urteil) { phase = "fahre: " + letzteZeile(f1); seit = fah.start; pt = f1 && f1.t; }
        else if (sam && !fah && !zu) { const sl = lies(path.join(D.tc, `zug-sammler-${id}.log`)); phase = "sammelt: " + letzteZeile(sl); seit = sam.start; pt = sl && sl.t; }
        else if (wei && urteil && /FAHRT ROT/.test(urteil) && !(fw && /\] (GELANDET|FAHRT ROT)/.test(fw.text))) { phase = "Wackler-Neulauf: " + (letzteZeile(fw) || "liest die roten Schritte"); seit = wei.start; pt = fw ? fw.t : f1 && f1.t; }
        return { id, zweige, phase, seit, pt, zu };
    };
    const gesehen = new Set();
    // die Schlangen: je Prozess der Vorgänger und die Aufträge in Reihe (ein Token „zNNN:“ beginnt einen Auftrag)
    for (const p of ps.filter((p) => /zug-schlange\d*\.sh /.test(p.cmd))) {
        const tok = p.cmd.replace(/^.*zug-schlange\d*\.sh\s+/, "").split(/\s+/);
        const vor = tok.shift();
        const auf = [];
        for (const t of tok) { const m = /^(z\d+\w*):(.*)$/.exec(t); if (m) auf.push({ id: m[1], zweige: m[2] ? [m[2]] : [] }); else if (auf.length) auf[auf.length - 1].zweige.push(t); }
        let vorId = vor;
        for (const a of auf) {
            gesehen.add(a.id);
            const e = eintrag(a.id, zweigeVon(a.zweige));
            if (e.phase) Z.laeuft.push(e);
            else if (!e.zu) Z.wartet.push({ ...e, nach: vorId });
            vorId = a.id + "w";
        }
    }
    // ein Sammler oder fahre ohne Schlange; ein zug-weiter nach FAHRT ROT
    for (const p of ps) {
        const m = /zug-sammler\d*\.sh (z\S+) \d+ (.*)$/.exec(p.cmd) || /fahre\.sh (z\S+) (.*)$/.exec(p.cmd) || /zug-weiter\.sh (z\S+)$/.exec(p.cmd);
        if (!m || gesehen.has(m[1])) continue;
        gesehen.add(m[1]);
        const e = eintrag(m[1], m[2] ? zweigeVon(m[2].trim().split(/\s+/)) : []);
        if (e.phase) Z.laeuft.push(e);
    }
    // das jüngste Urteil: GELANDET oder FAHRT ROT aus den jüngsten fahre-Logs (der w-Log urteilt nach dem Wackler-Neulauf)
    try {
        const logs = fs.readdirSync(D.tc).filter((n) => /^fahre-z\d+\w*\.log$/.test(n)).map((n) => ({ n, t: fs.statSync(path.join(D.tc, n)).mtime })).sort((a, b) => b.t - a.t).slice(0, 4);
        for (const { n, t } of logs) {
            const z = zeilen(lies(path.join(D.tc, n)).text).filter((l) => /^\d\d:\d\d:\d\d \[z\S+\] (GELANDET|FAHRT ROT)/.test(l)).pop();
            if (z) { Z.zuletzt = { t: amTag(z.slice(0, 8), t), text: kurzSha(z.slice(9).replace(/^\[(\S+)\] /, "$1 ")) }; break; }
        }
    } catch (_e) { /* ohne Logs kein Urteil */ }
    return Z;
}

// ── GitHub (alle 60 s, nach Vorrang und je Quelle eigenem Takt) ──────────────────────────────────────────────────────
const faellig = new Map(); // Quelle → nächster Zeitpunkt
const istFaellig = (k, s) => { const j = Date.now(); if ((faellig.get(k) || 0) > j) return false; faellig.set(k, j + s * 1000 - 2000); return true; };
const jobsJe = new Map(); // run-id → { t, jobs }
const commitsJe = new Map(); // sha:pfad → commits (unveränderlich je SHA)
async function commitsVon(sha, pfad, n) {
    const k = sha + ":" + (pfad || "");
    if (!commitsJe.has(k)) commitsJe.set(k, (await api(`/commits?sha=${sha}&per_page=${n}${pfad ? "&path=" + pfad : ""}`)).map((c) => ({ sha: c.sha, t: new Date(c.commit.committer.date), titel: c.commit.message.split("\n")[0] })));
    return commitsJe.get(k);
}
// die laufenden und die (laut Lauf-Status noch) wartenden Läufe: ein frischer Zug-Lauf steht minutenlang auf „queued“, während sein
// echt-Job die OMEN schon belegt (07.11. 20:14, integ-probe e84fd1fb)
const alleRuns = () => { const a = daten("runs") || [], q = daten("queued") || []; return [...a, ...q.filter((x) => !a.some((r) => r.id === x.id))]; };
const jobsHolen = (r) => versuch("jobs:" + r.id, async () => { const j = (await api(`/actions/runs/${r.id}/jobs?filter=latest&per_page=100`)).jobs; jobsJe.set(r.id, { t: Date.now(), jobs: j }); return j; });
let neueRunde = true;
async function github() {
    if (neueRunde) runde.n = runde.neu = runde.gleich = runde.aus = 0;
    // 1 die Köpfe (ls-remote: kein Kontingent)
    await versuch("refs", async () => {
        const { e, out } = await lauf("git", ["ls-remote", GIT_URL, "refs/heads/main", "refs/heads/koordination", "refs/heads/punkte-maschine", "refs/heads/integ-probe"], 20000);
        const r = Object.fromEntries(out.split(/\r?\n/).map((l) => l.split("\t")).filter((x) => x.length === 2).map(([s, ref]) => [ref.replace("refs/heads/", ""), s]));
        if (!r.main) throw new Error("ls-remote: " + (e ? e.message.split("\n")[0] : "leer"));
        return r;
    });
    const R = daten("refs") || {};
    // 2 die Läufer (jede Runde; fast immer 304)
    if (TOKEN && istFaellig("laeufer", API_S)) await versuch("laeufer", async () => (await api("/actions/runners?per_page=20")).runners);
    // 3 die Läufe (laufend alle 3 min, wartend alle 2 min) und darin der Zug: der Lauf am Kopf von integ-probe (Jobs alle 2 min)
    if (istFaellig("runs", 3 * API_S)) await versuch("runs", async () => (await api("/actions/runs?status=in_progress&per_page=30")).workflow_runs);
    if (istFaellig("queued", 2 * API_S)) await versuch("queued", async () => (await api("/actions/runs?status=queued&per_page=10")).workflow_runs);
    const zr = zugRun();
    if (zr && istFaellig("jobs:" + zr.id, 2 * API_S)) await jobsHolen(zr);
    // 4 ein belegter eigener Läufer: der Lauf, der ihn trägt, alle 2 min; unbekannt → je Runde EIN weiterer Lauf (reihum)
    for (const l of (daten("laeufer") || []).filter((l) => l.busy)) {
        const h = jobAuf(l.name);
        if (h) { if (h.run !== zr && istFaellig("jobs:" + h.run.id, 2 * API_S)) await jobsHolen(h.run); continue; }
        const r = alleRuns().filter((r) => !jobsJe.has(r.id) || Date.now() - jobsJe.get(r.id).t > 5 * 60e3)[0];
        if (r && istFaellig("such:" + l.name, API_S)) await jobsHolen(r);
    }
    for (const id of [...jobsJe.keys()]) if (!alleRuns().some((r) => r.id === id)) jobsJe.delete(id);
    // 5 punkte-maschine, koordination, main: nur wenn der Kopf sich bewegte (Commit-Liste je SHA einmal, Dateien roh)
    if (R["punkte-maschine"]) await versuch("pm", () => commitsVon(R["punkte-maschine"], null, 40));
    if (R.koordination) {
        await versuch("erledigt", async () => ({ text: await rohDatei(R.koordination, "zug/erledigt.txt"), commits: await commitsVon(R.koordination, "zug/erledigt.txt", 6) }));
        await versuch("budget", () => rohDatei(R.koordination, "zug/budget.txt"));
    }
    if (R.main) await versuch("main", async () => ({ version: (/"version":\s*"([^"]+)"/.exec((await rohDatei(R.main, "package.json")) || "") || [])[1], c: (await commitsVon(R.main, null, 1))[0] }));
    Q.api = { t: Date.now(), d: { ...runde } };
}
// der Zug-Lauf: am Kopf von integ-probe (ls-remote), sonst der jüngste integ-probe-Lauf
const zugRun = () => { const k = (daten("refs") || {})["integ-probe"], a = alleRuns(); return a.find((r) => r.head_sha === k) || a.find((r) => r.head_branch === "integ-probe") || null; };
// der Job, den ein Läufer gerade trägt (aus den gelesenen Jobs der Läufe)
function jobAuf(name) {
    for (const r of alleRuns()) {
        const j = ((jobsJe.get(r.id) || {}).jobs || []).find((x) => x.runner_name === name && x.status === "in_progress");
        if (j) return { run: r, job: j, t: jobsJe.get(r.id).t };
    }
    return null;
}

// ── Zeichnen ─────────────────────────────────────────────────────────────────────────────────────────────────────────
const punkt = (z) => (z === "rot" ? rot("●") : z === "gelb" ? gelb("●") : z === "grau" ? grau("●") : gruen("●"));
const TAKT_API = 3 * API_S * 1000, TAKT_LOKAL = 3 * LOKAL_S * 1000;
const mitAlter = (s, t, takt) => `${s}  ${alter(t, takt)}`;
// die Mess-Commits je Gerät aus der Commit-Liste von punkte-maschine
function messCommits() {
    const c = daten("pm") || [];
    return {
        gtx: c.filter((x) => /^OMEN GTX/.test(x.titel)),
        radeon: c.filter((x) => /^Messung Radeon/.test(x.titel)),
        headless: c.filter((x) => /^Farm headless/.test(x.titel)),
    };
}
const laeufe = (n) => `${n} ${n === 1 ? "Lauf" : "Läufe"}`;
function laeuferZeile(l) {
    if (!l) return TOKEN ? grau("Läufer unbekannt") : grau("Läufer ohne Token nicht lesbar");
    const lab = l.labels.map((x) => x.name).filter((x) => !/^(self-hosted|Windows|X64|Linux)$/.test(x)).join(", ");
    return `${l.name} ${l.status === "online" ? (l.busy ? gelb("belegt") : gruen("frei")) : rot(l.status)} ${grau("[" + lab + "]")}`;
}
const jobText = (h) => `${h.job.name} · ${h.run.head_branch} ${s8(h.run.head_sha)}${h.run.run_attempt > 1 ? " V" + h.run.run_attempt : ""} · seit ${hhmm(h.job.started_at)} (${dauer(Date.now() - new Date(h.job.started_at))})`;

function seite() {
    const o = [];
    const L = daten("lokal") || {}, ps = daten("ps") || [], Z = daten("zug") || { laeuft: [], wartet: [] };
    const R = daten("refs") || {}, lae = daten("laeufer") || [], M = daten("main") || {};
    const lO = lae.find((l) => l.name === LAEUFER.omen), lR = lae.find((l) => l.name === LAEUFER.radeon);
    const jO = lO && lO.busy ? jobAuf(LAEUFER.omen) : null, jR = lR && lR.busy ? jobAuf(LAEUFER.radeon) : null;
    const mc = messCommits();
    const tL = (Q.laeufer || {}).t, tLok = (Q.lokal || {}).t;
    // ★ gebucht: die letzte karte=-Zeile von zug/budget.txt (Zeit und Kopf stehen in ihr)
    const bz = zeilen(daten("budget")).map((l) => /^(\d{4}-\d\d-\d\dT\d\d:\d\d)\s+karte=(\d+)(?:.*?gebucht am (\w+))?/.exec(l)).filter(Boolean).pop();
    const max = (/Meisterkarte \d+\/(\d+)/.exec(((daten("pm") || []).find((c) => /^Meisterkarte \d+\/\d+/.test(c.titel)) || {}).titel || "") || [])[1] || 330;
    const stern = bz ? `${fett(gelb("★"))} ${fett(bz[2] + "/" + max)} gebucht ${hhmm(new Date(bz[1]))}${bz[3] ? " am " + bz[3] : ""}` : grau("★ ?");

    // OMEN: der Läufer (echt-Job, gpu-probe) und die Mess-Pushes der OMEN (punkte-maschine „OMEN GTX:“ + zug/erledigt.txt)
    const erl = daten("erledigt") || { text: "", commits: [] };
    const erlZ = zeilen(erl.text).slice(-3).reverse().map((l, i) => ({ id: l.split(" ")[0].replace(/^omen-gtx-/, ""), wort: l.split(" ")[1] || "", rest: l.split(" ").slice(2).join(" "), t: (erl.commits[i] || {}).t }));
    const gtxPush = mc.gtx[0];
    const omenMisst = !jO && gtxPush && Date.now() - gtxPush.t < 15 * 60e3;
    const omenZ = !lO ? ["grau", grau("Läufer nicht gelesen")] : lO.status !== "online" ? ["rot", rot("offline")]
        : jO ? ["gelb", `belegt · ${jobText(jO)}`] : lO.busy ? ["gelb", "belegt · Job nicht in den gelesenen Läufen"]
        : omenMisst ? ["gelb", `misst · letzter Push ${hhmm(gtxPush.t)} (${gtxPush.titel.replace(/^OMEN GTX:\s*/, "")})`] : ["gruen", "frei"];
    // RADEON: Sperre, Schloss, Läufer, Prozesse (punkte.cjs · werkbank · bildpaar · playtest), laufende Zug-Messung
    const sperre = (L.sperren || []).find((s) => s.geraet === "radeon" && s.lebt);
    const nodeR = (nodeListe || []).filter((p) => /punkte\.cjs|werkbank|playtest|bildpaar/.test(p.c));
    const punkteR = nodeR.filter((p) => /punkte\.cjs/.test(p.c) && /--geraet\s+radeon/.test(p.c));
    const werkb = nodeR.filter((p) => /werkbank/.test(p.c));
    const bashR = ps.filter((p) => /bildpaar\.sh|mess-kandidat[\w-]*\.sh|gpu-lauf\.sh|radeon-\w+\.sh/.test(p.cmd));
    const messLauf = (L.mess || []).find((m) => !m.ende && Date.now() - m.t < 30 * 60e3);
    const radeonTeile = [];
    if (jR) radeonTeile.push(`Job ${jobText(jR)}`);
    if (messLauf) radeonTeile.push(`misst ${messLauf.zug} ${s8(messLauf.sha)} ${messLauf.gruen.length + messLauf.rot.length + messLauf.offen.length}/${messLauf.plan || "?"} seit ${hhmm(messLauf.start)}`);
    else if (punkteR.length || sperre) radeonTeile.push(`punkte.cjs${punkteR[0] ? " " + s8((/--sha\s+(\w+)/.exec(punkteR[0].c) || [])[1]) : ""}${sperre ? " (Sperre pid " + sperre.pid + " seit " + hhmm(sperre.seit) + ")" : ""}`);
    if (L.schloss) radeonTeile.push(`Schloss ${L.schloss.wer} seit ${hhmm(L.schloss.seit)}`);
    if (werkb.length) radeonTeile.push(`${werkb.length} Werkbank${werkb.length > 1 ? "en" : ""} (${werkb.map((p) => ":" + ((/--port[ =](\d+)/.exec(p.c) || /PORT=(\d+)/.exec(p.c) || [])[1] || "?")).join(" ")})`);
    if (bashR.length) radeonTeile.push(bashR.map((p) => (/(bildpaar|mess-kandidat[\w-]*|gpu-lauf|radeon-\w+)\.sh/.exec(p.cmd) || [])[1]).join(", "));
    const radeonZ = lR && lR.status !== "online" ? ["rot", `Läufer offline · ${radeonTeile.join(" · ") || "frei"}`] : radeonTeile.length ? ["gelb", radeonTeile.join(" · ")] : ["gruen", "frei"];
    const messZu = (L.mess || []).find((m) => m.ende);
    const rPush = mc.radeon[0];
    const ungepusht = messZu && !mc.radeon.some((c) => c.titel.includes(s8(messZu.sha))) && (daten("pm") || []).length > 0;
    const messText = (m) => `${m.zug} ${s8(m.sha)} · ${m.gruen.length} GRÜN${m.rot.length ? " · ROT " + m.rot.join(" ") : ""}${m.offen.length ? " · OFFEN " + m.offen.join(" ") : ""}`;

    // GITHUB: laufende und wartende Läufe; der Zug-Lauf mit seinen Jobs
    const runs = alleRuns();
    const zr = zugRun();
    const fortschritt = (r) => {
        const js = (jobsJe.get(r.id) || {}).jobs;
        if (!js) return r.status === "queued" ? gelb("wartet") : "läuft";
        const rotJ = js.filter((j) => j.status === "completed" && j.conclusion === "failure");
        return `${js.filter((j) => j.status === "completed").length}/${js.length}${rotJ.length ? " " + rot(`✗${rotJ.length} ${rotJ[0].name}`) : ""}`;
    };
    const runText = (r) => {
        const js = (jobsJe.get(r.id) || {}).jobs || [];
        const eigen = js.filter((j) => j.status === "in_progress" && j.labels.includes("self-hosted")).map((j) => `${j.name.replace(/\s*\(.*\)$/, "")} auf ${j.runner_name}`);
        const warten = js.filter((j) => j.status === "queued" && j.labels.includes("self-hosted")).map((j) => gelb(`${j.name.replace(/\s*\(.*\)$/, "")} wartet auf [${j.labels.filter((x) => x !== "self-hosted").join(",")}]`));
        const gh = js.filter((j) => j.status === "in_progress" && !j.labels.includes("self-hosted")).length;
        return [`${spalte(r.head_branch, 18)} ${grau(s8(r.head_sha))} ${fortschritt(r)}`, ...eigen, ...warten, gh ? `${gh} auf GitHub` : "",
            `seit ${hhmm(r.run_started_at || r.created_at)}${r.run_attempt > 1 ? " V" + r.run_attempt : ""}${r.name !== "Code-Check" ? " " + grau(r.name) : ""}`].filter(Boolean).join(" · ");
    };
    const ghZ = !TOKEN ? ["grau", grau("ohne Token: Läufer und Jobs ausgelassen")] : !Q.runs ? ["grau", grau("nicht gelesen")]
        : [runs.some((r) => ((jobsJe.get(r.id) || {}).jobs || []).some((j) => j.conclusion === "failure")) ? "rot" : runs.length ? "gelb" : "gruen",
            [laeufe(runs.length), zr ? `Zug ${s8(zr.head_sha)} ${fortschritt(zr)}` : "", runs.filter((r) => r !== zr).map((r) => `${r.head_branch}${r.name !== "Code-Check" ? "/" + r.name : ""} ${fortschritt(r)}`).slice(0, 3).join(", ")].filter(Boolean).join(" · ")];

    // ZUG: Reihenfolge
    const zweigeKurz = (z) => (z.length ? `[${z.join(" ")}]` : "");
    const reihe = [...Z.laeuft.map((e) => `läuft ${fett(e.id)} ${zweigeKurz(e.zweige)}`), ...Z.wartet.map((e) => `wartet ${e.id} [${e.zweige.length} Zweig${e.zweige.length === 1 ? "" : "e"}]`)];
    const zugZ = reihe.length ? ["gelb", reihe.join(" → ")] : ["gruen", `steht${Z.zuletzt ? " · zuletzt " + urteil(Z.zuletzt.text.slice(0, 60)) : ""}`];

    // ── Kopf: eine Zeile je Gerät
    const tApi = (Q.api || {}).t;
    o.push(`${fett("MESSPLATZ-BLICK")} ${new Date().toTimeString().slice(0, 8)} · main ${s8(R.main)}${M.version ? " V" + M.version : ""}${M.c ? grau(` (${hhmm(M.c.t)})`) : ""} · ${stern}`);
    o.push(`${punkt(omenZ[0])} ${spalte(fett("OMEN"), 7)} ${omenZ[1]}`);
    o.push(`${punkt(radeonZ[0])} ${spalte(fett("RADEON"), 7)} ${radeonZ[1]}`);
    o.push(`${punkt(ghZ[0])} ${spalte(fett("GITHUB"), 7)} ${ghZ[1]}`);
    o.push(`${punkt(zugZ[0])} ${spalte(fett("ZUG"), 7)} ${zugZ[1]}`);

    // ── je Gerät höchstens 3 Zeilen
    const kopfzeile = (titel, t, takt) => grau("── ") + fett(titel) + "  " + (Q[t] && Q[t].fehler ? rot("Fehler: " + Q[t].fehler) + " " : "") + alter((Q[t] || {}).t, takt);
    o.push("", kopfzeile(`OMEN · GTX 1060 · ${laeuferZeile(lO)}`, "laeufer", TAKT_API));
    o.push(`  ${spalte("jetzt", 8)} ${omenZ[1]}`);
    if (erlZ[0]) o.push(mitAlter(`  ${spalte("zuletzt", 8)} ${hhmm(erlZ[0].t)} ${erlZ[0].id} ${urteil(erlZ[0].wort)} ${grau(erlZ[0].rest.replace(/\s*\(punkte-maschine.*$/, "").slice(0, 100))}`, erlZ[0].t, 2 * 3600e3));
    if (erlZ.length > 1) o.push(`  ${spalte("davor", 8)} ${erlZ.slice(1).map((x) => `${hhmm(x.t)} ${x.id} ${urteil(x.wort)}`).join(" · ")}`);

    o.push("", kopfzeile(`RADEON · 890M · ${laeuferZeile(lR)}`, "lokal", TAKT_LOKAL));
    o.push(`  ${spalte("jetzt", 8)} ${radeonTeile.length ? radeonTeile.join(" · ") : `frei · Schloss frei · keine Sperre · kein punkte/werkbank/bildpaar${nodeListe ? "" : grau(" (node-Liste kommt)")}`}`);
    if (messZu) o.push(mitAlter(`  ${spalte("zuletzt", 8)} ${hhmm(messZu.ende)} ${urteil(messText(messZu))}${ungepusht ? " · " + rot("NICHT GEPUSHT") + (messZu.pushFehler ? grau(" (pull/push fiel)") : "") : ""}`, messZu.ende, 2 * 3600e3));
    if (rPush) o.push(mitAlter(`  ${spalte("gepusht", 8)} ${hhmm(rPush.t)} ${urteil(rPush.titel.replace(/^Messung Radeon\s*/, ""))}`, rPush.t, 2 * 3600e3));

    if (!Q.api) o.push("", grau("── ") + fett("GITHUB · erste Abfrage läuft"));
    else o.push("", kopfzeile(`GITHUB · ${laeufe(runs.length)} · API ${(Q.api || { d: {} }).d.n || 0} Abrufe diese Runde (${(Q.api || { d: {} }).d.neu || 0} neu, ${(Q.api || { d: {} }).d.gleich || 0}× 304${(Q.api || { d: {} }).d.aus ? ", " + (Q.api || { d: {} }).d.aus + " zurückgestellt" : ""}) · ${gezaehlt.filter((t) => Date.now() - t < 3600e3).length}/${DECKEL} je h · Rest ${kontingent.rest}/${kontingent.limit}`, "runs", TAKT_API));
    for (const r of [zr, ...runs.filter((r) => r !== zr)].filter(Boolean).slice(0, 3)) o.push(`  ${r === zr ? spalte("Zug", 8) : spalte("Zweig", 8)} ${runText(r)}`);
    if (mc.headless[0] && o.length) o.push(mitAlter(`  ${spalte("Farm", 8)} ${hhmm(mc.headless[0].t)} ${urteil(mc.headless[0].titel.replace(/^Farm headless\s*/, "").replace(/ · längster.*$/, ""))}`, mc.headless[0].t, 6 * 3600e3));

    o.push("", kopfzeile("ZUG · Schlange des Koordinators", "zug", TAKT_LOKAL));
    for (const e of Z.laeuft.slice(0, 2)) o.push(mitAlter(`  ${spalte("läuft", 8)} ${fett(e.id)} ${zweigeKurz(e.zweige)} · seit ${hhmm(e.seit)} · ${urteil(e.phase).slice(0, 160)}`, e.pt, 45 * 60e3));
    for (const e of Z.wartet.slice(0, 1)) o.push(`  ${spalte("wartet", 8)} ${e.id} ${zweigeKurz(e.zweige)} ${grau("nach " + e.nach)}`);
    if (!Z.laeuft.length && !Z.wartet.length) o.push(`  ${grau("kein Zug in Fahrt, keine Schlange")}`);
    if (Z.zuletzt) o.push(mitAlter(`  ${spalte("zuletzt", 8)} ${hhmm(Z.zuletzt.t)} ${urteil(Z.zuletzt.text)}`, Z.zuletzt.t, 2 * 3600e3));

    o.push("", grau("── ") + fett(`ABGABEN · ${(L.abgaben || []).length} in ${ABGABE_H} h (w3/abgabe.log)`) + "  " + alter(L.abgabeT, 30 * 60e3));
    for (const a of (L.abgaben || []).slice(0, 5)) o.push(`  ${hhmm(a.t)}  ${spalte(a.zweig, 22)} ${grau(a.sha)} ${a.titel}`);
    if ((L.abgaben || []).length > 5) o.push(grau(`  … ${(L.abgaben || []).length - 5} weitere`));

    const fe = Object.entries(Q).filter(([k, v]) => v.fehler && !["laeufer", "runs", "lokal", "zug"].includes(k)).map(([k, v]) => `${k}: ${v.fehler}`);
    o.push("", grau(`lokal alle ${LOKAL_S} s · GitHub alle ${API_S} s (ls-remote + API mit ETag) · ${tApi ? "API-Runde " + hhmm(tApi) : "API noch nicht gelesen"}${TTY ? " · q beendet" : ""}`) + (fe.length ? "  " + rot(fe.join(" · ").slice(0, 160)) : ""));
    return o;
}

// DER RAHMEN: im Terminal der zweite Schirm (kein Bildlauf, keine Köpfe im Verlauf), je Bild Cursor nach oben links, jede Zeile auf
// Schirmbreite gekappt und bis zum Rand gelöscht, der Rest unter dem Bild gelöscht — EIN write je Bild, kein Löschen des ganzen Schirms
// (\x1b[2J schob in Windows Terminal jedes Bild in den Verlauf: die mehrfachen Köpfe)
function zeichne() {
    const o = seite();
    if (!TTY) return void process.stdout.write(o.map((z) => sicht(z)).join("\n") + "\n");
    const breit = Math.max(40, (process.stdout.columns || 120) - 1), hoch = Math.max(10, process.stdout.rows || 40);
    const z = o.slice(0, hoch - 1).map((x) => kappe(x, breit) + "\x1b[K");
    process.stdout.write("\x1b[H" + z.join("\n") + "\n\x1b[J");
}
async function lokalRunde() {
    await versuch("ps", psListe);
    await versuch("lokal", async () => lokal());
    await versuch("zug", async () => zug(daten("ps") || []));
    if (!EINMAL) try { fs.writeFileSync(path.join(W3, "blick.puls"), new Date().toISOString()); } catch (_e) { /* ohne w3 kein Puls */ }
}

// SELBSTTEST der Zug-Reihe (die Zeile, die am 07.11. fehlte): eine gepflanzte Schlange muss „läuft z299 → wartet z300“ ergeben, ein
// Urteil im fahre-Log den Zug in den Wackler-Neulauf schieben, ein Zug mit Urteil und ohne zug-weiter weder laufen noch warten
function selbsttest() {
    const wurzel = fs.mkdtempSync(path.join(os.tmpdir(), "blick-selbsttest-")), D = { tc: wurzel, w3: path.join(wurzel, "w3") };
    fs.mkdirSync(D.w3);
    const t = new Date();
    const p = (cmd) => ({ pid: 1, ppid: 1, start: t, cmd });
    const ps = [p("bash zug-schlange6.sh z298w z299:w20-leib-takt"), p("bash zug-sammler7.sh z299 25 w20-leib-takt"),
        p("bash artifacts/profiband/werkzeug/fahre.sh z299 w20-leib-takt@da0bae879779ce2bf32e0162596b070aef51d7a5"),
        p("bash zug-schlange6.sh z299w z300:w22-schmiede-heil w20-lack-spiegel w21-laub-jahr-fern w19-fahrt-ziel-2"), p("bash zug-weiter.sh z300")];
    fs.writeFileSync(path.join(D.tc, "fahre-z299.log"), "19:30:40 [z299] Kandidat 4dbc18ccd6e5acbc8ed548bd48dfbba8b3f6ed0a (Werkzeug=0)\n");
    const fehler = [];
    const a = zug(ps, D);
    const reihe = [...a.laeuft.map((e) => "läuft " + e.id + " " + e.zweige.length), ...a.wartet.map((e) => "wartet " + e.id + " " + e.zweige.length + " nach " + e.nach)].join(" → ");
    if (reihe !== "läuft z299 1 → wartet z300 4 nach z299w") fehler.push("Reihe: " + reihe);
    if (!a.laeuft[0] || a.laeuft[0].phase !== "fahre: Kandidat 4dbc18cc (Werkzeug=0)") fehler.push("Phase: " + (a.laeuft[0] || {}).phase);
    fs.appendFileSync(path.join(D.tc, "fahre-z299.log"), "20:08:57 [z299] FAHRT ROT urteil: ROT voll 14/18 · Lauf 42401638659\n");
    const b = zug([...ps.filter((x) => !/fahre\.sh|zug-sammler/.test(x.cmd)), p("bash zug-weiter.sh z299")], D);
    if (!b.laeuft[0] || b.laeuft[0].id !== "z299" || !/^Wackler-Neulauf/.test(b.laeuft[0].phase)) fehler.push("Neulauf: " + JSON.stringify(b.laeuft[0] || null));
    if (!b.zuletzt || !/^z299 FAHRT ROT/.test(b.zuletzt.text)) fehler.push("zuletzt: " + JSON.stringify(b.zuletzt || null));
    const c = zug(ps.filter((x) => !/fahre\.sh|zug-sammler|zug-weiter/.test(x.cmd)), D);
    if (c.laeuft.length || c.wartet.map((e) => e.id).join() !== "z300") fehler.push("nach dem Urteil: " + JSON.stringify(c));
    fs.rmSync(wurzel, { recursive: true, force: true });
    console.log(fehler.length ? "messplatz-blick SELBSTTEST ROT: " + fehler.join(" · ") : "messplatz-blick Selbsttest grün: läuft z299 → wartet z300, Neulauf, Urteil");
    process.exit(fehler.length ? 1 : 0);
}

(async function start() {
    if (args.includes("--selbsttest")) return selbsttest();
    nodeWaechter();
    if (EINMAL) {
        await Promise.all([lokalRunde(), github(), new Promise((ok) => { const t0 = Date.now(); const w = setInterval(() => { if (nodeListe || Date.now() - t0 > 12000) { clearInterval(w); ok(); } }, 200); })]);
        neueRunde = false; // die Abrufe beider Runden zählen zusammen
        await github(); // die zweite Runde findet den Job eines belegten Läufers, den die erste Run-Liste erst nannte
        zeichne();
        beendeKind();
        return;
    }
    if (TTY) process.stdout.write("\x1b[?1049h\x1b[?25l\x1b[H\x1b[J");
    const ende = () => { beendeKind(); if (TTY) process.stdout.write("\x1b[?25h\x1b[?1049l"); process.exit(0); };
    process.on("SIGINT", ende);
    process.on("SIGTERM", ende);
    if (TTY && process.stdin.isTTY) {
        process.stdin.setRawMode(true);
        process.stdin.resume();
        process.stdin.on("data", (d) => { const k = String(d); if (k === "q" || k === "\u0003") ende(); });
    }
    process.stdout.on("resize", zeichne);
    const lok = async () => { try { await lokalRunde(); zeichne(); } catch (e) { fehlt("lokal", e); } setTimeout(lok, LOKAL_S * 1000); };
    const gh = async () => { try { await github(); zeichne(); } catch (e) { fehlt("api", e); } setTimeout(gh, API_S * 1000); };
    lok();
    gh();
})();
