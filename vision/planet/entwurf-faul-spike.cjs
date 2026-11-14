// Spike "faule Simulation": Skelett (Zyklus-Kette) -> Schnitt(t) (Raster) -> Punkt (analytisch). Kein Repo-Code.
"use strict";
const zlib = require("zlib");
const fs = require("fs");

// ---------- Zufall aus dem Samen ----------
function hash32(s) { let h = 2166136261 >>> 0; for (let i = 0; i < s.length; i++) { h ^= s.charCodeAt(i); h = Math.imul(h, 16777619); } return h >>> 0; }
function rng(seed) { let a = seed >>> 0; return () => { a = (a + 0x6d2b79f5) >>> 0; let t = a; t = Math.imul(t ^ (t >>> 15), t | 1); t ^= t + Math.imul(t ^ (t >>> 7), t | 61); return ((t ^ (t >>> 14)) >>> 0) / 4294967296; }; }
function h3(ix, iy, iz, s) { let h = Math.imul(ix, 374761393) ^ Math.imul(iy, 668265263) ^ Math.imul(iz, 2147483647) ^ s; h = Math.imul(h ^ (h >>> 13), 1274126177); return ((h ^ (h >>> 16)) >>> 0) / 4294967296; }
function vnoise(x, y, z, s) {
  const ix = Math.floor(x), iy = Math.floor(y), iz = Math.floor(z);
  const fx = x - ix, fy = y - iy, fz = z - iz;
  const u = fx * fx * (3 - 2 * fx), v = fy * fy * (3 - 2 * fy), w = fz * fz * (3 - 2 * fz);
  const L = (a, b, t) => a + (b - a) * t;
  return L(L(L(h3(ix, iy, iz, s), h3(ix + 1, iy, iz, s), u), L(h3(ix, iy + 1, iz, s), h3(ix + 1, iy + 1, iz, s), u), v),
           L(L(h3(ix, iy, iz + 1, s), h3(ix + 1, iy, iz + 1, s), u), L(h3(ix, iy + 1, iz + 1, s), h3(ix + 1, iy + 1, iz + 1, s), u), v), w) * 2 - 1;
}
function fbm(x, y, z, s, okt, f0) { let a = 1, f = f0, sum = 0, n = 0; for (let o = 0; o < okt; o++) { sum += a * vnoise(x * f, y * f, z * f, s + o * 101); n += a; a *= 0.5; f *= 2; } return sum / n; }

// ---------- Quaternionen ----------
const qmul = (a, b) => [a[0]*b[0]-a[1]*b[1]-a[2]*b[2]-a[3]*b[3], a[0]*b[1]+a[1]*b[0]+a[2]*b[3]-a[3]*b[2], a[0]*b[2]-a[1]*b[3]+a[2]*b[0]+a[3]*b[1], a[0]*b[3]+a[1]*b[2]-a[2]*b[1]+a[3]*b[0]];
const qconj = (q) => [q[0], -q[1], -q[2], -q[3]];
function qaxis(ax, ang) { const n = Math.hypot(ax[0], ax[1], ax[2]) || 1, s = Math.sin(ang / 2) / n; return [Math.cos(ang / 2), ax[0]*s, ax[1]*s, ax[2]*s]; }
function qrot(q, p) { const w=q[0],x=q[1],y=q[2],z=q[3]; const tx=2*(y*p[2]-z*p[1]), ty=2*(z*p[0]-x*p[2]), tz=2*(x*p[1]-y*p[0]); return [p[0]+w*tx+(y*tz-z*ty), p[1]+w*ty+(z*tx-x*tz), p[2]+w*tz+(x*ty-y*tx)]; }
function qslerp(a, b, s) { let d = a[0]*b[0]+a[1]*b[1]+a[2]*b[2]+a[3]*b[3]; let bb = b; if (d < 0) { d = -d; bb = b.map((v) => -v); } if (d > 0.9995) { const r = a.map((v, i) => v + (bb[i] - v) * s); const n = Math.hypot(...r); return r.map((v) => v / n); } const th = Math.acos(d), sa = Math.sin((1 - s) * th) / Math.sin(th), sb = Math.sin(s * th) / Math.sin(th); return a.map((v, i) => v * sa + bb[i] * sb); }
function qbetween(u, v) { const c = [u[1]*v[2]-u[2]*v[1], u[2]*v[0]-u[0]*v[2], u[0]*v[1]-u[1]*v[0]]; const d = u[0]*v[0]+u[1]*v[1]+u[2]*v[2]; return qaxis(Math.hypot(...c) < 1e-9 ? [1,0,0] : c, Math.acos(Math.max(-1, Math.min(1, d)))); }
const dot = (a, b) => a[0]*b[0]+a[1]*b[1]+a[2]*b[2];
const norm = (a) => { const n = Math.hypot(a[0], a[1], a[2]); return [a[0]/n, a[1]/n, a[2]/n]; };
const cross = (a, b) => [a[1]*b[2]-a[2]*b[1], a[2]*b[0]-a[0]*b[2], a[0]*b[1]-a[1]*b[0]];
const randUnit = (r) => { const z = 2 * r() - 1, ph = 2 * Math.PI * r(), s = Math.sqrt(1 - z * z); return [s * Math.cos(ph), s * Math.sin(ph), z]; };

