# Bericht 1710 Bündel 7 — GTX: A = main 93539122 (V18.546.11) gegen B = integ e47ad9f8 (V18.546.12 + A13 ohne 48c668ef)

**Status: ZWISCHENSTAND.** Auftrag des Koordinators 17.10.: Bündel-ABAB an der GTX, Genesis Ego/Third und Wiese Ego, je 4+4; B3c
(Hausbau aus dem Haupt-Faden), A3b (Resolve mit Deckungs-Gedächtnis; seine GPU-Kosten als Pass-Zeit), A9 (Bild-Uhr). B war zuerst
79e000ba, dann e47ad9f8 (48c668ef zurückgenommen). Danach eine Bisektion im echten Lauf an der Wiese.

## Urteil

- **B ist im echten Lauf an der Wiese und an Genesis Ego langsamer:**
  - Wiese Ego: fps 79,2 → 76,1, GPU-Durchsatz +0,72 ms (2σ 0,32).
  - Genesis Ego: fps 84,8 → 82,5, Durchsatz +0,45 ms (2σ 0,29).
  - Genesis Third ist gleich; das 120-Hz-Raster deckelt dort bei 80 fps.
  - Frame p95 ist überall 16,8 = 16,8.
- **A3b kostet** im TRAA-Pass +0,12–0,13 ms an allen drei Orten (0,68 → 0,80/0,82) und +3,4 bis +4,1 MB VRAM.
- **Die Bisektion (Wiese) legt das ganze Plus in den Schritt B3c + A3b** (Durchsatz +0,78 ms, 2σ 0,20). A9 trägt nichts (−0,02). Der
  ungestempelte Rest von +0,66 ms liegt außerhalb der gestempelten Pässe, Kandidat sind die Stoffe von A3b (`_laubVersatz`).
- **Der CPU-Takt wird überall besser** (B3c): Genesis Third 6,4 → 6,0, Genesis Ego 5,3 → 5,0, Wiese 4,8 → 4,4. Genesis Third hält die
  5,8 ms weiter nicht.
- **gpu-bank und Band-GPU der A-Seite in der Serie sind ungültig** (Instrument, unten). Gültig sind der Lauf, die Pässe, CPU, Band-Zählung
  und VRAM.

## Bisektion im echten Lauf (Wiese Ego, je Seite 4 Welten, jede Seite mit ihrem Instrument)

Seiten: S0 = main 93539122 · S2 = 404d97dd (+B3c, D3c-leben, A3b) · S3 = f1e96de5 (+48c668ef, A9). S1 (0f86daaf) und S4 (B) fielen auf
Zuruf. 4 Runden gespiegelt (0 → 3, 3 → 0, …), 11:00–11:21, keine CI-Pause dazwischen.

| Größe | S0 93539122 | S2 404d97dd | S3 f1e96de5 | S0 → S2 (B3c + A3b) | S2 → S3 (A9) |
|---|---|---|---|---|---|
| fps (lauf voll) | 79,3 (79,1 · 79,6 · 78,9 · 79,6) | 76,1 (75,9 · 75,8 · 76,2 · 76,6) | 75,9 (76,0 · 76,0 · 75,5 · 76,2) | **−3,2** (2σ 0,7) | −0,2 (2σ 0,7) |
| GPU-Durchsatz p50 ms | 12,45 (12,40 · 12,40 · 12,60 · 12,40) | 13,22 (13,30 · 13,30 · 13,20 · 13,10) | 13,20 (13,20 · 13,20 · 13,30 · 13,10) | **+0,78** (2σ 0,20) | −0,02 (2σ 0,18) |
| Pass TRAA p50 ms | 0,69 | 0,81 | 0,81 | **+0,12** (2σ 0,01) | 0,00 |
| Pass k0 p50 ms | 0,25 (alle) | 0,35 (0,63 · 0,26 · 0,26 · 0,26) | 0,35 (0,26 · 0,26 · 0,26 · 0,63) | +0,10 (2σ 0,26) | 0,00 |
| Pass haupt / post p50 ms | 0,46 / 0,44 | 0,47 / 0,42 | 0,47 / 0,42 | +0,01 / −0,02 | 0,00 / 0,00 |
| CPU-Takt p95 ms | 4,7 | 4,7 | 4,5 | 0,0 | −0,2 (2σ 0,3) |
| gpu-bank ms (eigenes Instrument) | 11,88 (11,93 · 11,82 · 11,98 · 11,80) | 12,34 (12,50 · 12,48 · 12,31 · 12,08) | 12,14 (12,30 · 12,13 · 12,09 · 12,04) | **+0,46** (2σ 0,30) | −0,20 (2σ 0,32) |

- **A9 trägt nichts:** S2 → S3 ist im Durchsatz −0,02 ms, in fps −0,2, im TRAA-Pass 0. Auch 48c668ef (die Seltenheit vom ersten Takt)
  liegt in diesem Schritt.
