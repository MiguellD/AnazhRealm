# Vorrat 04 — Leben: Pflanzen und Tiere (Kopf e4eeee08)

**Zählung A 2 · T 1 · F 5 · R 3 · B 2** (13 Leitern) · gelesen: alle 13 eingeordnet, etwa 70 % in der Tiefe (je Leiter Spiel-Stelle
und Station an der Fundstelle gelesen; nicht gelesen: das Innere der Kreatur-Proben `kaskade`/`tagesbudget`/`furcht`, die Einzelstellen von
BESTAND_GESETZ und Star-Trupp). Alles hier ist GELESEN, nichts gemessen.

Zur Ziel-Sprosse: `jahreslauf` und `kraft` tragen `heute 1`, aber Sprosse 1 ist nicht gebucht (Brücken-Kern, meisterkarte-2-richter.md:21-22).
Darum steht Sprosse 1 im Zettel (A). Was Sprosse 2 braucht, steht im Feld `fehlt`.

## Die fünf billigsten Sprossen

1. **leben.pflanzen.kraft S1 (A, 1 min je Gerät).** Der Richter steht (vegetation.K2#1, Kamm/Tal 5,93 an beiden Geräten). Es fehlt nur
   der Preis in einer gepaarten Fahrt: GTX Heap nach GC 412 MB (−12), VRAM 133 (−15 über 118), Radeon VRAM 125 (−7). Die Sprosse fällt also
   mit dem Heap-/VRAM-Schnitt an der Mess-Wiese, nicht mit einer Station.
2. **leben.pflanzen.jahreslauf S1 (A, 2 min).** vegetation.K5#2 ist an beiden Geräten grün (Winter 0,018–0,022 × Sommer). Der Preis reißt
   aber härter: Heap 420–661 MB, größtes Bild 184–209 ms beim Saison-Wechsel (Karten-Bake). Danach ist S2 ein Bau M: die Laub-Präsenz ist
   EINE Uniform für alle Arten (stamm/bild-himmel.js:832-840).
3. **leben.tiere.verhalten S1 (F, Bau S, 6 min).** Die Kreatur-Linse fährt jede Probe auch im Fenster (`diag-kreatur-takt.cjs --werkbank`,
   :4-6, :150-160), so wie tiere.K2#2 das Mahl schon fährt. Wer `tagesbudget,jagdkreis` als Sitzungs-Probe beider Geräte einhängt und die
   Urteile von K4#2/K2#1 wörtlich übernimmt, hat den Richter.
4. **leben.tiere.lebenszyklus S1 (F, Bau S, 6 min).** Hier gilt dieselbe Hebung mit `--proben kaskade` und dem Urteil von oekologie.K2#1
   über 3 Spielstunden. Preis-Risiko ist der Takt des Lebenszyklus: Soll 5,8 ms, auf der Cloud-VM gemessen 6,7 ms.
5. **leben.tiere.masse S1 (T, Bau S, 2 min).** tiere.K1#2 urteilt den ganzen Richter in der Sitzung beider Geräte (Kohäsion, Φ, drei
   Ego-Schüsse 40–50 m, EIN Fleck), war aber nie grün. Der Umfang „10 Glieder“ fehlt: der Kahlwild-Wurf gibt höchstens 7
   (tetrapoda-core.js:289), die Station verlangt nur ≥ 3.

Danach kommen tiere.bewegung S1 (F, Third-Bildreihe statt Null-Welt, 3 min) und tiere.wanderung S1 (R, MCP-Fläche über 24 Spielstunden per
`--werkbank`, 4 min).

## Funde über das Paket hinaus

- **Ein Hebel für viele Leitern:** Jede headless-Station der Kreatur-Linse (`diag-kreatur-takt.cjs --proben …`: herde, jagdkreis,
  lebensraum, tagesbudget, kaskade, furcht/folgen von oekologie.K3/K5) lässt sich ohne neuen Code als Sitzungs-Probe fahren:
  `--werkbank {PORT}+20000`, wie tiere.K1#2 und K2#2 es schon tun. Damit hebt EIN Muster verhalten, lebenszyklus, wanderung und mensch von
  headless ins Fenster, dazu wohl die Stationen von mensch.nahrung.tier (oekologie.K5) in anderen Paketen.
- **Preis-Schwelle VRAM:** meisterkarte-2-richter.md misst gegen VRAM 118 MB, die Preis-Treppe im Eingang nennt ≤ 256 MB. Gilt die Treppe,
  ist kraft S1 am VRAM schon grün, und nur der Heap 412 > 400 an der GTX bleibt. Das sollte der Koordinator klären, bevor er schneidet.
- **Belege, die nicht mehr stimmen oder ungenau sind:**
  - lebenslauf zitiert phyto-core.js:2899 für reverse-J. Am Kopf steht es bei :3101 und :3180-3183, das stehende Totholz bei :2512-2518.
  - biome stimmt noch: die Palme fällt weiter aus `lebendig > 0,4` (stamm/vegetation-streu.js:210-213), keine Temperatur. Der Bau ist S,
    mit `_temperaturAt` (stamm/bild-himmel.js:2797) als Grenze.
  - bewegung nennt „4 Säuger“. Die Gang-Bühne stellt aber wolf/fuchs/baer/wesen auf (g2.js:4274), nicht den Hirsch.
  - Der Fuchs (≈ 6 kg) liegt unter dem Umfang 10–300 kg.
- **mensch S1 ist ein Gesetzes-Mangel, keine Mess-Lücke:** EIN fleeRadius von 14 m für alle Gattungen (tetrapoda-core.js:197). Das Feldmaß
  des Rothirschs liegt um eine Größenordnung höher. Der Bau ist S: eine Zeile je Gattung.
- **kraft S2 ist näher als gedacht (R):** Rinde, Laub und Karte lesen dieselbe WIND_BOE mit der Phase am Welt-Anker
  (stamm/stoff-material.js:1678-1691). Die Kopplung Gras ↔ Krone steht also, es fehlt nur die Station K2#2 (Ringe bis 300 m,
  Kreuzkorrelation).
- **Herbar/REF-Lücke:** Für pflanzen.arten S1 liegt in spec/abnahme/ nur k24-tanne.png. Zehn Gestalt-Fotos sind die Vorbedingung, kein Code.
