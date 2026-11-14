// gesicht-mass.cjs — Probe des Entscheiders: zwei Linsen, die den Täter beim Namen nennen (Punkt 1 des Blicks), an einem fertigen Kern.
//   land.ellipse: je Landstück ≥ 10⁶ km² die IoU mit der Ellipse gleicher Fläche-Momente (gnomonisch um den Schwerpunkt). Ellipsen-Fleck → nahe 1.
//   meer.binnen:  Meeres-Fläche, die am 55-km-Gitter NICHT am Weltmeer hängt (größte Meeres-Komponente), als Anteil der Landfläche; dazu die Zahl ≥ 10⁴ km².
// Aufruf: node gesicht-mass.cjs <pfad/kern.js | heute> [saaten]
'use strict';
const SP = 'C:/Users/micha/AnazhRealm-profiband/artifacts/profiband/auge/planet-kern/welle2/spike';
const L = require(SP + '/lib.cjs');
const arg = process.argv[2] || 'heute';
delete globalThis.__planetCore; const P = arg === 'heute' ? require(L.ORIGINAL) : require(require('path').resolve(arg));
function ellipseIoU(pix, G, gew) {
  const { W, H } = G; let cx = 0, cy = 0, cz = 0; const v = [];
  for (const p of pix) { const r = (p / W) | 0, i = p - r * W, phi = Math.PI / 2 - Math.PI * (r + 0.5) / H, lam = -Math.PI + 2 * Math.PI * (i + 0.5) / W; const x = Math.cos(phi) * Math.cos(lam), y = Math.sin(phi), z = Math.cos(phi) * Math.sin(lam); v.push([x, y, z, gew[r]]); cx += x * gew[r]; cy += y * gew[r]; cz += z * gew[r]; }
  const l = Math.hypot(cx, cy, cz); cx /= l; cy /= l; cz /= l;
  let ux = -cz, uy = 0, uz = cx; let ul = Math.hypot(ux, uy, uz); if (ul < 1e-9) { ux = 1; uz = 0; ul = 1; } ux /= ul; uz /= ul;
  const vx = cy * uz - cz * uy, vy = cz * ux - cx * uz, vz = cx * uy - cy * ux;
  // flächentreue Azimutal-Projektion (Lambert) um den Schwerpunkt: Flächen und Momente bleiben ehrlich auch bei großen Stücken
  const pts = []; let A = 0, mx = 0, my = 0;
  for (const [x, y, z, g] of v) { const d = x * cx + y * cy + z * cz, k = Math.sqrt(2 / (1 + d)); const a = k * (x * ux + y * uy + z * uz) * G.R, b = k * (x * vx + y * vy + z * vz) * G.R; pts.push([a, b, g]); A += g; mx += a * g; my += b * g; }
  mx /= A; my /= A; let sxx = 0, syy = 0, sxy = 0; for (const [a, b, g] of pts) { sxx += g * (a - mx) * (a - mx); syy += g * (b - my) * (b - my); sxy += g * (a - mx) * (b - my); }
  sxx /= A; syy /= A; sxy /= A;
  // Ellipse gleicher Momente, auf gleiche Fläche normiert: (p−m)ᵀ C⁻¹ (p−m) ≤ c, Fläche = π·c·√det C = A
  const det = sxx * syy - sxy * sxy; if (!(det > 0)) return NaN; const c = A / (Math.PI * Math.sqrt(det));
  let innen = 0; for (const [a, b, g] of pts) { const dx = a - mx, dy = b - my; if ((syy * dx * dx - 2 * sxy * dx * dy + sxx * dy * dy) / det <= c) innen += g; }
  return innen / (2 * A - innen);
}
const n = Number(process.argv[3] || 12), Z = [];
for (let i = 1; i <= n; i++) {
  const samen = 'erde-' + String(i).padStart(2, '0'), plan = L.planVon(P, samen), S = P.planetScheibe(plan, 0);
  const G = L.gitter(P, S, 720, 40), gew = L.pixKm2(G), W = G.W, H = G.H;
  const land = new Uint8Array(W * H), meer = new Uint8Array(W * H); let landA = 0;
  for (let p = 0; p < W * H; p++) { land[p] = G.h[p] > 0 ? 1 : 0; meer[p] = 1 - land[p]; if (land[p]) landA += gew[(p / W) | 0]; }
  const C = L.komponenten(land, W, H), fl = C.K.map(pix => pix.reduce((s, p) => s + gew[(p / W) | 0], 0));
  const ell = []; C.K.forEach((pix, k) => { if (fl[k] >= 1e6) { const e = ellipseIoU(pix, G, gew); if (Number.isFinite(e)) ell.push(e); } });
  const M = L.komponenten(meer, W, H), mf = M.K.map(pix => pix.reduce((s, p) => s + gew[(p / W) | 0], 0)); const gr = Math.max(...mf);
  const binnen = mf.filter(f => f < gr), binnenA = binnen.reduce((a, b) => a + b, 0);
  Z.push({ samen, ellipseMedian: L.median(ell), ellipseMax: Math.max(...ell), ellipseN: ell.length, binnenAnteilLand: binnenA / landA, binnenZahl4: binnen.filter(f => f >= 1e4).length });
  process.stderr.write(samen + ' ');
}
const sp = (k) => { const a = Z.map(z => z[k]).sort((x, y) => x - y); return [+L.median(a).toFixed(3), +a[0].toFixed(3), +a[a.length - 1].toFixed(3)]; };
console.log(JSON.stringify({ kern: arg, n, 'median|min|max': { 'land.ellipse (Median je Saat)': sp('ellipseMedian'), 'land.ellipse (Max je Saat)': sp('ellipseMax'), stueckeUeber1e6: sp('ellipseN'), 'meer.binnen (Anteil der Landfläche)': sp('binnenAnteilLand'), 'meer.binnen.zahl ≥ 1e4 km²': sp('binnenZahl4') } }));
