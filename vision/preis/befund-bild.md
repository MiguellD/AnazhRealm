# Befund: die Bilder ueber 100 ms und das p95 der Radeon (Preis-Lauf, main 337846dc)

Stand: ZWISCHENSTAND, Teil 1 (Lesen der Roh-Stroeme). Die Messung am heutigen main (Teil 3) folgt in diesem Blatt.

## 1. Was die Roh-Stroeme sagen (Radeon 890M, 337846dc, `meisterkarte-quelle/punkte/messung/roh/337846dc-radeon/sitzung/strom.ndjson`)

Spalten je Bild: `STROM_SPALTEN` (punkte.cjs:2781) — `dt` (rAF zu rAF, nur gerenderte Bilder), `takt` (der ganze rAF-Rueckruf,
CPU), `gpu` (r184-Stempel `_gpuTsLast`, hoechstens alle 250 ms neu, `PERF_GPU_TS_TAKT_MS` dirigent-regler.js:2017).

**Das Fenster ist nicht „20 s an einer stehenden Welt“.** `/lauf` der Werkbank faehrt `{ sek: 20, ein: 30 }` (punkte.cjs:2894,
werkbank.cjs:3014): 30 s Einschwingen + 20 s Messung, und der Haken des Stroms zaehlt JEDES Bild der 50 s (richter-akte.cjs:47 nimmt
alles im Fenster). Die Akte urteilt also ueber das Einschwingen mit.

| Fenster (Akte) | Bilder | 0–3 s: n · >100 ms | 3–30 s: p50 · p95 · max | 30–50 s (der eigentliche Lauf): p50 · p95 · max | takt p50 (30–50 s) | gpu p50 |
|---|---|---|---|---|---|---|
| vegetation.K5#2 (jahreslauf, p95 58,5 · max 184) | 1370 | 43 · **15** | 33,5 · 50,3 · 75 | 33,5 · 58,5 · 75 | 9,4 ms | 5,1 ms |
| vegetation.K2#1 (kraft, p95 83,0 · max 268, f 2,05) | 838 | 53 · 2 | 58,1 · 83,4 · 268 | 59,1 · 80,7 · 134 | **51,6 ms** | 8,8 ms |
| klang.K4#2 (p95 76,4 · max 569, f 1,81) | 1209 | 54 · 2 | 41,9 · 58,8 · 75 | 50,3 · 83,2 · 259 | 11,7 (p95 68,5) | 8,0 ms |
| siedlung.K4#2 (Dorf, p95 33,5 · max 92) | 2148 | 102 · 0 | 25,1 · 33,5 · 84 | 25,0 · 33,5 · 50 | 9,5 ms | 5,6 ms |

Drei Lesarten, belegt:

1. **Die Bilder ueber 100 ms des Radeon-Preises (58,5 / 184) fallen ALLE im Einlauf**: 15 von 15 in den ersten 2,6 s nach dem Wechsel
   der Probe (vegetation.K5#2, t+0,0 … t+2,59 s, dt 100–184 ms bei takt 11–21 ms). Im selben Atem steigt der Heap 453 → 503 MB.
   Danach an der stehenden Welt: 0 Bilder ueber 100 ms, max 75 ms. Der Takt traegt sie NICHT (takt ≤ 21 ms): das Warten liegt
   ausserhalb des Takts (GPU-Leine, Neben-Arbeit, GC) — die Messung (Teil 3) nennt es.
2. **Das p95 der Radeon an der ruhigen Wiese ist ein Viertakt der 120-Hz-Anzeige**: dt sitzt auf Vielfachen von 8,33 ms (stehend
   3× 357, 4× 561, 5× 200, 6× 141, 7× 46 von 1327). Der Takt (CPU) braucht 9,4 ms, der gestempelte Render-Pass 5 ms — das Bild kommt
   trotzdem erst nach 33,5 ms (p50) bzw. 58,5 ms (p95). Die Luecke dt − takt (p50 24 ms) liegt weder im Takt noch in den
   Render-Stempeln. Zweifel am Stempel selbst: der Pool laeuft ueber (`stempel` 2430 verweigerte Abfragen im Strom, Stempel-Wache
   zerlege-linse.cjs:400 — ein Pass ohne Abfrage schreibt in fremde Plaetze), die gpu-Spalte unterschaetzt.
3. **Die Bilder ueber 100 ms der stehenden Welt sind CPU**, wo die Maschine geladen war: kraft (f 2,05) takt p50 51,6 ms an
   DERSELBEN Pose, an der jahreslauf 3 min spaeter 9,4 ms braucht; klang.K4#2 takt p95 68,5 ms, Heap 545 → 837 MB in 90 s.
   Siedlung (Dorf) zeigt dieselbe Leine ohne Last: p50 25 ms (3 Vsyncs), p95 33,5, kein Bild ueber 100 ms.

Der GTX-Strom (191,65 ms) liegt nicht unter roh/337846dc-gtx (nur vegetation.K2_1.out) — ungelesen.

## Messung 1 (Radeon, main 41ec3a96, 18:38–18:41, GPU-Schloss „befund-bild“) — irrtuemlich am Spawn (0, 0), nicht an der Wiese

`werkbank start --echt --ort wiese` stellt nur den Dorf-Zug, nicht die Pose (Kamera 0 · 92,4 · 0); die Wiese faehrt Messung 2.
Rohdaten: `artifacts/profiband/auge/w28-preis-ort/befund-bild/` (haenger-einlauf, haenger-steht, lauf, gpu-bank).
- Preis-Lauf-Zwilling (`lauf 20 --ein 30`, Regler frei) am Spawn: p95 25,2 ms · max 41,6 · takt p50 5,6 · Leine 52,6 % ausgesetzt ·
  GPU-Durchsatz p50 17,1 ms; gpu-bank: GPU 22,1 ms je Bild, CPU 1,7 ms — **gpuGebunden**.
- Haenger stehend (60 s nach 10 s Einschwingen, Regler voll): 85 Bilder > 50 ms, max 200,8 — 47 davon `_knotenRate › build`
  (EIN Knoten-Stoff 34–64 ms in EINEM Takt, `bauN 1 · bauMs 64,4`): der Vorbau der Bedienung (vorwaermen:human 1171 ms,
  tier 766, vorbau:fahrzeug_gt 400, vorbau:baum_eiche 360, vorbau:tor_drachentor 271 — Σ 3710 ms in 60 s).

## 2. Der Takt des Spiels (main 41ec3a96)

- Die EINE Frist der Bau-Arbeit: `_fristStellen` stamm/dirigent-takt.js:1875 (Soll 5,8 ms stehend minus Render-EWMA).
- Die GPU-Leine: `_gpuLeineFrei` dirigent-takt.js:799, `GPU_FRAMES_IM_FLUG = 2` welt-licht.js:148; ein Takt mit gespannter Leine
  zeichnet nicht (dirigent-takt.js:78, 357–363), der Abstand gerenderter Bilder ist die Rueckkehr von `onSubmittedWorkDone`
  (dirigent-takt.js:891).
- Neben dem Takt immer: `_tickFoundryIngest` (dirigent-takt.js:387), `_weltStandTakt` (389), `_vorbauBedienung` (408).
- Schatten vor dem Render: `_loopShadowUpdate` stamm/bild-schatten.js:1281.
