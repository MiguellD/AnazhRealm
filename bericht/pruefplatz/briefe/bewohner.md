Lies zuerst DIE GOLDENE DEFINITION in CLAUDE.md — sie ist bindend. Du läufst als champion (.claude/agents/champion.md). Lade
den Skill anazh-lehren; tragend sind Lehre 7, 11, 19 und das LEBEN-Gesetz (EIN Leib-Löser, Gang EIN Gesetz). Der Plan steht in
koordination `bericht/pruefplatz/plan.md` (§2, §3 Wache, §4, §5 S10/S10f, §14 Widerlegt). Du arbeitest in der CLOUD, also gibt es keine
Welt-Bilder; die macht der Koordinator.

# BEWOHNER — der Kopf eines Bewohners wird messbar, und am Platz steht zu jeder Uhr eine Wache (Welle a Kern, Welle d Wirt)

**Pflicht-OFFEN:** A, mensch-kopf und haar. Heute sind je 9 von 12 Zellen ohne Bild, denn Ego zeigt den eigenen Kopf nie, und Third zeigt
ihn nur am Arm. Ziel:
- Ego nah: eine Gesichts-Pose 1 m vor einem Bewohner (S10).
- Third nah: wie heute `--gesicht` am Spieler (S2).
- fern: ein Bewohner in 32–40 m (S10f, fern-Zeile ≥ 200 px).
- Das gilt zu 0,5, 0,3 (7,2 h) und 0 (Mitternacht).

**Chokepoint:**
- das EINE Rollen-Gesetz des Tages (koerper-core.js:1503-1524 `TAGES_GESETZ.rollen`, `tagesPlan` :1554-1584);
- die Teilung der Leib-Klassen (koerper-leib.js:1671: nur `spieler:kopf/…`).

**Warum eine Wache und nicht „irgendein Bewohner“:**
- Um Mitternacht schläft jeder Bewohner drinnen (koerper-core.js:1575: `h ≥ ruhe → schlaf, drinnen`).
- Draußen steht nur eine Rolle mit `versatzH` wie nachtfahrer (:1523).
- Zwei Daten-Zeilen im EINEN Rollen-Gesetz tragen die Nacht-Zellen: kein Kind, kein Familien-Gang, kein neues System. Die stehen in der
  Vorlage F.

**Was stirbt:** die Teilung, die nur den Spieler-Kopf kennt.

## Vorher → Ziel

**Vorher:**
- `stadt-platz.png` und `stadt-wagen.png` (koordination `bericht/pruefplatz/vorher/`): Bewohner als glatte Rümpfe in Grundfarben.
- Der Spieler-Kopf in Third (a-spawn-gtx3): `augeFrei` 0,07–0,29 statt [0,9, 1]; die Wurzel hat A-Gesicht.

**Ziel-Bild S10** (Ego, 1,0 m vor der Wache bei −11,35/−17,67, Ring-Weg zwischen T4 und T5):
- Ein Gesicht, das sich dem Spieler zuwendet (die Begegnung mensch.K5, `BEWOHNER.begegnungM`).
- Nachts steht die Wache unter ihrer Laterne in 3 m.

**Vorbild:** der Parkwächter am Eingang; die Begegnung eines Rollenspiels (das Gesicht in Armlänge).

## Bauen

1. **koerper-core, additiv** (alle anderen Rollen und Erwachsenen byte-gleich): zwei Zeilen in `TAGES_GESETZ.rollen`:
   - `waechter: { werk: [6, 20], mittagAmWerk: true }`
   - `nachtwaechter: { werk: [6, 20], mittagAmWerk: true, versatzH: 12 }`

   Damit steht zu 12 h die Tag-Wache am Werk, zu 0 h die Nacht-Wache, und zu 7,2 h beide: wach 6,0–7,0 h bzw. versetzt 19,2 h < Werk-Ende
   19,5–20,5 h.
2. **Wirt (stamm/siedlung-bewohner.js):**
   - Der Plan trägt die Zeile `wache` (Punkt im Plan, ort-gesetz). Der Wirt gibt zwei Bewohnern des Start-Viertels diese Rollen, so wie
     `_verkehrAnlegen` die Rolle fahrer gibt.
   - Ihr Werk und ihr Platz sind der Wache-Punkt, ihr Heim ist ihr Haus. Ein Weg vom Viertel zum Platz besteht (Knoten `genesis`).
   - Kein Leib erscheint im Blick ≤ 30 m.
