// 0910-3 A2: ein Fall in der Werkbank. __MODUS__ = 'roh' (Vendor-Methoden) | 'fix' (die Wirt-Hüllen); __FALL__ = 'bruch' | 'gift'
const MODUS = "__MODUS__", FALL = "__FALL__";
const st = r.state, rend = st.renderer, be = rend.backend, P = Object.getPrototypeOf(be);
const TSL = T.TSL, cam = st.camera;
const eigen = {};
if (MODUS === "roh") for (const k of ["copyFramebufferToTexture", "finishRender", "resolveOccludedAsync"]) if (Object.prototype.hasOwnProperty.call(be, k)) { eigen[k] = be[k]; delete be[k]; }
const gpu = [], seiten = [], drei = [];
const fn = (e) => gpu.push(String(e.error && e.error.message).split("\n")[0].slice(0, 90));
be.device.addEventListener("uncapturederror", fn);
const pe = (e) => seiten.push(String((e.reason && e.reason.message) || e.reason).slice(0, 90));
window.addEventListener("unhandledrejection", pe);
const ce = console.error;
console.error = function (...a) { drei.push(a.map(String).join(" ").split("\n")[0].slice(0, 90)); return ce.apply(this, a); };
const frisch = 0.001 + Math.random() * 0.01; // ein frischer Pipeline-Schlüssel je Lauf (eine Konstante im Shader)
const vor = new T.Vector3(0, 0, -6).applyQuaternion(cam.quaternion).add(cam.position);
const neuStoff = (k) => { const m = new T.MeshBasicNodeMaterial({ transparent: true }); m.colorNode = TSL.vec4(TSL.float(k), 0, 0, 1); m.colorWrite = false; m.depthWrite = false; return m; };
const pm = neuStoff(frisch);
let p = new T.Mesh(new T.BoxGeometry(1, 1, 1), pm);
p.occlusionTest = true; p.position.copy(vor); p.frustumCulled = false;
const dazu = [p];
const V0 = r._erstZeichnungStand().verschoben;
let vorFrame = () => {};
if (FALL === "verschoben") {
    // der Weg der Erst-Zeichnung: je Frame ein NEUER Stellvertreter mit ungebautem Stoff (wie ein Region-Proxy, der eben
    // erscheint), und der Bau-Rahmen des Render-Aufrufs ist schon voll → r184 zählt ihn, die Erst-Zeichnung verschiebt ihn
    const voll = (re) => { const E = r._erstZeichnungStand(); E.aufruf = re.info.calls; E.aufrufMs = 1e9; };
    p.onBeforeRender = voll;
    vorFrame = () => {
        st.scene.remove(p);
        const m = neuStoff(0.001 + Math.random() * 0.01);
        p = new T.Mesh(p.geometry, m); p.occlusionTest = true; p.position.copy(vor); p.frustumCulled = false; p.onBeforeRender = voll;
        dazu[0] = p; st.scene.add(p);
    };
}
if (FALL === "bruch") {
    const lm = new T.MeshBasicNodeMaterial({ transparent: true });
    lm.colorNode = TSL.vec4(TSL.vec3(r._szeneTiefe()).add(frisch), 0.3);
    const l = new T.Mesh(new T.PlaneGeometry(2, 2), lm);
    l.position.copy(vor).add(new T.Vector3(0.5, 0, 0)); l.renderOrder = 1; l.frustumCulled = false; l.lookAt(cam.position);
    dazu.push(l);
}
st.scene.add(...dazu);
const dRoh = be.draw;
let gezeichnet = 0, gift = 0, pipeFehler = 0; const pipes = new Set();
be.draw = function (ro, info) {
    if (ro.object === p) {
        gezeichnet++;
        const pd = this.get(ro.pipeline); if (pd.pipeline) pipes.add(pd.pipeline.label); if (pd.error === true) pipeFehler++;
        // GIFT: die Pipeline des Stellvertreters gilt als fehlerhaft (wie nach einem fremden Fehler im asynchronen Fehler-Bereich)
        if (FALL === "gift" && gezeichnet > 2) { this.get(ro.pipeline).error = true; gift++; }
    }
    return dRoh.call(this, ro, info);
};
try {
    for (let i = 0; i < 20; i++) { vorFrame(); r._loopRender(performance.now()); await new Promise((s) => setTimeout(s, 25)); }
} finally {
    be.draw = dRoh;
    st.scene.remove(...dazu);
    for (const k in eigen) be[k] = eigen[k];
}
for (let i = 0; i < 4; i++) { r._loopRender(performance.now()); await new Promise((s) => setTimeout(s, 40)); }
await new Promise((s) => setTimeout(s, 300));
be.device.removeEventListener("uncapturederror", fn);
window.removeEventListener("unhandledrejection", pe);
console.error = ce;
const zaehl = (a) => { const m = {}; for (const x of a) m[x] = (m[x] || 0) + 1; return m; };
return { MODUS, FALL, gezeichnet, pipes: pipes.size, pipeFehler, gift, verschoben: r._erstZeichnungStand().verschoben - V0, roh: Object.keys(eigen), gpuN: gpu.length, gpu: zaehl(gpu), seitenN: seiten.length, seiten: zaehl(seiten), dreiN: drei.length };
