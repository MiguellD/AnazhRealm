# AUGE 5 und 5b — das gesättigte Raumwinkel-Mittel (Ablesung G), gerechnet (GTX 1050, 19.11., nur gerechnet)

**Zwischenstand in drei Sätzen.** Geschnitten: Z = Raumwinkel-Mittel von min(L, S ÷ k(Z)) als Fixpunkt, einmal mit voller
Kompensation (Auge 5, Soll d85f30989) und einmal mit k = k_E·(Z ÷ Z_E)^(−m) ohne L_min (Auge 5b, Soll 4b88242c5) —
`auge5.cjs`, `auge5b.cjs`, roh daneben. Gemessen: **G fällt** — Auge 5: 12 von 13 (Herd nah); Auge 5b mit m 0,9: 11 von 14
(Herd nah, Lava, das Band von m); das Funktional selbst ist dabei gesund (Fixpunkt eindeutig, Raster-stabil ≤ 0,006 EV, monoton,
die echte Sonnenscheibe zählt nur noch −0,23 EV). Offen: kein Spike-Urteil über G aus der Rechnung; die Kette und die Ablesung F
fahren wie bestellt, das Bild urteilt über F.

## Was das Funktional kann (alle drei Zeilen halten in beiden Fassungen)

- **Fixpunkt (13):** von oben und von unten derselbe Wert in jeder Sicht (0,0000 EV); ±0,1 EV nach 1–5 Schritten von oben, 4–10 von
  unten (die Lava braucht 16–25 Schritte bis zur Ruhe, 3–10 bis ±0,1 EV) — am GPU ein Schritt je Bild.
- **Stabilität (11):** Z zwischen 960 × 540 und 1 920 × 1 080 höchstens 0,006 EV (Auge 4: 1,0 EV).
- **Monotonie (12):** 0° → 30° → 60° nie dunkler (+0,08 / +0,76 EV); der Schwenk 60° steht bei τ 0,18 s in 0,18 s auf 0,3 EV.
- **Sonne (7):** die echte Scheibe (1,6·10⁹ cd/m², roh Z 57 500) zählt mit dem Deckel 1,08e5 cd/m²: Z 5 100, Karte −0,23 EV, Luma 107.
- Der Deckel greift auf 0,06–2,3 % des Raumwinkels.

## Die Tafeln

| # | Zeile | Auge 5 (m = 1, L_min) | Auge 5b, m = 0,9 (im Band) | Auge 5b, m = 0,9415 (Anker, über dem Band) |
|---|---|---|---|---|
| 1 | Herd nah 3 m | Z 1,49 · k 0,094 · Ring k·L 0,70 · Gras 4 m Luma **18,0** → FÄLLT | Z 1,55 · k 0,041 · Ring 0,31 · Gras 4 m **3,8** → FÄLLT | k 0,058 · Gras 4 m **7,7** → FÄLLT |
| 2 | Herd fern 25 m | Z 0,017 · Gras 4 m 255/252/248 → hält | Gras 4 m 255/216/172 (Spreizung 83 Code), k_fern ÷ k_nah 55 → hält | hält |
| 3 | Gasse r1 | Mondwand Luma 77,5 · Laternen-Wand 68,6 → hält | Mondwand **17,1** · Laternen-Wand 14,2 · Paare Δ 16,9 / 14,0 → hält | 36,3 / 31,3 → hält |
| 4 | Gasse längs | 63,7 / 56,1 → hält | **12,2** / 10,2 → hält | 27,2 / 23,6 → hält |
| 5 | Lava nah 3 m | Z 346 · Decke 127,5 · Ufer 0,05 m 68,2 · Saum 36,4 → hält | Z 436 · Ufer 0,05 m **44,2** gegen 60 → FÄLLT | Ufer 0,05 m **53,8** → FÄLLT |
| 6 | Mittag, Mess-Wiese | 117,9 → hält | 117,9 → hält | hält |
| 7 | Sonne im Bild, echte Scheibe | −0,26 EV → hält | −0,23 EV → hält | hält |
| 8 | Vollmond 0,1 lx | Boden 36,5 (am L_min) → hält | Boden **16,3**, Baum ↔ Himmel 10,9 Code → hält | 36,5 (der Anker) |
| 9 | Vollmond 0,3 lx | Boden 82,1 → hält | Boden **19,3** → hält | 39,3 → hält |
| 10 | Schwenk 60° | 1,09 EV, 6,5 s bei τ 5 s → hält | 0,83 EV, 0,18 s → hält | hält |
| 11–13 | Stabilität · Monotonie · Fixpunkt | halten | halten | halten |
| 14 | das Band von m | — | m des Ankers 0,9415 > 0,9 und andere Zeilen fallen → FÄLLT | — |
| | **Urteil** | **12 von 13** | **11 von 14** | 12 von 14 (ohne Soll) |

## Der Befund

1. **Herd nah fällt unter JEDEM m von 0,2 bis 1,0** (Gras 4 m Luma 0,0 … 18,0 gegen 30; Ring k·L 0,001 … 0,70 — der Ring ist
   nie das Problem). Das Fenster der Zeile ist offen (Ring ≤ 3 erlaubt k bis 0,40; Gras 4 m ≥ 30 verlangt mehr als k 0,094), aber
   der Fixpunkt steht bei Z 1,49–1,55 cd/m² statt der erwarteten 0,9–1,0: der Deckel nimmt Flamme und Glut heraus (roh 13,6 → 1,49),
   übrig bleibt das beschienene Gras selbst (Ring 1,7–3,6 cd/m²), und das zieht den Zustand über den Lichtkreis-Rand (0,343 in 4 m).
2. **m < 1 macht jede Nacht-Zeile dunkler, nicht nur den Anker:** mit 0,9 fällt die Lava dazu (Ufer 44), die Gasse sinkt auf Luma
   17 / 12 (knapp über 8), die Vollmond-Wiese auf 16,3 — und 0,3 lx (19,3) ist von 0,1 lx (16,3) kaum noch zu unterscheiden.
   Der Anker verlangt m 0,9415; die Erwartung des Koordinators (≈ 0,94) stimmt.
3. **Z_E:** der Anker muss das eigene Funktional lesen (Raumwinkel-Mittel 4 270, nicht das Pixel-Mittel 4 350), sonst steht die
   Karte nicht auf 118.

Erwartung des Koordinators gegen die Rechnung (Auge 5): Herd nah 0,9–1,0 → **1,49** · Herd fern 0,016 → 0,017 ✓ · Lava 100–120 →
**346** · Gasse 8,29e-3 / 0,0103 → 9,65e-3 / 0,0125 · Vollmond ✓ · Mittag mit echter Scheibe wie Mess-Wiese → −0,26 EV (das ist
der Himmels-Anteil der höheren Blickrichtung, nicht die Scheibe).

## Stellwerte und Ungeprüftes

Gesetzt: m (EIN Wert; Band 0,2–0,9, Anker 0,9415). S = 3 und der Anker (Z_E, k_E) folgen aus K1 und der Eichung. „Sättigung" und
das Raumwinkel-Mittel: Quelle offen. Nicht gerechnet: die Ablesung F (Feld), der Bleich-Ast, Neumond, der Hof der Sonne.
