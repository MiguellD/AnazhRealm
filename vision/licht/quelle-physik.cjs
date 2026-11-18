// Entwurf „von der Quelle her“ — Physik-Bausteine (nur Rechnung, kein Repo-Zugriff).
// Planck → CIE 1931 (Wyman/Sloan/Shirley 2013, Mehrlappen) → XYZ → lineares sRGB; Leuchtdichte 683·∫B·ȳ;
// Khronos PBR Neutral (wie vendor mT); sRGB-OETF; Oklab (Ottosson 2020); HSV; Krawczyk-Schlüssel (2005).
const g = (x, m, s1, s2) => { const t = (x - m) * (x < m ? s1 : s2); return Math.exp(-0.5 * t * t); };
const cmf = (l) => [
  1.056 * g(l, 599.8, 0.0264, 0.0323) + 0.362 * g(l, 442.0, 0.0624, 0.0374) - 0.065 * g(l, 501.1, 0.049, 0.0382),
  0.821 * g(l, 568.8, 0.0213, 0.0247) + 0.286 * g(l, 530.9, 0.0613, 0.0322),
  1.217 * g(l, 437.0, 0.0845, 0.0278) + 0.681 * g(l, 459.0, 0.0385, 0.0725),
];
const B = (lnm, T) => { const l = lnm * 1e-9; return 1.1910429e-16 / Math.pow(l, 5) / (Math.exp(0.014387769 / (l * T)) - 1); }; // W/(m²·sr·m)
function planckXYZ(T) { let X = 0, Y = 0, Z = 0; for (let l = 360; l <= 830; l++) { const b = B(l, T) * 1e-9, c = cmf(l); X += b * c[0]; Y += b * c[1]; Z += b * c[2]; } return [X, Y, Z]; }
const leuchtdichte = (T) => 683 * planckXYZ(T)[1]; // cd/m², schwarzer Strahler
const xyz2lin = ([X, Y, Z]) => [3.2404542 * X - 1.5371385 * Y - 0.4985314 * Z, -0.969266 * X + 1.8760108 * Y + 0.041556 * Z, 0.0556434 * X - 0.2040259 * Y + 1.0572252 * Z];
const luma = (c) => 0.2126 * c[0] + 0.7152 * c[1] + 0.0722 * c[2];
// Farbe einer Temperatur, Luma 1; außerhalb des Gamuts: Weiß gleicher Luma zugemischt bis min = 0 (Farbton gehalten, kein Klemmen)
function planckFarbe(T) {
  const [X, Y, Z] = planckXYZ(T); let c = xyz2lin([X / Y, 1, Z / Y]); const m = Math.min(...c);
  if (m < 0) { const t = -m / (1 - m); c = c.map((v) => v * (1 - t) + t); } // mix zu (1,1,1)·Luma 1
  const y = luma(c); return c.map((v) => v / y);
}
function kimKang(kelvin) { // fachwerk-core.js:6487-6498, wörtlich nachgebaut
  const T = Math.min(25000, Math.max(1667, +kelvin)), T2 = T * T, T3 = T2 * T;
  const x = T <= 4000 ? -0.2661239e9 / T3 - 0.2343589e6 / T2 + 0.8776956e3 / T + 0.17991 : -3.0258469e9 / T3 + 2.1070379e6 / T2 + 0.2226347e3 / T + 0.24039;
  const x2 = x * x, x3 = x2 * x;
  const y = T <= 2222 ? -1.1063814 * x3 - 1.3481102 * x2 + 2.18555832 * x - 0.20219683 : T <= 4000 ? -0.9549476 * x3 - 1.37418593 * x2 + 2.09137015 * x - 0.16748867 : 3.081758 * x3 - 5.8733867 * x2 + 3.75112997 * x - 0.37001483;
  const X = x / y, Z = (1 - x - y) / y;
  const r = Math.max(0, 3.2404542 * X - 1.5371385 - 0.4985314 * Z), gg = Math.max(0, -0.969266 * X + 1.8760108 + 0.041556 * Z), b = Math.max(0, 0.0556434 * X - 0.2040259 + 1.0572252 * Z);
  const m = Math.max(r, gg, b); return [r / m, gg / m, b / m];
}
function neutral(c0) { // vendor three.webgpu.min.js mT (Khronos PBR Neutral), exposure schon eingerechnet
  let c = c0.slice(); const x = Math.min(...c), off = x < 0.08 ? x - 6.25 * x * x : 0.04; c = c.map((v) => v - off);
  const peak = Math.max(...c); if (peak < 0.76) return c;
  const d = 1 - 0.76, np = 1 - (d * d) / (peak + d - 0.76); c = c.map((v) => (v * np) / peak);
  const gg = 1 - 1 / (0.15 * (peak - np) + 1); return c.map((v) => v * (1 - gg) + np * gg);
}
const oetf = (v) => { v = Math.max(0, Math.min(1, v)); return v <= 0.0031308 ? 12.92 * v : 1.055 * Math.pow(v, 1 / 2.4) - 0.055; };
const srgb8 = (c) => c.map((v) => Math.round(oetf(v) * 255));
const hsv = (s) => { const mx = Math.max(...s), mn = Math.min(...s); const S = mx > 0 ? 1 - mn / mx : 0; let H = 0; const d = mx - mn;
  if (d > 0) { if (mx === s[0]) H = 60 * (((s[1] - s[2]) / d) % 6); else if (mx === s[1]) H = 60 * ((s[2] - s[0]) / d + 2); else H = 60 * ((s[0] - s[1]) / d + 4); }
  return { H: (H + 360) % 360, S }; };
