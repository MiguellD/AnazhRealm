'use strict';
// lib.cjs — gemeinsame Werkzeuge des Spikes (vision/planet/spike.md). Reines Node, kein Spiel.
// Der Kern wird aus einem main-Baum geladen: PLANET_KERN=<pfad>/planet-core.js, sonst ../../../../AnazhRealm/planet-core.js
// (die Lage dieser Sitzung). Jede Ausgabe nennt sha256 und VERSION des geladenen Kerns.
const path = require('path');
const fs = require('fs');
const crypto = require('crypto');

const KERN = process.env.PLANET_KERN
  ? path.resolve(process.env.PLANET_KERN)
  : path.resolve(__dirname, '..', '..', '..', '..', 'AnazhRealm', 'planet-core.js');
const P = require(KERN);
const KERN_SHA = crypto.createHash('sha256').update(fs.readFileSync(KERN)).digest('hex').slice(0, 16);
function kopf(name) { return name + ' · Kern ' + path.basename(KERN) + ' sha256:' + KERN_SHA + ' · ' + P.VERSION + ' · node ' + process.version; }

// ── Zufall der Proben (nie der Welt): mulberry32, eigener Same je Probe ──
function zufall(same) {
  let a = (P.planetHash('spike|' + same)) >>> 0;
  return function () { a = (a + 0x6d2b79f5) >>> 0; let t = a; t = Math.imul(t ^ (t >>> 15), t | 1); t ^= t + Math.imul(t ^ (t >>> 7), t | 61); return ((t ^ (t >>> 14)) >>> 0) / 4294967296; };
}
function einheit(rnd, out) { // gleichverteilt auf der Kugel
  const y = 2 * rnd() - 1, ph = 2 * Math.PI * rnd(), r = Math.sqrt(1 - y * y);
  out[0] = r * Math.cos(ph); out[1] = y; out[2] = r * Math.sin(ph); return out;
}
function fib(N) { return P._intern.fib(N); }
// Punkt u um d (Bogen, rad) in Richtung der Tangente t (Einheit, ⟂ u) verschieben
function verschiebe(u, t, d, out) {
  const c = Math.cos(d), s = Math.sin(d);
  out[0] = c * u[0] + s * t[0]; out[1] = c * u[1] + s * t[1]; out[2] = c * u[2] + s * t[2];
  const l = Math.hypot(out[0], out[1], out[2]); out[0] /= l; out[1] /= l; out[2] /= l; return out;
}
function zufallsTangente(u, rnd, out) {
  const a = [rnd() - 0.5, rnd() - 0.5, rnd() - 0.5];
  const d = a[0] * u[0] + a[1] * u[1] + a[2] * u[2];
  out[0] = a[0] - d * u[0]; out[1] = a[1] - d * u[1]; out[2] = a[2] - d * u[2];
  const l = Math.hypot(out[0], out[1], out[2]); out[0] /= l; out[1] /= l; out[2] /= l; return out;
}
function bogen(a, b) { const d = a[0] * b[0] + a[1] * b[1] + a[2] * b[2]; return Math.acos(Math.max(-1, Math.min(1, d))); }
function breiteGrad(u) { return Math.atan2(u[1], Math.hypot(u[0], u[2])) * 180 / Math.PI; }

// ── Statistik ──
function sortiert(a) { return Float64Array.from(a).sort(); }
function quantil(a, q) { const b = sortiert(a); if (!b.length) return NaN; const i = (b.length - 1) * q, lo = Math.floor(i), hi = Math.ceil(i); return b[lo] + (b[hi] - b[lo]) * (i - lo); }
function median(a) { return quantil(a, 0.5); }
function mittel(a) { let s = 0; for (const v of a) s += v; return a.length ? s / a.length : NaN; }
function ns() { return Number(process.hrtime.bigint()); }

