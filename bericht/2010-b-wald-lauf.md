# Bericht 2010 B-Wald im Lauf auf der GTX: A main e93134f4 (V18.546.22) gegen B integ-probe 80258f0e (V18.546.23 = A + b-wald), 20.10.

**Urteil: nicht langsamer, in jeder Zelle.**
- **Genesis Third stehend (E-Zelle):** CPU-Takt p95 6,0 → 6,0 ms, Frame p95 16,8 ↔ 16,8, fps 80,3 → 80,1.
- **Genesis Third gehend:** CPU-Takt p95 19,9 ↔ 19,9, Frame p95 25,0 → 25,1, fps 63,8 → 64,0.
- **Wiese Ego gehend:** CPU-Takt p95 19,3 → 20,7, Frame p95 25,1 → 27,1, fps 62,4 → 59,8. Jedes Δ liegt innerhalb 2σ. Das ganze Minus kommt aus EINEM schweren Boot, B1 (siehe unten). Ohne ihn liegt B bei 18,7 / 25,1 / 62,8.

Je 4+4 verschränkt (A1 B1 … A4 B4), 16 von 16 Boots im ersten Versuch, Seiten-Wache nie rot. Die Version im Log je Boot bestätigt die Seite (A: V18.546.22, B: V18.546.23).

## Seiten, Instrument, Weg
- A = `n1910-f1b` (e93134f4), B = `n1910-integ` (80258f0e). `git status` ist in beiden Bäumen leer.
- Instrument A: werkbank.cjs ist A↔B byte-gleich. `methoden.txt`: B entfernt keine Stamm-Methode (3496/3496).
- Je Boot eine frische Werkbank-Sitzung (`--echt`, 1920×1080, Regler voll, Tiere frei). Die Folge: dorf-aus · fenster · `umstellen --ort --sicht` · Zensus · KI-Uhr.
  - **steht** = die Lauf-Form der E-Zelle (omen-messfolge lauf-voll: `lauf 30 --ein 20 --ruhe 300`; die Bühne stellt der Lauf selbst).
  - **geht** = `lauf 30 --ein 2` mit dem Geher (`geher.js`, wie F1): 4 m/s, −z 0 → −60 m und zurück, je Boot 127–128 m gesetzt, `abwMaxM` 0 in 16 von 16.
- GPU-Schloss `omen-2010` je Boot, 25 s Pause. Wetter sonnig gehalten in jedem Lauf. Tiere 10 je Boot (fox 4, deer 4, bear 2).
- k0 an der Wiese: in allen 8 Boots „unten" (0,26 steht / 0,25 geht), beide Seiten im selben Zustand.
- Seitengleiche Szene: Pässe und Anteile je Boot gleich (k0 1,00 · k1 0,34–0,35 · spiegel:strahl 0,28 an der Wiese).

## Tafel (Mittel A → B, in Klammern je Boot; Δ, 2σ gepoolt, t Welch)
| Zelle | Gang | fps | Frame p95 | CPU-Takt p95 | CPU-Takt p99 | GPU-Durchsatz p50 | Urteil |
|---|---|---|---|---|---|---|---|
| Genesis Third | steht | 80,3 → 80,1 (−0,2; 2σ 1,2) | 16,8 → 16,8 | 6,0 → 6,0 (5,3 · 6,1 · 6,3 · 6,3 / 6,2 · 6,2 · 6,0 · 5,6; t 0,00) | 7,3 → 7,3 | 12,40 → 12,45 | nicht langsamer |
| Genesis Third | geht | 63,8 → 64,0 (+0,1; 3,7) | 25,0 → 25,1 (+0,1; 0,1) | 19,9 → 19,9 (t 0,03) | 43,4 → 42,3 | 14,43 → 14,35 | nicht langsamer |
| Wiese Ego | steht | 81,3 → 81,1 | 16,8 → 16,8 | 4,1 → 4,3 (+0,2; 0,7) | 5,1 → 5,4 | 12,25 → 12,28 | nicht langsamer |
| Wiese Ego | geht | 62,4 → 59,8 (−2,6; 8,4) | 25,1 → 27,1 (+2,0; 5,8) | 19,3 → 20,7 (18,4 · 19,5 · 19,3 · 20,0 / 26,8 · 18,8 · 18,6 · 18,6; t 0,68) | 38,9 → 43,5 | 15,07 → 15,70 | nicht langsamer |
- Soll E 5,8 an Genesis Third stehend: Je Seite hält es 1 von 4 Boots (A1 5,3; B4 5,6).

## Takt und Drossel je Urteil (nvidia-smi 1 s, P0-Sekunden; Drossel = Grund ≠ 0 ohne GpuIdle)
- Genesis Third: A 1746 MHz (Drossel 19–25 %, max 86 °C) · B 1733–1759 MHz (18–27 %, 86 °C).
- Wiese Ego: A 1708–1721 MHz (30–42 %) · B 1708–1721 MHz (27–38 %).
- Gleicher Takt beider Seiten in jeder Zelle: Median 1746 bzw. 1708 MHz. Jeder Boot weicht höchstens einen nvidia-smi-Schritt ab (13 MHz = 0,8 %): g-third-B1 +13, B2/B3 −13, w-ego-A1/B1 +13.

## Ehrlich offen
- **Wiese Ego B1 ist der schwere Boot:** geht 50,9 fps, Frame p95 33,3, CPU p95 26,8, GPU-Durchsatz 17,6, über 33 ms 3,3 %. render-EWMA 8,53 gegen 5,6–6,5 in den übrigen 7, Streaming 4,93 im Band (4,43–5,04).
  - Pässe, Takt (1721 MHz) und Szene sind gleich. Schon stehend war B1 leicht schwerer (CPU p95 5,0).
  - Die anderen 3 B-Boots liegen genau bei A. Ein solcher Boot kam auch in F1 vor (Wiese Third A2, 52 fps).
  - Nicht weiter zerlegt, benannt.
- Die E-Zelle stehend ist in derselben Sitzung VOR dem Gehen gemessen (Lauf-Form der omen-messfolge, ohne Band-Schritt), nicht als eigener messfolge-Boot.

## Rohpfade (OMEN `p3/n2010/lauf/`, Kopie hier in `bericht/2010-b-wald-lauf/`)
`serie.sh` · `fortschritt.log` · `gehen/<g-third|w-ego>-<A|B><n>-{steht,geht-1,geher-ende,zensus-0,zensus-1,kiuhr-*,smi.csv}` ·
Auswertung `auswertung-gehen.cjs` → `auswertung-gehen-<zelle>.{md,json}` (je Boot, Zensus, Takt, Mittel, Kern-Urteil).

Status ZWISCHENSTAND + Übergabe: Messung fertig, kein Schnitt. Weiter mit (2) B-Blick, Zweig `b-blick` ab 80258f0e.
