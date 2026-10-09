# Bericht 0910-3 B: das Gelb aus host-vram-2 — die Wand der Ausgabe-Rundung und das echte Dunkel

Auftrag: `auftrag/0910-3-omen-render-fehler-und-vram-gelb.md`, Teil B.
Kopf: **welle-m-host-vram-2 1dee7452** (per `git ls-remote`), auf 33c47206. CI: Lauf 38002158211 auf 1dee7452, 5 von 5 grün.

## In drei Sätzen

**Geschnitten:** `gate:ziel-zensus` bewacht jetzt den Rundungs-Ausgleich (CI-Gruppe 2):
- in der Quelle: genau eine Abtastung des Szenen-Bilds, und zwar mit dem Ausgleich;
- im echten Frame: Die Sonde lief, der Faktor passt, die Post-Kette liest und verbraucht ihn;
- AUSGABE-FORMAT fällt als eingeschmuggelter Täter beim Namen.

**Gemessen:**
- main ist ROT mit 5 Befunden, der Kopf GRÜN.
- Bei echtem Dunkel (02:00, Mond, ohne Mittags-Bühne, Helligkeit 18–52) zeigt das Blau-Maß im Kopf ×1,3–×4,5 mehr Zwei-Stufen-Sprünge
  in glatten Flächen, mittags ×2,8–×9,2.
- Sichtbar ist das nur bei 8-facher Streckung.

**Ehrlich offen:**
- Das Blau stuft gröber, das Format trägt 5 Bit Mantisse. Der Ausgleich hebt nur das Mittel.
- Ein Dither, der die Stufen verdeckt, ist nicht gebaut.

## 1. Die Wand der Rundung (`scripts/diag-ziel-zensus.cjs`, `scripts/lib/ziel-zensus.cjs`; Commit 1dee7452)

- **(r) Quelle** (rein, Node, auch im Selbsttest):
  - In `_ensurePostProcessing` wird das Szenen-Bild genau EINMAL abgetastet, in `bild` mit `.mul(u.ausgabeAusgleich)`.
  - Das Uniform `ausgabeAusgleich` liest den Vektor der Sonde (`state._ausgabeAusgleich`).
  - `_ausgabeFormat` ruft `_ausgabeSonde`.
- **(r) Echter Frame** (swiftshader, Holz kienspan):
  - Die Sonde lief (`_ausgabeRundung`).
  - Ihr Faktor passt zur Rundung des Geräts: gegen null 1 + 2⁻⁷ · 1/(2 ln 2), Blau 1 + 2⁻⁶ · 1/(2 ln 2); zum nächsten 1.
  - Die Post-Kette liest DENSELBEN Vektor.
  - Sie verbraucht ihn: Der Ausgleich ×2 hebt das Mittel des Ausgabe-Bilds, zurückgestellt steht es wieder.
- **(e) AUSGABE-FORMAT im echten Frame:**
  - Ein eigenes rgba16float-Ziel weist sich für die Dauer des Schmuggels als Szenen-Ziel aus (`__zielAusgabe`).
  - Das Urteil liest jetzt das ausgewiesene Ziel (`geraet.ausgabeId`) statt eines Namens.
  - Das echte Ziel umzustellen war kein Weg. Ein Format-Wechsel des echten `output` zur Laufzeit bricht die Region-Bündel (26
    Validierungsfehler „Attachment state of renderBundles … is not compatible“). Im Spiel geschieht er nie.

| | main 76c9624d (die neue Wand als Kopie) | Kopf 1dee7452 |
|---|---|---|
| Urteil | **ROT, 5 Verletzungen** | **GRÜN** |
| Täter | `AUSGABE-FORMAT: output (rgba16float 320×240, 0.59 MB)` · `RUNDUNG (Quelle)` 4× (kein `bild` mit Ausgleich; das Szenen-Bild 4× abgetastet; kein Uniform der Sonde; keine Sonde) | — |
| Schmuggel | — | 6 von 6 Tätern beim Namen, darunter `AUSGABE-FORMAT: zensus-selbsttest:ausgabe` |
| Rundung | — | rg11b10ufloat, swiftshader rundet **gegen null**, Ausgleich 1,00563 / 1,00563 / 1,01127, derselbe Vektor, ×2 hebt das Mittel um **48,05** Stufen, zurückgestellt 0 |

**Selbsttest** (`--selftest`, in `npm run check`), +11 Fälle:
- Sonde lief nicht, Ausgleich verloren, Ausgleich auf einem zum nächsten rundenden Gerät, anderer Vektor, nicht verbraucht, Probe blind.
- Am ECHTEN Stamm mutiert, je rot beim Namen: Ausgleich entfernt, zweite Abtastung am Ausgleich vorbei, Sonde nicht gerufen.
- Dazu der Lib-Fall „ausgewiesenes Szenen-Ziel in 64 bit“.

Rohdateien: `bericht/0910-3-b/gate-ziel-zensus-{vorher-main,kopf,selbsttest}.txt`.

## 2. Das echte Dunkel

**Warum die Nacht bisher keine war:** Meine Nacht- und Abend-Blicke (0910-1 B) setzten die Uhr erst NACH der Mittags-Bühne. Das ergab
Helligkeit 72–81, und die Kamera stand im Körper des Spielers (ein schwarzes Band in der ersten Probe dieser Runde).

