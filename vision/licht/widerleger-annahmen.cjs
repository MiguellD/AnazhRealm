// WIDERLEGER (annahmen): Empfindlichkeit der Spike-Eingänge, eigene Rechnung. Nur lesen/rechnen.
"use strict";
const fs = require("fs"); const out = []; const say = (s = "") => { out.push(s); console.log(s); };
const f = (v, n = 2) => (isFinite(v) ? (+v).toFixed(n) : "—");
// fachwerk-core.js:6532-6539 wörtlich
function LFC(T) { let s = 0; for (let nm = 380; nm <= 780; nm += 5) { const l = nm * 1e-9, u = nm * 1e-3 - 0.559; s += (1.1910429e-16 / l ** 5 / (Math.exp(0.014387769 / (l * T)) - 1)) * 1.019 * Math.exp(-285.4 * u * u) * 5e-9; } return 683 * s; }
const RHO_MAX = 0.8196, RHO_2 = 0.388; // albedo-tafel tor R; zweithöchster Kanal klinge R
// ── A/B: Glutbett gegen die Diffus-Schranke (R2) ──
say("## A. Glutbett: L = 0,9·L(T) gegen die Schranke ρ_max/π·E (Punkt 0,2 m neben der Mitte, Flamme 0,35 m darüber)");
const Eglut = (I, k) => { const d2 = 0.2 ** 2 + 0.35 ** 2; const F = I / (d2 + k * k); return F * (0.35 / Math.sqrt(d2)); };
say("T (K) → L_glut (cd/m²): " + [900, 1000, 1100, 1150, 1200, 1250, 1300, 1400].map((T) => `${T} ${f(0.9 * LFC(T), 1)}`).join(" · "));
for (const I of [130, 215, 249, 288, 500]) for (const k of [0.38, 0.76]) for (const rho of [RHO_MAX, RHO_2]) {
  const S = (rho / Math.PI) * Eglut(I, k); let lo = 700, hi = 2000; for (let i = 0; i < 60; i++) { const m = (lo + hi) / 2; if (0.9 * LFC(m) > S) hi = m; else lo = m; }
  say(`I ${I} cd · Kern ${k} m · ρ_max ${rho}: E ${f(Eglut(I, k), 0)} lx → Schranke ${f(S, 0)} cd/m² → das Bett gilt als STRAHLER erst ab T* = ${f(lo, 0)} K`);
}
// ── C: Lava im Spiel (siedlung-wege.js:586-605, LAVA_KRUSTE :3044, LAVA gelaende-core.js:1817, stein tSchmelz 1500 schmiede-core.js:2892) ──
say("\n## C. Lava: das Mittel der Decke nach dem Spiel-Gesetz `_lavaLeucht` gegen das Zwei-Temperaturen-Modell des Spikes");
function lavaLeucht(TK, td, t0, K = { sigma: 0.25, offen: 0.17, platte: 0.62 }) { const w = Math.min(1, Math.max(0, (TK - td) / (t0 - td))); let s = 0, g = 0, sk = 0, gk = 0;
  for (let i = 0; i < 128; i++) { const n = ((i + 0.5) / 128) * 4 * K.sigma, p = Math.exp(-0.5 * (n / K.sigma) ** 2), e = Math.min(1, n / Math.max(1e-9, w * K.offen)), riss = 1 - e * e * (3 - 2 * e);
    const Ts = td + w * (K.platte + (1 - K.platte) * riss) * (t0 - td); const L = LFC(Ts) * 0.95; s += p * L; g += p; if (riss === 0) { sk += p * L; gk += p; } }
  return { mittel: s / g, kruste: gk ? sk / gk : NaN, krusteT: td + w * K.platte * (t0 - td), rissAnteil: 1 - gk / g }; }
