// entwurf-auge: die Kette vom Auge her, reine Rechnung (keine GPU, kein Baum geändert).
// Aufruf: node auge.cjs > auge.out.txt
"use strict";
const LOG = [];
const p = (...a) => { const s = a.join(" "); LOG.push(s); console.log(s); };
const f = (x, n = 3) => (x == null || !isFinite(x) ? String(x) : Number(x).toFixed(n));

// ---------- 1. Farbe: Planck über CIE 1931 (Wyman/Sloan/Shirley 2013, Mehrlappen) -> lineares sRGB ----------
const g = (x, m, s1, s2) => { const t = (x - m) / (x < m ? s1 : s2); return Math.exp(-0.5 * t * t); };
const xb = (l) => 1.056 * g(l, 599.8, 37.9, 31.0) + 0.362 * g(l, 442.0, 16.0, 26.7) - 0.065 * g(l, 501.1, 20.4, 26.2);
const yb = (l) => 0.821 * g(l, 568.8, 46.9, 40.5) + 0.286 * g(l, 530.9, 16.3, 31.1);
const zb = (l) => 1.217 * g(l, 437.0, 11.8, 36.0) + 0.681 * g(l, 459.0, 26.0, 13.8);
function planckRGB(T) { // lineares sRGB, Luma 1, außerhalb des Gamuts auf 0 geklemmt (wie lichtFarbe)
  let X = 0, Y = 0, Z = 0;
  for (let nm = 380; nm <= 780; nm++) {
    const l = nm * 1e-9, B = 1 / (l ** 5 * (Math.exp(0.014387769 / (l * T)) - 1));
    X += B * xb(nm); Y += B * yb(nm); Z += B * zb(nm);
  }
  X /= Y; Z /= Y; Y = 1;
  let r = 3.2404542 * X - 1.5371385 * Y - 0.4985314 * Z, gg = -0.969266 * X + 1.8760108 * Y + 0.041556 * Z, b = 0.0556434 * X - 0.2040259 * Y + 1.0572252 * Z;
  const roh = [r, gg, b];
  r = Math.max(0, r); gg = Math.max(0, gg); b = Math.max(0, b);
  const lu = 0.2126 * r + 0.7152 * gg + 0.0722 * b;
  return { rgb: [r / lu, gg / lu, b / lu], roh };
}
// fachwerk lichtFarbe (Kim-Kubik, Klemme 1667 K), auf Luma 1 genormt
function lichtFarbe(kelvin) {
  const T = Math.min(25000, Math.max(1667, +kelvin)), T2 = T * T, T3 = T2 * T;
  const x = T <= 4000 ? -0.2661239e9 / T3 - 0.2343589e6 / T2 + 0.8776956e3 / T + 0.17991 : -3.0258469e9 / T3 + 2.1070379e6 / T2 + 0.2226347e3 / T + 0.24039;
  const x2 = x * x, x3 = x2 * x;
  const y = T <= 2222 ? -1.1063814 * x3 - 1.3481102 * x2 + 2.18555832 * x - 0.20219683 : T <= 4000 ? -0.9549476 * x3 - 1.37418593 * x2 + 2.09137015 * x - 0.16748867 : 3.081758 * x3 - 5.8733867 * x2 + 3.75112997 * x - 0.37001483;
  const X = x / y, Z = (1 - x - y) / y;
  const r = Math.max(0, 3.2404542 * X - 1.5371385 - 0.4985314 * Z), gg = Math.max(0, -0.969266 * X + 1.8760108 + 0.041556 * Z), b = Math.max(0, 0.0556434 * X - 0.2040259 + 1.0572252 * Z);
  const lu = 0.2126 * r + 0.7152 * gg + 0.0722 * b;
  return [r / lu, gg / lu, b / lu];
}
// Planck-Leuchtdichte (fachwerk leuchtdichte, nachgebaut)
function leuchtdichte(T) { let s = 0; for (let nm = 380; nm <= 780; nm += 5) { const l = nm * 1e-9, u = nm * 1e-3 - 0.559; s += (1.1910429e-16 / l ** 5 / (Math.exp(0.014387769 / (l * T)) - 1)) * 1.019 * Math.exp(-285.4 * u * u) * 5e-9; } return 683 * s; }

