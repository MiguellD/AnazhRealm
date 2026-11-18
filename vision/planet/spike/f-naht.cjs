'use strict';
// Probe (f) NAHT — spike.md §f (Gesetz §5). Die Heimat ist die Adresse anker(Same); jede Heimat-Größe = Heimat-Wert + Δ(Ort − Anker).
//  f1 am Anker ist jedes Δ Object.is(…, 0) bzw. jedes Verhältnis 1 (Byte-Gleichheit am ersten Tag)
//  f2 der benannte Unterschied: |Δ| je Abstand r = 0,01 · 1 · 8 · 64 · 512 km vom Anker (8 Richtungen, Karten-Meter der Würfel-Fläche)
// Das Ort-Gesetz ist die EINE Tafel des Gelände-Kerns (gelaende-core `ortGesetz()`), wie im Faden des Spiels gelesen.
// Aufruf: node f-naht.cjs [n-saaten]
const path = require('path');
const L = require('./lib.cjs');
const { P } = L;
require(path.join(path.dirname(L.KERN), 'gelaende-core.js'));
const og = globalThis.__gelaendeCore.ortGesetz();
const NS = +(process.argv[2] || 5);
console.log(L.kopf('f-naht') + ' · Saaten erde-01 … erde-' + String(NS).padStart(2, '0') + ' · Ort-Gesetz kuehlungKJeM ' + og.kuehlungKJeM + ' · meerUnterBasisM ' + og.meerUnterBasisM + ' · klimaHeute ' + JSON.stringify(og.klimaHeute));
const ABST = [0.01, 1, 8, 64, 512], alle = [];
function null0(d) { const z = (v) => Object.is(v, 0); let ok = true; for (const g of ['wildnis', 'meer', 'klima', 'wetter']) for (const k in d[g]) if (k === 'spendeVerh' ? d[g][k] !== 1 : !z(d[g][k])) ok = false; for (const k in d.wuchs) if (d.wuchs[k] !== 1) ok = false; for (let i = 0; i < 81; i++) if (!z(d.leit.huelleM[i]) || !z(d.leit.landC[i])) ok = false; return ok; }
for (let s = 1; s <= NS; s++) {
  const same = 'erde-' + String(s).padStart(2, '0'), plan = L.planVon(same, L.erdKoerper()), S = P.planetScheibe(plan, 0);
  const A = P.planetAnker(plan, 0, og), o0 = P.planetOrt(S, A.breite, A.laenge, og);
  const nullOk = null0(o0.delta);
  const kv = P.planetKarteVon(plan, A, ...P.planetRichtung(A.breite, A.laenge), {});
  const zeile = { same, ankerBreiteGrad: A.breite * 180 / Math.PI, ankerLaengeGrad: A.laenge * 180 / Math.PI, nullOk, je: [] };
  for (const r of ABST) {
    let dT = 0, dW = 0, dH = 0, dSp = 0, dWa = 0, dMeer = 0; const v3 = new Float64Array(3), bl = new Float64Array(2);
    for (let k = 0; k < 8; k++) {
      const w = 2 * Math.PI * k / 8;
      P.planetFlaeche(plan, A, kv.flaeche, kv.xiM + Math.cos(w) * r * 1000, kv.etaM + Math.sin(w) * r * 1000, v3);
      P.planetBreiteLaenge(v3[0], v3[1], v3[2], bl);
      const d = P.planetOrt(S, bl[0], bl[1], og).delta;
      dT = Math.max(dT, Math.abs(d.klima.sommer), Math.abs(d.klima.winter)); dW = Math.max(dW, Math.abs(d.wetter.regenQuote));
      dH = Math.max(dH, Math.abs(d.leit.huelleM[40])); dSp = Math.max(dSp, Math.abs(d.klima.spendeVerh - 1)); dWa = Math.max(dWa, Math.abs(d.wuchs.wald - 1)); dMeer = Math.max(dMeer, Math.abs(d.meer.waterLevelM));
    }
    zeile.je.push({ rKm: r, dTK: dT, dRegenQuote: dW, dLeitHoeheM: dH, dSpendeRel: dSp, dWaldRel: dWa, dMeerM: dMeer });
  }
  alle.push(zeile);
  console.log(same + ' · Anker ' + zeile.ankerBreiteGrad.toFixed(2) + '° / ' + zeile.ankerLaengeGrad.toFixed(2) + '° · Δ am Anker Null: ' + (nullOk ? 'ja' : 'NEIN') + ' · ' + zeile.je.map(j => 'r ' + j.rKm + ' km: |ΔT| ' + j.dTK.toFixed(3) + ' K, |ΔH| ' + j.dLeitHoeheM.toFixed(2) + ' m, Spende ±' + (100 * j.dSpendeRel).toFixed(1) + ' %, Wald ±' + (100 * j.dWaldRel).toFixed(1) + ' %').join(' · '));
}
const urteil = { nullAlle: alle.every(z => z.nullOk), je: ABST.map((r, i) => ({ rKm: r, dTmax: Math.max(...alle.map(z => z.je[i].dTK)), dHmax: Math.max(...alle.map(z => z.je[i].dLeitHoeheM)), dSpendeMax: Math.max(...alle.map(z => z.je[i].dSpendeRel)), dWaldMax: Math.max(...alle.map(z => z.je[i].dWaldRel)) })) };
console.log('URTEIL-DATEN ' + JSON.stringify(urteil));
require('fs').writeFileSync(path.join(__dirname, 'f-naht.json'), JSON.stringify({ kopf: L.kopf('f-naht'), og, alle, urteil }, null, 1));
