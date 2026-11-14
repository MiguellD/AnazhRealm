#!/usr/bin/env node
// patch.cjs — baut gepatchte KOPIEN des Kerns in diesen Ordner (kern-<name>.js). Der Kern selbst bleibt unberuehrt.
// Jede Ersetzung muss genau einmal passen, sonst bricht der Lauf beim Namen. Aufruf: node patch.cjs <name> [<name> ...]
'use strict';
const fs = require('fs'), path = require('path');
const L = require('./lib.cjs');
const ORIG = fs.readFileSync(L.ORIGINAL, 'utf8');

const PATCHES = {
  // Zerlegung der Hoehen-Terme (nur Diagnose): DBG.hTpl, hOro, hMem, art (1 Naht, 2 Rand-Gedaechtnis), s, hKegel, dyn, tafel
  dbg: [
    ['  const PK_SCHLUESSEL = Object.keys(PK)', '  const DBG = { art: 0, s: -1 };\n  const PK_SCHLUESSEL = Object.keys(PK)'],
    ['    const h = punktRoh(S, x, y, z, fussKm, huelle);\n    let nk', '    const h = punktRoh(S, x, y, z, fussKm, huelle); const dbg0 = Object.assign({}, DBG);\n    let nk'],
    ['    PK.hA = h + nk.w * (hAlt - hNeu);\n    return PK.hA;', '    PK.hA = h + nk.w * (hAlt - hNeu); Object.assign(DBG, dbg0); DBG.nachklang = nk.w * (hAlt - hNeu);\n    return PK.hA;'],
    ['    let hMem = 0, memAlter = 0;', '    let hMem = 0, memAlter = 0; DBG.art = 0; DBG.s = -1; DBG.nachklang = 0;'],
    ['          if (h > hMem) { hMem = h; memAlter = a; }', '          if (h > hMem) { hMem = h; memAlter = a; DBG.art = 1; DBG.s = s; DBG.naht = NJ.liste[ii]; }'],
    ['        if (hR > hMem) { hMem = hR; memAlter = aR; }', '        if (hR > hMem) { hMem = hR; memAlter = aR; DBG.art = 2; DBG.s = s; DBG.fpos = fpos; }'],
    ['    hA += hTpl + hGeb + hKegel;', '    DBG.hTpl = hTpl; DBG.hOro = hOro; DBG.hMem = hMem; DBG.hKegel = hKegel; DBG.tafel = tafel;\n    hA += hTpl + hGeb + hKegel;'],
    ['    _intern: Object.freeze({ planBytes,', '    _dbg: DBG, _intern: Object.freeze({ planBytes,'],
  ],
};

