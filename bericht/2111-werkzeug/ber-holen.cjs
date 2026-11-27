// ber-holen.cjs <pm-baum> <pm-spitze40> — der schlanke Hand-Baum trägt `bericht/` nicht; Stationen lesen von dort Skripte der Seite
// (27.11.: gelaende.K2#1 UNGEMESSEN an „ENOENT … bericht\2210-messschuld-6cfce\skripte\zielen.js“ — der Haken window.__zielen kommt aus
// dieser Datei). Holt genau, was Stationen, punkte.cjs und konsum-zeuge.cjs unter `bericht/<ordner>/…` NENNEN: Text-Dateien ≤ 2 MB.
const cp = require("child_process"), fs = require("fs"), path = require("path");
const [K, T] = process.argv.slice(2);
const P = path.join(K, "meisterkarte-quelle/punkte");
const texte = [
    ...fs.readdirSync(path.join(P, "stationen")).filter((f) => /\.c?js$/.test(f)).map((f) => path.join(P, "stationen", f)),
    path.join(P, "punkte.cjs"),
    path.join(P, "konsum-zeuge.cjs"),
];
const ref = new Set();
for (const f of texte) {
    let t;
    try {
        t = fs.readFileSync(f, "utf8");
    } catch (e) {
        continue;
    }
    for (const m of t.matchAll(/bericht\/[A-Za-z0-9_.\/-]+/g)) {
        const r = m[0].replace(/[.\/]+$/, "");
        if (/^bericht\/[^\/]+/.test(r)) ref.add(r);
    }
}
const ls = cp.execFileSync("git", ["ls-tree", "-r", "-l", T, "--", "bericht"], { cwd: K, encoding: "utf8", maxBuffer: 512 << 20 }).split("\n");
const refs = [...ref];
const want = [];
let bytes = 0;
for (const l of ls) {
    const m = l.match(/^\d+ blob [0-9a-f]+\s+(\d+)\t(.+)$/);
    if (!m) continue;
    const sz = +m[1], p = m[2];
    if (sz > 2 << 20 || !/\.(c?js|mjs|sh|diff|json|txt|md)$/.test(p)) continue;
    if (refs.some((r) => p === r || p.startsWith(r + "/"))) (want.push(p), (bytes += sz));
}
if (!want.length) {
    console.log("BERICHT: nichts genannt (" + refs.length + " Nennungen)");
    process.exit(0);
}
const liste = path.join(require("os").tmpdir(), "ber-holen-" + process.pid + ".txt");
fs.writeFileSync(liste, want.join("\n") + "\n");
cp.execFileSync("git", ["checkout", "-q", T, "--pathspec-from-file=" + liste], { cwd: K, stdio: "inherit" });
fs.unlinkSync(liste);
console.log("BERICHT geholt: " + want.length + " Dateien, " + (bytes / 1048576).toFixed(1) + " MB aus " + refs.length + " Nennungen");
