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

## 2. Eigene Paare (Radeon 890M, `--echt` 1920 × 1080, je EINE Sitzung, dieselbe Folge, 15.11.)

main-Baum 50564dea 04:54–04:58 (Schloss „gegner-bild“), Kopf cab90667 05:12–05:16 (`gpu-lauf.sh gegner-bild`). Folge je Sitzung:
Wiese ego Gang 4 m → Wiese third Gang 4 m → Ankunft ego Gang 4 m → Wiese → acht stehende Schüsse (Kamera der Paare von Schnitt 2) →
Wiese mit Soll-Tafel → Glutbrunnen → `werkbank pop`. Treiber `gegner.cjs` (Scratch), Bilder und Abnahmen unter
`artifacts/profiband/auge/w28-preis-ort/gegner/{main,kopf2}/`. (`gegner/kopf/` ist ein abgebrochener Lauf ohne Wert.)

| Schuss | Kamera main ↔ Kopf | mad | > 24 | Luma main → Kopf | gesehen |
|---|---|---|---|---|---|
| gang-ankunft-ego (Bewegung, TRAA) | 4 mm | 2,04 | 1,52 % | 102,7 → 102,7 | gleich: Tor-Stäbe, Membranen, Halm-Kanten, kein Geist (`gegner-gang-ankunft-ausschnitt.png`) |
| gang-wiese-ego (Bewegung) | 5 cm | 14,23 | 33,0 % | 78,7 → 78,5 | gleich an Stamm, Ast, Krone; die Zahl ist der Versatz der Kamera im Nah-Gras (`gegner-gang-wiese-ausschnitt.png`) |
| gang-wiese-third (Bewegung) | 5 cm | 17,09 | 42,3 % | 82,3 → 82,5 | dito, nicht pixelweise vergleichbar |
| third-u030 (Kaskaden, tiefe Sonne) | gleich | 0,77 | 0,88 % | 74,4 → 74,4 | gleich |
| third-u050 | gleich | 1,65 | 1,48 % | 67,9 → 67,5 | gleich |
| third-u070 | gleich | 0,58 | 0,84 % | 63,9 → 63,7 | gleich |
| horizont-u075-ost (Dämmerung, Panorama) | gleich | 0,33 | 0,29 % | 95,8 → 95,6 | gleich, kein Farb-Abriss im Himmel |
| **horizont-u025 (West)** | gleich | 4,43 | **5,42 %** | 66,2 → **62,7** | andere Bäume rechts (s. Fund 1) |
| **horizont-u075 (West)** | gleich | 4,62 | **5,57 %** | 68,8 → **65,1** | andere Bäume rechts (`gegner-horizont-u075-rechts.png`) |
| dorf-u050 | gleich | 0,74 | 0,43 % | 35,3 → 35,3 | gleich |
| dorf-u097 | gleich | 0,07 | 0,00 % | 2,4 → 2,4 | beide schwarz (Luma 2,4, Abnahme ROT an beiden) — kein Urteil |
| klassen-wiese-ego (Soll-Tafel) | gleich | 1,37 | 1,02 % | 68,6 → 68,4 | Inhalt nahWiese 46,2 % an beiden, GRÜN an beiden |

