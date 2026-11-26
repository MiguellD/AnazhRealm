// node zeuge.js [x z] → Code: die Stelle mit den meisten Zeugen (oder x z), dann EIN Schlag des Spielers wie die TAT — mit Uhren
// je Ruf von _bewohnerZeuge · _bewohnerWeichOrt · _bewohnerStrecke · _bewohnerNahen (die Welt danach wieder, wie sie war: Tier fort)
const [x, z] = process.argv.slice(2);
process.stdout.write(`
const st = r.state, A = r.constructor, ZM = A.BEWOHNER.zeugeM;
const draussen = [];
for (const S of (r._bewohnerSiedlungen || new Map()).values()) for (const b of S.liste || []) if (b.leib && !b.drinnen) draussen.push({ b, S });
let ort = ${x !== undefined ? `{ x: ${x}, z: ${z} }` : "null"};
if (!ort) { let best = -1; for (const q of draussen) { const n = draussen.filter((w) => Math.hypot(w.b.leib.position.x - q.b.leib.position.x, w.b.leib.position.z - q.b.leib.position.z) < ZM - 2).length; if (n > best) { best = n; ort = { x: q.b.leib.position.x - 1.2, z: q.b.leib.position.z - 0.9 }; } } }
const [fx, fz] = [ort.x + 1.2, ort.z + 0.9];
const zeugen = draussen.filter((q) => Math.hypot(q.b.leib.position.x - fx, q.b.leib.position.z - fz) < ZM);
const P = Object.getPrototypeOf(r);
const uhr = {}; const alt = {};
for (const k of ["_bewohnerZeuge", "_bewohnerWeichOrt", "_bewohnerStrecke", "_bewohnerNahen", "_bewohnerWeichen", "_creatureRemember"]) {
  const f = r[k]; if (typeof f !== "function") continue; alt[k] = Object.prototype.hasOwnProperty.call(r, k) ? f : null; uhr[k] = { n: 0, ms: 0, max: 0 };
  r[k] = function (...a) { const t = performance.now(); try { return f.apply(this, a); } finally { const d = performance.now() - t; uhr[k].n++; uhr[k].ms += d; uhr[k].max = Math.max(uhr[k].max, d); } };
}
const zaehl = (S) => S ? S.liste.length : 0;
let tier = null, schlag = null, ms = {};
try {
  let t = performance.now();
  tier = r.spawnCreatureAt(fx, r.getTerrainHeightAt(fx, fz), fz, "happy", "fuchs", { bodySize: 1, precise: true });
  ms.spawn = +(performance.now() - t).toFixed(1);
  t = performance.now();
  schlag = r.damageCreature(tier, 0.001, { source: "player" });
  ms.schlag = +(performance.now() - t).toFixed(1);
} finally {
  for (const [k, f] of Object.entries(alt)) { if (f) r[k] = f; else delete r[k]; }
  if (tier && r.removeCreature) try { r.removeCreature(tier); } catch {}
}
const o = {}; for (const [k, v] of Object.entries(uhr)) if (v.n) o[k] = { n: v.n, ms: +v.ms.toFixed(1), max: +v.max.toFixed(1) };
const S0 = zeugen[0] && zeugen[0].S;
return { ort: [+fx.toFixed(1), +fz.toFixed(1)], zeugeM: ZM, zeugen: zeugen.length, waffe: zeugen.filter((q) => q.b.waffe).length, siedlung: S0 ? S0.key : null, bewohnerDerSiedlung: zaehl(S0), staende: A.BEWOHNER.staende, schlagOk: !!(schlag && schlag.ok), ms, uhr: o };
`);
