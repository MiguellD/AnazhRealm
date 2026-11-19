// RECHNUNG 2 — DIE KURVE NACH LEUCHTDICHTE. Nur rechnen. Ausgabe r2-kurve.out.txt.
// Bausteine nachgebaut aus widerleger-annahmen.cjs (Planck-Ort, Monte Carlo mit derselben Saat) und spike.cjs (Vendor-Neutral wörtlich).
"use strict";
const fs = require("fs");
const K = require("./kurve.js");
const out = []; const say = (s = "") => { out.push(s); console.log(s); };
const f = (v, n = 2) => (isFinite(v) ? (+v).toFixed(n) : "—");
// ── Planck-Ort (Wyman-Gauß-CMF wie widerleger-annahmen.cjs), planckFarbe = Weiß gleicher Luma zugemischt (Entscheid §1) ──
const gs = (x, m, a, b) => { const t = (x - m) * (x < m ? a : b); return Math.exp(-0.5 * t * t); };
const cmf = (l) => [1.056 * gs(l, 599.8, 0.0264, 0.0323) + 0.362 * gs(l, 442.0, 0.0624, 0.0374) - 0.065 * gs(l, 501.1, 0.049, 0.0382), 0.821 * gs(l, 568.8, 0.0213, 0.0247) + 0.286 * gs(l, 530.9, 0.0613, 0.0322), 1.217 * gs(l, 437.0, 0.0845, 0.0278) + 0.681 * gs(l, 459.0, 0.0385, 0.0725)];
const pB = (nm, T) => { const l = nm * 1e-9; return 1.1910429e-16 / l ** 5 / (Math.exp(0.014387769 / (l * T)) - 1); };
const XYZ = (T) => { let X = 0, Y = 0, Z = 0; for (let l = 360; l <= 830; l++) { const b = pB(l, T), c = cmf(l); X += b * c[0]; Y += b * c[1]; Z += b * c[2]; } return [X / Y, 1, Z / Y]; };
const lin = ([X, Y, Z]) => [3.2404542 * X - 1.5371385 * Y - 0.4985314 * Z, -0.969266 * X + 1.8760108 * Y + 0.041556 * Z, 0.0556434 * X - 0.2040259 * Y + 1.0572252 * Z];
const luma = (c) => 0.2126 * c[0] + 0.7152 * c[1] + 0.0722 * c[2];
const planckFarbe = (T) => { let c = lin(XYZ(T)); const m = Math.min(...c); if (m < 0) { const t = -m / (1 - m); c = c.map((v) => v * (1 - t) + t); } const y = luma(c); return c.map((v) => v / y); };
// ── Oklab ──
function oklab(c) { const l = 0.4122214708 * c[0] + 0.5363325363 * c[1] + 0.0514459929 * c[2], m = 0.2119034982 * c[0] + 0.6806995451 * c[1] + 0.1073969566 * c[2], s = 0.0883024619 * c[0] + 0.2817188376 * c[1] + 0.6299787005 * c[2]; const [a_, b_, c_] = [l, m, s].map((v) => Math.cbrt(Math.max(0, v))); const A = 1.9779984951 * a_ - 2.428592205 * b_ + 0.4505937099 * c_, B = 0.0259040371 * a_ + 0.7827717662 * b_ - 0.808675766 * c_; return { L: 0.2104542553 * a_ + 0.793617785 * b_ - 0.0040720468 * c_, C: Math.hypot(A, B), h: ((Math.atan2(B, A) * 180) / Math.PI + 360) % 360 }; }
function oklabInv({ L, C, h }) { const a = C * Math.cos((h * Math.PI) / 180), b = C * Math.sin((h * Math.PI) / 180); const l_ = L + 0.3963377774 * a + 0.2158037573 * b, m_ = L - 0.1055613458 * a - 0.0638541728 * b, s_ = L - 0.0894841775 * a - 1.291485548 * b; const l = l_ ** 3, m = m_ ** 3, s = s_ ** 3; return [4.0767416621 * l - 3.3077115913 * m + 0.2309699292 * s, -1.2684380046 * l + 2.6097574011 * m - 0.3413193965 * s, -0.0041960863 * l - 0.7034186147 * m + 1.707614701 * s]; }
const dh = (a, b) => { const x = Math.abs(a - b) % 360; return Math.min(x, 360 - x); };
// ── die Kurven ──
// N: Vendor-Neutral wörtlich (three r184 `mT`)
function neutral(e0) { const r = 0.76, s = 0.15; let e = e0.slice(); const i = Math.min(...e), n = i < 0.08 ? i - 6.25 * i * i : 0.04; e = e.map((v) => v - n); const a = Math.max(...e); if (a < r) return e; const o = 1 - r, u = 1 - (o * o) / (a + o - r); e = e.map((v) => (v * u) / a); const l = 1 - 1 / (s * (a - u) + 1); return e.map((v) => v * (1 - l) + u * l); }
const im = (c) => c.every((v) => v >= -1e-6 && v <= 1 + 1e-6);
function huehalt(N, h0) { // Entscheid §1: L und C aus dem Ergebnis, h der Eingang, C in 4 Halbierungen
  const o = oklab(N); let r = oklabInv({ L: o.L, C: o.C, h: h0 }); if (im(r)) return r.map((v) => Math.max(0, Math.min(1, v)));
  let lo = 0, hi = o.C, best = oklabInv({ L: o.L, C: 0, h: h0 }); for (let i = 0; i < 4; i++) { const mid = (lo + hi) / 2, t = oklabInv({ L: o.L, C: mid, h: h0 }); if (im(t)) { lo = mid; best = t; } else hi = mid; } return best.map((v) => Math.max(0, Math.min(1, v))); }
