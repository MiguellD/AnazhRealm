# Halter-Tafel Heap am Innen-Gang `karte2.mensch.bau.innen#1` (ZWISCHENSTAND, nur gemessen)

Kopf main c8c840c9 (V18.546.300, VOR w28-heap-dorf), GTX 1060, 16.11. 08:56–09:01, EINE Welt (`werkbank start --echt --ort wiese`),
Genesis-Ort, Ego, Fenster 800 × 600. Fahrt `p3/n1611/heap/heap-innen.cjs` (OMEN, kein Dauer-Werkzeug): zwei GC + Schnappschuss,
dann der Befehl der Station selbst (17 Häuser Tür → Keller → Dachboden, 163 s), zwei GC + Schnappschuss. Auswertung
`vision/preis/werkzeug/heap-snap.cjs` + `heap-pfad-diff.cjs`. Roh: OMEN `p3/n1611/heap/h3/` (probe-*.json, snap-*.json, tief-2.json).

| | Heap nach GC | Typed (`__heapHalter`) | VRAM |
|---|---|---|---|
| vor dem Gang | 238,2 MB | 107,6 MB | 79,5 MB |
| nach dem Gang | **644,1 MB** | 414,2 MB | 158,3 MB |

**Grenze der Messung, ehrlich:** vor dem Gang stand das Start-Dorf in dieser frischen Welt noch NICHT als Haus-Instanzen
(`archInstanceGroups` 2,7 MB) — der Gang weckt die Häuser erst. Die +405,9 MB sind also „Dorf wecken + durch 17 Häuser gehen“,
nicht nur die +140 MB der Sitzung (dort stand das Dorf schon, 405–411 → 548 MB). Welcher Anteil je Halter auf den Gang allein
fällt, trennt diese Fahrt nicht; die Halter und ihre Reihenfolge nennt sie.

## Die fünf Halter (Pfad-Zensus ab `window.anazhRealm`, MB vor → nach)

| # | Halter | vor → nach | Wachstum | Was drin liegt | Datei:Zeile (c8c840c9) |
|---|---|---|---|---|---|
| 1 | `state.scene` (Render-Objekte der gezeichneten Meshes) | 40,6 → 154,6 | **+114,0** | Attribut-Puffer je Render-Objekt: Float32 52,8 · Float16 27,9 · Int8 12,7 · Index `_anazhIx` 15,9 MB | Anlage im Vendor (r184 `RenderObject`), nicht im Stamm bestimmt |
| 2 | `state.archInstanceGroups` | 2,7 → 106,3 | **+103,5** | je Gruppe `geom`: position 25,6 · normal 25,2 · color 17,1 · uv 17,0 · aLodLevel 8,6 · Index 8,1 MB | `stamm/siedlung-instanz.js:559` |
| 3 | `_foundry.cache` | 8,2 → 78,1 | **+69,9** | die Lieferungen der Foundry als Mesh-Kinder mit Geometrie (72,8 MB an `children[].geometry`) | `stamm/studio-gestalt.js:1024` / `:1063` (LRU) |
| 4 | `AnazhRealm._tuchGitterMemo` | 1,3 → 15,7 (Puffer), 27,7 gehalten | **+14,4** (Puffer) | WeakMap je Leib: `teile` 17,7 MB · `stufen` 10,0 MB | `stamm/koerper-fahrt.js:347` / `:405` |
| 5 | `state.voxelChunks` + `state.voxelMeshCache` | 11,4 → 22,9 · 0 → 9,4 | **+20,9** | Chunk-Meshes und ihr Cache (Geometrie, `waterCells`) | `stamm/gelaende-chunks.js:951` |

Dahinter, je < 9 MB: `state.camera` +8,4 (Leib am Auge, `_gelenk.meshes`) · `state.architectures` +6,4 · `state.hydroTiles` +4,7 ·
`state.chunkSaetze` +4,7 · `_fahrLeibKoerper` +4,0 · `_leibKontaktKA` +2,6 · `_archMergeCache` 12,5 MB gehalten (position · normal · color je 4,2).

**Lesart:** 1–3 sind dreimal Haus-Geometrie auf der CPU — die Lieferung im Foundry-Cache, die verschmolzene Instanz-Geometrie und
die Attribut-Puffer an den Render-Objekten (zusammen +287 MB von +406). `_tuchGitterMemo` (der Halter, den w28-heap-dorf am
Dorfplatz schneidet) trägt hier 27,7 MB.
