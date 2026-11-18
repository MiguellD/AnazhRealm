// Nachrechnung der tragenden Zahlen der Tafel. Formeln kopiert aus welt-licht.js:84-148, fachwerk-core.js:6487-6545,
// Vendor neutralToneMapping (three.webgpu.min.js `mT`). Keine Datei im Baum wird gelesen oder geschrieben.
const AUGE = { p: 0.2, q: 0.42, welt: 7.83, lux: 115000, eps: 0.1 };
const S = (lux) => AUGE.welt * Math.pow(Math.max(0, lux) / AUGE.lux, AUGE.p);
const Sinv = (w) => AUGE.lux * Math.pow(w / AUGE.welt, 1 / AUGE.p);
const f = (x, n = 4) => Number(x.toPrecision(n));
const out = [];
out.push("1 Welt-Einheit am Tag (linear) = " + f(AUGE.lux / AUGE.welt) + " lx");
out.push("p aus ln13,1/ln385000 = " + f(Math.log(13.1) / Math.log(385000)));
out.push("S^-1(0,598) = " + f(Sinv(0.598)) + " lx ; 115000/385000 = " + f(115000 / 385000) + " lx");
out.push("S(0,26 lx Vollmond) = " + f(S(0.26)) + " ; S(0,0005 lx Sterne) = " + f(S(0.0005)) + " ; S(3,01 lx bei -6°) = " + f(S(3.01)));
const MOND_E = 0.65 * (0.2126 * 0x9f / 255 + 0.7152 * 0xb8 / 255 + 0.0722 * 0xdc / 255);
out.push("MOND_E (Ton roh als linear) = " + f(MOND_E) + " ; Stern-Leuchtdichte = " + f(MOND_E * 0.0005 / 0.3965 / Math.PI) +
  " ; × π = " + f(MOND_E * 0.0005 / 0.3965) + " ; Faktor gegen S(0,0005) = " + f(S(0.0005) / (MOND_E * 0.0005 / 0.3965)));
out.push("Sonne direkt / Mond direkt bei gleicher Höhe = " + f(2.6 * Math.PI / 0.65) + " : 1 ; physikalisch nötige MOND_STAERKE = " + f(2.6 * Math.PI / 385000));
out.push("NACHT_AUGE linear 0,26/0,224 = " + f(0.26 / 0.224) + " lx je Einheit ; unter S: 0,26 lx / S(0,26) = " + f(0.26 / S(0.26)) + " lx je Einheit");

// Planck × V(λ)
function leuchtdichte(T) { let s = 0; for (let nm = 380; nm <= 780; nm += 5) { const l = nm * 1e-9, u = nm * 1e-3 - 0.559;
  s += (1.1910429e-16 / l ** 5 / (Math.exp(0.014387769 / (l * T)) - 1)) * 1.019 * Math.exp(-285.4 * u * u) * 5e-9; } return 683 * s; }
const Lf = leuchtdichte(2000) * 0.0012, A = Math.PI / 4 * 0.76 * 0.76;
out.push("Feuer: L(2000K)·0,0012 = " + f(Lf) + " cd/m² ; × Bett 0,4536 m² = " + f(Lf * A) + " cd ; gemaltes Datum 10000 / Pool = " + f(10000 / Lf) +
  " ; ε, das 10000 trüge = " + f(10000 / leuchtdichte(2000)));
out.push("Brand-Boden k4=1: π/16 m² × " + f(Lf) + " = " + f(Math.PI / 16 * Lf) + " cd ; Deckel r=8 m: " + f(Math.PI * 64 * Lf) + " cd");
// Brenner gegen Kopf-Glut
for (const [n, cd] of [["docht", 1], ["argand", 10], ["gas", 16], ["gluehstrumpf", 100], ["gluehlampe", 110]])
  out.push("Brenner " + n + ": Pool " + cd + " cd, Kopf-Glut liest 960 cd/m² statt " + f(960 * cd / 100) + " → Faktor " + f(100 / cd));
