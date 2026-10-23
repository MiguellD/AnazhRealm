# Bericht 2310 ABAB Zug 6 6579e8f4 gegen 7c6f4b49: nicht langsamer — kontakt-tempo ohne CPU-Term (4+4, Takt-Zerlegung); Stationen M36, Herde, M39, M37 am Kandidaten

GTX 1060, `--echt` 1920×1080, Regler voll.
- **A** = 7c6f4b49 (Zug 5), **B** = 6579e8f4 (V18.546.74 = A + editform-kern-m + ki-regler-m + kontakt-tempo-m + stadt-erwachen-2).
- **Instrument:** die Werkbank aus B; beide Bäume sauber; Schloss, Seiten-Wache und Vorfahrt je Boot.
- **Folge:** 2+2. Verlängert auf 4+4 wurden Wiese Ego, Genesis Third, Fahrt und Stadt: knappe Größen oder ungleiche Fahrten.
- **Urteil je Größe:** Δ ≤ max(2σ gepoolt, Auflösung). Die Tabelle erzeugt der Richter des Messplatz-Dienstes (`p3/messplatz/urteil.cjs`) aus den Roh-Dateien.
- **Fahrt:** Gewertet sind nur volle Fahrten (v50 ≥ 8 m/s). Der Fahrer hing an 5 von 8 Boots, voll fuhren A3, B1 und B2.

