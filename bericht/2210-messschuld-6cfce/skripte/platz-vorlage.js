// M32: der Spieler am Rand des Dorfplatzes des Start-Dorfs (derselbe Stand wie die Linse `bewohner`), Third, die Uhr als
// Spieler-Wort (processChatCommand „setze uhrzeit <t>"), der Spiel-Loop läuft 12 s; gezählt: Leiber (rig, heim) im Frustum der
// Spiel-Kamera, gezeichnet (Leib, Satz oder Feld), Sichtlinie frei von Hausgrundrissen, und die davon in 8 s ≥ 0,5 m gingen.
const s = r.state, wm = s.worldMeta, pm = s.playerMesh.position, A = r.constructor;
const zelle = wm.settlementCells && wm.settlementCells.start;
if (!zelle) return { fehler: "kein Start-Dorf" };
const plan = [...(r._ortPlaene || new Map()).values()].find((v) => v && v.ort && Math.abs(v.ort.x - zelle.x) < 0.5 && Math.abs(v.ort.z - zelle.z) < 0.5);
if (!plan) return { fehler: "kein Plan" };
const pz = plan.platz, pc = { x: plan.ort.x + pz.cx, z: plan.ort.z + pz.cz };
const lang = pz.ex >= pz.ez ? 0 : Math.PI / 2;
let stand = null;
for (const k of [0, 4, 2, -2, 1, 3, -1, -3]) for (const plus of [2, 5, 9]) {
    if (stand) break;
    const da = (k * Math.PI) / 4, a = (pz.phi || 0) + lang + da;
    const ex = Math.abs(Math.cos(da)) * pz.ex + Math.abs(Math.sin(da)) * pz.ez + plus;
    const x = pc.x - Math.cos(a) * ex, z = pc.z + Math.sin(a) * ex;
    const g = r._imGrundriss(x, z, 0.5);
    if (g !== "haus" && g !== "bau" && r._landAt(x, z)) stand = { x, z };
}
if (!stand) return { fehler: "kein Stand" };
const loop = (an) => s.renderer.setAnimationLoop(an ? (t) => r._gameLoopTick(t) : null);
const raf = () => new Promise((f) => requestAnimationFrame(f));
const schlaf = (ms) => new Promise((f) => setTimeout(f, ms));
loop(true);
r.processChatCommand("setze uhrzeit " + UHR_T);
const hS = r.getTerrainHeightAt(stand.x, stand.z);
pm.set(stand.x, hS + A.PLAYER_FOOT_OFFSET, stand.z);
if (s._fixedSimPos) s._fixedSimPos.copy(pm);
if (s.cameraMode !== "third") r.setCameraMode("third");
// Blick auf die Platzmitte (wie zielen.js: Vorzeichen der Gier/Neigung an der echten Kamera geprüft)
const cam = s.camera;
const wrap = (a) => Math.atan2(Math.sin(a), Math.cos(a));
const mess = async () => { await raf(); await raf(); const p = cam.getWorldPosition(pm.clone()); const d = cam.getWorldDirection(pm.clone()); return { p, d, h: Math.atan2(d.x, d.z), v: Math.asin(Math.max(-1, Math.min(1, d.y))) }; };
for (let it = 0; it < 4; it++) {
    const m0 = await mess();
    const dx = pc.x - m0.p.x, dy = pm.y + 0.6 - m0.p.y, dz = pc.z - m0.p.z;
    const hz = Math.atan2(dx, dz), vz = Math.atan2(dy, Math.hypot(dx, dz));
    const y0 = s.yaw, p0 = s.pitch;
    s.yaw = y0 + 0.1; const m1 = await mess(); const sy = Math.sign(wrap(m1.h - m0.h)) || 1;
    s.yaw = y0; s.pitch = p0 + 0.05; const m2 = await mess(); const sp = Math.sign(m2.v - m0.v) || 1;
    s.yaw = y0 + sy * wrap(hz - m0.h); s.pitch = p0 + sp * (vz - m0.v);
}
for (const dl = performance.now() + 20000; performance.now() < dl && !(r._weltSteht && r._weltSteht()); ) await schlaf(200);
await schlaf(4000);
const leiber = () => s.scene.children.filter((o) => o && o.userData && o.userData.rig && o.userData.heim != null);
const gez = (b) => b.visible || b.userData._satz === true || (r._kzBesitztFeld && r._kzBesitztFeld(b));
const p0 = new Map(leiber().map((b) => [b, { x: b.position.x, z: b.position.z }]));
const t0 = performance.now(); let bilder = 0;
while (performance.now() - t0 < 8000) { await raf(); bilder++; }
const fps = +(bilder / ((performance.now() - t0) / 1000)).toFixed(1);
cam.updateMatrixWorld(true);
const fr = new T.Frustum().setFromProjectionMatrix(new T.Matrix4().multiplyMatrices(cam.projectionMatrix, cam.matrixWorldInverse));
const auge = cam.getWorldPosition(new T.Vector3());
let imBild = 0, gehend = 0, alle = 0;
for (const b of leiber()) {
    alle++;
    if (!gez(b)) continue;
    const brust = new T.Vector3(b.position.x, b.position.y + 0.4, b.position.z);
    if (!fr.containsPoint(brust)) continue;
    const d = auge.distanceTo(brust);
    let frei = true;
    for (let t = 0.6; t < d - 0.6 && frei; t += 0.5) { const k = t / d; if (r._imGrundriss(auge.x + (brust.x - auge.x) * k, auge.z + (brust.z - auge.z) * k, 0) === "haus") frei = false; }
    if (!frei) continue;
    imBild++;
    const a = p0.get(b);
    if (a && Math.hypot(b.position.x - a.x, b.position.z - a.z) >= 0.5) gehend++;
}
loop(false);
// DAS BILD aus dem Ausgabe-Pfad (Kamera des Spiels, Loop ruht, keine Bühne: die Uhr bleibt das Spieler-Wort)
const { u8 } = await window.__ausgabeAufnahme(1920, 1080);
let b64 = "";
for (let i = 0; i < u8.length; i += 0x8000) b64 += String.fromCharCode.apply(null, u8.subarray(i, i + 0x8000));
b64 = btoa(b64);
return { b64, uhr: UHR_T, tod: +s.timeOfDay.toFixed(4), sicht: s.cameraMode, stand: [+stand.x.toFixed(1), +stand.z.toFixed(1)], platz: [+pc.x.toFixed(1), +pc.z.toFixed(1)], leiber: alle, imBild, gehendImBild: gehend, fps, version: A.VERSION };
