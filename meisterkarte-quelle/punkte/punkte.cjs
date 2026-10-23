#!/usr/bin/env node
// DIE PUNKTE-MASCHINE der Meisterkarte: die Punkte eines Kriteriums sind eine FUNKTION DES SHA, gerechnet wie die CI —
// keine Sitzung misst und bucht mehr von Hand, was hier registriert ist.
//
//   node punkte.cjs run --sha <sha> --geraet radeon|gtx|headless [--nur id,id] [--port-basis 7700]
//        fährt jede Station des Geräts im Spiel-Baum am SHA, schreibt messung/<sha8>-<geraet>.json
//   node punkte.cjs buchen --kopf <sha>
//        liest alle messung/*.json, urteilt R6 (Pfad unberührt seit der Messung) und R10, schreibt stand.json
//   node punkte.cjs liste        die registrierten Stationen, geprüft gegen src/gN.js
//   node punkte.cjs selbsttest   jeder Fall beim Namen
//
// FORMAT (stationen/g1.js .. g6.js, module.exports = [ … ]), je Eintrag:
//   kriterium "gelaende.K2" (Bereich-Schlüssel.K<n> wie in src/gN.js) · staffel 1|2 · geraet "radeon"|"gtx"|"headless"
//   oder eine Liste (Staffel 2 einer GPU-Station verlangt ["radeon","gtx"]) · befehl argv im Spiel-Baum (argv[0] "node"
//   oder "bash"; Platzhalter {PORT} {AUS} {BAUM} {KOORD}) · env (optional, dieselben Platzhalter) · gpu true|false (true →
//   über gpu-lauf.sh, nie ohne Schloss) · minuten (Deckel = 2 × minuten, mindestens 2 min) · urteil (j, lauf) →
//   { gruen, zahl } mit j = JSON aus {AUS} oder null, lauf = { exit, stdout, stderr } · pfad: Globs des gemessenen Pfads
//   (R6) · quelle: der Staffel-Text wörtlich (Teil der Staffel in src/gN.js).
// Je Kriterium und Staffel EINE Station (Schlüssel "<kriterium>#<staffel>"); ein Kriterium ohne Staffel-1-Station ist ROT.
//
// BUCHUNG (R2 · R6 · R10): je Station und Gerät zählt die JÜNGSTE Messung, deren Abdruck (Befehl, Urteil, Pfad, Hilfen)
// der Station gleicht und deren Pfad zwischen Mess-SHA und Kopf in Welt-Bytes unberührt ist (weltDateien). 1 = jede
// Staffel-1-Station auf mindestens einem ihrer Geräte grün · 2 = dazu jede Staffel-2-Station auf JEDEM ihrer Geräte grün ·
// sonst 0. Ein jüngeres ROT schlägt ein älteres GRÜN; ungemessen ist 0.
"use strict";
const fs = require("fs");
const os = require("os");
const path = require("path");
const crypto = require("crypto");
const { spawn, spawnSync } = require("child_process");

const DIR = __dirname;
const QUELLE = path.resolve(DIR, "..");
const KOORD = path.resolve(QUELLE, "..");
const GRUPPEN = ["g1", "g2", "g3", "g4", "g5", "g6"];
const GERAETE = ["radeon", "gtx", "headless"];
const TABU_PORT = 4312;

// ───────────────────────────────── Format ─────────────────────────────────
function kriterienDerKarte(srcDir = path.join(QUELLE, "src")) {
    const k = new Map();
    for (const g of GRUPPEN) {
        const m = require(path.join(srcDir, g + ".js"));
        for (const b of m.bereiche) b.kriterien.forEach((x, i) => k.set(b.key + ".K" + (i + 1), { gruppe: g, ...x }));
    }
    return k;
}

const geraeteVon = (st) => (Array.isArray(st.geraet) ? st.geraet : [st.geraet]);
const schluessel = (st) => st.kriterium + "#" + st.staffel;

function hilfeText() {
    return fs.readFileSync(path.join(DIR, "hilfe.cjs"), "utf8");
}
function abdruck(st, hilfe = hilfeText()) {
    const roh = JSON.stringify({
        k: st.kriterium, s: st.staffel, g: geraeteVon(st), b: st.befehl, e: st.env || {}, gpu: !!st.gpu,
        u: String(st.urteil), p: st.pfad, q: st.quelle, h: hilfe,
    });
    return crypto.createHash("sha1").update(roh).digest("hex").slice(0, 12);
}

// prüft die Stationen gegen die Karte; Rückgabe { stationen, fehler }
function pruefeStationen(liste, karte) {
    const fehler = [];
    const gesehen = new Set();
    const ok = [];
    for (const st of liste) {
        const wer = (st && st.kriterium) + "#" + (st && st.staffel);
        const f = [];
        const k = st && karte.get(st.kriterium);
        if (!k) f.push("Kriterium unbekannt");
        if (![1, 2].includes(st.staffel)) f.push("staffel nicht 1|2");
        if (st && st.befehl === null) {
            fehler.push(wer + ": befehl null gehört in module.exports.fehlt (mit grund), nie in die fahrbare Liste");
            continue;
        }
        const ge = geraeteVon(st);
        if (!ge.length || ge.some((g) => !GERAETE.includes(g)) || new Set(ge).size !== ge.length) f.push("geraet ungültig");
        if (ge.includes("headless") && (ge.length > 1 || st.gpu)) f.push("headless läuft allein und ohne GPU");
        if (!ge.includes("headless") && !st.gpu) f.push("ein Gerät radeon|gtx verlangt gpu: true");
        if (st.staffel === 2 && st.gpu && !(ge.includes("radeon") && ge.includes("gtx")))
            f.push("Staffel 2 einer GPU-Station verlangt beide Geräte (R2)");
        if (!Array.isArray(st.befehl) || !st.befehl.length || st.befehl.some((a) => typeof a !== "string"))
            f.push("befehl ist kein argv");
        else if (!["node", "bash"].includes(st.befehl[0])) f.push("befehl[0] nicht node|bash");
        if (st.env && (typeof st.env !== "object" || Object.values(st.env).some((v) => typeof v !== "string")))
            f.push("env ungültig");
        if (typeof st.gpu !== "boolean") f.push("gpu nicht boolesch");
        if (!(st.minuten > 0)) f.push("minuten fehlt");
        if (typeof st.urteil !== "function") f.push("urteil ist keine Funktion");
        if (!Array.isArray(st.pfad) || !st.pfad.length || st.pfad.some((p) => typeof p !== "string" || !p))
            f.push("pfad leer (R6 könnte nie fallen)");
        if (typeof st.quelle !== "string" || st.quelle.length < 8) f.push("quelle fehlt");
        else if (k && !String(k.staffel).includes(st.quelle)) f.push("quelle steht nicht wörtlich in der Staffel");
        else if (k && !new RegExp("(^|\\s)" + st.staffel + " =").test(st.quelle)) f.push("quelle nennt nicht die Stufe " + st.staffel + " =");
        if (gesehen.has(wer)) f.push("doppelt");
        gesehen.add(wer);
        if (f.length) fehler.push(wer + ": " + f.join(" · "));
        else ok.push(st);
    }
    const kr = new Set(ok.map((s) => s.kriterium));
    for (const k of kr)
        if (!ok.some((s) => s.kriterium === k && s.staffel === 1)) fehler.push(k + ": keine Staffel-1-Station (eine 2 ohne 1 zählt nie)");
    return { stationen: ok, fehler };
}

