# Bericht 2310 ABAB Zug 5 7c6f4b49 gegen main 452972a6: nicht langsamer — gpu-bank Wiese 12,50 → 12,06, Dorf 12,59 → 12,12; M39 am Kandidaten 4/4

GTX 1060, `--echt` 1920×1080, Regler voll (ABAB) bzw. frei (M39).
- **A** = n2010-b2b (main 452972a6).
- **B** = n2010-b2a (7c6f4b49 = V18.546.73 = main + material-mikro cbaf1eff + material-lack 0d3a6067).
- **Instrument:** die Werkbank aus B; beide Bäume sauber.
- **Folge:** A1 B1 A2 B2; Genesis Third auf 4+4 verlängert.
- **Je Boot:** frisch, Schloss, Seiten-Wache.
- **Urteil je Größe:** Δ ≤ max(2σ gepoolt, Auflösung).

## Zellen

| Zelle | Größe | A | B | Urteil |
|---|---|---|---|---|
| Wiese Ego steht | **gpu-bank** | 12,50 (12,57 · 12,43) | **12,06** (11,87 · 12,26) | **schneller**, −0,44 bei 2σ 0,41 |
| | GPU-Durchsatz p50 · Frame p95 · CPU-Takt p95 · Belegung p95 | 12,90 · 16,8 · 4,3 · 6,03 | 12,70 · 16,8 · 4,3 · 6,02 | gleich |
| | Befehle · Dreiecke p95 · VRAM | 38 · 290k · 108,4 | 38 · 291k · 108,4 | gleich |
| Wiese Ego geht | fps · Frame p95 · CPU-Takt p95 · Belegung p95 | 62,2 · 25,1 · 18,2 · 21,8 | 61,6 · 25,1 · 18,4 · 21,5 | gleich (2σ 1,5 · 0,1 · 1,0 · 0,95) |
| | GPU-Durchsatz p50 · Befehle · Dreiecke p95 · VRAM | 15,55 · 53 · 393k · 112,1 | 15,70 · 53 · 394k · 112,4 | gleich |
| Genesis Third steht (4+4) | fps · Frame p95 · CPU-Takt p95 · Belegung p95 | 79,8 · 16,7 · 6,1 · 7,83 | 79,8 · 16,7 · 6,0 · 7,78 | gleich |
| | gpu-bank · GPU-Durchsatz p50 | 11,55 · 12,55 | 11,63 · 12,60 | gleich (2σ 0,46 · 0,08) |
| | Befehle · Dreiecke p95 · VRAM | 78 · 356,9k · 113,8 | 78 · 356,9k · 113,7 | gleich |
| Dorf Ego 8 Uhr steht | Frame p95 · CPU-Takt p95 · Belegung p95 | 16,8 · 5,4 · 7,29 | 16,8 · 5,4 · 7,27 | gleich |
| | gpu-bank · GPU-Durchsatz p50 | 12,59 (12,79 · 12,38) | 12,12 (11,81 · 12,42) | gleich, in Richtung schneller (2σ 0,73) |
| | Befehle · Dreiecke p95 · VRAM | 57 · 455,0k · 115,2 | 57 · 455,1k · 114,3 | gleich, VRAM −0,9 |

- **Wiese:** material-mikro (Korn in der Albedo, Kavität im aoNode aus EINER Höhe `_mikroRelief`, Rausch-Atlas 70 statt 76 Ladungen) senkt die GPU-Zeit je Bild an der GTX um 0,44 ms. Die Radeon maß −1,0. VRAM und Befehle bleiben gleich.
- **Genesis Third:** Nach 2+2 schlug der Kern-Richter bei fps stehend an (79,8 gegen 79,65 bei σ fast 0). Bei 4+4 lagen beide Seiten auf 79,8, alle Größen gleich.

## M39 profiband.K4 am Kandidaten 7c6f4b49 — Soll 1 HÄLT
Die Station gehört nach dem neuen Gesetz in den ABAB-Termin. 4 frische Boots, Wiese Ego, `lauf 30 --ein 20 --ruhe 300 --regler frei` und `haenger 60 --regler frei --tiere frei --wandern bahn`.

| Boot | Frames > 100 ms in 60 s | Frame p50 / p95 / p99 / max | loadScale | Tiere | Chunks |
|---|---|---|---|---|---|
| b1 | **0** | 16,6 / 25 / 33,3 / 83,2 | 0,27 | 11 | 72 |
| b2 | **0** | 16,6 / 25 / 33,3 / 83,3 | 0,45 | 11 | 42 |
| b3 | **0** | 16,6 / 25 / 33,3 / 83,3 | 0,50 | 9 | 56 |
| b4 | **0** | 16,6 / 25 / 33,3 / 83,4 | 0,47 | 9 | 56 |

4 von 4 ohne Frame > 100 ms; TAKT 0 · NEBEN 0 · GC 0 · GPU 0. Das trägt profiband.K4 = 1 beim Landen von 7c6f4b49.

## Urteil
**nicht langsamer.**

Zeile in `zug/abab.txt`: `7c6f4b49f6412149a218e42b3bc8b6db742a4039 nicht-langsamer 2310-abab-zug5`.

Roh: `bericht/2310-abab-zug5/`
- `gehen/`: je Boot `*-steht.txt`, `*-geht-1.txt`, `*-bank.txt`; dazu `auswertung-gehen-<zelle>.md|json`.
- `m39/`: `b*-haenger.out|json`, `b*-lauf.txt`.
- `serie.sh`, `m39k.sh`, `fortschritt.log`.
- OMEN `p3/n2210/zug5/`, `p3/n2310/ms/m39-7c6f/`.

**Status ZWISCHENSTAND + Übergabe:**
- Zug 5 gemessen samt M39 am Kandidaten; die Zeile steht, landen liegt beim Koordinator.
- Zug 6 (6579e8f4) läuft im selben Termin gegen 7c6f4b49: ABAB mit 5 Zellen, dann M36, Herde, M39 und M37 mit Zusatz.
