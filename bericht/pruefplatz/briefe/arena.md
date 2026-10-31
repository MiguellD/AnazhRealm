Lies zuerst DIE GOLDENE DEFINITION in CLAUDE.md — sie ist bindend. Du läufst als champion (.claude/agents/champion.md). Lade
den Skill anazh-lehren; tragend sind Lehre 3, 7 (Saat statt Math.random), 11, 18 und 19 (Labor = Welt). Du arbeitest in der CLOUD, also
gibt es keine Welt-Bilder; die macht der Koordinator.

**STARTET ERST, wenn der Schöpfer F in `docs/PFLICHT-OFFEN.md` gesetzt hat** (Vorlage: koordination `bericht/pruefplatz/plan.md` §1).
Setzt er F nicht, fällt dieser Brief FINAL.

# ARENA (F) — der Arena-Hof der Schmiede steht in der Welt; JEDE Art der Shell-Szene wird eine schmiede-Gestalt in EINER Welle

**Eintrag:** F, die Zone Arena. Das Kriterium: die Arena antwortet dem Treffer mit allen Geräten der Schmiede über den EINEN Stoß; an der
Station hält das Band.

**Chokepoint:**
- das Arena-Gesetz in schmiede-core (`ARENA`: schwung, gefuehl, bogen, guete, werk, zonen; schmiede-core.js:3111-3200), das die Welt
  schon liest (`_arenaGesetz`, stamm/kampf.js:2479);
- die Geräte leben heute nur in der Shell (worlds/schmiede/schmiede.js:467-1450: 177× `new THREE.Mesh(`, 28× `Math.random`);
  schmiede-core liefert nur `weapon` mit Stufe [0] (:59-66).

**Was stirbt (in EINER Welle, das Gras-Muster):** die ganze Shell-Szene der Geräte — Dojo und Pergola, Waffenhof (Pell, Stechringe,
Quintane, Pendel-Kugel, Drehbaum, Federpfahl, Streitpuppe), Schnitthof, Schießbahn mit Torii, Scheiben und Wurfscheibe. Die Gegenprüfung
zählt 22 Arten; zähle sie zuerst selbst und nenne die Zahl. Nicht 6 schneiden und den Rest parken.

## Vorher → Ziel

**Vorher:** Die Arena ist nur durch das Tor `welt_schmiede` erreichbar, als eigener r128-Renderer in einer iframe-Sandbox. In der Welt
gibt es keine.

**Ziel-Bild:** ein Hof Ø 32 m mit Sand (`belagO` sand, F-Zone spielplatz), Torii am Eingang, Dojo mit Pergola, alle Geräte in Reihen.
Jedes antwortet dem Treffer über das EINE Arena-Gesetz.

**Vorbild:** der Neben-Wienie (Matterhorn); das Arena-Labor der Schmiede als Maß der Gestalt.

## Bauen

1. **schmiede-core, additiv:** jede Art als Gestalt mit L0, L1 und Wurf, Budget je Stufe nach dem Muster der Ausstattung (L0 3 400 / 2,
   L1 620 / 2, Wurf 48 / 1; fachwerk-core.js:111-116). Saat statt Zufall: 0 `Math.random`.
2. **Verben** (stamm/kampf.js): Pendel, Drehung und Feder über den EINEN Stoß und den EINEN Leib-Löser. Die Streitpuppe ist ein Leib.
   Treffer-Zonen wie bei Puppe und Welt-Tier (schmiede-core.js:3190-3200).
3. **Labor = Welt:** worlds/schmiede/schmiede.js zeigt jede Art aus dem Kern. Die Shell-Szene fällt ganz: 0 `new THREE.Mesh(` für
   Geräte.
4. **Haken:** Hof-Fläche (Wunsch r 260 auf 24,5°, hinter dem maurentor) und Geräte-Zeilen setzt ort-wirt (§GENESIS_ORT,
   siedlung-ort.js, haushalt.json).

## Budget (an der Station Arena; die Summe hält das Band)

