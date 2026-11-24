## 24.11. 03:40 Cloud pm-faecher-kopplung — ZWISCHENSTAND

Zweig `pm-faecher-kopplung` (von `origin/punkte-maschine` eea0f137), Kopf 59edca146, eine Datei: `meisterkarte-quelle/punkte/stationen/k2-zusammenspiel.js`.
45 Fronten `*.kopplung.*` aus KEINE STATION, BUEHNE Umfang sonst / Saaten / Menge / Spieler / Kosmos und PROBE misst nichts
(Front-Tafel 24.11. 01:03). Nicht angefasst: `planet.kopplung.bahn-klima#2`, `same.kopplung.kohaerenz#1`.

Datei:Zeile am Mess-Kopf 8544438f (Radeon). main 60e8909d hat seitdem `w28-wetter-am-ort` aufgenommen: dort steht es eigens dabei.

**Urteil headless, für jede Front gleich:** UNGEMESSEN. Auf swiftshader endet die Probe an der GPU-Wand (`k2-planet.js` kartenZeuge),
bevor eine Leiter läuft, und schreibt kein JSON der Leitern („S1 keine Messung … [linse-gpu] fehlt“). Darum gibt es **headless keine
gemessene Zahl**. Jede Bildpflicht ist **ungemessen bis zum Gerät**. Geprüft ist je Front die Station selbst: die Selbstprobe aller
Kopplungs-Stationen (gruen-Fall, Attrappen, Mutanten, ungemessene Fälle) ergibt **1998 Proben, 0 falsch**.

### Je Front (Klasse · Fächer am Gesetz · fehlende Fähigkeit mit Datei:Zeile)

Klasse Z: die Zahl urteilt. P: PANEL, nie GRÜN, fehlt R11 Panel. K: KORPUS fehlt. Bild jeweils ungemessen bis zum Gerät.

