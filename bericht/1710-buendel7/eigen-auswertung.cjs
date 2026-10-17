// eigen-auswertung.cjs — Nachtrag Bündel 7: Wiese Ego, jede Seite mit ihrem Instrument (AA = 93539122 mit 93539122, BB = e47ad9f8 mit
// e47ad9f8), je Größe das Mittel je Seite mit den Werten je Welt, Δ BB − AA und 2σ (gepoolt).  node eigen-auswertung.cjs [dir]
"use strict";
const fs = require("fs");
const path = require("path");
const DIR = process.argv[2] || path.join(__dirname, "eigen");
const mittel = (a) => {
    const b = a.filter(Number.isFinite);
    return b.length ? b.reduce((x, y) => x + y, 0) / b.length : NaN;
};
const zeilen = { AA: [], BB: [] };
for (const n of fs.readdirSync(DIR).filter((x) => /^(AA|BB)\d+\.json$/.test(x)).sort()) {
    const j = JSON.parse(fs.readFileSync(path.join(DIR, n), "utf8"));
    const p = (j.lauf && j.lauf.passe) || {};
    zeilen[n.slice(0, 2)].push({
        welt: n.replace(".json", ""),
        bank: mittel((j.bank || []).map((b) => b.gpu)),
        fps: j.lauf && j.lauf.fps,
        durchsatz: j.lauf && j.lauf.durchsatz,
        cpuP95: j.lauf && j.lauf.cpuP95,
        traa: p.TRAA && p.TRAA.p50,
        k0: p.k0 && p.k0.p50,
        haupt: p.haupt && p.haupt.p50,
        post: p.post && p.post.p50,
        himmel: j.uhrenVor && j.uhrenVor.ergebnis ? j.uhrenVor.ergebnis.himmelHalt + "/" + j.uhrenVor.ergebnis.bildZeitHalt : "?",
    });
}
const K = [
    ["gpu-bank ms (Blick, Mittel 2 Bänke)", "bank", 2, 1],
    ["fps (lauf voll)", "fps", 1, -1],
    ["GPU-Durchsatz p50 ms", "durchsatz", 2, 1],
    ["CPU-Takt p95 ms", "cpuP95", 1, 1],
    ["Pass TRAA p50 ms", "traa", 2, 1],
    ["Pass k0 p50 ms", "k0", 2, 1],
    ["Pass haupt p50 ms", "haupt", 2, 1],
    ["Pass post p50 ms", "post", 2, 1],
];
let out = `| Größe | AA 93539122 (eigenes Instrument) | BB e47ad9f8 (eigenes Instrument) | Δ | 2σ | Urteil |\n|---|---|---|---|---|---|\n`;
for (const [t, k, d, r] of K) {
    const a = zeilen.AA.map((z) => z[k]),
        b = zeilen.BB.map((z) => z[k]);
    const ma = mittel(a),
        mb = mittel(b);
    const abw = [...a.map((x) => x - ma), ...b.map((x) => x - mb)].filter(Number.isFinite);
    const s = abw.length > 2 ? Math.sqrt(abw.reduce((x, y) => x + y * y, 0) / (abw.length - 2)) : NaN;
    const delta = mb - ma;
    const u = r === 0 ? "–" : (r > 0 ? delta : -delta) <= 2 * s ? "nicht langsamer" : "LANGSAMER";
    const f = (v) => (Number.isFinite(v) ? v.toFixed(d) : "–");
    out += `| ${t} | ${f(ma)} (${a.map(f).join(" · ")}) | ${f(mb)} (${b.map(f).join(" · ")}) | ${delta >= 0 ? "+" : ""}${f(delta)} | ${f(2 * s)} | ${u} |\n`;
}
out += `\nUhren an der Seite (Himmel / _bildZeit): AA ${zeilen.AA.map((z) => z.himmel).join(" · ")} | BB ${zeilen.BB.map((z) => z.himmel).join(" · ")}\n`;
fs.writeFileSync(path.join(DIR, "auswertung-eigen.md"), out);
console.log(out);
