# A2 — WIESE + BLUMEN + UNTERWUCHS: Vorlage vs AnazhRealm (gerechnete Differenz)

System A2: Gras / Blumen / Kies / Farn / Strauch (Bodendecker). Vorlage
`worlds/terrain/phytogenesis.js`, AnazhRealm `anazhRealm.js`.

Kern-Befund vorab (die Zahl, die zaehlt): **Die Vorlage streut ~1.93 Gras-Bueschel/m2
mit 7-21 gebogenen Euler-Halmen (14/Bueschel Mittel) = ~27 Halme/m2; AnazhRealm liefert
durch den `GRASS_MAX_BLADES=1400`-Chunk-Cap effektiv ~0.75 Tuffs/m2 x 6 gerade SEG-2-
Halme = ~4.5 Halme/m2. Das ist ein 6x-Halm-Defizit, plus die AnazhRealm-Halme sind
STEIF (SEG 2, kaum Bogen) statt gebogen-arched, TALLER+SPARSER (0.5-1.95 m vs 0.1-0.4 m)
und tragen KEINE Aehren/Rispen (seed heads). Das ist die messbare Wurzel des "sieht alt
aus"-Befunds. Blumen dagegen sind bei AnazhRealm eher REICHER (3 Arten, ~0.1/m2 im Saum
vs 2 generische Varianten, ~0.03-0.05/m2).**

---

## (1) WIE DIE VORLAGE ES MACHT (die Genialitaet)

### Pipeline-Kette (Erstellung, in `plantForest`/`buildForest`, Z.1670-1899)
1. **Vier vorgebackene Feld-Grids** (Z.1697): `lightAt`/`trailAt`/`rockAt`/`moistAt` = bilineare
   Sampler auf vorberechneten Grids. Das **Kronendach-Licht** `lightAt` kommt aus
   `canopyLight(trees)` (Z.1466-1474) — pro Punkt Summe `exp(-q)` ueber alle Kronen in +-2
   Nachbarzellen (`cr = t.T*1.15`, `q = dist^2/cr^2`, cover), Rueckgabe `exp(-cover*0.85)`
   (**1 = volle Lichtung, ->0 dichtes Dach**). Das ist die EINE Bodenlicht-Wahrheit fuer alles.
2. **Terrain-Albedo** (Z.1699-1712): pro Vertex `cMead`(0x55632f) -> `cLit`(0x2c3621) nach
   Standdichte, `cRock`/`cDirt`/`cWet`/`cSand`. Entscheidend: `c.multiplyScalar(0.58+0.46*lightAt)`
   (Z.1708) — **das gebackene Kronendach-Licht fliesst in die Bodenfarbe** (Makro-Schatten der
   Baeume, 0 Laufzeit-Kosten).
3. **Bodendecker-Streuung** (Z.1878-1893) ueber `groundCover(L,m,rk,td)` (Z.1565-1576).

### `groundCover(L, m, rk, td)` — das Gesetz (Z.1565-1576)
```
if(td<3.0) return {grass:0, flower:0, shrub:0, pebble:0.20, bare:1};   // Pfad: nackte Erde
edge   = td<3.4 ? 0.55 : 0.30
meadow = clamp(L*1.08 - rk*0.85 + m*0.22, 0, 1)                        // hell+feucht+nicht steinig
grass  = clamp(meadow*1.12, 0, 1)                                      // TEPPICH in Lichtungen
flower = sstep(0.40,0.70,L)*(1-rk)*edge                                // Saum/Sonne (mittleres Licht)
shrub  = exp(-((L-0.40)^2)/(2*0.16^2))*(1-rk)*0.42                     // Halbschatten-Glocke um L=0.40
pebble = clamp(rk*1.05 - L*0.15, 0, 1)*0.30                            // steinige Flecken, sparsam
```

### Drei getrennte Raster-Dichten (Z.1881-1891)
| Schicht | Raster | Zell-Flaeche | Jitter | Platzierung |
|---|---|---|---|---|
| Gras / Kies | **0.72 m** | 0.5184 m2 | +-0.68 m | `if RNG<gc.grass` -> Gras **else if** RNG<gc.pebble -> Kies |
| Blume | **2.4 m** | 5.76 m2 | +-2.2 m | `if RNG<gc.flower` |
| Strauch | **4.4 m** | 19.36 m2 | +-4.0 m | `if RNG<gc.shrub` |

Alle mit `waterSurfaceAt!==null || inCaveZone` -> skip. R=64 -> Scheibe pi*64^2 = 12868 m2.

