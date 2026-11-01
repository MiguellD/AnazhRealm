// DER ABSTANDS-MARSCH von `/bild --abstand` (werkbank.cjs) allein, an der Kamera des Spiels (wie vegetationLauf SPIEL), über eine
// Teilung, die jeden Pixel einer Klasse gibt — die Zahl der Rufe `_bodenSichtAt` und die Zeit der Seiten-CPU. `__marschVariante`
// (optional) misst eine zweite Fassung gegen dieselbe Kamera und vergleicht die Zählung Byte für Byte.
const s = r.state;
for (let i = 0; i < 30; i++) r._loopCamera(performance.now() + i * 100);
const cam = s.camera;
cam.updateMatrixWorld(true);
const W = 1920, H = 1080;
const teil = new Uint8Array(W * H).fill(1);
const namen = ["alle"];
const T = THREE;
const ring = r.constructor.NAH_WIESE ? r.constructor.NAH_WIESE.radius : null;
const baender = [...new Set([0, 2, 5, 10, ring, 30, 80, 200].filter((x) => x != null))].sort((a, b2) => a - b2);
let rufe = 0;
const boden = (x, z) => (rufe++, r._bodenSichtAt(x, z));
const t0 = performance.now();
const zahl = {}, cosS = baender.slice(1).map(() => 0), cosN = baender.slice(1).map(() => 0);
const pos = cam.position.clone();
const v = new T.Vector3();
const band = (d) => {
    for (let b = 0; b < baender.length - 1; b++) if (d < baender[b + 1]) return b;
    return -1;
};
let strahlen = 0, treffer = 0;
for (let y0 = 0; y0 < H; y0 += 2)
    for (let x0 = 0; x0 < W; x0 += 2) {
        v.set(((x0 + 1) / W) * 2 - 1, -(((y0 + 1) / H) * 2 - 1), 0.5).unproject(cam).sub(pos).normalize();
        if (v.y >= -1e-4) continue;
        strahlen++;
        let t0m = 0, t = 0.2, hit = -1;
        while (t < baender[baender.length - 1]) {
            const gy = boden(pos.x + v.x * t, pos.z + v.z * t);
            if (gy != null && pos.y + v.y * t <= gy) {
                let a = t0m, b = t;
                for (let it = 0; it < 8; it++) {
                    const m2 = (a + b) / 2;
                    const g2 = boden(pos.x + v.x * m2, pos.z + v.z * m2);
                    if (g2 != null && pos.y + v.y * m2 <= g2) b = m2;
                    else a = m2;
                }
                hit = b;
                break;
            }
            t0m = t;
            t += Math.max(0.05, 0.04 * t);
        }
        if (hit < 0) continue;
        treffer++;
        const d = Math.hypot(v.x * hit, v.z * hit);
        const bi = band(d);
        if (bi < 0) continue;
        for (let q = 0; q < 4; q++) {
            (zahl.alle || (zahl.alle = baender.slice(1).map(() => 0)))[bi]++;
            cosS[bi] += -v.y;
            cosN[bi]++;
        }
    }
const ms = performance.now() - t0;
// der Leser allein: dieselbe Zahl Rufe an festen Punkten (die Kosten je Ruf ohne den Marsch drumherum)
const t1 = performance.now();
let k = 0;
for (let i = 0; i < 1000000; i++) k += r._bodenSichtAt(pos.x + (i % 1000) * 0.05, pos.z + Math.floor(i / 1000) * 0.05) || 0;
const msLeser = performance.now() - t1;
return { ms: Math.round(ms), rufe, strahlen, treffer, usJeRuf: +((1000 * ms) / rufe).toFixed(3), leser1M: Math.round(msLeser), kamera: [pos.x, pos.y, pos.z].map((x) => +x.toFixed(2)), zahl, cos: cosS.map((x, i) => (cosN[i] ? +(x / cosN[i]).toFixed(4) : null)), baender };
