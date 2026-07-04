Der Report-File-Write wurde von der Harness geblockt — ich gebe den Bericht direkt als Text zurück (der aufrufende Agent liest meinen Output).

---

# A5 — WETTER · ZEIT · JAHRESZEIT: Vorlage vs AnazhRealm (gerechnete Differenz)

Schöpfer-Befund: „das Wetter nicht so genial steuerbar, die Zeit, die Jahreszeit."

**Kernbefund vorweg:** Die **JAHRESZEIT existiert in AnazhRealm als LIVE-System GAR NICHT** (grep `uLeafPresence|uBloom|uSeasonMul|presenceTarget|bloomTarget` in `anazhRealm.js` = **0 Treffer**). Das WETTER ist da, aber flach (3 Worte, 2 Skalare) gegen die Vorlage (4 Presets, 5-Kanal-Vektor, Regen-Partikel, kontinuierlicher Drift). Die ZEIT ist reich, aber LUT-getrieben statt physik-getrieben, und ihr saison-gekoppelter Tag-Länge-Regler fehlt (weil die Saison fehlt). Alle drei leben in EINER Vorlagen-Datei (`worlds/terrain/phytogenesis.js`).

## (1) WIE DIE VORLAGE ES MACHT — die Genialität

### 1.1 Geteilte Uniforms (Z.64-67) — die EINE Quelle
```
WIND   = {uTime:0, uWindStrength:0.0, uWindDir:(1,0,0.35).norm, uGust:1.0}
SEASON = {uLeafPresence:1.0, uBloom:1.0, uSeasonMul:Color(1,1,1)}
_seasonBuiltTint = 0x4f7a30   // Tint, mit dem die Geometrie GEBACKEN wurde (Referenz fürs Verhältnis)
```
`injectWind()` (Z.112) hängt sie per `onBeforeCompile` in JEDES Vegetations-Material (Rinde/Laub/Gras/Stengel). Drei Uniforms tragen das GANZE Jahr — ohne Geometrie-Rebuild.

### 1.2 JAHRESZEIT — kontinuierliche Phänologie OHNE Rebuild (die Genialität)
`seasonColors(t)` (Z.2127) — 4-Keyframe-Ring, `t∈[0,1]`:
```
seq = [ Frühling: ti=0x6a9a3e ac=0x88b450 pr=0.72 bl=0.85
        Sommer:   ti=0x4f7a30 ac=0x6f9a3a pr=1.00 bl=0.12
        Herbst:   ti=0xb0702a ac=0xd2922f pr=0.55 bl=0.00
        Winter:   ti=0x6e6650 ac=0x847c64 pr=0.06 bl=0.00 ]
f=(t%1)*4; i=floor(f); k=frac(f)
seasonTint/presenceTarget/bloomTarget = lerp(seq[i], seq[i+1], k)
```
Drei Uniform-Wirkungen, alle pro FRAME, KEIN Rebuild:
- **Laubfarbe** (Z.2151): `uSeasonMul = clamp(seasonTint/_seasonBuiltTint, 0.25, 4.0)` je Kanal; Shader (Z.144) `diffuseColor.rgb *= mix(1.0, uSeasonMul, vSeasW)`, `vSeasW=1` nur Laub(type1)/Blüte(type3), 0 Holz.
- **Entlaubung** (Z.119): `pres=(wT==1)?uLeafPresence:(wT==3?uBloom:1); transformed=mix(aCenter, transformed, clamp(pres,0,1))` — jedes Blatt schrumpft zum Cluster-Anker `aCenter`, wenn presence→0 (Winter kahl, stufenlos).
- **Blüte** (uBloom, gleiche mix-Mechanik für type3).
- Glättung (Z.2357-58): `+= (target-cur)*0.06`/Frame.
- **Tag-Länge saison-gekoppelt** (Z.2152): `dayLen = lerp(9.0, 15.8, 0.5+0.5·cos((WSEASON-0.25)·2π))`.
- 8 Phasen-Namen, Slider `WSEASON∈[0,1]`, Autoplay `WSEASONSPEED=0.010`/s.
- **Gesetz** (Z.2140): „KONTINUITÄT STATT REBUILD … im Autoplay NIE synchron neu bauen; ein echter Wald baut sich auch nicht um. Manuelle Saison-Wahl backt weiterhin exakt." (`setSeasonColors`, Z.1030, backt exakt bei Button-Klick.)