### Skalen + Farben
- `SCALE = {gras:0.24, blume:0.27, strauch:0.332, zacken(kies):0.34}` (Z.1779).
- Gras-Skala pro Bueschel: `SCALE.gras*(0.7+RNG*0.7)*(moW>0.8?1.45:1.0)` -> **0.17-0.49** Welt-Groesse;
  nasse Zonen x1.45 (fettes Ufergras).
- Kies-Skala: `SCALE.zacken*(0.09+RNG*0.14)` -> 3-11 cm (eigenes dunkel-mattes Kiesel-Template,
  `detail:1`, Z.1775).
- Blume-Skala: `SCALE.blume*(0.7+RNG*0.6)` -> 0.19-0.35.

### Gras-GEOMETRIE — `emitGrass(P)` (Z.717-772), der eigentliche Genialitaets-Kern
- N Halme je Bueschel: `N = max(3, round(lerp(50,150,density)*lf))`, lf(lod2)=0.14 ->
  **7-21 Halme** (grassT gebaut mit lod=2, Z.1771). 2 Templates (Varianten).
- Jeder Halm = **Euler-Kragtraeger** (Biegung unter Eigengewicht, Z.729-738): ueber K Segmente
  (lod2 -> K=3) akkumuliert `dir += bendDir*(f^1.8*droop)*0.12` und Gravitropismus `dir.y -= dd*0.10`;
  `droop = 0.35 + trop*0.7` (0.04-1.35) -> **gebogener Fontaenen-Halm**. Verjuengung
  `halfW = w*(1-f*0.86)*0.5`. Per-Vertex-Farbe **base->tip Gradient**: `baseCol = seasonTint*0.6`,
  `tipCol = seasonAccent*1.08`. Wind-Attribut `sway = f^1.4*windGain` (windGain 1.3).
- **Aehren/Rispen** (`isCulm`, Z.749-768): ~SH*0.5 der Halme werden Rispenstaengel mit 4-11 feinen
  nickenden Grannen (seedCol 0xC8B27A) -> sichtbarer Grassamen-Kopf. **AnazhRealm hat das NICHT.**
- Halm-Tris: (K+1)*2=8 Verts, 2K=6 Tris -> ~14 Halme x 6 = **~84 Tris/Bueschel**.

### Instanzierung + Culling (Z.1795-1813, `addTiled`)
- Gras/Kies/Strauch in **12-m-Welt-Kacheln**, jede mit eigener enger Bounding-Sphere ->
  `frustumCulled=true` je Kachel (der Dreiecks-Hebel). Blumen `instAdd` (frustumCulled=false).
- **Per-Halm-Tint aus Standort** (Z.1808-1810): `val=(lightAt-0.5)*0.45 + jitter*0.18`,
  `warm=(clamp(lightAt*0.5+(1-moist)*0.5)-0.5)*0.24` -> hell+trocken = waermeres Oliv,
  Schatten/nass = tiefes kuehles Gruen. Als `aTintI` pro Instanz.
- Sichtweiten-Cull pro Art (Z.2369): Gras 67 m, Kies 46 m, Strauch 88 m, nie jenseits fog.far.

### `understoryNiche(L)` (Z.1531-1535) — Blume/Farn/Gras-Nischen aus Bodenlicht
```
gras  = clamp(pow(L,1.5)*1.05, 0, 1)                    // ueberlinear -> hellste Flecken
blume = sstep(0.35,0.62,L)*(1-sstep(0.72,0.95,L))*0.7   // Saum (nicht in voller Lichtung, nicht Schatten)
farn  = (1-sstep(0.28,0.6,L))*sstep(0.08,0.25,L)*0.8    // Schatten unterm Dach
```

---

## (2) WIE ANAZHREALM ES MACHT

