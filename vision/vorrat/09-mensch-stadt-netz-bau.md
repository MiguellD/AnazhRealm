# 09-mensch-stadt-netz-bau — Fehl-Zettel (gelesen, nicht gemessen)

**Zählung A 3 · T 2 · F 1 · R 6 · B 3** (15 Leitern) · gelesen: 15 von 15 Leitern, Stationen an der Fundstelle gelesen für breite.siedlung,
karte2.mensch.bau.innen, START_DORF_PROBE, siedlung.K5, fahrzeug.K2, pflicht.C, profiband.K1/K4, studios.K4; nicht gelesen: siedlung.K3-Urteil
im Detail, lod.K5, material.K3, ankunft.K4. Ehrlich: etwa 70 % des Nötigen.

## Die fünf billigsten Sprossen

1. **mensch.bau.innen S1 (A)** — Tafel-Zeile karte2.mensch.bau.innen#1 steht, Probe 1 min je Gerät. Risiko: Heap am Dorf nach dem Gang.
2. **mensch.stadt.siedlungsnetz S1 (A)** — Tafel-Zeile steht, siedlung.K2 war an beiden Geräten grün. Nur das Paar am selben Kopf fehlt.
3. **mensch.stadt.form S1 (A)** — breite.siedlung#1 (g5.js:6441) urteilt die Wand Kern ↔ Rand an der Großstadt „dorf 7 9310“, 6 min. Risiko:
   der Preis an 10 206 Häusern wurde nie gemessen.
4. **mensch.stadt.vertikal S1 (T)** — dieselbe Probe liest das höchste Haus schon als Lesewert (`f.hoehe.max`, g5.js:6462). Ihr Kopf-Kommentar
   nennt vertikal S1, die Tafel-Zeile fehlt. Es fehlt ein zweiter Eintrag mit eigenem Urteil (Bau S, 0 GPU-Minuten extra im selben Lauf).
5. **mensch.bau.bauen S1 (T)** — studios.K4 (g4.js:436–450) setzt das fachwerk-Werk in Bühne und Welt über den Übergabe-Kanal, mit derselben
   Kamera und Bild-Differenz. Es fehlen ein Urteil nur über `s.fachwerk` und die Tafel-Zeile; ob die Differenz heute ≤ 2,1 % liegt, ist
   ungelesen.

Danach **mensch.netz.verkehr S1 (R)**: fahrzeug.K2#1 trägt Route und 0 Steckenbleiber an beiden Geräten. Das Bild-p95 derselben Fahrt fehlt,
der Stations-Bau ist S, aber der Preis ist bekannt rot: die Radeon-Fahrt hat 92 % der Bilder > 33 ms.

## Funde über das Paket hinaus

- **EINE Probe, drei Sprossen:** STADT_FORM_PROBE (g5.js:6428) misst Wand, Dichte-Fit, Höhe, höchstes Haus, Zahl der Häuser (10 206) und Kacheln.
  Sie trägt form S1, form S3 (R² ≥ 0,8, Höhe ≥ 5) und vertikal S1. Für groesse S3 („Anflug-Zählung ≥ 10³“) gibt sie die Zählung schon her,
  der Rest dieses Richters (2AFC, KS) fehlt.
- **Panel-Richter ohne Panel:** 5 der 15 Ziel-Sprossen (groesse, breite, messlatte, bedarf, huelle) brauchen das Panel
  aus R11 (≥ 12 Menschen oder ein geeichtes Modell, MEISTERKARTE-2.md:30). In keiner Station gibt es ein Panel und keinen Foto-Korpus
  (Grep 2AFC/Blindpaar in stationen/ 0). Diese Sprossen stehen hinter EINEM fehlenden Werkzeug; wer ein geeichtes Bild-Modell baut, öffnet
  sie alle zugleich.
- **Beleg veraltet:** netz.verkehr nennt `_verkehrZielNeu siedlung-verkehr.js:934`, am Kopf steht es bei :937. Die Strassengraph-Zeile
  von netz.gestalt (fachwerk-core.js:3810) steht heute bei :3989.
- **Paar nicht am selben Kopf:** fahrzeug.K2#1 ist grün an Radeon 4ee205bd, an der GTX aber e84fd1fb. Ebenso siedlung.K2: Radeon 4ee205bd,
  GTX b3f9ae95.
- **netz.gestalt S1:** das Gefälle steht nur headless (7 Dörfer, eines genau an 9,5 %); der Richter verlangt 8 Saaten. Die 4 Wegeklassen
  stehen in `WEGE_KLASSE` + feldweg (fachwerk-core.js:4209); fahrWegenetz zählt sie nicht je Klasse.
