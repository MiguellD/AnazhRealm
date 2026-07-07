# Asset-Vertrag v2 (`cv: 2`) — die erste Nicht-Pflanzen-Asset-Klasse: KREATUREN

> **NORMATIV.** Die Erweiterung des Asset-Vertrags (v1 = Pflanzen, `../v1/CONTRACT.md`) auf die
> erste Nicht-Pflanzen-Asset-Klasse: die **Kreatur-Haut** (Skin-Isosurface). Die Naht ist
> `bake-core.js` (`__bakeSkinGeometry(parts, opts)`) — die THREE-freie, deterministische
> Skin-Mathematik, die der Main-Thread (headless-sync) UND der `bake-worker.js` (off-thread) lesen
> (EINE Quelle, Gesetz #0). Jeder Produzent MUSS die eingefrorenen Goldens in `golden/` byte-genau
> treffen (`npm run gate:creature-contract`). Die Fixtures + Goldens sind EINGEFROREN — NIE blind
> regenerieren; ein bewusster Re-Mint ist `MINT_FORCE=1` mit Begründung.

## Warum ein Node-Gate (kein Browser)

Anders als der Pflanzen-Generator (`phytogenesis.js` braucht THREE → Worker/iframe) ist die
Skin-Isosurface **THREE-frei**: `bakeSkinGeometry(parts, opts)` nimmt reine Daten und gibt reine
typisierte Arrays zurück. Das Gate lädt `bake-core.js` DIREKT in Node (`require` → der IIFE-
Seiteneffekt setzt `globalThis.__bakeSkinGeometry`, wie phyto-core im Parity-Gate) und bäckt jede
FROZEN Spec neu — kein Renderer, keine swiftshader-Fragilität. Ein Drift in der Isosurface-/smin-/
Displace-/Taubin-Mathematik fliegt byte-genau auf.

## Der Kanal: `skin`

```
bakeSkinGeometry(parts: Part[], opts) -> { positions:Float32Array, normals:Float32Array, colors:Float32Array, indices:Uint32Array }
```

### `Part` (die Spec eines Körper-Teils)

```
Part {
  position: { x, y, z },          // PFLICHT — die Ellipsoid-/Kapsel-Mitte
  size:     { x, y, z },          // PFLICHT — die Halbachsen SIND die Körper-Masse (anisotropes Ellipsoid)
  rotation?:{ x, y, z },          // Euler XYZ; gesetzt -> getaperte Round-Cone-Kapsel statt achsen-Ellipsoid
  kScale?:  number,               // smin-Blendschärfe an der Naht (Landmark-Kante), Floor ~0.04
  def?:     bool,                 // Deformation aktiv
  disp?:    bool, amp?, reach?,   // Displacement (nach aussen geschobene Iso -> dispCap im Margin)
  material?: any,                 // Material-Hint (Farbe)
  feature?: bool                  // true -> NICHT umhüllt (Augen/Ohren)
}
```

### `opts` — der KANONISCHE Contract-Satz

```
{ res: 48 }   // feste Auflösung (schneller als das Live-96, aber die volle Isosurface-/smin-/Taubin-Mathematik läuft);
              // der Rest sind bake-core-Defaults. Ein Opts-Wechsel ist ein bewusster Re-Mint.
```

Die Live-Auflösung (`AVATAR_SKIN_RES=96`, headless-Cap 64) ist ein Tunable; der Vertrag friert eine
kleinere, schnelle Auflösung ein, weil er die **Mathematik** bewacht, nicht den Live-Look (der ist
das Schöpfer-Auge). Die räumliche Akzeleration (`accelL`/`accelNC`) ist byte-identisch zum Brute-
Pfad (`diag-bake-bench`) → sie ändert den Fingerabdruck nicht.

## Die Fixtures (FROZEN)

`fixtures/skin-fixtures.json` (`{ cv:2, specs:[{ id, kind:"skin", parts:Part[] }] }`) — reale Specs,
EINMALIG aus der gebooteten Welt gezogen (`MINT_FORCE=1`): der **Avatar** (`_humanoidSkeleton`) + die
ersten **Kreatur-Seelen** (`CREATURE_SOULS[k].bodyParts`, alphabetisch). Die Capture-Determinismus
ist irrelevant (die Fixture ist eingefroren) — nur `bakeSkinGeometry(frozen_parts, opts)` muss
deterministisch sein (ist es).

## Das Gate

`golden/<id>.json` (`{ cv:2, id, kind, opts, skin:{ positions, normals, colors, index, vertexCount } }`,
jedes Attribut `{ itemSize, bytes, sha256 }`) + `manifest.json` (sha256 je Golden-Datei).
`npm run gate:creature-contract` bäckt jede FROZEN Spec neu, fingerabdruckt byte-identisch und
vergleicht sha256 + Byte-Länge + prüft das Schema (cv:2, Pflicht-Fingerprints).

## Außerhalb v2-Skin (kommt später)

- `sockets` — die Anschluss-Punkte (Ausrüstung/Reiter/Attachment am Skelett).
- `judge` — das Ω-PHYSIS-Verdikt (Schwerpunkt · Stützpolygon · Stat-Ableitung aus der Form).
- Fahrzeug-Assets — dieselbe Naht, andere Spec-Quelle.

Diese docken als eigene v2-Kanäle an, wenn ihr Thema dran ist — der Skin ist der Kern (die Geometrie),
den die anderen annotieren.
