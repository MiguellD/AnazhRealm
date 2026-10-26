#!/usr/bin/env node
// DIE PUNKTE-MASCHINE der Meisterkarte: die Punkte eines Kriteriums sind eine FUNKTION DES SHA, gerechnet wie die CI —
// keine Sitzung misst und bucht mehr von Hand, was hier registriert ist.
//
//   node punkte.cjs run --sha <sha> --geraet radeon|gtx|headless [--nur id,id] [--bahnen 3] [--port-basis 7700]
//        fährt jede Station des Geräts im Spiel-Baum am SHA, schreibt messung/<sha8>-<geraet>.json
//        --offen: nur die Stationen ohne frische Messung am SHA (das Frische-Urteil der Buchung) · --trocken: nur nennen
//        Zwillinge (gleicher Befehl und Umgebung) fahren EINMAL; DER BAHN-PLAN (fahrePlan): jede Zeit-Station allein, die übrigen
//        auf bis zu N Bahnen (Vorgabe 3, höchstens 5) zugleich, jede Bahn mit eigenem Spiel-Baum und eigenem Port-Band (portBand) —
//        auf radeon|gtx über das Platz-Schloss (werkzeug/gpu-lauf.sh: ein Bild-Lauf nimmt einen Platz, ein Zeit-Lauf alle)
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
//   über gpu-lauf.sh, nie ohne Schloss) · zeit true|false (true: das Urteil fällt an der Wanduhr — ms, Latenz, Frame-Zeit,
//   Sekunden bis sichtbar —, die Station fährt allein; false: Bild oder Funktion, sie verträgt parallele Bahnen; je Station
//   Pflicht) · minuten (Deckel = 2 × minuten, mindestens 2 min) · urteil (j, lauf) →
//   { gruen, zahl } mit j = JSON aus {AUS} oder null, lauf = { exit, stdout, stderr } · pfad: Globs des gemessenen Pfads
//   (R6) · quelle: der Staffel-Text wörtlich (Teil der Staffel in src/gN.js).
// Je Kriterium und Staffel EINE Station (Schlüssel "<kriterium>#<staffel>"); ein Kriterium ohne Staffel-1-Station ist ROT.
//
// BUCHUNG (R2 · R6 · R10): je Station und Gerät zählt die JÜNGSTE Messung, deren Abdruck (Befehl, Urteil, Pfad, Hilfen)
// der Station gleicht und deren Pfad zwischen Mess-SHA und Kopf in Welt-Bytes unberührt ist (weltDateien). 1 = jede
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
        if (typeof st.zeit !== "boolean") f.push("zeit nicht boolesch (true: das Urteil fällt in ms, die Station fährt allein)");
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

// DAS PORT-BAND je Gerät und Bahn (26.10., Karte gpu-bahnen): {PORT} = Band-Anfang + 4. Die Stationen leiten aus {PORT} ab:
// −1 (Seite der Werkbank), +1 (Ofen, Wasser-Leben), +3 (KI), +10000 (tier-gang), +20000 (Werkbank oder save-server), +20001,
// +30000 (Kreatur-Linse) — jede Ableitung bleibt in den 10 Ports ihres Bands und seiner +10000-Spiegel. Bis dahin trug jede
// Station einen Port aus ihrer Stelle in der Liste: zwei Nachbarn hätten parallel kollidiert (wetter.K2#1 an 7710 sucht die Seite
// auf 7709), und ab Stelle 100 lief die Liste aus dem Block 7700–7799. headless nimmt die Bänder ab Basis, radeon|gtx ab Basis + 50.
const BAND = 10;
const MAX_BAHNEN = 5;
function portBand(basis, geraet, bahn) {
    const a = Number(basis) + (geraet === "headless" ? 0 : MAX_BAHNEN * BAND) + bahn * BAND;
    const alle = [0, 10000, 20000, 30000].flatMap((d) => Array.from({ length: BAND }, (_, i) => a + d + i));
    if (alle.includes(TABU_PORT)) throw new Error("Port-Band " + a + "–" + (a + BAND - 1) + " trifft " + TABU_PORT + " (--port-basis)");
    return { port: a + 4, alle };
}

// räumt jeden lauschenden Prozess auf den Ports (EIN netstat je Aufruf)
function portRaeumen(ports) {
    const ps = [].concat(ports || []).filter(Boolean).map(String);
    if (!ps.length) return;
    if (process.platform === "win32") {
        const r = spawnSync("netstat", ["-ano", "-p", "tcp"], { encoding: "utf8" });
        const pids = new Set();
        const re = new RegExp(":(" + ps.join("|") + ")$");
        for (const l of String(r.stdout || "").split(/\r?\n/)) {
            const s = l.trim().split(/\s+/);
            if (s.length >= 5 && /^(LISTEN|ABH)/i.test(s[3]) && re.test(s[1]) && s[4] !== "0") pids.add(s[4]);
        }
        for (const pid of pids) spawnSync("taskkill", ["/F", "/T", "/PID", pid], { encoding: "utf8" });
    } else spawnSync("sh", ["-c", "lsof -t -sTCP:LISTEN " + ps.map((p) => "-i tcp:" + p).join(" ") + " | xargs -r kill -9"], { encoding: "utf8" });
}

function baumTot(pid) {
    if (process.platform === "win32") spawnSync("taskkill", ["/F", "/T", "/PID", String(pid)], { encoding: "utf8" });
    else try { process.kill(-pid, "SIGKILL"); } catch (_e) { try { process.kill(pid, "SIGKILL"); } catch (_f) {} }
}

const ersetze = (s, ctx) =>
    s.replace(/\{PORT\}/g, String(ctx.port)).replace(/\{AUS\}/g, ctx.aus).replace(/\{BAUM\}/g, ctx.baum).replace(/\{KOORD\}/g, ctx.koord);

