// bau-lesen.cjs <lauf.json> [bis ms] — je Foundry-Faden jeder Bau (aus der Sicht des Fadens, FREI_ZERLEGE): Arbeit = Antwort minus
// max(Auftrag gelesen, vorige Antwort) — der Faden baut einen nach dem anderen. Summe je Art und Stufe, die längsten einzeln.
const fs = require("fs");
const b = JSON.parse(fs.readFileSync(process.argv[2], "utf8"));
const BIS = Number(process.argv[3] || (b.marken && b.marken.weltbild) || 60000);
const je = {};
for (const m of b.fz || []) (je[m.name] || (je[m.name] = [])).push(...m.log);
const alle = [];
for (const [n, l] of Object.entries(je)) {
    let vor = (l.find((e) => e[0] === "engine-steht (erster importScripts)") || [0, 0])[1];
    const an = new Map();
    for (const [k, t, x] of l) {
        const w = String(x).split(" ");
        const id = w.slice(1).find((s) => /^(r\d+|rw\d+_\d+|krt\d+|[a-z]+\d+_?\d*)$/.test(s) && !/^L\d$/.test(s)) || x;
        if (k.startsWith("←")) an.set(id, t);
        else if (k.startsWith("→") && t <= BIS) {
            const start = Math.max(an.get(id) ?? vor, vor);
            alle.push([n, k.slice(1), w[0] + (w[1] && /^L\d$/.test(w[1]) ? " " + w[1] : ""), t - start, start, t]);
            vor = t;
        }
    }
}
const sum = {};
for (const [n, art, was, d] of alle) {
    const k = art === "asset" ? was : art;
    const s = sum[k] || (sum[k] = [0, 0]);
    s[0] += d;
    s[1]++;
}
console.log("Foundry-Arbeit bis " + (BIS / 1000).toFixed(1) + " s: Σ " + (alle.reduce((a, e) => a + e[3], 0) / 1000).toFixed(1) + " s Faden-Zeit in " + alle.length + " Antworten");
console.log("--- Summe je Art (s · Zahl)");
for (const [k, [d, c]] of Object.entries(sum).sort((x, y) => y[1][0] - x[1][0]).slice(0, 22)) console.log((d / 1000).toFixed(1).padStart(6) + " s · " + String(c).padStart(3) + "× · " + k);
console.log("--- die längsten Bauten");
for (const [n, art, was, d, a, e] of alle.sort((x, y) => y[3] - x[3]).slice(0, 16)) console.log((d / 1000).toFixed(1).padStart(6) + " s · " + n + " · " + (a / 1000).toFixed(1) + "→" + (e / 1000).toFixed(1) + " · " + art + " " + was);
