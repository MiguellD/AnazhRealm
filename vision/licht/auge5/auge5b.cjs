// RECHNUNG „AUGE 2" — das Licht-Gesetz mit EINEM Zustand je Sicht: L_Z = L_a (Nicht-Strahler) + L_v (Schleier, Stiles-Holladay),
// k = a / max(L_Z, L_min) (Weber-Schlüssel nach Reinhard 2002 Gl. 2, a aus der Mittags-Eichung), Kurve K1 (../rechnung2/kurve.js,
// unverändert), sRGB-OETF. Nur rechnen. Ausgabe auge3.roh.out.txt.
// Bausteine aus ../rechnung2/r1-trennung.cjs (Physik, Szenen herd/lava/gasse wörtlich übernommen; geändert und benannt: die
// Baumlinie der Lava steht auf der FERNEN Seite — in r1 lag sie hinter der Kamera; Mond, Albedo, Halm als Parameter).
"use strict";
const fs = require("fs");
const K = require("../rechnung2/kurve.js");
const out = []; const say = (s = "") => { out.push(s); console.log(s); };
const f = (v, n = 2) => (v == null || !isFinite(v) ? "—" : (+v).toFixed(n));
const sig = (v, n = 3) => (v == null || !isFinite(v) ? "—" : v === 0 ? "0" : Math.abs(v) >= 1e4 || Math.abs(v) < 1e-2 ? v.toExponential(n - 1) : +v.toPrecision(n) + "");
const ev = (a, b) => Math.log2(a / b);
const D2R = Math.PI / 180;

// ══ PHYSIK (r1 wörtlich: fachwerk `leuchtdichte`, Planck-Ort Wyman, planckFarbe mit Weiß gleicher Luma) ══
function LFC(T) { let s = 0; for (let nm = 380; nm <= 780; nm += 5) { const l = nm * 1e-9, u = nm * 1e-3 - 0.559; s += (1.1910429e-16 / l ** 5 / (Math.exp(0.014387769 / (l * T)) - 1)) * 1.019 * Math.exp(-285.4 * u * u) * 5e-9; } return 683 * s; }
const gs = (x, m, a, b) => { const t = (x - m) * (x < m ? a : b); return Math.exp(-0.5 * t * t); };
const cmf = (l) => [1.056 * gs(l, 599.8, 0.0264, 0.0323) + 0.362 * gs(l, 442.0, 0.0624, 0.0374) - 0.065 * gs(l, 501.1, 0.049, 0.0382), 0.821 * gs(l, 568.8, 0.0213, 0.0247) + 0.286 * gs(l, 530.9, 0.0613, 0.0322), 1.217 * gs(l, 437.0, 0.0845, 0.0278) + 0.681 * gs(l, 459.0, 0.0385, 0.0725)];
const pB = (nm, T) => { const l = nm * 1e-9; return 1.1910429e-16 / l ** 5 / (Math.exp(0.014387769 / (l * T)) - 1); };
const XYZ = (T) => { let X = 0, Y = 0, Z = 0; for (let l = 360; l <= 830; l++) { const b = pB(l, T), c = cmf(l); X += b * c[0]; Y += b * c[1]; Z += b * c[2]; } return [X / Y, 1, Z / Y]; };
const lin = ([X, Y, Z]) => [3.2404542 * X - 1.5371385 * Y - 0.4985314 * Z, -0.969266 * X + 1.8760108 * Y + 0.041556 * Z, 0.0556434 * X - 0.2040259 * Y + 1.0572252 * Z];
const luma = (c) => 0.2126 * c[0] + 0.7152 * c[1] + 0.0722 * c[2];
const PF = new Map();
const planckFarbe = (T) => { T = Math.round(T); if (PF.has(T)) return PF.get(T); let c = lin(XYZ(T)); const m = Math.min(...c); if (m < 0) { const t = -m / (1 - m); c = c.map((v) => v * (1 - t) + t); } const y = luma(c); c = c.map((v) => v / y); PF.set(T, c); return c; };
const LF = new Map(); const LFCm = (T) => { T = Math.round(T); if (!LF.has(T)) LF.set(T, LFC(T)); return LF.get(T); };

// skotopisch: V'(λ) CIE 1951 und V(λ) CIE 1924 in 10 nm (Tafelwerte), S/P eines Planck-Strahlers (Prüfung: CIE A 2 856 K → 1,41)
const VS = [0.0093, 0.0348, 0.0966, 0.1998, 0.3281, 0.455, 0.567, 0.676, 0.793, 0.904, 0.982, 0.997, 0.935, 0.811, 0.65, 0.481, 0.3288, 0.2076, 0.1212, 0.0655, 0.03315, 0.01593, 0.00737, 0.003335, 0.001497, 0.000677, 0.0003129, 0.000148, 0.0000715, 0.00003533, 0.0000178];
const VP = [0.0004, 0.0012, 0.004, 0.0116, 0.023, 0.038, 0.06, 0.091, 0.139, 0.208, 0.323, 0.503, 0.71, 0.862, 0.954, 0.995, 0.995, 0.952, 0.87, 0.757, 0.631, 0.503, 0.381, 0.265, 0.175, 0.107, 0.061, 0.032, 0.017, 0.0082, 0.0041];
function SP(T) { let s = 0, p = 0; for (let i = 0; i < VS.length; i++) { const b = pB(400 + 10 * i, T); s += b * VS[i]; p += b * VP[i]; } return (1700 * s) / (683 * p); }

// ══ DATEN (r1; Parameter für die Empfindlichkeit) ══
const SP_D = SP(1850), SP_M = SP(4100), SP_H = SP(12000);
const ATMO0 = [0.1003, 0.1385, 0.0449], LAUB = [0.0906, 0.2034, 0.0447], HAUS = [0.2758, 0.1316, 0.0889], FELS = [0.2641, 0.2377, 0.1761], EISEN = [0.05, 0.05, 0.05];
const HALM = { quer: 0.89, hoch: 0.34 };
const MOND_H = (74.2 * Math.PI) / 180;
const P = { mondE: 0.3965, albedo: 1, halm: 1, tGlut: 1100, laubMond: 0.5 }; // halm: Faktor auf die Mond-Bestrahlung des Halms; laubMond: Anteil E⊥ am Laub
let ATMO, MOND_E, MOND_EH, L_HIMMEL, EmHalm, EwWiese;
function setze(p = {}) { Object.assign(P, { mondE: 0.3965, albedo: 1, halm: 1, tGlut: 1100, laubMond: 0.5 }, p);
  ATMO = ATMO0.map((v) => v * P.albedo); MOND_E = P.mondE; MOND_EH = MOND_E * Math.sin(MOND_H);
  L_HIMMEL = 6.8e-3 * (MOND_E / 0.3965); // der mondhelle Himmel folgt dem Mond (U, ±1 mag)
  EmHalm = P.halm * MOND_E * (Math.sin(MOND_H) * HALM.hoch + Math.cos(MOND_H) * (2 / Math.PI) * HALM.quer); // Herd-Szene (r1)
  EwWiese = P.halm * MOND_E * (Math.sin(MOND_H) * HALM.hoch + 0.3 * (2 / Math.PI) * HALM.quer); } // Wiese (r1/spike: 0,3 gewählt)
setze();
const C_MOND = planckFarbe(4100), C_HIMMEL = planckFarbe(12000), C_FEUER = planckFarbe(2000), C_DOCHT = planckFarbe(1850), C_SONNE = planckFarbe(5772);
const I_HERD = 0.0012 * LFCm(2000) * Math.PI * 0.38 * 0.38, K2_HERD = 0.38 * 0.38, Q_HERD = [0, 0.35, 0];
const BETT_R = 0.38, RING_I = 0.58, RING_A = 0.69, RING_H = 0.13, FLAMME_R = 0.05, FLAMME_Y = [0.2, 0.45], L_FLAMME = 10000;
const DOCHT_I = 1, DOCHT_K2 = 0.02 * 0.02, KOPF = [0.17 / 0.02, 0.17 / 0.02, (0.22 + 0.04) / 2 / 0.02, (-0.17 + 0.03) / 0.02];
function kopfSicht(kopf, a, h) { const st = h / Math.max(1e-4, a); return Math.max(0, Math.min(1, (Math.min(1, kopf[1] - kopf[0] * st) - Math.max(-1, kopf[3] - kopf[2] * st)) / 2)); }
const LK = { sigma: 0.25, offen: 0.17, platte: 0.62, rand: [0.5, 1] }, TD = 798, LAVA_R = 7.51, EPS_LAVA = 0.95;
let T0 = 1650; // tSchmelz 1 500 (schmiede-core) + Überhitzung 150 (gelaende-core LAVA) — Spiel-Daten
function lavaLeucht(w) { let s = 0, g = 0, sc = [0, 0, 0]; for (let i = 0; i < 128; i++) { const n = ((i + 0.5) / 128) * 4 * LK.sigma, p = Math.exp(-0.5 * (n / LK.sigma) ** 2), e = Math.min(1, n / Math.max(1e-9, w * LK.offen)), riss = 1 - e * e * (3 - 2 * e);
  const Ts = TD + w * (LK.platte + (1 - LK.platte) * riss) * (T0 - TD); const L = LFCm(Ts) * EPS_LAVA; s += p * L; g += p; const c = planckFarbe(Ts); sc = sc.map((v, j) => v + p * L * c[j]); } return { L: s / g, farbe: sc.map((v) => v / s) }; }

// ══ KAMERA (KAM_FOV_GRAD 75° vertikal, stamm/koerper-fahrt.js:3251; Seitenverhältnis innerWidth/innerHeight, dirigent-ankunft.js:468 → 16:9) ══
const TANH = Math.tan((37.5 * Math.PI) / 180), ASP = 16 / 9;
const sub = (a, b) => [a[0] - b[0], a[1] - b[1], a[2] - b[2]], dot = (a, b) => a[0] * b[0] + a[1] * b[1] + a[2] * b[2], len = (a) => Math.sqrt(dot(a, a)), norm = (a) => { const l = len(a); return [a[0] / l, a[1] / l, a[2] / l]; }, cross = (a, b) => [a[1] * b[2] - a[2] * b[1], a[2] * b[0] - a[0] * b[2], a[0] * b[1] - a[1] * b[0]];
function kamera(auge, ziel) { const fw = norm(sub(ziel, auge)), re = norm(cross(fw, [0, 1, 0])), up = cross(re, fw); return { o: auge, fw, re, up }; }
function gier(auge, ziel, grad) { const v = sub(ziel, auge), c = Math.cos(grad * D2R), s = Math.sin(grad * D2R); return kamera(auge, [auge[0] + c * v[0] + s * v[2], ziel[1], auge[2] - s * v[0] + c * v[2]]); }
function nick(auge, ziel, grad) { const v = norm(sub(ziel, auge)), h = Math.hypot(v[0], v[2]), el = Math.atan2(v[1], h) + grad * D2R; return kamera(auge, [auge[0] + (v[0] / h) * Math.cos(el), auge[1] + Math.sin(el), auge[2] + (v[2] / h) * Math.cos(el)]); }
function bildLage(K_, p) { const v = sub(p, K_.o), z = dot(v, K_.fw); if (z <= 0.05) return null; return { x: dot(v, K_.re) / z, y: dot(v, K_.up) / z, z }; }
const imBild = (K_, p) => { const b = bildLage(K_, p); return !!b && Math.abs(b.x) <= TANH * ASP && Math.abs(b.y) <= TANH; };
const winkel = (K_, p) => Math.acos(Math.max(-1, Math.min(1, dot(norm(sub(p, K_.o)), K_.fw)))) / D2R;

// geometrische Helfer (r1)
function zyl(o, d, cx, cz, r, y0, y1) { const ox = o[0] - cx, oz = o[2] - cz, a = d[0] * d[0] + d[2] * d[2], b = 2 * (ox * d[0] + oz * d[2]), c = ox * ox + oz * oz - r * r, D = b * b - 4 * a * c; if (D < 0 || a < 1e-12) return Infinity; const s = Math.sqrt(D);
  let t = (-b - s) / (2 * a); if (t > 1e-6) { const y = o[1] + t * d[1]; if (y >= y0 && y <= y1) return t; } t = (-b + s) / (2 * a); if (t > 1e-6) { const y = o[1] + t * d[1]; if (y >= y0 && y <= y1) return t; } return Infinity; }
function ebene(o, d, y) { if (Math.abs(d[1]) < 1e-12) return Infinity; const t = (y - o[1]) / d[1]; return t > 1e-6 ? t : Infinity; }
function kiste(o, d, b0, b1) { let tn = -Infinity, tf = Infinity; for (let i = 0; i < 3; i++) { if (Math.abs(d[i]) < 1e-12) { if (o[i] < b0[i] || o[i] > b1[i]) return Infinity; continue; } let t1 = (b0[i] - o[i]) / d[i], t2 = (b1[i] - o[i]) / d[i]; if (t1 > t2) [t1, t2] = [t2, t1]; if (t1 > tn) tn = t1; if (t2 < tf) tf = t2; } return tn <= tf && tn > 1e-6 ? tn : Infinity; }
const himmel = () => ({ typ: "himmel", L: C_HIMMEL.map((c) => c * L_HIMMEL), n: "Himmel" });

