# Asset-Vertrag v4 (`cv: 4`) — Tore

> **NORMATIV.** Die Naht zwischen dem Tor-Studio-Kern (`porta-core.js`,
> Namensraum `__portaCore` — Vertrag v1.1 §7) und jedem Empfänger (Porta-Shell
> heute, AnazhRealm-Foundry-Worker seit dem ε-Andocken). Jeder Produzent, der
> diesen Vertrag spricht, MUSS die eingefrorenen Goldens in `golden/` byte-genau
> treffen (`npm run gate:porta-contract`). Die Goldens sind EINGEFROREN
> (Taille-Disziplin) — NIE regenerieren; ein bewusster Re-Mint ist `MINT_FORCE=1`
> und eine eigene Entscheidung mit Begründung.
>
> Eingefroren bei ε-Grün (Kern-Split worlds/portale/porta.js → porta-core.js,
> Shell-Verhaltens-Parität 14/14 Fälle hash-identisch vor/nach Split —
> 7 Ordnungen × 2 Seeds).

## Die Bau-Funktion

```
__portaCore.buildInstance(rezeptId, seed, lod, ov?) → THREE.Group | null
```

- `rezeptId` ∈ `drachentor · kathedrale · maschine · geisttor · verkalkt ·
ruine · maurentor` (Schlüssel aus `__portaCore.PRESETS`, Namensraum
  `[a-z0-9_-]+`; jedes Rezept trägt `kind:"gate"` + `lab` (der Schöpfer-Wortlaut
  der Lab-Buttons) + `s` (numerischer Dial-Vektor, byte-treu die Lab-Presets) +
  `fx` (domänen-eigene Ausstattung: `place {mode:"site", siteTag:"tor"}` — das
  Platzierungs-Gesetz als Daten, Wörterbuch v1 §2.4/N5.6)).
- `seed` (int): **RESERVIERT — cv:4 ist SEED-INVARIANT.** Der Bau zieht seine
  Zufälligkeit (Verwitterungs-Jitter · Ruinen-Schutt) aus dem LAB-FESTEN Strom
  `mulberry32(0x50FA)` — byte-treu zur Vorlage; derselbe Bauplan bei seed 7 und
  12345 ist byte-gleich. Das Gate prüft die Invarianz AKTIV: wer Seed-Variation
  einführt, bricht die Goldens bewusst (Re-Mint-Entscheid, cv-Bump-Frage).
- `lod`: Tore tragen NUR Stufe 0 (`PORTAL_RENDER_CONFIG.lod.kindStages =
{ gate: [0] }`); jede andere Stufe wird auf 0 geklemmt — L1=L0-Grade und
  L2-Auto-Impostor sind Sache des Wirts (Studio-Vertrag B2/N7.5-Merge).
- `ov` (optional): Parameter-Override im Slider-id-Raum, gemergt NACH s+fx
  (Merge = Slider-DEFAULTS → `s` → `fx` → `ov`, jeder Schlüssel durch das
  `pk`-Mapping `rise→riseScale`/`horse→horseshoe` — exakt die Lab-Semantik
  setParams(preset)→readParams()).
- Ausgang: EINE Group (Rahmen-Ordnungen Mauerwerk/Geflecht/Monolith ×
  zurückweichende z-Staffelung + Filigran-Türflügel E/R [geschlossen, 0 rad] +
  Fundament-Vokabular + Apertur-Glut-Kante, `updateMatrixWorld(true)`
  gelaufen). Die Naht sind die Float32-Attribute ihrer Meshes (G2.2) — kein
  Renderer-Objekt nötig. Die PASSAGE-Membran + der volumetrische Bodennebel
  sind BEWUSST nicht Teil der Substanz (Renderer-gebundene Lab-FX; der
  Welt-Übergang ist das Host-Verb `portal` — der benannte ε-Folge-Anschluss).

## Der Fingerabdruck (golden/gates.json)

