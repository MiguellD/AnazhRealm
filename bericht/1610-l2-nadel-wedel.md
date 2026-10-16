# Bericht 1610 L2 Nadel-Wedel — A 210fe8a7 gegen B integ-probe 0d6c8bc1 (GTX 1060)

**Status: ZWISCHENSTAND.**

**Ergebnis:**

1. **L2 ist im Band nicht langsamer**, an allen drei Stellen (Wiese Ego, Wiese Third, Genesis Third, je 2+2 Boots).
   - GPU-Mehrpreis je Stelle +0,06 bis +0,24 ms in der Bank und +0,17 bis +0,47 ms im Band, je innerhalb 2σ.
   - Einzige Ausnahme: Wiese Third, Bank bei Gier −0,88: +0,06 ms bei 2σ 0,04, dort am Takt-Deckel.
2. **Die Baum-Klasse trägt +10 bis +11k Dreiecke an der Wiese (+18 bis +19 %)** bei gleicher Zahl der Draws. An Genesis sind
   es +2k.
3. **Im Bild ist L2 deutlich:** Die Koniferen tragen feine Nadel-Wedel statt grober Farnwedel-Karten
   (`bild/{210,0d6}-bild-0.72.png`).
   - An derselben Pose zeichnet B 295k statt 259k Dreiecke (+14 %), 46 statt 44 Draws.
   - Beide Bilder sind ABNAHME GRÜN, bei Uhr 0,5 und 0,72.
4. **Nebenbefund zur Basis 210fe8a7:** Wiese Third ist dort viel billiger als an d5deed14 und main.
   - GPU-Durchsatz 7,8–7,9 statt 10,9–11,5 ms, Leine 0,1 % statt 25–28 %, gpu-bank 3,45 statt 9,0–9,3 ms.
   - Damit steht Wiese Third am 120-Hz-Deckel (119,3 fps auf beiden Seiten); die Bank urteilt dort im Leerlauf-Takt
     (1240–1335 MHz).
   - Der Täter ist nicht zugeordnet (F1, G1, W1 oder B2).
5. **Der Fund „Destroyed texture horizont-karte used in a submit“** steht auch in B 0d6c8bc1, je Boot einmal an Wiese Ego
   (gemeldet 16.10. ~04:25).

## Stehend, je 2+2 Boots (`omen-messfolge.cjs`, Instrument B-Kopf abab-p0d6, Folge A1 B1 A2 B2)

| Stelle | fps A → B | CPU-Takt p95 voll | gpu-bank Gier 0 (2σ) | gpu-bank Gier −0,88 (2σ) | Band GPU je Frame (2σ) | Bank-Takt MHz A → B | Urteil |
|---|---|---|---|---|---|---|---|
| Wiese Ego | 90,0 → 90,9 | 5,3 → 4,8 | 8,87 → 9,04 (0,18) | 9,11 → 9,01 (0,31) | 11,47 → 11,64 (0,48) | 1740 → 1712 | nicht langsamer |
| Wiese Third | 119,3 → 119,3 (Deckel) | 5,3 → 5,3 | 3,45 → 3,69 (0,55) | 2,69 → 2,75 (0,04) | 9,80 → 10,27 (0,54) | 1240 → 1335 | nicht langsamer |
| Genesis Third | 82,6 → 83,3 | 6,2 → 6,1 | – | – | 11,62 → 11,91 (0,49) | – | nicht langsamer |

- **Wiese Ego:** B lief in der Bank 28 MHz tiefer (−1,6 %). Das erklärt ≈ 0,15 der +0,17 ms.
- **Takt und Drossel (lauf-voll):**

  | Stelle | Takt-Mittel | Leistung | Drossel-Bits |
  |---|---|---|---|
  | Wiese Ego | 1696–1728 MHz | 66 W | 0x4 (Software-Leistungsgrenze) in 30–34 % der Proben, beidseitig gleich |
  | Genesis Third | 1719–1747 MHz | 66–69 W | 0x4 in 30–32 % der Proben, beidseitig gleich |
  | Wiese Third | 1494–1514 MHz | 38 W | keine Leistungsgrenze (Leerlauf am Deckel) |

  - Lauf-Ende: 1695–1835 MHz, 76–82 °C.
