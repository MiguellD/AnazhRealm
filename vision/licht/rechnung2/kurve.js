// DIE KURVE NACH LEUCHTDICHTE (K1, Rechnung 2) — schirm(x): lineares sRGB × k  →  lineares sRGB vor der OETF.
// Gesetz: Y_aus = N(Y_ein) mit N = Vendor-Neutral (three r184 `mT`) auf Grau (Fuß 0,08/6,25/0,04, Schulter 0,76, Entsättigung
// 0,15) — darum ist Grau byte-gleich Neutral und die Ordnung nach Leuchtdichte Y gilt für jedes Farbpaar. Der Farbton ist der
// Oklab-Farbton der Eingangsfarbe; die Buntheit σ = C/L (Oklab) bleibt, fällt über der Schulter mit Khronos (1 − g) und, wo
// sRGB bei dieser Y keinen Platz hat, bis an den Rand des Gamuts — bei fester Y und festem Farbton (8 feste Halbierungs-Schritte und ein Sekanten-Schritt).
// Weil l', m', s' bei festem σ und Farbton linear in L sind, ist rgb ∝ L³: die Farbe bei (σ, h) und Leuchtdichte Y ist
// Y · rgb(1, σ, h) / Y(rgb(1, σ, h)) — geschlossen, ohne Suche nach L.
"use strict";
const R = 0.76, D = 0.15, SCHRITTE = 8;
// die Skalar-Kurve von Vendor-Neutral auf Grau: Y → Y_aus, dazu g (Khronos-Entsättigung), beides aus derselben Rechnung
function neutralY(Y) {
  const off = Y < 0.08 ? Y - 6.25 * Y * Y : 0.04;
  const p = Y - off;
  if (p < R) return [p, 0];
  const q = 1 - (1 - R) * (1 - R) / (p + (1 - R) - R);
  return [q, 1 - 1 / (D * (p - q) + 1)];
}
// lineares sRGB bei Oklab (L = 1, a = σ·ca, b = σ·sa)
function rgbEins(s, ca, sa) {
  const l_ = 1 + s * (0.3963377774 * ca + 0.2158037573 * sa);
  const m_ = 1 + s * (-0.1055613458 * ca - 0.0638541728 * sa);
  const s_ = 1 + s * (-0.0894841775 * ca - 1.291485548 * sa);
  const l = l_ * l_ * l_, m = m_ * m_ * m_, z = s_ * s_ * s_;
  return [4.0767416621 * l - 3.3077115913 * m + 0.2309699292 * z, -1.2684380046 * l + 2.6097574011 * m - 0.3413193965 * z, -0.0041960863 * l - 0.7034186147 * m + 1.707614701 * z];
}
const lumaY = (c) => 0.2126 * c[0] + 0.7152 * c[1] + 0.0722 * c[2];
// der hellste Kanal der Farbe (σ, h) bei Leuchtdichte 1 — passt sie bei Y_aus in [0, 1]?
function passt(s, ca, sa, Yo) {
  const c = rgbEins(s, ca, sa), y = lumaY(c);
  return Math.max(c[0], c[1], c[2]) * Yo <= y && Math.min(c[0], c[1], c[2]) >= -1e-6 * y;
}
// der Überschuss des hellsten Kanals über 1 bei Y_aus (≤ 0: passt nach oben)
function ueber(s, ca, sa, Yo) {
  const c = rgbEins(s, ca, sa);
  return (Math.max(c[0], c[1], c[2]) * Yo) / lumaY(c) - 1;
}
function schirm(x, schritte = SCHRITTE) {
  const r = Math.max(0, x[0]), g0 = Math.max(0, x[1]), b = Math.max(0, x[2]);
  const Y = 0.2126 * r + 0.7152 * g0 + 0.0722 * b;
  if (!(Y > 0)) return [0, 0, 0];
  const [Yo, g] = neutralY(Y);
  // Oklab der Eingangsfarbe: Farbton (ca, sa) und σ = C/L
  const l = Math.cbrt(0.4122214708 * r + 0.5363325363 * g0 + 0.0514459929 * b);
  const m = Math.cbrt(0.2119034982 * r + 0.6806995451 * g0 + 0.1073969566 * b);
  const z = Math.cbrt(0.0883024619 * r + 0.2817188376 * g0 + 0.6299787005 * b);
  const L = 0.2104542553 * l + 0.793617785 * m - 0.0040720468 * z;
  const A = 1.9779984951 * l - 2.428592205 * m + 0.4505937099 * z;
  const B = 0.0259040371 * l + 0.7827717662 * m - 0.808675766 * z;
  const C = Math.hypot(A, B);
  if (!(C > 1e-7 * L)) return [Yo, Yo, Yo];
  const ca = A / C, sa = B / C;
  let s = (C / L) * (1 - g);
  if (!passt(s, ca, sa, Yo)) {
    let lo = 0, hi = s;
    for (let i = 0; i < schritte; i++) { const mid = 0.5 * (lo + hi); if (passt(mid, ca, sa, Yo)) lo = mid; else hi = mid; }
    // EIN Sekanten-Schritt auf dem Überschuss des hellsten Kanals (glatt in σ): der Rand statt der Stufe der Halbierung,
    // denn nahe Kanal 0 ist die OETF steil (7 Halbierungen allein lagen bis 4 Code daneben)
    const el = ueber(lo, ca, sa, Yo), eh = ueber(hi, ca, sa, Yo);
    const sk = eh > el ? lo + ((hi - lo) * -el) / (eh - el) : lo;
    s = passt(sk, ca, sa, Yo) ? sk : lo;
  }
  const c = rgbEins(s, ca, sa), y = lumaY(c), f = Yo / y;
  return [Math.max(0, c[0] * f), Math.max(0, c[1] * f), Math.max(0, c[2] * f)];
}
// DIE KAPPE ZUR KURVE (Rechnung 1): das größte k, bei dem ein Fleck der Leuchtdichte L (rgb, cd/m²) noch nicht gestaucht wird —
// weder in der Y-Schulter (Y' < 0,76) noch am Rand des Gamuts (hellster Kanal ≤ 1). Gilt im linearen Fuß-Teil (k·Y ≥ 0,08).
// k_c = min über die diffusen Pixel dieser Zahl (eine min-Reduktion).
function kGrenze(Lrgb) {
  const Y = lumaY(Lrgb), Rm = Math.max(Lrgb[0], Lrgb[1], Lrgb[2]);
  if (!(Y > 0)) return Infinity;
  return Math.min((R + 0.04) / Y, 1 / Rm + 0.04 / Y);
}
// dieselbe Kurve als WGSL (feste 8 Halbierungen + 1 Sekante, ausgerollt durch den Builder; keine Schleife über Daten, kein Suchen nach L)
const WGSL = `
fn okEins(s: f32, h: vec2f) -> vec3f {
  let l = 1.0 + s * dot(vec2f( 0.3963377774,  0.2158037573), h);
  let m = 1.0 + s * dot(vec2f(-0.1055613458, -0.0638541728), h);
  let z = 1.0 + s * dot(vec2f(-0.0894841775, -1.2914855480), h);
  let q = vec3f(l * l * l, m * m * m, z * z * z);
  return mat3x3f(vec3f(4.0767416621, -1.2684380046, -0.0041960863),
                 vec3f(-3.3077115913, 2.6097574011, -0.7034186147),
                 vec3f(0.2309699292, -0.3413193965, 1.7076147010)) * q;
}
fn passt(s: f32, h: vec2f, yo: f32) -> bool {
  let c = okEins(s, h); let y = dot(c, vec3f(0.2126, 0.7152, 0.0722));
  return max(c.x, max(c.y, c.z)) * yo <= y && min(c.x, min(c.y, c.z)) >= -1e-6 * y;
}
fn schirm(x0: vec3f) -> vec3f {
  let x = max(x0, vec3f(0.0));
  let Y = dot(x, vec3f(0.2126, 0.7152, 0.0722));
  if (Y <= 0.0) { return vec3f(0.0); }
  let off = select(0.04, Y - 6.25 * Y * Y, Y < 0.08);
  let p = Y - off;
  let qn = 1.0 - 0.0576 / (p - 0.52);
  let schulter = p >= 0.76;
  let yo = select(p, qn, schulter);
  let g = select(0.0, 1.0 - 1.0 / (0.15 * (p - qn) + 1.0), schulter);
  let lms = pow(mat3x3f(vec3f(0.4122214708, 0.2119034982, 0.0883024619),
                        vec3f(0.5363325363, 0.6806995451, 0.2817188376),
                        vec3f(0.0514459929, 0.1073969566, 0.6299787005)) * x, vec3f(1.0 / 3.0));
  let L = dot(lms, vec3f(0.2104542553, 0.7936177850, -0.0040720468));
  let ab = vec2f(dot(lms, vec3f(1.9779984951, -2.4285922050, 0.4505937099)),
                 dot(lms, vec3f(0.0259040371, 0.7827717662, -0.8086757660)));
  let C = length(ab);
  if (C <= 1e-7 * L) { return vec3f(yo); }
  let h = ab / C;
  var s = C / L * (1.0 - g);
  if (!passt(s, h, yo)) {
    var lo = 0.0; var hi = s;
    // 8 feste Halbierungs-Schritte (ausgeschrieben im Knoten-Bau; hier als Schleife fester Länge), dann eine Sekante
    for (var i = 0; i < 8; i++) { let mid = 0.5 * (lo + hi); if (passt(mid, h, yo)) { lo = mid; } else { hi = mid; } }
    let cl = okEins(lo, h); let ch = okEins(hi, h);
    let el = max(cl.x, max(cl.y, cl.z)) * yo / dot(cl, vec3f(0.2126, 0.7152, 0.0722)) - 1.0;
    let eh = max(ch.x, max(ch.y, ch.z)) * yo / dot(ch, vec3f(0.2126, 0.7152, 0.0722)) - 1.0;
    let sk = select(lo, lo + (hi - lo) * (-el) / (eh - el), eh > el);
    s = select(lo, sk, passt(sk, h, yo));
  }
  let c = okEins(s, h);
  return max(c * (yo / dot(c, vec3f(0.2126, 0.7152, 0.0722))), vec3f(0.0));
}`;
module.exports = { schirm, kGrenze, neutralY, WGSL, SCHRITTE };