Je Fall `<rezeptId>-s<seed>-L<lod>[-ov_<keys>]`: `{ objects, vertices, sha256 }`.
sha256 über den kanonischen Byte-Strom in traverse-Reihenfolge — je Objekt mit
Geometrie: Typ · `matrixWorld` (Float64-Bytes) · Material-Signatur (Farbe/
Emissive/roughness/metalness/opacity/transparent) · alle Geometrie-Attribute
(Namen sortiert: itemSize + rohe Puffer-Bytes) · Index-Puffer. Ein einziges
abweichendes Byte kippt den Hash.

Fälle: 7 Ordnungen × 2 Seeds (7, 12345) × LOD 0 + 2 ov-Fälle
(drachentor+mass, kathedrale+orders/glow — friert auch die
Override-Merge-Semantik ein) = 16; plus die aktive lod-Klemmen-Probe
(lod 2 == lod 0, nicht golden-gespeichert).

## Laufzeit des Gates

Node-DIREKT (die v2/v3-Klasse): `global.THREE = require(worlds/terrain/lib/
three-r128.min.js)` (das vendorte UMD lädt in Node), dann
`require(porta-core.js)` — kein Browser, keine swiftshader-Fragilität. Der
Selbst-Test (korrumpiertes Golden → rot) beweist bei jedem Lauf, dass die
Linse feuert.

**Re-Mint W5 (05.10.2026, `82c988bf`, das FARB-GESETZ des Steins):** der Stein mischt linear
zwischen Granit und Sandstein statt HSL roh; die Goldens waren schon an der Basis `aadb922`
rot (`drachentor-s7-L0`), alle 16 Fälle neu geprägt — unter Node 24.

**Re-Mint S1 Wände (07.10.2026, plattformgleich — das Byte-Raster am Ausgang):** am Kopf
`516e704a` standen die Goldens unter Node 24 (V8 13.6) grün und unter Node 22 (V8 12.4, die
CI) rot, 16 von 16 Fällen — die unbenannte Drift hinter `aadb922`. Gemessen (jeder
verschiedene Transzendenten-Aufruf eines Tor-Baus unter Node 24 aufgenommen, unter Node 22
nachgerechnet): 2405 von 40 148 verschiedenen `Math.pow`-Aufrufen runden anders, alle in three
r128 — `CatmullRomCurve3` `'centripetal'` (`pow(d², 0,25)`, gerufen aus `tubeMesh` und den
Bogen-Kurven) und `Color.convertSRGBToLinear` (`pow(c, 2,4)`, der Stein); `sin`, `cos`, `acos`,
`atan2`, `hypot` (213 707 Aufrufe) runden gleich. Die Plattform-Probe (`scripts/lib/
plattform-probe.cjs`, alle Transzendenten ±1 ULP) kippte jeden Fall auch über `sin`/`cos`
(`rotation` → Quaternion → Float64-`matrixWorld`), `hypot` und `atan2`. Schnitt: `ausRaster`
am Ausgang von `buildInstance` legt jede Zahl auf ein Gitter, das kein letztes Bit erreicht —
Attribute 2^-12 (Normalen 2^-14), Lage und Maß 2^-16, Drehung (Quaternion) 2^-20,
Stoff-Zahlen (Farbe, Emissive, roughness, metalness, opacity) 2^-16, −0 → 0. Byte-Akt alle 16
Fälle, `objects`/`vertices` unverändert: `position` ≤ 1,22e-4 m (1 728 602 von 1 764 102
Werten der 9 Bau-Fälle), `normal` ≤ 3,1e-5, `uv` ≤ 1,22e-4, `matrixWorld` ≤ 1,5e-5, Stoff-Farbe
≤ 7,4e-6 (ein Hex kippt um 1/255). Danach: Node 22 und Node 24 grün, die Probe kippt 0 von 9
Fällen (Ratsche `v4` = 0, `spec/asset-contract/plattform-ratsche.json`). Kein cv-Bump (die
Naht ist dieselbe).
