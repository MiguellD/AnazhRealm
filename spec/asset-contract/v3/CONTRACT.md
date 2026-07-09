# Asset-Vertrag v3 (`cv: 3`) — Fahrzeuge

> **NORMATIV.** Die Naht zwischen dem Fahrzeug-Studio-Kern (`vehicle-core.js`,
> Namensraum `__vehicleCore` — Vertrag v1.1 §7) und jedem Empfänger (Garage-Shell
> heute, AnazhRealm-Foundry-Worker ab W7b). Jeder Produzent, der diesen Vertrag
> spricht, MUSS die eingefrorenen Goldens in `golden/` byte-genau treffen
> (`npm run gate:vehicle-contract`). Die Goldens sind EINGEFROREN
> (Taille-Disziplin) — NIE regenerieren; ein bewusster Re-Mint ist `MINT_FORCE=1`
> und eine eigene Entscheidung mit Begründung.
>
> Eingefroren bei W7a-Grün (Kern-Split garage.js → vehicle-core.js,
> Shell-Verhaltens-Parität 9/9 Schritte hash-identisch vor/nach Split).

## Die Bau-Funktion

```
__vehicleCore.buildInstance(rezeptId, seed, lod, ov?) → THREE.Group | null
```

- `rezeptId` ∈ `gt · supersport · limousine · kompakt_fwd · suv`
  (Schlüssel aus `__vehicleCore.PRESETS`, Namensraum `[a-z0-9_-]+`; jedes Rezept
  trägt `kind:"vehicle"` + `lab` (UI-Wortlaut) + `s` (numerischer Dial-Vektor) +
  `fx` (domänen-eigene Ausstattung: `sig`, `heck`)).
- `seed` (int): **RESERVIERT — cv:3 ist SEED-INVARIANT.** Das Garage-Studio
  trägt keinen stochastischen Term (Math.random lebt nur in der Shell-Deko:
  Reifenrauch/Pylonen); derselbe Bauplan bei seed 7 und 12345 ist byte-gleich.
  Das Gate prüft die Invarianz AKTIV: wer Seed-Variation einführt, bricht die
  Goldens bewusst (Re-Mint-Entscheid, cv-Bump-Frage).
- `lod`: Fahrzeuge tragen NUR Stufe 0 (`PORTAL_RENDER_CONFIG.lod.kindStages =
{ vehicle: [0] }`); jede andere Stufe wird auf 0 geklemmt — L1=L0-Grade und
  L2-Auto-Impostor sind Sache des Wirts (Studio-Vertrag B2/W7b-Merge).
- `ov` (optional): Parameter-Override, gemergt NACH Preset (`{...DEFAULT_P,
...BASE_P, ...s, ...fx, ...ov}`) — der Kultur-Kanal reicht so seine Achsen
  (`__vehicleCore.CULTURES[x].fx`: cEdge/cTension/cStance/cGrille/cLight).
- Ausgang: EINE Group (Baukörper + Haut + Räder, Querschnitt-verjüngt +
  plan-konvex, `updateMatrixWorld(true)` gelaufen). Die Naht sind die
  Float32-Attribute ihrer Meshes (G2.2) — kein Renderer-Objekt nötig.

## Der Fingerabdruck (golden/vehicles.json)

Je Fall `<rezeptId>-s<seed>-L<lod>[-ov_<kultur>]`: `{ objects, vertices, sha256 }`.
sha256 über den kanonischen Byte-Strom in traverse-Reihenfolge — je Objekt mit
Geometrie: Typ · `matrixWorld` (Float64-Bytes) · Material-Signatur (Farbe/
Emissive/roughness/metalness/opacity/transparent) · alle Geometrie-Attribute
(Namen sortiert: itemSize + rohe Puffer-Bytes) · Index-Puffer. Ein einziges
abweichendes Byte kippt den Hash.

Fälle: 5 Gattungen × 2 Seeds (7, 12345) × LOD 0 + 2 ov-Kultur-Fälle
(gt+toro, supersport+cavallo — friert auch die Override-Merge-Semantik ein) = 12.

## Laufzeit des Gates

Node-DIREKT (die v2-creature-contract-Klasse): `global.THREE = require(worlds/
terrain/lib/three-r128.min.js)` (das vendorte UMD lädt in Node), dann
`require(vehicle-core.js)` — kein Browser, keine swiftshader-Fragilität. Der
Selbst-Test (korrumpiertes Golden → rot) beweist bei jedem Lauf, dass die Linse
feuert.
