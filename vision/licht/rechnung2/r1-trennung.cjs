// RECHNUNG 1 — DIE TRENNUNG diffus/leuchtend AUS DEM DATUM DER QUELLE. Nur rechnen. Ausgabe r1-trennung.out.txt.
// Ein kleiner Strahl-Werfer je Sicht (Szenen-Ziel 1 440 × 810 = Skala 0,75 bei 1080p, vFOV 75° = KAM_FOV_GRAD), die wahre
// Leuchtdichte je Pixel (mit dem Schatten des Steinrings), und vier Wege, die hellste DIFFUSE Leuchtdichte zu schätzen.
// Die Kappe folgt der Kurve K1 (kurve.js `kGrenze`): k_c = min über die diffusen Pixel von min(0,8/Y, 1/R + 0,04/Y).
// Daten: fachwerk-core.js (2ce8a033d) BRENNER, LICHT_GESETZ, STRAHLER, leuchtdichte, kopfSicht, AUS_MASS feuerstelle/wandlaterne;
// stamm/siedlung-wege.js LAVA_KRUSTE, _lavaLeucht, _lavaKruste; gelaende-core.js LAVA; schmiede-core.js stein tSchmelz 1500.
"use strict";
const fs = require("fs");
const K = require("./kurve.js");
const out = []; const say = (s = "") => { out.push(s); console.log(s); };
const f = (v, n = 2) => (v == null || !isFinite(v) ? "—" : (+v).toFixed(n));
const sig = (v) => (v == null || !isFinite(v) ? "—" : Math.abs(v) >= 1e4 || (Math.abs(v) < 1e-2 && v !== 0) ? v.toExponential(2) : +v.toPrecision(3) + "");
// ── Physik (wie spike.cjs / widerleger: fachwerk `leuchtdichte` wörtlich, Planck-Ort Wyman, planckFarbe mit Weiß gleicher Luma) ──
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
// ── Daten ──
const ATMO = [0.1003, 0.1385, 0.0449], LAUB = [0.0906, 0.2034, 0.0447], HAUS = [0.2758, 0.1316, 0.0889], FELS = [0.2641, 0.2377, 0.1761];
const EISEN = [0.05, 0.05, 0.05]; // Haube/Boden des Kopfs (G: geschwärztes Eisen)
const RHO_MAX = 0.8196; // albedo-tafel tor R (Entscheid)
const HALM = { quer: 0.89, hoch: 0.34 };
const MOND_E = 0.3965, MOND_H = (74.2 * Math.PI) / 180, MOND_EH = MOND_E * Math.sin(MOND_H);
const L_HIMMEL = 6.8e-3;
const C_MOND = planckFarbe(4100), C_HIMMEL = planckFarbe(12000), C_FEUER = planckFarbe(2000), C_DOCHT = planckFarbe(1850);
// Herd: I = ε·L(2000 K)·π·0,38² (FC:6527 + `strahler`), Kern 0,38, Licht 0,35 m über dem Bett; Flamme 10 000 cd/m² (cdM2);
// Feuerstelle AUS_MASS (G = 1): Ring innen rt 0,58, außen ra 0,69, Höhe hR 0,13.
const I_HERD = 0.0012 * LFCm(2000) * Math.PI * 0.38 * 0.38, K2_HERD = 0.38 * 0.38, Q_HERD = [0, 0.35, 0];
const BETT_R = 0.38, RING_I = 0.58, RING_A = 0.69, RING_H = 0.13, FLAMME_R = 0.05, FLAMME_Y = [0.2, 0.45], L_FLAMME = 10000;
// Wandlaterne (K66-2) mit dem Brenner docht: 1 cd, Flamme 0,04 m → Kern 0,02; Kopf kb 0,22, kh 0,34, hb 0,17, Licht 2,8 m, Arm 0,4 m
const DOCHT_I = 1, DOCHT_K2 = 0.02 * 0.02, KOPF = [0.17 / 0.02, 0.17 / 0.02, (0.22 + 0.04) / 2 / 0.02, (-0.17 + 0.03) / 0.02];
function kopfSicht(kopf, a, h) { const st = h / Math.max(1e-4, a); return Math.max(0, Math.min(1, (Math.min(1, kopf[1] - kopf[0] * st) - Math.max(-1, kopf[3] - kopf[2] * st)) / 2)); }
// Lava: die Spanne [798, 1500 + 150], LAVA_KRUSTE σ 0,25 · offen 0,17 · platte 0,62 · randDicke [0,5, 1]; ε 0,95; Ausbruch w = 1
const LK = { sigma: 0.25, offen: 0.17, platte: 0.62, rand: [0.5, 1] }, TD = 798, T0 = 1650, LAVA_R = 7.51, EPS_LAVA = 0.95;
function lavaLeucht(w) { let s = 0, g = 0, sc = [0, 0, 0]; for (let i = 0; i < 128; i++) { const n = ((i + 0.5) / 128) * 4 * LK.sigma, p = Math.exp(-0.5 * (n / LK.sigma) ** 2), e = Math.min(1, n / Math.max(1e-9, w * LK.offen)), riss = 1 - e * e * (3 - 2 * e);
  const Ts = TD + w * (LK.platte + (1 - LK.platte) * riss) * (T0 - TD); const L = LFCm(Ts) * EPS_LAVA; s += p * L; g += p; const c = planckFarbe(Ts); sc = sc.map((v, j) => v + p * L * c[j]); } return { L: s / g, farbe: sc.map((v) => v / s) }; }
const LAVA = lavaLeucht(1);