// ---------- SKELETT: die Kette der Superkontinente (Lagrange-Punkte der Kruste) ----------
const R_KM = 6371, KM_PER_RAD = R_KM;
function skelett(samen, opt = {}) {
  const r = rng(hash32(samen + ":skelett"));
  const M = opt.M || 8192, alterMa = opt.alter || 4500;
  // Fibonacci-Kugel: Kandidaten fuer Kruste
  const fib = []; const ga = Math.PI * (3 - Math.sqrt(5));
  for (let i = 0; i < M; i++) { const z = 1 - (2 * i + 1) / M, s = Math.sqrt(1 - z * z); fib.push([s * Math.cos(ga * i), s * Math.sin(ga * i), z]); }
  // Urkontinent: Kruste-Anteil aus dem Samen (Erde ~0,4), als Rausch-Kappe um einen Pol
  const anteil = 0.33 + 0.12 * r(); const c0 = randUnit(r); const s0 = hash32(samen + ":kraton");
  const sc = fib.map((p) => dot(p, c0) + 0.35 * fbm(p[0], p[1], p[2], s0, 4, 1.6));
  const sorted = sc.slice().sort((a, b) => b - a); const thr = sorted[Math.floor(anteil * M)];
  const punkte = []; for (let i = 0; i < M; i++) if (sc[i] > thr) punkte.push({ p: fib[i], oro: [-alterMa] }); // oro = Zeit der letzten Gebirgsbildung (Ma)
  // Zyklen: Laengen 300-500 Ma aus dem Samen
  const zyklen = []; let T = -alterMa;
  let welt = punkte.map((q) => q.p); // Weltlage zur Zeit T (Zusammenbau)
  let zentrum = c0;
  while (T < 0) {
    const L = 300 + 200 * r(); const T1 = T + L;
    // Zerfall: Neuschnitt entlang Rift-Staetten (Voronoi), bevorzugt an alten Naehten (oro juenger -> Schnitt-Kosten kleiner)
    const F = 5 + Math.floor(r() * 4); const sites = [];
    for (let f = 0; f < F; f++) { const pi = Math.floor(r() * welt.length); sites.push(welt[pi]); }
    const frag = welt.map((p, i) => { let best = 0, bd = -2; for (let f = 0; f < F; f++) { const d = dot(p, sites[f]) + 0.08 * (punkte[i].oro[punkte[i].oro.length - 1] > T - 600 ? 1 : 0) * h3(i, f, 7, 3); if (d > bd) { bd = d; best = f; } } return best; });
    // Fragment-Schwerpunkt, Ausbreitung (Extroversion) und Ziel des naechsten Zusammenbaus
    const zentrumNeu = randUnit(r);
    const fr = [];
    for (let f = 0; f < F; f++) {
      let c = [0, 0, 0], n = 0; for (let i = 0; i < welt.length; i++) if (frag[i] === f) { c[0] += welt[i][0]; c[1] += welt[i][1]; c[2] += welt[i][2]; n++; }
      if (!n) { fr.push(null); continue; }
      c = norm(c);
      // Mitte: von altem Zentrum weg geschoben (40-80 Grad)
      const weg = norm(cross(zentrum, c)); const qMid = qaxis(Math.hypot(...cross(zentrum, c)) < 1e-6 ? randUnit(r) : weg, (40 + 40 * r()) * Math.PI / 180);
      // Ziel: auf einer Spirale um das neue Zentrum, Abstand ~ Fragment-Groesse
      const ring = f === 0 ? 0 : (14 + 10 * Math.sqrt(f)) * Math.PI / 180; const az = f * 2.4;
      const tang = norm(cross(zentrumNeu, Math.abs(zentrumNeu[2]) < 0.9 ? [0, 0, 1] : [1, 0, 0]));
      const ziel = qrot(qaxis(zentrumNeu, az), qrot(qaxis(tang, ring), zentrumNeu));
      const cMid = qrot(qMid, c);
      const qEnd = qmul(qmul(qaxis(ziel, (r() - 0.5) * 2), qbetween(cMid, ziel)), qMid); // body(T)->welt(T1)
      fr.push({ n, c, qMid, qEnd });
    }
    const oz = []; const OZ = 3 + Math.floor(r() * 4); for (let o = 0; o < OZ; o++) { const ax = randUnit(r); const cmA = 3 + 6 * r(); oz.push({ site: randUnit(r), om: ax.map((v) => v * cmA * 10 / R_KM) }); }
    zyklen.push({ oz, T0: T, T1, tZerfall: T + 0.12 * L, tMitte: T + 0.5 * L, frag, F, fr, welt: welt.slice(), zentrum, zentrumNeu });
    // Zusammenbau bei T1: Naehte stempeln (Punkte verschiedener Fragmente benachbart) -> Gedaechtnis
    const weltNeu = welt.map((p, i) => qrot(fr[frag[i]].qEnd, p));
    const nb = Math.cos(260 / R_KM);
    // grobes Nachbar-Raster fuer die Naht-Suche
    const G = 64, eim = new Map(); const key = (p) => (Math.floor((Math.atan2(p[1], p[0]) + Math.PI) / (2 * Math.PI) * G) & (G - 1)) * 1000 + Math.min(G / 2 - 1, Math.floor(Math.acos(p[2]) / Math.PI * G / 2));
    weltNeu.forEach((p, i) => { const k = key(p); if (!eim.has(k)) eim.set(k, []); eim.get(k).push(i); });
    for (let i = 0; i < weltNeu.length; i++) {
      const k = key(weltNeu[i]); const kx = Math.floor(k / 1000), ky = k % 1000;
      for (let dx = -1; dx <= 1; dx++) for (let dy = -1; dy <= 1; dy++) { const l = eim.get(((kx + dx + G) & (G - 1)) * 1000 + ky + dy); if (!l) continue;
        for (const j of l) if (frag[j] !== frag[i] && dot(weltNeu[i], weltNeu[j]) > nb) { punkte[i].oro.push(T1); break; } }
    }
    welt = weltNeu; zentrum = zentrumNeu; T = T1;
  }
  return { samen, M, punkte, zyklen, alterMa, anteil };
}

