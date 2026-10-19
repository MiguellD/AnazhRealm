// 1910 S6-Takt: der saubere lauf (30 s, Regler voll, Tiere frei, vor jeder Hülle) über alle Welten der Runden 1 (welt/) und 2
// (welt2/), Genesis Third: je Welt CPU-Takt p50/p95/p99, je Paar (An Bn) Δ, Mittel und t der Paar-Δ, das Soll 5,8.
//   node lauf-zusammen.cjs <s6takt-ordner>   → lauf-zusammen.txt
"use strict";
const fs = require("fs");
const path = require("path");
const D = process.argv[2];
const lies = (f) => {
    try {
        const t = fs.readFileSync(f, "utf8");
        return JSON.parse(t.slice(t.indexOf("{")));
    } catch (_e) {
        return null;
    }
};
const W = {};
for (const r of ["welt", "welt2"]) {
    const d = path.join(D, r);
    if (!fs.existsSync(d)) continue;
    for (const n of fs.readdirSync(d)) {
        const l = lies(path.join(d, n, "lauf.json"));
        if (l && l.cpuTaktMs) W[n] = { ...l.cpuTaktMs, quelle: r + "/" + n + "/lauf.json" };
    }
}
const mit = (a) => a.reduce((x, y) => x + y, 0) / a.length;
const sd = (a) => Math.sqrt(a.reduce((s, x) => s + (x - mit(a)) ** 2, 0) / (a.length - 1));
const L = [];
const nr = [...new Set(Object.keys(W).map((n) => Number(n.slice(1))))].sort((a, b) => a - b);
L.push("Paar | A p50/p95/p99 | B p50/p95/p99 | Δ p50 | Δ p95 | Δ p99");
const d = { p50: [], p95: [], p99: [] };
const seite = { A: { p50: [], p95: [], p99: [] }, B: { p50: [], p95: [], p99: [] } };
for (const i of nr) {
    const a = W["A" + i],
        b = W["B" + i];
    for (const [s, x] of [["A", a], ["B", b]]) if (x) for (const k of ["p50", "p95", "p99"]) seite[s][k].push(x[k]);
    if (!a || !b) continue;
    for (const k of ["p50", "p95", "p99"]) d[k].push(b[k] - a[k]);
    L.push(`${i} | ${a.p50}/${a.p95}/${a.p99} | ${b.p50}/${b.p95}/${b.p99} | ${(b.p50 - a.p50).toFixed(2)} | ${(b.p95 - a.p95).toFixed(2)} | ${(b.p99 - a.p99).toFixed(2)}`);
}
L.push("");
for (const k of ["p50", "p95", "p99"]) {
    const x = d[k];
    const t = mit(x) / (sd(x) / Math.sqrt(x.length));
    L.push(`${k}: A Ø ${mit(seite.A[k]).toFixed(3)} · B Ø ${mit(seite.B[k]).toFixed(3)} · Paar-Δ Ø ${mit(x).toFixed(3)} (sd ${sd(x).toFixed(3)}, n ${x.length}, t ${t.toFixed(2)})`);
}
L.push(`Soll 5,8 (p95 ≤ 5,8): A ${seite.A.p95.filter((x) => x <= 5.8).length} von ${seite.A.p95.length} · B ${seite.B.p95.filter((x) => x <= 5.8).length} von ${seite.B.p95.length}`);
L.push("", "Rohpfade: " + Object.values(W).map((w) => w.quelle).join(" · "));
fs.writeFileSync(path.join(D, "lauf-zusammen.txt"), L.join("\n") + "\n");
console.log(L.join("\n"));
