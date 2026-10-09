# Asset-Vertrag v1 (`cv: 1`)

> **NORMATIV.** Die Naht zwischen dem Studio-Generator (`worlds/terrain/phytogenesis.js`, geladen
> als Worker ODER iframe) und AnazhRealm. Jeder Produzent, der diesen Vertrag spricht, MUSS die
> eingefrorenen Goldens in `golden/` byte-genau treffen (`npm run gate:asset-contract`). Die
> Goldens sind EINGEFROREN (Taille-Disziplin `spec/golden/v1`) — NIE regenerieren; ein bewusster
> Re-Mint ist `MINT_FORCE=1` und eine eigene Entscheidung mit Begründung.
>
> Eingefroren bei P0-Grün (720/720 Worker==iframe byte-identisch). Der Produktions-Transport ist
> `postMessage` (Worker: `self.postMessage` · iframe: `window.parent.postMessage`) — EIN Protokoll,
> zwei Transporte (`__post`/`__portalOnMessage` in phytogenesis.js).

## Die fünf Kanäle

Alle Anfragen tragen `{ reqId }`; die Antwort spiegelt es zurück. `season ∈ {spring, summer, autumn, winter}`.

### 1. `build-asset` → `asset`

```
REQUEST  { type:"build-asset", reqId, presetId:string, seed:int, lod:0|1|2, season?:string, ov?:object }
REPLY    { type:"asset", world:"terrain", cv:1, reqId, presetId, seed, lod, meshes: Mesh[] }
```

`presetId` ist ein Schlüssel aus `get-recipes` (Bäume: `eiche fichte birke weide mammut tanne` ·
Strauch: `strauch` · Blume: `blume` · Gras: `gras` · Fels: `findling basalt sediment zacken geroell` ·
Kristall: `kristalle`). `season` ist STATEFUL (`setSeasonColors` setzt den globalen Farb-/Präsenz-
Zustand) — der Empfänger baut in identischer Reihenfolge, um die Zustands-Trajektorie zu teilen.

```
Mesh {
  kind:  string,            // __assetMaterialKind: bark | foliage | foliageTex | grass | stem | schatten | unknown | …
  mat:   { roughness, metalness, flatShading, envMapIntensity, side, alphaTest, hasNormalMap },
  <attr>:{ array:Float32Array, itemSize:int },   // position PFLICHT; normal/uv/color/aWind/aCenter/aType/aDeckt wenn vorhanden
  index?: Uint32Array,
  teil?: "schatten"         // S3: der Wurf der Stufe als eigenes Teil (kind "schatten", Attribut aDeckt)
}
```

**Der Schatten-Teil (S3, 09.10. — das EINE Wurf-Gesetz, `docs/studio-vertrag.md` B2c `wurf`):** die Baum-L1 liefert
ihren Wurf als EIN eigenes Mesh `teil: "schatten"` (kind `schatten`): das Gerüst ab `wurf.durchmesserM` als Dreikant
und die Karten bzw. Strähnen der Krone, je Vertex `aDeckt` (Rinde 1 — deckt ganz; Karte 0 — schneidet mit der
Atlas-Alpha). Der Empfänger zeichnet es NUR in den Schatten-Pässen; es zählt nicht zu den Dreiecken und Draws der
Stufe (phyto-core `budgetSippen`), sondern zu ihrem Wurf (`budgetWurf`). Der Index-Vorsatz `wurf` (W6: die Zahl der
werfenden Dreiecke je Teil) ist gefallen; der Fingerabdruck trägt `teil`.

**Beipack (must-ignore):** Pseudo-Einträge `{ kind: "__…" }` OHNE `position`-Puffer — `__skelett`
(der Gelenk-Baum der Kreatur, `docs/studio-vertrag.md` §8.4) — reisen im selben `meshes`-Array, sind aber KEINE Meshes:
Leser ohne position-Guard überspringen sie, Mint und Gate fingerabdrucken sie nicht (`istBeipack`
in `scripts/lib/asset-worker-harness.cjs` — EINE Regel für beide).

Positionen sind WELT-gebacken (`matrixWorld` appliziert, Baum am Ursprung). KEINE Transferables —
der strukturierte Klon kopiert die Puffer (Transferables neutralisierten geteilte interleaved
ArrayBuffer → Vertex-Korruption). In den Goldens ist jeder Puffer als **byte-exakter Fingerabdruck**
gespeichert (`{ itemSize, bytes, sha256 }` je Attribut) — nicht die Rohdaten (ein L0-Baum trägt
>100k Verts; die volle Serialisierung wäre zweistellige MB je Fall). sha256 macht einen einzigen
abweichenden Byte sicher sichtbar; für den exakten Byte-OFFSET einer Divergenz dient der
P0-Paritäts-Harness (`scripts/diag-foundry-parity.cjs`, voller base64-Byte-Vergleich).

### 2. `get-recipes` → `recipes`

```
REQUEST  { type:"get-recipes", reqId }
REPLY    { type:"recipes", world:"terrain", reqId, book }
```

`book[presetId] = { kind, panel, s:{Regler}, fx:{Material/Form} }` — reine, JSON-klonbare Daten.

### 3. `get-world-params` → `world-params`

```
REPLY    { type:"world-params", world:"terrain", reqId, params:{ ground:{lit,mead,rock,wet}, sky:{top,sun} } }
```

### 4. `get-render-config` → `render-config`