### Gras — `_buildVoxelChunkGrass(cx,cz)` (Z.33246-33528)
- Chunk-Span **43.2 m**, **16x16 = 256 Sample-Zellen**, step 2.7 m -> Zell-Flaeche **7.29 m2**.
- Pro Zelle (Z.33346): `count = floor(lebendig*16 + rnd*2) * farFactor * clump * pathSuppress *
  grassDensityScale * slopeFactor * understoryG)`.
  - `farFactor` = lod>=1 ? 0.35 : 1; lod>=2 -> gar kein Gras.
  - `clump = clamp(1 + 1.2*_clumpAt(lambda~28 m), 0.15, 2.2)` (Natur-Clumping).
  - `pathSuppress = 1 - _pathFieldAt*0.92`.
  - `slopeFactor = 1 - (slope - 0.7)/(1.3-0.7)` (`GRASS_SLOPE {lo:0.7,hi:1.3}`, Z.80874) -> steil = 0.
  - `understoryG = (0.12 + 0.95*understoryNiche(canopyLG).gras) * (0.85 + 0.35*feuchte)`
    (`UNDERGROWTH.grassFloor 0.12 / grassGain 0.95 / grassWet 0.35`, Z.79913).
  - `_canopyLightAt` (Z.61846-61872): `L = exp(-cover*0.85)` mit `cover = clump*wetF*highF` aus
    `_placementStandAt("forest")` -> **entspricht der Vorlagen-`canopyLight` (byte-treu portiert)**.
- **Cap `GRASS_MAX_BLADES = 1400`** pro Chunk (Z.33429-33430): `realCount = min(blades.length, 1400)`.
- Halm-Variation (Z.33380-33396): Breite `sXZ = 0.78+r2*0.66` [0.78,1.44], Hoehe `sY = 0.6+r1^2*1.7`
  [0.6,2.3], Neigung `tilt = +-0.25 rad`. Kein SCALE-Multiplikator wie die Vorlage.
- Boden-Tint pro Halm via `instanceColor` (Z.33364-33366): `tintR = 1.34-0.64*lushG`,
  `tintG = 0.9+0.24*lushG`, `tintB = 0.46+0.36*lushG` (`lushG = lebendig*0.7+feuchte*0.5-0.1`).

### Gras-GEOMETRIE — `_grassBladeTuftGeometry()` (Z.33189-33243)
- **6 Blaetter** je Tuff, `SEG=2`, `H=0.85`. Halm-Verjuengung `w*(1-t*0.86)` (V18.386 aus Vorlage
  kopiert). Bogen NUR `bend = lean*t^2`, lean **0.10-0.18** (winzig). Kein Gravitropismus, kein
  droop, keine Aehre. Non-indexed: 6 Blaetter x 2 Seg x 6 Verts = 72 Verts = **24 Tris/Tuff**.
- Material `_grassInstanceMat` (Z.15305 ff.): base->tip Gradient `hfN = y/0.85`,
  `baseCol = MEADOW_GREEN` (linear [0.0908,0.1248,0.0284] = cMead 0x55632f), `tipCol =
  [0.1874,0.383,0.0492]` (= seasonAccent 0x6f9a3a x 1.08, linear). + Wind-positionNode +
  Gegenlicht-Translucency. `envMapIntensity 0.18`, DoubleSide.

### Blumen / Farn / Strauch / Kies — `KLEIN_VEGETATION_SPECIES` (Z.19614 ff.) im Scatter-Pass
- Streu-Pass `_buildVoxelChunkScatter` (Z.~33990-34100): **8x8 = 64 Zellen**, step 5.4 m ->
  Zell-Flaeche **29.16 m2**.
- `count = floor(sp.perCell * dekoDensity * (0.4+0.6*norm) * kron * undergrowthF + rnd*0.8)`.
  - `undergrowthF = _undergrowthGroundFactor(sp, niche, slope)` (Z.61897-61912): `lichtung` (Blume)
    -> `0.3 + niche.blume`; `unter` (Farn) -> `0.3 + niche.farn`; `rand` (Strauch) -> `0.3 + niche.blume*0.7`;
    x Slope-Gate. `_understoryNiche` = **byte-treu die Vorlagen-`understoryNiche`** (Z.61878-61890).
- **Blume x 3**: `blume_tulpe` (perCell 1.1, kronen lichtung, Farben rot/gelb), `blume_klee`
  (perCell 1.1, gruen/weiss), `blume_mohn` (perCell 1.0, rot/schwarz). Eigene Geometrien (Z.33637-33710):
  Tulpe = Stiel + 6-Blatt-Glocke; Klee = 3 flache Blaetter bodennah + weisse Mittelbluete; Mohn =
  hoher Stiel + 4-Blatt-Scheibe mit schwarzem Zentrum. Vollgeometrie (nicht lod-reduziert).
- **Farn x 3** (kronen `unter`, perCell 0.8, feldNass feuchte), **Gestruepp/Strauch x 3**
  (kronen `rand`, perCell 0.6), **Kies/Spore** (perCell 0.9-1.6, kronen neutral).

---

## (3) DIE GERECHNETE DIFFERENZ

