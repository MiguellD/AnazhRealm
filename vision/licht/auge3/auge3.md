# AUGE 3 — L_a allein, gerechnet gegen SOLL-AUGE3 (GTX 1050, 19.11., nur gerechnet)

**Zwischenstand in drei Sätzen.** Geschnitten: der Schleier ist aus dem Auge (`SH = 0`, Zustand = L_a, das log-Mittel der
Nicht-Strahler der Sicht), Kurve K1, keine Kappe — `auge3.cjs`, Lauf `lauf.txt`, Soll `SOLL-AUGE3.md` (f873e6c29, vor der Rechnung).
Gemessen: ZWEI von sechs Fällen fallen an derselben Wurzel — Herd nah: Ring-Gras hellster Kanal k·L 7,73 gegen 3 (es fehlen 1,37 EV),
Lava: Decke ↔ Saum 0,0 Code gegen 2 (beide 255, es fehlen 3,12 EV); Gasse, Mittag an der Eich-Sicht, Vollmond-Wiese und der Schwenk halten.
Offen: KEIN GPU-Spike, kein Bau, kein viertes Modell — der Entscheid liegt beim Koordinator (unten „Die Lücke").

## Die sechs Fälle

| # | Fall | Zahl | Urteil |
|---|---|---|---|
| 1 | Herd nah 3 m ↔ fern 25 m | L_a 0,135 ↔ 0,0121 cd/m² → k 1,03 ↔ 11,5: k_fern ÷ k_nah = **11,15** (3,48 EV, trennt). ABER Ring-Gras nah (0,75–1,75 m): hellster Kanal k·L **7,73 / 7,09 / 3,74** → sRGB 255/253/250 … 255/249/242 (Luma 250–253); fern steht der ganze Lichtkreis über 3 (0,75 m 86,2 · 1,75 m 41,7 · 4 m 8,21 · erst 14 m 0,76) | **FÄLLT** (Ring 7,73 > 3) |
| 2 | Gasse Nacht | L_a 3,44e-3 (r1-Sicht) → am Boden L_min 0,005, k 28; Mondwand Luma 117,3, Wand unter der Laterne 104,6, Schattenwand 13,0 (Δ 104 / 92 Code; Stäbchen-Schwelle ×2,68 / ×1,35). Zug des beleuchteten Umfelds: der Zustand steht mit Laternen bei 5,00e-3 (r1) / 5,23e-3 (längs), ohne sie nie unter L_min 0,005 → höchstens 0,07 EV | HÄLT |
| 3 | Lava nah 3 m, Spiel-Daten | L_a 0,641 → k 0,218. Ufer-Saum (145 cd/m²) k·L 31,8 → 255/255/255; Decke 255; Decke ↔ Saum **Δ 0,0 Code**. Ordnung der Welt im Bild: 0 Umkehrungen in 15 Paaren (K1 hält die Ordnung), aber 6 Paare unter 2 Code (alles über dem Saum ist Weiß). Ufer fern 63,5, Baumlinie 248,0 | **FÄLLT** (Decke ↔ Saum < 2 Code) |
| 4 | Mittag, Mess-Wiese | Karte k·L 0,2200 → 121/117/118, Luma 117,9 (durch Konstruktion: a = 0,1399 aus dieser Sicht). Ohne Soll, als Zahl: Sonne bei 25,6° im Bild → Karte 107,9 (−10,1 Code; bei 5,6° −16,0); sonnige Wand auf 30 % des Bilds → 87,0 (−31,0 Code) | HÄLT (nur Eich-Sicht) |
| 5 | Vollmond-Wiese ohne Feuer | 0,1 lx: Boden Luma 36,5, Baumlinie ↔ Himmel 18,0 Code · 0,3 lx: 84,0 / 23,7. Ränder: Laub senkrecht 7,7 Code; Baumlinie = Himmel bei Himmel ×1,52 (im Fehler des Himmels ×2,5) | HÄLT |
| 6 | Schwenk 10° / 30° / 60° vom Feuer weg | Ziel-L_a 0,135 / 0,127 / 0,0968 cd/m² — alle über L_min (Zapfen-Ast). Sprung 0,01 / 0,09 / 0,48 EV: 10° und 30° liegen schon innerhalb 0,3 EV; 60° kippt erst ab τ Zapfen **21,0 s** (t = τ·ln(J/0,3)). Zum Vergleich Lava: 30° 0,69 EV → kippt ab 12,0 s · 60° 1,13 EV → 7,5 s · 90° 1,20 EV → 7,2 s | HÄLT über das ganze ungeprüfte Band 0,2–5 s (bedingt: τ Zapfen ist nicht am Text gelesen) |

## Die Lücke (eine Wurzel, zwei Fälle)

Das log-Mittel einer Nacht-Sicht steht beim DUNKLEN Feld, nicht beim beschienenen Fleck. Der Lichtkreis einer Quelle ist klein im Bild
und hell gegen das Feld; mit voller Kompensation (k = a ÷ L_a) und ohne Schleier, ohne Kappe begrenzt ihn nichts:

- **Herd nah:** der Ring trägt erst bei k ≤ 0,401 (gerechnet 1,03). Der Zustand müsste ≥ 0,349 cd/m² stehen — das ist die Leuchtdichte
  des beschienenen Grases in 4 m (0,343), nicht das Mittel der Sicht (0,135). Gras nah in cd/m²: 0,75 m 3,57 · 1,25 m 3,27 ·
  1,75 m 1,73 · 2,5 m 0,863 · 4 m 0,343 · 14 m 0,0351.
- **Lava:** Decke ↔ Saum ≥ 2 Code erst bei k ≤ 0,0251 (gerechnet 0,218); der Zustand müsste ≥ 5,57 cd/m² stehen (L_a 0,641). Und
  selbst dort ist der Saum Luma 252,6 gegen die Decke 254,9 — technisch getrennt, im Bild beide Weiß.
- **Empfindlichkeit:** kein Rand der Welt-Daten rettet Fall 1 (Glutbett 900–1 300 K, Gras-Albedo, Halm-Faktor, Mond 0,1–0,3 lx:
  Ring 7,3–12,3) oder Fall 3 (t0 1 470 K, Albedo, Mond: Saum immer 255).

Drei Sätze der Aufträge schließen sich hier gegenseitig aus: **(i)** EIN Skalar aus dem log-Mittel der Sicht mit voller Kompensation,
**(ii)** keine Kappe und kein Schleier, **(iii)** der Lichtkreis einer Quelle bleibt unter der Schulter (Ring ≤ 3, Saum ≠ Decke).
Auge 2 hielt (iii) über den Schleier — und fiel an dessen sieben Stellwerten; die Kappe hielt (iii) — und fiel an Glanz-Pixeln.
Welcher der drei Sätze fällt, ist Entscheid, nicht Rechnung: fällt (iii), dann ist „der Ring am Feuer ist hell-weißlich, die Lava-Uferkante
Weiß" das Bild der Nacht-Sicht (K1 hält dabei Farbton und Ordnung, kein Rosa) und der Spike kann fahren; hält (iii), braucht der Zustand
ein Gewicht zum Hellen hin, und das ist ein viertes Modell, das dieser Auftrag ausschließt.

## Stellwerte und Ungeprüftes

- **Gesetzt (bleiben):** L_min 0,005 cd/m² · τ Stäbchen-Ast 120 s. Für Wiese ≥ Luma 12 bei 0,1 lx genügt L_min ≤ 0,0113.
- **Ungeprüft beim Namen:** τ Zapfen-Ast (kein Text einer Quelle gelesen; Band 0,2–5 s; nichts baut darauf — Fall 6 hält bis 7,2 s
  an der Lava, 21,0 s am Herd). „k ∝ 1/Zustand" (volle Kompensation) ohne Quelle; ein Gesetz der unvollständigen Anpassung habe ich
  nicht am Text gefunden, also keine Zahl gesetzt.
- **Nicht gerechnet:** Neumond (kein Griff in der Welt: `moonDir = sunDir.negate()`), Stäbchen-Schritt (entsättigt/kühl), der Schwenk
  unter L_min, die Kosten am GPU (kein Spike).
- **Zum Skript:** die Zeilen „URTEIL Fall 3: FÄLLT" und die Tafel am Ende von `lauf.txt` tragen noch das Soll von Auge 2 (Ordnung
  „Ufer fern > Baumlinie"); gültig ist der Abschnitt „Nachtrag AUGE 3" und dieses Blatt. Die Spalten L_v / E_Blend / 2. und 3. Weg in
  `lauf.txt` sind Reste des Schleiers (L_v = 0) und urteilen nichts.
