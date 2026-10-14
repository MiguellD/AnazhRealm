// Auswertung Schluss-ABAB 14.10.: A = main 9fb869a5 · B = integ-probe 51cc19af.  node auswertung.cjs <dir> <w-ego|w-third|g-ego|g-third>
// je Boot: Lauf voll (fps, Frame p50/p95, CPU-Takt p95), Lauf frei (CPU p95), gpu-bank (je Gier, mit Takt), Band (GPU je Frame,
// Befehle, Dreiecke, VRAM); je Größe das Mittel je Seite mit den Werten je Boot, Δ B − A und 2σ (σ aus den Abweichungen vom
// Mittel je Seite, gepoolt): „nicht langsamer", wenn Δ ≤ 2σ.
"use strict";
const fs = require("fs");
const path = require("path");
const DIR = process.argv[2] || __dirname;
const KOMBI = process.argv[3] || "w-ego";
const mittel = (a) => {
    const b = a.filter(Number.isFinite);
    return b.length ? b.reduce((x, y) => x + y, 0) / b.length : NaN;
};
const f2 = (v) => (Number.isFinite(v) ? v.toFixed(2) : "–");
const f1 = (v) => (Number.isFinite(v) ? v.toFixed(1) : "–");
const fi = (v) => (Number.isFinite(v) ? String(Math.round(v)) : "–");
const muster = new RegExp("^" + KOMBI + "-([AB])[0-9]+\\.json$");
const zeilen = [];
for (const n of fs.readdirSync(DIR).filter((x) => muster.test(x))) {
    const j = JSON.parse(fs.readFileSync(path.join(DIR, n), "utf8"));
    const lv = (j.kurz && j.kurz.laufVoll) || {};
    const lf = (j.kurz && j.kurz.laufFrei) || {};
    const gb = Object.entries((j.kurz && j.kurz.gpuBank) || {});
    const st = (j.schritte || []).find((s) => s.name === "band");
    const m = (st && st.ergebnis && st.ergebnis.messung) || {};
    const g = (m.groessen || []).find((x) => x.name === "GPU ms/Frame");
    const z = {
        boot: n.replace(".json", ""),
        seite: muster.exec(n)[1],
        start: j.start,
        urteil: j.urteil,
        fps: lv.fps,
        frameP50: lv.frameMs ? lv.frameMs.p50 : NaN,
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
    ["fps (Regler voll)", "fps", f1, -1],
    ["Frame p50 ms", "frameP50", f1, 1],
    ["Frame p95 ms", "frameP95", f1, 1],
    ["CPU-Takt p95 voll ms", "cpuP95", f1, 1],
    ["CPU-Takt p95 frei ms", "cpuP95frei", f1, 1],
    ["gpu-bank ms (Gier " + (zeilen[0] ? zeilen[0].gier0 : "?") + ")", "bank0", f2, 1],
    ["Takt MHz (Bank 1)", "takt0", f1, 0],
    ["gpu-bank ms (Gier " + (zeilen[0] && zeilen[0].gier1 ? zeilen[0].gier1 : "–") + ")", "bank1", f2, 1],
    ["Band GPU ms je Frame", "band", f2, 1],
    ["Befehle (Band)", "befehle", fi, 0],
    ["Dreiecke (Band)", "dreiecke", fi, 0],
    ["VRAM MB", "vram", f1, 0],
];
let out = `## ${KOMBI} — je Boot (Zeitfolge)\n\n| Boot | Urteil | ${K.map((k) => k[0]).join(" | ")} |\n|${"---|".repeat(K.length + 2)}\n`;
for (const z of zeilen) out += `| ${z.boot} | ${z.urteil} | ${K.map(([, k, fmt]) => fmt(z[k])).join(" | ")} |\n`;
out += `\n## Mittel je Seite (Werte je Boot)\n\n| Größe | A main 9fb869a5 | B integ-probe 51cc19af | Δ B − A | 2σ | Urteil |\n|---|---|---|---|---|---|\n`;
const urteile = [];
for (const [titel, k, fmt, richtung] of K) {
    const w = (s) => zeilen.filter((z) => z.seite === s).map((z) => z[k]);
    const ma = mittel(w("A")),
        mb = mittel(w("B"));
    if (!Number.isFinite(ma) && !Number.isFinite(mb)) continue;
    const d = mb - ma;
    const abw = [];
    for (const S of ["A", "B"]) {
        const v = w(S).filter(Number.isFinite);
        const m = mittel(v);
        for (const x of v) abw.push(x - m);
    }
    const sig = abw.length > 2 ? Math.sqrt(abw.reduce((a, b) => a + b * b, 0) / (abw.length - 2)) : NaN;
    let u = "–";
    if (richtung !== 0 && Number.isFinite(d) && Number.isFinite(sig)) {
        const schlechter = richtung > 0 ? d : -d;
        u = schlechter <= 2 * sig ? "nicht langsamer" : "LANGSAMER";
        urteile.push({ titel, u, d, sig });
    }
    out += `| ${titel} | ${fmt(ma)} (${w("A").map(fmt).join(" · ")}) | ${fmt(mb)} (${w("B").map(fmt).join(" · ")}) | ${Number.isFinite(d) ? (d > 0 ? "+" : "") + fmt(d) : "–"} | ${fmt(2 * sig)} | ${u} |\n`;
}
fs.writeFileSync(path.join(DIR, `auswertung-${KOMBI}.md`), out);
fs.writeFileSync(path.join(DIR, `auswertung-${KOMBI}.json`), JSON.stringify({ zeilen, urteile }, null, 1));
console.log(out);
