# Bericht 1610 Bündel 5 — GTX: A = c03ea075 gegen B = 3caca1cd (V18.546.6)

**Status: ZWISCHENSTAND.** Auftrag des Koordinators 16.10.: Genesis Ego 2+2. Spielcode A → B: nur A4, das Kopf-Gesetz (Mensch-Kopf L0
11 880 → 11 354 Dreiecke, Ofen-Goldens neu); dazu S5 (Linse) und WL (Linsen).

## Urteil

**3caca1cd ist nicht langsamer als c03ea075.**
- CPU-Takt p95 voll gleich: 5,95 = 5,95 (A 6,0 / 5,9, B 5,6 / 6,3).
- Das Band ist auf B schneller: GPU 13,14 → 11,94 ms (Δ −1,21, 2σ 0,63). Das passt zum kleineren Kopf.

| Größe | A c03ea075 | B 3caca1cd | Δ B − A | 2σ | Urteil |
|---|---|---|---|---|---|
| CPU-Takt p95 voll ms | 5,95 (6,0 · 5,9) | 5,95 (5,6 · 6,3) | 0,0 | 0,7 | nicht langsamer |
| Band GPU ms je Frame | 13,14 (13,06 · 13,23) | 11,94 (12,24 · 11,63) | −1,21 | 0,63 | schneller |
| fps (Regler voll) | 79,8 (80,1 · 79,6) | 81,4 (83,4 · 79,4) | +1,6 | 4,0 | nicht langsamer |
| Frame p95 ms | 16,8 | 16,8 | 0 | 0 | am 60-Hz-Deckel |
| Befehle · Dreiecke (Band) | 105 · 340k | 105 · 345k | 0 · +4,9k (2σ 9,4k) | | Streuung der Szene |
| VRAM MB | 107,8 | 108,5 | +0,7 | 1,4 | gleich |

- **Höheres CPU-Niveau dieser Serie (5,6–6,3 statt 5,5–5,9):** Es lag auf beiden Seiten gleich (später Abend, Karte 80 °C, 88–90 %
  gedrosselt). Der Vergleich in EINER Serie trägt.
- **Das offene CPU-Plus d9d1db4e → c03ea075 (Bündel 4):** Es liegt vor diesem Schritt und wird im Nachtrag zu
  `bericht/1610-buendel4.md` behandelt.

## Methode

- **Vorgehen:**
  - `omen-messfolge.cjs` Folge genesis (lauf voll + frei, Band), Folge A1 B1 B2 A2.
  - EIN Instrument: abab-p3ca (B-Kopf 3caca1cd). Seiten-Wache, GPU-Schloss je Boot, nvidia-smi.
  - Kein CI-Lauf im Fenster (22:11–22:21).
- **Rot NUR am Band-Urteil „BAND-LINSE weit“:** g-ego-A1, B2, A2. Die Ratsche liegt über der Messung, die Messung gilt.

## Status ZWISCHENSTAND + Übergabe

- Kein Code-Commit. Rohdaten: `bericht/1610-buendel5/` (je Boot `.json` und `-smi.csv`, `auswertung.md`, `stehen.sh`); auf dem OMEN:
  `p3/k1610b5/`.
