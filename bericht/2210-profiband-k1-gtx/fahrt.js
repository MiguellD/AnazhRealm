// 2010 Bündel-ABAB Zelle FAHRT (Seiten-Code für `werkbank eval`, r = Welt; Vorlage aufsitzen.js der Radeon, 1910-omen-f1-abab):
// der GT neben dem Spieler an der Wiese, aufsitzen in Third, der Fahrer sitzt an `_gameLoopTick` (beide Seiten gleich):
// Gas bis 10 m/s, Bremse über 12 m/s, Lenkung A in jedem 3. Takt (weiter Kreis, damit 8–12 m/s erreichbar sind); steht er
// 20 Takte (< 0,5 m/s), 40 Takte rückwärts (S + D). DER WECHSEL in voller Fahrt: je 240 Takte 120 Third → 120 Ego (`first`),
// nur wenn v ≥ 8 m/s (sonst bleibt die Sicht, bis die Fahrt wieder voll ist). Der Haken bleibt für den folgenden `lauf` stehen;
// `fahrt-pruef.js` liest Weg, v-Verteilung und die Zahl der Wechsel.
const st = r.state;
const p = st.playerMesh.position;
const H = (x, z) => r.getTerrainHeightAt(x, z);
const e = r.spawnArchitecture("fahrzeug_gt", { x: p.x + 3, y: H(p.x + 3, p.z) + 0.5, z: p.z }, { silent: true, precise: true });
const takt = async (n) => {
    for (let i = 0; i < n; i++) {
        await new Promise(requestAnimationFrame);
        r._gameLoopTick(performance.now());
    }
};
const roh = r._gameLoopTick;
const F = (window.__fahrt = { weg: 0, n: 0, wechsel: 0, ego: 0, v: [], zyklus: 0, an: false });
let [steht, zurueck, px, pz] = [0, 0, e.position.x, e.position.z];
r._gameLoopTick = function (t) {
    const v = Math.hypot(st.playerVel.x(), st.playerVel.z());
    if (zurueck > 0) {
        zurueck--;
        [st.keys.w, st.keys.s, st.keys.a, st.keys.d] = [false, true, false, true];
    } else {
        steht = v < 0.5 ? steht + 1 : 0;
        if (steht > 20) [zurueck, steht] = [40, 0];
        [st.keys.w, st.keys.s, st.keys.a, st.keys.d] = [v < 10, v > 12, F.n % 3 === 0, false];
    }
    if (F.an) {
        F.zyklus++;
        const soll = F.zyklus % 240 < 120 ? "third" : "first";
        if (soll !== st.cameraMode && v >= 8) {
            r.setCameraMode(soll);
            F.wechsel++;
        }
        if (st.cameraMode === "first") F.ego++;
        F.v.push(v);
    }
    F.weg += Math.hypot(e.position.x - px, e.position.z - pz);
    [px, pz] = [e.position.x, e.position.z];
    F.n++;
    return roh.call(this, t);
};
return (async () => {
    let n = 0;
    for (; n < 600 && e && !e.instanced && !e.mesh; n++) {
        if (n % 30 === 0) r._rebuildArchitectureMesh(e);
        await takt(1);
    }
    r.setCameraMode("third");
    const mr = r.mountArchitecture(e);
    await takt(180);
    Object.assign(F, { weg: 0, wechsel: 0, ego: 0, v: [], zyklus: 0, an: true });
    return { ok: !!(mr && mr.ok), inst: !!(e && e.instanced), takte: n, pos: [Math.round(e.position.x), Math.round(e.position.z)], v: +Math.hypot(st.playerVel.x(), st.playerVel.z()).toFixed(1), sicht: st.cameraMode };
})();
