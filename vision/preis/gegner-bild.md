# GEGNER BILD: „kein Bildpaar ist schlechter als main“ (Preis des Orts, Zweig w28-preis-ort) — ZWISCHENSTAND

Gegner, nur lesen und messen. Kopf cab90667 (Schnitt 1–3), main-Baum 50564dea, Basis ffb005db. Bilder unter
`artifacts/profiband/auge/w28-preis-ort/`. Werkzeug der Zahlen: Pixel-Vergleich je Paar (mittlere Abweichung je Kanal 0–255,
Anteil Pixel mit Kanal-Abweichung > 24, Luma-Mittel, Schärfe = mittlere waagrechte Luma-Stufe), eigenes Skript im Scratch.

## 1. Die vorhandenen Paare, selbst angesehen und nachgezählt

| Serie | Pose | Auflösung | mad | > 24 | Luma main → Kopf | Schärfe main → Kopf |
|---|---|---|---|---|---|---|
| Schnitt 1 (ffb005db → 9fba231b) | genesis-ego | **960 × 540** | 0,25 | 0,05 % | 108,2 → 108,2 | 4,39 → 4,39 |
| | genesis-third | 960 × 540 | 0,22 | 0,06 % | 109,9 → 109,9 | 4,40 → 4,40 |
| | dorf-ego | 960 × 540 | 0,60 | 0,85 % | 77,0 → 77,0 | 2,51 → 2,52 |
| | dorf-nacht (Uhr 0,97) | 960 × 540 | 0,11 | 0,03 % | 42,1 → 42,2 | 1,66 → 1,66 |
| | wiese-ego | 960 × 540 | 0,60 | 0,26 % | 81,0 → 81,1 | 9,68 → 9,66 |
| | wiese-third-mittag | 960 × 540 | 0,52 | 0,25 % | 83,3 → 83,3 | 9,95 → 9,93 |
| | wiese-third-tief (Uhr 0,27) | 960 × 540 | 0,43 | 0,11 % | 74,5 → 74,5 | 9,94 → 9,94 |
| | wiese-third-daemmerung (Uhr 0,76) | 960 × 540 | 0,05 | 0,01 % | 39,6 → 39,6 | 6,75 → 6,75 |
| Schnitt 2 (50564dea → 1ca0611c) | genesis-ego (Folge) | 1920 × 1080 | 2,52 | 2,75 % | 108,1 → **106,4** | 3,88 → 3,88 |
| | genesis-third (Folge) | 1920 × 1080 | 2,21 | 3,02 % | 109,5 → 109,2 | 3,92 → 3,99 |
| | dorf-ego | 1920 × 1080 | 2,71 | 4,38 % | 78,0 → 77,1 | 1,99 → 2,01 |
| | wiese-ego | 1920 × 1080 | 0,61 | 0,34 % | 81,5 → 81,5 | 8,43 → 8,42 |
| | wiese-third-mittag | 1920 × 1080 | 0,53 | 0,35 % | 83,8 → 83,8 | 8,51 → 8,50 |
| | rueck-wiese-ego | 1920 × 1080 | 1,22 | 1,85 % | 81,7 → 81,4 | 8,45 → 8,42 |
| | rueck-wiese-third | 1920 × 1080 | 2,00 | 3,32 % | 84,0 → 83,0 | 8,53 → 8,49 |

Gesehen: `s2-paar-genesis-ego.png` — am Kopf fehlen die Membranen aller drei Tore (der Bericht nennt es, nachgeschossen gleich).
`s3-paar-dorf-ego.png` — am Kopf steht ein Bewohner nah vor der Kamera (Leben, kein Bestand; ohne Gegenstück an main nicht urteilbar).

**Was die vorhandenen Paare NICHT tragen** (die Stellen, an denen ein Format- oder Auflösungs-Schnitt zuerst sichtbar wird):
- Jede Paar-Aufnahme ist ein STEHENDES Bild (Abnahme `weltTakte 0`) — keine Kante in Bewegung, kein TRAA-Geist.
- Die Uhr-Paare (tief 0,27 · Dämmerung 0,76 · Nacht 0,97) gibt es nur in 960 × 540 und nur für Schnitt 1; Schnitt 2 und 3 sind nur zu
  Uhr 0,5 geschossen.
- Kein Paar zeigt einen Wurf des Punkt-Schattens (der Bericht sagt es selbst: „der Glutbrunnen mit werfendem Feuer … nicht im Paar“),
  obwohl die Würfel-Tiefe auf depth16 fiel.

(Teil 2 — eigene Paare — folgt.)
