Lies zuerst DIE GOLDENE DEFINITION in CLAUDE.md — sie ist bindend. Du läufst als champion (.claude/agents/champion.md). Lade
den Skill anazh-lehren; tragend sind Lehre 5, 6, 17, 20 und 21 sowie Gebot 10 (die Linse nennt den Täter beim Namen). Der Plan steht in koordination `bericht/pruefplatz/plan.md`
(§0, §4, §6, §7); das Original liegt in `%TEMP%/claude/w3/pruefplatz/plan.md`.

# MESS — ein Schuss ist zweimal derselbe, jede Klasse hat ihre Station, jede Zelle ein Soll (Phase 0, danach Phase 2)

**Pflicht-OFFEN:**
- A: die Tafel am Prüfplatz, 14 Klassen × 12 Zellen = 168, davon 0 „nicht im Bild“.
- E: die Stationen des ABAB und die Ratschen.

**Chokepoint:** der Schuss der Werkbank (`bild` → `scripts/lib/ausgabe-aufnahme.cjs`). Was er nicht hält, rauscht.

**Was stirbt:**
- Das Halten nur der Kreaturen: `tiereHalten`, ausgabe-aufnahme.cjs:477-493.
- Die absoluten Tor-Kameras der Tafel.
- Der Mittag-Zwang der Licht-Bilanz.

## Vorher (die Grundlinie, a-spawn-gtx3 am main b4bcf19c, GTX, koordination `bericht/a-spawn-gtx3/urteil.txt`)

- **GRÜN:** 22 von 114 Zellen im Bild.
- **„nicht im Bild“:** 54 von 168. wasser, fels und fell je 12; mensch-kopf und haar je 9.
- **Von den 92 ROT-Zellen sind nur 24 Befunde am Bild:**
  - 48 Rauschen: zwei gleiche Schüsse weichen in 0,23–0,57 % der Pixel über der Schwelle 18 ab (Wand 0,2 %). Das trifft in Third jede
    Klasse, in Ego die fernen Zellen.
  - 8 ohne Soll: himmel-licht zu 0,3 und 0, denn `__lichtBilanz` ruft `__buehne()` und erzwingt damit Mittag.
  - 12 haus gegen eine veraltete Albedo-Tafel (veraltet seit 1dcb844f).
- **Vorbild:** Unreal Functional Screenshot Test, also die verrauschten Render-Merkmale aus, eine Toleranz und das Soll-Bild im VCS.
  Dazu der tägliche Welt-Test von AC Origins.

## Bauen

**Teil 1 (Phase 0; Tafel und Albedo sofort, werkbank.cjs und Aufnahme erst nach z108):**

a) **Rauschen halten.**
   - Der Schuss hält alles, was sich zwischen zwei Schüssen bewegt:
     - Spieler-Leib im Leerlauf (Atem, Kontrapost).
     - Wind in Laub und Halm.
     - Wolken.
     - Membran-Welle und Wasser.
     - JEDEN Akteur: Tiere, Bewohner, Wagen.
     - Den TAAU-Jitter: beide Schüsse mit demselben Jitter-Index.
   - Je Quelle ein Schalter in der EINEN Bühne (`__buehne`). Die Linse misst Δ je Quelle und nennt den Täter beim Namen (Gebot 10).
     Dazu ein Selbsttest, der jede Quelle einmal offen lässt und ROT am Namen sieht.
   - Ziel: Δ zweier gleicher Schüsse ≤ 0,2 % an S2 (0/0 → −10/0), in Ego UND Third, zu 0,5, 0,3 und 0.
   - Derselbe Halt gilt im K2-Bild der Kalt-Zeile (`SCHUSS` in diag-boot-stage.cjs:76 und in sitzung-seite.js:286-298): Akteure sind keine Lücke.
     Diese beiden Leser fasst du nur an, wenn sie nach z108 und ankunft-5 frei sind. Sonst übergibst du den Halter.

b) **Tafel-Lücken füllen** (spec/abnahme/soll-tafel.json). Jede neue Zeile trägt ihre Quelle, nie ein gesenktes Soll:
   - himmel-licht zu 0,3 und 0 aus `spec/farbe/tag-ref.json`. `__lichtBilanz` misst zur Uhr der Bühne.
   - boden-nah-farbe fern.
   - mensch-kopf und haar fern: Der Kopf ist jenseits 30 m kleiner als 40 px. Gemessen wird das Albedo-Verhältnis von Haut und Haar der
     Mengen-Stufe L2 gegen das Labor, als neue Zeilen in spec/farbe/albedo-tafel.json.
   - boden-nah misst nie auf dem Pflaster (LAI 0 per Bau); die Stationen sind S5 und die Keile.

