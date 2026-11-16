// heap-diff.cjs <pose-a.json> <pose-b.json>: Halter (Typed-Arrays) und Behaelter-Zahlen zwischen zwei Posen
const [a, b] = process.argv.slice(2).map((p) => require(require("path").resolve(p)));
const d = (x, y) => { const m = new Map(x || []); const ks = new Set([...m.keys(), ...(y || []).map((e) => e[0])]); const n = new Map(y || []); return [...ks].map((k) => [k, +((n.get(k) || 0) - (m.get(k) || 0)).toFixed(2), m.get(k) || 0, n.get(k) || 0]).filter((e) => Math.abs(e[1]) >= 0.3).sort((p, q) => q[1] - p[1]); };
console.log(a.pose, "->", b.pose, "Heap", a.heap_mb, "->", b.heap_mb, "VRAM", a.vram_mb, "->", b.vram_mb);
console.log("HALTER", d(a.halter, b.halter).map((e) => e[0] + " " + e[2] + "->" + e[3]).join(" | "));
const za = a.zen.zensus, zb = b.zen.zensus, ks = new Set([...Object.keys(za), ...Object.keys(zb)]);
console.log("ZENSUS", [...ks].map((k) => [k, (zb[k] || 0) - (za[k] || 0), za[k] || 0, zb[k] || 0]).filter((e) => e[1] !== 0).sort((p, q) => Math.abs(q[1]) - Math.abs(p[1])).slice(0, 40).map((e) => e[0] + " " + e[2] + "->" + e[3]).join(" | "));
console.log("SZENE", JSON.stringify(a.zen.szene), JSON.stringify(b.zen.szene), JSON.stringify(a.zen.info), JSON.stringify(b.zen.info), "chunks", a.zen.chunks, b.zen.chunks);
