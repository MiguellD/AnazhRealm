// zeile-erledigt.cjs — Koordinator 07.11. 17:50 (Konto 9): je gepushtem Teil EINE Zeile in koordination zug/erledigt.txt.
// Aufruf: node zeile-erledigt.cjs <sha40> <teil-name> <liste,komma>
"use strict";
const fs = require("fs"), cp = require("child_process");
const O = "C:/Users/micha/Desktop/AnazhRealm-OMEN", MESS = O + "/AnazhRealm-mess", PM = O + "/n0611-pm";
const WER = { GIT_AUTHOR_NAME: "MiguellD", GIT_AUTHOR_EMAIL: "87209049+MiguellD@users.noreply.github.com",
    GIT_COMMITTER_NAME: "MiguellD", GIT_COMMITTER_EMAIL: "87209049+MiguellD@users.noreply.github.com" };
const [K, TEIL, LISTE] = process.argv.slice(2);
const git = (a, o = {}) => cp.execFileSync("git", a, { cwd: MESS, encoding: "utf8", stdio: ["pipe", "pipe", "pipe"], ...o }).trim();
const m = JSON.parse(fs.readFileSync(PM + "/meisterkarte-quelle/punkte/messung/" + K.slice(0, 8) + "-gtx.json", "utf8"));
const g = [], r = [], u = [], f = [];
for (const s of LISTE.split(",").filter(Boolean)) {
    const v = (m.je || {})[s], un = (m.ungemessen || {})[s];
    if (un && v && String(un.zeit) >= String(v.zeit)) u.push(s); // jüngeres UNGEMESSEN schlägt einen älteren Lauf
    else if (v && !v.ungemessen) (v.gruen ? g : r).push(s);
    else if ((m.ungemessen || {})[s] || (v && v.ungemessen)) u.push(s);
    else f.push(s);
}
const urteil = r.length ? "ROT" : u.length || f.length ? "UNGEMESSEN" : "GRÜN";
const pm = cp.execFileSync("git", ["rev-parse", "--short=8", "refs/omen/dauer-pm"], { cwd: PM, encoding: "utf8" }).trim();
const zeile = "omen-gtx-" + TEIL + "-" + K.slice(0, 8) + " " + urteil + " " + g.length + " GRÜN / " + r.length + " ROT / " + u.length + " UNGEMESSEN" +
    (r.length ? " · ROT " + r.join(" ") : "") + (u.length ? " · UNGEMESSEN " + u.join(" ") : "") + (f.length ? " · ohne Eintrag " + f.join(" ") : "") +
    (g.length ? " · GRÜN " + g.join(" ") : "") +
    // ZAHL=1: je Station die rohe Zahl — 10.11. 13:25 (Koordinator K10) auch, wenn das Werkzeug UNGEMESSEN sagt (dann Zahl UND Grund)
    (process.env.ZAHL ? LISTE.split(",").filter(Boolean).map((s) => {
        const v = (m.je || {})[s], un = (m.ungemessen || {})[s], kurz = (x, n) => String(x || "").replace(/\s+/g, " ").split(/ · Gang | — ROT/)[0].slice(0, n);
        if (u.includes(s)) return " ‖ " + s + " UNGEMESSEN roh: " + (v && v.zahl ? kurz(v.zahl, 200) + " · " : "") + kurz((un && (un.grund || un.zahl)) || (v && v.grund), 200);
        return v ? " ‖ " + s + ": " + kurz(v.zahl, 260) : "";
    }).join("") : "") +
    " (punkte-maschine " + pm + " messung/" + K.slice(0, 8) + "-gtx.json)";
if (process.env.TROCKEN) { console.log(zeile); process.exit(0); }
const IDX = O +"/p3/n0611/index-erledigt.tmp", env = { ...process.env, ...WER, GIT_INDEX_FILE: IDX };
for (let v = 1; v <= 5; v++) {
    try {
        git(["fetch", "-q", "origin", "+refs/heads/koordination:refs/omen/erledigt-koord"]);
        const basis = git(["rev-parse", "refs/omen/erledigt-koord"]);
        fs.rmSync(IDX, { force: true });
        git(["read-tree", basis], { env });
        let alt = cp.execFileSync("git", ["show", basis + ":zug/erledigt.txt"], { cwd: MESS }).toString("utf8");
        const nl = alt.includes("\r\n") ? "\r\n" : "\n";
        if (alt && !alt.endsWith("\n")) alt += nl;
        const blob = git(["hash-object", "-w", "--no-filters", "--stdin"], { input: alt + zeile + nl });
        git(["update-index", "--add", "--cacheinfo", "100644," + blob + ",zug/erledigt.txt"], { env });
        const c = git(["commit-tree", git(["write-tree"], { env }), "-p", basis, "-F", "-"], { env,
            input: "OMEN GTX " + TEIL + " " + K.slice(0, 8) + ": " + urteil + "\n\nCo-Authored-By: Claude Fable 5.2 <noreply@anthropic.com>\n" });
        git(["push", "-q", "origin", c + ":refs/heads/koordination"]);
        console.log("erledigt " + c.slice(0, 8) + " " + zeile);
        process.exit(0);
    } catch (e) { console.log("erledigt Versuch " + v + ": " + String(e.message).slice(0, 200)); Atomics.wait(new Int32Array(new SharedArrayBuffer(4)), 0, 0, 20e3); }
}
console.log("MELDEN erledigt-Push scheiterte 5×"); process.exit(1);
