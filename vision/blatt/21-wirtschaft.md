# Arbeit, Technik und Handel

## Die Vision hier

Jedes Ding der Welt hat eine Herkunft: das Messer am Gürtel eines Bewohners war Erz in einem Berg, den die Geologie dorthin gelegt hat, wurde in einem Ofen geschmolzen, dessen Holzkohle einen Wald gekostet hat, von einer Schmiedin geformt, deren Zunft den Preis hält, und über eine Straße getragen, deren Zoll eine Stadt reich gemacht hat. In Megastädten, neben denen Tokio ein Dorf ist, arbeiten Zehnmillionen Menschen gleichzeitig, sichtbar am Werkstück, das sich unter ihren Händen ändert, am Pendlerstrom, am Lichtermeer der Werke bei Nacht; Preise sind nicht gesetzt, sie entstehen aus Knappheit, Weg und Energie, und eine Missernte im Binnenland lässt das Brot im Hafen drei Spieltage später teurer werden. Erfindungen folgen Voraussetzungen statt einem Skript: ein Samen ohne Pferd gebiert eine Zivilisation ohne Wagen, ein Samen ohne Zinn springt von Kupfer zu Eisen, ein dritter erreicht den Halbleiter auf einem Pfad, den unsere Geschichte nie gegangen ist, ein vierter baut mit lebendem Gewebe statt Metall — und der Spieler bereist jede Epoche dieses Pfads am selben Ort, ergreift dort jeden Beruf, gründet ein Werk, und die Welt antwortet. Karawanen, Schiffe, Züge, Frachter und Raumfrachter tragen echte Ladung auf den billigsten Wegen; Häfen, Pässe und Furten werden Städte, weil der Handel sie dazu macht. Am oberen Ende handeln Sonnensysteme miteinander, mit Lichtlaufzeit, Bahnfenster und Startenergie als Gesetz. Alles aus EINEM Samen: kein Rezept, kein Beruf, keine Ware steht in einer Liste.

## Das Beste der Gegenwart

- **Victoria 3** (Paradox 2022): Bevölkerungsgruppen kaufen nach Bedarf und Vermögen, Preise entstehen aus Kauf- und Verkaufsaufträgen um einen Basispreis, Gebäude wechseln Produktionsmethoden (Eingänge, Ausgänge, Arbeiter), Marktzugang hängt an Infrastruktur. Grenze: alles ist Tabelle und Diagramm — kein Mensch, kein Werkstück, keine Karawane ist im Bild; die Ware ist eine Zahl je Staat.
- **Anno 1800** (Ubisoft 2019): sichtbare Produktionsketten (Weizen → Mehl → Brot) mit festen Verhältnissen 2:1, 3:2, sieben Bevölkerungsstufen mit Bedürfnissen, Waren aus anderen Regionen per Schiff. Grenze: handgesetzte Ketten (einige Dutzend Waren), feste Rezepte, kein Preis aus Knappheit, eine Epoche.
- **Factorio / Satisfactory**: Stoffströme als sichtbare Maschinen-Netze, Energie als Engpass (Dampf → Solar → Kern), Fabriken mit Hunderttausenden Gegenständen auf Bändern in Echtzeit. Grenze: handgeschriebener Rezeptbaum (wenige Hundert Rezepte), kein Markt, keine Menschen, keine Geschichte.
- **Dwarf Fortress** (Bay 12): Dutzende Werkstätten, Ketten vom Rohstoff zum Gegenstand, jedes Ding trägt Material und Hersteller, Karawanen kommen mit Gewichtsgrenze an ein Depot. Grenze: die Welt-Ökonomie zwischen Städten ist bis heute nur angelegt, nicht simuliert; ASCII- bzw. Kachel-Bild.
- **Kingdom Come: Deliverance II** (Warhorse 2025): ≈ 2 400 NPCs mit Tagesablauf, Schmiede-Handwerk als Spieler-Minispiel, Händler mit Beständen. Grenze: Berufe sind Kulissen-Routinen, Bestände füllen sich von selbst nach, keine Kette dahinter.
- **ORBIS** (Scheidel, Stanford 2015): Netzmodell der römischen Welt, ~632–750 Orte, 14 Landverkehrsmodi, 25 Flüsse, Segelzeiten aus monatlichem Wind und Strömung; Kosten in Denar je kg. Grenze: Wissenschafts-Werkzeug, eine Epoche, kein Erleben.
- **Agentenbasierte Ökonomie** (EURACE, Sugarscape): Preise als emergentes Ergebnis von Agenten-Interaktion, EURACE modelliert eine EU-Wirtschaft auf Parallelrechnern. Grenze: Supercomputer, kein Bild, keine Echtzeit.
- **Die Wirklichkeit selbst:** ≈ 5 000–6 000 gehandelte Produktklassen im Harmonisierten System (6-stellig), dahinter Hunderte Millionen einzelner Artikel; 867 Berufe im SOC 2018, über 12 000 Berufstitel im Dictionary of Occupational Titles; Großraum Tokio ≈ 37 Mio. Menschen, ≈ 2 · 10⁷ Erwerbstätige. Kein Spiel trägt auch nur 1 % dieser Breite sichtbar — und jedes trägt seine Breite als Liste.

