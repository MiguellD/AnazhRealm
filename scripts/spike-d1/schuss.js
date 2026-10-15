// Schuss unter EINER festen Uhr (opt.fest) aus dem Ausgabe-Pfad; MODUS = "name|px,py,pz,lx,ly,lz" (Höhen mit + relativ zum Boden)
const [name, pose] = MODUS.split("|");
const k = pose.split(",");
const boden = (x, z, v) => (v[0] === "+" ? r._voxelSurfaceY(x, z) + Number(v.slice(1)) : Number(v));
const px = +k[0], pz = +k[2], lx = +k[3], lz = +k[5];
const py = boden(px, pz, k[1]), ly = boden(lx, lz, k[4]);
const rend = r.state.renderer;
rend.setAnimationLoop(null);
const cam = r.state.camera;
cam.position.set(px, py, pz);
cam.lookAt(lx, ly, lz + 1e-4);
cam.updateMatrixWorld(true);
window.__buehne();
if (r.state.playerMesh) r.state.playerMesh.visible = false;
const ziel = { x: lx, y: ly, z: lz, name: "Blickziel" };
let auf = null;
for (let i = 0; i < 2; i++) {
  try { if (r.state.fernRing && typeof r._tickFeldPass === "function") r._tickFeldPass(r.state.fernRing); } catch (_e) {}
  r._schattenAlleNeu();
  try { auf = await window.__ausgabeAufnahme(960, 540, 1, { ziel, wahl: 0, fest: 1000000 }); } catch (e) { auf = { fehler: String(e.message || e).slice(0, 200) }; }
}
if (!auf || !auf.u8) return { fehler: auf && auf.fehler };
const D = window.__d1bilder || (window.__d1bilder = {});
D[name] = auf.u8.slice();
window.__letzteAufnahme = auf.u8;
return { name, zeile: auf.abnahme && auf.abnahme.zeile ? String(auf.abnahme.zeile).slice(0, 160) : null, png: !!auf.png };
