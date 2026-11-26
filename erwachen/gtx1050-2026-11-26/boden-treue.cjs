// joy je Boden der Schulter: Zahl der Stützstellen und der größte Winkel der Matrix-Mischung am Leib mit DIESEM Boden
require(process.argv[2]);
const K = globalThis.__koerperCore, M = K.MOTION, ST = K.STAND;
const VOR = [-1, 0, 1, 1, 3, 4, 1, 6, 7, 0, 9, 10, 0, 12, 13];
const eul = (ro) => { const a = Math.cos(ro.x), b = Math.sin(ro.x), c = Math.cos(ro.y), d = Math.sin(ro.y), e = Math.cos(ro.z), f = Math.sin(ro.z); return [c * e, -c * f, d, a * f + b * e * d, a * e - b * f * d, -b * c, b * f - a * e * d, b * e + a * f * d, a * c]; };
const mal = (A, B) => { const C = new Array(9); for (let r = 0; r < 3; r++) for (let k = 0; k < 3; k++) C[r * 3 + k] = A[r * 3] * B[k] + A[r * 3 + 1] * B[3 + k] + A[r * 3 + 2] * B[6 + k]; return C; };
const winkel = (Tm, A, B, u) => { const X = A.map((v, i) => v * (1 - u) + B[i] * u); for (let s = 0; s < 3; s++) { const l = Math.hypot(X[s], X[3 + s], X[6 + s]) || 1; X[s] /= l; X[3 + s] /= l; X[6 + s] /= l; } const E = (p, z) => Tm[p] * X[z] + Tm[3 + p] * X[3 + z] + Tm[6 + p] * X[6 + z]; return Math.atan2(Math.hypot(E(2, 1) - E(1, 2), E(0, 2) - E(2, 0), E(1, 0) - E(0, 1)) / 2, (E(0, 0) + E(1, 1) + E(2, 2) - 1) / 2); };
for (const nm of (process.argv[3] || "joy").split(",")) {
    const mp = K.leibSatzProfil(M, nm);
    let ms = 0, teile = 0;
    for (const grad of [0, 3, 6.25, 9, 13, 17, 21.25, 25]) {
        const r = K.__standProbeRig((grad * Math.PI) / 180), F = K.leibStandBoden({ armRuhe: [{ shoulder: [0, 0, (grad * Math.PI) / 180] }] });
        const t0 = process.hrtime.bigint(); let kn = null, rufe = 0;
        while (!kn) { kn = K.leibStandKnoten(nm, mp, M.idle, 24, F); rufe++; }
        ms = Number(process.hrtime.bigint() - t0) / 1e6; teile = rufe;
        const pose = (t, seite) => { K.leibRigNeutral(r); K.leibRigEingeschwungen(r); r.standTun = K.leibStandTun(nm); r.standSeite = seite; K.leibRigPose(r, t, 0, false, null, mp, M.idle, null, null, null, null); const W = []; r._gelenke.forEach((g, i) => { const m = eul(g.rotation); W.push(VOR[i] < 0 ? m : mal(W[VOR[i]], m)); }); return W; };
        let max = 0;
        for (const seite of [0, 1]) {
            const P = [...kn, 1].map((p) => pose(p * ST.zyklus, seite));
            for (let t = 0; t < ST.zyklus; t += 0.005) { const p = t / ST.zyklus; let lo = 0; while (lo + 1 < kn.length && kn[lo + 1] <= p) lo++; const a = kn[lo], b = lo + 1 < kn.length ? kn[lo + 1] : 1, u = (p - a) / (b - a), W = pose(t, seite); for (let g = 0; g < 15; g++) max = Math.max(max, winkel(W[g], P[lo][g], P[lo + 1][g], u)); }
        }
        console.log(nm, "Ruhe", grad + "°", "Boden", ((F * 180) / Math.PI).toFixed(2) + "°", "Schlüssel", K.leibStandSchluessel(nm, mp, M.idle, F).slice(0, 14), "Knoten", kn.length, "größter Winkel", ((max * 180) / Math.PI).toFixed(3) + "°", "· Suche", ms.toFixed(1), "ms in", teile, "Rufen zu 24 Proben");
    }
}