// ---------- 2. Tonkurven ----------
const enc = (x) => { x = Math.max(0, Math.min(1, x)); return x <= 0.0031308 ? 12.92 * x : 1.055 * x ** (1 / 2.4) - 0.055; };
const dec = (e) => (e <= 0.04045 ? e / 12.92 : ((e + 0.055) / 1.055) ** 2.4);
function fuss(c) { const m = Math.min(...c), off = m < 0.08 ? m - 6.25 * m * m : 0.04; return c.map((v) => v - off); }
function schulter(P) { return 1 - 0.0576 / (P - 0.52); }
// three r184 neutralToneMapping (Khronos PBR Neutral), Ausgabe linear
function neutral(c0) {
  let c = fuss(c0); const P = Math.max(...c);
  if (P < 0.76) return c;
  const Pn = schulter(P); c = c.map((v) => (v * Pn) / P);
  const gg = 1 - 1 / (0.15 * (P - Pn) + 1);
  return c.map((v) => v + (Pn - v) * gg);
}
// DER ENTWURF: dieselbe Schulter, dieselbe Entsättigung g — gemischt im KODIERTEN Raum (sRGB): der HSV-Farbton des Schirms bleibt
// exakt der des Urbilds (affine Mischung mit Grau erhält (G-B)/(R-B)). Ausgabe linear (der Renderer kodiert danach).
function neutralTon(c0) {
  let c = fuss(c0); const P = Math.max(...c);
  if (P < 0.76) return c;
  const Pn = schulter(P); c = c.map((v) => (v * Pn) / P);
  const gg = 1 - 1 / (0.15 * (P - Pn) + 1);
  const e = c.map(enc), ep = enc(Pn);
  return e.map((v) => dec(v + (ep - v) * gg));
}
// Vergleich: je Kanal (Film/ACES-artig, der Weg zum Weiß über Gelb)
function jeKanal(c0) { return fuss(c0).map((v) => (v < 0.76 ? v : schulter(v))); }
function schirm(lin) {
  const s = lin.map((v) => Math.round(enc(v) * 255));
  const [R, G, B] = s, mx = Math.max(R, G, B), mn = Math.min(R, G, B);
  let h = 0; if (mx > mn) { if (mx === R) h = 60 * (((G - B) / (mx - mn)) % 6); else if (mx === G) h = 60 * ((B - R) / (mx - mn) + 2); else h = 60 * ((R - G) / (mx - mn) + 4); }
  if (h < 0) h += 360;
  return { rgb: s, luma: 0.2126 * R + 0.7152 * G + 0.0722 * B, hue: h, sat: mx ? (mx - mn) / mx : 0 };
}
const zeig = (r) => `${f(r.luma, 1)} (${r.rgb.join("/")}) H ${f(r.hue, 1)}° S ${f(r.sat, 2)}`;

// ---------- 3. die Spanne über der Schulter, HERGELEITET: die Elastizität d ln P' / d ln P der Schulter fällt auf 1/2 ----------
const elast = (P) => (P * 0.0576) / ((P - 0.52) ** 2 * schulter(P));
let lo = 0.76, hi = 20; for (let i = 0; i < 80; i++) { const m = (lo + hi) / 2; if (elast(m) > 0.5) lo = m; else hi = m; }
const P_HALB = lo, SPANNE = Math.log2(P_HALB / 0.76);
p("== 0. Die Spanne der Schulter (aus der Kurve) ==");
p(`Elastizität am Beginn 0,76: ${f(elast(0.76001), 3)} (1 = linear); Elastizität 1/2 bei P = ${f(P_HALB, 4)} -> Spanne = log2(P/0,76) = ${f(SPANNE, 3)} EV; P' dort ${f(schulter(P_HALB), 4)} (sRGB ${Math.round(enc(schulter(P_HALB)) * 255)})`);

