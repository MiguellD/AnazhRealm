// WOLKE (Leser 2, 26.11.): die Feuerstelle der Station an stadt-voll (Stadt d:7@836,438, Pose third 842/452) — dieselbe Regel wie die Station
// (Land, kein Wasser in 3 m, ±1 m eben, 7 m frei von jeder anderen Quelle um Mitternacht; der Spieler 3 m daneben), gesetzt als Werk, im
// Verzeichnis, die nächste Quelle am Spieler, dann fort. Aufruf: node ev.cjs feuer-stadt.js 120 (Werkbank 24600, main eae94514)
const st = r.state, pm = st.playerMesh.position;
const PX = 842, PZ = 452;
window.__nachtHalt && clearInterval(window.__nachtHalt);
let HX = PX, HZ = PZ;
window.__nachtHalt = setInterval(() => { pm.set(HX, r._voxelSurfaceY(HX, HZ) + 1.8, HZ); if (st.playerVel && typeof st.playerVel === "object") st.playerVel.x = st.playerVel.y = st.playerVel.z = 0; }, 10);
const halte = () => { pm.set(HX, r._voxelSurfaceY(HX, HZ) + 1.8, HZ); if (st.playerVel && typeof st.playerVel === "object") st.playerVel.x = st.playerVel.y = st.playerVel.z = 0; };
for (let i = 0; i < 20; i++) { halte(); try { r._gameLoopTick(performance.now()); } catch (_e) {} await new Promise((f) => setTimeout(f, 16)); }
halte();
const PT = pm.clone();
const uhrVor = st.timeOfDay;
window.__buehne({ uhr: 0 });
const t0 = performance.now();
const haelt = (x, z) => {
    if (!r._landAt(x, z, 0.4)) return false;
    let lo = Infinity, hi = -Infinity;
    for (let k = 0; k <= 8; k++)
        for (const rad of k === 8 ? [0] : [1.5, 3]) {
            const a = (k / 8) * Math.PI * 2, px = x + Math.sin(a) * rad, pz = z + Math.cos(a) * rad;
            if (r._nassAt(px, pz)) return false;
            const y = r._voxelSurfaceY(px, pz);
            if (y == null) return false;
            lo = Math.min(lo, y); hi = Math.max(hi, y);
        }
    return hi - lo <= 1;
};
const Q = (r._leuchtQuellen(PT.x, PT.y, PT.z, 160) || []).filter((o) => o && o.id && o.id.position && r._lichtDatum(o.id)).map((o) => ({ x: o.x, z: o.z, typ: o.id.type }));
const frei = (x, z) => { let b = null; for (const q of Q) { const d = Math.hypot(q.x - x, q.z - z); if (!b || d < b.d) b = { d, q }; } return b; };
let ort = null, geprueft = 0;
for (let rr = 0; rr <= 60 && !ort; rr += 2) {
    const n = Math.max(1, Math.round((2 * Math.PI * rr) / 2));
    for (let k = 0; k < n && !ort; k++) {
        const a = (k / n) * Math.PI * 2, x = PT.x + Math.cos(a) * rr, z = PT.z + Math.sin(a) * rr;
        geprueft++;
        const f = frei(x, z);
        if (f && f.d < 7) continue;
        if (!haelt(x, z)) continue;
        const ux = f ? (x - f.q.x) / f.d : 1, uz = f ? (z - f.q.z) / f.d : 0;
        const sx = x + ux * 3, sz = z + uz * 3;
        const g = frei(sx, sz);
        if (!r._landAt(sx, sz, 0.4) || r._nassAt(sx, sz) || (g && g.d < 4)) continue;
        ort = { x, z, rr, frei: f && +f.d.toFixed(2), sx, sz };
    }
}
if (!ort) { window.__buehne({ uhr: uhrVor }); clearInterval(window.__nachtHalt); delete window.__nachtHalt; return { ort: null, geprueft, quellen: Q.length }; }
const werk = r.spawnArchitecture("glutbrunnen", { x: ort.x, y: r.getTerrainHeightAt(ort.x, ort.z) + 0.5, z: ort.z }, { silent: true, precise: true, id: "nacht-feuerstelle" });
let takte = 0;
while (werk && !r._blockerMit("licht").includes(werk) && takte < 300) { await new Promise((f) => setTimeout(f, 20)); takte++; }
HX = ort.sx; HZ = ort.sz;
for (let i = 0; i < 10; i++) { halte(); try { r._gameLoopTick(performance.now()); } catch (_e) {} await new Promise((f) => setTimeout(f, 16)); }
halte();
const P0 = pm.clone();
if (r._leuchtPool) r._leuchtPool.t = r._leuchtPool.uhr = -Infinity;
const L = werk && r._lichtDatum(werk);
const q2 = (r._leuchtQuellen(P0.x, P0.y, P0.z, 120) || []).filter((o) => o && o.id && o.id.position && r._lichtDatum(o.id) && Number.isFinite(o.y)).map((o) => ({ id: o.id, d: Math.hypot(o.x - P0.x, o.z - P0.z) })).sort((a, b) => a.d - b.d);
const aus = {
    third: [+PT.x.toFixed(2), +PT.z.toFixed(2)], geprueft, quellen: Q.length,
    feuer: werk ? { typ: werk.type, id: werk.id, ort: [+werk.position.x.toFixed(2), +werk.position.y.toFixed(2), +werk.position.z.toFixed(2)], vonThird: ort.rr, freiM: ort.frei, feldWurf: werk.feldWurf === true, kelvin: L && L.kelvin, cd: L && L.cd, imVerzeichnis: r._blockerMit("licht").includes(werk), takte } : null,
    spieler: [+P0.x.toFixed(2), +P0.z.toFixed(2)],
    erste: q2.slice(0, 3).map((q) => [q.id.type, +q.d.toFixed(2), q.id === werk]),
};
r.removeArchitecture(werk);
await new Promise((f) => setTimeout(f, 200));
aus.fort = !r._blockerMit("licht").includes(werk) && !(st.architectures || []).includes(werk);
HX = PX; HZ = PZ;
window.__buehne({ uhr: uhrVor });
aus.ms = Math.round(performance.now() - t0);
clearInterval(window.__nachtHalt);
delete window.__nachtHalt;
return aus;
