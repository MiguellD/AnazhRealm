#!/usr/bin/env node
// f-sprossen.cjs — zieht die Sprossen der Planet-Leitern (planet.geologie|relief|wasser|wetter|zeit|erde.*) und der same.*-Leitern,
// deren id oder Titel „funktion“, „entfaltung“, „massstab“/„maßstab“ oder „sprung“ trägt, WÖRTLICH aus meisterkarte-2.json.
// Schreibt f-sprossen.json neben sich: [{ leiter, titel, sprosse, kennung, text, richter }], text = „umfang — tiefe (preis)“.
// Mit --tafel druckt es die Markdown-Tafel (Sprossen 1–3, Sprosse ≤ 25 Wörter, Richter ≤ 25 Wörter) auf stdout.
'use strict';
const fs = require('fs');
const path = require('path');

const QUELLE = path.join(__dirname, '..', '..', 'meisterkarte-2.json');
const ZIEL = path.join(__dirname, 'f-sprossen.json');
const karte = JSON.parse(fs.readFileSync(QUELLE, 'utf8'));

const PLANET_PFX = ['planet.geologie.', 'planet.relief.', 'planet.wasser.', 'planet.wetter.', 'planet.zeit.', 'planet.erde.'];
const SAME_WORT = /funktion|entfaltung|massstab|maßstab|sprung/;

const leitern = [];
for (const g of karte.gruppen) {
  for (const k of g.kriterien) {
    const planet = PLANET_PFX.some((p) => k.id.startsWith(p));
    const same = k.id.startsWith('same.') && SAME_WORT.test((k.id + ' ' + k.name).toLowerCase());
    if (planet || same) leitern.push({ gruppe: g.id, k });
  }
}

const zeilen = [];
for (const { k } of leitern) {
  for (const s of k.sprossen) {
    zeilen.push({
      leiter: k.id,
      titel: k.name,
      sprosse: s.nr,
      kennung: k.id + '/S' + s.nr,
      text: s.umfang + ' — ' + s.tiefe + ' (' + s.preis + ')',
      richter: s.richter,
    });
  }
}
fs.writeFileSync(ZIEL, JSON.stringify(zeilen, null, 1) + '\n');

function kurz(t, n) {
  const w = String(t).split(' ').filter((x) => x.length);
  const s = w.length > n ? w.slice(0, n).join(' ') + ' …' : w.join(' ');
  return s.split('|').join('/');
}

const nPlanet = leitern.filter((l) => l.k.id.startsWith('planet.')).length;
const nSame = leitern.length - nPlanet;
const sPlanet = zeilen.filter((z) => z.leiter.startsWith('planet.')).length;
console.error('Quelle ' + QUELLE + ' (stand ' + karte.stand + ', preisFassung ' + karte.preisFassung + ')');
console.error('Leitern ' + leitern.length + ' (planet ' + nPlanet + ', same ' + nSame + ') · Sprossen ' + zeilen.length + ' (planet ' + sPlanet + ', same ' + (zeilen.length - sPlanet) + ') → ' + ZIEL);

if (process.argv.includes('--tafel')) {
  const out = [];
  out.push('| Leiter (Sprossen · heute/kern) | S | Sprosse (Umfang — Tiefe, ≤ 25 Wörter) | Richter (≤ 25 Wörter) |');
  out.push('|---|---:|---|---|');
  for (const { k } of leitern) {
    for (const s of k.sprossen.slice(0, 3)) {
      const kopf = s.nr === 1 ? '`' + k.id + '` (' + k.sprossen.length + ' · ' + k.heute + '/' + k.kern + ')' : '';
      out.push('| ' + kopf + ' | ' + s.nr + ' | ' + kurz(s.umfang + ' — ' + s.tiefe, 25) + ' | ' + kurz(s.richter, 25) + ' |');
    }
  }
  process.stdout.write(out.join('\n') + '\n');
}
