// WIDERLEGER (Rechnung) — unabhängige Nachrechnung von spike.cjs. Eigene Photometrie (CIE-1924-V(λ)-Tafel 10 nm, Krystek-Planck-Ort),
// eigene Tonkurve aus vendor/three.webgpu.min.js `mT` (wörtlich gelesen, Layout-Fn → `return` im If wirkt), eigene Oklab-Halte-Kurve.
// Die GEOMETRIE der Sichten (Anteile, Abstände) übernehme ich als gewählten Eingang aus spike.cjs — sie ist nicht prüfbar ohne Spiel.
"use strict";
const fs = require("fs");
const out = []; const say = (s = "") => { out.push(s); console.log(s); };
const r2 = (v, n = 2) => (isFinite(v) ? (+v).toFixed(n) : "—");
const g3 = (v) => (isFinite(v) ? (Math.abs(v) >= 1e4 || (Math.abs(v) < 1e-3 && v) ? v.toExponential(3) : (+v.toPrecision(4)).toString()) : "—");

// ── 1. Photometrie, unabhängig ──
// CIE 1924 V(λ), 380–780 nm in 10 nm (Standardtafel)
const V10 = [0.000039,0.00012,0.000396,0.00121,0.004,0.0116,0.023,0.038,0.06,0.09098,0.13902,0.20802,0.323,0.503,0.71,0.862,0.954,0.99495,0.995,0.952,0.87,0.757,0.631,0.503,0.381,0.265,0.175,0.107,0.061,0.032,0.017,0.00821,0.004102,0.002091,0.001047,0.00052,0.000249,0.00012,0.00006,0.00003,0.000015];
const V = (nm) => { const t = (nm - 380) / 10, i = Math.floor(t); if (i < 0 || i >= 40) return i === 40 ? V10[40] : 0; return V10[i] + (V10[i + 1] - V10[i]) * (t - i); };
const B = (nm, T) => { const l = nm * 1e-9; return 2 * 6.62607015e-34 * 299792458 ** 2 / l ** 5 / (Math.exp(6.62607015e-34 * 299792458 / (l * 1.380649e-23 * T)) - 1); };
const Lbb = (T) => { let s = 0; for (let nm = 380; nm <= 780; nm += 1) s += B(nm, T) * V(nm) * 1e-9; return 683 * s; };
// fachwerk-core.js:6532 (gelesen) zum Vergleich
const Lfc = (T) => { let s = 0; for (let nm = 380; nm <= 780; nm += 5) { const l = nm * 1e-9, u = nm * 1e-3 - 0.559; s += (1.1910429e-16 / l ** 5 / (Math.exp(0.014387769 / (l * T)) - 1)) * 1.019 * Math.exp(-285.4 * u * u) * 5e-9; } return 683 * s; };
// Krystek 1985: Planck-Ort in CIE 1960 uv
const planckXY = (T) => { const u = (0.860117757 + 1.54118254e-4 * T + 1.28641212e-7 * T * T) / (1 + 8.42420235e-4 * T + 7.08145163e-7 * T * T);
  const v = (0.317398726 + 4.22806245e-5 * T + 4.20481691e-8 * T * T) / (1 - 2.89741816e-5 * T + 1.61456053e-7 * T * T); const d = 2 * u - 8 * v + 4; return [3 * u / d, 2 * v / d]; };
const xy2lin = ([x, y]) => { const X = x / y, Z = (1 - x - y) / y; return [3.2404542 * X - 1.5371385 - 0.4985314 * Z, -0.969266 * X + 1.8760108 + 0.041556 * Z, 0.0556434 * X - 0.2040259 + 1.0572252 * Z]; };
const Y709 = (c) => 0.2126 * c[0] + 0.7152 * c[1] + 0.0722 * c[2];
const farbe = (T) => { let c = xy2lin(planckXY(T)); const m = Math.min(...c); if (m < 0) { const t = -m / (1 - m); c = c.map((v) => v * (1 - t) + t); } const y = Y709(c); return c.map((v) => v / y); };

// ── 2. Tonkurve (vendor mT) + Schirm ──
function mT(c) { const S = 0.76, D = 0.15; const x = Math.min(...c), off = x < 0.08 ? x - 6.25 * x * x : 0.04; let e = c.map((v) => v - off);
  const pk = Math.max(...e); if (pk < S) return e; const d = 1 - S, np = 1 - d * d / (pk + d - S); e = e.map((v) => v * np / pk); const g = 1 - 1 / (D * (pk - np) + 1); return e.map((v) => v + (np - v) * g); }
