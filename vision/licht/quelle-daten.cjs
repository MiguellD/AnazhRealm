// Die Daten der Quellen in EINER Art: {T oder Farbort, L (cd/m²) oder I (cd), Fläche/Geometrie} → was FOLGT.
const P = require("./quelle-physik.cjs");
const f = (v, n = 3) => (Math.abs(v) >= 1e5 || (Math.abs(v) < 1e-3 && v !== 0) ? v.toExponential(n - 1) : (+v.toPrecision(n)).toString());
const out = [];
const say = (s) => { out.push(s); console.log(s); };

// Prüfung des Bausteins: Leuchtdichte gegen den Kern (fachwerk leuchtdichte, Gauß-V): Kommentar 1400 K 2,4e3 · 1650 K 3,3e4 · 2000 K 4,6e5
for (const T of [1000, 1100, 1400, 1650, 1850, 2000, 2856, 5772]) say(`L_Planck(${T} K) = ${f(P.leuchtdichte(T))} cd/m²`);

// SONNE: T 5772 K (IAU 2015 B3), Winkelradius 0,2666° → Ω; Randverdunkelung: mittlere Scheibe ≈ 0,8 der Mitte — wir nehmen L·Ω direkt als Probe
const rS = (0.2666 * Math.PI) / 180, OmS = Math.PI * rS * rS;
const Ls = P.leuchtdichte(5772);
say(`Sonne: Ω ${f(OmS)} sr · L_Planck ${f(Ls)} cd/m² → E_TOA = L·Ω = ${f(Ls * OmS)} lx (Darula/Kittler/Gueymard 2005: 133 800 lx)`);
// MOND: Vollmond-Leuchtdichte ~2 500 cd/m² (Größenordnung, Lehrbuch-Wert; N29 der Tafel nennt 2 500), Winkelradius 0,259°
const rM = (0.259 * Math.PI) / 180, OmM = Math.PI * rM * rM;
for (const Lm of [2500, 4000]) say(`Mond: L ${Lm} cd/m² · Ω ${f(OmM)} → E⊥ ${f(Lm * OmM)} lx (Soll 0,1–0,3 lx)`);
// Albedo-Weg: L_mond = ρ_n · E_TOA / π (Lambert-Näherung, Normal-Albedo bei Opposition ~0,12 + Oppositionseffekt)
say(`Mond aus der Sonne: 0,12·133800/π = ${f((0.12 * 133800) / Math.PI)} cd/m² (Lambert-Näherung; gemessen ~2 500 → der Datum-Wert, die Näherung nur Probe)`);
// NACHTHIMMEL: 21,6–22,0 mag/arcsec² (natürlich dunkel), L = 10,8e4 · 10^(−0,4 m) cd/m²
for (const m of [21.6, 22.0]) { const L = 10.8e4 * Math.pow(10, -0.4 * m); say(`Nachthimmel ${m} mag/″² → L ${f(L)} cd/m² → E_h = π·L ${f(Math.PI * L)} lx (tag-ref: 0,0005 lx)`); }
// Mondbeschienener Himmel ~18 mag/″² (unsicher): L
say(`Mond-Himmel 18 mag/″² → L ${f(10.8e4 * Math.pow(10, -7.2))} cd/m² (unsicher)`);
// STERN der Größe m: E = 10^(−0,4·(m + 13,99)) lx
say(`Stern m=0 → E ${f(Math.pow(10, -0.4 * 13.99))} lx; m=6 → ${f(Math.pow(10, -0.4 * 19.99))} lx`);