// E: die Kurve des Entscheids (Khronos nach dem hellsten Kanal, Fuß nach dem dunkelsten, Oklab-h der Eingangsfarbe)
const kurveE = (x) => huehalt(neutral(x), oklab(x).h);
// K2: Khronos nach Peak wie der Entscheid, nur der Fuß nach Y (als Skalierung, farbton-treu)
function kurveK2(x) { const Y = luma(x); if (!(Y > 0)) return [0, 0, 0]; const off = Y < 0.08 ? Y - 6.25 * Y * Y : 0.04; let e = x.map((v) => (v * (Y - off)) / Y);
  const r = 0.76, s = 0.15, a = Math.max(...e); if (a >= r) { const o = 1 - r, u = 1 - (o * o) / (a + o - r); e = e.map((v) => (v * u) / a); const l = 1 - 1 / (s * (a - u) + 1); e = e.map((v) => v * (1 - l) + u * l); }
  return huehalt(e, oklab(x).h); }
// K1: die Kurve nach Leuchtdichte (kurve.js)
const kurveK1 = (x) => K.schirm(x);
const kurveK1fein = (x) => K.schirm(x, 40);
// K3: Y-Kurve, aber Oklab-L = ∛Y_aus (die Helligkeit des Grau gleicher Y) und Gamut bei festem Oklab-L (wahrnehmungs-treu statt Y-treu)
function kurveK3(x) { const Y = luma(x); if (!(Y > 0)) return [0, 0, 0]; const [Yo, g] = K.neutralY(Y); const o = oklab(x); const Lo = Math.cbrt(Yo); let C = (o.C / o.L) * (1 - g) * Lo;
  let r = oklabInv({ L: Lo, C, h: o.h }); if (im(r)) return r.map((v) => Math.max(0, Math.min(1, v)));
  let lo = 0, hi = C, best = oklabInv({ L: Lo, C: 0, h: o.h }); for (let i = 0; i < 7; i++) { const mid = (lo + hi) / 2, t = oklabInv({ L: Lo, C: mid, h: o.h }); if (im(t)) { lo = mid; best = t; } else hi = mid; } return best.map((v) => Math.max(0, Math.min(1, v))); }
const KURVEN = [["Vendor-Neutral", neutral], ["E Entscheid (Peak + Oklab-h)", kurveE], ["K1 Y-Kurve + Oklab-h + σ, Gamut bei fester Y", kurveK1], ["K2 Peak-Schulter, Fuß nach Y", kurveK2], ["K3 Y-Kurve, Gamut bei festem Oklab-L", kurveK3]];
const oetf = (v) => { v = Math.max(0, Math.min(1, v)); return v <= 0.0031308 ? 12.92 * v : 1.055 * v ** (1 / 2.4) - 0.055; };
const eotf = (e) => (e <= 0.04045 ? e / 12.92 : ((e + 0.055) / 1.055) ** 2.4);
const s8 = (c) => c.map((v) => Math.round(oetf(v) * 255));
const Y8 = (c) => luma(s8(c).map((v) => eotf(v / 255)));
const Y8r = (c, rund) => luma(c.map((v) => eotf(rund(oetf(v) * 255) / 255)));

