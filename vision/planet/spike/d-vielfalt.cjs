'use strict';
// Probe (d) VIELFALT — spike.md §d. 100 Samen mit ihrem eigenen Körper (der Same wählt Radius, Schwere, Wasser, Neigung …).
//  d1 Unterscheidbar: Fingerabdruck je Planet (Land-Anteil, Hypsometrie 14 Fächer, Land je |Breite| 6 Fächer, Köppen-Hauptklassen 5,
//     Eis-Anteil, mittlere Temperatur/30 K) aus 4 000 zufälligen Adressen; Rausch-Boden = Abstand desselben Samens unter zwei
//     unabhängigen Proben-Sätzen (10 Samen × 5 Paare). Soll: jeder nächste Nachbar ≥ 3 × p99 des Rausch-Bodens.
//  d2 Zurückführbar (Gegenlauf): je Same ein Datum des Körpers getauscht, das NUR Klima trägt (neigungRad, sternFluss, tagStunden,
//     jahrTage, drehsinn) → Platte, Scholle, Kruste, Rand und Orogen an 2 000 Adressen byte-gleich, die Höhe nur um eine Konstante
//     (den Spiegel) verschoben; das Klima ändert sich. Dazu die Regression Merkmal ~ Körper-Daten über die 100 Samen.
// Aufruf: node d-vielfalt.cjs [n-samen] [adressen-je-abdruck]   (gewertet: 100 4000; die Auflösung 40000 schreibt d-vielfalt-40000.*)
const L = require('./lib.cjs');
const { P } = L;
const NS = +(process.argv[2] || 100), NP = +(process.argv[3] || 4000), SUFFIX = NP === 4000 ? '' : '-' + NP;
console.log(L.kopf('d-vielfalt') + ' · ' + NS + ' Samen welt-001 … · ' + NP + ' Adressen je Abdruck');
const o = {};
function abdruck(S, rnd) {
  const v = new Float64Array(1 + 14 + 6 + 5 + 1 + 1), u = new Float64Array(3); let land = 0, tSum = 0;
  for (let i = 0; i < NP; i++) {
    L.einheit(rnd, u); L.adresse(S, u[0], u[1], u[2], 40, o);
    const hk = o.hoeheM / 1000, b = Math.max(0, Math.min(13, Math.floor(hk + 8))); v[1 + b]++;
    tSum += o.tJahrC;
    if (o.hoeheM > 0) { land++; const ap = Math.abs(L.breiteGrad(u)); v[15 + Math.min(5, Math.floor(ap / 15))]++; const hk2 = P.planetBiom ? o.koeppen : -1; const hc = hk2 <= 2 ? 0 : (hk2 <= 6 ? 1 : (hk2 <= 15 ? 2 : (hk2 <= 27 ? 3 : 4))); v[21 + hc]++; if (o.eis) v[26]++; }
  }
  v[0] = land / NP; for (let k = 1; k < 15; k++) v[k] /= NP; for (let k = 15; k < 27; k++) v[k] = land ? v[k] / land : 0; v[27] = tSum / NP / 30;
  return v;
}
function abst(a, b) { let s = 0; for (let i = 0; i < a.length; i++) s += (a[i] - b[i]) * (a[i] - b[i]); return Math.sqrt(s); }
const samen = Array.from({ length: NS }, (_, i) => 'welt-' + String(i + 1).padStart(3, '0'));
const ab = [], koerper = [], plaene = [];
let t0 = L.ns();
for (const s of samen) {
  const plan = P.planetPlan(s), S = P.planetScheibe(plan, 0);
  ab.push(abdruck(S, L.zufall('d|' + s))); koerper.push(Object.assign({ schollen: plan.nS, ozeanPlatten: plan.nO }, plan.koerper)); plaene.push(plan);
}
console.log(NS + ' Abdrücke in ' + ((L.ns() - t0) / 1e9).toFixed(1) + ' s');
// Rausch-Boden
const rausch = [];
for (let i = 0; i < Math.min(10, NS); i++) { const S = P.planetScheibe(plaene[i], 0); for (let k = 0; k < 5; k++) rausch.push(abst(abdruck(S, L.zufall('r1|' + i + '|' + k)), abdruck(S, L.zufall('r2|' + i + '|' + k)))); }
const boden = L.quantil(rausch, 0.99);
const nn = ab.map((a, i) => { let m = Infinity, j0 = -1; ab.forEach((b, j) => { if (j !== i) { const d = abst(a, b); if (d < m) { m = d; j0 = j; } } }); return { d: m, j: j0 }; });
const nnMin = Math.min(...nn.map(x => x.d)), unter = nn.filter(x => x.d < 3 * boden).length;
console.log('d1 Rausch-Boden p99 ' + boden.toFixed(4) + ' (Median ' + L.median(rausch).toFixed(4) + ') · nächster Nachbar min ' + nnMin.toFixed(4) + ' Median ' + L.median(nn.map(x => x.d)).toFixed(4) + ' · unter 3 × Boden: ' + unter + ' von ' + NS + ' · min/Boden ' + (nnMin / boden).toFixed(2));
// d2 Gegenlauf je Klima-Datum
const DATEN = [['neigungRad', (v) => v + 0.3], ['sternFluss', (v) => v * 1.15], ['tagStunden', (v) => v * 1.7], ['jahrTage', (v) => v * 1.5], ['drehsinn', (v) => -v]];
const F = L.fib(2000), gegen = [];
for (let i = 0; i < Math.min(10, NS); i++) {
  const plan0 = plaene[i], S0 = P.planetScheibe(plan0, 0);
  for (const [name, f] of DATEN) {
    const k1 = Object.assign({}, plan0.koerper, { [name]: f(plan0.koerper[name]) }, { schollenZahl: plan0.nS, ozeanPlatten: plan0.nO });
    let plan1; try { plan1 = P.planetPlan(samen[i], k1); } catch (e) { gegen.push({ same: samen[i], name, bruch: e.message }); continue; }
    const S1 = P.planetScheibe(plan1, 0);
    let feldWechsel = 0, tMax = 0; const dh = [];
    const a = {}, b = {}, ka = {}, kb = {};
    for (let p = 0; p < 2000; p++) {
      const x = F[3 * p], y = F[3 * p + 1], z = F[3 * p + 2];
      const h0 = P.planetPunktR(S0, x, y, z, 40, a), h1 = P.planetPunktR(S1, x, y, z, 40, b);
      if (a.platte !== b.platte || a.scholle !== b.scholle || a.kruste !== b.kruste || a.randArt !== b.randArt || !Object.is(a.orogenStaerke, b.orogenStaerke) || !Object.is(a.randAbstandKm, b.randAbstandKm)) feldWechsel++;
      dh.push(h1 - h0);
      P.planetKlimaR(S0, x, y, z, -1, ka, a); P.planetKlimaR(S1, x, y, z, -1, kb, b); tMax = Math.max(tMax, Math.abs(kb.tJahrC - ka.tJahrC) + Math.abs(kb.tSommerC - ka.tSommerC) + Math.abs(kb.niederschlagMm - ka.niederschlagMm) / 100 + Math.abs(kb.windOst - ka.windOst));
    }
    const m = L.mittel(dh), sd = Math.sqrt(L.mittel(dh.map(v => (v - m) * (v - m))));
    gegen.push({ same: samen[i], name, feldWechsel, spiegelVersatzM: m, hoeheStreuungM: sd, klimaAenderung: tMax });
  }
}
const proDatum = {};
for (const g of gegen) { const p = proDatum[g.name] || (proDatum[g.name] = { n: 0, bruch: 0, feldWechsel: 0, sdMax: 0, klimaMin: Infinity }); p.n++; if (g.bruch) { p.bruch++; continue; } p.feldWechsel += g.feldWechsel; p.sdMax = Math.max(p.sdMax, g.hoeheStreuungM); p.klimaMin = Math.min(p.klimaMin, g.klimaAenderung); }
for (const [n, p] of Object.entries(proDatum)) console.log('d2 ' + n.padEnd(11) + ' Samen ' + p.n + ' · Brüche ' + p.bruch + ' · Feld-Wechsel (Platte/Scholle/Kruste/Rand/Orogen) ' + p.feldWechsel + ' von ' + (p.n - p.bruch) * 2000 + ' · Höhe nach Abzug des Spiegels: Streuung max ' + p.sdMax.toExponential(2) + ' m · Klima ändert sich min ' + p.klimaMin.toFixed(3));
// Regression Merkmal ~ Körper (OLS mit Achsenabschnitt; R²)
function ols(Y, X) { const n = Y.length, k = X[0].length + 1, A = Array.from({ length: k }, () => new Float64Array(k)), b = new Float64Array(k);
  for (let i = 0; i < n; i++) { const r = [1, ...X[i]]; for (let p = 0; p < k; p++) { b[p] += r[p] * Y[i]; for (let q = 0; q < k; q++) A[p][q] += r[p] * r[q]; } }
  for (let p = 0; p < k; p++) A[p][p] += 1e-9;
  for (let c = 0; c < k; c++) { let m = c; for (let r = c + 1; r < k; r++) if (Math.abs(A[r][c]) > Math.abs(A[m][c])) m = r; [A[c], A[m]] = [A[m], A[c]]; [b[c], b[m]] = [b[m], b[c]]; for (let r = 0; r < k; r++) if (r !== c) { const f = A[r][c] / A[c][c]; for (let q = c; q < k; q++) A[r][q] -= f * A[c][q]; b[r] -= f * b[c]; } }
  const beta = Array.from(b, (v, c) => v / A[c][c]); const my = L.mittel(Y); let ss = 0, sr = 0; for (let i = 0; i < n; i++) { const r = [1, ...X[i]]; let yh = 0; for (let p = 0; p < k; p++) yh += beta[p] * r[p]; ss += (Y[i] - my) ** 2; sr += (Y[i] - yh) ** 2; } return 1 - sr / ss; }
