// 1910 F1 Auswertung GEHEN (Kopie von p3/n1810/s6/auswertung-gehen.cjs, Seiten umgestellt): A = n1910-f1a (main 47c8b089) · B = n1910-f1b (integ-probe e93134f4 = A + F1); je Boot (frische Werkbank-Sitzung, Regler voll, Sicht der Kombi) lauf stehend (25 s) und zweimal gehend (30 s,
// 4 m/s geradeaus −z 0 → −60 m und zurück): fps, Frame p50/p95/p99, CPU-Takt p50/p95, GPU-Durchsatz p50, Anteil > 33 ms; je Größe
// das Mittel je Seite mit den Werten je Boot, Δ B − A und 2σ (gepoolt) — „nicht langsamer", wenn Δ ≤ 2σ.
//   node auswertung-gehen.cjs <gehen-ordner> <w-ego|w-third|g-ego|g-third>
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
const mitKi = (l, f) => {
    if (l) l.ki = lies(f);
    return l;
};
const mittel = (a) => {
    const b = a.filter(Number.isFinite);
    return b.length ? b.reduce((x, y) => x + y, 0) / b.length : NaN;
};
const f1 = (v) => (Number.isFinite(v) ? v.toFixed(1) : "–");
const f2 = (v) => (Number.isFinite(v) ? v.toFixed(2) : "–");
const f3 = (v) => (Number.isFinite(v) ? v.toFixed(3) : "–");
const GR = [
    ["fps", (l) => l.fps, f1, -1],
    ["Frame p50 ms", (l) => l.frameMs && l.frameMs.p50, f1, 1],
    ["Frame p95 ms", (l) => l.frameMs && l.frameMs.p95, f1, 1],
    ["Frame p99 ms", (l) => l.frameMs && l.frameMs.p99, f1, 1],
    ["CPU-Takt p50 ms", (l) => l.cpuTaktMs && l.cpuTaktMs.p50, f2, 1],
    ["CPU-Takt p95 ms", (l) => l.cpuTaktMs && l.cpuTaktMs.p95, f1, 1],
    ["CPU-Takt p99 ms", (l) => l.cpuTaktMs && l.cpuTaktMs.p99, f1, 1],
    ["GPU-Durchsatz p50 ms", (l) => l.gpuDurchsatzMs && l.gpuDurchsatzMs.p50, f2, 1],
    // S6: der KI-Takt — die Uhr an updateCreatures (kreatur-uhr-an.js, je Aufruf) und die Sense-EWMA „creatures"
    ["KI-Uhr Mittel ms", (l) => l.ki && l.ki.mittel, f3, 1],
    ["KI-Uhr p95 ms", (l) => l.ki && l.ki.p95, f2, 1],
    ["KI-Uhr p99 ms", (l) => l.ki && l.ki.p99, f2, 1],
    ["KI-Takt EWMA ms", (l) => l.phasenEwmaMs && l.phasenEwmaMs.creatures, f2, 1],
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
            steht: mitKi(lies(path.join(D, `${b}-steht.txt`)), path.join(D, `${b}-kiuhr-steht.txt`)),
            geht: [1, 2].map((r) => mitKi(lies(path.join(D, `${b}-geht-${r}.txt`)), path.join(D, `${b}-kiuhr-geht-${r}.txt`))),
            zensus: [0, 1].map((r) => lies(path.join(D, `${b}-zensus-${r}.txt`))),
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
const zz = (z) => (z ? `${z.gesamt} (${Object.entries(z.arten || {}).map(([a, n]) => a + " " + n).join(", ")}; Würfe≥2 ${z.wuerfeAb2}: ${(z.gruppen || []).map((g) => g.wurf.split("@")[0] + " " + g.n + " Spanne " + g.spanneM + " m @" + g.spielerM + " m").join(" | ")}; Verband-Feld ${z.verbandFeld}, Verbände≥2 ${z.verbaendeAb2}: ${(z.verbaende || []).filter((v) => v.n >= 2).map((v) => Object.keys(v.art).join("+") + " " + v.n + " Spanne " + v.spanneM + " m").join(" | ")}; Zustand ${JSON.stringify(z.zustand)})` : "–");
const NL = String.fromCharCode(10);
out += NL + "## Tier-Zensus je Boot (zensus-0 nach umstellen · zensus-1 nach geht-2)" + NL + NL + boots.map((b) => "- " + b.boot + ": vorher " + zz(b.zensus[0]) + NL + "  nachher " + zz(b.zensus[1])).join(NL) + NL;
const urteile = [];
out += `\n## Mittel je Seite (A 47c8b089 main · B e93134f4 integ-probe + F1; gehend = Mittel aus geht-1 und geht-2 je Boot)\n\n| Gang | Größe | A | B | Δ B − A | 2σ | t (Welch) | Urteil |\n|---|---|---|---|---|---|---|---|\n`;
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
        const aufl = fmt === f3 ? 0.001 : fmt === f2 ? 0.01 : 0.1;
        const u = Number.isFinite(d) && Number.isFinite(sig) ? (schlechter <= Math.max(2 * sig, aufl) + 1e-9 ? "nicht langsamer" : "LANGSAMER") : "–";
        const s2 = (v) => {
            const q = v.filter(Number.isFinite);
            const mm = mittel(q);
            return q.reduce((a, x) => a + (x - mm) * (x - mm), 0) / Math.max(1, q.length - 1);
        };
        const nA = w("A").filter(Number.isFinite).length,
            nB = w("B").filter(Number.isFinite).length;
        const se = Math.sqrt(s2(w("A")) / Math.max(1, nA) + s2(w("B")) / Math.max(1, nB));
        const tw = se > 0 && Number.isFinite(d) ? d / se : NaN;
        urteile.push({ gang, titel, ma, mb, d, sig, u, t: tw });
        out += `| ${gang} | ${titel} | ${fmt(ma)} (${w("A").map(fmt).join(" · ")}) | ${fmt(mb)} (${w("B").map(fmt).join(" · ")}) | ${Number.isFinite(d) ? (d > 0 ? "+" : "") + fmt(d) : "–"} | ${fmt(2 * sig)} | ${Number.isFinite(tw) ? tw.toFixed(2) : "–"} | ${u} |\n`;
    }
}
const KERN = new Set(["Frame p95 ms", "CPU-Takt p95 ms", "GPU-Durchsatz p50 ms"]); // die KI-Uhr ist Zusatz, kein Kern
const kernU = urteile.filter((x) => KERN.has(x.titel));
const langsam = kernU.filter((x) => x.u !== "nicht langsamer");
out += `
**KERN-URTEIL GEHEN ${K}** (steht + geht × Frame p95 · CPU-Takt p95 · GPU-Durchsatz p50; Δ ≤ max(2σ gepoolt, Auflösung)): ${langsam.length ? "LANGSAMER an " + langsam.map((x) => x.gang + " " + x.titel).join(", ") : "nicht langsamer"} (${kernU.length} Größen)
`;
fs.writeFileSync(path.join(D, `auswertung-gehen-${K}.md`), out);
fs.writeFileSync(path.join(D, `auswertung-gehen-${K}.json`), JSON.stringify({ boots: boots.map((b) => b.boot), urteile }, null, 1));
console.log(out);
