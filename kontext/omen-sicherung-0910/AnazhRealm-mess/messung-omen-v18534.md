# Messung OMEN — V18.533 (main 2f237817, A) gegen V18.534 (integ-probe 78d66a63, B)

Gemessen 07.10.2026, 09:38–10:05, OMEN (GTX 1060 Pascal, i7-8750H, 1920×1080 @ 120 Hz).

## Aufbau

- Worktrees `mess-v533` (2f237817) und `mess-d` (78d66a63), je `npm ci`; jeder Stand mit eigener werkbank.cjs.
- Boot-Folge ABABABAB, 4 frische Boots je Seite.
- Je Boot:
  1. save-server `PORT=4312`, `start --echt --port 4490 --seite http://localhost:4312`
  2. `__anazhAutoSettlement = false`, `fenster 1920 1080`, umstellen, einmal `__buehne()`, yaw 0, pitch 0
  3. `lauf 30 --ein 20 --ruhe 300 --tiere frei` mit `--regler voll`, dann `--regler frei`
  4. `gpu-bank 12×3` bei yaw 0 und −0,88
  5. `band` bei yaw 0 und −0,88
  6. `zaehlen`, `schirm`, `profil 12 --regler voll --top 60`
- Nur in 8B danach: `zerlegen --runden 6 --json …` und `sicht --ruhe 300 --sonne 300 --drehen 360 --gehen 120 --regler voll`.
- **umstellen:** `--ort wiese` kennt nur B. A (V18.533) hat den Befehl nicht und fährt `umstellen -900 -850` mit yaw 0. Das ist derselbe Ort und dieselbe Blickrichtung wie `wiese` (spieler −900/−850, blick −900/−840, Gier 0).

## Je Boot

| Boot | Regler voll: fps · Frame p50/p95 (max) · CPU p50/p95 · render/creatures | Regler frei: fps · Frame p50/p95 (max) · CPU p50/p95 · render/creatures | gpu-bank yaw 0 · −0,88 (GPU/CPU) | band yaw 0 / −0,88: Befehle·Dreiecke·VRAM·GPU | Tiere (zaehlen) | Wetter |
|---|---|---|---|---|---|---|
| 1A | 36,7 · 25,0/50,0 (58) · 23,1/49,8 · 10,9/1,9 | 47,8 · 16,8/25,1 (250) · 15,7/21,4 · 7,1/2,5 | 14,84/5,13 · 15,05/5,57 | 102·863k·149,3·17,9 / 86·695k·149,4·14,8 | Bär 14 | sunny |
| 2B | 25,5 · 33,4/58,5 (950) · 33,2/60,6 · 6,9/13,1 | 33,5 · 33,2/33,5 (317) · 28,1/35,0 · 6,0/15,4 | 13,02/4,58 · 13,60/5,85 | 191·1384k·148,9·16,2 / 266·1679k·148,9·15,8 | Fuchs 70, Bär 69, Wesen 33 | **rainy (WETTER-WACHE ROT)** |
| 3A | 34,6 · 25,0/50,1 (100) · 24,7/52,1 · 11,7/2,0 | 46,2 · 24,9/33,2 (266) · 16,3/22,2 · 6,6/2,4 | 14,84/5,75 · 15,14/6,35 | 105·863k·149,3·17,3 / 86·695k·149,3·14,6 | Bär 14 | sunny |
| 4B | 48,6 · **16,7**/33,4 (**1675**) · 12,0/35,3 · 4,3/2,5 | 58,9 · 16,7/25,1 (292) · 11,2/17,9 · 5,4/2,5 | 12,64/2,93 · 12,91/2,91 | 99·779k·143,6·16,6 / 98·799k·143,8·14,4 | Bär 22 | sunny |
| 5A | 41,5 · 24,9/49,9 (75) · 19,7/45,7 · 11,4/0,3 | 57,0 · 16,7/25,0 (275) · 13,2/17,5 · 6,2/0,3 | 12,91/4,78 · 13,13/4,85 | 90·795k·146,7·15,8 / 74·646k·146,8·14,4 | – | sunny |
| 6B | 49,6 · **16,7**/41,5 (567) · 11,6/35,9 · 4,1/3,0 | 54,0 · 16,7/25,1 (**1217**) · 11,1/18,2 · 5,0/2,8 | 14,87/2,74 · 14,50/2,18 | 102·880k·149,4·17,2 / 94·804k·149,5·14,3 | Bär 19 | sunny |
| 7A | 37,0 · 25,0/49,9 (**1500**) · 21,4/47,3 · 10,4/2,0 | 49,0 · 16,8/25,1 (266) · 14,9/19,6 · 5,6/2,5 | 14,80/4,88 · 14,93/4,90 | 97·802k·149,2·17,7 / 86·691k·149,3·14,2 | Fuchs 14 | sunny |
| 8B | 44,4 · 24,9/41,6 (433) · 14,9/38,5 · 5,1/6,5 | 50,3 · 16,8/33,3 (267) · 13,7/17,5 · 3,9/6,5 | 15,15/3,23 · 14,85/3,21 | 125·960k·149,3·18,0 / 121·904k·149,3·14,0 | Wesen 41, Bär 5 | sunny |

