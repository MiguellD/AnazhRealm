# z100c-abab — ABAB ec989990 gegen 94c079cb: nicht-langsamer

GTX 1060, `--echt` 1920×1080, Regler voll, Messplatz-Dienst (zug/messplatz.md). A = 94c079cb714239d8f146ac3185295b0b220d8602, B = ec989990fe86c70b1ac00f06fa657f1a5a33afd7, Instrument aus B. Je Zelle 2+2, verlängert auf 4+4 nur bei Kern-Anschlag oder einer Größe zwischen 1σ und 2σ. Urteil je Größe Δ ≤ max(2σ gepoolt, Auflösung).

| Zelle | n A+B | Gang | Größe | A | B | Δ B − A | 2σ | Urteil |
|---|---|---|---|---|---|---|---|---|
| stadt | 4+4 | steht | fps | 67.77 | 66.8 | -0.97 | 1.27 | nicht langsamer |
| stadt | 4+4 | steht | Frame p95 ms | 24.98 | 25 | 0.02 | 0.07 | nicht langsamer |
| stadt | 4+4 | steht | CPU-Takt p95 ms | 10.95 | 11.03 | 0.07 | 0.75 | nicht langsamer |
| stadt | 4+4 | steht | Belegung p95 ms | 17.33 | 17.74 | 0.41 | 1.41 | nicht langsamer |
| stadt | 4+4 | geht | fps | 33.4 | 35.08 | 1.68 | 1.62 | nicht langsamer |
| stadt | 4+4 | geht | Frame p95 ms | 58.3 | 58.22 | -0.08 | 0.14 | nicht langsamer |
| stadt | 4+4 | geht | CPU-Takt p95 ms | 49.88 | 46.25 | -3.63 | 3.07 | nicht langsamer |
| stadt | 4+4 | geht | Belegung p95 ms | 59.1 | 52.79 | -6.3 | 1.99 | nicht langsamer |
| stadt | 4+4 | Zählung | steht Befehle | 61.5 | 61.75 | 0.25 | – | – |
| stadt | 4+4 | Zählung | steht Dreiecke p95 | 1302091 | 1294190 | -7901 | – | – |
| stadt | 4+4 | Zählung | steht VRAM MB | 188.88 | 187.92 | -0.95 | – | – |
| stadt | 4+4 | Zählung | geht Befehle | 92.25 | 92.5 | 0.25 | – | – |
| stadt | 4+4 | Zählung | geht Dreiecke p95 | 1420463 | 1419865 | -598 | – | – |
| stadt | 4+4 | Zählung | geht VRAM MB | 185.55 | 227.57 | 42.02 | – | – |
| **stadt** | 4+4 | | **Urteil** | | | | | **nicht-langsamer** |
| w-ego | 4+4 | steht | fps | 66.47 | 66.28 | -0.2 | 1.29 | nicht langsamer |
| w-ego | 4+4 | steht | Frame p95 ms | 16.8 | 16.8 | 0 | 0 | nicht langsamer |
| w-ego | 4+4 | steht | CPU-Takt p95 ms | 5.43 | 5.92 | 0.5 | 0.54 | nicht langsamer (1σ–2σ) |
| w-ego | 4+4 | steht | GPU je Bild ms (gpu-bank) | 14.55 | 14.54 | -0.01 | 0.33 | nicht langsamer |
| w-ego | 4+4 | steht | Belegung p95 ms | 7.97 | 8.7 | 0.72 | 0.77 | nicht langsamer |
| w-ego | 4+4 | geht | fps | 55.75 | 54.73 | -1.02 | 3.36 | nicht langsamer |
| w-ego | 4+4 | geht | Frame p95 ms | 25.1 | 25.15 | 0.05 | 0.14 | nicht langsamer |
| w-ego | 4+4 | geht | CPU-Takt p95 ms | 18.28 | 19.27 | 1 | 3.48 | nicht langsamer |
| w-ego | 4+4 | geht | Belegung p95 ms | 22.77 | 23.16 | 0.38 | 2.24 | nicht langsamer |
| w-ego | 4+4 | Zählung | steht Befehle | 41 | 41 | 0 | – | – |
| w-ego | 4+4 | Zählung | steht Dreiecke p95 | 261229 | 261929 | 699.5 | – | – |
| w-ego | 4+4 | Zählung | steht VRAM MB | 117.62 | 117.6 | -0.02 | – | – |
| w-ego | 4+4 | Zählung | geht Befehle | 58 | 58 | 0 | – | – |
| w-ego | 4+4 | Zählung | geht Dreiecke p95 | 379952 | 389892 | 9940 | – | – |
| w-ego | 4+4 | Zählung | geht VRAM MB | 122.15 | 122.22 | 0.08 | – | – |
| **w-ego** | 4+4 | | **Urteil** | | | | | **nicht-langsamer** |

Instrument je Boot: 94c079cb7 (stadt-A1, stadt-A2, stadt-A3, stadt-A4, stadt-B1, stadt-B2, stadt-B3, stadt-B4, w-ego-A1, w-ego-A2, w-ego-A3, w-ego-A4, w-ego-B1, w-ego-B2, w-ego-B3, w-ego-B4)

Roh: `bericht/z100c-abab/`.