// Lage eines Krusten-Punkts i zur Zeit t (analytisch innerhalb des Zyklus)
function zyklusAn(S, t) { for (const z of S.zyklen) if (t >= z.T0 && t < z.T1) return z; return S.zyklen[S.zyklen.length - 1]; }
const glatt = (a, b, x) => { const u = Math.max(0, Math.min(1, (x - a) / (b - a))); return u * u * (3 - 2 * u); };
function fragDreh(z, f, t) {
  const F = z.fr[f]; const I = [1, 0, 0, 0];
  if (t <= z.tZerfall) return I;
  if (t <= z.tMitte) return qslerp(I, F.qMid, glatt(z.tZerfall, z.tMitte, t) * 0 + (t - z.tZerfall) / (z.tMitte - z.tZerfall));
  return qslerp(F.qMid, F.qEnd, (t - z.tMitte) / (z.T1 - z.tMitte));
}
// Winkelgeschwindigkeit (rad/Ma) eines Fragments durch Differenz
function fragOmega(z, f, t) { const dt = 0.5; const a = fragDreh(z, f, t), b = fragDreh(z, f, t + dt); const d = qmul(b, qconj(a)); const s = Math.hypot(d[1], d[2], d[3]); if (s < 1e-12) return [0, 0, 0]; const ang = 2 * Math.atan2(s, d[0]) * (d[0] < 0 ? -1 : 1); return [d[1] / s * ang / dt, d[2] / s * ang / dt, d[3] / s * ang / dt]; }

