// Toggle-Log → je Variante: Bank (Mittel der drei), Δ zum Mittel der Nachbar-Bänke der Bezugs-Variante (wie / an)
const fs = require("fs");
const zeilen = fs.readFileSync(process.argv[2], "utf8").split(/\r?\n/);
const bezug = process.argv[3] || "wie";
const R = [];
for (const z of zeilen) {
    const m = /^\S+ (?:A )?(\S+) .*?bank ([\d. ]+?)\s+takt (\d+)MHz (\d+)C/.exec(z);
    if (!m) continue;
    const w = m[2].trim().split(/\s+/).map(Number);
    R.push({ v: m[1].replace(/^waechter-/, ""), ms: w.reduce((a, b) => a + b, 0) / w.length, mhz: +m[3], c: +m[4] });
}
const je = {};
for (let i = 0; i < R.length; i++) {
    if (R[i].v === bezug) continue;
    const vor = R[i - 1], nach = R[i + 1];
    if (!vor || !nach || vor.v !== bezug || nach.v !== bezug) continue;
    const d = R[i].ms - (vor.ms + nach.ms) / 2;
    (je[R[i].v] = je[R[i].v] || []).push(d);
}
for (const [v, ds] of Object.entries(je)) console.log(`${v.padEnd(10)} Δ ${ds.map((d) => (d >= 0 ? "+" : "") + d.toFixed(3)).join(" · ")}  Mittel ${(ds.reduce((a, b) => a + b, 0) / ds.length).toFixed(3)} ms`);
console.log(`${bezug} Bänke: ${R.filter((r) => r.v === bezug).map((r) => r.ms.toFixed(2)).join(" ")} · Takt ${Math.min(...R.map((r) => r.mhz))}–${Math.max(...R.map((r) => r.mhz))} MHz · ${Math.min(...R.map((r) => r.c))}–${Math.max(...R.map((r) => r.c))} °C`);