**mensch**
- `karte2.mensch.kopplung.leib#1` Z · TRACHT_AN: 16 Saaten × Jahreszeit und Wetter · fehlt: stamm/siedlung-bewohner.js:362 ruft :374 `_bewohnerTracht` nur mit dem Schnitt der Epoche, kein Leser von seasonPhase, Regen, Temperatur
- `karte2.mensch.kopplung.leib#2` Z · GENOM_AN: Saaten × Genom · fehlt: stamm/koerper-leib.js:49 skinTone = g.pick gleichverteilt, die Herkunfts-Breite (stamm/gelaende-chunks.js:680 `_planetAnker`) erreicht das Genom nie
- `karte2.mensch.kopplung.leib#3` Z · STOFF_AN: 32 Zellen × Plan · fehlt: koerper-core.js:257 webe folgt nur dem Schnitt, kein Flachs, keine Wolle, keine Seide aus Feld, Herde oder Handel
- `karte2.mensch.kopplung.leib#4` P · HAFEN_AN: Zellen × Plan · fehlt: fachwerk-core.js:5192 region = rnd() des Samens, kein Hafen-Ort, kein Zuzug
- `karte2.mensch.kopplung.leib#6` P · STATUR_AN: 40 Genome × 1 g ↔ 2 g ↔ zurück · fehlt: stamm/feld-dsl.js:981 gravity schreibt nur state.gravity, stamm/koerper-leib.js:48 kh und fachwerk-core.js:5183 DORF lesen sie nicht
- `karte2.mensch.kopplung.sport#1` Z · TAG_AN: Bewohner × Abend- und Tagesstunden × Wetter · fehlt: koerper-core.js:5630 tagesPlan, „spiel“ ist das Werk des Kinds (:5660), der Abend ist für jede Rolle „abend“
- `karte2.mensch.kopplung.sport#2` Z · TAG_AN (Regen-Zeuge an der Tür, wo `_wetterFeldAm` da ist) · fehlt: kein Akt Eis, kein Leser der Temperatur (stamm/bild-himmel.js:3063 `_temperaturAt`), der Regen treibt ins Haus (koerper-core.js:5399)
- `karte2.mensch.kopplung.sport#3` Z · SPORT_AN: Zellen × Plan · fehlt: fachwerk-core.js:5183 DORF liest Same, Größe, Epoche, keine Sportstätte, keinen Boden
- `karte2.mensch.kopplung.sport#4` Z · SPORT_AN · fehlt: stamm/siedlung-verkehr.js:27 `_verkehrAnlegen` legt Wagen nur in der Stadt ihres Plans an, kein Spieltag, kein Stadion als Ziel
- `karte2.mensch.kopplung.sport#5` P · SPORT_AN · fehlt: koerper-core.js:5630 tagesPlan kennt kein Spiel, fachwerk-core.js:5183 DORF keine Sportstätte
- `karte2.mensch.kopplung.sport#6` P · SPORT_AN · fehlt: fachwerk-core.js:5183 DORF liest kein Gelände
- `karte2.mensch.kopplung.leben#2` Z · TAG_NOT_AN: Bewohner × 5 Stunden + Not · fehlt: stamm/feld-dsl.js:946 dslEffects trägt keinen Welt-Akt Missernte, stamm/siedlung-bewohner.js:2149 furchtErinnert kennt nur Furcht vor Gewalt
- `karte2.mensch.kopplung.kreislauf#1` Z · MAHL_AN: Bewohner × 12 ↔ 12,5 h · fehlt: koerper-core.js:5530 tagesBindung bindet das Mahl an einen Ort, kein Bissen, kein Vorrat, keine Herkunft
- `karte2.mensch.kopplung.antwort#2` Z · ORT_AN: 19 × 19 Zellen × ohne ↔ mit Trasse · fehlt: stamm/siedlung-ort.js:1427 `_autoSettlementCellInfo` liest keine Trasse, stamm/feld-dsl.js:946 dslEffects kennt keinen Weg-Akt
- `karte2.mensch.kopplung.kultur#1` P · BAU_AN: Zellen × Plan der Gießerei · fehlt: fachwerk-core.js:5192 region = rnd(), kein Leser von Fels, Wald oder Lehm der Zelle
- `karte2.mensch.kopplung.kultur#2` Z · DACH_AN: Zellen × Sonne ↔ Regen ↔ Sonne · fehlt: fachwerk-core.js:2762 bauRezept liest kein Klima
- `karte2.mensch.kopplung.kultur#6` P · BAU_AN · fehlt: fachwerk-core.js:5183 DORF liest weder Klima noch Gestein
- `karte2.mensch.kopplung.kultur#7` P · SCHWER_AN: 20 Zellen × 2 g · fehlt: stamm/feld-dsl.js:981 gravity, fachwerk-core.js:5183 DORF liest sie nicht

