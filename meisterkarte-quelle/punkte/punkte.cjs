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
//        headless misst nie am Platz: ohne --farm ruft run die Farm (punkte-farm.yml im Spiel-Repo, farmRufen), wartet und holt
//        ihre Messung in diesen Baum; --farm <name> fährt AUF dem Läufer (ohne Schloss des Rechners, host = name)
//   node punkte.cjs scheiben --sha <sha> --geraet headless [--jobs 12] [--offen|--nur id,id]
//        der Plan der Farm: die Läufe in höchstens --jobs Scheiben, die schwersten zuerst (JSON auf stdout = die Matrix)
//   node punkte.cjs vereine --sha <voll> --geraet headless --farm <name> --teile <dir> [--scheiben scheiben.json] [--beginn <s>]
//        die Teil-Messungen der Scheiben zur EINEN messung/<sha8>-<geraet>.json samt Roh-Ausgaben
//   node punkte.cjs buchen --kopf <sha>
//        liest alle messung/*.json, urteilt R6 (Pfad und Linse unberührt seit der Messung) und R10, schreibt stand.json
//   node punkte.cjs liste [--kopf <sha>]   die registrierten Stationen, geprüft gegen src/gN.js und jeder pfad-Glob gegen den
//        Kopf (sonst origin/main des Spiel-Klons)
//   node punkte.cjs gtx-nutzen --kopf <sha>   die GTX-Stationen, deren Messung am Kopf Punkte ändern kann (nur=… für die OMEN):
//        die gtx-Hälften ohne frische Messung am Kopf, deren Ausgang über die Punkte entscheiden kann (Frische-Urteil der Buchung)
//   node punkte.cjs plan --kopf <neu> --vorher <alt>   der Mess-Plan nach einem Zug: je GPU-Gerät die Stationen, die Punkte halten
//        oder gewinnen können (Staffel 1 auf EINEM Gerät, Zeit-Stationen auf der GTX, rote ohne Heil-Versuch nie)
//   node punkte.cjs gruppen --geraet radeon|gtx|headless [--nur id,id]   je Zeile die Ids EINES Laufs (Zwillinge zusammen, Reihe von
//        nur) — der Messplatz der OMEN fährt je Zeile ein `run --nur`, nie einen Zwilling zweimal
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
//   (R6) · quelle: der Staffel-Text wörtlich (Teil der Staffel in src/gN.js) · beide (optional, nur true an Staffel 1 auf
//   radeon und gtx: die Staffel nennt beide Geräte, die 1 zählt erst, wenn JEDES grün ist — Pflicht, wo die quelle sie nennt) ·
//   proben (optional): [{ name, stdout, gruen }] Roh-Ausgaben des Befehls mit dem Urteil, das die Station über sie spricht
//   (die Schlupflöcher der Soll-Tafel als Mutanten; der Selbsttest urteilt jede).
// Je Kriterium und Staffel EINE Station (Schlüssel "<kriterium>#<staffel>"); ein Kriterium ohne Staffel-1-Station ist ROT.
//
// BUCHUNG (R2 · R6 · R10): je Station und Gerät zählt die JÜNGSTE Messung, deren Abdruck (Befehl, Urteil, Pfad, Hilfen)
// der Station gleicht und deren Pfad und Linse zwischen Mess-SHA und Kopf ohne Stempel unberührt sind (stempelDateien, linsenVon). 1 = jede
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
        if (st.beide !== undefined && !(st.beide === true && st.staffel === 1 && ge.includes("radeon") && ge.includes("gtx")))
            f.push("beide nur als true an Staffel 1 auf radeon und gtx");
        if (st.staffel === 1 && st.beide !== true && /an beiden Geräten|beide Geräte|beider Geräte/.test(st.quelle || ""))
            f.push("die Staffel 1 nennt beide Geräte — beide: true (sonst bucht EIN Gerät die 1)");
        if (st.proben !== undefined && !(Array.isArray(st.proben) && st.proben.every((p) => p && typeof p.name === "string" && typeof p.stdout === "string" && typeof p.gruen === "boolean")))
            f.push("proben ist keine Liste von { name, stdout, gruen }");
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
// DIE PROBEN (`proben`): jede Station urteilt ihre Roh-Ausgaben, wie sie es sagt — Rückgabe die Abweichungen beim Namen
function probenUrteil(stationen) {
    const falsch = [];
    for (const st of stationen)
        for (const p of st.proben || []) {
            let u;
            try {
                u = st.urteil(null, { exit: 0, stdout: p.stdout, stderr: "" });
            } catch (e) {
                u = { gruen: null, zahl: "Urteil warf: " + e.message };
            }
            if (!u || u.gruen !== p.gruen)
                falsch.push(schluessel(st) + " " + p.name + ": " + (u && u.gruen ? "GRÜN" : "ROT") + " statt " + (p.gruen ? "GRÜN" : "ROT") + " (" + (u ? u.zahl : "kein Urteil") + ")");
        }
    return falsch;
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
// DAS WARTEN (27.10., Karte lange-stationen): `minuten` zählt ab dem Start, auch das Warten am Schloss (e7a28b06 Radeon: speicher.K2#1
// 29,51 min, davon 25,7 vor dem Schloss, die Vorfahrt des echt-Jobs); `warten` nennt die Minuten bis „gpu-lauf: Schloss …“ —
// die Arbeit der Station ist minuten − warten
function fahreGruppe(sts, ctx) {
    const st = sts[0];
    let tSchloss = null;
    return new Promise((ganz0) => {
        const t0 = Date.now();
        const ganz = (es) => ganz0(tSchloss ? es.map((e) => ({ ...e, warten: +((tSchloss - t0) / 60000).toFixed(2) })) : es);
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
        // DAS SCHLOSS DES RECHNERS (27.10., Takt 8): headless fuhr in 3 Bahnen ohne Schloss neben den Zeit-Stationen der Radeon —
        // profiband.K4#1 84 Hänger statt 0 (607d0c73: max 67 ms), klang.K5#2 p95 0,26 statt 0,11 ms. Darum nimmt auch eine
        // headless-Station ihren Platz im Schloss: ein Zeit-Lauf misst allein auf dem RECHNER, nie nur auf der Karte; die Karte bleibt
        // ihr verwehrt (LINSE_GPU=software), der Zeuge gilt nur GPU-Stationen. Ohne gpuLauf (die Läufer des Selbsttests) läuft sie frei.
        const schloss = st.gpu || !!ctx.gpuLauf;
        if (schloss) {
            if (!ctx.gpuLauf || !fs.existsSync(ctx.gpuLauf)) return rot("gpu-lauf.sh fehlt — eine GPU-Station läuft nie ohne Schloss");
            if (!ctx.bash) return rot("keine Git-bash gefunden (PUNKTE_BASH) für gpu-lauf.sh");
            argv = [ctx.gpuLauf, "punkte-" + ctx.geraet + "-" + ((ctx.bahn || 0) + 1), exe, ...argv];
            exe = ctx.bash;
            env.GPU_LAUF_MAX_S = String(deckelS);
            // das Platz-Schloss: ein Zeit-Lauf nimmt alle Plätze, ein Bild-Lauf einen von N (N = 1: das Ein-Platz-Schloss)
            env.GPU_LAUF_ART = istZeit(sts) ? "zeit" : "bild";
            env.GPU_LAUF_PLAETZE = String(ctx.plaetze || 1);
        }
        if (st.gpu) {
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
        let uhr = null, amSchloss = !schloss;
        const stelle = (s) => { clearTimeout(uhr); uhr = setTimeout(() => { tot = true; baumTot(kind.pid); }, s * 1000); };
        const lauscht = () => {
            if (amSchloss) return;
            if (/^gpu-lauf: Schloss /m.test(err) || /^gpu-lauf: Schloss /m.test(out)) { amSchloss = true; tSchloss = Date.now(); stelle(deckelS + 120); } else stelle(stillS);
        };
        kind.stdout.on("data", (d) => { out = kappe(out, String(d)); lauscht(); });
        kind.stderr.on("data", (d) => { err = kappe(err, String(d)); lauscht(); });
        stelle(schloss ? stillS : deckelS);
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
            if (tot) return rot("Deckel " + (schloss ? deckelS + 120 : deckelS) + " s überschritten — beendet", code);
            if (sig) return rot("Absturz: Signal " + sig, code);
            const blockiert = (/^SCHLOSS BLOCKIERT .*$/m.exec(out) || [""])[0].trim();
            if (schloss && code === 75) return offen("GPU-Schloss blockiert (gpu-lauf.sh Exit 75" + (blockiert ? ": " + blockiert : "") + ") — ungemessen", code);
            if (schloss && code === 124) return rot("GPU-Deckel " + deckelS + " s (gpu-lauf.sh Exit 124)", code);
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
                    // die Zeugen-Zeilen sind Ausgabe der Station, auch aus Kindern mit eigenem Log (werkbank --eigen am werkbankTor
                    // seit tk1-herde): das Urteil liest den Adapter wie die Wand GPU
                    u = s.urteil(j, { exit: code, stdout: out + (zeugeText ? "\n" + zeugeText : ""), stderr: err });
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

// DIE AUSWAHL eines Laufs — EINE Quelle für run und scheiben: die Stationen des Geräts nach --nur und --offen am SHA.
// Rückgabe { repo, sha, meine, tot }; meine leer heißt: am SHA ist nichts zu messen (--offen)
function auswahl(opt) {
    if (!opt.sha) throw new Error("--sha fehlt");
    if (!GERAETE.includes(opt.geraet)) throw new Error("--geraet radeon|gtx|headless");
    const { stationen, fehler } = ladeGeprueft();
    if (fehler.length) throw new Error("Stationen ROT:\n - " + fehler.join("\n - "));
    const nur = opt.nur ? new Set(opt.nur.split(",")) : null;
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
            stempelDateien(git(["diff", "--name-only", s, sha], repo), git(["diff", "-U0", "--no-color", s, sha], repo)), hilfeText(),
            { tot, roh: rohAus(), linsen: linsenAm(repo, sha) });
        meine = meine.filter((st) => frisch(st, opt.geraet).ungemessen);
    }
    return { repo, sha, meine, tot };
}

// DIE FARM (27.10., Karte punkte-farm; die Regel des Schöpfers: „Die Prüfung darf nie länger dauern als das Erstellen“ — der
// headless-Takt an e7a28b06 fuhr 76 Stationen Σ 266 min in 60 min Wanduhr auf dem Laptop): `run --farm <name>` fährt headless auf
// einem Läufer der Farm (.github/workflows/punkte-farm.yml im Spiel-Repo), der nur diesen Lauf trägt — dort hält kein
// Schloss des Rechners (Takt 8: es schützte die Zeit-Stationen vor den Bahnen der Radeon NEBENAN, die auf dem Läufer nie
// laufen); die Karte bleibt verwehrt (LINSE_GPU=software). Eine GPU-Station fährt nie auf der Farm: sie misst nur unter dem
// Schloss ihrer Karte. Rückgabe: die gpu-lauf.sh des Laufs oder null (frei)
function gpuLaufFuer(geraet, farm) {
    if (!farm) return GPU_LAUF;
    if (geraet !== "headless") throw new Error("--farm fährt nur headless — " + geraet + " misst nur unter dem Schloss seiner Karte");
    return null;
}

// DIE SCHEIBEN DER FARM: die Läufe (Zwillinge EIN Lauf, gruppiere) auf höchstens `jobs` Scheiben, die schwersten zuerst in die
// leichteste (LPT) — die Wanduhr der Farm ist die schwerste Scheibe, also mindestens der längste Lauf. gewicht(gruppe) → Minuten.
// Rückgabe [{ nr, gruppen, min }] ohne leere Scheiben, nr ab 1 in der Reihenfolge der Last
function scheibenPlan(gruppen, jobs, gewicht) {
    const k = Math.max(1, Math.min(Number(jobs) || 1, gruppen.length));
    const sch = Array.from({ length: k }, () => ({ gruppen: [], min: 0 }));
    const last = gruppen.map((g, i) => ({ g, w: Math.max(0, Number(gewicht(g)) || 0), i })).sort((a, b) => b.w - a.w || a.i - b.i);
    for (const { g, w } of last) {
        const s = sch.reduce((a, b) => (b.min < a.min ? b : a));
        s.gruppen.push(g);
        s.min = +(s.min + w).toFixed(2);
    }
    return sch.filter((s) => s.gruppen.length).sort((a, b) => b.min - a.min).map((s, i) => ({ nr: i + 1, ...s }));
}
// das Gewicht eines Laufs: die KÜRZESTE seiner jüngsten 5 Messungen auf dem Gerät (eine mit 0 min — toter Glob — zählt nicht), sonst
// die Soll-Minuten seiner ersten Station. Am Laptop zählen die Minuten das Warten auf das Schloss und die Last der Nachbar-Bahnen mit
// (speicher.K3#2 allein 8,6–10,4 min, in 3 Bahnen neben der Radeon 26,6 und 52,3 min; feld.K3#1 0,7–2,6 und 33,6 min) — Last
// verlängert nur, also schätzt die kürzeste den Lauf allein; der Abdruck zählt hier nicht (er urteilt die Frische, nie die Länge)
function laufGewicht(messungen, geraet) {
    const je = new Map();
    for (const m of messungen) {
        if (m.geraet !== geraet) continue;
        for (const [id, e] of Object.entries(m.je || {})) if (e.minuten > 0) (je.get(id) || je.set(id, []).get(id)).push(e);
    }
    const kuerzeste = (id) => {
        const es = (je.get(id) || []).sort((a, b) => String(b.zeit).localeCompare(String(a.zeit))).slice(0, 5);
        return es.length ? Math.min(...es.map((e) => e.minuten)) : null;
    };
    return (g) => {
        const ms = g.map((st) => kuerzeste(schluessel(st))).filter((x) => x != null);
        return ms.length ? Math.max(...ms) : g[0].minuten;
    };
}
// DER ANBIETER DES LAPTOPS: eine Station, deren KI_ENDPUNKT der lokale Ollama ist (Port 11434), verlangt dessen Modell auf dem
// Läufer ihrer Scheibe — die Farm stellt ihn (punkte-farm.yml, Schritt KI-Anbieter), die Station selbst bleibt byte-gleich
const LOKALER_ANBIETER = /^https?:\/\/(127\.0\.0\.1|localhost):11434(\/|$)/;
const kiModelle = (gruppen) =>
    [...new Set(gruppen.flat().filter((st) => st.env && LOKALER_ANBIETER.test(st.env.KI_ENDPUNKT || "") && st.env.KI_MODELL).map((st) => st.env.KI_MODELL))];

// `scheiben`: der Plan der Farm als JSON auf stdout (die Matrix des Workflows), die Zeilen für Menschen auf stderr
function scheibenCli(opt) {
    const { sha, meine } = auswahl(opt);
    const gruppen = gruppiere(meine);
    const plan = scheibenPlan(gruppen, opt.jobs || 12, laufGewicht(ladeMessungen(), opt.geraet));
    const scheiben = plan.map((s) => ({ nr: s.nr, nur: s.gruppen.flat().map(schluessel).join(","), stationen: s.gruppen.flat().length,
        laeufe: s.gruppen.length, min: s.min, ki: kiModelle(s.gruppen).join(" ") }));
    console.error("SCHEIBEN " + sha.slice(0, 8) + " " + opt.geraet + ": " + meine.length + " Stationen in " + gruppen.length + " Läufen auf " +
        scheiben.length + " Scheiben · schwerste ~" + (scheiben[0] ? scheiben[0].min : 0) + " min · Σ ~" + +plan.reduce((a, s) => a + s.min, 0).toFixed(1) + " min");
    for (const s of scheiben) console.error("  " + s.nr + " · ~" + s.min + " min · " + s.laeufe + " Läufe" + (s.ki ? " · KI " + s.ki : "") + " · " + s.nur);
    const aus = { sha, sha8: sha.slice(0, 8), geraet: opt.geraet, stationen: meine.length, laeufe: gruppen.length, scheiben };
    process.stdout.write(JSON.stringify(aus) + "\n");
    return aus;
}

// DIE VEREINIGUNG der Farm: die Teil-Messungen der Scheiben (je Läufer `run --nur … --farm`) in die EINE Messung m des SHA, über
// `eintragen` wie ein Lauf am Platz (ein Teil-Eintrag ersetzt den alten derselben Station, ungemessen bleibt ungemessen); jeder
// Eintrag trägt den Läufer (host), die Datei die Farm. teile: [{ name, m }]; erwartet: [{ nr, nur }] oder null. Rückgabe
// { m, n, fehlt: [{ nr, ids }] } — eine Scheibe ohne Teil (ihr Läufer fiel) steht beim Namen, ihre Stationen bleiben, wie sie waren.
function vereineMessungen(m, teile, sha, geraet, host, erwartet = null) {
    const ziel = m && m.sha === sha ? { ...m, je: { ...m.je }, ...(m.ungemessen ? { ungemessen: { ...m.ungemessen } } : {}) }
        : { sha, geraet, zeit: null, host, je: {} };
    const gesehen = new Set();
    let n = 0;
    for (const t of teile) {
        if (!t.m || t.m.sha !== sha || t.m.geraet !== geraet)
            throw new Error("Teil " + t.name + " misst " + (t.m && t.m.sha) + " " + (t.m && t.m.geraet) + " statt " + sha + " " + geraet);
        for (const [id, e] of [...Object.entries(t.m.je || {}), ...Object.entries(t.m.ungemessen || {})]) {
            eintragen(ziel, id, { ...e, host: e.host || t.m.host || t.name });
            gesehen.add(id);
            n++;
        }
        if (t.m.zeit && String(t.m.zeit) > String(ziel.zeit || "")) ziel.zeit = t.m.zeit;
    }
    ziel.host = host;
    const fehlt = (erwartet || []).map((s) => ({ nr: s.nr, ids: String(s.nur).split(",").filter((id) => id && !gesehen.has(id)) })).filter((s) => s.ids.length);
    return { m: ziel, n, fehlt };
}

// `vereine --sha <sha> --geraet headless --farm <name> --teile <dir> [--scheiben scheiben.json] [--beginn <epoch s>]`: jedes
// Unterverzeichnis von <dir> (download-artifact: teil-<nr>/) trägt <sha8>-<geraet>.json und roh/<sha8>-<geraet>/
function vereineCli(opt) {
    if (!opt.sha || !opt.geraet || !opt.farm || !opt.teile) throw new Error("vereine --sha <voll> --geraet <g> --farm <name> --teile <dir>");
    const name = opt.sha.slice(0, 8) + "-" + opt.geraet;
    const teile = [];
    for (const d of fs.readdirSync(opt.teile).sort()) {
        const f = path.join(opt.teile, d, name + ".json");
        if (fs.existsSync(f)) teile.push({ name: d, m: JSON.parse(fs.readFileSync(f, "utf8")), roh: path.join(opt.teile, d, "roh", name) });
        else console.log("  Teil " + d + " ohne " + name + ".json");
    }
    const erwartet = opt.scheiben ? JSON.parse(fs.readFileSync(opt.scheiben, "utf8")).scheiben : null;
    const datei = messDatei(opt.sha, opt.geraet);
    const alt = fs.existsSync(datei) ? JSON.parse(fs.readFileSync(datei, "utf8")) : null;
    const r = vereineMessungen(alt, teile, opt.sha, opt.geraet, opt.farm, erwartet);
    fs.writeFileSync(datei, JSON.stringify(r.m, null, 1) + "\n");
    const rohZiel = path.join(DIR, "messung", "roh", name);
    for (const t of teile) {
        if (!fs.existsSync(t.roh)) continue;
        fs.mkdirSync(rohZiel, { recursive: true });
        for (const f of fs.readdirSync(t.roh)) fs.copyFileSync(path.join(t.roh, f), path.join(rohZiel, f));
    }
    // die Zahl: je Läufer die Minuten seiner Läufe (ein Zwilling fuhr nie selbst), die Wanduhr ab dem Beginn der Farm
    const neu = teile.flatMap((t) => Object.entries(t.m.je || {}).map(([id, e]) => ({ id, ...e, host: e.host || t.name })));
    const jeHost = {};
    for (const e of neu) if (!e.zwilling) jeHost[e.host] = +((jeHost[e.host] || 0) + (e.minuten || 0)).toFixed(2);
    const ungemessen = teile.reduce((a, t) => a + Object.keys(t.m.ungemessen || {}).length, 0);
    const gruen = neu.filter((e) => e.gruen).length;
    const wanduhr = opt.beginn ? +((Date.now() / 1000 - Number(opt.beginn)) / 60).toFixed(1) : null;
    const laengste = Math.max(0, ...Object.values(jeHost));
    const zeile = "Farm " + opt.geraet + " " + name.slice(0, 8) + ": " + neu.length + " Stationen aus " + teile.length + " Teilen · GRÜN " + gruen +
        " · ROT " + (neu.length - gruen) + (ungemessen ? " · ungemessen " + ungemessen : "") + " · längster Läufer " + laengste + " min · Σ " +
        +Object.values(jeHost).reduce((a, x) => a + x, 0).toFixed(1) + " min" + (wanduhr != null ? " · Wanduhr " + wanduhr + " min" : "");
    console.log(zeile);
    for (const e of neu.sort((a, b) => a.id.localeCompare(b.id))) console.log(stationsZeile(e.id, e) + " · " + e.host);
    for (const s of r.fehlt) console.log("  FEHLT Scheibe " + s.nr + " (" + s.ids.length + " Stationen, kein Teil): " + s.ids.join(","));
    console.log("→ " + path.relative(KOORD, datei));
    return { ...r, zeile };
}

// DER RUF DER FARM — der EINE Weg einer headless-Messung (G4: der Laptop trägt 0 headless-Last; bis 27.10. fuhr `run --geraet
// headless` am Platz und nahm unter dem Schloss des Rechners Plätze neben den Zeit-Läufen der Radeon: takt10-headless an
// dc06b495 trug nach 1 h 08 min 5 von 81 Stationen, 9 ungemessen am blockierten Schloss). `run --geraet headless` ohne --farm
// ruft punkte-farm.yml im Spiel-Repo (workflow_dispatch am Zweig PUNKTE_FARM_REF, Vorgabe main) mit derselben Auswahl, findet
// den Lauf an seiner Marke (run-name), meldet jeden fertigen Läufer, holt nach dem Lauf die gepushte Messung in den Baum der
// Maschine (git checkout origin/<zweig> -- Datei und Roh-Ausgaben: dieselben Bytes wie am Zweig, ein späterer Merge findet
// gleiche Zugänge) und schreibt die Zeilen, die zug.cjs liest. Ein Ruf, den GitHub abweist, ist ROT beim Grund — nie ein Lauf am
// Platz. Der Schlüssel: GH_TOKEN | GITHUB_TOKEN | git credential (github.com).
const FARM_WORKFLOW = "punkte-farm.yml";
function ghSchluessel() {
    if (process.env.GH_TOKEN || process.env.GITHUB_TOKEN) return process.env.GH_TOKEN || process.env.GITHUB_TOKEN;
    const r = spawnSync("git", ["credential", "fill"], { input: "protocol=https\nhost=github.com\n\n", encoding: "utf8", windowsHide: true });
    const t = (/^password=(.+)$/m.exec(String(r.stdout || "")) || [])[1];
    if (!t) throw new Error("Farm: kein GitHub-Schlüssel (GH_TOKEN, GITHUB_TOKEN oder git credential für github.com)");
    return t.trim();
}
const repoSlug = (url) => {
    const m = /github\.com[:/]([^/]+\/[^/]+?)(?:\.git)?\/?$/.exec(String(url).trim());
    if (!m) throw new Error("Farm: origin " + url + " ist kein GitHub-Repo");
    return m[1];
};
// die Eingaben des Rufs: die Auswahl reist als Liste (nur) — --offen urteilt HIER, am selben Stand der Messungen, den die Buchung
// liest; die Marke findet den Lauf (run-name)
const farmEingaben = (meine, sha, zweig, marke, jobs) => ({ sha, auswahl: "nur", nur: meine.map(schluessel).join(","), jobs: String(jobs || 12), koord: zweig, marke });
async function farmRufen(opt, a, warte = (ms) => new Promise((r) => setTimeout(r, ms))) {
    const { repo, sha, meine } = a;
    const slug = repoSlug(git(["remote", "get-url", "origin"], repo));
    const zweig = git(["rev-parse", "--abbrev-ref", "HEAD"], KOORD);
    if (zweig === "HEAD") throw new Error("Farm: der Baum der Maschine steht auf keinem Zweig (die Farm pusht ihre Messung auf einen Zweig)");
    const ref = process.env.PUNKTE_FARM_REF || "main";
    const marke = os.hostname() + "-" + process.pid + "-" + Date.now();
    const auswahlArt = opt.nur ? "nur" : opt.offen ? "offen" : "alle";
    const schluesselGh = ghSchluessel();
    const api = async (p, init = {}) => {
        const r = await fetch("https://api.github.com/repos/" + slug + p, { ...init, headers: { Authorization: "Bearer " + schluesselGh,
            Accept: "application/vnd.github+json", "User-Agent": "punkte-maschine", ...(init.body ? { "Content-Type": "application/json" } : {}) } });
        const text = await r.text();
        if (!r.ok) throw new Error("Farm: " + (init.method || "GET") + " " + p + " → " + r.status + " " + text.slice(0, 200));
        return text ? JSON.parse(text) : null;
    };
    await api("/actions/workflows/" + FARM_WORKFLOW + "/dispatches", { method: "POST", body: JSON.stringify({ ref, inputs: farmEingaben(meine, sha, zweig, marke, opt.jobs) }) });
    let lauf = null;
    for (let i = 0; i < 60 && !lauf; i++) {
        await warte(5000);
        const l = await api("/actions/workflows/" + FARM_WORKFLOW + "/runs?event=workflow_dispatch&per_page=30");
        lauf = (l.workflow_runs || []).find((r) => String(r.display_title || r.name).includes(marke)) || null;
    }
    if (!lauf) throw new Error("Farm: der Lauf mit der Marke " + marke + " erschien nicht binnen 5 min (" + ref + ")");
    console.log(startZeile(meine.length, gruppiere(meine), "headless", sha, 1) + " · auf der Farm (" + auswahlArt + ") " + lauf.html_url);
    const gemeldet = new Set();
    for (;;) {
        const j = await api("/actions/runs/" + lauf.id + "/jobs?per_page=100");
        for (const x of j.jobs || [])
            if (x.status === "completed" && !gemeldet.has(x.id)) {
                gemeldet.add(x.id);
                console.log("  Farm: " + x.name + " · " + x.conclusion + " · " + ((new Date(x.completed_at) - new Date(x.started_at)) / 60000).toFixed(1) + " min");
            }
        lauf = await api("/actions/runs/" + lauf.id);
        if (lauf.status === "completed") break;
        await warte(30000);
    }
    const datei = messDatei(sha, "headless");
    const rel = (f) => path.relative(KOORD, f).split(path.sep).join("/");
    const roh = path.join(DIR, "messung", "roh", sha.slice(0, 8) + "-headless");
    git(["fetch", "-q", "origin", "+refs/heads/" + zweig + ":refs/remotes/origin/" + zweig], KOORD);
    const da = (p) => spawnSync("git", ["cat-file", "-e", "origin/" + zweig + ":" + p], { cwd: KOORD }).status === 0;
    if (!da(rel(datei))) throw new Error("Farm: der Lauf " + lauf.html_url + " endete " + lauf.conclusion + " ohne " + rel(datei) + " auf " + zweig);
    git(["checkout", "origin/" + zweig, "--", rel(datei), ...(da(rel(roh)) ? [rel(roh)] : [])], KOORD);
    const m = JSON.parse(fs.readFileSync(datei, "utf8"));
    const von = "farm:" + lauf.id;
    for (const st of meine) {
        const id = schluessel(st);
        const e = (m.je[id] && String(m.je[id].host).startsWith(von) && m.je[id]) || (m.ungemessen && m.ungemessen[id] && String(m.ungemessen[id].host).startsWith(von) && m.ungemessen[id]);
        console.log(e ? stationsZeile(id, e) : "  OFFEN " + id + " · der Farm-Lauf trug kein Urteil · Bahn farm · ungemessen, `run --offen` misst neu");
    }
    if (lauf.conclusion !== "success") {
        console.log("Farm-Lauf " + lauf.html_url + " endete " + lauf.conclusion);
        process.exitCode = 1;
    }
    console.log("→ " + rel(datei) + " (von " + zweig + ", Lauf " + lauf.id + ")");
    return m;
}

async function run(opt) {
    if (!opt.sha) throw new Error("--sha fehlt");
    if (!GERAETE.includes(opt.geraet)) throw new Error("--geraet radeon|gtx|headless");
    const gpuLauf = gpuLaufFuer(opt.geraet, opt.farm);
    const bahnenSoll = Number(opt.bahnen || 3);
    if (!(bahnenSoll >= 1 && bahnenSoll <= MAX_BAHNEN && Number.isInteger(bahnenSoll)))
        throw new Error("--bahnen " + opt.bahnen + ": 1 bis " + MAX_BAHNEN + " (je Bahn ein Port-Band)");
    const band = (b) => portBand(opt.portBasis || 7700, opt.geraet, b);
    for (let b = 0; b < bahnenSoll; b++) band(b);
    const a = auswahl(opt);
    const { repo, sha, tot } = a;
    let meine = a.meine;
    if (!meine.length) {
        console.log("Punkte-Maschine: am " + sha.slice(0, 8) + " ist jede Station auf " + opt.geraet + " frisch gemessen");
        return null;
    }
    // headless misst nie am Platz: ohne --farm ruft run die Farm und holt ihre Messung (farmRufen)
    if (opt.geraet === "headless" && !opt.farm && !opt.trocken) return farmRufen(opt, a);
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
    fs.mkdirSync(path.dirname(datei), { recursive: true }); // die Farm checkt messung/ nie aus (ihr Teil trägt nur die Scheibe)
    let m = fs.existsSync(datei) ? JSON.parse(fs.readFileSync(datei, "utf8")) : null;
    const host = opt.farm || os.hostname();
    if (!m || m.sha !== sha) m = { sha, geraet: opt.geraet, zeit: null, host, je: {} };
    const hilfe = hilfeText();
    // DIE WAND PFAD: eine Station mit totem Glob am SHA fährt nie — sie ist ROT beim Glob (R6 wäre für ihn blind)
    for (const st of meine.filter((s) => tot(s).length)) {
        const grund = pfadGrund(tot(st), "am " + sha.slice(0, 8));
        m.je[schluessel(st)] = { gruen: false, zahl: grund, exit: null, minuten: 0, grund, zeit: new Date().toISOString(), abdruck: abdruck(st, hilfe), ...(opt.farm ? { host } : {}) };
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
    const ctx0 = { koord: KOORD, geraet: opt.geraet, bash: findeBash(), plaetze: bahnen, gpuLauf };
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
            const e = { ...es[i], zeit, abdruck: abdruck(st, hilfe), port: ctx.port, bahn: istZeit(g) ? "allein" : b + 1 + "/" + bahnen, ...(opt.farm ? { host } : {}),
                ...(i > 0 ? { zwilling: ids[0] } : {}) };
            eintragen(m, id, e);
            console.log(stationsZeile(id, e));
        });
        m.zeit = zeit;
        m.host = host;
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
// DIE ZWILLINGE EINER LISTE (27.10., Karte lange-stationen): der Messplatz der OMEN fährt Station für Station (`run --nur <id>`) —
// so fuhr der Lauf von speicher.K1#1 und #2 zweimal (e7a28b06 GTX 12,43 + 12,42 min). `gruppen` nennt je Lauf die Ids seiner
// Zwillinge in der Reihe von `nur` (nur Gelistete), der Messplatz fährt je Zeile EIN `--nur`
function zwillingsGruppen(stationen, geraet, nur) {
    if (!GERAETE.includes(geraet)) throw new Error("--geraet radeon|gtx|headless");
    const meine = stationen.filter((st) => geraeteVon(st).includes(geraet));
    const ids = nur ? nur.split(",") : meine.map(schluessel);
    const liste = ids.map((id) => meine.find((st) => schluessel(st) === id) || id);
    const fremd = liste.filter((x) => typeof x === "string");
    if (fremd.length) throw new Error("--nur " + fremd.join(",") + ": keine Station auf " + geraet);
    return gruppiere(liste).map((g) => g.map(schluessel));
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
// messungen: Liste {sha, geraet, je}; geaendert(messSha) → Liste der Dateien bis zum Kopf ohne Stempel (stempelDateien; wirft,
// wenn unbekannt) — die jüngste frische Messung je Station und Gerät (Abdruck gleich, Linse und Pfad seit der Messung unberührt;
// Werkzeug außerhalb der Linse ist kein Wechsel) — das EINE Frische-Urteil für die Buchung und für `run --offen`. opt.tot(st) →
// die toten Globs am Ziel-Stand (Wand PFAD) · opt.roh(sha, geraet, id) → die Roh-Ausgabe einer Messung ohne eigenen Zeugen (Wand
// GPU; "" wenn keine) · opt.linsen(st, messSha) → die Linse der Station am Mess-SHA und am Ziel (linsenAm; wirft, wenn unlesbar)
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
        if (tot.length) return { gruen: false, ungemessen: true, tot: true, grund: pfadGrund(tot, "am Kopf") };
        const ab = abdruck(st, hilfe);
        let alt = 0, fremd = 0, unbekannt = 0, ohneZeugen = null, taeter = [], linse = 0, linsenTaeter = [], unlesbar = null;
        const frisch = [];
        for (const m of messungen) {
            if (m.geraet !== g || !m.je || !m.je[id]) continue;
            const e = m.je[id];
            if (e.abdruck !== ab) { fremd++; continue; }
            const d = diff(m.sha);
            if (d.fehler) { unbekannt++; continue; }
            let L;
            try { L = new Set(opt.linsen ? opt.linsen(st, m.sha) : []); } catch (e) { unlesbar = e.message; continue; }
            const l = d.dateien.filter((f) => L.has(f));
            if (l.length) { linse++; linsenTaeter = l; continue; }
            const t = d.dateien.filter((f) => !WERKZEUG_PFAD.test(f) && trifftPfad(f, st.pfad));
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
        const nenne = (xs) => xs.slice(0, 3).join(", ") + (xs.length > 3 ? " +" + (xs.length - 3) : "");
        return { gruen: false, ungemessen: true, grund: ohneZeugen ? "Wand GPU: " + ohneZeugen : linse ? "Linse seit der Messung geändert (R6: " + nenne(linsenTaeter) + ")" : alt ? "Pfad seit der Messung geändert (R6: " + nenne(taeter) + ")" : unlesbar ? "Linse unlesbar — kein R6-Urteil (" + unlesbar + ")" : unbekannt ? "Mess-SHA unbekannt — kein R6-Urteil" : fremd ? "Station seit der Messung geändert" : "ungemessen (R10)" };
    };
}

// DIE PUNKTE-REGEL (R2) eines Kriteriums — die EINE für die Buchung und für gtx-nutzen: sts die Stationen des Kriteriums,
// urteil(st, g) → { gruen } je Station und Gerät. 1 = jede Staffel-1-Station auf mindestens einem Gerät grün (`beide`: auf
// jedem) · 2 = dazu jede Staffel-2-Station auf JEDEM Gerät grün · sonst 0
function stufen(sts, urteil) {
    const stufe = (n, alle) => {
        const xs = sts.filter((s) => s.staffel === n);
        const r = xs.map((s) => ({ s, je: geraeteVon(s).map((g) => ({ g, e: urteil(s, g) })) }));
        const ok = xs.length > 0 && r.every((x) => (alle || x.s.beide ? x.je.every((y) => y.e.gruen) : x.je.some((y) => y.e.gruen)));
        return { ok, r };
    };
    const s1 = stufe(1, false), s2 = stufe(2, true);
    return { s1, s2, punkte: s1.ok && s2.ok ? 2 : s1.ok ? 1 : 0 };
}

function buchen(kopf, stationen, messungen, geaendert, hilfe = hilfeText(), fehlt = [], opt = {}) {
    const stand = frischUrteil(messungen, geaendert, hilfe, opt);
    const je = {};
    const kriterien = [...new Set(stationen.map((s) => s.kriterium))].sort();
    for (const k of kriterien) {
        const { s1, s2, punkte } = stufen(stationen.filter((s) => s.kriterium === k), stand);
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
            // ungemessen/tot: das Frische-Urteil selbst — keine frische Messung am Kopf (tot: die Wand PFAD, eine Messung heilt sie nie)
            stationen: [s1, s2].flatMap((s) => s.r.flatMap((x) => x.je.map((y) => ({ id: schluessel(x.s), geraet: y.g, gruen: !!y.e.gruen, zahl: y.e.zahl || null, sha: y.e.sha || null, grund: y.e.grund || null,
                ...(y.e.ungemessen ? { ungemessen: true } : {}), ...(y.e.tot ? { tot: true } : {}), ...(x.s.beide ? { beide: true } : {}) })))),
        };
    }
    return { kopf, je };
}

function ladeMessungen(mdir = path.join(DIR, "messung")) {
    if (!fs.existsSync(mdir)) return [];
    return fs.readdirSync(mdir).filter((f) => /\.json$/.test(f)).map((f) => JSON.parse(fs.readFileSync(path.join(mdir, f), "utf8")));
}

// R6 urteilt über die Bytes OHNE Versions-Stempel (?v=, "version", VERSION) — 23.10.: jede Versions-Stufe stempelt index.html
// und die Worker neu, und die Buchung am nächsten Kopf warf darum jede Station mit index.html im Pfad weg, obwohl kein Spiel-Byte
// anders war. Mess-Werkzeug (scripts/, spec/, .github/, docs/, artifacts/, *.md) ist kein Weltwechsel — AUSSER der Linse der
// Station (linsenVon): der Abdruck hasht nur den Befehls-String, nie den Inhalt der Linse (28.10.: nach einem Linsen-Umbau galt
// die Messung mit der alten Linse still als frisch).
const WERKZEUG_PFAD = /^(scripts|spec|\.github|docs|artifacts)\/|\.md$/;
const VERSIONS_STEMPEL = [
    [/\?v=[0-9A-Za-z._-]+/g, "?v="],
    [/("version"\s*:\s*")[^"]*"/g, '$1"'],
    [/(VERSION\s*=\s*["'`])[^"'`]*(["'`])/g, "$1$2"],
];
const ohneStempel = (z) => VERSIONS_STEMPEL.reduce((s, [rx, e]) => s.replace(rx, e), z);
// namen: git diff --name-only · diffText: git diff -U0 über dieselben Stände → die Dateien, deren Bytes ohne Stempel sich änderten
// (Werkzeug eingeschlossen — welches davon zählt, urteilt frischUrteil je Station)
function stempelDateien(namen, diffText) {
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
        const d = je.get(f);
        if (!d || d.bin) return true;
        return d.weg.sort().join("\n") !== d.neu.sort().join("\n");
    });
}

// DIE LINSE EINER STATION (R6 über das Werkzeug, 28.10.): jede Datei unter scripts/, die ihr Befehl oder ihre Umgebung nennt
// ("scripts/…", "./scripts/…", "{BAUM}/scripts/…"), jede Werkzeug-Datei, die ihr pfad trifft, und jede lokale Datei, die diese
// per require("./…") laden — der Aufruf-Gang `rufe` der Stamm-Bibliothek (scripts/lib/stamm.cjs, acorn), kein zweiter Parser.
// dateien: die Dateien am Stand · lies(f) → Text am Stand oder null · rufe: stammAm(…).rufe. Ein unlesbarer Text wirft (beim Namen)
const LINSE_IM_BEFEHL = /(?<![\w$./-])(?:\{BAUM\}\/|\.\/)?(scripts\/[\w./-]*\w)/g;
function linsenVon(st, dateien, lies, rufe) {
    const da = dateien instanceof Set ? dateien : new Set(dateien);
    const text = st.befehl.join(" ") + " " + Object.values(st.env || {}).join(" ");
    const offen = [...text.matchAll(LINSE_IM_BEFEHL)].map((m) => m[1]).filter((f) => da.has(f));
    const pfad = st.pfad.map(globRegex);
    for (const f of da) if (WERKZEUG_PFAD.test(f) && pfad.some((re) => re.test(f))) offen.push(f);
    const linse = new Set();
    while (offen.length) {
        const f = offen.shift();
        if (linse.has(f)) continue;
        linse.add(f);
        if (!/\.[cm]?js$/.test(f)) continue;
        const t = lies(f);
        if (t == null) continue;
        let rs;
        try { rs = rufe(t); } catch (e) { throw new Error("Linse " + f + " unlesbar: " + e.message); }
        for (const r of rs) {
            const a = r.ziel === "require" && r.args[0];
            if (!a || a.type !== "Literal" || typeof a.value !== "string" || !/^\.\.?\//.test(a.value)) continue;
            const ziel = path.posix.normalize(path.posix.join(path.posix.dirname(f), a.value));
            const x = [ziel, ziel + ".cjs", ziel + ".js", ziel + ".json", ziel + "/index.js"].find((k) => da.has(k));
            if (x) offen.push(x);
        }
    }
    return [...linse].sort();
}
// DIE STAMM-BIBLIOTHEK des Spiels am Stand rev — aus git, nie aus dem Arbeitsbaum des Klons (er steht auf beliebigem Zweig);
// ihr acorn löst sie aus node_modules des Klons
function stammAm(repo, rev) {
    const Module = require("module");
    const f = path.join(repo, "scripts", "lib", "stamm.cjs");
    const m = new Module(f, module);
    m.filename = f;
    m.paths = Module._nodeModulePaths(path.dirname(f));
    m._compile(git(["show", rev + ":scripts/lib/stamm.cjs"], repo), f);
    return m.exports;
}
// opt.linsen der Buchung am Kopf: (st, messSha) → die Linse der Station am Mess-SHA UND am Kopf (ein require, das dazukam oder
// fiel, zählt), Texte je Blob einmal gelesen und geparst
function linsenAm(repo, kopf) {
    const { rufe } = stammAm(repo, kopf);
    const baeume = new Map(), texte = new Map(), rufeJe = new Map();
    const baum = (sha) => {
        if (!baeume.has(sha)) {
            const b = new Map();
            for (const z of git(["ls-tree", "-r", sha], repo).split(/\r?\n/)) {
                const m = /^\d+ blob ([0-9a-f]+)\t(.+)$/.exec(z);
                if (m) b.set(m[2], m[1]);
            }
            baeume.set(sha, { b, dateien: new Set(b.keys()) });
        }
        return baeume.get(sha);
    };
    const blobRufe = (t) => {
        if (!rufeJe.has(t)) rufeJe.set(t, rufe(t).map((r) => ({ ziel: r.ziel, args: r.args.slice(0, 1).map((a) => ({ type: a.type, value: a.value })) })));
        return rufeJe.get(t);
    };
    const linse = (st, sha) => {
        const { b, dateien } = baum(sha);
        const lies = (f) => {
            const id = b.get(f);
            if (!id) return null;
            if (!texte.has(id)) texte.set(id, git(["cat-file", "-p", id], repo));
            return texte.get(id);
        };
        return linsenVon(st, dateien, lies, blobRufe);
    };
    const je = new Map();
    return (st, sha) => {
        const k = schluessel(st) + "|" + sha;
        if (!je.has(k)) je.set(k, [...new Set([...linse(st, sha), ...linse(st, kopf)])]);
        return je.get(k);
    };
}

// die GTX-Stationen, deren Messung am Kopf Punkte ändern KANN — gefragt am EINEN Frische-Urteil der Buchung (s = buchen(…), je
// Station und Gerät gruen/ungemessen/tot) und an ihrer EINEN Punkte-Regel (stufen): eine gtx-Hälfte steht in der Liste, wenn sie
// am Kopf keine frische Messung trägt und eine Belegung der übrigen ungemessenen Hälften (sie fahren im selben Takt auf Radeon
// und Farm) ihren Ausgang über die Punkte des Kriteriums entscheiden lässt. Frisch Gemessenes ist Tatsache, eine Messung am Kopf
// wiederholte es (26.10.: takt5z maß 43 Stationen in ~6 h, auch Staffel 1 hinter grüner Radeon). 27.10.: das alte Urteil daneben
// verlangte Radeon-Hälfte und Staffel 1 JETZT grün — am Kopf a03b7b06 waren sie R6-alt und fuhren im selben Takt, 9 Staffeln 2
// mit alter gtx-Hälfte fehlten in der Liste, gebucht Σ 113 statt ≥ 123
function gtxNutzen(s) {
    const ja = [], nein = [];
    const wo = (id, g) => id + "|" + g;
    for (const [k, e] of Object.entries(s.je)) {
        const ids = [...new Set(e.stationen.map((x) => x.id))];
        const sts = ids.map((id) => ({ kriterium: k, staffel: Number(id.slice(id.lastIndexOf("#") + 1)), geraet: e.stationen.filter((x) => x.id === id).map((x) => x.geraet),
            ...(e.stationen.some((x) => x.id === id && x.beide) ? { beide: true } : {}) }));
        const ist = new Map(e.stationen.map((x) => [wo(x.id, x.geraet), x]));
        const offen = e.stationen.filter((x) => x.ungemessen && !x.tot).map((x) => wo(x.id, x.geraet));
        for (const id of ids.filter((i) => ist.has(wo(i, "gtx")))) {
            const ich = wo(id, "gtx"), rest = offen.filter((w) => w !== ich);
            let nutzt = false;
            for (let b = 0; offen.includes(ich) && !nutzt && b < 1 << rest.length; b++) {
                const p = (gtx) => stufen(sts, (st, g) => {
                    const w = wo(schluessel(st), g), i = rest.indexOf(w);
                    return { gruen: w === ich ? gtx : i >= 0 ? ((b >> i) & 1) === 1 : ist.get(w).gruen };
                }).punkte;
                nutzt = p(true) !== p(false);
            }
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
        // `beide`: die 1 hält nur auf jedem Gerät — gemessen wird wie eine Staffel 2 (ganz grün hält, ein Heil-Versuch misst)
        if (st.staffel === 1 && st.beide) {
            if (ge.every((g) => da(id, g) && da(id, g).gruen) || heil) for (const g of ge) plan[g].push(id);
            else plan.uebersprungen.push(id);
            continue;
        }
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
    // ein Heil-Versuch ist jedes Kriterium, das ein Commit beim Namen nennt, UND jedes, dessen Zweig laut weg.json (wellen: Staffel →
    // Zweig) im Zug landete — 28.10.: „Merge siedlung-k1-innen in integ-probe" nennt kein Kriterium, der Plan übersprang siedlung.K1#2,
    // leib.K2#2 und vegetation.K4#2 als „rot ohne Heil-Versuch", obwohl ihre Zweige gelandet waren
    const genannt = new Set((git(["log", "--format=%B", alt + ".." + neu], repo).match(/\b[a-z]+\.K\d\b/g) || []));
    const gelandet = new Set(git(["log", "--merges", "--format=%s", alt + ".." + neu], repo).split("\n").map((z) => (/^Merge (\S+) in /.exec(z) || [])[1]).filter(Boolean));
    const weg = path.join(DIR, "weg.json");
    for (const w of fs.existsSync(weg) ? JSON.parse(fs.readFileSync(weg, "utf8")).wellen || [] : [])
        for (const [staffel, zweig] of Object.entries(w.staffeln || {})) if (gelandet.has(zweig)) genannt.add(staffel.replace(/#\d+$/, ""));
    const minVon = (id) => Math.max(0, ...["radeon", "gtx"].map((g) => (da(id, g) && da(id, g).minuten - (da(id, g).warten || 0)) || 0));
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
        stempelDateien(git(["diff", "--name-only", sha, kopfVoll], repo), git(["diff", "-U0", "--no-color", sha, kopfVoll], repo)),
        hilfeText(), fehlt, { tot: (st) => toteGlobs(st.pfad, dateien), roh: rohAus(), linsen: linsenAm(repo, kopfVoll) });
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
    // (1a) DIE PROBEN: jede Station urteilt ihre Roh-Ausgaben (die Mutanten der Soll-Tafel ROT), eine falsche Probe beim Namen
    {
        const n = echt.stationen.reduce((s, st) => s + (st.proben || []).length, 0);
        const falsch = probenUrteil(echt.stationen);
        pruef("PROBEN jede Station urteilt ihre Roh-Ausgaben wie erwartet (" + n + " Proben)", n > 0 && falsch.length === 0, falsch.join(" | "));
        const luegt = probenUrteil([{ kriterium: "a.K1", staffel: 1, urteil: (j, l) => ({ gruen: /GRÜN/.test(l.stdout), zahl: "z" }),
            proben: [{ name: "Roh", stdout: "GRÜN", gruen: true }, { name: "Mutante", stdout: "ROT", gruen: true }] }]);
        pruef("PROBEN eine Probe, deren Urteil nicht stimmt, beim Namen", luegt.join() === "a.K1#1 Mutante: ROT statt GRÜN (z)", luegt.join());
    }
    // (1b) R6 liest Bytes ohne Stempel: Versions-Stempel fallen, Code, Binär und Werkzeug bleiben (welches Werkzeug zählt, urteilt
    // frischUrteil an der Linse der Station)
    {
        const namen = "index.html\nscripts/lib/welt-boot.cjs\nstamm/kampf.js\ngelaende-core.js\nbild.png\nREADME.md";
        const dt = [
            "diff --git a/index.html b/index.html", "--- a/index.html", "+++ b/index.html", "@@ -1 +1 @@",
            '-<script src="phyto-core.js?v=18.546.73" defer></script>', '+<script src="phyto-core.js?v=18.546.74" defer></script>',
            "diff --git a/stamm/kampf.js b/stamm/kampf.js", "--- a/stamm/kampf.js", "+++ b/stamm/kampf.js", "@@ -9 +9 @@", "-x = 1;", "+x = 2;",
            "diff --git a/gelaende-core.js b/gelaende-core.js", "@@ -1 +1 @@", '-importScripts("a.js?v=1.2");', '+importScripts("a.js?v=1.3");', "+neu();",
            "diff --git a/bild.png b/bild.png", "Binary files a/bild.png and b/bild.png differ",
        ].join("\n");
        const w = stempelDateien(namen, dt).join(",");
        pruef("R6 ohne Stempel: Stempel fallen, Code, Binär und Werkzeug bleiben", w === "scripts/lib/welt-boot.cjs,stamm/kampf.js,gelaende-core.js,bild.png,README.md", w);
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
        // `beide`: eine Staffel 1, deren Text beide Geräte nennt, trägt es; nie an Staffel 2 oder an einem Gerät
        const pb = { ...st0, kriterium: "profiband.K1", geraet: ["radeon", "gtx"], gpu: true, zeit: true, quelle: "1 = Frame p95 ≤ 33 ms (der Boden von PFLICHT E) in jeder Bewegungszelle an beiden Geräten" };
        const bf = [pb, { ...pb, beide: true, geraet: "radeon" }, { ...st0, staffel: 2, beide: true, geraet: ["radeon", "gtx"], gpu: true, quelle: "2 = überall, dazu endet jeder Lauf in See oder Meer" }]
            .map((s) => pruefeStationen([s, ...(s.staffel === 2 ? [st0] : [])], karte).fehler.join(" | "));
        pruef("FORMAT-ROT die Staffel 1 nennt beide Geräte ohne beide · beide an einem Gerät · beide an Staffel 2",
            /nennt beide Geräte — beide: true/.test(bf[0]) && /beide nur als true/.test(bf[1]) && /beide nur als true/.test(bf[2]) && pruefeStationen([{ ...pb, beide: true }], karte).fehler.length === 0, bf.join(" || "));
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
        // (3c) DAS SCHLOSS DES RECHNERS: headless nimmt einen Platz (bild) neben den Bahnen der Karte, ohne Karte und ohne Zeugen
        e = await fahreStation({ ...st0, befehl: ["node", "-e", "console.log(process.env.LINSE_GPU + ' ' + process.env.GPU_LAUF_ART)"],
            urteil: (j, l) => ({ gruen: /schloss punkte-headless-1 120/.test(l.stdout) && /software bild/.test(l.stdout), zahl: l.stdout.trim().split("\n").join(" | ") }) },
            { ...c, geraet: "headless", deckelMinS: 120 });
        pruef("LÄUFER headless nimmt einen Platz im Schloss des Rechners (ein Zeit-Lauf misst allein), nie die Karte", e.gruen === true && e.gpu === undefined, JSON.stringify(e));
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
        e = await fahreStation({ ...gs, befehl: ["node", "-e", kind, "{AUS}"], urteil: (j, l) => ({ gruen: j.n === 0 && /^\[linse-gpu\] nvidia\/pascal$/m.test(l.stdout), zahl: "n " + j.n }) }, { ...ctx("kind"), gpuLauf: falsch });
        pruef("WAND GPU der Zeuge liest das Log eines Kind-Prozesses, das Urteil sieht seinen Adapter → GRÜN", e.gruen === true && e.gpu === "nvidia/pascal", JSON.stringify(e));
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
        // (3e) DAS WARTEN: die Minuten bis zur Zeile „gpu-lauf: Schloss …“ stehen als `warten` neben `minuten` (die Arbeit ist die Differenz)
        const c5 = { ...ctx("wartet"), gpuLauf: path.join(tmp, "wartet.sh"), stillS: 30 };
        fs.writeFileSync(c5.gpuLauf, '#!/bin/bash\nN="$1"; shift\necho "gpu-lauf: $N (zeit) wartet auf Vorfahrt" >&2\nsleep 3\necho "gpu-lauf: Schloss $N (zeit) nach 3 s" >&2\n"$@"\n');
        const e5 = await fahreStation({ ...st0, geraet: "radeon", gpu: true, befehl: mitKarte(["[linse-gpu] amd/rdna-3"]), urteil: lies }, { ...c5, deckelMinS: 120 });
        pruef("LÄUFER das Warten am Schloss steht als `warten` (3 s vor dem Schloss), ein Lauf ohne Schloss trägt keins",
            e5.gruen === true && e5.warten >= 0.05 && e5.warten <= e5.minuten && typeof e4.warten === "number" && !("warten" in e2), JSON.stringify([e5, e4.warten, e2]));
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
    // oder sein Partner unter dem Schloss steht; der Test öffnet eine Tür erst, wenn der Wartende sein Warten gemeldet hat. Auch die
    // Wächter zählen Ereignisse (27.10., Karte ci-wackler-zensus: unter Last rissen die 120-s-Fenster von bis und die 60-s-Schleifen
    // des Stubs, ruhig 64/64): bis wartet, solange der Lauf lebt, der das Ereignis bringt, der Stub auf Tür oder Partner (dessen
    // Lauf endet, ohne zu stehen, schreibt der Test „X“); ein Lauf, der nie kommt, endet am Schloss mit Exit 75 beim Namen
    if (findeBash()) {
        const wz = GPU_LAUF;
        const fw = (p) => p.split(path.sep).join("/");
        const schlossEnv = (n) => ({ GPU_SCHLOSS: fw(path.join(tmp, "bahn-" + n)), GPU_HOOK_LOG: fw(path.join(tmp, "bahn-" + n + ".hook.log")),
            GPU_NACHT: "", GPU_WORKER_BILD: "Kein.Worker.exe", GPU_LAUF_TAKT_S: "1" });
        // $1 Log · $2 wer · $3 {AUS} oder leer · $4 Tür oder leer · $5 Partner oder leer (er steht „S“ oder kam nie „X“)
        const STUB = 'echo "[linse-gpu] amd/rdna-3"; echo "S $2" >> "$1"; ' +
            'while [ -n "$4" ] && [ ! -e "$4" ]; do sleep 0.1; done; ' +
            'while [ -n "$5" ] && ! grep -qx "[SX] $5" "$1"; do sleep 0.1; done; ' +
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
        // wartet auf ein Ereignis, solange der Lauf r lebt, der es bringt — endet er ohne, ist es false (ROT mit seinem Exit)
        const bis = async (f, r) => { while (!f()) { if (r.code !== undefined) return f(); await warte(100); } return true; };
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
            // der Deckel des Läufers ist nur der Wächter (eine Stunde), nie das Maß: A hält seinen Platz, bis B steht
            await fahrePlan([G("A", false, "B"), G("Z", true, ""), G("B", false, "A")], 2, async (g, b) => {
                es.push(await fahreGruppe(g, { ...ctx("plan-" + g[0].befehl[5]), gpuLauf: wz, bahn: b, plaetze: 2, deckelMinS: 3600 }));
                if (!spannen(log)[g[0].befehl[5]]) fs.appendFileSync(log, "X " + g[0].befehl[5] + "\n");
            });
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
            const ev = [await bis(steht(log, "X"), x)];
            const z = lauf(env, "zeit", 2, "Z", log);
            ev.push(await bis(wartet(z), z));
            const y = lauf(env, "bild", 2, "Y", log);
            ev.push(await bis(wartet(y), y));
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
            const ev = [await bis(steht(log, "P"), p)];
            const q = lauf(env, "bild", 1, "Q", log);
            ev.push(await bis(wartet(q), q));
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
            const ev = [await bis(steht(log, "X"), x)];
            fs.appendFileSync(env.GPU_HOOK_LOG, "2026-10-26 10:00:00 start ci-probe 1/1 echt: wartet auf Schloss von 'probe-X'\r\n");
            const y = lauf(env, "bild", 2, "Y", log);
            ev.push(await bis(wartet(y), y));
            fs.writeFileSync(tuer, "");
            await x.fertig;
            const hook = await bis(() => { try { fs.mkdirSync(env.GPU_SCHLOSS); return true; } catch (_e) { return false; } }, y);
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
            const ev = [await bis(steht(log, "V1"), v1)];
            const v2 = lauf(env, "bild", 2, "V2", log, t2);
            ev.push(await bis(steht(log, "V2"), v2));
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
            const ev = [await bis(() => /wartet auf Nachtruhe 0000-2400/.test(n.err), n)];
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
    {
        const sb = { ...s1, beide: true };
        const nur = buchen("kopf", [sb], [M("a1", "radeon", "gelaende.K4#1", sb, true)], keine, h);
        const zwei = buchen("kopf", [sb], [M("a1", "radeon", "gelaende.K4#1", sb, true), M("b2", "gtx", "gelaende.K4#1", sb, true)], keine, h);
        pruef("BUCHUNG Staffel 1 mit beide: ein grünes Gerät → 0, beide grün → 1", nur.je["gelaende.K4"].punkte === 0 && /gelaende.K4#1 gtx/.test(nur.je["gelaende.K4"].beleg) && zwei.je["gelaende.K4"].punkte === 1,
            nur.je["gelaende.K4"].beleg + " / " + zwei.je["gelaende.K4"].beleg);
        const gn = gtxNutzen(nur);
        pruef("GTX-NUTZEN Staffel 1 mit beide hinter grüner Radeon bleibt in der Liste", gn.ja.join() === "gelaende.K4#1", JSON.stringify(gn));
    }
    // (5b) DIE LINSE an der Buchung (R6 über das Werkzeug): ein Umbau der Linse — im Befehl genannt oder per require geladen —
    // macht die Messung alt; fremdes Werkzeug nie. Der require-Gang ist rufe der Stamm-Bibliothek am Kopf des Spiel-Klons
    {
        const { rufe } = stammAm(spielRepo(), "origin/main");
        const texte = {
            "scripts/diag-x.cjs": '#!/usr/bin/env node\nconst { pruefer } = require("./lib/y.cjs");\nconst ort = require("../spec/ort.json");\n',
            "scripts/lib/y.cjs": 'module.exports = require("./z");\n', "scripts/lib/z.cjs": "module.exports = 1;\n", "scripts/lib/fremd.cjs": "1;\n",
            "spec/ort.json": "{}", "stamm/wasser-hydro.js": "",
        };
        const sl = { ...s1, befehl: ["node", "scripts/diag-x.cjs", "--port", "{PORT}"] };
        const ls = linsenVon(sl, Object.keys(texte), (f) => (f in texte ? texte[f] : null), rufe);
        pruef("LINSE Befehl und require-Hülle (stamm.cjs rufe)", ls.join() === "scripts/diag-x.cjs,scripts/lib/y.cjs,scripts/lib/z.cjs,spec/ort.json", ls.join());
        const ml = [M("a1", "radeon", "gelaende.K4#1", sl, true)];
        const radeon = (w) => w.je["gelaende.K4"].stationen.find((x) => x.geraet === "radeon");
        let w = buchen("kopf", [sl], ml, () => ["scripts/lib/z.cjs"], h, [], { linsen: () => ls });
        pruef("LINSE geändert → ungemessen mit dem Grund", w.je["gelaende.K4"].punkte === 0 && radeon(w).ungemessen && radeon(w).grund === "Linse seit der Messung geändert (R6: scripts/lib/z.cjs)", JSON.stringify(radeon(w)));
        w = buchen("kopf", [sl], ml, () => ["scripts/lib/fremd.cjs", "README.md"], h, [], { linsen: () => ls });
        pruef("LINSE unverändert (fremdes Werkzeug geändert) → frisch", w.je["gelaende.K4"].punkte === 1 && radeon(w).gruen, w.je["gelaende.K4"].beleg);
        w = buchen("kopf", [sl], ml, () => [], h, [], { linsen: () => { throw new Error("Linse scripts/diag-x.cjs unlesbar: x"); } });
        pruef("LINSE unlesbar → ungemessen beim Namen", w.je["gelaende.K4"].punkte === 0 && /Linse unlesbar — kein R6-Urteil/.test(radeon(w).grund), radeon(w).grund);
    }
    // (6) Übergang in gen.cjs
    const stand = { kopf: "abcd1234", je: { "gelaende.K4": { punkte: 2, beleg: "Maschine: z" } } };
    const k0 = { name: "n", punkte: 1, beleg: "Hand" };
    const k1 = maschinenKriterium(stand, "gelaende", 3, k0), k2 = maschinenKriterium(stand, "gelaende", 1, k0);
    pruef("GEN registriert → Maschine, sonst Hand", k1.punkte === 2 && k1.maschine && k1.beleg === "Maschine: z" && k2 === k0, JSON.stringify([k1, k2]));
    const pf = standPruefen(stand, "ffff0000", new Set(["gelaende.K4"]));
    pruef("GEN Kopf ungleich ist ROT", pf.some((f) => /Kopf abcd1234/.test(f)), pf.join(" | "));
    // X: eine Hälfte am Kopf — gruen frisch gemessen, alt ohne frische Messung (das Frische-Urteil der Buchung: ungemessen)
    const X = (id, geraet, gruen, alt) => ({ id, geraet, gruen: !!gruen, ...(alt ? { ungemessen: true } : {}) });
    const nz = gtxNutzen({ je: {
        "a.K1": { stationen: [X("a.K1#1", "radeon", true), X("a.K1#1", "gtx", false, 1), X("a.K1#2", "radeon", true), X("a.K1#2", "gtx", false, 1)] },
        "b.K1": { stationen: [X("b.K1#1", "radeon", false), X("b.K1#1", "gtx", false, 1), X("b.K1#2", "radeon", true), X("b.K1#2", "gtx", false, 1)] },
        "c.K1": { stationen: [X("c.K1#1", "headless", true), X("c.K1#2", "radeon", false), X("c.K1#2", "gtx", false, 1)] },
        "d.K1": { stationen: [X("d.K1#1", "headless", false), X("d.K1#2", "radeon", true), X("d.K1#2", "gtx", false, 1)] },
        "e.K1": { stationen: [X("e.K1#1", "headless", true), X("e.K1#2", "radeon", true), X("e.K1#2", "gtx", true)] },
        "f.K1": { stationen: [X("f.K1#1", "headless", true), X("f.K1#2", "radeon", true), { ...X("f.K1#2", "gtx", false, 1), tot: true }] },
    } });
    pruef("GTX-NUTZEN Staffel 1 hinter grüner Radeon fällt, Staffel 2 nur, wo Staffel 1 stehen kann und die Radeon-Hälfte nicht frisch rot ist; frisch Gemessenes und die Wand PFAD nie",
        nz.ja.join() === "a.K1#2,b.K1#1,b.K1#2" && nz.nein.join() === "a.K1#1,c.K1#2,d.K1#2,e.K1#2,f.K1#2", JSON.stringify(nz));
    // DIE KLASSE 27.10. (a03b7b06, gebucht Σ 113 statt ≥ 123): eine Staffel 2 mit alter gtx-Hälfte steht in der Liste — vor dem
    // Takt (Radeon-Hälfte und Staffel 1 R6-alt, sie fahren im selben Takt) wie nach ihm (Radeon frisch grün); frisch gemessen nie.
    // Durch die echte Buchung (frischUrteil, R6), nicht an Hand gesetzten Zuständen
    {
        const r6 = (sha) => (sha === "v1" ? ["stamm/wasser-hydro.js"] : []);
        const vorher = ["radeon", "gtx"].flatMap((g) => [M("v1", g, "gelaende.K4#1", s1, true), M("v1", g, "gelaende.K4#2", s2, true)]);
        const amKopf = (g, id, st) => M("k0", g, id, st, true, "2026-10-23T12:00:00Z");
        const nach = [...vorher, amKopf("radeon", "gelaende.K4#1", s1), amKopf("radeon", "gelaende.K4#2", s2), amKopf("gtx", "gelaende.K4#1", s1)];
        const [a, z, c] = [vorher, nach, [...nach, amKopf("gtx", "gelaende.K4#2", s2)]].map((ms) => gtxNutzen(buchen("kopf", [s1, s2], ms, r6, h)));
        pruef("GTX-NUTZEN Staffel 2 mit R6-alter gtx-Hälfte steht in der Liste, gleich ob die Radeon-Hälfte alt oder frisch grün ist; frisch gemessen nie",
            a.ja.join() === "gelaende.K4#1,gelaende.K4#2" && z.ja.join() === "gelaende.K4#2" && c.ja.length === 0, JSON.stringify([a.ja, z.ja, c.ja]));
    }
    const P = (k, s, ge) => ({ kriterium: k, staffel: s, geraet: ge, befehl: ["node"], gpu: true });
    const V = (id, g, gruen) => ({ id, geraet: g, gruen, zahl: gruen ? "ok" : "rot" });
    const vor = [V("a.K1#1", "radeon", true), V("a.K1#1", "gtx", true), V("a.K1#2", "radeon", true), V("a.K1#2", "gtx", true),
        V("b.K1#1", "radeon", false), V("b.K1#1", "gtx", false), V("c.K1#1", "radeon", false), V("c.K1#1", "gtx", false),
        V("d.K1#1", "radeon", false), V("d.K1#1", "gtx", true), V("d.K1#2", "radeon", true), V("d.K1#2", "gtx", false)];
    const mp = messPlan([P("a.K1", 1, ["radeon", "gtx"]), P("a.K1", 2, ["radeon", "gtx"]), P("b.K1", 1, ["radeon", "gtx"]), P("c.K1", 1, ["radeon", "gtx"]), P("d.K1", 1, ["radeon", "gtx"]), P("d.K1", 2, ["radeon", "gtx"])],
        (id, g) => vor.find((x) => x.id === id && x.geraet === g) || null, new Set(["c.K1"]), (id) => id === "d.K1#1");
    pruef("MESS-PLAN Staffel 1 auf EINEM Gerät (Zeit auf der GTX), rot ohne Heil-Versuch fällt, genannt fährt beide, Staffel 2 nur ganz grün oder geheilt",
        mp.radeon.join() === "a.K1#1,a.K1#2,c.K1#1" && mp.gtx.join() === "a.K1#2,c.K1#1,d.K1#1" && mp.uebersprungen.join() === "b.K1#1,d.K1#2", JSON.stringify(mp));
    {
        const bv = [V("e.K1#1", "radeon", true), V("e.K1#1", "gtx", true), V("f.K1#1", "radeon", true), V("f.K1#1", "gtx", false)];
        const bp = messPlan([{ ...P("e.K1", 1, ["radeon", "gtx"]), beide: true }, { ...P("f.K1", 1, ["radeon", "gtx"]), beide: true }],
            (id, g) => bv.find((x) => x.id === id && x.geraet === g) || null, new Set(), () => true);
        pruef("MESS-PLAN Staffel 1 mit beide: ganz grün hält auf beiden Geräten, halb rot ohne Heil-Versuch fällt",
            bp.radeon.join() === "e.K1#1" && bp.gtx.join() === "e.K1#1" && bp.uebersprungen.join() === "f.K1#1", JSON.stringify(bp));
    }
    pruef("GEN unbekanntes Kriterium ist ROT", standPruefen({ kopf: "abcd1234", je: { "x.K1": {} } }, "abcd1234", new Set()).length === 1);
    // (7) DIE FARM: Scheiben (LPT, Zwillinge zusammen, Gewicht aus der jüngsten Messung), der Anbieter je Scheibe, die Vereinigung
    // der Teile (ersetzt, ungemessen, fehlende Scheibe beim Namen, fremder SHA wirft) und kein Schloss nur für headless
    {
        const S = (k, s, min, extra = {}) => ({ ...st0, kriterium: k, staffel: s, minuten: min, befehl: ["node", k], ...extra });
        const zw = S("a.K1", 2, 1, { befehl: ["node", "a.K1"] });
        const gs = gruppiere([S("a.K1", 1, 1), zw, S("b.K1", 1, 7), S("c.K1", 1, 5), S("d.K1", 1, 4), S("e.K1", 1, 3),
            S("f.K1", 1, 1, { env: { KI_ENDPUNKT: "http://127.0.0.1:11434/", KI_MODELL: "qwen3:4b-instruct" } })]);
        const mess = [{ geraet: "headless", je: { "a.K1#1": { minuten: 10, zeit: "2026-10-27T01:00:00Z" } } },
            { geraet: "headless", je: { "a.K1#1": { minuten: 0, zeit: "2026-10-27T02:00:00Z" } } },
            { geraet: "headless", je: { "a.K1#1": { minuten: 30, zeit: "2026-10-27T02:30:00Z" } } },
            { geraet: "radeon", je: { "b.K1#1": { minuten: 99, zeit: "2026-10-27T03:00:00Z" } } }];
        const p = scheibenPlan(gs, 3, laufGewicht(mess, "headless"));
        const ids = p.map((s) => s.gruppen.flat().map(schluessel).join(","));
        const ki = p.map((s) => kiModelle(s.gruppen).join(" "));
        pruef("FARM die Scheiben: die schwersten zuerst in die leichteste, Zwillinge EIN Lauf, Gewicht = die kürzeste der jüngsten 5 Messungen > 0 auf dem Gerät, sonst Soll",
            p.length === 3 && p.map((s) => s.min).join() === "10,10,10" && ids.join(" | ") === "a.K1#1,a.K1#2 | b.K1#1,e.K1#1 | c.K1#1,d.K1#1,f.K1#1" &&
            ki.join("|") === "||qwen3:4b-instruct" && scheibenPlan(gs, 99, () => 1).length === gs.length, JSON.stringify(p.map((s, i) => [s.min, ids[i], ki[i]])));
        const alt = { sha: "f1", geraet: "headless", host: "laptop", je: { "a.K1#1": { gruen: false, zahl: "rot", minuten: 3 }, "z.K1#1": { gruen: true, zahl: "z", minuten: 1 } } };
        const t1 = { name: "teil-1", m: { sha: "f1", geraet: "headless", host: "farm:7/1", zeit: "2026-10-27T10:00:00Z", je: { "a.K1#1": { gruen: true, zahl: "g", minuten: 2, host: "farm:7/1" }, "a.K1#2": { gruen: true, zahl: "g", minuten: 2, zwilling: "a.K1#1", host: "farm:7/1" } } } };
        const t2 = { name: "teil-2", m: { sha: "f1", geraet: "headless", host: "farm:7/2", zeit: "2026-10-27T10:05:00Z", je: {}, ungemessen: { "b.K1#1": { gruen: false, ungemessen: true, grund: "x" } } } };
        const v = vereineMessungen(alt, [t1, t2], "f1", "headless", "farm:7", [{ nr: 1, nur: "a.K1#1,a.K1#2" }, { nr: 2, nur: "b.K1#1" }, { nr: 3, nur: "c.K1#1,d.K1#1" }]);
        let wirft = "";
        try { vereineMessungen(alt, [{ name: "teil-9", m: { sha: "f2", geraet: "headless", je: {} } }], "f1", "headless", "farm:7"); } catch (e) { wirft = e.message; }
        pruef("FARM die Vereinigung: ein Teil ersetzt den alten Eintrag, Fremdes bleibt, ungemessen bleibt ungemessen, die fehlende Scheibe beim Namen, ein fremder SHA wirft",
            v.n === 3 && v.m.je["a.K1#1"].gruen && v.m.je["a.K1#1"].host === "farm:7/1" && v.m.je["z.K1#1"].gruen && !v.m.je["b.K1#1"] && v.m.ungemessen["b.K1#1"] &&
            v.m.host === "farm:7" && v.m.zeit === "2026-10-27T10:05:00Z" && !alt.je["a.K1#1"].gruen && v.fehlt.length === 1 && v.fehlt[0].nr === 3 &&
            v.fehlt[0].ids.join() === "c.K1#1,d.K1#1" && /teil-9 misst f2 headless statt f1 headless/.test(wirft), JSON.stringify([v, wirft]));
        const fe = farmEingaben([S("a.K1", 1, 1), zw], "f1", "koordination", "laptop-1-2");
        pruef("FARM der Ruf: die hier gewählte Liste reist als nur, die Marke findet den Lauf, origin nennt das Repo",
            JSON.stringify(fe) === JSON.stringify({ sha: "f1", auswahl: "nur", nur: "a.K1#1,a.K1#2", jobs: "12", koord: "koordination", marke: "laptop-1-2" }) &&
            repoSlug("https://github.com/MiguellD/AnazhRealm.git") === "MiguellD/AnazhRealm" && repoSlug("git@github.com:MiguellD/AnazhRealm") === "MiguellD/AnazhRealm",
            JSON.stringify(fe));
        let gpuWirft = "";
        try { gpuLaufFuer("radeon", "farm:7/1"); } catch (e) { gpuWirft = e.message; }
        pruef("FARM headless fährt auf dem Läufer ohne Schloss des Rechners, am Platz mit ihm; eine GPU-Station nie auf der Farm",
            gpuLaufFuer("headless", "farm:7/1") === null && gpuLaufFuer("headless", undefined) === GPU_LAUF && gpuLaufFuer("gtx") === GPU_LAUF && /nur headless/.test(gpuWirft), gpuWirft);
    }
    // (8) DIE ZWILLINGE EINER LISTE (Messplatz der OMEN): je Zeile ein Lauf, Zwillinge zusammen, die Reihe von nur, nur Gelistete
    {
        const Z = (k, s, b, ge = ["radeon", "gtx"]) => ({ kriterium: k, staffel: s, geraet: ge, befehl: ["node", b], env: {}, gpu: true });
        const zs = [Z("a.K1", 1, "x"), Z("a.K1", 2, "x"), Z("b.K1", 1, "y"), Z("c.K1", 1, "x", ["radeon"]), Z("d.K1", 1, "x")];
        const g1 = zwillingsGruppen(zs, "gtx", "b.K1#1,a.K1#2,d.K1#1").map((g) => g.join("+")).join(" ");
        const g2 = zwillingsGruppen(zs, "gtx").map((g) => g.join("+")).join(" ");
        let wirft = "";
        try { zwillingsGruppen(zs, "gtx", "c.K1#1"); } catch (x) { wirft = x.message; }
        pruef("GRUPPEN Zwillinge in EINEM Lauf, Reihe von nur, nur Gelistete, eine Station eines anderen Geräts ist ROT",
            g1 === "b.K1#1 a.K1#2+d.K1#1" && g2 === "a.K1#1+a.K1#2+d.K1#1 b.K1#1" && /c.K1#1: keine Station auf gtx/.test(wirft), JSON.stringify([g1, g2, wirft]));
    }
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
        else if (verb === "scheiben") scheibenCli(o);
        else if (verb === "vereine") vereineCli(o);
        else if (verb === "buchen") buchenCli(o);
        else if (verb === "gtx-nutzen") gtxNutzenCli(o);
        else if (verb === "plan") planCli(o);
        else if (verb === "gruppen") for (const g of zwillingsGruppen(ladeGeprueft().stationen, o.geraet, o.nur)) console.log(g.join(","));
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
            console.log("Verben: run --sha <sha> --geraet radeon|gtx|headless [--nur id,id] [--offen] [--trocken] [--bahnen 3] [--port-basis 7700] [--farm <name>] · gruppen --geraet <g> [--nur id,id] · scheiben --sha <sha> --geraet headless [--jobs 12] [--offen|--nur …] · vereine --sha <voll> --geraet headless --farm <name> --teile <dir> [--scheiben <json>] [--beginn <s>] · buchen --kopf <sha> · liste [--kopf <sha>] · selbsttest");
            process.exitCode = 2;
        }
    })().catch((e) => {
        console.error("PUNKTE ROT: " + (e && e.message));
        process.exitCode = 2;
    });
}

module.exports = { liesStand, maschinenKriterium, standPruefen, buchen, pruefeStationen, trifftPfad, toteGlobs, gpuZeuge, gpuWand, abdruck, fahreStation,
    frischUrteil, stempelDateien, linsenVon, linsenAm, ladeGeprueft, ladeMessungen, spielRepo, voll, git, schluessel, geraeteVon, hilfeText };
