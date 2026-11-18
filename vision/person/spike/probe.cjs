// probe.cjs — gemeinsames Werkzeug der Spike-Proben: Same aus der Kommandozeile, Ergebnis-Datei, Prüfung gegen das Soll aus gesetz.md §7.
"use strict";
const fs = require("fs");
const path = require("path");
function same() {
    const a = process.argv.find((x) => x.startsWith("--same="));
    return a ? a.slice(7) : "anazh";
}
// ein Soll-Eintrag: [name, gemessen, lo, hi] → {name, gemessen, soll, ok}
function band(name, wert, lo, hi) {
    return { name, gemessen: wert, soll: [lo, hi], ok: wert >= lo && wert <= hi };
}
function wahr(name, wert, soll) {
    return { name, gemessen: wert, soll, ok: !!wert === !!soll };
}
function schreiben(name, obj) {
    const dir = path.join(__dirname, "ergebnis");
    fs.mkdirSync(dir, { recursive: true });
    fs.writeFileSync(path.join(dir, name + ".json"), JSON.stringify(obj, null, 1) + "\n");
}
function zeigen(pruef) {
    for (const p of pruef) console.log((p.ok ? "  ok   " : "  ROT  ") + p.name + " = " + JSON.stringify(p.gemessen) + "  Soll " + JSON.stringify(p.soll));
}
const r = (x, n) => Math.round(x * Math.pow(10, n)) / Math.pow(10, n);
function quantil(a, q) {
    const s = Float64Array.from(a).sort();
    const i = (s.length - 1) * q, lo = Math.floor(i), hi = Math.ceil(i);
    return s[lo] + (s[hi] - s[lo]) * (i - lo);
}
module.exports = { same, band, wahr, schreiben, zeigen, r, quantil };
