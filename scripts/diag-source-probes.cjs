#!/usr/bin/env node
/*
 * DIE STALE-SOURCE-PROBE-LINSE  (npm run gate:source-probes)
 * ---------------------------------------------------------------------------
 * GESETZ #0 — baue die LINSE, verlass dich nicht auf Wachsamkeit.
 *
 * Das Gate trägt ~455 Source-Probes (`r.<sym>.toString()` / `__codeOf(r.<sym>)`),
 * die das Verhalten an der QUELLE prüfen. Ein Probe wird STALE, wenn ein Refactor
 * das geprobte Symbol UMBENENNT oder ENTFERNT:
 *   - eine Präsenz-Probe (`/X/.test(r._foo.toString())`) WIRFT dann (`_foo` ist
 *     undefined) — ein blindes/sterbendes Gate verschluckt den Throw;
 *   - eine Absenz-Probe (`!/X/.test(__codeOf(r._foo))`) passt VAKUÖS (`__codeOf`
 *     liefert "" für ein totes Symbol) — sie wird grün, obwohl sie nichts mehr misst.
 * Das ist die c1c1271-Klasse: das Gate-vom-Tod-befreit deckte 31 verdeckte Fehler
 * aus Refactors auf, deren Tests nicht nachzogen. Der volle Playtest läuft in der CI
 * (check.yml voll, Gruppe 1: integ-probe, main, nachts, Zweige mit `[ci voll]`), aber eine
 * vakuöse Absenz-Probe besteht ihn GRÜN — er kann sie nicht fangen.
 *
 * DIESE LINSE schliesst die Lücke STRUKTURELL: rein STATISCH (kein Browser), in
 * `npm run check`. Sie extrahiert jedes geprobte `r.<symbol>` aus den Gate-Dateien
 * und prüft, dass das Symbol real im Stamm (+ Worker-Spiegel) existiert. Ein
 * geprobtes Symbol, das im Code NICHT mehr vorkommt, ist
 * eine stale Probe → laut + Exit≠0.
 *
 * Disziplin (die V18.267-Falle): Kommentare werden ZUERST gestrippt — der Code darf
 * das Wort tragen, der CODE darf es nicht (sonst flaggt das Doku-Beispiel
 * `__codeOf(r._method)` in einem Kommentar fälschlich).
 *
 * Selbst-Test: `node scripts/diag-source-probes.cjs --selftest` beweist, dass der
 * Detektor eine synthetische stale Probe FÄNGT (der gpu-lens-`warmupCompiles>0`-
 * Guard: die Linse muss feuern KÖNNEN, sonst ist grün bedeutungslos).
 *
 * DIE NEBENWELT-QUELL-WAND (Studio-Welle S1): die Gate-Dateien LESEN keine Datei einer
 * Nebenwelt (`worlds/…` — per fs.readFile*, fetch oder require). Eine Welt beweist ihr
 * KONSUM, nie ein Quelltext-Zitat: gate:portal-konformanz betritt jede Welt über die echte
 * Heimat (ready + Manifest, Ereignis im Journal, das Mitgebrachte in der Welt-UI, Esc heim,
 * Quellen-Wand). Im Voll-Playtest standen 26 Regex-/fetch-Proben auf Welt-Quelltext und
 * 4 Manifest-Proben auf Welt-Dateien — jetzt 0; die Wand hält 0.
 */

'use strict';

const fs = require('fs');
const path = require('path');
const stammLib = require('./lib/stamm.cjs');

const ROOT = path.resolve(__dirname, '..');

// Die Gate-Dateien, deren Proben in der CI/lokal laufen.
const GATE_FILES = ['scripts/playtest.cjs', 'scripts/playtest-fast.cjs', ...fs.readdirSync(path.join(ROOT, 'scripts/playtest')).map((f) => 'scripts/playtest/' + f)];

// Der Code, in dem ein geprobtes Symbol real existieren MUSS.
// Proben sind `r.<x>` (die Realm-Instanz) → der Stamm. Die Worker-/Bake-Mirrors
// sind als Fallback dabei (geteilte Symbol-Namen), damit ein Mirror-Symbol nie
// fälschlich „fehlt".
const CODE_FILES = [...stammLib.dateien(path.join(__dirname, '..')), 'voxel-worker.js'];

