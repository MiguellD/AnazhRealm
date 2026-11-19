'use strict';
// Zensus PLANET, Feld e (planet-kern): Messung des Kerns planet-core.js — nur lesen, nichts schreiben.
// Lauf: node /home/user/zensus-planet/vision/planet/zensus/e-mess.cjs [--schnell]
// Lädt den Kern aus PLANET_KERN (wie spike/lib.cjs), sonst aus dem Baum /home/user/AnazhRealm; das Ort-Gesetz aus dem Baum.
const KERN = process.env.PLANET_KERN ? require('path').resolve(process.env.PLANET_KERN) : '/home/user/AnazhRealm/planet-core.js';
const GELAENDE = '/home/user/AnazhRealm/gelaende-core.js';
const P = require(KERN);
require(GELAENDE);
const G = globalThis.__gelaendeCore;
const og = G.ortGesetz();
const I = P._intern;
const SCHNELL = process.argv.includes('--schnell');
const SAATEN = ['erde-01', 'erde-05', 'erde-09'];
const ns = () => Number(process.hrtime.bigint());
const msSeit = (a) => (ns() - a) / 1e6;
const sortiert = (a) => [...a].sort((x, y) => x - y);
const median = (a) => { const b = sortiert(a); return b.length % 2 ? b[b.length >> 1] : 0.5 * (b[b.length / 2 - 1] + b[b.length / 2]); };
const quant = (a, q) => { const b = sortiert(a); return b[Math.min(b.length - 1, Math.floor(q * b.length))]; };
const f = (x, n) => (typeof x === 'number' ? x.toFixed(n === undefined ? 2 : n) : String(x));
const GRAD = 180 / Math.PI;
// eigener Zufall für die Mess-Richtungen (unabhängig vom Kern, reproduzierbar)
function lcg(s) { let x = s >>> 0; return () => { x = (Math.imul(x, 1664525) + 1013904223) >>> 0; return x / 4294967296; }; }
function richtungen(n, s) { const r = lcg(s), a = new Float64Array(3 * n); for (let i = 0; i < n; i++) { const y = 2 * r() - 1, ph = 2 * Math.PI * r(), c = Math.sqrt(1 - y * y); a[3 * i] = c * Math.cos(ph); a[3 * i + 1] = y; a[3 * i + 2] = c * Math.sin(ph); } return a; }
const aus = {};
function zeile(s) { process.stdout.write(s + '\n'); }

zeile('# e-mess — planet-core ' + P.VERSION + ' · node ' + process.version + ' · ' + new Date().toISOString());
zeile('## A Körper');
zeile('PLANET_ERDE = ' + JSON.stringify(P.PLANET_ERDE));
zeile('ortGesetz: kuehlungKJeM ' + og.kuehlungKJeM + ' · meerUnterBasisM ' + og.meerUnterBasisM + ' · klimaHeute ' + JSON.stringify(og.klimaHeute) + ' · s_v = 0,0065/kuehlung = ' + (0.0065 / og.kuehlungKJeM));
for (const s of SAATEN) {
  const pe = P.planetPlan(s, P.PLANET_ERDE), pf = P.planetPlan(s);
  zeile(s + ' ERDE: koerper ' + JSON.stringify(pe.koerper) + ' · nS ' + pe.nS + ' nO ' + pe.nO + ' nB ' + pe.nB + ' nH ' + pe.nH + ' nE ' + pe.nE + ' Naehte ' + pe.naehte.length / 8 + ' Q ' + f(pe.Q, 4) + ' gS ' + f(pe.gS, 4) + ' bilder ' + f(pe.bilder[0], 0) + '…' + f(pe.bilder[pe.nB - 1], 0));
  zeile(s + ' FREI : koerper ' + JSON.stringify(pf.koerper) + ' · nS ' + pf.nS + ' nO ' + pf.nO + ' nB ' + pf.nB);
}

zeile('## B Vor-Läufe und Stufen (Körper PLANET_ERDE, kalt je Plan)');
{ let a = ns(); I.fib(4096); const t4096 = msSeit(a); a = ns(); I.fib(1024); const t1024 = msSeit(a); a = ns(); I.fib(512); const t512 = msSeit(a);
  zeile('fib kalt (Memo je Prozess): 4096 ' + f(t4096, 3) + ' ms · 1024 ' + f(t1024, 3) + ' ms · 512 ' + f(t512, 3) + ' ms'); }
