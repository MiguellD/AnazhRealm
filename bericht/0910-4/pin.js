// 0910-4: das Bild-Instrument am Ring — Uhren und TRAA-Phase fest, die Membranen auf EINEN Zustand (Zeit 1000, act 0,6)
r._loopSkyboxZeit = function () {
    if (this.state.skyboxUniforms && this.state.skyboxUniforms.time) this.state.skyboxUniforms.time.value = 1000;
};
r._loopSkyboxZeit();
window.__jitterStart = 0;
if (!window.__ausgabeAufnahmeRoh) window.__ausgabeAufnahmeRoh = window.__ausgabeAufnahme;
const A0 = window.__ausgabeAufnahmeRoh;
const membranFest = () => {
    for (const rec of (r._portalMembranes || new Map()).values()) {
        const MG = rec.tor.gesetz;
        rec.u.time.value = 1000;
        rec.u.act.value = 0.6;
        rec.u.pulse.value = 1;
        rec.u.waveDepth.value = rec.tor.mu.zFace * (MG.aktivDepth[0] + MG.aktivDepth[1] * 0.6);
        if (rec.mesh) rec.mesh.visible = true;
    }
};
window.__ausgabeAufnahme = function (...a) {
    if (r.state.traaNode) r.state.traaNode._jitterIndex = window.__jitterStart;
    membranFest();
    return A0.apply(this, a);
};
for (const c of r.state.creatures || []) c.visible = false;
const P = Object.getPrototypeOf(r);
r._loopRender = function () {
    membranFest();
    return P._loopRender.call(this, 1000);
};
const nf = r.state.renderer._nodes.nodeFrame;
nf.update = function () {
    this.frameId++;
    this.deltaTime = 0;
    this.time = 1000;
};
membranFest();
return { membranen: (r._portalMembranes || new Map()).size };
