'use strict';
// Probe (b) STETIGKEIT — spike.md §b. Zwei Auswertungen an Nachbar-Adressen (1 cm und 1 m Bogen) über jede gefundene Grenze:
// Platte (platte wechselt), Scholle (scholle wechselt), Kruste (Klasse ozean/hang/schelf/kontinent wechselt), Wasser-Zelle (die
// nächste Gitter-Zelle wechselt). Gefunden durch Paare 20 km auseinander und Halbierung bis auf 1 cm. Dazu die Zeit: dieselben
// Adressen ±100 a um jedes Schlüsselbild in [−600, 0] Ma.
// Aufruf: node b-stetig.cjs [same] [querungen-je-art]
const L = require('./lib.cjs');
const { P } = L;
const same = process.argv[2] || 'erde-01', ZIEL = +(process.argv[3] || 400);
console.log(L.kopf('b-stetig') + ' · same ' + same + ' · Ziel ' + ZIEL + ' Querungen je Art');
const plan = L.planVon(same, L.erdKoerper()), S = P.planetScheibe(plan, 0), R = S.R, W = L.wasserGitter(S, 40000);
const pp = {};
function klasse(u) {
  const h = P.planetPunktR(S, u[0], u[1], u[2], 16, pp);
  let best = -1, bd = -2; W.G.um(u[0], u[1], u[2], 1.2 * W.d, (i) => { const c = u[0] * W.F[3 * i] + u[1] * W.F[3 * i + 1] + u[2] * W.F[3 * i + 2]; if (c > bd) { bd = c; best = i; } });
  return { platte: pp.platte, scholle: pp.scholle, kruste: pp.kruste, zelle: best, kueste: h > 0 };
}
const A = {}, B = {}, wa = {}, wb = {};
function werte(u, o, w) { L.adresse(S, u[0], u[1], u[2], 16, o); P.planetKlimaR(S, u[0], u[1], u[2], -1, o.k || (o.k = {})); L.wasserAt(W, u[0], u[1], u[2], w); o.q = w.qM3s; o.see = w.seeTiefeM;
  const pd = {}; const pet = 400 + 45 * Math.max(0, o.tJahrC); o.veg = Math.min(1, Math.max(0, (o.pMm / pet - 0.1) / 0.75)); return o; }