### 1.3 WETTER — 4 Presets · 5-Kanal-Vektor · Regen-Partikel · Drift
`weatherTargets(w)` (Z.2120) → `_wxBase = {fog, sun, grey, wind, rain}`:
```
klar     : fog=0.15 sun=1.00 grey=0.00 wind=0.06 rain=0.00
bewoelkt : fog=0.40 sun=0.32 grey=0.74 wind=0.30 rain=0.12
nebel    : fog=1.00 sun=0.48 grey=0.46 wind=0.10 rain=0.00
sturm    : fog=0.70 sun=0.15 grey=0.88 wind=1.00 rain=1.00
```
5 geglättete Faktoren `+= (target-cur)*0.02`/Frame (Z.2149). Wirkungen: `wxSun`→keyLight (Z.2181), `wxGrey`→Hemi/Himmel grau (Z.2191), `wxFog`→scene.fog+Dunst (Z.2215), `wxWind`→WIND.uWindStrength + Wasser-Wellensteilheit (Z.2196) + Wolke `uCover=clamp(0.12+wxGrey·0.85,0,1)`, `wxRain`→**Regen-Partikel** (Z.2359: 1600 Streifen, Fall `dt·42`, Drift `dt·wxWind·7`, kamera-umlaufend).
**Autoplay `WXPLAY`** (Z.2141): 3-Freq-Rausch `n(ph)=sin(_wxT+ph)·0.5+sin(_wxT·0.61+ph·1.7)·0.32+sin(_wxT·1.9+ph·0.4)·0.18` moduliert fog/sun/grey/wind kontinuierlich. `windTarget` (Buttons → 0.05/0.45/1.1) getrennt, `max(windTarget, wxWind)`.

### 1.4 ZEIT — Physik-Atmosphäre (EINE Quelle für alles Licht)
`WTIME 0..24h`, Autoplay `WSPEED=1.2 h/s`. Sonnenhöhe `e` aus WTIME (Z.2154), saison-gekoppelt (`sr=12-dayLen/2`). **`atmosphere(e)`** (Z.2111):
```
m = 1/(max(e,0)+0.06)                                       // Luftmasse
tr,tg,tb = exp(-BETA·m),  BETA_R=0.044 BETA_G=0.10 BETA_B=0.23   // Rayleigh/Beer-Lambert (Bucholtz 1995)
lum = 0.21tr+0.72tg+0.07tb;  _atmS = Hue(tr,tg,tb) → lerp(_moonCol, night)   // Nacht → Mond (Purkinje)
```
EIN Zustand speist key/hemi/rim/fill/Impostor/Wasser/Himmel/Fog. Sonnenuntergang-Rot EMERGIERT aus der Physik. 48-Slot-Tag-Cache (Z.2291). Wolken-Dom (Z.1128): fbm(5-Oktav), `uCover` vom Wetter, sonnen-beleuchtet, Parallaxe-Drift.

## (2) WIE ANAZHREALM ES MACHT

**ZEIT — LUT (Z.19314, 72418):** `timeOfDay 0..1`, `dayLengthMinutes=8` (Slider 1-60). `DAY_NIGHT_STOPS` = **15 handgetunte Stops** `{t, sky, light, intensity}` (z.B. Untergang t=0.68 `sky=0xc04a7a light=0xffba88 int=0.8`), smoothstep-interpoliert. `_applyDayNightToScene`: `angle=t·2π-π/2`, `sunDir=_dayNightSunDirection`, Mond `+π`, `nightFactor`, Aerial. **Kein Rayleigh** — Sonnenfarbe ist gebackener Hex.

**WETTER — 3 Worte, 2-Skalar (Z.19339, 73215, 76637):**
```
WEATHER_INTENSITY = {sunny:0, rainy:1, stormy:1.35}
WEATHER_TINTS     = {sunny:{skyMul:1.00,lightMul:1.00}, rainy:{0.55,0.70}, stormy:{0.42,0.55}}
```
`_weatherBlendedValue(sunnyVal, rainyVal) = sunnyVal+(rainyVal-sunnyVal)·INT[w]` = EINE Blend-Quelle. Leser: `cloudCover=_weatherBlendedValue(0.12,0.9)`; `uWindStrength=_weatherBlendedValue(0.12,0.26)` (Z.77273); Skybox `skyMul/lightMul`; Audio `(0,0.014)`. Übergang `requestWeatherTransition` (45 s, emotion-moduliert). Auto-Zyklus (Z.76650): alle **120 s** zufälliges anderes Wort.

**JAHRESZEIT — existiert NICHT live.** Einziges „Herbst" (Z.51486) ist Bau-Zeit, pro Baum, einmalig:
```
if (fo.kind==="leafCluster" && genome.chance("autumn", 0.24))
    baseColor = genome.pick("autumnTint", [0xc89a3a,0xbf7a2a,0xa84e22,0x9a7a30,0xb5532a]);
```
→ 24 % der Laub-Bäume herbstfarben GEBACKEN. Ändert sich NIE: keine Entlaubung, Blüte, Farb-Drift, kein Slider, keine Tag-Länge-Kopplung.