**Jetzt** (`nacht.sh`, `nacht-stellen.js`, `nacht-bild.js`):
- Ohne Bühne: Uhr 02:00 gehalten, 120 echte Spiel-Takte. Damit ziehen Himmel, Sterne, Licht und Belichtung nach.
- Die Belichtung kommt aus dem Licht (`_dayNightApplyBelichtung`) und steht am Nacht-Deckel 1,0; das Mondlicht hat 0,22.
- Dann Wind-, Knoten- und Himmels-Uhr fest, TRAA-Phase 0, Tiere und Spieler aus.
- Der Feld-Pass und die Schatten ziehen für die Kamera nach, zwei Aufnahmen aus dem Ausgabe-Pfad, wie `werkbank bild`.

Je Seite zwei Boots (Folge A B A B; A = main 76c9624d, B = Kopf 1dee7452), 0 GPU-Fehler.

**Helligkeit** (Mittel, 0–255), A gleich B auf ±0,3:

| Blick | Mittag | 02:00 |
|---|---|---|
| Himmel (nach oben) | 117 | **52** |
| nord (Wiese) | 132 | **18** |
| Wald | 121 | **29** |
| tiefer Wald (−945/−895) | 142 | **44** |
| Ufer | — | **43** |

**Das Blau-Maß** (`blau.cjs`):
- „Glatt“ heißt: R und G liegen zu allen vier Nachbarn innerhalb ±1 Stufe.
- Gezählt werden darin die Blau-Sprünge zum rechten Nachbarn um ≥ 2 Stufen, in ‰ der glatten Pixel (je 0,5–1,6 M glatte Pixel).

| Blick | main A1 · A2 | Kopf B1 · B2 | Rauschen A · B | Kopf / main |
|---|---|---|---|---|
| n-himmel (02:00) | 8,764 · 8,888 | 18,731 · 19,312 | 0,124 · 0,580 | **×2,16** |
| n-nord (02:00) | 4,139 · 4,141 | 5,200 · 6,091 | 0,002 · 0,891 | **×1,36** |
| n-wald (02:00) | 6,594 · 6,575 | 8,092 · 8,994 | 0,019 · 0,903 | **×1,30** |
| n-wald-tief (02:00) | 1,076 · 1,080 | 4,754 · 4,869 | 0,004 · 0,116 | **×4,47** |
| n-ufer (02:00) | 2,667 · 2,666 | 6,415 · 6,581 | 0,002 · 0,166 | **×2,44** |
| himmel (Mittag) | 1,041 · 1,013 | 4,973 · 6,250 | 0,028 · 1,278 | **×5,46** |
| nord (Mittag) | 2,479 · 2,328 | 7,171 · 7,113 | 0,151 · 0,058 | **×2,97** |
| wald (Mittag) | 1,907 · 1,867 | 5,273 · 5,286 | 0,040 · 0,014 | **×2,80** |
| wald-tief (Mittag) | 0,460 · 0,460 | 4,195 · 4,276 | 0,000 · 0,081 | **×9,20** |

- Der Prüfer sah mittags ×1,4–×3,4. Mit diesem Maß liegt der Mittag bei ×2,8–×9,2 und die Nacht bei ×1,3–×4,5.
- Absolut sind es höchstens 19 ‰ der glatten Pixel (Nachthimmel).
- Die B-Boots streuen untereinander stärker (bis 1,3 ‰) als die A-Boots (bis 0,15 ‰), bei gleicher Helligkeit. Das gröbere Raster lässt
  kleine Unterschiede zwischen zwei Boots häufiger über eine Stufe kippen.

**Das Auge** (`n-himmel-na1/nb1.png`, `himmel-na1/nb1.png`: Ausschnitte, Blau-Kanal (B − min) × 8):
- Im Kopf stuft der Blau-Kanal in breiteren Bändern mit doppelt so hohen Stufen ab, am Nachthimmel wie am Mittagshimmel.
  main stuft in Einer-Schritten.
- In der Normalansicht sehe ich in keinem der neun Blicke Höhenlinien.
- Gesehen habe ich: n-himmel, n-wald, himmel; die halben Bilder liegen in `bericht/0910-3-b/*-{main,kopf}.jpg`.

**Urteil:**
- Das Ausgabe-Ziel in 11/11/10 stuft den Blau-Kanal messbar gröber (×1,3–×9,2 mehr Zwei-Stufen-Sprünge in glatten Flächen),
  sichtbar erst bei 8-facher Streckung.
- Bei echtem Dunkel ist der Faktor nicht größer als am Mittag. Das Mittel ist ausgeglichen (Helligkeit A = B).

## Wände

| Wand | Urteil |
|---|---|
| check | `GRÜN arch-fachwerk-fit` (darin `diag-ziel-zensus --selftest`) |
| lint | 0 Fehler |
| gate:ziel-zensus (echter Frame, swiftshader) | GRÜN, 6 von 6 Tätern beim Namen, die Rundung wirkt (×2 → +48 Stufen) |
| CI | Lauf 38002158211 auf 1dee7452: 5 von 5 grün (check · erst-zeichnung · playtest 1/3 · 2/3 · 3/3; gate:ziel-zensus in Gruppe 2) |

## Offen (mit Grund)

- **Die Blau-Stufen** (×1,3–×9,2, sichtbar bei 8-facher Streckung): Ein Dither vor dem Schreiben könnte sie verdecken. Er müsste aber
  in jedem Material-Ausgang sitzen (das Szenen-Bild schreibt jeder Stoff selbst), und das ist nicht gebaut. Der Ausgleich der
  Sonde hebt nur das Mittel.
- **Das Format des echten Ziels zur Laufzeit** wechselt im Spiel nie. Täte es das, brächen die Region-Bündel (26
  Validierungsfehler). Das ist dieselbe Klasse wie die Kaskaden-Karte zur Laufzeit (0910-1 B), und die Wand prüft es nicht.
