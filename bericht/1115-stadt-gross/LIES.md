# stadt-gross — die Größe der Netz-Stadt (OMEN, GTX 1060, 15.11.2026) — ZWISCHENSTAND zu w28-stadt-netz 76c41a69

1920 × 1080, 12 Uhr, der Spieler steht in der Mitte, 3 × 3 Kacheln wach; je ein Lauf (`p3/n1511/ferne/gross7`, `gross15`).

| | 5 × 5 (4 750) | 7 × 7 (9 310) | 15 × 15 (42 750) |
|---|---|---|---|
| Kacheln im Bild (an echten Losen / Stufe 1) | 25 (19 / 6) | 49 (19 / 30) | 225 (19 / 206) |
| Massen im Bild | 3 662 | 8 366 | 42 424 |
| Kapsel-Liste von 8 192 | 4 199 | 4 196 | 3 721 |
| Bild p50 / p95 / p99 | 16,7 / 25,0 / – ms | 16,6 / 25,0 / 33,4 ms | 16,7 / 33,3 / 75,1 ms |
| fps | 64,5 | 70,2 | 51 |
| CPU-Takt p50 / p95 | – | 9,9 / 15,3 ms | 15,2 / 26,8 ms |
| GPU p50 | – | 2,35 ms | 2,38 ms |
| Befehle / Dreiecke | 59 / 1,12 Mio. | 57 / 1,21 Mio. | 57 / 1,84 Mio. |
| VRAM / Heap nach GC | 161,5 / 877 MB | 159,3 / 881 MB | 167,0 / 910 MB |

- `gross7-ueber-ganz.png` — 7 × 7 von oben: nichts reißt.
- `gross15-ueber-ganz.png`, `gross15-boden-ost.png` — 15 × 15 (3,84 km Kante) von oben und vom Boden: die Stadt steht bis zum
  Horizont. Es reißt die CPU, nicht GPU, Liste oder Speicher: der Takt steigt um 5,3 ms im Median, das Bild liegt mit p95
  33,3 ms an der Schwelle, p99 75 ms. Von oben fehlen jenseits `strassenM` (1 200 m) die Straßen; der Rand ist das Quadrat.
- Offen: der Täter der 5,3 ms ist nicht benannt (die Phasen des Loops tragen davon 1,5 ms) — der nächste Lauf zerlegt den Takt.
