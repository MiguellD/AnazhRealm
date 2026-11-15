// Probe des Entscheids REISE (nur node, keine GPU): Anker der Heimat-Saat, Kosten Stufe A, vier Orte, Delta, Meer der Zeit.
// Aufruf: node mess-reise.cjs <pfad planet-core.js> <pfad gelaende-core.js> [samen] [modus]
'use strict';
const path = require('path');
const kernPfad = path.resolve(process.argv[2]), gelPfad = path.resolve(process.argv[3]);
const samen = process.argv[4] || 'anazh-realm-seed', modus = process.argv[5] || 'alles';
const ns = () => Number(process.hrtime.bigint());
const ms = (a) => ((ns() - a) / 1e6);
const grad = (r) => r * 180 / Math.PI, rad = (g) => g * Math.PI / 180;
const r2 = (v, n = 2) => Number(v.toFixed(n));

let a = ns(); require(gelPfad); const G = globalThis.__gelaendeCore; const tGel = ms(a);
a = ns(); const P = require(kernPfad); const tKern = ms(a);
const og = { kuehlungKJeM: G.TEMPERATUR.sommer / ((G.SCHNEE.start + G.SCHNEE.voll) / 2), meerUnterBasisM: G.LAGE_GRUND.meerUnterBasis,
  regler: G.LANDFORM_REGLER, klimaHeute: Object.assign({}, G.TEMPERATUR, { spendeMm: G.PEGEL.spende * 1000 * 365.25 }) };
const koerper = Object.assign({}, P.PLANET_ERDE, { jahrTage: og.klimaHeute.jahrTage });

a = ns(); const plan = P.planetPlan(samen, koerper); const tPlan = ms(a);
a = ns(); const S0 = P.planetScheibe(plan, 0); const tScheibe = ms(a);
a = ns(); const A = P.planetAnker(plan, 0, og); const tAnker = ms(a);
a = ns(); const oA = P.planetOrt(S0, A.breite, A.laenge, og, {}); const tOrtKalt = ms(a);
const kosten = { ladenGelMs: r2(tGel, 1), ladenKernMs: r2(tKern, 1), planMs: r2(tPlan, 1), scheibeKaltMs: r2(tScheibe, 1), ankerMs: r2(tAnker, 1), ortKaltMs: r2(tOrtKalt, 2),
  stufeAsummeMs: r2(tKern + tPlan + tScheibe + tAnker + tOrtKalt, 1) };
if (modus === 'kosten') { console.log(JSON.stringify({ samen, version: P.VERSION, kosten })); process.exit(0); }

const kurz = (o) => ({
  klima: { sommer: r2(o.klima.sommer), winter: r2(o.klima.winter), tagAmp: r2(o.klima.tagAmp), sommerPhase: o.klima.sommerPhase, spendeMm: r2(o.klima.spendeMm, 1) },
  delta: { sommer: r2(o.delta.klima.sommer), winter: r2(o.delta.klima.winter), tagAmp: r2(o.delta.klima.tagAmp), spendeVerh: r2(o.delta.klima.spendeVerh, 3),
    meerM: r2(o.delta.meer.waterLevelM, 3), wildnis: Object.fromEntries(Object.entries(o.delta.wildnis).map(([k, v]) => [k, r2(v, 3)])),
    wetter: Object.fromEntries(Object.entries(o.delta.wetter).map(([k, v]) => [k, r2(v, 3)])) },
  wildnis: Object.fromEntries(Object.entries(o.wildnis).map(([k, v]) => [k, r2(v, 3)])),
  wetter: Object.fromEntries(Object.entries(o.wetter).map(([k, v]) => [k, r2(v, 3)])),
  koeppen: o.biom.koeppen, hauptklasse: o.biom.hauptklasse,
  leit: { huelleMin: r2(Math.min(...o.leit.huelleM), 1), huelleMax: r2(Math.max(...o.leit.huelleM), 1), landCMin: r2(Math.min(...o.leit.landC), 3), landCMax: r2(Math.max(...o.leit.landC), 3) },
});
const nullDelta = () => {
  const d = oA.delta; let n = 0, z = 0;
  for (const g of ['wildnis', 'klima', 'wetter', 'meer']) for (const k in d[g]) { n++; if (k === 'spendeVerh' ? d[g][k] === 1 : Object.is(d[g][k], 0)) z++; }
  let l = 0; for (let k = 0; k < 81; k++) if (Object.is(d.leit.huelleM[k], 0) && Object.is(d.leit.landC[k], 0)) l++;
  return { felder: n, null: z, leitNull: l };
};
const aus = { samen, version: P.VERSION, kernBytes: require('fs').statSync(kernPfad).size, kosten,
  anker: { breiteGrad: r2(grad(A.breite), 3), laengeGrad: r2(grad(A.laenge), 3), sommerC: r2(A.sommerC), winterC: r2(A.winterC), kuesteKm: r2(A.kuesteKm, 1), wertung: r2(A.wertung, 4) },
  ankerOrt: kurz(oA), ankerDeltaNull: nullDelta(), ankerSommerPhaseAbsolut: oA.klima.sommerPhase, heimatSommerPhase: G.TEMPERATUR.sommerPhase };