// ══ SZENEN. treffe(o, d) → { typ: himmel|diffus|quelle, L (cd/m², rgb), n, bit (Strahler-Bit = typ quelle) };
//    stuecke(auge) → die Strahler als Punkte/Flächenstücke mit ihrer Beleuchtungsstärke am Auge senkrecht zur Richtung (lx);
//    huelle: Weltpunkte der Strahler (für das feine Raster des Pixel-Wegs) ══
function herdSzene() {
  const T_GLUT = P.tGlut, L_GLUT = 0.9 * LFCm(T_GLUT), C_GLUT = planckFarbe(T_GLUT);
  const Eq = (p) => { const v = sub(Q_HERD, p), d2 = dot(v, v); return { F: I_HERD / (d2 + K2_HERD), l: v.map((x) => x / Math.sqrt(d2)) }; };
  const diff = (rho, Ef, Em, n) => { const hh = Math.PI * L_HIMMEL * 0.5; return { typ: "diffus", L: [0, 1, 2].map((j) => (rho[j] * (C_FEUER[j] * Ef + C_MOND[j] * Em + C_HIMMEL[j] * hh)) / Math.PI), n }; };
  const MOND_DIR = [Math.cos(MOND_H), Math.sin(MOND_H), 0];
  return {
    name: "herd", L_GLUT,
    treffe(o, d) {
      let t = Infinity, was = null;
      const tf = zyl(o, d, 0, 0, FLAMME_R, FLAMME_Y[0], FLAMME_Y[1]); if (tf < t) { t = tf; was = "flamme"; }
      const ta = zyl(o, d, 0, 0, RING_A, 0, RING_H); if (ta < t) { t = ta; was = "ring-aussen"; }
      const ti = zyl(o, d, 0, 0, RING_I, 0, RING_H); if (ti < t) { t = ti; was = "ring-innen"; }
      const tt = ebene(o, d, RING_H); if (tt < t) { const px_ = o[0] + tt * d[0], pz_ = o[2] + tt * d[2], r = Math.hypot(px_, pz_); if (r >= RING_I && r <= RING_A) { t = tt; was = "ring-oben"; } }
      const tg = ebene(o, d, 0); if (tg < t) { t = tg; was = "boden"; }
      if (t === Infinity || t > 5000) return { ...himmel(), bit: false };
      const p = [o[0] + t * d[0], o[1] + t * d[1], o[2] + t * d[2]], r = Math.hypot(p[0], p[2]);
      let h;
      if (was === "flamme") h = { typ: "quelle", L: C_FEUER.map((c) => c * L_FLAMME), n: "Flamme" };
      else if (was === "boden" && r <= BETT_R) { const e = Eq(p); h = { typ: "quelle", L: [0, 1, 2].map((j) => C_GLUT[j] * L_GLUT + (0.05 * C_FEUER[j] * e.F * e.l[1]) / Math.PI), n: "Glutbett" }; }
      else if (was === "boden" && r < RING_I) { const e = Eq(p); h = diff(ATMO, e.F * Math.max(0, e.l[1]), MOND_EH, "Asche im Ring"); }
      else if (was === "boden") { const v0 = -p[0], v1 = 0.15, v2 = -p[2], d2 = v0 * v0 + v1 * v1 + v2 * v2, F = I_HERD / (d2 + K2_HERD), dd = Math.sqrt(d2);
        const Ef0 = (Math.hypot(v0, v2) / dd) * F * (2 / Math.PI) * HALM.quer + (v1 / dd) * F * HALM.hoch;
        const ymin = 0.35 - (0.35 - RING_H) * (r / RING_A), lit = Math.max(0, Math.min(1, (0.2 - ymin) / 0.2));
        h = diff(ATMO, Ef0 * lit, EmHalm, "Gras"); h.r = r; }
      else { const n = was === "ring-aussen" ? norm([p[0], 0, p[2]]) : was === "ring-innen" ? norm([-p[0], 0, -p[2]]) : [0, 1, 0];
        const e = Eq(p); h = diff(FELS, e.F * Math.max(0, dot(n, e.l)), MOND_E * Math.max(0, dot(n, MOND_DIR)), was === "ring-innen" ? "Ring innen" : was === "ring-oben" ? "Ring oben" : "Ring außen"); }
      h.p = p; h.bit = h.typ === "quelle"; return h;
    },
    // die Flamme als Punkt mit der Candela des Datums (I 248,6 cd im Licht-Ort 0,35 m); das Bett als Lambert-Scheibe in Stücken (r, φ)
    stuecke(auge) { const S = []; const v = sub(Q_HERD, auge); S.push({ p: Q_HERD, En: I_HERD / dot(v, v), wer: "Flamme" });
      const nr = 40, nphi = 96; for (let i = 0; i < nr; i++) { const r0 = (i / nr) * BETT_R, r1 = ((i + 1) / nr) * BETT_R, rm = 0.5 * (r0 + r1), dA = (Math.PI * (r1 * r1 - r0 * r0)) / nphi;
        for (let j = 0; j < nphi; j++) { const ph = ((j + 0.5) / nphi) * 2 * Math.PI, p = [rm * Math.cos(ph), 0, rm * Math.sin(ph)], w = sub(auge, p), d2 = dot(w, w), ca = w[1] / Math.sqrt(d2); if (ca > 0) S.push({ p, En: (L_GLUT * ca * dA) / d2, wer: "Glutbett" }); } }
      return S; },
    huelle: (() => { const H = []; for (let a = 0; a < 16; a++) { const c = Math.cos((a * Math.PI) / 8), s = Math.sin((a * Math.PI) / 8); H.push([BETT_R * c, 0, BETT_R * s], [FLAMME_R * c, FLAMME_Y[1], FLAMME_R * s]); } return H; })(),
  };
}
const LAVA_TAB = (() => {
  const R = LAVA_R; const L = lavaLeucht(1).L;
  const F = (D, h) => { let Fx = 0, Fy = 0; const psiM = D > R ? Math.asin(R / D) : Math.PI / 2, n = 4000, dp = (2 * psiM) / n;
    const G1 = (r) => -1 / (2 * (r * r + h * h)), G2 = (r) => Math.atan(r / h) / (2 * h) - r / (2 * (r * r + h * h));
    for (let i = 0; i < n; i++) { const ps = -psiM + (i + 0.5) * dp, c = Math.cos(ps), sn = Math.sin(ps), w = Math.sqrt(Math.max(0, R * R - D * D * sn * sn)); const r1 = Math.max(0, D * c - w), r2 = D * c + w; if (r2 <= r1) continue;
      Fx += L * h * c * (G2(r2) - G2(r1)) * dp; Fy += L * h * h * (G1(r2) - G1(r1)) * dp; }
    return { zurMitte: Fx, ab: Fy }; };
  const tab = []; for (let s = 0; s <= 30.001; s += 0.05) { const q = F(R + s, 0.2); tab.push({ s, halm: q.zurMitte * (2 / Math.PI) * HALM.quer + q.ab * HALM.hoch }); }
  let wand = 0; for (let y = 0.25; y <= 6; y += 0.5) { const q = F(R + 20, y); wand += q.zurMitte / 12; }
  return { tab, wand };
})();
const lavaTab = (s) => { const i = Math.max(0, Math.min(LAVA_TAB.tab.length - 2, Math.floor(s / 0.05))), u = Math.max(0, Math.min(1, s / 0.05 - i)); const a = LAVA_TAB.tab[i], b = LAVA_TAB.tab[i + 1]; return a.halm + u * (b.halm - a.halm); };
function hash2(x, z) { const s = Math.sin(x * 127.1 + z * 311.7) * 43758.5453; return s - Math.floor(s); }
function feldN(x, z) { const u = x / 1.4, v = z / 1.4, i = Math.floor(u), j = Math.floor(v), fu = u - i, fv = v - j, sm = (t) => t * t * (3 - 2 * t);
  const a = hash2(i, j), b = hash2(i + 1, j), c = hash2(i, j + 1), e = hash2(i + 1, j + 1); const w = a + (b - a) * sm(fu) + (c - a) * sm(fv) + (a - b - c + e) * sm(fu) * sm(fv); return ((w - 0.5) * 0.25) / 0.2; }
function lavaPunkt(x, z) { // die Leuchtdichte der Decke am Punkt (Spiel-Gesetz `_lavaLeucht`/`_lavaKruste` nach r1)
  const r = Math.hypot(x, z), m = Math.min(1, (LAVA_R - r) / 1.0), q = Math.max(0, Math.min(1, (m - LK.rand[0]) / (LK.rand[1] - LK.rand[0]))), rand = q * q * (3 - 2 * q);
  const n = Math.abs(feldN(x, z)), e = Math.min(1, n / Math.max(1e-9, LK.offen * rand)), riss = rand > 0 ? 1 - e * e * (3 - 2 * e) : 0;
  const Ts = TD + (rand * LK.platte + (1 - rand * LK.platte) * riss) * (T0 - TD), Ls = Ts > TD + 1 ? EPS_LAVA * LFCm(Ts) : 0;
  return { Ts, Ls, c: planckFarbe(Math.max(1000, Ts)), n: riss > 0.5 ? "Lava Riss" : rand > 0 ? "Lava Scholle" : "Lava Saum (kalter Rand)" }; }
function lavaSzene() {
  const LAVA = lavaLeucht(1), C_L = LAVA.farbe;
  return {
    name: "lava", LAVA,
    treffe(o, d) {
      let t = Infinity, was = null;
      // Baumlinie 20 m hinter dem FERNEN Rand (x = −(R + 20)), der Decke zugewandt; r1 setzte sie bei x = +(R + 20), hinter die Kamera
      const tw = d[0] < -1e-9 ? (-(LAVA_R + 20) - o[0]) / d[0] : Infinity; if (tw > 0 && tw < t) { const y = o[1] + tw * d[1]; if (y >= 0 && y <= 6) { t = tw; was = "laub"; } }
      const tg = ebene(o, d, 0); if (tg < t) { t = tg; was = "boden"; }
      if (t === Infinity) return { ...himmel(), bit: false };
      const p = [o[0] + t * d[0], o[1] + t * d[1], o[2] + t * d[2]], r = Math.hypot(p[0], p[2]); let h;
      if (was === "boden" && r <= LAVA_R) { const q = lavaPunkt(p[0], p[2]); h = { typ: "quelle", L: q.c.map((x) => x * q.Ls + (FELS[0] * MOND_EH) / Math.PI), n: q.n }; }
      else if (was === "boden") { const s = r - LAVA_R, E = lavaTab(s); h = { typ: "diffus", L: [0, 1, 2].map((j) => (ATMO[j] * (C_L[j] * E + C_MOND[j] * EmHalm)) / Math.PI), n: "Ufer" }; h.r = s; }
      else h = { typ: "diffus", L: [0, 1, 2].map((j) => (LAUB[j] * (C_L[j] * LAVA_TAB.wand + C_MOND[j] * MOND_E * 0.3)) / Math.PI), n: "Baumlinie 20 m" };
      h.p = p; h.bit = h.typ === "quelle"; return h;
    },
    stuecke(auge) { const S = []; const dr = 0.05; for (let r0 = 0; r0 < LAVA_R; r0 += dr) { const rm = Math.min(LAVA_R, r0 + dr / 2), nphi = Math.max(12, Math.round((2 * Math.PI * rm) / dr)), dA = (Math.PI * ((Math.min(LAVA_R, r0 + dr)) ** 2 - r0 * r0)) / nphi;
        for (let j = 0; j < nphi; j++) { const ph = ((j + 0.5) / nphi) * 2 * Math.PI, x = rm * Math.cos(ph), z = rm * Math.sin(ph), q = lavaPunkt(x, z); if (!(q.Ls > 0)) continue; const p = [x, 0, z], w = sub(auge, p), d2 = dot(w, w), ca = w[1] / Math.sqrt(d2); S.push({ p, En: (q.Ls * ca * dA) / d2, wer: "Decke" }); } }
      return S; },
    huelle: (() => { const H = []; for (let a = 0; a < 64; a++) H.push([LAVA_R * Math.cos((a * Math.PI) / 32), 0, LAVA_R * Math.sin((a * Math.PI) / 32)]); return H; })(),
  };
}
const LAT = [[0.4, 2.8, 0], [0.4, 2.8, 10]], GLAS_A = 0.22 * 0.34, L_GLAS = DOCHT_I / GLAS_A, L_FENSTER = (0.8 * 0.5 * (DOCHT_I / 4)) / Math.PI;
const fensterAn = (x, y, z) => { if (y < 1.2 || y > 2.4) return false; const zz = x < 3 ? z - 4 : z - 2; const m = ((zz % 4) + 4) % 4; return m < 0.8 && z > -20; };
function gasseSzene() {
  const MOND_GASSE = [-Math.cos(MOND_H), Math.sin(MOND_H), 0];
  const Elat = (p, n) => { let E = 0; for (const q of LAT) { const v = sub(q, p), d2 = dot(v, v), dd = Math.sqrt(d2), a = Math.hypot(p[0] - q[0], p[2] - q[2]), hh = p[1] - q[1]; const ks = kopfSicht(KOPF, a, hh); E += ((DOCHT_I * ks) / (d2 + DOCHT_K2)) * (n ? Math.max(0, dot(n, v) / dd) : 1); } return E; };
  const Ew6 = MOND_E * Math.max(0, dot([-1, 0, 0], MOND_GASSE)); const amb0 = Math.PI * L_HIMMEL * 0.25 + 0.16 * Ew6 * 0.3, ambB = Math.PI * L_HIMMEL * 0.35 + 0.16 * Ew6 * 0.2;
  const diff = (rho, El, Em, n) => ({ typ: "diffus", L: [0, 1, 2].map((j) => (rho[j] * (C_DOCHT[j] * El + C_MOND[j] * Em)) / Math.PI), n,
    Ls: (luma(rho.map((r, j) => r * C_DOCHT[j])) * El * SP_D + luma(rho.map((r, j) => r * C_MOND[j])) * Em * SP_M) / Math.PI }); // skotopisch: S/P je Licht (Reflexions-Spektrum ohne)
  return {
    name: "gasse", Elat,
    treffe(o, d) {
      let t = Infinity, was = null;
      for (let i = 0; i < LAT.length; i++) { const q = LAT[i]; const tg = kiste(o, d, [q[0] - 0.11, q[1] - 0.17, q[2] - 0.11], [q[0] + 0.11, q[1] + 0.17, q[2] + 0.11]); if (tg < t) { t = tg; was = "glas"; }
        const th = kiste(o, d, [q[0] - 0.17, q[1] + 0.17, q[2] - 0.17], [q[0] + 0.17, q[1] + 0.25, q[2] + 0.17]); if (th < t) { t = th; was = "haube"; }
        const tb = kiste(o, d, [q[0] - 0.13, q[1] - 0.2, q[2] - 0.13], [q[0] + 0.13, q[1] - 0.17, q[2] + 0.13]); if (tb < t) { t = tb; was = "kopfboden"; } }
      if (d[0] < -1e-9) { const tw = (0 - o[0]) / d[0]; if (tw > 0 && tw < t && o[1] + tw * d[1] <= 8) { t = tw; was = "wand0"; } }
      if (d[0] > 1e-9) { const tw = (6 - o[0]) / d[0]; if (tw > 0 && tw < t && o[1] + tw * d[1] <= 8) { t = tw; was = "wand6"; } }
      const tg = ebene(o, d, 0); if (tg < t) { t = tg; was = "pflaster"; }
      if (t === Infinity) { const hh = himmel(); return { ...hh, Ls: luma(hh.L) * SP_H, bit: false }; }
      const p = [o[0] + t * d[0], o[1] + t * d[1], o[2] + t * d[2]]; let h;
      if (was === "glas") h = { typ: "quelle", L: C_DOCHT.map((c) => c * L_GLAS), n: "Kopf-Glas" };
      else if (was === "haube" || was === "kopfboden") { const n = was === "haube" ? [0, 1, 0] : [0, -1, 0]; h = diff(EISEN, Elat(p, n), MOND_E * Math.max(0, dot(n, MOND_GASSE)), was === "haube" ? "Haube" : "Kopf-Boden"); }
      else if (was === "wand0") { if (fensterAn(0, p[1], p[2])) h = { typ: "quelle", L: C_DOCHT.map((c) => c * L_FENSTER), n: "Fenster" }; else h = diff(HAUS, Elat(p, [1, 0, 0]), amb0, "Wand (Laternen-Seite, Mondschatten)"); }
      else if (was === "wand6") { if (fensterAn(6, p[1], p[2])) h = { typ: "quelle", L: C_DOCHT.map((c) => c * L_FENSTER), n: "Fenster" }; else h = diff(HAUS, Elat(p, [-1, 0, 0]), Ew6 + amb0, "Mondwand"); }
      else { const imSchatten = p[0] < 8 / Math.tan(MOND_H); h = diff(FELS, Elat(p, [0, 1, 0]), imSchatten ? ambB : MOND_EH + ambB, imSchatten ? "Pflaster im Mondschatten" : "Pflaster im Mond"); }
      h.p = p; h.bit = h.typ === "quelle"; return h;
    },
    stuecke(auge) { const S = [];
      for (const q of LAT) { const v = sub(auge, q), d2 = dot(v, v), a = Math.hypot(v[0], v[2]), hh = v[1]; S.push({ p: q, En: (DOCHT_I * kopfSicht(KOPF, a, hh)) / d2, wer: "Laterne" }); }
      for (const [x, n] of [[0, [1, 0, 0]], [6, [-1, 0, 0]]]) for (let z0 = -20; z0 < 40; z0 += 0.1) for (let y0 = 1.2; y0 < 2.4; y0 += 0.1) { const p = [x, y0 + 0.05, z0 + 0.05]; if (!fensterAn(x, p[1], p[2])) continue; const w = sub(auge, p), d2 = dot(w, w), ca = dot(n, w) / Math.sqrt(d2); if (ca > 0) S.push({ p, En: (L_FENSTER * ca * 0.01) / d2, wer: "Fenster" }); }
      return S; },
    huelle: LAT.flatMap((q) => [[q[0] - 0.17, q[1] - 0.2, q[2] - 0.17], [q[0] + 0.17, q[1] + 0.25, q[2] + 0.17], [q[0] - 0.17, q[1] + 0.25, q[2] + 0.17], [q[0] + 0.17, q[1] - 0.2, q[2] - 0.17]]),
  };
}
// Wiese (Mess-Wiese): Boden (Gras), Baumlinie als Wand in 25 m (0–12 m hoch), Himmel; Mittag mit Sonne 74,2° oder Mitternacht mit Mond 74,2°.
// Die Leuchtdichten sind die Flecke von r1/spike (Wiese, Karte, Baumkrone/Laub zum Mond, Himmel); nur die Bild-Anteile kommen aus dem Raster.
const E_MITTAG = 117168, E_HIMMEL_MITTAG = 17000, ES_H = E_MITTAG - E_HIMMEL_MITTAG, E_SONNE_N = ES_H / Math.sin(MOND_H); // tag-ref.json (74,2°) · Himmel 17 000 (U)
function wiesenSzene(mittag) {
  const Lw = mittag ? [0, 1, 2].map((j) => (ATMO[j] * (C_SONNE[j] * ES_H + C_HIMMEL[j] * E_HIMMEL_MITTAG)) / Math.PI) : ATMO.map((r, j) => (r * C_MOND[j] * EwWiese) / Math.PI);
  const Lb = mittag ? [0, 1, 2].map((j) => (LAUB[j] * (C_SONNE[j] * ES_H * 0.5 + C_HIMMEL[j] * E_HIMMEL_MITTAG * 0.7)) / Math.PI) : LAUB.map((r, j) => (r * C_MOND[j] * MOND_E * P.laubMond) / Math.PI);
  const Lk = mittag ? [0, 1, 2].map((j) => (0.18 * (C_SONNE[j] * ES_H + C_HIMMEL[j] * E_HIMMEL_MITTAG)) / Math.PI) : [0, 1, 2].map((j) => (0.18 * C_MOND[j] * MOND_EH) / Math.PI);
  const Lh = mittag ? C_HIMMEL.map((c) => (c * E_HIMMEL_MITTAG) / Math.PI) : C_HIMMEL.map((c) => c * L_HIMMEL);
  const SONNE = [0, Math.sin(MOND_H) * 1e5, Math.cos(MOND_H) * 1e5]; // die Sonne im Süden vor dem Blick (Höhe 74,2°)
  return {
    name: mittag ? "mittag" : "mondwiese", Lw, Lb, Lk, Lh, SONNE,
    treffe(o, d) {
      let t = Infinity, was = null;
      const tw = d[2] > 1e-9 ? (25 - o[2]) / d[2] : Infinity; if (tw > 0) { const y = o[1] + tw * d[1]; if (y >= 0 && y <= 12) { t = tw; was = "laub"; } }
      const tg = ebene(o, d, 0); if (tg < t) { t = tg; was = "boden"; }
      if (t === Infinity) return { typ: "himmel", L: Lh, n: "Himmel", bit: false };
      const p = [o[0] + t * d[0], o[1] + t * d[1], o[2] + t * d[2]];
      if (was === "laub") return { typ: "diffus", L: Lb, n: "Baumlinie 25 m", p, bit: false };
      if (Math.abs(p[0]) < 0.15 && Math.abs(p[2] - 4) < 0.15) return { typ: "diffus", L: Lk, n: "Karte 18 %", p, bit: false };
      return { typ: "diffus", L: Lw, n: "Wiese", p, bit: false };
    },
    stuecke() { return mittag ? [{ p: SONNE, En: E_SONNE_N, wer: "Sonne" }] : []; },
    huelle: [],
  };
}

