// werkbank eval: DER TIER-LEIB-ZÄHLER (0710-7 Nachtrag) — je Frame: Aufrufe von `_kreaturHuellenKontakt`, Neubauten der
// Nähe-Liste (und wie viele Bauten der Bestand dabei durchläuft), Länge der Liste, Box-Prüfungen (`_boxAbstand2`) und
// Lösungen (`_resolveCapsuleVsAABB`) je Aufruf. Befehl: an | aus.
const cmd = window.__tierCmd || "aus";
const P = Object.getPrototypeOf(r);
if (cmd === "an") {
    const Z = (window.__tierZ = { frames: 0, rufe: 0, neubau: 0, bestand: 0, liste: 0, abstand: 0, loesungen: 0, fragen: 0, kand: 0, inRuf: false });
    r._kreaturHuellenKontakt = function (c, L, px0, pz0) {
        Z.rufe++;
        const vor = c.userData && c.userData._huellenNah;
        const vorT = vor ? vor.t : null;
        const vorX = vor ? vor.x : null;
        Z.inRuf = true;
        try {
            return P._kreaturHuellenKontakt.call(this, c, L, px0, pz0);
        } finally {
            Z.inRuf = false;
            const nach = c.userData && c.userData._huellenNah;
            if (nach && (!vor || nach.t !== vorT || nach.x !== vorX)) {
                Z.neubau++;
                Z.bestand += (this.state.architectures || []).length;
            }
            if (nach) Z.liste += nach.liste.length;
        }
    };
    if (typeof P._blockerUmPlatz === "function")
        r._blockerUmPlatz = function (x, z, w, out) {
            const n0 = out.length;
            const o = P._blockerUmPlatz.call(this, x, z, w, out);
            if (Z.inRuf) {
                Z.fragen++;
                Z.kand += o.length - n0;
            }
            return o;
        };
    r._boxAbstand2 = function (...a) {
        if (Z.inRuf) Z.abstand++;
        return P._boxAbstand2.apply(this, a);
    };
    r._resolveCapsuleVsAABB = function (...a) {
        if (Z.inRuf) Z.loesungen++;
        return P._resolveCapsuleVsAABB.apply(this, a);
    };
    r._loopCamera = function (...a) {
        Z.frames++;
        return P._loopCamera.apply(this, a);
    };
    return "an";
}
const Z = window.__tierZ || {};
for (const k of ["_kreaturHuellenKontakt", "_blockerUmPlatz", "_boxAbstand2", "_resolveCapsuleVsAABB", "_loopCamera"]) delete r[k];
const f = Math.max(1, Z.frames),
    n = Math.max(1, Z.rufe);
return {
    frames: Z.frames,
    tiere: (r.state.creatures || []).length,
    rufeJeFrame: +(Z.rufe / f).toFixed(2),
    neubauJeFrame: +(Z.neubau / f).toFixed(3),
    bestandJeNeubau: Math.round(Z.bestand / Math.max(1, Z.neubau)),
    bestandJeFrame: Math.round(Z.bestand / f),
    angefasstJeNeubau: Z.fragen ? Math.round(Z.kand / Z.fragen) : Math.round(Z.bestand / Math.max(1, Z.neubau)),
    angefasstJeFrame: Z.fragen ? Math.round(Z.kand / f) : Math.round(Z.bestand / f),
    listeJeRuf: +(Z.liste / n).toFixed(1),
    abstandJeRuf: +(Z.abstand / n).toFixed(1),
    loesungenJeRuf: +(Z.loesungen / n).toFixed(2),
    reste: Object.keys(r).filter((k) => /_kreaturHuellen|_boxAbstand2|_resolveCapsule|_loopCamera/.test(k)),
};