**planet**
- `karte2.planet.kopplung.siedlungslage#2` Z · BODEN_AN: Trassen-Orte + Mutation · fehlt: stamm/kreatur-leben.js:1707 `_bodenKlasseAt` liest keine Bodenart, kein Gestein
- `karte2.planet.kopplung.siedlungslage#3` Z · LAGE_AN: Zellen × echt ↔ flach · fehlt: stamm/siedlung-ort.js:1743 `_autoSettlementFindSite` liest weder Fluss noch Küste
- `karte2.planet.kopplung.siedlungslage#4` Z · TRASSE_AN: Segmente + Sturz · fehlt: stamm/siedlung-ort.js:3413 `_wegenetzLegen`, kein Ereignis sperrt einen Pass
- `karte2.planet.kopplung.siedlungslage#5` Z · HAUS_AN: Häuser + Schicht · fehlt: stamm/siedlung-ort.js:1427, die Zelle trägt kein Gestein, fachwerk-core.js:213 STILMODE wählt den Stoff nach dem Stil
- `karte2.planet.kopplung.siedlungslage#6` P · fehlt: fachwerk-core.js:4459 GROESSE_WAND 500 Häuser, keine Stadt über 10⁶
- `karte2.planet.kopplung.siedlungslage#7` P · fehlt: stamm/siedlung-ort.js:1427, die Zelle liest keinen Planet-Zeitpunkt
- `karte2.planet.kopplung.kaskade#1` Z · HANG_AN: 20 Hang-Orte × ohne ↔ mit Rutschung · fehlt: stamm/siedlung-ort.js:3413 `_wegenetzLegen` liest kein Ereignis, keine Rutschung im Gelände
- `karte2.planet.kopplung.ereignis-spur#1` Z · GRAB_AN: 12 Orte × 0/−66/−252/−500 Ma · fehlt: voxel-worker.js:1446 planetOrtAuftrag reicht keine Schichtfolge und keinen Vulkan an die Welt
- `karte2.planet.kopplung.gegenwart#1` Z · RELIKT_AN: Orte polwärts 36° · fehlt: stamm/vegetation-baum.js:1433 `_rockGeologyClass` legt Findlinge nach Hang und Höhe, gelaende-core.js:5990 ort.eis
- `karte2.planet.kopplung.gegenwart#3` P · fehlt: planet-core.js:2734 trog = glatt(16, −2, tJs) liest das Jahresmittel von heute, keine Eis-Geschichte
- `karte2.planet.kopplung.gegenwart#4` Z · SPIEGEL_AN: 4 Saaten × 10°-Gitter × Stand/Ria/Terrasse über 7 Zeiten · fehlt: gelaende-core.js:5980 meerUnterBasisM liest den Spiegel EINER Zeit, stamm/gelaende-boden.js:456 state.waterLevel ist eine Zahl

**leben**
- `karte2.leben.kopplung.evolution-planet#1` Z · WURF_AN: jeder Wurf (frei und fest) im Lebensraum · Leser stamm/kreatur-leben.js:1900 lebt(x, z) · fehlt beim Namen, wenn kein Lebensraum-Gesetz trägt
- `karte2.leben.kopplung.leben-formt-planet#2` Z · ABTRAG_AN: Hang-Orte Wald ↔ offen × Sturm ↔ Rutschung · fehlt: stamm/gelaende-boden.js:316 „keine Erosions-Simulation“
- `karte2.leben.kopplung.stadt-im-netz#2` Z · FISCH_AN: 25 × 25 Fisch-Zellen × Dichte ↔ Fang · fehlt: stamm/kreatur-fauna.js:566 `_fischZelle`, kein Verb fängt

**erleben**
- `karte2.erleben.kopplung.emergenz#1` Z · die Kaskade als Fächer: 8 Saaten × mit ↔ ohne Wölfe · Leser stamm/kreatur-leben.js `_kreaturFrass`, tetrapoda-core BESTAND_GESETZ · `jungwuchsMinusProzent` gesetzt (vorher nie), refQuelle-Richtung nach vision/blatt/28-sinn.md:62
- `karte2.erleben.kopplung.geteilter-sinn#1` Z · TAT_AN: ≤ 60 Taten der DSL × Spieler A ↔ B · fehlt: stamm/netz-p2p.js:1713 `_p2pMsgPeerJoin`, keine Gegenstelle in der Sitzung
- `karte2.erleben.kopplung.klang#1` Z · OHR_AN 1: Lage × Regen und Deckung + 7 Dach-Stile · fehlt: klang-core.js:917 regen liest keinen Dachstoff (stamm/klang.js:408 `_umweltLage`)
- `karte2.erleben.kopplung.klang#2` Z · OHR_AN 2: die Ereignis-Akte · fehlt: stamm/klang.js:485 `_umweltLageZwei` trägt kein Beben, keinen Ausbruch, keine Menge
- `karte2.erleben.kopplung.klang#3` Z · OHR_AN 3: das Ohr je Ort + 100 a · fehlt: stamm/netz-portal.js:660 `_reiseBetreten`, kein Akt altert den Ort
- `karte2.erleben.kopplung.klang#4` Z · OHR_AN 4: Siedlungen × Epoche · fehlt: stamm/klang.js:485 liest keine Epoche (fachwerk-core.js:4495 siedlungsEpoche reicht nur ins Bild)
- `karte2.erleben.kopplung.klang#5` Z · OHR_AN 5: Saat × Zeitalter · fehlt: planet-core.js:2684 planetOrt, kein Arten-Inventar je Zeitalter
- `karte2.erleben.kopplung.klang#6` Z · OHR_AN 6: Saat × Zeitalter · fehlt: planet-core.js:2684 planetOrt, weder Arten noch Medium
- `karte2.erleben.kopplung.wahrnehmung#2` Z · KITZ_AN: 5 Orte × Wind ↔ Rauschen ↔ Drehung, 300 Schritte · fehlt: stamm/kreatur-furcht.js:119 witterung ist ein Kreis; den Wind liest nur der Jäger (stamm/kreatur-verhalten.js:190)
- `karte2.erleben.kopplung.wahrnehmung#6` Z · STERN_AN: 40 Saaten × planet-anker · fehlt: planet-core.js:2585 planetAnker (voxel-worker.js:1435) trägt keinen Stern-Typ

