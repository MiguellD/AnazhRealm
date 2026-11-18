// Das EINE Gesetz von der Quelle her, gerechnet an drei Sichten (Herd nah/fern, Lava-Ufer, Gasse) + Mittag-Eichung.
// Kette: Quelle (T, L/I, Geometrie) → Weg (E = I·Geometrie/d², Luft im Nahbereich ≈ 1) → Stoff (L = ρ/π·E, Lambert) →
// Auge (EIN Zustand L_a = log-Mittel der Leuchtdichte der Sicht; k = c·a(L_a)/L_a, gedeckelt k ≤ k_c) → Neutral → sRGB.
// Alle Annahmen der Geometrie und der Pixel-Anteile sind GEWÄHLT (hier benannt); die Quell-Daten tragen ihre Marke im Entwurf.
const P = require("./quelle-physik.cjs");
const out = []; const say = (s) => { out.push(s); console.log(s); };
const r3 = (v) => (Math.abs(v) >= 1000 ? v.toExponential(2) : +v.toPrecision(3));

// ---------- Daten ----------
const MOND_E = 0.3965;              // lx, Vollmond im Zenit (spec/farbe/tag-ref.json, USNO Circ. 171) — belegt
const MOND_T = 4100;               // K, Mondlicht (Jensen et al. 2001, „A Physically-Based Night Sky Model“) — belegt
const MONDHIMMEL_L = 6.8e-3;       // cd/m², mondheller Himmel ~18 mag/″² — unsicher
const HIMMEL_T = 9000;             // K, gestreutes Licht des Himmels (Rayleigh-blau) — gewählt
const FEUER = { I: 250, L: 1e4, T: 2000, h: 0.35 }; // cd · cd/m² (Kerzenflamme ~1 sb) · K · m
const GLUT = { L: 0.9 * P.leuchtdichte(1100), T: 1100 };
const LAVA = { Lriss: 0.95 * P.leuchtdichte(1650), anteilRiss: 0.14, Lkruste: 0.9 * P.leuchtdichte(1100), T: 1650, Tk: 1100, r: 7.5 };
const DOCHT = { I: 1, T: 1850, Lglas: 1 / 0.104, Lflamme: 796 };
const GRAS = [0.1003, 0.1385, 0.0449]; // ATMO_BODEN (welt-licht.js:39, Albedo-Tafel)
const PUTZ = [0.6, 0.55, 0.47];        // Kalkputz — gewählt
const PFLASTER = [0.2, 0.19, 0.17];    // — gewählt
const HALM = { quer: 0.89, hoch: 0.34 }; // HALM_VOLUMEN (stoff-material.js:3898)
const col = (T) => P.planckFarbe(T); // Luma 1, Farbton gehalten
const add = (a, b, s = 1) => a.map((v, i) => v + b[i] * s);
const mul = (a, b) => a.map((v, i) => v * b[i]);
const Y = P.luma;

// Leuchtdichte (rgb, cd/m²) einer diffusen Fläche ρ unter Licht-Beiträgen [{E, T}]
const diffus = (rho, licht) => licht.reduce((acc, { E, T, c }) => add(acc, mul(rho, c || col(T)), E / Math.PI), [0, 0, 0]);
const strahler = (L, T) => col(T).map((v) => v * L);

// Halm-Volumen: E eines Punktlichts I in (dx waagrecht, dy senkrecht)
function eHalm(I, dx, dy) { const d2 = dx * dx + dy * dy, d = Math.sqrt(d2); return (I / d2) * ((2 / Math.PI) * HALM.quer * (dx / d) + HALM.hoch * Math.abs(dy / d)); }
// Halm-Volumen unter einer leuchtenden Scheibe (Lambert, L) — numerisch integriert; Fleck im Abstand s vom Rand, Höhe h über der Scheibe
function eHalmScheibe(L, R, s, h) {
  let Fx = 0, Fy = 0; const nr = 60, nphi = 120;
  for (let i = 0; i < nr; i++) for (let j = 0; j < nphi; j++) {
    const rr = ((i + 0.5) / nr) * R, ph = ((j + 0.5) / nphi) * 2 * Math.PI, dA = (R / nr) * rr * ((2 * Math.PI) / nphi);
    const px = R + s - rr * Math.cos(ph), pz = -rr * Math.sin(ph); // Vektor Quelle → Fleck (waagrecht)
    const d2 = px * px + pz * pz + h * h, d = Math.sqrt(d2), cosE = h / d; // Emission nach oben, Lambert
    const dE = (L * cosE * dA) / d2; Fx += (dE * Math.hypot(px, pz)) / d; Fy += (dE * h) / d;
  }
  return (2 / Math.PI) * HALM.quer * Fx + HALM.hoch * Fy;
}