const enc = (v) => { v = Math.min(1, Math.max(0, v)); return v <= 0.0031308 ? 12.92 * v : 1.055 * Math.pow(v, 1 / 2.4) - 0.055; };
const dec = (e) => (e <= 0.04045 ? e / 12.92 : Math.pow((e + 0.055) / 1.055, 2.4));
const to8 = (c) => c.map((v) => Math.round(enc(v) * 255));
const luma8 = (s) => 0.2126 * s[0] + 0.7152 * s[1] + 0.0722 * s[2];
const satHSV = (s) => { const a = Math.max(...s), b = Math.min(...s); return a ? 1 - b / a : 0; };
const OK = (c) => { const l = Math.cbrt(Math.max(0, 0.4122214708 * c[0] + 0.5363325363 * c[1] + 0.0514459929 * c[2])), m = Math.cbrt(Math.max(0, 0.2119034982 * c[0] + 0.6806995451 * c[1] + 0.1073969566 * c[2])), s = Math.cbrt(Math.max(0, 0.0883024619 * c[0] + 0.2817188376 * c[1] + 0.6299787005 * c[2]));
  const L = 0.2104542553 * l + 0.793617785 * m - 0.0040720468 * s, a = 1.9779984951 * l - 2.428592205 * m + 0.4505937099 * s, b = 0.0259040371 * l + 0.7827717662 * m - 0.808675766 * s; return { L, C: Math.hypot(a, b), h: (Math.atan2(b, a) * 180 / Math.PI + 360) % 360 }; };
const OKinv = (L, C, h) => { const a = C * Math.cos(h * Math.PI / 180), b = C * Math.sin(h * Math.PI / 180); const l = (L + 0.3963377774 * a + 0.2158037573 * b) ** 3, m = (L - 0.1055613458 * a - 0.0638541728 * b) ** 3, s = (L - 0.0894841775 * a - 1.291485548 * b) ** 3;
  return [4.0767416621 * l - 3.3077115913 * m + 0.2309699292 * s, -1.2684380046 * l + 2.6097574011 * m - 0.3413193965 * s, -0.0041960863 * l - 0.7034186147 * m + 1.707614701 * s]; };
const inG = (c) => c.every((v) => v >= -1e-6 && v <= 1 + 1e-6);
function halt(x) { const n = mT(x), o = OK(n), h = OK(x).h; let c = OKinv(o.L, o.C, h); if (inG(c)) return c; let lo = 0, hi = o.C, best = OKinv(o.L, 0, h); for (let i = 0; i < 4; i++) { const m = (lo + hi) / 2, t = OKinv(o.L, m, h); if (inG(t)) { lo = m; best = t; } else hi = m; } return best; }
const dh = (a, b) => { const d = Math.abs(a - b) % 360; return Math.min(d, 360 - d); };
const hue8 = (s) => OK(s.map((v) => dec(v / 255))).h;
const tol8 = (s) => { const h0 = hue8(s); let m = 0; for (let a = -1; a <= 1; a++) for (let b = -1; b <= 1; b++) for (let c = -1; c <= 1; c++) { const t = [s[0] + a, s[1] + b, s[2] + c].map((v) => Math.min(255, Math.max(0, v))); const o = OK(t.map((v) => dec(v / 255))); if (o.C > 1e-4) m = Math.max(m, dh(o.h, h0)); } return m; };

say("# WIDERLEGER — unabhängige Nachrechnung (widerleger-rechnung.cjs)");
say("\n## A. Kurve");
say(`Grau 0,18/0,22/0,50 → ${[0.18, 0.22, 0.5].map((v) => to8(mT([v, v, v]))[0]).join(" / ")} (spike: 105 / 118 / 181)`);
const aWeiss = 0.52 + 0.0576 / (1 - dec(254.5 / 255)); say(`hellster Kanal erreicht Code 255 bei x = ${r2(aWeiss)} = +${r2(Math.log2(aWeiss / 0.76))} EV über 0,76 (spike 13,45 / +4,15)`);
const v1grau = Math.sqrt((0.5 / 255 / 12.92) / 6.25), v1satt = 0.5 / 255 / 12.92;
say(`Code 1 (Rundung ab 0,5): grau bei x = ${g3(v1grau)} → ${r2(Math.log2(0.76 / v1grau))} EV unter der Schulter; satter Kanal (kleinster Kanal ≈ 0, der Fuß zieht nur ihn ab) bei x = ${g3(v1satt)} → ${r2(Math.log2(0.76 / v1satt))} EV`);

