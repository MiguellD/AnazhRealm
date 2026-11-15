// Probe "nass-warme Kueste": Tropen-Band dicht abgetastet, Kandidaten mit mehr Regen als der Anker, samt Reihe der Ort-Saaten.
'use strict';
const path = require('path');
globalThis.window = globalThis;
const sx = require(path.resolve(process.argv[4]));
const Simplex = typeof sx === 'function' ? sx : (sx && sx.SimplexNoise) || globalThis.SimplexNoise;
require(path.resolve(process.argv[3])); const G = globalThis.__gelaendeCore;
const P = require(path.resolve(process.argv[2]));
const samen = process.argv[5] || 'anazh-realm-seed';
const rad = (g) => g * Math.PI / 180, r2 = (v, n = 2) => Number(v.toFixed(n));
const og = { kuehlungKJeM: G.TEMPERATUR.sommer / ((G.SCHNEE.start + G.SCHNEE.voll) / 2), meerUnterBasisM: G.LAGE_GRUND.meerUnterBasis,
  regler: G.LANDFORM_REGLER, klimaHeute: Object.assign({}, G.TEMPERATUR, { spendeMm: G.PEGEL.spende * 1000 * 365.25 }) };
const plan = P.planetPlan(samen, Object.assign({}, P.PLANET_ERDE, { jahrTage: og.klimaHeute.jahrTage }));
const S0 = P.planetScheibe(plan, 0);
const def = Object.fromEntries(G.LANDFORM_REGLER.map((r) => [r.id, r.def]));
const lageVon = (saat, delta) => {
  const regler = Object.assign({}, def);
  for (const id in delta.wildnis) { const r = G.LANDFORM_REGLER.find((q) => q.id === id); regler[id] = Math.min(r.max, Math.max(r.min, def[id] + delta.wildnis[id])); }
  const L = G.lageAus({ seed: saat, baseHeight: 0, waterLevel: -3 + delta.meer.waterLevelM, erbgut: { terme: G.erbgutNormal(G.planErbgut({ art: 'gelaende-plan', v: 1, saat: 'ort', regler })), wildnis: 1 }, regionSize: 2048 }, Simplex);
  L.erdbau = null; return { L, regler };
};
const traegt = (L, x, z) => {
  const h = G.hoehe(L, x, z, true); if (!(h >= L.waterLevel + 1.5)) return false;
  let lo = Infinity, hi = -Infinity; const r = 60;
  for (let k = 0; k <= 12; k++) { const a = (k / 12) * 2 * Math.PI; const q = G.hoehe(L, x + (k ? Math.cos(a) * r : 0), z + (k ? Math.sin(a) * r : 0), true); lo = Math.min(lo, q); hi = Math.max(hi, q); }
  return (hi - lo) / (2 * r) <= G.ERDBAU.boeschung;
};
const o = {}, p = {}, kand = [];
for (let bg = -14; bg <= 30; bg += 0.5) for (let lg = -180; lg < 180; lg += 0.5) {
  const h = P.planetPunkt(S0, rad(bg), rad(lg), 16, p); if (!(h > 0) || p.kont < 3 || p.kont > 80 || h > 500) continue;
  P.planetOrt(S0, rad(bg), rad(lg), og, o);
  if (o.klima.sommer < 24 || o.klima.winter < 18) continue;
  kand.push({ bg, lg, kont: p.kont, h, regen: o.wetter.regenQuote, dRegen: o.delta.wetter.regenQuote, verh: o.delta.klima.spendeVerh, spende: o.klima.spendeMm });
}
kand.sort((a, b) => (b.dRegen + 0.1 * b.verh) - (a.dRegen + 0.1 * a.verh));
const zeilen = kand.slice(0, 10).concat([{ bg: 0.5, lg: -159.61 }]).map((k) => {
  const oo = P.planetOrt(S0, rad(k.bg), rad(k.lg), og, {}); P.planetPunkt(S0, rad(k.bg), rad(k.lg), 16, p);
  const reihe = []; let erste = -1, h00 = null;
  for (let s = 0; s < 8; s++) { const saat = samen + '@' + k.bg.toFixed(2) + ',' + k.lg.toFixed(2) + ',0' + (s ? '#' + s : ''); const { L } = lageVon(saat, oo.delta); const t = traegt(L, 0, 0); reihe.push(t ? 1 : 0); if (t && erste < 0) { erste = s; h00 = r2(G.hoehe(L, 0, 0, true), 1); } }
  const { regler } = lageVon('x', oo.delta);
  return 'reise ' + k.bg + ' ' + k.lg + ' | Kueste ' + r2(p.kont, 1) + ' km Koeppen ' + oo.biom.koeppen + ' | S ' + r2(oo.klima.sommer) + ' W ' + r2(oo.klima.winter) + ' Spende ' + r2(oo.klima.spendeMm, 0) +
    ' | dS ' + r2(oo.delta.klima.sommer) + ' dW ' + r2(oo.delta.klima.winter) + ' dTag ' + r2(oo.delta.klima.tagAmp) + ' Verh ' + r2(oo.delta.klima.spendeVerh, 3) + ' dRegen ' + r2(oo.delta.wetter.regenQuote, 3) + ' dSturm ' + r2(oo.delta.wetter.sturmQuote, 3) +
    ' | land ' + r2(regler.land, 3) + ' hoehe ' + r2(regler.hoehe, 3) + ' trog ' + r2(regler.trog, 3) + ' ks ' + r2(regler.ks, 2) + ' tafel ' + r2(regler.tafel, 3) + ' | traegt ' + reihe.join('') + ' erste ' + erste + ' h00 ' + h00;
});
console.log('Kandidaten ' + kand.length + ' (Tropen-Band, Kueste 3-80 km, S >= 24, W >= 18); mehr Regen als der Anker: ' + kand.filter((k) => k.dRegen > 0).length);
console.log(zeilen.join('\n'));
