// je Rezept: Stufe-3-Dreiecke (seed 7), Rand-Max über die Regler-Hülle, W (IoU min/median) — für eine porta-core-Kopie
const path = require("path");
const root = process.argv[2];
global.THREE = require(path.join(root, "worlds/terrain/lib/three-r128.min.js"));
require(path.join(root, "porta-core.js"));
const PC = globalThis.__portaCore;
const tris = (g) => { let n = 0; g.traverse((o) => { if (o.isMesh) n += (o.geometry.index ? o.geometry.index.count : o.geometry.attributes.position.count) / 3; }); return n; };
let randMax = 0, randWo = "";
const out = [];
for (const id of Object.keys(PC.PRESETS)) {
    const t3 = tris(PC.buildInstance(id, 7, 3));
    for (const z of PC.PARAMS_BY_KIND.gate) for (const v of [z.min, z.max]) {
        const n = tris(PC.huelleGruppe(PC.huelle(id, 7, { [z.id]: v }).teile));
        if (n > randMax) { randMax = n; randWo = id + " " + z.id + "=" + v; }
    }
    out.push(id + " " + t3);
}
console.log("Stufe 3 (seed 7): " + out.join(" · ") + " · Rand max " + randMax + " (" + randWo + ")");