say("\n## B. Photometrie");
say(`Anker (belegt, alte Candela-Definition 1948): schwarzer Strahler am Platin-Erstarrungspunkt 2 042 K = 60 cd/cm² = 6,0e5 cd/m². V-Tafel: ${g3(Lbb(2042))} · fachwerk-Gauß: ${g3(Lfc(2042))}`);
for (const T of [1100, 1400, 1650, 1850, 2000]) say(`L_bb(${T} K): V-Tafel ${g3(Lbb(T))} · fachwerk-Gauß ${g3(Lfc(T))} (Gauß/Tafel ${r2(Lfc(T) / Lbb(T), 3)})`);
const I_HERD = 0.0012 * Lfc(2000) * Math.PI * 0.38 ** 2, I_HERD_tafel = 0.0012 * Lbb(2000) * Math.PI * 0.38 ** 2;
say(`Herd I = 0,0012 · L(2000) · π·0,38² = ${g3(I_HERD)} cd (Gauß) · ${g3(I_HERD_tafel)} cd (Tafel); Glutbett 0,9·L(1100) = ${g3(0.9 * Lfc(1100))} (Gauß) · ${g3(0.9 * Lbb(1100))} (Tafel) cd/m²`);
for (const T of [1100, 1650, 2000, 4100, 5772]) { const c = farbe(T); say(`Farbe ${T} K (Krystek, Luma 1): ${c.map((v) => v.toFixed(4)).join(" / ")}`); }

// ── 3. Gesetz des Entscheids (Auge) — eigene Implementierung ──
const ATMO = [0.1003, 0.1385, 0.0449], LAUB = [0.0906, 0.2034, 0.0447], HAUS = [0.2758, 0.1316, 0.0889], FELS = [0.2641, 0.2377, 0.1761], RHO_MAX = 0.8196;
const HQ = 0.89, HH = 0.34, MOND_E = 0.3965, MOND_H = 74.2, sM = Math.sin(MOND_H * Math.PI / 180), E_MH = MOND_E * sM, L_HIM = 6.8e-3;
const C = { f: farbe(2000), g: farbe(1100), r: farbe(1650), d: farbe(1850), m: farbe(4100), s: farbe(5772), h: farbe(12000) };
function Ept(I, k, q, p, n) { const v = q.map((x, i) => x - p[i]), d2 = v[0] ** 2 + v[1] ** 2 + v[2] ** 2, d = Math.sqrt(d2), F = I / (d2 + k * k), u = v.map((x) => x / d * F);
  if (!n) return Math.hypot(u[0], u[2]) * 2 / Math.PI * HQ + Math.abs(u[1]) * HH; return Math.max(0, u[0] * n[0] + u[1] * n[1] + u[2] * n[2]); }
const Ldif = (rho, parts) => [0, 1, 2].map((i) => parts.reduce((a, [E, c]) => a + rho[i] * c[i] * E / Math.PI, 0));
const Lq = (L, c) => c.map((v) => v * L);
const MESO = [0.005, 5], SKOT = [0, 0.5437, 0.3599];
function meso(L, staerke = 1) { const l = Y709(L), m = Math.min(1, Math.max(0, Math.log(Math.max(l, MESO[0]) / MESO[0]) / Math.log(MESO[1] / MESO[0]))); const s = staerke * (SKOT[1] * L[1] + SKOT[2] * L[2]); return { L: L.map((v) => m * v + (1 - m) * s), m }; }
const LKAR = 0.18 * MOND_E / Math.PI;
function cKey(LK) { const L10 = 634.8, L0 = 6713, cN = -2.17, st = 0.25, c10 = st * Math.log2(L10 / L0); if (LK >= L10) return st * Math.log2(LK / L0); if (LK <= LKAR) return cN; const t = (Math.log2(LK) - Math.log2(LKAR)) / (Math.log2(L10) - Math.log2(LKAR)); return cN + t * (c10 - cN); }
let KAPPA = 1;
function auge(S, { perz = 0.98, ohneKappe = false, knoten = -2.17 } = {}) {
  let s = 0, w = 0; for (const p of S) { s += p.w * Math.log(Y709(p.L) + 1e-6); w += p.w; } const La = Math.exp(s / w), LK = KAPPA * La;
  let c = cKey(LK); if (LK <= LKAR) c = knoten; const ka = 0.22 * 2 ** c / Math.max(LK, LKAR);
  const dif = S.filter((p) => !p.himmel && Y709(p.L) <= RHO_MAX / Math.PI * p.Eg).sort((a, b) => Y709(a.L) - Y709(b.L));
  const W = dif.reduce((a, p) => a + p.w, 0); let acc = 0, q = dif[dif.length - 1]; if (perz < 1) for (const p of dif) { acc += p.w; if (acc >= perz * W - 1e-12) { q = p; break; } }
  const kc = 0.76 / Math.max(...q.L); return { La, LK, c, ka, kc, q: q.n, k: ohneKappe ? ka : Math.min(ka, kc), dif: new Set(dif.map((p) => p.n)) };
}
const zeige = (L, k, kurve = halt, st = 1) => { const me = meso(L, st), x = me.L.map((v) => v * k), lin = kurve(x), s8 = to8(lin); return { s8, l8: luma8(s8), S: satHSV(s8), h: hue8(s8), hS: OK(me.L).h, hP: OK(L).h, x, m: me.m }; };

