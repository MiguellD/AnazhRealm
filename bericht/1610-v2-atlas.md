# Bericht 1610 V2 Atlas-Abschied — A main 27ae78bf gegen B integ-probe 5fb8eb1c (T2 + M2 + V2, GTX 1060)

**Status: ZWISCHENSTAND.**

**Ergebnis:**

1. **Im Band ist B an allen vier Stellen nicht langsamer:**

   | Stelle | Band GPU je Frame A → B | Δ (2σ) |
   |---|---|---|
   | Wiese Ego | 13,93 → 13,80 | −0,13 (0,88) |
   | Wiese Third | 13,16 → 13,48 | +0,32 (1,14) |
   | Genesis Ego | 13,05 → 13,23 | +0,18 (0,67) |
   | Genesis Third | 12,97 → 13,46 | +0,49 (1,86) |

   Der CPU-Takt p95 ist überall gleich (±0,2).
2. **Die gpu-bank an der Wiese nennt den T2-Preis, den V2 mitträgt** (siehe `1610-t2-laubkrone.md`):

   | Stelle | Gier 0 | Gier −0,88 |
   |---|---|---|
   | Wiese Ego | 9,74 → 11,04 (+1,29, 2σ 0,57) | 10,32 → 11,25 (+0,93) |
   | Wiese Third | 9,50 → 10,19 (+0,69) | 10,71 → 10,59 (−0,12) |

   - Täter: Baum-Täter Wiese Ego 44 → 49 Befehle, 71,7k → 83,9k Dreiecke; `f:eiche:L1` 3 → 6.
3. **VRAM sinkt an allen Stellen um 2,2 bis 4,3 MB:**

   | Stelle | VRAM jetzt A → B | davon Texturen |
   |---|---|---|
   | Wiese Ego | 98,5 → 95,3 | 83,0 → 79,5 |
   | Wiese Third | 100,4 → 98,3 | – |
   | Genesis Ego | 112,4 → 109,1 | 88,8 → 84,8 |
   | Genesis Third | 112,9 → 108,7 | 89,3 → 84,8 |

   - **Der 16-Schicht-Zwilling fällt:**

     | Stelle | `tex:karte-albedo` | `tex:karte-normal` |
     |---|---|---|
     | Wiese | 5,7 MB (2 Texturen) → 3,3 MB (1) | 2,8 MB (2) → 1,7 MB (1) |
     | Genesis Ego | 6,0 → 3,3 MB | 3,0 → 1,7 MB |
     | Genesis Third | 6,3 → 3,3 MB | 3,2 → 1,7 MB |

   - Die übrigen Klassen sind gleich: TRAA 2 × 15,8, Kaskaden 2 × 8,0, Tor-Ziel 7,0, Wege-Karte 4,0.
   - Der Puffer der Szene an Genesis Ego steigt 23,6 → 24,8 MB (+27 Puffer; T2-Bäume).
4. **Genesis Ego steht auf B in beiden Boots im langsamen Gipfel** (72,0/72,1 fps, Durchsatz 13,9). A hat einen langsamen
   Boot (74,2; 13,6) und einen schnellen (80,4; 12,3).
   - An f6fa9f63 standen 8 von 8 Genesis-Ego-Boots langsam (`1610-zweigipfel.md`, Bau-Zerlegung).
   - **Mit T2 ist der langsame Gipfel an Genesis Ego der Regelfall.** Die Bau-Satz-Zerlegung läuft gerade
     (`p3/k1610bau/split2.sh`: Zeichen-Reihe des Bau-Satzes und Preis je Mesh, an f6fa9f63 und 27ae78bf).
5. **Kein „Destroyed texture“** in allen 16 Boots.

## Stehend, je 2+2 Boots (`omen-messfolge.cjs`, Instrument B-Kopf abab-p5fb, Folge A1 B1 A2 B2)

