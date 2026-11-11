const st = r.state, A = r.constructor, cam = st.camera;
const pm = st.playerMesh.position;
const D = A.LOD_DISTANCES, ref = st.lodRef > 0 ? st.lodRef : D.lodRef;
const fwd = new T.Vector3(0, 0, -1).applyQuaternion(cam.quaternion).setY(0).normalize();
const halb = Math.atan(Math.tan((A.KAM_FOV_GRAD * Math.PI) / 360) * (1920 / 1080));
const imBlick = (x, z) => { const dx = x - pm.x, dz = z - pm.z, d = Math.hypot(dx, dz); return d < 1 || Math.acos(Math.max(-1, Math.min(1, (dx * fwd.x + dz * fwd.z) / d))) <= halb + 0.1; };
const aus = { pm: [pm.x, pm.z], D: [D.thresh01, D.thresh12, D.fade, D.fade0, D.hysteresis, ref], eintraege: [], zellen: [] };
for (const e of st.architecture || []) {
    const p = r._foundryEnabled() ? r._foundryPresetForEntry(e) : null;
    if (!p || !r._foundryPresetIsTree(p)) continue;
    const d = Math.hypot(e.position.x - pm.x, e.position.z - pm.z);
    aus.eintraege.push([p, +d.toFixed(1), +(r._lodTreeVisHeight(e) || 0).toFixed(1), e._lodLevel, e._occluded ? 1 : 0, imBlick(e.position.x, e.position.z) ? 1 : 0, +(e.scale || 1).toFixed(2)]);
}
for (const reg of (st.scatterRegions || new Map()).values()) for (const c of (reg && reg.cells) || []) {
    const layer = r._scatterLayerByName && r._scatterLayerByName.get(c.layer);
    if (!layer || layer.kind !== "tree") continue;
    const tf = r._scatterCellTransform(c.cellX, c.cellZ, c.cellM, layer.scaleBase, layer.scaleVar);
    const d = Math.hypot(c.x - pm.x, c.z - pm.z);
    let h = null; try { h = r._scatterSichtHoehe(layer, c.species, c.cellX, c.cellZ, c.variantIndex, tf); } catch (_e) {}
    aus.zellen.push([r._foundryPresetFor(c.species), +d.toFixed(1), h == null ? null : +h.toFixed(1), c.lod, c.form || "", imBlick(c.x, c.z) ? 1 : 0, +(tf.scale || 1).toFixed(2)]);
}
return aus;
