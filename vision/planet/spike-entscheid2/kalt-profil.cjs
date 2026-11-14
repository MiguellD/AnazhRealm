// kalt-profil.cjs — Probe des Entscheiders: woraus besteht planetScheibe kalt? Gepatchte KOPIE (Zähler + Uhr), der Kern bleibt unberührt.
// Dazu die Referenzfahrt: eine feste Rechen-Last (Hash + Wurzel), direkt vor und nach jeder Messung.
'use strict';
const fs = require('fs'), path = require('path');
const ORIG = 'C:/Users/micha/AnazhRealm-profiband/.claude/worktrees/w28-planet-kern/planet-core.js';
let src = fs.readFileSync(ORIG, 'utf8');
function ers(a, b) { const n = src.split(a).length - 1; if (n !== 1) throw new Error('Stelle passt ' + n + '-mal: ' + a.slice(0, 70)); src = src.replace(a, () => b); }
ers('  function hueleProben(plan, t) {\n    const M = memoVon(plan);\n    if (M.proben.has(t)) return M.proben.get(t);\n    const S = scheibeKern(plan, t, false), N = 4096, F = fib(N);',
    '  function hueleProben(plan, t) {\n    const M = memoVon(plan);\n    if (M.proben.has(t)) return M.proben.get(t);\n    const Z_ = globalThis.__Z; const t0_ = process.hrtime.bigint();\n    const S = scheibeKern(plan, t, false), N = (Z_.nRef && Z_.refTiefe > 0) ? Z_.nRef : 4096, F = fib(N); Z_.sk += Number(process.hrtime.bigint() - t0_) / 1e6; Z_.saetze++; Z_.punkte += N; Z_.zeiten.push(t + (Z_.refTiefe > 0 ? "r" : ""));');
ers("    const r = { a, bw, al, N };\n    if (M.proben.size > 48)", "    const r = { a, bw, al, N }; Z_.hp += Number(process.hrtime.bigint() - t0_) / 1e6;\n    if (M.proben.size > 48)");
// Bezugs-Stützen: nur die Stützen, die NICHT zugleich der Spiegel der Zeit sind, dürfen grob sein — hier zählt sigmaSelbst die Tiefe
ers('    const P = hueleProben(plan, tf); const s = meerLoesen(P.a, P.bw, P.N, plan.koerper.wasserKm, null);',
    '    globalThis.__Z.refTiefe++; const P = hueleProben(plan, tf); globalThis.__Z.refTiefe--; const s = meerLoesen(P.a, P.bw, P.N, plan.koerper.wasserKm, null);');
const ziel = path.join(__dirname, 'kern-profil.js'); fs.writeFileSync(ziel, src);
const P = require(ziel);
const ns = () => Number(process.hrtime.bigint());
function referenz() { // feste Last: 4·10⁶ Schritte Ganzzahl-Hash + Wurzel; Ergebnis wird benutzt (kein Wegoptimieren)
  const a = ns(); let h = 0x9e3779b9 | 0, s = 0;
  for (let i = 0; i < 4000000; i++) { h = Math.imul(h ^ (h >>> 15), 0x2c1b3c6d) + i | 0; s += Math.sqrt((h >>> 8) + 1); }
  if (!(s > 0)) throw new Error('referenz'); return (ns() - a) / 1e6;
}
const nRef = Number(process.argv[2] || 0);
const zeilen = [];
for (let lauf = 0; lauf < 2; lauf++) for (const [samen, t, vorwaerm] of [['erde-09', 0, null], ['erde-01', 0, null], ['erde-sprung-0', -137.3, 0], ['erde-sprung-1', -198.3, 0], ['erde-sprung-2', -259.3, 0]]) {
  const plan = P.planetPlan(samen + (lauf ? '' : ''), Object.assign({}, P.PLANET_ERDE));
  globalThis.__Z = { sk: 0, hp: 0, saetze: 0, punkte: 0, zeiten: [], refTiefe: 0, nRef };
  if (vorwaerm !== null) P.planetScheibe(plan, vorwaerm);
  globalThis.__Z = { sk: 0, hp: 0, saetze: 0, punkte: 0, zeiten: [], refTiefe: 0, nRef };
  const r0 = referenz(); const a = ns(); const S = P.planetScheibe(plan, t); const kalt = (ns() - a) / 1e6; const r1 = referenz();
  const Z = globalThis.__Z;
  zeilen.push({ lauf, samen, t, kaltMs: +kalt.toFixed(1), refMs: +(0.5 * (r0 + r1)).toFixed(1), refPaar: [+r0.toFixed(1), +r1.toFixed(1)], verhaeltnis: +(kalt / (0.5 * (r0 + r1))).toFixed(2),
    saetze: Z.saetze, punkte: Z.punkte, probenMs: +Z.hp.toFixed(1), davonScheibeKernMs: +Z.sk.toFixed(1), restMs: +(kalt - Z.hp).toFixed(1), jeHuellPunktUs: +((Z.hp - Z.sk) * 1000 / Z.punkte).toFixed(2),
    meerKm: +S.meerKm.toFixed(4), sigmaKm: +S.sigmaKm.toFixed(4), refKm: +S.refKm.toFixed(4), land: +S.landAnteil.toFixed(4), zeiten: Z.zeiten.join(' ') });
}
for (const z of zeilen) console.log(JSON.stringify(z));