| Stelle | fps A → B | CPU-Takt p95 voll | gpu-bank Gier 0 (2σ) | gpu-bank Gier −0,88 (2σ) | Band GPU je Frame (2σ) | Befehle | Dreiecke (Band) | VRAM MB | Urteil (Band) |
|---|---|---|---|---|---|---|---|---|---|
| Wiese Ego | 78,6 → 77,4 | 5,0 → 4,9 | 9,74 → 11,04 (0,57) | 10,32 → 11,25 (0,33) | 13,93 → 13,80 (0,88) | 82 → 86 | 308k → 315k | 98,5 → 95,3 | nicht langsamer |
| Wiese Third | 81,6 → 80,8 | 5,6 → 5,5 | 9,50 → 10,19 (0,32) | 10,71 → 10,59 (0,29) | 13,16 → 13,48 (1,14) | 98 → 103 | 382k → 404k | 100,4 → 98,3 | nicht langsamer |
| Genesis Ego | 77,3 → 72,0 | 5,4 → 5,5 | – | – | 13,05 → 13,23 (0,67) | 102 → 105 | 341k → 350k | 112,4 → 109,1 | nicht langsamer (Gipfel) |
| Genesis Third | 79,7 → 78,0 | 6,7 → 6,5 | – | – | 12,97 → 13,46 (1,86) | 135 → 138 | 397k → 404k | 112,9 → 108,7 | nicht langsamer |

- **Baum-Täter je Stelle** (Befehle / Dreiecke; Laub):

  | Stelle | A | B | Laub A | Laub B |
  |---|---|---|---|---|
  | Wiese Ego | 44 / 71,7k | 49 / 83,9k | f:birke:L1 4 · f:eiche:L1 3 | f:eiche:L1 6 · f:birke:L1 4 |
  | Wiese Third | 55 / 85,5k | 59 / 101,0k | f:eiche:L1 4 · f:birke:L1 3 | f:eiche:L1 5 · f:birke:L1 3 |
  | Genesis Ego | 36 / 77,1k | 39 / 81,7k | kein Laub | f:eiche:L1 3 |
  | Genesis Third | 53 / 80,4k | 56 / 84,9k | kein Laub | f:eiche:L1 3 |

- **Takt:**
  - Bank 1714–1759 MHz.
  - Lauf-Ende 1708–1809 MHz, 79–83 °C, Drossel-Bits 0x0/0x1.
- **Einschwingen:** Alle 16 Boots sind im ersten Versuch eingeschwungen.
- **Rot nur an der Band-Ratsche:** 16 von 16 Boots, wie erwartet vor dem Re-Mint.
- **Messpose Wiese Ego:** Das Instrument 5fb8eb1c trägt die neue Pose aus f6fa9f63 (−280,4/−1045,6, Blick WSW).

## Folge

- **Ratschen-Mint an 5fb8eb1c freigegeben** (`p3/k1610v2/mint-frei.txt`).
  - Er läuft nach der Bau-Satz-Zerlegung unter dem Schloss, im Zweig `gtx-ratschen-1610` am Kopf 5fb8eb1c.
  - Wiese und Genesis je Ego und Third, je 2 Serien Erst- und Zweit-Boot, `ratsche --neu`.
  - Danach Commit `[ci voll]`, Push, Zeile mit Kopf und CI.
- **Der Mint prägt den T2-Preis an der Wiese mit ein** (Bank +0,9 bis +1,3 ms), ebenso den langsamen Gipfel an Genesis Ego.
  Ein späterer T2-Schnitt senkt die Ratsche dann von selbst; die Hülle zieht nach.

## Rohdaten

**Pfad:** `bericht/1610-v2-atlas/`

| Inhalt | Dateien |
|---|---|
| Auswertung | `auswertung-{w-ego,w-third,g-ego,g-third}.md/.json` |
| Boots | 16 Boot-JSONs (Band mit VRAM-Klassen und Täter-Klassen) |
| Werkzeug | `vram.cjs` (VRAM je Klasse A → B aus dem Band-Text) |
| Folge und Skripte | `fortschritt.log`, `serie.sh`, `stehen.sh`, `ratschen.sh`, `stehen.out` |

## Status ZWISCHENSTAND + Übergabe

- **Kein Code-Commit.**
- **Die OMEN misst jetzt die Bau-Satz-Zerlegung** (`p3/k1610bau/split2.sh`, seit 09:32). Danach kommt der Ratschen-Mint
  an 5fb8eb1c.
