// runde.cjs — DAS GESETZ DER RUNDE (Koordinator 19.11.). Befund: seit dem 17.11. begann der Landungs-Dienst der OMEN an 25 main-Koepfen
// eine Liste von 54 Stationen, 0 von 25 liefen bis zum Ende (Median 5) — jeder neue main-Kopf brach die Liste ab (SPRUNG). Jetzt:
//   1 EIN Mess-Kopf je Runde in EINER Datei (zug/runde.txt im Zweig koordination): Kopf, Startzeit, Stand je Geraet. Jedes Geraet
//     faehrt seine ganze Liste an DIESEM Kopf zu Ende; die naechste Runde nimmt den main-Kopf des Moments, in dem alle Geraete durch
//     sind — so steht nach jeder Runde jede Station als Paar am SELBEN Kopf (die Karte 2 bucht daraus).
//   2 die Reihe: zuerst die Stationen OHNE gebucht gruenes Paar (ungemessen, rot, neu in der Tafel), danach die gebucht gruenen.
//   3 frisches ROT an einer am vorigen Mess-Kopf gruenen Station: NUR diese Station wird ueber die Koepfe dazwischen halbiert
//     (`faelle` nennt sie, richter.sh --fall halbiert und nennt den Taeter-Kopf).
//   4 Halt, Weichen, Neustart: der Stand je Geraet steht in der Datei, die Liste ist eingefroren — es geht an derselben Station weiter.
//   5 ein Geraet ohne Fortschritt > 15 min in der Runde ist ALARM beim Namen (eine Zeile nach zug/erledigt.txt), nie stilles Warten.
// ZWEI GERAETE, EINE DATEI, KEIN MERGE: jedes Schreiben liest den frischen Stand von origin/koordination, ersetzt dort genau die eigene
// Zeile (oder oeffnet die Runde), baut den Commit mit commit-tree AUF diesem Stand und pusht; lehnt der Push ab (ein anderer schrieb
// dazwischen), beginnt es von vorn am neuen Stand. Es gibt nie einen Merge und nie einen Konflikt — dieselbe Klempnerei wie
// n0611/stufe/melde.cjs und richter-werk.cjs post.
// Verben (repo = ein Klon mit origin; Zeiten UTC):
//   lies <repo> <geraet>                    → "<n> <kopf40> <vorher40|-> <zustand> <liste>" oder "-" (keine Runde)
//   anlegen <repo> <kopf40>                 die erste Runde aus dem Bestand (nur, wenn die Datei keine traegt)
//   stand <repo> <geraet> <kopf40> <zustand> [--erledigt n] [--gesamt n] [--station id] [--liste L]   die eigene Zeile
//   durch <repo> <geraet> <kopf40> <main40> [--erledigt n]  die eigene Liste ist durch; sind alle durch und main weiter: die naechste Runde
//   weiter <repo> <main40>                  sind alle durch und main weiter als der Kopf: die naechste Runde
//   alarm <repo> <melder> [--geraet g --grund text]   jedes Geraet > RUNDE_ALARM_MIN ohne Fortschritt (oder: der genannte Grund,
//                                           sofort, z. B. die Platte): Feld alarm + EINE Zeile zug/erledigt.txt
//   reihe <messung-dir> <geraet> <liste>    → "<ungebucht,..>|<gebucht gruen,..>" (stderr: die Reihe mit Grund)
//   offen <git-dir> <ref> <geraet> <kopf> <liste>   → die Stationen der Liste ohne Eintrag in messung/<kopf8>-<geraet>.json am ref
//   faelle <repo> <geraet> <vorher> <kopf> <liste>  → je Zeile eine Station: GRUEN am vorher, ROT am kopf (dieses Geraet)
//   paare <repo> [anzahl]                   Paare am selben Kopf aus den Mess-Dateien von punkte-maschine (je Kopf + Summe)
//   bestand <repo> <geraet>                 → der juengste Kopf der main-Linie, an dem das Geraet eine Mess-Datei traegt
"use strict";
const fs = require("fs"), cp = require("child_process"), os = require("os"), path = require("path");
const ZWEIG = process.env.RUNDE_ZWEIG || "koordination";
const DATEI = process.env.RUNDE_DATEI || "zug/runde.txt";
const ERLEDIGT = process.env.RUNDE_ERLEDIGT || "zug/erledigt.txt";
const PM_ZWEIG = process.env.RUNDE_PM_ZWEIG || "punkte-maschine";
const MDIR = "meisterkarte-quelle/punkte/messung";
const GERAETE = (process.env.RUNDE_GERAETE || "gtx radeon").split(/\s+/).filter(Boolean);
const ALARM_MIN = Number(process.env.RUNDE_ALARM_MIN || 15), WIEDER_MIN = Number(process.env.RUNDE_ALARM_WIEDER_MIN || 60);
const LANG_MIN = Number(process.env.REIHE_LANG_MIN || 10);
const WER = { GIT_AUTHOR_NAME: "MiguellD", GIT_AUTHOR_EMAIL: "87209049+MiguellD@users.noreply.github.com",
    GIT_COMMITTER_NAME: "MiguellD", GIT_COMMITTER_EMAIL: "87209049+MiguellD@users.noreply.github.com" };