// ── Kamera ──
const W = 1440, H = 810, TANH = Math.tan((37.5 * Math.PI) / 180), ASP = W / H;
const sub = (a, b) => [a[0] - b[0], a[1] - b[1], a[2] - b[2]], dot = (a, b) => a[0] * b[0] + a[1] * b[1] + a[2] * b[2], norm = (a) => { const l = Math.sqrt(a[0] * a[0] + a[1] * a[1] + a[2] * a[2]); return [a[0] / l, a[1] / l, a[2] / l]; }, cross = (a, b) => [a[1] * b[2] - a[2] * b[1], a[2] * b[0] - a[0] * b[2], a[0] * b[1] - a[1] * b[0]];
function kamera(auge, ziel) { const fw = norm(sub(ziel, auge)), re = norm(cross(fw, [0, 1, 0])), up = cross(re, fw); return { o: auge, fw, re, up }; }
function strahl(K_, px, py) { const x = ((px + 0.5) / W * 2 - 1) * TANH * ASP, y = (1 - (py + 0.5) / H * 2) * TANH; return norm([K_.fw[0] + x * K_.re[0] + y * K_.up[0], K_.fw[1] + x * K_.re[1] + y * K_.up[1], K_.fw[2] + x * K_.re[2] + y * K_.up[2]]); }
function imBild(K_, p) { const v = sub(p, K_.o), z = dot(v, K_.fw); if (z <= 0.05) return false; return Math.abs(dot(v, K_.re) / z) <= TANH * ASP && Math.abs(dot(v, K_.up) / z) <= TANH; }
function pixelGroesse(K_, p) { const z = dot(sub(p, K_.o), K_.fw); return z > 0 ? (2 * z * TANH) / H : Infinity; } // m je Pixel
// Zylinder um die y-Achse durch (cx, cz): nächster Schnitt t > eps mit y in [y0, y1]
function zyl(o, d, cx, cz, r, y0, y1) { const ox = o[0] - cx, oz = o[2] - cz, a = d[0] * d[0] + d[2] * d[2], b = 2 * (ox * d[0] + oz * d[2]), c = ox * ox + oz * oz - r * r, D = b * b - 4 * a * c; if (D < 0 || a < 1e-12) return Infinity; const s = Math.sqrt(D);
  let t = (-b - s) / (2 * a); if (t > 1e-6) { const y = o[1] + t * d[1]; if (y >= y0 && y <= y1) return t; } t = (-b + s) / (2 * a); if (t > 1e-6) { const y = o[1] + t * d[1]; if (y >= y0 && y <= y1) return t; } return Infinity; }
function ebene(o, d, y) { if (Math.abs(d[1]) < 1e-12) return Infinity; const t = (y - o[1]) / d[1]; return t > 1e-6 ? t : Infinity; }
function kiste(o, d, b0, b1) { let tn = -Infinity, tf = Infinity, ax = -1; for (let i = 0; i < 3; i++) { if (Math.abs(d[i]) < 1e-12) { if (o[i] < b0[i] || o[i] > b1[i]) return [Infinity, -1]; continue; } let t1 = (b0[i] - o[i]) / d[i], t2 = (b1[i] - o[i]) / d[i]; if (t1 > t2) [t1, t2] = [t2, t1]; if (t1 > tn) { tn = t1; ax = i; } if (t2 < tf) tf = t2; } return tn <= tf && tn > 1e-6 ? [tn, ax] : [Infinity, -1]; }

