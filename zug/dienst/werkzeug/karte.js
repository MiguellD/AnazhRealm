export const meta = {
  name: 'karte',
  description: 'Karten nach dem Prozess vom 11.10.: EIN Bauer je Karte (Kontext-Deckel mit Übergabe an einen frischen Nachfolger), Prüftiefe nach Risiko R0–R3 (statt fester Runden), Nachbesserung als neuer Arbeiter; args.karten = [{id, titel, risiko, zweig, basis, ports, prPorts, auftrag}]',
  phases: [
    { title: 'Bau', detail: 'Bauer, bei Übergabe ein frischer Nachfolger (höchstens 3)' },
    { title: 'Abnahme', detail: 'Prüfer nach Risiko, Nachbesserung als neuer Arbeiter' },
  ],
}

// Start: Workflow({ scriptPath: '…\\workflows\\karte.js', args: { karten: [ { id: 'K02', titel: '…', risiko: 'R2', zweig: 'schau2-wasser-wahrheit',
//   basis: '<SHA oder Text>', ports: '8200–8209', prPorts: '8210–8219', auftrag: '<Kartentext aus richtung-1110/entscheidung.md §4>' } ] } })
// Prozess: artifacts/profiband/richtung-1110/entscheidung.md §2 (Budget nach Wochenlimit, ≤ 3 schwere Arbeiter, Prüftiefe R0–R3, WIP).

const R = 'C:\\Users\\micha\\AnazhRealm-profiband'
const WT = R + '\\.claude\\worktrees\\'
const AP = R + '\\artifacts\\profiband\\'
const ENT = AP + 'richtung-1110\\entscheidung.md'
const A = args && typeof args === 'object' ? args : {}
const KARTEN = Array.isArray(A.karten) ? A.karten : []
if (!KARTEN.length) throw new Error('karte.js: args.karten fehlt')

