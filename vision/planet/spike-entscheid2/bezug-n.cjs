// bezug-n.cjs — Probe des Entscheiders: der Bezugs-Spiegel (100-Ma-Mittel, 20-Ma-Stützen) liest N_ref Hüll-Proben je Stütze aus EIGENEM Memo,
// der Spiegel der Zeit bleibt bei 4 096. Gemessen: Kalt-Zeit ABAB gegen heute im selben Prozess, Δ Bezug / Δ Meer / Δ Land. Gepatchte KOPIE.
'use strict';
const fs = require('fs'), path = require('path');
const ORIG = 'C:/Users/micha/AnazhRealm-profiband/.claude/worktrees/w28-planet-kern/planet-core.js';
function bau(nRef) {
  let src = fs.readFileSync(ORIG, 'utf8');
  const ers = (a, b) => { const n = src.split(a).length - 1; if (n !== 1) throw new Error('Stelle passt ' + n + '-mal: ' + a.slice(0, 70)); src = src.replace(a, () => b); };
  if (nRef) {
    ers('  function hueleProben(plan, t) {\n    const M = memoVon(plan);\n    if (M.proben.has(t)) return M.proben.get(t);\n    const S = scheibeKern(plan, t, false), N = 4096, F = fib(N);',
        '  function hueleProben(plan, t, nIn) {\n    const M = memoVon(plan), N = nIn || 4096, key_ = t + "|" + N;\n    if (M.proben.has(key_)) return M.proben.get(key_);\n    const S = scheibeKern(plan, t, false), F = fib(N);');
    ers('    M.proben.set(t, r); return r;', '    M.proben.set(key_, r); return r;');
    ers('    const P = hueleProben(plan, tf); const s = meerLoesen(P.a, P.bw, P.N, plan.koerper.wasserKm, null);', '    const P = hueleProben(plan, tf, ' + nRef + '); const s = meerLoesen(P.a, P.bw, P.N, plan.koerper.wasserKm, null);');
  }
  const ziel = path.join(__dirname, 'kern-bezug-' + (nRef || 'heute') + '.js'); fs.writeFileSync(ziel, src);
  delete globalThis.__planetCore; return require(ziel);
}
const ns = () => Number(process.hrtime.bigint());
const VAR = [0, 2048, 1024, 512], K = VAR.map(bau);
const med = (a) => { const b = [...a].sort((x, y) => x - y); return b[b.length >> 1]; };
const zeit = VAR.map(() => []), dRef = VAR.map(() => []), dMeer = VAR.map(() => []), dLand = VAR.map(() => []);
const SAATEN = Array.from({ length: 12 }, (_, i) => 'erde-' + String(i + 1).padStart(2, '0'));
for (const t of [0, -100]) for (const samen of SAATEN) {
  const basis = {};
  for (let v = 0; v < VAR.length; v++) {
    const P = K[v], plan = P.planetPlan(samen, Object.assign({}, P.PLANET_ERDE));
    const a = ns(); const S = P.planetScheibe(plan, t); zeit[v].push((ns() - a) / 1e6);
    if (v === 0) { basis.ref = S.refKm; basis.meer = S.meerKm; basis.land = S.landAnteil; }
    else { dRef[v].push(Math.abs(S.refKm - basis.ref) * 1000); dMeer[v].push(Math.abs(S.meerKm - basis.meer) * 1000); dLand[v].push(Math.abs(S.landAnteil - basis.land) * 100); }
  }
}
for (let v = 0; v < VAR.length; v++) console.log(JSON.stringify({ nRef: VAR[v] || 4096, kaltMsMedian: +med(zeit[v]).toFixed(0), verhaeltnisZuHeute: +(med(zeit[v].map((z, i) => z / zeit[0][i]))).toFixed(3),
  dBezugM: v ? { median: +med(dRef[v]).toFixed(1), max: +Math.max(...dRef[v]).toFixed(1) } : 0, dMeerM: v ? { median: +med(dMeer[v]).toFixed(1), max: +Math.max(...dMeer[v]).toFixed(1) } : 0,
  dLandProzentpunkte: v ? { median: +med(dLand[v]).toFixed(2), max: +Math.max(...dLand[v]).toFixed(2) } : 0, n: zeit[v].length }));
