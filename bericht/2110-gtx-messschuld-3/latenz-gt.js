const warte = (ms) => new Promise((res) => setTimeout(res, ms));
const st = r.state, p = st.playerMesh.position, hh = (x, z) => r.getTerrainHeightAt(x, z);
const reich = r.constructor.MOUNT_RANGE_M;
const x = p.x + 2.6, z = p.z;
const e = r.spawnArchitecture("fahrzeug_gt", { x, y: hh(x, z) + 0.5, z }, { silent: true, precise: true, rotationY: 0 });
if (!e) return { fehler: "GT nicht gesetzt" };
const t0 = performance.now();
while (!e.instanced && !e.mesh && performance.now() - t0 < 45000) {
    r._rebuildArchitectureMesh(e);
    await warte(200);
}
// Probe der Reichweite ohne Taste: aufsitzen und absitzen über denselben Pfad wie E
const auf = r.toggleMountAtPlayer();
const ab = r.toggleMountAtPlayer();
return { reich, gt: [+x.toFixed(1), +z.toFixed(1)], abstand: +Math.hypot(x - p.x, z - p.z).toFixed(2), mesh: !!(e.instanced || e.mesh), auf: auf && auf.ok, ab: !!ab, spieler: [p.x, p.z].map((v) => +v.toFixed(1)) };
