export const meta = {
  name: 'fortsetzung-0910',
  description: 'Fortsetzung nach dem Wochenlimit (08.10.): Integration V18.537 (welle-m-boosts, dann rudel), Leben (rudel Pruefung 2, dann kampf), Studio-S3 (wiese-gestalten + kreatur Nachbesserung fortsetzen, dann Kette pflanzen -> haus -> tor-fahrzeug-klinge)',
  phases: [
    { title: 'Integration', detail: 'integ-probe: welle-m-boosts, dann rudel, dann V18.537' },
    { title: 'Leben', detail: 'rudel Gegenpruefung 2, dann kampf auf dem rudel-Kopf' },
    { title: 'S3', detail: 'wiese-gestalten + kreatur fortsetzen, dann die Kette' },
  ],
}

// Start in der neuen Sitzung: Workflow({ scriptPath: 'C:\\Users\\micha\\AnazhRealm-profiband\\artifacts\\profiband\\workflows\\fortsetzung-0910.js' })
// Übergabe: C:\Users\micha\AnazhRealm-profiband\artifacts\profiband\UEBERGABE-0910.md (zuerst lesen)

const R = 'C:\\Users\\micha\\AnazhRealm-profiband'
const AP = R + '\\artifacts\\profiband\\'
const I2 = AP + 'integ2\\'
const ST = AP + 'studios\\'
const WF = AP + 'workflows\\'
const INTEG = 'C:\\Users\\micha\\AnazhRealm-integ'
const WT = R + '\\.claude\\worktrees\\'
const MAIN = '76c9624d4957710e39fb0c8e671e885447f2cc4e' // V18.536
const VOR = 'Lies zuerst DIE GOLDENE DEFINITION in CLAUDE.md — sie ist bindend.\n'
const HANDWERK = `HANDWERK (bindend): SHAs IMMER per \`git ls-remote origin <branch>\` (der lokale origin/-Zeiger im Haupt-Klon ist oft veraltet). NIE git stash (ein Stapel über alle Worktrees) — Zwischenstände als WIP-Commit „Zwischenstand-Sicherung … UNGEPRUEFT" und sofort pushen. Regex/Escape nur mit dem Edit-Werkzeug. anazhRealm.js: node --check, \`npx eslint anazhRealm.js\` 0 Fehler, prettier --check. Kerne nie prettier --write, Studio-Code nur unter Byte-Beweis (Re-Mint = begründeter Vertrags-Akt im Commit). GPU-SCHLOSS für jeden echten Renderer: atomar \`mkdir C:\\Users\\micha\\AppData\\Local\\Temp\\claude\\gpu-schloss\` + darin besitzer.txt mit deinem Namen; lösen NUR, wenn besitzer.txt deinen Namen trägt; scheitert das mkdir: headless weiter, später erneut. Eigene Zwischendateien unter C:\\Users\\micha\\AppData\\Local\\Temp\\claude\\<dein-name>\\. Gates über ihre Port-Env-Variablen, nur eigene Prozesse beenden; vor der Rückgabe alle eigenen Prozesse beendet und Ports frei. CI lesen und Reruns bei apt-/Deckel-Abbrüchen über die GitHub-API (Token: \`printf "protocol=https\\nhost=github.com\\n\\n" | git credential fill\`; Warter: \`bash ${AP.replace(/\\/g, '/')}ci-warte.sh <voller SHA>\`). Jeder neue CI-Schritt braucht seine \`matrix.gruppe\` (gate:ci-deckung). Commits deutsch, emoji-frei, keine Siegel-Wörter (fertig/RUND/vollendet/vollzogen/Schluss/SCOPE ZU, auch als Wortteil — auch „Runden", „fertigen"), letzte Zeile \`Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>\`. Lege KEINE Aufgaben-Chips (spawn_task) an.`
const FORTS = 'FORTSETZUNG nach einem Kontowechsel (Wochenlimit am 08.10.): dein Vorgänger wurde mitten in der Arbeit gestoppt. Sichte ZUERST vollständig: `git status`, `git log --oneline -10`, ein offener Merge (`git diff --name-only --diff-filter=U`); der oberste Commit kann „Zwischenstand-Sicherung … UNGEPRUEFT" sein — prüfe jeden Teil-Stand (node --check, eslint, die Linse), verwirf nichts ungesehen, baue darauf weiter.\n'

