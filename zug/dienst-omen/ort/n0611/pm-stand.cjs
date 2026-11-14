// pm-stand.cjs — DER STAND VON punkte-maschine IM MESS-BAUM (n0611-pm), OHNE EINE MESSUNG ZU ÜBERSCHREIBEN.
// Aufruf: node pm-stand.cjs [<baum>]   holt origin/punkte-maschine (refs/omen/dauer-pm) und stellt den Baum darauf
//         node pm-stand.cjs --selbsttest
// WARUM (14.11., Koordinator 23:16): die vier Stellen der Mess-Kette (landung-dienst.sh, kandidat.sh, punkte-offen.cjs, gtx-dauer.cjs)
// riefen `git checkout --detach --force refs/omen/dauer-pm` — `--force` legt den gepushten Stand über JEDE Datei des Baums, auch über
// eine Messung, die noch niemand gepusht hat. Am 14.11. schrieb die Sitzung der OMEN 22:38–22:48 fünf Richter-Akten und ihre Einträge
// der Mess-Datei an 68d24688; der nächste Checkout der Landung legte die Akten der Sitzung von 22:04 (gepusht 22:38) darüber.
// DAS GESETZ: eine Messung im Baum, die JÜNGER ist als der gepushte Stand, überlebt den Checkout —
//   Richter-Akte (vision/richter/*.json): die mit dem jüngeren `datum` bleibt (eine nur lokale bleibt immer);
//   Mess-Datei (meisterkarte-quelle/punkte/messung/<sha8>-<gerät>.json): je Station der Eintrag mit der jüngeren `zeit`, der Kopf
//   (`zeit`, `sitzung`, `host`) vom jüngeren Stand; `ungemessen` folgt dem jüngeren Kopf.
// Alles andere im Baum stellt der Checkout wie bisher (der Code der Maschine ist nie lokal wahr). Was blieb, steht beim Namen auf
// stdout („BEHALTEN …“) — der nächste Push der Kette (messDateien des Kopfs) trägt es nach punkte-maschine.
"use strict";
const fs = require("fs"), path = require("path"), cp = require("child_process");
const PM_ORT = "C:/Users/micha/Desktop/AnazhRealm-OMEN/n0611-pm";
const AKTEN = "vision/richter", MESSUNG = "meisterkarte-quelle/punkte/messung";
const istAkte = (p) => p.startsWith(AKTEN + "/") && p.endsWith(".json");
const istMess = (p) => new RegExp("^" + MESSUNG + "/[0-9a-f]{8}-[a-z0-9]+\\.json$").test(p);
const lies = (f) => { try { return JSON.parse(fs.readFileSync(f, "utf8")); } catch (_e) { return null; } };
const ms = (t) => { const x = Date.parse(t); return Number.isFinite(x) ? x : -Infinity; };

// die Mess-Datei aus zwei Ständen: je Station der jüngere Eintrag; null, wenn der gepushte Stand schon alles trägt
function mischeMessung(lokal, gepusht) {
    if (!lokal || !lokal.je) return null;
    if (!gepusht || !gepusht.je || gepusht.sha !== lokal.sha) return lokal;
    const jung = ms(lokal.zeit) > ms(gepusht.zeit), aus = JSON.parse(JSON.stringify(jung ? { ...gepusht, ...lokal, je: gepusht.je } : gepusht));
    const genommen = [];
    for (const [id, e] of Object.entries(lokal.je)) if (!aus.je[id] || ms(e.zeit) > ms(aus.je[id].zeit)) { aus.je[id] = e; genommen.push(id); }
    return genommen.length || jung ? Object.assign(aus, { __genommen: genommen }) : null;
}

