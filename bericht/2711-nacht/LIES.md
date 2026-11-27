# nacht-gasse-licht Kopf A — zwei Bildpaare vorher ↔ nachher (GTX 1050, Dorf, Mitternacht der Bühne, je Paar dieselbe Kamera)

Vorher = main 7d793605 · nachher = Vorprüf-Kopf A 66720504 (Fassung A: die Tür der TSL + die Lichtglocke; die Laterne beim Wert
des main, 25,7 cd). Beide aus dem Ausgabe-Pfad der Welt.

**Die Gasse im Ganzen** (`gasse-vor.png`, `gasse-nach.png`; Nacht-Linse dorf:third, die Pose des Spiels):
- vorher: die Fenster dunkel, der Laternenkopf aus — r184 zeichnete jede Scheibe still als leeren Ersatz-Stoff (12 TSL-Fehler je
  Welt); Gassen-Leser dev 5,74 EV, 161 460 Pixel bei null.
- nachher: die Fenster und der Laternenkopf glühen (0 TSL-Fehler), die Lichtglocke hebt den Himmel über null — dev 5,14 EV, 109 172
  Pixel bei null, p99 0,162 → 0,350 cd/m². Die Mitte (p50–p90 ≈ −4,7 EV) bleibt wie am main: die Laterne ist unverändert, sie
  folgt in Kopf B (2000 lm).

**Fenster mit Laternenkopf nah** (`nah-vor.png`, `nah-nach.png`; `werkbank bild` 1280 × 720, `--uhr 0`): die Laterne nächst dem
Spieler, das wache Fenster nächst ihr, das zu ihr schaut (5,33 m); die Kamera 4 m hinter der Laterne auf der Linie Fenster →
Laterne, 1,6 m zur Seite. Kamera −735,61 / +1,8 m über Grund / −952,41, Blick auf −733,85 / 44,55 / −959,03.
- vorher: jedes Fenster schwarz, der Laternenkopf ein bleicher Ersatz-Kasten.
- nachher: die Scheiben glühen warm, der Laternenkopf leuchtet; Wand, Gras und Boden im Licht wie vorher (die Laterne ist dieselbe).

Offen beim Namen: Soll dev ≤ 0,5 EV (Kopf B: Laterne 2000 lm, pruefbuehne-licht TON bei gehaltener Blende, dann p10/p25 der Gasse) ·
die Bewohner bleiben schwarze Schattenrisse · der Mensch an der Laterne brennt orange aus.

# Kopf B nacht-laterne-lm — ein Bildpaar vorher ↔ nachher (GTX 1050, stadt-voll third = die Pose der Sprosse nacht#2, Mitternacht der Bühne)

Vorher = main 52937c92 (die Laterne 25,7 cd) · nachher = Kopf B 83eca605 (2 000 lm → 159,2 cd). Beide aus der Nacht-Linse des Spiels
(`werkbank licht --nacht stadt-voll:third`), dieselbe Kamera.

**`laterne-stadt-vor.png` ↔ `laterne-stadt-nach.png`:**
- vorher: der Markt grau, die Fassaden dunkel bis auf die Fenster; Gassen-Leser dev 4,40 EV, 116 240 Pixel bei null, p50 0,018 cd/m².
- nachher: Pflaster, Stände und Fassaden im warmen Licht der Laternen; dev 1,73 EV, 42 381 Pixel bei null, p50 0,108, p90 0,586 cd/m².
  Die Blende der Nacht sinkt mit (k 39 930 → 10 190), das Mittelgrau steigt 0,073 → 0,284 cd/m².

Offen beim Namen: Soll dev ≤ 0,5 EV — p10/p25 sind der Himmel (29 % des Bilds bei 0,0004–0,002 cd/m², das Band p10 0,04); der Boden
allein liegt 0,5–1,6 EV unter dem Band · die Bewohner in der Ferne bleiben schwarze Schattenrisse (impostor#fimp:atlas, 810 Instanzen,
4 470 Null-Pixel) · die Scheiben sind flache helle Rechtecke, ihr Licht fällt nicht auf Wand und Gasse.

## Kopf C am Dorf (Vorprüf 85c3ee24 auf main 948f68ee, Zweig nacht-licht-klasse-2)

Vorher = main 948f68ee · nachher = Kopf C 85c3ee24. Nacht-Linse des Spiels (`werkbank licht --nacht dorf:third --bilder`), GTX 1050.

**`dorf-nacht-vorher-948f68ee.png` ↔ `dorf-nacht-nachher-85c3ee24.png`:**
- vorher: Bodenfleck 5/5 = 1 (ohne Karte 0,6), ein Fleck 4,16 ms, Takt höchstens 11,1 ms.
- nachher: Bodenfleck 3/3 = 1, der Lichtkreis reicht weiter (Fleck in lux, Wandlaterne 70 m) und deckt den Weg gleichmäßig;
  ein Fleck 2,86 ms, Takt höchstens 11,08 ms (ohne den Zellen-Rest des Unterschieds 21,89 / 32,4 ms — mitgeschnitten).
- Stadt-voll: Karte steht 70,9 → 57,1 s, Nacht-p95 66,74 ↔ 66,77 ms, Gasse dev 1,68 → 0,68 EV, Bodenfleck 0,919.

Offen beim Namen (das Auge vom 455 gilt weiter, dieser Kopf heilt es NICHT): das Gras im Lichtkreis brennt gelb-orange aus,
die Nacht bleibt einfarbig rotbraun, der Laternenkopf ist eine flache helle Fläche · Gasse dev 0,68 über Soll 0,5 ·
Wurf am freien Boden ungemessen (0 gesehene Punkte um laterne_dorf).