// ---------- das Auge ----------
const krawczyk = P.krawczyk;
function auge(sicht, mitDeckel = true) {
  // L_a: log-Mittel der Leuchtdichte (Luma) der Sicht, Pixel-gewichtet
  let s = 0, w = 0; for (const p of sicht) { s += p.w * Math.log(Math.max(1e-6, Y(p.L))); w += p.w; }
  const La = Math.exp(s / w);
  const kKey = P.neutralGrauUmkehr((0.18 * krawczyk(La)) / A0) / (KAPPA * La);
  // der Deckel (b): kein diffuser Fleck mit seinem hellsten Kanal über den Beginn der Schulter (0,76)
  let kc = Infinity; for (const p of sicht) if (!p.quelle) kc = Math.min(kc, 0.76 / Math.max(...p.L));
  return { La, a: krawczyk(La), kKey, kc, k: mitDeckel ? Math.min(kKey, kc) : kKey };
}
// Mesopisch (CIE 191 in der Form des Kerns: Anteil m der Zapfen log-linear zwischen 0,005 und 5 cd/m²) — das Grau der Stäbchen
// skotopisch gewogen (V′ in linearem sRGB, NACHT_AUGE.skotopisch ohne Stärke-Stellwert: auf die photopische Luma der Farbe genormt)
function mesopisch(L) {
  const l = Y(L), m = Math.max(0, Math.min(1, Math.log(Math.max(l, 0.005) / 0.005) / Math.log(1000)));
  const sk = 0 * L[0] + 0.5437 * L[1] + 0.3599 * L[2]; const grau = (sk / (0.5437 + 0.3599)) ; // Grau gleicher skotopischer Erregung
  return { L: L.map((v) => m * v + (1 - m) * grau), m };
}
function bild(L, k, kurve = KURVE) {
  const lin = kurve(L.map((v) => v * k)), s8 = P.srgb8(lin), h = P.hsv(s8.map((v) => v / 255));
  const luma8 = 0.2126 * s8[0] + 0.7152 * s8[1] + 0.0722 * s8[2];
  return { s8, luma8, S: h.S, H: h.H, ok: P.oklab(lin) };
}

let KURVE = P.neutral;
// ---------- Eichung am Mittag (Lehre 21: die 18-%-Karte → 0,22) ----------
const E_mittag = 117168; // lx, tag-ref 74,2° (die Mess-Wiese)
const mittag = [
  { n: "Wiese Sonne", w: 0.55, L: diffus(GRAS, [{ E: E_mittag, T: 5500 }]) },
  { n: "Himmel", w: 0.35, L: strahler(5000, 12000), quelle: true },
  { n: "Schatten", w: 0.1, L: diffus(GRAS, [{ E: 15000, T: 12000 }]) },
];
let A0 = 1, KAPPA = 1; { let s = 0; for (const p of mittag) s += p.w * Math.log(Y(p.L)); const La = Math.exp(s); const Lk = (0.18 * E_mittag) / Math.PI; A0 = krawczyk(La); KAPPA = Lk / La;
  say(`EICHUNG Mittag: L_a ${r3(La)} cd/m² · a₀ ${A0.toFixed(3)} · Karte ${r3(Lk)} cd/m² → κ = L_Karte/L_a = ${KAPPA.toFixed(3)} (FOLGT; die Karte zeigt Neutral(0,22) = 0,18)`); }
{ const A = auge(mittag); say(`  Mittag k ${A.k.toExponential(3)} (Deckel ${A.kc.toExponential(2)}, Schlüssel ${A.kKey.toExponential(3)}) · Karte k·L = ${(A.k * 0.18 * E_mittag / Math.PI).toFixed(3)}`);
  for (const p of mittag) { const b = bild(p.L, A.k); say(`    ${p.n.padEnd(14)} L ${r3(Y(p.L))} → sRGB ${b.s8.join("/")} Luma ${b.luma8.toFixed(1)}`); } }