const K = (names) => koerper.map(k => names.map(n => k[n]));
const regr = {
  land_wasser_kruste_freibord_schelf: ols(ab.map(a => a[0]), K(['wasserKm', 'krustenAnteil', 'freibordKm', 'shelfKm', 'radiusKm'])),
  temperatur_stern_neigung_tag: ols(ab.map(a => a[27]), K(['sternFluss', 'neigungRad', 'tagStunden', 'radiusKm', 'g'])),
  eis_stern_neigung: ols(ab.map(a => a[26]), K(['sternFluss', 'neigungRad', 'tagStunden', 'radiusKm'])),
  trocken_B_alle: ols(ab.map(a => a[22]), K(['sternFluss', 'neigungRad', 'tagStunden', 'radiusKm', 'wasserKm', 'krustenAnteil', 'schollen'])),
};
for (const [k, v] of Object.entries(regr)) console.log('d2 R² ' + k + ' = ' + v.toFixed(3));
const urteil = { rauschBodenP99: boden, nnMin, unter3Boden: unter, minZuBoden: nnMin / boden, gegenlauf: proDatum, regr };
console.log('URTEIL-DATEN ' + JSON.stringify(urteil));
require('fs').writeFileSync(require('path').join(__dirname, 'd-vielfalt' + SUFFIX + '.json'), JSON.stringify({ kopf: L.kopf('d-vielfalt'), samen, koerper, abdruck: ab.map(a => Array.from(a)), nn, rausch, gegen, urteil }, null, 1));
