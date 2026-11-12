// auswertung.cjs — WEGWERF-SPIKE (w28-samen-lichtweg): liest mess/welt-<fall>-<runde>.json (mess-welt.cjs) und druckt je Fall
// die Zahlen vor dem ersten Weltbild; je Glied des Lichtkerns die Differenz zu `heute`. Text und Knoten sind deterministisch
// (bis auf ±1 Programm an der Kante des ersten Bilds), die ms sind Haupt-Faden-JS dieses Containers: der kleinste Lauf zählt.
"use strict";
const fs = require("fs");
const path = require("path");
const DIR = path.join(__dirname, "mess");
const je = {};
for (const f of fs.readdirSync(DIR)) {
    const m = /^welt-(.+)-(\d+)\.json$/.exec(f);
    if (!m) continue;
    (je[m[1]] = je[m[1]] || []).push(JSON.parse(fs.readFileSync(path.join(DIR, f), "utf8")));
}
const mb = (b) => b / 1048576;
const kb = (b) => b / 1024;
const min = (xs) => Math.min(...xs);
const med = (xs) => xs.slice().sort((a, b) => a - b)[xs.length >> 1];
const zeile = (fall) => {
    const L = je[fall];
    if (!L) return null;
    const vor = (l) => l.bau.filter((b) => b.t <= (l.weltbildMs || Infinity));
    const mitPool = (l) => vor(l).filter((b) => b.pool === true);
    return {
        fall,
        laeufe: L.length,
        fragN: med(L.map((l) => l.moduleVorBild.fragment.n)),
        fragMB: med(L.map((l) => mb(l.moduleVorBild.fragment.bytes))),
        vertN: med(L.map((l) => l.moduleVorBild.vertex.n)),
        vertMB: med(L.map((l) => mb(l.moduleVorBild.vertex.bytes))),
        bauN: med(L.map((l) => l.erstZeichnung.bauN)),
        bauMsMin: min(L.map((l) => l.erstZeichnung.bauMs)),
        bauMsAlle: L.map((l) => Math.round(l.erstZeichnung.bauMs)),
        knoten: med(L.map((l) => l.knotenBauVorBild.knoten)),
        poolBauN: med(L.map((l) => mitPool(l).length)),
        poolFsKB: med(L.map((l) => kb(mitPool(l).reduce((a, b) => a + b.fs, 0) / Math.max(1, mitPool(l).length)))),
        poolKnoten: med(L.map((l) => mitPool(l).reduce((a, b) => a + b.knoten, 0) / Math.max(1, mitPool(l).length))),
        poolFsSummeMB: med(L.map((l) => mb(mitPool(l).reduce((a, b) => a + b.fs, 0)))),
        ohnePoolBauN: med(L.map((l) => vor(l).length - mitPool(l).length)),
        weltbildS: med(L.map((l) => (l.weltbildMs || NaN) / 1000)),
    };
};
const ORD = ["heute", "pool8", "pool16", "ohne-pool", "kandidat", "ohne-naesse", "ohne-luft", "ohne-umgebung", "ohne-kaskaden", "decke"];
const Z = ORD.map(zeile).filter(Boolean);
const H = Z.find((z) => z.fall === "heute");
const f = (x, n = 2) => (x == null || Number.isNaN(x) ? "-" : x.toFixed(n));
console.log("FALL            Läufe | Fragment n · MB | Vertex n · MB | Bauten · Knoten Σ | Knoten-Bau ms min (alle) | Bauten mit Pool: n · Ø Fragment KB · Ø Knoten | Δ Fragment-MB zu heute");
for (const z of Z)
    console.log(
        `${z.fall.padEnd(15)} ${String(z.laeufe).padStart(3)}   | ${String(z.fragN).padStart(3)} · ${f(z.fragMB)}    | ${String(z.vertN).padStart(3)} · ${f(z.vertMB)}   | ${String(z.bauN).padStart(3)} · ${String(z.knoten).padStart(6)}      | ${f(z.bauMsMin, 0).padStart(5)} (${z.bauMsAlle.join(", ")}) | ${String(z.poolBauN).padStart(3)} · ${f(z.poolFsKB, 1).padStart(5)} · ${f(z.poolKnoten, 0).padStart(5)} | ${f(z.fragMB - H.fragMB)}`
    );
fs.writeFileSync(path.join(DIR, "welt-tafel.json"), JSON.stringify(Z, null, 1));
