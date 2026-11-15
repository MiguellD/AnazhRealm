// Probe "Reihe der Ort-Saaten": die Ort-Saat ist die erste der Reihe (~k), an deren Ursprung das Gelaende-Gesetz Land rechnet
// (hoehe(L, 0, 0) > Meer). Wie oft traegt danach der Boden im Umkreis 240 m (Makro: 1,5 m ueber dem Meer, Boeschung)?
'use strict';
const path = require('path');
globalThis.window = globalThis;
const sx = require(path.resolve(process.argv[4]));
const Simplex = typeof sx === 'function' ? sx : (sx && sx.SimplexNoise) || globalThis.SimplexNoise;
require(path.resolve(process.argv[3])); const G = globalThis.__gelaendeCore;
const P = require(path.resolve(process.argv[2]));
const samen = process.argv[5] || 'anazh-realm-seed', N = Number(process.argv[6] || 3000);
const grad = (r) => r * 180 / Math.PI, rad = (g) => g * Math.PI / 180, r2 = (v, n = 2) => Number(v.toFixed(n));
const og = { kuehlungKJeM: G.TEMPERATUR.sommer / ((G.SCHNEE.start + G.SCHNEE.voll) / 2), meerUnterBasisM: G.LAGE_GRUND.meerUnterBasis,
  regler: G.LANDFORM_REGLER, klimaHeute: Object.assign({}, G.TEMPERATUR, { spendeMm: G.PEGEL.spende * 1000 * 365.25 }) };
const plan = P.planetPlan(samen, Object.assign({}, P.PLANET_ERDE, { jahrTage: og.klimaHeute.jahrTage }));
const S0 = P.planetScheibe(plan, 0);
const def = Object.fromEntries(G.LANDFORM_REGLER.map((r) => [r.id, r.def]));
const erbgutVon = (delta) => { const regler = Object.assign({}, def);
  for (const id in delta.wildnis) { const r = G.LANDFORM_REGLER.find((q) => q.id === id); regler[id] = Math.min(r.max, Math.max(r.min, def[id] + delta.wildnis[id])); }
  return { terme: G.erbgutNormal(G.planErbgut({ art: 'gelaende-plan', v: 1, saat: 'ort', regler })), wildnis: 1 }; };
const lage = (saat, erbgut, wl) => { const L = G.lageAus({ seed: saat, baseHeight: 0, waterLevel: wl, erbgut, regionSize: 2048 }, Simplex); L.erdbau = null; return L; };
const traegt = (L, x, z) => { const h = G.hoehe(L, x, z, true); if (!(h >= L.waterLevel + 1.5)) return false; let lo = Infinity, hi = -Infinity;
  for (let k = 0; k <= 12; k++) { const a = (k / 12) * 2 * Math.PI; const q = G.hoehe(L, x + (k ? Math.cos(a) * 60 : 0), z + (k ? Math.sin(a) * 60 : 0), true); lo = Math.min(lo, q); hi = Math.max(hi, q); }
  return (hi - lo) / 120 <= G.ERDBAU.boeschung; };
const in240 = (L) => { if (traegt(L, 0, 0)) return true; for (let rr = 12; rr <= 240; rr += 12) for (let k = 0; k < 8; k++) if (traegt(L, Math.round(Math.cos((k / 8) * 2 * Math.PI) * rr), Math.round(Math.sin((k / 8) * 2 * Math.PI) * rr))) return true; return false; };
const K = { kueste: { n: 0, k0: 0, kSumme: 0, kMax: 0, traegt240: 0, ohne: 0 }, innen: { n: 0, k0: 0, kSumme: 0, kMax: 0, traegt240: 0, ohne: 0 } };
const p = {}, o = {}; let ms = 0;
for (let i = 0; i < N; i++) {
  const y = 1 - 2 * (i + 0.5) / N, bg = r2(grad(Math.asin(y)), 2), lg = r2(grad(((i * 2.399963229728653) % (2 * Math.PI)) - Math.PI), 2);
  if (!(P.planetPunkt(S0, rad(bg), rad(lg), 16, p) > 0)) continue;
  P.planetOrt(S0, rad(bg), rad(lg), og, o); const E = erbgutVon(o.delta), wl = -3 + o.delta.meer.waterLevelM, Z = p.kont < 100 ? K.kueste : K.innen;
  const a = Number(process.hrtime.bigint()); let k = -1, L = null;
  for (let s = 0; s < 32; s++) { L = lage(samen + '@' + bg.toFixed(2) + '_' + lg.toFixed(2) + '_0' + (s ? '~' + s : ''), E, wl); if (G.hoehe(L, 0, 0, true) > wl) { k = s; break; } }
  ms += (Number(process.hrtime.bigint()) - a) / 1e6;
  Z.n++; if (k < 0) { Z.ohne++; continue; } if (k === 0) Z.k0++; Z.kSumme += k; Z.kMax = Math.max(Z.kMax, k); if (in240(L)) Z.traegt240++;
}
for (const n of Object.keys(K)) { const Z = K[n]; console.log(n + ': Orte ' + Z.n + ' · erste Saat der Reihe traegt Land am Ursprung bei k = 0 in ' + Z.k0 + ' (' + r2(100 * Z.k0 / Z.n, 1) + ' %), Mittel k ' + r2(Z.kSumme / Z.n, 2) + ', groesstes k ' + Z.kMax + ', ohne Saat in 32: ' + Z.ohne + ' · danach traegt der Boden im Umkreis 240 m (Makro) in ' + Z.traegt240 + ' (' + r2(100 * Z.traegt240 / Z.n, 1) + ' %)'); }
console.log('Kosten der Reihe je Ort im Mittel ' + r2(ms / (K.kueste.n + K.innen.n), 2) + ' ms');
