# Befund w28-leib-nah: welche Gestalt der Spieler im Dorf auf 3–5 m sieht — ZWISCHENSTAND

GTX 1050, 13.11. 17:07–17:35, main a41ce72d, Messort dorf, die Kamera des Auftrags (−705,00 39,19 −877,04 → −703,48 39,04
−880,08, fov 34, Uhr 0,5), Werkbank. Noch kein Schnitt.

## Die Zahl zuerst

1. Auf 3–5 m zeichnet das Spiel den NAHEN LEIB in der feinen Stufe, nicht den Satz: mit dem Spieler an der Kamera sind die
   vier nächsten Bewohner (3,4 · 3,4 · 3,9 · 5,7 m) `nah`, sichtbar, `gelenkFern` falsch, je 39 991 Dreiecke in 8 Meshes
   (Haut 16 581 + 9 016, Oberteil 7 284, Hose 3 696, Haar 1 734, Augen und Kleines 1 680); die Grobstufe trägt 13 997.
2. Was dort zerrissen aussieht, ist das OBERTEIL „poncho": die Haut darunter ist ganz (Bild 3: Hals, Schultern, Arme), das
   Tuch allein trägt die Kugel-Schultern und die Fetzen an Ärmel und Seite (Bild 2).
3. Gegenprobe am selben Bewohner, an derselben Kamera: mit `top` „tshirt" oder „pullover" ist der Leib ganz (Bilder 4, 5) —
   Hals, Schultern, glattes Kleid. Der Tuch-Löser aus und die Breite des Genoms auf 1: je kein Unterschied zum Bild von heute.
4. Die Wurzel: `koerper-core.js:254` `dicke: top === "poncho" ? 0 : 0.032` — jedes andere Oberteil entsteht als Stoff AUS
   DER HAUT (`foundry-core.js:9319` `__stoffAusHaut`: die Haut-Region der Teile, um die Dicke gehoben, dieselben Gewichte),
   der Poncho als Voxel-HÜLLE über den Teil-Kugeln (`foundry-core.js:9355` `backeHuelle`, Abstand 0,12 ≈ 3,5 cm, samt
   Hals-Wurzel `koerper-core.js:238`): der letzte Schnitt auf dem Ballon-Weg von vor K45-2.
5. Wen es trifft: die Tracht ist die der Epoche des Dorf-Plans (`fachwerk-core.js:3730` `kleidung`, Leser
   `stamm/siedlung-bewohner.js:310` `_bewohnerTracht`): am Messort trägt Aradunum (30 Köpfe, alle 8 Gestalten) Poncho und
   Shorts ohne Schuh, Steintal und Rotstadt Pullover.
6. Die Gestalt je Abstand (`stamm/siedlung-bewohner.js:3446–3448`, Wahl `:1470–1494`): bis `nahM` 8 m vom Auge (+1 m
   Hysterese) leben höchstens `nahLeiber` 4 als naher Leib (die Bedeutendsten: Größe am Schirm mal Gang); jeder weitere im
   Nah-Kreis und jeder bis zur Feld-Grenze steht im SATZ DER MENGE (Mengen-Stufe 2, `:1180`); jenseits trägt das Feld (die
   Glieder-Kapseln). Die Feld-Grenze folgt dem Schirm (`stamm/vegetation-streu.js:1872`, `LOD_SCHIRM.leib` `:2884`: der
   1,8-m-Leib unter 64 Bildpunkten): 19,8 m bei 1080 Zeilen, 6,6 m bei den 360 Zeilen der Werkbank-Welt.
7. Der Satz der Menge aus der Nähe (Bild 6, 10 m mit Tele): ein Kopf ohne Gesicht und Haar, kein Hals, Fäuste als Stummel,
   das Kleid als Farbe in den Ecken EINER Hülle. Bei 1080 Zeilen ist ein Leib an der 8-m-Grenze 154 Bildpunkte hoch — der
   Satz trägt also Leiber von 154 bis 64 Bildpunkten, und auf 3–5 m (250–350 Bildpunkte) jeden fünften und weiteren.
8. Die Grobstufe des nahen Leibs (13 997 Dreiecke, mit Gesicht, Haar und Kleid) trägt nie das Bild eines Bewohners: ihr
   Haushalt beginnt bei 40 m × Größe (`koerper-core.js:49`, gemessen `gelenkAb` 38–42 m), die Nah-Wahl endet bei 8 m.
9. Das Tuch rechnet für höchstens 2 Leiber bis 14 m (`TUCH_GESETZ.leiber`, `nahM`).

## Was an der Gegenprobe noch schlecht ist (selbst gesehen)

- Der Saum des Oberteils läuft als Keil in den Schritt, und am Bund liegt die Hose mit gezackter Kante über dem Hemd
  (Bilder 4, 5) — die Naht zweier Stoffe aus der Haut an der Grenze ihrer Teile.
- Der Kragen sitzt als weiter Ausschnitt, die Schultern des T-Shirts stehen leicht ab.

## Die Annahme des Auftrags

„Der Spieler steht vor einer Gestalt, die nicht der nahe Leib ist" gilt an dieser Kamera NICHT (Zeile 1) — sie gilt ab dem
fünften Bewohner im 8-m-Kreis und für jeden zwischen 8 m und der Feld-Grenze (Zeilen 6, 7).

Bilder: `probe-post/w28-leib-nah/` (1 heute · 2 nur das Tuch · 3 ohne Tuch · 4 Gegenprobe T-Shirt · 5 Gegenprobe Pullover ·
6 Satz der Menge aus 10 m).
