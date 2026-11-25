// Node-Probe am Kern (main 0ee3ed8c): S1 der Gegenwart vorher (gerundete Linie) ↔ Kandidat (ortEisZeit), je Samen
const path = require("path"), K = path.join(__dirname, "../stationen-final-gewalt/kern");
const P = require(path.join(K, "planet-core.js")); require(path.join(K, "gelaende-core.js")); const G = globalThis.__gelaendeCore;
const R = Math.PI / 180;
for (const samen of process.argv.slice(2)) {
  const t0 = Date.now(), plan = P.planetPlan(samen, P.PLANET_ERDE), S0 = P.planetScheibe(plan, 0), G0 = P.planetKlimaGlobal(plan, 0);
  const gang = P.EIS_ZEITEN.map((t) => { const g = P.planetKlimaGlobal(plan, t); return [g.T0 - G0.T0, g.T2 - G0.T2]; });
  let wider = 0, rel = 0, vor = 0, neu = 0, ohneVor = 0, ohneNeu = 0;
  for (let b = 36; b <= 88; b += 2) for (let l = -180; l < 180; l += 4.5) for (const bb of [b, -b]) {
    const o = P.planetOrt(S0, bb * R, l * R, G.ortGesetz(), undefined, plan), pk = {};
    P.planetPunkt(S0, bb * R, l * R, 16, pk); if (!(pk.hoeheM > 0)) continue;
    const relikt = o.delta.eis.zeit >= 1;
    const Kk = P.planetKlima(S0, bb * R, l * R, -1, {}, pk), y = Math.sin(bb * R), p2 = 1.5 * y * y - 0.5;
    const tMin = Math.min(...gang.map(([d0, d2]) => Kk.tJahrC + d0 + d2 * p2));
    const eVor = tMin < P.KLIMA.tEisC, eNeu = P.ortEisZeit(plan, bb * R, Kk.tJahrC, 0) === 1;
    if (eVor !== eNeu) wider++; if (relikt) { rel++; if (eVor) vor++; else ohneVor++; if (eNeu) neu++; else ohneNeu++; }
  }
  console.log(JSON.stringify({ samen, relikte: rel, kandidat3: { ursacheProzent: Math.round(1000 * vor / rel) / 10, ohne: ohneVor }, widerspruch: wider, gesetzZeuge: { ursacheProzent: Math.round(1000 * neu / rel) / 10, ohne: ohneNeu }, ms: Date.now() - t0 }));
}
