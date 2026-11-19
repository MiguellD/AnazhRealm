// Der Preis der Stufe aus der L0 im Format des Foundry-Fadens (E10): L0 bauen (buildInstance), je Netz Lage/Index/Farbe/Verband,
// dann muster(netze, s) an der Grenze (s = d ÷ Brennweite 703,7 px/m an 1080 Zeilen); daneben die Dreiecke der heutigen Stufe.
//   im Spiel-Baum: node <diese Mappe>/muster-preis.cjs <preset> <same> <d1,d2>     (am Stein-Kopf: alemannisch 7 12,26)
const fs = require("fs"), path = require("path");
const { studioKern } = require(path.join(process.cwd(), "scripts/lib/welt-boot.cjs"));
const FC = studioKern(process.env.FC_DATEI || "fachwerk-core.js", "__fachwerkCore");
const muster = new Function(fs.readFileSync(path.join(__dirname, "muster.js"), "utf8") + "\nreturn muster;")();
const [preset, seed] = [process.argv[2] || "alemannisch", +(process.argv[3] || 7)];
const abst = (process.argv[4] || "12,26").split(",").map(Number);
function netze(g) {
    const aus = [], glas = [];
    g.updateMatrixWorld(true);
    g.traverse((o) => {
        if (!o.isMesh || !o.geometry || !o.geometry.attributes.position) return;
        const geo = o.geometry.clone().applyMatrix4(o.matrixWorld);
        const P = geo.attributes.position, n = P.count;
        const idx = geo.index ? geo.index.array : Uint32Array.from({ length: n }, (_, i) => i);
        const m = o.material || {}, ud = m.userData || {};
        const net = { kind: "mesh", mat: ud.__seh || "stoff", position: { array: Float32Array.from(P.array), itemSize: 3 }, index: idx };
        if (geo.attributes.normal) net.normal = { array: Float32Array.from(geo.attributes.normal.array), itemSize: 3 };
        if (geo.attributes.color) net.color = { array: Float32Array.from(geo.attributes.color.array), itemSize: geo.attributes.color.itemSize };
        const vb = ud.__verband || 0;
        if (vb) net.aVerband = { array: new Float32Array(n).fill(vb), itemSize: 1 };
        aus.push(net);
        glas.push(!!(m.transparent && m.opacity < 1));
    });
    return { aus, glas };
}
const tri = (ms) => ms.reduce((s, m) => s + (m && m.index ? m.index.length / 3 : 0), 0);
let t0 = Date.now();
const { aus: N, glas } = netze(FC.buildInstance(preset, seed, 0));
console.log(`${preset}/s${seed} L0: ${tri(N)} Dreiecke in ${N.length} Netzen · Bau ${Date.now() - t0} ms`);
for (const [k, d] of abst.entries()) {
    const s = d / 703.7;
    t0 = Date.now();
    const M = muster(N, s, { glas });
    const ms = Date.now() - t0;
    let th = 0;
    FC.buildInstance(preset, seed, k + 1).traverse((o) => { if (o.isMesh && o.geometry) th += (o.geometry.index ? o.geometry.index.count : o.geometry.attributes.position.count) / 3; });
    console.log(`  L${k + 1} an ${d} m (s ${(s * 100).toFixed(2)} cm): aus der L0 ${tri(M)} Dreiecke in ${ms} ms · heute ${th}`);
}