// DIE EINE gpu-lauf.sh (26.10., Prüfung gpu-bahnen): run und Selbsttest fahren dieselbe Datei, die neben dieser Maschine
// (werkzeug/, mit gpu-schloss.sh); eine andere nur ausdrücklich per PUNKTE_GPU_LAUF, und dann prüft der Selbsttest sie. Bis dahin
// fuhr run die alte Ein-Platz-Fassung unter artifacts/profiband/werkzeug/, der Selbsttest die neue: drei Bahnen warteten still
// nacheinander und trugen trotzdem „2/3“.
const GPU_LAUF = process.env.PUNKTE_GPU_LAUF || path.join(DIR, "werkzeug", "gpu-lauf.sh");
// vor dem Schloss wacht gpu-lauf.sh selbst über das Warten (Frist ohne Nachtruhe, Exit 75) und meldet sich alle 60 s; schweigt es
// länger, hängt es — der Lauf fällt, die Station bleibt ungemessen
const SCHLOSS_STILL_S = 600;
const istZeit = (sts) => sts.some((st) => st.zeit === true);
// fährt EINE Station; ctx = { baum, koord, port, band, aus, roh, geraet, bahn, plaetze, gpuLauf, bash, deckelMinS }
// Rückgabe { gruen, zahl, exit, minuten, grund?, ungemessen? } — ein Fehler, ein Absturz, ein Deckel ist ROT mit Grund, nie still;
// ein Schloss, das nie kam, ist ungemessen mit Grund.
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
        // ein Lauf, der das Schloss nie bekam, ist KEINE Messung: ungemessen beim Grund (eintragen legt ihn nie nach m.je)
        const offen = (grund, exit = null) => fertig({ gruen: false, ungemessen: true, zahl: grund, exit, minuten: min(), grund });
        const deckelS = Math.max(ctx.deckelMinS != null ? ctx.deckelMinS : 120, Math.ceil(st.minuten * 60 * 2));
        let argv = st.befehl.map((a) => ersetze(a, ctx));
        const env = { ...process.env };
        // die Werkbank der Bahn: wer sie ohne --port ruft, trifft die seines Bands (nie die 4490 einer Nachbar-Bahn)
        if (ctx.port) env.WERKBANK_PORT = String(ctx.port + 20000);
        // headless läuft ohne Karte: starteBrowser griffe lokal sonst die GPU (scripts/lib/software-gpu.cjs) — ohne Schloss
    if (!st.gpu) env.LINSE_GPU = "software";
    for (const [k, v] of Object.entries(st.env || {})) env[k] = ersetze(v, ctx);
    if (!st.gpu && env.LINSE_GPU !== "software") return rot("headless verlangt LINSE_GPU=software — die Karte nur unter dem Schloss");
        let exe;
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
            argv = [ctx.gpuLauf, "punkte-" + ctx.geraet + "-" + ((ctx.bahn || 0) + 1), exe, ...argv];
            exe = ctx.bash;
            env.GPU_LAUF_MAX_S = String(deckelS);
            // das Platz-Schloss: ein Zeit-Lauf nimmt alle Plätze, ein Bild-Lauf einen von N (N = 1: das Ein-Platz-Schloss)
            env.GPU_LAUF_ART = istZeit(sts) ? "zeit" : "bild";
            env.GPU_LAUF_PLAETZE = String(ctx.plaetze || 1);
            // der Zeuge der Karte in JEDEM node-Prozess der Station (die Werkbank schreibt in ihr eigenes Log)
            env.PUNKTE_GPU_ZEUGE = zeugeDatei;
            env.NODE_OPTIONS = ((env.NODE_OPTIONS || "") + ' --require "' + ZEUGE_DATEI.split(path.sep).join("/") + '"').trim();
        }
        try { fs.rmSync(ctx.aus, { force: true }); } catch (_e) {}
        if (zeugeDatei) try { fs.rmSync(zeugeDatei, { force: true }); } catch (_e) {}
        portRaeumen(ctx.band || ctx.port);
        let out = "", err = "", tot = false;
        let kind;
        try {
            kind = spawn(exe, argv, { cwd: ctx.baum, env, windowsHide: true, detached: process.platform !== "win32" });
        } catch (e) {
            return rot("Start: " + e.message);
        }
        const kappe = (s, d) => (s.length + d.length > 4 << 20 ? (s + d).slice(-(4 << 20)) : s + d);
        // DIE UHR: der Deckel einer GPU-Station zählt ab dem Schloss (die Zeile „gpu-lauf: Schloss …“) und liegt HINTER dem von
        // gpu-lauf.sh, das selbst beendet und löst (trap); davor ist sie die Wache über ein schweigendes gpu-lauf.sh (Nachtruhe und
        // Frist zählt es selbst — eine feste Summe Deckel + Frist riss jeden Lauf, der über die Nacht wartete)
        const stillS = ctx.stillS || SCHLOSS_STILL_S;
        let uhr = null, amSchloss = !st.gpu;
        const stelle = (s) => { clearTimeout(uhr); uhr = setTimeout(() => { tot = true; baumTot(kind.pid); }, s * 1000); };
        const lauscht = () => {
            if (amSchloss) return;
            if (/^gpu-lauf: Schloss /m.test(err) || /^gpu-lauf: Schloss /m.test(out)) { amSchloss = true; stelle(deckelS + 120); } else stelle(stillS);
        };
        kind.stdout.on("data", (d) => { out = kappe(out, String(d)); lauscht(); });
        kind.stderr.on("data", (d) => { err = kappe(err, String(d)); lauscht(); });
        stelle(st.gpu ? stillS : deckelS);
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
            portRaeumen(ctx.band || ctx.port);
            // die Zeugen-Zeilen gehen in die Roh-Ausgabe (die Buchung liest sie dort), die Datei fällt
            const zeugeText = zeugeDatei && fs.existsSync(zeugeDatei) ? fs.readFileSync(zeugeDatei, "utf8") : "";
            if (zeugeDatei) try { fs.rmSync(zeugeDatei, { force: true }); } catch (_e) {}
            if (ctx.roh) {
                fs.mkdirSync(path.dirname(ctx.roh), { recursive: true });
                fs.writeFileSync(ctx.roh, "$ " + [exe, ...argv].join(" ") + "\n" + out + (err ? "\n--- stderr ---\n" + err : "") +
                    (zeugeText ? "\n--- gpu-zeuge ---\n" + zeugeText : ""));
            }
            if (tot && !amSchloss) return offen("GPU-Schloss nie bekommen: gpu-lauf.sh schwieg " + stillS + " s beim Warten — beendet, ungemessen", code);
            if (tot) return rot("Deckel " + (st.gpu ? deckelS + 120 : deckelS) + " s überschritten — beendet", code);
            if (sig) return rot("Absturz: Signal " + sig, code);
            const blockiert = (/^SCHLOSS BLOCKIERT .*$/m.exec(out) || [""])[0].trim();
            if (st.gpu && code === 75) return offen("GPU-Schloss blockiert (gpu-lauf.sh Exit 75" + (blockiert ? ": " + blockiert : "") + ") — ungemessen", code);
            if (st.gpu && code === 124) return rot("GPU-Deckel " + deckelS + " s (gpu-lauf.sh Exit 124)", code);
            let j = null;
            if (fs.existsSync(ctx.aus))
                try { j = JSON.parse(fs.readFileSync(ctx.aus, "utf8")); } catch (_e) { j = null; }
            const m = min();
            // DIE WAND GPU: ohne Zeugen der Karte ist das Urteil einer GPU-Station ROT beim Grund
            const zeuge = st.gpu ? gpuZeuge(zeugeText + "\n" + out + "\n" + err) : null;
            const wand = zeuge && gpuWand(zeuge);
            const gz = zeuge ? { gpu: zeuge.karte, ...(zeuge.fremd ? { gpuFremd: zeuge.fremd } : {}), ...(zeuge.nie ? { gpuNie: zeuge.nie } : {}) } : {};
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
            }));
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
    const bahnenSoll = Number(opt.bahnen || 3);
    if (!(bahnenSoll >= 1 && bahnenSoll <= MAX_BAHNEN && Number.isInteger(bahnenSoll)))
        throw new Error("--bahnen " + opt.bahnen + ": 1 bis " + MAX_BAHNEN + " (je Bahn ein Port-Band)");
    const band = (b) => portBand(opt.portBasis || 7700, opt.geraet, b);
    for (let b = 0; b < bahnenSoll; b++) band(b);
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
            weltDateien(git(["diff", "--name-only", s, sha], repo), git(["diff", "-U0", "--no-color", s, sha], repo)), hilfeText(),
            { tot, roh: rohAus() });
        meine = meine.filter((st) => frisch(st, opt.geraet).ungemessen);
        if (!meine.length) {
            console.log("Punkte-Maschine: am " + sha.slice(0, 8) + " ist jede Station auf " + opt.geraet + " frisch gemessen");
            return null;
        }
    }
    if (opt.trocken) {
        console.log("Punkte-Maschine (trocken): " + meine.length + " Station(en) auf " + opt.geraet + " am " + sha.slice(0, 8) + ", " +
            planText(gruppiere(meine), bahnenSoll) + ": " + meine.map((st) => schluessel(st) + (st.zeit ? "(Zeit)" : "")).join(" "));
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
    const gruppen = gruppiere(meine);
    const bahnen = Math.max(1, Math.min(bahnenSoll, gruppen.filter((g) => !istZeit(g)).length));
    const ctx0 = { koord: KOORD, geraet: opt.geraet, bash: findeBash(), plaetze: bahnen, gpuLauf: GPU_LAUF };
    // je Bahn der EIGENE Spiel-Baum (Spielstände, Rohdateien) und das eigene Port-Band
    const baeume = [baum];
    for (let i = 2; i <= bahnen; i++) baeume.push(baumAmSha(repo, opt.geraet + "-" + i, sha));
    console.log(startZeile(meine.length, gruppen, opt.geraet, sha, bahnen) + " (Baum " + baeume.join(", ") + ")");
    fs.mkdirSync(rohDir, { recursive: true });
    await fahrePlan(gruppen, bahnen, async (g, b) => {
        const ids = g.map(schluessel);
        const ctx = { ...ctx0, baum: baeume[b], bahn: b, port: band(b).port, band: band(b).alle,
            aus: path.join(rohDir, ids[0].replace("#", "_") + ".json"), roh: path.join(rohDir, ids[0].replace("#", "_") + ".out") };
        const zeit = new Date().toISOString();
        const es = await fahreGruppe(g, ctx);
        g.forEach((st, i) => {
            const id = ids[i];
            if (i > 0 && fs.existsSync(ctx.roh)) fs.copyFileSync(ctx.roh, path.join(rohDir, id.replace("#", "_") + ".out"));
            const e = { ...es[i], zeit, abdruck: abdruck(st, hilfe), port: ctx.port, bahn: istZeit(g) ? "allein" : b + 1 + "/" + bahnen,
                ...(i > 0 ? { zwilling: ids[0] } : {}) };
            eintragen(m, id, e);
            console.log(stationsZeile(id, e));
        });
        m.zeit = zeit;
        m.host = os.hostname();
        fs.writeFileSync(datei, JSON.stringify(m, null, 1) + "\n");
    });
    console.log("→ " + path.relative(KOORD, datei));
    return m;
}