// Feuchte-Integral (Punkt 3): Knoten in FESTEN km (nie mit dem Wind skaliert), Meeres-Anzeige aus dem glatten Kuesten-Abstand,
// ueber den Knoten-Takt geglaettet; das Gewicht des Luv-Wegs waechst stetig mit dem Wind (om = |Wind|), keine Glatt-Schwelle.
PATCHES.feuchte = [
  ['      const om = glatt(0.02, 0.35, wl);', '      const om = wl / 1.044;'],
  [`        const skal = 0.35 + 0.65 * Math.min(1, wl / 1.044);
        for (let j = 5; j >= 0; j--) {
          const a = KLIMA.schritte[j] * skal / R, ca = kcos(a), sa = ksin(a);
          KL_H[j] = planetHuelle(S, ca * x + sa * dx, ca * y + sa * dy, ca * z + sa * dz);
        }`, `        for (let j = 3; j >= 0; j--) {
          const a = KLIMA.schritte[j] / R, ca = kcos(a), sa = ksin(a);
          KL_H[j] = planetHuelle(S, ca * x + sa * dx, ca * y + sa * dy, ca * z + sa * dz);
        }
        // Feuchte-Integral: FN Knoten im Takt FD km; Meeres-Anzeige je Knoten aus dem glatten Krusten-Abstand, ueber FD geglaettet
        mW = mLand; sMax = 0; mar = 0;
        const eMk = kexpS(-FD / KLIMA.meerKm), eLk = kexpS(-FD / KLIMA.recycleKm);
        for (let kq = FN - 1; kq >= 0; kq--) {
          const sk = (kq + 0.5) * FD, a = sk / R, ca = kcos(a), sa = ksin(a);
          const gv = krusteFeld(S, ca * x + sa * dx, ca * y + sa * dy, ca * z + sa * dz, 400, true);
          const kk = (gv - S.kuesteF) * (KF.sBest >= 0 ? S.sr[KF.sBest] : 0.2) * R;
          const sj = glatt(0.5 * FD, -0.5 * FD, kk);
          mW = sj * (1 - (1 - mW) * eMk) + (1 - sj) * (mLand + (mW - mLand) * eLk);
          const mj = sj * kexpS(-sk / 600); if (mj > mar) mar = mj; if (sj > sMax) sMax = sj;
        }
        mW = mLand + (mW - mLand) * kexpS(-0.5 * FD / KLIMA.recycleKm);`],
  [`        const s5 = glatt(0.3, -0.6, KL_H[5]);
        mW = s5 + (1 - s5) * mLand; sMax = s5;
        schranke = (1 - s5) * (KL_H[5] - hO) * kexpS(-KLIMA.schritte[5] * skal / KLIMA.leeKm);
        mar = s5 * kexpS(-KLIMA.schritte[5] * skal / 600);
        for (let j = 4; j >= -1; j--) {
          const dj = j >= 0 ? KLIMA.schritte[j] * skal : 0, dd = KLIMA.schritte[j + 1] * skal - dj;
          const h = j >= 0 ? KL_H[j] : hO, sj = glatt(0.3, -0.6, h);
          const eM = kexpS(-dd / KLIMA.meerKm), eL = kexpS(-dd / KLIMA.recycleKm);
          mW = sj * (1 - (1 - mW) * eM) + (1 - sj) * (mLand + (mW - mLand) * eL);
          const b = (h - hO) * kexpS(-dj / KLIMA.leeKm);
          schranke = sj * schranke * eM + (1 - sj) * (b > schranke ? b : schranke);
          const mj = sj * kexpS(-dj / 600); if (mj > mar) mar = mj;
          if (sj > sMax) sMax = sj;
        }`, `        schranke = 0;
        for (let j = 3; j >= 0; j--) {
          const dj = KLIMA.schritte[j], h = KL_H[j], sj = glatt(0.3, -0.6, h);
          const b = (h - hO) * kexpS(-dj / KLIMA.leeKm);
          schranke = sj * schranke * kexpS(-75 / KLIMA.meerKm) + (1 - sj) * (b > schranke ? b : schranke);
        }`],
  ['  const KL_H = new Float64Array(6);', '  const KL_H = new Float64Array(6), FD = 150, FN = 14;'],
];

