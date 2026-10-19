// 1910 S6-Takt: Profil je Funktion NACH NAMEN über die Runden 1 (welt/) und 3 (welt3/): je Runde Median A, B (und X) und Δ;
// gezeigt werden die Namen, deren Δ B − A in BEIDEN Runden dasselbe Vorzeichen hat und |Δ| ≥ 0,008 ms je Frame (selbst oder gesamt).
//   node profil-rund.cjs <s6takt-ordner> → profil-rund.txt
"use strict";
const fs = require("fs");
const path = require("path");
const D = process.argv[2];
const lies = (f) => { try { const t = fs.readFileSync(f, "utf8"); return JSON.parse(t.slice(t.indexOf("{"))); } catch (_e) { return null; } };
const karte = (p, feld) => {
    const m = new Map();
    if (!p) return m;
    for (const z of p[feld] || []) {
        const r = /^\s*([\d.]+) %\s+(\d+) ms\s+(.*)$/.exec(z);
        if (!r) continue;
        const k = r[3].replace(/:(\d+)$/, "");
        if (/pptr:evaluate/.test(k)) continue;
        m.set(k, (m.get(k) || 0) + Number(r[2]) / (p.frames || 1));
    }
    return m;
};
const med = (a) => { const b = a.filter(Number.isFinite).sort((x, y) => x - y); if (!b.length) return NaN; const m = b.length >> 1; return b.length % 2 ? b[m] : (b[m - 1] + b[m]) / 2; };
const runden = { R1: "welt", R3: "welt3" };
const out = [];
for (const feld of ["gesamt", "selbst"]) {
    const R = {};
    for (const [rn, dir] of Object.entries(runden)) {
        const d = path.join(D, dir);
        const welten = fs.readdirSync(d).filter((n) => /^[ABX]\d+$/.test(n));
        const k = {};
        for (const n of welten) k[n] = karte(lies(path.join(d, n, "profil.json")), feld);
        const namen = new Set();
        for (const n of welten) for (const x of k[n].keys()) namen.add(x);
        R[rn] = {};
        for (const x of namen) {
            const v = (s) => welten.filter((n) => n[0] === s).map((n) => (k[n].has(x) ? k[n].get(x) : NaN));
            const a = v("A"), b = v("B"), c = v("X");
            if (a.filter(Number.isFinite).length < Math.min(3, a.length) || b.filter(Number.isFinite).length < Math.min(3, b.length)) continue;
            R[rn][x] = { A: med(a), B: med(b), X: med(c), d: med(b) - med(a), dX: med(c) - med(a) };
        }
    }
    const rows = [];
    for (const x of Object.keys(R.R1)) {
        const r1 = R.R1[x], r3 = R.R3[x];
        if (!r3) continue;
        if (Math.sign(r1.d) !== Math.sign(r3.d) || Math.min(Math.abs(r1.d), Math.abs(r3.d)) < 0.008) continue;
        rows.push([x, r1, r3]);
    }
    rows.sort((p, q) => Math.abs(q[1].d + q[2].d) - Math.abs(p[1].d + p[2].d));
    out.push(`## ${feld}: Δ B − A in beiden Runden gleichgerichtet, |Δ| ≥ 0,008 ms je Frame (Median je Seite; X = B-Code ohne Verband, nur Runde 3)`);
    out.push("Funktion | R1 A → B (Δ) | R3 A → B (Δ) | R3 X (Δ zu A)");
    for (const [x, r1, r3] of rows.slice(0, 40))
        out.push(`${x} | ${r1.A.toFixed(3)} → ${r1.B.toFixed(3)} (${r1.d >= 0 ? "+" : ""}${r1.d.toFixed(3)}) | ${r3.A.toFixed(3)} → ${r3.B.toFixed(3)} (${r3.d >= 0 ? "+" : ""}${r3.d.toFixed(3)}) | ${Number.isFinite(r3.X) ? r3.X.toFixed(3) + " (" + (r3.dX >= 0 ? "+" : "") + r3.dX.toFixed(3) + ")" : "–"}`);
    out.push("");
}
fs.writeFileSync(path.join(D, "profil-rund.txt"), out.join("\n") + "\n");
console.log(out.join("\n"));
