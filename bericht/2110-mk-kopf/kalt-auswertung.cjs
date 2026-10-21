// ankunft K5: je Kalt-Boot die blockierte Summe (LongTask) bis t(Weltbild) und die längste Aufgabe; Median über die Boots
const fs = require("fs");
const rows = [];
for (const f of process.argv.slice(2)) {
    const o = JSON.parse(fs.readFileSync(f, "utf8"));
    const t = o.weltbildDa;
    const lang = (o.lang || []).filter(([s]) => s < t);
    const summe = lang.reduce((a, [s, d]) => a + Math.min(d, t - s), 0);
    const max = lang.reduce((a, [, d]) => Math.max(a, d), 0);
    rows.push({ datei: f.split(/[\/]/).pop(), tWeltbildS: +(t / 1000).toFixed(2), blockiertBisBildS: +(summe / 1000).toFixed(2), laengsteMs: max, aufgaben: lang.length, adapter: o.adapter && (o.adapter.description || o.adapter.architecture || o.adapter.vendor) });
}
const med = (a) => { const s = [...a].sort((x, y) => x - y); const m = s.length >> 1; return s.length % 2 ? s[m] : (s[m - 1] + s[m]) / 2; };
console.log(JSON.stringify({ rows, median: { tWeltbildS: med(rows.map((r) => r.tWeltbildS)), blockiertBisBildS: med(rows.map((r) => r.blockiertBisBildS)), laengsteMs: med(rows.map((r) => r.laengsteMs)) } }, null, 1));
