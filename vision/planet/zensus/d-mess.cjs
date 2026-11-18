// Zensus PLANET (d) biom-tag-jahr — die Mess-Probe: Sonnenbahn, Tag-Achsen, Uhr gegen Jahr, Saison-Präsenz, Klima der Heimat,
// Wald (Rauschen gegen Standort). Lädt die Kerne über den absoluten Pfad; die Sonnenbahn (welt-licht.js) und das SAISON_GESETZ
// (foundry-core.js) als Quelltext-Ausschnitt der Datei (der Kern lädt ohne THREE nicht) — dieselben Bytes, kein Nachbau.
// Aufruf: node d-mess.cjs   (nur lesen, nichts schreiben)
'use strict';
const fs = require('fs');
const path = require('path');
const ROOT = '/home/user/AnazhRealm';
require(path.join(ROOT, 'gelaende-core.js'));
require(path.join(ROOT, 'phyto-core.js'));
require(path.join(ROOT, 'tetrapoda-core.js'));
require(path.join(ROOT, 'koerper-core.js'));
require(path.join(ROOT, 'klang-core.js'));
const G = globalThis.__gelaendeCore;
const P = globalThis.__phytoCore;
const T = globalThis.__tetrapodaCore;
const K = globalThis.__koerperCore;
const C = globalThis.__klangCore;
const RN = require(path.join(ROOT, 'vendor', 'simplex-noise.js'));
const SN = RN.SimplexNoise || RN.default || RN;

const DEG = 180 / Math.PI;
const r = (v, n) => +v.toFixed(n === undefined ? 3 : n);
const aus = (titel, obj) => console.log(titel.padEnd(34) + JSON.stringify(obj));
function zwischen(text, a, b) {
  const i = text.indexOf(a);
  if (i < 0) throw new Error('Ausschnitt fehlt: ' + a);
  const j = text.indexOf(b, i + a.length);
  if (j < 0) throw new Error('Ende fehlt: ' + b);
  return text.slice(i, j);
}

