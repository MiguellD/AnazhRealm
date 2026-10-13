// Auswertung 1310-1 (1b): Genesis-Boots, vier Seiten (M main bb554abf · T torwurf · Z ohne Zwilling · G Fernform gesetz),
// je Boot: Lauf voll (fps, Frame p95, CPU-Takt p95, GPU-Durchsatz p50, Takt), gpu-bank an der Gier des Orts (mit Takt und
// Drossel), Band (GPU je Frame, Befehle, Dreiecke, bau haupt/k0/k1, VRAM). Mediane, Spanne je Seite, Δ gegen M und gegen T.
"use strict";
const fs = require("fs");
const path = require("path");
const DIR = process.argv[2] || __dirname;
const SEITEN = { M: "main bb554abf", T: "torwurf", Z: "ohne Zwilling", G: "Fernform gesetz" };
const med = (a) => {
    const b = a.filter(Number.isFinite).sort((x, y) => x - y);
    if (!b.length) return NaN;
    const m = b.length >> 1;
    return b.length % 2 ? b[m] : (b[m - 1] + b[m]) / 2;
};
const f2 = (v) => (Number.isFinite(v) ? v.toFixed(2) : "–");
const f1 = (v) => (Number.isFinite(v) ? v.toFixed(1) : "–");
const boots = fs.readdirSync(DIR).filter((n) => /^[MTZG]\d+\.json$/.test(n));
const zeilen = [];
for (const n of boots) {
    const j = JSON.parse(fs.readFileSync(path.join(DIR, n), "utf8"));
    const lv = (j.kurz && j.kurz.laufVoll) || {};
    const lf = (j.kurz && j.kurz.laufFrei) || {};
    const gb = Object.values((j.kurz && j.kurz.gpuBank) || {})[0] || {};
    const st = (j.schritte || []).find((s) => s.name === "band");
    const m = (st && st.ergebnis && st.ergebnis.messung) || {};
    const bau = (m.klassen || []).find((k) => k.id === "bau");
    const g = (m.groessen || []).find((x) => x.name === "GPU ms/Frame");
    zeilen.push({
        boot: n.replace(".json", ""),
        seite: n[0],
        start: j.start,
        urteil: j.urteil,
        fps: lv.fps,
        frameP95: lv.frameMs ? lv.frameMs.p95 : NaN,
        cpuP95: lv.cpuTaktMs ? lv.cpuTaktMs.p95 : NaN,
        gpuDurchsatz: lv.gpuDurchsatzMs ? lv.gpuDurchsatzMs.p50 : NaN,
        laufTakt: lv.takt ? lv.takt.mhz : NaN,
        cpuP95frei: lf.cpuTaktMs ? lf.cpuTaktMs.p95 : NaN,
        bank: gb.gpuJeFrameMs,
        bankTakt: gb.takt ? gb.takt.mhz : NaN,
        bankDrossel: gb.takt ? Object.keys(gb.takt.drossel || {}).join("/") : "",
        bankTemp: gb.takt ? gb.takt.temp : NaN,
        band: g ? g.ist : NaN,
        befehle: m.summe ? m.summe.befehle : NaN,
        dreiecke: m.summe ? m.summe.dreiecke : NaN,
        bauJe: bau && bau.je ? ["haupt", "k0", "k1"].map((p) => (bau.je[p] ? bau.je[p].befehle : 0)).join("/") : "–",
        bauK0Dreiecke: bau && bau.je && bau.je.k0 ? bau.je.k0.dreiecke : NaN,
        vram: m.vram ? m.vram.mb : NaN,
        tiere: lv.tiere ? lv.tiere.gesamt : null,
    });
}
zeilen.sort((a, b) => String(a.start).localeCompare(String(b.start)));
let out =
    "## Je Boot (Zeitfolge)\n\n| Boot | Urteil | fps voll | Frame p95 | CPU p95 voll/frei | GPU-Durchsatz p50 | Lauf-Takt MHz | Bank ms | Bank-Takt MHz (Drossel, °C) | Band GPU ms | Befehle | Dreiecke | bau haupt/k0/k1 | bau k0 Dreiecke | VRAM MB |\n|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|\n";
for (const z of zeilen)
    out += `| ${z.boot} | ${z.urteil} | ${f1(z.fps)} | ${f1(z.frameP95)} | ${f1(z.cpuP95)}/${f1(z.cpuP95frei)} | ${f1(z.gpuDurchsatz)} | ${f1(z.laufTakt)} | ${f2(z.bank)} | ${f1(z.bankTakt)} (${z.bankDrossel}, ${z.bankTemp}) | ${f2(z.band)} | ${z.befehle} | ${z.dreiecke} | ${z.bauJe} | ${z.bauK0Dreiecke} | ${f1(z.vram)} |\n`;
const K = [
    ["fps (Regler voll)", "fps", f1],
    ["Frame p95 ms", "frameP95", f1],
    ["CPU-Takt p95 voll ms", "cpuP95", f1],
    ["GPU-Durchsatz p50 ms (Lauf)", "gpuDurchsatz", f1],
    ["gpu-bank ms (Gier des Orts)", "bank", f2],
    ["Bank-Takt MHz", "bankTakt", f1],
    ["Band GPU ms je Frame", "band", f2],
    ["Befehle (Band)", "befehle", (v) => String(Math.round(v))],
    ["Dreiecke (Band)", "dreiecke", (v) => String(Math.round(v))],
    ["bau k0 Dreiecke", "bauK0Dreiecke", (v) => String(Math.round(v))],
    ["VRAM MB", "vram", f1],
];
const S = Object.keys(SEITEN).filter((s) => zeilen.some((z) => z.seite === s));
out += `\n## Median je Seite (Werte je Boot in Klammern)\n\n| Größe | ${S.map((s) => `${s} = ${SEITEN[s]}`).join(" | ")} | ${S.filter((s) => s !== "M").map((s) => `Δ ${s}−M`).join(" | ")} | ${S.filter((s) => s !== "M" && s !== "T").map((s) => `Δ ${s}−T`).join(" | ")} |\n|${"---|".repeat(1 + S.length + (S.length - 1) + Math.max(0, S.length - 2))}\n`;
const medi = {};
for (const s of S) {
    medi[s] = {};
    for (const [, k] of K) medi[s][k] = med(zeilen.filter((z) => z.seite === s).map((z) => z[k]));
}
for (const [titel, k, fmt] of K) {
    const zelle = (s) => {
        const w = zeilen.filter((z) => z.seite === s).map((z) => z[k]);
        return `${fmt(medi[s][k])} (${w.map((x) => (Number.isFinite(x) ? fmt(x) : "–")).join(" · ")})`;
    };
    const d = (a, b) => {
        const v = medi[a][k] - medi[b][k];
        return Number.isFinite(v) ? (v > 0 ? "+" : "") + fmt(v) : "–";
    };
    out += `| ${titel} | ${S.map(zelle).join(" | ")} | ${S.filter((s) => s !== "M").map((s) => d(s, "M")).join(" | ")} | ${S.filter((s) => s !== "M" && s !== "T").map((s) => d(s, "T")).join(" | ")} |\n`;
}
fs.writeFileSync(path.join(DIR, "auswertung.md"), out);
fs.writeFileSync(path.join(DIR, "auswertung.json"), JSON.stringify({ zeilen, mediane: medi, seiten: SEITEN }, null, 1));
console.log(out);
