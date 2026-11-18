// SPIKE GEGEN DAS GESETZ (entscheid.md) — reine Rechnung, Ziel: widerlegen.
// Stand gelesen: strahler-leuchte 2ce8a033d (welt-licht.js, fachwerk-core.js, stoff-material.js, bild-himmel.js, bild-kosten.js),
// Runde 3 aus `git show 659651da0:welt-licht.js`, vendor/three.webgpu.min.js `mT` (neutralToneMapping) wörtlich.
// Ausgabe: spike.out.txt. Marken je Eingang: B = belegt · G = gewählt · U = unsicher · F = folgt.
"use strict";
const fs = require("fs");
const out = [];
const say = (s = "") => { out.push(s); console.log(s); };
const f1 = (v, n = 1) => (v == null || !isFinite(v) ? "—" : v.toFixed(n));
const sig = (v) => (v == null || !isFinite(v) ? "—" : Math.abs(v) >= 1e4 || (Math.abs(v) < 1e-3 && v !== 0) ? v.toExponential(2) : +v.toPrecision(3) + "");

// ───────────────────────── 1. PHYSIK ─────────────────────────
// CIE 1931 2° in der Mehrlappen-Näherung (Wyman, Sloan, Shirley 2013, JCGT 2(2)) — eigene Abschrift
const gs = (x, m, a, b) => { const t = (x - m) * (x < m ? a : b); return Math.exp(-0.5 * t * t); };
const cmf = (l) => [
  1.056 * gs(l, 599.8, 0.0264, 0.0323) + 0.362 * gs(l, 442.0, 0.0624, 0.0374) - 0.065 * gs(l, 501.1, 0.049, 0.0382),
  0.821 * gs(l, 568.8, 0.0213, 0.0247) + 0.286 * gs(l, 530.9, 0.0613, 0.0322),
  1.217 * gs(l, 437.0, 0.0845, 0.0278) + 0.681 * gs(l, 459.0, 0.0385, 0.0725),
];
const planckB = (nm, T) => { const l = nm * 1e-9; return 1.1910429e-16 / l ** 5 / (Math.exp(0.014387769 / (l * T)) - 1); }; // W/(m²·sr·m)
function planckXYZ(T) { let X = 0, Y = 0, Z = 0; for (let l = 360; l <= 830; l++) { const b = planckB(l, T) * 1e-9, c = cmf(l); X += b * c[0]; Y += b * c[1]; Z += b * c[2]; } return [X, Y, Z]; }
const leuchtdichteCMF = (T) => 683 * planckXYZ(T)[1];
// fachwerk-core.js:6532-6540 (2ce8) wörtlich: Gauß-V(λ), 380–780 nm in 5 nm
function leuchtdichteFC(T) { let s = 0; for (let nm = 380; nm <= 780; nm += 5) { const l = nm * 1e-9, u = nm * 1e-3 - 0.559; s += (1.1910429e-16 / l ** 5 / (Math.exp(0.014387769 / (l * T)) - 1)) * 1.019 * Math.exp(-285.4 * u * u) * 5e-9; } return 683 * s; }
const xyz2lin = ([X, Y, Z]) => [3.2404542 * X - 1.5371385 * Y - 0.4985314 * Z, -0.969266 * X + 1.8760108 * Y + 0.041556 * Z, 0.0556434 * X - 0.2040259 * Y + 1.0572252 * Z];
const luma = (c) => 0.2126 * c[0] + 0.7152 * c[1] + 0.0722 * c[2];
// planckFarbe nach Entscheid §1: Luma 1, außerhalb des Gamuts Weiß gleicher Luma zugemischt (nicht geklemmt)
function planckFarbe(T) { const [X, Y, Z] = planckXYZ(T); let c = xyz2lin([X / Y, 1, Z / Y]); const m = Math.min(...c); if (m < 0) { const t = -m / (1 - m); c = c.map((v) => v * (1 - t) + t); } const y = luma(c); return c.map((v) => v / y); }
// lichtFarbe fachwerk-core.js:6487-6498 (2ce8) wörtlich (Kim-Kang, Klemme 1 667 K, max = 1) — für die Runden 1 und 3
function lichtFarbe(kelvin) { const T = Math.min(25000, Math.max(1667, +kelvin)), T2 = T * T, T3 = T2 * T;
  const x = T <= 4000 ? -0.2661239e9 / T3 - 0.2343589e6 / T2 + 0.8776956e3 / T + 0.17991 : -3.0258469e9 / T3 + 2.1070379e6 / T2 + 0.2226347e3 / T + 0.24039;
  const x2 = x * x, x3 = x2 * x;
  const y = T <= 2222 ? -1.1063814 * x3 - 1.3481102 * x2 + 2.18555832 * x - 0.20219683 : T <= 4000 ? -0.9549476 * x3 - 1.37418593 * x2 + 2.09137015 * x - 0.16748867 : 3.081758 * x3 - 5.8733867 * x2 + 3.75112997 * x - 0.37001483;
  const X = x / y, Z = (1 - x - y) / y;
  const r = Math.max(0, 3.2404542 * X - 1.5371385 - 0.4985314 * Z), g = Math.max(0, -0.969266 * X + 1.8760108 + 0.041556 * Z), b = Math.max(0, 0.0556434 * X - 0.2040259 + 1.0572252 * Z);
  const m = Math.max(r, g, b); return [r / m, g / m, b / m]; }
const aufLuma1 = (c) => { const y = luma(c); return c.map((v) => v / y); };

// DIE ECHTE TONKURVE: vendor/three.webgpu.min.js `mT` wörtlich (r184 neutralToneMapping):
//   r=.76 s=.15; e*=t; i=min(e); n = i<.08 ? i-6.25·i² : .04; e-=n; a=max(e); if(a<r) return e;
//   o=1-r; u=1-o²/(a+o-r); e*=u/a; l=1-1/(s·(a-u)+1); return mix(e, vec3(u), l)
function neutral(e0) {
  const r = 0.76, s = 0.15; let e = e0.slice();
  const i = Math.min(e[0], e[1], e[2]), n = i < 0.08 ? i - 6.25 * i * i : 0.04; e = e.map((v) => v - n);
  const a = Math.max(e[0], e[1], e[2]); if (a < r) return e;
  const o = 1 - r, u = 1 - (o * o) / (a + o - r); e = e.map((v) => (v * u) / a);
  const l = 1 - 1 / (s * (a - u) + 1); return e.map((v) => v * (1 - l) + u * l);
}
const oetf = (v) => { v = Math.max(0, Math.min(1, v)); return v <= 0.0031308 ? 12.92 * v : 1.055 * v ** (1 / 2.4) - 0.055; };
const eotf = (e) => (e <= 0.04045 ? e / 12.92 : ((e + 0.055) / 1.055) ** 2.4);
const srgb8 = (c) => c.map((v) => Math.round(oetf(v) * 255));
const luma8 = (s) => 0.2126 * s[0] + 0.7152 * s[1] + 0.0722 * s[2];
const hsvS = (s) => { const mx = Math.max(...s), mn = Math.min(...s); return mx > 0 ? 1 - mn / mx : 0; };
function oklab(c) { const l = 0.4122214708 * c[0] + 0.5363325363 * c[1] + 0.0514459929 * c[2], m = 0.2119034982 * c[0] + 0.6806995451 * c[1] + 0.1073969566 * c[2], s = 0.0883024619 * c[0] + 0.2817188376 * c[1] + 0.6299787005 * c[2];
  const [a_, b_, c_] = [l, m, s].map((v) => Math.cbrt(Math.max(0, v)));
  const L = 0.2104542553 * a_ + 0.793617785 * b_ - 0.0040720468 * c_, A = 1.9779984951 * a_ - 2.428592205 * b_ + 0.4505937099 * c_, B = 0.0259040371 * a_ + 0.7827717662 * b_ - 0.808675766 * c_;
  return { L, C: Math.hypot(A, B), h: ((Math.atan2(B, A) * 180) / Math.PI + 360) % 360 }; }
function oklabInv({ L, C, h }) { const a = C * Math.cos((h * Math.PI) / 180), b = C * Math.sin((h * Math.PI) / 180);
  const l_ = L + 0.3963377774 * a + 0.2158037573 * b, m_ = L - 0.1055613458 * a - 0.0638541728 * b, s_ = L - 0.0894841775 * a - 1.291485548 * b;
  const l = l_ ** 3, m = m_ ** 3, s = s_ ** 3;
  return [4.0767416621 * l - 3.3077115913 * m + 0.2309699292 * s, -1.2684380046 * l + 2.6097574011 * m - 0.3413193965 * s, -0.0041960863 * l - 0.7034186147 * m + 1.707614701 * s]; }