### GRAS-DICHTE (Halme pro m2)
**Vorlage:** Raster 0.72 m, `grass = clamp(meadow*1.12)`. In heller Lichtung (L~1, m~0.5, rk~0):
`meadow = clamp(1*1.08 + 0.5*0.22) = 1`, `grass = 1.0`. -> **1 Bueschel pro 0.5184 m2 = 1.93 Bueschel/m2**.
x 7-21 Halme (Mittel 14) = **~27 Halme/m2**.

**AnazhRealm:** Zelle 7.29 m2. `count ~ 16*clump*understoryG` (in Lichtung ~ 16*0.9*1.05 ~ 15
Tuffs/Zelle -> 256 Zellen x 15 ~ 3840 gewuenscht), **aber Cap 1400/Chunk**. Chunk = 43.2^2 = 1866 m2
-> **1400/1866 = 0.75 Tuffs/m2**. x 6 Blaetter = **~4.5 Halme/m2**.

> **Delta Gras: 0.75 Tuffs/m2 (AnazhRealm, cap-limitiert) vs 1.93 Bueschel/m2 (Vorlage) = 2.6x sparser.
> In Halmen: 4.5/m2 vs 27/m2 = 6x weniger Halme.**

### GRAS-GEOMETRIE (Bogen + Detail)
| | Vorlage-Halm | AnazhRealm-Halm |
|---|---|---|
| Segmente | K=3 (lod2) | SEG=2 |
| Bogen-Modell | Euler-Kragtraeger, droop 0.35-1.35 + Gravitropismus (Fontaene) | `bend = lean*t^2`, lean 0.10-0.18 (fast gerade) |
| Hoehe (Welt) | ~0.1-0.4 m (SCALE.gras 0.24 x Laenge) | **0.5-1.95 m** (H 0.85 x sY 0.6-2.3) |
| Aehren/Rispen | ja (isCulm, 4-11 Grannen) | **nein** |
| Tris/Einheit | ~84/Bueschel (14 Halme) | 24/Tuff (6 Blaetter) |

> **Delta Geometrie: AnazhRealm-Gras ist zu HOCH (0.5-2 m vs 0.1-0.4 m), zu STEIF (kaum Bogen), zu
> SPARSE, ohne Samen-Koepfe. Die Vorlage ist ein niedriger, dichter, gebogener Teppich mit Rispen.
> -> das ist der "sieht alt aus"-Kern.**

### GRAS-FARBE (base->tip, sRGB)
- Vorlage: base `seasonTint*0.6` = **(0.186, 0.287, 0.113)** (dunkel-oliv) -> tip `seasonAccent*1.08`
  = **(0.470, 0.652, 0.245)** (hell-gelbgruen).
- AnazhRealm: base MEADOW_GREEN(sRGB) ~ **(0.333, 0.388, 0.184)** -> tip ~ **(0.47, 0.65, 0.24)**.
- **Delta Farbe: tip praktisch IDENTISCH (bewusst gematcht, V18.386). Base ist bei AnazhRealm HELLER/
  weniger gesaettigt (root=ground-Ton statt dunkel). Minimal — die Farbe ist NICHT das Problem.**

### BLUMEN-DICHTE
- Vorlage: Raster 2.4 m (5.76 m2), `flower = sstep(0.40,0.70,L)*(1-rk)*edge`. Saum L~0.55, edge 0.30
  -> 0.5*0.3 = **0.15** -> 1 Blume/38 m2 = **0.026/m2**; Peak L=0.7 -> 0.3 -> 0.052/m2. 2 generische Varianten.
- AnazhRealm: Zelle 29.16 m2. Im Saum (L~0.55): `niche.blume = sstep(0.35,0.62,0.55)*0.7 ~ 0.55`,
  `undergrowthF = 0.3+0.55 = 0.85`. `count = floor(1.1*1*1*0.85 + rnd*0.8) ~ 1` je Art x 3 Arten ->
  **~3 Blumen/29.16 m2 = 0.10/m2**. 3 distinkte Arten (Tulpe/Klee/Mohn).

> **Delta Blumen: AnazhRealm ~0.10/m2 vs Vorlage ~0.026-0.05/m2 = 2-4x DICHTER, + 3 echte Arten statt
> 2 generische Varianten. Hier ist AnazhRealm gleich schlau / reicher — KEINE Luecke.**

### KIES
- Vorlage: im GRAS-Raster (0.72 m) als `else if RNG<gc.pebble` (`pebble = clamp(rk*1.05-L*0.15)*0.30`)
  -> dicht in steinigen Flecken (bis 0.30/Zelle = 0.58/m2), eigenes dunkel-mattes Kiesel-Template 3-11 cm.
