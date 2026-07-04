The Write tool blocks report files in this harness, so I'm returning the full analysis as my final message.

---

# A1 — BÄUME + PLATZIERUNG + DER DRAW-CALL-KOLLAPS

Gerechnete Differenz Vorlage (`worlds/terrain/phytogenesis.js`) ↔ AnazhRealm (`anazhRealm.js`). Alle Zeilen verifiziert.

**Die drei Wurzeln vorweg (gerechnet):**
1. **DICHTE:** AnazhRealm streut **3.9× weniger Kandidaten-Darts/m²** → dichte Kerne sättigen nie → halb so dichter Wald.
2. **LOD-DISTANZ:** volles/mittleres 3D **bis 160 m** statt bis 40 m (Vorlage) = **16× Grundfläche** an Baumgeometrie.
3. **DRAW-CALL-ZERSPLITTERUNG:** `8 Varianten × 4 Leaf-Gruppen × Region-Split` → **~1000–2500 Baum-Draw-Calls** gegen **~60** der Vorlage.

---

## 1) WIE DIE VORLAGE ES MACHT (die Genialität)

### 1a) Platzierung — `plantForest(R, seedInt)` (Z.1381–1464)
- **Kandidaten-Flut + Poisson-Ausdünnung:** `darts = floor(R·R·1.20)` (Z.1388). Bei `R=64` → **4915 Darts** über `π·64²=12868 m²` = **0.382 Darts/m²** ≈ **55 Kandidaten/12-m-Zelle**.
- **Bimodale Annahme** (Z.1394): `if(rng() > 0.04 + 0.96·sstep(0.18,0.80,sd)) continue`. `standDensity` (Z.1372): zwei fBm-Oktaven (0.014+0.038), Kontrast `(d−0.5)·1.9+0.5`.
- **Variabel-radius Poisson / Kronen-Schüchternheit** (`ok()` Z.1385): Reject, wenn Nachbar im Radius `pack·(Ti+Tj)`, `PACK=1.16`, `CROWN={eiche:5.2,birke:3.2,weide:4.5,tanne:2.95,fichte:2.75,mammut:9.2}`.
- **Arten-Nische** (Z.1396–1417): 5 Gewichte aus Klima-fBm (0.012), Patch-fBm (0.05), Feuchte `0.5−e/14`, Trockenheit `(e+6)/18`, Offenheit `1−sd`.
- **reverse-J-Größe** (Z.1412): `s=0.55+1.45·ue^1.45`, 5 % Überhälter, clamp `[0.50,1.95]`.
- **VERJÜNGUNG** (Z.1437): 82 % der Altbäume streuen 5–11 Sämlinge. **SCHATTENVERDRÄNGUNG** (Z.1453): Große killen kleine Nachbarn. **canopyLight** (Z.1466): treibt den Unterwuchs.

### 1b) Templates + LOD (Z.1759–1864)
- **WENIGE Templates:** eiche×2, fichte×2, birke×2, tanne×2, weide×1, mammut×1 = **10 (Art,Var)** (Z.1765). `poolL[0]`=L0, `poolL[1]`=L1; **L2 gestrichen — Fernstufe IST das Billboard** (Z.1763).
- **LOD-Distanzen** (Z.2029): `LOD_D0=20, LOD_D1=40, FADE=8, FADE0=4`, `uLodRef=12`. → **L0<20 m, L1 20–40 m, Billboard >40 m**. SSE: `vLodD=camDist·min(uLodRef/(aH0·instScale),1)` (Z.121), Dither-Crossfade (Z.128).
- **8-VIEW-IMPOSTOR** — `bakeImpostorAtlas()` (Z.1607): RTT, **128×256, V=8 Blickwinkel**, Silhouette **dreht mit Kamera** (SpeedTree). **Plus Normal-Atlas** (`_impNrmRT`, Z.1616/1644) → **per-Fragment-Licht** aus `uSunDir`. **2px-Dilation** gegen Halo. Einmal je Seed-Signatur, saisoninvariant.