// DIE KURVE DES ENTSCHEIDS (§1 Tonkurve): Helligkeit und Buntheit aus Khronos, Farbton = Oklab-h der EINGANGSfarbe; C außerhalb
// des Gamuts in 4 festen Bisektions-Schritten gesenkt (Lesart: Intervall [0, C_N], der letzte Punkt im Gamut gilt).
function schirmEntscheid(x) {
  const N = neutral(x), o = oklab(N), h0 = oklab(x).h; const im = (c) => c.every((v) => v >= -1e-6 && v <= 1 + 1e-6);
  let r = oklabInv({ L: o.L, C: o.C, h: h0 }); if (im(r)) return r.map((v) => Math.max(0, Math.min(1, v)));
  let lo = 0, hi = o.C, best = oklabInv({ L: o.L, C: 0, h: h0 });
  for (let i = 0; i < 4; i++) { const mid = (lo + hi) / 2, t = oklabInv({ L: o.L, C: mid, h: h0 }); if (im(t)) { lo = mid; best = t; } else hi = mid; }
  return best.map((v) => Math.max(0, Math.min(1, v)));
}
const dh = (a, b) => { const x = Math.abs(a - b) % 360; return Math.min(x, 360 - x); };
// Δh_tol nach Entscheid §5: die größte Oklab-Farbton-Änderung bei ±1 Code je Kanal am Pixel
function dhTol(s8) { const h0 = oklab(s8.map((v) => eotf(v / 255))).h; let mx = 0;
  for (let a = -1; a <= 1; a++) for (let b = -1; b <= 1; b++) for (let c = -1; c <= 1; c++) { const t = [s8[0] + a, s8[1] + b, s8[2] + c].map((v) => Math.max(0, Math.min(255, v))); const o = oklab(t.map((v) => eotf(v / 255))); if (o.C > 1e-4) mx = Math.max(mx, dh(o.h, h0)); }
  return mx; }

// ───────────────────────── 2. DATEN (Marke, Ort) ─────────────────────────
const DATEN = [];
const dat = (n, v, einheit, marke, ort) => { DATEN.push({ n, v, einheit, marke, ort }); return v; };
const ATMO_BODEN = dat("Gras-Albedo ATMO_BODEN (rgb)", [0.1003, 0.1385, 0.0449], "—", "B", "welt-licht.js:39 (Mittel Laub+Waldboden, albedo-tafel ist.welt)");
const LAUB = dat("Laub-Albedo (Baumlinie)", [0.0906, 0.2034, 0.0447], "—", "B", "spec/farbe/albedo-tafel.json laub.ist.welt");
const HAUS = dat("Hauswand-Albedo", [0.2758, 0.1316, 0.0889], "—", "B", "spec/farbe/albedo-tafel.json haus.ist.welt");
const FELS = dat("Pflaster (Fels)", [0.2641, 0.2377, 0.1761], "—", "B", "spec/farbe/albedo-tafel.json fels.ist.welt (Pflaster = Fels: G)");
const RHO_MAX = dat("ρ_max (hellster Kanal der Tafel)", 0.8196, "—", "B", "spec/farbe/albedo-tafel.json tor.ist R");
const HALM = dat("HALM_VOLUMEN quer/hoch", { quer: 0.89, hoch: 0.34 }, "—", "G", "stamm/stoff-material.js:3898");
const T_FEUER = dat("Herd T", 2000, "K", "U", "fachwerk-core.js:6448 LICHT_GESETZ.feuer.kelvin (Holzfeuer 1 800–2 000 K)");
const EPS_FLAMME = dat("Flamme Emissivität (Mittel übers Bett)", 0.0012, "—", "G", "fachwerk-core.js:6526 STRAHLER.emissiv.flamme");
const BETT_D = dat("Bett Ø", 0.76, "m", "G", "fachwerk-core.js:6448 feuer.kernM (Ø, klang bettRefM)");
const H_FEUER = dat("Flamme über dem Bett", 0.35, "m", "G", "fachwerk-core.js:6448 feuer.hoeheM");
const L_FLAMME = dat("Flamme Leuchtdichte (sichtbar)", 10000, "cd/m²", "B", "fachwerk-core.js:6528 feuer.cdM2 (Kerzenflamme ≈ 1 sb)");
const T_GLUT = dat("Glutbett T", 1100, "K", "U", "entscheid.md §2 (Holzkohle 900–1 200 K)");
const EPS_GLUT = dat("Glutbett ε", 0.9, "—", "U", "entwurf-quelle.md §2");
const T_LAVA = dat("Lava Riss T", 1650, "K", "B?", "entscheid.md §2 (Q21/Q23); Basalt-Ausbruch real 1 370–1 470 K (U, Fachwissen)");
const EPS_LAVA = dat("Lava ε", 0.95, "—", "B", "fachwerk-core.js:6526 STRAHLER.emissiv.lava");
const T_KRUSTE = dat("Lava Kruste T", 1100, "K", "G", "quelle-sichten.cjs (Kruste ≈ Glut)");
const RISS_ANTEIL = dat("Riss-Anteil der Decke", 0.14, "—", "G", "quelle-sichten.cjs; gegen den Fit 4 615 cd/m² (quellen-lava.json) geprüft unten");
const LAVA_R = dat("Lava-Scheibe r", 7.51, "m", "F", "quellen-lava.json (Fit an r4-Feld-Punkte)");
const DOCHT = dat("Brenner docht", { I: 1, flammeM: 0.04 }, "cd · m", "B", "fachwerk-core.js:6440 BRENNER.docht (die Kerze = 1 cd)");
const T_DOCHT = dat("docht T", 1850, "K", "B", "entscheid.md §2 (Kerze 1 850–1 930 K)");
const WL_H = dat("Wandlaterne Kopf-Höhe · Arm", [2.8, 0.4], "m", "G", "fachwerk-core.js:6481 (LICHT_GESETZ.laterne, 2.8, 0.4)");
const WL_ABST = dat("Laternen-Abstand Gasse (Dorf)", 10, "m", "G", "fachwerk-core.js:9310 LICHT_MARKE_M");
const GLAS_A = dat("Kopf-Glas Fläche", 0.104, "m²", "G", "fachwerk-core.js:6423-6424 (0,26 × 0,40)");
const MOND_E = dat("Vollmond E⊥ Zenit", 0.3965, "lx", "B", "spec/farbe/tag-ref.json Zeile −90 (USNO 171, Brown 1952); Literatur 0,1–0,3 lx (U)");
const MOND_T = dat("Mondlicht T", 4100, "K", "B", "entscheid.md §2 (Jensen et al. 2001)");
const MOND_H = dat("Mond-Höhe Mitternacht", 74.2, "°", "G", "Gegenpunkt der Mittags-Sonne 74,2° (Mess-Wiese)");
const NACHTHIMMEL_E = dat("Nachthimmel E_h", 0.0005, "lx", "B", "spec/farbe/tag-ref.json quelle (USNO 171)");
const MONDHIMMEL_L = dat("mondheller Himmel L", 6.8e-3, "cd/m²", "U", "≈ 18 mag/″² (Fachwissen, unsicher)");
const E_MITTAG = dat("Mittag E_h Mess-Wiese (74,2°)", 117168, "lx", "B", "tag-ref.json, interpoliert 75°/60°");
const E_HIMMEL_MITTAG = dat("Mittag Himmels-Anteil an E_h", 17000, "lx", "U", "Fachwissen: diffuser Anteil klarer Himmel 12–18 %");
const MESO = dat("mesopisch Stäbchen/Zapfen", [0.005, 5], "cd/m²", "B", "welt-licht.js MESOPISCH (CIE 191:2010)");
const SKOT = dat("skotopische Gewichte (lin. sRGB)", [0, 0.5437, 0.3599], "—", "B", "stamm/bild-kosten.js:3017 NACHT_AUGE.skotopisch (V′, Pattanaik 1998)");
const KNOTEN = dat("Auge: Schlüssel-Knoten (Entscheid §1)", { L10: 634.8, LK0: 6713, cNacht: -2.17, steig: 0.25 }, "cd/m² · EV", "G", "entscheid.md §1.2 (Bild-Anker A19/A21, kein Tor)");

const L_FL = (T, eps) => eps * leuchtdichteFC(T);
const I_HERD = L_FL(T_FEUER, EPS_FLAMME) * Math.PI * (BETT_D / 2) ** 2; // fachwerk strahler: L·A
const K_HERD = BETT_D / 2; // kern = √(A/π)
const L_GLUT = L_FL(T_GLUT, EPS_GLUT);
const L_RISS = L_FL(T_LAVA, EPS_LAVA), L_KRUSTE = L_FL(T_KRUSTE, 0.9);
const L_LAVA_MITTEL = RISS_ANTEIL * L_RISS + (1 - RISS_ANTEIL) * L_KRUSTE;
const sinM = Math.sin((MOND_H * Math.PI) / 180);
const E_MOND_H = MOND_E * sinM; // waagrecht; Luftmasse 74° ≈ 1,04 vernachlässigt (G)

