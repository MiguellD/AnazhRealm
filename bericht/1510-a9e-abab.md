# Bericht 1510-a9e-abab — Integ-Urteil A main 015a3f74 gegen B integ-probe d5deed14 (GTX 1060)

**Status: ZWISCHENSTAND.**

**Ergebnis:**

1. **B ist im Band nicht langsamer**, an allen vier Stellen (Wiese und Genesis, je Ego und Third, 4+4 Boots) und auf dem Dorfweg.
2. **Vorbehalt:** In jedem B-Boot sagt eine Pipeline ab (`renderPipeline_MeshStandardNodeMaterial_33/34`, 17 gesampelte
   Texturen > 16; laut Übergabe der Boden-Stoff des Fern-Rings). B zeichnet diesen Stoff nicht.
   - Wiese: Befehle −2, Dreiecke −1,1k.
   - Dorfweg gehend: −80k Dreiecke.
   - Kalt: B hat die 3-s-Pipeline-Wand von A nicht.
   - **Das Urteil für den FF trägt deshalb erst das Nachmessen B′ 210fe8a7 (mit G1) gegen d5deed14.** Es läuft seit 02:24.
3. **D10 (Spiegel):**
   - CPU: die `_spiegel*`-Methoden liegen unter der Profil-Schwelle (< 0,10 ms je Frame inklusive).
   - GPU: Der Strahl-Pass `spiegel:strahl` läuft an der Wiese auf 13 von ≈ 900 Frames, je 0,03 ms; an Genesis gar nicht.
   - **D3-2 (`_atmo*`):** 0,04 ms je Takt (`_atmoTakt`, Spitze 1–2 ms), dazu `_atmoSonne` 0,02–0,03 und `_atmoMediumJetzt` 0,01–0,02.

## Stehend, 4+4 Boots je Stelle (`scripts/omen-messfolge.cjs`, Instrument = B-Kopf abab-pd5d, Folge A1 B1 … A4 B4)

| Stelle | fps A → B | CPU-Takt p95 voll A → B (2σ) | gpu-bank Gier 0 A → B (2σ) | Band GPU je Frame | Befehle | Dreiecke | VRAM MB | Urteil |
|---|---|---|---|---|---|---|---|---|
| Wiese Ego | 92,6 → 94,9 | 5,0 → 4,8 (0,2) | 9,31 → 8,79 (0,26) | 11,08 → 11,04 | 76 → 74 | 285,1k → 284,0k | 93,2 → 96,1 | nicht langsamer |
| Wiese Third | 89,7 → 89,8 | 5,9 → 6,0 (0,6) | 9,30 → 9,00 (0,38) | 11,05 → 11,05 | 86 → 84 | 326,7k → 326,5k | 94,1 → 97,9 | nicht langsamer |
| Genesis Ego | 81,0 → 83,5 | 5,9 → 5,6 (0,7) | – | 13,00 → 12,71 | 102 → 102 | 333,8k → 333,9k | 110,4 → 112,0 | nicht langsamer |
| Genesis Third | 80,0 → 80,1 | 6,6 → 6,5 (0,6) | – | 12,77 → 12,53 | 135 → 135 | 393,2k → 393,0k | 110,7 → 112,2 | nicht langsamer |

- **Genesis Ego zweigipflig:** A1 und A4 (78,7 / 78,6 fps) tragen den langsamen Zustand, B keinen (82,9–84,4). Das Mittel
  A → B +2,5 fps ist daher Zufall der Gipfel, kein Gewinn von B.
- **Einschwingen:** Alle 32 Boots sind im ersten Versuch eingeschwungen; die Serie brauchte keinen Neulauf.
- **Rot nur an der Band-Ratsche** (`ratsche/weit`):
  - Wiese: alle B-Boots.
  - Genesis: 10 von 16 Boots, A und B; die Genesis-Ratschen fehlen auf diesem Stand.
  - Das ist ein Befund, die Messungen gelten.