**same**
- `karte2.same.kopplung.gewalt#1` Z · GEWITTER_AN: 12 Orte (±2 km) × Wetter-Zug ↔ Blitz · fehlt: stamm/feld-brand.js:440 `_brandEntfachen` rufen nur stamm/kampf.js:2471 und stamm/koerper-fahrt.js:2361, stamm/bild-himmel.js:3032 `_wetterAmOrt` trägt das Gewitter ohne Blitz (auch auf main 60e8909d)
- `karte2.same.kopplung.terraform#1` Z · REGEN_AN: 5 Ziel (Kern um den Spieler) + 5 Lee (windab `windGrund`, `WETTER_ORT.leeM`) + 3 fern + das Lee der Karte × ohne (der Eingriff fern) ↔ mit (das Wort „rainy“ am Spieler); Zeuge: der ferne Gegenort bleibt (|Δ| ≤ 0,02). Am Mess-Kopf 8544438f fehlt das Feld am Ort (stamm/bild-himmel.js:3009 `_weatherFieldFor` ist EIN Wort der Welt). **main 60e8909d trägt es**: stamm/bild-himmel.js:3059 `_wetterFeldAm` über phyto-core.js:4971 wetterFeldAm (Kern 3300 m, Lee 13 200 m). Dort misst die Station, sie sagt nichts mehr nur über ein Fehlen.
- `karte2.same.kopplung.erdsaat#1` K · keine Fächer-Station: es fehlt ein Korpus (ein Relief-Modell der Erd-Region). fehlt: planet-core.js:312 planetPlan liest keinen Erd-Schlüssel, planet-core.js:1884 planetVulkane hat keinen Leser im Faden (voxel-worker.js:1446)

### Anspruch (zug/anspruch.txt), nur Fronten mit urteilender Station (Z, 34)

```
pm-faecher-kopplung karte2.mensch.kopplung.leib#1,karte2.mensch.kopplung.leib#2,karte2.mensch.kopplung.leib#3,karte2.mensch.kopplung.sport#1,karte2.mensch.kopplung.sport#2,karte2.mensch.kopplung.sport#3,karte2.mensch.kopplung.sport#4,karte2.mensch.kopplung.leben#2,karte2.mensch.kopplung.kreislauf#1,karte2.mensch.kopplung.antwort#2,karte2.mensch.kopplung.kultur#2,karte2.planet.kopplung.siedlungslage#2,karte2.planet.kopplung.siedlungslage#3,karte2.planet.kopplung.siedlungslage#4,karte2.planet.kopplung.siedlungslage#5,karte2.planet.kopplung.kaskade#1,karte2.planet.kopplung.ereignis-spur#1,karte2.planet.kopplung.gegenwart#1,karte2.planet.kopplung.gegenwart#4,karte2.leben.kopplung.evolution-planet#1,karte2.leben.kopplung.leben-formt-planet#2,karte2.leben.kopplung.stadt-im-netz#2,karte2.erleben.kopplung.emergenz#1,karte2.erleben.kopplung.geteilter-sinn#1,karte2.erleben.kopplung.klang#1,karte2.erleben.kopplung.klang#2,karte2.erleben.kopplung.klang#3,karte2.erleben.kopplung.klang#4,karte2.erleben.kopplung.klang#5,karte2.erleben.kopplung.klang#6,karte2.erleben.kopplung.wahrnehmung#2,karte2.erleben.kopplung.wahrnehmung#6,karte2.same.kopplung.gewalt#1,karte2.same.kopplung.terraform#1
```

