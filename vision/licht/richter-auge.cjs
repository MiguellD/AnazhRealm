const Q = require("./quelle-physik.cjs");
const dec = (e) => (e <= 0.04045 ? e / 12.92 : ((e + 0.055) / 1.055) ** 2.4);
// (c) Toleranz aus der 8-Bit-Stufe: größte Oklab-Farbton-Änderung bei ±1 Code je Kanal
const tol = (s) => { const h0 = Q.oklab(s.map((v) => dec(v / 255))).h; let m = 0;
  for (let i = 0; i < 27; i++) { const d = [Math.floor(i / 9) - 1, Math.floor(i / 3) % 3 - 1, (i % 3) - 1]; const t = s.map((v, j) => Math.min(255, Math.max(0, v + d[j])));
    let x = Math.abs(Q.oklab(t.map((v) => dec(v / 255))).h - h0) % 360; x = Math.min(x, 360 - x); m = Math.max(m, x); } return m; };
for (const s of [[91, 55, 0], [152, 95, 0], [208, 132, 0], [226, 144, 0], [108, 57, 24], [56, 46, 36], [249, 165, 117], [253, 194, 177], [254, 243, 236], [21, 18, 15]]) console.log(`Toleranz ±1 Code ${s.join("/")}: ${tol(s).toFixed(2)}°`);
// Krawczyk gegen den Fahrplan von main: Stufen der Karte (log2 k·L_Karte / 0,22)
const a = (L) => 1.03 - 2 / (2 + Math.log10(L + 1)), kap = 1.743, a0 = a(3850);
const stufe = (Lkarte) => { const La = Lkarte / kap; const D = 0.18 * a(La) / a0; const v = Q.neutralGrauUmkehr(D); return Math.log2(v / 0.22); };
for (const [n, E, main] of [["Mittag 74°", 117168, 0], ["10°", 11080, -0.87], ["0°", 760, -1.303], ["-6°", 3.01, -1.563], ["Vollmond", 0.3965, -2.17]]) { const Lk = 0.18 * E / Math.PI; console.log(`${n}: L_Karte ${Lk.toPrecision(4)} cd/m² · Krawczyk ${stufe(Lk).toFixed(2)} EV · main-Fahrplan ${main} EV · Δ ${(stufe(Lk) - main).toFixed(2)}`); }
// Reichweite aus der ersten sichtbaren Stufe (Entwurf Quelle): r = sqrt(k·I·ρmax/(π·v1))
const v1 = 0.00697; for (const [n, I, k] of [["Docht, Gasse k 2,26", 1, 2.26], ["Glühstrumpf, Gasse", 100, 2.26], ["Herd, nah k 0,0411", 249, 0.0411], ["Herd, fern k 0,261", 249, 0.261]]) console.log(`Reichweite ${n}: ${Math.sqrt(k * I * 0.5 / (Math.PI * v1)).toFixed(1)} m (ρmax 0,5)`);