## Der Same

**Das Rezept als Gesetz über Stoffe:** Jede Tätigkeit ist eine Umwandlung `Stoffe + Energie + Werkzeug + Können + Zeit → Stoffe'`, deren Gelingen aus den Stoff-Gesetzen FOLGT (Schmelzpunkt, Härte, Legierung, Bindung), nicht aus einer Liste. Berufe sind Bündel solcher Umwandlungen, Erfindungen sind das erste Mal, dass eine Umwandlung ihre Voraussetzungen erfüllt findet, Energie ist der Stoff, den jede Umwandlung verbraucht, und Preise sind der Schatten der Kosten über einem Wegenetz (die Menge, die ein Gut auf dem billigsten Weg kostet, plus Knappheit).
Gelöst haben es zwei fremde Branchen: die **Verfahrenstechnik / chemische Prozess-Simulation** (Stoffstrombilanzen über Apparate-Netze, jedes Werk ein Knoten mit Ein- und Ausgängen — derselbe Graph, den Anno von Hand zeichnet) und die **Verkehrs- und Logistik-Ökonomie** (Gravitationsmodell des Handels, kürzeste Wege mit Kosten je Modus wie ORBIS). Der Code hat den Keim schon: die EINE Misch-Regel des Werkstoffs (`schmiede-core.js:2911–2921`, Bronze aus Kupfer 0,88 + Zinn 0,12 als gelöstes Atom, Festigkeit nach Fleischer `:2874–2875`) — die Umwandlung als Gesetz, heute nur im Studio, nie als Strom in der Welt.

## Die Leitern

**Zwei Maße gelten für jede Sprosse dieses Blatts:**
- **Das Band** = Bild p95 ≤ 33 ms · Ankunft kalt ≤ 5 s · 0 MB Download, auf dem Standardgerät (Laptop-Grafik der Klasse Radeon 890M), gemessen an der Stelle, die der Richter nennt. Eine Sprosse gilt nur, wenn ihr Richter UND das Band an derselben Stelle zugleich halten. Wo die Preis-Spalte mehr sagt, ist es die Last, unter der das Band halten muss.
- **Der Gesetz-Hebel H** = verschiedene im Spiel beobachtete Formen (Waren, Berufe, Techniken) über 100 zufällige Saaten ÷ handgeschriebene Einträge im Code, die sie benennen. Ab Sprosse 3 jeder Leiter verlangt die Sprosse H ≥ 10^(Sprosse−2). Eine Liste mit 10⁴ Einträgen erreicht nie Sprosse 4 — der Same zählt, nicht der Fleiß.

### L1 Stoffstrom: vom Gestein zur Ware
Misst, wie viele verschiedene Waren in der Welt aus Ressourcen des Geländes hergestellt UND verbraucht werden, sichtbar an Lager, Werk und Werkstück.

| Sprosse | Umfang | Tiefe | Preis | Richter (Zahl oder Bildvergleich im echten Spiel — misst das Ergebnis) | Stand |
|---|---|---|---|---|---|
| 0 Werkstoff-Gesetz | Stoffe aus Bestandteilen (Studio) | Legierung folgt aus Physik | nur Studio, Band in der Welt ungemessen | Bildpaar Klinge Bronze ↔ Stahl im Studio, Kennwerte im Messband | HEUTE (nur Studio) |
| 1 Eine Kette | 3 Waren: Erz → Barren → Werkzeug | Erz liegt, wo die Geologie es legt | Band an der Dorf-Station | Zeitraffer 1 Spieltag, 3 Bilder: Halde sichtbar kleiner, Barren am Ofen, Werkzeug in der Hand eines Bewohners | |
| 2 Dorf-Wirtschaft | 10 Waren, Kettentiefe ≤ 3 | Mengen erhalten sich: was verschwindet, war verbraucht | Band bei 100 Bewohnern | Zählung im Bild an Lager, Werk, Haushalt über 7 Spieltage: sichtbar hinein = sichtbar hinaus ± 10 % | |
| 3 Stadt-Gewerbe | 10² Waren, Tiefe ≤ 5 | Rezepte folgen aus Stoff-Gesetzen | Band in einer Stadt mit 10³ Werken | Stichprobe 20 Saaten: Warenkorb passt zu Geologie und Klima (kein Glas ohne Sand und Brennstoff) ≥ 90 %; H ≥ 10 | |
| 4 Region | 10³ Waren, Tiefe ≤ 8 | Werkstück wandelt sich Schritt für Schritt | Band mit 10⁴ Werken im Blick | Bildvergleich je Werkstatt-Typ gegen Referenzfoto/Stich: Blind-Urteil „echt" ≥ 70 %; H ≥ 10² | |
| 5 Industrie-Nation | 10⁴ Waren, Gussteil, Draht, Chip mit Zwischenprodukten | jede Ware rückverfolgbar bis zur Lagerstätte | Band in einer Industriestadt | Stichprobe 50 Waren im Bild: Kette bis Gestein 100 %; H ≥ 10³ | |
| 6 Planet | 10⁷ Warenformen über alle Epochen (die Breite der Artikel, nicht der Klassen) | Abfall, Rückgewinnung, Verbrauch schließen den Kreis | Band an jedem Ort des Planeten, unabhängig von seiner Größe | Stichprobe 100 Saaten × 10 Epochen: plausible Warenkörbe (gegen historische Inventare) ≥ 95 %; H ≥ 10⁴ | |
| 7 Vision | 10⁹ Warenformen über Sonnensysteme, Zeitalter, fremde Zivilisationen | fremde Stoffe, fremde Rezepte, gleiche Gesetze | Band am Raumhafen | Bild am Hafen eines fremden Planeten: ≥ 10³ verschiedene Waren im Blick, jede mit abrufbarer Kette bis zu ihrem Gestein; H ≥ 10⁵ | |

