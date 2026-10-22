# Bericht 2210 ABAB Faden (GTX): B b9d99b9e ist im Dorf LANGSAMER — Täter beim Namen: das Vorrat-Pingpong von siedlung-k5

**Aufbau**
- A = n2010-b2a (main e3dd2b67, V18.546.63), B = n2010-b2b (b9d99b9e, V18.546.65 = + heap-leck, siedlung-k5, stand-treue, fernwald-wackler).
  - Beide Bäume sauber; Seiten-Wache je Boot: A FP cb6076266e25691e, B FP ece7c7ff56d9cc53.
- Instrument: die Werkbank aus B. Je Zelle A1 B1 A2 B2, frische Sitzung, `--echt`, 1920×1080, Regler voll, Tiere frei; Schloss je Boot.
- Zellen:
  - **Genesis Third**: stehend, dazu gpu-bank.
  - **Wiese Ego**: stehend und gehend (4 m/s, −z 60 m, 128 m in 30 s).
  - **Dorf −4,−4 Ego**: stehend um 8 Uhr, Dorf-Zug an, dazu gpu-bank — wie im ABAB bewohner-gang.
- Urteil: `auswertung-gehen.cjs`. Δ B − A gegen 2σ gepoolt, Welch-t, Werte je Boot in Klammern; „nicht langsamer“, wenn Δ ≤ 2σ.
  - Die Kopfzeile der Mittel-Tabelle im Roh (`A 32b37933 · B 5951786f`) ist eine alte Beschriftung im Auswerter. Es gelten die Bäume oben.
- Start 16:29: Das Schloss hielt bis dahin der hängende integ-echt-Job 39780312347.

## Gemessen

| Zelle | Größe | A (A1 · A2) | B (B1 · B2) | Δ B − A | 2σ | Urteil |
|---|---|---|---|---|---|---|
| Genesis Third steht | Frame p95 | 16,8 (16,8 · 16,8) | 16,8 (16,8 · 16,8) | 0,0 | 0,0 | nicht langsamer |
|  | CPU-Takt p95 | 6,1 (6,1 · 6,1) | 6,4 (6,9 · 5,9) | +0,3 | 1,0 | nicht langsamer |
|  | Belegung p95 | 7,71 | 8,27 (9,04 · 7,49) | +0,56 | 1,55 | nicht langsamer |
|  | GPU je Bild (gpu-bank) | 11,23 (11,12 · 11,34) | 11,60 (11,48 · 11,71) | +0,37 | 0,32 | **LANGSAMER (knapp, t 2,3)** |
| Wiese Ego steht | fps | 77,5 (77,3 · 77,8) | 76,8 (76,7 · 76,9) | −0,7 | 0,5 | **LANGSAMER (knapp, t −2,8)** |
|  | CPU-Takt p95 | 4,5 (4,4 · 4,5) | 4,5 (4,5 · 4,5) | 0,0 | 0,1 | nicht langsamer |
|  | GPU je Bild (gpu-bank) | 12,07 (12,08 · 12,07) | 12,34 (12,21 · 12,46) | +0,26 | 0,25 | **LANGSAMER (knapp, t 2,1)** |
|  | k0 p50 | 0,62 (0,63 · 0,61) | 0,26 (0,26 · 0,26) | −0,36 | 0,02 | k0-Zustand der Sitzung (0,26 ↔ 0,62, benannt), kein B-Term |
| Wiese Ego geht | Frame p95 / p99 | 25,1 / 41,7 | 25,1 / 33,5 | 0,0 / **−8,2** | 0,0 / 0,1 | nicht langsamer, p99 besser |
|  | CPU-Takt p50 / p95 | 11,30 / 19,9 | 11,15 / 19,5 | −0,15 / −0,4 | 0,36 / 1,0 | nicht langsamer |
|  | GPU p95 (lauf) | 2,57 | 2,68 | +0,11 | 0,09 | LANGSAMER (knapp, t 2,5) |
| **Dorf Ego steht** | fps | 76,5 (76,8 · 76,3) | 79,3 (79,3 · 79,4) | +2,8 | 0,5 | nicht langsamer |
|  | CPU-Takt p50 | 4,05 (4,10 · 4,00) | 4,50 (4,50 · 4,50) | **+0,45** | 0,10 | **LANGSAMER (t 9,0)** |
|  | CPU-Takt p95 | 5,4 (5,6 · 5,3) | 6,3 (6,3 · 6,2) | **+0,8** | 0,3 | **LANGSAMER (t 5,1)** |
|  | Belegung p50 / p95 | 5,51 / 7,26 | 6,04 / 8,46 | **+0,53 / +1,20** | 0,14 / 0,35 | **LANGSAMER** |
|  | außer Takt p95 | 0,75 | 1,06 (1,07 · 1,04) | **+0,31** | 0,04 | **LANGSAMER (t 16,9)** |
|  | KI-Uhr Mittel | 0,222 | 0,321 | +0,099 | 0,004 | LANGSAMER |
|  | GPU je Bild (gpu-bank) | 12,10 (12,07 · 12,13) | 12,42 (12,47 · 12,37) | +0,32 | 0,12 | LANGSAMER (t 5,5) |
|  | GPU p95 (lauf) | 3,23 | 2,13 | −1,10 | 0,33 | nicht langsamer |
|  | Einschwingen `--ruhe 300` | ruhig nach 3 s (2/2) | **nie ruhig, 300,1 s, `foundry: 1`** (2/2) | | | **die Welt steht nie** |
|  | Dreiecke Mittel | 421k | 438k | +17k | | andere Szene |