// ══ SZENEN: treffe(o, d) → { typ: 'himmel'|'diffus'|'quelle', L (wahr, mit Schatten), Eg (obere Schranke der Bestrahlung, ohne
// Schatten: Σ I/(d²+k²) der Plätze + E⊥ Mond + π L_Himmel), p, quelleGeom (B: der Strahl schneidet die Geometrie einer Pool-Quelle),
// bit (C: das Material trägt das Strahler-Bit), n: Name des Flecks }
const Eh = MOND_EH, EmHalm = MOND_E * (Math.sin(MOND_H) * HALM.hoch + Math.cos(MOND_H) * (2 / Math.PI) * HALM.quer);
const MOND_DIR = [Math.cos(MOND_H), Math.sin(MOND_H), 0];
function herdSzene(opt = {}) {
  const T_GLUT = opt.tGlut || 1100, L_GLUT = 0.9 * LFCm(T_GLUT), C_GLUT = planckFarbe(T_GLUT), BILD_R = opt.bildR || BETT_R, schatten = opt.schatten !== false;
  const Eq = (p) => { const v = sub(Q_HERD, p), d2 = dot(v, v); return { F: I_HERD / (d2 + K2_HERD), l: v.map((x) => x / Math.sqrt(d2)) }; };
  const Eg = (p) => I_HERD / (dot(sub(Q_HERD, p), sub(Q_HERD, p)) + K2_HERD) + MOND_E + Math.PI * L_HIMMEL;
  const diff = (rho, Ef, Em, n) => { const hh = Math.PI * L_HIMMEL * 0.5; return { typ: "diffus", L: [(rho[0] * (C_FEUER[0] * Ef + C_MOND[0] * Em + C_HIMMEL[0] * hh)) / Math.PI, (rho[1] * (C_FEUER[1] * Ef + C_MOND[1] * Em + C_HIMMEL[1] * hh)) / Math.PI, (rho[2] * (C_FEUER[2] * Ef + C_MOND[2] * Em + C_HIMMEL[2] * hh)) / Math.PI], n }; };
  return {
    name: "herd", quellen: [{ art: "punkt", q: Q_HERD, I: I_HERD, k2: K2_HERD, c: C_FEUER, eigenR: BETT_R, nah: [0, 0, 0] }],
    treffe(o, d) {
      let t = Infinity, was = null;
      const tf = zyl(o, d, 0, 0, FLAMME_R, FLAMME_Y[0], FLAMME_Y[1]); if (tf < t) { t = tf; was = "flamme"; }
      const ta = zyl(o, d, 0, 0, RING_A, 0, RING_H); if (ta < t) { t = ta; was = "ring-aussen"; }
      const ti = zyl(o, d, 0, 0, RING_I, 0, RING_H); if (ti < t) { t = ti; was = "ring-innen"; }
      const tt = ebene(o, d, RING_H); if (tt < t) { const px_ = o[0] + tt * d[0], pz_ = o[2] + tt * d[2], r = Math.sqrt(px_ * px_ + pz_ * pz_); if (r >= RING_I && r <= RING_A) { t = tt; was = "ring-oben"; } }
      const tg = ebene(o, d, 0); if (tg < t) { t = tg; was = "boden"; }
      // B: schneidet der Strahl die Flamme (Zylinder) oder liegt der Punkt im Bett (Scheibe des Datums, r ≤ 0,38)?
      const p = t < Infinity ? [o[0] + t * d[0], o[1] + t * d[1], o[2] + t * d[2]] : null;
      if (!p || t > 5000) return { typ: "himmel", L: C_HIMMEL.map((c) => c * L_HIMMEL), Eg: 0, n: "Himmel" };
      const r = Math.sqrt(p[0] * p[0] + p[2] * p[2]); const geomB = was === "flamme" || (was === "boden" && r <= BETT_R + 1e-9);
      let h;
      if (was === "flamme") h = { typ: "quelle", L: C_FEUER.map((c) => c * L_FLAMME), n: "Flamme" };
      else if (was === "boden" && r <= BILD_R) { const e = Eq(p); h = { typ: "quelle", L: [0, 1, 2].map((j) => C_GLUT[j] * L_GLUT + (0.05 * C_FEUER[j] * e.F * e.l[1]) / Math.PI), n: "Glutbett" }; }
      else if (was === "boden" && r < RING_I) { const e = Eq(p); h = diff(ATMO, e.F * Math.max(0, e.l[1]), Eh, "Asche im Ring"); }
      else if (was === "boden") { // Gras: Halm-Volumen (SM:2456-2463) bei 0,2 m; Schatten des Rings: Anteil des Halms 0…0,2 m über der Schattenlinie
        const v0 = -p[0], v1 = 0.15, v2 = -p[2], d2 = v0 * v0 + v1 * v1 + v2 * v2, F = I_HERD / (d2 + K2_HERD), dd = Math.sqrt(d2);
        const Ef0 = (Math.sqrt(v0 * v0 + v2 * v2) / dd) * F * (2 / Math.PI) * HALM.quer + (v1 / dd) * F * HALM.hoch;
        const ymin = 0.35 - (0.35 - RING_H) * (r / RING_A); const lit = schatten ? Math.max(0, Math.min(1, (0.2 - ymin) / 0.2)) : 1;
        h = diff(ATMO, Ef0 * lit, EmHalm, "Gras"); h.r = r; }
      else { const n = was === "ring-aussen" ? norm([p[0], 0, p[2]]) : was === "ring-innen" ? norm([-p[0], 0, -p[2]]) : [0, 1, 0];
        const e = Eq(p); h = diff(FELS, e.F * Math.max(0, dot(n, e.l)), MOND_E * Math.max(0, dot(n, MOND_DIR)), was === "ring-innen" ? "Ring innen" : was === "ring-oben" ? "Ring oben" : "Ring außen"); }
      h.p = p; h.Eg = Eg(p); h.geomB = geomB; h.bit = h.typ === "quelle"; return h;
    },
  };
}
// Lava: die Decke als Scheibe (Lambert) mit dem Mittel des Spiel-Gesetzes; ihr Bild je Pixel aus dem Feld der Schollen
const LAVA_TAB = (() => { // Bestrahlung am Halm (0,2 m) im Abstand s vom Rand, am senkrechten Laub (zur Mitte) und |F| (Schranke)
  // Die Scheibe (Lambert, L) exakt in ρ: um den Fußpunkt je Richtung ψ die Sehne [ρ1, ρ2]; ∫ρ/(ρ²+h²)² und ∫ρ²/(ρ²+h²)² geschlossen.
  const R = LAVA_R, L = LAVA.L;
  const F = (D, h) => { let Fx = 0, Fy = 0; const psiM = D > R ? Math.asin(R / D) : Math.PI / 2, n = 4000, dp = (2 * psiM) / n;
    const G1 = (r) => -1 / (2 * (r * r + h * h)), G2 = (r) => Math.atan(r / h) / (2 * h) - r / (2 * (r * r + h * h));
    for (let i = 0; i < n; i++) { const ps = -psiM + (i + 0.5) * dp, c = Math.cos(ps), sn = Math.sin(ps), w = Math.sqrt(Math.max(0, R * R - D * D * sn * sn)); const r1 = Math.max(0, D * c - w), r2 = D * c + w; if (r2 <= r1) continue;
      Fx += L * h * c * (G2(r2) - G2(r1)) * dp; Fy += L * h * h * (G1(r2) - G1(r1)) * dp; }
    return { zurMitte: Fx, ab: Fy }; };
  const tab = []; for (let s = 0; s <= 30.001; s += 0.05) { const q = F(R + s, 0.2); tab.push({ s, halm: q.zurMitte * (2 / Math.PI) * HALM.quer + q.ab * HALM.hoch, betrag: Math.hypot(q.zurMitte, q.ab) }); }
  let wand = 0, wandMax = 0; for (let y = 0.25; y <= 6; y += 0.5) { const q = F(R + 20, y); wand += q.zurMitte / 12; wandMax = Math.max(wandMax, Math.hypot(q.zurMitte, q.ab)); }
  return { tab, wand, wandMax, randSenkrecht: F(R + 1e-4, 1e-3).zurMitte };
})();
const lavaTab = (s) => { const i = Math.max(0, Math.min(LAVA_TAB.tab.length - 2, Math.floor(s / 0.05))), u = Math.max(0, Math.min(1, s / 0.05 - i)); const a = LAVA_TAB.tab[i], b = LAVA_TAB.tab[i + 1]; return { halm: a.halm + u * (b.halm - a.halm), betrag: a.betrag + u * (b.betrag - a.betrag) }; };
function hash2(x, z) { const s = Math.sin(x * 127.1 + z * 311.7) * 43758.5453; return s - Math.floor(s); }
function feldN(x, z) { // das Feld der Schollen, λ ≈ 1,4 m, auf σ 0,25 gestreckt (Wert-Rauschen, G)
  const u = x / 1.4, v = z / 1.4, i = Math.floor(u), j = Math.floor(v), fu = u - i, fv = v - j, sm = (t) => t * t * (3 - 2 * t);
  const a = hash2(i, j), b = hash2(i + 1, j), c = hash2(i, j + 1), e = hash2(i + 1, j + 1); const w = a + (b - a) * sm(fu) + (c - a) * sm(fv) + (a - b - c + e) * sm(fu) * sm(fv); return (w - 0.5) * 0.25 / 0.2; }
