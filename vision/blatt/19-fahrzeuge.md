# Fahrzeuge und Maschinen

## Die Vision hier

Jedes Ding, das ein Volk je gebaut hat, um sich, Lasten oder Kraft zu bewegen, wächst aus EINEM Gesetz der Mechanik — und nicht als Katalog, sondern als ERFINDUNG: eine Kultur mit Holz und Ochsen erfindet die Schleife, eine mit Eisen und Kohle die Dampflok, eine Insel-Kultur das Auslegerkanu, eine Wasserwelt mit dichter Luft und halber Schwerkraft Gefährte, die die Erde nie sah. Die Schleife des Jungsteinzeit-Bauern, die Triere, die Kogge, die Dampflok, der Doppeldecker, der Containerriese, die Magnetbahn, die Raumfähre, das Generationenschiff zwischen Sternen: jedes fährt, schwimmt, fliegt, taucht oder stürzt nach derselben Physik, die Boden, Wasser und Luft der Welt trägt; jedes kann der Spieler besteigen und lenken, nahtlos vom Feldweg in den Orbit, ohne Ladebild; und was der Spieler oder die KI selbst zusammensetzt, fährt nach demselben Gesetz — oder kentert ehrlich. Eine Stadt, gegen die Tokio (etwa 3 Mio. gemeldete Kraftfahrzeuge) ein Dorf ist, trägt zehn Millionen Fahrzeuge, deren Ströme sie nähren — jedes mit einem Bewohner am Steuer, der ein Ziel hat und fahren KANN (vom Pendler bis zum Rennfahrer und Regattasegler). Hinter den Fahrzeugen stehen die Maschinen, die sie bauen: Haspel, Mühle, Hütte, Fabrik, Werft, Raumhafen — laufende Ketten, deren Takt man sieht und hört, bis die Nachtseite eines Planeten die Industrie seiner Zivilisation zeigt. Die Gegenwart kennt jedes Stück einzeln, gekauft und geladen; jenseits der Gegenwart heißt: alle zugleich, aus einem Samen, in einem Fenster, auf einem Laptop, ohne Download.

## Das Beste der Gegenwart

