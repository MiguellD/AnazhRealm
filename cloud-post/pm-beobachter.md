# pm-beobachter — ZWISCHENSTAND (Meta-Gesetz M4: der Richter ist selbst eine Adresse)

Zweig `pm-beobachter` von `origin/punkte-maschine`. Karte 2 gebucht: 58 von 1 718 (unverändert: keine der neun Sprossen wird grün, jede urteilt jetzt über ihren Fächer und nennt, was fehlt).

## Geschnitten

- **Die Bauart** `meisterkarte-quelle/punkte/stationen/faecher.js` (3d3f0b244): `FAECHER(ev, f)`. Eine Station nennt vier Dinge, sonst nichts:
  - `gesetz {fn, export, leser}`: der Export, den das Spiel liest, und sein Leser mit Datei:Zeile;
  - `adressen {saaten, orte, zeiten, dazu}`;
  - `masse` mit dem Prädikat (`summe|max|min|mittel|anteil|anzahl|verschieden|erste|zaehle|steigung`), die Schwelle stellt die Karte;
  - `schlecht` + `pose`: EIN Bild an der schlechtesten Adresse.
  - Die Bauart ruft das Gesetz je Adresse als Funktion in der EINEN warmen Welt, `(r, T, a, mit)` → Wert oder `{fehlt}`. Sie gibt `werte`, `gemessen`, `fehler`, `fehlt` (das erste Fehlen), `schlecht`, `pose`, `akte` zurück. Eine Adresse ohne Fähigkeit ist `fehlt` mit Gesetz, Datei und Grund, nie ein Ersatzwert. Ist die Frist (`ms`) gerissen, sagt `gerissen` das.
- **Drei Anschlüsse** an die bestehenden Rahmen, keiner kopiert ein Gesetz:
  - K-Rahmen: `ev = K.welt`.
  - L-Rahmen: das k2-same-Gerüst, `seite: { FAECHER, LAW }`, `ev = (c, ms) => L.ev(c, ms/1000)`.
  - Planet-Kern: das Leiter-Flag `faecher: true`. Der Kern legt `FAECHER` in die Probe seiner Perspektive (`k2-planet.js` `perspektive`, 86ed5e3b7). Ohne das Flag ist die Probe byte-gleich.
- **technik#1** (`k2-mensch-wirtschaft.js`, 3d3f0b244) steht auf dem Fächer, der erste Beweis: das Urteil ALT = NEU ist byte-gleich (ohne die Akte des Fächers, `K.zahl` gleich).
- **Die neun Fronten „BUEHNE Saaten“** urteilen über den Fächer und rufen den Export, den das Spiel liest:

  | Sprosse | Commit | Gesetz (gerufen) | Leser im Spiel |
  |---|---|---|---|
  | mensch.fahrzeug.medium#2 | 8d0eba7e2 | vehicle-core.js:3474 `exportDrive` → :3662 `fahrGesetz` → :4146 `fahrSchritt` | stamm/gelaende-kollision.js:1238 |
  | mensch.nahrung.tier#2 | 8d0eba7e2 | koerper-core.js:5459 `tagesOrte` + :5630 `tagesPlan` (`TAGES_GESETZ` :5300) | stamm/siedlung-bewohner.js:2239 |
  | planet.kosmos.systeme#1 | c63d1fb33 | `r._kosmosJetzt()` gegen welt-licht.js `kosmosZeit` | stamm/bild-himmel.js:327 |
  | erleben.spieler.wegfindung#1 | 4eb975feb | stamm/vegetation-baum.js:1482 `_vegetationSampleSpawn` (Felsturm/-bogen) | dieselbe Methode (der Wurf) |
  | same.massstab.spanne#1 (#1–#4) | 442774faa | stamm/gelaende-boden.js:833 `_gelaende` (Lage, near/far, Auge) | stamm/koerper-bewegung.js:1759 `_loopCamera` |
  | planet.kopplung.bahn-klima#2 | 86ed5e3b7 | `r._planetAuftrag({type:"planet-ort"})` → voxel-worker.js:1425 `planetPlanVon`; Neigung aus planet-core `planetPlan` | voxel-worker.js:1436 |
  | same.kopplung.kohaerenz#1 | 5484b2f14 | gelaende-core.js:6107 `hydrosphaere` (im Faden, voxel-worker.js:1997) | stamm/gelaende-boden.js `_hydroFor` |
  | leben.evolution.fremde-physik#1 | 9c538d840, 3b0b864f5 | `state.gravity` → stamm/koerper-leib.js `_buildCreatureGroup` + tetrapoda `gangSchritt` | `_buildCreatureGroup` (der Guss) |
  | leben.oeko.netz#2 | 23da57666 | `NETZ_AN`: der Bestand über `LEBENSRAUM_GESETZ.gattung` (tetrapoda-core.js:2072), Fraß und Wiederkehr je Saat | stamm `_kreaturFrass` |

  Das Soll steht wie die Karte es schreibt: N, Schwellen und Bildpflicht. Bühnen-Schleifen fallen, die Gesetze bleiben: der alte SAATEN-Lauf (wegfindung), die Schleife über `netz-…` und der s1-Zweig in `welt` (kohaerenz).

## Gemessen

Selbsttest der Punkte-Maschine (`node punkte.cjs selbsttest --ohne 3c`): **269 GRÜN von 273, Exit 1**, nicht grün. An `origin/punkte-maschine` vor dem Schnitt war es ebenso: 269 von 273, dieselben vier ROT (BEFEHL TRÄGT · WACHE der Läufer nennt seinen Tod · WACHE DER TOD KOSTET NUR DIE LAUFENDE PROBE · LEBENSZEICHEN DES ZEUGEN). Der Schnitt bringt kein neues ROT und nimmt keines weg; die vier stehen im Offen.

