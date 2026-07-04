Die Datei-Schreibung wurde vom Harness blockiert (Reports müssen als Text zurückgegeben werden). Hier der vollständige Bericht:

---

# A4 — LICHT · WOLKEN · HIMMEL · ATMOSPHÄRE: Vorlage vs AnazhRealm

**Kern-Befund (die eine Wurzel):** Die Vorlage LEITET ihr gesamtes Licht aus EINER physikalischen Rayleigh-Atmosphären-Funktion `atmosphere(e)` ab (Beer-Lambert-Transmission je Sonnenhöhe). AnazhRealm PICKT stattdessen aus einer hand-getunten 15-Stop-Farb-LUT (`DAY_NIGHT_STOPS`). Die Vorlage bekommt spektral-korrekten Sonnenuntergang, Dämmerungsglut, Mondblau und konsistentes Licht+Nebel+Himmel+Wasser GRATIS aus der Physik. AnazhRealm hat drei echte Löcher: (1) kein gerichtetes Füll-/Rim-Licht → flache Nacht, (2) keine Volumetrik/Godrays, (3) blau statt grün getönte Wald-Env-Map.

## 1. WIE DIE VORLAGE ES MACHT (die Genialität)

### 1.1 Der Kern: EINE physikalische Atmosphäre (`atmosphere(e)`, Z.2107–2118)
```js
const _BETA_R=0.044,_BETA_G=0.10,_BETA_B=0.23;   // Rayleigh optische Tiefe Zenit (Bucholtz 1995)
function atmosphere(e){                            // e = sin(Sonnenhöhe)
  const m=1.0/(Math.max(e,0.0)+0.06);             // Luftmasse: ~1 Zenit, groß am Horizont
  const tr=exp(-_BETA_R*m), tg=exp(-_BETA_G*m), tb=exp(-_BETA_B*m); // Beer-Lambert
  const lum=0.21*tr+0.72*tg+0.07*tb;              // direkte Sonnen-Lichtmenge
  const mx=max(tr,tg,tb); _atmS.setRGB(tr/mx,tg/mx,tb/mx);          // Sonnen-HUE = Spektrum
  const night=clamp(-e/0.16,0,1); _atmS.lerp(_moonCol,night);       // unter Horizont → Mond
  return {col:_atmS, lum:lum*(1-night)+0.06*night, day:clamp(e,0,1)};
}
```
EINE Quelle. `atm.col`+`atm.lum` speisen: keyLight-Farbe+Intensität, hemiL, fillL-Spektrum, Himmel-Dome, Nebel, Hintergrund, Impostor-Tint, Wasser-Spiegelung. Sonnenuntergang/Nacht ENTSTEHEN aus der Physik.

### 1.2 Das Licht-Rig — 5 Lichter (Z.1173–1178)
| Licht | Farbe RGB | Base | Runtime |
|-------|-----------|------|---------|
| hemiL | sky (0.874,0.933,0.800)/grd (0.275,0.235,0.180) | 0.55 | `0.78·(0.10+0.90·lum)·0.25` (forest) |
| keyLight (Schatten) | (1.0,0.941,0.847) | 2.4 | Farbe=`atm.col`, `int=3.13·lum·(0.35+0.65·wxSun)` |
| rimL | (0.667,0.800,1.0) | 1.2 | `1.25·lum` — **forest AUS** (Licht-Diät Z.1960) |
| fillL | (0.333,0.478,0.290) grün | 0.6 | `0.62·lum`, Farbe=`grün·atm.col`, sonnen-ABGEWANDT (Laub-Bounce!) |
| backL | (1.0,0.847,0.627) | 0.5 | `0.52·lum` — **forest AUS** |

Im Wald aktiv: **key+hemi+gerichtetes-grünes-fill**. Der fillL ist der Clou: gerichtetes grün-getöntes Bounce-Licht von der Schattenseite, formt sie mit Laub-Farbe.

### 1.3 Himmel-Dome (Z.1128–1154)
Sphere BackSide, kamera-zentriert. Gradient runtime aus `_w1`: `uTop=_w1·0.80/uHor=_w1/uBot=_w1·0.52`. Wolken: **5-Oktav FBM**, Parallaxe `dir.xz/(dir.y+0.16)`+Drift, Deckung `0.12+wxGrey·0.85`, Sonnen-Beleuchtung `mix(grau, uSunCol·1.15+0.15, sa·0.65)`, Horizont-Ausklang.

### 1.4 Nebel (Z.1967)
`Fog(0xa6bcc6=(0.651,0.737,0.776), sightDist·0.35, sightDist)`. Farbe per Frame=`_w1`. Sichtweite-Regler 40–120. Unterwasser: Beer-Lambert `exp(-wK·0.30)·Tageslicht`, near 0.3/far 7.5.

