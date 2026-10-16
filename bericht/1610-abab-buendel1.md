# Bericht 1610 Bündel 1 — GTX: A = main aa74c324 gegen B = integ-probe 1185091c (T3 Zeichen-Reihe)

**Status: ZWISCHENSTAND.** Auftrag `auftrag/1610-omen-abab-buendel1.md`, Protokoll-Wechsel des Koordinators um 14:50 (nach Genesis die
übrigen Kombis in EINER Welt).

## Urteil

**B ist an keinem Ort und in keiner Sicht langsamer; überall dort, wo die GPU trägt, ist B schneller.**
- GPU-Zeit: Genesis −7 bis −13 %, Wiese Ego −9,6 %, Dorf Ego −9,8 %.
- Wiese Third bleibt gleich; sie läuft am 120-Hz-Deckel.
- Gehend an der Wiese: nicht langsamer, CPU-Takt p95 −0,9 bis −1,1 ms.

**Aus Sicht des OMEN ist der Fast-Forward nach main frei.**

| Ort × Sicht | Methode | GPU A → B (ms) | Δ (2σ) | fps A → B | Frame p95 | CPU-Takt p95 | Urteil |
|---|---|---|---|---|---|---|---|
| Genesis Ego | 4+4 Boots, Band | 13,88 → 12,92 | −0,96 (1,01) | 73,6 → 81,2 | 16,8 = 16,8 | 5,4 → 5,3 | nicht langsamer |
| Genesis Third | 4+4 Boots, Band | 13,96 → 12,26 | −1,70 (0,70) | 77,1 → 80,7 | 16,8 = 16,8 | 6,6 → 6,7 (2σ 0,7) | nicht langsamer |
| Wiese Ego | eine Welt, gpu-bank | 11,83 → 10,70 | −1,13 (0,12) | 75,6 → 80,7 | 16,8 = 16,8 | 5,6 = 5,65 ¹ | nicht langsamer |
| Wiese Third | eine Welt, gpu-bank | 4,09 → 4,03 | −0,07 (0,47) | 119 ≈ 119 ¹ | 8,4 = 8,45 ¹ | 7,6 → 7,75 ¹ | nicht langsamer (gleich) |
| Dorf Ego | eine Welt, gpu-bank | 12,41 → 11,19 | −1,22 (0,37) | 74,8 → 80,1 | 16,8 = 16,8 | 5,07 = 5,05 | nicht langsamer |
| Genesis Ego (Eichung) | eine Welt, gpu-bank | 11,41 → 9,94 | −1,47 (0,38) | 79,1 → 84,6 | 16,8 = 16,8 | 5,32 → 5,40 (0,63) | nicht langsamer |

¹ ohne die erste A-Stellung. Sie trägt im `lauf` noch das Einschwingen nach dem Umstellen (Wiese Third: Frame p95 16,9,
Dreiecke 396k statt 1,11 M; Wiese Ego: CPU p95 17,8). Die gpu-bank der ersten Stellung ist davon frei.

- **Frame p50:** In jeder Ein-Welt-Kombi springt er mit dem Schalter, A 16,6 → G 8,5 ms. Mit T3 schafft der Frame den
  120-Hz-Takt, vor T3 fällt er auf 60 Hz. Bei den Genesis-Boots ist es dasselbe (16,6 → 8,5).
- **Frame p95 16,8 auf beiden Seiten:** Das ist der 60-Hz-Deckel des Spiels (Regler voll).

## Methode

- **Genesis Ego/Third:** 4+4 Boots, ABABABAB, `omen-messfolge.cjs` (Folge genesis: lauf voll + Band), EIN Instrument (B).
  - Seiten-Wache vor und nach jedem Boot, GPU-Schloss je Boot.
  - Rohdaten `p3/k1610b1/<kombi>-<A|B><n>.json`, Tafeln `bericht/1610-abab-buendel1/auswertung-g-*.md`.
  - 5 Boots waren rot NUR am Band-Urteil „BAND-LINSE weit“: g-ego-B3, g-ego-B4, g-third-A2, g-third-B3, g-third-A4. Die GTX-Ratsche
    liegt über der Messung beider Seiten (Dreiecke 340–404k gegen 349k bzw. 410k, g-third-A4 Formationen k0). Es ist Streuung, kein
    Befund gegen B; die Messung gilt, und die Ratsche kann nachgezogen werden.
