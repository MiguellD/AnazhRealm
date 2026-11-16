# Vorrat 15 — erleben: Bild, Klang, Kopplung (19 Leitern)

**Zählung: A 0 · T 0 · F 1 · R 11 · B 7** — gelesen ≈ 70 %: alle 19 Ziel-Sprossen gegen Stationen und Spiel-Anker am Kopf e4eeee08 gelesen;
je Leiter Stichproben, nie ganze Dateien (der Bewohnertag (epoche-ganz) und die Reichweite der Netz-Akte (geteilter-sinn) sind nur teilweise gelesen).
Alles „gelesen“, nichts gemessen.

## Die fünf billigsten Sprossen

1. **erleben.bild.flaeche S1 (R, S, ~3 GPU-min):** Die Halbschatten-Hälfte steht an beiden Geräten (schatten.K1#2), und die Fahrt ALBEDO_K1
   (material.K1, Sitzung beider Geräte) liefert je Stoff-Zeile W schon heute (13/13 im realen Band an 4ee205bd). Es fehlt nur ein neues Urteil
   „|W − Tafel| ≤ 0,05 für gras/boden/fels/rinde/haut“ auf derselben Fahrt (stationen/g3.js:2934), keine neue Probe.
2. **erleben.bild.auge S1 (R, S, ~2 GPU-min):** Der NEUN-Teil schatten.K2 (stationen/g3.js:1785) reprojiziert schon jeden Gang-Schritt mit
   Kamera-Matrizen. Ihn von „Schatten-Rand-Pixel“ auf „jedes ruhende Pixel, Anteil über Schwelle ≤ 1 %“ weiten, die Pose an Laub legen und
   geraet auf [radeon, gtx] setzen (neunStation trägt heute nur radeon, :2205).
3. **erleben.kopplung.wahrnehmung S1 (R, S, ~3 GPU-min):** Die Jagd über Witterung steht (stamm/kreatur-verhalten.js:190). Muster
   oekologie.K4#2 (Rudel mit Gegenlauf in der Sitzung, stationen/g2.js:5432): einmal echt, einmal scentRangeM = 0, Risse zählen.
4. **erleben.klang.getuemmel S1 (F, S, ~11 GPU-min):** Spitzen-Wand (stamm/klang.js:25) und Duck (8,5–10 dB, headless) stehen. Der Lauf
   klang.K5#2 in der Sitzung braucht nur einen Spitzen-Zähler am Master und 10 min Gang; teuer an Minuten, billig im Bau.
5. **erleben.bild.nacht S1 (B, S, ~2 GPU-min):** Der Feuer-Wurf ist gebaut (stamm/bild-schatten.js:383), aber die NEUN-Probe misst an
   laterne_dorf/esse 0,248:1 — Kontrast < 1 heißt: der Mess-„Schatten“ ist heller als das Licht. An glutbrunnen war sie 7,85:1 grün
   (23d19f6f). Zuerst die Wahl des Wurfs bzw. die Pose triagieren, dann Kelvin-Hälfte + GTX dazu.

## Funde über das Paket hinaus

- **Ein Richter für zwei Leitern:** „Gang auf ein Ziel aus 2 km, kein Leuchtdichte-Sprung > 5 % am Stufenwechsel“ ist wörtlich
  erleben.kopplung.bild S1 UND (fast) erleben.bild.ferne S2. EINE Probe nach dem Muster lod.K2 pop.js (stationen/g3.js:3297, markiert
  Stufenwechsel) trägt beide.
- **Ein Lift für die Klang-Familie:** landschaftLauf (stationen/g6.js:481) hebt Teile von scripts/diag-klang-zensus.cjs per h.skript in die
  Sitzung. Nach demselben Muster wandern raumSeite (klang.raum), musik2 (musik, getuemmel) und die Regen-/Ufer-r (kopplung.klang, landschaft
  S2) aus headless in die Sitzung beider Geräte — viermal derselbe Handgriff.
- **neunStation ist einäugig:** Alle NEUN-Teile (schatten.K2–K5, licht.K4, ferne.K3/K4) tragen geraet "radeon" (stationen/g3.js:2208). Jede
  Karte-2-Sprosse, die auf ihnen steht, braucht zuerst die GTX in der NEUN-Probe.
- **Beleg veraltet, klang.raum:** Der Beleg sagt „kein HRTF“. Der Code geht weiter: es gibt GAR keinen Laufzeitunterschied, nur
  createStereoPanner (klang-core.js:1012/1191/1277). Bei ±90° schweigt die andere Seite (ILD 80–102 dB). Darum ist S1 („Pegel- und
  Laufzeitunterschied“) B, nicht F.
- **Beleg unscharf, nacht:** Der Beleg nennt 0,248:1 ROT. Dieselbe Station war an 23d19f6f/2674ff9a grün (glutbrunnen, 7,85:1). Die Probe
  wählt ihre Quelle je Kopf anders (glutbrunnen · laterne_dorf · esse) — das ist eher ein Pose-Fehler als ein fehlender Wurf.
- **Emergenz nie im Bild:** Der Fraß schreibt nur ins Leben-Feld (stamm/kreatur-leben.js:2177); kein Vegetations-Leser liest es. Damit ist
  jede „Kaskade im Blick“ B, bis _nahStreuKachel (stamm/vegetation-wiese.js:1284) die Äsung liest.
- **Preis:** Neun der 19 dichtesten Posen liegen im Dorf (Feuer, Bewohner, Dächer, Glut) — das bekannte Heap-Rot am Dorf (417–549 MB)
  trifft sie. Keine Sprosse des Pakets liegt am Fluss.