function ladeStationen(dir = path.join(DIR, "stationen"), teil = "liste") {
    const alle = [];
    for (const g of GRUPPEN) {
        const f = path.join(dir, g + ".js");
        if (!fs.existsSync(f)) continue;
        const m = require(f);
        if (!Array.isArray(m)) throw new Error(g + ".js exportiert keine Liste");
        if (m.fehlt != null && !Array.isArray(m.fehlt)) throw new Error(g + ".js: fehlt ist keine Liste");
        for (const st of teil === "fehlt" ? m.fehlt || [] : m) alle.push(st);
    }
    return alle;
}
// die Staffeln OHNE Werkzeug (module.exports.fehlt): beim Namen, mit Grund, nie zugleich eine fahrbare Station
function pruefeFehlt(fehlt, karte, stationen) {
    const fehler = [];
    const fahrbar = new Set(stationen.map(schluessel));
    const gesehen = new Set();
    for (const e of fehlt) {
        const wer = (e && e.kriterium) + "#" + (e && e.staffel);
        const f = [];
        if (!e || !karte.get(e.kriterium)) f.push("Kriterium unbekannt");
        if (!e || ![1, 2].includes(e.staffel)) f.push("staffel nicht 1|2");
        if (!e || e.befehl !== null) f.push("fehlt trägt befehl: null");
        if (!e || typeof e.grund !== "string" || e.grund.length < 8) f.push("grund fehlt");
        if (fahrbar.has(wer)) f.push("zugleich fahrbare Station");
        if (gesehen.has(wer)) f.push("doppelt");
        gesehen.add(wer);
        if (f.length) fehler.push("fehlt " + wer + ": " + f.join(" · "));
    }
    return fehler;
}
function ladeGeprueft() {
    const karte = kriterienDerKarte();
    const r = pruefeStationen(ladeStationen(), karte);
    const fehlt = ladeStationen(undefined, "fehlt");
    return { ...r, fehlt, fehler: [...r.fehler, ...pruefeFehlt(fehlt, karte, r.stationen)] };
}

// ───────────────────────────────── Glob (R6) ─────────────────────────────────
function globRegex(g) {
    let r = "";
    for (let i = 0; i < g.length; i++) {
        const c = g[i];
        if (c === "*" && g[i + 1] === "*") {
            r += g[i + 2] === "/" ? "(?:.*/)?" : ".*";
            i += g[i + 2] === "/" ? 2 : 1;
        } else if (c === "*") r += "[^/]*";
        else if (c === "?") r += "[^/]";
        else r += c.replace(/[.+^${}()|[\]\\]/g, "\\$&");
    }
    if (g.endsWith("/")) r += ".*";
    return new RegExp("^" + r + "$");
}
const trifftPfad = (datei, pfad) => pfad.some((g) => globRegex(g).test(datei));

// ───────────────────────────────── git ─────────────────────────────────
function git(args, cwd) {
    const r = spawnSync("git", args, { cwd, encoding: "utf8", maxBuffer: 64 << 20 });
    if (r.status !== 0) throw new Error("git " + args.join(" ") + ": " + String(r.stderr || r.stdout).trim().split("\n")[0]);
    return r.stdout.trim();
}
function spielRepo() {
    // git < 2.31 kennt --path-format nicht und gibt es als eigene Zeile zurück (OMEN: git 2.30): die letzte Zeile, gegen KOORD aufgelöst
    const common = git(["rev-parse", "--path-format=absolute", "--git-common-dir"], KOORD).split(/\r?\n/).pop();
    return path.dirname(path.resolve(KOORD, common));
}
function voll(repo, sha) {
    try {
        return git(["rev-parse", "--verify", "--quiet", sha + "^{commit}"], repo);
    } catch (_e) {
        git(["fetch", "-q", "origin"], repo);
        return git(["rev-parse", "--verify", sha + "^{commit}"], repo);
    }
}

// ───────────────────────────────── Läufer ─────────────────────────────────
function findeBash() {
    if (process.env.PUNKTE_BASH) return process.env.PUNKTE_BASH;
    if (process.platform === "win32") {
        for (const p of ["C:/Program Files/Git/bin/bash.exe", "C:/Program Files/Git/usr/bin/bash.exe"]) if (fs.existsSync(p)) return p;
        return null; // nie die WSL-bash aus System32
    }
    return "bash";
}

function portRaeumen(port) {
    if (!port) return;
    if (process.platform === "win32") {
        const r = spawnSync("netstat", ["-ano", "-p", "tcp"], { encoding: "utf8" });
        const pids = new Set();
        for (const l of String(r.stdout || "").split(/\r?\n/)) {
            const s = l.trim().split(/\s+/);
            if (s.length >= 5 && /^(LISTEN|ABH)/i.test(s[3]) && new RegExp(":" + port + "$").test(s[1]) && s[4] !== "0") pids.add(s[4]);
        }
        for (const pid of pids) spawnSync("taskkill", ["/F", "/T", "/PID", pid], { encoding: "utf8" });
    } else spawnSync("sh", ["-c", "lsof -ti tcp:" + port + " -sTCP:LISTEN | xargs -r kill -9"], { encoding: "utf8" });
}