- **Ein-Welt-Messung (Protokoll-Wechsel):** am Kopf B, `bericht/1610-abab-buendel1/eine-welt.cjs`, Folge A G G A A G G A.
  - A = `renderer.setOpaqueSort(null)` (r184-Vorgabe) + Fern-Ring `renderOrder −1`, so wie vor T3.
  - G = `setOpaqueSort(AnazhRealm._zeichenFolge)` + Fern-Ring ohne −1.
  - Nach jedem Umschalten nimmt jede BundleGroup neu auf (`needsUpdate`), sonst behielte sie die alte Reihe. Belegt je Stellung:
    `sort` null bzw. `_zeichenFolge`, 4 Fern-Ring-Meshes, 1–7 BundleGroups.
  - Danach 30 Aufwärm-Takte, `lauf` 15 s unter Regler voll, `gpu-bank` am Blick des Orts (eine Aufwärm-Bank fällt weg, 2 Bänke
    12 × 3), Takt und Drossel je Bank aus nvidia-smi.
  - Der Takt war je Kombi zwischen A und G gleich (Δ ≤ 28 MHz bei 2σ 25).
  - T3 ändert im Spiel NUR die opake Sortierung, das `renderOrder` des Fern-Rings und Schicht-Marken (`stamm/07.js`, `17b.js`,
    `11c.js`, `05b.js`); der Rest des Diffs aa74c324..1185091c sind Kommentare.
- **Gehend:** Wiese 2+2 (s1 A B, s2 B A), `gehen.sh` wie boden3. Der Spieler geht 0 → −60 m und zurück mit 4 m/s im echten Loop.
  `lauf` 30 s unter Regler voll, zuerst stehend, dann zweimal gehend. Tafel `bericht/1610-abab-buendel1/gehen.txt`.
  - In s2 A lehnte `umstellen --ort wiese` ab („das Gras ist ungemessen“). Der Spieler stand durch `werkbank start --ort wiese` am
    Messort; Befehle 84 und Dreiecke 433k decken sich mit den übrigen Läufen.

| gehend Wiese (Mittel s1, s2) | A | B | Δ |
|---|---|---|---|
| stehend Frame p95 / CPU p95 | 16,9 / 6,6 | 16,8 / 5,8 | −0,05 / −0,75 |
| gehend 1 Frame p95 / CPU p95 | 25,1 / 23,1 | 25,1 / 22,3 | 0 / −0,85 |
| gehend 2 Frame p95 / CPU p95 | 25,0 / 16,1 | 25,0 / 15,1 | 0 / −1,05 |
| fps gehend | 58,0–63,4 | 60,3–64,7 | +2 bis +3 |

## Gegen die Erwartung (Radeon, eine Welt)

- **Genesis Ego:** Radeon −17 %, GTX −13 %.
- **Dorf Ego:** Radeon −19 %, GTX −10 %.
- **Wiese:** Auf der Radeon unentschieden; auf der GTX Ego −9,6 %, Third gleich (120-Hz-Deckel, GPU 4 ms).
- **Prüfer-Hinweis „Reihe innerhalb der Schicht ohne Marke hängt an der Objekt-id“:** In keiner Kombi eine Regression gegen A;
  die vier G-Stellungen je Kombi streuen ±0,1–0,3 ms.

## Status ZWISCHENSTAND + Übergabe

- Kein Code-Commit. Rohdaten: `p3/k1610b1/` auf dem OMEN, die Tafeln hier daneben.
- In der Schlange danach: G4a CPU-Takt (A 1185091c, B cee33f91, läuft seit 15:43), dann die S5-Reihe (Frost-Ofen je Reglerwert).
