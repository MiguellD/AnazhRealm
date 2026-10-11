const st = r.state, fr = st.fernRing, T = window.THREE;
const { span } = r._voxelChunkConfig();
for (const m of fr.meshes) { m.geometry.computeBoundingSphere(); m.geometry.computeBoundingBox(); m.updateMatrixWorld(true); }
const gedeckt = (cx, cz) => r._chunkDecktRing((cx + 0.5) * span, (cz + 0.5) * span);
const keys = [...st.voxelChunks.keys()].map((k) => k.split(",").map(Number)).filter(([cx, cz]) => gedeckt(cx, cz));
const ray = new T.Raycaster();
const ab = [];
const DIRS = [[1, 0], [-1, 0], [0, 1], [0, -1]];
for (const [cx, cz] of keys)
  for (const [dx, dz] of DIRS) {
    if (gedeckt(cx + dx, cz + dz)) continue;
    for (const f of [0.1, 0.3, 0.5, 0.7, 0.9])
      for (const d of [1, 5, 10, 20]) {
        let x, z;
        if (dx) { x = dx > 0 ? (cx + 1) * span + d : cx * span - d; z = (cz + f) * span; }
        else { z = dz > 0 ? (cz + 1) * span + d : cz * span - d; x = (cx + f) * span; }
        ray.set(new T.Vector3(x, 3000, z), new T.Vector3(0, -1, 0));
        ray.far = 6000;
        const h = ray.intersectObjects(fr.meshes, false)[0];
        const law = r._terrainMacroSurfaceY(x, z, true);
        if (!h) { ab.push({ x, z, d, law, far: null }); continue; }
        // die Ecken des getroffenen Dreiecks: versenkt?
        const pos = h.object.geometry.attributes.position;
        const ecken = [h.face.a, h.face.b, h.face.c].map((i) => { const ex = pos.getX(i), ez = pos.getZ(i); return { y: pos.getY(i), law: r._terrainMacroSurfaceY(ex, ez, true), gedeckt: r._chunkDecktRing(ex, ez) }; });
        ab.push({ x: Math.round(x), z: Math.round(z), d, law: +law.toFixed(2), far: +h.point.y.toFixed(2), sprung: +(h.point.y - law).toFixed(2), versenkt: ecken.filter((e) => e.law - e.y > 30).length, gedecktEcken: ecken.filter((e) => e.gedeckt).length });
      }
  }
const s = ab.filter((a) => a.far != null);
const je = {};
for (const d of [1, 5, 10, 20]) {
  const t = s.filter((a) => a.d === d).map((a) => a.sprung);
  t.sort((a, b) => a - b);
  je[d] = { n: t.length, min: t[0], median: t[t.length >> 1], max: t[t.length - 1], ueber1m: t.filter((v) => Math.abs(v) > 1).length };
}
const schlimm = s.slice().sort((a, b) => a.sprung - b.sprung).slice(0, 6);
return { span, chunks: keys.length, proben: ab.length, ohneTreffer: ab.length - s.length, je, versenktUnterTreffern: s.filter((a) => a.versenkt > 0).length, schlimm };
