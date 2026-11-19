# SOLL der Rechnung „Fenster" — die EXISTENZ-FRAGE (geschrieben und gepusht VOR fenster.cjs; GTX 1050, 19.11.)

**Frage (Koordinator 00:44):** Gibt es EINEN globalen Skalar je Sicht, gleich welches Mittel, der alle Fälle trägt — oder ist der
Zustand des Auges ein FELD? Keine neue Formel: die Rechnung misst nur, WO ein Zustand stehen müsste und wo die Funktionale stehen.

**Rahmen (unverändert):** Brücke x = L·k aus cd/m² · k = a ÷ max(Z, L_min), L_min 0,005 cd/m² · K1 · keine Kappe, kein Schleier.
Welt-Daten, Sichten und Flecke wie `auge3.cjs`.

## a) Das Fenster je Fall: [k_min, k_max] und als Zustand [Z_min, Z_max]

Das Fenster ist die Menge der k, bei denen das GANZE Soll des Falls hält. Gesucht auf einem Raster von 1/100 Stufe über 24 Stufen.
Z = a ÷ k mit dem a des log-Mittels (0,1399), damit die Zahlen neben Auge 3 stehen (Herd ≥ 0,349, Lava ≥ 5,57).

| Fall | untere Grenze des Zustands (Z_min: sonst zu hell) | obere Grenze des Zustands (Z_max: sonst zu dunkel) |
|---|---|---|
| Herd nah 3 m | Ring-Gras 0,75–1,75 m: hellster Kanal k·L ≤ 3 | Umfeld lesbar: Gras 14 m (Rand des Lichtkreises) Luma ≥ 8 |
| Herd fern 25 m, Zeile A „Lichtkreis unter der Schulter" | Ring-Gras: hellster Kanal k·L ≤ 3 | Gras 14 m Luma ≥ 8 |
| Herd fern 25 m, Zeile B „Lichtkreis hell, Farbton gehalten" | Ring-Gras 1,75 m trägt noch Farbe (Kanäle ≥ 2 Code auseinander, nicht 255/255/255) | Gras 14 m Luma ≥ 8 |
| Gasse (beide Sichten) | Wand unter der Laterne UND Mondwand: hellster Kanal k·L ≤ 3 | Mondwand Luma ≥ 8 UND Mondwand ↔ Schattenwand ≥ 2 Code UND Laternen-Wand ↔ Schattenwand ≥ 2 Code |
| Lava nah 3 m | Decke ↔ Ufer-Saum ≥ 2 Code | Ufer fern 15 m Luma ≥ 8 |
| Mittag, Mess-Wiese | Karte Luma ≤ 120 | Karte Luma ≥ 116 |
| Vollmond-Wiese 0,1 lx und 0,3 lx | Himmel, Wiese, Baumlinie: hellster Kanal k·L ≤ 3 | Boden Luma ≥ 12 UND Baumlinie ↔ Himmel ≥ 2 Code |

Liegt Z_max unter L_min, ist das Fenster unter dem Datum L_min LEER (der Zustand kann dort nicht stehen) — das Blatt nennt es so.
Die Wahrnehmungs-Schwelle des Zustands (Ferwerda 1996) an der Gasse wird an den Rändern des Fensters als Zahl genannt, nicht als Grenze.

## b) Vier Funktionale derselben Sicht, je ohne und mit Strahlern (acht Werte je Sicht)

log-Mittel · arithmetisches Mittel · p90 · Maximum der Leuchtdichte Y über das Raster 960 × 540 der Sicht; „ohne Strahler" lässt die
Pixel mit Strahler-Bit aus, „mit" nimmt sie hinein. **Jedes Funktional F trägt sein EIGENES a_F aus derselben Eichung** (Karte an der
Mess-Wiese am Mittag auf k·L 0,22: a_F = 0,22 · F(Mittag) ÷ L_Karte) — sonst wäre der Vergleich ein Trick der Normierung. Sein
k_F = a_F ÷ max(F, L_min) liegt im Fenster eines Falls oder nicht. EINE Tafel: Funktional × Fall → k_F, „im Fenster" / „zu hell um … EV" /
„zu dunkel um … EV". Dazu je Funktional der Faktor k_fern ÷ k_nah am Herd (Soll ≥ 2).

## c) Das Urteil — vor der Rechnung festgelegt

- **Ein globaler Skalar EXISTIERT** (unter diesen vier Funktionalen), wenn EIN Funktional in ALLEN Fenstern liegt (Herd fern: je Zeile A und B getrennt genannt).
- **Kein globaler Skalar existiert — gleich welches Mittel —**, wenn EIN Fall ein LEERES Fenster hat (k_min > k_max): dann ist der
  Zustand ein FELD (Anpassung je Ort der Netzhaut).
- **Dazwischen** (alle Fenster offen, aber keines der vier Funktionale trifft alle): das Blatt nennt den Schnitt der Fenster über die
  Fälle NICHT als Zahl eines Zustands (das wäre das vierte Modell), sondern nur, zwischen welchen Funktionalen jedes Fenster liegt.

Die Schwellen (k·L 3, Luma 8/12, 2 Code, 116–120) sind **gewählt** wie in SOLL-AUGE3 und nie Tor einer Linse. Empfindlichkeit: jedes
Fenster wird zusätzlich mit k·L ≤ 2 / ≤ 4 und Luma 6 / 12 genannt — kippt „leer ↔ offen" an der Wahl der Schwelle, steht das im Urteil.

Kein Bau, keine GPU.
