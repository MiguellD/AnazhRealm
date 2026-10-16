# Bericht 1610 Bündel 3 — GTX: A = main 00b99c59 gegen B = integ d9d1db4e (V18.546.4)

**Status: ZWISCHENSTAND.** Auftrag `auftrag/1610-omen-buendel3.md` (koord f4e7680d). Spielcode A → B: G4a, A2 Wiesen-Farbe, KI1 (nur
Prompt), A5 (nur Mess-Stelle), D3a/CW/A0/echt-vier (Linsen/CI).

## Urteil

**B ist an keinem Ort und in keiner Sicht langsamer (2σ). Aus Sicht des OMEN ist der Fast-Forward auf d9d1db4e frei.**

**Einzige knappe Stelle:** die gpu-bank am Blick der Wiese Ego (Gier 0): +0,22 ms bei 2σ 0,23 über 4+4 Boots, etwa +2 %.
- Nach 2+2 stand sie bei +0,24 / 0,22. Darum habe ich A3 B3 A4 B4 nachgemessen.
- Drei von vier B-Boots liegen über allen A-Boots. Das ist ein Hauch, kein Beweis.
- Bei Gier −0,88 (gleicher Ort) ist es +0,06, das Band −0,20.
- Ort und Blick sind die Nah-Wiese, genau dort, wo A2 die Büschel-Farbe ändert.
- Soll das geklärt werden: Asset-A/B in EINER Welt mit Geo-/Stoff-Tausch nur der Nah-Wiese. Ich schneide das nicht ungefragt.

| Ort × Sicht | Boots | gpu-bank Blick (ms) | gpu-bank Gier −0,88 | Band GPU | Frame p95 | CPU-Takt p95 voll | fps | Befehle · Dreiecke (Band) | VRAM MB | Urteil |
|---|---|---|---|---|---|---|---|---|---|---|
| Wiese Ego | 4+4 | 10,11 → 10,32 (Δ +0,22, 2σ 0,23) | 10,58 → 10,64 (+0,06 / 0,21) | 13,46 → 13,26 | 16,8 = 16,8 | 5,4 → 5,3 | 78,9 = 78,9 | 86 → 87 · 315k → 316k | 95,8 → 95,6 | nicht langsamer (knapp) |
| Wiese Third | 2+2 | 9,98 → 9,61 (−0,38 / 0,36) | 10,09 → 9,84 (−0,25 / 0,38) | 13,12 → 12,78 | 16,8 = 16,8 | 6,4 → 6,2 | 79,7 → 80,3 | 104 → 102 · 405k → 400k | 98,7 → 99,2 | nicht langsamer |
| Genesis Ego (Eichung) | 1+1 | — | — | 13,30 → 12,10 | 16,8 = 16,8 | 5,6 → 5,7 | 80,2 → 83,0 | 105 = 105 · 350k = 350k | 109,5 → 108,9 | wie Bündel 1 (G4a dort belegt) |

- **A2 im Band:** Die erwarteten +270 Dreiecke und +4 Befehle verschwinden in der Streuung der Wiese (Dreiecke ±9k, Befehle ±4).
- **Takt und Drossel (nvidia-smi, 1 Hz je Boot):**
  - Die GTX drosselt auf beiden Seiten 89–93 % der Zeit (Maske 0x1) bei 80–83 °C.
  - Bank-Takt Wiese Ego 1735 → 1738 MHz, also gleich.
  - Boot-Mittel 1602 → 1590 MHz (2σ 25).
- **CPU-Takt p95 im Lauf „frei“:** Wiese Ego 5,3 → 6,8 (2σ 2,2), Wiese Third 5,9 → 8,3 (2σ 5,3).
  - Getragen von zwei Läufen: w-ego-B2 9,1 und w-third-B1 10,9.
  - In w-third-B1 regelt der Regler den Laub-Radius auf 214 statt 191 m hoch, und die Welt streamt nach (EWMA streaming 2,9 ms,
    archCulling 1,26, render 6,91). w-third-A1 zeigt dasselbe schwächer (2,27 / 0,44 / 3,7).
  - Das ist Welt in Bewegung unter dem Regler, kein B-Muster. Unter „voll“ mit festen Stellgrößen ist der CPU-Takt gleich
    (Wiese Ego 5,4 → 5,3).

## Methode

- **Vorgehen:**
  - 4+4 / 2+2 / 1+1 Boots, Folge A1 B1 A2 B2 (Wiese Ego danach A3 B3 A4 B4), `omen-messfolge.cjs` (lauf voll + frei, gpu-bank am
    Blick, Band).
  - EIN Instrument: abab-pd9d (B-Kopf). Seiten-Wache vor und nach jedem Boot, GPU-Schloss je Boot, nvidia-smi je Boot mit.
- **Neuläufe:**
  - w-ego-A1 brach im ersten Versuch beim `umstellen` ab („das Gras ist ungemessen“, die Boden-Karte stand noch nicht im Ring).
    Der zweite Versuch ist grün, der erste liegt als `w-ego-A1-verworfen-1.*` bei.
  - Rot NUR am Band-Urteil „BAND-LINSE weit“ waren w-ego-B1, A3, A4 und w-third-B2. Die GTX-Ratsche liegt über der Messung
    beider Seiten. Die Messung gilt.
- **Zwei Echt-Läufe (Vorfahrt) lagen zwischen den Boots:** d9d1db4e (17:27–17:42) und aba1da28 (18:19–18:35).

## Status ZWISCHENSTAND + Übergabe

- Kein Code-Commit. Rohdaten: `bericht/1610-buendel3/`.
  - je Boot `.json` und `-smi.csv`, die Tafeln `auswertung-<kombi>.md`, Skripte `stehen.sh`, `nachlauf.sh`, `auswertung.cjs`.
  - Auf dem OMEN: `p3/k1610b3/`.
- **Danach:** FZ (Weltbild kalt GTX, A 1d831571 gegen B 27ae78bf) läuft seit 18:56.