c) **haus:** die Albedo-Tafel neu mit `werkbank albedo --tafel` auf der Radeon.

d) **tor-fern, tor-bunt, tor-ziel:** Die Kameras sind relativ zum Ring (Ziel `tor-platz`) und werden aus dem Ring gerechnet, nie absolut.
   Heute stehen dort −11,6/90,24/36,48 usw.

e) **Vorher-Tafel am alten Platz:** a-spawn in Ego und Third, an Radeon und GTX. Die Ego-GTX-Tafel steht seit a-spawn-gtx3; die Radeon
   misst nur mit den Kurzläufen der Werkbank.

**Teil 2 (nach w4-ort-plan im main):**
- zug/a-spawn.cjs fährt die Stationen S1–S13 aus dem Plan (plan.md §4).
- Die Stationen rechnest du aus den Elementen des Plans relativ zu `_genesisMitte`: EINE Quelle, nie eine zweite Liste mit Koordinaten.
- Jede Klasse hat ihre nah- und fern-Station. Eine Klasse ohne Station ist ROT beim Namen.
- Der Selbsttest nennt „Station fehlt“.
- Die Station bricht laut ab, wenn ihr Skript oder ihre Stationen-Liste leer ist.

**Teil 3 (Phase 2):**
- Die volle Tafel an der GTX (OMEN-Station) und an der Radeon (Koordinator).
- Die ABAB-Zellen pp-spiel (S7), pp-zoo (S8) und pp-fahrt (S11) in `zug/messplatz.md`.
- Die Schritt-Uhren der Punkte (genesis-*: 7/11/58 s) neu.
- Die Stationen der Punkte am Genesis-Ort (plan.md §6 Nr. 13) nachziehen.

## Budget

- Die Station fährt 168 Zellen in ≤ 1 740 s je Gerät (Fahrt-Gesetz). Jede Probe ist ≤ 30 s gedeckelt.
- Werkzeug-Diffs fahren kein ABAB.

## Dateien (Besitz)

- **koordination:** zug/a-spawn.cjs, zug/a-spawn.sh.
- **main:**
  - scripts/lib/ausgabe-aufnahme.cjs.
  - scripts/werkbank.cjs, nur `bild` und die Bühne.
  - spec/abnahme/soll-tafel.json und spec/farbe/albedo-tafel.json.
  - scripts/lib/abnahme-urteil.cjs nur, wenn das Urteil die neuen Zeilen lesen muss, und erst nach A-Gesicht.
- **NICHT anfassen:** stamm/*, die Kerne und die Linsen der Zonen.

## Wartet auf

- z108 (halter-knoten: werkbank.cjs, haenger-linse.cjs).
- A-Gesicht (mensch-kopf: werkbank.cjs, abnahme-urteil.cjs).
- w4-ort-plan (Teil 2).
- Tafel, Albedo und Teil e startest du sofort.

## Beweis

**Lokal auf der Radeon** (Werkbank 4660–4669, punkte 8040, je gpu-lauf ≤ 2 min):
- Δ zweier gleicher Schüsse vorher → nachher an S2, Ego und Third, je Uhr.
- Der Selbsttest nennt jede Rauschquelle beim Namen.
- Die Albedo-Tafel neu: der Wert für haus vorher → nachher.

**OMEN:**
- a-spawn Vorher-Tafel (Ego + Third) am alten Platz, danach am Kopf mit dem Halt.
- Die Zahl GRÜN / ROT / ohne Bild je Klasse.

**Tor:**
- 0 ROT der Art „die Teilung hält ihr Rauschen nicht“.
- himmel-licht hat zu jeder Uhr ein Soll.
- haus misst nicht mehr „veraltet“.

## Abgabe

- Zweige: w4-mess-platz (main) und w4-mess-platz-koord (koordination).
- Commit-Betreff: „Abgabe w4-mess-platz: …“.
- Bericht in drei Sätzen: geschnitten, gemessen (Δ-Rauschen vorher → nachher, Tafel vorher → nachher), ehrlich offen.

## Lehren der letzten Abgaben

- **a-spawn-gtx** lief mit leerem Skript und meldete Exit 0. Darum: jede Eingabe wird geprüft.
- **bild-klasse:** Eine Probe hinterließ einen toten Renderer (wasser-linse.cjs:786). Darum: die Grundstellung der Sitzung prüft die Zeichenkette.
- **Werkzeug-Diffs** brauchen kein ABAB. Sie fahren als Vorzug-Probe (`playtest:fast` am Merge-Kandidaten).

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