say("# SPIKE — Rechnung (spike.cjs), Stand 2ce8a033d / 659651da0 gelesen");
say("");
say("## Quellen aus dem Gesetz");
say(`leuchtdichte(T) fachwerk-Gauß ↔ CIE-Mehrlappen: 1100 K ${sig(leuchtdichteFC(1100))} ↔ ${sig(leuchtdichteCMF(1100))} · 1650 K ${sig(leuchtdichteFC(1650))} ↔ ${sig(leuchtdichteCMF(1650))} · 1850 K ${sig(leuchtdichteFC(1850))} ↔ ${sig(leuchtdichteCMF(1850))} · 2000 K ${sig(leuchtdichteFC(2000))} ↔ ${sig(leuchtdichteCMF(2000))} cd/m²`);
say(`Herd: L_Bett-Mittel ${sig(L_FL(T_FEUER, EPS_FLAMME))} cd/m² × A ${sig(Math.PI * (BETT_D / 2) ** 2)} m² = I ${sig(I_HERD)} cd, Kern ${K_HERD} m; sichtbare Flammenfläche I/L_Flamme = ${sig(I_HERD / L_FLAMME)} m²`);
say(`Glutbett 1100 K ε 0,9: ${sig(L_GLUT)} cd/m² · Lava Riss ${sig(L_RISS)} · Kruste ${sig(L_KRUSTE)} · Decke im Mittel (Riss ${RISS_ANTEIL}) ${sig(L_LAVA_MITTEL)} cd/m² ↔ Fit an r4 (quellen-lava.json, I 817 325 cd / π·7,51²) ${sig(817324.7 / (Math.PI * 7.5078 ** 2))} cd/m²`);
say(`Lava bei realer Basalt-Temperatur (U): 1400 K ε 0,95 → ${sig(L_FL(1400, 0.95))} cd/m² (÷ ${f1(L_RISS / L_FL(1400, 0.95))} gegen 1650 K)`);
say(`Mond waagrecht bei ${MOND_H}°: ${sig(E_MOND_H)} lx`);

// ───────────────────────── 3. WEG ─────────────────────────
// Punktlicht mit Kern (stoff-material.js _lichtPlatz: F = I · L̂ · (d² + k²)^(−1)), am Halm-Volumen (SM:2456-2463)
function ePunkt(I, k, q, p, normale /* null = Halm */) {
  const v = [q[0] - p[0], q[1] - p[1], q[2] - p[2]], d2 = v[0] ** 2 + v[1] ** 2 + v[2] ** 2, d = Math.sqrt(d2), F = I / (d2 + k * k);
  const Fv = v.map((x) => (x / d) * F);
  if (!normale) return Math.hypot(Fv[0], Fv[2]) * (2 / Math.PI) * HALM.quer + Math.abs(Fv[1]) * HALM.hoch;
  return Math.max(0, Fv[0] * normale[0] + Fv[1] * normale[1] + Fv[2] * normale[2]);
}
// Lambert-Scheibe (Lava) nach oben strahlend, numerisch; Empfänger Halm oder Fläche mit Normale
function eScheibe(L, R, c, p, normale) {
  let F = [0, 0, 0]; const nr = 50, nph = 96;
  for (let i = 0; i < nr; i++) for (let j = 0; j < nph; j++) {
    const rr = ((i + 0.5) / nr) * R, ph = ((j + 0.5) / nph) * 2 * Math.PI, dA = (R / nr) * rr * ((2 * Math.PI) / nph);
    const q = [c[0] + rr * Math.cos(ph), c[1], c[2] + rr * Math.sin(ph)], v = [q[0] - p[0], q[1] - p[1], q[2] - p[2]];
    const d2 = v[0] ** 2 + v[1] ** 2 + v[2] ** 2, d = Math.sqrt(d2), cosE = (p[1] - c[1]) / d; if (cosE <= 0) continue;
    const dE = (L * cosE * dA) / d2; F = F.map((x, a) => x + (dE * v[a]) / d);
  }
  if (!normale) return Math.hypot(F[0], F[2]) * (2 / Math.PI) * HALM.quer + Math.abs(F[1]) * HALM.hoch;
  if (normale === "max") return Math.hypot(...F);
  return Math.max(0, F[0] * normale[0] + F[1] * normale[1] + F[2] * normale[2]);
}
const diffus = (rho, beitraege) => beitraege.reduce((a, { E, c }) => a.map((v, i) => v + (rho[i] * c[i] * E) / Math.PI), [0, 0, 0]);
const strahler = (L, c) => c.map((v) => v * L);
const C_FEUER = planckFarbe(T_FEUER), C_GLUT = planckFarbe(T_GLUT), C_RISS = planckFarbe(T_LAVA), C_KRUSTE = planckFarbe(T_KRUSTE), C_DOCHT = planckFarbe(T_DOCHT), C_MOND = planckFarbe(MOND_T), C_SONNE = planckFarbe(5772), C_HIMMEL = planckFarbe(12000);
const MOND = { E: E_MOND_H, c: C_MOND };

// ───────────────────────── 4. DAS AUGE DES ENTSCHEIDS ─────────────────────────
const L_MOND_KARTE = (0.18 * MOND_E) / Math.PI; // L☾ = 0,0227 cd/m²
function schluesselC(LK) { const { L10, LK0, cNacht, steig } = KNOTEN; const c10 = steig * Math.log2(L10 / LK0);
  if (LK >= L10) return steig * Math.log2(LK / LK0); if (LK <= L_MOND_KARTE) return cNacht;
  const t = (Math.log2(LK) - Math.log2(L_MOND_KARTE)) / (Math.log2(L10) - Math.log2(L_MOND_KARTE)); return cNacht + t * (c10 - cNacht); }
function mesopisch(L, farbort) { // Entscheid §1 Nacht-Auge: m je Pixel aus L (cd/m²), ohne luxJeEinheit/bildZapfen/staebchenStaerke
  const l = luma(L), m = Math.max(0, Math.min(1, Math.log(Math.max(l, MESO[0]) / MESO[0]) / Math.log(MESO[1] / MESO[0])));
  const s = SKOT[0] * L[0] + SKOT[1] * L[1] + SKOT[2] * L[2]; const g = farbort.map((v) => v * s);
  return { L: L.map((v, i) => m * v + (1 - m) * g[i]), m };
}
const GRAU = [1, 1, 1];
const JENSEN = aufLuma1(xyz2lin([0.25 / 0.25, 1, (1 - 0.25 - 0.25) / 0.25])).map((v) => Math.max(0, v)); // Stäbchen-Farbort (0,25/0,25), U
let KAPPA = null;
function auge(sicht, opt = {}) {
  let s = 0, w = 0; for (const p of sicht) { s += p.w * Math.log(luma(p.L) + 1e-6); w += p.w; }
  const La = Math.exp(s / w), LK = KAPPA * La, c = schluesselC(LK), ka = (0.22 * 2 ** c) / Math.max(LK, L_MOND_KARTE);
  // Diffus-Probe: L ≤ ρ_max/π · E_Gesetz(p) (obere Schranke ohne Schatten); Himmel (Tiefe ∞) nie diffus
  const dif = sicht.filter((p) => !p.himmel && luma(p.L) <= (RHO_MAX / Math.PI) * p.Eg);
  // p98 der diffusen Proben nach Leuchtdichte, pixel-gewichtet; davon der hellste Kanal
  const so = dif.slice().sort((a, b) => luma(a.L) - luma(b.L)), W = so.reduce((a, p) => a + p.w, 0); let acc = 0, p98 = so[so.length - 1];
  for (const p of so) { acc += p.w; if (acc >= 0.98 * W) { p98 = p; break; } }
  const kc = 0.76 / Math.max(...p98.L); const k = opt.ohneKappe ? ka : Math.min(ka, kc);
  return { La, LK, c, ka, kc, k, p98: p98.n, dif: new Set(dif.map((p) => p.n)), bindet: ka <= kc ? "Schlüssel" : "Kappe" };
}
function bild(L, k, kurve, farbort = GRAU, mitMeso = true) {
  const me = mitMeso ? mesopisch(L, farbort) : { L, m: 1 }; const x = me.L.map((v) => v * k);
  const lin = kurve(x), s8 = srgb8(lin), o = oklab(s8.map((v) => eotf(v / 255)));
  return { s8, l8: luma8(s8), S: hsvS(s8), h: o.h, C: o.C, m: me.m, x, hSoll: oklab(me.L).h, hPhys: oklab(L).h };
}