const STUFE = {};
for (const s of SAATEN) {
  const r = STUFE[s] = {};
  const planT = [];
  for (let i = 0; i < 5; i++) { const a = ns(); P.planetPlan(s, P.PLANET_ERDE); planT.push(msSeit(a)); }
  let a = ns(); const plan = P.planetPlan(s, P.PLANET_ERDE); r.plan = msSeit(a); r.planMed = median(planT); r.planMin = Math.min(...planT); r.planBytes = I.planBytes(plan);
  const b0 = I.abschnittIndex(plan, 0);
  a = ns(); I.abschnitt(plan, b0); r.abschnitte = msSeit(a); r.b0 = b0;
  a = ns(); I.scheibeKern(plan, 0, false); r.nachbar = msSeit(a);
  a = ns(); P.planetKlimaGlobal(plan, 0); r.klimaG = msSeit(a);
  a = ns(); const m = P.planetMeer(plan, 0); r.meer = msSeit(a); r.meerObj = m;
  a = ns(); const S = P.planetScheibe(plan, 0); r.scheibeRest = msSeit(a);
  r.scheibeBytes0 = I.scheibeBytes(S);
  a = ns(); P.planetPunktR(S, 0.3, 0.5, 0.812403840463596, 40); r.ersterPunkt = msSeit(a);
  r.scheibeBytes1 = I.scheibeBytes(S);
  // dieselbe Scheibe am Stück an einem frischen Plan (Memo leer, fib warm)
  const plan2 = P.planetPlan(s, P.PLANET_ERDE);
  a = ns(); const S2 = P.planetScheibe(plan2, 0); r.scheibeKalt = msSeit(a);
  a = ns(); P.planetScheibe(plan2, 0); r.scheibeWarm = msSeit(a);
  a = ns(); P.planetPunktR(S2, 0.3, 0.5, 0.812403840463596, 40); r.ketten2 = msSeit(a);
  // eine Zeit abseits des Fach-Takts und eine weit zurück (kalt: neuer Abschnitt + Meer-Fächer)
  a = ns(); P.planetScheibe(plan2, -137.3); r.scheibeM137 = msSeit(a);
  a = ns(); P.planetScheibe(plan2, -3000); r.scheibeM3000 = msSeit(a);
  zeile(s + ': planetPlan erster ' + f(r.plan, 2) + ' ms (5 weitere: min ' + f(r.planMin, 2) + ' · Median ' + f(r.planMed, 2) + ' ms) · planBytes ' + r.planBytes + ' B (' + f(r.planBytes / 1024, 1) + ' KB)');
  zeile(s + ': Abschnitte 0…' + b0 + ' (Rand-Gedächtnis rekursiv) ' + f(r.abschnitte, 2) + ' ms · Nachbar-Liste 4096 Proben ' + f(r.nachbar, 2) + ' ms · planetKlimaGlobal ' + f(r.klimaG, 3) + ' ms · planetMeer(0) ' + f(r.meer, 1) + ' ms (meerKm ' + f(m.meerKm, 4) + ' sigma ' + f(m.sigmaKm, 4) + ' ref ' + f(m.refKm, 4) + ' land ' + f(m.landAnteil, 4) + ' eisKm ' + f(m.eisKm, 4) + ' eisFl ' + f(m.eisFlaeche, 4) + ' ozeanAlter ' + f(m.ozeanAlterMa, 1) + ') · Rest planetScheibe ' + f(r.scheibeRest, 3) + ' ms');
  zeile(s + ': planetScheibe(plan, 0) am Stück kalt ' + f(r.scheibeKalt, 1) + ' ms · warm ' + f(r.scheibeWarm, 4) + ' ms · scheibeBytes ' + r.scheibeBytes0 + ' B vor / ' + r.scheibeBytes1 + ' B nach dem ersten Punkt (Ketten) · erster Punkt (kettenBauen) ' + f(r.ersterPunkt, 1) + ' ms / ' + f(r.ketten2, 1) + ' ms · planetScheibe(−137,3) kalt ' + f(r.scheibeM137, 1) + ' ms · planetScheibe(−3000) kalt ' + f(r.scheibeM3000, 1) + ' ms');
}