// ══ DAS AUGE ══
const TH_MIN = 1; // Grad: die untere Grenze von Stiles-Holladay (Gültigkeit 1°–30°, CIE 146:2002) — die Klemme ist STELLWERT
const L_MIN = 0.005, TAU_DUNKEL = 120, TAU_HELL = 0.1; // das EINE gewählte Datum: untere Anpassungs-Grenze (CIE 191:2010, Ende des Zapfen-Asts) und τ dunkel (Zapfen-Pigment); τ hell nach Crawford 1947 (Größenordnung)
const DELTA = 1e-6; // log-Mittel (Reinhard 2002 Gl. 1, δ „klein") — ohne Wirkung über 10⁻⁴ cd/m²
const SH = (th) => 0; // AUGE 3: der Schleier fällt aus dem Auge (Entscheid 19.11. 00:35)
const SHalt = (th, A) => (10 * (1 + (A / 70) ** 4)) / Math.max(th, TH_MIN) ** 2; // CIE 146:2002, altersangepasst, 1°–30°
const CIEall = (th, A, p) => { const t = Math.max(th, 0.1); return 10 / t ** 3 + (5 / t ** 2 + (0.1 * p) / t) * (1 + (A / 62.5) ** 4) + 0.0025 * p; }; // CIE 146:2002 allgemein, 0,1°–100°
// Schleier auf dem geometrischen Weg: die Stücke der Strahler im Bildfeld (STELLWERT: Blend-Feld = Bildfeld), E senkrecht zur Richtung × cos θ
function schleierGeom(sz, K_, opt = {}) {
  const r = { sh: 0, sh0: 0, alt70: 0, cie25: 0, cie70: 0, gesichtsfeld: 0, E: 0, je: {} };
  for (const s of sz.stuecke(K_.o)) {
    const th = winkel(K_, s.p), E = s.En * Math.cos(th * D2R); if (th < 90) r.gesichtsfeld += E * SH(th);
    if (!imBild(K_, s.p)) continue;
    r.E += E; r.sh += E * SH(th); r.sh0 += E * (10 / Math.max(th, opt.th0 || 0.5) ** 2); r.alt70 += E * SHalt(th, 70); r.cie25 += E * CIEall(th, 25, 0.5); r.cie70 += E * CIEall(th, 70, 0.5);
    r.je[s.wer] = (r.je[s.wer] || 0) + E * SH(th);
  }
  return r;
}
// Raster der Sicht: L_a (log-Mittel der Nicht-Strahler) und der Schleier auf dem PIXEL-Weg (Σ L·dω·cos θ · 10/θ² über Strahler-Pixel; fein im Hüllen-Rechteck)
function raster(sz, K_, Wr = 960, Hr = 540, opt = {}) {
  const dx = (2 * TANH * ASP) / Wr, dy = (2 * TANH) / Hr;
  let lnS = 0, lnSs = 0, n = 0, Lv = 0, Lv25 = 0, anteil = {}, nQ = 0;
  // Hüllen-Rechteck in Bild-Koordinaten (x, y in Einheiten der Brennweite)
  let bx0 = Infinity, bx1 = -Infinity, by0 = Infinity, by1 = -Infinity;
  for (const p of sz.huelle) { const b = bildLage(K_, p); if (!b) continue; bx0 = Math.min(bx0, b.x); bx1 = Math.max(bx1, b.x); by0 = Math.min(by0, b.y); by1 = Math.max(by1, b.y); }
  const mx = 0.01; bx0 = Math.max(-TANH * ASP, bx0 - mx); bx1 = Math.min(TANH * ASP, bx1 + mx); by0 = Math.max(-TANH, by0 - mx); by1 = Math.min(TANH, by1 + mx);
  const inBox = (x, y) => x >= bx0 && x <= bx1 && y >= by0 && y <= by1;
  const strahl = (x, y) => norm([K_.fw[0] + x * K_.re[0] + y * K_.up[0], K_.fw[1] + x * K_.re[1] + y * K_.up[1], K_.fw[2] + x * K_.re[2] + y * K_.up[2]]);
  const add = (h, x, y, dw) => { const ct = 1 / Math.sqrt(1 + x * x + y * y), th = Math.acos(ct) / D2R, E = luma(h.L) * dw * ct; Lv += E * SH(th); Lv25 += E * CIEall(th, 25, 0.5); };
  for (let py = 0; py < Hr; py++) for (let px = 0; px < Wr; px++) {
    const x = ((px + 0.5) / Wr * 2 - 1) * TANH * ASP, y = (1 - (py + 0.5) / Hr * 2) * TANH, h = sz.treffe(K_.o, strahl(x, y));
    if (h.bit) { nQ++; anteil[h.n] = (anteil[h.n] || 0) + 1; if (!inBox(x, y)) add(h, x, y, (dx * dy) / (1 + x * x + y * y) ** 1.5); }
    else { lnS += Math.log(luma(h.L) + DELTA); lnSs += Math.log((h.Ls != null ? h.Ls : luma(h.L)) + DELTA); n++; }
  }
  // fein im Rechteck: Schritt so, dass höchstens ≈ 2,5 Mio. Proben fallen (mindestens 1/8 Pixel der 1 440-Zeile, wenn klein)
  if (bx1 > bx0 && by1 > by0) {
    const fl = (bx1 - bx0) * (by1 - by0), st = Math.max(Math.sqrt(fl / 2.5e6), (2 * TANH) / 810 / 8);
    for (let y = by0 + st / 2; y < by1; y += st) for (let x = bx0 + st / 2; x < bx1; x += st) { const h = sz.treffe(K_.o, strahl(x, y)); if (h.bit) add(h, x, y, (st * st) / (1 + x * x + y * y) ** 1.5); }
  }
  for (const k in anteil) anteil[k] = anteil[k] / (Wr * Hr);
  return { La: Math.exp(lnS / Math.max(1, n)), Las: Math.exp(lnSs / Math.max(1, n)), nichtStrahler: n / (Wr * Hr), Lv, Lv25, anteil };
}
let A_KEY = null; // a = 0,22 · L_Z(Mittag, Mess-Wiese) / L_Karte — FOLGT aus der Eichung
const kVon = (LZ) => A_KEY / Math.max(LZ, L_MIN);
function zustand(sz, K_, Wr, Hr) { const R = raster(sz, K_, Wr, Hr), G = schleierGeom(sz, K_); const LZ = R.La; return { R, G, La: R.La, Lv: G.sh, LZ, k: kVon(LZ), LZpix: R.La + R.Lv, kpix: kVon(R.La + R.Lv), LZcie25: R.La + G.cie25, kcie25: kVon(R.La + G.cie25), LZcie70: R.La + G.cie70, kcie70: kVon(R.La + G.cie70) }; }

// ══ SCHIRM ══
const oetf = (v) => (v <= 0.0031308 ? 12.92 * v : 1.055 * v ** (1 / 2.4) - 0.055);
const code = (rgbLin) => rgbLin.map((v) => Math.max(0, Math.min(255, Math.round(255 * oetf(Math.max(0, v))))));
const lumaCode = (c) => 0.2126 * c[0] + 0.7152 * c[1] + 0.0722 * c[2];
function oklabH(c) { const l = Math.cbrt(0.4122214708 * c[0] + 0.5363325363 * c[1] + 0.0514459929 * c[2]), m = Math.cbrt(0.2119034982 * c[0] + 0.6806995451 * c[1] + 0.1073969566 * c[2]), s = Math.cbrt(0.0883024619 * c[0] + 0.2817188376 * c[1] + 0.6299787005 * c[2]);
  const L = 0.2104542553 * l + 0.793617785 * m - 0.0040720468 * s, A = 1.9779984951 * l - 2.428592205 * m + 0.4505937099 * s, B = 0.0259040371 * l + 0.7827717662 * m - 0.808675766 * s; const C = Math.hypot(A, B); return { h: C > 1e-4 ? ((Math.atan2(B, A) / D2R + 360) % 360) : null, C, L }; }
