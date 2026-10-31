Lies zuerst DIE GOLDENE DEFINITION in CLAUDE.md — sie ist bindend. Du läufst als champion (.claude/agents/champion.md). Lade
den Skill anazh-lehren; tragend sind Lehre 7, 11, 19 und das LEBEN-Gesetz (EIN Leib-Löser, Gang EIN Gesetz). Der Plan steht in
koordination `bericht/pruefplatz/plan.md` (§2, §4 S7/S7f/S13, §3 Sektor Spielplatz). Du arbeitest in der CLOUD, also gibt es keine
Welt-Bilder; die macht der Koordinator.

# FAMILIEN — Kinder und Eltern am Spielplatz und ein Wächter in der Nacht, als feste Zahl aus EINEM Samen (Phase 1)

**Pflicht-OFFEN:**
- A: mensch-kopf und haar in Ego nah und fern. Heute sind je Klasse 9 von 12 Zellen „nicht im Bild“, weil Ego den eigenen Kopf nie zeigt
  und Third ihn nie weiter als 6 m.
- E: die Klasse bewohner und der Bewohner-Takt.

**Chokepoint:**
- koerper-core (Studio Da Vinci): das Alter-Dial, heute 18–80 Jahre (koerper-core.js:119-128); die Größe, heute 0,85–1,15 (:90-97); der
  Tagesplan ohne Sitzen und Spielen (:1503-1584).
- Der Bewohner als Funktion eines Plans (siedlung-bewohner.js:3-15).

**Was stirbt:** die Regel „Leute nur aus Häusern einer Siedlung“ als einzige Quelle. Der Genesis-Plan trägt künftig Besucher-Haushalte im
selben Gesetz.

## Vorher → Ziel

**Sieh zuerst diese Bilder an** (koordination `bericht/pruefplatz/vorher/`):
- `stadt-platz.png` und `stadt-wagen.png`: Bewohner als glatte Rümpfe in Grundfarben, die einzeln auf der Fahrbahn gehen. Niemand sitzt,
  kein Kind, keine Gruppe.
- Der Spieler-Kopf in Third (a-spawn-gtx3): `augeFrei` 0,07–0,29 statt [0,9, 1]. Die Wurzel dafür hat A-Gesicht.

**Ziel-Bild (S7 Ego, 52/−48 → 64/−58, Mittag):**
- Drei Familien wie am Heckscher Playground.
- Kinder von 4–12 Jahren, der Kopf ⅕ bis ⅙ der Körpergröße.
- Kinder an Schaukel, Rutsche und Sandkasten; Eltern auf den Bänken, die anderen stehen in Rufweite.

**Nacht (S13, 0/−5 → 0/−9):** Der Wächter steht unter der Laterne 0/−9.

## Bauen

1. **koerper-core, additiv; Erwachsene bleiben byte-gleich:**
   - Das Alter reicht unter 18. Das Proportions-Gesetz des Kinds (Kopf zu Höhe nach Wachstumskurve, Größe 0,55–0,9) steht in DERSELBEN
     Gestalt-Funktion. Ein Kind ist kein zweiter Körper.
   - Tätigkeiten `spielen` und `sitzen` im Tagesplan.
   - Rolle `waechter` (wie fahrer und nachtfahrer, koerper-core.js:1518-1523): von Abend bis Morgen (Uhr < 0,35 oder > 0,8) an der Laterne
     des Plans.
   - Labor = Welt: worlds/koerperstudio zeigt das Kind aus dem Ofen der Welt.
2. **Wirt (stamm/siedlung-bewohner.js):**
   - Besucher-Haushalte des Genesis-Plans: 3 Familien mit 2 Erwachsenen und 2 Kindern, dazu 1 Wächter = 13. Die Zahl ist fest, aus EINEM
     Samen, sie entsteht zur Uhr am Ort ihres Tagesplans.
   - Familien-Gang: die Gruppe geht gemeinsam.
   - Sitzen auf den Bänken des Plans; Spielen an den Geräten (werke).
   - Tagesplan: 0,38–0,75 am Spielplatz, sonst „heim“, d. h. sie verlassen den Platz; nachts nur der Wächter.