### L2 Berufe: Arbeit, die man sieht
Misst, wie viele Berufe die Bewohner ausüben — erkennbar an Handlung, Werkzeug und sich änderndem Werkstück — und wie viele Menschen zugleich arbeiten.

| Sprosse | Umfang | Tiefe | Preis | Richter | Stand |
|---|---|---|---|---|---|
| 0 Werk-Ort | 3–5 Rollen (hof · markt · Art des Werks) | Bewohner steht zur Uhr am Werk, das Werkstück bleibt | Band an der Test-Stadt (118 Bewohner) ungemessen für Arbeit | Schmiede 10 Uhr besetzt / 2 Uhr leer (alte Karte K2: 2/0) | HEUTE |
| 1 Handlung | 10 Berufe mit eigener Bewegung | Hammer trifft, Werkstück ändert Form | Band mit 40 Arbeitenden im Nahbereich | Bildpaar 10 Berufe: Blind-Rater erkennt den Beruf aus 1 Bild ≥ 80 % | |
| 2 Zünfte | 10² Berufe, Lehrling/Geselle/Meister | Können ändert Ergebnis (Fehlguss, Meisterstück) | Band an einer Stadt mit 10³ Bewohnern | ≥ 30 Berufe im Bild an einer Stadt-Station; Güte des Werkstücks korreliert mit Rang ≥ 0,6 | |
| 3 Arbeitsteilung | 10³ Berufe, entstanden als Bündel von Umwandlungen | Schichten, Pendeln, Betrieb mit Hierarchie | Band an einer Stadt mit 10⁵ Bewohnern | Stichprobe 1 000 Bewohner: Beruf passt zu Werk, Uhrzeit und Epoche ≥ 95 %; H ≥ 10 | |
| 4 Epochen-Breite | 10⁴ Berufe über Epochen, Faustkeil bis Lithografie | jeder Beruf trägt das Werkzeug seiner Zeit | Band in jeder Epoche | Bildvergleich je Epoche gegen Stich, Foto, Film: Blind-Urteil „passt zur Zeit" ≥ 75 %; H ≥ 10² | |
| 5 Tokio-Maß | 10⁷ Arbeitende in einer Stadt | jeder f(Same, Zeit), am Ort wiederfindbar ± 2 m | Band im Berufsverkehr | Turmblick zur Rushhour: ≥ 10⁵ sichtbare Arbeitende und Pendler; Rückkehr nach 1 h an denselben Arbeitsplatz 100 % | |
| 6 Vision | 10⁸ Arbeitende in einer Megastadt jenseits jeder irdischen, 10¹⁰ über Planeten, Berufe fremder Arten | der Spieler kann jeden Beruf selbst ergreifen | Band im Turmblick über die Megastadt | Turmblick ≥ 10⁶ sichtbare Arbeitende; Stichprobe 100 zufällige Berufe: Spieler übt jeden nach ≤ 60 s Einweisung aus, Werkstück entsteht, ≥ 90 % | |

### L3 Markt und Geld: der Preis als Schatten der Welt
Misst, ob Preise aus Knappheit, Weg und Bedarf entstehen und der Spieler sie am Laden, an der Straße, am Gesicht spürt.

