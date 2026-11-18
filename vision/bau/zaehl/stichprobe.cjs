#!/usr/bin/env node
// stichprobe.cjs — 30 "GESETZT ohne Anker"-Größen der Tafel (tafel.md Teil 1) am Code nachgesehen.
// Fahren: node stichprobe.cjs [WURZEL]   (WURZEL = Lese-Baum, Standard ../../../../n1011-hg, main b7ed8419)
// Je Probe druckt es: (1) die zitierte Zeile und ob der Wert dort steht (Regex), (2) den Kommentar-Kontext def−3 … def+1
// (daran wird "kein Anker" von Hand geurteilt: Norm, Messung, Quelle im Kommentar?), (3) die von der Tafel genannten Leser-Zeilen
// und, wo ein Name trägt, alle Fundstellen des Namens in *.js der Wurzel (ohne node_modules, ohne scripts/ = Spiel-Code) außer der Def-Zeile.
// Auswahl gewählt: 1–6 je Domäne, gestreut über Tabellen-Zeilen, bevorzugt Zeilen mit Leser-Behauptung "0 Leser"/"nur Labor".
// Kein Rückfall: fehlt eine Datei, WIRFT es.
'use strict';
const fs = require('fs');
const path = require('path');
const W = path.resolve(process.argv[2] || path.join(__dirname, '../../../../n1011-hg'));
const FC = 'fachwerk-core.js', KC = 'koerper-core.js', SW = 'stamm/siedlung-wege.js';
const P = [
  // [Nr, Dom, Name, Tafel-Zeile, Datei, Def-Zeile, Wert-Regex, Leser-Zeilen der Tafel [[datei, zeile]...], Name für Fundstellen | null]
  [1, 'D1', 'LEUTE_GESETZ.max 12', 54, FC, 9526, /max: 12\b/, [[FC, 2274], [FC, 9531], [FC, 9537]], null],
  [2, 'D1', 'Packer capK 1,6/1,3/0,55', 56, FC, 2255, /capK|1\.6/, [], 'capK'],
  [3, 'D1', 'Los-Würfel Keller 0,35', 58, FC, 4446, /0\.35/, [[FC, 212]], null],
  [4, 'D1', 'Innenwand 0,12 · Innentür 1,0×2,0', 66, FC, 897, /0\.12/, [[FC, 898]], null],
  [5, 'D1', 'Herd-Körper 1,5 × 1,1', 70, FC, 589, /1\.5|1\.1/, [[FC, 590], [FC, 922], [FC, 1244]], null],
  [6, 'D1', 'TAGES_GESETZ.angebot', 72, KC, 5177, /angebot/, [[KC, 5243]], 'TAGES_GESETZ'],
  [7, 'D2', 'foundH 0,55', 81, FC, 178, /foundH:0\.55/, [[FC, 211]], 'foundH'],
  [8, 'D2', 'sparH 0,15 (Tafel: 0 Leser)', 83, FC, 180, /sparH:0\.15/, [], 'sparH'],
  [9, 'D2', 'jetty 0,0 (Tafel: 0 Leser, tot)', 85, FC, 171, /jetty:0\.0/, [], 'jetty'],
  [10, 'D2', 'bayMax 1,7', 84, FC, 181, /bayMax:1\.7/, [[FC, 420]], 'bayMax'],
  [11, 'D2', 'Diele 0,06 × 0,28', 92, FC, 860, /0\.06|0\.28/, [[FC, 861]], null],
  [12, 'D2', 'Tempel-Modul D 0,85 (kein Spiel-Pfad)', 98, 'stamm/bau-teile.js', 1296, /0\.85/, [[ 'stamm/bau-teile.js', 1298]], null],
  [13, 'D3', 'winEG/winOG off·ch', 107, FC, 476, /off:0\.95,ch:0\.95/, [[FC, 491], [FC, 495]], null],
  [14, 'D3', 'Flügel-Öffnung 0,62 rad', 111, FC, 1084, /0\.62/, [[FC, 1089], [FC, 339], [FC, 2788]], null],
  [15, 'D3', 'FENSTER_SCHLAF 0,45', 114, FC, 2751, /FENSTER_SCHLAF = 0\.45/, [[FC, 2758]], 'FENSTER_SCHLAF'],
  [16, 'D3', 'Möbel-Freizone vor Fenster 0,40', 116, FC, 634, /0\.4/, [[FC, 635]], null],
  [17, 'D4', 'ovEave 0,42 · ovRake 0,32', 135, FC, 181, /ovEave:0\.42, ovRake:0\.32/, [[FC, 707], [FC, 1800]], 'ovEave'],
  [18, 'D4', 'Kniestock 1,15', 144, FC, 887, /1\.15/, [], null],
  [19, 'D4', 'STIL_GRENZNEIGUNG', 134, FC, 160, /STIL_GRENZNEIGUNG = \{ modern: 14/, [[FC, 208], [FC, 2230]], 'STIL_GRENZNEIGUNG'],
  [20, 'D4', 'Kamin STACK_W 0,84', 149, FC, 919, /STACK_W|0\.84/, [[FC, 932]], 'STACK_W'],
  [21, 'D4', 'NAESSE dachPlätze 8/64/4', 151, 'stamm/stoff-material.js', 3793, /NAESSE|dach/, [], 'NAESSE'],
  [22, 'D5', 'DEFCOL 15 Hex', 162, FC, 2119, /DEFCOL=\{holz:0x5a4632/, [], 'DEFCOL'],
  [23, 'D5', 'NOISEAMP 18 Rollen', 172, FC, 2320, /NOISEAMP=\{putz:0\.07/, [[FC, 2426], [FC, 2468]], 'NOISEAMP'],
  [24, 'D5', 'WEG_GESETZ.ton', 175, FC, 10099, /fahr: 0\.84/, [[SW, 1376]], null],
  [25, 'D5', 'Zaun-Holz 0x6a4e32', 179, SW, 2731, /0x6a4e32/, [], null],
  [26, 'D6', 'DORF_NORM gap … budget 170000 (budget tot)', 194, FC, 3649, /budget:170000/, [[FC, 5358]], 'DORF_NORM\\.budget'],
  [27, 'D6', 'STADT_NETZ tore 5 …', 191, FC, 3819, /tore: 5/, [], 'STADT_NETZ'],
  [28, 'D6', 'ORT_SIEDLUNG mensch/naehrt', 208, 'gelaende-core.js', 5762, /ORT_SIEDLUNG/, [['stamm/siedlung-ort.js', 1431], ['stamm/siedlung-ort.js', 1710]], 'ORT_SIEDLUNG'],
  [29, 'D7', 'STADT_MASSEN einzugM 4,2 …', 222, FC, 4072, /einzugM: 4\.2/, [[FC, 4492], [FC, 4494]], 'STADT_MASSEN'],
  [30, 'D7', 'WELT_MARCH satzPx 16 …', 220, 'stamm/dienst.js', 2322, /satzPx|16/, [['stamm/dienst.js', 739]], 'satzPx'],
];
const cache = {};
function lines(f) { if (!cache[f]) { const p = path.join(W, f); if (!fs.existsSync(p)) throw new Error('fehlt: ' + p); cache[f] = fs.readFileSync(p, 'utf8').split(/\r?\n/); } return cache[f]; }
function alleJs() {
  const out = [];
  (function walk(d) {
    for (const e of fs.readdirSync(d, { withFileTypes: true })) {
      if (e.name === 'node_modules' || e.name.startsWith('.') || e.name === 'scripts' || e.name === 'test' || e.name === 'dist') continue;
      const p = path.join(d, e.name);
      if (e.isDirectory()) walk(p); else if (/\.js$/.test(e.name)) out.push(path.relative(W, p).replace(/\\/g, '/'));
    }
  })(W);
  return out;
}
const JS = alleJs();
const kurz = s => s.trim().replace(/\s+/g, ' ').slice(0, 190);
console.log('Wurzel ' + W + ' · ' + JS.length + ' Spiel-.js-Dateien durchsucht (ohne scripts/, node_modules)');
for (const [nr, d, name, tz, f, z, re, leser, tok] of P) {
  const L = lines(f);
  const def = L[z - 1];
  console.log(`\n#${nr} ${d} ${name} — tafel.md:${tz} · ${f}:${z} · Wert ${re.test(def) ? 'STEHT' : 'FEHLT'} an der Zeile`);
  for (let i = Math.max(1, z - 3); i <= Math.min(L.length, z + 1); i++) console.log(`   ${i === z ? '>' : ' '}${i}: ${kurz(L[i - 1])}`);
  for (const [lf, lz] of leser) console.log(`   Leser ${lf}:${lz}: ${kurz(lines(lf)[lz - 1])}`);
  if (tok) {
    const rx = new RegExp('\\b' + tok + '\\b'); const hits = [];
    for (const g of JS) { const G = lines(g); G.forEach((l, i) => { if (rx.test(l) && !(g === f && i + 1 === z)) hits.push(`${g}:${i + 1}`); }); }
    console.log(`   Fundstellen "${tok}" außer Def: ${hits.length}${hits.length ? ' — ' + hits.slice(0, 14).join(' ') + (hits.length > 14 ? ' …' : '') : ''}`);
  }
}