// ───────────────────────── 5. DIE SIEBEN ORTE (Geometrie G) ─────────────────────────
// Koordinaten: x waagrecht, y hoch, z waagrecht; Boden y = 0
function herd(fern) {
  const Q = [0, H_FEUER, 0]; const S = [];
  const ringe = fern ? [[0.75, 0.0008], [1.25, 0.0015], [1.75, 0.002], [2.5, 0.004], [4, 0.01], [8, 0.03], [14, 0.08], [25, 0.15], [40, 0.25]] : [[0.75, 0.04], [1.25, 0.07], [1.75, 0.08], [2.5, 0.1], [4, 0.12], [8, 0.08], [14, 0.08], [30, 0.1]];
  for (const [r, w] of ringe) { const p = [r, 0.2, 0], Ef = ePunkt(I_HERD, K_HERD, Q, p, null), Em = MOND.E * HALM.hoch + MOND.E * Math.cos((MOND_H * Math.PI) / 180) / sinM * (2 / Math.PI) * HALM.quer;
    S.push({ n: `Gras ${r} m`, w, r, Ef, Eg: Ef + Em + 0.01, L: diffus(ATMO_BODEN, [{ E: Ef, c: C_FEUER }, { E: Em, c: C_MOND }]) }); }
  S.push({ n: "Flamme", w: fern ? 0.00005 : 0.004, L: strahler(L_FLAMME, C_FEUER), Eg: I_HERD / (K_HERD * K_HERD), quelle: true });
  S.push({ n: "Glutbett", w: fern ? 0.0001 : 0.012, L: strahler(L_GLUT, C_GLUT), Eg: ePunkt(I_HERD, K_HERD, Q, [0.2, 0.0, 0], [0, 1, 0]) + MOND.E, quelle: true });
  S.push({ n: "Himmel", w: fern ? 0.33 : 0.29, L: strahler(MONDHIMMEL_L, C_HIMMEL), himmel: true, Eg: 0 });
  return S;
}
function lava(fern) {
  const c = [0, 0, 0], S = [], pos = (s) => [LAVA_R + s, 0.3, 0];
  const Ef = (s) => RISS_ANTEIL * eScheibe(L_RISS, LAVA_R, c, pos(s), null) + (1 - RISS_ANTEIL) * eScheibe(L_KRUSTE, LAVA_R, c, pos(s), null);
  const Em = MOND.E * 0.6; // Halm im Mondlicht (G)
  const ufer = fern ? [[0.5, 0.01], [1, 0.01], [2, 0.02], [4, 0.04], [8, 0.08], [15, 0.15]] : [[0.5, 0.06], [1, 0.06], [2, 0.08], [4, 0.08], [8, 0.06], [15, 0.05]];
  for (const [s, w] of ufer) { const E = Ef(s); S.push({ n: `Ufer ${s} m`, w, Ef: E, Eg: E + Em + 0.01, L: diffus(ATMO_BODEN, [{ E, c: aufLuma1(RISS_ANTEIL * L_RISS > 0 ? C_RISS.map((v, i) => RISS_ANTEIL * L_RISS * v + (1 - RISS_ANTEIL) * L_KRUSTE * C_KRUSTE[i]) : C_RISS) }, { E: Em, c: C_MOND }]) }); }
  const pB = [LAVA_R + 20, 4, 0], Eb = RISS_ANTEIL * eScheibe(L_RISS, LAVA_R, c, pB, [-1, 0, 0]) + (1 - RISS_ANTEIL) * eScheibe(L_KRUSTE, LAVA_R, c, pB, [-1, 0, 0]);
  S.push({ n: "Baumlinie 20 m", w: fern ? 0.08 : 0.1, Ef: Eb, Eg: Eb + 0.2, L: diffus(LAUB, [{ E: Eb, c: aufLuma1(C_RISS.map((v, i) => RISS_ANTEIL * L_RISS * v + (1 - RISS_ANTEIL) * L_KRUSTE * C_KRUSTE[i])) }, { E: MOND.E * 0.3, c: C_MOND }]) });
  const Eriss = MOND.E; // auf der Decke: die Scheibe bestrahlt ihre eigene Ebene mit 0, nur der Mond (obere Schranke)
  S.push({ n: "Lava Riss", w: (fern ? 0.12 : 0.3) * RISS_ANTEIL, L: strahler(L_RISS, C_RISS), Eg: Eriss, quelle: true });
  S.push({ n: "Lava Kruste", w: (fern ? 0.12 : 0.3) * (1 - RISS_ANTEIL), L: strahler(L_KRUSTE, C_KRUSTE), Eg: Eriss, quelle: true });
  S.push({ n: "Himmel", w: fern ? 0.4 : 0.15, L: strahler(MONDHIMMEL_L, C_HIMMEL), himmel: true, Eg: 0 });
  return S;
}
function gasse(fern) {
  // Wandlaterne an der Wand x = 0 bei z = 0 und z = 10 (Abstand 10 m), Kopf 2,8 m, Arm 0,4 m (vor der Wand). Kern 0,02 m (die Flamme);
  // der kernM 2,742 der Wandlaterne (FC:6468) ist eine Wand-Klammer, kein Datum der Quelle (Zensus c B5) — er fällt im Gesetz.
  const lat = [[0.4, 2.8, 0], [0.4, 2.8, 10]], I = DOCHT.I, k = 0.02; const S = [];
  const eW = (p, n) => lat.reduce((a, q) => a + ePunkt(I, k, q, p, n), 0);
  const Ewm = MOND_E * 0.5; // Wand zum Mond (60° Einfall, G)
  const Ews = Math.PI * MONDHIMMEL_L * 0.25 + 0.16 * Ewm * 0.3; // Wand im Mondschatten: Himmel + Gegenwand (Haus ρ ~0,16) (G)
  const Ebs = Math.PI * MONDHIMMEL_L * 0.35 + 0.16 * Ewm * 0.2;
  const add = (n, w, rho, p, nrm, mond) => { const E = eW(p, nrm); S.push({ n, w, Ef: E, Eg: E + mond + 0.02, L: diffus(rho, [{ E, c: C_DOCHT }, { E: mond, c: C_MOND }]) }); };
  add("Wand unter Laterne (1 m)", fern ? 0.02 : 0.05, HAUS, [0, 1.8, 0.0], [1, 0, 0], Ews);
  add("Wand zwischen Laternen (5 m)", fern ? 0.1 : 0.1, HAUS, [0, 1.5, 5], [1, 0, 0], Ews);
  add("Wand zum Mond", fern ? 0.2 : 0.18, HAUS, [6, 2, 5], null === 0 ? null : [-1, 0, 0], Ewm);
  add("Wand im Mondschatten", fern ? 0.25 : 0.25, HAUS, [0, 3, 20], [1, 0, 0], Ews);
  add("Pflaster unter Laterne", fern ? 0.03 : 0.05, FELS, [1, 0, 0], [0, 1, 0], Ebs);
  add("Pflaster im Schatten", fern ? 0.2 : 0.2, FELS, [1.5, 0, 25], [0, 1, 0], Ebs);
  const L_STUBE = (0.8 * 0.5 * (DOCHT.I / 4)) / Math.PI; // Fenster: τ 0,8 · ρ 0,5 · E(2 m) / π (Entscheid §2, G)
  S.push({ n: "Fenster (Docht-Stube)", w: 0.02, L: strahler(L_STUBE, C_DOCHT), Eg: Ews + 0.02, quelle: true });
  S.push({ n: "Laternen-Glas", w: fern ? 0.0008 : 0.003, L: strahler(DOCHT.I / GLAS_A, C_DOCHT), Eg: 0.1, quelle: true });
  S.push({ n: "Laternen-Flamme", w: fern ? 0.0001 : 0.0004, L: strahler(DOCHT.I / (0.01 * DOCHT.flammeM), C_DOCHT), Eg: 0.1, quelle: true });
  S.push({ n: "Himmel", w: fern ? 0.1 : 0.12, L: strahler(MONDHIMMEL_L, C_HIMMEL), himmel: true, Eg: 0 });
  return S;
}
function wieseNacht(moond) { // quellenlos; moond: E⊥ des Monds × sin(h)
  const E = moond, Eh = E * HALM.hoch + E * 0.3 * (2 / Math.PI) * HALM.quer + NACHTHIMMEL_E;
  const L_H = E > 0 ? MONDHIMMEL_L * (E / E_MOND_H) : NACHTHIMMEL_E / Math.PI;
  return [
    { n: "Wiese 2 m", w: 0.25, Eg: Eh * 1.2, L: diffus(ATMO_BODEN, [{ E: Eh, c: C_MOND }]) },
    { n: "Wiese 20 m", w: 0.25, Eg: Eh * 1.2, L: diffus(ATMO_BODEN, [{ E: Eh * 0.9, c: C_MOND }]) },
    { n: "Karte 18 % waagrecht", w: 0.005, Eg: E + NACHTHIMMEL_E + 0.001, L: diffus([0.18, 0.18, 0.18], [{ E: E + NACHTHIMMEL_E, c: C_MOND }]) },
    { n: "Baumlinie (Mondseite)", w: 0.15, Eg: E + 0.001, L: diffus(LAUB, [{ E: E * 0.5, c: C_MOND }]) },
    { n: "Baumlinie (Schatten)", w: 0.1, Eg: E + 0.001, L: diffus(LAUB, [{ E: E * 0.05 + NACHTHIMMEL_E, c: C_MOND }]) },
    { n: "Himmel", w: 0.245, L: strahler(L_H, C_HIMMEL), himmel: true, Eg: 0 },
  ];
}
function mittag() {
  const Es = E_MITTAG - E_HIMMEL_MITTAG; // Sonne direkt waagrecht
  return [
    { n: "Wiese Sonne", w: 0.45, Eg: E_MITTAG * 1.1, L: diffus(ATMO_BODEN, [{ E: Es, c: C_SONNE }, { E: E_HIMMEL_MITTAG, c: C_HIMMEL }]) },
    { n: "Karte 18 %", w: 0.01, Eg: E_MITTAG * 1.1, L: diffus([0.18, 0.18, 0.18], [{ E: Es, c: C_SONNE }, { E: E_HIMMEL_MITTAG, c: C_HIMMEL }]) },
    { n: "Wiese Schatten", w: 0.1, Eg: E_MITTAG * 1.1, L: diffus(ATMO_BODEN, [{ E: E_HIMMEL_MITTAG * 0.6, c: C_HIMMEL }]) },
    { n: "Baumkrone Sonne", w: 0.1, Eg: E_MITTAG * 1.1, L: diffus(LAUB, [{ E: Es * 0.5, c: C_SONNE }, { E: E_HIMMEL_MITTAG * 0.7, c: C_HIMMEL }]) },
    { n: "Himmel", w: 0.34, L: strahler(E_HIMMEL_MITTAG / Math.PI, C_HIMMEL), himmel: true, Eg: 0 },
  ];
}
// κ FOLGT am Mittag (Entscheid §1.2: κ = L_Karte / L_a an der Mess-Wiese)
{ const M = mittag(); let s = 0, w = 0; for (const p of M) { s += p.w * Math.log(luma(p.L) + 1e-6); w += p.w; } const La = Math.exp(s / w), Lk = luma(M[1].L); KAPPA = Lk / La;
  say(`\nκ FOLGT am Mittag: L_a ${sig(La)} cd/m² · Karte ${sig(Lk)} cd/m² → κ ${KAPPA.toFixed(3)} (QUELLE rechnete 1,743 mit anderer Komposition — κ hängt an der gewählten Mittags-Sicht)`); }

