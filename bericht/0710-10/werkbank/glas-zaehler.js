// werkbank eval: DER BRENNGLAS-ZÄHLER (0710-10) — je Brennglas-Takt: Bestand, Brenngläser, Brennpunkte, Ziele in Reichweite,
// Tag-Rechnungen, Brennpunkt-Proben. Ruf ohne __glasCmd: an (Hüllen setzen); mit "aus": lesen und abnehmen.
const P = Object.getPrototypeOf(r);
if (window.__glasCmd !== "aus") {
    const Z = (window.__glasZ = { takte: 0, bestand: 0, glaeser: 0, punkte: 0, tags: 0, traegt: 0, inTakt: false });
    r._tickFocusingAffordances = function (dt) {
        Z.takte++;
        const archs = this.state.architectures || [];
        Z.bestand += archs.length;
        Z.glaeser += archs.filter((e) => e.affordances && e.affordances.focusing).length;
        Z.inTakt = true;
        try {
            return P._tickFocusingAffordances.call(this, dt);
        } finally {
            Z.inTakt = false;
        }
    };
    r._brennpunkte = function (...a) {
        const o = P._brennpunkte.apply(this, a);
        if (Z.inTakt) Z.punkte += o.length;
        return o;
    };
    r.computeCompoundTags = function (...a) {
        if (Z.inTakt) Z.tags++;
        return P.computeCompoundTags.apply(this, a);
    };
    r._traegtPunkt = function (...a) {
        if (Z.inTakt) Z.traegt++;
        return P._traegtPunkt.apply(this, a);
    };
    return "an";
}
const Z = window.__glasZ || {};
for (const k of ["_tickFocusingAffordances", "_brennpunkte", "computeCompoundTags", "_traegtPunkt"]) delete r[k];
const n = Math.max(1, Z.takte);
return {
    takte: Z.takte,
    bestandJeTakt: Math.round(Z.bestand / n),
    glaeserJeTakt: +(Z.glaeser / n).toFixed(1),
    punkteJeTakt: +(Z.punkte / n).toFixed(1),
    tagsJeTakt: +(Z.tags / n).toFixed(1),
    traegtJeTakt: +(Z.traegt / n).toFixed(1),
    wetter: r.state.weather,
    sonne: r._sonnenRichtung ? r._sonnenRichtung() : null,
};
