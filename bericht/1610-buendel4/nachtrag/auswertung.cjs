// auswertung.cjs — Bisekt K2, Genesis Ego: D = d9d1db4e (main) · A = a2986b30 (W2+KI2) · B = ede774f1 (+K2), je 4 Boots, EIN
// Instrument. Je Größe das Mittel je Seite (Werte je Boot) und die Paare B − A (K2), A − D (W2+KI2), B − D mit 2σ (σ gepoolt aus den
// Abweichungen je Seite).   node auswertung.cjs [ordner]
"use strict";
const fs = require("fs");
const path = require("path");
const DIR = process.argv[2] || __dirname;
const mittel = (a) => (a.length ? a.reduce((x, y) => x + y, 0) / a.length : NaN);
const boots = [];
for (const n of fs.readdirSync(DIR).filter((x) => /^g-ego-[ABD][0-9]+\.json$/.test(x))) {
    const j = JSON.parse(fs.readFileSync(path.join(DIR, n), "utf8"));
    const lv = (j.schritte || []).find((s) => s.name === "lauf-voll");
    const e = (lv && lv.ergebnis) || {};
    const band = (j.schritte || []).find((s) => s.name === "band");
    const m = (band && band.ergebnis && band.ergebnis.messung) || {};
    const g = (m.groessen || []).find((x) => x.name === "GPU ms/Frame");
    const c = e.cpuTaktMs || {};
    const p = e.phasenEwmaMs || {};
    boots.push({
        boot: n.replace(".json", ""),
        seite: n.match(/-([ABD])\d/)[1],
        start: j.start,
        cpuP50: c.p50,
        cpuP95: c.p95,
        cpuP99: c.p99,
        render: p.render,
        creatures: p.creatures,
        streaming: p.streaming,
        physics: p.physics,
        fps: e.fps,
        band: g ? g.ist : NaN,
        befehle: m.summe ? m.summe.befehle : NaN,
    });
}
boots.sort((a, b) => String(a.start).localeCompare(String(b.start)));
const G = ["cpuP95", "cpuP50", "cpuP99", "render", "creatures", "streaming", "physics", "fps", "band", "befehle"];
console.log("| Boot | " + G.join(" | ") + " |\n|---|" + "---|".repeat(G.length));
for (const b of boots) console.log(`| ${b.boot} | ${G.map((k) => b[k]).join(" | ")} |`);
const w = (S, k) => boots.filter((b) => b.seite === S).map((b) => b[k]).filter(Number.isFinite);
const paar = (X, Y, k) => {
    const x = w(X, k), y = w(Y, k);
    const mx = mittel(x), my = mittel(y);
    const abw = [...x.map((v) => v - mx), ...y.map((v) => v - my)];
    const s = abw.length > 2 ? Math.sqrt(abw.reduce((a, v) => a + v * v, 0) / (abw.length - 2)) : NaN;
    return `${(my - mx >= 0 ? "+" : "") + (my - mx).toFixed(2)} (2σ ${(2 * s).toFixed(2)})`;
};
console.log("\n| Größe | D d9d1db4e | A a2986b30 | B ede774f1 | A − D (W2+KI2) | B − A (K2) | B − D |\n|---|---|---|---|---|---|---|");
for (const k of G) {
    const f = (S) => `${mittel(w(S, k)).toFixed(2)} (${w(S, k).join(" · ")})`;
    console.log(`| ${k} | ${f("D")} | ${f("A")} | ${f("B")} | ${paar("D", "A", k)} | ${paar("A", "B", k)} | ${paar("D", "B", k)} |`);
}
