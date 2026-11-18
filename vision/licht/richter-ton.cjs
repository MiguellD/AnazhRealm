// Richter: beide Farbton-Halte gegen dieselbe Metrik (Oklab-Farbton UND HSV des Schirms), Quelle unverändert aus quelle-physik.cjs
const Q = require("./quelle-physik.cjs");
const enc = Q.oetf, dec = (e) => (e <= 0.04045 ? e / 12.92 : ((e + 0.055) / 1.055) ** 2.4);
function fuss(c) { const m = Math.min(...c), off = m < 0.08 ? m - 6.25 * m * m : 0.04; return c.map((v) => v - off); }
const sch = (P) => 1 - 0.0576 / (P - 0.52);
function kodiert(c0) { let c = fuss(c0); const P = Math.max(...c); if (P < 0.76) return c; const Pn = sch(P); c = c.map((v) => v * Pn / P);
  const g = 1 - 1 / (0.15 * (P - Pn) + 1); const e = c.map(enc), ep = enc(Pn); return e.map((v) => dec(v + (ep - v) * g)); }
const ATMO = [0.1003, 0.1385, 0.0449];
const fall = [["Glut 1100K", 1100, null], ["Lava 1300K", 1300, null], ["Riss 1650K", 1650, null], ["Herd 2000K", 2000, null], ["Gras×2000K", 2000, ATMO], ["Glühstr 2700K", 2700, null], ["Fenster 2800K", 2800, null]];
const hO = (c) => Q.oklab(c.map((v) => Math.max(0, v))).h;
const hS = (c) => Q.hsv(Q.srgb8(c).map((v) => v / 255)).H;
const d = (a, b) => { let x = Math.abs(a - b) % 360; return Math.min(x, 360 - x); };
let maxN = 0, maxK = 0, maxF = 0, maxKs = 0, maxFs = 0, maxNs = 0;
for (const [n, T, alb] of fall) {
  let c = Q.planckFarbe(T); if (alb) { c = c.map((v, i) => v * alb[i]); const y = Q.luma(c); c = c.map((v) => v / y); }
  const h0 = hO(c), s0 = hS(c.map((v) => v * 0.3 / Math.max(...c)));
  const zeilen = [];
  for (const kl of [0.5, 1, 2, 4, 16]) {
    const x = c.map((v) => v * kl);
    const N = Q.neutral(x), K = kodiert(x), F = Q.neutralFarbton(x);
    const dn = d(hO(N), h0), dk = d(hO(K), h0), df = d(hO(F), h0);
    const sn = d(hS(N), s0), sk = d(hS(K), s0), sf = d(hS(F), s0);
    if (Math.max(...fuss(x)) >= 0.76) { maxN = Math.max(maxN, dn); maxK = Math.max(maxK, dk); maxF = Math.max(maxF, df); maxNs = Math.max(maxNs, sn); maxKs = Math.max(maxKs, sk); maxFs = Math.max(maxFs, sf); }
    zeilen.push(`k·L ${kl}: Oklab-Δh N ${dn.toFixed(1)} · kodiert ${dk.toFixed(1)} · Oklab-Halt ${df.toFixed(1)} | HSV-Δh N ${sn.toFixed(1)} · kod ${sk.toFixed(1)} · Halt ${sf.toFixed(1)} | ${Q.srgb8(N).join("/")} · ${Q.srgb8(K).join("/")} · ${Q.srgb8(F).join("/")}`);
  }
  console.log(`${n} (Oklab h0 ${h0.toFixed(1)}°, HSV h0 ${s0.toFixed(1)}°)\n  ` + zeilen.join("\n  "));
}
console.log(`\nMAX über der Schulter — Oklab: Neutral ${maxN.toFixed(1)}° · kodiert ${maxK.toFixed(1)}° · Oklab-Halt ${maxF.toFixed(1)}° | HSV: Neutral ${maxNs.toFixed(1)}° · kodiert ${maxKs.toFixed(1)}° · Halt ${maxFs.toFixed(1)}°`);
// Spanne (b): wo liegt k·L(Luma) beim Schulter-Beginn für Gras×2000K (Quelle: 0,362, Faktor 2,10)
let c = Q.planckFarbe(2000).map((v, i) => v * ATMO[i]); const y = Q.luma(c); c = c.map((v) => v / y);
console.log(`Gras×2000K: max_c/Luma ${Math.max(...c).toFixed(3)} → Schulter-Beginn bei Luma ${(0.76 / Math.max(...c)).toFixed(3)}`);
// Elastizität (log) der Schulter an 0,866 und Spanne
const el = (P) => P * 0.0576 / ((P - 0.52) ** 2 * sch(P));
console.log(`log-Elastizität bei 0,76: ${el(0.76001).toFixed(3)} · bei 0,866: ${el(0.866).toFixed(3)} · Spanne log2(0,866/0,76) = ${Math.log2(0.866 / 0.76).toFixed(3)} EV`);
// Entsättigung g an der Spanne
const P = 0.866, Pn = sch(P); console.log(`an P 0,866: P' ${Pn.toFixed(4)} · g ${(1 - 1 / (0.15 * (P - Pn) + 1)).toFixed(4)}`);
// Dynamik der Kurve: Schulter bis Code 1
const v1 = (() => { const t = dec(1 / 255); return Math.sqrt(t / 6.25); })(); // Grau im Fuß: Ausgabe 6,25 v² = t
console.log(`Code 1 linear ${dec(1/255).toExponential(3)} → Eingang Grau v1 ${v1.toFixed(5)} · Stufen 0,76/v1 ${Math.log2(0.76 / v1).toFixed(2)} · 0,866/v1 ${Math.log2(0.866 / v1).toFixed(2)}`);
// Sättigung des Tors: Gras×2000K unter der Schulter
for (const kl of [0.05, 0.15, 0.3]) { const s = Q.srgb8(Q.neutral(c.map((v) => v * kl))); console.log(`Gras k·L ${kl}: ${s.join("/")} S ${Q.hsv(s.map(v=>v/255)).S.toFixed(3)}`); }