| Sprosse | Umfang | Tiefe | Preis | Richter | Stand |
|---|---|---|---|---|---|
| 0 Besitz | Spieler-Inventar (27 Plätze) | Ding hat Ort und Besitzer, keinen Wert | Band ungemessen | Inventar überlebt Neustart | HEUTE |
| 1 Tausch | Spieler ↔ Bewohner, Ware gegen Ware | Bewohner gibt nur, was er hat | Band am Markt | Bestand des Stands sinkt sichtbar nach Kauf, füllt sich nur aus Herstellung (Zähler Ware rein = Ware raus) | |
| 2 Ein Markt | 1 Markt, 10 Waren | Knappheit treibt Preis | Band am Markt | Missernte-Probe: Brotpreis steigt ≥ 30 % binnen 3 Spieltagen, fällt nach Ernte wieder | |
| 3 Geld und Gefälle | 10 gekoppelte Märkte, Warengeld → Münze | Münzwert aus Metallgehalt, Teuerung bei Münzverschlechterung | Band am Markt | Korrelation Preis ↔ Wegkosten vom Herkunftsort ≥ 0,7 über 10 Märkte | |
| 4 Kontinent | 10³ Märkte, Kredit, Wechsel, Bank | Arbitrage schließt Preislücken | Band in einer Handelsstadt | Arbitrage-Probe: Spanne des Spielers halbiert sich in ≤ 30 Spieltagen, weil Bewohner-Händler nachziehen | |
| 5 Weltwirtschaft | 10⁵ Märkte, Börse, Papiergeld | Blasen und Krisen entstehen, nicht gesetzt | Band in einer Börsenstadt | Stichprobe 20 Saaten × 200 Jahre: Preisreihen mit fetten Rändern und Volatilitäts-Clustering ≥ 80 %; Bildpaar dieselbe Straße Boom ↔ Krise: Blind-Urteil erkennt die Krise ≥ 80 % | |
| 6 Vision | 10⁷ Märkte über Sonnensysteme | Lichtlaufzeit, Startenergie, interstellarer Kredit als Preis | Band am Raumhafen | Probe zweier Planeten: Preisunterschied ≈ Transportkosten ± 20 %, eine Nachricht wirkt erst nach Lichtlaufzeit | |

### L4 Fernhandel: Karawanen, Häfen und Wege
Misst, ob sichtbare Transporte echte Ladung auf sinnvollen Routen tragen und ihre Menge der Nachfrage folgt.

| Sprosse | Umfang | Tiefe | Preis | Richter | Stand |
|---|---|---|---|---|---|
| 0 Fahrt ohne Fracht | 1 Wagen je 15 Häuser in städtischen Siedlungen | Fahrgesetz, keine Ladung | Band ungemessen (Pflicht C: keine Station) | Zähler Wagen auf den Wegen einer Stadt | HEUTE (Menge im Kern, keine Station) |
| 1 Fracht | 1 Wagen trägt Ware von Werk zu Markt | Ladung sichtbar und gezählt | Band in der Stadt | Bildpaar Wagen leer ↔ beladen; Ware am Ziel = Ware am Start | |
| 2 Karawane | 10 Routen zwischen Siedlungen | Tier, Wagen, Träger je Gelände | Band auf der Route | gewählte Route ≤ 10 % teurer als die billigste (ORBIS-Maß) | |
| 3 Hafen | 10² Routen, Fluss und See | Segelzeit aus Wind und Strömung je Monat | Band an der Hafen-Ankunft | Bildvergleich Hafenstadt gegen historische Ansicht: Blind-Urteil ≥ 70 %; Schiffe mit Ladung ≥ 80 % | |
| 4 Netz | 10³ Knoten, Pässe, Furten, Zölle | Verkehr folgt Anziehung der Märkte | Band an einem Pass | Verkehrsdichte im Bild je Straße korreliert mit dem Gravitationsmodell ≥ 0,7 | |
| 5 Globus | 10⁵ Routen, Bahn, Container, Luft | Modus nach Epoche, Fahrplan | Band am Containerhafen | ≥ 10⁴ sichtbare Frachtbewegungen am Hafen; Fracht folgt Nachfrage (Korrelation ≥ 0,6) | |
| 6 Vision | Handelsnetze über Sonnensysteme | Bahnfenster, Startenergie, Reisezeit in Jahren | Band am Raumhafen | Frachter starten nur im Bahnfenster, Ladung stammt aus einer Kette L1, Ankunft nach der Reisezeit | |

### L5 Erfindungspfade: Faustkeil bis Halbleiter, und anders
Misst, ob Technik aus Voraussetzungen wächst, verschiedene Saaten plausibel verschiedene Pfade gehen und der Spieler den Pfad am selben Ort durch die Zeit bereisen kann. Umfang ist die Vielfalt der Pfade, nicht die Länge einer Technik-Liste.