const spiel = lavaLeucht(1650, 798, 1650), real = lavaLeucht(1470, 798, 1470);
say(`Spiel (t0 1650 K = stein 1500 + Überhitzung 150): Mittel ${f(spiel.mittel, 0)} cd/m² · Kruste (Scholle, ${f(spiel.krusteT, 0)} K) ${f(spiel.kruste, 0)} cd/m² · Fläche mit Riss-Anteil > 0: ${f(100 * spiel.rissAnteil, 1)} %`);
say(`Spike: Riss 1650 K ε 0,95 = ${f(0.95 * LFC(1650), 0)} · Kruste 1100 K ε 0,9 = ${f(0.9 * LFC(1100), 1)} · Mittel bei Riss-Anteil 0,14 = ${f(0.14 * 0.95 * LFC(1650) + 0.86 * 0.9 * LFC(1100), 0)} cd/m²`);
say(`Kruste Spiel ÷ Kruste Spike: ×${f(spiel.kruste / (0.9 * LFC(1100)), 1)}`);
const kSpiel = 0.00394 * (4440 / spiel.mittel);
say(`lava-nah unter der Kappe (k ∝ 1/Mittel): k ≈ ${kSpiel.toExponential(2)} → k·L Kruste ${f(kSpiel * spiel.kruste, 3)} (Spike: ${f(0.00394 * 0.9 * LFC(1100), 3)}; Schulter 0,76)`);
say(`Mit realer Basalt-Temperatur (t0 1470 K, ohne Überhitzung): Mittel ${f(real.mittel, 0)} cd/m² (÷ ${f(spiel.mittel / real.mittel, 1)}), Kruste ${f(real.krusteT, 0)} K ${f(real.kruste, 0)} cd/m²`);
// ── D: Farbton des Planck-Orts vor jeder Kurve ──
say("\n## D. Oklab-Farbton des Planck-Orts: wahr (außerhalb des Gamuts, vorzeichenrichtige Kubikwurzel) ↔ planckFarbe (Weiß zugemischt, Entscheid §1) ↔ lichtFarbe (geklemmt, Spiel heute)");
const gs = (x, m, a, b) => { const t = (x - m) * (x < m ? a : b); return Math.exp(-0.5 * t * t); };
const cmf = (l) => [1.056 * gs(l, 599.8, 0.0264, 0.0323) + 0.362 * gs(l, 442.0, 0.0624, 0.0374) - 0.065 * gs(l, 501.1, 0.049, 0.0382), 0.821 * gs(l, 568.8, 0.0213, 0.0247) + 0.286 * gs(l, 530.9, 0.0613, 0.0322), 1.217 * gs(l, 437.0, 0.0845, 0.0278) + 0.681 * gs(l, 459.0, 0.0385, 0.0725)];
const pB = (nm, T) => { const l = nm * 1e-9; return 1.1910429e-16 / l ** 5 / (Math.exp(0.014387769 / (l * T)) - 1); };
const XYZ = (T) => { let X = 0, Y = 0, Z = 0; for (let l = 360; l <= 830; l++) { const b = pB(l, T), c = cmf(l); X += b * c[0]; Y += b * c[1]; Z += b * c[2]; } return [X / Y, 1, Z / Y]; };
const lin = ([X, Y, Z]) => [3.2404542 * X - 1.5371385 * Y - 0.4985314 * Z, -0.969266 * X + 1.8760108 * Y + 0.041556 * Z, 0.0556434 * X - 0.2040259 * Y + 1.0572252 * Z];
const luma = (c) => 0.2126 * c[0] + 0.7152 * c[1] + 0.0722 * c[2];
const okh = (c) => { const l = 0.4122214708 * c[0] + 0.5363325363 * c[1] + 0.0514459929 * c[2], m = 0.2119034982 * c[0] + 0.6806995451 * c[1] + 0.1073969566 * c[2], s = 0.0883024619 * c[0] + 0.2817188376 * c[1] + 0.6299787005 * c[2];
  const [a_, b_, c_] = [l, m, s].map(Math.cbrt); const A = 1.9779984951 * a_ - 2.428592205 * b_ + 0.4505937099 * c_, B = 0.0259040371 * a_ + 0.7827717662 * b_ - 0.808675766 * c_; return { h: ((Math.atan2(B, A) * 180) / Math.PI + 360) % 360, C: Math.hypot(A, B) }; };
