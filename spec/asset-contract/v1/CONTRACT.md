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
  kind:  string,            // __assetMaterialKind: bark | barkBirch | foliage | foliageTex | grass | rock | crystal | flower | …
  mat:   { roughness, metalness, flatShading, envMapIntensity, side, alphaTest, hasNormalMap },
  <attr>:{ array:Float32Array, itemSize:int },   // position PFLICHT; normal/uv/color/aWind/aCenter/aType wenn vorhanden
  index?: Uint32Array
}
```

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
REPLY    { type:"render-config", world:"terrain", reqId, config:{ lod:{d0,d1,fade,fade0,hyst,ref}, sicht, dichte, understory:{grassStep,flowerStep,bushStep} } }
```

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