// ---------- Sichten ----------
const mondH = Math.sin((45 * Math.PI) / 180);
const MOND = { E: MOND_E * mondH, T: MOND_T };
function herd(fern) {
  const fl = [];
  const ringe = fern ? [[2, 0.01], [4, 0.02], [8, 0.04], [14, 0.08], [25, 0.15], [60, 0.3]] : [[0.8, 0.05], [1.2, 0.1], [2, 0.15], [3, 0.12], [5, 0.12], [8, 0.08], [14, 0.06], [30, 0.065]];
  for (const [r, w] of ringe) {
    const E = eHalm(FEUER.I, r, FEUER.h - 0.2);
    fl.push({ n: `Gras ${r} m`, w, r, Ef: E, L: diffus(GRAS, [{ E, T: FEUER.T }, MOND]) });
  }
  fl.push({ n: "Flamme", w: fern ? 0.0002 : 0.005, L: strahler(FEUER.L, FEUER.T), quelle: true });
  fl.push({ n: "Glutbett 1100 K", w: fern ? 0.0003 : 0.01, L: strahler(GLUT.L, GLUT.T), quelle: true });
  fl.push({ n: "Himmel (Mond)", w: fern ? 0.4 : 0.2, L: strahler(MONDHIMMEL_L, HIMMEL_T), quelle: true });
  return fl;
}
function lava() {
  const fl = [];
  for (const [s, w] of [[0.5, 0.05], [1, 0.05], [2, 0.06], [4, 0.08], [8, 0.08], [15, 0.06]]) {
    const E = LAVA.anteilRiss * eHalmScheibe(LAVA.Lriss, LAVA.r, s, 0.5) + (1 - LAVA.anteilRiss) * eHalmScheibe(LAVA.Lkruste, LAVA.r, s, 0.5);
    fl.push({ n: `Ufer ${s} m`, w, Ef: E, L: diffus(GRAS, [{ E, T: LAVA.T }, MOND]) });
  }
  // Baumlinie 20 m vom Rand, senkrechte Fläche zur Lava: E ≈ L·A·cos/d² grob (Scheibe als Punkt, cos 0,3)
  const Eb = (((LAVA.anteilRiss * LAVA.Lriss + (1 - LAVA.anteilRiss) * LAVA.Lkruste) * Math.PI * LAVA.r ** 2) * 0.3) / (27.5 ** 2);
  fl.push({ n: "Baumlinie 20 m", w: 0.1, Ef: Eb, L: diffus([0.06, 0.09, 0.04], [{ E: Eb, T: LAVA.T }, MOND]) });
  fl.push({ n: "Lava Riss", w: 0.35 * LAVA.anteilRiss, L: strahler(LAVA.Lriss, LAVA.T), quelle: true });
  fl.push({ n: "Lava Kruste", w: 0.35 * (1 - LAVA.anteilRiss), L: strahler(LAVA.Lkruste, LAVA.Tk), quelle: true });
  fl.push({ n: "Himmel", w: 0.17, L: strahler(MONDHIMMEL_L, HIMMEL_T), quelle: true });
  return fl;
}
function gasse() {
  const Ewl = (DOCHT.I * 0.37) / 1.16; // Wand 1 m unter dem Kopf, Arm 0,4 m
  const Ebo = DOCHT.I / (2.8 * 2.8); // Pflaster unter der Laterne
  const Ewm = MOND_E * 0.5; // Wand zum Mond (60° Einfall)
  const Ews = Math.PI * MONDHIMMEL_L * 0.25 + 0.5 * Ewm * 0.3; // Wand im Schatten: Himmel (Sichtfaktor 0,25) + Gegenwand (ρ 0,5, F 0,3)
  const Ebs = Math.PI * MONDHIMMEL_L * 0.3 + 0.5 * Ewm * 0.2;
  const HS = { T: HIMMEL_T };
  return [
    { n: "Wand unter Laterne", w: 0.05, L: diffus(PUTZ, [{ E: Ewl, T: DOCHT.T }, { E: Ews, T: MOND_T }]) },
    { n: "Wand zum Mond", w: 0.2, L: diffus(PUTZ, [{ E: Ewm, T: MOND_T }]) },
    { n: "Wand im Schatten", w: 0.3, L: diffus(PUTZ, [{ E: Ews, T: MOND_T }]) },
    { n: "Pflaster unter Laterne", w: 0.05, L: diffus(PFLASTER, [{ E: Ebo, T: DOCHT.T }, { E: Ebs, T: MOND_T }]) },
    { n: "Pflaster im Schatten", w: 0.15, L: diffus(PFLASTER, [{ E: Ebs, T: MOND_T }]) },
    { n: "Fenster (Docht-Stube)", w: 0.03, L: strahler(0.0318, DOCHT.T), quelle: true },
    { n: "Laternen-Glas", w: 0.003, L: strahler(DOCHT.Lglas, DOCHT.T), quelle: true },
    { n: "Laternen-Flamme", w: 0.0005, L: strahler(DOCHT.Lflamme, DOCHT.T), quelle: true },
    { n: "Himmel", w: 0.1165, L: strahler(MONDHIMMEL_L, HIMMEL_T), quelle: true },
  ];
}

