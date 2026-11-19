# SPIKE 5 — die Mess-Kette des Auges im echten Fenster, Ablesung G und F (GTX 1050, 19.11.)

Zweig `w28-licht-spike` 659540f69 (Kette 4ecff6abc + Rand-Gewicht und Anker 659540f69), kein Stempel. Bilder 1 920 × 1 080 aus dem
Ausgabe-Pfad der Werkbank (`start --fenster 1920x1080`), je Ort `<ort>-main.jpg` · `<ort>-G.jpg` · `<ort>-F.jpg` an derselben Kamera
(JPEG Güte 0,9; die verlustfreien PNG liegen auf der GTX unter `.git/gtx1050-werkzeug/gc/strahler/spike5/`, alle Zahlen sind an ihnen
gemessen). m = 0,9415 (aus dem Anker, 0,04 über dem sekundär belegten Band).

**Zwischenstand in drei Sätzen.** Geschnitten: die Kasten-Kette 1 920 → 480 → 120 → 30 → 8 → 2 → 1 (Raumwinkel-Gewicht, Deckel an
der Schulter, Rücklese asynchron, EIN Schreiber `_dayNightApplyBelichtung`), die Kappe aus Spike 1 gefallen, zwei Ablesungen G
(1 × 1) und F (120 × 68 roh je Pixel). Gemessen: G trägt an sechs von sieben Orten ein Bild, das als Bild steht, und fällt am Mittag
mit Blick in den Himmel (−1,06 EV); F roh zeigt an jedem Ort Höfe und Kästen; der Preis im selben Boot ist +0,21 ms (G) und +0,25 ms
(F) gegen Soll ≤ 0,2. Offen: der Nacht-Maßstab des Puffers (unten 1), die nicht stellbaren Quellen (unten 2), der Himmel-Blick unter G.

## 1. Was vor dem ersten Bild zu klären war

1. **Der Rand der Kette.** Wo eine Stufe nicht durch 4 teilt, zählte ClampToEdge den Rand mehrfach: bei 1 920 × 1 080 trug die
   untere Bildhälfte 86,8 % des 1 × 1 (nachgerechnet vom Arbeiter). Geschnitten in 659540f69: jeder Tap trägt nur seine gültigen
   Pixel, ihr Anteil als Gewicht in R und G.
2. **Z_E im Spiel gemessen: 3 292 cd/m²** (0,2046 Einheiten an der Mess-Wiese am Mittag bei k 0,527), nicht 4 270 — die 4 270 waren
   der Wert meines Modells, nicht der Welt. Steht so in `AnazhRealm.AUGE`.
3. **Das Auge wird im Schuss gehalten.** Die Aufnahme beginnt ihre Geschichte neu; ohne Halten wanderte der Zustand im Schuss
   (0,204 → 0,316). Jedes Bild: 20 Bilder Einschwingen an der Pose (Zustand = Z je Rücklese), dann `_augeAus`, dann der Schuss.
4. **Der Maßstab der Nacht (Befund, trifft den Spieler).** Main zeichnet die Nacht nicht im Mittag-Maßstab: der Mond steht im
   Richtlicht 0,644 gegen die Sonne 6,92 (Faktor 10,8 statt rund 10⁶), und das Nacht-Auge nennt seinen eigenen Maßstab
   `NACHT_AUGE.luxJeEinheit` = 1,1607 cd/m² je Einheit (`stamm/bild-kosten.js`, auf main :2982) gegen 16 090 am Mittag — Faktor
   13 862. Physikalisches Mondlicht im Mittag-Maßstab ist nicht darstellbar: eine Karte unter 0,1 lx läge bei 3,6·10⁻⁷ Einheiten,
   der Szenen-Puffer (rg11b10, `stamm/bild-kosten.js:2018`) löst 9,5·10⁻⁷ auf. **Der Spike fährt die Nacht deshalb im
   Nacht-Maßstab**, zur Laufzeit gestellt (kE ÷ 13 862, zE × 13 862, `einheitCdM2` 1,1607 — dasselbe Gesetz k(Z), nur die Einheit
   des Puffers benannt). Wo der Maßstab zwischen Tag und Nacht wechselt (Dämmerung), ist nicht gefahren.

## 2. Die Spike-Daten der Nacht-Quellen (bestehende Setzer) und was nicht stellbar ist

| Quelle | gestellt über | Wert |
|---|---|---|
| Mond 0,1 lx waagrecht (direkt) | `AnazhRealm.MOONLIGHT` ersetzt (je Bild gelesen) | intensity 0,65 × 0,1 ÷ 0,511 = 0,1272 |
| Herdfeuer (Pool-Licht) | unverändert — im Nacht-Maßstab steht die Karte in 2 m bei 3,2 cd/m² (meine Rechnung: Ring 1,7–3,6) | `PRESETS.feuerstelle.fx.licht` |
| Laterne (Pool-Licht) | unverändert — Boden darunter 0,31 cd/m² | `PRESETS.laterne.fx.licht` |
| Lava, Licht aufs Ufer | unverändert | `AnazhRealm.BRAND.schein` |