function bild(Lrgb, k) { const x = Lrgb.map((v) => v * k), y = K.schirm(x), c = code(y), o = oklabH(y), oi = oklabH(Lrgb); return { x, kL: luma(x), kR: Math.max(...x), y, Yaus: luma(y), c, luma: lumaCode(c), h: o.h, hEin: oi.h, C: o.C }; }
const fleckZeile = (n, L, k, extra = "") => { const b = bild(L, k); return `| ${n} | ${sig(luma(L))} | ${f(b.kL, 4)} · ${f(b.kR, 4)} | ${b.c.join("/")} | ${f(b.luma, 1)} | ${b.h == null ? "—" : f(b.h, 1) + "°"} (ein ${b.hEin == null ? "—" : f(b.hEin, 1) + "°"}) |${extra}`; };
const FLECK_KOPF = "| Fleck | L (cd/m², Y) | k·L (Y · hellster Kanal) | sRGB | Luma (Code) | Oklab-h aus (ein) |\n|---|---|---|---|---|---|";
const fleck = (sz, auge, p) => sz.treffe(auge, norm(sub(p, auge)));

// TVI: Ferwerda et al. 1996 (photopisch / skotopisch, log10 ΔL_t gegen log10 L_a) und Blackwell nach Ward 1994
function tviP(La) { const x = Math.log10(La); const y = x <= -2.6 ? -0.72 : x >= 1.9 ? x - 1.255 : (0.249 * x + 0.65) ** 2.7 - 0.72; return 10 ** y; }
function tviS(La) { const x = Math.log10(La); const y = x <= -3.94 ? -2.86 : x >= -1.44 ? x - 0.395 : (0.405 * x + 1.6) ** 2.18 - 2.86; return 10 ** y; }
const tviW = (La) => 0.0594 * (1.219 + La ** 0.4) ** 2.5;

// ════════════════════════════════════════════════════════════════════════════════════════════════════════════════════
say("# AUGE 2 — fünf Fälle unter EINEM Zustand je Sicht");
say(`Kamera: vFOV 75° (KAM_FOV_GRAD), 16:9, Raster 960 × 540 (das Maß der GPU-Bilder) für L_a; Schleier geometrisch (Candela/Flächen-Stücke) und als Pixel-Summe.`);
say(`Prüfung S/P (skotopisch/photopisch) am Planck-Strahler: CIE A 2 856 K ${f(SP(2856), 3)} (Soll 1,41) · 1 850 K ${f(SP(1850), 2)} · 2 000 K ${f(SP(2000), 2)} · 4 100 K ${f(SP(4100), 2)} · 5 772 K ${f(SP(5772), 2)}`);

// ── EICHUNG: Mittag, Mess-Wiese (Pose main mittag-wiese: Auge 1,7 m, Blick 1,4° abwärts) ──
const AUGE_W = [0, 1.7, 0], ZIEL_W = [0, 1.2, 20];
function eiche(p = {}) { setze(p); const sz = wiesenSzene(true), K_ = kamera(AUGE_W, ZIEL_W), R = raster(sz, K_, 480, 270), G = schleierGeom(sz, K_); const LZ = R.La + G.sh; const LKarte = luma(sz.Lk); return { a: (0.22 * Math.max(LZ, L_MIN)) / LKarte, La: R.La, Lv: G.sh, LKarte, sz, R }; }
const EI = eiche(); A_KEY = EI.a;
say(`\n## Eichung (Fall 4 trägt sie): Mittag, Mess-Wiese, Sonne 74,2°`);
say(`L_a ${sig(EI.La)} cd/m² · Schleier der Sonne im Bildfeld ${sig(EI.Lv)} (die Sonne steht ${f(winkel(kamera(AUGE_W, ZIEL_W), EI.sz.SONNE), 1)}° von der Blickachse, Bildfeld ±37,5° vertikal) · Karte ${sig(EI.LKarte)} cd/m² → a = 0,22 · L_Z / L_Karte = ${f(A_KEY, 4)} (κ = L_Karte/L_a = ${f(EI.LKarte / EI.La, 3)}; Bild-Anteile: Nicht-Strahler ${f(100 * EI.R.nichtStrahler, 1)} %)`);
{ const b = bild(EI.sz.Lk, kVon(EI.La)); say(`Karte: k·L ${f(b.kL, 4)} → sRGB ${b.c.join("/")}, Luma ${f(b.luma, 1)} (Soll 118)`); }
// zweiter Weg der Eichung: die Flecke-Gewichte des Spikes (Wiese Sonne 0,45 · Karte 0,01 · Wiese Schatten 0,1 · Baumkrone 0,1 · Himmel 0,34)
{ setze(); const sz = wiesenSzene(true); const Lsch = [0, 1, 2].map((j) => (ATMO[j] * C_HIMMEL[j] * E_HIMMEL_MITTAG * 0.6) / Math.PI);
  const F = [[0.45, sz.Lw], [0.01, sz.Lk], [0.1, Lsch], [0.1, sz.Lb], [0.34, sz.Lh]]; let s = 0, w = 0; for (const [ww, L] of F) { s += ww * Math.log(luma(L) + DELTA); w += ww; } const La2 = Math.exp(s / w);
  say(`Zweiter Weg (Flecke-Gewichte des Spikes statt Raster): L_a ${sig(La2)} → a ${f((0.22 * La2) / luma(sz.Lk), 4)} (${f(ev((0.22 * La2) / luma(sz.Lk), A_KEY), 2)} EV gegen das Raster) — κ ${f(luma(sz.Lk) / La2, 3)} (Spike 1,822, QUELLE 1,743)`); }

// ── FALL 1: Herd nah (3 m) ↔ fern (25 m) ──
say(`\n## Fall 1 — Herd nah ↔ fern (Ego 1,6 m; Blickziel 0,6 m über der Mitte des Betts, wie main herd-nah/-fern: Kamera 1,0 m über dem Ziel)`);
setze(); const HZ = herdSzene();
const AUGE_N = [0, 1.6, -3], AUGE_F = [0, 1.6, -25], ZIEL_H = [0, 0.6, 0];
const KN = kamera(AUGE_N, ZIEL_H), KF = kamera(AUGE_F, ZIEL_H);
const ZN = zustand(HZ, KN), ZF = zustand(HZ, KF);
const zZeile = (nm, Z, K_) => `| ${nm} | ${f(winkel(K_, Q_HERD), 2)}° | ${sig(Z.G.E)} | ${sig(Z.La)} | ${sig(Z.Lv)} (${Object.entries(Z.G.je).map(([k, v]) => k + " " + sig(v)).join(", ")}) | ${sig(Z.LZ)} | ${sig(Z.k)} | ${sig(Z.R.Lv)} → k ${sig(Z.kpix)} | ${sig(Z.G.cie25)} → k ${sig(Z.kcie25)} | ${Object.entries(Z.R.anteil).map(([k, v]) => k + " " + f(100 * v, 2) + " %").join(", ")} |`;
const Z_KOPF = "| Sicht | θ Flamme (Licht-Ort) | E_Blend am Auge (lx) | L_a | L_v Stiles-Holladay (je Strahler) | L_Z | k | 2. Weg: L_v Pixel-Summe → k | 3. Weg: CIE allgemein (A 25, p 0,5) → k | Strahler-Anteil am Bild |\n|---|---|---|---|---|---|---|---|---|---|";
say(Z_KOPF); say(zZeile("nah 3 m", ZN, KN)); say(zZeile("fern 25 m", ZF, KF));
const VERH = ZF.k / ZN.k;
{ const R2 = raster(HZ, KN, 1440, 810), R3 = raster(HZ, KN, 480, 270); say(`L_a nah im Raster 1 440 × 810: ${sig(R2.La)} · 480 × 270: ${sig(R3.La)} (gegen 960 × 540: ${sig(ZN.La)})`); }
say(`k_fern ÷ k_nah = **${f(VERH, 2)}** (${f(ev(ZF.k, ZN.k), 2)} EV) · Pixel-Weg ${f(ZF.kpix / ZN.kpix, 2)} · CIE allgemein A 25: ${f(ZF.kcie25 / ZN.kcie25, 2)} · A 70: ${f(ZF.kcie70 / ZN.kcie70, 2)} · Stiles-Holladay mit Klemme 0,5° statt 1°: ${f((ZN.La + ZN.G.sh0) / (ZF.La + ZF.G.sh0), 2)} · altersangepasst A 70: ${f((ZN.La + ZN.G.alt70) / (ZF.La + ZF.G.alt70), 2)}`);
// Flecke
const herdFlecke = (Z, auge, titel) => { say(`\n${titel} (k ${sig(Z.k)})`); say(FLECK_KOPF); const R = []; for (const r of [0.75, 1.25, 1.75, 2.5, 4, 14]) { for (const seite of [-1, 1]) { const p = [0, 0, seite * r], h = fleck(HZ, auge, p); if (h.n !== "Gras") continue; const b = bild(h.L, Z.k); R.push({ r, seite, b, h }); say(fleckZeile(`Gras ${f(r, 2)} m ${seite < 0 ? "diesseits" : "jenseits"}`, h.L, Z.k)); } }
  for (const [n, p] of [["Ring innen (jenseits, 35° seitlich)", [RING_I * Math.sin(35 * D2R), 0.06, RING_I * Math.cos(35 * D2R)]], ["Glutbett", [0, 0, 0.1]], ["Flamme", [0, 0.3, 0]]]) { const h = fleck(HZ, auge, p); say(fleckZeile(`${n} → ${h.n}`, h.L, Z.k)); } return R; };
const RN = herdFlecke(ZN, AUGE_N, "### Flecke nah"); herdFlecke(ZF, AUGE_F, "### Flecke fern");
const ringMax = Math.max(...RN.filter((x) => x.r <= 1.75).map((x) => x.b.kR));
say(`\nGras im Ring (0,75–1,75 m) nah: hellster Kanal k·L höchstens **${f(ringMax, 3)}** (FÄLLT erst über 3).`);
{ const g = fleck(HZ, AUGE_N, [0, 0, -0.75]); say(`Gras 0,75 m unter den Zweitwegen: Luma nah ${f(bild(g.L, ZN.k).luma, 1)} (S-H) · ${f(bild(g.L, ZN.kpix).luma, 1)} (Pixel) · ${f(bild(g.L, ZN.kcie25).luma, 1)} (CIE) — fern ${f(bild(g.L, ZF.k).luma, 1)} · ${f(bild(g.L, ZF.kpix).luma, 1)} · ${f(bild(g.L, ZF.kcie25).luma, 1)}`); }
const F1 = VERH >= 2 && ringMax <= 3;
say(`URTEIL Fall 1: ${F1 ? "HÄLT" : "FÄLLT"} (Faktor ${f(VERH, 2)} gegen 2; Ring ${f(ringMax, 3)} gegen 3).`);
// Die Form des Schleiers: bei festem Welt-Versatz der Fixation von der Quelle ist E/θ² abstands-unabhängig
say(`\n### Die Form: Abstand und Blickwinkel (L_v der Flamme allein, Stiles-Holladay, E ⊥ Blick)`);
say("| Lage der Fixation | nah 3 m: θ · L_v | fern 25 m: θ · L_v | L_v nah ÷ fern |\n|---|---|---|---|");
for (const [nm, zielN, zielF] of [["Ziel 0,6 m über dem Bett (die Sichten oben)", ZIEL_H, ZIEL_H], ["Ziel 0,35 m (Licht-Ort, θ → 0)", Q_HERD, Q_HERD], ["fester Welt-Versatz: Ziel 1,0 m über dem Licht-Ort", [0, 1.35, 0], [0, 1.35, 0]], ["fester Welt-Versatz: Ziel 2 m seitlich", [2, 0.35, 0], [2, 0.35, 0]], ["fester Bildwinkel 4,2° in beiden", null, null]]) {
  let lv = []; for (const [auge, ziel] of [[AUGE_N, zielN], [AUGE_F, zielF]]) { let th, E; const v = sub(Q_HERD, auge), d2 = dot(v, v); if (ziel) { th = winkel(kamera(auge, ziel), Q_HERD); } else th = 4.19; E = (I_HERD / d2) * Math.cos(th * D2R); lv.push([th, E * SH(th)]); }
  say(`| ${nm} | ${f(lv[0][0], 2)}° · ${sig(lv[0][1])} | ${f(lv[1][0], 2)}° · ${sig(lv[1][1])} | ${f(lv[0][1] / lv[1][1], 2)} |`); }
// Die Blicklage nah, ab der der Faktor unter 2 fällt
{ let thKipp = null; for (let th = 0.5; th <= 30; th += 0.05) { const v = sub(Q_HERD, AUGE_N), E = (I_HERD / dot(v, v)) * Math.cos(th * D2R), LZn = ZN.La + E * SH(th) + (ZN.G.je.Glutbett || 0); if (LZn / ZF.LZ < 2) { thKipp = th; break; } }
  say(`Nah fällt der Faktor unter 2, sobald die Flamme mehr als **${f(thKipp, 2)}°** neben der Blickachse steht (fern bleibt sie in der Klemme 1°).`); }
// main-Lagen als Gegenprobe (Abstand und Höhe aus den .bef: nah 4,95 m waagrecht, Kamera 1,0 m über dem Ziel; fern 22,8 m, Kamera 5,4 m über dem Ziel)
{ const Kn = kamera([0, 1.6, -4.95], ZIEL_H), Kf = kamera([0, 6.0, -22.8], ZIEL_H), Zn = zustand(HZ, Kn), Zf = zustand(HZ, Kf);
  say(`\nmain-Lagen (aus main-herd-*.bef; Boden unter dem Ziel 0,6 m angenommen): nah 4,95 m θ ${f(winkel(Kn, Q_HERD), 2)}° L_Z ${sig(Zn.LZ)} k ${sig(Zn.k)} · fern 22,8 m / 6 m hoch θ ${f(winkel(Kf, Q_HERD), 2)}° L_Z ${sig(Zf.LZ)} k ${sig(Zf.k)} → Faktor ${f(Zf.k / Zn.k, 2)} · CIE allgemein ${f(Zf.kcie25 / Zn.kcie25, 2)}`); }
// Gegenprobe der Bild-Lage im main-Bild herd-nah.png: das Bett steht ≈ 35 px unter der Mitte (960 × 540) → 5,7°
say(`Gegenprobe Bild: im main-Bild herd-nah.png steht die Mitte des Betts ≈ 35 px unter und 10 px neben der Bildmitte (960 × 540) → ${f(Math.atan(Math.hypot(35, 10) / (270 / TANH)) / D2R, 1)}°; die Rechnung setzt das Bett in 4,95 m auf ${f(winkel(kamera([0, 1.6, -4.95], ZIEL_H), [0, 0, 0]), 1)}°.`);

