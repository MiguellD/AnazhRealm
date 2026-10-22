# Bericht 2210 ABAB Bewohner-Gang: A main f3865c80 (V18.546.61) gegen B integ-probe e3dd2b67 (V18.546.63 = + Bewohner-Gang, radeon-beweise, wiederkehr), GTX, 22.10. 11:43–12:35

**Urteil:**
- **Genesis Third und Wiese Ego: nicht langsamer.** Wiese Ego war im ersten Paar an der gpu-bank knapp und ist auf n = 4 erweitert; dort halten alle 9 Kerngrößen.
- **Dorf um 8 Uhr: die Bewohner gehen und kosten CPU** (CPU-Takt p95 +0,3, Belegung p95 +0,45 ms). Die GPU bleibt gleich, Dreiecke −45k, Befehle gleich.

- **Genesis Third (2+2), 9 Kerngrößen nicht langsamer:**
  - steht: CPU-Takt p95 5,7 → 5,8 (A 5,8 · 5,6, B 6,0 · 5,7; 2σ 0,4) · gpu-bank 11,50 → 11,61 · Belegung p95 7,45 → 7,23 · Frame p95 16,8 = 16,8.
  - geht: CPU-Takt p95 19,9 → 20,0 · Frame 25,1 = 25,1.
- **Wiese Ego (4+4), 9 Kerngrößen nicht langsamer:**
  - steht: CPU-Takt p95 4,4 → 4,5 (2σ 0,4) · gpu-bank 12,16 → 12,83 (A 11,85 · 12,39 · 12,18 · 12,22; B 13,84 · 12,91 · 12,07 · 12,49; 2σ 1,12) · GPU-Durchsatz p50 13,05 → 12,90 · Belegung 6,19 → 6,22.
  - geht: CPU-Takt p95 19,8 → 19,5 · Frame 25,1 = 25,1 · Belegung 22,7 → 22,9.
  - Nach 2+2 war die gpu-bank formal langsamer (12,12 → 13,38): Es ist der obere Bank-Modus, die B-Boots lagen mit k0 oben.
  - **k0** oben in 3 von 4 B-Boots, in 0 von 4 A-Boots (0,26 → 0,53, formal über 2σ). Im ABAB ruhe (e5003509 gegen c0151abb) lag k0 auf BEIDEN Seiten oben. Sitzungslage, nicht der Bewohner-Gang (an der Wiese steht kein Bewohner).
- **Dorf −4,−4 Ego steht um 8 Uhr** (2+2; `uhr8.js`: die Uhr als Spieler-Wort `setTimeOfDay(8/24, "human")` hält jede Bühne der Messung, vor und nach dem Lauf 0,3333; der Dorf-Zug läuft):
  - Befehle 57/69 = 57/69 · **Dreiecke 466k → 421k** (Mittel; p95 518k → 455k) · **VRAM 114,5 → 116,0 MB** (+1,5).
  - **CPU-Takt p95 5,0 → 5,3** (alle vier Boots genau so, 2σ 0) · **Belegung p95 6,65 → 7,11** (t 4,8) · fps 78,2 → 76,9 · GPU-Durchsatz 12,75 → 12,90 (+0,15) · gpu-bank 12,56 → 12,40 · Frame p95 16,8 = 16,8.
  - Gemessen ist der Gang der Bewohner im Takt (das Gang-Gesetz je Satz) bei weniger Dreiecken. Benannt als Inhalt, kein Täter gejagt.
  - Die Kopf-Zahl der Leib-Gruppen im Blick war 0: Die Bewohner zeichnen am Messpunkt als Satz, kein naher Leib.

Weg: Instrument werkbank aus B (e3dd2b67), je Boot frische Sitzung `--echt` 1920×1080, Regler voll, Tiere frei.
- steht: `lauf 30 --ein 20 --ruhe 300` + `gpu-bank 12 --runden 5`; geht: `lauf 30 --ein 2` (Geher 4 m/s). Dorf mit `--ort dorf` (Zug an).
- Schloss je Boot, Nachtruhe. Seiten-Wache nie rot, Bäume sauber.
- Roh: OMEN `p3/n2210/gang/gehen/`; Auswertungen hier.

Status ZWISCHENSTAND + Übergabe: ABAB fertig. Danach setze ich Profiband K1 fort (Sprint, Fahrt, Sturm; Wiese Ego und Genesis Third stehen schon).
