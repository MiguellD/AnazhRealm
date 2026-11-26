const st = r.state, pm = st.playerMesh.position;
window.__rechtOrt = window.__rechtOrt || window.__ortSchritt;
window.__ortSchritt = null; window.__rechtZug = window.__anazhAutoSettlement; window.__anazhAutoSettlement = true;
pm.set(842, r._voxelSurfaceY(842, 452) + 1.8, 452);
const t0 = performance.now(); let takte = 0;
const stadt = () => [...(r._bewohnerSiedlungen || new Map()).values()].map((S) => ({ key: S.key, n: (S.liste || []).length, ox: Math.round(S.ox), oz: Math.round(S.oz), leib: (S.liste || []).filter((b) => b.leib).length, draussen: (S.liste || []).filter((b) => b.leib && !b.drinnen).length }));
while (performance.now() - t0 < 100000) {
  await window.__werkTakt(); takte++;
  pm.set(842, r._voxelSurfaceY(842, 452) + 1.8, 452);
  const s = stadt().find((x) => Math.hypot(x.ox - 836, x.oz - 438) < 80);
  if (s && s.leib > 900) break;
}
return { s: +((performance.now() - t0) / 1000).toFixed(1), takte, pm: [+pm.x.toFixed(1), +pm.z.toFixed(1)], siedlungen: stadt(), zellen: Object.keys(st.worldMeta.settlementCells || {}).length };
