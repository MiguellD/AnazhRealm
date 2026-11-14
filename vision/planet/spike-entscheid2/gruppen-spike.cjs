// gruppen-spike.cjs — Probe des Entscheiders zu G1.1: EINE Funktion für Anfang UND Neuschnitt (gepatchte KOPIE, der Kern bleibt).
//   gruppenGroessen(zyklus): Ziel-Größen aus bevorzugtem Anlagern über die Zahl, höchstens 19 − nO Gruppen, die größte ≤ SP_DOM·nS.
//   Anfang: zusammenhängend nach diesen Größen. Neuschnitt: die Größen längs der Kontakt-Kanten füllen, alte Gruppen-Kanten zuerst.
// Aufruf: node gruppen-spike.cjs <name> <teile mit +> [bild.png]     Umgebung: SP_CAP, SP_NEU, SP_DOM, LAPPEN_A, BECKEN_C, SAATEN
'use strict';
const fs = require('fs'), path = require('path');
const SP = 'C:/Users/micha/AnazhRealm-profiband/artifacts/profiband/auge/planet-kern/welle2/spike';
const L = require(SP + '/lib.cjs');
const argvAlt = process.argv; process.argv = argvAlt.slice(0, 2); const { PATCHES } = require(SP + '/patch.cjs'); process.argv = argvAlt;
PATCHES.gruppen = [
  ['    for (let s = 0; s < nS; s++) { const u = Z(20, s, 0); raw[s] = 0.35 + u * u * 1.6; sumRaw += raw[s]; }',
   `    for (let s = 0; s < nS; s++) { const u = Z(20, s, 0), v = 1 - 0.999 * u, r4 = Math.sqrt(Math.sqrt(v)); raw[s] = Math.min(SP_CAP, 1 / (r4 * r4 * r4)); sumRaw += raw[s]; }
    function gruppenGroessen(zy) {
      const gr = [], gmax = 19 - nO, dom = Math.max(2, Math.floor(SP_DOM * nS));
      for (let s = 0; s < nS; s++) {
        if (gr.length === 0 || (gr.length < gmax && Z(25, zy * 64 + s, 1) < SP_NEU)) { gr.push(1); continue; }
        let u = Z(25, zy * 64 + s, 2) * s, g = 0; while (g < gr.length - 1 && u >= gr[g]) { u -= gr[g]; g++; }
        if (gr[g] >= dom) { g = 0; for (let i = 1; i < gr.length; i++) if (gr[i] < gr[g]) g = i; }
        gr[g]++;
      }
      return gr.sort((x, y) => y - x);
    }`],
  ['    { let s = 0, g = 0; while (s < nS) { let n = 2 + Math.floor(Z(25, g, 0) * 5); if (nS - s - n === 1) n++; if (s + n > nS) n = nS - s; for (let i = 0; i < n; i++) gruppeAkt[s + i] = g; s += n; g++; } }',
   '    { const gr = gruppenGroessen(0); let s = 0; for (let g = 0; g < gr.length; g++) for (let i = 0; i < gr[g]; i++) gruppeAkt[s++] = g; }'],
  ['      kanten.sort((x, y) => (y[2] - x[2]) || (x[3] - y[3]));',
   `      kanten.sort((x, y) => (y[2] - x[2]) || (x[3] - y[3]));
      {
        const ziel = gruppenGroessen(b + 1), nb = []; for (let s = 0; s < nS; s++) nb.push([]);
        for (const [a, c] of kanten) { nb[a].push(c); nb[c].push(a); }
        const neu = new Int32Array(nS).fill(-1); let gi = 0;
        for (; gi < ziel.length; gi++) {
          let keim = -1, kb = -1;
          for (let s = 0; s < nS; s++) { if (neu[s] >= 0) continue; let fr = 0; for (const o of nb[s]) if (neu[o] < 0) fr++; const w = fr + Z(82, b, s); if (w > kb) { kb = w; keim = s; } }
          if (keim < 0) break;
          neu[keim] = gi; let n = 1; const rand = [keim];
          while (n < ziel[gi] && rand.length) {
            let best = -1, bw = -1;
            for (let ri = 0; ri < rand.length; ri++) for (const o of nb[rand[ri]]) { if (neu[o] >= 0) continue; const w = (gruppeAkt[o] === gruppeAkt[rand[ri]] ? 2 : 0) + Z(83, b, o * 64 + rand[ri]); if (w > bw) { bw = w; best = o; } }
            if (best < 0) break;
            neu[best] = gi; rand.push(best); n++;
          }
        }
        for (let s = 0; s < nS; s++) if (neu[s] < 0) { let g = -1; for (const o of nb[s]) if (neu[o] >= 0) { g = neu[o]; break; } neu[s] = g >= 0 ? g : gi++; }
        for (let s = 0; s < nS; s++) gruppeAkt[s] = neu[s];
        return;
      }`],
  ['  const MAX_P = 64', '  const SP_CAP = Number(process.env.SP_CAP || 6), SP_NEU = Number(process.env.SP_NEU || 0.25), SP_DOM = Number(process.env.SP_DOM || 0.4);\n  const MAX_P = 64'],
];
const name = process.argv[2], teile = process.argv[3].split('+');
let src = fs.readFileSync(L.ORIGINAL, 'utf8');
for (const t of teile) { const P = PATCHES[t]; if (!P) throw new Error('unbekannt ' + t);
  for (const [a, b] of P) { const n = src.split(a).length - 1; if (n !== 1) throw new Error('patch ' + t + ': Stelle passt ' + n + '-mal: ' + a.slice(0, 80)); src = src.replace(a, () => b); } }
