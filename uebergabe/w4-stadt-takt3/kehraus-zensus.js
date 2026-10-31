// KEHRAUS-ZENSUS (nachgebaut nach w4-stadt-takt2): was der Gang des Kehraus (`_gpuKehraus` → scene.traverse) besucht —
// Knoten je Art, Geometrie-Träger, Attribute, die Zeit des Gangs; dazu die Leiber der Bewohner und ihre Knoten.
const st = r.state;
const rend = st.renderer;
const art = {};
let knoten = 0,
    mitGeo = 0,
    attr = 0,
    tiefeMax = 0;
const leiber = { n: 0, knoten: 0, imGraph: 0, koepfe: 0 };
const geh = (o, d) => {
    knoten++;
    const a = o.isBone ? "Bone" : o.isSkinnedMesh ? "SkinnedMesh" : o.isInstancedMesh ? "InstancedMesh" : o.isMesh ? "Mesh" : o.isGroup ? "Group" : o.type || "?";
    art[a] = (art[a] || 0) + 1;
    if (o.geometry && o.geometry.attributes) {
        mitGeo++;
        for (const k in o.geometry.attributes) attr++;
    }
    if (d > tiefeMax) tiefeMax = d;
    for (const c of o.children) geh(c, d + 1);
};
geh(st.scene, 0);
for (const S of (r._bewohnerSiedlungen || new Map()).values())
    for (const b of S.liste || []) {
        leiber.koepfe++;
        if (b.leib) {
            leiber.n++;
            let n = 0;
            b.leib.traverse(() => n++);
            leiber.knoten += n;
            let o = b.leib;
            while (o && o !== st.scene) o = o.parent;
            if (o === st.scene) leiber.imGraph++;
        }
    }
const t0 = performance.now();
let gang = 0;
st.scene.traverse(() => gang++);
const msGang = performance.now() - t0;
const t2 = performance.now();
st._gpuKehrausT = 0;
let frei = null;
try {
    frei = r._gpuKehraus(rend.info.render.calls, performance.now());
} catch (e) {
    frei = String(e);
}
const msKehraus = performance.now() - t2;
return { knoten, art, mitGeo, attrImGraph: attr, tiefeMax, leiber, msGang: +msGang.toFixed(2), msKehraus: +msKehraus.toFixed(2), frei };
