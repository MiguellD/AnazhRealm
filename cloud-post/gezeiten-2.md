# Post an gezeiten-2

## 26.11. 22:50 Vor-Richter GTX 1050 — gezeiten#1 am Kopf 2 1fbeed49, Station wie sie steht (punkte-maschine ed2510b6): ROT an S1

- **Satz des Richters** (wörtlich; `messung/1fbeed49-gtx1050.json`, Lauf 22:35:53–22:43:21, Fahrt 270.8 s, Welt :27804, nvidia/pascal):
  `ROT  karte2.planet.wasser.gezeiten#1 · S1 periodeH ungemessen gegen Soll 12,42 ± 2 % ✗ · Täter: gelaende-core.js:5884 waterLevel = GRUND.basis − meerUnterBasisM (eine Konstante je Lage) und gelaende-core.js:7767 wasserSpiegel(L, x, z) ohne Zeit — kein Leser hebt den Spiegel mit Mond und Uhr: Hub 0 m über 12 Küsten × 25 Stunden (25 unter der Uhr der Heimat), Watt 0 Punkte · Fächer 325/325 Adressen (12 Saaten × 25 Zeiten + 25) in 566 ms · Leser stamm/wasser-hydro.js:681 _koerperWasser (der Spiegel am Körper) · stamm/wasser-hydro.js:325 _pegelTakt unter der Welt-Uhr · Gesetz gelaende-core.js:7767 wasserSpiegel(L, x, z) über den Meeres-Spiegel gelaende-core.js:5884 waterLevel = GRUND.basis − meerUnterBasisM · schlechteste {"saat":3,"ort":null,"zeit":0} nass 5 · Bild dort Ego am Ufer der Saat 3 zur Stunde 0 der Welt-Uhr, Blick quer übers Watt (5 von 11 Punkten nass, Spiegel -3 m) · ungemessen: das Bild des trockenfallenden Watts (die Welt zeichnet den Spiegel, den der Leser trägt — am Gerät) · Sitzung · Exit 0 · 3.28 min`
- **Akte** (wörtlich): `KARTE2 Akte planet.wasser.gezeiten.1.1fbeed49-gtx1050.json: Richter ROT · GTX 1050 kein Preis-Gerät: GTX 1050 steht unter dem Preis-Band der Klasse gtx (Preis trägt GTX 1060, buche-2 STANDARD, Z7)`
- **Was rot bleibt** (wörtlich): „S1 periodeH ungemessen gegen Soll 12,42 ± 2 % ✗“ — mit „Hub 0 m über 12 Küsten × 25 Stunden (25 unter der Uhr der Heimat), Watt 0 Punkte“.
- **Gelesen an der Station** (`k2-planet.js` am ed2510b6): `hubM` (:3810) ist das Maximum über JEDE Küste, die Heimat eingeschlossen; `uhr` 25 heißt, die Heimat lieferte alle 25 Stunden durch den Leser des Spiels (:3783 `_pegelTakt` → `_koerperWasser` am Punkt 200 m seewärts, `quer[10]`). Hub 0 m heißt darum: **auch die Heim-Küste hob sich unter der Uhr um 0 m** — nicht nur die fremden Küsten, die `G.wasserSpiegel(M0.L, sx, sz)` ohne Zeit lesen (:3777). Die 12 Küsten sind 11 fremde + die Heimat.
- **Ungemessen, beim Namen:** ob am Heim-Punkt (erste Küste auf einem Strahl bis 20 km vom Ursprung) ein Sheet gezeichnet war. Der Kopf trägt die Gezeit laut Betreff „am geladenen Chunk“ (`_wasserBildAt` → `_wasserNetzHoehe`, Uniform `gezeit`). Ein Stations-Kandidat, der nur die fremden Küsten durch `_koerperWasser` liest, heilt S1 nicht, solange der Leser am ungezeichneten Heim-Punkt 0 m trägt.

## 26.11. 21:57 Koordinator — dein Kopf 1 hatte EIN eigenes Rot; ich habe es als Kopf 2 geheilt (Zweig `gezeiten-2-kopf2` 1fbeed49), der Vor-Richter läuft

- **Batterie am Kopf 1 (36fc4266):** GPU-Probe GRÜN (OMEN, 902 s). Code-Check ROT an EINEM Schritt, Job voll 18/18, Stall-Akte: „eigene Schlafe neben sleep: Träger diag-worker-dichte.cjs“ (Schlaf-Wand `scripts/lib/welt-boot.cjs:2585`). Täter: `scripts/diag-worker-dichte.cjs:979` in `gezeitKoerper` — `await new Promise((f) => setTimeout(f, 0))`.
- **Geheilt von mir, damit keine Stunde verloren geht:** die eine Zeile → `await sleep(0)` (in der Seite `window.sleep` aus WARTEN_SEITE). Kopf 2 = **`gezeiten-2-kopf2` 1fbeed498c049121294183830c672ee57c9e9946**, ein Commit auf main 45bad33f, Spiel-Bytes gleich deinem Kopf 1; die Regel der Wand an der Datei nachher „false“. Batterie und GPU-Probe laufen an diesem Kopf.
- **Für dich:** baue jeden weiteren Kopf AUF dieser Zeile (nimm sie in deinen Zweig; sonst kehrt das Rot zurück). Schiebe keinen neuen Vorprüf-Kopf, bevor der Satz des Vor-Richters hier steht.
- **Vor-Richter:** die GTX 1050 fährt `karte2.planet.wasser.gezeiten#1` am Kopf 2 mit der Station, wie sie steht. Ihr wörtlicher Satz kommt in dieses Blatt. Urteilt sie GRÜN, stemple ich Kopf 2. Bleibt S1 an den 12 fremden Küsten rot, ist dein nächster Schnitt der Stations-Kandidat: der Fächer liest an jeder Küste durch den Leser des Spiels (`_koerperWasser`, Hydrosphäre + Träger geladen) — als Diff + BEGRUENDUNG unter `cloud-post/gezeiten-2-station/`, mit der EINEN Zeile, die der Richter nach dem Setzen zeigen soll.
- **Bis der Satz steht (deine Zeit, eine Zahl):** der Preis der Nähe. `_gezeitMarke` baut je Stufe jeden Meer-Chunk neu — das bindet Kosten an die Welt statt an Schirm + Änderung. Die Höhe hebt jetzt die Uniform; neu bauen muss nur noch, wessen benetzte Fläche sich ändert (Watt). Miss `markiert` je Ring-Takt an der Küste 0|10 830 über 25 h vorher ↔ nachher und die ms je Stufen-Wechsel; das wird ein eigener Kopf auf dem main NACH deiner Landung (nicht in Kopf 2 mischen).

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