// Sichten — Geometrie wie spike.cjs (gewählt, übernommen)
function herd(fern) { const Q = [0, 0.35, 0], S = [];
  const R = fern ? [[0.75, 0.0008], [1.25, 0.0015], [1.75, 0.002], [2.5, 0.004], [4, 0.01], [8, 0.03], [14, 0.08], [25, 0.15], [40, 0.25]] : [[0.75, 0.04], [1.25, 0.07], [1.75, 0.08], [2.5, 0.1], [4, 0.12], [8, 0.08], [14, 0.08], [30, 0.1]];
  const Em = MOND_E * HH + MOND_E * Math.cos(MOND_H * Math.PI / 180) / sM * 2 / Math.PI * HQ;
  for (const [r, w] of R) { const Ef = Ept(I_HERD, 0.38, Q, [r, 0.2, 0], null); S.push({ n: `Gras ${r} m`, r, w, Ef, Eg: Ef + Em + 0.01, L: Ldif(ATMO, [[Ef, C.f], [Em, C.m]]) }); }
  S.push({ n: "Flamme", w: fern ? 5e-5 : 0.004, L: Lq(10000, C.f), Eg: I_HERD / 0.38 ** 2, quelle: 1 });
  S.push({ n: "Glutbett", w: fern ? 1e-4 : 0.012, L: Lq(0.9 * Lfc(1100), C.g), Eg: Ept(I_HERD, 0.38, Q, [0.2, 0, 0], [0, 1, 0]) + MOND_E, quelle: 1 });
  S.push({ n: "Himmel", w: fern ? 0.33 : 0.29, L: Lq(L_HIM, C.h), himmel: 1, Eg: 0 }); return S; }
function wiese(E) { const Eh = E * HH + E * 0.3 * 2 / Math.PI * HQ + 0.0005; const LH = E > 0 ? L_HIM * E / E_MH : 0.0005 / Math.PI;
  return [{ n: "Wiese 2 m", w: 0.25, Eg: Eh * 1.2, L: Ldif(ATMO, [[Eh, C.m]]) }, { n: "Wiese 20 m", w: 0.25, Eg: Eh * 1.2, L: Ldif(ATMO, [[Eh * 0.9, C.m]]) },
    { n: "Karte", w: 0.005, Eg: E + 0.0015, L: Ldif([0.18, 0.18, 0.18], [[E + 0.0005, C.m]]) }, { n: "Laub Mond", w: 0.15, Eg: E + 0.001, L: Ldif(LAUB, [[E * 0.5, C.m]]) },
    { n: "Laub Schatten", w: 0.1, Eg: E + 0.001, L: Ldif(LAUB, [[E * 0.05 + 0.0005, C.m]]) }, { n: "Himmel", w: 0.245, L: Lq(LH, C.h), himmel: 1, Eg: 0 }]; }
function mittag() { const E = 117168, Eh = 17000, Es = E - Eh; return [
  { n: "Wiese Sonne", w: 0.45, Eg: E * 1.1, L: Ldif(ATMO, [[Es, C.s], [Eh, C.h]]) }, { n: "Karte", w: 0.01, Eg: E * 1.1, L: Ldif([0.18, 0.18, 0.18], [[Es, C.s], [Eh, C.h]]) },
  { n: "Wiese Schatten", w: 0.1, Eg: E * 1.1, L: Ldif(ATMO, [[Eh * 0.6, C.h]]) }, { n: "Krone", w: 0.1, Eg: E * 1.1, L: Ldif(LAUB, [[Es * 0.5, C.s], [Eh * 0.7, C.h]]) },
  { n: "Himmel", w: 0.34, L: Lq(Eh / Math.PI, C.h), himmel: 1, Eg: 0 }]; }
{ const M = mittag(); let s = 0, w = 0; for (const p of M) { s += p.w * Math.log(Y709(p.L) + 1e-6); w += p.w; } KAPPA = Y709(M[1].L) / Math.exp(s / w); }

