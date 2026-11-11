// pipe-lesen.cjs <lauf.json> [von ms] [bis ms] — die Pipelines der GPU (FREI_ZERLEGE): je Sekunde bestellt · fertig · im Flug, die
// längsten einzeln, und im Fenster: wie lange mindestens eine im Flug war (die GPU übersetzt) gegen die Fenster-Dauer.
const fs = require("fs");
const b = JSON.parse(fs.readFileSync(process.argv[2], "utf8"));
const P = (b.pipes || []).filter((e) => e[1] != null && e[1] >= 0);
const offen = (b.pipes || []).filter((e) => e[1] == null).length;
const VON = Number(process.argv[3] || 0);
const BIS = Number(process.argv[4] || (b.marken && b.marken.weltbild) || 60000);
console.log("Pipelines: " + (b.pipes || []).length + " bestellt, " + offen + " am Ende offen · Σ Dauer " + (P.reduce((a, e) => a + (e[1] - e[0]), 0) / 1000).toFixed(1) + " s · synchron " + P.filter((e) => e[2].startsWith("sync")).length);
for (let t = Math.floor(VON / 1000) * 1000; t < BIS; t += 1000) {
    const an = P.filter((e) => e[0] >= t && e[0] < t + 1000).length;
    const ab = P.filter((e) => e[1] >= t && e[1] < t + 1000).length;
    const flug = P.filter((e) => e[0] < t + 1000 && e[1] >= t).length;
    console.log((t / 1000).toFixed(0).padStart(4) + " s · bestellt " + String(an).padStart(3) + " · fertig " + String(ab).padStart(3) + " · im Flug " + String(flug).padStart(3));
}
// die Zeit im Fenster, in der mindestens eine Pipeline im Flug war
const ev = P.filter((e) => e[1] >= VON && e[0] <= BIS).map((e) => [Math.max(e[0], VON), Math.min(e[1], BIS)]).sort((x, y) => x[0] - y[0]);
let belegt = 0;
let ende = -1;
for (const [a, e] of ev) {
    if (e <= ende) continue;
    belegt += e - Math.max(a, ende);
    ende = e;
}
console.log("im Fenster " + (VON / 1000).toFixed(1) + "–" + (BIS / 1000).toFixed(1) + " s war " + (belegt / 1000).toFixed(1) + " s lang mindestens eine Pipeline im Flug");
console.log("--- die längsten im Fenster");
for (const e of P.filter((x) => x[1] >= VON && x[0] <= BIS).sort((x, y) => y[1] - y[0] - (x[1] - x[0])).slice(0, 14)) console.log(((e[1] - e[0]) / 1000).toFixed(2).padStart(6) + " s · " + (e[0] / 1000).toFixed(1) + "→" + (e[1] / 1000).toFixed(1) + " · " + e[2].slice(0, 90));
