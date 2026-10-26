#!/usr/bin/env node
// DIE PUNKTE-MASCHINE der Meisterkarte: die Punkte eines Kriteriums sind eine FUNKTION DES SHA, gerechnet wie die CI —
// keine Sitzung misst und bucht mehr von Hand, was hier registriert ist.
//
//   node punkte.cjs run --sha <sha> --geraet radeon|gtx|headless [--nur id,id] [--port-basis 7700]
//        fährt jede Station des Geräts im Spiel-Baum am SHA, schreibt messung/<sha8>-<geraet>.json
//        --offen: nur die Stationen ohne frische Messung am SHA (das Frische-Urteil der Buchung) · --trocken: nur nennen
//        Zwillinge (gleicher Befehl und Umgebung) fahren EINMAL; headless bis zu 3 Bahnen in eigenen Bäumen (--bahnen N)
//   node punkte.cjs buchen --kopf <sha>
//        liest alle messung/*.json, urteilt R6 (Pfad unberührt seit der Messung) und R10, schreibt stand.json
//   node punkte.cjs liste [--kopf <sha>]   die registrierten Stationen, geprüft gegen src/gN.js und jeder pfad-Glob gegen den
//        Kopf (sonst origin/main des Spiel-Klons)
//   node punkte.cjs gtx-nutzen --kopf <sha>   die GTX-Stationen, deren Messung am Kopf Punkte ändern kann (nur=… für die OMEN)
//   node punkte.cjs plan --kopf <neu> --vorher <alt>   der Mess-Plan nach einem Zug: je GPU-Gerät die Stationen, die Punkte halten
//        oder gewinnen können (Staffel 1 auf EINEM Gerät, Zeit-Stationen auf der GTX, rote ohne Heil-Versuch nie)
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
// der Station gleicht und deren KONSUM (konsum-zeuge.cjs, sonst ihr Pfad-Glob) zwischen Mess-SHA und Kopf in Welt-Bytes
// unberührt ist (weltDiff, Abschnitt Konsum). 1 = jede
// Staffel-1-Station auf mindestens einem ihrer Geräte grün · 2 = dazu jede Staffel-2-Station auf JEDEM ihrer Geräte grün ·
// sonst 0. Ein jüngeres ROT schlägt ein älteres GRÜN; ungemessen ist 0.
// ZWEI WÄNDE (24.10., Prüfung der Buchung 61 → 80): (PFAD) jeder `pfad`-Glob trifft am Mess-SHA und am Kopf mindestens eine
// Datei, sonst ist die Station ROT — ein toter Glob macht R6 blind (die KAMPF-Liste nannte einen Schmiede-Kern, den es nicht gab);
// (GPU) eine GPU-Station zählt nur, wenn ihr Lauf beweist, dass eine Linse auf der Karte zeichnete: ein Adapter eines Herstellers
// in `[linse-gpu]` und keine Weiche „zeichnet nie“ (leib.K4#1 war als GPU gebucht, die Linse zeichnete nie — welt-boot
// „das Rezept ist null“). Den Zeugen sammelt gpu-zeuge.cjs aus jedem node-Prozess der Station; eine ältere Messung ohne ihn
// zeugt nur über ihre Roh-Ausgabe (messung/roh), sonst ist sie ungemessen.
"use strict";
const fs = require("fs");
const os = require("os");
const path = require("path");
const crypto = require("crypto");
const zlib = require("zlib");
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
// DIE WAND PFAD: die Globs der Station, die in `dateien` (git ls-tree am SHA) keine Datei treffen
const toteGlobs = (pfad, dateien) => pfad.filter((g) => { const re = globRegex(g); return !dateien.some((f) => re.test(f)); });
const pfadGrund = (tot, wo) => "pfad-Glob trifft " + wo + " keine Datei (R6 blind): " + tot.join(", ");

