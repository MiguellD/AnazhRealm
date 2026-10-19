// 1910 S6-Takt: der REST des Takts (cpu − renderOben) im Frame-Zerleger, je Seite gepoolt. Spalten NACH NAMEN je Welt (A hat
// keine Verbands-Spalten, die Kern-Spalten unterscheiden sich). In den Takten über der Schwelle (p95/p99 des Rests von A, gleich
// für beide Seiten): Anteil je Seite und je Spalte Mittel und Beitrag (ms je 100 Takte); dazu je Spalte der Anteil > 1 ms.
//   node fzrest.cjs <s6takt-ordner> → fzrest.txt
"use strict";
const fs = require("fs");
const path = require("path");
const D = process.argv[2];
const seite = { A: [], B: [] };
const namen = new Set();
for (const n of fs.readdirSync(path.join(D, "welt")).sort()) {
    const t = fs.readFileSync(path.join(D, "welt", n, "fz.json"), "utf8");
    const j = JSON.parse(t.slice(t.indexOf("{"))).ergebnis;
    const k = j.kopf.split(",");
    for (const x of k) namen.add(x);
    for (const z of j.zeilen.split("\n")) {
        const v = z.split(",").map(Number);
        const o = {};
        k.forEach((x, i) => (o[x] = v[i]));
        if (o.gerendert === 1) seite[n[0]].push(o);
    }
}
const ZAHL = /^(n[A-Z]|kipp|tier|dt$|wach|laeuft|flucht|knoten|tiere|matrixGangN|schattenN|stufen|buendel|gerendert$|cpu$)/;
const spalten = [...namen].filter((k) => !ZAHL.test(k));
const rest = (r) => r.cpu - r.renderOben;
const q = (a, p) => {
    const b = a.slice().sort((x, y) => x - y);
    return b[Math.min(b.length - 1, Math.floor(p * b.length))];
};
const L = [];
for (const s of ["A", "B"]) {
    const r = seite[s].map(rest);
    L.push(`${s}: Rest (cpu − renderOben) p50 ${q(r, 0.5).toFixed(2)} · p95 ${q(r, 0.95).toFixed(2)} · p99 ${q(r, 0.99).toFixed(2)} · Ø ${(r.reduce((a, b) => a + b, 0) / r.length).toFixed(3)} (n ${r.length})`);
}
L.push("");
for (const P of [0.95, 0.99]) {
    const schwelle = q(seite.A.map(rest), P);
    const sch = { A: seite.A.filter((r) => rest(r) > schwelle), B: seite.B.filter((r) => rest(r) > schwelle) };
    L.push(`## Rest-Takte über der A-Schwelle p${Math.round(P * 100)} = ${schwelle.toFixed(2)} ms`);
    L.push(`Anteil: A ${((100 * sch.A.length) / seite.A.length).toFixed(2)} % (${sch.A.length}/${seite.A.length}) · B ${((100 * sch.B.length) / seite.B.length).toFixed(2)} % (${sch.B.length}/${seite.B.length})`);
    const zeilen = spalten.map((k) => {
        const m = (a) => (a.length ? a.reduce((x, r) => x + (r[k] || 0), 0) / a.length : 0);
        const beitrag = (s) => (100 * sch[s].reduce((x, r) => x + (r[k] || 0), 0)) / seite[s].length;
        return [k, m(sch.A), m(sch.B), beitrag("A"), beitrag("B")];
    });
    zeilen.sort((a, b) => Math.abs(b[4] - b[3]) - Math.abs(a[4] - a[3]));
    L.push("Spalte | Ø in schweren A | Ø in schweren B | ms je 100 Takte A | B | Δ");
    for (const z of zeilen.slice(0, 14))
        L.push(`${z[0]} | ${z[1].toFixed(3)} | ${z[2].toFixed(3)} | ${z[3].toFixed(2)} | ${z[4].toFixed(2)} | ${(z[4] - z[3]).toFixed(2)}`);
    L.push("");
}
L.push("## Anteil der Takte, in denen ein Glied > 1 ms trägt (gepoolt)");
for (const k of spalten) {
    const a = seite.A.filter((r) => r[k] > 1).length / seite.A.length,
        b = seite.B.filter((r) => r[k] > 1).length / seite.B.length;
    if (a > 0.002 || b > 0.002) L.push(`${k}: A ${(100 * a).toFixed(2)} % · B ${(100 * b).toFixed(2)} %`);
}
fs.writeFileSync(path.join(D, "fzrest.txt"), L.join("\n") + "\n");
console.log(L.join("\n"));
