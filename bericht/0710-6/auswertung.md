## Je Boot

| Boot | Versuch | Wachen | Regler | fps | Frame p50/p95/max | CPU-Takt p50/p95 | render-EWMA | creatures-EWMA | gpu-bank Gier 0 / −0,88 (CPU) | band Befehle · Dreiecke · VRAM · GPU | Tiere im Band (Bef./Dreiecke) | Tiere gesamt / im Sichtkegel | Wetter Ende | GPU vor Boot |
|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|
| 1A | 1 | GRUEN | voll | 51.1 | 16.7 / 33.4 / 58.3 | 11.4 / 26.9 | 4.63 | 2.77 | 14.92 (3.18) / 13.58 (3.60) | 118 · 901k · 151.2 MB · 17.92 ms | 28 / 105k | 11 / 10 | sunny | 60, 898 MHz, 4 %, P0 |
|  |  |  | frei | 50.6 | 16.7 / 25.1 / 283.4 | 17.1 / 22.5 | 4.37 | 8.20 |  |  |  | 19 / 14 |  |  |
| 2B | 1 | GRUEN | voll | 55.2 | 16.7 / 25.1 / 33.8 | 6.6 / 9.9 | 2.72 | 0.75 | 16.16 (1.92) / 14.71 (1.97) | 91 · 764k · 122.5 MB · 17.27 ms | 0 / 0k | 11 / 2 | sunny | 66, 240 MHz, 20 %, P8 |
|  |  |  | frei | 60.5 | 16.7 / 25.0 / 299.9 | 6.6 / 12.5 | 4.61 | 0.66 |  |  |  | 11 / 2 |  |  |
| 3A | 2 | GRUEN | voll | 52.2 | 16.7 / 33.3 / 58.4 | 10.1 / 20.2 | 4.46 | 0.42 | 14.94 (3.02) / 13.48 (2.42) | 97 · 828k · 148.1 MB · 15.98 ms | 7 / 32k | 10 / 9 | sunny | 72, 139 MHz, 22 %, P8 |
|  |  |  | frei | 55.8 | 16.7 / 25.1 / 550.0 | 10.0 / 16.1 | 11.09 | 2.81 |  |  |  | 11 / 9 |  |  |
| 4B | 2 | GRUEN | voll | 59.9 | 16.7 / 25.0 / 33.5 | 6.3 / 9.5 | 2.39 | 0.75 | 14.90 (2.04) / 13.39 (1.73) | 90 · 760k · 122.8 MB · 15.73 ms | 0 / 0k | 11 / 1 | sunny | 73, 442 MHz, 12 %, P8 |
|  |  |  | frei | 65.6 | 16.6 / 17.0 / 250.0 | 5.8 / 8.8 | 2.27 | 0.74 |  |  |  | 11 / 1 |  |  |
| 5A | 1 | GRUEN | voll | 54.2 | 16.7 / 25.3 / 50.1 | 9.9 / 21.4 | 4.58 | 0.43 | 14.83 (2.79) / 13.49 (2.42) | 90 · 802k · 148.2 MB · 15.83 ms | 0 / 0k | 10 / 7 | sunny | 67, 139 MHz, 21 %, P8 |
|  |  |  | frei | 55.2 | 16.7 / 25.1 / 266.5 | 11.2 / 18.4 | 4.90 | 2.50 |  |  |  | 11 / 8 |  |  |
| 6B | 1 | GRUEN | voll | 60.8 | 16.7 / 25.0 / 33.4 | 6.1 / 9.2 | 2.83 | 0.74 | 14.73 (1.86) / 13.47 (1.48) | 90 · 776k · 122.8 MB · 15.68 ms | 0 / 0k | 11 / 1 | sunny | 67, 139 MHz, 15 %, P8 |
|  |  |  | frei | 66.6 | 16.6 / 17.0 / 33.8 | 5.8 / 8.6 | 2.33 | 0.70 |  |  |  | 11 / 1 |  |  |
| 7A | 2 | GRUEN | voll | 49.4 | 16.7 / 33.5 / 174.9 | 11.9 / 30.1 | 21.39 | 2.84 | 15.47 (2.86) / 13.63 (2.62) | 105 · 879k · 149.4 MB · 16.72 ms | 15 / 88k | 11 / 8 | sunny | 72, 139 MHz, 16 %, P8 |
|  |  |  | frei | 54.9 | 16.7 / 25.1 / 266.6 | 10.8 / 15.6 | 5.47 | 2.73 |  |  |  | 11 / 8 |  |  |
| 8B | 1 | GRUEN | voll | 58.9 | 16.7 / 25.0 / 141.6 | 7.7 / 12.4 | 4.16 | 2.16 | 13.77 (3.14) / 13.25 (3.35) | 163 · 1157k · 130.1 MB · 15.68 ms | 73 / 379k | 20 / 5 | sunny | 66, 139 MHz, 14 %, P8 |
|  |  |  | frei | 66.5 | 16.6 / 25.0 / 41.7 | 8.0 / 12.1 | 3.84 | 2.08 |  |  |  | 20 / 6 |  |  |

