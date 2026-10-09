const st = r.state; const T = THREE; const pm = st.playerMesh;
const o = JSON.parse(JSON.stringify(window.__strahlKam || null));
const e = (st.architectures || []).find((w) => w && w.type === "fahrzeug_supersport");
const yaw = Number.isFinite(e._rideYaw) ? e._rideYaw : Math.PI / 2;
const qx = Math.cos(yaw), qz = -Math.sin(yaw);
const fzg = r._fahrzeugGesetzFor(e); const d = fzg.drive; const basis = e.position.y - 0.5;
const cam = new T.Vector3(e.position.x + qx * 3.6, basis + d.huelle.yRoof + 0.35, e.position.z + qz * 3.6);
pm.visible = true; pm.updateMatrixWorld(true); st.scene.updateMatrixWorld(true);
const rg = pm.userData.rig; const ziel = rg.spine.getWorldPosition(new T.Vector3());
const ziele = [ziel, rg.armL.elbow.getWorldPosition(new T.Vector3()), rg.armR.elbow.getWorldPosition(new T.Vector3())];
const aus = [];
for (const z of ziele) {
  const dir = z.clone().sub(cam); const dist = dir.length(); dir.normalize();
  const rc = new T.Raycaster(cam, dir, 0, dist + 0.3);
  const hits = rc.intersectObjects(st.scene.children, true).filter((h) => h.object.visible !== false).slice(0, 6);
  aus.push({ dist: +dist.toFixed(2), hits: hits.map((h) => ({ d: +h.distance.toFixed(2), name: h.object.name || h.object.type, inst: h.instanceId, mat: h.object.material ? { t: !!h.object.material.transparent, o: h.object.material.opacity, dw: h.object.material.depthWrite, side: h.object.material.side, kind: h.object.material.userData && h.object.material.userData.foundryKind } : null, reiter: (() => { for (let n = h.object; n; n = n.parent) if (n === pm) return true; return false; })() })) });
}
return aus;