// ---------- 1 die Sonnenbahn (welt-licht.js:699-722) und die EINE Tag-Achse (:728-761) ----------
const WL = fs.readFileSync(path.join(ROOT, 'welt-licht.js'), 'utf8');
const bahnSrc = zwischen(WL, 'function sonnenWinkel(t) {', '// DIE EINE TAG-ACHSE');
const S = new Function(bahnSrc + '\nreturn { sonnenWinkel, sonnenRichtung, mondRichtung };')();
const grenzSrc = zwischen(WL, 'const GRENZGROESSE = Object.freeze(', '// MONDLICHT');
const nachtGradTxt = zwischen(WL, 'nachtGrad: ', ',').slice('nachtGrad: '.length);
const achseSrc = zwischen(WL, 'function tagAchse(e) {', '// Halb-Float');
const tagAchse = new Function(
  grenzSrc + '\nconst BELICHTUNG = { nachtGrad: ' + Number(nachtGradTxt) + ' };\n' + achseSrc + '\nreturn tagAchse;'
)();
const richtung = (t) => S.sonnenRichtung(S.sonnenWinkel(t));
const hoeheGrad = (t) => Math.asin(richtung(t)[1]) * DEG;
const azGrad = (t) => {
  const [x, , z] = richtung(t);
  return Math.atan2(z, x) * DEG;
};
// die Uhr t (Vormittag 0 … 0,5), an der die Sonnenhöhe sin = s erreicht (Bisektion auf der steigenden Bahn)
function uhrZu(s) {
  let a = 0, b = 0.5;
  for (let i = 0; i < 60; i++) {
    const m = (a + b) / 2;
    if (richtung(m)[1] < s) a = m;
    else b = m;
  }
  return (a + b) / 2;
}
const uhrText = (t) => {
  const h = Math.floor(t * 24), m = Math.round((t * 24 - h) * 60);
  return String(h).padStart(2, '0') + ':' + String(m).padStart(2, '0');
};
console.log('# 1 die Sonnenbahn der Welt (welt-licht.js sonnenWinkel/sonnenRichtung)');
let maxH = -99, maxT = 0;
for (let i = 0; i <= 10000; i++) {
  const t = i / 10000, h = hoeheGrad(t);
  if (h > maxH) { maxH = h; maxT = t; }
}
const auf = uhrZu(0), unter = 1 - auf; // die Bahn ist in y symmetrisch um den Mittag (y = sin w / l, l gerade um w = π/2? geprüft unten)
let unterMess = 0.5;
{ let a = 0.5, b = 1; for (let i = 0; i < 60; i++) { const m = (a + b) / 2; if (richtung(m)[1] > 0) a = m; else b = m; } unterMess = (a + b) / 2; }
aus('Mittag t 0,5', { hoeheGrad: r(hoeheGrad(0.5), 2), richtung: richtung(0.5).map((v) => r(v, 4)) });
aus('Gipfel der Bahn', { t: r(maxT, 4), uhr: uhrText(maxT), hoeheGrad: r(maxH, 2) });
aus('Aufgang/Untergang', { auf: r(auf, 5), aufUhr: uhrText(auf), unter: r(unterMess, 5), unterUhr: uhrText(unterMess), lichtStunden: r((unterMess - auf) * 24, 3) });
aus('Azimut Auf/Unter (atan2 z,x)', { auf: r(azGrad(auf), 2), unter: r(azGrad(unterMess), 2), nichtGegenueberGrad: r(180 - Math.abs(azGrad(unterMess) - azGrad(auf)), 2) });
const h = [0, 0.125, 0.25, 0.3, 0.375, 0.5, 0.625, 0.7, 0.75, 0.875].map((t) => [t, r(hoeheGrad(t), 2)]);
aus('Höhe je Uhr [t, Grad]', h);
// die Mitternacht: sonnenRichtung ist 4π-periodisch in w (z = 0,4 sin(w/2)), die Uhr 2π — der Sprung bei t 1 → 0
const vor = richtung(1 - 1e-9), nach = richtung(0);
const sprung = Math.acos(vor[0] * nach[0] + vor[1] * nach[1] + vor[2] * nach[2]) * DEG;
const mondVor = S.mondRichtung(S.sonnenWinkel(1 - 1e-9)), mondNach = S.mondRichtung(S.sonnenWinkel(0));
aus('Sprung um Mitternacht', { sonneVor: vor.map((v) => r(v, 3)), sonneNach: nach.map((v) => r(v, 3)), winkelGrad: r(sprung, 2), mondHoeheGrad: r(Math.asin(mondNach[1]) * DEG, 2), mondVor: mondVor.map((v) => r(v, 3)), mondNach: mondNach.map((v) => r(v, 3)) });
const aeqBreite = 90 - hoeheGrad(0.5);
aus('äquivalente Breite (Tag-und-Nacht-Gleiche)', { phiGrad: r(aeqBreite, 2) });
// zum Vergleich: die Bahn nach Meeus Kap. 13 (sin h = sin φ sin δ + cos φ cos δ cos H), δ = ±ε, ε = PLANET_ERDE.neigungRad
const eps = 0.4091; // planet-core.js:263
const meeus = (phiG) => {
  const phi = phiG / DEG;
  const zeile = (delta) => {
    const mittag = Math.asin(Math.sin(phi) * Math.sin(delta) + Math.cos(phi) * Math.cos(delta)) * DEG;
    const ch = -Math.tan(phi) * Math.tan(delta);
    const H0 = Math.acos(Math.max(-1, Math.min(1, ch)));
    return { mittagGrad: r(mittag, 1), lichtStunden: r((2 * H0 * DEG) / 15, 2) };
  };
  return { phiGrad: phiG, sommer: zeile(eps), gleiche: zeile(0), winter: zeile(-eps) };
};
aus('Meeus bei der äquiv. Breite', meeus(r(aeqBreite, 1)));
aus('Meeus bei 47° (gemäßigt)', meeus(47));