// Schwenk vom Feuer weg (nah): 0/10/30/60° Gier
say(`\n### Schwenk vom Feuer weg (nah 3 m, Gier um die Hochachse)`);
say("| Gier | θ Flamme | Flamme im Bild | L_a | L_v | L_Z | k | Sprung gegen 0° | Weg ins Neue (log-Raum): bis ±0,1 EV |\n|---|---|---|---|---|---|---|---|---|");
const SCHWENK = {};
for (const g of [0, 10, 30, 60]) { const K_ = gier(AUGE_N, ZIEL_H, g), Z = zustand(HZ, K_, 480, 270); SCHWENK[g] = Z; const sp = ev(Z.k, ZN.k);
  const t = Math.abs(sp) > 0.1 ? (sp > 0 ? TAU_DUNKEL : TAU_HELL) * Math.log(Math.abs(sp) / 0.1) : 0;
  say(`| ${g}° | ${f(winkel(K_, Q_HERD), 1)}° | ${imBild(K_, Q_HERD) ? "ja" : "nein"} | ${sig(Z.La)} | ${sig(Z.Lv)} | ${sig(Z.LZ)} | ${sig(Z.k)} | ${f(sp, 2)} EV | ${sp > 0.1 ? f(t, 0) + " s (τ dunkel " + TAU_DUNKEL + " s); mit main-τ 0,8 s: " + f(0.8 * Math.log(sp / 0.1), 1) + " s" : "—"} |`); }
{ const K_ = gier(AUGE_N, ZIEL_H, 60), Z = SCHWENK[60]; const thg = winkel(K_, Q_HERD), E = (I_HERD / dot(sub(Q_HERD, AUGE_N), sub(Q_HERD, AUGE_N))) * Math.cos(thg * D2R);
  say(`Bei 60° verlässt die Flamme das Bildfeld (±53,7° waagrecht): der Schleier springt dort auf 0 (Stellwert Blend-Feld = Bildfeld). Im Gesichtsfeld (ohne Bild-Schnitt) trüge sie noch ${sig(E * SH(thg))} cd/m² (${f(ev(Z.La + E * SH(thg), Z.LZ), 2)} EV am Zustand).`); }

// Empfindlichkeit Fall 1
say(`\n### Empfindlichkeit Fall 1`);
say("| Größe (Rand) | L_Z nah | L_Z fern | k_fern ÷ k_nah | Ring hellster Kanal | Urteil |\n|---|---|---|---|---|---|");
for (const [nm, p] of [["Glutbett 900 K", { tGlut: 900 }], ["Glutbett 1 100 K (Basis)", {}], ["Glutbett 1 300 K", { tGlut: 1300 }], ["Gras-Albedo Y 0,20", { albedo: 0.2 / 0.1236 }], ["Halm-Faktor Mond ×2 (0,51 → 1)", { halm: 2 }], ["Mond 0,1 lx", { mondE: 0.1 }], ["Mond 0,3 lx", { mondE: 0.3 }]]) {
  const a0 = A_KEY; const ei = eiche(p); A_KEY = ei.a; setze(p); const hz = herdSzene(); const zn = zustand(hz, KN, 480, 270), zf = zustand(hz, KF, 480, 270);
  let rm = 0; for (const r of [0.75, 1.25, 1.75]) for (const s of [-1, 1]) { const h = fleck(hz, AUGE_N, [0, 0, s * r]); if (h.n === "Gras") rm = Math.max(rm, bild(h.L, zn.k).kR); }
  say(`| ${nm} | ${sig(zn.LZ)} | ${sig(zf.LZ)} | ${f(zf.k / zn.k, 2)} | ${f(rm, 3)} | ${zf.k / zn.k >= 2 && rm <= 3 ? "HÄLT" : "FÄLLT"} |`); A_KEY = a0; }
setze(); A_KEY = EI.a;

// ── FALL 2: Gasse Nacht ──
say(`\n## Fall 2 — Gasse Nacht (Docht 1 cd unter der Haube, Wandlaternen in 2,8 m, Arm 0,4 m, je 10 m; Fenster aus der Stube 0,0318 cd/m²; Mond)`);
setze(); const GZ = gasseSzene();
const AUGE_G = [3, 1.6, -6];
const GS = [["r1-Sicht (Blick zur Laternen-Wand, Ziel 0,5/2,3/+2)", kamera(AUGE_G, [0.5, 2.3, 2])], ["die Gasse entlang (waagrecht)", kamera(AUGE_G, [3, 1.6, 10])]];
const PAARE = [["Mondwand", [6, 3.0, 1.0], "Wand im Schatten (Laternen-Seite, 5 m)", [0, 2.0, 5.0]], ["Wand unter der Laterne (1,2 m neben, 0,8 m unter dem Kopf)", [0, 2.0, 1.2], "Wand im Schatten (Laternen-Seite, 5 m)", [0, 2.0, 5.0]]];
const spM = SP(4100), spD = SP(1850);
let F2 = true; const F2grund = [];
for (const [nm, K_] of GS) {
  const Z = zustand(GZ, K_);
  // Zug je Strahler: L_Z mit ihm gegen ohne ihn (in Stufen), über die Grenze L_min
  const zug = {}; for (const s of GZ.stuecke(K_.o)) { if (!imBild(K_, s.p)) continue; const th = winkel(K_, s.p), lv = s.En * Math.cos(th * D2R) * SH(th); const key = s.wer === "Laterne" ? "Laterne " + s.p[2] : "Fenster"; zug[key] = (zug[key] || 0) + lv; }
  const zugEV = Object.fromEntries(Object.entries(zug).map(([k, v]) => [k, ev(Math.max(Z.LZ, L_MIN), Math.max(Z.LZ - v, L_MIN))]));
  const zugMax = Math.max(0, ...Object.values(zugEV));
  say(`\n### ${nm}`);
  say(`θ Laterne z 0: ${f(winkel(K_, LAT[0]), 1)}° · L_a ${sig(Z.La)} · L_v ${sig(Z.Lv)} (Pixel-Weg ${sig(Z.R.Lv)}) · L_Z ${sig(Z.LZ)} → max(L_Z, L_min ${L_MIN}) ${sig(Math.max(Z.LZ, L_MIN))} · k ${sig(Z.k)} · Zug je Strahler: ${Object.entries(zugEV).map(([k, v]) => k + " " + f(v, 2) + " EV").join(", ") || "—"} · Strahler-Anteil ${Object.entries(Z.R.anteil).map(([k, v]) => k + " " + f(100 * v, 2) + " %").join(", ")}`);
  const Ladapt = Math.max(Z.LZ, L_MIN), LZs = (Z.R.Las + Z.Lv * SP_D) * Math.max(1, L_MIN / Z.LZ);
  const tP = tviP(Ladapt), tS = tviS(LZs), tW = tviW(Ladapt);
  say(`Schwelle am Zustand ${sig(Ladapt)} cd/m² (skotopisch: L_a,s ${sig(Z.R.Las)} + L_v · S/P ${f(SP_D, 2)} → ${sig(LZs)} scot cd/m²; die Mitte mit S/P Mond ${f(spM, 2)} allein gäbe ${sig(Ladapt * spM)}): Zapfen (Ferwerda 1996) ΔL ${sig(tP)} · Stäbchen (Ferwerda 1996) ΔL_s ${sig(tS)} (mit S/P Mond allein ${sig(tviS(Ladapt * spM))}) · Blackwell/Ward 1994 ΔL ${sig(tW)}`);
  say(FLECK_KOPF);
  for (const [n1, p1, n2, p2] of PAARE) {
    const h1 = fleck(GZ, K_.o, p1), h2 = fleck(GZ, K_.o, p2), b1 = bild(h1.L, Z.k), b2 = bild(h2.L, Z.k);
    say(fleckZeile(`${n1} (${h1.n}${imBild(K_, p1) ? ", im Bild" : ", außer Bild"})`, h1.L, Z.k)); say(fleckZeile(`${n2} (${h2.n})`, h2.L, Z.k));
    // skotopischer Unterschied: je Fleck S/P seines Lichts (Mond- und Docht-Anteil getrennt nach dem Anteil an L)
    const dLp = Math.abs(luma(h1.L) - luma(h2.L));
    const dLs = Math.abs(h1.Ls - h2.Ls);
    const sichtbar = dLp > tP || dLs > tS, dCode = Math.abs(b1.luma - b2.luma);
    const ok = sichtbar && b1.luma >= 8 && dCode >= 2;
    say(`Paar „${n1}" ↔ „${n2}": ΔL ${sig(dLp)} cd/m² (Zapfen-Schwelle ×${f(dLp / tP, 2)}) · ΔL_s ${sig(dLs)} (Stäbchen-Schwelle ×${f(dLs / tS, 2)}) · Blackwell ×${f(dLp / tW, 2)} · Luma ${f(b1.luma, 1)} gegen ${f(b2.luma, 1)} → Δ ${f(dCode, 1)} Code → ${ok ? "lesbar" : "NICHT lesbar"}`);
    if (!ok) { F2 = false; F2grund.push(`${nm}: ${n1}`); }
  }
  if (zugMax > 2) { F2 = false; F2grund.push(`${nm}: Zug ${f(zugMax, 2)} EV`); }
  say(`(Pflaster im Mondschatten zum Vergleich:) ${fleckZeile("Pflaster im Mondschatten", fleck(GZ, K_.o, [1.0, 0, -2]).L, Z.k)}`);
}
say(`\nURTEIL Fall 2: ${F2 ? "HÄLT" : "FÄLLT"}${F2grund.length ? " — " + F2grund.join("; ") : ""}.`);
// Schwenk zur Laterne: Zug gegen den Winkel
say(`\n### Gasse: der Zug der Laterne gegen ihren Winkel zur Blickachse (Auge wie oben, 6,6 m vor dem Kopf)`);
{ const v = sub(LAT[0], AUGE_G), d2 = dot(v, v), En = (DOCHT_I * kopfSicht(KOPF, Math.hypot(v[0], v[2]), -v[1])) / d2; const La0 = zustand(GZ, GS[0][1], 480, 270).La; let kipp = null; const rows = [];
  for (const th of [1, 2, 4, 6, 8, 10, 20, 30]) { const lv = En * Math.cos(th * D2R) * SH(th), z = ev(Math.max(La0 + lv, L_MIN), Math.max(La0, L_MIN)); rows.push(`${th}° ${f(z, 2)} EV`); }
  for (let th = 0.5; th < 40; th += 0.05) { const lv = En * Math.cos(th * D2R) * SH(th); if (ev(Math.max(La0 + lv, L_MIN), Math.max(La0, L_MIN)) <= 2) { kipp = th; break; } }
  say(`E am Auge ${sig(En)} lx; Zug: ${rows.join(" · ")}; über 2 Stufen innerhalb **${f(kipp, 2)}°** um den Kopf.`); }
// Empfindlichkeit Fall 2
say(`\n### Empfindlichkeit Fall 2 (r1-Sicht)`);
say("| Größe | L_Z | k | Mondwand Luma · Δ zur Schattenwand | Wand unter der Laterne Luma · Δ | Schwelle (Zapfen ×, Stäbchen ×) | Urteil |\n|---|---|---|---|---|---|---|");
for (const [nm, p] of [["Basis (Mond 0,3965)", {}], ["Mond 0,1 lx", { mondE: 0.1 }], ["Mond 0,3 lx", { mondE: 0.3 }], ["Fenster cdM2 20 (2ce8-Datum statt Stube)", { fenster20: true }]]) {
  const a0 = A_KEY; setze(p); const gz = gasseSzene(); const K_ = GS[0][1];
  let Z = zustand(gz, K_, 480, 270);
  if (p.fenster20) { let lv = 0; for (const s of gz.stuecke(K_.o)) if (s.wer === "Fenster" && imBild(K_, s.p)) { const th = winkel(K_, s.p); lv += s.En * (20 / L_FENSTER) * Math.cos(th * D2R) * SH(th); } Z = { ...Z, LZ: Z.LZ + lv, k: kVon(Z.LZ + lv) }; }
  const m = fleck(gz, K_.o, PAARE[0][1]), s = fleck(gz, K_.o, PAARE[0][3]), w = fleck(gz, K_.o, PAARE[1][1]);
  const bm = bild(m.L, Z.k), bs = bild(s.L, Z.k), bw = bild(w.L, Z.k); const La = Math.max(Z.LZ, L_MIN), LZs = (Z.R.Las + (Z.LZ - Z.R.La) * SP_D) * Math.max(1, L_MIN / Z.LZ), tS = tviS(LZs);
  const okM = bm.luma >= 8 && Math.abs(bm.luma - bs.luma) >= 2 && (Math.abs(luma(m.L) - luma(s.L)) > tviP(La) || Math.abs(m.Ls - s.Ls) > tS);
  const okW = bw.luma >= 8 && Math.abs(bw.luma - bs.luma) >= 2 && (Math.abs(luma(w.L) - luma(s.L)) > tviP(La) || Math.abs(w.Ls - s.Ls) > tS);
  say(`| ${nm} | ${sig(Z.LZ)} | ${sig(Z.k)} | ${f(bm.luma, 1)} · ${f(Math.abs(bm.luma - bs.luma), 1)} | ${f(bw.luma, 1)} · ${f(Math.abs(bw.luma - bs.luma), 1)} | Mondwand ×${f(Math.abs(luma(m.L) - luma(s.L)) / tviP(La), 2)}, ×${f(Math.abs(m.Ls - s.Ls) / tS, 2)} · Laternen-Wand Stäbchen ×${f(Math.abs(w.Ls - s.Ls) / tS, 2)} | ${okM && okW ? "HÄLT" : "FÄLLT"} |`); A_KEY = a0; }
setze();

