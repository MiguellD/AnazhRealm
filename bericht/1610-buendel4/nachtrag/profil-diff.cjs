// profil-diff.cjs — K2: die CPU-Profile (werkbank profil, Genesis Ego) je Seite gemittelt, je Funktion ms je Frame (Selbst und
// Gesamt), Schlüssel = Funktion + Datei OHNE Zeile (K2 verschiebt Zeilen); dazu die Zeilen je Seite. Ausgabe: die größten
// Zuwächse B − A und die größten Abnahmen.   node profil-diff.cjs [ordner] [--n 25]
"use strict";
const fs = require("fs");
const path = require("path");
const DIR = process.argv[2] && !process.argv[2].startsWith("--") ? process.argv[2] : path.join(__dirname, "profil");
const N = Number((process.argv.find((x, i) => process.argv[i - 1] === "--n") || "25"));
const lies = (f) => {
    const t = fs.readFileSync(f, "utf8");
    const j = JSON.parse(t.slice(t.indexOf("{")));
    return j.ergebnis || j;
};
const seiten = { A: [], B: [] };
for (const n of fs.readdirSync(DIR).filter((x) => /^[AB][0-9]+$/.test(x)).sort()) {
    const f = path.join(DIR, n, "profil.txt");
    if (!fs.existsSync(f)) continue;
    const p = lies(f);
    const frames = p.frames || 1;
    const je = (liste) => {
        const m = new Map();
        for (const z of liste || []) {
            const r = /^\s*([\d.]+) %\s+(\d+) ms\s+(.*)$/.exec(z);
            if (!r) continue;
            const ms = Number(r[2]);
            const voll = r[3];
            const k = voll.replace(/:\d+$/, "");
            const e = m.get(k) || { ms: 0, zeilen: new Set() };
            e.ms += ms / frames;
            e.zeilen.add(voll.split(" ").pop());
            m.set(k, e);
        }
        return m;
    };
    seiten[n[0]].push({ n, frames, gesampelt: p.gesampeltMs, fps: p.fps, selbst: je(p.selbst), gesamt: je(p.gesamt) });
}
const mittel = (S, art, k) => {
    const w = seiten[S].map((x) => (x[art].get(k) || { ms: 0 }).ms);
    return w.length ? w.reduce((a, b) => a + b, 0) / w.length : NaN;
};
const zeilen = (S, art, k) => [...new Set(seiten[S].flatMap((x) => [...((x[art].get(k) || {}).zeilen || [])]))].join(",");
for (const S of ["A", "B"])
    console.log(`${S}: ${seiten[S].map((x) => `${x.n} ${x.frames} Frames · ${x.gesampelt} ms gesampelt · ${x.fps} fps`).join(" | ")}`);
for (const art of ["selbst", "gesamt"]) {
    const keys = new Set([...["A", "B"].flatMap((S) => seiten[S].flatMap((x) => [...x[art].keys()]))]);
    const d = [...keys]
        .map((k) => ({ k, a: mittel("A", art, k), b: mittel("B", art, k) }))
        .map((x) => Object.assign(x, { d: x.b - x.a }))
        .filter((x) => Number.isFinite(x.d));
    d.sort((x, y) => y.d - x.d);
    console.log(`\n## ${art} — ms je Frame, größte Zuwächse B − A`);
    for (const x of d.slice(0, N))
        console.log(`  ${(x.d >= 0 ? "+" : "") + x.d.toFixed(3)}  A ${x.a.toFixed(3)} → B ${x.b.toFixed(3)}  ${x.k}  [A ${zeilen("A", art, x.k)} · B ${zeilen("B", art, x.k)}]`);
    console.log(`## ${art} — größte Abnahmen`);
    for (const x of d.slice(-8).reverse()) console.log(`  ${x.d.toFixed(3)}  A ${x.a.toFixed(3)} → B ${x.b.toFixed(3)}  ${x.k}`);
}
