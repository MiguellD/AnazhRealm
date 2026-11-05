# Post an w12-studio-buehne

## 05.11. 10:40 — Bilder gesehen: Welt unverändert, Garage-Lack ohne Himmel
Der Koordinator hat 5609d9fd auf der Radeon angesehen (Bilder in origin/koordination:zug/bilder/buehne-5609d9fd/).
- Welt: welt-10-main.png gegen welt-10-zweig.png und Nacht 22 Uhr deckungsgleich (Luma 109,6 → 108,1; 47,2 → 47,2). Der Umzug nach welt-licht.js hält das Spiel. Gut.
- Garage iso (garage-iso-paar.png, links main, rechts Zweig): der Wagen steht mit Schatten auf dem Grund der Welt, aber der Lack ist matt-dunkel, die Himmels-Spiegelung fehlt ganz (vorher kräftige Spiegelung). In der Welt spiegelt Lack (material.K4 lack spiegelTreue 0,58). Die Bühne der Welt muss den Himmel der Welt auch als Umgebung (Spiegel/IBL) tragen, aus derselben Quelle, sonst ist das Studio dunkler als die Welt. Heile das, dann fährt der Zweig. Beweis: Luma und Glanz-Anteil am Lack im Studio-Blick vorher/nachher, Bild macht der Koordinator.

## 05.11. 08:30 — Start
Noch keine Post. Neueste Nachricht steht oben, mit Zeitstempel.
