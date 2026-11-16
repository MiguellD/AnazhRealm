# 18-planet-same-kopplung — Fehl-Zettel (Kopf e4eeee08, gelesen, nicht gemessen)

**Zählung: A 0 · T 0 · F 7 · R 1 · B 9 — 17 von 17 Leitern beurteilt.** Wirklich gelesen sind etwa 55 %: die Spiel-Stellen jeder
F- und R-Sprosse an Datei:Zeile, die Stationen gN.js an ihrer Fundstelle. Die B-Urteile beruhen auf einem leeren Grep plus dem
Ansatzpunkt; die Leser-Probe scripts/diag-wasser-leben.cjs habe ich nur in Ausschnitten gelesen.

## Die fünf billigsten Sprossen

1. **same.kopplung.stoerung 1 + same.kopplung.kaskade 1 (F, EINE Probe, ~3 min je Gerät, S).** Brand und Löschen im Regen leben im
   Spiel (stamm/feld-leben.js:2646 löscht, :2741 zündet, Asche :94), stoffe.K2#2 urteilt beides headless (stationen/g1.js:3408). In
   der Sitzung zwei Zellen zünden, auf einer regnet es: das Bildpaar vor/nach trägt stoerung 1, Erlöschen gegen Halten trägt kaskade 1.
2. **planet.kopplung.wetter-welt 1 (R, ~3 min, S).** licht.K5#1 fährt schon an beiden Geräten in der Sitzung (stationen/g3.js:2690,
   ZUG_PROBE) und misst nur die Glätte und den Hub der Leuchtdichte. Dazu kommt je Phasen-Ende das Richtlicht (lightMul,
   stamm/daten.js:18) und die Chroma der Himmels-Zeilen (cloudCover stamm/bild-himmel.js:1747), mit stormy statt rainy.
3. **same.kopplung.ereignis 1 (F, ~2 min, S).** Lava glüht und erstarrt (gelaende-core.js:1808), stoffe.K3#2 urteilt das headless
   (stationen/g1.js:3556). In der Sitzung braucht es ein Bild bei alterS 0 (Glut, R/G ≥ 2) und eines nach dem Erstarren.
4. **same.kopplung.zeitreise 1 (F, ~3 min, S).** Die 10 Fällungen und die Stümpfe stehen (stamm/vegetation-wiese.js:1290), feld.K4#1
   urteilt sie headless (stationen/g1.js:3128). Die TAT-Probe gehört in die Sitzung, dazu Bäume und Stümpfe im gezeichneten Ring.
5. **planet.kopplung.bahn-klima 1 (F, ~4 min, S).** Die Schneelinie wandert mit der Saison (schneeLinie gelaende-core.js:1491,
   _schneeTakt stamm/bild-himmel.js:2862), stoffe.K3#2 und wetter.K4#1 urteilen nur headless. Gebraucht wird eine Probe mit drei
   Saisons und je einem Bild an einer Hang-Pose. Preis-Risiko: Chunk-Neubau beim Wechsel der Saison.

## Funde über das Paket hinaus

- **EINE Brand-Probe in der Sitzung trägt mindestens drei Sprossen:** stoerung 1, kaskade 1 und mit Glut-Licht/Rauch den Anfang von
  kaskade 2. Muster: stoffe.K2#2 (g1.js:3408) in weltSitzungBefehl (g1.js:2230, mutiert: true). Die headless Station misst bisher
  nur die CPU (z.bildMs ≤ 0,5 ms); den Bild-Preis mit 2 000 brennenden Zellen hat an der Radeon nie jemand gemessen.
- **Die GPU-Sitzung des Wassers (gelaende.K4#2) misst nur die Strömung.** Die 50-Punkte-Mutation (siedlungslage 1) und die Läufe
  (kohaerenz 1) laufen nur headless. Hebt man sie in dieselbe Probe, trägt das zwei Leitern. Für die 100 Saaten muss die Saat-Schleife
  das Gesetz in der Seite rechnen, ohne neu zu booten.
- **Belege, die nicht mehr stimmen:** Lava gelaende-core.js:1787-1801 → heute :1808 (an der alten Stelle steht pegelHub). Jahres-Welle
  :1304/1317 → jahrTage :1319. Findling vegetation-baum.js:3246 → :1408-1421/:3264. land-meer-luft „das Meer kein Glied“: der
  Regenschatten steht im Planeten-Kern (planet-core.js:1854/1866, o.lee :2083) und erreicht nur als EIN Klima-Δ je Reise-Ort das
  Spiel (gelaende-core.js:5874-5897). Am Ort trennt keine Kammlinie Luv und Lee.
- **Der Wind hat EINE globale Richtung** (stamm/stoff-material.js:233-235, _windForm :272 skaliert nur die Stärke). Das trifft
  stadtklima 1 (Gasse lenkt Wind) und wetter-welt 2 (dieselbe Richtung ±20° geht, Lee/Düse nur in der Stärke).
- **siedlungslage 1 nennt einen Steg**, den es als Leser im Spiel nicht gibt (Grep stamm leer). Schilf und Ufer-Band lesen den Spiegel
  (stamm/vegetation-wiese.js:1264), die headless Mutation zählt sie aber nicht als Leser (scripts/diag-wasser-leben.cjs:544).
- **planet-core trägt schon Geschichte** (Platten, Hotspot-Ausbrüche mit Zeit :876, Klima über zeitMa :1883). Der kleinste Bau für
  gegenwart 1 setzt dort an: ein Findling nur, wo je die Eis-Linie lag, statt der Hang-Regel. Hängt am Planeten-Pfad, nicht an der
  Heimat.
