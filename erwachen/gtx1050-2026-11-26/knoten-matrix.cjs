// je Stand: der größte Winkel zwischen der MATRIX-Mischung zweier Stützstellen (Spalten auf Länge 1, wie GPU und Linse) und der
// wahren Drehung des Gelenks im Raum der Wurzel — über Leiber mit anderer Ruhe der Arme (0 … 1,2 × Spreiz) und beide Beine
require(process.argv[2]);
const K = globalThis.__koerperCore, M = K.MOTION, ST = K.STAND;
const VOR = [-1, 0, 1, 1, 3, 4, 1, 6, 7, 0, 9, 10, 0, 12, 13];
const NM = ["becken", "rumpf", "kopf", "schulterL", "ellbogenL", "handL", "schulterR", "ellbogenR", "handR", "hüfteL", "knieL", "fußL", "hüfteR", "knieR", "fußR"];
const spreiz = K.__armSpreiz;
const eul = (ro) => {
    const a = Math.cos(ro.x), b = Math.sin(ro.x), c = Math.cos(ro.y), d = Math.sin(ro.y), e = Math.cos(ro.z), f = Math.sin(ro.z);
    return [c * e, -c * f, d, a * f + b * e * d, a * e - b * f * d, -b * c, b * f - a * e * d, b * e + a * f * d, a * c];
};
const mal = (A, B) => { const C = new Array(9); for (let r = 0; r < 3; r++) for (let k = 0; k < 3; k++) C[r * 3 + k] = A[r * 3] * B[k] + A[r * 3 + 1] * B[3 + k] + A[r * 3 + 2] * B[6 + k]; return C; };
const pose = (r, nm, mp, t, seite) => {
    K.leibRigNeutral(r); K.leibRigEingeschwungen(r); r.standTun = K.leibStandTun(nm); r.standSeite = seite;
    K.leibRigPose(r, t, 0, false, null, mp, M.idle, null, null, null, null);
    const W = [];
    r._gelenke.forEach((g, i) => { const m = eul(g.rotation); W.push(VOR[i] < 0 ? m : mal(W[VOR[i]], m)); });
    return W;
};
const winkel = (Tm, A, B, u) => {
    const X = A.map((v, i) => v * (1 - u) + B[i] * u);
    for (let s = 0; s < 3; s++) { const l = Math.hypot(X[s], X[3 + s], X[6 + s]) || 1; X[s] /= l; X[3 + s] /= l; X[6 + s] /= l; }
    // R = Tᵀ · X
    const E = (p, z) => Tm[p] * X[z] + Tm[3 + p] * X[3 + z] + Tm[6 + p] * X[6 + z];
    const v = Math.hypot(E(2, 1) - E(1, 2), E(0, 2) - E(2, 0), E(1, 0) - E(0, 1)) / 2;
    return Math.atan2(v, (E(0, 0) + E(1, 1) + E(2, 2) - 1) / 2);
};
let ges = 0;
for (const nm of (process.argv[3] || "showcase,joy,pwalk,pwalk/lehrling,idle,sad,fight").split(",")) {
    const mp = K.leibSatzProfil(M, nm);
    const t0 = Date.now(); const kn = K.leibStandKnoten(nm, mp, M.idle); const ms = Date.now() - t0;
    let max = 0, wo = "";
    for (const seite of [0, 1])
        for (let f = 0; f <= 1.2001; f += 0.1) {
            const r = K.__standProbeRig((f * spreiz * Math.PI) / 180);
            const P = [...kn, 1].map((p) => pose(r, nm, mp, p * ST.zyklus, seite));
            for (let t = 0; t < ST.zyklus; t += 0.005) {
                const p = t / ST.zyklus; let lo = 0; while (lo + 1 < kn.length && kn[lo + 1] <= p) lo++;
                const a = kn[lo], b = lo + 1 < kn.length ? kn[lo + 1] : 1, u = (p - a) / (b - a);
                const W = pose(r, nm, mp, t, seite);
                for (let g = 0; g < 15; g++) { const w = winkel(W[g], P[lo][g], P[lo + 1][g], u); if (w > max) [max, wo] = [w, NM[g] + " · Bein " + seite + " · Ruhe " + f.toFixed(1) + " · t " + t.toFixed(2) + " · Strecke " + ((b - a) * ST.zyklus).toFixed(2) + " s"]; }
            }
        }
    ges += kn.length + 1;
    console.log(nm, "Knoten", kn.length, "ms", ms, "größter Winkel °", ((max * 180) / Math.PI).toFixed(3), wo);
}
console.log("Zeilen je Bein", ges);