// Kommentare UND Literale fallen (der EINE Stripper, scripts/lib/stamm.cjs): die Proben-Extraktion braucht nur die
// CODE-Tokens; `keepStrings` behält die Literale (für die Nebenwelt-Quell-Wand).
const stripCommentsAndStrings = (src, keepStrings) => stammLib.ohneKommentare(src, !keepStrings);

/**
 * DIE NEBENWELT-QUELL-WAND: jeder Lese-Aufruf (readFileSync · readFile · fetch · require)
 * im de-kommentierten Code, dessen Argument ein String-Literal `worlds` bzw. `worlds/…`
 * trägt. Das Argument reicht bis zur schließenden Klammer (Klammern gezählt). Ein Pfad als
 * Datenwert (`{ world: "worlds/skeleton/index.html" }`) ist kein Lesen und bleibt frei.
 */
function findWorldSourceReads(codeNoComments) {
  const hits = [];
  const re = /\b(readFileSync|readFile|fetch|require)\s*\(/g;
  let m;
  while ((m = re.exec(codeNoComments)) !== null) {
    let depth = 1;
    let j = re.lastIndex;
    while (j < codeNoComments.length && depth > 0 && j - re.lastIndex < 400) {
      const c = codeNoComments[j];
      if (c === '(') depth++;
      else if (c === ')') depth--;
      j++;
    }
    const arg = codeNoComments.slice(re.lastIndex, j);
    if (/["'`]worlds(?:["'`]|\/)/.test(arg)) {
      const line = codeNoComments.slice(0, m.index).split('\n').length;
      hits.push({ line, call: m[1], arg: arg.replace(/\s+/g, ' ').slice(0, 110) });
    }
  }
  return hits;
}

function scanWorldSourceReads(gateFiles) {
  const out = [];
  for (const f of gateFiles) {
    const p = path.join(ROOT, f);
    if (!fs.existsSync(p)) continue;
    for (const h of findWorldSourceReads(stripCommentsAndStrings(fs.readFileSync(p, 'utf8'), true))) out.push({ file: f, ...h });
  }
  return out;
}

// Die synthetischen Fälle der Wand (Selftest + Always-on-Guard): drei Lese-Arten fangen, Datenwert und Kommentar frei.
function worldWallSelfCheck() {
  const fang = [
    'const src = fs.readFileSync(path.join(__dirname, "..", "worlds", "fluid/fluid.js"), "utf8");',
    "const b = await (await fetch('worlds/skeleton/skeleton.js')).text();",
    'const m = JSON.parse(fs.readFileSync(\n  path.join(__dirname, "..", "worlds", file),\n  "utf8"));',
  ];
  const frei = [
    'r._sanitizePortalMeta({ world: "worlds/skeleton/index.html" }, "fb");',
    '// fs.readFileSync(path.join(__dirname, "..", "worlds", "x.js"))\nconst y = 1;',
    'const src = await fetch("voxel-worker.js").then((x) => x.text());',
  ];
  const gefangen = fang.filter((c) => findWorldSourceReads(stripCommentsAndStrings(c, true)).length === 1).length;
  const falsch = frei.filter((c) => findWorldSourceReads(stripCommentsAndStrings(c, true)).length > 0).length;
  return { ok: gefangen === fang.length && falsch === 0, gefangen, von: fang.length, falsch };
}

/**
 * Extrahiert die geprobten `r.<chain>`-Symbole aus de-kommentiertem Gate-Code.
 * Formen:
 *   r.<chain>.toString()
 *   __codeOf(r.<chain>)
 * <chain> ist ein punkt-getrennter Identifier-Pfad (z. B. `dslEffects.spawn_creature`).
 * Lokale Aliase (`fn.toString()`, `__codeOf(matSrc)`) sind dynamisch und werden
 * bewusst ÜBERSPRUNGEN (nicht statisch zu einem Klassen-Symbol auflösbar).
 */
function extractProbes(codeNoComments) {
  const chains = new Map(); // chain -> Anzahl
  const reToString = /\br\.([A-Za-z_$][\w$]*(?:\.[A-Za-z_$][\w$]*)*)\s*\.toString\s*\(/g;
  const reCodeOf = /__codeOf\(\s*r\.([A-Za-z_$][\w$]*(?:\.[A-Za-z_$][\w$]*)*)\s*\)/g;
  let m;
  while ((m = reToString.exec(codeNoComments)) !== null) {
    chains.set(m[1], (chains.get(m[1]) || 0) + 1);
  }
  while ((m = reCodeOf.exec(codeNoComments)) !== null) {
    chains.set(m[1], (chains.get(m[1]) || 0) + 1);
  }
  return chains;
}

/**
 * Ein Symbol „existiert", wenn sein Name als Wort im (de-kommentierten) Code-Korpus
 * vorkommt. Der Stamm ist EIN Text (stammLib.text) → jedes reale Methoden-/Feld-/Prop-Symbol
 * erscheint mindestens an seiner Definition. 0 Vorkommen = definitiv nicht im Code
 * = stale Probe. (Konservativ: niedrige False-Positive-Rate; ein nur-computed-key-
 * Symbol, das per Literal geprobt wird, wäre selbst ein Code-Smell.)
 */
function buildSymbolPresence(codeCorpus) {
  const present = new Set();
  const re = /[A-Za-z_$][\w$]*/g;
  let m;
  while ((m = re.exec(codeCorpus)) !== null) present.add(m[0]);
  return present;
}

function loadCorpus(files) {
  let corpus = '';
  for (const f of files) {
    const p = path.join(ROOT, f);
    // laut statt still: ein fehlender Korpus machte jede Probe vakuum-rot oder -grün
    if (!fs.existsSync(p)) throw new Error(`source-probes: der Korpus ${f} fehlt`);
    corpus += '\n' + stripCommentsAndStrings(fs.readFileSync(p, 'utf8'));
  }
  return corpus;
}

function analyze(gateFiles) {
  const present = buildSymbolPresence(loadCorpus(CODE_FILES));
  const probes = new Map(); // chain -> { count, files:Set }
  for (const f of gateFiles) {
    const p = path.join(ROOT, f);
    if (!fs.existsSync(p)) continue;
    const code = stripCommentsAndStrings(fs.readFileSync(p, 'utf8'));
    for (const [chain, count] of extractProbes(code)) {
      const e = probes.get(chain) || { count: 0, files: new Set() };
      e.count += count;
      e.files.add(f);
      probes.set(chain, e);
    }
  }
  const stale = [];
  for (const [chain, info] of probes) {
    // Jedes Segment der Kette muss als Wort im Code existieren.
    const missing = chain.split('.').filter((seg) => !present.has(seg));
    if (missing.length) stale.push({ chain, missing, ...info });
  }
  return { probes, stale, symbolCount: present.size };
}

function runSelfTest() {
  // Synthetische stale Probe gegen den echten Code-Korpus prüfen — der Detektor MUSS feuern.
  const present = buildSymbolPresence(loadCorpus(CODE_FILES));
  const fakeChain = '_definitelyStaleProbeSymbolXYZ123';
  const synthetic = `const r = window.anazhRealm; if (/x/.test(r.${fakeChain}.toString())) {}`;
  const chains = extractProbes(stripCommentsAndStrings(synthetic));
  const detected = chains.has(fakeChain) && !present.has(fakeChain);
  // Und: ein REALES Symbol darf NICHT als stale gelten (kein blind-rot).
  const realChain = 'spawnArchitecture';
  const realDetectedStale = !present.has(realChain);
  console.log(`[selftest] synthetische stale Probe '${fakeChain}' gefangen: ${detected ? 'JA' : 'NEIN'}`);
  console.log(`[selftest] reales Symbol '${realChain}' fälschlich stale: ${realDetectedStale ? 'JA' : 'NEIN'}`);
  // Und: ein Kommentar-getragenes Symbol darf NICHT extrahiert werden (V18.267-Falle).
  const commentSrc = `// das Doku-Beispiel window.__codeOf(r._totallyFakeCommentSym) erklärt nur\nconst x = 1;`;
  const fromComment = extractProbes(stripCommentsAndStrings(commentSrc));
  const commentLeak = fromComment.has('_totallyFakeCommentSym');
  console.log(`[selftest] Kommentar-Symbol fälschlich extrahiert: ${commentLeak ? 'JA' : 'NEIN'}`);
  const wand = worldWallSelfCheck();
  console.log(`[selftest] Nebenwelt-Quell-Wand: ${wand.gefangen}/${wand.von} Welt-Lesungen gefangen · ${wand.falsch} Datenwert/Kommentar fälschlich gefangen`);
  const ok = detected && !realDetectedStale && !commentLeak && wand.ok;
  console.log(ok ? '\n✅ SELFTEST OK — die Linse feuert auf stale, schweigt auf real, ignoriert Kommentare.' : '\n❌ SELFTEST FEHLGESCHLAGEN.');
  process.exit(ok ? 0 : 1);
}

// Always-on Guard (Gesetz #0 — der Zähler MUSS feuern können, sonst ist grün
// bedeutungslos). REIN SYNTHETISCH — hängt an keinem realen Symbol, das selbst
// wegrefaktoriert werden könnte. Läuft VOR jedem echten Scan; bricht laut ab, wenn
// die Detektor-Logik gebrochen ist.
function selfCheckOrDie() {
  const present = new Set(['realA', 'realB']);
  const isStale = (chain) => chain.split('.').filter((s) => !present.has(s));
  const flagsStale = isStale('ghostSym').length === 1; // ghostSym ∉ present → stale
  const keepsReal = isStale('realA').length === 0; // realA ∈ present → ok
  const extractsCode = extractProbes('const y = r.realA.toString();').has('realA');
  const ignoresComment = !extractProbes(stripCommentsAndStrings('// __codeOf(r.ghostSym)\n')).has(
    'ghostSym'
  );
  const wand = worldWallSelfCheck().ok;
  if (!(flagsStale && keepsReal && extractsCode && ignoresComment && wand)) {
    console.error(
      `❌ SELFCHECK FEHLGESCHLAGEN — die Linse ist blind (stale:${flagsStale} real:${keepsReal} extract:${extractsCode} comment:${ignoresComment} welt-wand:${wand}). Kein verlässliches Grün.`
    );
    process.exit(2);
  }
}

function main() {
  if (process.argv.includes('--selftest')) return runSelfTest();
  selfCheckOrDie();

  const { probes, stale, symbolCount } = analyze(GATE_FILES);
  console.log('=== Stale-Source-Probe-Linse ===');
  console.log(`Gate-Dateien: ${GATE_FILES.join(', ')}`);
  console.log(`Code-Korpus-Symbole: ${symbolCount}`);
  console.log(`Geprüfte r.<symbol>-Proben (unique): ${probes.size}`);

  const welt = scanWorldSourceReads(GATE_FILES);
  if (welt.length) {
    console.log(`\n⛔ ${welt.length} NEBENWELT-QUELL-PROBE(N) — eine Gate-Datei liest eine Welt-Datei (Existenz statt Konsum):`);
    for (const h of welt) console.log(`  • ${h.file}:${h.line}  ${h.call}(${h.arg})`);
    console.log(
      '\nEine Welt beweist ihr KONSUM (gate:portal-konformanz: ready + Manifest, Ereignis im Journal,' +
        '\ndas Mitgebrachte in der Welt-UI, Esc heim, Quellen-Wand), nie ein Quelltext-Zitat.'
    );
  } else {
    console.log('Nebenwelt-Quell-Wand: 0 Lese-Aufrufe auf worlds/ in den Gate-Dateien.');
  }

  if (stale.length === 0) {
    console.log(`\n✅ Alle ${probes.size} geprobten Symbole existieren im Code — keine stale Probe.`);
    process.exit(welt.length ? 1 : 0);
  }

  console.log(`\n⛔ ${stale.length} STALE PROBE(N) — geprobtes Symbol existiert NICHT (mehr) im Code:`);
  for (const s of stale.sort((a, b) => a.chain.localeCompare(b.chain))) {
    console.log(
      `  • r.${s.chain}  (${s.count}× in ${[...s.files].join(', ')})  — fehlt: ${s.missing.join(', ')}`
    );
  }
  console.log(
    '\nEine stale Probe misst nichts mehr (Absenz-Grep passt vakuös / Präsenz-Grep wirft).' +
      '\nHeile sie an der WURZEL: das geprobte Symbol an seinen neuen Namen/Ort ziehen,' +
      '\nODER die Probe entfernen, wenn ihr Verhalten nicht mehr existiert (V9.56-i: der Test' +
      '\nwandert mit dem Code). KEIN Aufweichen.'
  );
  process.exit(1);
}

main();