function baumTot(pid) {
    if (process.platform === "win32") spawnSync("taskkill", ["/F", "/T", "/PID", String(pid)], { encoding: "utf8" });
    else try { process.kill(-pid, "SIGKILL"); } catch (_e) { try { process.kill(pid, "SIGKILL"); } catch (_f) {} }
}

const ersetze = (s, ctx) =>
    s.replace(/\{PORT\}/g, String(ctx.port)).replace(/\{AUS\}/g, ctx.aus).replace(/\{BAUM\}/g, ctx.baum).replace(/\{KOORD\}/g, ctx.koord);

const SCHLOSS_WARTE_S = 2700; // gpu-lauf.sh GPU_LAUF_WARTE_S
// fährt EINE Station; ctx = { baum, koord, port, aus, roh, geraet, gpuLauf, bash, deckelMinS }
// Rückgabe { gruen, zahl, exit, minuten, grund? } — ein Fehler, ein Absturz, ein Deckel ist ROT mit Grund, nie still.
function fahreStation(st, ctx) {
    return new Promise((fertig) => {
        const t0 = Date.now();
        const min = () => +((Date.now() - t0) / 60000).toFixed(2);
        const rot = (grund, exit = null, zahl = "") => fertig({ gruen: false, zahl: zahl || grund, exit, minuten: min(), grund });
        const deckelS = Math.max(ctx.deckelMinS != null ? ctx.deckelMinS : 120, Math.ceil(st.minuten * 60 * 2));
        let argv = st.befehl.map((a) => ersetze(a, ctx));
        const env = { ...process.env };
        // headless läuft ohne Karte: starteBrowser griffe lokal sonst die GPU (scripts/lib/software-gpu.cjs) — ohne Schloss
    if (!st.gpu) env.LINSE_GPU = "software";
    for (const [k, v] of Object.entries(st.env || {})) env[k] = ersetze(v, ctx);
    if (!st.gpu && env.LINSE_GPU !== "software") return rot("headless verlangt LINSE_GPU=software — die Karte nur unter dem Schloss");
        let exe;
        let warteS = 0;
        if (argv[0] === "node") exe = process.execPath;
        else {
            exe = ctx.bash;
            if (!exe) return rot("keine Git-bash gefunden (PUNKTE_BASH)");
        }
        argv = argv.slice(1);
        if (st.gpu) {
            if (!ctx.gpuLauf || !fs.existsSync(ctx.gpuLauf)) return rot("gpu-lauf.sh fehlt — eine GPU-Station läuft nie ohne Schloss");
            if (!ctx.bash) return rot("keine Git-bash gefunden (PUNKTE_BASH) für gpu-lauf.sh");
            argv = [ctx.gpuLauf, "punkte-" + ctx.geraet, exe, ...argv];
            exe = ctx.bash;
            env.GPU_LAUF_MAX_S = String(deckelS);
            warteS = Number(env.GPU_LAUF_WARTE_S || SCHLOSS_WARTE_S);
        }
        try { fs.rmSync(ctx.aus, { force: true }); } catch (_e) {}
        portRaeumen(ctx.port);
        let out = "", err = "", tot = false;
        let kind;
        try {
            kind = spawn(exe, argv, { cwd: ctx.baum, env, windowsHide: true, detached: process.platform !== "win32" });
        } catch (e) {
            return rot("Start: " + e.message);
        }
        const kappe = (s, d) => (s.length + d.length > 4 << 20 ? (s + d).slice(-(4 << 20)) : s + d);
        kind.stdout.on("data", (d) => (out = kappe(out, String(d))));
        kind.stderr.on("data", (d) => (err = kappe(err, String(d))));
        // der eigene Deckel liegt HINTER dem des Schlosses: gpu-lauf.sh beendet selbst und löst das Schloss (trap)
        const uhr = setTimeout(() => { tot = true; baumTot(kind.pid); }, (deckelS + warteS + (st.gpu ? 120 : 0)) * 1000);
        kind.on("error", (e) => { clearTimeout(uhr); rot("Start: " + e.message); });
        kind.on("close", (code, sig) => {
            clearTimeout(uhr);
            portRaeumen(ctx.port);
            if (ctx.roh) {
                fs.mkdirSync(path.dirname(ctx.roh), { recursive: true });
                fs.writeFileSync(ctx.roh, "$ " + [exe, ...argv].join(" ") + "\n" + out + (err ? "\n--- stderr ---\n" + err : ""));
            }
            if (tot) return rot("Deckel " + (deckelS + warteS) + " s überschritten — beendet", code);
            if (sig) return rot("Absturz: Signal " + sig, code);
            if (st.gpu && code === 75) return rot("GPU-Schloss blockiert (gpu-lauf.sh Exit 75)", code);
            if (st.gpu && code === 124) return rot("GPU-Deckel " + deckelS + " s (gpu-lauf.sh Exit 124)", code);
            let j = null;
            if (fs.existsSync(ctx.aus))
                try { j = JSON.parse(fs.readFileSync(ctx.aus, "utf8")); } catch (_e) { j = null; }
            let u;
            try {
                u = st.urteil(j, { exit: code, stdout: out, stderr: err });
            } catch (e) {
                return rot("Urteil warf: " + String((e && e.message) || e).split("\n")[0], code);
            }
            if (!u || typeof u.gruen !== "boolean" || typeof u.zahl !== "string" || !u.zahl)
                return rot("Urteil ungültig (verlangt { gruen: bool, zahl: Text })", code);
            fertig({ gruen: u.gruen, zahl: u.zahl, exit: code, minuten: min(), ...(u.gruen ? {} : { grund: "ROT: " + u.zahl }) });
        });
    });
}

function baumAmSha(repo, geraet, sha) {
    const baum = path.join(repo, ".claude", "worktrees", "punkte-" + geraet);
    if (!fs.existsSync(path.join(baum, ".git"))) {
        git(["worktree", "add", "--detach", baum, sha], repo);
    } else {
        git(["checkout", "-q", "--detach", "--force", sha], baum);
        git(["clean", "-fdq", "-e", "node_modules"], baum);
    }
    const ist = git(["rev-parse", "HEAD"], baum);
    if (ist !== sha) throw new Error("Spiel-Baum steht auf " + ist + " statt " + sha);
    const nm = path.join(baum, "node_modules");
    const ziel = path.join(repo, "node_modules");
    if (!fs.existsSync(ziel)) throw new Error("node_modules fehlt im Haupt-Klon " + ziel);
    if (!fs.existsSync(nm)) fs.symlinkSync(ziel, nm, "junction");
    return baum;
}

