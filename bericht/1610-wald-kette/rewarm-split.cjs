// rewarm-split.cjs — die Haupt-Faden-Zeit von _foundryRewarmColdTrees im Fenster [von, Weltbild], geteilt nach direktem Aufrufer
// (Culling-Takt tickArchitectureCulling gegen die Ankunft eines Assets: der anonyme `nach`-Rückruf eines Zugs), und was darin
// _foundryEntryReady (der Dock-Peek je Kandidat) und _rebuildArchitectureMesh (das Platzieren) kosten.
//   node rewarm-split.cjs W5 W6 … [--von 11000]
"use strict";
const fs = require("fs");
const path = require("path");
const VON = Number((process.argv.find((x, i) => process.argv[i - 1] === "--von") || "11000"));
const namen = process.argv.slice(2).filter((x) => /^[A-Z]\d+$/.test(x));
const med = (x) => (x.length ? x.slice().sort((a, b) => a - b)[Math.floor(x.length / 2)] : NaN);
for (const N of namen) {
    const j = JSON.parse(fs.readFileSync(path.join(__dirname, N + ".json"), "utf8"));
    const p = JSON.parse(fs.readFileSync(path.join(__dirname, N + ".cpuprofile"), "utf8"));
    const T = j.weltbildDa;
    const knoten = new Map(p.nodes.map((n) => [n.id, n]));
    const eltern = new Map();
    for (const n of p.nodes) for (const c of n.children || []) eltern.set(c, n.id);
    const zeit = [];
    let t = p.startTime;
    for (let i = 0; i < p.samples.length; i++) zeit.push((t += p.timeDeltas[i]));
    const marken = [];
    let inLauf = false;
    for (let i = 0; i < p.samples.length; i++) {
        const ist = knoten.get(p.samples[i]).callFrame.functionName === "OMEN_TAKTMARKE";
        if (ist && !inLauf) marken.push(zeit[i]);
        inLauf = ist;
    }
    const kand = [];
    for (const m of marken) for (const s of j.wald.sync) kand.push(m / 1000 - s);
    let v = NaN, best = -1;
    for (const c of kand) {
        const n = kand.filter((x) => Math.abs(x - c) <= 3).length;
        if (n > best) [best, v] = [n, c];
    }
    v = med(kand.filter((x) => Math.abs(x - v) <= 3));
    const fn = (id) => knoten.get(id).callFrame.functionName || "(anonym)";
    const ort = (id) => {
        const c = knoten.get(id).callFrame;
        return `${(c.url || "").split("/").pop().split("?")[0]}:${c.lineNumber + 1}`;
    };
    const jeAufrufer = {};
    let fenster = 0, rewarm = 0, peek = 0, bau = 0;
    for (let i = 0; i < p.samples.length; i++) {
        const tm = zeit[i] / 1000 - v;
        if (tm < VON || tm > T) continue;
        const dt = (p.timeDeltas[i + 1] || p.timeDeltas[i]) / 1000;
        fenster += dt;
        const kette = [];
        for (let id = p.samples[i]; id != null; id = eltern.get(id)) kette.push(id);
        const k = kette.findIndex((id) => fn(id) === "_foundryRewarmColdTrees");
        if (k < 0) continue;
        rewarm += dt;
        const unter = kette.slice(0, k).map(fn);
        if (unter.includes("_foundryEntryReady")) peek += dt;
        if (unter.includes("_rebuildArchitectureMesh")) bau += dt;
        const auf = kette[k + 1] != null ? `${fn(kette[k + 1])} ${ort(kette[k + 1])}` : "?";
        jeAufrufer[auf] = (jeAufrufer[auf] || 0) + dt;
    }
    console.log(
        `${N} Fenster ${(VON / 1000).toFixed(1)}–${(T / 1000).toFixed(2)} s: ${fenster.toFixed(0)} ms gesampelt · Rewarm ${rewarm.toFixed(0)} ms (Dock-Peek ${peek.toFixed(0)} · Platzieren ${bau.toFixed(0)} · Rest ${(rewarm - peek - bau).toFixed(0)})`
    );
    for (const [a, ms] of Object.entries(jeAufrufer).sort((x, y) => y[1] - x[1]).slice(0, 5)) console.log(`   ${ms.toFixed(0).padStart(5)} ms  ← ${a}`);
}