// ---------- 2 die Tag-Achsen: die EINE (welt-licht tagAchse) und ihre Zwillinge mit eigenen Schwellen ----------
console.log('# 2 die Tag-Achsen — Schwelle als Sonnenhöhe und als Uhr am Morgen (auf der gesetzten Bahn)');
const sinZuGrad = (s) => r(Math.asin(s) * DEG, 2);
const zeile2 = (name, s, ort) => aus(name, { sin: s, grad: sinZuGrad(s), morgenUhr: uhrText(uhrZu(s)), ort });
const A0 = tagAchse(0), A6 = tagAchse(Math.sin(-6 / DEG));
aus('EINE tagAchse nacht 0 / 1', { nachtBeiNull: r(A0.nacht, 3), nachtBeiMinus6: r(A6.nacht, 3), tagBei0: r(A0.tag, 3), tagBeiMinus32: r(tagAchse(Math.sin(-32 / DEG)).tag, 3), ort: 'welt-licht.js:728' });
zeile2('tagAchse.nacht Beginn (0°)', 0, 'welt-licht.js:758');
zeile2('tagAchse.nacht voll (−6°)', Math.sin(-6 / DEG), 'welt-licht.js:749');
zeile2('tagAchse.tag Null (−32°)', Math.sin(-32 / DEG), 'welt-licht.js:87');
const VH = T.VERHALTEN.stimmung.schwellen.nachtSin, DS = T.ETHOGRAMM_GESETZ && T.ETHOGRAMM_GESETZ.daemmerSin;
const LE = (() => { for (const k of Object.keys(T)) { const v = T[k]; if (v && typeof v === 'object' && Number.isFinite(v.daemmerSin)) return v; } return null; })();
zeile2('Tiere lichtPhase nacht→dämmer', VH, 'tetrapoda-core.js:131');
zeile2('Tiere lichtPhase dämmer→tag', LE ? LE.daemmerSin : DS, 'tetrapoda-core.js:2118');
const chor = T.VOGEL_GESETZ.lied.chor;
aus('Vögel Morgenchor Stützen', { stuetzen: chor.map((p) => [p[0], sinZuGrad(p[0]), uhrText(uhrZu(p[0])), p[1]]), ort: 'tetrapoda-core.js:2381' });
zeile2('Vogel-Schwarm sonneMin', T.VOGEL_GESETZ.schwarm.sonneMin, 'tetrapoda-core.js:2458');
aus('Bestäuber sonne Stützen', { stuetzen: T.BESTAEUBER_GESETZ.sonne.map((p) => [p[0], sinZuGrad(p[0]), uhrText(uhrZu(p[0])), p[1]]), ort: 'tetrapoda-core.js:2916' });
const grille = (() => {
  const seen = new Set();
  const such = (o, tiefe) => {
    if (!o || typeof o !== 'object' || seen.has(o) || tiefe > 6) return null;
    seen.add(o);
    if (Number.isFinite(o.nachtAb) && Number.isFinite(o.nachtVoll)) return o;
    for (const k of Object.keys(o)) { const f = such(o[k], tiefe + 1); if (f) return f; }
    return null;
  };
  return such(C, 0);
})();
if (grille) {
  zeile2('Grille nachtAb', grille.nachtAb, 'klang-core.js:492');
  zeile2('Grille nachtVoll', grille.nachtVoll, 'klang-core.js:492');
}
// die Uhr-Achsen (Stunde statt Sonnenhöhe): die Etikette der Anzeige und der Tagesplan der Bewohner
const tL = [0.22, 0.35, 0.65, 0.85];
aus('Anzeige-Etikett Grenzen', { grenzen: tL.map((t) => [t, uhrText(t), r(hoeheGrad(t), 2)]), ort: 'stamm/bild-himmel.js:2762-2768' });
const TG = K.TAGES_GESETZ;
aus('Bewohner TAGES_GESETZ', { wach: [TG.wach, r(hoeheGrad(TG.wach / 24), 2)], werk: TG.werk.map((s) => [s, r(hoeheGrad(s / 24), 2)]), ruhe: [TG.ruhe, r(hoeheGrad(TG.ruhe / 24), 2)], ort: 'koerper-core.js:5126-5130' });
const TP = G.TEMPERATUR;
aus('Temperatur Tagesgipfel', { tagGipfel: TP.tagGipfel, uhr: uhrText(TP.tagGipfel), hoeheGrad: r(hoeheGrad(TP.tagGipfel), 2), ort: 'gelaende-core.js:1318' });

