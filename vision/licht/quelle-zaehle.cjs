// Urteil des Entwurfs „von der Quelle her“ je Zeile der Tafel: D bleibt als Datum · F folgt · X fällt · U unberührt (Technik,
// Kosmetik, Stoff-Look, Form, Welt-Dynamik, eigene Studio-Bühne — liegt außerhalb der photometrischen Kette).
// Ein Objekt teilt die Felder einer Zeile ({X: 2, D: 1}). Summe je Zeile muss n sein.
const R = require("./tafel-daten.cjs");
const V = {
  S1: "X", S2: "X", S3: "F", S4: "F", S5: "X", S6: "D", S7: "D", S8: "X", S9: "U", S10: "X", S11: "X", S12: "X", S13: "D", S14: "D", S15: "D",
  S16: "X", S17: "D", S18: "D", S19: "D", S20: "D", S21: "D", S22: "D", S23: "D", S24: "D", S25: "F", S26: "F", S27: "U", S28: "D", S29: "F",
  S30: "D", S31: "D", S32: "D", S33: "U", S34: "U", S35: "X", S36: "U", S37: "U", S38: "U", S39: "D", S40: { X: 3, D: 1 },
  N1: "X", N2: "F", N3: "X", N4: "X", N5: "X", N6: "X", N7: "X", N8: "D", N9: "D", N10: "F", N11: "F", N12: "X", N13: "X", N14: "X", N15: "X",
  N16: "X", N17: "X", N18: "X", N19: "X", N20: "X", N21: "X", N22: "X", N23: "X", N24: "X", N25: "X", N26: "D", N27: "U", N28: "X", N29: "X",
  N30: "D", N31: { X: 1, U: 1 }, N32: "D", N33: "X",
  A1: "X", A2: "X", A3: "X", A4: "X", A5: "X", A6: "X", A7: "X", A8: "D", A9: "X", A10: "X", A11: "X", A12: "D", A13: "X", A14: "D", A15: "D",
  A16: "D", A17: "F", A18: "X", A19: "X", A20: "X", A21: "X", A27: "X", A22: "X", A23: "U", A24: "X", A25: "U", A26: "U", A28: "F", A29: "F",
  R1: { D: 2, U: 2 }, R2: "X", R3: "F", R4: "U", R5: "X", R6: { D: 1, X: 3 }, R7: "D", R8: "U", R9: "U",
  Q1: "D", Q2: "X", Q3: "X", Q4: "D", Q5: "D", Q6: "D", Q7: "X", Q8: "X", Q9: "D", Q10: "D", Q11: "D", Q12: "X", Q13: "X", Q14: "F", Q15: "U",
  Q16: "U", Q17: "X", Q18: "X", Q19: "X", Q20: "X", Q21: "D", Q22: "U", Q23: "F", Q24: "D", Q25: "U", Q26: "D", Q27: { D: 1, X: 1 }, Q28: "U",
  Q29: "X", Q30: "F",
  L1: "D", L2: "D", L3: "D", L4: "D", L5: "U", L6: "X", L7: "F", L8: "X", L9: "X", L10: "X", L11: "D", L12: "X", L13: "X", L14: "D", L15: "X",
  L16: "X", L17: "D", L18: "F", L19: "F", L20: "F", L21: "F", L22: "U", L23: "U", L24: "U", L25: "D", L26: "U", L27: "F", L28: "D",
  L29: { X: 3, D: 3 }, L30: "X", L31: { X: 1, F: 1 },
  E1: { X: 6, D: 6 }, E2: "X", E3: "X", E4: "X", E5: "U", E6: "U", E7: "D", E8: "D", E9: "F", E10: "F", E11: "X", E12: "D", E13: "U", E14: "U",
  E15: "D", E16: "D", E17: "X", E18: "U", E19: "F", E20: "X", E21: { X: 1, D: 1, U: 1 }, E22: "X", E23: { X: 1, U: 11 }, E24: "D", E25: "U",
  V1: "U", V2: "U", V3: "U", V4: "U", V5: "U", V6: "X", V7: "U", V8: "U", V9: "U", V10: "U", V11: "U", V12: "U", V13: "U",
  X1: "U", X2: "X", X3: "F", X4: "U", X5: "U", X6: "U", X7: "U", X8: "F", X9: "U", X10: "U", X11: "F",
};
const n = { D: 0, F: 0, X: 0, U: 0 }, z = { D: 0, F: 0, X: 0, U: 0 }, vorher = { D: 0, F: 0, X: 0, U: 0 };
const kette = { D: 0, F: 0, X: 0, U: 0 };
const fehlt = [];
const xs = [];
for (const e of R) {
  const v = V[e.id]; if (!v) { fehlt.push(e.id); continue; }
  const teil = typeof v === "string" ? { [v]: e.n } : v;
  const s = Object.values(teil).reduce((a, b) => a + b, 0); if (s !== e.n) throw new Error(`${e.id}: Summe ${s} ≠ n ${e.n}`);
  for (const [k, c] of Object.entries(teil)) { n[k] += c; if (!/[TK]/.test(e.fl) && !e.sek.startsWith("9")) kette[k] += c; }
  const haupt = typeof v === "string" ? v : Object.entries(v).sort((a, b) => b[1] - a[1])[0][0]; z[haupt]++;
  if (teil.X) xs.push(`${e.id} ${teil.X}`);
}
if (fehlt.length) throw new Error("ohne Urteil: " + fehlt.join(" "));
const alle = R.reduce((a, e) => a + e.n, 0);
console.log(`Tafel: ${R.length} Zeilen · ${alle} Felder`);
console.log(`Felder: bleibt Datum ${n.D} · folgt ${n.F} · fällt ${n.X} · unberührt ${n.U}`);
console.log(`Licht-Kette (ohne Technik/Kosmetik/Studios, ${Object.values(kette).reduce((a, b) => a + b)} Felder): bleibt ${kette.D} · folgt ${kette.F} · fällt ${kette.X} · unberührt ${kette.U}`);
console.log(`Zeilen (Mehrheit): bleibt ${z.D} · folgt ${z.F} · fällt ${z.X} · unberührt ${z.U}`);
// G0-Felder (gesetzt ohne Anker) der Licht-Kette: wie viele fallen?
let g0 = 0, g0x = 0, gb = 0, gbx = 0;
for (const e of R) { if (/[TK]/.test(e.fl) || e.sek.startsWith("9")) continue; const v = V[e.id]; const teil = typeof v === "string" ? { [v]: e.n } : v;
  if (e.st === "G0") { g0 += e.n; g0x += teil.X || 0; } if (e.st === "GB") { gb += e.n; gbx += teil.X || 0; } }
console.log(`Licht-Kette G0: ${g0x} von ${g0} Feldern fallen · GB (Bild-Anker): ${gbx} von ${gb}`);
console.log(`fallende Zeilen: ${xs.join(" · ")}`);
