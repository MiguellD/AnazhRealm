'use strict';
// Zählung des Planet-Zensus (vision/planet/zensus.md): liest die Leser-Blätter zensus/[a-e]-*.json (Zeile = eine Größe mit
// Wert, Einheit, Ort datei:zeile, Lesern und Urteil), prüft sie und zählt. Schreibt zensus.json (alle Zeilen + die Zählung) und
// zensus-tabelle.md (die Tafel je Domäne). Muster: vision/licht (Daten → Zählung, nichts abgetippt).
// Aufruf: node zaehle.cjs   → zaehle.out.txt
const fs = require('fs'), path = require('path');
const DIR = path.join(__dirname, 'zensus');
const BLAETTER = fs.readdirSync(DIR).filter(f => /^[a-e]-.*\.json$/.test(f)).sort();
const URTEILE = ['folgt', 'gesetzt_anker', 'gesetzt'];
const zeilen = [];
for (const b of BLAETTER) {
  const j = JSON.parse(fs.readFileSync(path.join(DIR, b), 'utf8'));
  if (!Array.isArray(j)) throw new Error(b + ': kein Feld von Zeilen');
  for (const r of j) {
    for (const k of ['id', 'name', 'groesse', 'domaene', 'einheit', 'ort', 'urteil']) if (r[k] === undefined || r[k] === '') throw new Error(b + ' ' + (r.id || '?') + ': Feld ' + k + ' fehlt');
    if (!URTEILE.includes(r.urteil)) throw new Error(b + ' ' + r.id + ': Urteil "' + r.urteil + '" ist keins von ' + URTEILE.join('/'));
    if (!Array.isArray(r.leser)) throw new Error(b + ' ' + r.id + ': leser ist kein Feld');
    zeilen.push(Object.assign({ blatt: b }, r));
  }
}
const ids = new Set(); for (const r of zeilen) { if (ids.has(r.id)) throw new Error('doppelte id ' + r.id); ids.add(r.id); }
// Doppelt GEZÄHLT (dieselbe Stelle von zwei Lesern): Ort-Datei:Zeile UND Größe gleich → nur die erste Zeile zählt
const ortKey = (r) => String(r.ort).split(/[\s–,;(]/)[0] + '|' + r.groesse;
const gesehen = new Map(), doppelt = [];
for (const r of zeilen) { const k = ortKey(r); if (gesehen.has(k)) { r.doppelVon = gesehen.get(k); doppelt.push(r.id + '=' + r.doppelVon); } else gesehen.set(k, r.id); }
// Dieselbe Stelle unter ZWEI Klassen-Namen (zwei Leser, eine Größe): benannt, je Paar geprüft — beide Zeilen müssen an derselben
// Datei:Anfangs-Zeile stehen, sonst bricht die Zählung beim Namen. Gefunden mit der Suche „gleiche Datei:Zeile aus ≥ 2 Blättern".
const GLEICH = {
  b39: 'a40', b40: 'a41', b42: 'a42', b44: 'a48', b49: 'a53', d12: 'a77', e214: 'a78', d5: 'a114', c76: 'b13', c77: 'b14',
  c19: 'b71', d52: 'b77', d11: 'c1', d57: 'c5', d58: 'c11', d13: 'c64', d14: 'c65', d33: 'c83', b21: 'a47', b22: 'a43',
  b9: 'a27', a89: 'd2',
};
const anfang = (r) => { const m = String(r.ort).match(/^([^\s:]+):(\d+)/); return m ? m[1] + ':' + m[2] : null; };
const nachId = new Map(zeilen.map(r => [r.id, r]));
for (const [id, von] of Object.entries(GLEICH)) {
  const r = nachId.get(id), v = nachId.get(von);
  if (!r || !v) throw new Error('GLEICH ' + id + '=' + von + ': Zeile fehlt');
  if (anfang(r) !== anfang(v)) throw new Error('GLEICH ' + id + '=' + von + ': nicht dieselbe Stelle (' + anfang(r) + ' ≠ ' + anfang(v) + ')');
  if (!r.doppelVon) { r.doppelVon = von; doppelt.push(id + '=' + von + ' (Klasse ' + r.groesse + ' = ' + v.groesse + ')'); }
}
const Z = zeilen.filter(r => !r.doppelVon);
const ohneLeser = (r) => r.ohne_leser === true || r.leser.length === 0;
const zaehl = (L, f) => L.filter(f).length;
function zeile(name, L) {
  return name.padEnd(30) + ' Zeilen ' + String(L.length).padStart(4) + ' · folgt ' + zaehl(L, r => r.urteil === 'folgt') + ' · gesetzt mit Anker ' + zaehl(L, r => r.urteil === 'gesetzt_anker') +
    ' · gesetzt ohne Anker ' + zaehl(L, r => r.urteil === 'gesetzt') + ' · Technik ' + zaehl(L, r => r.technik === true) + ' · ohne Leser ' + zaehl(L, ohneLeser) + ' · mit benanntem Zwilling ' + zaehl(L, r => Array.isArray(r.zwilling) && r.zwilling.length > 0);
}
const out = [];
out.push('Blätter: ' + BLAETTER.join(' · ') + ' · Zeilen roh ' + zeilen.length + ' · doppelt gezählte Stelle (gleicher Ort und gleiche Größe) ' + doppelt.length + (doppelt.length ? ' (' + doppelt.join(', ') + ')' : ''));
out.push(zeile('ALLE', Z));
out.push(zeile('ohne Technik', Z.filter(r => r.technik !== true)));
for (const b of BLAETTER) out.push(zeile('  ' + b.replace('.json', ''), Z.filter(r => r.blatt === b)));
const dom = [...new Set(Z.map(r => r.domaene))].sort();
for (const d of dom) out.push(zeile('  Domäne ' + d, Z.filter(r => r.domaene === d)));
// Zwillinge: dieselbe Größe an zwei oder mehr Orten (verschiedene Datei:Zeile), ohne Technik
const gruppen = new Map();
for (const r of Z) { if (r.technik === true) continue; const g = gruppen.get(r.groesse) || []; g.push(r); gruppen.set(r.groesse, g); }
const zw = [...gruppen.entries()].filter(([, g]) => new Set(g.map(r => String(r.ort).split(/[\s–,;(]/)[0])).size > 1);
out.push('Zwillings-Gruppen (dieselbe Größe an ≥ 2 Orten, ohne Technik): ' + zw.length + ' Gruppen, ' + zw.reduce((s, [, g]) => s + g.length, 0) + ' Zeilen');
for (const [g, L] of zw.sort((a, b) => b[1].length - a[1].length)) out.push('  ' + g + ': ' + L.map(r => r.id + ' ' + r.ort.split(/[\s–,;(]/)[0] + ' = ' + String(r.wert).slice(0, 40)).join(' · '));
// Die schärfere Lesart: ZWEI QUELLEN für dieselbe Welt-Größe — die Klasse steht im Kern (planet-core.js) UND in der Heimat
// (jede andere Datei); und Heimat-intern: dieselbe Klasse in ≥ 2 verschiedenen Heimat-Dateien.
const datei = (r) => String(r.ort).split(':')[0];
const pk = zw.filter(([, g]) => g.some(r => datei(r) === 'planet-core.js') && g.some(r => datei(r) !== 'planet-core.js' && datei(r) !== '—'));
const hh = zw.filter(([, g]) => new Set(g.filter(r => datei(r) !== 'planet-core.js').map(datei)).size > 1);
out.push('Zwillinge Kern ↔ Heimat (Klasse im Kern UND in der Heimat): ' + pk.length + ' Klassen, ' + pk.reduce((s, [, g]) => s + g.length, 0) + ' Zeilen — ' + pk.map(([g]) => g).join(', '));
out.push('Zwillinge Heimat ↔ Heimat (Klasse in ≥ 2 Heimat-Dateien): ' + hh.length + ' Klassen, ' + hh.reduce((s, [, g]) => s + g.filter(r => datei(r) !== 'planet-core.js').length, 0) + ' Zeilen — ' + hh.map(([g, L]) => g + ' ' + new Set(L.filter(r => datei(r) !== 'planet-core.js').map(datei)).size).join(', '));
// Dateien, in denen die Größen wohnen
const dateien = {}; for (const r of Z) { const d = String(r.ort).split(':')[0]; dateien[d] = (dateien[d] || 0) + 1; }
out.push('Orte (Datei → Zeilen): ' + Object.entries(dateien).sort((a, b) => b[1] - a[1]).map(([d, n]) => d + ' ' + n).join(' · '));
const zaehlung = {
  zeilen: Z.length, roh: zeilen.length, doppelt: doppelt.length,
  folgt: zaehl(Z, r => r.urteil === 'folgt'), gesetztAnker: zaehl(Z, r => r.urteil === 'gesetzt_anker'), gesetzt: zaehl(Z, r => r.urteil === 'gesetzt'),
  technik: zaehl(Z, r => r.technik === true), ohneLeser: zaehl(Z, ohneLeser), mitZwilling: zaehl(Z, r => Array.isArray(r.zwilling) && r.zwilling.length > 0),
  zwillingsGruppen: zw.length, zwillingsZeilen: zw.reduce((s, [, g]) => s + g.length, 0),
  zwillingeKernHeimat: { klassen: pk.length, zeilen: pk.reduce((s, [, g]) => s + g.length, 0), namen: pk.map(([g]) => g) },
  zwillingeHeimatHeimat: { klassen: hh.length, zeilen: hh.reduce((s, [, g]) => s + g.filter(r => datei(r) !== 'planet-core.js').length, 0), namen: hh.map(([g]) => g) },
  ohneTechnik: { zeilen: zaehl(Z, r => r.technik !== true), folgt: zaehl(Z, r => r.technik !== true && r.urteil === 'folgt'), gesetztAnker: zaehl(Z, r => r.technik !== true && r.urteil === 'gesetzt_anker'), gesetzt: zaehl(Z, r => r.technik !== true && r.urteil === 'gesetzt'), ohneLeser: zaehl(Z, r => r.technik !== true && ohneLeser(r)) },
  jeDomaene: Object.fromEntries(dom.map(d => { const L = Z.filter(r => r.domaene === d); return [d, { zeilen: L.length, folgt: zaehl(L, r => r.urteil === 'folgt'), gesetztAnker: zaehl(L, r => r.urteil === 'gesetzt_anker'), gesetzt: zaehl(L, r => r.urteil === 'gesetzt'), ohneLeser: zaehl(L, ohneLeser) }]; })),
};
console.log(out.join('\n'));
fs.writeFileSync(path.join(__dirname, 'zensus.json'), JSON.stringify({ quelle: 'vision/planet/zaehle.cjs über ' + BLAETTER.join(', '), zaehlung, zwillinge: zw.map(([g, L]) => ({ groesse: g, zeilen: L.map(r => r.id) })), zeilen }, null, 1));
// Tafel je Domäne
const esc = (s) => String(s === undefined ? '' : s).replace(/\|/g, '/').replace(/\n/g, ' ');
const st = { folgt: 'FOLGT', gesetzt_anker: 'gesetzt, Anker', gesetzt: '**GESETZT ohne Anker**' };
let md = '# Planet-Zensus — die Tafel (erzeugt von `zaehle.cjs`, nicht abgetippt)\n\nJe Zeile: Größe · Wert · Einheit · Ort · Leser · Urteil (woraus). Doppelt gezählte Stellen sind ausgelassen.\n';
for (const d of dom) {
  md += '\n## ' + d + '\n\n| id | Größe | Wert | Einheit | Ort | Leser | Urteil | woraus / Anmerkung |\n|---|---|---|---|---|---|---|---|\n';
  for (const r of Z.filter(x => x.domaene === d)) md += '| ' + r.id + ' | ' + esc(r.name) + ' | ' + esc(typeof r.wert === 'object' ? JSON.stringify(r.wert) : r.wert).slice(0, 80) + ' | ' + esc(r.einheit) + ' | `' + esc(r.ort) + '` | ' + (ohneLeser(r) ? '**ohne Leser**' : r.leser.length + ': ' + esc(r.leser[0]).slice(0, 70)) + ' | ' + st[r.urteil] + (r.technik === true ? ' · Technik' : '') + ' | ' + esc(r.woraus || '').slice(0, 140) + (r.anmerkung ? ' — ' + esc(r.anmerkung).slice(0, 100) : '') + ' |\n';
}
fs.writeFileSync(path.join(__dirname, 'zensus-tabelle.md'), md);