const KOPF = `Lies zuerst DIE GOLDENE DEFINITION in CLAUDE.md — sie ist bindend.
KARTENKOPF (Prozess vom 11.10., ${ENT} §2 + §4; Arbeitsweise 2.0 vom 16.10.: Zweig koordination auftrag/arbeitsweise-2-1610.md — Fehler-Klassen §2 gelten als Verbote). NORDSTERN: lies den Studio-Block deiner Domäne in C:\\Users\\micha\\AnazhRealm-profiband\\.claude\\worktrees\\koordination\\auftrag\\nordstern.md §5 (Soll-Satz, Ziele mit Zahl und Quelle, Muster M0–M8) — er ist der Maßstab für dein Bild.
1. Ort, Branch und Ports stehen unten; bleib darin. GPU-Schloss (atomar \`mkdir C:\\Users\\micha\\AppData\\Local\\Temp\\claude\\gpu-schloss\` + besitzer.txt mit deinem Namen) NUR um eine einzelne ZEIT-Messung (gpu-bank, takt, zerlegen, Kalt-Zeile, A/B in ms) — Bilder, Tafel-Messungen ohne ms und Linsen ohne Zeit-Urteil fahren OHNE Schloss auf der Radeon (16.10.: Arbeiter warteten bis 25 min auf ein Bild, die Anatomie zählte 4,7 h echtes Schloss-Warten); lösen nur, wenn besitzer.txt deinen Namen trägt; scheitert das mkdir: headless weiter, später erneut. VERWAIST: ist besitzer.txt älter als 60 min (das Schloss gilt nur um EINEN Lauf von Minuten), lösche das Schloss und nenne alten Besitzer + Alter in deiner Rückgabe. ZEIT misst nur der OMEN: KEINE lokalen Boot-Serien (A B B A über mehrere Boots, Kalt-Serien, Geh-Serien) — diese Maschine teilt EINE Radeon mit bis zu acht Arbeitern, Serien zerfallen an Schloss-Wartezeiten, EADDRINUSE und Fremdlast und fressen deinen Kontext (15.10.: drei Karten liefen so viermal in den Deckel). Lokal NUR: Profil und A/B in EINER Welt per werkbank methode; die Serie nennst du in der Rückgabe (Befehlsfolge, Köpfe), der Koordinator bestellt sie beim OMEN. Das Auge des Koordinators (Port 7880) läuft daneben.
2. Ablauf: Linse vorher ROT zeigen (Exit-Zeile, Täter beim Namen) → Schnitt an der EINEN Engstelle (die ganze Klasse) → Puls (node --check, \`npx eslint\` auf geänderte Dateien, \`npm run format:check\` (~6 s, sonst fällt erst die CI), Gates der berührten Zonen; lokal \`npm run check\` nur mit \`TAILLE_PORT=<frei>\` — 4312 gehört dem Schöpfer) → Linse GRÜN → \`npm run playtest:fast\` → Bild der Karten-Szene aus dem Ausgabe-Pfad (scripts/lib/ausgabe-aufnahme.cjs; selbst ansehen) → Push → enden. NICHT auf die CI warten (der CI-Wächter der Abnahme liest sie, ehe ein Prüfer startet). Der volle Playtest läuft beim Integrator je Merge, nicht hier.
3. WIP: alle 45 min Arbeit und nach jedem grünen Teilschritt \`git commit\` mit Betreff „WIP <Karte>: <Stand> [skip ci]“ (Rumpf = Übergabe ≤ 15 Zeilen: Stand · nächster Schritt · Linse vorher/jetzt mit Zahl + Rohdatei · berührte Methoden · offene Täter-Hypothese · offene Fragen), dann \`git push\`. Ein WIP-Commit besteht node --check und merget nie. Der LETZTE Push der Karte trägt KEIN [skip ci] — erst er erzeugt die Zweig-CI, die vor dem Merge grün sein muss (die liest der Prüfer bzw. der Koordinator). CI in zwei Stufen (K14): jeder Push fährt den Puls (≤ 2 min); JEDE Karte schreibt in die Message ihres letzten Pushes zusätzlich \`[ci voll]\` — erst dann läuft die volle Batterie auf dem Zweig, und erst ihr Urteil öffnet die Abnahme.
4. KONTEXT-DECKEL: spätestens nach ~120 Werkzeug-Aufrufen ODER wenn dein Kontext groß wird (viele lange Ausgaben, Ganzdatei-Lesen) → WIP-Commit + Push, dann Rückgabe mit abgeschlossen=false und der Übergabe; ein frischer Nachfolger übernimmt. Lies gezielt (atlas --find, grep -n, sed -n Bereiche), nie den Monolithen ganz.
5. Verboten: git stash; spawn_task/Aufgaben-Chips (Offenes gehört in die Rückgabe); \`x-*\`/\`tmp-*\`/Erkundungs-Skripte committen (sie leben in deinem Scratch C:\\Users\\micha\\AppData\\Local\\Temp\\claude\\<karte>\\); Siegel-Wörter (fertig, RUND, vollendet, vollzogen, Schluss, SCOPE ZU — auch als Wortteil); force-push.
5b. DIE DECKE (PFLICHT-OFFEN D3, Wand in gate:betriebsgesetz): \`scripts/\` wächst NIE — netto ≤ 0 Zeilen UND ≤ 0 Dateien je Zweig (Ratschen spec/profiband/ratsche-* zählen nicht). Eine neue Linse ERSETZT eine alte (Text-Linse → Konsum-Probe \`__consumes\`, Liste → Gesetz), nie zusätzlich; eine Linse, die an deinem Schnitt bricht, wird zur Laufzeit-Marke statt am Text nachgezogen. Eine Linse, die ohne Code-Änderung kippt (Wanduhr, Boot-Wartung), ist selbst ROT: in Ereignis-Zeit bringen oder streichen. Im Zweifel: weniger Prüfung, mehr Spiel. Nie \`prettier --write\` über scripts/.
5c. PROFIL VOR SCHÄTZUNG (Arbeitsweise 2.0): jede Erwartung in ms kommt aus einem Profil des ECHTEN Pfads (\`werkbank takt\`, \`werkbank zerlegen\`/\`gpu-bank\`, \`diag-boot-stage\`), nie aus einem Spike-Proxy; die Rohdatei steht neben der Zahl. DATEI-BESITZ: du schreibst nur in deinem BESITZ (unten); geteilte Dateien (spec/abnahme/soll-tafel.json, scripts/werkbank.cjs, scripts/playtest.cjs, stamm/25c.js) nur kleine Hunks an deinen eigenen Proben — nie eine neue gemeinsame Hilfe, die eine parallele Karte auch bauen könnte. Vor dem letzten Push \`git merge origin/integ-probe\` (Kopf per ls-remote) und Konflikte semantisch lösen. Uhrzeiten nur aus \`date\`.
5d. DIE KOSTEN REISEN MIT (17.10.: A3b und A9 kosteten an der Wiese +0,72 ms GPU, sichtbar erst zwei Bündel später auf dem OMEN): berührt deine Karte, was das Bild zeichnet (stamm/bild-*, Shader, Pässe, Render-Ziele, Uhren), misst sie \`gpu-bank\` Wiese Ego vorher/nachher auf der Radeon in EINER Welt (\`werkbank methode <name> --quelle <stand>\` tauscht live, ~5 min; eigener save-server \`PORT=<deine Ports> node save-server.js\` + \`werkbank start --echt --seite http://localhost:<port>\`, NIE 4312) und schreibt beide Zahlen in die Message; langsamer als vorher ohne Gegenwert im Bild ist nicht merge-reif.
6. Jede Zahl mit Rohdatei-Pfad, jedes „grün“ mit \`echo EXIT=$?\`. Eine neue Linse nur vorher ROT am Täter, in eine BESTEHENDE Familie/Suite, mit Selbsttest, ≤ 3 min CI (Laufzeit vorher/nachher im Commit), CI-Schritt mit \`matrix.gruppe\` (gate:ci-deckung). Kerne (*-core.js) nie prettier --write, Studio-Code nur unter Byte-Beweis (Re-Mint = begründeter Vertrags-Akt). Monolith-Chirurgie AST-sicher. Regex/Escape nur mit dem Edit-Werkzeug. Jede versionierte Datei trägt ihren \`?v=\`-Stempel.
7. Commit-Rumpf: drei Sätze (geschnitten · gemessen · offen), ≤ 600 Zeichen, deutsch, emoji-frei, letzte Zeile \`Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>\`. SHAs nur per \`git ls-remote origin <branch>\`. Vor der Rückgabe: eigene Prozesse beendet, Ports frei, Baum sauber, Kopf gepusht, GPU-Schloss gelöst.`

