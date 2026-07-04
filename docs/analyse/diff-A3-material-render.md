# A3 — MATERIAL + BAUM-RENDER: die Attrappe-Wurzel (warum sieht AnazhRealms Baum NAH falsch aus?)

**Kurzurteil vorab (die gerechnete Wurzel):** Drei messbare Ursachen für „flach / braune Pappe / schwarz", nach Gewicht:
1. **Das Licht-Verhältnis ist INVERTIERT.** Vorlage im Wald: `directional/(ambient+hemi) ≈ 2.85/0.19 ≈ 15:1` (Schlüssellicht dominiert → tiefe Kronen-Schatten → Volumen). AnazhRealm-Hauptwelt mittags: `1.0/(0.60+0.60) ≈ 0.83:1` (flaches Füll-Licht dominiert → keine Schattierung → flache Masse). **Faktor ~18× weniger Kontrast.** Dominante Ursache für „flach/Pappe".
2. **Die Blatt-GEOMETRIE bei LOD0 fehlt.** Vorlage-L0 = echte 3D-Blattklinge (`pushLeaf`, Superformel-Tropfen, **30 Verts, gemuldet**). AnazhRealm-L0 = flaches Atlas-Quad (`buildFoliageQuads`, **4 Verts**). AnazhRealm portierte nur den L1-KARTEN-Pfad, NIE den L0-GEOMETRIE-Pfad → der nahe Baum liest als Karten-Stapel.
3. **Kein unlit-Silhouetten-Floor.** Vorlage addiert `diffuseColor.rgb·pow(1−ndv,2.5)·0.55` (UNBELICHTETE Albedo an der Silhouette). AnazhRealms Backlit ist ein sonnen-gegates warmes ADDITIV (`·0.18`), KEIN Albedo-Floor → im Schatten/nachts fällt das Laub ins Schwarze.

---

## 1) WIE DIE VORLAGE ES MACHT (die Genialität)

### 1.1 Materialien (`buildMaterials`, Z.172-180), alle durch `injectWind` (Z.112-151)
| Material | Z. | roughness | metal | side | alphaTest | Besonderheit |
|---|---|---|---|---|---|---|
| barkMat | 174 | 0.93 | 0 | Front | – | normalMap makeBarkNormal 512², repeat 2×7, scale 0.85 |
| barkMatBirch | 175 | 0.74 | 0 | Front | – | normalScale 0.10 (Birke fast glatt) |
| foliageMat (L0) | 176 | 0.62 | 0 | DoubleSide | – | vertexColors, KEINE map |
| foliageMatTex (L1) | 177 | 0.62 | 0 | DoubleSide | 0.5 | map=_leafAtlas |
| grassMat | 178 | 0.7 | 0 | DoubleSide | – | envMapIntensity 0.18 (bewusst wenig IBL) |

### 1.2 `injectWind` Fragment (foliage, Z.143-146)
`diffuseColor·=mix(1,uSeasonMul,vSeasW)` · `·=clamp(1+vTintI,0,2)` · **`gl_FragColor.rgb += diffuseColor.rgb·pow(1-ndv,2.5)·0.55`** (Subsurface-Rim = unbelichtete Albedo) · **`+= vec3(0.09,0.15,0.04)·pow(1-ndv,4)·0.5`** (grünes Kanten-Glimmen). Diese zwei Zeilen halten die Krone auch im Schatten satt.

### 1.3 Blatt-GEOMETRIE L0 — `pushLeaf` (Z.247) + `superR` (Z.240)
Echte 3D-Klinge: Superformel über **14 Segmente (30 Verts)**, gemuldet (`cupZ=-cup·(s-s²)·scale`, cup=0.5), `computeVertexNormals`. Farbe `seasonTint.lerp(accent,tj·0.5).lerp(leafCol,0.45)` (Z.658).

