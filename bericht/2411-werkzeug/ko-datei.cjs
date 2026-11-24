// Bucht EINE Datei per Plumbing nach koordination (kein Arbeitsbaum, kein Token im Wort): node ko-datei.cjs <quelle> <ziel-pfad> <betreff-datei>
const cp = require("child_process");
const fs = require("fs");
const path = require("path");
const R = "C:/Users/micha/AnazhRealm-profiband";
const [quelle, ziel, betreffDatei] = process.argv.slice(2);
const g = (args, opt = {}) => cp.execFileSync("git", args, { cwd: R, encoding: "utf8", maxBuffer: 64 << 20, ...opt }).trim();
const env = { ...process.env, GIT_INDEX_FILE: path.join(__dirname, "ko-datei.index") };
const blob = g(["hash-object", "-w", quelle]);
for (let v = 1; v <= 4; v++) {
    g(["fetch", "-q", "origin", "+refs/heads/koordination:refs/remotes/origin/koordination"]);
    const P = g(["rev-parse", "origin/koordination"]);
    g(["read-tree", P], { env });
    g(["update-index", "--add", "--cacheinfo", `100644,${blob},${ziel}`], { env });
    const T = g(["write-tree"], { env });
    const C = g(["-c", "user.name=MiguellD", "-c", "user.email=87209049+MiguellD@users.noreply.github.com", "commit-tree", T, "-p", P, "-F", betreffDatei]);
    try {
        cp.execFileSync("git", ["push", "origin", `${C}:refs/heads/koordination`], { cwd: R, encoding: "utf8", stdio: ["ignore", "pipe", "pipe"] });
        console.log(`GEBUCHT ${C.slice(0, 8)} auf ${P.slice(0, 8)} · ${ziel} · Versuch ${v} · ${new Date().toTimeString().slice(0, 5)}`);
        process.exit(0);
    } catch (e) {
        console.log(`Versuch ${v} abgelehnt: ${String(e.stderr || e.message).split("\n").slice(-3).join(" | ").slice(0, 200)}`);
    }
}
process.exit(1);
