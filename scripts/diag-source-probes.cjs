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
 * aus Refactors auf, deren Tests nicht nachzogen. Der VOLLE Playtest (der einzige
 * Fänger) läuft NICHT in der CI (lokal-only, V18.347) → ein Refactor kann eine
 * stale Probe durch die CI schmuggeln.
 *
 * DIESE LINSE schliesst die Lücke STRUKTURELL: rein STATISCH (kein Browser), im
 * `check`-CI-Job VOR dem Playtest. Sie extrahiert jedes geprobte `r.<symbol>` aus
 * den Gate-Dateien und prüft, dass das Symbol real in anazhRealm.js (+ Worker/Bake-
 * Mirrors) existiert. Ein geprobtes Symbol, das im Code NICHT mehr vorkommt, ist
 * eine stale Probe → laut + Exit≠0.
 *
 * Disziplin (die V18.267-Falle): Kommentare werden ZUERST gestrippt — der Code darf
 * das Wort tragen, der CODE darf es nicht (sonst flaggt das Doku-Beispiel
 * `__codeOf(r._method)` in einem Kommentar fälschlich).
 *
 * Selbst-Test: `node scripts/diag-source-probes.cjs --selftest` beweist, dass der
 * Detektor eine synthetische stale Probe FÄNGT (der gpu-lens-`warmupCompiles>0`-
 * Guard: die Linse muss feuern KÖNNEN, sonst ist grün bedeutungslos).
 */

'use strict';

const fs = require('fs');
const path = require('path');

const ROOT = path.resolve(__dirname, '..');

// Die Gate-Dateien, deren Proben in der CI/lokal laufen.
const GATE_FILES = ['scripts/playtest.cjs', 'scripts/playtest-fast.cjs'];

// Der Code, in dem ein geprobtes Symbol real existieren MUSS.
// Proben sind `r.<x>` (die Realm-Instanz) → anazhRealm.js. Die Worker-/Bake-Mirrors
// sind als Fallback dabei (geteilte Symbol-Namen), damit ein Mirror-Symbol nie
// fälschlich „fehlt".
const CODE_FILES = ['anazhRealm.js', 'voxel-worker.js', 'bake-core.js', 'bake-worker.js'];

/**
 * Strippt JS-Kommentare (Block + Zeile) UND String-/Template-Literale, ohne über
 * `://` (URLs) oder `//` in Strings zu stolpern. Wir brauchen nur die CODE-Tokens
 * für die Proben-Extraktion bzw. die Symbol-Existenz — Strings/Kommentare nicht.
 */
function stripCommentsAndStrings(src) {
  let out = '';
  let i = 0;
  const n = src.length;
  let state = 'code'; // code | line | block | sq | dq | tpl
  while (i < n) {
    const c = src[i];
    const c2 = i + 1 < n ? src[i + 1] : '';
    if (state === 'code') {
      if (c === '/' && c2 === '/') {
        state = 'line';
        i += 2;
      } else if (c === '/' && c2 === '*') {
        state = 'block';
        i += 2;
      } else if (c === "'") {
        state = 'sq';
        out += ' ';
        i++;
      } else if (c === '"') {
        state = 'dq';
        out += ' ';
        i++;
      } else if (c === '`') {
        state = 'tpl';
        out += ' ';
        i++;
      } else {
        out += c;
        i++;
      }
    } else if (state === 'line') {
      if (c === '\n') {
        state = 'code';
        out += '\n';
      }
      i++;
    } else if (state === 'block') {
      if (c === '*' && c2 === '/') {
        state = 'code';
        i += 2;
      } else {
        if (c === '\n') out += '\n';
        i++;
      }
    } else if (state === 'sq') {
      if (c === '\\') {
        i += 2;
      } else if (c === "'") {
        state = 'code';
        i++;
      } else {
        i++;
      }
    } else if (state === 'dq') {
      if (c === '\\') {
        i += 2;
      } else if (c === '"') {
        state = 'code';
        i++;
      } else {
        i++;
      }
    } else if (state === 'tpl') {
      // Template-Literale könnten ${...}-Code tragen; konservativ als String behandeln
      // (Source-Proben stehen nie in einem Template — sie sind echter JS-Aufruf-Code).
      if (c === '\\') {
        i += 2;
      } else if (c === '`') {
        state = 'code';
        i++;
      } else {
        if (c === '\n') out += '\n';
        i++;
      }
    }
  }
  return out;
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
 * vorkommt. anazhRealm.js ist EINE Datei → jedes reale Methoden-/Feld-/Prop-Symbol
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
    if (fs.existsSync(p)) corpus += '\n' + stripCommentsAndStrings(fs.readFileSync(p, 'utf8'));
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
  const ok = detected && !realDetectedStale && !commentLeak;
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
  if (!(flagsStale && keepsReal && extractsCode && ignoresComment)) {
    console.error(
      `❌ SELFCHECK FEHLGESCHLAGEN — die Linse ist blind (stale:${flagsStale} real:${keepsReal} extract:${extractsCode} comment:${ignoresComment}). Kein verlässliches Grün.`
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

  if (stale.length === 0) {
    console.log(`\n✅ Alle ${probes.size} geprobten Symbole existieren im Code — keine stale Probe.`);
    process.exit(0);
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
