#!/usr/bin/env node
// kappen-bogen.cjs — kleine Rechnung zu Punkt 5: die Grenze zweier Ozean-Platten ist im Kern die Linie rho_i − d_i = rho_j − d_j
// (planet-core.js plattenWertung, Ozean-Zweig: v = rho − Winkel zur Staette). Fuer zwei Staetten im Abstand D ist das die Menge
// d_i − d_j = rho_i − rho_j: bei gleichem rho ein Grosskreis (gerade), bei ungleichem rho ein Bogen um die schwaechere Staette.
// Gerechnet: Bogen-Radius (Winkel des Kleinkreises, 90° = Grosskreis) der Grenze ueber ±2 000 km um ihre Mitte, R = 6 371 km.
'use strict';
const R = 6371;
function grenze(D, drho) { // Staetten bei (Breite 0, Laenge ±D/2); Grenze parametrisiert durch die Breite b, Laenge l loest d_i − d_j = drho
  const pts = [];
  const ang = (a, b) => Math.acos(Math.max(-1, Math.min(1, a[0] * b[0] + a[1] * b[1] + a[2] * b[2])));
  const A = [Math.cos(-D / 2), 0, Math.sin(-D / 2)], B = [Math.cos(D / 2), 0, Math.sin(D / 2)];
  for (let s = -2000; s <= 2000; s += 100) {
    const b = s / R; let lo = -D, hi = D;
    const f = (l) => { const p = [Math.cos(b) * Math.cos(l), Math.sin(b), Math.cos(b) * Math.sin(l)]; return ang(p, A) - ang(p, B) - drho; };
    for (let it = 0; it < 80; it++) { const m = 0.5 * (lo + hi); if (f(m) > 0) hi = m; else lo = m; }
    const l = 0.5 * (lo + hi); pts.push([Math.cos(b) * Math.cos(l), Math.sin(b), Math.cos(b) * Math.sin(l)]);
  }
  // Ebene durch die Punkte: n·p = c; Kleinkreis-Radius = acos(|c|)
  const m = [0, 0, 0]; for (const p of pts) for (let k = 0; k < 3; k++) m[k] += p[k] / pts.length;
  const C = [[0, 0, 0], [0, 0, 0], [0, 0, 0]]; for (const p of pts) for (let a = 0; a < 3; a++) for (let c = 0; c < 3; c++) C[a][c] += (p[a] - m[a]) * (p[c] - m[c]);
  // kleinster Eigenvektor per inverser Iteration (C + eps I)
  let v = [0.3, 0.2, 0.9];
  const solve = (M, y) => { const a = M.map((r, i) => r.map((x, j) => x + (i === j ? 1e-12 : 0))); const det = (q) => q[0][0] * (q[1][1] * q[2][2] - q[1][2] * q[2][1]) - q[0][1] * (q[1][0] * q[2][2] - q[1][2] * q[2][0]) + q[0][2] * (q[1][0] * q[2][1] - q[1][1] * q[2][0]); const d = det(a); return [0, 1, 2].map(k => det(a.map((r, i) => r.map((x, j) => (j === k ? y[i] : x)))) / d); };
  for (let it = 0; it < 30; it++) { v = solve(C, v); const l = Math.hypot(...v); v = v.map(x => x / l); }
  const c = Math.abs(v[0] * m[0] + v[1] * m[1] + v[2] * m[2]);
  return Math.acos(Math.min(1, c)) * 180 / Math.PI;
}
const aus = [];
for (const Dg of [40, 70]) for (const drho of [0, 0.05, 0.1, 0.2, 0.3]) aus.push({ abstandGrad: Dg, deltaRhoRad: drho, deltaRhoKm: Math.round(drho * R), bogenRadiusGrad: +grenze(Dg * Math.PI / 180, drho).toFixed(1) });
console.log(JSON.stringify({ hinweis: 'rho im Kern = 0,42 + 0,3·Z je Ozean-Platte (planetPlan Zeile 365): |Δrho| bis 0,3 rad', aus }));