// ───────────────────────── 6. URTEIL JE SICHT ─────────────────────────
const SCHULTER = 0.76;
const STUFEN_BIS_WEISS = Math.log2((0.0576 / (1 - eotf(254.5 / 255)) + 0.52) / 0.76); // wo der hellste Kanal Code 255 erreicht
const ERG = {};
function urteile(name, sicht, opt = {}) {
  const A = auge(sicht, opt), farbort = opt.farbort || GRAU;
  say(`\n### ${name}`);
  say(`L_a ${sig(A.La)} cd/m² · L_K ${sig(A.LK)} · c ${A.c.toFixed(2)} EV · k_a ${sig(A.ka)} · k_c ${sig(A.kc)} (p98 = ${A.p98}) → **k ${sig(A.k)}** (${opt.ohneKappe ? "ohne Kappe" : A.bindet})`);
  say(`| Fleck | L cd/m² | diffus? | m | k·L max−Fuß | über Schulter (EV) | Neutral sRGB | Luma | S | Δh Neutral (°) | Entscheid-Kurve sRGB | Luma | S | Δh Entscheid (°) | Δh_tol (°) | Δh Lichtfarbe×Albedo→Bild (°) |`);
  say(`|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|`);
  const rows = [];
  for (const p of sicht) {
    const N = bild(p.L, A.k, neutral, farbort), E = bild(p.L, A.k, schirmEntscheid, farbort);
    const x = N.x, mn = Math.min(...x), fuss = mn < 0.08 ? mn - 6.25 * mn * mn : 0.04, top = Math.max(...x) - fuss;
    const ueber = top > SCHULTER ? Math.log2(top / SCHULTER) : 0;
    const aussage = E.C > 0.02 && E.l8 >= 8; const tol = dhTol(E.s8);
    const r = { p, N, E, ueber, top, dif: A.dif.has(p.n), tol, dN: dh(N.h, N.hSoll), dE: dh(E.h, E.hSoll), dPhys: dh(E.h, E.hPhys), aussage };
    rows.push(r);
    say(`| ${p.n} | ${sig(luma(p.L))} | ${p.himmel ? "Himmel" : r.dif ? "ja" : "nein"} | ${N.m.toFixed(2)} | ${top.toFixed(3)} | ${ueber > 0 ? "+" + ueber.toFixed(2) : "0"} | ${N.s8.join("/")} | ${f1(N.l8)} | ${N.S.toFixed(2)} | ${aussage ? f1(r.dN) : "–"} | ${E.s8.join("/")} | ${f1(E.l8)} | ${E.S.toFixed(2)} | ${aussage ? f1(r.dE) : "–"} | ${f1(tol)} | ${aussage ? f1(r.dPhys) : "–"} |`);
  }
  // (a) Ordnung: nach photopischer Leuchtdichte, Bild-Luma (Entscheid-Kurve und Neutral) monoton?
  const so = rows.slice().sort((a, b) => luma(a.p.L) - luma(b.p.L)), bruch = { N: [], E: [] };
  for (let i = 1; i < so.length; i++) for (let j = 0; j < i; j++) { if (so[i].N.l8 + 0.5 < so[j].N.l8) bruch.N.push(`${so[j].p.n} (${f1(so[j].N.l8)}) > ${so[i].p.n} (${f1(so[i].N.l8)})`); if (so[i].E.l8 + 0.5 < so[j].E.l8) bruch.E.push(`${so[j].p.n} (${f1(so[j].E.l8)}) > ${so[i].p.n} (${f1(so[i].E.l8)})`); }
  const difU = rows.filter((r) => r.dif && r.ueber > 0);
  const cBruchN = rows.filter((r) => r.aussage && r.dN > r.tol), cBruchE = rows.filter((r) => r.aussage && r.dE > r.tol);
  say(`(a) Ordnung: Neutral ${bruch.N.length ? "BRUCH " + bruch.N.join("; ") : "monoton"} · Entscheid-Kurve ${bruch.E.length ? "BRUCH " + bruch.E.join("; ") : "monoton"}`);
  say(`(b) Schulter (Spanne 0 nach Entscheid §5): diffuse über 0,76: ${difU.length ? difU.map((r) => `${r.p.n} +${r.ueber.toFixed(2)} EV`).join(" · ") : "keiner"} (8-Bit-Weiß des hellsten Kanals liegt ${STUFEN_BIS_WEISS.toFixed(2)} EV über 0,76)`);
  say(`(c) Farbton gegen die mesopische Erwartung, über Δh_tol: Neutral ${cBruchN.length ? cBruchN.map((r) => `${r.p.n} ${f1(r.dN)}° > ${f1(r.tol)}°`).join(" · ") : "keiner"} · Entscheid-Kurve ${cBruchE.length ? cBruchE.map((r) => `${r.p.n} ${f1(r.dE)}° > ${f1(r.tol)}°`).join(" · ") : "keiner"}`);
  ERG[name] = { A, rows, bruch, difU, cBruchN, cBruchE };
  return ERG[name];
}

say(`\n## Die Kurve (vendor mT): Schulter 0,76 · 8-Bit-Weiß des hellsten Kanals bei ${(0.76 * 2 ** STUFEN_BIS_WEISS).toFixed(2)} (= +${STUFEN_BIS_WEISS.toFixed(2)} EV)`);
{ const t = [0.18, 0.22, 0.5].map((v) => `${v} → ${srgb8(neutral([v, v, v]))[0]}`); say(`Grau: ${t.join(" · ")}`); }

