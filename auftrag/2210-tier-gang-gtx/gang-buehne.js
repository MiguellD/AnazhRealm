// vier Gattungen gehen im Schritt (v^ 0,5) nebeneinander längs +x auf dem Boden der Welt; der Loop ruht, der Gang wird
// durch den echten Chokepoint gestellt (_animateCompoundMotion), dann steht das Bild an dieser Pose
const s = r.state, pm = s.playerMesh.position, h = (x, z) => r.getTerrainHeightAt(x, z);
s.renderer.setAnimationLoop(null);
const core = window.__tetrapodaCore, out = [];
(window.__gangTiere || []).forEach((c) => r.removeCreature(c));
window.__gangTiere = [];
const VH = Number(window.__gangVH || 0.5);
["wolf", "fuchs", "baer", "wesen"].forEach((seele, n) => {
    const x0 = pm.x - 3 + n * 3.2, z0 = pm.z + 24;
    const save = s.maxCreatures; s.maxCreatures = Math.max(save || 0, s.creatures.length + 4);
    const cr = r.spawnCreatureAt(x0, h(x0, z0) + 0.3, z0, "happy", seele, { precise: true, bodySize: 1 });
    s.maxCreatures = save;
    if (!cr) return out.push(seele + ": kein Spawn");
    window.__gangTiere.push(cr);
    cr.userData.task = { name: "wait", args: {}, since: 0 };
    cr.userData.emotions = null;
    cr.rotation.set(0, Math.PI / 2, 0);
    cr.userData._animFade = 1;
    const tb = cr.userData._tierBaum, roles = r._motionRolesForSoul(cr.userData.soul);
    const L = tb.beinL * (cr.scale.x || 1), v = VH * Math.sqrt(9.81 * L);
    let t = 0;
    cr.position.x = x0 - v * 4.3;
    for (let i = 0; i < 258 + n * 7; i++) {
        cr.position.x += v / 60;
        const y = h(cr.position.x, cr.position.z);
        cr.position.y = y; cr.userData._traegerY = y; cr.userData._traegerStruktur = false;
        r._animateCompoundMotion(cr, roles, (t += 1 / 60), 0, true, null);
    }
    cr.updateMatrixWorld(true);
    out.push(`${seele} x ${cr.position.x.toFixed(1)} z ${cr.position.z.toFixed(1)} y ${cr.position.y.toFixed(2)} v ${v.toFixed(2)} art ${tb._gang.art || "?"}`);
});
return out.join(" | ");
