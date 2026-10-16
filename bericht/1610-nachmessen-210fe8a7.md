# Bericht 1610 Nachmessen — B′ integ-probe 210fe8a7 gegen B d5deed14 (GTX 1060)

**Status: ZWISCHENSTAND.**

**Ergebnis:**

1. **B′ 210fe8a7 ist nicht langsamer als d5deed14** an allen bestellten Punkten:
   - Kalt −1,1 s;
   - gehend Wiese: CPU-Takt p95 −1,0 ms, der Hänger von ≈ 260 ms in geht-2 jetzt 1 von 4 statt 4 von 4;
   - stehend Genesis Third: Band −0,8 ms;
   - `--gpu-fehler`: 0 Absagen (d5deed14: 2).
2. **Wiese Ego stehend:** B′ ist in der Bank bei Gier 0 +0,24 ms und im Band +0,53 ms teurer, bei Gier −0,88 −0,34 ms.
   - **Grund: B′ zeichnet wieder, was d5deed14 ausließ.**
   - Haupt-Pass-Stempel: 0,06 → 0,39 ms. main 015a3f74 hat dort 0,38 (a9e).
   - Gezeichnete Haupt-Pass-Dreiecke (Renderer, nicht Szene): d5deed14 207k, B′ 258k, main 286k.
   - Dazu wird der Post-Pass mit F1 billiger: 0,66 → 0,46 ms.
3. **Nachtrag zu 1510-a9e:** d5deed14 ließ an der Wiese im Haupt-Pass −79k Dreiecke (Ego) und −35k (Third) aus.
   - Die Band-Klassen-Tafel zählt aus der Szene und zeigt das nicht.
   - Der a9e-Gewinn „Wiese Ego gpu-bank 9,31 → 8,79“ ist damit **der fehlende Boden, kein Gewinn**.
   - Gegen main gestellt, über zwei Serien und kein ABAB: B′ hat Bank 8,89 statt 9,31, Haupt-Pass gleich, Post −0,2 ms.

## (4) GPU-Fehler-Linse, Wiese Ego, Uhr 0,72 (`bild.sh`, je Kopf eine Welt, Instrument abab-p210)

| Kopf | Absagen im Einschwingen | Bild 0,72 |
|---|---|---|
| d5deed14 | 2 (`renderPipeline_MeshStandardNodeMaterial_34`, 17 gesampelte Texturen > 16) | bricht ab: „ein Draw wartet auf …_34 (ABGESAGT)“ |
| 210fe8a7 | **0** | keine Absage; die Abnahme verwirft das Bild (siehe unten) |

- **Das Bild an 210fe8a7:** „Blickziel verdeckt von Gelände in 31,41 m“. Der Blick zielte 40 m voraus 2 m unter das Auge,
  hinter den Hang.
- **Nachtrag:** Bild 0,5 und 0,72 in Augenhöhe 80 m voraus, je 210fe8a7 und 0d6c8bc1. Es läuft mit der L2-Serie
  (`p3/k1610l2/bild.sh`).

## (1) Kalt 3+3 (B′-Instrument, leeres Profil, Folge A B B A A B)

| | Lauf 1 | Lauf 2 | Lauf 3 | Mittel |
|---|---|---|---|---|
| A d5deed14 t(Weltbild) s | 23,05 | 22,04 | 22,28 | **22,46** |
| B′ 210fe8a7 t(Weltbild) s | 21,02 | 21,63 | 21,32 | **21,32 (−1,1)** |

- **B2 Horizont im Fern-Faden, Zeitlinie B′:** Der Horizont steht von 4 bis 11 s bei 11 %, während der Boden-Ring 2 von 3
  wächst. Danach springt er in 3 s auf 94 % (12 s 43 %, 13 s 62 %, 14 s 94 %).
- **Zeitlinie A:** Der Horizont wächst gleichmäßig (5 s 53–62 %, 9 s 90–98 %).
- Der Haupt-Faden bleibt in beiden bis ≈ 18 s zu 700–990 ms je s blockiert (Bauten, Streu, Gruppen-Bau, Erst-Bau).
  Das Weltbild steht erst, wenn die Bäume und Bauten gewachsen sind (≈ 19–21 s).
- **Neu in B′:** „der Spieler erhält seinen Leib“ (2–10 s) und „das Dorf wird geplant“ (6–17 s).
- **Beide Seiten** verfehlen die Pflicht „Ankunft kalt ≤ 5 s“ (Pflicht-OFFEN B).

## (2) Gehend Wiese (4 Sitzungen, Folge A B · B A · A B · B A, geradeaus 0 → −60 m und zurück, 4 m/s)

| Abschnitt | Seite | fps | Frame p95 / max | CPU p50 | CPU p95 | CPU p99 | CPU max | > 17 ms % | > 33 ms % | Dreiecke | Befehle |
|---|---|---|---|---|---|---|---|---|---|---|---|
| steht | A | 92,6 | 16,7 / 38 | 3,6 | 5,2 | 8,9 | **32** | 0,6 | 0 | 211k | 55 |
| steht | B′ | 90,7 | 16,7 / 40 | 3,5 | 5,1 | 9,3 | **42** | 0,7 | 0,05 | 307k | 59 |
| geht-1 (Einlauf) | A | 66,7 | 25,0 / 83 | 10,7 | 20,1 | 34,4 | 78 | 13,5 | 1,40 | 271k | 70 |
| geht-1 (Einlauf) | B′ | 65,3 | 25,0 / 77 | 10,4 | **19,2** | 36,3 | 73 | **15,5** | 1,45 | 375k | 74 |
| geht-2 | A | 70,1 | 25,0 / **262** | 10,0 | 15,1 | 24,2 | 96 | 10,7 | 0,88 | 273k | 70 |
| geht-2 | B′ | 70,1 | 25,0 / **123** | 9,8 | **14,1** | 22,5 | 70 | 10,8 | 0,78 | 380k | 74 |