## Zellen
| Zelle | n A+B | Gang | Größe | A | B | Δ B − A | 2σ | Urteil |
|---|---|---|---|---|---|---|---|---|
| w-ego | 4+4 | steht | fps | 78.85 | 78.35 | -0.5 | 2.17 | nicht langsamer |
| w-ego | 4+4 | steht | Frame p95 ms | 16.8 | 16.8 | 0 | 0 | nicht langsamer |
| w-ego | 4+4 | steht | CPU-Takt p95 ms | 4.17 | 4.22 | 0.05 | 0.5 | nicht langsamer |
| w-ego | 4+4 | steht | GPU je Bild ms (gpu-bank) | 12.83 | 12.49 | -0.35 | 1.86 | nicht langsamer |
| w-ego | 4+4 | steht | Belegung p95 ms | 5.83 | 5.94 | 0.11 | 0.63 | nicht langsamer |
| w-ego | 4+4 | geht | fps | 61.38 | 61.7 | 0.33 | 1.75 | nicht langsamer |
| w-ego | 4+4 | geht | Frame p95 ms | 25.1 | 25.08 | -0.02 | 0.07 | nicht langsamer |
| w-ego | 4+4 | geht | CPU-Takt p95 ms | 19.1 | 18.82 | -0.28 | 1.49 | nicht langsamer |
| w-ego | 4+4 | geht | Belegung p95 ms | 22.13 | 22 | -0.13 | 1.03 | nicht langsamer |
| w-ego | 4+4 | Zählung | steht Befehle | 38 | 38 | 0 | – | – |
| w-ego | 4+4 | Zählung | steht Dreiecke p95 | 292398 | 291246 | -1152 | – | – |
| w-ego | 4+4 | Zählung | steht VRAM MB | 108.43 | 108.45 | 0.02 | – | – |
| w-ego | 4+4 | Zählung | geht Befehle | 53 | 53 | 0 | – | – |
| w-ego | 4+4 | Zählung | geht Dreiecke p95 | 396491 | 395618 | -873.5 | – | – |
| w-ego | 4+4 | Zählung | geht VRAM MB | 112.1 | 112.15 | 0.05 | – | – |
| **w-ego** | 4+4 | | **Urteil** | | | | | **nicht-langsamer** |
| g-third | 4+4 | steht | fps | 79.92 | 80.15 | 0.22 | 0.66 | nicht langsamer |
| g-third | 4+4 | steht | Frame p95 ms | 16.73 | 16.72 | 0 | 0.1 | nicht langsamer |
| g-third | 4+4 | steht | CPU-Takt p95 ms | 5.88 | 6 | 0.13 | 0.81 | nicht langsamer |
| g-third | 4+4 | steht | GPU je Bild ms (gpu-bank) | 11.51 | 11.15 | -0.37 | 0.86 | nicht langsamer |
| g-third | 4+4 | steht | Belegung p95 ms | 7.6 | 7.64 | 0.04 | 0.94 | nicht langsamer |
| g-third | 4+4 | Zählung | steht Befehle | 78 | 78 | 0 | – | – |
| g-third | 4+4 | Zählung | steht Dreiecke p95 | 357009 | 356932 | -77 | – | – |
| g-third | 4+4 | Zählung | steht VRAM MB | 113.65 | 113.78 | 0.13 | – | – |
| **g-third** | 4+4 | | **Urteil** | | | | | **nicht-langsamer** |
| d-ego | 2+2 | steht | fps | 78.1 | 78.05 | -0.05 | 0.73 | nicht langsamer |
| d-ego | 2+2 | steht | Frame p95 ms | 16.8 | 16.8 | 0 | 0 | nicht langsamer |
| d-ego | 2+2 | steht | CPU-Takt p95 ms | 5.3 | 5.35 | 0.05 | 0.22 | nicht langsamer |
| d-ego | 2+2 | steht | GPU je Bild ms (gpu-bank) | 12.39 | 12.18 | -0.2 | 0.19 | nicht langsamer |
| d-ego | 2+2 | steht | Belegung p95 ms | 7.2 | 7.1 | -0.1 | 0.16 | nicht langsamer |
| d-ego | 2+2 | Zählung | steht Befehle | 57 | 57 | 0 | – | – |
| d-ego | 2+2 | Zählung | steht Dreiecke p95 | 454812 | 455092 | 280 | – | – |
| d-ego | 2+2 | Zählung | steht VRAM MB | 114.75 | 114.05 | -0.7 | – | – |
| **d-ego** | 2+2 | | **Urteil** | | | | | **nicht-langsamer** |
| stadt | 4+4 | steht | fps | 79.05 | 79.07 | 0.02 | 1.31 | nicht langsamer |
| stadt | 4+4 | steht | Frame p95 ms | 16.77 | 16.75 | -0.02 | 0.11 | nicht langsamer |
| stadt | 4+4 | steht | CPU-Takt p95 ms | 6.53 | 6.97 | 0.45 | 1.8 | nicht langsamer |
| stadt | 4+4 | steht | Belegung p95 ms | 9.67 | 10.25 | 0.59 | 2.6 | nicht langsamer |
| stadt | 4+4 | geht | fps | 40.27 | 38.6 | -1.67 | 7.51 | nicht langsamer |
| stadt | 4+4 | geht | Frame p95 ms | 49.93 | 50.02 | 0.1 | 9.64 | nicht langsamer |
| stadt | 4+4 | geht | CPU-Takt p95 ms | 41.45 | 44.5 | 3.05 | 11.43 | nicht langsamer |
| stadt | 4+4 | geht | Belegung p95 ms | 46.32 | 50.3 | 3.98 | 11.72 | nicht langsamer |
| stadt | 4+4 | Zählung | steht Befehle | 43 | 43 | 0 | – | – |
| stadt | 4+4 | Zählung | steht Dreiecke p95 | 1188919 | 1189404 | 484.5 | – | – |
| stadt | 4+4 | Zählung | steht VRAM MB | 145.98 | 146.13 | 0.15 | – | – |
| stadt | 4+4 | Zählung | geht Befehle | 71 | 71 | 0 | – | – |
| stadt | 4+4 | Zählung | geht Dreiecke p95 | 1840261 | 1846528 | 6267 | – | – |
| stadt | 4+4 | Zählung | geht VRAM MB | 184.75 | 186.47 | 1.72 | – | – |
| **stadt** | 4+4 | | **Urteil** | | | | | **nicht-langsamer** |
| fahrt | 4+4 | volle Fahrt | fps | 49.8 | 50.7 | 0.9 | 2.42 | nicht langsamer |
| fahrt | 4+4 | volle Fahrt | Frame p95 | 33.4 | 33.35 | -0.05 | 0.17 | nicht langsamer |
| fahrt | 4+4 | volle Fahrt | Frame p99 | 58.3 | 50 | -8.3 | 0 | nicht langsamer |
| fahrt | 4+4 | volle Fahrt | CPU-Takt p95 | 31.7 | 29.95 | -1.75 | 2.25 | nicht langsamer |
| fahrt | 4+4 | volle Fahrt | Belegung p95 | 33.71 | 32.5 | -1.21 | 1.07 | nicht langsamer |
| fahrt | 4+4 | Zählung | Befehle | 60.75 | 61 | 0.25 | – | – |
| fahrt | 4+4 | Zählung | Dreiecke p95 | 434220 | 456147 | 21928 | – | – |
| fahrt | 4+4 | Zählung | VRAM MB | 118.88 | 116.92 | -1.95 | – | – |
| fahrt | – | volle Fahrten | A3 B1 B2 | | | | | |
| **fahrt** | 4+4 | | **Urteil** | | | | | **nicht-langsamer** |