- **Das ganze Plus liegt in S0 → S2:** Durchsatz +0,78 ms (S0 → S3 +0,75, die Serie +0,72, der Nachtrag +0,60).
  - +0,12 davon ist der gestempelte TRAA-Anteil von A3b.
  - Der Rest von **+0,66 ms** liegt außerhalb der gestempelten Pässe. Gestempelt sind ~1,9–2,1 ms je Bild; das Haupt-Szenen-Render trägt
    die Pass-Uhr nicht.
- **Kandidat für den Rest: A3b** (nicht getrennt gemessen, S1 fiel).
  - B3c ändert nur die Haus-Hülle und die Platzierung (`_hausHuelleSetzen`, `spawnArchitecture`, Affordanzen), also die CPU-Seite.
  - A3b ändert die Stoffe des Bilds: `_buildPbrNodeMaterial`, `_ensureLodUniforms`, `_foundryTreeMaterial`, `_blattAtlasProbe`, neu
    `_laubVersatz` statt `_laubKante`/`_laubSchwelle`. Dazu kommen `_zeitAufloesung` und `_loopRender`.
  - Ein Laub-Versatz, der im Lauf je Bild wandert, kostet im stehenden Bild (gpu-bank, Uhren gehalten) weniger als im Lauf (+0,46 gegen
    +0,78). Das passt dazu, und an der Wiese (Laub) ist das Plus größer als an Genesis Ego (+0,45).
- **Benennen** ginge mit S1 (0f86daaf) gegen S2 im Lauf (4 + 4, ~15 min) oder in EINER Welt an S2 mit dem Tausch der A3b-Stoff-Methoden
  aus 0f86daaf, auf Zuruf.


## Die Serie (Regler voll, je 4 Boots, EIN Instrument abab-b7b = e47ad9f8 mit Stations-Weiche)

| Ort × Sicht | fps | GPU-Durchsatz p50 | Pass TRAA p50 | Summe Pässe | CPU-Takt p95 / p50 / p99 | Frame p95 / p50 | Befehle · Dreiecke (Band) | VRAM MB | Urteil |
|---|---|---|---|---|---|---|---|---|---|
| Genesis Ego | 84,8 → 82,5 (−2,3 / 1,9) | 11,45 → 11,90 (+0,45 / 0,29) | 0,68 → 0,80 | 1,51 → 1,69 | 5,3 → 5,0 · 3,75 → 3,65 · 6,5 → 6,2 | 16,8 = · 8,4 = | 109 = · 289k = | 102,1 → 106,3 | Lauf langsamer, CPU besser |
| Genesis Third | 79,8 → 79,6 | 12,50 → 12,55 (Raster) | 0,68 → 0,80 | 1,60 → 1,73 | 6,4 → 6,0 · 4,67 → 4,53 · 8,4 → 7,3 | 16,8 = · 9,2 → 15,9 (Raster) | 142 = · 382k = | 106,4 → 110,4 | nicht langsamer, hält ≤ 5,8 nicht |
| Wiese Ego | 79,2 → 76,1 (−3,1 / 1,2) | 12,43 → 13,15 (+0,72 / 0,32) | 0,69 → 0,82 | 1,96 → 1,98 | 4,8 → 4,4 · 3,30 → 3,17 · 6,4 → 5,7 | 16,8 = · 14,5 → 16,6 | 91 → 90 · 312k = | 94,9 → 98,3 | Lauf langsamer, CPU besser |

- **Pass-Uhr:** post, haupt, k1, atmo-himmel, horizont-karte und Ortho (Post-Kette) sind gleich bis ±0,02. Allein der TRAA-Pass bewegt
  sich.
- **k0 an der Wiese** ist zweigipflig (0,25 oder 0,62, in A wie in B: Nachtrag AA 0,25/0,61, BB 0,26/0,62). Das hängt an der Welt, nicht
  an der Seite.
- **Die Band-Szene ist dieselbe:** Befehle und Dreiecke sind gleich, an der Wiese −1 Befehl, −0,6k.
- **Rot nur am Band-Urteil** (BAND-LINSE ratsche/weit). Die Messungen gelten. Zwei CI-Läufe lagen in Genesis Third zwischen A1/B1 und
  B2/A3.

## Das Instrument über A9 hinweg

- **Bruch ohne Weiche:** Das Instrument ab A9 (der B-Kopf) ruft `r._weltSteht()` (Einschwingen bis Ring am Ziel und 30 Takte Ruhe) und
  `r._weltOffen()`. Die A-Seite kennt beide nicht; g-ego-A1 brach zweimal rot ab.
- **Die Weiche:** Die Station setzt sie in ihrer Kopie (evaluateOnNewDocument, nur wenn die Methode fehlt, nicht gepusht). `_weltOffen`
  liest dieselben Felder, `_weltSteht` zählt 30 Takte ohne Offenes. A schwang damit ein (z. B. 177 Takte, Ring 81 Chunks, `steht` true).
- **Was die Weiche nicht heilt:** Die A9-Bühne hält nur noch `r._bildZeit`. An einer Seite vor A9 laufen die alten Bild-Uhren (Himmel,
  Wasser, Wind) frei, und nach der gpu-bank stand `skyboxUniforms.time.value` auf undefined. Gegenprobe an der Wiese Ego, je eine Welt:

