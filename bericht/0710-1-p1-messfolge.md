# Bericht 0710-1 P1: die Mess-Folge validiert, V18.534-Grundlinie am OMEN (GTX 1060)

**Urteil.** Das EINE Instrument (`omen-messfolge.cjs` mit `werkbank.cjs` und `lib` aus B 9f50dc1d) misst beide Stände: 8 von 8 Slots
GRÜN (ABABABAB, je 4 frische Boots), jede Wache trägt auf A und B, und auf A fiel die Wetter-Wache zweimal beim Namen rot. Das ist
die Wahrheit über A ohne Halt; beide Boots wurden verworfen und wiederholt. In B hielt der Halt: 0 Regen, 3 verweigerte Nexus-Züge
beim Namen. Die Zeit ist gleich, wie erwartet: gpu-bank Gier 0 **15,00 → 15,15 ms** (+1 %), Gier −0,88 **13,62 → 13,47 ms** (−1 %),
Band-GPU 16,85 → 16,89 ms, Frame p50 16,7–16,8 ms auf beiden Seiten, CPU-Takt p50 frei 12,3 / 12,3 ms und voll 12,4 / 11,5 ms.
Der Halt kostet nichts, die Linsen messen sich nicht mit. Ehrlich offen: Die Einzel-Hänger bleiben (bis 1,79 s ohne Wetter-Wechsel,
bis 2,8 s mit). Zwei Abstände B−A (CPU-Takt p95 voll −31 %, Profil-Anteil `_fieldRaycast` +8 Punkte) liegen bei n = 4 an der
Rausch-Grenze (exakter Rangtest zweiseitig p ≈ 0,06 bzw. 0,11) und hängen an der Tier-Lage, die die Folge noch nicht zählt.

## Die Stände und das Instrument

- **A** = integ-probe `6f1aa252`, gemessen aus **mess-d `78d66a63`**: dieselben Spiel-Bytes, nur `scripts/diag-idle-gpu-churn.cjs` weicht ab.
  Ausgeliefertes `anazhRealm.js` sha256 `e2bd66ffd997735e…`.
- **B** = welle-k-mess-wahrheit `9f50dc1d` (Worktree mess-kmw), `anazhRealm.js` `c3a6530dbd320e1f…`. B = 78d66a63 + Welle K; die
  Churn-Linse aus A steckt nicht in B (fürs Spiel ohne Belang).
- **Instrument:** je Boot `node mess-kmw/scripts/omen-messfolge.cjs --seite http://localhost:4312 --datei <N>.json` (sonst Defaults).
  Der save-server (`PORT=4312 node save-server.js`) läuft aus dem Worktree der gemessenen Seite. `--selbsttest` vor der Serie: GRÜN.
- **Seiten-Wache** (im Rahmen-Skript `serie.sh`): Vor jedem Boot muss der sha256 des über :4312 ausgelieferten `anazhRealm.js` zur
  Seite passen. Ergebnis: 10 von 10.
- **Welt:** Jeder Boot startet mit einem frischen Scratch-Profil (Erst-Boot). Die `anazhRealmState.json` des save-servers ist nur ein
  Backup, das das Spiel schreibt; beim Boot wird sie nicht gelesen.
- **Rechner:** GTX 1060 (Pascal, Treiber 31.0.15.2824), i7-8750H, Netzbetrieb, 1920×1080 @ 120 Hz. Die GPU stand vor jedem Boot bei
  68–72 °C in P8. Fremde Last: keine. Ein Chrome des Schöpfers war offen, aber ohne CPU-Last und nicht an der GPU.
- **Zeitraum:** 07.10. 13:30–14:08, 10 Boots (8 gültig, 2 verworfen) zu je ~2:45 min, dazu 60 s Pause.

## Verworfene Boots (beim Namen)

