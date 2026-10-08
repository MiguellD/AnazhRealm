// werkbank eval: DER TACHO (0710-11, Teil 2, V5) — eine feste Referenz-Rechnung am Anfang jeder render-Phase (vor
// `_loopRender`), ihre Zeit je Frame: dieselbe Arbeit, gemessen am Takt der CPU. Dazu die render-Phase selbst und die Dosis
// (`window.__spinMs`). Ruf ohne __tachoCmd: an; mit "aus": lesen und abnehmen.
const P = Object.getPrototypeOf(r);
if (window.__tachoCmd !== "aus") {
    const Z = (window.__tachoZ = { rows: [], ref: 0, senke: 0 });
    const REF = 40000;
    r._perfSenseLap = function (label, since) {
        const now = P._perfSenseLap.call(this, label, since);
        if (label === "render") Z.rows.push({ render: now - since, ref: Z.ref });
        return now;
    };
    r._loopRender = function (...a) {
        const t0 = performance.now();
        let x = 0;
        for (let i = 1; i <= REF; i++) x += Math.sqrt(i * 1.0001) / i;
        Z.ref = performance.now() - t0;
        Z.senke += x;
        return P._loopRender.apply(this, a);
    };
    const spin = Number(window.__spinMs) || 0;
    if (spin > 0)
        r.tickAffordances = function (dt) {
            const t0 = performance.now();
            while (performance.now() - t0 < spin);
            return P.tickAffordances.call(this, dt);
        };
    return { an: true, spin, isolated: !!window.crossOriginIsolated };
}
const Z = window.__tachoZ || { rows: [] };
for (const k of ["_perfSenseLap", "_loopRender", "tickAffordances"]) delete r[k];
const n = Math.max(1, Z.rows.length);
const m = (k) => +(Z.rows.reduce((s, x) => s + x[k], 0) / n).toFixed(4);
const q = (k, p) => {
    const s = Z.rows.map((x) => x[k]).sort((a, b) => a - b);
    return s.length ? +s[Math.min(s.length - 1, Math.floor(p * s.length))].toFixed(4) : null;
};
return {
    frames: Z.rows.length,
    renderMittel: m("render"),
    renderOhneRef: +(m("render") - m("ref")).toFixed(4),
    refMittel: m("ref"),
    refP50: q("ref", 0.5),
    refP10: q("ref", 0.1),
    refP90: q("ref", 0.9),
};