### 1.4 Blatt-KARTEN L1 — `bakeLeafAtlas` (Z.288) + `pushLeafClusterQuad` (Z.316)
Nur `__lod===1 && !conifer && kind!=='shrub' && trop<0.55` (Z.647). Atlas 1024×256, Wert `v=0.88+rg·0.34` (~weiß). 1 Quad=2 Tris, scale·2.35. Nadeln bleiben Geometrie (`pushNeedle`).

### 1.5 Zwei-Pass FoliagePass (Z.73-106)
(1) Struktur voll-res+Tiefe → (2b) Laub Layer 1 **halb-res (_folRes 0.5)** tiefengetestet → (3) Composite `mix(struct,fol,fol.a)`. Weiche Laub-Tiefe ohne Overdraw.

### 1.6 LICHTUNG Wald-Modus (Z.1959/2178)
`rimL/backL aus` · `keyLight 3.13·lum ≈ 2.85` · `hemiL ~0.19` · `fillL 0.62 grün sonnenabgewandt` · KEIN AmbientLight. **Schlüssel:Fülle ≈ 15:1.**

---

## 2) WIE ANAZHREALM ES MACHT

### 2.1 `_buildPbrNodeMaterial` (Z.28891) → MeshStandardNodeMaterial (WebGPU/TSL)
Laub: `lebendig≥0.7 → roughness=min(0.98,0.7+lebendig·0.2)≈0.84`, metal 0. Blatt-Pfad (Z.29036): sampelt `_ensureFoliageClusterAtlas`, `_alpha=samp.a`, `albedo=albedo·samp.rgb`, `alphaTest=0.5`, `colorNode=vec4(albedo,_alpha)`. Rinde (Z.29089): `_substanceCharacter` bark-Modus, KEIN normalMap-Bitmap (V18.338).

### 2.2 `_applyVegetationResponse` (Z.29594)
Wind-Sway (aFlex²+aPhase, geteilte windUniforms) ✓ · Subsurface-Backlit (Z.29652): `detail>0.4 → glowColor(1,0.85,0.6)·pow(backDot,3)·detail·0.18` ADDITIV, sonnen-gegated (≠Vorlage: kein unlit-Floor) · LOD-Dither-Crossfade (Z.29692, aH0/aH0L, uLodRef 14) ✓ Port der Vorlage 121-135.

### 2.3 `_buildTreeFoliageCardGeometry` (Z.58916)
- Phyto-Pfad (Z.58928, phytoLeaves IST populiert Z.51463): `buildFoliageQuads(phytoLeaves,{scale:2.35·fScale, needleScale:5.5·fScale})` → **1 Quad (4 Verts)/Blatt, ALLE LODs auch L0**. Byte-treu Vorlagen-pushLeafClusterQuad.
- Fallback (Z.58963): K Karten/Anker `cardsPerAnchor=[5,2,1]`, card{cross}=8 Verts. Farbe **fr=R·0.72, fg=G·0.95, fb=B·0.55** (≠Phyto-Pfad roh → **zwei Pfade, zwei Farben**).
- Atlas `_ensureFoliageClusterAtlas`→`phyto-core.bakeLeafAtlasCanvas` (Z.374): **byte-identisch** zur Vorlage ✓.

### 2.4 Opaker Kern + Schatten-Zwilling (Z.59585-59647)
`_buildTreeFoliageCoreGeometry` (Z.59235): opake Icosphere(1,1) CORE_FILL 0.6 ~240 Verts, Farbe=foliageColor, early-Z. · `_treeShadowTwinMaterial` (Z.59450): opak `color:0x2c4a22` (44,74,34) auf SHADOW_TWIN_LAYER=2. **Ersetzt Vorlagen-FoliagePass (WebGPU-Hack).**

### 2.5 Lichtung Hauptwelt (Z.74955 + 72740/72785/72856)
`AmbientLight baseAmb=0.18+0.42·sunHeight` → Mittag 0.60/Nacht 0.18 (FLACH) · `DirectionalLight = tint.lightIntensity` → Mittag 1.0/Nacht 0.28 · `Hemi=(0.25+0.35·sunHeight)·lightMul` → Mittag 0.60. **KEIN rim/fill/back, KEIN forestMode.**

