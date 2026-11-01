Lies zuerst DIE GOLDENE DEFINITION in CLAUDE.md — sie ist bindend. (CLAUDE.md liegt im Spiel-Baum: /home/user/spiel-a/CLAUDE.md;
dazu .claude/skills/anazh-lehren/SKILL.md dort — Lehre 26: „Wände urteilen in Bau-Ereignissen, nie in Wanduhr-Sekunden".)

# DER AUFTRAG (vom Schöpfer, über den Koordinator)
Mess-Läufe der Punkte-Maschine brauchen ≥ 90 s und reißen jeden Deckel — sie liefern nie einen Punkt. Mach DEINE Läufe schnell.
Gesetz (Schöpfer): Station ≤ 60 s in EINER warmen Welt, Ziel ≤ 15 s, Deckel 45 s. Je Lauf: Warten im Bau-Ereignis statt in
Sekunden, nie ein Ganz-Welt-Boot (kein eigener Browser, keine eigene Welt, kein /reload, kein eigener save-server) je Probe; das
Kriterium bleibt dasselbe — eine Station, die ihr Urteil weicher macht, ist ROT. Die Fahrt je Karte (radeon, gtx) hat KEINE Luft:
Σ Deckel = 1740 von 1740 s auf Radeon. Darum: `sek` (der Deckel) bleibt, wo er steht (nur senken ist frei); die GTX-Eichung (90 s je
Probe) fährt der Koordinator und setzt danach jeden Deckel aus der Zahl (⌈1,5 × s⌉). Dein Maß ist die Dauer auf der GTX 1060:
≤ 15 s Ziel, ≤ 45 s Pflicht.

# DIE BÄUME
- Koord-Baum = DEIN Worktree (Zweig von w4-stationen-schnell-a-koord = origin/punkte-maschine 359ce394). Darin:
  meisterkarte-quelle/punkte/punkte.cjs (die Maschine: fahreSitzung, fahreGruppe, eichEintrag, Kopf-Kommentar = Format),
  meisterkarte-quelle/punkte/stationen/g1.js … g6.js (die Stationen), proben-welt.cjs (Tor `sitzungTor`/`torBefehl`), seite.cjs
  (`seiteProbe`, H.frist, H.quelle), sitzung-seite.js (`probeBefehl`, H.verbinde, H.linse, H.fahre). Proben-Dateien, die eine Station
  per {KOORD} liest, liegen unter bericht/… und sind per git-Blob gepinnt (`blob:` im Schritt) — änderst du so eine Datei, trage den
  neuen Blob ein (`git hash-object <datei>`).
- Spiel-Baum: lege DEINEN eigenen an (nie /home/user/spiel-a anfassen, nie /home/user/AnazhRealm umschalten):
    git -C <dein-koord-worktree> worktree add /home/user/spiel-<X> -b w4-ssa-<X> origin/main
    ln -s /home/user/AnazhRealm/node_modules /home/user/spiel-<X>/node_modules
  Spiel-Code (scripts/werkbank.cjs, scripts/diag-*.cjs, scripts/lib/*, stamm/…) änderst du NUR dort. Eine Probe läuft mit cwd = dem
  Spiel-Baum am Mess-SHA: was sie dort ruft, muss in DEINEM Spiel-Zweig stehen (der Koordinator merget beide Zweige zusammen).
- Belege der GTX (OMEN, GTX 1060) an b4bcf19c: meisterkarte-quelle/punkte/messung/b4bcf19c-gtx.json (je Station `s`, `grund`,
  `zahl`) und meisterkarte-quelle/punkte/messung/roh/b4bcf19c-gtx/<id mit _>.out (die Roh-Ausgabe — Zeilen nach dem argv; die
  letzte Zeile vor dem Deckel nennt, wo die Zeit stand). Ältere SHAs daneben (3ed95dcf, 379e5f56, e0139769, 94c079cb, cdb2703d …),
  Radeon-Läufe *-radeon.json (z. B. 3ef20f9f) tragen oft SCHRITT-Zeiten. `node meisterkarte-quelle/punkte/punkte.cjs eichtafel --sha
  b4bcf19c --geraet gtx` zeigt Deckel und Eich-Zahl je Lauf.

# WIE EINE PROBE LÄUFT (fahreGruppe in punkte.cjs ~Z. 487)
argv der Station mit Platzhaltern {PORT} (save-server der Sitzung S; Werkbank W = S+20000, ihre Seite W−1), {AUS} (JSON-Ausgabe),
{SEK} (der Deckel DIESES Laufs; in der Eich-Fahrt 90), {KOORD}, {BAUM}; env: WERKBANK_PORT=W, PUNKTE_SITZUNG_LOG (Log der Werkbank,
trägt [linse-gpu]), PUNKTE_PROBE_DECKEL_S, PUNKTE_MASCHINE, PUNKTE_SITZUNG_GRUND, PUNKTE_SITZUNG_STROM/PUNKTE_PROBE. Die Welt der
Sitzung ist `werkbank start --echt --port W --seite http://localhost:S --ort wiese`; vor einer Probe ohne eigenen Ort schwingt die
Sitzung die Welt EINMAL ein (`__weltStehtNach`), mit `ort` stellt sie dorthin um — beides VOR dem Deckel. Reißt die Probe den Deckel,
ist sie UNGEMESSEN; die Marke „@@PUNKTE@@ FRIST … gerissen" ebenso (keinUrteil).

# DAS EINE WARTEN (Spiel-Baum scripts/lib/welt-boot.cjs, WARTEN_SEITE, in jeder Seite):
`__weltStehtNach(takt, max)`, `__gebautNach(e | name, { takt, fertig, bau, max, offen })`, `__deckel(name, max, offen)` (zählt nur
Takte ohne Offenes `_weltOffen`, wirft beim Namen), `__weltDa(bed)`, `__seitenTakt()`. Ein `for (i < 400) { …; await warte(50) }`
oder `sleep(30000)` ist Warten in Sekunden — ersetze es durch das Ereignis, auf das es wartet.

# DEINE LOKALE WELT (getreu wie die Sitzung: --echt unter Xvfb, Adapter google/swiftshader)
  cd /home/user/spiel-<X>
  PORT=<S> node save-server.js > /tmp/claude-0/-home-user-AnazhRealm/5349db1b-b38b-5a7e-8191-e2588ec49c10/scratchpad/save-<S>.log 2>&1 &
  xvfb-run -a -s "-screen 0 1940x1200x24" node scripts/werkbank.cjs start --echt --port <W> --seite http://localhost:<S> --ort wiese \
     > /tmp/claude-0/-home-user-AnazhRealm/5349db1b-b38b-5a7e-8191-e2588ec49c10/scratchpad/echt-<S>.log 2>&1 &
  (bereit, wenn „WERKBANK bereit" im Log steht, ≈ 20 s; `node scripts/werkbank.cjs status --port <W>`)
  node scripts/werkbank.cjs umstellen --ort wiese --port <W>      # ≈ 6 min unter swiftshader (das Einschwingen der Sitzung)
  node /tmp/claude-0/-home-user-AnazhRealm/5349db1b-b38b-5a7e-8191-e2588ec49c10/scratchpad/probe-lokal.cjs --koord <dein-koord-worktree> \
     --baum /home/user/spiel-<X> --port <S> --nur <station-id> --sek 90 \
     --log /tmp/claude-0/-home-user-AnazhRealm/5349db1b-b38b-5a7e-8191-e2588ec49c10/scratchpad/echt-<S>.log \
     --roh /tmp/claude-0/-home-user-AnazhRealm/5349db1b-b38b-5a7e-8191-e2588ec49c10/scratchpad/roh-<S>
     (fährt die Station über fahreStation der Maschine, nennt Sekunden, Urteil je Zwilling; Roh-Ausgabe im --roh-Ordner)
  node scripts/werkbank.cjs eval '<js>' --port <W>               # Seiten-Code: r = Welt, T = THREE; zum Profilieren performance.now()
  node scripts/werkbank.cjs stop --port <W>                       # am Ende; den save-server per kill beenden
Maße dieser Welt: EINE Aufnahme (`__ausgabeAufnahme`, 33 Bilder) bei 640×360 ≈ 10 s, bei 1920×1080 viel länger — die lokale Welt
beweist MECHANIK (die Probe läuft durch, jedes Urteil liest seine Zeile, kein Fehler) und misst die CPU-Arbeit der Seite (JS ist
dort so schnell wie auf der OMEN), nie GPU-Zeit. GTX-Bezug: eine 1080p-Aufnahme ≈ 0,43 s (lod.K2#1), ein Einschwingen an einem
neuen Ort warm 9–20 s. Leite die GTX-Dauer je Lauf her: Zahl der Aufnahmen × 0,43 s + gemessene Seiten-CPU + Teleports/Umstellen —
und belege jede Zahl. Halte Xvfb/Chrome klein: höchstens EINE Welt gleichzeitig, am Ende stoppen.

# REGELN
- Das Urteil (urteil, Schwellen, Posen, Zahl der Fälle, `proben`-Mutanten) bleibt gleich. Darf schneller werden: Warten (Ereignis
  statt Uhr), doppelte Arbeit (ein Schuss/Maß, das kein Urteil liest — belege es am Urteil), ein eigener Boot/Browser (er wird
  Probe der EINEN Welt), Schritte in Reihe, die die Welt nicht braucht. Kein Zwilling, kein Flag, kein Sonder-Modul im Spiel-Code —
  schneide an der Wurzel (die EINE Linse wird schneller, die Probe ruft sie).
- Prüfe nach jeder Änderung: `node meisterkarte-quelle/punkte/punkte.cjs liste` (Fehler 0) und am Ende
  `node meisterkarte-quelle/punkte/punkte.cjs selbsttest --ohne 3c` (≈ einige Minuten; jede Zeile GRÜN, Exit 0) und
  `node meisterkarte-quelle/punkte/punkte.cjs scheiben --sha b4bcf19c --geraet gtx` sowie `--geraet radeon` (Exit 0).
  Im Spiel-Baum: `npx eslint <geänderte Dateien>` und `npx prettier --check <geänderte Dateien>` (nie prettier --write auf Kerne).
- Commits (in deinen Worktrees, NICHT pushen): Autor `git -c user.name=MiguellD -c user.email=87209049+MiguellD@users.noreply.github.com commit …`,
  Betreff „Abgabe w4-stationen-schnell-a: <was>", deutsch, ohne Emoji, Rumpf ≤ 600 Zeichen mit der Zahl vorher → nachher;
  nie die Wörter fertig, RUND, vollendet, vollzogen, Schluss, SCOPE ZU; nie `git stash`; die letzten Zeilen jeder Message:
  Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>
  Claude-Session: https://claude.ai/code/session_018GqBDYgvKFxx7BBDKhxUFp
- Fasse keine Station an, die nicht in deiner Liste steht (eine zweite Sitzung arbeitet parallel an anderen Läufen).

# DEIN BERICHT (die letzte Nachricht, knapp): je Lauf (1) wohin die Sekunden gingen (Beleg: Roh-Zeile/Messung/Profil), (2) der
Schnitt, (3) Dauer vorher → nachher (GTX-Herleitung + lokale Zahl), (4) warum das Kriterium gleich bleibt, (5) Selbsttest/liste/
scheiben-Ergebnis; dazu die Zweige und Commit-SHAs (Koord-Worktree-Zweig und w4-ssa-<X>) und was ehrlich offen bleibt (mit Grund).
