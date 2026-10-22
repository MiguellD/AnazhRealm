# Bericht 2110 ABAB naesse: A main b9537781 gegen B integ-probe 7670a4a1 (V18.546.56 = + bauen-k1 + naesse), GTX 2+2, 22.10. 02:23–03:24

**Urteil:** Genesis Third ist **nicht langsamer**. Wiese Ego hält Frame p95, CPU-Takt p95, gpu-bank und Belegung, verliert aber −1,5 fps im Stand bei +0,2 ms GPU-Durchsatz. Im **Regen** kostet die Nässe an der GTX **+1,2 ms GPU-Durchsatz**, das ist kein Rauschen. Die Szene ist an jedem Ort je Seite gleich.

- **Genesis Third** (steht + geht, 9 Größen nicht langsamer):
  - steht: CPU-Takt p95 5,3 → 5,5 (A 5,1 · 5,6, B 5,6 · 5,4; 2σ 0,5) · gpu-bank 10,93 → 11,33 (2σ 1,48) · Belegung p95 6,88 → 7,13 · Frame p95 16,8 ↔ 16,8.
  - geht: CPU-Takt p95 18,8 → 19,1 · Frame 25,0 ↔ 25,0.
- **Wiese Ego:**
  - steht: Frame p95 16,8 ↔ 16,8 · CPU-Takt p95 4,2 ↔ 4,2 · Belegung 5,86 → 5,89 · gpu-bank 12,19 → 13,03 (B 12,08 · 13,98; 2σ 1,91).
  - steht, formal langsamer: **fps 80,1 → 78,6** (t −6,7) · GPU-Durchsatz p50 12,40 → 12,60 (+0,2 = 2σ).
  - geht: CPU-Takt p95 18,9 → 18,7 · Frame 25,1 ↔ 25,1 · fps 62,7 → 62,3 · GPU-Durchsatz 15,30 → 15,45.
  - **k0** in beiden B-Boots oben (0,63/0,62), in beiden A-Boots unten (0,26). Im Regen B2 aber unten (0,26) bei trotzdem +1,0 ms Durchsatz.
  - Ob naesse den k0-Zustand mitbringt oder Sitzungslage ist (Lehre 17.10.), trennt n = 2 nicht. Die +0,37 ms k0 erklären den fps-Verlust an der Wiese allein.
- **Wiese Ego im Regen nach 10 min** (`regen.js`: jede Bühne der Messung setzt {wetter: rainy, naesse: 600}; das Wetter stand vor und nach dem Lauf auf rainy, A ohne Nässe-Takt, B mit):
  - **GPU-Durchsatz p50 12,40 → 13,60** (A 12,4 · 12,4, B 13,8 · 13,4; t 6) · gpu-bank 11,79 → 13,43 (B 14,46 · 12,40) · fps 79,8 → 75,0.
  - CPU-Takt p95 4,3 → 4,4, Belegung 5,97 → 6,10 (je +0,1, formal langsamer).
  - Befehle 39 = 39, Dreiecke 267k = 267k, VRAM 108,6 = 108,6. Die Mehrkosten liegen in den Stoffen (Nässe-Term je Pixel), nicht in der Szene.
  - Zum Vergleich die Radeon laut Commit cde74c22: +0,1 ms (Paar-Median, im Rauschen). An der GTX ist der Term im Regen 10× sichtbarer.
- **Takt/Drossel:** P0 1695–1771 MHz, Drossel 21–36 %, 83–87 °C; je Zelle zwischen den Seiten gleich (Wiese B 33–36 % gegen A 27 %).

Weg: Instrument werkbank aus B (7670a4a1), je Boot frische Sitzung `--echt` 1920×1080, Regler voll, Tiere frei.
- steht: `lauf 30 --ein 20 --ruhe 300` + `gpu-bank 12 --runden 5`; geht: `lauf 30 --ein 2` (Geher 4 m/s).
- Schloss je Boot; zwei CI-echt-Jobs (integ) liefen dazwischen mit Vorfahrt. Seiten-Wache nie rot, Bäume sauber.
- Roh: OMEN `p3/n2210/naesse/gehen/`; Auswertungen hier in `bericht/2110-abab-naesse/`.

Status ZWISCHENSTAND + Übergabe:
- Genesis ist nicht langsamer. An der Wiese gibt es −1,5 fps mit k0-Lage, im Regen +1,2 ms GPU.
- Zu entscheiden: n = 4 an der Wiese, um k0 zu trennen, oder der Nässe-Term als benannter Preis.
- Als Nächstes laut Auftrag die Glätte (Profiband K4).
