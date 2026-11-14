# Ozean, Wasser und Eis

## Die Vision hier

Ein Planet, dessen Wasser EIN Körper ist: 70 % Ozean bis 11 km tief, durch den die Gezeiten zweimal am Tag laufen, durch den Strömungen wie der Golfstrom Wärme tragen, und dessen Dünung aus einem Sturm 3 000 km entfernt an einer Steilküste bricht. Der Spieler steht am Strand und sieht dieselbe Welle, die er eine Stunde zuvor vom Schiff aus auf hoher See sah; er wartet sechs Stunden, und das Watt liegt trocken; er taucht ab, und das Licht verliert erst sein Rot, dann sein Grün, bis bei 1 000 m nur noch Leuchten von Lebewesen bleibt; auf der Sohle des Grabens rauchen die Schlote des Rückens. Jeder Fluss, jeder See, jeder Aquifer und jeder Gletscher ist ein Glied desselben Kreislaufs: die Sonne hebt das Wasser aus dem Meer, der Wind trägt es über die Berge, der Regenschatten macht die Wüste, das Eis bindet es für Jahrtausende. Und die Menschen leben mit diesem Wasser: Megastädte, gegen die die Bucht von Tokio ein Dorf ist, ringen ihm Land ab mit Deichen, Poldern und Kanälen, zehntausend Schiffe fahren auf den Strömungen, Surfer reiten die Brecher, die der Meeresboden formt — und die Sturmflut bricht den Deich, wenn die Gezeit und der Orkan sich treffen. Reist der Spieler in der Zeit, steigt und fällt der Meeresspiegel um 120 m, die Doggerbank wird Land, das Mittelmeer trocknet aus und füllt sich in einer Flut wieder; reist er zu anderen Planeten, findet er Methanmeere unter orangem Himmel, Ozeane unter kilometerdickem Eis und Wasserwelten ohne einen Fels über dem Spiegel. Alles davon aus EINEM Samen, im Browser, ohne Download, bei 33 ms.

## Das Beste der Gegenwart

