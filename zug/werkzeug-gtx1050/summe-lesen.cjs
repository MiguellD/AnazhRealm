// summe-lesen.cjs <lauf.json> [n=30] — das Ruf-Profil der frei-sonde (FREI_INIT=<Tiefe>, FREI_INIT_VON/BIS): je Tiefe die Rufe des
// Prototyps nach ihrer Summe im Fenster (inklusive Zeit, ms · Rufe), dazu die längsten einzelnen Rufe. Tiefe 0 = von außen
// gerufen (rAF, Nachricht, Zeitgeber), Tiefe 1 = sein Kind.
const fs = require("fs");
const b = JSON.parse(fs.readFileSync(process.argv[2], "utf8"));
const N = Number(process.argv[3] || 30);
const je = {};
for (const [k, [ms, n]] of Object.entries(b.summe || {})) {
    const [t, name] = [k.slice(0, k.indexOf("|")), k.slice(k.indexOf("|") + 1)];
    (je[t] || (je[t] = [])).push([name, ms, n]);
}
for (const t of Object.keys(je).sort()) {
    const l = je[t].sort((x, y) => y[1] - x[1]);
    console.log("--- Tiefe " + t + ": Σ " + Math.round(l.reduce((a, e) => a + e[1], 0)) + " ms über " + l.length + " Namen");
    for (const [name, ms, n] of l.slice(0, N)) console.log(String(Math.round(ms)).padStart(7) + " ms · " + String(n).padStart(6) + "× · " + name);
}
console.log("--- die längsten einzelnen Rufe");
for (const [n, t, d, tiefe] of (b.init || []).sort((x, y) => y[2] - x[2]).slice(0, N)) console.log(String(d).padStart(6) + " ms @ " + (t / 1000).toFixed(1).padStart(5) + " s · T" + tiefe + " " + n);