const messDatei = (sha, geraet, mdir = path.join(DIR, "messung")) => path.join(mdir, sha.slice(0, 8) + "-" + geraet + ".json");

async function run(opt) {
    if (!opt.sha) throw new Error("--sha fehlt");
    if (!GERAETE.includes(opt.geraet)) throw new Error("--geraet radeon|gtx|headless");
    const { stationen, fehler } = ladeGeprueft();
    if (fehler.length) throw new Error("Stationen ROT:\n - " + fehler.join("\n - "));
    const nur = opt.nur ? new Set(opt.nur.split(",")) : null;
    // je Station ein fester Port aus ihrer Stelle in der GANZEN Liste (stabil über Läufe), nie 4312
    const ports = new Map();
    let p = Number(opt.portBasis || 7700);
    for (const st of stationen) { if (p === TABU_PORT) p++; ports.set(schluessel(st), p++); }
    const meine = stationen.filter((st) => geraeteVon(st).includes(opt.geraet) && (!nur || nur.has(schluessel(st))));
    if (nur) for (const id of nur) if (!meine.some((st) => schluessel(st) === id)) throw new Error("--nur " + id + ": keine Station auf " + opt.geraet);
    if (!meine.length) throw new Error("keine Station auf " + opt.geraet);
    const repo = spielRepo();
    const sha = voll(repo, opt.sha);
    const baum = baumAmSha(repo, opt.geraet, sha);
    const datei = messDatei(sha, opt.geraet);
    const rohDir = path.join(DIR, "messung", "roh", sha.slice(0, 8) + "-" + opt.geraet);
    let m = fs.existsSync(datei) ? JSON.parse(fs.readFileSync(datei, "utf8")) : null;
    if (!m || m.sha !== sha) m = { sha, geraet: opt.geraet, zeit: null, host: os.hostname(), je: {} };
    const hilfe = hilfeText();
    const ctx0 = { baum, koord: KOORD, geraet: opt.geraet, bash: findeBash(),
        gpuLauf: process.env.PUNKTE_GPU_LAUF || path.join(repo, "artifacts", "profiband", "werkzeug", "gpu-lauf.sh") };
    console.log("Punkte-Maschine: " + meine.length + " Station(en) auf " + opt.geraet + " am " + sha.slice(0, 8) + " (Baum " + baum + ")");
    for (const st of meine) {
        const id = schluessel(st);
        const datei2 = id.replace("#", "_");
        const ctx = { ...ctx0, port: ports.get(id), aus: path.join(rohDir, datei2 + ".json"), roh: path.join(rohDir, datei2 + ".out") };
        fs.mkdirSync(rohDir, { recursive: true });
        const zeit = new Date().toISOString();
        const e = await fahreStation(st, ctx);
        m.je[id] = { ...e, zeit, abdruck: abdruck(st, hilfe), port: ctx.port };
        m.zeit = zeit;
        m.host = os.hostname();
        fs.writeFileSync(datei, JSON.stringify(m, null, 1) + "\n");
        console.log("  " + (e.gruen ? "GRÜN" : "ROT ") + " " + id + " · " + e.zahl + " · Exit " + e.exit + " · " + e.minuten + " min");
    }
    console.log("→ " + path.relative(KOORD, datei));
    return m;
}

// ───────────────────────────────── Buchung ─────────────────────────────────
// messungen: Liste {sha, geraet, je}; geaendert(messSha) → Liste der Dateien bis zum Kopf (wirft, wenn unbekannt)
function buchen(kopf, stationen, messungen, geaendert, hilfe = hilfeText(), fehlt = []) {
    const diffCache = new Map();
    const diff = (sha) => {
        if (!diffCache.has(sha)) {
            try { diffCache.set(sha, { dateien: geaendert(sha) }); } catch (e) { diffCache.set(sha, { fehler: e.message }); }
        }
        return diffCache.get(sha);
    };
    // die jüngste frische Messung je Station und Gerät
    const stand = (st, g) => {
        const id = schluessel(st);
        const ab = abdruck(st, hilfe);
        let alt = 0, fremd = 0, unbekannt = 0, taeter = [];
        const frisch = [];
        for (const m of messungen) {
            if (m.geraet !== g || !m.je || !m.je[id]) continue;
            const e = m.je[id];
            if (e.abdruck !== ab) { fremd++; continue; }
            const d = diff(m.sha);
            if (d.fehler) { unbekannt++; continue; }
            const t = d.dateien.filter((f) => trifftPfad(f, st.pfad));
            if (t.length) { alt++; taeter = t; continue; }
            frisch.push({ ...e, sha: m.sha, geraet: g });
        }
        frisch.sort((a, b) => String(b.zeit).localeCompare(String(a.zeit)));
        if (frisch.length) return frisch[0];
        return { gruen: false, ungemessen: true, grund: alt ? "Pfad seit der Messung geändert (R6: " + taeter.slice(0, 3).join(", ") + (taeter.length > 3 ? " +" + (taeter.length - 3) : "") + ")" : unbekannt ? "Mess-SHA unbekannt — kein R6-Urteil" : fremd ? "Station seit der Messung geändert" : "ungemessen (R10)" };
    };
    const je = {};
    const kriterien = [...new Set(stationen.map((s) => s.kriterium))].sort();
    for (const k of kriterien) {
        const sts = stationen.filter((s) => s.kriterium === k);
        const stufe = (n, alle) => {
            const xs = sts.filter((s) => s.staffel === n);
            const r = xs.map((s) => ({ s, je: geraeteVon(s).map((g) => ({ g, e: stand(s, g) })) }));
            const ok = xs.length > 0 && r.every((x) => (alle ? x.je.every((y) => y.e.gruen) : x.je.some((y) => y.e.gruen)));
            return { ok, r };
        };
        const s1 = stufe(1, false);
        const s2 = stufe(2, true);
        const punkte = s1.ok && s2.ok ? 2 : s1.ok ? 1 : 0;
        const teile = [];
        const offen = [];
        // eine erfüllte Stufe nennt ihre Grünen, eine offene jedes fehlende Gerät beim Grund
        for (const [n, s] of [[1, s1], [2, s2]])
            for (const x of s.r)
                for (const y of x.je) {
                    if (y.e.gruen) teile.push(y.e.zahl + " an " + y.e.sha.slice(0, 8) + " " + y.g);
                    else if (!(n === 1 && s.ok)) offen.push(k + "#" + n + " " + y.g + ": " + (y.e.ungemessen ? y.e.grund : y.e.grund || "ROT: " + y.e.zahl) + (y.e.sha ? " an " + y.e.sha.slice(0, 8) : ""));
                }
        // eine Staffel ohne Werkzeug (fehlt) nennt sich im Beleg — die Maschine bucht sie nie
        if (s1.ok) for (const f of fehlt) if (f.kriterium === k && f.staffel === 2) offen.push(k + "#2: kein Werkzeug (fehlt)");
        je[k] = {
            punkte,
            beleg: "Maschine: " + (teile.length ? teile.join(" · ") : "0") + (offen.length ? " — offen: " + offen.join(" · ") : ""),
            stationen: [s1, s2].flatMap((s) => s.r.flatMap((x) => x.je.map((y) => ({ id: schluessel(x.s), geraet: y.g, gruen: !!y.e.gruen, zahl: y.e.zahl || null, sha: y.e.sha || null, grund: y.e.grund || null })))),
        };
    }
    return { kopf, je };
}