- Alle Geräte ≤ 30 Befehle / 45k Dreiecke.
- CPU Δ ≤ 0,5 ms; Verben rechnen nur, solange ein Treffer nachschwingt.
- VRAM ≤ +2 MB.
- Last-Pose: 20 Treffer, Frame p95 ≤ 33 ms (GTX).
- Die Fläche liegt ≥ 210 m von M; die Posen-Linse prüft die Station.

## Dateien (Besitz)

- schmiede-core.js, stamm/kampf.js, worlds/schmiede/schmiede.js
- **NICHT anfassen:** fachwerk-core.js, siedlung-ort.js, haushalt.json (ort-wirt), gelaende-core.js (grund bzw. spielplatz).

## Beweis (headless, Zahlen)

- Golden schmiede byte-gleich für die Waffe.
- Dreiecke und Befehle je Stufe jeder Art im Budget; 0 `Math.random`; 0 Shell-Meshes für Geräte; die Zahl der Arten vorher = die Zahl
  der Gestalten nachher.
- Ein Treffer am Pendel: Auslenkung nach dem EINEN Stoß, Abklingen ≤ 6 s.
- `npm run playtest:fast` am Merge-Kandidaten.

**Für den Koordinator:** Bilder der Station in Ego und Third; die Treffer-Serie mit `werkbank takt`.

## Abgabe

- Zweig: w4-arena-welt. Commit-Betreff: „Abgabe w4-arena-welt: …“.
- Bericht in drei Sätzen und die vier Zeilen des BETRIEBSGESETZES.

## REGELN (Baustein des Koordinators)

- Eigener Worktree unter %TEMP%/claude/w3/<name>/ (nie im Haupt-Klon, nie in fremden Worktrees); node_modules per Junction auf den Haupt-Klon.
- Fetch-Falle: `git fetch origin "+refs/heads/X:refs/remotes/origin/X"`.
- GPU nur über `artifacts/profiband/werkzeug/gpu-lauf.sh`, je Aufruf ≤ 2 min; NIE eine Serie, ein ABAB oder eine ganze Sitzung lokal —
  die GTX der OMEN misst groß. Der echt-Job jedes Zuges teilt das Schloss: wer es lange hält, hält den Zug auf. headless braucht kein Schloss.
- Werkbank-Ports: 4690–4699 gehören dem echt-Job des Radeon-Läufers (sein Hook beendet dort jeden fremden Hörer beim Job-Start); nimm den Port, den der Brief nennt.
- Werkbank: die Welt steht zwischen Befehlen (`window.__loop(true)` nur fürs Warten, danach `__loop(false)`); Pfade an node als Windows-Pfad.
- Beende nur Prozesse, deren PID du selbst gestartet hast — nie nach Name, Muster oder „Elternprozess fehlt“.
- Sichtbares beweist ein Bild vorher/nachher (Pfad im Bericht).
- Commit-Autor: `git -c user.name=MiguellD -c user.email=87209049+MiguellD@users.noreply.github.com commit`; Betreff „Abgabe <zweig>: …“.
- Verbotene Wörter in Commit-Nachrichten: fertig · RUND · vollendet · vollzogen · Schluss · SCOPE ZU. Nie `git stash`.
- Auf Zweigen läuft nur der Puls der CI — warte nie auf die volle Batterie.
- Bericht in drei Sätzen: geschnitten (Datei:Zeile), gemessen (Zahl vorher → nachher), ehrlich offen.
- CLOUD: eine Cloud-Sitzung hat keine GPU — swiftshader baut jede Pipeline synchron (42–292 s je Programm, ein Kopf-Bild 16 min). Sie liefert
  Code + headless Beweis (Zähler, Byte-Diff, Faden-ms, Selbsttest der Linse) und schießt KEINE Welt-Bilder zum Beweis; die Bilder macht der
  Koordinator auf der Radeon (warme Welt, ~3 min) und der GTX (OMEN-Station).
