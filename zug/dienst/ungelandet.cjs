#!/usr/bin/env node
// ungelandet.cjs — welche Zweige tragen gebauten Code, der NICHT in main steht?
// Richter ist der INHALT, nie der Zweig-Name oder eine Zug-Zeile: je Zweig (kein Vorfahr von main, letzter Commit
// in den letzten N Tagen) die verschiedenen hinzugefügten Code-Zeilen >= 30 Zeichen gegen die merge-base
// (js/cjs/mjs/html/css, ohne vendor/node_modules, ohne ?v=-Zeilen) und wie viele davon heute wörtlich in main stehen.
// Ein Squash in main (anderer SHA, gleicher Inhalt) zählt so als gelandet.
// Aufruf: node ungelandet.cjs [--tage 7] [--repo <pfad>] [--main <ref>] [--min 20] [--schwelle 85] [--selbsttest]
// Ausgabe: EINE Zeile für den Blick. Grenze: Code, der nach dem Landen umgeschrieben wurde, zählt als fehlend.
//
// ÄSTE MIT FRIST (Koordinator 19.11., Entscheid E4 „Äste mit Frist“; Muster M2: 37 ungelandete Zweige, das Werkzeug nannte nur Menge
// und Inhalt-%, kein Alter, keine Frist, keinen Besitzer): `--frist [--stunden 72] [--befehle]` LIEST NUR (git ls-remote, git log,
// die Zug-Schlange wie der Blick sie liest) und druckt die Trocken-Liste: je Zweig am Ursprung, der die Regel trifft —
// kein Commit „Abgabe w…“ vor main · letzter Commit älter als die Frist · nicht in der Zug-Schlange (w4/zug-nie-leer.wartet, dienst/
// zug.fahrt, offene Zeilen von zug/warteschlange.txt) und kein Vorfahr eines Zweigs dort (sein Stempel w<nn>-* steht in der Schlange) ·
// kein Dienst-Zweig — eine Zeile: Name · SHA · Alter h · Autor des letzten Commits · eigene Code-Zeilen nicht in main (dieselbe
// Rechnung wie oben: neu − wörtlich in main) · Archiv-Ziel refs/archiv/<JJJJ-MM-TT>/<name>. `--befehle` druckt dieselbe Liste als die
// exakten git-Befehle (Archiv-Push → Prüfung per ls-remote → erst dann der Kopf weg, mit Lease auf den SHA) — NUR gedruckt, nie
// ausgeführt. Die 15 Familien der Bergung (koordination bericht/1811-bergung.md, „VERLOREN nach Rang“) stehen als
// „BERGUNG — braucht Besitzer“ und bekommen keinen Befehl: das Archiv begräbt nichts still.
'use strict';
const fs = require('fs');
const os = require('os');
const path = require('path');
const { execFile, execFileSync } = require('child_process');

const arg = (n, d) => { const i = process.argv.indexOf(n); return i > 0 && process.argv[i + 1] ? process.argv[i + 1] : d; };
const SELBST = process.argv.includes('--selbsttest');
const FRIST = process.argv.includes('--frist');
const BEFEHLE = process.argv.includes('--befehle');
const REPO = arg('--repo', process.cwd());
const MAIN = arg('--main', SELBST ? 'c50e6b61' : 'origin/main');
const TAGE = +arg('--tage', 7);
const MIN = +arg('--min', 20);
const SCHWELLE = +arg('--schwelle', 85);
const STUNDEN = +arg('--stunden', 72);
const PFAD = ['--', '*.js', '*.cjs', '*.mjs', '*.html', '*.css', ':(exclude)vendor', ':(exclude)node_modules'];
// windowsHide (18.11.): der Blick startet diese Datei ABGELÖST (messplatz-blick.cjs, detached, ohne Konsole) — ohne die Zeile bekam
// jedes git-Kind eine eigene Konsole, und Windows Terminal öffnete je Zweig ein Fenster (hunderte je Auffrischung, am Laptop gesehen).
// timeout: ein git diff, das am Nachladen hängt (Teil-Klon), hielt sein Fenster minutenlang offen; es fällt nach 120 s als „leer“.
const opt = (repo) => ({ cwd: repo, encoding: 'utf8', maxBuffer: 1 << 30, windowsHide: true, timeout: 120000 });
const gitIn = (repo) => ({
  sync: (a, input) => execFileSync('git', a, { ...opt(repo), stdio: ['pipe', 'pipe', 'ignore'], input: input || '' }),
  async: (a) => new Promise((ok) => execFile('git', a, opt(repo), (e, out) => ok(e ? (out || '') : out))),
});
const G = gitIn(REPO);
const gitSync = G.sync;
const gitAsync = G.async;

