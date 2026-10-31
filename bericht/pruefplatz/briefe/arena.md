Lies zuerst DIE GOLDENE DEFINITION in CLAUDE.md — sie ist bindend. Du läufst als champion (.claude/agents/champion.md). Lade
den Skill anazh-lehren; tragend sind Lehre 7 (Saat statt Math.random), 11, 18 und 19 (Labor = Welt). Der Plan steht in koordination
`bericht/pruefplatz/plan.md` (§2 Arena, §3 Sektor Arena, §4 S10). Du arbeitest in der CLOUD, also gibt es keine Welt-Bilder; die macht
der Koordinator.

# ARENA — der Arena-Hof des Schmiede-Labors steht in der Welt: Hof Ø 32 m mit Sand bei 85/5, die Geräte als schmiede-Gestalten mit Stufen (Phase 1, zuletzt)

**Pflicht-OFFEN, ehrlich:**
- Die Arena trägt keinen Eintrag direkt. A: keine Klasse der Tafel steht hier. E: nur als zusätzliche Last-Pose S10.
- Sie gehört zum Auftrag des Schöpfers vom 31.10. („ein kleiner Arenabereich wie im Studio, aber in der Welt selbst“).
- Sie startet ZULETZT, nach den Zonen für A, B, C und E, und nimmt keinem davon Budget oder einen GPU-Platz.

**Chokepoint:**
- Das Arena-Gesetz in schmiede-core (`ARENA`: schwung, gefuehl, bogen, guete, werk, zonen; schmiede-core.js:3111-3200). Die Welt liest es
  schon (`AnazhRealm._arenaGesetz`, stamm/kampf.js:2479).
- Die Geräte leben nur in der Shell: worlds/schmiede/schmiede.js:467-1450 mit 177 `new THREE.Mesh(` und 28× `Math.random`.
  schmiede-core liefert nur die Art `weapon` mit Stufe [0] (:59-66).

**Was stirbt:** die Shell-Szene der Geräte. Das Labor zeigt künftig, was der Ofen der Welt baut. Für diese Zone ist das der Schnitt von
Phase 3; in Phase 1 stehen die Gestalten zuerst im Kern.

## Vorher → Ziel

**Vorher:**
- In der Welt gibt es keine Arena. Erreichbar ist sie nur durch das Tor `welt_schmiede`, als eigener r128-Renderer in einer iframe-Sandbox.
- Ihr Inhalt dort:
  - Dojo mit Pergola.
  - Waffenhof: Pell, Stechringe, Quintane, Pendel-Kugel, Drehbaum, Federpfahl, Streitpuppe.
  - Schnitthof.
  - Schießbahn mit Torii, Scheiben und Wurfscheibe.

**Ziel-Bild (S10, 66/5 → 85/5):**
- Ein Hof Ø 32 m mit Sand (Belag aus grund) und das Torii am Westeingang (werke).
- Die Pergola mit dem Dojo an der Ostseite (werke).
- Sechs Geräte in zwei Reihen: Pell, Quintane, Pendel-Kugel, Streitpuppe, Stechringe, Zielscheibe. Sie reagieren auf den Treffer über das
  EINE Arena-Gesetz.

**Vorbild:** der Neben-Wienie (Matterhorn); das Arena-Labor der Schmiede als Maß der Gestalt.

## Bauen

1. **schmiede-core, additiv:** die 6 Geräte als Gestalten mit Stufen L0, L1 und Wurf, Budget je Stufe nach dem Muster der Ausstattung
   (L0 3 400 / 2, L1 620 / 2, Wurf 48 / 1, fachwerk-core.js:111-116). Saat statt Zufall.
2. **Verben** (stamm/kampf.js): Pendel, Drehung und Feder über den EINEN Stoß und den EINEN Leib-Löser. Die Streitpuppe ist ein Leib.
   Treffer-Zonen wie bei Puppe und Welt-Tier (schmiede-core.js:3190-3200).
3. **Labor:** worlds/schmiede/schmiede.js zeigt die 6 Geräte aus dem Kern (Labor = Welt). Die übrigen Shell-Geräte bleiben bis Phase 3
   stehen; benenne ihre Zahl ehrlich.
4. **Der Hof** ist eine Zonen-Fläche des Plans (ort-plan). Pergola und Torii baut werke. Du setzt nur die Geräte-Zeilen der Zone, im Haken
   nach ort-plan.

## Budget

- **S10:** Geräte (Klasse bau) ≤ 30 Befehle / 45k Dreiecke, Pergola und Torii ≤ 6 / 10k (werke).
- **CPU:** ≤ 0,5 ms; die Verben rechnen nur, solange ein Treffer nachschwingt.
- **VRAM:** ≤ 2 MB.
- **Last-Pose:** eine Serie von 20 Treffern; Frame p95 ≤ 33 ms (GTX).

## Dateien (Besitz)

- schmiede-core.js
- stamm/kampf.js
- worlds/schmiede/schmiede.js
- **NICHT anfassen:** fachwerk-core.js (werke, ort-plan); siedlung-ort.js (ort-plan).

## Wartet auf

- Nichts, um das Gesetz zu bauen. Der Start bleibt aber ZULETZT (Welle d), nach den Pflicht-Zonen.
- Der Haken in die Welt nach w4-ort-plan und werke (Pergola, Torii).

## Beweis (headless, Zahlen)

- Golden schmiede byte-gleich für die Waffe.
- Dreiecke und Befehle je Stufe der 6 Geräte im Budget.
- 0 `Math.random` in den neuen Gestalten.
- Ein Treffer am Pendel: die Auslenkung nach dem EINEN Stoß-Gesetz, Abklingen in ≤ 6 s.
- `npm run playtest:fast` am Merge-Kandidaten.

**GPU-Proben für den Koordinator** (Radeon):
- S10 `bild 66 +1.7 5 85 +1.2 5 --uhr 0.5` in Ego und Third.
- Die Treffer-Serie mit `werkbank takt`.

**Tor:** Die Sektor-Hülle hält auch unter Treffern.

## Abgabe

- Zweig: w4-arena-welt. Commit-Betreff: „Abgabe w4-arena-welt: …“.
- Bericht in drei Sätzen und die GPU-Proben.

## Lehren der letzten Abgaben

- **Labor = Welt** (Lehre 19, K45): das Labor zeigt den Körper, den der Ofen der Welt baut.
- **mensch-kopf** riss z107. Darum vor der Abgabe `playtest:fast` am Kandidaten.
- Schneide in kleinen Commits, ein Gerät nach dem anderen, mit Byte-Beweis.

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
