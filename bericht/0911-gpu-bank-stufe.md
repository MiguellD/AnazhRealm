# gpu-bank-Stufe der GTX 1060: der Täter ist das Spiel (Bisekt 09./10.11.)

Auftrag: Koordinator K10, 09.11. 22:58 (Auftrag 5) und 10.11. 00:22 (gpu-stufe). Station OMEN, GTX 1060, Treiber und Takt unverändert.
Instrument: die gang-Probe `profiband.K3#1`, je Boot `punkte-offen.cjs lauf <sha> --nur profiband.K3#1`, beide Seiten kopflos.
Gemessen wird `gpuJeFrameMs` des gpu-bank-Bands (`band-<ort>-<sicht>.json`). Die CPU je Frame ist auf beiden Seiten gleich, also GPU-gebunden.

## 1. Gerät oder Spiel? Der Gegentest 2 + 2 (23:12–23:38, abwechselnd alt und Kopf)

| | alt 185e99bb | Kopf 78d37554 |
|---|---|---|
| wiese-ego gpu-bank | 20,24 / 20,66 ms | 29,80 / 30,49 ms |
| genesis-ego | 13,04 / 13,04 | 19,35 / 19,33 |
| genesis-third | 12,66 / 12,77 | 18,41 / 18,75 |
| cpuJeFrame wiese-ego | 4,98 | 5,05 |

nvidia-smi zeigte in allen vier Läufen dieselbe Geräte-Lage (höchstens 85 °C, 1822–1835 MHz, 77–83 W, Drossel 0x4 in 3–6 von 61 Proben auf beiden Seiten). Das Gerät ist damit entlastet, die Stufe kommt aus dem Spiel.
Roh: `p3/n0611/stufe/ergebnis.txt`, `p3/n0611/stufe/<nr>-<seite>-v<n>-werk/band-*.json`, `p3/n0611/zd/gpu-takt.csv`.

## 2. Bisekt 185e99bb..77265b04 (Schwelle 25,3 ms, je Schritt 2 Boots wiese-ego)

Erste Elternlinie (36 Commits):

| # | sha | wiese-ego | genesis-ego | |
|---|---|---|---|---|
| 4 | e84fd1fb | 21,13 / 20,90 | 13,05 / 13,07 | V18.546.212 |
| 5 | cd2dfafa | 20,65 / 20,69 | 13,09 / 13,18 | Merge w22-t4-heil |
| **6** | **b5012e8b** | **32,68 / 31,89** | **18,87 / 19,13** | **Merge w20-fern-hang** |
| 9 | bb421ed6 | 31,73 / 31,85 | 18,97 / 18,96 | Merge w22-gpu-probe |
| 18 | 1e783008 | 32,65 / 31,92 | 19,41 / 18,78 | Merge w22-geh-bild |

**Die Stufe ist der Merge b5012e8b (w20-fern-hang), 07.11. 22:17: wiese-ego 20,67 → 32,29 ms (+11,6 ms, ×1,56), genesis-ego 13,14 → 19,00 ms (+5,9 ms, ×1,45).**

Im Zweig (23 Commits, je auf seinem eigenen Stamm gemessen) wächst die Zeit in mehreren Stufen:

| Zweig-# | sha | wiese-ego | genesis-ego | |
|---|---|---|---|---|
| 11 | 0ab95ff4 | 22,98 / 23,19 | 14,09 / 14,03 | Merge main V18.546.203 (nach Luftschatten 86a0fd40 …) |
| 12 | ef6b3398 | 22,82 / 22,78 | 14,19 / 14,22 | Abgabe: Ersatz-Licht der Nacht |
| **13** | **af060762** | **25,98 / 25,86** | **15,65 / 15,71** | **der Grat nimmt dem Hang den Himmel (+3,1 ms)** |
| **14** | **81d7f991** | **30,08 / 29,69** | **18,34 / 18,39** | **die Himmels-Sicht tastet die Umgebung je Richtung (+4,0 ms)** |
| 17 | 16de086d | 30,97 / 31,36 | 18,77 / 18,95 | Merge integ-probe |

Die Zerlegung, wiese-ego: Zweig-# 1–11 etwa +2,4 ms (20,7 → 23,1, einzeln nicht gemessen; darunter „Luftschatten aus der Horizont-Karte“ 86a0fd40). af060762 bringt +3,1 ms, 81d7f991 +4,0 ms. Zweig-# 15–17 tragen +1,3 ms, # 18–23 samt Merge +1,1 ms.

## 3. Die Stelle

Der Term ist die **Himmels-Sicht des Grats** (ferne.K4): `_horizontHimmel` läuft je Fragment in der Bestrahlung jedes beleuchteten Stoffs.

- **af060762** `stamm/bild-sicht.js:696`: `const frei = T.max(himmel.sub(wirt._horizontHimmel(T.shadowPositionWorld, n)), T.vec3(0));` steht im Knoten der Bestrahlung. Seitdem zahlt jeder Stoff je Pixel einen Abruf der Horizont-Karte und die Schleife (22,8 → 25,9 ms).
- **81d7f991** `stamm/bild-sicht.js:697–702`: `strahlung(dir)` wertet je Richtung der Schleife die Himmels-Strahlung der Stoffe aus (`himmelDerStoffe(quelle, U, dir, gratRauheit)`). Das sind drei Abrufe der Umgebung mehr je Pixel (25,9 → 29,9 ms).
- **Am Kopf 78d37554:**
  - `stamm/dirigent-ankunft.js:1524–1564` `_horizontHimmel`: Abruf der Karte (:1530), `T.Loop(3, …)` (:1547) mit `strahlung(dir)` je Schritt (:1554).
  - Der Aufruf steht in `stamm/bild-sicht.js:705`, die Strahlung ist `stamm/bild-sicht.js:699` `wirt._atmoLutBau().himmelFarbe(dir)`.
  - Außerhalb der Karte und wo sie ruht, wird das Ergebnis erst am Ende mit `_imEinheitsQuadrat(q) · K.U.aktiv` genullt (:1560–1561). Die Schleife läuft also auf jedem Pixel, auch in der Genesis (×1,45).

Hebel, für den Macher, nicht gemessen:
- Das Band nur dort rechnen, wo `aktiv · imEinheitsQuadrat > 0` ist (Verzweigung vor der Schleife).
- Den Term auf den Boden-Stoff begrenzen.
- Die drei Abtastungen in eine Tafel der Karte vorziehen.

## 4. Nebenbefunde

- Das GPU-Schloss stand 23:39–00:07 verwaist: Die Sitzung hielt den ersten Treiber an, der Baum starb samt `gpu-lauf.sh`. Der Treiber davor wartete in einem eigenen `frei()`.
- Die Wurzel ist geschnitten: koordination a81c428f (`gs_uebernimm`, der Wartende bricht und übernimmt); die 34 Treiber der OMEN fragen `gpu_frei` der Quelle.
- Ein Boot (2-kopf v1) riss den 90-s-Deckel der gang-Probe (UNGEMESSEN) und lief neu. Ein Boot (1e783008 b1 v1) wurde vom echt-Job verdrängt und zählte nicht.

Roh: `p3/n0611/stufe/bisect.json` (alle Boots), `p3/n0611/stufe/bisect.log`, je Boot `p3/n0611/stufe/bis/<teil>/band-{wiese,genesis}-ego.json` und `profiband.K3_1.out`. Zwischenstand-Zeilen je Boot stehen in zug/erledigt.txt.