- **Der CPU-Verdacht kontakt-tempo fällt.**
  - Nach 2+2 lagen Wiese gehend (CPU-Takt p95 +0,4) und Genesis Third (+0,3) über 2σ. Bei 4+4 ist beides gleich (19,1 → 18,8; 5,9 → 6,0).
  - Die Takt-Zerlegung (`werkbank takt 30 --wandern bahn`, 2+2, `takt/`) nennt in den Spitzen-Takten keinen Posten von kontakt-tempo ≥ 0,25 ms, weder `_leibPaar` noch `_leibGegenLeiber`.
  - Die Spitze p95 (A 25,6/30,4, B 26,5/33,7 ms) trägt das Voxel-Streaming (`_dispatchFrameJobs`, `_tickVoxelChunkStreaming`); es streut schon zwischen den A-Boots um 4,8 ms.
- **Stadt gehend:** Nach 2+2 war B bimodal (B1 CPU-Takt p95 56, B2 37,9). Bei 4+4 liegen B3/B4 mit 43,2/40,9 bei A3/A4 mit 43,4/41,3. B1 ist ein einzelner Ausreißer.

## Stationen am Kandidaten 6579e8f4 (GTX)
- **siedlung.K5 M36**, `m36/`, 4 Boots nH 12/300/12/300:

  | nH | im Sichtradius | gezeichnet | Latenz ab Sichtradius | längstes Bild nach dem Erwachen · Bilder > 33 ms | Bau-Hash |
  |---|---|---|---|---|---|
  | 300 | 0,50 / 0,13 s | **0,85 / 0,64 s** | 351 / 511 ms | 141,5 / 141,7 ms · 36 / 39 | ed9b6932 2/2 |
  | 12 | 33,1 / 33,4 s | 33,3 / 33,6 s | 160 / 178 ms | 91,7 / 116,8 ms · 9 / 11 | f5558d2c 2/2 |

  ROT gegen 0,5 s ab dem Erwachen (nH 300); der Bau-Hash ist gleich. Zug 2 brauchte 4,7 s, die Radeon misst 0,40 s.
- **tiere.K1 Herde** (`herde/`, `diag-kreatur-takt --proben herde --werkbank`): GRÜN. Kohäsion beim Wandern 1,0, auf der Flucht im Mittel 0,98, mindestens 0,80.
- **profiband.K4 M39** (`m39/`, Regler frei): 3 von 4 ohne Frame > 100 ms (b4 ein GC-Frame mit 108 ms). Hält.
- **speicher.K1 M37** (`m37/`, `m37-fest/`, die Probe der Station 65118aae mit den Lese-Haken 042f681a):
  - 20 Tode, 0 korrupt, 0 Blöcke und 0 Edits verloren (Edits bis 131, Baufehler 0); saveState je Bild p95 0.
  - Ein Tod hat kein Alter am lebenden Stand (z9). Das Laden las den fest-Stand 0,002 s vor dem Tod, die lebende Lage lag 25 mm daneben. Das ist kontakt-tempo, kein ungesehener Schreiber.
  - Mit dem Alter am gelesenen Stand (Station 042f681a) ist das Alter höchstens 4,7 s.
  - Zusatz fest: Tod am festen Schreiben eines saveState mitten im Gang des Erwachens (Zelle 0,0, nH 17). Alter 0,005 s, Zelle reserviert, 34 Häuser, nach 10 s gleich. Hält.
  - Der erste M37-Lauf (vor carveVoxel) prüfte keine Edits und zählt nicht.

## Urteil
**nicht langsamer.** Zeile in `zug/abab.txt`: `6579e8f409c5234276210ace7e19798e63ad423c nicht-langsamer 2310-abab-zug6`.

Roh: `bericht/2310-abab-zug6/` (gehen, fahrt, takt ohne roh.json, m36, herde, m39, m37, m37-fest, Skripte, urteil.json); OMEN `p3/n2210/zug6/`, `p3/n2310/ms/`.

**Status ZWISCHENSTAND + Übergabe:**
- Zug 6 gemessen, die Zeile steht; gelandet wird, wenn echt grün ist.
- Offen benannt: M36 nH 300 gezeichnet 0,64–0,85 s > 0,5 s an der GTX.
- Ab jetzt fährt der Messplatz-Dienst `p3/messplatz.sh` die Warteschlange, zuerst `z6-punkte`.
