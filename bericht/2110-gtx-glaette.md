# Bericht 2110 GTX-Glätte (Profiband K4, Messschuld): `werkbank haenger 60 --wandern bahn` in 4 frischen Sitzungen gehend, main b9537781, 22.10. 04:15–04:30

**Urteil: Staffel 1 an der GTX erreicht — 4 von 4 Sitzungen ohne Frame > 100 ms** (Soll ≥ 3 von 4).

| Sitzung | Frames in 60 s | Frames > 100 ms | Frame p50/p95/p99/max ms | Ursachen (TAKT · NEBEN · GC · GPU) | Knoten-Bau synchron |
|---|---|---|---|---|---|
| s1 | 3597 | **0** | 16,7 / 25 / 33,4 / 83,2 | 0 · 0 · 0 · 0 | 0 |
| s2 | 3523 | **0** | 16,7 / 25 / 33,4 / 83,2 | 0 · 0 · 0 · 0 | 0 |
| s3 | 3533 | **0** | 16,7 / 25 / 33,4 / 83,6 | 0 · 0 · 0 · 0 | 0 |
| s4 | 3522 | **0** | 16,7 / 25,1 / 33,4 / **100,0** | 0 · 0 · 0 · 0 | 0 |

- **Ehrlich zu s4:** Der längste Frame liegt genau AUF der Schwelle (100,0 ms, gezählt wird > 100). Er ist von der Linse nicht benannt, weil sie erst darüber zählt. Die Staffel hält auch ohne s4 (3 von 4).
- **Weg:** Wiese Ego, Kopf main b9537781 (n2010-b2b, sauber), je Sitzung ein frischer Boot `--echt` 1920×1080, Regler voll, Tiere frei, Dorf-Zug aus. Danach Einschwingen (`lauf 30 --ein 20 --ruhe 300`) und `haenger 60 --regler voll --tiere frei --wandern bahn` (4 m/s, −z 0 → −60 m und zurück). GPU-Schloss je Sitzung.
- **`--wandern kreis`** kennt der Kopf nicht, nur `bahn`; das hat der Koordinator so bestätigt.
- **Verworfen:** zwei Anläufe zwischen 03:26 und 03:52, weil sie in die Nachtruhe 03:25–04:15 der Station fielen (Wartung des Rechners) bzw. eine Rest-Schleife ohne Nachtruhe lief. Ihre Teile liegen unter `verworfen/` und zählen nicht. Die gültige Serie lief nach 04:15.

Roh: OMEN `p3/n2210/glaette/`; hier `bericht/2110-gtx-glaette/` (s1–s4 haenger.txt/.json, serie.sh, fortschritt.log).

Status ZWISCHENSTAND + Übergabe: Profiband K4 Staffel 1 an der GTX gemessen. Als Nächstes läuft naesse-kosten (Zerlegung in einer Welt).

---

## Nachtrag 22.10. 04:46–05:26 — R8: der Regler des Spielers (`--regler frei`), main 7670a4a1

Der erste Lauf fuhr `haenger --regler voll`. R8 verlangt für Glätte den Regler des Spielers, darum dieselbe Messung noch einmal: 4 frische Sitzungen, Wiese Ego, `lauf 30 --ein 20 --ruhe 300 --regler frei` + `haenger 60 --regler frei --tiere frei --wandern bahn`, Kopf main 7670a4a1 (n2010-b2b, sauber).

**Urteil: Staffel 1 an der GTX auch mit dem Regler des Spielers erreicht — 4 von 4 Sitzungen ohne Frame > 100 ms.**

| Sitzung | Frames in 60 s | Frames > 100 ms | Frame p50/p95/p99/max ms | Ursachen (TAKT · NEBEN · GC · GPU) |
|---|---|---|---|---|
| s1 | 3749 | **0** | 16,6 / 25 / 33,4 / 75,0 | 0 · 0 · 0 · 0 |
| s2 | 3772 | **0** | 16,6 / 25 / 33,4 / 74,9 | 0 · 0 · 0 · 0 |
| s3 | 3730 | **0** | 16,6 / 25,1 / 33,5 / 91,6 | 0 · 0 · 0 · 0 |
| s4 | 3776 | **0** | 16,6 / 25 / 33,3 / 66,7 | 0 · 0 · 0 · 0 |

- Mit dem Regler des Spielers ist der längste Frame kürzer als unter `voll` (66,7–91,6 gegen 83,2–100,0 ms), bei rund 6 % mehr Frames.
- Zwischen s2 und s3 lief ein CI-echt-Job mit Vorfahrt (bis 05:15); s3 begann danach mit CI-Ruhe.
- Roh: OMEN `p3/n2210/glaette-frei/`; hier `bericht/2110-gtx-glaette/regler-frei/`.

---

## Nachtrag 22.10. 06:07–06:21 — frisch am main-Kopf e5003509 (V18.546.59; R6: der Speicher-Takt änderte sich seit 7670a4a1), `--regler frei`

**Urteil: Staffel 1 hält — 3 von 4 Sitzungen ohne Frame > 100 ms.** Eine Sitzung hat EINEN Hänger, beim Namen genannt.

| Sitzung | Frames | > 100 ms | Frame p50/p95/p99/max ms |
|---|---|---|---|
| s1 | 3708 | 0 | 16,6 / 25,1 / 33,4 / 66,6 |
| s2 | 3806 | 0 | 16,6 / 25 / 33,4 / 66,6 |
| s3 | 3727 | 0 | 16,6 / 25,1 / 33,6 / 66,7 |
| s4 | 3742 | **1** | 16,6 / 25 / 33,4 / 100,1 |

- **Der Hänger in s4:** t = 1 ms nach Mess-Beginn, dt 100,1 ms, ein Takt, TAKT 97 % · NEBEN 9 %.
  - Zweige: **`_loopAutoSave` 30 %** · `renderer._renderScene` 29 % · `_loopVoxelStreaming` 18 %.
  - Selbst: `_voxelSurfaceY` 7 % · **`saveState` 7 % · `setItem` 5 %**; Gerät texKB 1536.
  - Das ist der Auto-Speicher-Takt, der synchron in `localStorage` schreibt, genau im ersten Frame der Messung (zusammen mit einem Streaming-Takt). Er trifft die 100-ms-Grenze um 0,1 ms.
- Gegen 7670a4a1 (max 66,7–91,6 ms) stehen drei Sitzungen ruhiger (max 66,6–66,7). Der eine Hänger ist der Speicher-Takt beim Namen. Ein Täter erst bei ≥ 2 Boots (Regel 5): hier 1 von 4.
- Roh: OMEN `p3/n2210/glaette-e500/`; hier `bericht/2110-gtx-glaette/e5003509/`.
