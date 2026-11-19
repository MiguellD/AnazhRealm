# Spike 6 — Vor-Belichtung, EIN Maßstab im Puffer (GTX 1050, 19.11., `w28-licht-spike`, Soll f49bba453 + Nachtrag 1f23da38b)

**Zwischenstand in drei Sätzen.** Geschnitten (nur im Spike-Zweig, kein Bau am Spiel): die Vor-Belichtung an EINER Stelle — der
`output`-Eintrag des MRT des Szenen-Passes schreibt jeden Stoff × k_vor, der Ausgabe-Knoten multipliziert mit k ÷ k_vor; dazu die
Nacht-Quellen des Ort-Paars im EINEN Maßstab 16 090 (Mond, Himmel der Nacht, Ambient, Hemisphäre, Sternen-Leuchten, Sterne, der
Knoten der Kamera) und drei Rückleser ÷ k_vor. Gemessen: der Mittag bleibt bildgleich (Boden 113,4 → 113,1), die Mond-Wiese trägt
ohne Vor-Belichtung **2–3 Puffer-Werte je Kanal** (nur 0, 1, 2) und mit ihr **132 / 153**, bei 0,1 lx steigt der Boden von Luma 2
(schwarz, Abnahme ROT) auf 25, Preis −0,014 ms (4 Boote, selbes Boot AN ↔ AUS). Offen: der k-Sprung fällt (die Bild-Geschichte rechnet nicht um),
die Mess-Kette fällt (Halb-Float läuft unter), und jede Leuchtfläche ohne physikalischen Wert sprengt die Nacht — das Herd-Bild ist
KEIN Bild.

## Was gebaut wurde (Stellen der Vor-Belichtung: 1 Schreiber + 1 Ausgabe + bisher 5 Leser)

| Stelle | Datei | was |
|---|---|---|
| DER Schreiber | `stamm/bild-kosten.js`, MRT `output` des Szenen-Passes | `output.rgb × k_vor`, gedeckelt bei 32 768 (das Format endet bei 65 024) — jeder Stoff, Himmel, Luft, Leuchtfläche geht hier durch |
| die Ausgabe | `_augeKette().faktor` | `toneMappingExposure ÷ k_vor` |
| k_vor | `_dayNightApplyBelichtung` | k_vor = das k DIESES Bilds (es steht vor dem Zeichnen fest), k aus dem Gesetz von main (`_belichtungAusLicht`) |
| Leser ÷ k_vor | Mess-Kette (Stufe 0) · `_nachtAuge` (zweimal; liest jetzt 16 090 cd/m² je Einheit statt `luxJeEinheit`) · Spiegel-Pass · Rückstrahl | je eine Zeile |
| Nacht-Quellen × Faktor | Mond-Richtlicht, Mond im Himmel, Knoten `nachtKnotenE`, Ambient, Hemisphäre, Sternen-Leuchten, Stern-Sprites | Mond 3,67·10⁻⁵ (0,26 lx) bzw. 1,41·10⁻⁵ (0,1 lx), Sterne 5,33·10⁻⁵ (0,0005 lx) |

Die Vor-Belichtung selbst hat EINEN Chokepoint. Was sich vervielfacht, sind die LESER des Puffers (jeder teilt selbst) und die
QUELLEN (jede trägt ihren eigenen Faktor in den EINEN Maßstab: sieben Stellen allein für die Mond-Nacht ohne Feuer).

## Die Soll-Tafel

