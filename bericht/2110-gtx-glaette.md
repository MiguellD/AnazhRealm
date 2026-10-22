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