// ---------- 3 Uhr gegen Jahr: die Längen der Zeit ----------
console.log('# 3 Uhr, Tag und Jahr — Sekunden der Welt-Uhr');
const jahrS = 2400; // stamm/dirigent-kern.js:311
const tagMin = [1, 60, 60]; // DAY_LENGTH_MIN/MAX/DEFAULT (stamm/daten.js:146-161)
const pegelTagS = 60 * 60; // PEGEL_TAG_S = DEFAULT · 60 (stamm/daten.js:165-167)
aus('Jahr', { jahrS, saisonS: jahrS / 4, kartenStufeS: jahrS / 32 });
aus('Tag der Uhr (Regler)', { minS: Math.max(60, tagMin[0] * 60), maxS: tagMin[1] * 60, standardS: tagMin[2] * 60 });
aus('Jahr in Tagen der Uhr', { beiMinTag: r(jahrS / 60, 2), beiStandardTag: r(jahrS / 3600, 4) });
aus('Tag der Prozesse (PEGEL_TAG_S)', { s: pegelTagS, jahrInProzessTagen: r(jahrS / pegelTagS, 4) });
const jT = TP.jahrTage;
aus('Tag im Jahr der Temperatur', { jahrTage: jT, sJeTag: r(jahrS / jT, 4), sJeWeltStundeDerSaison: r(jahrS / (jT * 24), 4), verhaeltnisUhrTagZuTempTag: r(3600 / (jahrS / jT), 1) });
// die Trägheit: dieselbe τ (Tage) gegen die Tag-Welle (Periode = Tag der Uhr) und die Jahres-Welle (Periode = 2400 s / 365 Tage)
const tau = grille && Number.isFinite(grille.traegTage) ? grille.traegTage : 0.17;
const welle = (perioden) => { const wt = 2 * Math.PI * tau * perioden; return { daempfung: r(1 / Math.sqrt(1 + wt * wt), 4), spaetGrad: r(Math.atan(wt) * DEG, 2) }; };
aus('Trägheit τ der Grille (Tage)', { tau, tagWelle: welle(1), jahrWelle: welle(1 / jT), tauEchtzeitTagwelleS: r(tau * 3600, 1), tauEchtzeitJahrwelleS: r(tau * (jahrS / jT), 3) });

// ---------- 4 die Saison: Präsenz und Tönung (SAISON_GESETZ, foundry-core.js:253) über die Lage (stamm/bild-himmel.js:3307) ----------
console.log('# 4 die Saison — Präsenz (Laub, Blüte, Halm) und Tönung je Welt-Phase');
const FC = fs.readFileSync(path.join(ROOT, 'foundry-core.js'), 'utf8');
const SG = new Function(zwischen(FC, 'var SAISON_GESETZ = {', 'var __terrainCore') + '\nreturn SAISON_GESETZ;')();
const lage = (phase) => { const f = ((((phase - 0.125) % 1) + 1) % 1) * 4, i = Math.floor(f) % 4; return { a: SG.stuetzen[i], b: SG.stuetzen[(i + 1) % 4], k: f - Math.floor(f) }; };
const kanal = (hex, s) => ((hex >> s) & 255) / 255;
const name = (p) => (p < 0.25 ? 'spring' : p < 0.5 ? 'summer' : p < 0.75 ? 'autumn' : 'winter');
for (const ph of [0, 0.125, 0.25, 0.375, 0.5, 0.625, 0.75, 0.875]) {
  const { a, b, k } = lage(ph);
  const mul = [16, 8, 0].map((s) => { const v = (kanal(a.ti, s) + (kanal(b.ti, s) - kanal(a.ti, s)) * k) / Math.max(kanal(SG.bau, s), 1e-3); return r(Math.min(SG.mulMax, Math.max(SG.mulMin, v)), 3); });
  const L = G.lageAus({ seed: 'anazh-realm-seed', baseHeight: 0, waterLevel: -3, ort: null, erbgut: { terme: G.erbgutNormal(undefined), wildnis: 1 }, regionSize: 2048 }, SN);
  const tMeer = G.temperaturAus(G.temperaturFeld(L, -3, 0), ph, 0.5);
  aus('Phase ' + ph, { name: name(ph), laub: r(a.pr + (b.pr - a.pr) * k, 3), bluete: r(a.bl + (b.bl - a.bl) * k, 3), halm: r(a.ha + (b.ha - a.ha) * k, 3), mul, tMeerMittagC: r(tMeer, 2) });
}

