# Bericht 2110 ABAB bewohner: A 5951786f gegen B integ-probe 2160be58 (V18.546.54 = + erstes-haus + bewohner), GTX 2+2, 21.10. 22:26–23:04

**Urteil:** Genesis Third und Wiese Ego sind **nicht langsamer**. Die Szene ist an beiden Orten byte-gleich (Befehle, Dreiecke, VRAM), die Bewohner wirken nur im Dorf.

- **Genesis Third:**
  - steht: Frame p95 16,8 ↔ 16,8 · CPU-Takt p95 6,0 → 5,8 (A 6,0 · 5,9, B 5,7 · 5,8) · gpu-bank 11,41 → 11,24 · Belegung p95 7,46 → 7,29.
  - geht: Frame p95 25,1 ↔ 25,1 · CPU-Takt p95 20,9 → 20,5 · Belegung 23,4 → 23,1.
  - Formal rot nur Nebengrößen beim Gehen (CPU p99 +1,4, lauf-GPU p95 +0,15, außer Takt +0,07), alle bei gleicher Szene (79/100 Befehle, 331k Dreiecke, 119 MB).
  - Soll 5,8: B 2/2.
- **Wiese Ego:**
  - steht: Frame p95 16,8 ↔ 16,8 · CPU-Takt p95 4,3 ↔ 4,3 · Belegung 5,97 → 6,08.
  - gpu-bank 11,81 → 12,54 (2σ 1,93): ein Ausreißer B1 13,51 bei gleicher Szene (38/49 Befehle, 263,5k Dreiecke, 108,6 MB je Seite), B2 11,58.
  - geht: CPU-Takt p95 19,5 → 18,8 · Frame 25,1 ↔ 25,1 · Belegung 22,3 → 21,8.
  - k0 unten in 3 Boots, oben (0,62) in B2.
- **Dorf −4,−4 Ego steht** (Inhalt, Dorf-Zug läuft):
  - Befehle Mittel/p95 45/57 → 56/69 · Dreiecke Mittel 300k → 462k (+162k) · VRAM 112,7 → 114,6 MB (+1,9).
  - CPU-Takt p95 4,7 → 5,3 (A 4,6 · 4,7, B 5,6 · 5,0; +0,6, 2σ 0,6, t 2,1) — formal langsamer.
  - Belegung p95 6,39 → 7,03 (2σ 0,88) · fps 85,5 → 82,4 · Frame p95 16,8 ↔ 16,8 · gpu-bank 11,70 → 11,50.
  - Das gleicht dem Radeon-Bild (Befehle 46 → 57, +145k, CPU +0,1…0,5).
- **Takt/Drossel:** P0-Median 1708–1759 MHz, Drossel 18–34 %, 84–86 °C; gleich zwischen den Seiten je Zelle.

Weg: Instrument = werkbank aus B (2160be58). Je Boot frische Sitzung `--echt`, 1920×1080, Regler voll, Tiere frei.
- Genesis und Wiese mit ruhendem Dorf-Zug, das Dorf mit `--ort dorf` (Zug läuft).
- steht: `lauf 30 --ein 20 --ruhe 300` + `gpu-bank 12 --runden 5`; geht: `lauf 30 --ein 2` (Geher 4 m/s).
- GPU-Schloss je Boot. Gestartet nach dem echt-Job 39666422778 (integ 2160be58).
- Seiten-Wache nie rot, Bäume sauber.
- Hinweis: Das Schloss hing seit 21:35 verwaist an `omen-2110-e` (meine Kette vor der Notbremse); ich habe es um 22:02 gelöst, der wartende echt-Job lief danach.

Rohdaten: OMEN `p3/n2110/abab7/gehen/`; Auswertungen je Zelle hier in `bericht/2110-abab-bewohner/` (Spaltenkopf korrigiert: A 5951786f · B 2160be58).

Status ZWISCHENSTAND + Übergabe: Die ABAB ist fertig. Als Nächstes kommt bausatz-absage (WIP 7a97f1e7).