async function pool(items, n, fn) {
  const res = new Array(items.length);
  let i = 0;
  await Promise.all(Array.from({ length: n }, async () => { while (i < items.length) { const k = i++; res[k] = await fn(items[k]); } }));
  return res;
}

// DIE EINE RECHNUNG DES INHALTS (Blick-Zeile und Frist): alle Code-Zeilen von main als Menge, je Zweig die hinzugefügten Zeilen gegen
// die merge-base und wie viele davon wörtlich in main stehen
async function mainZeilen(g, mainSha) {
  const set = new Set();
  const alle = await g.async(['grep', '-h', '-I', '-e', '', mainSha, ...PFAD]);
  for (const l of alle.split('\n')) { const x = l.trim(); if (x.length >= 30) set.add(x); }
  return set;
}
async function inhalt(g, mainSha, set, ref) {
  const mb = (await g.async(['merge-base', mainSha, ref])).trim();
  if (!mb) return null;
  const d = await g.async(['diff', '--no-color', '-U0', mb, ref, ...PFAD]);
  const neu = new Set();
  for (const l of d.split('\n')) {
    if (l[0] !== '+' || l.startsWith('+++')) continue;
    const x = l.slice(1).trim();
    if (x.length >= 30 && !x.includes('?v=')) neu.add(x);
  }
  let hit = 0;
  for (const x of neu) if (set.has(x)) hit++;
  return { neu: neu.size, hit, pct: neu.size ? Math.floor((100 * hit) / neu.size) : -1 };
}

async function messen() {
  const t0 = Date.now();
  const mainSha = gitSync(['rev-parse', MAIN]).trim();
  const mainZeit = +gitSync(['log', '-1', '--format=%ct', mainSha]).trim();
  const bezug = SELBST ? mainZeit : Math.floor(Date.now() / 1000);
  const grenze = bezug - TAGE * 86400;
  // 1) alle Code-Zeilen von main (EIN Lauf)
  const set = await mainZeilen(G, mainSha);
  // 2) Zweige, die kein Vorfahr von main sind
  const refs = gitSync(['for-each-ref', '--no-merged=' + mainSha, '--format=%(committerdate:unix)|%(refname:lstrip=3)|%(ahead-behind:' + mainSha + ')|%(contents:subject)', 'refs/remotes/origin'])
    .split('\n').filter(Boolean).map((z) => { const p = z.split('|'); const ab = (p[2] || '0 0').split(' '); return { zeit: +p[0], zweig: p[1], vor: +ab[0], betreff: p.slice(3).join('|') }; })
    .filter((r) => r.zeit >= grenze && r.zweig !== 'HEAD' && r.zweig !== 'integ-probe' && r.vor > 0 && r.vor <= 5000);
  // 3) je Zweig: hinzugefügte Zeilen gegen die merge-base, Anteil wörtlich in main
  const mess = await pool(refs, 8, async (r) => {
    const m = await inhalt(G, mainSha, set, 'origin/' + r.zweig);
    return m && { ...r, neu: m.neu, pct: m.pct, abgabe: /Abgabe/.test(r.betreff) };
  });
  const offen = mess.filter((m) => m && m.neu >= MIN && m.pct >= 0 && m.pct < SCHWELLE)
    .sort((a, b) => (b.abgabe - a.abgabe) || (b.neu - a.neu));
  return { offen, alle: mess.filter(Boolean), sek: (Date.now() - t0) / 1000, mainSha };
}

