// 1410-2: der CPU-Täter je Methode — der Schritt `profil` der Messfolge (Selbstzeit je Funktion, gesampelt unter Regler voll)
// je Boot in ms je Sekunde Probe, gemittelt je Seite; Ausgabe die größten Δ B − A.  node profil-diff.cjs <dir> <kombi>[,<kombi>…] [n]
"use strict";
const fs = require("fs");
const path = require("path");
const DIR = process.argv[2] || __dirname;
const KOMBIS = (process.argv[3] || "w-ego").split(",");
const N = +(process.argv[4] || 20);
const seiten = { A: [], B: [] };
for (const n of fs.readdirSync(DIR)) {
    const m = /^([a-z]-[a-z]+)-([AB])[0-9]+\.json$/.exec(n);
    if (!m || !KOMBIS.includes(m[1])) continue;
    const j = JSON.parse(fs.readFileSync(path.join(DIR, n), "utf8"));
    const s = (j.schritte || []).find((x) => x.name === "profil");
    if (!s || !s.ergebnis || !s.ergebnis.selbst) continue;
    const t = s.ergebnis.gesampeltMs / 1000;
    const je = {};
    for (const z of s.ergebnis.selbst) {
        const r = /^\s*[\d.]+ %\s+(\d+) ms\s+(.+)$/.exec(z);
        if (r) je[r[2].trim()] = +r[1] / t;
    }
    seiten[m[2]].push({ boot: n, je });
}
const mittel = (S, k) => seiten[S].reduce((a, b) => a + (b.je[k] || 0), 0) / Math.max(1, seiten[S].length);
const namen = new Set([...seiten.A, ...seiten.B].flatMap((b) => Object.keys(b.je)));
const zeilen = [...namen]
    .filter((k) => !/^\((idle|program)\)/.test(k))
    .map((k) => ({ k, a: mittel("A", k), b: mittel("B", k) }))
    .map((z) => ({ ...z, d: z.b - z.a }))
    .sort((x, y) => Math.abs(y.d) - Math.abs(x.d))
    .slice(0, N);
const summe = (S) => mittel(S, "(program) :0");
let out = `## Profil ${KOMBIS.join("+")} — Selbstzeit ms je s Probe (A ${seiten.A.length} Boots, B ${seiten.B.length} Boots)\n\n| Methode | A | B | Δ B − A |\n|---|---|---|---|\n`;
for (const z of zeilen) out += `| ${z.k} | ${z.a.toFixed(1)} | ${z.b.toFixed(1)} | ${z.d > 0 ? "+" : ""}${z.d.toFixed(1)} |\n`;
out += `| (program) | ${summe("A").toFixed(1)} | ${summe("B").toFixed(1)} | ${(summe("B") - summe("A")).toFixed(1)} |\n`;
console.log(out);