say("\n## Die sieben Orte unter dem Gesetz des Entscheids (Nacht-Auge mit grauem Stäbchen-Farbort; Variante Jensen unten)");
const M = urteile("Mittag (Mess-Wiese, Sonne 74,2°)", mittag());
const HN = urteile("herd-nah (3 m)", herd(false));
const HF = urteile("herd-fern (25 m)", herd(true));
const LN = urteile("lava-nah (3 m vom Rand)", lava(false));
const LF = urteile("lava-fern (≈ 25 m)", lava(true));
const GN = urteile("gasse-nacht nah (Docht 1 cd, Laternen je 10 m)", gasse(false));
const GF = urteile("gasse-nacht fern", gasse(true));
const WN = urteile("wiese-nacht quellenlos (Mitternacht, Mond 74,2°)", wieseNacht(E_MOND_H));
const VM = urteile("Vollmond im Zenit (Wiese, ohne Quelle)", wieseNacht(MOND_E));
const NM = urteile("Zusatz: Neumond (nur Nachthimmel 0,0005 lx)", wieseNacht(0));
say(`\n(d) Zustand je Sicht: herd nah ${sig(HN.A.k)} ↔ fern ${sig(HF.A.k)} (×${(HF.A.k / HN.A.k).toFixed(2)}) · lava nah ${sig(LN.A.k)} ↔ fern ${sig(LF.A.k)} (×${(LF.A.k / LN.A.k).toFixed(2)}) · gasse nah ${sig(GN.A.k)} ↔ fern ${sig(GF.A.k)} · wiese ${sig(WN.A.k)} · Vollmond ${sig(VM.A.k)} · Neumond ${sig(NM.A.k)} · Mittag ${sig(M.A.k)}`);
{ const k = M.A.k, kar = M.rows.find((r) => r.p.n === "Karte 18 %"); say(`Mittag: Karte k·L ${(k * luma(kar.p.L)).toFixed(3)} → sRGB ${kar.N.s8.join("/")} (Ziel ≈ 118; main legt sie per zielKarte 0,22 an denselben Ort — HIER TAUTOLOGISCH, weil κ an genau dieser Sicht FOLGT)`); }

say("\n## Ohne Kappe (nur Schlüssel k_a): was die Kappe trägt");
for (const [n, f] of [["herd-nah", () => herd(false)], ["lava-nah", () => lava(false)], ["gasse nah", () => gasse(false)]]) {
  const A = auge(f(), { ohneKappe: true }), S = f(); const u = S.filter((p) => !p.quelle && !p.himmel).map((p) => ({ p, b: bild(p.L, A.k, neutral) })).filter((x) => Math.max(...x.b.x) > 0.8);
  say(`${n}: k_a ${sig(A.ka)} → diffuse über der Schulter ${u.length}: ${u.map((x) => `${x.p.n} ${x.b.s8.join("/")} S ${x.b.S.toFixed(2)}`).join(" · ") || "—"}`);
}

say("\n## Prüfungen, die das Urteil tragen");
// (a) im linearen Licht des Schirms statt in der Luma der Codes
for (const [n, R] of [["lava-nah", LN], ["Vollmond", VM]]) {
  const Y = (s8) => luma(s8.map((v) => eotf(v / 255)));
  const so = R.rows.slice().sort((a, b) => luma(a.p.L) - luma(b.p.L)); let br = [];
  for (let i = 1; i < so.length; i++) for (let j = 0; j < i; j++) if (Y(so[i].E.s8) + 1e-4 < Y(so[j].E.s8)) br.push(`${so[j].p.n} > ${so[i].p.n}`);
  say(`(a) ${n} im linearen Schirm-Y (Entscheid-Kurve): ${br.length ? "BRUCH " + br.join("; ") : "monoton"}`);
}
// (b) herd-fern: die Kappe auf das MAXIMUM der diffusen Proben statt p98
{ const S = herd(true), A = auge(S), dif = S.filter((p) => A.dif.has(p.n) && p.n !== "Glutbett"), kmax = 0.76 / Math.max(...dif.map((p) => Math.max(...p.L)));
  const zeig = S.filter((p) => !p.himmel && p.n.startsWith("Gras")).map((p) => `${p.n} ${f1(bild(p.L, kmax, schirmEntscheid).l8)}`).join(" · ");
  const share = S.filter((p) => ["Gras 0.75 m", "Gras 1.25 m", "Gras 1.75 m", "Gras 2.5 m"].includes(p.n)).reduce((a, p) => a + p.w, 0) / S.filter((p) => A.dif.has(p.n)).reduce((a, p) => a + p.w, 0);
  say(`(b) herd-fern: der Feuerkreis (Gras ≤ 2,5 m) trägt ${(share * 100).toFixed(2)} % der diffusen Pixel < 2 % → p98 sieht ihn nicht. Kappe am Maximum (ohne Glutbett): k ${sig(kmax)} (statt ${sig(A.k)}, −${Math.log2(A.k / kmax).toFixed(2)} EV) → ${zeig}`); }
// (b) herd-nah: ab welchem Anteil des Glutbetts kippt p98 auf das Glutbett?
{ const S = herd(false), A0 = auge(S), gb = S.find((p) => p.n === "Glutbett"); let kipp = null;
  for (let w = 0.002; w <= 0.06; w += 0.001) { gb.w = w; const A = auge(S); if (A.p98 === "Glutbett") { kipp = { w, k: A.k }; break; } }
  say(`(b) herd-nah: das Glutbett (${sig(L_GLUT)} cd/m²) besteht die Diffus-Probe (Schranke ρ_max/π·E ${sig((RHO_MAX / Math.PI) * herd(false).find((p) => p.n === "Glutbett").Eg)} cd/m²); ab ${kipp ? (kipp.w * 100).toFixed(1) + " % des Bilds" : "—"} wird es p98: k ${sig(A0.k)} → ${kipp ? sig(kipp.k) : "—"} (−${kipp ? Math.log2(A0.k / kipp.k).toFixed(2) : "—"} EV), das Gras 0,75 m fällt dann auf Luma ${kipp ? f1(bild(herd(false)[0].L, kipp.k, schirmEntscheid).l8) : "—"}`); }
// Nacht-Boden gegen main: die quellenlose Wiese misst an main/r1/r3 Luma 31,7 (k 1,5)
{ const W = wieseNacht(E_MOND_H), g = W[0]; let lo = 0.1, hi = 1000; for (let i = 0; i < 80; i++) { const m = Math.sqrt(lo * hi); if (bild(g.L, m, schirmEntscheid).l8 > 31.7) hi = m; else lo = m; }
  const kb = Math.sqrt(lo * hi), karte = bild(W[2].L, kb, schirmEntscheid);
  let lo2 = 0.1, hi2 = 1000; for (let i = 0; i < 80; i++) { const m = Math.sqrt(lo2 * hi2); if (bild(g.L, m, schirmEntscheid).l8 > 22) hi2 = m; else lo2 = m; }
  say(`Nacht-Boden ≥ 22 (Anker S0 der Prüfbühne, bild-kosten.js:3005-3006): k ${sig(lo2)} → Knoten ${(-2.17 + Math.log2(lo2 / WN.A.k)).toFixed(2)} EV; die Toe-Zone der Kurve (x < 0,08, Ausgabe 6,25·x²) verdoppelt jede Stufe darunter: Wiese k·L ${(WN.A.k * luma(g.L)).toFixed(4)} ↔ Karte ${(WN.A.k * luma(W[2].L)).toFixed(4)}`);
  say(`Nacht-Boden: Wiese 2 m unter dem Gesetz Luma ${f1(WN.rows[0].E.l8)} bei k ${sig(WN.A.k)} — main/Runden messen 31,7. Dafür braucht es k ${sig(kb)} (+${Math.log2(kb / WN.A.k).toFixed(2)} EV); die 18-%-Karte stünde dann bei ${karte.s8.join("/")} Luma ${f1(karte.l8)}, der Knoten bei ${(-2.17 + Math.log2(kb / WN.A.k)).toFixed(2)} statt −2,17 EV`); }
// das Tor 0,75: Sättigung am Gras herd-nah
say(`Tor 0,75 (Sättigung am Feuer): herd-nah Gras 0,75–2,5 m S ${HN.rows.slice(0, 4).map((r) => r.E.S.toFixed(2)).join(" / ")} — unter der Schulter ist S = 1,00 die Physik (Lichtfarbe B/R ${(C_FEUER[2] / C_FEUER[0]).toFixed(4)} × Gras-Albedo B/R ${(ATMO_BODEN[2] / ATMO_BODEN[0]).toFixed(2)})`);

