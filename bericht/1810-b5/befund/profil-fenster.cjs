// Selbstzeit + Inklusivzeit im Fenster [a,b] ms der Seiten-Uhr
const fs = require("fs"), path = require("path");
const [f, a, b] = [process.argv[2], Number(process.argv[3]), Number(process.argv[4])];
const p = JSON.parse(fs.readFileSync(f, "utf8"));
const byId = new Map(p.nodes.map((x) => [x.id, x])); const vater = new Map();
for (const n of p.nodes) for (const c of n.children || []) vater.set(c, n.id);
const nm = (n) => `${n.callFrame.functionName || "(anonym)"} ${path.basename((n.callFrame.url || "").split("?")[0])}:${n.callFrame.lineNumber}`;
const self = new Map(), inkl = new Map(); let t = p.startTime, sum = 0;
for (let i = 0; i < p.samples.length; i++) { t += p.timeDeltas[i]; const ts = (t - p.startTime) / 1000; if (ts < a || ts > b) continue;
  const dt = (i + 1 < p.timeDeltas.length ? p.timeDeltas[i + 1] : 0) / 1000; sum += dt; let nd = byId.get(p.samples[i]);
  self.set(nm(nd), (self.get(nm(nd)) || 0) + dt); const g = new Set();
  while (nd) { const k = nm(nd); if (!g.has(k)) { g.add(k); inkl.set(k, (inkl.get(k) || 0) + dt); } const v = vater.get(nd.id); nd = v != null ? byId.get(v) : null; } }
console.log("Summe", sum.toFixed(0));
console.log("SELBST", [...self].sort((x, y) => y[1] - x[1]).slice(0, 12).map(([k, v]) => k + " " + v.toFixed(0)).join("\n  "));
console.log("INKL", [...inkl].sort((x, y) => y[1] - x[1]).slice(0, 25).map(([k, v]) => k + " " + v.toFixed(0)).join("\n  "));
