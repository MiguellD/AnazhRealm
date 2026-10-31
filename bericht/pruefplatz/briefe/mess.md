Lies zuerst DIE GOLDENE DEFINITION in CLAUDE.md — sie ist bindend. Du läufst als champion (.claude/agents/champion.md). Lade
den Skill anazh-lehren; tragend sind Lehre 5, 6, 17, 20 und 21 sowie Gebot 10 (die Linse nennt den Täter beim Namen). Der Plan steht in
koordination `bericht/pruefplatz/plan.md` (§0, §5, §7, §8). Du arbeitest LOKAL: Rauschen zeigt nur eine echte GPU.

# MESS — ein Schuss ist zweimal derselbe, jede Zelle hat ein Soll, jede Klasse ihre Station (Welle a sofort, dann Welle d und Phase 2)

**Pflicht-OFFEN:**
- A: 68 der 92 ROT-Zellen sind Apparat oder Tafel und fallen ohne Laufzeit-Byte; danach 168 Zellen mit Bild.
- E: die Stationen des ABAB, die Ratschen und die Punkte-Reihen am Genesis-Ort.

**Chokepoint:** der Schuss der Werkbank (`bild` → scripts/lib/ausgabe-aufnahme.cjs, `__buehne`). Was er nicht hält, rauscht.

**Was stirbt:**
- das Halten nur der Kreaturen (`tiereHalten`, ausgabe-aufnahme.cjs:477-493);
- die globale Bildwand 0,1 % für jede Zeile (zug/a-spawn.cjs:53);
- die absoluten Tor-Kameras der Tafel (−11,6/90,24/36,48 …);
- der Mittag-Zwang der Licht-Bilanz;
- die 8 Blicke ab M (Teil 2).

## Vorher (a-spawn-gtx3, GTX, main b4bcf19c; koordination `bericht/a-spawn-gtx3/urteil.txt`)

- 22 von 114 Zellen im Bild sind GRÜN; 54 von 168 haben kein Bild.
- ROT: 48 Rauschen (Δ zweier gleicher Schüsse 0,23–0,57 % > 0,2 %, in Third jede Klasse, in Ego die fernen Zellen) · 12 haus „veraltet
  seit 1dcb844f“ (Labor 0,1491 gegen Welt 0,1592) · 8 himmel-licht ohne Soll zu 0,3 und 0 (`__lichtBilanz` ruft `__buehne()` und
  erzwingt Mittag).
- **Vorbild:** Unreal Functional Screenshot Test (verrauschte Merkmale aus, Toleranz, Soll-Bild im VCS), der tägliche Welt-Test von
  AC Origins.

## Bauen

**Teil 1 (Welle a, sofort; werkbank.cjs und abnahme-urteil.cjs erst nach w4-mensch-kopf und w4-studios-heim):**

a) **Rauschen halten.**
   - In der EINEN Bühne (`__buehne`) bekommt jede Quelle einen Schalter:
     - Atem und Kontrapost des Spieler-Leibs;
     - Wind in Laub und Halm, Wolken;
     - Membran-Welle, Wasser, Brunnen;
     - JEDER Akteur: Tiere, Bewohner, Wagen;
     - der TAAU-Jitter (beide Schüsse mit demselben Jitter-Index).
   - Die Linse misst Δ je Quelle und nennt den Täter beim Namen. Ihr Selbsttest lässt jede Quelle einmal offen und sieht ROT am Namen.
   - Ziel: Δ zweier gleicher Schüsse ≤ 0,2 % an S2 in Ego UND Third zu 0,5, 0,3 und 0.
   - **Der K2-Halter:** Derselbe Halter hält im K2-Bild der Kalt-Zeile die Membran-Zeit wie das Band-Instrument (bericht/0910-4), dazu
     Brunnen, Teich, Laternen und jeden Akteur.
   - Den Leser in diag-boot-stage.cjs:76 (`SCHUSS`) besitzt w4-ankunft-5; übergib den Halter dort oder zieh ihn nach dessen Landung
     selbst nach.

b) **Tafel-Lücken** (spec/abnahme/soll-tafel.json; jede Zeile mit Quelle, nie ein gesenktes Soll):
   - himmel-licht zu 0,3 und 0 aus spec/farbe/tag-ref.json; `__lichtBilanz` misst zur Uhr der Bühne.
   - boden-nah-farbe fern.
   - **fern-Zeilen für fell, mensch-kopf und haar.** Grund: ein Kopf in 4 m bringt 0,045 %, 3 Wölfe in 42 m 0,02 %; `gesicht` und
     `strich` tragen nur bei 0,7 m und 4 m.
     - Bild-Regel: im Bild ab 200 px je Instanz des Leibs. Quelle ist die Lochkamera mit f = 704 px (ein Mensch 0,79 m² in 40 m = 245 px,
       ein Wolf 0,6 m² in 34 m = 253 px).
     - Maß: das Albedo-Verhältnis der Fern-Stufe gegen das Labor, als neue Zeilen in spec/farbe/albedo-tafel.json.
     - Die Wand je Zeile liest zug/a-spawn.cjs statt der globalen `IM_BILD` (:53).
   - Der Tor-Ausdruck (`tor`, 7 Gestalten) bekommt die drei Namen, die tore dir übergibt (Lyra-, Vitruv-, Tier-Tor).
   - Die Kopf- und Leib-Ausdrücke der Bewohner (`bewohner:kopf/…`, der Satz) übergibt dir bewohner.

