// werkbank eval: DER RENDER-ZÄHLER (0710-11, Teil 2) — je gerendertem Frame die render-Phase (`_perfSenseLap("render")` =
// `_loopShadowUpdate` + `_loopRender`) und ihre Zerlegung IN der Phase: Schatten, `_loopRender`, darin `renderer.render` und
// die WebGPU-Rufe `getCurrentTexture`, `queue.submit`, `queue.writeBuffer`; dieselben Rufe AUSSERHALB der Phase je Sekunde
// (andere Renders im Takt: Karten backen, Vorschauen). Dazu eine Dosis (`window.__spinMs`): so viele ms Rechnung im Takt vor
// dem Render (Hülle um `tickAffordances`). Ruf ohne __renderCmd: an; mit "aus": lesen und abnehmen.
const P = Object.getPrototypeOf(r);
if (window.__renderCmd !== "aus") {
    const neu = () => ({ schatten: 0, lr: 0, rr: 0, gct: 0, submit: 0, wb: 0 });
    const Z = (window.__renderZ = { rows: [], f: neu(), aus: neu(), ausN: { rr: 0 }, t0: performance.now(), phase: false });
    r._perfSenseLap = function (label, since) {
        const now = P._perfSenseLap.call(this, label, since);
        if (label === "render") {
            Z.rows.push(Object.assign({ render: now - since }, Z.f));
            Z.f = neu();
        }
        return now;
    };
    const zeit = (name, feld) =>
        function (...a) {
            const t0 = performance.now();
            const war = Z.phase;
            Z.phase = true;
            try {
                return P[name].apply(this, a);
            } finally {
                Z.phase = war;
                Z.f[feld] += performance.now() - t0;
            }
        };
    r._loopShadowUpdate = zeit("_loopShadowUpdate", "schatten");
    r._loopRender = zeit("_loopRender", "lr");
    const rend = r.state.renderer;
    const rrEcht = Object.getPrototypeOf(rend).render;
    rend.render = function (...a) {
        const t0 = performance.now();
        try {
            return rrEcht.apply(this, a);
        } finally {
            const d = performance.now() - t0;
            if (Z.phase) Z.f.rr += d;
            else {
                Z.aus.rr += d;
                Z.ausN.rr++;
            }
        }
    };
    const huelle = (proto, name, feld) => {
        const echt = proto[name];
        if (!echt || echt.__renderHuelle) return;
        const h = function (...a) {
            const t0 = performance.now();
            try {
                return echt.apply(this, a);
            } finally {
                (Z.phase ? Z.f : Z.aus)[feld] += performance.now() - t0;
            }
        };
        h.__renderHuelle = echt;
        proto[name] = h;
    };
    if (window.GPUCanvasContext) huelle(GPUCanvasContext.prototype, "getCurrentTexture", "gct");
    if (window.GPUQueue) {
        huelle(GPUQueue.prototype, "submit", "submit");
        huelle(GPUQueue.prototype, "writeBuffer", "wb");
    }
    const spin = Number(window.__spinMs) || 0;
    if (spin > 0)
        r.tickAffordances = function (dt) {
            const t0 = performance.now();
            while (performance.now() - t0 < spin);
            return P.tickAffordances.call(this, dt);
        };
    return { an: true, spin };
}
const Z = window.__renderZ || { rows: [] };
for (const k of ["_perfSenseLap", "_loopShadowUpdate", "_loopRender", "tickAffordances"]) delete r[k];
delete r.state.renderer.render;
for (const [proto, name] of [
    [window.GPUCanvasContext && GPUCanvasContext.prototype, "getCurrentTexture"],
    [window.GPUQueue && GPUQueue.prototype, "submit"],
    [window.GPUQueue && GPUQueue.prototype, "writeBuffer"],
])
    if (proto && proto[name] && proto[name].__renderHuelle) proto[name] = proto[name].__renderHuelle;
const q = (a, p) => {
    const s = a.slice().sort((x, y) => x - y);
    return s.length ? +s[Math.min(s.length - 1, Math.floor(p * s.length))].toFixed(3) : null;
};
const m = (a) => (a.length ? +(a.reduce((x, y) => x + y, 0) / a.length).toFixed(3) : null);
const spalte = (k) => {
    const a = Z.rows.map((x) => x[k]);
    return { mittel: m(a), p50: q(a, 0.5), p95: q(a, 0.95) };
};
const sek = Math.max(0.001, (performance.now() - Z.t0) / 1000);
const el = document.getElementById("ladeschirm");
return {
    frames: Z.rows.length,
    inPhase: {
        render: spalte("render"),
        schatten: spalte("schatten"),
        loopRender: spalte("lr"),
        rendererRender: spalte("rr"),
        getCurrentTexture: spalte("gct"),
        submit: spalte("submit"),
        writeBuffer: spalte("wb"),
    },
    ausserPhaseJeSek: {
        rendererRenderMs: +(Z.aus.rr / sek).toFixed(2),
        rendererRenderN: +(Z.ausN.rr / sek).toFixed(1),
        getCurrentTextureMs: +(Z.aus.gct / sek).toFixed(2),
        submitMs: +(Z.aus.submit / sek).toFixed(2),
        writeBufferMs: +(Z.aus.wb / sek).toFixed(2),
    },
    ewma: r.state.perfSense && r.state.perfSense.phase ? +(+r.state.perfSense.phase.render).toFixed(3) : null,
    ladeschirm: el
        ? {
              hidden: el.hidden,
              display: getComputedStyle(el).display,
              opacity: getComputedStyle(el).opacity,
              klasse: el.className,
          }
        : null,
    weltbildDa: r.state._weltbildDa || null,
};
