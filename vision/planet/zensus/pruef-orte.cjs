'use strict';
// Prüft jede Zeile der Zensus-Tabellen zensus/[a-e]-*.json gegen den Baum: Die Datei im Feld `ort` muss existieren, und jede
// genannte Zeile (auch die eines Bereichs a-b) darf nicht hinter dem Datei-Ende liegen. Kurzformen „:123" erben die Datei davor.
// Aufruf: node pruef-orte.cjs [baum]   (Vorgabe: ../../../../AnazhRealm, also main neben dem Worktree)
const fs = require('fs'), path = require('path');
const BAUM = path.resolve(process.argv[2] || path.join(__dirname, '../../../../AnazhRealm'));
const zeilenZahl = new Map();
function laenge(datei) {
  if (!zeilenZahl.has(datei)) {
    const p = path.join(BAUM, datei);
    zeilenZahl.set(datei, fs.existsSync(p) ? fs.readFileSync(p, 'utf8').split('\n').length : -1);
  }
  return zeilenZahl.get(datei);
}
let n = 0, ohneOrt = 0; const fehler = [];
for (const b of fs.readdirSync(__dirname).filter(f => /^[a-e]-.*\.json$/.test(f)).sort()) {
  for (const r of JSON.parse(fs.readFileSync(path.join(__dirname, b), 'utf8'))) {
    const ort = String(r.ort);
    if (/^—/.test(ort)) { ohneOrt++; continue; }   // benannt abwesend (z. B. die Gezeiten)
    let datei = null;
    for (const m of ort.matchAll(/([\w./-]+\.(?:js|cjs|mjs|json|html|md))?:(\d+)(?:[-–](\d+))?/g)) {
      if (m[1]) datei = m[1];
      if (!datei) { fehler.push(b + ' ' + r.id + ': Zeile ohne Datei in "' + ort + '"'); continue; }
      const L = laenge(datei), z = Math.max(+m[2], +(m[3] || 0)); n++;
      if (L < 0) fehler.push(b + ' ' + r.id + ': Datei fehlt ' + datei);
      else if (z > L) fehler.push(b + ' ' + r.id + ': ' + datei + ':' + z + ' hinter dem Ende (' + L + ' Zeilen)');
    }
  }
}
console.log('Baum ' + BAUM + ' · ' + n + ' Orte geprüft · ' + ohneOrt + ' benannt ohne Ort · Fehler ' + fehler.length);
for (const f of fehler) console.log('  ' + f);
process.exit(fehler.length ? 1 : 0);