const planckFarbe = (T) => { let c = lin(XYZ(T)); const m = Math.min(...c); if (m < 0) { const t = -m / (1 - m); c = c.map((v) => v * (1 - t) + t); } const y = luma(c); return c.map((v) => v / y); };
function lichtFarbe(kelvin) { const T = Math.min(25000, Math.max(1667, +kelvin)), T2 = T * T, T3 = T2 * T; const x = T <= 4000 ? -0.2661239e9 / T3 - 0.2343589e6 / T2 + 0.8776956e3 / T + 0.17991 : -3.0258469e9 / T3 + 2.1070379e6 / T2 + 0.2226347e3 / T + 0.24039; const x2 = x * x, x3 = x2 * x; const y = T <= 2222 ? -1.1063814 * x3 - 1.3481102 * x2 + 2.18555832 * x - 0.20219683 : T <= 4000 ? -0.9549476 * x3 - 1.37418593 * x2 + 2.09137015 * x - 0.16748867 : 3.081758 * x3 - 5.8733867 * x2 + 3.75112997 * x - 0.37001483; const X = x / y, Z = (1 - x - y) / y; const r = Math.max(0, 3.2404542 * X - 1.5371385 - 0.4985314 * Z), g = Math.max(0, -0.969266 * X + 1.8760108 + 0.041556 * Z), b = Math.max(0, 0.0556434 * X - 0.2040259 + 1.0572252 * Z); const mm = Math.max(r, g, b); return [r / mm, g / mm, b / mm]; }
const dh = (a, b) => { const x = Math.abs(a - b) % 360; return Math.min(x, 360 - x); };
for (const T of [1100, 1326, 1650, 1850, 1900, 2000, 2700, 4100]) { const w = lin(XYZ(T)), p = planckFarbe(T), k = lichtFarbe(T);
  say(`${T} K: lin. sRGB wahr ${w.map((v) => f(v, 3)).join("/")} · h wahr ${f(okh(w).h, 1)}° · planckFarbe ${f(okh(p).h, 1)}° (Δ ${f(dh(okh(w).h, okh(p).h), 1)}°) · lichtFarbe ${f(okh(k).h, 1)}° (Δ ${f(dh(okh(w).h, okh(k).h), 1)}°)`); }