// ---------- 4. DAS AUGE: EIN Zustand L_a (cd/m²) -> K (1/(cd/m²)) ----------
const KARTE = 0.18, ZIEL = 0.22;              // zielKarte FOLGT: Neutral(0,2212) = 0,18
const E_MITTAG = 117168, E_10 = 11080;          // spec/farbe/tag-ref.json (74,2° bzw. 10°) — die REF der Kamera
const E_MOND = 0.27;                            // Vollmond im Zenit, lx (belegt: Größenordnung 0,25-0,3 lx)
const L_MITTAG = (KARTE * E_MITTAG) / Math.PI, L_10 = (KARTE * E_10) / Math.PI, L_MOND = (KARTE * E_MOND) / Math.PI;
const STEIGUNG = 0.75, C_NACHT = -2.17;          // die zwei Bild-Anker, die bleiben (GB)
const C_10 = (1 - STEIGUNG) * Math.log2(L_10 / L_MITTAG);
function stufen(La) { // die Kompensation in EV, stückweise linear in log2 L_a, KEINE Sonnenhöhe
  const l = Math.log2(La);
  if (La >= L_10) return (1 - STEIGUNG) * Math.log2(La / L_MITTAG);
  if (La <= L_MOND) return C_NACHT;
  const t = (l - Math.log2(L_MOND)) / (Math.log2(L_10) - Math.log2(L_MOND));
  return C_NACHT + t * (C_10 - C_NACHT);
}
const K_auge = (La) => (ZIEL * 2 ** stufen(Math.max(La, L_MOND))) / Math.max(La, L_MOND);
p("\n== 1. Das Auge: Knoten in Leuchtdichte (cd/m² der Karte) ==");
p(`L_Mittag ${f(L_MITTAG, 1)} · L_10° ${f(L_10, 1)} (Stufe ${f(C_10, 3)}, die Tafel A27: -0,870) · L_Mond ${f(L_MOND, 4)} (Stufe ${C_NACHT})`);
p(`K Mittag ${f(K_auge(L_MITTAG), 6)} · K 10° ${f(K_auge(L_10), 6)} · K Mond (offen, Boden) ${f(K_auge(L_MOND), 3)} 1/(cd/m²)`);
p(`Karte Mittag k·L = ${f(K_auge(L_MITTAG) * L_MITTAG, 4)} -> ${zeig(schirm(neutralTon([0.22, 0.22, 0.22].map((v) => (v * K_auge(L_MITTAG) * L_MITTAG) / 0.22))))} (Lehre 21: sRGB 118)`);
// Dämmerung gegen heute (Sonne 0°: 779 lx laut WL:109; heute stufen(0°) = -0,87 + (-2,17+0,87)·10/30)
const L0 = (KARTE * 779) / Math.PI;
p(`Sonne 0° (779 lx): Stufe Entwurf ${f(stufen(L0), 3)} gegen heute ${f(-0.87 + (-1.3 * 10) / 30, 3)} (Fahrplan in Sonnenhöhe) -> Δ ${f(stufen(L0) - (-0.87 - 1.3 / 3), 2)} EV`);

// Schwelle des Auges: TVI nach Ferwerda et al. 1996 (Stäbchen und Zapfen), L in cd/m²
function tvi(La) {
  const l = Math.log10(La);
  const ts = l <= -3.94 ? -2.86 : l >= -1.44 ? l - 0.395 : (0.405 * l + 1.6) ** 2.18 - 2.86;
  const tp = l <= -2.6 ? -0.72 : l >= 1.9 ? l - 1.255 : (0.249 * l + 0.65) ** 2.7 - 0.72;
  return Math.min(10 ** ts, 10 ** tp);
}
p("\n== 2. Die Reichweite aus der Schwelle des Auges (ersetzt AUGE.eps) ==");
for (const [name, La, Eu] of [["Vollmond", L_MOND, E_MOND], ["Sterne", (KARTE * 0.0005) / Math.PI, 0.0005], ["Dämmerung -6°", (KARTE * 3.01) / Math.PI, 3.01]]) {
  const w = tvi(La) / La;
  const r = [["docht", 1], ["gas", 16], ["gluehstrumpf", 100], ["feuer", 249]].map(([n, I]) => `${n} ${f(Math.sqrt(I / (w * Eu)), 1)} m`).join(" · ");
  p(`${name}: L_a ${f(La, 5)} cd/m², Weber-Bruch ΔL/L ${f(w, 3)} -> Reichweite ${r}`);
}

