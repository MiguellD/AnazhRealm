// Der Wagen-Geist (Q14, Auftrag 0710-2 Punkt 5) am echten Renderer: der GT aufgesessen an der Mess-Wiese, die Kamera hinter
// ihm in d m (Höhe +2,2 über Grund, Blick auf den Wagen). Je d drei Schüsse aus dem Ausgabe-Pfad (werkbank bild):
// Maske an · Maske aus (state.lodMaskOn = false, die LOD-Blende ohne Rebuild aus) · Wagen weg bei Maske aus (der Hintergrund;
// der aufgesessene Wagen ist instanziert: seine Slots bekommen eine Null-Matrix). Wagen-Pixel = |aus − leer| > 24.
// Geist-Anteil = 1 − Σ|an − leer-an| / Σ|aus − leer| über die Wagen-Pixel: der Beitrag des Wagens mit Maske gegen den ohne
// (je gegen den Hintergrund desselben Masken-Zustands); 0 = der Wagen steht voll, 0,5 = halb durchsichtig.
//   node geist.cjs <werkbank-port> <ausgabe-ordner>
"use strict";
const http = require("http");
const fs = require("fs");
const zlib = require("zlib");
const path = require("path");
const [port, ordner] = process.argv.slice(2);
fs.mkdirSync(ordner, { recursive: true });
const rufe = (url, body) =>
    new Promise((res, rej) => {
        const q = http.request({ host: "127.0.0.1", port: Number(port), path: url, method: "POST", headers: { "Content-Type": "application/json" } }, (r) => {
            let d = "";
            r.on("data", (c) => (d += c));
            r.on("end", () => { try { res(JSON.parse(d)); } catch (e) { rej(new Error(d.slice(0, 300))); } });
        });
        q.on("error", rej);
        q.end(JSON.stringify(body));
    });