// ---------- 5 das Klima der Heimat und der Wuchs des Orts (gelaende-core ortGesetz) ----------
console.log('# 5 das Klima der Heimat → der Wuchs des Orts');
const H = G.ortGesetz(null);
aus('Heimat klimaHeute', { sommer: H.klimaHeute.sommer, winter: H.klimaHeute.winter, jahresMittel: (H.klimaHeute.sommer + H.klimaHeute.winter) / 2, spendeMm: r(H.klimaHeute.spendeMm, 1), kuehlungKJeM: r(H.kuehlungKJeM, 5) });
aus('Heimat wuchs', Object.fromEntries(Object.entries(H.wuchs).map(([k, v]) => [k, r(v, 4)])));
aus('0-°C-Linie Sommermittel', { ueberMeerM: r(H.klimaHeute.sommer / H.kuehlungKJeM, 2), schneeBandMitte: (G.SCHNEE.start + G.SCHNEE.voll) / 2 });

// ---------- 6 der Wald der Heimat: was die Geburt und die Art wählt (Saat anazh-realm-seed, ±2 km, 100-m-Raster) ----------
console.log('# 6 der Wald — Geburt und Artenwahl an 1 681 Orten der Heimat (±2 km)');
const seed = 'anazh-realm-seed';
const L = G.lageAus({ seed, baseHeight: 0, waterLevel: -3, ort: null, erbgut: { terme: G.erbgutNormal(undefined), wildnis: 1 }, regionSize: 2048 }, SN);
const wald = new SN(seed + ':forest');
const fbm = (px, pz) => { const a = (wald.noise2D(px, pz) + 1) * 0.5, b = (wald.noise2D(px * 2.7 + 11.3, pz * 2.7 - 5.9) + 1) * 0.5; return a * 0.65 + b * 0.35; }; // stamm/vegetation-wiese.js:2528
const stand = (x, z) => wald.noise2D(x * 0.006, z * 0.006); // stamm/vegetation-wiese.js:2431, PLACEMENT_DENSITY.forestFreq 0.006
const ss = (a, b, v) => { let t = (v - a) / (b - a); t = t < 0 ? 0 : t > 1 ? 1 : t; return t * t * (3 - 2 * t); };
// die Feuchte ohne den Fluss-Term: nur das Höhen-Band über dem Meer (stamm/gelaende-boden.js:1555-1559, FEUCHTE :3221-3225)
const feuchteHoehe = (above) => ss(0, 1, (7 - above) / (7 - 1.5)) * 0.85;
const pts = [];
for (let i = -20; i <= 20; i++)
  for (let j = -20; j <= 20; j++) {
    const x = i * 100 + 13.7, z = j * 100 - 7.3;
    const y = G.hoehe(L, x, z, true);
    const gx = (G.hoehe(L, x + 1, z, true) - G.hoehe(L, x - 1, z, true)) / 2;
    const gz = (G.hoehe(L, x, z + 1, true) - G.hoehe(L, x, z - 1, true)) / 2;
    pts.push({ x, z, y, slope: Math.hypot(gx, gz) });
  }