- AnazhRealm: Kies liegt im Scatter-Pass (29.16-m2-Zellen), NICHT im dichten Gras-Raster -> viel groeber
  verteilt, keine kronendach-gekoppelte else-Konkurrenz zum Gras.

> **Delta Kies: die Vorlage bindet Kies an dieselbe 0.72-m-Zelle wie Gras (Gras ODER Kies), AnazhRealm
> hat sie entkoppelt (5.4-m-Raster) -> weniger "steiniger Fleck ersetzt Gras"-Textur am Boden.**

---

## (4) WO ANAZHREALM DIE PIPELINE NICHT ABGREIFT / NICHT SO SCHLAU IST

1. **Der `GRASS_MAX_BLADES=1400`-Cap deckelt die Wiese** (Z.33429). In lush Chunks werden ~3000-4000
   Tuffs gewuenscht, aber 1400 gerendert -> 0.75/m2 statt der Vorlagen-1.93/m2. **Groesste Einzel-Luecke.**
2. **Halm-Geometrie ist alt/steif** (`_grassBladeTuftGeometry`, SEG=2, bend=lean*t^2, keine
   Fontaenen-Biegung). Die Vorlagen-`emitGrass` mit Euler-Kragtraeger (K=3, droop bis 1.35 +
   Gravitropismus) wird NICHT genutzt — obwohl `phyto-core` schon der geteilte Wuchs-Kanal ist.
3. **Keine Aehren/Rispen** (isCulm-Zweig der Vorlage fehlt komplett) -> kein Grassamen-Detail.
4. **Gras zu hoch** (0.5-1.95 m). Die Vorlage haelt Gras bei 0.1-0.4 m (Teppich); AnazhRealm hat
   keinen SCALE.gras-Deckel -> einzelne hohe Halme statt dichter Rasen.
5. **Kies nicht an das Gras-Raster gekoppelt** (Gras-ODER-Kies pro 0.72-m-Zelle fehlt).
6. **Feuchte-Groessen-Boost fehlt**: die Vorlage skaliert nasses Gras x1.45 (`moW>0.8`); AnazhRealm
   nicht (nur Dichte via `grassWet`, nicht die Halm-Groesse).
7. Positiv (kein Fix): Kronendach-Kopplung (`_canopyLightAt`), `understoryNiche`,
   `undergrowthGroundFactor`, Slope-Gate, Boden-Tint sind **schon byte-treu portiert**. Blumen sind reicher.

---

## (5) INTEGRATIONS-PLAN

Reihenfolge nach Wirkung/Risiko. Jeder Schritt ist ein eigener Commit (Monolith-Disziplin).

### Schritt 1 — DEN GRAS-CAP HEBEN + DICHTE AN DIE VORLAGE ANGLEICHEN  *(groesste Wirkung, geringstes Risiko)*
- **Wo:** `_buildVoxelChunkGrass`, Z.33429 (`GRASS_MAX_BLADES`) + Zell-count-Formel Z.33346.
- **Was:** `GRASS_MAX_BLADES` 1400 -> ~4096 (pool-sicher: die Pool-Kapazitaet-Konstante MUSS matchen,
  V10.0-j.c — beide Zahlen zusammen aendern). Ziel-Dichte auf Vorlagen-1.93 Bueschel/m2 kalibrieren:
  1866 m2 x 1.93 ~ 3600 Tuffs im lush Chunk. Da AnazhRealm-Tuff = 6 Halme (Vorlage-Bueschel = 14),
  ALTERNATIV: Tuff-Halmzahl im `_grassBladeTuftGeometry` auf ~10-14 erhoehen und Cap moderater
  (~2200) -> dieselbe Halm-Dichte bei weniger Instanzen (billiger Draw).
- **Perf-Wand:** Gras war 83 % der GPU-Last (V18.307). Der `_foliageDensityScale`-Regler
  (grassDensityScale) + `_tickGrassThin` fangen die Mehrlast bidirektional ab -> der Cap-Lift ist
  sicher, weil starke HW hoch, schwache HW automatisch duenn baut. **Der Cap ist der Deckel, nicht
  der Regler** — hoch setzen, den Regler regeln lassen.
- **Diag-Beweis:** neues `diag-grass-density.cjs` (oder `gate:grass-thin` erweitern): zaehle
  Tuffs/m2 im lush Test-Chunk bei `_foliageDensityScale=1` -> Ziel >= 1.8 Bueschel/m2-Aequivalent.
