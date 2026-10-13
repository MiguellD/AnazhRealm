// 1310-11: die Nah-Streu-Senken der Steine (geroell/findling) — Ecken-Farben (linear), Stoff, der Satz (wirft? empfängt?), die
// nächste Zelle zum Spieler als Blick. node stein.cjs <port>
"use strict";
const http = require("http");
const code = `
const st = r.state, pm = st.playerMesh.position, ns = st.nahStreu;
if (!ns || !ns.senken) return { fehlt: "nahStreu" };
const out = []; let best = null; const M = new T.Matrix4(), p = new T.Vector3();
const alle = [];
for (const [k, a] of ns.senken) {
  alle.push(k);
  if (!/geroell|findling|stein|kiesel|fels/.test(k)) continue;
  const col = a.geo.attributes.color, n = col ? col.count : 0;
  let cr = 0, cg = 0, cb = 0, mn = 9, mx = 0;
  for (let i = 0; i < n; i++) { const y = 0.2126 * col.getX(i) + 0.7152 * col.getY(i) + 0.0722 * col.getZ(i); cr += col.getX(i); cg += col.getY(i); cb += col.getZ(i); mn = Math.min(mn, y); mx = Math.max(mx, y); }
  const sz = st.chunkSaetze && st.chunkSaetze.get(a.satz);
  const sm = sz && (sz.mesh || sz.meshes && sz.meshes[0]);
  let nah = 1e9, np = null;
  for (const [, b] of a.bloecke) {
    const mats = b.matrizen || b.m || null;
    if (!mats) continue;
    for (let i = 0; i + 15 < mats.length; i += 16) { const x = mats[i + 12], y = mats[i + 13], z = mats[i + 14]; const d = Math.hypot(x - pm.x, z - pm.z); if (d < nah) { nah = d; np = [x, y, z]; } }
  }
  const mat = a.mat;
  out.push({ key: k, anzahl: a.anzahl, bloecke: a.bloecke.size, ecken: a.geo.attributes.position.count,
    eckenFarbe: n ? [cr / n, cg / n, cb / n].map((v) => +v.toFixed(3)) : null, lumaMinMax: n ? [+mn.toFixed(3), +mx.toFixed(3)] : null,
    stoff: { typ: mat.type, farbe: mat.color ? mat.color.toArray().map((v) => +v.toFixed(3)) : null, rauh: mat.roughness, metall: mat.metalness, ecken: !!mat.vertexColors, flach: !!mat.flatShading, env: mat.envMapIntensity },
    satz: a.satz, satzWirft: sz ? sz.wurf : null, mesh: sm ? { wirft: sm.castShadow, empfaengt: sm.receiveShadow } : null, satzFelder: sz ? Object.keys(sz).slice(0, 14) : null,
    blockFelder: a.bloecke.size ? Object.keys(a.bloecke.values().next().value).slice(0, 12) : null, nah: +nah.toFixed(1) });
  if (np && (!best || nah < best.nah)) best = { nah, np };
}
let blick = null;
if (best) { const [x, y, z] = best.np; blick = [x + 1.6, y + 1.1, z + 1.6, x, y + 0.15, z].map((v) => +v.toFixed(2)).join(" "); }
return { senken: out, blick, alleSenken: alle.slice(0, 40) };`;
const q = http.request({ host: "127.0.0.1", port: Number(process.argv[2]), path: "/eval", method: "POST", headers: { "Content-Type": "application/json" } }, (res) => {
    let d = "";
    res.on("data", (c) => (d += c));
    res.on("end", () => console.log(d));
});
q.end(JSON.stringify({ code }));
