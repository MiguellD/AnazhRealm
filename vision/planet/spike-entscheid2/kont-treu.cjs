// kont-treu.cjs — Probe des Entscheiders: sagt PK.kont (km zur Küste aus dem Krusten-Feld) die WAHRE Küste, wenn die Küste eine
// Höhenlinie ist (Becken, Binnenmeere)? Gitter 720×360; wahr = Chamfer-Abstand der Land-Pixel zum nächsten Meeres-Pixel.
'use strict';
const SP = 'C:/Users/micha/AnazhRealm-profiband/artifacts/profiband/auge/planet-kern/welle2/spike';
const L = require(SP + '/lib.cjs');
const arg = process.argv[2] || 'heute';
delete globalThis.__planetCore; const P = arg === 'heute' ? require(L.ORIGINAL) : require(require('path').resolve(arg));
const q = (a, p) => { const b = [...a].sort((x, y) => x - y); return b.length ? b[Math.min(b.length - 1, Math.floor(p * b.length))] : NaN; };
const Z = [];
for (const samen of ['erde-01', 'erde-05', 'erde-09', 'erde-12']) {
  const plan = L.planVon(P, samen), S = P.planetScheibe(plan, 0), W = 720, H = 360, o = {};
  const h = new Float32Array(W * H), kont = new Float32Array(W * H), m = new Uint8Array(W * H);
  for (let r = 0; r < H; r++) { const phi = Math.PI / 2 - Math.PI * (r + 0.5) / H, cp = Math.cos(phi), sp = Math.sin(phi);
    for (let i = 0; i < W; i++) { const lam = -Math.PI + 2 * Math.PI * (i + 0.5) / W; const p = r * W + i; h[p] = P.planetPunktR(S, cp * Math.cos(lam), sp, cp * Math.sin(lam), 40, o) / 1000; kont[p] = o.kont; m[p] = h[p] > 0 ? 1 : 0; } }
  const G = { W, H, R: S.R }, ab = L.kuestenAbstand(m, G);
  const fehler = [], blind = [0, 0]; let meerMitKontPos = 0, meerN = 0;
  for (let r = 20; r < H - 20; r++) for (let i = 0; i < W; i++) { const p = r * W + i;
    if (!m[p]) { meerN++; if (kont[p] > 100) meerMitKontPos++; continue; }
    if (ab[p] <= 1000) fehler.push(Math.abs(kont[p] - ab[p]));
    if (ab[p] < 110) { blind[1]++; if (kont[p] > 300) blind[0]++; } }
  Z.push({ samen, fehlerMedianKm: +q(fehler, 0.5).toFixed(0), fehlerP90Km: +q(fehler, 0.9).toFixed(0), kuesteDieKontNichtSieht: +(blind[0] / Math.max(1, blind[1])).toFixed(3), meerMitKontUeber100km: +(meerMitKontPos / Math.max(1, meerN)).toFixed(4) });
}
console.log(JSON.stringify({ kern: arg, saaten: Z }));