// ── Plan und Scheibe, Memo je (Same, Körper-Schlüssel, Zeit) ──
const PLAENE = new Map();
function planVon(samen, koerper) {
  const key = samen + '|' + JSON.stringify(koerper || null);
  if (!PLAENE.has(key)) PLAENE.set(key, P.planetPlan(samen, koerper));
  return PLAENE.get(key);
}
function erdKoerper(extra) { return Object.assign({}, P.PLANET_ERDE, extra || {}); }

// ── Die Kette an EINER Adresse (Stufen S2 Relief → S4 Klima → S7 Biom; S3 Meer steckt in der Scheibe) ──
const _p = {}, _k = {}, _b = {};
function adresse(S, x, y, z, fussKm, aus) {
  const o = aus || {};
  const hM = P.planetPunktR(S, x, y, z, fussKm, _p);
  P.planetKlimaR(S, x, y, z, -1, _k, _p);
  P.planetBiom(_k, hM, _b);
  o.hoeheM = hM; o.platte = _p.platte; o.scholle = _p.scholle; o.kruste = _p.kruste; o.randArt = _p.randArt; o.randAbstandKm = _p.randAbstandKm;
  o.orogen = _p.orogenStaerke; o.tJahrC = _k.tJahrC; o.tSommerC = _k.tSommerC; o.tWinterC = _k.tWinterC; o.pMm = _k.niederschlagMm;
  o.abflussMm = _k.abflussMm; o.lee = _k.lee; o.koeppen = _b.koeppen; o.biom = _b.biom; o.eis = _b.eis;
  return o;
}

