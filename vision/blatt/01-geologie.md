# Planet und Geologie: das Innere und die Kruste

## Die Vision hier

Jenseits der Gegenwart heißt: ein Planet, dessen Gestalt eine Geschichte ist — und eine Geschichte, die man bereisen kann. Was der Spieler als Gebirge, Küste, Vulkan, Krater oder Höhle sieht, ist die Spur von Wärme, die aus dem Planeten will: Konvektion trennt, verschluckt und schiebt Platten, Einschläge narben die Haut, Magma setzt neues Land. Aus EINEM Samen wächst eine Kugel mit Kontinenten und Ozeanböden, deren Höhenverteilung der Erde gleicht, und ihre Geschichte von 4,5 Milliarden Jahren — vom Magma-Ozean über Superkontinente bis heute — ist an jedem Zeitpunkt begehbar. Ein Vulkan bricht aus, sein Magma fließt sichtbar hangab, kühlt zu Pāhoehoe und ʻAʻā, lässt begehbare Lavaröhren zurück und setzt neues Land ins Meer. Beben reißen Stufen, wo Verwerfungen laufen, und Städte schwanken. Jede Felswand ist ein Archiv, in dem die Zeitreise nachprüfbar steht: die Kalkbank war Meer, und wer zurückreist, findet das Meer. Die Kruste ist ein Volumen bis zum Kern: Karsthöhlen von hundert Kilometern, Aquifere mit eigenem Spiegel, Lagerstätten dort, wo ein Prospektor sie aus den Zeichen der Landschaft vorhersagt. Und es bleibt nicht bei der Erde: Millionen Saaten tragen Welten von Mondgröße bis Super-Erde — Deckel-Tektonik, Venus-Glut, Io-Vulkanismus, Kryovulkane, Krater-Wüsten, Vulkane in Olympus-Mons-Größe —, jede im Browser in Echtzeit, vom Orbit bis in die Halle, ohne Download.

## Das Beste der Gegenwart