// Kopf: [5;5;3,75;-4,25] nach Blatt c, Haube hb 0,2 m, s 0,04 m
const grad = (t) => f(Math.atan(t) * 180 / Math.PI, 3);
const kx = 0.2 / 0.04, kxd = 0.2 * Math.SQRT2 / 0.04, ky = 5;
out.push("Kopf Inkreis: frei bis " + grad((ky - 1) / kx) + "°, dunkel ab " + grad((ky + 1) / kx) + "° ; Diagonale: frei bis " + grad((ky - 1) / kxd) + "°, dunkel ab " + grad((ky + 1) / kxd) + "°");

// lichtFarbe (Kim-Kang) und Neutral
function lichtFarbe(kelvin) { const T = Math.min(25000, Math.max(1667, +kelvin)), T2 = T * T, T3 = T2 * T;
  const x = T <= 4000 ? -0.2661239e9 / T3 - 0.2343589e6 / T2 + 0.8776956e3 / T + 0.17991 : -3.0258469e9 / T3 + 2.1070379e6 / T2 + 0.2226347e3 / T + 0.24039;
  const x2 = x * x, x3 = x2 * x;
  const y = T <= 2222 ? -1.1063814 * x3 - 1.3481102 * x2 + 2.18555832 * x - 0.20219683 : T <= 4000 ? -0.9549476 * x3 - 1.37418593 * x2 + 2.09137015 * x - 0.16748867 : 3.081758 * x3 - 5.8733867 * x2 + 3.75112997 * x - 0.37001483;
  const X = x / y, Z = (1 - x - y) / y;
  const r = Math.max(0, 3.2404542 * X - 1.5371385 - 0.4985314 * Z), g = Math.max(0, -0.969266 * X + 1.8760108 + 0.041556 * Z), b = Math.max(0, 0.0556434 * X - 0.2040259 + 1.0572252 * Z);
  const m = Math.max(r, g, b); return [r / m, g / m, b / m]; }
function neutral(c) { c = c.slice(); const sc = 0.76, ds = 0.15; const m = Math.min(...c); const off = m < 0.08 ? m - 6.25 * m * m : 0.04;
  c = c.map((v) => v - off); const P = Math.max(...c); if (P < sc) return c; const d = 1 - sc; const Pn = 1 - d * d / (P + d - sc);
  c = c.map((v) => v * Pn / P); const g = 1 - 1 / (ds * (P - Pn) + 1); return c.map((v) => v * (1 - g) + Pn * g); }
const enc = (v) => Math.round(255 * Math.min(1, Math.max(0, v <= 0.0031308 ? 12.92 * v : 1.055 * v ** (1 / 2.4) - 0.055)));
function hs(rgb) { const [r, g, b] = rgb.map((v) => v / 255); const mx = Math.max(r, g, b), mn = Math.min(r, g, b), d = mx - mn;
  let h = 0; if (d > 0) h = mx === r ? 60 * (((g - b) / d) % 6) : mx === g ? 60 * ((b - r) / d + 2) : 60 * ((r - g) / d + 4); if (h < 0) h += 360;
  return [f(h, 3), f(mx > 0 ? d / mx : 0, 3)]; }
for (const K of [1667, 1900, 2000, 2800]) {
  const c = lichtFarbe(K), lu = 0.2126 * c[0] + 0.7152 * c[1] + 0.0722 * c[2];
  out.push("lichtFarbe(" + K + ") = [" + c.map((v) => f(v, 3)).join(", ") + "] Luma " + f(lu, 3));
  for (const L of [0.1, 0.3, 0.6, 1, 2, 4]) { const x = c.map((v) => v / lu * L); const o = neutral(x).map(enc); const [h, s] = hs(o);
    out.push("   k·L Luma " + L + " → sRGB (" + o.join(", ") + ") Farbton " + h + "° Sättigung(HSV) " + s); }
}
console.log(out.join("\n"));