say("\n## C. Das Auge des Entscheids, nachgerechnet (Geometrie aus spike.cjs übernommen)");
say(`κ = ${r2(KAPPA, 3)} (spike 1,822)`);
const Mi = mittag(), AM = auge(Mi), kar = zeige(Mi[1].L, AM.k);
say(`Mittag: k ${g3(AM.k)} · Karte ${kar.s8.join("/")} Luma ${r2(kar.l8, 1)} — k·L_Karte = ${r2(AM.k * Y709(Mi[1].L), 4)}: κ macht L_K = L_Karte, c(6 710) = ${r2(cKey(Y709(Mi[1].L)), 4)} EV → x = 0,22·2^c ≡ 0,22 → 118 per Konstruktion (Tautologie bestätigt)`);
const tab = (name, S, opt) => { const A = auge(S, opt); say(`\n### ${name}${opt && opt.perz === 1 ? " — Kappe am MAXIMUM (p100)" : ""}`); say(`L_a ${g3(A.La)} · L_K ${g3(A.LK)} · c ${r2(A.c)} · k_a ${g3(A.ka)} · k_c ${g3(A.kc)} (an ${A.q}) → k ${g3(A.k)}`);
  const rows = S.map((p) => { const E = zeige(p.L, A.k), N = zeige(p.L, A.k, mT); const top = Math.max(...E.x) - (Math.min(...E.x) < 0.08 ? Math.min(...E.x) - 6.25 * Math.min(...E.x) ** 2 : 0.04);
    return { p, E, N, top, ueber: top > 0.76 ? Math.log2(top / 0.76) : 0, dif: A.dif.has(p.n) }; });
  for (const r of rows) say(`  ${r.p.n.padEnd(14)} L ${g3(Y709(r.p.L)).padStart(8)} ${r.p.himmel ? "Himmel" : r.p.quelle ? (r.dif ? "QUELLE, Probe: diffus" : "QUELLE") : "diffus"} m ${r2(r.E.m)} · über 0,76 ${r.ueber ? "+" + r2(r.ueber) : "0"} EV · Halt ${r.E.s8.join("/")} L8 ${r2(r.E.l8, 1)} S ${r2(r.E.S)} Δh ${r2(dh(r.E.h, r.E.hS), 1)}° (tol ${r2(tol8(r.E.s8), 1)}) · Neutral ${r.N.s8.join("/")} Δh ${r2(dh(r.N.h, r.N.hS), 1)}°`);
  return { A, rows }; };
const HN = tab("herd-nah", herd(false)), HF = tab("herd-fern", herd(false === true ? 0 : 1));
const WN = tab("wiese-nacht (Mond 74,2°)", wiese(E_MH)), VM = tab("Vollmond Zenit", wiese(MOND_E));
const HNmax = tab("herd-nah", herd(false), { perz: 1 }), HFmax = tab("herd-fern", herd(true), { perz: 1 });

say("\n## D. Die Risse des Spikes, einzeln");
// R1
{ const S = herd(true), A = auge(S); const kreis = ["Gras 0.75 m", "Gras 1.25 m", "Gras 1.75 m", "Gras 2.5 m"]; const Wd = S.filter((p) => A.dif.has(p.n)).reduce((a, p) => a + p.w, 0);
  const share = S.filter((p) => kreis.includes(p.n)).reduce((a, p) => a + p.w, 0) / Wd; const g = HF.rows.find((r) => r.p.n === "Gras 0.75 m");
  say(`R1: Kreis-Anteil an den diffusen Proben ${r2(share * 100)} % (spike 1,57 %); Gras 0,75 m über 0,76: +${r2(g.ueber)} EV (spike +4,55); gegen 8-Bit-Weiß (+${r2(Math.log2(aWeiss / 0.76))}) bleibt +${r2(g.ueber - Math.log2(aWeiss / 0.76))} EV`);
  // Schwelle: ab welchem Kreis-Anteil sieht p98 ihn? (Faktor auf die Kreis-Gewichte)
  let f = 1; for (; f < 10; f += 0.01) { const T = herd(true); T.forEach((p) => { if (kreis.includes(p.n)) p.w *= f; }); if (auge(T).q === "Gras 1.25 m" || auge(T).q === "Gras 0.75 m" || auge(T).q === "Gras 1.75 m") break; }
  say(`R1: p98 erreicht den Kreis erst ab dem ${r2(f)}-fachen Anteil.`);
  // Abschätzung des wahren Anteils: Kreis r 2,5 m aus 25 m bei Augenhöhe h, Bild 16:9, vFOV 60°
  for (const h of [1.7, 4]) { const proj = Math.PI * 2.5 ** 2 * Math.sin(Math.atan(h / 25)), om = proj / (25 * 25 + h * h); const vf = 60 * Math.PI / 180, hf = 2 * Math.atan(Math.tan(vf / 2) * 16 / 9); const omB = 4 * Math.asin(Math.sin(hf / 2) * Math.sin(vf / 2));
    say(`R1 Plausibilität (gewählt: vFOV 60°, 16:9): Kreis r ≤ 2,5 m aus 25 m, Kamera ${h} m hoch → ${r2(om / omB * 100, 3)} % des Bilds (spike setzt 0,83 % des Bilds)`); } }
