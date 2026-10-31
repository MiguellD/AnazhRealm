Lies zuerst DIE GOLDENE DEFINITION in CLAUDE.md — sie ist bindend. Du läufst als champion (.claude/agents/champion.md). Lade
den Skill anazh-lehren; tragend sind Lehre 3, 11, 18, 19 (Labor = Welt) und das LEBEN-Gesetz (EIN Leib-Löser, Gang EIN Gesetz). Du
arbeitest in der CLOUD, also gibt es keine Welt-Bilder; die macht der Koordinator.

**STARTET ERST, wenn der Schöpfer F in `docs/PFLICHT-OFFEN.md` gesetzt hat** (Vorlage: koordination `bericht/pruefplatz/plan.md` §1).
Setzt er F nicht, fällt dieser Brief FINAL. Vorher ist jede Zeile hier Scope-Diebstahl an A, B, C und E.

# SPIELPLATZ (F) — Geräte des Zimmermanns mit ihrem Verb, EIN Zaun-Gesetz, Kinder und Familien aus dem EINEN Körper- und Gang-Gesetz

**Eintrag:** F, die Zone Spielplatz. Das Kriterium: das Kind schaukelt nach dem Pendel des EINEN Leib-Lösers; an der Station hält das Band.

**Chokepoint:**
- fachwerk WERKE (`AUS_ARTEN`, fachwerk-core.js:6189; Bauer :6157-6190: heute Bank, Leiter, Brücke) — „ihr Verb trägt die Form“;
- das Alter-Dial des Körpers (koerper-core.js:119-128, heute 18–80) und die Größe (:90-97);
- das EINE Gang-Gesetz (`gangSchritt`).

**Was stirbt (in EINER Welle):** der Wirt-Streifen des Dorf-Zauns, „bewusst KEIN Blocker“ (siedlung-wege.js:1055-1083,
`_stlZaunAddStrip`). Der Zaun wird EINE Art des Zimmermanns mit den Reglern Höhe und Blocker, gezeichnet im Bau-Satz; die Dorf-Zäune
(fachwerk `fences`, fachwerk-core.js:4359) lesen dieselbe Art. Kein zweiter Zaun.

## Vorher → Ziel

**Vorher:** An der Stelle (Wunsch r 260 auf 286,4°, hinter dem Vitruv-Tor) steht Wald. Spielgeräte gibt es nicht (0 Treffer in main).
Bewohner sind Erwachsene von 18–80 Jahren; ihr Tagesplan kennt weder Sitzen noch Spielen.

**Ziel-Bild:** der Heckscher Playground im Central Park:
- Holz-Schaukel mit Eisenketten, Rutsche mit Blechbahn, Klettergerüst nach der Podest-Grammatik der Leiter, Sandkasten, Wippe;
- Bänke der Eltern am Rand, ein Zaun;
- Kinder von 4–12 Jahren (Kopf ⅕ bis ⅙ der Höhe) an den Geräten, Eltern auf den Bänken.

## Bauen

1. **fachwerk-core §WERKE, additiv** (jede alte Art byte-gleich):
   - neue Arten `schaukel`, `rutsche`, `klettergeruest`, `sandkasten`, `wippe` und `zaun` (Regler Höhe, Blocker);
   - Stufen [0, 1, 3] wie die Ausstattung, Saat statt Zufall;
   - Labor = Welt: worlds/fachwerk/fachwerk.js zeigt jede Art aus dem Kern.
2. **Der Abschied des Zaun-Streifens** in derselben Welle: Definition, Maschine, Tests. Die Dorf-Zäune zeichnen danach als Art.
3. **Verben** (stamm/koerper-bewegung.js) über den EINEN Leib-Löser, nie als Sonderphysik:
   - Pendel: T = 2π√(L/g).
   - Gleiten auf der Schräge: heute nur Taste C mit fester Dauer, koerper-bewegung.js:1371-1400.
   - Wippen.
   - Sitzen und Klettern über die bestehenden Marken (`sitzbar`, bau-teile.js:444-449; Klettern an der Wand, :1507-1530).
4. **koerper-core, additiv** (Erwachsene byte-gleich):
   - das Alter unter 18 in DERSELBEN Gestalt-Funktion (Kopf zu Höhe nach Wachstumskurve, Größe 0,55–0,9);
   - die Tätigkeiten `spielen` und `sitzen` im Tagesplan;
   - der Familien-Gang (die Gruppe geht zusammen) im Gang-Gesetz des Studios, nicht im Wirt.
5. **Besucher:** Familien des Start-Viertels haben den Spielplatz als `besuch` (dieselbe Stelle von `tagesPlan`, koerper-core.js:1554).
   Kein Besucher-Register.
6. **Sand:** `belagO` lernt `sand` (gelaende-core, nach der Landung von grund; die Datei gehört dann dir).
7. **Haken:** die Fläche, die Geräte-Zeilen und die haushalt-Regeln setzt ort-wirt (Besitzer von siedlung-ort.js, §GENESIS_ORT und
   haushalt.json).

## Budget (an der Station Spielplatz; die Summe hält das Band)

- Je Gerät: L0 ≤ 1 800 Dreiecke / 1 Befehl, L1 ≤ 240 / 1, Wurf ≤ 30 / 1 (Muster der Werke-Zeilen, fachwerk-core.js:120-141).
- Alle Geräte und Bänke ≤ 12 Befehle / 15k; Zaun je 10 m ≤ 1 / 400.
- Bewohner: ≤ 4 Leiber (`nahLeiber`), der Rest im Satz.
- CPU Δ ≤ 0,5 ms. Ein Verb rechnet nur, solange ein Leib das Gerät benutzt; jenseits 60 m oder außer Blick ruht jeder als Zahl.
- Die Fläche liegt ≥ 210 m von M. Die Posen-Linse (ort-gesetz) prüft die Station und die residenten Zonen, bevor gebaut wird.

## Dateien (Besitz)

- fachwerk-core.js §WERKE und die Zeile der Dorf-Zäune, worlds/fachwerk/fachwerk.js
- stamm/koerper-bewegung.js, koerper-core.js, stamm/siedlung-wege.js (nur der Abschied des Zaun-Streifens), gelaende-core.js (nur
  `sand`, nach grund)
- **NICHT anfassen:** siedlung-ort.js, §GENESIS_ORT, haushalt.json (ort-wirt); siedlung-bewohner.js außer der Besuchs-Zeile, die du
  bewohner bzw. ort-wirt meldest.

## Beweis (headless, Zahlen)

- Golden fachwerk und koerper byte-gleich für jede alte Art und jeden Erwachsenen.
- Pendel-Periode im Soll ± 5 %; Rutsche unten < 4 m/s, kein Durchfallen; Wippe kippt unter Last.
- Ein Wolf auf Kurs gegen einen Zaun mit Blocker bleibt in 100/100 Versuchen draußen; ein Dorf-Zaun ohne Blocker bleibt durchlässig.
- Absenz `_stlZaunAddStrip` = 0.
- Kind: Kopf zu Höhe im Soll.
- `npm run playtest:fast` am Merge-Kandidaten.

**Für den Koordinator:** Bilder der Station in Ego und Third zu 0,5; je Gerät aus 3 m und aus 20 m; `werkbank zaehlen` und `takt`.

## Abgabe

- Zweig: w4-spielplatz. Commit-Betreff: „Abgabe w4-spielplatz: …“.
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
