#!/usr/bin/env node
"use strict";
// zug.cjs — der Merge-Zug (Rumpf von zug.sh; Hilfe zug.md). Geurteilt wird genau der SHA, der landet; ein roter Zweig
// fällt aus dem Zug, statt die Spur zu sperren. Verben: bereit · erbe · bau · urteil · teile · wackler · landen · nachwache · punkte · loese (intern).
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
// LANDUNG ≤ 10 MIN (23.11., der Schöpfer: „Keine 10h max 10min und fertig. Wir messen soviel wie nötig, nicht wie möglich“; z695:
// Wand 29,4 min, davon kopf 0,4 + puls 4,7): am Zug-Kandidaten urteilen NUR kopf und der Puls (PFLICHT). Die volle Batterie
// (VOLL_PFLICHT) verlangt der Einlass am Zweig-Kopf (zug-dienst.sh bereit über ci.sh „voll: n/n“; hier `bereit`) — im Zug ERBT sie
// immer und fährt nie; die Karten (Job echt) fahren in keinem Zug. Nach der Landung fährt main die Batterie (`nachwache`).
const PFLICHT = ["puls 1/2", "puls 2/2"];
const VOLL_PFLICHT = Array.from({ length: 18 }, (_, i) => `voll ${i + 1}/18`);
// die Jobs, die im Zug nie urteilen: voll erbt vom Zweig-Kopf, echt fährt nur auf Abruf (check.yml)
const NIE_IM_ZUG = /^(voll|echt)\b/;
const SIEGEL_CI = /\b(fertig|vollendet|vollzogen|schluss)\b|scope\s+zu/i; // dieselbe Wand wie diag-betriebsgesetz.cjs
const SIEGEL_CS = /\bRUND\b/;
const CO = "Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>";

// ── git + API ────────────────────────────────────────────────────────────────────────────────────────────────────────
function git(args, cwd = ZUG, ok = false) {
    const r = spawnSync("git", args, { cwd, encoding: "utf8", maxBuffer: 1 << 28, windowsHide: true });
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
    // 10.11. (z366, Lauf 42813031685, 4 Versuche): GitHub antwortet auf filter=all dauerhaft 502, filter=latest 200 — dann je Versuch
    // einzeln (/attempts/<n>/jobs), das gibt dieselbe Liste aller Versuche; nie fällt das Urteil am Abruf
    try {
        const out = [];
        for (let s = 1; ; s++) {
            const j = await api(`/actions/runs/${run.id}/jobs?filter=all&per_page=100&page=${s}`);
            out.push(...(j.jobs || []));
            if (!j.jobs || j.jobs.length < 100) return out;
        }
    } catch (e) {
        if (!/\b5\d\d\b/.test(String(e.message || e))) throw e;
        const out = [];
        for (let a = 1; a <= (run.run_attempt || 1); a++)
            for (let s = 1; ; s++) {
                const j = await api(`/actions/runs/${run.id}/attempts/${a}/jobs?per_page=100&page=${s}`);
                out.push(...(j.jobs || []));
                if (!j.jobs || j.jobs.length < 100) break;
            }
        return out;
    }
}
const kurz = (n) => n.replace(/ (cpu|gpu)$/, "").replace(/ \(.*\)$/, "");
// Werkzeug = Prüf-Apparat und Doku, nie Laufzeit (Stamm, Kerne, worlds, index.html, package.json zählen als Laufzeit)
const istWerkzeug = (namen) => {
    const l = namen.split("\n").filter(Boolean);
    return l.length > 0 && l.every((f) => /^(scripts|spec|\.github)\//.test(f) || /\.md$/.test(f));
};
// JEDER rote Schritt eines Jobs (seit 02.11. läuft jeder Gate-Schritt der Gruppen-Jobs auch nach einem roten, scripts/ci-urteil.cjs);
// das Urteil der Gruppe nennt sie nur noch einmal und zählt nie mit
const URTEIL_NAME = "Urteil der Gruppe (jeder rote Schritt beim Namen)";
const rotSchritte = (j) => {
    const n = (j.steps || []).filter((s) => s.conclusion === "failure" && s.name !== URTEIL_NAME).map((s) => s.name);
    return n.length ? n : ["?"];
};
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
        if (rot && l.conclusion === "success")
            for (const s of rotSchritte(rot)) wackler.push(`${kurz(n)}/${s}`), wo.push([kurz(n), s]);
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
        // der Einlass verlangt am Zweig-Kopf den Puls UND die volle Batterie — sie ist das Erbe, das der Zug nie mehr fährt
        const pflicht = [...PFLICHT, ...VOLL_PFLICHT];
        const gruen = pflicht.filter((n) => letzteJe(n).some((j) => j.conclusion === "success"));
        const offen = pflicht.filter((n) => !gruen.includes(n));
        const roteJ = offen.flatMap((n) => letzteJe(n).filter((j) => j.conclusion === "failure").flatMap((j) => rotSchritte(j).map((s) => `${n}/${s}`)));
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

// ── erbe: DER STEMPEL ERBT ÜBER DEN BAUM ──────────────────────────────────────────────────────────────────────────────
// 26.11., z747–z749: ein Stempel „Abgabe …“ (EIN Elter, derselbe Baum wie der grüne Vorprüf-Kopf) wartete Stempel → fährt 24 · 44 ·
// 21 min, denn an seinem eigenen SHA starteten ein Code-Check (5 Jobs) und eine GPU-Probe (3 Jobs) in derselben GitHub-Reihe wie die
// Batterien (20 Läufer, 85–150 wartende Jobs, kein FIFO; 88f5904e: Code-Check 14 min, Probe 16 min für ein Urteil, das am Elter f768ab96
// über dem Baum dac55cd9 schon stand). DAS GESETZ: ein w2*-Kopf, dessen Betreff mit „Abgabe “ beginnt, startet in check.yml und
// gpu-probe.yml KEINEN Job (STEMPEL dort); sein Urteil ist das Urteil seiner Kette — der Elter und, über weitere Stempel mit
// demselben Baum, bis ERBE_TIEFE Glieder. Bereit heißt: am nächsten Glied mit einem Code-Check ist dessen jüngster Lauf (sein jüngster
// Versuch) completed/success, ein grüner Lauf der Kette trägt die volle Batterie n/n, und die GPU-Probe steht wie ci.sh sie druckt
// (bereit() liest sie nur, wenn der Zweig das Spiel berührt). Abgebrochen ist kein Urteil (der Kopf wartet beim Namen); ein Kopf mit
// eigenem Baum, ein Merge und ein Betreff ohne „Abgabe “ erben nichts (ERBE KEINS: der alte Weg über ci.sh am eigenen SHA).
// Leser: zug-dienst.sh bereit() — ERBE GRÜN fährt im selben Takt. Linse: selbsttestErbe (vier Fälle am echten git-Baum).
const ERBE_TIEFE = 4;
const rufVon = (m) => {
    const mk = [...String(m || "").matchAll(/\[gpu-probe:([^\]\n]*)\]/g)];
    return mk.length === 1 ? mk[0][1].split(",").map((p) => p.trim()) : null;
};
// erbeKette(sha, lies) — lies(sha) → { sha, tree, parents: [sha], message }; → { kopf, kette: [Glied, …], kein: grund|null }
function erbeKette(sha, lies) {
    const kopf = lies(sha);
    const s8 = sha.slice(0, 8);
    if (!/^Abgabe /.test(kopf.message)) return { kopf, kette: [], kein: `${s8}: der Betreff beginnt nicht mit »Abgabe « — kein Stempel` };
    if (kopf.parents.length !== 1) return { kopf, kette: [], kein: `${s8}: ${kopf.parents.length} Eltern — ein Merge erbt nichts` };
    const kette = [];
    for (let c = kopf; c.parents.length === 1 && kette.length < ERBE_TIEFE; ) {
        const e = lies(c.parents[0]);
        if (e.tree !== c.tree) break;
        kette.push(e);
        c = e;
    }
    if (kette.length) return { kopf, kette, kein: null };
    const e = lies(kopf.parents[0]);
    return { kopf, kette, kein: `${s8}: Baum ${kopf.tree.slice(0, 8)} ≠ Baum ${e.tree.slice(0, 8)} des Elters ${e.sha.slice(0, 8)} — der Kopf trägt Inhalt, er erbt nichts` };
}
// das Urteil EINES Code-Check-Laufs (jobs = die Jobs seines jüngsten Versuchs): GRUEN { voll: [grün, n] } · LAEUFT · ROT · OHNE
// (abgebrochen, übersprungen …: kein Urteil). Der Wackler ohne Täter (WACKEL_RE) gilt grün wie in ci.sh.
function laufUrteil(run) {
    if (run.status !== "completed") return { wort: "LAEUFT", text: `${run.status} -` };
    const jobs = run.jobs || [];
    const f = jobs.filter((j) => j.conclusion === "failure");
    const wackel =
        run.conclusion === "failure" &&
        f.length > 0 &&
        jobs.every((j) => ["success", "skipped", "failure"].includes(j.conclusion)) &&
        f.every((j) => rotSchritte(j).every((n) => WACKEL_RE.test(n)));
    if (run.conclusion !== "success" && !wackel)
        return { wort: run.conclusion === "failure" ? "ROT" : "OHNE", text: `completed ${run.conclusion}` };
    const v = jobs.filter((j) => /^voll /.test(j.name));
    return { wort: "GRUEN", text: "completed success", voll: [v.filter((j) => j.conclusion === "success" || (wackel && f.includes(j))).length, v.length] };
}
// erbeUrteil({ kopf, kette, laeufe }) — laeufe: Map sha → [{ id, name, event, status, conclusion, jobs }]; rein (der Selbsttest)
// → { wort: "GRUEN"|"WARTET"|"KEINS", von, grund, zeilen } — zeilen in der Form von ci.sh (bereit() liest „Code-Check:“ · „GPU-Probe“)
function erbeUrteil({ kopf, kette, kein, laeufe }) {
    if (kein) return { wort: "KEINS", grund: kein, zeilen: [] };
    // der Name des Laufs: „Code-Check“, die Probe trägt ihren run-name „GPU-Probe <zweig> <sha>“ (gpu-probe.yml)
    const je = (sha, name) => (laeufe.get(sha) || []).filter((r) => (r.name === name || String(r.name).startsWith(name + " ")) &&["push", "workflow_dispatch"].includes(r.event)).sort((a, b) => b.id - a.id);
    const s8 = (s) => s.slice(0, 8);
    const zeilen = [];
    // die GPU-Probe: das nächste Glied, dessen Ruf jede Probe des Kopf-Rufs nennt und das einen Lauf trägt — sein jüngster
    const ruf = rufVon(kopf.message) || [];
    const pg = kette.find((g) => je(g.sha, "GPU-Probe").length && ruf.every((p) => (rufVon(g.message) || []).includes(p)));
    if (pg) {
        const r = je(pg.sha, "GPU-Probe")[0];
        zeilen.push(`  GPU-Probe: ${r.status} ${r.conclusion || "-"} (geerbt von ${s8(pg.sha)}, Lauf ${r.id})`);
    } else zeilen.push(`  GPU-Probe: keine — kein Glied der Kette (${kette.map((g) => s8(g.sha)).join(" → ")}) fuhr den Ruf ${ruf.join(", ") || "(leer)"}`);
    // der Code-Check: das nächste Glied mit einem Lauf, dessen jüngster Lauf urteilt
    const cg = kette.find((g) => je(g.sha, "Code-Check").length);
    if (!cg) return { wort: "WARTET", von: kette[0].sha, grund: `kein Glied der Kette (${kette.map((g) => s8(g.sha)).join(" → ")}) trägt einen Code-Check`, zeilen };
    const cr = je(cg.sha, "Code-Check")[0];
    const cu = laufUrteil(cr);
    zeilen.unshift(`  Code-Check: ${cu.text} (geerbt von ${s8(cg.sha)}, Lauf ${cr.id})`);
    if (cu.wort !== "GRUEN") {
        const was = { LAEUFT: "läuft noch", ROT: "ist ROT", OHNE: cr.conclusion === "cancelled" ? "ist abgebrochen — abgebrochen ist kein Urteil" : `trägt kein Urteil (${cr.conclusion})` }[cu.wort];
        return { wort: "WARTET", von: cg.sha, grund: `der jüngste Code-Check am Elter ${s8(cg.sha)} (Lauf ${cr.id}) ${was}`, zeilen };
    }
    // die volle Batterie: ein grüner Lauf der Kette ab diesem Glied trägt sie n/n (die Vorprüfung mit [ci voll])
    const ab = kette.slice(kette.indexOf(cg));
    let voll = null;
    for (const g of ab)
        for (const r of je(g.sha, "Code-Check")) {
            const u = laufUrteil(r);
            if (!voll && u.wort === "GRUEN" && u.voll[1] > 0 && u.voll[0] === u.voll[1]) voll = { g, r, u };
        }
    if (!voll)
        return { wort: "WARTET", von: cg.sha, grund: `kein grüner Lauf der Kette (${ab.map((g) => s8(g.sha)).join(" → ")}) trägt die volle Batterie (am Elter voll ${cu.voll.join("/")}) — die Vorprüfung trägt [ci voll] nicht`, zeilen };
    zeilen.splice(1, 0, `    voll: ${voll.u.voll.join("/")}`, `    geerbt: der Stempel ${s8(kopf.sha)} ist sein Baum — Code-Check von ${s8(cg.sha)}, volle Batterie von ${s8(voll.g.sha)} (Lauf ${voll.r.id})`);
    return { wort: "GRUEN", von: cg.sha, grund: `Code-Check Lauf ${cr.id} grün, volle Batterie ${voll.u.voll.join("/")} (Lauf ${voll.r.id} an ${s8(voll.g.sha)})`, zeilen };
}
// die Läufe je Glied aus der API (je SHA bis zu vier Blicke, die Suche antwortet zuweilen leer) und die Jobs der Code-Checks
async function erbeLaeufe(kette) {
    const m = new Map();
    for (const g of kette) {
        let rs = [];
        for (const n of [50, 49, 48, 47]) {
            rs = (await api(`/actions/runs?head_sha=${g.sha}&per_page=${n}`)).workflow_runs || [];
            if (rs.length) break;
        }
        for (const r of rs) if (r.name === "Code-Check" && r.status === "completed") r.jobs = (await api(`/actions/runs/${r.id}/jobs?filter=latest&per_page=100`)).jobs || [];
        m.set(g.sha, rs);
    }
    return m;
}
// erbe <zweig@sha> — Exit 0 „ERBE GRÜN …“ (bereit im selben Takt) · 1 „ERBE WARTET …“ · 3 „ERBE KEINS …“ (der alte Weg) · 2 die Maschine
async function erbe(args) {
    const [z, s] = String(args[0] || "").split("@");
    if (!z || !s) throw new Error("Aufruf: erbe <zweig@sha>");
    const lies = (x) => {
        const [h, t, p, ...m] = git(["log", "-1", "--format=%H%n%T%n%P%n%B", x], VOLL).split("\n");
        return { sha: h, tree: t, parents: p ? p.split(" ") : [], message: m.join("\n") };
    };
    const k = erbeKette(git(["rev-parse", s], VOLL), lies);
    const u = erbeUrteil({ ...k, laeufe: k.kein ? new Map() : await erbeLaeufe(k.kette) });
    const kz = `${z}@${k.kopf.sha.slice(0, 8)}`;
    console.log(u.wort === "KEINS" ? `ERBE KEINS ${kz}: ${u.grund}` : `ERBE ${u.wort === "GRUEN" ? "GRÜN" : "WARTET"} ${kz} von ${u.von.slice(0, 8)}: ${u.grund}`);
    for (const l of u.zeilen) console.log(l);
    return { GRUEN: 0, WARTET: 1, KEINS: 3 }[u.wort];
}

