# Bericht 1610 T2 Laubkrone — A main 27ae78bf gegen B integ-probe f6fa9f63 (T2, GTX 1060)

**Status: ZWISCHENSTAND.**

**Ergebnis:**

1. **T2 ist an Wiese Ego LANGSAMER:**

   | Größe | A | B | Δ (2σ) |
   |---|---|---|---|
   | gpu-bank Gier 0 | 9,64 | 11,41 | **+1,77 ms** (0,10) |
   | gpu-bank Gier −0,88 | 10,57 | 11,35 | **+0,78 ms** (0,16) |
   | Band | 12,68 | 14,13 | +1,45 ms (1,66) |
   | fps | 78,8 | 77,7 | −1,2 |

   - Befehle 82 → 88, Dreiecke (Band) 308k → 320k.
   - Der Bank-Takt lag bei B 22 MHz tiefer. Das erklärt ≈ 0,13 ms, nicht 1,77.
2. **Der Täter steht in der Baum-Klasse (Band-Täter, Wiese Ego, je Boot gleich):**

   | Täter | A: Befehle / Dreiecke / Reichweite | B: Befehle / Dreiecke / Reichweite |
   |---|---|---|
   | `f:eiche:L1` | 3 / 3,6k / bis 31 m | **7 / 5,2k / bis 72 m** |
   | `f:tanne:L0` | 4 / 17,6k | **6 / 26,3k** |
   | `f:tanne:L1` | 7 / 14,5k | 7 / 17,3k |
   | Σ Baum-Täter | 44 / 71,7k | **50 / 84,2k** |

   - Die gestreckte Krone zählt zur Sichthöhe der Stufenwahl. Damit fallen mehr Tannen auf L0, und die Eiche zeichnet
     L1 bis 72 m.
   - +13k Dreiecke kosten hier +0,8 bis +1,8 ms GPU: Laub-Fragmente (Karten, Alpha-Test, Überdeckung), nicht Geometrie.
3. **Wiese Third: nicht langsamer.**
   - Bank +0,36 (2σ 0,48) bzw. −0,18; Band −0,01; fps +0,7; CPU-Takt p95 −1,3.
   - Baum-Täter 55 → 59 Befehle, 85,9k → 101,0k Dreiecke. `f:eiche:L1` 4 → 5, `f:birke:L1` 3 → 3.
4. **Genesis Third: im Band LANGSAMER**, Band +0,98 ms (2σ 0,20), fps −1,6.
   - Neu sind 3 Draws `f:eiche:L1` (1,6k Dreiecke); Baum-Täter 53 → 56.
   - **Vorbehalt:** Beide B-Boots tragen das Muster des langsamen Genesis-Gipfels (Frame p50 16,4/16,6 statt 8,5), beide A
     nicht. Mit 2+2 ist das vom Zweigipfel (Bau-Klasse, `1610-zweigipfel.md`) nicht zu trennen.
5. **Messpose:** Das Instrument f6fa9f63 stellt Wiese Ego auf eine neue Pose.
   - Neu: −280,4/−1045,6, Blick −0,92/−0,39. Alt (27ae78bf und davor): −278/−1038, Blick nach −z.
   - Beide Seiten messen dieselbe Pose; die Zahlen sind aber nicht mit früheren Serien vergleichbar (z. B. FW 89 fps an
     der alten Pose).
6. **Kein „Destroyed texture“** in allen 12 Boots (beide Seiten tragen FW).
7. **Baum-Klasse gegen das Soll 40:** Der Prüfer sah 44. Die Band-Tafel zählt „baum“ an Wiese Ego mit 39/40 bei A
   (Täter-Σ 44) und **45/40 bei B** (über dem Soll, Täter-Σ 50).

## Stehend, je 2+2 Boots (`omen-messfolge.cjs`, Instrument B-Kopf abab-pf6f, Folge A1 B1 A2 B2)

