# Spike STUFE der Einheit — B1 trägt nicht, Stopp mit Zahl (GTX 1050, 19.11.)

Soll: `soll.json` (erster Commit des Zweigs, wörtlich aus koordination `vision/einheit/entscheid-einheit.md` §E6, vor der Messung).
Stand der Welt: main 986eff04 (der Zweig zweigt dort ab). Kein Bau, keine Landung.

## Ergebnis

**B1 reißt an allen 6 Vorlagen — an den Abständen aus Schritt 0 UND an den heutigen Grenzen (L1 12 m, L2 26 m).** Der Spike stoppt
hier, wie das Soll verlangt; B2, B3 und B4 sind nicht gemessen. Der Bruch ist Struktur, nicht Ton: nach Abzug des mittleren
Ton-Versatzes (höchstens 5,3/255) bleibt fast der ganze Anteil stehen.

## Messung

- Die Stufen kommen vom Foundry-Faden der Welt (`r._foundryWorkerRequest(preset, Same 1, Stufe)`) und werden im Stoff der Welt gezeichnet
  (`r._foundryBuildGroup`), gestellt auf der Mess-Wiese bei (−262, −1060), Mittag (Uhr 0,5), sonnig. Das Bild ist der Ausgabe-Pfad der
  Werkbank (`bild`, 1920 × 1080).
- Der Wurf wie in der Welt: das Haus wirft in jeder Stufe den Werfer der Stufe 3 (`schatten: 3`); seine Stufen werfen nicht, der Werfer
  schreibt keine Farbe. Der Wagen wirft in jeder Stufe sich selbst.
- Je Fall drei Schüsse an DERSELBEN Kamera: E (nur der Werfer), A (L0), B (Lk). Die Kamera steht im Abstand d vom Ursprung der Vorlage
  in der Richtung (1, 0,7), 1,7 m über Grund, Blick auf die Mitte.
- **Maske:** jedes Pixel, an dem A oder B vom Bild E um mehr als 4/255 Luma abweicht (Objekt samt dem, was es vom Boden verdeckt).
- **B1:** der Anteil der Masken-Pixel mit |Luma(A) − Luma(B)| > 8/255, Soll ≤ 1 %.
- **Rauschen:** A zweimal geschossen, derselbe Anteil zwischen den beiden: 0 bis 0,06 %.
- **Zerlegung:** der mittlere Versatz Luma(B) − Luma(A) über die Maske und der Anteil über 8/255, der nach seinem Abzug bleibt.
- **Abstand:** `wechselProbe` misst orthografisch, d ist dort nur der Maßstab eines Bildpunkts. Für ein Haus heißt „< 3 m" in der Welt:
  von außen sieht man immer schon die L1. Die Kamera steht darum auf max(d, Halb-Diagonale + 0,5 m); der benutzte Abstand steht im
  Namen jedes Falls.

## Tafel B1 (Anteil der Maske über 8/255; Soll ≤ 1 %)

| Vorlage | Stufe | an b aus Schritt 0 | 12 m | 26 m | 50 m | 100 m | nach Abzug des Tons (heute) |
|---|---|---|---|---|---|---|---|
| alemannisch | L1 | 34,69 % (7,0 m) | **25,71 %** | 15,10 % | 6,63 % | — | 24,40 % (Versatz +2,06) |
| alemannisch | L2 | 69,69 % (14,5 m) | — | **64,48 %** | 36,15 % | 26,87 % | 48,51 % (+5,30) |
| japanisch | L1 | 5,43 % (8,1 m) | **2,94 %** | 4,35 % | 4,69 % | — | 2,94 % (−0,29) |
| japanisch | L2 | 36,06 % (31,9 m) | — | **37,14 %** | 29,72 % | 32,80 % | 34,06 % (−0,47) |
| modern | L1 | 2,66 % (7,3 m) | **4,59 %** | 5,85 % | 5,85 % | — | 4,55 % (−0,14) |
| modern | L2 | 53,38 % (7,3 m) | — | **58,76 %** | 26,36 % | 20,20 % | 59,46 % (+0,58) |
| gt | L1 | 5,65 % (3,2 m) | **10,78 %** | 1,06 % | — | — | 10,51 % (+0,62) |
| suv | L1 | 5,74 % (3,1 m) | **11,16 %** | 2,44 % | — | — | 10,96 % (+0,28) |
| limousine | L1 | 5,63 % (3,3 m) | **8,50 %** | 1,11 % | — | — | 8,47 % (+0,17) |

Fett: die heutige Grenze der Welt (L1 12 m, L2 26 m). Wagen zusätzlich bei 6 m: gt 11,50 % · suv 9,67 % · limousine 10,03 %.
Rohzahlen: `zahlen/b1-schritt0.json`, `zahlen/b1-abstaende.json`, `zahlen/b1-zerlegt.json`.

## Was das Bild zeigt (mit dem eigenen Auge gesehen)

- **alemannisch L2 auf 26 m** (`bilder/ausschnitt-alemannisch-L2-26m.jpg`, L0 | L2): die Fern-Stufe zeigt ein anderes Haus — kein
  Fachwerk, kein roter Backstein, keine Tür, eine graue Block-Wand, die Fenster an anderen Stellen. Das ist kein Detail, das mit dem
  Abstand verschwindet: bei 100 m stehen noch 26,9 %.
- **alemannisch L1 auf 7–12 m**: das Fachwerk steht, der Backstein der L0 wird zur glatten Fläche (`bilder/schritt0-…L1-d7.0.jpg`).
- **Wagen L1 auf 12 m** (`bilder/ausschnitt-gt-L1-12m.jpg`): Form und Farbe gleich; die Unterschiede sind feine Schattierungen der
  Flächen (glatt gegen facettiert) über viele Pixel. Ab 26 m nahe am Soll (1,06–2,44 %).
- japanisch und modern L1: das Bild hält die Gestalt, 2,9–5,9 % über alle Abstände — der Anteil fällt mit dem Abstand nicht.

## Urteil je Zeile

- **B1 ROT** an 6 von 6 Vorlagen, an jedem gemessenen Abstand bis auf keinen. Auch die heutigen Grenzen tragen B1 nicht. Die Vorhersage
  „b aus dem Bild zwischen 6 und 12 m an den Fachwerk-Stilen" ist gefallen: alemannisch L1 liegt bei 50 m noch bei 6,6 %.
- B2, B3, B4: nicht gemessen (Stopp an B1). B5 misst das Paar.

## Ehrlich offen

- Nur Same 1, eine Kamera-Richtung, Mittag, sonnig.
- Die Maske trägt auch die Grashalme vor dem Objekt mit; das Rauschen zweier gleicher Schüsse ist 0–0,06 %, die Halme bewegen sich
  zwischen den Schüssen also nicht.
- Die Stufen sind in diesem Spike einzeln gezeichnet (`_foundryBuildGroup`), nicht über die Instanz-Senke der Welt
  (`archInstanceGroups`, Atlas, Blende); dass die Welt dieselben Stufen genauso zeichnet, ist nicht geprüft.
- Die Schwelle 8/255 Luma ist streng gegen Struktur unter einem Pixel (Backstein, Facetten): ein Spike mit Unschärfe-Maß (z. B. die
  Bilder auf die Pixelgröße der Stufe gefiltert) würde zeigen, ob die Ferne „fern richtig" ist. Das Soll steht und wird nicht bewegt.

## Werkzeug

`werkzeug/stufe-bef.cjs` (die Befehle der Werkbank je Vorlage, Stufe und Abstand), `werkzeug/stufe-b1.cjs` (Maske, B1, Rauschen).
