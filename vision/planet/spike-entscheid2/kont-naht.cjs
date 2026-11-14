// kont-naht.cjs — Probe des Entscheiders: springt PK.kont (km zur Küste) dort, wo die nächste Scholle wechselt?
// planet-core.js:1341 rechnet kont = (fK − kuesteF) · sr[sBest] · R; sr wechselt mit sBest. Gitter 720×360, Land-Nachbarpaare (Ost).
'use strict';
const path = require('path');
const L = require('C:/Users/micha/AnazhRealm-profiband/artifacts/profiband/auge/planet-kern/welle2/spike/lib.cjs');
const name = process.argv[2] || 'heute';
const P = L.kern(name);
const q = (a, p) => { const b = [...a].sort((x, y) => x - y); return b.length ? b[Math.min(b.length - 1, Math.floor(p * b.length))] : NaN; };
const out = [];
for (const samen of (process.argv[3] || 'erde-09,erde-01,erde-05').split(',')) {
  const plan = L.planVon(P, samen), S = P.planetScheibe(plan, 0), W = 720, H = 360, o = {}, K = {};
  const kont = new Float32Array(W * H), sch = new Int16Array(W * H), land = new Uint8Array(W * H), nied = new Float32Array(W * H);
  for (let r = 0; r < H; r++) { const phi = Math.PI / 2 - Math.PI * (r + 0.5) / H, cp = Math.cos(phi), sp = Math.sin(phi);
    for (let i = 0; i < W; i++) { const lam = -Math.PI + 2 * Math.PI * (i + 0.5) / W, x = cp * Math.cos(lam), z = cp * Math.sin(lam);
      const h = P.planetPunktR(S, x, sp, z, 40, o); const p = r * W + i; kont[p] = o.kont; sch[p] = o.scholle; land[p] = h > 0 ? 1 : 0;
      if (h > 0) { P.planetKlimaR(S, x, sp, z, -1, K, o); nied[p] = K.niederschlagMm; } } }
  const gleich = [], naht = [], nG = [], nN = []; let nahtUeber100 = 0;
  for (let r = 20; r < H - 20; r++) { const dx = 2 * Math.PI * S.R / W * Math.cos(Math.PI / 2 - Math.PI * (r + 0.5) / H);
    for (let i = 0; i < W; i++) { const p = r * W + i, q2 = r * W + (i + 1) % W; if (!land[p] || !land[q2]) continue;
      if (kont[p] < 150 || kont[q2] < 150) continue;                 // nur Inland (der Küstensaum zählt nicht)
      const d = Math.abs(kont[p] - kont[q2]) / dx, dn = Math.abs(nied[p] - nied[q2]) / Math.max(1, Math.min(nied[p], nied[q2]));
      if (sch[p] === sch[q2]) { gleich.push(d); nG.push(dn); } else { naht.push(d); nN.push(dn); if (Math.abs(kont[p] - kont[q2]) > 100) nahtUeber100++; } } }
  out.push({ samen, kern: name, paareGleich: gleich.length, paareNaht: naht.length,
    dKontJeKm_gleich: { median: +q(gleich, 0.5).toFixed(2), p95: +q(gleich, 0.95).toFixed(2), max: +q(gleich, 0.9999).toFixed(2) },
    dKontJeKm_naht: { median: +q(naht, 0.5).toFixed(2), p95: +q(naht, 0.95).toFixed(2), max: +q(naht, 0.9999).toFixed(2) },
    nahtPaareSprungUeber100km: nahtUeber100, niedRel_gleich_p95: +q(nG, 0.95).toFixed(3), niedRel_naht_p95: +q(nN, 0.95).toFixed(3), niedRel_naht_median: +q(nN, 0.5).toFixed(3) });
}
console.log(JSON.stringify(out, null, 1));