zeile('## C Punkt, Hülle, Klima, Biom (warm, je Aufruf gemessen)');
const N = SCHNELL ? 2000 : 10000;
const PUNKT = {};
for (const s of SAATEN) {
  const plan = P.planetPlan(s, P.PLANET_ERDE), S = P.planetScheibe(plan, 0), D = richtungen(N, 0x5eed + s.charCodeAt(5) * 7);
  for (let i = 0; i < 1500; i++) P.planetPunktR(S, D[3 * i], D[3 * i + 1], D[3 * i + 2], 40, aus);   // Aufwärmen (JIT)
  const r = PUNKT[s] = {};
  for (const fuss of [40, 16]) {
    const t = new Float64Array(N); let land = 0;
    const a0 = ns();
    for (let i = 0; i < N; i++) { const a = ns(); const h = P.planetPunktR(S, D[3 * i], D[3 * i + 1], D[3 * i + 2], fuss, aus); t[i] = (ns() - a) / 1e3; if (h > 0) land++; }
    const tot = (ns() - a0) / 1e3 / N;
    r['p' + fuss] = { median: median(t), p95: quant(t, 0.95), mittel: tot, land: land / N };
    zeile(s + ': planetPunktR fuss ' + fuss + ' km: Median ' + f(median(t), 2) + ' µs · p95 ' + f(quant(t, 0.95), 2) + ' µs · Mittel (Schleife) ' + f(tot, 2) + ' µs · Land ' + f(100 * land / N, 1) + ' % (' + N + ' Richtungen)');
  }
  { const t = new Float64Array(N); for (let i = 0; i < N; i++) { const a = ns(); P.planetHuelle(S, D[3 * i], D[3 * i + 1], D[3 * i + 2]); t[i] = (ns() - a) / 1e3; }
    r.huelle = median(t); zeile(s + ': planetHuelle Median ' + f(median(t), 2) + ' µs · p95 ' + f(quant(t, 0.95), 2) + ' µs'); }
  // Klima: Land und Meer getrennt; mit gegebenem Punkt (nur Klima) und ohne (Klima rechnet den Punkt)
  const NK = SCHNELL ? 400 : 2000, tl = [], tm = [], tl0 = [], tm0 = [], tb = [];
  let nl = 0, nm = 0;
  for (let i = 0; i < N && (nl < NK || nm < NK); i++) {
    const x = D[3 * i], y = D[3 * i + 1], z = D[3 * i + 2], pt = {}; P.planetPunktR(S, x, y, z, 40, pt);
    const isLand = pt.hoeheKm > 0; if (isLand ? nl >= NK : nm >= NK) continue;
    const K = {};
    let a = ns(); P.planetKlimaR(S, x, y, z, -1, K, pt); const d1 = (ns() - a) / 1e3;
    a = ns(); P.planetKlimaR(S, x, y, z, -1, {}); const d0 = (ns() - a) / 1e3;
    a = ns(); P.planetBiom(K, pt.hoeheM, {}); tb.push((ns() - a) / 1e3);
    if (isLand) { tl.push(d1); tl0.push(d0); nl++; } else { tm.push(d1); tm0.push(d0); nm++; }
  }
  r.klimaLand = median(tl); r.klimaMeer = median(tm); r.klimaLandMitPunkt = median(tl0); r.klimaMeerMitPunkt = median(tm0); r.biom = median(tb);
  zeile(s + ': planetKlimaR (Punkt gegeben) Land Median ' + f(median(tl), 1) + ' µs p95 ' + f(quant(tl, 0.95), 1) + ' (n ' + nl + ') · Meer Median ' + f(median(tm), 2) + ' µs p95 ' + f(quant(tm, 0.95), 2) + ' (n ' + nm + ')');
  zeile(s + ': planetKlimaR (rechnet den Punkt, fuss 40) Land Median ' + f(median(tl0), 1) + ' µs · Meer Median ' + f(median(tm0), 2) + ' µs · planetBiom Median ' + f(median(tb), 3) + ' µs p95 ' + f(quant(tb, 0.95), 3) + ' µs');
}

