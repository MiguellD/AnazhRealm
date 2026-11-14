#!/usr/bin/env node
// mass.cjs — das MASS fuer "liest als Planet" ueber 12 Saaten erde-01 ... erde-12 bei t = 0 (Gitter 720 x 360, fuss 40 km).
// Aufruf: node mass.cjs <kern: heute | name der Kopie> [W]
'use strict';
const L = require('./lib.cjs');
const name = process.argv[2] || 'heute', W = Number(process.argv[3] || 720);
const P = L.kern(name);
const zeilen = [];
for (let i = 1; i <= 12; i++) {
  const samen = 'erde-' + String(i).padStart(2, '0');
  const plan = L.planVon(P, samen), S = P.planetScheibe(plan, 0);
  const G = L.gitter(P, S, W, 40);
  const m = new Uint8Array(G.W * G.H); for (let p = 0; p < m.length; p++) m[p] = G.h[p] > 0 ? 1 : 0;
  const g = L.gestalt(G, m), inn = L.innen(G, m, g.ab); delete g.ab;
  const z = Object.assign({ samen }, g, { innenStreuungKm: inn.streuungKm, innenMittelKm: inn.mittelKm, innenP10: inn.p10, innenP90: inn.p90, innenAltGuertel: inn.altGuertel, innenN: inn.n });
  zeilen.push(z); process.stderr.write(samen + ' ');
}
const med = (k) => L.median(zeilen.map(z => z[k]));
const sp = (k) => { const a = zeilen.map(z => z[k]).filter(Number.isFinite).sort((x, y) => x - y); return [a[0], a[a.length - 1]]; };
const keys = ['landAnteil', 'stuecke1e4', 'stuecke1e5', 'groesster', 'zweiter', 'korcak', 'solidityMedian', 'kuestenEntwicklung', 'fern1000', 'schmal300', 'innenStreuungKm', 'innenMittelKm', 'innenAltGuertel'];
const zus = {}; for (const k of keys) zus[k] = { median: med(k), min: sp(k)[0], max: sp(k)[1] };
console.log(JSON.stringify({ kern: name, W, zusammen: zus, saaten: zeilen }, null, 0));