const ERG = {
  type: 'object',
  properties: {
    kopf: { type: 'string', description: 'voller SHA des gepushten Kopfs' },
    abgeschlossen: { type: 'boolean', description: 'true = Karte durch bis Push; false = Kontext-Deckel/Abbruch, Übergabe folgt' },
    uebergabe: { type: 'string', description: '≤ 15 Zeilen: Stand · nächster Schritt · Linse vorher/jetzt · berührte Methoden · offene Fragen' },
    befund: { type: 'string' },
    linse: { type: 'string', description: 'Name, vorher ROT (Exit, Täter), nachher GRÜN (Exit), Rohdatei' },
    gates: { type: 'array', items: { type: 'object', properties: { name: { type: 'string' }, exit: { type: 'string' } }, required: ['name', 'exit'] } },
    bilder: { type: 'array', items: { type: 'string' } },
    offen: { type: 'array', items: { type: 'string' } },
  },
  required: ['kopf', 'abgeschlossen', 'uebergabe', 'befund', 'linse', 'gates', 'bilder', 'offen'],
}
const reif = (p) => !!p && /merge-reif:\s*ja/i.test(String(p))
// Prüftiefe nach Risiko (richtung-1110/entscheidung.md §2.6): nie ohne Prüfer; R0 = leichter Diff-Prüfer mit Vakuum-Probe;
// tiefe Klassen (k.tief: Wasser, Prüfbühne, Kampf) eine Runde mehr
// Schöpfer 11.10. („unglaublich viele Prüfungen — Optimierung sollte nicht länger dauern als Neuerstellung“): R0/R1 ohne eigenen Prüfer —
// Linse + Puls + Bild des Bauers, die Prüfung macht der Integrator gebündelt; R2/R3 behalten ihren Prüfer (dort fing er echte Brüche).
// 15.10. (Mess-Befund 18 Karten-Workflows: Prüfer + Nachbesserer trugen ~70 % der Arbeiter, ein Teil davon Härtung von Text-Linsen gegen
// Syntax-Varianten): je Risiko eine Nachbesserung weniger; danach entscheidet der Koordinator (Merge mit benanntem Rest, Messung, Folgekarte)
const TIEFE = { R0: { pruefer: 0, nach: 1 }, R1: { pruefer: 0, nach: 1 }, R2: { pruefer: 1, nach: 1 }, R3: { pruefer: 2, nach: 2 } }