const ERG = {
  type: 'object',
  properties: {
    kopf: { type: 'string', description: 'voller 40-stelliger SHA des gepushten Kopfs' },
    commits: { type: 'array', items: { type: 'object', properties: { sha: { type: 'string' }, titel: { type: 'string' } }, required: ['sha', 'titel'] } },
    befund: { type: 'string' },
    gates: { type: 'array', items: { type: 'object', properties: { name: { type: 'string' }, exit: { type: 'string' } }, required: ['name', 'exit'] } },
    ci: { type: 'string' },
    konflikte: { type: 'string' },
    offen: { type: 'array', items: { type: 'string' } },
  },
  required: ['kopf', 'commits', 'befund', 'gates', 'ci', 'offen'],
}
const reif = (p) => !!p && /merge-reif:\s*ja/i.test(String(p))
const sha = (s) => { const m = String(s || '').match(/[0-9a-f]{40}/); return m ? m[0] : null }

const pruefe = (label, phase, was, ort, basis, ports, extra) => agent(`${VOR}Du bist der unabhängige GEGENPRÜFER: ${was}. Ort: ${ort} (lege für Läufe einen EIGENEN detached Prüf-Worktree auf dem Kopf an — \`git -C ${R} worktree add --detach ${WT}pruef-${label.replace(/[^a-z0-9]+/gi, '-')} <kopf>\`, npm ci — und entferne ihn am Ende). Basis ${basis}. NUR LESEN, kein Commit. Ports ${ports}.
${extra}
Prüfe proportional (Gebot 9) die geänderten Stellen: (a) Bild-/Spiel-Korrektheit (kann ein Schnitt eine echte Änderung verschlucken oder ein Fehlbild erzeugen? Invalidierung, Reload, Fenster, Mehrspieler) mit Datei:Zeile; (b) EINE Engstelle, kein Zwilling, kein Flag, kein fail-soft; (c) Linsen vorher ROT mit Täter, nachher grün, in der CI (vakuös?); (d) Zahlen nachrechenbar, Bild-Paare selbst angesehen; (e) Posten ehrlich (teilweise/offen benannt); (f) Siegel-Wörter, Regex, YAML (matrix.gruppe, ci-deckung), CI per API; (g) Konflikte gegen \`git ls-remote origin integ-probe\` (merge-tree).
${HANDWERK}
Urteil am Ende: „merge-reif: ja" oder „merge-reif: nein — <rote Punkte mit Datei:Zeile>".`, { label, phase, agentType: 'champion' })