### 1.5 Volumetrik/Godrays (`volPass` Z.1209 + `bakeLightVolume` Z.2253)
16-Schritt Ray-March, Henyey-Greenstein `g=0.76`. **Gebackenes Kronen-Occlusion-Lichtvolumen** (48×20×48) → per-Punkt Sonnen-Sichtbarkeit → echte Lichtschächte durchs Blätterdach. Tag-2+-Replay aus Cache. Gated: `shaftGate=day·(0.25+0.75·wxSun)·smoothstep(0.03,0.24,e)`, sonst Pass AUS.

### 1.6 Env-Map (Z.1170–1172)
256×256 Canvas Gradient: `#cfe0d6 (0.81,0.878,0.839)` top → `#5a6b5e (0.353,0.42,0.369)` mid → `#0a0f0a` bottom — **grün-getönt** (Wald-Kronenbounce). PMREM. Live gedimmt: `_dimEnvIBL(0.06+0.94·lum/0.92)`, nachts 0.06. `_envMats` sammelt ALLE IBL-Materialien.

## 2. WIE ANAZHREALM ES MACHT

### 2.1 Kern: hand-getunte 15-Stop-LUT `DAY_NIGHT_STOPS` (Z.19314), Catmull-Rom (`_interpolateDayNight` Z.72353)
| t | Phase | sky RGB | light RGB | int |
|---|-------|---------|-----------|-----|
| 0.0 | Mitternacht | (0.086,0.094,0.188) | (0.416,0.478,0.659) | 0.28 |
| 0.32 | Aufgang | (0.627,0.353,0.322) | (0.910,0.698,0.596) | 0.78 |
| 0.5 | Mittag | (0.294,0.459,0.761) | (1,1,1) | 1.0 |
| 0.68 | Untergang | (0.753,0.290,0.478) | (1,0.729,0.533) | 0.8 |

Tint akkumuliert 3 Schichten (`_dayNightComputeTint` Z.72451): Wetter × Aura × Emotion. Sonnenrichtung `(cos a, sin a, sin(a·0.5)·0.4)` normiert.

### 2.2 Licht-Rig — 3 Lichter (Z.74955–75060)
| Licht | Farbe | Base | Runtime |
|-------|-------|------|---------|
| ambientLight | 0xffffff | 0.6 | `0.18+0.42·max(0,sin angle)` (Z.72784) |
| directionalLight (Schatten) | 0xffffff | 1.0 | Sonne oben: `int=lightIntensity·fade(sunDir.y)`; unten: **Mond** |
| hemiLight | (0.533,0.627,0.784)/(0.227,0.157,0.094) | 0.55 | `(0.25+0.35·sin angle)·lightMul` (Z.72856) |

`MOONLIGHT={r:0.62,g:0.7,b:0.95,intensity:0.22}`. **KEIN rim/fill/back.** Der „Fill" ist die richtungslose AmbientLight.

### 2.3 Himmel+Wolken (Skybox-Node Z.14447–14680)
TSL-Node, 3-Oktav-Nebula + FBM. `cloudCover` 0.12 sunny/0.9 rain. **Zenit-Kompensation V18.369** (Z.14606): `thrEff=thr-0.16·smoothstep(0.25,0.85,vDir.y)` — heilt das Zenit-„Radierer-Loch". Sonnen-Glow `pow(sunDot,4)`, Nacht-Mondlicht auf Wolken (V18.366).

### 2.4 Nebel (`_dayNightApplyHemiAndFog` Z.72858)
`gMix=0.26·dayAmt` (Erd-Anteil fadet nachts auf 0, V18.377). `fogColor=tint.sky·(1-gMix)+groundColor·gMix`. far liest Ring-Kante/Horizont-Mantel (4.3km). **Reicher als Vorlage:** Lade-Nebel-Reveal (min terrain/gras/wasser), Wasser-Front-Kappe (V18.358), Träge Kante (`_smoothFogEdge` V18.350).

### 2.5 Env-Map (`_ensureSkyEnvironment` Z.15512)
**64×32** DataTexture aus LIVE nebulaColor: `fac(v)= v≥0.5 ? 1.0+0.6·((v-0.5)/0.5) : 0.35+0.65·(v/0.5)`. **blau** (Sky-Farbe). PMREM, regeneriert nur bei Drift>0.04 (Anti-Freeze V18.322).

### 2.6 Aerial-Perspektive + Post-FX `nightFactor` (Z.72752) — statt Volumetrik.

## 3. DIE GERECHNETE DIFFERENZ