// ---------- SCHNITT(t): das Raster W x H ----------
function schnitt(S, t, W, H) {
  const z = zyklusAn(S, t); const N = W * H;
  const kont = new Float32Array(N), plate = new Int16Array(N).fill(-1), oro = new Float32Array(N).fill(-1e9);
  const cell = new Array(N);
  for (let j = 0; j < H; j++) { const la = Math.PI / 2 - (j + 0.5) * Math.PI / H, cl = Math.cos(la), sl = Math.sin(la); for (let i = 0; i < W; i++) { const lo = -Math.PI + (i + 0.5) * 2 * Math.PI / W; cell[j * W + i] = [cl * Math.cos(lo), cl * Math.sin(lo), sl]; } }
  // Krusten-Punkte splatten (Radius ~ Punkt-Abstand)
  const Q = z.fr.map((F, f) => (F ? fragDreh(z, f, t) : null));
  const rad = Math.sqrt(4 * Math.PI / S.M) * 1.3; const pw = new Float32Array(N); const cr = Math.cos(rad);
  const cent = z.fr.map((F, f) => (F ? qrot(Q[f], F.c) : null));
  for (let k = 0; k < z.welt.length; k++) {
    const f = z.frag[k]; const p = qrot(Q[f], z.welt[k]);
    const la = Math.asin(p[2]), lo = Math.atan2(p[1], p[0]);
    const jc = Math.floor((Math.PI / 2 - la) / Math.PI * H), ic = Math.floor((lo + Math.PI) / (2 * Math.PI) * W);
    const dj = Math.ceil(rad / Math.PI * H) + 1, di = Math.min(W / 2, Math.ceil(dj / Math.max(0.05, Math.cos(la))));
    for (let jj = jc - dj; jj <= jc + dj; jj++) { if (jj < 0 || jj >= H) continue; for (let ii = ic - di; ii <= ic + di; ii++) { const c = jj * W + ((ii % W) + W) % W; const d = dot(cell[c], p); if (d > cr) { const w = (d - cr) / (1 - cr); const g = w * w * (3 - 2 * w); kont[c] = Math.min(1, kont[c] + 0.9 * g); if (g > pw[c]) { pw[c] = g; plate[c] = f; } const ol = S.punkte[k].oro; let ot = ol[0]; for (const v of ol) if (v <= t && v > ot) ot = v; if (ot > oro[c]) oro[c] = ot; } } }
  }
  // Abstandsfelder (Jump-Flooding auf dem Breiten-Laengen-Raster mit Umlauf)
  const jfa = (istQuelle) => { const src = new Int32Array(N).fill(-1); for (let c = 0; c < N; c++) if (istQuelle(c)) src[c] = c;
    for (let step = W >> 1; step >= 1; step >>= 1) { for (let j = 0; j < H; j++) for (let i = 0; i < W; i++) { const c = j * W + i; let best = src[c], bd = best >= 0 ? dot(cell[c], cell[best]) : -2;
      for (let dj = -1; dj <= 1; dj++) { const jj = j + dj * Math.min(step, H); if (jj < 0 || jj >= H) continue; for (let di = -1; di <= 1; di++) { const s = src[jj * W + (((i + di * step) % W) + W) % W]; if (s >= 0) { const d = dot(cell[c], cell[s]); if (d > bd) { bd = d; best = s; } } } } src[c] = best; } }
    return src; };
  const srcKu = jfa((c) => kont[c] > 0.5);
  // Ozean-Platten: jede Ozeanzelle faehrt mit der naechsten Kruste (Mittelachse = Ruecken)
  const ozS = z.oz.map((o) => { const a = Math.hypot(...o.om); return a < 1e-12 ? o.site : qrot(qaxis(o.om, a * (t - z.T0)), o.site); });
  for (let c = 0; c < N; c++) if (kont[c] <= 0.5 && srcKu[c] >= 0) { plate[c] = plate[srcKu[c]]; const dKuC = Math.acos(Math.min(1, dot(cell[c], cell[srcKu[c]]))) * R_KM; let bo = -1, bd = 1e9; for (let o = 0; o < ozS.length; o++) { const d = Math.acos(Math.min(1, dot(cell[c], ozS[o]))) * R_KM; if (d < bd) { bd = d; bo = o; } } if (dKuC > 500 && bd < dKuC * 1.6) plate[c] = z.F + bo; }
  const om = z.fr.map((F, f) => (F ? fragOmega(z, f, t) : [0, 0, 0])).concat(z.oz.map((o) => o.om));
  // Grenzen: relative Geschwindigkeit auf der Normalen
  const typ = new Int8Array(N), rate = new Float32Array(N); // typ 1 konvergent, 2 divergent
  for (let j = 0; j < H; j++) for (let i = 0; i < W; i++) { const c = j * W + i;
    for (const [di, dj] of [[1, 0], [0, 1]]) { const jj = j + dj; if (jj >= H) continue; const c2 = jj * W + (i + di) % W; const a = plate[c], b = plate[c2]; if (a === b) continue;
      const p = cell[c], q = cell[c2]; const va = cross(om[a], p), vb = cross(om[b], p); const n = norm([q[0] - p[0], q[1] - p[1], q[2] - p[2]]);
      const rel = dot([va[0] - vb[0], va[1] - vb[1], va[2] - vb[2]], n) * KM_PER_RAD / 10; // cm/a (km/Ma / 10)
      if (rel > 0.3) { typ[c] = typ[c2] = 1; rate[c] = rate[c2] = Math.max(rate[c], rel); } else if (rel < -0.3) { if (!typ[c]) typ[c] = 2; if (!typ[c2]) typ[c2] = 2; rate[c] = rate[c2] = Math.max(rate[c], -rel); } } }
  const srcK = jfa((c) => typ[c] === 1), srcD = jfa((c) => typ[c] === 2);
  const srcOz = jfa((c) => kont[c] <= 0.5);
  const dist = (c, s) => (s < 0 ? 2e4 : Math.acos(Math.min(1, dot(cell[c], cell[s]))) * R_KM);
  // Felder fuer den Punkt
  const F = { W, H, t, kont, dK: new Float32Array(N), kOz: new Float32Array(N), kRate: new Float32Array(N), alter: new Float32Array(N), oroA: new Float32Array(N), dKu: new Float32Array(N), dOz: new Float32Array(N) };
  const offen = Math.max(0, t - z.tZerfall);
  for (let c = 0; c < N; c++) {
    F.dK[c] = dist(c, srcK[c]); const s = srcK[c];
    // Konvergenz: kollidieren Kontinente (beide Seiten Kruste) oder taucht Ozean ab?
    F.kOz[c] = s >= 0 ? 1 - kont[s] : 0; F.kRate[c] = s >= 0 ? rate[s] : 0;
    const vh = Math.max(1, (srcD[c] >= 0 ? rate[srcD[c]] : 3)) / 2; // halbe Spreizrate cm/a = 10 km/Ma
    const aOz = dist(c, srcD[c]) / (vh * 10);
    F.alter[c] = Math.min(aOz, 180);
    F.oroA[c] = t - oro[c]; F.dKu[c] = dist(c, srcKu[c]); F.dOz[c] = dist(c, srcOz[c]);
  }
  return F;
}