function zeige(name, sicht) {
  const A = auge(sicht);
  say(`\n== ${name}: L_a ${r3(A.La)} cd/m² · a(L_a) ${A.a.toFixed(4)} · k_Schlüssel ${r3(A.kKey)} · k_Deckel ${r3(A.kc)} → k ${r3(A.k)} (${A.k === A.kc ? "DECKEL" : "Schlüssel"})`);
  say(`   Fleck                    | L (cd/m², Luma) | E Quelle (lx) | m Zapfen | sRGB        | Luma  | S HSV | H HSV | h Oklab phys→Bild`);
  const rows = [];
  for (const p of sicht) {
    const me = mesopisch(p.L); const b = bild(me.L, A.k); const phys = P.oklab(p.L);
    rows.push({ p, b, Ly: Y(p.L), m: me.m });
    say(`   ${p.n.padEnd(24)} | ${String(r3(Y(p.L))).padStart(15)} | ${p.Ef != null ? String(r3(p.Ef)).padStart(13) : "            —"} | ${me.m.toFixed(2).padStart(8)} | ${b.s8.join("/").padEnd(11)} | ${b.luma8.toFixed(1).padStart(5)} | ${b.S.toFixed(2).padStart(5)} | ${b.H.toFixed(0).padStart(5)} | ${phys.h.toFixed(0)}→${b.ok.h.toFixed(0)}`);
  }
  // (a) Ordnung: nach physikalischer Leuchtdichte sortiert, ist die Bild-Luma monoton?
  const s = rows.slice().sort((x, y) => x.Ly - y.Ly); let bruch = 0;
  for (let i = 1; i < s.length; i++) if (s[i].b.luma8 + 0.5 < s[i - 1].b.luma8) bruch++;
  // (b) Schulter: diffuse Flecke mit hellstem Kanal k·L über 0,76
  const ueber = rows.filter((x) => !x.p.quelle && Math.max(...x.p.L) * A.k > 0.7601).length;
  // (c) Farbton diffuser Flecke mit m > 0,5: Oklab-Farbton physikalisch ↔ Bild
  const dh = rows.filter((x) => !x.p.quelle && x.m > 0.5 && P.oklab(x.p.L).C > 0.02).map((x) => Math.abs(((P.oklab(x.p.L).h - x.b.ok.h + 540) % 360) - 180));
  say(`   (a) Ordnungsbrüche ${bruch} · (b) diffuse über der Schulter ${ueber} · (c) größte Farbton-Drift diffus (Oklab) ${dh.length ? Math.max(...dh).toFixed(1) + "°" : "—"}`);
  return { A, rows };
}
const hn = zeige("HERD NAH (3 m, Ego)", herd(false));
const hf = zeige("HERD FERN (25 m)", herd(true));
const lv = zeige("LAVA-UFER (3 m vom Rand)", lava());
const gs = zeige("GASSE (Docht-Laternen, 1320)", gasse());
say(`\n(d) Zustand je Sicht: k nah ${r3(hn.A.k)} · fern ${r3(hf.A.k)} (Verhältnis ${(hf.A.k / hn.A.k).toFixed(2)}) · Lava ${r3(lv.A.k)} · Gasse ${r3(gs.A.k)}`);

// ---------- ohne Deckel: was der Schlüssel allein täte ----------
for (const [n, s] of [["HERD NAH", herd(false)], ["LAVA", lava()]]) {
  const A = auge(s, false); const ue = s.filter((p) => !p.quelle && Math.max(...p.L) * A.k > 0.76);
  say(`ohne Deckel ${n}: k ${r3(A.kKey)} → diffuse über der Schulter ${ue.length}: ${ue.map((p) => { const b = bild(mesopisch(p.L).L, A.kKey); return `${p.n} ${b.s8.join("/")} H ${b.H.toFixed(0)}° S ${b.S.toFixed(2)}`; }).join(" · ")}`);
}
require("fs").writeFileSync(__dirname + "/quelle-sichten.out.txt", out.join("\n") + "\n");

