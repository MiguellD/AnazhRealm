#!/usr/bin/env node
// zeitsprung-fein.cjs — Land-IoU in 5-Ma-Schritten von −50 bis +50 Ma (erde-09), drei Baender: 60–90° N, 30–90° N, global.
// Ein Riss (Unstetigkeit) zeigte sich als einzelner Schritt mit niedriger IoU; stetige Drift als gleichmaessig hohe Schritt-IoU.
'use strict';
const L = require('./lib.cjs');
const P = L.kern(process.argv[2] || 'heute'), plan = L.planVon(P, process.argv[3] || 'erde-09'), W = 360, H = 180;
function maske(t) { const S = P.planetScheibe(plan, t), m = new Uint8Array(W * H); for (let r = 0; r < H; r++) { const phi = Math.PI / 2 - Math.PI * (r + 0.5) / H; for (let i = 0; i < W; i++) m[r * W + i] = P.planetPunkt(S, phi, -Math.PI + 2 * Math.PI * (i + 0.5) / W, 40) > 0 ? 1 : 0; } return { m, land: S.landAnteil, meer: S.meerKm }; }
function iou(a, b, r0, r1) { let u = 0, s = 0; for (let r = r0; r < r1; r++) { const w = Math.cos(Math.PI / 2 - Math.PI * (r + 0.5) / H); for (let i = 0; i < W; i++) { const p = r * W + i; if (a[p] || b[p]) u += w; if (a[p] && b[p]) s += w; } } return u ? s / u : NaN; }
const T = []; for (let t = -50; t <= 50; t += 5) T.push(t);
const M = T.map(maske), aus = [];
for (let k = 0; k < T.length - 1; k++) aus.push([T[k] + '→' + T[k + 1], +iou(M[k].m, M[k + 1].m, 0, 30).toFixed(3), +iou(M[k].m, M[k + 1].m, 0, 60).toFixed(3), +iou(M[k].m, M[k + 1].m, 0, H).toFixed(3), +M[k + 1].meer.toFixed(3)]);
const ganz = (a, b) => [a + '→' + b, +iou(M[T.indexOf(a)].m, M[T.indexOf(b)].m, 0, 30).toFixed(3), +iou(M[T.indexOf(a)].m, M[T.indexOf(b)].m, 0, 60).toFixed(3), +iou(M[T.indexOf(a)].m, M[T.indexOf(b)].m, 0, H).toFixed(3)];
console.log(JSON.stringify({ spalten: ['Schritt', 'IoU 60–90N', 'IoU 30–90N', 'IoU global', 'meerKm am Ende'], schritte: aus, fuenfzig: [ganz(-50, 0), ganz(0, 50)] }));
