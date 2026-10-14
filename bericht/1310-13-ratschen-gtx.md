# Bericht 1310-13 — die GTX-Ratschen für band-leser (Fundament von E)

**Status: ZWISCHENSTAND.**

**Urteil:** Vier GTX-Ratschen sind gemessen und neu gemintet, an V18.545 (main 6898706f) mit der Messfolge von K26:
wiese × gtx × ego, genesis × gtx × ego, wiese × gtx × third, genesis × gtx × third.
- Zweig **band-leser-gtx** ab band-leser d935ccbb, nur die Ratschen-Dateien: c245a433 (Ego) + **b61143c3** (Third),
  gepusht `[skip ci]`.
- Jede Zeile ging von ungemessen auf gemessen, keine wurde angehoben. Die Linse war bei jedem Mint sauber.
- `gate:profiband` H2b nennt die vier GTX-Zeilen nicht mehr. Rot bleiben dorf × gtx × ego/third, alle Radeon-Zeilen (der
  lokale Arbeiter) und die Gesamt-Zeilen der alten Radeon-Ratsche: 13 Befunde.
- Die Messfolge trägt Third-Person, belegt: Messung `sicht: third`, Ort gestellt mit `sicht: third`, der Leib steht im
  Hauptbild (Spieler 13 statt 5 Befehle).
- **Für E:** In Third-Person liegt das Band an beiden Orten über dem Soll:
  - Genesis 958k Dreiecke (1,41×) und 131,5 MB;
  - Wiese 119,7 MB (1,02×), dazu einmal Frame p95 17,1.
  - Der größte Posten ist der Leib im Hauptbild: Einzelstücke haupt 12k → 174k (Wiese) bzw. 25k → 190k (Genesis).

## Die Messung

- Instrument: `band-leser-gtx` (omen-messfolge, werkbank, band-urteil von K26). Seite: `abab-b545` = V18.545.
- Je Ort × Sicht zwei Serien aus Erst- und Zweit-Boot (`--serie`, das benannte Profil hält die Platte), also 4 Läufe.
- Bedingungen: Regler voll, eingeschwungen (Satz-Wache der Band), Takt und Drossel je Bank, Auto-Dorf aus. Vor jedem
  Erst-Boot fällt der Spielstand der Seite beiseite.
- Seiten-Wache: Fingerabdruck `cf1368ad…` (1310-14) vor und nach jedem Lauf, alle grün.
- Jeder Lauf endet mit exit 1, und der Leser nennt genau einen Befund: „ungemessen“ (die Ratsche fehlte). Sonst nichts.
- Mint: `werkbank ratsche --neu <4 Läufe>` je Ort × Sicht (`wiese-ego.txt`, `genesis-ego.txt`, `wiese-third.txt`,
  `genesis-third.txt`).
- Rohdaten: `ego/` und `third/` mit je 8 Boot-JSON und `fortschritt.log`.

## Re-Mint deklariert: Klasse × Pass, Befehle/Dreiecke (vorher überall ungemessen)

| Klasse | Wiese ego (haupt · k0 · k1) | Wiese third | Genesis ego | Genesis third |
|---|---|---|---|---|
| boden | 6/70k · 1/49k · 1/55k | 6/78k · 1/57k · 1/58k | 6/100k · 1/92k · 1/70k | 6/108k · 1/101k · 1/92k |
| baum | 24/62k · 9/13k · 2/1,6k | 22/54k · 10/13k · 2/1,1k | 12/21k · 8/11k · 0 | 17/25k · 9/9,7k · 1/0,5k |
| busch | 4/12k · 2/6,1k · 0 | 4/12k · 2/5,1k · 0 | 0 | 0 |
| nahWiese | 4/57k · 0 · 0 | 4/74k · 0 · 0 | 3/1,3k · 0 · 0 | 2/1,8k · 0 · 0 |
| streu | 5/30k · 0 · 0 | 4/21k · 0 · 0 | 2/5,2k · 0 · 0 | 6/13k · 0 · 0 |
| karten | 1/1,2k · 0 · 0 | 1/1,2k · 0 · 0 | 1/0,8k · 0 · 0 | 1/0,9k · 0 · 0 |
| bau | 2/18k · 1/0,7k · 1/0,5k | 2/18k · 1/0,7k · 1/0,5k | 62/221k · 26/33k · 1/48 | 71/296k · 26/33k · 1/72 |
| formationen | 1/3,8k · 1/4,5k · 1/1,9k | 1/4,5k · 1/4,5k · 1/1,9k | 2/9,5k · 2/13k · 1/1,0k | 2/12k · 2/17k · 2/5,1k |
| einzelstuecke | 8/12k · 5/38k · 0 | **16/174k** · 5/38k · 0 | 14/25k · 8/47k · 2/6,5k | **22/190k** · 8/47k · 2/6,5k |
| tier | frei | frei | frei | frei |
| **gesamt** | **79 / 436 360 / 112,4 MB** | **85 / 617 819 / 119,7 MB** | **152 / 657 841 / 119,0 MB** | **180 / 958 386 / 131,5 MB** |