---

## 3) DIE GERECHNETE DIFFERENZ

### 3.1 Licht-Kontrast (dominante Zahl)
| | Directional | Ambient | Hemi | dir/(amb+hemi) |
|---|---|---|---|---|
| Vorlage Wald mittags | 2.85 | 0 | 0.19 | **~15:1** |
| AnazhRealm mittags | 1.0 | 0.60 | 0.60 | **~0.83:1** |

**~18× weniger gerichteter Kontrast** → NdotL-Schattierung ausgewaschen → flache Masse. Nachts: dir 0.28 + amb 0.18 + hemi 0.25 = ~0.71 flaches kühles Licht; opaker Kern + Zwilling lesen als dunkle Bälle → „schwarz".

### 3.2 Blatt-Geometrie LOD0
| | Verts/Blatt | 3D-Form |
|---|---|---|
| Vorlage L0 | **30** (14-Seg-Superformel gemuldet) | echte gekrümmte Klinge |
| AnazhRealm L0 | **4** (flaches Quad) | flache Karte+Atlas |

**15× weniger Blatt-Geometrie, 0 Krümmung bei L0** → bei Nah-Sicht+flachem Licht liest als bemalte Pappe.

### 3.3 Material-Parameter
| Param | Vorlage foliage | AnazhRealm Laub | Diff |
|---|---|---|---|
| roughness | 0.62 | ~0.84 (tag) | +0.22 matter |
| side/alphaTest/metal/vertexColors | Doub/0.5/0/✓ | Doub/0.5/0/✓ | 0 |
| Silhouetten-Floor unlit | pow(1-ndv,2.5)·0.55 | **fehlt** | dunkler im Schatten |
| Kanten-Grün | (0.09,0.15,0.04)·pow(1-ndv,4)·0.5 | **fehlt** | kein Randglimmen |

### 3.4 Blatt-Albedo (Eiche leafCol 0x4a8a3a=0.290,0.541,0.227)
Vorlage L0: seasonTint.lerp(leafCol,0.45), key 2.85 → satt. AnazhRealm Phyto: leafColor·atlas(≈0.85-1.0)≈roh, dir 1.0+fill 1.2 → grau-flach. Fallback: (0.209,0.514,0.125) — **~28% dunkler in R, ~45% in B als Phyto-Pfad**.

### 3.5 Pipeline-Tiefe
Vorlage: Zwei-Pass (Struktur scharf/Laub halb-res weich). AnazhRealm: Einzel-Pass + opaker Icosphere-Kern (240) + Zwilling (960) als Ersatz → keine weiche Laub-Tiefe, harter opaker Kern.

---

## 4) WO ANAZHREALM DIE PIPELINE NICHT ABGREIFT

1. **[GRÖSSTE] Lichtung nicht Wald-getunt.** Kein forestMode: flaches Ambient 0.6 + Hemi 0.6 waschen Schattierung aus. Vorlagen-Genialität „Licht-Diät + Key 3.13 + Hemi 0.19 + grünes Bounce-Fill" nicht abgegriffen.
2. **Kein L0-GEOMETRIE-Blatt.** `pushLeaf`+`superR` (30-Vert gemuldete Klinge) NICHT in phyto-core portiert; nur `buildFoliageQuads` (Karten) für alle LODs.
3. **Kein unlit-Silhouetten-Floor + Kanten-Grün** (Vorlage Z.146). AnazhRealms Backlit ist sonnen-gegates Additiv → keine Schatten-Fülle, Schwärze nachts.
4. **Zwei divergente Blatt-Farb-Pfade** (Phyto roh vs Fallback 0.72/0.95/0.55).
5. **Kein Zwei-Pass-Composite**; opaker Kern (0x2c4a22) kann als dunkler Ball leaken.
6. **Rinde: roughness 0.7-0.9 statt 0.93/0.74**; Birken-Sonderfall (glatt, normalScale 0.10) fehlt.