### 3.1 MITTAG
| Größe | Vorlage | AnazhRealm | Differenz |
|-------|---------|-----------|-----------|
| lum | `atmosphere(1)`: m=0.943, **0.913** | LUT int=**1.0** | AR flach auf 1.0 |
| Key-Farbe | (1.0,**0.949**,**0.839**) warm | (1,1,1) rein | AR fehlt warme Zenit-Tönung |
| Key-Int | `3.13·0.913`=**2.86** | `1.0·fade(1)`=**1.0** | Vorlage 2.9× heller |
| Hemi | **0.18** | **0.60** | AR 3.3× heller (flacher) |
| Fill | fillL gerichtet grün 0.56 | Ambient **0.60** richtungslos | Vorlage FORM, AR flach |
| **Key:Fill** | **16:1** (plastisch) | **1.7:1** (flach) | die gemessene Wurzel |

### 3.2 SONNENUNTERGANG (e≈0.05)
| Größe | Vorlage | AnazhRealm |
|-------|---------|-----------|
| lum | m=9.09, **0.439** | LUT **0.8** |
| Sonnenfarbe | (1.0,**0.601**,**0.185**) tiefes ORANGE (Physik!) | (1,0.729,0.533) hand-warm/rosiger |
| Glut | =dieselbe Rayleigh-Sonnenfarbe | separater Hand-Wert sky (0.753,0.290,0.478) |

Bei b=0.185 gibt die Physik ein sattes, spektral-korrektes Orange über JEDEN Zwischenwinkel. AR muss jeden Übergang von Hand setzen.

### 3.3 NACHT (e=-1) — die Wurzel des „dunkel/flach"-Screenshots
| Größe | Vorlage | AnazhRealm | Differenz |
|-------|---------|-----------|-----------|
| Hemi | **0.030** | **0.25** | **AR 8× heller → wäscht Nacht flach** |
| Ambient | (keine) | **0.18** | AR hebt jeden Pixel gleich → kein Schwarz |
| Nicht-direktional gesamt | Hemi 0.03+Env 0.06 ≈ **0.09** | Ambient 0.18+Hemi 0.25 = **0.43** | **AR 4.8× mehr Fülllicht** |
| **Direktional:Fill** | Mond 0.19 : 0.09 ≈ **2:1** | Mond 0.22 : 0.43 ≈ **0.5:1** | **Vorlage: Mond dominiert (Form); AR: Fülllicht dominiert (flach)** |

**Exakte Wurzel:** AnazhRealms Ambient 0.18 + Hemi 0.25 = 0.43 richtungsloses Füllen übertönt den Mond (0.22) → 0.5:1 → kein gerichteter Kontrast → flach; und zugleich absolut dunkel. Die Vorlage lässt Hemi auf 0.03 fallen, hat KEINE AmbientLight, der Mond dominiert 2:1 → dunkel ABER plastisch.

### 3.4 Wolken — vergleichbar bis AR-überlegen
Beide FBM. AR hat **Zenit-Kompensation V18.369**, die die Vorlage NICHT hat. **Kein Defizit.**

### 3.5 Env-Map
Vorlage 256×256 **grün**-Wald statisch, dim via lum. AR **64×32 blau** live. AR-Metalle reflektieren blauen Himmel statt grüner Kronen-Ambient.

### 3.6 Volumetrik — TOTALES Loch
Vorlage: 16-Schritt Ray-March + gebackenes Kronen-Occlusion → echte Godrays. **AnazhRealm: 0.**

## 4. WO ANAZHREALM DIE PIPELINE NICHT ABGREIFT

1. **Keine physikalische Atmosphäre** — die 15-Stop-LUT ist Hand-Arbeit; `atmosphere(e)` ist ~10 Zeilen Rayleigh, die JEDEN Winkel spektral-korrekt + konsistent über Licht+Himmel+Nebel+Wasser trifft.
2. **Kein gerichtetes Füll-/Rim-Licht → flache Nacht+Tag.** Richtungslose AmbientLight tötet die Form. Key:Fill 1.7:1 (AR) vs 16:1 (Vorlage) tags; 0.5:1 vs 2:1 nachts.
3. **Keine Volumetrik/Godrays** — die atmosphärische Wald-Signatur fehlt komplett.
4. **Env blau statt grün + 64×32 statt 256×256** — kein Kronen-Bounce in der IBL.
5. **Hemi zu hell** (Tag 0.60 vs 0.18, Nacht 0.25 vs 0.03) → wäscht Kontrast aus.
6. **Kein fillL-Laub-Bounce-Gesetz** (grün·Rayleigh-Sonne, sonnen-abgewandt).