// DIE CI ZUERST (Anatomie 16.10., 288 Arbeiter, koordination bericht/1610-anatomie.md: 39 von 60 Nein-Runden trugen ein rotes CI-Urteil,
// die Prüferzeit darin 10,6–22 h — der Prüfer startete, bevor die Zweig-CI stand): nach dem Bau und nach jeder Nachbesserung liest ein
// billiger CI-Wächter die Zweig-CI am Kopf; ROT geht DIREKT an den Nachbesserer (mit den ❌-Zeilen), der Prüfer kommt nur auf GRÜNE CI.
const CI = {
  type: 'object',
  properties: {
    gruen: { type: 'boolean' },
    lauf: { type: 'string', description: 'Lauf-ID und Kopf-SHA' },
    rot: { type: 'string', description: 'je rotem Job: Gruppe, Schritt, die ❌/ROT-Zeilen aus dem Job-Log (höchstens ~40 Zeilen); leer wenn grün' },
  },
  required: ['gruen', 'lauf', 'rot'],
}
const ciWaechter = (k, kopf, runde) => agent(`Du bist der CI-WÄCHTER der KARTE ${k.id} (Branch ${k.zweig}). NUR LESEN, nichts ändern, kein Commit, kein Worktree. Der Kopf laut Arbeiter: ${kopf || '(unbekannt)'}; prüfe ihn per \`git -C ${R} ls-remote origin ${k.zweig}\` — weicht er ab, nimm den Remote-Kopf. Warte, bis die GitHub-CI dieses Kopfs fertig ist: \`bash C:/Users/micha/AnazhRealm-profiband/artifacts/profiband/werkzeug/ci-warte.sh <sha>\` (blockiert, bis kein Lauf mehr läuft; Bash-Timeout 600000; endet der Aufruf am Deckel, rufe ihn erneut — höchstens 75 min insgesamt). Steht nach 6 min KEIN Lauf (Kopf mit [skip ci] oder nicht gepusht): gruen=false, rot='keine Zweig-CI am Kopf <sha> — der letzte Push braucht [ci voll] statt [skip ci]'. Der Job „echt“ darf skipped sein (er läuft nur auf integ-probe). Ist ein Job failure: Job-IDs und Logs per API (Token: \`printf "protocol=https\\nhost=github.com\\n\\n" | git credential fill\`, Feld password; GET https://api.github.com/repos/MiguellD/AnazhRealm/actions/runs?head_sha=<sha>, dann jobs_url, dann /actions/jobs/<id>/logs mit curl -L) und je rotem Job Gruppe, Schritt-Name und die Zeilen \`grep -E "❌|ROT|Error|FAIL"\` (höchstens ~40). Rohdateien nur in C:\\Users\\micha\\AppData\\Local\\Temp\\claude\\ci-${k.id}-${runde}\\. Rückgabe: die Form.`, { label: `ci${runde}:` + k.id, phase: 'Abnahme', schema: CI, model: 'sonnet', effort: 'low' })
const ciRot = (c) => `merge-reif: nein — Zweig-CI ROT (${c ? c.lauf : 'CI-Wächter ohne Ergebnis'}). Die roten Schritte:\n${c ? c.rot : ''}`

const wtPfad = (k) => (k.wt ? WT + k.wt : WT + k.zweig)
const ort = (k) => `${k.besitz ? 'BESITZ: ' + k.besitz + '\n' : ''}ORT: Worktree ${wtPfad(k)} auf Branch ${k.zweig}. Existiert er: \`git -C ${wtPfad(k)} status\` + \`log --oneline -8\` sichten (oberster Commit kann „WIP …“ oder „Zwischenstand-Sicherung … UNGEPRUEFT“ sein — jeden Teil-Stand prüfen, nichts ungesehen verwerfen) und dort weiterbauen. Existiert er nicht: \`git -C ${R} worktree add ${wtPfad(k)} ${k.zweig}\` (Branch auf origin, per ls-remote prüfen) bzw. neu \`git -C ${R} worktree add -b ${k.zweig} ${wtPfad(k)} ${k.basis}\`; dort \`npm ci\`. Ports AUSSCHLIESSLICH ${k.ports} (save-server PORT=…, werkbank --port, Gates über ihre Port-Env-Variablen; Gates mit fest verdrahtetem 4312 nur über eine Wegwerf-Kopie mit deinem Port). Verboten: 3000/4312/4313/4489/4490/4542/7880 und fremde Bereiche.`

