# Siedlung und Stadt

## Die Vision hier

Eine Siedlung ist kein Platz voller Häuser, sondern die Spur von Menschen (oder fremden Wesen) auf einem Boden über die Zeit: vom einzelnen Hof am Bach über das Dorf, die ummauerte Marktstadt und die Industriestadt bis zur Megastadt, gegen die Tokio (37–41 Mio. Menschen, ~8 500 km² bebaut) eine Kleinstadt ist — und darüber hinaus bis zur Planetenstadt, deren Landfläche ganz bebaut ist, und zur Stadt, die den Boden verlässt und bis in den Orbit wächst. Jenseits der Gegenwart heißt hier: eine Stadt von 100 Mio. Bewohnern und 10 Mio. Gebäuden, vom Turm aus bis zum Horizont durchgehend bebaut, ohne dass der Spieler je dieselbe Straße zweimal sieht, mit erkennbarem Zentrum, Vierteln, Rändern, dem Slum am Hang und dem Turm im Bankenviertel, mit vertikalen Schichten — Unterwelt, Straße, Brückenebene, Dachstadt — und Arkologien, in denen eine einzige Struktur eine Großstadt trägt. Jede Stadt ist eine Funktion (Same, Ort, Jahr, Kultur): dieselbe Stadt lässt sich durch 5 000 Jahre hindurch betrachten, vom Lehmhaus-Tell bis zur Glasschlucht, und sie entsteht dort, wo Fluss, Küste, Pass und Ressource sie verlangen — auf jedem Planeten, in jeder Kultur, auch in einer, die kein Mensch je gebaut hat. Sie antwortet: baut der Spieler eine Brücke, wächst die Stadt zu ihr; brennt ein Viertel, entsteht ein neues nach dem Wert des Bodens. Und all das ohne Download, im ersten Blick binnen 5 s und mit 33 ms je Bild.

## Das Beste der Gegenwart

