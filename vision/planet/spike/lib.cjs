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

// ══ STUFE S5 WASSER — das Gesetz steht im Kern (planet-core `planetWasserGitter` · `planetWasserR`, Bau-Welle 1 B3) ═════════════════
// Hier nur der Mantel der Proben: dieselben Namen, die Zeit der beiden Gänge (Zellen = Höhe + Klima je Zelle, Lauf = Flut, Seen,
// Überlauf; planetWasserGitter ist genau wasserLauf(wasserZellen(S))), und der Umkreis-Gang über den Index des Kerns (b-stetig sucht
// die nächste Zelle). N_W steht im Kern fest; DIE PET liest der Kern (planetPet).
function wasserGitter(S, NW) {
  if (NW !== P.PLANET_WASSER_N) throw new Error('wasserGitter: N_W steht im Kern fest (' + P.PLANET_WASSER_N + '), nicht ' + NW);
  const t0 = ns(), Z = P._intern.wasserZellen(S), t1 = ns(), W = P._intern.wasserLauf(Z), t2 = ns(), I = W.idx;
  const G = { um(x, y, z, r, cb) { // jede Zelle der Würfel um (x, y, z) bis r; der Leser prüft den Abstand selbst
    const K = I.K, ze = I.ze, s = Math.ceil(r / ze), a = Math.floor((x + 1) / ze) + 1, b = Math.floor((y + 1) / ze) + 1, c = Math.floor((z + 1) / ze) + 1;
    for (let dz = -s; dz <= s; dz++) for (let dy = -s; dy <= s; dy++) for (let dx = -s; dx <= s; dx++) {
      const A = a + dx, B = b + dy, C = c + dz; if (A < 0 || B < 0 || C < 0 || A >= K || B >= K || C >= K) continue;
      const k = A + K * (B + K * C); for (let e = I.kopf[k]; e < I.kopf[k + 1]; e++) cb(I.liste[e]);
    } } };
  return Object.assign({}, W, { NW: W.N, ziel: { meer: W.zielMeer, see: W.zielSee }, seen: { length: W.seeN }, G, ms: { zellen: (t1 - t0) / 1e6, fluss: (t2 - t1) / 1e6 } });
}
// Adresse → Wasser (m³/s, See-Tiefe m), stetig: der Kern
function wasserAt(W, x, y, z, aus) { return P.planetWasserR(W, x, y, z, aus); }

module.exports = { P, KERN, KERN_SHA, kopf, zufall, einheit, fib, verschiebe, zufallsTangente, bogen, breiteGrad, quantil, median, mittel, ns, planVon, erdKoerper, adresse, wasserGitter, wasserAt };