// ---------- 5. Die Sichten (physikalische Leuchtdichten) ----------
const RHO_GRAS = [0.151, 0.182, 0.044];  // Spike r3, quellenlose Wiese (unsicher)
const lumaV = (c) => 0.2126 * c[0] + 0.7152 * c[1] + 0.0722 * c[2];
const F2000 = lichtFarbe(2000), MONDLICHT = planckRGB(4100).rgb; // Mondlicht = Sonnenlicht × Mond-Rückstrahlung (≈ 4 100 K, unsicher)
const fleck = (name, L, farbe, diffus, anteil) => ({ name, L, farbe, diffus, anteil });
const unterLicht = (rho, licht, E) => { if (!(E > 0)) return { L: 0, farbe: [1, 1, 1] }; const c = rho.map((r, i) => (r * licht[i] * E) / Math.PI); const lu = lumaV(c); return { L: lu, farbe: c.map((v) => v / lu) }; };
const FEUER_I = 249, FEUER_K2 = 0.4536 / Math.PI, FEUER_H = 0.35;
const grasFeuer = (a) => { const E = FEUER_I / (a * a + FEUER_H * FEUER_H + FEUER_K2); const m = unterLicht(RHO_GRAS, F2000, E), n = unterLicht(RHO_GRAS, MONDLICHT, E_MOND); const c = m.farbe.map((v, i) => v * m.L + n.farbe[i] * n.L); const L = lumaV(c); return { E, L, farbe: c.map((v) => v / L) }; };
const grasMond = unterLicht(RHO_GRAS, MONDLICHT, E_MOND);
const HIMMEL_NACHT = 0.005; // cd/m², mondheller Himmel (unsicher)
function sichtHerd() {
  const s = [];
  for (const [a, an] of [[0.75, 0.05], [1.25, 0.07], [1.75, 0.07], [2.5, 0.06], [4, 0.05]]) { const q = grasFeuer(a); s.push(fleck(`Gras ${a} m (E ${f(q.E, 1)} lx)`, q.L, q.farbe, true, an)); }
  s.push(fleck("ferne Wiese (Mond)", grasMond.L, grasMond.farbe, true, 0.40));
  s.push(fleck("Himmel", HIMMEL_NACHT, MONDLICHT, false, 0.22));
  s.push(fleck("Bett 548 cd/m² (Pool-Mittel)", leuchtdichte(2000) * 0.0012, F2000, false, 0.015));
  s.push(fleck("Flamme 1e4 cd/m² (Kerze, unsicher)", 1e4, F2000, false, 0.015));
  return s;
}
function sichtLava() {
  const s = [], L_DECKE = 14500 / Math.PI, T_RISS = 1650, L_RISS = leuchtdichte(T_RISS) * 0.95, FR = planckRGB(T_RISS).rgb, FD = planckRGB(1300).rgb;
  for (const [n, E, an] of [["Ufer-Saum (E 1 235 lx)", 1235, 0.08], ["Ufer vorn (E 732 lx)", 732, 0.08], ["Gras 15 m (E 312 lx)", 312, 0.12]]) { const m = unterLicht(RHO_GRAS, FD, E); s.push(fleck(n, m.L, m.farbe, true, an)); }
  { const m = unterLicht([0.06, 0.08, 0.04], FD, 268); s.push(fleck("Baumlinie (E 268 lx, ρ 0,07)", m.L, m.farbe, true, 0.15)); }
  s.push(fleck("ferne Wiese (Mond)", grasMond.L, grasMond.farbe, true, 0.07));
  s.push(fleck("Himmel", HIMMEL_NACHT, MONDLICHT, false, 0.2));
  s.push(fleck(`Lava-Decke ${f(L_DECKE, 0)} cd/m² (1300 K)`, L_DECKE, FD, false, 0.27));
  s.push(fleck(`Riss ${f(L_RISS, 0)} cd/m² (1650 K)`, L_RISS, FR, false, 0.03));
  return s;
}
function sichtGasse(fensterL) {
  const RHO_W = [0.35, 0.3, 0.25], s = [];
  // Wandlaterne docht (FC:6466-6482 nachgerechnet): I 1,184 cd, k² 7,52 -> Wand in 0,4 m 0,154 lx, Gasse darunter 0,077 lx
  const wl = (1 * (2.8 * 2.8 + 7.52)) / (3.6 * 3.6 + 0.01);
  const F1850 = lichtFarbe(1850);
  const wand = (E_m, E_l) => { const a = unterLicht(RHO_W, MONDLICHT, E_m), b = unterLicht(RHO_W, F1850, E_l); const c = a.farbe.map((v, i) => v * a.L + b.farbe[i] * b.L); const L = lumaV(c); return { L, farbe: c.map((v) => v / L) }; };
  let w = wand(E_MOND * 0.5, 0); s.push(fleck("Wand zum Mond (cos 60°)", w.L, w.farbe, true, 0.25));
  w = wand(E_MOND * 0.02, 0); s.push(fleck("Wand im Mondschatten (Himmel 2 %)", w.L, w.farbe, true, 0.25));
  w = wand(E_MOND * 0.02, wl / (0.16 + 7.52)); s.push(fleck(`Wand an der Docht-Laterne (${f(wl / (0.16 + 7.52), 3)} lx)`, w.L, w.farbe, true, 0.1));
  w = wand(E_MOND, wl / (7.84 + 7.52)); s.push(fleck("Gasse (Mond + Laterne)", w.L, w.farbe, true, 0.2));
  s.push(fleck("Himmel", HIMMEL_NACHT, MONDLICHT, false, 0.1));
  s.push(fleck(`Fenster ${fensterL} cd/m² (2800 K)`, fensterL, lichtFarbe(2800), false, 0.06));
  s.push(fleck("Laternen-Glas docht 9,6 cd/m²", 9.6, F1850, false, 0.04));
  return s;
}
// L_a: log-Mittel der Sicht zwischen dem 10. und 90. Perzentil der Pixel (UE AutoExposure-Vorgabe LowPercent/HighPercent)
function zustand(s) {
  const o = [...s].sort((a, b) => a.L - b.L); let c = 0, sw = 0, sl = 0;
  for (const q of o) { const a = Math.max(c, 0.1), b = Math.min(c + q.anteil, 0.9); if (b > a) { sw += b - a; sl += (b - a) * Math.log(q.L); } c += q.anteil; }
  return Math.exp(sl / sw);
}
// die Kappe: der hellste DIFFUSE Fleck (CPU, aus den Quellen gerechnet) mit seinem hellsten Kanal an Schulter + Spanne
const K_kappe = (s) => Math.min(...s.filter((q) => q.diffus).map((q) => (0.76 * 2 ** SPANNE) / (q.L * Math.max(...q.farbe))));
// das Auge der Nacht (BK:2204ff.) in echter Leuchtdichte: s aus L (cd/m²), Grau skotopisch (Pattanaik, Stärke 1), kein Bild-Term
const SKOT = [0, 0.5437, 0.3599];
function nachtAuge(L, farbe) {
  const z = Math.max(0, Math.min(1, Math.log(Math.max(L, 0.005) / 0.005) / Math.log(1000)));
  const s = 1 - z, c = farbe.map((v) => v * L), sk = c[0] * SKOT[0] + c[1] * SKOT[1] + c[2] * SKOT[2];
  return { s, c: c.map((v) => v * (1 - s) + sk * s) };
}
function zeigeSicht(name, s, Kfest = null, extra = "") {
  const La = zustand(s), Ka = K_auge(La), Kc = K_kappe(s), K = Kfest != null ? Kfest : Math.min(Ka, Kc);
  p(`\n-- ${name}: L_a ${f(La, 4)} cd/m² · K_a ${f(Ka, 4)} · K_kappe ${f(Kc, 4)} · K ${f(K, 4)} (${Kfest != null ? "fest: " + extra : K === Ka ? "Zustand bindet" : "Kappe bindet"})`);
  const zeilen = [];
  for (const q of s) {
    const na = nachtAuge(q.L, q.farbe), x = na.c.map((v) => v * K);
    const a = schirm(neutral(x)), b = schirm(neutralTon(x)), roh = schirm(x.map((v) => Math.min(1, v)));
    zeilen.push({ q, a, b, kL: lumaV(x), s: na.s });
    p(`  ${q.name.padEnd(40)} L ${f(q.L, 4).padStart(10)} · s ${f(na.s, 2)} · k·L ${f(lumaV(x), 3).padStart(8)} | Neutral ${zeig(a)} | Entwurf ${zeig(b)} | Urbild-Ton H ${f(roh.hue, 1)}°`);
  }
  // Eigenschaften (a) Ordnung, (b) Schulter, (c) Ton
  const o = [...zeilen].sort((u, v) => u.q.L - v.q.L);
  let ord = true; for (let i = 1; i < o.length; i++) if (o[i].b.luma + 0.5 < o[i - 1].b.luma) ord = false;
  const schulterMax = Math.max(...zeilen.filter((z) => z.q.diffus).map((z) => Math.max(...z.q.farbe.map((v) => v * z.q.L * K))));
  const tonFehler = (key) => Math.max(...zeilen.filter((z) => z.q.diffus && z[key].sat > 0.05).map((z) => { const u = schirm(nachtAuge(z.q.L, z.q.farbe).c.map((v) => Math.min(1, (v * K) / Math.max(...nachtAuge(z.q.L, z.q.farbe).c.map((w) => w * K), 1e-9)))); let d = Math.abs(z[key].hue - u.hue); return Math.min(d, 360 - d); }));
  p(`  (a) Ordnung monoton: ${ord} · (b) hellster diffuser Kanal k·L ${f(schulterMax, 3)} (Grenze 0,76·2^Spanne = ${f(0.76 * 2 ** SPANNE, 3)}) · (c) größter Ton-Fehler diffus: Neutral ${f(tonFehler("a"), 1)}° · Entwurf ${f(tonFehler("b"), 1)}°`);
  return { La, Ka, Kc, K, zeilen };
}

