# Bericht 2210 Sturm + 50 Tiere mit der Stamm-Bühne, GTX: Frame p95 33,4 in 2/2 Boots (Staffel 1 ROT) — das Vorher der Karte tier-satz

**Aufbau**
- Werkzeug: k1-buehnen 51c2f0be (n2210-kb). Der Zweig ändert keinen Spiel-Code (Spiel +0 Atome), die Welt ist main e3dd2b67.
- GTX 1060, `start --echt --ort wiese`, 1920×1080, Dorf-Zug aus, Wiese Ego. Je Boot: `umstellen --ort wiese --sicht ego`, einschwingen (`lauf 30 --ein 20 --ruhe 300 --regler voll --tiere frei`).
- Messung: `lauf 30 --ein 2 --regler voll --tiere 50 --wetter stormy --wandern bahn`.
  - Die Bühne stellt 50 Tiere frei im Ring 15–60 m und hält „stormy“ als Spieler-Wort.
  - Der Geher geht im Lauf 4 m/s, −z 60 m hin und zurück.
- In jedem Boot zerlegt `takt 20 --ein 2` mit derselben Bühne.

| Boot | fps | Frame p50 / **p95** / p99 | CPU-Takt p50 / **p95** | Belegung p95 | GPU p95 | Befehle haupt / k0 (p50) | Dreiecke haupt / k0 (p50) | Weg | Bühne |
|---|---|---|---|---|---|---|---|---|---|
| sturm-1 | 46,7 | 16,8 / **33,4** / 50,0 | 18,9 / **30,1** | 32,6 (ROT) | 2,51 | 66 / 48 | 497k / 206k | 120 m | stormy, 50/50 Tiere, Wache GRÜN |
| sturm-2 | 45,4 | 16,8 / **33,4** / 50,1 | 19,4 / **32,0** | 33,3 (ROT) | 2,48 | 61 / 50 | 491k / 214k | 120 m | stormy, 50/50 Tiere, Wache GRÜN |

- Vor der Bühne zählt die Wiese 9 und 10 Tiere, VRAM 114 MB. Die Render-Phase (`phasenEwmaMs.render`) liegt bei 11,3 / 11,9 ms, die Kreaturen-Phase bei 3,15 / 3,32 ms.
- Ohne Sturm (K1 Gehen Wiese Ego, gleicher Ort) waren es render 6,0, Kreaturen 0,36, haupt 21 / k0 25 Befehle, 247k / 69k Dreiecke, CPU-Takt p50 10,5.
- Die Zahlen decken sich mit der Seiten-Code-Bühne von K1 (sturmz-1/-2: F95 33,4 / 33,5, CPU p95 29,7 / 35,0).

## Zerlegung beim Namen (`takt 20`, Weg 83 m je Boot, Spitze · Mitte ms je Takt)

| Wurzel | sturm-1 | sturm-2 | Darunter |
|---|---|---|---|
| `renderer._renderScene` | 19,3 · **11,1** | 15,4 · **11,8** | `_renderObjects` 3,9 · 2,7 / 4,3 · 2,7, `_passSicht` 5,5 · 4,0 / 5,7 · 4,5; `renderObjectDirect › zeichne` 2,1 · 1,0 (Linse ROT), `zeichne › build`/`update` 1,0–1,3 |
| `_loopWeatherAndGrowth › updateCreatures` | 4,4 · **3,2** | 4,0 · **3,2** | `_animateCompoundMotion` 0,5–0,9, `_kreaturHuellenKontakt` 0,35 |
| `_loopVoxelStreaming` | 10,4 · 4,0 | 12,0 · 4,1 | `_applyCrossLodGeomorph` (Rest) 2,7 / 3,3, `_rebuildLodStitchBand` 1,3 / 1,6, `_finalizeVoxelChunkBuild` 1,4 / 1,5, `_ueberGrund › _voxelSurfaceY` 1,2 / 1,4 |
| `_loopAutoSave` | 3,0 · 0 | 4,7 · 0 | `saveState` 1,1 / 1,2, `saveToProjectFolder` 1,4 |

- **Lesart:** Der Sturm trägt das Mittel. CPU-Takt p50 ~21 ms gegen 10,5 ohne Sturm.
  - **Die 50 Tiere als Einzel-Draws:** +40…45 Befehle in haupt, +23…25 in k0, je Tier ein eigener Draw im Bild UND im Schatten. Die Render-Phase steigt um +5,3…5,9 ms, `_renderScene` liegt im Mittel bei 11,1–11,8.
  - **Ihre Seelen:** `updateCreatures` 3,2 ms im Mittel.
- Die Spitzen darüber sind die Chunk-Fertigstellung beim Gehen und der Autosave; die nehmen fahrt-takt und fahrt-takt-2.
- **Das Soll für tier-satz:** 50 Tiere als EIN Satz je Gattung. Die Befehle haupt/k0 fallen auf die Zahl der Gattungen (heute 3–4 im Bild), die Render-Phase zurück Richtung 6 ms.
  - Am Vorher zu messen: Frame p95 33,4, CPU-Takt p95 30,1 / 32,0, p50 18,9 / 19,4, Befehle 61–66 / 48–50.

Roh: OMEN `p3/n2210/sturm2/`, hier `bericht/2210-sturm-stammbuehne-gtx/` (ohne die takt-JSON).

**Status ZWISCHENSTAND + Übergabe:**
- Das Vorher für tier-satz an der GTX steht: Sturm + 50 Tiere reißt Staffel 1 in 2/2 Boots (F95 33,4).
- Die Täter beim Namen: die Tiere als Einzel-Draws in haupt + k0 und `updateCreatures`.
- Die Station ist bereit für die ABABs von fahrt-takt, tier-satz und stadt-takt.
