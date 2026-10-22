// 2010 (1) B-Wald im Lauf — Auswertung je Zelle (Kopie von p3/n1910/f1/auswertung-gehen.cjs): A = n1910-f1b (main e93134f4) · B = n1910-integ
// (integ-probe 80258f0e = A + b-wald); je Boot EINE frische Sitzung: steht (E-Form lauf 30 --ein 20 --ruhe 300) und geht-1 (30 s, 4 m/s
// −z 0 → −60 m und zurück). Je Größe das Mittel je Seite mit den Werten je Boot, Δ B − A, 2σ (gepoolt), t (Welch) — „nicht langsamer",
// wenn Δ ≤ max(2σ, Auflösung). Dazu je Boot Takt und Drossel der GPU im Lauf (nvidia-smi, P0-Sekunden): Median-MHz, Anteil Drossel ≠ 0.
//   node auswertung-gehen.cjs <gehen-ordner> <g-third|w-ego>
"use strict";
const fs = require("fs");
const path = require("path");
const D = process.argv[2];
const K = process.argv[3] || "w-ego";
const lies = (f) => {
    try {
        const t = fs.readFileSync(f, "utf8");
        const j = JSON.parse(t.slice(t.indexOf("{"), t.lastIndexOf("}") + 1)); // der neue lauf hängt nach dem JSON eine Urteilszeile an
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
    ["k0 p50 ms", (l) => l.gpuJePassMs && l.gpuJePassMs.k0 && l.gpuJePassMs.k0.p50, f2, 1],
    ["GPU p95 ms (lauf)", (l) => l.gpuMs && l.gpuMs.p95, f2, 1],
    ["GPU je Bild ms (gpu-bank)", (l) => l.bank && l.bank.gpuJeFrameMs, f2, 1],
    ["Belegung p50 ms", (l) => l.belegung && l.belegung.belegungMs && l.belegung.belegungMs.p50, f2, 1],
    ["Belegung p95 ms", (l) => l.belegung && l.belegung.belegungMs && l.belegung.belegungMs.p95, f2, 1],
    ["außer Takt p95 ms", (l) => l.belegung && l.belegung.ausserTaktMs && l.belegung.ausserTaktMs.p95, f2, 1],
    ["Lebenszyklus p95 ms", (l) => l.belegung && l.belegung.jeKlasse && l.belegung.jeKlasse.lebenszyklus && l.belegung.jeKlasse.lebenszyklus.p95, f2, 1],
    ["über 33 ms %", (l) => l.ueber33, f2, 1],
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
            steht: Object.assign(mitKi(lies(path.join(D, `${b}-steht.txt`)), path.join(D, `${b}-kiuhr-steht.txt`)) || {}, { bank: lies(path.join(D, `${b}-bank.txt`)) }),
            geht: [1].map((r) => mitKi(lies(path.join(D, `${b}-geht-${r}.txt`)), path.join(D, `${b}-kiuhr-geht-${r}.txt`))),
            zensus: [0, 1].map((r) => lies(path.join(D, `${b}-zensus-${r}.txt`))),
            geher: (fs.existsSync(path.join(D, `${b}-geher-ende.txt`)) ? fs.readFileSync(path.join(D, `${b}-geher-ende.txt`), "utf8") : "").trim(),
        };
    })
    .sort((a, b) => a.boot.localeCompare(b.boot));
