#!/usr/bin/env node
"use strict";
// zug.cjs — der Merge-Zug (Rumpf von zug.sh; Hilfe zug.md). Geurteilt wird genau der SHA, der landet; ein roter Zweig
// fällt aus dem Zug, statt die Spur zu sperren. Verben: bereit · bau · urteil · teile · wackler · landen · punkte · loese (intern).
const { execFileSync, spawn, spawnSync } = require("child_process");
const fs = require("fs");
const os = require("os");
const path = require("path");

const REPO = "MiguellD/AnazhRealm";
const API = `https://api.github.com/repos/${REPO}`;
const INTEG = "C:/Users/micha/AnazhRealm-integ";
const ZUG = process.env.ZUG_WT || "C:/Users/micha/AnazhRealm-zug";
const VOLL = "C:/Users/micha/AnazhRealm-profiband";
const KOORD = process.env.ZUG_KOORD || "C:/Users/micha/AnazhRealm-profiband/.claude/worktrees/koordination";
const PFLICHT = ["puls 1/2", "puls 2/2", ...Array.from({ length: 18 }, (_, i) => `voll ${i + 1}/18`)];
const SIEGEL_CI = /\b(fertig|vollendet|vollzogen|schluss)\b|scope\s+zu/i; // dieselbe Wand wie diag-betriebsgesetz.cjs
const SIEGEL_CS = /\bRUND\b/;
const CO = "Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>";