Stempel-Pool: in beiden Ständen nach jedem band GRÜN. Alle lauf melden `stempel.gueltig = true`.

## Median A gegen Median B (je 4 Boots; in Klammern B ohne 2B)

| Größe | A | B | B − A |
|---|---|---|---|
| **Regler voll: Frame p50** | **25,0** | **20,8 (16,7)** | **−4,2 (−8,3)** |
| Regler voll: Frame p95 | 50,0 | 41,6 (41,5) | −8,4 |
| Regler voll: fps | 36,9 | 46,5 (48,6) | +9,7 |
| **Regler voll: CPU-Takt p50 / p95** | **22,3 / 48,6** | **13,5 / 37,2** (12,0 / 35,9) | **−8,8 / −11,4** |
| **Regler voll: render-EWMA** | **11,1** | **4,7** (4,3) | **−6,4** |
| Regler voll: creatures-EWMA | 1,9 | 4,8 (3,0) | +2,8 (mehr Tiere in B) |
| Regler voll: Anteil Frames über 33 ms | 15,7 % | 7,4 % (6,1 %) | −8,3 Pkt |
| Regler voll: GPU-Durchsatz p50 | 23,4 | 20,0 (19,0) | −3,5 |
| Regler frei: Frame p50 / p95 | 16,8 / 25,1 | 16,8 / 29,2 (16,7 / 25,1) | ±0 |
| Regler frei: fps | 48,4 | 52,2 (54,0) | +3,8 |
| Regler frei: CPU-Takt p50 / p95 | 15,3 / 20,5 | 12,5 / 18,1 (11,2 / 17,9) | −2,9 / −2,5 |
| gpu-bank yaw 0 / −0,88 | 14,82 / 14,99 | 13,95 / 14,05 (14,87 / 14,50) | −0,9 / −0,9 (Rauschen) |
| gpu-bank CPU je Frame | 5,0 | 3,1 (2,9) | −1,9 |
| band Befehle yaw 0 / −0,88 | 99,5 / 86 | 113,5 / 109,5 (102 / 98) | +14 / +24 |
| band Dreiecke yaw 0 / −0,88 | 833k / 693k | 920k / 854k (880k / 804k) | +10 % / +23 % (+6 % / +16 %) |
| band VRAM | 149,3 | 149,1 | ±0 |
| band GPU yaw 0 / −0,88 | 17,50 / 14,49 | 16,91 / 14,35 (17,24 / 14,30) | −0,6 / −0,1 |

## Antworten

**(1) Fällt der volle Regler aus dem 25-ms-Raster? Ja, wenn wenige Tiere im Bild stehen.**
- render-EWMA: 11,1 → 4,7 ms; CPU-Takt p50: 22,3 → 13,5 ms.
- Frame p50 unter voll:
  - 4B und 6B: 16,7 ms (2. VSync-Tick, ~49 fps)
  - 8B: 24,9 ms bei Wesen 41 + Bär (creatures 6,5)
  - 2B: 33,4 ms bei Regen und drei Arten mit 172 Tier-Befehlen (creatures 13,1)
- Der Hebel ist jetzt die Kreatur-KI. `_fieldRaycast` führt in B die Selbstzeit an (6B: 18 %); die Sicht-Kette ist aus den Top 10 verschwunden.

