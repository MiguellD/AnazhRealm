# Messung OMEN — V18.531 (main 2b60988b, A) gegen V18.533-Teil (integ-probe 516e704a, B)

Gemessen 07.10.2026, 02:15–02:41, OMEN (GTX 1060 Pascal, i7-8750H, 1920×1080 @ 120 Hz). B enthält V18.532, die Zerleg-Linse, die EINE Schirm-Quelle, Welle G (Boden, Post, Feld-Pass) und den Pool-Schnitt; die Sicht-Kette fehlt noch.

## Aufbau

- Worktrees `mess-a` (2b60988b) und `mess-c` (516e704a); jeder Stand mit eigener werkbank.cjs.
- Boot-Folge ABABABAB, je 4 frische Boots.
- Je Boot:
  1. save-server `PORT=4312`, `werkbank start --echt --port 4490 --seite http://localhost:4312`
  2. `__anazhAutoSettlement = false`, `fenster 1920 1080`, `umstellen -900 -850`, einmal `__buehne()` + `weatherEffectTime = -1e7`, yaw 0, pitch 0
  3. `lauf 30 --ein 20 --ruhe 300 --tiere frei --regler voll`, dann `--regler frei`
  4. `gpu-bank 12×3` bei yaw 0 und −0,88
  5. zuletzt `band` bei yaw 0 und −0,88
  6. `zaehlen` und `schirm`
- Nur im Boot 8B danach: `zerlegen --selbsttest`, `zerlegen --runden 6 --json … --bilder`, `shader --stoff boden`.

## Je Boot

| Boot | Regler voll: fps · Frame p50/p95 · CPU p50/p95 · render/creatures | Regler frei: fps · Frame p50/p95 · CPU p50/p95 · render/creatures | gpu-bank yaw 0 / −0,88 (GPU/CPU) | band yaw 0 / −0,88: Befehle · Dreiecke · VRAM | Tiere |
|---|---|---|---|---|---|
| 1A | 29,3 · 33,3/50,1 · 13,5/42,9 · 5,5/0,6 | 30,7 · 33,3/33,9 · 11,5/15,0 · 5,1/4,7 | 29,17/3,93 · 29,85/4,27 | 182·2201k·157,4 / 218·2575k·157,4 | Bär 14 |
| 2B | 35,2 · 25,0/50,0 · 23,5/52,0 · 10,5/1,9 | 48,7 · 16,8/25,1 · 15,3/20,8 · 6,4/2,7 | 14,72/5,03 · 15,00/4,29 | 136·1070k·152,0 / 172·1235k·152,2 | Bär 52, Wesen 33 |
| 3A | 29,3 · 33,3/58,3 · 16,5/49,6 · 6,0/4,2 | 37,4 · 25,0/33,4 · 13,0/16,1 · 4,7/3,9 | 25,54/3,83 · 24,83/3,60 | 182·2190k·157,0 / 279·2848k·158,6 | Wesen 61, Fuchs 14 |
| 4B | 42,2 · 24,9/41,7 · 19,2/43,3 · 10,9/0,2 | 47,3 · 16,8/25,1 · 14,9/20,6 · 6,4/2,2 | 14,98/4,96 · 15,11/5,23 | 90·771k·148,0 / 72·631k·148,0 | – |
| 5A | 31,3 · 33,2/50,0 · 19,0/46,8 · 5,7/6,4 | 40,1 · 25,0/33,4 · 17,2/21,0 · 5,2/6,9 | 19,28/3,65 · 19,57/3,88 | 189·2223k·157,3 / 223·2595k·157,4 | Wesen 19 |
| 6B | 33,0 · 25,0/58,2 · 25,1/53,3 · 10,4/4,3 | 46,0 · 24,8/33,3 · 18,9/25,2 · 7,3/4,8 | 14,67/4,87 · 15,09/5,14 | 160·1109k·154,3 / 191·1228k·154,4 | Fuchs 42, Bär 38, Wesen 33 |
| 7A | 31,9 · 25,1/50,1 · 14,1/44,6 · 5,1/0,5 | 36,4 · 25,0/33,4 · 13,3/16,5 · 4,2/3,5 | 24,16/3,39 · 24,15/3,51 | 174·2140k·157,8 / 219·2582k·157,8 | Bär 14 |
| 8B | 42,2 · 24,9/41,6 · 19,2/42,4 · 9,7/0,3 | 45,5 · 16,8/25,1 · 14,9/21,3 · 5,8/2,3 | 14,68/5,08 · 15,13/5,20 | 105·853k·149,0 / 86·687k·149,0 | Wesen 14 |

