window.__tiereHalten && window.__tiereHalten();
// DER MENSCH DER WELT als eigene Figur (die Bild-Bühne blendet den Spieler-Leib aus): der Wirts-Guss `_buildHumanoidRig` mit
// den Labor-Dials (START_PARAMS, Haut karamell, Haar darkbrown) — derselbe Ofen-Guss wie das Labor, in Welt-Maß
const K = window.__koerperCore;
let figur = r.__lwmFigur;
if (!figur) {
  const rig = r._buildHumanoidRig({ bmDials: Object.assign({}, K.START_PARAMS), skinColor: K.SKIN_TONES[K.START_PARAMS.skinTone].hex >>> 0, hairColor: K.HAIR_COLORS[K.START_PARAMS.hairColor].base >>> 0 });
  if (!rig || !rig.mesh) return { fehler: "kein Rig" };
  figur = rig.mesh;
  const p = r.state.playerMesh.position;
  const x = p.x + 4, z = p.z + 1;
  figur.position.set(x, r._voxelSurfaceY(x, z), z);
  r.state.scene.add(figur);
  r.__lwmFigur = figur;
}
figur.updateMatrixWorld(true);
let kopf = null; figur.traverse((o) => { if (!kopf && o.name === "head") kopf = o; });
const k = new T.Vector3(); (kopf || figur).getWorldPosition(k);
const q = figur.getWorldQuaternion(new T.Quaternion());
// die Pose der Labor-Sonde: Kopf + (0,45 · 0,08 · 1)·1,82 m im Leib-Rahmen, Blick auf Kopf − 0,75 m
const camW = k.clone().add(new T.Vector3(0.45, 0.08, 1.0).normalize().applyQuaternion(q).multiplyScalar(1.82));
const zielW = k.clone().add(new T.Vector3(0, -0.75, 0));
let tris = 0, sichtbar = 0; figur.traverse((o) => { if (o.isMesh && o.geometry && o.geometry.index) { tris += o.geometry.index.count / 3; if (o.visible) sichtbar++; } });
return { cam: [camW.x, camW.y, camW.z], ziel: [zielW.x, zielW.y, zielW.z], kopf: [k.x, k.y, k.z], fuss: figur.position.y, hatKopf: !!kopf, tris, meshes: sichtbar };