### 1c) Der Draw-Call-Kollaps (Z.1781–1864)
- **BÄUME = GLOBAL instanziert, KEIN Region-Split** (Z.1785–1790, 1842). Per (Art,Var): ~2 L0 + ~2 L1 + 1 Billboard (Z.1858) + 1 Schatten-Zwilling (Z.1846, Layer 2) ≈ 6 Meshes. **×10 ≈ ~60 Baum-Draw-Calls für den ganzen Wald.**
- **NUR der BODEN wird gekachelt** (`addTiled`, `TILE=12`, Z.1794): jede Kachel enge Welt-Kugel → **`frustumCulled=true`** (Z.1812, „DER HEBEL"). Die ~464 `DRAW-MESHES` sind zu ~85 % Boden-Kacheln, NICHT Bäume.
- **updateTreeLOD()** (Z.1902): setzt `im.count` pro Bucket + **Occlusion-Demotion** (3-m-Gitter `_occG`) + Nebel-Cull (`dr>fog.far`).

---

## 2) WIE ANAZHREALM ES MACHT

### 2a) Platzierung — `_forestCellDarts` (Z.61978) + `_forestPlantChunk` (Z.62064)
1:1-Portierung der Mathe (bimodal, Nische, reverse-J, Kronen-Schüchternheit als chunk-disjunkte prio-Ordnung Z.62101), MIT zwei Zusätzen:
- **`AnazhRealm.FOREST.dartsPerCell = 14`** (Z.79938), `cell:12`, `pack:1.16` (Z.79935).
- **SLOPE-Gate** (Z.62006): `if(rng() > 1 − ss(0.35,1.25,slope)) continue` — Vorlage kennt es nicht (glattes Heightfield).
- In `_populateVoxelChunkVegetation` (Z.63955), pro Voxel-Chunk (span 43.2 m). `spawned += _forestPlantChunk(cx,cz)` (Z.64001), NEBEN `_vegetationSampleSpawn` (Fels/Unterwuchs, Z.63993). Fern-Streu zusätzlich über die Scatter-„tree"-Schicht (Z.50231/78092).

### 2b) Varianten, LOD, Impostor
- **`VARIANTS_PER_SPECIES = 8`** (Z.77960). 6 Arten. `_buildVariantLODs` (Z.49526) baut **3 exakte LOD-Baupläne** `grown_<sp>_v<idx>[_lod1|_lod2]`.
- **LOD-Distanzen** (Z.78001): `thresh01=80, thresh12=160, hysteresis=10, lodRef=14, perfDistMulMax=1.5, fade=20, fade0=10`. `_lodPerceptionDistance` (Z.50680): `rawDist·min(lodRef/visH,1)·perfMul`, `perfMul∈[1,1.5]`.
- **LOD0 = 4 Leaf-Gruppen** (`_buildTreeSkeletonLeaves`, Z.59529): bark + card + **opaker Kern** (Z.59609) + **Schatten-Zwilling** (Z.59627). **LOD1 = 2**, **LOD2 = 1 Impostor** (Z.59541).
- **IMPOSTOR = fester 3-Quad-Kreuz** (`_buildImpostorCrossGeometry`, Z.59758): `NQ=3`, **18 Verts, NICHT camera-facing**. Textur = **EINE 128×128-Canvas-Silhouette** (Z.59686), **kein Multi-View, kein Normal-Atlas, keine Bake-Beleuchtung** — flacher Vertex-Base + `instanceColor`.
- **Instanzierung** `_archInstanceGroupFor` (Z.60191): **EIN InstancedMesh je (name, leafIdx, regionKey)**, `regional→frustumCulled=true` (Z.60210). **Region = 256 m** (Z.80876). Streu-Bäume: **NUR LOD0 region-gekeyt, LOD1/2 global** (Z.50346–50352).

---

## 3) DIE GERECHNETE DIFFERENZ

### 3a) Platzierungs-DICHTE (die „spärlich"-Wurzel)
| Größe | Vorlage | AnazhRealm | Differenz |
|---|---|---|---|
| Kandidaten-Darts/m² | `1.20/π=0.382` | `14/144=0.097` | **3.9× weniger** |
| Kandidaten/12-m-Zelle | ~55 | 14 | **3.9× weniger** |
| Effektiv nach bimodal (~0.5) im Kern | ~27 | ~7 | **3.9× weniger** |
| Max. gepackte Kleinbäume/Zelle `144/(π·(1.16·1.5)²)` | ~15 | ~15 | gleich |

**Rechnung:** Sättigung braucht ~15 akzeptierte Zentren/Zelle. Vorlage ~27 → **übersättigt → wahre Maximaldichte**. AnazhRealm ~7 → **untersättigt → Kern nur ~½ dicht**. Slope-Gate schneidet auf Hängen weiter. → **„Welt spärlich, trees:0 am Spawn"**. Der Code ist 1:1, aber der **Kandidaten-Vorrat ist zu klein für die Poisson-Sättigung**, die die Genialität ausmacht.

### 3b) LOD-Distanz / Dreieckslast
| Größe | Vorlage | AnazhRealm | Differenz |
|---|---|---|---|
| Voll-3D (L0) bis | 20 m | 80 m | 4× Radius = **16× Fläche** |
| Billboard ab | 40 m | 160 m | **16× Fläche** |
| Attrappen-Onset unter Last (fd 0.4) | — | `160/1.5≈107 m` | — |
| L0→L1 unter Last | — | `80/1.5≈53 m` | — |

AnazhRealm trägt echte/mittel-dezimierte Geometrie über **16× die Bodenfläche** → ~16× mehr voll-tesselierte Bäume im Bild.

**Hypothese „perfDistMulMax=1.5 → nahe Bäume (55 m) = Pappe": teils WIDERLEGT.** Bei 55 m, `fd=0.4`: `effDist=82.5 m > 80` → **LOD1**, aber LOD1 ist ein **dezimiertes 3D-Mesh (bark+card), kein Billboard**. Das Pappe-Billboard (LOD2) greift erst `>160/1.5≈107 m`. Der Pappe-Eindruck kommt von **(a)** crude Impostor-Qualität ab 107/160 m und **(b)** dem langen, wenig detaillierten LOD1-Band 53–107 m — nicht vom frühen Impostor bei 55 m.

### 3c) Impostor-Qualität (der „Atrappe"-Look)
| Größe | Vorlage | AnazhRealm |
|---|---|---|
| Views/Baum | **8** (dreht mit Kamera) | 1 (fester Kreuz) |
| Auflösung | 128×256 | 128×128 |
| Normal-Atlas/Bake-Licht | **ja** (`uSunDir`) | **nein** (flach) |
| Quelle | **RTT des echten 3D-Baums** | Canvas-Klecks |
| Dilation | ja (2px) | nein |

→ Vorlagen-Ferne = beleuchteter, gedrehter Baum; AnazhRealm = flache, gleich-beleuchtete Silhouette = die „Attrappe".

### 3d) Draw-Calls (der Kollaps)
**Vorlage-Bäume:** `10 (Art,Var) × ~6 ≈ **~60 Draw-Calls** für den GANZEN Wald`. Die ~464 `DRAW-MESHES` sind zu ~85 % **Boden-Kacheln**.

**AnazhRealm-Bäume:** Multiplikatoren — Varianten **8** (Vorlage 1.7) = **4.7×** · LOD0-Leaves **4** · **Region-Split LOD0** (256 m) × ~4–9 Regionen. → Nah-LOD0 allein: `6×8×4×(4..9) ≈ **768–1728**`; plus global LOD1 `96`, LOD2 `48`, plus Gras/Streu/Terrain/Wasser → **~3453 gemessen**. Gegen Vorlage ~60 = **~20–40× Zersplitterung**.

**Ursache:** genau die drei Dinge, die die Vorlage NICHT tut — `8 Varianten` (Vorlage 2) · `4 Leaf-Gruppen/LOD0` · `Region-Split der Bäume` (Vorlage: Bäume global, nur BODEN gekachelt).

---

## 4) WO ANAZHREALM DIE PIPELINE NICHT ABGREIFT

1. **Kandidaten-Vorrat zu dünn** (`dartsPerCell=14`, 3.9× unter Vorlage): Poisson-Sättigung greift nicht.
2. **Billboard-Gate 4× zu spät** (`80/160` vs `20/40`): 16× 3D-Fläche.
3. **Bäume region-gesplittet** — invertiert die Vorlagen-Weisheit „Bäume global, Boden kacheln". Der Frustum-Cull-Gewinn wird vom Draw-Call-Preis gefressen (V18.303 gesteht das für LOD1/2 schon ein; LOD0 zahlt weiter).
4. **8 Varianten statt 2** — die Vorlage trägt Form-Vielfalt über scale/yaw/tint auf der Instanz (2 Templates/Art), AnazhRealm backt 4× mehr Geometrie-Templates.
5. **Impostor-Qualität** — 1-View-Canvas ohne Normal-Atlas (S2 nur zur Hälfte abgegriffen).
6. **4 Leaf-Gruppen/LOD0** (`bark|card|core|twin`) — Vorlage hat 2 + Schatten-Zwilling; `core` (V18.349) ist ein Extra-Batch.

---

## 5) INTEGRATIONS-PLAN

**A–C sind reine Konstanten-Edits → voll parallelisierbar** (drei unabhängige Konstanten-Blöcke, kein Code-Konflikt). D ist Struktur (seriell NACH A–C). E ist eine eigene Welle (parallel baubar).

### A — DICHTE: `dartsPerCell` heben (1 Zeile)
- **Wo:** `AnazhRealm.FOREST.dartsPerCell` (Z.79938) `14 → 48`.
- **Risiko:** mittel — Nachbar-Loop O(dartsPerCell²·25), 48²/14² ≈ 12× teurer je Chunk-Plant (gedrosselt → tragbar). Poisson-Reject begrenzt die Baumzahl, Kosten steigen nicht proportional.
- **Diag:** akzeptierte Zentren/Zelle im dichten Kern (`sd>0.72`) ~7 → ~15; Playtest-Baum-Count/Chunk.

### B — LOD-DISTANZ: Billboard-Gate vorziehen (Konstante)
- **Wo:** `AnazhRealm.LOD_DISTANCES` (Z.78001): `thresh01 80→32`, `thresh12 160→64`, `fade 20→13`, `fade0 10→6`, `perfDistMulMax 1.5→1.3`.
- **Wirkung:** Voll-3D-Fläche 16×→~1× Vorlage = **größter Dreiecks-Hebel**.
- **Risiko:** Pop-in bei 32/64 m — Dither-Crossfade deckt es; MUSS nach E (Impostor-Qualität), sonst poppt sichtbare Pappe näher heran.
- **Diag:** `diag-render-load.cjs` `renderTris`/`hismByPrefix` vorher/nachher; `diag-tree-lod.cjs`.

### C — VARIANTEN senken: `VARIANTS_PER_SPECIES 8→3` (Konstante)
- **Wo:** Z.77960. Form-Vielfalt reitet über scale/rotationY/tint (Z.62130, 60354).
- **Wirkung:** Baum-Batches −62 %. ROCK/CRYSTAL/GLUT-Varianten (Z.77964) NICHT anfassen.
- **Risiko:** niedrig, reversibel — Schöpfer-Browser richtet, ob 3 reicht.
- **Diag:** `diag-draw-calls.cjs`; `hismByPrefix` `grown_`-Gruppen −62 %.

### D — DRAW-CALL-KOLLAPS: Bäume GLOBAL instanzieren (seriell NACH A–C)
- **Wo:** `_scatterRegionLayer` (Z.50352) für die tree-Schicht `lod===0 ? regX+","+regZ : null` → `null`. Chunk-Forest analog: Baum-Einträge global lassen statt `_archPlacedRegionKey` `p:regX,regZ` (Z.60326).
- **Wirkung:** Nah-LOD0-Baum-Draws `6×3×4×(4..9)` → `6×3×4 = 72` global.
- **Risiko:** mittel — `frustumCulled=false` nur tragbar, WENN A+B+C die Anzahl gesenkt haben (sonst V18.300-Regression „kann mich nicht drehen"). Reihenfolge zwingend nach A–C.
- **Diag:** `diag-draw-calls.cjs` Gesamt; `diag-turn-cull.cjs` (Cull-Rate darf nicht auf 0 fallen).

### E — IMPOSTOR-QUALITÄT: 8-View-RTT + Normal-Map (eigene Welle, parallel baubar)
- **Wo:** `_ensureImpostorAtlas`/`_bakeImpostorSilhouetteCanvas` (Z.59659/59686) → echter RTT-Bake des LOD-Meshes aus **8 Y-Peilungen** + Normal-Atlas (Vorlage `bakeImpostorAtlas` Z.1607); `_buildImpostorCrossGeometry` (Z.59758) → camera-facing Quad mit `aRot`/`vView`-Dekodierung (Vorlage-Shader Z.1820). WebGPU → Offscreen-`WebGPURenderer`-Bake ODER Canvas mit 8 Views + Fake-Normal.
- **Wirkung:** beseitigt „Attrappe", macht B look-sicher.
- **Risiko:** hoch — RTT-Timing/gate-Treue (headless graceful auf Canvas, Z.59662). Eigene Welle mit Schöpfer-A/B.
- **Diag:** `diag-look-shot.cjs`/`-village.cjs`; Draw-Calls unverändert.

### Parallelisierung
- **Parallel sofort:** A, B, C (drei Konstanten-Blöcke `FOREST`/`LOD_DISTANCES`/`VARIANTS_PER_SPECIES`, null Überlappung) + E (Struktur-Zweig). — je ein Agent, ein Commit, eine Diag.
- **Seriell danach:** D — sein `frustumCulled=false` gewinnt nur bei gesenkter Baumzahl. Nach D `diag-turn-cull` + Schöpfer-Browser.
- **Gate-Treue:** headless → `_foliageDensityScale=1`, Null-Renderer → Impostor-Canvas-Fallback; alle Konstanten browser-tunbar (kein Rebuild).