function oklab(c) { // lineares sRGB → Oklab
  const l = 0.4122214708 * c[0] + 0.5363325363 * c[1] + 0.0514459929 * c[2], m = 0.2119034982 * c[0] + 0.6806995451 * c[1] + 0.1073969566 * c[2], s = 0.0883024619 * c[0] + 0.2817188376 * c[1] + 0.6299787005 * c[2];
  const [l_, m_, s_] = [l, m, s].map(Math.cbrt);
  const L = 0.2104542553 * l_ + 0.793617785 * m_ - 0.0040720468 * s_, a = 1.9779984951 * l_ - 2.428592205 * m_ + 0.4505937099 * s_, b = 0.0259040371 * l_ + 0.7827717662 * m_ - 0.808675766 * s_;
  return { L, C: Math.hypot(a, b), h: ((Math.atan2(b, a) * 180) / Math.PI + 360) % 360 };
}
const krawczyk = (La) => 1.03 - 2 / (2 + Math.log10(La + 1)); // Schlüssel a(L_a), L_a in cd/m² (Krawczyk/Myszkowski/Seidel 2005)
module.exports = { cmf, planckXYZ, leuchtdichte, planckFarbe, kimKang, neutral, oetf, srgb8, hsv, oklab, krawczyk, luma, xyz2lin };
// Umkehr von Neutral für ein GRAU (alle Kanäle gleich): Fuß 6,25·v² unter 0,08 (Ausgabe 0,04), linear −0,04 bis 0,72, darüber die Schulter
function neutralGrauUmkehr(D) {
  if (D < 0.04) return Math.sqrt(D / 6.25);
  if (D < 0.72) return D + 0.04;
  const d = 0.24; return d * d / (1 - D) - d + 0.76 + 0.04; // np = D → peak
}
// Oklab zurück
function oklabZurueck({ L, C, h }) {
  const a = C * Math.cos((h * Math.PI) / 180), b = C * Math.sin((h * Math.PI) / 180);
  const l_ = L + 0.3963377774 * a + 0.2158037573 * b, m_ = L - 0.1055613458 * a - 0.0638541728 * b, s_ = L - 0.0894841775 * a - 1.291485548 * b;
  const l = l_ ** 3, m = m_ ** 3, s = s_ ** 3;
  return [4.0767416621 * l - 3.3077115913 * m + 0.2309699292 * s, -1.2684380046 * l + 2.6097574011 * m - 0.3413193965 * s, -0.0041960863 * l - 0.7034186147 * m + 1.707614701 * s];
}
// Neutral mit gehaltenem Farbton: Khronos wie oben, danach der Oklab-Farbton der Eingangsfarbe (vor der Entsättigung), L und C des Khronos-Ergebnisses;
// außerhalb des Gamuts: C halbiert bis drin
function neutralFarbton(c0) {
  const k = neutral(c0); const peak = Math.max(...c0.map((v) => v)); if (peak < 0.76 + 0.04) return k;
  const h0 = oklab(c0.map((v) => Math.max(0, v))).h, o = oklab(k); let C = o.C, r;
  for (let i = 0; i < 20; i++) { r = oklabZurueck({ L: o.L, C, h: h0 }); if (Math.min(...r) >= -1e-4 && Math.max(...r) <= 1 + 1e-4) break; C *= 0.8; }
  return r.map((v) => Math.max(0, Math.min(1, v)));
}
module.exports.neutralGrauUmkehr = neutralGrauUmkehr; module.exports.oklabZurueck = oklabZurueck; module.exports.neutralFarbton = neutralFarbton;
