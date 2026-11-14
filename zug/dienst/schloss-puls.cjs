#!/usr/bin/env node
"use strict";
// schloss-puls.cjs — DAS GPU-SCHLOSS MELDET SEINEN HALTER (11.11., der Schöpfer sah es selbst: die OMEN trug 19:33–19:49 `gate:haus-welt`
// unter gpu-lauf, 32 Stationen warteten am Schloss — der Messplatz-Blick zeigte „Frei“ und ALARM, ebenso die GTX 1050 mit Hintergrund-Läufen).
// Die Uhr zählte nur, was als Push oder CI-Schritt ankommt; jede Arbeit unter dem Schloss, die nicht je Stück pusht (Tor, Nachwache, ABAB,
// Probe), war für sie unsichtbar. DER SCHNITT: das Schloss ($TEMP/claude/gpu-schloss, atomar per mkdir; besitzer.txt Zeile 1 = wer, `pid=`)
// ist auf jedem Gerät der EINE Ort, an dem jede GPU-Arbeit vorbeikommt — gleich, wer es nimmt (gpu-lauf.sh, gpu-schloss.sh, die Runner-Hooks,
// die Serien der OMEN). Diese Schleife liest es je Gerät und meldet es als EIN je Gerät überschriebener Ref `refs/puls/<gerät>` (ein
// eltern-loser Commit mit puls.json, force-push; nie ein Commit in der Geschichte von koordination): frei · Halter (wer, Art, pid, seit) · sein
// LEBENSZEICHEN = die CPU-Zeit seines Prozess-Baums (ein Halter, dessen Prozess lebt, aber nichts tut, wächst nicht) und `regt` = wann sie
// zuletzt wuchs · wie viele am Schloss warten (gpu-lauf.sh vor dem Schloss, Vorrang-Einträge, ein CI-Job im Start-Hook) und wer.
// Gepusht bei Änderung höchstens je 60 s, sonst als Herzschlag je 120 s: kein Puls seit 5 min heißt in der Uhr BLIND, nie „Frei“.
// Der Leser ist messplatz-uhr.cjs (pulsUrteil · pulsEin).
// DIE WELTEN NEBEN DEM SCHLOSS (14.11.: auf der OMEN lief 10:58–15:16 eine verwaiste Werkbank, `werkbank start --port 4793 --ort dorf`, eine
// ganze Welt mit eigenem Browser, neben dem Schloss — der Puls kannte nur den Halter, jede Millisekunde der Karte im Fenster ist entwertet).
// `welten` = die lauschenden Welt-Ports auf 127.0.0.1, gefaltet je Welt: die Werkbank (scripts/werkbank.cjs) lauscht mit Steuer `--port P`
// (Vorgabe 4490) und Seite P−1 — ein Paar ist EINE Welt („4792/4793“); die Diag-Läufe (welt-boot) lauschen mit einem Port. Geprüft per
// net.connect über 3000 und 4400–4999 (alle Ports der Werkbank- und Diag-Aufrufe im Repo), parallel, 250 ms Frist. Der Leser ist
// werkzeug/wache-geraete.cjs (weltUrteil: WELT NEBEN DEM SCHLOSS).
// Aufruf: node schloss-puls.cjs --geraet <radeon|omen|gtx1050> --repo <klon mit origin> --schleife   (puls-dienst.sh)
//         node schloss-puls.cjs --geraet <g> --einmal      misst einmal und druckt puls.json (pusht nichts)
//         node schloss-puls.cjs --geraet <g> --welten      nur die Welt-Ports mit ihrer Dauer
//         node schloss-puls.cjs --selbsttest
const fs = require("fs");
const net = require("net");
const os = require("os");
const path = require("path");
const { execFileSync } = require("child_process");