// --- Strang L: Leben (rudel → kampf) -----------------------------------------------------------------------------
let rudelFertig
const rudelP = new Promise((r) => { rudelFertig = r })
const strangLKern = async () => {
  const RUDEL_WT = WT + 'vigorous-nash-lf-rudel'
  const rudelWas = `Welle-L-Folge, Familie „rudel" (Worktree ${RUDEL_WT}, Branch welle-lf-rudel, Kopf per ls-remote; zuletzt 3c021731 — Nachbesserung Runde 1 mit Merge von main V18.536: EIN Leib-Löser _leibKontakte, EINE Masse _leibMasse in kg, Zwillinge _kreaturLeibKontakte/_kreaturMasse gefallen). Auftrag der Familie: die Konstante FAM key 'rudel' in ${WF}welle-l-folge-2.js. Runde-1-Prüfung (rot): ${I2}LF-pruef1-rudel.md. Ergebnis der Nachbesserung: ${I2}LF-fix1-rudel.json (lies beide GANZ).`
  let p = await pruefe('pruef2:rudel', 'Leben', rudelWas, RUDEL_WT, '79f25cbd + Merge main ' + MAIN, '7940–7949', 'Prüfe zuerst, ob die beiden roten Punkte der Runde 1 GANZ geschnitten sind (Absenz-Grep der Zwillingsnamen, EIN Aufrufer von _leibKontakte, Beute-Urteil auf kg), dann die Merge-Stellen mit main (check.yml-Gruppen, Ofen-Takt fernTeile/leibV, Stoß-Höhe + Pfoten-Folge, v1/v7-Goldens neu gemintet — gegen main 72 Felder anders: begründet?).')
  let kopf = null
  for (let runde = 2; runde <= 3 && p && !reif(p); runde++) {
    const n = await agent(`${VOR}${FORTS}NACHBESSERUNG der Familie „rudel" (Runde ${runde}). Ort AUSSCHLIESSLICH ${RUDEL_WT} (Branch welle-lf-rudel), Ports 7940–7949. Auftrag: FAM key 'rudel' in ${WF}welle-l-folge-2.js. Die Gegenprüfung fand ROT:\n${String(p).slice(-7000)}\nSchneide jeden roten Punkt GANZ an der Wurzel (Linse zuerst, Engstelle, Zahl im Commit), fahre die berührten Gates + den vollen playtest einmal (Wegwerf-Kopie mit deinem Port), push, lies die CI.\n${HANDWERK}\nRÜCKGABE: die Form.`, { label: `fix${runde}:rudel`, phase: 'Leben', schema: ERG, agentType: 'champion' })
    if (n) kopf = sha(n.kopf)
    p = await pruefe(`pruef${runde + 1}:rudel`, 'Leben', rudelWas + (n ? ' Neuer Kopf ' + n.kopf + '.' : ''), RUDEL_WT, '79f25cbd + Merge main ' + MAIN, '7940–7949', 'Prüfe gezielt die roten Punkte der vorigen Runde.')
  }
  const rudel = { reif: reif(p), pruefung: p, kopf }
  rudelFertig(rudel)
  if (!rudel.reif) { log('rudel NICHT merge-reif — kampf startet nicht'); return { rudel } }
  // kampf auf dem rudel-Kopf
  const KAMPF_WT = WT + 'vigorous-nash-lf-kampf'
  const kampfAuftrag = `Auftrag: FAM key 'kampf' in ${WF}welle-l-folge-2.js (lies ihn GANZ; dazu ${AP}leben-schau\\befund-kampf.md und die Bilder ${AP}leben-schau\\kampf\\). NEU SEIT DEM AUFTRAG: deine Basis trägt main V18.536 UND rudel — das STOSS-Gesetz (Treffer-Rückstoß über opts.stoss, Masse aus _leibMasse/MASSSTAB; den Rückstoß K-D9 hat der OMEN geschnitten — NICHT nochmal) und das Temperament der Gattung (rudel) sind da: lies sie, schneide sie nicht doppelt.`
  let k = await agent(`${VOR}WELLE L FOLGE — Familie „kampf". Lege SELBST an: \`git -C ${R} worktree add -b welle-lf-kampf ${KAMPF_WT} <rudel-Kopf per ls-remote origin welle-lf-rudel>\` (existiert er schon: sichte git status/log und baue weiter), dort npm ci. Ports 7930–7939. ${kampfAuftrag}\nJE POSTEN: Linse zuerst (vorher ROT mit Täter), Schnitt an der EINEN Engstelle, Wand in die CI mit Selbsttest, Bild-Paar am echten Renderer (Ausgabe-Pfad, selbst ansehen), Zahl im Commit. Gates je Commit proportional, am Ende npm run check + voller playtest einmal, Push, CI.\n${HANDWERK}\nRÜCKGABE: die Form.`, { label: 'LF:kampf', phase: 'Leben', schema: ERG, agentType: 'champion' })
  if (!k) return { rudel, kampf: null }
  const kampfWas = `Welle-L-Folge, Familie „kampf" (Worktree ${KAMPF_WT}, Branch welle-lf-kampf). ${kampfAuftrag} Ergebnis: ${JSON.stringify(k).slice(0, 8000)}`
  let pk = await pruefe('pruef1:kampf', 'Leben', kampfWas, KAMPF_WT, 'welle-lf-rudel (rudel-Kopf)', '7930–7939', '')
  for (let runde = 2; runde <= 3 && pk && !reif(pk); runde++) {
    const n = await agent(`${VOR}${FORTS}NACHBESSERUNG der Familie „kampf" (Runde ${runde}). Ort AUSSCHLIESSLICH ${KAMPF_WT}, Ports 7930–7939. ${kampfAuftrag}\nDie Gegenprüfung fand ROT:\n${String(pk).slice(-7000)}\nSchneide jeden roten Punkt GANZ an der Wurzel, Gates, voller playtest einmal, push, CI.\n${HANDWERK}\nRÜCKGABE: die Form.`, { label: `fix${runde}:kampf`, phase: 'Leben', schema: ERG, agentType: 'champion' })
    if (n) k = n
    pk = await pruefe(`pruef${runde}:kampf`, 'Leben', kampfWas + (n ? ' Neuer Kopf ' + n.kopf + '.' : ''), KAMPF_WT, 'welle-lf-rudel', '7930–7939', 'Prüfe gezielt die roten Punkte der vorigen Runde.')
  }
  return { rudel, kampf: { ergebnis: k, pruefung: pk, reif: reif(pk) } }
}

