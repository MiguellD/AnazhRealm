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

**Re-Mint 08.10.2026 (Welle LF rudel, begründet — DAS TEMPERAMENT DER GATTUNG):** nur `recipes.json` (+ Manifest), per
`MINT_NUR_DATEN=1` (world-params und render-config byte-gleich, jede Mesh-Golden unberührt, gate:asset-contract 124 von
124 byte-gleich). Im tetrapoda-Buch (`fx.verhalten` der vier Tier-Rezepte) kommt das Temperament aus Ernährung und Masse
der Gattung (`temperament.gattung { fleischDiet pflanzDiet jagdMasse wehrMasse kolossMasse }`, Funktion
`temperamentDerGattung`), die Natur der Wariness aus dem Mut des Temperaments (`furcht.mutGewicht`). Gefallen: die
Substanz-`signaturen` und ihr `floor`, die Substanz-Gewichte `furcht.boldFromDichte/boldFromHärte/shyFromLebendig` — die
Tiere sind tag-gleich (Lehre 8), Hirsch und Fuchs waren „wehrhaft", jeder Hirsch stand neugierig am Spieler (Leben-Schau
07.10., D16/K-D12). Genau 28 Felder (7 je Rezept), der Rest des Buchs byte-gleich (gegen die alten Bytes geprüft);
recipes.json `7a35306b727b…` → `622864e73bb6…`.

**Re-Mint 08.10.2026 (Welle LF rudel, begründet — DER PERSÖNLICHE RAUM):** nur `recipes.json` (+ Manifest), per
`MINT_NUR_DATEN=1` (world-params, render-config und jede Mesh-Golden byte-gleich). Im tetrapoda-Buch hält jeder Leib seinen
Raum aus seiner Körper-Kugel (`separation.raumKugel` × halb + Radius des Leibs, Art und Größe), die Herde zieht nur
jenseits des Paar-Raums (`herde.fensterRaum`, der Zug ist das Mittel × Tempo), die Neugier hält am Paar-Raum mit dem Spieler.
Gefallen: der feste Paar-Radius `separation.radiusBaseM` (1,6 m × bodySize für jede Art), `herde.minAbstSq`/`fensterSq`
und `furcht.neugierStoppM` — die neugierige Schar kroch auf 0,7 m zusammen und durchdrang sich und den Spieler (Leben-Schau
07.10.). Genau 24 Felder (6 je Rezept), der Rest byte-gleich (gegen die alten Bytes geprüft); recipes.json
`622864e73bb6…` → `0d8f4316502b…`.

**Re-Mint 08.10.2026 (Welle LF rudel, begründet — DIE JAGD SCHLIESST SICH):** nur `recipes.json` (+ Manifest), per
`MINT_NUR_DATEN=1` (world-params, render-config und jede Mesh-Golden byte-gleich). Im tetrapoda-Buch pirscht der Jäger
unbemerkt bis `jagd.pirschSichtM`, das Rudel bezieht den Ring `jagd.hetzM` um das Ziel (die Flanke) und hetzt im Sprint der
Gestalt (STEUER_GESETZ.sprint, kein Rezept-Feld), Beute trägt höchstens `jagd.beuteMasse` × die Masse des Jägers. Gefallen:
`jagd.scentProbeM` (der Gradienten-Schritt der Witterung — nah an der Quelle zeigte der Gradient vom Ziel fort) und
`furcht.fleeSpeedBoost` (die Flucht ist der Sprint, kein Trab). Genau 20 Felder (5 je Rezept), der Rest byte-gleich
(gegen die alten Bytes geprüft); recipes.json `0d8f4316502b…` → `bdd842174cdd…`.

**Re-Mint 08.10.2026 (Welle LF rudel auf V18.536, begründet — DIE EINE MASSE):** nur `recipes.json` (+ Manifest), per
`MINT_NUR_DATEN=1` gegen die vereinten Kerne (world-params, render-config und jede Mesh-Golden byte-gleich). Die
Vereinigung mit V18.536 trug zwei Massen: die Dial-Masse des Zweigs (size × Größe) und die Masse des Leibs aus main
(Volumen der Gestalt × `MASSSTAB.dichteKgM3`, das Impuls-Gesetz). Es bleibt die Masse des Leibs: im tetrapoda-Buch liest
das Temperament kg (`temperament.gattung { jagdKg 21,5 · wehrKg 200 · kolossKg 600 }` statt `jagdMasse · wehrMasse ·
kolossMasse`), `jagd.beuteMasse` 1,25 → 2,0 (× die Masse des Jägers in kg: der Wolf, 64 kg, schlägt den Hirsch, 94 kg, nie
den Bären, 335 kg). Gegen den Zweig genau 28 Felder (7 je Rezept) plus die 5 Fahrzeug-Felder `fahrprofil.huelle.dichte`
aus main; gegen main genau die 72 Felder der Welle-LF-Vertrags-Akte (18 je Rezept), der Rest byte-gleich (gegen beide
alten Bytes geprüft).

**Re-Mint 09.10.2026 (Leben-Schau 2 koerper-bild, begründet — DIE HÜLLE JE GESTALT):** nur `recipes.json` (+ Manifest), per
`MINT_NUR_DATEN=1` (world-params, render-config und alle 124 Mesh-Goldens byte-gleich, `gate:asset-contract` vor dem
Re-Mint: 124 von 124). Die Fels-Rezepte trugen EINE Kollisions-Hülle je Art (`fx.huelle {rx, rz, y1}`, gemessen über
4 Varianten); das Studio zeichnet 16 Gestalten (Geröll 1), der Felsturm stieß als Eisen-Mast. Jetzt `fx.huellen`: je
Gestalt 1..V die Hülle ihrer LOD-0-Gestalt im Vorlagen-Raum `[x0, x1, y1, z0, z1]` (+5 %), der Welt-Blocker liest die
Zeile seiner Gestalt in der Welt-Skala (`gate:kollision-bild`: Felsturm 16,46 → 0,05 m über dem Bild). Genau 12 Felder
(je Fels-Rezept `huelle` fort, `huellen` neu), der Rest byte-gleich; die Gestalt liest die Hülle nie.