const bauen = async (k) => {
  let e = await agent(`${KOPF}\n\nKARTE ${k.id} — ${k.titel} (Risiko ${k.risiko}).\n${ort(k)}\nDER AUFTRAG:\n${k.auftrag}\nRÜCKGABE: die Form.`, { label: 'bau:' + k.id, phase: 'Bau', schema: ERG, agentType: 'champion' })
  for (let n = 1; n <= 3 && e && !e.abgeschlossen; n++) {
    log(`${k.id}: Übergabe ${n} an einen frischen Bauer`)
    const f = await agent(`${KOPF}\n\nKARTE ${k.id} — ${k.titel} (Risiko ${k.risiko}). FORTSETZUNG ${n}: dein Vorgänger hat am Kontext-Deckel übergeben.\n${ort(k)}\nSEINE ÜBERGABE:\n${e.uebergabe}\nSein Befund bisher: ${String(e.befund).slice(0, 4000)}\nDER AUFTRAG (unverändert):\n${k.auftrag}\nRÜCKGABE: die Form.`, { label: `bau${n + 1}:` + k.id, phase: 'Bau', schema: ERG, agentType: 'champion' })
    if (!f) break
    e = f
  }
  return e
}

const pruefen = (k, e, runde, winkel) => agent(`Lies zuerst DIE GOLDENE DEFINITION in CLAUDE.md — sie ist bindend.\nDu bist der unabhängige PRÜFER (Runde ${runde}${winkel ? ', Winkel: ' + winkel : ''}) der KARTE ${k.id} — ${k.titel} (Risiko ${k.risiko}; Branch ${k.zweig}, Kopf per \`git ls-remote origin ${k.zweig}\`). NUR LESEN, kein Commit. EIGENER Scratch C:\\Users\\micha\\AppData\\Local\\Temp\\claude\\pruef-${k.id}-${runde}\\ (nie der geteilte Sitzungs-Scratchpad — am 13.10. überschrieb ein Prüfer die jobs.json des anderen). Für Läufe einen EIGENEN detached Prüf-Worktree \`git -C ${R} worktree add --detach ${WT}pruef-${k.id}-${runde}${winkel ? '-' + winkel.split(' ')[0].toLowerCase() : ''} <kopf>\`, npm ci, am Ende entfernen. Ports ${k.prPorts}.\nDIE KARTE:\n${k.auftrag}\nERGEBNIS DES BAUERS: ${JSON.stringify(e).slice(0, 9000)}\n${runde > 1 ? 'Ab Runde 2 prüfst du NUR die roten Punkte der vorigen Runde und den Diff seither.\n' : ''}${k.risiko === 'R0' ? 'LEICHTER PRÜFER (R0, nur Linse/Skript): Diff lesen und die VAKUUM-PROBE fahren — wird die Linse am benannten Täter ROT (Selbsttest echt, nicht gestubbt)? misst sie den Spielpfad? hält die Exit-Zeile? Mehr nicht.\n' : ''}Prüfe proportional (Gebot 9): Karte + Diff lesen; die Karten-Linse am Basis-Stand ROT (Täter) und am Kopf GRÜN selbst fahren (vakuös?); die Gates der Konflikt-Zonen, SOWEIT die Zweig-CI sie nicht fährt (die CI am Kopf hat der CI-Wächter vor dir GRÜN gelesen — fahre keine Gates nach, die dort grün liefen); das Bild selbst ansehen; EINE Engstelle, kein Zwilling, kein Flag, kein fail-soft; Zahlen aus Rohdateien nachrechenbar; Siegel-Wörter; YAML/matrix.gruppe; Konflikte gegen \`git ls-remote origin integ-probe\` (merge-tree); die ZWEIG-CI am letzten Nicht-WIP-Kopf per GitHub-API lesen (Token \`printf "protocol=https\\nhost=github.com\\n\\n" | git credential fill\`, Feld password; actions/runs?head_sha=<kopf>) — rot oder fehlend heißt „merge-reif: nein — CI“ mit Gruppe und Schritt. GPU-Schloss nur um einen einzelnen echten Lauf. Kontext-Deckel ~120 Werkzeug-Aufrufe. Keine Aufgaben-Chips, keine Siegel-Wörter.\nROT (sperrt den Merge) ist NUR: ein Bruch oder eine Regression im SPIEL (Verhalten, Bild, Kosten), eine falsche oder nicht nachrechenbare Zahl, die Linse der Karte ist am benannten Täter vakuös, die Zweig-CI ist rot, ein Merge-Konflikt, ein Verstoß gegen die GOLDENE DEFINITION (Zwilling, Flag, fail-soft, Siegel-Wort), die DECKE gebrochen (scripts/ netto > 0 Zeilen oder Dateien gegen die Basis, \`git diff --numstat <basis>..<kopf> -- scripts/\` ohne spec/profiband/ratsche-*), eine neue Linse in Wanduhr-Zeit. GELB (benennen, sperrt NICHT): weitere Härtung einer Linse über den Täter der Karte hinaus (Syntax-Varianten, Mutationen jenseits ihres Auftrags), Altlasten älter als der Diff, Stil und Kleinigkeiten — eine Text-Linse holt Syntax nie ganz ein (Lehre 6), das gehört in eine Folgekarte (Laufzeit-Marke). Urteil am Ende, wörtlich eine Zeile: „merge-reif: ja“ oder „merge-reif: nein — <rote Punkte mit Datei:Zeile>“.`, { label: `pruef${runde}${winkel ? '-' + winkel.split(' ')[0].toLowerCase() : ''}:` + k.id, phase: 'Abnahme', agentType: 'champion', ...((k.risiko === 'R0' || k.risiko === 'R1' || k.leicht) ? { model: 'sonnet' } : {}) })
// Budget (11.10.): leichte Prüfer (R0/R1 oder k.leicht — Diff, Vakuum-Probe, CI) laufen auf dem kleineren Modell; Bau, Nachbesserung und R2/R3-Prüfung groß

