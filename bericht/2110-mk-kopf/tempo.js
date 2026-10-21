// mk-2110 Fahrzeug K3 (Welt): der GT auf ebenem Grund nahe der Mess-Wiese, Third, Vollgas geradeaus (W) — je Bild v, camera.fov,
// Arm (Kamera <-> Wagen-Mitte), Ruhe = 60 Bilder im Stand nach dem Aufsitzen; Schüsse über den Ausgabe-Pfad im Stand und bei vmax.
const st = r.state;
const T = window.THREE;
const rend = st.renderer;
const warte = (ms) => new Promise((res) => setTimeout(res, ms));
const hh = (x, z) => r.getTerrainHeightAt(x, z);
const W0 = window.__messWiese || [-278, -1038];
const ort = window.__weltOrt("eben", { mitte: W0, r: 12, spanne: 1.2 });
if (!ort) return { fehler: "kein ebener Ort" };
const loopAn = () => rend.setAnimationLoop((t) => r._gameLoopTick(t));
const loopAus = () => rend.setAnimationLoop(null);
st.playerMesh.position.set(ort.x, hh(ort.x, ort.z) + 2, ort.z);
if (st.playerVel) st.playerVel.setValue(0, 0, 0);
loopAn();
const tw0 = performance.now();
await warte(1500);
while (performance.now() - tw0 < 60000 && !(typeof r._weltSteht === "function" && r._weltSteht())) await warte(100);
const weltStandS = +((performance.now() - tw0) / 1000).toFixed(1);
// freie Richtung: die Richtung mit dem geringsten Höhenhub über 150 m
let best = null;
for (let k = 0; k < 16; k++) {
    const a = (k / 16) * Math.PI * 2;
    let hub = 0;
    for (let d = 10; d <= 150; d += 10) hub = Math.max(hub, Math.abs(hh(ort.x + Math.sin(a) * d, ort.z + Math.cos(a) * d) - hh(ort.x, ort.z)));
    if (!best || hub < best.hub) best = { a, hub };
}
const e = r.spawnArchitecture("fahrzeug_gt", { x: ort.x, y: hh(ort.x, ort.z) + 0.5, z: ort.z }, { silent: true, precise: true, rotationY: best.a - Math.PI / 2 });
if (!e) return (loopAus(), { fehler: "GT nicht gesetzt" });
const tb0 = performance.now();
while (!e.instanced && !e.mesh && performance.now() - tb0 < 45000) {
    r._rebuildArchitectureMesh(e);
    await warte(200);
}
r.setCameraMode("third");
const mr = r.mountArchitecture(e);
if (!mr || !mr.ok) return (loopAus(), { fehler: "Aufsitzen misslang", mr });
const H = { phase: "ruhe", n: 0, halt: null, spur: [] };
const roh = r._gameLoopTick;
r._gameLoopTick = function (t) {
    st.keys.w = H.phase === "gas";
    st.keys.s = st.keys.a = st.keys.d = false;
    const erg = roh.call(this, t);
    H.n++;
    const v = st.playerVel ? Math.hypot(st.playerVel.x(), st.playerVel.z()) : 0;
    const c = st.camera.position;
    const arm = Math.hypot(c.x - e.position.x, c.y - e.position.y, c.z - e.position.z);
    H.spur.push([H.phase, H.n, +v.toFixed(2), +st.camera.fov.toFixed(2), +arm.toFixed(2)]);
    if (H.phase === "ruhe" && H.n === 60) H.halt = "ruhe";
    else if (H.phase === "gas") {
        const s = H.spur.filter((p) => p[0] === "gas");
        const vs = s.slice(-60).map((p) => p[2]);
        if (H.n >= 900 || (H.n > 240 && Math.max(...vs) - Math.min(...vs) < 0.1)) H.halt = "vmax";
    }
    if (H.halt) rend.setAnimationLoop(null);
    return erg;
};
const bilder = [];
const schuss = async (name) => {
    const c = st.camera.position;
    const v = st.playerVel ? Math.hypot(st.playerVel.x(), st.playerVel.z()) : 0;
    const zahl = { name, sicht: st.cameraMode, v: +v.toFixed(2), fov: +st.camera.fov.toFixed(2), armM: +Math.hypot(c.x - e.position.x, c.y - e.position.y, c.z - e.position.z).toFixed(2) };
    if (st.traaNode) st.traaNode._jitterIndex = 0;
    try {
        const auf = await window.__ausgabeAufnahme(1920, 1080, 1, { satz: "messung" });
        const cv = document.createElement("canvas");
        [cv.width, cv.height] = [1920, 1080];
        const ctx = cv.getContext("2d");
        const img = ctx.createImageData(1920, 1080);
        img.data.set(auf.u8.subarray(0, 1920 * 1080 * 4));
        ctx.putImageData(img, 0, 0);
        zahl.jpg = cv.toDataURL("image/jpeg", 0.85);
    } catch (x) {
        zahl.fehler = String(x && x.message).slice(0, 200);
    }
    bilder.push(zahl);
};
const bisHalt = async (ms) => {
    const t0 = performance.now();
    while (!H.halt && performance.now() - t0 < ms) await warte(5);
    const h = H.halt;
    H.halt = null;
    return h;
};
let ende = "ok";
try {
    loopAn();
    if (await bisHalt(30000)) await schuss("1-stand");
    [H.phase, H.n] = ["gas", 0];
    loopAn();
    if (await bisHalt(60000)) await schuss("2-vmax");
} catch (x) {
    ende = String(x && x.message);
} finally {
    loopAus();
    delete r._gameLoopTick;
    for (const k of ["w", "a", "s", "d"]) st.keys[k] = false;
}
const ruhe = H.spur.filter((p) => p[0] === "ruhe").slice(-10);
const gas = H.spur.filter((p) => p[0] === "gas");
const top = gas.reduce((a, p) => (p[2] > a[2] ? p : a), gas[0] || [0, 0, 0, 0, 0]);
const fov0 = ruhe.length ? ruhe[ruhe.length - 1][3] : null;
const arm0 = ruhe.length ? ruhe.reduce((s, p) => s + p[4], 0) / ruhe.length : null;
const fahr = e._fahrSatz || null;
const res = {
    ende, ort: { x: +ort.x.toFixed(1), z: +ort.z.toFixed(1) }, richtungHubM: +best.hub.toFixed(2), weltStandS, mount: !!(mr && mr.ok),
    vmaxGesetz: fahr && fahr.vmax != null ? fahr.vmax : null, ruhe: { fov: fov0, armM: arm0 && +arm0.toFixed(2) },
    top: { v: top[2], fov: top[3], armM: top[4], fovPlus: fov0 != null ? +(top[3] - fov0).toFixed(2) : null, armPlus: arm0 ? +(top[4] / arm0 - 1).toFixed(3) : null },
    fovMaxGas: Math.max(...gas.map((p) => p[3])), bilder, spurN: H.spur.length, spurAuszug: H.spur.filter((_s, i) => i % 20 === 0)
};
try { r.dismountArchitecture(); r.removeArchitecture(e); } catch (_x) {}
return res;
