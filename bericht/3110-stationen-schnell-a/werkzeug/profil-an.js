// Profil der Seite: Hüllen um die teuren Glieder (Zeit + Zahl), `window.__profil` sammelt; zweimal installiert ersetzt es nichts doppelt
const P = (window.__profil = { t0: performance.now(), je: {} });
const huelle = (wo, name, label) => {
    const alt = wo["__alt_" + name] || wo[name];
    if (typeof alt !== "function") return;
    wo["__alt_" + name] = alt;
    wo[name] = function (...a) {
        const t = performance.now();
        const e = (P.je[label] = P.je[label] || { n: 0, ms: 0 });
        e.n++;
        const v = alt.apply(this, a);
        if (v && typeof v.then === "function") return v.finally(() => (e.ms += performance.now() - t));
        e.ms += performance.now() - t;
        return v;
    };
};
for (const n of ["__ausgabeAufnahme", "__weltStehtWarten", "__erstRuhe", "__png", "__abnahmeMessen", "__bildMasse", "__klassenTeilung", "__bildRauschen", "__spiegelDaten", "__nahDeckung", "__farbtonProbe", "__buehne"])
    huelle(window, n, n);
// der Boden-Leser: nur zählen (eine Zeit je Ruf verfälschte ihn)
const altB = r.__alt__bodenSichtAt || r._bodenSichtAt;
r.__alt__bodenSichtAt = altB;
P.boden = 0;
r._bodenSichtAt = function (...a) {
    P.boden++;
    return altB.apply(this, a);
};
for (const n of ["_tickNahWiese", "_tickNahStreu", "_leuchtTakt", "_schattenAlleNeu", "_loopRender", "_tickBauSatz"]) huelle(r, n, "r." + n);
return Object.keys(P.je).length;
