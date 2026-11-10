// melde.cjs <zeile-datei> [<bericht-datei> <ziel-pfad-in-koordination>] — EIN Commit auf koordination: die freie Zeile ans Ende von
// zug/erledigt.txt (Datum und Zeit setzt das Werkzeug davor) und, wenn genannt, der Bericht an seinen Ort. Dieselbe Klempnerei wie
// zeile-da0e.cjs (eigener Index, commit-tree, Push auf refs/heads/koordination; 5 Versuche gegen fremde Pushes). TROCKEN=1 zeigt nur.
"use strict";
const fs = require("fs"), cp = require("child_process");
const O = "C:/Users/micha/Desktop/AnazhRealm-OMEN", MESS = O + "/AnazhRealm-mess";
const WER = { GIT_AUTHOR_NAME: "MiguellD", GIT_AUTHOR_EMAIL: "87209049+MiguellD@users.noreply.github.com",
    GIT_COMMITTER_NAME: "MiguellD", GIT_COMMITTER_EMAIL: "87209049+MiguellD@users.noreply.github.com" };
const [ZEILE_F, BERICHT_F, ZIEL] = process.argv.slice(2), DATEI = process.env.DATEI || "zug/erledigt.txt"; // DATEI=zug/sitzung.txt für START-Zeilen
const git = (a, o = {}) => cp.execFileSync("git", a, { cwd: MESS, encoding: "utf8", stdio: ["pipe", "pipe", "pipe"], ...o }).trim();
const zw = (n) => String(n).padStart(2, "0"), d = new Date();
const text = fs.readFileSync(ZEILE_F, "utf8").replace(/\s+/g, " ").trim();
if (!text) throw new Error("leere Zeile");
const zeile = d.getFullYear() + "-" + zw(d.getMonth() + 1) + "-" + zw(d.getDate()) + " " + zw(d.getHours()) + ":" + zw(d.getMinutes()) + " " + text;
console.log(zeile);
if (BERICHT_F && !ZIEL) throw new Error("Bericht ohne Ziel-Pfad");
if (process.env.TROCKEN) process.exit(0);
const IDX = O + "/p3/n0611/index-melde.tmp", env = { ...process.env, ...WER, GIT_INDEX_FILE: IDX };
for (let v = 1; v <= 5; v++) {
    try {
        git(["fetch", "-q", "origin", "+refs/heads/koordination:refs/omen/erledigt-koord"]);
        const basis = git(["rev-parse", "refs/omen/erledigt-koord"]);
        fs.rmSync(IDX, { force: true });
        git(["read-tree", basis], { env });
        let alt = cp.execFileSync("git", ["show", basis + ":" + DATEI], { cwd: MESS }).toString("utf8");
        const nl = alt.includes("\r\n") ? "\r\n" : "\n";
        if (alt && !alt.endsWith("\n")) alt += nl;
        const blob = git(["hash-object", "-w", "--no-filters", "--stdin"], { input: alt + zeile + nl });
        git(["update-index", "--add", "--cacheinfo", "100644," + blob + "," + DATEI], { env });
        if (BERICHT_F) {
            const b = git(["hash-object", "-w", "--no-filters", BERICHT_F]);
            git(["update-index", "--add", "--cacheinfo", "100644," + b + "," + ZIEL], { env });
        }
        const c = git(["commit-tree", git(["write-tree"], { env }), "-p", basis, "-F", "-"], { env,
            input: "OMEN " + text.slice(0, 64) + "\n\n" + (BERICHT_F ? ZIEL + "\n\n" : "") + "Co-Authored-By: Claude Fable 5.2 <noreply@anthropic.com>\n" });
        git(["push", "-q", "origin", c + ":refs/heads/koordination"]);
        console.log("koordination " + c.slice(0, 8));
        process.exit(0);
    } catch (e) {
        console.log("Versuch " + v + ": " + String(e.message).slice(0, 200));
        Atomics.wait(new Int32Array(new SharedArrayBuffer(4)), 0, 0, 20e3);
    }
}
console.log("MELDEN Push scheiterte 5×");
process.exit(1);
