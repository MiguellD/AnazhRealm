#!/usr/bin/env node
// kante-zerlegung.cjs — welcher Term traegt die Lineal-Kante des Kollisions-Plateaus? Liest die Diagnose-Kopie (kern-dbg.js):
// je Pixel hOro (lebender Rand), hMem mit Art (1 Naht, 2 Rand-Gedaechtnis-Faecher), hTpl, Nachklang; schreibt Falschfarbe + Zahlen.
// Aufruf: node kante-zerlegung.cjs <samen> <zeitMa> <lon0> <lon1> <lat0> <lat1> <schritt°> <praefix>
'use strict';
const L = require('./lib.cjs'), fs = require('fs');
const [samen, zeit, lo0, lo1, la0, la1, st, pre] = process.argv.slice(2);
const P = L.kern(process.env.KERN || 'dbg'), D = P._dbg;
const plan = L.planVon(P, samen), S = P.planetScheibe(plan, Number(zeit));
const s = Number(st), W = Math.round((lo1 - lo0) / s), H = Math.round((la1 - la0) / s), d2r = Math.PI / 180;
const rgb = new Uint8Array(W * H * 3), hk = new Float32Array(W * H), art = new Uint8Array(W * H), hm = new Float32Array(W * H), ho = new Float32Array(W * H), nk = new Float32Array(W * H), fp = new Float32Array(W * H).fill(NaN);
const pt = {};
for (let r = 0; r < H; r++) for (let i = 0; i < W; i++) {
  const phi = (Number(la1) - (r + 0.5) * s) * d2r, lam = (Number(lo0) + (i + 0.5) * s) * d2r, p = r * W + i;
  hk[p] = P.planetPunkt(S, phi, lam, 16, pt) / 1000; art[p] = D.art; hm[p] = D.hMem; ho[p] = D.hOro; nk[p] = D.nachklang || 0; if (D.art === 2) fp[p] = D.fpos;
  const g = Math.max(0, Math.min(255, hk[p] / 6 * 255));
  // rot = Rand-Gedaechtnis (Faecher), gruen = Naht, blau = lebender Rand; Helligkeit = Hoehe
  rgb[3 * p] = art[p] === 2 && hm[p] > ho[p] ? g : g * 0.3; rgb[3 * p + 1] = art[p] === 1 && hm[p] > ho[p] ? g : g * 0.3; rgb[3 * p + 2] = ho[p] >= hm[p] && ho[p] > 0.2 ? g : g * 0.3;
}
fs.writeFileSync(pre + '-terme.png', L.png(rgb, W, H));
// groesster Hoehen-Sprung zwischen Nachbar-Pixeln und welcher Term dort fuehrt
let best = { d: 0 };
for (let r = 0; r < H; r++) for (let i = 0; i < W - 1; i++) { const p = r * W + i, d = Math.abs(hk[p] - hk[p + 1]); if (d > best.d) best = { d, r, i, links: { h: hk[p], art: art[p], hMem: hm[p], hOro: ho[p], nachklang: nk[p], fpos: fp[p] }, rechts: { h: hk[p + 1], art: art[p + 1], hMem: hm[p + 1], hOro: ho[p + 1], nachklang: nk[p + 1], fpos: fp[p + 1] } }; }
const n = W * H; let a1 = 0, a2 = 0, a0 = 0; for (let p = 0; p < n; p++) { if (hk[p] < 3) continue; if (art[p] === 2 && hm[p] > ho[p]) a2++; else if (art[p] === 1 && hm[p] > ho[p]) a1++; else a0++; }
console.log(JSON.stringify({ W, H, kmJePixel: s * 111.2, hoch3km: { randGedaechtnis: a2, naht: a1, lebend: a0 }, groessterSprung: best }));
