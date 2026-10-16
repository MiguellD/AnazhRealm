// auswertung.cjs — G4a v2: je Kombi A (1185091c) gegen B (cee33f91), je 2 Boots; CPU-Takt aus `lauf` (30 s voll, nach --ruhe) und
// aus `takt 300`, Tiere aus window.__tierZahl. Ausgabe: Tafel (Markdown) auf stdout.
"use strict";
const fs = require("fs");
const path = require("path");
const H = __dirname;
const lies = (f) => {
    try {
        const t = fs.readFileSync(f, "utf8");
        const j = JSON.parse(t.slice(t.indexOf("{")));
        return j.ergebnis || j;
    } catch (_e) {
        return null;
    }
};
const mittel = (a) => (a.length ? a.reduce((x, y) => x + y, 0) / a.length : NaN);
const zeilen = [];
const boots = [];
for (const K of ["g-ego", "w-ego"]) {
    const je = { A: [], B: [] };
    for (const N of ["A1", "B1", "A2", "B2"]) {
        const d = path.join(H, `${K}-${N}`);
        const L = lies(path.join(d, "lauf.txt")) || {};
        const T = lies(path.join(d, "takt.txt")) || {};
        const V = lies(path.join(d, "tiere-vor.txt")) || {};
        const e = {
            boot: `${K}-${N}`,
            fps: L.fps,
            frameP95: L.frameMs && L.frameMs.p95,
            cpuP50: L.cpuTaktMs && L.cpuTaktMs.p50,
            cpuP95: L.cpuTaktMs && L.cpuTaktMs.p95,
            cpuP99: L.cpuTaktMs && L.cpuTaktMs.p99,
            taktP95: T.p95,
            taktMax: T.max,
            tiere: V.gesamt,
            sicht: V.sicht,
            arten: V.arten,
            ruhig: L.ruhe ? JSON.stringify(L.ruhe).slice(0, 80) : "",
        };
        je[N[0]].push(e);
        boots.push(e);
    }
    const g = [
        ["CPU-Takt p95 (lauf)", "cpuP95"],
        ["CPU-Takt p50 (lauf)", "cpuP50"],
        ["CPU-Takt p99 (lauf)", "cpuP99"],
        ["Takt p95 (takt 300)", "taktP95"],
        ["Frame p95", "frameP95"],
        ["fps", "fps"],
        ["Tiere gesamt", "tiere"],
    ];
    for (const [n, k] of g) {
        const a = je.A.map((e) => e[k]).filter(Number.isFinite);
        const b = je.B.map((e) => e[k]).filter(Number.isFinite);
        const ma = mittel(a), mb = mittel(b);
        const abw = [...a.map((x) => x - ma), ...b.map((x) => x - mb)];
        const s = abw.length > 2 ? Math.sqrt(abw.reduce((x, y) => x + y * y, 0) / (abw.length - 2)) : NaN;
        zeilen.push(`| ${K} | ${n} | ${a.join(" / ")} | ${b.join(" / ")} | ${ma.toFixed(2)} → ${mb.toFixed(2)} | ${(mb - ma >= 0 ? "+" : "") + (mb - ma).toFixed(2)} | ${(2 * s * Math.sqrt(0.5 + 0.5)).toFixed(2)} |`);
    }
}
console.log("| Kombi | Größe | A1 / A2 | B1 / B2 | Mittel A → B | Δ | 2σ(Δ) |\n|---|---|---|---|---|---|---|");
console.log(zeilen.join("\n"));
console.log("\n| Boot | fps | Frame p95 | CPU p50/p95/p99 | takt p95/max | Tiere (Sicht) | Arten |\n|---|---|---|---|---|---|---|");
for (const e of boots)
    console.log(`| ${e.boot} | ${e.fps} | ${e.frameP95} | ${e.cpuP50}/${e.cpuP95}/${e.cpuP99} | ${e.taktP95}/${e.taktMax} | ${e.tiere} (${e.sicht}) | ${JSON.stringify(e.arten || {}).replace(/"/g, "")} |`);
