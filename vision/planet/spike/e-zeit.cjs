'use strict';
// Probe (e) ZEIT — spike.md §e. Derselbe Same zu drei Zeiten (−100, −50, 0 Ma): driften die Kontinente, und sind sie wiedererkennbar?
//  e1 wiedererkennbar: Anteil der Kontinent-Kruste (Klasse ≥ Schelf) bei t0 = 0, deren Material-Ort zur Zeit t1 (planetOrtDerZeit)
//     dort wieder Kontinent-Kruste trägt.
//  e2 driftend: Median-Weg der Kontinent-Kruste in cm/a; und: Land bei t0, das am MITGEFÜHRTEN Ort bei t1 Land ist, minus Land bei t0,
//     das am SELBEN Ort bei t1 Land ist (mitgeführt − stehend).
// Aufruf: node e-zeit.cjs [n-saaten]
const L = require('./lib.cjs');
const { P } = L;
const NS = +(process.argv[2] || 5), N = 12000;
console.log(L.kopf('e-zeit') + ' · Saaten erde-01 … erde-' + String(NS).padStart(2, '0') + ' · ' + N + ' Adressen');
const F = L.fib(N), alle = [];
for (let s = 1; s <= NS; s++) {
  const same = 'erde-' + String(s).padStart(2, '0'), plan = L.planVon(same, L.erdKoerper());
  const S0 = P.planetScheibe(plan, 0), b0 = [], a = {}, o = {};
  for (let i = 0; i < N; i++) { const h = P.planetPunktR(S0, F[3 * i], F[3 * i + 1], F[3 * i + 2], 40, a); b0.push({ land: h > 0, kont: a.kruste >= P.KRUSTE.schelf }); }
  for (const t1 of [-50, -100]) {
    const S1 = P.planetScheibe(plan, t1);
    let kN = 0, kTreu = 0, lN = 0, lMit = 0, lStand = 0, nicht = 0; const weg = [];
    for (let i = 0; i < N; i++) {
      const x = F[3 * i], y = F[3 * i + 1], z = F[3 * i + 2], br = Math.atan2(y, Math.hypot(x, z)), la = Math.atan2(z, x);
      if (!b0[i].kont && !b0[i].land) continue;
      P.planetOrtDerZeit(plan, br, la, 0, t1, o);
      if (!o.existiert) { nicht++; continue; }
      const h1m = P.planetPunkt(S1, o.breite, o.laenge, 40, a), kont1 = a.kruste >= P.KRUSTE.schelf;
      const hs = P.planetPunktR(S1, x, y, z, 40);
      const u0 = [x, y, z], u1 = [Math.cos(o.breite) * Math.cos(o.laenge), Math.sin(o.breite), Math.cos(o.breite) * Math.sin(o.laenge)];
      if (b0[i].kont) { kN++; if (kont1) kTreu++; weg.push(L.bogen(u0, u1) * S0.R / Math.abs(t1) * 0.1); } // km/Ma × 0,1 = cm/a
      if (b0[i].land) { lN++; if (h1m > 0) lMit++; if (hs > 0) lStand++; }
    }
    const r = { same, t1, kontTreu: kTreu / kN, wegCmA: L.median(weg), wegP10: L.quantil(weg, 0.1), wegP90: L.quantil(weg, 0.9), mitgefuehrt: lMit / lN, stehend: lStand / lN, vorteil: lMit / lN - lStand / lN, nichtEntstanden: nicht };
    alle.push(r);
    console.log(same + ' 0 → ' + t1 + ' Ma · Kontinent wiedererkannt ' + (100 * r.kontTreu).toFixed(1) + ' % · Weg Median ' + r.wegCmA.toFixed(2) + ' cm/a (p10 ' + r.wegP10.toFixed(2) + ', p90 ' + r.wegP90.toFixed(2) + ') · Land bleibt Land mitgeführt ' + (100 * r.mitgefuehrt).toFixed(1) + ' % / stehend ' + (100 * r.stehend).toFixed(1) + ' % (Vorteil ' + (100 * r.vorteil).toFixed(1) + ' Punkte)');
  }
}
const sel = (t) => alle.filter(r => r.t1 === t);
const urteil = {
  treu50Min: Math.min(...sel(-50).map(r => r.kontTreu)), treu100Min: Math.min(...sel(-100).map(r => r.kontTreu)),
  wegMedianCmA: L.median(alle.map(r => r.wegCmA)), wegMin: Math.min(...alle.map(r => r.wegCmA)), wegMax: Math.max(...alle.map(r => r.wegCmA)),
  vorteil100Min: Math.min(...sel(-100).map(r => r.vorteil)), vorteil50Min: Math.min(...sel(-50).map(r => r.vorteil)),
};
console.log('URTEIL-DATEN ' + JSON.stringify(urteil));
require('fs').writeFileSync(require('path').join(__dirname, 'e-zeit.json'), JSON.stringify({ kopf: L.kopf('e-zeit'), N, alle, urteil }, null, 1));
