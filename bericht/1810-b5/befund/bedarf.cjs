// 1810 B5 Finder: der Studio-Bau (Faden-Stempel) der Lieferungen VOR dem Bild, je Klasse × Blick × Abstand × Stufe —
// was das erste Bild verlangt, in Faden-ms.   node bedarf.cjs <roh> <lauf> …
"use strict";
const fs = require("fs");
const path = require("path");
const [D, ...laeufe] = process.argv.slice(2);
const BAUM = /^(eiche|fichte|tanne|birke|weide|mammut|buche|karst|strauch)\|/;
const kl = (k) => {
    const r = k.split("#")[1] || "";
    if (/^export/.test(k)) return "Dorf-Export";
    if (/^mensch\|/.test(r)) return "Leib";
    if (/^(gras|blume|farn|gestruepp|totstamm|geroell)\|/.test(r)) return "Streu";
    if (/^(findling|basalt|sediment|zacken|kristalle)\|/.test(r)) return "Fels";
    if (BAUM.test(r)) return /\|1(\|ov|$)/.test(r) && !/ov:/.test(r) ? "Karte(L1)" : "Baum";
    if (/\|3(\||$)/.test(r)) return "Haus/Tor L3 (Wurf)";
    return "Haus/Tor";
};
const agg = {};
for (const N of laeufe) {
    const j = JSON.parse(fs.readFileSync(path.join(D, N + ".json"), "utf8"));
    const LF = j.lf, WB = j.weltbildDa;
    const s = new Map(LF.s.map((x) => [x[0], x]));
    const an = new Map(LF.an.map((a) => [a[1], a]));
    LF.q.forEach((q, i) => {
        if (q[0] > WB || q[6]) return;
        const x = s.get(i);
        const a = x && an.get(x[2]);
        const f = a && Array.isArray(a[7]) ? a[7] : null;
        const bau = f && f[1] ? f[2] - f[1] : 0;
        const d = q[2];
        const band = d < 0 ? "ohne Ort" : d <= 30 ? "≤30 m" : d <= 60 ? "≤60 m" : "61–150 m";
        const k = `${kl(q[1])} · ${q[3] ? "im Blick" : "außer Blick"} · ${band}`;
        const z = agg[k] || (agg[k] = { n: 0, ms: 0, laeufe: new Set() });
        z.n++;
        z.ms += bau;
        z.laeufe.add(N);
    });
}
const L = laeufe.length;
console.log(`Studio-Bau vor dem Bild je Lauf (Mittel über ${L} Läufe: ${laeufe.join(" ")})`);
let sum = 0;
for (const [k, z] of Object.entries(agg).sort((a, b) => b[1].ms - a[1].ms)) {
    sum += z.ms / L;
    console.log(`  ${k.padEnd(44)} n ${(z.n / L).toFixed(1).padStart(5)} · Faden ${(z.ms / L).toFixed(0).padStart(6)} ms`);
}
console.log(`  Σ ${sum.toFixed(0)} ms Faden-Arbeit je Lauf`);
