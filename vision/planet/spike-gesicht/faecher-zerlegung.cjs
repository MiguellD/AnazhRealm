#!/usr/bin/env node
// Spike (nur lesen, nie im Kern): woraus entstehen die Faecher in der Biom-Karte? Zerlegt planetKlimaR an einem Ausschnitt
// in seine Faktoren (feuchte m, lee = 1 - schatten, luv = hub-Anteil, kontinental c, kont) und schreibt je Faktor ein PNG.
// Aufruf: node faecher-zerlegung.cjs <heute | kopie> <samen> <zeitMa> <lon0> <lon1> <lat0> <lat1> <schritt°> <aus-praefix>
'use strict';
const path = require('path'), fs = require('fs');
const [kern, samen, zeit, lo0, lo1, la0, la1, st, pre] = process.argv.slice(2);
const L = require('./lib.cjs'); const P = L.kern(kern); const D = { png: L.png };
const plan = L.planVon(P, samen), S = P.planetScheibe(plan, Number(zeit));
const d2r = Math.PI / 180, s = Number(st);
const W = Math.round((Number(lo1) - Number(lo0)) / s), H = Math.round((Number(la1) - Number(la0)) / s);
const felder = { niederschlag: new Float32Array(W * H), feuchte: new Float32Array(W * H), lee: new Float32Array(W * H), luv: new Float32Array(W * H), kont: new Float32Array(W * H), hoehe: new Float32Array(W * H), huelle: new Float32Array(W * H) };
const K = {}, pt = {};
const t0 = process.hrtime.bigint();
for (let r = 0; r < H; r++) {
  const phi = (Number(la1) - (r + 0.5) * s) * d2r;
  for (let i = 0; i < W; i++) {
    const lam = (Number(lo0) + (i + 0.5) * s) * d2r, idx = r * W + i;
    const x = Math.cos(phi) * Math.cos(lam), y = Math.sin(phi), z = Math.cos(phi) * Math.sin(lam);
    P.planetPunktR(S, x, y, z, 40, pt);
    P.planetKlimaR(S, x, y, z, -1, K, pt);
    felder.niederschlag[idx] = pt.hoeheKm > 0 ? K.niederschlagMm : NaN;
    felder.feuchte[idx] = pt.hoeheKm > 0 ? K.feuchte : NaN;
    felder.lee[idx] = pt.hoeheKm > 0 ? K.lee : NaN;
    felder.luv[idx] = pt.hoeheKm > 0 ? K.luv : NaN;
    felder.kont[idx] = pt.kont;
    felder.hoehe[idx] = pt.hoeheKm;
    felder.huelle[idx] = P.planetHuelle(S, x, y, z);
  }
}
const ms = Number(process.hrtime.bigint() - t0) / 1e6;
function grau(f, lo, hi) {
  const rgb = new Uint8Array(W * H * 3);
  for (let p = 0; p < W * H; p++) {
    const v = f[p];
    if (Number.isNaN(v)) { rgb[3 * p] = 20; rgb[3 * p + 1] = 40; rgb[3 * p + 2] = 90; continue; }
    const u = Math.max(0, Math.min(1, (v - lo) / (hi - lo))) * 255; rgb[3 * p] = u; rgb[3 * p + 1] = u; rgb[3 * p + 2] = u;
  }
  return rgb;
}
function spanne(f) { const a = [...f].filter(v => !Number.isNaN(v)).sort((x, y) => x - y); return [a[Math.floor(0.02 * a.length)], a[Math.floor(0.98 * a.length)]]; }
const aus = {};
for (const [n, f] of Object.entries(felder)) {
  const [lo, hi] = spanne(f); aus[n] = [lo, hi];
  fs.writeFileSync(pre + '-' + n + '.png', D.png(grau(f, lo, hi), W, H));
}
// Faecher-Index je Feld: Totalvariation quer zum Wind (Ost-West-Achse ~ Wind in Passat und Westwind) gegen laengs
// gemessen als mittlerer |Delta| zwischen Nachbarn in Nord-Sued (quer) und Ost-West (laengs), nur Land-Paare
function tv(f) {
  let q = 0, nq = 0, l = 0, nl = 0;
  for (let r = 0; r < H - 1; r++) for (let i = 0; i < W - 1; i++) {
    const a = f[r * W + i], b = f[(r + 1) * W + i], c = f[r * W + i + 1];
    if (!Number.isNaN(a) && !Number.isNaN(b)) { q += Math.abs(a - b); nq++; }
    if (!Number.isNaN(a) && !Number.isNaN(c)) { l += Math.abs(a - c); nl++; }
  }
  return { quer: q / nq, laengs: l / nl };
}
console.log(JSON.stringify({ samen, zeit: Number(zeit), W, H, ms: Math.round(ms), usJePunkt: Math.round(ms * 1000 / (W * H)), spanne: aus, tvNiederschlag: tv(felder.niederschlag), tvFeuchte: tv(felder.feuchte), tvLee: tv(felder.lee) }));
