// werkbank eval: DER ZIEL-ZÄHLER (0710-10) — je Brennglas-Takt: Bestand, Gläser (aus dem Takt), Ziele (der neue Takt:
// `_brennZiele`; der alte: der Bestand). Ruf ohne __zielCmd: an; mit "aus": lesen und abnehmen.
if (window.__zielCmd !== "aus") {
    const P = Object.getPrototypeOf(r);
    const Z = (window.__zielZ = { takte: 0, bestand: 0, ziele: 0, neu: 0 });
    r._tickFocusingAffordances = function (dt) {
        Z.takte++;
        const n = (this.state.architectures || []).length;
        Z.bestand += n;
        if (this._brennZiele) this._brennZiele.length = 0;
        const o = P._tickFocusingAffordances.call(this, dt);
        const neu = String(P._tickFocusingAffordances).includes("_blockerMit");
        if (neu) Z.neu++;
        Z.ziele += neu ? (this._brennZiele ? this._brennZiele.length : 0) : n;
        return o;
    };
    return "an";
}
const Z = window.__zielZ || {};
delete r._tickFocusingAffordances;
const n = Math.max(1, Z.takte);
return {
    takte: Z.takte,
    neu: Z.neu,
    bestandJeTakt: Math.round(Z.bestand / n),
    zieleJeTakt: +(Z.ziele / n).toFixed(2),
    wetter: r.state.weather,
};