const ziel = path.join(__dirname, 'kern-' + name + '.js'); fs.writeFileSync(ziel, src);
delete globalThis.__planetCore; const P = require(ziel);
const med = (a) => L.median(a), nSaat = Number(process.env.SAATEN || 12);
const Z = [];
for (let i = 1; i <= nSaat; i++) {
  const samen = 'erde-' + String(i).padStart(2, '0');
  let plan; try { plan = L.planVon(P, samen); } catch (e) { Z.push({ samen, fehler: String(e.message).slice(0, 90) }); continue; }
  const S = P.planetScheibe(plan, 0), b = P._intern.abschnittIndex(plan, 0), nS = plan.nS;
  const ga = {}; let sum = 0; for (let s = 0; s < nS; s++) { const a = 1 - Math.cos(plan.schollen[8 * s + 3]); ga[plan.gruppe[b * nS + s]] = (ga[plan.gruppe[b * nS + s]] || 0) + a; sum += a; }
  const gs = Object.values(ga).map(v => v / sum).sort((x, y) => y - x);
  const rs = []; for (let s = 0; s < nS; s++) rs.push(plan.schollen[8 * s + 3] * plan.R); rs.sort((x, y) => y - x);
  const N = 8192, o = {}, pl = {}; for (let j = 0; j < N; j++) { const y = 1 - 2 * (j + 0.5) / N, r = Math.sqrt(1 - y * y), a = j * 2.399963229728653; P.planetPunktR(S, r * Math.cos(a), y, r * Math.sin(a), 40, o); pl[o.platte] = (pl[o.platte] || 0) + 1; }
  const ps = Object.values(pl).map(v => v / N).sort((x, y) => y - x);
  const G = L.gitter(P, S, 720, 40); const m = new Uint8Array(G.W * G.H); for (let p = 0; p < m.length; p++) m[p] = G.h[p] > 0 ? 1 : 0;
  const g = L.gestalt(G, m), inn = L.innen(G, m, g.ab); delete g.ab;
  Z.push({ samen, nS, gruppen: gs.length, grGroesste: gs[0], grZweite: gs[1] || 0, grUnter5: gs.filter(v => v < 0.05).length, schRadMaxKm: rs[0], platten: ps.length, plGroesste: ps[0], plUeber5: ps.filter(v => v > 0.05).length,
    land: g.landAnteil, stuecke4: g.stuecke1e4, stuecke5: g.stuecke1e5, groesster: g.groesster, zweiter: g.zweiter, korcak: g.korcak, formzahl: g.solidityMedian, fern1000: g.fern1000, schmal300: g.schmal300, innenStreu: inn.streuungKm, innenAlt: inn.altGuertel });
  process.stderr.write(samen + ' ');
}
const ok = Z.filter(z => !z.fehler), keys = Object.keys(ok[0]).filter(k => k !== 'samen');
const zus = {}; for (const k of keys) { const a = ok.map(z => z[k]).sort((x, y) => x - y); zus[k] = [+med(a).toFixed(3), +a[0].toFixed(3), +a[a.length - 1].toFixed(3)]; }
console.log(JSON.stringify({ kern: name, teile, n: ok.length, fehler: Z.filter(z => z.fehler), 'median|min|max': zus }));
fs.writeFileSync(path.join(__dirname, 'gruppen-' + name + '.json'), JSON.stringify({ kern: name, teile, env: { SP_CAP: process.env.SP_CAP, SP_NEU: process.env.SP_NEU, SP_DOM: process.env.SP_DOM, LAPPEN_A: process.env.LAPPEN_A, BECKEN_C: process.env.BECKEN_C }, zus, saaten: Z }));
if (process.argv[4]) { const plan = L.planVon(P, 'erde-09'), S = P.planetScheibe(plan, 0), W = 1024; const rgb = P.planetKarte(S, W, 'relief'); fs.writeFileSync(process.argv[4], L.png(rgb, W, W >> 1)); }