const jetzt = () => (process.env.RUNDE_JETZT ? new Date(process.env.RUNDE_JETZT) : new Date());
const iso = (d) => d.toISOString().replace(/\.\d{3}Z$/, "Z");
const k8 = (s) => String(s || "-").slice(0, 8);
const schlaf = (ms) => Atomics.wait(new Int32Array(new SharedArrayBuffer(4)), 0, 0, ms);
const gitIn = (repo) => (a, o = {}) => cp.execFileSync("git", a, { cwd: repo, encoding: "utf8", stdio: ["pipe", "pipe", "pipe"], maxBuffer: 256e6, ...o }).trim();
const zeigIn = (repo) => (ref, pfad) => { try { return cp.execFileSync("git", ["show", ref + ":" + pfad], { cwd: repo, stdio: ["ignore", "pipe", "ignore"], maxBuffer: 256e6 }).toString("utf8"); } catch { return null; } };
const liste = (s) => String(s || "").split(",").map((x) => x.trim()).filter((x) => x && x !== "-");

// ── DIE DATEI ──
const KOPF = [
    "# zug/runde.txt — DAS GESETZ DER RUNDE (Koordinator 19.11.): EIN Mess-Kopf je Runde. Jedes Geraet faehrt seine ganze Liste an",
    "# DIESEM Kopf zu Ende (keine Landung loest sie ab); die naechste Runde nimmt den main-Kopf des Moments, in dem alle Geraete durch",
    "# sind. Geschrieben NUR von zug/dienst/runde.cjs (frischer Stand von origin/koordination, die eine Zeile ersetzt, commit-tree,",
    "# Push — lehnt er ab, von vorn; nie ein Merge). Von Hand nichts aendern. Je Runde und je Geraet EINE Zeile:",
    "# runde <n> kopf <sha40> start <iso> vorher <sha40|->",
    "# <geraet> <offen|laeuft|halt|weicht|durch> <erledigt>/<gesamt> station <id|-> fortschritt <iso> alarm <iso|-> liste <ungebucht,..>|<gebucht gruen,..>",
];
function lies(text) {
    const r = { runde: null, g: {} };
    for (const l of String(text || "").split(/\r?\n/)) {
        if (!l.trim() || l.startsWith("#")) continue;
        const w = l.trim().split(/\s+/);
        if (w[0] === "runde") r.runde = { n: Number(w[1]), kopf: w[3], start: w[5], vorher: w[7] || "-" };
        else if (GERAETE.includes(w[0])) {
            const [e, s] = String(w[2] || "0/0").split("/");
            r.g[w[0]] = { zustand: w[1], erledigt: Number(e) || 0, gesamt: Number(s) || 0, station: w[4] || "-", fortschritt: w[6] || "-", alarm: w[8] || "-", liste: w[10] || "-" };
        }
    }
    return r;
}
const leer = (zeit) => ({ zustand: "offen", erledigt: 0, gesamt: 0, station: "-", fortschritt: zeit, alarm: "-", liste: "-" });
function text(r) {
    const z = [...KOPF];
    if (r.runde) {
        z.push(["runde", r.runde.n, "kopf", r.runde.kopf, "start", r.runde.start, "vorher", r.runde.vorher || "-"].join(" "));
        for (const g of GERAETE) {
            const e = r.g[g] || leer(r.runde.start);
            z.push([g, e.zustand, e.erledigt + "/" + e.gesamt, "station", e.station || "-", "fortschritt", e.fortschritt || "-", "alarm", e.alarm || "-", "liste", e.liste || "-"].join(" "));
        }
    }
    return z.join("\n") + "\n";
}
// aendere <repo> <botschaft> <f> — EIN Schreiben: f(r) aendert r am frischen Stand (Rueckgabe false: nichts zu schreiben, sonst
// optional { zeile } = eine Zeile fuer zug/erledigt.txt im selben Commit). Lehnt der Push ab, beginnt es am neuen Stand von vorn.
function aendere(repo, botschaft, f) {
    const git = gitIn(repo), zeig = zeigIn(repo);
    const IDX = path.join(os.tmpdir(), "runde-index-" + process.pid + ".tmp"), env = { ...process.env, ...WER, GIT_INDEX_FILE: IDX };
    let fehler = "";
    for (let v = 1; v <= 10; v++) {
        try {
            git(["fetch", "-q", "origin", "+refs/heads/" + ZWEIG + ":refs/runde/koord"]);
            const basis = git(["rev-parse", "refs/runde/koord"]);
            const alt = zeig(basis, DATEI) || "";
            const r = lies(alt);
            const aus = f(r);
            if (aus === false) return { r, geschrieben: false };
            const neu = text(r);
            if (neu === alt && !(aus && aus.zeile)) return { r, geschrieben: false };
            fs.rmSync(IDX, { force: true });
            git(["read-tree", basis], { env });
            git(["update-index", "--add", "--cacheinfo", "100644," + git(["hash-object", "-w", "--no-filters", "--stdin"], { input: neu }) + "," + DATEI], { env });
            if (aus && aus.zeile) {
                let e = zeig(basis, ERLEDIGT) || "";
                const nl = e.includes("\r\n") ? "\r\n" : "\n";
                if (e && !e.endsWith("\n")) e += nl;
                const d = jetzt(), zw = (n) => String(n).padStart(2, "0");
                const stempel = d.getFullYear() + "-" + zw(d.getMonth() + 1) + "-" + zw(d.getDate()) + " " + zw(d.getHours()) + ":" + zw(d.getMinutes());
                git(["update-index", "--add", "--cacheinfo", "100644," + git(["hash-object", "-w", "--no-filters", "--stdin"], { input: e + stempel + " " + aus.zeile + nl }) + "," + ERLEDIGT], { env });
            }
            const c = git(["commit-tree", git(["write-tree"], { env }), "-p", basis, "-F", "-"], { env,
                input: botschaft.slice(0, 72) + " [skip ci]\n\n" + (aus && aus.zeile ? aus.zeile.slice(0, 400) + "\n\n" : "") + "Co-Authored-By: Claude Fable 5.2 <noreply@anthropic.com>\n" });
            git(["push", "-q", "origin", c + ":refs/heads/" + ZWEIG]);
            fs.rmSync(IDX, { force: true });
            process.stderr.write("koordination " + c.slice(0, 8) + " " + botschaft.slice(0, 80) + "\n");
            return { r, geschrieben: true, commit: c };
        } catch (e) {
            fehler = String(e.message).split("\n")[0].slice(0, 200);
            schlaf(1000 + Math.floor(Math.random() * 4000) * Math.min(v, 4));
        }
    }
    fs.rmSync(IDX, { force: true });
    process.stderr.write("RUNDE: Schreiben scheiterte 10x (" + fehler + ")\n");
    process.exit(1);
}
const alleDurch = (r) => GERAETE.every((g) => r.g[g] && r.g[g].zustand === "durch");
function oeffne(r, main) { // die naechste Runde am main-Kopf des Moments
    const z = iso(jetzt());
    r.runde = { n: (r.runde ? r.runde.n : 0) + 1, kopf: main, start: z, vorher: r.runde ? r.runde.kopf : "-" };
    for (const g of GERAETE) r.g[g] = leer(z);
}

