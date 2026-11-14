#!/usr/bin/env node
// grenz-stufe.cjs — welche Grenz-Art traegt die Stufen im Ozean? erde-09, t = 0, Gitter 512 x 256: an jedem Ozean-Paar verschiedener
// Platten (beide < −1 km) wird der Weg in 1-km-Schritten nachgegangen; je Rand-Art (am tieferen Pixel) Anteil mit Stufe > 0,4 km/km
// und der Median der Stufe. Dazu: stammt die Stufe aus dem Alter (ozeanAlterMa springt) oder aus einer Schablone?
'use strict';
const L = require('./lib.cjs');
const P = L.kern(process.argv[2] || 'heute'), plan = L.planVon(P, 'erde-09'), S = P.planetScheibe(plan, 0), W = 512, H = 256;
const xyz = (r, i) => { const phi = Math.PI / 2 - Math.PI * (r + 0.5) / H, lam = -Math.PI + 2 * Math.PI * (i + 0.5) / W; return [Math.cos(phi) * Math.cos(lam), Math.sin(phi), Math.cos(phi) * Math.sin(lam)]; };
const h = new Float32Array(W * H), pl = new Int16Array(W * H), art = new Uint8Array(W * H), o = {};
for (let r = 0; r < H; r++) for (let i = 0; i < W; i++) { const [x, y, z] = xyz(r, i); h[r * W + i] = P.planetPunktR(S, x, y, z, 16, o) / 1000; pl[r * W + i] = o.platte; art[r * W + i] = o.randArt; }
const NAME = ['innen', 'divergent', 'transform', 'konvergent'], st = {};
for (let r = 0; r < H - 1; r++) { if (Math.abs(90 - 180 * (r + 0.5) / H) > 75) continue;
  for (let i = 0; i < W; i++) { const p = r * W + i; for (const q of [r * W + (i + 1) % W, p + W]) {
    if (pl[p] === pl[q] || !(h[p] < -1 && h[q] < -1)) continue;
    const A = xyz((p / W) | 0, p % W), B = xyz((q / W) | 0, q % W); let mx = 0, da = 0, prev = null, prevA = 0;
    for (let k = 0; k <= 80; k++) { const u = k / 80; let x = A[0] + (B[0] - A[0]) * u, y = A[1] + (B[1] - A[1]) * u, z = A[2] + (B[2] - A[2]) * u; const l = Math.hypot(x, y, z); const v = P.planetPunktR(S, x / l, y / l, z / l, 16, o) / 1000;
      if (prev !== null && Math.abs(v - prev) > mx) { mx = Math.abs(v - prev); da = Math.abs(o.ozeanAlterMa - prevA); } prev = v; prevA = o.ozeanAlterMa; }
    const a = NAME[art[h[p] < h[q] ? p : q]]; const e = st[a] = st[a] || { n: 0, stufe: 0, ausAlter: 0, werte: [] };
    e.n++; if (mx > 0.4) { e.stufe++; e.werte.push(mx); if (da > 5) e.ausAlter++; } } } }
for (const k in st) { const e = st[k]; e.anteil = +(e.stufe / e.n).toFixed(3); e.medianKm = +L.median(e.werte).toFixed(2); e.ausAlterAnteil = e.stufe ? +(e.ausAlter / e.stufe).toFixed(3) : 0; delete e.werte; }
console.log(JSON.stringify(st));