// die Schnee-Linie, die das Ort-Gesetz mit Heimat + Delta rechnet (Kuehlung der Heimat bleibt): gelaende-core schneeLinie ueber feldAt
const L = G.lageGrund(samen, function Rausch() { this.noise2D = () => 0; });
const feldMit = (d, phase) => (y, tr) => {
  const F = G.temperaturFeld(L, y, tr), T = G.TEMPERATUR;
  const ampVerh = ((T.sommer + d.sommer) - (T.winter + d.winter)) / (T.sommer - T.winter);
  return { mittel: F.mittel + (d.sommer + d.winter) / 2, kuehlung: F.kuehlung, jahr: { amp: F.jahr.amp * ampVerh, gipfel: phase, spaet: F.jahr.spaet }, tag: F.tag };
};
const linien = (d, phase) => {
  const f = feldMit(d, phase);
  return { sommerMitteM: r2(G.schneeLinie(L, phase, f) - L.waterLevel, 1), winterMitteM: r2(G.schneeLinie(L, (phase + 0.5) % 1, f) - L.waterLevel, 1) };
};
aus.heimatLinien = linien({ sommer: 0, winter: 0 }, G.TEMPERATUR.sommerPhase);

// Suche: Land-Orte bei t = 0 (Fibonacci), je Ort das volle planetOrt
const N = Number(process.env.N || 4000), o = {}, p = {};
const kand = [];
a = ns(); let nOrt = 0;
for (let i = 0; i < N; i++) {
  const y = 1 - 2 * (i + 0.5) / N, phi = Math.asin(y), lam = ((i * 2.399963229728653) % (2 * Math.PI)) - Math.PI;
  const h = P.planetPunkt(S0, phi, lam, 16, p); if (!(h > 0)) continue;
  P.planetOrt(S0, phi, lam, og, o); nOrt++;
  kand.push({ phi, lam, kont: p.kont, hoeheM: h, sommer: o.klima.sommer, winter: o.klima.winter, spende: o.klima.spendeMm, land: o.wildnis.land, koeppen: o.biom.koeppen });
}
aus.suche = { proben: N, land: nOrt, ortMsJe: r2(ms(a) / Math.max(1, nOrt), 3) };
const waehle = (f, wert) => { let b = null, bw = -Infinity; for (const k of kand) { if (!f(k)) continue; const w = wert(k); if (w > bw) { bw = w; b = k; } } return b; };
const ziele = {
  heissTrocken: waehle((k) => k.hoeheM < 800 && k.kont > 50, (k) => k.sommer - k.spende / 40),
  kalt: waehle((k) => k.hoeheM < 500 && k.kont < 200 && k.kont > 5, (k) => -k.sommer - 0.3 * k.winter),
  nassWarmKueste: waehle((k) => k.hoeheM < 400 && k.kont < 80 && k.kont > 3 && k.sommer > 22 && k.winter > 12, (k) => k.spende),
};
aus.ziele = {};
for (const name of Object.keys(ziele)) {
  const k = ziele[name]; if (!k) { aus.ziele[name] = null; continue; }
  // der Satz des Spielers traegt Grad mit zwei Stellen: am gerundeten Ort neu gerechnet
  const bg = r2(grad(k.phi), 2), lg = r2(grad(k.lam), 2);
  const h = P.planetPunkt(S0, rad(bg), rad(lg), 16, p);
  const oo = P.planetOrt(S0, rad(bg), rad(lg), og, {});
  const sued = bg < 0, ankerSued = A.breite < 0, phase = (G.TEMPERATUR.sommerPhase + (sued !== ankerSued ? 0.5 : 0)) % 1;
  aus.ziele[name] = Object.assign({ satz: 'reise ' + bg + ' ' + lg, breiteGrad: bg, laengeGrad: lg, hoeheM: r2(h, 0), kuesteKm: r2(p.kont, 1), phaseGegenAnker: phase,
    linien: linien(oo.delta.klima, phase) }, kurz(oo));
}
// das Meer der Zeit: derselbe Ort (nassWarmKueste bzw. Anker) zu anderen Zeiten
aus.zeit = [];
const zk = ziele.nassWarmKueste || { phi: A.breite, lam: A.laenge };
for (const t of [-35, -50, -100, 50]) {
  a = ns(); const St = P.planetScheibe(plan, t); const tS = ms(a);
  const oo = P.planetOrt(St, zk.phi, zk.lam, og, {});
  const mat = P.planetOrtDerZeit(plan, zk.phi, zk.lam, 0, t, {});
  let om = null; if (mat.existiert) { const q = P.planetOrt(St, mat.breite, mat.laenge, og, {}); om = { breiteGrad: r2(grad(mat.breite), 2), laengeGrad: r2(grad(mat.laenge), 2), land: r2(q.wildnis.land, 3), sommer: r2(q.klima.sommer), meerM: r2(q.delta.meer.waterLevelM, 2) }; }
  aus.zeit.push({ zeitMa: t, scheibeKaltMs: r2(tS, 1), meerKm: r2(St.meerKm, 4), deltaMeerM: r2(oo.delta.meer.waterLevelM, 2), geographisch: { land: r2(oo.wildnis.land, 3), sommer: r2(oo.klima.sommer), spendeMm: r2(oo.klima.spendeMm, 1) }, material: mat.existiert ? om : 'existiert nicht' });
}
// zweimal derselbe Satz: dieselben Bytes (frischer Plan)
const plan2 = P.planetPlan(samen, koerper), S2 = P.planetScheibe(plan2, 0);
const z1 = ziele.kalt || ziele.heissTrocken; if (z1) {
  const j = (pl, S) => JSON.stringify(P.planetOrt(S, z1.phi, z1.lam, og, {}).delta, (k, v) => (v instanceof Float64Array ? Array.from(v) : v));
  aus.zweimalGleich = j(plan, S0) === j(plan2, S2);
}
console.log(JSON.stringify(aus, null, 1));
