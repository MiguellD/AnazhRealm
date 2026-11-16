// heap-pfad-diff.cjs <feld> <snap-a.json> <snap-b.json> ...: der Pfad-Zensus (zensus3|zensus5|puffer5) je Schnappschuss nebeneinander
const [feld, ...dateien] = process.argv.slice(2);
const S = dateien.map((d) => new Map(require(require("path").resolve(d))[feld]));
const ks = new Set(S.flatMap((m) => [...m.keys()]));
const z = [...ks].map((k) => [k, S.map((m) => m.get(k) || 0)]).map(([k, v]) => [k, v, Math.max(...v) - v[0], v[v.length - 1] - v[0]]);
z.sort((a, b) => Math.abs(b[3]) + Math.abs(b[2]) - Math.abs(a[3]) - Math.abs(a[2]));
for (const [k, v, , d] of z.slice(0, Number(process.env.TOP || 40))) console.log((d >= 0 ? "+" : "") + d.toFixed(1), v.map((x) => x.toFixed(1)).join(" "), k.slice(0, 140));