const TEMP_CLAUDE = path.join(process.env.TEMP || os.tmpdir(), "claude");
const SCHLOSS = process.env.GPU_SCHLOSS_WIN || path.join(TEMP_CLAUDE, "gpu-schloss");
const HOOK_LOG = process.env.GPU_HOOK_LOG_WIN || "C:/actions-runner/hooks/hook.log";
const TAKT_S = 30, AENDERUNG_S = 60, HERZ_S = 120;
const REGT_CPU_S = 0.5; // so viel CPU-Zeit muss der Baum des Halters zwischen zwei Takten wachsen, damit er „regt“
const START_SPIEL_S = 2; // gemein.sh halter_lebt: der Halter ist pid + Start, nie die pid allein
const arg = (n) => { const i = process.argv.indexOf(n); return i > 0 ? process.argv[i + 1] : null; };
const sek = (ms) => Math.floor(ms / 1000);

// ── REINE FUNKTIONEN (der Selbsttest urteilt jede) ─────────────────────────────────────────────────────────────────────
// die Art des Halters aus seinem Namen
function artVon(wer) {
    const w = String(wer || "");
    if (/^ci-runner\b/.test(w)) return "CI";
    if (/^gate:|\btor\b/i.test(w)) return "TOR";
    if (/abab/i.test(w)) return "ABAB";
    if (/nachwache|z\d+w\b/i.test(w)) return "NACHWACHE";
    if (/probe/i.test(w)) return "PROBE";
    if (/punkte|mess|sitzung|station|takt/i.test(w)) return "MESSUNG";
    return "LAUF";
}
// die Lage am Schloss aus dem, was das Gerät sieht: s = { da, besitzer (Text), seit (s), plaetze: [Text] , vorrang: [{ pid, wer }], hookWartet },
// ps = [{ pid, ppid, name, start (s), cpu (s), cmd }] → { frei, halter: { wer, art, pid, seit, lebt, cpu, n }, warten, wartende }
function lage(s, ps) {
    const byPid = new Map(ps.map((p) => [p.pid, p]));
    const kinder = new Map();
    for (const p of ps) { if (!kinder.has(p.ppid)) kinder.set(p.ppid, []); kinder.get(p.ppid).push(p); }
    const baum = (wurzeln) => { const da = new Set(), st = [...wurzeln]; while (st.length) { const p = st.pop(); if (da.has(p.pid)) continue; da.add(p.pid); st.push(...(kinder.get(p.pid) || []).filter((k) => k.start >= p.start - START_SPIEL_S)); } return da; };
    // das Abbild sh.exe ODER bash.exe (gemein.sh schleife_lebt, 14.11.: bis dahin nur „bash“ — eine gpu-lauf unter sh.exe wartete unsichtbar)
    const gpuLauf = (p) => /gpu-lauf\.sh/.test(p.cmd || "") && /^(bash|sh)(\.exe)?$/i.test(p.name || "");
    // wer vor dem Schloss steht: jede gpu-lauf.sh (die oberste ihres Aufrufs, nie ihre Unter-Shells), die nicht im Baum des Halters lebt
    const wartendeVon = (halterBaum) => {
        const o = [];
        for (const p of ps) {
            if (!gpuLauf(p) || halterBaum.has(p.pid)) continue;
            const e = byPid.get(p.ppid);
            if (e && gpuLauf(e)) continue;
            o.push({ pid: p.pid, wer: (/gpu-lauf\.sh"?\s+"?([^\s"]+)/.exec(p.cmd) || [])[1] || "gpu-lauf" });
        }
        // eine Vorrang-Marke wartet nur, solange IHR Halter lebt: pid + Start (der Prozess begann vor der Marke; 14.11.: die Marke 87024
        // einer toten Sitzung trug ab 03:26:57 ein fremdes grep.exe)
        for (const v of s.vorrang || []) if (byPid.has(v.pid) && (v.t == null || byPid.get(v.pid).start <= v.t + START_SPIEL_S) && !halterBaum.has(v.pid) && !o.some((x) => x.pid === v.pid)) o.push({ pid: v.pid, wer: v.wer || "Vorrang" });
        if (s.hookWartet) o.push({ pid: null, wer: "CI-Job (Start-Hook)" });
        return o;
    };
    if (!s.da) { const w = wartendeVon(new Set()); return { frei: true, halter: null, warten: w.length, wartende: w.map((x) => x.wer).slice(0, 6) }; }
    const zeilen = [s.besitzer, ...(s.plaetze || [])].filter(Boolean);
    const wer = String(s.besitzer || "?").split(/\r?\n/)[0].trim() || "?";
    // die Wurzeln des Halters: je besitzer-Datei ihre pid (gpu-lauf.sh: „<name> <zeit> pid=<n>“ in Zeile 1, gpu-schloss.sh: Zeile 2), lebend
    // nur, wenn ihr Prozess vor dem Schloss begann (eine neu vergebene Nummer ist nie der Halter); ein ci-runner-Schloss hält der Runner.Worker
    const pids = [...new Set(zeilen.map((z) => Number((/pid=(\d+)/.exec(z) || [])[1])).filter(Boolean))];
    let wurzeln = pids.map((p) => byPid.get(p)).filter((p) => p && (s.seit == null || p.start <= s.seit + START_SPIEL_S));
    if (/^ci-runner\b/.test(wer)) wurzeln = wurzeln.concat(ps.filter((p) => /^Runner\.Worker/i.test(p.name || "")));
    // DER AUFTRAGGEBER arbeitet mit (11.11. 20:01, Radeon): die Punkte-Sitzung hält das Schloss mit gpu-lauf.sh um einen Warter, die
    // warme Welt (`punkte.cjs halter`, Werkbank, Chrome) ist das Kind des Laufs daneben — der Baum der gpu-lauf allein zeigte 0,8 s CPU.
    // Darum zählt der Baum des Aufrufers der obersten gpu-lauf mit (node · bash · timeout · npm · Shell; nie die App oder ein Dienst)
    wurzeln = wurzeln.concat(wurzeln.map((w) => {
        let p = w;
        for (let i = 0; i < 6 && byPid.get(p.ppid) && gpuLauf(byPid.get(p.ppid)); i++) p = byPid.get(p.ppid);
        const a = byPid.get(p.ppid);
        return a && /^(node|bash|sh|timeout|npm|powershell|pwsh|cmd)(\.exe)?$/i.test(a.name || "") && a.start <= p.start + START_SPIEL_S ? a : null;
    }).filter(Boolean));
    const hb = baum(wurzeln);
    let cpu = 0;
    for (const pid of hb) cpu += byPid.get(pid).cpu || 0;
    const w = wartendeVon(hb);
    return {
        frei: false,
        halter: { wer, art: artVon(wer), pid: pids[0] || null, seit: s.seit, lebt: wurzeln.length > 0, cpu: Math.round(cpu * 10) / 10, n: hb.size },
        warten: w.length, wartende: w.map((x) => x.wer).slice(0, 6),
    };
}
// DAS LEBENSZEICHEN über die Takte: alt = { key, cpu, regt } (Halter und seit als Schlüssel) → regt = wann die CPU-Zeit des Halter-Baums
// zuletzt um ≥ REGT_CPU_S wuchs; ein neuer Halter beginnt bei seinem seit (er hat eben genommen), ein toter regt nie
function regung(alt, la, jetzt) {
    if (la.frei) return { stand: null, regt: null };
    const h = la.halter, key = `${h.wer}|${h.seit}`;
    if (!alt || alt.key !== key) { const regt = h.seit != null ? Math.min(jetzt, h.seit) : jetzt; return { stand: { key, cpu: h.cpu, regt }, regt }; }
    const regt = h.lebt && Math.abs(h.cpu - alt.cpu) >= REGT_CPU_S ? jetzt : alt.regt;
    return { stand: { key, cpu: h.cpu, regt }, regt };
}
// die lauschenden Ports → je Welt ein Eintrag: zwei benachbarte Ports (Seite P−1, Steuer P) sind EINE Werkbank-Welt, ein einzelner ist eine Welt
function falte(ports) {
    const s = [...new Set(ports)].sort((a, b) => a - b), o = [];
    for (let i = 0; i < s.length; i++) {
        if (s[i + 1] === s[i] + 1) { o.push(`${s[i]}/${s[i + 1]}`); i++; } else o.push(String(s[i]));
    }
    return o;
}
// pushen? letzter = { key, t } des letzten Pushes; key = der Inhalt ohne die Messzeit
function sollPushen(letzter, key, jetzt) {
    if (!letzter) return true;
    const alt = jetzt - letzter.t;
    return alt >= HERZ_S || (key !== letzter.key && alt >= AENDERUNG_S);
}

// ── MESSEN (das Gerät selbst) ───────────────────────────────────────────────────────────────────────────────────────────
const lies = (p) => { try { return fs.readFileSync(p, "utf8"); } catch (_e) { return null; } };
function schlossSehen(dir = SCHLOSS) {
    const o = { da: false, besitzer: null, seit: null, plaetze: [], vorrang: [], hookWartet: false };
    try {
        const st = fs.statSync(dir);
        o.da = st.isDirectory();
        o.seit = sek(st.birthtimeMs || st.mtimeMs);
        o.besitzer = lies(path.join(dir, "besitzer.txt")) || "?";
        for (const n of fs.readdirSync(dir)) if (/^platz\.\d+$/.test(n)) { const b = lies(path.join(dir, n, "besitzer.txt")); if (b) o.plaetze.push(b); }
    } catch (_e) { /* kein Ordner: frei */ }
    try { for (const n of fs.readdirSync(dir + ".vorrang")) if (/^\d+$/.test(n)) o.vorrang.push({ pid: Number(n), t: sek(fs.statSync(path.join(dir + ".vorrang", n)).mtimeMs), wer: (lies(path.join(dir + ".vorrang", n)) || "").split(/\r?\n/)[0].trim() }); } catch (_e) { /* kein Vorrang */ }
    const hook = lies(HOOK_LOG);
    o.hookWartet = !!hook && /wartet auf Schloss/.test(hook.trimEnd().split(/\r?\n/).pop() || "");
    return o;
}
// die Prozess-Tafel (Windows): pid, Elter, Name, Start, CPU-Zeit (User + Kernel), Befehlszeile — EIN Aufruf je Takt
function prozesse() {
    const ps1 = "$ErrorActionPreference='Stop'; [Console]::OutputEncoding = [Text.Encoding]::UTF8; Get-CimInstance Win32_Process | ForEach-Object { $c = [string]$_.CommandLine -replace '\\s+', ' '; if ($c.Length -gt 300) { $c = $c.Substring(0, 300) }; @($_.ProcessId, $_.ParentProcessId, $_.Name, $(if ($_.CreationDate) { ([DateTimeOffset]$_.CreationDate).ToUnixTimeSeconds() } else { 0 }), [string]::Format([Globalization.CultureInfo]::InvariantCulture, '{0:0.0}', ([double]$_.UserModeTime + [double]$_.KernelModeTime) / 1e7), $c) -join [char]9 }";
    const out = execFileSync("powershell", ["-NoProfile", "-NonInteractive", "-Command", ps1], { encoding: "utf8", timeout: 60000, windowsHide: true, maxBuffer: 1 << 26, stdio: ["ignore", "pipe", "pipe"] });
    const ps = [];
    for (const z of out.split(/\r?\n/)) {
        const [pid, ppid, name, start, cpu, cmd] = z.split("\t");
        if (!pid || !/^\d+$/.test(pid)) continue;
        ps.push({ pid: +pid, ppid: +ppid, name, start: +start, cpu: Number(String(cpu).replace(",", ".")) || 0, cmd: cmd || "" });
    }
    if (!ps.length) throw new Error("Prozess-Tafel leer");
    return ps;
}
// die Welt-Ports: 3000 und 4400–4999 (Werkbank-Vorgabe 4490/4489, Diag 45xx, playtest 4586, OMEN 4792/4793, Radeon 4849–4851); kein Prozess
// je Port — ein net.connect je Port, alle zugleich, 250 ms Frist (ein lauschender Port auf 127.0.0.1 antwortet in Millisekunden)
const WELT_PORTS = [3000, ...Array.from({ length: 600 }, (_, i) => 4400 + i)];
const lauscht = (port, ms) => new Promise((ok) => {
    const so = net.connect({ host: "127.0.0.1", port });
    const ende = (v) => { clearTimeout(t); so.destroy(); ok(v); };
    const t = setTimeout(() => ende(false), ms);
    so.once("connect", () => ende(true));
    so.once("error", () => ende(false));
});
async function weltenSehen(ports = WELT_PORTS, ms = 250) {
    const an = await Promise.all(ports.map((p) => lauscht(p, ms)));
    return falte(ports.filter((_, i) => an[i]));
}
async function messen(geraet, alt, jetzt = sek(Date.now())) {
    const welten = await weltenSehen();
    const s = schlossSehen(), ps = prozesse(); // auch frei: wer vor dem Schloss wartet
    const la = lage(s, ps), r = regung(alt, la, jetzt);
    if (la.halter) la.halter.regt = r.regt;
    // KEIN Rechnername im Puls: das Repo ist öffentlich, `geraet` nennt das Gerät, und kein Leser las je `host` (11.11.)
    // `welten` VOR der Lage: radeon-dienst.sh liest die Zeilen NACH „wartende“ als Wartende
    return { puls: { v: 1, geraet, t: jetzt, welten, ...la }, stand: r.stand };
}

// ── PUSHEN: ein eltern-loser Commit in einem eigenen nackten Repo (die Geschichte keines Zweigs wächst, der Klon sammelt keine Objekte) ──
const PULS_GIT = path.join(TEMP_CLAUDE, "puls.git");
function git(args, opt = {}) { return execFileSync("git", args, { encoding: "utf8", timeout: 90000, windowsHide: true, stdio: ["pipe", "pipe", "pipe"], ...opt }).trim(); }
function pushen(repo, geraet, puls, n) {
    // GANZ oder neu (14.11. 11:01–11:42, OMEN: ein Aufräumer des Temp-Ordners nahm dem Ablage-Repo den leeren Ordner `refs` — `HEAD` stand
    // noch, also kein init, und jeder Takt endete 41 min lang mit „not a git repository“; der Blick zeigte die OMEN als BLIND): fehlt HEAD,
    // `refs` oder `objects`, legt `git init` das Repo neu an (init auf ein bestehendes Repo ergänzt nur, was fehlt)
    if (!["HEAD", "refs", "objects"].every((n) => fs.existsSync(path.join(PULS_GIT, n)))) git(["init", "-q", "--bare", PULS_GIT]);
    const url = git(["-C", repo, "remote", "get-url", "origin"]);
    const blob = git(["-C", PULS_GIT, "hash-object", "-w", "--stdin"], { input: JSON.stringify(puls, null, 1) + "\n" });
    const baum = git(["-C", PULS_GIT, "mktree"], { input: `100644 blob ${blob}\tpuls.json\n` });
    const env = { ...process.env, GIT_AUTHOR_NAME: "MiguellD", GIT_AUTHOR_EMAIL: "87209049+MiguellD@users.noreply.github.com", GIT_COMMITTER_NAME: "MiguellD", GIT_COMMITTER_EMAIL: "87209049+MiguellD@users.noreply.github.com" };
    const c = git(["-C", PULS_GIT, "commit-tree", baum, "-m", `puls ${geraet} ${puls.frei ? "frei" : "belegt " + puls.halter.wer}`], { env });
    git(["-C", PULS_GIT, "push", "-q", "--force", url, `${c}:refs/puls/${geraet}`]);
    if (n % 500 === 0) try { git(["-C", PULS_GIT, "prune", "--expire=now"]); } catch (_e) { /* der nächste Takt räumt */ }
    return c;
}
function schleife(geraet, repo) {
    const standDatei = path.join(TEMP_CLAUDE, `puls-${geraet}.json`); // das Lebenszeichen überlebt den Neustart der Schleife
    let alt = null, letzter = null, n = 0;
    try { alt = JSON.parse(lies(standDatei)); } catch (_e) { alt = null; }
    let laeuft = false;
    const takt = async () => {
        if (laeuft) return;
        laeuft = true;
        const jetzt = sek(Date.now());
        try {
            const m = await messen(geraet, alt, jetzt);
            alt = m.stand;
            try { fs.writeFileSync(standDatei, JSON.stringify(alt)); } catch (_e) { /* ohne Temp kein Neustart-Gedächtnis */ }
            const { t, ...ohneT } = m.puls, key = JSON.stringify(ohneT);
            if (sollPushen(letzter, key, jetzt)) {
                const c = pushen(repo, geraet, m.puls, ++n);
                letzter = { key, t: jetzt };
                console.log(`${new Date().toTimeString().slice(0, 8)} puls ${geraet} ${c.slice(0, 8)} ${m.puls.frei ? "frei" : `belegt ${m.puls.halter.wer} cpu ${m.puls.halter.cpu} s regt ${new Date(m.puls.halter.regt * 1000).toTimeString().slice(0, 8)}`} · ${m.puls.warten} warten · Welten ${m.puls.welten.join(" ") || "—"}`);
            }
        } catch (e) { console.log(`${new Date().toTimeString().slice(0, 8)} PULS-FEHLER ${geraet}: ${String(e.message).split("\n")[0]}`); }
        laeuft = false;
    };
    takt();
    setInterval(takt, TAKT_S * 1000);
}

// ── SELBSTTEST ───────────────────────────────────────────────────────────────────────────────────────────────────────
function faelle(F) {
    const rot = [], p = (n, ok) => { if (!ok) rot.push(n); };
    const t0 = 1794330000;
    const ps = [
        { pid: 10, ppid: 1, name: "bash.exe", start: t0 - 100, cpu: 0.2, cmd: "bash gpu-lauf.sh gate:haus-welt npm run gate:haus-welt" },
        { pid: 11, ppid: 10, name: "bash.exe", start: t0 - 99, cpu: 0.1, cmd: "bash gpu-lauf.sh gate:haus-welt npm run gate:haus-welt" },
        { pid: 12, ppid: 10, name: "node.exe", start: t0 - 99, cpu: 40, cmd: "node scripts/haus-welt.cjs" },
        { pid: 13, ppid: 12, name: "chrome.exe", start: t0 - 90, cpu: 300, cmd: "chrome --remote-debugging-port=9300" },
        { pid: 20, ppid: 1, name: "bash.exe", start: t0 - 50, cpu: 0.1, cmd: "bash p3/gpu-lauf.sh punkte-gtx node punkte.cjs" },
        { pid: 30, ppid: 1, name: "node.exe", start: t0 - 5000, cpu: 9, cmd: "node fremd.js" },
    ];
    const s = { da: true, besitzer: "gate:haus-welt 2026-11-11T19:33:49+01:00 pid=10\n", seit: t0 - 100, plaetze: [], vorrang: [{ pid: 20, wer: "punkte-gtx" }], hookWartet: false };
    const la = F.lage(s, ps);
    p("L1 Halter gate:haus-welt (TOR) lebt, sein Baum 4 Prozesse, CPU 340,3 s, die fremde node zählt nie", la.halter.wer.startsWith("gate:haus-welt") && la.halter.art === "TOR" && la.halter.lebt && la.halter.n === 4 && la.halter.cpu === 340.3);
    p("L2 ein Wartender (punkte-gtx, einmal: gpu-lauf und Vorrang derselbe), die Unter-Shell des Halters wartet nie", la.warten === 1 && la.wartende.join() === "punkte-gtx");
    p("L3 neu vergebene pid (Prozess jünger als das Schloss) ist nie der Halter", F.lage({ ...s, besitzer: "x pid=30", seit: t0 - 6000 }, ps).halter.lebt === false);
    p("L4 kein Ordner: frei, zwei gpu-lauf und der CI-Job im Start-Hook warten", (() => { const f = F.lage({ da: false, vorrang: [], hookWartet: true }, ps); return f.frei && f.warten === 3; })());
    p("L5 ci-runner hält: der Runner.Worker ist die Wurzel", F.lage({ da: true, besitzer: "ci-runner 99/1 echt", seit: t0 - 10, vorrang: [] }, [{ pid: 5, ppid: 1, name: "Runner.Worker.exe", start: t0 - 20, cpu: 7, cmd: "" }]).halter.cpu === 7);
    // die Sitzung: gpu-lauf (Hülle 40 → bash 41) um einen Warter, die Welt arbeitet im Kind des Aufrufers (node 39 → halter 42 → chrome 43)
    const sz = [
        { pid: 39, ppid: 1, name: "node.exe", start: t0 - 2000, cpu: 5, cmd: "node punkte.cjs run --sha b0112f7b --geraet radeon --offen" },
        { pid: 40, ppid: 39, name: "bash.exe", start: t0 - 20, cpu: 0.1, cmd: "bash.exe gpu-lauf.sh punkte-radeon-sitzung node punkte.cjs warte" },
        { pid: 41, ppid: 40, name: "bash.exe", start: t0 - 20, cpu: 0.2, cmd: "usr/bin/bash.exe gpu-lauf.sh punkte-radeon-sitzung node punkte.cjs warte" },
        { pid: 42, ppid: 39, name: "node.exe", start: t0 - 19, cpu: 20, cmd: "node punkte.cjs halter --baum x" },
        { pid: 43, ppid: 42, name: "chrome.exe", start: t0 - 18, cpu: 100, cmd: "chrome" },
        { pid: 44, ppid: 2, name: "claude.exe", start: t0 - 9000, cpu: 900, cmd: "claude" },
    ];
    const ls6 = F.lage({ da: true, besitzer: "punkte-radeon-sitzung\npid=41\n", seit: t0 - 19, vorrang: [] }, sz);
    p("L6 die Sitzung: der Aufrufer der gpu-lauf arbeitet mit (CPU 125,3 s), keine Hülle wartet", ls6.halter.cpu === 125.3 && ls6.warten === 0);
    // die Marke 87024 (14.11.): die Sitzung starb, ein fremder Prozess (node 30, begann 1000 s NACH der Marke) trägt die Nummer
    const geist = { da: false, vorrang: [{ pid: 30, t: t0 - 6000, wer: "punkte-radeon-sitzung" }], hookWartet: false };
    const lebend = { da: false, vorrang: [{ pid: 30, t: t0 - 4000, wer: "punkte-radeon-sitzung" }], hookWartet: false };
    p("L7 Vorrang-Marke mit neu vergebener pid (Prozess jünger als die Marke) wartet nie · mit ihrem Halter wartet sie", !F.lage(geist, [ps[5]]).wartende.length && F.lage(lebend, [ps[5]]).wartende.join() === "punkte-radeon-sitzung");
    // DAS LEBENSZEICHEN
    const h =(cpu, lebt = true) => ({ frei: false, halter: { wer: "gate:haus-welt", seit: t0 - 100, cpu, lebt } });
    const r1 = F.regung(null, h(10), t0);
    p("R1 neuer Halter: regt = seit", r1.regt === t0 - 100);
    const r2 = F.regung(r1.stand, h(12), t0 + 30);
    p("R2 die CPU wächst 2 s ⇒ regt jetzt", r2.regt === t0 + 30);
    const r3 = F.regung(r2.stand, h(12.1), t0 + 60);
    p("R3 der Halter lebt, tut nichts (0,1 s) ⇒ regt bleibt", r3.regt === t0 + 30);
    p("R4 ein toter Halter regt nie", F.regung(r2.stand, h(50, false), t0 + 90).regt === t0 + 30);
    p("R5 frei ⇒ kein Stand", F.regung(r2.stand, { frei: true }, t0).stand === null);
    // PUSHEN
    p("P1 erster Takt pusht · gleich nach 60 s nicht · Herzschlag nach 120 s · Änderung nach 60 s", F.sollPushen(null, "a", t0) && !F.sollPushen({ key: "a", t: t0 }, "a", t0 + 60) && F.sollPushen({ key: "a", t: t0 }, "a", t0 + 120) && F.sollPushen({ key: "a", t: t0 }, "b", t0 + 60) && !F.sollPushen({ key: "a", t: t0 }, "b", t0 + 30));
    // DIE WELTEN: das Paar der Werkbank (Seite 4792, Steuer 4793) ist EINE Welt, die Diag-Welt (4548) und 3000 je eine
    p("W1 Welten gefaltet: 3000 · 4548 · 4792/4793 (das Paar Seite+Steuer zählt einmal)", F.falte([4793, 4548, 4792, 3000]).join() === "3000,4548,4792/4793" && F.falte([]).length === 0);
    return rot;
}
const ECHT = { lage, regung, sollPushen, falte };
const MUTANTEN = {
    "Lebenszeichen: Belegung = Arbeit (regt immer jetzt)": { regung: (a, l, j) => { const r = regung(a, l, j); return { ...r, regt: l.frei ? null : j }; } },
    "Halter: die pid allein (eine neu vergebene Nummer lebt)": { lage: (s, ps) => lage({ ...s, seit: null }, ps) },
    "Warten: jede gpu-lauf-Shell zählt (Unter-Shells, der Halter)": { lage: (s, ps) => { const o = lage(s, ps); return { ...o, warten: ps.filter((p) => /gpu-lauf/.test(p.cmd)).length }; } },
    "Halter: nur der Baum der gpu-lauf (die Sitzung arbeitet im Aufrufer, 0,8 s CPU)": { lage: (s, ps) => lage(s, ps.map((p) => (p.ppid === 39 && p.pid === 40 ? { ...p, ppid: 999 } : p))) },
    "Pushen: je Takt (jede Minute Commits)": { sollPushen: () => true },
    "Vorrang: die pid allein (die Marke einer toten Sitzung lebt in jedem fremden Prozess)": { lage: (s, ps) => lage({ ...s, vorrang: (s.vorrang || []).map(({ t, ...v }) => v) }, ps) },
    "Welten: jeder Port eine Welt (die Werkbank zählt doppelt, Halter + Kandidat hieße vier)": { falte: (ps) => [...ps].sort((a, b) => a - b).map(String) },
};
if (require.main === module) {
    if (process.argv.includes("--selbsttest")) {
        const rot = faelle(ECHT), mut = Object.entries(MUTANTEN).map(([n, m]) => [n, faelle({ ...ECHT, ...m })]);
        const blieb = mut.filter(([, r]) => !r.length).map(([n]) => n);
        if (process.argv.includes("-v")) for (const [n, r] of mut) console.log(`  Mutante „${n}“ ROT an: ${r.join(" · ") || "—"}`);
        console.log(rot.length || blieb.length ? `schloss-puls SELBSTTEST ROT: ${[...rot, ...blieb.map((n) => `Mutante „${n}“ bleibt grün`)].join(" · ")}` : `schloss-puls SELBSTTEST GRÜN: 14 Fälle grün, ${mut.length}/${mut.length} Mutanten ROT`);
        process.exitCode = rot.length || blieb.length ? 1 : 0;
    } else {
        const g = arg("--geraet");
        if (!/^(radeon|omen|gtx1050)$/.test(g || "")) { console.log("Aufruf: node schloss-puls.cjs --geraet <radeon|omen|gtx1050> (--einmal | --repo <klon> --schleife | --selbsttest)"); process.exitCode = 2; }
        else if (process.argv.includes("--einmal")) messen(g, null).then((m) => console.log(JSON.stringify(m.puls, null, 1)), (e) => { console.log("PULS-FEHLER " + e.message); process.exitCode = 1; });
        else if (process.argv.includes("--welten")) { const t = Date.now(); weltenSehen().then((w) => console.log(`welten ${JSON.stringify(w)} in ${Date.now() - t} ms (${WELT_PORTS.length} Ports)`)); }
        else if (process.argv.includes("--schleife")) schleife(g, arg("--repo") || process.cwd());
        else { console.log("--einmal oder --schleife"); process.exitCode = 2; }
    }
}
module.exports = { lage, regung, sollPushen, artVon, messen, falte, weltenSehen };