// ══ STUFE S5 WASSER — der Prototyp des Gesetzes (nur im Spike) ══════════════════════════════════════════════
// Das Nicht-Lokale (Einzugsgebiet, Senke, Überlauf) wird auf EINEM festen Gitter je (Same, Zeit) gelöst — N_W Fibonacci-Zellen,
// unabhängig vom Radius; an der Adresse wird nur gelesen (Wendland-Gewichte über die Zellen im Umkreis 2·d).
// Höhe der Zelle: planetPunktR mit fussKm = d/2 (Oktaven unter d fallen weich ab). Abfluss: planetKlimaR.abflussMm (Turc-Pike im
// Kern). Lauf: Priority-Flood (Barnes et al. 2014) vom Meer aus → Empfänger je Zelle, Senken gefüllt. See: Zelle mit gefüllter
// Höhe > Höhe. Überlauf: ein See läuft über, wenn sein Zufluss Q_in ≥ (PET − P)·A_See (PET des Kerns: 400 + 45·T mm/a);
// sonst ist er ein Endsee und sein Zufluss erreicht das Meer nicht.
class Halde { // binäre Halde über (Schlüssel, Index)
  constructor(n) { this.k = new Float64Array(n); this.i = new Int32Array(n); this.n = 0; }
  push(k, i) { let j = this.n++; while (j > 0) { const p = (j - 1) >> 1; if (this.k[p] < k || (this.k[p] === k && this.i[p] < i)) break; this.k[j] = this.k[p]; this.i[j] = this.i[p]; j = p; } this.k[j] = k; this.i[j] = i; }
  pop() { const r = this.i[0], k = this.k[--this.n], i = this.i[this.n]; let j = 0; for (;;) { let c = 2 * j + 1; if (c >= this.n) break; if (c + 1 < this.n && (this.k[c + 1] < this.k[c] || (this.k[c + 1] === this.k[c] && this.i[c + 1] < this.i[c]))) c++; if (this.k[c] > k || (this.k[c] === k && this.i[c] > i)) break; this.k[j] = this.k[c]; this.i[j] = this.i[c]; j = c; } this.k[j] = k; this.i[j] = i; return r; }
}
function raster(F, N, zelle) { // Raumhash über Einheitsvektoren
  const K = Math.ceil(2 / zelle) + 3, M = new Map();
  const key = (x, y, z) => { const a = Math.floor((x + 1) / zelle) + 1, b = Math.floor((y + 1) / zelle) + 1, c = Math.floor((z + 1) / zelle) + 1; return a + K * (b + K * c); };
  for (let i = 0; i < N; i++) { const k = key(F[3 * i], F[3 * i + 1], F[3 * i + 2]); let l = M.get(k); if (!l) M.set(k, l = []); l.push(i); }
  return { K, zelle, M, key, um(x, y, z, r, cb) { const a = Math.floor((x + 1) / zelle) + 1, b = Math.floor((y + 1) / zelle) + 1, c = Math.floor((z + 1) / zelle) + 1, s = Math.ceil(r / zelle); for (let dz = -s; dz <= s; dz++) for (let dy = -s; dy <= s; dy++) for (let dx = -s; dx <= s; dx++) { const l = M.get((a + dx) + K * ((b + dy) + K * (c + dz))); if (l) for (const i of l) cb(i); } } };
}
function wasserGitter(S, NW) {
  const t0 = ns();
  const R = S.R, F = fib(NW), d = Math.sqrt(8 * Math.PI / (Math.sqrt(3) * NW)); // Gitterweite (rad), hexagonal
  const fuss = 0.5 * d * R, A = 4 * Math.PI * R * R / NW; // km, km²
  const h = new Float64Array(NW), q = new Float64Array(NW), pM = new Float64Array(NW), tJ = new Float64Array(NW);
  const pp = {}, kk = {};
  for (let i = 0; i < NW; i++) {
    const x = F[3 * i], y = F[3 * i + 1], z = F[3 * i + 2];
    h[i] = P.planetPunktR(S, x, y, z, fuss, pp);
    P.planetKlimaR(S, x, y, z, -1, kk, pp);
    q[i] = h[i] > 0 ? kk.abflussMm : 0; pM[i] = kk.niederschlagMm; tJ[i] = kk.tJahrC;
  }
  const t1 = ns();
  const G = raster(F, NW, d), nb = [], rN = 1.45 * d, cN = Math.cos(rN);
  for (let i = 0; i < NW; i++) { const l = []; G.um(F[3 * i], F[3 * i + 1], F[3 * i + 2], rN, (j) => { if (j !== i && F[3 * i] * F[3 * j] + F[3 * i + 1] * F[3 * j + 1] + F[3 * i + 2] * F[3 * j + 2] >= cN) l.push(j); }); nb.push(Int32Array.from(l)); }
  // Priority-Flood vom Meer aus
  const voll = new Float64Array(NW), emp = new Int32Array(NW).fill(-1), ord = new Int32Array(NW), gesehen = new Uint8Array(NW), H = new Halde(NW);
  let n = 0;
  for (let i = 0; i < NW; i++) if (h[i] <= 0) { voll[i] = h[i]; emp[i] = i; gesehen[i] = 1; H.push(h[i], i); }
  while (H.n) { const c = H.pop(); ord[n++] = c; for (const j of nb[c]) { if (gesehen[j]) continue; gesehen[j] = 1; voll[j] = h[j] > voll[c] ? h[j] : voll[c]; emp[j] = c; H.push(voll[j], j); } }
  // Abfluss-Summe (m³/a) und Einzugs-Fläche (km²) in umgekehrter Flut-Folge
  const acc = new Float64Array(NW), fl = new Float64Array(NW), rang = new Int32Array(NW);
  for (let k = 0; k < n; k++) rang[ord[k]] = k;
  for (let k = n - 1; k >= 0; k--) { const i = ord[k]; if (h[i] > 0) { acc[i] += q[i] / 1000 * A * 1e6; fl[i] += A; } const e = emp[i]; if (e !== i && e >= 0) { acc[e] += acc[i]; fl[e] += fl[i]; } }
  // Seen: Zusammenhangs-Komponenten der Zellen mit voll > h (nur über Land-Niveau)
  const see = new Int32Array(NW).fill(-1), seen = [];
  for (let i = 0; i < NW; i++) {
    if (see[i] >= 0 || !(voll[i] > h[i] + 1e-6) || voll[i] <= 0) continue;
    const id = seen.length, st = [i], zellen = []; see[i] = id;
    while (st.length) { const c = st.pop(); zellen.push(c); for (const j of nb[c]) if (see[j] < 0 && voll[j] > h[j] + 1e-6 && voll[j] > 0) { see[j] = id; st.push(j); } }
    let aus = -1, rMin = 1e9; for (const c of zellen) { if (!(emp[c] >= 0 && see[emp[c]] === id) && rang[c] < rMin) { rMin = rang[c]; aus = c; } }
    let pSum = 0, eSum = 0; for (const c of zellen) { pSum += pM[c]; eSum += 400 + 45 * Math.max(0, tJ[c]); }
    seen.push({ id, zellen, aus, A: zellen.length * A, pMm: pSum / zellen.length, petMm: eSum / zellen.length, endsee: false });
  }
  seen.sort((a, b) => rang[b.aus] - rang[a.aus]); // stromauf zuerst
  let endN = 0;
  for (const L of seen) {
    const qIn = acc[L.aus], verlust = Math.max(0, L.petMm - L.pMm) / 1000 * L.A * 1e6;
    if (qIn < verlust) { // Endsee: sein Zufluss erreicht das Meer nicht
      L.endsee = true; endN++;
      const a0 = acc[L.aus], f0 = fl[L.aus]; let c = emp[L.aus];
      while (c >= 0 && h[c] > 0) { acc[c] -= a0; fl[c] -= f0; if (emp[c] === c) break; c = emp[c]; }
    }
  }
  // Ziel jeder Zelle: Meer (Mündungs-Zelle) oder Endsee
  // zielMeer: die Meeres-Zelle, in die der Lauf mündet (−1: endet in einem Endsee, dann zielSee = dessen id)
  const zielMeer = new Int32Array(NW).fill(-1), zielSee = new Int32Array(NW).fill(-1), endseeVon = new Int32Array(NW).fill(-1);
  for (const L of seen) if (L.endsee) for (const c of L.zellen) endseeVon[c] = L.id;
  for (let k = 0; k < n; k++) {
    const i = ord[k];
    if (h[i] <= 0) { zielMeer[i] = i; continue; }
    if (endseeVon[i] >= 0) { zielSee[i] = endseeVon[i]; continue; }
    zielMeer[i] = zielMeer[emp[i]]; zielSee[i] = zielSee[emp[i]];
  }
  const ziel = { meer: zielMeer, see: zielSee };
  const t2 = ns();
  return { S, R, NW, F, d, A, h, q, pM, tJ, nb, voll, emp, ord, n, acc, fl, see, seen, endN, ziel, endseeVon, G, ms: { zellen: (t1 - t0) / 1e6, fluss: (t2 - t1) / 1e6 } };
}
// Adresse → Wasser: Wendland-gewichtete Abfluss-Menge (m³/s) und See-Spiegel über die Zellen im Umkreis 2·d (stetig)
function wasserAt(W, x, y, z, aus) {
  const r = 2 * W.d, cR = Math.cos(r); let sw = 0, sq = 0, ss = 0;
  W.G.um(x, y, z, r, (i) => {
    const F = W.F, c = x * F[3 * i] + y * F[3 * i + 1] + z * F[3 * i + 2]; if (c < cR) return;
    const t = Math.acos(Math.min(1, c)) / r, w = Math.pow(1 - t, 4) * (4 * t + 1);
    sw += w; sq += w * W.acc[i] / 31557600; ss += w * (W.voll[i] - W.h[i]);
  });
  const o = aus || {}; o.qM3s = sw > 0 ? sq / sw : 0; o.seeTiefeM = sw > 0 ? ss / sw : 0; o.gewicht = sw; return o;
}

module.exports = { P, KERN, KERN_SHA, kopf, zufall, einheit, fib, verschiebe, zufallsTangente, bogen, breiteGrad, quantil, median, mittel, ns, planVon, erdKoerper, adresse, wasserGitter, wasserAt, raster };
