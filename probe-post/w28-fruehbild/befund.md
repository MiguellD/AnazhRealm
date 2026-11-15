# Das frühe Bild im Dunst, am Code (w28-fruehbild, WIP 313303c4) — ZWISCHENSTAND 15.11. 19:35

GTX 1050, echter Renderer, Genesis-Ankunft der Sonde, kalt (frisches Profil je Lauf). Zweig lokal + gepusht als WIP,
NICHT abgegeben: zwei deiner Bedingungen reißen an der Messung, eine am Bild.

## Gemessen (Gang nach dem frühen Bild, n 8; heute n 9 am selben Abend)

| | heute | frühes Bild am Code |
|---|---|---|
| Sekunden bis zum Bild des Spielers | 21,3–24,1 (Median 23,0) | **13,2–16,1 (Median 14,7)** |
| Sekunden bis zum Weltbild (alles im Blick gebaut) | 21,3–24,1 (Median 23,0) | **23,9–28,3 (Median 24,9) — 1,9 s SCHLECHTER** |
| Sekunden, bis die Luft klar ist | — | 26,6–29,6 (Median 27,9) |
| im Bild der Kamera erschienen bei Durchlass > 10 % | — | 0 von 221–240 neuen Dingen (8 von 8 Läufen) |
| Bild-Abstand beim Gehen, Median / p95 | — | 27–64 ms / 145–188 ms |
| Bilder über 100 ms | — | **18–27 %** (14–18 Bilder je Sekunde) |

## Die drei Befunde, die gegen die Abgabe stehen

1. **Das Weltbild wird später, nicht gleich.** Der Spieler bekommt jeden Takt ein Bild (134–240 Bilder statt 51–59
   Lade-Bilder): das Zeichnen kostet den Haupt-Faden 2,6 s im Fenster (21 %), und der ist ohnehin zu 94 % belegt.
   Der Spike stand, die Frist war 100 ms je Lade-Frame — am Code mit Gang und 40 ms hält die Zahl nicht.
2. **„Kann gehen“ ruckelt, und der Schnitt liegt nicht im Lade-Takt.** 23 lange Aufgaben ≥ 110 ms in 13,2 s (CPU-Profil):
   in 17 davon ist der Knoten-Bau der größte Posten (40–170 ms je Programm, 2,9 s im Fenster, nicht teilbar — three baut
   ein Programm am Stück). Mit 20 statt 40 ms Lade-Frame: Median 28–61 ms, p95 135–187 ms, 11–21 % über 100 ms — die
   Frist ändert es nicht, die Programme müssten VOR dem frühen Bild stehen (die Familie w28-baum-programm).
3. **Am Ankunfts-Platz ist das frühe Bild eine Wand.** Der Platz ist bis ~25 m kahl; bei 14,7 s stehen Boden, Himmel
   und Leib, sonst nichts. Die Bäume kommen als Kette: gepflanzt 15,3–17,3 s, auf ihrer Stufe bis 21,4 s, Karten und
   Programme bis 24,9 s. Lässt der Radius sie früher durch, stehen sie mit EINER Hälfte ihres Bands im klaren Radius
   (die Karte ohne Programm): gerasterte Kronen (`stand-plus8-lupe.jpg`). Der 30-m-Kreis kostet nach Boden und Leib
   (≈ 11 s) nicht 1–2 s, sondern 3–4 s.

## Was gebaut ist und trägt

- EIN Schreiber `_fruehbildFrage`, EIN Radius `_dunstRadius` an den Uniforms der EINEN Luft (kein neues Programm):
  die Sichtweite, die den nächsten offenen Posten verbirgt (Durchlass dort 5 %, `_dunstSicht`); er hält über ein
  entstehendes Programm und hebt sich gleitend in die Luft des Wetters (Schicht 40 m → 1000 m, Fuß, Spektrum — kein Sprung).
- Dein Kriterium 2 steht ohne Zusatz: die In-Streuung ist die Himmels-Sicht der EINEN Atmosphäre in Blickrichtung, und
  die Kuppel liegt in derselben Luft — Zeilen über/unter dem Horizont 128·131·134 ↔ 126·128·130, keine Kante.
- 0 Pops im Bild der Kamera in 8 von 8 Läufen; hinter dem Spieler baut der Nachlauf wie heute (5–16 Dinge).

## Die Bilder (`stand-*`: dieselbe Kamera, stehend, EIN Lauf am WIP-Kopf)

`stand-0-frei.jpg` (13,9 s, Radius 44 m) · `stand-1-plus3.jpg` (52 m): Boden im Dunst, kein Baum ·
`stand-2-plus8.jpg` / `-lupe` (184 m): der Wald tritt aus dem Dunst, Kronen gerastert · `stand-h1-lupe.jpg` (0,4 s nach dem
Weltbild) · `stand-3-gehoben.jpg` (= das Bild von heute bei 23,5 s).

## OFFEN, ehrlich

- Keine Linse, kein Gate gefahren (gate:ankunft läuft am Null-Renderer; das frühe Bild gilt nur im Lade-Takt).
- „Kann gehen“ mit echter Taste nicht gespielt (der Zeuge setzt `verbTafel.vor`).
- Radeon und GTX 1060 nicht gemessen.
- Dreht sich der Spieler im Dunst, sieht er hinter sich kahles Land bis zum Nachlauf (wie heute nach dem Bild).