// FEUER: Flammen-Leuchtdichte 1e4 cd/m² (Kerzenflamme ≈ 0,75–1 sb, Lehrbuch) · Candela 250 (Brand 15 kW · 0,16 lm/W → 2 400 lm ÷ 4π ≈ 190; Kern: 250)
const I_feuer = 250, L_flamme = 1e4;
say(`Feuer: I ${I_feuer} cd, L_Flamme ${L_flamme} cd/m² → leuchtende Fläche FOLGT A = I/L = ${f(I_feuer / L_flamme)} m² (Kern: emissiv 0,0012 × Bett 0,4536 m² × L(2000 K))`);
say(`  heute: Pool L = L(2000)·0,0012 = ${f(P.leuchtdichte(2000) * 0.0012)} cd/m² über 0,4536 m² = ${f(P.leuchtdichte(2000) * 0.0012 * 0.4536)} cd; gemaltes Bett 10 000 → Verhältnis ${f(1e4 / (P.leuchtdichte(2000) * 0.0012))}`);
for (const T of [900, 1000, 1100]) say(`  Glut des Betts (Holzkohle ε 0,9) ${T} K: L = ${f(0.9 * P.leuchtdichte(T))} cd/m²`);
// Planck-Farbort einer rußigen Flamme: Farbtemperatur 1 850–2 000 K
// LAVA: 1 650 K, ε 0,95
say(`Lava 1650 K ε 0,95: L_Riss = ${f(0.95 * P.leuchtdichte(1650))} cd/m²; Decke mit 17 % offen ≈ ${f(0.17 * 0.95 * P.leuchtdichte(1650))} cd/m² (+ Schollen); vor-spike: πL = 14 500 lx → L ${f(14500 / Math.PI)}`);

// BRENNER: candela (Kern) + Farbtemperatur je Brenner (neu, Blatt c: „Kelvin je Brenner — nicht gefunden“)
const BR = { docht: [1, 0.04, 1850], argand: [10, 0.06, 1950], gas: [16, 0.05, 2000], gluehstrumpf: [100, 0.08, 2700], gluehlampe: [110, 0.06, 2856] };
say(`Brenner: Kopf-Glas 0,26 × 0,40 m = 0,104 m² (eine Seite) → L_Glas = I / A_Glas; Flamme als Kugel ⌀ flammeM → L_Flamme = I / (π (d/2)²)`);
for (const [k, [I, d, T]] of Object.entries(BR)) {
  const Lg = I / 0.104, Lf = I / (Math.PI * (d / 2) ** 2);
  // Fenster einer Stube mit diesem Brenner: Lampe 2 m vor der Rückwand, Wand ρ 0,5, Glas τ 0,8 → L_Fenster = τ·ρ·(I/d²)/π
  const Lfen = (0.8 * 0.5 * (I / 4)) / Math.PI;
  const c = P.planckFarbe(T);
  say(`  ${k.padEnd(13)} I ${String(I).padStart(3)} cd · T ${T} K · L_Glas ${f(Lg)} · L_Flamme ${f(Lf)} cd/m² · Fenster ${f(Lfen)} cd/m² · Farbe(Luma 1) ${c.map((v) => v.toFixed(3)).join("/")}`);
}
// Farbe: Planck integriert gegen Kim–Kang (geklemmt unter 1 667 K)
say(`Farbe je Temperatur (R=1 genormt): Planck integriert ↔ Kim–Kang (fachwerk lichtFarbe)`);
for (const T of [1300, 1650, 1850, 2000, 2856, 4100, 5772, 6500]) {
  const p = P.planckFarbe(T), m = Math.max(...p), k = P.kimKang(T);
  say(`  ${T} K: Planck ${p.map((v) => (v / m).toFixed(4)).join("/")} · Kim–Kang ${k.map((v) => v.toFixed(4)).join("/")}`);
}
// FAHRZEUG (ECE R87/R7/R112, Größenordnung): Tagfahrlicht 400–1 200 cd, Schluss 4–12 cd, Brems 60–185 cd, Abblend bis ~20 000 cd im Kegel
say(`Fahrzeug: Tagfahrlicht 400–1200 cd (ECE R87) · Schluss 4–12 cd (R7) · Brems 60–185 cd (R7) · Abblendlicht Kegel ≤ ~20 000 cd (R112) · Linse 0,01 m² → L ${f(800 / 0.01)} cd/m² (Tagfahr)`);
require("fs").writeFileSync(__dirname + "/quelle-daten.out.txt", out.join("\n") + "\n");