| Boot | Täter (Wetter-Spion) | Folge für die Zahlen |
|---|---|---|
| 1A Versuch 1 | `weather ← dslEval ← _tickWorldRules`, sunny → rainy ab lauf-voll. Das Wetter dreht in jedem Schritt neu, denn das Einschwingen von `band` setzt je Takt die Bühne. Insgesamt 13 Befunde. | lauf voll: 28,4 fps, Frame p50 **25,3** ms, CPU p50 **19,6** ms, max 2,8 s. Die grüne Wiederholung lag bei 16,8 und 12,5 ms. |
| 7A Versuch 1 | `weather ← … ← dslRun ← _loopNexusUpdate`, sunny → rainy, danach **zurück** rainy → sunny durch `_tickWorldRules` (lauf-voll) | Am Ende des Laufs ist das Wetter wieder sunny, max-Hänger 1,87 s. |

Beide Täter gibt es nur auf A, denn A hat keinen Halt an `_setWeather`.

**Lehre:** Die alte Wetter-Wache der Werkbank (bis V18.534) verglich nur Wort und Uhr vor und nach dem Lauf. Den 7A-Fall (Regen
mitten im Lauf, am Ende wieder Sonne) hätte sie GRÜN gemeldet. Frühere OMEN-Serien auf Ständen bis V18.534 können also unerkannte
Regen-Phasen enthalten. Was Regen kostet, zeigt 1A Versuch 1: unter Regler voll +7 ms CPU-Takt p50.

## Je Boot

| Boot | Versuch | Wachen | Regler | fps | Frame p50/p95/max | CPU-Takt p50/p95 | render-EWMA | creatures-EWMA | gpu-bank Gier 0 / −0,88 (CPU) | band Befehle · Dreiecke · VRAM · GPU | Tiere im Band (Bef./Dreiecke) | Wetter Ende | GPU vor Boot |
|---|---|---|---|---|---|---|---|---|---|---|---|---|---|
| 1A | 2 | GRUEN | voll | 47.6 | 16.8 / 41.6 / 91.7 | 12.5 / 39.8 | 5.10 | 2.77 | 13.42 (4.01) / 12.09 (3.66) | 105 · 872k · 143.4 MB · 17.49 ms | 15 / 81k | sunny | 69, 139 MHz, 22 %, P8 |
|  |  |  | frei | 54.7 | 16.7 / 25.1 / 283.4 | 13.3 / 19.0 | 4.93 | 3.32 |  |  |  |  |  |
| 2B | 1 | GRUEN | voll | 47.6 | 16.8 / 41.6 / 58.4 | 12.3 / 38.1 | 4.65 | 2.92 | 15.58 (3.80) / 13.19 (2.44) | 105 · 873k · 149.5 MB · 17.01 ms | 15 / 81k | sunny | 70, 949 MHz, 4 %, P0 |
|  |  |  | frei | 54.8 | 16.7 / 25.1 / 266.1 | 10.9 / 17.4 | 6.07 | 2.67 |  |  |  |  |  |
| 3A | 1 | GRUEN | voll | 39.0 | 24.9 / 41.7 / 1791.6 | 17.3 / 40.9 | 6.41 | 9.41 | 15.46 (4.38) / 14.00 (3.26) | 153 · 1144k · 149.0 MB · 17.47 ms | 63 / 349k | sunny | 68, 139 MHz, 14 %, P8 |
|  |  |  | frei | 44.9 | 24.8 / 33.4 / 266.7 | 19.3 / 24.7 | 5.39 | 8.27 |  |  |  |  |  |
| 4B | 1 | GRUEN | voll | 51.2 | 16.7 / 33.4 / 433.2 | 11.0 / 26.5 | 4.56 | 2.39 | 14.95 (2.71) / 13.39 (3.14) | 101 · 815k · 149.6 MB · 15.58 ms | 11 / 18k | sunny | 68, 139 MHz, 15 %, P8 |
|  |  |  | frei | 50.6 | 16.7 / 33.3 / 283.3 | 13.6 / 18.9 | 4.23 | 6.58 |  |  |  |  |  |
| 5A | 1 | GRUEN | voll | 49.3 | 16.7 / 33.4 / 50.0 | 12.3 / 36.4 | 4.94 | 2.99 | 15.02 (2.93) / 13.23 (2.38) | 105 · 884k · 149.4 MB · 16.23 ms | 15 / 88k | sunny | 68, 139 MHz, 0 %, P8 |
|  |  |  | frei | 55.2 | 16.7 / 25.1 / 249.5 | 11.3 / 18.0 | 4.76 | 2.72 |  |  |  |  |  |
| 6B | 1 | GRUEN | voll | 50.4 | 16.7 / 33.4 / 374.9 | 11.3 / 27.8 | 4.12 | 2.68 | 15.35 (4.37) / 15.01 (4.43) | 179 · 1245k · 154.5 MB · 17.94 ms | 89 / 448k | sunny | 69, 139 MHz, 14 %, P8 |
|  |  |  | frei | 40.4 | 24.9 / 33.4 / 1550.0 | 19.0 / 27.7 | 5.17 | 11.81 |  |  |  |  |  |
| 7A | 2 | GRUEN | voll | 47.5 | 16.8 / 41.6 / 58.4 | 12.3 / 38.9 | 4.15 | 2.85 | 14.98 (2.77) / 14.06 (2.72) | 105 · 874k · 149.3 MB · 15.97 ms | 15 / 81k | sunny | 72, 139 MHz, 0 %, P8 |
|  |  |  | frei | 55.8 | 16.7 / 25.1 / 266.6 | 11.0 / 16.8 | 4.24 | 2.75 |  |  |  |  |  |
| 8B | 1 | GRUEN | voll | 49.4 | 16.7 / 33.4 / 416.7 | 11.7 / 25.8 | 4.29 | 2.74 | 14.79 (3.42) / 13.55 (3.30) | 105 · 814k · 149.4 MB · 16.77 ms | 15 / 17k | sunny | 69, 139 MHz, 3 %, P8 |
|  |  |  | frei | 55.1 | 16.7 / 25.1 / 258.4 | 10.9 / 19.3 | 7.10 | 7.29 |  |  |  |  |  |