// ---------- dieselben Sichten mit gehaltenem Farbton über der Schulter (nur Quellen erreichen sie) ----------
KURVE = P.neutralFarbton;
say(`\n=== KURVE MIT GEHALTENEM FARBTON (Khronos-Schulter, Entsättigung im Oklab-Farbton der Eingangsfarbe) ===`);
for (const [n, s] of [["HERD NAH", herd(false)], ["LAVA", lava()], ["GASSE", gasse()]]) {
  const A = auge(s);
  for (const p of s.filter((q) => q.quelle && Y(q.L) * A.k > 0.3)) {
    const a = bild(mesopisch(p.L).L, A.k, P.neutral), b = bild(mesopisch(p.L).L, A.k, P.neutralFarbton);
    say(`  ${n} ${p.n.padEnd(16)} k·L ${(Y(p.L) * A.k).toFixed(2).padStart(8)} · Neutral ${a.s8.join("/")} H ${a.H.toFixed(0)}° h ${a.ok.h.toFixed(0)} · Farbton-Halt ${b.s8.join("/")} H ${b.H.toFixed(0)}° h ${b.ok.h.toFixed(0)} (phys h ${P.oklab(p.L).h.toFixed(0)})`);
  }
}
// der Weg einer 2 000-K-Farbe über die Schulter (Gras im Feuer): k·L Luma 0,1 … 4
say(`\nGras im 2 000-K-Licht über die Schulter (Neutral ↔ Farbton-Halt):`);
const g2 = mul(GRAS, col(2000)), gy = Y(g2);
for (const t of [0.1, 0.2, 0.33, 0.5, 1, 2, 4]) { const c = g2.map((v) => (v / gy) * t); const a = P.srgb8(P.neutral(c)), b = P.srgb8(P.neutralFarbton(c));
  say(`  k·L Luma ${t}: Neutral ${a.join("/")} H ${P.hsv(a.map((v) => v / 255)).H.toFixed(0)}° S ${P.hsv(a.map((v) => v / 255)).S.toFixed(2)} · Halt ${b.join("/")} H ${P.hsv(b.map((v) => v / 255)).H.toFixed(0)}° S ${P.hsv(b.map((v) => v / 255)).S.toFixed(2)}`); }

// ---------- RUNDE 1: das q-Gesetz (welt-licht.js:120-124, AUGE p 0,2 q 0,42 welt 7,83 lux 115 000), Mondnacht A = 0,2988 lx ----------
const S = (lux) => 7.83 * Math.pow(Math.max(0, lux) / 115000, 0.2);
const zeig = (E, a) => { const A = Math.max(0.0873, a); return Math.min(S(A) * (Math.pow(1 + E / A, 0.42) - 1), (S(A + E) * E) / (A + E)); };
say(`\nRUNDE 1 (q-Gesetz, A 0,2988 lx): gezeigt ↔ physikalisch, Gras nah gegen Gras 14 m (Herd)`);
const En = hn.rows.find((x) => x.p.n === "Gras 0.8 m").p.Ef, Ef = hn.rows.find((x) => x.p.n === "Gras 14 m").p.Ef, Em = MOND.E;
say(`  E 0,8 m ${r3(En)} lx · 14 m ${r3(Ef)} lx · Mond ${r3(Em)} lx`);
say(`  physikalisch Feuer 0,8 m ÷ 14 m = ${r3(En / Ef)} (${Math.log2(En / Ef).toFixed(2)} Stufen); gezeigt ${r3(zeig(En, 0.2988) / zeig(Ef, 0.2988))} (${Math.log2(zeig(En, 0.2988) / zeig(Ef, 0.2988)).toFixed(2)} Stufen)`);
say(`  Feuer in 14 m gegen den Mond am selben Fleck: physikalisch ${r3(Ef / Em)} · gezeigt ${r3(zeig(Ef, 0.2988) / S(Em))} (Mond auf S: ${r3(S(Em))})`);
say(`  Feuer in 30 m gegen den Mond: physikalisch ${r3(0.158 / Em)} · gezeigt ${r3(zeig(0.158, 0.2988) / S(Em))}`);
say(`  der Mond selbst auf S: 0,28 lx → ${r3(S(Em))} Einheiten = ${r3((S(Em) / 7.83) * 115000)} lx am Tag-Maß (Faktor ${r3(((S(Em) / 7.83) * 115000) / Em)})`);
require("fs").writeFileSync(__dirname + "/quelle-sichten.out.txt", out.join("\n") + "\n");
