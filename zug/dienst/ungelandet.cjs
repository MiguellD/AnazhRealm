#!/usr/bin/env node
// ungelandet.cjs — welche Zweige tragen gebauten Code, der NICHT in main steht?
// Richter ist der INHALT, nie der Zweig-Name oder eine Zug-Zeile: je Zweig (kein Vorfahr von main, letzter Commit
// in den letzten N Tagen) die verschiedenen hinzugefügten Code-Zeilen >= 30 Zeichen gegen die merge-base
// (js/cjs/mjs/html/css, ohne vendor/node_modules, ohne ?v=-Zeilen) und wie viele davon heute wörtlich in main stehen.
// Ein Squash in main (anderer SHA, gleicher Inhalt) zählt so als gelandet.
// Aufruf: node ungelandet.cjs [--tage 7] [--repo <pfad>] [--main <ref>] [--min 20] [--schwelle 85] [--selbsttest]
// Ausgabe: EINE Zeile für den Blick. Grenze: Code, der nach dem Landen umgeschrieben wurde, zählt als fehlend.
'use strict';
const { execFile, execFileSync } = require('child_process');

const arg = (n, d) => { const i = process.argv.indexOf(n); return i > 0 && process.argv[i + 1] ? process.argv[i + 1] : d; };
const SELBST = process.argv.includes('--selbsttest');
const REPO = arg('--repo', process.cwd());
const MAIN = arg('--main', SELBST ? 'c50e6b61' : 'origin/main');
const TAGE = +arg('--tage', 7);
const MIN = +arg('--min', 20);
const SCHWELLE = +arg('--schwelle', 85);
const PFAD = ['--', '*.js', '*.cjs', '*.mjs', '*.html', '*.css', ':(exclude)vendor', ':(exclude)node_modules'];
const OPT = { cwd: REPO, encoding: 'utf8', maxBuffer: 1 << 30 };

const gitSync = (a) => execFileSync('git', a, { ...OPT, stdio: ['ignore', 'pipe', 'ignore'] });
const gitAsync = (a) => new Promise((ok) => execFile('git', a, OPT, (e, out) => ok(e ? (out || '') : out)));

async function pool(items, n, fn) {
  const res = new Array(items.length);
  let i = 0;
  await Promise.all(Array.from({ length: n }, async () => { while (i < items.length) { const k = i++; res[k] = await fn(items[k]); } }));
  return res;
}

async function messen() {
  const t0 = Date.now();
  const mainSha = gitSync(['rev-parse', MAIN]).trim();
  const mainZeit = +gitSync(['log', '-1', '--format=%ct', mainSha]).trim();
  const bezug = SELBST ? mainZeit : Math.floor(Date.now() / 1000);
  const grenze = bezug - TAGE * 86400;
  // 1) alle Code-Zeilen von main (EIN Lauf)
  const set = new Set();
  const alle = await gitAsync(['grep', '-h', '-I', '-e', '', mainSha, ...PFAD]);
  for (const l of alle.split('\n')) { const x = l.trim(); if (x.length >= 30) set.add(x); }
  // 2) Zweige, die kein Vorfahr von main sind
  const refs = gitSync(['for-each-ref', '--no-merged=' + mainSha, '--format=%(committerdate:unix)|%(refname:lstrip=3)|%(ahead-behind:' + mainSha + ')|%(contents:subject)', 'refs/remotes/origin'])
    .split('\n').filter(Boolean).map((z) => { const p = z.split('|'); const ab = (p[2] || '0 0').split(' '); return { zeit: +p[0], zweig: p[1], vor: +ab[0], betreff: p.slice(3).join('|') }; })
    .filter((r) => r.zeit >= grenze && r.zweig !== 'HEAD' && r.zweig !== 'integ-probe' && r.vor > 0 && r.vor <= 5000);
  // 3) je Zweig: hinzugefügte Zeilen gegen die merge-base, Anteil wörtlich in main
  const mess = await pool(refs, 8, async (r) => {
    const mb = (await gitAsync(['merge-base', mainSha, 'origin/' + r.zweig])).trim();
    if (!mb) return null;
    const d = await gitAsync(['diff', '--no-color', '-U0', mb, 'origin/' + r.zweig, ...PFAD]);
    const neu = new Set();
    for (const l of d.split('\n')) {
      if (l[0] !== '+' || l.startsWith('+++')) continue;
      const x = l.slice(1).trim();
      if (x.length >= 30 && !x.includes('?v=')) neu.add(x);
    }
    let hit = 0;
    for (const x of neu) if (set.has(x)) hit++;
    return { ...r, neu: neu.size, pct: neu.size ? Math.floor((100 * hit) / neu.size) : -1, abgabe: /Abgabe/.test(r.betreff) };
  });
  const offen = mess.filter((m) => m && m.neu >= MIN && m.pct >= 0 && m.pct < SCHWELLE)
    .sort((a, b) => (b.abgabe - a.abgabe) || (b.neu - a.neu));
  return { offen, alle: mess.filter(Boolean), sek: (Date.now() - t0) / 1000, mainSha };
}

(async () => {
  const { offen, alle, sek, mainSha } = await messen();
  const teile = offen.map((m) => `${m.zweig}${m.abgabe ? '[Abgabe]' : ''} +${m.vor} ${m.neu}/${m.pct}%`);
  const zeile = `UNGELANDET (≤ ${TAGE} Tage, Inhalt < ${SCHWELLE} % in main ${mainSha.slice(0, 8)}): ${offen.length} — ${teile.join(' · ')}`;
  console.log(zeile);
  // --cache <datei>: der Blick (messplatz-blick.cjs --kurz) liest die Zeile aus der Datei; erste Zeile die Zeit der Rechnung (ms)
  const CACHE = arg('--cache', null);
  if (CACHE) require('fs').writeFileSync(CACHE, Date.now() + '\n' + zeile + '\n');
  console.error(`(${alle.length} Zweige gemessen in ${sek.toFixed(1)} s)`);
  if (SELBST) {
    const namen = new Set(offen.map((m) => m.zweig));
    const faelle = [
      ['nennt w28-stadt-netz', namen.has('w28-stadt-netz')],
      ...['w28-licht-kern', 'w28-feld-fuss', 'w28-ankunft-faden'].map((z) => [`nennt NICHT ${z} (Squash 2ac706fac)`, !namen.has(z) && alle.some((m) => m.zweig === z)]),
    ];
    for (const [n, ok] of faelle) console.log(`${ok ? 'GRÜN' : 'ROT '} ${n}`);
    const rot = faelle.filter((f) => !f[1]).length;
    console.log(`SELBSTTEST ${rot ? 'ROT' : 'GRÜN'} ${faelle.length - rot}/${faelle.length} · ${sek.toFixed(1)} s`);
    process.exit(rot ? 1 : 0);
  }
})();
