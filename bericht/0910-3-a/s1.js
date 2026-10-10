// 0910-3 A2: Station BRUCH am Bach (Werkbank-Probe). __MODUS__ = roh | fix. Der Spieler steht am Ufer (va.js lief), Blick übers Wasser.
const MODUS = "__MODUS__";
const st = r.state, rend = st.renderer, be = rend.backend;
const eigen = {};
if (MODUS === "roh") for (const k of ["copyFramebufferToTexture", "finishRender", "resolveOccludedAsync"]) if (Object.prototype.hasOwnProperty.call(be, k)) { eigen[k] = be[k]; delete be[k]; }
const F = { gpu: [], seite: [] };
const fn = (e) => F.gpu.push(String(e.error && e.error.message).split("\n")[0].slice(0, 90));
be.device.addEventListener("uncapturederror", fn);
const pe = (e) => F.seite.push(String((e.reason && e.reason.message) || e.reason).slice(0, 90));
window.addEventListener("unhandledrejection", pe);
const Z = { begonnen: 0, bruch: 0, bruchOffen: 0, gebaut: 0, wasserDraw: 0, folge: [] };
const RP = GPURenderPassEncoder.prototype, bQ = RP.beginOcclusionQuery;
RP.beginOcclusionQuery = function (i) { Z.begonnen++; return bQ.call(this, i); };
const bruchVor = be.copyFramebufferToTexture;
be.copyFramebufferToTexture = function (t, k, rr) { Z.bruch++; const d = this.get(k); const o = d && d.lastOcclusionObject; if (o && o.occlusionTest === true) Z.bruchOffen++; if (Z.folge.length < 12) Z.folge.push("BRUCH(" + (o ? (o === q ? "stellvertreter" : o === l ? "leser" : o.name || o.type) : "-") + ")"); return bruchVor.call(this, t, k, rr); };
const cam = st.camera;
const m = new THREE.MeshBasicMaterial();
m.colorWrite = false; m.depthWrite = false;
const q = new THREE.Mesh(new THREE.BoxGeometry(0.5, 0.5, 0.5), m);
q.name = "verdeckung:stellvertreter"; q.frustumCulled = false; q.renderOrder = -1e6;
const lm = new THREE.MeshBasicNodeMaterial(); lm.colorNode = THREE.TSL.vec4(THREE.TSL.vec3(r._szeneTiefe()), 1);
const l = new THREE.Mesh(new THREE.PlaneGeometry(0.4, 0.4), lm); l.name = "verdeckung:tiefen-leser"; l.frustumCulled = false; l.renderOrder = -1e6 + 1;
const stelle = () => { q.position.copy(new THREE.Vector3(0, 0, -3).applyQuaternion(cam.quaternion).add(cam.position)); l.position.copy(new THREE.Vector3(0.6, -0.4, -3.5).applyQuaternion(cam.quaternion).add(cam.position)); l.quaternion.copy(cam.quaternion); };
stelle();
st.scene.add(q, l);
const dVor = be.draw;
be.draw = function (ro, info) {
    if (ro.object === q && this.get(ro.pipeline).error !== true) Z.gebaut++;
    if (ro.material === st.hydroSurfaceMaterial) Z.wasserDraw++;
    if (Z.folge.length < 12 && (ro.object === q || ro.object === l || ro.material === st.hydroSurfaceMaterial)) Z.folge.push(ro.object === q ? "stellvertreter" : ro.object === l ? "leser" : "wasser");
    return dVor.call(this, ro, info);
};
const aus = { MODUS };
try {
    // (1) den Stoff vorbauen: ohne Abfrage zeichnen, bis er zeichnet
    for (let i = 0; i < 40 && Z.gebaut < 2; i++) { stelle(); r._loopRender(performance.now()); await new Promise((s) => setTimeout(s, 30)); }
    aus.vorgebaut = Z.gebaut;
    Z.folge.length = 0; Z.wasserDraw = 0; Z.bruch = 0;
    // (2) jetzt mit Abfrage: der letzte transparente Draw vor dem Wasser
    q.occlusionTest = true;
    for (let i = 0; i < 20; i++) { stelle(); r._loopRender(performance.now()); await new Promise((s) => setTimeout(s, 30)); }
} finally {
    st.scene.remove(q, l);
    RP.beginOcclusionQuery = bQ; be.copyFramebufferToTexture = bruchVor; be.draw = dVor;
    for (const k in eigen) be[k] = eigen[k];
}
for (let i = 0; i < 3; i++) { r._loopRender(performance.now()); await new Promise((s) => setTimeout(s, 40)); }
await new Promise((s) => setTimeout(s, 300));
be.device.removeEventListener("uncapturederror", fn);
window.removeEventListener("unhandledrejection", pe);
const zaehl = (l) => { const o = {}; for (const x of l) o[x] = (o[x] || 0) + 1; return o; };
return { ...aus, Z, gpuN: F.gpu.length, gpu: zaehl(F.gpu), seiteN: F.seite.length, seite: zaehl(F.seite) };