function lavaSzene() {
  const C_L = LAVA.farbe;
  return {
    name: "lava", quellen: [{ art: "scheibe", R: LAVA_R, L: LAVA.L, c: C_L, Erand: LAVA_TAB.randSenkrecht }],
    treffe(o, d) {
      let t = Infinity, was = null;
      const tw = d[0] > 1e-9 ? (LAVA_R + 20 - o[0]) / d[0] : Infinity; if (tw > 0 && tw < t) { const y = o[1] + tw * d[1]; if (y >= 0 && y <= 6) { t = tw; was = "laub"; } }
      const tg = ebene(o, d, 0); if (tg < t) { t = tg; was = "boden"; }
      if (t === Infinity) return { typ: "himmel", L: C_HIMMEL.map((c) => c * L_HIMMEL), Eg: 0, n: "Himmel" };
      const p = [o[0] + t * d[0], o[1] + t * d[1], o[2] + t * d[2]], r = Math.sqrt(p[0] * p[0] + p[2] * p[2]); let h;
      if (was === "boden" && r <= LAVA_R) { const m = Math.min(1, (LAVA_R - r) / 1.0), rand = (() => { const q = Math.max(0, Math.min(1, (m - LK.rand[0]) / (LK.rand[1] - LK.rand[0]))); return q * q * (3 - 2 * q); })();
        const n = Math.abs(feldN(p[0], p[2])), e = Math.min(1, n / Math.max(1e-9, LK.offen * rand)), riss = rand > 0 ? 1 - e * e * (3 - 2 * e) : 0;
        const Ts = TD + (rand * LK.platte + (1 - rand * LK.platte) * riss) * (T0 - TD), Ls = Ts > TD + 1 ? EPS_LAVA * LFCm(Ts) : 0, c = planckFarbe(Math.max(1000, Ts));
        h = { typ: "quelle", L: c.map((x) => x * Ls + (FELS[0] * MOND_EH) / Math.PI), n: riss > 0.5 ? "Lava Riss" : rand > 0 ? "Lava Scholle" : "Lava Saum (Rand)" }; h.Eg = MOND_E + Math.PI * L_HIMMEL; }
      else if (was === "boden") { const s = r - LAVA_R, E = lavaTab(s); h = { typ: "diffus", L: [0, 1, 2].map((j) => (ATMO[j] * (C_L[j] * E.halm + C_MOND[j] * EmHalm)) / Math.PI), n: "Ufer" }; h.r = s; h.Eg = E.betrag + MOND_E + Math.PI * L_HIMMEL; }
      else { h = { typ: "diffus", L: [0, 1, 2].map((j) => (LAUB[j] * (C_L[j] * LAVA_TAB.wand + C_MOND[j] * MOND_E * 0.3)) / Math.PI), n: "Baumlinie 20 m" }; h.Eg = LAVA_TAB.wandMax + MOND_E + Math.PI * L_HIMMEL; } // die Schranke über die Höhe der Wand (Laub 0–6 m)
      h.p = p; h.geomB = was === "boden" && r <= LAVA_R; h.bit = h.typ === "quelle"; return h;
    },
  };
}
// Gasse: Wand x = 0 (Laternen bei z = 0 und 10, Kopf 2,8 m, Arm 0,4 m) und Wand x = 6 (zum Mond), Häuser 8 m hoch; Fenster je 4 m
const LAT = [[0.4, 2.8, 0], [0.4, 2.8, 10]], GLAS_A = 0.22 * 0.34, L_GLAS = DOCHT_I / GLAS_A, L_FENSTER = (0.8 * 0.5 * (DOCHT_I / 4)) / Math.PI;
const MOND_GASSE = [-Math.cos(MOND_H), Math.sin(MOND_H), 0];
function gasseSzene() {
  const Elat = (p, n) => { let E = 0; for (const q of LAT) { const v = sub(q, p), d2 = dot(v, v), dd = Math.sqrt(d2), a = Math.hypot(p[0] - q[0], p[2] - q[2]), hh = p[1] - q[1]; const ks = kopfSicht(KOPF, a, hh); E += (DOCHT_I * ks / (d2 + DOCHT_K2)) * (n ? Math.max(0, dot(n, v) / dd) : 1); } return E; };
  const Ew6 = MOND_E * Math.max(0, dot([-1, 0, 0], MOND_GASSE)); const amb0 = Math.PI * L_HIMMEL * 0.25 + 0.16 * Ew6 * 0.3, ambB = Math.PI * L_HIMMEL * 0.35 + 0.16 * Ew6 * 0.2;
  const Eg = (p) => Elat(p, null) + MOND_E + Math.PI * L_HIMMEL;
  const diff = (rho, El, Em, n) => ({ typ: "diffus", L: [0, 1, 2].map((j) => (rho[j] * (C_DOCHT[j] * El + C_MOND[j] * Em)) / Math.PI), n });
  const fenster = (x, y, z) => { if (y < 1.2 || y > 2.4) return false; const zz = x < 3 ? z - 4 : z - 2; const m = ((zz % 4) + 4) % 4; return m < 0.8 && z > -20; };
  return {
    name: "gasse", quellen: LAT.map((q) => ({ art: "lampe", q, I: DOCHT_I, k2: DOCHT_K2, c: C_DOCHT, wandM: 0.4 })),
    treffe(o, d) {
      let t = Infinity, was = null, ax = -1;
      for (let i = 0; i < LAT.length; i++) { const q = LAT[i]; const [tg, a1] = kiste(o, d, [q[0] - 0.11, q[1] - 0.17, q[2] - 0.11], [q[0] + 0.11, q[1] + 0.17, q[2] + 0.11]); if (tg < t) { t = tg; was = "glas" + i; }
        const [th] = kiste(o, d, [q[0] - 0.17, q[1] + 0.17, q[2] - 0.17], [q[0] + 0.17, q[1] + 0.25, q[2] + 0.17]); if (th < t) { t = th; was = "haube"; }
        const [tb] = kiste(o, d, [q[0] - 0.13, q[1] - 0.2, q[2] - 0.13], [q[0] + 0.13, q[1] - 0.17, q[2] + 0.13]); if (tb < t) { t = tb; was = "kopfboden"; } }
      if (d[0] < -1e-9) { const tw = (0 - o[0]) / d[0]; if (tw > 0 && tw < t && o[1] + tw * d[1] <= 8) { t = tw; was = "wand0"; } }
      if (d[0] > 1e-9) { const tw = (6 - o[0]) / d[0]; if (tw > 0 && tw < t && o[1] + tw * d[1] <= 8) { t = tw; was = "wand6"; } }
      const tg = ebene(o, d, 0); if (tg < t) { t = tg; was = "pflaster"; }
      if (t === Infinity) return { typ: "himmel", L: C_HIMMEL.map((c) => c * L_HIMMEL), Eg: 0, n: "Himmel" };
      const p = [o[0] + t * d[0], o[1] + t * d[1], o[2] + t * d[2]]; let h;
      if (was.startsWith("glas")) h = { typ: "quelle", L: C_DOCHT.map((c) => c * L_GLAS), n: "Kopf-Glas" };
      else if (was === "haube" || was === "kopfboden") { const n = was === "haube" ? [0, 1, 0] : [0, -1, 0]; h = diff(EISEN, Elat(p, n), MOND_E * Math.max(0, dot(n, MOND_GASSE)), was === "haube" ? "Haube" : "Kopf-Boden"); }
      else if (was === "wand0") { if (fenster(0, p[1], p[2])) h = { typ: "quelle", L: C_DOCHT.map((c) => c * L_FENSTER), n: "Fenster" }; else h = diff(HAUS, Elat(p, [1, 0, 0]), amb0, Math.abs(p[1] - 2.8) < 0.5 && Math.min(Math.abs(p[2]), Math.abs(p[2] - 10)) < 0.5 ? "Wand hinter dem Kopf" : "Wand (Laternen-Seite)"); }
      else if (was === "wand6") { if (fenster(6, p[1], p[2])) h = { typ: "quelle", L: C_DOCHT.map((c) => c * L_FENSTER), n: "Fenster" }; else h = diff(HAUS, Elat(p, [-1, 0, 0]), Ew6 + amb0, "Mondwand"); }
      else { const imSchatten = p[0] < 8 / Math.tan(MOND_H); h = diff(FELS, Elat(p, [0, 1, 0]), imSchatten ? ambB : MOND_EH + ambB, imSchatten ? "Pflaster im Mondschatten" : "Pflaster im Mond"); }
      h.p = p; h.Eg = Eg(p); h.geomB = was.startsWith("glas"); h.bit = h.typ === "quelle"; return h;
    },
  };
}