// ── E: (a) Ordnung unter der Entscheid-Kurve über Farben verschiedenen Tons (Monte Carlo) ──
say("\n## E. (a) Ordnung: Paare verschiedener Farbe, Eingangs-Y geordnet → Ausgabe-Y (linear, nach 8 Bit) umgekehrt?");
function neutral(e0) { const r = 0.76, s = 0.15; let e = e0.slice(); const i = Math.min(...e), n = i < 0.08 ? i - 6.25 * i * i : 0.04; e = e.map((v) => v - n); const a = Math.max(...e); if (a < r) return e; const o = 1 - r, u = 1 - (o * o) / (a + o - r); e = e.map((v) => (v * u) / a); const l = 1 - 1 / (s * (a - u) + 1); return e.map((v) => v * (1 - l) + u * l); }
function oklab(c) { const l = 0.4122214708 * c[0] + 0.5363325363 * c[1] + 0.0514459929 * c[2], m = 0.2119034982 * c[0] + 0.6806995451 * c[1] + 0.1073969566 * c[2], s = 0.0883024619 * c[0] + 0.2817188376 * c[1] + 0.6299787005 * c[2]; const [a_, b_, c_] = [l, m, s].map((v) => Math.cbrt(Math.max(0, v))); const A = 1.9779984951 * a_ - 2.428592205 * b_ + 0.4505937099 * c_, B = 0.0259040371 * a_ + 0.7827717662 * b_ - 0.808675766 * c_; return { L: 0.2104542553 * a_ + 0.793617785 * b_ - 0.0040720468 * c_, C: Math.hypot(A, B), h: ((Math.atan2(B, A) * 180) / Math.PI + 360) % 360 }; }
function oklabInv({ L, C, h }) { const a = C * Math.cos((h * Math.PI) / 180), b = C * Math.sin((h * Math.PI) / 180); const l_ = L + 0.3963377774 * a + 0.2158037573 * b, m_ = L - 0.1055613458 * a - 0.0638541728 * b, s_ = L - 0.0894841775 * a - 1.291485548 * b; const l = l_ ** 3, m = m_ ** 3, s = s_ ** 3; return [4.0767416621 * l - 3.3077115913 * m + 0.2309699292 * s, -1.2684380046 * l + 2.6097574011 * m - 0.3413193965 * s, -0.0041960863 * l - 0.7034186147 * m + 1.707614701 * s]; }
function schirm(x) { const N = neutral(x), o = oklab(N), h0 = oklab(x).h; const im = (c) => c.every((v) => v >= -1e-6 && v <= 1 + 1e-6); let r = oklabInv({ L: o.L, C: o.C, h: h0 }); if (im(r)) return r.map((v) => Math.max(0, Math.min(1, v))); let lo = 0, hi = o.C, best = oklabInv({ L: o.L, C: 0, h: h0 }); for (let i = 0; i < 4; i++) { const mid = (lo + hi) / 2, t = oklabInv({ L: o.L, C: mid, h: h0 }); if (im(t)) { lo = mid; best = t; } else hi = mid; } return best.map((v) => Math.max(0, Math.min(1, v))); }
const oetf = (v) => { v = Math.max(0, Math.min(1, v)); return v <= 0.0031308 ? 12.92 * v : 1.055 * v ** (1 / 2.4) - 0.055; };
const eotf = (e) => (e <= 0.04045 ? e / 12.92 : ((e + 0.055) / 1.055) ** 2.4);
const Y8 = (c) => luma(c.map((v) => eotf(Math.round(oetf(v) * 255) / 255)));
let seed = 7; const rnd = () => ((seed = (seed * 1103515245 + 12345) % 2147483648) / 2147483648);
const ALB = [[0.1003, 0.1385, 0.0449], [0.0906, 0.2034, 0.0447], [0.2758, 0.1316, 0.0889], [0.2641, 0.2377, 0.1761], [0.1154, 0.0785, 0.0471], [0.18, 0.18, 0.18], [0.8196, 0.6359, 0.2799]];
const TS = [1100, 1650, 1850, 2000, 2700, 4100, 5772];
const PB = Object.fromEntries(TS.map((T) => [T, planckFarbe(T)]));
for (const [nm, K] of [["Entscheid-Kurve", schirm], ["Vendor-Neutral", neutral]]) { let n = 0, inv = 0, invGross = 0, worst = 0, bsp = "";
  seed = 7;
  for (let i = 0; i < 40000; i++) { const mk = () => { const T = TS[(rnd() * TS.length) | 0], c = PB[T], a = ALB[(rnd() * ALB.length) | 0], s = 2 ** (rnd() * 10 - 6); return { T, x: c.map((v, j) => v * a[j] * s) }; };
    const P = mk(), Q = mk(); const yp = luma(P.x), yq = luma(Q.x); if (Math.abs(Math.log2(yp / yq)) < 0.05) continue; n++; const [lo, hi] = yp < yq ? [P, Q] : [Q, P];
    const ol = Y8(K(lo.x)), oh = Y8(K(hi.x)); if (ol > oh + 1e-9) { inv++; const r = Math.log2(ol / oh); if (r > worst) { worst = r; bsp = `${lo.T} K Y ${f(luma(lo.x), 3)} → ${f(ol, 3)} über ${hi.T} K Y ${f(luma(hi.x), 3)} → ${f(oh, 3)}`; } if (r > 0.1) invGross++; } }
  say(`${nm}: ${n} Paare (Eingang ≥ 0,05 EV getrennt, k·L 2^−6 … 2^4) → umgekehrt ${inv} (${f((100 * inv) / n, 2)} %), davon > 0,1 EV ${invGross}; größte Umkehr ${f(worst, 2)} EV (${bsp})`); }
