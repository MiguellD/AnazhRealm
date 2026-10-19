// 1910 S6-Takt RUNDE 3: drei Arme je Welt unter welt3/<A|B|X><n>/ (lauf.json · profil.json · tacho.json).
//   A = n1910-s6a (ohne S6) · B = n1910-s6b (S6) · X = n1910-s6b mit dem Verband von Anfang an AUS (x-aus.js)
// Je Arm: CPU-Takt p50/p95/p99 (lauf, sauber), Profil-Gesamtzeit der Haupt-Äste (ms je Frame), Drehzahlmesser (feste Last ms).
//   node auswertung3.cjs <s6takt-ordner>  → auswertung3.md
"use strict";
const fs = require("fs");
const path = require("path");
const D = process.argv[2];
const lies = (f) => {
    try {
        const t = fs.readFileSync(f, "utf8");
        return JSON.parse(t.slice(t.indexOf("{")));
    } catch (_e) {
        return null;
    }
};
const ASTE = ["loop dirigent-takt.js", "_loopRender dirigent-takt.js", "zeichne bild-kosten.js", "AnazhRealm._diaetRefresh bild-kosten.js",
    "renderer._renderBundles bild-kosten.js", "updateCreatures kreatur-verhalten.js", "_loopCamera koerper-bewegung.js",
    "_loopFixedStep dirigent-takt.js", "_loopVoxelStreaming dirigent-takt.js", "(idle) ", "(program) ", "(garbage collector) "];
const karte = (p) => {
    const m = new Map();
    if (!p) return m;
    for (const feld of ["selbst", "gesamt"])
        for (const z of p[feld] || []) {
            const r = /^\s*([\d.]+) %\s+(\d+) ms\s+(.*)$/.exec(z);
            if (!r) continue;
            const k = r[3].replace(/:(\d+)$/, "");
            if (feld === "gesamt" || !m.has(k)) m.set(k, Number(r[2]) / (p.frames || 1));
        }
    return m;
};
const dir = path.join(D, "welt3");
const welten = fs.existsSync(dir) ? fs.readdirSync(dir).filter((n) => /^[ABX]\d+$/.test(n)).sort() : [];
const arm = { A: [], B: [], X: [] };
for (const n of welten) {
    const d = path.join(dir, n);
    const l = lies(path.join(d, "lauf.json"));
    const p = lies(path.join(d, "profil.json"));
    const t = lies(path.join(d, "tacho.json"));
    const z = lies(path.join(d, "zensus-0.json"));
    if (!l || !l.cpuTaktMs) continue;
    const k = karte(p);
    arm[n[0]].push({ n, cpu: l.cpuTaktMs, aste: ASTE.map((a) => (k.has(a) ? k.get(a) : NaN)), tacho: t && t.ergebnis ? t.ergebnis : null,
        verbaende: z && z.ergebnis ? z.ergebnis.verbaendeAb2 : null });
}
const mit = (a) => {
    const b = a.filter(Number.isFinite);
    return b.length ? b.reduce((x, y) => x + y, 0) / b.length : NaN;
};
const f = (v, n = 3) => (Number.isFinite(v) ? v.toFixed(n) : "–");
const L = ["# S6-Takt Runde 3: A · B · X (B-Code, Verband von Anfang an aus)", ""];
L.push("| Welt | CPU p50/p95/p99 | Verbände ≥2 | tacho Last ms | tacho-Lauf CPU Ø | " + ASTE.map((a) => a.split(" ")[0]).join(" | ") + " |");
L.push("|---|---|---|---|---|" + ASTE.map(() => "---").join("|") + "|");
for (const s of ["A", "B", "X"])
    for (const w of arm[s])
        L.push(`| ${w.n} | ${w.cpu.p50}/${w.cpu.p95}/${w.cpu.p99} | ${w.verbaende} | ${w.tacho ? f(w.tacho.tacho.mittel) : "–"} | ${w.tacho ? f(w.tacho.cpu.mittel) : "–"} | ${w.aste.map((x) => f(x)).join(" | ")} |`);
L.push("", "## Mittel je Arm", "");
L.push("| Arm | n | CPU p50 | p95 | p99 | tacho Last | " + ASTE.map((a) => a.split(" ")[0]).join(" | ") + " |");
L.push("|---|---|---|---|---|---|" + ASTE.map(() => "---").join("|") + "|");
for (const s of ["A", "B", "X"]) {
    const a = arm[s];
    L.push(`| ${s} | ${a.length} | ${f(mit(a.map((w) => w.cpu.p50)), 2)} | ${f(mit(a.map((w) => w.cpu.p95)), 2)} | ${f(mit(a.map((w) => w.cpu.p99)), 2)} | ${f(mit(a.map((w) => (w.tacho ? w.tacho.tacho.mittel : NaN))))} | ${ASTE.map((_, i) => f(mit(a.map((w) => w.aste[i])))).join(" | ")} |`);
}
fs.writeFileSync(path.join(D, "auswertung3.md"), L.join("\n") + "\n");
console.log(L.join("\n"));
