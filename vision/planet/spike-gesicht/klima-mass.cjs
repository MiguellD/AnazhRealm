#!/usr/bin/env node
// klima-mass.cjs — Faecher-Mass ueber 12 Saaten (erde-01 ... erde-12, t = 0, Gitter 480 x 240):
//   kanteFlach: Anteil der Land-Nachbarpaare OHNE Relief (beide < 1 km, |dh| < 0,3 km), an denen der Niederschlag sich auf weniger
//               als 100 km verdoppelt (|d ln P| / d > ln 2 / 100 km). Auf der Erde entstehen solche Kanten am Relief, im Flachland nicht.
//   dazu Land-Niederschlag (Median, mm) und BWh-Anteil am Land, damit der Schnitt das Klima nicht still verschiebt.
// Aufruf: node klima-mass.cjs <heute | kopie> [W]
'use strict';
const L = require('./lib.cjs');
const name = process.argv[2] || 'heute', W = Number(process.argv[3] || 480), H = W >> 1;
const P = L.kern(name);
const zeilen = [];
for (let n = 1; n <= 12; n++) {
  const samen = 'erde-' + String(n).padStart(2, '0');
  const plan = L.planVon(P, samen), S = P.planetScheibe(plan, 0), R = S.R;
  const pr = new Float32Array(W * H).fill(NaN), hh = new Float32Array(W * H), K = {}, pt = {}, B = {};
  let bwh = 0, land = 0; const ps = [];
  for (let r = 0; r < H; r++) {
    const phi = Math.PI / 2 - Math.PI * (r + 0.5) / H, cp = Math.cos(phi), sp = Math.sin(phi);
    for (let i = 0; i < W; i++) {
      const lam = -Math.PI + 2 * Math.PI * (i + 0.5) / W, x = cp * Math.cos(lam), z = cp * Math.sin(lam);
      P.planetPunktR(S, x, sp, z, 40, pt); hh[r * W + i] = pt.hoeheKm;
      if (pt.hoeheKm <= 0) continue;
      P.planetKlimaR(S, x, sp, z, -1, K, pt); P.planetBiom(K, pt.hoeheM, B);
      pr[r * W + i] = K.niederschlagMm; ps.push(K.niederschlagMm); land++; if (B.koeppen === 3) bwh++;
    }
  }
  let paare = 0, kanten = 0;
  const dy = Math.PI * R / H;
  for (let r = 0; r < H - 1; r++) {
    const dx = 2 * Math.PI * R / W * Math.cos(Math.PI / 2 - Math.PI * (r + 0.5) / H);
    for (let i = 0; i < W; i++) {
      const p = r * W + i;
      for (const [q, d] of [[r * W + (i + 1) % W, dx], [p + W, dy]]) {
        const a = pr[p], b = pr[q]; if (!(a > 0 && b > 0)) continue;
        if (hh[p] > 1 || hh[q] > 1 || Math.abs(hh[p] - hh[q]) > 0.3) continue;
        paare++; if (Math.abs(Math.log(a / b)) / d > Math.LN2 / 100) kanten++;
      }
    }
  }
  zeilen.push({ samen, kanteFlach: kanten / paare, paare, landP: L.median(ps), bwh: bwh / land });
  process.stderr.write(samen + ' ');
}
const med = (k) => L.median(zeilen.map(z => z[k])), mn = (k) => Math.min(...zeilen.map(z => z[k])), mx = (k) => Math.max(...zeilen.map(z => z[k]));
const zus = {}; for (const k of ['kanteFlach', 'landP', 'bwh']) zus[k] = { median: med(k), min: mn(k), max: mx(k) };
console.log(JSON.stringify({ kern: name, W, zusammen: zus, saaten: zeilen }));