// ── ÄSTE MIT FRIST ───────────────────────────────────────────────────────────────────────────────────────────────────────────────
// Die Dienst-Zweige fallen nie unter die Frist: main · integ-* · koordination · punkte-maschine · zug-* · heim*-* (Heimholer) ·
// probe-*/probe/* (GPU-Probe). Köpfe auf ANDERER Basis (*-koord/koord-* auf koordination, *-pm auf punkte-maschine) misst die Frist
// nicht gegen main — sie stehen offen gezählt als „andere Basis“, nie still weg.
const DIENST = /^(main|koordination|punkte-maschine)$|^(integ|zug|heim\d*|probe)[-/]/;
const ANDERE_BASIS = /^koord-|-koord$|-pm$/;
// DIE 15 FAMILIEN DER BERGUNG — Quelle: koordination bericht/1811-bergung.md „VERLOREN nach Rang“ 1–15 (je Familie die Zweig-Namen,
// die der Bericht nennt). Der Selbsttest prüft, dass jeder Kopf-Name dort steht: ändert sich der Bericht, wird er ROT.
const BERGUNG = [
  ['1 stadt-netz', 'w28-stadt-netz', /^w28-stadt-netz$/],
  ['2 ferne-ton', 'w26-ferne-ton', /^w2[67]-ferne-ton(-\d+)?(-vorher)?$/],
  ['3 weg-koerper', 'w28-weg-koerper', /^w28-weg-koerper$/],
  ['4 b-code', 'w4-b-code', /^w4-b-code(-heim|-heil\d*)?$|^claude\/youthful-albattani$/],
  ['5 stadt-orte', 'w4-stadt-orte', /^w4-stadt-orte$|^claude\/festive-hawking$/],
  ['6 studio-seiten', 'w28-studio-seiten', /^w28-studio-seiten$/],
  ['7 reise-raeumt', 'w28-reise-raeumt', /^w28-reise-raeumt$/],
  ['8 e-buendel', 'w4-e-buendel', /^w4-e-buendel$/],
  ['9 gehege', 'w4-gehege', /^w4-gehege(-\d+)?$/],
  ['10 heap-zensus', 'w28-heap-stichprobe', /^w28-heap-(stichprobe|spiegel|zensus)$/],
  ['11 baum-schirm', 'w28-baum-schirm', /^w28-baum-schirm$/],
  ['12 fruehbild', 'w28-fruehbild', /^w28-fruehbild$/],
  ['13 rasen-schnitt', 'w28-rasen-schnitt', /^w28-rasen-schnitt$/],
  ['14 reibellipse', 'w28-reibellipse', /^w28-reibellipse$/],
  ['15 seiten-stille', 'w28-seiten-stille', /^w28-seiten-stille$/],
];
const bergungVon = (name) => (BERGUNG.find((b) => b[2].test(name)) || [null])[0];

// DIE ZUG-SCHLANGE, wie der Blick sie liest (messplatz-uhr.cjs wartetLesen, sammelnVon; die Warteschlange der Geräte): Namen und
// Köpfe, die jetzt warten oder fahren
function schlangeLesen(repo) {
  const T = path.join(process.env.TEMP || os.tmpdir(), 'claude');
  const lies = (f) => { try { return fs.readFileSync(f, 'utf8'); } catch (_e) { return ''; } };
  const namen = new Set(), shas = new Set(), quellen = [];
  const wartet = lies(path.join(T, 'w4', 'zug-nie-leer.wartet'));
  for (const z of wartet.split(/\r?\n/)) { const m = /^(\S+?)(?: ([0-9a-f]{7,40}))?: /.exec(z.trim()); if (m) { namen.add(m[1]); if (m[2]) shas.add(m[2]); } }
  quellen.push(`wartet ${namen.size}`);
  const fahrt = lies(path.join(T, 'dienst', 'zug.fahrt'));
  for (const m of fahrt.matchAll(/(\S+)@([0-9a-f]{7,40})/g)) { namen.add(m[1]); shas.add(m[2]); }
  quellen.push(`fahrt ${fahrt.trim() ? fahrt.trim().split(/\s+/)[0] : '—'}`);
  // die Warteschlange der Geräte (koordination zug/warteschlange.txt): offene Zeilen, die einen Kopf nennen, halten ihn
  let ws = '';
  try { ws = gitIn(repo).sync(['show', 'origin/koordination:zug/warteschlange.txt']); } catch (_e) { ws = ''; }
  let erl = '';
  try { erl = gitIn(repo).sync(['show', 'origin/koordination:zug/erledigt.txt']); } catch (_e) { erl = ''; }
  const zu = new Set(erl.split(/\r?\n/).map((l) => l.trim().replace(/^\d{4}-\d\d-\d\d \d\d:\d\d /, '').split(/\s+/)[0]).filter(Boolean));
  const storno = new Set(ws.split(/\r?\n/).filter((l) => /^\S+ 0 storno/.test(l.trim())).map((l) => l.trim().split(/\s+/)[0]));
  let nWs = 0;
  for (const l of ws.split(/\r?\n/)) {
    const t = l.trim(); if (!t || t.startsWith('#')) continue;
    const id = t.split(/\s+/)[0]; if (zu.has(id) || storno.has(id)) continue;
    for (const m of t.matchAll(/\b[0-9a-f]{40}\b/g)) { shas.add(m[0]); nWs++; }
  }
  quellen.push(`warteschlange ${nWs} Köpfe offen`);
  return { namen, shas, quellen };
}