// R2
{ const S = herd(false), gb = S.find((p) => p.n === "Glutbett"); const A0 = auge(S); let kipp = null; for (let w = 0.002; w <= 0.06; w += 0.0005) { gb.w = w; const A = auge(S); if (A.q === "Glutbett") { kipp = { w, k: A.k }; break; } }
  say(`R2: Glutbett ${g3(Y709(gb.L))} cd/m², Schranke ρ_max/π·E ${g3(RHO_MAX / Math.PI * gb.Eg)} → Probe hält es für DIFFUS; Kipp bei ${kipp ? r2(kipp.w * 100, 2) : "—"} % des Bilds, k ${g3(A0.k)} → ${kipp ? g3(kipp.k) : "—"} (${kipp ? r2(Math.log2(kipp.k / A0.k)) : "—"} EV)`);
  const gr = zeige(herd(false)[0].L, kipp.k); say(`R2: Gras 0,75 m danach ${gr.s8.join("/")} Luma ${r2(gr.l8, 1)} (spike 74,3)`);
  // Glutbett mit dem Albedo von Holzkohle (ρ ≈ 0,05–0,1, unsicher) statt ρ_max: diffus?
  for (const rho of [0.05, 0.1]) say(`R2: Probe mit ρ ${rho} statt ρ_max → Schranke ${g3(rho / Math.PI * gb.Eg)} cd/m² → Glutbett ${Y709(gb.L) <= rho / Math.PI * gb.Eg ? "immer noch diffus" : "Quelle"}`);
  say(`R2: das Glutbett liegt an herd-nah +${r2(HN.rows.find((r) => r.p.n === "Glutbett").ueber)} EV über 0,76; als QUELLE (die Physik) fällt es aus (b) heraus — die (b)-Zeile des Spikes zählt einen Fehlgriff der Probe als Bruch des Gesetzes.`); }
// R3
{ const W = wiese(E_MH), g = W[0]; const finde = (ziel, st = 1) => { let lo = 0.01, hi = 1000; for (let i = 0; i < 80; i++) { const m = Math.sqrt(lo * hi); if (zeige(g.L, m, halt, st).l8 > ziel) hi = m; else lo = m; } return lo; };
  const kN = WN.A.k; say(`R3: Wiese 2 m k·L ${r2(kN * Y709(g.L), 4)} → Luma ${r2(zeige(g.L, kN).l8, 1)} (spike 4,8); mit Stäbchen-Stärke 1,22 (main) ${r2(zeige(g.L, kN, halt, 1.22).l8, 1)}`);
  for (const [z, st] of [[22, 1], [31.7, 1], [22, 1.22]]) { const k = finde(z, st); say(`R3: Luma ${z} (Stärke ${st}) braucht k ${g3(k)} → Knoten ${r2(-2.17 + Math.log2(k / kN))} EV; Karte dann ${r2(zeige(W[2].L, k, halt, st).l8, 1)}`); }
  say(`R3: der Anker S0 „≥ 22" steht in bild-kosten.js:3005-3006 als „dieselbe Luma wie main (24,1 ± 0,3)" — ein an main gesetzter Wert, kein Datum.`); }
// R4
{ const Y = (s) => Y709(s.map((v) => dec(v / 255)));
  const w = VM.rows; const sky = w.find((r) => r.p.n === "Himmel"), wi = w.find((r) => r.p.n === "Wiese 2 m");
  say(`R4 Vollmond: photopisch Himmel ${g3(Y709(sky.p.L))} < Wiese ${g3(Y709(wi.p.L))} cd/m²; skotopisch Himmel ${g3(SKOT[1] * sky.p.L[1] + SKOT[2] * sky.p.L[2])} vs Wiese ${g3(SKOT[1] * wi.p.L[1] + SKOT[2] * wi.p.L[2])}; Bild Y ${g3(Y(sky.E.s8))} vs ${g3(Y(wi.E.s8))}`);
  const kr = to8(halt([148, 40, 0].map((v) => dec(v / 255)))); const a = [148, 40, 0], b = [109, 57, 0]; say(`R4 Lava: Codes 148/40/0 Luma ${r2(luma8(a), 1)} Y ${r2(Y(a), 4)} · 109/57/0 Luma ${r2(luma8(b), 1)} Y ${r2(Y(b), 4)} → Code-Luma kehrt die Ordnung um, Y nicht`); }