// ── DIE MESS-DATEIEN ── ein Urteil je Station: GRUEN, ROT oder keins (ungemessen; ein juengeres UNGEMESSEN schlaegt den aelteren Lauf)
function urteil(m, s) {
    const v = ((m && m.je) || {})[s], u = ((m && m.ungemessen) || {})[s];
    if (!v || v.ungemessen) return null;
    if (u && String(u.zeit || "") >= String(v.zeit || "")) return null;
    return v.gruen ? "GRUEN" : "ROT";
}
const hatEintrag = (m, s) => !!(((m && m.je) || {})[s] || ((m && m.ungemessen) || {})[s]);

const [was, ...arg] = process.argv.slice(2);
const opt = (n) => { const i = arg.indexOf("--" + n); return i < 0 ? null : arg[i + 1]; };
if (was === "lies") {
    const [repo, g] = arg;
    if (!process.env.RUNDE_OHNE_FETCH) gitIn(repo)(["fetch", "-q", "origin", "+refs/heads/" + ZWEIG + ":refs/runde/koord"]);
    const r = lies(zeigIn(repo)("refs/runde/koord", DATEI));
    if (!r.runde) { console.log("-"); process.exit(0); }
    const e = r.g[g] || leer(r.runde.start);
    console.log([r.runde.n, r.runde.kopf, r.runde.vorher || "-", e.zustand, e.liste || "-"].join(" "));
} else if (was === "anlegen") {
    const [repo, kopf] = arg;
    if (!/^[0-9a-f]{40}$/.test(String(kopf))) { console.error("anlegen: <kopf40> fehlt"); process.exit(2); }
    const { r } = aendere(repo, "Runde 1 am " + k8(kopf) + ": aus dem Bestand angelegt", (r) => { if (r.runde) return false; oeffne(r, kopf); return {}; });
    console.log("runde " + r.runde.n + " " + r.runde.kopf);
} else if (was === "stand") {
    const [repo, g, kopf, zustand] = arg;
    let anders = false;
    const { r } = aendere(repo, "Runde " + g + ": " + zustand + (opt("erledigt") ? " " + opt("erledigt") + "/" + (opt("gesamt") || "?") : "") + " am " + k8(kopf), (r) => {
        if (!r.runde || r.runde.kopf !== kopf) { anders = true; return false; }
        const e = r.g[g] || leer(r.runde.start), z = iso(jetzt());
        const vor = e.erledigt;
        const vorZ = e.zustand;
        e.zustand = zustand;
        if (opt("erledigt") !== null) e.erledigt = Number(opt("erledigt"));
        if (opt("gesamt") !== null) e.gesamt = Number(opt("gesamt"));
        if (opt("station") !== null) e.station = opt("station") || "-";
        if (opt("liste") !== null) e.liste = opt("liste") || "-";
        // FORTSCHRITT: eine Station mehr, der Beginn der Liste, das Ende — nie das blosse Halten oder Weichen
        if (e.erledigt > vor || (zustand === "laeuft" && vorZ === "offen") || zustand === "durch") { e.fortschritt = z; e.alarm = "-"; }
        r.g[g] = e;
        return {};
    });
    if (anders) { console.log("ANDERE RUNDE " + (r.runde ? r.runde.n + " " + r.runde.kopf : "-")); process.exit(4); }
    console.log("ok");
} else if (was === "durch" || was === "weiter") {
    const [repo, g, kopf, main] = was === "durch" ? arg : [arg[0], null, null, arg[1]];
    let anders = false;
    const { r } = aendere(repo, was === "durch" ? "Runde " + g + ": durch am " + k8(kopf) : "Runde weiter: main " + k8(main), (r) => {
        if (!r.runde) return false;
        let neu = false;
        if (g) {
            if (r.runde.kopf !== kopf) { anders = true; return false; }
            const e = r.g[g] || leer(r.runde.start);
            if (e.zustand !== "durch") { e.zustand = "durch"; e.station = "-"; e.fortschritt = iso(jetzt()); e.alarm = "-"; r.g[g] = e; neu = true; }
            if (opt("erledigt") !== null && e.erledigt !== Number(opt("erledigt"))) { e.erledigt = Number(opt("erledigt")); neu = true; } // der Endstand: was am Kopf einen Eintrag trägt
        }
        if (alleDurch(r) && /^[0-9a-f]{40}$/.test(String(main)) && main !== r.runde.kopf) { oeffne(r, main); neu = true; }
        return neu ? {} : false;
    });
    if (anders) { console.log("ANDERE RUNDE " + r.runde.n + " " + r.runde.kopf); process.exit(4); }
    if (!r.runde) { console.log("-"); process.exit(0); }
    console.log(alleDurch(r) ? "ALLE DURCH runde " + r.runde.n + " " + r.runde.kopf + " (main nicht weiter)" : "runde " + r.runde.n + " " + r.runde.kopf + " " + GERAETE.map((x) => x + "=" + ((r.g[x] || {}).zustand || "offen")).join(" "));
} else if (was === "alarm") {
    const [repo, melder] = arg;
    const zeilen = [];
    aendere(repo, "Runde ALARM", (r) => {
        zeilen.length = 0;
        if (!r.runde) return false;
        const t = jetzt().getTime();
        // DER GRUND-ALARM (Koordinator 19.11. 02:35): ein Halt mit Grund (Platte unter PLATTE_UNTEN) ist derselbe Alarm wie „ohne
        // Fortschritt“, sofort und mit Zahl — nie ein stilles Stehen; gegen Wiederholung sperrt der Rufer je Grund (platte_alarm)
        if (opt("grund") !== null) {
            const g = opt("geraet"), e = r.g[g] || leer(r.runde.start);
            e.alarm = iso(jetzt());
            r.g[g] = e;
            zeilen.push("RUNDE " + r.runde.n + " ALARM " + g + ": " + opt("grund") + " — " + e.zustand + " " + e.erledigt + "/" + e.gesamt + ", Station " + e.station + ", Kopf " + k8(r.runde.kopf) + "; die Runde setzt an derselben Station fort — gesehen von " + (melder || "?"));
            return { zeile: zeilen.join(" · ") };
        }
        for (const g of GERAETE) {
            const e = r.g[g] || leer(r.runde.start);
            if (e.zustand === "durch") continue;
            const seit = Date.parse(e.fortschritt === "-" ? r.runde.start : e.fortschritt), min = Math.floor((t - seit) / 60000);
            if (!(min > ALARM_MIN)) continue;
            if (e.alarm !== "-" && t - Date.parse(e.alarm) < WIEDER_MIN * 60000) continue;
            e.alarm = iso(jetzt());
            r.g[g] = e;
            zeilen.push("RUNDE " + r.runde.n + " ALARM " + g + ": ohne Fortschritt seit " + min + " min (" + e.zustand + ", " + e.erledigt + "/" + e.gesamt + ", Station " + e.station + ", Kopf " + k8(r.runde.kopf) + ") — gesehen von " + (melder || "?"));
        }
        return zeilen.length ? { zeile: zeilen.join(" · ") } : false;
    });
    for (const z of zeilen) console.log(z);
} else if (was === "reihe") {
    // 2 DIE REIHE: ungebucht vor gebucht gruen; darin wer am laengsten ohne Messung auf diesem Geraet ist zuerst, wessen letzte Fahrt
    // LANG_MIN oder laenger lief zuletzt (die Reihe von n0611/stufe/reihe.cjs, 12.11., jetzt EINE Quelle fuer beide Geraete).
    // GEBUCHT GRUEN: am juengsten Kopf, an dem BEIDE Geraete ein Urteil der Station tragen (ein Paar), sind beide GRUEN.
    const [dir, g, l] = arg;
    const ids = liste(l);
    const koepfe = {};
    let dateien = [];
    try { dateien = fs.readdirSync(dir).filter((f) => /^[0-9a-f]{8}-(gtx|radeon)\.json$/.test(f)); } catch { /* ohne Baum: die Reihe der Tafel */ }
    for (const f of dateien) {
        let m;
        try { m = JSON.parse(fs.readFileSync(path.join(dir, f), "utf8")); } catch { continue; }
        (koepfe[f.slice(0, 8)] = koepfe[f.slice(0, 8)] || {})[f.slice(9, -5)] = m;
    }
    const letzt = {}, paar = {};
    for (const [kopf, je] of Object.entries(koepfe)) {
        const m = je[g];
        if (m) for (const o of [m.je || {}, m.ungemessen || {}])
            for (const [id, e] of Object.entries(o)) {
                const z = String((e && e.zeit) || m.zeit || "");
                if (!letzt[id] || z > letzt[id].z) letzt[id] = { z, min: Number(e && e.minuten) || 0 };
            }
        if (!je.gtx || !je.radeon) continue;
        for (const id of ids) {
            const a = urteil(je.gtx, id), b = urteil(je.radeon, id);
            if (!a || !b) continue;
            const z = [String(((je.gtx.je || {})[id] || {}).zeit || je.gtx.zeit || ""), String(((je.radeon.je || {})[id] || {}).zeit || je.radeon.zeit || "")].sort()[1];
            if (!paar[id] || z > paar[id].z) paar[id] = { z, kopf, gruen: a === "GRUEN" && b === "GRUEN" };
        }
    }
    const lang = (id) => (letzt[id] && letzt[id].min >= LANG_MIN ? 1 : 0);
    const ord = (xs) => xs.map((id, i) => ({ id, i })).sort((a, b) => lang(a.id) - lang(b.id) || ((letzt[a.id] || {}).z || "").localeCompare((letzt[b.id] || {}).z || "") || a.i - b.i).map((x) => x.id);
    const gebucht = ids.filter((id) => paar[id] && paar[id].gruen), ungebucht = ids.filter((id) => !(paar[id] && paar[id].gruen));
    const u = ord(ungebucht), b = ord(gebucht);
    process.stderr.write("Reihe " + g + ": ungebucht " + u.length + " (" + u.map((id) => id + (paar[id] ? " Paar " + paar[id].kopf + " ROT" : " ohne Paar")).join(" · ") + ") | gebucht gruen " + b.length + " (" + b.map((id) => id + " " + paar[id].kopf).join(" · ") + ")\n");
    console.log((u.join(",") || "") + "|" + (b.join(",") || ""));
} else if (was === "offen") {
    const [dir, ref, g, kopf, l] = arg;
    let m = {};
    try { m = JSON.parse(zeigIn(dir)(ref, MDIR + "/" + k8(kopf) + "-" + g + ".json") || "{}"); } catch { m = {}; }
    const ids = liste(String(l || "").replace("|", ","));
    process.stderr.write("an " + k8(kopf) + " " + g + " schon gemessen: " + (ids.filter((s) => hatEintrag(m, s)).length) + " von " + ids.length + "\n");
    console.log(ids.filter((s) => !hatEintrag(m, s)).join(","));
} else if (was === "faelle") {
    const [repo, g, vorher, kopf, l] = arg;
    const git = gitIn(repo), zeig = zeigIn(repo);
    if (!process.env.RUNDE_OHNE_FETCH) git(["fetch", "-q", "origin", "+refs/heads/" + PM_ZWEIG + ":refs/runde/pm"]);
    const lade = (k) => { try { return JSON.parse(zeig("refs/runde/pm", MDIR + "/" + k8(k) + "-" + g + ".json") || "null"); } catch { return null; } };
    const mv = lade(vorher), mk = lade(kopf);
    const f = liste(String(l || "").replace("|", ",")).filter((s) => urteil(mv, s) === "GRUEN" && urteil(mk, s) === "ROT");
    process.stderr.write("frisches ROT " + g + " " + k8(vorher) + " -> " + k8(kopf) + ": " + (f.join(", ") || "keins") + (mv ? "" : " (keine Mess-Datei am vorigen Kopf)") + "\n");
    for (const s of f) console.log(s);
} else if (was === "paare") {
    const [repo, n] = arg;
    const git = gitIn(repo), zeig = zeigIn(repo);
    if (!process.env.RUNDE_OHNE_FETCH) git(["fetch", "-q", "origin", "+refs/heads/" + PM_ZWEIG + ":refs/runde/pm"]);
    const namen = git(["ls-tree", "--name-only", "refs/runde/pm", MDIR + "/"]).split("\n").map((x) => path.basename(x));
    const k = (geraet) => new Set(namen.filter((x) => x.endsWith("-" + geraet + ".json")).map((x) => x.slice(0, 8)));
    const kg = k("gtx"), kr = k("radeon"), beide = [...kg].filter((x) => kr.has(x));
    const zeilen = [];
    let sp = 0, sg = 0;
    for (const kopf of beide) {
        const a = JSON.parse(zeig("refs/runde/pm", MDIR + "/" + kopf + "-gtx.json") || "{}"), b = JSON.parse(zeig("refs/runde/pm", MDIR + "/" + kopf + "-radeon.json") || "{}");
        const ids = Object.keys(a.je || {}).filter((s) => urteil(a, s) && urteil(b, s));
        const gr = ids.filter((s) => urteil(a, s) === "GRUEN" && urteil(b, s) === "GRUEN").length;
        zeilen.push({ kopf, zeit: String(a.zeit || "") > String(b.zeit || "") ? String(a.zeit || "") : String(b.zeit || ""), p: ids.length, g: gr, ga: Object.keys(a.je || {}).length, ra: Object.keys(b.je || {}).length });
        sp += ids.length; sg += gr;
    }
    zeilen.sort((x, y) => y.zeit.localeCompare(x.zeit));
    for (const z of zeilen.slice(0, Number(n || 30))) console.log(z.kopf + " " + z.zeit.slice(0, 16) + "  Paare " + z.p + " (beide GRUEN " + z.g + ") · gtx " + z.ga + " · radeon " + z.ra);
    console.log("SUMME: " + kg.size + " Koepfe mit gtx-Datei, " + kr.size + " mit radeon-Datei, " + beide.length + " mit beiden · Stations-Paare am selben Kopf " + sp + ", davon beide GRUEN " + sg);
} else if (was === "bilder") {
    // DAS GESETZ DER ROH-BILDER (Koordinator 19.11. 02:50; Befund 17,4 GB Roh-Bilder in messung/roh, ~0,6 GB je Tag): ein Roh-BILD geht nur
    // nach git, wenn das Urteil der Station gegen den gebuchten Stand (stand.json im Baum) WECHSELT (neues GRÜN = Beweis-Bild, frisches
    // ROT = Täter-Bild) oder der Auftrag es bestellt (ROH_BILD=1). Hält das Urteil (oder trägt die Station keins), bleibt das Bild am Gerät:
    // es zieht nach <ablage>/<kopf8>-<geraet>/… um (aus dem Baum, damit `git clean` es nie löscht), nach git geht nur <bild>.sha256
    // (Prüfsumme, Größe, Station, Urteil). Gelöscht wird nichts. Aufruf: bilder <pm-baum> <geraet> <kopf> <ablage>
    const [pm, g, kopf, ablage] = arg;
    const P = path.join(pm, MDIR), rd = path.join(P, "roh", k8(kopf) + "-" + g);
    const json = (f) => { try { return JSON.parse(fs.readFileSync(f, "utf8")); } catch { return null; } };
    const m = json(path.join(P, k8(kopf) + "-" + g + ".json")) || {}, stand = json(path.join(pm, "meisterkarte-quelle/punkte/stand.json")) || {};
    const gebucht = (id) => { const z = [...Object.values(stand.je || {}), ...Object.values(stand.pflichtJe || {})].flatMap((e) => e.stationen || []).find((x) => x.id === id && x.geraet === g && !x.ungemessen); return z ? (z.gruen ? "GRUEN" : "ROT") : null; };
    const ids = [...new Set([...Object.keys(m.je || {}), ...Object.keys(m.ungemessen || {})])].sort((a, b) => b.length - a.length);
    const bilder = [];
    const lauf = (d) => { let e = []; try { e = fs.readdirSync(d, { withFileTypes: true }); } catch { return; } for (const x of e) { const f = path.join(d, x.name); if (x.isDirectory()) lauf(f); else if (/\.(png|jpe?g|webp)$/i.test(x.name)) bilder.push(f); } };
    lauf(rd);
    let ein = 0, halt = 0, bytes = 0;
    for (const f of bilder) {
        const rel = path.relative(rd, f), base = path.basename(f);
        const sid = ids.find((id) => { const p = id.replace(/#/g, "_"); return base.startsWith(p + "-") || base.startsWith(p + "."); }) || null;
        const jetztU = sid ? urteil(m, sid) : null, vorU = sid ? gebucht(sid) : null;
        if (process.env.ROH_BILD === "1" || (jetztU && jetztU !== vorU)) { ein++; console.log("EIN " + rel + " (" + (sid || "?") + ": " + (vorU || "nie gebucht") + " → " + jetztU + ")"); continue; }
        const b = fs.readFileSync(f), sum = require("crypto").createHash("sha256").update(b).digest("hex");
        fs.writeFileSync(f + ".sha256", sum + " " + b.length + " " + (sid || "-") + " " + (jetztU || "ohne-Urteil") + " gebucht " + (vorU || "-") + "\n");
        const ziel = path.join(ablage, k8(kopf) + "-" + g, rel);
        fs.mkdirSync(path.dirname(ziel), { recursive: true });
        try { fs.renameSync(f, ziel); } catch { fs.copyFileSync(f, ziel); fs.rmSync(f); }
        halt++; bytes += b.length;
    }
    process.stderr.write("Roh-Bilder " + k8(kopf) + " " + g + ": " + ein + " nach git (Urteil wechselt), " + halt + " am Gerät (" + (bytes / 1e6).toFixed(1) + " MB, nur Prüfsumme nach git)\n");
} else if (was === "ablage") {
    // die Ablage am Gerät zählen (nie löschen, bis der Schöpfer das Halte-Wort gibt): je Station die jüngsten 3 Köpfe, was jenseits liegt
    const [ablage] = arg;
    const je = {};
    let koepfe = [];
    try { koepfe = fs.readdirSync(ablage).map((k) => ({ k, t: fs.statSync(path.join(ablage, k)).mtimeMs })).sort((a, b) => b.t - a.t); } catch { /* keine Ablage */ }
    let ordner = 0, bytes = 0;
    const groesse = (d) => { let s = 0; for (const x of fs.readdirSync(d, { withFileTypes: true })) { const f = path.join(d, x.name); s += x.isDirectory() ? groesse(f) : fs.statSync(f).size; } return s; };
    for (const { k } of koepfe) {
        const st = {};
        for (const x of fs.readdirSync(path.join(ablage, k), { withFileTypes: true })) { const s = x.name.replace(/-.*$/, ""); (st[s] = st[s] || []).push(path.join(ablage, k, x.name)); }
        for (const [s, fs_] of Object.entries(st)) { je[s] = (je[s] || 0) + 1; if (je[s] > 3) { ordner++; for (const f of fs_) bytes += fs.statSync(f).isDirectory() ? groesse(f) : fs.statSync(f).size; } }
    }
    console.log("Roh-Bilder am Gerät jenseits der 3 Köpfe: " + ordner + " Station×Kopf, " + (bytes / 1e9).toFixed(2) + " GB (nicht gelöscht)");
} else if (was === "bestand") {
    const [repo, g] = arg;
    const git = gitIn(repo);
    git(["fetch", "-q", "origin", "+refs/heads/main:refs/runde/main", "+refs/heads/" + PM_ZWEIG + ":refs/runde/pm"]);
    const da = new Set(git(["ls-tree", "--name-only", "refs/runde/pm", MDIR + "/"]).split("\n").map((x) => path.basename(x)).filter((x) => x.endsWith("-" + g + ".json")).map((x) => x.slice(0, 8)));
    const k = git(["rev-list", "--first-parent", "-n", "300", "refs/runde/main"]).split(/\s+/).find((c) => da.has(c.slice(0, 8)));
    if (!k) { console.error("bestand: kein Kopf der main-Linie traegt messung/<kopf8>-" + g + ".json"); process.exit(1); }
    console.log(k);
} else {
    console.log("runde.cjs lies|anlegen|stand|durch|weiter|alarm|reihe|offen|faelle|paare|bestand — siehe Kopf der Datei");
    process.exit(2);
}
