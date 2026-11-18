# AUGE 4 — arithmetisches Mittel MIT Strahlern, gerechnet gegen SOLL-AUGE4 (GTX 1050, 19.11., nur gerechnet)

**Zwischenstand in drei Sätzen.** Geschnitten: Z = arithmetisches Mittel der Leuchtdichte der Sicht mit Strahlern, a 0,1426 aus der
Eichung, K1, keine Kappe — `auge4.cjs`, roh `auge4.roh.out.txt`, Soll davor 3f7546520. Gemessen: **10 von 10 Zeilen halten** nach
dem Buchstaben des berichtigten Solls. Offen: vier Zahlen, die das Soll nicht urteilt und die der GPU-Spike am Bild zeigen muss
(unten „Was das Soll nicht sieht") — der Spike fährt.

| # | Zeile | Z (cd/m²) | k | Zahl | Urteil |
|---|---|---|---|---|---|
| 1 | Herd nah 3 m | 7,03 | 0,0203 | Ring hellster Kanal k·L 0,152 / 0,139 / 0,073 (Grenze 3); Gras 0,75 m sRGB 74/44/1; Glutbett 255/197/173 | HÄLT |
| 2 | Herd fern 25 m (Zeile B) | 0,0844 | 1,69 | Ring 1,75 m 255/252/248 (Spreizung 7 Code), 0,75 m 255/254/252; Gras 4 m Luma 188, 14 m 39; k_fern ÷ k_nah 83,3 | HÄLT |
| 3 | Gasse, r1-Sicht | 0,0176 | 8,11 | Mondwand 81/39/20 Luma 46,6 · Laternen-Wand 90/29/2 Luma 40,0 (k·L 0,235) · Schatten 1,6 · Paare Δ 45,0 / 38,5 Code | HÄLT |
| 4 | Gasse längs | 0,0221 | 6,46 | Mondwand Luma 36,1 · Laternen-Wand 31,1 · Schatten 0,4 · Paare Δ 35,6 / 30,7 Code | HÄLT |
| 5 | Lava nah 3 m | 425 | 3,36e-4 | Riss 255/254/254 · Decke 234/90/0 (Luma 114) · Ufer 0,05 m 103/51/0 (58) · Saum 0,25 m 55/25/0 (30) · Decke ↔ Saum Δ 84,5 Code · 0 Umkehrungen in 15 Paaren | HÄLT |
| 6 | Mittag, Mess-Wiese | 4 350 | 3,28e-5 | Karte 121/117/118, Luma 117,9 | HÄLT |
| 7 | Mittag, Sonne bei 25,6° im Bild | 5 030 | 2,84e-5 | Scheibe 21,9 ppm des Bilds (45 Pixel bei 1 080 Zeilen) beim Puffer-Wert (Y 3,68 Einheiten ≙ 5,92e4 cd/m²): Karte −0,21 EV, Luma 108,1 — der ganze Fall kommt aus dem Himmels-Anteil, die Scheibe trägt 1,3 cd/m² | HÄLT |
| 8 | Vollmond-Wiese 0,1 lx | 2,11e-3 (am L_min) | 28,5 | Boden 41/39/13 Luma 37,5 · Baumlinie ↔ Himmel 18,0 Code | HÄLT |
| 9 | Vollmond-Wiese 0,3 lx | 6,34e-3 | 22,5 | Boden Luma 84,0 · Baumlinie ↔ Himmel 23,7 Code | HÄLT |
| 10 | Schwenk 60° vom Feuer weg | 2,01 (über L_min) | 0,0709 | Sprung 1,81 EV → bei τ 5 s 9,0 s bis 0,3 EV; kippt ab τ 5,6 s | HÄLT (knapp) |

## Was das Soll nicht sieht — vier Zahlen für das Bild

1. **Der Zustand hängt an sehr wenigen Pixeln.** Herd nah: die Strahler füllen 0,52 % des Bilds und tragen 87,5 % des Mittels;
   Lava 95,2 %; Gasse 55 %. Herd fern: die Flamme ist 0,0007 % des Bilds (≈ 14 Pixel bei 1 080 Zeilen) und trägt 80 % —
   **zwischen den Rastern 960 × 540 und 1 920 × 1 080 springt Z von 0,171 auf 0,0844 (1,0 EV)**. Am GPU heißt das: die Belichtung
   der fernen Sicht hängt an der Pixel-Deckung der Flamme und kann mit der Kamera-Bewegung pumpen. Am Bild zu prüfen.
2. **Herd nah ist außer dem Feuer dunkel:** k 0,0203 — Gras 0,75 m Luma ≈ 47 (74/44/1), 1,75 m k·L 0,073, Gras 4 m Luma 1,1,
   14 m 0,0. Das Soll „Ring ≤ Schulter" hält mit Faktor 20 Abstand; ob der Boden, auf dem der Spieler am Feuer steht, lesbar genug
   ist, urteilt das Bild (das Schwarz HINTER dem Feuer ist Entscheid — das Dunkel VOR dem Feuer ist es nicht).
3. **Wegdrehen macht zuerst dunkler:** 10° −0,04 EV, **30° −0,48 EV** (Z 7,03 → 9,8), erst 60° +1,81 EV. Grund: das Mittel über
   PIXEL einer geradlinigen Projektion wiegt eine Quelle am Bildrand schwerer (ihr Pixel-Anteil wächst mit 1/cos³: 0,52 % → 0,76 %
   → 1,11 %), obwohl ihr Raumwinkel gleich bleibt. Ein Mittel über den Raumwinkel hätte das nicht; die unterste Stufe der
   Verkleinerungs-Kette ist ein Pixel-Mittel.
4. **Die echte Sonnenscheibe reißt Zeile 7:** mit 1,6·10⁹ cd/m² statt des Puffer-Werts Z 4,01e4, Karte **−3,20 EV** (Luma 11,3)
   gegen das Soll −1. Heute trägt die Scheibe nur das 8,8-Fache der Karte (`HIMMEL.sonneLeucht` 4, `stamm/bild-himmel.js:3479`,
   ein Stellwert der Tafel) — der Befund gilt in dem Moment, in dem das Gesetz „EIN Maß cd/m²" die Scheibe erreicht. Der Hof um die
   Sonne ist nicht gerechnet (das Modell trägt einen gleichmäßigen Himmel).

Dazu: an der Gasse liegt der Unterschied Mondwand ↔ Schatten am Zustand 0,0176 bei ×0,92 der Stäbchen-Schwelle (Ferwerda 1996),
Laternen-Wand ↔ Schatten bei ×0,47 — die Code-Werte trennen (Δ 45 / 38), die modellierte Wahrnehmung knapp nicht.

## Stellwerte und Ungeprüftes

Gesetzt: L_min 0,005 cd/m² · τ Stäbchen 120 s · τ Zapfen zum Dunklen 5 s („ungeprüft", für den Spike gesetzt; Zeile 10 kippt ab
5,6 s) · τ Zapfen zum Hellen 0,1 s (Krawczyk 2007 Gl. 4.6, Sekundär-Quelle). Von der Tafel gewählt, Quelle offen: das arithmetische
Mittel mit Strahlern. Nicht gerechnet: Neumond, Stäbchen-Schritt, der Hof der Sonne, ein Feld.