const strangL = async () => { try { return await strangLKern() } finally { rudelFertig({ reif: false, pruefung: null, kopf: null }) } }

// --- Strang I: Integration V18.537 -----------------------------------------------------------------------------
const strangI = async () => {
  const REGEL_I = `${VOR}${FORTS}Du bist der INTEGRATOR auf integ-probe (Worktree ${INTEG}, Branch integ-probe; Kopf per ls-remote — zuletzt ${MAIN} = main = V18.536). Ports 4312, 4313, 4490, 4542 (die deinen; prüfe frei). Je Merge: Konflikte nach SEMANTIK (beide Seiten jeder doppelt berührten Methode einzeln prüfen, keine verlorene Hälfte, keine doppelte Methode — der CI-Schritt „Duplikate Methodendefinitionen" zählt Klassen-Methoden), Gates der berührten Dateien, playtest:fast UND der VOLLE playtest je Merge (er läuft nicht in der CI — ein Probe-Stub-Bruch rutschte so schon durch drei Merges), Push, CI richtet. Die volle Batterie (CI-Schritte lokal, \`REPO=… node ${AP}ci-gen.cjs\` + pruef-voll.sh) EINMAL vor dem Versions-Commit.\n${HANDWERK}`
  const b = await agent(`${REGEL_I}\nSTUFE B — welle-m-boosts (OMEN; Kopf per ls-remote, zuletzt cce9da43; trägt welle-m-brennglas 3da7e286; BEIDE unabhängig gegengeprüft: merge-reif ja — Berichte: \`git show origin/koordination:bericht/0710-10-brennglas-takt.md\` und \`…/bericht/0710-11-boosts-render-ewma.md\`). Inhalt: Brennglas-Takt + 7 Takte über die Blocker-Nachbarschaft (\`_blockerUmPlatz\`, \`_blockerMit\`; gate:brennglas-takt Gruppe 2), Raum-Tags-Gedächtnis (gate:raum-tags Gruppe 1), Ladeschirm \`[hidden]\` (gate:ankunft L2a(9)), Haus-Tür \`_tickHausTueren\` (\`> 1\` + Nachbarschaft), gate:takt T1/T2 geheilt. OMEN-ABAB gegen V18.536: CPU p50 voll 4,8 → 4,0 ms. Konflikte laut Prüfer: 0 gegen main. RÜCKGABE: die Form.`, { label: 'integ:boosts', phase: 'Integration', schema: ERG, agentType: 'champion' })
  const rudel = await rudelP
  let r = null
  if (rudel.reif) {
    r = await agent(`${REGEL_I}\nSTUFE R — welle-lf-rudel (Kopf per ls-remote; unabhängig gegengeprüft merge-reif ja — Prüfungen: ${I2}LF-pruef1-rudel.md und die Runde-2-Prüfung: ${String(rudel.pruefung).slice(-3000)}). Inhalt: persönlicher Raum je Leib im EINEN Leib-Löser, Temperament aus Gattung × Größe, Jagd-Kreis + Rudel-Ring, Bein-Lot/Schlupf, Fern-Gang, Tier gegen Bau-Hülle, Nexus würfelt kein Körper-Gesetz; der Zweig trägt main V18.536 schon. Achte auf: welle-m-boosts (gerade gemergt) gegen rudel — Tier-Leib-Nähe (\`_blockerNetz\`/Beweger) und \`_leibKontakte\`. RÜCKGABE: die Form.`, { label: 'integ:rudel', phase: 'Integration', schema: ERG, agentType: 'champion' })
  } else log('rudel nicht merge-reif — V18.537 trägt nur welle-m-boosts')
  const v = await agent(`${REGEL_I}\nVERSIONS-COMMIT V18.537 auf integ-probe: zuerst die volle Batterie lokal + voller playtest am Kopf; dann \`node scripts/bump-version.cjs\` auf 18.537.0 (alle Träger, die UI liest AnazhRealm.VERSION), CLAUDE.md „Stand" auf V18.537 (die Stand-Wand von gate:betriebsgesetz erlaubt 40 Zeilen — fasse Älteres zusammen), Push, CI lesen. Gemergt sind: welle-m-boosts${r ? ' und welle-lf-rudel' : ''}. RÜCKGABE: die Form (kopf = der Kandidat V18.537; danach misst der OMEN ABABABAB gegen main ${MAIN} — das beauftragt der Koordinator).`, { label: 'integ:V18.537', phase: 'Integration', schema: ERG, agentType: 'champion' })
  return { boosts: b, rudel: r, version: v }
}