- **Dwarf Fortress** (Wiki „Layer", „Aquifer", „Cavern"): Gesteinsschichten nach realer Geologie, Erze nach Schicht, Aquifere, drei Kavernen-Ebenen, ein Magma-Meer. Grenze: ASCII-Kacheln, keine Platten, kein Fluss des Magmas als Form, keine sichtbare Wahrheit.
- **Space Engineers** (Community-Wiki „Planets"): Voxel-Planeten 19–120 km Durchmesser, Erze bis 150 m tief, alles grabbar. Grenze: Höhenkarten-Vorlagen, keine Tektonik, Erz zufällig statt geologisch.
- **No Man's Sky / Astroneer**: unbegrenzte Zahl begehbarer Planeten mit Höhlen und Rohstoffen. Grenze: Geologie ist Dekor; Planeten spielzeughaft klein, Gestalt ohne Geschichte.
- **Cortial et al., „Procedural Tectonic Planets"** (Computer Graphics Forum 2019): Platten, Subduktion, Kollision, Rifting auf einer ganzen Kugel. Grenze: Prototyp, Gestalt im 10-km-Maßstab, kein Boden zum Laufen.
- **Gleba** (in Entwicklung): Plattentektonik mit Orogenese und Erosion für erdgroße Planeten. Grenze: Weltgenerator, kein Spiel in Echtzeit.
- **Lava in Echtzeit**: SCA 2024 (2,5D-Modell mit Partikeln, RTX A6000), GPU-SPH nach Hérault et al. (Kruste und Röhren), INGV GPUFLOW. Grenze: Hochleistungs-GPU oder Offline, nie Laptop-Browser bei 33 ms.
- **Die Erde und ihre Nachbarn**: bimodale Hypsometrie (Kontinente ~+0,8 km, Ozeanboden ~−3,8 km), 7 Groß- und ~8 Mittelplatten, ~1 350 holozän aktive Vulkane, Gutenberg-Richter b ≈ 0,8–1,1, Mammoth Cave > 680 km, Son Doong mit 200-m-Hallen, ≈ 6 000 Mineralarten, ~200 erhaltene Einschlagkrater auf der Erde gegen gesättigte Mond-Hochländer, Olympus Mons 22 km bei 0,38 g. Das ist die Messlatte der Tiefe.

## Der Same

**Konvektion mit Bruch: Wärme will aus dem Planeten, und die starre Haut bricht dabei in Platten.** Aus wenigen Größen (Masse, Wärmefluss, Zusammensetzung, Alter, Einschlag-Geschichte) folgen das Plattenmuster, an dessen Rändern Gebirge, Gräben, Vulkanbögen und Bebengürtel, aus der Geschichte der Ränder Gestein und Schichtfolge je Ort, aus Gestein und Wasser die Höhle, aus Gestein, Hitze und Becken die Lagerstätte, aus Schwere und Alter die Kraterlandschaft. Die Erde ist eine Stichprobe dieses Gesetzes, nicht seine Vorlage.

Gelöst hat es schon: die **Geodynamik** (ASPECT/CitcomS, Plattenrekonstruktion GPlates), die **Exploration**, die aus Beckengeschichte („petroleum system") und Erzgenese VORHERSAGT, wo Lagerstätten liegen, die **Planetologie**, die aus Kraterdichte Oberflächenalter liest, und die **Stratigraphie**, die aus Schichtfolgen Umwelten rekonstruiert.

## Die Messweise (gilt für jede Sprosse)

- **P (der Preis)** = p95 ≤ 33 ms · Ankunft kalt ≤ 5 s · 0 MB Download, gemessen auf dem Profi-Band (Radeon 890M + GTX 1060). Die Spalte Preis nennt, WO P gemessen wird (am Ort des Ereignisses, im Abstieg, im Zeitsprung). Eine Sprosse ohne gehaltenes P zählt 0, auch wenn Umfang und Tiefe stehen.
- **Echtheits-Test** = blinde Bildpaare (Saat gegen reales Gegenstück, gleiche Kamera und Licht); die Jury wählt das echte Bild in ≤ 60 % der Paare (Zufall 50 %).
- **Ursachen-Probe** (für fremde Welten, wo keine Erd-Referenz trägt) = aus dem, was der Spieler sieht, schätzt eine blinde Jury oder ein auf Erde/Mond/Mars/Venus/Io/Europa geeichter Klassifikator die verborgene Ursache (Wärmefluss, Alter, Schwere, Zusammensetzung); Rang-Korrelation mit der wahren Saat ≥ 0,7. Eine Welt aus Gesetzen verrät ihre Ursache; eine Welt aus Zufall nicht.
- **Prospektor-Probe** = ein Spieler, der nur den sichtbaren Zeichen folgt, gegen blindes Suchen; gemessen wird das Verhältnis der Fundquoten.

## Die Leitern

### L1 Planetare Gestalt — Platten, Kontinente, Kugel
Misst, wie groß und wie wahr die Gestalt des begehbaren Planeten aus einem Tektonik-Gesetz ist.

| Sprosse | Umfang | Tiefe | Preis | Richter (Zahl oder Bildvergleich im echten Spiel — misst das Ergebnis) | Stand |
|---|---|---|---|---|---|
| 1 | ebene Welt ~10² km², Großform aus drei glatten Feldern, Flussnetz nach Stream-Power | Täler entwässern, Gebirge ohne Ursache | P am Spawn | Fläche, die der Spieler ohne Naht bei P begeht | HEUTE Umfang + Tiefe; P ROT (Ankunft 11–17 s) → zählt 0 |
| 2 | Region 10⁴ km² | Gebirge liegen in Gürteln, Gräben an Rissen — die Gestalt hat eine Ursache | P im Überflug | 30 Saaten: Gebirgsfläche > 2 km liegt in Gürteln mit Achsenverhältnis ≥ 4:1 in ≥ 70 %; Echtheits-Test Schummerungskarte gegen reale Region | |
| 3 | Kontinent 10⁶ km² | bimodale Hypsometrie, Schelf, Tiefseegraben | P im Überflug | 100 Saaten: Höhenhistogramm mit zwei Gipfeln (Abstand 3–6 km) in ≥ 90 % | |
| 4 | Kugel 4·10⁷ km² (Mondgröße), Orbit bis Boden ohne Lade-Bild | Horizontkrümmung, Gürtel umspannen die Kugel | P im ganzen Abstieg, 0 Bilder > 100 ms | Flug Orbit → Fußweg bei P; Echtheits-Test Orbitbild gegen Relief-Globus | |
| 5 | erdgroß 5·10⁸ km² | Hypsometrie gegen Erde KS ≤ 0,1, Rücken und Inselbögen bilden EIN globales Netz | P an 100 Zufalls-Orten | 100 erdähnliche Saaten: KS ≤ 0,1 und geschlossenes Rücken-Netz in ≥ 80 %; Echtheits-Test Globus ohne Wasser gegen Erd-Bathymetrie | |
| 6 | 4,5·10⁹ Jahre bereisbar, vom Magma-Ozean bis heute | Wilson-Zyklus, Superkontinente bilden sich und zerbrechen | P im Zeitsprung: beliebiges Alter ≤ 5 s bis Bild | 50 Saaten: ≥ 1 Superkontinent-Phase in ≥ 50 %; Drift 1–15 cm/Jahr; Zeitsprung an 20 Zufalls-Alter bei P | |
| 7 | 10⁶ Saaten von Mondgröße bis Super-Erde (0,01–10 Erdmassen) | Erd-, Deckel-, Venus-, erstarrte, Io- und Eiswelten folgen aus Masse und Wärme | P je Saat, auch auf der größten | Ursachen-Probe an 1 000 Saaten: Wärmefluss und Alter aus dem Orbitbild, Rang ≥ 0,7; 0 Saaten mit Naht oder Loch | |

### L2 Vulkanismus — fließendes Magma, das Land macht
Misst, ob Vulkane als Ereignis UND als Landform aus einem Magma-Gesetz entstehen und die Oberfläche bleibend formen.

| Sprosse | Umfang | Tiefe | Preis | Richter | Stand |
|---|---|---|---|---|---|
| 1 | Lava als Tat-Decke einer Zelle | Newton-Abkühlung, Glut über Draper-Punkt, erstarrt zu Stein, Dampf am Wasser; fließt nicht | P am Guss | erstarrt die Decke in der gerechneten Zeit und glüht sichtbar, bei P | HEUTE Tiefe; P ungemessen, Ankunft ROT → zählt 0 |
| 2 | ein Strom 1 km, ein Ausbruch | Strom fließt, bildet Front und Kruste | P neben dem Strom | Frontgeschwindigkeit auf 10° Hang 0,01–10 km/h; Echtheits-Test Clip gegen Ausbruchsfilm | |
| 3 | ein Vulkan wächst aus Ausbrüchen zu seiner Form | Schild, Strato, Caldera, Kegel ENTSTEHEN aus Magma-Zähigkeit, nicht aus Wahl | P am Kegel | 30 Saaten mit verschiedener Zähigkeit: Flankenneigung folgt ihr (Schild 2–10°, Strato 25–35°) in ≥ 90 %; Profil gegen reales Gegenstück ≤ 15 % | |
| 4 | Ausbruch formt bleibend: neues Land, Röhren | Pāhoehoe/ʻAʻā, begehbare Röhre, Küstenbank | P in der Röhre | nach Ausbruch: Landfläche wächst messbar, Röhre ≥ 500 m begehbar; Echtheits-Test Oberfläche | |
| 5 | Vulkanprovinz 10⁵ km² | Hotspot-Kette mit Altersprogression, Bögen über Subduktion | P im Überflug | 30 Saaten: ≥ 90 % der Vulkane an Rändern oder Hotspots; Alter längs der Kette Rang ≥ 0,8 | |
| 6 | planetar 10³ aktive Vulkane | Großeruption (VEI 7) koppelt in Himmel und Klima | P beim Ausbruch, am Ort und am Antipoden | 500–3 000 aktive Vulkane je erdgroßer Saat; nach VEI 7 sinkt die Welt-Temperatur 0,5–2 K für 1–3 Jahre | |
| 7 | Magma formt Planeten über Äonen | Magma-Ozean erstarrt, Flutbasalte 10⁶ km², Io-Welten, Kryovulkane, Schildvulkane wachsen mit sinkender Schwere | P je Saat und im Zeitsprung | Ursachen-Probe an 1 000 Saaten: Wärmefluss aus der Vulkanlandschaft, Rang ≥ 0,7; höchster Vulkan skaliert mit 1/Schwere, Rang ≥ 0,7 | |

### L3 Gebirge und Bruch — Orogenese, Verwerfung, Beben
Misst, ob Gebirge aus Kollision wachsen und Beben aus Verwerfungen kommen, sichtbar und fühlbar.

| Sprosse | Umfang | Tiefe | Preis | Richter | Stand |
|---|---|---|---|---|---|
| 1 | Schicht-Treppe im Tafelland | horizontale Bänke, Kliff 60–85°, Schutthang am Ruhewinkel; keine Faltung | P am Kliff | Kliff und Schutthang im Bild an Tafelland-Saaten, bei P | HEUTE Tiefe; Ankunft ROT → zählt 0 |
| 2 | jede Felswand trägt ihre Verformung | gefaltet, gekippt, versetzt — je nach Geschichte des Orts | P an der Wand | Echtheits-Test Felswand gegen Foto; in Kollisionszonen ≥ 80 % der Wände verformt, im alten Kraton ≤ 20 % | |
| 3 | ein Orogen 10⁵ km² | Kammhöhe, Breite, Isostasie | P im Überflug | Hypsometrie des Orogens gegen Alpen-/Himalaya-Profil ≤ 20 % | |
| 4 | Beben einer Region, fühlbar | Gutenberg-Richter, Ort an Verwerfungen | P im Beben, in der Stadt | 1 Spieljahr: b 0,8–1,2, ≥ 90 % Epizentren an Verwerfungen; Boden und Häuser bewegen sich mit der Magnitude | |
| 5 | Bruch formt bleibend | Versatz wächst mit Magnitude, Hangrutsch, Tsunami | P im Ereignis | nach M7: Stufe 1–5 m, Rutschungen an steilen Hängen; Echtheits-Test gegen Feldfoto | |
| 6 | planetar ~10⁴ Beben M ≥ 4 je Jahr | Bebengürtel = Plattenränder | P an 100 Zufalls-Orten | Epizentren eines Spieljahrs ≥ 85 % an Rändern | |
| 7 | Gebirge wachsen und vergehen über 10⁸ Jahre, jede Saat | junge Hochgebirge, alte Rumpfgebirge; Gipfelhöhe folgt Schwere | P im Zeitsprung | 50 Saaten: Alter erklärt Höhe Rang ≥ 0,7; 1 000 Saaten: höchster Gipfel skaliert mit 1/Schwere Rang ≥ 0,7 | |

### L4 Die Unterwelt als Volumen — Höhle, Röhre, Aquifer, bis zum Kern
Misst, ob unter dem Boden eine echte, begehbare und geologisch erklärte Welt liegt.

| Sprosse | Umfang | Tiefe | Preis | Richter | Stand |
|---|---|---|---|---|---|
| 1 | Rausch-Höhlen (Wurm, Kaverne, Halle) im Band bis ~28 m unter Basis | ohne Gestein, ohne Wasserlauf | P in der Höhle | Mündungen je km² und Himmelssicht, bei P in der Höhle | HEUTE Umfang; P in der Höhle ungemessen, Mündungszahl nur aus Kern-Kommentar → zählt 0 |
| 2 | Karsthöhle 1 km | folgt löslichem Gestein und Wasser, Tropfstein, Quelle am Ausgang | P in der Höhle | Höhlen in löslichem Gestein ≥ 90 %; Gänge entwässern zu einer Quelle ≥ 80 %; Echtheits-Test | |
| 3 | System 10 km | unterirdischer Fluss, Siphon, Einsturzdoline | P ohne Lade-Bild | 10 km am Stück begehbar; Doline über Hohlraum in ≥ 90 % | |
| 4 | Aquifer als Volumen | Spiegel, Fließen, Brunnen senkt Spiegel | P an der Bohrung | Entnahme: Absenkungstrichter messbar, Quelle flussab versiegt | |
| 5 | Systeme 10² km, Hallen 10⁷ m³ | Mammoth- und Son-Doong-Klasse | P in der Halle | längstes System ≥ 100 km in ≥ 20 % der Karstsaaten; Halle mit Wald und Wolke, Echtheits-Test | |
| 6 | der Planet im Schnitt: Kruste grabbar, Mantel und Kern sichtbar | Temperatur 25–30 K/km, Schalen in Dichte-Reihenfolge | P im Abstieg durch den Schnitt | Bohrloch folgt dem Gradienten; Erd-Saat: Kern-Mantel-Grenze bei 0,5–0,6 Radius; Stollen 10 km ohne Naht | |
| 7 | jeder Planet unter seiner Haut | Lavaröhren (weiter bei kleiner Schwere), Eishöhlen, Ozean unter Eis | P je Saat | Ursachen-Probe an 1 000 Saaten: Röhren-Weite gegen 1/Schwere Rang ≥ 0,7; Unterwelt passt zu Gestein und Klima | |

### L5 Gestein und Lagerstätte — die Kraft, Fundorte vorherzusagen
Misst, ob jede Stelle ein Gestein mit Herkunft trägt und Rohstoffe dort liegen, wo die Geschichte sie hinlegt — gemessen an der Vorhersage-Kraft, nicht an einer Liste von Typen.

| Sprosse | Umfang | Tiefe | Preis | Richter | Stand |
|---|---|---|---|---|---|
| 1 | Gestein je Ort aus seiner Genese | magmatisch, sedimentär, metamorph sichtbar verschieden UND passend zur Geschichte des Orts | P an der Wand | Jury trennt drei Genesen ≥ 80 %; Genese passt zur Ort-Geschichte ≥ 85 % | unter der Leiter |
| 2 | geologische Karte einer Region | Gestein folgt Tektonik und Alter | P im Überflug | Echtheits-Test geologische Karte gegen reale | |
| 3 | Lagerstätten aus Beckengeschichte und Erzgenese | Kohle, Salz, Kupfer, Seifengold, Öl, Bändereisen entstehen, nicht verstreut | P beim Suchen | Prospektor-Probe an 30 Saaten: Fundquote nach Zeichen ≥ 5× blindes Bohren | |
| 4 | Abbau verändert die Welt bleibend | Grube, Halde, Senkung, Salzstock | P am Abbau | Abbau sichtbar und bleibend; Senkung über Kohle messbar | |
| 5 | Minerale als Stoff aus Gesetz (Kristallsystem × Chemie) | Habitus, Farbe, Glanz, Härte, Spaltbarkeit | P an der Stufe | 100 Zufalls-Funde: Jury nennt das Kristallsystem blind ≥ 80 %; Echtheits-Test Stufe gegen Mineralfoto | |
| 6 | fremde Chemie jeder Saat | andere Elementverteilung, andere Lagerstätten | P je Saat | Prospektor-Probe an 1 000 Saaten: ≥ 3× blindes Bohren | |

### L6 Das Innere spricht — Feld, Wärme, Schwere
Misst, ob das unsichtbare Innere an der Oberfläche spürbar wird.

| Sprosse | Umfang | Tiefe | Preis | Richter | Stand |
|---|---|---|---|---|---|
| 1 | Kompass auf einem Dipol-Planeten | Deklination und Inklination nach Ort | P (null Zusatzkosten) | Inklination ≤ 5° gegen Dipol an 20 Orten; Deklination ändert sich mit dem Ort | unter der Leiter |
| 2 | Polarlicht-Oval | Lage aus dem Feld | P unter dem Polarlicht | Oval bei 65–75° magnetischer Breite; Echtheits-Test gegen Foto | |
| 3 | Umpolung, Streifen am Ozeanboden | Feld-Geschichte im Gestein | P im Messflug | Magnetometer-Flug über den Rücken: Streifen spiegelsymmetrisch in ≥ 90 % der Saaten | |
| 4 | Wärme an der Oberfläche | Geysire, heiße Quellen, Schwarze Raucher nur über Wärme-Anomalien | P am Geysir | ≥ 95 % der Geysire über Anomalien; Intervalle in realer Spanne (Minuten bis Stunden) | |
| 5 | fremde Innere | feldlose Welten, Mehrpol-Felder, Monde ohne Kern | P je Saat | Ursachen-Probe an 1 000 Saaten: Feldstärke aus Kern und Rotation; erstarrter Kern → kein Feld in ≥ 95 % | |

### L7 Kopplung — die Geologie erklärt die Welt
Misst, wie viel der sichtbaren Welt (Küste, Fluss, Boden, Stadt, Verkehr) sich aus der Geologie erklärt.

| Sprosse | Umfang | Tiefe | Preis | Richter | Stand |
|---|---|---|---|---|---|
| 1 | Flussnetz und Seen folgen der Landform | 293/293 Läufe enden in See oder Meer | P am Ufer | Anteil Läufe, die in See oder Meer enden | HEUTE Tiefe; Ankunft ROT → zählt 0 |
| 2 | Gestein bestimmt Boden und Pflanze | Kalk ↔ Karst-Flora, Basalt ↔ fruchtbar | P im Überflug | ≥ 50 % der Biomgrenzen folgen einer Gesteinsgrenze | |
| 3 | Vulkan formt Küste | Lavadelta, Kliffküste, schwarzer Sand | P am Strand | nach Ausbruch verschiebt sich die Küstenlinie; Strandfarbe folgt Gestein | |
| 4 | Gebirge formt Wetter | Regenschatten | P im Regen | Niederschlag Luv/Lee ≥ 2:1 an 30 Saaten | |
| 5 | Geologie formt Stadt und Verkehr | Hafen in Bucht, Pass, Bergbaustadt, Bebensicherheit | P in der Millionenstadt | Jury rät aus der Geländekarte OHNE Städte deren Lagen: Treffer ≥ 3× Zufall | |
| 6 | Katastrophe kaskadiert | Beben → Rutschung → Tsunami → zerstörte Stadt → Neubau | P im Ereignis, in der Stadt | an 30 nie gesehenen Zufalls-Auslöseorten läuft die Kette in ≥ 80 % | |
| 7 | Planetengeschichte erklärt Zivilisation | Rohstoffe und Gelände steuern Epochen | P im Zeitsprung | 100 Saaten: Jury erkennt die geologische Ursache der Hauptstädte ≥ 70 % | |

### L8 Einschlag und Krater — die Haut als Uhr
Misst, ob Einschläge Landschaft machen und ihre Dichte das Alter einer Oberfläche erzählt.

| Sprosse | Umfang | Tiefe | Preis | Richter | Stand |
|---|---|---|---|---|---|
| 1 | ein Krater als Form | einfacher Napf ↔ komplexer Krater mit Zentralberg, Übergang abhängig von der Schwere | P am Kraterrand | Tiefe/Durchmesser einfacher Krater 1:5 ± 20 %; Profil gegen reale Krater ≤ 15 % | unter der Leiter |
| 2 | ein Einschlag als Ereignis | Auswurf, Strahlen, Beben, Glut | P im Ereignis | Echtheits-Test gegen Einschlag-Simulation und Kraterfoto | |
| 3 | Kraterfeld einer Region | Größen-Häufigkeit nach Potenzgesetz | P im Überflug | N(> D) ∝ D^−2 ± 0,5; Kraterdichte gegen wahres Oberflächenalter Rang ≥ 0,8 | |
| 4 | planetar | Hochland gesättigt, junge Ebenen leer, Wetter löscht Krater | P je Saat | 1 000 Saaten: erhaltene Krater je Fläche fallen mit Erosion und Tektonik, Rang ≥ 0,7 | |
| 5 | Großeinschlag koppelt | 10-km-Körper → Tsunami, Winter, Aussterben | P im Ereignis | nach Einschlag sinken Welt-Temperatur und Artenzahl messbar | |

### L9 Das Archiv im Fels — Schicht, Fossil, Zeitreise
Misst, ob jede Felswand die Geschichte trägt, die die Zeitreise zeigt — die Kopplung von Geologie und Tiefer Zeit am Ort.

| Sprosse | Umfang | Tiefe | Preis | Richter | Stand |
|---|---|---|---|---|---|
| 1 | Schichtfolge je Ort | tiefer = älter; Gestein der Schicht = Umwelt ihrer Epoche (Meer → Kalk, Wüste → Sandstein) | P an der Wand und im Zeitsprung | 30 Saaten: Zeitreise an den Ort zeigt die Umwelt, die die Schicht verspricht, in ≥ 85 % | unter der Leiter |
| 2 | Canyon-Klasse | Diskordanzen, Faltung, Gänge, Erosion schneidet die Folge an | P im Canyon | Echtheits-Test gegen Grand-Canyon-Klasse | |
| 3 | Fossilien in Schichten | das Leben, das zur Zeit am Ort lebte | P am Fund | ≥ 95 % der Fossilien gehören einer Art, die die Zeitreise an Ort und Epoche zeigt | |
| 4 | Spieler als Geologe | Bohrkern und Wand sind lesbar | P am Kern | blinde Jury datiert Vulkan-, Meeres- und Eiszeit-Phasen aus Wand oder Kern ≥ 70 % richtig | |

## Stand heute

- **Gestalt**: ebene Welt, keine Kugel, keine Platten. Großform aus drei glatten Feldern durch Splines (Kontinentalität λ 9 km, Erosion λ 3,2 km, Stil λ 5 km) und ein Flussnetz nach dem Stream-Power-Gesetz S = ks·A^−θ — `gelaende-core.js:361-391` (Regler `:379-398`). Kein Treffer für Tektonik, Erdbeben oder Magnetfeld in `stamm/` und den Kernen (Grep 14.11., gegengelesen; Treffer zu „plate"/„Vulkan" sind Rüstungsplatten und die Grafik-Schnittstelle).
- **Schichten**: das Schicht-Gesetz T5 legt horizontale Bänke als Treppe Pediment → Schutthang → Kliff ≥ 60° → Bank, Mächtigkeit 8–60 m — `gelaende-core.js:374-375`, Regler `:393-398`. Keine Faltung, keine Verwerfung, keine Epoche je Bank.
- **Vulkan**: nur Lava als Tat-Decke mit Newton-Abkühlung, Glut ∝ T⁴ über 798 K, Dampf am Wasser — `gelaende-core.js:1787-1831` (gegengelesen). Sie fließt nicht und formt keinen Kegel.
- **Fels-Genese**: die Achse „kristallin → säulig → massiv → klastisch" ist kein bloßer Studio-Regler, sie liegt im Kern (`foundry-core.js:5204` `rockPhenotype`, gelesen von `deriveParamsRock` `:5274`) — sie wählt aber die Sorte eines Fels-BROCKENS aus den Reglern seiner Vorlage; kein Leser bindet sie an Ort, Tektonik oder Alter (Grep 14.11.). L5 bleibt unter der Leiter.
- **Höhlen**: drei Rauschfelder (Wurm, Kaverne, Halle) zwischen Basis − 28 m und Decke — `gelaende-core.js:6843-6865` (gegengelesen). Volumen ja, Geologie nein. Mündungszahlen stammen aus einem Kern-Kommentar (`:2800-2814`), nicht aus frischer Messung.
- **Aquifer**: trockene-Höhle-Regel und Küsten-Aquifer als Quelle des Zell-Automaten — `stamm/daten.js:413-426`, `stamm/wasser-zellen.js:203-330`; Speicher-Modell des Abflusses (Maillet) — `gelaende-core.js:1563`. Kein Spiegel als Volumen.
- **Krater, Lagerstätten, Minerale, Magnetfeld, Stratigraphie**: nichts („Krater" im Code sind Grab-Edits des Spielers).
- **Preis**: GTX stehend p95 16,8 ms, Ankunft kalt 11–17 s (PFLICHT-OFFEN B/E) — die Ankunft verfehlt P an JEDER Sprosse. Ehrlich: diese Perspektive steht heute bei **0 gültigen Sprossen**; vier Sprossen (L1.1, L2.1, L3.1, L7.1) haben Umfang und Tiefe und warten nur auf P.

## Abhängigkeiten

- **Maßstab-Kontinuum: vom Korn zur Galaxie** und **Der Same: Architektur der Entfaltung** — ohne Kugel-Koordinaten, Zoom ohne Naht und Auswertung nur am Schirm fällt L1 ab Sprosse 4, L4 ab Sprosse 3, L8 ab Sprosse 4.
- **Tiefe Zeit: der Planet über seine Äonen** — trägt den Zeitsprung von L1.6, L3.7, L9; diese Leiter liefert ihr Platten-, Krater- und Schichtgeschichte.
- **Evolution und fremdes Leben** — L9.3 (Fossil = Art der Epoche), L8.5 (Aussterben).
- **Physik und Stoff** — Fließen, Wärme, Bruch (L2.2, L3.4–5), Kristallform (L5.5).
- **Verwitterung, Erosion und Boden** — Abgrenzung: Erosion, Boden und Flussformung dort; Hebung, Gestein, Einschlag und Innen hier.
- **Ozean, Wasser und Eis** — Aquifer (L4.4), Tsunami (L3.5), Lavadelta (L7.3).
- **Atmosphäre, Wetter und Klima** — Vulkanwinter (L2.6), Einschlagwinter (L8.5), Regenschatten (L7.4), Polarlicht (L6.2).
- **Himmel, Sonnensysteme und fremde Welten** — das Reisen ZWISCHEN den Körpern; hier nur die Haut jedes Körpers (L1.7, L2.7, L8.4).
- **Siedlung und Stadt**, **Netze, Verkehr**, **Arbeit, Technik und Handel** — lesen L5.3 und L7.5.
- **Kopplung, Kaskade und Katastrophe** — L7.6 und L8.5 sind ihre geologischen Wurzeln.
- **Ankunft, Geräte und Zugang** — P jeder Sprosse; ohne Ankunft ≤ 5 s zählt hier nichts.

## Was die alte Karte hier misst

Die alte Karte hat keinen Bereich Geologie; Gelände steht in Bereich 1 „Gelände, Boden und Wasser — 8/10" (`MEISTERKARTE.md:224`):
- **gelaende.K1** EIN 3D-Gesetz (Dichte, Edit, Wasserspiegel im Kern, 10⁵ Punkte maxDiff 0) — Voraussetzung für L4.1, keine Sprosse, weil sie den Weg misst.
- **gelaende.K2** Wasser folgt jedem Edit — Blatt Wasser; hier Kopplung an L4.4.
- **gelaende.K3** Wasserbild an jeder Pose — Blatt Licht/Wasser.
- **gelaende.K4** EIN Wasserspiegel, 293/293 Läufe enden in See oder Meer — wird L7.1.
- **stoffe.K3** (Bereich 4) Lava als Stoff (`gelaende-core.js:1787` „stoffe.K3-2") — wird L2.1.
- **gate:hoehlen-sicht** (Mündungen, Himmelssicht) — wird L4.1.
Kein Kriterium der alten Karte misst Platten, Vulkanform, Beben, Krater, Schichtgeschichte, Lagerstätten oder Magnetfeld.

## Zweifel

- **„Zeiten bereisen, wie sie UNSER Planet schrieb"** ist mit „aus EINEM Samen" im Widerspruch: die echte Erdgeschichte (Pangäa, Schneeball-Erde, die heutigen Küsten) ist Daten, kein Gesetz. Offene Frage, keine Sprosse: entweder eine Saat-Suche, die eine Erd-ähnliche Geschichte FINDET (Richter: Echtheits-Test Paläokarte gegen Rekonstruktion), oder ein bewusst benannter Daten-Anker.
- Die **Ursachen-Probe** ersetzt die Geschmacks-Jury für fremde Welten, braucht aber einen geeichten Leser; ob ein Klassifikator auf sechs realen Körpern trägt, ist unbewiesen.
- Die **Prozentschwellen** sind gesetzt, nicht abgeleitet; die Größenordnungen sind sicherer als die Anteile.
- **Echtzeit-Tektonik ist nicht nötig**: Gestalt als Funktion von Saat und Zeit; ob das die Plausibilität einer Simulation erreicht, ist unbewiesen. Ebenso fließende Lava bei 33 ms auf Laptop-Grafik — die Gegenwart braucht dafür eine RTX A6000.
- **L4.6 „bis zum Kern"** misst eine Perspektive (Schnitt, Flug durchs Innere), nicht begehbaren Mantel; ob Spieler das als Erlebnis lesen, ist offen.

## Gegenlese — was sich änderte und was strittig bleibt

- **Gehoben**: L1.6 von 10⁹ auf 4,5·10⁹ Jahre ab Magma-Ozean, L1.7 auf Mondgröße bis Super-Erde, L2.7 und L3.7 um die Schwere-Skalierung (Olympus-Mons-Klasse), L4.6 von „10 km grabbar" auf den Planeten im Schnitt bis zum Kern.
- **Richter ersetzt, die eine Bauweise vorschrieben**: „Plattenzahl 3–5 / 7–15" (Gürtel-Geometrie und globales Rücken-Netz statt Platten zählen), „ohne Sonderskript" (30 nie gesehene Auslöseorte), „Bingham" aus der Tiefe-Spalte; die Geschmacks-Jury fremder Welten durch die Ursachen-Probe.
- **Fleiß gegen Fähigkeit**: „≥ 6 Lagerstätten-Typen" und „10³ Minerale" werden zur Prospektor-Probe und zum Kristallsystem-aus-Gesetz; „ein Vulkan als Form" misst, ob die Form aus der Zähigkeit ENTSTEHT.
- **Preis**: jede Sprosse trägt P mit Mess-Ort; die vier HEUTE-Sprossen zählen 0, weil die Ankunft 11–17 s P verfehlt — der Stand der Perspektive ist 0 gültige Sprossen, nicht 4.
- **Lücken gefüllt**: L8 Einschlag und Krater, L9 Archiv im Fels (koppelt Geologie an die Zeitreise und an die Evolution).
- **Zusammengelegt**: L5.5 (Städte lesen Lagerstätten) ging in L7.5 auf; L6.1/L6.2 (Deklination, Inklination) zu einer Sprosse.
- **Stand berichtigt**: die Fels-Genese-Achse liegt im Kern (`foundry-core.js:5204`), nicht nur im Studio — aber ohne Bindung an den Ort; der Höhlen-Stand ist Kommentar, nicht Messung.
- **Strittig**: die echte Erdgeschichte gegen „ein Same" (offene Frage oben); ob L2 und L3.6/L2.5 (Ränder erklären Vulkane und Beben) nicht eine Leiter „der Plattenrand erklärt" sein sollten; ob L6 (Magnetfeld) das Gewicht einer eigenen Leiter neben der Vision verdient.
