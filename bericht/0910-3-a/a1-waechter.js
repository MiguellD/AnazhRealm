// 0910-3 A1: Hypothese — ein Vorher-Textur-Wächter hinter _diaetRefresh heilt den Pixel-Ratio-Wechsel. __AN__ = an | aus
const AN = "__AN__" === "an";
const KL = r.constructor, st = r.state, rend = st.renderer, be = rend.backend;
if (!KL.__diaetRoh) KL.__diaetRoh = KL._diaetRefresh;
const zaehl = { refresh: 0, objekte: new Set() };
if (AN) {
    KL._diaetRefresh = function (obs, ro, frame, altNR) {
        const aus = KL.__diaetRoh(obs, ro, frame, altNR);
        const nbs = ro.getNodeBuilderState();
        const k = nbs && nbs._anazhGang;
        if (!k) return aus;
        const d = obs.getRenderObjectData(ro);
        const vv = d._anazhVorTexV || (d._anazhVorTexV = []);
        let anders = false, i = 0;
        for (const n of k.vor.concat(k.eigenVor)) {
            const t = n.isTextureNode ? n.value : null;
            if (!t || !t.isTexture) continue;
            if (vv[i] !== t.id || vv[i + 1] !== t.version) { vv[i] = t.id; vv[i + 1] = t.version; anders = true; }
            i += 2;
        }
        if (anders && aus !== true) { zaehl.refresh++; zaehl.objekte.add(ro.object.id); return true; }
        return aus;
    };
} else KL._diaetRefresh = KL.__diaetRoh;
const A1 = window.__a1;
const vor = Object.assign({}, A1.gpu);
let frames = 0;
const loop = r._gameLoopTick;
rend.setAnimationLoop((t) => { frames++; return loop(t); });
const warteFrames = async (n) => { const f0 = frames, t0 = performance.now(); while (frames - f0 < n && performance.now() - t0 < 30000) await new Promise((s) => setTimeout(s, 16)); };
try {
    await warteFrames(20);
    for (const pr of [1.5, 1, 2, 1]) { rend.setPixelRatio(pr); await warteFrames(30); }
} finally { rend.setAnimationLoop(null); }
await new Promise((s) => setTimeout(s, 300));
const neu = {};
for (const k in A1.gpu) if (A1.gpu[k] !== vor[k]) neu[k] = A1.gpu[k] - (vor[k] || 0);
return { AN, neu, waechterRefresh: zaehl.refresh, objekte: zaehl.objekte.size };