// --- Strang S: Studio-S3 ---------------------------------------------------------------------------------------
const s3Fix = async (key, ports, rotDatei, ergDatei) => {
  const ort = WT + 'vigorous-nash-s3-' + key
  const auftrag = `die Familie „${key}" der Studio-Welle S3 „Kosten ins Asset" — Auftrag: FAM key '${key}' in ${WF}studio-s3-kosten.js (REGELN + Auftrag gelten), Plan ${ST}s3-plan.md. Ergebnis der ersten Runde: ${ergDatei}. Die Gegenprüfung Runde 1 (rot): ${rotDatei} (lies beide GANZ).`
  const n = await agent(`${VOR}${FORTS}NACHBESSERUNG RUNDE 1 (Fortsetzung — der Vorgänger starb am Wochenlimit; oberster Commit „Zwischenstand-Sicherung … UNGEPRUEFT"). Ort AUSSCHLIESSLICH ${ort} (Branch studio-s3-${key}), Ports ${ports}. ${auftrag} Schneide jeden roten Punkt GANZ an der Wurzel; Bild-Paare am echten Renderer selbst ansehen; Gates proportional + voller playtest einmal; push; CI.\n${HANDWERK}\nRÜCKGABE: die Form.`, { label: 'S3-fix:' + key, phase: 'S3', schema: ERG, agentType: 'champion' })
  let p = await pruefe('S3-pruef2:' + key, 'S3', `Studio-Welle S3, Familie „${key}" (${ort}, Branch studio-s3-${key}). ${auftrag}${n ? ' Ergebnis der Nachbesserung: ' + JSON.stringify(n).slice(0, 6000) : ''}`, ort, MAIN, ports, 'Prüfe zuerst die roten Punkte der Runde 1.')
  let kopf = n ? sha(n.kopf) : null
  if (p && !reif(p)) {
    const n2 = await agent(`${VOR}${FORTS}NACHBESSERUNG RUNDE 2. Ort AUSSCHLIESSLICH ${ort}, Ports ${ports}. ${auftrag} Die Gegenprüfung Runde 2 fand ROT:\n${String(p).slice(-7000)}\nSchneide jeden roten Punkt GANZ, Gates, voller playtest einmal, push, CI.\n${HANDWERK}\nRÜCKGABE: die Form.`, { label: 'S3-fix2:' + key, phase: 'S3', schema: ERG, agentType: 'champion' })
    if (n2) kopf = sha(n2.kopf)
    p = await pruefe('S3-pruef3:' + key, 'S3', `Studio-Welle S3, Familie „${key}" (${ort}). ${auftrag}${n2 ? ' Neuer Kopf ' + n2.kopf : ''}`, ort, MAIN, ports, 'Prüfe gezielt die roten Punkte der Runde 2.')
  }
  return { key, reif: reif(p), kopf, pruefung: p }
}
const strangS = async () => {
  const [wiese, kreatur] = await parallel([
    () => s3Fix('wiese-gestalten', '7800–7809', ST + 's3-pruef1-wiese-gestalten.md', ST + 's3-ergebnis-wiese-gestalten.json'),
    () => s3Fix('kreatur', '7840–7849', ST + 's3-pruef1-kreatur.md', ST + 's3-ergebnis-kreatur.json'),
  ])
  let kette = null
  const basis = wiese && wiese.reif && wiese.kopf ? wiese.kopf : null
  if (basis) {
    log('S3-Kette startet auf dem geprüften wiese-gestalten-Kopf ' + basis)
    kette = await workflow({ scriptPath: WF + 'studio-s3-kosten.js' }, { basis, nur: ['pflanzen', 'haus', 'tor-fahrzeug-klinge'] })
  } else log('S3-Kette startet NICHT: wiese-gestalten ist nicht merge-reif oder ohne Kopf-SHA — der Koordinator entscheidet (Basis main ' + MAIN + ' möglich)')
  return { wiese, kreatur, kette }
}

const [I, L, S] = await parallel([strangI, strangL, strangS])
return { integration: I, leben: L, s3: S }