3. **Kopf-Klasse der Bewohner-Leiber** für die Teilung (stamm/koerper-leib.js): `bewohner:kopf/…`. So messen mensch-kopf und haar auch
   fremde Köpfe. Melde mess den Ausdruck für die Tafel.

## Budget

- **S7:** Klasse bewohner ≤ 16 Befehle / 80k Dreiecke. Höchstens 4 Leiber, der Rest im Bewohner-Satz L2 (1 695 Dreiecke, Wurf L3).
- **CPU:** `_tickBewohner` am Platz ≤ 0,5 ms für 13 Leute. Der Takt kostet, was ihn betrifft (Lehre 25).
- **VRAM:** ≤ +1 MB für die Kind-Gestalten.

## Dateien (Besitz)

- koerper-core.js
- worlds/koerperstudio/*
- stamm/siedlung-bewohner.js
- stamm/koerper-leib.js, nur die Kopf-Klasse.
- **NICHT anfassen:** siedlung-verkehr.js (Verkehr-C); fachwerk-core.js (werke, ort-plan); die Mensch-Ofen-Wurzel des Gesichts (A-Gesicht).

## Wartet auf

- Den Kern-Teil (1) startest du sofort.
- Den Wirt (2, 3) erst nach z108 (e-stufen-takt: siedlung-bewohner.js, koerper-leib.js), w4-verkehr-c (siedlung-bewohner.js),
  w4-ort-plan (Besucher-Zeilen, Bänke, Laterne) und werke (Geräte).
- **Übergabe an mess:** die Kopf-Klasse und das fern-Soll (Albedo von Haut und Haar L2).

## Beweis (headless, Zahlen)

- Golden koerper byte-gleich für Erwachsene.
- Die Maße des Kinds im Soll (Kopf zu Höhe, Größe).
- 13 Leute: an S7 zu Uhr 0,5 alle 12 Familien-Leute; zu 0,3 und 0 nur der Wächter an S13. 0 Berührungen.
- Sitzen: die Sitzhöhe trifft die Norm 0,38–0,52 m (bau-teile.js:2942).
- `_tickBewohner`-ms vorher → nachher am Platz (Null-Renderer zählt nur die Mechanik; die ms misst der Koordinator).
- `npm run playtest:fast` am Merge-Kandidaten.

**GPU-Proben für den Koordinator** (Radeon):
- S7 `bild 52 +1.7 -48 64 +1.2 -58 --uhr 0.5 --ist mensch-kopf` in Ego.
- S7f `bild 30 +1.7 -20 60 +1 -55` in Ego und Third.
- S13 `bild 0 +1.7 -5 0 +1.6 -9 --uhr 0` und `--uhr 0.3`.
- Dazu `werkbank takt` an S7.

**Tor:**
- mensch-kopf und haar stehen an S7, S7f und S13 im Bild (≥ 0,1 %).
- Die Sektor-Hülle hält.
- CPU-Anteil ≤ 0,5 ms.

## Abgabe

- Zweig: w4-familien. Commit-Betreff: „Abgabe w4-familien: …“.
- Bericht in drei Sätzen und die GPU-Proben.

## Lehren der letzten Abgaben

- **mensch-kopf:** Der Mensch-Ofen lieferte 351× keine L2-Gestalt fail-closed. Danach fehlten alle Bewohner und z107 riss nach 90 min.
  Darum: niemand wartet auf eine Gestalt, die nicht kommt. Jede Abgabe fährt `playtest:fast` am Kandidaten.
- **Verkehr-C:** Fuß und Wagen teilen die Straße nach EINEM Gesetz. Familien queren keine Fahrbahn ohne dieses Gesetz.
- **Gebot 7:** Die Kosten folgen dem Schirm. Leute außer Blick sind eine Zahl, kein Leib.

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
