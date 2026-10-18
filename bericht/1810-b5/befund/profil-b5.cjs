// 1810 B5 Finder: der Haupt-Faden bis zum Weltbild aus <roh>/<lauf>.cpuprofile (0,5 ms, B4-Instrument profil-patch.cjs).
// Selbstzeit je Funktion und INKLUSIVZEIT je Stamm-Methode (jede Funktion zählt je Probe einmal, gleich wie tief), dazu die
// Fenster [Navigation, Buch] und [Buch, Weltbild]; Median über die Läufe.   node profil-b5.cjs <roh> <lauf> [lauf …] [--top n]
"use strict";
const fs = require("fs");
const path = require("path");
const args = process.argv.slice(2);
const D = args[0];
const ti = args.indexOf("--top");
const TOP = ti > 0 ? Number(args[ti + 1]) : 40;
const laeufe = args.slice(1).filter((x, i, a) => x !== "--top" && a[i - 1] !== "--top");
const med = (a) => {
    const b = a.filter(Number.isFinite).sort((x, y) => x - y);
    return b.length ? (b.length % 2 ? b[(b.length - 1) / 2] : (b[b.length / 2 - 1] + b[b.length / 2]) / 2) : 0;
};
const je = [];
for (const N of laeufe) {
    const p = JSON.parse(fs.readFileSync(path.join(D, N + ".cpuprofile"), "utf8"));
    const j = JSON.parse(fs.readFileSync(path.join(D, N + ".json"), "utf8"));
    const WB = j.weltbildDa;
    const buch = j.buchDa || 0;
    const byId = new Map(p.nodes.map((x) => [x.id, x]));
    const vater = new Map();
    for (const n of p.nodes) for (const c of n.children || []) vater.set(c, n.id);
    const name = (n) => {
        const cf = n.callFrame;
        return `${cf.functionName || "(anonym)"} ${path.basename((cf.url || "").split("?")[0])}`.trim();
    };
    const selbst = new Map(),
        inkl = new Map(),
        inklB = new Map();
    // die Uhr des Profils: Profiler.start steht vor page.goto — die Seiten-Uhr (performance.now ab Navigation) ≈ t − startTime
    // (Fehler: die Zeit bis zum Navigationsbeginn, wenige zehn ms); gezählt wird bis zum Weltbild
    let t = p.startTime;
    let summe = 0,
        summeB = 0;
    for (let i = 0; i < p.samples.length; i++) {
        t += p.timeDeltas[i];
        const dt = (i + 1 < p.timeDeltas.length ? p.timeDeltas[i + 1] : 0) / 1000;
        const tSeite = (t - p.startTime) / 1000;
        if (tSeite > WB) continue;
        const nach = tSeite >= buch;
        let nd = byId.get(p.samples[i]);
        const k0 = name(nd);
        selbst.set(k0, (selbst.get(k0) || 0) + dt);
        summe += dt;
        if (nach) summeB += dt;
        const ges = new Set();
        while (nd) {
            const k = name(nd);
            if (!ges.has(k)) {
                ges.add(k);
                inkl.set(k, (inkl.get(k) || 0) + dt);
                if (nach) inklB.set(k, (inklB.get(k) || 0) + dt);
            }
            const v = vater.get(nd.id);
            nd = v != null ? byId.get(v) : null;
        }
    }
    je.push({ N, WB, buch, summe, summeB, selbst, inkl, inklB });
}
const alle = (feld) => {
    const s = new Set();
    for (const r of je) for (const k of r[feld].keys()) s.add(k);
    return [...s];
};
const mj = (feld, k) => med(je.map((r) => r[feld].get(k) || 0));
console.log(`Läufe ${je.map((r) => r.N).join(" ")} · Weltbild ${je.map((r) => (r.WB / 1000).toFixed(2)).join(" / ")} s`);
console.log(`Haupt-Faden bis Weltbild (Profil-Summe, Median): ${med(je.map((r) => r.summe)).toFixed(0)} ms · davon nach dem Buch ${med(je.map((r) => r.summeB)).toFixed(0)} ms`);
const idle = (r) => (r.selbst.get("(idle)") || 0) + (r.selbst.get("(program)") || 0);
console.log(`(idle)+(program): ${med(je.map(idle)).toFixed(0)} ms · (garbage collector) ${mj("selbst", "(garbage collector)").toFixed(0)} ms`);
console.log("\n| Selbstzeit (Median ms) | gesamt |\n|---|---|");
for (const k of alle("selbst").filter((k) => !/^\((idle|program)\)/.test(k)).sort((a, b) => mj("selbst", b) - mj("selbst", a)).slice(0, TOP))
    console.log(`| ${k} | ${mj("selbst", k).toFixed(0)} |`);
console.log("\n| Inklusivzeit Stamm (Median ms) | bis Bild | nach dem Buch |\n|---|---|---|");
for (const k of alle("inkl").filter((k) => /\.js$/.test(k) && / [a-z-]+\.js$/.test(k) && !/three|vendor|bootstrap/.test(k)).sort((a, b) => mj("inkl", b) - mj("inkl", a)).slice(0, TOP))
    console.log(`| ${k} | ${mj("inkl", k).toFixed(0)} | ${mj("inklB", k).toFixed(0)} |`);
