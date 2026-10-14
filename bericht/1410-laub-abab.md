# Bericht 1410 Laub — Einschub-ABAB main-naechst f09398e6 gegen main c5e2fc8f

**Status: ZWISCHENSTAND.**

**Urteil (OMEN, GTX, Wiese K55 −278/−1038 Blick −z, Regler voll, 2 Boots je Seite im Wechsel, 2σ gepoolt):**
- **Frame:** Im Frame ist f09398e6 **nicht langsamer**. p50 8,4 gleich, p95 16,7–16,8. Befehle, Dreiecke und VRAM gleich
  (Baum haupt 20 Befehle / 41 948 Dreiecke auf beiden Seiten).
- **GPU:** in der Messfolge im Rauschen, CPU-Takt am Rand.
- **fps:** −3,2 / −3,3, knapp über 2σ. Ein kleiner GPU-Term schiebt mehr Frames auf das 16,7-ms-Raster.
- **Nadelwald-Blick** (Kamera auf der Wiese, Blick nach −273/−1060 in Kronenhöhe, je Seite EINE Sitzung nach 30 s Lauf
  unter Regler voll):
  - gpu-bank 8,05 · 8,05 → 8,28 · 8,28 ms (+0,23 ms, 2,9 %), bei 66 Befehlen und 274 770 → 274 801 Dreiecken.
  - Das ist die Überzeichnung der dichteren Nadel-Wedel (K58: Füllung 0,28 → 0,36), klein und benannt.
  - Im Bild (`1410-laub/nadel/nadel-AB.png`) trägt B die neue Nadel-Textur sichtbar.

| Größe | Ego A → B (Δ, 2σ) | Third A → B (Δ, 2σ) |
|---|---|---|
| fps | 95,5 → 92,3 (−3,2, 1,9) | 95,8 → 92,6 (−3,3, 2,6) |
| Frame p50 / p95 ms | 8,4 / 16,7 → 8,4 / 16,8 | 8,4 / 16,8 → 8,4 / 16,8 |
| CPU-Takt p95 voll ms | 6,2 → 6,3 (+0,2, 0,1) | 6,7 → 6,8 (+0,1, 0,6) |
| gpu-bank Gier 0 / −0,88 ms | 8,25 / 9,36 → 8,41 / 9,25 | 8,80 / 9,36 → 8,87 / 9,47 |
| Band-GPU ms | 10,36 → 10,67 (+0,31, 0,45) | 9,64 → 10,31 (+0,68, 1,11) |
| Befehle / Dreiecke / VRAM MB | 74 / 287 455 / 95,0 → 74 / 285 713 / 95,0 | 85 / 324 552 / 95,9 → 85 / 324 550 / 95,8 |

- **Drossel:** nie Leistung oder Hitze (0x0/0x1). Seiten-Wache nie rot.
- **Instrument:** `abab-if09` (f09398e6), Wiese lokal gepatcht.
- **Seiten:** `abab-p5e2`, `abab-pf09`.
- **Rohdaten** `bericht/1410-laub/`.

## Status ZWISCHENSTAND + Übergabe

Kein Code-Commit. Danach folgen K51-4 gehend (`1410-boden2-abab.md`) und 1410-3.