| Sprosse | Umfang | Tiefe | Preis | Richter | Stand |
|---|---|---|---|---|---|
| 0 Tafeln | ≈ 5 Kultur-Werkstoffe (Studio) und eine Epochen-Tafel der Stadt (antike, mittelalter, hanse … je Region, Jahr, Tracht) | Werkstoff folgt Physik, Epoche folgt Liste | Studio; Stadt im Band ungemessen | Klinge je Tradition im Studio-Bild; Kirche der Epoche im Stadtplan | HEUTE (Liste, nicht gewachsen) |
| 1 Voraussetzung | 10 Techniken (Stein, Feuer, Keramik, Kupfer, Bronze, Eisen …) | jede verlangt Stoff + Temperatur + Vorgänger | Band | Stichprobe 20 Saaten: 0 Techniken im Bild ohne erfüllte Voraussetzung (kein Eisen ohne Ofen ≥ 1 200 °C) | |
| 2 Divergenz | 10² Techniken, ≥ 5 Pfade | Lage wählt Pfad (ohne Zinn kein Bronze-Zeitalter, ohne Zugtier kein Wagen) | Band | Stichprobe 50 Saaten: ≥ 5 verschiedene Pfadfolgen, jede plausibel gegen reale Vergleichsfälle (Mesoamerika, Subsahara-Eisen) | |
| 3 Im Bild | 10³ Techniken als sichtbare Dinge | jede Technik erscheint in Werkzeug, Bau, Fahrzeug | Band in jeder Epoche | Bildvergleich je Epoche: Artefakte passen zum Pfad, Blind-Urteil ≥ 80 %; H ≥ 10 | |
| 4 Ausbreitung | 10⁴ Techniken bis Dampf, Elektrik, Chemie | Wissen wandert über das Handelsnetz (L4) | Band | Zeitraffer 500 Jahre: Ausbreitungsgeschwindigkeit einer Erfindung korreliert mit Handelsdichte ≥ 0,6; H ≥ 10² | |
| 5 Halbleiter | Kette Sand → Silizium → Wafer → Chip, ≥ 10 Pfade dorthin | lückenlose Kette | Band in einer Chipstadt | von 100 Saaten erreichen manche in ≤ 10⁴ Spieljahren eine Halbleiter-Epoche, mit lückenloser Kette, ≥ 10 verschiedene Pfade (Anteil offene Frage); H ≥ 10³ | |
| 6 Zeitreise | 10 Epochen eines Orts | jede folgt aus der vorigen, der Ort bleibt erkennbar | Band und Ankunft ≤ 5 s bei jedem Epochensprung | Spieler springt 10 Epochen am selben Ort: 0 Werkzeuge ohne Vorgänger, Straßenverlauf und Lagerstätte wiedererkennbar (Bildvergleich ≥ 80 %) | |
| 7 Vision | fremde Zivilisationen mit fremder Chemie, ≥ 10 Pfade jenseits unserer | Biotechnik statt Metall, Technik jenseits unserer | Band auf einem fremden Planeten | Blind-Urteil je fremdem Pfad: „folgt aus seinen Stoffen" ≥ 80 % UND „kommt in unserer Geschichte nicht vor" ≥ 80 % | |

### L6 Kopplung: Wirtschaft formt die Welt
Misst, ob Arbeit und Handel Landschaft, Stadt und Verkehr sichtbar formen — und umgekehrt.

| Sprosse | Umfang | Tiefe | Preis | Richter | Stand |
|---|---|---|---|---|---|
| 0 Bedarf im Plan | Siedlung kennt Kirche, Gasthaus, Schmiede, Markt | Gründung am Brunnen/Kreuzung/Markt | Band ungemessen | Markt und Schmiede in jedem Dorf-Plan ab 10 Häusern | HEUTE |
| 1 Spur | eine Mine hinterlässt Halde, ein Ofen Rodung | Spur bleibt (Gedächtnis der Welt) | Band am Hüttenort | Bildpaar vor/nach 1 Spieljahr: Waldrand sichtbar zurückgewichen, Halde gewachsen | |
| 2 Lage formt Gewerbe | 10 Gewerbe nach Lage (Mühle am Bach, Gerber flussab) | Standort folgt aus Gesetz | Band | Stichprobe 20 Dörfer: Mühlen an fließendem Wasser 100 %, Gerber flussab ≥ 90 % | |
| 3 Handel formt Stadt | Stadtgröße und Ort folgen Handelsvolumen | Großstädte an Küste, Fluss, Pass | Band über einem Kontinent | Stichprobe 50 Saaten: Großstädte an Handelsknoten ≥ 80 % UND Stadtgrößen-Exponent 0,8–1,2 (Zipf) ≥ 80 % | |
| 4 Kaskade | Vulkan → Erz → Bergstadt → Straße → Hafen | Ereignis wandert durch die Kette | Band | Erz-Erschöpfung lässt die Bergstadt in ≤ 50 Spieljahren schrumpfen, Halde bleibt, Hafen verliert Fracht | |
| 5 Industrielandschaft | Kanäle, Tagebau, Bahnen, Smog | Umweltfolgen sichtbar und messbar | Band in der Industrielandschaft | Bildvergleich gegen Industrie-Landschaftsfoto (Ruhrgebiet 1900, Tagebau): Blind-Urteil ≥ 70 % | |
| 6 Vision | Planeten, deren Antlitz die Wirtschaft von Äonen trägt | Rückkopplung Klima ↔ Industrie | Band im Orbit-Blick | Orbit-Bild eines Samens nach 10⁴ Jahren: Nachtlichter, Routen, Abraum folgen den Ketten L1/L4 (Korrelation ≥ 0,7) | |