// ══ DAS AUGE: Schlüssel (Entscheid §1.2, κ 1,822 wie spike.cjs) und die Kappe je Weg ══
const L_MOND_KARTE = (0.18 * MOND_E) / Math.PI, KAPPA = 1.822;
function schluesselC(LK_) { const L10 = 634.8, LK0 = 6713, cN = -2.17, st = 0.25, c10 = st * Math.log2(L10 / LK0); if (LK_ >= L10) return st * Math.log2(LK_ / LK0); if (LK_ <= L_MOND_KARTE) return cN; const t = (Math.log2(LK_) - Math.log2(L_MOND_KARTE)) / (Math.log2(L10) - Math.log2(L_MOND_KARTE)); return cN + t * (c10 - cN); }
const kA = (La) => { const LK_ = KAPPA * La; return (0.22 * 2 ** schluesselC(LK_)) / Math.max(LK_, L_MOND_KARTE); };
// (A) rein analytisch: je Quelle der Sicht der hellste erreichbare diffuse Punkt außerhalb ihrer eigenen Fläche (Geometrie des Datums),
//     ρ_max, Normale zur Quelle, ohne Schatten; dazu Mond + Himmel als ρ_max-Fläche zum Mond. Eine Quelle zählt, wenn ihr naher
//     Punkt im Bildfeld liegt und mindestens ½ Pixel groß ist.
function wegA(sz, K_) {
  let best = Infinity, wer = "Mond";
  const mondL = [0, 1, 2].map((j) => (RHO_MAX * (C_MOND[j] * MOND_E + C_HIMMEL[j] * Math.PI * L_HIMMEL)) / Math.PI); best = K.kGrenze(mondL);
  for (const q of sz.quellen) {
    let E = 0, punkte = [], c = q.c, groesse = 0;
    if (q.art === "punkt") { const rim = Math.hypot(q.eigenR, q.q[1]); E = q.I / (rim * rim + q.k2); for (let a = 0; a < 16; a++) punkte.push([q.eigenR * Math.cos((a * Math.PI) / 8), 0, q.eigenR * Math.sin((a * Math.PI) / 8)]); groesse = q.eigenR; }
    else if (q.art === "scheibe") { E = q.Erand; for (let a = 0; a < 64; a++) punkte.push([q.R * Math.cos((a * Math.PI) / 32), 0, q.R * Math.sin((a * Math.PI) / 32)]); groesse = 1; }
    else { E = (q.I * kopfSicht(KOPF, q.wandM, 0)) / (q.wandM * q.wandM + q.k2); punkte.push([q.q[0] - q.wandM, q.q[1], q.q[2]]); groesse = 0.3; }
    const sichtbar = punkte.some((p) => imBild(K_, p) && groesse / pixelGroesse(K_, p) >= 0.5); if (!sichtbar) continue;
    const L = [0, 1, 2].map((j) => (RHO_MAX * (c[j] * E + C_MOND[j] * MOND_E + C_HIMMEL[j] * Math.PI * L_HIMMEL)) / Math.PI); const k = K.kGrenze(L);
    if (k < best) { best = k; wer = q.art; }
  }
  return { k: best, wer };
}
// Die Bild-Wege lesen das gezeichnete Bild: P0 = Diffus-Probe des Entscheids (L ≤ ρ_max/π·E_Gesetz, ohne Ausschluss), B = Ausschluss
// über die Geometrie der Pool-Quellen, C = Ausschluss über das Strahler-Bit des Stoffs; B und C tragen den Glanz-Riegel
// L ≤ ρ_max/π·E_Gesetz (er schließt Spiegelungen aus, keinen diffusen Fleck: E_Gesetz ist eine obere Schranke).
function liesBild(sz, K_, schritt = 1, jx = 0, jy = 0) {
  const r = { W: Infinity, Wn: "", P0: Infinity, P0n: "", B: Infinity, Bn: "", C: Infinity, Cn: "", lnSum: 0, n: 0, quelleAnteil: {}, riegelFalsch: 0 };
  const o = K_.o;
  for (let py = Math.floor(schritt / 2); py < H; py += schritt) for (let px = Math.floor(schritt / 2); px < W; px += schritt) {
    const x = ((px + 0.5 + jx) / W * 2 - 1) * TANH * ASP, y = (1 - (py + 0.5 + jy) / H * 2) * TANH;
    const d = norm([K_.fw[0] + x * K_.re[0] + y * K_.up[0], K_.fw[1] + x * K_.re[1] + y * K_.up[1], K_.fw[2] + x * K_.re[2] + y * K_.up[2]]);
    const h = sz.treffe(o, d); const Y = luma(h.L); r.lnSum += Math.log(Y + 1e-6); r.n++;
    if (h.typ === "quelle") r.quelleAnteil[h.n] = (r.quelleAnteil[h.n] || 0) + 1;
    if (h.typ === "himmel") continue;
    const kg = K.kGrenze(h.L), riegel = Y <= (RHO_MAX / Math.PI) * h.Eg;
    if (h.typ === "diffus" && kg < r.W) { r.W = kg; r.Wn = h.r != null ? `${h.n} ${f(h.r, 2)} m` : h.n; }
    if (h.typ === "diffus" && !riegel) r.riegelFalsch++;
    if (riegel && kg < r.P0) { r.P0 = kg; r.P0n = h.r != null ? `${h.n} ${f(h.r, 2)} m` : h.n; }
    if (!h.geomB && riegel && kg < r.B) { r.B = kg; r.Bn = h.r != null ? `${h.n} ${f(h.r, 2)} m` : h.n; }
    if (!h.bit && riegel && kg < r.C) { r.C = kg; r.Cn = h.r != null ? `${h.n} ${f(h.r, 2)} m` : h.n; }
  }
  r.La = Math.exp(r.lnSum / r.n); r.ka = kA(r.La); for (const k in r.quelleAnteil) r.quelleAnteil[k] /= r.n;
  return r;
}
const HALTON = [[0, 0], [0, -1 / 6], [-1 / 4, 1 / 6], [1 / 4, -7 / 18], [-3 / 8, 5 / 18], [1 / 8, -1 / 18], [-1 / 8, 7 / 18], [3 / 8, -5 / 18]];
const ev = (a, b) => Math.log2(a / b);
// eine Reihe benachbarter Sichten: je Sicht W (voll), A, P0 (⅛-Proben), B⅛ (Proben, 8 Phasen), B voll, C voll; Fehler in EV gegen
// das k der Wahrheit nach dem Schlüssel: k = min(k_a, k_c); + heißt das Bild ist DUNKLER als die Wahrheit
function reihe(titel, sz, sichten, opt = {}) {
  say(`\n### ${titel}`);
  say("| Sicht | Quellen-Anteil am Bild | wahr: k (bindet) · hellster diffuser Fleck | A | P0 (Probe des Entscheids, ⅛) | B ⅛ (Spanne über 8 Phasen) | B voll | C voll |");
  say("|---|---|---|---|---|---|---|---|");
  const S = [];
  for (const [nm, K_] of sichten) {
    const V = liesBild(sz, K_, 1), A = wegA(sz, K_);
    const P8 = liesBild(sz, K_, 8); const B8 = HALTON.map(([jx, jy]) => liesBild(sz, K_, 8, jx, jy).B);
    const ka = V.ka, kW = Math.min(ka, V.W), e = (kc) => ev(kW, Math.min(ka, kc));
    const s = { nm, kW, eA: e(A.k), eP0: e(P8.P0), eB8: B8.map(e), eBv: e(V.B), eC: e(V.C), bindet: V.W < ka ? "Kappe" : "Schlüssel", Wn: V.Wn, qa: V.quelleAnteil, riegel: V.riegelFalsch, Bn: V.Bn, Cn: V.Cn, P0n: P8.P0n };
    S.push(s);
    const qa = Object.entries(V.quelleAnteil).map(([k, v]) => `${k} ${f(100 * v, 2)} %`).join(", ") || "—";
    say(`| ${nm} | ${qa} | ${sig(kW)} (${s.bindet}) · ${V.Wn} | ${f(s.eA)} | ${f(s.eP0)} (${P8.P0n}) | ${f(Math.min(...s.eB8))} … ${f(Math.max(...s.eB8))} | ${f(s.eBv)} | ${f(s.eC)}${V.Cn !== V.Wn && isFinite(V.C) ? " (" + V.Cn + ")" : ""} |`);
  }
  // Urteil der Reihe: größter Fehler je Weg und größter Sprung zwischen Nachbar-Sichten (Sprung des Wegs minus Sprung der Wahrheit)
  const wege = [["A", (s) => s.eA], ["P0", (s) => s.eP0], ["B⅛", (s) => s.eB8[0]], ["B voll", (s) => s.eBv], ["C voll", (s) => s.eC]];
  const z = wege.map(([n, g]) => { let mf = 0, ms = 0; for (let i = 0; i < S.length; i++) { mf = Math.max(mf, Math.abs(g(S[i]))); if (i) ms = Math.max(ms, Math.abs(g(S[i]) - g(S[i - 1]))); } return `${n}: |Fehler| ≤ ${f(mf)} EV, Sprung gegen den Nachbarn ≤ ${f(ms)} EV`; });
  const flimmer = Math.max(...S.map((s) => Math.max(...s.eB8) - Math.min(...s.eB8)));
  say(`Reihe: ${z.join(" · ")} · B⅛ flimmert über die 8 Phasen derselben Sicht bis ${f(flimmer)} EV · diffuse Pixel, die der Glanz-Riegel fälschlich ausschloss: ${Math.max(...S.map((s) => s.riegel))}`);
  return S;
}

