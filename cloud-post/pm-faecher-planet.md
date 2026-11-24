# Post an pm-faecher-planet

## 24.11. 03:25 — Cloud pm-faecher-planet: die Fronten des Kapitels planet am Fächer (Stationen am Kopf 8e6a8911f, Quelle f287dfb9; vorgespult auf punkte-maschine 9906eb97b)

Revier: `meisterkarte-quelle/punkte/stationen/k2-planet.js` und `k2-kosmos.js`. Alle anderen Dateien bleiben unberührt, ebenso `planet.kosmos.systeme#1`.

Die Fronten sind 28, nach `vision/front-tafel.md` vom 24.11. 01:03, ohne `planet.kopplung.*`. Jede Front-Leiter trägt `faecher: true`. Jede Sprosse misst das Gesetz am Export, den das Spiel liest (`gesetz.export`/`gesetz.leser` mit Datei:Zeile). Jede Sprosse trägt mindestens eine Attrappe, die sie ROT macht (EINE Saat, EINE Pose, ohne Streuung …). Die Proben aller `planet.*`-Stationen stehen auf „falsch 0“ (k2-planet 175 Zeilen, k2-kosmos 58), die Kompilation auf „kaputt 0“ (Arten 6 und 1).

**Bild:** An jeder Front gilt „ungemessen bis zum Gerät“. Das Bild jeder Front schießt erst das Gerät: kein GPU-Lauf in dieser Sitzung.

**Headless:** Gefahren wurde entweder der Mock der Perspektiv-Seite (echter planet-core und gelaende-core, `MOCK=mockp.js`) oder `node` direkt am Export. Wo die Seite im Mock nicht fährt, steht das dabei.

### Geologie

- **planet.geologie.einschlag#1** (Tafel gleich): headless **ROT**.
  - Gemessen: 400 Senken über 25 Welten, 0 Näpfe (node am Export, 310 392 Rufe). Der Krater-Mutant (Pike-Napf R 640 m) gibt 14 Näpfe bei d/D 0,20.
  - Es fehlt: Weder `planet-core.js:1389 punktKern` noch `gelaende-core.js:2821 hoehe` trägt einen Krater-Term. Leser: `stamm/gelaende-boden.js:810`.
- **planet.geologie.inneres#1** (gleich): headless **ROT, Leser fehlt**.
  - Gemessen: 0 von 20 Adressen tragen ein Feld.
  - Es fehlt: `planet-core.js:264 PLANET_ERDE` hat keinen Dipol. Die Antwort `voxel-worker.js:1446 planetOrtAuftrag` hat kein Feld. Der Stamm hat keinen Kompass als Leser.
- **planet.geologie.vulkan#1** (fehlt, Panel 2AFC Glutbild): Gesetz-Teil headless **ROT**.
  - Gemessen: 322 von 322 Adressen. tKruste 1 995 s im Mock (1 778 s am Export) gegen 5,9·10⁵ s; die Glut ist nach 15 849 s aus.
  - Export: `stamm/feld-leben.js:2532 _lavaZustand` → `gelaende-core.js:1835 lava`. Leser: `stamm/feld-leben.js:2460`.
  - Ungemessen bis zum Gerät: das Glutbild (2AFC).
- **planet.geologie.gebirge#1** (fehlt): headless **ROT, Leser fehlt**.
  - Gemessen: 16 von 24 Adressen; 8 Adressen fehlt die Fähigkeit.
  - Es fehlt: `voxel-worker.js:1446` gibt keine Zone, obwohl `planet-core.js:1860` die `orogenStaerke` trägt. `gelaende-core.js:3351 FELS.einfall` ist EINE Konstante (0,07 rad).
- **planet.geologie.unterwelt#1** (fehlt): headless **ROT**.
  - Gemessen: 64 von 64 Adressen, 0 Mündungen/km². Der Tunnel-Mutant gibt 21.
  - Export: `gelaende-core.js:7303 dichte`. Leser: `stamm/gelaende-chunks.js:2208`.
- **planet.geologie.lagerstaette#1** (fehlt): headless **ROT, Leser fehlt**.
  - Gemessen: 21 von 30 Adressen, 0 Genesen.
  - Es fehlt: `voxel-worker.js:1446` gibt keine Geschichte. `gelaende-core.js:3351 FELS` ist EIN Fels je Welt. Die Genese lebt nur am Brocken (`foundry-core.js:5242 rockPhenotype`).
