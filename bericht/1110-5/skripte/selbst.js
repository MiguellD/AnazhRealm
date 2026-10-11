// Die Akne als SELBST-Schatten des Bodens: Schuss A (alles wirft) gegen Schuss B (der Boden-Satz wirft nicht) — was nur A
// abdunkelt, ist der Boden auf sich selbst; am sonnigen Hang ohne Relief davor ist das die Akne. Dazu Schuss C ohne Schatten.
const st = r.state, rend = st.renderer, T = window.THREE;
rend.setAnimationLoop(null);
const V = __VARIANTE__;
const lichter = [];
st.scene.traverse((o) => { if (o.isLight && o.shadow) lichter.push(o); });
if (st.csmNode && st.csmNode.lights) for (const l of st.csmNode.lights) if (l && l.shadow && !lichter.includes(l)) lichter.push(l);
const g = (x, z) => r._voxelSurfaceY(x, z);
const px = V.x == null ? -62 : V.x, pz = V.z == null ? -9 : V.z, e = 2;
const gx = (g(px + e, pz) - g(px - e, pz)) / (2 * e), gz = (g(px, pz + e) - g(px, pz - e)) / (2 * e);
const dl = Math.hypot(gx, gz) || 1, ux = -gx / dl, uz = -gz / dl;
const cx = px + ux * 15, cz = pz + uz * 15;
const cam = st.camera, W = 960, H = 540;
const hebelAlt = st.atmosphere.shadowBias;
if (V.hebel != null) r.setShadowBias(V.hebel);
let boden = null;
st.scene.traverse((o) => { if (o.isMesh && o.name === "bodenSatz") boden = o; });
const bundles = () => st.scene.traverse((o) => { if (o.isBundleGroup) o.needsUpdate = true; });
const schuss = async (staerke, bodenWirft) => {
  for (const l of lichter) l.shadow.intensity = staerke;
  boden.castShadow = bodenWirft; bundles();
  window.__buehne();
  cam.position.set(cx, g(cx, cz) + 5, cz); cam.lookAt(px, g(px, pz), pz); cam.updateMatrixWorld(true);
  if (st.playerMesh) st.playerMesh.visible = false;
  let auf = null;
  for (let i = 0; i < 3; i++) { r._schattenAlleNeu(); auf = await window.__ausgabeAufnahme(W, H, 1); }
  return auf.u8;
};
const wirftAlt = boden.castShadow;
let A, B, C;
try { A = await schuss(1, true); B = await schuss(1, false); C = await schuss(0, true); }
finally { boden.castShadow = wirftAlt; bundles(); for (const l of lichter) l.shadow.intensity = 1; r.setShadowBias(hebelAlt); }
let akne = 0, licht = 0;
const sum = (u, k) => u[k] + u[k + 1] + u[k + 2];
for (let i = 0; i < W * H; i++) {
  const k = i * 4;
  const a = sum(A, k), b = sum(B, k), c = sum(C, k);
  if (c < 60 || b < 0.85 * c) continue; // nur, was ohne Boden-Wurf im Licht liegt
  licht++;
  if (a < 0.85 * b) akne++;
}
const out = { hebel: V.hebel == null ? hebelAlt : V.hebel, lichtPixel: licht, akneAnteil: +(akne / Math.max(1, licht)).toFixed(4) };
if (V.bild) {
  const png = (u) => { const c0 = document.createElement("canvas"); c0.width = W; c0.height = H; const x0 = c0.getContext("2d"); const d0 = x0.createImageData(W, H); d0.data.set(u); x0.putImageData(d0, 0, 0); return c0.toDataURL("image/png"); };
  out.A = png(A); out.B = png(B);
}
return out;
