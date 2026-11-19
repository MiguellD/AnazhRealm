# SOLL der Rechnung „Auge 5" — geschrieben und gepusht VOR auge5.cjs (GTX 1050, 19.11.)

**Entscheid Koordinator 00:59.** „Mit Strahlern" als rohes arithmetisches Mittel FÄLLT (Herd nah: ein Feuer, das nichts beleuchtet).
EIN Kandidat, zu rechnen:

**Z = Mittel über den RAUMWINKEL der Sicht von min(L, S · Z ÷ a)** — S = 3 (die Schulter von K1 in k·L), a aus der Eichung dieses
Funktionals (Karte an der Mess-Wiese am Mittag auf k·L 0,22). Gewicht je Pixel cos³ des Winkels zur Blickachse. Keine Strahler-Maske.
Z steht auf beiden Seiten: gerechnet wird der FIXPUNKT, einmal von oben (Start: ungedeckeltes Mittel) und einmal von unten (Start:
10⁻⁹ cd/m²); laufen die zwei nicht auf denselben Wert (Abstand > 0,01 EV nach 200 Schritten), ist DAS der Befund.
L_min: der Deckel liest den Zustand max(Z, L_min), k = a ÷ max(Z, L_min), L_min 0,005 cd/m². K1, keine Kappe, kein Schleier.
Kein neuer Stellwert: S und a sind da. „Sättigung" steht als „Quelle offen" (Naka-Rushton prüft der Quellen-Leser).

**Erwartung des Koordinators (zum Widerlegen):** Herd nah Z ≈ 0,9–1,0 · Herd fern ≈ 0,016 · Lava ≈ 100–120 · Gasse und Vollmond
wie das arithmetische Mittel ohne Strahler (8,29e-3 / 0,0103 · 2,11e-3 / 6,34e-3) · Mittag mit echter Scheibe wie die Mess-Wiese.

| # | Zeile | FÄLLT, wenn |
|---|---|---|
| 1 | Herd nah 3 m | Ring-Gras 0,75–1,75 m: hellster Kanal k·L > 3 ODER Gras in 4 m < Luma 30 |
| 2 | Herd fern 25 m | Gras 4 m ohne Farbe (Kanäle < 2 Code auseinander) ODER sein Oklab-Farbton weicht > 2° vom Eingang ab ODER k_fern ÷ k_nah < 2 |
| 3 | Gasse, r1-Sicht | Mondwand < Luma 8 ODER ein Wand-Paar < 2 Code ODER Laternen-Wand / Mondwand hellster Kanal k·L > 3 |
| 4 | Gasse längs | wie 3 |
| 5 | Lava nah 3 m | Decke ↔ Ufer-Saum < 2 Code ODER Ufer 0,05 m < Luma 60 ODER ein Fleckpaar kehrt seine Ordnung um |
| 6 | Mittag, Mess-Wiese | Karte mehr als 2 Code neben 118 |
| 7 | Mittag, Sonne bei 25,6° im Bild, ECHTE Scheibe 1,6·10⁹ cd/m² | die Karte fällt um mehr als 1 EV gegen die Mess-Wiese |
| 8 | Vollmond-Wiese 0,1 lx | Boden < Luma 12 ODER Baumlinie ↔ Himmel < 2 Code |
| 9 | Vollmond-Wiese 0,3 lx | wie 8 |
| 10 | Schwenk 60° vom Feuer weg (nah) | Ziel unter L_min ODER bei τ zum Dunklen 5 s („ungeprüft") länger als 10 s bis 0,3 EV |
| 11 | STABILITÄT | Z ändert sich zwischen den Rastern 960 × 540 und 1 920 × 1 080 um mehr als 0,2 EV — in irgendeiner Sicht (Herd nah, Herd fern, Gasse ×2, Lava, Mittag, Vollmond) |
| 12 | MONOTONIE | Wegdrehen von der Quelle macht dunkler: k(30°) < k(0°) oder k(60°) < k(30°) am Herd nah (Toleranz 0,02 EV) |
| 13 | FIXPUNKT | von oben und von unten läuft Z nicht auf denselben Wert — in irgendeiner Sicht |

Die Schwellen sind gewählt (Lesbarkeit am 8-Bit-Schirm, Entscheid des Koordinators) und nie Tor einer Linse.
Zusätzlich als Zahl: je Sicht der Anteil der Fläche (Raumwinkel), der am Deckel liegt; die Schritte bis zum Fixpunkt (die Kette am GPU
macht EINEN Schritt je Bild — wie viele Bilder bis ±0,1 EV); die Zeile 7 auch beim Puffer-Wert der Scheibe; die Schwelle der
Wahrnehmung an der Gasse am Zustand.

**Urteil:** x von 13 Zeilen. Fällt eine: Blatt, kein Spike — der nächste Punkt ist dann das Feld. Tragen alle: GPU-Spike 5.
