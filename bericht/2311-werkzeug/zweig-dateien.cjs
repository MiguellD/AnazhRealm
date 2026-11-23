// Baut per Plumbing EINEN Commit mit Dateien auf einer Basis und schiebt ihn als neuen Zweig, darauf optional leere Commits.
// node zweig-dateien.cjs <basis-sha> <zweig> <betreff-inhalt> <ziel=quelle>... [--leer <betreff>]...
const cp = require("child_process");
const path = require("path");
const R = "C:/Users/micha/AnazhRealm-profiband";
const a = process.argv.slice(2);
const [basis, zweig, betreff] = a;
const paare = [], leere = [];
for (let i = 3; i < a.length; i++) {
    if (a[i] === "--leer") leere.push(a[++i]);
    else paare.push(a[i].split("="));
}
const g = (args, opt = {}) => cp.execFileSync("git", args, { cwd: R, encoding: "utf8", maxBuffer: 64 << 20, ...opt }).trim();
const env = { ...process.env, GIT_INDEX_FILE: path.join(__dirname, "zweig.index") };
const wer = ["-c", "user.name=MiguellD", "-c", "user.email=87209049+MiguellD@users.noreply.github.com"];
g(["read-tree", basis], { env });
for (const [ziel, quelle] of paare) {
    const blob = g(["hash-object", "-w", quelle]);
    const modus = g(["ls-tree", basis, "--", ziel]).split(/\s+/)[0] || "100644";
    g(["update-index", "--add", "--cacheinfo", `${modus},${blob},${ziel}`], { env });
}
const baum = g(["write-tree"], { env });
let kopf = g([...wer, "commit-tree", baum, "-p", basis, "-F", betreff]);
console.log("INHALT " + kopf + " · " + g(["diff", "--stat", basis, kopf]).split("\n").pop());
for (const b of leere) {
    kopf = g([...wer, "commit-tree", baum, "-p", kopf, "-F", b]);
    console.log("LEER   " + kopf);
}
console.log("KOPF " + kopf);