// ── urteil ───────────────────────────────────────────────────────────────────────────────────────────────────────────
// die Wackler ohne je einen Täter (08.11., z296–z322: Fenster-Wand 6×, K6 5× rot, 0 Täter) — kein Neulauf, sie blockieren nie (landen --wackler-frei)
const WACKEL_RE = new RegExp(process.env.ZUG_WACKEL || "Fenster-Wand|Kamera-Leib auf der Karte|Fahr-Linse des Lebens|Erst-Zeichnungs-Wand");
// DAS URTEIL AM KANDIDATEN IST KOPF UND PULS (LANDUNG ≤ 10 MIN, 23.11.): jeder Job des Laufs außer voll und echt (NIE_IM_ZUG). Bis
// hier wartete der Zug auf die volle Batterie — oder auf ihr Baum-Erbe, das nur bei EINEM Zweig und gleichem Baum griff (erbeVoll) —
// und auf jedes Bein der Karten (der Zweig echt hier und in landen, der swiftshader-Hinweis): z695 Wand 29,4 min. Die Batterie urteilte
// am Zweig-Kopf, die Wechselwirkung der Zweige und die Stufe sieht die Nachwache auf main nach der Landung (`nachwache`).
// urteilAus({ run, jobs, neulauf }) → { wort, rot?, wackler?, neulauf? (der Rerun ist anzustoßen), zeile } — ohne Netz (Selbsttest)
function urteilAus({ run, jobs, neulauf = true }) {
    const { letzte, wackler } = lesart(jobs.filter((j) => !NIE_IM_ZUG.test(j.name)));
    const ort = `Lauf ${run.id} (${run.head_branch}, Versuch ${run.run_attempt}) · voll erbt vom Zweig-Kopf (bereit), echt fährt im Zug nie`;
    const lauf = [...letzte].filter(([, j]) => j.status !== "completed").map(([n]) => kurz(n));
    const fehlt = PFLICHT.filter((n) => ![...letzte.keys()].some((k) => kurz(k) === n));
    // ein Pflicht-Job, den der Lauf noch nicht zeigt, kommt noch — erst ein fertiger Lauf ohne ihn ist UNVOLL
    if (lauf.length || (fehlt.length && run.status !== "completed"))
        return { wort: "LAEUFT", zeile: `LAEUFT ${ort}: ${[...lauf, ...fehlt].join(", ") || run.status}` };
    const rot = [...letzte].filter(([, j]) => ROT.has(j.conclusion)).flatMap(([n, j]) => rotSchritte(j).map((s) => ({ n: kurz(n), s })));
    if (!rot.length) {
        if (fehlt.length) return { wort: "UNVOLL", zeile: `UNVOLL ohne ${fehlt.join(", ")} · ${ort}` };
        return wackler.length
            ? { wort: "GRUEN", wackler, zeile: `GRUEN mit Wackler ${wackler.join(", ")} · ${ort}` }
            : { wort: "GRUEN", zeile: `GRUEN · ${ort}` };
    }
    const namen = rot.map((r) => `${r.n}/${r.s}`).join(", ");
    if (run.run_attempt < 2 && neulauf && !rot.every((r) => WACKEL_RE.test(r.s)))
        // der Neulauf der gefallenen Jobs geht erst nach dem Ende des Laufs (die API weist ihn sonst ab)
        return run.status === "completed"
            ? { wort: "LAEUFT", rot, neulauf: true, zeile: `LAEUFT Neulauf angestoßen für ${namen} · ${ort}` }
            : { wort: "LAEUFT", rot, zeile: `LAEUFT rot ${namen} — der Neulauf folgt nach dem Ende des Laufs · ${ort}` };
    return { wort: "ROT", rot, zeile: `ROT ${namen} · ${ort}` };
}
async function urteilVon(sha, { neulauf = true } = {}) {
    const alle = await runsFuer(sha, ["integ-probe", "zug-a", "zug-b"]);
    const runs = alle.filter((r) => r.conclusion !== "cancelled" || r.status !== "completed");
    if (!runs.length) {
        // ein ABGEBROCHENER Lauf ist ein Rot mit EINEM Neulauf — vorher hieß er „KEIN LAUF", und der Fahrer wartete 120 min auf nichts
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
    const u = urteilAus({ run, jobs: await jobsAlle(run), neulauf });
    if (!u.neulauf) return { ...u, run };
    const st = await api(`/actions/runs/${run.id}/rerun-failed-jobs`, "POST");
    return { ...u, run, zeile: u.zeile.replace("Neulauf angestoßen", `Neulauf angestoßen (HTTP ${st})`) };
}

// ── nachwache ────────────────────────────────────────────────────────────────────────────────────────────────────────
// DIE NACHWACHE OHNE GERÄT (LANDUNG ≤ 10 MIN, 23.11.): nach jeder Landung fährt check.yml auf main die volle Batterie auf ubuntu, nie
// blockierend — der Zug wartet nicht auf sie, die Schlange hält nie (die Gruppe von main bricht nie ab, check.yml concurrency). Ihr
// ROT nennt jede Landung seit dem letzten GRÜNEN main beim Namen (je Merge „Merge <zweig> in integ-probe“ im Bereich grün..rot auf
// der ersten Eltern-Linie) und geht in die Täter-Spur (zug-dienst.sh: zug-taeter.txt und das Dienst-Log).
// nachwacheUrteil(laeufe, zweigeZwischen) ohne Netz: laeufe = [{ run, jobs }] der Läufe auf main (push), neueste zuerst; ein Lauf ohne
// Urteil der Batterie (kein voll-Job, jeder übersprungen) zählt nicht; zweigeZwischen(gruen|null, rot) → [„<zweig>@<sha8>“].
const VOLL_JOB = /^voll \d+\/\d+/;
function battUrteil(jobs) {
    const { letzte } = lesart(jobs.filter((j) => VOLL_JOB.test(j.name)));
    const v = [...letzte.values()].filter((j) => j.conclusion !== "skipped");
    if (!v.length) return null;
    if (v.some((j) => j.status !== "completed")) return { wort: "LAEUFT", n: v.length };
    const rot = [...letzte].filter(([, j]) => ROT.has(j.conclusion));
    // ABGEBROCHEN IST KEIN URTEIL (26.11.: 08:36 Lauf 45764758296 an 64fcf12e von Hand abgebrochen, 09:18 Lauf 45776471095 an c0634d86
    // abgelöst — die Landung z749 schob main, cancel-in-progress je Ref brach ihn ab; beide standen als „NACHWACHE ROT … voll 1/18/?“
    // in der Täter-Spur und nannten Landungen, die keine Täter waren): ist JEDER rote Job „cancelled“, urteilt der Lauf nicht; ein
    // einziger Job mit failure (timed_out …) bleibt ROT, und die abgebrochenen fallen aus seinen Namen
    const echt = rot.filter(([, j]) => j.conclusion !== "cancelled");
    if (rot.length && !echt.length) return { wort: "ABGEBROCHEN", n: v.length, ab: rot.length };
    return echt.length
        ? { wort: "ROT", n: v.length, rot: echt.flatMap(([n, j]) => rotSchritte(j).map((s) => `${kurz(n)}/${s}`)) }
        : { wort: "GRUEN", n: v.length };
}
function nachwacheUrteil(laeufe, zweigeZwischen) {
    const mit = laeufe.map(({ run, jobs }) => ({ run, u: battUrteil(jobs) })).filter((x) => x.u);
    const fertig = mit.filter((x) => x.u.wort !== "LAEUFT" && x.u.wort !== "ABGEBROCHEN");
    const neu = mit[0] && mit[0].u.wort === "LAEUFT" ? mit[0] : null;
    const dazu = neu ? ` · main ${neu.run.head_sha.slice(0, 8)} fährt noch (Lauf ${neu.run.id})` : "";
    // der jüngste Lauf, der nicht mehr fährt, ist abgebrochen: KEIN Urteil — eine eigene Zeile, nie ROT, nie in der Täter-Spur
    const erst = mit.find((x) => x.u.wort !== "LAEUFT");
    if (erst && erst.u.wort === "ABGEBROCHEN") {
        const nach = laeufe.find((x) => x.run.id > erst.run.id && x.run.head_sha !== erst.run.head_sha);
        const wie = nach ? `abgelöst von main ${nach.run.head_sha.slice(0, 8)}, Lauf ${nach.run.id}` : "abgebrochen";
        return {
            wort: "OHNE URTEIL",
            abgebrochen: true,
            sha: erst.run.head_sha,
            zeile: `NACHWACHE OHNE URTEIL main ${erst.run.head_sha.slice(0, 8)} (Lauf ${erst.run.id} ${wie}: ${erst.u.ab} von ${erst.u.n} Jobs der Batterie abgebrochen, keiner rot)${dazu}`,
        };
    }
    if (!fertig.length) return { wort: "OHNE URTEIL", zeile: `NACHWACHE OHNE URTEIL: ${laeufe.length} Läufe auf main, keiner trug die Batterie zu Ende${dazu}` };
    const kopf = fertig[0];
    const k8 = kopf.run.head_sha.slice(0, 8);
    if (kopf.u.wort === "GRUEN")
        return { wort: "GRUEN", sha: kopf.run.head_sha, zeile: `NACHWACHE GRÜN main ${k8} (voll ${kopf.u.n}/${kopf.u.n}, Lauf ${kopf.run.id})${dazu}` };
    const gruen = fertig.find((x) => x.u.wort === "GRUEN");
    const zweige = zweigeZwischen(gruen ? gruen.run.head_sha : null, kopf.run.head_sha);
    const seit = gruen ? `seit grünem main ${gruen.run.head_sha.slice(0, 8)} (Lauf ${gruen.run.id})` : `ohne grünes main in ${fertig.length} Läufen`;
    return {
        wort: "ROT",
        sha: kopf.run.head_sha,
        gruen: gruen ? gruen.run.head_sha : null,
        zweige,
        zeile: `NACHWACHE ROT main ${k8} (Lauf ${kopf.run.id}: ${kopf.u.rot.join(", ")}) · Landungen ${seit}: ${zweige.length ? zweige.join(" ") : "keine im Bereich"}${dazu}`,
    };
}
// die Landungen zwischen zwei Köpfen von main (Reihe der Landung; ohne grünen Kopf die letzten 40 Commits): je Merge des Zugs der
// Zweig mit seinem Kopf, je direktem Commit auf main „main@<sha8>“ — die Stufe nach einem Zug (Versions-/Werkzeug-Stufe) gehört zu ihm
const STUFE_RE = /^(V\d+\.\d+\.\d+: Versions-Stufe|Werkzeug-Stufe) nach /;
function zweigeZwischen(gruen, rot, repo = INTEG) {
    const bereich = gruen ? [`${gruen}..${rot}`] : ["-n", "40", rot];
    return git(["log", "--first-parent", "--reverse", "--format=%H%x00%P%x00%s", ...bereich], repo)
        .split("\n")
        .filter(Boolean)
        .map((z) => {
            const [h, p, s] = z.split("\x00");
            const m = /^Merge (\S+) in integ-probe/.exec(s);
            if (m) return `${m[1]}@${(p.split(" ")[1] || h).slice(0, 8)}`;
            return STUFE_RE.test(s) ? null : `main@${h.slice(0, 8)}`;
        })
        .filter(Boolean);
}
async function nachwache() {
    const r = await api("/actions/workflows/check.yml/runs?branch=main&event=push&per_page=20");
    const runs = (r.workflow_runs || []).filter((x) => x.head_branch === "main").sort((a, b) => b.id - a.id);
    const laeufe = [];
    for (const run of runs) {
        laeufe.push({ run, jobs: await jobsAlle(run) });
        // genug gelesen: ein fertiges Urteil — grün, oder rot mit einem grünen dahinter
        const u = nachwacheUrteil(laeufe, () => []);
        if (u.wort === "GRUEN" || (u.wort === "ROT" && u.gruen) || u.abgebrochen) break;
    }
    git(["fetch", "-q", "origin", "+refs/heads/main:refs/remotes/origin/main"], INTEG);
    const u = nachwacheUrteil(laeufe, (g, k) => zweigeZwischen(g, k));
    console.log(u.zeile);
    return { GRUEN: 0, ROT: 1 }[u.wort] ?? 3;
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
    const stuecke = [];
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
        if (r) {
            kl[r.kl] = (kl[r.kl] || 0) + 1;
            out.push(...r.z);
            zeileO += teil.o.length;
            continue;
        }
        // (i) die Import-Namen: das Stück (samt dem Rand seiner Anweisung) wartet als Platzhalter, bis die Datei steht; eine
        // Ausnahme des Lesers fällt NUR diesen Zweig (Klasse d mit Grund), nie den ganzen Zug
        let st;
        try {
            st = importStueck(datei, out, teil, Z, i);
        } catch (e) {
            return { fall: `${datei}:${start} (Klasse i: Ausnahme ${e.message.split("\n")[0]})` };
        }
        if (!st) return { fall: `${datei}:${start}` };
        out.splice(out.length - st.vor, st.vor);
        i += st.nach;
        zeileO += teil.o.length + st.nach;
        st.start = start;
        out.push(st);
        stuecke.push(st);
        kl.i = (kl.i || 0) + 1;
    }
    if (stuecke.length) {
        let r;
        try {
            r = loeseImporte(datei, out, stuecke);
        } catch (e) {
            r = { fall: `${datei}:${stuecke[0].start} (Klasse i: Ausnahme ${e.message.split("\n")[0]})` };
        }
        return r.fall ? r : { text: r.text, kl };
    }
    return { text: out.join("\n"), kl };
}
// (i) DIE IMPORT-NAMEN (01.11.: nach jeder Landung fielen fast alle Zweige an den Kopfzeilen der Linsen — `const { a, b } =
// require("./lib/welt-boot.cjs");`, ein- oder mehrzeilig, oder `const X = require("…");` —, weil jede Seite Namen hinzufügt
// oder streicht): besteht ein Stück auf allen drei Seiten NUR aus require-Anweisungen (schnitt git mitten in einem
// mehrzeiligen Muster, gilt die ganze Anweisung, ihr gemergter Rand allen drei Seiten), gilt je Modul die 3-Wege-Menge der
// Namen; ein gestrichener Name bleibt, solange die gemergte Datei ihn außerhalb der Import-Zeilen nutzt, ein ungenutzter fällt.
// Der Leser der Nutzung ist der Scope-Analysator von eslint (eslint-scope) an der gemergten Datei OHNE die Stücke: genutzt
// heißt dort frei (gelesen und nirgends gebunden). Form wie ours (eine Zeile oder mehrzeilig, Einzug, Leerzeilen); trägt ours
// das Modul im Stück nicht mehr, sondern weiter oben (ein Umzug), nimmt jene Anweisung die Namen auf. Danach prüft der Löser
// die Datei selbst (parst, kein Name der Stücke frei, keine neue Bindung tot, jede auf der obersten Ebene) — sonst Klasse d.
const I_KOPF = /^(const|let|var)\s*\{[^}]*$/;
const I_EINTRAG = /^\s+[\w$]+(\s*:\s*[\w$]+)?(\s*,\s*[\w$]+(\s*:\s*[\w$]+)?)*\s*,?\s*\r?$/;
const I_FUSS = /^\s*\}\s*=\s*require\(\s*(["'])[^"'\n]+\1\s*\)\s*;?\s*\r?$/;
const I_PARSE = { ecmaVersion: "latest", sourceType: "commonjs", range: true, loc: true, comment: true };
const I_SCOPE = { ecmaVersion: 2022, sourceType: "commonjs" };
let iLeser = null;
const iLeserHol = () =>
    (iLeser = iLeser || Object.fromEntries(["espree", "eslint-scope"].map((n) => [n, require(require.resolve(n, { paths: [__dirname, VOLL] }))])));
const ohneCr = (z) => z.replace(/\r$/, "");
const istRequire = (x) =>
    x && x.type === "CallExpression" && x.callee.type === "Identifier" && x.callee.name === "require" && x.arguments.length === 1 &&
    x.arguments[0].type === "Literal" && typeof x.arguments[0].value === "string";
// die Einträge eines Musters aus Namen (`a`, `a: b`), sonst null
function musterEintraege(id) {
    if (id.type === "Identifier") return [{ text: id.name, lokal: id.name }];
    if (id.type !== "ObjectPattern") return null;
    const e = [];
    for (const p of id.properties) {
        if (p.type !== "Property" || p.computed || p.key.type !== "Identifier" || p.value.type !== "Identifier") return null;
        e.push({ text: p.shorthand ? p.key.name : `${p.key.name}: ${p.value.name}`, lokal: p.value.name });
    }
    return e;
}
// die Form einer Anweisung (Zeilen des Texts, 1-basiert über loc)
function importForm(zeilen, s, ende) {
    const z0 = ohneCr(zeilen[s.loc.start.line - 1]);
    const einzug = /^\s*/.exec(z0)[0];
    const mehr = s.loc.end.line > s.loc.start.line;
    const z1 = mehr ? /^\s*/.exec(ohneCr(zeilen[s.loc.start.line]))[0] : "";
    const a = s.declarations[0].init.arguments[0];
    return {
        decl: s.kind,
        q: a.raw[0],
        semi: ohneCr(zeilen[s.loc.end.line - 1])[s.loc.end.column - 1] === ";",
        einzug,
        mehr,
        eintragEinzug: z1.length > einzug.length ? z1 : einzug + "    ",
        leerVor: s.loc.start.line - 1 - ende,
    };
}
// die Zeilen einer Seite → ihre require-Anweisungen (je EINE Bindung: ein Name oder ein Muster aus Namen) oder null
function importAnweisungen(zeilen) {
    const text = zeilen.map(ohneCr).join("\n");
    if (!text.trim()) return Object.assign([], { leerNach: zeilen.length });
    const { espree } = iLeserHol(); // fehlt der Leser, nennt die Ausnahme ihn (loeseDatei), statt still d zu sagen
    let ast;
    try {
        ast = espree.parse(text, I_PARSE);
    } catch {
        return null;
    }
    if (ast.comments.length) return null;
    const out = [];
    let ende = 0;
    for (const s of ast.body) {
        const d = s.type === "VariableDeclaration" && s.declarations.length === 1 && s.declarations[0];
        if (!d || !istRequire(d.init) || s.loc.start.line === ende) return null;
        const eintraege = musterEintraege(d.id);
        if (!eintraege) return null;
        out.push({ art: d.id.type === "Identifier" ? "name" : "muster", modul: d.init.arguments[0].value, eintraege, form: importForm(zeilen, s, ende) });
        ende = s.loc.end.line;
    }
    return Object.assign(out, { leerNach: zeilen.length - ende });
}
// ein Konflikt-Stück der Klasse i: die drei Seiten als require-Anweisungen, nötigenfalls bis an die Grenzen der Anweisung
// erweitert (vor: Zeilen aus out zurück bis `const {`, nach: Zeilen aus Z voraus bis `} = require(…)`)
function importStueck(datei, out, teil, Z, i) {
    if (!/\.c?js$/i.test(datei)) return null;
    let j = out.length - 1;
    while (j >= 0 && typeof out[j] === "string" && I_EINTRAG.test(out[j])) j--;
    const vor = j >= 0 && typeof out[j] === "string" && I_KOPF.test(out[j]) ? out.length - j : 0;
    let k = i;
    while (k < Z.length && I_EINTRAG.test(Z[k])) k++;
    const nach = k < Z.length && I_FUSS.test(Z[k]) ? k - i + 1 : 0;
    const versuche = [[0, 0]];
    if (vor) versuche.push([vor, 0]);
    if (nach) versuche.push([0, nach]);
    if (vor && nach) versuche.push([vor, nach]);
    for (const [v, n] of versuche) {
        const [kopf, fuss] = [out.slice(out.length - v), Z.slice(i, i + n)];
        const seiten = {};
        for (const s of ["o", "b", "t"]) if (!(seiten[s] = importAnweisungen([...kopf, ...teil[s], ...fuss]))) break;
        if (seiten.o && seiten.b && seiten.t) return { vor: v, nach: n, seiten };
    }
    return null;
}
// ours zuerst, dann jede weitere Liste: ein Fremder steht hinter seinem Vorgänger in seiner Liste (ohne Vorgänger vorn) und
// hinter dem, was die frühere Liste dort selbst einfügte (beide hängten an: erst ours, dann theirs)
function reiheVon(...listen) {
    const r = [...(listen[0] || [])];
    for (const l of listen.slice(1))
        (l || []).forEach((x, i) => {
            if (r.includes(x)) return;
            let j = i - 1;
            while (j >= 0 && !r.includes(l[j])) j--;
            let p = j < 0 ? 0 : r.indexOf(l[j]) + 1;
            while (p < r.length && !l.includes(r[p])) p++;
            r.splice(p, 0, x);
        });
    return r;
}
function importZeilen(form, art, modul, namen, cr) {
    const ende = `require(${form.q}${modul}${form.q})${form.semi ? ";" : ""}`;
    const z =
        art === "name"
            ? namen.map((n) => `${form.einzug}${form.decl} ${n} = ${ende}`)
            : !form.mehr
              ? [`${form.einzug}${form.decl} { ${namen.join(", ")} } = ${ende}`]
              : [`${form.einzug}${form.decl} {`, ...namen.map((n) => `${form.eintragEinzug}${n},`), `${form.einzug}} = ${ende}`];
    return z.map((x) => x + cr);
}
function loeseImporte(datei, out, stuecke) {
    const { espree, "eslint-scope": scope } = iLeserHol();
    const fall = (st, grund) => ({ fall: `${datei}:${st.start} (Klasse i: ${grund})` });
    const cr = out.some((x) => typeof x === "string" && x.endsWith("\r")) ? "\r" : "";
    const roh = out.map((x) => (typeof x === "string" ? ohneCr(x) : ""));
    let ast0;
    try {
        ast0 = espree.parse(roh.join("\n"), I_PARSE);
    } catch (e) {
        return fall(stuecke[0], `die Datei ohne die Import-Stücke parst nicht: ${e.message}`);
    }
    // genutzt = frei in der Datei ohne die Stücke (gelesen, nirgends sonst gebunden)
    const frei = new Set(scope.analyze(ast0, I_SCOPE).globalScope.through.map((r) => r.identifier.name));
    // je Stück und Schlüssel (Art + Modul) die Namen der drei Seiten; je Name seine Orte und ob er in der 3-Wege-Menge steht
    const orte = new Map();
    stuecke.forEach((st, s) => {
        st.je = {};
        for (const x of ["o", "b", "t"]) {
            st.je[x] = new Map();
            for (const a of st.seiten[x]) {
                const key = `${a.art}\u0000${a.modul}`;
                if (!st.je[x].has(key)) st.je[x].set(key, { a, namen: new Map() });
                for (const e of a.eintraege) st.je[x].get(key).namen.set(e.text, e.lokal);
            }
        }
        st.keys = reiheVon(...["o", "t", "b"].map((x) => [...st.je[x].keys()]));
        for (const key of st.keys) {
            const [B, O, T] = ["b", "o", "t"].map((x) => (st.je[x].get(key) || { namen: new Map() }).namen);
            for (const text of new Set([...B.keys(), ...O.keys(), ...T.keys()])) {
                const lokal = B.get(text) || O.get(text) || T.get(text);
                // Basis ∪ von einer Seite hinzu − von einer Seite gestrichen
                const drei = B.has(text) ? O.has(text) && T.has(text) : true;
                if (!orte.has(lokal)) orte.set(lokal, []);
                orte.get(lokal).push({ s, key, text, drei });
            }
        }
    });
    // je genutzter Name genau EIN Ort: seine 3-Wege-Menge, sonst (gestrichen, aber genutzt) der Ort, aus dem er fiel
    const bleibt = new Map();
    for (const [lokal, ps] of orte) {
        if (!frei.has(lokal)) continue;
        const drin = ps.filter((p) => p.drei);
        const k = drin.length ? drin : ps;
        if (k.length !== 1) return fall(stuecke[k[0].s], `${lokal} an ${k.length} Orten`);
        const id = `${k[0].s}\u0000${k[0].key}`;
        if (!bleibt.has(id)) bleibt.set(id, new Set());
        bleibt.get(id).add(k[0].text);
    }
    // ein Umzug: trägt ours das Muster eines Moduls im Stück nicht, nimmt die letzte Muster-Anweisung desselben Moduls ÜBER dem
    // Stück die Namen auf (oben, außerhalb der Stücke; nie darunter — die Bindung käme nach ihrem Leser)
    const oben = ast0.body.filter(
        (n) => n.type === "VariableDeclaration" && n.declarations.length === 1 && n.declarations[0].id.type === "ObjectPattern" &&
            istRequire(n.declarations[0].init) && musterEintraege(n.declarations[0].id) &&
            !roh[n.loc.start.line - 1].slice(0, n.loc.start.column).trim() && !roh[n.loc.end.line - 1].slice(n.loc.end.column).trim() &&
            !ast0.comments.some((c) => c.range[0] >= n.range[0] && c.range[1] <= n.range[1])
    );
    const ersatz = new Map();
    const neu = [];
    stuecke.forEach((st, s) => {
        const platz = out.indexOf(st);
        st.zeilen = [];
        for (const key of st.keys) {
            const namenSet = bleibt.get(`${s}\u0000${key}`);
            if (!namenSet) continue;
            const [art, modul] = key.split("\u0000");
            const namen = reiheVon(...["o", "t", "b"].map((x) => st.je[x].get(key) && [...st.je[x].get(key).namen.keys()])).filter((t) => namenSet.has(t));
            neu.push(...namen.map((t) => t.replace(/^.*:\s*/, "")));
            const ziel = art === "muster" && !st.je.o.has(key) && oben.filter((n) => n.declarations[0].init.arguments[0].value === modul && n.loc.end.line <= platz).pop();
            if (ziel) {
                const z = ersatz.get(ziel) || { namen: musterEintraege(ziel.declarations[0].id).map((e) => e.text) };
                z.namen.push(...namen.filter((t) => !z.namen.includes(t)));
                ersatz.set(ziel, z);
                continue;
            }
            const quelle = st.je.o.get(key) || st.je.t.get(key) || st.je.b.get(key);
            const leerVor = st.je.o.has(key) ? quelle.a.form.leerVor : 0;
            st.zeilen.push(...Array(leerVor).fill(cr), ...importZeilen(quelle.a.form, art, modul, namen, cr));
        }
        st.zeilen.push(...Array(st.seiten.o.leerNach).fill(cr));
    });
    const ab = new Map([...ersatz].map(([n, z]) => [n.loc.start.line - 1, { bis: n.loc.end.line - 1, zeilen: importZeilen(importForm(roh, n, n.loc.start.line - 1), "muster", n.declarations[0].init.arguments[0].value, z.namen, cr) }]));
    const gemergt = [];
    for (let i = 0; i < out.length; i++) {
        const e = ab.get(i);
        if (e) {
            gemergt.push(...e.zeilen);
            i = e.bis;
        } else gemergt.push(...(typeof out[i] === "string" ? [out[i]] : out[i].zeilen));
    }
    const text = gemergt.join("\n");
    // die Probe des Lösers: parst, kein Name der Stücke frei, jede neue Bindung gelesen und auf der obersten Ebene
    let ast1;
    try {
        ast1 = espree.parse(gemergt.map(ohneCr).join("\n"), I_PARSE);
    } catch (e) {
        return fall(stuecke[0], `die gemergte Datei parst nicht: ${e.message}`);
    }
    const sm = scope.analyze(ast1, I_SCOPE);
    const frei1 = new Set(sm.globalScope.through.map((r) => r.identifier.name));
    const fehlt = [...orte.keys()].filter((n) => frei1.has(n));
    if (fehlt.length) return fall(stuecke[0], `ungebunden ${fehlt.join(", ")}`);
    const modulRaum = sm.scopes.find((c) => c.type === "function" && c.block === ast1);
    for (const n of neu) {
        const v = modulRaum && modulRaum.set.get(n);
        if (!v) return fall(stuecke[0], `${n} nicht auf der obersten Ebene`);
        if (!v.references.some((r) => !r.init)) return fall(stuecke[0], `${n} tot`);
    }
    return { text };
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
// SIEGEL IM VERLAUF, VOR DER BATTERIE (26.11., z742: der grüne Stempel w28-tages-gesetz fiel im Bau an „bis zum Schluss 11 Uhr“ in einem
// WIP-Betreff — 50 min Batterie und 18 min Zug standen vor dem Urteil, sechs Köpfe dahinter). Dieselbe Wand wie der Bau (siegel über das,
// was der Merge brächte), nur früher: probe-tag ruft jeder Arbeiter vor dem Vorprüf-Kopf, die Wache bei jeder Ankunft, bereit() je Takt.
// log = git log --format="%h %s%x00%B%x01" <basis>..<sha>
function siegelImVerlauf(log) {
    const sc = log.split("\x01").find((m) => siegel(m));
    return sc ? `Siegel-Wort „${siegel(sc)}" im Commit ${sc.trim().split("\0")[0].slice(0, 100)} — der Zug hält diesen Verlauf draussen: den Baum als EINEN Commit auf main abgeben (neuer Zweig-Name)` : null;
}
const undListe = (a) => (a.length < 2 ? a.join("") : `${a.slice(0, -1).join(", ")} und ${a[a.length - 1]}`);
function laufe(cmd, args, env = {}) {
    const o = { cwd: ZUG, encoding: "utf8", maxBuffer: 1 << 26, env: { ...process.env, ...env } };
    // npm ist unter Windows ein .cmd und braucht die Shell; node nie (keine Argument-Verkettung)
    const r = cmd === "npm" ? spawnSync(["npm", ...args].join(" "), { ...o, shell: true }) : spawnSync(cmd, args, o);
    const txt = (r.stdout || "") + (r.stderr || "");
    return { ok: r.status === 0, rest: restVon(txt, r.status === 0) };
}
// DER TÄTER STEHT IM REST (22.11., z670: gate:welt-boot fiel am Kandidaten, im Protokoll stand allein die vorletzte, GRÜNE Zeile — sie
// war über 300 Zeichen lang, die rote Urteils-Zeile dahinter fiel am Schnitt weg; beim Nachfahren war der Kandidat GRÜN, der Fall
// blieb ungenannt): bei ROT die roten Zeilen zuerst — ❌ und ⛔ vor ROT · FEHLER · Error (ein Selbsttest druckt die Fehler seiner
// gestellten Fälle als FEHLER, sein Urteil als ❌) —, dann der Schluss, je Zeile höchstens 200 Zeichen; bei GRÜN der Schluss wie bisher
function restVon(txt, ok) {
    const z = String(txt).trim().split("\n");
    if (ok) return z.slice(-2).join(" | ").slice(0, 300);
    const kurz = (s) => (s.trim().length > 200 ? s.trim().slice(0, 199) + "…" : s.trim());
    const hart = z.filter((s) => /❌|⛔/.test(s));
    const rot = hart.length ? hart : z.filter((s) => /ROT|FEHLER|Error/.test(s) && !/^\s*✅/.test(s));
    return [...new Set([...rot.slice(0, 2), ...z.slice(-1)])].map(kurz).join(" | ").slice(0, 600);
}
function sauber() {
    git(["merge", "--abort"], ZUG, true);
    git(["reset", "-q", "--hard"], ZUG, true);
    git(["clean", "-fdq", "-e", "node_modules"], ZUG, true);
}
const DATEN_GOLDEN = /^spec\/asset-contract\/v1\/golden\/(manifest|recipes|world-params|render-config)\.json$/;
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
        // (h) DIE DATEN-KANÄLE DES ASSET-VERTRAGS (01.11. z119/z122: tore-teile, arena-welt und koerper-park münzten je ihr
        // Rezept-Buch — die EINE Hash-Zeile von recipes.json im Golden-Manifest kollidierte bei jedem Paar): recipes ·
        // world-params · render-config und ihr Manifest leiten sich aus dem Buch ab — keine Seite gilt, nach den übrigen
        // Dateien münzt der Code des Zwischenstands sie neu (MINT_NUR_DATEN, unten)
        if (DATEN_GOLDEN.test(d) && hat(2) && hat(3)) {
            git(["checkout", "--ours", "--", d], ZUG);
            git(["add", "--", d], ZUG);
            kl[d] = { h: 1 };
            continue;
        }
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
    if (Object.values(kl).some((k) => k && k.h)) {
        const m = laufe("node", ["scripts/mint-asset-goldens.cjs"], { MINT_NUR_DATEN: "1", MINT_PORT: "4589" });
        if (!m.ok) {
            sauber();
            return { drin: false, grund: `Klasse h: das Münzen der Daten-Kanäle am Zwischenstand scheiterte: ${m.rest}` };
        }
        git(["add", "--", "spec/asset-contract/v1/golden"], ZUG);
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
    git(["commit", "-q", "-m", `${msg}\n\nZug-Auflösung (Klasse a Kommentar · b Karte · c Version · e benachbart · f Leerraum · g Code gegen Kommentar · i Import-Namen): ${body}`.slice(0, 600)], ZUG);
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
// DAS BAU-SCHLOSS (09.11. 19:12): der Worktree des Zugs ist EINER — ein Proben-Bau des Koordinators setzte ihn mitten im Bau von z350
// zurück, der Kandidat c494fcfa trug boden-nah + haar-arm unter dem Namen klang-schritt + probe-node. Ein zweiter Bau neben einem
// lebenden ist ROT beim Namen (PID und Zweige des Halters), nie still.
function bauSchloss(zweige) {
    const f = ZUG + ".bau-schloss";
    try {
        const [pid, ...was] = fs.readFileSync(f, "utf8").split(" ");
        let lebt = false;
        try { process.kill(Number(pid), 0); lebt = true; } catch (e) { lebt = e.code === "EPERM"; } // prettier-ignore
        if (lebt && Number(pid) !== process.pid) throw new Error(`bau besetzt: PID ${pid} baut im Zug-Worktree (${was.join(" ").trim()}) — warte auf sein Ende`);
    } catch (e) {
        if (e.code !== "ENOENT") throw e;
    }
    fs.writeFileSync(f, `${process.pid} ${zweige.join(" ")}`);
    const frei = () => { try { if (fs.readFileSync(f, "utf8").startsWith(process.pid + " ")) fs.unlinkSync(f); } catch {} }; // prettier-ignore
    process.on("exit", frei);
    return frei;
}
// die Pfade, die der Format-Check liest (das Skript „format:check“ in package.json: `node scripts/format-teile.cjs [--…] <pfad …>`)
function formatPfade(pkg) {
    const s = (pkg.scripts || {})["format:check"] || "";
    return s.split(/\s+/).filter((a) => a && !a.startsWith("--") && a !== "node" && !/format-teile\.cjs$/.test(a));
}
function formatGeprueft(datei, pfade) {
    return pfade.some((p) => datei === p || (path.posix.dirname(datei) === p.replace(/\/$/, "") && datei.endsWith(".js")));
}
function formatStufe(basis, drin) {
    const pkg = JSON.parse(fs.readFileSync(path.join(ZUG, "package.json"), "utf8"));
    const pfade = formatPfade(pkg);
    if (!pfade.length) return { rot: "package.json trägt kein „format:check“ mit Pfaden" };
    const dateien = git(["diff", "--name-only", "--diff-filter=d", `${basis}..HEAD`], ZUG).split("\n").filter((d) => d && formatGeprueft(d, pfade));
    if (!dateien.length) return { n: 0 };
    const prettier = path.join(ZUG, "node_modules", "prettier", "bin", "prettier.cjs");
    for (let i = 0; i < dateien.length; i += 40) {
        const r = laufe("node", [prettier, "--write", "--log-level", "warn", ...dateien.slice(i, i + 40)]);
        if (!r.ok) return { rot: `prettier --write: ${r.rest}` };
    }
    git(["add", "--", ...dateien], ZUG);
    const geaendert = git(["diff", "--cached", "--name-only"], ZUG).split("\n").filter(Boolean);
    if (!geaendert.length) return { n: 0 };
    git(["commit", "-q", "-m", `Format-Stufe nach ${undListe(drin)} (prettier --write auf ${geaendert.length} Dateien des Bündels; Format ist kein Urteil)\n\n${CO}`], ZUG);
    return { n: geaendert.length, dateien: geaendert };
}
// mergeAlle <basis> <zweig[@sha]>… — DER EINE BAU-WEG der Merges: Basis auschecken, je Zweig Siegel-Probe und mergeEinen (Klassen a–i).
// Druckt nichts: die Zeilen („drin …“ · „gefallen …“ · „schon drin …“) kommen zurück, denn nachweis liest „drin“ als „stand im
// Kandidaten“ — ein Täter der Vorab-Statik darf dort nie stehen. Der Baum ZUG steht danach auf dem letzten Merge.
function mergeAlle(basis, zweige) {
    sauber();
    git(["checkout", "-q", "--detach", "--force", basis], ZUG);
    const drin = [];
    const zeilen = [];
    for (const spec of zweige) {
        let [z, sha] = spec.split("@");
        if (siegel(z)) {
            zeilen.push(`gefallen ${z}: Siegel-Wort „${siegel(z)}" im Zweig-Namen (wandert in die Merge-Message)`);
            continue;
        }
        if (!sha) {
            holeZweig(z);
            sha = git(["rev-parse", `refs/remotes/origin/${z}`], ZUG, true).stdout.trim();
        } else if (git(["cat-file", "-e", `${sha}^{commit}`], ZUG, true).status !== 0) holeZweig(z);
        if (!sha) {
            zeilen.push(`gefallen ${z}: Zweig fehlt auf origin`);
            continue;
        }
        sha = git(["rev-parse", sha], ZUG);
        if (git(["merge-base", "--is-ancestor", sha, "HEAD"], ZUG, true).status === 0) {
            zeilen.push(`schon drin ${z}@${sha.slice(0, 8)}`);
            continue;
        }
        // 01.11. z118: ein Rumpf MITTEN im Cloud-Zweig trug das Siegel, der GANZE Kandidat fiel am Ende („Siegel-Wort in Merge-
        // oder Stufen-Message“) — nun fällt nur der Zweig, der es bringt, beim Commit genannt (was der Merge brächte: HEAD..sha)
        const sc = git(["log", "--format=%h %s%x00%B%x01", `HEAD..${sha}`], ZUG).split("\x01").find((m) => siegel(m));
        if (sc) {
            zeilen.push(`gefallen ${z}@${sha.slice(0, 8)}: Siegel-Wort „${siegel(sc)}" im Commit ${sc.trim().split("\0")[0].slice(0, 100)}`);
            continue;
        }
        const r = mergeEinen(z, sha);
        const kl = Object.entries(r.kl || {}).map(([d, k]) => `${d} ${Object.entries(k).map(([x, n]) => `${x}${n}`).join("")}`);
        zeilen.push(r.drin ? `drin ${z}@${sha.slice(0, 8)}${kl.length ? ` · aufgelöst ${kl.join(", ")}` : ""}` : `gefallen ${z}@${sha.slice(0, 8)}: ${r.grund}`);
        if (r.drin) drin.push(`${z}@${sha}`);
    }
    return { drin, zeilen };
}

// ── Vorab-Statik: die schnellen statischen Wände am Kandidaten, VOR dem Push nach integ-probe ─────────────────────────────
// 20.11. 01:25, z631: vier je für sich grüne Stempel (Code-Check 18/18) bildeten gegen main 3da9d9ae den Kandidaten 77033d0a, und der
// fiel an der Ein-Schreiber-Wand (diag-pipeline-constitution, 2 s reines node): eine Register-Zeile, die ein Zug VORHER (Kosmos) gefällt
// hatte. Der Dienst sah es erst nach dem Puls (~10 min, dazu ein Neulauf), führte ALLE vier als nicht gelandet, und drei gesunde Abgaben
// verloren einen ganzen Zug. Die Klasse: zwei einzeln grüne Zweige, deren KOMBINATION eine schnelle statische Wand bricht.
// Die Batterie ist das Skript „check:vorab“ AUS DEM KANDIDATEN (package.json; check:statik ruft es zuerst — EINE Liste der Wände,
// versioniert mit den Wänden selbst). Rot → der Täter per Auslassen, mit DEMSELBEN Bau-Weg (mergeAlle): heilt genau ein Auslassen,
// ist er der Täter; heilen mehrere (erst die Kombination bricht), fällt der jüngste Stempel unter ihnen; heilt keines, fällt, wer
// allein gegen main rot ist (sonst der jüngste). Ist main allein rot, gibt es keinen Täter im Zug: er fährt wie bisher, die Zeile
// „VORAB-STATIK MAIN ROT“ nennt es. Kann die Batterie nicht laufen (Skript fehlt im Kandidaten, Modul fehlt), WIRFT der Bau — die
// Maschine ist kein Urteil, nie ein stilles Überspringen.
const VORAB = "check:vorab";
const VORAB_MASCHINE = /Cannot find module|MODULE_NOT_FOUND|ENOENT|is not recognized as|command not found|Missing script/;
const kurzSpec = (s) => `${s.split("@")[0]}@${(s.split("@")[1] || "").slice(0, 8)}`;
// vorabLauf [glieder] — fährt die Glieder von check:vorab (die &&-Kette des Kandidaten) EINZELN und alle, damit jedes rote Glied beim
// Namen steht; die Täter-Suche wiederholt nur die roten (die Ein-Schreiber-Wand allein: ~2 s statt der ganzen Batterie je Auslassen)
function vorabLauf(nur = null) {
    const pkg = JSON.parse(fs.readFileSync(path.join(ZUG, "package.json"), "utf8"));
    const cmd = (pkg.scripts || {})[VORAB];
    if (!cmd) throw new Error(`Vorab-Statik kann nicht laufen: package.json des Kandidaten (${git(["rev-parse", "--short=8", "HEAD"])}) trägt kein „${VORAB}“`);
    const glieder = nur || cmd.split(" && ").map((g) => g.trim()).filter(Boolean);
    const t0 = Date.now();
    const rotGlieder = [];
    const rot = [];
    for (const g of glieder) {
        const r = spawnSync(g, { cwd: ZUG, shell: true, encoding: "utf8", maxBuffer: 1 << 26 });
        if (r.status === 0) continue;
        const txt = (r.stdout || "") + (r.stderr || "");
        const z = txt.split("\n").map((l) => l.trim()).filter((l) => l.includes("❌"));
        if (!z.length && (r.status === null || VORAB_MASCHINE.test(txt))) {
            sauber();
            throw new Error(`Vorab-Statik kann nicht laufen („${g}“, Exit ${r.status}): ${txt.trim().split("\n").slice(-2).join(" | ").slice(0, 300)}`);
        }
        rotGlieder.push(g);
        rot.push(...(z.length ? z : [`${g}: ${txt.trim().split("\n").slice(-2).join(" | ").slice(0, 200)}`]));
    }
    sauber(); // was eine Wand in den Baum schrieb, kommt nie in den Kandidaten
    const s = ((Date.now() - t0) / 1000).toFixed(1);
    return rotGlieder.length ? { gruen: false, s, rot: rot.slice(0, 3), rotGlieder } : { gruen: true, s, n: glieder.length };
}
function juengster(specs) {
    const t = (s) => Number(git(["log", "-1", "--format=%ct", s.split("@")[1]], ZUG));
    return specs.reduce((a, b) => (t(b) > t(a) ? b : a));
}
function vorabStatik(basis, gebaut) {
    if (!gebaut.drin.length) return gebaut;
    const t0 = Date.now();
    const sek = () => ((Date.now() - t0) / 1000).toFixed(1);
    let v = vorabLauf();
    let laeufe = 1;
    if (v.gruen) return { ...gebaut, zeilen: [...gebaut.zeilen, `VORAB-STATIK GRÜN am Bündel (${v.n} Glieder, ${v.s} s): ${gebaut.drin.map(kurzSpec).join(" ")}`] };
    const sv = v.s;
    mergeAlle(basis, []);
    const m = vorabLauf(v.rotGlieder);
    laeufe++;
    if (!m.gruen) {
        const voll = mergeAlle(basis, gebaut.drin);
        return { drin: voll.drin, zeilen: [...gebaut.zeilen, `VORAB-STATIK MAIN ROT ${basis.slice(0, 8)} (kein Täter im Zug, der Zug fährt wie bisher, ${sek()} s): ${m.rot.join(" · ")}`] };
    }
    const fallen = [];
    let liste = gebaut.drin.slice();
    let ende = { drin: [], zeilen: [] };
    for (;;) {
        let taeter;
        let wie;
        if (liste.length === 1) [taeter, wie] = [[{ spec: liste[0], rot: v.rot }], "allein im Bündel"];
        else {
            const heil = liste.filter((spec) => (mergeAlle(basis, liste.filter((x) => x !== spec)), laeufe++, vorabLauf(v.rotGlieder).gruen));
            if (heil.length === 1) [taeter, wie] = [[{ spec: heil[0], rot: v.rot }], "ohne ihn grün"];
            else if (heil.length > 1) {
                const j = juengster(heil);
                [taeter, wie] = [[{ spec: j, rot: v.rot }], `erst die Kombination mit ${heil.filter((x) => x !== j).map((x) => x.split("@")[0]).join(", ")} bricht — der jüngste Stempel fällt`];
            } else {
                const allein = [];
                for (const spec of liste) {
                    mergeAlle(basis, [spec]);
                    const a = vorabLauf(v.rotGlieder);
                    laeufe++;
                    if (!a.gruen) allein.push({ spec, rot: a.rot });
                }
                [taeter, wie] = allein.length ? [allein, "allein gegen main rot"] : [[{ spec: juengster(liste), rot: v.rot }], "kein Auslassen heilt — der jüngste Stempel fällt"];
            }
        }
        for (const t of taeter) fallen.push({ ...t, wie });
        liste = liste.filter((x) => !taeter.some((t) => t.spec === x));
        if (!liste.length) {
            mergeAlle(basis, []);
            break;
        }
        // was fährt, ist an der GANZEN Batterie grün (ein Auslassen kann eine andere Wand öffnen — dann sucht die Schleife weiter)
        const b = mergeAlle(basis, liste);
        v = vorabLauf();
        laeufe++;
        if (v.gruen) {
            ende = b;
            break;
        }
    }
    const suche = sek();
    const weg = new Set(fallen.map((f) => f.spec.split("@")[0]));
    return {
        drin: ende.drin,
        zeilen: [
            ...gebaut.zeilen.filter((z) => !/^drin /.test(z) && !weg.has((/^gefallen (\S+?)[@:]/.exec(z) || [])[1])),
            ...ende.zeilen,
            ...fallen.map((f) => `gefallen ${kurzSpec(f.spec)}: VORAB-STATIK ROT an main ${basis.slice(0, 8)} (${f.wie}): ${f.rot.join(" · ")}`),
            `VORAB-STATIK: ${fallen.length} Täter (${fallen.map((f) => f.spec.split("@")[0]).join(", ")}) in ${laeufe} Läufen, ${suche} s (erste Batterie ${sv} s, Gegenprobe am Rest ${v.gruen ? v.s : "—"} s) — es fahren: ${ende.drin.map(kurzSpec).join(" ") || "keiner"}`,
        ],
    };
}
// vorab --basis <sha|ref> <zweig@sha>… — Bau-Weg und Vorab-Statik ohne Stufe und Push (der Probe-Rahmen: selbsttest --vorab); Exit 0 =
// es bleibt ein Kandidat
function vorab(args) {
    const bi = args.indexOf("--basis");
    if (bi < 0) throw new Error("vorab braucht --basis <ref>");
    const zweige = args.filter((a, i) => !a.startsWith("--") && i !== bi + 1);
    const frei = bauSchloss(zweige);
    try {
        const g = vorabStatik(git(["rev-parse", args[bi + 1]], ZUG), mergeAlle(git(["rev-parse", args[bi + 1]], ZUG), zweige));
        for (const z of g.zeilen) console.log(z);
        console.log(`VORAB KANDIDAT ${g.drin.map(kurzSpec).join(" ") || "keiner"}`);
        return g.drin.length ? 0 : 1;
    } finally {
        frei();
    }
}

function bau(args, opt = {}) {
    const frei = bauSchloss(args.filter((a) => !a.startsWith("--")));
    try {
        return bauRumpf(args, opt);
    } finally {
        frei();
    }
}
function bauRumpf(args, { trocken = false } = {}) {
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
    const gebaut = vorabStatik(basis, mergeAlle(basis, zweige));
    for (const z of gebaut.zeilen) console.log(z);
    const drin = gebaut.drin.map((s) => s.split("@")[0]);
    if (!drin.length) {
        console.log(`KEIN KANDIDAT: kein Zweig drin (Basis ${basis.slice(0, 8)})`);
        return 1;
    }
    const pkg = JSON.parse(fs.readFileSync(path.join(ZUG, "package.json"), "utf8"));
    const v = pkg.version.replace(/(\d+)$/, (n) => String(Number(n) + 1));
    const msg = `V${v}: Versions-Stufe nach ${undListe(drin)} (alle versionierten Dateien tragen den neuen ?v=) [ci voll]`;
    // DER BAU PRÜFT NUR, WAS DER PULS NICHT FÄHRT (13.11., der Schöpfer: „der tüv bämängelt, bevor die anpassung vollständig“):
    // diag-atlas --check und das Betriebsgesetz (am Push von integ-probe urteilt es den ZUG, check.yml puls 1 „Statik“) fahren im
    // Puls am selben Kandidaten — sie fielen hier. Es bleiben stamm:lint (in keinem Job der CI) und der welt-boot-Selbsttest (nur in
    // voll 11, die beim Erbe nicht im Zug urteilt). Ein Rot der Wachstums-Wand steht jetzt im Puls; zug-dienst.sh liest es aus dem
    // roten Text (zug-rot-<id>.txt) und gibt die Köpfe frei wie vorher am Bau.
    const pruef = [
        ["stamm:lint", "npm", ["run", "-s", "stamm:lint"]],
        // die Zwillings-Wände einer Decke-Zahlstelle fassen die Zwillinge der ANDEREN Mitglieder (26.10. z37: ein setTimeout-Schlaf
        // aus b-streu-faden, 36 min CI-ROT für eine Zeile) — der Selbsttest fährt sie in ~25 s
        ["gate:welt-boot (Zwillings-Wände)", "node", ["scripts/lib/welt-boot.cjs", "--selbsttest"]],
    ];
    // FORMAT IST KEIN URTEIL (13.11.: 5 der letzten 30 Rot-Urteile waren nur Prettier — verkehr-bild, mensch-menge ×3, halm-trieb; ein
    // Zyklus ~27 min): der Bau formatiert die vom Bündel geänderten Dateien, die der Format-Check der CI liest (die Pfade aus
    // package.json „format:check“ am Kandidaten — ein Verzeichnis steht dort für seine .js-Dateien, wie scripts/format-teile.cjs), mit
    // dem Prettier des Kandidaten, und legt eine Änderung als EIGENE Format-Stufe vor die Versions-Stufe. Der Baum weicht dann vom
    // Zweig-Kopf ab — das Erbe greift nicht, voll fährt.
    const fmt = formatStufe(basis, drin);
    if (fmt.rot) {
        console.log(`KANDIDAT ROT an der Format-Stufe: ${fmt.rot} (HEAD ${git(["rev-parse", "HEAD"]).slice(0, 8)}, nicht gestempelt)`);
        return 1;
    }
    if (fmt.n) console.log(`aufgefrischt: Format-Stufe (prettier --write auf ${fmt.n} Dateien des Bündels: ${fmt.dateien.slice(0, 6).join(", ")}${fmt.n > 6 ? " …" : ""})`);
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
        // DIE DECKUNG NACH DEM AUFFRISCHEN (z633, 20.11.: das Neu-Messen warf die Einträge zweier neuer Schritte aus der Tafel —
        // (T) UNGEMESSEN stand erst 35 min später in der CI, vier Abgaben fielen): dieselbe Linse noch einmal am aufgefrischten
        // Kandidaten; was an der Zeit-Tafel dann noch rot ist, steht VOR dem Push beim Namen
        const dn = spawnSync("node", ["scripts/diag-ci-deckung.cjs"], { cwd: ZUG, encoding: "utf8", maxBuffer: 1 << 26 });
        const rest = zeitRest((dn.stdout || "") + (dn.stderr || ""));
        if (rest.length) {
            console.log(`KANDIDAT ROT an gate:ci-deckung nach dem Auffrischen der CI-Zeiten: ${rest.join(" | ")} (HEAD ${git(["rev-parse", "HEAD"]).slice(0, 8)}, nicht gestempelt)`);
            return 1;
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
        // DER GRUND STEHT BEIM PUSH, UND DIE MASCHINE IST KEIN URTEIL (z447, 15.11.: der Push des gebauten Kandidaten fiel, im Log stand
        // nur „error: failed to push some refs“ — der Grund stand in der Zeile davor —, und w28-wange blieb als „gefahren“ liegen, ohne
        // integ-probe je erreicht zu haben): der Push fährt bis zu dreimal; fällt er an Leitung, Schloss oder Server, WIRFT der Bau
        // („zug bau FEHLER“ — der Dienst gibt die Köpfe frei, drei in Folge sind sein ALARM); weist der Server den INHALT ab, ist das
        // ein Urteil über den Kandidaten, und der Kopf bleibt gefahren
        const ref = `${ziel.startsWith("+") ? "+" : ""}${kand}:refs/heads/${ziel.replace(/^\+/, "")}`;
        let grund = "";
        for (let i = 1; i <= 3; i++) {
            const p = git(["push", "origin", ref], ZUG, true);
            if (p.status === 0) {
                console.log(`PUSH ${kand.slice(0, 8)} → ${ziel}`);
                return 0;
            }
            grund = pushGrund(p.stderr || p.stdout || "");
            console.log(`PUSH ABGEWIESEN (${i}/3) → ${ziel}: ${grund}`);
            if (pushInhalt(grund)) {
                console.log(`PUSH URTEIL → ${ziel}: der Server weist den Inhalt des Kandidaten ab — ${grund}`);
                return 1;
            }
            if (i < 3) Atomics.wait(new Int32Array(new SharedArrayBuffer(4)), 0, 0, 10e3);
        }
        throw new Error(`der Push nach ${ziel} fiel dreimal an der Maschine — ${grund}`);
    }
    console.log(ziel ? `trocken: kein Push nach ${ziel}` : "lokal: kein Push (--push <ziel-ref>)");
    return 0;
}

// ── teile ────────────────────────────────────────────────────────────────────────────────────────────────────────────
// der Aufbau eines Kandidaten: Basis ← Merges der Zweige ← (Format-Stufe · CI-Zeiten) ← Versions-Stufe (der Kandidat selbst)
function zugAufbau(sha, repo = INTEG) {
    const zweige = [];
    let c = git(["rev-parse", `${sha}^1`], repo); // der Kandidat ist die Versions-Stufe
    for (;;) {
        const [eltern, s] = git(["log", "-1", "--format=%P%x00%s", c], repo).split("\x00");
        const p = eltern.split(" ");
        if (p.length === 1 && /^(CI-Zeiten neu|Format-Stufe nach)/.test(s)) {
            c = p[0]; // die Auffrischung der Zeit-Quelle und die Format-Stufe liegen zwischen Merges und Stufe
            continue;
        }
        const m = /^Merge (\S+) in integ-probe/.exec(s);
        if (p.length < 2 || !m) break;
        zweige.unshift(`${m[1]}@${p[1]}`);
        c = p[0];
    }
    return { basis: c, zweige };
}
async function teile(args) {
    const trocken = args.includes("--trocken");
    const sha = git(["rev-parse", args.find((a) => !a.startsWith("--"))], INTEG);
    const { basis, zweige } = zugAufbau(sha);
    if (zweige.length < 2) {
        console.log(`teile: ${zweige.length} Zweig(e) im Kandidaten ${sha.slice(0, 8)} — nichts zu teilen, der Zweig selbst ist der Täter`);
        return 1;
    }
    if (!trocken) {
        const u = await urteilVon(sha, { neulauf: false });
        if (u.wort !== "ROT") {
            console.log(`teile: Kandidat ${sha.slice(0, 8)} ist nicht ROT nach dem Neulauf (${u.zeile})`);
            return 1;
        }
    } else {
        try {
            const u = await urteilVon(sha, { neulauf: false });
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
    return rot ? 1 : 0;
}

// ── landen ───────────────────────────────────────────────────────────────────────────────────────────────────────────
async function landen(args) {
    const sha = git(["rev-parse", args.find((a) => !a.startsWith("--"))], INTEG);
    const u = await urteilVon(sha, { neulauf: false });
    // --wackler-frei (08.11., Schöpfer „nach vorn“): z296–z322 fiel die Fenster-Wand 6× und K6 Kamera-Leib 5× rot, nie mit
    // Täter — jeder Neulauf kostete ~20 min. Ist JEDER rote Schritt ein benannter Wackler, landet der Kopf ohne Neulauf; den
    // Rückfall fängt die Messung nach der Landung (Ratsche), nie die Wand.
    const nurWackler = args.includes("--wackler-frei") && u.wort === "ROT" && u.rot?.length && u.rot.every((r) => r.n !== "abgebrochen" && WACKEL_RE.test(r.s));
    if (u.wort !== "GRUEN" && !nurWackler) {
        console.log(`landen ABBRUCH: Urteil nicht GRUEN — ${u.zeile}`);
        return 1;
    }
    if (nurWackler) console.log(`landen: nur Wackler rot, übergangen — ${u.zeile}`);
    // KEIN BEIN DER KARTEN AM LANDE-SHA (LANDUNG ≤ 10 MIN, 23.11.): bis hier verlangte landen jedes Bein (omen · radeon · gtx1050) grün
    // am Kandidaten — das Bein omen allein trug 28,9 der 29,4 min von z695. Den GPU-Beweis trug je Kopf die GPU-Probe seiner Vorprüfung
    // (der Einlass verlangt sie, zug-dienst.sh bereit); was der Zug zusammenfügt, sieht die Nachwache auf main (`nachwache`).
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
    // davor — gelandet wird bei grünem Urteil (kopf und Puls); ein späteres LANGSAMER nimmt der Fahrer per Revert zurück.
    // Ein schon geschriebenes LANGSAMER oder UNENTSCHIEDEN für genau diesen SHA sperrt weiter.
    const gesperrt = [...letzte].some(([k, l]) => sha.startsWith(k) && !gilt(l));
    // DAS LOG SAGT, WAS LÄUFT (13.11.): „Nachwache“ stand in jedem Lande-Log, aber seit 11.11. lief keine (FAHRT_ABAB aus, zug/abab.txt
    // ohne Zeile) — Nachwache heißt es nur, wenn eine ABAB-Zeile für diesen Kandidaten in der Warteschlange steht
    if (!z && args.includes("--nachwache") && !gesperrt) {
        const ws = path.join(KOORD, "zug", "warteschlange.txt");
        const abab = (fs.existsSync(ws) ? fs.readFileSync(ws, "utf8").split("\n") : []).find((l) => / abab /.test(l) && l.includes(`B=${sha}`));
        z = abab
            ? `${sha} Nachwache (ABAB-Zeile ${abab.split(/\s+/)[0]} in zug/warteschlange.txt, das Urteil folgt nach der Landung)`
            : `${sha} ohne ABAB (keine Messung angestoßen; gemessen wird am Mess-Kopf, buche.sh)`;
    }
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
    const g = (a, opt = {}) => spawnSync("git", a, { cwd: VOLL, encoding: "utf8", maxBuffer: 1 << 28, ...opt });
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
    const argv = [pc, "run", "--sha", sha, "--geraet", geraet, ...(wert("--nur") ? ["--nur", wert("--nur")] : args.includes("--alle") ? [] : ["--offen"]),
        ...(wert("--bahnen") ? ["--bahnen", wert("--bahnen")] : [])];
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

// ── der Grund eines gefallenen Pushs ─────────────────────────────────────────────────────────────────────────────────
// git schließt jeden gefallenen Push mit „error: failed to push some refs to …“; der Grund steht davor: die Ref-Zeile („ ! [remote
// rejected] … (Grund)“), die Zeilen des Servers („remote: …“) oder ein „fatal:“ der Leitung. pushGrund nennt diese Zeilen, pushInhalt
// sagt, ob der Server den INHALT abweist (Regel, Haken, Geheimnis, Größe, Recht am Workflow) — alles andere ist die Maschine.
function pushGrund(stderr) {
    const z = String(stderr).split(/\r?\n/).map((l) => l.trim()).filter(Boolean);
    const g = z.filter((l) => /^(!|remote:|fatal:|error:)/.test(l) && !/^error: failed to push some refs/.test(l));
    return (g.length ? g : z.slice(-1)).join(" | ").slice(0, 600) || "git nannte keinen Grund";
}
const pushInhalt = (grund) => /pre-receive hook declined|rule violations|GH0\d\d|protected branch|push protection|without `?workflow`? scope|exceeds GitHub|file size limit/i.test(grund);

// ── nachweis: DIE LANDUNG WIRD NACHGEWIESEN, je Zweig ────────────────────────────────────────────────────────────────
// 11.11. 19:01: z390 fuhr mit w28-wald-saum und w28-ziel-plan los; die Statik-Probe des Sammlers ließ ziel-plan 18:26 fallen, der
// Kandidat trug nur wald-saum — und der Dienst schrieb „z390 GELANDET“ über BEIDE, ziel-plan 58acfa5e stand als gefahren in
// zug-gefahren.txt und in keiner Warteliste, zwei Tage still verloren. Das Urteil eines Zugs gilt je Zweig: GELANDET nur, wessen Kopf
// Vorfahr von origin/main ist; GEURTEILT, wer im Kandidaten eines roten Zugs stand (sein Kopf bleibt gefahren); jeder andere ist
// FREI — er fiel vor oder im Bau, über ihn fiel kein Urteil des Zugs, sein Kopf fährt wieder.
// Kein Karussell: fiel ein Zweig ALLEIN (der Zug trug nur ihn) an einer Probe oder im Bau, war das ein Urteil über genau ihn — er bleibt
// gefahren (GEURTEILT), bis ein neuer Kopf kommt; frei wird nur, wer im Bündel mit anderen fiel oder ohne benannten Grund.
// KOPF-EIGEN (16.11., z582–z585: w28-ankunft-faden, w28-feld-fuss und w28-licht-kern fielen seit 02:50 in JEDEM Zug am Siegel-Wort
// eines fremden WIP-Commits in ihrem Verlauf, 361-mal „Kopf wieder frei“, drei Züge fuhren leer): ein Fall, den nur der Verlauf des
// Kopfs trägt — das Siegel-Wort im Commit oder im Zweig-Namen —, fällt in jedem Bündel wieder. Er ist ein Urteil über den Kopf, auch
// im Bündel: GEURTEILT, der Dienst schickt ihn EINMAL heim (heim.sh, cloud-post/<zweig>.md). Konflikt, Zwischenstand-Klassen und
// ein fehlender Zweig hängen am Bündel oder an main und bleiben FREI.
const kopfEigen = (zeile) => /: Siegel-Wort „[^"“]*["“] im (Commit|Zweig-Namen)/.test(zeile || "");
// VORAB (20.11., z631): ein Täter der Vorab-Statik wurde NICHT gefahren — er steht weder als geurteilt (sein Rot hing an main oder an
// der Kombination) noch als „nicht gelandet“ (zug-nicht-gelandet.txt); der Dienst hält ihn in zug-vorab-rot.txt, bis sein Kopf ODER
// main sich ändert. Das gilt auch, wenn er allein fuhr.
const VORAB_RE = /: VORAB-STATIK ROT an main ([0-9a-f]{7,40}) /;
function nachweisUrteil({ zweige, inMain, drin, gelandet, gefallen = new Set(), eigen = new Set(), vorab = new Map() }) {
    return zweige.map((spec) => {
        const [zweig, sha] = spec.split("@");
        if (inMain.has(spec)) return { zweig, sha, wort: "GELANDET" };
        if (!drin.has(zweig) && vorab.has(zweig)) return { zweig, sha, wort: "VORAB", main: vorab.get(zweig) };
        if (drin.has(zweig) && !gelandet) return { zweig, sha, wort: "GEURTEILT" };
        if (!drin.has(zweig) && eigen.has(zweig)) return { zweig, sha, wort: "GEURTEILT", kopfEigen: true };
        if (!drin.has(zweig) && zweige.length === 1 && gefallen.has(zweig)) return { zweig, sha, wort: "GEURTEILT" };
        return { zweig, sha, wort: "FREI", grund: drin.has(zweig) ? "im Kandidaten, aber nicht in main" : "nicht im Kandidaten" };
    });
}
// nachweis [--gelandet] --log <datei> … <zweig@sha> … → je Zweig eine Zeile NACHWEIS GELANDET|GEURTEILT|FREI; Exit 1, wenn einer FREI ist
function nachweis(args) {
    const logs = [];
    const zweige = [];
    for (let i = 0; i < args.length; i++) {
        if (args[i] === "--log") logs.push(args[++i]);
        else if (!args[i].startsWith("--")) zweige.push(args[i]);
    }
    const text = logs.map((f) => (fs.existsSync(f) ? fs.readFileSync(f, "utf8") : "")).join("\n");
    const drin = new Set([...text.matchAll(/^\s*(?:schon )?drin (\S+)@[0-9a-f]+/gm)].map((m) => m[1]));
    git(["fetch", "-q", "origin", "+refs/heads/main:refs/remotes/origin/main"], INTEG);
    const inMain = new Set(zweige.filter((s) => git(["merge-base", "--is-ancestor", s.split("@")[1], "origin/main"], INTEG, true).status === 0));
    // je Zweig die letzte Zeile, die ihn fallen ließ (Sammler: STATIK/VORZUG FÄLLT · Bau: gefallen)
    const fall = new Map();
    for (const spec of zweige) {
        const n = spec.split("@")[0].replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
        const z = text.split("\n").filter((l) => new RegExp(`(FÄLLT|gefallen) ${n}(?=[@:\\s]|$)`).test(l)).pop();
        if (z) fall.set(spec.split("@")[0], z.trim().slice(0, 200));
    }
    let frei = 0;
    const eigen = new Set([...fall].filter(([, z]) => kopfEigen(z)).map(([b]) => b));
    const vorab = new Map([...fall].filter(([, z]) => VORAB_RE.test(z)).map(([b, z]) => [b, VORAB_RE.exec(z)[1]]));
    for (const u of nachweisUrteil({ zweige, inMain, drin, gelandet: args.includes("--gelandet"), gefallen: new Set(fall.keys()), eigen, vorab })) {
        if (u.wort === "FREI") frei++;
        if (u.wort === "VORAB") {
            // die ❌-Zeilen sind der Grund in der Warte-Liste; die Zeile darf hier länger sein als die 200 Zeichen der übrigen Gründe
            const z = text.split("\n").filter((l) => l.includes(`gefallen ${u.zweig}@`) && VORAB_RE.test(l)).pop() || "";
            console.log(`NACHWEIS VORAB ${u.zweig}@${u.sha} ${u.main} — ${z.replace(/^.*?: VORAB-STATIK ROT an main \S+ /, "").trim().slice(0, 600)}`);
            continue;
        }
        const grund = u.wort === "FREI" ? ` — ${u.grund}${fall.has(u.zweig) ? `: ${fall.get(u.zweig)}` : ""}` : u.kopfEigen ? ` — kopf-eigen: ${fall.get(u.zweig)}` : u.wort === "GEURTEILT" && fall.has(u.zweig) ? ` — fiel allein: ${fall.get(u.zweig)}` : "";
        console.log(`NACHWEIS ${u.wort} ${u.zweig}@${u.sha}${grund}`);
    }
    return frei ? 1 : 0;
}

// ── taeter: DER TÄTER AN DEN ECHT-WÄNDEN, vom Dienst selbst ─────────────────────────────────────────────────────────────
// 20.11., z637 (Lauf 44686031159): vier je für sich grüne Stempel fuhren zusammen, der Kandidat fiel am Job „echt omen“ an Prüfbühne
// S0 und Frost-Wand — einem Job, der NUR am Kandidaten fährt, an keiner Vorprüfung eines Zweigs. Alle vier blieben gefahren, der
// Dirigent suchte 70 min von Hand (je Stempel merge-tree, Baum, Junction, die rote Linse unter gpu-lauf.sh): einer allein rot, drei
// unschuldig, die drei bekamen von Hand neue Köpfe. Jetzt der Dienst: die roten echt-Schritte des Laufs → ihr Befehl aus check.yml AM
// KANDIDATEN (Schritt-Name → run:, die Umgebung des Jobs echt) → je Stempel ALLEIN auf der Basis des Kandidaten jeder rote Befehl
// EINMAL unter gpu-lauf.sh (die CI hat dort Vorfahrt) → je Stempel EINE Zeile TÄTER/UNSCHULDIG. Steht ein Täter, bekommen die
// Unschuldigen (kein Täter der Vorab-Statik) einen neuen Kopf: ein leerer Commit auf den alten Stempel, derselbe Betreff samt Tags mit
// dem Vorsatz „neuer Kopf nach rotem z<N> …“ hinter „Abgabe <zweig>: “ (bereit() in zug-dienst.sh sieht nur Betreffe, die mit
// „Abgabe“ BEGINNEN). Steht kein Einzeltäter, wird nichts gestempelt (Kombination oder Gerät). Scheitert ein Schritt der Maschine,
// steht „TÄTER-SUCHE ABGEBROCHEN: <grund>“ und nichts wird gestempelt — nie ein halbes Urteil.
// je Schloss-Ruf 600 s; die ganze Suche höchstens 90 min (sie läuft neben der Schleife des Dienstes, zug-dienst.sh taeter_anstoss)
const TAETER_DECKEL = { stempel: 4, waende: 3, s: 600, fahrten: 3, frist_min: 90 };
const TAETER_KARTE = "radeon"; // die Karte des Dienst-Rechners: die Suche urteilt nur, was HIER rot fällt
const TAETER_AUTOR = { name: "MiguellD", mail: "87209049+MiguellD@users.noreply.github.com" };
const WAND_RUN = /^(npm run |node scripts\/)/;
const wandKurz = (n) => n.replace(/\s*\(.*$/, "").replace(/ auf der Karte$/, "");
const zweigKurz = (z) => z.replace(/^w2\d-/, "");
// die Schritte des Jobs echt aus dem check.yml-Text des Kandidaten: je roter Name sein run: und die Umgebung (Job + Schritt); ein
// Name, der dort fehlt, oder ein Schritt, der keine Wand ist, WIRFT (die Suche bricht ab)
function echtBefehle(ymlText, namen) {
    const yaml = require(require.resolve("js-yaml", { paths: [__dirname, VOLL] }));
    const job = ((yaml.load(ymlText) || {}).jobs || {}).echt;
    if (!job || !Array.isArray(job.steps)) throw new Error("check.yml des Kandidaten trägt keinen Job „echt“ mit Schritten");
    return namen.map((name) => {
        const s = job.steps.find((x) => x && x.name === name);
        if (!s || typeof s.run !== "string") throw new Error(`Befehl nicht in check.yml gefunden: „${name}“`);
        const run = s.run.trim();
        if (!WAND_RUN.test(run) || run.includes("\n")) throw new Error(`der rote Schritt „${name}“ ist keine Wand (run: ${run.slice(0, 80)})`);
        return { name, kurz: wandKurz(name), run, env: { ...(job.env || {}), ...(s.env || {}) } };
    });
}
function neuerBetreff(alt, zid, waende) {
    const vor = `neuer Kopf nach rotem ${zid} (allein an der Radeon grün: ${waende.join(", ")}) — `;
    const m = /^(Abgabe [^:]+: )([\s\S]*)$/.exec(alt);
    return m ? m[1] + vor + m[2] : vor + alt;
}
// DAS URTEIL (rein, der Selbsttest ersetzt nur `lauf`): stempel = [{ spec, betreff }], waende = echtBefehle, statik = Set der Zweige,
// die die Vorab-Statik fallen ließ; lauf(spec, wand) → { rot, zeile } · { ohne } (kein Urteil nach allen Fahrten) · { abbruch }; pflicht(stempel) → die Pflicht-Wände, die
// seinem Probe-Tag fehlen (probeTagLuecke am Beitrag). Zurück: die Zeilen und die neuen Köpfe.
// DIE BASIS-PROBE (21.11., z652 und z653): „ROT allein“ beweist nur dann einen Täter, wenn dieselbe Wand an der Basis OHNE jeden
// Stempel grün ist. z652 schrieb „TÄTER w28-herde-gesetz: Wasser-Bild ROT allein (❌ B4 REGEN … uLicht [0,0,0])“ — die Regen-Probe
// war an main 9f24b5b8 selbst rot (Radeon 3 von 3), z653 fiel mit einem anderen Stempel an derselben Wand, der Schneider suchte zwei
// Stunden im falschen Schnitt. Jede Wand, an der ein Stempel allein rot fällt, fährt darum EINMAL an der Basis (lauf(null, wand)):
// fällt sie dort rot, trägt kein Stempel sie (UNSCHULDIG „… ROT auch an der Basis“, kein neuer Kopf, solange die Basis rot ist);
// bleibt die Basis ohne Urteil, steht das beim Täter. Kosten: je roter Wand eine Fahrt.
function taeterUrteil({ zid, stempel, waende, statik = new Set(), geraete = [], lauf, pflicht = () => [], bis = Infinity, jetzt = Date.now, basis = "" }) {
    const n = waende.length;
    if (stempel.length > TAETER_DECKEL.stempel || n > TAETER_DECKEL.waende)
        return { zeilen: [`TÄTER-SUCHE ABGEBROCHEN: Deckel ${TAETER_DECKEL.stempel} Stempel × ${TAETER_DECKEL.waende} Wände, der Zug trägt ${stempel.length} × ${n}`], neu: [] };
    if (!n) return { zeilen: ["TÄTER-SUCHE ABGEBROCHEN: kein roter echt-Schritt im Lauf"], neu: [] };
    const je = [];
    for (const st of stempel) {
        const urteile = [];
        for (const w of waende) {
            if (jetzt() > bis) return { zeilen: [`TÄTER-SUCHE ABGEBROCHEN: Frist ${TAETER_DECKEL.frist_min} min über alles verstrichen (vor ${zweigKurz(st.spec.split("@")[0])} an ${w.kurz}), nichts gestempelt`], neu: [] };
            const r = lauf(st.spec, w);
            if (r.abbruch) return { zeilen: [`TÄTER-SUCHE ABGEBROCHEN: ${zweigKurz(st.spec.split("@")[0])} an ${w.kurz}: ${r.abbruch}`], neu: [] };
            urteile.push({ w, ...r });
        }
        je.push({ st, urteile });
    }
    const basisRot = []; // { w, zeile }: die Wand fällt ohne jeden Stempel
    const basisOhne = new Map(); // Wand → Grund: die Basis blieb ohne Urteil, das Urteil am Stempel steht mit diesem Vermerk
    for (const w of waende) {
        const rote = je.flatMap((x) => x.urteile).filter((u) => u.w === w && u.rot);
        if (!rote.length) continue;
        if (jetzt() > bis) return { zeilen: [`TÄTER-SUCHE ABGEBROCHEN: Frist ${TAETER_DECKEL.frist_min} min über alles verstrichen (vor der Basis an ${w.kurz}), nichts gestempelt`], neu: [] };
        const r = lauf(null, w);
        if (r.abbruch) return { zeilen: [`TÄTER-SUCHE ABGEBROCHEN: die Basis an ${w.kurz}: ${r.abbruch}`], neu: [] };
        if (r.ohne) basisOhne.set(w, r.ohne);
        if (!r.rot) continue;
        basisRot.push({ w, zeile: r.zeile });
        for (const u of rote) (u.rot = false), (u.basis = true);
    }
    const zeilen = [];
    const taeter = je.filter((x) => x.urteile.some((u) => u.rot));
    for (const { st, urteile } of je) {
        const z = st.spec.split("@")[0];
        const rot = urteile.filter((u) => u.rot);
        const ohne = urteile.filter((u) => u.ohne);
        const anBasis = urteile.filter((u) => u.basis);
        const gruen = n - rot.length - ohne.length - anBasis.length;
        const auch = anBasis.map((u) => `${u.w.kurz} ROT auch an der Basis`).join(" · ");
        const rest = `${auch && rot.length ? ` · ${auch}` : ""}${ohne.length && rot.length ? ` · ${ohne.map((u) => `${u.w.kurz} ohne Urteil`).join(" · ")}` : ""}${gruen && gruen < n ? ` · ${gruen} von ${n} allein GRÜN` : ""}`;
        zeilen.push(
            rot.length
                ? `TÄTER ${z}: ${rot.map((u) => `${u.w.kurz} ROT allein (${u.zeile})${basisOhne.has(u.w) ? " · die Basis dort ohne Urteil" : ""}`).join(" · ")}${rest}`
                : ohne.length
                  ? `OHNE URTEIL ${z}: ${ohne.map((u) => `${u.w.kurz} ohne Urteil (${u.ohne})`).join(" · ")}${auch ? ` · ${auch}` : ""}${gruen ? ` · ${gruen} von ${n} allein GRÜN` : ""} — weder Täter noch neuer Kopf`
                  : anBasis.length
                    ? `UNSCHULDIG ${z}: ${auch}${gruen ? ` · ${gruen} von ${n} allein GRÜN` : ""} — kein neuer Kopf, solange die Basis rot ist`
                    : `UNSCHULDIG ${z}: ${n} von ${n} roten Wänden allein GRÜN${statik.has(z) ? " — doch Täter der Vorab-Statik, kein neuer Kopf" : ""}`
        );
    }
    if (!taeter.length) {
        zeilen.push(
            basisRot.length
                ? `KEIN TÄTER AN DIESER KARTE (${TAETER_KARTE}): BASIS ROT${basis ? ` ${basis.slice(0, 8)}` : ""} — ${basisRot.map((b) => `${b.w.kurz} fällt ohne jeden Stempel (${b.zeile})`).join(" · ")}; sie fällt mit jedem Zug, bis main oder die Wand geheilt ist, nichts gestempelt`
                : `KEIN TÄTER AN DIESER KARTE (${TAETER_KARTE}): kein Stempel allein rot — Kombination oder Gerät (rot fiel am Bein ${geraete.join(", ") || "?"}), nichts gestempelt`
        );
        return { zeilen, neu: [] };
    }
    const neu = je
        .filter((x) => x.urteile.every((u) => !u.rot && !u.ohne && !u.basis) && !statik.has(x.st.spec.split("@")[0]))
        .map(({ st }) => ({ spec: st.spec, betreff: tagErgaenzt(neuerBetreff(st.betreff, zid, waende.map((w) => w.kurz)), pflicht(st)) }));
    return { zeilen, neu };
}
// rot-text.cjs liegt in der Quelle neben werkzeug/, installiert in dienst/ neben werkzeug/ — dieselbe Datei, zwei Orte
function rotLeser() {
    const ort = [path.join(__dirname, "..", "rot-text.cjs"), path.join(__dirname, "..", "dienst", "rot-text.cjs")].find((f) => fs.existsSync(f));
    if (!ort) throw new Error("rot-text.cjs fehlt neben werkzeug/ (die Lesung der roten Zeile)");
    return require(ort).taeter;
}
// DER BAUM EINES STEMPELS ALLEIN: ein Temp-Worktree von INTEG an der Basis (node_modules als Junction), darin DERSELBE Bau-Weg wie im
// Zug (mergeAlle im Kind mit ZUG_WT, die Klassen a–i: ein nacktes merge-tree fiel am ersten Beweis an der Versions-Zeile von
// index.html, die der Zug als Klasse c löst). Zurück { wt, weg } oder { abbruch, weg }.
function stempelBaum(zid, basis, spec) {
    const d = fs.mkdtempSync(path.join(os.tmpdir(), `zug-taeter-${zid}-`));
    const wt = path.join(d, "wt");
    const weg = () => {
        git(["worktree", "remove", "--force", wt], INTEG, true);
        fs.rmSync(d, { recursive: true, force: true });
    };
    try {
        git(["worktree", "add", "-q", "--detach", wt, basis], INTEG);
        fs.symlinkSync(path.join(VOLL, "node_modules"), path.join(wt, "node_modules"), "junction");
        // die Basis-Probe (spec null): derselbe Baum ohne jeden Stempel
        if (!spec) return { wt, weg };
        const k = spawnSync(process.execPath, ["-e", `const z=require(${JSON.stringify(__filename)});console.log("BAU "+JSON.stringify(z.mergeAlle(${JSON.stringify(basis)},${JSON.stringify([spec])})))`], {
            encoding: "utf8",
            maxBuffer: 1 << 26,
            env: { ...process.env, ZUG_WT: wt },
            windowsHide: true,
        });
        const m = /^BAU (.*)$/m.exec(k.stdout || "");
        if (!m) return { abbruch: `der Bau-Weg allein scheitert: ${((k.stdout || "") + (k.stderr || "")).trim().split("\n").pop().slice(0, 200)}`, weg };
        const g = JSON.parse(m[1]);
        if (g.drin.length !== 1) return { abbruch: `allein auf der Basis ${basis.slice(0, 8)} nicht baubar: ${g.zeilen.join(" · ").slice(0, 200)}`, weg };
        return { wt, weg };
    } catch (e) {
        return { abbruch: `der Baum allein: ${String(e.message).split("\n")[0].slice(0, 200)}`, weg };
    }
}
// DREI AUSGÄNGE JE FAHRT (20.11., erster Beweis-Lauf z637: „laub-kante-4 · Pruefbuehne S0: ROT — Error: listen EADDRINUSE …:4394“ —
// ein Absturz der Fahrt stand als Täter, von Hand war main + laub-kante-4 an S0 GRÜN, Nacht-Luma 22,3): GRÜN (Exit 0) · ROT nur, wenn
// die Linse ihr Urteil sprach (eine ⛔/❌-Zeile der Wand, gelesen wie rot-text.cjs) · OHNE URTEIL alles andere — Absturz, Port, Schloss,
// Deckel, die Maschine. Ohne Urteil wird die Fahrt wiederholt (TAETER_DECKEL.fahrten), danach steht der Stempel „ohne Urteil“.
const FAHRT_MASCHINE = /EADDRINUSE|Cannot find module|MODULE_NOT_FOUND|is not recognized as|command not found|Missing script|^(NEBEN-)?SCHLOSS BLOCKIERT/m;
function fahrtUrteil(status, txt, taeterZeile) {
    if (status === 0) return { wort: "GRÜN" };
    const rein = txt.split("\n").filter((x) => !/^gpu-lauf: /.test(x)).join("\n");
    const zeilen = taeterZeile(rein).map((l) => l.trim());
    const erste = zeilen.find((l) => !/^\(/.test(l)) || rein.trim().split("\n").pop() || `Exit ${status}`;
    if (status === 75) return { wort: "OHNE", grund: `GPU-Schloss blockiert (${erste.slice(0, 140)})` };
    if (status === 124) return { wort: "OHNE", grund: `Deckel ${TAETER_DECKEL.s} s` };
    if (status === null || FAHRT_MASCHINE.test(rein)) return { wort: "OHNE", grund: `Absturz der Fahrt, nicht die Wand (Exit ${status}): ${(rein.match(FAHRT_MASCHINE) ? rein.split("\n").find((l) => FAHRT_MASCHINE.test(l)) : erste).trim().slice(0, 160)}` };
    // ❌ liest rot-text (ohne die erwarteten Mutanten-❌); das ⛔ der Bild-Wände („⛔ S0 BILD ROT · Nacht …“) kennt rot-text nicht — es
    // steht als eigene Zeile der Linse
    const urteil = zeilen.find((l) => /❌/.test(l) && !/✅/.test(l)) || rein.split("\n").map((l) => l.trim()).find((l) => /^⛔/.test(l));
    return urteil ? { wort: "ROT", zeile: urteil.slice(0, 200) } : { wort: "OHNE", grund: `kein Urteil der Wand (Exit ${status}): ${erste.slice(0, 160)}` };
}
// DER PORT JE FAHRT, AUS DER QUELLE DER LINSE: die Wand liest ihren Port aus der Umgebung (diag-pruefbuehne.cjs: PRUEFBUEHNE_PORT,
// Default 4394 — eine fremde Welt am selben Rechner hielt ihn); gelesen wird der Befehl (npm run → das Skript in package.json des
// Baums) und je genanntem scripts/…-Skript jedes `process.env.<…PORT>`; jeder bekommt einen freien Port (listen 0)
function portUmgebung(wt, run) {
    const pkg = JSON.parse(fs.readFileSync(path.join(wt, "package.json"), "utf8")).scripts || {};
    let befehl = run;
    for (let i = 0, m; i < 3 && (m = /npm run (?:-s )?(\S+)/.exec(befehl)); i++) befehl = befehl.replace(m[0], pkg[m[1]] || "");
    const namen = new Set();
    for (const [f] of befehl.matchAll(/scripts\/[\w./-]+\.c?js/g)) {
        const p = path.join(wt, f);
        if (fs.existsSync(p)) for (const [, n] of fs.readFileSync(p, "utf8").matchAll(/process\.env\.([A-Z][A-Z0-9_]*PORT)\b/g)) namen.add(n);
    }
    if (!namen.size) return {};
    const k = spawnSync(process.execPath, ["-e", `const n=require("net");const s=[];let i=0;const f=()=>{const v=n.createServer();v.listen(0,"127.0.0.1",()=>{s.push(v);if(++i<${namen.size})f();else{console.log(s.map(x=>x.address().port).join(" "));s.forEach(x=>x.close())}})};f()`], { encoding: "utf8", windowsHide: true });
    const ports = (k.stdout || "").trim().split(" ").filter(Boolean);
    if (ports.length !== namen.size) throw new Error(`kein freier Port für ${[...namen].join(", ")}`);
    return Object.fromEntries([...namen].map((n, i) => [n, ports[i]]));
}
// EINE Wand im Baum eines Stempels: der Befehl unter gpu-lauf.sh (Deckel GPU_LAUF_MAX_S=600, das GPU-Schloss mit Vorfahrt der CI), je Fahrt ein
// frischer Port; ohne Urteil bis zu TAETER_DECKEL.fahrten Fahrten
function wandLauf(zid, wt, spec, w, taeterZeile, melde = () => {}, bis = Infinity) {
    const t0 = Date.now();
    let u;
    for (let f = 1; f <= TAETER_DECKEL.fahrten && (f === 1 || Date.now() < bis); f++) {
        const port = portUmgebung(wt, w.run);
        const r = spawnSync("sh", [path.join(__dirname, "gpu-lauf.sh"), `taeter-${zid}-${spec ? zweigKurz(spec.split("@")[0]) : "basis"}`, "sh", "-c", w.run], {
            cwd: wt,
            encoding: "utf8",
            maxBuffer: 1 << 28,
            env: { ...process.env, ...w.env, ...port, GPU_LAUF_MAX_S: String(TAETER_DECKEL.s), GPU_LAUF_WARTE_S: String(Math.max(60, Math.min(2700, Math.floor((bis - Date.now()) / 1000)))) },
            windowsHide: true,
        });
        u = fahrtUrteil(r.status, (r.stdout || "") + (r.stderr || ""), taeterZeile);
        if (u.wort !== "OHNE") break;
        melde(`Fahrt ${f}/${TAETER_DECKEL.fahrten} ohne Urteil: ${u.grund}`);
    }
    const s = ((Date.now() - t0) / 1000).toFixed(0);
    return u.wort === "GRÜN" ? { rot: false, s } : u.wort === "ROT" ? { rot: true, s, zeile: u.zeile } : { ohne: `${u.grund} — ${TAETER_DECKEL.fahrten} Fahrten`, s };
}
// taeter <zid> --log <fahre-log> [--kandidat <sha>] [--lauf <id>] [--trocken] — die Suche nach einem roten Zug (zug-dienst.sh
// urteilen); --trocken setzt keinen Kopf (nur der Beweis-Aufruf, nie der Dienst). Exit 0 Urteil steht · 1 ein Push fiel · 2 abgebrochen
async function taeter(args) {
    const wert = (k) => { const i = args.indexOf(k); return i >= 0 ? args[i + 1] : null; }; // prettier-ignore
    const zid = args[0];
    const trocken = args.includes("--trocken");
    const bis = Date.now() + TAETER_DECKEL.frist_min * 60e3;
    try {
        if (!zid || /^--/.test(zid)) throw new Error("Aufruf: taeter <zid> --log <fahre-log> [--kandidat <sha>] [--lauf <id>] [--trocken]");
        if (!process.env.TOKEN) throw new Error("kein Token (git credential fill gab keins)");
        const log = wert("--log") && fs.existsSync(wert("--log")) ? fs.readFileSync(wert("--log"), "utf8") : "";
        const kand = wert("--kandidat") || (/Kandidat ([0-9a-f]{40})/.exec(log) || [])[1];
        const laufId = wert("--lauf") || ([...log.matchAll(/FAHRT ROT.*?Lauf (\d{8,})/g)].pop() || [])[1];
        if (!kand || !laufId) throw new Error(`Kandidat oder Lauf nicht im Log (${kand ? "" : "Kandidat "}${laufId ? "" : "Lauf"})`);
        const { basis, zweige } = zugAufbau(git(["rev-parse", kand], INTEG), INTEG);
        if (!zweige.length) throw new Error(`der Kandidat ${kand.slice(0, 8)} trägt keinen Merge eines Stempels`);
        // die Vorab-Statik dieses Zugs: ihr Urteil MUSS im Log stehen, sonst ist „kein Statik-Täter“ nicht belegt
        if (!/VORAB-STATIK (GRÜN|MAIN ROT|ROT|: )/.test(log)) throw new Error("das Fahrt-Log trägt kein Urteil der Vorab-Statik");
        const statik = new Set([...log.matchAll(/gefallen (\S+?)@\S*: VORAB-STATIK ROT/g)].map((m) => m[1]));
        const run = await api(`/actions/runs/${laufId}`);
        const { letzte } = lesart(await jobsAlle(run));
        const echtRot = [...letzte].filter(([n, j]) => /^echt/.test(n) && ROT.has(j.conclusion));
        const namen = [...new Set(echtRot.flatMap(([, j]) => rotSchritte(j)))].filter((s) => s !== "?");
        const geraete = echtRot.map(([n]) => n.replace(/^echt\s+(\S+).*$/, "$1"));
        if (!echtRot.length) {
            console.log(`KEINE TÄTER-SUCHE: kein roter echt-Job im Lauf ${laufId}`);
            return 0;
        }
        // --stempel a,b / --wand <kurz>: NUR der Beweis-Aufruf von Hand wählt Paare aus (die Radeon trägt nicht 4 × 2 Fahrten neben der
        // Mess-Sitzung); der Dienst ruft ohne und fährt jeden Stempel an jeder roten Wand
        const nurS = wert("--stempel") && wert("--stempel").split(",");
        const nurW = wert("--wand");
        const waende = echtBefehle(git(["show", `${kand}:.github/workflows/check.yml`], INTEG), namen).filter((w) => !nurW || w.kurz === nurW);
        const stempel = zweige
            .filter((spec) => !nurS || nurS.includes(spec.split("@")[0]))
            .map((spec) => ({ spec, betreff: git(["log", "-1", "--format=%s", spec.split("@")[1]], INTEG) }));
        if ((nurS && stempel.length !== nurS.length) || (nurW && !waende.length)) throw new Error(`--stempel/--wand trifft nicht (${stempel.length} Stempel, ${waende.length} Wände)`);
        console.log(`TÄTER-SUCHE ${zid} am Kandidaten ${kand.slice(0, 8)} (Lauf ${laufId}, Basis ${basis.slice(0, 8)}): ${stempel.length} Stempel × ${waende.length} Wände (${waende.map((w) => `${w.kurz} = ${w.run}`).join(" · ")})${nurS || nurW ? " — Auswahl des Beweis-Aufrufs" : ""}`);
        for (const w of waende) console.log(`  Umgebung ${w.kurz} (Job echt aus check.yml am Kandidaten): ${Object.entries(w.env).map(([k, v]) => `${k}=${v}`).join(" ")}`);
        const leser = rotLeser();
        let baum = null; // je Stempel EIN Baum für alle seine Wände
        let u;
        try {
            u = taeterUrteil({
                zid, stempel, waende, statik, geraete, bis, basis,
                pflicht: (st) => (probeTagLuecke(beitrag(basis, st.spec.split("@")[1], INTEG), st.betreff) || { fehlt: [] }).fehlt,
                lauf: (spec, w) => {
                    if (!baum || baum.spec !== spec) {
                        if (baum) baum.weg();
                        baum = { spec, ...stempelBaum(zid, basis, spec) };
                    }
                    const ort = `  ${spec ? spec.split("@")[0] : `Basis ${basis.slice(0, 8)} ohne Stempel`} · ${w.kurz}:`;
                    const r = baum.abbruch ? { abbruch: baum.abbruch } : wandLauf(zid, baum.wt, spec, w, leser, (z) => console.log(`${ort} ${z}`), bis);
                    console.log(`${ort} ${r.abbruch ? `ABBRUCH ${r.abbruch}` : r.ohne ? `OHNE URTEIL ${r.s} s — ${r.ohne}` : r.rot ? `ROT ${r.s} s — ${r.zeile}` : `GRÜN ${r.s} s`}`);
                    return r;
                },
            });
        } finally {
            if (baum) baum.weg();
        } // prettier-ignore
        for (const z of u.zeilen) console.log(z);
        if (u.zeilen.some((z) => /^TÄTER-SUCHE ABGEBROCHEN/.test(z))) return 2;
        let fiel = 0;
        for (const { spec, betreff } of u.neu) {
            const [z, sha] = spec.split("@");
            if (trocken) {
                console.log(`NEUER KOPF (trocken, nicht gesetzt) ${z} auf ${sha.slice(0, 8)}: ${betreff}`);
                continue;
            }
            const jetzt = git(["ls-remote", "origin", `refs/heads/${z}`], INTEG).split(/\s/)[0];
            if (jetzt !== sha) {
                console.log(`NEUER KOPF entfällt ${z}: der Zweig trägt schon ${String(jetzt).slice(0, 8) || "nichts"} statt ${sha.slice(0, 8)}`);
                continue;
            }
            const env = { ...process.env, GIT_AUTHOR_NAME: TAETER_AUTOR.name, GIT_AUTHOR_EMAIL: TAETER_AUTOR.mail, GIT_COMMITTER_NAME: TAETER_AUTOR.name, GIT_COMMITTER_EMAIL: TAETER_AUTOR.mail };
            const c = spawnSync("git", ["commit-tree", `${sha}^{tree}`, "-p", sha, "-m", betreff, "-m", CO], { cwd: INTEG, encoding: "utf8", env, windowsHide: true });
            const neu = (c.stdout || "").trim();
            const p = c.status === 0 ? git(["push", "origin", `${neu}:refs/heads/${z}`], INTEG, true) : c;
            if (p.status === 0) console.log(`NEUER KOPF ${z} ${neu.slice(0, 8)} auf ${sha.slice(0, 8)}: ${betreff}`);
            else fiel++, console.log(`NEUER KOPF ABGEWIESEN ${z}: ${pushGrund(p.stderr || p.stdout || "")}`);
        }
        return fiel ? 1 : 0;
    } catch (e) {
        console.log(`TÄTER-SUCHE ABGEBROCHEN: ${String(e.message || e).split("\n")[0].slice(0, 300)}`);
        return 2;
    }
}

// ── probe-tag: DAS BILD-TAG VOR DER FAHRT ───────────────────────────────────────────────────────────────────────────
// dieselbe Wurzel wie taeter (z637): ein Beitrag an Sicht, Tiefe, Siedlung oder Ankunft trifft die Wände Prüfbühne S0 und Frost-Wand,
// die nur am Kandidaten (echt omen) fahren — trägt sein Betreff sie nicht im [gpu-probe: …]-Tag, sah sie keine Probe am Zweig. Der
// Zug lässt ihn dann nicht fahren; er wartet mit dem Grund beim Namen (zug-dienst.sh bereit). DIE EINE STELLE der Pfade und Wände,
// je Regel EINE Wurzel — jede kam aus einem roten Zug an einer Wand, die nur am Kandidaten fährt:
//   Bau   (z637): Sicht, Tiefe, Siedlung, Ankunft → Prüfbühne S0 und Frost-Wand (echt omen)
//   Haus  (z648): wer Häuser stellt (Siedlung, fachwerk-Kern, Samen-Baum) → das Studio-Dorf begehen (echt radeon; Samen allein riss
//                 „B3 Kopfraum: 4 Austritte unter 1.7 m“)
//   Licht (z647): Himmel und Leuchten → die Tag-Achse (echt omen; die Nacht-Lichter rissen „ASYNC genesis: Uhr 0 0.56 EV“)
const PROBE_PFLICHT = [
    { name: "Bau", pfade: [/^stamm\/siedlung-/, /^stamm\/bild-sicht\.js$/, /^stamm\/bild-tiefe\.js$/, /^stamm\/dirigent-ankunft\.js$/], gates: ["gate:pruefbuehne-licht", "gate:weltbild-frost:echt"] },
    { name: "Haus", pfade: [/^stamm\/siedlung-/, /^fachwerk-core\.js$/, /^samen-core\.js$/], gates: ["gate:studio-begehen"] },
    { name: "Licht", pfade: [/^stamm\/bild-himmel\.js$/, /^welt-licht\.js$/], gates: ["gate:tag-achse:echt"] },
];
const PFLICHT_GATES = [...new Set(PROBE_PFLICHT.flatMap((r) => r.gates))];
// der Beitrag eines Stempels: git diff --name-only <basis> $(git merge-tree --write-tree <basis> <sha>) (auch mit Konflikt-Markern:
// merge-tree schreibt den Baum dann trotzdem)
function beitrag(basis, sha, repo) {
    const mt = git(["merge-tree", "--write-tree", basis, sha], repo, true);
    const baum = (mt.stdout || "").split("\n")[0].trim();
    if (!/^[0-9a-f]{40}$/.test(baum)) throw new Error(`merge-tree ${basis.slice(0, 8)} ${sha.slice(0, 8)}: ${(mt.stderr || mt.stdout || "").trim().slice(0, 200)}`);
    return git(["diff", "--name-only", basis, baum], repo).split("\n").filter(Boolean);
}
// die Lücke über ALLE Regeln: je getroffener Regel die Wände, die das Tag nicht trägt; `noetig` = alle Wände der getroffenen Regeln
function probeTagLuecke(dateien, betreff) {
    const tag = ((/\[gpu-probe:([^\]]*)\]/.exec(betreff) || [])[1] || "").split(",").map((s) => s.trim());
    const treffer = PROBE_PFLICHT.map((r) => ({ r, datei: dateien.find((d) => r.pfade.some((rx) => rx.test(d))) })).filter((t) => t.datei);
    const offen = treffer.map((t) => ({ datei: t.datei, fehlt: t.r.gates.filter((g) => !tag.includes(g)) })).filter((t) => t.fehlt.length);
    if (!offen.length) return null;
    return { datei: offen[0].datei, fehlt: [...new Set(offen.flatMap((t) => t.fehlt))], noetig: [...new Set(treffer.flatMap((t) => t.r.gates))] };
}
// mehr Pflicht-Wände als der Einlass trägt, heilt kein Tag: der Grund nennt es (der Beitrag fährt in zwei Stempeln)
function probeTagFehlt(dateien, betreff) {
    const l = probeTagLuecke(dateien, betreff);
    if (!l) return null;
    const ueber = l.noetig.length > PROBE_EINLASS_MAX ? ` — ${l.noetig.length} Pflicht-Wände über dem Einlass ${PROBE_EINLASS_MAX}: den Beitrag in zwei Stempel teilen` : "";
    return `Probe-Tag ohne ${undListe(l.fehlt)} (Beitrag fasst ${l.datei} an)${ueber}`;
}
// DER EINLASS DER PROBE (.github/workflows/gpu-probe.yml, Schritt „Einlass“): genau EINE Marke [gpu-probe: …] und höchstens 4 Proben je
// Push — ein Tag darüber weist die Probe ab, und der Kopf stünde für immer an „GPU-Probe nicht GRÜN“. DIE ZAHL IST DIE ZAHL DER
// PFLICHT-WÄNDE (21.11., saat-argument): ein Wurzel-Schnitt, der Bau, Haus und Licht trifft, braucht alle vier in EINEM Kopf — die
// alte 3 (Läufer-Minuten, 3 × 8 min) zwang ihn in zwei Stempel, also zwei CI-Läufe und zwei Fahrten gegen 8 min Probe. Freie Proben
// eines Auftrags bleiben bei höchstens 3 (das steht im Brief, nicht hier). Dieselbe Zahl steht in gpu-probe.yml (Schritt „Einlass“).
const PROBE_EINLASS_MAX = 4;
const tagProben = (betreff) => ((/\[gpu-probe:([^\]]*)\]/.exec(betreff) || [])[1] || "").split(",").map((s) => s.trim()).filter(Boolean);
// der neue Kopf eines Unschuldigen: ohne Lücke trägt er sein Tag unverändert; fehlt eine Pflicht-Wand, trägt er ALLE Wände jeder Regel,
// der eine fehlt, dazu die Pflicht-Wände, die sein altes Tag schon trug — und, solange der Einlass Platz lässt, genau EINE Probe des
// alten Tags: mit Vorrang das bild: (nie eine sichtbare Änderung ohne Bild), sonst die erste. Füllen die Pflicht-Wände den Einlass
// (Bau + Haus + Licht = 4), fällt das bild: — das Bildpaar kommt dann aus dem Bericht des Schneiders
function tagErgaenzt(betreff, fehlt) {
    if (!fehlt.length) return betreff;
    const altes = tagProben(betreff);
    const pflicht = PFLICHT_GATES.filter((g) => altes.includes(g) || PROBE_PFLICHT.some((r) => r.gates.includes(g) && r.gates.some((x) => fehlt.includes(x))));
    const alt = altes.filter((p) => !PFLICHT_GATES.includes(p));
    const eine = pflicht.length < PROBE_EINLASS_MAX ? alt.find((p) => p.startsWith("bild:")) || alt[0] : null;
    const tag = `[gpu-probe: ${[...(eine ? [eine] : []), ...pflicht].join(", ")}]`;
    // (genau EINE alte Probe, auch wenn der Einlass zwei trüge: der neue Kopf eines Unschuldigen fährt so schmal wie möglich)
    if (/\[gpu-probe:[^\]]*\]/.test(betreff)) return betreff.replace(/\[gpu-probe:[^\]]*\]/, tag);
    return /\[ci voll\]\s*$/.test(betreff) ? betreff.replace(/\s*\[ci voll\]\s*$/, ` ${tag} [ci voll]`) : `${betreff} ${tag}`;
}
// das Tag am Einlass: mehr als PROBE_EINLASS_MAX Proben ist ROT beim Namen (kein Warten heilt es, nur ein neuer Kopf)
function probeTagEinlass(betreff) {
    const n = tagProben(betreff).length;
    return n > PROBE_EINLASS_MAX ? `${n} Proben im [gpu-probe: …]-Tag, höchstens ${PROBE_EINLASS_MAX} je Push (Einlass gpu-probe.yml) — nur ein neuer Kopf heilt es` : null;
}
// probe-tag <zweig@sha> [--basis <ref>] — der Beitrag = git diff --name-only <basis> $(merge-tree --write-tree <basis> <sha>) im Klon des
// Dienstes; Exit 0 „PROBE-TAG OK“, 1 „PROBE-TAG FEHLT: <grund>“ (wartet), 3 „PROBE-TAG ROT: <grund>“ (der Einlass weist ab), 2 die Maschine
function probeTag(args) {
    const bi = args.indexOf("--basis");
    const spec = args.find((a, i) => !a.startsWith("--") && (bi < 0 || i !== bi + 1));
    const basis = bi >= 0 ? args[bi + 1] : "origin/main";
    if (!spec) throw new Error("Aufruf: probe-tag <zweig@sha> [--basis <ref>]");
    const sha = spec.includes("@") ? spec.split("@")[1] : spec;
    const betreff = git(["log", "-1", "--format=%s", sha], VOLL);
    const rot = probeTagEinlass(betreff) || siegelImVerlauf(git(["log", "--format=%h %s%x00%B%x01", `${basis}..${sha}`], VOLL));
    if (rot) {
        console.log(`PROBE-TAG ROT: ${rot}`);
        return 3;
    }
    const grund = probeTagFehlt(beitrag(basis, sha, VOLL), betreff);
    console.log(grund ? `PROBE-TAG FEHLT: ${grund}` : "PROBE-TAG OK");
    return grund ? 1 : 0;
}

// ── Selbsttest des Urteils und der Nachwache (ohne Netz) ──────────────────────────────────────────────────────────────
// LANDUNG ≤ 10 MIN: das Urteil am Kandidaten ist kopf und Puls — die Fälle am gestellten Lauf, dazu der Mutant „das alte Gesetz“ (die
// volle Batterie und jedes Bein der Karten sind Pflicht); die Nachwache nennt die Landungen seit dem letzten grünen main
function selbsttestUrteil(pr) {
    const j = (name, conclusion, status = "completed", steps = []) => ({ name, conclusion, status, run_attempt: 1, steps });
    const run = (status = "completed", run_attempt = 1) => ({ id: 7, head_branch: "integ-probe", run_attempt, status });
    const zug = [j("kopf", "success"), j("puls 1/2", "success"), j("puls 2/2", "success")];
    const uebersprungen = [...VOLL_PFLICHT.map((n) => j(n + " cpu", "skipped")), j("echt omen (GPU-Wände auf der Karte)", "skipped")];
    const faelle = [
        ["kopf und Puls grün, voll und echt übersprungen → GRUEN", { run: run(), jobs: [...zug, ...uebersprungen] }, "GRUEN"],
        ["kopf und Puls grün, der Lauf ohne voll-Jobs → GRUEN (voll erbt)", { run: run(), jobs: zug }, "GRUEN"],
        ["ein Bein der Karten läuft am selben Kopf (Abruf) → GRUEN, der Zug wartet nie auf die Karten", { run: run(), jobs: [...zug, j("echt omen (GPU-Wände auf der Karte)", null, "in_progress")] }, "GRUEN"],
        ["voll rot in einem Abruf am selben Kopf → GRUEN (voll urteilte am Zweig-Kopf, main wacht)", { run: run(), jobs: [...zug, j("voll 3/18 cpu", "failure", "completed", [{ name: "Haus der Welt", conclusion: "failure" }])] }, "GRUEN"],
        ["ein Puls läuft → LAEUFT", { run: run("in_progress"), jobs: [zug[0], zug[1], j("puls 2/2", null, "in_progress")] }, "LAEUFT"],
        ["der Puls fehlt noch im laufenden Lauf → LAEUFT", { run: run("in_progress"), jobs: [zug[0]] }, "LAEUFT"],
        ["ein Puls rot, Versuch 1 → Neulauf", { run: run(), jobs: [zug[0], zug[1], j("puls 2/2", "failure", "completed", [{ name: "Statik", conclusion: "failure" }])] }, "LAEUFT"],
        ["ein Puls rot, Versuch 2 → ROT beim Schritt", { run: run("completed", 2), jobs: [zug[0], zug[1], j("puls 2/2", "failure", "completed", [{ name: "Statik", conclusion: "failure" }])] }, "ROT"],
        ["der Kopf-Richter rot (Versuch 2) → ROT", { run: run("completed", 2), jobs: [j("kopf", "failure"), zug[1], zug[2]] }, "ROT"],
    ];
    const wort = (u, e) => {
        const x = u(e);
        return x.wort === "ROT" ? `ROT ${x.rot.map((r) => r.n + "/" + r.s).join(",")}` : x.wort;
    };
    for (const [n, e, soll] of faelle) {
        const w = wort(urteilAus, e);
        pr(`Urteil ${n} (${w})`, w.split(" ")[0] === soll);
    }
    pr("Urteil: der rote Puls nennt seinen Schritt", wort(urteilAus, faelle.find(([n]) => n.startsWith("ein Puls rot, Versuch 2"))[1]) === "ROT puls 2/2/Statik");
    // DER MUTANT: das alte Gesetz — die volle Batterie ist Pflicht im Zug (PFLICHT mit voll 1–18) und jedes Bein der Karten (landen)
    const altesGesetz = ({ run: r, jobs }) => {
        const { letzte } = lesart(jobs);
        const pfl = [...PFLICHT, ...VOLL_PFLICHT];
        const gruen = (n) => [...letzte].some(([k, x]) => kurz(k) === n && x.conclusion === "success");
        const beine = [...letzte].filter(([n]) => /^echt/.test(n)).map(([, x]) => x);
        return { wort: pfl.every(gruen) && beine.length && beine.every((x) => x.conclusion === "success") ? "GRUEN" : "UNVOLL", rot: [] };
    };
    pr("Urteil: der Mutant „das alte Gesetz“ (voll und jedes Bein Pflicht) fällt am Kandidaten mit grünem kopf und Puls", wort(altesGesetz, faelle[0][1]) !== "GRUEN" && wort(altesGesetz, faelle[1][1]) !== "GRUEN");
    // die Nachwache: Läufe auf main, neueste zuerst
    const lauf = (id, sha, voll) => ({ run: { id, head_sha: sha.padEnd(40, "0") }, jobs: voll.map((c, i) => j(`voll ${i + 1}/18 cpu`, c === "lauf" ? null : c, c === "lauf" ? "in_progress" : "completed", c === "failure" ? [{ name: "Haus der Welt", conclusion: "failure" }] : [])) }); // prettier-ignore
    const bereich = [];
    const zwischen = (g, k) => (bereich.push(`${g ? g.slice(0, 8) : "—"}..${k.slice(0, 8)}`), [`w28-a@${(g || "x").slice(0, 4)}`, "w28-b@bbbb0000"]);
    const nw = (l) => nachwacheUrteil(l, zwischen);
    const rotUeberGruen = [lauf(30, "cccc", ["success", "failure"]), lauf(29, "bbbb", ["failure", "success"]), lauf(28, "aaaa", ["success", "success"])];
    const u1 = nw(rotUeberGruen);
    pr(`Nachwache: rot über rot über grün nennt den Bereich seit dem letzten GRÜNEN main (${u1.zeile})`, u1.wort === "ROT" && u1.gruen.startsWith("aaaa") && bereich.at(-1) === "aaaa0000..cccc0000" && /voll 2\/18\/Haus der Welt/.test(u1.zeile) && /w28-a@aaaa w28-b@bbbb0000/.test(u1.zeile));
    const u2 = nw([lauf(31, "dddd", ["lauf", "success"]), lauf(30, "cccc", ["success", "success"])]);
    pr(`Nachwache: der jüngste fährt noch, der fertige davor ist grün (${u2.zeile})`, u2.wort === "GRUEN" && /cccc0000/.test(u2.zeile) && /dddd0000 fährt noch/.test(u2.zeile));
    const u3 = nw([lauf(32, "eeee", ["skipped", "skipped"]), lauf(31, "dddd", ["failure"]), lauf(30, "cccc", ["success"])]);
    pr(`Nachwache: ein Lauf ohne Urteil der Batterie zählt nicht (${u3.zeile})`, u3.wort === "ROT" && u3.sha.startsWith("dddd"));
    const u4 = nw([lauf(33, "ffff", ["failure"])]);
    pr(`Nachwache: ohne grünes main nennt sie den Bereich ohne Anfang (${u4.zeile})`, u4.wort === "ROT" && u4.gruen === null && bereich.at(-1) === "—..ffff0000");
    // ABGEBROCHEN IST KEIN URTEIL (26.11., Läufe 45764758296 und 45776471095): nur cancelled → OHNE URTEIL mit dem ablösenden Kopf;
    // cancelled und EIN failure → ROT am failure, die abgebrochenen ohne Namen
    const u5 = nw([lauf(42, "hhhh", ["lauf", "lauf"]), lauf(41, "gggg", ["cancelled", "cancelled"]), lauf(40, "ffff", ["success", "success"])]);
    pr(`Nachwache: nur abgebrochene Jobs sind kein Urteil (${u5.zeile})`, u5.wort === "OHNE URTEIL" && /^NACHWACHE OHNE URTEIL main gggg0000 \(Lauf 41 abgelöst von main hhhh0000, Lauf 42: 2 von 2 Jobs/.test(u5.zeile));
    const u6 = nw([lauf(41, "gggg", ["cancelled", "failure"]), lauf(40, "ffff", ["success", "success"])]);
    pr(`Nachwache: abgebrochen und ein failure bleibt ROT am failure (${u6.zeile})`, u6.wort === "ROT" && /\(Lauf 41: voll 2\/18\/Haus der Welt\)/.test(u6.zeile));
    // der Mutant: „nur der Kopf zählt“ — er nennt nur die letzte Landung, nie den Bereich seit dem letzten grünen main
    const nurKopf = (l) => { const u = nachwacheUrteil(l.slice(0, 1), zwischen); return u; }; // prettier-ignore
    pr("Nachwache: der Mutant „nur der jüngste Lauf“ verliert den grünen Anfang des Bereichs", nurKopf(rotUeberGruen).gruen === null);
}
// DIE LINSE DES ERBES (26.11., zug-erbt-baum): ein echter git-Baum im Temp-Ordner (Vorprüf-Kopf V, Stempel S ohne Inhalt, Stempel S1
// mit EINEM Byte mehr, Neu-Stempel S2 über S), die Läufe gestellt; je Fall der Name im ROT. Der Leser ist bereit() in zug-dienst.sh:
// ERBE GRÜN und eine Zeile „GPU-Probe: completed success“ fahren im selben Takt, alles andere wartet beim Namen.
function selbsttestErbe(pr) {
    const d = fs.mkdtempSync(path.join(os.tmpdir(), "zug-erbe-"));
    try {
        const g = (...a) => git(a, d);
        g("init", "-q");
        const env = { GIT_AUTHOR_NAME: "t", GIT_AUTHOR_EMAIL: "t@t", GIT_COMMITTER_NAME: "t", GIT_COMMITTER_EMAIL: "t@t" };
        const ct = (tree, eltern, msg) =>
            spawnSync("git", ["commit-tree", tree, ...eltern.flatMap((e) => ["-p", e]), "-m", msg], { cwd: d, encoding: "utf8", env: { ...process.env, ...env }, maxBuffer: 1 << 20, windowsHide: true }).stdout.trim();
        const baum = (text) => {
            fs.writeFileSync(path.join(d, "x.txt"), text);
            g("add", "x.txt");
            return g("write-tree");
        };
        const a = ct(baum("a\n"), [], "WIP a [skip ci]");
        const tv = baum("ab\n");
        const v = ct(tv, [a], "Vorprüfung x 1 (auf main a): x [gpu-probe: bild:wiese@0.5] [ci voll]");
        const s = ct(tv, [v], "Abgabe w28-x: x [gpu-probe: bild:wiese@0.5] [ci voll]");
        const s1 = ct(baum("ac\n"), [v], "Abgabe w28-x: x [gpu-probe: bild:wiese@0.5] [ci voll]");
        const s2 = ct(tv, [s], "Abgabe w28-x: neuer Kopf nach rotem z1 — x [gpu-probe: bild:wiese@0.5] [ci voll]");
        const lies = (x) => {
            const [h, t, p, ...m] = g("log", "-1", "--format=%H%n%T%n%P%n%B", x).split("\n");
            return { sha: h, tree: t, parents: p ? p.split(" ") : [], message: m.join("\n") };
        };
        const job = (name, conclusion) => ({ name, conclusion, status: "completed", steps: [] });
        const gruenJobs = ["puls 1/2", "puls 2/2", "kopf", ...VOLL_PFLICHT].map((n) => job(n, "success"));
        const cc = (id, conclusion, jobs = gruenJobs) => ({ id, name: "Code-Check", event: "push", status: "completed", conclusion, jobs });
        const gp = (id, conclusion) => ({ id, name: `GPU-Probe x ${v}`, event: "push", status: "completed", conclusion });
        const urteil = (kopf, laeufe) => erbeUrteil({ ...erbeKette(kopf, lies), laeufe: new Map(laeufe) });
        const probe = (u) => (u.zeilen.find((l) => /GPU-Probe/.test(l)) || "").includes("completed success");
        const code = (u) => (u.zeilen.find((l) => /Code-Check:/.test(l)) || "").includes("completed success");
        const bereit = (u) => u.wort === "GRUEN" && code(u) && probe(u);
        const gruen = [[v, [cc(11, "success"), gp(21, "success")]]];
        // (1) der Baum weicht um EIN Byte ab → erbt nicht (der alte Weg über den eigenen SHA)
        const u1 = urteil(s1, gruen);
        pr(`Erbe (1) Baum um ein Byte anders → ERBE KEINS (${u1.grund})`, u1.wort === "KEINS" && /trägt Inhalt/.test(u1.grund) && !bereit(u1));
        // (2) die Batterie des Elters abgebrochen (jüngster Lauf cancelled über einem älteren grünen) → nicht bereit, beim Namen
        const u2 = urteil(s, [[v, [cc(12, "cancelled", gruenJobs.map((j) => ({ ...j, conclusion: "cancelled" }))), cc(11, "success"), gp(21, "success")]]]);
        pr(`Erbe (2) Batterie des Elters abgebrochen → WARTET (${u2.grund})`, u2.wort === "WARTET" && /Lauf 12\) ist abgebrochen — abgebrochen ist kein Urteil/.test(u2.grund) && !bereit(u2));
        // (3) die Probe des Elters rot → die GPU-Probe-Zeile trägt failure, bereit() wartet
        const u3 = urteil(s, [[v, [cc(11, "success"), gp(22, "failure")]]]);
        pr(`Erbe (3) Probe des Elters rot → nicht bereit (${u3.zeilen.find((l) => /GPU-Probe/.test(l))})`, code(u3) && !probe(u3) && !bereit(u3));
        // (4) der Elter grün → bereit im selben Takt, ohne einen Lauf am Stempel
        const u4 = urteil(s, gruen);
        pr(`Erbe (4) Elter grün → ERBE GRÜN ohne Lauf am Stempel (${u4.grund})`, bereit(u4) && u4.von === v && u4.zeilen.includes(`    voll: 18/18`));
        // der Neu-Stempel über dem Stempel (Täter-Suche: leerer Commit auf den alten Stempel) erbt durch ihn hindurch vom Vorprüf-Kopf
        const u5 = urteil(s2, gruen);
        pr(`Erbe Neu-Stempel S2 → S → V erbt vom Vorprüf-Kopf (${u5.grund})`, bereit(u5) && u5.von === v);
        // ein Elter ohne volle Batterie (der Puls grün, [ci voll] fehlte) → wartet beim Namen
        const u6 = urteil(s, [[v, [cc(11, "success", gruenJobs.filter((j) => !/^voll/.test(j.name))), gp(21, "success")]]]);
        pr(`Erbe Elter ohne volle Batterie → WARTET (${u6.grund})`, u6.wort === "WARTET" && /trägt \[ci voll\] nicht/.test(u6.grund));
        // DER MUTANT: das alte Gesetz — der Stempel urteilt an seinen EIGENEN Läufen; am Stempel startet keiner mehr → nie bereit
        const alt = erbeUrteil({ kopf: lies(s), kette: [lies(s)], kein: null, laeufe: new Map(gruen) });
        pr("Erbe: der Mutant „Läufe am Stempel-Kopf“ wartet am grünen Elter für immer", !bereit(alt));
    } finally {
        fs.rmSync(d, { recursive: true, force: true });
    }
}
// selbsttest --vorab — DER ECHTE FALL z631 (20.11.) in einem Temp-Worktree des Repos (ZUG_PROBE_REPO, sonst INTEG; node_modules als
// Junction): (a) main 3da9d9ae + w28-ein-schreiber-wand 8ea58de7 + kern-sprossen-heil-2 + los-huelle-2 + stein-ein-gesetz → die
// Vorab-Statik nennt die Wand als Täter (nachweis: VORAB), die drei übrigen bilden den Kandidaten, und der ist grün; (b) dieselben drei
// ohne die Wand: grün, alle fahren; (c) die Mutante „ohne Vorab-Schritt“ (der alte Bau: alle vier gemergt, gepusht) — der Kandidat
// ist rot an check:vorab, die Probe fängt ihn. Der Bau läuft im Kind mit ZUG_WT (nie im Worktree des Dienstes).
// main 3da9d9ae trug check:vorab noch nicht (der Bau WÜRFE dort laut: „Vorab-Statik kann nicht laufen“) — die Probe-Basis ist main
// 3da9d9ae + der Commit, der check:vorab einführte (zug-vorab-statik 192da910), per merge-tree, ohne Arbeitsbaum
const Z631 = {
    main: "3da9d9ae96",
    vorab: "192da91013421a900b9ec50da62baf14c008e839",
    wand: "w28-ein-schreiber-wand@8ea58de7",
    rest: ["w28-kern-sprossen-heil-2@3aff015f", "w28-los-huelle-2@f1de681c", "w28-stein-ein-gesetz@6429df6d"],
};
function selbsttestVorab(pr) {
    const repo = process.env.ZUG_PROBE_REPO || INTEG;
    const da = (s) => git(["cat-file", "-e", `${s}^{commit}`], repo, true).status === 0;
    const voll = (k) => {
        const [z, s] = k.split("@");
        if (!da(s)) git(["fetch", "-q", "origin", `refs/archiv/2026-11-20/${z}`, z], repo, true);
        return `${z}@${git(["rev-parse", s], repo)}`;
    };
    if (!da(Z631.vorab)) git(["fetch", "-q", "origin", "main", "zug-vorab-statik"], repo, true);
    const m0 = git(["rev-parse", Z631.main], repo);
    const mt = git(["merge-tree", "--write-tree", `--merge-base=${Z631.vorab}^`, m0, Z631.vorab], repo).split("\n")[0];
    const main = git(["commit-tree", mt, "-p", m0, "-m", "Probe-Basis: main 3da9d9ae + check:vorab"], repo);
    const wand = voll(Z631.wand);
    const rest = Z631.rest.map(voll);
    if (!fs.existsSync(path.join(repo, "node_modules"))) throw new Error(`selbsttest --vorab: ${repo} trägt kein node_modules`);
    const d = fs.mkdtempSync(path.join(os.tmpdir(), "zug-vorab-"));
    const wt = path.join(d, "wt");
    git(["worktree", "add", "-q", "--detach", wt, main], repo);
    fs.symlinkSync(path.join(repo, "node_modules"), path.join(wt, "node_modules"), "junction");
    const kind = (args) => {
        const t0 = Date.now();
        const r = spawnSync(process.execPath, [__filename, ...args], { encoding: "utf8", maxBuffer: 1 << 26, env: { ...process.env, ZUG_WT: wt } });
        return { out: (r.stdout || "") + (r.stderr || ""), rc: r.status, s: ((Date.now() - t0) / 1000).toFixed(1) };
    };
    const kandidat = (out) => ((/^VORAB KANDIDAT (.*)$/m.exec(out) || [])[1] || "").split(" ").filter((x) => x && x !== "keiner");
    const name = (k) => k.split("@")[0];
    const zeigen = (out, re) => out.trim().split("\n").filter((l) => re.test(l)).map((l) => l.slice(0, 240)).join("\n      ") || out.trim().split("\n").pop();
    try {
        const a = kind(["vorab", "--basis", main, wand, ...rest]);
        const fallA = new Map(a.out.split("\n").filter((l) => VORAB_RE.test(l)).map((l) => [/^gefallen (\S+?)@/.exec(l)[1], VORAB_RE.exec(l)[1]]));
        const ua = nachweisUrteil({ zweige: [wand, ...rest], inMain: new Set(), drin: new Set(kandidat(a.out).map(name)), gelandet: false, gefallen: new Set(fallA.keys()), vorab: fallA });
        const kA = kandidat(a.out).map(name).sort().join(" ");
        console.log(`  (a) ${a.s} s: ${zeigen(a.out, /VORAB/)}`);
        pr("Vorab (a) z631: die Wand ist der Täter, die drei übrigen bilden den grünen Kandidaten, nachweis sagt VORAB (nie FREI)",
            a.rc === 0 && kA === rest.map(name).sort().join(" ") && /Ein-Schreiber|REGISTER-ZEILE/.test(a.out) && ua.map((u) => `${u.zweig}:${u.wort}`).join(" ") === `${name(wand)}:VORAB ${rest.map((r) => `${name(r)}:GEURTEILT`).join(" ")}`);
        const b = kind(["vorab", "--basis", main, ...rest]);
        console.log(`  (b) ${b.s} s: ${zeigen(b.out, /^VORAB/)}`);
        pr("Vorab (b) die drei ohne die Wand: grün, alle fahren", b.rc === 0 && /^VORAB-STATIK GRÜN/m.test(b.out) && kandidat(b.out).length === 3);
        // (c) die Mutante: der alte Bau ohne den Vorab-Schritt — derselbe Bau-Weg, das Urteil der Batterie am Kandidaten, der gepusht würde
        const c = spawnSync(process.execPath, ["-e", `const z=require(${JSON.stringify(__filename)});const g=z.mergeAlle(${JSON.stringify(main)},${JSON.stringify([wand, ...rest])});const v=z.vorabLauf();console.log("MUTANTE drin="+g.drin.length+" "+(v.gruen?"GRÜN":"ROT "+v.rot[0]))`], { encoding: "utf8", maxBuffer: 1 << 26, env: { ...process.env, ZUG_WT: wt } });
        const co = (c.stdout || "") + (c.stderr || "");
        console.log(`  (c) ${co.trim().split("\n").pop().slice(0, 200)}`);
        // die Probe-Regel: was gepusht würde, ist an check:vorab grün. Die Mutante bricht sie → GEFANGEN (sonst ist die Probe blind)
        pr("Vorab (c) Mutante ohne Vorab-Schritt: der rote Kandidat (alle vier) führe durch — GEFANGEN", /^MUTANTE drin=4 ROT /m.test(co));
        // (d) kein fail-soft: trägt der Kandidat kein check:vorab (main 3da9d9ae selbst), wirft der Bau laut — nie ein stilles Überspringen
        const dd = kind(["vorab", "--basis", m0, rest[0]]);
        console.log(`  (d) ${dd.s} s: ${dd.out.trim().split("\n").pop().slice(0, 200)}`);
        pr("Vorab (d) ohne check:vorab im Kandidaten: lauter Fehler der Maschine", dd.rc === 2 && /^zug vorab FEHLER: Vorab-Statik kann nicht laufen/m.test(dd.out));
    } finally {
        git(["worktree", "remove", "--force", wt], repo, true);
        fs.rmSync(d, { recursive: true, force: true });
    }
}
// die Täter-Suche an den echt-Wänden, gestellt wie z637: der Job echt aus einem check.yml-Text, drei Stempel, zwei rote Wände; ersetzt
// ist nur der Lauf an der Karte (lauf), das Urteil ist dasselbe taeterUrteil, das der Dienst fährt
function selbsttestTaeter(pr) {
    const S0 = "Pruefbuehne S0 auf der Karte (der Feuerkreis aus 2 m traegt Luma >= 0,15 in der Ausgabe)";
    const FR = "Frost-Wand auf der Karte (das Weltbild folgt der Kamera vom Ankommen bis zur Hof-Bühne, nie der Ladeschirm)";
    const yml = [
        "jobs:",
        "    echt:",
        "        env:",
        "            CI_KLASSE: gpu",
        "            LINSE_GPU: karte",
        "            TOR_KLASSE: bruch",
        "        steps:",
        "            - name: Dependencies installieren",
        "              run: npm ci --no-audit --no-fund",
        `            - name: ${S0}`,
        "              run: npm run gate:pruefbuehne-licht",
        `            - name: ${FR}`,
        "              timeout-minutes: 25",
        "              run: npm run gate:weltbild-frost:echt",
    ].join("\n");
    const waende = echtBefehle(yml, [S0, FR]);
    pr("Täter-Suche: der rote Schritt-Name findet seinen Befehl und die Umgebung des Jobs echt in check.yml",
        waende.map((w) => `${w.kurz}=${w.run}`).join("|") === "Pruefbuehne S0=npm run gate:pruefbuehne-licht|Frost-Wand=npm run gate:weltbild-frost:echt" &&
            waende.every((w) => w.env.CI_KLASSE === "gpu" && w.env.LINSE_GPU === "karte" && w.env.TOR_KLASSE === "bruch"));
    const tag = "[gpu-probe: gate:post-kette, bild:wiese@0.5] [ci voll]";
    const stempel = [
        { spec: "w28-einheit-sicht-2@292a20d5", betreff: "Abgabe w28-einheit-sicht-2: E9 + S5 [gpu-probe: gate:sicht-arbeit] [ci voll]" },
        { spec: "w28-laub-kante-4@f578d89c", betreff: `Abgabe w28-laub-kante-4: der Waldmantel trägt tiefe Kronen-Ansätze ${tag}` },
        { spec: "w28-saison-am-laub@fe837c5c", betreff: "Abgabe w28-saison-am-laub: jede Pflanzen-Klasse liest das Jahr [gpu-probe: bild:wiese@0.5] [ci voll]" },
    ];
    // die Basis ohne Stempel (spec null, die Basis-Probe) ist in den gestellten Fällen grün, wo der Fall sie nicht selbst stellt
    const gestellt = (rotAn) => (spec, w) => (spec && rotAn(spec, w) ? { rot: true, zeile: `❌ ${w.kurz} gestellt` } : { rot: false });
    // laub-kante-4 fasst stamm/dirigent-ankunft.js an (Bau-Pfad): seinem Tag fehlen die Pflicht-Wände; saison-am-laub gestellt ohne Lücke
    const pflicht = (st) => (st.spec.startsWith("w28-laub-kante-4@") ? probeTagLuecke(["stamm/dirigent-ankunft.js"], st.betreff).fehlt : []);
    const a = taeterUrteil({ zid: "z637", stempel, waende, geraete: ["omen"], pflicht, lauf: gestellt((s) => s.startsWith("w28-einheit-sicht-2@")) });
    const neuL = a.neu.find((n) => n.spec.startsWith("w28-laub-kante-4@"));
    const neuS = a.neu.find((n) => n.spec.startsWith("w28-saison-am-laub@"));
    pr("Täter-Suche (a) einer allein rot an zwei Wänden → 1 TÄTER, 2 UNSCHULDIG, zwei neue Köpfe",
        a.zeilen.length === 3 && /^TÄTER w28-einheit-sicht-2: Pruefbuehne S0 ROT allein \(❌ Pruefbuehne S0 gestellt\) · Frost-Wand ROT allein/.test(a.zeilen[0]) &&
            a.zeilen.slice(1).every((z) => /^UNSCHULDIG w28-\S+: 2 von 2 roten Wänden allein GRÜN$/.test(z)) &&
            a.neu.map((n) => n.spec.split("@")[0]).join(" ") === "w28-laub-kante-4 w28-saison-am-laub");
    pr("Täter-Suche (a) der neue Betreff: beginnt mit „Abgabe <zweig>: “, dann der Vorsatz; ohne Lücke das Tag unverändert, am Bau-Pfad die zwei Pflicht-Wände + EINE alte Probe (das bild: zuerst) — 3 Proben, durch den Einlass",
        neuS && neuS.betreff === "Abgabe w28-saison-am-laub: neuer Kopf nach rotem z637 (allein an der Radeon grün: Pruefbuehne S0, Frost-Wand) — jede Pflanzen-Klasse liest das Jahr [gpu-probe: bild:wiese@0.5] [ci voll]" &&
            neuL && neuL.betreff === "Abgabe w28-laub-kante-4: neuer Kopf nach rotem z637 (allein an der Radeon grün: Pruefbuehne S0, Frost-Wand) — der Waldmantel trägt tiefe Kronen-Ansätze [gpu-probe: bild:wiese@0.5, gate:pruefbuehne-licht, gate:weltbild-frost:echt] [ci voll]" &&
            probeTagFehlt(["stamm/dirigent-ankunft.js"], neuL.betreff) === null && probeTagEinlass(neuL.betreff) === null &&
            tagErgaenzt("Abgabe w28-a: x [gpu-probe: gate:a, gate:b] [ci voll]", ["gate:pruefbuehne-licht"]) === "Abgabe w28-a: x [gpu-probe: gate:a, gate:pruefbuehne-licht, gate:weltbild-frost:echt] [ci voll]" &&
            tagErgaenzt("Abgabe w28-a: x [ci voll]", ["gate:pruefbuehne-licht"]) === "Abgabe w28-a: x [gpu-probe: gate:pruefbuehne-licht, gate:weltbild-frost:echt] [ci voll]");
    // die Mutante: das alte Anhängen (fünf Proben) — die Einlass-Wache nennt sie ROT beim Namen; die vier Pflicht-Wände eines
    // Wurzel-Schnitts (Bau + Haus + Licht) gehen in EINEM Tag durch und lassen keine Lücke
    const vier = "Abgabe w28-l: x [gpu-probe: gate:pruefbuehne-licht, gate:weltbild-frost:echt, gate:studio-begehen, gate:tag-achse:echt] [ci voll]";
    pr("Einlass: ein Tag mit fünf Proben ist ROT beim Namen (die Mutante „anhängen“), die vier Pflicht-Wände gehen in EINEM Tag durch (Bau + Haus + Licht ohne Lücke), drei und keins ebenso",
        /^5 Proben im \[gpu-probe: …\]-Tag, höchstens 4 je Push/.test(probeTagEinlass("Abgabe w28-l: x [gpu-probe: gate:post-kette, bild:wiese@0.5, gate:pruefbuehne-licht, gate:weltbild-frost:echt, gate:studio-begehen] [ci voll]") || "") &&
            probeTagEinlass(vier) === null && probeTagFehlt(["stamm/siedlung-ort.js", "samen-core.js", "stamm/bild-himmel.js"], vier) === null &&
            /^Probe-Tag ohne .*gate:tag-achse:echt.* \(Beitrag fasst /.test(probeTagFehlt(["stamm/siedlung-ort.js", "samen-core.js", "stamm/bild-himmel.js"], "Abgabe w28-l: x [gpu-probe: gate:pruefbuehne-licht, gate:weltbild-frost:echt, gate:studio-begehen] [ci voll]") || "") &&
            probeTagEinlass("Abgabe w28-l: x [gpu-probe: gate:a, bild:wiese, gate:b] [ci voll]") === null && probeTagEinlass("Abgabe w28-l: x [ci voll]") === null);
    // der gepflanzte Täter: ein WIP-Betreff mit dem Sach-Wort (z742); der saubere Verlauf und das Wort als Teil eines längeren Worts gehen durch
    pr("Siegel im Verlauf: probe-tag nennt den Commit beim Namen (WIP-Betreff mit dem Wort der Wand als Sach-Wort → ROT), ein sauberer Verlauf und das Wort im Kompositum gehen durch, das Großbuchstaben-Siegel nur groß",
        /^Siegel-Wort „Schluss" im Commit 73fef2f082 WIP tages-gesetz: /.test(siegelImVerlauf("347bdb6552 Vorprüfung tages-gesetz 4: x\0Vorprüfung tages-gesetz 4: x\n\x01\n73fef2f082 WIP tages-gesetz: dauerH 0,5 bis zum Schluss 11 Uhr [skip ci]\0WIP tages-gesetz: dauerH 0,5 bis zum Schluss 11 Uhr [skip ci]\n\x01\n") || "") &&
            siegelImVerlauf("aaaaaaaaaa WIP x: die Ladenschlusszeit 11 Uhr, rund 20 im Einkauf\0WIP x: die Ladenschlusszeit 11 Uhr, rund 20 im Einkauf\n\x01\n") === null &&
            /^Siegel-Wort „RUND" /.test(siegelImVerlauf("bbbbbbbbbb WIP y: alles RUND\0WIP y: alles RUND\n\x01\n") || "") && siegelImVerlauf("") === null);
    const b = taeterUrteil({ zid: "z637", stempel, waende, geraete: ["omen"], lauf: gestellt(() => false) });
    pr("Täter-Suche (b) kein Stempel allein rot → KEIN TÄTER AN DIESER KARTE (das rote Bein omen beim Namen), kein neuer Kopf",
        !b.neu.length && b.zeilen.filter((z) => /^UNSCHULDIG /.test(z)).length === 3 && b.zeilen[3] === "KEIN TÄTER AN DIESER KARTE (radeon): kein Stempel allein rot — Kombination oder Gerät (rot fiel am Bein omen), nichts gestempelt");
    let n = 0;
    const c = taeterUrteil({ zid: "z637", stempel, waende, lauf: (spec, w) => (++n === 3 ? { abbruch: "GPU-Schloss blockiert (SCHLOSS BLOCKIERT von ci-runner)" } : gestellt((s) => s.startsWith("w28-einheit"))(spec, w)) });
    let cy = "";
    try { echtBefehle(yml, [S0, "Kamera-Treue auf der Karte (verschwunden)"]); } catch (e) { cy = e.message; } // prettier-ignore
    let cw = "";
    try { echtBefehle(yml, ["Dependencies installieren"]); } catch (e) { cw = e.message; } // prettier-ignore
    const cd = taeterUrteil({ zid: "z9", stempel: [...stempel, ...stempel], waende, lauf: () => ({ rot: false }) });
    pr("Täter-Suche (c) abgebrochen: Schloss blockiert mitten in der Suche · Befehl fehlt in check.yml · Schritt ohne Wand · Deckel — nie ein neuer Kopf",
        c.zeilen.length === 1 && /^TÄTER-SUCHE ABGEBROCHEN: laub-kante-4 an Pruefbuehne S0: GPU-Schloss blockiert/.test(c.zeilen[0]) && !c.neu.length &&
            /^Befehl nicht in check\.yml gefunden: „Kamera-Treue/.test(cy) && /keine Wand/.test(cw) &&
            /^TÄTER-SUCHE ABGEBROCHEN: Deckel 4 Stempel × 3 Wände, der Zug trägt 6 × 2$/.test(cd.zeilen[0]) && !cd.neu.length);
    const d = taeterUrteil({ zid: "z637", stempel, waende, statik: new Set(["w28-saison-am-laub"]), lauf: gestellt((s) => s.startsWith("w28-einheit")) });
    let uhr = 0;
    const ff = taeterUrteil({ zid: "z637", stempel, waende, bis: 2, jetzt: () => uhr, lauf: (spec, w) => (uhr++, gestellt((s) => s.startsWith("w28-einheit"))(spec, w)) });
    pr("Täter-Suche Frist: nach 90 min über alles bricht die Suche ab, auch wenn schon ein Täter rot fiel — nichts gestempelt",
        ff.zeilen.length === 1 && /^TÄTER-SUCHE ABGEBROCHEN: Frist 90 min über alles verstrichen \(vor laub-kante-4 an Frost-Wand\)/.test(ff.zeilen[0]) && !ff.neu.length);
    pr("Täter-Suche (d)ein Unschuldiger, der an der Vorab-Statik fiel, bekommt keinen neuen Kopf",
        d.neu.map((x) => x.spec.split("@")[0]).join() === "w28-laub-kante-4" && /UNSCHULDIG w28-saison-am-laub: .* doch Täter der Vorab-Statik/.test(d.zeilen.join("\n")));
    // DREI AUSGÄNGE JE FAHRT, an den echten Zeilen des ersten Beweis-Laufs z637 und der Hand-Messung (frost-ks.out, Lauf 44686031159)
    const leser = rotLeser();
    const fu = (st, z) => fahrtUrteil(st, z.join("\n"), leser);
    const eaddr = fu(1, ["gpu-lauf: Schloss taeter-z637-laub-kante-4 nach 3 s", "node:events:497", "      throw er; // Unhandled 'error' event", "Error: listen EADDRINUSE: address already in use 127.0.0.1:4394", "    at Server.setupListenHandle [as _listen2] (node:net:1908:16)", "    at listenInCluster (node:net:1965:12)"]);
    const eaddrX = fu(1, ["Error: listen EADDRINUSE: address already in use 127.0.0.1:4394", "    at Server.setupListenHandle (node:net:1908:16)", "❌ ROT — die Bühne bootet nicht"]);
    const s0 = fu(1, ['⛔ S0 BILD ROT · Nacht {"luma":21.4,"schwarz":0} (33 s, amd/rdna-3 · Holz kienspan)']);
    const tf = fu(1, ["  ✅ S1 Selbsttest: leere Bühne und Block-Zwilling sind ROT", "  ❌ T1 die Index-Wache nennt den Index über der Vertex-Zahl beim Namen", "❌ ROT — 1 Verletzung(en): T1 die Index-Wache nennt den Index über der Vertex-Zahl beim Namen"]);
    const sturz = fu(2, ["diag-weltbild-frost.cjs ABSTURZ: Error: DER BAU STEHT NICHT: das erste Weltbild nach 1375 Takten — die Welt hat nichts mehr offen"]);
    pr("Fahrt: GRÜN bei Exit 0 · ROT nur mit ⛔/❌-Urteil der Wand · EADDRINUSE (auch neben einer ❌), Absturz ohne Urteil, Deckel und Schloss sind OHNE URTEIL",
        fu(0, ["x"]).wort === "GRÜN" && eaddr.wort === "OHNE" && /EADDRINUSE/.test(eaddr.grund) && eaddrX.wort === "OHNE" &&
            s0.wort === "ROT" && /luma":21\.4/.test(s0.zeile) && tf.wort === "ROT" && /^❌ T1 die Index-Wache/.test(tf.zeile) &&
            sturz.wort === "OHNE" && fu(124, ["…"]).wort === "OHNE" && fu(75, ["SCHLOSS BLOCKIERT von ci-runner"]).wort === "OHNE");
    const e = taeterUrteil({ zid: "z637", stempel, waende, geraete: ["omen"],
        lauf: (spec, w) => (!spec ? { rot: false } : spec.startsWith("w28-einheit") && w.kurz === "Pruefbuehne S0" ? { rot: true, zeile: s0.zeile } : spec.startsWith("w28-laub") && w.kurz === "Pruefbuehne S0" ? { ohne: `${eaddr.grund} — 3 Fahrten` } : { rot: false }) }); // prettier-ignore
    pr("Täter-Suche (e) eine Fahrt, die mit EADDRINUSE endet, wird nie Täter: der Stempel steht OHNE URTEIL, ohne neuen Kopf; einheit-sicht-2 ist der eine Täter",
        e.zeilen.filter((z) => /^TÄTER /.test(z)).length === 1 && /^TÄTER w28-einheit-sicht-2: Pruefbuehne S0 ROT allein .* · 1 von 2 allein GRÜN$/.test(e.zeilen[0]) &&
            /^OHNE URTEIL w28-laub-kante-4: Pruefbuehne S0 ohne Urteil \(Absturz der Fahrt.*EADDRINUSE.*\) · 1 von 2 allein GRÜN — weder Täter noch neuer Kopf$/.test(e.zeilen[1]) &&
            e.neu.map((x) => x.spec.split("@")[0]).join() === "w28-saison-am-laub");
    // DIE BASIS-PROBE am echten Fall z652 (21.11.): die Herde allein rot an der Regen-Probe, main 9f24b5b8 ohne Stempel ebenso
    const regen = { kurz: "Wasser-Bild", run: "npm run gate:wasser-leben:bild", env: {} };
    const herde = [{ spec: "w28-herde-gesetz@456b865c", betreff: "Abgabe w28-herde-gesetz: die Herde folgt dem Gesetz [gpu-probe: gate:kreatur-leben] [ci voll]" }];
    const b4 = '❌ B4 REGEN: {"litAnteil":0,"schlieren":0,"neigung":0,"lage":{"uhr":0.5,"uLicht":[0,0,0]}}';
    const b4Basis = '❌ B4 REGEN: {"fehler":"die Bestrahlungs-Tafel des Sturms kam nicht zurück (der Lichtmesser liest nichts)"}';
    let basisFahrten = 0;
    const f = taeterUrteil({ zid: "z652", stempel: herde, waende: [regen], geraete: ["omen"], basis: "9f24b5b8a72d910481281c6f46ecd3da9010b080",
        lauf: (spec) => (spec ? { rot: true, zeile: b4 } : (basisFahrten++, { rot: true, zeile: b4Basis })) }); // prettier-ignore
    pr("Täter-Suche (f) BASIS-PROBE am Fall z652: die Wand fällt auch ohne jeden Stempel → kein TÄTER, UNSCHULDIG „ROT auch an der Basis“, die Basis beim Namen, EINE Basis-Fahrt, kein neuer Kopf",
        !f.zeilen.some((z) => /^TÄTER /.test(z)) && basisFahrten === 1 && !f.neu.length &&
            f.zeilen[0] === "UNSCHULDIG w28-herde-gesetz: Wasser-Bild ROT auch an der Basis — kein neuer Kopf, solange die Basis rot ist" &&
            f.zeilen[1] === `KEIN TÄTER AN DIESER KARTE (radeon): BASIS ROT 9f24b5b8 — Wasser-Bild fällt ohne jeden Stempel (${b4Basis}); sie fällt mit jedem Zug, bis main oder die Wand geheilt ist, nichts gestempelt`);
    // die Gegenprobe: dieselbe rote Wand an grüner Basis bleibt ein Täter (das Urteil vor dem Schnitt, hier zu Recht)
    const fg = taeterUrteil({ zid: "z652", stempel: herde, waende: [regen], geraete: ["omen"], lauf: (spec) => (spec ? { rot: true, zeile: b4 } : { rot: false }) });
    pr("Täter-Suche (f) Gegenprobe: an grüner Basis bleibt der Stempel der TÄTER mit der Zeile der Wand",
        fg.zeilen.length === 1 && fg.zeilen[0] === `TÄTER w28-herde-gesetz: Wasser-Bild ROT allein (${b4})` && !fg.neu.length);
    // gemischt: einheit-sicht-2 allein rot an S0 (Basis dort grün), die Frost-Wand rot an jedem Stempel UND an der Basis
    const g = taeterUrteil({ zid: "z637", stempel, waende, geraete: ["omen"],
        lauf: (spec, w) => (w.kurz === "Frost-Wand" ? { rot: true, zeile: "❌ Frost gestellt" } : spec && spec.startsWith("w28-einheit") ? { rot: true, zeile: s0.zeile } : { rot: false }) }); // prettier-ignore
    pr("Täter-Suche (g) gemischt: der Täter an der eigenen Wand steht, die Basis-rote Wand zählt bei keinem als Tat, und kein Unschuldiger bekommt einen neuen Kopf, solange die Basis rot ist",
        g.zeilen.length === 3 && /^TÄTER w28-einheit-sicht-2: Pruefbuehne S0 ROT allein \(⛔ S0 BILD ROT.*\) · Frost-Wand ROT auch an der Basis$/.test(g.zeilen[0]) &&
            g.zeilen.slice(1).every((z) => /^UNSCHULDIG w28-\S+: Frost-Wand ROT auch an der Basis · 1 von 2 allein GRÜN — kein neuer Kopf, solange die Basis rot ist$/.test(z)) && !g.neu.length);
    // die Basis ohne Urteil nimmt dem Stempel die Tat nicht, sie steht als Vermerk; ein Abbruch an der Basis bricht die Suche ab
    const h = taeterUrteil({ zid: "z652", stempel: herde, waende: [regen], lauf: (spec) => (spec ? { rot: true, zeile: b4 } : { ohne: "Deckel 600 s — 3 Fahrten" }) });
    const ha = taeterUrteil({ zid: "z652", stempel: herde, waende: [regen], lauf: (spec) => (spec ? { rot: true, zeile: b4 } : { abbruch: "GPU-Schloss blockiert" }) });
    pr("Täter-Suche (h) die Basis ohne Urteil steht als Vermerk am Täter · ein Abbruch an der Basis bricht die Suche ab, nichts gestempelt",
        h.zeilen[0] === `TÄTER w28-herde-gesetz: Wasser-Bild ROT allein (${b4}) · die Basis dort ohne Urteil` &&
            ha.zeilen.length === 1 && ha.zeilen[0] === "TÄTER-SUCHE ABGEBROCHEN: die Basis an Wasser-Bild: GPU-Schloss blockiert" && !ha.neu.length);
    // der Port je Fahrt aus der Quelle der Linse (npm run → package.json → scripts/… → process.env.<…PORT>)
    const pd = fs.mkdtempSync(path.join(os.tmpdir(), "zug-port-"));
    try {
        fs.mkdirSync(path.join(pd, "scripts"));
        fs.writeFileSync(path.join(pd, "package.json"), JSON.stringify({ scripts: { "gate:pruefbuehne-licht": "node scripts/diag-pruefbuehne.cjs --licht --selftest", "gate:frost": "node scripts/diag-frost.cjs" } }));
        fs.writeFileSync(path.join(pd, "scripts", "diag-pruefbuehne.cjs"), "const PORT = Number(process.env.PRUEFBUEHNE_PORT) || 4394;\n");
        fs.writeFileSync(path.join(pd, "scripts", "diag-frost.cjs"), "await server.lausche(0);\n");
        const p1 = portUmgebung(pd, "npm run gate:pruefbuehne-licht");
        pr("Port je Fahrt: PRUEFBUEHNE_PORT aus der Quelle der Linse, frei und ≠ 4394; eine Linse mit Port 0 bekommt nichts",
            Object.keys(p1).join() === "PRUEFBUEHNE_PORT" && Number(p1.PRUEFBUEHNE_PORT) > 0 && p1.PRUEFBUEHNE_PORT !== "4394" && !Object.keys(portUmgebung(pd, "npm run gate:frost")).length);
    } finally {
        fs.rmSync(pd, { recursive: true, force: true });
    }
    // das Probe-Tag am Bau-Pfad: Sicht, Tiefe, Siedlung, Ankunft fordern beide Wände im [gpu-probe: …]-Tag
    const t1 = probeTagFehlt(["scripts/x.cjs", "stamm/bild-sicht.js"], "Abgabe w28-a: x [gpu-probe: gate:pruefbuehne-licht, bild:genesis@0.5] [ci voll]");
    const t2 = probeTagFehlt(["stamm/siedlung-ort.js"], "Abgabe w28-a: x [ci voll]");
    pr("Probe-Tag am Bau-Pfad: fehlt eine Wand oder das ganze Tag, steht der Grund beim Namen; mit beiden Wänden oder ohne Bau-Pfad nichts",
        t1 === "Probe-Tag ohne gate:weltbild-frost:echt (Beitrag fasst stamm/bild-sicht.js an)" &&
            t2 === "Probe-Tag ohne gate:pruefbuehne-licht, gate:weltbild-frost:echt und gate:studio-begehen (Beitrag fasst stamm/siedlung-ort.js an)" &&
            probeTagFehlt(["stamm/dirigent-ankunft.js"], "Abgabe w28-a: x [gpu-probe: gate:weltbild-frost:echt, gate:pruefbuehne-licht] [ci voll]") === null &&
            probeTagFehlt(["stamm/bild-tiefe-alt.js", "stamm/gelaende.js", "scripts/siedlung-x.cjs"], "Abgabe w28-a: x [ci voll]") === null &&
            probeTagFehlt(["stamm/bild-tiefe.js"], "Abgabe w28-a: x [gpu-probe: gate:pruefbuehne-licht:echt] [ci voll]") !== null);
    // die Wände, die nur am Kandidaten fahren, je Regel am echten Fall: Samen (z648) riss das Begehen, die Nacht-Lichter (z647) die Tag-Achse
    const samen = ["samen-core.js", "fachwerk-core.js", "stamm/siedlung-ort.js"];
    const nacht = ["fachwerk-core.js", "stamm/bild-himmel.js", "stamm/bild-schatten.js", "welt-licht.js"];
    const t3 = probeTagFehlt(samen, "Abgabe w28-samen-ein-baum: x [gpu-probe: gate:pruefbuehne-licht, gate:weltbild-frost:echt, gate:settlement] [ci voll]");
    const t4 = probeTagFehlt(nacht, "Abgabe w28-nacht-lichter: x [gpu-probe: gate:pruefbuehne-licht, gate:weltbild-frost:echt, gate:pruefbuehne] [ci voll]");
    const t5 = probeTagFehlt(["stamm/siedlung-tor.js", "welt-licht.js"], "Abgabe w28-a: x [gpu-probe: gate:tag-achse:echt] [ci voll]");
    pr("Probe-Tag je Regel: der Samen-Stempel von z648 wartet am Begehen, der Nacht-Stempel von z647 an Begehen und Tag-Achse; mit den Wänden nichts; vier Pflicht-Wände trägt der Einlass (der Grund nennt die Lücke, kein Teilen)",
        t3 === "Probe-Tag ohne gate:studio-begehen (Beitrag fasst samen-core.js an)" &&
            t4 === "Probe-Tag ohne gate:studio-begehen und gate:tag-achse:echt (Beitrag fasst fachwerk-core.js an)" &&
            probeTagFehlt(samen, "Abgabe w28-a: x [gpu-probe: gate:studio-begehen, gate:pruefbuehne-licht, gate:weltbild-frost:echt] [ci voll]") === null &&
            probeTagFehlt(nacht, "Abgabe w28-a: x [gpu-probe: gate:tag-achse:echt, gate:studio-begehen, gate:pruefbuehne-licht] [ci voll]") === null &&
            probeTagFehlt(["stamm/bild-schatten.js", "scripts/lib/licht-linsen.cjs"], "Abgabe w28-a: x [ci voll]") === null &&
            t5 === "Probe-Tag ohne gate:pruefbuehne-licht, gate:weltbild-frost:echt und gate:studio-begehen (Beitrag fasst stamm/siedlung-tor.js an)");
    pr("Neuer Kopf je Regel: fehlt das Begehen, bleiben die Bau-Wände des alten Tags und das bild: (drei Pflicht-Wände + das bild: = 4); erst am vollen Einlass (alle vier Pflicht-Wände) fällt das bild:; fehlt nur die Tag-Achse, bleibt das bild:",
        tagErgaenzt("Abgabe w28-a: x [gpu-probe: bild:dorf@0.5, gate:pruefbuehne-licht, gate:weltbild-frost:echt] [ci voll]", ["gate:studio-begehen"]) === "Abgabe w28-a: x [gpu-probe: bild:dorf@0.5, gate:pruefbuehne-licht, gate:weltbild-frost:echt, gate:studio-begehen] [ci voll]" &&
            tagErgaenzt("Abgabe w28-a: x [gpu-probe: bild:dorf@0.5, gate:pruefbuehne-licht, gate:weltbild-frost:echt, gate:studio-begehen] [ci voll]", ["gate:tag-achse:echt"]) === "Abgabe w28-a: x [gpu-probe: gate:pruefbuehne-licht, gate:weltbild-frost:echt, gate:studio-begehen, gate:tag-achse:echt] [ci voll]" &&
            tagErgaenzt("Abgabe w28-a: x [gpu-probe: bild:genesis@0, gate:pruefbuehne] [ci voll]", ["gate:tag-achse:echt"]) === "Abgabe w28-a: x [gpu-probe: bild:genesis@0, gate:tag-achse:echt] [ci voll]");
}
// die roten Zeilen der Zeit-Tafel ((T) ALT · (T) UNGEMESSEN) aus der Ausgabe von diag-ci-deckung.cjs — nur sie, nie fremdes Rot
const zeitRest = (text) =>
    text
        .split("\n")
        .map((z) => z.trim())
        .filter((z) => /\(T\) (ALT|UNGEMESSEN)/.test(z) && !z.startsWith("✅"));
function selbsttest(args = []) {
    const fall = [];
    let faelle = 0;
    const pr = (n, ok) => (faelle++, ok || fall.push(n));
    if (args.includes("--vorab")) {
        selbsttestVorab(pr);
        console.log(fall.length ? `zug selbsttest --vorab ROT: ${fall.join(" · ")}` : `zug selbsttest --vorab grün (${faelle} Fälle)`);
        return fall.length ? 1 : 0;
    }
    pr(
        "Zeit-Tafel nach dem Auffrischen: (T) ALT und (T) UNGEMESSEN beim Namen, eine grüne Ausgabe und fremdes Rot bleiben still",
        zeitRest("  ❌ (T) UNGEMESSEN: Knicken nach Euler\n  ✅ (T) Zeit-Tafel\n  ❌ (D) fremd\n❌ (T) ALT: 9 Merges").join("|") === "❌ (T) UNGEMESSEN: Knicken nach Euler|❌ (T) ALT: 9 Merges" &&
            !zeitRest("  ✅ (T) Zeit-Tafel am Kopf\nGRÜN").length
    );
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
    // (i) die Import-Namen: eine Datei mit EINEM diff3-Stück (ours · Basis · theirs) zwischen Kopf und Rumpf
    const d3 = (kopf, o, b, t, rumpf) => [...kopf, "<<<<<<< HEAD", ...o, "||||||| basis", ...b, "=======", ...t, ">>>>>>> zweig", ...rumpf].join("\n");
    const M = (namen) => `const { ${namen} } = require("./m.cjs");`;
    const iFall = (n, text, soll) => {
        const r = loeseDatei("x.cjs", text);
        pr(n, soll === null ? !!r.fall : !r.fall && r.kl.i === 1 && r.text === soll.join("\n"));
    };
    iFall("i hinzu/hinzu → beide", d3([], [M("a, b, c")], [M("a, b")], [M("a, b, d")], ["a(b, c, d);"]), [M("a, b, c, d"), "a(b, c, d);"]);
    iFall("i hinzu/gestrichen, aber genutzt → bleibt", d3([], [M("a, b, c")], [M("a, b")], [M("a")], ["a(b, c);"]), [M("a, b, c"), "a(b, c);"]);
    iFall("i gestrichen/ungenutzt → fällt, hinzu bleibt", d3([], [M("a")], [M("a, b")], [M("a, b, d")], ["a(d);"]), [M("a, d"), "a(d);"]);
    // git schnitt mitten im mehrzeiligen Muster (diag-settlement 01.11.): die ganze Anweisung, Form wie ours
    iFall(
        "i mehrzeilig, Schnitt im Muster → ganze Anweisung",
        d3(["const {", "    a,"], ["    b,", "    c,"], ["    b, e,"], [], ["} = require(\"./m.cjs\");", "a(b, c);"]),
        ["const {", "    a,", "    b,", "    c,", '} = require("./m.cjs");', "a(b, c);"]
    );
    // ours zog `s` aus seinem eigenen require in das Muster (diag-ankunft 01.11.): s steht EINMAL, die alte Zeile fällt
    iFall(
        "i Name wechselt das Modul → EIN Ort",
        d3([], [M("a, s")], [M("a"), 'const s = require("./s.cjs");'], [M("a, r"), 'const s = require("./s.cjs");'], ["a(s, r);"]),
        [M("a, s, r"), "a(s, r);"]
    );
    // ours zog die Zeile nach oben (diag-ego-schatten 01.11.): die obere Anweisung nimmt den neuen Namen auf
    iFall("i Umzug nach oben → die obere Anweisung", d3([M("x, a"), "x();"], [], [M("a")], [M("a, w")], ["a(w);"]), [M("x, a, w"), "x();", "a(w);"]);
    iFall("i Code im Stück bleibt d", d3([], [M("a, c"), "c();"], [M("a")], [M("a, d"), "d();"], ["a();"]), null);
    iFall("i derselbe neue Name an zwei Modulen bleibt d", d3([], [M("a, z")], [M("a")], [M("a"), 'const { z } = require("./n.cjs");'], ["a(z);"]), null);
    selbsttestUrteil(pr);
    selbsttestErbe(pr);
    // die Landung je Zweig (z390): ein Zweig des Bündels fehlt im Kandidaten — die Mutante
    const nw = (o) => nachweisUrteil(o).map((u) => `${u.zweig}:${u.wort}`).join(" ");
    pr("Nachweis z390: ein Zweig des Bündels fehlt im Kandidaten → FREI, nie GELANDET",
        nw({ zweige: ["wald@a1", "ziel@b2"], inMain: new Set(["wald@a1"]), drin: new Set(["wald"]), gelandet: true }) === "wald:GELANDET ziel:FREI");
    pr("Nachweis roter Zug: wer im Kandidaten stand, ist geurteilt; wer vorher fiel, ist frei",
        nw({ zweige: ["a@1", "b@2"], inMain: new Set(), drin: new Set(["a"]), gelandet: false }) === "a:GEURTEILT b:FREI");
    pr("Nachweis gelandet, aber der Kopf fehlt in main → FREI", nw({ zweige: ["a@1"], inMain: new Set(), drin: new Set(["a"]), gelandet: true }) === "a:FREI");
    pr("Nachweis kein Karussell: ein Zweig fiel ALLEIN an der Probe → GEURTEILT; ohne benannten Grund → FREI",
        nw({ zweige: ["a@1"], inMain: new Set(), drin: new Set(), gelandet: false, gefallen: new Set(["a"]) }) === "a:GEURTEILT" &&
            nw({ zweige: ["a@1"], inMain: new Set(), drin: new Set(), gelandet: false }) === "a:FREI");
    // z582–z585 (16.11.): drei Köpfe fielen im Bündel an einem Siegel-Wort IHRES Verlaufs, wurden je Zug wieder frei und fuhren
    // 361-mal im Kreis — ein kopf-eigener Fall ist ein Urteil über den Kopf, auch im Bündel; ein Bündel-Fall bleibt FREI
    pr("Nachweis kopf-eigen: Siegel im eigenen Verlauf → GEURTEILT auch im Bündel; ein Konflikt im Bündel bleibt FREI",
        nw({ zweige: ["a@1", "b@2", "c@3"], inMain: new Set(), drin: new Set(["c"]), gelandet: false, gefallen: new Set(["a", "b"]),
            eigen: new Set(["a"]) }) === "a:GEURTEILT b:FREI c:GEURTEILT" &&
            kopfEigen(`gefallen a@1: Siegel-Wort „fertig" im Commit bb4045f79a WIP x`) &&
            kopfEigen(`gefallen a: Siegel-Wort „RUND" im Zweig-Namen (wandert in die Merge-Message)`) &&
            !kopfEigen("gefallen b@2: merge scheitert: CONFLICT (content)") && !kopfEigen("gefallen b: Zweig fehlt auf origin"));
    // z631 (20.11.): ein Täter der Vorab-Statik wurde nicht gefahren — VORAB, auch allein; nie FREI (zug-nicht-gelandet) und nie GEURTEILT
    const vz = "gefallen w@1: VORAB-STATIK ROT an main 3da9d9ae (ohne ihn grün): ❌ REGISTER-ZEILE STIRBT";
    pr("Nachweis Vorab: der Täter ist VORAB (im Bündel und allein), die übrigen urteilt ihr Zug",
        nw({ zweige: ["w@1", "k@2"], inMain: new Set(), drin: new Set(["k"]), gelandet: false, gefallen: new Set(["w"]), vorab: new Map([["w", "3da9d9ae"]]) }) === "w:VORAB k:GEURTEILT" &&
            nw({ zweige: ["w@1"], inMain: new Set(), drin: new Set(), gelandet: false, gefallen: new Set(["w"]), vorab: new Map([["w", "3da9d9ae"]]) }) === "w:VORAB" &&
            VORAB_RE.exec(vz)[1] === "3da9d9ae" && !VORAB_RE.test("gefallen b@2: merge scheitert: CONFLICT (content)"));
    // der Grund eines gefallenen Pushs (z447): die letzte Zeile nennt ihn nie — die Mutante ist das alte „letzte Zeile“
    const pe = (...z) => [...z, "error: failed to push some refs to 'https://github.com/x/y.git'"].join("\n");
    const pg1 = pushGrund(pe("To https://github.com/x/y.git", " ! [remote rejected]     abc123 -> integ-probe (cannot lock ref 'refs/heads/integ-probe': is at 1 but expected 2)"));
    pr("Push-Grund: die Ref-Zeile steht da, die Schluss-Zeile nicht; ein Schloss am Ref ist die Maschine", /cannot lock ref/.test(pg1) && !/failed to push some refs/.test(pg1) && !pushInhalt(pg1));
    const pg2 = pushGrund(pe("remote: error: GH013: Repository rule violations found for refs/heads/integ-probe.", "remote: - Push cannot contain secrets", " ! [remote rejected] abc -> integ-probe (push declined due to repository rule violations)"));
    pr("Push-Grund: eine Regel des Servers ist ein Urteil über den Inhalt, mit den Zeilen des Servers", pushInhalt(pg2) && /Push cannot contain secrets/.test(pg2));
    const pg3 = pushGrund("fatal: unable to access 'https://github.com/x/y.git/': Failed to connect to github.com port 443 after 21050 ms: Timed out");
    pr("Push-Grund: die Leitung ist die Maschine", /Timed out/.test(pg3) && !pushInhalt(pg3));
    pr("Push-Grund: ohne Wort von git steht das beim Namen", pushGrund("") === "git nannte keinen Grund" && pushGrund(pe()) === "error: failed to push some refs to 'https://github.com/x/y.git'");
    // die Format-Stufe liest genau die Pfade des Format-Checks
    const fp = formatPfade({ scripts: { "format:check": "node scripts/format-teile.cjs --selftest stamm phyto-core.js" } });
    pr("Format: Pfade aus format:check", fp.join() === "stamm,phyto-core.js");
    pr("Format: stamm/x.js und phyto-core.js geprüft, stamm/u/y.js · stamm/k.json · scripts/z.cjs nicht",
        formatGeprueft("stamm/x.js", fp) && formatGeprueft("phyto-core.js", fp) && !formatGeprueft("stamm/u/y.js", fp) && !formatGeprueft("stamm/k.json", fp) && !formatGeprueft("scripts/z.cjs", fp));
    selbsttestTaeter(pr);
    selbsttestPuffer(pr);
    {
        // der Fall z670: eine grüne Zeile über 300 Zeichen vor der roten Urteils-Zeile, davor ein roter Fall; die Mutante ist das alte Gesetz
        const lang = "  ✅ Start-Frist beim Namen (" + "dem Vendor gereicht · ".repeat(20) + ")";
        const aus = ["  ✅ Fall a", "  ❌ Fall b: der Puls stand 9 s", lang, "ROT — 1 Fall rot"].join("\n");
        const altesGesetz = (t) => t.trim().split("\n").slice(-2).join(" | ").slice(0, 300);
        const neu = restVon(aus, false);
        pr("Rest eines roten Schritts: der rote Fall und das Urteil stehen beim Namen, die lange grüne Zeile davor nicht; das alte Gesetz (die letzten zwei Zeilen auf 300 Zeichen) verliert beide; ein grüner Schritt trägt den Schluss wie bisher",
            neu.includes("❌ Fall b: der Puls stand 9 s") && neu.includes("ROT — 1 Fall rot") && !neu.includes("Start-Frist") && !/❌|ROT —/.test(altesGesetz(aus)) && restVon("x\ny\nGRÜN — steht", true) === "y | GRÜN — steht");
    }
    console.log(fall.length ? `zug selbsttest ROT: ${fall.join(" · ")}` : `zug selbsttest grün (${faelle} Fälle)`);
    return fall.length ? 1 : 0;
}
// DIE PUFFER-GRENZE DER GIT-LESER (21.11.): `execFileSync`/`spawnSync` tragen ohne `maxBuffer` 1 MiB. `zug/erledigt.txt` wuchs auf
// 1 148 674 Bytes, `zeile-erledigt.cjs` las sie mit `git show` ohne Grenze und fiel an der OMEN 255× mit „spawnSync git ENOBUFS“ —
// still, bis das Gerät es meldete. Eine Lücke ist ein git-Ruf OHNE `maxBuffer`, der (a) ein allgemeiner Helfer ist (die Argumente
// sind eine Variable oder tragen ein `...`: er liest, was der Rufer will) oder (b) den Inhalt einer Datei liest (`"show"`). Rufe mit
// festem, kleinem Ausgang (rev-parse, fetch, commit-tree, cat-file einer Puls-Datei, log -1) tragen keine. Zurück: [{ zeile, text }].
function pufferLuecken(quelle) {
    const z = quelle.split("\n");
    const aus = [];
    z.forEach((l, i) => {
        const m = /(?:execFileSync|spawnSync)\(\s*["'`]git["'`]\s*,\s*(.*)$/.exec(l);
        if (!m || /^\s*(\/\/|\*)/.test(l)) return;
        // die Aussage bis zum Ende des Rufs: höchstens vier Zeilen (die Optionen stehen bei jedem Leser dieser Skripte dort)
        const aussage = z.slice(i, i + 4).join(" ");
        // wer keinen Ausgang sammelt (`stdio: "ignore"`), füllt keinen Puffer
        if (/maxBuffer/.test(aussage) || /stdio:\s*["'`]ignore["'`]/.test(aussage)) return;
        const arg = m[1];
        const liste = /^\[([^\]]*)\]/.exec(arg);
        const helfer = !liste || /\.\.\./.test(liste[1]);
        // die Optionen aus einer Funktion (`opt(repo)`) trägt deren Quelle: sie steht in derselben Datei mit `maxBuffer`
        const optAus = /,\s*\{\s*\.\.\.(\w+)\(/.exec(arg);
        if (optAus && new RegExp(`const ${optAus[1]} = [^\\n]*maxBuffer`).test(quelle)) return;
        if (helfer || /["'`]show["'`]/.test(liste[1])) aus.push({ zeile: i + 1, text: l.trim().slice(0, 140) });
    });
    return aus;
}
function selbsttestPuffer(pr) {
    // § steht für den Ruf (die Linse liest auch diese Datei: ihre Test-Zeilen sind keine Rufe)
    const ruf = (s) => s.split("§").join("execFileSync");
    const alt = ruf('let alt = cp.§("git", ["show", basis + ":zug/erledigt.txt"], { cwd: MESS }).toString("utf8");');
    const helfer = ruf('const git = (a, o = {}) => cp.§("git", a, { cwd: MESS, encoding: "utf8", ...o }).trim();');
    const spreiz = ruf('const git = (...a) => §("git", ["-C", R, ...a], { encoding: "utf8", timeout: 60000 }).trim();');
    const fest = ['const pm = cp.§("git", ["rev-parse", "--short=8", "refs/omen/dauer-pm"], { cwd: PM, encoding: "utf8" }).trim();', '§("git", fetchArgs, { timeout: 30000, windowsHide: true, stdio: "ignore" });', '// §("git", a, {})'].map(ruf);
    const heil = [alt.replace("{ cwd: MESS }", "{ cwd: MESS, maxBuffer: PUFFER }"), helfer.replace("...o }", "maxBuffer: 1 << 28, ...o }"), ruf("const opt = (repo) => ({ cwd: repo, maxBuffer: 1 << 30 });\nsync: (a, input) => §('git', a, { ...opt(repo), input });")];
    pr("Puffer-Grenze: der Leser der wachsenden Datei (der Täter der OMEN, ENOBUFS), der allgemeine Helfer und der Helfer mit `...` sind Lücken beim Namen; feste kleine Rufe, Kommentare und die geheilten Zeilen nicht",
        [alt, helfer, spreiz].every((q) => pufferLuecken(q).length === 1 && pufferLuecken(q)[0].zeile === 1) && !pufferLuecken(fest.join("\n")).length && heil.every((q) => !pufferLuecken(q).length));
    // DER LESER: jeder Selbsttest des Zug-Werkzeugs urteilt über die Skripte NEBEN ihm — in der Quelle zug/dienst und zug/dienst-omen,
    // installiert artifacts/profiband (dienst/, werkzeug/)
    const geh = (d) => (fs.existsSync(d) ? fs.readdirSync(d, { withFileTypes: true }).flatMap((e) => (e.isDirectory() ? (e.name === "node_modules" ? [] : geh(path.join(d, e.name))) : /\.cjs$/.test(e.name) ? [path.join(d, e.name)] : [])) : []);
    const orte = [path.join(__dirname, ".."), path.join(__dirname, "..", "..", "dienst-omen")];
    const funde = orte.flatMap(geh).flatMap((f) => pufferLuecken(fs.readFileSync(f, "utf8")).map((x) => `${path.relative(path.join(__dirname, ".."), f).split(path.sep).join("/")}:${x.zeile}`));
    pr(`Puffer-Grenze: jeder git-Leser der Dienst-Skripte trägt maxBuffer${funde.length ? ` — OHNE: ${funde.join(", ")}` : ""}`, !funde.length);
}

if (require.main !== module) module.exports = { loeseDatei, loeseBlock, loeseKarte, dreiWege, urteilAus, urteilVon, nachwacheUrteil, zweigeZwischen, nachweisUrteil, zugAufbau, rotSchritte, erbeKette, erbeUrteil, WACKEL_RE, mergeAlle, vorabLauf, vorabStatik, taeterUrteil, echtBefehle, neuerBetreff, probeTagFehlt };
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
        else if (verb === "selbsttest") rc = selbsttest(args);
        else if (verb === "vorab") rc = vorab(args);
        else if (verb === "nachweis") rc = nachweis(args);
        else if (verb === "taeter") rc = await taeter(args);
        else if (verb === "probe-tag") rc = probeTag(args);
        else if (verb === "erbe") rc = await erbe(args);
        else if (verb === "nachwache") rc = await nachwache();
        else console.log("zug.sh bereit|erbe|bau|vorab|urteil|teile|wackler|landen|nachwache|punkte|nachweis|taeter|probe-tag|selbsttest [--vorab] — siehe zug.md");
    } catch (e) {
        console.log(`zug ${verb} FEHLER: ${e.message}`);
        rc = 2;
    }
    process.exitCode = rc; // kein process.exit: libuv bricht unter Windows bei offenen fetch-Sockeln (UV_HANDLE_CLOSING)
})();
