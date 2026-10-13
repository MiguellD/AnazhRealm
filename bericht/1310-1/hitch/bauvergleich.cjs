// 1310-1 Gruppe 3: die Bau-Listen zweier Läufe der Erst-Zeichnungs-Wand (HITCH_BAULISTE) — je Bau Label, Start, Dauer.
// node bauvergleich.cjs <A-bauliste.json> <B-bauliste.json>: die Labels ohne die laufende Nummer (`renderPipeline_<stoff>_<n>`
// → `<stoff>`) als Multimenge, was nur eine Seite baut, und je Seite die Reihenfolge mit Dauer.
"use strict";
const fs = require("fs");
const [fa, fb] = process.argv.slice(2);
const lies = (f) => JSON.parse(fs.readFileSync(f, "utf8")) || [];
const kern = (l) => String(l).replace(/_\d+$/, "");
const A = lies(fa),
    B = lies(fb);
const zaehl = (L) => L.reduce((m, x) => m.set(kern(x.l), (m.get(kern(x.l)) || 0) + 1), new Map());
const za = zaehl(A),
    zb = zaehl(B);
const alle = [...new Set([...za.keys(), ...zb.keys()])].sort();
console.log(`A ${fa}: ${A.length} Bauten · B ${fb}: ${B.length} Bauten`);
for (const k of alle) {
    const a = za.get(k) || 0,
        b = zb.get(k) || 0;
    if (a !== b) console.log(`  UNGLEICH ${k}: A ${a} · B ${b}`);
}
const zeile = (x, i) => `  ${String(i).padStart(2)} t0 ${String(x.t0).padStart(7)} ms · ${String(x.ms).padStart(7)} ms · Flug ${x.flug} · ${x.ok ? "" : "ABGESAGT "}${x.l}`;
console.log("\nA (Reihenfolge der Fertigstellung):");
A.forEach((x, i) => console.log(zeile(x, i)));
console.log("\nB:");
B.forEach((x, i) => console.log(zeile(x, i)));
