# Bericht 1310-7 — Koniferen oder Wirt: der Baum-Preis von K24 an der Wiese

**Status: ZWISCHENSTAND.**

**Urteil:** Der Quirl-Abstand ist nicht der Haupt-Täter. Der größere Teil des Baum-Mehrpreises liegt im Wirt, nicht im Asset.
- Die Laubbäume, deren Studio-Assets in A und B byte-gleich sind (1310-6), kosten in B **+0,81 ms** mehr.
- Die neu geprägten Koniferen kosten **+0,42 ms** mehr.
- Ein Schnitt am Quirl (Überlappung je Quirl begrenzen) träfe höchstens diesen kleineren Teil, und auch der kann Wirt sein. Kein
  Schnitt.

## Der Toggle

Je Stand EINE Sitzung an der Wiese, Gier 0. Drei Schalter-Sätze, je dreimal im Wechsel (an, aus, aus, an, an, aus):
alle Bäume, nur die Koniferen (fichte, tanne, mammut), nur die Laubbäume. Dazu gpu-bank 12 × 3 und der Takt (nvidia-smi).
A = 1abe2b5f^ = bb554abf (`abab-b543`), B = main 785cca46 (`abab-b544`). Daten in `1310-7/A`, `1310-7/B`.

| Preis (an − aus), gpu-bank Gier 0 | A | B | Δ B − A |
|---|---|---|---|
| alle Bäume | 3,78 (an 12,83–12,89 · aus 9,04–9,12) | 5,11 (an 13,98–14,24 · aus 8,86–9,09) | **+1,33** |
| nur Koniferen | 1,21 | 1,63 | +0,42 |
| nur Laubbäume | 2,10 | 2,91 | **+0,81** |
| Takt MHz (Mittel je Satz) | 1724–1745 | 1710–1728 | ≤ −2 % |

- Ohne Bäume zeichnen A und B gleich (9,04–9,12 gegen 8,86–9,09 ms).
- Die Masse je Art ist gleich (`mass.txt`): dieselben Instanzen, Welt-Skala und Dreiecke je Instanz.
- Die Sätze addieren sich nicht ganz zu „alle“ (A 3,31 von 3,78, B 4,54 von 5,11): Bäume verdecken einander.

## Der Name

- Der Mehrpreis entsteht beim Zeichnen derselben Bäume, also im Wirt: Stoff, Instanz-Stempel, Blende oder Reihenfolge der Bäume
  unter K24 (f4527629, e361cba3 und die Wirts-Teile von 2cca63df: `_phytoStudioDials` fällt, die Leser lesen `artPhaenotyp`).
- Nicht die Höhen-Quelle der Blende: `_foundryBaumHoehe` ist in A und B gleich.
- Den Term nennt EIN weiterer Toggle in einer B-Sitzung. Er tauscht die von K24 geänderten Baum-Methoden des Wirts live gegen
  die aus A (`werkbank methode --quelle`), baut die Bäume neu und fährt gpu-bank an/aus.

## Pflicht-OFFEN Rest

- Der Wirts-Preis der Bäume unter K24 an der Wiese (Laub +0,81, gesamt +1,33 ms in dieser Sitzung): benannt bis auf den Term,
  nicht geschnitten.

## Status ZWISCHENSTAND + Übergabe

- Werkzeug `p3/k24`: `sitzung-k7.sh`, `art.cjs` (Sätze alle · nadel · laub · je Art).
- Kein Zweig, kein Code-Commit. Frei.