| Seite × Instrument | gpu-bank ms | Himmel- / Wasser-Uhr | Lauf: Durchsatz · fps · TRAA |
|---|---|---|---|
| A 93539122 mit A (vor A9) | 11,50 / 11,68 | gehalten (12,5) | 12,4 · 79,8 · 0,68 |
| A 93539122 mit B (A9 + Weiche) | **6,17 / 6,04** | frei, nach der Bank undefined | 12,6 · 78,8 · 0,69 |
| B e47ad9f8 mit B | 12,44 / 12,45 | über `_bildZeit` gehalten | 13,3 · 75,2 · 0,82 |

- Die gpu-bank der A-Seite (Wiese 6,26) und die Band-GPU (7,2–7,9) in der Serie sind darum ungültig. Der Lauf bleibt nah am eigenen
  Instrument (Durchsatz 12,6 gegen 12,4), mit freien Uhren eher zu langsam für A.

## Nachtrag: gpu-bank an der Wiese, jede Seite mit IHREM Instrument (AA/BB abwechselnd 4+4)

| Größe | A 93539122 (eigenes Instrument) | B e47ad9f8 (eigenes Instrument) | Δ | 2σ | Urteil |
|---|---|---|---|---|---|
| gpu-bank ms (Blick, Mittel 2 Bänke) | 11,75 (11,87 · 11,85 · 11,95 · 11,33) | 12,08 (12,27 · 12,29 · 11,86 · 11,91) | +0,34 | 0,51 | nicht langsamer |
| fps (lauf voll) | 79,6 (79,6 · 79,3 · 78,6 · 80,8) | 76,7 (75,7 · 75,7 · 78,0 · 77,3) | −2,9 | 2,1 | langsamer |
| GPU-Durchsatz p50 ms | 12,47 (12,50 · 12,40 · 12,70 · 12,30) | 13,08 (13,30 · 13,40 · 12,70 · 12,90) | +0,60 | 0,53 | langsamer |
| CPU-Takt p95 ms | 5,0 | 4,5 | −0,5 | 0,6 | nicht langsamer |
| Pass TRAA p50 ms | 0,69 | 0,81 | +0,13 | 0,01 | langsamer |
| Pass k0 p50 ms | 0,34 (0,25 · 0,61 · 0,25 · 0,25) | 0,44 (0,26 · 0,26 · 0,62 · 0,63) | +0,10 | 0,39 | nicht langsamer |
| Pass haupt / post p50 ms | 0,46 / 0,44 | 0,48 / 0,42 | +0,02 / −0,02 | 0,03 / 0,00 | gleich |

- Im stehenden Bild zahlt B +0,34 ms (TRAA +0,13 und Rauschen). Im laufenden Spiel zahlt es +0,60. Was den Unterschied trägt, arbeitet
  je Bild im Lauf, nicht im stehenden Bild.

## Methode

- **Serie:**
  - `omen-messfolge.cjs` je Boot (lauf voll + frei, gpu-bank an der Wiese, Band), Folge A1 B1 … A4 B4, Genesis Ego → Genesis Third →
    Wiese Ego, 07:48–10:15.
  - EIN Instrument abab-b7b (e47ad9f8) mit der Stations-Weiche. Seiten-Wache vor und nach jedem Boot, GPU-Schloss mit 180 s CI-Ruhe,
    nvidia-smi je Boot.
- **Verworfen:** Die Boots an 79e000ba (g-ego-A1 am Instrument gebrochen, g-ego-B1) liegen auf dem OMEN in `p3/k1710b7/beiseite-79e/`.
- **Pass-Uhr:** `gpuJePassMs` p50 aus `lauf voll` (0,01 ms gerundet; ein „LANGSAMER“ bei ±0,01 ist Rundung). Der GPU-Durchsatz ist der
  Abstand fertiger GPU-Bilder.
- **Proben:**
  - Instrument-Probe und Nachtrag: `instrument-probe.cjs` in einer Werkbank je Welt (dorf-aus, fenster, umstellen Wiese Ego, Bühne,
    lauf voll 15 s, gpu-bank 120 × 2 Aufwärmen + 2 Bänke 12 × 3, die Uhren der Bühne).
  - Bisektion: dieselbe Probe, jede Seite mit ihrem Baum als Instrument.

## Status ZWISCHENSTAND + Übergabe

- Kein Code-Commit. Rohdaten liegen in `bericht/1710-buendel7/`: je Boot `.json`, `auswertung-<kombi>.md`, `stehen.sh`, `auswertung.cjs`,
  `instrument/`, `eigen/`, `bisekt/` mit ihren Skripten und die Stations-Weiche als Diff.
- **Offen:**
  - Welches Glied von S0 → S2 die +0,66 ms trägt (B3c oder A3b; Kandidat: die Stoffe von A3b), auf Zuruf.
  - Genesis Third CPU-Takt p95 6,0 > 5,8 (E bleibt offen).
  - A3b in der EINEN Skala (Karte des Koordinators: −4 MB, −0,12 ms).
