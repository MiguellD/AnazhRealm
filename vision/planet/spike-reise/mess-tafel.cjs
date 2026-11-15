// Die Annahme-Tafel der Reise, gerechnet aus Kern + Ort-Gesetz (nur node): je Satz die Groessen "Heimat plus Differenz".
// Aufruf: node mess-tafel.cjs <planet-core.js> <gelaende-core.js> <simplex-noise.js> <samen> <breite,laenge[,zeitMa[,m]]> ...
//   m = Material (planetOrtDerZeit vom Ort bei t = 0); "anker" statt Breite,Laenge = der Anker der Heimat
'use strict';
const path = require('path');
globalThis.window = globalThis;
const sx = require(path.resolve(process.argv[4]));
const Simplex = typeof sx === 'function' ? sx : (sx && sx.SimplexNoise) || globalThis.SimplexNoise;
require(path.resolve(process.argv[3])); const G = globalThis.__gelaendeCore;
const P = require(path.resolve(process.argv[2]));
const samen = process.argv[5];
const rad = (g) => g * Math.PI / 180, grad = (r) => r * 180 / Math.PI, r2 = (v, n = 2) => Number(v.toFixed(n));
const T = G.TEMPERATUR;
const og = { kuehlungKJeM: T.sommer / ((G.SCHNEE.start + G.SCHNEE.voll) / 2), meerUnterBasisM: G.LAGE_GRUND.meerUnterBasis,
  regler: G.LANDFORM_REGLER, klimaHeute: Object.assign({}, T, { spendeMm: G.PEGEL.spende * 1000 * 365.25 }) };
const plan = P.planetPlan(samen, Object.assign({}, P.PLANET_ERDE, { jahrTage: og.klimaHeute.jahrTage }));
const S0 = P.planetScheibe(plan, 0), A = P.planetAnker(plan, 0, og);
const def = Object.fromEntries(G.LANDFORM_REGLER.map((r) => [r.id, r.def]));
const reglerVon = (d) => { const o = Object.assign({}, def); for (const id in d) { const r = G.LANDFORM_REGLER.find((q) => q.id === id); o[id] = Math.min(r.max, Math.max(r.min, def[id] + d[id])); } return o; };
const lageVon = (saat, regler, wl) => { const L = G.lageAus({ seed: saat, baseHeight: 0, waterLevel: wl, erbgut: { terme: G.erbgutNormal(G.planErbgut({ art: 'gelaende-plan', v: 1, saat: 'ort', regler })), wildnis: 1 }, regionSize: 2048 }, Simplex); L.erdbau = null; return L; };
const traegt = (L, x, z) => { const h = G.hoehe(L, x, z, true); if (!(h >= L.waterLevel + 1.5)) return false; let lo = Infinity, hi = -Infinity; for (let k = 0; k <= 12; k++) { const a = (k / 12) * 2 * Math.PI; const q = G.hoehe(L, x + (k ? Math.cos(a) * 60 : 0), z + (k ? Math.sin(a) * 60 : 0), true); lo = Math.min(lo, q); hi = Math.max(hi, q); } return (hi - lo) / 120 <= G.ERDBAU.boeschung; };
const Lg = G.lageGrund(samen, Simplex);
const linien = (d) => { const v = ((T.sommer + d.sommer) - (T.winter + d.winter)) / (T.sommer - T.winter);
  const f = (y, tr) => { const F = G.temperaturFeld(Lg, y, tr); return { mittel: F.mittel + (d.sommer + d.winter) / 2, kuehlung: F.kuehlung, jahr: { amp: F.jahr.amp * v, gipfel: F.jahr.gipfel, spaet: F.jahr.spaet }, tag: F.tag }; };
  return [r2(G.schneeLinie(Lg, T.sommerPhase, f) - Lg.waterLevel, 1), r2(G.schneeLinie(Lg, (T.sommerPhase + 0.5) % 1, f) - Lg.waterLevel, 1)]; };