- **BeamNG.drive**: Soft-Body je Wagen aus ≈ 400 Knoten und ≈ 4 000 Balken bei 2 000 Hz, jeder Crash aus einem Integrator (Beleg: alte Karte §23). Grenze: wenige Wagen zugleich, ein Medium (Land), jeder Wagen ein handgebautes Modell.
- **Forza Motorsport 2023**: Reifen-Kontakt mit 8 Punkten bei 360 Hz (alte Karte §23); Drivatar-Fahrer mit gelernter Linie. Grenze: kuratierte Strecken, Dutzende Wagen, Gigabytes Download.
- **Microsoft Flight Simulator 2024**: Flugmodell aus Oberflächen-Elementen, Strömungsabriss je Fläche ([Doku Basic Aerodynamics](https://docs.flightsimulator.com/msfs2024/retail/samples-tutorials/tutorials/tuning-the-flight-model/basic-aerodynamics/)); der Planet aus Satelliten-Daten gestreamt. Grenze: Hunderte GB, Bodenverkehr und Städte als Kulisse, jedes Flugzeug von Hand konfiguriert.
- **Kerbal Space Program 1/2**: Raketen aus Teilen, Starrkörper je Teil, Bahnmechanik zwischen Planeten — der beste heutige Beweis für „Form wird Fahrt". Grenze: ab mehreren Hundert Teilen bricht die Bildrate ([Forum zur Teil-Zahl](https://forum.kerbalspaceprogram.com/topic/210945-performance-with-large-part-counts-in-ea)); Teile aus einem Katalog, nicht aus Stoff.
- **Cities: Skylines II**: ohne feste Agenten-Grenze, jeder Wagen mit Pfad und Ziel ([Paradox Traffic AI](https://paradoxinteractive.com/games/cities-skylines-ii/features/traffic-ai)); ab mehreren 100 000 Einwohnern wird die Simulation langsam ([PC Gamer](https://pcgamer.com/cities-skylines-2-has-no-cap-on-the-number-of-people-it-can-track-and-its-basically-the-matrix)). Grenze: Wagen ohne Fahrphysik, Blick von oben.
- **Tears of the Kingdom / Stormworks / Teardown**: Fahrzeuge aus frei gefügten Teilen mit Masse, Auftrieb, Antrieb. Grenze: Dutzend Teile, Spielzeug-Maßstab, keine Epochen.
- **Factorio / Satisfactory**: Zehntausende laufende Maschinen, deterministisch. Grenze: Kästen mit Takt, keine Mechanik im Inneren.
- **Die Wirklichkeit**: ≈ 1,5 Mrd. Kraftfahrzeuge (Größenordnung aus dem Gedächtnis); Tokio ≈ 3,1 Mio. gemeldete Kraftfahrzeuge ohne Leichtfahrzeuge, März 2021 ([Statista](https://www.statista.com/statistics/1191244)); 7 000 Jahre vom Kufen-Schlitten zur Orbitalrakete.

## Der Same

**Das Kraft-Fluss-Gesetz: Quelle → Übertragung → Kontakt mit einem Medium, gezüchtet von einer Kultur.** Jedes Fahrzeug und jede Maschine ist eine Quelle (Muskel, Wind, Wasser, Dampf, Verbrennung, Strom, Rückstoß), eine Übertragung (Deichsel, Welle, Getriebe, Riemen) und eine Kontaktfläche (Kufe, Rad, Kiel, Ruder, Flügel, Düse), deren Kraft aus dem STOFF des Mediums folgt (Reibung, Dichte von Wasser und Luft, Vakuum). Die Gestalt ist die Lösung, die eine Kultur mit IHREN Stoffen, IHRER Energie, IHREM Gelände und IHRER Schwerkraft für eine Aufgabe findet — Epoche und Kultur sind keine Regler über einer Auto-Vorlage, sondern Randbedingungen der Erfindung. Fremde Branchen haben die Teile gelöst: die **Bond-Graph-Methode** (Paynter, 1959) beschreibt jedes Energiesystem als Fluss zwischen Quelle, Speicher und Verlust in einer Grammatik; die **Blade-Element-Theorie** und die Oberflächen-Elemente des Flugsimulators rechnen Kraft je Fläche aus dem Medium; die **Schiffbau-Hydrostatik** leitet Auftrieb und Stabilität aus der getauchten Hülle ab; der **Morphologische Kasten** der Konstruktionslehre (Zwicky) erzeugt Lösungen als Kombination von Funktionsträgern. Der Kern hat einen Anfang: `fahrWasser` und `fahrLuft` (vehicle-core.js:3619, :3633) leiten Furt-Widerstand und Seitenwind aus Hülle und EINER Masse ab — Widerstand, noch kein Auftrieb.

**Preis-Regel für jede Sprosse (P):** Bild p95 ≤ 33 ms und Ankunft ≤ 5 s kalt auf dem Standardgerät (Laptop-Grafik), 0 MB Download über das Skript hinaus, und **Kosten am Schirm**: die Flotte/Maschinenzahl der Welt ×10 → Bild-ms am selben Blick ≤ +5 %. Wo eine Sprosse mehr verlangt, steht es in der Spalte.

## Die Leitern

### L1 Bewegung in jedem Medium — in wie vielen Medien der Spieler fahren kann, und wie wahr es sich bewegt

(Gefaltet aus der alten L1 „Fahrphysik-Wahrheit" und L2 „Medien": beide maßen dieselbe Sache — Medium × Wahrheit — auf zwei Leitern.)

| Sprosse | Umfang | Tiefe | Preis | Richter (im echten Spiel, misst das Ergebnis) | Stand |
|---|---|---|---|---|---|
| 1 | Land, 1 Wagen, 50 km/h | Haftung je Boden spürbar: Gras rutscht, nass rutscht mehr | P, gehalten BEI FAHRT 50 km/h | Bremsweg 50 → 0 Gras/Weg ≥ 1,5×, nass ≥ 1,3×, dabei Bild p95 ≤ 33 ms während der Fahrt | Tiefe ja (1,63×, nass 1,48–1,72×); Preis reißt: GTX bei 36 km/h Bild 35,4 ms (alte Karte :210) → **unter Sprosse 1** |
| 2 | Land, jede Fahrzeug-Saat bis 130 km/h, Einspur eingeschlossen | Bremsweg, Kurvengrenze und Wanken in der Hülle realer Fahrzeuge | P bei 130 km/h | 20 zufällige Saaten: Bremsweg 100 → 0 trocken liegt in 30–50 m, skaliert ∝ v²/μ (± 10 %); Einspur 1 km ohne Sturz > 15 km/h | |
| 3 | + Wasser: Floß bis Segler | Auftrieb, Krängung, Segel aus dem Wind des Wetters | P | Segler kreuzt: Wendewinkel 80–100°, Höhe gegen den Wind > 0; Rollperiode ± 15 % gegen Schiffbau-Formel | |
| 4 | + Schiene + Luft (Ballon bis Jet) | Steigungsgrenze, Abriss je Fläche, Thermik aus erhitztem Boden | P, 50 km Flug ohne Nachlade-Ruck > 100 ms | Zug 20 Wagen: 2 % ja, 4 % nein; Überziehtempo ± 10 % gegen Flächenlast-Formel; Gleiter steigt in Thermik | |
| 5 | + Tiefsee, Verformung, Bruch, Untergang | Schaden aus derselben Stoff-Zeile wie die Welt | P | Crash 50 km/h: Deformationstiefe in der Hülle realer Crashtests; Schiff mit Leck: Schlagseite und Sinkdauer gegen einen dokumentierten Fall (Bildvergleich); 100 Unfälle ohne Durchdringung | |
| 6 | + Raum: Boden → Orbit → Mond → zurück, nahtlos | Bahnmechanik, Δv, Wiedereintritt mit Hitze | P, kein Ladebild über die ganze Reise | Orbit-Periode ± 1 % gegen Kepler; kein Bildsprung > 100 ms vom Start bis zur Landung auf dem Mond | |
| 7 | Alle Medien auf fremden Welten | dieselben Gesetze unter fremdem g, ρ, Meer (Methan, dichte Luft) | P | 100 zufällige Planeten-Saaten: Gleitzahl, Auftrieb, Rollperiode, Bremsweg skalieren korrekt mit g und ρ, Anteil ≥ 95 % | |
| 8 | Reise zwischen Sonnensystemen | relativistische Reise als Erlebnis (Zeit an Bord ≠ Zeit daheim) | P | Ankunft nach Flug mit 0,9 c: Uhr des Schiffs und der Heimat weichen um den Lorentz-Faktor ± 1 % ab, sichtbar im Spiel | |

### L2 Form wird Fahrt — fährt, was gebaut, gesprochen oder erfunden wird

(Neu. Die Fähigkeit, nicht der Fleiß: nicht wie viele Fahrzeuge es gibt, sondern ob JEDE Form, die irgendwer baut, nach dem Gesetz fährt.)

| Sprosse | Umfang | Tiefe | Preis | Richter | Stand |
|---|---|---|---|---|---|
| 1 | Teile-Werk der Werkstatt auf Rädern | Masse, Radstand, Hülle aus dem Bauplan | P | Spieler baut einen Wagen in der Werkstatt, steigt ein, fährt 500 m; das Tempo folgt seiner Masse | HEUTE (Teile-Werk fährt: koerper-fahrt.js:550, koerper-bewegung.js:260) — Preis nicht eigens gemessen |
| 2 | Jede Werkstatt-Form, alle Land-Kontaktarten | Schwerpunkt und Spur entscheiden über Kippen | P | 50 zufällige Baupläne: die mit hohem Schwerpunkt/schmaler Spur kippen in der Kurve, die anderen nicht — Kipp-Grenze ± 15 % gegen statische Kippformel | |
| 3 | + Rumpf, Segel, Flügel aus Teilen | Auftrieb aus der gebauten Hülle, nicht aus einer Gattung | P | Gebautes Floß mit zu wenig Volumen sinkt, mit genug schwimmt; gebauter Gleiter mit zu kleiner Fläche fällt — Grenze ± 15 % gegen Auftriebsformel | |
| 4 | Satz → Fahrzeug (der KI-Pfad) | „ein Boot für drei Leute auf einem Bergsee" ergibt ein Fahrzeug, das die Aufgabe erfüllt | P, Satz bis Fahrt ≤ 10 s | 100 Sätze: ≥ 90 % ergeben ein Fahrzeug, das die genannte Aufgabe im Spiel erfüllt (trägt, schwimmt, fliegt die Strecke) | |
| 5 | Erfindung ohne Bauplan: eine Kultur-Saat (Stoffe, Energie, Gelände, Aufgabe) → Fahrzeug | die Gestalt ist die Lösung, die die Randbedingung erzwingt | P | 1 000 Kultur-Saaten: ≥ 95 % der erfundenen Fahrzeuge bestehen den Physik-Test ihres Mediums; Saaten ohne Metall erfinden kein Metall-Fahrzeug (Absenz 100 %) | |
| 6 | Evolution der Technik: Fahrzeuge werden über Generationen besser | Auslese durch Gebrauch: was oft bricht, wird geändert | P | 500 Spieljahre einer Kultur: Leistung je Masse ihrer Fahrzeuge steigt monoton im Mittel; Bildreihe zeigt Linien (Ahnen erkennbar im Nachfahren, Blindtest ≥ 70 %) | |

### L3 Gestalt-Breite aus einem Samen — wie viele unterscheidbare, glaubhafte Fahrzeug-Welten die Saaten gebären

(Die alte L3 zählte Typen — 10³, 10⁴ — wie einen Katalog; die neue misst Unterscheidbarkeit und Glaubwürdigkeit an zufälligen Saaten. Die Physik-Tauglichkeit wanderte nach L2.)

| Sprosse | Umfang | Tiefe | Preis | Richter | Stand |
|---|---|---|---|---|---|
| 1 | 1 Gesetz, 5 Gattungen, 6 Epochen-Stufen als Regler über EINER Wagen-Vorlage | Proportionen nach Design-Lehren | P | 100 Saaten: Anteil, den Betrachter als Wagen der Gattung erkennen ≥ 90 % | HEUTE (vehicle-core.js:4523, `EPOCHE_GESETZ` :4725) — die Epochen morphen ein Auto (die Schleife trägt Scheibenneigung und Leuchten-Stoffe, :4732–4736) |
| 2 | Land-Fahrzeuge −5000 bis 2150, Gestalt je Epoche eigen | Kutsche ist keine Kutschen-Haut auf Wagen-Proportion | P | Blindtest: Betrachter ordnen 50 Saaten der Epoche ± 1 Jahrhundert zu, ≥ 70 %; Silhouette gegen Museumsfoto der Epoche IoU ≥ 0,7 | |
| 3 | Land, Wasser, Schiene, alle Kulturen der Erde | Kultur färbt Form (Dschunke ≠ Kogge ≠ Dhau) | P | 1 000 Saaten: ≥ 90 % glaubhaft, ≥ 50 % paarweise unterscheidbar; Blindtest Kultur-Zuordnung ≥ 60 % | |
| 4 | jedes Fahrzeug trägt Leben | Abnutzung, Ladung, Umbau, Beulen seines Besitzers | P | 100 Wagen einer Straße: keine zwei sind im Bildvergleich gleich (Paar-Abstand > Schwelle), Alter am Bild ± 10 Jahre schätzbar ≥ 60 % | |
| 5 | Planeten-Saaten: Technik fremder Evolutionen | Fahrzeuge anderer Leiber (sechs Beine, kein Sitz, Flossen am Steuer) | P | Fremde Saaten: ≥ 80 % als „nicht von der Erde" erkannt; ≥ 90 % passen zum Leib ihres Lenkers (Sitz/Griff am Körper-Modell der Art) | |
| 6 | 10⁶ unterscheidbare Fahrzeug-Welten | jede Zivilisation eine eigene Formensprache | P | 10⁴ Planeten-Saaten: Formensprache zweier Zivilisationen paarweise unterscheidbar ≥ 95 %, innerhalb einer Zivilisation als Familie erkennbar ≥ 80 % | |

### L4 Verkehrsmasse — wie viele Fahrzeuge mit Fahrer und Ziel zugleich leben

| Sprosse | Umfang | Tiefe | Preis | Richter | Stand |
|---|---|---|---|---|---|
| 1 | 1 Wagen des Spielers | L1/1 | P | 2-km-Route, 0 Steckenbleiber | HEUTE (alte Karte §23 K2 1/2) |
| 2 | 10 Wagen mit Bewohnern einer Stadt | Spur, Kreuzung, Vorrang | P auf beiden Geräten | 10 und 23 Uhr: jeder Wagen fährt, 0 Berührungen mit Bewohner, Wagen, Bau | Gesetz liegt (fachwerk-core.js:4070, ein Wagen je 15 Häuser; 300-Haus-Stadt ≈ 20); PFLICHT-OFFEN C offen, alte Karte 0/3 → **unter Sprosse 2** |
| 3 | 10³ in einer Stadt | Fahrpläne und Lieferungen treiben Ziele | P | Stau entsteht und löst sich: Fluss-Dichte-Kurve folgt dem Fundamental-Diagramm | |
| 4 | 10⁴ im Blick, 10⁵ in der Stadt | Ampel, Fußgänger, Parken, Unfall | P | Rush-Hour: Reisezeit Spitze/Nacht 1,3–2,0 wie Großstädte | |
| 5 | 10⁷ in einer Megastadt (Tokio ×3) | Häfen, Bahnhöfe, Flughäfen als Knoten | P | Luftbild bei Nacht: Lichtströme gegen Foto einer Megastadt (Dichteverteilung); vom Hochhausdach bis zum Horizont kein Wagen, der verschwindet oder springt | |
| 6 | 10⁹ planetweit, Schiffe und Flüge zwischen Städten | jeder hat Fahrer, Ladung, Herkunft | P | Spieler folgt beliebigem Fahrzeug 100 km: es kommt am erklärten Ziel an (Stichprobe 100, ≥ 98 %) | |
| 7 | Verkehr über Sonnensysteme | Raumverkehr zwischen Welten | P | Ein Container im Hafen trägt Fracht, deren Ursprung auf einem anderen Planeten im Spiel aufsuchbar ist (Stichprobe 20, ≥ 95 %) | |

### L5 Lenkerkunst — können die Fahrer fahren

(Neu. Masse ohne Können ist Kulisse: der Pendler, der Kapitän, der Pilot, der Rennfahrer, der Regattasegler — die Sport-Perspektive des Schöpfers beginnt hier.)

| Sprosse | Umfang | Tiefe | Preis | Richter | Stand |
|---|---|---|---|---|---|
| 1 | Bewohner fährt Wagen auf Wegen | hält Spur, bremst vor Hindernis | P | 1 h Spielzeit, 10 Fahrer: 0 Kollisionen, 0 Stillstände ohne Anlass | |
| 2 | Fahrer mit Charakter | vorsichtig ≠ eilig ≠ betrunken, aus dem Geist des Bewohners | P | Tempo-Verteilung je Charakter unterscheidbar; Zeitlücke zum Vordermann in der Spanne realer Fahrer (1–3 s) | |
| 3 | Rennfahrer auf jeder Strecke | Ideallinie aus der Physik, nicht aus einer gelernten Strecke | P | Auf 20 zufälligen Strecken: Umlaufzeit des besten Fahrers ≤ 105 % des physikalischen Optimums des Wagens | |
| 4 | Kapitän und Pilot | kreuzt, legt an, landet bei Seitenwind | P | Regatta 10 Segler um 3 Tonnen: Rangfolge folgt Können, nicht Saat; Landung Seitenwind 15 kn: ≥ 95 % ohne Bruch | |
| 5 | Jede Sportart mit Gefährt (Rad, Rudern, Ski, Bob, Motorsport, Segeln, Flug) | Wettkampf mit Regeln, Taktik, Windschatten | P | Ergebnisliste eines Wettkampfs je Sportart liegt in der Spanne realer Leistungen (Zeit je km ± 15 % gegen Rekordklasse) | |

### L6 Maschinen, Werkzeug und Fabrik — trägt die Welt laufende Maschinen, deren Arbeit man sieht

(Die alte L6 listete Maschinen — Mühle, Webstuhl, Pumpe, Säge; die neue misst, ob dasselbe Kraft-Fluss-Gesetz sie erzeugt und ob ihre Arbeit in der Welt ankommt.)

| Sprosse | Umfang | Tiefe | Preis | Richter | Stand |
|---|---|---|---|---|---|
| 1 | 1 Werkzeug mit Wirkung | Kraft wird sichtbar übertragen | P | Haspel hebt Eimer, Drehung im Bild, Hub folgt Kurbelweg | Haspel als Gestalt (fachwerk-core.js:5314, :7675), keine Wirkung → **unter Sprosse 1** |
| 2 | Maschinen aus dem Gesetz, nicht aus einer Liste | Quelle aus Wetter und Fluss | P | 50 zufällige Maschinen-Saaten: ≥ 90 % arbeiten nur, wenn ihre Quelle liefert (Mühle steht bei Windstille), Drehzahl folgt Abfluss/Wind | |
| 3 | Werkstatt-Kette Rohstoff → Halbzeug → Fahrzeug | Teile entstehen sichtbar | P | Spieler sieht einen Wagen aus Holz, Eisen, Leder entstehen, Teil für Teil, ≤ 10 min | |
| 4 | Fabrik (Dampf, Strom), Industriestadt | Riemen, Wellen, Fließband, Energienetz | P | Bildvergleich gegen Foto einer Fabrikhalle der Epoche; Takt hörbar; ein Kraftwerk fällt aus → messbar halten Fabriken an, Verkehr ändert sich | |
| 5 | Industrie eines Planeten | Werften, Raumhäfen, Automaten bauen Automaten | P | Raumschiff entsteht in einer Werft aus Erzen, die man in der Welt abgebaut gesehen hat | |
| 6 | Industrie einer Zivilisation über Sonnensysteme | Bauwerke im Raum, Energie aus dem Stern | P | Nachtseite des Planeten aus dem Orbit: Lichtverteilung folgt Energie- und Rohstoffkarte (Rang-Korrelation ≥ 0,7); Bauwerk im Orbit, dessen Bau man über Spieljahre verfolgen kann | |

### L7 Kopplung Fahrzeug ↔ Welt — wie sehr Fahrzeuge die Welt lesen und formen

| Sprosse | Umfang | Tiefe | Preis | Richter | Stand |
|---|---|---|---|---|---|
| 1 | Fahrzeug liest Boden-Stoff | μ aus derselben Stoff-Zeile, die den Boden malt | P | Bremsweg je Boden in der Welt | HEUTE (alte Karte §23 K1) |
| 2 | + Nässe, Wind, Furt | Wetter ändert Fahrt | P | Bremsweg nass ≥ 1,3×; Furt-Tiefe bremst messbar; Seitenwind versetzt | HEUTE (`fahrWasser`/`fahrLuft` :3619/:3633, Widerstand, kein Auftrieb) |
| 3 | Fahrzeug schreibt in die Welt | Spur in Schlamm, Schnee, Staub bleibt und vergeht | P | Bildpaar vor/nach 10 Durchfahrten: Spurrinne sichtbar, nach Regen verwaschen | |
| 4 | Verkehr formt Weg | Trampelpfad → Weg → Straße, je Nutzung | P | 1 Spieljahr: meistbefahrene Verbindung trägt höheren Straßen-Rang | |
| 5 | Natur schneidet Verkehr | Lava, Flut, Lawine, Erdbeben unterbrechen Trassen | P | Lavastrom quert eine Straße: die Ströme leiten binnen 5 Spielminuten um (Fluss auf der Umleitung ≥ 80 % des alten) | |
| 6 | Wege formen Stadt, Häfen formen Küste | Stadt wächst an Furt, Pass, Hafen | P | 100 Saaten: ≥ 80 % der Großstädte an einem Verkehrsknoten | |
| 7 | Technik-Wandel formt Landschaft | Eisenbahn zieht Städte, Flughafen räumt Fläche, Abgas trübt Luft | P | Zeitreise 1800 → 2000 am selben Ort: Siedlungsform folgt Verkehrsträger (Bildvergleich); Sichtweite über der Megastadt sinkt mit dem Verkehr | |
| 8 | Fahrzeuge zwischen Welten koppeln Planeten | Handel über Raum treibt Städte anderer Welten | P | Ausfall einer Raumroute ändert messbar Bevölkerung und Waren einer anderen Welt | |

## Stand heute

- **Ein Kern, Land allein:** `vehicle-core.js` trägt Fahr-Gesetz (`fahrGesetz` :3638, `fahrReifen` :3711, `fahrSchritt` :4074), fünf Gattungen (ab :4523) und `EPOCHE_GESETZ` (:4725) mit sechs Stufen −5000 bis 2150 mit Zugtier-Kraft, cw, Rollreibung und drei eigenen Bauten (`bauKutsche` :2593, `bauMotorwagen` :2752, `bauKanzel` :2905). Geprüft: die Zeilen stimmen. Aber: die Epochen sind Form-Ziele über EINER Wagen-Vorlage (die Schleife trägt `windshieldRake` und Leuchten-Stoffe, :4732–4736) — eine Zeit-Achse über dem Auto, keine Erfindung aus Randbedingungen.
- **Physik gemessen** (alte Karte §23 K1): Reifenspitze 6,5–8,5°, Bremsweg Gras/Weg 1,63×, nass 1,48–1,72×; nur Verhältnisse, kein Absolutwert. Furt und Seitenwind (`fahrWasser` :3619, `fahrLuft` :3633) sind WIDERSTAND aus der Hülle — kein Auftrieb, nichts schwimmt (berichtigt: das alte Blatt nannte es den „Anfang der Hydrostatik").
- **Preis unter Fahrt:** vmax 58 km/h; die GTX reißt bei 36 km/h (CPU-Takt 31 ms, Bild 35,4 ms; alte Karte :210, nicht neu gemessen). Nach R3 hält damit keine Fahr-Sprosse ihren Preis bei Tempo.
- **Teile-Werk:** in der Werkstatt gebaute Fahrzeuge fahren mit ihrer Hülle (koerper-fahrt.js:550, koerper-bewegung.js:260) — der Keim von L2.
- **Verkehr:** `VERKEHR_GESETZ.hausJeWagen = 15` (fachwerk-core.js:4070, geprüft), 300-Haus-Stadt ≈ 20 Wagen; PFLICHT-OFFEN C offen.
- **Wasser, Schiene, Luft, Raum, Einspur:** nichts (Grep über Kerne und `stamm/` nach Boot/Segel/Floß/Lokomotive/Schiene/Fahrrad/Flugzeug/Rakete/Mühle: keine Fahrzeug- oder Maschinen-Treffer).
- **Maschinen:** die Haspel des Ziehbrunnens als Gestalt (fachwerk-core.js:5314, :7675), keine Wirkung, keine Mühle, keine Kette.

**Einordnung:** L1 unter 1 (Preis) · L2 auf 1 · L3 auf 1 · L4 auf 1 · L5 unter 1 · L6 unter 1 · L7 auf 2 — von 46 Sprossen stehen 5.

## Abhängigkeiten

- **Physik und Stoff** — L1, L2, L7 an der EINEN Stoff-Zeile (Dichte, Reibung, Bruch); ohne Bruch-Gesetz kein L1/5.
- **Ozean, Wasser, Eis** + **Atmosphäre, Wetter** — Welle, Strömung, Wind, Thermik als Felder (L1/3–4, L6/2).
- **Himmel, Sonnensysteme** + **Maßstab-Kontinuum** — Orbit und Reise zwischen Sternen (L1/6–8).
- **Netze, Verkehr, Stadtstoffwechsel** — besitzt Netze und Ströme; dieses Blatt das Fahrzeug, das sie füllt (L4).
- **Bevölkerung** + **Der Mensch: Geist, Alltag** + **Sport** — jeder Fahrer ist ein Bewohner mit Ziel und Können (L4, L5).
- **Arbeit, Technik und Handel** — Wirtschaft und Wissen; hier die laufende Maschine (L6) und die erfindende Kultur (L2/5–6).
- **Menschenzeit: Epochen** + **Evolution fremder Arten** — Randbedingungen der Erfindung und Leiber der Lenker (L2/5, L3/5).
- **Vulkane, Platten, Naturgewalten** — L7/5.
- **Licht, Bild, Horizont** + **Ankunft, Geräte** — 10⁴ Fahrzeuge im Blick bei 33 ms; Tempo hängt am Streaming (alte Karte F5).
- **Klang** — Motor, Fabrik-Takt.

## Was die alte Karte hier misst

MEISTERKARTE.md §23 „Fahrzeuge und Fahrgefühl", 8/10 (:826–849):
- **K1 Fahr-Gesetz 2/2** → L1/1 (Tiefe) und L7/1–2.
- **K2 Die Fahrt kommt durch 1/2** → L4/1–2; die fehlende 2 = PFLICHT-OFFEN C.
- **K3 Kamera 2/2** → Perspektive „Der Spieler"; hier Bedingung jeder Fahr-Sprosse.
- **K4 Übergänge unter Bewegung 2/2** → Bedingung von L1/1 und L2/1.
- **K5 Rückmeldung 1/2** (offen Spur, Staub, Spritzwasser) → L7/3.
- **F5 Tempo** (:210) → der Preis von L1/1 bei Fahrt.
- PFLICHT-OFFEN **C** und Prüfplatz **F** → L4/2.

Neu gegenüber der alten Karte: alle Medien außer Land, L2 ganz, L3/2–6, L4/3–7, L5 ganz, L6 ganz, L7/3–8.

## Zweifel

- **„Glaubhaft" und „erkennbar" (L3, L2/6)** brauchen ein Betrachter- oder Bild-Urteil; ein Klassifikator gegen Fotos wäre selbst ein Modell aus fremden Assets. Ein Blindtest mit Menschen ist der ehrliche Richter, aber kein automatischer.
- **L1/2 „Hülle realer Fahrzeuge"** ersetzt den Abgleich gegen EINEN Serienwagen gleicher Maße (den es für Phantasie-Wagen nicht gibt) durch die Spanne realer Werte plus Gesetzmäßigkeit — misst weniger scharf als ein Einzelvergleich.
- **10⁴ bewegte Fahrzeuge im Blick bei 33 ms im Browser** ist Vision, keine Abschätzung; heute reißt die GTX bei EINEM fahrenden Spieler.
- **L1/8 (relativistische Reise)** ist ein Richter, ob er Spiel-Erlebnis oder Physik-Kür ist, bleibt Frage an den Schöpfer.
- **Grenzen zu „Arbeit, Technik, Handel" (L6, L2/5–6) und „Sport" (L5/5)** muss die Koordination schneiden.
- Wirklichkeits-Zahlen: Tokio 3,1 Mio. belegt (Statista 2021); 1,5 Mrd. Kfz weltweit aus dem Gedächtnis.

## Gegenlese — was sich änderte und was strittig bleibt

- **Gefaltet:** alte L1 (Physik-Wahrheit) und L2 (Medien) maßen dieselbe Sache — Medium × Wahrheit — und sind jetzt EINE Leiter L1; dafür neu **L2 Form wird Fahrt** (fährt jede gebaute, gesprochene, erfundene Form nach dem Gesetz — die Kraft des Samens statt eines Katalogs) und **L5 Lenkerkunst** (Fahrer, Kapitän, Pilot, Sportler: Können statt Masse).
- **Gehoben:** Verkehr oben 10⁷ je Megastadt (Tokio ≈ 3,1 Mio.) und 10⁹ planetweit; Medien bis zur Reise zwischen Sonnensystemen; Gestalt-Breite misst Zivilisationen, nicht Typen; Maschinen bis zur Industrie im Sternsystem.
- **Richter entschlackt:** „240 Hz" und „Takt" aus der Tiefe gestrichen (Bauweise); „Serienwagen gleicher Maße" durch die Hülle realer Werte plus Gesetzmäßigkeit ersetzt; L3-Typenzahlen (10³, 10⁴) durch Unterscheidbarkeit an Saaten ersetzt; Mühle/Webstuhl-Liste durch Maschinen-Saaten.
- **Preis vereinheitlicht:** P = 33 ms · 5 s · 0 MB · Kosten am Schirm (Flotte ×10 → ≤ +5 % ms) in jeder Sprosse; vorher stand in den meisten nur „33 ms".
- **Stand berichtigt:** L1/2 HEUTE war geraten — nach R3 steht L1 UNTER Sprosse 1, weil der Preis bei 36 km/h auf der GTX reißt; L4/2 HEUTE war falsch (PFLICHT-OFFEN C offen); `fahrWasser` ist Widerstand, kein Auftrieb; die Epochen morphen eine Auto-Vorlage; das Teile-Werk fährt (L2/1 HEUTE). Geprüft und richtig: Zeilen in vehicle-core.js, `hausJeWagen = 15`, keine Boote/Züge/Mühlen.
- **Strittig:** ob L1/1 bei Fahrt wirklich reißt, stützt sich auf die alte Karte (:210), nicht auf eine frische Messung; Blindtest-Richter (L3, L2/6) sind menschlich, nicht automatisch; Grenze zu Sport- und Wirtschafts-Blatt offen.