// frist({ repo, main, jetzt (s), stunden, schlange, remote }) → { faellt: [...], aus: {grund: n}, mainSha, datum }
async function frist({ repo, main, jetzt, stunden, schlange, remote = 'origin' }) {
  const g = gitIn(repo);
  const mainSha = g.sync(['rev-parse', main]).trim();
  const d = new Date(jetzt * 1000), zw = (n) => String(n).padStart(2, '0');
  const datum = `${d.getFullYear()}-${zw(d.getMonth() + 1)}-${zw(d.getDate())}`;
  const aus = { dienst: 0, 'andere Basis': 0,'nicht lokal': 0, 'in main': 0, 'jünger': 0, abgabe: 0, schlange: 0, stempel: 0 };
  // 1) die Köpfe am Ursprung (ls-remote: die Wahrheit, nie die lokalen Spiegel-Refs)
  const koepfe = g.sync(['ls-remote', remote, 'refs/heads/*']).split(/\r?\n/).filter(Boolean)
    .map((z) => { const [sha, ref] = z.split(/\s+/); return { sha, name: ref.replace(/^refs\/heads\//, '') }; });
  let k = koepfe.filter((x) => { if (DIENST.test(x.name)) { aus.dienst++; return false; } if (ANDERE_BASIS.test(x.name)) { aus['andere Basis']++; return false; } return true; });
  // 2) Objekte da? (EIN cat-file) — ein fehlender Kopf steht als „nicht lokal“, nie geraten
  const da = g.sync(['cat-file', '--batch-check'], k.map((x) => x.sha).join('\n') + '\n').split(/\r?\n/);
  k = k.filter((x, i) => { if (/ commit /.test(da[i] || '')) return true; aus['nicht lokal']++; return false; });
  // 3) Zeit und Autor des letzten Commits (EIN log --no-walk)
  const info = new Map();
  if (k.length) for (const z of g.sync(['log', '--no-walk=unsorted', '--format=%H%x09%ct%x09%an', '--stdin'], k.map((x) => x.sha).join('\n') + '\n').split(/\r?\n/)) {
    const [h, ct, an] = z.split('\t'); if (h) info.set(h, { zeit: +ct, autor: an });
  }
  // 4) Frist: älter als stunden (der Commit IST die Zeit des letzten Pushs, die git kennt)
  k = k.map((x) => ({ ...x, ...info.get(x.sha) })).map((x) => ({ ...x, alter: (jetzt - x.zeit) / 3600 }));
  k = k.filter((x) => { if (x.alter > stunden) return true; aus['jünger']++; return false; });
  // 5) Schlange: Name oder Kopf wartet/fährt
  k = k.filter((x) => { if (schlange.namen.has(x.name) || [...schlange.shas].some((s) => x.sha.startsWith(s))) { aus.schlange++; return false; } return true; });
  // 6) eigene Commits vor main: keiner → in main; einer „Abgabe w…“ → bleibt
  const vor = await pool(k, 8, async (x) => (await g.async(['log', '--format=%s', mainSha + '..' + x.sha])).split(/\r?\n/).filter(Boolean));
  k = k.map((x, i) => ({ ...x, vor: vor[i].length, abgabe: vor[i].some((s) => /^Abgabe w/.test(s)) }));
  k = k.filter((x) => { if (!x.vor) { aus['in main']++; return false; } if (x.abgabe) { aus.abgabe++; return false; } return true; });
  // 7) Stempel in der Schlange: der Kopf ist Vorfahr eines wartenden/fahrenden Kopfs (der Stempel w<nn>-* trägt ihn)
  const sKoepfe = [];
  for (const n of schlange.namen) { try { sKoepfe.push(g.sync(['rev-parse', '--verify', '-q', remote + '/' + n]).trim()); } catch (_e) { /* nicht lokal */ } }
  for (const s of schlange.shas) if (s.length === 40) sKoepfe.push(s);
  const istVorfahr = (a, b) => new Promise((ok) => execFile('git', ['merge-base', '--is-ancestor', a, b], opt(repo), (e) => ok(!e)));
  const st = await pool(k, 8, async (x) => { for (const s of sKoepfe) if (s !== x.sha && await istVorfahr(x.sha, s)) return true; return false; });
  k = k.filter((x, i) => { if (st[i]) { aus.stempel++; return false; } return true; });
  // 8) eigene Code-Zeilen, die nicht in main stehen (die Rechnung des Blicks)
  const set = await mainZeilen(g, mainSha);
  const ih = await pool(k, 8, (x) => inhalt(g, mainSha, set, x.sha));
  const faellt = k.map((x, i) => ({ ...x, eigene: ih[i] ? ih[i].neu - ih[i].hit : null, bergung: bergungVon(x.name), ziel: `refs/archiv/${datum}/${x.name}` }))
    .sort((a, b) => (!!b.bergung - !!a.bergung) || (b.alter - a.alter));
  return { faellt, aus, mainSha, datum };
}

function fristText(r, stunden, quellen, befehle) {
  const b = r.faellt.filter((x) => x.bergung);
  const ausT = Object.entries(r.aus).filter(([, n]) => n).map(([w, n]) => `${w} ${n}`).join(' · ');
  const kopf = `FRIST (> ${stunden} h ohne Abgabe-Commit, nicht in der Schlange) an main ${r.mainSha.slice(0, 8)}, Archiv refs/archiv/${r.datum}/: ${r.faellt.length} Zweige, davon ${b.length} BERGUNG — bleiben: ${ausT}${quellen ? ` · Schlange gelesen: ${quellen.join(', ')}` : ''}`;
  const z = (x) => `${x.name} · ${x.sha.slice(0, 8)} · ${Math.floor(x.alter)} h · ${x.autor} · ${x.eigene == null ? '?' : x.eigene} eigene Zeilen nicht in main · → ${x.ziel}`;
  if (!befehle) return [kopf, ...r.faellt.map((x) => (x.bergung ? `BERGUNG — braucht Besitzer (Familie ${x.bergung})  ` : 'FÄLLT  ') + z(x))].join('\n');
  const o = [`# ${kopf}`, '# NUR GEDRUCKT, nie ausgeführt. Je Zweig: (1) Archiv-Push desselben SHA, (2) Prüfung per ls-remote, (3) erst dann der Kopf weg —',
    '# mit Lease auf den SHA (ein Push dazwischen lässt den Kopf stehen). Zurück holt ihn: git push origin refs/archiv/<datum>/<name>:refs/heads/<name>'];
  for (const x of r.faellt) {
    if (x.bergung) { o.push(`# BERGUNG — braucht Besitzer (Familie ${x.bergung}), KEIN Befehl: ${z(x)}`); continue; }
    o.push(`# ${z(x)}`);
    o.push(`git push origin ${x.sha}:${x.ziel} && [ "$(git ls-remote origin ${x.ziel} | cut -f1)" = ${x.sha} ] && git push --force-with-lease=refs/heads/${x.name}:${x.sha} origin :refs/heads/${x.name}`);
  }
  return o.join('\n');
}

// Selbsttest der Frist im Sandkasten: ein Ursprung mit main und sieben Zweigen, die Zeit fest
async function fristSelbsttest() {
  const X = fs.mkdtempSync(path.join(os.tmpdir(), 'frist-selbsttest-'));
  const J = 1763500000; // die feste Uhr des Sandkastens
  const sh = (cwd, a, env = {}) => execFileSync('git', a, { cwd, encoding: 'utf8', windowsHide: true, stdio: ['ignore', 'pipe', 'pipe'], env: { ...process.env, ...env } });
  const ursprung = path.join(X, 'u.git'), r = path.join(X, 'r');
  sh(X, ['init', '-q', '--bare', ursprung]); sh(X, ['init', '-q', '-b', 'main', r]); sh(r, ['remote', 'add', 'origin', ursprung]);
  sh(r, ['config', 'user.name', 'Sandkasten']); sh(r, ['config', 'user.email', 's@k']); sh(r, ['config', 'core.autocrlf', 'false']);
  const um = (h) => { const t = `${J - Math.round(h * 3600)} +0100`; return { GIT_AUTHOR_DATE: t, GIT_COMMITTER_DATE: t }; };
  fs.writeFileSync(path.join(r, 'a.js'), 'const grundzeile_der_welt_in_main = "lange genug für die Rechnung";\n');
  sh(r, ['add', '-A']); sh(r, ['commit', '-qm', 'main'], um(200)); sh(r, ['push', '-q', 'origin', 'main']);
  const zweig = (name, h, betreff, zeile) => {
    sh(r, ['checkout', '-q', '-B', name, 'main']);
    fs.writeFileSync(path.join(r, name.replace(/\W/g, '_') + '.js'), `const ${name.replace(/\W/g, '_')}_eigene_zeile = "${zeile || 'gebauter Code, nie in main'}";\n`);
    sh(r, ['add', '-A']); sh(r, ['commit', '-qm', betreff || 'WIP ' + name], um(h)); sh(r, ['push', '-q', 'origin', name]);
  };
  zweig('w99-abgabe', 100, 'Abgabe w99-abgabe: fertig gebaut');
  zweig('w99-schlange', 100);
  zweig('w99-71h', 71);
  zweig('w99-73h', 73);
  zweig('w28-weg-koerper', 100);
  zweig('vorrat99-quelle', 100);
  sh(r, ['checkout', '-q', '-B', 'w99-stempel', 'vorrat99-quelle']); fs.writeFileSync(path.join(r, 'st.js'), 'const stempel_zeile_des_stempels = "der Stempel trägt die Quelle";\n');
  sh(r, ['add', '-A']); sh(r, ['commit', '-qm', 'Abgabe w99-stempel: Stempel'], um(1)); sh(r, ['push', '-q', 'origin', 'w99-stempel']);
  zweig('zug-z999', 100);
  zweig('w99-x-pm', 100);
  sh(r, ['checkout', '-q', 'main']); sh(r, ['fetch', '-q', 'origin']);
  const schlange = { namen: new Set(['w99-schlange', 'w99-stempel']), shas: new Set(), quellen: [] };
  const R = await frist({ repo: r, main: 'origin/main', jetzt: J, stunden: 72, schlange });
  const n = new Map(R.faellt.map((x) => [x.name, x]));
  const bef = fristText(R, 72, null, true);
  // die Bergungs-Namen: jeder Kopf-Name der 15 Familien steht im Bericht (die Quelle der Tafel)
  let bericht = '';
  try { bericht = gitSync(['show', 'origin/koordination:bericht/1811-bergung.md']); } catch (_e) { bericht = ''; }
  const fehlt = BERGUNG.filter((b) => !bericht.includes(b[1])).map((b) => b[1]);
  const faelle = [
    ['Frist: Zweig mit Abgabe-Commit (100 h) bleibt', !n.has('w99-abgabe')],
    ['Frist: Zweig in der Schlange (100 h) bleibt', !n.has('w99-schlange')],
    ['Frist: 71 h bleibt', !n.has('w99-71h')],
    ['Frist: 73 h fällt mit Archiv-Ziel, Alter, Autor und eigenen Zeilen', n.has('w99-73h') && n.get('w99-73h').ziel === `refs/archiv/${R.datum}/w99-73h` && Math.floor(n.get('w99-73h').alter) === 73 && n.get('w99-73h').autor === 'Sandkasten' && n.get('w99-73h').eigene === 1],
    ['Frist: Bergungs-Familie markiert, kein Befehl', n.has('w28-weg-koerper') && !!n.get('w28-weg-koerper').bergung && /# BERGUNG — braucht Besitzer .*w28-weg-koerper/.test(bef) && !/git push origin \S+:refs\/archiv\/\S+\/w28-weg-koerper/.test(bef)],
    ['Frist: Quelle, deren Stempel w<nn>-* in der Schlange steht, bleibt', !n.has('vorrat99-quelle') && R.aus.stempel === 1],
    ['Frist: Dienst-Zweig zug-* bleibt, ein *-pm steht als andere Basis', !n.has('zug-z999') && !n.has('w99-x-pm') && R.aus.dienst >= 2 && R.aus['andere Basis'] === 1],
    ['Frist: Befehl in der Reihe Archiv-Push → ls-remote → Lease-Löschen', new RegExp(`git push origin [0-9a-f]{40}:refs/archiv/${R.datum}/w99-73h && \\[ "\\$\\(git ls-remote origin refs/archiv/${R.datum}/w99-73h \\| cut -f1\\)" = [0-9a-f]{40} \\] && git push --force-with-lease=refs/heads/w99-73h:[0-9a-f]{40} origin :refs/heads/w99-73h`).test(bef)],
    [`Frist: die 15 Kopf-Namen der Bergung stehen im Bericht${fehlt.length ? ' (fehlt: ' + fehlt.join(', ') + ')' : ''}`, BERGUNG.length === 15 && !fehlt.length],
  ];
  // nur gedruckt: der Sandkasten-Ursprung trägt nach dem Lauf jeden Kopf wie vorher, kein refs/archiv
  const nachher = sh(r, ['ls-remote', 'origin']);
  faelle.push(['Frist: nichts ausgeführt (Ursprung ohne refs/archiv, w99-73h steht)', !/refs\/archiv\//.test(nachher) && /refs\/heads\/w99-73h/.test(nachher)]);
  fs.rmSync(X, { recursive: true, force: true });
  return faelle;
}

(async () => {
  if (FRIST && !SELBST) {
    const t0 = Date.now();
    const schlange = schlangeLesen(REPO);
    const r = await frist({ repo: REPO, main: MAIN, jetzt: Math.floor(Date.now() / 1000), stunden: STUNDEN, schlange });
    console.log(fristText(r, STUNDEN, schlange.quellen, BEFEHLE));
    console.error(`(Frist gerechnet in ${((Date.now() - t0) / 1000).toFixed(1)} s)`);
    return;
  }
  const { offen, alle, sek, mainSha } = await messen();
  const teile = offen.map((m) => `${m.zweig}${m.abgabe ? '[Abgabe]' : ''} +${m.vor} ${m.neu}/${m.pct}%`);
  const zeile = `UNGELANDET (≤ ${TAGE} Tage, Inhalt < ${SCHWELLE} % in main ${mainSha.slice(0, 8)}): ${offen.length} — ${teile.join(' · ')}`;
  console.log(zeile);
  // --cache <datei>: der Blick (messplatz-blick.cjs --kurz) liest die Zeile aus der Datei; erste Zeile die Zeit der Rechnung (ms)
  const CACHE = arg('--cache', null);
  if (CACHE) fs.writeFileSync(CACHE, Date.now() + '\n' + zeile + '\n');
  console.error(`(${alle.length} Zweige gemessen in ${sek.toFixed(1)} s)`);
  if (SELBST) {
    const namen = new Set(offen.map((m) => m.zweig));
    const faelle = [
      ['nennt w28-stadt-netz', namen.has('w28-stadt-netz')],
      ...['w28-licht-kern', 'w28-feld-fuss', 'w28-ankunft-faden'].map((z) => [`nennt NICHT ${z} (Squash 2ac706fac)`, !namen.has(z) && alle.some((m) => m.zweig === z)]),
      ...(await fristSelbsttest()),
    ];
    for (const [n, ok] of faelle) console.log(`${ok ? 'GRÜN' : 'ROT '} ${n}`);
    const rot = faelle.filter((f) => !f[1]).length;
    console.log(`SELBSTTEST ${rot ? 'ROT' : 'GRÜN'} ${faelle.length - rot}/${faelle.length} · ${sek.toFixed(1)} s`);
    process.exit(rot ? 1 : 0);
  }
})();
