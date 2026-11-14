#!/usr/bin/env node
// kosten.cjs — µs je Abfrage, Kopie gegen heute im SELBEN Prozess, ABAB (5 Runden), warm, Saat erde-09 t = 0.
//   punkt: planetPunktR (fuss 40) an 4 000 Fibonacci-Proben; klima: planetKlimaR an denselben Land-Proben (Punkt vorgerechnet).
// Aufruf: node kosten.cjs <kopie> [zeitMa]
'use strict';
const L = require('./lib.cjs');
const name = process.argv[2], t = Number(process.argv[3] || 0);
const K = { heute: L.kern('heute'), [name]: L.kern(name) };
const N = 4000, pts = [];
for (let i = 0; i < N; i++) { const y = 1 - 2 * (i + 0.5) / N, r = Math.sqrt(1 - y * y), a = i * 2.399963229728653; pts.push([r * Math.cos(a), y, r * Math.sin(a)]); }
const S = {}, land = {};
for (const k of Object.keys(K)) { const P = K[k]; S[k] = P.planetScheibe(L.planVon(P, 'erde-09'), t); const o = {}; land[k] = pts.filter(p => P.planetPunktR(S[k], p[0], p[1], p[2], 40, o) > 0).map(p => { const q = {}; P.planetPunktR(S[k], p[0], p[1], p[2], 40, q); return [p, q]; }); }
const ns = () => Number(process.hrtime.bigint());
const erg = { punkt: {}, klima: {} };
for (let rnd = 0; rnd < 5; rnd++) for (const k of (rnd % 2 ? [name, 'heute'] : ['heute', name])) {
  const P = K[k], s = S[k], o = {};
  let a = ns(); for (const p of pts) P.planetPunktR(s, p[0], p[1], p[2], 40, o); const dp = (ns() - a) / 1e3 / N;
  a = ns(); for (const [p, q] of land[k]) P.planetKlimaR(s, p[0], p[1], p[2], -1, o, q); const dk = (ns() - a) / 1e3 / land[k].length;
  (erg.punkt[k] = erg.punkt[k] || []).push(dp); (erg.klima[k] = erg.klima[k] || []).push(dk);
}
const med = (a) => L.median(a);
console.log(JSON.stringify({ kopie: name, t, landProben: { heute: land.heute.length, [name]: land[name].length },
  punktUs: { heute: med(erg.punkt.heute), [name]: med(erg.punkt[name]) }, klimaUs: { heute: med(erg.klima.heute), [name]: med(erg.klima[name]) } }));