p("\n== 3. Die drei Sichten unter dem Entwurf (K = min(K_a, K_kappe), Nacht-Auge in cd/m²) ==");
const herd = sichtHerd(), lava = sichtLava(), gasse = sichtGasse(20), gasse1320 = sichtGasse(0.48);
const H = zeigeSicht("Herd-nah", herd), LV = zeigeSicht("Lava-Ufer", lava), G = zeigeSicht("Gasse (Fenster 20 cd/m², das Datum heute)", gasse);
zeigeSicht("Gasse 1320 (Fenster aus der Stube: Herd 5 lx × ρ 0,5/π × τ 0,6 = 0,48 cd/m², unsicher)", gasse1320);
// fern: dieselbe Wiese, das Feuer klein im Bild (Kamera 12 m)
const fern = sichtHerd().map((q) => ({ ...q, anteil: q.name.startsWith("ferne") ? 0.6 : q.name.startsWith("Himmel") ? 0.3 : q.anteil * 0.2 }));
const tot = fern.reduce((a, q) => a + q.anteil, 0); fern.forEach((q) => (q.anteil /= tot));
zeigeSicht("Herd-fern (12 m, das Feuer klein im Bild; die Kappe sieht dieselben Quellen)", fern);

// ---------- 6. Die vier gescheiterten Runden, nachgerechnet am selben Fleck ----------
p("\n== 4. Die Runden ==");
// Runde 1: q-Gesetz zeig(E) = S(A)((1+E/A)^0,42 - 1), oben S(A+E)E/(A+E); A = Mond 0,27 lx
const S = (lux) => 7.83 * (Math.max(0, lux) / 115000) ** 0.2;
const zeigQ = (E, A) => Math.min(S(A) * ((1 + E / A) ** 0.42 - 1), (S(A + E) * E) / (A + E));
const E1 = grasFeuer(0.75).E, E3 = grasFeuer(2.5).E, E5 = grasFeuer(4).E;
p(`R1 q-Gesetz (A = ${E_MOND} lx): Gras 0,75 m / 2,5 m / 4 m E = ${f(E1, 1)} / ${f(E3, 1)} / ${f(E5, 1)} lx, physikalisch ${f(Math.log2(E1 / E3), 2)} EV + ${f(Math.log2(E3 / E5), 2)} EV; gezeigt ${f(Math.log2(zeigQ(E1, E_MOND) / zeigQ(E3, E_MOND)), 2)} EV + ${f(Math.log2(zeigQ(E3, E_MOND) / zeigQ(E5, E_MOND)), 2)} EV; Gras 4 m über der Mond-Wiese: physikalisch ${f(Math.log2((E5 + E_MOND) / E_MOND), 2)} EV, gezeigt ${f(Math.log2((zeigQ(E5, E_MOND) + S(E_MOND)) / S(E_MOND)), 2)} EV`);
p(`   Verlauf 0,75 -> 4 m: physikalisch ${f(Math.log2(E1 / E5), 2)} EV, q-Gesetz ${f(Math.log2(zeigQ(E1, E_MOND) / zeigQ(E5, E_MOND)), 2)} EV (Anteil ${f(Math.log2(zeigQ(E1, E_MOND) / zeigQ(E5, E_MOND)) / Math.log2(E1 / E5), 2)})`);
// Runde 3/4: der Zustand als Lux, K = 0,22·2^-2,17 / (0,18·Zustand/π) (die Nacht-Stufe), Neutral
const Kvon = (lux) => (ZIEL * 2 ** C_NACHT) / ((KARTE * lux) / Math.PI);
const probe = (titel, sicht, lux, gew = null) => {
  const K = Kvon(lux);
  const r = sicht.filter((q) => q.diffus).slice(0, 3).map((q) => { let x = q.farbe.map((v) => v * q.L * K); if (gew) x = x.map((v, i) => v * gew[i]); const a = schirm(neutral(x)); return `${q.name.split(" (")[0]} k·L ${f(lumaV(x), 2)} -> ${zeig(a)}`; });
  p(`${titel}: Zustand ${lux} lx -> K ${f(K, 3)}; ${r.join(" | ")}`);
};
probe("R3 Herd-nah (A + 0,25·ΣE, Spike (a))", herd, 2.88);
probe("R3 Lava (Spike (a))", lava, 568);
probe("R4 Herd-nah (Feld-Messer, Spike (b))", herd, 5.99);
probe("R4 Lava (Feld-Messer, Spike (b))", lava, 9.25);
probe("R4 Gasse (Feld-Messer, Spike (b)) ohne von Kries", gasse, 2.63);
// von Kries (r4 60ff344e6, CAT02): Gewinne 0,83/1,11/3,27 in LMS — hier grob als Gewinne je sRGB-Kanal (unsicher)
probe("R4 Gasse mit Gewinnen 0,83/1,11/3,27 je Kanal (grob)", gasse, 2.63, [0.83, 1.11, 3.27]);
// die Wand: ein Mittel-Messer legt die Karte des Zustands auf 0,22·2^c; der hellste diffuse Fleck liegt um log2(L_max/L_a) darüber
for (const [n, s, la] of [["Herd-nah R4", herd, 5.99], ["Lava R4", lava, 9.25], ["Lava R3", lava, 568]]) {
  const Lmax = Math.max(...s.filter((q) => q.diffus).map((q) => q.L * Math.max(...q.farbe)));
  const Lk = (KARTE * la) / Math.PI;
  p(`Wand ${n}: hellster diffuser Kanal ${f(Lmax, 2)} cd/m², Karte des Zustands ${f(Lk, 3)} -> ${f(Math.log2(Lmax / Lk), 2)} EV über der Karte; Raum bis Schulter+Spanne ${f(Math.log2((0.76 * 2 ** SPANNE) / (ZIEL * 2 ** C_NACHT)), 2)} EV`);
}

