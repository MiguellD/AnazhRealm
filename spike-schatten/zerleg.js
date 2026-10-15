// Zerlegung eines Kaskaden-Renders: Host-Haken (_passSicht vor/nach), r184-Projektion (_projectObject, oberste Ebene),
// Rest (Zeichnen + Aufbau). Funktionsrumpf für werkbank eval; SPIKE_ARG start|stop.
const st = r.state;
const csm = st.csmNode;
const rend = st.renderer;
if (!window.__spZ) {
    const Z = (window.__spZ = { an: false, inSh: -1, tiefe: 0 });
    Z.reset = () => {
        Z.k = [0, 1].map(() => ({ n: 0, total: 0, haken: 0, proj: 0, dc: 0, objekte: 0 }));
    };
    Z.reset();
    csm._shadowNodes.forEach((sn, i) => {
        const roh = sn.updateShadow;
        sn.updateShadow = function (e) {
            if (!Z.an) return roh.call(this, e);
            const ri = rend.info.render;
            const dc0 = ri.drawCalls;
            Z.inSh = i;
            const t0 = performance.now();
            try {
                return roh.call(this, e);
            } finally {
                const k = Z.k[i];
                k.total += performance.now() - t0;
                k.n++;
                k.dc += ri.drawCalls - dc0;
                Z.inSh = -1;
            }
        };
    });
    const ps = r._passSicht;
    r._passSicht = function (kamera, nach) {
        if (!Z.an || Z.inSh < 0) return ps.call(this, kamera, nach);
        const t0 = performance.now();
        try {
            return ps.call(this, kamera, nach);
        } finally {
            Z.k[Z.inSh].haken += performance.now() - t0;
        }
    };
    const po = rend._projectObject;
    rend._projectObject = function (...a) {
        if (!Z.an || Z.inSh < 0) return po.apply(this, a);
        if (Z.tiefe > 0) {
            Z.k[Z.inSh].objekte++;
            Z.tiefe++;
            try {
                return po.apply(this, a);
            } finally {
                Z.tiefe--;
            }
        }
        Z.tiefe = 1;
        Z.k[Z.inSh].objekte++;
        const t0 = performance.now();
        try {
            return po.apply(this, a);
        } finally {
            Z.tiefe = 0;
            Z.k[Z.inSh].proj += performance.now() - t0;
        }
    };
}
const Z = window.__spZ;
const arg = typeof SPIKE_ARG !== "undefined" ? SPIKE_ARG : "stop";
if (arg === "start") {
    Z.reset();
    Z.an = true;
    return { gestartet: true, projectObject: typeof rend._projectObject };
}
Z.an = false;
return Z.k.map((k, i) => ({
    kaskade: i,
    renders: k.n,
    usJeRender: Math.round((1000 * k.total) / Math.max(1, k.n)),
    hakenUs: Math.round((1000 * k.haken) / Math.max(1, k.n)),
    projektionUs: Math.round((1000 * k.proj) / Math.max(1, k.n)),
    restUs: Math.round((1000 * (k.total - k.haken - k.proj)) / Math.max(1, k.n)),
    dc: +(k.dc / Math.max(1, k.n)).toFixed(1),
    objekteJeRender: Math.round(k.objekte / Math.max(1, k.n)),
}));