- **Takt und Drossel:**
  - GPU-Takt am Lauf-Ende 1695–1822 MHz auf beiden Seiten.
  - Bank-Takt Wiese Ego: A 1711 MHz, B 1703 MHz.
  - Temperatur 79–83 °C. Keine Drossel über die Boost-Stufen hinaus; Drossel-Bits nur 0x0 oder 0x1 (Leerlauf).
- **VRAM:** B liegt +1,5 bis +3,8 MB höher (D3-2-LUTs und das D10-Spiegel-Feld).

## Gehend, Dorfweg (4 Sitzungen, je A und B, `start --ort dorf`, Instrument abab-pd5d)

| Abschnitt | fps A → B | Frame p95 A → B | CPU p95 A → B | > 33 ms % A → B | Dreiecke A → B | Befehle A → B |
|---|---|---|---|---|---|---|
| steht | 65,1 → 71,3 | 18,9 → 16,8 | 8,6 → 5,3 | 1,0 → 0 | 376k → 354k | 78 → 77 |
| geht-1 (Einlauf) | 47,5 → 52,6 | 43,8 → 36,5 | 39,8 → 31,8 | 8,3 → 5,5 | 472k → 436k | 93 → 91 |
| geht-2 | 57,0 → 61,8 | 27,1 → 25,1 | 20,9 → 18,8 | 2,3 → 1,8 | 478k → 440k | 94 → 91 |

- **A s3 ist eine schwache Sitzung** (geht-1 41,5 fps, CPU p95 47,7). Auch ohne s3 ist B nicht langsamer.
- **B zeichnet gehend bis 80k Dreiecke weniger** (s1: 471k gegen 390k). Das passt zum abgesagten Fern-Ring-Boden. Der
  Dorfweg-Vorteil von B ist daher **kein sauberer Gewinn**. Das Nachmessen misst gehend nur die Wiese. Ein Dorfweg an
  210fe8a7 wäre nötig, wenn der Weg ins Urteil gehört.

## Kalt 3+3 (leeres Profil, B-Instrument, Folge A B B A A B)

| | Lauf 1 | Lauf 2 | Lauf 3 | Mittel |
|---|---|---|---|---|
| A 015a3f74 t(Weltbild) s | 25,54 | 26,16 | 26,14 | **25,95** |
| B d5deed14 t(Weltbild) s | 22,56 | 21,73 | 21,77 | **22,02 (−3,9)** |

- **Zeitlinie A:** Der Horizont steht 3–4 s bei 22 % („4 Pipelines offen“, 1000 ms blockiert je s). Er ist erst bei 13 s
  auf 87–96 %, gemalt bis ≈ 23 s.
- **Zeitlinie B:** Der Horizont wächst ohne Wand (5 s: 49–63 %, 9–11 s: 96–99 %) und ist bis ≈ 16 s gemalt.
- **Neue Weltbild-Posten in B:** „der Spieler erhält seinen Leib“ (2–10 s) und „das Dorf wird geplant“ (6–17 s).
- **Vorbehalt:** Die Wand in A sind offene Pipelines. In B sagt die 17-Textur-Pipeline sofort ab, statt zu bauen. Ob die
  −3,9 s mit G1 bleiben, zeigt das Nachmessen (Kalt 3+3, d5deed14 gegen 210fe8a7).
- **Beide Seiten** verfehlen die Pflicht „Ankunft kalt ≤ 5 s“ (Pflicht-OFFEN B).

## D10-Zerlegung (A ffe0e956 vor D10 gegen B d5deed14, je Stelle A B B A)

| Boot | fps | CPU-Takt p50/p95 | Render-Phase ms | Takt-Linse p50/p95 (Render ruht) | `_atmo*` in der Linse |
|---|---|---|---|---|---|
| Wiese Ego A1 / A2 | 96,9 / 92,9 | 3,1/4,2 · 3,3/4,6 | 1,97 / 2,25 | 1,3/5,0 · 1,4/5,3 | – |
| Wiese Ego B1 / B2 | 91,1 / 89,1 | 3,4/4,8 · 3,5/5,3 | 2,18 / 2,37 | 1,4/4,9 · 1,5/5,5 | `_atmoTakt` 0,04 (max 1,7–2) |
| Genesis Third A1 / A2 | 81,0 / 80,9 | 4,3/5,8 · 4,3/5,7 | 3,22 / 3,26 | 1,1/4,4 · 1,2/4,7 | – |
| Genesis Third B1 / B2 | 81,0 / 80,6 | 4,5/5,9 · 4,5/5,9 | 3,31 / 3,33 | 1,2/4,8 · 1,2/4,4 | `_atmoTakt` 0,04 (max 1) |

