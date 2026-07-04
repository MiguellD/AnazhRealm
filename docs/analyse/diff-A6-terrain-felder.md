Der Report-Write ist geblockt (Subagent-Regel) — ich liefere den vollständigen Bericht als Text zurück.

---

# A6 — TERRAIN + WASSER: Vorlage vs AnazhRealm (die Feld-Intelligenz)

**Kern-Befund vorweg:** V18.386–.389 („Das neue Kleid") hat die Vorlagen-Ökologie bereits zu ~80 % portiert — `_forestStandDensity`, die Arten-Nische (`wF/wT/wE/wB/wW`), `_understoryNiche`, `_canopyLightAt`, die reverse-J-Größe sind **byte-treue Übersetzungen** von `plantForest`. Die verbleibende Feld-Intelligenz-Lücke ist NICHT der Wald-Generator, sondern **drei kohärente Terrain-Felder, die die Vorlage baut und die Vegetation abgreift, AnazhRealm aber nicht (voll) hat: (1) das Feuchte-DACH (Vorlage-Ceiling 1.0 aus Niederung vs AnazhRealm 0.6-Cap), (2) die WILDPFADE (Vorlage: eigenes Feld, treibt 4 Konsumenten; AnazhRealm: nur Fluss-Bänke), (3) das Kronendach-Licht in der BODEN-ALBEDO (Vorlage: gratis Makro-Schatten; AnazhRealm: nur im Unterwuchs-Streu konsumiert, nicht in der Terrain-Farbe).**

## (1) WIE DIE VORLAGE ES MACHT — die Genialität

EINE kohärente Kausal-Kette: `_groundBase` → `waterDepress` → `forestGroundH` (die EINE Höhen-Wahrheit) → daraus `slopeAt`/`moisture`/`rockiness` + zwei Pfad-Systeme → daraus `plantForest`/`placeRocks`/`understoryNiche`. Jedes Vegetations-Feld liest `forestGroundH`, keiner rät.

- **Höhe+Wasser als Becken-Feld:** `_groundBase` (Z.1321) 3-oktaviges fbm (Amplituden 23/5.2/1.4 m), Pfad-Einsenkung schon hier (`pd<4.5 → h−(4.5−pd)·0.13`). `waterDepress` (Z.1362) senkt Boden zu Teichen/Bach (quadratischer Abfall `D·u²`, D=3.4/2.8 m), Bach streng monoton fallend (Z.1346–1350, 4 Pässe). `forestGroundH = _groundBase − waterDepress` (Z.1367). `SEA_LEVEL=−3.0`, `seaward=hypot(x,z)−74` (radiale Insel).
- **slopeAt** (Z.1374): `hypot((H(x+e)−H(x−e))/2e, ...)`, eps 1.6 m. Schwellen 0.10 (Findling) / 0.155 (Aufschluss) / 0.185 (Talus).
- **moisture** (Z.1541): `m=clamp(0.55−forestGroundH/14,0,1); return max(m, clamp(1−near/9,0,1))`. **Ceiling 1.0** (e=−7.7→1.0; Wasser-Nähe <9 m hebt bis 1.0).
- **standDensity** (Z.1372): `clamp((fbm·0.55+fbm·0.45−0.5)·1.9+0.5)`. Kontrast-Stretch ×1.9 → bimodaler Gradient.
- **canopyLight** (Z.1466): `cover=Σexp(−q)` über ±2 Zellen; `L=exp(−cover·0.85)`. Treibt `understoryNiche` UND — der Gratis-Trick — die Boden-Albedo (Z.1708 `c·(0.58+0.46·L)` → Makro-Schatten, kostet 0).
- **Zwei Pfad-Systeme:** `pathDist` (Z.1308, deterministische Sinus-Trails, in `_groundBase` als Mulde eingebacken) treibt Baum-Ausschluss (`<3.6`), Birken-Säumung (`<8 → wB·1.5`), Dirt-Boden (`<3.4`), Findlings-Ausschluss (`<2.2`). `wildPaths` (Z.1547, von Lichtung strahlend, weicht Steilem aus: `g.s>0.16 → ang += (atan2(−gz,−gx)−ang)·0.18`) treibt `trailDist` → Baum-Korridor-Freihaltung (`<3.2+T·0.12`) + `groundCover` bare-earth (`td<3.0 → bare:1`).
- **understoryNiche** (Z.1531): `gras=pow(L,1.5)·1.05`, `blume=Halbschatten-Saum`, `farn=Schatten`. **groundCover** (Z.1565): `meadow=clamp(L·1.08−rk·0.85+m·0.22)` — alle drei Terrain-Felder in EINER Formel.
- **Pipeline** (buildForest Z.1668): `plantForest → filter → canopyLight → 1.5-m-Feld-Cache (lgrid/tgrid/rgrid/mgrid, Z.1693) → Terrain-Mesh → Wasser → placeRocks → Gras/Blumen aus groundCover`. **Der 1.5-m-Cache ist genau AnazhRealms Gesetz #0: eine kanonische Feld-Rasterung, viele Leser.**

## (2) WIE ANAZHREALM ES MACHT

Streaming-Voxel, keine `buildForest`-Vollrechnung — Felder pro Chunk gelesen, Kausal-Kette in reine gehoistete Funktionen zerlegt.

- **Höhe+Wasser:** `_terrainColumnContext` (Z.25155) liefert `surf`, `roughScale`, `hydroCarve=_hydrosphereCarveAt`, `lake=_hydrosphereLakeAt` (Z.25210–25217 = **das waterDepress-Pendant**, senkt/flacht Boden zu Wasser). `_voxelSurfaceY` = die EINE Höhen-Quelle. `_waterLevelAt`/`_isAboveWaterAt` (CA-Flut + Atlas).
- **`_slopeAt`** (Z.24730): IDENTISCHE Formel, Sampler+eps als Parameter (Gesetz #0). Wald ruft `_slopeAt(x,z,getTerrainHeightAt,2)`. Schwellen `FOREST.slopeLo 0.35/slopeHi 1.25` (Voxel-|∇h|-Skala kalibriert).
- **`_feuchteAt`** (Z.25445): `fluss=smoothstep über [halfW,halfW+26]` (Ceiling 1.0) · `hoehe=smoothstep((7−above)/(7−1.5))·0.6` (**Ceiling 0.6!**) · `return max(fluss,hoehe)`. Konstanten `FEUCHTE` Z.79819.
- **Wald-Generator** `_forestCellDarts`/`_forestPlantChunk` (Z.61978/62064): zell-determ. Poisson-Disc (CELL=12), Kronen-Schüchternheit (±2 Zellen, prio-Tiebreak, pack 1.16), bimodaler Wurf (Z.61995 **byte-id.**), Arten-Nische (Z.62022–62026 **byte-id.**, Achsen aus `_feuchteAt`/`relH`), reverse-J (Z.62039 **byte-id.**), Mammut-Promotion. `FOREST.crown` = Vorlagen-CROWN 1:1.
- **Unterwuchs:** `_canopyLightAt` (Z.61846, Ersatz für `canopyLight(trees)` — liest DIESELBEN Pflanz-Treiber `clump·wetF·highF`, `L=exp(−cover·0.85)`, ohne Baum-Lookup), `_understoryNiche` (Z.61878 **byte-id.**). Konsum Z.33341/34059/34578 (Nah-Gras + Nah-Streu + Fernfeld).
- **`_placementDensityFactor`** (Z.61808, `PLACEMENT_DENSITY` Z.79854): `clump·slopeF·wetF·highF·perf`. Wird vom **ALTEN `_vegetationSampleSpawn`** gelesen (Z.62480/62503), NICHT vom aktiven `_forestPlantChunk`.
- **Boden-Farbe:** `_terrainGeologyAlbedo` mit `_damp` (aus `_feuchteAt`), `litTint` (standDensity `cMead.lerp(cLit)`, Z.29510), Slope→Fels. **Liest `_feuchteAt`+standDensity, aber NICHT `_canopyLightAt`.**

## (3) DIE GERECHNETE DIFFERENZ

| Feld | Vorlage | AnazhRealm | Differenz |
|---|---|---|---|
| standDensity | `(d−0.5)·1.9+0.5` | id. (Z.61947) | **0 byte-id.** ✅ |
| Arten-Nische wF..wW | Z.1399–1405 | Z.62022–62026 | **0 byte-id.** ✅ (Namen gemappt) |
| reverse-J | `0.55+1.45·ue^1.45` | id. (Z.62039) | **0** ✅ |
| bimodaler Wurf | `0.04+0.96·sstep(0.18,0.80,sd)` | id. (Z.61995) | **0** ✅ |
| slopeAt | zentr. Diff eps 1.6, Schwelle 0.155 | id. Formel eps 2, Schwelle 0.35/1.25 | Formel 0, Skala kalibriert ✅ |
| canopyLight-Kern/niche | `L=exp(−cover·0.85)`, `gras=L^1.5·1.05` | id. `canopyK 0.85` | **0** ✅ |
| **moisture-Ceiling Niederung** | `clamp(0.55−e/14)` → **1.0** | `hoehe·0.6` → **max 0.6** (Z.25462) | **−0.4 Ceiling.** Nicht-Fluss-Niederung ~40 % trockener; volle Feuchte NUR via Fluss. |
| **Erle/Weide-Verteilung** | wet aus Niederung → Erle in ALLEN nassen Senken | wet=`_feuchteAt` cap 0.6 → `feu²·6` nur an Flüssen | Erle klumpt bei AnazhRealm **an Flüsse** statt über Niederungen. |
| **Kronendach-Licht→Albedo** | `c·(0.58+0.46·L)` (Kern −42 %) | **fehlt** in Boden-Albedo | Kern↔Lichtung-Albedo-Kontrast: Vorlage 0.42, AnazhRealm **0**. |
| **Wildpfade** | `wildPaths`/`trailDist`, 4 Konsumenten | **fehlt** (nur `_pathFieldAt`=Fluss-Bank) | KEINE wandernden Pfade → kein Baum-Korridor, keine Birken-Säumung, keine nackte-Erde-Wiese. |
| **Pfad-Einsenkung Boden** | `pd<4.5 → h−(4.5−pd)·0.13` | **fehlt** | Boden hat keine Pfad-Mulden. |

**Fazit:** Der Wald-GENERATOR ist gerechnet ~identisch (harte Ökologie-Mathe portiert). Die Differenz sitzt in **drei fehlenden/geschwächten Terrain-FELDERN**.

## (4) WO ANAZHREALM NICHT SO SCHLAU IST

- **L1 — Feuchte-Dach bei 0.6 gekappt** (`hoeheGewicht`). Vorlagen-Niederung erreicht 1.0 (satte Wiese/Erle/dunkles Ufer auch fern vom Fluss); AnazhRealm nur bis 0.6 aus Höhe, volle Feuchte nur via Fluss-Distanz. Der EINZIGE gerechnete Unterschied INNERHALB einer schon portierten Formel — ein Konstanten-Fix.
- **L2 — Kein Wildpfad-Feld** (größte fehlende Feld-Intelligenz). Vorlage hat terrain-folgendes Trampelpfad-Netz das 4 Konsumenten treibt; AnazhRealm nur Fluss-Bänke (`_pathFieldAt` Z.25474). Keine Baum-Aussparung/Birken-Präferenz entlang Pfaden.
- **L3 — Kronendach-Licht fließt nicht in Terrain-Albedo.** `_canopyLightAt` existiert + wird vom Unterwuchs-Streu konsumiert, aber die Boden-FARBE liest es nicht → Waldboden fehlt der gratis Makro-Schatten (Kern-Kontrast = 0 vs Vorlage 0.42).
- **L4 — Zwei Platzierungs-Ökologie-Pfade** (milder Parallelpfad). `_placementDensityFactor` (alt, `_vegetationSampleSpawn`) und `_forestCellDarts` (aktiv, faithful) implementieren beide „dicht wo feucht+flach+niedrig". Kein Bug, zwei Quellen.
- **Schon schlau (nicht anfassen):** standDensity, Arten-Nische, reverse-J, Schüchternheit, understoryNiche, canopyLight-Kern, slopeAt, hydroCarve/lake. Der Voxel-Boden ist TIEFER (3D-Höhlen/Canyons) = echte Mehr-Intelligenz.

## (5) INTEGRATIONS-PLAN

**Welle A6-1 — Feuchte-Dach heben.** Wo: `_feuchteAt` Z.25462 + `FEUCHTE.hoeheGewicht` Z.79823. Was: `hoeheGewicht 0.6 → 0.85–1.0` prüfen (Vorlagen-Niederung 1.0). **Risiko:** `_feuchteAt` ist die EINE Feuchte-Quelle (hebt auch Boden-`_damp`-Farbe, Spawn-Affinität, Γ1-Erde) UND ist **worker-gespiegelt** (Z.25473 „P2P bit-identisch") → Änderung in BEIDE Mirrors + `diag-genese` grün. Nicht blind hochsetzen — erst `diag-genese`-Mittel messen; ggf. nur die Wald-Achse `feu` (Z.62015) lokal heben statt die globale Quelle. **Beweis:** `diag-genese` (Feuchte-Mittel, Erle-Anteil steigt in Nicht-Fluss-Senken, `cWet`-Boden wächst).

**Welle A6-2 — Kronendach-Licht in Terrain-Albedo.** Wo: `_terrainGeologyAlbedo` ~Z.29510. Was: nach dem Albedo-Mix `albedo *= (0.58 + 0.46·_canopyLightAt(x,z,surfY))` (Vorlagen-Formel Z.1708); `_canopyLightAt` ist rein/seed-determ. → passt in den Vertex-Farb-Bäcker. **Risiko:** niedrig; ZUERST prüfen ob der Terrain-Farb-Pfad im Worker läuft (`attachFieldColors`) → dann Mirror nötig, sonst main-only. **Beweis:** Vertex-Farb-Dump Kern < Lichtung (Faktor ≈0.58 vs 1.0), hardware-unabhängig; `diag-look`-Shot Waldkern.

**Welle A6-3 — Wildpfad-Feld** (größte neue Intelligenz, höchstes Risiko). Wo: neue `_wildTrailDistAt(x,z)` (main-only, seed-determ., Γ5), Konsum in `_forestCellDarts` (Baum-Ausschluss `<3.6`, Birke-Boost `<8`), Boden-Albedo (`<3.4 → Dirt/bare`), Gras-Unterdrückung. Was: **Empfehlung — erst das billige `pathDist` (Vorlage Z.1308, deterministische Sinus-Wellen) portieren** (kein Zentrum nötig, unendlich fortsetzbar, sofort 4 Konsumenten); `wildPaths` (Lichtungs-strahlend, region-determ. wie `_forestCellDarts`) als spätere Politur. **Risiko:** höher — ändert Baum-Verteilung → `diag-genese`/`diag-tree-spawn` müssen die neue Realität nachziehen (kein Pflaster, V18.259-Lehre); tag-neutral (reiner exclude-Skalar → `diag-arch-tags` unberührt); region-determ. → Peer-konsistent. **Beweis:** neuer `diag-wildpfad` (Pfad-Kontinuität über Chunk-Grenzen, Baum-Dichte am Pfad→0, Birken-Anteil am Saum, nackte-Erde-Farbe).

**Welle A6-4 (optional) — Ökologie-Pfade vereinen.** `_placementDensityFactor` vs `_forestCellDarts`. ZUERST messen ob `_vegetationSampleSpawn`-`isTree`-Zweig (Z.62466–62482) noch Bäume spawnt (Doppel-Spawn-Risiko via grep/`diag-tree-spawn`); wenn tot, den Zweig schneiden (`_placementDensityFactor` bleibt für `:meadow`-Büsche).

**Reihenfolge:** A6-1 ‖ A6-2 (unabhängig, zwei Agenten parallelisierbar) → A6-3 (seriell, berührt Wald-Generator + potenziell A6-1-Wald-Achse) → A6-4 (De-Entropie). **Zwei Vor-Bau-Checks:** (a) läuft Terrain-Farbe im Worker (A6-2 Mirror-Frage), (b) spawnt `_vegetationSampleSpawn` noch Bäume (A6-3/A6-4 Doppel-Spawn) — beide per grep/diag vor dem Bau.