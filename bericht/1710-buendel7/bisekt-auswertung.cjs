// bisekt-auswertung.cjs — Bündel 7 Bisektion (Wiese Ego): je Seite S0…S4 das Mittel über ihre Welten (Werte je Welt), dazu je Schritt
// S(k) → S(k+1) Δ und 2σ (gepoolt aus den Abweichungen beider Seiten).  node bisekt-auswertung.cjs [dir]
"use strict";
const fs = require("fs");
const path = require("path");
const DIR = process.argv[2] || path.join(__dirname, "bisekt");
const NAME = ["93539122 (A)", "0f86daaf (+B3c)", "404d97dd (+D3c-leben, A3b)", "f1e96de5 (+48c668ef, A9)", "e47ad9f8 (B)"];
const mittel = (a) => {
    const b = a.filter(Number.isFinite);
    return b.length ? b.reduce((x, y) => x + y, 0) / b.length : NaN;
};
const seiten = [[], [], [], [], []];
for (const n of fs.readdirSync(DIR).filter((x) => /^S\d-\d+\.json$/.test(x)).sort()) {
    const j = JSON.parse(fs.readFileSync(path.join(DIR, n), "utf8"));
    const p = (j.lauf && j.lauf.passe) || {};
    const pass = (k) => (p[k] ? p[k].p50 : NaN);
    seiten[Number(n[1])].push({
        welt: n.replace(".json", ""),
        fps: j.lauf && j.lauf.fps,
        durchsatz: j.lauf && j.lauf.durchsatz,
        cpuP95: j.lauf && j.lauf.cpuP95,
        traa: pass("TRAA"),
        k0: pass("k0"),
        haupt: pass("haupt"),
        post: pass("post"),
        summe: Object.values(p).reduce((s, v) => s + (v && Number.isFinite(v.p50) && v.frames > 100 ? v.p50 : 0), 0),
        bank: mittel((j.bank || []).map((b) => b.gpu)),
    });
}
const K = [
    ["fps (lauf voll)", "fps", 1],
    ["GPU-Durchsatz p50 ms", "durchsatz", 2],
    ["Pass TRAA p50 ms", "traa", 2],
    ["Pass k0 p50 ms", "k0", 2],
    ["Pass haupt p50 ms", "haupt", 2],
    ["Pass post p50 ms", "post", 2],
    ["Summe der Pässe je Bild p50 ms", "summe", 2],
    ["CPU-Takt p95 ms", "cpuP95", 1],
    ["gpu-bank ms (eigenes Instrument)", "bank", 2],
];
const da = [0, 1, 2, 3, 4].filter((i) => seiten[i].length);
let out = `## Je Seite (Mittel, Werte je Welt)

| Größe | ${da.map((i) => `S${i} ${NAME[i]}`).join(" | ")} |
|---|${"---|".repeat(da.length)}
`;
const f = (v, d) => (Number.isFinite(v) ? v.toFixed(d) : "–");
for (const [t, k, d] of K) out += `| ${t} | ${da.map((i) => seiten[i]).map((s) => `${f(mittel(s.map((z) => z[k])), d)} (${s.map((z) => f(z[k], d)).join(" · ")})`).join(" | ")} |
`;
const paare = da.slice(1).map((i, j) => [da[j], i]).concat(da.length > 2 ? [[da[0], da[da.length - 1]]] : []);
out += `
## Je Schritt (Δ, 2σ gepoolt)

| Größe | ${paare.map(([x, y]) => `S${x}→S${y}`).join(" | ")} |
|---|${"---|".repeat(paare.length)}
`;
const schritt = (a, b, k) => {
    const x = a.map((z) => z[k]).filter(Number.isFinite),
        y = b.map((z) => z[k]).filter(Number.isFinite);
    const mx = mittel(x),
        my = mittel(y);
    const abw = [...x.map((v) => v - mx), ...y.map((v) => v - my)];
    const s = abw.length > 2 ? Math.sqrt(abw.reduce((p, q) => p + q * q, 0) / (abw.length - 2)) : NaN;
    return { d: my - mx, s2: 2 * s };
};
for (const [t, k, d] of K) {
    const z = paare.map(([x, y]) => schritt(seiten[x], seiten[y], k));
    out += `| ${t} | ${z.map((e) => `${e.d >= 0 ? "+" : ""}${f(e.d, d)} (2σ ${f(e.s2, d)})${Math.abs(e.d) > e.s2 ? " **" : ""}`).join(" | ")} |
`;
}

out += "\n** = |Δ| über 2σ.\n";
fs.writeFileSync(path.join(DIR, "auswertung-bisekt.md"), out);
console.log(out);
