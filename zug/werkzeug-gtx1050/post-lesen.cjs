// post-lesen.cjs <lauf.json> [faden=voxel] — die Nachrichten eines Fadens aus der Sicht des Haupt-Fadens (FREI_ZERLEGE): je Art
// Zahl, erste und letzte Zeit für ← (Auftrag) und → (Antwort), dann die Folge der Antworten in 0,5-s-Fenstern.
const fs = require("fs");
const b = JSON.parse(fs.readFileSync(process.argv[2], "utf8"));
const F = process.argv[3] || "voxel";
const p = (b.post || []).filter((e) => e[1] === F);
const je = {};
for (const [t, , dir, art] of p) {
    const k = dir + " " + art;
    const e = je[k] || (je[k] = [0, t, t]);
    e[0]++;
    e[2] = t;
}
console.log("--- " + F + ": je Art (Zahl · erste · letzte s)");
for (const [k, [n, a, e]] of Object.entries(je).sort((x, y) => x[1][1] - y[1][1])) console.log(k.padEnd(28) + String(n).padStart(4) + " · " + (a / 1000).toFixed(1).padStart(5) + " · " + (e / 1000).toFixed(1).padStart(5));
console.log("--- Folge (0,5-s-Fenster): ←Aufträge | →Antworten nach Art");
const t1 = Math.max(...p.map((e) => e[0]), 0);
for (let t = Math.floor(p[0][0] / 500) * 500; t <= t1; t += 500) {
    const w = p.filter((e) => e[0] >= t && e[0] < t + 500);
    if (!w.length) continue;
    const z = (dir) => { const m = {}; for (const e of w.filter((x) => x[2] === dir)) m[e[3]] = (m[e[3]] || 0) + 1; return Object.entries(m).map(([k, n]) => k + (n > 1 ? "×" + n : "")).join(" "); };
    console.log((t / 1000).toFixed(1).padStart(5) + " s · ← " + z("←").padEnd(46) + " | → " + z("→"));
}
