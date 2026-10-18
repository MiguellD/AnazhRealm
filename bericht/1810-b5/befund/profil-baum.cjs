// 1810 B5 Finder: der Aufruf-Baum des Haupt-Fadens bis zum Weltbild (Inklusivzeit je Pfad, Median über die Läufe), nur
// Pfade ≥ <min> ms bis Tiefe <tiefe>; Wurzel-Kinder = die Aufgaben des Event-Loops (Takt, Worker-Antworten, Mikro-Tasks …).
//   node profil-baum.cjs <roh> <min-ms> <tiefe> <lauf> [lauf …]
"use strict";
const fs = require("fs");
const path = require("path");
const [D, minS, tiefeS, ...laeufe] = process.argv.slice(2);
const MIN = Number(minS), TIEFE = Number(tiefeS);
const med = (a) => {
    const b = a.slice().sort((x, y) => x - y);
    return b.length % 2 ? b[(b.length - 1) / 2] : (b[b.length / 2 - 1] + b[b.length / 2]) / 2;
};
const jeLauf = [];
for (const N of laeufe) {
    const p = JSON.parse(fs.readFileSync(path.join(D, N + ".cpuprofile"), "utf8"));
    const WB = JSON.parse(fs.readFileSync(path.join(D, N + ".json"), "utf8")).weltbildDa;
    const byId = new Map(p.nodes.map((x) => [x.id, x]));
    const vater = new Map();
    for (const n of p.nodes) for (const c of n.children || []) vater.set(c, n.id);
    const nm = (n) => `${n.callFrame.functionName || "(anonym)"} ${path.basename((n.callFrame.url || "").split("?")[0])}`.trim();
    const pfad = new Map();
    let t = p.startTime;
    for (let i = 0; i < p.samples.length; i++) {
        t += p.timeDeltas[i];
        if ((t - p.startTime) / 1000 > WB) continue;
        const dt = (i + 1 < p.timeDeltas.length ? p.timeDeltas[i + 1] : 0) / 1000;
        const kette = [];
        let nd = byId.get(p.samples[i]);
        while (nd) {
            kette.push(nm(nd));
            const v = vater.get(nd.id);
            nd = v != null ? byId.get(v) : null;
        }
        kette.reverse(); // (root) zuerst
        for (let d = 1; d <= Math.min(TIEFE, kette.length - 1); d++) {
            const k = kette.slice(1, d + 1).join(" > ");
            pfad.set(k, (pfad.get(k) || 0) + dt);
        }
    }
    jeLauf.push(pfad);
}
const alle = new Set();
for (const m of jeLauf) for (const k of m.keys()) alle.add(k);
const z = [...alle].map((k) => [k, med(jeLauf.map((m) => m.get(k) || 0))]).filter(([, v]) => v >= MIN);
z.sort((a, b) => (a[0] < b[0] ? -1 : 1));
for (const [k, v] of z) {
    const teile = k.split(" > ");
    console.log(`${"  ".repeat(teile.length - 1)}${teile[teile.length - 1]}  ${v.toFixed(0)}`);
}