## Mediane A gegen B (je 4 Boots; Spanne min–max)

| Größe | A (mess-d 78d66a63) | B (9f50dc1d) | B − A |
|---|---|---|---|
| fps voll | 47.5 (39.0–49.3) | 49.9 (47.6–51.2) | +2.4 (5 %) |
| Frame p50 voll | 16.8 (16.7–24.9) | 16.7 (16.7–16.8) | -0.1 (-1 %) |
| Frame p95 voll | 41.6 (33.4–41.7) | 33.4 (33.4–41.6) | -8.2 (-20 %) |
| Frame max voll | 75 (50–1792) | 396 (58–433) | +321 (427 %) |
| CPU-Takt p50 voll | 12.4 (12.3–17.3) | 11.5 (11.0–12.3) | -0.9 (-7 %) |
| CPU-Takt p95 voll | 39.3 (36.4–40.9) | 27.1 (25.8–38.1) | -12.2 (-31 %) |
| render-EWMA voll | 5.02 (4.15–6.41) | 4.42 (4.12–4.65) | -0.59 (-12 %) |
| creatures-EWMA voll | 2.92 (2.77–9.41) | 2.71 (2.39–2.92) | -0.21 (-7 %) |
| fps frei | 55.0 (44.9–55.8) | 52.7 (40.4–55.1) | -2.3 (-4 %) |
| Frame p50 frei | 16.7 (16.7–24.8) | 16.7 (16.7–24.9) | +0.0 (0 %) |
| Frame p95 frei | 25.1 (25.1–33.4) | 29.2 (25.1–33.4) | +4.1 (16 %) |
| Frame max frei | 267 (250–283) | 275 (258–1550) | +8 (3 %) |
| CPU-Takt p50 frei | 12.3 (11.0–19.3) | 12.3 (10.9–19.0) | -0.1 (-0 %) |
| CPU-Takt p95 frei | 18.5 (16.8–24.7) | 19.1 (17.4–27.7) | +0.6 (3 %) |
| render-EWMA frei | 4.84 (4.24–5.39) | 5.62 (4.23–7.10) | +0.78 (16 %) |
| creatures-EWMA frei | 3.04 (2.72–8.27) | 6.94 (2.67–11.81) | +3.90 (129 %) |
| gpu-bank Gier 0 (GPU ms/Frame) | 15.00 (13.42–15.46) | 15.15 (14.79–15.58) | +0.15 (1 %) |
| gpu-bank Gier −0,88 (GPU ms/Frame) | 13.62 (12.09–14.06) | 13.47 (13.19–15.01) | -0.14 (-1 %) |
| gpu-bank Gier 0 (CPU ms/Frame) | 3.47 (2.77–4.38) | 3.61 (2.71–4.37) | +0.14 (4 %) |
| band Befehle | 105 (105–153) | 105 (101–179) | +0 (0 %) |
| band Dreiecke (k) | 879 (872–1144) | 844 (814–1245) | -36 (-4 %) |
| band VRAM MB | 149.2 (143.4–149.4) | 149.6 (149.4–154.5) | +0.4 (0 %) |
| band GPU ms/Frame | 16.85 (15.97–17.49) | 16.89 (15.58–17.94) | +0.04 (0 %) |
| Tiere im Band: Befehle | 15 (15–63) | 15 (11–89) | +0 (0 %) |

