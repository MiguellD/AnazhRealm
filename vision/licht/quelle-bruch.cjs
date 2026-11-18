// Zusatz-Rechnungen: Fenster der Kurve, Spanne am Herd, Runde 2 (Knie/Wäsche) unter dem mesopischen Auge, Reichweite aus k, Sättigung des Feuer-Grases
const P = require("./quelle-physik.cjs"); const out = []; const say = (s) => { out.push(s); console.log(s); };
const lin1 = ((1 / 255 + 0.055) / 1.055) ** 2.4; const v1 = Math.sqrt(((1/255)/12.92) / 6.25);
say(`Fenster der Neutral-Kurve für ein Grau: Schulter 0,76 bis sRGB 1/255 (linear ${(1/255/12.92).toExponential(2)}, Fuß 6,25·v² → v ${v1.toFixed(5)}): ${Math.log2(0.76 / v1).toFixed(2)} Stufen`);
const g = [0.1003, 0.1385, 0.0449]; const c = P.planckFarbe(2000); const gc = g.map((x, i) => x * c[i]);
say(`Feuer-Gras (2000 K × ATMO_BODEN): hellster Kanal / Luma = ${(Math.max(...gc) / P.luma(gc)).toFixed(3)} → Schulter-Beginn bei k·L(Luma) = ${(0.76 / (Math.max(...gc) / P.luma(gc))).toFixed(3)}`);
for (const t of [0.05, 0.15, 0.3]) { const s = P.srgb8(P.neutral(gc.map((x) => (x / P.luma(gc)) * t))); say(`  k·L ${t}: sRGB ${s.join("/")} S_HSV ${P.hsv(s.map((x) => x / 255)).S.toFixed(3)} (physikalische Sättigung unter der Schulter — das Tor 0,75 folgt NICHT)`); }
say(`Herd nah: Gras 0,8 m 8,81 cd/m² · Mondwiese 30 m 0,017 → ${Math.log2(8.81 / 0.017).toFixed(2)} Stufen Luma; dazu Kanal-Faktor ${Math.log2(Math.max(...gc) / P.luma(gc)).toFixed(2)} Stufen über der Luma`);
// Runde 2: Glühstrumpf 100 cd, Mond 0,28 lx waagrecht, Gras ρ; mesopischer Zapfen-Anteil am Fleck
const mond = 0.3965 * Math.sin(Math.PI / 4), rho = P.luma(g);
for (const [n, I] of [["Glühstrumpf", 100], ["Docht", 1]]) for (const d of [3, 8, 20, 46]) {
  const E = I / (d * d + 3.6 * 3.6) * (3.6 / Math.sqrt(d * d + 3.6 * 3.6)); const L = (rho * (E + mond)) / Math.PI;
  const m = Math.max(0, Math.min(1, Math.log(Math.max(L, 0.005) / 0.005) / Math.log(1000)));
  say(`Runde 2 · ${n} ${I} cd in ${d} m (Kopf 3,6 m): E ${E.toExponential(2)} lx = ${(E / mond * 100).toFixed(1)} % des Mondes · L ${L.toExponential(2)} cd/m² · Zapfen-Anteil ${m.toFixed(2)} → Farbe der Laterne am Fleck ≈ ${((E / (E + mond)) * m * 100).toFixed(1)} %`);
}
// Reichweite aus k: wo ρ_max/π·E·k unter die sichtbare Stufe (v1) fällt, ρ_max 0,6
for (const [n, I, k] of [["Feuer 250 cd, Mittag", 250, 3.28e-5], ["Feuer 250 cd, Herd nah", 250, 0.0411], ["Feuer 250 cd, Herd fern", 250, 0.261], ["Docht 1 cd, Gasse", 1, 2.26], ["Glühstrumpf 100 cd, Gasse", 100, 2.26]])
  say(`Reichweite ${n} (k ${k}): R = √(k·I·0,6/(π·v₁)) = ${Math.sqrt((k * I * 0.6) / (Math.PI * v1)).toFixed(2)} m`);
require("fs").writeFileSync(__dirname + "/quelle-bruch.out.txt", out.join("\n") + "\n");
