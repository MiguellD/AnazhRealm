'use strict';
// Probe (c) WIRKLICHKEIT gegen die Erde als Zahl — spike.md §c. Je Same (Erd-Körper PLANET_ERDE): 40 000 flächentreue Adressen.
//  c1 Hypsometrie zweigipflig · c2 Land-Anteil · c3 Gebirge an Platten-Rändern · c4 Wüsten um ±30° · c5 Wüsten im Regenschatten
//  c6 Flüsse münden ins Meer (Wasser-Gitter S5): Endsee-Anteil, Trockenheit der Endsee-Gebiete, größtes Einzugsgebiet, Abfluss ins Meer
// Aufruf: node c-erde.cjs [n-saaten]
const L = require('./lib.cjs');
const { P } = L;
const NS = +(process.argv[2] || 10), N = 40000, NW = 40000;
console.log(L.kopf('c-erde') + ' · Saaten erde-01 … erde-' + String(NS).padStart(2, '0') + ' · ' + N + ' Adressen · N_W ' + NW);
const F = L.fib(N), alle = [];
for (let s = 1; s <= NS; s++) {
  const same = 'erde-' + String(s).padStart(2, '0');
  const plan = L.planVon(same, L.erdKoerper()), S = P.planetScheibe(plan, 0);
  const hist = new Float64Array(24); // −11 … +13 km, 1-km-Fächer
  let land = 0, hoch = 0, hochRand = 0, landRand = 0;
  const band = Array.from({ length: 18 }, () => ({ land: 0, bw: 0 }));
  let westLand = 0, westB = 0, leeLand = 0, leeB = 0, luvLand = 0, luvB = 0;
  const o = {};
  for (let i = 0; i < N; i++) {
    const x = F[3 * i], y = F[3 * i + 1], z = F[3 * i + 2];
    L.adresse(S, x, y, z, 16, o);
    const hk = o.hoeheM / 1000, fb = Math.floor(hk + 11); if (fb >= 0 && fb < 24) hist[fb]++;
    if (o.hoeheM <= 0) continue;
    land++;
    const nahRand = o.randArt === P.RAND_ART.konvergent && o.randAbstandKm <= 500;
    if (nahRand) landRand++;
    if (o.hoeheM > 2000) { hoch++; if (nahRand) hochRand++; }
    const phi = Math.asin(y) * 180 / Math.PI, bi = Math.min(17, Math.floor((phi + 90) / 10));
    band[bi].land++; const istBW = o.koeppen === 3 || o.koeppen === 4, istB = o.koeppen >= 3 && o.koeppen <= 6; if (istBW) band[bi].bw++;
    const ap = Math.abs(phi);
    if (ap >= 35 && ap <= 55) { westLand++; if (istB) westB++; if (o.lee >= 0.3) { leeLand++; if (istB) leeB++; } if (o.lee <= 0.05) { luvLand++; if (istB) luvB++; } }
  }
  // c1 zwei Gipfel: lokale Maxima des Histogramms, getrennt durch ein Tal ≤ 50 % des kleineren Gipfels
  const hN = Array.from(hist, v => v / N);
  let gO = -1, gL = -1; for (let k = 0; k < 24; k++) { const km = k - 11 + 0.5; if (km < -1) { if (gO < 0 || hN[k] > hN[gO]) gO = k; } else { if (gL < 0 || hN[k] > hN[gL]) gL = k; } }
  let tal = 1; for (let k = gO + 1; k < gL; k++) tal = Math.min(tal, hN[k]);
  const zweigipflig = gO >= 0 && gL >= 0 && tal <= 0.5 * Math.min(hN[gO], hN[gL]) && (gL - gO) >= 3;
  // c4 Breite des Wüsten-Gipfels je Halbkugel
  const anteil = band.map(b => b.land ? b.bw / b.land : 0);
  let nG = 9, sG = 8; for (let k = 9; k < 18; k++) if (band[k].land >= 20 && anteil[k] > anteil[nG]) nG = k; for (let k = 0; k < 9; k++) if (band[k].land >= 20 && anteil[k] > anteil[sG]) sG = k;
  const gipfelN = nG * 10 - 90 + 5, gipfelS = sG * 10 - 90 + 5;
  // c6 Wasser
  const W = L.wasserGitter(S, NW);
  let wLand = 0, wEnd = 0, endTrocken = 0, exoTrocken = 0, endN = 0, exoN = 0; const becken = new Map();
  let qMeer = 0;
  for (let i = 0; i < NW; i++) {
    if (W.h[i] <= 0) continue; wLand++;
    const pet = 400 + 45 * Math.max(0, W.tJ[i]), ar = W.pM[i] / pet;
    if (W.ziel.meer[i] < 0) { wEnd++; endTrocken += ar; endN++; } else { exoTrocken += ar; exoN++; becken.set(W.ziel.meer[i], (becken.get(W.ziel.meer[i]) || 0) + W.A); }
    if (W.h[W.emp[i]] <= 0 && W.ziel.meer[i] >= 0) qMeer += W.acc[i];
  }
  const groesst = Math.max(0, ...becken.values());
  // Kreis-Probe: endet jeder Lauf? (Schritte bis Meer oder Endsee ≤ N_W)
  let kreis = 0, laeufe = 0; for (let i = 0; i < NW; i++) { if (W.h[i] <= 0) continue; laeufe++; let c = i, k = 0; while (W.h[c] > 0 && W.endseeVon[c] < 0 && k <= NW) { c = W.emp[c]; k++; } if (k > NW) kreis++; }
  const r = { same, land: land / N, hyps: hN, gipfelOzeanKm: gO - 11 + 0.5, gipfelLandKm: gL - 11 + 0.5, talAnteil: tal, zweigipflig,
    hochNahRand: hoch ? hochRand / hoch : NaN, landNahRand: land ? landRand / land : NaN, anreicherung: hoch && landRand ? (hochRand / hoch) / (landRand / land) : NaN, hochAnteil: land ? hoch / land : 0,
    wuesteGipfelN: gipfelN, wuesteGipfelS: gipfelS, bwAnteilLand: band.reduce((s, b) => s + b.bw, 0) / land,
    leeB: leeLand ? leeB / leeLand : NaN, luvB: luvLand ? luvB / luvLand : NaN, leeN: leeLand, luvN: luvLand, westB: westLand ? westB / westLand : NaN,
    endseeAnteil: wLand ? wEnd / wLand : NaN, trockenEnd: endN ? endTrocken / endN : NaN, trockenExo: exoN ? exoTrocken / exoN : NaN,
    groesstesBeckenKm2: groesst, abflussMeerKm3a: qMeer / 1e9, seen: W.seen.length, endseen: W.endN, kreise: kreis, wasserMs: W.ms };
  alle.push(r);
  console.log(same + ' · Land ' + (100 * r.land).toFixed(1) + ' % · Hyps Gipfel ' + r.gipfelOzeanKm + ' / ' + r.gipfelLandKm + ' km, Tal ' + (r.talAnteil * 100).toFixed(2) + ' % → ' + (zweigipflig ? 'zweigipflig' : 'NICHT zweigipflig') +
    ' · >2 km nah konv. Rand ' + (100 * r.hochNahRand).toFixed(0) + ' % gegen Land ' + (100 * r.landNahRand).toFixed(0) + ' % (×' + r.anreicherung.toFixed(2) + ', hoch ' + (100 * r.hochAnteil).toFixed(1) + ' % des Landes)' +
    ' · BW-Gipfel N ' + gipfelN + '° S ' + gipfelS + '° (BW ' + (100 * r.bwAnteilLand).toFixed(1) + ' % Land) · B im Lee ' + (100 * r.leeB).toFixed(0) + ' % (n ' + leeLand + ') / Luv ' + (100 * r.luvB).toFixed(0) + ' % (n ' + luvLand + ')' +
    ' · Endsee-Land ' + (100 * r.endseeAnteil).toFixed(1) + ' % (P/PET end ' + r.trockenEnd.toFixed(2) + ' / exo ' + r.trockenExo.toFixed(2) + ') · größtes Becken ' + (r.groesstesBeckenKm2 / 1e6).toFixed(2) + ' Mio km² · Abfluss ins Meer ' + r.abflussMeerKm3a.toFixed(0) + ' km³/a · Seen ' + r.seen + ' (End ' + r.endseen + ') · Kreise ' + kreis);
}
const med = (k) => L.median(alle.map(r => r[k]).filter(Number.isFinite));
const urteil = {
  zweigipflig: alle.filter(r => r.zweigipflig).length + '/' + alle.length, landMedian: med('land'), landMin: Math.min(...alle.map(r => r.land)), landMax: Math.max(...alle.map(r => r.land)),
  anreicherungMedian: med('anreicherung'), anreicherungMin: Math.min(...alle.map(r => r.anreicherung).filter(Number.isFinite)),
  wuesteN: alle.map(r => r.wuesteGipfelN), wuesteS: alle.map(r => r.wuesteGipfelS), leeZuLuvMedian: L.median(alle.map(r => r.leeB / Math.max(1e-9, r.luvB)).filter(Number.isFinite)),
  endseeMedian: med('endseeAnteil'), trockenVerhaeltnisMedian: L.median(alle.map(r => r.trockenEnd / r.trockenExo).filter(Number.isFinite)),
  groesstesBeckenMedianKm2: med('groesstesBeckenKm2'), abflussMeerMedianKm3a: med('abflussMeerKm3a'), kreise: alle.reduce((s, r) => s + r.kreise, 0),
};
console.log('URTEIL-DATEN ' + JSON.stringify(urteil));
require('fs').writeFileSync(require('path').join(__dirname, 'c-erde.json'), JSON.stringify({ kopf: L.kopf('c-erde'), N, NW, alle, urteil }, null, 1));