zeile('## D Brücke: planetAnker, planetOrt (Ort-Gesetz des Gelände-Kerns)');
const ORT = {};
for (const s of SAATEN) {
  const plan = P.planetPlan(s, P.PLANET_ERDE), S = P.planetScheibe(plan, 0); P.planetKlimaGlobal(plan, 0);
  const r = ORT[s] = {};
  let a = ns(); const A = P.planetAnker(plan, 0, og); r.anker = msSeit(a);
  a = ns(); P.planetAnker(plan, 0, og); r.ankerWarm = msSeit(a);
  zeile(s + ': planetAnker kalt ' + f(r.anker, 1) + ' ms · warm (Memo) ' + f(r.ankerWarm, 4) + ' ms · Anker ' + f(A.breite * GRAD, 2) + '° ' + f(A.laenge * GRAD, 2) + '° · Küste ' + f(A.kuesteKm, 0) + ' km · Rand ' + f(A.randKm, 0) + ' km (Art ' + A.randArt + ') · Sommer ' + f(A.sommerC, 2) + ' °C Winter ' + f(A.winterC, 2) + ' °C · Wertung ' + f(A.wertung, 4));
  a = ns(); const o0 = P.planetOrt(S, A.breite + 0.01, A.laenge, og); r.ortErst = msSeit(a);
  const t = [];
  for (let j = 0; j < 40; j++) { a = ns(); P.planetOrt(S, A.breite + 0.002 * j, A.laenge - 0.001 * j, og, {}); t.push(msSeit(a)); }
  r.ortWarm = median(t);
  const Sm = P.planetScheibe(plan, -100); const tm = [];
  for (let j = 0; j < 20; j++) { a = ns(); P.planetOrt(Sm, A.breite + 0.003 * j, A.laenge + 0.002 * j, og, {}); tm.push(msSeit(a)); }
  r.ortM100 = median(tm);
  zeile(s + ': planetOrt erster (Anker-Ort ortAnkerRoh + Ort) ' + f(r.ortErst, 2) + ' ms · warm Median ' + f(r.ortWarm, 3) + ' ms (40 Orte, t 0) · bei −100 Ma Median ' + f(r.ortM100, 3) + ' ms (20 Orte) · stauchung ' + o0.stauchung);
  // Konsum-Tiefe: Spanne jedes Δ-Felds über Land-Orte (t = 0 und −100 Ma), und ob das Meer-Δ vom Ort abhängt
  for (const [Sx, tz] of [[S, 0], [Sm, -100]]) {
    const D = richtungen(SCHNELL ? 300 : 1500, 0xabc + tz), sp = {}; let n = 0; const wl = new Set();
    for (let i = 0; i < D.length / 3 && n < (SCHNELL ? 40 : 150); i++) {
      const bl = P.planetBreiteLaenge(D[3 * i], D[3 * i + 1], D[3 * i + 2]), pt = {};
      P.planetPunkt(Sx, bl[0], bl[1], 16, pt); if (!(pt.hoeheM > 0)) continue;
      let o; try { o = P.planetOrt(Sx, bl[0], bl[1], og, {}); } catch (e) { continue; }
      n++; const d = o.delta;
      const fl = { 'klima.sommer': d.klima.sommer, 'klima.winter': d.klima.winter, 'klima.tagAmp': d.klima.tagAmp, 'klima.sommerPhase': d.klima.sommerPhase, 'klima.spendeVerh': d.klima.spendeVerh,
        'meer.waterLevelM': d.meer.waterLevelM, 'wetter.regenQuote': d.wetter.regenQuote, 'wetter.sturmQuote': d.wetter.sturmQuote, 'wetter.windX': d.wetter.windX, 'wetter.windZ': d.wetter.windZ,
        'wuchs.decke': d.wuchs.decke, 'wuchs.wald': d.wuchs.wald };
      for (const id in d.wildnis) fl['wildnis.' + id] = d.wildnis[id];
      for (const k in fl) { const v = fl[k]; if (!sp[k]) sp[k] = [Infinity, -Infinity]; if (v < sp[k][0]) sp[k][0] = v; if (v > sp[k][1]) sp[k][1] = v; }
      wl.add(d.meer.waterLevelM.toFixed(9));
    }
    zeile(s + ' t ' + tz + ' Ma: Δ-Spannen über ' + n + ' Land-Orte (min…max): ' + Object.keys(sp).map(k => k + ' ' + f(sp[k][0], 3) + '…' + f(sp[k][1], 3)).join(' · ') + ' · verschiedene meer.waterLevelM-Werte: ' + wl.size);
  }
}

