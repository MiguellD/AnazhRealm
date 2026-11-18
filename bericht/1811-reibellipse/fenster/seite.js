// seite.js — der Rumpf in der Seite (r, st, halt aus welt-boot): die Reibellipse am GT im echten Takt der Welt (60 Hz von Hand).
// window.__rb hält Uhr und Strecke über die Rufe. Jede Fahrt: frischer GT, 15 m/s, Tasten gehalten, Spur je Bild.
module.exports = {
    vor: `
const B = (window.__rb = window.__rb || { t: performance.now() });
const VC = window.__vehicleCore, f = r._ensureAssetFoundry();
await __weltDa(() => f && f.ready && f.recipes && f.recipes.gt && st.blueprints && st.blueprints.fahrzeug_gt);
const hh = (a, b) => r.getTerrainHeightAt(a, b);
const nass = (a, b) => { const ws = r._atlasWaterLevelAt(a, b, hh(a, b)); return Number.isFinite(ws) && ws > hh(a, b) - 0.3; };
const p0 = st.playerMesh.position, kand = [];
for (let x = p0.x - 480; x <= p0.x + 480; x += 24) for (let z = p0.z - 480; z <= p0.z + 480; z += 24) {
    let lo = 1e9, hi = -1e9, n = false;
    for (let a = -10; a <= 110 && !n; a += 10) for (let q = -30; q <= 30; q += 10) { const y = hh(x + a, z + q); if (y < lo) lo = y; if (y > hi) hi = y; if (nass(x + a, z + q)) { n = true; break; } }
    if (!n) kand.push([+(hi - lo).toFixed(2), x, z]);
}
kand.sort((a, b) => a[0] - b[0]);
B.strecke = kand.length ? { x: kand[0][1], z: kand[0][2], stufe: kand[0][0], beste: kand.slice(0, 4) } : null;
const ufer = [];
for (let x = p0.x - 600; x <= p0.x + 600; x += 6) for (let z = p0.z - 600; z <= p0.z + 600; z += 6) {
    const y = hh(x, z), ws = r._atlasWaterLevelAt(x, z, y); if (!Number.isFinite(ws)) continue; const d = ws - y; if (d < 0.5 || d > 1.1) continue;
    const gx = (hh(x + 2, z) - hh(x - 2, z)) / 4, gz = (hh(x, z + 2) - hh(x, z - 2)) / 4, g = Math.hypot(gx, gz);
    if (g >= 0.2 && g <= 0.7) ufer.push([+g.toFixed(3), x, z, +d.toFixed(2), +(Math.atan2(-gx, -gz)).toFixed(3)]);
}
ufer.sort((a, b) => b[0] - a[0]);
B.ufer = ufer.length ? { g: ufer[0][0], x: ufer[0][1], z: ufer[0][2], tiefe: ufer[0][3], bergab: ufer[0][4], zahl: ufer.length } : null;
let fahrKeys = null; try { fahrKeys = VC && VC.FAHR ? Object.keys(VC.FAHR).slice(0, 60) : (VC ? Object.keys(VC).slice(0, 60) : null); } catch (_e) {}
return { strecke: B.strecke, ufer: B.ufer, spieler: [p0.x, p0.y, p0.z], fahrKeys };`,
    ufer2: `
const B = window.__rb, hh = (a, b) => r.getTerrainHeightAt(a, b);
const frame = () => { B.t += 1000 / 60; r._gameLoopTick(B.t); };
// die Ansaugung des GT: am gesetzten, bestiegenen Wagen gelesen (sein Fahr-Satz, vehicle:fahrGesetz)
const sx = B.strecke.x, sz = B.strecke.z;
st.playerMesh.position.set(sx, hh(sx, sz) + 1.2, sz); st.playerVel.setValue(0, 0, 0);
for (let i = 0; i < 30; i++) frame();
const e = r.spawnArchitecture("fahrzeug_gt", { x: sx, y: hh(sx, sz) + 0.5, z: sz }, { silent: true, precise: true, rotationY: 0 });
await __gebautNach(e); r.mountArchitecture(e); for (let i = 0; i < 12; i++) frame();
const Wg = e._fahrSatz && e._fahrSatz.wasser ? JSON.parse(JSON.stringify(e._fahrSatz.wasser)) : null;
const yRad = e._fahr ? e._fahr.y - hh(e._fahr.x, e._fahr.z) : null;
r.dismountArchitecture(); r.removeArchitecture(e); for (let i = 0; i < 10; i++) frame();
if (!Wg || !(Wg.ansaug > 0)) return { fehler: "kein Wasser-Mass am GT", Wg };
const an = Wg.ansaug + (yRad || 0), ufer = []; let maxT = 0, nass = 0;
for (let x = -1200; x <= 1200; x += 4) for (let z = -1200; z <= 1200; z += 4) {
    const y = hh(x, z), ws = r._atlasWaterLevelAt(x, z, y); if (!Number.isFinite(ws)) continue; const d = ws - y; if (d > 0) nass++; if (d > maxT) maxT = d; if (d < an + 0.05 || d > an + 1.5) continue;
    const gx = (hh(x + 2, z) - hh(x - 2, z)) / 4, gz = (hh(x, z + 2) - hh(x, z - 2)) / 4, g = Math.hypot(gx, gz);
    if (g >= 0.03) ufer.push([+g.toFixed(3), x, z, +d.toFixed(2), +(Math.atan2(-gx, -gz)).toFixed(3)]);
}
ufer.sort((a, b) => Math.abs(a[0] - 0.577) - Math.abs(b[0] - 0.577));
return { wasser: Wg, yRad, zahl: ufer.length, nass, maxTiefe: +maxT.toFixed(2), ufer: ufer.slice(0, 3).map((u) => ({ g: u[0], x: u[1], z: u[2], tiefe: u[3], bergab: u[4] })) };`,
    // eine Fahrt: o = { name, ort: [x, z], fahrt (rad; sin → x, cos → z), v, tasten: {…}, sek, stoppBei, ruhe }
    fahrt: (o) => `
const B = window.__rb, O = ${JSON.stringify(o)};
const frame = () => { B.t += 1000 / 60; r._gameLoopTick(B.t); };
const hh = (a, b) => r.getTerrainHeightAt(a, b);
const aus = () => { for (const k of ["vor", "links", "zurueck", "rechts", "sprint", "jump"]) halt[k] = false; };
const [x, z] = O.ort;
st.playerMesh.position.set(x, hh(x, z) + 1.2, z); st.playerVel.setValue(0, 0, 0);
for (let i = 0; i < 30; i++) frame();
const e = r.spawnArchitecture("fahrzeug_gt", { x, y: hh(x, z) + 0.5, z }, { silent: true, precise: true, rotationY: O.fahrt - Math.PI / 2 });
if (!e) return { fehler: "kein GT gesetzt" };
await __gebautNach(e);
const mr = r.mountArchitecture(e);
if (!mr || !mr.ok) return { fehler: "kein Aufsitzen " + JSON.stringify(mr).slice(0, 200) };
aus(); for (let i = 0; i < (O.ruhe || 12); i++) frame();
if (O.v) { e._fahr.vlong = O.v; st.playerVel.setValue(O.v * Math.sin(O.fahrt), st.playerVel.y(), O.v * Math.cos(O.fahrt)); }
Object.assign(halt, O.tasten || {});
const y0 = e._fahr.yaw, x0 = e.position.x, z0 = e.position.z, spur = [], N = Math.round(O.sek * 60);
const r3 = (v) => (Number.isFinite(v) ? Math.round(v * 1000) / 1000 : null);
const grad = (v) => r3((v * 180) / Math.PI);
const wt = (a, b) => { const y = hh(a, b), w = r._atlasWaterLevelAt(a, b, y); return Number.isFinite(w) ? r3(w - y) : null; };
let weg = 0, px = x0, pz = z0, gierMax = 0, stand = null, n = 0;
for (let i = 1; i <= N; i++) {
    frame(); n = i;
    const f = e._fahr; weg += Math.hypot(e.position.x - px, e.position.z - pz); px = e.position.x; pz = e.position.z;
    gierMax = Math.max(gierMax, Math.abs(f.yawRate || 0));
    if (stand === null && Math.abs(f.vlong) < 0.3 && Math.abs(f.vlat || 0) < 0.3 && i > 6) stand = i / 60;
    if (i % 6 === 0) spur.push([r3(i / 60), r3(e.position.x - x0), r3(e.position.z - z0), grad(f.yaw - y0), r3(f.vlong), r3(f.vlat), grad(f.yawRate), r3(f.slipF), r3(f.slipR), r3(e.position.y), r3(f.aLong), r3(f.aLat), r3(f.steer), wt(e.position.x, e.position.z), r3(r._fahrTiefe(f))]);
    if (O.stoppBei && stand !== null && i / 60 > stand + 0.5) break;
}
aus();
const F = e._fahr;
const roh = {}; for (const k of Object.keys(F)) { const v = F[k]; if (typeof v === "number" || typeof v === "boolean") roh[k] = typeof v === "number" ? r3(v) : v; }
const wsE = r._atlasWaterLevelAt(e.position.x, e.position.z, hh(e.position.x, e.position.z));
const erg = { name: O.name, spalten: "t dx dz gier° vlong vlat gierRate°/s slipF slipR y aLong aLat steer wasserTiefe huelleTiefe", spur, weg: r3(weg), sek: r3(n / 60), gierMaxGrad: grad(gierMax), stand, ende: { vlong: r3(F.vlong), vlat: r3(F.vlat), gier: grad(F.yaw - y0), wasserTiefe: Number.isFinite(wsE) ? r3(wsE - hh(e.position.x, e.position.z)) : null }, roh };
r.dismountArchitecture(); r.removeArchitecture(e); for (let i = 0; i < 10; i++) frame();
return erg;`,
};