// 'kueste' (Land ↔ Meer) ist nach dem gewerteten Lauf vom 18.11. angehängt, um die Wurzel von ΔP zu trennen: die Ziehung der
// Paare ist dieselbe, die ersten 400 Querungen der vier gewerteten Klassen bleiben byte-gleich.
const ARTEN = ['platte', 'scholle', 'kruste', 'zelle', 'kueste'];
const funde = Object.fromEntries(ARTEN.map(a => [a, []]));
const rnd = L.zufall('b|' + same), u = new Float64Array(3), t = new Float64Array(3), v = new Float64Array(3), m = new Float64Array(3), lo = new Float64Array(3), hi = new Float64Array(3);
const d0 = 20 / R, cm = 1e-5 / R, meter = 1e-3 / R;
let paare = 0;
while (ARTEN.some(a => funde[a].length < ZIEL) && paare < 400000) {
  paare++;
  L.einheit(rnd, u); L.zufallsTangente(u, rnd, t); L.verschiebe(u, t, d0, v);
  const ku = klasse(u), kv = klasse(v);
  for (const art of ARTEN) {
    if (funde[art].length >= ZIEL || ku[art] === kv[art]) continue;
    // halbieren auf dem Großkreis u → v bis 1 cm
    let a = 0, b = d0; const ka = ku[art];
    while ((b - a) > cm) { const c = 0.5 * (a + b); L.verschiebe(u, t, c, m); if (klasse(m)[art] === ka) a = c; else b = c; }
    L.verschiebe(u, t, a, lo); L.verschiebe(u, t, a + cm, hi);
    werte(lo, A, wa); werte(hi, B, wb);
    const r = { hA: A.hoeheM, hB: B.hoeheM, krusteA: A.kruste, krusteB: B.kruste, randArt: A.randArt, randArtB: B.randArt, randAbstandKm: A.randAbstandKm, randAbstandKmB: B.randAbstandKm, platteA: A.platte, platteB: B.platte, breiteGrad: L.breiteGrad(lo), dh1cm: Math.abs(B.hoeheM - A.hoeheM), dT: Math.abs(B.tJahrC - A.tJahrC), dP: Math.abs(B.pMm - A.pMm), dVeg: Math.abs(B.veg - A.veg), dQ: Math.abs(B.q - A.q), q: Math.max(A.q, B.q), dSee: Math.abs(B.see - A.see), biomWechsel: A.biom !== B.biom };
    L.verschiebe(u, t, a - 0.5 * meter, lo); L.verschiebe(u, t, a + 0.5 * meter, hi);
    r.dh1m = Math.abs(P.planetPunktR(S, hi[0], hi[1], hi[2], 16) - P.planetPunktR(S, lo[0], lo[1], lo[2], 16));
    funde[art].push(r);
  }
}
const erg = {};
for (const art of ARTEN) {
  const f = funde[art], g = (k) => f.map(r => r[k]);
  erg[art] = { n: f.length, dh1cm: { max: Math.max(...g('dh1cm')), p99: L.quantil(g('dh1cm'), 0.99) }, dh1m: { max: Math.max(...g('dh1m')), p99: L.quantil(g('dh1m'), 0.99) },
    dT: Math.max(...g('dT')), dP: Math.max(...g('dP')), dVeg: Math.max(...g('dVeg')), dQrel: Math.max(...f.map(r => r.dQ / (r.q + 1e-3))), dSee: Math.max(...g('dSee')), biomWechsel: f.filter(r => r.biomWechsel).length };
  const sprung = f.filter(r => r.dh1cm > 0.01); erg[art].sprung = { n: sprung.length, land: sprung.filter(r => r.hA > 0 || r.hB > 0).length, meer: sprung.filter(r => r.hA <= 0 && r.hB <= 0).length, randArt: sprung.reduce((m, r) => (m[r.randArt] = (m[r.randArt] || 0) + 1, m), {}), krusteGleich: sprung.filter(r => r.krusteA === r.krusteB).length, krusteKante: sprung.filter(r => Math.min(r.krusteA, r.krusteB) === 0 && Math.max(r.krusteA, r.krusteB) >= 1).length, randSprungKmMedian: L.median(sprung.map(r => Math.abs(r.randAbstandKmB - r.randAbstandKm))), ohneSprungRandKmMedian: L.median(f.filter(r => r.dh1cm <= 0.01).map(r => Math.abs(r.randAbstandKmB - r.randAbstandKm))), dhMedian: L.median(sprung.map(r => r.dh1cm)), klimaOhneHoehe: f.filter(r => r.dh1cm <= 0.01 && (r.dT > 0.001 || r.dP > 0.1 || r.dVeg > 1e-4)).length, klimaOhneHoeheMaxDP: Math.max(0, ...f.filter(r => r.dh1cm <= 0.01).map(r => r.dP)), klimaOhneHoeheMaxDT: Math.max(0, ...f.filter(r => r.dh1cm <= 0.01).map(r => r.dT)) };
  console.log(art.padEnd(8) + ' n ' + String(f.length).padStart(4) + ' · |Δh| 1 cm max ' + erg[art].dh1cm.max.toExponential(2) + ' m (p99 ' + erg[art].dh1cm.p99.toExponential(2) + ') · 1 m max ' + erg[art].dh1m.max.toExponential(2) + ' m · |ΔT| ' + erg[art].dT.toExponential(2) + ' K · |ΔP| ' + erg[art].dP.toExponential(2) + ' mm/a · |ΔVeg| ' + erg[art].dVeg.toExponential(2) + ' · |ΔQ|/Q ' + erg[art].dQrel.toExponential(2) + ' · |ΔSee| ' + erg[art].dSee.toExponential(2) + ' m · Biom-Klasse wechselt ' + erg[art].biomWechsel);
}
console.log('Paare gezogen ' + paare);
// Zeit: ±100 a um jedes Schlüsselbild in [−600, 0) Ma an 2 000 Adressen (Fibonacci); Kontrolle: dasselbe Fenster mitten zwischen
// zwei Schlüsselbildern. Soll: das Schlüsselbild ist kein besonderer Zeitpunkt (Sprung ≤ 2 × Kontrolle).
const bilder = Array.from(plan.bilder).sort((a, b) => a - b), NZ = 2000;
const F = L.fib(NZ), zeit = [];
function fenster(tm) { const S0 = P.planetScheibe(plan, tm - 1e-4), S1 = P.planetScheibe(plan, tm + 1e-4); let mx = 0; for (let i = 0; i < NZ; i++) { const d = Math.abs(P.planetPunktR(S1, F[3 * i], F[3 * i + 1], F[3 * i + 2], 16) - P.planetPunktR(S0, F[3 * i], F[3 * i + 1], F[3 * i + 2], 16)); if (d > mx) mx = d; } return mx; }
for (let k = 0; k < bilder.length; k++) {
  const tb = bilder[k]; if (!(tb >= -600 && tb < 0)) continue;
  const nb = k + 1 < bilder.length ? bilder[k + 1] : 0, tm = 0.5 * (tb + Math.min(0, nb));
  const mx = fenster(tb), kt = fenster(tm);
  zeit.push({ bildMa: tb, maxDhM: mx, kontrolleMa: tm, kontrolleDhM: kt });
  console.log('Schlüsselbild ' + tb.toFixed(1) + ' Ma: max |Δh| über ±100 a an ' + NZ + ' Adressen ' + mx.toFixed(3) + ' m · Kontrolle bei ' + tm.toFixed(1) + ' Ma ' + kt.toFixed(3) + ' m');
}
const urteil = { sprung: Object.fromEntries(ARTEN.map(a => [a, erg[a].sprung])), maxDh1cm: Math.max(...ARTEN.map(a => erg[a].dh1cm.max)), maxDT: Math.max(...ARTEN.map(a => erg[a].dT)), maxDP: Math.max(...ARTEN.map(a => erg[a].dP)), maxDVeg: Math.max(...ARTEN.map(a => erg[a].dVeg)), maxDQrel: Math.max(...ARTEN.map(a => erg[a].dQrel)), maxDSee: Math.max(...ARTEN.map(a => erg[a].dSee)), zeitMaxDh: zeit.length ? Math.max(...zeit.map(z => z.maxDhM)) : NaN, zeitKontrolleMax: zeit.length ? Math.max(...zeit.map(z => z.kontrolleDhM)) : NaN, zeitBilder: zeit.length, n: Object.fromEntries(ARTEN.map(a => [a, erg[a].n])) };
console.log('URTEIL-DATEN ' + JSON.stringify(urteil));
require('fs').writeFileSync(require('path').join(__dirname, 'b-stetig.json'), JSON.stringify({ kopf: L.kopf('b-stetig'), same, erg, zeit, urteil }, null, 1));