| # | Zeile | gemessen | Urteil |
|---|---|---|---|
| 1 | Mittag bildgleich (Mess-Wiese) | Boden main 113,4 · Spike ohne 113,3 · mit 113,1 (Δ 0,3) · ganzes Bild 77,7 = 77,7 · k 0,5272 in beiden Lagen; Zeilen-Mittel 33 ↔ 33 Werte, Sprung 1,23 ↔ 1,25 | **hält** |
| 1b | Mittag, Himmel im Blick (50° hoch) | oberes Bild-Drittel main 142,0 → 138,7 (Δ 3,3), Boden 46,1 → 46,2 | fällt an L7/L8: die Schwellen von Streulicht und Godrays lesen jetzt belichtete Werte (0,86 statt 0,44 belichtet) — der Schein um die Sonne wird schwächer; das Bild ist heil (selbst gesehen) |
| 2 | Nacht darstellbar, 0,26 lx | Puffer-Werte am Boden R 132 · G 153 · Boden Luma 28,9 · Zeilen-Werte 16 · Sprung 0,48 | Puffer **hält** (≥ 16); die Zeile „≥ 20 Zeilen-Werte" FÄLLT formal — mein Maß war falsch gewählt: der Boden der Wiese hat keinen Verlauf (auch main: 7 Werte, der Mittag 33) |
| 2 | Nacht darstellbar, 0,1 lx | R 132 · G 152 · Boden Luma 25,0 · Zeilen-Werte 16 · Sprung 0,47 | wie oben |
| 2v | VORHER, 0,26 lx | R **2** · G **3** verschiedene Werte (0, 1, 2 — die Ditherung des Ziels trägt das Mittel); Boden Luma 18,6 (statt 28,9), der Himmel in Konturen gestuft (selbst gesehen) | Erwartung „0 Stufen" bestätigt: 1–2 Stufen |
| 2v | VORHER, 0,1 lx | R 2 · G 2 (0 und 1; 80 % bzw. 65 % der Pixel stehen auf 0); Boden Luma **2,0**, die Abnahme schreibt das Bild ROT | bestätigt |
| 3 | Preis | Boot 1: ohne 4,808 / 4,801 / 4,817 / 4,839 · mit 4,721 / 4,796 / 4,812 / 4,874 ms → **−0,015 ms**; Boote 2–4: Boot 2 +0,038 · Boot 3 −0,052 · Boot 4 −0,025 (je 4 Runden × 8 s, Median der GPU-Zeit des Bilds) | **hält**: Mittel über 4 Boote **−0,014 ms** (Streuung ±0,04), Soll ≤ 0,05 |

## Die Falsifikation

| # | Kandidat | gemessen | Urteil |
|---|---|---|---|
| F1 / L10 | k-Sprung zwischen zwei Bildern | k × 2 bei stehender Kamera: die Mess-Kette liest im ersten Bild 0,162 statt 0,209 (−22 %, −0,37 EV), nach 14 Bildern noch −12 %; zurück +21 % | **FÄLLT** ohne Umrechnung — die Geschichte der Zeit-Auflösung trägt Werte im alten k; sie braucht k_jetzt ÷ k_davor (eine Stelle mehr) |
| F2 / L1 | Rücklese der Mess-Kette | Mittag: Z 0,2458 = 0,2458 (identisch); Nacht: Z = **0** — der Wert ÷ k_vor (≈ 10⁻⁷) läuft im Halb-Float der Kette unter | Mittag hält, Nacht **FÄLLT**: die Kette muss belichtete Werte tragen und erst am Prozessor teilen |
| F3 | Schatten-Karte | nicht einzeln gemessen; Zeile 1 (Boden mit Schatten der Halme, σ 25,7 ↔ 25,9) trägt sie mit | offen als eigene Zahl |
| F4 | Luft / Nebel | geht durch den EINEN Schreiber (im Stoff gemischt); Mittag ganzes Bild Δ 0,0 | hält am Mittag |
| F5 / L7 / L8 | Schwellen der Post-Kette | Mittag Zeile 1b: Δ 3,3 Code; Nacht: jede Quelle am Format-Deckel streut das Abtast-Muster des Streulichts als weiße Punkt-Blöcke ins Bild (Mond-Wiese: fünf Blöcke am Horizont) | **FÄLLT**: die Schwellen müssen als Zahl im belichteten Raum neu gesetzt werden; das Streulicht trägt keine Quelle bei 32 768 |
| F6 / L5 / L6 | `_nachtAuge` | liest jetzt physikalische cd/m²: bei 0,1 lx steht der Boden grau (R 25 · G 25 · B 23, Stäbchen), bei 0,26 lx noch farbig (27 · 30 · 20) | hält als Mechanik; das Band 0,005–5 cd/m² wirkt jetzt, wie es benannt ist |
| F7 / S | oberes Ende des Formats | Deckel 32 768 an der EINEN Stelle; Mittag unverändert. Die Sonnenscheibe stand im Spike auf ihrem heutigen Wert (3,58), die physikalische (≈ 50 800 belichtet) ist nicht gefahren | Deckel an EINER Stelle: hält; mit der echten Scheibe offen |
| F8 | gebackenes Licht | nicht gefahren | offen |
| F9 / R | zweite Lichtwege, Rückleser | ohne ÷ k_vor an Spiegel-Pass und Rückstrahl lief die Mond-Wiese ins Weiß (Boden Luma 254, 82 % weiße Pixel): der Rückstrahl las den belichteten Puffer als Licht und speiste ihn wieder ein. Mit ÷ k_vor: 28,9 | **FÄLLT ohne, hält mit** — zwei Stellen |