// ── git + API ────────────────────────────────────────────────────────────────────────────────────────────────────────
function git(args, cwd = ZUG, ok = false) {
    const r = spawnSync("git", args, { cwd, encoding: "utf8", maxBuffer: 1 << 28 });
    if (r.status !== 0 && !ok) throw new Error(`git ${args.join(" ")}: ${(r.stderr || r.stdout).trim().slice(0, 400)}`);
    return ok ? r : r.stdout.trim();
}
const H = () => ({ Authorization: "Bearer " + process.env.TOKEN, Accept: "application/vnd.github+json" });
async function api(p, method = "GET") {
    let r;
    for (let v = 0; ; v++) {
        try {
            r = await fetch(p.startsWith("http") ? p : API + p, { method, headers: H() });
            if (r.status < 500 || v >= 2) break;
        } catch (e) {
            if (v >= 2) throw e; // Sockel-Abriss (gemessen 22.10.: UND_ERR_SOCKET) — drei Versuche
        }
        await new Promise((ok) => setTimeout(ok, 1500));
    }
    if (method !== "GET") return r.status;
    if (!r.ok) throw new Error(`API ${p}: ${r.status}`);
    return r.json();
}
// die Runs-Suche nach head_sha antwortet zuweilen leer (gemessen 22.10.: 51c2f0be 0 · 1 · 0 in drei Rufen) — darum bis zu
// vier Blicke und dazu die Läufe der genannten Zweige (branch=…, gefiltert auf den SHA); Vereinigung nach Lauf-Id
async function runsFuer(sha, zweige = []) {
    const je = new Map();
    for (const n of [50, 49, 48, 47]) {
        const r = await api(`/actions/runs?head_sha=${sha}&per_page=${n}`);
        for (const x of r.workflow_runs || []) je.set(x.id, x);
        if (je.size) break;
    }
    for (const z of zweige) {
        const r = await api(`/actions/runs?branch=${encodeURIComponent(z)}&per_page=30`);
        for (const x of r.workflow_runs || []) if (x.head_sha === sha) je.set(x.id, x);
    }
    return [...je.values()].filter((x) => x.name === "Code-Check");
}
async function jobsAlle(run) {
    const out = [];
    for (let s = 1; ; s++) {
        const j = await api(`/actions/runs/${run.id}/jobs?filter=all&per_page=100&page=${s}`);
        out.push(...(j.jobs || []));
        if (!j.jobs || j.jobs.length < 100) return out;
    }
}
const kurz = (n) => n.replace(/ (cpu|gpu)$/, "").replace(/ \(.*\)$/, "");
// Werkzeug = Prüf-Apparat und Doku, nie Laufzeit (Stamm, Kerne, worlds, index.html, package.json zählen als Laufzeit)
const istWerkzeug = (namen) => {
    const l = namen.split("\n").filter(Boolean);
    return l.length > 0 && l.every((f) => /^(scripts|spec|\.github)\//.test(f) || /\.md$/.test(f));
};
const rotSchritt = (j) => ((j.steps || []).find((s) => s.conclusion === "failure") || {}).name || "?";
const ROT = new Set(["failure", "cancelled", "timed_out", "startup_failure", "action_required"]);
// je Job-Name der letzte Versuch und die Wackler (ein früherer Versuch rot, ein späterer grün)
function lesart(jobs) {
    const je = new Map();
    for (const j of jobs.filter((x) => !x.name.includes("${{"))) (je.get(j.name) || je.set(j.name, []).get(j.name)).push(j);
    const letzte = new Map();
    const wackler = [];
    const wo = [];
    for (const [n, a] of je) {
        a.sort((x, y) => x.run_attempt - y.run_attempt);
        const l = a[a.length - 1];
        letzte.set(n, l);
        const rot = a.find((x) => ROT.has(x.conclusion) && x.run_attempt < l.run_attempt);
        if (rot && l.conclusion === "success") wackler.push(`${kurz(n)}/${rotSchritt(rot)}`), wo.push([kurz(n), rotSchritt(rot)]);
    }
    return { letzte, wackler, wo };
}

// ── bereit ───────────────────────────────────────────────────────────────────────────────────────────────────────────
function kopfVon(spec) {
    const [z, s] = spec.split("@");
    if (s) return { z, sha: git(["rev-parse", s], INTEG, true).stdout.trim() || s };
    const l = git(["ls-remote", "origin", `refs/heads/${z}`], INTEG);
    return { z, sha: l.split(/\s/)[0] };
}
async function bereit(args) {
    let rot = 0;
    for (const spec of args) {
        const { z, sha } = kopfVon(spec);
        if (!sha) {
            console.log(`${z}: nicht bereit: Zweig fehlt auf origin`);
            rot++;
            continue;
        }
        const runs = await runsFuer(sha, [z]);
        // je Lauf gelesen (ein von der Konkurrenz-Gruppe abgebrochener Zwillings-Lauf eines anderen Zweigs ist kein Rot)
        const je = (await Promise.all(runs.map(jobsAlle))).map(lesart);
        const wackler = [...new Set(je.flatMap((l) => l.wackler))];
        const letzteJe = (n) => je.flatMap((l) => [...l.letzte].filter(([k]) => kurz(k) === n).map(([, j]) => j));
        const gruen = PFLICHT.filter((n) => letzteJe(n).some((j) => j.conclusion === "success"));
        const offen = PFLICHT.filter((n) => !gruen.includes(n));
        const roteJ = offen.flatMap((n) => letzteJe(n).filter((j) => j.conclusion === "failure").map((j) => `${n}/${rotSchritt(j)}`));
        const lauf = offen.filter((n) => letzteJe(n).some((j) => j.status !== "completed"));
        const ab = offen.filter((n) => letzteJe(n).some((j) => j.conclusion === "cancelled"));
        const grund = !runs.length
            ? "kein Lauf am Kopf"
            : roteJ.length
              ? `rot ${roteJ.join(", ")}`
              : lauf.length
                ? `läuft ${lauf.join(", ")}`
                : offen.length && offen.every((n) => n.startsWith("voll")) && !ab.length
                  ? `keine volle Batterie am Kopf (Puls grün, [ci voll] fehlt)`
                  : offen.length
                    ? `fehlt ${offen.join(", ")}${ab.length ? " (abgebrochen)" : ""}`
                    : null;
        if (grund) rot++;
        console.log(
            `${z}@${sha.slice(0, 8)}: ${grund ? `nicht bereit: ${grund}` : "bereit"}` +
                (wackler.length ? ` · Wackler ${wackler.join(", ")}` : "")
        );
    }
    return rot ? 1 : 0;
}

// ── urteil ───────────────────────────────────────────────────────────────────────────────────────────────────────────
async function urteilVon(sha, { neulauf = true } = {}) {
    const alle = await runsFuer(sha, ["integ-probe", "zug-a", "zug-b"]);
    const runs = alle.filter((r) => r.conclusion !== "cancelled" || r.status !== "completed");
    if (!runs.length) {
        // ein ABGEBROCHENER Lauf (24.10.: der echt-Job unter Last am Deckel) ist ein Rot mit EINEM Neulauf — vorher hieß er
        // „KEIN LAUF", und der Fahrer wartete 120 min auf nichts
        const ab = alle.filter((r) => r.status === "completed" && r.conclusion === "cancelled").sort((a, b) => b.id - a.id)[0];
        if (!ab) return { wort: "KEIN LAUF", zeile: `KEIN LAUF am ${sha.slice(0, 8)}` };
        const ort = `Lauf ${ab.id} (${ab.head_branch}, Versuch ${ab.run_attempt})`;
        if (ab.run_attempt < 2 && neulauf) {
            const st = await api(`/actions/runs/${ab.id}/rerun-failed-jobs`, "POST");
            return { wort: "LAEUFT", run: ab, zeile: `LAEUFT Neulauf des abgebrochenen Laufs angestoßen (HTTP ${st}) · ${ort}` };
        }
        return { wort: "ROT", run: ab, rot: [{ n: "abgebrochen", s: ort }], zeile: `ROT abgebrochen · ${ort}` };
    }
    runs.sort((a, b) => (b.head_branch === "integ-probe") - (a.head_branch === "integ-probe") || b.id - a.id);
    const run = runs[0];
    const jobs = await jobsAlle(run);
    const { letzte, wackler } = lesart(jobs);
    const ort = `Lauf ${run.id} (${run.head_branch}, Versuch ${run.run_attempt})`;
    const lauf = [...letzte].filter(([, j]) => j.status !== "completed").map(([n]) => kurz(n));
    if (run.status !== "completed" || lauf.length)
        return { wort: "LAEUFT", run, zeile: `LAEUFT ${ort}: ${lauf.join(", ") || run.status}` };
    const rot = [...letzte].filter(([, j]) => ROT.has(j.conclusion)).map(([n, j]) => ({ n: kurz(n), s: rotSchritt(j) }));
    let fehlt = PFLICHT.filter((n) => ![...letzte.keys()].some((k) => kurz(k) === n));
    if (!rot.length) {
        // EIN Urteil je Kopf (ci-kopf): fährt integ-probe die Batterie nicht, weil ein anderer Lauf desselben SHA (integ-zug)
        // sie grün trägt, zählen dessen Pflicht-Jobs
        const tragend = [];
        if (fehlt.length) {
            const andere = (await runsFuer(sha, ["integ-zug"])).filter((r) => r.id !== run.id && r.status === "completed");
            for (const r of andere) {
                const { letzte: l2 } = lesart(await jobsAlle(r));
                const g = fehlt.filter((n) => [...l2].some(([k, j]) => kurz(k) === n && j.conclusion === "success"));
                if (g.length) tragend.push(r.id);
                fehlt = fehlt.filter((n) => !g.includes(n));
            }
        }
        const zus =
            (fehlt.length ? ` · ohne ${fehlt.length} Pflicht-Jobs (keine volle Batterie)` : "") +
            (tragend.length ? ` · Batterie aus Lauf ${tragend.join(", ")}` : "") +
            ` · ${ort}`;
        return wackler.length
            ? { wort: "GRUEN", run, wackler, zeile: `GRUEN mit Wackler ${wackler.join(", ")}${zus}` }
            : { wort: fehlt.length ? "UNVOLL" : "GRUEN", run, zeile: `${fehlt.length ? "UNVOLL" : "GRUEN"}${zus}` };
    }
    const nur = rot.every((r) => r.n.startsWith("echt"));
    const namen = rot.map((r) => `${r.n}/${r.s}`).join(", ");
    if (run.run_attempt < 2 && neulauf) {
        const st = await api(`/actions/runs/${run.id}/rerun-failed-jobs`, "POST");
        return { wort: "LAEUFT", run, rot, zeile: `LAEUFT Neulauf angestoßen (HTTP ${st}) für ${namen} · ${ort}` };
    }
    return { wort: "ROT", run, rot, echtNur: nur, zeile: `ROT ${namen}${nur ? " (echt-only)" : ""} · ${ort}` };
}

// ── wackler ──────────────────────────────────────────────────────────────────────────────────────────────────────────
async function wackler(args) {
    const i = args.indexOf("--tage");
    const tage = i >= 0 ? Number(args[i + 1]) : 7;
    const ab = new Date(Date.now() - tage * 864e5).toISOString().slice(0, 10);
    // die Liste antwortet zuweilen leer (gemessen 22.10.: Seite 1 = 0 von 605) — je Seite bis zu vier Blicke, bis total_count
    const seite = async (s) => {
        for (let v = 0; v < 8; v++) {
            const r = await api(`/actions/runs?created=%3E%3D${ab}&per_page=100&page=${s}`);
            if ((r.workflow_runs || []).length || v === 7) return r;
            await new Promise((ok) => setTimeout(ok, 1000 + 500 * v));
        }
    };
    const je1 = new Map();
    const erst = await seite(1);
    const total = Math.min(1000, erst.total_count || 0);
    for (let s = 1; s <= Math.ceil(total / 100); s++)
        for (const x of (s === 1 ? erst : await seite(s)).workflow_runs || []) je1.set(x.id, x);
    const runs = [...je1.values()].filter((x) => x.name === "Code-Check");
    const mehr = runs.filter((r) => r.run_attempt >= 2);
    const je = new Map();
    let unlesbar = 0;
    for (const run of mehr) {
        let jobs;
        try {
            jobs = await jobsAlle(run);
        } catch (e) {
            unlesbar++; // ein Lauf, dessen Jobs die API nicht liefert (502), wird benannt, nie still gezählt
            continue;
        }
        for (const [job, s] of lesart(jobs).wo) {
            const e = je.get(s) || je.set(s, []).get(s);
            e.push(`${job}@${run.head_sha.slice(0, 8)}(${run.head_branch})`);
        }
    }
    console.log(`Wackler seit ${ab}: ${runs.length} Läufe (von ${total}), ${mehr.length} mit Neulauf${unlesbar ? ` (${unlesbar} unlesbar)` : ""}, ${je.size} Schritte`);
    for (const [s, a] of [...je].sort((x, y) => y[1].length - x[1].length))
        console.log(`${a.length >= 2 ? "KARTE" : "einmal"} ${a.length}× ${s} — ${a.join(", ")}`);
    return 0;
}

// ── die Auflösung nach Klasse ────────────────────────────────────────────────────────────────────────────────────────
const VERS = [
    [/\?v=\d+\.\d+(?:\.\d+)?/g, "?v=#"],
    [/("version":\s*")[^"]+"/g, '$1#"'],
    [/(AnazhRealm\.VERSION = ")[0-9.]+"/g, '$1#"'],
    [/^(## Stand \(V)[0-9.]+/g, "$1#"],
];
const ohneVersion = (s) => VERS.reduce((t, [rx, e]) => t.replace(rx, e), s);
function kommentarRx(datei) {
    const e = path.extname(datei).toLowerCase();
    if ([".js", ".cjs", ".mjs", ".ts", ".wgsl", ".css", ".jsx"].includes(e)) return /^\s*(\/\/|\/\*|\*\/|\*(\s|$))/;
    if ([".sh", ".yml", ".yaml", ".py", ".toml"].includes(e)) return /^\s*#/;
    if (e === ".html") return /^\s*(<!--.*-->\s*$|\/\/)/;
    return null;
}
const leer = (z) => /^\s*\r?$/.test(z);
// Zeilen-Diff base → seite als Hunks {bs, be, neu} (LCS)
function hunks(a, b) {
    const n = a.length,
        m = b.length;
    const L = Array.from({ length: n + 1 }, () => new Uint32Array(m + 1));
    for (let i = n - 1; i >= 0; i--)
        for (let j = m - 1; j >= 0; j--) L[i][j] = a[i] === b[j] ? L[i + 1][j + 1] + 1 : Math.max(L[i + 1][j], L[i][j + 1]);
    const out = [];
    let [i, j, h] = [0, 0, null];
    const zu = () => h && (out.push(h), (h = null));
    while (i < n || j < m) {
        if (i < n && j < m && a[i] === b[j]) {
            zu();
            i++, j++;
        } else if (j < m && (i === n || L[i][j + 1] >= L[i + 1][j])) {
            h = h || { bs: i, be: i, neu: [] };
            h.neu.push(b[j++]);
        } else {
            h = h || { bs: i, be: i, neu: [] };
            h.be = ++i;
        }
    }
    zu();
    return out;
}
// zwei Hunks verschiedener Seiten stoßen zusammen: Überlappung, oder eine Einfügung am Rand/innen der anderen Seite
function stossen(a, b) {
    const ea = a.bs === a.be,
        eb = b.bs === b.be;
    if (ea && eb) return a.bs === b.bs;
    if (ea) return b.bs <= a.bs && a.bs <= b.be;
    if (eb) return a.bs <= b.bs && b.bs <= a.be;
    return a.bs < b.be && b.bs < a.be;
}
// (e) benachbart: jede Basis-Zeile berührt höchstens EINE Seite (Abstand 0 statt git's ≥ 1) — beide Änderungen gelten
function dreiWege(base, ours, theirs) {
    const ho = hunks(base, ours),
        ht = hunks(base, theirs);
    for (const a of ho) for (const b of ht) if (stossen(a, b)) return null;
    const alle = [...ho, ...ht].sort((x, y) => x.bs - y.bs || x.be - y.be);
    const out = [];
    let p = 0;
    for (const h of alle) out.push(...base.slice(p, h.bs), ...h.neu), (p = h.be);
    return out.concat(base.slice(p));
}
function loeseBlock(datei, o, b, t) {
    const no = o.map(ohneVersion),
        nt = t.map(ohneVersion);
    if (no.join("\n") === nt.join("\n")) return { kl: "c", z: o };
    let [v, h] = [0, 0];
    while (v < o.length && v < t.length && o[v] === t[v]) v++;
    while (h < o.length - v && h < t.length - v && o[o.length - 1 - h] === t[t.length - 1 - h]) h++;
    const om = o.slice(v, o.length - h),
        tm = t.slice(v, t.length - h);
    const k = kommentarRx(datei);
    if (k && [...om, ...tm].every((z) => leer(z) || k.test(z))) {
        // strichen BEIDE Seiten nur Zeilen der Basis, gilt die Vereinigung der Streichungen — jede Seite bezahlte damit ihre
        // Decke, und „die kürzere Seite" verlor die Zahlung der anderen (23.10.: Zug 10 fiel mit +273 Atomen an der Decke)
        const behalten = (s) => {
            const m = new Set();
            let i = 0;
            for (const z of s) {
                while (i < b.length && b[i] !== z) i++;
                if (i >= b.length) return null;
                m.add(i++);
            }
            return m;
        };
        const bo = b.length ? behalten(o) : null,
            bt = b.length ? behalten(t) : null;
        if (bo && bt) return { kl: "a", z: b.filter((_, i) => bo.has(i) && bt.has(i)) };
        const lo = om.join("\n").length,
            lt = tm.join("\n").length;
        return { kl: "a", z: lt < lo ? t : o };
    }
    // (f) gleich bis auf Leerraum (eine Seite prettier-gefaltet): der Code ist derselbe, die Seite mit weniger Zeilen gilt
    const ws = (a) => a.join(" ").replace(/\s+/g, " ").trim();
    if (ws(om) === ws(tm)) return { kl: "f", z: t.length < o.length ? t : o };
    const e = dreiWege(b, o, t);
    if (e) return { kl: "e", z: e };
    // (w) eine &&-Kette in EINER Zeile (package.json check:statik): Glied für Glied wie (e) — zwei Zweige hängen verschiedene
    // Prüfungen in dieselbe Zeile (23.10.: speicher-worker.js gegen diag-studio-uebergabe.cjs fiel als Klasse d)
    if (o.length === 1 && b.length === 1 && t.length === 1 && [o[0], b[0], t[0]].every((z) => z.includes(" && "))) {
        // der Schluss der Zeile (`",`) ist ein eigenes Glied: sonst stößt ein Anhängen am Ende mit jeder Einfügung davor
        const glied = (z) => {
            const m = /^(.*?)("\s*,?\s*)$/.exec(z);
            return m ? [...m[1].split(" && "), "\u0000" + m[2]] : z.split(" && ");
        };
        const w = dreiWege(glied(b[0]), glied(o[0]), glied(t[0]));
        if (w) {
            const ende = w.length && w[w.length - 1].startsWith("\u0000") ? w.pop().slice(1) : "";
            return { kl: "w", z: [w.join(" && ") + ende] };
        }
    }
    // (g) eine Seite änderte gegen die Basis NUR Kommentar-/Leerzeilen, die andere auch Code: die Code-Seite gilt (23.10.: fünf
    // grüne Zweige fielen an 55 Stücken in 30 Dateien, in denen der Zweig nur Chronik-Etiketten strich und main dieselben Zeilen
    // löschte oder umbaute; fünf Agenten holten sie von Hand heim). Die Decke prüft danach mergeEinen.
    if (k) {
        const code = (a) => a.filter((z) => !leer(z) && !k.test(z)).join("\n");
        const cb = code(b);
        if (code(t) === cb && code(o) !== cb) return { kl: "g", z: o };
        if (code(o) === cb && code(t) !== cb) return { kl: "g", z: t };
    }
    return null;
}
// eine Datei mit diff3-Markern → aufgelöster Text oder der erste Block, der nicht fällt (Zeile im Kandidaten)
function loeseDatei(datei, text) {
    const Z = text.split("\n");
    const out = [];
    const kl = {};
    let zeileO = 0;
    for (let i = 0; i < Z.length; ) {
        if (!/^<{7}( |\r?$)/.test(Z[i])) {
            out.push(Z[i++]), zeileO++;
            continue;
        }
        const start = zeileO + 1;
        const teil = { o: [], b: [], t: [] };
        let s = "o";
        for (i++; i < Z.length && !/^>{7}( |\r?$)/.test(Z[i]); i++) {
            if (/^\|{7}( |\r?$)/.test(Z[i])) s = "b";
            else if (/^={7}\r?$/.test(Z[i])) s = "t";
            else teil[s].push(Z[i]);
        }
        i++;
        const r = loeseBlock(datei, teil.o, teil.b, teil.t);
        if (!r) return { fall: `${datei}:${start}` };
        kl[r.kl] = (kl[r.kl] || 0) + 1;
        out.push(...r.z);
        zeileO += teil.o.length;
    }
    return { text: out.join("\n"), kl };
}
// (b) die Modul-Karte: 3-Wege-Mengen-Merge je Modul-Schlüssel, Zeilen-Format wie die Datei
function karteText(j) {
    const s = JSON.stringify;
    const ord = j.ordnung.map((r, i) => `  ${s(r).replace(/","/g, '", "')}${i < j.ordnung.length - 1 ? "," : ""}`);
    const ks = Object.keys(j.module);
    const mod = ks.map((k, i) => `  ${s(k)}: ${s(j.module[k]).replace(/","/g, '", "')}${i < ks.length - 1 ? "," : ""}`);
    return ["{", ` "quelle": ${s(j.quelle)},`, ' "ordnung": [', ...ord, " ],", ' "module": {', ...mod, " }", "}", ""].join("\n");
}
function skalar(b, o, t) {
    const [sb, so, st] = [b, o, t].map((x) => JSON.stringify(x));
    if (so === st || st === sb) return { v: o };
    if (so === sb) return { v: t };
    return null;
}
function loeseKarte(B, O, T) {
    const q = skalar(B.quelle, O.quelle, T.quelle);
    // die Lade-Ordnung: Zeile je Datei, 3-Wege wie (e)
    const zeilen = (j) => j.ordnung.map((r) => JSON.stringify(r));
    const oz = dreiWege(zeilen(B), zeilen(O), zeilen(T));
    if (!q || !oz) return { fall: `spec/stamm/modul-karte.json:${q ? "ordnung" : "quelle"}` };
    const o = { v: oz.map((z) => JSON.parse(z)) };
    const module = {};
    // Schlüssel-Reihe = die Lade-Ordnung (so trägt es die Datei), Fremde danach
    const alle = [...Object.keys(O.module), ...Object.keys(T.module).filter((k) => !(k in O.module))];
    const ord = o.v.map((r) => r[0]);
    const keys = [...ord.filter((k) => alle.includes(k)), ...alle.filter((k) => !ord.includes(k))];
    for (const k of keys) {
        const [b, oo, tt] = [B.module[k], O.module[k], T.module[k]];
        if (b && (!oo || !tt)) {
            if (JSON.stringify(oo || tt) !== JSON.stringify(b))
                return { fall: `spec/stamm/modul-karte.json:${k} (eine Seite strich das Modul, die andere änderte es)` };
            continue;
        }
        const [sb, so, st] = [new Set(b || []), new Set(oo || []), new Set(tt || [])];
        const weg = new Set([...sb].filter((x) => !so.has(x) || !st.has(x)));
        module[k] = [...new Set([...so, ...st])].filter((x) => !weg.has(x)).sort();
    }
    return { text: karteText({ quelle: q.v, ordnung: o.v, module }) };
}

// ── bau ──────────────────────────────────────────────────────────────────────────────────────────────────────────────
const FEHLT_BLOB = /not our ref|could not fetch from promisor remote|missing blob|unable to read|bad object/i;
function holeZweig(z) {
    git(["fetch", "-q", "origin", `+refs/heads/${z}:refs/remotes/origin/${z}`], INTEG, true);
}
function holeVoll(z) {
    git(["fetch", "-q", "origin", z], VOLL, true);
    git(["fetch", "-q", VOLL.replace(/^C:/, "/c"), `+refs/remotes/origin/${z}:refs/remotes/lokal/${z}`], INTEG, true);
}
function siegel(s) {
    const m = s.match(SIEGEL_CI) || s.match(SIEGEL_CS);
    return m ? m[0] : null;
}
const undListe = (a) => (a.length < 2 ? a.join("") : `${a.slice(0, -1).join(", ")} und ${a[a.length - 1]}`);
function laufe(cmd, args, env = {}) {
    const o = { cwd: ZUG, encoding: "utf8", maxBuffer: 1 << 26, env: { ...process.env, ...env } };
    // npm ist unter Windows ein .cmd und braucht die Shell; node nie (keine Argument-Verkettung)
    const r = cmd === "npm" ? spawnSync(["npm", ...args].join(" "), { ...o, shell: true }) : spawnSync(cmd, args, o);
    const txt = (r.stdout || "") + (r.stderr || "");
    return { ok: r.status === 0, rest: txt.trim().split("\n").slice(-2).join(" | ").slice(0, 300) };
}
function sauber() {
    git(["merge", "--abort"], ZUG, true);
    git(["reset", "-q", "--hard"], ZUG, true);
    git(["clean", "-fdq", "-e", "node_modules"], ZUG, true);
}
function mergeEinen(z, sha) {
    const msg = `Merge ${z} in integ-probe`;
    let r;
    for (let v = 0; v < 2; v++) {
        r = git(["-c", "merge.conflictStyle=diff3", "merge", "--no-ff", "-q", "-m", msg, sha], ZUG, true);
        if (r.status === 0) return { drin: true, kl: {} };
        if (!FEHLT_BLOB.test(r.stderr) || v) break;
        sauber();
        holeVoll(z);
    }
    const offen = git(["diff", "--name-only", "--diff-filter=U"], ZUG).split("\n").filter(Boolean);
    if (!offen.length) {
        sauber();
        return { drin: false, grund: `merge scheitert: ${(r.stderr || r.stdout).trim().split("\n").pop()}` };
    }
    const kl = {};
    const stufen = git(["ls-files", "-u"], ZUG);
    for (const d of offen) {
        const hat = (n) => new RegExp(`^\\d+ \\w+ ${n}\\t${d.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}$`, "m").test(stufen);
        let r2;
        if (!hat(2) || !hat(3)) r2 = { fall: `${d} (löschen gegen ändern)` };
        else if (d === "spec/stamm/modul-karte.json") {
            const st = (n) => JSON.parse(git(["show", `:${n}:${d}`], ZUG));
            r2 = loeseKarte(hat(1) ? st(1) : { quelle: "", ordnung: [], module: {} }, st(2), st(3));
            if (r2.text) r2.kl = { b: 1 };
        } else {
            const p = path.join(ZUG, d);
            const buf = fs.readFileSync(p);
            r2 = buf.includes(0) ? { fall: `${d} (binär)` } : loeseDatei(d, buf.toString("utf8"));
        }
        if (r2.fall) {
            sauber();
            return { drin: false, grund: `Konflikt Klasse d ${r2.fall}` };
        }
        fs.writeFileSync(path.join(ZUG, d), r2.text);
        git(["add", "--", d], ZUG);
        kl[d] = r2.kl;
    }
    if (offen.includes("spec/stamm/modul-karte.json")) {
        const a = laufe("node", ["scripts/diag-atlas.cjs", "--check"]);
        if (!a.ok) {
            sauber();
            return { drin: false, grund: `Modul-Karte 3-Wege, diag-atlas --check ROT: ${a.rest}` };
        }
    }
    const body = Object.entries(kl)
        .map(([d, k]) => `${path.basename(d)} ${Object.entries(k).map(([x, n]) => `${x}${n}`).join("")}`)
        .join(", ");
    git(["commit", "-q", "-m", `${msg}\n\nZug-Auflösung (Klasse a Kommentar · b Karte · c Version · e benachbart · f Leerraum · g Code gegen Kommentar): ${body}`.slice(0, 600)], ZUG);
    // nach (g) fehlt der Kommentar-Seite ihr Abzug: die Decke dieses Merges allein (scripts wächst nie), sonst fällt NUR dieser Zweig
    if (Object.values(kl).some((k) => k && k.g)) {
        const d = laufe("node", ["scripts/diag-betriebsgesetz.cjs", "--grund", "HEAD^1", "--kopf", "HEAD"]);
        if (!d.ok) {
            git(["reset", "-q", "--hard", "HEAD^1"], ZUG);
            return { drin: false, grund: `Decke nach Klasse g (der Kommentar-Abzug fiel mit der Code-Seite): ${d.rest}` };
        }
    }
    return { drin: true, kl };
}
function stelleWorktree() {
    if (!fs.existsSync(path.join(ZUG, ".git"))) git(["worktree", "add", "--detach", ZUG, "HEAD"], INTEG);
    const nm = path.join(ZUG, "node_modules");
    if (!fs.existsSync(nm)) fs.symlinkSync(path.join(INTEG, "node_modules"), nm, "junction");
}
function bau(args, { trocken = false } = {}) {
    const bi = args.indexOf("--basis");
    const pi = args.indexOf("--push");
    const lokal = args.includes("--lokal");
    if (bi < 0) throw new Error("bau braucht --basis <ref>");
    const basisRef = args[bi + 1];
    const ziel = pi >= 0 ? args[pi + 1] : null;
    const zweige = args.filter((a, i) => !a.startsWith("--") && i !== bi + 1 && i !== pi + 1);
    stelleWorktree();
    sauber();
    if (!/^[0-9a-f]{7,40}$/.test(basisRef)) holeZweig(basisRef.replace(/^origin\//, ""));
    const basis = git(["rev-parse", /^[0-9a-f]{7,40}$/.test(basisRef) ? basisRef : `origin/${basisRef.replace(/^origin\//, "")}`], INTEG);
    git(["checkout", "-q", "--detach", "--force", basis], ZUG);
    const drin = [];
    for (const spec of zweige) {
        let [z, sha] = spec.split("@");
        if (siegel(z)) {
            console.log(`gefallen ${z}: Siegel-Wort „${siegel(z)}" im Zweig-Namen (wandert in die Merge-Message)`);
            continue;
        }
        if (!sha) {
            holeZweig(z);
            sha = git(["rev-parse", `refs/remotes/origin/${z}`], ZUG, true).stdout.trim();
        } else if (git(["cat-file", "-e", `${sha}^{commit}`], ZUG, true).status !== 0) holeZweig(z);
        if (!sha) {
            console.log(`gefallen ${z}: Zweig fehlt auf origin`);
            continue;
        }
        sha = git(["rev-parse", sha], ZUG);
        if (git(["merge-base", "--is-ancestor", sha, "HEAD"], ZUG, true).status === 0) {
            console.log(`schon drin ${z}@${sha.slice(0, 8)}`);
            continue;
        }
        const r = mergeEinen(z, sha);
        const kl = Object.entries(r.kl || {}).map(([d, k]) => `${d} ${Object.entries(k).map(([x, n]) => `${x}${n}`).join("")}`);
        console.log(r.drin ? `drin ${z}@${sha.slice(0, 8)}${kl.length ? ` · aufgelöst ${kl.join(", ")}` : ""}` : `gefallen ${z}@${sha.slice(0, 8)}: ${r.grund}`);
        if (r.drin) drin.push(z);
    }
    if (!drin.length) {
        console.log(`KEIN KANDIDAT: kein Zweig drin (Basis ${basis.slice(0, 8)})`);
        return 1;
    }
    const pkg = JSON.parse(fs.readFileSync(path.join(ZUG, "package.json"), "utf8"));
    const v = pkg.version.replace(/(\d+)$/, (n) => String(Number(n) + 1));
    const msg = `V${v}: Versions-Stufe nach ${undListe(drin)} (alle versionierten Dateien tragen den neuen ?v=) [ci voll]`;
    const pruef = [
        ["diag-atlas --check", "node", ["scripts/diag-atlas.cjs", "--check"]],
        ["stamm:lint", "npm", ["run", "-s", "stamm:lint"]],
        [`betriebsgesetz --grund ${basis.slice(0, 8)}`, "node", ["scripts/diag-betriebsgesetz.cjs", "--grund", basis]],
    ];
    if (lokal)
        pruef.push(["npm run check", "npm", ["run", "-s", "check"], { TAILLE_PORT: "7941" }], [
            "playtest:fast",
            "npm",
            ["run", "-s", "playtest:fast"],
            { FAST_PORT: "7942" },
        ]);
    // (T) ALT heilt der Zug selbst (22./23.10.: alle ~8 Merges kostete die veraltete Zeit-Quelle eine rote CI-Runde):
    // ci-zeiten misst am Kopf neu, im Kandidaten, vor der Stufe
    const dk = spawnSync("node", ["scripts/diag-ci-deckung.cjs"], { cwd: ZUG, encoding: "utf8", maxBuffer: 1 << 26 });
    if (/\(T\) ALT/.test((dk.stdout || "") + (dk.stderr || ""))) {
        const zt = laufe("node", ["scripts/ci-zeiten.cjs"], { GH_TOKEN: process.env.TOKEN });
        if (!zt.ok) {
            console.log(`KANDIDAT ROT an ci-zeiten: ${zt.rest}`);
            return 1;
        }
        // der Kopf der neu gemessenen Quelle ist DIESER Kandidat: ci-zeiten schreibt den Kopf des jüngsten fremden Laufs, und die
        // eigenen Merges des Zuges (ihre Läufe stecken schon in den Proben) zählten sonst als „älter als ihre Läufe“ — ab
        // je_schritt Zweigen sperrte (T) ALT auf integ-probe jeden Zug (23.10.: z9, 8 Merges gegen 7 Proben)
        const zp = path.join(ZUG, "spec", "ci", "ci-zeiten.json");
        const kopfNeu = git(["rev-parse", "HEAD"], ZUG);
        fs.writeFileSync(zp, fs.readFileSync(zp, "utf8").replace(/("kopf":\s*")[0-9a-f]{40}(")/, `$1${kopfNeu}$2`));
        git(["add", ".github/workflows/check.yml", "spec/ci/ci-zeiten.json"], ZUG);
        if (git(["diff", "--cached", "--quiet"], ZUG, true).status !== 0) {
            git(["commit", "-q", "-m", `CI-Zeiten neu (der Zug heilt (T) ALT) [ci voll]\n\n${CO}`], ZUG);
            console.log("aufgefrischt: CI-Zeiten ((T) ALT)");
        }
    }
    for (const [name, cmd, a, env] of pruef) {
        const r = laufe(cmd, a, env);
        if (!r.ok) {
            console.log(`KANDIDAT ROT an ${name}: ${r.rest} (HEAD ${git(["rev-parse", "HEAD"]).slice(0, 8)}, nicht gestempelt)`);
            return 1;
        }
    }
    const merges = git(["log", "--format=%B", `${basis}..HEAD`]);
    if (siegel(msg) || siegel(merges)) {
        console.log(`KANDIDAT ROT: Siegel-Wort „${siegel(msg) || siegel(merges)}" in Merge- oder Stufen-Message`);
        return 1;
    }
    // Pfad-Regel (Richter-Plan Rang 4): ein reiner Werkzeug-Diff ändert keine versionierte Datei — keine Versions-Stufe,
    // die Stufe ist ein leerer Commit (er trägt [ci voll] und hält die Form „Kandidat = Stufe über den Merges“ für teile)
    const werkzeug = istWerkzeug(git(["diff", "--name-only", `${basis}..HEAD`]));
    if (!werkzeug) {
        const b = laufe("node", ["scripts/bump-version.cjs", v]);
        if (!b.ok) {
            console.log(`KANDIDAT ROT an bump-version ${v}: ${b.rest}`);
            return 1;
        }
        git(["add", "-u"], ZUG);
        git(["commit", "-q", "-m", `${msg}\n\n${CO}`], ZUG);
    } else
        git(["commit", "-q", "--allow-empty", "-m", `Werkzeug-Stufe nach ${undListe(drin)} (nur scripts/ spec/ .github/ *.md, kein Laufzeit-Byte) [ci voll]\n\n${CO}`], ZUG);
    const kand = git(["rev-parse", "HEAD"]);
    console.log(`KANDIDAT ${kand} ${werkzeug ? "Werkzeug (kein ABAB)" : `V${v}`} · Basis ${basis.slice(0, 8)} · ${drin.length}/${zweige.length} Zweige`);
    if (ziel && !trocken) {
        const p = git(["push", "origin", `${ziel.startsWith("+") ? "+" : ""}${kand}:refs/heads/${ziel.replace(/^\+/, "")}`], ZUG, true);
        console.log(p.status === 0 ? `PUSH ${kand.slice(0, 8)} → ${ziel}` : `PUSH ABGEWIESEN → ${ziel}: ${p.stderr.trim().split("\n").pop()}`);
        return p.status === 0 ? 0 : 1;
    }
    console.log(ziel ? `trocken: kein Push nach ${ziel}` : "lokal: kein Push (--push <ziel-ref>)");
    return 0;
}

// ── teile ────────────────────────────────────────────────────────────────────────────────────────────────────────────
async function teile(args) {
    const trocken = args.includes("--trocken");
    const sha = git(["rev-parse", args.find((a) => !a.startsWith("--"))], INTEG);
    const zweige = [];
    let c = git(["rev-parse", `${sha}^1`], INTEG); // der Kandidat ist die Versions-Stufe
    for (;;) {
        const [eltern, s] = git(["log", "-1", "--format=%P%x00%s", c], INTEG).split("\x00");
        const p = eltern.split(" ");
        if (p.length === 1 && /^CI-Zeiten neu/.test(s)) {
            c = p[0]; // die Auffrischung der Zeit-Quelle liegt zwischen Merges und Stufe
            continue;
        }
        const m = /^Merge (\S+) in integ-probe/.exec(s);
        if (p.length < 2 || !m) break;
        zweige.unshift(`${m[1]}@${p[1]}`);
        c = p[0];
    }
    const basis = c;
    if (zweige.length < 2) {
        console.log(`teile: ${zweige.length} Zweig(e) im Kandidaten ${sha.slice(0, 8)} — nichts zu teilen, der Zweig selbst ist der Täter`);
        return 1;
    }
    let echtNur = false;
    if (!trocken) {
        const u = await urteilVon(sha, { neulauf: false });
        if (u.wort !== "ROT") {
            console.log(`teile: Kandidat ${sha.slice(0, 8)} ist nicht ROT nach dem Neulauf (${u.zeile})`);
            return 1;
        }
        echtNur = u.echtNur;
    } else {
        try {
            const u = await urteilVon(sha, { neulauf: false });
            echtNur = u.echtNur;
            console.log(`(trocken) Urteil am Kandidaten: ${u.zeile}`);
        } catch (e) {}
    }
    const h = Math.ceil(zweige.length / 2);
    const haelften = [
        ["zug-a", zweige.slice(0, h)],
        ["zug-b", zweige.slice(h)],
    ];
    console.log(`teile ${sha.slice(0, 8)} · Basis ${basis.slice(0, 8)} · ${zweige.map((z) => z.split("@")[0]).join(" ")}`);
    let rot = 0;
    for (const [ziel, liste] of haelften) {
        console.log(`── ${ziel}: ${liste.map((z) => z.split("@")[0]).join(" ")}`);
        rot += bau(["--basis", basis, ...liste, "--push", `+${ziel}`], { trocken });
    }
    if (echtNur) console.log("ACHTUNG: das Rot war echt-only — die Hälften fahren die volle Batterie ohne echt, sie brauchen echt (OMEN).");
    return rot ? 1 : 0;
}

// ── landen ───────────────────────────────────────────────────────────────────────────────────────────────────────────
async function landen(args) {
    const sha = git(["rev-parse", args.find((a) => !a.startsWith("--"))], INTEG);
    const u = await urteilVon(sha, { neulauf: false });
    if (u.wort !== "GRUEN") {
        console.log(`landen ABBRUCH: Urteil nicht GRUEN — ${u.zeile}`);
        return 1;
    }
    // echt ist Pflicht am Lande-SHA, auch für Werkzeug (die echt-Linsen sind Werkzeug) — 23.10.: ff6d7d51 landete ohne echt,
    // weil der Push nach integ-probe abgewiesen war und urteil echt nur als Rot kannte
    let echtGruen = false;
    for (const r of await runsFuer(sha, ["integ-probe"]))
        if ((await jobsAlle(r)).some((j) => /^echt/.test(j.name) && j.conclusion === "success")) echtGruen = true;
    if (!echtGruen) {
        console.log(`landen ABBRUCH: kein grüner echt-Lauf am ${sha.slice(0, 8)} (integ-probe trägt ihn)`);
        return 1;
    }
    git(["fetch", "-q", "origin", "+refs/heads/main:refs/remotes/origin/main"], INTEG);
    const nurWerkzeug = istWerkzeug(git(["diff", "--name-only", `origin/main..${sha}`], INTEG));
    git(["pull", "-q", "--ff-only"], KOORD, true);
    const datei = path.join(KOORD, "zug", "abab.txt");
    const zeilen = fs.existsSync(datei) ? fs.readFileSync(datei, "utf8").split("\n") : [];
    // Pfad-Regel: ein reiner Werkzeug-Diff gegen main braucht kein ABAB (die Laufzeit ist byte-gleich main)
    // je SHA gilt die LETZTE Zeile (23.10.: der Dienst schrieb für a2b28770 erst „nicht-langsamer“ über leere A-Boots, dann die
    // Berichtigung UNENTSCHIEDEN — die erste Zeile landete 13c95713 ohne gültiges ABAB)
    const letzte = new Map();
    for (const l of zeilen) {
        const k = l.trim().split(/\s+/)[0] || "";
        if (/^[0-9a-f]{8,40}$/.test(k)) letzte.set(k, l);
    }
    // die OMEN schreibt das Urteil als EIN Wort (nicht-langsamer), Hand-Zeilen mit Leerzeichen
    const gilt = (l) => /nicht[- ]langsamer/i.test(l) && !/UNENTSCHIEDEN|(^|\s)LANGSAMER/.test(l);
    let z = nurWerkzeug ? `${sha} Werkzeug-Diff (kein Laufzeit-Byte, Pfad-Regel)` : [...letzte].filter(([k]) => sha.startsWith(k)).map(([, l]) => l).find(gilt);
    // dieselbe Pfad-Regel zwischen zwei Kandidaten: ein Urteil gilt für einen SHA, der sich davon nur im Werkzeug unterscheidet
    // (23.10.: der Neubau nach (T) ALT änderte nur spec/ci und check.yml — die GTX misst dieselbe Laufzeit nicht zweimal)
    if (!z && ![...letzte.keys()].some((k) => sha.startsWith(k)))
        for (const [k, l] of letzte) {
            if (!/^[0-9a-f]{40}$/.test(k) || !gilt(l)) continue;
            const d = git(["diff", "--name-only", k, sha], INTEG, true);
            if (d.status === 0 && istWerkzeug(d.stdout) && git(["merge-base", "--is-ancestor", "origin/main", k], INTEG, true).status === 0) {
                z = `${l.trim()} — gilt für ${sha.slice(0, 8)} (Werkzeug-Diff gegen ${k.slice(0, 8)})`;
                break;
            }
        }
    // NACHWACHE (23.10., Schöpfer: „statt 20 min jetzt 3 h“): das ABAB läuft NACH der Landung als Wache über main, nie als Tor
    // davor — gelandet wird bei grüner Batterie und grünem echt; ein späteres LANGSAMER nimmt der Fahrer per Revert zurück.
    // Ein schon geschriebenes LANGSAMER oder UNENTSCHIEDEN für genau diesen SHA sperrt weiter.
    const gesperrt = [...letzte].some(([k, l]) => sha.startsWith(k) && !gilt(l));
    if (!z && args.includes("--nachwache") && !gesperrt) z = `${sha} Nachwache (das ABAB folgt nach der Landung, zug/warteschlange.txt)`;
    if (!z) {
        console.log(`landen ABBRUCH: keine ABAB-Zeile „nicht langsamer" für ${sha.slice(0, 8)} in koordination zug/abab.txt`);
        return 1;
    }
    git(["fetch", "-q", "origin", "+refs/heads/main:refs/remotes/origin/main"], INTEG);
    if (git(["merge-base", "--is-ancestor", "origin/main", sha], INTEG, true).status !== 0) {
        console.log(`landen ABBRUCH: ${sha.slice(0, 8)} ist kein Fast-Forward von origin/main ${git(["rev-parse", "--short", "origin/main"], INTEG)}`);
        return 1;
    }
    if (args.includes("--trocken")) {
        console.log(`trocken: würde ${sha.slice(0, 8)} → main fast-forward pushen · ABAB: ${z.trim()}`);
        return 0;
    }
    const p = git(["push", "origin", `${sha}:refs/heads/main`], INTEG, true);
    console.log(p.status === 0 ? `GELANDET ${sha.slice(0, 8)} → main · ABAB: ${z.trim()}` : `landen ABGEWIESEN: ${p.stderr.trim()}`);
    return p.status === 0 ? 0 : 1;
}

// ── punkte: die Punkte-Maschine am Kandidaten (koordination-Zweig punkte-maschine, meisterkarte-quelle/punkte) ──────────
// fährt punkte.cjs run --sha <sha> --geraet radeon|headless im Punkte-Worktree; die GTX fährt die OMEN (zug/punkte-gtx.md).
// Die Messung landet in messung/<sha8>-<geraet>.json; gebucht wird an der Karte (punkte.cjs buchen --kopf <main>), nie hier.
const PUNKTE_WT = process.env.ZUG_PUNKTE || "C:/Users/micha/AnazhRealm-profiband/.claude/worktrees/koord-punkte";
// Der Fortschritt des Laptop-Messplatzes (Radeon und headless): je Station EINE Zeile nach koordination zug/fortschritt-radeon.txt
// im Format des OMEN-Diensts (`<datum> <zeit> <id> <station> GRÜN|ROT <min> · i/n`, dazu START und ENDE/ABBRUCH) — bis 25.10.
// sah niemand, was die Radeon misst (messplatz-blick.sh liest die Datei). Plumbing auf dem frischen origin/koordination: kein
// Arbeitsbaum, kein fremder Index (der Koordinator arbeitet im koordination-Baum) — blob → tree → commit → push; ein Push-Rennen
// (OMEN, Koordinator) holt neu und hängt an die neueste Datei, 3 Versuche wie buche.sh. Der Push (~2 s, Netz) fällt in den Start
// der nächsten Station, nie in ihre Messung; ein Fehlschlag steht laut in der Ausgabe.
const FORTSCHRITT = "zug/fortschritt-radeon.txt";
const zeitStempel = (d = new Date()) => {
    const z = (n) => String(n).padStart(2, "0");
    return `${d.getFullYear()}-${z(d.getMonth() + 1)}-${z(d.getDate())} ${z(d.getHours())}:${z(d.getMinutes())}:${z(d.getSeconds())}`;
};
function fortschritt(zeile) {
    const t0 = Date.now();
    const g = (a, opt = {}) => spawnSync("git", a, { cwd: VOLL, encoding: "utf8", ...opt });
    const idx = path.join(os.tmpdir(), `zug-fortschritt-${process.pid}.idx`);
    const env = { ...process.env, GIT_INDEX_FILE: idx };
    let grund = "";
    for (let v = 1; v <= 3; v++) {
        if (v > 1) Atomics.wait(new Int32Array(new SharedArrayBuffer(4)), 0, 0, 5000);
        const f = g(["fetch", "-q", "origin", "+refs/heads/koordination:refs/zug/fortschritt-basis"]);
        if (f.status !== 0) { grund = "fetch: " + f.stderr.trim().split("\n").pop(); continue; }
        const basis = g(["rev-parse", "refs/zug/fortschritt-basis"]).stdout.trim();
        const alt = g(["show", `${basis}:${FORTSCHRITT}`]);
        const text = (alt.status === 0 && alt.stdout ? alt.stdout.replace(/\n*$/, "\n") : "") + zeile + "\n";
        const blob = g(["hash-object", "-w", "--stdin"], { input: text }).stdout.trim();
        g(["read-tree", basis], { env });
        g(["update-index", "--add", "--cacheinfo", `100644,${blob},${FORTSCHRITT}`], { env });
        const tree = g(["write-tree"], { env }).stdout.trim();
        const msg = "Messplatz fortschritt radeon: " + zeile.slice(20);
        const commit = g(["commit-tree", tree, "-p", basis, "-m", msg, "-m", CO]).stdout.trim();
        const p = g(["push", "-q", "origin", `${commit}:refs/heads/koordination`]);
        if (p.status === 0) {
            fs.rmSync(idx, { force: true });
            console.log(`FORTSCHRITT ${zeile.slice(11)} → koordination ${commit.slice(0, 8)} (${Date.now() - t0} ms)`);
            return true;
        }
        grund = "push: " + p.stderr.trim().split("\n").pop();
    }
    fs.rmSync(idx, { force: true });
    console.log(`FORTSCHRITT NICHT GEPUSHT nach 3 Versuchen (${grund}): ${zeile}`);
    return false;
}
async function punkte(args) {
    const spec = args.find((a) => !a.startsWith("--"));
    if (!spec) throw new Error("punkte <sha> [--geraet radeon|headless] [--nur id,id | --alle] [--id <auftrag>]");
    const wert = (k) => { const i = args.indexOf(k); return i >= 0 ? args[i + 1] : null; };
    const geraet = wert("--geraet") || "headless";
    if (!["radeon", "headless"].includes(geraet)) throw new Error("--geraet radeon|headless (die GTX fährt die OMEN: zug/punkte-gtx.md)");
    // der Punkte-Worktree misst mit dem Stand von koordination (Stationen + punkte.cjs), nie mit einem alten (24.10.: 95 min ohne GPU-Wand)
    for (const a of [["fetch", "-q", "origin", "koordination"], ["merge", "-q", "--no-edit", "FETCH_HEAD"]]) {
        const h = git(a, PUNKTE_WT, true);
        if (h.status !== 0) throw new Error(`Punkte-Worktree: git ${a[0]} scheitert: ${String(h.stderr || h.stdout).trim().split("\n").pop()}`);
    }
    const pc = path.join(PUNKTE_WT, "meisterkarte-quelle", "punkte", "punkte.cjs");
    if (!fs.existsSync(pc)) throw new Error("Punkte-Maschine fehlt: " + pc);
    const sha = git(["rev-parse", spec], VOLL, true).status === 0 ? git(["rev-parse", spec], VOLL) : spec;
    // ohne --nur misst der Zug nur, was er berührt (--offen: Stationen ohne frische Messung am SHA); --alle fährt die ganze Liste
    const argv = [pc, "run", "--sha", sha, "--geraet", geraet, ...(wert("--nur") ? ["--nur", wert("--nur")] : args.includes("--alle") ? [] : ["--offen"])];
    const t0 = Date.now();
    // die Ausgabe strömt (je Station eine Fortschritts-Zeile); tote Globs meldet punkte.cjs VOR seiner Stations-Zahl, sie zählen mit
    const id = wert("--id") || `${sha.slice(0, 8)}-${geraet}`;
    const zeilen = [];
    let n = 0, i = 0;
    const tote = [];
    const start = (k) => { n = tote.length + k; fortschritt(`${zeitStempel()} ${id} START ${n} Stationen`); for (const s of tote.splice(0)) fortschritt(`${zeitStempel()} ${id} ${s} ROT 0.0 · ${++i}/${n}`); };
    const lies = (l) => {
        zeilen.push(l);
        let m;
        if ((m = /^Punkte-Maschine: (\d+) Station\(en\) in /.exec(l))) start(Number(m[1]));
        else if ((m = /^  (GRÜN|ROT ) (\S+) · .* · Exit \S+ · ([\d.]+) min( \(Zwilling von \S+\))?$/.exec(l)))
            fortschritt(`${zeitStempel()} ${id} ${m[2]} ${m[1].trim()} ${Number(m[3]).toFixed(1)} · ${++i}/${n}`);
        else if ((m = /^  ROT  (\S+) · /.exec(l)) && !n) tote.push(m[1]);
    };
    const status = await new Promise((fertigBei) => {
        const kind = spawn(process.execPath, argv, { cwd: PUNKTE_WT, stdio: ["ignore", "pipe", "inherit"] });
        let rest = "";
        kind.stdout.on("data", (d) => {
            process.stdout.write(d);
            const teile = (rest + String(d)).split(/\r?\n/);
            rest = teile.pop();
            teile.forEach(lies);
        });
        kind.on("close", (code) => { if (rest) lies(rest); fertigBei(code); });
    });
    if (tote.length) start(0); // jede Station tot: punkte.cjs nennt keine Zahl
    const gruen = zeilen.filter((l) => /^  GRÜN /.test(l)).length, rot = zeilen.filter((l) => /^  ROT /.test(l)).length;
    const min = ((Date.now() - t0) / 60000).toFixed(1);
    if (n) fortschritt(`${zeitStempel()} ${id} ${status === 0 ? `ENDE ${gruen} grün / ${rot} rot · ${min} min` : `ABBRUCH Exit ${status} · ${i}/${n}`}`);
    if (status !== 0) throw new Error("punkte.cjs run Exit " + status);
    console.log(`PUNKTE ${sha.slice(0, 8)} ${geraet}: ${gruen} grün · ${rot} rot · ${min} min → messung/${sha.slice(0, 8)}-${geraet}.json (committen im Punkte-Worktree)`);
    return rot ? 1 : 0;
}

// ── Selbsttest der Auflösung (ohne Netz) ─────────────────────────────────────────────────────────────────────────────
function selbsttest() {
    const fall = [];
    let faelle = 0;
    const pr = (n, ok) => (faelle++, ok || fall.push(n));
    pr("a kürzere Kommentar-Seite", loeseBlock("x.js", ["// lang lang", "// zwei"], [], ["// kurz"]).z.join() === "// kurz");
    const au = loeseBlock("x.js", ["// a", "// c", "// d"], ["// a", "// b", "// c", "// d"], ["// a", "// b", "// d"]);
    pr("a beide strichen verschiedene Kommentar-Zeilen → beide Streichungen", au && au.kl === "a" && au.z.join() === "// a,// d");
    pr("c Version ours", loeseBlock("index.html", ['<s src="a.js?v=1.2.3">'], [], ['<s src="a.js?v=1.2.4">']).z[0].includes("1.2.3"));
    const e = loeseBlock("x.js", ["a", "b2"], ["a", "b"], ["a2", "b"]);
    pr("e benachbart", e && e.kl === "e" && e.z.join() === "a2,b2");
    pr("d dieselbe Zeile", loeseBlock("x.js", ["x = 1;"], ["x = 0;"], ["x = 2;"]) === null);
    const g1 = loeseBlock("x.js", ["x = 2;"], ["// V18 Etikett", "x = 1;"], ["x = 1;"]);
    pr("g Zweig strich nur Kommentar, main baute Code um → main", g1 && g1.kl === "g" && g1.z.join() === "x = 2;");
    const g2 = loeseBlock("x.js", ["// kurz", "y = 1;"], ["// lang", "y = 1;"], ["y = 3;"]);
    pr("g main strich nur Kommentar, der Zweig baute Code um → Zweig", g2 && g2.kl === "g" && g2.z.join() === "y = 3;");
    const w1 = loeseBlock("package.json", ['  "c": "a && x && b",'], ['  "c": "a && b",'], ['  "c": "a && b && y",']);
    pr("w &&-Kette: zwei Einfügungen in dieselbe Zeile → beide", w1 && w1.kl === "w" && w1.z[0] === '  "c": "a && x && b && y",');
    const w2 = loeseBlock("package.json", ['  "c": "a && x && b && c",'], ['  "c": "a && b && c",'], ['  "c": "a && b && y && c",']);
    pr("w &&-Kette: zwei Einfügungen mitten in der Zeile → beide", w2 && w2.kl === "w" && w2.z[0] === '  "c": "a && x && b && y && c",');
    pr("w &&-Kette: dasselbe Glied verschieden geändert bleibt d", loeseBlock("package.json", ['  "c": "a && x2",'], ['  "c": "a && x",'], ['  "c": "a && x3",']) === null);
    pr("d bleibt, wenn beide Seiten Code ändern", loeseBlock("x.js", ["// a", "x = 2;"], ["x = 1;"], ["// b", "x = 3;"]) === null);
    pr("d dieselbe Einfügestelle", loeseBlock("x.js", ["a", "o", "b"], ["a", "b"], ["a", "t", "b"]) === null);
    pr("d Einfügung am Rand einer Ersetzung", loeseBlock("x.js", ["n", "a"], ["a"], ["a2"]) === null);
    const k = loeseKarte(
        { quelle: "q", ordnung: [], module: { M: ["a", "b", "c"] } },
        { quelle: "q", ordnung: [], module: { M: ["a", "c", "d"] } },
        { quelle: "q", ordnung: [], module: { M: ["a", "b", "c", "e"] } }
    );
    pr("b Karte 3-Wege", JSON.parse(k.text).module.M.join() === "a,c,d,e");
    console.log(fall.length ? `zug selbsttest ROT: ${fall.join(" · ")}` : `zug selbsttest grün (${faelle} Fälle)`);
    return fall.length ? 1 : 0;
}

if (require.main !== module) module.exports = { loeseDatei, loeseBlock, loeseKarte, dreiWege };
else (async () => {
    const [verb, ...args] = process.argv.slice(2);
    let rc = 2;
    try {
        if (verb === "bereit") rc = await bereit(args);
        else if (verb === "bau") rc = bau(args);
        else if (verb === "urteil") {
            const sha = git(["rev-parse", args.find((a) => !a.startsWith("--"))], INTEG);
            const u = await urteilVon(sha, { neulauf: !args.includes("--trocken") });
            console.log(u.zeile);
            rc = { GRUEN: 0, LAEUFT: 3, ROT: 1 }[u.wort] ?? 4;
        } else if (verb === "teile") rc = await teile(args);
        else if (verb === "wackler") rc = await wackler(args);
        else if (verb === "landen") rc = await landen(args);
        else if (verb === "punkte") rc = await punkte(args);
        else if (verb === "selbsttest") rc = selbsttest();
        else console.log("zug.sh bereit|bau|urteil|teile|wackler|landen|punkte|selbsttest — siehe zug.md");
    } catch (e) {
        console.log(`zug ${verb} FEHLER: ${e.message}`);
        rc = 2;
    }
    process.exitCode = rc; // kein process.exit: libuv bricht unter Windows bei offenen fetch-Sockeln (UV_HANDLE_CLOSING)
})();
