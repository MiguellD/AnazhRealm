'use strict';
// Probe (a) KOSTEN JE ADRESSE — spike.md §a. Höhe (S2), Klima (S4), Biom (S7) und Wasser (S5, Prototyp) an 10 000 zufälligen
// Adressen, jede EINZELN gerufen, auf vier Radien desselben Samens (Erd-Körper, nur radiusKm getauscht). Dazu die festen Vor-Läufe
// je (Same, Zeit): Plan, Scheibe (samt Meer), Klima-Gleichgewicht, Wasser-Gitter — und ob der Heap mit den Adressen wächst.
// Aufruf: node a-kosten.cjs [same] [n]   → Ausgabe auf stdout (a-kosten.out.txt) und a-kosten.json
const L = require('./lib.cjs');
const { P } = L;
const same = process.argv[2] || 'erde-01', N = +(process.argv[3] || 10000), NW = 40000;
const RADIEN = [3186, 6371, 12742, 25484];
console.log(L.kopf('a-kosten') + ' · same ' + same + ' · n ' + N + ' · N_W ' + NW + (global.gc ? '' : ' · OHNE --expose-gc: der Heap urteilt nicht'));
const erg = [];
// zwei Durchgänge: der erste wärmt (JIT, Memo der Kugel-Proben), gezählt wird der zweite in umgekehrter Folge
for (const [durchgang, R] of [...RADIEN.map(r => [0, r]), ...RADIEN.slice().reverse().map(r => [1, r])]) {
  global.gc && global.gc();
  let a = L.ns(); const plan = P.planetPlan(same, L.erdKoerper({ radiusKm: R })); const msPlan = (L.ns() - a) / 1e6;
  a = L.ns(); const S = P.planetScheibe(plan, 0); const msScheibe = (L.ns() - a) / 1e6;
  a = L.ns(); const W = L.wasserGitter(S, NW); const msWasser = (L.ns() - a) / 1e6;
  const rnd = L.zufall('a|' + same), u = new Float64Array(3), o = {}, w = {};
  // warm: 500 Adressen ungezählt
  for (let i = 0; i < 500; i++) { L.einheit(rnd, u); L.adresse(S, u[0], u[1], u[2], 16, o); L.wasserAt(W, u[0], u[1], u[2], w); }
  global.gc && global.gc();
  const heap0 = process.memoryUsage().heapUsed;
  const tH = new Float64Array(N), tK = new Float64Array(N), tW = new Float64Array(N), tKL = [];
  let land = 0;
  const pp = {}, kk = {}, bb = {};
  for (let i = 0; i < N; i++) {
    L.einheit(rnd, u);
    let t = L.ns(); const h = P.planetPunktR(S, u[0], u[1], u[2], 16, pp); tH[i] = (L.ns() - t) / 1e3;
    t = L.ns(); P.planetKlimaR(S, u[0], u[1], u[2], -1, kk, pp); P.planetBiom(kk, h, bb); tK[i] = (L.ns() - t) / 1e3;
    t = L.ns(); L.wasserAt(W, u[0], u[1], u[2], w); tW[i] = (L.ns() - t) / 1e3;
    if (h > 0) { land++; tKL.push(tK[i]); }
  }
  if (durchgang === 0) { console.log('   (Durchgang 1, wärmt: R ' + R + ' km, gesamt Median ' + L.median(tH.map((v, i) => v + tK[i] + tW[i])).toFixed(1) + ' µs — nicht gezählt)'); continue; }
  const heap1 = process.memoryUsage().heapUsed;
  global.gc && global.gc();
  const heap2 = process.memoryUsage().heapUsed;
  const ges = tH.map((v, i) => v + tK[i] + tW[i]);
  const r = { radiusKm: R, msPlan, msScheibe, msWasser, wasserZellenMs: W.ms.zellen, wasserFlussMs: W.ms.fluss, gitterKm: W.d * R,
    hoeheUs: { median: L.median(tH), p95: L.quantil(tH, 0.95) }, klimaBiomUs: { median: L.median(tK), p95: L.quantil(tK, 0.95) }, klimaBiomLandUs: { median: L.median(tKL), p95: L.quantil(tKL, 0.95) },
    wasserUs: { median: L.median(tW), p95: L.quantil(tW, 0.95) }, gesamtUs: { median: L.median(ges), p95: L.quantil(ges, 0.95), mittel: L.mittel(ges) },
    landAnteil: land / N, heapKB: { vorher: heap0 / 1024, nach: heap1 / 1024, nachGc: heap2 / 1024, wachstumGcKB: (heap2 - heap0) / 1024 },
    planKB: P._intern.planBytes(plan) / 1024, scheibeKB: P._intern.scheibeBytes(S) / 1024 };
  erg.push(r);
  console.log('R ' + R + ' km · Plan ' + msPlan.toFixed(1) + ' ms (' + r.planKB.toFixed(1) + ' KB) · Scheibe+Meer ' + msScheibe.toFixed(1) + ' ms (' + r.scheibeKB.toFixed(1) + ' KB) · Wasser-Gitter ' + msWasser.toFixed(0) + ' ms (Zellen ' + W.ms.zellen.toFixed(0) + ' + Lauf ' + W.ms.fluss.toFixed(0) + '; Weite ' + r.gitterKm.toFixed(0) + ' km)');
  console.log('   je Adresse µs  Höhe ' + r.hoeheUs.median.toFixed(1) + ' (p95 ' + r.hoeheUs.p95.toFixed(1) + ') · Klima+Biom ' + r.klimaBiomUs.median.toFixed(1) + ' (p95 ' + r.klimaBiomUs.p95.toFixed(1) + ') · Wasser ' + r.wasserUs.median.toFixed(2) + ' (p95 ' + r.wasserUs.p95.toFixed(2) + ') · gesamt ' + r.gesamtUs.median.toFixed(1) + ' (p95 ' + r.gesamtUs.p95.toFixed(1) + ', Mittel ' + r.gesamtUs.mittel.toFixed(1) + ') · Land ' + (100 * r.landAnteil).toFixed(1) + ' % · Heap nach GC ' + (r.heapKB.wachstumGcKB >= 0 ? '+' : '') + r.heapKB.wachstumGcKB.toFixed(0) + ' KB');
}
const e = erg.find(r => r.radiusKm === 6371), g = erg.find(r => r.radiusKm === 4 * 6371);   // 4R = 25 484 km (der zweite Durchgang läuft rückwärts)
const v = (k) => g[k].median / e[k].median;
const urteil = {
  gesamtMedianUs: e.gesamtUs.median, gesamtP95Us: e.gesamtUs.p95,
  faktor4R: { gesamt: v('gesamtUs'), hoehe: v('hoeheUs'), klimaBiom: v('klimaBiomUs'), klimaBiomLand: v('klimaBiomLandUs'), wasser: v('wasserUs') },
  faktorMaxUeberRadien: Math.max(...erg.map(r => r.gesamtUs.median)) / Math.min(...erg.map(r => r.gesamtUs.median)),
  vorlaufFaktor4R: { plan: g.msPlan / e.msPlan, scheibe: g.msScheibe / e.msScheibe, wasser: g.msWasser / e.msWasser },
  vorlaufMaxZuMin: { plan: Math.max(...erg.map(r => r.msPlan)) / Math.min(...erg.map(r => r.msPlan)), scheibe: Math.max(...erg.map(r => r.msScheibe)) / Math.min(...erg.map(r => r.msScheibe)), wasser: Math.max(...erg.map(r => r.msWasser)) / Math.min(...erg.map(r => r.msWasser)) },
  hoeheMedianUs: e.hoeheUs.median, klimaBiomLandMedianUs: e.klimaBiomLandUs.median, wasserMedianUs: e.wasserUs.median, planKBmax: Math.max(...erg.map(r => r.planKB)),
  heapWachstumKB: Math.max(...erg.map(r => r.heapKB.wachstumGcKB)),
};
console.log('URTEIL-DATEN ' + JSON.stringify(urteil));
require('fs').writeFileSync(require('path').join(__dirname, 'a-kosten.json'), JSON.stringify({ kopf: L.kopf('a-kosten'), same, N, NW, erg, urteil }, null, 1));
