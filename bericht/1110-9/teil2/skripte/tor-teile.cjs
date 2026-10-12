// Welche Teile eines Tor-L0 tragen die Dreiecke? (porta-core.js in Node, wie diag-porta-contract)
const path = require("path");
const root = process.argv[2];
global.THREE = require(path.join(root, "worlds/terrain/lib/three-r128.min.js"));
require(process.argv[3] ? path.resolve(process.argv[3]) : path.join(root, "porta-core.js"));
const PC = global.__portaCore || globalThis.__portaCore;
const ids = ["drachentor", "maurentor", "verkalkt", "geisttor", "kathedrale", "maschine", "ruine"];
for (const id of ids) {
    const g = PC.buildInstance(id, 7, 0);
    if (!g) { console.log(id, "kein Bau"); continue; }
    const je = new Map();
    let tris = 0, meshes = 0, objekte = 0;
    g.traverse((o) => {
        objekte++;
        if (!o.isMesh) return;
        meshes++;
        const geo = o.geometry;
        const n = geo.index ? geo.index.count / 3 : geo.attributes.position.count / 3;
        tris += n;
        // der Teil: Name des Mesh, sonst der Name der Eltern, sonst die Geometrie-Art
        let k = o.name || (o.parent && o.parent.name) || geo.type;
        k = String(k).replace(/[0-9]+$/, "#");
        const e = je.get(k) || { n: 0, tris: 0 };
        e.n++; e.tris += n;
        je.set(k, e);
    });
    const top = [...je.entries()].sort((a, b) => b[1].tris - a[1].tris).slice(0, 8);
    console.log(`${id}: ${Math.round(tris)} Dreiecke, ${meshes} Meshes, ${objekte} Objekte`);
    for (const [k, e] of top) console.log(`   ${k.padEnd(30)} ${String(e.n).padStart(4)} × → ${Math.round(e.tris)} (${((100 * e.tris) / tris).toFixed(0)} %)`);
}
