# Bericht Baum Schnitt 4: Ein Ton der Ferne (ZWISCHENSTAND)

Stand 15.11.2026 05:12 (date). Zweig `w28-baum-schirm` d9fc75b3 (main 01a6714a eingemischt in 1019a646). Radeon 890M, jede Welt
`werkbank start --echt` in 1920 x 1080, `r._schirm()` = 1920 x 1080 vor jedem Bild, Uhr 0,5, `bild --wahl 0` (identische Kamera).

## Geschnitten

Gebaut, gemessen und auf dem Zweig zurückgenommen (1313a0cd, Revert d9fc75b3), weil der Ton-Schritt sich nicht bewegt.
- Gebaut war: `_wieseFern` trug das Glied `blende` (stamm/vegetation-wiese.js, über derselben Algebra). Der Boden-Stoff las es statt der
  Hand-Rechnung (stamm/stoff-material.js:3197–3204 auf main). `_halmFerne` hat seine Farbe mit `mix(halmSchatten, 1, blende)` multipliziert.
- Die Linse dazu war das Ton-Paar in gate:profiband `ferneWand`. main war ROT mit drei Tätern beim Namen: `_terrainGeologyAlbedo` rechnet von
  Hand, `_halmFerne` trägt keine Blende, `_wieseFern` trägt keine Blende. Der Kandidat war GRÜN. Drei Mutanten waren ROT, Selbsttest 41/41.
- npm run check, format:check, stamm:lint und gate:foundry-crossfade waren GRÜN.
- Was bleibt: das Messwerkzeug `werkbank bild --abstand` liefert jetzt `abstand.ton` (scripts/werkbank.cjs, 9ed6be05/d9170356). Es misst
  den Median der Luma je Klasse im Band 80–160 m und daraus den Ton-Schritt `nahWiese:Lf` ÷ `bodenSatz`. Die Datei steht genau auf der
  Decke von 4000 Zeilen.

## Gemessen: Ton-Schritt, Soll 0,92–1,08

P4 ist die Mess-Wiese Ego (−280,4, +1,7, −1045,6), gier 45° über die offene Wiese. Gewählt ist sie aus einem Scan über 8 Richtungen auf main.

| Fall | main | Kandidat |
|---|---|---|
| 75°, Ziel 75 m | 1,2355 | 1,2308 |
| Tele 20°, Ziel 75 m | 1,4213 | 1,4201 |
| Tele 20°, Ziel 120 m | 1,4207 | 1,4193 |

- **Spike main:** main liegt nicht im Band, die Erwartung „über 1,08“ trifft also zu. Der Scan über 8 Richtungen bei 75° streut von
  0,95 bis 1,60.
- **Kandidat:** Der Schritt bewegt sich um höchstens 0,005, die Annahme ist nicht erfüllt.
- **Der Befund aus den Zahlen:** Die Luma der Büschel im Band ändert sich um 0,3–0,5 % (Tele 140,67 → 140,56, 75° 128,11 → 127,61). Die
  Blende wirkte erst jenseits von 80 m auf den Faktor 0,85–0,4. Die Büschel-Pixel im Band 80–160 m gehören also zu Büscheln näher als
  80 m: aus 1,7 m Augenhöhe deckt ein Büschel, das bis 1,75 m hoch ist (`skalaMax` 2,5), den Grund dahinter.
- **Die Wurzel:** Es ist nicht die Blende des Büschels, sondern der Grund 80–160 m, der hinter hellen nahen Büscheln zum Bestand dunkelt.
  Im Bild ist das ein grauer Streifen vor dem Waldrand (kandidat-p4-tele120.png).
- **Boden-Anteil 40–80 / 80–200 m:** P4 75° 6,6 / 33,8 % (main = Kandidat), Tele 16,4 / 67,4 % (main = Kandidat).
- **Bildpaare:** 0,3 % der Pixel weichen ab (Summe > 6), die mittlere Luma um −0,02. Mit eigenem Blick verglichen: gleich, nirgends
  schlechter, nirgends sichtbar besser.
- **Preis:** Der Anteil `nahWieseFern` liegt bei main 1,67 ± 2,83 ms (5,6 %) und beim Kandidaten 2,04 ± 5,02 ms (5,1 %), aus `zerlegen`
  mit ABBA über 8 Durchgänge. Der Standardfehler liegt über 4 Punkten, die Zahl gilt deshalb als **UNGEMESSEN unter Last**. Eine
  Referenzfahrt gab es keine.
- **VRAM und Heap:** VRAM 123,3 → 123,1 MB, Heap 382,3 → 369,4 MB.
- **Pop:** `werkbank pop` in derselben Art Welt: main 0,0399 %, Kandidat 0,0434 %. Der Kandidat liegt damit über main. Weil der Schnitt
  zurückgenommen ist, zählt dieser Wert nicht als Annahme.

## Bilder: C:/Users/micha/AnazhRealm-profiband/artifacts/profiband/auge/w28-baum-schirm/schnitt4/

- **Paare:** main45-p4-75.png ↔ kandidat-p4-75.png, main45-p4-tele75-rot.png ↔ kandidat-p4-tele75-rot.png, main45-p4-tele120.png ↔
  kandidat-p4-tele120.png, main-wiese-ego.png ↔ kandidat-wiese-ego.png. Je Bild liegt eine .abnahme.json bei (`klasse.abstand.ton`).
- **Scan auf main:** main-scan-*.png.
- **Läufe:** main.log (Scan, zerlegen, pop), main45.log, kandidat.log, *-ton.json, *-zerlegen.json.
- **Zählen nicht:** Die Dateien `zaehlt-nicht-*` gehören zum ersten Lauf. Ohne `--wahl 0` hatte die Blick-Wahl die Kamera versetzt.
  Die Dateien `zaehlt-nicht-gier270-*` gehören nicht zu P4.

## Ehrlich offen

- Der Schnitt fällt offen und benannt unter dem Messnamen „Ton-Schritt `nahWiese:Lf` ÷ `bodenSatz` im Band 80–160 m“. Die Werkzeug-Zeile
  ist `bild --klasse '^(nahWiese([-_:].*)?|bodenSatz)$' --abstand --wahl 0`. Die Werte sind main 1,24 bei 75° und 1,42 unter Tele.
- **Die Wurzel heißt:** Der Grund dunkelt nach Metern (0,4 … 0,8 × bis) zum Bestand (× halmSchatten 0,4), während der flache Blick dort
  nur die Spitzen der nahen Büschel sieht.
- **Ein Schnitt dort braucht einen Entscheid:** Die Blende müsste dem Blickwinkel folgen, nicht dem Abstand. Leser wären der Boden-Stoff
  und der Fern-Ring (`_fernRingTeile`, gate:nah-fern). Diesen Schnitt habe ich nicht gebaut.
- Die GTX 1060 ist ungemessen. gate:nah-fern ist ungemessen, weil kein Stand mehr da ist, der den Boden ändert.

Geschnitten: nichts in main – die EINE Blende gebaut, gemessen, auf dem Zweig zurückgenommen (der Schritt bewegt sich ≤ 0,005)
Gemessen: Ton-Schritt main 1,2355 / 1,4213 / 1,4207 ↔ Kandidat 1,2308 / 1,4201 / 1,4193 (Soll 0,92–1,08)
Pflicht-OFFEN Rest: A · B · C · E · F (docs/PFLICHT-OFFEN.md)
Status: ZWISCHENSTAND
