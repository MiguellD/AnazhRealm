// Probe "Zeit als dritter Parameter": derselbe Satz mit Zeit — geographisch und als Material (planetOrtDerZeit), Meer der Zeit.
'use strict';
const path = require('path');
require(path.resolve(process.argv[3])); const G = globalThis.__gelaendeCore;
const P = require(path.resolve(process.argv[2]));
const samen = process.argv[4] || 'anazh-realm-seed', bg = Number(process.argv[5]), lg = Number(process.argv[6]);
const rad = (g) => g * Math.PI / 180, grad = (r) => r * 180 / Math.PI, r2 = (v, n = 2) => Number(v.toFixed(n));
const ns = () => Number(process.hrtime.bigint());
const og = { kuehlungKJeM: G.TEMPERATUR.sommer / ((G.SCHNEE.start + G.SCHNEE.voll) / 2), meerUnterBasisM: G.LAGE_GRUND.meerUnterBasis,
  regler: G.LANDFORM_REGLER, klimaHeute: Object.assign({}, G.TEMPERATUR, { spendeMm: G.PEGEL.spende * 1000 * 365.25 }) };
const plan = P.planetPlan(samen, Object.assign({}, P.PLANET_ERDE, { jahrTage: og.klimaHeute.jahrTage }));
P.planetScheibe(plan, 0); const A = P.planetAnker(plan, 0, og);
console.log('Anker ' + r2(grad(A.breite), 3) + ' ' + r2(grad(A.laenge), 3) + ' · Ziel ' + bg + ' ' + lg);
for (const t of [-200, -100, -50, -35, -20, -10, -5, 5, 10, 20, 30, 50]) {
  const a = ns(); const S = P.planetScheibe(plan, t); const msS = (ns() - a) / 1e6;
  const p = {}; const hG = P.planetPunkt(S, rad(bg), rad(lg), 16, p); const oG = P.planetOrt(S, rad(bg), rad(lg), og, {});
  const m = P.planetOrtDerZeit(plan, rad(bg), rad(lg), 0, t, {});
  let mat = 'existiert nicht';
  if (m.existiert) { const q = {}; const hM = P.planetPunkt(S, m.breite, m.laenge, 16, q); const oM = P.planetOrt(S, m.breite, m.laenge, og, {});
    mat = r2(grad(m.breite), 2) + ' ' + r2(grad(m.laenge), 2) + ' h ' + r2(hM, 0) + ' m Kueste ' + r2(q.kont, 0) + ' km dS ' + r2(oM.delta.klima.sommer) + ' dW ' + r2(oM.delta.klima.winter) + ' Verh ' + r2(oM.delta.klima.spendeVerh, 2) + ' dLand ' + r2(oM.delta.wildnis.land, 3); }
  const mA = P.planetOrtDerZeit(plan, A.breite, A.laenge, 0, t, {}); let anker = 'existiert nicht';
  if (mA.existiert) { const q = {}; const hA = P.planetPunkt(S, mA.breite, mA.laenge, 16, q); const oA = P.planetOrt(S, mA.breite, mA.laenge, og, {});
    anker = r2(grad(mA.breite), 2) + ' ' + r2(grad(mA.laenge), 2) + ' h ' + r2(hA, 0) + ' m dS ' + r2(oA.delta.klima.sommer) + ' dW ' + r2(oA.delta.klima.winter) + ' Verh ' + r2(oA.delta.klima.spendeVerh, 2); }
  console.log('t ' + t + ' Ma | Scheibe kalt ' + r2(msS, 0) + ' ms | dMeer ' + r2(oG.delta.meer.waterLevelM, 2) + ' m | geographisch: h ' + r2(hG, 0) + ' m Kueste ' + r2(p.kont, 0) + ' km | Material des Ziels: ' + mat + ' | Material der Heimat: ' + anker);
}
