const st = r.state;
const p = st.playerMesh.position;
const H = (x, z) => r.getTerrainHeightAt(x, z);
const e = r.spawnArchitecture("fahrzeug_gt", { x: p.x + 3, y: H(p.x + 3, p.z) + 0.5, z: p.z }, { silent: true, precise: true });
const takt = async (n) => { for (let i = 0; i < n; i++) { await new Promise(requestAnimationFrame); r._gameLoopTick(performance.now()); } };
// DER FAHRER (beide Seiten gleich): Kreis mit A, Gas bis 6 m/s; steht er 20 Takte (< 0,5 m/s), 40 Takte rückwärts (S + D)
const roh = r._gameLoopTick;
let [steht, zurueck, weg, px, pz] = [0, 0, 0, e.position.x, e.position.z];
r._gameLoopTick = function (t) {
    const v = Math.hypot(st.playerVel.x(), st.playerVel.z());
    if (zurueck > 0) { zurueck--; [st.keys.w, st.keys.s, st.keys.a, st.keys.d] = [false, true, false, true]; }
    else { steht = v < 0.5 ? steht + 1 : 0; if (steht > 20) { zurueck = 40; steht = 0; } [st.keys.w, st.keys.s, st.keys.a, st.keys.d] = [v < 6, false, true, false]; }
    weg += Math.hypot(e.position.x - px, e.position.z - pz); [px, pz] = [e.position.x, e.position.z];
    window.__fahrWeg = weg;
    return roh.call(this, t);
};
return (async () => {
    let n = 0;
    for (; n < 600 && e && !e.instanced && !e.mesh; n++) { if (n % 30 === 0) r._rebuildArchitectureMesh(e); await takt(1); }
    r.setCameraMode("third");
    const mr = r.mountArchitecture(e);
    await takt(60);
    window.__fahrWeg = weg = 0;
    return { ok: !!(mr && mr.ok), inst: !!(e && e.instanced), takte: n, pos: [Math.round(e.position.x), Math.round(e.position.z)], v: +Math.hypot(st.playerVel.x(), st.playerVel.z()).toFixed(1), sicht: st.cameraMode };
})();
