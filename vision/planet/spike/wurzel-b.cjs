'use strict';
// Wurzel der Höhen-Sprünge (spike.md §b): welcher Zweig von punktRoh springt an einer Platten- oder Krusten-Querung?
// Der Kern wird NICHT verändert: dieses Skript liest planet-core.js (wie lib.cjs), setzt fünf Mess-Zeilen in eine KOPIE im
// Temp-Verzeichnis (jede Ersetzung muss genau einmal treffen, sonst Bruch beim Namen) und lädt die Kopie. Gemessen je Seite der
// Querung: aufKruste (K1, :1352), Wertung best, Zweig g2 (:1371–1373), Abstand mHaupt vor und nach der Versatz-Treppe (:1375–1393).
// Aufruf: node wurzel-b.cjs platte|kruste [querungen]   → wurzel-b-<art>.out.txt (stdout)
const fs = require('fs'), os = require('os'), path = require('path');
const KERN = process.env.PLANET_KERN ? path.resolve(process.env.PLANET_KERN) : path.resolve(__dirname, '..', '..', '..', '..', 'AnazhRealm', 'planet-core.js');
let s = fs.readFileSync(KERN, 'utf8');
function rep(a, b) { const n = s.split(a).length - 1; if (n !== 1) throw new Error('wurzel-b: Mess-Zeile trifft ' + n + '× statt 1×: ' + a.slice(0, 60)); s = s.replace(a, b); }
rep('    let own = aufKruste ? gK : W_.best;\n', '    let own = aufKruste ? gK : W_.best;\n    const _d = (S === globalThis.__PKD_S) ? globalThis.__PKD : {}; _d.aufKruste = aufKruste; _d.gK = gK; _d.best = W_.best; _d.zweit = W_.zweit; _d.g2zweig = 0; _d.swap = 0; _d.dlt = 0; _d.div = 0;\n');
rep('      if (dO < mHaupt) { sec = g2; mHaupt = dO; } else { RX.j = g2; RX.x = dO; }', '      if (dO < mHaupt) { sec = g2; mHaupt = dO; _d.g2zweig = 1; } else { RX.j = g2; RX.x = dO; _d.g2zweig = 2; }');
rep('    // Versatz-Treppe des Rückens am Haupt-Paar\n', '    _d.own0 = own; _d.sec0 = sec; _d.m0 = mHaupt;\n    // Versatz-Treppe des Rückens am Haupt-Paar\n');
rep('          if (m2 < 0 && !aufKruste) { const t2 = own; own = sec; sec = t2; mHaupt = -m2; } else mHaupt = Math.max(0, m2);', '          _d.dlt = dlt; _d.div = div; if (m2 < 0 && !aufKruste) { const t2 = own; own = sec; sec = t2; mHaupt = -m2; _d.swap = 1; } else { mHaupt = Math.max(0, m2); if (m2 < 0) _d.swap = 2; }');
rep('    PK.platte = own; PK.nachbar = sec;\n', '    PK.platte = own; PK.nachbar = sec; _d.own = own; _d.sec = sec; _d.m = mHaupt;\n');
const kopie = path.join(fs.mkdtempSync(path.join(os.tmpdir(), 'wurzel-b-')), 'planet-core.js');
fs.writeFileSync(kopie, s);
process.env.PLANET_KERN = kopie;
const L = require('./lib.cjs'); const { P } = L;
const same = 'erde-01', plan = L.planVon(same, L.erdKoerper()), S = P.planetScheibe(plan, 0), R = S.R;
globalThis.__PKD = {}; globalThis.__PKD_S = S;
const pp = {};
function auf(u) { const h = P.planetPunktR(S, u[0], u[1], u[2], 16, pp); return Object.assign({ h, platte: pp.platte, scholle: pp.scholle, kruste: pp.kruste, rand: pp.randAbstandKm, randArt: pp.randArt }, globalThis.__PKD); }
const rnd = L.zufall('b|' + same), u = new Float64Array(3), t = new Float64Array(3), v = new Float64Array(3), m = new Float64Array(3), lo = new Float64Array(3), hi = new Float64Array(3);
const d0 = 20 / R, cm = 1e-5 / R; const ART = process.argv[2] || 'platte', ZIEL = +(process.argv[3] || 400);
const funde = []; let paare = 0;
while (funde.length < ZIEL && paare < 400000) {
  paare++; L.einheit(rnd, u); L.zufallsTangente(u, rnd, t); L.verschiebe(u, t, d0, v);
  const ku = auf(u)[ART], kv = auf(v)[ART]; if (ku === kv) continue;
  let a = 0, b = d0; while ((b - a) > cm) { const c = 0.5 * (a + b); L.verschiebe(u, t, c, m); if (auf(m)[ART] === ku) a = c; else b = c; }
  L.verschiebe(u, t, a, lo); L.verschiebe(u, t, a + cm, hi); const A = auf(lo), B = auf(hi);
  funde.push({ A, B, dh: Math.abs(B.h - A.h) });
}
const spr = funde.filter(f => f.dh > 0.01), glatt = funde.filter(f => f.dh <= 0.01);
const zaehl = (L_, f) => L_.filter(f).length;
function bild(L_, name) {
  console.log(name + ' n ' + L_.length + ' · aufKruste wechselt ' + zaehl(L_, f => f.A.aufKruste !== f.B.aufKruste) + ' · Wertung best wechselt ' + zaehl(L_, f => f.A.best !== f.B.best) + ' · g2-Zweig verschieden ' + zaehl(L_, f => f.A.g2zweig !== f.B.g2zweig) + ' · Treppe tauscht (eine Seite) ' + zaehl(L_, f => (f.A.swap === 1) !== (f.B.swap === 1)) + ' · Treppe gedeckelt (m2<0 auf Kruste, eine Seite) ' + zaehl(L_, f => (f.A.swap === 2) !== (f.B.swap === 2)) + ' · Treppe aktiv (div>0) ' + zaehl(L_, f => f.A.div > 0 || f.B.div > 0) + ' · |Δm| > 1 km ' + zaehl(L_, f => Math.abs(f.A.m - f.B.m) > 1) + ' · |Δm0| > 1 km ' + zaehl(L_, f => Math.abs(f.A.m0 - f.B.m0) > 1) + ' · Partner-Paar gleich {own,sec} ' + zaehl(L_, f => (f.A.own === f.B.sec && f.A.sec === f.B.own)) + ' · m beidseits < 100 km ' + zaehl(L_, f => f.A.m < 100 && f.B.m < 100));
}
console.log('wurzel-b · Original ' + path.basename(KERN) + ' sha256:' + require('crypto').createHash('sha256').update(fs.readFileSync(KERN)).digest('hex').slice(0, 16) + ' · gemessen an der Kopie ' + L.kopf('').trim() + ' · Art ' + ART + ' · Same ' + same);
bild(spr, 'SPRUNG'); bild(glatt, 'STETIG');
const kl = { abstand: spr.filter(f => Math.abs(f.A.m - f.B.m) > 1), treppe: spr.filter(f => Math.abs(f.A.m - f.B.m) > 1 && !(Math.abs(f.A.m0 - f.B.m0) > 1)), entscheid: spr.filter(f => Math.abs(f.A.m0 - f.B.m0) > 1), rest: spr.filter(f => !(Math.abs(f.A.m - f.B.m) > 1)) };
for (const [n, l] of Object.entries(kl)) console.log('KLASSE ' + n + ' n ' + l.length + ' · |Δh| Median ' + L.median(l.map(f => f.dh)).toFixed(1) + ' m · max ' + Math.max(0, ...l.map(f => f.dh)).toFixed(1) + ' m · Land ' + l.filter(f => f.A.h > 0 || f.B.h > 0).length + ' · aufKruste wechselt ' + l.filter(f => f.A.aufKruste !== f.B.aufKruste).length + ' · m beidseits ≥ 100 km (ohne Naht) ' + l.filter(f => f.A.m >= 100 && f.B.m >= 100).length);

for (const f of spr.slice(0, 12)) console.log(' dh ' + f.dh.toFixed(1) + ' m · A ' + JSON.stringify({ p: f.A.platte, k: f.A.kruste, auf: f.A.aufKruste, best: f.A.best, gK: f.A.gK, g2: f.A.g2zweig, own0: f.A.own0, sec0: f.A.sec0, m0: +f.A.m0.toFixed(2), swap: f.A.swap, dlt: +f.A.dlt.toFixed(2), own: f.A.own, sec: f.A.sec, m: +f.A.m.toFixed(2) }) + ' · B ' + JSON.stringify({ p: f.B.platte, k: f.B.kruste, auf: f.B.aufKruste, best: f.B.best, gK: f.B.gK, g2: f.B.g2zweig, own0: f.B.own0, sec0: f.B.sec0, m0: +f.B.m0.toFixed(2), swap: f.B.swap, dlt: +f.B.dlt.toFixed(2), own: f.B.own, sec: f.B.sec, m: +f.B.m.toFixed(2) }));
