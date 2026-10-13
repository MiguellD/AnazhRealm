# Augen-Befunde 13.10. — der Bild-Rückstand auf dem Weg zu AAAA (Koordinator)

Jede Zeile ist ein im Bild gesehener Defekt mit Ort und Quelle; daraus werden die Bild-Karten der nächsten Welle (je KLASSE eine Karte,
Soll-Bild + Zahl + Linse vorher ROT). Was eine laufende Karte trägt, steht dort als bindender Vermerk.

| # | Gesehen | Ort / Bild | Klasse | Stand |
|---|---|---|---|---|
| 1 | Fels liest sich als Ziegelmauer (gleich dicke Bänke, gemalte Fugen); Kliff aus 60 m dunkle glatte Blöcke | Höhle 762/−138, K17-Bilder | Fels-Stoff | in K17 (Vermerk) |
| 2 | Dorf nachts ohne ein Licht (0 Laternen = 0 vakuös); Häuser nachts taghell | Start-Dorf, K10-Bilder | Ort-Licht | in K10 (Vermerk) |
| 3 | Halb durchsichtiger Geister-Baum über der Szene, ≥ 32 s nach Ankunft stehend | K16b Bild 6 (n7, n8) | IM SPIELPFAD (pruef3:K16b: Spiel-Kamera, uLodAuge je Frame) — Klasse vermutlich „L1 allein unter halber Maske“ (anazhRealm.js:59654) | offen — Bild-Karte, Täter mit echtem Renderer |
| 4 | Stein-Haufen lesen sich als Watte (weiß, rund, ohne Schatten-Kante) | K16b Bild 6, K10 Tag | Streu-Stein Albedo/Form | offen |
| 5 | Grellweißes, treppenförmiges Band am Seeufer; eine Gelände-Platte schwebt im Wasser | Solitär-Eiche (−755,5/−821) 40 m, `auge/1310/ufer-weiss-platte.png` | Wasser-Ufer (Rand des Wasser-Mesh, Tiefe 0 → weiß?) | offen — auf main prüfen |
| 6 | Häuser aus der Ferne schlichte Kästen ohne Fachwerk-Lesbarkeit | K10 Tag-Überblick | Haus fern (NUR-WURF-Stufe / Karte) | offen |
| 7 | Kronen zeigen ihre Karten-Form, Laub-Karten wirken flach | Dorfrand, Auge 13.10. Bild 2/3 | Kronen-Karte | in K20 (Mittelsicht) |
| 8 | Boden als flache braune/violette Fläche, Ferne breiig | Auge Bild 4, K16b Bild 1 | Boden-Stoff fern / Fern-Farbe | Fern-Farbe in K16 |
| 9 | Fluss als lineal-gerader Graben, endet an der Bau-Kante; Horizont-Zinnen | K16 Makro | Naht/Ring | in K16 (Prüfer) |
| 10 | Kamera steckt in Laub (Dorfhang-Bild K17, Waldrand K20, Weide K24) | mehrere Sonden | Beweis-Bild ohne freie Sicht | Sonden-Klasse: Blick-Wahl (Lehre 17) greift nicht |

Zu prüfen (Wissen): K20-Bauer meldet, Lehre 22 („im positionNode ist positionLocal schon instanziert“) widerspreche dem WGSL der Karte — am r184-Vendor nachlesen, dann die Lehre berichtigen oder bestätigen.
| 11 | Fensterbänder SCHWARZ an den L1/L2-Häusern (waagrechte schwarze Streifen statt Fenster), tags und nachts | K10 Gasse auf Augenhöhe, `auge/1310/k10-gasse-tag.png` | Haus-Stoff der Fern-/Mittel-Stufe (Fenster-Glas ohne Stoff) | offen — Bild-Karte |
| 12 | Die Gasse ist ein glatter brauner Matsch: kein Pflaster, kein Weg-Stoff, keine Kante zwischen Weg und Haus | K10 Gasse | Weg-Stoff (Plan v2 trägt Wege — der Boden liest sie nicht) | offen — Bild-Karte |
| 13 | Nachts: Fassaden angestrahlt orange, Boden rot-rosa Glut; nur 1 von 6 Laternen im Bild leuchtet (Licht-Pool wählt 4 Plätze nach NÄHE, auch hinter der Kamera) | K10 Gasse nachts, `auge/1310/k10-gasse-nacht.png` | Licht-Pool nach Sicht statt Nähe | in K10 offen benannt |
| 14 | AUF ECHTER GPU (Radeon): Fern-Ring-Höhen auf 8 km um 3,5 m falsch (swiftshader 0,003 m); Wasser-Zebra B2 1,436 (Soll ≤ 1,3); 925 Grasbüschel bleiben über vier Umzüge stehen — die CI (swiftshader) verbirgt alle drei | K39-Rohdaten %TEMP%\claude\K39\ | Präzision/Zustand auf Spieler-Hardware | Karte K40 (gpu-gleich) |
| 15 | Ankunft V18.544 mittags: Schatten unter Bäumen saufen fast SCHWARZ ab (kein Himmelslicht im Schatten sichtbar) | `auge/1310/v544-ankunft-schatten.jpg` | Licht-Kette: Himmels-/Umgebungslicht im Schatten zu schwach (Lehre 21) | offen — Bild-Karte |
