// werkbank eval: DER RAUM-TAG-ZÄHLER (0710-10, Offen) — je `computeSpatialTags`-Ruf: Rufer (Boosts / sonst), Bauplan, Teile,
// Zeit. Ruf ohne __raumCmd: an (Hüllen setzen); mit "aus": lesen und abnehmen.
const P = Object.getPrototypeOf(r);
if (window.__raumCmd !== "aus") {
    const Z = (window.__raumZ = { rufe: 0, ms: 0, max: 0, boostTakte: 0, boostMs: 0, boostMax: 0, imBoost: false, je: {} });
    r.computeSpatialTags = function (bp) {
        const t0 = performance.now();
        const o = P.computeSpatialTags.call(this, bp);
        const d = performance.now() - t0;
        Z.rufe++;
        Z.ms += d;
        if (d > Z.max) Z.max = d;
        const k = (bp && (bp.name || bp.label)) || "?";
        const j = (Z.je[k] = Z.je[k] || { rufe: 0, ms: 0, teile: bp && bp.parts ? bp.parts.length : 0, boost: 0 });
        j.rufe++;
        j.ms += d;
        if (Z.imBoost) j.boost++;
        return o;
    };
    r.tickPlayerBoosts = function (t) {
        const vor = this.state.player ? this.state.player.boostLastTick : null;
        Z.imBoost = true;
        const t0 = performance.now();
        try {
            return P.tickPlayerBoosts.call(this, t);
        } finally {
            const d = performance.now() - t0;
            Z.imBoost = false;
            if (this.state.player && this.state.player.boostLastTick !== vor) {
                Z.boostTakte++;
                Z.boostMs += d;
                if (d > Z.boostMax) Z.boostMax = d;
            }
        }
    };
    return "an";
}
const Z = window.__raumZ || {};
delete r.computeSpatialTags;
delete r.tickPlayerBoosts;
const top = Object.entries(Z.je || {})
    .sort((a, b) => b[1].ms - a[1].ms)
    .slice(0, 12)
    .map(([k, v]) => ({ bauplan: k, rufe: v.rufe, boost: v.boost, teile: v.teile, ms: +v.ms.toFixed(2), msJeRuf: +(v.ms / v.rufe).toFixed(3) }));
const pm = r.state.playerMesh && r.state.playerMesh.position;
const R = r.constructor.BOOST_RESONANCE_RADIUS;
const nahe = pm ? r.state.architectures.filter((e) => e && e.position && Math.hypot(e.position.x - pm.x, e.position.z - pm.z) <= R).length : null;
return {
    rufe: Z.rufe,
    ms: +(Z.ms || 0).toFixed(2),
    maxRuf: +(Z.max || 0).toFixed(2),
    boostTakte: Z.boostTakte,
    boostMsJeTakt: +((Z.boostMs || 0) / Math.max(1, Z.boostTakte)).toFixed(2),
    boostMax: +(Z.boostMax || 0).toFixed(2),
    rufeJeBoostTakt: +(Object.values(Z.je || {}).reduce((s, v) => s + v.boost, 0) / Math.max(1, Z.boostTakte)).toFixed(1),
    radius: R,
    naheEintraege: nahe,
    top,
};
