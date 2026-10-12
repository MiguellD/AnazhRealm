// Stufe-0-Abdruck je Tor über die Regler-Hülle (7 Rezepte × Samen 1/7 × Grund + jeder Rand): jede Geometrie (Attribute, Index),
// Weltmatrix, Stoff, castShadow — dazu der Abdruck der Fernform (sicht-Teile der Hülle). node stufe0-hash.cjs <root>
const path = require("path"), crypto = require("crypto");
const root = process.argv[2];
global.THREE = require(path.join(root, "worlds/terrain/lib/three-r128.min.js"));
require(path.join(root, "porta-core.js"));
const PC = globalThis.__portaCore;
const h0 = crypto.createHash("sha256"), hF = crypto.createHash("sha256");
let n = 0;
for (const id of Object.keys(PC.PRESETS)) for (const seed of [1, 7]) for (const r of [null, ...PC.PARAMS_BY_KIND.gate.flatMap((z) => [[z.id, z.min], [z.id, z.max]])]) {
    const ov = r ? { [r[0]]: r[1] } : undefined;
    const g = PC.buildInstance(id, seed, 0, ov); g.updateMatrixWorld(true);
    g.traverse((o) => {
        h0.update(o.type + "|" + o.name + "|" + o.matrixWorld.elements.join(",") + "|" + !!o.castShadow);
        if (o.isMesh) {
            for (const k of Object.keys(o.geometry.attributes).sort()) h0.update(k + Buffer.from(o.geometry.attributes[k].array.buffer).toString("base64"));
            if (o.geometry.index) h0.update(Buffer.from(o.geometry.index.array.buffer).toString("base64"));
            const m = o.material; h0.update(JSON.stringify([m.type, m.color && m.color.getHex(), m.opacity, m.transparent, m.name]));
        }
    });
    const hu = PC.huelle(id, seed, ov);
    hF.update(JSON.stringify(hu.teile.filter((t) => t.rolle === "sicht" || t.rolle === "beide")));
    n++;
}
console.log("Bauten " + n + " · Stufe 0 " + h0.digest("hex").slice(0, 16) + " · Fernform " + hF.digest("hex").slice(0, 16));
