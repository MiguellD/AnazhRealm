// 0910-3 A1: WER hält das alte Tiefen-Abbild? Bind-Gruppen → Texturen, zerstörte Texturen, je Draw das Objekt.
const st = r.state, rend = st.renderer, be = rend.backend;
const D = GPUDevice.prototype, TX = GPUTexture.prototype, RP = GPURenderPassEncoder.prototype, RB = GPURenderBundleEncoder.prototype;
const ansichtZu = new WeakMap(), gruppeZu = new WeakMap(), tot = new WeakSet();
const cv = TX.createView, de = TX.destroy, cbg = D.createBindGroup, sbg = RP.setBindGroup, sbgB = RB.setBindGroup;
TX.createView = function (d) { const v = cv.call(this, d); ansichtZu.set(v, this); return v; };
TX.destroy = function () { tot.add(this); return de.call(this); };
D.createBindGroup = function (d) {
    const g = cbg.call(this, d);
    const tex = [];
    for (const e of (d && d.entries) || []) { const t = e.resource && ansichtZu.get(e.resource); if (t) tex.push(t); }
    if (tex.length) gruppeZu.set(g, { tex, label: d.label || "" });
    return g;
};
let aktuell = null;
const treffer = {};
const pruefe = (g, wo) => {
    const z = g && gruppeZu.get(g);
    if (!z) return;
    for (const t of z.tex) if (tot.has(t) && t.label === "szene:tiefenabbild") {
        const o = aktuell && aktuell.object;
        const kette = []; for (let p = o; p && kette.length < 5; p = p.parent) kette.unshift(p.name || p.type);
        const k = wo + " · " + kette.join("/") + " · Stoff " + (aktuell ? (aktuell.material.name || aktuell.material.type) + "#" + aktuell.material.id : "?") + " · Gruppe " + z.label + (aktuell && aktuell.bundle ? " · BUNDLE" : "");
        treffer[k] = (treffer[k] || 0) + 1;
    }
};
RP.setBindGroup = function (i, g, ...a) { pruefe(g, "pass"); return sbg.call(this, i, g, ...a); };
const encGruppen = new WeakMap(), bundleGruppen = new WeakMap(); const fin = RB.finish, exb = RP.executeBundles, bpa = RP.beginRenderPass;
RB.setBindGroup = function (i, g, ...a) { pruefe(g, 'bundle-aufnahme'); let l = encGruppen.get(this); if (!l) encGruppen.set(this, (l = [])); const o = aktuell && aktuell.object; const kette = []; for (let p = o; p && kette.length < 5; p = p.parent) kette.unshift(p.name || p.type); l.push({ g, wer: kette.join('/') + ' · Stoff ' + (aktuell ? (aktuell.material.name || aktuell.material.type) + '#' + aktuell.material.id : '?') }); return sbgB.call(this, i, g, ...a); };
RB.finish = function (d) { const b = fin.call(this, d); bundleGruppen.set(b, { l: encGruppen.get(this) || [], label: (d && d.label) || this.label || '' }); return b; };
RP.executeBundles = function (bs) { for (const b of bs || []) { const z = bundleGruppen.get(b); if (!z) { treffer['bundle unbekannt (vor dem Haken aufgenommen)'] = (treffer['bundle unbekannt (vor dem Haken aufgenommen)'] || 0) + 1; continue; } for (const e of z.l) { const gz = gruppeZu.get(e.g); if (gz && gz.tex.some((t) => tot.has(t) && t.label === 'szene:tiefenabbild')) { const k = 'executeBundles ' + z.label + ' · ' + e.wer + ' · Gruppe ' + gz.label; treffer[k] = (treffer[k] || 0) + 1; } } } return exb.call(this, bs); };
const anh = {}; GPUCommandEncoder.prototype.beginRenderPass = undefined || GPUCommandEncoder.prototype.beginRenderPass;
const dRoh = be.draw;
be.draw = function (ro, info) { aktuell = ro; try { return dRoh.call(this, ro, info); } finally { aktuell = null; } };
let frames = 0;
const loop = r._gameLoopTick;
rend.setAnimationLoop((t) => { frames++; return loop(t); });
const warteFrames = async (n) => { const f0 = frames, t0 = performance.now(); while (frames - f0 < n && performance.now() - t0 < 30000) await new Promise((s) => setTimeout(s, 16)); };
const aus = {};
try {
    await warteFrames(20);
    rend.setPixelRatio(1.5); await warteFrames(30); // das Abbild, das die Leser jetzt binden, entsteht unter den Haken
    aus.nach1 = Object.assign({}, treffer);
    rend.setPixelRatio(1); await warteFrames(30);
    aus.nach2 = Object.assign({}, treffer);
} finally {
    rend.setAnimationLoop(null);
    TX.createView = cv; TX.destroy = de; D.createBindGroup = cbg; RP.setBindGroup = sbg; RB.setBindGroup = sbgB; be.draw = dRoh; RB.finish = fin; RP.executeBundles = exb;
}
return aus;
