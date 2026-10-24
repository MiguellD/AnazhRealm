# z13-abab — ABAB 18a84649 gegen 833bbc24: LANGSAMER

GTX 1060, `--echt` 1920×1080, Regler voll, Messplatz-Dienst (zug/messplatz.md). A = 833bbc244711329e2e23305ed857d7e53a47e20e, B = 18a846491377cb9898af2b5bb930234c249fa6ad, Instrument aus B. Je Zelle 2+2, verlängert auf 4+4 nur bei Kern-Anschlag oder einer Größe zwischen 1σ und 2σ. Urteil je Größe Δ ≤ max(2σ gepoolt, Auflösung).

| Zelle | n A+B | Gang | Größe | A | B | Δ B − A | 2σ | Urteil |
|---|---|---|---|---|---|---|---|---|
| w-ego | 4+4 | steht | fps | 77.95 | 74.75 | -3.2 | 3.74 | nicht langsamer |
| w-ego | 4+4 | steht | Frame p95 ms | 16.8 | 16.8 | 0 | 0 | nicht langsamer |
| w-ego | 4+4 | steht | CPU-Takt p95 ms | 3.75 | 3.92 | 0.17 | 0.62 | nicht langsamer |
| w-ego | 4+4 | steht | GPU je Bild ms (gpu-bank) | 12.63 | 13.32 | 0.7 | 1.59 | nicht langsamer |
| w-ego | 4+4 | steht | Belegung p95 ms | 5.42 | 5.64 | 0.22 | 0.89 | nicht langsamer |
| w-ego | 4+4 | geht | fps | 62.72 | 60.08 | -2.65 | 2.85 | nicht langsamer |
| w-ego | 4+4 | geht | Frame p95 ms | 25.08 | 25.1 | 0.02 | 0.07 | nicht langsamer |
| w-ego | 4+4 | geht | CPU-Takt p95 ms | 17.75 | 17.67 | -0.08 | 1.41 | nicht langsamer |
| w-ego | 4+4 | geht | Belegung p95 ms | 21.2 | 21.68 | 0.48 | 1.11 | nicht langsamer |
| w-ego | 4+4 | Zählung | steht Befehle | 38 | 38 | 0 | – | – |
| w-ego | 4+4 | Zählung | steht Dreiecke p95 | 284292 | 263980 | -20312 | – | – |
| w-ego | 4+4 | Zählung | steht VRAM MB | 105.7 | 107.82 | 2.12 | – | – |
| w-ego | 4+4 | Zählung | geht Befehle | 53 | 55 | 2 | – | – |
| w-ego | 4+4 | Zählung | geht Dreiecke p95 | 383724 | 377768 | -5955 | – | – |
| w-ego | 4+4 | Zählung | geht VRAM MB | 109.72 | 111.72 | 2 | – | – |
| **w-ego** | 4+4 | | **Urteil** | | | | | **nicht-langsamer** |
| d-ego | 4+4 | steht | fps | 79 | 76.03 | -2.97 | 0.52 | LANGSAMER |
| d-ego | 4+4 | steht | Frame p95 ms | 16.8 | 16.8 | 0 | 0 | nicht langsamer |
| d-ego | 4+4 | steht | CPU-Takt p95 ms | 4.72 | 4.97 | 0.25 | 0.19 | LANGSAMER |
| d-ego | 4+4 | steht | GPU je Bild ms (gpu-bank) | 12.19 | 12.31 | 0.12 | 0.67 | nicht langsamer |
| d-ego | 4+4 | steht | Belegung p95 ms | 6.37 | 6.67 | 0.3 | 0.26 | LANGSAMER |
| d-ego | 4+4 | Zählung | steht Befehle | 59 | 59 | 0 | – | – |
| d-ego | 4+4 | Zählung | steht Dreiecke p95 | 446433 | 444096 | -2337 | – | – |
| d-ego | 4+4 | Zählung | steht VRAM MB | 109.2 | 112.38 | 3.18 | – | – |
| **d-ego** | 4+4 | | **Urteil** | | | | | **LANGSAMER** |
| stadt | 2+2 | steht | fps | 79.35 | 78.9 | -0.45 | 0.9 | nicht langsamer |
| stadt | 2+2 | steht | Frame p95 ms | 16.8 | 16.8 | 0 | 0 | nicht langsamer |
| stadt | 2+2 | steht | CPU-Takt p95 ms | 6.6 | 6.5 | -0.1 | 0.8 | nicht langsamer |
| stadt | 2+2 | steht | Belegung p95 ms | 9.72 | 9.51 | -0.21 | 0.64 | nicht langsamer |
| stadt | 2+2 | geht | fps | 41.3 | 41.75 | 0.45 | 5.74 | nicht langsamer |
| stadt | 2+2 | geht | Frame p95 ms | 45.8 | 45.75 | -0.05 | 11.67 | nicht langsamer |
| stadt | 2+2 | geht | CPU-Takt p95 ms | 39.65 | 39.15 | -0.5 | 6.19 | nicht langsamer |
| stadt | 2+2 | geht | Belegung p95 ms | 44.78 | 43.14 | -1.64 | 9.02 | nicht langsamer |
| stadt | 2+2 | Zählung | steht Befehle | 44 | 44 | 0 | – | – |
| stadt | 2+2 | Zählung | steht Dreiecke p95 | 1191716 | 1168677 | -23039 | – | – |
| stadt | 2+2 | Zählung | steht VRAM MB | 143.25 | 154.5 | 11.25 | – | – |
| stadt | 2+2 | Zählung | geht Befehle | 74 | 74 | 0 | – | – |
| stadt | 2+2 | Zählung | geht Dreiecke p95 | 1837153 | 1966908 | 129755 | – | – |
| stadt | 2+2 | Zählung | geht VRAM MB | 188.65 | 191.35 | 2.7 | – | – |
| **stadt** | 2+2 | | **Urteil** | | | | | **nicht-langsamer** |

