# Abnahme Analog D

> Pflicht D: CODE ZU / BILD OFFEN. Die Tiefen-Funktion steht im Boden-Shading;
> die Zeile fällt erst mit sichtbarer Gras-Zone im Bild (Armlänge + Fern).

## Ist-Karte

| Pfad | Status |
|------|--------|
| `_terrainGeologyAlbedo` → Meadow-Grund (`_meadowW` × `MEADOW_GREEN`) | **steht** — flach+grün, ≈0 Perf |
| DIE WIESE MIT TIEFE (8-Schicht Parallax-Relief-March, Büschel-Maske 2.7/m, Halm-Freq 9/m) | **steht** — nah ≤90 m (`_nah`), gated `_green×_flat×¬rock×¬dry` |
| Wire in Terrain-`colorNode` (`_terrainGeologyAlbedo` → `_substanceCharacter`) | **steht** |
| Halm-GEOMETRIE (`_buildVoxelChunkGrass` InstancedMesh/Kegel) | **tot absichtlich** — registriert `null`; Lifecycle (Cull/LOD/pendingGrass) bleibt byte-konsistent |
| `_grassInstanceMat` / Wind / Bend / Saison | **Rest / Hybrid** — Material noch da; kein Mesh mehr im Chunk-Pfad |
| Beweis-Bild Gras-Zone | **OFFEN** |

## Code (trägt)

1. Gras = Oberflächen-Funktion, nicht Dreiecke: Parallax-Höhenfeld im Fragment (`mx_noise` + 8 Schichten), Kontrast Wurzel 0.35 ↔ Spitze 1.30, Mix 0.95 wo die Gewichte Wiese sagen.
2. Fern: Meadow-Grund allein (Halme wären sub-pixel); nah: Relief + Büschel.
3. EINE Farbe `MEADOW_GREEN` (Gesetz #0 mit alter Halm-Wurzel / Studio-`cMead`).
4. Absenz: `voxelChunkGrass` → null je Chunk; HUD/Abnahme: 0 Gras-Instanzen / 0 Gras-Tris (Drehbuch Schritt 2).

## Lücke bis D-Schließung

1. **Echte Gras-Zone im Bild** — Spawn-Default `(0, 50, 0)` ist keine Garantie für flach+grün. Bekannte Mess-Koordinate (24.07., „grüner SAMT"): **−900 / −850**. Sonst: Suche weiter draußen (flach, `_green` hoch, wenig Fels) oder Schöpfer-Koordinate.
2. Sonde: nah (Armlänge) Halm-Schattierung/Parallaxe lesbar; fern Meadow-Grund; Konsole 0 Gras-Meshes.
3. Beweis E: Bild-Paar vorher↔nachher derselben Sonde (mit A/B/C-Paket).

## Was kein kleiner Fix ist (fail-closed)

- Spawn nach −900/−850 verschieben → Spiel-Scope.
- `_green`/`_flat`-Gates aufweichen → Geologie/Fels bricht.
- Halm-Geometrie wieder einschalten → widerspricht Betriebsgesetz (Gras = Funktion).
- B/C Grammatik-Primitive (Kegel/Ellipsoid/Prism) anfassen → anderer Pfad.

## Abnahme (Michael)

1. Teleport / Flug zu Gras-Zone (z. B. −900/−850) oder gefundene flache Wiese.
2. Nah: Boden liest als Wiese mit Tiefe (Büschel/Parallaxe), nicht als glatter einfarbiger Patch.
3. Fern: Meadow-Grund; keine Halm-Tris.
4. Absenz: `voxelChunkGrass`-Werte null; keine Instanced-Gras-Draws.

Gates: `node --check anazhRealm.js` · `gate:betriebsgesetz` · Drehbuch Schritt 2

## Sonde 09.09. −900/−850
- Datei: `AnazhRealm-denken/analog-d-wiese-nah.png`
- Position X=-900 Z=-850, sunny/noon — Boden liest als grüne Wiese mit Parallax-Tiefe.