## Median A gegen Median B (je 4 Boots)

| Größe | A | B | B − A |
|---|---|---|---|
| **gpu-bank yaw 0** | **24,85 ms** (19,3–29,2) | **14,70 ms** (14,67–14,98) | **−10,2 ms (−41 %)** |
| **gpu-bank yaw −0,88** | **24,49 ms** (19,6–29,9) | **15,10 ms** (15,00–15,13) | **−9,4 ms (−38 %)** |
| band GPU yaw 0 / −0,88 | 26,2 / 25,2 | 17,5 / 14,7 | −8,7 / −10,5 |
| Regler voll: Frame p50 / p95 | 33,25 / 50,1 | 24,95 / 45,85 | −8,3 / −4,3 |
| Regler voll: fps | 30,3 | 38,7 | +8,4 |
| Regler voll: CPU-Takt p50 / p95 | 15,3 / 45,7 | 21,35 / 47,65 | +6,1 / +2,0 |
| Regler voll: render-EWMA | 5,6 | 10,5 | +4,9 (Sicht-Kette) |
| Regler voll: GPU-Durchsatz p50 | 30,6 | 23,4 | −7,3 |
| Regler frei: Frame p50 / p95 | 25,0 / 33,4 | 16,8 / 25,1 | −8,2 / −8,3 |
| Regler frei: fps | 36,9 | 46,7 | +9,8 |
| Regler frei: CPU-Takt p50 / p95 | 13,2 / 16,3 | 15,1 / 21,1 | +2,0 / +4,8 |
| band Befehle yaw 0 / −0,88 | 182 / 221 | 121 / 129 | −34 % / −42 % |
| band Dreiecke yaw 0 / −0,88 | 2196k / 2589k | 962k / 958k | −56 % / −63 % |
| band VRAM | 157,4 | 150,5 | −6,9 MB |
| gpu-bank CPU je Frame | 3,7 | 5,0 | +1,3 |

## Urteil

- **Welle G kombiniert spart in der Bank ~10 ms GPU je Frame:** 24,9 → 14,7 ms, Median über 4 Boots je Seite. B streut fast nicht (14,67–15,13), A über 10 ms.
- **Das Band-Ziel ist auf der GTX 1060 erreicht:** gpu-bank ~15 ms liegt unter 16,7 ms.
- **Frame-Zeit ohne Sicht-Kette:** Regler frei p50 16,8 ms in 3 von 4 B-Boots (6B: 24,8), p95 25,1 ms. Regler voll p50 25,0 ms bei p95 ~42–58 ms.
- **Unter Regler voll ist B jetzt CPU-gebunden:** CPU-Takt p50 21,4 ms, render-EWMA 10,5 statt 5,6 ms (+4,9 = Sicht-Kette). Der Frame bleibt darum bei 25 ms (dritter VSync-Tick bei 120 Hz), obwohl die GPU ~15 ms braucht. Mit dem Sicht-Schnitt (welle-c-sicht −5,5 ms render) sollte voll auf ~16,7 ms fallen können.
- **Stempel-Pool in B:** nach jedem band „STEMPEL-POOL GRUEN: 0 verweigerte Abfragen seit Boot". Jeder lauf meldet `stempel.gueltig = true` (imLauf 0, seitBoot 0, Spitze 48 von 2048). In A gibt es diese Meldung nicht (alter Stand); dort lief band erst nach lauf.

## Zerlegung B (Boot 8B, yaw 0, --runden 6)

Gesamt 12,75 ms/Frame · CPU 5,11 ms · Pass-Stempel 0,14 ms (1 %).

