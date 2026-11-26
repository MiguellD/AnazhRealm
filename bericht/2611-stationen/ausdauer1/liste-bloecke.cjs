// welche Stations-Blöcke der Liste ein Diff berührt: je Hunk (Basis-Zeile) der letzte Kopf „  <kriterium>#<staffel> · “ davor
const fs = require("fs");
const [basis, diff] = process.argv.slice(2);
const zeilen = fs.readFileSync(basis, "utf8").split("\n");
const kopf = [];
zeilen.forEach((z, i) => { const m = /^  ([\w.]+#\d+) · /.exec(z); if (m) kopf.push([i + 1, m[1]]); });
const bei = (n) => { let k = null; for (const [i, name] of kopf) { if (i <= n) k = name; else break; } return k; };
const je = new Map();
for (const z of fs.readFileSync(diff, "utf8").split("\n")) {
  const m = /^(\d+)(?:,(\d+))?[acd]/.exec(z); if (!m) continue;
  const n = +m[1], name = bei(n) || "(vor dem ersten Kopf)";
  je.set(name, (je.get(name) || 0) + 1);
}
for (const [k, v] of je) console.log(v + " Hunks · " + k);
console.log(je.size + " Blöcke");