// ══ LÄUFE ══
say("# RECHNUNG 1 — die Trennung diffus/leuchtend aus dem Datum der Quelle");
say(`Daten: Herd I ${f(I_HERD, 1)} cd (Kern 0,38, 0,35 m) · Glutbett 1 100 K ε 0,9 → ${f(0.9 * LFCm(1100), 1)} cd/m² · Lava (Spiel-Gesetz, w = 1, t0 ${T0} K, Scholle ${TD + LK.platte * (T0 - TD)} K): Mittel ${f(LAVA.L, 0)} cd/m², Scholle ${f(EPS_LAVA * LFCm(TD + LK.platte * (T0 - TD)), 0)} cd/m², Riss ${f(EPS_LAVA * LFCm(T0), 0)} cd/m² · Docht 1 cd, Glas ${f(L_GLAS, 1)} cd/m², Fenster ${f(L_FENSTER, 4)} cd/m² · Lava-Rand senkrecht ${f(LAVA_TAB.randSenkrecht, 0)} lx (A), Halm am Ufer 0,0/0,5/2 m ${f(lavaTab(0).halm, 0)}/${f(lavaTab(0.5).halm, 0)}/${f(lavaTab(2).halm, 0)} lx`);
say("Fehler in EV = log2(k_wahr / k_Weg) nach k = min(k_a, k_c): + = Bild zu DUNKEL, − = diffuse Flecke rutschen in die Schulter. Sprung > 0,3 EV zwischen Nachbar-Sichten ist ein Befund.");