Nicht im Anspruch: 10 PANEL-Fronten (leib#4, leib#6, sport#5, sport#6, kultur#1, kultur#6, kultur#7, siedlungslage#6, siedlungslage#7, gegenwart#3), weil sie ohne R11 nie urteilen, und erdsaat#1 (KORPUS).

### Selbsttest `node meisterkarte-quelle/punkte/punkte.cjs selbsttest --ohne 3c`

- vorher (Basis eea0f137): **269 GRÜN / 4 ROT** von 273
- nachher (Kopf 45b81900c, gewalt#1 und die erste Fassung von terraform#1): **269 GRÜN / 4 ROT** von 273
- nachher am Endstand (Kopf 59edca146, der Code dieses Posts): **269 GRÜN / 4 ROT** von 273, „jetzt ROT 0“ in BEFEHL TRÄGT

Die vier ROT sind in beiden Läufen dieselben: BEFEHL TRÄGT, WACHE (2×), LEBENSZEICHEN DES ZEUGEN. Sie liegen außerhalb meiner Datei.
BEFEHL TRÄGT meldet in beiden Läufen „jetzt ROT 0“; keine meiner Stationen reißt die Befehlszeile (≤ 32766).

### Offen (mit Adresse)

- Die GPU-Wand: `k2-planet.js` kartenZeuge urteilt auf swiftshader vor den Leitern. Jede Zahl oben braucht den Lauf am Gerät (Radeon oder GTX). k2-planet.js ist nicht mein Revier.
- terraform#1 am Kopf main 60e8909d fahren. Ein ROT der Bilanz ±10 % wäre ein Befund des Spiels, kein Fehler der Station: phyto-core.js:4967 kappt c auf 1, d. h. zieht der Eingriff mehr Regen, als das Lee trägt, nimmt kein Eingriff mehr.
- PANEL R11 für die 10 P-Fronten: `auge-klasse.cjs` (P: nie GRÜN). Nicht mein Revier.
- KORPUS für erdsaat#1: ein Relief-Modell der Erd-Region.
- Die Leser-Zeilen in den übrigen `k2-*.js` habe ich nicht geprüft. In meiner Datei zeigten 82 Name-Zeilen-Belege auf einen älteren Spielbaum (z. B. DORF :4403 statt :5183, planetOrtAuftrag :1175 statt :1446); sie sind auf 8544438f gesetzt. Die übrigen Dateien tragen wahrscheinlich dieselbe Verschiebung.

**Geschnitten:** 45 Kopplungs-Fronten in einer Datei: 34 urteilen am Adress-Fächer `FAECHER(ev, f)` mit dem Export, den das Spiel liest, und je mindestens einer Attrappe oder einem Mutanten; 10 sind PANEL, 1 ist KORPUS.
**Gemessen:** headless nichts, denn die GPU-Wand hält jede Probe vor den Leitern an; die Selbstprobe ergibt 1998 Proben, 0 falsch, der Selbsttest 269 von 273 grün wie vorher.
**Offen:** der Lauf am Gerät für alle 34 Zahlen und jedes Bild, terraform#1 am Kopf main, R11 für die Panels und ein Korpus für erdsaat#1.

Karte 2 gebucht 77 von 1 718 (`vision/karte-2-stand.json`, heute 77).