const karte = async (k) => {
  const t0 = TIEFE[k.risiko] || TIEFE.R2
  const t = { ...t0, nach: t0.nach + (k.tief ? 1 : 0) }
  // k.start === 'pruefen': der Bau liegt schon auf dem Zweig (k.vorher = sein letztes Ergebnis) — direkt zur Abnahme
  // k.start === 'nachbessern': die Abnahme fand schon ROT (k.rot = das letzte Prüfer-Urteil) — direkt zur Nachbesserung,
  // ohne einen Prüfer zu wiederholen, der dasselbe noch einmal fände (15.10., K63 nach ausgeschöpften Runden)
  const vorab = k.start === 'pruefen' || k.start === 'nachbessern'
  let e = vorab ? { kopf: k.kopf || '', abgeschlossen: true, befund: k.vorher || '', uebergabe: '', linse: '', gates: [], bilder: [], offen: [] } : await bauen(k)
  if (!e) return { id: k.id, reif: false, grund: 'Bauer ohne Ergebnis' }
  if (!e.abgeschlossen) return { id: k.id, reif: false, grund: 'nach drei Übergaben nicht durch', uebergabe: e.uebergabe, kopf: e.kopf }
  // DIE CI ZUERST: außer beim Start mit Nachbessern (k.rot ist schon das rote Urteil) liest der CI-Wächter die Zweig-CI am Kopf
  let c = k.start === 'nachbessern' && k.rot ? null : await ciWaechter(k, e.kopf, 1)
  const ciGruen = (x) => !!(x && x.gruen)
  // ohne eigenen Prüfer endet die Karte bei grüner CI — die Prüfung macht der Integrator gebündelt
  if (t.pruefer === 0 && k.start !== 'nachbessern' && ciGruen(c)) return { id: k.id, kopf: e.kopf, reif: true, urteil: `${k.risiko}: ohne eigenen Prüfer — Zweig-CI grün (${c.lauf}); Linse/Puls/Bild des Bauers, der Integrator prüft gebündelt`, befund: e.befund, linse: e.linse, bilder: e.bilder, offen: e.offen }
  const urteil = async (runde) => {
    if (t.pruefer === 2 && runde === 1) {
      const [a, b] = await parallel([() => pruefen(k, e, 1, 'Mechanik und Gesetz'), () => pruefen(k, e, 1, 'Bild und Kosten')])
      // die Einzel-Urteile werden entschärft, damit nur das GEMEINSAME Urteil zählt (ein „ja“ darf ein „nein“ nie überdecken)
      const roh = [a, b].map((x) => String(x || 'Prüfer ohne Ergebnis').replace(/merge-reif:/gi, 'Einzel-Urteil:'))
      return roh.join('\n\n=== zweiter Prüfer ===\n\n') + ((reif(a) && reif(b)) ? '\nmerge-reif: ja' : '\nmerge-reif: nein — siehe die Einzel-Urteile')
    }
    return pruefen(k, e, runde, '')
  }
  let p = k.start === 'nachbessern' && k.rot ? String(k.rot) : !ciGruen(c) ? ciRot(c) : await urteil(1)
  for (let n = 1; n <= t.nach && !reif(p); n++) {
    const fx = await agent(`${KOPF}\n\nKARTE ${k.id} — ${k.titel}: NACHBESSERUNG ${n} (frischer Arbeiter; Worktree und Branch bestehen — sichte status/log zuerst).\n${ort(k)}\nDER AUFTRAG:\n${k.auftrag}\nDIE PRÜFUNG FAND ROT:\n${String(p).slice(-8000)}\nSchneide jeden roten Punkt GANZ an der Wurzel — die ganze KLASSE, nicht das gemeldete Beispiel.\nRÜCKGABE: die Form.`, { label: `fix${n}:` + k.id, phase: 'Abnahme', schema: ERG, agentType: 'champion' })
    if (fx) e = fx
    // auch der Nachbesserer übergibt am Kontext-Deckel an einen frischen Nachfolger (höchstens 3) — nie einen halben Stand prüfen
    for (let u = 1; u <= 3 && e && e.abgeschlossen === false; u++) {
      log(`${k.id}: Nachbesserung ${n}, Übergabe ${u} an einen frischen Arbeiter`)
      const f = await agent(`${KOPF}\n\nKARTE ${k.id} — ${k.titel}: NACHBESSERUNG ${n}, FORTSETZUNG ${u} — dein Vorgänger hat am Kontext-Deckel übergeben.\n${ort(k)}\nSEINE ÜBERGABE:\n${e.uebergabe}\nSein Befund bisher: ${String(e.befund).slice(0, 4000)}\nDIE PRÜFUNG FAND ROT (unverändert):\n${String(p).slice(-6000)}\nDER AUFTRAG:\n${k.auftrag}\nRÜCKGABE: die Form.`, { label: `fix${n}-${u + 1}:` + k.id, phase: 'Abnahme', schema: ERG, agentType: 'champion' })
      if (!f) break
      e = f
    }
    if (e && e.abgeschlossen === false) return { id: k.id, reif: false, grund: 'Nachbesserung nach drei Übergaben nicht durch', uebergabe: e.uebergabe, kopf: e.kopf }
    // erst die CI am neuen Kopf; rot geht ohne Prüfer in die nächste Runde, grün zum Prüfer (ohne eigenen Prüfer: reif)
    c = await ciWaechter(k, e.kopf, n + 1)
    if (!ciGruen(c)) { p = ciRot(c); continue }
    p = t.pruefer === 0 ? `merge-reif: ja — ${k.risiko} ohne eigenen Prüfer, Zweig-CI grün (${c.lauf})` : await pruefen(k, e, n + 1, '')
  }
  return { id: k.id, kopf: e.kopf, reif: reif(p), befund: e.befund, linse: e.linse, bilder: e.bilder, offen: e.offen, urteil: String(p).slice(-2500) }
}

// args.seriell: Karten nacheinander (dieselbe Klasse, z. B. K02 koerper-bild → wasser-wahrheit); sonst parallel (Breite ≤ 3 setzt der Koordinator)
let ergebnisse = []
if (A.seriell) {
  for (const k of KARTEN) ergebnisse.push(await karte(k))
} else {
  ergebnisse = await pipeline(KARTEN, (k) => karte(k))
}
return { karten: ergebnisse }
