// 1710-n B4 Auswertung GEHEN: je Boot (frische Werkbank-Sitzung, Regler voll, Ego) lauf stehend (25 s) und zweimal gehend (30 s,
// 4 m/s geradeaus −z 0 → −60 m und zurück): fps, Frame p50/p95/p99, CPU-Takt p50/p95, GPU-Durchsatz p50, Anteil > 33 ms; je Größe
// das Mittel je Seite mit den Werten je Boot, Δ B − A und 2σ (gepoolt) — „nicht langsamer", wenn Δ ≤ 2σ.
//   node auswertung-gehen.cjs <gehen-ordner> <w-ego|g-ego>
"use strict";
const fs = require("fs");
const path = require("path");
const D = process.argv[2];
const K = process.argv[3] || "w-ego";
const lies = (f) => {
    try {
        const t = fs.readFileSync(f, "utf8");
        const j = JSON.parse(t.slice(t.indexOf("{")));
        return j.ergebnis || j;
    } catch (_e) {
        return null;
    }
};
const mittel = (a) => {
    const b = a.filter(Number.isFinite);
    return b.length ? b.reduce((x, y) => x + y, 0) / b.length : NaN;
};
const f1 = (v) => (Number.isFinite(v) ? v.toFixed(1) : "–");
const f2 = (v) => (Number.isFinite(v) ? v.toFixed(2) : "–");
const GR = [
    ["fps", (l) => l.fps, f1, -1],
    ["Frame p50 ms", (l) => l.frameMs && l.frameMs.p50, f1, 1],
    ["Frame p95 ms", (l) => l.frameMs && l.frameMs.p95, f1, 1],
    ["Frame p99 ms", (l) => l.frameMs && l.frameMs.p99, f1, 1],
    ["CPU-Takt p50 ms", (l) => l.cpuTaktMs && l.cpuTaktMs.p50, f2, 1],
    ["CPU-Takt p95 ms", (l) => l.cpuTaktMs && l.cpuTaktMs.p95, f1, 1],
    ["GPU-Durchsatz p50 ms", (l) => l.gpuDurchsatzMs && l.gpuDurchsatzMs.p50, f2, 1],
];
const re = new RegExp("^" + K + "-([AB])([0-9]+)-steht\\.txt$");
const boots = fs
    .readdirSync(D)
    .filter((x) => re.test(x))
    .map((x) => {
        const [, s, n] = re.exec(x);
        const b = `${K}-${s}${n}`;
        return {
            boot: b,
            seite: s,
            steht: lies(path.join(D, `${b}-steht.txt`)),
            geht: [1, 2].map((r) => lies(path.join(D, `${b}-geht-${r}.txt`))),
            geher: (fs.existsSync(path.join(D, `${b}-geher-ende.txt`)) ? fs.readFileSync(path.join(D, `${b}-geher-ende.txt`), "utf8") : "").trim(),
        };
    })
    .sort((a, b) => a.boot.localeCompare(b.boot));
let out = `## ${K} — je Boot\n\n| Boot | Gang | ${GR.map((g) => g[0]).join(" | ")} |\n|${"---|".repeat(GR.length + 2)}\n`;
for (const b of boots) {
    for (const [gang, l] of [["steht", b.steht], ["geht-1", b.geht[0]], ["geht-2", b.geht[1]]])
        out += `| ${b.boot} | ${gang} | ${GR.map(([, f, fmt]) => (l ? fmt(f(l)) : "–")).join(" | ")} |\n`;
    out += `| ${b.boot} | Geher-Ende | ${b.geher.replace(/\s+/g, " ").slice(0, 80)} |${" |".repeat(GR.length - 1)}\n`;
}
const urteile = [];
out += `\n## Mittel je Seite (A dafe6c65 · B be5efc5f; gehend = Mittel aus geht-1 und geht-2 je Boot)\n\n| Gang | Größe | A | B | Δ B − A | 2σ | Urteil |\n|---|---|---|---|---|---|---|\n`;
for (const gang of ["steht", "geht"]) {
    for (const [titel, f, fmt, r] of GR) {
        const wert = (b) => (gang === "steht" ? (b.steht ? f(b.steht) : NaN) : mittel(b.geht.map((l) => (l ? f(l) : NaN))));
        const w = (s) => boots.filter((b) => b.seite === s).map(wert);
        const ma = mittel(w("A")),
            mb = mittel(w("B"));
        const abw = [];
        for (const S of ["A", "B"]) {
            const v = w(S).filter(Number.isFinite);
            const m = mittel(v);
            for (const x of v) abw.push(x - m);
        }
        const sig = abw.length > 2 ? Math.sqrt(abw.reduce((a, b) => a + b * b, 0) / (abw.length - 2)) : NaN;
        const d = mb - ma;
        const schlechter = r > 0 ? d : -d;
        const u = Number.isFinite(d) && Number.isFinite(sig) ? (schlechter <= 2 * sig ? "nicht langsamer" : "LANGSAMER") : "–";
        urteile.push({ gang, titel, ma, mb, d, sig, u });
        out += `| ${gang} | ${titel} | ${fmt(ma)} (${w("A").map(fmt).join(" · ")}) | ${fmt(mb)} (${w("B").map(fmt).join(" · ")}) | ${Number.isFinite(d) ? (d > 0 ? "+" : "") + fmt(d) : "–"} | ${fmt(2 * sig)} | ${u} |\n`;
    }
}
fs.writeFileSync(path.join(D, `auswertung-gehen-${K}.md`), out);
fs.writeFileSync(path.join(D, `auswertung-gehen-${K}.json`), JSON.stringify({ boots: boots.map((b) => b.boot), urteile }, null, 1));
console.log(out);