Je Sprosse ein Lauf hier, ohne GPU (google/swiftshader). Die Bildpflicht jeder Sprosse ist darum **ungemessen** (kein Schuss ohne Gerät). Der Fächer ist die Zeit, die die Bauart über alle Adressen braucht; die Station ist der ganze Leiter-Lauf.

| Sprosse | Urteil | Zahl | Fächer | Station | ungemessen (Grund) |
|---|---|---|---|---|---|
| technik#1 (Beweis) | ROT an der Adapter (swiftshader), byte-gleich mit ALT | ohne Voraussetzung 0 (Soll ≤ 0) · Stände 4 (≥ 2) · Umfang 11 (≥ 10) | 21/21 in 11 ms | 0,02 s | Bild (kein Gerät) |
| medium#2 | ROT Umfang nicht erzeugbar | Bremsweg 100→0 38,63–45,39 m, im Band 100 %; 50→0 83 %; ≥ 130 km/h 120/120; die Saat ändert die Physik nicht | 120/120 (20 Saaten × 6 Orte) in 838 ms | 0,9 s | Spurrinne nach 10 Durchfahrten (kein Spur-Gesetz im Boden); Bild |
| tier#2 | ROT Umfang nicht erzeugbar | 0 Jäger je Saat, 0 Jagden je Tag (`TAGES_GESETZ` trägt keine Rolle, die jagt oder fischt) | 192/192 (8 Saaten × 24 Zeiten) in 9 488 ms | 9,5 s | Wildbestand unter der Jagd (ohne Jäger keine Jagd); Bild |
| systeme#1 | ROT Leser fehlt (der Mond) | 8 Planeten mit eigener Bahn, Himmel gegen Ephemeride max 0,022° über 365 Tage (Soll ≤ 0,5°) | 365/365 (ein Spieljahr) in 21–38 ms | Probe 34 s (Frist der L-Probe, s. Offen) | Mondphase je Woche im Bildpaar (der Mond hat keine Bahn); Bild |
| wegfindung#1 | ROT Leser fehlt (Wurf ohne Saat) | geladene Saat: 0 Landmarken in 1–3 km, im Kegel 0 | 1/51 in 1 ms; 50 Saaten `fehlt` | Probe 39 s (Frist, s. Offen) | 50 fremde Saaten (keine Fähigkeit); Bild |
| spanne#1 (#1–#4) | ROT Leser fehlt (Steigflug + Lage) | geladene Saat: near 0,1 m, Auge 2,1 m | 1/21 in 0 ms; 20 Saaten `fehlt` | Probe 44 s (Frist, s. Offen) | Steigflug 0,5 → 700 m (kein Verb hebt das Auge); 20 Saaten |
| bahn-klima#2 | ROT Umfang nicht erzeugbar | Neigung 3,1° → 10,77 K, 35,8° → 15,90 K, Erd-Saat 20,50 K; amp0 52,6 % (Soll ≤ 10 %), amp45-Faktor 0,776 (Soll ≥ 2) | 63/63 (Erd-Saat + 20 Saaten × 3 Breiten) in 2 022 ms | 2,7 s (0,7 s gecacht) | Versatz der Schneelinie (kein Leser); Bild |
| kohaerenz#1 | ROT Umfang nicht erzeugbar | geladene Saat: 50/50 Punkte bergab in Senke oder Meer, Anteil 100 % (Soll ≥ 95 % ✓) | 1/101 in 14 ms; 100 Saaten `fehlt` | 9,7 s | 100 fremde Saaten (Hydrosphäre nur für die Welt-Saat) |
| fremde-physik#1 | ROT Umfang nicht erzeugbar | Steigung 0 (Soll 0,75–1), Saaten je g 1 (Soll ≥ 50); g 0,3 / 1 / 3 ✓ | 3/153 (Erd-Saat × 3 g) in 492 ms; 150 Adressen `fehlt` | 1,4 s | 150 Adressen fremder Saaten (keine Saat trägt ihr g); Bild |
| netz#2 | ROT Umfang nicht erzeugbar | 4 Gattungen in 2 Ebenen (Soll 10¹ Arten in 4 Ebenen); Wiederkehr 0 %, Paare je Art 0,2 | 32/32 (32 Saaten × 100 Spieljahre) in 19 997 ms | 20,1 s (die alte Schleife schaffte 16 von 32) | Bild |

