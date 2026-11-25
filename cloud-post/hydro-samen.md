# Vorprüfung hydro-samen — die Hydrosphäre ist eine Funktion JEDES Samens

ZWISCHENSTAND · Karte 2 gebucht 118 von 1 718 (Stand-Datei `vision/karte-2-stand.json` im Zweig `punkte-maschine`).
Beansprucht: `karte2.same.kopplung.kohaerenz#1` — Leiter „Die gewachsene Kohärenz“ (`same.kopplung.kohaerenz`), Sprosse 1
„2 Glieder, ein Ort · Wasser folgt dem Relief“, Richter „100 Saaten × 50 Punkte: Wasserläufe bergab in Senke oder Meer ≥ 95 %“.
Buchen kann sie nur die Station.

## 1 · Die Täter-Zahl (vorher, main 2da17e2e, BEVOR geschnitten wird)

| Maß | Wert | Ort |
| --- | --- | --- |
| Station kohaerenz#1 im Spiel (Radeon, 25.11., Akte `same.kopplung.kohaerenz.1.2da17e2e-radeon.json`) | **1 von 101 Saaten** gemessen, 100 „ohne Fähigkeit“; an der Welt-Saat 50 von 50 Punkten | `WASSER_AN` der Station: `a.saat !== st.worldMeta.seed → fehlt` |
| Das Gesetz des Kerns in node (`gelaende-core` `hydrosphaere`, Heim-Region, über dem echten Wirt der Klasse im vm, Boden `_voxelSurfaceY`), dasselbe Maß wörtlich (50 Paare je Saat, tol 0,05 m, Lauf endet in Senke oder Meer) | **101 von 101 Saaten** ≥ 95 %; 5 045 von 5 050 Paaren = **99,9 %**; schlechteste 49 von 50 (same-saat-38, -51, -61, -70, -96); kein Wurf, keine Saat ohne Fluss | Skript dieser Abgabe, 23,6 s für 101 Saaten (234 ms je Saat) |
| Gegenprobe an der Welt-Saat `anazh-realm-seed`: node ↔ Station | 21 Flüsse · 21 Enden · 50 von 50 ↔ 21 · 21 · 50 von 50 | dieselben Zahlen |

**Wo die Kette fällt:** nicht im Gesetz — das lebt an jeder Saat. Gebunden an die Standard-Welt ist der **Zustand des
Fadens** (`state` in voxel-worker.js, seine Saat kommt allein aus dem Stand der Welt, `applyStateSnapshot` :1894):
- `hydroRegion(key, origin)` voxel-worker.js:2051–2057 ruft `G.hydrosphaere(state, state.hydroGesetz, voxelGitterY, origin)` —
  die Lage ist `state`, kein Argument;
- ihr Boden `voxelGitterY` → `voxelSurfaceY` :1679 → `terrainColumnContext` :1997 (`G.dichteSpalte(state, …)`) und
  `terrainDensityAtCol` :2004 lesen `state` — der Boden ist der der Welt-Saat;
- der Planet-Faden (`_planetAuftrag`, stamm/gelaende-chunks.js:644 — „eine reine Funktion seines Samens“, ohne Stand) kennt nur
  `planet-anker` und `planet-ort` (voxel-worker.js:374–385): er antwortet für jeden Samen, aber ohne Flusslauf;
- der Leser der Welt `_hydroFor` (stamm/gelaende-boden.js:675) liest `hydroRegion(this._gelaende(), x, z)` — nur die Lage der
  Welt-Saat.
Kein Default-Seed, keine Konstante, kein Cache: die Bindung ist die Lage als Modul-Zustand statt als Argument.

## 2 · Der Schnitt (Plan in einer Zeile)

Chokepoint: die Region der Hydrosphäre und ihr Boden im Faden werden Funktion ihrer LAGE (`hydroRegion(L, …)`, `flaecheY(L, …)`)
— die Welt reicht `state`, der Planet-Faden die Lage aus dem Abbild des Samens (`G.lageAus`); was stirbt: die Bindung des Bodens
und der Region an den Modul-Zustand.

## Äußere Quelle (Band)

Wang et al. 2018, Nature Geoscience 11, 926 („Recent global decline in endorheic basin water storage“): die Binnen-Senken
entwässern rund ein Fünftel des Lands (≈ 20 %), das Meer den Rest (≈ 80–83 %, Wikipedia „List of drainage basins by area“: 17 %
endorheisch). Band: JEDER Lauf endet in Meer oder Senke (100 %); auf der Erde ≈ 4 von 5 im Meer.

Kopf: (folgt)
