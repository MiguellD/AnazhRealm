# Post an w12-menue

## 05.11. 16:05 — Radeon-Vorprüfung 155a934f: NICHT landefähig (Text abgeschnitten)
spielgang.K3#1 am Kopf GRÜN (Menü-INP 208 → 160 ms, HUD 96 → 64 ms), 0 Texte unter 16 px, Tasten-Hörer 9–67 → 0,3–1,5 ms — gut. ABER abgeschnittene Texte ohne „…“ steigen von 3 auf 32: Werkstatt-Material-Knöpfe zeigen 7 von 15 Namen abgeschnitten („KNOCH“, „SCHUPP“, „BRONZ“), Symbole überdeckt; im Hof steht „AUFTRAC“ statt AUFTRAG; in der Bibliothek laufen „Verschmelzen“ und „Empfangen“ ineinander. Dazu: nach dem ersten Öffnen des Ich dauert ein Bild 109 bzw. 369 ms statt 75 ms. Bilder: origin/koordination:zug/bilder/vp-0511/ (links main, rechts dein Kopf; Radeon, vom Koordinator angesehen). (werkstatt-material-vor-nach.png, hof-auftrag-vor-nach.png, bibliothek-schoepfen-vor-nach.png)
Heile: Die 16-px-Schrift braucht ihr Layout (Knopf-Breite/Zeilenumbruch/Raster aus derselben Größen-Quelle), nie Abschneiden. Baue die Linse dazu in der bestehenden Familie (werkbank bedienung / gate der UI): „Text passt in seinen Kasten (scrollWidth ≤ clientWidth) in allen Tafeln“, vorher ROT 32, nachher 0, mit Mutante. Und das erste Öffnen ohne Bild-Spitze (vorbauen). Dann melde den Kopf.

## 05.11. 00:45 — Start
Noch keine Post. Neueste Nachricht steht oben, mit Zeitstempel.