- **planet.geologie.platten#1** (fehlt, Panel Blindpaar): headless **ROT**.
  - Gemessen: 30 Saaten, 17 772 Antworten. Gürtel 4,5 % (Soll ≥ 70 %), Achse p30 1,35, 69 Komponenten.
  - Offen: Die Station ist ein eigener Fächer von vor M4 (eigene Probe-Schleife, `k2-planet.js:599ff`), nicht `FAECHER`. Sie ist nicht umgebaut, weil der 60-s-Deckel den Umbau auf 30 Saaten × Gitter nicht trägt.

### Wetter

Die Wetter-Seite fährt im Mock nicht: Er trägt weder `_wetterAmOrt` noch `A.Gesetz` noch `_atmoRechnung`. Die Zahlen stammen deshalb aus `node` am Export oder aus dem Gesetz gelesen.

- **planet.wetter.lagen#2** (gleich): headless **ROT, Leser fehlt**.
  - Gemessen: Der Fächer spannt 50 Saaten. Der Druck fehlt am Export.
  - Es fehlt: `phyto-core.js:4804 wetterAt` hat weder Druck noch Gattung, nur drei Sinus-Wellen.
- **planet.wetter.klimazonen#2** (gleich): headless **ROT**.
  - Gemessen (node am Export): Schneelinie 150–176 m gegen 2 900 m, Baumgrenze 137–162 m gegen 2 100 m.
  - Es fehlt: `gelaende-core` TEMPERATUR fällt mit 0,11 K/m.
- **planet.wetter.extreme#1** (gleich): headless **ROT**.
  - Gemessen: `pegelHub` ist bordvoll an der Krone 0,2 m.
  - Es fehlt: `gelaende-core.js:1569` und `gelaende-core.js:1796` deckeln `pegelHub`.
- **planet.wetter.wolken#1** (fehlt): Gesetz-Teil headless **ROT**.
  - Gemessen: Der Zug beträgt an jeder Adresse 11 m/s, Streuung 0.
  - Es fehlt: `phyto-core.js:4698 WIND_FELD.front.zugMS` ist eine Konstante. Leser: `stamm/bild-himmel.js:1964`.
- **planet.wetter.vorhersage#2** (fehlt): headless **nicht gefahren** (Stamm-Welt).
  - Die Station misst den Skill des Zeichens „bedeckt jetzt“ → Regen in 12 h über 20 Saaten.
  - Es fehlt: `phyto-core.js:4804 wetterAt` hat keinen Vorlauf der Front. Das Bildmodell bleibt ungemessen bis zum Gerät.
- **planet.wetter.fremde-atmosphaeren#1** (fehlt): Gesetz-Teil headless **nicht gefahren** (Mock ohne `_atmoRechnung`).
  - Die Station misst die Sonne je Welt × Höhe am Export `foundry-core.js:385 ATMO_RECHNUNG`.
  - Ungemessen bis zum Gerät: die Himmelsfarbe, die nur die GPU rechnet (`welt-licht.js:1084 himmelSicht`).

### Kosmos

- **planet.kosmos.ereignisse#1** (gleich): headless **ROT, Leser fehlt**.
  - Gemessen: 241 Adressen.
  - Es fehlt: `welt-licht.js:2020 kosmosZeit` trägt keinen Meteor.
- **planet.kosmos.kunstwelten#1** (gleich): headless **ROT, Leser fehlt**.
  - Es fehlt: `stamm/speicher-welten.js:118 _weltGesetz` hat keine Bauart (die Welten in `stamm/daten.js:84 ULTIVERSUM`).
- **planet.kosmos.galaxien#1** (gleich): headless **ROT**.
  - Gemessen (node am Export): Band 0,24–0,29 über 12 Saaten, 0 Ziele.
  - Es fehlt: `welt-licht.js:1616 kosmos` trägt EINE Galaxie.
- **planet.kosmos.welten#1** (keine Station): **offen**.
  - Die S1 lebt in `g3.js:1087`, außerhalb des Reviers. Sie ist nicht angefasst und hier benannt.
- **planet.kosmos.systeme#1**: steht schon auf dem Fächer, nicht angefasst.

### Wasser

- **planet.wasser.gezeiten#1** (gleich): headless **ROT**.
  - Gemessen: Hub 0, periodeH null, 325 von 325 Adressen (Küsten × 25 h).
  - Es fehlt: `gelaende-core.js:5884 waterLevel` ist konstant, `gelaende-core.js:7767 wasserSpiegel` kennt keine Zeit. Leser: `stamm/wasser-hydro.js:681`.
- **planet.wasser.eis#2** (gleich): headless **ROT**.
  - Gemessen (node am Export): Einsetzen bei 16,5 K·d gegen 13,7 K·d (Soll ± 20 %).
  - Export: `gelaende-core.js:1404 eisDicke` und `gelaende-core.js:1376 EIS.traegt`. Leser: `stamm/bild-himmel.js:3178` → `stamm/wasser-hydro.js:705`.
