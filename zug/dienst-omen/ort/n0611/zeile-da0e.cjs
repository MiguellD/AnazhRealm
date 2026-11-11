// zeile-da0e.cjs <sha40> <liste-datei> [zusatz] — Koordinator Konto 10, 09.11. 19:35: EINE Zeile
// "<datum zeit> gtx-da0e <n> grün / <n> rot / <n> ungemessen" in koordination zug/erledigt.txt, gezählt über die Liste des Auftrags.
// Jüngerer Eintrag gewinnt (je ↔ ungemessen nach zeit). Noch nicht gefahrene Stationen zählen als "offen" (nur im Zusatz).
// ROT je Station mit der Zahl gegen das Soll (die Abschnitte des Urteils, die ROT/Soll tragen), ohne Prosa. TROCKEN=1 nur zeigen.
"use strict";
const fs = require("fs"), cp = require("child_process");
const O = "C:/Users/micha/Desktop/AnazhRealm-OMEN", MESS = O + "/AnazhRealm-mess", PM = O + "/n0611-pm";
const WER = { GIT_AUTHOR_NAME: "MiguellD", GIT_AUTHOR_EMAIL: "87209049+MiguellD@users.noreply.github.com",
    GIT_COMMITTER_NAME: "MiguellD", GIT_COMMITTER_EMAIL: "87209049+MiguellD@users.noreply.github.com" };
const [K, LISTE, ZUSATZ] = process.argv.slice(2), k8 = K.slice(0, 8);
const git = (a, o = {}) => cp.execFileSync("git", a, { cwd: MESS, encoding: "utf8", stdio: ["pipe", "pipe", "pipe"], ...o }).trim();
const f = PM + "/meisterkarte-quelle/punkte/messung/" + k8 + "-gtx.json";
const m = fs.existsSync(f) ? JSON.parse(fs.readFileSync(f, "utf8")) : { je: {}, ungemessen: {} };
const liste = fs.readFileSync(LISTE, "utf8").trim().split(/[,\s]+/).filter(Boolean);
const g = [], r = [], u = [], offen = [];
for (const s of liste) {
    const v = (m.je || {})[s], un = (m.ungemessen || {})[s];
    if (un && (!v || v.ungemessen || String(un.zeit || "") >= String(v.zeit || ""))) u.push(s);
    else if (v && v.ungemessen) u.push(s);
    else if (v) (v.gruen ? g : r).push(s);
    else offen.push(s);
}
const kurz = (z) => {
    const teile = String(z || "").replace(/\s+/g, " ").split(" · ").filter((t) => /ROT|Soll|≥|≤|<|>/.test(t) && !/^\[linse-gpu\]/.test(t));
    return (teile.length ? teile : [String(z || "")]).slice(0, 3).join(" · ").slice(0, 220);
};
const zw = (n) => String(n).padStart(2, "0"), d = new Date();
const zeile = d.getFullYear() + "-" + zw(d.getMonth() + 1) + "-" + zw(d.getDate()) + " " + zw(d.getHours()) + ":" + zw(d.getMinutes()) +
    " " + (process.env.ZEILE_NAME || "gtx-da0e") + " " + g.length + " grün / " + r.length + " rot / " + u.length + " ungemessen" +
    (offen.length ? " · " + offen.length + " noch nicht gefahren (Zwischenstand " + (liste.length - offen.length) + "/" + liste.length + ")" : "") +
    (ZUSATZ ? " · " + ZUSATZ : "") +
    (r.length ? " · ROT " + r.map((s) => s + ": " + kurz(m.je[s].zahl)).join(" ‖ ") : "") +
    (u.length ? " · UNGEMESSEN " + u.join(" ") : "") +
    " (punkte-maschine messung/" + k8 + "-gtx.json)";
fs.writeFileSync((process.env.ZEILE_DIR || O + "/p3/n0611/da0e") + "/zeile.txt", zeile + "\n");
fs.writeFileSync((process.env.ZEILE_DIR || O + "/p3/n0611/da0e") + "/rot.txt", r.map((s) => s + " — " + String(m.je[s].zahl).replace(/\s+/g, " ")).join("\n") + "\n");
fs.writeFileSync((process.env.ZEILE_DIR || O + "/p3/n0611/da0e") + "/ungemessen.txt", u.map((s) => s + " — " + String(((m.ungemessen || {})[s] || m.je[s] || {}).grund || "").replace(/\s+/g, " ").slice(0, 300)).join("\n") + "\n");
console.log(zeile);
if (process.env.TROCKEN) process.exit(0);
const IDX = O + "/p3/n0611/index-erledigt.tmp", env = { ...process.env, ...WER, GIT_INDEX_FILE: IDX };
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
            input: "OMEN " + (process.env.ZEILE_NAME || "gtx-da0e") + " " + k8 + ": " + g.length + " grün / " + r.length + " rot / " + u.length + " ungemessen" + (offen.length ? " (Zwischenstand)" : "") +
                "\n\nCo-Authored-By: Claude Fable 5.2 <noreply@anthropic.com>\n" });
        git(["push", "-q", "origin", c + ":refs/heads/koordination"]);
        console.log("erledigt " + c.slice(0, 8));
        process.exit(0);
    } catch (e) { console.log("erledigt Versuch " + v + ": " + String(e.message).slice(0, 200)); Atomics.wait(new Int32Array(new SharedArrayBuffer(4)), 0, 0, 20e3); }
}
console.log("MELDEN erledigt-Push scheiterte 5×"); process.exit(1);
