# Bericht 1510 Genesis Ego — die Boot-Fenster-Probe (fps 78 gegen 72–74 seit e8a370ad)

**Status: ZWISCHENSTAND.**

**Ergebnis:**

1. Der langsame Zustand an Genesis Ego ist **je Boot zweigipflig und steht ab dem Boot**: fps ≈ 73–74 statt ≈ 78–79,
   GPU-Durchsatz im Loop 13,7 statt 12,6–12,8 ms, bei gleicher Szene.
   - Er hängt weder am Haken des Dorf-Zugs noch an `_tickGenesisOrt` noch am Boot-Fenster der alten Folge.
2. **0bbee8fc (vor dem Bündel) zeigt ihn nie.** Ab e8a370ad tritt er je Boot auf (hier E2), auch mit der festen Folge.
3. **Das Boot-Fenster hinterlässt keinen dauerhaften Posten.** 30 s offener Haken bauen das Start-Dorf (59–61 fps im Bau),
   danach läuft jede Welt wieder wie vorher.

## Die Probe (`p3/k1510ge/fenster.sh`, 15.10. 22:58–23:28)

- **Instrument:** EIN Instrument `abab-p015` mit messfolge-ruhe, `start --ort genesis`. Je Kopf eine Welt, Folge C E A A E C.
- **Phasen je Welt:**
  1. einschwingen;
  2. lauf 30 (Basis);
  3. nur `_tickGenesisOrt`, 1×/s mit kurz offenem Haken, plus lauf 30;
  4. lauf 30;
  5. Haken offen plus lauf 30 (alle Spiel-Takte);
  6. Haken zu, plus zweimal lauf 30.

| Sitzung | Basis fps / Durchsatz | nur Genesis-Ort | danach | Haken offen | danach (zu) | danach 2 | Dreiecke (Lauf) |
|---|---|---|---|---|---|---|---|
| C1 0bbee8fc | 79,1 / 12,6 | 78,6 | 79,2 | 58,7 | 79,9 | 79,6 | 354k → 349k |
| E1 e8a370ad | 78,6 / 12,7 | 77,9 | 78,5 | 60,7 | 79,7 | 79,5 | 336k → 331k |
| A1 49824a19 | 76,7 / 13,0 | 76,3 | 76,7 | 59,7 | 79,1 | 78,9 | 338k → 332k |
| A2 49824a19 | 77,6 / 12,8 | 77,2 | 77,8 | 60,0 | 79,5 | 79,3 | 336k → 330k |
| **E2 e8a370ad** | **73,7 / 13,7** | 73,1 | 73,7 | 56,6 | **74,9** | **74,6** | 338k → 333k |
| C2 0bbee8fc | 78,8 / 12,6 | 78,0 | 78,8 | 58,5 | 79,7 | 79,6 | 354k → 349k |

- **Haken offen:** Das Start-Dorf entsteht (`zellen: start`, 30 Bäume weichen, −5k Dreiecke). Danach ist es fertig, und
  die Welt läuft wieder.
- **E2 trägt den langsamen Zustand ab dem Boot,** durch jede Phase (74–75 fps).
- **Was in E2 gleich bleibt:** VRAM (103,5 MB, 677 Puffer, 32 Texturen), Stellgrößen (Skala 0,75, Ring 4, Laub 216 m),
  Pass-Stempel (haupt 1,14, TRAA 0,68, post 0,67, k0 0,23), Befehle 83, Dreiecke, Tiere.
- **Was sich unterscheidet:**
  - Leine aus 38,3 % statt 34 %, Verzug 18,3 statt 16,4–17,4 ms.
  - **Die Kaskade k1 kostet p95 0,02 ms statt 0,37–0,39** (C1, E1); A1 (76,7 fps) liegt mit 0,03 dazwischen.
- **Über den Tag:**
  - Bei 0bbee8fc und davor (K10, K62, Bündel A, Fenster C) gibt es 14 von 14 Boots schnell.
  - Ab e8a370ad sind es langsam: Bündel B 2/2, Loop-Proben 2/2, K68 B 2/2, K70 4/4, K72 B2.
  - Schnell dagegen: Probe 3, k69d8 A 2/2, Fenster E1, A1, A2.

## Folge

- **Die Genesis-Ego-fps sind ab e8a370ad je Boot zweigipflig** (≈ 73 oder ≈ 78). Ein A/B dort braucht ≥ 4 Boots je Seite
  oder ein Urteil je Zustand. Der CPU-Takt trennt sich nicht daran.
- **Der Täter ist offen.**
  - Kandidaten aus dem Bündel e8a370ad: K64 Tore fern (Linse H, „läuft vor den Blicken"), K38-N2 Werkstatt-Vorschau,
    K60 Ankunft.
  - Die k1-Kaskade (fast leer im langsamen Zustand) ist eine Spur.
  - Der nächste Schritt wäre ein langsamer Boot, in dem die Kandidaten in EINER Welt geschaltet werden, bis die 78 zurückkommt.

## Rohdaten

- **Pfad:** `bericht/1510-genesis-ego-fenster/`.
- **Inhalt:** je Sitzung die Läufe `basis`, `gort`, `nachgort`, `offen`, `danach`, `danach2` und die Zustände `z0`, `zg`,
  `z1`, `z2`; dazu das Skript `fenster.sh`.

## Status ZWISCHENSTAND + Übergabe

- Kein Code-Commit. Die OMEN misst jetzt 1510-a9e-abab (A 015a3f74 gegen B d5deed14).
