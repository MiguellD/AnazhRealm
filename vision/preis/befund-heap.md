# Befund Heap: wer haelt, was mit dem Weg waechst (ZWISCHENSTAND)

Kopf: main 41ec3a96 (Spiel-Baum `.claude/worktrees/befund-heap`). Frage: der gehaltene Heap (nach zwei GC) stieg in der
Radeon-Sitzung 337846dc ueber vier Proben 385,3 -> 437,2 -> 490,8 -> 628,2 MB.

## Die Lesart der Akten (aus `vision/richter/*337846dc-radeon.json` und `messung/roh/337846dc-radeon/sitzung/strom.ndjson`)

Die vier Zahlen sind KEINE vier Posen: drei Preis-Laeufe standen an der Mess-Wiese (-280,4/-1045,6; vegetation.K2#1, vegetation.K5#2,
klang.K4#2), der vierte am Dorf (446,8/457,4; siedlung.K4#2). Dazwischen fuhren Proben, die die Welt aendern (klang.K4#2 geht 30 m,
siedlung.K4#2 setzt einen Ort mit Haus und Uhr). Die Messung unten faehrt darum NUR Posen, ohne Proben.

## Messung (Skript `artifacts/profiband/auge/w28-preis-ort/heap-weg.cjs`, Radeon 890M unter dem GPU-Schloss)

Posen: Wiese (-280,4/-1045,6) -> Wiese-Ost (-101/-1070,5, aus gelaende.K2#1) -> Dorf (446,8/457,4) -> West (-713/617,5, aus
gelaende.K2#1) -> zurueck zur Wiese. Je Pose: einschwingen, `/lauf` 30 s, `/puffer` (zwei GC), `__heapHalter`, Behaelter-Zensus,
Heap-Schnappschuss (CDP).

(Ergebnis folgt.)
