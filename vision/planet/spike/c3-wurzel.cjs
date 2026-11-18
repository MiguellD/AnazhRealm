'use strict';
// Wurzel von c3 (spike.md §c): woher kommt das Hochland (> 2 km) einer Saat, wenn es NICHT am konvergenten Rand liegt?
// Je Hochland-Adresse (40 000 Fibonacci-Adressen, fuss 16 km) die Klasse: konvergenter Rand ≤ 500 km · anderer Rand ≤ 500 km
// (divergent/transform) · aktives Orogen ohne Rand-Nähe · erloschenes Orogen (Gedächtnis, K4) · keine Rand- und Orogen-Spur.
// Aufruf: node c3-wurzel.cjs erde-04 erde-07 erde-01
const L = require('./lib.cjs');
const { P } = L;
const samen = process.argv.slice(2).length ? process.argv.slice(2) : ['erde-04', 'erde-07', 'erde-01'];
const N = 40000, F = L.fib(N), o = {};
console.log(L.kopf('c3-wurzel') + ' · ' + N + ' Adressen · Hochland > 2 km');
for (const same of samen) {
  const S = P.planetScheibe(L.planVon(same, L.erdKoerper()), 0);
  const k = { konvergent: 0, andererRand: 0, orogenAktiv: 0, orogenAlt: 0, ohneSpur: 0 }; let hoch = 0, land = 0; const hS = [];
  for (let i = 0; i < N; i++) {
    const h = P.planetPunktR(S, F[3 * i], F[3 * i + 1], F[3 * i + 2], 16, o);
    if (h <= 0) continue; land++;
    if (h <= 2000) continue; hoch++;
    if (o.randArt === P.RAND_ART.konvergent && o.randAbstandKm <= 500) k.konvergent++;
    else if (o.randArt !== P.RAND_ART.innen && o.randAbstandKm <= 500) k.andererRand++;
    else if (o.orogenStaerke > 0.05 && o.orogenAktiv) k.orogenAktiv++;
    else if (o.orogenStaerke > 0.05) k.orogenAlt++;
    else { k.ohneSpur++; hS.push(h); }
  }
  console.log(same + ' · Land ' + land + ' · Hochland ' + hoch + ' (' + (100 * hoch / land).toFixed(1) + ' % des Landes) · ' + Object.entries(k).map(([n, v]) => n + ' ' + v + ' (' + (100 * v / Math.max(1, hoch)).toFixed(0) + ' %)').join(' · ') + (hS.length ? ' · ohne Spur: Höhe Median ' + L.median(hS).toFixed(0) + ' m, max ' + Math.max(...hS).toFixed(0) + ' m' : ''));
}