say("\n## E. Tor 0,75 und „S ≤ 0,75 nur in der Schulter“");
for (const R of [HN, HF]) for (const r of R.rows.filter((r) => !r.p.quelle && !r.p.himmel)) if (r.ueber === 0 && r.E.S <= 0.76 && r.E.l8 > 8) say(`unter der Schulter mit S ≤ 0,76: ${r.p.n} (${R === HN ? "nah" : "fern"}) S ${r2(r.E.S)} m ${r2(r.E.m)} Luma ${r2(r.E.l8, 1)}`);
say(`Gras 0,75–2,5 m herd-nah: S ${HN.rows.slice(0, 4).map((r) => r2(r.E.S)).join(" / ")} · m ${HN.rows.slice(0, 4).map((r) => r2(r.E.m)).join(" / ")}`);

say("\n## F. Spanne (b) — wovon die Risse abhängen");
for (const [n, sp] of [["0 (Entscheid: Beginn der Schulter)", 0], ["0,188 (AUGE: Elastizität ½, gewählt)", 0.188], ["8-Bit-Weiß des hellsten Kanals", Math.log2(aWeiss / 0.76)]]) {
  const br = []; for (const [R, nm] of [[HN, "nah"], [HF, "fern"]]) for (const r of R.rows) if (!r.p.himmel && !r.p.quelle && r.ueber > sp + 1e-9) br.push(`${nm} ${r.p.n} +${r2(r.ueber - sp)}`);
  say(`Spanne ${n} = ${r2(sp)} EV: wahre diffuse Brüche ${br.length ? br.join(" · ") : "keiner"}`); }
// Elastizität der Kurve am Peak (grau): d ln y / d ln x
const ela = (P) => { const e = 1e-4; const f = (x) => Math.max(...mT([x, x * 0.6, x * 0.01])); return (Math.log(f(P * (1 + e))) - Math.log(f(P))) / Math.log(1 + e); };
say(`Elastizität der Kurve am hellsten Kanal (Feuerfarbe): x 0,76 → ${r2(ela(0.761), 3)} · 0,866 → ${r2(ela(0.866), 3)} · 1,5 → ${r2(ela(1.5), 3)} · 4 → ${r2(ela(4), 3)}`);

say("\n## G. p100 statt p98 — hält dann (a)–(d) an den Herd-Orten?");
for (const [nm, R] of [["herd-nah", HNmax], ["herd-fern", HFmax]]) { const so = R.rows.slice().sort((a, b) => Y709(a.p.L) - Y709(b.p.L)); let br = 0; const Y = (s) => Y709(s.map((v) => dec(v / 255)));
  for (let i = 1; i < so.length; i++) for (let j = 0; j < i; j++) if (Y(so[i].E.s8) + 1e-5 < Y(so[j].E.s8)) br++;
  const bb = R.rows.filter((r) => !r.p.quelle && !r.p.himmel && r.ueber > 0).length, cb = R.rows.filter((r) => r.E.l8 >= 8 && OK(r.E.s8.map((v) => dec(v / 255))).C > 0.02 && dh(r.E.h, r.E.hS) > tol8(r.E.s8)).length;
  say(`${nm} p100: k ${g3(R.A.k)} an ${R.A.q} · (a) Brüche im Schirm-Y ${br} · (b) wahre diffuse über 0,76: ${bb} · (c) Farbton-Brüche ${cb} · Gras 0,75 m Luma ${r2(R.rows[0].E.l8, 1)} · Gras 14 m ${r2(R.rows.find((r) => r.p.n === "Gras 14 m").E.l8, 1)}`); }

fs.writeFileSync(__dirname + "/widerleger-rechnung.out.txt", out.join("\n") + "\n");