---

## 5) INTEGRATIONS-PLAN (baubereit)

### P0 — WALD-LICHTUNG (dominante Ursache, kleinstes Risiko)
- **Bereich**: Z.74955-75004 (Rig) + `_dayNightApplyDirectionalLight` (72740), Ambient (72785 baseAmb), Hemi (72856).
- **Änderung**: (a) baseAmb → `0.06+0.14·sunHeight` (Mittag 0.20). (b) `dl.intensity` ×~2.5 via `FOREST_KEY_BOOST`-Multiplikator NUR auf directional (nicht stop.intensity global). (c) grünes Fill-Directional (0x557a4a·lum·0.6, sonnenabgewandt). Ziel dir/(amb+hemi) ≈ 4-8:1.
- **Risiko**: mittel (trifft Terrain/Werke/Avatar) → schrittweise, ACES-Exposure (74887=1.05) gegentunen, Boden darf nicht absaufen. NICHT parallel mit anderem Licht-Tuning (EIN Rig).
- **Beweis**: `diag-look-shot`/`diag-look-village` A/B; Kronen-Luminanz-Std steigt; `diag-settled-view`.

### P1 — L0-GEOMETRIE-BLATT (Nah-Tiefe)
- **Bereich**: NEU `phyto-core.js` `buildLeafBlades` (Port pushLeaf+superR, Attribute position/normal/color/aFlex/aPhase/uv) + Aufruf `_buildTreeFoliageCardGeometry` (Z.58928) gegated `lodLevel===0`.
- **Änderung**: LOD0 → buildLeafBlades statt/neben buildFoliageQuads; LOD1/2 Karten. Material foliageLeaf, für Klingen `_alpha=1` (kein Atlas nötig).
- **Risiko**: mittel (Verts ×~7.5 bei L0, nur nah; Perf-Regler+LOD trägt). Muss `diag-phyto-core-parity` (Main==Worker byte).
- **Parallel**: JA (unabhängig P0), aber SERIELL committen (Monolith).
- **Beweis**: Vert-Zahl/Baum LOD0 ~15×; Look-Shot nah.

### P2 — UNLIT-SILHOUETTEN-FLOOR + KANTEN-GRÜN (gegen Schwärze)
- **Bereich**: `_applyVegetationResponse` (Z.29650-29678).
- **Änderung**: auf outputNode zusätzlich `albedoNode·pow(1-ndv,2.5)·0.55` + `vec3(0.09,0.15,0.04)·pow(1-ndv,4)·0.5` (ndv=abs(normalWorld·viewDir)); albedoNode aus _buildPbrNodeMaterial durchreichen.
- **Risiko**: niedrig (additiv, try/catch); Werte tunen gegen Mittag-Grellheit.
- **Parallel**: JA. **Beweis**: `diag-look-*` nachts, min-Luminanz Silhouette > 0.

### P3 — EINE Blatt-Farbe (Konsistenz)
- **Bereich**: Fallback-Pfad (Z.59049-59051) an Phyto-Pfad (Z.58937) angleichen, EINE Quelle.
- **Risiko**: minimal. **Parallel**: JA.

### P4 (optional, groß) — Zwei-Pass-Laub-Composite auf WebGPU
- **Bereich**: RenderPipeline (~22224). Struktur scharf + Laub eigener Layer halb-res tiefenkorrekt.
- **Risiko**: HOCH (WebGPU-RTT, Layer, CSP). Eigene Welle nach P0-P3; ersetzt/ergänzt opaken Kern.

**Reihenfolge**: P0 zuerst (löst ~60%). Dann P1+P2+P3 parallel entwickeln, SERIELL committen (V18.387/.388-Disziplin: nie `git checkout` auf die ganze Datei, jeder Baustein einzeln, gegen `diag-phyto-core-parity` + `playtest:fast`). P4 spätere Welle.