// holt den Stand; Rückgabe { kopf, behalten: [Text je Datei] }
function holeStand(pm = PM_ORT, o = {}) {
    const git = (a) => cp.execFileSync("git", a, { cwd: pm, encoding: "utf8", stdio: ["ignore", "pipe", "pipe"] }).trim();
    const ref = o.ref || "refs/omen/dauer-pm";
    if (!o.ohneFetch) git(["fetch", "-q", "origin", "+refs/heads/punkte-maschine:" + ref]);
    // was im Baum vom Kopf abweicht oder ihm fremd ist, unter den zwei Orten der Messung
    const lokal = [];
    // (roh gelesen: `trim` über die ganze Ausgabe nähme der ersten Zeile „ M pfad“ ihr führendes Leerzeichen)
    const status = cp.execFileSync("git", ["status", "--porcelain", "--untracked-files=all", "--", AKTEN, MESSUNG], { cwd: pm, encoding: "utf8", stdio: ["ignore", "pipe", "pipe"] });
    for (const z of status.split(/\r?\n/)) {
        const p = ((/^.. (.+)$/.exec(z) || [])[1] || "").trim().replace(/^"|"$/g, "");
        if (!p || !(istAkte(p) || istMess(p)) || !fs.existsSync(path.join(pm, p))) continue;
        lokal.push({ p, text: fs.readFileSync(path.join(pm, p), "utf8") });
    }
    git(["checkout", "-q", "--detach", "--force", ref]);
    const behalten = [];
    for (const { p, text } of lokal) {
        const ziel = path.join(pm, p), da = fs.existsSync(ziel), neu = da ? lies(ziel) : null;
        let alt = null;
        try { alt = JSON.parse(text); } catch (_e) { continue; } // eine halbe Datei ist keine Messung
        if (istAkte(p)) {
            if (da && neu && !(ms(alt.datum) > ms(neu.datum))) continue;
            fs.mkdirSync(path.dirname(ziel), { recursive: true });
            fs.writeFileSync(ziel, text);
            behalten.push(p + ": die Akte im Baum (" + alt.datum + ") ist jünger als die gepushte (" + (neu ? neu.datum : "keine") + ")");
        } else {
            const m = mischeMessung(alt, neu);
            if (!m) continue;
            const genommen = m.__genommen || Object.keys(m.je || {});
            delete m.__genommen;
            fs.mkdirSync(path.dirname(ziel), { recursive: true });
            fs.writeFileSync(ziel, JSON.stringify(m, null, 1));
            behalten.push(p + ": " + genommen.length + " Einträge im Baum jünger als gepusht" + (genommen.length ? " (" + genommen.slice(0, 8).join(", ") + (genommen.length > 8 ? " …" : "") + ")" : ""));
        }
    }
    return { kopf: git(["rev-parse", "HEAD"]), behalten };
}