zeile('## E Radius (gleicher Samen, Körper PLANET_ERDE mit radiusKm ersetzt)');
const RAD = {};
for (const Rk of [3186, 6371, 12742]) {
  const k = Object.assign({}, P.PLANET_ERDE, { radiusKm: Rk });
  for (const s of SAATEN) {
    const r = RAD[Rk + '|' + s] = {};
    try {
      let a = ns(); const plan = P.planetPlan(s, k); r.plan = msSeit(a); r.bytes = I.planBytes(plan); r.nB = plan.nB;
      a = ns(); const S = P.planetScheibe(plan, 0); r.scheibe = msSeit(a);
      a = ns(); P.planetPunktR(S, 0.3, 0.5, 0.812403840463596, 40); r.ketten = msSeit(a);
      const D = richtungen(SCHNELL ? 1000 : 3000, 0x77), t = [];
      for (let i = 0; i < 500; i++) P.planetPunktR(S, D[3 * i], D[3 * i + 1], D[3 * i + 2], 40, aus);
      for (let i = 0; i < D.length / 3; i++) { const b = ns(); P.planetPunktR(S, D[3 * i], D[3 * i + 1], D[3 * i + 2], 40, aus); t.push((ns() - b) / 1e3); }
      r.punkt = median(t); r.bytesS = I.scheibeBytes(S);
      a = ns(); let A = null; try { A = P.planetAnker(plan, 0, og); } catch (e) { r.ankerFehler = e.message.slice(0, 80); } r.anker = msSeit(a);
      if (A) { P.planetOrt(S, A.breite + 0.01, A.laenge, og); const to = []; for (let j = 0; j < 20; j++) { a = ns(); P.planetOrt(S, A.breite + 0.002 * j, A.laenge, og, {}); to.push(msSeit(a)); } r.ort = median(to); }
      const G0 = P.planetKlimaGlobal(plan, 0); r.zellBreite = G0.zellBreite * GRAD; r.zellen = G0.zellen;
      zeile('R ' + Rk + ' ' + s + ': planetPlan ' + f(r.plan, 1) + ' ms · ' + r.bytes + ' B · nB ' + r.nB + ' · planetScheibe(0) kalt ' + f(r.scheibe, 1) + ' ms · scheibeBytes ' + r.bytesS + ' · erster Punkt ' + f(r.ketten, 1) + ' ms · planetPunktR Median ' + f(r.punkt, 2) + ' µs · planetAnker ' + (r.ankerFehler ? 'BRICHT (' + r.ankerFehler + ')' : f(r.anker, 1) + ' ms') + ' · planetOrt warm ' + (r.ort !== undefined ? f(r.ort, 3) + ' ms' : '—') + ' · Hadley-Rand ' + f(r.zellBreite, 1) + '° (' + r.zellen + ' Zellen)');
    } catch (e) { r.fehler = e.message; zeile('R ' + Rk + ' ' + s + ': BRICHT — ' + e.message); }
  }
}
zeile('## G Der Anker selbst (30 Erd-Saaten): was der Ort am Anker trägt — ein Verhältnis zum Anker 0 ist tot');
const ANK = [];
for (let i = 1; i <= (SCHNELL ? 6 : 30); i++) {
  const s = 'erde-' + String(i).padStart(2, '0');
  try {
    const plan = P.planetPlan(s, P.PLANET_ERDE), S = P.planetScheibe(plan, 0), A = P.planetAnker(plan, 0, og), o = P.planetOrt(S, A.breite, A.laenge, og);
    ANK.push({ s, breite: A.breite * GRAD, decke: o.wuchs.decke, wald: o.wuchs.wald, spende: o.klima.spendeMm, regen: o.wetter.regenQuote, koeppen: P.KOEPPEN[o.biom.koeppen], hoehe: o.wildnis.hoehe, ks: o.wildnis.ks, land: o.wildnis.land, tafel: o.wildnis.tafel });
  } catch (e) { ANK.push({ s, fehler: e.message.slice(0, 90) }); }
}
zeile(ANK.map(a => a.fehler ? a.s + ' BRICHT ' + a.fehler : a.s + ' ' + f(a.breite, 1) + '° ' + a.koeppen + ' decke ' + f(a.decke, 3) + ' wald ' + f(a.wald, 3) + ' spende ' + f(a.spende, 0) + ' mm regenQ ' + f(a.regen, 3) + ' hoehe ' + f(a.hoehe, 3) + ' ks ' + f(a.ks, 2) + ' land ' + f(a.land, 3) + ' tafel ' + f(a.tafel, 3)).join('\n'));
const ok = ANK.filter(a => !a.fehler);
zeile('Anker mit wald = 0 (Verhältnis tot, jeder Ort trägt den Wald der Heimat): ' + ok.filter(a => a.wald === 0).length + '/' + ok.length + ' · mit decke = 0: ' + ok.filter(a => a.decke === 0).length + ' · mit Spende 0 (Verhältnis ∞): ' + ok.filter(a => a.spende === 0).length + ' · Anker bricht: ' + ANK.filter(a => a.fehler).length);
zeile('## H Anker-Band: gesucht bei fuss 16 (planetAnker, seit B5; vorher 40), gelesen bei fuss 16 (ortRoh, voxel-worker) — und die Heim-Saat des Spiels');
{
  const H = { see16: 0, tundra: 0, n: 0, liste: [] };
  for (const s of ['anazh-realm-seed', ...Array.from({ length: SCHNELL ? 6 : 30 }, (_, i) => 'erde-' + String(i + 1).padStart(2, '0'))]) {
    const plan = P.planetPlan(s, P.PLANET_ERDE), S = P.planetScheibe(plan, 0), A = P.planetAnker(plan, 0, og), p40 = {}, p16 = {};
    P.planetPunkt(S, A.breite, A.laenge, 40, p40); P.planetPunkt(S, A.breite, A.laenge, 16, p16);
    const o = P.planetOrt(S, A.breite, A.laenge, og);
    const z = s + ': Anker ' + f(A.breite * GRAD, 2) + '° ' + f(A.laenge * GRAD, 2) + '° · fuss 40 ' + f(p40.hoeheM, 0) + ' m (Küste ' + f(p40.kont, 0) + ' km) · fuss 16 ' + f(p16.hoeheM, 0) + ' m (Küste ' + f(p16.kont, 0) + ' km) · Köppen ' + o.biom.koeppen + ' ' + P.KOEPPEN[o.biom.koeppen] + ' · Spende ' + f(o.klima.spendeMm, 0) + ' mm · wald ' + f(o.wuchs.wald, 3);
    if (s === 'anazh-realm-seed') { zeile('Heim-Saat ' + z); continue; }
    H.n++; if (!(p16.hoeheM > 0)) { H.see16++; H.liste.push(z); } if (o.biom.koeppen >= 28) { H.tundra++; H.liste.push(z); }
  }
  zeile(H.liste.join('\n'));
  zeile('Anker bei fuss 16 im Meer: ' + H.see16 + '/' + H.n + ' · Anker in Köppen E (ET/EF): ' + H.tundra + '/' + H.n);
  if (!SCHNELL) {
    const plan = P.planetPlan('erde-29', P.PLANET_ERDE), S = P.planetScheibe(plan, 0); let land = 0, inf = 0, nein = 0, grund = '';
    for (let i = 0; land < 200 && i < 5000; i++) {
      const br = Math.asin(2 * P.planetZufall(29, 1, i, 0) - 1), la = P.planetZufall(29, 2, i, 0) * 2 * Math.PI - Math.PI, p = {};
      P.planetPunkt(S, br, la, 16, p); if (!(p.hoeheM > 0)) continue; land++;
      const d = P.planetOrt(S, br, la, og).delta; if (d.klima.spendeVerh === Infinity) inf++;
      // derselbe Teil, den voxel-worker.js:1184–1206 baut und stamm/netz-portal.js:674 prüft
      const teil = { samen: 'erde-29', version: P.VERSION, breite: br, laenge: la, zeitMa: 0, delta: { klima: { sommer: d.klima.sommer, winter: d.klima.winter, tagAmp: d.klima.tagAmp, sommerPhase: d.klima.sommerPhase, spendeVerh: d.klima.spendeVerh },
        meer: { waterLevelM: d.meer.waterLevelM }, wetter: { regenQuote: d.wetter.regenQuote, sturmQuote: d.wetter.sturmQuote }, wuchs: { decke: d.wuchs.decke, wald: d.wuchs.wald }, wildnis: Object.assign({}, d.wildnis) } };
      try { G.ortGesetz(teil); } catch (e) { nein++; if (!grund) grund = e.message; }
    }
    zeile('erde-29 als Welt-Saat: Land-Ziele ' + land + ' · spendeVerh = ∞ ' + inf + ' · ortGesetz lehnt ab ' + nein + ' · Grund: ' + grund);
  }
}
zeile('## F Zusammenfassung (JSON)');
zeile(JSON.stringify({ STUFE: Object.fromEntries(Object.entries(STUFE).map(([k, v]) => [k, Object.assign({}, v, { meerObj: undefined })])), PUNKT, ORT, RAD }));
