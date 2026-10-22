window.__zielen = async (ziel) => {
    // ziel: {x,y,z} Welt-Punkt ODER {hoch: dy} (Blick nach oben, Anteil y der Richtung)
    const r = window.anazhRealm, st = r.state, cam = st.camera;
    const raf = () => new Promise((f) => requestAnimationFrame(f));
    const mess = async () => { await raf(); await raf(); const p = cam.getWorldPosition(st.playerMesh.position.clone()); const d = cam.getWorldDirection(st.playerMesh.position.clone()); return { p, d, h: Math.atan2(d.x, d.z), v: Math.asin(Math.max(-1, Math.min(1, d.y))) }; };
    const wrap = (a) => Math.atan2(Math.sin(a), Math.cos(a));
    for (let it = 0; it < 4; it++) {
        const m0 = await mess();
        let hz, vz;
        if (ziel.hoch != null) { hz = m0.h; vz = Math.asin(ziel.hoch); }
        else { const dx = ziel.x - m0.p.x, dy = ziel.y - m0.p.y, dz = ziel.z - m0.p.z; hz = Math.atan2(dx, dz); vz = Math.atan2(dy, Math.hypot(dx, dz)); }
        const y0 = st.yaw, p0 = st.pitch;
        st.yaw = y0 + 0.1; const m1 = await mess(); const sy = Math.sign(wrap(m1.h - m0.h)) || 1;
        st.yaw = y0; st.pitch = p0 + 0.05; const m2 = await mess(); const sp = Math.sign(m2.v - m0.v) || 1;
        st.yaw = y0 + sy * wrap(hz - m0.h); st.pitch = p0 + sp * (vz - m0.v);
    }
    const m = await mess();
    return { yaw: st.yaw, pitch: st.pitch, dir: [m.d.x, m.d.y, m.d.z].map((v) => +v.toFixed(3)) };
};
// ein Tier d m vor dem Spieler setzen (gehalten), das Fadenkreuz auf seine Mitte; zurück: trifft der Pick des Spiels es?
window.__zielTier = async (d, hoch) => {
    const r = window.anazhRealm, st = r.state, pm = st.playerMesh.position;
    if (window.__hsTier) { try { r.removeCreature(window.__hsTier); } catch (_e) {} window.__hsTier = null; }
    const dv = st.camera.getWorldDirection(pm.clone()); const l = Math.hypot(dv.x, dv.z) || 1;
    const x = pm.x + (dv.x / l) * d, z = pm.z + (dv.z / l) * d;
    const c = r.spawnCreatureAt(x, r._voxelSurfaceY(x, z) + 0.5, z, "happy");
    window.__hsTier = c;
    for (let i = 0; i < 40; i++) await new Promise((f) => requestAnimationFrame(f));
    if (window.__tiereHalten) window.__tiereHalten();
    c.position.set(x, r._voxelSurfaceY(x, z) + (c.position.y - r._voxelSurfaceY(c.position.x, c.position.z)), z); // der Spawn rückt ≥ 3 m ab: das Tier an den Ort des Versuchs
    for (let i = 0; i < 6; i++) await new Promise((f) => requestAnimationFrame(f));
    const box = new (st.playerMesh.position.constructor)();
    c.updateMatrixWorld(true);
    let mitte = (r._leibMitte && r._leibMitte(c)) || null;
    if (!mitte) { const b = { min: [1e9, 1e9, 1e9], max: [-1e9, -1e9, -1e9] }; c.traverse((o) => { if (o.isMesh && o.geometry) { o.geometry.computeBoundingBox(); const bb = o.geometry.boundingBox.clone().applyMatrix4(o.matrixWorld); for (let k = 0; k < 3; k++) { b.min[k] = Math.min(b.min[k], bb.min.getComponent(k)); b.max[k] = Math.max(b.max[k], bb.max.getComponent(k)); } } }); mitte = box.set((b.min[0] + b.max[0]) / 2, (b.min[1] + b.max[1]) / 2, (b.min[2] + b.max[2]) / 2); }
    const blick = await window.__zielen(hoch != null ? { hoch } : { x: mitte.x, y: mitte.y, z: mitte.z });
    const p = r._pickCreatureAtCrosshair();
    return { d: +Math.hypot(c.position.x - pm.x, c.position.z - pm.z).toFixed(2), art: c.userData && (c.userData.soulName || c.userData.name), pick: !!(p && p.creature === c), blick };
};
