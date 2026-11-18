#!/usr/bin/env node
// zaehl-welle.cjs — Zweitzählung von Welle 1 (vision/bau/entscheid.md §(2) "WAS FÄLLT").
// Fahren: node zaehl-welle.cjs     (liest ../entscheid.md und ../tafel.md; die ohne-Anker-Zahlen je Domäne zählt es selbst aus der Tafel
//                                   nach der Regel von zaehl-tafel.cjs: Σ Spalte n der Teil-1-Tabelle)
//
// REGEL: In §(2) steht je Domäne ein Absatz "**Dk (N):** Glied · Glied · … Anker neu: Glied · …".
//   fällt      = Σ der Klammerzahlen "(z)" aller Glieder VOR "Anker neu:"; ein Glied ohne "(z)" WIRFT (kein stilles 1).
//   verankert  = Σ der Klammerzahlen der Glieder NACH "Anker neu:"; ein Glied ohne Klammerzahl zählt 1 und wird BENANNT ausgegeben
//                (D2 "foundH → sockel 0,30", D3 "Anbau-Tor → Wagen lichtM": der Text setzt dort keine Zahl).
//   bleibt     = ohne Anker (Tafel, Skript) − fällt − verankert.
// Verglichen wird mit (a) der Kopfzahl "(N)" des Absatzes, (b) der Tafel §(2) (Zeile "| Dk … |") und (c) der Σ-Zeile 769/196/14/559.
'use strict';
const fs = require('fs');
const path = require('path');
const BAU = path.resolve(__dirname, '..');
const E = fs.readFileSync(path.join(BAU, 'entscheid.md'), 'utf8').split(/\r?\n/);
const T = fs.readFileSync(path.join(BAU, 'tafel.md'), 'utf8').split(/\r?\n/);

