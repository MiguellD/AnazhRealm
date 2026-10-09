// Eine Fahrt der Leben-Schau in der laufenden Werkbank-Welt (echter Renderer), danach steht der Wagen für die Aufnahme:
//   node fahrt-bild.cjs <port> <fall>      fall: hangfuss | spalt
// Dieselbe Mechanik wie gate:fahr-leben L (setzen → aufsitzen → v0 → W, _gameLoopTick je 1/60 s). Gibt die Lage des Wagens,
// seine Höhe gegen die Ebene der Räder und zwei Kameras (Seite, schräg oben) für `werkbank bild` aus.
const http = require("http");
const [port, fall] = process.argv.slice(2);
const F = {
    hangfuss: { ort: [-852, -861.2], start: [-854.5, -861.1], gier: 92.3, v0: 9.3, frames: 150 },
    spalt: { ort: [-904, -975], start: [-912, -975], gier: 90, v0: 11.4, frames: 150 },
    stossgt: { ort: [-900, -850], start: [-909, -850], gier: 90, v0: 0, frames: 150, partner: "gt" },
    stossbaer: { ort: [-900, -850], start: [-909, -850], gier: 90, v0: 0, frames: 150, partner: "baer" },
}[fall];
const code = `
const F = ${JSON.stringify(F)};
const st = r.state;
const hh = (a, b) => r.getTerrainHeightAt(a, b);
const gier = (F.gier * Math.PI) / 180;
st.renderer.setAnimationLoop(null);
for (const c of st.creatures || []) c.visible = false;
if (st.player && st.player.mountedArch != null) r.dismountArchitecture();
let tMs = performance.now();
const frame = () => { tMs += 1000 / 60; r._gameLoopTick(tMs); };
st.playerMesh.position.set(F.ort[0], hh(F.ort[0], F.ort[1]) + 2, F.ort[1]);
for (let i = 0; i < 240; i++) { frame(); if (i % 30 === 29) await new Promise((q) => setTimeout(q, 20)); }
for (const cr of (st.creatures || []).slice()) if (cr && cr.position && Math.hypot(cr.position.x - F.ort[0], cr.position.z - F.ort[1]) < 30) r.removeCreature(cr);
// die Wagen eines vorigen Falls räumen (sie standen dem nächsten Fall auf der Bahn)
for (const w of (st.architectures || []).slice()) if (w && w.type === "fahrzeug_gt" && w.position && Math.hypot(w.position.x - F.ort[0], w.position.z - F.ort[1]) < 30) r.removeArchitecture(w);
const [sx, sz] = F.start;
st.playerMesh.position.set(sx, hh(sx, sz) + 1.2, sz);
st.playerVel.setValue(0, 0, 0);
st._fieldVy = 0;
const e = r.spawnArchitecture("fahrzeug_gt", { x: sx, y: hh(sx, sz) + 0.5, z: sz }, { silent: true, precise: true, rotationY: gier - Math.PI / 2 });
const dl = performance.now() + 45000;
while (!e.instanced && !e.mesh && performance.now() < dl) { r._rebuildArchitectureMesh(e); if (e.instanced || e.mesh) break; for (let i = 0; i < 6; i++) frame(); await new Promise((q) => setTimeout(q, 100)); }
if (!e.instanced && !e.mesh) return { fehler: 'der Wagen hat keine Gestalt' };
let partner = null;
if (F.partner === "gt") {
  partner = r.spawnArchitecture("fahrzeug_gt", { x: sx + 9, y: hh(sx + 9, sz) + 0.5, z: sz }, { silent: true, precise: true, rotationY: gier - Math.PI / 2 });
  const dlP = performance.now() + 45000;
  while (partner && !partner.instanced && !partner.mesh && performance.now() < dlP) { r._rebuildArchitectureMesh(partner); if (partner.instanced || partner.mesh) break; for (let i = 0; i < 6; i++) frame(); await new Promise((q) => setTimeout(q, 100)); }
} else if (F.partner === "baer") {
  st.maxCreatures = Math.max(st.maxCreatures, st.creatures.length + 1);
  partner = r.spawnCreatureAt(sx + 9, hh(sx + 9, sz) + 0.5, sz, "calm", "baer", { precise: true });
  if (partner) { partner.position.set(sx + 9, hh(sx + 9, sz), sz); partner.rotation.y = 0; if (typeof r.assignCreatureTask === "function") r.assignCreatureTask(partner, "wait"); partner.visible = true; }
  const A = Object.getPrototypeOf(r).constructor;
  if (!A.__steuerRoh) { A.__steuerRoh = A._steuerGesetz; const steht = Object.create(A.__steuerRoh.call(A)); steht.steuerSchritt = (sw) => { sw.v = 0; }; A._steuerGesetz = () => steht; }
}
const p0 = partner ? { x: partner.position.x, z: partner.position.z } : null;
const mr = r.mountArchitecture(e);
if (!mr || !mr.ok) return { fehler: "aufsitzen" };
for (const k of ["w", "a", "s", "d", "shift", " "]) st.keys[k] = false;
for (let i = 0; i < 12; i++) frame();
st.playerVel.setValue(Math.sin(gier) * F.v0, st.playerVel.y(), Math.cos(gier) * F.v0);
if (e._fahr) e._fahr.vlong = F.v0;
st.keys.w = true;
for (let i = 0; i < F.frames; i++) frame();
st.keys.w = false;
const fz = e._fahr;
const VC = window.__vehicleCore;
const eb = fz && e._fahrSatz ? VC.fahrEbene(e._fahrSatz, r._fahrBoden(e), fz.x, fz.z, fz.yaw) : null;
const p = e.position;
const yaw = Number.isFinite(e._rideYaw) ? e._rideYaw : gier;
const qx = Math.cos(yaw), qz = -Math.sin(yaw);   // quer zur Fahrt
const fx = Math.sin(yaw), fzz = Math.cos(yaw);
const ys = fz ? fz.y : p.y;
const yl = eb ? Math.max(eb.y, ys) : ys;   // der Blick zielt auf die Ebene des Gesetzes (nie in den Boden)
const seite = [p.x + qx * 6.5, "+2.2", p.z + qz * 6.5, p.x, yl + 0.5, p.z];
const oben = [p.x - fx * 4 + qx * 7, "+7", p.z - fzz * 4 + qz * 7, p.x, yl, p.z];
window.__fahrtBild = { e, ys };
const pw = partner && p0 ? +Math.hypot(partner.position.x - p0.x, partner.position.z - p0.z).toFixed(2) : null;
return { partnerWeg: pw, x: +p.x.toFixed(2), z: +p.z.toFixed(2), y: +ys.toFixed(3), ebene: eb ? +eb.y.toFixed(3) : null, unter: eb ? +(eb.y - ys).toFixed(3) : null, luft: fz && fz.luft, v: +Math.hypot(st.playerVel.x(), st.playerVel.z()).toFixed(2),
  seite: seite.map((v) => typeof v === "string" ? v : +v.toFixed(2)).join(" "), oben: oben.map((v) => typeof v === "string" ? v : +v.toFixed(2)).join(" ") };`;
const req = http.request({ host: "127.0.0.1", port: Number(port), path: "/eval", method: "POST", headers: { "Content-Type": "application/json" } }, (res) => {
    let d = "";
    res.on("data", (c) => (d += c));
    res.on("end", () => console.log(d));
});
req.end(JSON.stringify({ code }));
