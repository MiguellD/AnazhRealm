#!/usr/bin/env node
// zaehl-tafel.cjs — Zweitzählung der Tafel (vision/bau/tafel.md) und der Schlusszeilen der Lese-Blätter a–g.
// Fahren: node zaehl-tafel.cjs            (liest ../tafel.md und ../lesen-*.md relativ zu dieser Datei)
//
// REGEL (Tafel, Teil 1, je Domäne D1–D8, Abschnitt "### Dk …" bis zum nächsten "###"/"## TEIL 2"):
//   ohne Anker = Summe der Spalte n (6. Zelle) aller Tabellenzeilen (Zeile = beginnt mit "| ", nicht Kopf, nicht "|---").
//   Zeilen     = Zahl dieser Tabellenzeilen.
//   mit Anker  = Zahl der Glieder der Liste hinter "Mit Anker (k):", getrennt durch " · " auf Klammer-Tiefe 0
//                ("(f#24 · g#46)" bleibt EIN Glied); "keine." = 0 Glieder.
//   FOLGT      = dieselbe Regel für "FOLGT (k):".
//   gesamt     = ohne + mit + FOLGT.
// Verglichen wird mit (a) der Überschrift "— N ohne Anker in M Zeilen", (b) den Klammerzahlen (k), (c) der SUMME-Tafel oben.
// Kein Rückfall: eine nicht zählbare n-Zelle, ein fehlender Abschnitt oder eine fehlende Liste WIRFT.
'use strict';
const fs = require('fs');
const path = require('path');
const BAU = path.resolve(__dirname, '..');
const tafel = fs.readFileSync(path.join(BAU, 'tafel.md'), 'utf8').split(/\r?\n/);

function splitTop(s) {            // Trennung an " · " nur auf Klammer-Tiefe 0
  const out = []; let d = 0, cur = '';
  for (let i = 0; i < s.length; i++) {
    const c = s[i];
    if (c === '(' || c === '[') d++;
    if (c === ')' || c === ']') d--;
    if (d === 0 && s.startsWith(' · ', i)) { out.push(cur.trim()); cur = ''; i += 2; continue; }
    cur += c;
  }
  if (cur.trim()) out.push(cur.trim());
  if (d !== 0) throw new Error('Klammern unbalanciert in: ' + s.slice(0, 80));
  return out;
}
function liste(line, wort) {
  const m = line.match(new RegExp('^' + wort + ' \\((\\d+)\\):\\s*(.*)$'));
  if (!m) throw new Error('keine Liste "' + wort + '" in: ' + line.slice(0, 80));
  let rest = m[2].trim().replace(/\.\s*$/, '');
  const glieder = /^keine$/.test(rest) ? [] : splitTop(rest);
  return { k: +m[1], glieder };
}

// --- SUMME-Tafel (oben) ---
const summe = {};
for (let i = 0; i < tafel.length; i++) {
  const m = tafel[i].match(/^\| \**(D\d|GESAMT)[^|]*\| \**(\d+)\** \| \**(\d+)\** \((\d+) Zeilen\) \| \**(\d+)\** \| \**(\d+)\** \|$/);
  if (m) summe[m[1]] = { zeile: i + 1, ges: +m[2], ohne: +m[3], zeilen: +m[4], mit: +m[5], folgt: +m[6] };
}
if (Object.keys(summe).length !== 9) throw new Error('SUMME-Tafel: ' + Object.keys(summe).length + ' Zeilen statt 9');