| Stelle | fps A → B | CPU-Takt p95 voll | gpu-bank Gier 0 (2σ) | gpu-bank Gier −0,88 (2σ) | Band GPU je Frame (2σ) | Befehle | Dreiecke (Band) | VRAM MB | Urteil |
|---|---|---|---|---|---|---|---|---|---|
| Wiese Ego | 78,8 → 77,7 | 5,2 → 5,2 | 9,64 → 11,41 (0,10) | 10,57 → 11,35 (0,16) | 12,68 → 14,13 (1,66) | 82 → 88 | 308k → 320k | 98,8 → 99,7 | **LANGSAMER** |
| Wiese Third | 81,3 → 81,9 | 6,3 → 5,1 | 9,50 → 9,86 (0,48) | 10,50 → 10,32 (0,09) | 12,27 → 12,26 (0,37) | 99 → 102 | 390k → 399k | 99,2 → 101,2 | nicht langsamer |
| Genesis Third | 80,3 → 78,7 | 6,1 → 6,2 | – | – | 12,83 → 13,81 (0,20) | 135 → 138 | 405k → 403k | 113,6 → 113,2 | LANGSAMER (Vorbehalt Zweigipfel) |

- **Baum-Täter je Stelle** (Befehle / Dreiecke, `baumklassen.cjs`):

  | Stelle | A | B | Laub A | Laub B |
  |---|---|---|---|---|
  | Wiese Ego | 44 / 71,7k | 50 / 84,2k | f:birke:L1 4/3,4k · f:eiche:L1 3/3,6k | f:eiche:L1 7/5,2k · f:birke:L1 4/2,7k |
  | Wiese Third | 55 / 85,9k | 59 / 101,0k | f:eiche:L1 4/4,8k · f:birke:L1 3/2,6k | f:eiche:L1 5/5,0k · f:birke:L1 3/2,3k |
  | Genesis Third | 53 / 80,4k | 56 / 84,9k | kein Laub | f:eiche:L1 3/1,6k |

  - **f:buche:** nirgends als Täter im Band.
  - **L0 der Laubbäume:** an keiner Stelle gezeichnet; alle Laubbaum-Draws stehen auf L1.
- **Takt:**
  - Bank 1708–1759 MHz.
  - Lauf-Ende 1708–1822 MHz, 78–82 °C, Drossel-Bits 0x0/0x1.
- **Einschwingen:** Alle 12 Boots sind im ersten Versuch eingeschwungen.
- **Rot nur an der Band-Ratsche:** 12 von 12 Boots. Das ist ein Befund, die Messungen gelten.

## Folge

- **V2 (5fb8eb1c) trägt T2.** Die V2-Probe gegen 27ae78bf (`p3/k1610v2`) zeigt diesen Preis mit; sie läuft nach der
  Bau-Zerlegung.
- **Der Ratschen-Mint an 5fb8eb1c ist angehalten**, bis das V2-Urteil steht. Freigabe: `p3/k1610v2/mint-frei.txt`.
- **Hebel für T2:** die L1-Reichweite der Eiche (72 m) und die Stufenwahl der gestreckten Tannen-Krone (L0 4 → 6 Draws).

## Rohdaten

**Pfad:** `bericht/1610-t2-laubkrone/`

| Inhalt | Dateien |
|---|---|
| Auswertung | `auswertung-{w-ego,w-third,g-third}.md/.json` |
| Boots | 12 Boot-JSONs (Band mit Täter-Klassen und `dMax` je Täter) |
| Folge und Skripte | `fortschritt.log`, `serie.sh`, `stehen.sh`, `stehen.out`, `baumklassen.cjs` |

## Status ZWISCHENSTAND + Übergabe

- **Kein Code-Commit.**
- **Die OMEN zerlegt jetzt die Bau-Klasse** an f6fa9f63 (`p3/k1610bau`, seit 08:14). Danach kommt V2 gegen 27ae78bf,
  danach der Mint nur mit Freigabe.
