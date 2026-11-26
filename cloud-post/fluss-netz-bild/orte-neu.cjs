"use strict";
// Die Wasser-Messorte am neuen Kern: Messung am alten Ort, dann Suche (Blick-Vektor gleich, Raster 2,5 m, ±R m) nach dem nächsten
// Ort, der die Kriterien des Orts hält. node orte-neu.cjs <root> [R]
const path = require("path");
const root = path.resolve(process.argv[2] || ".");
const R = +(process.argv[3] || 60);
const WO = require(path.join(root, "scripts/lib/welt-orte.cjs"));
const h = require(path.join(root, "spec/profiband/haushalt.json"));
const W = WO.wirtAmGesetz(root, true);
const grad = (t) => (Math.atan(t) * 180) / Math.PI;
for (const o of h.messorte.filter((o) => o.beleg)) {
  const bx = o.blick[0] - o.spieler[0], bz = o.blick[1] - o.spieler[1];
  const w = W.wasserUm(o.spieler[0], o.spieler[1], Math.hypot(bx, bz) + 64 + R);
  const sicht = WO.belegSichtAmGesetz(w);
  const alt = WO.belegMessen(w, o.spieler[0], o.spieler[1], o.blick, sicht);
  console.log(o.id, "ALT", JSON.stringify(alt), "Soll", JSON.stringify({ hoehe: o.beleg.hoehe, spiegel: o.beleg.spiegel, abstand: o.beleg.abstand }));
  const B = o.beleg;
  const kand = [];
  const ST = +(process.argv[4] || 2.5);
  for (let dz = -R; dz <= R; dz += ST)
    for (let dx = -R; dx <= R; dx += ST) {
      const x = o.spieler[0] + dx, z = o.spieler[1] + dz;
      const m = WO.belegMessen(w, x, z, [x + bx, z + bz], null);
      if (m.fehler) continue;
      const ueber = m.hoehe - m.spiegel;
      let ok;
      if (B.art === "ufer") ok = m.wasser === "fluss" && m.abstand >= 3 && m.abstand <= 8 && ueber >= 0.1 && ueber <= 0.5 && m.aesung >= B.aesungMin;
      else ok = m.wasser === "meer" && m.abstand >= 30 && m.abstand <= 120 && ueber >= 0.2 && ueber <= 0.8 && m.hang <= B.hangMax;
      if (!ok) continue;
      // die Neigung am Fuß (ufer ≤ 8°)
      const H = (px, pz) => w._voxelSurfaceY(px, pz);
      const n = grad(Math.hypot((H(x + 1, z) - H(x - 1, z)) / 2, (H(x, z + 1) - H(x, z - 1)) / 2));
      if (B.art === "ufer" && n > 8) continue;
      const d = Math.hypot(dx, dz);
      const kosten = B.art === "ufer" ? Math.abs(m.abstand - B.abstand) + 10 * Math.abs(ueber - (B.hoehe - B.spiegel)) + d / 10 : 10 * Math.abs(ueber - (B.hoehe - B.spiegel)) + Math.abs(m.abstand - B.abstand) / 10 + d / 20;
      kand.push({ x: +x.toFixed(1), z: +z.toFixed(1), d, m, n, kosten });
    }
  kand.sort((a, b) => a.kosten - b.kosten);
  let n = 0;
  for (const k of kand) {
    const im = sicht(k.x, k.z, [k.x + bx, k.z + bz]);
    if (im > 0) continue;
    console.log(o.id, "NEU", k.d.toFixed(1), "m vom alten:", JSON.stringify({ spieler: [k.x, k.z], blick: [+(k.x + bx).toFixed(1), +(k.z + bz).toFixed(1)], ...k.m, imBlick: im, neigung: +k.n.toFixed(1) }));
    if (++n >= (+process.env.TOPN || 3)) break;
  }
  if (!n) console.log(o.id, "kein Ort binnen", R, "m (Kandidaten ohne Sicht-Prüfung:", kand.length, ")");
}