// ---------- PUNKT: analytische Verfeinerung ----------
function bil(F, a, x, y) { const W = F.W, H = F.H; const fx = x * W - 0.5, fy = Math.max(0, Math.min(H - 1.001, y * H - 0.5)); const i0 = Math.floor(fx), j0 = Math.floor(fy); const u = fx - i0, v = fy - j0; const i1 = (i0 + 1 + W) % W, ii = (i0 + W) % W; const j1 = Math.min(H - 1, j0 + 1);
  return (a[j0 * W + ii] * (1 - u) + a[j0 * W + i1] * u) * (1 - v) + (a[j1 * W + ii] * (1 - u) + a[j1 * W + i1] * u) * v; }
function hoeheKm(S, F, la, lo, detailOkt) {
  const x = (lo + Math.PI) / (2 * Math.PI), y = (Math.PI / 2 - la) / Math.PI;
  const p = [Math.cos(la) * Math.cos(lo), Math.cos(la) * Math.sin(lo), Math.sin(la)];
  const s = hash32(S.samen + ":detail");
  const n = fbm(p[0], p[1], p[2], s, detailOkt, 3) ;
  // Kustenlinie: Krusten-Anteil plus Rauschen (bandbegrenzt ueber dem Raster)
  const k = bil(F, F.kont, x, y) + 0.35 * n;
  const kontinent = glatt(0.35, 0.65, k);
  const dK = bil(F, F.dK, x, y), kOz = bil(F, F.kOz, x, y), kRate = bil(F, F.kRate, x, y), alter = bil(F, F.alter, x, y), oroA = bil(F, F.oroA, x, y), dOz = bil(F, F.dOz, x, y), dKu = bil(F, F.dKu, x, y);
  const rf = Math.min(1.5, kRate / 5);
  // Ozean: Parsons-Sclater, Graben an Subduktion
  const ag = Math.max(0, alter); let oz = -(ag < 20 ? 2.6 + 0.365 * Math.sqrt(ag) : 5.651 - 2.473 * Math.exp(-0.0278 * ag));
  oz = Math.max(oz, -6.2) - 4.0 * kOz * rf * Math.exp(-((dK / 70) ** 2)) * (1 - kontinent);
  oz += -1.0 * 0 + 0.25 * n;
  // Land: Plattform + Kollision + Bogen + altes Gebirge (Abtrag exp(-alter/tau))
  let la_ = 0.25 + 0.35 * glatt(0, 800, dOz) + 0.2 * n;
  const koll = (1 - kOz) * rf * 4.2 * Math.exp(-((dK / 280) ** 2));
  const bogen = kOz * rf * 2.6 * Math.exp(-(((dK - 220) / 120) ** 2));
  const alt = 2.8 * Math.exp(-Math.max(0, oroA) / 160) * glatt(0, 1, kontinent);
  const rid = (1 - Math.abs(fbm(p[0], p[1], p[2], s + 9, detailOkt, 6))) ** 2; // Grat-Rauschen im Gebirge
  la_ += (koll + bogen + alt) * (0.55 + 0.9 * rid);
  // Schelf: Kontinentrand faellt zuerst flach (-0,15 km bis ~150 km), dann Hang
  const schelf = -0.15 - 3.5 * glatt(80, 260, dKu);
  const h = kontinent * la_ + (1 - kontinent) * Math.max(oz, kontinent > 0.02 ? schelf : oz);
  return h;
}