### L7 Energie: die Kraft hinter jeder Umwandlung (neu)
Misst, ob jede Arbeit Energie kostet, ob die verfügbare Quelle bestimmt, wie viel eine Zivilisation umwandeln kann, und ob der Spieler das sieht.

| Sprosse | Umfang | Tiefe | Preis | Richter | Stand |
|---|---|---|---|---|---|
| 0 — | keine Energie-Größe in der Wirtschaft | — | — | — | HEUTE (keine Sprosse) |
| 1 Muskel und Feuer | Arbeit kostet Nahrung, Ofen kostet Holz | Brennwert aus der Stoff-Tafel | Band am Dorf | Holzstapel am Ofen sinkt sichtbar je Schmelze; ohne Holz kein Barren | |
| 2 Wasser und Wind | Mühlen, Hammerwerke | Leistung folgt Abfluss und Wind des Wetters | Band | Bildpaar Flaute ↔ Wind: Windmühle steht ↔ dreht, Mehl am Markt knapper (L3) | |
| 3 Kohle und Dampf | Zechen, Dampfmaschinen | Warenstrom je Kopf springt mit der Quelle | Band in einer Kohlestadt | Warenstrom je Arbeitendem (L1) steigt ≥ 10× über den Übergang zum Dampf, Rauch über den Werken | |
| 4 Strom | Kraftwerke, Netze, Licht | Ausfall wandert durch das Netz | Band bei Nacht über einer Stadt | Ausfall-Probe: Kraftwerk aus → dieselben Viertel dunkel, Werke stehen, Bildpaar | |
| 5 Planet | Energiebilanz einer Zivilisation | Verbrauch je Kopf folgt Quelle und Epoche | Band im Orbit-Blick | Orbit-Nachtbild gegen Satelliten-Nachtbild der Erde: Blind-Urteil „wirklich" ≥ 70 % | |
| 6 Vision | Fusion, Sonnenkollektoren im Orbit, Energie über Sonnensysteme | Energie bestimmt Reichweite der Zivilisation | Band am Raumhafen | Stichprobe 20 Saaten: Größe der besiedelten Zone korreliert mit verfügbarer Energie ≥ 0,7 | |

### L8 Der Spieler als Wirtschaftender (neu)
Misst, ob der Spieler in jeder Rolle der Wirtschaft eingreifen kann und die Welt ohne Skript antwortet.

| Sprosse | Umfang | Tiefe | Preis | Richter | Stand |
|---|---|---|---|---|---|
| 0 Benutzen | Werkstatt-Werk wird benutzt (alte Karte K5), Ernte von Kraut | Ding mit Gebrauch, ohne Wert | Band ungemessen | ein gebautes Werk dient | HEUTE |
| 1 Herstellen | Spieler stellt eine Ware her, die ein Bewohner braucht | Ware geht in den Verbrauch | Band am Dorf | ein Bewohner trägt oder benutzt die Ware des Spielers am nächsten Tag | |
| 2 Gründen | Spieler gründet ein Werk | Bewohner nehmen Arbeit an, Angebot steigt | Band am Dorf | nach 7 Spieltagen arbeiten Bewohner im Werk, Preis der Ware am Markt sinkt ≥ 15 % | |
| 3 Unternehmen | Werk mit 10³ Arbeitenden | Stadt wächst um das Werk | Band in der Stadt | Bildpaar vor/nach 10 Spieljahren: neue Häuser und Wege um das Werk, Pendlerstrom dorthin | |
| 4 Jede Rolle | Bauer, Reeder, Bankier, Erfinder, Zentralbank | Eingriff wandert durch Märkte und Ströme | Band | 10 zufällige Rollen × 3 Epochen: der Eingriff ändert Preise oder Ströme messbar ≥ 90 % | |
| 5 Vision | jede Rolle in jeder Epoche, auf jedem Planeten, in jedem Maßstab vom Lehrling bis zur Handelsmacht eines Sonnensystems | die Welt antwortet ohne Skript | Band | Stichprobe 100 Rollen × Epochen × Planeten: Einweisung ≤ 60 s, Eingriff wirkt sichtbar ≥ 90 % | |

## Stand heute

