Lies zuerst DIE GOLDENE DEFINITION in CLAUDE.md — sie ist bindend. Du läufst als champion (.claude/agents/champion.md). Lade
den Skill anazh-lehren; tragend sind Lehre 11, 18, 19 (Kosten gehören ins Asset, Labor = Welt) und 22. Der Plan steht in
koordination `bericht/pruefplatz/plan.md` (§1, §2, §3 Sektoren). Du arbeitest in der CLOUD, also gibt es keine Welt-Bilder; die macht
der Koordinator.

# WERKE — die Geräte des Spielplatzes, der Gehege-Zaun und Pergola/Torii der Arena als Arten des Zimmermanns, jede mit ihrem Verb (Phase 1)

**Pflicht-OFFEN:**
- A: mensch-kopf und haar brauchen den Ort der Familien (S7). fell braucht den Zaun, der die Tiere im Bild hält (S8).
- E: die Klasse bau im Sektor.

**Chokepoint:** fachwerk WERKE, also die Arten des Zimmermanns: `AUS_ARTEN` (fachwerk-core.js:6189) mit Bank, Leiter und Brücke und ihren
Bauern (:6157-6190). Das Prinzip gilt weiter: „ihr Verb trägt die Form“.

**Was stirbt:** nichts. Die Geräte gibt es heute nicht; die Suche nach Schaukel, Rutsche, Sandkasten, Klettergerüst und Wippe findet in
main 0 Treffer.

## Vorher → Ziel

**Vorher:** Am Ort des Spielplatzes (60/−55) steht heute Wald. Den Zaun des Dorfs gibt es nur als 0,85 m, und ausdrücklich ohne
Blocker-Wirkung (siedlung-wege.js:1055-1083).

**Ziel-Bild (S7, 52/−48 → 64/−58):**
- Der Heckscher Playground im Central Park.
- Holz-Schaukel mit Eisenketten und Sitzbrett.
- Rutsche: Holz-Gerüst mit Blechbahn.
- Klettergerüst nach der Podest-Grammatik der Leiter.
- Sandkasten mit Holzrahmen, Belag Sand (grund).
- Wippe.
- Bänke der Eltern am Rand.

**Dazu:**
- Gehege-Zaun 1,6 m aus Pfosten und Geflecht: ein Blocker, der Tiere hält, mit Laternen am Zoo-Weg.
- Für die Arena eine Pergola (Dojo aus dem Schmiede-Labor, worlds/schmiede/schmiede.js:1290-1305) und ein Torii am Eingang.

**Material:** Holz mit Fase, Holznagel und Eisen-Beschlag nach dem Material-Gesetz des Zimmermanns.

## Bauen (fachwerk-core §WERKE, additiv; alle alten Arten byte-gleich)

1. Neue Arten in `AUS_ARTEN`: `schaukel`, `rutsche`, `klettergeruest`, `sandkasten`, `wippe`, `zaun` (Blocker), `pergola`, `torii`.
   - Jede mit ihren Reglern, einer Wirts-Zeile und den Stufen [0, 1, 3] wie die Ausstattung.
   - Saat statt Zufall.
2. Labor = Welt: `worlds/fachwerk/fachwerk.js` zeigt jede Art aus demselben Kern.
3. **Verben des Leibs** (stamm/koerper-bewegung.js) über den EINEN Leib-Löser, nie als Sonderphysik:
   - Pendel (Schaukel): T = 2π√(L/g).
   - Gleiten (Rutsche): die Schräge trägt das Rutschen; heute gibt es nur die Taste C mit fester Dauer, koerper-bewegung.js:1371-1400.
   - Wippen.
   - Sitzen und Klettern laufen über die bestehenden Marken (`sitzbar`, bau-teile.js:444-449; Klettern an der Wand, :1507-1530).
4. Die Klasse bau in haushalt.json zählt heute nur haus, gate, vehicle, weapon und ausstattung (:576-581). Melde ort-plan die neuen Arten
   für die Täter-Regel, denn haushalt.json gehört ort-plan.

## Budget

- **Je Gerät:** L0 ≤ 1 800 Dreiecke / 1 Befehl, L1 ≤ 240 / 1, Wurf ≤ 30 / 1 (das Muster der Werke-Zeilen, fachwerk-core.js:120-141).
- **Spielplatz an S7:** 5 Geräte plus Bänke ≤ 12 Befehle / 15k Dreiecke.
- **Zaun:** je 10 m ≤ 1 Befehl / 400.
- **Arena-Bauten:** ≤ 6 Befehle / 10k.
- **CPU:** Ein Verb rechnet nur, solange ein Leib das Gerät benutzt.

## Dateien (Besitz)

- fachwerk-core.js, nur §WERKE: die AUS_ARTEN-Zeilen und die Bauer der neuen Arten. §GENESIS_ORT gehört ort-plan.
- worlds/fachwerk/fachwerk.js.
- stamm/koerper-bewegung.js (die Verben).
- **NICHT anfassen:** siedlung-ort.js und haushalt.json (ort-plan); siedlung-bewohner.js (familien); kreatur-* (gehege).

## Wartet auf

- w4-studios-heim2 im main (fachwerk-core.js).
- **Übergaben:**
  - an familien: Geräte und Bänke, damit Kinder spielen und Eltern sitzen.
  - an gehege: den Zaun als Wand.
  - an arena: Pergola und Torii.
  - an ort-plan: die Täter-Regel der Klasse bau.

## Beweis (headless, Zahlen)

- Golden fachwerk byte-gleich für jede alte Art.
- Dreiecke und Befehle je Stufe der neuen Arten im Budget.
- Der Leib, headless:
  - Schaukel: Pendel-Periode im Soll ± 5 %.
  - Rutsche: unten < 4 m/s, kein Durchfallen.
  - Wippe: kippt unter Last.
  - Zaun: ein Wolf auf Kurs gegen den Zaun bleibt in 100/100 Versuchen drin.
- `npm run playtest:fast` am Merge-Kandidaten.

**GPU-Proben für den Koordinator** (Radeon; der Spielplatz muss im Plan stehen):
- `werkbank bild 52 +1.7 -48 64 +1 -58 --uhr 0.5` in Ego und Third (S7).
- Ein Bild jedes Geräts aus 3 m und aus 20 m.

**Tor:** S7 hält die Sektor-Hülle; der Zaun hält alle Tiere.

## Abgabe

- Zweig: w4-werke. Commit-Betreff: „Abgabe w4-werke: …“.
- Bericht in drei Sätzen und die GPU-Proben.

## Lehren der letzten Abgaben

- Labor = Welt (Lehre 19, K45: der Labor-Wolf L0 fiel von 1 299 852 auf 54 894 Dreiecke): Das Labor zeigt, was der Ofen der Welt baut, nie
  eine eigene Szene.
- **mensch-kopf** riss z107. Darum vor der Abgabe `playtest:fast` am Kandidaten.
- Arbeite in kleinen Commits, eine Art nach der anderen, mit Byte-Beweis.

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
