#!/usr/bin/env node
// zeitsprung.cjs — warum reisst 0 → +50 Ma? Je Intervall: Schluesselbilder darin (Art), mittlerer Weg der Schollen-Mitten (km und
// cm/a), Land-IoU global und im Nordband (30–75° N), Land-Anteil an beiden Enden. Saat und Zeiten wie die Karten von bau4.
// Aufruf: node zeitsprung.cjs <heute | kopie> [samen]
'use strict';
const L = require('./lib.cjs');
const P = L.kern(process.argv[2] || 'heute'), samen = process.argv[3] || 'erde-09';
const plan = L.planVon(P, samen), R = plan.R, W = 360, H = 180;
const ART = ['verstreut', 'versammelt', 'geloest'];
const zeiten = [-200, -100, -50, 0, 50];
function maske(t) { const S = P.planetScheibe(plan, t), m = new Uint8Array(W * H); for (let r = 0; r < H; r++) { const phi = Math.PI / 2 - Math.PI * (r + 0.5) / H; for (let i = 0; i < W; i++) m[r * W + i] = P.planetPunkt(S, phi, -Math.PI + 2 * Math.PI * (i + 0.5) / W, 40) > 0 ? 1 : 0; } return { m, S }; }
function iou(a, b, r0, r1) { let u = 0, s = 0; for (let r = r0; r < r1; r++) { const w = Math.cos(Math.PI / 2 - Math.PI * (r + 0.5) / H); for (let i = 0; i < W; i++) { const p = r * W + i; if (a[p] || b[p]) u += w; if (a[p] && b[p]) s += w; } } return s / u; }
const M = zeiten.map(t => maske(t));
const zeilen = [];
for (let k = 0; k < zeiten.length - 1; k++) {
  const t0 = zeiten[k], t1 = zeiten[k + 1], A = M[k].S, B = M[k + 1].S;
  let weg = 0, w = 0; for (let s = 0; s < plan.nS; s++) { const a = plan.schollen[8 * s + 3], fl = 1 - Math.cos(a); const d = Math.acos(Math.max(-1, Math.min(1, A.sw[3 * s] * B.sw[3 * s] + A.sw[3 * s + 1] * B.sw[3 * s + 1] + A.sw[3 * s + 2] * B.sw[3 * s + 2]))) * R; weg += fl * d; w += fl; }
  weg /= w;
  const bilder = []; for (let b = 0; b < plan.nB; b++) if (plan.bilder[b] > t0 && plan.bilder[b] <= t1) bilder.push(Math.round(plan.bilder[b] * 10) / 10 + ' ' + ART[plan.art[b]]);
  // Gruppen-Wechsel (Neuschnitt) im Intervall
  const gA = Array.from(A.sgrp), gB = Array.from(B.sgrp); let paareGetrennt = 0, paare = 0; for (let a = 0; a < plan.nS; a++) for (let c = a + 1; c < plan.nS; c++) { if (gA[a] === gA[c]) { paare++; if (gB[a] !== gB[c]) paareGetrennt++; } }
  zeilen.push({ von: t0, bis: t1, bilder, wegKm: Math.round(weg), cmJeA: +(weg / (t1 - t0) / 10).toFixed(2), iouGlobal: +iou(M[k].m, M[k + 1].m, 0, H).toFixed(3), iouNord: +iou(M[k].m, M[k + 1].m, Math.round(H * 15 / 180), Math.round(H * 60 / 180)).toFixed(3), land: [+(A.landAnteil).toFixed(3), +(B.landAnteil).toFixed(3)], meerKm: [+A.meerKm.toFixed(3), +B.meerKm.toFixed(3)], paareGetrennt: paareGetrennt + '/' + paare });
}
console.log(JSON.stringify({ samen, zeilen }, null, 1));