// ---------- 7. Die Kurve allein: Gras im Feuer, Riss der Lava, Fenster, ein roter Ziegel am Mittag ----------
p("\n== 5. Die Kurve allein (Neutral · Entwurf · je Kanal) ==");
const grasF = grasFeuer(1.25).farbe;
for (const [n, c] of [["Gras im Feuer (2000 K)", grasF], ["Riss 1650 K Planck", planckRGB(1650).rgb], ["Fenster 2800 K", lichtFarbe(2800)]]) {
  for (const kl of [0.2, 0.4, 0.8, 1.6, 4, 16]) {
    const x = c.map((v) => v * kl);
    p(`  ${n.padEnd(24)} k·L ${String(kl).padStart(5)}: Neutral ${zeig(schirm(neutral(x)))} | Entwurf ${zeig(schirm(neutralTon(x)))} | je Kanal ${zeig(schirm(jeKanal(x)))}`);
  }
}
// Mittag: Karte, ein roter Ziegel und ein blauer Himmel über der Schulter
for (const [n, x] of [["Karte 0,18", [0.22, 0.22, 0.22]], ["weiße Wand 0,8 zur Sonne", [0.98, 0.97, 0.93]], ["roter Ziegel ρ 0,45/0,12/0,07 zur Sonne ×2", [1.1, 0.29, 0.17]], ["Himmel am Horizont", [0.55, 0.7, 0.95]]]) {
  const a = schirm(neutral(x)), b = schirm(neutralTon(x));
  p(`  Mittag ${n.padEnd(38)} Neutral ${zeig(a)} | Entwurf ${zeig(b)} | Δ Luma ${f(b.luma - a.luma, 1)}`);
}
// die 0,75 des Tors: Gras 1-3 m im Feuer, Entwurf, mit dem Nacht-Auge
p("\n== 6. Die Sättigung des Tors (≤ 0,75) gegen das Gesetz ==");
for (const a of [1, 2, 3]) { const q = grasFeuer(a), na = nachtAuge(q.L, q.farbe), x = na.c.map((v) => v * H.K); p(`  Gras ${a} m: L ${f(q.L, 3)} cd/m² · Stäbchen-Anteil s ${f(na.s, 3)} · Entwurf ${zeig(schirm(neutralTon(x)))}`); }
p(`  das Licht selbst: lichtFarbe(2000) × ρ_Gras = ${RHO_GRAS.map((r, i) => f(r * F2000[i], 4)).join("/")} -> HSV-Sättigung linear ${f(1 - Math.min(...RHO_GRAS.map((r, i) => r * F2000[i])) / Math.max(...RHO_GRAS.map((r, i) => r * F2000[i])), 3)}`);