- **Berufe:** der Bewohner trägt `beruf` = Art seines Werks, `markt` am Platz, ohne Werk `hof` (`stamm/siedlung-bewohner.js:785`). Der Kern wählt den Arbeitsort (`tetrapoda zielWahl`, `:399–416`, ohne Kern Pflicht-Bruch). Alte Karte Menschen K2: Schmiede um 10 Uhr besetzt, um 2 Uhr leer (2/0). Die Arbeit selbst ändert kein Werkstück — der Bewohner steht am Werk.
- **Waren:** der Marktstand der Ausstattung („Plane und Waren", `fachwerk-core.js:5421`), dazu Kisten am Gasthaus (`:3227`) und ein Tränktrog an der Schmiede (`:3231`) als Gestalt — Dekor ohne Bestand, ohne Herkunft, ohne Verbrauch. Grep nach Preis, Münze, Geld, Vorrat, Handel, Ware in `stamm/`: 0 wirtschaftliche Treffer (Vorrat ist dort der Ofen-Vorrat der Gestalten, Preis der Rechen-Preis). Lagerstätten im Gelände: nichts.
- **Werkstoff:** die EINE Misch-Regel für Legierung und Verbund (`schmiede-core.js:2911–2921`, Bronze 0,88 Kupfer + 0,12 Zinn, `loest` als gelöstes Atom, `:2874–2875`), Kultur-Traditionen als Tafel — nur im Studio, kein Strom in der Welt.
- **Epochen:** eine Epochen-Tafel der Stadt (`fachwerk-core.js:3294`: antike, mittelalter, hanse … je Region, Jahr, Spanne, Tracht) und die Kirche je Epoche (`:3697–3700`) — Zeit als Liste, keine Technik, die aus einer anderen folgt.
- **Besitz:** Spieler-Inventar 27 Plätze (`stamm/dirigent-kern.js:736`); Ernte von `kraut` für Alchemie (`stamm/bau-vorlagen.js:1857`).
- **Verkehr:** je 15 Häuser einer städtischen Siedlung ein Wagen (`fachwerk-core.js:4070`, `hausJeWagen: 15`), ohne Ladung; Pflicht-OFFEN C: noch keine Station.
- **Stadt-Plan:** das Dorf kennt Kirche · Gasthaus · Schmiede · Brunnen (`fachwerk-core.js:3279`); die Schmiede ab 10 Häusern, Gasthaus und Kirche ab 8 (`:3698–3704`).
- **Messung 14.11.:** Test-Stadt 35 Häuser, 118 Bewohner — kein Gut wechselt dort den Besitzer; kein Band-Wert der Wirtschaft existiert, weil es keine Wirtschaft gibt, die kostet.

Ehrlicher Befund: Arbeit steht auf Sprosse 0 (Ort zur Uhr), Stoffstrom, Markt, Fernhandel und Spieler-Wirtschaft stehen auf Sprosse 0 nur als Keim (Werkstoff im Studio, Inventar, Wagen ohne Fracht, Werk mit Gebrauch), Energie hat keine Sprosse; keine einzige Ware hat in der Welt eine Herkunft, und der Gesetz-Hebel jeder Leiter ist heute ≤ 1 (was es gibt, steht als Liste).

## Abhängigkeiten

- **Planet und Geologie: das Innere und die Kruste** — Lagerstätten (Erz, Salz, Kohle, Sand) müssen aus der Geologie fallen, bevor L1 Sprosse 1 Herkunft hat.
- **Physik und Stoff** — die Umwandlungs-Rezepte brauchen EINE Stoff-Tafel in SI (Schmelzpunkt, Härte, Brennwert), heute nur im Schmiede-Studio; L7 liest denselben Brennwert.
- **Atmosphäre, Wetter und Wasser** — L7 Sprosse 2 (Mühle bei Wind und Abfluss), L3 Missernte.
- **Pflanzen und Biome / Nahrung, Landwirtschaft und Kulturlandschaft** — Holz, Faser, Nahrung sind die ersten Waren; Missernte-Probe (L3) braucht Ernte aus Wetter.
- **Netze, Verkehr und Stadtstoffwechsel** und **Fahrzeuge und Maschinen** — L4 setzt Verkehr mit Ladung (Pflicht C) voraus; Grenze: dort die Bewegung, hier die Fracht und ihr Wert. Das Stromnetz als Bauwerk liegt dort, seine Last hier (L7).
- **Der Mensch: Geist, Alltag, Lebenslauf** und **Millionen: Bevölkerung, Masse und Strom** — L2 setzt Tagesplan und Menge voraus; hier zählt die Arbeit, dort das Leben.
- **Menschenzeit: Epochen und Geschichte** — L5 liefert die Technik-Spine, Epochen liefern Ereignis und Gesellschaft; L5 Sprosse 6 (Zeitreise) teilt den Ort mit der Zeitreise dort.
- **Macht, Recht und Konflikt** — Zunftrecht, Zoll, Steuer, Zentralbank (L8); **Kultur, Sprache, Glaube und Wissen** — Wissensweitergabe (L5 Ausbreitung).
- **Siedlung und Stadt / Architektur** — Werkstatt-Innenräume, Hafenbauten; **Spur, Verfall und Gedächtnis** — Halden und Rodung (L6 Sprosse 1).
- **Kopplung, Kaskade und Katastrophe** — L6 ist der wirtschaftliche Zweig dieser Leiter.
- **Der Same: Architektur der Entfaltung / Maßstab-Kontinuum** — ohne den Übergang fern/nah ist L2 ab Sprosse 5 und L3 ab Sprosse 4 außerhalb des Bands.

## Was die alte Karte hier misst

- **Menschen und Bewohner K2 Tagesablauf** (Rolle × Uhr × Ort, Schmiede 10/2 Uhr) → L2 Sprosse 0.
- **Menschen K1 Besiedlung** (Bewohner je Haus) → Voraussetzung für L2 Sprosse 2+.
- **Siedlung (Bereich 24)** mit Gründungs-Gesetz und Rollen (Gasthaus, Schmiede, Markt) → L6 Sprosse 0.
- **Spieler-Bauen K5** (das Werk wird benutzt) → L8 Sprosse 0.
- **Stoffe und Chemie (Bereich 4)**, „EINE Stoff-Tafel in SI" → Voraussetzung L1 Sprosse 2 und L7 Sprosse 1.
- **Fahrzeuge (Bereich 23)** und Pflicht-OFFEN C (Verkehr) → L4 Sprosse 0–1.
- **Unbewertet:** „Spielschleife und Sinn — Ressourcen-Ökonomie" steht ausdrücklich außerhalb der alten Karte (`MEISTERKARTE.md:1143`). Markt, Geld, Fernhandel, Energie, Erfindungspfade und Spieler-Wirtschaft misst die alte Karte gar nicht.

## Zweifel

- Die Größenordnungen der oberen Sprossen (10⁹ Warenformen, 10¹⁰ Arbeitende) sind aus HS-, Artikel-, SOC- und Bevölkerungszahlen hochgerechnet, nicht hergeleitet; die Zahl irdischer Einzelartikel (Hunderte Millionen) ist eine Schätzung.
- Blind-Rater-Richter brauchen ein Rater-Gremium oder ein fixiertes Bildmodell als Ersatz — ob ein Bildmodell als Richter fair ist, ist offen.
- Der Gesetz-Hebel H braucht eine Zählregel für „verschiedene Form" (wann sind zwei Messer zwei Waren?) — ohne sie ist er dehnbar.
- L5 Sprosse 5: welcher Anteil der Saaten den Halbleiter erreichen SOLL, ist wissenschaftlich ungeklärt — offene Frage, kein Punkt; die Sprosse zählt nur Pfadvielfalt und lückenlose Kette.
- Preis-Statistik-Richter (fette Ränder, Clustering) setzen Agenten-Märkte voraus, die in Echtzeit auf Laptop-Grafik nie gezeigt wurden; ob die Fern-Fassung die Statistik erhält, ist unbewiesen.
- Die Grenze zu „Netze, Verkehr" und „Menschenzeit" ist gezogen, aber Fracht ohne Fahrzeug und Technik ohne Epoche sind nicht trennbar — Doppelzählung droht beim Verdichten.

## Gegenlese — was sich änderte und was strittig bleibt

- **Preis:** jede Sprosse trägt jetzt das Band (≤ 33 ms · ≤ 5 s · 0 MB) an der Stelle ihres Richters; gestrichen sind Bauweisen in der Preis-Spalte („fern als Feld", „Stoffstrom ≤ 0,2 ms CPU", „Preisrechnung ≤ 0,1 ms", „Takt fern 0") — sie schrieben einen Weg vor statt das Ergebnis.
- **Fleiß statt Fähigkeit:** neu ist der Gesetz-Hebel H; ohne ihn erreichte eine Liste mit 10⁴ Berufen Sprosse 4. L5 zählt nun Pfadvielfalt statt Technik-Mengen.
- **Gehoben:** L1 Planet 10⁵ → 10⁷, Vision 10⁶ → 10⁹ (Artikel, nicht HS-Klassen); L2 Metropole 10⁶ → 10⁷ (das Tokio-Maß) und Vision 10⁸ je Megastadt, 10¹⁰ über Planeten; L3, L4 Vision von einem Sonnensystem auf Sonnensysteme; Containerhafen 10³ → 10⁴ Bewegungen.
- **Entdoppelt:** „Großstädte an Handelsknoten" stand in L4 S4 und L6 S3 — jetzt nur L6 S3; L4 S4 misst den Verkehr gegen das Gravitationsmodell.
- **Neu:** L7 Energie (ohne sie ist der Stoffstrom kostenlos und die Industrie-Sprossen ohne Ursache), L8 Spieler als Wirtschaftender (L2 S6 maß nur Mitmachen, nie die Antwort der Welt), L5 S6 Zeitreise am selben Ort.
- **Stand berichtigt:** der Marktstand (`fachwerk-core.js:5421`) stimmt, ergänzt um die Rollen-Requisiten `:3227/:3231`; die Misch-Regel steht bei `:2911–2921`; die Epochen-Tafel (`:3294`) fehlte; `hausJeWagen` = 15 belegt. Bestätigt: `beruf` (`siedlung-bewohner.js:785`), Inventar 27, 0 Wirtschafts-Treffer in `stamm/`.
- **Strittig:** ob L1 (Stoffstrom) und L5 (Erfindung) nicht EINE Leiter über denselben Rezept-Graphen sind — getrennt gelassen, weil L1 Menge im Raum, L5 Pfad in der Zeit richtet; ob H eine faire Zählregel bekommt; ob 10⁶ sichtbare Arbeitende im Band je möglich sind (R1 verlangt die Sprosse trotzdem).
