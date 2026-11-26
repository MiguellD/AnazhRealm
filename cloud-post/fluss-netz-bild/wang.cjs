"use strict";
// WANG: Anteil der Landfläche (Knoten der Ebene 0 über dem Meer), deren Lauf im Meer endet — über D km, Spur bis 3·D.
const path = require("path"), fs = require("fs");
const root = path.resolve(process.argv[2] || "."), D = +(process.argv[3] || 64000), n = +(process.argv[4] || 20);
const harness = require(path.join(root, "scripts/lib/asset-worker-harness.cjs"));
// die Sonde liest die Innereien des Netzes: der Kern-Text bekommt im Speicher EINE Export-Zeile (die Datei bleibt unberührt)
const kern = fs.readFileSync(path.join(root, "gelaende-core.js"), "utf8");
if (!kern.includes("netzZaehler: netzZaehler,")) throw new Error("wang: der Export netzZaehler fehlt im Kern");
const c = harness.kernAusText([fs.readFileSync(path.join(root, "vendor/simplex-noise.js"), "utf8"), kern.replace("netzZaehler: netzZaehler,", "netzZaehler: netzZaehler, __int: { netzFuer, knoten, knotenFluss, knotenHp },")]);
const G = c.__gelaendeCore, g0 = G.GRUND, I = G.__int;
const saaten = ["anazh-realm-seed", ...Array.from({ length: n - 1 }, (_, i) => "same-saat-" + i)];
let M = 0, Se = 0, R = 0, je = [];
for (const s of saaten) {
  const L = G.lageAus({ seed: s, baseHeight: g0.basis, waterLevel: g0.basis - g0.meerUnterBasis, ort: null, erbgut: { terme: G.erbgutNormal(undefined), wildnis: 1 }, regionSize: g0.kachel }, c.SimplexNoise);
  const N = I.netzFuer(L); const S0 = N.S[0]; const m = Math.ceil(D / 2 / S0);
  const ende = new Map();
  let mm = 0, ss = 0, rr = 0;
  for (let j = -m; j < m; j++) for (let i = -m; i < m; i++) {
    const kn = I.knoten(N, 0, i, j);
    if (I.knotenHp(N, kn) < N.wl) continue;
    const weg = []; let c2 = kn, e = "rand";
    for (let g = 0; g < 4000; g++) {
      if (ende.has(c2)) { e = ende.get(c2); break; }
      weg.push(c2);
      if (Math.abs(c2.i) > 3 * m || Math.abs(c2.j) > 3 * m) { e = "rand"; break; }
      const f = I.knotenFluss(N, c2);
      if (!f) { e = c2.senke === 2 ? "meer" : "see"; break; }
      c2 = f;
    }
    for (const w of weg) ende.set(w, e);
    if (e === "meer") mm++; else if (e === "see") ss++; else rr++;
  }
  M += mm; Se += ss; R += rr; je.push(mm / Math.max(1, mm + ss));
}
je.sort((a, b) => a - b);
console.log("Land-Knoten: meer", M, "see", Se, "rand", R, "Anteil ins Meer", (M / (M + Se)).toFixed(3), "je Saat p10/p50/p90", je[Math.floor(0.1 * je.length)].toFixed(2), je[Math.floor(0.5 * je.length)].toFixed(2), je[Math.floor(0.9 * je.length)].toFixed(2));