// ---------- Meeresspiegel aus dem Wasservolumen ----------
function meeresspiegel(hs, flaecheW, wasserKm) { let lo = -6, hi = 6; for (let it = 0; it < 50; it++) { const m = (lo + hi) / 2; let v = 0, A = 0; for (let i = 0; i < hs.length; i++) { A += flaecheW[i]; if (hs[i] < m) v += (m - hs[i]) * flaecheW[i]; } if (v / A > wasserKm) hi = m; else lo = m; } return (lo + hi) / 2; }

// ---------- Klima: Energiebilanz je Breite + Feuchte-Fege laengs des Windes ----------
function klima(S, t, hs, W, H, ml) {
  const L = 1 / (1 + 0.4 * (-t / 4570)); // junge Sonne (Gough), t in Ma vor heute negativ
  const r = rng(hash32(S.samen + ":orbit")); const eps0 = 22 + 3 * r();
  const co2 = 2.0 + 1.5 * Math.sin((t / 140) + 6.28 * r()); // Antrieb in K; Thermostat grob
  // 1D Budyko-Sellers stationaer
  const lat = new Float64Array(H), T = new Float64Array(H).fill(10);
  for (let j = 0; j < H; j++) lat[j] = Math.PI / 2 - (j + 0.5) * Math.PI / H;
  const Q = (la) => 340 * L * (1 - 0.482 * 0.5 * (3 * Math.sin(la) ** 2 - 1) * (eps0 / 23.4));
  for (let it = 0; it < 400; it++) { let Tm = 0, Wt = 0; for (let j = 0; j < H; j++) { Tm += T[j] * Math.cos(lat[j]); Wt += Math.cos(lat[j]); } Tm /= Wt;
    for (let j = 0; j < H; j++) { const alb = T[j] < -10 ? 0.62 : 0.30; const Tn = (Q(lat[j]) * (1 - alb) - 203.3 + 3.8 * 0 + co2 * 2 + 3.8 * Tm) / (2.09 + 3.8); T[j] = 0.7 * T[j] + 0.3 * Tn; } }
  const N = W * H, temp = new Float32Array(N), regen = new Float32Array(N);
  for (let j = 0; j < H; j++) {
    const ld = Math.abs(lat[j]) * 180 / Math.PI;
    // Zonen: Passat (0-30) Ost->West, Westwind (30-60) West->Ost, Polar Ost->West
    const dir = ld < 30 || ld > 60 ? -1 : 1;
    const zonal = 1.6 * Math.exp(-((ld / 9) ** 2)) + 0.12 + 0.9 * Math.exp(-(((ld - 50) / 10) ** 2)) - 0.1 * Math.exp(-(((ld - 25) / 6) ** 2));
    let q = 0.6; // Feuchte
    for (let pass = 0; pass < 2; pass++) for (let k = 0; k < W; k++) { const i = dir > 0 ? k : W - 1 - k; const c = j * W + i; const ip = (i - dir + W) % W; const h = hs[c] - ml, hp = hs[j * W + ip] - ml;
      if (h < 0) { q += (1 - q) * 0.08; regen[c] = zonal * q; continue; }
      const hub = Math.max(0, h - Math.max(0, hp)); const aus = Math.min(q, q * (0.025 + 0.9 * hub)); q -= 0.45 * aus; regen[c] = zonal * (aus * 14 + 0.6 * q); }
    for (let i = 0; i < W; i++) { const c = j * W + i; temp[c] = T[j] - 6.5 * Math.max(0, hs[c] - ml); }
  }
  return { temp, regen, Tlat: T };
}

