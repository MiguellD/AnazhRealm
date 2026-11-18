// Richter: die Zählung des Entscheids. Grundlage = Urteil des Entwurfs Quelle (quelle-zaehle.cjs, Objekt V wörtlich gelesen),
// mit den Abweichungen des Richters (UEBER). Ausgabe: je Status (GA/GB/G0/F/UL) → bleibt D · folgt F · fällt X · Absicht A · unberührt U.
const fs = require("fs");
const R = require("./tafel-daten.cjs");
const src = fs.readFileSync(__dirname + "/quelle-zaehle.cjs", "utf8");
const V = eval("(" + src.slice(src.indexOf("const V = {") + 10, src.indexOf("};", src.indexOf("const V = {")) + 1) + ")");
// Abweichungen des Richters (Grund je Zeile im entscheid.md §2):
const UEBER = {
  S10: "A", N20: "A", N33: "A",   // Gefühl/Aura: verlassen die Licht-Kette, bleiben als EINE Farbkorrektur nach der Kurve (Absicht, gesetzt)
  L24: "U",                        // FENSTER_SCHLAF ist Welt-Dynamik, kein Licht-Datum
  A19: "D", A21: "D", A27: "F",    // das Auge nimmt die Kompensation des Entwurfs Auge (Knoten in Leuchtdichte), nicht Krawczyk (richter-auge.cjs)
};
for (const k in UEBER) V[k] = UEBER[k];
const kette = (e) => !/[TK]/.test(e.fl) && !e.sek.startsWith("9");
const M = {}; const add = (st, o, c) => { M[st] = M[st] || { D: 0, F: 0, X: 0, A: 0, U: 0 }; M[st][o] += c; };
const gruppe = {};
for (const e of R) {
  if (!kette(e)) continue;
  const v = V[e.id]; const teil = typeof v === "string" ? { [v]: e.n } : v;
  for (const [o, c] of Object.entries(teil)) { add(e.st, o, c); const g = e.sek.split(" ")[0]; gruppe[g] = gruppe[g] || { D: 0, F: 0, X: 0, A: 0, U: 0 }; gruppe[g][o] += c; }
}
let tot = { D: 0, F: 0, X: 0, A: 0, U: 0 };
for (const st of Object.keys(M)) { console.log(st, JSON.stringify(M[st])); for (const o in tot) tot[o] += M[st][o]; }
console.log("Licht-Kette gesamt", JSON.stringify(tot), "Summe", Object.values(tot).reduce((a, b) => a + b));
const ges = ["GA", "GB", "G0"].map((s) => M[s]); const gs = ges.reduce((a, m) => a + Object.values(m).reduce((x, y) => x + y), 0);
const gx = ges.reduce((a, m) => a + m.X + m.F, 0), gd = ges.reduce((a, m) => a + m.D, 0), ga = ges.reduce((a, m) => a + m.A, 0), gu = ges.reduce((a, m) => a + m.U, 0);
console.log(`GESETZT (GA+GB+G0) in der Licht-Kette: ${gs} Felder → fallen/folgen ${gx} · bleiben Datum ${gd} · bleiben Absicht ${ga} · unberührt ${gu}`);
console.log(`UL (ohne Leser): ${JSON.stringify(M.UL)}`);
for (const g of Object.keys(gruppe).sort()) console.log("Gruppe", g, JSON.stringify(gruppe[g]));
// fallende Zeilen der Kette mit Def, für die main-Probe
const xs = R.filter((e) => kette(e)).filter((e) => { const v = V[e.id]; return v === "X" || (typeof v === "object" && v.X); });
fs.writeFileSync(__dirname + "/richter-fallend.json", JSON.stringify(xs.map((e) => ({ id: e.id, name: e.name, def: e.def, st: e.st, n: e.n, x: typeof V[e.id] === "string" ? e.n : V[e.id].X })), null, 1));
console.log("fallende Zeilen:", xs.length);
console.log("\nD-Zeilen ohne Anker (G0) bzw. GB in der Kette:");
for (const e of R) { if (!kette(e)) continue; const v = V[e.id]; const t = typeof v === "string" ? { [v]: e.n } : v; if (t.D && (e.st === "G0" || e.st === "GB")) console.log(`${e.id} ${e.st} D${t.D} ${e.name.slice(0, 60)} = ${String(e.wert).slice(0, 30)}`); }