- **Parallel:** unabhaengig von Schritt 2/3.

### Schritt 2 — HALM-GEOMETRIE AUF DEN EULER-KRAGTRAEGER + RISPE HEBEN  *(der "sieht alt aus"-Fix)*
- **Wo:** `_grassBladeTuftGeometry` (Z.33189). Ideal via `phyto-core` (der geteilte THREE-freie
  Wuchs-Kanal, V18.386) — eine reine `growGrassBlade(P, seq)` extrahieren, die die Vorlagen-
  `emitGrass`-Halm-Mathe (Z.729-738) byte-treu traegt (Euler-Bogen `dir += bendDir*f^1.8*droop*0.12`,
  Gravitropismus `dir.y -= dd*0.10`, Verjuengung `w*(1-f*0.86)`), Main + Portal lesen sie.
- **Was:** (a) SEG 2 -> K=3, Bogen von `lean*t^2` auf das droop-Modell (droop 0.35-0.9); (b) isCulm-
  Variante als 2. Tuff-Geometrie (~30 % der Tuffs, Rispen-Grannen an der Spitze, seedCol 0xC8B27A);
  (c) Hoehe deckeln: `H*sY` von [0.5,1.95] auf ~[0.12,0.45] senken (SCALE.gras-Aequivalent) ->
  Teppich statt Steppe.
- **Risiko:** Tris/Tuff steigen (24 -> ~60). Muss mit Schritt 1 balanciert werden (nicht beide
  Multiplikatoren voll). Der `check`/`gate:foliage-res` + Flugschreiber ueberwachen die Render-Last.
- **Diag-Beweis:** `diag-phyto-tree`-Muster fuer Gras — ein `diag-grass-geom.cjs`, das den Bogen
  (Tip-Offset), die Verjuengung (0.86) und die Hoehe (< 0.5 m) misst; + `diag-settled-view`-Bild
  (Schoepfer-Auge, der eigentliche Richter des Bogen-Looks).
- **Parallel:** die `phyto-core`-Extraktion parallel zu Schritt 1; der AnazhRealm-Swap seriell danach.

### Schritt 3 — KIES AN DAS GRAS-RASTER KOPPELN + NASS-GROESSE  *(Textur-Feinschliff)*
- **Wo:** `_buildVoxelChunkGrass` (der 16x16-Loop). **Was:** in der Gras-Zelle, wenn kein Gras
  gesetzt wird (steinige Zelle, `rockiness` hoch / `understoryG` niedrig), ein Kiesel-Item aus dem
  Scatter-Kiesel-Template streuen (Vorlagen-`else if RNG<gc.pebble`) -> dichte Kies-Flecken im Gras-
  Raster statt nur im groben 5.4-m-Scatter. Plus: nasses Gras (`feuchte>0.8`) Halm-Groesse x1.45
  (Vorlagen-`moW>0.8?1.45`), nicht nur Dichte.
- **Risiko:** niedrig (additiv, gate-treu). **Diag:** Kies-Zaehler im steinigen Test-Chunk > 0.
- **Parallel:** unabhaengig, nach Schritt 1.

### Schritt 4 (optional) — BLUMEN im GRAS-RASTER-Saum verdichten
- Blumen sind schon reicher als die Vorlage — nur pruefen, ob der 5.4-m-Scatter-Raster im engen
  Saum (Lichtungs-Rand) fein genug greift; falls das Schoepfer-Auge "Blumen zu spaerlich" meldet,
  Blume in den 2.4-m-aequivalenten Sub-Loop ziehen. **Nicht vorab bauen** — erst Schoepfer-Befund.

### Gesamt-Risiko & Reihenfolge
- **Seriell (Monolith):** S1 (Cap) -> S2 (Geometrie/phyto-core, der teure Teil) -> S3 (Kies/Nass).
  S1 und die phyto-core-Extraktion von S2 sind parallelisierbar (verschiedene Code-Bereiche:
  Konstante+count-Loop vs neue reine Datei); der finale Geometrie-Swap wartet auf beide.
- **Die EINE Erfolgs-Zahl:** Halm-Dichte im lush Chunk **4.5/m2 -> ~27/m2** (Vorlagen-Paritaet) UND
  Bogen/Hoehe im `diag-grass-geom` (Tip-Bogen vorhanden, Hoehe < 0.5 m) + Schoepfer-Browser-Bild
  (`diag-settled-view` an Augenhoehe, settled) als Look-Richter.