// ══ 0. Satz: (a) für ALLE Paare ⇔ Y_aus hängt nur an Y_ein, monoton ══
say("# RECHNUNG 2 — die Kurve nach Leuchtdichte");
say("\n## 0. Der Satz, der die Kurve festlegt");
say("(a) für alle Farbpaare verlangt: Y_ein₁ > Y_ein₂ ⇒ Y_aus₁ ≥ Y_aus₂. Gäbe es zwei Farben gleicher Y_ein mit Y_aus₁ > Y_aus₂, so kehrt eine");
say("beliebig kleine Hebung der zweiten die Ordnung um (Stetigkeit). Also ist Y_aus = g(Y_ein), g monoton. Grau (Y = jeder Kanal) muss");
say("Neutral laufen ⇒ g = die Neutral-Kurve auf Grau. Damit sind Fuß UND Schulter für jede Farbe die des Graus gleicher Leuchtdichte —");
say("auch der Fuß 6,25·Y² für dunkles Orange (Preis in §6).");

// ══ 1. Monte Carlo (a) — dieselbe Saat, dieselben Paare wie widerleger-annahmen.cjs ══
say("\n## 1. (a) Ordnung, Monte Carlo (Saat 7, 40 000 Ziehungen, Planck 1100…5772 K × 7 Albedos × k·L 2^−6…2^4, Ausgabe-Y nach 8 Bit)");
const ALB = [[0.1003, 0.1385, 0.0449], [0.0906, 0.2034, 0.0447], [0.2758, 0.1316, 0.0889], [0.2641, 0.2377, 0.1761], [0.1154, 0.0785, 0.0471], [0.18, 0.18, 0.18], [0.8196, 0.6359, 0.2799]];
const TS = [1100, 1650, 1850, 2000, 2700, 4100, 5772];
const PB = Object.fromEntries(TS.map((T) => [T, planckFarbe(T)]));
let seed = 7; const rnd = () => ((seed = (seed * 1103515245 + 12345) % 2147483648) / 2147483648);
const ERG = {};
for (const [nm, Kf] of KURVEN) {
  let n = 0, inv = 0, invGross = 0, worst = 0, bsp = "", invSicht = 0, worstSicht = 0, invEcht = 0, worstEcht = 0, hoechst = 0, invFloat = 0, worstFloat = 0, fussInv = 0, schInv = 0, negKanal = 0;
  seed = 7;
  for (let i = 0; i < 40000; i++) {
    const mk = () => { const T = TS[(rnd() * TS.length) | 0], c = PB[T], a = ALB[(rnd() * ALB.length) | 0], s = 2 ** (rnd() * 10 - 6); return { T, x: c.map((v, j) => v * a[j] * s) }; };
    const P = mk(), Q = mk(); const yp = luma(P.x), yq = luma(Q.x); if (Math.abs(Math.log2(yp / yq)) < 0.05) continue; n++;
    const [lo, hi] = yp < yq ? [P, Q] : [Q, P];
    const Ol = Kf(lo.x), Oh = Kf(hi.x); if (Ol.some((v) => v < -1e-6) || Oh.some((v) => v < -1e-6)) negKanal++;
    const yl = luma(Ol), yh = luma(Oh); if (yl > yh * (1 + 1e-9) + 1e-12) { invFloat++; worstFloat = Math.max(worstFloat, Math.log2(yl / yh)); }
    const ol = Y8(Ol), oh = Y8(Oh);
    const Y1 = 0.2126 * eotf(1 / 255); if (ol > oh + 1e-9 && oh >= Y1) { invSicht++; worstSicht = Math.max(worstSicht, Math.log2(ol / oh)); }
    if (Y8r(Ol, Math.floor) > Y8r(Oh, Math.ceil) + 1e-12) { invEcht++; worstEcht = Math.max(worstEcht, Math.log2(Y8r(Ol, Math.floor) / Y8r(Oh, Math.ceil))); }
    if (ol > oh + 1e-9) hoechst = Math.max(hoechst, ol);
    if (ol > oh + 1e-9) { inv++; const r = oh > 0 ? Math.log2(ol / oh) : Infinity; if (luma(hi.x) < 0.3) fussInv++; else schInv++; if (r > worst) { worst = r; bsp = `${lo.T} K Y ${f(luma(lo.x), 4)} → ${f(ol, 4)} über ${hi.T} K Y ${f(luma(hi.x), 4)} → ${f(oh, 4)}`; } if (r > 0.1) invGross++; }
  }
  ERG[nm] = { n, inv, invGross, worst, invSicht, worstSicht, invEcht, worstEcht };
  say(`${nm}: ${n} Paare → nach 8 Bit umgekehrt ${inv} (davon > 0,1 EV ${invGross}; Y_ein des helleren < 0,3: ${fussInv}, ≥ 0,3: ${schInv}), größte ${f(worst, 3)} EV${bsp ? " (" + bsp + ")" : ""} · davon mit dunklerer Ausgabe ≥ Code 1 Rot (Y ≥ ${f(0.2126 * eotf(1 / 255), 6)}): ${invSicht}, größte ${f(worstSicht, 3)} EV · auch bei günstigster Rundung (dunklere abgerundet über hellerer aufgerundet) ${invEcht}, größte ${f(worstEcht, 3)} EV · höchste Ausgabe-Y einer Umkehr ${f(hoechst, 4)} · in Fließkomma umgekehrt ${invFloat} (größte ${f(worstFloat, 4)} EV) · Kanal < 0: ${negKanal}`);
}