```
REPLY    { type:"render-config", world:"terrain", reqId, config:{ lod:{d0,d1,fade,fade0,hyst,ref,kindStages,budget}, sicht, dichte, understory:{grassStep,flowerStep,bushStep} } }
```

`lod.kindStages` und `lod.budget` sind die Stufen-Wahrheit und das Budget je Art × Stufe (`docs/studio-vertrag.md`
B2/B2c — normativ dort); die drei Daten-Kanäle reisen seit der Synergie-Welle in EINEM Umschlag (`get-book`), ihre
eingefrorenen JSONs bleiben die Byte-Wahrheit der Payloads.

### 5. `ready` (Handshake, ungefragt beim Boot)

```
{ type:"ready", world:"terrain", … (manifest-Extra) }
```

## Außerhalb v1 (kommt in v2 / P5)

- `bake-impostor` / `render-native` — GL-gebunden (der Offscreen-Bäcker); der Wald-Impostor
  wandert in P5 auf den EINEN Haupt-Renderer.
- `enter` / `dsl` / `exit` / `event` — die Portal-UI-Kanäle (das Studio als begehbare Welt).
- Kreatur-/Fahrzeug-Kanäle (`skin` / `sockets` / `judge`) — Vertrag **v2** (P7).

## Das Gate

`golden/` enthält je Fall eine `<preset>-s<seed>-L<lod>-<season>.json` (Meshes mit Puffer-Fingerabdruck
`{itemSize,bytes,sha256}`) + die drei Daten-Kanäle (`recipes.json` / `world-params.json` /
`render-config.json`, volles JSON) + `manifest.json` (sha256 je Datei). `npm run gate:asset-contract`
baut jeden Fall neu, fingerabdruckt die Puffer identisch und vergleicht sha256 + Byte-Länge + prüft
das Schema (cv, Pflichtfelder). Gemünzt mit `scripts/mint-asset-goldens.cjs` (52 Fälle: 6 Bäume ×
Seeds[7,12345] × LODs[0,2] × Saisons[summer,winter] + je 1 findling/kristalle/blume/strauch).

**Re-Mint 30.09.2026 (V18.492, begründet):** nur `recipes.json` (+ Manifest) — die additiven
Juli-Felder (`fx.huelle` der Steine · `fx.fahrprofil.sitz/huelle/zweispur/kamera` der Fahrzeuge)
und `supersport.fx.fahrprofil.lenkung.gripK`, das seither dem Garage-`grip` folgt (6 → 5.1). Alle
52 Mesh-Goldens blieben byte-gleich (vor dem Re-Mint gegen die alten Bytes geprüft).

**Re-Mint 01.10.2026 (V18.501, begründet — das GABEL-GESETZ der Rinde):** `foundry-core` emitTree
setzt die Gelenk-Kugel (1,5 r) nur noch an der Gabel (r_Kind ≥ 0,8 r_Mutter). Ein Kind wächst vom
Segment-Ende auf der Mutter-Achse; ist es deutlich dünner, liegt die Kugel ganz im Mutter-Ast —
unsichtbare Geometrie. Bild-Beweis (CPU-Raster, 7 Arten × Stufen × 1–12-fach Zoom): mittlere
Abweichung 0,0000, höchstens 27 von 536 000 Pixeln. Geändert: nur Mesh 0 (`bark`) der 45 Baum-/
Strauch-Fälle; Laub, findling, kristalle, blume und die drei Daten-Kanäle byte-gleich (gegen die
alten Bytes geprüft). Dreiecke: Strauch L1 69,0k → 44,7k, L2 20,6k → 13,8k · Weide L1 30,8k → 24,1k
· Birke L0 83,6k → 76,8k · Eiche L0 119,4k → 110,7k · Tanne L0 158,2k → 151,4k (seed 1).
Im selben Akt das FUSS-GESETZ der Rinde: die Stammfuß-Ringe (Buttress, auf 0,1·R0 zulaufend)
tragen `fuss`, `phyto-core` buildTubeGesetz liest den Basis-Radius des Strangs darüber. Vorher las
das Gesetz am dicksten Stamm „Zweig" — Zehneck, Furchentiefe 0,28, keine Narben (Mammut Ø 3,7 m:
Sehnenfehler ~9 cm). Jetzt trägt der Stamm seine Furchen (Bild: Sequoia-Fasern). Wieder nur Mesh 0
(`bark`) geändert (49 Fälle), alles andere byte-gleich. Dreiecke: +0,2k (Birke L0) bis +2,4k
(Mammut L0).

**Re-Mint 07.10.2026 (Welle L kreatur, begründet — das SPRUNG-GESETZ):** nur `recipes.json` (+ Manifest), per
`MINT_NUR_DATEN=1` (die drei Daten-Kanäle; world-params und render-config byte-gleich, jede Mesh-Golden unberührt).
Im tetrapoda-Buch (`fx.verhalten` der vier Tier-Rezepte) trägt eine springende Aktion nur noch `hop: true` — die Höhe
ist das Freude-Gesetz (`freude.hopHochM` 1,2 m froh, `hopBasisM` 0,8 m sonst), der Abflug v0 = √(2·g·h) mit dem g des
Gang-Gesetzes (der Wirt: `creatureJump`). Gefallen: der Abflug in m/s der Aktionen (bound 3,2, pounce 4,5 — der frohe
Sprung stieg 0,52 statt 1,2 m) und der lineare Faktor `sprung.impulsProM` (2,2, seit dem Integrator ohne Leser). Genau
12 Felder (3 je Rezept), der Rest des Buchs byte-gleich (gegen die alten Bytes geprüft).