**(2) Was kosten die Halte-Ränder auf der GPU? Mehr Dreiecke, aber keine messbare GPU-Zeit.**
- band-Dreiecke ohne 2B: yaw 0 +6 % (833k → 880k), yaw −0,88 +16 % (693k → 804k).
- baum:
  - yaw 0: A 52 Befehle (30/18/4) 378k → B 52 (30/18/4) 388k (+10k)
  - yaw −0,88: A 38 (23/15/0) 306k → B 41 (23/16/2) 321k (+15k, k1 0 → 2)
- GPU: gpu-bank 14,82 → 14,87 (ohne 2B), band-GPU 17,50 → 17,24 bzw. 14,49 → 14,30. Die Halte-Ränder liegen unter der Boot-Streuung (±1 ms).

## Profil (12 s, Regler voll; Mittel über 4 Boots, Anteil % und ≈ ms je Frame)

| Methode | A | B |
|---|---|---|
| _loopRender | 45,1 % · 11,22 | 26,4 % · 6,84 |
| _diaetRefresh | 28,1 % · 6,98 | 14,3 % · 3,77 |
| _renderBundles | 27,4 % · 6,80 | 13,0 % · 3,43 |
| _passSicht | 24,9 % · 6,17 | 3,7 % · 1,06 |
| _chunkSatzPass | 21,6 % · 5,36 | 1,6 % · 0,58 |
| _hoehlenSicht | 18,0 % · 4,48 | 1,3 % · 0,45 |
| _hoehlenSichtLicht | 14,3 % · 3,56 | 0,6 % · 0,24 |
| _loopVoxelStreaming | 18,3 % · 4,53 | 13,7 % · 3,27 |
| _tickFernRing | 9,2 % · 2,27 | 3,0 % · 0,63 |
| updateCreatures | 5,8 % · 1,51 | 24,1 % · 7,30 (2B: Regen + 3 Arten) |
| _fieldRaycast | 9,0 % · 2,27 | 24,0 % · 6,83 |
| _loopCamera | 6,2 % · 1,53 | 8,2 % · 1,88 |
| computeVertexNormals | 6,4 % · 1,57 | < Top 60 |

Selbstzeit-Top 10:
- **3A (37,2 fps):** _hoehlenSichtLicht 12,1 · _fieldRaycast 9,3 · (program) 5,4 · updateMatrixWorld 3,5 · _passTrifft 3,0 · computeVertexNormals 2,9 · fromBufferAttribute 2,8 · _stepCharacterStructures 2,5 · writeBuffer 2,0 · _runRaycast 1,9
- **6B (52 fps):** _fieldRaycast 18,0 · (program) 6,0 · updateMatrixWorld 4,2 · _runRaycast 3,8 · loop 3,0 · noise2D 2,4 · _stepCharacterStructures 2,4 · _lodTreeVisHeight 2,0 · tickArchitectureCulling 1,9 · _tickArchitectureLOD 1,7

## Zerlegung B (8B, yaw 0, --runden 6; Wesen 41 + Bär 5 im Bild)

Gesamt 16,11 ms/Frame · CPU 4,20 · Stempel 0,15 (1 %) · STEMPEL-POOL GRÜN · Zustand zurück.

| Schalter | Δ ms ± σ | Anteil |
|---|---|---|
| haupt | 14,23 ± 0,20 | 88,3 % |
| **baum** • | **6,36 ± 0,23** | **39,5 %** (52 Befehle, 48 Objekte) |
| post | 1,64 ± 0,32 | 10,2 % |
| boden • | 1,09 ± 0,10 | 6,8 % |
| traa • | 0,97 ± 0,12 | 6,0 % |
| karten • | 0,60 ± 0,16 | 3,7 % |
| k0 | 0,57 ± 0,28 | 3,5 % |
| nachbild | 0,55 ± 0,19 | 3,4 % |
| schatten | 0,53 ± 0,20 | 3,3 % |
| bloom • | 0,35 ± 0,08 | 2,2 % |
| traaKopien | 0,34 ± 0,05 | 2,1 % |
| tier • | 0,33 ± 0,15 | 2,0 % (35 Befehle, 104 Objekte) |
| kontrast • | 0,28 ± 0,14 | 1,7 % |
| nahWiese • | 0,23 · busch • 0,21 · wasser • 0,16 · godrays • 0,10 · tiefenkopie • 0,08 · bau • 0,08 · formationen • 0,07 · einzelstuecke • 0,04 · feldPass • 0,03 · streu 0,00 · himmel −0,03 · k1 −0,09 | |
| leer | 14,62 ± 0,13 | 90,8 % (leerer Frame 1,49) |