## (3) DIE GERECHNETE DIFFERENZ

**3.1 JAHRESZEIT (größte Lücke — Faktor ∞)**
| Größe | Vorlage | AnazhRealm | Differenz |
|---|---|---|---|
| Live-Saison-Uniforms | 3 | 0 | **fehlt komplett** |
| Winter-Entlaubung | `presence 1.0→0.06` (94 % Laub kollabiert) | keine | **fehlt** |
| Frühlings-Blüte | `bloom 0.12→0.85` | keine | **fehlt** |
| Herbst-Laubfarbe | `uSeasonMul` live: Herbst `0xb0702a/0x4f7a30 = (2.23, 0.92, 0.875)` je Kanal → live orange | statisch: 24 % fester Hex, 76 % bleiben `0x4a7a2c` grün | **fehlt** (nur Bau-Mix) |
| Kontinuität | driftet ohne Rebuild | bräuchte Full-Worldgen-Regrow = das verbotene | **entgegengesetzt** |
| Tag-Länge | `lerp(9.0, 15.8 h)` saison-gekoppelt | fest | **fehlt** |

**3.2 WETTER**
| Kanal | Vorlage klar→sturm | AnazhRealm sunny→stormy | Differenz |
|---|---|---|---|
| Wind | `0.06→1.00` = **16.7×** | `0.12→0.309` = **2.6×** | Vorlage-Sturm biegt den Wald, AnazhRealm versteift kaum (**~6× schwächer**) |
| Licht | `sun 1.0→0.15` → keyLight ×0.45 (−55 %) | `lightMul 1.0→0.55` (−45 %) | vergleichbar |
| Grau/Overcast | eigener `grey 0→0.88`-Kanal | **kein grey-Kanal** | fehlt |
| Nebel | `fog 0.15→1.00` (Whiteout) | **kein wetter-getriebener Fog** | fehlt |
| Regen-Partikel | 1600 Streifen, `∝wxRain` | keine | fehlt |
| Presets | 4 | 3 | kein reines Nebel/Bewölkt |
| Auto-Drift | `WXPLAY` 3-Freq, ziehend | harter Random-Flip/120 s | Vorlage atmet, AnazhRealm springt |

**3.3 ZEIT**
| Größe | Vorlage | AnazhRealm | Differenz |
|---|---|---|---|
| Farb-/Lichtquelle | 1 Physik-Fn `atmosphere(e)` → alles | 15 Hex-Stops + separate Hemi/Fog | mehr Magic-Konstanten; LOOK aber Schöpfer-verifiziert |
| Sonnenuntergang-Rot | emergiert aus Luftmasse | gebacken `0xc04a7a` | Design-Koexistenz, kein Bug |
| Steuerung | 0-24 h Slider + Autoplay + Speed | dayLengthMinutes + setTimeOfDay | beide steuerbar; Vorlage koppelt Tag-Länge an Saison |

## (4) WO ANAZHREALM DIE PIPELINE NICHT ABGREIFT

