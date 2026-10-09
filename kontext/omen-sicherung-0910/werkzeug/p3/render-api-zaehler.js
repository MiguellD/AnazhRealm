// werkbank eval: DER API-ZÄHLER (0710-11, Teil 2, V4) — in der render-Phase (`_loopShadowUpdate` + `_loopRender`) die Zeit
// in JEDER WebGPU-Methode (alle Funktionen der GPU*-Prototypen), je Frame summiert: API gegen den Rest (JS von three und Spiel),
// dazu die teuerste Methode und der längste Einzelruf. Dosis wie im Render-Zähler (`window.__spinMs`). Ruf ohne __apiCmd: an;
// mit "aus": lesen und abnehmen.
const P = Object.getPrototypeOf(r);
if (window.__apiCmd !== "aus") {
    const Z = (window.__apiZ = { rows: [], f: { api: 0, n: 0 }, phase: false, je: {}, max: { ms: 0, wo: null }, huellen: [] });
    r._perfSenseLap = function (label, since) {
        const now = P._perfSenseLap.call(this, label, since);
        if (label === "render") {
            Z.rows.push({ render: now - since, api: Z.f.api, n: Z.f.n });
            Z.f = { api: 0, n: 0 };
        }
        return now;
    };
    const phase = (name) =>
        function (...a) {
            const war = Z.phase;
            Z.phase = true;
            try {
                return P[name].apply(this, a);
            } finally {
                Z.phase = war;
            }
        };
    r._loopShadowUpdate = phase("_loopShadowUpdate");
    r._loopRender = phase("_loopRender");
    const klassen = Object.getOwnPropertyNames(window).filter((k) => /^GPU[A-Z]/.test(k) && typeof window[k] === "function");
    for (const k of klassen) {
        const proto = window[k].prototype;
        if (!proto) continue;
        for (const m of Object.getOwnPropertyNames(proto)) {
            const d = Object.getOwnPropertyDescriptor(proto, m);
            if (!d || typeof d.value !== "function" || m === "constructor" || d.value.__apiHuelle) continue;
            const echt = d.value;
            const key = k + "." + m;
            const h = function (...a) {
                if (!Z.phase) return echt.apply(this, a);
                const t0 = performance.now();
                try {
                    return echt.apply(this, a);
                } finally {
                    const dt = performance.now() - t0;
                    Z.f.api += dt;
                    Z.f.n++;
                    const j = (Z.je[key] = Z.je[key] || { ms: 0, n: 0 });
                    j.ms += dt;
                    j.n++;
                    if (dt > Z.max.ms) Z.max = { ms: dt, wo: key };
                }
            };
            h.__apiHuelle = echt;
            try {
                Object.defineProperty(proto, m, Object.assign({}, d, { value: h }));
                Z.huellen.push([proto, m, d]);
            } catch (_e) {
                /* nicht schreibbar */
            }
        }
    }
    window.__apiHuellen = Z.huellen;
    const spin = Number(window.__spinMs) || 0;
    if (spin > 0)
        r.tickAffordances = function (dt) {
            const t0 = performance.now();
            while (performance.now() - t0 < spin);
            return P.tickAffordances.call(this, dt);
        };
    return { an: true, spin, huellen: Z.huellen.length };
}
const Z = window.__apiZ || { rows: [], je: {} };
for (const k of ["_perfSenseLap", "_loopShadowUpdate", "_loopRender", "tickAffordances"]) delete r[k];
for (const [proto, m, d] of window.__apiHuellen || []) Object.defineProperty(proto, m, d);
window.__apiHuellen = null;
const n = Math.max(1, Z.rows.length);
const m = (k) => +(Z.rows.reduce((s, x) => s + x[k], 0) / n).toFixed(3);
const top = Object.entries(Z.je)
    .sort((a, b) => b[1].ms - a[1].ms)
    .slice(0, 8)
    .map(([k, v]) => ({ k, msJeFrame: +(v.ms / n).toFixed(3), rufeJeFrame: +(v.n / n).toFixed(1) }));
return {
    frames: Z.rows.length,
    render: m("render"),
    api: m("api"),
    rest: +(m("render") - m("api")).toFixed(3),
    rufeJeFrame: +(Z.rows.reduce((s, x) => s + x.n, 0) / n).toFixed(1),
    laengsterRuf: { ms: +Z.max.ms.toFixed(3), wo: Z.max.wo },
    top,
};
