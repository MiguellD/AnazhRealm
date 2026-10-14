// Auswertung 1310-14: A = main 6898706f · B = integ-probe 9fb869a5 (der Stamm in 48 Zonen). node auswertung.cjs <dir> <g|w>
// je Boot: Lauf voll (fps, Frame p95, CPU-Takt p95), Lauf frei (CPU p95), gpu-bank (je Gier, mit Takt), Band (GPU je Frame,
// Befehle, Dreiecke, VRAM); Median je Seite mit den Werten je Boot, Δ B − A.
"use strict";
const fs = require("fs");
const path = require("path");
const DIR = process.argv[2] || __dirname;
const ORT = process.argv[3] || "g";
const med = (a) => {
    const b = a.filter(Number.isFinite).sort((x, y) => x - y);
    if (!b.length) return NaN;
    const m = b.length >> 1;
    return b.length % 2 ? b[m] : (b[m - 1] + b[m]) / 2;
};
const f2 = (v) => (Number.isFinite(v) ? v.toFixed(2) : "–");
const f1 = (v) => (Number.isFinite(v) ? v.toFixed(1) : "–");
const fi = (v) => (Number.isFinite(v) ? String(Math.round(v)) : "–");
const zeilen = [];
for (const n of fs.readdirSync(DIR).filter((x) => new RegExp("^" + ORT + "[AB][0-9]+\\.json$").test(x))) {
    const j = JSON.parse(fs.readFileSync(path.join(DIR, n), "utf8"));
    const lv = (j.kurz && j.kurz.laufVoll) || {};
    const lf = (j.kurz && j.kurz.laufFrei) || {};
    const gb = Object.entries((j.kurz && j.kurz.gpuBank) || {});
    const st = (j.schritte || []).find((s) => s.name === "band");
    const m = (st && st.ergebnis && st.ergebnis.messung) || {};
    const g = (m.groessen || []).find((x) => x.name === "GPU ms/Frame");
    const z = {
        boot: n.replace(".json", ""),
        seite: n[1],
        start: j.start,
        urteil: j.urteil,
        fps: lv.fps,
        frameP95: lv.frameMs ? lv.frameMs.p95 : NaN,
        cpuP95: lv.cpuTaktMs ? lv.cpuTaktMs.p95 : NaN,
        cpuP95frei: lf.cpuTaktMs ? lf.cpuTaktMs.p95 : NaN,
        band: g ? g.ist : NaN,
        befehle: m.summe ? m.summe.befehle : NaN,
        dreiecke: m.summe ? m.summe.dreiecke : NaN,
        vram: m.vram ? m.vram.mb : NaN,
    };
    gb.forEach(([gier, b], i) => {
        z["bank" + i] = b && b.gpuJeFrameMs;
        z["takt" + i] = b && b.takt ? b.takt.mhz : NaN;
        z["gier" + i] = (+gier).toFixed(2);
    });
    zeilen.push(z);
}
zeilen.sort((a, b) => String(a.start).localeCompare(String(b.start)));
const K = [
    ["fps (Regler voll)", "fps", f1],
    ["Frame p95 ms", "frameP95", f1],
    ["CPU-Takt p95 voll ms", "cpuP95", f1],
    ["CPU-Takt p95 frei ms", "cpuP95frei", f1],
    ["gpu-bank ms (Gier " + (zeilen[0] ? zeilen[0].gier0 : "?") + ")", "bank0", f2],
    ["Takt MHz (Bank 1)", "takt0", f1],
    ["gpu-bank ms (Gier " + (zeilen[0] && zeilen[0].gier1 ? zeilen[0].gier1 : "–") + ")", "bank1", f2],
    ["Band GPU ms je Frame", "band", f2],
    ["Befehle (Band)", "befehle", fi],
    ["Dreiecke (Band)", "dreiecke", fi],
    ["VRAM MB", "vram", f1],
];
let out = `## ${ORT === "g" ? "Genesis" : "Wiese"} — je Boot (Zeitfolge)\n\n| Boot | Urteil | ${K.map((k) => k[0]).join(" | ")} |\n|${"---|".repeat(K.length + 2)}\n`;
for (const z of zeilen) out += `| ${z.boot} | ${z.urteil} | ${K.map(([, k, fmt]) => fmt(z[k])).join(" | ")} |\n`;
out += `\n## Median je Seite (Werte je Boot)\n\n| Größe | A main 6898706f | B Zonen 9fb869a5 | Δ B − A |\n|---|---|---|---|\n`;
for (const [titel, k, fmt] of K) {
    const w = (s) => zeilen.filter((z) => z.seite === s).map((z) => z[k]);
    const ma = med(w("A")),
        mb = med(w("B"));
    if (!Number.isFinite(ma) && !Number.isFinite(mb)) continue;
    const d = mb - ma;
    out += `| ${titel} | ${fmt(ma)} (${w("A").map(fmt).join(" · ")}) | ${fmt(mb)} (${w("B").map(fmt).join(" · ")}) | ${Number.isFinite(d) ? (d > 0 ? "+" : "") + fmt(d) : "–"} |\n`;
}
fs.writeFileSync(path.join(DIR, `auswertung-${ORT}.md`), out);
fs.writeFileSync(path.join(DIR, `auswertung-${ORT}.json`), JSON.stringify({ zeilen }, null, 1));
console.log(out);