1. **Keine Saison-Uniform-Pipeline** — das ganze Jahr in 3 Floats/Colors ohne Rebuild fehlt; ein Saison-Wechsel wäre nur über Full-Worldgen-Regrow = genau der abgeschaffte „Rebuild-Takt". **Zentrale Lücke.**
2. **Kein `aCenter`-Blatt-Anker + kein Laub-Typ-Flag im Vegetations-Shader** → keine Entlaubung/Blüte-mix. (Die Saat ist da: V18.385 Phyto-Blatt-Anker in `_lastTreeSkeleton` — aber nicht als Vertex-Attribut auf der Laub-Geometrie exponiert.)
3. **Wetter ist 2-Skalar-Achse** — es fehlen die Kanäle **fog** (Nebel), **grey** (Overcast), **rain** (Partikel).
4. **Wind-Wetter-Kopplung zu schwach** (2.6× statt 16.7×).
5. **Kein kontinuierlicher Wetter-Drift** (WXPLAY-Äquivalent) — 120-s-Flip ist ein Sprung.
6. **Keine saison-gekoppelte Tag-Länge** (weil keine Saison).
7. **(Sekundär, kein Bug)** Zeit-Farbe ist LUT statt Physik — Vorlage leitet ALLES aus `atmosphere(e)` ab. Nicht heilen ohne Schöpfer-Sign-off (Look verifiziert, „PBR ist die EINE Wahrheit").

## (5) INTEGRATIONS-PLAN (baubar)

**Leit-Disziplin:** seriell im Haupt-Baum committen, KEIN worktree-branch von main (V18.388); Saison-State input-getrieben und AUS der Fixed-Step-Sim halten (wie `_tickWorldRules`, wall-clock) → Replay-Determinismus bleibt; Fog-Kopplung ADDITIV über den Lade-Stream-Nebel legen, nie zweite Fog-Quelle (`_smoothFogEdge`/Wasser-Kappe heilig); persistente Felder feldweise in `buildStateSnapshot` UND `loadState` (V8.59-Paar).

**Track A — SEASON-Uniforms + Phänologie (unabhängig, additiv, headless-beweisbar).** Code: `state.seasonUniforms` neben `windUniforms` (~Z.15326) `{uLeafPresence:uniform(1), uBloom:uniform(1), uSeasonMul:uniform(Color(1,1,1))}`; State `season∈[0,1]`, `seasonAutoplay`, `seasonSpeed=0.010`, `seasonBuiltTint` (aus `SPECIES_PALETTE.leaf`/Meadow-Green) — alle in `init()` + audit:strict-Whitelist + Snapshot. Methode `_seasonPhenology(t)` (Port von `seasonColors`, 4-Keyframe-Ring). Tick (wall-clock, NICHT Sim): Autoplay-Drift, `presence/bloomTarget` glätten `+=*0.06`, `uSeasonMul = clamp(tint/seasonBuiltTint, 0.25, 4.0)`. Gras liest `uSeasonMul` in `_grassInstanceMat`. Diag `diag-season-phenology` (`t=0.5→presence 1.0/bloom 0.12`; `t=0.75→presence 0.06`; Herbst `uSeasonMul.r≈2.23`). **Risiko: niedrig.**

**Track B — WETTER-Vertiefung (unabhängig von A).** Code: `WEATHER_INTENSITY`/`WEATHER_TINTS` (Z.19339) → 5-Kanal-Vektor `_weatherFieldFor(w)` `{fog,sun,grey,wind,rain}` (Vorlage-Werte 1:1). `_applyDayNightToScene` liest `grey` (entsättigen) + `fog` als ADDITIVEN Dichte-Multiplikator auf den Lade-Stream-Nebel. Wind weiten: `uWindStrength = _weatherBlendedValue(0.10, 0.55)` (stormy→0.71). `_ensureRainSheet` (Port `_rain`, 1600 Linien, `∝wxRain`, toggle). Optionaler `weatherDrift`-Modus (3-Freq-Rausch) statt 120-s-Flip. Diag `diag-weather-vector` (5 Kanäle, Wind ≥5×, Regen-Opacity). **Risiko: mittel** (Fog gegen `stream-lab`/Wasser-Kappe verifizieren).

**Track C — Vegetations-Shader-Hook (hängt an A: Entlaubung + Laubfarbe).** Code: Laub-Geometrie (`_buildVoxelChunkScatter`/`_scatterRegion`/Foliage-Node in `_applyVegetationResponse`) trägt (a) `aCenter`-Attribut (aus V18.385-Phyto-Blatt-Ankern) + (b) Laub-Typ-Flag. TSL: `positionNode: mix(aCenter, positionLocal, clamp(uLeafPresence,0,1))` für Blatt-Verts; `colorNode: albedo.mul(mix(1.0, uSeasonMul, leafMask))`. **Scope:** ZUERST die reine Farbe (`uSeasonMul` + `uBloom`, billig, kein Geometrie-Umbau); die **Entlaubung als eigene Sub-Welle** (braucht `aCenter` auf der INSTANZIERTEN Card-Wolke + über Impostor-LODs = das harte Stück). Diag `diag-season-shader` (Source-Probe + presence→0 kollabiert Laub, Holz unverändert). **Risiko: mittel-hoch** (HISM/Impostor-Kopplung).

**Track D — Kopplung + Steuerung (hängt an A+C).** Tag-Länge saison-gekoppelt (Vorlage-Formel). Kontroll-Panel: Saison-Slider + Autoplay + Phasen-Name; DSL-Ops `season fruehling|sommer|herbst|winter` + fehlende Wetter-Worte. **Risiko: niedrig.**

**Parallelisierung & Beweis:** A und B logisch unabhängig, aber am Monolithen SERIELL committen (V18.388). C hängt an A, D an A+C. Reihenfolge: A → B → C(Farbe) → C(Entlaubung, eigene Welle) → D. Determinismus-Wand `diag-season-determinism`: Saison-Autoplay löst KEINEN Worldgen-/Chunk-Rebuild aus (Kontinuitäts-Gesetz) und steht außerhalb der Fixed-Step-Sim. Erfolgs-Zahlen: `diag-season-phenology` (presence 0.06/bloom 0.85/seasonMul 2.23) · `diag-season-shader` (Laub kollabiert, Holz nicht) · `diag-weather-vector` (5 Kanäle, Wind ≥5×) · `stream-lab`/`gate:seam` unberührt.