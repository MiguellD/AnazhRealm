#!/usr/bin/env node
// spektrum.cjs — kleine Rechnung zum Groessen-Spektrum der Kontinente (Punkt 1), ohne Kern: dieselbe Ziehung wie planetPlan
// (Schollen-Gewicht raw = 0,35 + 1,6 u², Gruppen 2–6 der Reihe nach) gegen das vorgeschlagene Gesetz (Gewicht aus einer
// gestutzten Pareto-Verteilung, Gruppen durch bevorzugtes Anlagern: eine Scholle tritt einer Gruppe mit Wahrscheinlichkeit
// proportional zu deren Flaeche bei, sonst gruendet sie eine neue — ein Yule-Prozess). Gemessen ueber 2 000 Saaten:
// Anteil der groessten Gruppe am Land, Zahl der Gruppen, Anteil der Gruppen < 5 % (die "kleinen" Kontinente/Inseln).
'use strict';
function zufall(k) { let s = k >>> 0; return () => { s = (s + 0x6d2b79f5) >>> 0; let t = s; t = Math.imul(t ^ (t >>> 15), t | 1); t ^= t + Math.imul(t ^ (t >>> 7), t | 61); return ((t ^ (t >>> 14)) >>> 0) / 4294967296; }; }
function heute(Z) {
  const nS = 20 + Math.floor(Z() * 21), raw = []; for (let s = 0; s < nS; s++) { const u = Z(); raw.push(0.35 + u * u * 1.6); }
  const G = []; let s = 0; while (s < nS) { let n = 2 + Math.floor(Z() * 5); if (nS - s - n === 1) n++; if (s + n > nS) n = nS - s; let a = 0; for (let i = 0; i < n; i++) a += raw[s + i]; G.push(a); s += n; }
  return G;
}
function neu(Z, alpha, neuP) {
  const nS = 20 + Math.floor(Z() * 21), raw = []; for (let s = 0; s < nS; s++) { const u = Z(); raw.push(Math.min(12, Math.pow(1 - u * 0.999, -1 / alpha))); }
  const G = [];
  for (let s = 0; s < nS; s++) {
    if (G.length === 0 || Z() < neuP) { G.push(raw[s]); continue; }
    const sum = G.reduce((a, b) => a + b, 0); let u = Z() * sum, g = 0; while (u > G[g]) { u -= G[g]; g++; } G[Math.min(g, G.length - 1)] += raw[s];
  }
  return G;
}
function stat(f, n) {
  const gr = [], zahl = [], klein = [], zweit = [];
  for (let k = 1; k <= n; k++) { const Z = zufall(k * 7919); const G = f(Z).sort((a, b) => b - a), sum = G.reduce((a, b) => a + b, 0); gr.push(G[0] / sum); zweit.push((G[1] || 0) / sum); zahl.push(G.length); klein.push(G.filter(g => g / sum < 0.05).length); }
  const med = (a) => { const b = [...a].sort((x, y) => x - y); return b[b.length >> 1]; };
  return { groesster: +med(gr).toFixed(3), zweiter: +med(zweit).toFixed(3), gruppen: med(zahl), kleinUnter5: med(klein) };
}
console.log(JSON.stringify({ heute: stat(heute, 2000), neu_a1_2_p0_25: stat(Z => neu(Z, 1.2, 0.25), 2000), neu_a1_5_p0_3: stat(Z => neu(Z, 1.5, 0.3), 2000), erde: { groesster: 0.57, zweiter: 0.285, gruppen: '6 Massen > 1 % (Afro-Eurasien, Amerika, Antarktis, Australien, Groenland, Neuguinea)', quelle: 'Flaechen aus dem Gedaechtnis, ungeprueft' } }));
