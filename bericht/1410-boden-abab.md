# Bericht 1410 Boden — ABAB integ-probe 9d3292de (K51-3 weiche Boden-Stufen, Code 60891c67) gegen main c5e2fc8f

**Status: ZWISCHENSTAND.**

**Urteil (OMEN, GTX, Wiese K55 −278/−1038 Blick −z, Regler voll, 2 Boots je Seite im Wechsel, 2σ gepoolt):**
- **Im Stehen** ist K51-3 auf der GPU und im Frame **nicht langsamer**.
  - Frame p50/p95 8,4 / 16,8 auf beiden Seiten.
  - gpu-bank und Band-GPU im Rauschen, Ego wie Third.
  - Boden-Dreiecke −8 000 (haupt 55 698 → 52 643, k0 15 309 → 12 193, k1 7 467 → 5 772), Befehle und VRAM gleich.
  - Nur fps (Ego −5,4 bei 2σ 3,2) und CPU-Takt p95 voll (Ego +0,8 bei 2σ 0,8, Third +0,5 bei 2σ 1,0) liegen am Rand.
- **Beim Gehen ist K51-3 LANGSAMER.** Das genannte Risiko „Neubauten beim Gehen“ ist bestätigt.
  - Eingeschwungen gehend: CPU-Takt p95 14,5 → 16,0 ms (+1,5, 2σ ≈ 0,9), p50 10,6 → 11,2, fps 74 → 70.
  - Gehend, während die Welt noch einströmt: CPU-Takt p95 24,1 → 34,1 ms, Frame p95 28,7 → 41,6 ms. Das reißt das
    Profi-Band (≤ 33 ms); main hält es mit 26,6–30,7.
- **Die Täter beim Gehen** (CPU-Profil 20 s gehend, je Frame):
  - Gesamt: `loop` 14,2 → 16,1 ms (+1,9).
  - `_loopVoxelStreaming`: 4,20 → 5,44 ms (+1,25), darin `_dispatchFrameJobs` +0,63.
  - `_tickFernRing`: 0 → 0,58 ms. Der Fern-Ring tickt beim Gehen neu.
  - Render-Pfad: +0,5 ms.
  - Selbstzeit: `_hoehlenSichtLicht` +178 µs, `_bodenKarteAusMesh` +140, `_bodenSichtAt` +109, `_fernRingKlassen` +105,
    `_hydroDistAt` +93.
  - Der Geomorph selbst: `_applyCrossLodGeomorph` +89 µs, `updateAttribute` +69 µs.
  - Der Morph kostet also wenig. Teuer sind die Neubauten und Nachfolger, die ein Stufen-Wechsel beim Gehen anstößt:
    Boden-Karte aus dem Mesh, Sicht-Boden, Fern-Ring.

## Im Stehen je Sicht (Mittel je Seite, Werte je Boot; `auswertung-w-*.md`)

| Größe | Ego A → B (Δ, 2σ) | Third A → B (Δ, 2σ) |
|---|---|---|
| fps | 96,6 → 91,2 (**−5,4**, 3,2) | 94,4 → 90,7 (−3,7, 3,8) |
| Frame p50 / p95 ms | 8,4 / 16,8 → 8,4 / 16,8 | 8,4 / 16,8 → 8,4 / 16,8 |
| CPU-Takt p95 voll ms | 6,0 → 6,8 (+0,8, 0,8) | 6,7 → 7,2 (+0,5, 1,0) |
| CPU-Takt p95 frei ms | 6,4 → 6,3 | 7,3 → 7,0 |
| gpu-bank Gier 0 ms | 8,02 → 8,23 (+0,22, 0,33) | 9,07 → 8,95 (−0,12, 0,50) |
| gpu-bank Gier −0,88 ms | 9,27 → 8,98 (−0,28, 0,30) | 9,41 → 9,50 (+0,09, 0,09) |
| Band-GPU ms | 10,75 → 11,03 (+0,28, 0,60) | 10,25 → 10,54 (+0,29, 0,45) |
| Befehle / Dreiecke / VRAM MB | 74 / 287 609 / 94,2 → 74 / 279 577 / 94,3 | 85 / 324 300 / 95,9 → 85 / 316 144 / 95,2 |

- **Drossel:** 0x0 / 0x1 in allen 16 Abfragen. Seiten-Wache nie rot.
- **Profil im Stehen** je Frame: keine große neue Zeile; `_chunkSatzPass` +19 µs, `loop` +17 µs.

## Gehen (je Seite 2 Sitzungen, Reihenfolge A B, dann B A)

Der Spieler geht an der Wiese geradeaus nach −z, 0 → −60 m und zurück, 4 m/s. Der Haken sitzt in `tickAffordances` (je
Frame aus `loop`), gemessen im echten Lauf `werkbank lauf 30 --regler voll`.

| Lauf | A main: fps / Frame p95 / CPU p50 / CPU p95 | B K51-3 |
|---|---|---|
| gehen 1 (die Welt strömt noch ein), Sitzung 1 | 61,4 / 30,7 / 10,7 / 24,6 | 60,4 / 41,6 / 11,3 / 35,9 |
| gehen 1, Sitzung 2 | 60,8 / 26,6 / 10,9 / 23,6 | 58,8 / 41,5 / 11,3 / 32,2 |
| gehen 2 (eingeschwungen), Sitzung 1 | 74,9 / 24,9 / 10,3 / 14,1 | 70,0 / 25,0 / 11,2 / 16,2 |
| gehen 2, Sitzung 2 | 73,9 / 17,0 / 10,8 / 14,9 | 70,4 / 25,0 / 11,1 / 15,8 |

- Der Geher lief je Lauf 4 Wege über 60 m (`wege` 4).
- Der Steh-Lauf direkt nach dem Umstellen ist das Einströmen (Frame p95 58 ms, beide Seiten gleich) und zählt nicht.

## Die Messung

- **Seiten:** `abab-p5e2` (main c5e2fc8f), `abab-p9d3` (9d3292de; Code-Stand wie 60891c67).
- **Instrument:** EIN Instrument `abab-i9d3` (omen-messfolge 9d3292de), lokal gepatcht nur die Wiese (K55).
- **Gehen:** `gehen.sh` (stehen 25 s, zweimal gehen 30 s), `gehen-profil.sh` (gehen 30 s, dann profil 20 s gehend).
- **Rohdaten** `bericht/1410-boden/`: 8 Boot-JSON, Auswertungen, `gehen-1/`, `gehen-2/`, `gehen-profil/`, Skripte.

## Pflicht-OFFEN Rest

- **E (Profi-Band):** Gehend reißt K51-3 Frame p95 beim Einströmen (41,6 > 33). Der CPU-Takt p95 liegt gehend bei 16 ms
  gegen 14,5, im Stehen 6,8 / 7,2 > 5,8.
- **Der Schnitt** gehört an die Folge-Arbeit des Stufen-Wechsels: `_loopVoxelStreaming` / `_dispatchFrameJobs`,
  `_tickFernRing`, `_bodenKarteAusMesh`. Der Geomorph selbst ist billig. Benannt, nicht geschnitten.

## Status ZWISCHENSTAND + Übergabe

- Kein Code-Commit.
- **Messbäume:** `abab-p5e2`, `abab-p9d3`, `abab-i9d3` (Wiese lokal gepatcht), Werkzeug `p3/k1410f`.
- Ich ruhe.
