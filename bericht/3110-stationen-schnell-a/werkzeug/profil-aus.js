// Profil lesen und die Hüllen abnehmen (ein Glied des Prototyps fällt als eigenes wieder weg)
const P = window.__profil || {};
const aus = { ms: Math.round(performance.now() - (P.t0 || 0)), boden: P.boden, je: Object.fromEntries(Object.entries(P.je || {}).map(([k, v]) => [k, [v.n, Math.round(v.ms)]])) };
for (const k of Object.keys(window)) if (k.startsWith("__alt_")) (window[k.slice(6)] = window[k]), delete window[k];
const proto = Object.getPrototypeOf(r);
for (const k of Object.keys(r))
    if (k.startsWith("__alt_")) {
        const n = k.slice(6);
        if (r[k] === proto[n]) delete r[n];
        else r[n] = r[k];
        delete r[k];
    }
return aus;