c) **haus:** die Albedo-Tafel neu mit `werkbank albedo --tafel` auf der Radeon.

d) **Vorher-Tafel am alten Platz:** a-spawn in Ego und Third. Radeon lokal mit Kurzläufen; die GTX fährt die OMEN-Station.

**Teil 2 (Welle d, nach w4-genesis-ort-wirt im main):**
- zug/a-spawn.cjs fährt die Stationen aus dem Plan (`stationen` aus §GENESIS_ORT, über die Seite gelesen). Das ist die EINE Quelle, nie
  eine zweite Koordinaten-Liste.
- Jede Klasse hat ihre nah- und fern-Station (plan.md §5). Eine Klasse ohne Station ist ROT beim Namen, der Selbsttest nennt
  „Station fehlt“.
- Leeres Skript oder leere Stationen-Liste: ROT, nie Exit 0.
- Die Tor-Kameras der Tafel stehen relativ zu `stationen` (S1L, S1M, S3).
- boden-nah misst nie auf dem Pflaster, nur an S5.

**Teil 3 (Phase 2):**
- Die volle Tafel an der GTX (OMEN-Station) und an der Radeon (Koordinator).
- Die Schritt-Uhren der Punkte genesis-* (7/11/58 s) neu.
- Die Stationen der Punkte am Genesis-Ort nachziehen (plan.md §7 Nr. 12); den Stau vorher buchen lassen.

## Budget

- Die Station fährt 168 Zellen in ≤ 1 740 s je Gerät (Fahrt-Gesetz); jede Probe ist ≤ 30 s gedeckelt.
- Werkzeug-Diffs fahren kein ABAB; sie fahren die Vorzug-Probe `playtest:fast`.

## Dateien (Besitz)

- **koordination:** zug/a-spawn.cjs, zug/a-spawn.sh.
- **main:**
  - spec/abnahme/soll-tafel.json, spec/farbe/albedo-tafel.json, scripts/lib/ausgabe-aufnahme.cjs.
  - scripts/werkbank.cjs, nur `bild` und die Bühne. Danach geht die Datei an ort-wirt (nur :926 und Anker).
  - scripts/lib/abnahme-urteil.cjs nur, wenn das Urteil die fern-Zeilen lesen muss.
- **NICHT anfassen:** stamm/*, die Kerne, diag-boot-stage.cjs (ankunft-5), die Linsen der Zonen.

## Wartet auf

- Sofort: Halter, Tafel, Albedo, a-spawn (koordination).
- werkbank.cjs und abnahme-urteil.cjs: nach w4-mensch-kopf und w4-studios-heim.
- Teil 2: nach w4-genesis-ort-wirt.

## Beweis

**Lokal auf der Radeon** (Werkbank 4660–4669, punkte 8040, je gpu-lauf ≤ 2 min):
- Δ zweier gleicher Schüsse vorher → nachher an S2, Ego und Third, je Uhr.
- Der Selbsttest nennt jede Quelle beim Namen.
- haus: Albedo vorher → nachher.

**OMEN:** a-spawn-Tafel (Ego + Third) am alten Platz, danach am Kopf mit Halter und Tafel; je Klasse GRÜN / ROT / ohne Bild.

**Tor:**
- 0 Zellen der Art „die Teilung hält ihr Rauschen nicht“.
- himmel-licht trägt zu jeder Uhr ein Soll.
- haus misst nicht mehr „veraltet“.
- Die fern-Zeilen stehen mit Quelle.

## Abgabe

- Zweige: w4-mess-platz (main) und w4-mess-platz-koord (koordination). Commit-Betreff: „Abgabe w4-mess-platz: …“.
- Bericht in drei Sätzen: geschnitten, gemessen (Δ-Rauschen vorher → nachher, Tafel vorher → nachher), ehrlich offen. Dazu die vier
  Zeilen des BETRIEBSGESETZES.

## Lehren der letzten Abgaben

- **a-spawn-gtx** lief mit leerem Skript und meldete Exit 0. Darum prüft jede Station ihre Eingabe.
- **bild-klasse:** Eine Probe hinterließ einen toten Renderer (wasser-linse.cjs:786). Darum prüft die Grundstellung der Sitzung die
  Zeichenkette.
- **Werkzeug-Diffs** brauchen kein ABAB, sie fahren `playtest:fast` am Merge-Kandidaten.

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