function lies(datei) {
    const b = fs.readFileSync(datei);
    let o = 8, w = 0, h = 0, typ = 0;
    const idat = [];
    while (o < b.length) {
        const n = b.readUInt32BE(o), t = b.toString("ascii", o + 4, o + 8), d = b.subarray(o + 8, o + 8 + n);
        if (t === "IHDR") { w = d.readUInt32BE(0); h = d.readUInt32BE(4); typ = d[9]; }
        else if (t === "IDAT") idat.push(d);
        else if (t === "IEND") break;
        o += 12 + n;
    }
    const kan = typ === 6 ? 4 : 3, roh = zlib.inflateSync(Buffer.concat(idat)), zeile = w * kan, px = new Uint8Array(h * zeile);
    let vor = new Uint8Array(zeile);
    for (let y = 0; y < h; y++) {
        const f = roh[y * (zeile + 1)], z = roh.subarray(y * (zeile + 1) + 1, (y + 1) * (zeile + 1)), aus = px.subarray(y * zeile, (y + 1) * zeile);
        for (let x = 0; x < zeile; x++) {
            const a = x >= kan ? aus[x - kan] : 0, bb = vor[x], c = x >= kan ? vor[x - kan] : 0;
            let v = z[x];
            if (f === 1) v += a; else if (f === 2) v += bb; else if (f === 3) v += (a + bb) >> 1;
            else if (f === 4) { const p = a + bb - c, pa = Math.abs(p - a), pb = Math.abs(p - bb), pc = Math.abs(p - c); v += pa <= pb && pa <= pc ? a : pb <= pc ? bb : c; }
            aus[x] = v & 255;
        }
        vor = aus;
    }
    return { w, h, kan, px };
}
const setup = `
const st = r.state;
const hh = (a, b) => r.getTerrainHeightAt(a, b);
st.renderer.setAnimationLoop(null);
for (const c of st.creatures || []) c.visible = false;
if (st.player && st.player.mountedArch != null) r.dismountArchitecture();
let tMs = performance.now();
const frame = () => { tMs += 1000 / 60; r._gameLoopTick(tMs); };
const ort = [-900, -850], gier = Math.PI / 2;
st.playerMesh.position.set(ort[0], hh(ort[0], ort[1]) + 2, ort[1]);
for (let i = 0; i < 240; i++) { frame(); if (i % 30 === 29) await new Promise((q) => setTimeout(q, 20)); }
const sx = -909, sz = -850;
st.playerMesh.position.set(sx, hh(sx, sz) + 1.2, sz);
st.playerVel.setValue(0, 0, 0);
const e = r.spawnArchitecture("fahrzeug_gt", { x: sx, y: hh(sx, sz) + 0.5, z: sz }, { silent: true, precise: true, rotationY: gier - Math.PI / 2 });
const dl = performance.now() + 45000;
while (!e.instanced && !e.mesh && performance.now() < dl) { r._rebuildArchitectureMesh(e); if (e.instanced || e.mesh) break; for (let i = 0; i < 6; i++) frame(); await new Promise((q) => setTimeout(q, 100)); }
const mr = r.mountArchitecture(e);
if (!mr || !mr.ok) return { fehler: "aufsitzen" };
for (const k of ["w", "a", "s", "d", "shift", " "]) st.keys[k] = false;
st.keys.w = true;
for (let i = 0; i < 70; i++) frame();
st.keys.w = false; st.keys.s = true;
for (let i = 0; i < 90; i++) frame();
st.keys.s = false;
for (let i = 0; i < 30; i++) frame();
window.__geist = { e };
const p = e.position, yaw = Number.isFinite(e._rideYaw) ? e._rideYaw : gier;
const stempel = [];
const G = st.archInstanceGroups;
const refs = [...(e.instSlots || []), ...(e.instSlotsBand || [])];
for (const ref of refs) { const g = G && G.get(ref.key); const a = g && g.mesh.geometry.attributes.aLodLevel; stempel.push(a ? a.array[0] : "ohne"); }
if (e.mesh) e.mesh.traverse((o) => { if (o.isMesh && o.geometry && o.geometry.attributes.aLodLevel) stempel.push("mesh:" + o.geometry.attributes.aLodLevel.array[0]); });
window.__geist.zeige = (an) => {
  const M = new T.Matrix4();
  for (const ref of refs) {
    const g = G && G.get(ref.key); if (!g) continue;
    if (!an) { if (!ref.__m) { ref.__m = new T.Matrix4(); g.mesh.getMatrixAt(ref.slot, ref.__m); } g.mesh.setMatrixAt(ref.slot, M.makeScale(0, 0, 0)); }
    else if (ref.__m) { g.mesh.setMatrixAt(ref.slot, ref.__m); ref.__m = null; }
    g.mesh.instanceMatrix.needsUpdate = true;
  }
  if (e.mesh) e.mesh.visible = !!an;
};
// Die Messung sieht NUR den Wagen: jede andere Gestalt mit Stufen-Stempel (Bäume, Sträucher, Gras, Streu) und die
// Nah-Wiese werden ausgeblendet — ihre Masken und Schatten wechselten sonst mit an/aus in den Wagen-Pixeln.
const wagenMeshes = new Set(refs.map((ref) => { const g = G && G.get(ref.key); return g ? g.mesh : null; }).filter(Boolean));
window.__geist.pflanzenAus = () => {
  let n = 0;
  if (st.nahWiese && st.nahWiese.gruppe) st.nahWiese.gruppe.visible = false;
  st.scene.traverse((o) => {
    if ((o.isMesh || o.isInstancedMesh) && o.visible && !wagenMeshes.has(o) && o.geometry && o.geometry.attributes && o.geometry.attributes.aLodLevel) { o.visible = false; n++; }
  });
  return n;
};
window.__geist.stempelSetzen = (v) => {
  window.__geist.roh = window.__geist.roh || [];
  for (const ref of refs) { const g = G && G.get(ref.key); const a = g && g.mesh.geometry.attributes.aLodLevel; if (!a) continue; window.__geist.roh.push([a, a.array[0]]); a.array.fill(v); a.needsUpdate = true; }
  return window.__geist.roh.length;
};
window.__geist.stempelZurueck = () => { for (const [a, v] of (window.__geist.roh || []).reverse()) { a.array.fill(v); a.needsUpdate = true; } window.__geist.roh = []; };
return { x: p.x, y: p.y, z: p.z, yaw, mesh: !!e.mesh, instanced: !!e.instanced, slots: refs.length, stempel: [...new Set(stempel)], v: Math.hypot(st.playerVel.x(), st.playerVel.z()) };`;
(async () => {
    const s = (await rufe("/eval", { code: setup })).ergebnis;
    console.log("Wagen:", JSON.stringify(s));
    if (!s || s.fehler) process.exit(1);
    const fx = Math.sin(s.yaw), fz = Math.cos(s.yaw);
    const zeilen = [];
    for (const d of [6, 8, 9, 10, 11, 12, 14]) {
        const cam = { px: s.x - fx * d, py: "+2.2", pz: s.z - fz * d, lx: s.x, ly: s.y + 0.7, lz: s.z, w: 960, h: 540 };
        const schuss = async (name, code) => {
            await rufe("/eval", { code: code.replace(/return ([^;]+)$/, "window.__geist.pflanzenAus(); return $1") });
            const datei = path.resolve(ordner, `d${d}-${name}.png`);
            await rufe("/bild", Object.assign({}, cam, { datei }));
            return lies(datei);
        };
        const an = await schuss("an", "r.state.lodMaskOn = true; window.__geist.zeige(true); return 1");
        const aus = await schuss("aus", "r.state.lodMaskOn = false; window.__geist.zeige(true); return 1");
        const leer = await schuss("leer", "r.state.lodMaskOn = false; window.__geist.zeige(false); return 1");
        // der Hintergrund auch MIT Maske: je Masken-Zustand zählt nur der Beitrag des Wagens (die Maske ändert Gras und Laub
        // im Bild, nie den Wagen selbst — ein Vergleich an gegen aus maß sonst die Pflanzen vor und hinter ihm)
        const leerAn = await schuss("leer-an", "r.state.lodMaskOn = true; window.__geist.zeige(false); return 1");
        // Selbst-Test der Messung: der alte Stempel (aLodLevel 1 = L0 einer Kette, vor 187b047c) muss den Geist zeigen.
        const alt = await schuss("alt", "r.state.lodMaskOn = true; window.__geist.zeige(true); return window.__geist.stempelSetzen(1)");
        await rufe("/eval", { code: "window.__geist.stempelZurueck(); window.__geist.zeige(true); r.state.lodMaskOn = true; return 1" });
        // das Rechteck der Wagen-Hülle im Bild (die Hüllen-Boxen des Eintrags, mit derselben Kamera projiziert, +4 px)
        const box = (await rufe("/eval", { code: `
const st = r.state, e = window.__geist.e;
const c = st.camera.clone();
const py = r.getTerrainHeightAt(${cam.px}, ${cam.pz}) + 2.2;
c.position.set(${cam.px}, py, ${cam.pz}); c.lookAt(${cam.lx}, ${cam.ly}, ${cam.lz});
c.aspect = ${cam.w} / ${cam.h}; c.updateProjectionMatrix(); c.updateMatrixWorld(true);
let x0 = Infinity, y0 = Infinity, x1 = -Infinity, y1 = -Infinity;
const v = new T.Vector3();
for (const b of e.blockerAABBs || []) for (let k = 0; k < 8; k++) {
  v.set(k & 1 ? b.maxX : b.minX, k & 2 ? b.topY : b.botY, k & 4 ? b.maxZ : b.minZ).project(c);
  const sx = (v.x * 0.5 + 0.5) * ${cam.w}, sy = (1 - (v.y * 0.5 + 0.5)) * ${cam.h};
  x0 = Math.min(x0, sx); x1 = Math.max(x1, sx); y0 = Math.min(y0, sy); y1 = Math.max(y1, sy);
}
return { x0: Math.max(0, Math.floor(x0) - 4), y0: Math.max(0, Math.floor(y0) - 4), x1: Math.min(${cam.w} - 1, Math.ceil(x1) + 4), y1: Math.min(${cam.h} - 1, Math.ceil(y1) + 4), boxen: (e.blockerAABBs || []).length };` })).ergebnis;
        let n = 0, sAn = 0, sAus = 0, sAlt = 0;
        for (let i = 0; i < an.px.length; i += an.kan) {
            const px = (i / an.kan) % an.w, py = Math.floor(i / an.kan / an.w);
            if (!box || px < box.x0 || px > box.x1 || py < box.y0 || py > box.y1) continue;
            const dAus = Math.abs(aus.px[i] - leer.px[i]) + Math.abs(aus.px[i + 1] - leer.px[i + 1]) + Math.abs(aus.px[i + 2] - leer.px[i + 2]);
            if (dAus <= 24) continue;
            const dAn = Math.abs(an.px[i] - leerAn.px[i]) + Math.abs(an.px[i + 1] - leerAn.px[i + 1]) + Math.abs(an.px[i + 2] - leerAn.px[i + 2]);
            const dAlt = Math.abs(alt.px[i] - leerAn.px[i]) + Math.abs(alt.px[i + 1] - leerAn.px[i + 1]) + Math.abs(alt.px[i + 2] - leerAn.px[i + 2]);
            n++; sAn += dAn; sAus += dAus; sAlt += dAlt;
        }
        const geist = n ? 1 - sAn / sAus : null;
        const geistAlt = n ? 1 - sAlt / sAus : null;
        const pz = (g) => (g == null ? "—" : (g * 100).toFixed(1) + " %");
        zeilen.push({ d, box, wagenPixel: n, geist: geist == null ? null : +geist.toFixed(3), geistAltStempel: geistAlt == null ? null : +geistAlt.toFixed(3) });
        console.log(`d ${d} m: Wagen-Pixel ${n}, Geist-Anteil ${pz(geist)} · mit dem alten Stempel 1: ${pz(geistAlt)}`);
    }
    fs.writeFileSync(path.join(ordner, "geist.json"), JSON.stringify({ wagen: s, zeilen }, null, 1));
})().catch((e) => { console.error("FEHLER", e.message); process.exit(1); });
