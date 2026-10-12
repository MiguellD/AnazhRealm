// Die Hülle des Regler-Raums: je Rezept × Regler × {min, max} die Dreiecke des Tor-L0 (wie gate:regler-wirkt den Rand fährt).
//   node regler-rand.cjs <root> [porta-core-datei]
const path = require("path");
const root = process.argv[2];
global.THREE = require(path.join(root, "worlds/terrain/lib/three-r128.min.js"));
require(process.argv[3] ? path.resolve(process.argv[3]) : path.join(root, "porta-core.js"));
const PC = globalThis.__portaCore;
const tris = (g) => { let n = 0; g.traverse((o) => { if (o.isMesh) { const geo = o.geometry; n += (geo.index ? geo.index.count : geo.attributes.position.count) / 3; } }); return n; };
const zeilen = PC.PARAMS_BY_KIND.gate;
const L = [];
for (const id of Object.keys(PC.PRESETS)) {
    L.push({ id, regler: "(Rezept)", wert: "", tris: tris(PC.buildInstance(id, 7, 0)) });
    for (const d of zeilen) for (const wert of [d.min, d.max]) L.push({ id, regler: d.id, wert, tris: tris(PC.buildInstance(id, 7, 0, { [d.id]: wert })) });
}
L.sort((a, b) => b.tris - a.tris);
console.log(`${L.length} Bauten (${Object.keys(PC.PRESETS).length} Rezepte × ${zeilen.length} Regler × Rand + Rezept) — Maximum ${L[0].tris} (${L[0].id} ${L[0].regler}=${L[0].wert})`);
for (const x of L.slice(0, 12)) console.log(`  ${String(x.tris).padStart(7)}  ${x.id} ${x.regler}${x.wert !== "" ? "=" + x.wert : ""}`);
