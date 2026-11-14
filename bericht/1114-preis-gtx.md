# Der Preis des Orts auf der GTX 1060 — die Sprossen der Richter-Tafel an main 68d24688 (14.11., ZWISCHENSTAND)

Auftrag des Koordinators 14.11. 21:55 (a). Zwei Mess-Sitzungen (`punkte.cjs run --sha 68d24688 --geraet gtx --nur …`, Referenzfahrt
vor und nach jedem Preis-Lauf, Posten nach GC): Sitzung 1 22:04–22:35 (fünf Stationen; ihre Akten liegen in `vision/richter/`,
gepusht mit der Messung, koordination f4b743c6), Sitzung 2 22:38–22:48 (die vier messbaren Stationen noch einmal, weil der Strom
der ersten 13 s nach ihrem Ende von der Sitzung der Landung überschrieben war — FUND-REGISTER). Roh auf der OMEN:
`p3/n1411/preis/` (`lauf1/`, `lauf2/` mit `strom.ndjson` 870 KB und `lese.txt`, Werkzeug `strom-lese.cjs`).
Preis-Treppe der Karte: Bild p95 33 ms · größtes Bild 100 ms · Heap 400 MB · VRAM 118 MB.

## Die Tafel je Sprosse

„stehend" = die 20 gemessenen Sekunden des Preis-Laufs nach seinen 30 s Einlauf (`/lauf sek 20, ein 30`); „Einlauf" = die 30 s
davor und jeder Lauf der Probe selbst. Der Strom trägt je Station nur diese Läufe (die Probe hält den Loop sonst an).

| Sprosse (Station) | Richter | p95 alle / stehend | größtes Bild stehend / Einlauf | Heap nach GC (Spitze ohne GC) | VRAM nach GC (Spitze) | f |
|---|---|---|---|---|---|---|
| leben.pflanzen.jahreslauf 1 (vegetation.K5#2) | GRÜN | 33,36 / 25,4 ms | 33,7 / 208,3 ms | 420,3 (883,7) MB | 133,2 (162,7) MB | 1,152 |
| leben.pflanzen.kraft 1 (vegetation.K2#1) | GRÜN | 25,48 / 25,4 | 50,0 / 58,5 | 412,3 (457,5) | 133,2 (133,8) | 1,031 |
| erleben.klang.ereignis 1 und 2 (klang.K4#2) | GRÜN | 33,65 / 33,6 | 58,3 / 433,2 | 461,1 (786,4) | 134,5 (143,5) | 1,154 |
| mensch.zeit.palimpsest 1 (siedlung.K4#2, Ort dorf) | GRÜN | 24,97 / 25,0 | **1166,7** / 83,4 | 622,0 (687,3) | 113,0 (116,0) | 1,214 |
| mensch.nahrung.erdbau 1 (gelaende.K2#1) | UNGEMESSEN | — | — | — | — | — |

Sitzung 1 (die gepushten Akten, ohne Strom): jahreslauf p95 33,36 · max 191,67 · nach GC 416,8 / 133,3 · f 1,02 | kraft 25,36 ·
50,09 · 408,5 / 133,4 · f 1,196 | klang 33,59 · 616,65 · 451,5 / 133,9 · f 1,06 | palimpsest 24,96 · 1174,94 · 611,9 / 113,0 ·
f 1,336. Preis an jeder Akte ROT in beiden Sitzungen: Heap nach GC über 400 an jeder Station (408–622), VRAM nach GC über 118 an
jeder außer dem Dorf (133–134,5; Dorf 113).

## Die Bilder über 100 ms (Sitzung 2, vier in 9 796 Bildern) mit ihrer Ursache, soweit der Strom sie trägt

- **1166,7 ms, STEHEND, Ort dorf** (39,4 s im Preis-Lauf, im gemessenen Fenster): außer dem Takt (CPU im Loop-Aufruf 36,0 ms von
  1166,7), Heap gleich (kein GC), Dreiecke 586 474 → 568 816, der Block des Stroms nennt offen: `dorfWaechst`. Sitzung 1: 1174,94 ms
  an derselben Station — zweimal derselbe Brocken. Der Haupt-Faden steht 1,1 s außerhalb des Loop-Aufrufs, während das Dorf baut.
- **433,2 ms, EINLAUF, klang** — das erste Bild nach dem Start des Loops (0,4 s nach dem ersten Bild der Probe), außer dem Takt
  (CPU 11,7 ms), danach 75,1 · 41,6 · 33,7 ms. Sitzung 1: 616,65 ms.
- **124,8 und 208,3 ms, EINLAUF, jahreslauf** — 6,8 und 7,0 s nach dem Start des Preis-Laufs, hintereinander: das erste IM Takt
  (CPU 155,3 ms; das Bild davor 128,8 ms CPU bei 25,1 ms Abstand), Dreiecke 401 497 → 370 977 → 398 842, das zweite außer dem Takt
  (CPU 31,1 ms); danach drei Bilder zu 58 ms. Die Probe wechselte davor dreimal die Jahreszeit (Heap-Spitze 883,7 MB ohne GC).
- kraft: kein Bild über 100 ms (max 58,5).

In der stehenden Welt an der Wiese (drei Stationen, 2 356 Bilder): 0 Bilder über 100 ms, größtes 58,3 ms.

## Was daneben auffiel

- **Das p95 liegt auf einem Raster.** Die Bild-Abstände fallen auf Vielfache von 8,33 ms (8,4 · 16,7 · 25,0 · 33,3 · 41,6 · 50,1 ·
  58,4) — das p95 ist 25,0 oder 33,3 ms, nie dazwischen; die Schwelle 33 liegt 0,3 ms unter einer Raster-Stufe. Stehend an der
  Wiese liegen 3,5 % der Bilder über 33 ms (jahreslauf 29 von 835, kraft 30 von 833) → p95 25,4; an der Pose des Klangs 46 %
  (316 von 688) → p95 33,6.
- **f über dem Band am Dorf** (1,214 und 1,336 > 1,20): Bild p95 und größtes Bild der Palimpsest-Akte sind nach der Regel
  „UNGEMESSEN unter Last", Heap und VRAM urteilen. Die Last ist die Welt selbst (das Dorf baut weiter), kein fremder Prozess am
  Schloss.
- **gelaende.K2#1 hängt** (Sitzung 1: Deckel 1256 s gerissen, das Werkzeug zählt den 13. Fall): „Ferne {fehler: Cannot read
  properties of undefined (reading 'length')}", danach „third FEHLER Runtime.callFunctionOn timed out". Keine Akte für
  mensch.nahrung.erdbau auf der GTX; die Station kostete die Sitzung 21 von 30 Minuten.
- **Größte VRAM-Posten nach GC** (klang, 133,9 MB): TRAANode.resolve rgba16float 1920×1080 31,6 · buf:? 11,6 · Kaskade 1 und 2
  je 8,0 · karte-albedo 5,8 · output 4,5 · depth 4,5 · Geometrie-Arena 4,0 · wege-karte 4,0 · TRAA flacker 4,0 MB. Heap-Halter
  (Typed Arrays, 142,5 MB): renderer 39,3 · foundry.cache 23,3 · voxelChunks 17,6 · wegeKarte 9,0 · archInstanceGroups 8,7.

Geschnitten: nichts (Messung). Gemessen: fünf Akten an 68d24688, zwei Sitzungen, die Tafel oben. Offen: erdbau 1 ungemessen;
die Akten in koordination sind die der Sitzung 1, die Teilung stehend / Einlauf stammt aus Sitzung 2.
Status: ZWISCHENSTAND