// --- Teil 1 ---
const t1 = tafel.findIndex(l => l.startsWith('## TEIL 1'));
const t2 = tafel.findIndex(l => l.startsWith('## TEIL 2'));
if (t1 < 0 || t2 < 0) throw new Error('TEIL 1/2 nicht gefunden');
const dom = [];
let cur = null;
for (let i = t1; i < t2; i++) {
  const l = tafel[i];
  const h = l.match(/^### (D\d) (.*?) — (\d+) ohne Anker in (\d+) Zeilen/);
  if (h) { cur = { d: h[1], name: h[2], kopf: { ohne: +h[3], zeilen: +h[4], zeile: i + 1 }, n: 0, zeilen: 0, rows: [] }; dom.push(cur); continue; }
  if (!cur) continue;
  if (l.startsWith('| ') && !l.startsWith('| Name ')) {
    const c = l.split('|').slice(1, -1).map(s => s.trim());
    if (c.length !== 7) throw new Error('Zeile ' + (i + 1) + ': ' + c.length + ' Zellen statt 7');
    if (!/^\d+$/.test(c[5])) throw new Error('Zeile ' + (i + 1) + ': n nicht zählbar: "' + c[5] + '"');
    cur.n += +c[5]; cur.zeilen++; cur.rows.push({ zeile: i + 1, name: c[0], n: +c[5], ort: c[2], blaetter: c[6] });
  }
  if (l.startsWith('Mit Anker (')) { cur.mit = liste(l.trim(), 'Mit Anker'); cur.mitZeile = i + 1; }
  if (l.startsWith('FOLGT (')) { cur.folgt = liste(l.trim(), 'FOLGT'); cur.folgtZeile = i + 1; }
}
if (dom.length !== 8) throw new Error(dom.length + ' Domänen statt 8');
for (const d of dom) if (!d.mit || !d.folgt) throw new Error(d.d + ': Mit-Anker- oder FOLGT-Liste fehlt');

const pad = (s, w) => String(s).padStart(w);
console.log('TAFEL tafel.md — Teil 1 Z.' + (t1 + 1) + '–' + t2 + ' (Regel im Kopf dieses Skripts)');
console.log('Dom | ohne(Σn) Zeilen | mit  | FOLGT | gesamt || Kopf ohne/Zeilen | (k) mit/FOLGT | SUMME ges/ohne/Zeilen/mit/FOLGT');
const G = { ohne: 0, zeilen: 0, mit: 0, folgt: 0 };
const abw = [];
for (const d of dom) {
  const mit = d.mit.glieder.length, fo = d.folgt.glieder.length, ges = d.n + mit + fo;
  const s = summe[d.d];
  G.ohne += d.n; G.zeilen += d.zeilen; G.mit += mit; G.folgt += fo;
  console.log(`${d.d}  | ${pad(d.n, 4)} ${pad(d.zeilen, 6)}    | ${pad(mit, 4)} | ${pad(fo, 5)} | ${pad(ges, 6)} || ${pad(d.kopf.ohne, 4)}/${pad(d.kopf.zeilen, 2)}       | ${pad(d.mit.k, 3)}/${pad(d.folgt.k, 2)}         | ${s.ges}/${s.ohne}/${s.zeilen}/${s.mit}/${s.folgt}`);
  const chk = (was, a, b, z) => { if (a !== b) abw.push(`${d.d} ${was}: Skript ${a} · Tafel ${b} (tafel.md:${z})`); };
  chk('ohne vs Kopf', d.n, d.kopf.ohne, d.kopf.zeile); chk('Zeilen vs Kopf', d.zeilen, d.kopf.zeilen, d.kopf.zeile);
  chk('mit vs (k)', mit, d.mit.k, d.mitZeile); chk('FOLGT vs (k)', fo, d.folgt.k, d.folgtZeile);
  chk('ohne vs SUMME', d.n, s.ohne, s.zeile); chk('Zeilen vs SUMME', d.zeilen, s.zeilen, s.zeile);
  chk('mit vs SUMME', mit, s.mit, s.zeile); chk('FOLGT vs SUMME', fo, s.folgt, s.zeile); chk('gesamt vs SUMME', ges, s.ges, s.zeile);
}
const S = summe.GESAMT, ges = G.ohne + G.mit + G.folgt;
console.log(`Σ   | ${pad(G.ohne, 4)} ${pad(G.zeilen, 6)}    | ${pad(G.mit, 4)} | ${pad(G.folgt, 5)} | ${pad(ges, 6)} || SUMME-Zeile ${S.ges}/${S.ohne}/${S.zeilen}/${S.mit}/${S.folgt} (tafel.md:${S.zeile})`);
for (const [k, a, b] of [['gesamt', ges, S.ges], ['ohne', G.ohne, S.ohne], ['Zeilen', G.zeilen, S.zeilen], ['mit', G.mit, S.mit], ['FOLGT', G.folgt, S.folgt]])
  if (a !== b) abw.push(`GESAMT ${k}: Skript ${a} · Tafel ${b} (tafel.md:${S.zeile})`);
// Summe der Domänen-Zeilen der SUMME-Tafel gegen ihre eigene GESAMT-Zeile
for (const k of ['ges', 'ohne', 'zeilen', 'mit', 'folgt']) {
  const s = dom.reduce((a, d) => a + summe[d.d][k], 0);
  if (s !== S[k]) abw.push(`SUMME-Tafel in sich ${k}: Σ D1–D8 ${s} · GESAMT-Zeile ${S[k]}`);
}
console.log('Abweichungen Tafel: ' + (abw.length ? '\n  ' + abw.join('\n  ') : 'keine'));

// Zeilen mit n > 1, deren Name eine eigene Zahl nennt ("übrige 12"), gegen n
for (const d of dom) for (const r of d.rows) {
  const m = r.name.match(/übrige (\d+)|\((\d+) [A-ZÄÖÜa-zäöü]/);
  if (m && +(m[1] || m[2]) !== r.n) console.log(`  Name/n: tafel.md:${r.zeile} "${r.name}" nennt ${m[1] || m[2]}, n = ${r.n}`);
}

// --- Lese-Blätter a–g: Zeilen der Größen-Tafel (Abschnitt "## (2)") nach Urteil, gegen ihre Schlusszeile ---
// Regel: jede Datenzeile der Tafel in "## (2)" bis "## (3)". Urteil = letzte Zelle.
//   FOLGT  wenn die Urteilszelle mit F/FOLGT beginnt; ANKER wenn sie "Anker"/"G·A"/"ANKER" trägt; sonst GESETZT.
//   a–d, f, g: eine Zeile = eine Größe (g zählt selbst 152 Größen in 53 Zeilen — ohne n je Zeile NICHT maschinell zählbar).
//   e: die führende Zahl der Urteilszelle ("85 GESETZT", "1 ANKER · 1 GESETZT") zählt.
const nummern = {};
console.log('\nBLÄTTER (2)-Tafeln, maschinell nach Urteilszelle — Vergleich mit der Schlusszeile');
const blaetter = fs.readdirSync(BAU).filter(f => /^lesen-[a-g]-.*\.md$/.test(f)).sort();
for (const f of blaetter) {
  const L = fs.readFileSync(path.join(BAU, f), 'utf8').split(/\r?\n/);
  const a = L.findIndex(l => l.startsWith('## (2)')), b = L.findIndex((l, i) => i > a && /^## \(3\)/.test(l));
  if (a < 0 || b < 0) throw new Error(f + ': Abschnitt (2)/(3) fehlt');
  // Regel e: die 24 Einzelzeilen des Rollen-Blocks tragen kein Zahl-Urteil; sie stecken in der Zeile "**Summe Rollen-Block** … 85".
  //   Gezählt wird in e also nur, was eine führende Zahl im Urteil trägt (die Summenzeile eingeschlossen).
  // Zweite Lesart a–d, f, g ("Anker-Spalte"): ein G-Urteil zählt als "mit Anker", wenn die Anker-Spalte nicht keiner/—/Samen ist.
  const kopfZ = L.slice(a, b).find(l => /^\|\s*(#|Größe)\s*\|/.test(l));
  const kopfC = kopfZ.split('|').slice(1, -1).map(s => s.trim());
  const iAnker = kopfC.indexOf('Anker');
  if (iAnker < 0) throw new Error(f + ': keine Anker-Spalte');
  const z = { zeilen: 0, G: 0, A: 0, F: 0, ges: 0, A2: 0, G2: 0, ohneZahl: 0 };
  for (let i = a; i < b; i++) {
    const l = L[i];
    if (!l.startsWith('| ') || /^\|\s*(#|Größe|Name)\s*\|/.test(l) || l.startsWith('|---')) continue;
    const c = l.split('|').slice(1, -1).map(s => s.trim());
    const u = c[c.length - 1];
    if (f.startsWith('lesen-e')) {
      if (!/^\d/.test(u)) { z.ohneZahl++; continue; }
      z.zeilen++;
      for (const t of u.split(' · ')) {
        const m = t.match(/^(\d+)\s+(.*)$/); if (!m) throw new Error(f + ':' + (i + 1) + ' Urteil-Teil ohne Zahl: ' + t);
        const kl = /^F/.test(m[2]) ? 'F' : /ANKER|Anker/.test(m[2]) ? 'A' : 'G';
        z[kl] += +m[1]; z.ges += +m[1];
      }
    } else {
      if (/^\*\*Summe/.test(c[0])) continue;
      z.zeilen++;
      const kl = /^(F\b|FOLGT)/.test(u) ? 'F' : /G·A|Anker|ANKER/.test(u) ? 'A' : 'G';
      z[kl]++; z.ges++;
      if (kl === 'G') {
        const an = c[iAnker];
        if (/^(keiner|—|-|–|)$/.test(an) || /^keiner\b/.test(an) || /^Samen$/.test(an)) z.G2++; else z.A2++;
      } else if (kl === 'A') z.A2++;
    }
  }
  const extra = f.startsWith('lesen-e') ? (`         (e: ${z.ohneZahl} Rollen-Einzelzeilen ohne Zahl-Urteil übersprungen, in der Summenzeile enthalten)`) : (`         Anker-Spalten-Lesart: GESETZT ohne ${z.G2} · mit Anker/Etikett ${z.A2}`);
  const schluss = L.filter(l => /Größen gesamt|gesamt \d|\d+ Größen gesamt/.test(l)).pop() || '(keine Schlusszeile)';
  console.log(`${f.slice(0, 7)}: ${z.zeilen} Zeilen · Größen ${z.ges} · GESETZT ${z.G} · mit Anker ${z.A} · FOLGT ${z.F}`);
  console.log(`         Schluss: ${schluss.replace(/\*\*/g, '').slice(0, 170)}`);
  console.log(extra);
  if (f.startsWith('lesen-e')) continue;
  // Nummern der Blatt-Zeilen für die Deckungs-Probe
  nummern[f[6]] = [];
  for (let i = a; i < b; i++) { const m = L[i].match(/^\|\s*(\d+)\s*\|/); if (m) nummern[f[6]].push(+m[1]); }
}

// --- Deckungs-Probe: welche Blatt-Zeile (a–d, f, g; e hat keine Nummern-Spalte) nennt Teil 1 der Tafel nirgends? ---
// Regel: Verweise "x#N", "x#N–M", "x#N, M, K–L" in Teil 1 (Tabellen und Listen) werden ausgefaltet; ein Komma setzt den Buchstaben fort.
console.log('\nDECKUNG Teil 1 → Blatt-Zeilen (Verweise x#N in tafel.md Z.' + (t1 + 1) + '–' + t2 + ')');
const genannt = {}, domVon = {}; let dCur = null;
const reRef = /([a-h])#(\d+)((?:\s*[–-]\s*\d+)?(?:,\s*\d+(?:\s*[–-]\s*\d+)?)*)/g;
for (let i = t1; i < t2; i++) {
  const hd = tafel[i].match(/^### (D\d) /); if (hd) dCur = hd[1];
  let m; reRef.lastIndex = 0;
  while ((m = reRef.exec(tafel[i]))) {
    const x = m[1]; (genannt[x] = genannt[x] || new Set());
    const teile = (m[2] + m[3]).split(',').map(s => s.trim());
    for (const t of teile) {
      const r = t.match(/^(\d+)(?:\s*[–-]\s*(\d+))?$/); if (!r) throw new Error('Verweis nicht lesbar: ' + t + ' in tafel.md:' + (i + 1));
      const v = +r[1], w = r[2] ? +r[2] : v;
      for (let k = v; k <= w; k++) { genannt[x].add(k); const key = x + k; (domVon[key] = domVon[key] || new Set()).add(dCur); }
    }
  }
}
for (const x of Object.keys(nummern).sort()) {
  const fehlt = nummern[x].filter(k => !(genannt[x] && genannt[x].has(k)));
  const fremd = [...(genannt[x] || [])].filter(k => !nummern[x].includes(k));
  const verteil = {}; let mehr = 0; for (const k of nummern[x]) { const ds = domVon[x + k]; if (!ds) continue; if (ds.size > 1) mehr++; for (const dd of ds) verteil[dd] = (verteil[dd] || 0) + 1; }
  console.log(`${x}: Blatt ${nummern[x].length} Zeilen · in Teil 1 genannt ${genannt[x] ? genannt[x].size : 0} · nie genannt ${fehlt.length}${fehlt.length ? ' [' + fehlt.join(', ') + ']' : ''}${fremd.length ? ' · Verweis ohne Blatt-Zeile [' + fremd.join(', ') + ']' : ''}`);
  console.log('   Zeilen je Domäne (eine Zeile kann in mehreren stehen): ' + Object.keys(verteil).sort().map(dd => dd + ' ' + verteil[dd]).join(' · ') + ' · in > 1 Domäne: ' + mehr + (mehr ? ' [' + nummern[x].filter(k => domVon[x + k] && domVon[x + k].size > 1).map(k => x + '#' + k + ' in ' + [...domVon[x + k]].join('+')).join(', ') + ']' : ''));
}
