// 0910-3 A Nachbesserung: der stumme Stellvertreter meldet sich laut (Werkbank, Wiese). __GIFT__ = an | aus
const GIFT = "__GIFT__" === "an";
const st = r.state, rend = st.renderer, be = rend.backend, KL = r.constructor;
const logs = [];
const logRoh = r.log;
r.log = function (msg, lvl) { if (/BERG-CULL/.test(String(msg))) logs.push(lvl + ": " + msg); return logRoh.apply(this, arguments); };
const cp = st.camera.position;
// ein Region-Bündel 700 m voraus (Kante > minDist), damit der Berg-Cull seinen Stellvertreter baut
const R = KL.ARCH_REGION_M;
const vorn = r._blickVorn(st.yaw, 0);
const key = Math.floor((cp.x + vorn.x * 700) / R) + "," + Math.floor((cp.z + vorn.z * 700) / R);
const neu = !(st._regionBundles && st._regionBundles.has(key));
const bg = r._archRegionBundleFor(key);
let gift = 0;
const dRoh = be.draw;
be.draw = function (ro, info) {
    if (GIFT && bg.userData._occlProxy && ro.object === bg.userData._occlProxy) { this.get(ro.pipeline).error = true; gift++; }
    return dRoh.call(this, ro, info);
};
const nf = rend._nodes.nodeFrame;
let tMs = performance.now();
const verdikte = [];
try {
    for (let i = 0; i < 120; i++) {
        tMs += 16.7; nf.update(); r._gameLoopTick(tMs);
        await be.device.queue.onSubmittedWorkDone();
        if (i % 10 === 9) verdikte.push(bg.userData._occlStumm || 0);
    }
} finally {
    be.draw = dRoh;
    r.log = logRoh;
    const pd = [];
    if (bg.userData._occlProxy) r._bundleQueryProxyTod(bg);
    if (neu) { st.scene.remove(bg); st._regionBundles.delete(key); }
}
return { GIFT, gift, stummJeFenster: verdikte, gemeldet: r._occlStummGemeldet === true, logs };