// ── F: die ±25-%-Tür der Gegenprobe ──
say("\n## F. Gegenprobe des Spikes: wie viele der 14 Zahlen halten bei anderer Toleranz");
const ab = [[0.984, 0.988], [0.984, 1.03], [0.199, 0.211], [0.587, 0.607], [0.003, 0.00377], [0.003, 0.0037], [56.4, 57.0], [21.0, 35.9], [2.69, 1.59], [79.2, 180.3], [12.7, 24.4], [6.24, 7.39], [73.3, 59.6], [179.5, 166.8]];
for (const t of [0.1, 0.15, 0.2, 0.25, 0.3, 0.5]) say(`±${Math.round(t * 100)} %: ${ab.filter(([g, r]) => Math.abs(r / g - 1) <= t).length} von 14 · davon k (die ersten sechs): ${ab.slice(0, 6).filter(([g, r]) => Math.abs(r / g - 1) <= t).length} von 6`);
// ── G/H: Mond und Nacht-Knoten ──
say("\n## G. Nacht: k·L der Wiese unter der offenen Blende hängt nicht an E⊥ des Monds");
for (const E of [0.25, 0.3, 0.3965]) { const Lm = (0.18 * E) / Math.PI, k = (0.22 * 2 ** -2.17) / Lm, Eh = E * Math.sin((74.2 * Math.PI) / 180), Lw = (0.1236 * (Eh * 0.34 + Eh * 0.3 * (2 / Math.PI) * 0.89)) / Math.PI; say(`E⊥ ${E} lx: k ${f(k, 2)} · L_Wiese ${Lw.toExponential(2)} · k·L ${f(k * Lw, 4)}`); }
say("\n## H. Was die Wiese von Luma 4,8 auf 22 hebt (Spike: +1,57 EV), gegen den ehrlichen Fehler der Eingänge");
const halm = 0.34 + 0.3 * (2 / Math.PI) * 0.89; say(`Halm-Faktor (Spike, Mond 74,2°: hoch 0,34 + 0,3·2/π·quer) = ${f(halm, 3)}; ebener Boden = 1 → +${f(Math.log2(1 / halm), 2)} EV`);
say(`Gras-Albedo: ATMO_BODEN Y 0,1236 ist Mittel aus Laub und Waldboden (welt-licht.js:36-39), keine Gras-Zeile in albedo-tafel.json; Y 0,20 → +${f(Math.log2(0.2 / 0.1236), 2)} EV`);
say(`Summe beider: +${f(Math.log2(1 / halm) + Math.log2(0.2 / 0.1236), 2)} EV gegen +1,57 nötig`);
// ── I: Pixel-Anteile aus Kamera-Geometrie ──
say("\n## I. Bild-Anteile aus Geometrie (Bildfeld 1,88 sr ≈ 104°×70°, U)");
const OM = 1.88; const anteil = (A, d, h) => { const el = Math.atan(h / d); return (A * Math.sin(el)) / (d * d + h * h) / OM; };
say(`herd-fern: Feuerkreis r ≤ 2,5 m aus 25 m, Auge 1,6 m: ${f(100 * anteil(Math.PI * 6.25, 25, 1.6), 2)} % des Bilds · Auge 5 m (FERN y 33 über Boden 27,98): ${f(100 * anteil(Math.PI * 6.25, 25, 5), 2)} % — Spike 1,57 % der diffusen Pixel, Schwelle 2 %`);
say(`herd-nah: Glutbett Ø 0,76 m (0,454 m²) aus 3 m, Auge 1,6 m: ${f(100 * anteil(0.454, 3, 1.6), 2)} % · aus 2 m: ${f(100 * anteil(0.454, 2, 1.6), 2)} % · aus 5,1 m, Auge 0,62 m (NAH der Runden): ${f(100 * anteil(0.454, 5.1, 0.62), 2)} % — Kipp-Schwelle des Spikes 1,4 %`);
fs.writeFileSync(__dirname + "/widerleger-annahmen.out.txt", out.join("\n") + "\n");