// DER EINTRAG einer gefahrenen Station: ein Urteil (GRÜN/ROT) nach m.je, das Buchung und `run --offen` lesen; ein Lauf ohne
// Schloss (Exit 75, gpu-lauf.sh schwieg beim Warten) nach m.ungemessen mit Grund, NIE als ROT — frischUrteil nähme ihn sonst als
// frische Messung, und `run --offen` mäße die Station an diesem SHA nie neu (26.10., Prüfung gpu-bahnen)
function eintragen(m, id, e) {
    if (e.ungemessen) {
        (m.ungemessen = m.ungemessen || {})[id] = e;
        return;
    }
    m.je[id] = e;
    if (m.ungemessen) delete m.ungemessen[id];
    if (m.ungemessen && !Object.keys(m.ungemessen).length) delete m.ungemessen;
}
// DIE ZEILEN, die der Läufer zug.cjs (artifacts/profiband/werkzeug, Fortschritt nach zug/fortschritt-radeon.txt) liest: Start
// `Punkte-Maschine: <n> Station(en) in `, Station `  GRÜN|ROT  <id> · … · Exit <c> · <min> min[ (Zwilling von <id>)]` — ein neues
// Feld steht VOR „· Exit“ (26.10.: „· allein“ am Zeilenende machte den Fortschritt der Radeon blind); ein ungemessener Lauf heißt
// OFFEN, weder GRÜN noch ROT
const startZeile = (n, gruppen, geraet, sha, bahnen) =>
    "Punkte-Maschine: " + n + " Station(en) in " + gruppen.length + " Läufen auf " + geraet + " am " + sha.slice(0, 8) + " · " + planText(gruppen, bahnen);