// ── FALL 3: Lava nah (3 m am Ufer), Spiel-Daten ──
say(`\n## Fall 3 — Lava nah, Spiel-Daten (tSchmelz 1 500 + Überhitzung 150 → t0 ${T0} K, Scholle 0,62 → ${f(TD + LK.platte * (T0 - TD), 0)} K, ε 0,95, Decke r ${LAVA_R} m, frisch w = 1)`);
setze(); let LZS = lavaSzene();
const AUGE_L = [LAVA_R + 3, 1.6, 0], ZIEL_L = [0, 0.6, 0];
const KL = kamera(AUGE_L, ZIEL_L);
const ZL = zustand(LZS, KL);
say(`Mittel der Decke ${f(LZS.LAVA.L, 0)} cd/m² · Riss ${f(EPS_LAVA * LFCm(T0), 0)} · Scholle ${f(EPS_LAVA * LFCm(TD + LK.platte * (T0 - TD)), 0)}`);
say(Z_KOPF.replace("θ Flamme (Licht-Ort)", "θ Mitte der Decke")); say(zZeile("lava 3 m", ZL, KL).replace(/^\| lava 3 m \| [^|]+\|/, `| lava 3 m | ${f(winkel(KL, [0, 0, 0]), 2)}° |`));
// analytischer dritter Weg: gleichmäßige Scheibe, Stiles-Holladay über den Raumwinkel (Mittel-L)
{ let s = 0; const Lm = LZS.LAVA.L, dr = 0.05; for (let r0 = 0; r0 < LAVA_R; r0 += dr) { const rm = r0 + dr / 2, nphi = Math.round((2 * Math.PI * rm) / dr), dA = (Math.PI * ((r0 + dr) ** 2 - r0 * r0)) / nphi; for (let j = 0; j < nphi; j++) { const ph = ((j + 0.5) / nphi) * 2 * Math.PI, p = [rm * Math.cos(ph), 0, rm * Math.sin(ph)]; if (!imBild(KL, p)) continue; const w = sub(AUGE_L, p), d2 = dot(w, w), th = winkel(KL, p); s += ((Lm * (w[1] / Math.sqrt(d2)) * dA) / d2) * Math.cos(th * D2R) * SH(th); } }
  say(`Dritter Weg (Decke gleichmäßig im Mittel ${f(LZS.LAVA.L, 0)} cd/m²): L_v ${sig(s)} (${f(ev(s, ZL.Lv), 2)} EV gegen die Schollen-Stücke)`); }
const lavaFl = (Z, auge, tit) => { say(`\n${tit} (k ${sig(Z.k)})`); say(FLECK_KOPF); const o = {};
  const riss = { L: planckFarbe(T0).map((c) => c * EPS_LAVA * LFCm(T0)) }, decke = { L: planckFarbe(TD + LK.platte * (T0 - TD)).map((c) => c * EPS_LAVA * LFCm(TD + LK.platte * (T0 - TD))) };
  const saum = fleck(LZS, auge, [LAVA_R + 0.25, 0, 0]), saum0 = fleck(LZS, auge, [LAVA_R + 0.05, 0, 0.3]), fern = fleck(LZS, auge, [-(LAVA_R + 15), 0, 0]), baum = fleck(LZS, auge, [-(LAVA_R + 20), 2.0, 0]);
  for (const [n, h] of [["Riss (1 650 K)", riss], ["Decke (Scholle 1 326 K)", decke], [`Ufer-Saum 0,25 m (${saum.n})`, saum], [`Ufer 0,05 m (${saum0.n})`, saum0], [`Ufer fern 15 m jenseits (${fern.n})`, fern], [`Baumlinie 20 m jenseits (${baum.n})`, baum]]) { say(fleckZeile(n, h.L, Z.k)); o[n.split(" (")[0]] = { L: h.L, b: bild(h.L, Z.k) }; }
  return o; };
const LF_ = lavaFl(ZL, AUGE_L, "### Flecke lava-nah");
{ const Y = (n) => luma(LF_[n].L), B = (n) => LF_[n].b; const ord = ["Riss", "Decke", "Ufer-Saum 0,25 m", "Ufer fern 15 m jenseits", "Baumlinie 20 m jenseits"];
  const ordWelt = ord.every((n, i) => i === 0 || Y(ord[i - 1]) > Y(n)), ordBild = ord.every((n, i) => i === 0 || B(ord[i - 1]).Yaus >= B(n).Yaus);
  const dDS = Math.abs(B("Decke").luma - B("Ufer-Saum 0,25 m").luma);
  var F3 = B("Ufer-Saum 0,25 m").luma >= 8 && dDS >= 2 && ordWelt && ordBild;
  say(`Ordnung in Y (Welt): ${ord.map((n) => n + " " + sig(Y(n))).join(" > ")} → ${ordWelt ? "hält" : "BRICHT"}; im Bild (Y_aus) ${ordBild ? "hält" : "BRICHT"} · Ufer-Saum Luma ${f(B("Ufer-Saum 0,25 m").luma, 1)} · Decke ↔ Saum Δ ${f(dDS, 1)} Code`);
  say(`Ufer-Saum unter den Zweitwegen: Pixel-Summe Luma ${f(bild(LF_["Ufer-Saum 0,25 m"].L, ZL.kpix).luma, 1)} · CIE allgemein A 25 ${f(bild(LF_["Ufer-Saum 0,25 m"].L, ZL.kcie25).luma, 1)} · A 70 ${f(bild(LF_["Ufer-Saum 0,25 m"].L, ZL.kcie70).luma, 1)}; Decke ↔ Saum unter CIE A 25 Δ ${f(Math.abs(bild(LF_["Decke"].L, ZL.kcie25).luma - bild(LF_["Ufer-Saum 0,25 m"].L, ZL.kcie25).luma), 1)}`);
  say(`URTEIL Fall 3: ${F3 ? "HÄLT" : "FÄLLT"}.`); }
// Schwenk weg von der Decke
say(`\n### Lava: Schwenk weg von der Decke (Gier)`);
say("| Gier | Decke im Bild (Anteil) | L_a | L_v | L_Z | k | Sprung | Ufer-Saum Luma |\n|---|---|---|---|---|---|---|---|");
for (const g of [0, 10, 30, 60, 90]) { const K_ = gier(AUGE_L, ZIEL_L, g), Z = zustand(LZS, K_, 480, 270); const a = Object.values(Z.R.anteil).reduce((s, v) => s + v, 0); const sa = fleck(LZS, AUGE_L, [LAVA_R + 0.25, 0, 0]);
  say(`| ${g}° | ${f(100 * a, 1)} % | ${sig(Z.La)} | ${sig(Z.Lv)} | ${sig(Z.LZ)} | ${sig(Z.k)} | ${f(ev(Z.k, ZL.k), 2)} EV | ${f(bild(sa.L, Z.k).luma, 1)} |`); }
// Empfindlichkeit Fall 3
say(`\n### Empfindlichkeit Fall 3`);
say("| Größe | L_v | L_Z | k | Ufer-Saum Luma | Decke ↔ Saum Δ | Ordnung Welt | Urteil |\n|---|---|---|---|---|---|---|---|");
for (const [nm, p, t0] of [["Basis", {}, 1650], ["t0 1 470 K (Basalt ohne Überhitzung)", {}, 1470], ["Gras-Albedo Y 0,20", { albedo: 0.2 / 0.1236 }, 1650], ["Halm-Faktor Mond ×2", { halm: 2 }, 1650], ["Mond 0,1 lx", { mondE: 0.1 }, 1650]]) {
  const a0 = A_KEY; A_KEY = eiche(p).a; setze(p); T0 = t0; const lz = lavaSzene(); const Z = zustand(lz, KL, 480, 270);
  const dk = planckFarbe(TD + LK.platte * (T0 - TD)).map((c) => c * EPS_LAVA * LFCm(TD + LK.platte * (T0 - TD))), sa = fleck(lz, AUGE_L, [LAVA_R + 0.25, 0, 0]), fe = fleck(lz, AUGE_L, [-(LAVA_R + 15), 0, 0]), ba = fleck(lz, AUGE_L, [-(LAVA_R + 20), 2, 0]);
  const bs = bild(sa.L, Z.k), bd = bild(dk, Z.k); const ow = EPS_LAVA * LFCm(T0) > luma(dk) && luma(dk) > luma(sa.L) && luma(sa.L) > luma(fe.L) && luma(fe.L) > luma(ba.L);
  say(`| ${nm} | ${sig(Z.Lv)} | ${sig(Z.LZ)} | ${sig(Z.k)} | ${f(bs.luma, 1)} | ${f(Math.abs(bd.luma - bs.luma), 1)} | ${ow ? "hält" : "bricht (fern " + sig(luma(fe.L)) + " / Baum " + sig(luma(ba.L)) + ")"} | ${bs.luma >= 8 && Math.abs(bd.luma - bs.luma) >= 2 && ow ? "HÄLT" : "FÄLLT"} |`); A_KEY = a0; T0 = 1650; }
setze(); T0 = 1650; LZS = lavaSzene();

// ── FALL 4: Mittag ──
say(`\n## Fall 4 — Mittag, Mess-Wiese, Sonne 74,2°`);
setze(); const MZ = wiesenSzene(true), KM = kamera(AUGE_W, ZIEL_W), ZM = zustand(MZ, KM, 480, 270);
{ const b = bild(MZ.Lk, ZM.k); var F4 = Math.abs(b.luma - 118) <= 2 && ZM.Lv === 0;
  say(`Sonne ${f(winkel(KM, MZ.SONNE), 1)}° von der Achse, außerhalb des Bildfelds → L_v ${sig(ZM.Lv)}; im Gesichtsfeld (ohne Bild-Schnitt, Stiles-Holladay über 30° hinaus verlängert) trüge sie ${sig(ZM.G.gesichtsfeld)} cd/m² (${f(ev(ZM.La + ZM.G.gesichtsfeld, ZM.La), 3)} EV).`);
  say(FLECK_KOPF); say(fleckZeile("Karte 18 %", MZ.Lk, ZM.k)); say(fleckZeile("Wiese (Sonne)", MZ.Lw, ZM.k)); say(fleckZeile("Baumlinie", MZ.Lb, ZM.k)); say(fleckZeile("Himmel", MZ.Lh, ZM.k));
  say(`URTEIL Fall 4: ${F4 ? "HÄLT" : "FÄLLT"} (Karte Luma ${f(b.luma, 1)} gegen 118 — an der Eich-Sicht durch Konstruktion).`); }
say(`\n### Mittag: die Sonne in der Sicht (Kamera nickt aufwärts; die Karte gleicher Leuchtdichte unter dem k dieser Sicht)`);
say("| Nicken | θ Sonne | L_a | L_v Sonne (S-H · CIE allgemein A 25) | L_Z | k | Karte sRGB · Luma | Δ gegen 118 |\n|---|---|---|---|---|---|---|---|");
for (const n of [0, 30, 40, 50, 60, 70]) { const K_ = nick(AUGE_W, ZIEL_W, n), Z = zustand(MZ, K_, 480, 270), b = bild(MZ.Lk, Z.k); say(`| +${n}° | ${f(winkel(K_, MZ.SONNE), 1)}° | ${sig(Z.La)} | ${sig(Z.Lv)} · ${sig(Z.G.cie25)} | ${sig(Z.LZ)} | ${sig(Z.k)} | ${b.c.join("/")} · ${f(b.luma, 1)} | ${f(b.luma - 118, 1)} |`); }
// Gegenprobe Komposition: sonnige Wand 30 % des Bilds (r1) — Weber verschiebt die Karte
{ const Lwand = [0, 1, 2].map((j) => ([0.8196, 0.6359, 0.2799][j] * (C_SONNE[j] * E_SONNE_N * 0.9 + C_HIMMEL[j] * E_HIMMEL_MITTAG * 0.5)) / Math.PI);
  const La2 = Math.exp(0.7 * Math.log(ZM.La) + 0.3 * Math.log(luma(Lwand))); const b = bild(MZ.Lk, kVon(La2));
  say(`Andere Komposition (r1: sonnige Wand ρ tor, 30 % des Bilds): L_a ${sig(La2)} → Karte Luma ${f(b.luma, 1)} (${f(b.luma - 118, 1)} Code) — Weber hält die Karte nur an der Eich-Sicht.`); }

// ── FALL 5: Vollmond-Wiese ohne Feuer ──
say(`\n## Fall 5 — Vollmond-Wiese ohne Feuer (Mond 74,2°, außerhalb des Bildfelds; L_min ${L_MIN} cd/m²)`);
say("| Mond E⊥ | L_a | L_Z → max(L_Z, L_min) | k | Wiese 5 m: L · sRGB · Luma | Baumlinie: L · Luma | Himmel: L · Luma | Baum ↔ Himmel Δ | Urteil |\n|---|---|---|---|---|---|---|---|---|");
let F5 = true; const F5z = {};
const fall5 = (p, nm, Kx) => { setze(p); const sz = wiesenSzene(false), K_ = Kx || kamera(AUGE_W, ZIEL_W), Z = zustand(sz, K_, 480, 270);
  const bw = bild(sz.Lw, Z.k), bb = bild(sz.Lb, Z.k), bh = bild(sz.Lh, Z.k), d = Math.abs(bb.luma - bh.luma), ok = bw.luma >= 12 && d >= 2;
  say(`| ${nm} | ${sig(Z.La)} | ${sig(Z.LZ)} → ${sig(Math.max(Z.LZ, L_MIN))} | ${sig(Z.k)} | ${sig(luma(sz.Lw))} · ${bw.c.join("/")} · ${f(bw.luma, 1)} | ${sig(luma(sz.Lb))} · ${f(bb.luma, 1)} | ${sig(luma(sz.Lh))} · ${f(bh.luma, 1)} | ${f(d, 1)} | ${ok ? "HÄLT" : "FÄLLT"} |`); return { ok, Z, bw, bb, bh, sz }; };