// ---------- Biome und Farbe ----------
function farbe(h, T, P) {
  if (h < 0) { const d = Math.min(1, -h / 6); if (T < -4) return [200, 215, 230]; return [Math.round(30 - 20 * d), Math.round(90 - 60 * d), Math.round(150 - 60 * d)]; }
  if (T < -8) return [240, 244, 248];
  if (T < 0) return [150, 150, 135];
  let c;
  if (P < 0.12) c = T > 15 ? [214, 190, 140] : [185, 170, 130];
  else if (P < 0.3) c = T > 18 ? [180, 170, 90] : [150, 155, 95];
  else if (T > 20) c = P > 0.7 ? [30, 100, 40] : [80, 130, 50];
  else if (T > 8) c = [60, 120, 55];
  else c = [50, 90, 70];
  const s = Math.min(1, h / 4); return c.map((v) => Math.round(v * (1 - 0.5 * s) + 120 * 0.5 * s));
}

// ---------- PNG ----------
function png(path, w, h, rgb) { const crcT = new Int32Array(256).map((_, n) => { let c = n; for (let k = 0; k < 8; k++) c = c & 1 ? 0xedb88320 ^ (c >>> 1) : c >>> 1; return c; });
  const crc = (b) => { let c = -1; for (const x of b) c = crcT[(c ^ x) & 255] ^ (c >>> 8); return (c ^ -1) >>> 0; };
  const chunk = (typ, data) => { const l = Buffer.alloc(4); l.writeUInt32BE(data.length); const td = Buffer.concat([Buffer.from(typ), data]); const c = Buffer.alloc(4); c.writeUInt32BE(crc(td)); return Buffer.concat([l, td, c]); };
  const raw = Buffer.alloc((w * 3 + 1) * h); for (let y = 0; y < h; y++) { raw[y * (w * 3 + 1)] = 0; rgb.copy(raw, y * (w * 3 + 1) + 1, y * w * 3, (y + 1) * w * 3); }
  const ih = Buffer.alloc(13); ih.writeUInt32BE(w, 0); ih.writeUInt32BE(h, 4); ih[8] = 8; ih[9] = 2;
  fs.writeFileSync(path, Buffer.concat([Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]), chunk("IHDR", ih), chunk("IDAT", zlib.deflateSync(raw)), chunk("IEND", Buffer.alloc(0))])); }