// ---------- 8. Was fällt: Zählung an der Tafel ----------
p("\n== 7. Was fällt (Tafel-Zeilen, Felder) ==");
const T = require("./tafel-daten.cjs");
const FAELLT = { // id: Felder, die fallen (ersatzlos oder sie FOLGEN jetzt aus der Kette)
  A1: 1, A2: 1, A3: 1, A4: 1, A5: 1, A6: 1, A9: 1, A10: 1, A11: 1, A13: 1, A18: 1, A20: 2, A22: 1, A23: 1, A24: 3, A28: 1, A29: 1,
  N1: 1, N2: 1, N3: 1, N7: 1, N12: 1, N16: 1, N19: 1, N20: 3, N21: 1, N22: 1, N24: 4, N33: 6,
  S1: 1, S2: 1, Q6: 1, Q17: 2, Q19: 1, Q29: 1, L8: 1, L16: 1, L20: 1, E17: 1, R2: 3, R1: 1,
};
let z = 0, fe = 0; const nachSt = {};
for (const [id, n] of Object.entries(FAELLT)) {
  const e = T.find((r) => r.id === id); if (!e) throw new Error("fehlt " + id);
  if (n > e.n) throw new Error("zu viele Felder " + id);
  z++; fe += n; nachSt[e.st] = (nachSt[e.st] || 0) + n;
}
const kette = T.filter((e) => !/[TK]/.test(e.fl) && !e.sek.startsWith("9"));
const kF = kette.reduce((a, e) => a + e.n, 0), kG0 = kette.filter((e) => e.st === "G0").reduce((a, e) => a + e.n, 0);
const inKette = Object.entries(FAELLT).filter(([id]) => kette.some((e) => e.id === id));
const fK = inKette.reduce((a, [, n]) => a + n, 0), fKG0 = inKette.filter(([id]) => kette.find((e) => e.id === id).st === "G0").reduce((a, [, n]) => a + n, 0);
p(`fallen: ${z} Zeilen · ${fe} Felder; nach Status ${JSON.stringify(nachSt)}`);
p(`in der Licht-Kette (${kF} Felder, davon G0 ${kG0}): fallen ${fK} Felder (${f((100 * fK) / kF, 1)} %), davon G0 ${fKG0} (${f((100 * fKG0) / kG0, 1)} % der ankerlosen)`);
const NEU = ["E_Sonne außerhalb der Luft 128 000 lx (GA)", "E_Vollmond Zenit 0,27 lx (GA)", "TVI Ferwerda 1996 (GA, Formel)", "Perzentile 10/90 des Zustands (UE-Konvention, gewählt)", "Spanne 0,5 der Elastizität (gewählt; die EV-Zahl FOLGT)"];
p(`neu gesetzt: ${NEU.length} — ${NEU.join(" · ")}`);
require("fs").writeFileSync(__dirname + "/auge.out.txt", LOG.join("\n") + "\n");