## Profil-Top-10 (Selbstzeit-Anteil %, Median je Seite über 4 Boots)

| Funktion | A % (Boots) | B % (Boots) |
|---|---|---|
| _fieldRaycast anazhRealm.js | 18.4 (4) | 26.3 (4) |
| (program) :0 | 6.3 (4) | 7.0 (4) |
| _runRaycast anazhRealm.js | 4.1 (4) | 5.3 (4) |
| updateMatrixWorld three.core.min.js | 4.3 (4) | 4.4 (4) |
| (idle) :0 | 3.0 (1) | 0.7 (1) |
| loop anazhRealm.js | 2.5 (4) | 2.2 (4) |
| _stepCharacterStructures anazhRealm.js | 2.5 (4) | 2.5 (4) |
| noise2D simplex-noise.js | 2.2 (4) | 1.9 (4) |
| writeBuffer :0 | 1.8 (4) | 1.6 (4) |
| update three.webgpu.min.js | 1.8 (4) | 1.4 (4) |

## Wetter-Halt in B: verweigerte Züge je Quelle (Summe über alle Schritte)
- 2B: keine
- 4B: nexus→rainy 2
- 6B: nexus→rainy 1
- 8B: keine

## Die Grundlinie V18.534 am OMEN (Mediane über alle 8 Boots, A und B zeitgleich)

| Größe | Wert | Profi-Band |
|---|---|---|
| gpu-bank (GPU ms je Frame), Gier 0 / −0,88 | 15,0 / 13,5 | 16,7 |
| Band-GPU (ms je Frame, Ort-Blick) | 16,9 | 16,7 |
| Befehle | 105 | 208 |
| Dreiecke | ~874k | 680k (1,28×) |
| VRAM | 149,4 MB | 118 MB (1,27×) |
| Frame p50 voll / frei (Boots mit wenig Tieren) | 16,7–16,8 / 16,7 ms | — |
| Frame p50 in Boots mit vielen Tieren (3A voll, 6B frei; 63–89 Tier-Befehle im Band statt 15) | 24,9 ms | — |
| CPU-Takt p50 voll / frei | 12,3 / 12,3 ms | — |

Gegen die V18.534-Serie vom 07.10. (alte Werkbank-Folge, Mediane): Frame p50 voll 20,8 → 16,8 ms, CPU-Takt p50 13,5 → 12,3 ms,
render-EWMA 4,7 → 4,6 ms. Der Frame-Abstand liegt in der Tier-Lage: In der alten Serie lagen mehr Boots im 25-ms-Raster.

## VRAM je Erzeuger (Median MB; Grundlage für P2 HOST-VRAM)

