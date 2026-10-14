// K59: Vorher↔nachher in EINER Sitzung — je Lauf CPU-Takt/Frame aus lauf-{A,B}<n>.txt, je Methode µs je FRAME aus
// profil-{A,B}<n>.txt (selbst und gesamt), gemittelt je Seite, die größten Δ B − A.  node diff.cjs <dir> [n]
"use strict";
const fs = require("fs");
const path = require("path");
const DIR = process.argv[2] || __dirname;
const N = +(process.argv[3] || 25);
const lies = (f) => {
    const t = fs.readFileSync(path.join(DIR, f), "utf8");
    const j = JSON.parse(t.slice(t.indexOf("{")));
    return j.ergebnis || j;
};
const L = { A: [], B: [] },
    P = { A: [], B: [] };
for (const n of fs.readdirSync(DIR).sort()) {
    let m = /^lauf-([AB])(\d+)\.txt$/.exec(n);
    if (m) L[m[1]].push({ n, ...lies(n) });
    m = /^profil-([AB])(\d+)\.txt$/.exec(n);
    if (m) P[m[1]].push({ n, ...lies(n) });
}
const f = (x) => (x == null ? "?" : (+x).toFixed(2));
console.log("Lauf | fps | Frame p50/p95 | CPU-Takt p50/p95");
for (const s of ["A", "B"])
    for (const j of L[s])
        console.log(`${j.n} | ${j.fps} | ${j.frameMs.p50}/${j.frameMs.p95} | ${j.cpuTaktMs.p50}/${j.cpuTaktMs.p95}`);
const mit = (a) => a.reduce((x, y) => x + y, 0) / (a.length || 1);
for (const k of [
    ["cpuTaktMs", "p50"],
    ["cpuTaktMs", "p95"],
    ["frameMs", "p95"],
]) {
    const a = L.A.map((j) => j[k[0]][k[1]]),
        b = L.B.map((j) => j[k[0]][k[1]]);
    console.log(`${k.join(" ")}: A ${a.join("|")} (${f(mit(a))}) → B ${b.join("|")} (${f(mit(b))}) Δ ${f(mit(b) - mit(a))}`);
}
for (const art of ["gesamt", "selbst"]) {
    const je = { A: {}, B: {} };
    for (const s of ["A", "B"])
        for (const j of P[s]) {
            const fr = j.frames || 1;
            const seen = new Set();
            for (const z of j[art] || []) {
                const r = /^\s*[\d.]+ %\s+(\d+) ms\s+(.+)$/.exec(z);
                if (!r) continue;
                const key = r[2].trim().replace(/\s*:\d+$/, "").replace(/pptr:evaluate.*$/, "pptr");
                if (art === "gesamt" && seen.has(key)) continue;
                seen.add(key);
                (je[s][key] = je[s][key] || []).push((+r[1] * 1000) / fr);
            }
        }
    const keys = new Set([...Object.keys(je.A), ...Object.keys(je.B)]);
    const rows = [];
    for (const k of keys) {
        const a = (je.A[k] || []).concat(Array(Math.max(0, P.A.length - (je.A[k] || []).length)).fill(0));
        const b = (je.B[k] || []).concat(Array(Math.max(0, P.B.length - (je.B[k] || []).length)).fill(0));
        rows.push({ k, a: mit(a), b: mit(b), d: mit(b) - mit(a) });
    }
    rows.sort((x, y) => Math.abs(y.d) - Math.abs(x.d));
    console.log(`\n${art} (µs je Frame, A → B, Δ):`);
    for (const r of rows.slice(0, N)) console.log(`${f(r.a).padStart(9)} → ${f(r.b).padStart(9)}  ${f(r.d).padStart(9)}  ${r.k}`);
}
