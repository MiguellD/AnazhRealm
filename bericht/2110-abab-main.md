# Bericht 2110 das EINE ABAB für den main-Vorlauf: A main d3a626ee gegen B integ 1011d41d (V18.546.47 = + Belegungs-Fertigsteller, Ufer-Warte, gehen-takt, e-bauart, ruhe-karten), GTX 2+2, 21.10.

**Urteil:** Wiese Ego ist in allem nicht langsamer. Genesis Third ist in Frame, fps, GPU und gehend nicht langsamer; stehend reißen CPU-Takt p95 und Belegung p95 formal die 2σ-Grenze.
- **Genesis Third steht:**
  - CPU-Takt p95 5,5 → 5,8 (A 5,5 · 5,6, B 5,7 · 5,9; +0,3, 2σ 0,2, t 2,2) — formal LANGSAMER.
  - Belegung p95 7,06 → 7,30 (+0,24, 2σ 0,21) — formal LANGSAMER.
  - gpu-bank 11,43 → 11,24 (−0,19), Frame p95 16,8 ↔ 16,8, fps 80,6 ↔ 80,6.
  - Soll 5,8: A 2/2, B 1/2.
- **Genesis Third geht:** Frame p95 25,1 ↔ 25,1, CPU-Takt p95 18,9 → 20,3 (2σ 3,1), Belegung 21,5 → 22,1 (2σ 3,0) — nicht langsamer.
- **Wiese Ego:**
  - steht: CPU-Takt p95 4,5 → 4,3, gpu-bank 11,82 → 11,72, Belegung 6,21 → 6,03.
  - geht: CPU 18,9 → 18,6, Frame 25,1 ↔ 25,1.
  - Alles nicht langsamer. k0 in allen Boots „unten“.
- **Ehrlich:**
  - Bei n = 2 ist die gepoolte Streuung eng. Die Boot-Streuung genau dieser Zelle lag heute bei 5,5–6,3 (Serie 2: 5,7–6,2).
  - Das +0,3 liegt darin, ist aber nicht ausgeschlossen. Ein drittes Paar würde es entscheiden; es ist laut Budget-Halt nicht gefahren.

Weg: Instrument B (werkbank 1011d41d, misst die Belegung je Lauf; methoden: keine fehlende), je Boot frische Sitzung `--echt` 1920×1080, Regler voll, Tiere frei; steht `lauf 30 --ein 20 --ruhe 300` · `gpu-bank 12 --runden 5` · geht `lauf 30 --ein 2` (Geher 4 m/s). Gestartet nach integ-CI 39614141577 grün. Seiten-Wache nie rot, Bäume sauber.
Rohpfade: OMEN `p3/n2110/abab5/`, Auswertungen hier in `bericht/2110-abab-main/`.

Status ZWISCHENSTAND + Übergabe: Messung fertig. Die OMEN hält an (Budget), Übergabe in `Desktop/AnazhRealm-OMEN/UEBERGABE-OMEN-2110.md`.