const F = { dryScale: 40, slopeLo: 0.35, slopeHi: 1.25 }; // stamm/vegetation-wiese.js:3265-3267
let land = 0, lichtungNull = 0, lichtungHalb = 0, grenzeHalb = 0, hangHalb = 0, geburtSum = 0, geburtMitSum = 0;
const P0 = [], noNoise = [], noSite = [];
const rows = [];
for (const p of pts) {
  const above = p.y - L.waterLevel;
  if (above <= 0.4) continue; // phyto-core.js:3663
  land++;
  const sd = P.forestStandDensity(fbm, p.x, p.z);
  const st = stand(p.x, p.z);
  const li = P.forestLichtung(st);
  const ge = P.forestGeburt(sd) * li;
  const sch = G.schnee(L, p.y, p.x, p.z, 0);
  const wg = P.forestWaldgrenze(sch, 1);
  const hang = 1 - ss(F.slopeLo, F.slopeHi, p.slope);
  if (li === 0) lichtungNull++;
  if (li < 0.5) lichtungHalb++;
  if (wg < 0.5) grenzeHalb++;
  if (hang < 0.5) hangHalb++;
  geburtSum += ge;
  geburtMitSum += ge * wg * hang;
  const relH = p.y - 0;
  const dry = Math.min(1, Math.max(0, (relH + 6) / F.dryScale));
  const feu = feuchteHoehe(above);
  const clim = fbm(p.x * 0.012 + 50, p.z * 0.012 + 9);
  const patch = fbm(p.x * 0.05 + 200, p.z * 0.05 + 90);
  rows.push({ clim, patch, dry, feu, open: 1 - sd });
}
const mittel = (k) => rows.reduce((s, q) => s + q[k], 0) / rows.length;
const mC = mittel('clim'), mP = mittel('patch'), mD = mittel('dry'), mF = mittel('feu');
const verteilung = (q) => {
  const w = P.forestNicheWeights(q.clim, q.dry, q.feu, q.open, q.patch);
  const v = [w.wF, w.wT, w.wE, w.wB, w.wW + q.feu * q.feu * 6.0]; // phyto-core.js:3085
  const s = v.reduce((a, b) => a + b, 0);
  return v.map((x) => x / s);
};
const tv = (a, b) => 0.5 * a.reduce((s, x, i) => s + Math.abs(x - b[i]), 0);
let tvNoise = 0, tvSite = 0, argNoise = 0, argSite = 0;
const arg = (v) => v.indexOf(Math.max(...v));
const anteil = [0, 0, 0, 0, 0];
for (const q of rows) {
  const p0 = verteilung(q);
  const pN = verteilung(Object.assign({}, q, { clim: mC, patch: mP }));
  const pS = verteilung(Object.assign({}, q, { dry: mD, feu: mF }));
  p0.forEach((v, i) => (anteil[i] += v / rows.length));
  tvNoise += tv(p0, pN) / rows.length;
  tvSite += tv(p0, pS) / rows.length;
  if (arg(p0) !== arg(pN)) argNoise++;
  if (arg(p0) !== arg(pS)) argSite++;
}
aus('Land (über Wasser + 0,4 m)', { orte: pts.length, land, landAnteil: r(land / pts.length, 3), hoeheMin: r(Math.min(...pts.map((p) => p.y)), 1), hoeheMax: r(Math.max(...pts.map((p) => p.y)), 1) });
aus('Geburt: Faktoren < 0,5 (Anteil Land)', { lichtungNull: r(lichtungNull / land, 3), lichtungUnterHalb: r(lichtungHalb / land, 3), waldgrenzeUnterHalb: r(grenzeHalb / land, 3), hangUnterHalb: r(hangHalb / land, 3) });
aus('Geburt im Mittel', { rauschenAllein: r(geburtSum / land, 3), mitWaldgrenzeUndHang: r(geburtMitSum / land, 3) });
aus('Artenwahl Mittel [F,T,E,B,W]', anteil.map((v) => r(v, 3)));
aus('Artenwahl: wer bewegt sie', { tvRauschen_clim_patch: r(tvNoise, 3), tvStandort_dry_feu: r(tvSite, 3), argmaxWechselRauschen: r(argNoise / rows.length, 3), argmaxWechselStandort: r(argSite / rows.length, 3), mittelClim: r(mC, 3), mittelPatch: r(mP, 3), mittelDry: r(mD, 3), mittelFeu: r(mF, 3) });