// ══ 2. Oklab-Farbton-Drift ══
say("\n## 2. Oklab-Farbton-Drift: Planck × Albedo × k·L 0,05 … 16 (Fließkomma vor der OETF; in Klammern nach 8 Bit, daneben die 8-Bit-Toleranz Δh_tol am Pixel)");
const ALBN = { "Gras (ATMO_BODEN)": [0.1003, 0.1385, 0.0449], "Putz (albedo-tafel haus)": [0.2758, 0.1316, 0.0889], "weiß": [1, 1, 1] };
const KLS = [0.05, 0.1, 0.2, 0.3, 0.5, 0.76, 1, 1.5, 2, 4, 8, 16];
function dhTol(c8) { const h0 = oklab(c8.map((v) => eotf(v / 255))).h; let mx = 0; for (let a = -1; a <= 1; a++) for (let b = -1; b <= 1; b++) for (let c = -1; c <= 1; c++) { const t = [c8[0] + a, c8[1] + b, c8[2] + c].map((v) => Math.max(0, Math.min(255, v))); const o = oklab(t.map((v) => eotf(v / 255))); if (o.C > 1e-4) mx = Math.max(mx, dh(o.h, h0)); } return mx; }
for (const [nm, Kf] of KURVEN) {
  let mx = 0, wo = "", mx8 = 0, wo8 = "", ueberTol = 0, n8 = 0;
  for (const T of [1100, 1326, 1900, 2000]) for (const [an, a] of Object.entries(ALBN)) {
    const c0 = planckFarbe(T).map((v, j) => v * a[j]); const y0 = luma(c0); const c = c0.map((v) => v / y0); const h0 = oklab(c).h;
    for (const kl of KLS) { const o = Kf(c.map((v) => v * kl)); const oo = oklab(o); if (oo.C > 1e-3) { const d = dh(oo.h, h0); if (d > mx) { mx = d; wo = `${T} K × ${an} bei k·L ${kl}`; } }
      const c8 = s8(o), o8 = oklab(c8.map((v) => eotf(v / 255))); if (o8.C > 0.02) { n8++; const d8 = dh(o8.h, h0), tol = dhTol(c8); if (d8 > tol) ueberTol++; if (d8 > mx8) { mx8 = d8; wo8 = `${T} K × ${an} bei k·L ${kl} (${c8.join("/")}, tol ${f(tol, 1)}°)`; } } }
  }
  ERG[nm].dh = mx; ERG[nm].ueberTol = ueberTol;
  say(`${nm}: max ${f(mx, 2)}° (${wo}) · nach 8 Bit max ${f(mx8, 1)}° (${wo8}); über Δh_tol: ${ueberTol} von ${n8} Pixeln mit C > 0,02`);
}

