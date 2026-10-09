// werkbank eval: ERKUNDEN (0710-12) — ein Wolf auf der ebenen Bühne der Wiese, Sonne seitlich, je normalBias (Meter, beide
// Kaskaden) ein Bild LEER und MIT; zurück: PNG (MIT) und die Zahl der Boden-Pixel, die MIT dunkler ist als LEER (ohne die
// Wolf-Silhouette grob: Pixel, deren Farbe sich stark ändert und die hell bleiben, zählt die Erkundung nicht).
// Steuerung über window.__erk = { zeit, biase: [..], kam: {...}, art }
const E = window.__erk || {};
const st = r.state;
const rend = st.renderer;
const sleep = (ms) => new Promise((res) => setTimeout(res, ms));
rend.setAnimationLoop(null);
window.__buehne();
const bx = -893.8,
    bz = -844.9;
const gy = r._voxelSurfaceY(bx, bz);
// Tiere fort, der Spieler abseits
for (const c of [...st.creatures]) if (Math.hypot(c.position.x - bx, c.position.z - bz) < 40) r.removeCreature(c);
st.playerMesh.position.set(bx - 30, r._voxelSurfaceY(bx - 30, bz) + 1.8, bz);
st.playerMesh.visible = false;
const zeit = E.zeit != null ? E.zeit : 0.32;
st.timeOfDay = zeit;
if (st.world) st.world.timeOfDay = zeit;
r._applyDayNightToScene();
const sonne = r._sonnenRichtung();
const cam = st.camera;
const kr = E.kamRel || { dx: -4.5, dy: 3.2, dz: 4.5, lx: 0.8, ly: 0, lz: -0.3 };
const k = { px: bx + kr.dx, py: gy + kr.dy, pz: bz + kr.dz, lx: bx + kr.lx, ly: gy + kr.ly, lz: bz + kr.lz };
const setzeKam = () => {
    cam.position.set(k.px, k.py, k.pz);
    cam.lookAt(k.lx, k.ly, k.lz);
    cam.updateMatrixWorld(true);
};
const csm = st.csmNode;
// ein Bias: eine Zahl = Meter für beide Kaskaden; "t1.5" = 1,5 × die Texel-Größe der Kaskade (aus ihrer Box)
const bias = (m) => {
    const t = typeof m === "string" && m[0] === "t" ? Number(m.slice(1)) : null;
    if (t == null) st.directionalLight.shadow.normalBias = m;
    if (csm && csm.lights)
        csm.lights.forEach((lw, i) => {
            const f = csm._anazhFit && csm._anazhFit[i];
            lw.shadow.normalBias = t == null ? m : t * (f ? f.texel : 0.2);
        });
};
const W = 640,
    H = 360;
const schuss = async (b) => {
    if (st.nahWiese && st.nahWiese.gruppe) st.nahWiese.gruppe.visible = false;
    setzeKam();
    r._schattenAlleNeu();
    const a = await window.__ausgabeAufnahme(W, H, 1);
    bias(b);
    if (st.nahWiese && st.nahWiese.gruppe) st.nahWiese.gruppe.visible = false;
    setzeKam();
    r._schattenAlleNeu();
    return (await window.__ausgabeAufnahme(W, H, 1)).u8;
};
const lum = (u, i) => 0.2126 * u[i] + 0.7152 * u[i + 1] + 0.0722 * u[i + 2];
const png = (u8) => {
    const cv = document.createElement("canvas");
    cv.width = W;
    cv.height = H;
    const ctx = cv.getContext("2d");
    const img = ctx.createImageData(W, H);
    img.data.set(u8.subarray(0, W * H * 4));
    ctx.putImageData(img, 0, 0);
    return cv.toDataURL("image/png");
};
const aus = { sonne: [+sonne.x.toFixed(3), +sonne.y.toFixed(3), +sonne.z.toFixed(3)], hoeheGrad: +((Math.asin(sonne.y) * 180) / Math.PI).toFixed(1), bilder: [] };
const fits = csm && csm._anazhFit ? csm._anazhFit.map((f) => (f ? +f.texel.toFixed(3) : null)) : null;
for (const b of E.biase || [1.0, 0.25]) {
    bias(b);
    const leer = await schuss(b);
    const w = r.spawnCreatureAt(bx, gy + 0.5, bz, "happy", E.art || "wolf", { bodySize: 1 });
    if (w) {
        w.userData.task = { name: "wait", args: {}, since: performance.now() / 1000 };
        w.userData.emotions = null;
        for (let t = 0; t < 20; t++) {
            try {
                r._gameLoopTick(performance.now());
            } catch (_e) {}
            await sleep(20);
        }
        rend.setAnimationLoop(null);
        window.__buehne();
        st.timeOfDay = zeit;
        if (st.world) st.world.timeOfDay = zeit;
        r._applyDayNightToScene();
        bias(b);
        w.position.set(bx, w.position.y, bz);
    }
    const mit = await schuss(b);
    let dunkler = 0,
        heller = 0;
    for (let i = 0; i < W * H * 4; i += 4) {
        const d = lum(mit, i) - lum(leer, i);
        if (d < -12) dunkler++;
        else if (d > 12) heller++;
    }
    aus.bilder.push({ nb: csm && csm.lights ? csm.lights.map((lw) => +lw.shadow.normalBias.toFixed(3)) : null, bias: b, dunkler, heller, png: png(mit), pngLeer: png(leer), fits: csm && csm._anazhFit ? csm._anazhFit.map((f) => (f ? +f.texel.toFixed(3) : null)) : null });
    if (w) r.removeCreature(w);
}
aus.fitsVorher = fits;
return aus;
