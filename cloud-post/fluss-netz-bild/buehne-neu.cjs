"use strict";
// Die Bühnen des Küsten-Selbsttests (S20c) am neuen Kern: die Mündung (der Täter-Wirt ohne Kacheln liest Meer, die Welt einen
// Fluss am Ort) und der Wald am Watt (Küsten-Kriterien, Kronen in der Ego-Sicht). node buehne-neu.cjs <root> [R] [ST]
const path = require("path");
const root = path.resolve(process.argv[2] || ".");
const R = +(process.argv[3] || 300), ST = +(process.argv[4] || 5);
const WO = require(path.join(root, "scripts/lib/welt-orte.cjs"));
const W = WO.wirtAmGesetz(root, true);
const T = WO.wirtAmGesetz(root, true);
T.wasserUm = () => T;
const was = process.env.NUR || "beide";
if (was !== "wald") {
  const o = [1191.1, 9928.8], b = [1480.9 - 1191.1, 10006.4 - 9928.8];
  const w = W.wasserUm(o[0], o[1], R + Math.hypot(...b) + 64);
  const kand = [];
  for (let dz = -R; dz <= R; dz += ST)
    for (let dx = -R; dx <= R; dx += ST) {
      const x = o[0] + dx, z = o[1] + dz;
      if (!w._nassAt(x, z)) continue;
      const m = WO.belegMessen(w, x, z, [x + b[0], z + b[1]], null);
      if (m.fehler || m.wasser !== "fluss" || m.abstand !== 0) continue;
      const t = WO.belegMessen(T, x, z, [x + b[0], z + b[1]], null);
      if (t.fehler || t.wasser !== "meer") continue;
      kand.push({ x: +x.toFixed(1), z: +z.toFixed(1), d: Math.hypot(dx, dz), m, t });
    }
  kand.sort((a, c) => (c.t.abstand >= 30) - (a.t.abstand >= 30) || a.d - c.d);
  console.log("MUENDUNG Kandidaten", kand.length);
  for (const k of kand.slice(0, 5)) console.log("MUENDUNG", k.d.toFixed(1), JSON.stringify({ spieler: [k.x, k.z], blick: [+(k.x + b[0]).toFixed(1), +(k.z + b[1]).toFixed(1)], welt: k.m, taeter: k.t }));
}
if (was !== "muendung") {
  // seit der Gezeit (main 5551bf64) wächst der Wald erst über dem höchsten Hochwasser: WALD_ORT/WALD_UEBER/WALD_ABSTAND weiten
  // Mitte, Höhe über dem Meer und Abstand (main rückte die Bühne an den Saum über dem Watt, 2,83 m über dem Meer in 202 m)
  const o = (process.env.WALD_ORT || "859.3,10430.3").split(",").map(Number), b = [1141 - 859.3, 10480 - 10430.3];
  const [uMin, uMax] = (process.env.WALD_UEBER || "0.2,0.8").split(",").map(Number);
  const aMax = +(process.env.WALD_ABSTAND || 120);
  const w = W.wasserUm(o[0], o[1], R + Math.hypot(...b) + 64);
  const sicht = WO.belegSichtAmGesetz(w);
  const kand = [];
  for (let dz = -R; dz <= R; dz += ST)
    for (let dx = -R; dx <= R; dx += ST) {
      const x = o[0] + dx, z = o[1] + dz;
      const m = WO.belegMessen(w, x, z, [x + b[0], z + b[1]], null);
      if (m.fehler || m.wasser !== "meer") continue;
      const ueber = m.hoehe - m.spiegel;
      if (!(m.abstand >= 30 && m.abstand <= aMax && ueber >= uMin && ueber <= uMax && m.hang <= 2)) continue;
      kand.push({ x: +x.toFixed(1), z: +z.toFixed(1), d: Math.hypot(dx, dz), m });
    }
  kand.sort((a, c) => a.d - c.d);
  console.log("WALD Kandidaten (Küsten-Kriterien)", kand.length);
  let n = 0;
  for (const k of kand) {
    const im = sicht(k.x, k.z, [k.x + b[0], k.z + b[1]]);
    if (!(im >= 3)) continue;
    console.log("WALD", k.d.toFixed(1), JSON.stringify({ spieler: [k.x, k.z], blick: [+(k.x + b[0]).toFixed(1), +(k.z + b[1]).toFixed(1)], ...k.m, imBlick: im }));
    if (++n >= 4) break;
  }
}