| Erzeuger | A | B | Formen (aus der Band-Messung) |
|---|---|---|---|
| buf:szene | 35,3 | 37,9 | bodenSatz · spieler · bauSatz (Welt-Zustand, 32–38 MB) |
| tex:TRAANode.history | 23,7 | 23,7 | rgba16float 1920×1080 + `history:tiefe` depth24plus 1920×1080 |
| tex:output | 15,8 | 15,8 | rgba16float 1920×1080 |
| tex:TRAANode.resolve | 15,8 | 15,8 | rgba16float 1920×1080 |
| tex:kaskade0 | 12,0 | 12,0 | depth16unorm 2048² + farbe r8unorm 2048² |
| tex:kaskade1 | 12,0 | 12,0 | depth16unorm 2048² + farbe r8unorm 2048² |
| tex:depth | 7,9 | 7,9 | depth24plus 1920×1080 |
| tex:szene | 7,9 | 7,9 | **`szene:tiefenkopie` depth24plus 1920×1080** (die unbenannte Tiefen-Kopie aus der V18.531-Zerlegung steht noch, jetzt benannt) |
| tex:wege-karte | 4,0 | 4,0 | rg8unorm 1024² fern + nah |
| tex:karte-albedo | 2,7 | 2,7 | bc1 128×2048×16 |
| buf:tier | 2,5 | 2,7 | wesen · fuchs · bär |
| tex:feld-pass-panorama | 1,9 | 1,9 | rgba32float 768×160 |

Allein die Bildschirm-Ziele (TRAA history und resolve, output, depth, die Tiefen-Kopie) tragen am OMEN **71,1 MB**, die zwei
Kaskaden **24,0 MB**. Das deckt sich mit `kontext/s3-plan.md` §1.2. Drei 1920×1080-Tiefen leben nebeneinander: `depth`,
`TRAANode.history:tiefe` und `szene:tiefenkopie`.

## Auffälliges

- **Einzel-Hänger** (die offene Welle K) in 7 von 8 gültigen Boots ≥ 250 ms:
  - ohne Wetter-Wechsel: 3A voll **1,79 s** (viele Tiere), 6B frei **1,55 s** (viele Tiere), voll 375–433 ms in 4B, 6B und 8B;
  - in den verworfenen Boots mit Wetter-Wechsel: 2,8 s (1A v1) und 1,87 s (7A v1).
  
  Es gibt also mindestens zwei Hänger-Lagen: Tiere und Wetter-Wechsel.
- **CPU-Takt p95 unter voll:** A 36–41 ms in allen vier Boots, B 26–28 ms in drei von vier (2B: 38,1). Unter frei ist es gleich
  (18,5 / 19,1). Exakter Rangtest zweiseitig p ≈ 0,06. Das ist kein Befund, sondern ein Kandidat für die nächste Serie mit
  Tier-Zähler.
- **Profil `_fieldRaycast`** (Kreatur-KI, Regler voll, Tiere frei): A 15,9 / 25,2 / 19,7 / 17,2 % gegen B 25,0 / 27,5 / 32,8 / 22,0 %,
  Rangtest zweiseitig p ≈ 0,11. Die Folge zählt die Tiere noch nicht; die creatures-EWMA ist voll gleich (2,92 / 2,71 ms) und frei
  höher in B (3,04 / 6,94 ms, getragen von 4B, 6B und 8B). Die Nachbesserung der Welle K (Tier-Zähler in `/wache`) entscheidet das.
- **Band-Urteil ROT in jedem Boot.** Das ist das Profi-Band (Dreiecke 1,27×, VRAM 1,27×), keine Wache. Der Stempel-Pool blieb in
  jedem Schritt GRÜN (0 verweigerte Abfragen).

## Rohdaten

`bericht/0710-1-p1/`: je Boot das JSON der Folge (`1A.json` … `8B.json`), die zwei verworfenen (`*-verworfen-1.json`),
`auswertung.json`, `fortschritt.log` (Ruhe je Boot: GPU-Temperatur, Takt, P-Zustand, eigene Reste), `serie.sh` (Rahmen mit
Seiten-Wache und Wiederholung) und `auswertung.cjs`.
