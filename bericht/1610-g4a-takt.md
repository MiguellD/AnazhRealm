# Bericht 1610 G4a CPU-Takt — GTX: A = integ 1185091c gegen B = integ cee33f91 (G4a Gruppen-Geburt)

**Status: ZWISCHENSTAND.** Auftrag des Koordinators 16.10.: Genesis Ego und Wiese Ego, je 2+2 Boots, `werkbank takt` nach 120 s
Einschwingen. Frage: Hält der CPU-Takt p95 ≤ 5,8 ms mit Rudeln und Herden?

## Urteil

**Ja. Der CPU-Takt p95 bleibt in allen 8 Boots ≤ 5,8 ms, der Höchstwert ist 5,6 (g-ego-B1). B ist nicht langsamer.**

- Genesis Ego: `lauf` p95 5,05 → 5,35 (Δ +0,30, 2σ 0,51) und `takt 300` p95 4,55 → 4,50. Beides liegt im Rauschen.
- Wiese Ego: `lauf` p95 5,00 → 4,85 und `takt` p95 5,00 → 4,80.
- Genesis p50 steigt um +0,20 bei 2σ 0,14. Das ist knapp und stützt sich auf nur 2 Boots je Seite, p95 und `takt` zeigen es nicht.
- Kreatur-Phase (`phasenEwmaMs.creatures`): Genesis 0,23 / 0,23 → 0,31 / 0,24, Wiese 0,30 / 0,36 → 0,29 / 0,31. Kein Gang.

| Kombi | Größe | A1 / A2 | B1 / B2 | Mittel A → B | Δ | 2σ(Δ) |
|---|---|---|---|---|---|---|
| Genesis Ego | CPU-Takt p95 (`lauf` 30 s voll) | 5,0 / 5,1 | 5,6 / 5,1 | 5,05 → 5,35 | +0,30 | 0,51 |
| Genesis Ego | CPU-Takt p50 | 3,8 / 3,7 | 4,0 / 3,9 | 3,75 → 3,95 | +0,20 | 0,14 |
| Genesis Ego | CPU-Takt p99 | 6,5 / 6,1 | 6,9 / 6,2 | 6,30 → 6,55 | +0,25 | 0,81 |
| Genesis Ego | `takt 300` p95 | 4,5 / 4,6 | 4,3 / 4,7 | 4,55 → 4,50 | −0,05 | 0,41 |
| Genesis Ego | fps · Frame p95 | 81,2 / 81,1 · 16,8 | 80,1 / 84,4 · 16,8 | 81,2 → 82,3 | +1,1 | 4,3 |
| Wiese Ego | CPU-Takt p95 | 5,1 / 4,9 | 4,7 / 5,0 | 5,00 → 4,85 | −0,15 | 0,36 |
| Wiese Ego | CPU-Takt p50 | 3,6 / 3,6 | 3,4 / 3,6 | 3,60 → 3,50 | −0,10 | 0,20 |
| Wiese Ego | CPU-Takt p99 | 6,4 / 6,0 | 5,9 / 6,5 | 6,20 → 6,20 | 0 | 0,72 |
| Wiese Ego | `takt 300` p95 | 4,9 / 5,1 | 4,8 / 4,8 | 5,00 → 4,80 | −0,20 | 0,20 |
| Wiese Ego | fps · Frame p95 | 79,1 / 79,1 · 16,8 | 79,7 / 78,8 · 16,8 | 79,1 → 79,3 | +0,15 | 0,9 |

## Die Tiere

| Ort | A (je Boot gleich) | B (je Boot gleich) | im Blick |
|---|---|---|---|
| Genesis | 10: Bär 3 · Hirsch 5 · Fuchs 2 | 9: Fuchs 4 · Hirsch 4 · Bär 1 | 0 |
| Wiese | 10: Bär 5 · Hirsch 4 · Fuchs 1 | 9: Fuchs 3 · Hirsch 4 · Bär 2 | A 1, B 0 |

- B wirft andere Arten, A 10 und B 9 Tiere. Zahl und Arten sind je Seite in beiden Boots gleich, die Geburt ist also fest gesät.
- Fast kein Tier steht im Blick (Ego am Messort). Der Takt misst daher die KI und das Gehen der Tiere, nicht ihr Zeichnen.
- Ob die Würfe von B als Rudel und Herden zusammenstehen, zeigt `__tierZahl` nicht, es zählt nur Arten. Die Zusammensetzung (Fuchs 4,
  Hirsch 4) passt zu `herde.wurf`.

## Methode

- **Vorgehen:**
  - EIN Instrument: Werkbank am B-Kopf `abab-pcee`, je Boot ein frischer Stand. Folge je Kombi A1 B1 A2 B2, GPU-Schloss je Boot.
  - Je Boot: `dorf-aus` · `fenster 1920×1080` · `umstellen --ort <ort> --sicht ego` · Bühne · 120 s Einschwingen.
  - Dann `lauf 30 --ein 20 --ruhe 300 --regler voll --tiere frei`. Er misst erst, wenn die Welt 3 s ruht; alle 8 Läufe ruhig mit 81
    Chunks, Foundry 0, Karten 0.
  - Danach `__tierZahl`, `takt 300` und noch einmal `__tierZahl` (vor und nach gleich).
- **Was B ändert:** Der Spiel-Diff 1185091c..cee33f91 ist nur G4a (`stamm/02a.js`, `06a.js`, `06c.js`, `24.js`, `26b.js`,
  `tetrapoda-core.js`). Der Rest sind Skripte (D3a) und CI.
- **GPU:** Die Karte läuft nach jedem Boot heiß und gedrosselt (79 °C, 822 MHz, Drossel-Maske 0x1). Beide Seiten trifft das gleich, und
  Frame p95 steht überall am 60-Hz-Deckel (16,8).
- **v1 verworfen:** Die erste Reihe (`p3/k1610g4/v1/`) maß ohne `--ruhe` mitten im Streaming.

## Status ZWISCHENSTAND + Übergabe

- Kein Code-Commit. Rohdaten: `bericht/1610-g4a-takt/<kombi>-<A|B><n>/` (lauf, takt, tiere, umstellen), Tafel `tafel.md`, Skripte
  `serie.sh` und `auswertung.cjs`, auf dem OMEN `p3/k1610g4/`.
- Danach: S5 (Frost-Ofen), die Probe v5 läuft.