**Nicht stellbar (gemeldet, nicht umgebaut):** das Leuchten von Flamme und Glutbett (`fachwerk-core.js:2099`/`:2105`
`LEUCHT_FEUER` 2,5 × Vertexfarbe, in der Welt beim Bau fest: `studio-stoff.js:395`) — die Flamme steht bei ≈ 1 cd/m² statt einiger
Tausend; das Leuchten der Lava-Decke (`siedlung-wege.js:552–566`, Shader-Konstanten) — ≈ 1 cd/m²; die Faktoren von Ambient 0,04
(`bild-himmel.js:2229`) und Hemisphäre 0,1 (`:2446`) — zusammen ≈ 0,06 lx neben dem Mond; das Sternenlicht (Closure in
`welt-licht.js:123`); die echte Sonnenscheibe (main 3,5 Einheiten, die echte läge über dem Format). Folge: die Strahler im Bild sind
dunkler als physikalisch, der Deckel greift an Flamme und Lava kaum — die Orte Herd nah und Lava prüfen G milder als meine Rechnung.

## 3. Die Tafel (Luma 0–255 am Bild; Z und k aus `_augeStand()` am Fixpunkt)

| Ort | Z (cd/m²) | k G | main | G | F roh |
|---|---|---|---|---|---|
| Mess-Wiese Mittag | 3 284 | 0,528 | Boden wie G (k 0,527) | Boden 113 | Boden 94, Schatten gehoben, Himmel stumpf |
| Mittag, Sonne im Bild (Blick 50° hoch) | 7 173 | 0,253 | k 0,510 | Kronen 31, Himmel 81 — **wirkt wie Dämmerung** | Kronen 70, heller Saum an jeder Krone |
| Herd nah 5 m | 0,070 | 0,95 | Gras 4 m 43 / 28, Ring 171 | **Gras 4 m 27 / 17** (rechts / links), Ring 146, Wald 14 | **Gras 4 m 33 / 30**, Ring 55, Himmel 40 |
| Herd fern 19 m | 0,0099 | 6,0 | fast schwarz (Bild-Mittel 5) | Boden 22, Feuerfleck klippt | Boden 29, Himmel 43 |
| Vollmond-Wiese frei, 0,1 lx | 0,0063 | 9,26 | Boden 8 | **Boden 50** (Anker-Soll 36,5) | Boden 44, Himmel 45 |
| dieselbe, m 0,9 | 0,0076 | 4,52 | — | **Boden 24** | — |
| Vollmond-Wiese mit Herd im Bild | 0,0121 | 4,97 | fast schwarz (5,3) | Boden 23,5; m 0,9: 16,3 | Boden 42 |
| Lava nah | 0,047 | 1,39 | Decke 36 | Decke 31, Ufer lesbar | Bild-Mittel 34 gegen 17 |
| Gasse | 0,0216 | 2,88 | Wand 52 | Wand 72, Fenster 180, Hang lesbar | Wand 35, Fenster 54–65 |

Main rechnet unter 0,1 lx Mond mit k 1,846 (sein Nacht-Knoten klemmt): Herd fern und beide Wiesen sind dort fast schwarz — die
Abnahme der Werkbank nennt sie ROT (`bild.mittel 5 < 6`); die Bilder liegen als `-main` bei.

**Herd nah, die bestellte Zahl:** Gras in 4 m Luma **27 / 17 unter G** (Mittel 22; die Rechnung nannte 7,7 bei m 0,9415 — die Szene
des Spiels ist nicht mein Modell: Z 0,070 statt 1,5 cd/m², weil die Flamme nicht stellbar ist) und **33 / 30 unter F**.

**Der Anker:** an der freien Wiese gibt m 0,9415 Boden-Luma 50 (über 36,5), m 0,9 gibt 24 — beide lesbar, 0,9 deutlich dunkler; die
Bilder `mond-frei-G` und `mond-frei-m09-G` liegen nebeneinander.

## 4. Die Höfe von F (Code-Sprung über die Kante, 8 Pixel je Seite; „Hof" = Mittel der kantennahen 4 gegen die kantenfernen 4)

| Kante | G: Sprung · Hof davor / danach | F: Sprung · Hof davor / danach | am Bild |
|---|---|---|---|
| Flamme ↔ Nacht (Herd nah) | −138 · −6 / +5 | −47 · −3 / +1 | F drückt den Ring von 169 auf 57 |
| Stern ↔ Himmel (Herd nah) | −173 · 14 / 7 | −142 · 25 / 1; jenseits steigt der Himmel in 8 px von 1 auf 13 | **dunkler Kasten ≈ 16 px um jeden Stern** |
| Krone ↔ Himmel am Mittag | −121 · 10 / −11 | −92 · 12 / −18 | heller Saum an jeder Krone |
| Dach ↔ Himmel (Gasse, Nacht) | +35 · 0 / −4 | +42 · −2 / −11 (Rampe 50 → 63) | Hof über der Dachkante |
| Fenster ↔ Wand (Gasse) | −94 · 0 / −1 | −37 · +6 / −5 (Rampen 54 → 65 und 23 → 31) | Wand dunkelt zum Fenster hin |
| Lava-Ufer vorn | −167 · 95 / −22 | −123 · 86 / −18 | Decke von 170 auf 125 gedrückt |

