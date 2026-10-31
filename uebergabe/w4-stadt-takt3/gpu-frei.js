// GPU-FREI (Mess-Schalter der Sitzung, nie im Baum; nachgebaut nach w4-stadt-takt2): die Zeichen- und Rechen-Befehle der
// Pässe und Bündel gehen nicht an swiftshader — die JS-Arbeit des Haupt-Fadens (three: Render-Objekte, Bindungen,
// Pipelines, Puffer, Kodierung bis zum Befehl) bleibt ganz.
// an: `__gpuFrei(true)`, aus: `__gpuFrei(false)`; Rückgabe: Zahl der geschluckten Befehle seit dem An.
window.__gpuFrei = (an) => {
    const W = window;
    if (an && !W.__gpuFreiAlt) {
        W.__gpuFreiN = 0;
        W.__gpuFreiAlt = [];
        const P = [GPURenderPassEncoder.prototype, GPURenderBundleEncoder.prototype, GPUComputePassEncoder.prototype];
        for (const p of P)
            for (const k of ["draw", "drawIndexed", "drawIndirect", "drawIndexedIndirect", "executeBundles", "dispatchWorkgroups", "dispatchWorkgroupsIndirect"])
                if (typeof p[k] === "function") {
                    W.__gpuFreiAlt.push([p, k, p[k]]);
                    p[k] = function () {
                        W.__gpuFreiN++;
                    };
                }
    } else if (!an && W.__gpuFreiAlt) {
        for (const [p, k, f] of W.__gpuFreiAlt) p[k] = f;
        W.__gpuFreiAlt = null;
    }
    return W.__gpuFreiN | 0;
};
return typeof window.__gpuFrei;
