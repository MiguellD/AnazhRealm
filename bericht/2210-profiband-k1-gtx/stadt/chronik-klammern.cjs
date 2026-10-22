// k1-buehnen (b): Chronik-Klammern in Kommentar-Zeilen von scripts/ — in einer Klammer auf EINER Zeile (ohne „Lehre N",
// Zitat, Code, Schachtel) fällt jedes Glied (getrennt durch , oder ;), das ein Datum (TT.MM.) trägt; bleibt keines, fällt die
// Klammer mit dem Leerzeichen davor. Der Satz und die Erklärung bleiben.
// Aufruf: node chronik-klammern.cjs <baum> [--schreiben] [--max atome] [--ohne datei,datei]
const fs = require("fs"), path = require("path");
const baum = process.argv[2], schreiben = process.argv.includes("--schreiben");
const mi = process.argv.indexOf("--max"), max = mi > 0 ? Number(process.argv[mi + 1]) : Infinity;
const oi = process.argv.indexOf("--ohne"), ohne = oi > 0 ? process.argv[oi + 1].split(",") : [];
const M = (z) => (z.match(/[\p{L}\p{N}_$]+|[^\s\p{L}\p{N}_$]/gu) || []).length;
const DATUM = /\b\d{1,2}\.\d{1,2}\./;
const KL = /\s?\(([^()\n]*\b\d{1,2}\.\d{1,2}\.[^()\n]*)\)/g;
const files = [];
(function w(d) {
    for (const f of fs.readdirSync(d)) {
        const p = path.join(d, f), s = fs.statSync(p);
        if (s.isDirectory()) w(p);
        else if (/\.(c?js|mjs)$/.test(f)) files.push(p);
    }
})(path.join(baum, "scripts"));
let summe = 0, n = 0;
const je = [];
for (const f of files.sort()) {
    if (summe >= max) break;
    const rel = path.relative(baum, f).split(path.sep).join("/");
    if (ohne.includes(rel)) continue;
    const zeilen = fs.readFileSync(f, "utf8").split("\n");
    let hier = 0;
    for (let i = 0; i < zeilen.length && summe < max; i++) {
        const z = zeilen[i];
        if (!/^\s*\/\/ /.test(z)) continue;
        const neu = z.replace(KL, (all, innen) => {
            if (/Lehre|http|`|„/.test(innen)) return all;
            const rest = innen.split(/[,;]\s*/).filter((s) => !DATUM.test(s));
            return rest.length ? ` (${rest.join(", ")})` : "";
        });
        if (neu === z) continue;
        const d = M(z) - M(neu);
        zeilen[i] = neu;
        summe += d;
        hier += d;
        n++;
    }
    if (hier) {
        je.push([hier, rel]);
        if (schreiben) fs.writeFileSync(f, zeilen.join("\n"));
    }
}
console.log("Klammern", n, "Atome", summe, "Dateien", je.length);
console.log(je.sort((a, b) => b[0] - a[0]).slice(0, 12).map((x) => x.join(" ")).join("\n"));
