// 1910 S6-Takt: die Takte der Frame-Zerleger je Seite gepoolt — Quantile der CPU, des Render-Teils (renderOben) und des Rests
// (cpu − renderOben), dazu je Welt das Mittel; welche Hälfte trägt den Versatz im p50/p95?
const fs = require("fs");
const path = require("path");
const D = process.argv[2];
const q = (a, p) => a[Math.min(a.length - 1, Math.floor(p * a.length))];
const out = {};
for (const s of ["A", "B"]) {
    const cpu = [], ren = [], rest = [], uc = [], sch = [];
    const jeWelt = [];
    for (const n of fs.readdirSync(path.join(D, "welt")).filter((x) => x[0] === s).sort()) {
        const t = fs.readFileSync(path.join(D, "welt", n, "fz.json"), "utf8");
        const j = JSON.parse(t.slice(t.indexOf("{"))).ergebnis;
        const k = j.kopf.split(",");
        const iC = 0, iG = 1, iR = k.indexOf("renderOben"), iU = k.indexOf("updateCreatures"), iS = k.indexOf("schatten");
        let m = [0, 0, 0], c = 0;
        for (const z of j.zeilen.split("\n")) {
            const r = z.split(",").map(Number);
            if (r[iG] !== 1) continue;
            cpu.push(r[iC]); ren.push(r[iR]); rest.push(r[iC] - r[iR]); uc.push(r[iU]); sch.push(r[iS]);
            m[0] += r[iC]; m[1] += r[iR]; m[2] += r[iC] - r[iR]; c++;
        }
        jeWelt.push(n + " cpu " + (m[0] / c).toFixed(3) + " render " + (m[1] / c).toFixed(3) + " rest " + (m[2] / c).toFixed(3));
    }
    const so = (a) => a.slice().sort((x, y) => x - y);
    const Q = (a) => { const b = so(a); return [0.5, 0.75, 0.9, 0.95, 0.99].map((p) => q(b, p).toFixed(2)).join(" / ") + "  Ø " + (a.reduce((x, y) => x + y, 0) / a.length).toFixed(3); };
    out[s] = { n: cpu.length, cpu: Q(cpu), render: Q(ren), rest: Q(rest), updateCreatures: Q(uc), schatten: Q(sch), jeWelt };
}
console.log("Quantile p50 / p75 / p90 / p95 / p99  Ø  (gerenderte Takte, gepoolt)");
for (const s of ["A", "B"]) {
    console.log(s, "n", out[s].n);
    for (const f of ["cpu", "render", "rest", "updateCreatures", "schatten"]) console.log("  " + f.padEnd(16), out[s][f]);
    for (const w of out[s].jeWelt) console.log("   ", w);
}