say("\n## Variante: Stäbchen-Farbort Jensen (x,y 0,25/0,25) statt Grau — (c) gegen das reine Licht (Lichtfarbe × Albedo)");
for (const [n, s] of [["wiese-nacht", wieseNacht(E_MOND_H)], ["gasse nah", gasse(false)], ["herd-nah", herd(false)]]) {
  const A = auge(s); const z = s.filter((p) => !p.himmel).map((p) => { const b = bild(p.L, A.k, schirmEntscheid, JENSEN); return `${p.n} ${b.s8.join("/")} m ${b.m.toFixed(2)} Δh phys ${f1(dh(b.h, b.hPhys))}°`; });
  say(`${n}: ${z.join(" · ")}`);
}

// ───────────────────────── 7. WIRKLICHKEIT ─────────────────────────
say("\n## Gegen die Wirklichkeit (Fachwissen, ohne Netz; Marke je Zeile)");
const E1 = ePunkt(I_HERD, K_HERD, [0, H_FEUER, 0], [1, 0, 0], [0, 1, 0]), E2 = ePunkt(I_HERD, K_HERD, [0, H_FEUER, 0], [2, 0, 0], [0, 1, 0]), E3 = ePunkt(I_HERD, K_HERD, [0, H_FEUER, 0], [3, 0, 0], [0, 1, 0]);
say(`Herd I ${sig(I_HERD)} cd → Boden waagrecht 1/2/3 m: ${sig(E1)} / ${sig(E2)} / ${sig(E3)} lx; Halm 1/2/3 m: ${sig(ePunkt(I_HERD, K_HERD, [0, H_FEUER, 0], [1, 0.2, 0], null))} / ${sig(ePunkt(I_HERD, K_HERD, [0, H_FEUER, 0], [2, 0.2, 0], null))} / ${sig(ePunkt(I_HERD, K_HERD, [0, H_FEUER, 0], [3, 0.2, 0], null))} lx`);
say(`Gras-Leuchtdichte im Feuer 1/2/3 m (Halm): ${[1, 2, 3].map((r) => sig(luma(diffus(ATMO_BODEN, [{ E: ePunkt(I_HERD, K_HERD, [0, H_FEUER, 0], [r, 0.2, 0], null), c: C_FEUER }])))).join(" / ")} cd/m²`);
say(`Docht 1 cd: Wand 1 m unter dem Kopf ${sig(ePunkt(1, 0.02, [0.4, 2.8, 0], [0, 1.8, 0], [1, 0, 0]))} lx · Pflaster unter der Laterne ${sig(ePunkt(1, 0.02, [0.4, 2.8, 0], [1, 0, 0], [0, 1, 0]))} lx · Wand zwischen den Laternen ${sig(2 * ePunkt(1, 0.02, [0.4, 2.8, 0], [0, 1.5, 5], [1, 0, 0]))} lx; Mond waagrecht ${sig(E_MOND_H)} lx`);
say(`Gaslaterne (gas 16 cd) Pflaster unter dem Kopf ${sig(ePunkt(16, 0.02, [0.4, 2.8, 0], [1, 0, 0], [0, 1, 0]))} lx · zwischen Masten (10 m, 5 m weit, waagrecht) ${sig(2 * ePunkt(16, 0.02, [0.4, 2.8, 0], [1, 0, 5], [0, 1, 0]))} lx`);

// ───────────────────────── 8. GEGENPROBE: Runde 1 und 3 gegen GEMESSENE Bilder ─────────────────────────
say("\n## Gegenprobe: das Rechenmodell unter den Gesetzen der Runden 1 und 3 gegen die gemessenen Bilder");
// welt-licht.js 2ce8 :84-148 (Runde 1) und 659651da0 (Runde 3), wörtlich
const AU = { p: 0.2, q: 0.42, anteil: 0.25, welt: 7.83, lux: 115000, zmin: (0.005 * Math.PI) / 0.18 };
const S_ = (lux) => AU.welt * (Math.max(0, lux) / AU.lux) ** AU.p;
const augeLux = (w) => AU.lux * (Math.max(0, w) / AU.welt) ** (1 / AU.p);
const umg = (a) => Math.max(AU.zmin, a);
const zeig1 = (E, a) => { const A = umg(a); return Math.min(S_(A) * ((1 + E / A) ** AU.q - 1), (S_(A + E) * E) / (A + E)); };
const zeig3 = (E, a) => { const A = umg(a); return (S_(A) * E) / A; };
const blende3 = (B, a) => ((umg(a) + AU.anteil * B) / umg(a)) ** (1 - AU.p);
const kNacht = (E) => (0.22 * 2 ** -2.17) / ((0.18 / Math.PI) * E); // welt-licht.js `belichtung`, h ≤ −20°: Stufen −2,17
// Lesung ohne Quellen: aus der gemessenen k der quellenlosen Wiese (1,50, Vor-Spike r3/wiese-ohne) bzw. main-Gasse (1,574) zurück
const EW_WIESE = 0.853 / 1.5, EW_DORF = 0.853 / 1.574;
const k1 = (EW, B) => kNacht(EW + AU.anteil * zeig1(B, augeLux(EW)));
const k3 = (EW, B) => kNacht(EW) / blende3(B, augeLux(EW));
// Nacht-Auge der Runden (bild-kosten.js:2204-2246 + NACHT_AUGE :3011-3018, wörtlich)
const sstep = (a, b, x) => { const t = Math.max(0, Math.min(1, (x - a) / (b - a))); return t * t * (3 - 2 * t); };
function nachtAugeAlt(f, k) { const l = luma(f), z = Math.max(0, Math.min(1, Math.log(Math.max(l * (0.26 / 0.224), 0.005) / 0.005) / Math.log(1000)));
  const s = (1 - z) * (1 - sstep(0.18, 1, l * k)), sk = 1.22 * (0.5437 * f[1] + 0.3599 * f[2]); return f.map((v) => v * (1 - s) + sk * s); }