const stationsZeile = (id, e) => {
    const bahn = e.bahn === "allein" ? "allein" : "Bahn " + e.bahn;
    if (e.ungemessen) return "  OFFEN " + id + " · " + e.grund + " · " + bahn + " · ungemessen, `run --offen` misst neu";
    return "  " + (e.gruen ? "GRÜN" : "ROT ") + " " + id + " · " + e.zahl + " · " + bahn + " · Exit " + e.exit + " · " + e.minuten + " min" +
        (e.zwilling ? " (Zwilling von " + e.zwilling + ")" : "");
};

// Zwillinge (gleicher Befehl, gleiche Umgebung, z. B. Staffel 1 und 2 aus EINER Linse) fahren EINMAL: je Lauf eine Gruppe
function gruppiere(meine) {
    const gruppen = [];
    const je = new Map();
    for (const st of meine) {
        const k = JSON.stringify([st.befehl, st.env || {}, !!st.gpu]);
        if (!je.has(k)) { je.set(k, []); gruppen.push(je.get(k)); }
        je.get(k).push(st);
    }
    return gruppen;
}
const sollMin = (gs) => gs.reduce((s, g) => s + g[0].minuten, 0);
function planText(gruppen, bahnen) {
    const zeit = gruppen.filter(istZeit), bild = gruppen.filter((g) => !istZeit(g));
    return "Zeit " + zeit.length + " Läufe ~" + sollMin(zeit) + " min allein · Bild " + bild.length + " Läufe ~" + sollMin(bild) + " min auf " +
        bahnen + " Bahn(en) · erwartet ~" + Math.round(sollMin(zeit) + sollMin(bild) / bahnen) + " min (Soll-Minuten)";
}
// DER BAHN-PLAN (26.10., Karte gpu-bahnen: die Prüfung darf nie länger dauern als das Erstellen — ein Radeon-Takt fuhr 45 Stationen
// einzeln in 151–174 min, die meisten Bild-Urteile ohne ms): jede Zeit-Gruppe fährt ALLEIN auf Bahn 0, erst wenn keine andere
// läuft, und keine startet neben ihr; danach die Bild-Gruppen auf bis zu `bahnen` Bahnen zugleich, die längsten zuerst.
// fahre(gruppe, bahn) → Promise; das Platz-Schloss (gpu-lauf.sh) hält dieselbe Regel gegen fremde Läufe.
async function fahrePlan(gruppen, bahnen, fahre) {
    for (const g of gruppen.filter(istZeit)) await fahre(g, 0);
    const schlange = gruppen.filter((g) => !istZeit(g)).sort((a, b) => sollMin([b]) - sollMin([a]));
    await Promise.all(Array.from({ length: bahnen }, async (_, b) => {
        for (let g = schlange.shift(); g; g = schlange.shift()) await fahre(g, b);
    }));
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
            try { diffCache.set(sha, { dateien: geaendert(sha) }); } catch (e) { diffCache.set(sha, { fehler: e.message }); }
        }
        return diffCache.get(sha);
    };
    return (st, g) => {
        const id = schluessel(st);
        const tot = opt.tot ? opt.tot(st) : [];
        if (tot.length) return { gruen: false, ungemessen: true, grund: pfadGrund(tot, "am Kopf") };
        const ab = abdruck(st, hilfe);
        let alt = 0, fremd = 0, unbekannt = 0, ohneZeugen = null, taeter = [];
        const frisch = [];
        for (const m of messungen) {
            if (m.geraet !== g || !m.je || !m.je[id]) continue;
            const e = m.je[id];
            if (e.abdruck !== ab) { fremd++; continue; }
            const d = diff(m.sha);
            if (d.fehler) { unbekannt++; continue; }
            const t = d.dateien.filter((f) => trifftPfad(f, st.pfad));
            if (t.length) { alt++; taeter = t; continue; }
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
        return { gruen: false, ungemessen: true, grund: ohneZeugen ? "Wand GPU: " + ohneZeugen : alt ? "Pfad seit der Messung geändert (R6: " + taeter.slice(0, 3).join(", ") + (taeter.length > 3 ? " +" + (taeter.length - 3) : "") + ")" : unbekannt ? "Mess-SHA unbekannt — kein R6-Urteil" : fremd ? "Station seit der Messung geändert" : "ungemessen (R10)" };
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
// Kriterien, die die Commits seit dem vorigen Kopf nennen · zeit(id): die Station urteilt in ms (ihr Merkmal `zeit`)
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
    const minVon = (id) => Math.max(0, ...["radeon", "gtx"].map((g) => (da(id, g) && da(id, g).minuten) || 0));
    const zeit = new Set(stationen.filter((st) => st.zeit).map(schluessel));
    const p = messPlan(stationen, da, genannt, (id) => zeit.has(id));
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
        weltDateien(git(["diff", "--name-only", sha, kopfVoll], repo), git(["diff", "-U0", "--no-color", sha, kopfVoll], repo)),
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
        const w = weltDateien(namen, dt).join(",");
        pruef("R6 Welt-Bytes: Stempel und Werkzeug fallen, Code und Binär bleiben", w === "stamm/kampf.js,gelaende-core.js,bild.png", w);
    }
    // (2) jede Format-Verletzung beim Namen
    const st0 = { kriterium: "gelaende.K4", staffel: 1, geraet: "headless", befehl: ["node", "-e", "0"], gpu: false, zeit: false, minuten: 1,
        urteil: () => ({ gruen: true, zahl: "x" }), pfad: ["stamm/wasser-*.js"], quelle: "1 = alle Leser folgen der 50-Punkte-Kern-Mutation an einem Ort" };
    const fv = [
        ["FORMAT-ROT Kriterium unbekannt", { kriterium: "gelaende.K9" }, /Kriterium unbekannt/],
        ["FORMAT-ROT Quelle nicht wörtlich", { quelle: "1 = alle Leser folgen irgendwie" }, /nicht wörtlich/],
        ["FORMAT-ROT Quelle andere Stufe", { staffel: 2, quelle: "1 = alle Leser folgen der 50-Punkte-Kern-Mutation an einem Ort" }, /Stufe 2/],
        ["FORMAT-ROT Pfad leer", { pfad: [] }, /pfad leer/],
        ["FORMAT-ROT Staffel 2 GPU an einem Gerät", { staffel: 2, geraet: "radeon", gpu: true, quelle: "2 = überall, dazu endet jeder Lauf in See oder Meer" }, /beide Geräte/],
        ["FORMAT-ROT radeon ohne gpu", { geraet: "radeon", gpu: false }, /gpu: true/],
        ["FORMAT-ROT GPU-Station ohne zeit", { geraet: "radeon", gpu: true, zeit: undefined }, /zeit nicht boolesch/],
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
        e = await fahreStation({ ...st0, geraet: "radeon", gpu: true, befehl: mitKarte(["[linse-gpu] amd/rdna-3"]), urteil: (j, l) => ({ gruen: j.n === 0 && /schloss punkte-radeon-1 120/.test(l.stdout), zahl: l.stdout.trim().split("\n")[0] }) }, { ...c, deckelMinS: 120 });
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
        // (3a) EIN BLOCKIERTES SCHLOSS IST KEINE MESSUNG: Exit 75 und ein gpu-lauf.sh, das beim Warten schweigt, sind ungemessen beim
        // Grund — nie ROT in m.je, und `run --offen` (frischUrteil) misst die Station neu; ein Lauf AM Schloss schweigt, so lang er will
        const c2 = { ...ctx("blockiert"), gpuLauf: path.join(tmp, "blockiert.sh") };
        fs.writeFileSync(c2.gpuLauf, "#!/bin/bash\necho 'SCHLOSS BLOCKIERT von Nachtruhe 0325-0415 nach 2701 s Warten'\nexit 75\n");
        const sg = { ...st0, geraet: "radeon", gpu: true, urteil: () => ({ gruen: true, zahl: "x" }) };
        e = await fahreStation(sg, c2);
        const mb = { sha: "b1", geraet: "radeon", je: {} };
        eintragen(mb, "gelaende.K4#1", { ...e, zeit: "2026-10-26T02:11:00Z", abdruck: abdruck(sg, "h") });
        const fr = frischUrteil([mb], () => [], "h")(sg, "radeon");
        const nachher = { ...mb, je: { ...mb.je }, ungemessen: { ...mb.ungemessen } };
        eintragen(nachher, "gelaende.K4#1", { gruen: true, zahl: "z", exit: 0, minuten: 1 });
        pruef("LÄUFER GPU-Schloss blockiert (Exit 75) ist UNGEMESSEN beim Namen, nie ROT in der Messung — run --offen misst neu",
            e.ungemessen === true && e.gruen === false && /Schloss blockiert.*Nachtruhe 0325-0415/.test(e.grund) && !mb.je["gelaende.K4#1"] &&
            !!mb.ungemessen["gelaende.K4#1"] && fr.ungemessen === true && /R10/.test(fr.grund) && nachher.je["gelaende.K4#1"].gruen && !nachher.ungemessen,
            JSON.stringify([e, mb, fr]));
        const c3 = { ...ctx("schweigt"), gpuLauf: path.join(tmp, "schweigt.sh"), stillS: 2 };
        fs.writeFileSync(c3.gpuLauf, "#!/bin/bash\necho 'gpu-lauf: probe (bild) wartet auf ?' >&2\nsleep 60\n");
        e = await fahreStation(sg, c3);
        const c4 = { ...ctx("am-schloss"), gpuLauf: path.join(tmp, "am-schloss.sh"), stillS: 3 };
        fs.writeFileSync(c4.gpuLauf, '#!/bin/bash\nN="$1"; shift\necho "gpu-lauf: Schloss $N (bild, Platz 1 von 2) nach 0 s" >&2\nsleep 9\n"$@"\n');
        const e4 = await fahreStation({ ...st0, geraet: "radeon", gpu: true, befehl: mitKarte(["[linse-gpu] amd/rdna-3"]), urteil: lies }, { ...c4, deckelMinS: 120 });
        pruef("LÄUFER ein Schloss, das nie kommt (gpu-lauf.sh schweigt beim Warten), ist UNGEMESSEN; der Deckel zählt erst ab dem Schloss",
            e.ungemessen === true && /nie bekommen: gpu-lauf.sh schwieg 2 s/.test(e.grund) && e4.gruen === true && !e4.ungemessen, JSON.stringify([e, e4]));
    } else pruef("LÄUFER GPU über das Schloss", false, "keine Git-bash");
    // (3d) DER LESER zug.cjs (artifacts/profiband/werkzeug/zug.cjs, punkte(): Fortschritt der Radeon nach zug/fortschritt-radeon.txt) —
    // seine Muster wörtlich: Start und Station in dem Format, das er liest; ein ungemessener Lauf ist weder GRÜN noch ROT noch toter
    // Glob (26.10.: „· allein“ am Zeilenende, n blieb 0, jede ROT-Zeile zählte als toter Glob)
    {
        const START = /^Punkte-Maschine: (\d+) Station\(en\) in /, STATION = /^  (GRÜN|ROT ) (\S+) · .* · Exit \S+ · ([\d.]+) min( \(Zwilling von \S+\))?$/, TOT = /^  ROT  (\S+) · /;
        const gs = [[{ ...st0, minuten: 2 }], [{ ...st0, minuten: 3, zeit: true }]];
        const s = startZeile(7, gs, "radeon", "0123456789abcdef", 3) + " (Baum x)";
        const z = [stationsZeile("a.K1#1", { gruen: true, zahl: "z · 3", exit: 0, minuten: 1.5, bahn: "2/3" }),
            stationsZeile("a.K1#2", { gruen: false, zahl: "rot", exit: 1, minuten: 0.4, bahn: "allein", zwilling: "a.K1#1" }),
            stationsZeile("a.K1#3", { gruen: false, ungemessen: true, grund: "GPU-Schloss blockiert", exit: 75, minuten: 45, bahn: "1/3" })];
        const t = z.map((l) => STATION.exec(l));
        pruef("LESER zug.cjs: Start- und Stationszeilen im gelesenen Format, ungemessen ist weder GRÜN noch ROT",
            (START.exec(s) || [])[1] === "7" && !!t[0] && t[0][2] === "a.K1#1" && t[0][3] === "1.5" && !!t[1] && t[1][1] === "ROT " && !!t[1][4] &&
            !t[2] && !TOT.test(z[2]) && !/^  (GRÜN|ROT)/.test(z[2]), JSON.stringify([s, ...z]));
    }
    // (3c) DIE BAHNEN: das Platz-Schloss, das run fährt (GPU_LAUF, EINE Quelle), mit Stub-Befehlen, je Fall ein eigenes Schloss in
    // tmp (nie das der Karte, nie ein echter CI-Job: GPU_WORKER_BILD, GPU_HOOK_LOG, GPU_NACHT eigen). Das Urteil ist die REIHENFOLGE
    // der Ereignisse im Log (S = Start unter dem Schloss, E = Ende), nie die Wanduhr (Lehre 26; 26.10. auf dem Laptop: einen Platz
    // nehmen dauerte 2,9–3,8 s, die Fenster von 500/800 ms rissen): ein Stub hält seinen Platz, bis seine Tür (eine Datei) aufgeht
    // oder sein Partner unter dem Schloss steht; der Test öffnet eine Tür erst, wenn der Wartende sein Warten gemeldet hat
    if (findeBash()) {
        const wz = GPU_LAUF;
        const fw = (p) => p.split(path.sep).join("/");
        const schlossEnv = (n) => ({ GPU_SCHLOSS: fw(path.join(tmp, "bahn-" + n)), GPU_HOOK_LOG: fw(path.join(tmp, "bahn-" + n + ".hook.log")),
            GPU_NACHT: "", GPU_WORKER_BILD: "Kein.Worker.exe", GPU_LAUF_TAKT_S: "1" });
        // $1 Log · $2 wer · $3 {AUS} oder leer · $4 Tür oder leer · $5 Partner oder leer (je höchstens ~60 s: ein Hänger wird ROT, nie ewig)
        const STUB = 'echo "[linse-gpu] amd/rdna-3"; echo "S $2" >> "$1"; i=0; ' +
            'while [ -n "$4" ] && [ ! -e "$4" ] && [ $i -lt 600 ]; do sleep 0.1; i=$((i+1)); done; ' +
            'while [ -n "$5" ] && ! grep -qx "S $5" "$1" && [ $i -lt 600 ]; do sleep 0.1; i=$((i+1)); done; ' +
            'echo "E $2" >> "$1"; [ -n "$3" ] && echo "{\\"n\\": 0}" > "$3"; true';
        // je Lauf die Zeilen-Stelle seines S und E im Log
        const spannen = (log) => {
            const m = {};
            (fs.existsSync(log) ? fs.readFileSync(log, "utf8") : "").split(/\r?\n/).forEach((z, i) => {
                const x = /^([SE]) (\S+)$/.exec(z.trim());
                if (x) (m[x[2]] = m[x[2]] || {})[x[1]] = i;
            });
            return m;
        };
        const spanne = (a) => !!a && a.S != null && a.E != null;
        const ueber = (a, b) => spanne(a) && spanne(b) && a.S < b.E && b.S < a.E;
        const nach = (a, b) => spanne(a) && spanne(b) && a.S > b.E;
        const warte = (ms) => new Promise((r) => setTimeout(r, ms));
        // wartet auf ein Ereignis (höchstens ~120 s: ein Hänger wird ROT, nie ewig)
        const bis = async (f) => { for (let i = 0; i < 1200; i++) { if (f()) return true; await warte(100); } return false; };
        // ein fremder Lauf: gpu-lauf.sh direkt, wie ein Macher oder ein zweiter Läufer ihn ruft
        const lauf = (env, art, n, wer, log, tuer = "") => {
            const r = { out: "", err: "", code: undefined };
            r.k = spawn(findeBash(), [wz, "probe-" + wer, "bash", "-c", STUB, "stub", fw(log), wer, "", tuer && fw(tuer), ""],
                { env: { ...process.env, ...env, GPU_LAUF_ART: art, GPU_LAUF_PLAETZE: String(n) }, windowsHide: true });
            r.k.stdout.setEncoding("utf8");
            r.k.stderr.setEncoding("utf8");
            r.k.stdout.on("data", (d) => (r.out += d));
            r.k.stderr.on("data", (d) => (r.err += d));
            r.fertig = new Promise((ok) => { r.k.on("close", (c) => ok((r.code = c))); r.k.on("error", () => ok((r.code = -1))); });
            return r;
        };
        const wartet = (r) => () => /wartet auf/.test(r.err);
        const steht = (log, wer) => () => !!spannen(log)[wer];
        // (a) der Bahn-Plan über den Läufer: Zeit allein auf Bahn 0, danach zwei Bild-Gruppen, die einander unter dem Schloss
        // erwarten — sie enden nur, wenn beide zugleich einen Platz halten
        const planFall = (async () => {
            const env = schlossEnv("plan"), log = path.join(tmp, "bahn-plan.log");
            const G = (wer, zeit, partner) => [{ ...st0, geraet: ["radeon", "gtx"], gpu: true, zeit, env, befehl: ["bash", "-c", STUB, "stub", fw(log), wer, "{AUS}", "", partner], urteil: lies }];
            const es = [];
            await fahrePlan([G("A", false, "B"), G("Z", true, ""), G("B", false, "A")], 2, async (g, b) =>
                es.push(await fahreGruppe(g, { ...ctx("plan-" + g[0].befehl[5]), gpuLauf: wz, bahn: b, plaetze: 2, deckelMinS: 120 })));
            const sp = spannen(log);
            return ["BAHNEN der Plan: zwei Bild-Läufe halten zugleich je einen Platz, der Zeit-Lauf fährt allein (Läufer + Platz-Schloss, N = 2)",
                ueber(sp.A, sp.B) && nach(sp.A, sp.Z) && nach(sp.B, sp.Z) && es.length === 3 && es.every((r) => r[0].gruen) && !fs.existsSync(env.GPU_SCHLOSS),
                JSON.stringify(sp) + " " + es.map((r) => r[0].zahl).join(" | ")];
        })();
        // (b) fremde Läufe am Schloss: Bild X hält einen Platz, Zeit Z wartet auf ALLE Plätze, Bild Y kommt danach und tritt nicht bei,
        // solange Z wartet (Vorrang, beim Namen) — Z überlappt nie
        const zeitFall = (async () => {
            const env = schlossEnv("zeit"), log = path.join(tmp, "bahn-zeit.log"), tuer = path.join(tmp, "bahn-zeit.tuer");
            const x = lauf(env, "bild", 2, "X", log, tuer);
            const ev = [await bis(steht(log, "X"))];
            const z = lauf(env, "zeit", 2, "Z", log);
            ev.push(await bis(wartet(z)));
            const y = lauf(env, "bild", 2, "Y", log);
            ev.push(await bis(wartet(y)));
            fs.writeFileSync(tuer, "");
            const codes = await Promise.all([x.fertig, z.fertig, y.fertig]);
            const sp = spannen(log);
            return ["BAHNEN ein Zeit-Lauf wartet auf alle Plätze, ein späterer Bild-Lauf tritt nicht vor ihm bei und nennt den Vorrang beim Namen",
                ev.every(Boolean) && codes.every((c) => c === 0) && nach(sp.Z, sp.X) && nach(sp.Y, sp.Z) && /wartet auf Vorrang: 'probe-Z'/.test(y.err) && !fs.existsSync(env.GPU_SCHLOSS),
                JSON.stringify(sp) + " Ereignisse " + ev.join("/") + " Exit " + codes.join("/") + " · Y: " + y.err.trim().split("\n")[0]];
        })();
        // (c) N = 1 ist das Ein-Platz-Schloss von vorher: der zweite Bild-Lauf wartet, bis der erste geht
        const einFall = (async () => {
            const env = schlossEnv("eins"), log = path.join(tmp, "bahn-eins.log"), tuer = path.join(tmp, "bahn-eins.tuer");
            const p = lauf(env, "bild", 1, "P", log, tuer);
            const ev = [await bis(steht(log, "P"))];
            const q = lauf(env, "bild", 1, "Q", log);
            ev.push(await bis(wartet(q)));
            fs.writeFileSync(tuer, "");
            const codes = await Promise.all([p.fertig, q.fertig]);
            const sp = spannen(log);
            return ["BAHNEN N = 1: zwei Bild-Läufe überlappen nie (das alte Schloss)",
                ev.every(Boolean) && codes.every((c) => c === 0) && nach(sp.Q, sp.P), JSON.stringify(sp) + " Ereignisse " + ev.join("/") + " Exit " + codes.join("/")];
        })();
        // (d) VORFAHRT: ein wartender CI-Job (hook.log) hält jeden neuen Platz an, auch einen freien; der Hook nimmt das Schloss,
        // sobald der letzte Platz geht, und erst nach ihm fährt der neue Bild-Lauf
        const ciFall = (async () => {
            const env = schlossEnv("ci"), log = path.join(tmp, "bahn-ci.log"), tuer = path.join(tmp, "bahn-ci.tuer");
            const x = lauf(env, "bild", 2, "X", log, tuer);
            const ev = [await bis(steht(log, "X"))];
            fs.appendFileSync(env.GPU_HOOK_LOG, "2026-10-26 10:00:00 start ci-probe 1/1 echt: wartet auf Schloss von 'probe-X'\r\n");
            const y = lauf(env, "bild", 2, "Y", log);
            ev.push(await bis(wartet(y)));
            fs.writeFileSync(tuer, "");
            await x.fertig;
            const hook = await bis(() => { try { fs.mkdirSync(env.GPU_SCHLOSS); return true; } catch (_e) { return false; } });
            if (hook) {
                fs.writeFileSync(path.join(env.GPU_SCHLOSS, "besitzer.txt"), "ci-probe 1/1 echt\npid=" + process.pid + "\n");
                fs.appendFileSync(log, "S H\n");
                fs.appendFileSync(env.GPU_HOOK_LOG, "2026-10-26 10:00:05 start ci-probe 1/1 echt: Schloss genommen\r\n");
                fs.appendFileSync(log, "E H\n");
                fs.rmSync(env.GPU_SCHLOSS, { recursive: true, force: true });
            }
            const codes = [x.code, await y.fertig];
            const sp = spannen(log);
            return ["BAHNEN VORFAHRT: ein wartender CI-Job hält den freien Platz an und bekommt das Schloss, der neue Bild-Lauf fährt nach ihm",
                ev.every(Boolean) && hook && codes.every((c) => c === 0) && nach(sp.H, sp.X) && nach(sp.Y, sp.H) && /Vorfahrt: ein CI-Job wartet/.test(y.err),
                JSON.stringify(sp) + " Ereignisse " + ev.join("/") + " Hook " + hook + " Exit " + codes.join("/")];
        })();
        // (e) DER VERTRETER: geht der Erste, nennt besitzer.txt den Bleibenden (die Hooks lösen ein Schloss mit toter pid)
        const vertreterFall = (async () => {
            const env = schlossEnv("vertreter"), log = path.join(tmp, "bahn-vertreter.log");
            const [t1, t2] = [1, 2].map((i) => path.join(tmp, "bahn-vertreter-" + i + ".tuer"));
            const v1 = lauf(env, "bild", 2, "V1", log, t1);
            const ev = [await bis(steht(log, "V1"))];
            const v2 = lauf(env, "bild", 2, "V2", log, t2);
            ev.push(await bis(steht(log, "V2")));
            fs.writeFileSync(t1, "");
            const c1 = await v1.fertig;
            const b = fs.existsSync(path.join(env.GPU_SCHLOSS, "besitzer.txt")) ? fs.readFileSync(path.join(env.GPU_SCHLOSS, "besitzer.txt"), "utf8") : "";
            fs.writeFileSync(t2, "");
            const c2 = await v2.fertig;
            const sp = spannen(log);
            return ["BAHNEN DER VERTRETER: geht der Erste, nennt besitzer.txt den Bleibenden mit pid (die Hooks lösen sonst)",
                ev.every(Boolean) && c1 === 0 && c2 === 0 && ueber(sp.V1, sp.V2) && /^probe-V2\r?\npid=\d+/.test(b) && !fs.existsSync(env.GPU_SCHLOSS),
                JSON.stringify(b) + " " + JSON.stringify(sp) + " Exit " + c1 + "/" + c2];
        })();
        // (f) DIE NACHTRUHE zählt nie zur Warte-Frist (26.10.: 50 min Nacht > 45 min Frist, Exit 75 um 04:11, ROT in der Messung):
        // N wartet in der Nacht mit Frist 0 und läuft nie aus, während zwei Läufe ohne Nacht am selben Schloss nacheinander mit
        // Exit 75 enden — beim Namen des Halters
        const nachtFall = (async () => {
            const env = schlossEnv("nacht"), log = path.join(tmp, "bahn-nacht.log");
            fs.mkdirSync(env.GPU_SCHLOSS, { recursive: true });
            fs.writeFileSync(path.join(env.GPU_SCHLOSS, "besitzer.txt"), "probe-halter\npid=" + process.pid + "\n");
            const n = lauf({ ...env, GPU_NACHT: "0000-2400", GPU_LAUF_WARTE_S: "0" }, "bild", 2, "N", log);
            const ev = [await bis(() => /wartet auf Nachtruhe 0000-2400/.test(n.err))];
            const a1 = lauf({ ...env, GPU_LAUF_WARTE_S: "0" }, "bild", 2, "A1", log);
            const c1 = await a1.fertig;
            const c2 = await lauf({ ...env, GPU_LAUF_WARTE_S: "0" }, "bild", 2, "A2", log).fertig;
            const lebt = n.code === undefined;
            baumTot(n.k.pid);
            await n.fertig;
            fs.rmSync(env.GPU_SCHLOSS, { recursive: true, force: true });
            return ["SCHLOSS die Nachtruhe zählt nie zur Warte-Frist: wer in der Nacht wartet, läuft nicht aus; ohne Nacht endet das Warten mit Exit 75 beim Namen",
                ev[0] && lebt && c1 === 75 && c2 === 75 && /^SCHLOSS BLOCKIERT von probe-halter /m.test(a1.out) && !spannen(log).N,
                "Nacht wartet " + ev[0] + " · lebt " + lebt + " (Exit " + n.code + ") · A " + c1 + "/" + c2 + " · " + a1.out.trim() + " · N: " + n.out.trim()];
        })();
        // (g) DER VORRANG fällt nach derselben Verwaist-Regel wie besitzer.txt und platz.k: ein Eintrag älter als der Systemstart
        // (seine pid lebt, neu vergeben) sperrt nicht; ein haltender Vorrang steht beim Namen in Exit 75
        const vorrangFall = (async () => {
            const env = schlossEnv("vorrang"), log = path.join(tmp, "bahn-vorrang.log");
            const vd = env.GPU_SCHLOSS + ".vorrang", alt = vd + "/" + process.pid;
            fs.mkdirSync(vd, { recursive: true });
            fs.writeFileSync(alt, "probe-alt\npid=" + process.pid + "\n");
            fs.utimesSync(alt, new Date("2001-01-01T00:00:00Z"), new Date("2001-01-01T00:00:00Z"));
            const p = lauf({ ...env, GPU_LAUF_WARTE_S: "20" }, "bild", 2, "P", log);
            const cp = await p.fertig;
            const weg = !fs.existsSync(alt);
            fs.writeFileSync(alt, "probe-zeit\npid=" + process.pid + "\n");
            const q = lauf({ ...env, GPU_LAUF_WARTE_S: "0" }, "bild", 2, "Q", log);
            const cq = await q.fertig;
            fs.rmSync(vd, { recursive: true, force: true });
            const sp = spannen(log);
            return ["SCHLOSS der Vorrang fällt nach der Verwaist-Regel (älter als der Systemstart), ein haltender Vorrang steht beim Namen in Exit 75",
                cp === 0 && weg && spanne(sp.P) && /verwaister Vorrang 'probe-alt' geloest - älter als der Systemstart/.test(p.err) &&
                cq === 75 && /^SCHLOSS BLOCKIERT von Vorrang: 'probe-zeit'/m.test(q.out) && !sp.Q,
                "P Exit " + cp + " weg " + weg + " · " + p.err.trim().split("\n").filter((l) => /Vorrang/.test(l)).join(" ") + " · Q Exit " + cq + " · " + q.out.trim()];
        })();
        for (const [name, ok, was] of await Promise.all([planFall, zeitFall, einFall, ciFall, vertreterFall, nachtFall, vorrangFall])) pruef(name, ok, was);
    } else pruef("BAHNEN Platz-Schloss", false, "keine Git-bash");
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
            for (const st of stationen) console.log("  " + schluessel(st) + " · " + geraeteVon(st).join("+") + (st.gpu ? " · GPU" : "") + (st.zeit ? " · Zeit" : " · Bild") + " · " + st.minuten + " min · " + st.befehl.join(" ") + " · " + abdruck(st));
            for (const e of fehlt) console.log("  FEHLT " + e.kriterium + "#" + e.staffel + " · " + String(e.grund).slice(0, 140));
            for (const f of fehler) console.log("  ROT " + f);
            console.log(stationen.length + " Stationen · " + new Set(stationen.map((s) => s.kriterium)).size + " Kriterien · fehlt " + fehlt.length + " · Fehler " + fehler.length);
            process.exitCode = fehler.length ? 1 : 0;
        } else if (verb === "selbsttest") process.exitCode = await selbsttest();
        else {
            console.log("Verben: run --sha <sha> --geraet radeon|gtx|headless [--nur id,id] [--offen] [--trocken] [--bahnen 3] [--port-basis 7700] · buchen --kopf <sha> · liste [--kopf <sha>] · selbsttest");
            process.exitCode = 2;
        }
    })().catch((e) => {
        console.error("PUNKTE ROT: " + (e && e.message));
        process.exitCode = 2;
    });
}

module.exports = { liesStand, maschinenKriterium, standPruefen, buchen, pruefeStationen, trifftPfad, toteGlobs, gpuZeuge, gpuWand, abdruck, fahreStation };
