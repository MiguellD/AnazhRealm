# NACHT-HIMMEL — Befund (GTX 1050, 25.11., sonnenbahn Kopf 3 im Baum)

Gemessen wurde linear am Start-Dorf, Uhr 0, Sommer, mit der Kamera der zwei Zahlen (-48,13 93,21 -184,61 → -35,25 94,12 -190,1).
Die Szene ging in das lineare Linsen-Ziel der Welt (`__linsenZiel`, L in Welt-Einheiten × EINHEIT_LX 16 090 = cd/m²).
Gemessen sind die Himmels-Kästen der zwei Zahlen: 5 175 Pixel, je Pixel Zenit-Winkel und Abstand zum Mond (11–104°).
Der Mond steht der Sonne gegenüber (Vollmond, Höhe 23,15°).

## Das Band an der Quelle

- **Himmel.** Krisciunas & Schaefer 1991 (PASP 103, 1033), nach der offenen Umsetzung in specsim (Gl. 3, 8, 9, 21) mit nL → mag nach
  Garstang 1986 Gl. 19. 1 nL = 1e-5/π cd/m². Die Zahl des Koordinators hält: 18 mag/arcsec² = 2 150 nL = 0,0068 cd/m².
- **Boden.** I* des Vollmonds 0,0291 fc = 0,313 lx über der Luft, × Extinktion × cos Z, × 0,2/π.
  - k 0,172 (Mauna Kea): 0,0855 lx → 0,00544 cd/m².
  - k 0,25: 0,0725 lx → 0,00461 cd/m².
  - Die Welt (Kyba 2017, 0,26 lx im Zenit × sin h × Durchlass 0,689) trägt 0,0705 lx → 0,00449 cd/m². Das sind −18 % bzw. −3 %
    gegen K&S.

## Gemessen (linear, je Pixel gegen K&S an derselben Geometrie)

| | Himmel Welt | Himmel K&S (k 0,172 / 0,25) | Himmel ÷ Boden Welt | Himmel ÷ Boden K&S | Welt ÷ Band |
| --- | --- | --- | --- | --- | --- |
| alle Himmels-Pixel (Median, 22,9° vom Mond) | 0,0065 cd/m² | 0,0150 / 0,0172 | 1,45 | 2,75 / 3,72 | 0,60 / 0,45 |
| hellstes Zehntel (14,5° vom Mond) | 0,0123 cd/m² | 0,0224 / 0,0255 | 2,75 | 4,12 / 5,52 | 0,66 / 0,50 |

Das Pflaster der Welt misst linear 0,0047 cd/m² (Median der Boden-Kästen), dasselbe wie der Boden des Gesetzes.

## Entscheid nach der Regel: (B)

- Der Himmel der Welt liegt UNTER dem Band, nicht über dem Doppelten: 0,45–0,66 × K&S. Fall (A) scheidet aus.
- Die Strahldichte des Mond-Himmels ist nicht der Täter. Den milchig-grauen Himmel macht die Belichtung: k 111 500 am Dorf legt
  0,0065 cd/m² Himmel in die Mitte der Kurve (Luma 162 des Kopfs).
- Der Schnitt gehört an den EINEN Schreiber der Belichtung. Der Schlüssel fällt mit der Adaptations-Leuchtdichte (Krawczyk ·
  Myszkowski · Seidel 2005, „Perceptual Effects in Real-time Tone Mapping“; der Server des MPI weist Werkzeuge ab (403), die Formel wird beim Schnitt an der Quelle geprüft). Ein Dimmer für den Himmel hinter der Tonkurve
  ist verboten.
- Der Zweig von main beginnt, sobald sonnenbahn gelandet ist.