// ohne Anker je Domäne aus der Tafel (dieselbe Regel wie zaehl-tafel.cjs)
const ohne = {}; let cur = null;
const t2 = T.findIndex(l => l.startsWith('## TEIL 2'));
for (let i = 0; i < t2; i++) {
  const h = T[i].match(/^### (D\d) /); if (h) { cur = h[1]; ohne[cur] = 0; continue; }
  if (cur && T[i].startsWith('| ') && !T[i].startsWith('| Name ')) {
    const c = T[i].split('|').slice(1, -1).map(s => s.trim());
    if (!/^\d+$/.test(c[5])) throw new Error('tafel.md:' + (i + 1) + ' n nicht zählbar');
    ohne[cur] += +c[5];
  }
}
if (Object.keys(ohne).length !== 8) throw new Error('Tafel: ' + Object.keys(ohne).length + ' Domänen');

const a = E.findIndex(l => l.startsWith('## (2) WAS FÄLLT'));
const b = E.findIndex((l, i) => i > a && /^## \(3\)/.test(l));
if (a < 0 || b < 0) throw new Error('entscheid.md: §(2)/(3) nicht gefunden');

// Tafel §(2) des Entscheids
const tab = {};
for (let i = a; i < b; i++) {
  const m = E[i].match(/^\| \**(D\d|Σ)[^|]*\| \**(\d+)\** \| \**(\d+)\** \| \**(\d+)\** \| \**(\d+)\** \|$/);
  if (m) tab[m[1]] = { zeile: i + 1, ohne: +m[2], faellt: +m[3], anker: +m[4], bleibt: +m[5] };
}
if (Object.keys(tab).length !== 9) throw new Error('§(2)-Tafel: ' + Object.keys(tab).length + ' Zeilen statt 9');

// Absätze **Dk (N):** — ein Absatz läuft bis zum nächsten "**D" oder einer Leerzeile
const abs = {};
for (let i = a; i < b; i++) {
  const m = E[i].match(/^\*\*(D\d) \((\d+)\):\*\*\s*(.*)$/);
  if (!m) continue;
  let text = m[3], j = i + 1;
  while (j < b && E[j].trim() && !/^\*\*D\d/.test(E[j])) { text += ' ' + E[j].trim(); j++; }
  abs[m[1]] = { kopf: +m[2], zeile: i + 1, bis: j, text };
}

function glieder(s) {           // " · " auf Klammer-Tiefe 0
  const out = []; let d = 0, c = '';
  for (let i = 0; i < s.length; i++) {
    const ch = s[i];
    if (ch === '(' || ch === '[') d++; if (ch === ')' || ch === ']') d--;
    if (d === 0 && s.startsWith(' · ', i)) { out.push(c.trim()); c = ''; i += 2; continue; }
    c += ch;
  }
  if (c.trim()) out.push(c.trim());
  return out;
}
const zahlen = g => [...g.matchAll(/\((\d+)\)/g)].map(m => +m[1]);

const S = { ohne: 0, faellt: 0, anker: 0, bleibt: 0 };
const abw = [];
console.log('WELLE 1 — entscheid.md §(2) Z.' + (a + 1) + '–' + b + ' (Regel im Kopf dieses Skripts)');
console.log('Dom | ohne(Tafel) | fällt  | verankert | bleibt || Kopf (N) | §(2)-Tafel ohne/fällt/Anker/bleibt');
for (const d of ['D1', 'D2', 'D3', 'D4', 'D5', 'D6', 'D7', 'D8']) {
  const t = tab[d];
  let f = 0, an = 0; const ohneZahl = [], gl = [];
  if (abs[d]) {
    const [vor, nach] = abs[d].text.split(/Anker neu:/);
    for (const g of glieder(vor.replace(/\.\s*$/, ''))) {
      const z = zahlen(g);
      if (!z.length) throw new Error(`${d} entscheid.md:${abs[d].zeile}: fallendes Glied ohne (z): ${g}`);
      // Glieder mit mehreren (z) — z. B. "stoffTon (6), glasdunkel (4), laternenglas (4)" — zählen jede Klammerzahl
      f += z.reduce((x, y) => x + y, 0); gl.push(g);
    }
    if (nach !== undefined) for (const g of glieder(nach.replace(/\.\s*$/, ''))) {
      const z = zahlen(g);
      if (!z.length) { an += 1; ohneZahl.push(g); } else an += z.reduce((x, y) => x + y, 0);
    }
  } else if (t.faellt !== 0) throw new Error(d + ': kein Absatz, aber §(2) nennt ' + t.faellt);
  const bl = ohne[d] - f - an;
  S.ohne += ohne[d]; S.faellt += f; S.anker += an; S.bleibt += bl;
  console.log(`${d}  | ${String(ohne[d]).padStart(11)} | ${String(f).padStart(6)} | ${String(an).padStart(9)} | ${String(bl).padStart(6)} || ${abs[d] ? String(abs[d].kopf).padStart(8) : '   (kein)'} | ${t.ohne}/${t.faellt}/${t.anker}/${t.bleibt} (Z.${t.zeile})`);
  if (ohneZahl.length) console.log(`      Anker-Glied ohne Klammerzahl, als 1 gezählt: ${ohneZahl.map(s => '„' + s.slice(0, 60) + '“').join(' · ')}`);
  const chk = (was, x, y, z) => { if (x !== y) abw.push(`${d} ${was}: Skript ${x} · Text ${y} (entscheid.md:${z})`); };
  if (abs[d]) chk('fällt vs Kopf (N)', f, abs[d].kopf, abs[d].zeile);
  chk('ohne vs §(2)', ohne[d], t.ohne, t.zeile); chk('fällt vs §(2)', f, t.faellt, t.zeile);
  chk('verankert vs §(2)', an, t.anker, t.zeile); chk('bleibt vs §(2)', bl, t.bleibt, t.zeile);
}
const s = tab['Σ'];
console.log(`Σ   | ${String(S.ohne).padStart(11)} | ${String(S.faellt).padStart(6)} | ${String(S.anker).padStart(9)} | ${String(S.bleibt).padStart(6)} || Σ-Zeile ${s.ohne}/${s.faellt}/${s.anker}/${s.bleibt} (entscheid.md:${s.zeile})`);
for (const k of ['ohne', 'faellt', 'anker', 'bleibt']) if (S[k] !== s[k]) abw.push(`Σ ${k}: Skript ${S[k]} · Text ${s[k]} (entscheid.md:${s.zeile})`);
console.log('Abweichungen: ' + (abw.length ? '\n  ' + abw.join('\n  ') : 'keine'));

// Anteile aus entscheid.md:89–90 nachrechnen: "196 der 769 (25 %), ohne die Stoff-Paletten 122 von 384 = 32 %"
const ohneD5 = S.ohne - ohne.D5, fOhneD5 = S.faellt - tab.D5.faellt;
console.log(`Anteil: ${S.faellt}/${S.ohne} = ${(100 * S.faellt / S.ohne).toFixed(1)} % · ohne D5: ${fOhneD5}/${ohneD5} = ${(100 * fOhneD5 / ohneD5).toFixed(1)} %`);

// Ein FC-Ort, der in zwei Domänen fällt (Hinweis auf Doppelzählung über Domänen)
const ort = {};
for (const d of Object.keys(abs)) {
  const vor = abs[d].text.split(/Anker neu:/)[0];
  for (const m of vor.matchAll(/FC:(\d{3,5})/g)) (ort[m[1]] = ort[m[1]] || new Set()).add(d);
}
const doppelt = Object.entries(ort).filter(([, v]) => v.size > 1).map(([k, v]) => `FC:${k} in ${[...v].join('+')}`);
console.log('FC-Zeile in zwei Domänen fallend: ' + (doppelt.length ? doppelt.join(' · ') : 'keine'));