| Schalter | Δ ms ± σ | Anteil | Notiz |
|---|---|---|---|
| haupt | 11,02 ± 0,11 | 86,4 % | |
| **baum** • | **3,54 ± 0,13** | **27,8 %** | 34 Befehle, 48 Objekte — jetzt der größte Posten |
| **boden** • | **2,04 ± 0,11** | **16,0 %** | V18.532: 6,9 |
| post | 1,65 ± 0,17 | 12,9 % | messbar, kein Absturz |
| traa • | 1,00 ± 0,08 | 7,8 % | |
| karten • | 0,85 ± 0,22 | 6,7 % | |
| nachbild | 0,50 ± 0,07 | 3,9 % | V18.532: 1,1–1,3 |
| bloom • | 0,49 ± 0,12 | 3,8 % | |
| traaKopien | 0,36 ± 0,04 | 2,8 % | |
| nahWiese • | 0,30 ± 0,33 | 2,4 % | |
| streu • | 0,25 ± 0,30 | 2,0 % | |
| k0 | 0,15 ± 0,15 | 1,2 % | |
| kontrast • | 0,13 ± 0,10 | 1,0 % | |
| busch • | 0,13 ± 0,25 | 1,0 % | |
| feldPass • | 0,12 ± 0,14 | 0,9 % | V18.532: 2,4 |
| tiefenkopie • | 0,08 ± 0,19 | 0,6 % | |
| godrays • | 0,03 ± 0,19 | 0,2 % | V18.532: 0,7 |
| schatten | 0,02 ± 0,02 | 0,2 % | |
| tier · bau · formationen · himmel · wasser · k1 | ≈ 0 | | |
| leer | 10,98 ± 0,06 | 86,1 % | leerer Frame 1,77 ms |

Σ• 8,86 ms (69,5 %). Rest 3,89 = leerer Frame 1,77 + geteilt 2,12.

**Selbsttest GRÜN:** Last allein 1,275 ms, als Posten 1,29 ± 0,15. STEMPEL-PROBE 0,36 ms (28 %). STEMPEL-POOL GRÜN, auch in der Zerlegung (Spitze 198 von 2048).

**Anatomie:**
- Render-Pässe 4,7 je Frame (Ziele 79,2 MB). haupt startet weiterhin 1× je Frame neu (Tiefenkopie).
- Kopien 3,2 je Frame (31,6 MB), dazu die Timestamp-Auflösung „außerhalb" 0,1 je Frame.
- Uploads 139 (0,13 MB, davon fimp:atlas:L2 2× 0,12 MB).
- setPipeline 27, setBindGroup 66; direkte Draws haupt 21, k0 13,5.
- createRenderBundleEncoder 0,8 je Frame — die Bundles werden fast je Frame neu aufgenommen.

**shader --stoff boden:** bodenSatz mit 2 Rausch-Aufrufen (interleavedGradientNoise), 100 Abtastungen (88 unbedingt, 12 im Zweig), 12 Proben, 78 Ladungen, 71 Verzweigungen, 2 376 Ops. Budget (rauschen 2 · ladungen 90 · proben 12 · ops 2 400): GRÜN. Teuerste Fragmente danach: fimp:atlas:L2 (1 298 Ops), Bäume/Wiese/Sätze je ~1 000 Ops, post:ausgabe 371, feld-pass 772.

## Auffälligkeiten

- Bild: Schirm yaw −0,88 in A (7A) und B (8B) heil und gleich aufgebaut. Der Boden-Pfad in B ist etwas dunkler und glatter, Gras vollständig (kein fehlendes Gras wie beim Einzel-Branch welle-g-boden).
- Wetter: lauf ruft selbst `__buehne()`; danach greift das −1e7-Einfrieren nicht mehr sicher. In 2B endete der lauf voll mit „rainy", in 6B das Boot-Ende (nach band) mit „rainy". In allen A-Boots blieb es sunny.
- Hänger (Frame max): A 1A frei 1 825 ms, 5A voll 1 167 ms, 7A frei 1 667 ms; B 8B frei 1 950 ms, 4B frei 700 ms, 6B voll 383 ms. Einzel-Frames von 0,4 bis 2 s, vor allem im lauf frei, in beiden Ständen.
- Tiere ungleich verteilt (B 2B und 6B mit Bär, Wesen und Fuchs bis zusammen 113 Befehle). Die Bank in B streut trotzdem nur ±0,2 ms.
- CPU-Takt p95 unter Regler voll ist in beiden Ständen hoch (A 43–50, B 42–53 ms).

Rohdaten: `C:\Users\micha\Desktop\AnazhRealm-OMEN\ab533\` (je Boot lauf, gpu-bank, band, zaehlen, Schirm; 8B Zerlegung mit Bildern, Selbsttest, shader; `zusammen.json`).
