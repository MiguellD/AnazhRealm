# Bericht 2110 ABAB main 32b37933 gegen integ 5951786f (V18.546.52 = + e-bauart-spitze, kamera-fuss, anfahren), GTX 2+2, plus Latenz je Seite

**Urteil:** Genesis Third ist nicht langsamer, Wiese Ego gehend auch nicht. An Wiese Ego stehend gibt es ein kleines formales Minus. **Die Latenz beim Gehen fällt von ROT auf GRÜN.**
- **Latenz** (`werkbank latenz --proben 50`, Wiese, je Seite EINE Sitzung, Bild 14,7/14,8 ms):
  - **Gehen p95:** Ego 64,5 → **37,1 ms**, Third 69,6 → **42,6 ms** (Soll ≤ 50; A ROT, B GRÜN). Kette 29,6 → 11,9 ms, Takte 7 → 4, p50 55 → 29 ms.
  - **Wechsel p95:** Ego 24,2 → 26,7, Third 26,1 → 20,0, gleich.
- **Genesis Third steht:** CPU-Takt p95 6,2 ↔ 6,2 (A 6,3 · 6,0, B 6,5 · 5,9), gpu-bank 11,06 → 11,44 (2σ 0,40), Belegung 7,60 → 7,88 (2σ 0,85), Frame 16,8 ↔ 16,8. Nicht langsamer.
- **Genesis Third geht:** CPU p95 19,7 → 20,1, Frame 25,0 → 25,1, Belegung 22,1 → 21,8. Nicht langsamer.
- **Wiese Ego steht:** gpu-bank 11,83 → 11,98 (+0,15, +1,3 %, 2σ 0,08) und fps 79,1 → 78,5 (2σ 0,4), formal LANGSAMER bei n = 2. CPU-Takt p95 4,5 → 4,7 und Belegung 6,38 → 6,46 im 2σ. k0: B1 „oben“ (0,63), sonst „unten“.
- **Wiese Ego geht:** CPU p95 22,4 → 19,9 (A2 schwerer Boot 25,9), Frame 25,1 ↔ 25,1. Nicht langsamer.

Weg: Instrument B, je Boot frische Sitzung `--echt` 1920×1080, Regler voll, Tiere frei; steht `lauf 30 --ein 20 --ruhe 300` · `gpu-bank 12 --runden 5` · geht `lauf 30 --ein 2`. Latenz nach `umstellen --ort wiese --sicht ego` und 10 s Ruhe. Rohpfade: OMEN `p3/n2110/abab6/`, Auswertungen und Latenz-Ausgaben hier in `bericht/2110-abab-anfahren/`.

Status ZWISCHENSTAND: nur gemessen.
