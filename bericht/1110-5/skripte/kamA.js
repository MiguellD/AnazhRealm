const st = r.state, rend = st.renderer, T = window.THREE;
rend.setAnimationLoop(null);
const lichter = [];
st.scene.traverse((o) => { if (o.isLight && o.shadow) lichter.push(o); });
if (st.csmNode && st.csmNode.lights) for (const l of st.csmNode.lights) if (l && l.shadow && !lichter.includes(l)) lichter.push(l);
const cam = st.camera, W = 960, H = 540;
const g = (x, z) => r._voxelSurfaceY(x, z);
const schuss = async (staerke) => {
  for (const l of lichter) l.shadow.intensity = staerke;
  window.__buehne();
  cam.position.set(12, g(12, 148) + 1.2, 148); cam.lookAt(0, g(0, 148) + 0.8, 148 + 1e-4); cam.updateMatrixWorld(true);
  if (st.playerMesh) st.playerMesh.visible = false;
  let auf = null;
  for (let i = 0; i < 3; i++) { r._schattenAlleNeu(); auf = await window.__ausgabeAufnahme(W, H, 1); }
  return auf.u8;
};
let an, aus;
try { an = await schuss(1); aus = await schuss(0); } finally { for (const l of lichter) l.shadow.intensity = 1; }
const png = (u) => { const c = document.createElement("canvas"); c.width = W; c.height = H; const x = c.getContext("2d"); const d = x.createImageData(W, H); d.data.set(u); x.putImageData(d, 0, 0); return c.toDataURL("image/png"); };
let diff = 0, n = 0;
for (let i = 0; i < W * H; i++) { const k = i * 4; const a = an[k] + an[k + 1] + an[k + 2], b = aus[k] + aus[k + 1] + aus[k + 2]; if (b > 30) { n++; if (a < 0.85 * b) diff++; } }
return { an: png(an), aus: png(aus), abgedunkelt: +(diff / n).toFixed(4) };