- **Cyberpunk 2077 / Night City** (CDPR 2020): die dichteste vertikale Spiel-Stadt, Schätzungen 24–100 km² (keine offizielle Zahl), sechs Bezirke von Hand; Grenze: handgebaut, eine Epoche, die meisten Gebäude nicht begehbar, Download ~70 GB.
- **Assassin's Creed Unity** (Ubisoft 2014): Paris 1789 nahezu 1:1, > 5 000 NPC im Bild, jedes vierte Gebäude eingerichtet; Grenze: eine Stadt, ein Jahr, von Hand.
- **The Matrix Awakens / City Sample** (Epic 2021): ≈ 7 000 Gebäude, 260 km Straße aus Houdini-Regeln, ~35 000 Fußgänger simuliert; Grenze: offline gebacken, Gigabytes, eine Stadtform.
- **Microsoft Flight Simulator 2024** (Asobo): die ganze Erde, > 500 Photogrammetrie-Städte, der Rest prozedurale Gebäude auf Luftbild; Grenze: Datenstrom aus der Cloud, aus der Nähe Kästen, keine Geschichte, keine Innenräume.
- **Esri CityEngine / CGA** (Parish & Müller 2001, Müller et al. 2006): Netz → Block → Parzelle → Masse → Fassade aus Regeln; Grenze: Eingabekarten von Hand, offline.
- **Manor Lords** (2024) und **Cities: Skylines II** (2023): Wachstum aus Bedarf, Parzellen an der Straße; Grenze: Spieler-gesteuert, eine Kultur, Zehntausende statt Millionen sichtbar.
- **No Man's Sky / Elite Dangerous** als Gegenbeispiel: Planeten aus einem Samen, aber Siedlungen als wenige wiederholte Bausätze — Umfang ohne Stadt-Tiefe; genau die Falle, die L1 mit dem Wiederholungs-Richter versperrt.
- **Realität, Stadtwissenschaft:** Bettencourt et al. (PNAS 2007, Science 2013) — Infrastruktur skaliert mit Bevölkerung ∝ N^0,85, Sozioökonomie ∝ N^1,15; Zipf-Rangverteilung der Städte (Exponent ≈ 1); Clark-Dichtegradient (Dichte fällt exponentiell vom Zentrum); Kowloon Walled City: ~300–350 Gebäude zu 10–14 Geschossen auf 2,6 ha, 1,2–1,9 Mio. Menschen/km² — die dichteste je gemessene Wohnform; das Nachtlicht-Bild der Erde aus dem Orbit (NASA „Black Marble") als Abdruck des planetaren Siedlungsnetzes.
- **Space Syntax** (Hillier, UCL): die Integration eines Straßennetzes sagt Fußgängerströme und Lage der Zentren voraus — ein messbares Gesetz der Stadtform.

## Der Same

**Die Stadt ist das Gleichgewicht aus Erreichbarkeit und Bodenwert über die Zeit:** jeder Ort trägt einen Wert aus Wasser, Boden, Gefälle und Erreichbarkeit im Netz; das Netz wächst zu den Werten, der Wert wächst am Netz, und jede Parzelle wird in jeder Epoche so hoch und dicht bebaut, wie ihr Wert und die Bautechnik des Jahres erlauben (Alonso-Muth-Mills: Bodenrente → Dichte → Höhe). Daraus fallen von selbst Zentrum und Rand, der Turm im Kern, das Gewerbe an der Ausfallstraße, der Slum am steilen, schlecht erschlossenen Hang, und die Jahresringe, weil die alte Parzelle bleibt, bis ihr Wert den Neubau trägt. Gelöst haben das schon die **Stadtökonomie** (das monozentrische Modell, von Thünens Ringe) und die **Raumplanung/Verkehrsmodellierung** (Land-Use-Transport-Interaction-Modelle wie UrbanSim, die Jahrzehnte von Stadtwachstum aus diesem Kreislauf rechnen); im Spiel fehlt bisher nur, es als reine Funktion von (Same, Ort, Jahr) auszuwerten statt als Simulation zu takten. Derselbe Kreislauf eine Ebene höher — Städte als Knoten eines Handelsnetzes, dessen Wert die Lage der nächsten Stadt bestimmt (Christaller, zentrale Orte) — trägt das Siedlungsnetz eines Planeten bis zur Ökumenopolis; ein Eingriff (Brücke, Brand, Vulkan) ist nur ein geänderter Wert im selben Gleichgewicht.

## Der Preis jeder Sprosse (P)

„P" in der Preis-Spalte heißt, und gilt in JEDER Sprosse zusammen mit Umfang und Tiefe, im selben Lauf wie der Richter: Frame-p95 ≤ 33 ms an den Richter-Posen auf Radeon 890M und GTX 1060, Ego und Third · Ankunft an der Richter-Pose kalt ≤ 5 s (bei Sprossen mit Flug/Zeitsprung: der Sprung ≤ 5 s) · kein Download über den Skript-Bestand hinaus (heute ~13 MB), und dieser Bestand wächst nicht mit dem Umfang der Sprosse. Ein Richter, der ohne P-Zeile gefahren wurde, hält die Sprosse nicht.

## Die Leitern

### L1 · Größe: eine zusammenhängende Stadt, bei vollem Preis
Misst, wie groß eine einzelne Siedlung werden kann, die der Spieler betritt und überblickt — und dass Größe nicht durch Kopie entsteht: jede Sprosse trägt den Wiederholungs-Richter (Anteil sichtbar gleicher Fassaden/Straßenzüge in zufälligen Straßenbildern).

| Sprosse | Umfang | Tiefe | Preis | Richter (Zahl oder Bildvergleich im echten Spiel — misst das Ergebnis) | Stand |
|---|---|---|---|---|---|
| 1 Weiler | 10 Gebäude, 30 Bewohner | Häuser mit Tür, Dach, Hof, keine zwei gleich | P | Bild vom Ortsrand: ≥ 10 Häuser, paarweise unterscheidbar, P-Zeile am Ort | HEUTE (Start-Dorf 12 Häuser liegt in den E-Messorten, GTX p95 16,8 ms — der Dorf-Zug ruht dort) |
| 2 Dorf/Marktstadt | 100 Gebäude, 300 Bewohner | Platz, Kirche/Markt, Mauer | P | Bild vom Hügel: ≥ 100 Häuser im Blick, Wiederholung ≤ 10 %, P am Marktplatz | Umfang erreicht (Stadt des Worts 300 Häuser, 1,08 Mio. Dreiecke), P an der vollen Stadt nie gemessen → nicht gehalten |
| 3 Kleinstadt | 1 000 Gebäude, 5 000 Bewohner | Viertel unterscheidbar | P | Bild vom höchsten Punkt; Wiederholung ≤ 5 % in 100 Straßenbildern; P | |
| 4 Großstadt | 10 000 Gebäude, 100 000 Bewohner | Innenstadt, Vorstadt, Gewerbe | P | Flug quer durch die Stadt mit 100 m/s: kein Frame > 50 ms, kein sichtbarer Formsprung im Bildpaar nah/fern; Wiederholung ≤ 2 % | |
| 5 Metropole | 100 000 Gebäude, 2 Mio. Bewohner | Skyline lesbar aus 20 km | P | Skyline-Bild aus 20 km gegen Foto einer realen Metropole: Höhenprofil-IoU ≥ 0,6; Ankunft im Zentrum ≤ 5 s | |
| 6 Megastadt | 1 Mio. Gebäude, 20 Mio. Bewohner, ~2 000 km² | lückenlose Bebauung bis Horizont | P | Horizont-Bild von 20 zufälligen Türmen: bebaute Horizontpixel ≥ 90 %; Wiederholung ≤ 1 % | |
| 7 Tokio-Klasse | 5 Mio. Gebäude, 40 Mio. Bewohner, ~8 500 km² | jede Straße eigen | P | Durchquerung 100 km am Boden ohne Ladeschirm; 1 000 Straßenbilder aus 100 Zufallsposen, Wiederholung ≤ 1 %, P an jeder Pose (die Luftbild-Wahrheit misst L2.6) | |
| 8 Jenseits | 10 Mio. Gebäude, 100 Mio. Bewohner, ≥ 20 000 km², ≥ 1 % begehbar innen | Stadt als Landschaft, nie dieselbe Straße | P | 100 Zufallsposen in 50 km Umkreis: Wiederholung ≤ 0,1 %, jede betretene Tür führt in einen Raum, P an jeder Pose | |

### L2 · Stadtform-Wahrheit: liest sich die Stadt wie eine echte?
Misst, ob Zentrum, Rand, Viertel, Netz und Dichte den Gesetzen realer Städte folgen — am Bild und an der Statistik, über N zufällige Saaten. Die oberste Sprosse kehrt den Richter um: nicht „sieht aus wie", sondern „die Form verrät ihre Ursachen".

| Sprosse | Umfang | Tiefe | Preis | Richter | Stand |
|---|---|---|---|---|---|
| 1 Rang und Größe | Welt 32 × 32 km | Zipf ζ ≈ 1 | P am Hügel-Bild | Zipf-Fit über 8 Saaten, ζ ∈ [0,8; 1,2] | HEUTE (ζ 1,022 [0,956; 1,158], 8 Saaten, beide Geräte am Bild — die Spannweite nur 6–500 Häuser, gut zwei Dekaden) |
| 2 Kern und Rand | 1 Stadt | Kern geschlossen zur Straßenwand, Gewerbe am Rand, Raster ab 1800 | P | Anteil geschlossener Straßenwand im Straßenbild Kern vs. Rand ≥ 2:1 | Gesetz im Code (`fachwerk-core.js:4632` Kern-Verdichtung, Gewerbe-Hallen `:3693`), der Richter nie gefahren → nicht gehalten |
| 3 Viertel | Großstadt | Viertel fallen aus dem Bodenwert, nicht aus einer Typen-Liste | P | Blindtest: Betrachter ordnen 20 Straßenbilder Lage (Kern/Mitte/Rand) und Wohlstand (arm/reich) zu, Treffer ≥ 70 % | |
| 4 Dichtegradient und Höhe | Großstadt | Clark-Gradient, Höhe folgt Bodenwert, Turm im Kern, Slum am Hang | P | Dichte über Radius: exponentieller Fit R² ≥ 0,8; Höhen-Median Kern/Rand ≥ 5 | |
| 5 Netz-Statistik | 100 Saaten | Blockgröße, Knotengrad, Orientierungs-Entropie, Space-Syntax-Integration | P | Anteil der Saaten, deren 4 Netz-Kennzahlen im Band von 100 realen Städten (OSM) liegen ≥ 80 % | |
| 6 Luftbild-Wahrheit | 100 Saaten, je Größenklasse von L1 | Draufsicht wie Satellitenbild derselben Größe (bis Großraum Tokio) | P im Flug | Blindtest Luftbild Spiel vs. Satellit: Verwechslungsrate ≥ 40 % | |
| 7 Bodenblick-Wahrheit | jede Straße | Straßenbild wie Foto (Pflaster, Schilder, Abnutzung, Leben) | P | Blindtest Straßenbild vs. Street-View-Foto derselben Stadtklasse: Verwechslungsrate ≥ 40 % | |
| 8 Umkehr-Wahrheit | 100 Saaten | die Form trägt ihre Geschichte | P | Kenner lesen aus Luft- und Straßenbild Alter, Wohlstand, Klima und Gelände der Stadt; Treffer gegen die Saat-Parameter ≥ 70 % | |

### L3 · Vertikale Stadt: Ebenen und Höhe
Misst, wie viele begehbare Stadtschichten übereinander liegen und wie hoch die Stadt wächst — vom Erdgeschoss bis zur Stadt, die den Boden verlässt.

| Sprosse | Umfang | Tiefe | Preis | Richter | Stand |
|---|---|---|---|---|---|
| 1 Eine Ebene | Häuser bis 4 Geschosse, Turm-Typ 7 Geschosse | Haus begehbar bis Keller und Dachboden | P | höchstes Gebäude im Bild, begehbare Ebenen = 1 | HEUTE (`hochhaus` st:7, `fachwerk-core.js:1987`; Keller→Dachboden 1 von 8 Gängen ganz — die Tiefe trägt das Architektur-Blatt) |
| 2 Skyline | Türme 30 Geschosse | Turm-Fassaden aus der Ferne lesbar | P | höchstes Gebäude ≥ 100 m, Silhouette im Fernbild aus 5 km erkennbar | |
| 3 Supertall | Türme 100+ Geschosse, ≥ 400 m | Fernform hält ohne Flackern | P im Anflug | Anflug von 10 km bis zum Fuß: kein sichtbarer Formsprung im Bildpaar, Pixel-Unruhe bei ruhender Kamera ≤ 1 % | |
| 4 Zwei Ebenen | Brücken, Unterführungen, U-Bahn begehbar | Unterwelt beleuchtet und belebt | P | Spieler geht von Ebene −1 zu +1 ohne Ladeschirm; Bewohner auf beiden Ebenen im Bild | |
| 5 Dichte wie Kowloon | ≥ 5 begehbare Schichten, 1 Mio. Menschen/km² lokal | Gänge, Höfe, Licht von oben | P im Block | Bewohner je Hektar in einem gemessenen Block ≥ 10 000; Bildpaar gegen Kowloon-Fotos glaubhaft ≥ 60 % | |
| 6 Arkologie | eine Struktur ≥ 1 km hoch, ≥ 1 Mio. Bewohner | innen Straßen, Parks, Viertel | P innen | Durchgang Fuß → Dach ohne Ladeschirm; Bewohnerzahl der Struktur | |
| 7 Megastruktur | Stadtschalen über ≥ 100 km², Ebenen bis 10 km Höhe | Stadt über Stadt, eigenes Klima je Schicht | P | durchgehend begehbare Schichten ≥ 10, P an 100 zufälligen Posen | |
| 8 Bodenlos | Stadt vom Meeresboden bis in den Orbit (Turm, Lift, Ring) | jede Höhe bewohnt, Planet unter den Füßen sichtbar | P, Sprung ≤ 5 s | Fahrt Straße → Orbit ohne Ladeschirm; Bewohner auf ≥ 5 Höhen-Dekaden im Bild | |

### L4 · Breite: Kulturen, Epochen, fremde Städte aus einem Samen
Misst die KRAFT, Stadtformen aus Ursachen (Klima, Stoff, Technik, Macht, Körper der Bauenden) zu erzeugen — nicht die Zahl einzeln beschriebener Kulturen. Gemessen an N zufälligen Saaten und daran, dass man vom Bild auf die Ursache schließen kann.

| Sprosse | Umfang | Tiefe | Preis | Richter | Stand |
|---|---|---|---|---|---|
| 1 Eine Familie | 9 Epochen-Vorgaben, 6 Namens-Regionen, 32 Hausstile | Mitteleuropa trägt, der Rest färbt um | P | Blindtest: Region einer Stadt aus 6 erkannt ≥ 50 % | Material da (`fachwerk-core.js:3294-3312`, `:2012`), Blindtest nie gefahren → nicht gehalten |
| 2 Form aus Ursache | Netzformen (organisch, Raster, Radial, Wasser, Terrasse, Burg) fallen aus Gelände, Macht und Epoche | Netz und Hausform zusammen stimmig | P | 50 Saaten: Kenner nennen aus dem Netzbild die Ursache (Hang, Fluss, Planung, Wehr) ≥ 70 % | heute zwei Netzformen (organisch/Raster), beide gesetzt statt verursacht |
| 3 Die Erde | Kulturräume aller Kontinente aus Klima × Stoff × Technik | gegen Fotos realer Altstädte | P | Bildpaar gegen 20 Referenz-Altstädte glaubhaft ≥ 70 %; Klima-Zone aus dem Stadtbild geschätzt ≥ 60 % | |
| 4 Hundert | 100 Kultur × Epoche-Kombinationen (Uruk bis Gegenwart) | Bauweise folgt Klima, Stoff, Technik | P | 100 Saaten: plausibel ≥ 80 %, paarweise unterscheidbar ≥ 90 % | |
| 5 Zukunft | Städte 2100–3000 aus fortgeschriebenem Gesetz | nicht Kitsch, sondern Folge von Technik/Klima | P | Blindtest gegen Konzeptkunst: „stärker als Night City" in ≥ 50 % der Paare | |
| 6 Fremd | Städte nichtmenschlicher Arten (Körper, Sinne, Schwerkraft anders) | Form folgt dem Bauenden | P | 100 fremde Saaten: als „Stadt eines Wesens" erkannt ≥ 70 %, paarweise unterscheidbar ≥ 90 %, Körperbau der Bauenden aus der Stadt geschätzt ≥ 50 % | |
| 7 Unendlich | ≥ 10 000 unterscheidbare Stadtformen | jede plausibel | P | 10 000 Saaten: Cluster-Zahl über Netz- und Formkennzahlen ≥ 1 000, plausibel ≥ 80 % | |

### L5 · Wachstum über die Zeit
Misst die Zeitspanne, über die dieselbe Stadt am selben Ort sichtbar wächst, verfällt und überbaut wird, und wie der Spieler sie durchreist. Preis hier: jeder Zeitsprung ≤ 5 s bis zum Bild, P danach.

| Sprosse | Umfang | Tiefe | Preis | Richter | Stand |
|---|---|---|---|---|---|
| 1 Jahre als Parameter | 4 Jahre (1320/1560/1860/1935) | Kern bleibt ≥ 80 % im jüngeren | P, Sprung ≤ 5 s | Überdeckung je Slot ≥ 0,8 | HEUTE (0,915, headless — der Sprung im Spiel ungemessen) |
| 2 Wachstum in Spielzeit | Stunden Spielzeit | Dorf wächst aus Bewohnern | P | Häuserzahl über 1 500 s, alte Häuser ≥ 90 % erhalten, Bild vom Hügel | HEUTE (12 → 19/20 Häuser in 1 500 s, Radeon und GTX, alte 0,917) |
| 3 Jahrhunderte stufenlos | 600 Jahre, jedes Jahr wählbar | Abriss, Neubau, Brand, Erweiterung | P | Schieber über 600 Jahre: Bild je Jahr ≤ 2 s, kein Sprung > 5 % der Gebäude zwischen Nachbarjahren | |
| 4 Stadtgeschichte | 5 000 Jahre (Tell → Megastadt) | Schichten, Ruinen, Straßen überleben | P, Sprung ≤ 5 s | Anteil heutiger Straßen, die einer Trasse von vor 1 000 Jahren folgen, im Band realer Altstädte (≥ 30 %) | |
| 5 Leben und Tod | Städte entstehen, blühen, sterben, Ruinen werden Wald | Ursache sichtbar (Krieg, Fluss verlagert, Handel weg) | P | 100 Saaten × 5 000 Jahre: Städte mit Niedergang ≥ 10 %, Ruine im Bild erkannt ≥ 70 % | |
| 6 Tiefe Menschenzeit | 12 000 Jahre (Jungsteinzeit bis 3000) | jede Epoche plausibel | P | Blindtest Epochen-Zuordnung an 50 Bildern ≥ 60 % | |
| 7 Fremde Zeit | Zivilisationen über 1 Mio. Jahre auf fremden Planeten | Städte geologisch begraben und wieder ausgegraben | P, Sprung ≤ 5 s | Zeitreise 1 Mio. Jahre: Ruinen-Schichten im Querschnitt sichtbar | |

### L6 · Kopplung Ort ↔ Boden, Wasser, Katastrophe
Misst, ob Städte dort entstehen und so geformt sind, wie Boden, Wasser und Katastrophe es verlangen — und ob die Stadt selbst den Boden formt.

| Sprosse | Umfang | Tiefe | Preis | Richter | Stand |
|---|---|---|---|---|---|
| 1 Gassen am Hang | Dörfer, ≥ 4 Saaten | Gassen auf Höhenlinien | P | Gassen-Gefälle p95 ≤ 12 % vor dem Erdbau | HEUTE (7 Dörfer, 8,5–9,5 %, headless) |
| 2 Hangsiedlung | Dörfer und Städte an Steilhängen (Gefälle > 0,35) | Terrassen und Stützmauern wie gebaut, nicht planiert | P | Bildpaar Hangort gegen Referenz (Amalfi, Santorini, Bergdorf) glaubhaft ≥ 60 %; Erdbau-Median je Haus als Kosten-Zeile | Mechanik HEUTE (4 Hangdörfer, Erdbau-Median 451–801 m³, headless), Bild-Richter nie gefahren |
| 3 Standortwahl | Welt | Städte an Fluss, Küste, Furt, Pass | P | Anteil der Städte ≥ 10 000 Bewohner binnen 2 km von Fluss/Küste im Band der Erde über 8 Saaten | |
| 4 Wasserstadt | Häfen, Brücken, Kais, Kanäle | Hafenbecken, Brücke folgt Flussbreite | P | jede Stadt am Fluss trägt ≥ 1 Brücke, Hafenstädte ein Becken im Bild | |
| 5 Stadt formt Boden | Terrassen, Landgewinnung, Deiche | Küstenlinie verschiebt sich über Jahrhunderte | P | Zeitreise 500 Jahre: gewonnenes Land > 0, im Luftbild sichtbar | |
| 6 Kaskade | Vulkan/Flut/Beben formen Stadt | Pompeji, Neustadt auf Ruinen | P | Saaten mit Vulkan: Stadt begraben, Nachfolgestadt verlagert, Bildpaar vorher/nachher | |
| 7 Planetar | jede Stadt jedes Planeten aus Boden, Klima, Ressourcen | Kopplung über alle Perspektiven | P | 100 Planeten-Saaten: Lage der Städte aus der Karte von Boden/Wasser von Kennern vorhergesagt ≥ 70 % | |

### L7 · Siedlungsnetz: vom Tal bis zur Planetenstadt (neu)
Misst den Umfang ZWISCHEN den Städten: wie viele Siedlungen ein Planet trägt, ob ihre Hierarchie und ihr Netz wahr sind, und ob der Spieler jede erreichen kann. L1 misst die eine Stadt, L7 die Zivilisation.

| Sprosse | Umfang | Tiefe | Preis | Richter | Stand |
|---|---|---|---|---|---|
| 1 Region | 32 × 32 km, Weiler bis Kleinstadt | Rang-Größe-Gesetz | P | Stadt binnen 2 km in ≥ 6 von 8 Zufalls-Spawns, Bild vom Hügel | HEUTE (7/8 Saaten, Radeon und GTX; Größen-Wand 500 Häuser, `fachwerk-core.js:3354`, „metropole" = 220 Häuser, `:3352`) |
| 2 Land | 1 000 km, Weiler bis Großstadt, Straßen zwischen ihnen | zentrale Orte, Abstände nach Rang | P im Flug | Nachtbild aus 100 km Höhe gegen Nachtlicht-Satellitenbild eines realen Landes: Verwechslung ≥ 30 % | |
| 3 Kontinent | 10⁴ Städte, Zipf über 4 Dekaden | Handelswege, Hauptstädte, Grenzen | P, Landung ≤ 5 s | Zipf-Fit über 4 Dekaden ζ ∈ [0,8; 1,2]; Landung an 100 Zufallspunkten ≤ 5 s | |
| 4 Planet wie die Erde | 10⁶ Siedlungen, 8 Mrd. Bewohner | Nachtlicht folgt Küsten, Flüssen, Klima | P, Landung ≤ 5 s | Orbitbild bei Nacht gegen Black Marble: plausibel ≥ 70 %; jede Siedlung durch Landung erreichbar | |
| 5 Ökumenopolis | ganze Landfläche Stadt, ≥ 10¹¹ Bewohner | Viertel, Klimazonen, Epochen-Reste unter einer Haut | P | Abstieg Orbit → Straße ohne Ladeschirm; Horizont an 100 Zufallsposen ≥ 95 % bebaut, Wiederholung ≤ 0,1 % | |
| 6 Viele Welten | 100 Planeten-Saaten, jede mit eigenem Siedlungsmuster | Muster folgt Planet und Art | P | Orbitbilder der Siedlungsnetze paarweise unterscheidbar ≥ 90 %, plausibel ≥ 70 % | |

### L8 · Antwort: die Stadt reagiert auf Eingriff (neu)
Misst, ob die Stadt ein Gleichgewicht ist statt eines Bildes: ändert der Spieler oder ein Ereignis den Wert eines Orts, baut die Stadt sich sichtbar um — der dritte Mitspieler im Stadtmaßstab.

| Sprosse | Umfang | Tiefe | Preis | Richter | Stand |
|---|---|---|---|---|---|
| 1 Das Haus als Keim | ein Spielerhaus | wird Kern eines Rings | P | Ring neuer Häuser um das Spielerhaus binnen 1 500 s, Bild vom Hügel | HEUTE (Ring 8–9 neu, Median 22 m vom Haus, beide Geräte) |
| 2 Trasse zieht Stadt | eine Brücke oder Straße des Spielers | Bebauung folgt der neuen Erreichbarkeit | P | Bildpaar vorher/nachher: Gebäudedichte im 200-m-Gürtel der Trasse ≥ 2× gegen dieselbe Saat ohne Trasse | |
| 3 Wiederaufbau | ein zerstörtes Viertel | Neubau nach neuem Bodenwert, nicht als Kopie | P | Bildpaar: neues Viertel weicht vom alten ab (Netz-Kennzahlen), plausibel ≥ 70 % | |
| 4 Region antwortet | eine neue Stadt oder ein gesperrter Hafen | Nachbarstädte wachsen/schrumpfen, Leerstand sichtbar | P, Sprung ≤ 5 s | Zeitsprung 50 Jahre: Rang-Verschiebung der Nachbarn gegen Kontroll-Saat messbar, Leerstand im Straßenbild erkannt ≥ 70 % | |

## Stand heute

- **Größe:** Eine Stadt trägt höchstens 500 Häuser — `GROESSE_WAND = 500` (`fachwerk-core.js:3354`, nachgeprüft); die Klassen gehen bis `metropole: 220` Häuser (`fachwerk-core.js:3352`, nachgeprüft). Das Wort „Metropole" heißt heute 220 Häuser. Die Stadt des Worts misst 300 Häuser mit 1,08 Mio. Dreiecken am Marktplatz, die Test-Stadt 35 Häuser mit 118 Bewohnern (Messung 14.11.). Ein p95 ≤ 33 ms an der vollen Stadt ist nicht belegt, die E-Messorte fahren mit ruhendem Dorf-Zug (`MEISTERKARTE.md:874`) — darum steht L1 nach P bei Sprosse 1, nicht 2.
- **Welt:** Rang-Gesetz, Zipf ζ 1,022 [0,956; 1,158] über 8 Saaten (`MEISTERKARTE.md:865`, nachgeprüft) — Spannweite 6–500 Häuser, also gut zwei Dekaden; der Zipf der Erde reicht über sechs.
- **Form:** Straßengraph wächst als Triebe (`fachwerk-core.js:4309`); Raster für Antike und Städte ab 1800 (`:4418`); Kern-Verdichtung zur Straßenwand (`:4632`, nachgeprüft: Fuge wächst mit dem Radius ab Jahr 1700); Gewerbe-Hallen am Rand ab 1850 (`:3693`); zweite Parallelgasse je Block bildet Quartiere (`:4548`). Gesetz vorhanden, kein Richter gefahren (Existenz, nicht Konsum). Kein Viertel-Typ als Gesetz, kein Bodenwert, kein Dichtegradient gemessen.
- **Vertikal:** Höchster Typ `hochhaus` mit 7 Geschossen (`fachwerk-core.js:1987`, nachgeprüft); keine zweite Stadtebene, keine Brücken- oder Unterwelt-Ebene, keine Arkologie — Grep nach arkolog/megastruk/slum/bodenwert über Kerne und stamm/: 0 Treffer (nachgeprüft).
- **Breite:** 9 Epochen-Vorgaben, 6 Namens-Regionen, 32 Hausstile (`fachwerk-core.js:3294-3312`, `:2012`, nachgeprüft); die Stadtform selbst (Netz) kennt nur organisch vs. Raster, beide als Vorgabe nach Epoche, nicht aus Ursache.
- **Zeit:** Jahresringe Überdeckung 0,915; Wachstum aus Bewohnern 12 → 19/20 Häuser in 1 500 s auf beiden Geräten, das Spielerhaus wird Kern eines Rings (`MEISTERKARTE.md:867`, nachgeprüft).
- **Häuser im Bild:** lesen nach der Messung vom 14.11. als weiße Kästen mit Fenstern (Architektur-Blatt trägt das; hier zählt es als Tiefe von L2.7 = 0).
- **Summe:** gehalten L1.1, L2.1, L3.1, L5.1–2, L6.1, L7.1, L8.1 — acht von 55 Sprossen, alle auf der untersten oder zweituntersten Stufe ihrer Leiter.

## Abhängigkeiten

- **Architektur, Gebäude und Innenräume:** jede Sprosse von L1 ab 3 und L3 ab 2 braucht Gebäude, die aus 20 km und aus 2 m tragen (Fernform, Innenraum auf Abruf); der Wiederholungs-Richter von L1 ist dort die Varianz des Hauses.
- **Maßstab-Kontinuum** und **Licht, Bild und Horizont:** L1.6–8, L3.8, L7.2–5 (Horizont voll Stadt, Nachtlicht aus dem Orbit) sind ohne Fern-Darstellung ganzer Stadtflächen als Funktion nicht erreichbar.
- **Millionen: Bevölkerung, Masse und Strom:** die Bewohnerzahlen von L1, L3.5–6 und L7 leben dort; dieses Blatt zählt Wohnraum, jenes die Leiber.
- **Netze, Verkehr und Stadtstoffwechsel:** L2.5 (Netz-Statistik), L6.4, L7.2–3 und L8.2 teilen den Straßengraphen; Verkehr, Wasser, Strom, Müll gehören dorthin.
- **Planet und Geologie, Ozean und Wasser, Verwitterung/Erosion:** Voraussetzung von L6.3–7 und L7.4–6.
- **Menschenzeit: Epochen und Geschichte, Kultur, Arbeit und Handel, Macht und Konflikt:** liefern die Ursachen von L4, L5.4–6 und L8.3–4.
- **Spur, Verfall und Gedächtnis der Welt:** Ruinen und Schichten in L5.5–7.
- **Ankunft, Geräte und Zugang:** der Preis P jeder Sprosse.
- **Der Same: Architektur der Entfaltung:** die Stadt als Funktion (Same, Ort, Jahr) statt Sack ist der Prüfstein; L8 prüft, ob die Funktion auf einen geänderten Wert antwortet.

## Was die alte Karte hier misst

Kapitel 24 Siedlung (9/10, `MEISTERKARTE.md:851-874`):
- K1 Haus von innen (1/2) → gehört in Architektur; hier nur Tiefe von L3.1.
- K2 Stadt in Reichweite nach Rang und Größe (2/2) → L7.1 (Stadt binnen 2 km) und L2.1 (Zipf).
- K3 Gelände-Treue (2/2) → L6.1 und die Mechanik von L6.2.
- K4 Durch die Jahrhunderte (2/2) → L5.1, L5.2 und L8.1 (Spielerhaus als Kern).
- K5 Das erste Haus steht sofort (2/2) → Teil von P an L1.2 (erstes Haus ≤ 0,5 s bei nH 12 und 300: 62–305 ms).
- Kapitel 9 Menschen H1 „Die Stadt lebt: ≥ 200 Bewohner" (`MEISTERKARTE.md:152`) → Bewohner-Spalte von L1.2/L1.3.
- PFLICHT-OFFEN F (Prüfplatz: Silhouette der Stadt vom Platz, `MEISTERKARTE.md:55`) → Vorstufe des Skyline-Richters in L1.5.
Die alte 10/10 („ummauerte Stadt binnen 2 km", „egal ob 12 oder 300 Häuser") liegt hier bei 8 von 55 Sprossen: was sie Vollausbau nannte, ist ein Dorf in einem Tal.

## Zweifel

- Die Blindtest-Richter (L2.3, L2.6–8, L4, L5.6, L7.2–6) brauchen menschliche oder Modell-Betrachter; eine KI-Bildwertung als Ersatz ist ungeprüft und kann Kitsch belohnen. Die Umkehr-Richter (L2.8, L4.2–3, L4.6) sind härter zu fälschen, weil die Wahrheit in den Saat-Parametern steht.
- Der Wiederholungs-Richter von L1 braucht ein Maß „sichtbar gleich" (Bild-Ähnlichkeit von Fassaden-Ausschnitten); die Schwelle ist gesetzt, nicht geeicht.
- Die Sprossen über Tokio hinaus (100 Mio., Ökumenopolis 10¹¹) sind die Vision weitergedacht, nicht aus einer Referenz abgeleitet; ob ein Spieler 10 Mio. Gebäude von 1 Mio. unterscheiden kann, ist offen — darum messen L1.7–8 Wiederholung und Durchquerung statt der Zählung.
- Die Netz-Bänder realer Städte (L2.5) und der Fluss/Küsten-Anteil (L6.3) sind nicht recherchiert; vor dem ersten Lauf aus OSM und Städtedaten zu eichen.
- „Bestand wächst nicht mit dem Umfang" (P) ist streng: ein Gesetz für Arkologien kostet Bytes. Gemeint ist: kein Byte je Stadt, je Gebäude, je Epoche — Bytes je Gesetz sind erlaubt.
- Die Grenze zu Architektur (Gebäude-Tiefe), Millionen (Bewohner) und Netze (L7) ist geschnitten, aber L3 und L7 berühren beide stark.

## Gegenlese — was sich änderte und was strittig bleibt

- **Gehoben:** L3 bekam „Bodenlos" (Stadt bis Orbit), eine neue Leiter L7 Siedlungsnetz trägt die Planetenstadt (Ökumenopolis, viele Welten) — die alte Fassung endete bei einer einzigen 100-Mio.-Stadt, die Vision des Schöpfers spricht von Planeten. L2 endet nun bei der Umkehr-Wahrheit (die Form verrät ihre Ursachen) statt beim Fotovergleich.
- **Richter ersetzt:** L3.3 „L1/L0-Abweichung in px" (eine Technik) → Formsprung im Anflug-Bildpaar; L6.2 „Erdbau-Median ≤ 1 000 m³" (ein Weg) → Bildpaar Hangort gegen Referenz, Erdbau nur als Kosten-Zeile; L1 zählt keine Bau-Hashes mehr, sondern Wiederholung im Bild — Größe aus Kopie fällt durch.
- **Preis:** „dto./voller Preis" wurde zu P mit einer harten Definition (beide Geräte, im selben Lauf, Sprung ≤ 5 s, kein Byte je Stadt).
- **Stand berichtigt:** L1.2 ist nicht gehalten (P an der vollen Stadt nie gemessen) → L1 steht bei 1; L2.3 (Kern und Rand) war HEUTE ohne je gefahrenen Richter → nicht gehalten; L4.1 „HEUTE (unbelegt)" → nicht gehalten; dafür waren L2.1 (Zipf), L6.1, L7.1, L8.1 belegt und nicht markiert. Nachgeprüft im Code: GROESSE_WAND 500, metropole 220, hochhaus st:7, Kern-Verdichtung `:4632`, 0 Treffer für Arkologie/Bodenwert.
- **Doppelt:** alt L2.1 und L6.1 (Gassen ≤ 12 %) waren dieselbe Sprosse → eine; alt L1.7 (Luftbild Tokio) und L2.7 (Luftbild-Wahrheit) → L2.6.
- **Fleiß → Kraft:** L4 zählte Kulturen-Listen (6, 20 Stadtkulturen mit Namen); jetzt misst sie, ob die Form aus Ursachen fällt und vom Bild auf die Ursache geschlossen wird.
- **Neu:** L8 Antwort (Stadt als Gleichgewicht, das auf Eingriff reagiert).
- **Strittig:** L8.3–4 berührt L5.5 und L6.6 (Niedergang, Kaskade) — Ursache-Ereignis gegen Statistik geschnitten, aber dünn; die Bewohnerzahlen in L1 könnten ganz in „Millionen" wandern; die Wiederholungs-Schwellen sind ungeeicht.
