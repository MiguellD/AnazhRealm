Lies zuerst DIE GOLDENE DEFINITION in CLAUDE.md — sie ist bindend. Du läufst als champion (.claude/agents/champion.md). Lade
den Skill anazh-lehren; tragend sind Lehre 7, 8 (Spawn-Affinität tag-neutral), 11, 19, 25 und das LEBEN-Gesetz (EIN Leib-Löser, die EINE
Hülle). Der Plan steht in koordination `bericht/pruefplatz/plan.md` (§2, §3 Zoo, §4, §5 S8/S8f). Du arbeitest in der CLOUD, also gibt es
keine Welt-Bilder; die macht der Koordinator.

# GEHEGE — drei Wölfe in einem Hagenbeck-Gehege mit Graben, als Term des EINEN Bestands: dieselben Tiere in jedem Boot (Welle a)

**Pflicht-OFFEN:**
- A: fell. Heute sind 12 von 12 Zellen ohne Bild, weil am Spawn kein Tier steht.
- E: an S2 Δ 0. Der nächste Punkt des Zoos liegt 220 m von M; dort ist er weder resident noch in der Kappe; die Zahl der wilden Tiere im g-third-Blick
  bleibt gleich.

**Chokepoint:** der Bestand der Region in tetrapoda und im Wirt.
- `_bestandAdoptieren` (kreatur-leben.js:2299): jeder gesetzte Leib wird Bestand, danach Geburt, Hunger, Alter und Riss je Takt.
- `_bestandLeibOrt` (:2410): ein Leib entsteht nur ≥ 130 m weit und außer Blick.
- Die Kappe `maxCreatures` wählt, WER gezeichnet wird, nie wer lebt (:2097).

**Was stirbt:** nichts Bestehendes. Der wilde Bestand bleibt byte-gleich; das Gehege ist ein Term DESSELBEN Verzeichnisses — kein zweites
Register.

## Vorher → Ziel

**Vorher:** Am Spawn steht kein Tier. Der Wolf des Fell-Gesetzes erscheint nur an der Station haar.K1#1 (0,7 m und 4 m); der Koordinator
sah ihn dort fleckig (30.10.).

**Ziel-Bild S8** (Schau-Terrasse 2 m südlich der Zoo-Mitte 200,3/−173,5, Blick ins Gehege):
- Hagenbeck: kein Gitter im Blick; zwischen Terrasse und Gehege liegt ein Graben (3 m breit, 2 m tief, Erdbau des Plans).
- Das Rudel liegt am Lager, 8–15 m vom Auge, am Fels des Geheges.
- Nachts unter den 4 Laternen der Terrasse.
- **Fern (S8f, 24 m südlich der Mitte):** dasselbe Rudel in 32–37 m.

**Vorbild:** Hagenbeck (der Graben statt des Gitters), Central Park Zoo (kleine Gehege), Horizon (deterministische Setzung).

## Bauen

1. **tetrapoda-core, Term `gehege` des Bestands-Gesetzes** (additiv):
   - Der Bestand je Gehege ist fest `{gattung: 'wolf', n: 3}`.
   - Raten 0 für Geburt, Hunger und Alter; Riss nur unter Tieren desselben Geheges (die Wölfe haben dort keine Beute).
   - Die Art wählt der Plan, nie ein Tag (Lehre 8).
2. **Wirt (stamm/kreatur-leben.js):**
   - Die Gehege-Tiere stehen im Verzeichnis ihrer Region wie jedes Tier, mit dem Term.
   - Ihr Leib entsteht am Lager, sobald der Zoo fällig ist (Spieler ≤ 210 m), und nie im Blick ≤ 64 m (`ANALOG_NAH_M`).
   - Jenseits 60 m oder außer Blick ruhen sie als Zahl (Takt 0) und kehren an ihr Lager zurück.
   - Die Kappe zählt sie nur, wenn ihr Leib gezeichnet wird: an S2 belegen sie 0 der 20 Plätze. dirigent-kern.js bleibt unberührt.
3. **Der Rand (stamm/kreatur-verhalten.js):** Das Gehege-Polygon des Plans ist Teil der EINEN Hülle (`_kreaturHuellenKontakt`,
   kreatur-verhalten.js:1206-1210). Kein Zaun, kein zweiter Weg. Kein Tier verlässt sein Gehege.
