# Befund Heap: wer haelt, was mit dem Weg waechst (ZWISCHENSTAND)

Kopf: main 41ec3a96 (Spiel-Baum `.claude/worktrees/befund-heap`). Frage: der gehaltene Heap (nach zwei GC) stieg in der
Radeon-Sitzung 337846dc ueber vier Proben 385,3 -> 437,2 -> 490,8 -> 628,2 MB.

## Die Lesart der Akten (aus `vision/richter/*337846dc-radeon.json` und `messung/roh/337846dc-radeon/sitzung/strom.ndjson`)

Die vier Zahlen sind KEINE vier Posen: drei Preis-Laeufe standen an der Mess-Wiese (-280,4/-1045,6; vegetation.K2#1, vegetation.K5#2,
klang.K4#2), der vierte am Dorf (446,8/457,4; siedlung.K4#2). Dazwischen fuhren Proben, die die Welt aendern (klang.K4#2 geht 30 m,
siedlung.K4#2 setzt einen Ort mit Haus und Uhr). Die Messung unten faehrt darum NUR Posen, ohne Proben.

## Messung (14.11. 18:42-19:04, Radeon 890M, GPU-Schloss `befund-heap`, eine Welt `werkbank start --echt --ort wiese`)

Skript `artifacts/profiband/auge/w28-preis-ort/heap-weg.cjs`; je Pose: `/umstellen`, einschwingen, `/lauf` 30 s, `/puffer` (zwei GC),
`__heapHalter`, Behaelter-Zensus, Heap-Schnappschuss (CDP). Roh: `artifacts/profiband/auge/w28-preis-ort/heap-weg/pose-*.json`.

| Pose | Heap nach GC | VRAM nach GC | Typed (`__heapHalter`) | Baeume `state.architectures` | gesaete Chunks `voxelPopulatedChunks` | Szene obj | `renderer.info.geometries` |
|---|---|---|---|---|---|---|---|
| Wiese -280,4/-1045,6 | 384,4 | 132,5 | 128,8 | 2620 | 74 | 1241 | 275 |
| Wiese-Ost -101/-1070,5 | 430,8 | 133,5 | 137,1 | 3884 | 110 | 1735 | 339 |
| Dorf 446,8/457,4 | 467,7 | 126,4 | 139,9 | 5524 | 183 | 929 | 379 |
| West -713/617,5 | 495,5 | 124,4 | 137,4 | 7568 | 256 | 1169 | 452 |
| zurueck an der Wiese | **511,4** | 125,4 | 139,5 | 7568 | 256 | 1725 | 510 |

Antwort: der Heap faellt bei der Rueckkehr NICHT — er bleibt oben (+127 MB gegen die erste Pose an derselben Stelle) und waechst
sogar weiter (+15,9 MB von West zur Wiese). Der VRAM folgt dem Blick (132,5 -> 125,4). Die Typed-Arrays (+10,7 MB) erklaeren nur
ein Zwoelftel; der Rest ist JS-Heap ohne bisherigen Zensus.

(Tafel der Halter mit Datei:Zeile folgt.)