let out = `## ${K} — je Boot\n\n| Boot | Gang | ${GR.map((g) => g[0]).join(" | ")} |\n|${"---|".repeat(GR.length + 2)}\n`;
for (const b of boots) {
    for (const [gang, l] of [["steht", b.steht], ["geht-1", b.geht[0]]])
        out += `| ${b.boot} | ${gang} | ${GR.map(([, f, fmt]) => (l ? fmt(f(l)) : "–")).join(" | ")} |\n`;
    out += `| ${b.boot} | Geher-Ende | ${b.geher.replace(/\s+/g, " ").slice(0, 80)} |${" |".repeat(GR.length - 1)}\n`;
}
const zz = (z) => (z ? `${z.gesamt} (${Object.entries(z.arten || {}).map(([a, n]) => a + " " + n).join(", ")}; Würfe≥2 ${z.wuerfeAb2}: ${(z.gruppen || []).map((g) => g.wurf.split("@")[0] + " " + g.n + " Spanne " + g.spanneM + " m @" + g.spielerM + " m").join(" | ")}; Verband-Feld ${z.verbandFeld}, Verbände≥2 ${z.verbaendeAb2}: ${(z.verbaende || []).filter((v) => v.n >= 2).map((v) => Object.keys(v.art).join("+") + " " + v.n + " Spanne " + v.spanneM + " m").join(" | ")}; Zustand ${JSON.stringify(z.zustand)})` : "–");
const NL = String.fromCharCode(10);
out += NL + "## Tier-Zensus je Boot (zensus-0 nach umstellen · zensus-1 nach geht-1)" + NL + NL + boots.map((b) => "- " + b.boot + ": vorher " + zz(b.zensus[0]) + NL + "  nachher " + zz(b.zensus[1])).join(NL) + NL;
const takt = (b) => {
    try {
        const z = fs.readFileSync(path.join(D, b + "-smi.csv"), "utf8").trim().split(/\r?\n/).map((l) => l.split(",").map((x) => x.trim()));
        const p0 = z.filter((c) => c[5] === "P0");
        const mhz = p0.map((c) => parseFloat(c[1])).filter(Number.isFinite).sort((a, b) => a - b);
        const dr = p0.filter((c) => (parseInt(c[6] || "0", 16) & ~1) !== 0).length; // ohne Bit 0x1 (GpuIdle): Leistungsdeckel 0x4, HW/Thermik
        return { n: p0.length, mhz: mhz.length ? mhz[mhz.length >> 1] : NaN, drossel: p0.length ? dr / p0.length : NaN, grad: Math.max(...p0.map((c) => parseFloat(c[3])).filter(Number.isFinite)) };
    } catch (_e) { return null; }
};
out += NL + "## GPU-Takt je Boot (nvidia-smi 1 s, nur P0-Sekunden: Median-MHz · Anteil Drossel (Grund ≠ 0 ohne GpuIdle 0x1) · max °C)" + NL + NL + boots.map((b) => { const k = takt(b.boot); return "- " + b.boot + ": " + (k ? k.n + " s · " + k.mhz + " MHz · Drossel " + (100 * k.drossel).toFixed(0) + " % · " + k.grad + " °C" : "–"); }).join(NL) + NL;
const urteile = [];
out += `\n## Mittel je Seite (A 73f28224 main · B 1ef4042c zug; gehend = geht-1 je Boot)\n\n| Gang | Größe | A | B | Δ B − A | 2σ | t (Welch) | Urteil |\n|---|---|---|---|---|---|---|---|\n`;
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
const KERN = new Set(["fps", "Frame p95 ms", "CPU-Takt p95 ms", "GPU je Bild ms (gpu-bank)", "Belegung p95 ms"]); // die KI-Uhr ist Zusatz, kein Kern
const kernU = urteile.filter((x) => KERN.has(x.titel) && x.u !== "–"); // eine Größe ohne Wert (gpu-bank nur stehend) urteilt nicht
const langsam = kernU.filter((x) => x.u !== "nicht langsamer");
out += `
**KERN-URTEIL GEHEN ${K}** (steht + geht × fps · Frame p95 · CPU-Takt p95 · GPU je Bild (gpu-bank, nur steht) · Belegung p95; Δ ≤ max(2σ gepoolt, Auflösung)): ${langsam.length ? "LANGSAMER an " + langsam.map((x) => x.gang + " " + x.titel).join(", ") : "nicht langsamer"} (${kernU.length} Größen)
`;
fs.writeFileSync(path.join(D, `auswertung-gehen-${K}.md`), out);
fs.writeFileSync(path.join(D, `auswertung-gehen-${K}.json`), JSON.stringify({ boots: boots.map((b) => b.boot), urteile }, null, 1));
console.log(out);
