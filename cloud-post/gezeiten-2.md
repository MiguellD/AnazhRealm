# Post an gezeiten-2

## 26.11. 21:36 — GPU-PROBE 36fc4266 auf omen-gtx1060: GRÜN in 902 s (gate:pruefbuehne-licht GRÜN 59 s auf omen-gtx1060 · gate:weltbild-frost:echt GRÜN 170 s auf omen-gtx1060 · gate:studio-begehen GRÜN 277 s auf omen-gtx1060 · gate:webgl-probe GRÜN 57 s auf omen-gtx1060) → probe-post/gezeiten-2/36fc4266.md

## 26.11. 20:10 Koordinator — START-BRIEF (Welle 27.11.; dieser Abschnitt ist dein Auftrag, lies ihn GANZ)

Lies zuerst DIE GOLDENE DEFINITION in CLAUDE.md — sie ist bindend. Arbeite nach IPERKA (`.claude/agents/champion.md`). Dann das
Regel-Blatt `git show origin/koordination:cloud-post/welle-2611-regeln.md` (bindend) und `cloud-post/alle.md`.

**Deine Sprosse:** `karte2.planet.wasser.gezeiten#1` — Wortlaut der Station (Radeon, Runde 39, Kopf 99649186):
„ROT: S1 periodeH ungemessen gegen Soll 12,42 ± 2 % ✗ · Täter: gelaende-core.js:5884 waterLevel = GRUND.basis − meerUnterBasisM (eine
Konstante je Lage) und gelaende-core.js:7767 wasserSpiegel(L, x, z) ohne Zeit — kein Leser hebt den Spiegel mit Mond und Uhr: Hub 0 m
über 12 Küsten × 25 Stunden (25 unter der Uhr der Heimat), Watt 0 Punkte · Fächer 325/325 Adressen (12 Saaten × 25 Zeiten + 25) in
760 ms · Leser stamm/wasser-hydro.js:681 _koerperWasser (der Spiegel am Körper) · stamm/wasser-hydro.js:325 _pegelTakt unter der
Welt-Uhr · … schlechteste {"saat":3,"ort":null,"zeit":0} nass 5 · Bild dort Ego am Ufer der Saat 3 zur Stunde 0 der Welt-Uhr, Blick
quer übers Watt (5 von 11 Punkten nass, Spiegel -3 m) · ungemessen: das Bild des trockenfallenden Watts“

**Die Vorgeschichte (lies sie, bevor du schneidest):**
- Der Zweig `origin/gezeiten` = 2f1c74c92357f71b00c67cb731332a4e7d040ddc („Vorprüfung gezeiten Kopf 3“, 25.11. 22:48, 15 Commits auf
  dem ALTEN main 2da17e2e, 29 Dateien, +1 644 −95; gegen den heutigen main steht er im Konflikt) ist nie gelandet; seine Sitzung
  antwortet nicht mehr. Am main 4a188bf2 steht das Wort „gezeit“ trotzdem schon 56-mal in `gelaende-core.js` und 33-mal in
  `stamm/wasser-hydro.js` — kläre ZUERST per `git log -S`, was davon gelandet ist und was nur im Zweig lebt.
- Befund am Gerät (GTX 1050, Runde 35) zu jenem Zweig: „Der Hub der Gezeit steht an 12 Küsten × 25 h und an der Heimat bei 0 m. Die
  3,45 m der Abgabe lebten nur in `heim-messung.cjs` (Null-Renderer) — im Spiel liest `_koerperWasser` nach `_pegelTakt` keinen
  Gezeiten-Term.“ Das ist die Niederlage, die sich nicht wiederholen darf: gemessen im Testrahmen, nicht im Spiel.

**Auftrag:** der Pegel der ECHTEN Sitzung trägt die Gezeit. EIN Leser — derselbe Spiegel, den Körper (`_koerperWasser`), Ufer und
Wasser-Bild lesen; `wasserSpiegel(L, x, z)` bekommt die Zeit aus der Welt-Uhr über `_pegelTakt`, kein zweiter Rechen-Weg daneben,
kein Schalter, kein fail-soft. Periode aus dem Gesetz des Mondes (M2 12,42 h — das Soll der Station), Hub je Küste aus der Lage.
Hole aus `origin/gezeiten` heim, was trägt (als EINEN glatten Kopf auf dem heutigen main, kein Merge der 15 Commits), und schließe
die Lücke, die der Befund nennt. Beweis im Blatt: die Zahlen der Station an denselben 12 Küsten × 25 h vorher (Hub 0 m) ↔ nachher,
gemessen durch den Leser des Spiels (nicht durch einen Null-Renderer-Zwilling); die Station liegt in
`meisterkarte-quelle/punkte/stationen/k2-planet.js` (GZ „planet.wasser.gezeiten“, :3685, Zweig `punkte-maschine`) — lies sie ganz,
ändere sie nie im Spiel-Zweig. Die Zeilen-Nummern :5884/:7767/:681/:325 stammen aus der roten Zeile am Kopf 99649186; am main
4a188bf2 habe ich sie NICHT nachgelesen.

**Abgabe:** Zweig `gezeiten-2` auf dem heutigen `origin/main`; EIN glatter Vorprüf-Kopf, Betreff
`Vorprüfung gezeiten-2 <n> (auf main <kopf8>): <vorher → nachher mit Zahl> [gpu-probe: gate:pruefbuehne-licht, gate:weltbild-frost:echt, gate:studio-begehen, gate:webgl-probe] [ci voll]`
(höchstens vier Tore, je ≤ 480 s); `npm run check:statik` GANZ vor dem Schub; `sh artifacts/profiband/werkzeug/zug.sh probe-tag`
muss OK sagen; kein PR, keine Versions-Stufe, kein Siegel-Wort (fertig · RUND · vollendet · vollzogen · Schluss · SCOPE ZU). Im Rumpf:
Station gefahren (wo, Wortlaut) oder „Station nicht gefahren: <Grund>“ — der Vor-Richter (Gerät mit GPU) fährt sie am Kopf.

**Wartezimmer:** nach dem Vorprüf-Kopf NICHT enden — bis zu 4 h alle ≤ 9 min `git fetch -q origin koordination main` und dieses Blatt
auf einen neuen Abschnitt „## … Koordinator“ prüfen, Post abarbeiten, weiter warten. Dein Stand-Blatt: `cloud-post/gezeiten-2.md`
in DEINEM Zweig (oberster Abschnitt = jüngster Stand).
