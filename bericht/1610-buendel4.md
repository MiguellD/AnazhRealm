# Bericht 1610 Bündel 4 — GTX: A = main d9d1db4e gegen B = integ c03ea075 (V18.546.5)

**Status: ZWISCHENSTAND.** Messauftrag des Koordinators 16.10.: K2 (Konstanten/Wetter, LOD-Ersatz), W2 (Boden-Stoff als
DataArrayTexture), A6 (nur Labor) sind Spiel; Wiese Ego und Genesis Ego je 2+2 Boots, Urteil „nicht langsamer“.

## Urteil

**Wiese Ego: nicht langsamer, auf der GPU gleich.**

**Genesis Ego: ein kleines CPU-Plus.** Der CPU-Takt p95 unter Regler voll steigt 5,60 → 5,80 ms (Δ +0,20 bei 2σ 0,15, 4+4 Boots):
- Alle B-Boots liegen bei 5,7–5,9, alle A-Boots bei 5,5–5,7.
- Das Plus trägt die Render-Phase: EWMA 2,95 → 3,12 ms. Kreaturen, Physik und Streaming sind gleich.
- GPU (Band) gleich, Frame p95 am 60-Hz-Deckel gleich, fps +1,7.
- B liegt damit genau auf der G4a-Marke 5,8.
- Der Täter ist noch nicht benannt (siehe unten).

| Ort × Sicht | Boots | CPU-Takt p95 voll | gpu-bank Blick | gpu-bank Gier −0,88 | Band GPU | Frame p95 | fps | Befehle · Dreiecke | VRAM MB | Urteil |
|---|---|---|---|---|---|---|---|---|---|---|
| Wiese Ego | 2+2 | 5,35 → 5,30 (2σ 0,3) | 10,28 → 10,18 (−0,10 / 0,32) | 10,51 → 10,54 (+0,03 / 0,41) | 13,61 → 14,27 (+0,66 / 1,05) | 16,8 = 16,8 | 79,2 → 78,8 | 87 = 87 · 316k = 316k | 95,8 → 95,3 | nicht langsamer |
| Genesis Ego | 4+4 | 5,60 → 5,80 (+0,20 / 0,15) | — | — | 12,55 → 12,61 (+0,06 / 1,49) | 16,8 = 16,8 | 80,7 → 82,4 | 105 = 105 · 348k → 346k | 108,8 → 108,7 | CPU +0,2 ms (knapp, real) |

- **Genesis Ego erst 2+2:** CPU +0,2 bei 2σ 0,2 an der Grenze, Band +0,63. Darum A3 B3 A4 B4 nachgemessen. Das CPU-Plus blieb, das
  Band ging auf +0,06.
- **Wiese Ego, Band +0,66 mit 2σ 1,05:** Die Bank am festen Blick ist gleich (−0,10 / +0,03), das Band streut hier zwischen den Boots.
- **Takt (nvidia-smi):** Genesis-Boots B liefen im Mittel mit 1590 statt 1517 MHz. Das trifft nur die GPU; der CPU-Takt ist davon
  frei.

**Täter-Kandidaten** (Spiel-Commits A → B: W2 aba1da28, KI2 a2986b30, K2 ede774f1, A6 6ebe38e1 nur Labor):
- **W2:** Die Wege-, Kronen-Streu- und Fluss-Karten laden je Schicht hoch, nur beim Neu-Zentrieren. Statisch keine Arbeit je Frame.
- **K2 (33 Dateien):** Ersatz-Literale werden zu Konstanten, dazu kommt der LOD-Ersatz. Das ist der größte Kandidat für Arbeit in
  heißen Schleifen.
- **Benennen:** ein Bisekt-Schritt Genesis Ego 4+4, z. B. a2986b30 (W2+KI2) gegen ede774f1 (+K2), etwa 30 min. Ich fahre ihn auf
  Zuruf.

## Methode

- **Vorgehen:**
  - `omen-messfolge.cjs` (lauf voll + frei, gpu-bank am Blick (nur Wiese), Band), Folge A1 B1 A2 B2, Genesis danach A3 B3 A4 B4.
  - EIN Instrument: abab-pc03 (B-Kopf). Seiten-Wache und GPU-Schloss je Boot, nvidia-smi je Boot.
- **Rot nur am Band-Urteil „BAND-LINSE weit“ (Ratsche über beiden Seiten):** w-ego-A1, w-ego-B2, g-ego-B1, g-ego-A2. Die Messung
  gilt.
- **Echt-Lauf an c03ea075 (Run 38942514701, Vorfahrt 19:48–20:04):** rot nur an der Frost-Wand, wie bekannt (S5, Karte
  frost-s5-ruhe). Die übrigen 21 Jobs sind grün.

## Status ZWISCHENSTAND + Übergabe

- Kein Code-Commit. Rohdaten: `bericht/1610-buendel4/`.
  - je Boot `.json` und `-smi.csv`, die Tafeln `auswertung-w-ego.md` und `auswertung-g-ego.md`, `stehen.sh`, `auswertung.cjs`.
  - Auf dem OMEN: `p3/k1610b4/`.
- Offen: der Täter des Genesis-CPU-Plus, nur auf Zuruf.
