#!/usr/bin/env node
// sprung-mass.cjs — UNSTETIGKEITEN im Relief ueber 12 Saaten (erde-01 ... erde-12) bei t = 0 und t = −50 Ma.
// Gitter 1024 x 512 (~39 km). Jedes Nachbar-Paar mit |dh| > 1 km wird in 40 Schritten zu ~1 km nachgegangen; eine echte Flanke
// (Schablonen >= 45 km breit) aendert sich je km um < 0,15 km, eine Unstetigkeit springt dort voll. Gezaehlt je Million Paare:
//   innen:  dieselbe Platte, beide Land, groesster 1-km-Schritt > 0,4 km — die Lineal-Kante mitten in der Platte
//   grenze: verschiedene Platten, beide tiefer als −1 km, groesster 1-km-Schritt > 0,4 km — die Grenz-Stufe im Ozean
// Aufruf: node sprung-mass.cjs <heute | kopie>
'use strict';
const L = require('./lib.cjs');
const name = process.argv[2] || 'heute', W = 1024, H = 512;
const P = L.kern(name);
const zeilen = [];
function xyz(r, i) { const phi = Math.PI / 2 - Math.PI * (r + 0.5) / H, lam = -Math.PI + 2 * Math.PI * (i + 0.5) / W; return [Math.cos(phi) * Math.cos(lam), Math.sin(phi), Math.cos(phi) * Math.sin(lam)]; }
for (let n = 1; n <= 12; n++) {
  const samen = 'erde-' + String(n).padStart(2, '0'), plan = L.planVon(P, samen);
  for (const t of [0, -50]) {
    const S = P.planetScheibe(plan, t), h = new Float32Array(W * H), pl = new Int16Array(W * H), o = {};
    for (let r = 0; r < H; r++) for (let i = 0; i < W; i++) { const [x, y, z] = xyz(r, i); h[r * W + i] = P.planetPunktR(S, x, y, z, 16, o) / 1000; pl[r * W + i] = o.platte; }
    let pi = 0, si = 0, pg = 0, sg = 0;
    const schritt = (a, b) => { let mx = 0, prev = h[a]; const A = xyz((a / W) | 0, a % W), B = xyz((b / W) | 0, b % W);
      for (let k = 1; k <= 40; k++) { const u = k / 40; let x = A[0] + (B[0] - A[0]) * u, y = A[1] + (B[1] - A[1]) * u, z = A[2] + (B[2] - A[2]) * u; const l = Math.hypot(x, y, z); const v = P.planetPunktR(S, x / l, y / l, z / l, 16) / 1000; if (Math.abs(v - prev) > mx) mx = Math.abs(v - prev); prev = v; }
      return mx; };
    for (let r = 0; r < H - 1; r++) { if (Math.abs(90 - 180 * (r + 0.5) / H) > 75) continue;
      for (let i = 0; i < W; i++) { const p = r * W + i; for (const q of [r * W + (i + 1) % W, p + W]) {
        const d = Math.abs(h[p] - h[q]);
        if (pl[p] === pl[q]) { if (h[p] > 0 && h[q] > 0) { pi++; if (d > 1 && schritt(p, q) > 0.4) si++; } }
        else if (h[p] < -1 && h[q] < -1) { pg++; if (d > 1 && schritt(p, q) > 0.4) sg++; } } } }
    zeilen.push({ samen, t, innenJeMio: si / pi * 1e6, grenzeJeMio: sg / pg * 1e6 });
  }
  process.stderr.write(samen + ' ');
}
const z = (k) => ({ median: L.median(zeilen.map(r => r[k])), max: Math.max(...zeilen.map(r => r[k])) });
console.log(JSON.stringify({ kern: name, innen: z('innenJeMio'), grenze: z('grenzeJeMio'), zeilen }));
