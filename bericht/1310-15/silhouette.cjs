// 1310-15: DIE SILHOUETTE AUF 3 M — zwei Güsse (guss.cjs) in die Ruhe-Pose gestellt (Skelett: Welt = Gelenk-Kette × Mesh,
// Hüllen im Wurzel-Raum), je Blick (8 Azimute, Ortho, Pixel 4 mm = das Pixel auf 3 m bei 1080 p) gerastert; je Blick IoU
// und die Pixel, in denen die Masken abweichen. node silhouette.cjs <A.json> <B.json> [L0|L1|L0:L1] [pixel_m]
"use strict";
const fs = require("fs");
const [fa, fb, stufen = "L0", pxArg] = process.argv.slice(2);
const PX = Number(pxArg || 0.004);
const A = JSON.parse(fs.readFileSync(fa, "utf8")), B = JSON.parse(fs.readFileSync(fb, "utf8"));
const [sa, sb] = stufen.includes(":") ? stufen.split(":") : [stufen, stufen];
function mat(pos, q, s) {
    const [x, y, z, w] = q, x2 = x + x, y2 = y + y, z2 = z + z;
    const xx = x * x2, xy = x * y2, xz = x * z2, yy = y * y2, yz = y * z2, zz = z * z2, wx = w * x2, wy = w * y2, wz = w * z2;
    return [(1 - (yy + zz)) * s[0], (xy + wz) * s[0], (xz - wy) * s[0], 0, (xy - wz) * s[1], (1 - (xx + zz)) * s[1], (yz + wx) * s[1], 0,
        (xz + wy) * s[2], (yz - wx) * s[2], (1 - (xx + yy)) * s[2], 0, pos[0], pos[1], pos[2], 1];
}
function mul(a, b) {
    const o = new Array(16);
    for (let c = 0; c < 4; c++) for (let r = 0; r < 4; r++) { let v = 0; for (let k = 0; k < 4; k++) v += a[k * 4 + r] * b[c * 4 + k]; o[c * 4 + r] = v; }
    return o;
}
function welt(stufe) {
    const sk = stufe.skelett, W = {};
    const byName = Object.fromEntries(sk.joints.map((j) => [j.name, j]));
    const w = (n) => { if (W[n]) return W[n]; const j = byName[n]; const L = mat(j.pos, j.quat, j.scale); W[n] = j.parent ? mul(w(j.parent), L) : L; return W[n]; };
    const tris = [];
    for (const m of stufe.meshes) {
        const M = w(m.joint && byName[m.joint] ? m.joint : sk.root);
        const pb = Buffer.from(m.pos, "base64"); const P = new Float32Array(pb.buffer, pb.byteOffset, pb.length / 4);
        const n = P.length / 3, V = new Float32Array(n * 3);
        for (let i = 0; i < n; i++) { const x = P[i * 3], y = P[i * 3 + 1], z = P[i * 3 + 2];
            V[i * 3] = M[0] * x + M[4] * y + M[8] * z + M[12]; V[i * 3 + 1] = M[1] * x + M[5] * y + M[9] * z + M[13]; V[i * 3 + 2] = M[2] * x + M[6] * y + M[10] * z + M[14]; }
        let I;
        if (m.index) { const ib = Buffer.from(m.index, "base64"); I = m.breite === 2 ? new Uint16Array(ib.buffer, ib.byteOffset, ib.length / 2) : new Uint32Array(ib.buffer, ib.byteOffset, ib.length / 4); }
        else { I = new Uint32Array(n); for (let i = 0; i < n; i++) I[i] = i; }
        tris.push({ V, I });
    }
    return tris;
}
function maske(tris, th, box) {
    const c = Math.cos(th), s = Math.sin(th);
    const W = Math.ceil((box.u1 - box.u0) / PX), H = Math.ceil((box.v1 - box.v0) / PX), g = new Uint8Array(W * H);
    for (const { V, I } of tris) for (let t = 0; t < I.length; t += 3) {
        const P = [0, 1, 2].map((k) => { const i = I[t + k] * 3; return [(V[i] * c - V[i + 2] * s - box.u0) / PX, (V[i + 1] - box.v0) / PX]; });
        const x0 = Math.max(0, Math.floor(Math.min(P[0][0], P[1][0], P[2][0]))), x1 = Math.min(W - 1, Math.ceil(Math.max(P[0][0], P[1][0], P[2][0])));
        const y0 = Math.max(0, Math.floor(Math.min(P[0][1], P[1][1], P[2][1]))), y1 = Math.min(H - 1, Math.ceil(Math.max(P[0][1], P[1][1], P[2][1])));
        const e = (a, b, x, y) => (b[0] - a[0]) * (y - a[1]) - (b[1] - a[1]) * (x - a[0]);
        const area = e(P[0], P[1], P[2][0], P[2][1]); if (Math.abs(area) < 1e-12) continue;
        for (let y = y0; y <= y1; y++) for (let x = x0; x <= x1; x++) {
            const px = x + 0.5, py = y + 0.5;
            const w0 = e(P[1], P[2], px, py), w1 = e(P[2], P[0], px, py), w2 = e(P[0], P[1], px, py);
            if ((w0 >= 0 && w1 >= 0 && w2 >= 0) || (w0 <= 0 && w1 <= 0 && w2 <= 0)) g[x + y * W] = 1;
        }
    }
    return { g, W, H };
}
const ta = welt(A[sa]), tb = welt(B[sb]);
const out = [];
for (let k = 0; k < 8; k++) {
    const th = (k * Math.PI) / 4, c = Math.cos(th), s = Math.sin(th);
    const box = { u0: 1e9, u1: -1e9, v0: 1e9, v1: -1e9 };
    for (const T of [ta, tb]) for (const { V } of T) for (let i = 0; i < V.length; i += 3) { const u = V[i] * c - V[i + 2] * s, v = V[i + 1];
        if (u < box.u0) box.u0 = u; if (u > box.u1) box.u1 = u; if (v < box.v0) box.v0 = v; if (v > box.v1) box.v1 = v; }
    box.u0 -= 0.02; box.v0 -= 0.02; box.u1 += 0.02; box.v1 += 0.02;
    const ma = maske(ta, th, box), mb = maske(tb, th, box);
    let and = 0, or = 0, nurA = 0, nurB = 0;
    for (let i = 0; i < ma.g.length; i++) { const x = ma.g[i], y = mb.g[i]; if (x && y) and++; if (x || y) or++; if (x && !y) nurA++; if (y && !x) nurB++; }
    out.push({ azimut: k * 45, iou: +(and / or).toFixed(4), pixelA: and + nurA, nurA, nurB });
}
const min = Math.min(...out.map((o) => o.iou));
console.log(JSON.stringify({ A: fa, B: fb, stufen: sa + ":" + sb, pixelM: PX, minIoU: min, blicke: out }));