// ───────────────────────────────── Zeuge der Karte (Wand GPU) ─────────────────────────────────
const ZEUGE_DATEI = path.join(DIR, "gpu-zeuge.cjs");
const KARTE = /^\[linse-gpu\] ((?:amd|nvidia|intel|apple|qualcomm|arm)\/\S+)/i;
const OHNE_KARTE = /^\[linse-gpu\] .*(swiftshader|llvmpipe|software|kein navigator\.gpu|kein Adapter|kein webgl2)/i;
// liest die Zeilen eines Laufs (stdout, stderr, Zeugen-Datei oder Roh-Ausgabe): { karte, fremd, nie }
function gpuZeuge(text) {
    const z = String(text || "").split(/\r?\n/);
    const karten = [...new Set(z.map((l) => (KARTE.exec(l) || [])[1]).filter(Boolean))];
    const fremd = [...new Set(z.filter((l) => OHNE_KARTE.test(l)).map((l) => l.slice(12).trim()))];
    const nie = new Set(z.filter((l) => /^\[welt-boot\] FEHLER klasse:.*zeichnet nie/.test(l))).size; // je Linse EINE Zeile, wie oft gesammelt auch
    return { karte: karten.join(" ") || null, fremd: fremd.join(" ") || null, nie };
}
// null = die Linse zeichnete auf der Karte, sonst der Grund beim Namen
function gpuWand(z) {
    if (!z) return "kein Zeuge der Karte im Lauf";
    if (z.nie) return "die Linse zeichnet nie (welt-boot: das Rezept ist „null“, " + z.nie + "×)";
    if (z.fremd) return "eine Linse zeichnet ohne Karte ([linse-gpu] " + z.fremd + ")";
    if (!z.karte) return "keine Linse nennt eine Karte ([linse-gpu] <Hersteller>/…)";
    return null;
}

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
    return fahreGruppe([st], ctx).then((r) => r[0]);
}
// fährt den Befehl der ERSTEN Station EINMAL und urteilt jede Station der Gruppe über denselben Lauf — Zwillinge (gleicher
// Befehl, gleiche Umgebung, z. B. Staffel 1 und 2 aus EINER Linse) kosten nie zwei Läufe; Rückgabe je Station ein Ergebnis
function fahreGruppe(sts, ctx) {
    const st = sts[0];
    return new Promise((ganz) => {
        const t0 = Date.now();
        const min = () => +((Date.now() - t0) / 60000).toFixed(2);
        const fertig = (e) => ganz(sts.map(() => e));
        const rot = (grund, exit = null, zahl = "") => fertig({ gruen: false, zahl: zahl || grund, exit, minuten: min(), grund });
        const deckelS = Math.max(ctx.deckelMinS != null ? ctx.deckelMinS : 120, Math.ceil(st.minuten * 60 * 2));
        let argv = st.befehl.map((a) => ersetze(a, ctx));
        const env = { ...process.env };
        // headless läuft ohne Karte: starteBrowser griffe lokal sonst die GPU (scripts/lib/software-gpu.cjs) — ohne Schloss
    if (!st.gpu) env.LINSE_GPU = "software";
    for (const [k, v] of Object.entries(st.env || {})) env[k] = ersetze(v, ctx);
    if (!st.gpu && env.LINSE_GPU !== "software") return rot("headless verlangt LINSE_GPU=software — die Karte nur unter dem Schloss");
        const konsumOrdner = konsumAn(env, ctx);
        let exe;
        let warteS = 0;
        if (argv[0] === "node") exe = process.execPath;
        else {
            exe = ctx.bash;
            if (!exe) return rot("keine Git-bash gefunden (PUNKTE_BASH)");
        }
        argv = argv.slice(1);
        const zeugeDatei = st.gpu ? ctx.aus + ".gpu-zeuge.txt" : null;
        if (st.gpu) {
            if (!ctx.gpuLauf || !fs.existsSync(ctx.gpuLauf)) return rot("gpu-lauf.sh fehlt — eine GPU-Station läuft nie ohne Schloss");
            if (!ctx.bash) return rot("keine Git-bash gefunden (PUNKTE_BASH) für gpu-lauf.sh");
            argv = [ctx.gpuLauf, "punkte-" + ctx.geraet, exe, ...argv];
            exe = ctx.bash;
            env.GPU_LAUF_MAX_S = String(deckelS);
            warteS = Number(env.GPU_LAUF_WARTE_S || SCHLOSS_WARTE_S);
            // der Zeuge der Karte in JEDEM node-Prozess der Station (die Werkbank schreibt in ihr eigenes Log)
            env.PUNKTE_GPU_ZEUGE = zeugeDatei;
            env.NODE_OPTIONS = ((env.NODE_OPTIONS || "") + ' --require "' + ZEUGE_DATEI.split(path.sep).join("/") + '"').trim();
        }
        try { fs.rmSync(ctx.aus, { force: true }); } catch (_e) {}
        if (zeugeDatei) try { fs.rmSync(zeugeDatei, { force: true }); } catch (_e) {}
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
        // das Ende der Station ist das Ende ihres Prozesses, nie das Schließen der Rohre: ein Enkel, der sie erbt (der Herzschlag
        // `while sleep 300` in gpu-lauf.sh der OMEN), hielte "close" bis zu seinem Erwachen — 26.10.: jede GTX-Station dauerte
        // k × 5 min (fahrzeug.K3#1 5,02 gegen 1,07 auf der Radeon); nach "exit" bleiben den Rohren 2 s zum Leerlaufen
        let gemeldet = false;
        const ende = (code, sig) => {
            if (gemeldet) return;
            gemeldet = true;
            kind.stdout.destroy();
            kind.stderr.destroy();
            abschluss(code, sig);
        };
        kind.on("exit", (code, sig) => setTimeout(() => ende(code, sig), 2000));
        kind.on("close", ende);
        const abschluss = (code, sig) => {
            clearTimeout(uhr);
            portRaeumen(ctx.port);
            // die Zeugen-Zeilen gehen in die Roh-Ausgabe (die Buchung liest sie dort), die Datei fällt
            const zeugeText = zeugeDatei && fs.existsSync(zeugeDatei) ? fs.readFileSync(zeugeDatei, "utf8") : "";
            if (zeugeDatei) try { fs.rmSync(zeugeDatei, { force: true }); } catch (_e) {}
            if (ctx.roh) {
                fs.mkdirSync(path.dirname(ctx.roh), { recursive: true });
                fs.writeFileSync(ctx.roh, "$ " + [exe, ...argv].join(" ") + "\n" + out + (err ? "\n--- stderr ---\n" + err : "") +
                    (zeugeText ? "\n--- gpu-zeuge ---\n" + zeugeText : ""));
            }
            if (tot) return rot("Deckel " + (deckelS + warteS) + " s überschritten — beendet", code);
            if (sig) return rot("Absturz: Signal " + sig, code);
            if (st.gpu && code === 75) return rot("GPU-Schloss blockiert (gpu-lauf.sh Exit 75)", code);
            if (st.gpu && code === 124) return rot("GPU-Deckel " + deckelS + " s (gpu-lauf.sh Exit 124)", code);
            let j = null;
            if (fs.existsSync(ctx.aus))
                try { j = JSON.parse(fs.readFileSync(ctx.aus, "utf8")); } catch (_e) { j = null; }
            const m = min();
            // DIE WAND GPU: ohne Zeugen der Karte ist das Urteil einer GPU-Station ROT beim Grund
            const zeuge = st.gpu ? gpuZeuge(zeugeText + "\n" + out + "\n" + err) : null;
            const wand = zeuge && gpuWand(zeuge);
            const gz = zeuge ? { gpu: zeuge.karte, ...(zeuge.fremd ? { gpuFremd: zeuge.fremd } : {}), ...(zeuge.nie ? { gpuNie: zeuge.nie } : {}) } : {};
            const kz = konsumFalten(konsumOrdner, ctx.baum);
            ganz(sts.map((s) => {
                const r = (grund) => ({ gruen: false, zahl: grund, exit: code, minuten: m, grund, ...gz });
                let u;
                try {
                    u = s.urteil(j, { exit: code, stdout: out, stderr: err });
                } catch (e) {
                    return r("Urteil warf: " + String((e && e.message) || e).split("\n")[0]);
                }
                if (!u || typeof u.gruen !== "boolean" || typeof u.zahl !== "string" || !u.zahl)
                    return r("Urteil ungültig (verlangt { gruen: bool, zahl: Text })");
                if (wand) return { gruen: false, zahl: "Wand GPU: " + wand + " · " + u.zahl, exit: code, minuten: m, grund: "Wand GPU: " + wand, ...gz };
                return { gruen: u.gruen, zahl: u.zahl, exit: code, minuten: m, ...(u.gruen ? {} : { grund: "ROT: " + u.zahl }), ...gz };
            }).map((e) => ({ ...e, ...kz })));
        };
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

// die Sperre des Spiel-Baums: ein Ordner mit der pid des Halters; eine tote pid gilt als verwaist, gelöst wird beim Prozess-Ende
async function baumSperre(repo, geraet) {
    const sperre = path.join(repo, ".claude", "worktrees", "punkte-" + geraet + ".sperre");
    const lebt = (pid) => { try { process.kill(pid, 0); return true; } catch (e) { return e.code === "EPERM"; } };
    for (let gemeldet = false; ; ) {
        try {
            fs.mkdirSync(sperre);
            fs.writeFileSync(path.join(sperre, "pid"), String(process.pid));
            process.on("exit", () => fs.rmSync(sperre, { recursive: true, force: true }));
            return;
        } catch (e) {
            if (e.code !== "EEXIST") throw e;
            const pid = Number((fs.existsSync(path.join(sperre, "pid")) && fs.readFileSync(path.join(sperre, "pid"), "utf8")) || 0);
            if (pid && !lebt(pid)) { fs.rmSync(sperre, { recursive: true, force: true }); continue; }
            if (!gemeldet) { console.log("Punkte-Maschine: der Spiel-Baum " + geraet + " ist belegt (pid " + pid + "), warte"); gemeldet = true; }
            await new Promise((r) => setTimeout(r, 30000));
        }
    }
}

const messDatei = (sha, geraet, mdir = path.join(DIR, "messung")) => path.join(mdir, sha.slice(0, 8) + "-" + geraet + ".json");
// die Dateien am Stand (Wand PFAD)
const dateienAm = (repo, sha) => git(["ls-tree", "-r", "--name-only", sha], repo).split(/\r?\n/).filter(Boolean);
// die Roh-Ausgabe einer Messung (Wand GPU für Messungen ohne eigenen Zeugen); "" wenn keine
const rohAus = (mdir = path.join(DIR, "messung")) => (sha, g, id) => {
    const f = path.join(mdir, "roh", String(sha).slice(0, 8) + "-" + g, id.replace("#", "_") + ".out");
    return fs.existsSync(f) ? fs.readFileSync(f, "utf8") : "";
};

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
    let meine = stationen.filter((st) => geraeteVon(st).includes(opt.geraet) && (!nur || nur.has(schluessel(st))));
    if (nur) for (const id of nur) if (!meine.some((st) => schluessel(st) === id)) throw new Error("--nur " + id + ": keine Station auf " + opt.geraet);
    if (!meine.length) throw new Error("keine Station auf " + opt.geraet);
    const repo = spielRepo();
    const sha = voll(repo, opt.sha);
    const dateien = dateienAm(repo, sha);
    const tot = (st) => toteGlobs(st.pfad, dateien);
    // --offen: nur die Stationen, die die Buchung am SHA nicht frisch fände — ein Zug misst, was er berührt, nie die ganze Liste
    if (opt.offen) {
        const frisch = frischUrteil(ladeMessungen(), (s) =>
            weltDiff(git(["diff", "--no-renames", "--name-only", s, sha], repo), git(["diff", "--no-renames", "-U0", "--no-color", s, sha], repo)), hilfeText(),
            { tot, roh: rohAus() });
        meine = meine.filter((st) => frisch(st, opt.geraet).ungemessen);
        if (!meine.length) {
            console.log("Punkte-Maschine: am " + sha.slice(0, 8) + " ist jede Station auf " + opt.geraet + " frisch gemessen");
            return null;
        }
    }
    if (opt.trocken) {
        console.log("Punkte-Maschine (trocken): " + meine.length + " Station(en) auf " + opt.geraet + " am " + sha.slice(0, 8) + ", " +
            meine.reduce((s, st) => s + (st.minuten || 0), 0) + " min: " + meine.map(schluessel).join(" "));
        return null;
    }
    // EIN Lauf je Spiel-Baum: ein zweiter Lauf auf demselben Gerät checkte sonst seinen SHA in den Baum des ersten
    await baumSperre(repo, opt.geraet);
    const baum = baumAmSha(repo, opt.geraet, sha);
    const datei = messDatei(sha, opt.geraet);
    const rohDir = path.join(DIR, "messung", "roh", sha.slice(0, 8) + "-" + opt.geraet);
    let m = fs.existsSync(datei) ? JSON.parse(fs.readFileSync(datei, "utf8")) : null;
    if (!m || m.sha !== sha) m = { sha, geraet: opt.geraet, zeit: null, host: os.hostname(), je: {} };
    const hilfe = hilfeText();
    // DIE WAND PFAD: eine Station mit totem Glob am SHA fährt nie — sie ist ROT beim Glob (R6 wäre für ihn blind)
    for (const st of meine.filter((s) => tot(s).length)) {
        const grund = pfadGrund(tot(st), "am " + sha.slice(0, 8));
        m.je[schluessel(st)] = { gruen: false, zahl: grund, exit: null, minuten: 0, grund, zeit: new Date().toISOString(), abdruck: abdruck(st, hilfe) };
        console.log("  ROT  " + schluessel(st) + " · " + grund);
    }
    meine = meine.filter((s) => !tot(s).length);
    if (!meine.length) {
        m.zeit = new Date().toISOString();
        fs.writeFileSync(datei, JSON.stringify(m, null, 1) + "\n");
        return m;
    }
    const ctx0 = { baum, koord: KOORD, geraet: opt.geraet, bash: findeBash(),
        gpuLauf: process.env.PUNKTE_GPU_LAUF || path.join(repo, "artifacts", "profiband", "werkzeug", "gpu-lauf.sh") };
    // Zwillinge (gleicher Befehl, gleiche Umgebung) fahren EINMAL; headless fahren bis zu drei Gruppen zugleich, jede Bahn im
    // EIGENEN Spiel-Baum (Spielstände, Rohdateien), eine GPU-Station wartet ohnehin am Schloss — dort EINE Bahn
    const gruppen = [];
    const je = new Map();
    for (const st of meine) {
        const k = JSON.stringify([st.befehl, st.env || {}, !!st.gpu]);
        if (!je.has(k)) { je.set(k, []); gruppen.push(je.get(k)); }
        je.get(k).push(st);
    }
    const bahnen = Math.max(1, Math.min(gruppen.length, Number(opt.bahnen || (opt.geraet === "headless" ? 3 : 1))));
    const baeume = [baum];
    for (let i = 2; i <= bahnen; i++) baeume.push(baumAmSha(repo, opt.geraet + "-" + i, sha));
    console.log("Punkte-Maschine: " + meine.length + " Station(en) in " + gruppen.length + " Läufen auf " + opt.geraet + " am " +
        sha.slice(0, 8) + ", " + bahnen + " Bahn(en) (Baum " + baeume.join(", ") + ")");
    fs.mkdirSync(rohDir, { recursive: true });
    const schlange = gruppen.slice();
    const bahn = async (b) => {
        for (let g = schlange.shift(); g; g = schlange.shift()) {
            const ids = g.map(schluessel);
            const ctx = { ...ctx0, baum: b, port: ports.get(ids[0]), aus: path.join(rohDir, ids[0].replace("#", "_") + ".json"),
                roh: path.join(rohDir, ids[0].replace("#", "_") + ".out") };
            const zeit = new Date().toISOString();
            const es = await fahreGruppe(g, ctx);
            g.forEach((st, i) => {
                const id = ids[i];
                if (i > 0 && fs.existsSync(ctx.roh)) fs.copyFileSync(ctx.roh, path.join(rohDir, id.replace("#", "_") + ".out"));
                m.je[id] = { ...es[i], zeit, abdruck: abdruck(st, hilfe), port: ctx.port, ...(i > 0 ? { zwilling: ids[0] } : {}) };
                console.log("  " + (es[i].gruen ? "GRÜN" : "ROT ") + " " + id + " · " + es[i].zahl + " · Exit " + es[i].exit + " · " +
                    es[i].minuten + " min" + (i > 0 ? " (Zwilling von " + ids[0] + ")" : ""));
            });
            m.zeit = zeit;
            m.host = os.hostname();
            fs.writeFileSync(datei, JSON.stringify(m, null, 1) + "\n");
        }
    };
    await Promise.all(baeume.map((b) => bahn(b)));
    console.log("→ " + path.relative(KOORD, datei));
    return m;
}

// ───────────────────────────────── Buchung ─────────────────────────────────
// messungen: Liste {sha, geraet, je}; geaendert(messSha) → Liste der Dateien bis zum Kopf (wirft, wenn unbekannt)
// die jüngste frische Messung je Station und Gerät (Abdruck gleich, Pfad seit der Messung in Welt-Bytes unberührt) — das EINE
// Frische-Urteil für die Buchung und für `run --offen`. opt.tot(st) → die toten Globs am Ziel-Stand (Wand PFAD) · opt.roh(sha,
// geraet, id) → die Roh-Ausgabe einer Messung ohne eigenen Zeugen (Wand GPU; "" wenn keine)
function frischUrteil(messungen, geaendert, hilfe = hilfeText(), opt = {}) {
    const diffCache = new Map();
    const diff = (sha) => {
        if (!diffCache.has(sha)) {
            try { const g = geaendert(sha); diffCache.set(sha, Array.isArray(g) ? { dateien: g } : g); } catch (e) { diffCache.set(sha, { fehler: e.message }); }
        }
        return diffCache.get(sha);
    };
    return (st, g) => {
        const id = schluessel(st);
        const tot = opt.tot ? opt.tot(st) : [];
        if (tot.length) return { gruen: false, ungemessen: true, grund: pfadGrund(tot, "am Kopf") };
        const ab = abdruck(st, hilfe);
        let alt = 0, fremd = 0, unbekannt = 0, ohneZeugen = null, taeter = [], altWas = "Pfad";
        const frisch = [];
        for (const m of messungen) {
            if (m.geraet !== g || !m.je || !m.je[id]) continue;
            const e = m.je[id];
            if (e.abdruck !== ab) { fremd++; continue; }
            const d = diff(m.sha);
            if (d.fehler) { unbekannt++; continue; }
            // R6 nach KONSUM, wo die Messung ihn trägt (eine Welt-Zeile in einer ausgeführten Spanne, eine gelesene Datei), sonst
            // nach dem Pfad-Glob der Station (Mischbetrieb)
            const t = e.konsum ? konsumTreffer(konsumVon(e.konsum), d) : d.dateien.filter((f) => trifftPfad(f, st.pfad));
            if (t.length) { alt++; taeter = t; altWas = e.konsum ? "Konsum" : "Pfad"; continue; }
            // ein GRÜN einer GPU-Station trägt den Zeugen der Karte: im Eintrag (seit der Wand) oder in seiner Roh-Ausgabe
            if (st.gpu && e.gruen) {
                const z = "gpu" in e ? { karte: e.gpu, fremd: e.gpuFremd || null, nie: e.gpuNie || 0 } : gpuZeuge(opt.roh ? opt.roh(m.sha, g, id) : "");
                const w = gpuWand(z);
                if (w) { ohneZeugen = w; continue; }
            }
            frisch.push({ ...e, sha: m.sha, geraet: g });
        }
        frisch.sort((a, b) => String(b.zeit).localeCompare(String(a.zeit)));
        if (frisch.length) return frisch[0];
        // der Grund der jüngsten verworfenen Art zuerst: ein GRÜN ohne Zeugen vor dem R6 einer älteren Messung
        return { gruen: false, ungemessen: true, grund: ohneZeugen ? "Wand GPU: " + ohneZeugen : alt ? altWas + " seit der Messung geändert (R6: " + taeter.slice(0, 3).join(", ") + (taeter.length > 3 ? " +" + (taeter.length - 3) : "") + ")" : unbekannt ? "Mess-SHA unbekannt — kein R6-Urteil" : fremd ? "Station seit der Messung geändert" : "ungemessen (R10)" };
    };
}

function buchen(kopf, stationen, messungen, geaendert, hilfe = hilfeText(), fehlt = [], opt = {}) {
    const stand = frischUrteil(messungen, geaendert, hilfe, opt);
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
// namen: git diff --no-renames --name-only · diffText: git diff --no-renames -U0 über dieselben Stände → { dateien: die Dateien,
// deren Welt-Bytes sich änderten · zeilen: je Datei die geänderten Zeilen am Mess-SHA [von, bis] (eine reine Einfügung nach
// Zeile a trifft a und a + 1; ein Hunk aus reinen Versions-Stempeln fällt) · neu: angelegte und gelöschte Dateien }
function weltDiff(namen, diffText) {
    const je = new Map();
    let cur = null, h = null;
    const hunkZu = () => {
        if (h && h.weg.sort().join("\n") !== h.neu.sort().join("\n")) cur.zeilen.push(h.alt);
        h = null;
    };
    for (const z of String(diffText).split("\n")) {
        const m = /^diff --git a\/(.+?) b\//.exec(z);
        if (m) {
            if (cur) hunkZu();
            cur = { weg: [], neu: [], bin: false, zeilen: [], angelegt: false };
            je.set(m[1], cur);
            continue;
        }
        if (!cur || z.startsWith("+++ ") || z.startsWith("--- ")) continue;
        const k = /^@@ -(\d+)(?:,(\d+))? /.exec(z);
        if (k) {
            hunkZu();
            const [a, n] = [+k[1], k[2] == null ? 1 : +k[2]];
            h = { weg: [], neu: [], alt: n ? [a, a + n - 1] : [Math.max(1, a), a + 1] };
        } else if (/^(new|deleted) file mode /.test(z)) cur.angelegt = true;
        else if (/^Binary files /.test(z)) cur.bin = true;
        else if (z[0] === "-" || z[0] === "+") {
            const t = ohneStempel(z.slice(1));
            (z[0] === "-" ? cur.weg : cur.neu).push(t);
            if (h) (z[0] === "-" ? h.weg : h.neu).push(t);
        }
    }
    if (cur) hunkZu();
    const dateien = String(namen).split("\n").filter(Boolean).filter((f) => {
        if (WERKZEUG_PFAD.test(f)) return false;
        const d = je.get(f);
        if (!d || d.bin) return true;
        return d.weg.sort().join("\n") !== d.neu.sort().join("\n");
    });
    const zeilen = new Map(dateien.filter((f) => je.has(f) && !je.get(f).bin).map((f) => [f, je.get(f).zeilen]));
    return { dateien, zeilen, neu: new Set(dateien.filter((f) => je.has(f) && je.get(f).angelegt)) };
}

// ───────────────────────────────── Konsum (R6) ─────────────────────────────────
// R6 NACH KONSUM (26.10., Karte r6-konsum: nach jedem Zug machten breite Pfad-Globs fast jede Messung alt — z39 33 von 45 Radeon-
// und 60 von 75 headless-Stationen —, die Messung dauerte 2–3 h, länger als das Bauen): der Zeuge konsum-zeuge.cjs fährt in
// jedem node-Prozess der Station, die Faltung legt seinen Konsum komprimiert in die Messung — je Datei die ausgeführten Zeilen
// am Mess-SHA ("3-40,52") oder "*" (ganz gelesen: Daten, Dokument, Text; ein Skript ohne Coverage) und je gelesenes
// Verzeichnis "pfad/" ("pfad/**" rekursiv). Eine Messung mit Konsum ist alt, wenn der Diff seit ihr eine Welt-Zeile in einer
// konsumierten Spanne ändert, eine ganz gelesene Datei ändert oder einem gelesenen Verzeichnis eine Datei gibt oder nimmt.
// Ohne Konsum (ein Prozess endete nicht, ältere Messungen) gilt der Pfad-Glob.
const KONSUM_ZEUGE = path.join(DIR, "konsum-zeuge.cjs");
function konsumAn(env, ctx) {
    const ordner = ctx.aus + ".konsum";
    fs.rmSync(ordner, { recursive: true, force: true });
    env.PUNKTE_KONSUM = ordner;
    env.PUNKTE_KONSUM_BAUM = ctx.baum;
    env.NODE_OPTIONS = ((env.NODE_OPTIONS || "") + ' --require "' + KONSUM_ZEUGE.split(path.sep).join("/") + '"').trim();
    return ordner;
}
// die Zeilen-Spannen der Zeichen-Bereiche [von, bis) im Text (1-basiert, verschmolzen): "3-40,52"
function zeilenSpannen(text, bereiche) {
    const start = [0];
    for (let i = 0; i < text.length; i++) if (text.charCodeAt(i) === 10) start.push(i + 1);
    const zeile = (o) => {
        let [lo, hi] = [0, start.length - 1];
        while (lo < hi) { const mi = (lo + hi + 1) >> 1; if (start[mi] <= o) lo = mi; else hi = mi - 1; }
        return lo + 1;
    };
    const sp = [];
    for (let [a, b] of bereiche.slice().sort((x, y) => x[0] - y[0])) {
        // nur sichtbare Zeichen tragen eine Zeile (der Zeilenumbruch nach der Klammer einer nie gerufenen Funktion nicht)
        while (a < b && /\s/.test(text[a])) a++;
        while (b > a && /\s/.test(text[b - 1])) b--;
        if (a >= b) continue;
        const [x, y] = [zeile(a), zeile(b - 1)];
        if (sp.length && x <= sp[sp.length - 1][1] + 1) sp[sp.length - 1][1] = Math.max(sp[sp.length - 1][1], y);
        else sp.push([x, y]);
    }
    return sp.map(([x, y]) => (x === y ? String(x) : x + "-" + y)).join(",");
}
// der Ordner des Zeugen → { konsum: base64(deflateRaw(JSON { pfad: Spannen | "*" })), konsumN } oder { konsumFehlt: Grund };
// der Inhalt jeder Datei aus dem Baum der Station (die ausgelieferten Bytes, am SHA)
function konsumFalten(ordner, baum) {
    try {
        if (!fs.existsSync(ordner)) return { konsumFehlt: "kein Prozess der Station trug den Zeugen" };
        const n = fs.readdirSync(ordner);
        const offen = n.filter((f) => f.endsWith(".offen")).length;
        if (offen) return { konsumFehlt: offen + " Prozess(e) ohne Ende — R6 nach Pfad" };
        const roh = n.filter((f) => f.endsWith(".json")).map((f) => JSON.parse(fs.readFileSync(path.join(ordner, f), "utf8")));
        if (!roh.length) return { konsumFehlt: "kein Prozess der Station trug den Zeugen" };
        const k = {};
        const js = new Map();
        for (const r of roh) {
            for (const p of r.ganz) k[p] = "*";
            for (const [p, e] of Object.entries(r.js)) {
                if (js.has(p) && js.get(p).len !== e.len) k[p] = "*";
                js.set(p, { len: e.len, bereiche: [...(js.has(p) ? js.get(p).bereiche : []), ...e.bereiche] });
            }
        }
        for (const r of roh) for (const p of r.geladen) if (p.endsWith("/") || p.endsWith("/**") || !js.has(p)) k[p] = "*";
        for (const [p, e] of js) {
            if (k[p]) continue;
            const text = fs.readFileSync(path.join(baum, p), "utf8");
            k[p] = text.length === e.len ? zeilenSpannen(text, e.bereiche) || "*" : "*";
        }
        for (const p of Object.keys(k)) if (WERKZEUG_PFAD.test(p)) delete k[p];
        return { konsum: zlib.deflateRawSync(JSON.stringify(k)).toString("base64"), konsumN: Object.keys(k).length };
    } catch (e) {
        return { konsumFehlt: "Faltung: " + e.message };
    } finally {
        fs.rmSync(ordner, { recursive: true, force: true });
    }
}
const konsumCache = new Map();
const konsumVon = (z) => {
    if (!konsumCache.has(z)) konsumCache.set(z, JSON.parse(zlib.inflateRawSync(Buffer.from(z, "base64")).toString("utf8")));
    return konsumCache.get(z);
};
// k: der entfaltete Konsum · d: { dateien, zeilen?, neu? } (ohne zeilen zählt jede konsumierte Datei ganz) → die Täter
function konsumTreffer(k, d) {
    const dirs = Object.keys(k).filter((p) => p.endsWith("/") || p.endsWith("/**"));
    return d.dateien.filter((f) => {
        const imDir = (p) => p.endsWith("/**") ? p === "./**" || f.startsWith(p.slice(0, -2)) : (f.includes("/") ? f.slice(0, f.lastIndexOf("/") + 1) : "./") === p;
        if (d.neu && d.neu.has(f) && dirs.some(imDir)) return true;
        const s = k[f];
        if (!s) return false;
        if (s === "*" || !d.zeilen || !d.zeilen.has(f)) return true;
        const sp = s.split(",").map((x) => x.split("-").map(Number)).map(([a, b = a]) => [a, b]);
        return d.zeilen.get(f).some(([a, b]) => sp.some(([x, y]) => a <= y && x <= b));
    });
}

// die GTX-Stationen, deren Messung am Kopf Punkte ändern KANN (26.10.: takt5z maß 43 Stationen in ~6 h, auch Staffel 1 hinter
// grüner Radeon): Staffel 1 nur, wo kein anderes Gerät grün ist; Staffel 2 nur, wo Staffel 1 steht und jedes andere Gerät grün ist
function gtxNutzen(s) {
    const ja = [], nein = [];
    for (const [k, e] of Object.entries(s.je)) {
        const ids = [...new Set(e.stationen.filter((x) => x.geraet === "gtx").map((x) => x.id))];
        const s1 = e.stationen.some((x) => x.id === k + "#1" && x.gruen);
        for (const id of ids) {
            const andere = e.stationen.filter((x) => x.id === id && x.geraet !== "gtx");
            const nutzt = id.endsWith("#1") ? !andere.some((x) => x.gruen) : s1 && andere.length > 0 && andere.every((x) => x.gruen);
            (nutzt ? ja : nein).push(id);
        }
    }
    return { ja: ja.sort(), nein: nein.sort() };
}

// DER MESS-PLAN nach einem Zug (26.10.: 10 h vom Landen bis zur Buchung, die Prüfung länger als das Bauen): je GPU-Station
// das, was Punkte halten oder gewinnen kann, am Ergebnis des VORIGEN Kopfs — Staffel 1 braucht EIN grünes Gerät (die
// Zeit-Station auf die ruhige GTX, sonst das Gerät, das grün war), Staffel 2 nur über stehender 1 und auf beiden Geräten;
// eine rote Station ohne Heil-Versuch (der Zug nennt ihr Kriterium nicht) bleibt rot und wird nicht gemessen.
// da(id, g): die JÜNGSTE Messung der Station auf dem Gerät über alle Köpfe (ihr Vorwissen), sonst null · genannt: Set der
// Kriterien, die die Commits seit dem vorigen Kopf nennen · zeit(id): die Station urteilt in ms (sie misst Takt, nie Bild)
function messPlan(stationen, da, genannt, zeit) {
    const plan = { radeon: [], gtx: [], uebersprungen: [] };
    for (const st of stationen) {
        const ge = geraeteVon(st).filter((g) => g === "radeon" || g === "gtx");
        if (!ge.length) continue;
        const id = schluessel(st), k = st.kriterium;
        const neu = ge.some((g) => !da(id, g));
        const heil = genannt.has(k) || neu;
        if (st.staffel === 1) {
            const gruen = ge.filter((g) => da(id, g) && da(id, g).gruen);
            if (gruen.length) plan[zeit(id) && gruen.includes("gtx") ? "gtx" : gruen.includes("radeon") ? "radeon" : "gtx"].push(id);
            else if (heil) for (const g of ge) plan[g].push(id);
            else plan.uebersprungen.push(id);
            continue;
        }
        const s1 = stationen.find((x) => x.kriterium === k && x.staffel === 1);
        const s1gruen = s1 && geraeteVon(s1).some((g) => da(schluessel(s1), g) && da(schluessel(s1), g).gruen);
        const allesGruen = ge.every((g) => da(id, g) && da(id, g).gruen);
        if ((s1gruen || genannt.has(k)) && (allesGruen || heil)) for (const g of ge) plan[g].push(id);
        else plan.uebersprungen.push(id);
    }
    return plan;
}

function planCli(opt) {
    if (!opt.kopf || !opt.vorher) throw new Error("plan --kopf <neu> --vorher <voriger Kopf>");
    const repo = spielRepo();
    const [neu, alt] = [voll(repo, opt.kopf), voll(repo, opt.vorher)];
    const { stationen } = ladeGeprueft();
    const juengste = {};
    for (const m of ladeMessungen())
        for (const [id, e] of Object.entries(m.je || {})) {
            const w = id + "|" + m.geraet;
            if (!juengste[w] || String(e.zeit) > String(juengste[w].zeit)) juengste[w] = e;
        }
    const ab = Object.fromEntries(stationen.map((st) => [schluessel(st), abdruck(st)]));
    const da = (id, g) => {
        const e = juengste[id + "|" + g];
        return e && (!e.abdruck || e.abdruck === ab[id]) ? e : null;
    };
    const genannt = new Set((git(["log", "--format=%B", alt + ".." + neu], repo).match(/\b[a-z]+\.K\d\b/g) || []));
    const zahlVon = (id) => ["radeon", "gtx"].map((g) => da(id, g) && da(id, g).zahl).find(Boolean) || "";
    const minVon = (id) => Math.max(0, ...["radeon", "gtx"].map((g) => (da(id, g) && da(id, g).minuten) || 0));
    const p = messPlan(stationen, da, genannt, (id) => /\bp\d\d\b.*\bms\b|\bms\b.*\bp\d\d\b/.test(zahlVon(id)));
    const sum = (ids) => Math.round(ids.reduce((a, id) => a + minVon(id), 0));
    console.log("MESS-PLAN " + neu.slice(0, 8) + " nach " + alt.slice(0, 8) + " · genannt: " + ([...genannt].join(" ") || "—"));
    for (const g of ["radeon", "gtx"]) console.log(g + " " + p[g].length + " Stationen ~" + sum(p[g]) + " min · nur=" + p[g].join(","));
    console.log("übersprungen " + p.uebersprungen.length + " (rot ohne Heil-Versuch oder Staffel 2 ohne stehende 1): " + p.uebersprungen.join(" "));
    return p;
}

function gtxNutzenCli(opt) {
    const s = buchenCli({ ...opt, trocken: true });
    const n = gtxNutzen(s);
    console.log("GTX-NUTZEN " + n.ja.length + " von " + (n.ja.length + n.nein.length) + " Stationen am " + s.kopf + " ändern Punkte");
    console.log("nur=" + n.ja.join(","));
    return n;
}

function buchenCli(opt) {
    if (!opt.kopf) throw new Error("--kopf fehlt");
    const { stationen, fehler, fehlt } = ladeGeprueft();
    if (fehler.length) throw new Error("Stationen ROT:\n - " + fehler.join("\n - "));
    const repo = spielRepo();
    const kopfVoll = voll(repo, opt.kopf);
    const dateien = dateienAm(repo, kopfVoll);
    const s = buchen(kopfVoll.slice(0, 8), stationen, ladeMessungen(), (sha) =>
        weltDiff(git(["diff", "--no-renames", "--name-only", sha, kopfVoll], repo), git(["diff", "--no-renames", "-U0", "--no-color", sha, kopfVoll], repo)),
        hilfeText(), fehlt, { tot: (st) => toteGlobs(st.pfad, dateien), roh: rohAus() });
    s.kopfVoll = kopfVoll;
    s.zeit = new Date().toISOString();
    if (opt.trocken) return s;
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
        const w = weltDiff(namen, dt).dateien.join(",");
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
    // ein Enkel erbt das Rohr und schläft 20 s (wie ein Herzschlag `( while sleep 300 … ) &` ohne Umleitung): die Station endet
    // mit ihrem Prozess (am alten Läufer: close nach 20,5 s, exit nach 0,46 s)
    e = await fahreStation({ ...st0, befehl: ["bash", "-c", "( sleep 20 ) & echo '{\"n\": 0}' > \"$1\"", "enkel", "{AUS}"], urteil: lies }, ctx("enkel"));
    pruef("LÄUFER ein Enkel mit dem Rohr hält die Station nicht (Ende am Prozess, nie am Rohr)", e.gruen === true && e.minuten < 0.25, JSON.stringify(e));
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
        const mitKarte = (zeilen) => ["node", "-e", "for (const z of " + JSON.stringify(zeilen) + ") console.log(z); require('fs').writeFileSync(process.argv[1], JSON.stringify({ n: 0 }))", "{AUS}"];
        e = await fahreStation({ ...st0, geraet: "radeon", gpu: true, befehl: mitKarte(["[linse-gpu] amd/rdna-3"]), urteil: (j, l) => ({ gruen: j.n === 0 && /schloss punkte-radeon 120/.test(l.stdout), zahl: l.stdout.trim().split("\n")[0] }) }, { ...c, deckelMinS: 120 });
        pruef("LÄUFER GPU über das Schloss", e.gruen === true && e.gpu === "amd/rdna-3", JSON.stringify(e));
        // (3b) DIE WAND GPU: ohne Zeugen der Karte, mit Software-Adapter, mit „zeichnet nie" ROT; der Zeuge aus dem Log eines Kindes GRÜN
        const gs = { ...st0, geraet: "radeon", gpu: true, urteil: lies };
        e = await fahreStation({ ...gs, befehl: schreib({ n: 0 }) }, { ...ctx("ohne-zeugen"), gpuLauf: falsch });
        pruef("WAND GPU ohne Zeugen der Karte → ROT", e.gruen === false && /Wand GPU: keine Linse nennt eine Karte/.test(e.grund) && e.gpu === null, JSON.stringify(e));
        e = await fahreStation({ ...gs, befehl: mitKarte(["[linse-gpu] google/swiftshader"]) }, { ...ctx("software"), gpuLauf: falsch });
        pruef("WAND GPU Software-Adapter → ROT", e.gruen === false && /ohne Karte \(\[linse-gpu\] google\/swiftshader\)/.test(e.grund), JSON.stringify(e));
        e = await fahreStation({ ...gs, befehl: mitKarte(["[linse-gpu] amd/rdna-3", "[welt-boot] FEHLER klasse: x.cjs startet „linse“ und zeichnet nie (keine seiner 1 Seiten arbeitet auf der GPU): das Rezept ist „null“"]) }, { ...ctx("nie"), gpuLauf: falsch });
        pruef("WAND GPU die Linse zeichnet nie → ROT", e.gruen === false && /Wand GPU: die Linse zeichnet nie/.test(e.grund) && e.gpuNie === 1, JSON.stringify(e));
        const kind = "const cp = require('child_process'), fs = require('fs'); const fd = fs.openSync(process.argv[1] + '.log', 'w'); " +
            "cp.spawnSync(process.execPath, ['-e', " + JSON.stringify("console.log('[linse-gpu] nvidia/pascal')") + "], { stdio: ['ignore', fd, 'inherit'] }); " +
            "fs.writeFileSync(process.argv[1], JSON.stringify({ n: 0 }))";
        e = await fahreStation({ ...gs, befehl: ["node", "-e", kind, "{AUS}"], urteil: (j, l) => ({ gruen: j.n === 0 && !/linse-gpu/.test(l.stdout), zahl: "n " + j.n }) }, { ...ctx("kind"), gpuLauf: falsch });
        pruef("WAND GPU der Zeuge liest das Log eines Kind-Prozesses → GRÜN", e.gruen === true && e.gpu === "nvidia/pascal", JSON.stringify(e));
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
    const M = (sha, g, id, st, gruen, zeit = "2026-10-23T10:00:00Z", gpu = { gpu: "amd/rdna-3" }) => ({ sha, geraet: g, je: { [id]: { gruen, zahl: gruen ? "z" : "rot", zeit, abdruck: abdruck(st, h), ...gpu } } });
    const keine = () => [];
    // DIE WAND PFAD und die Wand GPU an der Buchung
    {
        const tg = toteGlobs(["stamm/kampf.js", "worlds/schmiede/schmiede-core.js", "stamm/kreatur-*.js"], ["stamm/kampf.js", "stamm/kreatur-leben.js", "schmiede-core.js"]);
        pruef("WAND PFAD der tote Glob beim Namen", tg.join() === "worlds/schmiede/schmiede-core.js", tg.join());
        let w = buchen("kopf", [s1], [M("a1", "radeon", "gelaende.K4#1", s1, true)], keine, h, [], { tot: () => ["worlds/schmiede/schmiede-core.js"] });
        pruef("WAND PFAD toter Glob am Kopf → 0", w.je["gelaende.K4"].punkte === 0 && /trifft am Kopf keine Datei \(R6 blind\): worlds\/schmiede/.test(w.je["gelaende.K4"].beleg), w.je["gelaende.K4"].beleg);
        const alt = [M("a1", "radeon", "gelaende.K4#1", s1, true, undefined, {})];
        w = buchen("kopf", [s1], alt, keine, h, [], { roh: () => "" });
        pruef("WAND GPU Grün ohne Zeugen (vor der Wand, Roh leer) → 0", w.je["gelaende.K4"].punkte === 0 && /Wand GPU: keine Linse nennt eine Karte/.test(w.je["gelaende.K4"].beleg), w.je["gelaende.K4"].beleg);
        w = buchen("kopf", [s1], alt, keine, h, [], { roh: () => "$ befehl\n[linse-gpu] amd/rdna-3\nGRÜN\n" });
        pruef("WAND GPU Grün mit dem Zeugen in der Roh-Ausgabe → 1", w.je["gelaende.K4"].punkte === 1, w.je["gelaende.K4"].beleg);
        w = buchen("kopf", [s1], alt, keine, h, [], { roh: () => "[linse-gpu] amd/rdna-3\n[welt-boot] FEHLER klasse: x.cjs startet „linse“ und zeichnet nie (keine seiner 1 Seiten arbeitet auf der GPU): das Rezept ist „null“\n" });
        pruef("WAND GPU Roh zeigt „zeichnet nie“ → 0", w.je["gelaende.K4"].punkte === 0 && /zeichnet nie/.test(w.je["gelaende.K4"].beleg), w.je["gelaende.K4"].beleg);
    }
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
    // (5b) R6 NACH KONSUM, Ende zu Ende: eine Station (der Läufer, der Zeuge in jedem node-Prozess, ein Browser mit Seite und
    // Worker) führt in probe.js `getan` aus, liest den Text von `nurText` und nie `nie`, im Worker `imFaden` und nie
    // `nieFaden`, im Node-Prozess `ja` und nie `nein`, und holt daten.json — der gefaltete Konsum nennt genau das
    {
        const baum = fs.mkdtempSync(path.join(os.tmpdir(), "punkte-konsum-"));
        const fn = (n, r) => "function " + n + "() {\n    return " + r + ";\n}\n";
        const probe = {
            "probe.html": '<!doctype html><script src="probe.js"></script>',
            "probe.js": fn("getan", 1) + fn("nie", 2) + fn("nurText", 3) + 'getan();\nString(nurText);\nnew Worker("faden.js").onmessage = (e) =>\n    fetch("daten.json").then((r) => r.json()).then((j) => (window.fertig = e.data + j.n));\n',
            "faden.js": fn("imFaden", 5) + fn("nieFaden", 6) + "postMessage(imFaden());\n",
            "knoten.js": "exports.ja = " + fn("", 1) + "exports.nein = " + fn("", 2),
            "kind.js": "exports.k = " + fn("", 1) + "exports.nie = " + fn("", 2),
            "daten.json": '{ "n": 1 }',
        };
        for (const [n, t] of Object.entries(probe)) fs.writeFileSync(path.join(baum, n), t);
        const pp = path.join(spielRepo(), "node_modules", "puppeteer");
        // dazu ein Kind, das `k` ruft und getötet wird (kill: der Zeuge bittet es vorher um seinen Abschluss)
        const lauf = "const http = require('http'), fs = require('fs'), path = require('path'); require('./knoten.js').ja();" +
            "const kind = require('child_process').spawn(process.execPath, ['-e', 'require(\\'./kind.js\\').k(); console.log(1); setInterval(() => {}, 1000)'], { stdio: ['ignore', 'pipe', 'inherit'] });" +
            "kind.stdout.once('data', () => kind.kill());" +
            "const s = http.createServer((q, a) => fs.readFile(path.join(process.cwd(), q.url.slice(1)), (e, d) => a.end(e ? '' : d)));" +
            "s.listen(0, '127.0.0.1', async () => { const b = await require(" + JSON.stringify(pp) + ").launch({ args: ['--no-sandbox'] });" +
            "const p = await b.newPage(); await p.goto('http://127.0.0.1:' + s.address().port + '/probe.html');" +
            "await p.waitForFunction(() => window.fertig === 6, { timeout: 20000 }); await b.close(); s.close();" +
            "fs.writeFileSync(process.argv[1], JSON.stringify({ n: 0 })); });";
        const ek = await fahreStation({ ...st0, befehl: ["node", "-e", lauf, "{AUS}"], urteil: lies }, { ...ctx("konsum"), baum, deckelMinS: 120 });
        const k = ek.konsum ? konsumVon(ek.konsum) : {};
        const soll = { "probe.js": "1-3,7-13", "faden.js": "1-3,7", "knoten.js": "1-4", "kind.js": "1-4", "daten.json": "*", "probe.html": "*" };
        pruef("KONSUM Ende zu Ende: ausgeführt und gelesen, nie das Nie (Seite, Worker, Node, getötetes Kind, JSON)", ek.gruen && JSON.stringify(k) === JSON.stringify({ ...k, ...soll }) &&
            Object.keys(k).every((p) => p in soll || p.endsWith("/")), JSON.stringify({ gruen: ek.gruen, k, fehlt: ek.konsumFehlt }));
        // die Buchung: eine Änderung außerhalb des Konsums lässt die Messung frisch, in einer ausgeführten Funktion macht sie alt,
        // eine geänderte geladene JSON macht sie alt; ohne Konsum gilt der Glob (Mischbetrieb), ein gelesenes Verzeichnis zählt
        const sk = { ...st0, pfad: ["probe.js", "daten.json", "anders.js"] };
        const mk = (konsum) => ({ sha: "a1", geraet: "headless", je: { "gelaende.K4#1": { gruen: true, zahl: "z", zeit: "2026-10-26T10:00:00Z", abdruck: abdruck(sk, h), ...konsum } } });
        const mitK = mk({ konsum: ek.konsum || "" });
        const d = (f, a, b) => () => ({ dateien: [f], zeilen: new Map([[f, [[a, b]]]]), neu: new Set() });
        const fall = (name, m, g, punkte) => {
            const x = buchen("kopf", [sk], [m], g, h).je["gelaende.K4"];
            pruef(name, x.punkte === punkte, x.beleg);
        };
        fall("KONSUM Änderung in `nie` (nie ausgeführt) → frisch → 1", mitK, d("probe.js", 5, 5), 1);
        fall("KONSUM Änderung in `getan` (ausgeführt) → alt → 0", mitK, d("probe.js", 2, 2), 0);
        fall("KONSUM Einfügung zwischen `nie` und `nurText` → alt → 0", mitK, d("probe.js", 6, 7), 0);
        fall("KONSUM geladene JSON geändert → alt → 0", mitK, () => ({ dateien: ["daten.json"], neu: new Set() }), 0);
        fall("KONSUM nie geladene Datei im Glob geändert → frisch → 1", mitK, d("anders.js", 1, 1), 1);
        fall("KONSUM ohne Zeilen (Liste) zählt die konsumierte Datei ganz → 0", mitK, () => ["probe.js"], 0);
        fall("MISCHBETRIEB ohne Konsum: der Glob urteilt → alt → 0", mk({}), d("probe.js", 5, 5), 0);
        const dir = mk({ konsum: zlib.deflateRawSync(JSON.stringify({ "worlds/": "*" })).toString("base64") });
        fall("KONSUM gelesenes Verzeichnis bekommt eine Datei → alt → 0", dir, () => ({ dateien: ["worlds/neu.js"], zeilen: new Map(), neu: new Set(["worlds/neu.js"]) }), 0);
        fall("KONSUM gelesenes Verzeichnis, Unterordner bekommt eine Datei → frisch → 1", dir, () => ({ dateien: ["worlds/a/neu.js"], zeilen: new Map(), neu: new Set(["worlds/a/neu.js"]) }), 1);
        // der Diff: ein Hunk aus reinen Versions-Stempeln fällt, ein echter bleibt; Anlegen und Löschen beim Namen
        const wd = weltDiff("probe.js\nneu.js", ["diff --git a/probe.js b/probe.js", "@@ -2 +2 @@", '-importScripts("a.js?v=1");', '+importScripts("a.js?v=2");',
            "@@ -5,0 +6,2 @@", "+x();", "+y();", "diff --git a/neu.js b/neu.js", "new file mode 100644", "@@ -0,0 +1 @@", "+z();"].join("\n"));
        pruef("KONSUM Diff: Stempel-Hunk fällt, Einfügung trifft 5 und 6, Anlegen beim Namen", JSON.stringify(wd.zeilen.get("probe.js")) === "[[5,6]]" && wd.neu.has("neu.js") && !wd.neu.has("probe.js"),
            JSON.stringify([...wd.zeilen]) + " neu " + [...wd.neu]);
        // ein getöteter Prozess (ein .offen ohne Ende) macht den Konsum ungültig — nie still klein
        const ord = path.join(tmp, "getoetet.konsum");
        fs.mkdirSync(ord, { recursive: true });
        fs.writeFileSync(path.join(ord, "1.json"), JSON.stringify({ js: {}, geladen: [], ganz: [] }));
        fs.writeFileSync(path.join(ord, "2.offen"), "");
        const kf = konsumFalten(ord, baum);
        pruef("KONSUM ein Prozess ohne Ende → kein Konsum (R6 nach Pfad)", !kf.konsum && /ohne Ende/.test(kf.konsumFehlt), JSON.stringify(kf));
        fs.rmSync(baum, { recursive: true, force: true });
    }
    // (6) Übergang in gen.cjs
    const stand = { kopf: "abcd1234", je: { "gelaende.K4": { punkte: 2, beleg: "Maschine: z" } } };
    const k0 = { name: "n", punkte: 1, beleg: "Hand" };
    const k1 = maschinenKriterium(stand, "gelaende", 3, k0), k2 = maschinenKriterium(stand, "gelaende", 1, k0);
    pruef("GEN registriert → Maschine, sonst Hand", k1.punkte === 2 && k1.maschine && k1.beleg === "Maschine: z" && k2 === k0, JSON.stringify([k1, k2]));
    const pf = standPruefen(stand, "ffff0000", new Set(["gelaende.K4"]));
    pruef("GEN Kopf ungleich ist ROT", pf.some((f) => /Kopf abcd1234/.test(f)), pf.join(" | "));
    const X = (id, geraet, gruen) => ({ id, geraet, gruen });
    const nz = gtxNutzen({ je: {
        "a.K1": { stationen: [X("a.K1#1", "radeon", true), X("a.K1#1", "gtx", false), X("a.K1#2", "radeon", true), X("a.K1#2", "gtx", false)] },
        "b.K1": { stationen: [X("b.K1#1", "radeon", false), X("b.K1#1", "gtx", false), X("b.K1#2", "radeon", true), X("b.K1#2", "gtx", false)] },
        "c.K1": { stationen: [X("c.K1#1", "headless", true), X("c.K1#2", "radeon", false), X("c.K1#2", "gtx", false)] },
    } });
    pruef("GTX-NUTZEN Staffel 1 hinter grüner Radeon fällt, Staffel 2 nur über stehender 1 und grüner Radeon",
        nz.ja.join() === "a.K1#2,b.K1#1" && nz.nein.join() === "a.K1#1,b.K1#2,c.K1#2", JSON.stringify(nz));
    const P = (k, s, ge) => ({ kriterium: k, staffel: s, geraet: ge, befehl: ["node"], gpu: true });
    const V = (id, g, gruen) => ({ id, geraet: g, gruen, zahl: gruen ? "ok" : "rot" });
    const vor = [V("a.K1#1", "radeon", true), V("a.K1#1", "gtx", true), V("a.K1#2", "radeon", true), V("a.K1#2", "gtx", true),
        V("b.K1#1", "radeon", false), V("b.K1#1", "gtx", false), V("c.K1#1", "radeon", false), V("c.K1#1", "gtx", false),
        V("d.K1#1", "radeon", false), V("d.K1#1", "gtx", true), V("d.K1#2", "radeon", true), V("d.K1#2", "gtx", false)];
    const mp = messPlan([P("a.K1", 1, ["radeon", "gtx"]), P("a.K1", 2, ["radeon", "gtx"]), P("b.K1", 1, ["radeon", "gtx"]), P("c.K1", 1, ["radeon", "gtx"]), P("d.K1", 1, ["radeon", "gtx"]), P("d.K1", 2, ["radeon", "gtx"])],
        (id, g) => vor.find((x) => x.id === id && x.geraet === g) || null, new Set(["c.K1"]), (id) => id === "d.K1#1");
    pruef("MESS-PLAN Staffel 1 auf EINEM Gerät (Zeit auf der GTX), rot ohne Heil-Versuch fällt, genannt fährt beide, Staffel 2 nur ganz grün oder geheilt",
        mp.radeon.join() === "a.K1#1,a.K1#2,c.K1#1" && mp.gtx.join() === "a.K1#2,c.K1#1,d.K1#1" && mp.uebersprungen.join() === "b.K1#1,d.K1#2", JSON.stringify(mp));
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
        else if (verb === "gtx-nutzen") gtxNutzenCli(o);
        else if (verb === "plan") planCli(o);
        else if (verb === "liste") {
            const { stationen, fehler, fehlt } = ladeGeprueft();
            // DIE WAND PFAD am Kopf (--kopf, sonst origin/main des Spiel-Klons): jeder Glob trifft eine Datei
            const repo = spielRepo();
            const kopf = voll(repo, o.kopf || "origin/main");
            const dateien = dateienAm(repo, kopf);
            for (const st of stationen) {
                const t = toteGlobs(st.pfad, dateien);
                if (t.length) fehler.push(schluessel(st) + ": " + pfadGrund(t, "am Kopf " + kopf.slice(0, 8)));
            }
            for (const st of stationen) console.log("  " + schluessel(st) + " · " + geraeteVon(st).join("+") + (st.gpu ? " · GPU" : "") + " · " + st.minuten + " min · " + st.befehl.join(" ") + " · " + abdruck(st));
            for (const e of fehlt) console.log("  FEHLT " + e.kriterium + "#" + e.staffel + " · " + String(e.grund).slice(0, 140));
            for (const f of fehler) console.log("  ROT " + f);
            console.log(stationen.length + " Stationen · " + new Set(stationen.map((s) => s.kriterium)).size + " Kriterien · fehlt " + fehlt.length + " · Fehler " + fehler.length);
            process.exitCode = fehler.length ? 1 : 0;
        } else if (verb === "selbsttest") process.exitCode = await selbsttest();
        else {
            console.log("Verben: run --sha <sha> --geraet radeon|gtx|headless [--nur id,id] [--offen] [--trocken] [--port-basis 7700] · buchen --kopf <sha> · liste [--kopf <sha>] · selbsttest");
            process.exitCode = 2;
        }
    })().catch((e) => {
        console.error("PUNKTE ROT: " + (e && e.message));
        process.exitCode = 2;
    });
}

module.exports = { liesStand, maschinenKriterium, standPruefen, buchen, pruefeStationen, trifftPfad, toteGlobs, gpuZeuge, gpuWand, abdruck, fahreStation };
