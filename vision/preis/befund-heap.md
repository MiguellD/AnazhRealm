# Befund Heap: wer haelt, was mit dem Weg waechst (ZWISCHENSTAND)

Kopf: main 41ec3a96 (Spiel-Baum `.claude/worktrees/befund-heap`). Frage: der gehaltene Heap (nach zwei GC) stieg in der
Radeon-Sitzung 337846dc ueber vier Proben 385,3 -> 437,2 -> 490,8 -> 628,2 MB.

Lesart der Akten: die vier Zahlen sind keine vier Posen — drei Preis-Laeufe standen an der Mess-Wiese (vegetation.K2#1,
vegetation.K5#2, klang.K4#2), der vierte am Dorf nach siedlung.K4#2, das einen Ort samt Haus setzt. Die Messung unten faehrt NUR Posen.

## Die Messung (14.11. 18:42-19:04, Radeon 890M, GPU-Schloss `befund-heap`, EINE Welt `werkbank start --echt --ort wiese`)

Je Pose: `/umstellen`, einschwingen, `/lauf` 30 s, `/puffer` (zwei GC), `__heapHalter`, Behaelter-Zensus, Heap-Schnappschuss ueber CDP.
Werkzeug (kein Dauer-Werkzeug) und Roh-Daten: `artifacts/profiband/auge/w28-preis-ort/` — `heap-weg.cjs` (die Fahrt), `heap-snap.cjs`
(Strom-Leser des Schnappschusses: Dominator-Baum, Pfad-Zensus ab `window`, `RO=1` die starken Halter der Render-Objekte),
`heap-diff.cjs`, `heap-pfad-diff.cjs`; `heap-weg/pose-*.json`, `snap-*.json`, `tief-*.json`, `ro-*.json`, die Schnappschuesse selbst.

| Pose | Heap nach GC | VRAM nach GC | Typed (`__heapHalter`) | Schnappschuss | Baeume `state.architectures` | gesaete Chunks |
|---|---|---|---|---|---|---|
| Wiese -280,4/-1045,6 | 384,4 | 132,5 | 128,8 | 399,3 | 2620 | 74 |
| Wiese-Ost -101/-1070,5 | 430,8 | 133,5 | 137,1 | 445,5 | 3884 | 110 |
| Dorf 446,8/457,4 | 467,7 | 126,4 | 139,9 | 482,3 | 5524 | 183 |
| West -713/617,5 | 495,5 | 124,4 | 137,4 | 510,1 | 7568 | 256 |
| **zurueck an der Wiese** | **511,4** | 125,4 | 139,5 | 526,1 | 7568 | 256 |

**Die Antwort: der Heap faellt bei der Rueckkehr NICHT.** An derselben Pose +127,0 MB gegen den Anfang (7,4 MB je Minute Fahrt,
Preis 5), und er stieg von West zur Wiese noch +15,9 MB. Der VRAM folgt dem Blick (132,5 -> 125,4). Die Typed-Arrays des alten
Zensus erklaeren +10,7 MB; der Pfad-Zensus des Schnappschusses erklaert 121 von 127 MB beim Halter.

## Die Tafel der Halter (MB im Pfad-Zensus ab `window.anazhRealm`, je Pose; Datei:Zeile in main 41ec3a96)

| Halter | Wiese · Ost · Dorf · West · Wiese | Wachstum | Anlage | Raeumung | Rueckkehr kostet |
|---|---|---|---|---|---|
| **Render-Objekte am geteilten Stoff** (r184 `RenderObject`, gefunden ueber `state.scene` als WeakMap-Schluessel; stark gehalten vom `dispose`-Hoerer des Stoffs) | 71,8 · 85,5 · 102,8 · 119,4 · 132,0 | **+60,2** | `vendor/three.webgpu.min.js` RenderObject: `material.addEventListener("dispose", onMaterialDispose)`; das Register `stamm/stoff-instanz.js:2134-2170` | **raeumt nie** fuer jedes Objekt ausser Instanz-Senke und Leib: `onGeometryDispose` setzt nur `attributes = null` (vendor), `vertexBuffers` und der Hoerer bleiben; geloest nur `stamm/stoff-instanz.js:2051` (`_instanzAbschied`), `stamm/koerper-fahrt.js:759`, `stamm/speicher-laden.js:1322`. Taeter beim Namen: die Kamm-Krone `stamm/gelaende-fern.js:741-744` (jeder Sektor-Neubau, 8 je Anker, entsorgt die alte Geometrie, der Stoff `:845` bleibt) — 8 Render-Objekte 8,6 MB -> 40 Render-Objekte 54,1 MB (`ro-*.json`) | nichts: das neue Netz baut sein Render-Objekt, das Programm liegt im Cache (der Schluessel lebt im neuen Mesh weiter) |
| **Baeume als Welt-Eintraege** `state.architectures` samt `blockerAABBs`, `_blockerPlatz/-Zellen`, `_ortMerk` | 12,1 · 17,1 · 27,7 · 36,9 · 36,8 | **+24,7** | `stamm/siedlung-satz.js:1530` (push), Hueller `stamm/gelaende-kollision.js:243`; die Saat je Chunk EINMAL `stamm/vegetation-baum.js:2454-2457` (`voxelPopulatedChunks`) | **raeumt nie** nach Abstand: nur `removeArchitecture` `stamm/werkstatt-bauen.js:892` (Ernte, Bau, Ort); `voxelPopulatedChunks` faellt nie | die Saat des Chunks neu (`_tickSaat`, im Takt des Wald-Fadens; der Plan ist eine Funktion des Samens, `_ausGesetz` rechnet schon jeder Boot neu, `stamm/siedlung-satz.js:1481`); Taten am Baum traegt der Stand |
| Programm-Bau am Licht-Wurf `_lichtWurfK.roh` (Knoten-Daten je Programm) | 46,6 · 58,8 · 58,8 · 58,8 · 58,8 | +12,2 | `stamm/bild-schatten.js:438` | haengt am Knoten-Bau-Cache `renderer._nodes.nodeBuilderCache` (r184 `Nodes.delete` beim letzten Render-Objekt); ungeloeste Render-Objekte halten ihn (101 Render-Objekte ueber `nodeBuilderCache…updateNodes`, 0,7 -> 10,0 MB) | nichts, solange ein lebendes Objekt den Schluessel traegt |
| Programm-Bau an der Naesse `_naesseHimmelK` | 38,7 · 41,0 · 41,0 · 41,0 · 41,0 | +2,4 | `stamm/stoff-material.js:2217` | wie der Licht-Wurf | wie der Licht-Wurf |
| Hydro-Kacheln `state.hydroTiles` | 4,7 · 4,7 · 9,3 · 11,0 · 11,0 | +6,3 | `stamm/gelaende-boden.js:399`, im Voxel-Faden `voxel-worker.js:1480` | **raeumt nie** (beide Seiten) | eine Region im Voxel-Faden neu (`_hydroBestellen` `stamm/gelaende-boden.js:359`), nie am Haupt-Faden; das globale Wasser-Band `:416` liest dann nur die nahen |
| Foundry-Cache `_foundry.cache` | 7,6 · 10,4 · 11,1 · 12,2 · 11,7 | +4,1 | `stamm/studio-bruecke.js:36` | LRU `stamm/studio-gestalt.js:1003-1009`, Deckel 512 Eintraege / 512 MB `:1459/:1465`, Ruhe-Deckel 64 MB `:1467` (`:1013-1024`) — die Deckel liegen ueber dem ganzen Preis (400 MB) | die Gestalt aus dem Foundry-Faden (Platte: IndexedDB) |
| Kreaturen `state.creatures` | 1,9 · 2,3 · 1,0 · 1,9 · 7,1 | +5,3 | Spawn-Ring | folgt dem Spieler (0 -> 20 Tiere an der Wiese) | — (lebende Menge, kein Weg-Wachstum) |
| Bau-Verschmelzung `_archMergeCache` (WeakMap je Bauplan) | 12,0 · 12,0 · 12,0 · 14,5 · 14,5 | +2,5 | `stamm/siedlung-bauten.js:1130-1143` | **raeumt nie**: der Schluessel ist der Bauplan, `state.blueprints` waechst 199 -> 203 (gewachsene Varianten) und faellt nie | die Verschmelzung des Bauplans neu |
| Wald-Gedaechtnisse `_forestDartMemo`, `_freistandMemo`, `_ortSame`, `scatterLookup`, `scatterPromoted`, `_pegelOrte`, `lifeField`, `_lebenStand` | zusammen 1,1 -> 4,3 | +3,2 | `stamm/vegetation-wiese.js:2610`, `stamm/vegetation-baum.js:977`, `:943`, `stamm/vegetation-streu.js:111/:156`, `stamm/wasser-hydro.js:287-291`, `stamm/feld-leben.js:2076/:2399` | **raeumen nie** nach Abstand (nur `_ortSame` hat einen Deckel, 16384 Eintraege `:943`; die Memos fallen nur mit einem neuen Stand/Samen) | reine Funktionen von Zelle und Samen: neu gerechnet beim naechsten Leser |
| begrenzt (Ring): `voxelChunks`, `chunkSaetze`, `nahWiese`, `wegeKarte`, `playerMesh` | 15,9 -> 15,9 · 6,2 -> 6,2 · 6,5 -> 6,5 · 9,2 -> 9,6 · 9,3 | ±0 | `stamm/gelaende-chunks.js:1549` | `stamm/gelaende-chunks.js:2062` (Ring) | — |

Was der Pfad-Zensus ausserdem nennt (der „Heap ohne Zensus“ an der ersten Pose, 399 MB): `state.scene` 71,8 (die Render-Objekte des
Bilds), Licht-Wurf 46,6 + Naesse 38,7 (Knoten-Bau je Programm), PMREM 20,8, Voxel-Chunks 15,9, `state.architectures` 12,1,
`_archMergeCache` 12,0, Code 28 und Zeichenketten 16 + 32 (Skript-Quellen). Die 250 MB „ohne Zensus“ sind ueberwiegend
Render-Objekte und Knoten-Bau, nicht Spiel-Daten.

## Der Schnitt an der Wurzel: „der Speicher folgt dem Blick“

EIN Gesetz, zwei Naehte, beide schon im Stamm vorhanden:

1. **Das Render-Objekt stirbt mit seiner Geometrie** (60 + 15 MB der 127): im Register `stamm/stoff-instanz.js:2138` haengt der
   `dispose`-Hoerer der Geometrie die volle Loesung `AnazhRealm._renderObjekteLoesen` (`:2072`) bzw. `ro.dispose()` an — dieselbe
   Loesung, die heute nur die Instanz-Senke bekommt. Danach gibt es keinen Pfad mehr, auf dem eine entsorgte Geometrie ihr
   Render-Objekt, dessen `vertexBuffers` und den Knoten-Bau ihres Schluessels haelt. Kein Leser im Spiel aendert sich: wer zeichnet,
   bekommt sein Render-Objekt neu (r184 `RenderObjects.get`).
2. **Was ausser Blick UND ausser Reichweite ist, faellt; was wiederkehrt, waechst aus dem Samen** (25 + 6 + 3 MB): der Chunk, der
   den Ring verlaesst (`_disposeVoxelChunk` `stamm/gelaende-chunks.js:2014`), nimmt seine Saat mit — die Baeume `_ausGesetz` seines
   Gebiets (`removeArchitecture … still`), den Schluessel in `voxelPopulatedChunks`, seine Zellen in den Wald-Gedaechtnissen —, und
   die Hydro-Kachel ausser Reichweite faellt im Haupt- UND im Voxel-Faden. Taten des Spielers (gefaellt, gebaut) traegt der Stand,
   nie der Bestand.

Die Messung danach ist dieselbe Fahrt (`heap-weg.cjs`): Soll ist die Rueckkehr auf den Anfang (Wiese zurueck ≈ Wiese, ±Spawn-Menge).

## Ehrlich offen

- Der Programm-Bau (Licht-Wurf, Naesse: 85 MB an der ersten Pose) faellt nach dieser Lesart mit den Render-Objekten zurueck auf
  die lebenden Schluessel — bewiesen ist das erst durch die Messung nach Schnitt 1.
- `renderer.info.memory.geometries` stieg 275 -> 510 bei fallendem VRAM; die Zaehlung ist nicht gelesen.
- Die Akten-Fahrt 385 -> 628 enthaelt das, was die Proben selbst setzen (siedlung.K4#2: `state.scene` 41 MB Typed); getrennt
  gemessen ist nur der Weg.