const herdN = herdSzene();
const nah = []; for (let dd = 1.0; dd <= 3.001; dd += 0.2) nah.push([`nah ${f(dd, 1)} m`, kamera([0, 1.6, -dd], [0, 0.1, 0])]);
const HN = reihe("herd-nah, Ego 1,6 m, Abstand 1 … 3 m (Glutbett 1 100 K)", herdN, nah);
const HN12 = reihe("herd-nah, Glutbett 1 200 K (T unsicher 900–1 300 K)", herdSzene({ tGlut: 1200 }), nah.filter((_, i) => i % 2 === 0));
const HNb = reihe("herd-nah, Glutbett 1 200 K und das gezeichnete Bett 4 cm größer als das Datum (r 0,42 gegen 0,38)", herdSzene({ bildR: 0.42, tGlut: 1200 }), nah.filter((_, i) => i % 2 === 0));
const HNo = reihe("herd-nah OHNE Schatten des Rings (der Platz trägt keinen Wurf)", herdSzene({ schatten: false }), nah.filter((_, i) => i % 2 === 0));
const gier = []; for (let a = 0; a <= 144.001; a += 8) { const r = (a * Math.PI) / 180; gier.push([`Gier ${a}°`, kamera([0, 1.6, -2], [10 * Math.sin(r), 1.6 - 10 * 0.75, -2 + 10 * Math.cos(r)])]); }
const HG = reihe("herd-nah 2 m, die Kamera dreht das Feuer aus dem Bild (Blick 37° abwärts)", herdN, gier);
const fern = []; for (let dd = 20; dd <= 30.001; dd += 1) fern.push([`fern ${f(dd, 1)} m`, kamera([0, 1.6, -dd], [0, 0.3, 0])]);
const HF = reihe("herd-fern, Ego 1,6 m, 20 … 30 m", herdN, fern);
const lav = []; for (let dd = 2; dd <= 4.001; dd += 0.2) lav.push([`lava ${f(dd, 1)} m`, kamera([LAVA_R + dd, 1.6, 0], [0, 0, 0])]);
const LZ = lavaSzene(); const LN = reihe("lava-nah, Ego 1,6 m, 2 … 4 m vom Rand der Decke (Spiel-Daten)", LZ, lav);
const lavG = []; for (let a = 0; a <= 100.001; a += 10) { const r = (a * Math.PI) / 180; lavG.push([`Gier ${a}°`, kamera([LAVA_R + 3, 1.6, 0], [LAVA_R + 3 - 10 * Math.cos(r), 1.6 - 10 * 0.2, 10 * Math.sin(r)])]); }
const LG = reihe("lava-nah 3 m, die Kamera dreht die Decke aus dem Bild", LZ, lavG);
const gs_ = gasseSzene(); const gas = []; for (let z = -8; z <= -4.001; z += 0.5) gas.push([`gasse z ${f(z, 2)}`, kamera([3, 1.6, z], [0.5, 2.3, z + 8])]);
const GN = reihe("gasse-nacht, Docht 1 cd unter der Haube, Ego in der Gassen-Mitte, 4 … 8 m vor der Laterne", gs_, gas);
const gasG = []; for (let a = -40; a <= 80.001; a += 10) { const r = (a * Math.PI) / 180; gasG.push([`Gier ${a}°`, kamera([3, 1.6, -3], [3 + 10 * Math.sin(r), 2.0, -3 + 10 * Math.cos(r)])]); }
const GG = reihe("gasse-nacht 3 m vor der Laterne, die Kamera dreht den Kopf aus dem Bild (−40° = Kopf in der Mitte, ab ≈ +15° außerhalb)", gs_, gasG);

