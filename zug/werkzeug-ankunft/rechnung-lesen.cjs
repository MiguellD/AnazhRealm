// Aufruf: node <ort>/rechnung-lesen.cjs <lauf.json> […]   — — je Lauf EINE Zeile: Bild, Renderer, lange Aufgaben Renderer→Bild (Σ, längste), Knoten-Bau vor dem
// Bild (Bauten, Rufe, ms; nach Stufen), Pipelines vor dem Bild (Zahl, Übersetzung Σ, Text Σ KB, letzte Bestellung, letzte bereit).
const fs = require("fs");
const jeFall = {};
for (const f of process.argv.slice(2)) {
    const j = JSON.parse(fs.readFileSync(f, "utf8"));
    const X = j.extra || {};
    const [W, R] = [j.marken.weltbild, j.marken.rendererReady];
    const L = (j.lang || []).filter(([t]) => t >= R && t < W);
    const vor = ((X.gang || {}).bau || []).filter((b) => b[0] <= W);
    const P = (j.pipes || []).filter((e) => e.length >= 5 && e[0] <= W);
    const ms = P.reduce((a, e) => a + (typeof e[1] === "number" ? e[1] - e[0] : W - e[0]), 0);
    const kb = P.reduce((a, e) => a + Number(e[3].split(":")[0]) + Number(e[4].split(":")[0]), 0) / 1000;
    const st = (X.stufen || {}).ms || {};
    const name = f.replace(/^.*[\\/]/, "").replace(".json", "");
    const z = { bild: W, ready: R, lang: L.reduce((a, e) => a + e[1], 0), laengste: Math.max(0, ...L.map((e) => e[1])), bauten: vor.length, rufe: vor.reduce((a, b) => a + b[2], 0), bauMs: Math.round(vor.reduce((a, b) => a + b[3], 0)), pipes: P.length, uebers: ms, kb: Math.round(kb), bestellt: Math.max(...P.map((e) => e[0])), bereit: Math.max(...P.filter((e) => typeof e[1] === "number").map((e) => e[1])) };
    (jeFall[name.replace(/\d+$/, "")] = jeFall[name.replace(/\d+$/, "")] || []).push(z);
    console.log(`${name}: Bild ${z.bild} · ready ${z.ready} · lange Aufgaben ${z.lang} (längste ${z.laengste}) · Knoten-Bau ${z.bauten} Bauten ${z.rufe} Rufe ${z.bauMs} ms [setup ${Math.round(st.setup || 0)} analyze ${Math.round(st.analyze || 0)} generate ${Math.round(st.generate || 0)} code ${Math.round((st.code || 0) + (st.vor || 0))}] · Pipelines ${z.pipes} · Übersetzung Σ ${z.uebers} ms · Text ${z.kb} KB · letzte bestellt ${z.bestellt} · letzte bereit ${z.bereit}`);
}
const m = (a) => (a.reduce((x, y) => x + y, 0) / a.length);
for (const [k, v] of Object.entries(jeFall))
    console.log(`FALL ${k} (${v.length}): Bild ${v.map((z) => (z.bild / 1000).toFixed(2)).join("/")} s (Mittel ${(m(v.map((z) => z.bild)) / 1000).toFixed(2)}) · Bild−ready ${v.map((z) => ((z.bild - z.ready) / 1000).toFixed(2)).join("/")} (Mittel ${(m(v.map((z) => z.bild - z.ready)) / 1000).toFixed(2)}) · Knoten-Bau ${v.map((z) => z.bauMs).join("/")} ms · Programme ${v.map((z) => z.pipes).join("/")} · Übersetzung Σ ${v.map((z) => (z.uebers / 1000).toFixed(1)).join("/")} s · Text ${v.map((z) => z.kb).join("/")} KB · längste Aufgabe ${v.map((z) => z.laengste).join("/")} ms · letzte bestellt ${v.map((z) => (z.bestellt / 1000).toFixed(1)).join("/")}`);
