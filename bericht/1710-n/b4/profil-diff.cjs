// 1710-n B4: Selbstzeit je Funktion bis zum Weltbild aus den Kalt-Profilen (0,5 ms), Median je Seite, die größten Unterschiede.
//   node profil-diff.cjs <kalt-ordner> [top]
"use strict";
const fs = require("fs");
const path = require("path");
const D = process.argv[2];
const TOP = Number(process.argv[3] || 25);
const med = (a) => {
    const b = a.slice().sort((x, y) => x - y);
    return b.length ? (b.length % 2 ? b[(b.length - 1) / 2] : (b[b.length / 2 - 1] + b[b.length / 2]) / 2) : 0;
};
const je = { A: [], B: [] };
for (const n of fs.readdirSync(D).filter((x) => /^[AB]\d+\.cpuprofile$/.test(x)).sort()) {
    const p = JSON.parse(fs.readFileSync(path.join(D, n), "utf8"));
    const byId = new Map(p.nodes.map((x) => [x.id, x]));
    const m = new Map();
    for (let i = 0; i < p.samples.length; i++) {
        const nd = byId.get(p.samples[i]);
        const dt = (i + 1 < p.timeDeltas.length ? p.timeDeltas[i + 1] : 0) / 1000;
        const cf = nd.callFrame;
        const k = `${cf.functionName || "(anonym)"} ${path.basename(cf.url || "")}`.trim();
        m.set(k, (m.get(k) || 0) + dt);
    }
    je[n[0]].push(m);
}
const alle = new Set();
for (const s of ["A", "B"]) for (const m of je[s]) for (const k of m.keys()) alle.add(k);
const z = [...alle].map((k) => {
    const a = med(je.A.map((m) => m.get(k) || 0)),
        b = med(je.B.map((m) => m.get(k) || 0));
    return { k, a, b, d: b - a };
});
const summe = (s) => med(je[s].map((m) => [...m.values()].reduce((x, y) => x + y, 0)));
console.log(`Profil-Summe bis Weltbild (Median): A ${summe("A").toFixed(0)} ms · B ${summe("B").toFixed(0)} ms`);
const idle = (s) => med(je[s].map((m) => (m.get("(idle)") || 0) + (m.get("(program)") || 0)));
console.log(`(idle)+(program): A ${idle("A").toFixed(0)} · B ${idle("B").toFixed(0)} ms`);
console.log("\n| Funktion | A ms | B ms | Δ B − A |\n|---|---|---|---|");
for (const r of z.filter((r) => !/^\((idle|program)\)/.test(r.k)).sort((x, y) => Math.abs(y.d) - Math.abs(x.d)).slice(0, TOP))
    console.log(`| ${r.k} | ${r.a.toFixed(0)} | ${r.b.toFixed(0)} | ${r.d > 0 ? "+" : ""}${r.d.toFixed(0)} |`);
console.log("\n| Top Selbstzeit B | A ms | B ms |\n|---|---|---|");
for (const r of z.filter((r) => !/^\((idle|program)\)/.test(r.k)).sort((x, y) => y.b - x.b).slice(0, 15))
    console.log(`| ${r.k} | ${r.a.toFixed(0)} | ${r.b.toFixed(0)} |`);