- **Die Takt-Linse sieht keine `_spiegel*`-Methode.**
  - Der Spiegel-Pass läuft nur in der Render-Phase und nur mit Wasser im Bild (`_spiegelWasserImBild`); die Linse lässt
    den Render ruhen.
  - Im Profil-Schritt der 8 Wiese-B-Boots erscheint keine `_spiegel*`-Methode unter den Top 60. Die Schwelle liegt bei
    116 ms gesamt / 24 ms selbst auf 1113 Frames. Damit bleibt **D10 auf der CPU < 0,10 ms je Frame (inklusive)**.
- **GPU je Pass (Stempel im Einschwingen, B):**
  - `spiegel:strahl`: 0,03 ms auf 13 von 914 Frames.
  - `atmo-himmel`: 0,07 ms auf 39 Frames.
  - `atmo-umgebung`: 0,01 ms auf 2 Frames.
  - Neu ist ein Pass `OrthographicCamera` mit 2,4 ms auf 2 Frames je 30 s (LUT-Bau?).
- **Im D10-Zweierpaar ist B an der Wiese im CPU-Takt p95 +0,65 ms** (Render-Phase +0,17). In der 4+4-Serie oben ist B dort
  −0,1. Das liegt im Band ±0,6 und bleibt ein Befund, kein Urteil.
- **Bilder bei Uhr 0,72 und 0,0** (Wiese, Genesis, Dorf, B) bleiben alle offen:
  - Meldung: „ERST-ZEICHNUNG OFFEN — ein Draw wartet auf renderPipeline_MeshStandardNodeMaterial_34 (ABGESAGT)“.
  - Das ist derselbe 17-Textur-Fund, den G1 in 210fe8a7 behebt.
  - Die Bild-Probe mit `--gpu-fehler` entfiel; das Nachmessen (4) prüft Uhr 0,72 an 210fe8a7.

## Rohdaten

**Pfad:** `bericht/1510-a9e-abab/`

| Inhalt | Dateien |
|---|---|
| Stehend | `auswertung-{w,g}-{ego,third}.md/.json`, 32 Boot-JSONs `{w,g}-{ego,third}-{A,B}{1..4}.json`, `fortschritt.log` |
| Dorfweg | `dorfweg/s1..s4/*.txt`, `dorfweg/auswertung.json/.txt` |
| Kalt | `kalt/{A,B}{1..3}.txt/.json` |
| D10 | `d10/*-{ein,lauf,takt,umstellen}.txt`, `d10/*-bild-*.txt` |
| Skripte | `serie.sh`, `stehen.sh`, `kalt.sh`, `kalt.cjs`, `d10.sh`, `gehen-dorf.sh`, `bild-probe.sh` (entfallen) |

- Die Spaltenköpfe „A main 9fb869a5 / B integ-probe 51cc19af“ der Auswertungs-Vorlage sind in den Kopien auf
  015a3f74 / d5deed14 berichtigt.

## Status ZWISCHENSTAND + Übergabe

- **Kein Code-Commit.**
- **Die OMEN misst jetzt das Nachmessen A d5deed14 gegen B′ 210fe8a7** (`p3/k1610n`, Schloss „omen-abab nachmessen“).
  - Die Reihe: Bild-Probe Uhr 0,72 mit `--gpu-fehler`, dann Kalt 3+3, gehend Wiese s1–s4, dann stehend Wiese Ego und
    Genesis Third je 2+2.
  - Danach die Zweigipfel-Probe Genesis Ego (`p3/k1510zg`).