## Der Befund über die Quellen (Herd nah, physikalisch: Mond 0,26 lx, Herd 3,5 lx in 2 m, Flamme auf heutigem Wert = 13 800 cd/m²)

Das Bild `herd-nah-026-v2` ist kein Bild: Wald und Halme leuchten gelb-weiß, Blüten und Steine glimmen als Blöcke. Ursache am
Bild gelesen, nicht einzeln gemessen: (1) der Rückstrahl mittelt die Flammen-Pixel (0,86 Einheiten) als „Boden" neben einem
Mond-Boden von 10⁻⁶ Einheiten und leuchtet damit jede Fläche, die nicht nach oben zeigt; (2) jedes Glimmen nach Stoff-Tag
(Holz, Laub ≈ 0,008 Einheiten = 130 cd/m² im EINEN Maßstab) steht 10⁴-fach über dem Mond-Boden. Unter main verdeckt der
Nacht-Maßstab beides. Das ist der Klassen-Befund des Zensus am Bild: **die 15 Leuchtflächen ohne Quelle brauchen ihren
physikalischen Wert, bevor eine Nacht mit Feuer im EINEN Maßstab ein Bild ist** — und der Rückstrahl darf Selbstleuchter nicht als
Boden lesen. Ob der physikalische Herd (3,5 lx) nachts sichtbar bleibt, ist an diesem Bild nicht zu lesen.

## Bilder (JPEG, Zahlen an den PNG gemessen)

`wiese-mittag-v1/v2` · `sonne-mittag-v1/v2` (Mittag mit Himmel) · `mond-frei-026-v1/v2` · `mond-frei-010-v1-rot/v2` ·
`herd-nah-026-v1/v2` (v1 = ohne, v2 = mit Vor-Belichtung; main daneben: `vision/licht/spike5/`).

## Offen (mit Grund)

- Bilder Innenraum und unter dem Kronendach: nicht gefahren — keine vermessene Pose im Werkzeug, die Zeit ging in die Rückleser.
- Zeile L11 (Albedo-Eichung, post-kette DUNKEL_NACHT_LICHT), F3 als eigene Zahl, F8, die echte Sonnenscheibe, die Mondscheibe
  2 500 cd/m²: nicht gefahren.
- Die Umrechnung der Geschichte (F1) und die Kette in belichteten Werten (F2) sind benannt, nicht gebaut.
- Ein Leser-Zensus am BILD (jede Quelle am Deckel) fehlt: die fünf Blöcke am Horizont der Mond-Wiese sind nicht beim Namen genannt.