for (const E of [0.1, 0.2, 0.3, 0.3965]) { const r = fall5({ mondE: E }, `${E} lx${E === 0.3965 ? " (Spiel-Datum)" : ""}`); F5z[E] = r; if (E <= 0.3) F5 = F5 && r.ok; }
say(`URTEIL Fall 5 (belegte Spanne 0,1–0,3 lx): ${F5 ? "HÄLT" : "FÄLLT"}.`);
// zweiter Weg: geschlossen x = a · L_Wiese / L_min, Fuß 6,25 x² (ohne Raster, ohne K1-Farbe)
{ const L = luma(F5z[0.1].sz.Lw), x = (A_KEY * L) / L_MIN, Yo = x < 0.08 ? 6.25 * x * x : x - 0.04; say(`Zweiter Weg (geschlossen, 0,1 lx): x = a·L/L_min = ${f(x, 4)} → Y_aus ${f(Yo, 5)} → Code ${f(255 * oetf(Yo), 1)} (Grau gleicher Y)`); }
say(`\n### Empfindlichkeit Fall 5 (Mond 0,1 lx, der untere Rand)`);
say("| Mond E⊥ | L_a | L_Z → max(L_Z, L_min) | k | Wiese 5 m: L · sRGB · Luma | Baumlinie: L · Luma | Himmel: L · Luma | Baum ↔ Himmel Δ | Urteil |\n|---|---|---|---|---|---|---|---|---|");
for (const [nm, p] of [["0,1 · Gras-Albedo Y 0,20", { mondE: 0.1, albedo: 0.2 / 0.1236 }], ["0,1 · Halm ×2", { mondE: 0.1, halm: 2 }], ["0,1 · Laub senkrecht (0,27 statt 0,5)", { mondE: 0.1, laubMond: 0.27 }], ["0,1 · Himmel ×2,5 (+1 mag)", { mondE: 0.1, himmel: 2.5 }], ["0,1 · Himmel ÷2,5", { mondE: 0.1, himmel: 0.4 }]]) {
  const a0 = A_KEY; if (p.albedo) A_KEY = eiche({ albedo: p.albedo }).a; setze(p); if (p.himmel) L_HIMMEL *= p.himmel; const sz = wiesenSzene(false), K_ = kamera(AUGE_W, ZIEL_W), Z = zustand(sz, K_, 480, 270);
  const bw = bild(sz.Lw, Z.k), bb = bild(sz.Lb, Z.k), bh = bild(sz.Lh, Z.k), d = Math.abs(bb.luma - bh.luma);
  say(`| ${nm} | ${sig(Z.La)} | ${sig(Z.LZ)} → ${sig(Math.max(Z.LZ, L_MIN))} | ${sig(Z.k)} | ${sig(luma(sz.Lw))} · ${bw.c.join("/")} · ${f(bw.luma, 1)} | ${sig(luma(sz.Lb))} · ${f(bb.luma, 1)} | ${sig(luma(sz.Lh))} · ${f(bh.luma, 1)} | ${f(d, 1)} | ${bw.luma >= 12 && d >= 2 ? "HÄLT" : "FÄLLT"} |`); A_KEY = a0; }
// Himmel-Leuchtdichte, bei der Baum und Himmel gleich stehen
{ setze({ mondE: 0.1 }); const sz = wiesenSzene(false); say(`Baumlinie = Himmel bei L_Himmel ${sig(luma(sz.Lb))} cd/m² (Basis ${sig(luma(sz.Lh))}): ×${f(luma(sz.Lb) / luma(sz.Lh), 2)} — ${luma(sz.Lb) / luma(sz.Lh) < 2.5 && luma(sz.Lb) / luma(sz.Lh) > 0.4 ? "INNERHALB" : "außerhalb"} des ehrlichen Fehlers des Himmels (×2,5).`); }
// L_min-Grenze für Fall 5
{ setze({ mondE: 0.1 }); const sz = wiesenSzene(false); const L = luma(sz.Lw); const xNeed = Math.sqrt(0.003675 / 6.25); say(`Für Wiese ≥ Luma 12 bei 0,1 lx braucht es k ≥ ${f(xNeed / L, 2)}, also L_min ≤ ${sig(A_KEY / (xNeed / L))} cd/m² (gewählt ${L_MIN}).`); }
setze();

// ── ZEITKONSTANTEN ──
say(`\n## Zeitkonstanten`);
say(`τ hell ${TAU_HELL} s (Crawford 1947, Größenordnung) · τ dunkel ${TAU_DUNKEL} s (Teil des EINEN gewählten Datums; Zapfen-Pigment) · main heute RAUM.blendeHellS 0,3 / blendeS 0,8 s (gewählt).`);
{ const sp = ev(SCHWENK[30].k, ZN.k); say(`Schwenk 30° weg vom Feuer (nah): ${f(sp, 2)} EV dunkler → heller zu werden braucht bis ±0,1 EV ${f(TAU_DUNKEL * Math.log(sp / 0.1), 0)} s (main-τ: ${f(0.8 * Math.log(sp / 0.1), 1)} s); zurück zum Feuer bis ±0,1 EV ${f(TAU_HELL * Math.log(sp / 0.1), 2)} s.`); }

// ── NACHTRAG AUGE 3: das Urteil gegen SOLL-AUGE3 und das Fenster je Fall (welches k trüge) ──
say(`\n## Nachtrag AUGE 3 — Urteil gegen SOLL-AUGE3, das Fenster je Fall`);
{ const A_ = ZN.k * ZN.LZ; // a der Eichung (k = a ÷ Zustand)
  // Fall 1: Ring ≤ 3
  const kRing = ZN.k * 3 / ringMax;
  say(`Fall 1 nah: der Ring trägt erst bei k ≤ ${sig(kRing)} (gerechnet ${sig(ZN.k)}) → es fehlen ${f(ev(ZN.k, kRing), 2)} EV; der Zustand müsste ≥ ${sig(A_ / kRing)} cd/m² stehen (L_a ${sig(ZN.La)}).`);
  { const z = []; for (const r of [0.75, 1.25, 1.75, 2.5, 4, 14]) { const h = fleck(HZ, AUGE_N, [0, 0, -r]); z.push(`${f(r, 2)} m ${sig(luma(h.L))}`); } say(`Gras nah, Leuchtdichte Y (cd/m²): ${z.join(" · ")} — der nötige Zustand liegt bei der Leuchtdichte des beschienenen Grases, nicht beim Mittel der Sicht.`); }
  { const z = []; for (const r of [0.75, 1.75, 4, 14]) { const h = fleck(HZ, AUGE_F, [0, 0, -r]); z.push(`${f(r, 2)} m ${f(bild(h.L, ZF.k).kR, 2)}`); } say(`Fall 1 fern (k ${sig(ZF.k)}): hellster Kanal k·L am Gras ${z.join(" · ")} — der ganze Lichtkreis steht über 3.`); }
  // Fall 3: Soll neu
  const N = Object.keys(LF_); let umk = 0, gleich = 0; const paare = [];
  for (let i = 0; i < N.length; i++) for (let j = i + 1; j < N.length; j++) { const yi = luma(LF_[N[i]].L), yj = luma(LF_[N[j]].L), oi = LF_[N[i]].b.Yaus, oj = LF_[N[j]].b.Yaus; if ((yi - yj) * (oi - oj) < 0) { umk++; paare.push(N[i] + " ↔ " + N[j]); } else if (oi === oj || Math.abs(LF_[N[i]].b.luma - LF_[N[j]].b.luma) < 2) gleich++; }
  const dDS = Math.abs(LF_["Decke"].b.luma - LF_["Ufer-Saum 0,25 m"].b.luma);
  say(`Fall 3 gegen SOLL-AUGE3: Ufer-Saum Luma ${f(LF_["Ufer-Saum 0,25 m"].b.luma, 1)} (≥ 8) · Decke ↔ Saum Δ ${f(dDS, 1)} Code (gegen 2) · Umkehrungen in Y_aus: ${umk} von ${N.length * (N.length - 1) / 2} Paaren${umk ? " (" + paare.join(", ") + ")" : ""} · Paare unter 2 Code Abstand: ${gleich}.`);
  const dk = (k) => Math.abs(bild(LF_["Decke"].L, k).luma - bild(LF_["Ufer-Saum 0,25 m"].L, k).luma), sk = (k) => bild(LF_["Ufer-Saum 0,25 m"].L, k).luma;
  let kOben = null, kUnten = null; for (let i = 0; i <= 2400; i++) { const k = ZL.k * Math.pow(2, -i / 100); if (kOben == null && dk(k) >= 2) kOben = k; if (kOben != null && sk(k) >= 8) kUnten = k; if (kOben != null && sk(k) < 8) break; }
  var F3N = LF_["Ufer-Saum 0,25 m"].b.luma >= 8 && dDS >= 2 && umk === 0;
  say(`Fenster Lava: Decke ↔ Saum ≥ 2 Code erst bei k ≤ ${sig(kOben)} (gerechnet ${sig(ZL.k)}) → es fehlen ${f(ev(ZL.k, kOben), 2)} EV; Saum ≥ Luma 8 bis hinab zu k ${sig(kUnten)}; der Zustand müsste ≥ ${sig(ZL.k * ZL.LZ / kOben)} cd/m² stehen (L_a ${sig(ZL.La)}; Saum ${sig(luma(LF_["Ufer-Saum 0,25 m"].L))}, Decke ${sig(luma(LF_["Decke"].L))}). Am oberen Rand des Fensters: Saum Luma ${f(sk(kOben), 1)}, Decke ${f(bild(LF_["Decke"].L, kOben).luma, 1)}.`);
  say(`URTEIL Fall 3 (SOLL-AUGE3): ${F3N ? "HÄLT" : "FÄLLT"}.`);
  // Fall 6: das τ, ab dem der Schwenk kippt (t = τ · ln(J / 0,3), J in EV)
  const kipp = (J) => (Math.abs(J) <= 0.3 ? Infinity : 10 / Math.log(Math.abs(J) / 0.3));
  const sw = (ZS, AU, ZI, gier) => { const v = sub(ZI, AU), c = Math.cos(gier * D2R), s = Math.sin(gier * D2R), z2 = [AU[0] + v[0] * c + v[2] * s, ZI[1], AU[2] - v[0] * s + v[2] * c]; return zustand(ZS, kamera(AU, z2)); };
  const zl = []; for (const g of [10, 30, 60]) { const Zs = sw(HZ, AUGE_N, ZIEL_H, g), J = ev(Zs.k, ZN.k); zl.push(`Herd ${g}°: Ziel-L_a ${sig(Zs.La)} (${Zs.La > 0.005 ? "über" : "UNTER"} L_min), Sprung ${f(J, 2)} EV, kippt ab τ ${isFinite(kipp(J)) ? f(kipp(J), 1) + " s" : "nie (Sprung ≤ 0,3 EV)"}`); }
  say(`Fall 6: ${zl.join(" · ")}.`);
}

// ── SUMME ──
say(`\n## Tafel`);
say(`Fall 1 ${F1 ? "HÄLT" : "FÄLLT"} (×${f(VERH, 2)}; Ring ${f(ringMax, 3)}) · Fall 2 ${F2 ? "HÄLT" : "FÄLLT"} · Fall 3 ${F3 ? "HÄLT" : "FÄLLT"} · Fall 4 ${F4 ? "HÄLT" : "FÄLLT"} · Fall 5 ${F5 ? "HÄLT" : "FÄLLT"}`);

// ════════ AUGE 5b — k(Z) = k_E·(Z/Z_E)^(−m), Z = Raumwinkel-Mittel von min(L, S÷k(Z)) (SOLL-AUGE5B.md, 4b88242c5) ════════
out.length = 0;
say(`# AUGE 5b — unvollständige Kompensation (Exponent m), gesättigtes Raumwinkel-Mittel, Fixpunkt (roh)`);
setze(); T0 = 1650;
const S5 = 3;
function probe(sz, K_, Wr = 1920, Hr = 1080) { const Y = new Float32Array(Wr * Hr), W = new Float32Array(Wr * Hr); let i = 0, sw = 0;
  for (let py = 0; py < Hr; py++) for (let px = 0; px < Wr; px++) { const x = ((px + 0.5) / Wr * 2 - 1) * TANH * ASP, y = (1 - (py + 0.5) / Hr * 2) * TANH;
    const h = sz.treffe(K_.o, norm([K_.fw[0] + x * K_.re[0] + y * K_.up[0], K_.fw[1] + x * K_.re[1] + y * K_.up[1], K_.fw[2] + x * K_.re[2] + y * K_.up[2]]));
    Y[i] = luma(h.L); W[i] = Math.pow(1 + x * x + y * y, -1.5); sw += W[i]; i++; }
  return { Y, W, sw, omega: sw * (2 * TANH * ASP / Wr) * (2 * TANH / Hr) }; }
function roh(P_, zus) { let s = 0; for (let i = 0; i < P_.Y.length; i++) s += P_.W[i] * P_.Y[i]; return s / P_.sw + (zus ? (zus.om / P_.omega) * zus.L : 0); }
let M5 = 0.9, ZE5 = 1, KE5 = 1;
const kZ = (Z) => KE5 * Math.pow(Z / ZE5, -M5);
function schritt(P_, Z, zus) { const D = S5 / kZ(Z); let s = 0, am = 0; const Y = P_.Y, W = P_.W; for (let i = 0; i < Y.length; i++) { if (Y[i] > D) { s += W[i] * D; am += W[i]; } else s += W[i] * Y[i]; }
  let z = s / P_.sw, an = am / P_.sw; if (zus) { const fr = zus.om / P_.omega; z += fr * Math.min(zus.L, D); if (zus.L > D) an += fr; } return { z, an }; }
function fix(P_, zus) { const lauf = (z0) => { let z = z0, n = 0, n01 = null; const weg = []; for (; n < 400; n++) { const r = schritt(P_, z, zus); weg.push(r.z); if (Math.abs(Math.log2(r.z / z)) < 1e-6) { z = r.z; break; } z = r.z; } const end = z; weg.forEach((v, i) => { if (n01 == null && Math.abs(Math.log2(v / end)) <= 0.1) n01 = i + 1; }); return { z, n, n01 }; };
  const R = roh(P_, zus), o = lauf(R), u = lauf(R * 1e-9); return { Z: o.z, oben: o, unten: u, einig: Math.abs(Math.log2(o.z / u.z)) <= 0.01 && o.n < 400 && u.n < 400, roh: R, an: schritt(P_, o.z, zus).an }; }