4. **Labor = Welt:** worlds/tetrapoda zeigt das Gehege-Tier aus demselben Gesetz.
5. **Der Haken in den Plan** (Gehege-Fläche, Lager, Graben, Laternen) steht als Zeile von ort-gesetz in §GENESIS_ORT; ab Welle d setzt
   ihn ort-wirt. Melde ihm die Form, falls dein Term ein Feld mehr braucht.

## Budget (an S8, die Summe hält das Band)

- Drei Wolf-Leiber in L0: ≤ 3 × 62 000 Dreiecke / 8 Befehle (tetrapoda-core.js:45).
- Ansatz der Summe an S8: Wald und Boden wie an der Wiese (105 / 386k) plus Wölfe ≈ 135 / 572k < 208 / 680k. Miss sie mit
  `werkbank zaehlen` (Koordinator).
- Die Klasse tier (30/60k) ist ein Messort-Soll von Wiese und Genesis. Reißt die Summe an S8, ist der Täter der L0-Wolf über seinem Band
  (62 000 gegen 20 000, tetrapoda-core.js:45). Dann schneidest du ihn zum Band, mit Byte-Beweis der übrigen Gattungen und der Station
  haar.K1#1 vorher↔nachher.
- **CPU:** Δ ≤ 0,8 ms an S8 für drei ruhende Leiber. Einen Leib zu gießen kostet ~0,6 ms (kreatur-leben.js:3574-3575); höchstens 3 Leiber
  je Takt (`leiberJeTakt`).
- **VRAM:** ≤ +4 MB.
- **An S2:** Δ 0 in allem.

## Dateien (Besitz)

- tetrapoda-core.js
- stamm/kreatur-leben.js
- stamm/kreatur-verhalten.js
- worlds/tetrapoda/*
- **NICHT anfassen:** fachwerk-core.js und siedlung-ort.js (ort-gesetz, ort-wirt); dirigent-kern.js (w4-ankunft-5 ändert ihn).

## Wartet auf

- Kern und Wirt: sofort. Kein laufender Zweig fasst kreatur-* oder tetrapoda-core.js an (Dateilisten 31.10.).
- Der Haken in den Plan: nach w4-genesis-ort-wirt.

## Beweis (headless, Zahlen)

- Der wilde Bestand bleibt byte-gleich: gate:kreatur-* und Golden tetrapoda.
- Nach 600 s Spielzeit stehen 3 Wölfe im Gehege: 0 Ausbrüche, 0 Risse, 0 Geburten, 0 Tode. Es sind dieselben Tiere (Same) nach Neuladen
  und nach Wegsehen.
- An S2 (0/0) ist die Zahl der Leiber und der Kappen-Plätze vorher = nachher (E3).
- Ruhe als Zahl: jenseits 60 m Takt-ms des Geheges = 0.
- `npm run playtest:fast` am Merge-Kandidaten.

**GPU-Proben für den Koordinator** (Radeon, nach dem Plan):
- S8: Ego auf der Terrasse → Gehege, `--uhr 0.5|0.3|0 --ist fell`; Third mit dem Spieler 1 m nördlich der Mitte. Die Probe des Plans
  sagt 0,29 % bzw. 0,19 %.
- S8f: Ego 24 m südlich der Mitte, Third mit dem Spieler 18 m südlich (fern-Zeile, 253 px je Wolf).
- `werkbank zaehlen` und `werkbank takt` an S8.

**Tor:**
- fell an S8 und S8f zu jeder Uhr im Bild (nah ≥ 0,1 %, fern ≥ 200 px je Wolf).
- Summe an S8 im Band; CPU Δ ≤ 0,8 ms; an S2 Δ 0.

## Abgabe

- Zweig: w4-gehege. Commit-Betreff: „Abgabe w4-gehege: …“.
- Bericht in drei Sätzen, die GPU-Proben und die vier Zeilen des BETRIEBSGESETZES.

## Lehren der letzten Abgaben

- **stufen-heil** (z102): Die Kreatur-Linse setzt das Auge mit `_lodAugeGesetzt()`; der Tier-Satz fiel von 227 + 43 auf 44 + 8 Befehle.
  Darum gibt es Leiber nur für die Nächsten.
- **Das ABAB** hielt die Tiere bisher als `frei.tier`. Der Zoo liegt außerhalb von S2, daran ändert sich nichts.
- **mensch-kopf** riss z107. Darum `playtest:fast` am Kandidaten.

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