- **Einschwingen:** Alle 12 Boots sind im ersten Versuch eingeschwungen.
- **Rot nur an der Band-Ratsche** (`ratsche/weit`): 10 von 12 Boots, beide Seiten. Das ist ein Befund, die Messungen
  gelten.

## Baum-Klasse je Boot (Band-Tafel aus der Szene: Befehle Ist/Soll, haupt/k0/k1, Dreiecke, Täter)

| Boot | baum | Dreiecke | Täter (Befehle) |
|---|---|---|---|
| w-ego-A1/A2 | 32 · 20/10/2 | 56k | f:tanne:L1 10 · f:fichte:L1 10 · f:tanne:L0 4 · f:eiche:L1 3 |
| w-ego-B1/B2 | 32 · 19/10/3 | **66k** | f:fichte:L1 10 · f:tanne:L1 9 · f:tanne:L0 4 · f:mammut:L1 4 |
| w-third-A1/A2 | 35 · 20/12/3 | 58k | f:fichte:L1 10 · f:tanne:L1 10 · f:tanne:L0 4 · f:mammut:L1 4 |
| w-third-B1/B2 | 35 · 20/12/3 | **69k** | wie A |
| g-third-A1/A2 | 26 · 15/8/3 | 43k | f:tanne:L1 9 · f:fichte:L1 8 · fscatter:tanne:L1 4 · fscatter:fichte:L1 4 |
| g-third-B1/B2 | 26 · 15/8/3 | **45k** | wie A |

- **Dreiecke je Teil-Klasse (Fichte und Tanne einzeln)** nennt die Band-Tafel nicht, nur die Draws je Täter. Der Zuwachs
  liegt in den Konifer-Stufen L0/L1, weil die Draws gleich bleiben.
- **Gezeichnete Haupt-Pass-Dreiecke (Renderer):**

  | Stelle | A | B |
  |---|---|---|
  | Wiese Ego | 266k / 259k | 270k / 270k |
  | Wiese Third | 286k / 302k | 292k / 293k |

  - g-third-B2 zeigt 221k und einen Haupt-Stempel von 0. Das ist ein Mess-Fehlschlag des Stempels in diesem Boot; das Band
    ist unauffällig.

## Bild (Nachtrag zum Nachmessen (4), `bild.sh`, je Kopf eine Welt mit `--gpu-fehler`)

| Kopf | Pose | Abnahme 0,5 / 0,72 | Dreiecke / Draws im Bild | Absagen | Konsole |
|---|---|---|---|---|---|
| 210fe8a7 | −278 29,68 −1038 → −278 29,68 −1118 (Augenhöhe, 80 m voraus) | GRÜN / GRÜN | 258 917 / 44 | 0 | 1× Destroyed texture „horizont-karte“ |
| 0d6c8bc1 | dieselbe | GRÜN / GRÜN | 295 173 / 46 | 0 | 1× Destroyed texture „horizont-karte“ |

## Rohdaten

**Pfad:** `bericht/1610-l2-nadel-wedel/`

| Inhalt | Dateien |
|---|---|
| Stehend | `auswertung-{w-ego,w-third,g-third}.md/.json`, 12 Boot-JSONs `{w-ego,w-third,g-third}-{A,B}{1,2}.json`, `stehen.out` |
| Bild | `bild/{210,0d6}-bild-{0.5,0.72}.png/.txt/.abnahme.json`, `bild/*-ein.txt`, `bild/*-gpufehler-*.txt`, `bild/blick.txt` |
| Folge und Skripte | `fortschritt.log`, `serie.sh`, `stehen.sh`, `bild.sh` |

## Status ZWISCHENSTAND + Übergabe

- **Kein Code-Commit.**
- **Die OMEN misst jetzt die Zweigipfel-Probe Genesis Ego** an d5deed14 (`p3/k1510zg`, Fassung 2, seit 05:03).
- **Danach:**
  - die Genesis-Ratschen am neuen main;
  - K65: Takt-Lauf ab Schritt 52, `spec/ci/echt-auswahl.json`.