## Mediane A gegen B (je 4 Boots; Spanne min–max)

| Größe | A (main 78ee56da) | B (integ-probe c966b9c3) | B − A |
|---|---|---|---|
| fps voll | 51.7 (49.4–54.2) | 59.4 (55.2–60.8) | +7.7 (15 %) |
| Frame p50 voll | 16.7 (16.7–16.7) | 16.7 (16.7–16.7) | +0.0 (0 %) |
| Frame p95 voll | 33.3 (25.3–33.5) | 25.0 (25.0–25.1) | -8.3 (-25 %) |
| Frame max voll | 58 (50–175) | 34 (33–142) | -25 (-42 %) |
| CPU-Takt p50 voll | 10.8 (9.9–11.9) | 6.4 (6.1–7.7) | -4.3 (-40 %) |
| CPU-Takt p95 voll | 24.1 (20.2–30.1) | 9.7 (9.2–12.4) | -14.4 (-60 %) |
| render-EWMA voll | 4.61 (4.46–21.39) | 2.78 (2.39–4.16) | -1.83 (-40 %) |
| creatures-EWMA voll | 1.60 (0.42–2.84) | 0.75 (0.74–2.16) | -0.85 (-53 %) |
| fps frei | 55.0 (50.6–55.8) | 66.0 (60.5–66.6) | +11.0 (20 %) |
| Frame p50 frei | 16.7 (16.7–16.7) | 16.6 (16.6–16.7) | -0.1 (-1 %) |
| Frame p95 frei | 25.1 (25.1–25.1) | 21.0 (17.0–25.0) | -4.1 (-16 %) |
| Frame max frei | 275 (267–550) | 146 (34–300) | -129 (-47 %) |
| CPU-Takt p50 frei | 11.0 (10.0–17.1) | 6.2 (5.8–8.0) | -4.8 (-44 %) |
| CPU-Takt p95 frei | 17.3 (15.6–22.5) | 10.4 (8.6–12.5) | -6.8 (-39 %) |
| render-EWMA frei | 5.19 (4.37–11.09) | 3.08 (2.27–4.61) | -2.10 (-41 %) |
| creatures-EWMA frei | 2.77 (2.50–8.20) | 0.72 (0.66–2.08) | -2.05 (-74 %) |
| gpu-bank Gier 0 (GPU ms/Frame) | 14.93 (14.83–15.47) | 14.82 (13.77–16.16) | -0.11 (-1 %) |
| gpu-bank Gier −0,88 (GPU ms/Frame) | 13.54 (13.48–13.63) | 13.43 (13.25–14.71) | -0.11 (-1 %) |
| gpu-bank Gier 0 (CPU ms/Frame) | 2.94 (2.79–3.18) | 1.98 (1.86–3.14) | -0.96 (-33 %) |
| band Befehle | 101 (90–118) | 91 (90–163) | -11 (-10 %) |
| band Dreiecke (k) | 853 (802–901) | 770 (760–1157) | -83 (-10 %) |
| band VRAM MB | 148.8 (148.1–151.2) | 122.8 (122.5–130.1) | -26.0 (-17 %) |
| band GPU ms/Frame | 16.35 (15.83–17.92) | 15.71 (15.68–17.27) | -0.65 (-4 %) |
| Tiere im Band: Befehle | 11 (0–28) | 0 (0–73) | -11 (-100 %) |
| Tiere gesamt (lauf voll) | 11 (10–11) | 11 (11–20) | +1 (5 %) |
| Tiere im Sichtkegel (lauf voll) | 9 (7–10) | 2 (1–5) | -7 (-82 %) |
| Hänger > 100 ms je 30 s (Sitzung) | 4 (2–5) | 0 (0–0) | -4 (-100 %) |
| Hänger: Frame max ms (Sitzung) | 337 (208–1875) | 34 (33–58) | -304 (-90 %) |
| Hänger-Sitzung: Frame p95 ms | 45.8 (41.6–50.0) | 24.9 (24.9–25.0) | -20.9 (-46 %) |
| Hänger-Sitzung: Knoten-Bau synchron Σ ms | 415 (246–1024) | 0 (0–28) | -415 (-100 %) |