Die Rampen sind breiter als 8 Pixel (eine Zelle des Felds deckt 16 Pixel); die Zahl über 8 Pixel zeigt nur ihren Anfang.

## 5. Der Schwenk (60° vom Feuer weg, G, echte Uhr)

Sprung 1,00 EV (k 0,959 → 1,914), τ 0,32 s am Zustand. Rest zum Ziel: 0 s 1,00 EV · 0,1 s 0,90 EV · 0,3 s 0,47 EV · 1 s 0,04 EV;
unter 0,3 EV nach ≈ 0,43 s — die Zeile (≤ 1 s) hält. Bilder `schwenk-000/010/030/100-G`, dazu `schwenk-F` (F hat keine Zeit) und
`schwenk-main`.

## 6. Der Preis (GPU-Zeit des ganzen Bilds, timestamp-query, Mess-Wiese Mittag stehend, 1 920 × 1 080)

Je Boot drei Runden zu 11 s je Lage, Median der Runden-Mediane; roh `preis-spike.txt`, `preis-main.txt`.

| Boot | Kette aus | G | F | G − aus | F − aus |
|---|---|---|---|---|---|
| 1 | 4,43 | 4,60 | 4,66 | +0,17 | +0,23 |
| 2 | 4,40 | 4,61 | 4,65 | +0,20 | +0,25 |
| 3 | 5,13 | 5,36 | 5,38 | +0,24 | +0,25 |
| 4 | 4,29 | 4,51 | 4,55 | +0,22 | +0,26 |
| **Mittel** | | | | **+0,21 ms** | **+0,25 ms** |

Main, vier Boote: 4,53 · 4,47 · 3,82 · 4,48 (Median 4,47). Zwischen Booten streut das ganze Bild um 0,7–0,8 ms — vorher ↔ nachher über
Boote trägt die 0,2 ms nicht; gegen den Median von main liegt G bei +0,13, F bei +0,18. **Urteil gegen Soll ≤ 0,2 ms: G an der Grenze
(+0,21 im selben Boot), F reißt (+0,25).** „Kette aus" trägt den Faktor von F im Ausgabe-Knoten schon mit (ein Zweig je Pixel);
gegen main ist dort kein Unterschied messbar (4,42 gegen 4,47). Nicht gekürzt, kein Sprung auf 64 × 36.

## 7. Was das Bild sagt

- **G** steht als Bild an Herd nah, Herd fern, Gasse, Lava, Vollmond-Wiese und Mess-Wiese; es sieht nachts mehr als main (das unter
  0,1 lx schwarz wird). **Es fällt am Mittag mit dem Himmel im Bild:** −1,06 EV, der Tag wird zur Dämmerung — der helle
  Wolken-Schein um die Sonne (nicht die Scheibe) trägt Z auf 7 173 cd/m². In der Gasse klippt die beschienene Wand nah am Weiß
  (Fenster 180, Wand 72–124).
- **F roh** ist an keinem Ort ein Bild: Kästen um Sterne, Säume an Kronen und Dächern, die Lichtinsel des Feuers verliert ihren
  Kontrast (Ring 55 gegen Gras 30), der Himmel steht in Mittelgrau. Die Höfe sind keine Feinheit, sie sind das Bild.

## Offen (mit Grund)

- Der Wechsel des Puffer-Maßstabs zwischen Tag und Nacht (Dämmerung) unter dem EINEN Gesetz k(Z): nicht gefahren; main trägt ihn
  heute in seinem Belichtungs-Gesetz, die Kette kennt ihn nicht.
- Flamme, Glut, Lava-Decke und Sonnenscheibe in physikalischer Leuchtdichte: nicht stellbar (Stellen oben), nicht umgebaut.
- Unsichere Stellen der Kette, vom Arbeiter benannt und nicht geprüft: Fenster-Wechsel mit F (bindet der Ausgabe-Knoten die neue
  zweite Stufe?), WebGL-Pfad (y-Richtung), der Deckel wirkt auf das 2 × 2-Mittel statt je Pixel, `_nachtAuge` liest unter F weiter
  das globale k, +6 Draw-Calls je Bild im Info-Zähler.
- Bricht die Kette (`_augeBruch`), hält die Belichtung ihren letzten Wert und meldet beim EINEN Melder — für eine Bau-Welle ist das
  zu entscheiden (das ist ein gehaltener Zustand, kein Rückfall auf main).
- Mond 0,3 lx, Neumond, der Bleich-Ast: nicht geschossen.