(alle Zeitwerte in ms)

## Der Täter beim Namen: das Vorrat-Pingpong von siedlung-k5 (`_tickAutoSettlement` → `_dorfBereiten`)

- **Am Dorf kommt B nie zur Ruhe.**
  - In beiden Boots meldet `lauf --ruhe 300` nach 300 s `ruhig: false, foundry: 1`; die B-Boots dauern 487 statt 100 GPU-Sekunden.
  - A ist nach 3 s ruhig.
- **Drei Proben-Boots an B (Dorf, 8 Uhr), Roh `offen/`:**
  1. Steht der Loop, ist `foundry` 0. Läuft er, steht `ruhig: false, foundry: 1`.
  2. Abgetastet im laufenden Lauf (6 s, alle 30 ms) ist in 185 von 188 Proben ein Auftrag offen. Es sind Siedlungs-Exporte `stl-641` … `stl-657`, also **17 Exporte in 6 s, etwa 3 je Sekunde, ohne Ende**.
  3. Der EINE Vorrat `_dorfVorrat` wechselt in 6 s **20-mal zwischen den Zellen −3,−5 und −5,−3**. Beide liegen im Vorlauf-Ring des Dorf-Orts (nearM 260 + vorlaufM 160 m, Zelle 256 m).
- **Die Stelle:** `stamm/siedlung-ort.js` `_tickAutoSettlement` (b9d99b9e, Zeile ~3724).
  - Eine Vorlauf-Zelle wird nur übersprungen, solange `v.key === key || !v.da`. Ist der Vorrat der Nachbarzelle fertig (`da`), bereitet der Takt die eigene vor.
  - `_dorfBereiten` hält EINEN Vorrat zur Zeit und ersetzt ihn. Seine Arbeit war schon fertig, also kommt die erste Zelle im nächsten Takt wieder dran.
  - Zwei Zellen im Vorlauf-Ring tauschen so endlos: je Wechsel `export-settlement` im Foundry-Faden und die Ort-Wahl im Ort-Faden.
- **Die Folgen, gemessen am Dorf:**
  - CPU-Takt p50 +0,45 und p95 +0,8 ms; „außer Takt“ +0,31 ms (die Antworten der Fäden); Belegung p95 +1,2 ms.
  - `_weltOffen().foundry` steht dauernd, die Welt steht nie.
  - An der Mess-Wiese und am Genesis-Ring liegt höchstens eine Zelle im Vorlauf-Ring: dort ist B ruhig, der Faden gleich.
- **Wahrscheinlich derselbe Bruch wie der integ-echt-Hänger:** `werkbank licht --tag` (gate:tag-achse:echt, Run 39780312347) wartet auf eine stehende Welt und hing ab 14:58 ohne Ende. Bewiesen ist das an der CI-Welt nicht; der Vorrat-Takt dort ist ungemessen.
- **Kein B-Term:** k0 p50 der Wiese (0,62 ↔ 0,26) ist der benannte Sitzungszustand.
- **Knapp über 2σ, nicht gejagt:** gpu-bank +0,26 / +0,37 an Wiese und Genesis (t 2,1 / 2,3), Wiese stehend fps −0,7.
  - Nach der Heilung des Pingpongs entscheidet das ABAB am neuen Kopf mit n = 4 je Seite, ob sie halten.

## Urteil
- B ist an Genesis Third und Wiese Ego (stehend und gehend) **nicht langsamer**, gehend sogar Frame p99 41,7 → 33,5.
- **Im Dorf ist B LANGSAMER**, 2 von 2 Boots, t 5–17.
- Der Täter ist das Vorrat-Pingpong von siedlung-k5: zwei Vorlauf-Zellen tauschen den EINEN Vorrat, etwa 3 Exporte je Sekunde, die Welt steht nie.
- B ist so nicht reif für main.

Roh: OMEN `p3/n2210/faden/`, hier `bericht/2210-abab-faden/`.
- `gehen/`: je Boot und Zelle `steht`, `geht-1`, `bank`, `smi`, Zensus, sowie `auswertung-gehen-*.md`.
- `offen/`: die drei Proben-Boots `offen-*.txt`, `tasten.txt` und `pingpong.txt`.

**Status ZWISCHENSTAND + Übergabe:**
- ABAB Faden ist gemessen: Genesis und Wiese nicht langsamer, das Dorf LANGSAMER.
- Der Täter ist beim Namen: `_tickAutoSettlement`/`_dorfBereiten` tauschen zwei Vorlauf-Zellen endlos.
- Die Heilung (EIN Vorrat je Zelle oder ein Gedächtnis der vorbereiteten Zellen) ist eine Karte für siedlung-k5. Danach folgt das ABAB am neuen Kopf, n = 4 an Wiese und Genesis wegen gpu-bank.
