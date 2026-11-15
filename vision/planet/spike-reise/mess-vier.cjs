// Probe "vier Orte": Nord-Halbkugel (dieselbe Jahreszeit wie die Heimat), je Klasse die besten Kandidaten samt Landung (Makro)
// und der Reihe der Ort-Saaten (#k). Aufruf: node mess-vier.cjs <planet-core.js> <gelaende-core.js> <simplex-noise.js> [samen] [N]
'use strict';
const path = require('path');
globalThis.window = globalThis;
const sx = require(path.resolve(process.argv[4]));
const Simplex = typeof sx === 'function' ? sx : (sx && sx.SimplexNoise) || globalThis.SimplexNoise;
require(path.resolve(process.argv[3])); const G = globalThis.__gelaendeCore;
const P = require(path.resolve(process.argv[2]));
const samen = process.argv[5] || 'anazh-realm-seed', N = Number(process.argv[6] || 8000);
const grad = (r) => r * 180 / Math.PI, rad = (g) => g * Math.PI / 180, r2 = (v, n = 2) => Number(v.toFixed(n));
const og = { kuehlungKJeM: G.TEMPERATUR.sommer / ((G.SCHNEE.start + G.SCHNEE.voll) / 2), meerUnterBasisM: G.LAGE_GRUND.meerUnterBasis,
  regler: G.LANDFORM_REGLER, klimaHeute: Object.assign({}, G.TEMPERATUR, { spendeMm: G.PEGEL.spende * 1000 * 365.25 }) };
const plan = P.planetPlan(samen, Object.assign({}, P.PLANET_ERDE, { jahrTage: og.klimaHeute.jahrTage }));
const S0 = P.planetScheibe(plan, 0), A = P.planetAnker(plan, 0, og);
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
const Lg = G.lageGrund(samen, Simplex);
const linien = (d) => {
  const T = G.TEMPERATUR, ampVerh = ((T.sommer + d.sommer) - (T.winter + d.winter)) / (T.sommer - T.winter);
  const f = (y, tr) => { const F = G.temperaturFeld(Lg, y, tr); return { mittel: F.mittel + (d.sommer + d.winter) / 2, kuehlung: F.kuehlung, jahr: { amp: F.jahr.amp * ampVerh, gipfel: F.jahr.gipfel, spaet: F.jahr.spaet }, tag: F.tag }; };
  return { sommerMitteM: r2(G.schneeLinie(Lg, T.sommerPhase, f) - Lg.waterLevel, 1), winterMitteM: r2(G.schneeLinie(Lg, (T.sommerPhase + 0.5) % 1, f) - Lg.waterLevel, 1) };
};
const o = {}, p = {}, kand = [];
for (let i = 0; i < N; i++) {
  const y = 1 - 2 * (i + 0.5) / N; if (y <= 0) continue;
  const phi = Math.asin(y), lam = ((i * 2.399963229728653) % (2 * Math.PI)) - Math.PI;
  const bg = r2(grad(phi), 2), lg = r2(grad(lam), 2);
  const h = P.planetPunkt(S0, rad(bg), rad(lg), 16, p); if (!(h > 0)) continue;
  P.planetOrt(S0, rad(bg), rad(lg), og, o);
  kand.push({ bg, lg, kont: p.kont, hoeheM: h, sommer: o.klima.sommer, winter: o.klima.winter, spende: o.klima.spendeMm, regen: o.wetter.regenQuote, koeppen: o.biom.koeppen });
}
const klassen = {
  heissTrocken: [(k) => k.hoeheM < 900 && k.kont > 150 && k.sommer > 30 && k.spende < 5, (k) => k.sommer - k.regen * 20],
  kalt: [(k) => k.hoeheM < 500 && k.kont < 150 && k.kont > 5, (k) => -k.sommer],
  nassWarmKueste: [(k) => k.hoeheM < 500 && k.kont < 60 && k.kont > 3 && k.sommer > 24 && k.winter > 15, (k) => k.spende + 1500 * k.regen],
};
const aus = { samen, version: P.VERSION, anker: [r2(grad(A.breite), 3), r2(grad(A.laenge), 3)], landNord: kand.length, klassen: {} };
for (const name of Object.keys(klassen)) {
  const [f, w] = klassen[name];
  const top = kand.filter(f).sort((a, b) => w(b) - w(a)).slice(0, 6);
  aus.klassen[name] = top.map((k) => {
    const oo = P.planetOrt(S0, rad(k.bg), rad(k.lg), og, {});
    let salz = -1, h00 = null; const reihe = [];
    for (let s = 0; s < 6; s++) {
      const saat = samen + '@' + k.bg.toFixed(2) + ',' + k.lg.toFixed(2) + ',0' + (s ? '#' + s : '');
      const { L } = lageVon(saat, oo.delta); const t = traegt(L, 0, 0); reihe.push(t ? 1 : 0);
      if (t && salz < 0) { salz = s; h00 = r2(G.hoehe(L, 0, 0, true), 1); }
    }
    const { regler } = lageVon('x', oo.delta);
    return { satz: 'reise ' + k.bg + ' ' + k.lg, kuesteKm: r2(k.kont, 1), planetHoeheM: r2(k.hoeheM, 0), koeppen: k.koeppen,
      sommer: r2(oo.klima.sommer), winter: r2(oo.klima.winter), spendeMm: r2(oo.klima.spendeMm, 1),
      dSommer: r2(oo.delta.klima.sommer), dWinter: r2(oo.delta.klima.winter), dTagAmp: r2(oo.delta.klima.tagAmp), spendeVerh: r2(oo.delta.klima.spendeVerh, 3),
      dRegen: r2(oo.delta.wetter.regenQuote, 3), dSturm: r2(oo.delta.wetter.sturmQuote, 3),
      regler: { land: r2(regler.land, 3), hoehe: r2(regler.hoehe, 3), rauhLambda: r2(regler.rauhLambda, 0), trog: r2(regler.trog, 3), ks: r2(regler.ks, 2), tafel: r2(regler.tafel, 3) },
      linien: linien(oo.delta.klima), traegtReihe: reihe.join(''), ersteSaat: salz, h00 };
  });
}
console.log(JSON.stringify(aus, null, 1));