Σ• 10,95 (68,0 %). Rest 5,16 = leer 1,49 + geteilt 3,67.

**Anatomie:**
- Render-Pässe 5,3 je Frame (Ziele 87,2 MB); Submits 6,4; executeBundles 1,0.
- setPipeline 59,7, setBindGroup 149,7; direkte Draws haupt 46, k0 37, k1 2,3. Mehr als in ab533/8B, wegen Tieren und 52 baum-Befehlen in dieser Welt.
- **createRenderBundleEncoder: 0 je Frame.** Die Zeile fehlt in den Anlagen (nur createCommandEncoder 6,4); in V18.533/8B waren es 0,8. Die Bundles werden nicht mehr je Frame neu aufgenommen.
- baum kostet hier 6,4 ms gegen 3,5 in ab533/8B. Die Welt trug 52 statt 34 baum-Befehle (A heute ebenfalls 52 / 378k), also ein Welt-Effekt, kein Effekt von V18.534.

## sicht (8B, Regler voll; Mittel / max je Frame)

| Phase | Frames · Schreib-Frames | Prüfungen | Ecken | lichtLage | Index-Bytes | Treffer | Täter |
|---|---|---|---|---|---|---|---|
| Ruhe | 299 · 16 | 114 / 4 379 | 276 / 11 048 | 35 / 1 381 | 23 334 / 890 868 | 82 / 99 | Gruppen birke/strauch/tanne ×0,03 |
| Sonne | 299 · 15 | 102 / 4 422 | 249 / 11 128 | 31 / 1 391 | 24 120 / 911 172 | 82 / 99 | dieselben ×0,02 |
| Drehen | 360 · 347 | 9 585 / 15 727 | 12 024 / 27 928 | 1 003 / 2 207 | 112 570 / 2 450 208 | 25 / 99 | streuSatz\|haupt ×3,06, Gruppen ×1,51 |
| Gehen | 120 · 111 | 11 533 / 14 627 | 13 521 / 20 592 | 990 / 1 729 | 48 277 / 649 044 | 0 | streuSatz\|haupt ×5, bauSatz\|haupt ×2, Gruppen ×1,34 |

Urteil der Linse: „RUHE: 23 333,8 Index-Bytes je Frame (max 890 868, in 16 von 299 Frames) — ein Pass schreibt ohne Änderung". Die Ruhe ist fast still (Prüfungen 114 statt ~9 300 in V18.533), aber 16 Frames schreiben ohne Änderung bis 0,9 MB.

## Auffälligkeiten

- **Wetter (2B):** WETTER-WACHE ROT im lauf voll: `{"vorher":"sunny","nachher":"rainy","uhrVorher":-999999982,5,"uhrNachher":-999999999,9,"festVorher":true,"festNachher":true}`. Die Uhr war eingefroren und das Wetter drehte trotzdem; ein anderer Weg als der Auto-Zug setzt den Regen. Das Boot blieb bis zum Ende rainy. Sonst alle Boots sunny, Wache GRÜN.
- **Hänger (Frame max):** voll A 58 / 100 / 75 / **1 500**, B **950 / 1 675** / 567 / 433; frei A 250–275, B 317 / 292 / **1 217** / 267. B hat unter voll mehr Hänger von 0,4–1,7 s. Der Anteil an Frames über 33 ms halbiert sich trotzdem (15,7 → 7,4 %).
- **createRenderBundleEncoder:** 0 je Frame in B (V18.533: 0,8).
- **CPU p95 unter voll** fällt (48,6 → 37,2) und bleibt hoch; die Spitzen kommen aus Kreatur und Streaming.
- **Tiere:** B hatte mehr Tiere (2B 172 und 8B 46 Tier-Befehle). A war ruhiger (0–15).

Rohdaten: `C:\Users\micha\Desktop\AnazhRealm-OMEN\ab534\` (je Boot lauf, gpu-bank, band, zaehlen, Schirm, profil; 8B Zerlegung und sicht; `zusammen.json`).