## Profil-Top-10 (Selbstzeit-Anteil %, Median je Seite über 4 Boots)

| Funktion | A % (Boots) | B % (Boots) |
|---|---|---|
| (idle) :0 | 3.8 (2) | 24.1 (4) |
| _fieldRaycast anazhRealm.js | 21.5 (4) | 6.5 (4) |
| (program) :0 | 8.8 (4) | 6.8 (4) |
| _segmentAABB anazhRealm.js | 6.0 (1) | 8.4 (4) |
| _runRaycast anazhRealm.js | 4.5 (4) | 3.4 (4) |
| updateMatrixWorld three.core.min.js | 4.3 (4) | 2.2 (4) |
| computeCompoundTags anazhRealm.js | – (0) | 3.1 (1) |
| _stepCharacterStructures anazhRealm.js | 2.5 (4) | 2.7 (4) |
| loop anazhRealm.js | 2.3 (4) | 1.6 (4) |
| computeCreatureCompoundTags anazhRealm.js | – (0) | 2.1 (1) |

## Hänger > 100 ms je Slot (eigene Sitzung, haenger 30 s, Regler voll; Ursache je Klasse)

- 1A: 5 Hänger, max 391.6 ms · NEBEN: build [three.webgpu.min.js] ×2 (Σ 775 ms, max 392) · TAKT: verteilt ×2 (Σ 417 ms, max 292) · TAKT: _loopVoxelStreaming › _runFrameScheduler ×1 (Σ 125 ms, max 125)
- 2B: 0 Hänger, max 33.5 ms · –
- 3A: 5 Hänger, max 283.3 ms · TAKT: verteilt ×1 (Σ 283 ms, max 283) · TAKT: _loopVoxelStreaming › _runFrameScheduler ×1 (Σ 200 ms, max 200) · TAKT: _dispatchFrameJobs › run ×1 (Σ 167 ms, max 167) · TAKT: _kompiliere › build [three.webgpu.min.js] ×1 (Σ 108 ms, max 108) · TAKT: _sampleBakedField › _bakeRegionFields ×1 (Σ 108 ms, max 108)
- 4B: 0 Hänger, max 33.5 ms · –
- 5A: 3 Hänger, max 208.4 ms · TAKT: renderer.renderObject › build [three.webgpu.min.js] ×1 (Σ 208 ms, max 208) · TAKT: _loopVoxelStreaming › _runFrameScheduler ×1 (Σ 117 ms, max 117) · TAKT: _kompiliere › build [three.webgpu.min.js] ×1 (Σ 108 ms, max 108)
- 6B: 0 Hänger, max 33.4 ms · –
- 7A: 2 Hänger, max 1875.0 ms · GPU: Pipeline synchron (k0 tier:fuchs, haupt tier:fuchs) ×1 (Σ 1875 ms, max 1875) · TAKT: renderer.renderObject › build [three.webgpu.min.js] ×1 (Σ 333 ms, max 333)
- 8B: 0 Hänger, max 58.4 ms · –

## Wetter-Halt: verweigerte Züge je Quelle (Summe über alle Schritte)
- 1A: keine
- 2B: keine
- 3A: keine
- 4B: nexus→rainy 1
- 5A: keine
- 6B: nexus→rainy 1
- 7A: keine
- 8B: keine