- **planet.wasser.kreislauf#2** (gleich): headless **ROT**.
  - Gemessen: 0 von 22 Gruben ab 80 m vom Ufer laufen bis zum Spiegel voll.
  - Es fehlt: `gelaende-core.js:7799 atlasSpiegel` füllt nur den Rand 3×3. Es gibt keinen Grundwasser-Spiegel, also keine Quelle am Spiegel-Austritt (`gelaende-core.js:1953 flussLaeufe`). Leser: `stamm/wasser-hydro.js:67 _atlasWaterLevelAt`.
- **planet.wasser.seegang#1** (gleich): **ohne Fächer-Richter**.
  - Die Station urteilt nur am Bild: `spiegelTreue` (`lib/abnahme-urteil.cjs:1515`) aus `/bild` an 12 Posen, gerechnet im GPU-Pass `stamm/wasser-hydro.js:789`.
  - Es fehlt: `FAECHER` kennt keine Bild-Adresse. Die Front bleibt ungemessen bis zum Gerät und steht nicht im Anspruch.
- **planet.wasser.stroemung#2** (gleich, PROBE misst nichts): **ohne Richter**.
  - Es fehlt: `scripts/werkbank.cjs:2110 /bild` hat keinen optischen Fluss, also misst nichts die Strömung im Bild. Die Front steht nicht im Anspruch.

### Rest (relief, zeit, erde)

- **planet.relief.wandel#1** (gleich): headless **ROT**.
  - Gemessen (Mock): Abtrag 0 m³ an 8 Gräben × 3 Zeiten; 24 von 24 Adressen, 8 davon geflutet.
  - Es fehlt: Der einzige Schreiber ist `stamm/gelaende-chunks.js:3021 _addVoxelEdit` (das Verb). Es gibt kein Sediment-Gesetz.
- **planet.zeit.klimageschichte#1** (gleich): headless **ROT**.
  - Gemessen (node am echten planet-core): dT 0 °C und Schneegrenze 0 m über 100 a an 48 Punkten. Küste 1,22 m an 9 Küstenpunkten. 114 von 136 Adressen.
  - Es fehlt: `planet-core.js:2092 planetKlimaGlobal` kennt kein CO₂-Forcing in Jahren.
- **planet.zeit.archiv#2** (fehlt, Panel): Gesetz-Teil headless **ROT**.
  - Gemessen: 186 von 186 Adressen (6 Wände × 31 Tiefen bis 45 m). 176 Lagen, EIN Grundton, 1,11 Bänder je 10 m.
  - Es fehlt: `gelaende-core.js:3855 felsFarbe` färbt Paket und Bank aus EINEM Grundton je Welt (`stamm/gelaende-boden.js:3142 FELS_STOFF.basis`) und kennt kein Milieu. Leser: `voxel-worker.js:4178 felsStoff`.
- **planet.relief.formschatz#1** (fehlt, Panel): headless **ROT**: R11 Panel, die Station behauptet kein GRÜN; `richtigProzent` ist ungemessen gegen Soll ≥ 80 %.
  - Der Fächer-Zeuge trägt (saaten 20 gegen Soll ≥ 20).
  - Gemessen: 57 von 60 Profilen über 20 Saaten. Klassen: 38 V, 19 Trog, 47 Aue, 19 Schichtstufen. Exponent b im Median 1,13.
  - Ungemessen bis zum Gerät: die Blind-Klassifikation (Panel). Export: `gelaende-core.js:1953 flussLaeufe`, `gelaende-core.js:2058 schichtOrt` und `gelaende-core.js:6069 lageAus`. Leser: `stamm/feld-leben.js:1298 _planetAuftrag`.
- **planet.relief.boden#1** (fehlt, Panel): Gesetz-Teil headless **ROT**.
  - Gemessen: 270 von 270 Adressen (30 Posen × 9 Punkte). 40 steile Punkte, davon 0 % mit Fels oder Schutt ab 30°; 33,3 % der Punkte feucht.
  - Es fehlt: Fels kommt erst ab Steilheit 0,42 ≈ 55° (`stamm/daten.js:646 TERRAIN_GEOLOGY.rockLo`), und es gibt keinen Foto-Korpus. Export: `gelaende-core.js:5501 felsStoffPunkt`. Leser: `stamm/gelaende-boden.js:2753 _bodenGruenAt`.
  - Ungemessen bis zum Gerät: 2AFC.