// ══ 3. Grau gegen Vendor-Neutral ══
say("\n## 3. Grau 0 … 4 (Schritt 0,0005) gegen Vendor-Neutral: größte Abweichung in Code-Werten; Mittags-Karte k·L 0,22");
for (const [nm, Kf] of KURVEN) { let mx = 0, wo = 0; for (let v = 0; v <= 4; v += 0.0005) { const a = s8(Kf([v, v, v])), b = s8(neutral([v, v, v])); const d = Math.max(...a.map((x, i) => Math.abs(x - b[i]))); if (d > mx) { mx = d; wo = v; } }
  ERG[nm].grau = mx; say(`${nm}: max |Δ| ${mx} Code${mx ? " bei " + f(wo, 4) : ""} · Karte 0,22 → ${s8(Kf([0.22, 0.22, 0.22])).join("/")}`); }
// near-gray: eine leicht farbige Karte (Sonne 5 772 K × 18 %): K1 gegen Neutral
{ const c = planckFarbe(5772); let mx = 0, wo = 0; for (let v = 0.01; v <= 0.76; v += 0.001) { const x = c.map((q) => q * v); const a = s8(kurveK1(x)), b = s8(neutral(x)); const d = Math.max(...a.map((q, i) => Math.abs(q - b[i]))); if (d > mx) { mx = d; wo = v; } }
  { const c = planckFarbe(5772).map((q) => q * 0.22); say(`Karte 18 % im Sonnenlicht (5 772 K) bei k·L 0,22: Neutral ${s8(neutral(c)).join("/")} · K1 ${s8(kurveK1(c)).join("/")}`); }
  say(`fast grau (Planck 5 772 K, auf Luma 1 ${c.map((q) => f(q, 3)).join("/")}) k·L 0,01 … 0,76: K1 gegen Neutral max |Δ| ${mx} Code bei k·L ${f(wo, 3)}`); }

// ══ 4. Die Feuerfarbe am Übergang ══
say("\n## 4. Das Bild der Feuerfarbe: sRGB-Tripel (Oklab C · h) bei k·L 0,3 / 0,76 / 1,5 / 4 / 16");
const FEUER = { "Glut 1 100 K": planckFarbe(1100), "Kruste 1 326 K": planckFarbe(1326), "Herd 2 000 K": planckFarbe(2000), "Feuer × Gras": (() => { const c = planckFarbe(2000).map((v, j) => v * ALBN["Gras (ATMO_BODEN)"][j]); const y = luma(c); return c.map((v) => v / y); })() };
for (const [fn, c] of Object.entries(FEUER)) {
  const h0 = oklab(c).h; say(`### ${fn} (Eingang Oklab h ${f(h0, 1)}°, C/L ${f(oklab(c).C / oklab(c).L, 3)}; hellster Kanal / Y = ${f(Math.max(...c), 3)} → verlässt sRGB bei reiner Skalierung ab Y_aus = ${f(1 / Math.max(...c), 3)})`);
  for (const [nm, Kf] of KURVEN) { const z = [0.3, 0.76, 1.5, 4, 16].map((kl) => { const o = Kf(c.map((v) => v * kl)), q = s8(o), ok = oklab(q.map((v) => eotf(v / 255))); return `${q.join("/")} (C ${f(ok.C, 3)} h ${f(ok.h, 0)}°)`; }); say(`${nm}: ${z.join(" · ")}`); }
}

// ══ 5. Wo die Farbe den Gamut verlässt, und was K1 dann tut ══
say("\n## 5. K1: ab welcher Leuchtdichte die Buntheit fällt, und wie (σ_aus/σ_ein, Y_aus exakt)");
for (const [fn, c] of Object.entries(FEUER)) {
  const r = Math.max(...c), YoGrenze = 1 / r; let Yein = YoGrenze >= 0.04 ? (YoGrenze < 0.04 ? NaN : YoGrenze + 0.04) : Math.sqrt(YoGrenze / 6.25);
  if (YoGrenze + 0.04 < 0.08) Yein = Math.sqrt(YoGrenze / 6.25);
  const z = [0.1, 0.2, 0.3, 0.5, 0.76, 1, 1.5, 2, 4, 8, 16].map((kl) => { const x = c.map((v) => v * kl), o = kurveK1(x), oi = oklab(x), oo = oklab(o); return `${kl}: Y ${f(luma(o), 3)} σ ${f(oo.C / oo.L / (oi.C / oi.L), 2)}`; });
  say(`${fn}: Gamut-Rand bei Y_aus ${f(YoGrenze, 3)} (Y_ein ${f(Yein, 3)}) — ${z.join(" · ")}`);
}