- **CPU-Takt p95 gehend: B′ −0,95 (Einlauf) und −0,97 ms (geht-2), je Sitzung:**
  - Einlauf: A 20,0 · 19,3 · 21,7 · 19,6, B′ 17,8 · 21,2 · 18,4 · 19,4.
  - geht-2: A 16,5 · 14,5 · 14,5 · 14,9, B′ 14,6 · 14,2 · 13,6 · 14,1.
- **Spitzen:**
  - A trägt in geht-2 in **allen 4 Sitzungen** einen Hänger von 250–275 ms Frame-Zeit, B′ nur in s3 (258 ms).
  - Im Einlauf hat B′ +2 Punkte Frames über 17 ms (15,5 % gegen 13,5 %).
  - Stehend liegt die CPU-Spitze bei B′ ≈ +10 ms höher (41–46 gegen 28–35 ms, 4 von 4).
  - Einhäng-Spitzen je Scheibe (der Prüfer sah 7,9–13 ms) sind ohne eigene Linse nicht trennbar; die Zuordnung ist offen.
- **B′ zeichnet gehend +100k Dreiecke** (W1 Wiese farbig und der Boden, den A ausließ) und +4 Befehle, bei gleichen fps.

## (3) Stehend, je 2+2 Boots (`omen-messfolge.cjs`, Instrument B′-Kopf abab-p210, Folge A1 B1 A2 B2)

| Stelle | fps A → B′ | CPU-Takt p95 voll | gpu-bank Gier 0 | gpu-bank Gier −0,88 | Band GPU je Frame | Haupt-Pass p50 | Post p50 | Urteil |
|---|---|---|---|---|---|---|---|---|
| Wiese Ego | 93,2 → 92,2 | 5,0 → 4,9 | 8,65 → 8,89 (+0,24, 2σ 0,15) | 9,21 → 8,88 (−0,34) | 10,91 → 11,44 (+0,53, 2σ 0,20) | 0,06 → 0,39 | 0,66 → 0,46 | teurer um den wieder gezeichneten Boden |
| Genesis Third | 80,8 → 82,0 | 6,4 → 6,2 | – | – | 12,75 → 11,96 (−0,80) | 0,22 → 0,23 | 0,69 → 0,49 | nicht langsamer |

- **Gezeichnete Haupt-Pass-Dreiecke an Wiese Ego** (lauf-voll, `dreiecke.jePass.haupt`):

  | Kopf | Dreiecke |
  |---|---|
  | d5deed14 (A1, auch a9e B1) | 206 691 |
  | 210fe8a7 (B′1) | 258 147 |
  | main 015a3f74 (a9e A1) | 285 769 |

  - Die Klassen-Tafel des Bands nennt für alle drei 283–287k, weil sie aus der Szene zählt.
  - B′ zeichnet weiter 28k weniger als main. Der Täter ist nicht zugeordnet (F1/W1/B2-Bündel).
- **Takt und Drossel:**
  - Bank-Takt Wiese Ego: A 1705 MHz, B′ 1720 MHz.
  - Lauf-Ende: 1721–1822 MHz, 80–83 °C. Drossel-Bits 0x0/0x1 (Leerlauf).
- **Einschwingen:** Alle 8 Boots sind im ersten Versuch eingeschwungen.
- **Rot nur an der Band-Ratsche** (`ratsche/weit`): A in 4 von 4, B′ w-ego-B2. Das ist ein Befund, die Messungen gelten.

## Rohdaten

**Pfad:** `bericht/1610-nachmessen-210fe8a7/`

| Inhalt | Dateien |
|---|---|
| Bild | `bild/` (Einschwingen, GPU-Fehler im Loop und im Bild, Bild-Antwort) |
| Kalt | `kalt/{A,B}{1..3}.txt/.json` |
| Gehend | `gehen/s1..s4/{A,B}-{steht,geht-1,geht-2,…}.txt`, `gehen/gehen-auswertung.txt`, `gehen/auswertung.json` |
| Stehend | `auswertung-{w-ego,g-third}.md/.json`, 8 Boot-JSONs `{w-ego,g-third}-{A,B}{1,2}.json`, `stehen.out` |
| Folge und Skripte | `fortschritt.log`, `serie.sh`, `bild.sh`, `kalt.sh`, `kalt.cjs`, `gehen.sh`, `stehen.sh` |

## Status ZWISCHENSTAND + Übergabe

- **Kein Code-Commit.**
- **Die OMEN misst jetzt die L2-Probe:** A 210fe8a7 gegen B 0d6c8bc1 (`p3/k1610l2`, Schloss „omen-abab l2“).
  - Die Reihe: Bild 0,5/0,72 je Kopf mit `--gpu-fehler`, dann stehend Wiese Ego, Wiese Third und Genesis Third je 2+2.
  - Die Bilder warten die Nachtruhe bis 04:15 ab.
- **Danach die Zweigipfel-Probe Genesis Ego** (`p3/k1510zg`, Fassung 2). Jeder Boot schreibt die Reihe der Region-Bündel,
  die Stufe der Tore und den Regler. Die langsame Welt schaltet T1 Anker, T2 Abstands-Reihe und T3 Tore Stufe 1; die
  schnelle Welt T2 und die Rückwärts-Reihe.