const kR = (L, k) => Math.max(...L) * k, lum = (L, k) => bild(L, k).luma, spreiz = (L, k) => { const c = bild(L, k).c; return Math.max(...c) - Math.min(...c); };
const tau = (Z) => { const t = Math.min(1, Math.max(0, (Math.log10(Z) - Math.log10(0.005)) / (Math.log10(5) - Math.log10(0.005)))); return 0.4 + (0.1 - 0.4) * t; };
// ── alle Proben EINMAL ──
const MZ5 = wiesenSzene(true), KM5 = kamera(AUGE_W, ZIEL_W), LK5 = luma(MZ5.Lk);
const PR = {}; const zwei = (n, sz, K_) => { PR[n] = [probe(sz, K_), probe(sz, K_, 960, 540)]; };
zwei("Mittag Mess-Wiese", MZ5, KM5); const KNICK = nick(AUGE_W, ZIEL_W, 50); zwei("Mittag Sonne im Bild", MZ5, KNICK);
setze(); const HZ5 = herdSzene(); zwei("Herd nah", HZ5, kamera(AUGE_N, ZIEL_H)); zwei("Herd fern", HZ5, kamera(AUGE_F, ZIEL_H));
const PSCHW = [10, 30, 60].map((g) => [g, probe(HZ5, gier(AUGE_N, ZIEL_H, g), 960, 540)]);
const GZ5 = gasseSzene(); GS.forEach(([nm, K_]) => zwei("Gasse " + nm.split(" (")[0], GZ5, K_));
T0 = 1650; const LZ5 = lavaSzene(); zwei("Lava", LZ5, kamera(AUGE_L, ZIEL_L));
const MOND = {}; for (const E of [0.1, 0.3]) { setze({ mondE: E }); const sz = wiesenSzene(false); MOND[E] = sz; zwei(`Vollmond ${E} lx`, sz, kamera(AUGE_W, ZIEL_W)); } setze();
ZE5 = roh(PR["Mittag Mess-Wiese"][0]); KE5 = 0.22 / LK5;
say(`Anker: Z_E ${sig(ZE5)} cd/m² (Raumwinkel-Mittel der Mess-Wiese), k_E ${sig(KE5)} (Karte ${sig(LK5)} auf k·L 0,22)`);
// m aus dem Nacht-Anker: Vollmond 0,1 lx, Boden Luma 36,5
const ZMOND = roh(PR["Vollmond 0.1 lx"][0]); let kA; { let lo = 1e-3, hi = 1e4; for (let i = 0; i < 80; i++) { const mid = Math.sqrt(lo * hi); if (lum(MOND[0.1].Lw, mid) < 36.5) lo = mid; else hi = mid; } kA = Math.sqrt(lo * hi); }
const M_ANKER = Math.log(kA / KE5) / Math.log(ZE5 / ZMOND);
say(`m des Ankers: Vollmond 0,1 lx Z ${sig(ZMOND)}, Boden Luma 36,5 verlangt k ${sig(kA)} → m = ${f(M_ANKER, 4)} (Band 0,2–0,9: ${M_ANKER > 0.9 ? "DARÜBER → geklemmt auf 0,9" : M_ANKER < 0.2 ? "DARUNTER" : "im Band"})`);
const om = Math.PI * Math.pow(Math.tan((0.53 / 2) * D2R), 2);
// Flecke
const ringN = []; for (const r of [0.75, 1.25, 1.75]) for (const s of [-1, 1]) { const a = fleck(HZ5, AUGE_N, [0, 0, s * r]); if (a.n === "Gras") ringN.push([r, a.L]); }
const g4n = fleck(HZ5, AUGE_N, [0, 0, 4]).L, g14n = fleck(HZ5, AUGE_N, [0, 0, 14]).L, glut = fleck(HZ5, AUGE_N, [0, 0, 0.1]).L, g4f = fleck(HZ5, AUGE_F, [0, 0, -4]).L, g14f = fleck(HZ5, AUGE_F, [0, 0, -14]).L, r175f = fleck(HZ5, AUGE_F, [0, 0, -1.75]).L;
const mw = fleck(GZ5, AUGE_G, [6, 3.0, 1.0]), sw_ = fleck(GZ5, AUGE_G, [0, 2.0, 5.0]), lw = fleck(GZ5, AUGE_G, [0, 2.0, 1.2]);
const TDk = TD + LK.platte * (T0 - TD), LP = { Riss: planckFarbe(T0).map((c) => c * EPS_LAVA * LFCm(T0)), Decke: planckFarbe(TDk).map((c) => c * EPS_LAVA * LFCm(TDk)), "Ufer 0,05 m": fleck(LZ5, AUGE_L, [LAVA_R + 0.05, 0, 0.3]).L, "Ufer-Saum 0,25 m": fleck(LZ5, AUGE_L, [LAVA_R + 0.25, 0, 0]).L, Baumlinie: fleck(LZ5, AUGE_L, [-(LAVA_R + 20), 2.0, 0]).L, "Ufer fern": fleck(LZ5, AUGE_L, [-(LAVA_R + 15), 0, 0]).L };
const herd1 = (m) => { M5 = m; const k = kZ(fix(PR["Herd nah"][1]).Z); return { k, ring: Math.max(...ringN.map(([, L]) => kR(L, k))), g4: lum(g4n, k) }; };

function tafel(m, titel) { M5 = m; say(`\n## ${titel} — m = ${f(m, 4)}`);
  const TAF = [], zeile = (nr, name, Z, k, zahl, ok) => { TAF.push({ nr, name, ok }); say(`| ${nr} | ${name} | ${sig(Z)} | ${sig(k)} | ${zahl} | ${ok ? "HÄLT" : "**FÄLLT**"} |`); };
  const FX = {}, STAB = []; for (const n in PR) { const zus = n === "Mittag Sonne im Bild" ? { om, L: 1.6e9 } : null; FX[n] = fix(PR[n][0], zus); const b = fix(PR[n][1], zus); STAB.push([n, Math.abs(Math.log2(FX[n].Z / b.Z))]); }
  const fx = (F) => `Deckel bei ${f(100 * F.an, 2)} % · roh ${sig(F.roh)} · Fixpunkt ${F.oben.n01}/${F.unten.n01} Schritte bis ±0,1 EV`;
  say(`| # | Zeile | Z (cd/m²) | k | Zahl | Urteil |\n|---|---|---|---|---|---|`);
  { const Fn = FX["Herd nah"], Ff = FX["Herd fern"], kn = kZ(Fn.Z), kf = kZ(Ff.Z), rmax = Math.max(...ringN.map(([, L]) => kR(L, kn)));
    zeile(1, "Herd nah 3 m", Fn.Z, kn, `Ring k·L ${ringN.map(([r, L]) => f(r, 2) + " m " + f(kR(L, kn), 3)).filter((v, i, a) => a.indexOf(v) === i).join(" · ")} · Gras 0,75 m ${bild(ringN[0][1], kn).c.join("/")} · 1,75 m ${bild(ringN[ringN.length - 1][1], kn).c.join("/")} · 4 m ${bild(g4n, kn).c.join("/")} Luma ${f(lum(g4n, kn), 1)} · 14 m Luma ${f(lum(g14n, kn), 1)} · Glutbett ${bild(glut, kn).c.join("/")} · ${fx(Fn)}`, rmax <= 3 && lum(g4n, kn) >= 30);
    const b4 = bild(g4f, kf);
    zeile(2, "Herd fern 25 m", Ff.Z, kf, `Gras 4 m ${b4.c.join("/")} Luma ${f(b4.luma, 1)} (Spreizung ${spreiz(g4f, kf)} Code, Oklab-h ${f(b4.h, 1)}° gegen ein ${f(oklabH(g4f).h, 1)}°) · Ring 1,75 m ${bild(r175f, kf).c.join("/")} · Gras 14 m Luma ${f(lum(g14f, kf), 1)} · k_fern ÷ k_nah ${f(kf / kn, 2)} · ${fx(Ff)}`, spreiz(g4f, kf) >= 2 && Math.abs(b4.h - oklabH(g4f).h) <= 2 && kf / kn >= 2);
    var KN_ = kn, ZN_ = Fn.Z; }
  ["Gasse r1-Sicht", "Gasse die Gasse entlang"].forEach((n, i) => { const F = FX[n], k = kZ(F.Z), d1 = Math.abs(lum(mw.L, k) - lum(sw_.L, k)), d2 = Math.abs(lum(lw.L, k) - lum(sw_.L, k)), ts = tviS(F.Z * SP(4100));
    zeile(3 + i, n, F.Z, k, `Mondwand ${bild(mw.L, k).c.join("/")} Luma ${f(lum(mw.L, k), 1)} · Laternen-Wand ${bild(lw.L, k).c.join("/")} Luma ${f(lum(lw.L, k), 1)} (k·L ${f(kR(lw.L, k), 3)}) · Schatten Luma ${f(lum(sw_.L, k), 1)} · Paare Δ ${f(d1, 1)} / ${f(d2, 1)} Code · Stäbchen-Schwelle ×${f(Math.abs(mw.Ls - sw_.Ls) / ts, 2)} / ×${f(Math.abs(lw.Ls - sw_.Ls) / ts, 2)} · ${fx(F)}`, lum(mw.L, k) >= 8 && d1 >= 2 && d2 >= 2 && kR(lw.L, k) <= 3 && kR(mw.L, k) <= 3); });
  { const F = FX.Lava, k = kZ(F.Z), N = Object.keys(LP); let umk = 0; for (let i = 0; i < N.length; i++) for (let j = i + 1; j < N.length; j++) if ((luma(LP[N[i]]) - luma(LP[N[j]])) * (bild(LP[N[i]], k).Yaus - bild(LP[N[j]], k).Yaus) < 0) umk++;
    const d = Math.abs(lum(LP.Decke, k) - lum(LP["Ufer-Saum 0,25 m"], k));
    zeile(5, "Lava nah 3 m", F.Z, k, `${N.map((n) => n + " " + bild(LP[n], k).c.join("/") + " (" + f(lum(LP[n], k), 1) + ")").join(" · ")} · Decke ↔ Saum Δ ${f(d, 1)} Code · Umkehrungen ${umk} von 15 · ${fx(F)}`, d >= 2 && umk === 0 && lum(LP["Ufer 0,05 m"], k) >= 60); }
  { const F = FX["Mittag Mess-Wiese"], b = bild(MZ5.Lk, kZ(F.Z)); zeile(6, "Mittag, Mess-Wiese", F.Z, kZ(F.Z), `Karte ${b.c.join("/")} Luma ${f(b.luma, 1)} · ${fx(F)}`, Math.abs(b.luma - 118) <= 2);
    const Fe = FX["Mittag Sonne im Bild"], e = ev(kZ(Fe.Z), kZ(F.Z)), F0 = fix(PR["Mittag Sonne im Bild"][0]);
    zeile(7, "Mittag, Sonne bei 25,6° im Bild, echte Scheibe", Fe.Z, kZ(Fe.Z), `ohne Scheibe Z ${sig(F0.Z)} · mit echter Scheibe Z ${sig(Fe.Z)} (roh ${sig(Fe.roh)}; die Scheibe zählt mit dem Deckel ${sig(S5 / kZ(Fe.Z))} cd/m²) · Karte ${f(e, 2)} EV, Luma ${f(lum(MZ5.Lk, kZ(Fe.Z)), 1)} · ${fx(Fe)}`, e >= -1); }
  [0.1, 0.3].forEach((E, i) => { const F = FX[`Vollmond ${E} lx`], sz = MOND[E], k = kZ(F.Z), d = Math.abs(lum(sz.Lb, k) - lum(sz.Lh, k));
    zeile(8 + i, `Vollmond-Wiese ${E} lx`, F.Z, k, `Boden ${bild(sz.Lw, k).c.join("/")} Luma ${f(lum(sz.Lw, k), 1)} · Baumlinie ${f(lum(sz.Lb, k), 1)} · Himmel ${f(lum(sz.Lh, k), 1)} · Δ ${f(d, 1)} Code · ${fx(F)}`, lum(sz.Lw, k) >= 12 && d >= 2); });
  { const SW = [{ g: 0, Z: fix(PR["Herd nah"][1]).Z }].concat(PSCHW.map(([g, P_]) => ({ g, Z: fix(P_).Z }))); SW.forEach((s) => (s.k = kZ(s.Z)));
    const J = ev(SW[3].k, SW[0].k), t = Math.abs(J) <= 0.3 ? 0 : tau(SW[3].Z) * Math.log(Math.abs(J) / 0.3);
    zeile(10, "Schwenk 60° vom Feuer weg", SW[3].Z, SW[3].k, `${SW.map((s) => s.g + "°: Z " + sig(s.Z) + " k " + sig(s.k)).join(" · ")} · Sprung ${f(J, 2)} EV · τ(Z_Ziel) ${f(tau(SW[3].Z), 3)} s → ${f(t, 2)} s bis 0,3 EV`, t <= 1);
    zeile(11, "STABILITÄT (960 × 540 ↔ 1 920 × 1 080)", NaN, NaN, STAB.map(([n, d]) => n + " " + f(d, 3)).join(" · ") + " EV in Z", Math.max(...STAB.map((s) => s[1])) <= 0.2);
    const m1 = ev(SW[2].k, SW[0].k), m2 = ev(SW[3].k, SW[2].k);
    zeile(12, "MONOTONIE (Herd nah)", NaN, NaN, `0→10 ${f(ev(SW[1].k, SW[0].k), 3)} EV · 0→30 ${f(m1, 3)} EV · 30→60 ${f(m2, 3)} EV`, m1 >= -0.02 && m2 >= -0.02); }
  zeile(13, "FIXPUNKT (oben = unten)", NaN, NaN, Object.keys(FX).map((n) => n + " " + f(Math.abs(Math.log2(FX[n].oben.z / FX[n].unten.z)), 4) + " EV (" + FX[n].oben.n + "/" + FX[n].unten.n + ")").join(" · "), Object.values(FX).every((F) => F.einig));
  const andere = TAF.filter((t) => !t.ok).length;
  zeile(14, "das Band von m", NaN, NaN, `m des Ankers ${f(M_ANKER, 4)}, gerechnet mit ${f(m, 4)}`, !((M_ANKER > 0.9 || M_ANKER < 0.2) && andere > 0 && m <= 0.9));
  const hal = TAF.filter((t) => t.ok).length;
  say(`URTEIL (m ${f(m, 4)}): ${hal} von ${TAF.length} Zeilen halten${hal < TAF.length ? " — es fallen: " + TAF.filter((t) => !t.ok).map((t) => t.nr + " " + t.name).join(" · ") : ""}.`);
}
tafel(Math.min(0.9, Math.max(0.2, M_ANKER)), "DIE TAFEL (m im Band)");
if (M_ANKER > 0.9 || M_ANKER < 0.2) tafel(M_ANKER, "zum Vergleich: m des Ankers (außerhalb des Bands, ohne Soll)");
say(`\n## Zeile 1 über m (Herd nah: Ring hellster Kanal k·L ≤ 3 UND Gras 4 m ≥ Luma 30)`);
say(`| m | k | Ring k·L | Gras 4 m Luma | hält |\n|---|---|---|---|---|`);
for (const m of [0.2, 0.4, 0.6, 0.7, 0.8, 0.85, 0.9, 0.9418, 1.0]) { const h = herd1(m); say(`| ${f(m, 3)} | ${sig(h.k)} | ${f(h.ring, 3)} | ${f(h.g4, 1)} | ${h.ring <= 3 && h.g4 >= 30 ? "ja" : "nein"} |`); }
fs.writeFileSync(__dirname + "/auge5b.roh.out.txt", out.join("\n") + "\n");