**AR-Vorsprung (behalten):** Lade-Nebel + Wasser-Front-Kappe + Nebel-Trägheit; Zenit-Wolken-Kompensation; live-mitatmende Env; Anti-Freeze-Env-Ratensperre (V18.322).

## 5. INTEGRATIONS-PLAN

### WELLE A4-1 — Physikalische Atmosphäre als EINE Quelle (höchste Wirkung, mittleres Risiko)
Neue reine Methode `_atmosphere(e)` neben `_dayNightSunDirection` (Z.72562), Port von Vorlage Z.2111, liefert `{col,lum,day}`. Konstanten `RAYLEIGH_BETA={r:0.044,g:0.10,b:0.23}`, `MOON_HUE=0x9fb8dc`.
- In `_applyDayNightToScene` (Z.72420): `e=sunDir.y`, `atm=this._atmosphere(e)`, durchreichen.
- In `_dayNightApplyDirectionalLight` (Z.72734): Tag-Farbe=`atm.col`, `int=KEY_BASE(~2.6)·atm.lum·lightMul`. LUT-`stop.light` wird Fallback/Feld-Tint-Träger.
- **Risiko:** ACES-Belichtung — KEY_BASE gegen `toneMappingExposure` kalibrieren, Mittag ~gleich hell halten. Determinismus: reine Funktion von e → unbedenklich.
- **Diag:** neues `diag-atmosphere.cjs` — assert `_atmosphere(1).lum∈[0.90,0.92]`, `_atmosphere(0.05).col.b<0.25`, `_atmosphere(-0.2).col≈MOON_HUE`; `diag-night-probe` grün.

### WELLE A4-2 — Gerichtetes Füll-Licht gegen die flache Nacht (höchste sichtbare Wirkung) — hängt an A4-1
`fillLight` (DirectionalLight) einführen, AmbientLight stark senken.
- Z.74955: `const fillLight=new THREE.DirectionalLight(0x557a4a,0.6); scene.add(fillLight); scene.add(fillLight.target)` → `state.fillLight`.
- `_dayNightApplyDirectionalLight` (nach Sonne, Z.72724): position=`focus-lightDir·60+(0,22,0)`, target=focus, color=`(0.333,0.478,0.290)·atm.col`, int=`0.62·atm.lum`.
- `_dayNightApplyAmbient` (Z.72784): `baseAmb=0.06+0.10·sunHeight` (statt 0.18+0.42).
- Hemi (Z.72856): `(0.10+0.20·sunHeight)·lightMul`.
- **Risiko:** dunklere Schatten — PBR-Struktur-LUT-Böden (V18.111) prüfen. Render-only.
- **Diag:** `diag-night-probe` erweitern: `directional/(ambient+hemi)>1.5` nachts, `>3` tags. `diag-look-shot` bei tod=0 = LOOK-Wand.

### WELLE A4-3 — Env-Map grün+höher aufgelöst (mittlere Wirkung, niedriges Risiko) — unabhängig, parallel zu A4-1
`_ensureSkyEnvironment` (Z.15544): W/H→128×64, `envRGB=nebulaColor·fac·GREEN_WALD_TINT(≈0.9,1.05,0.85)` am Horizont/Boden. Anti-Freeze-Ratensperre NICHT anfassen.
- **Diag:** `diag-skyenv-identity` + `gpu-lens` (0 Recompiles) grün.

### WELLE A4-4 — Volumetrik/Godrays (höchste Wow-Wirkung, HÖCHSTES Risiko) — eigener Bogen, zuletzt
Port `volPass`+`bakeLightVolume` als TSL/RenderPipeline-Pass (WebGPU, nicht GLSL). Kronen-Occlusion aus den Voxel-Scatter-Baum-Positionen backen. Gated wie Vorlage. Muss Stellgröße im Perf-Regelkreis (`_nexusPerfActuate`) werden.
- **Risiko:** SEHR hoch — neuer WebGPU-Pass + Perf-Budget. Isoliert, eigenes Gate.
- **Diag:** `diag-render-load`, Schöpfer-Browser (reiner LOOK).

### Parallelisierung / Reihenfolge
- A4-1 und A4-3 **unabhängig → parallel**. A4-2 **seriell nach A4-1** (liest `atm`). A4-4 **eigener Bogen** nach A4-1.
- Empfohlen im Haupt-Baum (Monolith, V18.388-Lehre — KEINE worktree-Isolation weit vor main, seriell-committend): **A4-1 → A4-2** (eine Welle, teilen `_atmosphere`) → **A4-3** → **A4-4**.
- **A4-1+A4-2 sind der Großteil des Look-Gewinns** und heilen den „dunkel/flach"-Screenshot direkt. A4-4 ist Kür.