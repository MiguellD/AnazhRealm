// Der Reiter im Wagen in der laufenden Werkbank-Welt (echter Renderer, 0710-4 Klasse 4):
//   node reiter-bild.cjs <port> <typ>      typ: gt | supersport | limousine | suv | kompakt_fwd
// Setzt den Wagen auf die Wiese, sitzt auf, dreht die Maus QUER zur Fahrt (der Blick des Leibs soll der Fahrt folgen, nicht
// der Maus), lässt den Takt den Sitz einschwingen und schaltet den Reiter für den Schuss sichtbar (in der geschlossenen
// Kabine verbirgt ihn `_loopCamera` render-only). Gibt die Kameras (Seite in Fensterhöhe, schräg vorn oben) für
// `werkbank bild` aus und misst die Oberkante der Haut gegen die Dachlinie.
const http = require("http");
const [port, typ] = process.argv.slice(2);
const code = `
const typ = "fahrzeug_${typ}";
const st = r.state;
const hh = (a, b) => r.getTerrainHeightAt(a, b);
st.renderer.setAnimationLoop(null);
for (const c of st.creatures || []) c.visible = false;
if (st.player && st.player.mountedArch != null) r.dismountArchitecture();
let tMs = performance.now();
const frame = () => { tMs += 1000 / 60; r._gameLoopTick(tMs); };
const O = [st.playerMesh.position.x, st.playerMesh.position.z];
for (const w of (st.architectures || []).slice()) if (w && /^fahrzeug_/.test(w.type)) r.removeArchitecture(w);
const sx = O[0] + 6, sz = O[1];
st.playerMesh.position.set(sx, hh(sx, sz) + 1.2, sz);
st.playerVel.setValue(0, 0, 0);
st._fieldVy = 0;
const gier = Math.PI / 2;
const e = r.spawnArchitecture(typ, { x: sx, y: hh(sx, sz) + 0.5, z: sz }, { silent: true, precise: true, rotationY: gier - Math.PI / 2 });
if (!e) return { fehler: "kein " + typ };
const dl = performance.now() + 45000;
while (!e.instanced && !e.mesh && performance.now() < dl) { r._rebuildArchitectureMesh(e); if (e.instanced || e.mesh) break; for (let i = 0; i < 6; i++) frame(); await new Promise((q) => setTimeout(q, 100)); }
const mr = r.mountArchitecture(e);
if (!mr || !mr.ok) return { fehler: "aufsitzen" };
for (const k of ["w", "a", "s", "d", "shift", " "]) st.keys[k] = false;
for (let i = 0; i < 20; i++) frame();
st.yaw = (Number.isFinite(e._rideYaw) ? e._rideYaw : gier) + Math.PI / 2; // die Maus schaut quer
for (let i = 0; i < 12; i++) frame();
const pm = st.playerMesh;
pm.visible = true; // render-only: die Kabine verbirgt den Reiter im Spiel
pm.updateMatrixWorld(true);
// die Oberkante der Haut (alle sichtbaren Meshes der Nah-Gestalt, Ecke für Ecke über die Knochen)
const nah = (pm.userData._menschFern && pm.userData._menschFern.nah) || pm;
const V = new THREE.Vector3();
let oben = -Infinity;
nah.traverse((o) => {
  if (!o.isMesh || !o.geometry || !o.geometry.attributes.position) return;
  for (let n = o; n && n !== pm; n = n.parent) if (!n.visible) return;
  const pos = o.geometry.attributes.position;
  for (let i = 0; i < pos.count; i++) { o.getVertexPosition(i, V); V.applyMatrix4(o.matrixWorld); if (V.y > oben) oben = V.y; }
});
const fzg = r._fahrzeugGesetzFor(e);
const d = fzg && fzg.drive;
const sc = Number.isFinite(e.scale) ? e.scale : 1;
const basis = e.position.y - 0.5;
const dach = d && d.huelle ? basis + d.huelle.yRoof * sc : null;
const rg = pm.userData.rig;
const p = e.position;
const yaw = Number.isFinite(e._rideYaw) ? e._rideYaw : gier;
const qx = Math.cos(yaw), qz = -Math.sin(yaw);   // quer zur Fahrt
const fx = Math.sin(yaw), fzz = Math.cos(yaw);
// die Seite: von der Fahrerseite (Sitz z −0,4 im Rahmen des Kerns) in Fensterhöhe; schräg: vorn seitlich, über dem Dach
const sitzY = d && d.sitz ? basis + d.sitz.y * sc : basis + 0.5;
const dy = dach !== null ? dach : basis + 1.4;
// die Fahrerseite (Sitz z −0,4 im Rahmen des Kerns = −q in der Welt), Kamera in Dachhöhe, Blick auf den Sitz
const seite = [p.x + qx * 3.6, dy + 0.35, p.z + qz * 3.6, p.x, sitzY + 0.45, p.z];
const schraeg = [p.x + fx * 3.0 + qx * 3.0, dy + 1.0, p.z + fzz * 3.0 + qz * 3.0, p.x, sitzY + 0.4, p.z];
// die Werkbank blendet den Spieler im Schuss aus (Weltbilder): die Gestalt des Reiters hängt für die Aufnahme mit gleicher
// Welt-Lage in der Szene (scene.attach), der Wurf danach hängt sie zurück
let kind = rg && rg.hips;
while (kind && kind.parent && kind.parent !== pm) kind = kind.parent;
if (kind && kind.parent === pm) { st.scene.attach(kind); window.__reiterAbbild = { kind, pm }; }
return {
  typ, oben: +(oben - basis).toFixed(3), dach: dach === null ? null : +(dach - basis).toFixed(3),
  ueberDach: dach === null ? null : +(oben - dach).toFixed(3),
  lehneGrad: rg && rg.spine ? +((-rg.spine.rotation.x * 180) / Math.PI).toFixed(1) : null,
  seite: seite.map((v) => +v.toFixed(2)).join(" "), schraeg: schraeg.map((v) => +v.toFixed(2)).join(" "),
};`;
const req = http.request({ host: "127.0.0.1", port: Number(port), path: "/eval", method: "POST", headers: { "Content-Type": "application/json" } }, (res) => {
    let d = "";
    res.on("data", (c) => (d += c));
    res.on("end", () => console.log(d));
});
req.end(JSON.stringify({ code }));