PATCHES.dbg2 = [
  [`      const xKm = j === sec ? mHaupt : Math.max(0, (sc[own] - sc[j]) * 0.5 * R);
      if (xKm > 5000) continue;`, `      const xKm = j === sec ? mHaupt : Math.max(0, (sc[own] - sc[j]) * 0.5 * R);
      DBG.xs[j] = Math.round(xKm) + (j === sec ? "*" : "") + "|dC" + Math.round(W_.dC[j] * R) + "|sx" + (sc[j] * R).toFixed(0);
      if (xKm > 5000) continue;`],
  ['    let mHaupt = sec >= 0', `    DBG.xs = {}; DBG.fK = fK; DBG.gF = Array.from(KF.gF.subarray(0, S.nG)).map(v => +v.toFixed(3));
    let mHaupt = sec >= 0`],
  ['        if (oro > hOro) { hOro = oro; oroAlter = t - A.t0; }', '        if (oro > hOro) { hOro = oro; oroAlter = t - A.t0; DBG.oj = { j, xKm, konv, s, wa, wb, wc, wd, wkI, wkJ, dCj, dCo, grat, anJ: W_.anc[j], anI: W_.anc[own] }; }'],
  ['    let hMem = 0, memAlter = 0;', '    let hMem = 0, memAlter = 0; if (hOro === 0) DBG.oj = null;'],
  ['      const c = PR.c, rate = PR.rate;', '      const c = PR.c, rate = PR.rate; if (j === sec) { DBG.cSec = c; DBG.qSec = [qx, qy, qz]; }'],
];
// Grenz-Normale (Punkt 4): die Normale des Paars war t_j − t_i (Tangenten zu den Ankern); liegt der Punkt jenseits beider Anker
// (Kruste ueber Kruste in der Kollision), ist |n| klein und kippt am Grosskreis der Anker — c springt von +49 auf −49 cm/a·10, das
// Orogen faellt als Lineal-Kante weg. Schnitt: wo |n| < 0,8 traegt die Paar-Rate paarC (je Scheibe fest, am Rand gemessen) statt c.
PATCHES.kante = [
  ['    PR.c = vx * nx + vy * ny + vz * nz;', '    PR.c = vx * nx + vy * ny + vz * nz; PR.nl = nl0;'],
  ['    let nx = _tb[0] - _ta[0], ny = _tb[1] - _ta[1], nz = _tb[2] - _ta[2]; let nl = Math.sqrt(nx * nx + ny * ny + nz * nz);', '    let nx = _tb[0] - _ta[0], ny = _tb[1] - _ta[1], nz = _tb[2] - _ta[2]; let nl = Math.sqrt(nx * nx + ny * ny + nz * nz); const nl0 = nl;'],
  ['      const c = PR.c, rate = PR.rate;', '      const gN = glatt(0.3, 0.8, PR.nl), c = PR.c * gN + S.paarC[own * S.nP + j] * (1 - gN), rate = PR.rate;'],
];

