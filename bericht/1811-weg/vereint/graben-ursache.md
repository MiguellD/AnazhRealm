# Warum im Bild kein Graben steht — die Messung (ZWISCHENSTAND, OMEN GTX 1060, 18.11. 15:50, main ee5c80d4)

Werkbank `--ort genesis`, Ort-Takt vom Treiber gerufen, Schnitt quer über den Graben Süd bei x 200,27 (Plan-Mitte) und
x 205,27, alle 0,25 m. Rohes `graben-ursache.json`, Sonde `ursache-sonde.js`. (Ein CI-Job verdrängte den Lauf nach der Sonde;
ihre Zahlen stehen im Lauf-Log, die Bilder dieser Runde fehlen — die Bilder der Runde davor liegen hier.)

## 1. Fünf Punkte: Höhen-Funktion gegen gezeichnetes Netz

| Punkt (z) | `_voxelSurfaceY` | gezeichnet (Strahl gegen `voxelChunk:4,-4:lod0`) | `_bodenSichtAt` | Differenz |
|---|---|---|---|---|
| Erd-Insel (−159,04) | 51,55 | 51,53 | 51,53 | −0,02 |
| Kante innen (−156,54) | 51,55 ↓ 49,55 | 51,05 | 51,05 | Stufe 2,00 m → Hang |
| Sohle Mitte (−155,04) | 49,55 | 50,16 (tiefster Punkt 50,12 bei −154,54) | 50,16 | +0,61 |
| Kante außen (−153,54) | 49,55 ↑ 51,55 | 50,76 | 50,76 | Stufe 2,00 m → Hang |
| Platte außen (−152,79) | 51,55 | 51,02 | 51,02 | −0,53 |

Gezeichnet steht eine Mulde: 1,41 m unter der Insel, 0,98 m unter dem äußeren Rand, rund 5 m breit; die innere Flanke fällt
1,21 m auf 2,25 m (28°), die äußere steigt 0,64 m auf 1,0 m (33°). Der zweite Schnitt (x 205,27) trägt dieselben Zahlen auf
±0,06 m. Der Strahl durchs Dichtefeld (`_fieldRaycast`) folgt der Funktion (49,55), nicht dem Netz.

## 2. Welches Netz, welches Raster

Der Voxel-Chunk selbst (Surface Nets, kein Höhenfeld-Netz, keine Fern-Kachel): Eintrag `voxelChunk:4,-4:lod0`, 3326 Ecken,
**Stufe 0 = Schritt 1,8 m** (dim 24, Spanne 43,2 m; gemessen am Eintrag, Gesetz `_voxelChunkConfig`
stamm/gelaende-boden.js:2740; Stufe 1 = 3,6 m · 2 = 7,2 m · 3 = 14,4 m). Abtaster: `_voxelEditedDensityGrid`
(stamm/gelaende-boden.js:1499) → `G.dichteGitter` (gelaende-core.js:7237–7258), im Worker voxel-worker.js:1652; danach EIN
Laplace-Durchgang über die Ecken (`_voxelLaplacianSmoothPositions`, stamm/gelaende-boden.js:1664). Die Abtaster-Stellen nennt
ein Leser; an der Quelle selbst geprüft habe ich :2740 und :1664.

## 3. Die Wurzel in einem Satz

**Das Raster ist zu grob: das Band des Grabens ist 3,0 m breit, das Netz tastet alle 1,8 m ab — es fallen 1 bis 2 Spalten in
die Sohle, das Netz legt zwischen Platte und Sohle Rampen über je eine Zelle und glättet einmal: 1,41 m von 2,00 m Tiefe,
28–33° statt 90°.**

Ausgeschlossen:
- **Zwilling der Höhen-Quelle** — gelesen (Leser): Haupt-Faden, Worker und `_voxelSurfaceY` rechnen über dieselbe Kette
  `hoehe` / `erdbauY` (gelaende-core.js:2819–2833); gemessen: die Mulde liegt auf der Achse des Bands und ihre Insel auf
  51,53 — das Netz kennt den Erdbau.
- **Graben nach dem Netz-Bau, Netz nie neu** — gemessen: OHNE Ort-Takt zeichnete derselbe Ort keinen Abtrag (Bild
  `graben-OHNE-ort-takt-entlang`), MIT ihm steht die Mulde im Netz; `worldMeta.erdbau` trägt `genesis:2032166845:0,0:680d5a78`.
  Der Neubau läuft.

Daneben gesehen, nicht verfolgt: 1 m südlich des Grabens endet die Platte in der Funktion (51,55 → 50,30 bei z −152,29, dann
Hang aufwärts), das Netz zeichnet dort 51,17 — dieselbe Klasse (eine 1 m breite Rippe unter dem Raster).

## Zur Frage „steht der Ort im echten Spiel-Pfad?“

Aus meinen Läufen NICHT beantwortbar: alle fuhren auf der Werkbank. Dort blieb `genesisOrt.steht` false — ohne Ort-Takt
(180 s, 55 s `/lauf`) und mit vom Treiber gerufenem `_genesisOrt` (115 s, 16 Werke, keine Absage). Die Ankunft ohne Werkbank
habe ich nicht gefahren.

## Nachtrag 16:12 — die Ankunft OHNE Werkbank (main 1857c808, ZWISCHENSTAND)

Echter Spiel-Pfad: save-server, Fenster am Hardware-Adapter, Seite frisch geladen, kein Stand auf der Platte, kein Werkzeug in
der Seite; 1×/s gelesen (`ankunft-echt.cjs`, Rohes `ankunft-echt.json`). **`worldMeta.genesisOrt.steht` wird wahr: JA, 3,4 s
nach dem Laden der Seite** (2,2 s nach dem Welt-Objekt, im ersten Ort-Takt; Schlüssel `genesis:2032166845:0,0:680d5a78`, Welt
`klare-weiher`, Spieler an (0 | 91 | 0)). Fund 2 trifft damit das Werkzeug, nicht den Spieler. Nicht getrennt: ob in der
Werkbank der fehlende Ort-Takt allein oder mein Stand 200 m vor der Mitte (die Tore dort nicht fällig) `steht` falsch hielt.
Ein Lauf, 9 s lang; Werke und Bild der Ankunft habe ich in diesem Lauf nicht gezählt.
