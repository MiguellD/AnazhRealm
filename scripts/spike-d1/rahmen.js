// je Wind-Geometrie: Ausdehnung (max |x|), Vertices, Klasse — wer passt in ±64 m um den Vorlagen-Ursprung?
const K = r._baumWindKnoten || {}; const alt = new Set([K.laub, K.ast].filter(Boolean));
const seen = new Map();
r.state.scene.traverse((o) => {
  const ms = (Array.isArray(o.material) ? o.material : [o.material]).filter(Boolean);
  if (!ms.some((m) => alt.has(m.positionNode))) return;
  const g = o.__instanzQuelle ? o.__instanzQuelle.geometry : o.geometry;
  const a = g && g.attributes.position; if (!a || seen.has(a)) return;
  let mx = 0, mn = [1e9,1e9,1e9], mxv = [-1e9,-1e9,-1e9];
  for (let i = 0; i < a.array.length; i++) { const v = a.array[i]; const c = i % 3; if (Math.abs(v) > mx) mx = Math.abs(v); if (v < mn[c]) mn[c] = v; if (v > mxv[c]) mxv[c] = v; }
  const halb = Math.max(...[0,1,2].map((c) => (mxv[c] - mn[c]) / 2));
  seen.set(a, { k: r._taeterKlasse(o), inst: !!(o.__instanzQuelle || o.isInstancedMesh), typ: o.type, n: a.count, maxAbs: +mx.toFixed(1), halbAusdehnung: +halb.toFixed(1), satz: !!(ms[0].userData && ms[0].userData.foundrySignatur && /satz/.test(ms[0].userData.foundrySignatur)) });
});
const L = [...seen.values()];
const raus = L.filter((e) => e.maxAbs > 64);
const sum = (l) => l.reduce((s, e) => s + e.n, 0);
return { geos: L.length, verts: sum(L), raus: raus.length, rausVerts: sum(raus), rausHalbMax: Math.max(0, ...raus.map((e) => e.halbAusdehnung)), beispiele: raus.slice(0, 8), groessteDrin: L.filter((e)=>e.maxAbs<=64).sort((a,b)=>b.maxAbs-a.maxAbs).slice(0,3) };