function selbsttest() {
    const os = require("os"), tmp = fs.mkdtempSync(path.join(os.tmpdir(), "pm-stand-"));
    const sh = (cwd, a) => cp.execFileSync("git", a, { cwd, encoding: "utf8", stdio: ["ignore", "pipe", "pipe"] }).trim();
    const fern = path.join(tmp, "fern"), pm = path.join(tmp, "pm");
    const schreibe = (wurzel, p, o) => { fs.mkdirSync(path.dirname(path.join(wurzel, p)), { recursive: true }); fs.writeFileSync(path.join(wurzel, p), typeof o === "string" ? o : JSON.stringify(o, null, 1)); };
    const A = AKTEN + "/a.b.1.aaaaaaaa-gtx.json", B = AKTEN + "/a.b.2.aaaaaaaa-gtx.json", C = AKTEN + "/a.b.3.aaaaaaaa-gtx.json", M = MESSUNG + "/aaaaaaaa-gtx.json", CODE = "meisterkarte-quelle/punkte/punkte.cjs";
    const t = (m) => "2026-11-14T21:" + String(m).padStart(2, "0") + ":00.000Z";
    const E = (m, gruen = true) => ({ gruen, zahl: "z" + m, zeit: t(m) });
    fs.mkdirSync(fern);
    sh(fern, ["init", "-q", "-b", "punkte-maschine"]);
    sh(fern, ["config", "user.email", "t@t"]); sh(fern, ["config", "user.name", "t"]);
    // der gepushte Stand: Akte A von 10, Akte B von 30, die Mess-Datei mit x (10) und y (30), der Code v1
    schreibe(fern, A, { datum: t(10), wert: "alt" }); schreibe(fern, B, { datum: t(30), wert: "gepusht-neu" });
    schreibe(fern, M, { sha: "a".repeat(40), zeit: t(30), sitzung: { start: t(30) }, je: { "x.K1#1": E(10), "y.K1#1": E(30) } });
    schreibe(fern, CODE, "// v1\n");
    sh(fern, ["add", "-A"]); sh(fern, ["commit", "-q", "-m", "stand 1"]);
    sh(tmp, ["clone", "-q", fern, pm]);
    const faelle = [];
    const pruef = (name, ok, was) => faelle.push((ok ? "OK   " : "ROT  ") + name + (ok ? "" : " — " + String(was).slice(0, 300)));
    const lauf = (hole) => {
        sh(pm, ["checkout", "-q", "--detach", "--force", "origin/punkte-maschine"]);
        // im Baum: A jünger (20 > 10), B älter (20 < 30), C nur lokal, die Mess-Datei mit x jünger (20), y älter (20) und z neu; der Code von Hand
        schreibe(pm, A, { datum: t(20), wert: "sitzung-2" }); schreibe(pm, B, { datum: t(20), wert: "lokal-alt" }); schreibe(pm, C, { datum: t(20), wert: "nur-lokal" });
        schreibe(pm, M, { sha: "a".repeat(40), zeit: t(20), sitzung: { start: t(20) }, je: { "x.K1#1": E(20, false), "y.K1#1": E(20, false), "z.K1#1": E(20) } });
        schreibe(pm, CODE, "// von Hand\n");
        const r = hole();
        const a = lies(path.join(pm, A)), b = lies(path.join(pm, B)), c = lies(path.join(pm, C)), m = lies(path.join(pm, M));
        return { r, a, b, c, m, code: fs.readFileSync(path.join(pm, CODE), "utf8") };
    };
    const echt = lauf(() => holeStand(pm, { ref: "refs/omen/t" }));
    pruef("die jüngere Akte im Baum überlebt den Checkout", echt.a && echt.a.wert === "sitzung-2", JSON.stringify(echt.a));
    pruef("die ältere Akte im Baum weicht der gepushten", echt.b && echt.b.wert === "gepusht-neu", JSON.stringify(echt.b));
    pruef("eine Akte, die nur im Baum liegt, bleibt", echt.c && echt.c.wert === "nur-lokal", JSON.stringify(echt.c));
    pruef("die Mess-Datei je Station: der jüngere Eintrag (x aus dem Baum, y gepusht, z neu aus dem Baum), der Kopf vom jüngeren Stand",
        echt.m && echt.m.je["x.K1#1"].zahl === "z20" && echt.m.je["y.K1#1"].zahl === "z30" && echt.m.je["z.K1#1"].zahl === "z20" && echt.m.zeit === t(30) && echt.m.sitzung.start === t(30), JSON.stringify(echt.m));
    pruef("der Code der Maschine steht wie gepusht (eine Hand-Änderung überlebt nie)", echt.code.trim() === "// v1", echt.code);
    pruef("was der Checkout sonst überschrieben hätte, steht beim Namen (2 Zeilen BEHALTEN: die jüngere Akte, die Mess-Datei mit x und z)",
        echt.r.behalten.length === 2 && echt.r.behalten.some((z) => z.startsWith(A)) && echt.r.behalten.some((z) => z.startsWith(M) && /2 Einträge/.test(z) && /x\.K1#1, z\.K1#1/.test(z)),
        JSON.stringify(echt.r.behalten));
    // der Baum ohne eigene Messung: der Checkout wie bisher, nichts behalten
    sh(pm, ["checkout", "-q", "--detach", "--force", "origin/punkte-maschine"]);
    fs.rmSync(path.join(pm, C), { force: true });
    const leer = holeStand(pm, { ref: "refs/omen/t" });
    pruef("ohne Messung im Baum bleibt nichts zurück", leer.behalten.length === 0 && sh(pm, ["status", "--porcelain"]) === "", JSON.stringify(leer.behalten));
    // DIE MUTANTE: der alte Weg (fetch + checkout --force) — die jüngere Akte und der jüngere Eintrag fallen
    const alt = lauf(() => { sh(pm, ["fetch", "-q", "origin", "+refs/heads/punkte-maschine:refs/omen/t"]); sh(pm, ["checkout", "-q", "--detach", "--force", "refs/omen/t"]); return { behalten: [] }; });
    const mutRot = !(alt.a && alt.a.wert === "sitzung-2") && !(alt.m && alt.m.je["x.K1#1"].zahl === "z20");
    pruef("MUTANTE „checkout --force“ ist ROT (die jüngere Akte und der jüngere Eintrag fallen)", mutRot, JSON.stringify([alt.a, alt.m && alt.m.je["x.K1#1"]]));
    try { fs.rmSync(tmp, { recursive: true, force: true }); } catch (_e) {}
    for (const z of faelle) console.log("  " + z);
    const rot = faelle.filter((z) => z.startsWith("ROT")).length;
    console.log(rot ? "pm-stand SELBSTTEST ROT (" + rot + " von " + faelle.length + ")" : "pm-stand SELBSTTEST GRÜN: " + faelle.length + " Fälle, die Mutante ROT");
    return rot ? 1 : 0;
}

module.exports = { holeStand, mischeMessung };
if (require.main === module) {
    if (process.argv[2] === "--selbsttest") process.exitCode = selbsttest();
    else {
        const r = holeStand(process.argv[2] || PM_ORT);
        console.log("punkte-maschine " + r.kopf.slice(0, 9));
        for (const z of r.behalten) console.log("BEHALTEN " + z);
    }
}
