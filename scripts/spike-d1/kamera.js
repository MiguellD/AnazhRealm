const c = r.state.camera; const d = new T.Vector3(); c.getWorldDirection(d);
const p = c.position; const l = p.clone().addScaledVector(d, 20);
// nächster Baum (Wind-Stoff) vom Spieler
const K = r._baumWindKnoten || {}; const alt = new Set([K.laub, K.ast].filter(Boolean));
let best = null;
const pl = r.state.player ? r.state.player.position || r.state.playerMesh.position : r.state.playerMesh.position;
r.state.scene.traverse((o) => {
  const ms = (Array.isArray(o.material) ? o.material : [o.material]).filter(Boolean);
  if (!ms.some((m) => alt.has(m.positionNode))) return;
  const s = o.__instanzQuelle || o;
  if (!s.isInstancedMesh) return;
  const m = new T.Matrix4(), v = new T.Vector3();
  for (let i = 0; i < s.count; i++) { s.getMatrixAt(i, m); v.setFromMatrixPosition(m).applyMatrix4(s.matrixWorld);
    const dd = Math.hypot(v.x - pl.x, v.z - pl.z); if (dd > 6 && (!best || dd < best.d)) best = { d: dd, x: v.x, y: v.y, z: v.z, k: r._taeterKlasse(o) }; }
});
return { cam: [p.x, p.y, p.z].map((x) => +x.toFixed(2)), ziel: [l.x, l.y, l.z].map((x) => +x.toFixed(2)), spieler: [pl.x, pl.y, pl.z].map((x)=>+x.toFixed(2)), baum: best && { d: +best.d.toFixed(1), p: [best.x, best.y, best.z].map((x) => +x.toFixed(2)), k: best.k } };