- **planet.erde.gestalt#1** (fehlt): headless **ROT**.
  - Gemessen (node): Am Samen „erde“ liegt die Welt im Mittel 350,7 km neben der Küste (10 Punkte, 0 Land); S3 gibt p90 3 034,9 km (20 Punkte, 7 Land).
  - Es fehlt: `planet-core.js:312 planetPlan` liest keinen Erd-Schlüssel (R4).

### Die Lücken der Bauart (außerhalb des Reviers, benannt)

1. **Panel- und Korpus-Fronten** (Tafel „fehlt“, R11) haben in der Bauart keinen Richter.
   - Betroffen: vulkan, gebirge, unterwelt, lagerstaette, platten, wolken, vorhersage, fremde-atmosphaeren, archiv, formschatz, boden, erde.gestalt.
   - Der Fächer misst den Gesetz-Teil; Auge, Soll und `nicht` bleiben. Ein Anspruch fällt erst, wenn `punkte.cjs` einen Panel-Richter trägt.
2. **`FAECHER` (faecher.js) kennt keine Bild-Adresse.** Deshalb haben seegang#1 und stroemung#2 keinen Fächer-Richter.
3. **platten#1** ist ein eigener Fächer von vor M4 (`k2-planet.js:599ff`) und noch nicht auf `FAECHER` umgebaut.

### Anspruchs-Zeile für `zug/anspruch.txt`

Die Zeile nennt nur Fronten mit einer urteilenden Station (Tafel gleich, Fächer-Richter):

```
pm-faecher-planet karte2.planet.geologie.einschlag#1,karte2.planet.geologie.inneres#1,karte2.planet.wetter.lagen#2,karte2.planet.wetter.klimazonen#2,karte2.planet.wetter.extreme#1,karte2.planet.kosmos.ereignisse#1,karte2.planet.kosmos.kunstwelten#1,karte2.planet.kosmos.galaxien#1,karte2.planet.wasser.gezeiten#1,karte2.planet.wasser.eis#2,karte2.planet.wasser.kreislauf#2,karte2.planet.relief.wandel#1,karte2.planet.zeit.klimageschichte#1
```

### Selbsttest (`node meisterkarte-quelle/punkte/punkte.cjs selbsttest --ohne 3c`)

| Lauf | Grün | Exit |
|---|---|---|
| vorher (01:43) | 269/273 | 1 |
| nachher (03:10, nach dem Kopf 8e6a8911f) | 269/273 | 1 |
| nach dem Vorspulen auf `punkte-maschine` 9906eb97b (in dem 2ee64a40b schon gelandet ist) | 271/275 | 1 |

Die Zahl Grün ist nicht gesunken: Die zwei neuen Fälle von `punkte-maschine` sind beide grün. Alle drei Läufe zeigen dieselben 4 ROT:

1. BEFEHL TRÄGT. Rot, weil „vorher NICHT rot: mensch.kopplung.antwort#1, mensch.zeit.kausal#1“; das liegt nicht im Revier.
2. WACHE.
3. WACHE DER TOD KOSTET NUR DIE LAUFENDE PROBE.
4. LEBENSZEICHEN DES ZEUGEN.

### ZWISCHENSTAND

**Geschnitten:** 27 der 28 Fronten des Kapitels planet urteilen am Fächer über das Gesetz, das das Spiel liest, mit Export und Leser je Sprosse (Datei:Zeile) und einer Attrappe, die sie ROT macht; nur welten#1 nicht, deren S1 in `g3.js:1087` außerhalb des Reviers liegt.

**Gemessen:** Headless urteilt jede neue Station ROT, oder sie ist nicht gefahren, wo die Seite im Mock nicht fährt (vorhersage#2, fremde-atmosphaeren#1) – etwa 0 Näpfe in 25 Welten, Hub 0 der Gezeiten, 0 von 22 Gruben am Spiegel, dT 0 °C in 100 a, 350,7 km neben der Küste, EIN Grundton an 6 Wänden – bei Selbsttest 269/273 vorher und nachher, 271/275 am vorgespulten Kopf.

**Offen**, mit Adresse oben:

- der Panel- und Korpus-Richter der Bauart (12 Fronten)
- die Bild-Adresse von `FAECHER` (seegang#1, stroemung#2)
- der Umbau von platten#1 auf `FAECHER`
- die Wetter-Seite headless (vorhersage#2, fremde-atmosphaeren#1)
- jedes Bild an jeder Front, ungemessen bis zum Gerät

Karte 2 gebucht 82 von 1 718 (`vision/karte-2-stand.json` am Kopf 9906eb97b: `heute 82`, `sprossen 1718`).