// ---------- Lauf ----------
const samen = process.argv[2] || "anazh-realm-seed", out = process.argv[3] || ".";
const zeiten = (process.argv[4] || "0,-120,-300").split(",").map(Number);
const W = +(process.argv[5] || 512), H = W / 2;
let t0 = process.hrtime.bigint(); const S = skelett(samen); let t1 = process.hrtime.bigint();
console.log(`skelett ${samen}: ${Number(t1 - t0) / 1e6 | 0} ms, Zyklen ${S.zyklen.length}, Krustenpunkte ${S.punkte.length}/${S.M}, JSON ~${(JSON.stringify(S.zyklen.map(z => ({ T0: z.T0, T1: z.T1, fr: z.fr }))).length / 1024).toFixed(1)} KB (ohne Punkte)`);
for (const t of zeiten) {
  t0 = process.hrtime.bigint(); const F = schnitt(S, t, W, H); t1 = process.hrtime.bigint();
  const ms_schnitt = Number(t1 - t0) / 1e6;
  // Hoehen am Raster (Detail grob), Meeresspiegel, Klima
  const MW = 1024, MH = 512; const hs = new Float32Array(MW * MH), fw = new Float32Array(MW * MH);
  let tq0 = process.hrtime.bigint();
  for (let j = 0; j < MH; j++) { const la = Math.PI / 2 - (j + 0.5) * Math.PI / MH; for (let i = 0; i < MW; i++) { const lo = -Math.PI + (i + 0.5) * 2 * Math.PI / MW; hs[j * MW + i] = hoeheKm(S, F, la, lo, 6); fw[j * MW + i] = Math.cos(la); } }
  let tq1 = process.hrtime.bigint(); const usPunkt = Number(tq1 - tq0) / 1e3 / (MW * MH);
  const ml = meeresspiegel(hs, fw, +(process.env.WASSER || 3.9));
  let tk0 = process.hrtime.bigint(); const K = klima(S, t, hs, MW, MH, ml); let tk1 = process.hrtime.bigint();
  // Statistik
  let land = 0, A = 0; const hist = new Float64Array(24); for (let c = 0; c < hs.length; c++) { A += fw[c]; const hh = hs[c] - ml; if (hh > 0) land += fw[c]; const b = Math.max(0, Math.min(23, Math.floor(hh + 12))); hist[b] += fw[c]; }
  const plattenSet = new Set(); const z = zyklusAn(S, t); z.fr.forEach((f) => f && plattenSet.add(f));
  console.log(`t=${t} Ma: Schnitt ${W}x${H} ${ms_schnitt.toFixed(0)} ms | Punkt ${usPunkt.toFixed(2)} us | Klima ${(Number(tk1 - tk0) / 1e6).toFixed(0)} ms | Meer ${(ml * 1000).toFixed(0)} m | Land ${(100 * land / A).toFixed(1)} % | Platten ${plattenSet.size} | T Aequator ${K.Tlat[MH / 2].toFixed(1)} Pol ${K.Tlat[2].toFixed(1)} C`);
  console.log("  Hypsometrie (km, Flaechen-%): " + Array.from(hist).map((v, i) => `${i - 12}:${(100 * v / A).toFixed(1)}`).filter((s, i) => i >= 4 && i <= 18).join(" "));
  const rgb = Buffer.alloc(MW * MH * 3);
  for (let c = 0; c < hs.length; c++) { const i0 = c % MW, j0 = (c / MW) | 0; const hx = hs[j0 * MW + (i0 + 1) % MW] - hs[c], hy = hs[Math.min(MH - 1, j0 + 1) * MW + i0] - hs[c]; const sh = hs[c] > ml ? Math.max(0.55, Math.min(1.35, 1 + 6 * (hy - hx))) : 1; const col = farbe(hs[c] - ml, K.temp[c], K.regen[c]).map((v) => Math.min(255, Math.round(v * sh))); rgb[c * 3] = col[0]; rgb[c * 3 + 1] = col[1]; rgb[c * 3 + 2] = col[2]; }
  png(`${out}/planet-${samen}-t${-t}.png`, MW, MH, rgb);
}
