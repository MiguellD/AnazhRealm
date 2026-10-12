// 1110-11 DIE STUFE OHNE BILD, live (Werkbank-eval-Rumpf): über jede lebende Instanz jeder Gruppe mit Stufen-Wahl und Maske —
// zeichnet das Fenster der Instanz-Wahl (`_instanzFenster`, halt 0) eine Stufe, die das Gesetz (`__phytoCore.lodCrossfadeMask`)
// an der Instanz-Distanz vom Auge nicht behält (±1 cm, die Toleranz der Kanten)? Gezählt und beim Namen genannt.
const pc = globalThis.__phytoCore;
const D = r.constructor.LOD_DISTANCES;
const lu = r._ensureLodUniforms();
const cfg = { d0: D.thresh01, d1: D.thresh12, fade: D.fade, fade0: D.fade0 };
const K = r.constructor._blendeKanten(pc.lodCrossfadeMask, cfg.d0, cfg.d1, cfg.fade, cfg.fade0);
const auge = lu.uLodAuge.value;
const L = { ex: auge.x, ez: auge.z, perf: lu.uLodPerf.value, ref: lu.uLodRef.value, kanten: K, halt: 0 };
const zeigt = (stufe, dS, dL) => {
    for (let k = 0; k < 256; k++) {
        const dh = (k + 0.5) / 256;
        if (stufe === 3) {
            if (pc.lodCrossfadeMask(dS, dh, cfg, 1, true, dL).f1o < dh) return true;
        } else if (pc.lodCrossfadeMask(dS, dh, cfg, stufe === "karte" ? 2 : stufe - 1, true, dL).keep) return true;
    }
    return false;
};
let proben = 0, ohneBild = 0;
const namen = {};
for (const [key, g] of r.state.archInstanceGroups) {
    if (!g || !g.mesh || !g.wahlStufe || !r._instanzFensterGilt(g)) continue;
    const m = g.mesh, a = m.instanceMatrix.array, mw = m.matrixWorld.elements, geo = m.geometry;
    for (let i = 0; i < m.count; i++) {
        const o = i * 16;
        const dx = a[o + 12] + mw[12] - L.ex, dz = a[o + 14] + mw[14] - L.ez;
        const d = Math.sqrt(dx * dx + dz * dz);
        let kS, kL;
        if (g.wahlStufe === "karte") {
            const h = Math.abs(geo.attributes.aKarte.array[i * 4 + 3]);
            if (geo.attributes.aKarte.array[i * 4 + 3] < 0) continue; // verdeckt: blendet voll
            kS = kL = Math.min(L.ref / Math.max(h, 1e-3), 1);
        } else {
            kS = Math.min(L.ref / Math.max(geo.attributes.aH0.array[i], 1e-3), 1);
            kL = Math.min(L.ref / Math.max(geo.attributes.aH0L.array[i], 1e-3), 1);
        }
        const dS = d * L.perf * kS, dL = d * L.perf * kL;
        const zeichnet = r._instanzFenster(g, i, L);
        proben++;
        if (!zeichnet) continue;
        if (zeigt(g.wahlStufe, dS, dL) || zeigt(g.wahlStufe, dS - 0.01, dL - 0.01) || zeigt(g.wahlStufe, dS + 0.01, dL + 0.01)) continue;
        ohneBild++;
        const n = String(key).split("|")[0] + " Stufe " + g.wahlStufe;
        const e = namen[n] || (namen[n] = { n: 0, dMin: Infinity, dL: null });
        e.n++;
        if (d < e.dMin) { e.dMin = +d.toFixed(2); e.dL = +dL.toFixed(2); }
    }
}
return { proben, ohneBild, namen, perf: +L.perf.toFixed(3), fenster: { l0Aus: +K.l0Aus.toFixed(2), l1Ein: +K.l1Ein.toFixed(2), l1Aus: +K.l1Aus.toFixed(2), karteEin: +K.karteEin.toFixed(2) } };