// ══ 6. Der Preis des Fußes nach Y: dunkles Orange gegen Neutral ══
say("\n## 6. Preis des Satzes (§0): dunkle bunte Flecke laufen durch den Fuß des Graus");
for (const [fn, c] of [["Laternen-Wand (Docht 1 850 K × Putz)", (() => { const q = planckFarbe(1850).map((v, j) => v * ALBN["Putz (albedo-tafel haus)"][j]); const y = luma(q); return q.map((v) => v / y); })()], ["Feuer × Gras", FEUER["Feuer × Gras"]], ["Mond-Wand (4 100 K × Putz)", (() => { const q = planckFarbe(4100).map((v, j) => v * ALBN["Putz (albedo-tafel haus)"][j]); const y = luma(q); return q.map((v) => v / y); })()]]) {
  const z = [0.003, 0.006, 0.01, 0.02, 0.05, 0.08, 0.15, 0.3].map((y) => { const x = c.map((v) => v * y); const n = neutral(x), k = kurveK1(x); return `Y ${y}: N ${s8(n).join("/")} ↔ K1 ${s8(k).join("/")} (${f(Math.log2(Math.max(1e-9, luma(k)) / Math.max(1e-9, luma(n))), 2)} EV)`; });
  say(`${fn}: ${z.join(" · ")}`);
}

// ══ 7. Genauigkeit der 7 festen Schritte ══
say("\n## 7. K1 mit 8 festen Halbierungen + 1 Sekante gegen 40 Halbierungen (Monte-Carlo-Farben und Feuer-Gitter)");
{ let mxC = 0, mxCode = 0, mxY = 0; seed = 11; for (let i = 0; i < 20000; i++) { const T = TS[(rnd() * TS.length) | 0], a = ALB[(rnd() * ALB.length) | 0], s = 2 ** (rnd() * 10 - 6); const x = PB[T].map((v, j) => v * a[j] * s);
    const A = kurveK1(x), B = kurveK1fein(x); const oa = oklab(A), ob = oklab(B); mxC = Math.max(mxC, Math.abs(oa.C - ob.C)); mxY = Math.max(mxY, Math.abs(luma(A) - luma(B))); const ca = s8(A), cb = s8(B); mxCode = Math.max(mxCode, ...ca.map((q, j) => Math.abs(q - cb[j]))); }
  say(`max |ΔC| ${mxC.toExponential(2)} (Oklab) · max |ΔY| ${mxY.toExponential(2)} · max |Δ Code| ${mxCode}`); }

// ══ 8. Preis je Pixel (gezählt, nicht gemessen) ══
say("\n## 8. Preis je Pixel (ALU gezählt aus dem WGSL, nicht am Gerät gemessen)");
say("K1: Luma 3 · Skalar-Kurve ~10 · lms 9 + 3 pow · Oklab 12 · okEins (3 Würfel + Matrix 9 + Luma 3) ≈ 25 → Prüfung ≈ 32; ohne Gamut-Schnitt 1 Prüfung (≈ 70 ALU), mit Schnitt 9 Prüfungen + 2 Überschüsse + 1 Prüfung ≈ 12 × 32 ≈ 400 ALU.");
say("Bei Skala 0,75 (1 440 × 810 = 1,17 Mpx) und GTX 1050 (≈ 1,8 TFLOP/s): ohne Schnitt ≈ 0,05 ms, schlimmstenfalls (jeder Pixel im Schnitt) ≈ 0,26 ms. Nur Flecke über dem Gamut-Rand (Glut, Feuer, Himmel nahe der Sonne) zahlen den Schnitt; die Divergenz in der Welle kostet bis zum schlimmsten Fall.");

// ══ 9. Tafel ══
say("\n## 9. Tafel");
say("| Kurve | Umkehrungen (8 Bit) | > 0,1 EV | größte EV | jenseits der Rundung | größte EV dort | Oklab-Drift max ° (Fließkomma) | Grau gegen Neutral (Code) |");
say("|---|---|---|---|---|---|---|---|");
for (const [nm] of KURVEN) { const e = ERG[nm]; say(`| ${nm} | ${e.inv} / ${e.n} | ${e.invGross} | ${f(e.worst, 2)} | ${e.invEcht} | ${f(e.worstEcht, 2)} | ${f(e.dh, 1)} | ${e.grau} |`); }
fs.writeFileSync(__dirname + "/r2-kurve.out.txt", out.join("\n") + "\n");