// ══ Sichten ohne Pixel-Wurf: Mondwiese (ohne Quelle) und Mittag (die Sonne als Quelle des Datums) ══
say("\n### Sicht ohne Quelle (Mondwiese, Mitternacht 74,2°) und Mittag (Sonne 74,2°), als Flecke");
{ const Ew = MOND_E * (Math.sin(MOND_H) * HALM.hoch + 0.3 * (2 / Math.PI) * HALM.quer);
  const flecke = [["Wiese 2 m", 0.5, ATMO.map((r, j) => (r * C_MOND[j] * Ew) / Math.PI)], ["Karte 18 %", 0.005, [0, 1, 2].map((j) => (0.18 * C_MOND[j] * MOND_EH) / Math.PI)], ["Laub zum Mond", 0.25, LAUB.map((r, j) => (r * C_MOND[j] * MOND_E * 0.5) / Math.PI)], ["Himmel", 0.245, C_HIMMEL.map((c) => c * L_HIMMEL), true]];
  let s = 0, w = 0; for (const [, ww, L] of flecke) { s += ww * Math.log(luma(L) + 1e-6); w += ww; } const ka = kA(Math.exp(s / w));
  const kW = Math.min(...flecke.filter((x) => !x[3]).map((x) => K.kGrenze(x[2]))); const kAw = K.kGrenze([0, 1, 2].map((j) => (RHO_MAX * (C_MOND[j] * MOND_E + C_HIMMEL[j] * Math.PI * L_HIMMEL)) / Math.PI));
  say(`Mondwiese: k_a ${sig(ka)} · Kappe wahr ${sig(kW)} · A ${sig(kAw)} · B/C = wahr (keine Quelle, kein Ausschluss) → die Kappe bindet ${kW < ka ? "JA" : "nicht"} (wahr), ${kAw < ka ? "JA" : "nicht"} (A); Fehler A ${f(ev(Math.min(ka, kW), Math.min(ka, kAw)))} EV`); }
{ const E = 117168, Eh_ = 17000, Es = E - Eh_, Eperp = Es / Math.sin(MOND_H), C_S = planckFarbe(5772);
  const L = (rho, Es_, Eh2) => [0, 1, 2].map((j) => (rho[j] * (C_S[j] * Es_ + C_HIMMEL[j] * Eh2)) / Math.PI);
  for (const [nm, extra] of [["Mess-Wiese", []], ["Mess-Wiese + sonnige Wand ρ = tor (0,82/0,64/0,28), 30 % des Bilds", [["Wand tor", 0.3, L([0.8196, 0.6359, 0.2799], Eperp * 0.9, Eh_ * 0.5)]]]]) {
    const flecke = [["Wiese Sonne", 0.45, L(ATMO, Es, Eh_)], ["Karte 18 %", 0.01, L([0.18, 0.18, 0.18], Es, Eh_)], ["Wiese Schatten", 0.1, L(ATMO, 0, Eh_ * 0.6)], ["Baumkrone", 0.1, L(LAUB, Es * 0.5, Eh_ * 0.7)], ["Himmel", 0.34, C_HIMMEL.map((c) => (c * Eh_) / Math.PI), true], ...extra];
    let s = 0, w = 0; for (const [, ww, L_] of flecke) { s += ww * Math.log(luma(L_) + 1e-6); w += ww; } const ka = kA(Math.exp(s / w));
    const kW = Math.min(...flecke.filter((x) => !x[3]).map((x) => K.kGrenze(x[2]))); const kAs = K.kGrenze([0, 1, 2].map((j) => (RHO_MAX * (C_S[j] * Eperp + C_HIMMEL[j] * Eh_)) / Math.PI));
    const karte = flecke[1][2], kE = Math.min(ka, kW), kEA = Math.min(ka, kAs);
    const code = (k) => Math.round(255 * (() => { const v = K.schirm(karte.map((x) => x * k))[1]; return v <= 0.0031308 ? 12.92 * v : 1.055 * v ** (1 / 2.4) - 0.055; })());
    say(`Mittag, ${nm}: k_a ${sig(ka)} · Kappe wahr ${sig(kW)} · A ${sig(kAs)} → bindet wahr ${kW < ka ? "JA" : "nicht"}, A ${kAs < ka ? "JA" : "nicht"}; Fehler A ${f(ev(kE, kEA))} EV; Karte (Grün-Code) wahr ${code(kE)} · A ${code(kEA)}`); }
}

// ══ Preis ══
say("\n### Preis (geschätzt aus gezählten Operationen, nicht am Gerät gemessen)");
say("A: auf der CPU je Bild ≤ 4 Plätze × (Datum-Punkt + Frustum-Probe ≈ 50 Operationen) + Mond: < 5 µs; kein GPU-Durchgang, kein Rücklesen.");
say("P0/B ⅛: 180 × 101 = 18 180 Proben (Skala 0,75) × (Tiefe → p 15 · ≤ 4 Quell-Volumen 40 · E_Gesetz 4 Plätze 60) ≈ 2 Mio. ALU ≈ 0,01 ms + Start und Rücklesen (mapAsync, 1–3 Bilder Verzug).");
say("B/C voll: 1 166 400 Pixel × (Farbe 4 B + Tiefe 4 B + Glanz-Ziel 1 B) = 10,5 MB ≈ 0,09 ms Bandbreite auf der GTX 1050 (112 GB/s) + Riegel ≈ 70 ALU/Pixel ≈ 0,05 ms → ≈ 0,15 ms; die Reduktion je 8×8-Kachel im Gruppenspeicher, dann ein atomicMin auf die Bits des positiven f32 (monoton als u32).");
say("Quellen: A und B kennen genau die Pool-Plätze (≤ 4) und die Decken-Maske; C kennt JEDEN Stoff mit Strahler-Bit (Fenster, Tor, Funken, Augen, Fahrzeug-Leuchten), ohne Liste.");
fs.writeFileSync(__dirname + "/r1-trennung.out.txt", out.join("\n") + "\n");
