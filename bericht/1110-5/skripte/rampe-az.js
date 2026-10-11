// Akne an der 30°-Rampe (s2-hang30): Proben NUR auf der Rampe (40 × 40 Weltpunkte, x ±12, z 136–160), Sonne aus +z mit
// Höhe V.e (Richtlicht UND uSunDir), Schuss von oben im Ausgabe-Pfad mit Schatten-Stärke 1 (an) und 0 (aus).
const st = r.state, rend = st.renderer, T = window.THREE;
rend.setAnimationLoop(null);
const V = __VARIANTE__;
const cx = 0, cz = 148, y0 = r._voxelSurfaceY(cx, cz);
const lichter = [];
st.scene.traverse((o) => { if (o.isLight && o.shadow) lichter.push(o); });
if (st.csmNode && st.csmNode.lights) for (const l of st.csmNode.lights) if (l && l.shadow && !lichter.includes(l)) lichter.push(l);
const cam = st.camera, W = 480, H = 270;
const er = V.e * Math.PI / 180, az = (V.az || 0) * Math.PI / 180, L0 = new T.Vector3(Math.sin(az) * Math.cos(er), Math.sin(er), Math.cos(az) * Math.cos(er));
const schuss = async (staerke) => {
  for (const l of lichter) l.shadow.intensity = staerke;
  window.__buehne();
  const dl0 = st.directionalLight; dl0.position.copy(dl0.target.position).addScaledVector(L0, 200); dl0.updateMatrixWorld(true);
  if (st.windUniforms && st.windUniforms.uSunDir) st.windUniforms.uSunDir.value.copy(L0);
  cam.position.set(cx, y0 + 25, cz + 0.01); cam.lookAt(cx, y0, cz); cam.updateMatrixWorld(true);
  if (st.playerMesh) st.playerMesh.visible = false;
  let auf = null;
  for (let i = 0; i < 3; i++) { r._schattenAlleNeu(); auf = await window.__ausgabeAufnahme(W, H, 1); }
  return auf.u8;
};
let an, aus;
try { an = await schuss(1); aus = await schuss(0); } finally { for (const l of lichter) l.shadow.intensity = 1; }
cam.updateProjectionMatrix();
const Y = (u, i) => 0.2126 * u[i] + 0.7152 * u[i + 1] + 0.0722 * u[i + 2];
const va = [], vb = [];
const v = new T.Vector3();
for (let i = 0; i < 40; i++) for (let j = 0; j < 40; j++) {
  const x = -12 + (24 * (i + 0.5)) / 40, z = 136 + (24 * (j + 0.5)) / 40;
  v.set(x, r._voxelSurfaceY(x, z), z).project(cam);
  const px = Math.round((v.x * 0.5 + 0.5) * (W - 1)), py = Math.round((-v.y * 0.5 + 0.5) * (H - 1));
  if (px < 0 || py < 0 || px >= W || py >= H) continue;
  const k = (py * W + px) * 4;
  va.push(Y(an, k)); vb.push(Y(aus, k));
}
const med = (a) => { const b = a.slice().sort((p, q) => p - q); return b[b.length >> 1]; };
const flecken = (a) => { const m = med(a); return a.filter((w) => Math.abs(w - m) > 0.25 * Math.max(m, 4)).length / a.length; };
const cv = (a) => { const m = a.reduce((p, q) => p + q, 0) / a.length; return Math.sqrt(a.reduce((p, q) => p + (q - m) ** 2, 0) / a.length) / Math.max(m, 1e-3); };
const e = 0.5, hx = r._voxelSurfaceY(cx + e, cz) - r._voxelSurfaceY(cx - e, cz), hz = r._voxelSurfaceY(cx, cz + e) - r._voxelSurfaceY(cx, cz - e);
const nrm = new T.Vector3(-hx, 2 * e, -hz).normalize();
if (V.bild) {
  const png = (u) => { const c = document.createElement("canvas"); c.width = W; c.height = H; const x = c.getContext("2d"); const d = x.createImageData(W, H); d.data.set(u); x.putImageData(d, 0, 0); return c.toDataURL("image/png"); };
  return { an: png(an), aus: png(aus) };
}
return { e: V.e, az: V.az || 0, NdotL: +nrm.dot(L0).toFixed(3), proben: va.length, medianAn: +med(va).toFixed(1), medianAus: +med(vb).toFixed(1), fleckenAn: +flecken(va).toFixed(4), fleckenAus: +flecken(vb).toFixed(4), cvAn: +cv(va).toFixed(3), cvAus: +cv(vb).toFixed(3) };
