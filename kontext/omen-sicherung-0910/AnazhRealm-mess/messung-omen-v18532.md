# Messung OMEN — V18.531 (main 2b60988b) gegen Kandidat V18.532 (kandidat-v18532 = 251f2f72)

Gemessen 07.10.2026, 00:06–00:22, am ruhigen Messplatz OMEN (LAPTOP-4BN3RL0L).

**Rechner:** NVIDIA GeForce GTX 1060 (Pascal, Treiber 31.0.15.2824) · i7-8750H · 16 GB · 1920×1080 @ 120 Hz · Windows 11 26200 · node v24.14.1. WebGPU auf der echten GPU (vendor nvidia, arch pascal), nicht swiftshader.

## Aufbau

- Worktrees: `mess-a` = 2b60988b und `mess-b` = 251f2f72, je mit `npm ci`.
- Folge ABAB mit vier frischen Boots. Je Boot: save-server und werkbank aus dem eigenen Worktree, `PORT=4312`, `werkbank start --echt --port 4490 --seite http://localhost:4312`.
- Je Boot, in dieser Reihenfolge:
  1. `eval "window.__anazhAutoSettlement = false"` (beide Stände lesen den Hook)
  2. `fenster 1920 1080`
  3. `umstellen -900 -850`
  4. Bühne: `__buehne()` + `weatherEffectTime = -1e7`, yaw 0, pitch 0
  5. `band`, `gpu-bank 12 --runden 3`
  6. `lauf 30 --ein 20 --ruhe 300 --tiere frei --regler frei`, dann dasselbe mit `--regler voll`
  7. yaw −0,88 und Bühne: `band`, `gpu-bank`, `zaehlen`, `schirm`
- Wetter am Ende jedes Boots: sunny, Tag 0,508, Auto-Dorf weiterhin false.
- Inhalt von B: 251f2f72 = cf9a07ba + 1 Commit (Gelände-normalNode). Die Branches welle-c-sicht, welle-g-boden, welle-g-feldpass, welle-g-post und kandidat-zerlegen sind **nicht** enthalten.

## Je Lauf

### band und gpu-bank

| Boot | Blick | Befehle (h/k0/k1) | Dreiecke | VRAM MB | band GPU ms | gpu-bank GPU / CPU ms | Tiere |
|---|---|---|---|---|---|---|---|
| 1A | yaw 0 | 186 (114/60/12) | 2241k | 157,5 | 25,47 | 25,41 / 4,99 | Wesen 15 |
| 1A | yaw −0,88 | 223 (112/54/57) | 2621k | 157,6 | 24,27 | 23,49 / 5,85 | Wesen 19 |
| 2B | yaw 0 | 115 (77/31/7) | 860k | 151,6 | 29,17 | 29,87 / 10,30 | Wesen 20, Fuchs 5 |
| 2B | yaw −0,88 | 94 (55/29/10) | 698k | 148,8 | 28,18 | 27,58 / 9,89 | Wesen 14, Fuchs 5 |
| 3A | yaw 0 | 176 (111/53/12) | 2166k | 157,7 | 26,76 | 26,54 / 4,90 | Fuchs 5 |
| 3A | yaw −0,88 | 226 (115/54/57) | 2630k | 157,8 | 25,69 | 25,58 / 5,05 | Fuchs 22 |
| 4B | yaw 0 | 110 (65/38/7) | 918k | 151,5 | 26,81 | 27,53 / 8,76 | Fuchs 20 |
| 4B | yaw −0,88 | 114 (49/41/24) | 803k | 149,2 | 26,29 | 26,36 / 8,73 | Fuchs 28, Wesen 14 |

Alle band-Läufe enden mit BAND ROT und LINSE ROT (Ratsche), wie in den früheren Serien.

### lauf 30 (yaw 0)

| Boot | Regler | fps | Frame p50/p95 ms | CPU-Takt p50/p95 ms | gpuMs (haupt) | GPU-Durchsatz p50 | Draws | Dreiecke | VRAM | creatures / render EWMA |
|---|---|---|---|---|---|---|---|---|---|---|
| 1A | frei | 31,6 | 33,3 / 41,7 | 13,5 / 17,5 | 12,53 (10,21) | 32,0 | 142 | 1350k | 157,5 | 5,1 / 4,3 |
| 1A | voll | 37,1 | 25,0 / 33,5 | 15,3 / 18,6 | 6,69 (3,68) | 26,4 | 176 | 1897k | 157,6 | 3,8 / 6,2 |
| 2B | frei | 31,1 | 33,3 / 41,9 | 21,4 / 28,7 | 9,82 (7,86) | 33,2 | 78 | 476k | 144,4 | 8,7 / 7,8 |
| 2B | voll | 28,3 | 33,4 / 50,1 | 26,5 / 34,6 | 9,85 (7,50) | 35,7 | 110 | 788k | 148,8 | 9,2 / 12,9 |
| 3A | frei | 37,2 | 25,0 / 33,4 | 12,5 / 15,8 | 7,18 (5,11) | 27,1 | 141 | 1304k | 157,7 | 4,1 / 4,4 |
| 3A | voll | 35,9 | 25,1 / 33,4 | 14,0 / 17,2 | 7,85 (4,78) | 27,6 | 177 | 1904k | 157,8 | 3,9 / 5,6 |
| 4B | frei | 32,4 | 33,3 / 41,7 (max 991,6) | 19,2 / 24,7 | 8,34 (6,28) | 30,2 | 67 | 447k | 144,7 | 7,6 / 7,0 |
| 4B | voll | 30,9 | 33,3 / 41,8 | 24,4 / 32,4 | 8,27 (5,84) | 33,0 | 112 | 838k | 149,1 | 6,5 / 12,0 |