function ladeMessungen(mdir = path.join(DIR, "messung")) {
    if (!fs.existsSync(mdir)) return [];
    return fs.readdirSync(mdir).filter((f) => /\.json$/.test(f)).map((f) => JSON.parse(fs.readFileSync(path.join(mdir, f), "utf8")));
}

// R6 urteilt über WELT-Bytes: Mess-Werkzeug (scripts/, spec/, .github/, docs/, artifacts/, *.md) und reine Versions-Stempel
// (?v=, "version", VERSION) sind kein Weltwechsel — 23.10.: jede Versions-Stufe stempelt index.html und die Worker neu, und die
// Buchung am nächsten Kopf warf darum jede Station mit index.html im Pfad weg, obwohl kein Spiel-Byte anders war. Das Werkzeug
// selbst trägt der Abdruck der Station (Befehl, Urteil, Pfad, Hilfen).
const WERKZEUG_PFAD = /^(scripts|spec|\.github|docs|artifacts)\/|\.md$/;
const VERSIONS_STEMPEL = [
    [/\?v=[0-9A-Za-z._-]+/g, "?v="],
    [/("version"\s*:\s*")[^"]*"/g, '$1"'],
    [/(VERSION\s*=\s*["'`])[^"'`]*(["'`])/g, "$1$2"],
];
const ohneStempel = (z) => VERSIONS_STEMPEL.reduce((s, [rx, e]) => s.replace(rx, e), z);
// namen: git diff --name-only · diffText: git diff -U0 über dieselben Stände → die Dateien, deren Welt-Bytes sich änderten
function weltDateien(namen, diffText) {
    const je = new Map();
    let cur = null;
    for (const z of String(diffText).split("\n")) {
        const m = /^diff --git a\/(.+?) b\//.exec(z);
        if (m) {
            cur = { weg: [], neu: [], bin: false };
            je.set(m[1], cur);
            continue;
        }
        if (!cur || z.startsWith("+++ ") || z.startsWith("--- ")) continue;
        if (/^Binary files /.test(z)) cur.bin = true;
        else if (z[0] === "-") cur.weg.push(ohneStempel(z.slice(1)));
        else if (z[0] === "+") cur.neu.push(ohneStempel(z.slice(1)));
    }
    return String(namen).split("\n").filter(Boolean).filter((f) => {
        if (WERKZEUG_PFAD.test(f)) return false;
        const d = je.get(f);
        if (!d || d.bin) return true;
        return d.weg.sort().join("\n") !== d.neu.sort().join("\n");
    });
}

function buchenCli(opt) {
    if (!opt.kopf) throw new Error("--kopf fehlt");
    const { stationen, fehler, fehlt } = ladeGeprueft();
    if (fehler.length) throw new Error("Stationen ROT:\n - " + fehler.join("\n - "));
    const repo = spielRepo();
    const kopfVoll = voll(repo, opt.kopf);
    const s = buchen(kopfVoll.slice(0, 8), stationen, ladeMessungen(), (sha) =>
        weltDateien(git(["diff", "--name-only", sha, kopfVoll], repo), git(["diff", "-U0", "--no-color", sha, kopfVoll], repo)),
        hilfeText(), fehlt);
    s.kopfVoll = kopfVoll;
    s.zeit = new Date().toISOString();
    fs.writeFileSync(path.join(DIR, "stand.json"), JSON.stringify(s, null, 1) + "\n");
    for (const [k, e] of Object.entries(s.je)) console.log("  " + k + " " + e.punkte + " · " + e.beleg);
    console.log("Kopf " + s.kopf + " · Maschine " + Object.keys(s.je).length + " Kriterien · Σ " + Object.values(s.je).reduce((a, e) => a + e.punkte, 0) + " → stand.json");
    return s;
}

// ───────────────────────────────── Übergang in gen.cjs ─────────────────────────────────
// liest stand.json (falls da); Rückgabe null oder { kopf, je }
function liesStand(datei = path.join(DIR, "stand.json")) {
    return fs.existsSync(datei) ? JSON.parse(fs.readFileSync(datei, "utf8")) : null;
}
// überschreibt in den Kriterien der Quelle (bereichKey, index, kriterium) punkte und beleg der REGISTRIERTEN
function maschinenKriterium(stand, bereichKey, i, k) {
    const e = stand && stand.je[bereichKey + ".K" + (i + 1)];
    return e ? { ...k, punkte: e.punkte, beleg: e.beleg, maschine: true } : k;
}
// Fehler des Übergangs: Kopf ungleich, Kriterium unbekannt
function standPruefen(stand, kopfKarte, bekannt) {
    const f = [];
    if (!stand) return f;
    if (stand.kopf !== String(kopfKarte).slice(0, 8)) f.push("stand.json am Kopf " + stand.kopf + ", die Karte am Kopf " + kopfKarte + " — punkte.cjs buchen --kopf " + kopfKarte);
    for (const id of Object.keys(stand.je)) if (!bekannt.has(id)) f.push("stand.json bucht " + id + ", die Karte kennt es nicht");
    return f;
}

// ───────────────────────────────── Selbsttest ─────────────────────────────────
async function selbsttest() {
    const fall = [];
    const pruef = (name, ok, was) => { fall.push({ name, ok }); console.log((ok ? "  GRÜN " : "  ROT  ") + name + (was ? " — " + was : "")); };
    const tmp = fs.mkdtempSync(path.join(os.tmpdir(), "punkte-selbst-"));
    const karte = kriterienDerKarte();
    // (1) die echten Stationen gegen die Karte
    const echt = ladeGeprueft();
    pruef("FORMAT echte Stationen gegen src/gN.js", echt.fehler.length === 0 && echt.stationen.length > 0,
        echt.stationen.length + " Stationen, " + echt.fehlt.length + " fehlt, " + echt.fehler.length + " Fehler" + (echt.fehler.length ? ": " + echt.fehler.join(" | ") : ""));
    // (1b) R6 liest Welt-Bytes: Werkzeug und Versions-Stempel fallen, echter Code bleibt, Binär bleibt
    {
        const namen = "index.html\nscripts/lib/welt-boot.cjs\nstamm/kampf.js\ngelaende-core.js\nbild.png\nREADME.md";
        const dt = [
            "diff --git a/index.html b/index.html", "--- a/index.html", "+++ b/index.html", "@@ -1 +1 @@",
            '-<script src="phyto-core.js?v=18.546.73" defer></script>', '+<script src="phyto-core.js?v=18.546.74" defer></script>',
            "diff --git a/stamm/kampf.js b/stamm/kampf.js", "--- a/stamm/kampf.js", "+++ b/stamm/kampf.js", "@@ -9 +9 @@", "-x = 1;", "+x = 2;",
            "diff --git a/gelaende-core.js b/gelaende-core.js", "@@ -1 +1 @@", '-importScripts("a.js?v=1.2");', '+importScripts("a.js?v=1.3");', "+neu();",
            "diff --git a/bild.png b/bild.png", "Binary files a/bild.png and b/bild.png differ",
        ].join("\n");
        const w = weltDateien(namen, dt).join(",");
        pruef("R6 Welt-Bytes: Stempel und Werkzeug fallen, Code und Binär bleiben", w === "stamm/kampf.js,gelaende-core.js,bild.png", w);
    }
    // (2) jede Format-Verletzung beim Namen
    const st0 = { kriterium: "gelaende.K4", staffel: 1, geraet: "headless", befehl: ["node", "-e", "0"], gpu: false, minuten: 1,
        urteil: () => ({ gruen: true, zahl: "x" }), pfad: ["stamm/wasser-*.js"], quelle: "1 = alle Leser folgen der 50-Punkte-Kern-Mutation an einem Ort" };
    const fv = [
        ["FORMAT-ROT Kriterium unbekannt", { kriterium: "gelaende.K9" }, /Kriterium unbekannt/],
        ["FORMAT-ROT Quelle nicht wörtlich", { quelle: "1 = alle Leser folgen irgendwie" }, /nicht wörtlich/],
        ["FORMAT-ROT Quelle andere Stufe", { staffel: 2, quelle: "1 = alle Leser folgen der 50-Punkte-Kern-Mutation an einem Ort" }, /Stufe 2/],
        ["FORMAT-ROT Pfad leer", { pfad: [] }, /pfad leer/],
        ["FORMAT-ROT Staffel 2 GPU an einem Gerät", { staffel: 2, geraet: "radeon", gpu: true, quelle: "2 = überall, dazu endet jeder Lauf in See oder Meer" }, /beide Geräte/],
        ["FORMAT-ROT radeon ohne gpu", { geraet: "radeon", gpu: false }, /gpu: true/],
        ["FORMAT-ROT Urteil kein Code", { urteil: "(j) => ({gruen:true})" }, /keine Funktion/],
        ["FORMAT-ROT argv npm", { befehl: ["npm", "run", "x"] }, /node\|bash/],
    ];
    for (const [name, mut, re] of fv) {
        const r = pruefeStationen([{ ...st0, ...mut }, ...(mut.staffel === 2 ? [st0] : [])], karte);
        pruef(name, r.fehler.some((f) => re.test(f)), r.fehler.join(" | "));
    }
    {
        const r = pruefeStationen([{ ...st0, staffel: 2, geraet: ["radeon", "gtx"], gpu: true, quelle: "2 = überall, dazu endet jeder Lauf in See oder Meer" }], karte);
        pruef("FORMAT-ROT Staffel 2 ohne Staffel 1", r.fehler.some((f) => /keine Staffel-1-Station/.test(f)), r.fehler.join(" | "));
        const d = pruefeStationen([st0, st0], karte);
        pruef("FORMAT-ROT doppelte Station", d.fehler.some((f) => /doppelt/.test(f)), d.fehler.join(" | "));
        const n = pruefeStationen([st0, { kriterium: "gelaende.K4", staffel: 2, befehl: null, grund: "kein Werkzeug" }], karte);
        pruef("FORMAT-ROT befehl null in der fahrbaren Liste", n.fehler.some((f) => /gehört in module.exports.fehlt/.test(f)) && n.stationen.length === 1, n.fehler.join(" | "));
        const fl = pruefeFehlt([{ kriterium: "gelaende.K4", staffel: 2, befehl: null }, { kriterium: "gelaende.K4", staffel: 1, befehl: null, grund: "kein Werkzeug" }], karte, [st0]);
        pruef("FORMAT-ROT fehlt ohne Grund · fehlt zugleich fahrbar", fl.length === 2 && /grund fehlt/.test(fl[0]) && /zugleich fahrbare/.test(fl[1]), fl.join(" | "));
    }
    // (3) Läufer: grün / rot / Absturz / Deckel / Urteil ungültig / GPU ohne Schloss / GPU über das Schloss
    const ctx = (n) => ({ baum: tmp, koord: KOORD, port: null, aus: path.join(tmp, n + ".json"), roh: path.join(tmp, n + ".out"), geraet: "radeon", bash: findeBash(), gpuLauf: null, deckelMinS: 0 });
    const schreib = (wert) => ["node", "-e", "require('fs').writeFileSync(process.argv[1], JSON.stringify(" + JSON.stringify(wert) + "))", "{AUS}"];
    const lies = (j) => ({ gruen: j.n === 0, zahl: "n " + j.n });
    let e = await fahreStation({ ...st0, befehl: schreib({ n: 0 }), urteil: lies }, ctx("gruen"));
    pruef("LÄUFER grün", e.gruen === true && e.zahl === "n 0" && e.exit === 0, JSON.stringify(e));
    e = await fahreStation({ ...st0, befehl: schreib({ n: 3 }), urteil: lies }, ctx("rot"));
    pruef("LÄUFER rot", e.gruen === false && /ROT: n 3/.test(e.grund), JSON.stringify(e));
    e = await fahreStation({ ...st0, befehl: ["node", "-e", "process.exit(3)"], urteil: lies }, ctx("absturz"));
    pruef("LÄUFER Absturz ohne Ausgabe", e.gruen === false && e.exit === 3 && /Urteil warf/.test(e.grund), JSON.stringify(e));
    e = await fahreStation({ ...st0, minuten: 0.01, befehl: ["node", "-e", "setTimeout(()=>{}, 60000)"], urteil: () => ({ gruen: true, zahl: "still" }) }, ctx("deckel"));
    pruef("LÄUFER Deckel", e.gruen === false && /Deckel/.test(e.grund), JSON.stringify(e));
    e = await fahreStation({ ...st0, env: { LINSE_GPU: "hardware" }, befehl: ["node", "-e", "console.log(process.env.LINSE_GPU)"], urteil: (j, l) => ({ gruen: true, zahl: l.stdout.trim() || "leer" }) }, ctx("karte"));
    const e2 = await fahreStation({ ...st0, befehl: ["node", "-e", "console.log(process.env.LINSE_GPU)"], urteil: (j, l) => ({ gruen: l.stdout.trim() === "software", zahl: l.stdout.trim() || "leer" }) }, ctx("soft"));
    pruef("LÄUFER headless fährt LINSE_GPU=software, nie die Karte", e.gruen === false && /LINSE_GPU=software/.test(e.grund) && e2.gruen === true, JSON.stringify([e, e2]));
    e = await fahreStation({ ...st0, urteil: () => ({ gruen: 1, zahl: "" }) }, ctx("ungueltig"));
    pruef("LÄUFER Urteil ungültig", e.gruen === false && /Urteil ungültig/.test(e.grund), JSON.stringify(e));
    e = await fahreStation({ ...st0, geraet: "radeon", gpu: true, befehl: schreib({ n: 0 }), urteil: lies }, ctx("ohne-schloss"));
    pruef("LÄUFER GPU ohne Schloss läuft nie", e.gruen === false && /gpu-lauf.sh fehlt/.test(e.grund) && !fs.existsSync(path.join(tmp, "ohne-schloss.json")), JSON.stringify(e));
    if (findeBash()) {
        const falsch = path.join(tmp, "gpu-lauf.sh");
        fs.writeFileSync(falsch, '#!/bin/bash\nN="$1"; shift\necho "schloss $N $GPU_LAUF_MAX_S"\n"$@"\n');
        const c = { ...ctx("schloss"), gpuLauf: falsch };
        e = await fahreStation({ ...st0, geraet: "radeon", gpu: true, befehl: schreib({ n: 0 }), urteil: (j, l) => ({ gruen: j.n === 0 && /schloss punkte-radeon 120/.test(l.stdout), zahl: l.stdout.trim().split("\n")[0] }) }, { ...c, deckelMinS: 120 });
        pruef("LÄUFER GPU über das Schloss", e.gruen === true, JSON.stringify(e));
        const c2 = { ...ctx("blockiert"), gpuLauf: path.join(tmp, "blockiert.sh") };
        fs.writeFileSync(c2.gpuLauf, "#!/bin/bash\necho SCHLOSS BLOCKIERT\nexit 75\n");
        e = await fahreStation({ ...st0, geraet: "radeon", gpu: true, urteil: () => ({ gruen: true, zahl: "x" }) }, c2);
        pruef("LÄUFER GPU-Schloss blockiert", e.gruen === false && /Schloss blockiert/.test(e.grund), JSON.stringify(e));
    } else pruef("LÄUFER GPU über das Schloss", false, "keine Git-bash");
    // (4) Glob
    const gl = [["stamm/kreatur-leben.js", ["stamm/kreatur-*.js"], true], ["stamm/x/kreatur-a.js", ["stamm/kreatur-*.js"], false],
        ["scripts/lib/a/b.cjs", ["scripts/**"], true], ["koerper-core.js", ["koerper-core.js"], true], ["koerper-core.jsx", ["koerper-core.js"], false],
        ["worlds/klang/a.js", ["worlds/klang/"], true], ["stamm/a.js", ["**/a.js"], true]];
    pruef("GLOB Abgleich", gl.every(([f, p, s]) => trifftPfad(f, p) === s), gl.filter(([f, p, s]) => trifftPfad(f, p) !== s).map((x) => x[0]).join(", "));
    // (5) Buchung
    const h = "hilfe";
    const s1 = { ...st0, geraet: ["radeon", "gtx"], gpu: true, pfad: ["stamm/wasser-*.js"] };
    const s2 = { ...s1, staffel: 2, quelle: "2 = überall, dazu endet jeder Lauf in See oder Meer" };
    const M = (sha, g, id, st, gruen, zeit = "2026-10-23T10:00:00Z") => ({ sha, geraet: g, je: { [id]: { gruen, zahl: gruen ? "z" : "rot", zeit, abdruck: abdruck(st, h) } } });
    const keine = () => [];
    let b = buchen("kopf", [s1, s2], [M("a1", "radeon", "gelaende.K4#1", s1, true)], keine, h);
    pruef("BUCHUNG 1 Gerät → 1", b.je["gelaende.K4"].punkte === 1, b.je["gelaende.K4"].beleg);
    b = buchen("kopf", [s1, s2], [M("a1", "radeon", "gelaende.K4#1", s1, true), M("a1", "radeon", "gelaende.K4#2", s2, true)], keine, h);
    pruef("BUCHUNG Staffel 2 nur Radeon → 1", b.je["gelaende.K4"].punkte === 1, b.je["gelaende.K4"].beleg);
    const m2 = [M("a1", "radeon", "gelaende.K4#1", s1, true), M("a1", "radeon", "gelaende.K4#2", s2, true), M("b2", "gtx", "gelaende.K4#2", s2, true)];
    b = buchen("kopf", [s1, s2], m2, keine, h);
    pruef("BUCHUNG 2 Geräte → 2", b.je["gelaende.K4"].punkte === 2, b.je["gelaende.K4"].beleg);
    b = buchen("kopf", [s1, s2], m2, (sha) => (sha === "b2" ? ["stamm/wasser-hydro.js"] : ["docs/x.md"]), h);
    pruef("BUCHUNG R6 Pfad geändert → GTX alt → 1", b.je["gelaende.K4"].punkte === 1 && /R6/.test(b.je["gelaende.K4"].beleg), b.je["gelaende.K4"].beleg);
    b = buchen("kopf", [s1, s2], m2, () => ["stamm/klang.js", "README.md"], h);
    pruef("BUCHUNG R6 fremde Datei → bleibt 2", b.je["gelaende.K4"].punkte === 2, b.je["gelaende.K4"].beleg);
    b = buchen("kopf", [s1, s2], m2, (sha) => { if (sha === "a1") throw new Error("unbekannt"); return []; }, h);
    pruef("BUCHUNG SHA unbekannt → 0", b.je["gelaende.K4"].punkte === 0 && /SHA unbekannt/.test(b.je["gelaende.K4"].beleg), b.je["gelaende.K4"].beleg);
    b = buchen("kopf", [s1], [M("a1", "radeon", "gelaende.K4#1", s1, true, "2026-10-23T09:00:00Z"), M("c3", "radeon", "gelaende.K4#1", s1, false, "2026-10-23T11:00:00Z")], keine, h);
    pruef("BUCHUNG jüngeres ROT schlägt älteres GRÜN → 0", b.je["gelaende.K4"].punkte === 0, b.je["gelaende.K4"].beleg);
    b = buchen("kopf", [{ ...s1, befehl: ["node", "-e", "1"] }], [M("a1", "radeon", "gelaende.K4#1", s1, true)], keine, h);
    pruef("BUCHUNG Station geändert → alte Messung zählt nicht", b.je["gelaende.K4"].punkte === 0 && /Station seit der Messung geändert/.test(b.je["gelaende.K4"].beleg), b.je["gelaende.K4"].beleg);
    b = buchen("kopf", [s1], [], keine, h);
    pruef("BUCHUNG ungemessen → 0 (R10)", b.je["gelaende.K4"].punkte === 0 && /R10/.test(b.je["gelaende.K4"].beleg), b.je["gelaende.K4"].beleg);
    b = buchen("kopf", [s1, s2], [M("a1", "radeon", "gelaende.K4#2", s2, true), M("b2", "gtx", "gelaende.K4#2", s2, true)], keine, h);
    pruef("BUCHUNG Staffel 2 grün ohne Staffel 1 → 0", b.je["gelaende.K4"].punkte === 0, b.je["gelaende.K4"].beleg);
    // (6) Übergang in gen.cjs
    const stand = { kopf: "abcd1234", je: { "gelaende.K4": { punkte: 2, beleg: "Maschine: z" } } };
    const k0 = { name: "n", punkte: 1, beleg: "Hand" };
    const k1 = maschinenKriterium(stand, "gelaende", 3, k0), k2 = maschinenKriterium(stand, "gelaende", 1, k0);
    pruef("GEN registriert → Maschine, sonst Hand", k1.punkte === 2 && k1.maschine && k1.beleg === "Maschine: z" && k2 === k0, JSON.stringify([k1, k2]));
    const pf = standPruefen(stand, "ffff0000", new Set(["gelaende.K4"]));
    pruef("GEN Kopf ungleich ist ROT", pf.some((f) => /Kopf abcd1234/.test(f)), pf.join(" | "));
    pruef("GEN unbekanntes Kriterium ist ROT", standPruefen({ kopf: "abcd1234", je: { "x.K1": {} } }, "abcd1234", new Set()).length === 1);
    fs.rmSync(tmp, { recursive: true, force: true });
    const rot = fall.filter((f) => !f.ok);
    console.log((rot.length ? "SELBSTTEST ROT — " + rot.map((f) => f.name).join(", ") : "SELBSTTEST GRÜN") + " (" + (fall.length - rot.length) + "/" + fall.length + ")");
    return rot.length ? 1 : 0;
}

// ───────────────────────────────── CLI ─────────────────────────────────
function opts(argv) {
    const o = {};
    for (let i = 0; i < argv.length; i++) if (argv[i].startsWith("--")) {
        const k = argv[i].slice(2).replace(/-([a-z])/g, (_, c) => c.toUpperCase());
        o[k] = argv[i + 1] && !argv[i + 1].startsWith("--") ? argv[++i] : true;
    }
    return o;
}

if (require.main === module) {
    const [verb, ...rest] = process.argv.slice(2);
    const o = opts(rest);
    (async () => {
        if (verb === "run") await run(o);
        else if (verb === "buchen") buchenCli(o);
        else if (verb === "liste") {
            const { stationen, fehler, fehlt } = ladeGeprueft();
            for (const st of stationen) console.log("  " + schluessel(st) + " · " + geraeteVon(st).join("+") + (st.gpu ? " · GPU" : "") + " · " + st.minuten + " min · " + st.befehl.join(" ") + " · " + abdruck(st));
            for (const e of fehlt) console.log("  FEHLT " + e.kriterium + "#" + e.staffel + " · " + String(e.grund).slice(0, 140));
            for (const f of fehler) console.log("  ROT " + f);
            console.log(stationen.length + " Stationen · " + new Set(stationen.map((s) => s.kriterium)).size + " Kriterien · fehlt " + fehlt.length + " · Fehler " + fehler.length);
            process.exitCode = fehler.length ? 1 : 0;
        } else if (verb === "selbsttest") process.exitCode = await selbsttest();
        else {
            console.log("Verben: run --sha <sha> --geraet radeon|gtx|headless [--nur id,id] [--port-basis 7700] · buchen --kopf <sha> · liste · selbsttest");
            process.exitCode = 2;
        }
    })().catch((e) => {
        console.error("PUNKTE ROT: " + (e && e.message));
        process.exitCode = 2;
    });
}

module.exports = { liesStand, maschinenKriterium, standPruefen, buchen, pruefeStationen, trifftPfad, abdruck };