// Becken und Schwellen der Kruste (Punkte 1 + 2): die Kueste ist nicht der Rand der Kruste, sondern die Hoehenlinie der Kruste ueber
// dem Meer. Ein Feld B im Schollen-Rahmen (faehrt mit), Spektrum 4 000 km ... Fuss, Gewinn 0,62 je Oktave (Hurst ~0,7), Amplitude
// BECKEN_C x Freibord, wirkt auf der GANZEN Kruste (Gewicht S1, also auch im Schelf-Gurtel): Schwellen heben den Schelf ueber das
// Meer (Halbinseln, Inselketten am Rand), Becken fluten das Innere (Binnenmeere, Buchten). Die Mitgliedschaft der Kruste (K1),
// die Platten und das Alter bleiben byte-gleich — nur das Profil liest B.
PATCHES.becken = [
  [`    if (S2 > 0 && sB >= 0 && KF.sIn[sB]) {
      const lx = KF.sLx[3 * sB], ly = KF.sLx[3 * sB + 1], lz = KF.sLx[3 * sB + 2];
      tafel = 0.3 * fbmKm((plan.schollen[8 * sB + 5] | 0) + 91, lx, ly, lz, R, 1400, huelle ? 1400 : 600, 0.5);
    }`, `    if (S1 > 0 && sB >= 0 && KF.sIn[sB]) {
      const lx = KF.sLx[3 * sB], ly = KF.sLx[3 * sB + 1], lz = KF.sLx[3 * sB + 2];
      tafel = BECKEN_C * plan.koerper.freibordKm * fbmKm((plan.schollen[8 * sB + 5] | 0) + 91, lx, ly, lz, R, 4000, huelle ? 800 : Math.max(32, 2 * fussKm), 0.62);
    }`],
  ['    let hA = oz * (1 - S1) + S1 * (1 - S2) * (-sd) + S2 * (fb + tafel);', '    let hA = oz * (1 - S1) + S1 * (1 - S2) * (-sd) + S2 * fb + S1 * tafel;'],
  ['  const PLANET_ERDE = Object.freeze(', `  const BECKEN_C = Number(process.env.BECKEN_C || 5.0);
  const PLANET_ERDE = Object.freeze(`],
];
// Lappen (Punkt 1): die Ellipse kommt aus dem Klemm-Fenster des Schollen-Felds — Rauschen nur im Guertel −0,75 < f < 0,6 mit
// Amplitude 0,6 und erster Wellenlaenge = Radius: die Kueste weicht hoechstens ~0,2 rs von der Ellipse ab, ~6 Lappen je Umfang.
// Schnitt: erste Wellenlaenge 2 rs (bis 6 000 km), Rauschen auf dem ganzen Feld bis ins Innere (Fenster ab f = −1,3), Amplitude
// LAPPEN_A; Q (Krusten-Anteil) loest sich wie heute aus dem Quantil, die Mechanik (K1, eine Gruppe = eine Platte) bleibt.
PATCHES.lappen = [
  ['    if (f > -0.75 && f < 0.6) {\n      const seed = plan.schollen[8 * s + 5] | 0, lam0 = Math.min(3000, rs * R * 1.0);', '    if (f > -1.3) {\n      const seed = plan.schollen[8 * s + 5] | 0, lam0 = Math.min(6000, rs * R * 2.0);'],
  ['      f += 0.6 * n * glatt(-0.75, -0.25, f) * (1 - glatt(0.3, 0.6, f)) * plan.schollen[8 * s + 6];', '      f += LAPPEN_A * n * glatt(-1.3, -0.5, f) * plan.schollen[8 * s + 6];'],
  ['  const MAX_P = 64;', '  const MAX_P = 64, LAPPEN_A = Number(process.env.LAPPEN_A || 2.0);'],
];
// Wurzel (Punkt 2): ein Gebirge verliert seine Hoehe nicht mit EINER Zeitkonstante. Die Krustenwurzel hebt nach (Isostasie):
// Hoehe = H0 (1 − e^(−a/20)) (e^(−a/120) + WURZEL e^(−a/1500)); alte Naehte und erloschene Raender stehen nach 300 Ma bei ~1 km,
// nach 1 Ga bei ~0,3 km (Appalachen, Ural, Grenville als Richtwerte, ungeprueft).
PATCHES.wurzel = [
  ['nae[8 * i + 5] * (1 - kexpS(-a / TAU_W)) * kexpS(-a / TAU_A) * gS : 0;', 'nae[8 * i + 5] * (1 - kexpS(-a / TAU_W)) * (kexpS(-a / TAU_A) + WURZEL * kexpS(-a / 1500)) * gS : 0;'],
  ['          hR += wgt * H0 * kexpS(-a / TAU_A) * gauss(innenKm - 300, 85 * (1 + a / 200)); aR = a;', '          hR += wgt * H0 * (kexpS(-a / TAU_A) + WURZEL * kexpS(-a / 1500)) * gauss(innenKm - 300, 85 * (1 + a / 200)); aR = a;'],
  ['  const T_START = -4000, T_ENDE = 1000, TAU_W = 20, TAU_A = 120;', '  const T_START = -4000, T_ENDE = 1000, TAU_W = 20, TAU_A = 120, WURZEL = Number(process.env.WURZEL || 0.15);'],
];

for (const name of process.argv.slice(2)) {
  const teile = name === 'alle' ? ['becken', 'lappen', 'wurzel', 'kante', 'feuchte'] : name.split('+'); let src = ORIG;
  for (const t of teile) {
    const P = PATCHES[t]; if (!P) throw new Error('patch: unbekannt ' + t);
    for (const [a, b] of P) { const n = src.split(a).length - 1; if (n !== 1) throw new Error('patch ' + t + ': Stelle passt ' + n + '-mal: ' + a.slice(0, 80)); src = src.replace(a, () => b); }
  }
  fs.writeFileSync(path.join(__dirname, 'kern-' + name + '.js'), src);
  console.log('kern-' + name + '.js', src.length);
}
module.exports = { PATCHES };