- **Sea of Thieves** (Rare, SIGGRAPH 2018 „The Technical Art of Sea of Thieves"): Ozean nach Tessendorf-FFT (2001), Farbe aus Blickwinkel, Sonne und Kamm-Maske, Spritzer per Flachwasser-Gitter (Mei et al. 2007). Grenze: keine Gezeiten, keine Strömung als Gesetz, keine Küsten-Brandung aus dem Meeresboden, eine handgebaute Inselkarte.
- **Horizon Forbidden West** (Guerrilla, SIGGRAPH 2022): brechendes Meer, Fluss, Wasserfall, Tauchen mit Unterwasser-Licht — von Hand geformt, je Kachel gebacken und gestreamt. Grenze: Gestalt statt Gesetz, Gigabytes.
- **Crest Ocean** (Unity): Seegang-Kaskaden, Dämpfung im Flachen nach Wassertiefe, Schaum am Ufer; die eigene Doku nennt realistische Brandung „ein offenes Problem". Grenze: die Küste braucht registrierte Geometrie, kein Kreislauf.
- **Browser heute** (web-ocean, luma.gl): Tessendorf-FFT mit JONSWAP-Spektrum, sechs Kaskaden à 256², in WebGPU. Grenze: nur offene See, kein Land, keine Küste.
- **From Dust / Timberborn / Cities: Skylines**: Wasser staut, trägt ab, trocknet aus, Dämme und Kanäle des Spielers verändern es — auf kleinen Inseln bzw. Blöcken bzw. einer Kartenkachel. Grenze: kein Meer mit Gezeit, keine Ferne, die Stadt kennt kein Klima ihres Wassers.
- **Subnautica**: ein ganzes Spiel unter dem Spiegel, Tiefenzonen mit eigenem Licht. Grenze: ein handgebautes Becken von wenigen km², Tiefe ~1,7 km, keine Gesetze von Licht und Druck.
- **Wirklichkeit, Gezeiten** (FES2014, Lyard et al. 2021): 34 Partialtiden auf 1/16°, an Küsten RMS ~24 cm; die Physik ist bekannt, die Schranke ist nur die Auflösung im Flachen.
- **Wirklichkeit, Eis** (PISM, Ji et al. 2021; letzter Glazialzyklus): Eisschilde wachsen und brechen über 120 000 Jahre, Meeresspiegel −100 bis −130 m am Glazialmaximum, Erdkruste federt nach (GIA). Grenze: Stunden auf Großrechnern je Lauf, kein Erleben.
- **Planetare Generatoren** (Gleba, Planet Hex, Worldengine): Platten, Klima, Regen und Oberflächenströmung auf einer Kugel. Grenze: Karten, keine begehbare Welt; selbst Hobbyisten berichten, dass zur Erzeugung von Meeresströmungen kaum Literatur existiert.

## Der Same

**Das Wasser ist EIN Erhaltungsgesetz auf dem Geoid: Masse, Impuls und Wärme bleiben erhalten, angetrieben von nur drei Quellen — Schwere (Mond, Sonne, Rotation), Sonne (Verdunstung, Dichte) und Wind.** Aus der Flachwasser-Gleichung auf der rotierenden Kugel folgen Gezeiten (Mond-Potential), Strömungen (Wind + Coriolis + Dichte), Dünung (Wind-Spektrum, ausgebreitet nach der Dispersionsrelation ω² = g·k·tanh(k·h)) und Brandung (dieselbe Relation im Flachen); aus der Phase des Wassers am Temperaturfeld folgen Meereis, Gletscher und Schnee; aus der Bilanz Verdunstung − Niederschlag folgen Flüsse, Seen, Aquifere und Wüsten; aus der Absorption je Wellenlänge folgt das Licht unter dem Spiegel. Der Spieler sieht immer nur eine Auswertung dieses Gesetzes an Ort × Zeit × Maßstab — nie einen gespeicherten Ozean. Wer eingreift (Spieler, Stadt, Schiff), ändert die Randbedingung, nicht eine Kopie des Wassers.
Gelöst haben das die **Ozeanographie** (spektrale Seegangsmodelle WAM/WaveWatch III: eine Wellen-Energiedichte je Ort, Frequenz und Richtung, statt einzelner Wellen — genau die Darstellung, die ein Spiel lokal zu einer sichtbaren Welle entfalten kann) und die **Gezeitenrechnung** (die harmonische Zerlegung nach Doodson: eine Gezeit ist eine Summe weniger Sinuswellen mit Amplitude und Phase je Ort — eine Funktion der Zeit, nie ein Zustand). Beides ist das, was das Projekt braucht: ein Feld von Parametern, das man an jedem Punkt und zu jeder Zeit auswertet, ohne zu integrieren.

## Der Preis (gilt in JEDER Zeile)

**P** = Bild p95 ≤ 33 ms an Radeon 890M UND GTX 1060 · Ankunft kalt ≤ 5 s · 0 Byte Download über das Skript hinaus. Die Preis-Spalte jeder Sprosse nennt P und die LAST, unter der P gelten muss (im Orkan, während der Flut, beim Abtauchen, nach dem Zeitsprung). Eine Sprosse ohne gehaltenes P zählt nicht, auch wenn Umfang und Tiefe stehen.

**Stand-Marken:** **M** = die Mechanik steht im Code und ist gemessen (headless oder an einer Pose), aber P ist gerissen (Ankunft 11–17 s) oder das Bild ist ungemessen — zählt 0. **·** = nichts. Heute hält auf diesem Blatt KEINE Sprosse alle drei Achsen.

## Die Leitern

### W1 Seegang — die See, wie ein Seemann sie liest
Misst, ob die Wasseroberfläche vom Teich bis zum Orkan-Ozean und vom Horizont bis zur Brandung so aussieht und sich so verhält, wie die Wirklichkeit es tut.

| Sprosse | Umfang | Tiefe | Preis | Richter (im echten Spiel, misst das Ergebnis) | Stand |
|---|---|---|---|---|---|
| 1 | eine Wasserfläche, ein Wetter | spiegelt Ufer und Himmel | P | spiegelTreue ≥ 0,6 an 12 Posen (Uhr × Wetter) in Ausgabe-Größe | M (0,73 an EINER Pose, GTX) |
| 2 | Meer, See, Fluss je eigene Bewegung | Weißkappen-Anteil wächst mit dem Wind wie in der Wirklichkeit | P, beide Geräte | Weißkappen-Anteil im BILD bei Wind 5/10/20 m/s gegen Monahan ±30 % | M (Kurve im Gesetz auf 3 %, Bild ungemessen) |
| 3 | offene See bis 2 km Sicht | Seegang aus Wind × Fetch, Beaufort 0–12 erkennbar | P im Sturm | Blindtest: 10 Bilder je Beaufort-Stufe, ≥ 70 % richtig zugeordnet gegen Foto-Satz der Beaufort-Skala | · |
| 4 | jede Küste einer 10-km-Region | Brandung aus der Tiefe: Wellen werden kürzer, steiler, brechen; Brechertyp (Schwall, Sturz, Reflexion) folgt der Strandneigung | P am Strand bei Brandung | Bildvergleich Ego am Strand gegen Fotopaar flacher/steiler Strand; Brechlinie im Bild bei Tiefe 1,3·H ±20 %; Brechertyp gegen Iribarren-Zahl ≥ 80 % richtig an 20 Stränden | · |
| 5 | Ozean bis Horizont (≥ 50 km Sicht) | Dünung eines fernen Sturms läuft ein, Wellen kreuzen sich, Schiffswellen-Keil | P mit Sicht 50 km | Sturm-Probe: Sturm 500 km weg gesetzt, Ankunft der Dünung an der Küste ±15 % der Gruppen-Laufzeit; Kelvin-Winkel im Bild 19,5° ±2° | · |
| 6 | Orkan, Kaventsmann, Tsunami | Wellen ≥ 25 m im Sturmfeld mit realer Häufigkeit; Tsunami läuft mit √(g·h) und steigt an der Küste auf | P im Orkan und beim Auflaufen | Häufigkeit von H > 2·Hs in 1 h Seegang gegen Rayleigh/Messbojen ±50 %; Tsunami-Laufzeit über 1 000 km ±10 % | · |
| 7 | ganzer Planet, jede Küste, jede Stunde | jede Welle an jeder Küste ist die Fortsetzung desselben Ozean-Felds; Gischt, Salzdunst, Schaumteppiche | P an jeder Pose, Flug Schiff → Strand ohne Bildriss | 100 zufällige Küstenposen aus 10 Saaten × 12 Uhr/Wetter: ≥ 80 % im Blindtest von Fotos nicht sicher unterschieden; dieselbe Wellengruppe im Bild vom Schiff und vom Strand (Kreuzkorrelation ≥ 0,7) | · |
| 8 | fremde Meere auf fremden Planeten | Methan-See (Titan, g = 1,35), Wasserwelt mit 100 km Ozean, Lava-Meer: Wellen gehorchen deren Schwere, Dichte, Viskosität | P | Wellenlänge-Periode-Paar je Welt gegen die Dispersionsrelation mit deren g und ρ ±10 %; Bild gegen Raumsonden-Referenz | · |

### W2 Der Spiegel in der Zeit — Gezeiten, Sturmflut, Meeresspiegel der Äonen
Misst, ob der Meeresspiegel eine Funktion der Zeit auf allen Skalen ist: Stunde, Sturm, Jahrhundert, Eiszeit, Äon. (Der Binnen-Pegel nach Regen ist W6.)

| Sprosse | Umfang | Tiefe | Preis | Richter | Stand |
|---|---|---|---|---|---|
| 1 | das Meer hebt und senkt sich | halbtägliche Mondgezeit (12 h 25 min), Spring- und Nipptide | P über 24 h Spielzeit | Watt fällt sichtbar trocken: benetzte Fläche im Bild bei Ebbe vs. Flut, Periode ±2 % | · (Spiegel ist Konstante) |
| 2 | jede Küste eigene Gezeit | Tidenhub aus Schelfbreite und Buchtform: 0,3 m offener Ozean bis ≥ 12 m in trichterförmiger Bucht; Orte ohne Gezeit (amphidromische Punkte) | P | N = 20 Küsten aus 5 Saaten: Tidenhub gegen Resonanz-Vorhersage ±30 %; ≥ 1 Bucht > 8 m je 10⁴ km² Küste | · |
| 3 | Sturmflut und Tsunami-Überflutung | Windstau + Luftdruck + Gezeit addieren sich, Wasser dringt in Ebenen und Städte | P während der Flut | Flut-Probe: Windstau-Höhe gegen Formel (∝ U²·Fetch/h) ±30 %; überflutete Fläche im Bild deckt die Tiefenkarte ≥ 90 % | · |
| 4 | Jahrhunderte | Meeresspiegel steigt mit Erwärmung, Küsten wandern, Häfen verlanden | P; Zeitsprung 100 Jahre ≤ 5 s bis Bild | Zeitsprung-Probe: Küstenlinie verschiebt sich um Δh / Strandneigung ±25 % | · |
| 5 | Eiszeit-Zyklus (10⁵ Jahre) | −120 m am Glazialmaximum, Landbrücken begehbar, Schelfe trocken | P; Zeitsprung ≤ 5 s | Zeitsprung −21 000 Jahre: trockene Schelf-Fläche gegen Hypsometrie der Saat ±10 %; Landbrücke im Bild begehbar | · |
| 6 | geologische Ereignisse (10⁶–10⁸ Jahre) | Becken trocknet aus (Verdunstung > Zufluss) und füllt sich in einer Flut; Meeresspiegel +70 m ohne Eis | P; Zeitsprung ≤ 5 s, Ereignis in Echtzeit abspielbar | Salz-Probe: Becken mit Bilanz < 0 fällt in Zeit V/(E−P) ±30 % trocken, Salzschicht sichtbar | · |
| 7 | Äonen und fremde Monde | Gezeiten aus jedem Mond × Abstand (früher Mond näher: Hub ×3), Gezeitenkräfte heizen Eismonde | P | Tidenhub skaliert mit M_Mond / d³ ±10 % über 5 Konfigurationen; Bild der Gezeit eines Doppelmond-Planeten | · |

### W3 Strömung — das Wasser, das Wärme und Dinge trägt
Misst, ob Wasser fließt, wohin die Physik es treibt: Flüsse, Küstenströme, Ozeanwirbel, die Umwälzung.

| Sprosse | Umfang | Tiefe | Preis | Richter | Stand |
|---|---|---|---|---|---|
| 1 | Flüsse einer Region treiben | Strömung längs Gefälle trägt Schwimmer, Boot, Tier | P | Treibgut-Probe an 4 Fluss-Orten > 0,5 m in 90 Takten, im Spiel mit Bild | M (4/4 headless) |
| 2 | sichtbares Fließen | Strähnen, Wirbel hinter Steinen, Kehrwasser, die Oberfläche zieht mit dem Wasser | P, beide Geräte | optischer Fluss zweier Bilder 0,5 s auseinander: längs/quer ≥ 1,5 und Richtung ±20° der Strömung an 12 Posen | · (kein Werkzeug) |
| 3 | Küste und Mündung | Brandungsrückstrom, Küstenlängsstrom, Gezeitenstrom in Engen, Salzkeil im Ästuar | P | Treibgut am Strand: Rip-Ströme ≥ 1 je 500 m brandender Küste, Treibrichtung gegen Wellen-Einfallswinkel ±20° | · |
| 4 | Ozeanbecken 10³ km | Wirbel mit verstärkter Westrand-Strömung, Auftrieb an Westküsten (kaltes Wasser, Nebel, Wüste daneben) | P | Flaschenpost-Probe: 100 Treibkörper, 1 Spieljahr; ≥ 70 % folgen dem Wirbel des Beckens; Westrand-Strom ≥ 3× schneller als Ostrand | · |
| 5 | planetare Zirkulation | Umwälzung trägt Wärme polwärts; Küstenklima folgt der Strömung | P | Temperatur zweier Küsten gleicher Breite unterscheidet sich ≥ 5 K mit richtigem Vorzeichen zur Strömungsrichtung, 10 Saaten | · |
| 6 | Strömung in der Zeit | Umwälzung kippt bei Süßwasser-Puls, Klima der Küsten springt | P; Zeitsprung ≤ 5 s | Kipp-Probe: Süßwasser-Eintrag über Schwelle → Umwälzung −50 %, Küstentemperatur fällt im Bild | · |
| 7 | fremde Ozeane | Strömung bei anderer Rotation, anderem Kontinent-Muster, Ozean unter Eis | P | Wirbel-Zahl je Halbkugel folgt der Rotationsrate (Rossby-Radius) ±1 über 5 Welten | · |

### W4 Gewässer und Küsten — die Kraft, Formen aus Prozessen zu erzeugen
Misst NICHT, wie viele Typen gebaut sind, sondern ob die Form am Ort aus den Prozessen am Ort folgt — und wie viel der realen Vielfalt dabei ungefragt entsteht. Kein Typ wird gesetzt; der Richter fragt nur das Bild. Stichproben: N zufällige Saaten × zufällige Orte.

| Sprosse | Umfang | Tiefe | Preis | Richter | Stand |
|---|---|---|---|---|---|
| 1 | Fluss + Meer einer Region | Flussnetz aus Gesetz, jeder Lauf mündet | P | Läufe enden in See oder Meer: alle (heute 293/293) | M |
| 2 | Region (2 km): Fluss, See in Senke, Wasserfall, Schelf und Kontinentalhang | das Ufer liest als Ufer | P | Anteil plausibler Ufer-Bilder an 50 Zufallsorten aus 10 Saaten ≥ 70 % | M (Formen stehen, Bild ungemessen) |
| 3 | 10 km Küste und Binnenland | Prozess → Form: Strand, Kliff, Delta, Lagune, Altarm, Moor erscheinen dort, wo Wellenenergie, Tidenhub, Sediment und Gefälle sie verlangen | P | 200 Orte aus 20 Saaten: Blind-Klassifikation des BILDES stimmt mit dem Typ, den die Prozessgrößen des Orts vorhersagen, ≥ 70 % | · |
| 4 | 10⁵ km² | Vielfalt emergent: Fjord nur nach Vergletscherung, Atoll nur über sinkender Vulkaninsel, Mangrove nur in den Tropen | P | gegen eine externe Küsten- und Gewässer-Taxonomie (~30 Klassen): in 100 Saaten tauchen ≥ 80 % der Klassen ungefragt auf; Fehlplatzierung < 5 % in 1 000 Fundorten | · |
| 5 | Küstenlinie mit realer Fraktalität | Küsten-Dimension, Inseln und Seen nach den Potenzgesetzen der Erde | P von Korn- bis Satellitenpose, Kosten nie an Küstenlänge | Box-Counting der Küste aus Satellitenpose: D ±0,05 gegen Erd-Küsten; Seen-Zahl je Größenklasse, Steigung ±20 % | · |
| 6 | Kontinent (10⁷ km²) | Abflussregime: große Ströme, Binnenbecken ohne Abfluss, Aquifer-Seen | P aus jeder Höhe | 10 Saaten: Anteil endorheischer Fläche 10–25 %; größter Strom trägt ≥ 10 % des Abflusses | · |
| 7 | Planet: ~10⁸ Seen, ~10⁶ Flüsse, ~10⁶ km Küste — jede begehbar | jede Küste aus Platte, Klima, Gezeit und Meeresspiegel erklärbar | P überall | 1 000 zufällige Gewässer-Posen aus 100 Saaten: ≥ 80 % im Blindtest gegen Fotos als echt bewertet | · |
| 8 | fremde Welten | Methan-Flussnetze, Kryo-Vulkan-Seen, Lava-Flüsse gehorchen deren Stoff und Schwere | P | Flussnetz-Statistik (Hack-Exponent, Horton-Verzweigung) im Erd-Band, Kanalbreite skaliert mit Schwere und Viskosität ±25 % | · |

### W5 Eis — vom Teich-Eis zum Eisschild
Misst die feste Phase des Wassers: wie viel Eis die Welt trägt, wie es entsteht, fließt, kalbt und den Spiegel bewegt.

| Sprosse | Umfang | Tiefe | Preis | Richter | Stand |
|---|---|---|---|---|---|
| 1 | Schnee einer Region | Schneedecke kommt und geht mit Saison und Höhe | P im Schneefall | Schneegrenze im Bild gegen die Nullgrad-Höhe des Klimas ±150 m an 10 Posen × 4 Jahreszeiten | · |
| 2 | Seen frieren zu | Eis wächst mit Frost, Salz senkt den Gefrierpunkt; Eis trägt erst ab tragender Dicke | P | Spieler geht auf dem See bei Frost, bricht bei Tauwetter ein; Eis-Einsetzen gegen Frostgrad-Summe ±20 %; Bild Eis gegen Foto | M (1 151 Schritte, 0 schwimmend, headless) |
| 3 | Meereis | Packeis, Schollen, Presseisrücken, offene Rinnen; Fläche folgt der Saison | P | Meereisfläche im Jahresgang: Verhältnis Winter/Sommer gegen Arktis ±30 %; Bildvergleich Scholle gegen Polarfoto | · |
| 4 | Gletscher | fließt, schneller wo dick und steil; Spalten, Moränen, Gletschertor, Gletschersee | P; Zeitsprung ≤ 5 s | Fließgeschwindigkeit 10–200 m/Jahr am Zeitsprung; Spaltenrichtung quer zur Zugspannung ±20° | · |
| 5 | Eiskappe und Schelfeis | Eisberg kalbt, treibt mit der Strömung, schmilzt; Schelfeis schwimmt | P beim Kalben | Kalbungs-Ereignis im Bild; Eisberg treibt ≥ 100 km in 1 Spieljahr mit W3 | · |
| 6 | Eisschild (10⁶–10⁷ km², 3 km dick) | Masse = Meeresspiegel: Eis bindet, Kruste sinkt ein und federt nach | P; Zeitsprung ≤ 5 s | ΔV_Eis / A_Ozean = Δh ±5 % (gekoppelt an W2 Sprosse 5) | · |
| 7 | Eiszeit hinterlässt Land | Trogtal, Fjord, Drumlin, Findling, Seenplatte entstehen, wo Eis lag | P; Zeitsprung ≤ 5 s | nach Eiszeit-Lauf: ≥ 80 % der Fjorde unter ehemaligem Eis, 0 in nie vereisten Breiten | · |
| 8 | Schneeball-Planet und Eismonde | Planet friert ganz (Albedo-Kippe), Ozean unter 20 km Eis mit Gezeitenheizung | P | Eis-Albedo-Kippe unter Strahlungs-Schwelle reproduzierbar in 10 Saaten; Bild Eismond gegen Raumsonden-Referenz | · |

### W6 Der Kreislauf — das Wasser als formende Kraft
Misst, ob Verdunstung, Wolke, Regen, Abfluss, Aquifer und Meer EINE Bilanz sind, und ob diese Bilanz das Land formt.

| Sprosse | Umfang | Tiefe | Preis | Richter | Stand |
|---|---|---|---|---|---|
| 1 | Region (2 km) | ein Sturm hebt den Fluss mit Verzug und Form realer Einzugsgebiete, Schmelze speist ihn, Dürre senkt ihn; die Bilanz geht auf | P beide Geräte | Pegel am Bach nach Sturm im Bild; Scheitel-Verzug gegen Einzugsgebietsgröße im Erd-Band; Bilanz Regen×Fläche ↔ ΔVolumen ±10 % | M (Bilanz 1,006 headless, Bild an beiden Geräten, Ankunft gerissen) |
| 2 | Aquifer sichtbar | Quellen, Brunnen, Feuchtgebiet wo der Aquifer-Spiegel das Gelände schneidet; die Grube unter dem Spiegel füllt sich | P | Grab-Probe: Grube unter Aquifer-Spiegel füllt sich bis zu ihm ±0,1 m; Quellen ≥ 90 % an Spiegel-Austritten | · |
| 3 | Kontinent | Regen entsteht aus Verdunstung über dem Meer + Wind; Luv nass, Lee Wüste | P | Niederschlag Luv/Lee ≥ 3:1 an 10 Gebirgen aus 5 Saaten; Wüstenanteil folgt Abstand zum Meer und Regenschatten | · (Regen ist Wetter-Stempel, das Meer kein Glied) |
| 4 | Wasser formt (10³ Jahre) | Flüsse schneiden Täler, Seen verlanden, Deltas wachsen | P; Zeitsprung ≤ 5 s | Delta-Wachstum über 1 000 Jahre gegen Sedimentfracht ±30 % | · |
| 5 | Planet | globale Bilanz Verdunstung = Niederschlag, Verweilzeiten je Speicher | P | markierte Wassermenge folgt der Verweilzeit je Speicher (Atmosphäre ~9 Tage, Ozean ~10³ Jahre) ±30 % | · |
| 6 | fremde Kreisläufe | Methan-Kreislauf, Wüstenplanet mit Polkappen-Wasser, Treibhaus-Ozeanverlust | P | je Welt: Bilanz geschlossen ±1 %, Phasen gehorchen deren Druck/Temperatur (Clausius-Clapeyron) | · |

### W7 Unter dem Spiegel — der Raum, der 70 % des Planeten ist (NEU)
Misst, ob der Spieler abtauchen kann und einen wahren Raum findet: Licht, Sicht, Boden und Tiefe bis zur Sohle des tiefsten Grabens.

| Sprosse | Umfang | Tiefe | Preis | Richter | Stand |
|---|---|---|---|---|---|
| 1 | ein See, ein Fluss, 0–10 m | Licht verliert je Kanal mit der Tiefe, trüber Fluss, klarer Bach, Sicht nach Trübung | P unter Wasser | Bild: Rot-Anteil fällt bis 5 m auf ≤ 30 %; waagrechte Sicht See/Fluss/Bach gegen Secchi-Referenz ±30 % | M (Wasser-Körper je Art im Gesetz `WASSER_GESETZ.koerper`, Bild ungemessen) |
| 2 | Küstenmeer 0–40 m | Kaustik, Sandrippel, Brandungs-Sog und Dünung spürbar unter Wasser | P beim Tauchen in Brandung | Blindtest 50 Unterwasser-Posen gegen Taucherfotos ≥ 60 %; Rippel-Abstand gegen Wellen-Orbital ±30 % | · |
| 3 | Schelf bis 200 m | Dämmerung, Sprungschicht, Kälte; der Boden folgt dem Schelf-Relief | P; Abtauchen 0 → 200 m ohne Frame > 50 ms | Lichtrest bei 200 m im Bild ≤ 1 % der Oberfläche; Sprungschicht im Temperatur-Profil des Tauchgangs | · |
| 4 | Tiefsee bis 11 km | Tiefsee-Ebene, Graben, Rücken mit Schloten aus den Platten; Dunkelheit unter 1 000 m | P; Abtauchen bis 11 km ohne Lade-Pause | Tiefen-Hypsometrie eines 100-km-Tauchprofils gegen Erde ±20 %; Schlote nur an Spreizungsrücken (Fehlplatzierung 0) | · |
| 5 | jeder Meeresboden des Planeten (~3,6·10⁸ km²) | stetig vom Satelliten bis zum Kiesel, Boden erzählt Platte, Sediment, Strömung | P überall | 500 zufällige Bodenposen aus 50 Saaten: Blindtest gegen Tiefsee-Fotos ≥ 60 %; 0 Löcher/Risse | · |
| 6 | fremde Ozeane | unter 20 km Eis, Methan-See, Hochdruck-Ozean einer Wasserwelt | P | Licht, Druck und Phasen gegen deren Stoff (Absorption, Clausius-Clapeyron) ±20 % | · |

### W8 Wasser in der Hand — Spieler, Schiff und Stadt greifen ein (NEU, Kopplung)
Misst, ob das Wasser auf Eingriffe antwortet und die Zivilisation mit ihm lebt — vom gegrabenen Graben bis zur Megastadt, die dem Meer Land abringt. Eingriffe ändern Randbedingungen des EINEN Gesetzes, nie eine Kopie.

| Sprosse | Umfang | Tiefe | Preis | Richter | Stand |
|---|---|---|---|---|---|
| 1 | ein Eingriff des Spielers | Graben füllt sich, Damm staut bis Überlauf, die Ferne zeigt es, der Reload bewahrt es | P beim Graben | Grube füllt ≤ 2 s; Stau-Höhe = Überlaufhöhe ±0,1 m; nach Reload dasselbe Bild (byte-Diff der Wasser-Maske 0) | M (1/2: Wasser der Grube kommt nach Reload nicht zurück) |
| 2 | Körper im Wasser | schwimmen, waten, Boot schwimmt und rollt in der Welle | P mit 10 Booten im Seegang | Tiefgang gegen Archimedes ±10 %; Rollperiode eines Boots gegen seine Eigenperiode ±20 % | · |
| 3 | Sport auf dem Wasser | Segeln, Surfen, Rudern, Tauchen gehorchen Wind und Welle | P | Segel-Polare im Spiel gegen reale Bootsklasse ±20 %; Surfer reitet nur an brechender Welle (W1 Sprosse 4), Ritt-Länge gegen Brechertyp | · |
| 4 | Siedlung am Wasser | Brunnen, Bewässerung, Furt, Hafen entstehen aus Bedarf × Gelände × Wasser | P | 10 Saaten: ≥ 70 % der Städte > 10⁵ Einwohner ≤ 10 km von Küste oder großem Fluss; Häfen nur in geschützter Bucht mit Tiefe ≥ Tiefgang | · |
| 5 | Megastadt am Meer (10⁷ Bewohner, Bucht ≥ 10³ km²) | Deiche, Polder, Landgewinnung, Kanalnetz, ≥ 10³ Schiffe auf Fahrrinnen und Strömungen | P an der Hafen-Pose bei vollem Verkehr | Schiffe: Tiefgang < Wassertiefe 100 %, folgen W3 sichtbar; Blindtest Hafen-Luftbild gegen reale Häfen ≥ 60 % | · |
| 6 | Katastrophe gekoppelt | Sturmflut (W2 3) bricht den Deich, flutet Stadtteile, Bewohner fliehen, Verkehr stockt, Küste wandert | P während der Flut in der Stadt | überflutete Fläche hinter dem Bruch = Tiefenkarte ≥ 90 %; ≥ 90 % der Bewohner verlassen die Zone; Verkehr auf gefluteten Trassen 0 | · |
| 7 | Planet × Epoche | jede Kultur jeder Epoche lebt mit IHREM Wasser: Qanat in der Wüste, Terrassen im Monsun, Lagunenstadt, Polder | P; Zeitsprung ≤ 5 s | 100 Saaten × 5 Epochen: Wassertechnik passt zu Klima und Gelände, Fehlplatzierung < 5 %; Blindtest Stadt-am-Wasser gegen historische Bilder ≥ 60 % | · |

## Stand heute (gegengelesen am Code von main, 14.11.)

- **Meeresspiegel ist eine Konstante**: Basis − 3 m (`gelaende-core.js:2687` Feld `meerUnterBasis: 3`, zweite Tafel derselben Zahl `gelaende-core.js:5630`, gelesen u. a. in `stamm/bild-himmel.js:479`); keine Gezeit, keine Sturmflut, keine Zeitachse des Spiegels. Grep nach Gezeit/Tide/Ebbe in Kernen und `stamm/`: 0 Treffer. **Bestätigt.**
- **Seegang**: drei Oktaven Wertrauschen als Dünung (`foundry-core.js:178-181` `welle.duenung` + `frequenz`, `stamm/bild-sicht.js:1316` `oceanSwell`); die Weißkappe ist seit w28 aus Monahan abgeleitet — Schwelle aus der Quantil-Kurve der Dünung, laut Gesetz auf 3 % für 0,0005 ≤ W ≤ 0,3 (`foundry-core.js:160-161`, `stamm/bild-sicht.js:1467-1484`). **Berichtigt:** das Literal crest 0,62 der Tiefen-Karte 11.11. steht nicht mehr im Code. Kein Spektrum, keine Dispersion, kein Brechen am Ufer — wohl aber ein Uferlinien-Schaum aus der echten Wassertiefe (`stamm/bild-sicht.js:1486-1494`, `WASSER_GESETZ.schaum.ufer`). spiegelTreue 0,73 an EINER Pose (GTX, alte Karte Gelände K3 1/2).
- **Strömung**: nur Flüsse; die Strömung des Bilds ist die des Gesetzes (`WG.wellen.adv`, `stamm/bild-sicht.js:1224-1228`), sie treibt Schwimmer, Boot und Tier an 4/4 Fluss-Orten headless (alte Karte Gelände K4). Ozean: keine Strömung. Fließen im Bild: kein Werkzeug.
- **Gewässer**: Flussnetz aus Gesetz, benannte Seen in Senken, Wasserfälle, Ozeantiefe mit Schelf und Kontinentalhang (`gelaende-core.js:1852-1857`), Hydro-Region 2 048 m. **Berichtigt:** die Höhe ist nicht hart bei 255 m gedeckelt, sondern weich — `255 + 12·tanh((h−255)/12)`, Asymptote ~267 m (`gelaende-core.js:1850-1851`); für ein Planeten-Relief (8,8 km Berg, 11 km Graben) bleibt das um zwei Größenordnungen zu klein. Kein Strand, kein Delta, kein Fjord, keine Lagune als Prozess.
- **Eis**: See-Eis nach Stefan mit Salz, Brack und Trägheit der Säule (`gelaende-core.js:1341-1422`, `eisDicke` ab 1386). **Bestätigt.** Trägt den Spieler (alte Karte Stoffe K3 2/2, headless); Schnee schmilzt in den Pegel. Grep Gletscher/Meereis in den Kernen: 0 Treffer.
- **Unter dem Spiegel**: Absorption und Sicht je Wasser-Art (See, Fluss, Bach) als Gesetz mit Quellen (Pope & Fry 1997, Zaneveld & Pegau 2003; `foundry-core.js:163-172`) — im ersten Blatt fehlte das ganz; im Bild ungemessen.
- **Kreislauf**: Pegel = Funktion von Regen und Welt-Uhr mit Nash-Kaskade, Snyder-Lag, Bodenwasser nach Maillet (`gelaende-core.js:1555-1582`, nicht nachgeprüft); Bilanz 1,006 headless, Bild an beiden Geräten (alte Karte Wetter K3 2/2). Der Regen kommt als Wetter-Stempel, nicht aus Verdunstung über dem Meer.
- **Preis**: Ankunft kalt 11–17 s (PFLICHT-OFFEN B) — damit hält keine Sprosse dieses Blatts P; alle M-Marken zählen 0. Ehrlicher Stand: **0 von 57 Sprossen gehalten, 8 mit stehender Mechanik.**

## Abhängigkeiten

- **Planet und Geologie** (zuerst): eine Kugel mit Platten und Meeresboden-Relief bis −11 km; ohne Kugel keine Coriolis-Kraft, keine Gezeit, keine planetare Strömung (W2 ab 2, W3 ab 4), kein Graben (W7 ab 4). Vulkan-Inseln für Atolle (W4 Sprosse 4), Spreizungsrücken für Schlote (W7 Sprosse 4).
- **Atmosphäre, Wetter und Klima**: Wind treibt Seegang (W1) und Strömung (W3); Verdunstung und Niederschlag sind die andere Hälfte von W6. Abgrenzung: Wolke und Regen gehören dort, Bilanz und Abfluss hier.
- **Verwitterung, Erosion und Boden**: Wasser schneidet, Wasser lagert ab (W6 Sprosse 4, W4 Delta); die Erosion gehört dort, der Abfluss als Antrieb hier.
- **Tiefe Zeit**: Zeitsprünge für W2 ab 4, W3 6, W5 ab 4, W6 4, W8 7 — der Zeitsprung ≤ 5 s ist deren Leiter.
- **Himmel und Sonnensysteme**: Mond-Massen und Abstände für die Gezeit (W2 Sprosse 7); fremde Planeten für jede oberste Sprosse.
- **Licht, Bild und Horizont**: Spiegelung, Unterwasser-Licht, Kaustik, Horizont ≥ 50 km (W1 ab 5, W7).
- **Physik und Stoff**: Auftrieb, Schiffe, Schwimmen in Wellen (W8 2–3); die Stoff-Tafel (ρ, c, L) für Eis und fremde Flüssigkeiten.
- **Leben im Wasser** (Abgrenzung): Fische, Riffe, Plankton, Biolumineszenz sind dort; Riff und Mangrove als Küstenform verlangen W4 Sprosse 4, das Leuchten der Tiefe W7 Sprosse 4.
- **Personen und Sport**: Schwimmen, Segeln, Surfen, Tauchen (W8 3) — die Bewegung des Körpers gehört dort, die Antwort des Wassers hier.
- **Siedlung und Stadt / Netze und Verkehr**: W8 4–7 ist die Naht; die Stadt baut, das Wasser antwortet; Schiffsverkehr fährt auf W3.
- **Kopplung, Kaskade und Katastrophe**: Tsunami (W1 6, W2 3), Eisschild-Kollaps → Meeresspiegel → Küstenstädte (W5 6 → W2 → W8 6); dieses Blatt liefert die Glieder, jenes die Kette.
- **Maßstab-Kontinuum**: W4 Sprosse 5 und 7, W7 Sprosse 5 verlangen Küsten und Böden, die vom Korn bis zur Satellitenpose stetig bleiben.
- **Ankunft, Geräte und Zugang**: P aller Leitern steht auf deren Ankunft ≤ 5 s.

## Was die alte Karte hier misst

- **Gelände K2 Das Wasser folgt jedem Edit** (1/2): Graben füllt sich ≤ 2 s, Damm staut bis Überlaufhöhe, Ferne zeigt den Edit → **W8 Sprosse 1** (im ersten Blatt ohne Heim); die Grab-Probe am Aquifer → W6 Sprosse 2.
- **Gelände K3 Wasser-Bild an jeder Pose** (1/2, spiegelTreue 0,73 an einer Pose) → W1 Sprosse 1; die Fließ-Anisotropie → W3 Sprosse 2 (als optischer Fluss im Bild).
- **Gelände K4 EIN Wasser-Spiegel für alle Leser** (2/2): Läufe enden in See oder Meer 293/293 → W4 Sprosse 1; Strömung treibt Schwimmer → W3 Sprosse 1.
- **Wetter K3 Der Wasser-Kreislauf** (2/2): Pegel nach Sturm, Lag, Bilanz, Dürre → W6 Sprosse 1 (eine Sprosse, nicht drei wie im ersten Blatt).
- **Stoffe K3 Phasen** (2/2): Eis trägt → W5 Sprosse 2; Schnee schmilzt in den Pegel → W6 Sprosse 1.
- **Speicher K4 Bild nach dem Neuladen** (1/2, das Wasser der Edit-Grube kommt nach dem Reload nicht zurück) → Teil des Richters von W8 Sprosse 1.
- **Leben in Luft und Wasser** (10/10): gehört zur Perspektive Leben im Wasser.
- Die alte Karte misst Gewässer nur in einer Region um Genesis: Meer, Gezeit, Strömung, Küstenform, Tiefsee, Gletscher, Meeresspiegel und Stadt-am-Wasser haben 0 Kriterien.

## Zweifel

- **Die Preis-Spalte ist die größte Wette.** Ob ein Planet-Ozean mit Gezeiten, Strömung und spektralem Seegang als reine Funktion f(Ort, Zeit) ohne integrierten Zustand auswertbar ist, ist unbewiesen; Strömungen, Eisschilde und Deichbrüche sind in der Wirklichkeit Zustandsgrößen mit Gedächtnis. Möglicherweise braucht W3 ab 4, W5 ab 6 und W8 ab 6 einen vorab gerechneten Zustand je Saat — das bricht P, oder es muss lazy und grob sein.
- **Die Blindtests** (60–80 %) sind gesetzt, nicht hergeleitet; wer die Fotos auswählt und wer blind urteilt (Mensch, Bild-Modell), entscheidet über die Härte der Leiter. Die Taxonomie in W4 Sprosse 4 muss EINE externe sein (nicht von uns geschrieben), sonst wird der Maßstab zur Bauliste.
- **Erd-Zahlen als Maßstab** (endorheisch ~18 %, Städte am Wasser ~75 %, Küsten-Dimension, Verweilzeit Ozean) sind aus dem Gedächtnis, in keinem Lauf nachgeschlagen; die Größenordnung stimmt, die Nachkommastelle nicht sicher.
- **Nähte** zu Atmosphäre (W6 3), Erosion (W6 4), Stadt (W8 4–7) und Sport (W8 3): dort muss die Gesamtkarte EIN Heim je Richter erzwingen, sonst zählen Sprossen doppelt.
- Fremde Welten (oberste Sprossen) haben als Referenz nur Raumsonden-Bilder geringer Auflösung; ihr Bildvergleich ist schwächer als die Zahl-Richter darunter. Ob der Spieler den Unterschied zwischen ±10 % und ±50 % auf Titan je fühlt, ist offen.

## Gegenlese — was sich änderte und was strittig bleibt

- **Zwei Leitern neu:** W7 „Unter dem Spiegel" (die Vision nennt 11 km Ozean, das Blatt hatte keinen Meter Tauchgang) und W8 „Wasser in der Hand" (Spieler-Eingriff, Sport, Stadt, Megastadt, Katastrophe — R7-Kopplung und die Tokio-Skala fehlten ganz; alte Karte Gelände K2 hatte kein Heim).
- **Doppelt gezählt, verschmolzen:** W2 S1 = W6 S1 = W5 S1 (dreimal „Pegel +0,2 m") → EIN Heim in W6 S1; W6 S1+S2 zu einer Sprosse; W6 S6 (Städte am Wasser) wandert nach W8 S4.
- **Fleiß → Fähigkeit:** W4 zählte gebaute Typen (4/10/30); jetzt richtet die Übereinstimmung Bild ↔ Prozessgrößen und der Anteil einer EXTERNEN Taxonomie, der ungefragt entsteht.
- **Richter, die eine Bauweise vorschrieben, ersetzt:** „Dünung aus Rauschen", „Spektrum nach JONSWAP", „Normalen-Anisotropie", „Eisdicke nach Stefan", „Lag nach Snyder/Maillet", „Seegang-Feld kostet nur am Schirm" → Ergebnisse im Bild (optischer Fluss, Frostgrad-Summe, Scheitel-Verzug, P unter Last).
- **Preis:** jede Zeile trägt jetzt P (Ankunft und Download eingeschlossen) plus die Last, unter der P gilt; „HEUTE" ersetzt durch M (Mechanik, zählt 0) — streng nach R3 hält das Blatt 0 Sprossen.
- **Stand nachgeprüft:** Meeresspiegel-Konstante und Stefan-Eis bestätigt; crest 0,62 ist nicht mehr im Code (Monahan-Quantil), Höhen-Deckel ist weich (~267 m), Ufer-Schaum und Unterwasser-Körper existieren und fehlten.
- **Strittig:** ob W8 S5–7 hierher gehören oder auf das Stadt-Blatt (hier stehen sie, weil der Richter das WASSER prüft); ob Blindtest-Schwellen ohne Herleitung als Punkte taugen; ob P bei Zustandsgrößen (Strömung, Eisschild, Deichbruch) überhaupt erreichbar ist — das ist die eigentliche offene Frage dieses Blatts.