Instrument je Boot: 833bbc244 (d-ego-A1, d-ego-A2, d-ego-A3, d-ego-A4, d-ego-B1, d-ego-B2, d-ego-B3, d-ego-B4, stadt-A1, stadt-A2, stadt-B1, stadt-B2, w-ego-A1, w-ego-A2, w-ego-A3, w-ego-A4, w-ego-B1, w-ego-B2, w-ego-B3, w-ego-B4)

Roh: `bericht/z13-abab/`.

**Täter (OMEN 24.10., Station `omen-z13-takt`, Dorf ego stehend, `werkbank takt 60 --wandern aus`, Regler voll, 2+2, A = 833bbc24 · B = 056330d8, Instrument main; CPU-Takt p95 A 5,7/6,1 · B 6,6/5,8 ms):** größtes Δ je Takt ab p95, jedes in beiden B-Boots über beiden A-Boots — (1) `updateCreatures` +0,20 ms gesamt (A 0,20/0,20 · B 0,47/0,34) `stamm/kreatur-verhalten.js`; darin (2) `_tickKreaturZiegel › _kzLeib` +0,10 ms (A 0,00/0,00 · B 0,10/0,11) `stamm/kreatur-verhalten.js`; darin (3) `_kreaturGliederBacken › _gattungGlieder` +0,09 ms (A 0/0 · B 0,07/0,10) `stamm/studio-bruecke.js` — B backt Glieder im Takt, A nie. Nicht benannt (nur B1): `tickFaunaLifecycle › _creatureNaturalDeath` +0,33. Beide Kreatur-Dateien ändern oeko-bestand-k2 (a0e5617a) und ultiversum-k5-korpus (cbc29030); der Zensus zeigt in B einen anderen Bestand (Fuchs 2/4, zweite Hirsch-Gruppe 1/4 der z13-Boots). Roh: `bericht/omen-z13-takt/delta-je-boot.txt`, `delta-unter-updateCreatures.txt`; Spuren auf der OMEN `p3/n2410/z13/roh/`.