const altBild = (f, k) => { const s8 = srgb8(neutral(nachtAugeAlt(f, k).map((v) => v * k))); return { s8, l8: luma8(s8) }; };
// Eichpunkt (EINER): der Mond-Stoff der quellenlosen Wiese, aus dem r3-Bild umgekehrt (Vor-Spike §1: 0,0240/0,0334/0,0097 → Luma 31,7 bei k 1,5)
const STOFF_MOND = [0.024, 0.0334, 0.0097];
say(`Eichpunkt: Mond-Stoff ${STOFF_MOND.join("/")} bei k 1,5 → Luma ${f1(altBild(STOFF_MOND, 1.5).l8)} (Vor-Spike gemessen 31,7) — prüft nur, dass meine Kette dieselbe ist`);
const Q = JSON.parse(fs.readFileSync(__dirname + "/../quellen-herd.json", "utf8")), QL = JSON.parse(fs.readFileSync(__dirname + "/../quellen-lava.json", "utf8"));
const B0 = Q.boden.nah;
const P = (x, y, z) => [x, y, z];
const NAH = P(-266.5, 28.6, -1052.5), FERN = P(-252, 33, -1042), ZIEL = P(-270, 27.6, -1056);
const eAugeHerd = (cam) => Q.q.reduce((a, q) => { const d2 = (q.x - cam[0]) ** 2 + (q.y - cam[1]) ** 2 + (q.z - cam[2]) ** 2; return a + q.I / (d2 + q.k * q.k); }, 0);
const eHalmHerd = (p) => Q.q.reduce((a, q) => a + ePunkt(q.I, q.k, [q.x, q.y, q.z], p, null), 0);
const fireC = aufLuma1(lichtFarbe(2000));
const grasAlt = (E, k, zeig, EW) => { const pool = zeig(E, augeLux(EW)); const f = STOFF_MOND.map((v, i) => v + (ATMO_BODEN[i] / Math.PI) * fireC[i] * pool); return altBild(f, k); };
const meld = (n, gem, rech) => { const a = Math.abs(rech / gem - 1); return `${n}: gemessen ${sig(gem)} · gerechnet ${sig(rech)} (${a <= 0.25 ? "±25 % HÄLT" : "ROT " + (a * 100).toFixed(0) + " %"})`; };
const ERGG = [];
const zeile = (n, gem, rech) => { const a = Math.abs(rech / gem - 1); ERGG.push({ n, gem, rech, ok: a <= 0.25 }); say("- " + meld(n, gem, rech)); };
for (const [nm, cam] of [["nah", NAH], ["fern", FERN]]) {
  const B = eAugeHerd(cam); say(`Herd ${nm}: Σ E am Auge (Fit-Quellen) ${sig(B)} lx → k Runde 1 ${sig(k1(EW_WIESE, B))} · Runde 3 ${sig(k3(EW_WIESE, B))}`);
}
const Bn = eAugeHerd(NAH), Bf = eAugeHerd(FERN);
zeile("Runde 1 Herd k (gemessen 0,984; welche Kamera, ist ungeklärt → nah)", 0.984, k1(EW_WIESE, Bn));
zeile("Runde 1 Herd k, ferne Kamera", 0.984, k1(EW_WIESE, Bf));
zeile("Runde 3 Herd k (nah)", 0.199, k3(EW_WIESE, Bn));
// Kreis und ferne Wiese: Ring 1–2,5 m um den Brunnen am Ziel (−270/−1056), ferne Wiese 15 m hinter dem Ziel in Blickrichtung
const brun = Q.q[3], kreisE = [1, 1.5, 2, 2.5].map((r) => { let s = 0; for (let a = 0; a < 8; a++) s += eHalmHerd([brun.x + r * Math.cos((a * Math.PI) / 4), B0 + 0.2, brun.z + r * Math.sin((a * Math.PI) / 4)]); return s / 8; });
const dir = [ZIEL[0] - NAH[0], ZIEL[2] - NAH[2]], dl = Math.hypot(...dir), fernP = (s) => [ZIEL[0] + (dir[0] / dl) * s, B0 + 0.2, ZIEL[2] + (dir[1] / dl) * s];
const fernE = [10, 15, 20].map((s) => eHalmHerd(fernP(s)));
say(`E am Halm: Kreis r 1/1,5/2/2,5 m ${kreisE.map(sig).join(" / ")} lx · ferne Wiese 10/15/20 m hinter dem Ziel ${fernE.map(sig).join(" / ")} lx`);
for (const [R, kk, zeig, gK, gF] of [["Runde 1", k1(EW_WIESE, Bn), zeig1, 56.4, 21.0], ["Runde 3", k3(EW_WIESE, Bn), zeig3, 79.2, 12.7]]) {
  const kr = kreisE.map((E) => grasAlt(E, kk, zeig, EW_WIESE).l8), fe = fernE.map((E) => grasAlt(E, kk, zeig, EW_WIESE).l8), krM = kr.reduce((a, b) => a + b) / kr.length;
  say(`${R} (k ${sig(kk)}): Kreis r 1…2,5 m Luma ${kr.map((v) => f1(v)).join(" / ")} (Mittel ${f1(krM)}) · ferne Wiese 10/15/20 m ${fe.map((v) => f1(v)).join(" / ")}`);
  zeile(`${R} Kreis (Mittel 1–2,5 m)`, gK, krM); zeile(`${R} ferne Wiese (15 m)`, gF, fe[1]); zeile(`${R} Verhältnis Kreis ÷ fern`, gK / gF, krM / fe[1]);
}
// Lava: Fit-Scheibe (I 817 325 cd, r 7,51 m), Kamera nah 2,55 m vom Rand, 1,0 m über der Decke
const D = QL.disc, Ld = D.I / (Math.PI * D.r * D.r), cD = [D.x, D.y, D.z], LN_ = P(-243.5, 28.6, -1056);
const eAugeLava = (cam, n) => eScheibe(Ld, D.r, cD, cam, n) + QL.gb.reduce((a, q) => { const d2 = (q.x - cam[0]) ** 2 + (q.y - cam[1]) ** 2 + (q.z - cam[2]) ** 2; return a + q.I / (d2 + q.k * q.k); }, 0);
const toC = [cD[0] - LN_[0], cD[2] - LN_[2]], tl = Math.hypot(...toC), nC = [toC[0] / tl, 0, toC[1] / tl];
const BLv = eAugeLava(LN_, nC), BLm = eAugeLava(LN_, "max");
say(`Lava nah: Σ E am Auge (zur Scheibe gewandt) ${sig(BLv)} lx · (größte Richtung) ${sig(BLm)} lx (Log Runde 4: 2 270)`);
zeile("Runde 1 Lava k (zur Scheibe)", 0.587, k1(EW_WIESE, BLv));
zeile("Runde 3 Lava k (zur Scheibe)", 0.003, k3(EW_WIESE, BLv));
zeile("Runde 3 Lava k (größte Richtung)", 0.003, k3(EW_WIESE, BLm));
const lavaC = aufLuma1(lichtFarbe(1650));
for (const [R, kk, zeig, gem] of [["Runde 1", k1(EW_WIESE, BLv), zeig1, [126, 63, 20]], ["Runde 3", k3(EW_WIESE, BLv), zeig3, [233, 168, 136]]]) {
  const re = [0.5, 1, 2].map((s) => { const p = [cD[0] + (D.r + s) * -nC[0], B0 + 0.2, cD[2] + (D.r + s) * -nC[2]]; const E = eScheibe(Ld, D.r, cD, p, null); const pool = zeig(E, augeLux(EW_WIESE)); const f = STOFF_MOND.map((v, i) => v + (ATMO_BODEN[i] / Math.PI) * lavaC[i] * pool); return { s, E, b: altBild(f, kk) }; });
  say(`${R} (k ${sig(kk)}) Ufer 0,5/1/2 m: ${re.map((r) => `E ${sig(r.E)} lx → ${r.b.s8.join("/")} Luma ${f1(r.b.l8)}`).join(" · ")} — gemessen ${gem.join("/")} Luma ${f1(luma8(gem))}`);
  zeile(`${R} Ufer-Saum Luma (1 m)`, luma8(gem), re[1].b.l8);
}
// Gasse: k aus Σ E 0,245 lx (beide Runden tragen dieselbe Zahl, s. unten); vorwärts aus Docht-Laternen unsicher (Kamera-Lage unbekannt)
const solveE = (f, ziel) => { let lo = 1e-6, hi = 1e5; for (let i = 0; i < 200; i++) { const m = Math.sqrt(lo * hi); if (f(m) > ziel) hi = m; else lo = m; } return Math.sqrt(lo * hi); };
const Eg1 = solveE((E) => -k1(EW_DORF, E), -1.422), Eg3 = solveE((E) => -k3(EW_DORF, E), -1.245);
say(`Gasse: aus den gemessenen k folgt Σ E am Auge Runde 1 ${sig(Eg1)} lx · Runde 3 ${sig(Eg3)} lx — ein Gesetz-Modell, das beide k trägt, verlangt dieselbe Zahl (Abweichung ${(Math.abs(Eg1 / Eg3 - 1) * 100).toFixed(0)} %)`);
const Eh1 = solveE((E) => -k1(EW_WIESE, E), -0.984), Eh3 = solveE((E) => -k3(EW_WIESE, E), -0.199), El1 = solveE((E) => -k1(EW_WIESE, E), -0.587), El3 = solveE((E) => -k3(EW_WIESE, E), -0.003);
say(`Herd: aus k Runde 1 ${sig(Eh1)} lx · Runde 3 ${sig(Eh3)} lx (gleiche Pose? dann gleiche Zahl) · Lava: Runde 1 ${sig(El1)} lx · Runde 3 ${sig(El3)} lx`);
const docht = (d) => 1 / (d * d + 2.742 ** 2);
say(`Gasse vorwärts (U): eine Docht-Wandlaterne mit kernM 2,742 trägt am Auge höchstens ${sig(docht(0))} lx, in 3 m ${sig(docht(3))} lx — Σ E 0,245 braucht mehr als die Laternen der Gasse (der Glutbrunnen hinter dem Haus? nicht gerechnet)`);
// zweite Messreihe DERSELBEN r3-Bilder (Vor-Spike, eigene Ausschnitte, vor-spike-auge.md §1)
{ const kr = kreisE.map((E) => grasAlt(E, k3(EW_WIESE, Bn), zeig3, EW_WIESE).l8), krM = kr.reduce((a, b) => a + b) / kr.length, fe = grasAlt(fernE[1], k3(EW_WIESE, Bn), zeig3, EW_WIESE).l8;
  say(`Gegen die Vor-Spike-Ausschnitte derselben r3-Bilder (nicht Teil der ±25-%-Zählung): Gras hinter dem Bett 188,4 / Kreis (fern) 185,5 ↔ gerechnet ${f1(krM)} (${((krM / 188.4 - 1) * 100).toFixed(0)} % / ${((krM / 185.5 - 1) * 100).toFixed(0)} %) · ferne Wiese rechts (nah) 26,9 ↔ ${f1(fe)} (${((fe / 26.9 - 1) * 100).toFixed(0)} %)`); }
const hält = ERGG.filter((z) => z.ok).length;
say(`\n**Gegenprobe: ${hält} von ${ERGG.length} Zahlen auf ±25 %.**`);

fs.writeFileSync(__dirname + "/spike.out.txt", out.join("\n") + "\n");
fs.writeFileSync(__dirname + "/spike.daten.json", JSON.stringify(DATEN, null, 1));