Die genauen Zahlen stehen in den Ratschen-Dateien und in den Mint-Ausgaben, VRAM je Erzeuger ebenda.

## Frames je Sicht (Regler voll, je Boot fps / Frame p50 / p95 / CPU-Takt p95 / Band-GPU ms)

| Ort × Sicht | erst 1 | zweit 1 | erst 2 | zweit 2 |
|---|---|---|---|---|
| Wiese ego | 66,4 / 16,7 / 16,9 / 5,5 / 15,97 | 70,5 / 16,6 / 16,8 / 6,0 / 13,57 | 65,3 / 16,7 / 16,8 / 5,7 / 16,03 | 70,5 / 16,6 / 16,8 / 5,6 / 14,07 |
| Wiese third | 62,3 / 16,7 / 16,8 / 5,8 / 17,98 | 67,9 / 16,6 / 16,8 / 6,2 / 15,73 | 61,2 / 16,7 / 16,9 / 6,2 / 15,49 | 59,0 / 16,7 / 17,1 / 6,6 / 15,91 |
| Genesis ego | 51,5 / 16,7 / 25,1 / 7,2 / 18,78 | 51,3 / 16,7 / 25,1 / 6,9 / 18,75 | 51,4 / 16,7 / 25,1 / 7,1 / 19,55 | 51,3 / 16,7 / 25,1 / 7,0 / 19,21 |
| Genesis third | 54,8 / 16,7 / 25,1 / 8,4 / 17,45 | 55,7 / 16,7 / 25,1 / 7,9 / 17,57 | 54,9 / 16,7 / 25,1 / 8,9 / 17,83 | 55,7 / 16,7 / 25,1 / 7,5 / 17,37 |

- Third-Person kostet an der Genesis CPU (p95 7,5–8,9 gegen 6,9–7,2), an der Wiese GPU (bis 17,98 ms gegen 13,6–16,0) und
  fps (−4).
- An der Genesis liegt die GPU in Third niedriger (17,4–17,8 gegen 18,8–19,6), denn die Kamera blickt anders.
- Der Zweit-Boot liegt an der Wiese in beiden Sichten schneller als der Erst-Boot (fps +4 bis +6). Die Ratsche umfasst
  beide, so wie es das Gesetz der Serie verlangt.

## Pflicht-OFFEN Rest

- dorf × gtx × ego/third: nicht beauftragt, nicht gemessen; die Messfolge trägt den Ort. H2b steht dort rot.
- Die Radeon-Zeilen misst der lokale Arbeiter. Bis dahin steht band-leser rot an H2b, absichtlich.
- **E in Third-Person:**
  - Der Leib im Hauptbild trägt ~160k Dreiecke und 8 Befehle (Täter `spieler` 13).
  - Genesis third liegt bei 958k Dreiecken (1,41×) und 131,5 MB (1,12×).
  - Benannt, nicht geschnitten.

## Status ZWISCHENSTAND + Übergabe

- Branch **band-leser-gtx**, Kopf **b61143c3** (auf c245a433 auf band-leser d935ccbb), gepusht `[skip ci]`. Nur
  Ratschen-Dateien.
- Ohne CI-Lauf, weil band-leser bis zu den Radeon-Zeilen an H2b rot steht. Lokal `diag-profiband`: H2b ohne GTX-Wiese/Genesis.
- Werkzeug `p3/k13/serie.sh` (SICHT, ORTE; Fingerabdruck-Wache vor und nach jedem Lauf).
- Messbaum `band-leser-gtx`.
