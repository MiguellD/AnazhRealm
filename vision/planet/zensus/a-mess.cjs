// Zensus PLANET (a) relief-gestein — die Mess-Probe: Höhe nah ↔ fern, Funktion oder Sack, Rausch-Periode, f32, Schlüssel-Grenzen.
// Lädt den Kern über den absoluten Pfad. Aufruf: node --expose-gc a-mess.cjs   (nur lesen, nichts schreiben)
'use strict';
const path = require('path');
const ROOT = '/home/user/AnazhRealm';
require(path.join(ROOT, 'gelaende-core.js'));
const G = globalThis.__gelaendeCore;
const RN = require(path.join(ROOT, 'vendor', 'simplex-noise.js'));
const SN = RN.SimplexNoise || RN.default || RN;

// die Lage der Heimat wie im Spiel: Saat, Basis 0, Meer Basis − 3, [wildnis] ohne Regler (alle def), Kachel 2048, Ort null
function lage(seed) {
  return G.lageAus({ seed, baseHeight: G.GRUND.basis, waterLevel: G.GRUND.basis - G.GRUND.meerUnterBasis, ort: null,
    erbgut: { terme: G.erbgutNormal(undefined), wildnis: 1 }, regionSize: G.GRUND.kachel }, SN);
}
function prng(a) { return function () { a |= 0; a = (a + 0x6d2b79f5) | 0; let t = Math.imul(a ^ (a >>> 15), 1 | a); t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t; return ((t ^ (t >>> 14)) >>> 0) / 4294967296; }; }
function adressen(n, cx, cz, halb, saat) { const r = prng(saat), A = new Float64Array(2 * n); for (let i = 0; i < n; i++) { A[2 * i] = cx + (r() * 2 - 1) * halb; A[2 * i + 1] = cz + (r() * 2 - 1) * halb; } return A; }
const gc = () => { if (global.gc) { global.gc(); global.gc(); } };
const heap = () => { gc(); return process.memoryUsage().heapUsed; };
function q(arr, p) { const s = Float64Array.from(arr).sort(); return s[Math.min(s.length - 1, Math.floor(p * s.length))]; }
function knoten(L) { const z = G.netzZaehler(L); return { knoten: z.knoten.slice(), profile: z.profilBau.slice() }; }
function lauf(L, A, name) {
  const n = A.length / 2, us = new Float64Array(n);
  const h0 = heap(), k0 = knoten(L);
  let hmin = Infinity, hmax = -Infinity, land = 0, sum = 0;
  const t0 = process.hrtime.bigint();
  for (let i = 0; i < n; i++) {
    const a = process.hrtime.bigint();
    const h = G.hoehe(L, A[2 * i], A[2 * i + 1], true);
    us[i] = Number(process.hrtime.bigint() - a) / 1000;
    if (h < hmin) hmin = h; if (h > hmax) hmax = h; if (h >= L.waterLevel) land++; sum += h;
  }
  const ges = Number(process.hrtime.bigint() - t0) / 1e6;
  const h1 = heap(), k1 = knoten(L);
  const r = { name, n, medianUs: +q(us, 0.5).toFixed(2), p95Us: +q(us, 0.95).toFixed(2), maxUs: +q(us, 1).toFixed(1), gesamtMs: +ges.toFixed(1),
    heapDeltaKB: Math.round((h1 - h0) / 1024), knotenVorher: k0.knoten, knotenNachher: k1.knoten,
    hoeheMin: +hmin.toFixed(2), hoeheMax: +hmax.toFixed(2), hoeheMittel: +(sum / n).toFixed(2), landAnteil: +(land / n).toFixed(3) };
  console.log(JSON.stringify(r));
  return r;
}

const L = lage('anazh-realm-seed');
const N = 10000;
console.log('# 1 Höhe je Adresse, einzeln gerufen (G.hoehe mit Detail), Saat anazh-realm-seed, Heimat-Lage');
const nah = adressen(N, 0, 0, 1000, 7);           // ±1 km um den Ursprung
const fern = adressen(N, 1e6, 0, 1000, 11);       // ±1 km um (1 000 km, 0)
lauf(L, nah, 'nah kalt (±1 km um 0,0)');
lauf(L, nah, 'nah warm (dieselben Adressen)');
lauf(L, fern, 'fern kalt (±1 km um 1000 km,0)');
lauf(L, fern, 'fern warm (dieselben Adressen)');