## Median A gegen Median B

| Größe | A (V18.531) | B (V18.532) | B − A |
|---|---|---|---|
| band Befehle yaw 0 / −0,88 | 181 / 224,5 | 112,5 / 104 | −38 % / −54 % |
| band Dreiecke yaw 0 / −0,88 | 2204k / 2626k | 889k / 751k | −60 % / −71 % |
| band VRAM yaw 0 / −0,88 | 157,6 / 157,7 MB | 151,6 / 149,0 MB | −6 / −9 MB |
| **gpu-bank yaw 0** | **25,98 ms** | **28,70 ms** | **+2,7 ms** |
| **gpu-bank yaw −0,88** | **24,53 ms** | **26,97 ms** | **+2,4 ms** |
| gpu-bank CPU je Frame | 4,9–5,9 ms | 8,7–10,3 ms | +4 bis +5 ms |
| lauf frei: Frame p50 / p95 | 29,2 / 37,6 | 33,3 / 41,8 | +4,2 / +4,2 |
| lauf frei: CPU-Takt p50 / p95 | 13,0 / 16,7 | 20,3 / 26,7 | +7,3 / +10,0 |
| **lauf voll: Frame p50 / p95** | **25,05 / 33,45** | **33,35 / 45,95** | **+8,3 / +12,5** |
| **lauf voll: CPU-Takt p50 / p95** | **14,65 / 17,9** | **25,45 / 33,5** | **+10,8 / +15,6** |
| lauf voll: fps | 36,5 | 29,6 | −6,9 |
| lauf voll: GPU-Durchsatz p50 | 27,0 | 34,4 | +7,4 |
| lauf voll: render-EWMA | 5,9 | 12,5 | +6,6 |
| lauf voll: creatures-EWMA | 3,9 | 7,9 | +4,0 (mehr Tiere in B) |

## Urteil

**B ist an diesem Platz langsamer als A, obwohl es viel weniger zeichnet.** Unter dem Regler voll steigt der Frame-p50 von 25 auf 33 ms, also vom dritten auf den vierten VSync-Tick bei 120 Hz.

- **CPU:** Die render-EWMA steigt von 5,9 auf 12,5 ms. Das ist die bekannte Sicht-Kette (_passSicht → _chunkSatzPass → _hoehlenSicht/-Licht, ~6 ms je Frame, Profil vom 06.10.). Der Schnitt dafür liegt auf welle-c-sicht und ist in 251f2f72 nicht enthalten. Mit dem Auto-Dorf aus liegt A jetzt bei nur 14–15 ms CPU-Takt, darum schlägt dieser Mehrpreis voll durch.
- **GPU:** gpu-bank liegt bei B um +2,4 bis +2,7 ms höher (Median aus je 2 Boots). In der ABAB-Serie vom 06.10. (cf9a07ba, Auto-Dorf an) war gpu-bank A gegen B gleich (27,3 / 27,3). Möglich ist, dass der einzige neue Commit (Gelände-normalNode `normalWorldGeometry × faceDirection`) den Boden-Shader verteuert. Möglich ist auch, dass die höhere CPU je Bank-Frame (8,7–10,3 statt ~5 ms) in die Bank durchschlägt. Ein kurzer A/B cf9a07ba gegen 251f2f72 würde das trennen.
- **Geometrie:** wie erwartet besser — Befehle −38 bis −54 %, Dreiecke −60 bis −71 %, VRAM −6 bis −9 MB.
- **Tiere ungleich:** B hatte in beiden Boots mehr Tiere im Bild (Wesen und Fuchs, bis 42 Befehle). creatures-EWMA +4 ms erklärt einen Teil, aber nicht den Sprung der render-EWMA.

## Auffälligkeiten

- Bild: Die Schirme bei yaw −0,88 von A und B sind visuell gleich und heil. Der Boden ist nicht dunkel (das Ziel von 251f2f72).
- Abstürze: keine.
- 4B, lauf frei: ein einzelner Frame mit **991,6 ms** (max). Sonst max ≤ 92 ms.
- In allen Läufen (A und B) erscheint die Konsolen-Warnung „THREE.WebGPUTimestampQueryPool [render]: Maximum number of queries exceeded …" (aus dem lauf-Stempel; in beiden Ständen gleich).
- Der zweite band (yaw −0,88) schwang jeweils nach 3 s ein (40 Takte), weil die Welt schon stand.

Rohdaten (OMEN): `C:\Users\micha\Desktop\AnazhRealm-OMEN\ab532\`, mit band-, gpu-bank-, lauf-, zaehlen-Dateien und Schirmen je Boot sowie `zusammen.json`.