Stationszeit je Fächer: höchstens 19 997 ms (netz#2) ≤ 60 s. Der längste Leiter-Lauf auf dem Planet-Kern ist 20,1 s. Die drei L-Proben enden an ihrer Frist von 34, 39 und 44 s, erst nachdem jede Sprosse geurteilt hat.

## Offen

| Sprosse | Datei:Zeile | was fehlt |
|---|---|---|
| systeme#1 | welt-licht.js:814 `mondRichtung` (= −Sonne), stamm/bild-himmel.js:2793 | der Mond hat keine eigene Bahn, also keine Phase je Woche |
| wegfindung#1 | stamm/vegetation-baum.js:1482 `_vegetationSampleSpawn` | der Wurf liest die geladene Welt (`_saatJe` → `worldMeta.seed`, `_landAt`, `_hydroDistAt`, `_voxelSurfaceY`); er ist keine Funktion der Saat |
| spanne#1–#4 | stamm/gelaende-boden.js:833 `_gelaende`; stamm/koerper-bewegung.js:1759 `_loopCamera` | die Lage lebt nur für die geladene Saat; kein Verb hebt das Auge vom Leib (Steigflug) |
| bahn-klima#2, fremde-physik#1 | voxel-worker.js:1429 (`planetPlanVon` rechnet auf `P.PLANET_ERDE`); planet-core.js:319 | der Planet-Faden liest den Körper der Saat nicht: keine Neigung, keine Schwere je Saat |
| fremde-physik#1 | stamm/koerper-leib.js `_buildCreatureGroup` | der Guss liest keine Schwere (Quer-Maß 0 % über g × 10) |
| kohaerenz#1 | gelaende-core.js:6107 `hydrosphaere`, voxel-worker.js:1997 | die Hydrosphäre lebt nur für die Welt-Saat, der Planet-Faden antwortet ohne Flusslauf |
| netz#2 | tetrapoda-core.js:2072 `LEBENSRAUM_GESETZ.gattung` | 4 Gattungen in 2 Ebenen, kein Netz aus 10¹ Arten |
| medium#2 | vehicle-core.js:3474 `exportDrive` | liest keine Saat; ein Gesetz der Spur im Boden fehlt |
| tier#2 | koerper-core.js:5300 `TAGES_GESETZ` | keine Rolle, die jagt oder fischt |
| (Werkzeug) L-Proben systeme, wegfindung, spanne | k2-same-Gerüst `L.ev` | die Probe reißt ihre Frist (34/39/44 s), nachdem alle Sprossen geurteilt haben. Das war schon vor dem Schnitt so: die alte systeme-Fassung riss ebenso |
| (Werkzeug) Planet-Kern | k2-planet.js `perspektive` (EINE Probe je Perspektive) | `faecher: true` ändert die Probe der ganzen Perspektive. Gegen `origin/punkte-maschine` (1 969 Stationen) ändert sich die Probe in 254 Stationen, keine fehlt. Diese messen neu: die neun und die übrigen Leitern von evolution, oeko, zusammenspiel.planet und zusammenspiel.same. Die Probe je Leiter zu legen trägt den Abdruck |
| (Text) fremde Stationen | k2-planet.js:554, :996, :1014, :1067, :1146, :1191, :1280, :1437; k2-erleben.js:392, :497 | zitieren `voxel-worker.js:1159`; heute steht das Gesetz in :1425–1429 (`planetPlanVon`) |
| alle neun | — | hier ohne GPU gefahren: jede Bildpflicht ist ungemessen, bis die Sprosse am Gerät läuft |
| (Selbsttest) | meisterkarte-quelle/punkte selbsttest | vier ROT, vor dem Schnitt gleich: BEFEHL TRÄGT (die Mutante „vorher NICHT rot: karte2.mensch.kopplung.antwort#1, karte2.mensch.zeit.kausal#1“), zwei WACHE-Fälle (Absturz 0xC0000409, Tod der laufenden Probe) und LEBENSZEICHEN DES ZEUGEN (3 s Stille). Nicht im Schnitt dieses Zweigs |

## Tabelle: die übrigen roten Fronten (nur gelesen, keine neue Station)

Je Sprosse: das Gesetz (Funktion, Datei:Zeile im Spiel-Baum), die Adressen, die der Fächer bräuchte, und genau ein Urteil: „Fächer urteilt“ / „Fähigkeit fehlt: <was>“ / „braucht Bühne, weil <Grund>“.

Zählung (101 Sprossen):

| Gruppe | Fächer urteilt | Fähigkeit fehlt | braucht Bühne |
|---|---|---|---|
| KEINE STATION (55) | 9 | 16 | 30 |
| BUEHNE Umfang sonst (37) | 3 | 27 | 7 |
| BUEHNE Menge (6) | 0 | 6 | 0 |
| BUEHNE Kosmos (3) | 0 | 3 | 0 |
| **zusammen (101)** | **12** | **52** | **37** |

Gelesen, nicht gefahren: „Fächer urteilt“ heißt, die Zahl des Richters folgt aus einem Export, der je Adresse in der warmen Welt rufbar ist; ein Bild entsteht nur an der schlechtesten Adresse, ein Urteil eines Panels oder Prüfers bleibt ungemessen. Ob der Export ohne GPU läuft, zeigt erst die Station. „Fähigkeit fehlt“: das Gesetz oder sein Eingang für die Adresse fehlt. „braucht Bühne“: die Zahl entsteht erst im laufenden Bild, Ton, Gerät oder mit einem Spieler. Datei:Zeile im Spiel-Baum, Stand dieses Zweigs; ein Teil weicht von den Nummern der Front-Tafel ab.

### KEINE STATION (55)

| Sprosse | Gesetz (Funktion, Datei:Zeile in /home/user/spiel) | Adressen, die der Fächer bräuchte | Urteil |
|---|---|---|---|
| planet.geologie.platten#1 | planetPlan planet-core.js:312, planetPunkt :1880 (Leser Faden voxel-worker.js:1429) | 30 Samen × Raster der Region 10⁴ km² | Fächer urteilt (Gürtel ≥ 4:1; Blindpaar Schummerung ungemessen: Foto-Panel) |
| planet.geologie.vulkan#1 | lava gelaende-core.js:1835 (Leser stamm/feld-leben.js:2534) | Alter 0–10⁵ s × am Wasser 0/1 × Luft −10…35 °C | Fächer urteilt (Abkühlkurve ±30 %; Glutbild-2AFC ungemessen: Foto-Panel) |
| planet.geologie.gebirge#1 | felsBankung gelaende-core.js:4001, FELS.einfall :3352 | Wände je Saat in Kollisionszone und Kraton | Fähigkeit fehlt: Verformung aus der Geschichte (Einfallen fest 0,07 rad :3352; Kollision planet-core.js:1253 reicht nicht an die Wand) |
| planet.geologie.unterwelt#1 | dichteBasis gelaende-core.js:7278, hoehlenMund :2865, lageAus :6069 | 3 Saaten × Spalten eines km² (dichteSpalte :7255) | Fächer urteilt (Mündungen je km²; Mund im Fels an EINER Pose) |
| planet.geologie.lagerstaette#1 | felsStoff gelaende-core.js:5381 | Orte je Saat × Geschichte | Fähigkeit fehlt: Genese je Ort (felsStoff kennt Palette und Steile, nicht magmatisch, sedimentär, metamorph) |
| planet.relief.formschatz#1 | talgrund gelaende-core.js:1120, schichtOrt :2058 | 20 Saaten × Ego-Posen | braucht Bühne, weil die Zahl die Blind-Klassifikation je eines Ego-Bilds an 20 Saaten ist |
| planet.relief.boden#1 | felsStoffPunkt gelaende-core.js:5501 (Leser stamm/gelaende-boden.js:2766) | 30 Zufallsposen × Steile × Feuchte des Wirts | Fächer urteilt (Schutt am Steilen, Moos im Feuchten ±20 %; Blindpaar ungemessen: Foto-Panel) |
| planet.wasser.seegang#1 | _spiegelFeld stamm/bild-sicht.js:248 | 12 Posen (Uhr × Wetter) | braucht Bühne, weil spiegelTreue ein Bildmaß in Ausgabe-Größe an 12 Posen ist |
| planet.wetter.wolken#1 | wolkenFeld welt-licht.js:996 (TSL), _wolkenKarte stamm/bild-himmel.js:123, WIND_FELD phyto-core.js:4698 | Zeitraffer × Wetter | braucht Bühne, weil Wolke und Schatten nur im GPU-Pass entstehen und ihr Zug im Zeitraffer gemessen wird |
| planet.wetter.fremde-atmosphaeren#1 | ATMO_GESETZ foundry-core.js:289, atmoTafeln welt-licht.js:257 | 2 Uhren (Mittag, Abend) | braucht Bühne, weil die Himmelsfarbe erst in den GPU-Tafeln atmoTafeln entsteht und zwei Bilder braucht |
| planet.zeit.archiv#2 | schichtMass gelaende-core.js:1041, felsBankung :4001 | 1 Wand (schichtOrt :2058) | Fähigkeit fehlt: Gesteinsart je Lage aus dem Milieu (schichtMass kennt nur hart und weich) |
| planet.erde.gestalt#1 | PLANET_ERDE planet-core.js:264 (nur der Körper) | Erd-Saat × Region 10⁴ km² | Fähigkeit fehlt: Erd-Saat mit Schlüssel (kein Gesetz trägt Küste, Gipfel und Fluss der echten Erde) |
| planet.kosmos.welten#1 | planetPlan(samen, koerper) planet-core.js:312, ATMO_GESETZ foundry-core.js:289 | Heimat + 1 Fremdwelt × Mittag | Fähigkeit fehlt: Fremdwelt im Spiel (Faden pinnt PLANET_ERDE voxel-worker.js:1429, Himmel nur Erd-Luft) |
| leben.pflanzen.arten#1 | planForestCell phyto-core.js:3997 (Arten :4059), PRESETS foundry-core.js:4727 | 10 Gestalten × 10 Bilder | braucht Bühne, weil Blindtest (10 Bilder je Gestalt) und Herbar-Bildpaar am Bild urteilen |
| leben.pflanzen.lebenslauf#1 | forestTreeSize phyto-core.js:3273 (reverse-J), planForestCell :3997 | Zellen eines Bestands × Saaten | Fächer urteilt (Höhenhistogramm gegen Ertragstafel; die Lesung aus dem Bild an EINER Pose) |
| leben.pflanzen.dichte#1 | HALM_STUFEN foundry-core.js:3176, stamm/vegetation-wiese.js | Ringe 2–5/5–10/10–20 m an der Wiese | braucht Bühne, weil Boden-Sicht je Ring ein Bildanteil gegen Foto ist, dazu Bildpaar REF real-mischwald |
| leben.tiere.verhalten#2 | ETHOGRAMM_GESETZ tetrapoda-core.js:2136 | 1 Art × Takte einer Stunde | Fähigkeit fehlt: Ethogramm ≥ 30 Akte (es trägt ruhen, nahrung, ziehen, stehen; kein Alarmruf, Spiel, Komfort) |
| leben.tiere.lebenszyklus#2 | masseZurZeit leben-core.js:173, _kreaturGroesseSetzen stamm/kreatur-verhalten.js:590 | Alter 0 bis reif × Herde im Frühsommer | Fähigkeit fehlt: Proportion jung ↔ alt (der Leib skaliert gleichförmig, setScalar stamm/kreatur-verhalten.js:596) |
| leben.wasser.lebensraeume#2 | gewaesserArt gelaende-core.js:762, Erle am Saum phyto-core.js:4074 | Ufer-Punkte der geladenen Saat je Art | Fähigkeit fehlt: Küstenflachwasser als Art (gewaesserArt kennt see, bach, fluss; WASSER_GESETZ.koerper ohne Meer) |
| leben.wasser.bild#1 | WASSER_GESETZ.koerper foundry-core.js:151 (kd, c je Kanal), Art aus gelaende-core.js:762 | 3 Arten (Bach, See, Fluss) × 3 Kanäle | Fächer urteilt (Sichtweite aus c je Art gegen das Band; Bild an EINER Pose) |
| leben.evolution.zeitreise#1 | bestand leben-core.js:350, planForestCell phyto-core.js:3997 (beide ohne Welt-Zeit) | Gegenwart + Epoche −10⁴ a | Fähigkeit fehlt: Zeitsprung des Lebens (Flora und Fauna lesen keine Welt-Zeit; zeitMa liest nur Gelände und Planet) |
| leben.evolution.mikroben#1 | FELS.flechte gelaende-core.js:3381 | heiße Quelle, Watt, Fels | Fähigkeit fehlt: Matten-Gesetz (nur Flechten-Patina am Fels, keine Zonierung nach Temperatur und Licht) |
| mensch.leib.verschieden#1 | bauWurf koerper-core.js:1644, leibBau :1630, gesichtWert :5172 | 10 Bewohner × Siedlungen (Saaten) | Fächer urteilt (kleinster Paar-Abstand der Dials; Bild der schlechtesten Siedlung auf 2 m, Prüfer ungemessen) |
| mensch.leib.tracht#1 | EPOCHEN.tracht fachwerk-core.js:4273, epocheBei :4946 (Leser stamm/siedlung-bewohner.js:373) | 20 Saaten × Jahre | braucht Bühne, weil der Prüfer die Epoche an 20 Bildern ordnet (±1 Jh.) |
| mensch.leib.ausdruck#1 | tagesHaltung koerper-core.js:5440, _bewohnerGemuet stamm/siedlung-bewohner.js:2323 | 10 Bewohner × Stunden × Furcht | braucht Bühne, weil der Prüfer Akt und Gemüt aus der Silhouette errät |
| mensch.geist.innenleben#1 | _bewohnerGemuet stamm/siedlung-bewohner.js:2323 | 1 Bewohner × 4 Anlässe | Fähigkeit fehlt: 4 Gefühle mit Anlass (das Gemüt trägt nur Haltung und Furcht; kein Verlust, kein Fest, keine Freude) |
| mensch.stadt.groesse#1 | exportSettlement fachwerk-core.js:11120, DORF :5183 | Weiler je Saat | Fächer urteilt (Häuser ≥ 10, Zwillinge 0 aus dem Export; Bild am kleinsten Weiler; 2AFC ungemessen) |
| mensch.stadt.breite#1 | EPOCHEN (region) fachwerk-core.js:4273, epocheBei :4946 | 1 Familie × 6 Regionen | braucht Bühne, weil die Region aus dem Stadtbild erkannt wird (Panel) |
| mensch.stadt.messlatte#1 | exportSettlement fachwerk-core.js:11120 | 1 Straße 100 m, Tag | braucht Bühne, weil Blindpaar und vier Zählungen an derselben Kameralage im Vergleichstitel gefahren werden |
| mensch.bau.bedarf#1 | DORF fachwerk-core.js:5183 (Rolle je Los) | 50 Bauten | braucht Bühne, weil die Funktion blind am Außenbild zugeordnet wird |
| mensch.bau.huelle#1 | exportSettlement fachwerk-core.js:11120 | 1 Haus bei 10 m | braucht Bühne, weil der Paarvergleich Spiel ↔ Foto bei 10 m urteilt |
| mensch.fahrzeug.lenker#1 | _tickVerkehr stamm/siedlung-verkehr.js:928, _verkehrVorrang :673, VERKEHR_GESETZ fachwerk-core.js:5744 | 10 Fahrer × 1 h | braucht Bühne, weil die Fahrt nur im Takt des Wirts lebt (kein reiner Fahr-Kern), 1 h Spielzeit |
| mensch.nahrung.erdbau#1 | editForm gelaende-core.js:2547, _buildVoxelChunkWaterCells stamm/wasser-zellen.js:143 | 1 Graben an der Mess-Wiese | braucht Bühne, weil „gefüllt ≤ 2 s“ die Zeit vom Graben bis zum Wasser im Bild ist |
| mensch.macht.stand#1 | Wohlstands-Gesetz fachwerk-core.js:4257, exportSettlement :11120 | Häuser einer Stadt × Saaten | Fächer urteilt (Gini der Wohnfläche gegen das Band; arm/reich erkannt ungemessen: Panel) |
| mensch.kultur.verstaendigung#1 | TAGES_GESETZ koerper-core.js:5300 | Bewohner am Markt × Kultur | Fähigkeit fehlt: Gruß und Geste als Antwort (weder Tages-Gesetz noch Stamm tragen einen Gruß) |
| mensch.zeit.spanne#1 | epocheBei fachwerk-core.js:4946, EPOCHEN :4273 | 1 Zelle × 4 Jahre | braucht Bühne, weil die Blind-Datierung vier Bilder derselben Zelle ordnet |
| erleben.spieler.hand#1 | editForm gelaende-core.js:2547, _voxelEditedDensityGrid stamm/gelaende-boden.js:1580 | Eingaben an beiden Geräten | braucht Bühne, weil Taste → erstes Bild p95 ≤ 50 ms an beiden Geräten gilt |
| erleben.spieler.gemeinsam#1 | _p2pConnectToPeer stamm/netz-p2p.js:420 | 2 Spieler, 2 Geräte | braucht Bühne, weil Taste an A → Leib im Bild von B (p95) und Pixel-Abweichung zwei echte Fenster brauchen |
| erleben.schoepfen.satz#1 | _studioBlueprintForWord stamm/studio-wort.js:289 | Korpus ≥ 40 Sätze | braucht Bühne, weil Absicht am Ausgabebild, Brüche und Hänger > 100 ms im echten Fenster gelten |
| erleben.sinn.entdeckung#1 | ortSaatWahl gelaende-core.js:5876 | Orte einer Saat | braucht Bühne, weil ein Blind-Agent 10 min spielt und am Bild begründet |
| erleben.bild.ferne#1 | ATMO_RECHNUNG.betaKlar foundry-core.js:322, stamm/gelaende-fern.js | 12 Posen bis 0,2 km | braucht Bühne, weil Restkontrast und Ferne = Nähe (SSIM, ΔE) Bildmaße an 12 Posen sind |
| erleben.bild.flaeche#1 | _kontaktLeser stamm/bild-schatten.js:1634, _terrainGeologyAlbedo stamm/stoff-material.js:3262 | Wiese 10² m² × 5 Stoffe | braucht Bühne, weil Halbschattenbreite und Albedo im Bild gemessen werden |
| erleben.klang.musik#1 | scaleFor klang-core.js:54, progressionDeg :265 | Szenen × 10 min am Abgriff | braucht Bühne, weil Hörer-Blindtest und Abgriff am Audio-Ausgang (10 min) urteilen |
| same.physik.fluid#1 | _buildVoxelChunkWaterCells stamm/wasser-zellen.js:143 | 1 Grube unter dem Pegel | braucht Bühne, weil die Grube sich im Bild an beiden Geräten füllen muss |
| same.physik.feuer#2 | _brandFront stamm/feld-brand.js:112, STOFF_GESETZ schmiede-core.js:2862 | Wiese 2 000 Zellen × Wind × Hang | braucht Bühne, weil Bild-p95 ≤ 33 ms gilt, während 2 000 Zellen an beiden Geräten brennen |
| same.physik.stoffe#1 | STOFF_GESETZ schmiede-core.js:2862 | 10 Stoffe | braucht Bühne, weil die Blind-Jury Fallen, Brechen, Brennen sieht und hört |
| same.entfaltung.vielfalt#1 | samenBaum samen-core.js:84, ortSaatWahl gelaende-core.js:5876 | 10 Orte einer Welt | braucht Bühne, weil das Panel den Ort aus einem Zufallsbild wählt (dazu der Gegenlauf mit getauschter Ursache) |
| same.massstab.nahe#1 | HALM_STUFEN foundry-core.js:3176, schuttKornO gelaende-core.js:3716 | 100 Orte × Bild 2 m | braucht Bühne, weil das Spektrum an 100 Bildern gegen Fotos der Bodenklasse gemessen wird |
| same.massstab.sprung#1 | _reiseSaat stamm/gelaende-boden.js:1649, _reiseBetreten stamm/netz-portal.js:660 | Teleport 1 km | braucht Bühne, weil p95, t(ganz) und Lücke im laufenden Spiel an beiden Geräten gelten |
| same.preis.ankunft#2 | _ankunftsBild stamm/dirigent-ankunft.js:790 | Dorf 10² Häuser × ≥ 4 Boots je Gerät | braucht Bühne, weil t(Kontrolle) kalt und Bild-Diff an beiden Geräten gemessen werden |
| same.preis.eingabe#2 | getGamepads stamm/dirigent-takt.js:1453 | v1-Verben × Gamepad | braucht Bühne, weil INP ≤ 200 ms an G2 und G3 je Eingabe gemessen wird |
| leben.kopplung.leben-formt-planet#2 | hoehe gelaende-core.js:2821 (statisch, kein Abtrag) | 1 Hang × gerodet/bewaldet × Starkregen | Fähigkeit fehlt: Erosion mit Wurzel-Halt (Gelände ist f(L, x, z) ohne Abtrag über Zeit, liest den Bewuchs nicht) |
| leben.kopplung.evolution-planet#1 | lebensraumWahl tetrapoda-core.js:2186, bodenKlasse :2098 | Würfe × geladene und andere Saat | Fähigkeit fehlt: Boden-Klasse an anderer Saat (Fluss-Rand aus der Hydrosphäre nur der geladenen, voxel-worker.js:1997) |
| mensch.kopplung.kultur#1 | STILMODE fachwerk-core.js:213, EPOCHEN :4273 | 32 Saaten × Biom | Fähigkeit fehlt: Baustoff aus Boden und Klima (der Stil der Epoche wählt den Stoff, kein Leser von Boden oder Biom) |
| same.kopplung.erdsaat#1 | planetVulkane planet-core.js:1884 | Erd-Saat × Golf × Zeit | Fähigkeit fehlt: Erd-Saat (wie planet.erde.gestalt#1); planetVulkane legt Orte, kein Ausbruch von selbst |

### BUEHNE Umfang sonst (37)

| Sprosse | Gesetz (Funktion, Datei:Zeile) | Adressen, die der Fächer bräuchte | Urteil |
|---|---|---|---|
| planet.relief.wandel#1 | `_voxelSurfaceY` stamm/gelaende-chunks.js:2142 (Gesetz + Erdbau) | Saaten × 40 nasse Punkte × Zeiten 0…10 min | Fähigkeit fehlt: Abtrag und Ablagerung des Wassers in der Zeit |
| planet.wasser.gezeiten#1 | `waterLevel = base − meerUnterBasis` gelaende-core.js:6251 | Küsten-Saaten × Zeiten 0…25 h | Fähigkeit fehlt: Gezeit (der Spiegel kennt keine Uhr und keinen Mond) |
| planet.wasser.kreislauf#2 | `atlasSpiegel` gelaende-core.js:7799 | 20 Gruben 40–200 m vom See × Saaten | Fähigkeit fehlt: Grundwasser-Spiegel als Volumen, Quelle am Spiegel |
| planet.wetter.lagen#2 | `wetterAt` phyto-core.js:4804 | 50 Saaten × Zeiten einer Frontpassage | Fähigkeit fehlt: Druckfeld und Wolkengattung |
| planet.wetter.klimazonen#2 | `TEMPERATUR` gelaende-core.js:1313 (0,11 K/m) | Saaten mit Gebirge × Breiten | Fähigkeit fehlt: Gebirge in Erd-Höhe (die Höhe ist gestaucht) |
| planet.wetter.extreme#1 | `pegelReihe` gelaende-core.js:1799 (Hub an der Krone gedeckelt, :1569) | Saaten mit Fluss × Tage nach 100 mm Regen | Fähigkeit fehlt: Überflutung der Aue |
| planet.kosmos.ereignisse#1 | `himmelSicht` welt-licht.js:1084 | Nächte × Stunden | Fähigkeit fehlt: Meteor-Körper |
| planet.kosmos.kunstwelten#1 | Welt-Gesetz stamm/daten.js:81 (schwere, himmel, wetter, gelaende); Prüfung stamm/speicher-welten.js:127 | Würfe × Orte im Zylinder | Fähigkeit fehlt: Drehzylinder (Schwere aus Drehung, Coriolis) |
| leben.tiere.mensch#2 | `_trittStufe` stamm/siedlung-wege.js:1712 | Saaten × Tiere × Spuren | Fähigkeit fehlt: Fährte und Losung der Tiere |
| leben.wasser.rhythmen#2 | `FISCH_GESETZ` tetrapoda-core.js:2847; Meer gelaende-core.js:2737 (meerUnterBasis 3) | Saaten × Mittag/Mitternacht | Fähigkeit fehlt: Vertikalwanderung, Zooplankton, Meer ≥ 200 m tief |
| leben.oeko.stoffe#2 | `_naehrstoffAt` stamm/vegetation-wiese.js:2338 | Zellen mit/ohne Klee × Spieljahre 0…5 | Fähigkeit fehlt: N und P getrennt, Leguminose |
| leben.evolution.stammbaum#1 | `GATTUNGEN` tetrapoda-core.js:62; `artId` leben-core.js:229 (Pfad leer) | 10 Arten × Saaten | Fähigkeit fehlt: Artbildung mit gemeinsamem Ahn |
| leben.evolution.erbe#1 | `kind` leben-core.js:141, `bestand` :350; Leser voxel-worker.js:493, stamm/kreatur-leben.js:2041 | Saaten × Gau-Takte bis ≥ 10 Generationen; Mutante `gruender` | Fächer urteilt |
| leben.evolution.muster#1 | `bestand` leben-core.js:350 (Auslese `rissGewicht` :219); Leser voxel-worker.js:652 | Saaten × {Räuber, ohne} × Gau-Takte | Fächer urteilt |
| leben.evolution.bauplan#1 | `_buildCreatureGroup` stamm/koerper-leib.js:2574 | 1 000 Zufalls-Genome | braucht Bühne, weil die Bewegung erst am gegossenen Leib entsteht (Ofen der Gattung); kein reiner Gang-Kern je Genom |
| leben.evolution.zivilisation#1 | `fluchtDistanzM` tetrapoda-core.js:2009 (eine Zahl je Gattung) | Saaten × Eltern-Kind-Paare | Fähigkeit fehlt: erbliches Verhalten (die Erb-Achse trägt nur lnM) |
| leben.evolution.fossil#1 | kein Gesetz des Fossils (gelaende-core.js) | 100 Fundstellen × Saaten | Fähigkeit fehlt: Fossil im Gestein |
| mensch.leib.spur#1 | `alterRegler`/`alterPyramide` koerper-core.js:1697/1704 | Alter 18…80 J. × Leiber | braucht Bühne, weil der Prüfer das Alter am Bild je Leib schätzt |
| mensch.fahrzeug.form#2 | `exportDrive(P)` vehicle-core.js:3474, `fahrGesetz` :3662; Leser stamm/koerper-fahrt.js:1061 | 50 Baupläne P × Querbeschleunigung | Fähigkeit fehlt: Kippen (die Ebenen-Klammer 0,7 rad, vehicle-core.js:3236) |
| mensch.fahrzeug.gestalt#1 | `FLOTTE` vehicle-core.js:4808; Leser stamm/siedlung-verkehr.js:232 | 10² Saaten × 5 Gattungen | braucht Bühne, weil „≥ 90 % erkannt“ ein Bild je Saat liest |
| mensch.nahrung.jenseits#1 | Rollen-Tafel fachwerk-core.js:2688; `DORF` :5183 | Saaten × Klima | Fähigkeit fehlt: Rolle Gewächshaus und Garten |
| mensch.kultur.gestalt#1 | `kulturFromSeed` fachwerk-core.js:2669 (`KULTNAMES` 28, :2661) | ≥ 10 Kulturen × Häuser | braucht Bühne, weil die blinde Trennung Häuser-Bilder von 10 Kulturen liest |
| mensch.kultur.diffusion#1 | `kulturFromSeed` fachwerk-core.js:2669 (EINE Kultur je Saat) | Orte an einer Grenze × Häuser | Fähigkeit fehlt: Mischung zweier Kulturen an der Grenze |
| mensch.kultur.strassenleben#1 | Sonderbau `gasthaus` fachwerk-core.js:2693 | 20 Gäste × Abend-Stunden | Fähigkeit fehlt: mehrere Lokale einer Gasse, Gericht aus Zutaten der Flur |
| mensch.zeit.erde#1 | Epochen-Tafel fachwerk-core.js:4275 (Region, Jahr) | EIN Erd-Ort × EIN Jahr | Fähigkeit fehlt: Schlüssel der Erde (Ort und Jahr → Plan) |
| mensch.zukunft.technik#1 | `technikStand` fachwerk-core.js:4358 (ohne Jahr); Epoche „zukunft“ vehicle-core.js:4920 | EINE Stadt × Jahr 0/+50 | Fähigkeit fehlt: Zeit-Achse der Technik |
| mensch.zukunft.medien#1 | `exportSettlement` fachwerk-core.js:11120 | 10 Flächen einer Straße | Fähigkeit fehlt: Bildflächen (Schild, Schirm, Leuchtschrift) |
| mensch.zukunft.maschinenwesen#1 | kein Gesetz eines Roboters (`MOTION` koerper-core.js:80 trägt den Menschen) | EIN Roboter × EINE Aufgabe | Fähigkeit fehlt: Roboter |
| erleben.schoepfen.teilen#2 | `peers` stamm/netz-p2p.js:406 | 1 Bauplan × fremdes Gerät | braucht Bühne, weil ein fremdes Gerät mit leerem Speicher eine zweite Sitzung ist, keine Adresse der Welt |
| erleben.schoepfen.schutz#2 | Korpus spec/abnahme/ki-feind-korpus.json; Leser scripts/diag-v1-pfad.cjs:2218 | 100 Injektionen | Fähigkeit fehlt: 93 Injektionen (der Korpus trägt 7) |
| erleben.sinn.legenden#1 | `journalAppend` stamm/dienst.js:385 | 200 Zeilen, davon 20 zufällig | Fähigkeit fehlt: Ort je Zeile des Tagebuchs |
| erleben.sinn.takt#2 | Welt-Uhr stamm/dirigent-takt.js:21 | 60 Minuten Spielgang | braucht Bühne, weil tote Minuten und Ansprüche eine Stunde Sitzung mit Spieler lesen |
| erleben.klang.landschaft#2 | `_verkehrWagenStellen` stamm/siedlung-verkehr.js:759; klang-core.js | 5 Biome × Tag/Nacht × Regen; 20 Wagen | braucht Bühne, weil die Kreuzkorrelation Bild ↔ Ohr je Biom Bild und Ton liest |
| same.massstab.physik#2 | `_freiLuftPacken` stamm/koerper-frei.js:1117 (½ ρ c_w A / m) | Körper 5 mm…5 m × Fallhöhen | Fächer urteilt |
| planet.kopplung.kaskade#1 | kein Gesetz der Rutschung (`_rutschung`, `_bergsturz` fehlen im Baum) | 20 Saaten × 1 Ereignis | Fähigkeit fehlt: Rutschung, die eine Straße sperrt |
| mensch.kopplung.leib#1 | `_bewohnerTracht` stamm/siedlung-bewohner.js:374 | 1 Platz × Regen/Sonne | Fähigkeit fehlt: Tracht nach dem Wetter |
| same.kopplung.gewalt#1 | `_brandEntfachen` stamm/feld-brand.js:440 | 1 km² × 100 Spieljahre | Fähigkeit fehlt: Zündung von selbst (Blitz) |

### BUEHNE Menge (6)

| Sprosse | Gesetz (Funktion, Datei:Zeile) | Adressen, die der Fächer bräuchte | Urteil |
|---|---|---|---|
| mensch.sport.kunst#1 | `MOTION` koerper-core.js:80 (ein Gang für jeden Leib) | 2 Leiber × 3 Künste | Fähigkeit fehlt: Können-Profil je Leib |
| mensch.menge.seuche#1 | `_bewohnerGenome` stamm/siedlung-bewohner.js:403 | 1 Person × Tage gesund/krank | Fähigkeit fehlt: Krankheit |
| mensch.stadt.habitat#1 | `DORF` fachwerk-core.js:5183 | 1 Siedlung × 10² Bewohner | Fähigkeit fehlt: Siedlung unter der Erde |
| mensch.nahrung.strom#2 | `tagesPlan` koerper-core.js:5630, `tagesOrte` :5459 | 10² Bewohner × 12:30 | Fähigkeit fehlt: Korb vom Feld zum Teller |
| mensch.wirtschaft.beruf#2 | `tagesHaltung(akt, rolle)` koerper-core.js:5440 | 10 Berufe × Werk-Stunden | Fähigkeit fehlt: Handlung je Beruf (die Haltung folgt dem Akt) |
| mensch.zukunft.leib#1 | `_bewohnerGenome` stamm/siedlung-bewohner.js:403 | 1 Bewohner × Gang | Fähigkeit fehlt: Ersatzglied |

### BUEHNE Kosmos (3)

| Sprosse | Gesetz (Funktion, Datei:Zeile) | Adressen, die der Fächer bräuchte | Urteil |
|---|---|---|---|
| planet.zeit.klimageschichte#1 | `planetKlimaGlobal(plan, zeitMa)` planet-core.js:2092 | Saaten × Jahre 0…100 | Fähigkeit fehlt: CO₂-Antrieb in Jahren |
| planet.kosmos.galaxien#1 | Sternfeld stamm/bild-himmel.js:283 | EINE Nachbargalaxie × Anflug | Fähigkeit fehlt: Galaxie-Körper und ein Leser des Umfangs |
| same.kopplung.terraform#1 | `WETTER_WORT` stamm/daten.js:59; Niederschlag planet-core.js:1998 | Ziel und Lee × mit/ohne Eingriff | Fähigkeit fehlt: Eingriff in den Regen einer Region |