`gate:pop` (lod.K2#1, Gang an der Mess-Wiese in der Sitzung): main **0,0707 %** Pop-Pixel/s (1466 px), Kopf **0,075 %** (1556 px), GPU
35,2 → 37,7 ms je Bild — beide ROT über 0,05; je EIN Lauf, die Streuung ist ungemessen, kein Fund.

## 3. Bestätigte Funde

**Fund 1 — Die Rückkehr zeigt am Kopf einen anderen Wald (Schnitt 2, N2 „die Saat geht mit ihrem Chunk“).**
- Bild: `gegner/gegner-rueckkehr-kopf-s2.png` (oben `s2/kopf/wiese-third-mittag.png` = erster Besuch, unten `s2/kopf/rueck-wiese-third.png` =
  Rückkehr nach Genesis · Dorf · West, dieselbe Kamera, derselbe Kopf 1ca0611c): rechts fehlt die hell-grüne Busch-Reihe, ein Baum steht
  anders, eine dunkle Krone kommt dazu. Eigene Bestätigung mit cab90667: `gegner/gegner-horizont-u075-rechts.png` (Folge Wiese → Genesis
  → Wiese) — am Kopf ein zusätzlicher Baum mit Stamm bei x ≈ 1670 und ein Bäumchen statt der Hecke.
- Zahl, gleiche Kamera, erster Besuch gegen Rückkehr in DERSELBEN Sitzung: **main 50564dea mad 0,17 · 0,07 % der Pixel > 24 · Luma
  83,8 → 84,0; Kopf 1ca0611c mad 1,67 · 3,09 % > 24 · Luma 83,8 → 83,0** (44-mal so viele abweichende Pixel). Erster Besuch main gegen Kopf:
  0,35 % — der Kopf weicht erst NACH dem Abräumen ab. Eigenes Paar Dämmerung West nach der Rückkehr: 5,4–5,6 % > 24, Luma −3,5 / −3,7.
- Täter-Stelle: `stamm/gelaende-fern.js:57` (`_saatGeht(drop)` beim Abräumen des Rings) → `:67` `_saatGeht` → `:92`
  `removeArchitecture(e, { still: true })` für jeden Feld-Wurf des Gebiets, dazu `voxelPopulatedChunks.delete`; der Wiederaufbau pflanzt
  nicht denselben Bestand.
- Warum ein Fehler: die Annahme des Entscheids selbst lautet „die Rückkehr zur ersten Pose zeigt dasselbe Bild ohne Loch“ und das Gesetz
  „was wiederkehrt, wächst aus dem Samen“ — die Welt als Funktion des Samens. Am Kopf ordnet sich der Wald um, wenn der Spieler geht und
  wiederkommt; der Bericht (Schnitt 2, Zeile „rueck-wiese-third … 7,36 %“) nennt die Abweichung „Laub im Wind“ — main zeigt an derselben
  Kamera nach demselben Weg 0,07 %, Wind erklärt sie nicht. Ungemessen: ob es Lage, Art oder Stufe der Pflanzung ist (die Zahl der Bäume
  bleibt 2 615 → 2 616, `heap-weg-kopf`).

**Kein Fund** an: Kanten in Bewegung (TRAA, Ankunft und Wiese, kein Geist, kein Flimmer-Unterschied im Bild), Schatten-Kante und
-Reichweite der Kaskaden 1904/1840 (Uhr 0,3 · 0,5 · 0,7 je ≤ 1,5 %), Farb-Abriss im Himmel bei Dämmerung (Ost 0,29 %; West nur der Wald
aus Fund 1), Eck-Format an Rinde, Laub, Tor, Bank (gleich in allen stehenden Paaren), Soll-Tafel an der Mess-Wiese (gleich).

## 4. Ehrlich offen

- Dunkle Innenräume und der Wurf des Punkt-Schattens (depth16): ungeschossen. Mein Nacht-Schuss am Dorf ist an beiden schwarz; der
  Glutbrunnen-Schuss traf verschiedene Brunnen (main bei 24 m vom Dorf, am Kopf nach der Rückkehr zur Wiese der nächste bei 339 m — die
  Saat des Dorfs war abgeräumt, das ist N2 wie gebaut). Gerechnet (nicht gesehen): der Bias der Würfel-Karte hält bei Kern 0,25 m und 10 m
  Reichweite ≈ 10 Stufen von depth16, bei Kern 0 (Nah 0,05 m) ≈ 1,6 Stufen — Akne-Gefahr an Quellen ohne Kern, ungeschossen.
- Glanz des Wagen-Lacks nah (Normale snorm8): ungeschossen.
- Die Paare des Zweigs vergleichen gegen main 50564dea, der über der Basis ffb005db 58 Dateien trägt (w28-stadt-grammatik, w28-auge) —
  ein main-gegen-Kopf-Unterschied ist darum nicht allein dem Zweig zuzuschreiben; Fund 1 steht deshalb auf dem Vergleich in EINER Sitzung.
- `gate:pop` je ein Lauf, Streuung ungemessen.
