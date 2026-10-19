// 1910 F1: der CPU-Takt über die Zellen (wie p3/n1810/s6/stehen/cpu-ueber-zellen.txt) — je Zelle Δ B − A und Welch-t aus den
// Auswertungen, über die Zellen Stouffer z = Σt/√k.   node zellen.cjs <f1-ordner>  → schreibt <f1>/cpu-ueber-zellen.txt
"use strict";
const fs = require("fs");
const path = require("path");
const F = process.argv[2];
const Z = ["w-ego", "w-third", "g-ego", "g-third"];
const lies = (f) => {
    try {
        return JSON.parse(fs.readFileSync(f, "utf8"));
    } catch (_e) {
        return null;
    }
};
const zeilen = [];
const stouffer = (ts) => {
    const t = ts.filter(Number.isFinite);
    return t.length ? (t.reduce((a, x) => a + x, 0) / Math.sqrt(t.length)).toFixed(2) : "–";
};
const fx = (v, n) => (Number.isFinite(v) ? (v > 0 ? "+" : "") + v.toFixed(n) : "–");
// stehend: spanne["t-p95"], ["t-p99"] (auswertung-stehen.cjs)
zeilen.push("F1 stehend, B − A je Zelle (Welch-t aus stehen/auswertung-<k>.json, spanne)");
const st95 = [],
    st99 = [];
for (const k of Z) {
    const j = lies(path.join(F, "stehen", `auswertung-${k}.json`));
    if (!j) continue;
    const a = j.spanne["t-p95"],
        b = j.spanne["t-p99"];
    st95.push(a.t);
    st99.push(b.t);
    zeilen.push(`${k}: CPU p95 Δ ${fx(a.d, 3)} t ${fx(a.t, 2)} | p99 Δ ${fx(b.d, 3)} t ${fx(b.t, 2)}`);
}
zeilen.push(`Stouffer über ${st95.length} Zellen (Σt/√k): p95 ${stouffer(st95)} · p99 ${stouffer(st99)}`);
// gehend: urteile[gang = geht, titel CPU-Takt p95/p99] (auswertung-gehen.cjs)
zeilen.push("", "F1 gehend (Mittel geht-1/geht-2 je Boot), B − A je Zelle (Welch-t aus gehen/auswertung-gehen-<k>.json)");
const g95 = [],
    g99 = [],
    s95 = [];
for (const k of Z) {
    const j = lies(path.join(F, "gehen", `auswertung-gehen-${k}.json`));
    if (!j) continue;
    const u = (gang, titel) => j.urteile.find((x) => x.gang === gang && x.titel === titel) || {};
    const a = u("geht", "CPU-Takt p95 ms"),
        b = u("geht", "CPU-Takt p99 ms"),
        c = u("steht", "CPU-Takt p95 ms");
    g95.push(a.t);
    g99.push(b.t);
    s95.push(c.t);
    zeilen.push(`${k}: geht CPU p95 Δ ${fx(a.d, 2)} t ${fx(a.t, 2)} | p99 Δ ${fx(b.d, 2)} t ${fx(b.t, 2)} | steht CPU p95 Δ ${fx(c.d, 2)} t ${fx(c.t, 2)}`);
}
zeilen.push(`Stouffer über ${g95.length} Zellen: geht p95 ${stouffer(g95)} · geht p99 ${stouffer(g99)} · steht (Geh-Sitzung) p95 ${stouffer(s95)}`);
fs.writeFileSync(path.join(F, "cpu-ueber-zellen.txt"), zeilen.join("\n") + "\n");
console.log(zeilen.join("\n"));