// Erster Lauf mit 10 000 gestreuten Adressen: node brach nach 31 s mit „heap out of memory" (2 044 MB) ab — darum hier in
// Wellen zu je STREU_N Adressen, je Welle Zeit, Speicher und Knoten; die Netze bleiben (der Kern räumt `N.knoten` nie).
console.log('# 2 Sack oder Funktion: Adressen gestreut über 2 000 × 2 000 km (jede in neuem Gelände), in Wellen');
const STREU_N = 100;
const welle = [];
for (let w = 0; w < 6; w++) {
  const s = lauf(L, adressen(STREU_N, 0, 0, 1e6, 23 + w), 'streu 2000 km kalt, Welle ' + (w + 1));
  welle.push({ welle: w + 1, msJeAdresseMedian: +(s.medianUs / 1000).toFixed(2), msJeAdresseP95: +(s.p95Us / 1000).toFixed(1),
    heapJeAdresseKB: Math.round(s.heapDeltaKB / STREU_N), knotenJeAdresse: s.knotenNachher.map((v, i) => Math.round((v - s.knotenVorher[i]) / STREU_N)), heapGesamtMB: Math.round(heap() / 1048576) });
}
console.log(JSON.stringify(welle));
// der Gang: eine Linie von 100 km (x 2 000 … 2 100 km, z 0), je Chunk-Kante 43,2 m eine Spalte — was bleibt je km Weg?
{
  const n = Math.round(100000 / 43.2), A = new Float64Array(2 * n);
  for (let i = 0; i < n; i++) { A[2 * i] = 2e6 + i * 43.2; A[2 * i + 1] = 0; }
  const g = lauf(L, A, 'Gang 100 km, Schritt 43,2 m');
  console.log(JSON.stringify({ gangHeapJeKmKB: Math.round(g.heapDeltaKB / 100), gangKnotenJeKm: g.knotenNachher.map((v, i) => Math.round((v - g.knotenVorher[i]) / 100)), gangMsJeKm: +(g.gesamtMs / 100).toFixed(1) }));
}
// eine frische Saat im selben Faden: eine Welle Streu, dann die Zahl der gehaltenen Netze (NETZE räumt ab 6)
const L2 = lage('zensus-zweite-saat');
const s2 = lauf(L2, adressen(STREU_N, 0, 0, 1e6, 99), 'streu 2000 km kalt, zweite Saat');
console.log(JSON.stringify({ zweiteSaatHeapJeAdresseKB: Math.round(s2.heapDeltaKB / STREU_N), heapGesamtMB: Math.round(heap() / 1048576) }));

console.log('# 3 Rausch-Periode (vendor/simplex-noise.js: perm[i & 255]) — noise2D(a, b) gegen noise2D(a + d, b + d), d = 256/√3');
const d = 256 / Math.sqrt(3);
let maxd = 0, maxv = 0; const r3 = prng(5);
for (let i = 0; i < 2000; i++) { const a = r3() * 1000 - 500, b = r3() * 1000 - 500; const v0 = L.noise.noise2D(a, b), v1 = L.noise.noise2D(a + d, b + d); maxd = Math.max(maxd, Math.abs(v0 - v1)); maxv = Math.max(maxv, Math.abs(v0)); }
let maxdx = 0; for (let i = 0; i < 2000; i++) { const a = r3() * 1000 - 500, b = r3() * 1000 - 500; maxdx = Math.max(maxdx, Math.abs(L.noise.noise2D(a, b) - L.noise.noise2D(a + d, b))); }
const okt = [['Kontinent C 1/9000', 1 / 9000], ['Kontinent C2 2,7/9000', 2.7 / 9000], ['Erosion E 1/3200', 1 / 3200], ['Erosion E2 2,3/3200', 2.3 / 3200], ['Stil 0,000192', 0.000192], ['Warp 0,00026', 0.00026],
  ['Detail 0,0263', 0.0263], ['Detail 0,059', 0.059], ['Tiefsee 0,019', 0.019], ['Höhle Wurm 0,03', 0.03], ['Höhle Halle 0,0045', 0.0045]];
console.log(JSON.stringify({ d: +d.toFixed(4), maxDiffDiagonal: maxd, maxBetrag: +maxv.toFixed(3), maxDiffNurX: +maxdx.toFixed(3),
  periodeDiagonalKm: Object.fromEntries(okt.map(([n, f]) => [n, +(d / f / 1000).toFixed(2)])) }));

console.log('# 4 f32-Auslöschung der Lage (die Boden-Vertices reisen absolut als Float32Array, voxel-worker.js:3939)');
const ulp = (x) => { const f = Math.fround(x); let lo = f, e = Math.abs(f) || 1; const b = new Float32Array(1); const u = new Uint32Array(b.buffer); b[0] = Math.abs(f); u[0] += 1; return b[0] - Math.abs(f); };
console.log(JSON.stringify(Object.fromEntries([400, 10000, 100000, 524288, 1e6, 1048576, 2e6].map((x) => [x + ' m', ulp(x)]))));

console.log('# 5 Feste Schlüssel-Grenzen (ganzzahlig gepackt) — ab wann fallen zwei Orte auf einen Schlüssel');
const ek = (cx, cz) => (cx + 32768) * 65536 + (cz + 32768);
console.log(JSON.stringify({ editKarte_0_32768_gleich_1_minus32768: ek(0, 32768) === ek(1, -32768), editKarteGrenzeM: 32768 * 43.2,
  erdbauZelleGrenzeM: 32768 * G.ERDBAU.zelleM, bahnGitterGrenzeM: 65535 * 16, grundrissGrenzeM: 32768 * 32,
  knotenGrenzeM_Ebene2_dichte1_8: Math.pow(2, 25) * (G.NETZ_KANTE[2] / 1.8), erbgutTermKlemmeM: 1e5 }));

console.log('# 6 Abgeleitete Größen');
const og = G.ortGesetz(null);
const ks = og.kuehlungKJeM;
console.log(JSON.stringify({ kuehlungKJeM: ks, stauchung_planet_sv: 0.0065 / ks, planetMeterJeWeltMeter: ks / 0.0065,
  netzKanteEbenen: G.NETZ_KANTE, flussBreite_0_16km2: G.flussBreite(0.16e6), schichtPeriodeDef: (() => { const T = 26, hc = 0.55 * T, hs = T - hc; return hs / Math.tan(35 * Math.PI / 180) + hc / Math.tan(74 * Math.PI / 180) + 0.5 * T; })() }));
