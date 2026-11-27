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
