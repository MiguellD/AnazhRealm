// Probe "Landung": traegt der Grund am Ursprung eines Reise-Orts (Makro-Hoehe des EINEN Gelaende-Gesetzes, ohne Hydrosphaere)?
// Aufruf: node mess-landung.cjs <planet-core.js> <gelaende-core.js> <vendor/simplex-noise.js> [samen] [N]
'use strict';
const path = require('path');
globalThis.window = globalThis;
const sx = require(path.resolve(process.argv[4]));
const Simplex = typeof sx === 'function' ? sx : (sx && sx.SimplexNoise) || globalThis.SimplexNoise;
if (typeof Simplex !== 'function') throw new Error('SimplexNoise fehlt: ' + Object.keys(sx || {}).join(','));
require(path.resolve(process.argv[3])); const G = globalThis.__gelaendeCore;
const P = require(path.resolve(process.argv[2]));
const samen = process.argv[5] || 'anazh-realm-seed', N = Number(process.argv[6] || 1500);
const grad = (r) => r * 180 / Math.PI, rad = (g) => g * Math.PI / 180, r2 = (v, n = 2) => Number(v.toFixed(n));
const og = { kuehlungKJeM: G.TEMPERATUR.sommer / ((G.SCHNEE.start + G.SCHNEE.voll) / 2), meerUnterBasisM: G.LAGE_GRUND.meerUnterBasis,
  regler: G.LANDFORM_REGLER, klimaHeute: Object.assign({}, G.TEMPERATUR, { spendeMm: G.PEGEL.spende * 1000 * 365.25 }) };
const plan = P.planetPlan(samen, Object.assign({}, P.PLANET_ERDE, { jahrTage: og.klimaHeute.jahrTage }));
const S0 = P.planetScheibe(plan, 0);
const def = Object.fromEntries(G.LANDFORM_REGLER.map((r) => [r.id, r.def]));
const lageVon = (saat, delta) => {
  const regler = Object.assign({}, def);
  for (const id in delta.wildnis) { const r = G.LANDFORM_REGLER.find((q) => q.id === id); regler[id] = Math.min(r.max, Math.max(r.min, def[id] + delta.wildnis[id])); }
  const roh = G.planErbgut({ art: 'gelaende-plan', v: 1, saat: 'ort', regler });
  const L = G.lageAus({ seed: saat, baseHeight: 0, waterLevel: -3 + delta.meer.waterLevelM, erbgut: { terme: G.erbgutNormal(roh), wildnis: 1 }, regionSize: 2048 }, Simplex);
  L.erdbau = null; return { L, regler };
};
const traegt = (L, x, z) => {
  const h = G.hoehe(L, x, z, true); if (!(h >= L.waterLevel + 1.5)) return false;
  let lo = Infinity, hi = -Infinity; const r = 60;
  for (let k = 0; k <= 12; k++) { const a = (k / 12) * 2 * Math.PI; const q = G.hoehe(L, x + (k ? Math.cos(a) * r : 0), z + (k ? Math.sin(a) * r : 0), true); lo = Math.min(lo, q); hi = Math.max(hi, q); }
  return (hi - lo) / (2 * r) <= G.ERDBAU.boeschung;
};
const landung = (L, rMax, schritt) => {
  if (traegt(L, 0, 0)) return 0;
  for (let rr = schritt; rr <= rMax; rr += schritt) for (let k = 0; k < 8; k++) {
    const x = Math.round(Math.cos((k / 8) * 2 * Math.PI) * rr), z = Math.round(Math.sin((k / 8) * 2 * Math.PI) * rr);
    if (traegt(L, x, z)) return rr;
  }
  return -1;
};
const zeile = (bg, lg, t) => {
  const p = {}; const St = t ? P.planetScheibe(plan, t) : S0;
  const h = P.planetPunkt(St, rad(bg), rad(lg), 16, p); const o = P.planetOrt(St, rad(bg), rad(lg), og, {});
  const saat = samen + '@' + bg.toFixed(2) + ',' + lg.toFixed(2) + ',' + t;
  const { L, regler } = lageVon(saat, o.delta);
  const a = Number(process.hrtime.bigint()); const l240 = landung(L, 240, 12); const ms240 = (Number(process.hrtime.bigint()) - a) / 1e6;
  let l1000 = l240, l4800 = l240, msWeit = 0;
  if (l240 < 0) { const b = Number(process.hrtime.bigint()); l1000 = landung(L, 1008, 48); l4800 = l1000 >= 0 ? l1000 : landung(L, 4800, 96); msWeit = (Number(process.hrtime.bigint()) - b) / 1e6; }
  return { saat, planetHoeheM: r2(h, 0), kuesteKm: r2(p.kont, 1), land: r2(regler.land, 3), h00: r2(G.hoehe(L, 0, 0, true), 1), wl: r2(L.waterLevel, 2), l240, l1000, l4800, ms240: r2(ms240, 1), msWeit: r2(msWeit, 1) };
};
const aus = { samen, version: P.VERSION, boeschung: G.ERDBAU.boeschung };
aus.vier = process.argv.slice(7).map((s) => { const [b, l, t] = s.split(',').map(Number); return zeile(b, l, t || 0); });
// Stichprobe: Land-Orte des Planeten (Hoehe > 0), Satz-Genauigkeit 0,01 Grad
const klassen = { kueste: { n: 0, t0: 0, t240: 0, t1000: 0, t4800: 0 }, innen: { n: 0, t0: 0, t240: 0, t1000: 0, t4800: 0 } };
let ms = 0, nn = 0;
for (let i = 0; i < N; i++) {
  const y = 1 - 2 * (i + 0.5) / N, phi = Math.asin(y), lam = ((i * 2.399963229728653) % (2 * Math.PI)) - Math.PI;
  const bg = r2(grad(phi), 2), lg = r2(grad(lam), 2), p = {};
  if (!(P.planetPunkt(S0, rad(bg), rad(lg), 16, p) > 0)) continue;
  const z = zeile(bg, lg, 0), K = p.kont < 100 ? klassen.kueste : klassen.innen;
  K.n++; if (z.l240 === 0) K.t0++; if (z.l240 >= 0) K.t240++; if (z.l1000 >= 0) K.t1000++; if (z.l4800 >= 0) K.t4800++;
  ms += z.ms240 + z.msWeit; nn++;
}
aus.stichprobe = klassen; aus.msJeOrt = r2(ms / Math.max(1, nn), 1);
console.log(JSON.stringify(aus, null, 1));