const klemm01 = (v) => Math.max(0, Math.min(1, v));
console.log('Kern ' + P.VERSION + ' · Samen ' + samen + ' · Anker ' + r2(grad(A.breite), 3) + ' ' + r2(grad(A.laenge), 3) + ' · Heimat-Linien Sommer/Winter ' + linien({ sommer: 0, winter: 0 }).join(' / ') + ' m');
for (const arg of process.argv.slice(6)) {
  const t0 = arg.split(','); let bg, lg, t = 0, mat = false;
  if (t0[0] === 'anker') { bg = grad(A.breite); lg = grad(A.laenge); t = Number(t0[1] || 0); mat = t0[2] === 'm'; } else { bg = Number(t0[0]); lg = Number(t0[1]); t = Number(t0[2] || 0); mat = t0[3] === 'm'; }
  const S = t ? P.planetScheibe(plan, t) : S0; let phi = rad(bg), lam = rad(lg), wo = r2(bg, 2) + ' ' + r2(lg, 2);
  if (mat) { const m = P.planetOrtDerZeit(plan, phi, lam, 0, t, {}); if (!m.existiert) { console.log(arg + ': diesen Boden gab es zur Zeit ' + t + ' nicht'); continue; } phi = m.breite; lam = m.laenge; wo += ' -> ' + r2(grad(phi), 2) + ' ' + r2(grad(lam), 2); }
  const p = {}; const h = P.planetPunkt(S, phi, lam, 16, p); const o = P.planetOrt(S, phi, lam, og, {}); const d = o.delta;
  const R = reglerVon(d.wildnis), wl = -og.meerUnterBasisM + d.meer.waterLevelM, li = linien(d.klima);
  const saatBasis = samen + '@' + r2(grad(phi), 2).toFixed(2) + '_' + r2(grad(lam), 2).toFixed(2) + '_' + t; let k = -1, h00 = null; const reihe = [];
  for (let s = 0; s < 8; s++) { const L = lageVon(saatBasis + (s ? '~' + s : ''), R, wl); const ok = traegt(L, 0, 0); reihe.push(ok ? 1 : 0); if (ok && k < 0) { k = s; h00 = r2(G.hoehe(L, 0, 0, true), 1); } }
  console.log([arg + ' (' + wo + ', t ' + t + ' Ma)', 'Planet: h ' + r2(h, 0) + ' m, Kueste ' + r2(p.kont, 0) + ' km, Koeppen ' + o.biom.koeppen + ', Phase abs. ' + o.klima.sommerPhase,
    'Sommer ' + r2(T.sommer + d.klima.sommer, 1) + ' C (d ' + r2(d.klima.sommer) + ') · Winter ' + r2(T.winter + d.klima.winter, 1) + ' C (d ' + r2(d.klima.winter) + ') · Tagesgang ' + r2(T.tagAmp + d.klima.tagAmp, 2) + ' (d ' + r2(d.klima.tagAmp) + ')',
    'Schnee-Linie Sommer ' + li[0] + ' m / Winter ' + li[1] + ' m · Band-Versatz ' + r2(li[0] - 140.6, 1) + ' m',
    'Meer ' + r2(wl, 2) + ' m (d ' + r2(d.meer.waterLevelM, 2) + ')', 'Spende x ' + r2(d.klima.spendeVerh, 3) + ' = ' + r2(G.PEGEL.spende * 1000 * T.jahrTage * d.klima.spendeVerh, 0) + ' mm, Hub im Mittel ' + r2(Math.pow(d.klima.spendeVerh, 0.6) - 1, 3) + ' x Bett-Tiefe',
    'Regen-Anteil ' + r2(100 * klemm01(0.38 + d.wetter.regenQuote), 1) + ' % (d ' + r2(d.wetter.regenQuote, 3) + ') · Sturm ' + r2(100 * klemm01(0.13 + d.wetter.sturmQuote), 1) + ' % (d ' + r2(d.wetter.sturmQuote, 3) + ') · Wind d ' + r2(d.wetter.windX, 2) + '/' + r2(d.wetter.windZ, 2),
    'Regler land ' + r2(R.land, 3) + ' hoehe ' + r2(R.hoehe, 3) + ' rauhLambda ' + r2(R.rauhLambda, 0) + ' trog ' + r2(R.trog, 3) + ' ks ' + r2(R.ks, 2) + ' tafel ' + r2(R.tafel, 3) + ' (kontinentLambda ' + R.kontinentLambda + ', schichtDicke ' + R.schichtDicke + ', hartAnteil ' + R.hartAnteil + ')',
    'Ort-Saat ' + saatBasis + (k > 0 ? '~' + k : '') + ' · Reihe traegt ' + reihe.join('') + ' · Ursprung ' + h00 + ' m'].join('\n   '));
}