// ── Nachtrag: (c) gegen SOLL wörtlich (Lichtfarbe × Albedo, ohne mesopische Mischung) · Glutbett-Anteil · ohne Kappe ──
const out2 = []; const say2 = (s) => { out2.push(s); console.log(s); };
say2("\n## H. (c) gegen SOLL wörtlich: Farbton des Bilds gegen den PHYSIKALISCHEN (Lichtfarbe × Albedo), Entscheid-Kurve, Flecke mit Luma ≥ 8 und C > 0,02");
for (const [nm, R] of [["herd-nah", HN], ["herd-fern", HF], ["wiese-nacht", WN], ["Vollmond", VM]]) {
  const br = R.rows.filter((r) => !r.p.himmel && !r.p.quelle && r.E.l8 >= 8 && OK(r.E.s8.map((v) => dec(v / 255))).C > 0.02).map((r) => ({ n: r.p.n, d: dh(r.E.h, r.E.hP), t: tol8(r.E.s8), dS: dh(r.E.h, r.E.hS) }));
  say2(`${nm}: ${br.map((b) => `${b.n} ${r2(b.d, 1)}° ${b.d > b.t ? ">" : "≤"} ${r2(b.t, 1)}° (gegen mesopische Erwartung ${r2(b.dS, 1)}°)`).join(" · ")}`); }
{ const G = (() => { const lat = [[0.4, 2.8, 0], [0.4, 2.8, 10]]; const eW = (p, n) => lat.reduce((a, q) => a + Ept(1, 0.02, q, p, n), 0); const Ewm = MOND_E * 0.5, Ews = Math.PI * L_HIM * 0.25 + 0.16 * Ewm * 0.3, Ebs = Math.PI * L_HIM * 0.35 + 0.16 * Ewm * 0.2;
    const mk = (n, w, rho, p, nr, mo) => { const E = eW(p, nr); return { n, w, Eg: E + mo + 0.02, L: Ldif(rho, [[E, C.d], [mo, C.m]]) }; };
    return [mk("Wand unter Laterne", 0.05, HAUS, [0, 1.8, 0], [1, 0, 0], Ews), mk("Wand 5 m", 0.1, HAUS, [0, 1.5, 5], [1, 0, 0], Ews), mk("Wand zum Mond", 0.18, HAUS, [6, 2, 5], [-1, 0, 0], Ewm), mk("Wand Schatten", 0.25, HAUS, [0, 3, 20], [1, 0, 0], Ews),
      mk("Pflaster Laterne", 0.05, FELS, [1, 0, 0], [0, 1, 0], Ebs), mk("Pflaster Schatten", 0.2, FELS, [1.5, 0, 25], [0, 1, 0], Ebs),
      { n: "Fenster", w: 0.02, L: Lq(0.8 * 0.5 * 0.25 / Math.PI, C.d), Eg: Ews + 0.02, quelle: 1 }, { n: "Glas", w: 0.003, L: Lq(1 / 0.104, C.d), Eg: 0.1, quelle: 1 }, { n: "Himmel", w: 0.12, L: Lq(L_HIM, C.h), himmel: 1, Eg: 0 }]; })();
  const A = auge(G); const z = G.filter((p) => !p.himmel).map((p) => { const e = zeige(p.L, A.k), n = zeige(p.L, A.k, mT); return e.l8 >= 8 ? `${p.n} ${e.s8.join("/")} Δh phys ${r2(dh(e.h, e.hP), 1)}° / meso ${r2(dh(e.h, e.hS), 1)}° · Neutral meso ${r2(dh(n.h, n.hS), 1)}° (tol ${r2(tol8(e.s8), 1)})` : null; }).filter(Boolean);
  say2(`gasse-nacht (k ${g3(A.k)}): ${z.join(" · ")}`); }
say2("\n## I. Glutbett-Anteil im Bild (Ego, Kamera 1,7 m, vFOV 60°, 16:9 — gewählt) gegen die Kipp-Schwelle 1,40 %");
{ const vf = Math.PI / 3, hf = 2 * Math.atan(Math.tan(vf / 2) * 16 / 9), omB = 4 * Math.asin(Math.sin(hf / 2) * Math.sin(vf / 2));
  for (const d of [1.5, 2, 2.5, 3, 4]) { const h = 1.7, A = Math.PI * 0.38 ** 2 * h / Math.hypot(d, h), om = A / (d * d + h * h); say2(`Bett Ø 0,76 m in ${d} m: ${r2(om / omB * 100, 2)} % des Bilds ${om / omB > 0.014 ? "→ über der Schwelle: k kippt" : ""}`); } }
say2("\n## J. Ohne Kappe (nur Schlüssel), Neutral");
{ const S = herd(false), A = auge(S, { ohneKappe: true }); const g = zeige(S[0].L, A.k, mT); say2(`herd-nah k_a ${g3(A.ka)}: Gras 0,75 m ${g.s8.join("/")} S ${r2(g.S)} Δh ${r2(dh(g.h, g.hS), 1)}° (spike 254/204/166 S 0,35)`); }
fs.appendFileSync(__dirname + "/widerleger-rechnung.out.txt", out2.join("\n") + "\n");
