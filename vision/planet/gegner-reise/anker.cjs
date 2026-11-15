// Gegner: Anker je Samen, Jahr 365 gegen 365,25, Ort-Saat als Planet-Samen, Bits, CPU, Heap
const path = require('path'); const W = process.argv[2];
require(path.join(W, 'gelaende-core.js')); const G = globalThis.__gelaendeCore;
const P = require(path.join(W, 'planet-core.js'));
const og = G.ortGesetz();
const bits = (x) => Buffer.from(new Float64Array([x]).buffer).toString('hex');
const g = (r) => (r * 180 / Math.PI).toFixed(3);
function anker(samen, jahr) {
  const t0 = process.cpuUsage(); const h0 = Date.now();
  const plan = P.planetPlan(samen, Object.assign({}, P.PLANET_ERDE, { jahrTage: jahr }));
  const A = P.planetAnker(plan, 0, Object.assign({}, og, { klimaHeute: Object.assign({}, og.klimaHeute, { jahrTage: jahr }) }));
  const c = process.cpuUsage(t0);
  return { A, cpu: (c.user + c.system) / 1000, plan };
}
const mode = process.argv[3] || 'alle';
if (mode === 'bits') {
  const a = anker('anazh-realm-seed', og.klimaHeute.jahrTage).A;
  console.log(P.VERSION, bits(a.breite) + bits(a.laenge) + bits(a.kuesteKm));
  process.exit(0);
}
console.log('VERSION', P.VERSION, 'jahr Tafel', og.klimaHeute.jahrTage, 'PLANET_ERDE.jahrTage', P.PLANET_ERDE.jahrTage, 'node', process.version);
// 1 Jahr 365 gegen 365,25
for (const s of ['anazh-realm-seed']) {
  const a = anker(s, 365).A, b = anker(s, 365.25).A;
  console.log('JAHR', s, '365:', g(a.breite), g(a.laenge), a.kuesteKm.toFixed(2), '| 365.25:', g(b.breite), g(b.laenge), b.kuesteKm.toFixed(2), 'gleich', bits(a.breite) === bits(b.breite) && bits(a.laenge) === bits(b.laenge));
}
// 2 unveraendertes PLANET_ERDE gegen die Tafel: R5 bricht?
try { const pl = P.planetPlan('anazh-realm-seed', P.PLANET_ERDE); P.planetAnker(pl, 0, og); console.log('R5 PLANET_ERDE roh: kein Bruch'); } catch (e) { console.log('R5 PLANET_ERDE roh:', e.message); }
// 3 Ort-Saat als Planet-Samen (Schnitt-3-Schluessel)
for (const s of ['anazh-realm-seed@17.09_61.93_0', 'anazh-realm-seed@79.07_0.56_0', 'anazh-realm-seed@5.00_-28.00_0']) {
  const r = anker(s, 365); console.log('ORTSAAT', s, '-> Anker', g(r.A.breite), g(r.A.laenge), 'Kueste', r.A.kuesteKm.toFixed(1), 'cpu', r.cpu.toFixed(0), 'ms');
}
// 4 zwoelf frische Saaten: Anker wirft? CPU
const frisch = Array.from({ length: 12 }, (_, i) => 'gegner-' + (Date.now() % 100000) + '-' + i);
let wirft = 0; const cpus = [];
for (const s of frisch) { try { const r = anker(s, 365); cpus.push(r.cpu); } catch (e) { wirft++; console.log('WIRFT', s, e.message); } }
cpus.sort((a, b) => a - b);
console.log('FRISCH 12: wirft', wirft, 'cpu ms min/med/max', cpus[0].toFixed(0), cpus[cpus.length >> 1].toFixed(0), cpus[cpus.length - 1].toFixed(0));
// 5 Heap: Plan + Scheibe gehalten
if (global.gc) { global.gc(); global.gc(); const h0 = process.memoryUsage().heapUsed; const keep = anker('anazh-realm-seed', 365); global.gc(); global.gc(); const h1 = process.memoryUsage().heapUsed; console.log('HEAP plan+memo gehalten', ((h1 - h0) / 1048576).toFixed(1), 'MB'); keep.plan = null; }