3. **Kopf-Klasse** (stamm/koerper-leib.js): Der Leib eines Bewohners trägt in der Teilung `bewohner:kopf/…` samt `…/hair` wie der Spieler
   `spieler:kopf/…`; der Satz bleibt `bewohner-satz`. Übergib mess die Ausdrücke (nah: Kopf; fern: der Leib bzw. der Satz).

## Budget

- **An S2:** Die Wache steht 21 m weit, außer Blick, im Satz (Leib nur ≤ 8 m, `BEWOHNER.nahM`, siedlung-bewohner.js:2579): ≤ 2 Befehle /
  3 400 Dreiecke, CPU Δ ≤ 0,2 ms, VRAM ≤ +1 MB.
- **An S10:** Klasse bewohner ≤ 16 Befehle / 80k (haushalt.json:556), 1 Leib.

## Dateien (Besitz)

- koerper-core.js (nur die zwei Rollen-Zeilen)
- stamm/koerper-leib.js (nur die Kopf-Klasse)
- stamm/siedlung-bewohner.js (nur die Vergabe der Rollen)
- **NICHT anfassen:** siedlung-verkehr.js (w4-verkehr-c), fachwerk-core.js und siedlung-ort.js (ort-gesetz, ort-wirt), die
  Mensch-Ofen-Wurzel des Gesichts (A-Gesicht).

## Wartet auf

- Kern (1, 3): sofort. Kein laufender Zweig fasst koerper-core.js oder koerper-leib.js an.
- Wirt (2): nach w4-verkehr-c und w4-stadt-takt (beide ändern siedlung-bewohner.js) und nach w4-genesis-ort-wirt (Wache-Punkt,
  Start-Viertel).

## Beweis (headless, Zahlen)

- Golden koerper byte-gleich für jede bestehende Rolle.
- `tagesPlan` zu 12 h, 7,2 h und 0 h: jeweils ≥ 1 Wache `wo = werk`, über 1 000 Samen (Streu ±0,5 h).
- Die Teilung eines Bewohner-Leibs nennt `bewohner:kopf/` und `bewohner:kopf/hair` (Null-Renderer, Namen der Teile).
- An S2 vorher → nachher: Zahl der Bewohner-Leiber 0 → 0, Satz-Instanzen +≤ 1.
- `npm run playtest:fast` am Merge-Kandidaten.

**GPU-Proben für den Koordinator** (Radeon, nach dem Plan):
- S10: Ego −10,81/−16,83 → Wache, `--uhr 0.5|0.3|0 --ist mensch-kopf` und `--ist haar`.
- S10f: Ego −3,07/13,24 → Wache (32 m); Third mit dem Spieler bei −2,55/15,18 (Kamera 40 m).
- S2 Third `--gesicht` am Spieler wie heute.
- `werkbank takt` an S2 vorher↔nachher.

**Tor:**
- mensch-kopf und haar an S10, S10f und S2 zu jeder Uhr im Bild.
- An S2 CPU Δ ≤ 0,2 ms.

## Abgabe

- Zweig: w4-bewohner-wache. Commit-Betreff: „Abgabe w4-bewohner-wache: …“.
- Bericht in drei Sätzen, die GPU-Proben und die vier Zeilen des BETRIEBSGESETZES.

## Lehren der letzten Abgaben

- **mensch-kopf:** Der Mensch-Ofen lieferte 351× keine L2-Gestalt fail-closed; danach fehlten alle Bewohner und z107 riss nach 90 min.
  Niemand wartet auf eine Gestalt, die nicht kommt. `playtest:fast` am Kandidaten.
- **Verkehr-C:** Rollen gibt der Wirt nach EINEM Gesetz (fahrer, nachtfahrer). Die Wache folgt demselben Muster.
- **Gebot 7:** Kosten folgen dem Schirm. Eine Wache außer Blick ist Satz oder Zahl, kein Leib.

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
